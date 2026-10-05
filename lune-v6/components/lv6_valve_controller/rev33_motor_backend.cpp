#include "rev33_motor_backend.h"

#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include "esp_rom_sys.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include <inttypes.h>

namespace lv6 {

static const char *const TAG = "lv6_rev33_motor";

void Rev33MotorBackend::delay_us_(uint32_t microseconds) const {
  esp_rom_delay_us(microseconds);
}

void Rev33MotorBackend::delay_ms_(uint32_t milliseconds) const {
  // ESPHome pins CONFIG_FREERTOS_HZ at 1000, so a millisecond is a tick.  The
  // floor of one tick keeps this honest if that ever changes.
  TickType_t ticks = pdMS_TO_TICKS(milliseconds);
  vTaskDelay(ticks == 0 ? 1 : ticks);
}

bool Rev33MotorBackend::configure_tacho_() {
  pcnt_unit_config_t unit_cfg = {};
  unit_cfg.low_limit = -1;
  unit_cfg.high_limit = PCNT_HIGH_LIMIT;
  // A full stroke is 659-1048 commutations, so the 16-bit counter would not
  // wrap on its own; accumulating on the watch point makes that independent of
  // how long a learning move runs.
  unit_cfg.flags.accum_count = 1;
  if (pcnt_new_unit(&unit_cfg, &pcnt_unit_) != ESP_OK) {
    ESP_LOGE(TAG, "PCNT unit for COMM_TACHO_N unavailable");
    return false;
  }

  pcnt_glitch_filter_config_t filter_cfg = {};
  filter_cfg.max_glitch_ns = PCNT_GLITCH_NS;
  if (pcnt_unit_set_glitch_filter(pcnt_unit_, &filter_cfg) != ESP_OK)
    return false;

  pcnt_chan_config_t chan_cfg = {};
  chan_cfg.edge_gpio_num = static_cast<int>(pins_.comm_tacho);
  chan_cfg.level_gpio_num = -1;
  if (pcnt_new_channel(pcnt_unit_, &chan_cfg, &pcnt_channel_) != ESP_OK)
    return false;

  // COMM_TACHO_N is open-collector with a pull-up to 3V3_LOGIC, so a
  // commutation event is a falling edge.  Counting one edge per event keeps
  // the count directly comparable to the measured 659/1048 stroke figures.
  if (pcnt_channel_set_edge_action(pcnt_channel_,
                                   PCNT_CHANNEL_EDGE_ACTION_HOLD,
                                   PCNT_CHANNEL_EDGE_ACTION_INCREASE) != ESP_OK)
    return false;

  if (pcnt_unit_add_watch_point(pcnt_unit_, PCNT_HIGH_LIMIT) != ESP_OK ||
      pcnt_unit_enable(pcnt_unit_) != ESP_OK ||
      pcnt_unit_clear_count(pcnt_unit_) != ESP_OK ||
      pcnt_unit_start(pcnt_unit_) != ESP_OK)
    return false;

  return true;
}

bool Rev33MotorBackend::setup() {
  gpio_reset_pin(pins_.driver_nsleep);
  gpio_reset_pin(pins_.motor_enable);
  gpio_reset_pin(pins_.fault_raw);
  gpio_reset_pin(pins_.rail_overcurrent);
  gpio_reset_pin(pins_.fault_usb);

  const uint64_t output_mask = (1ULL << pins_.address0) |
                               (1ULL << pins_.address1) |
                               (1ULL << pins_.address2) |
                               (1ULL << pins_.address3) |
                               (1ULL << pins_.motor_enable) |
                               (1ULL << pins_.driver_nsleep);
  gpio_config_t outputs = {};
  outputs.pin_bit_mask = output_mask;
  // INPUT_OUTPUT so gpio_get_level() reads the pad rather than the output latch;
  // a pure output reads back 0 whatever it is driving, so the decoder-address
  // readback in the diagnostics and in probe_decoder() would report 0000.
  outputs.mode = GPIO_MODE_INPUT_OUTPUT;
  outputs.pull_up_en = GPIO_PULLUP_DISABLE;
  outputs.pull_down_en = GPIO_PULLDOWN_ENABLE;
  if (gpio_config(&outputs) != ESP_OK) {
    ESP_LOGE(TAG, "output GPIO config failed; motors stay inhibited");
    return false;
  }

  // Safe state first, before anything can select a bridge: no drive permit, no
  // decoder enable, address 0 — which reaches no bridge input at all.
  gpio_set_level(pins_.driver_nsleep, 0);
  gpio_set_level(pins_.motor_enable, 0);
  gpio_set_level(pins_.address0, 0);
  gpio_set_level(pins_.address1, 0);
  gpio_set_level(pins_.address2, 0);
  gpio_set_level(pins_.address3, 0);

  // The three fault nets are open-drain with their own 10k pull-ups to
  // 3V3_LOGIC and a 1 nF at the module end, so no internal pull is wanted.
  gpio_config_t faults = {};
  faults.pin_bit_mask = (1ULL << pins_.fault_raw) |
                        (1ULL << pins_.rail_overcurrent) |
                        (1ULL << pins_.fault_usb);
  faults.mode = GPIO_MODE_INPUT;
  faults.pull_up_en = GPIO_PULLUP_DISABLE;
  faults.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&faults) != ESP_OK) {
    ESP_LOGE(TAG, "fault-input GPIO config failed; motors stay inhibited");
    return false;
  }

  // ADC1 belongs to the controller's continuous driver; the backend only owns
  // the decoder, the permit, the fault nets and the commutation counter. A
  // missing PCNT unit must not inhibit the drive path: it costs the motion
  // evidence, not the ability to stop.
  if (!configure_tacho_())
    ESP_LOGE(TAG, "COMM_TACHO_N PCNT unavailable; drive still enabled");

  ready_ = true;
  ESP_LOGI(TAG,
           "rev33_gpio ready: DRIVER_N_SLEEP GPIO%d, FAULT_N_RAW GPIO%d, "
           "RAIL_OVERCURRENT GPIO%d, FAULT_USB_RAW GPIO%d — all three faults "
           "ACTIVE LOW.",
           static_cast<int>(pins_.driver_nsleep),
           static_cast<int>(pins_.fault_raw),
           static_cast<int>(pins_.rail_overcurrent),
           static_cast<int>(pins_.fault_usb));
  return true;
}

