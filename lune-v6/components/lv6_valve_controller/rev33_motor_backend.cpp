#include "rev33_motor_backend.h"

#include "esphome/core/log.h"

namespace lv6 {

static const char *const TAG = "hv6_rev33_motor";

bool Rev33MotorBackend::setup() {
  // Rev 3.2's LATCH_ARM pin is Rev 3.3's DRIVER_N_SLEEP — the same GPIO17 with a
  // different job. Configure it here as a plain output and never let the base
  // class's arm machinery near it.
  gpio_reset_pin(pins33_.driver_nsleep);
  gpio_reset_pin(pins33_.motor_enable);
  gpio_reset_pin(pins33_.latch_state);      // FAULT_N_RAW on this revision
  gpio_reset_pin(pins33_.rail_overcurrent);
  gpio_reset_pin(pins33_.fault_usb);

  const uint64_t output_mask = (1ULL << pins33_.address0) |
                               (1ULL << pins33_.address1) |
                               (1ULL << pins33_.address2) |
                               (1ULL << pins33_.address3) |
                               (1ULL << pins33_.motor_enable) |
                               (1ULL << pins33_.driver_nsleep);
  gpio_config_t outputs = {};
  outputs.pin_bit_mask = output_mask;
  // INPUT_OUTPUT so gpio_get_level() reads the pad rather than the output latch;
  // a pure output reads back 0 whatever it is driving.
  outputs.mode = GPIO_MODE_INPUT_OUTPUT;
  outputs.pull_up_en = GPIO_PULLUP_DISABLE;
  outputs.pull_down_en = GPIO_PULLDOWN_ENABLE;
  if (gpio_config(&outputs) != ESP_OK) {
    ESP_LOGE(TAG, "output GPIO config failed; motors stay inhibited");
    return false;
  }

  // Safe state first, before anything can select a bridge: no drive permit, no
  // decoder enable, address 0 — which reaches no bridge input at all.
  gpio_set_level(pins33_.driver_nsleep, 0);
  gpio_set_level(pins33_.motor_enable, 0);
  gpio_set_level(pins33_.address0, 0);
  gpio_set_level(pins33_.address1, 0);
  gpio_set_level(pins33_.address2, 0);
  gpio_set_level(pins33_.address3, 0);

  // The three fault nets are open-drain with their own 10k pull-ups to
  // 3V3_LOGIC and a 1 nF at the module end, so no internal pull is wanted.
  gpio_config_t faults = {};
  faults.pin_bit_mask = (1ULL << pins33_.latch_state) |
                        (1ULL << pins33_.rail_overcurrent) |
                        (1ULL << pins33_.fault_usb);
  faults.mode = GPIO_MODE_INPUT;
  faults.pull_up_en = GPIO_PULLUP_DISABLE;
  faults.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&faults) != ESP_OK) {
    ESP_LOGE(TAG, "fault-input GPIO config failed; motors stay inhibited");
    return false;
  }

  // A missing PCNT unit must not inhibit the drive path: it costs the motion
  // evidence, not the ability to stop.
  if (!configure_tacho_())
    ESP_LOGE(TAG, "COMM_TACHO_N PCNT unavailable; drive still enabled");

  ready_ = true;
  ESP_LOGI(TAG,
           "rev33_gpio ready: DRIVER_N_SLEEP GPIO%d, FAULT_N_RAW GPIO%d, "
           "RAIL_OVERCURRENT GPIO%d, FAULT_USB_RAW GPIO%d — all three faults "
           "ACTIVE LOW. No fault latch on this revision.",
           static_cast<int>(pins33_.driver_nsleep),
           static_cast<int>(pins33_.latch_state),
           static_cast<int>(pins33_.rail_overcurrent),
           static_cast<int>(pins33_.fault_usb));
  return true;
}

int Rev33MotorBackend::fault_raw_level() const {
  return gpio_get_level(pins33_.latch_state);
}
int Rev33MotorBackend::rail_overcurrent_level() const {
  return gpio_get_level(pins33_.rail_overcurrent);
}
int Rev33MotorBackend::fault_usb_level() const {
  return gpio_get_level(pins33_.fault_usb);
}
int Rev33MotorBackend::driver_nsleep_level() const {
  return gpio_get_level(pins33_.driver_nsleep);
}

bool Rev33MotorBackend::fault_latched() const {
  // The controller asks "may I keep driving?". On this revision that is any of
  // the three nets, not just FAULT_N_RAW. Attribution stays on the per-net
  // accessors. ACTIVE LOW, and this is the inverse of Rev 3.2: getting the
  // sense backwards reports "no fault" exactly when a driver has failed.
  return any_fault();
}

bool Rev33MotorBackend::any_fault() const {
  return gpio_get_level(pins33_.latch_state) == 0 ||
         gpio_get_level(pins33_.rail_overcurrent) == 0 ||
         gpio_get_level(pins33_.fault_usb) == 0;
}

void Rev33MotorBackend::poll_motion(uint32_t now_ms, bool drive_active) {
  Rev32MotorBackend::poll_motion(now_ms, drive_active);
  // The latch used to drop the permit in hardware. Firmware owns DRIVER_N_SLEEP
  // now, so a fault net that asserts mid-move has to put the bridges back to
  // sleep here — coasting MOTOR_ENABLE alone leaves them awake.
  if (any_fault())
    set_drive_permit(false);
}

void Rev33MotorBackend::set_drive_permit(bool permitted) {
  gpio_set_level(pins33_.driver_nsleep, permitted ? 1 : 0);
  if (!permitted)
    selection_.coast();
}

bool Rev33MotorBackend::arm_latch() {
  // There is nothing to arm. The controller calls this to ask "may I drive?",
  // so answer that: assert the permit, let the bridges wake, and report whether
  // the fault nets are clear.
  if (!ready_)
    return false;

  coast();
  set_drive_permit(true);
  // DRV8411 nSLEEP wake time is well under a millisecond; give it one so a
  // driver that comes up faulted has asserted nFAULT before we look.
  delay_ms_(1);

  const int raw = gpio_get_level(pins33_.latch_state);
  const int rail = gpio_get_level(pins33_.rail_overcurrent);
  const int usb = gpio_get_level(pins33_.fault_usb);
  if (raw == 0 || rail == 0 || usb == 0) {
    set_drive_permit(false);
    ESP_LOGE(TAG,
             "Drive permit refused: FAULT_N_RAW=%d RAIL_OVERCURRENT=%d "
             "FAULT_USB_RAW=%d (0 = asserted). A bridge fault, the 150 mA rail "
             "comparator, or the USB switch current-limiting — the three nets "
             "are separate so this is attributable, unlike Rev 3.2.",
             raw, rail, usb);
    return false;
  }
  // selection_.arm() takes "is the fault line asserted", not "is it high".
  return selection_.arm(false);
}

void Rev33MotorBackend::assert_arm_high() {
  // GPIO17 is DRIVER_N_SLEEP on this revision. Forcing it high here would wake
  // the bridges without going through arm_latch()'s fault check.
  ESP_LOGW(TAG, "LATCH_ARM force-high ignored: GPIO17 is DRIVER_N_SLEEP on Rev 3.3");
}

Rev32MotorBackend::ArmClockProbe Rev33MotorBackend::probe_arm_clock(uint32_t,
                                                                   uint32_t,
                                                                   bool) {
  ESP_LOGW(TAG, "ARM_CLK probe refused: Rev 3.3 has no fault latch");
  return {};
}

}  // namespace lv6
