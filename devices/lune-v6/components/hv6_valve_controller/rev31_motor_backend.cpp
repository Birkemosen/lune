#include "rev31_motor_backend.h"

#include "esphome/core/log.h"
#include "esp_adc/adc_cali_scheme.h"
#include "esp_rom_sys.h"
#include "esp_timer.h"

#include <algorithm>

namespace hv6 {

static const char *const TAG = "hv6_rev31_motor";

void Rev31MotorBackend::delay_us_(uint32_t microseconds) const {
  esp_rom_delay_us(microseconds);
}

bool Rev31MotorBackend::configure_adc_() {
  adc_unit_t current_unit;
  adc_unit_t bemf_unit;
  if (adc_oneshot_io_to_channel(static_cast<int>(pins_.adc_current),
                                &current_unit, &current_channel_) != ESP_OK ||
      adc_oneshot_io_to_channel(static_cast<int>(pins_.adc_bemf),
                                &bemf_unit, &bemf_channel_) != ESP_OK ||
      current_unit != bemf_unit) {
    ESP_LOGE(TAG, "ADC_CURRENT and ADC_BEMF must map to the same ADC unit");
    return false;
  }
  adc_unit_ = current_unit;

  adc_oneshot_unit_init_cfg_t unit_cfg = {};
  unit_cfg.unit_id = adc_unit_;
  unit_cfg.ulp_mode = ADC_ULP_MODE_DISABLE;
  if (adc_oneshot_new_unit(&unit_cfg, &adc_handle_) != ESP_OK)
    return false;

  adc_oneshot_chan_cfg_t channel_cfg = {};
  channel_cfg.atten = ADC_ATTEN_DB_12;
  channel_cfg.bitwidth = ADC_BITWIDTH_12;
  if (adc_oneshot_config_channel(adc_handle_, current_channel_, &channel_cfg) != ESP_OK ||
      adc_oneshot_config_channel(adc_handle_, bemf_channel_, &channel_cfg) != ESP_OK)
    return false;

  adc_cali_curve_fitting_config_t current_cfg = {};
  current_cfg.unit_id = adc_unit_;
  current_cfg.chan = current_channel_;
  current_cfg.atten = ADC_ATTEN_DB_12;
  current_cfg.bitwidth = ADC_BITWIDTH_12;
  if (adc_cali_create_scheme_curve_fitting(&current_cfg, &current_calibration_) != ESP_OK) {
    current_calibration_ = nullptr;
    ESP_LOGW(TAG, "ADC_CURRENT calibration unavailable; using nominal conversion");
  }

  return true;
}

bool Rev31MotorBackend::setup() {
  const uint64_t output_mask = (1ULL << pins_.address0) |
                               (1ULL << pins_.address1) |
                               (1ULL << pins_.address2) |
                               (1ULL << pins_.motor_enable) |
                               (1ULL << pins_.terminal_direction) |
                               (1ULL << pins_.latch_arm);
  gpio_config_t outputs = {};
  outputs.pin_bit_mask = output_mask;
  outputs.mode = GPIO_MODE_OUTPUT;
  outputs.pull_up_en = GPIO_PULLUP_DISABLE;
  outputs.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&outputs) != ESP_OK)
    return false;

  gpio_set_level(pins_.motor_enable, 0);
  gpio_set_level(pins_.address0, 0);
  gpio_set_level(pins_.address1, 0);
  gpio_set_level(pins_.address2, 0);
  gpio_set_level(pins_.terminal_direction, 0);
  gpio_set_level(pins_.latch_arm, 0);

  gpio_config_t latch_input = {};
  latch_input.pin_bit_mask = 1ULL << pins_.latch_state;
  latch_input.mode = GPIO_MODE_INPUT;
  latch_input.pull_up_en = GPIO_PULLUP_DISABLE;
  latch_input.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&latch_input) != ESP_OK || !configure_adc_())
    return false;

  ready_ = true;
  return true;
}

bool Rev31MotorBackend::arm_latch() {
  if (!ready_)
    return false;
  coast();
  gpio_set_level(pins_.latch_arm, 0);
  delay_us_(20);
  gpio_set_level(pins_.latch_arm, 1);
  delay_us_(50);
  gpio_set_level(pins_.latch_arm, 0);
  delay_us_(50);

  if (fault_latched()) {
    selection_.latch_fault();
    ESP_LOGE(TAG, "Fault latch did not arm; raw hardware fault is probably active");
    return false;
  }
  selection_.arm();
  return true;
}