int Rev33MotorBackend::motor_enable_level() const {
  return gpio_get_level(pins_.motor_enable);
}
int Rev33MotorBackend::fault_raw_level() const {
  return gpio_get_level(pins_.fault_raw);
}
int Rev33MotorBackend::rail_overcurrent_level() const {
  return gpio_get_level(pins_.rail_overcurrent);
}
int Rev33MotorBackend::fault_usb_level() const {
  return gpio_get_level(pins_.fault_usb);
}
int Rev33MotorBackend::driver_nsleep_level() const {
  return gpio_get_level(pins_.driver_nsleep);
}

Rev33MotorBackend::DecoderProbe Rev33MotorBackend::probe_decoder(uint8_t zone, bool reverse,
                                                                uint32_t hold_ms) {
  DecoderProbe result{};
  result.zone = zone;
  result.reverse = reverse;
  if (hold_ms > 30000)
    hold_ms = 30000;

  // MOTOR_ENABLE stays low for the whole probe. The decoder output is what we
  // want to observe; an energised bridge is not, and the drive permit may well
  // be asserted during bring-up.
  gpio_set_direction(pins_.motor_enable, GPIO_MODE_OUTPUT);
  coast();
  // `zone` is the 1-based channel the contract and the UI use; select() takes
  // the 0-based index the rest of the controller passes (rev33_logic.h).
  // Feeding it straight through silently probes the *next* channel.
  if (zone == 0 ||
      !select(static_cast<uint8_t>(zone - 1),
              reverse ? Rev33Direction::REVERSE : Rev33Direction::FORWARD)) {
    ESP_LOGE(TAG, "Decoder probe rejected zone %u %s: not in the channel map",
             static_cast<unsigned>(zone), reverse ? "reverse" : "forward");
    return result;
  }

  result.accepted = true;
  result.decoder_address = decoder_address();
  result.a0 = gpio_get_level(pins_.address0);
  result.a1 = gpio_get_level(pins_.address1);
  result.a2 = gpio_get_level(pins_.address2);
  result.a3 = gpio_get_level(pins_.address3);
  result.motor_enable = gpio_get_level(pins_.motor_enable);
  ESP_LOGI(TAG,
           "Decoder probe: zone %u %s -> address %u, A3..A0 = %d%d%d%d on "
           "GPIO%d/%d/%d/%d, MOTOR_ENABLE=%d. Holding %" PRIu32 " ms — the matching "
           "74HC4514 output should be the only one asserted.",
           static_cast<unsigned>(zone), reverse ? "REVERSE" : "FORWARD",
           static_cast<unsigned>(result.decoder_address),
           result.a3, result.a2, result.a1, result.a0,
           static_cast<int>(pins_.address3), static_cast<int>(pins_.address2),
           static_cast<int>(pins_.address1), static_cast<int>(pins_.address0),
           result.motor_enable, hold_ms);

  uint32_t remaining = hold_ms;
  while (remaining > 0) {
    const uint32_t chunk = remaining > 100 ? 100 : remaining;
    esphome::delay(chunk);
    remaining -= chunk;
  }

  // Park on address 0: Q0-Q3 reach no bridge input, so it selects nothing.
  coast();
  gpio_set_level(pins_.address0, 0);
  gpio_set_level(pins_.address1, 0);
  gpio_set_level(pins_.address2, 0);
  gpio_set_level(pins_.address3, 0);
  return result;
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

  const int raw = gpio_get_level(pins_.fault_raw);
  const int rail = gpio_get_level(pins_.rail_overcurrent);
  const int usb = gpio_get_level(pins_.fault_usb);
  if (raw == 0 || rail == 0 || usb == 0) {
    set_drive_permit(false);
    ESP_LOGE(TAG,
             "Drive permit refused: FAULT_N_RAW=%d RAIL_OVERCURRENT=%d "
             "FAULT_USB_RAW=%d (0 = asserted). A bridge fault, the 150 mA rail "
             "comparator, or the USB switch current-limiting.",
             raw, rail, usb);
    return false;
  }
  // selection_.arm() takes "is a fault asserted", not "is the line high".
  return selection_.arm(false);
}

