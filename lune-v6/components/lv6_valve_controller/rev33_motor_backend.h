#pragma once

#include "gpio_motor_backend.h"
#include "rev33_logic.h"

#include "driver/gpio.h"
#include "driver/pulse_cnt.h"

#include <cstdint>

namespace lv6 {

// Rev 3.3 pin map, from the `gpio` map in
// hardware/lune-v6-rev3.3/design-contract.json. Nothing here may be changed
// without changing the contract; `check_design.py` asserts the contract against
// the schematic, and the YAML entrypoint asserts the contract against these.
struct Rev33PinConfig {
  gpio_num_t adc_current{GPIO_NUM_2};
  gpio_num_t adc_tacho{GPIO_NUM_1};
  gpio_num_t comm_tacho{GPIO_NUM_38};
  gpio_num_t address0{GPIO_NUM_12};
  gpio_num_t address1{GPIO_NUM_11};
  gpio_num_t address2{GPIO_NUM_14};
  gpio_num_t address3{GPIO_NUM_13};
  /// Per-move decoder gate. High releases the 74HC4514 inhibit.
  gpio_num_t motor_enable{GPIO_NUM_18};
  /// FAULT_N_RAW: wired-AND of the three DRV8411 nFAULT outputs, active LOW.
  gpio_num_t fault_raw{GPIO_NUM_16};
  /// The drive permit. High wakes the bridges and un-inhibits the decoder.
  gpio_num_t driver_nsleep{GPIO_NUM_17};
  /// U3's rail overcurrent comparator, active LOW, trips at 150 mA nominal
  /// (142-158 worst case) per design-contract ECO rev3.3-P.
  gpio_num_t rail_overcurrent{GPIO_NUM_48};
  /// U24 (TPS2553) fault, active LOW. Readable only during the current-limiting
  /// window before latch-off; a completed latch-off kills the ESP32 too (O6).
  gpio_num_t fault_usb{GPIO_NUM_15};
};

struct Rev33TachoConfig {
  uint16_t min_pulse_us{200};
  uint32_t min_period_us{8000};    // 125 Hz, well above the 20-40 Hz band
  uint32_t max_period_us{200000};  // 5 Hz
};

// Low-level owner of the Rev 3.3 GPIO decoder, the firmware-held drive permit,
// the three fault nets, the two ADC1 channels and the commutation counter.
//
// What matters for safety, and is dangerous to get wrong:
//
//   1. All four address lines are plain address bits.  The channel/direction
//      pair maps to a decoder output through `rev33_logic.h`'s twelve-entry
//      table, never through a formula.
//   2. The drive permit is firmware's to hold. `DRIVER_N_SLEEP` wakes the
//      bridges and, through U7's NAND with MOTOR_ENABLE, releases the decoder
//      inhibit. R31 holds it low, so a GPIO in high-Z puts the drivers to sleep
//      and inhibits every decoder output.
//   3. Every fault net is ACTIVE LOW: FAULT_N_RAW (any DRV8411 bridge),
//      RAIL_OVERCURRENT and FAULT_USB_RAW, each on its own net with its own
//      pull-up, so a refusal is attributable to bridge, rail or USB switch.
//      Reading one as active high reports "no fault" precisely when a driver
//      has failed.
//   4. Motion evidence is the hardware commutation count on `COMM_TACHO_N`,
//      which is an *enhancement*: it can report brush chatter against a hard
//      stop as rotation, so nothing may depend on it alone.  See
//      `commutation_tacho.cannot_distinguish`.
//
// There is no hardware fault latch. The hazard assessment behind that, and what
// it gives up, is design-review R3.3-3. Read it before changing anything here.
class Rev33MotorBackend : public GpioMotorBackend {
 public:
  explicit Rev33MotorBackend(const Rev33PinConfig &pins,
                             const Rev33TachoConfig &tacho = {})
      : pins_(pins),
        tacho_cfg_(tacho),
        tacho_(tacho.min_pulse_us, tacho.min_period_us, tacho.max_period_us) {}

  bool setup() override;
  /// No latch to arm. Asserts the drive permit and reports whether the fault
  /// nets are clear, which is what the controller actually wants to know.
  bool arm_latch() override;

