#include "rev32_motor_backend.h"

#include "esphome/core/log.h"
#include "esp_rom_sys.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

namespace lv6 {

static const char *const TAG = "hv6_rev32_motor";

void Rev32MotorBackend::delay_us_(uint32_t microseconds) const {
  esp_rom_delay_us(microseconds);
}

void Rev32MotorBackend::delay_ms_(uint32_t milliseconds) const {
  // ESPHome pins CONFIG_FREERTOS_HZ at 1000, so a millisecond is a tick.  The
  // floor of one tick keeps this honest if that ever changes.
  TickType_t ticks = pdMS_TO_TICKS(milliseconds);
  vTaskDelay(ticks == 0 ? 1 : ticks);
}

bool Rev32MotorBackend::configure_tacho_() {
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

bool Rev32MotorBackend::setup() {
  const uint64_t output_mask = (1ULL << pins_.address0) |
                               (1ULL << pins_.address1) |
                               (1ULL << pins_.address2) |
                               (1ULL << pins_.address3) |
                               (1ULL << pins_.motor_enable) |
                               (1ULL << pins_.latch_arm);
  gpio_config_t outputs = {};
  outputs.pin_bit_mask = output_mask;
  outputs.mode = GPIO_MODE_OUTPUT;
  outputs.pull_up_en = GPIO_PULLUP_DISABLE;
  outputs.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&outputs) != ESP_OK)
    return false;

  // Address 0 is the safest value there is: Q0-Q3 reach no bridge input, so an
  // all-low address selects nothing even if the decoder were not inhibited.
  gpio_set_level(pins_.motor_enable, 0);
  gpio_set_level(pins_.address0, 0);
  gpio_set_level(pins_.address1, 0);
  gpio_set_level(pins_.address2, 0);
  gpio_set_level(pins_.address3, 0);
  gpio_set_level(pins_.latch_arm, 0);

  gpio_config_t latch_input = {};
  latch_input.pin_bit_mask = 1ULL << pins_.latch_state;
  latch_input.mode = GPIO_MODE_INPUT;
  latch_input.pull_up_en = GPIO_PULLUP_DISABLE;
  latch_input.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&latch_input) != ESP_OK)
    return false;

  // ADC1 belongs to the controller's continuous driver; the backend only owns
  // the decoder, the latch and the commutation counter.
  if (!configure_tacho_())
    return false;

  ready_ = true;
  return true;
}

bool Rev32MotorBackend::arm_latch() {
  if (!ready_)
    return false;

  // The arm clock is edge-coupled and clamped while MOTOR_ENABLE is high, so a
  // pulse issued on a live bridge is swallowed without any indication.  Coast
  // first, then give the 110k x 10n coupling network five time constants at the
  // low level before and after the edge.
  coast();
  gpio_set_level(pins_.latch_arm, 0);
  delay_ms_(ARM_SETTLE_MS);
  gpio_set_level(pins_.latch_arm, 1);
  delay_us_(ARM_PULSE_US);
  gpio_set_level(pins_.latch_arm, 0);
  delay_ms_(ARM_SETTLE_MS);

  if (!selection_.arm(fault_latched())) {
    ESP_LOGE(TAG,
             "Fault latch did not arm; FAULT_N_RAW is still asserted. "
             "Firmware cannot clear a hardware fault - inspect TP3.");
    return false;
  }
  return true;
}

void Rev32MotorBackend::write_address_() {
  const uint8_t address = selection_.decoder_address();
  if (!rev32_address_is_reachable(address)) {
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

bool Rev32MotorBackend::select(uint8_t index, Rev32Direction direction) {
  if (!ready_ || !selection_.select(index, direction))
    return false;
  write_address_();
  // The 4514's address latch is transparent only while inhibited.  Give the
  // address a full millisecond to settle before drive resumes.
  delay_us_(1000);
  return true;
}

bool Rev32MotorBackend::drive() {
  if (!ready_ || fault_latched()) {
    gpio_set_level(pins_.motor_enable, 0);
    selection_.observe_latch(true);
    return false;
  }
  if (!selection_.enable())
    return false;
  gpio_set_level(pins_.motor_enable, 1);
  return true;
}

void Rev32MotorBackend::coast() {
  gpio_set_level(pins_.motor_enable, 0);
  selection_.coast();
}

bool Rev32MotorBackend::fault_latched() const {
  // LATCH_STATE is the flip-flop's /Q: high means faulted *or* not armed.
  return gpio_get_level(pins_.latch_state) != 0;
}

void Rev32MotorBackend::reset_motion() {
  tacho_.reset(0);
  last_hardware_count_ = 0;
  if (pcnt_unit_)
    pcnt_unit_clear_count(pcnt_unit_);
}

void Rev32MotorBackend::poll_motion(uint32_t now_ms, bool drive_active) {
  if (!ready_ || pcnt_unit_ == nullptr)
    return;

  int hardware = 0;
  if (pcnt_unit_get_count(pcnt_unit_, &hardware) != ESP_OK)
    return;
  last_hardware_count_ = hardware < 0 ? 0u : static_cast<uint32_t>(hardware);

  if (drive_active) {
    tacho_.observe_count(last_hardware_count_, now_ms);
  } else {
    // The bridge is off - whatever the comparator did across this interval was
    // not commutation of the selected motor.
    tacho_.rebase_count(last_hardware_count_);
  }

  // A latch assertion removes the drive permit in hardware; mirror it in the
  // selection state so the next drive() has to go through arm_latch() again.
  if (fault_latched())
    selection_.observe_latch(true);
}

}  // namespace lv6