void Rev31MotorBackend::write_selection_() {
  gpio_set_level(pins_.address0, selection_.zone & 0x01u);
  gpio_set_level(pins_.address1, (selection_.zone >> 1) & 0x01u);
  gpio_set_level(pins_.address2, (selection_.zone >> 2) & 0x01u);
  gpio_set_level(pins_.terminal_direction,
                 selection_.direction == Rev31Direction::REVERSE ? 1 : 0);
}

bool Rev31MotorBackend::select(uint8_t zone, Rev31Direction direction) {
  if (!ready_ || !selection_.select(zone, direction))
    return false;
  write_selection_();
  // The decoder latch is transparent only while inhibited.  Give address,
  // direction and BEMF mux a full millisecond to settle before drive resumes.
  delay_us_(1000);
  return true;
}

bool Rev31MotorBackend::drive() {
  if (!ready_ || fault_latched()) {
    selection_.latch_fault();
    gpio_set_level(pins_.motor_enable, 0);
    return false;
  }
  if (!selection_.enable())
    return false;
  gpio_set_level(pins_.motor_enable, 1);
  return true;
}

void Rev31MotorBackend::coast() {
  gpio_set_level(pins_.motor_enable, 0);
  selection_.coast();
}

bool Rev31MotorBackend::fault_latched() const {
  return gpio_get_level(pins_.latch_state) != 0;
}

bool Rev31MotorBackend::read_adc_(adc_channel_t channel,
                                  adc_cali_handle_t calibration,
                                  int *raw, int *millivolts) {
  if (!adc_handle_ || adc_oneshot_read(adc_handle_, channel, raw) != ESP_OK)
    return false;
  if (millivolts == nullptr)
    return true;
  if (calibration && adc_cali_raw_to_voltage(calibration, *raw, millivolts) == ESP_OK)
    return true;
  *millivolts = (*raw * 3300) / 4095;
  return true;
}

float Rev31MotorBackend::read_current_ma() {
  int raw = 0;
  int millivolts = 0;
  if (!read_adc_(current_channel_, current_calibration_, &raw, &millivolts))
    return 0.0f;
  // INA180A1 gain 20 with 0.5 ohm shunt: 10 V/A, therefore 10 mV/mA.
  return static_cast<float>(millivolts) / 10.0f;
}

Rev31BemfReading Rev31MotorBackend::sample_bemf(uint32_t now_ms,
                                                bool restore_drive) {
  Rev31BemfReading result;
  if (!ready_)
    return result;

  const uint8_t zone = selection_.zone;
  const Rev31Direction direction = selection_.direction;
  coast();

  // Both decoder and 4067 share A0..A3.  While MOTOR_ENABLE is low the decoder
  // is inhibited and transparent, so A3 can select terminal A then B safely.
  gpio_set_level(pins_.terminal_direction, 0);
  delay_us_(BEMF_SETTLE_US);
  const int64_t sample_a_us = esp_timer_get_time();
  const bool a_ok = read_adc_(bemf_channel_, nullptr, &result.raw_a, nullptr);

  gpio_set_level(pins_.terminal_direction, 1);
  delay_us_(BEMF_SETTLE_US);
  const int64_t sample_b_us = esp_timer_get_time();
  const bool b_ok = read_adc_(bemf_channel_, nullptr, &result.raw_b, nullptr);
  const int64_t separation = sample_b_us - sample_a_us;
  last_sample_separation_us_ = static_cast<uint16_t>(
      std::max<int64_t>(0, std::min<int64_t>(separation, 65535)));

  if (a_ok && b_ok) {
    result.motion = motion_tracker_.observe(
        result.raw_a, result.raw_b, last_sample_separation_us_, now_ms);
  } else {
    result.motion.differential_raw = 0;
    result.motion.separation_us = last_sample_separation_us_;
    result.motion.valid = false;
    result.motion.moving = false;
  }
  last_bemf_differential_raw_ = result.motion.differential_raw;

  selection_.select(zone, direction);
  write_selection_();
  delay_us_(1000);
  if (restore_drive)
    drive();
  return result;
}

void Rev31MotorBackend::reset_motion() {
  motion_tracker_.reset();
  last_sample_separation_us_ = 0;
  last_bemf_differential_raw_ = 0;
}

}  // namespace hv6
