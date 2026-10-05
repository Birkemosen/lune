#pragma once

#include "rev32_motor_backend.h"

namespace lv6 {

// Rev 3.3 pin map, from the `gpio` map in
// hardware/lune-v6-rev3.3/design-contract.json.
//
// The decoder, the address bus, MOTOR_ENABLE, the ADC channels and the
// commutation counter are unchanged from Rev 3.2, so this inherits all of it.
// What changed is the safety path, and every one of the three changes is
// dangerous to get wrong:
//
//   1. `latch_arm` no longer exists. There is no flip-flop to clock, so there
//      is no per-move arming and no LATCH_ARM pulse.
//   2. `latch_state` (GPIO16) became `FAULT_N_RAW` and **inverted**. Rev 3.2
//      read it active HIGH — "high means faulted or not armed". Rev 3.3 reads
//      it active LOW: low means one of the three DRV8411 bridges has asserted
//      nFAULT. Carrying the old sense forward reports "no fault" precisely when
//      a driver has failed.
//   3. The drive permit is now firmware's to hold. `DRIVER_N_SLEEP` wakes the
//      bridges and, through U7's NAND with MOTOR_ENABLE, releases the decoder
//      inhibit. R31 holds it low, so a GPIO in high-Z puts the drivers to sleep
//      and inhibits every decoder output — the failsafe the latch's Q used to
//      define.
//
// Two further fault inputs come with it, both active LOW, each on its own net
// with its own pull-up. Together with FAULT_N_RAW they give the attribution the
// Rev 3.2 wired-AND could not: bridge, rail, or USB switch.
//
// The hazard assessment behind removing the latch — and what it gives up — is
// design-review R3.3-3. Read it before changing anything here.
struct Rev33PinConfig : Rev32PinConfig {
  /// The drive permit. High wakes the bridges and un-inhibits the decoder.
  gpio_num_t driver_nsleep{GPIO_NUM_17};
  /// U3's rail overcurrent comparator, active LOW, trips at 150 mA nominal
  /// (142-158 worst case) per design-contract ECO rev3.3-P.
  gpio_num_t rail_overcurrent{GPIO_NUM_48};
  /// U24 (TPS2553) fault, active LOW. Readable only during the current-limiting
  /// window before latch-off; a completed latch-off kills the ESP32 too (O6).
  gpio_num_t fault_usb{GPIO_NUM_15};
};

class Rev33MotorBackend : public Rev32MotorBackend {
 public:
  explicit Rev33MotorBackend(const Rev33PinConfig &pins,
                             const Rev32TachoConfig &tacho = {})
      : Rev32MotorBackend(pins, tacho), pins33_(pins) {}

  bool setup() override;
  /// No latch to arm. Asserts the drive permit and reports whether the fault
  /// nets are clear, which is what the controller actually wants to know.
  bool arm_latch() override;
  /// True while any of the three active-LOW fault nets is asserted. The
  /// controller uses this to decide whether it may keep driving; attribution
  /// is the per-net level accessors below.
  bool fault_latched() const override;
  void poll_motion(uint32_t now_ms, bool drive_active) override;
  void set_drive_permit(bool permitted) override;
  void assert_arm_high() override;
  ArmClockProbe probe_arm_clock(uint32_t hz, uint32_t duration_ms,
                               bool clamp = false) override;
  const char *backend_name() const override { return "rev33_gpio"; }

  /// Live levels for diagnostics. All three are active low, so 0 means asserted.
  int fault_raw_level() const;
  int rail_overcurrent_level() const;
  int fault_usb_level() const;
  int driver_nsleep_level() const;

  /// True while any fault source is asserting. Attribution is the point of the
  /// three separate nets, so callers that need it should read the levels.
  bool any_fault() const;

 private:
  Rev33PinConfig pins33_;
};

}  // namespace lv6