void Rev33MotorBackend::write_address_() {
  const uint8_t address = selection_.decoder_address();
  if (!rev33_address_is_reachable(address)) {
    // select() validates the index, so this is unreachable unless the address
    // map itself is wrong.  Leave the decoder on address 0 rather than guess.
    ESP_LOGE(TAG, "Refusing to write unreachable decoder address %u", address);
    return;
  }
  gpio_set_level(pins_.address0, address & 0x01u);
  gpio_set_level(pins_.address1, (address >> 1) & 0x01u);
  gpio_set_level(pins_.address2, (address >> 2) & 0x01u);
  gpio_set_level(pins_.address3, (address >> 3) & 0x01u);
}

bool Rev33MotorBackend::select(uint8_t index, Rev33Direction direction) {
  if (!ready_ || !selection_.select(index, direction))
    return false;
  write_address_();
  // The 4514's address latch is transparent only while inhibited.  Give the
  // address a full millisecond to settle before drive resumes.
  delay_us_(1000);
  return true;
}

bool Rev33MotorBackend::drive() {
  if (!ready_ || fault_latched()) {
    gpio_set_level(pins_.motor_enable, 0);
    selection_.observe_fault(true);
    return false;
  }
  if (!selection_.enable())
    return false;
  gpio_set_level(pins_.motor_enable, 1);
  return true;
}

void Rev33MotorBackend::coast() {
  gpio_set_level(pins_.motor_enable, 0);
  selection_.coast();
}

bool Rev33MotorBackend::fault_latched() const {
  // The controller asks "may I keep driving?". That is any of the three nets,
  // not just FAULT_N_RAW. Attribution stays on the per-net accessors.
  return any_fault();
}

bool Rev33MotorBackend::any_fault() const {
  return gpio_get_level(pins_.fault_raw) == 0 ||
         gpio_get_level(pins_.rail_overcurrent) == 0 ||
         gpio_get_level(pins_.fault_usb) == 0;
}

void Rev33MotorBackend::set_drive_permit(bool permitted) {
  gpio_set_level(pins_.driver_nsleep, permitted ? 1 : 0);
  if (!permitted)
    selection_.coast();
}

void Rev33MotorBackend::reset_motion() {
  tacho_.reset(0);
  last_hardware_count_ = 0;
  if (pcnt_unit_)
    pcnt_unit_clear_count(pcnt_unit_);
}

void Rev33MotorBackend::poll_motion(uint32_t now_ms, bool drive_active) {
  if (ready_ && pcnt_unit_ != nullptr) {
    int hardware = 0;
    if (pcnt_unit_get_count(pcnt_unit_, &hardware) == ESP_OK) {
      last_hardware_count_ = hardware < 0 ? 0u : static_cast<uint32_t>(hardware);

      if (drive_active) {
        tacho_.observe_count(last_hardware_count_, now_ms);
      } else {
        // The bridge is off - whatever the comparator did across this interval
        // was not commutation of the selected motor.
        tacho_.rebase_count(last_hardware_count_);
      }

      // Mirror an asserted fault in the selection state so the next drive()
      // has to go through arm_latch() again.
      if (fault_latched())
        selection_.observe_fault(true);
    }
  }
  // Firmware owns DRIVER_N_SLEEP, so a fault net that asserts mid-move has to
  // put the bridges back to sleep here — coasting MOTOR_ENABLE alone leaves
  // them awake.
  if (any_fault())
    set_drive_permit(false);
}

}  // namespace lv6