  // Holds one decoder address with MOTOR_ENABLE low so the 74HC4514 outputs can
  // be probed with a meter. This is the only way to verify the twelve-entry
  // channel/direction map against the hardware while the drive permit is off,
  // and a wrong entry means the wrong motor or the wrong direction.
  struct DecoderProbe {
    bool accepted{false};
    uint8_t zone{0};
    bool reverse{false};
    uint8_t decoder_address{0};
    int a0{-1};
    int a1{-1};
    int a2{-1};
    int a3{-1};
    int motor_enable{-1};
  };
  DecoderProbe probe_decoder(uint8_t zone, bool reverse, uint32_t hold_ms);
  int motor_enable_level() const;
  bool select_zone(uint8_t zone, bool reverse) override {
    return select(zone, reverse ? Rev33Direction::REVERSE : Rev33Direction::FORWARD);
  }
  bool select(uint8_t index, Rev33Direction direction);
  bool drive() override;
  void coast() override;
  /// True while any of the three active-LOW fault nets is asserted. The
  /// controller uses this to decide whether it may keep driving; attribution
  /// is the per-net level accessors below.
  bool fault_latched() const override;
  void set_drive_permit(bool permitted) override;
  const char *backend_name() const override { return "rev33_gpio"; }

  // ADC1 is owned by the controller's continuous (DMA) driver — the oneshot and
  // continuous drivers cannot share a unit — so the backend is told the current
  // rather than reading it. See Lv6ValveController::run_ripple_task_().
  void publish_current_ma(float ma) { current_ma_ = ma; }
  float read_current_ma() override { return current_ma_; }

  void reset_motion() override;
  uint32_t motion_evidence_count() const override { return tacho_.count(); }
  bool motion_observed() const override { return tacho_.any_edges(); }
  bool motion_stopped_for(uint32_t now_ms, uint32_t debounce_ms) const override {
    return tacho_.plateau_for(now_ms, debounce_ms);
  }
  void poll_motion(uint32_t now_ms, bool drive_active) override;

  // Diagnostics and the qualification instrument.
  uint8_t decoder_address() const { return selection_.decoder_address(); }
  bool armed() const { return selection_.armed; }
  uint32_t tacho_rejected() const { return tacho_.rejected(); }
  uint32_t tacho_period_us() const { return tacho_.last_period_us(); }
  uint32_t tacho_hardware_count() const { return last_hardware_count_; }
  bool tacho_blanked(uint32_t now_ms) const { return tacho_.blanked(now_ms); }
  uint32_t tacho_cadence_us() const { return tacho_.cadence_us(); }
  uint16_t tacho_stretch_x10(uint32_t now_ms) const { return tacho_.stretch_x10(now_ms); }

  // Silence-to-stall debounce, scaled to the cadence this motor is actually
  // turning at rather than sized for the slowest case.
  uint32_t stall_debounce_ms(uint16_t factor_x10, uint32_t floor_ms,
                             uint32_t ceiling_ms) const {
    return tacho_.adaptive_plateau_ms(factor_x10, floor_ms, ceiling_ms);
  }

  const Rev33TachoConfig &tacho_config() const { return tacho_cfg_; }

  /// Live levels for diagnostics. All three fault nets are active low, so 0
  /// means asserted.
  int fault_raw_level() const;
  int rail_overcurrent_level() const;
  int fault_usb_level() const;
  int driver_nsleep_level() const;

  /// True while any fault source is asserting. Attribution is the point of the
  /// three separate nets, so callers that need it should read the levels.
  bool any_fault() const;

 protected:
  // PCNT's glitch filter counts APB cycles into a 10-bit field, so 12 us is the
  // hardware ceiling.  It removes the sharpest chopper spikes; the 200 us
  // minimum-width rejection the contract asks for is not reachable in hardware
  // on this path and is left to the analog band-pass plus the implied-cadence
  // check in `Rev33TachoQualifier::observe_count`.
  static constexpr uint32_t PCNT_GLITCH_NS = 12000;
  static constexpr int PCNT_HIGH_LIMIT = 10000;

  bool configure_tacho_();
  void write_address_();
  void delay_us_(uint32_t microseconds) const;
  void delay_ms_(uint32_t milliseconds) const;

  Rev33PinConfig pins_;
  Rev33TachoConfig tacho_cfg_;
  Rev33DecoderSelection selection_{};
  Rev33TachoQualifier tacho_;

  float current_ma_{0.0f};

  pcnt_unit_handle_t pcnt_unit_{nullptr};
  pcnt_channel_handle_t pcnt_channel_{nullptr};
  uint32_t last_hardware_count_{0};

  bool ready_{false};
};

}  // namespace lv6
