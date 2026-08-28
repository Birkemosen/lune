#pragma once

#include <cstdint>

namespace lv6 {

// Common surface of the discrete-GPIO motor backends (Rev 3.1 and Rev 3.2).
// The DRV8215 I2C path is not a member: it has no decoder, no fault latch and
// no shared ADC, so forcing it through this interface would only add branches.
//
// What both revisions share is the safety ordering, and that is what this
// interface exists to make uniform: an address may only change from coast, a
// drive may only follow a successful arm, and a latched fault stops the move
// regardless of what the controller wanted.
class GpioMotorBackend {
 public:
  virtual ~GpioMotorBackend() = default;

  virtual bool setup() = 0;

  // Arm the hardware fault latch.  Refused unless the bridge is coasting, and
  // returns false when the raw fault is still asserted - firmware can neither
  // assert nor clear a hardware fault, so a failed arm is the only fault
  // evidence available.
  virtual bool arm_latch() = 0;

  // `reverse` is the hardware sense, not the application sense.  The caller
  // maps MotorDirection onto it.
  virtual bool select_zone(uint8_t zone, bool reverse) = 0;
  virtual bool drive() = 0;
  virtual void coast() = 0;
  virtual bool fault_latched() const = 0;

  virtual float read_current_ma() = 0;

  // Motion evidence, however the revision obtains it: BEMF differential across
  // a coast interruption on Rev 3.1, qualified commutation edges on Rev 3.2.
  virtual void reset_motion() = 0;
  virtual uint32_t motion_evidence_count() const = 0;
  virtual bool motion_observed() const = 0;
  virtual bool motion_stopped_for(uint32_t now_ms, uint32_t debounce_ms) const = 0;

  // Called once per FSM tick while a move is in progress, with the elapsed
  // drive time.  Rev 3.1 overrides it to nothing (its BEMF sampling is driven
  // on a slower period by the controller); Rev 3.2 drains the hardware
  // commutation counter here.
  virtual void poll_motion(uint32_t now_ms, bool drive_active) {}

  // Identifier used in logs and in dump_config().
  virtual const char *backend_name() const = 0;
};

}  // namespace lv6
