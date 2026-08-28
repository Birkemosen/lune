#pragma once

#include "gpio_motor_backend.h"
#include "rev32_logic.h"

#include "driver/gpio.h"
#include "driver/pulse_cnt.h"

#include <cstdint>

namespace lv6 {

// Defaults are the `gpio` map in hardware/lune-v6-rev3.2/design-contract.json.
// Nothing here may be changed without changing the contract; `check_design.py`
// asserts the contract against the schematic, and the YAML entrypoint asserts
// the contract against these.
struct Rev32PinConfig {
  gpio_num_t adc_current{GPIO_NUM_2};
  gpio_num_t adc_tacho{GPIO_NUM_1};
  gpio_num_t comm_tacho{GPIO_NUM_38};
  gpio_num_t address0{GPIO_NUM_12};
  gpio_num_t address1{GPIO_NUM_11};
  gpio_num_t address2{GPIO_NUM_14};
  gpio_num_t address3{GPIO_NUM_13};
  gpio_num_t motor_enable{GPIO_NUM_18};
  gpio_num_t latch_arm{GPIO_NUM_17};
  gpio_num_t latch_state{GPIO_NUM_16};
};

struct Rev32TachoConfig {
  uint16_t min_pulse_us{200};
  uint32_t min_period_us{8000};    // 125 Hz, well above the 20-40 Hz band
  uint32_t max_period_us{200000};  // 5 Hz
};

// Low-level owner of the Rev 3.2 GPIO decoder, edge-coupled fault latch, the
// two ADC1 channels and the commutation counter.
//
// Three things differ from Rev 3.1 and all three are safety-relevant:
//
//   1. All four address lines are plain address bits.  The channel/direction
//      pair maps to a decoder output through `rev32_logic.h`'s twelve-entry
//      table, never through a formula.
//   2. `LATCH_ARM` is edge-coupled and clamped while `MOTOR_ENABLE` is high, so
//      an arm issued on a live bridge does nothing at all.  Arming is refused
//      unless coasting, and the coupling network needs ~5.5 ms at the low level
//      on either side of the pulse.
//   3. There is no BEMF mux and no coast interruption.  Motion evidence is the
//      hardware commutation count on `COMM_TACHO_N`, which is an *enhancement*:
//      it can report brush chatter against a hard stop as rotation, so nothing
//      may depend on it alone.  See `commutation_tacho.cannot_distinguish`.
class Rev32MotorBackend : public GpioMotorBackend {
 public:
  explicit Rev32MotorBackend(const Rev32PinConfig &pins,
                             const Rev32TachoConfig &tacho = {})
      : pins_(pins),
        tacho_cfg_(tacho),
        tacho_(tacho.min_pulse_us, tacho.min_period_us, tacho.max_period_us) {}

  bool setup() override;
  bool arm_latch() override;
  bool select_zone(uint8_t zone, bool reverse) override {
    return select(zone, reverse ? Rev32Direction::REVERSE : Rev32Direction::FORWARD);
  }
  bool select(uint8_t index, Rev32Direction direction);
  bool drive() override;
  void coast() override;
  bool fault_latched() const override;
  const char *backend_name() const override { return "rev32_gpio"; }

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

  // Rev 3.2 specifics, for diagnostics and the qualification instrument.
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

  const Rev32TachoConfig &tacho_config() const { return tacho_cfg_; }

 private:
  // 110 kOhm x 10 nF = 1.1 ms; five time constants either side of the arm edge.
  static constexpr uint32_t ARM_SETTLE_MS = 6;
  static constexpr uint32_t ARM_PULSE_US = 500;
  // PCNT's glitch filter counts APB cycles into a 10-bit field, so 12 us is the
  // hardware ceiling.  It removes the sharpest chopper spikes; the 200 us
  // minimum-width rejection the contract asks for is not reachable in hardware
  // on this path and is left to the analog band-pass plus the implied-cadence
  // check in `Rev32TachoQualifier::observe_count`.
  static constexpr uint32_t PCNT_GLITCH_NS = 12000;
  static constexpr int PCNT_HIGH_LIMIT = 10000;

  bool configure_tacho_();
  void write_address_();
  void delay_us_(uint32_t microseconds) const;
  void delay_ms_(uint32_t milliseconds) const;

  Rev32PinConfig pins_;
  Rev32TachoConfig tacho_cfg_;
  Rev32DecoderSelection selection_{};
  Rev32TachoQualifier tacho_;

  float current_ma_{0.0f};

  pcnt_unit_handle_t pcnt_unit_{nullptr};
  pcnt_channel_handle_t pcnt_channel_{nullptr};
  uint32_t last_hardware_count_{0};

  bool ready_{false};
};

}  // namespace lv6
