#include "lv6_ble_time_beacon.h"

#include <cstring>

#include "esphome/core/log.h"

namespace lv6 {

static const char *const TAG = "lv6_ble_clock";
// BLE flags: General Discoverable + BR/EDR Not Supported (same as ESP_BLE_ADV_FLAG_*).
static constexpr uint8_t ADV_FLAGS = 0x06;

void Lv6BleTimeBeacon::setup() {
  ESP_LOGI(TAG, "Shelly BLU Date/Time Broadcast ready (Europe/Copenhagen)");
}

void Lv6BleTimeBeacon::dump_config() {
  ESP_LOGCONFIG(TAG, "BLE clock sync:");
  ESP_LOGCONFIG(TAG, "  Enabled: %s", this->enabled() ? "YES" : "NO");
  ESP_LOGCONFIG(TAG, "  Interval: %u min", static_cast<unsigned>(this->interval_min()));
}

bool Lv6BleTimeBeacon::enabled() const {
  if (this->config_store_ == nullptr)
    return true;
  return this->config_store_->get_config().sensor_config.ble_clock_sync_enabled;
}

uint16_t Lv6BleTimeBeacon::interval_min() const {
  if (this->config_store_ == nullptr)
    return ble_time::CLOCK_SYNC_INTERVAL_MIN_DEFAULT;
  return ble_time::clamp_interval_min(this->config_store_->get_config().sensor_config.ble_clock_sync_interval_min);
}

void Lv6BleTimeBeacon::set_enabled(bool enabled) {
  if (this->config_store_ == nullptr)
    return;
  auto sensors = this->config_store_->get_config().sensor_config;
  sensors.ble_clock_sync_enabled = enabled;
  this->config_store_->update_sensor_config(sensors);
  if (!enabled && this->advertising_)
    this->stop_burst_();
}

void Lv6BleTimeBeacon::set_interval_min(uint16_t minutes) {
  if (this->config_store_ == nullptr)
    return;
  auto sensors = this->config_store_->get_config().sensor_config;
  sensors.ble_clock_sync_interval_min = ble_time::clamp_interval_min(minutes);
  this->config_store_->update_sensor_config(sensors);
}

void Lv6BleTimeBeacon::request_sync_now() { this->pending_now_ = true; }

bool Lv6BleTimeBeacon::clock_is_valid_(const esphome::ESPTime &now) const {
  return now.is_valid() && now.year >= 2024;
}

void Lv6BleTimeBeacon::set_error_(const char *code) {
  strncpy(this->last_error_, code, sizeof(this->last_error_) - 1);
  this->last_error_[sizeof(this->last_error_) - 1] = '\0';
}

void Lv6BleTimeBeacon::loop() {
  const uint32_t now_ms = esphome::millis();

  if (this->advertising_) {
    if (now_ms - this->burst_start_ms_ >= ble_time::CLOCK_SYNC_BURST_MS)
      this->stop_burst_();
    return;
  }

  if (!this->enabled())
    return;

  if (!this->pending_now_ && now_ms < this->next_try_ms_)
    return;

  this->start_burst_();
}

bool Lv6BleTimeBeacon::start_burst_() {
  if (this->hub_ == nullptr) {
    this->set_error_("ble_busy");
    ESP_LOGW(TAG, "Clock sync skipped: no nimble_hub");
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  if (!this->hub_->is_enabled()) {
    this->set_error_("ble_busy");
    ESP_LOGD(TAG, "Clock sync skipped: nimble_hub disabled");
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  if (this->time_ == nullptr) {
    this->set_error_("clock_invalid");
    ESP_LOGW(TAG, "Clock sync skipped: no time source");
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  const esphome::ESPTime now = this->time_->now();
  if (!this->clock_is_valid_(now)) {
    this->set_error_("clock_invalid");
    ESP_LOGD(TAG, "Clock sync skipped: SNTP not valid yet");
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  if (this->advertising_) {
    this->set_error_("ble_busy");
    return false;
  }

  const uint32_t unix_s = static_cast<uint32_t>(now.timestamp);
  const int year_utc = esphome::ESPTime::from_epoch_utc(now.timestamp).year;
  if (!this->start_advertising_(unix_s, year_utc)) {
    this->set_error_("ble_busy");
    this->stop_burst_();
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  this->pending_now_ = false;
  this->advertising_ = true;
  this->burst_start_ms_ = esphome::millis();
  this->next_try_ms_ = this->burst_start_ms_ + static_cast<uint32_t>(this->interval_min()) * 60000UL;
  this->last_ok_s_ = unix_s;
  this->last_error_[0] = '\0';
  ESP_LOGI(TAG, "Date/Time Broadcast started (utc=%lu tz=Europe/Copenhagen)",
           static_cast<unsigned long>(this->last_ok_s_));
  return true;
}

void Lv6BleTimeBeacon::stop_burst_() {
  this->stop_advertising_();
  this->advertising_ = false;
}

bool Lv6BleTimeBeacon::start_advertising_(uint32_t unix_s, int year) {
  if (this->hub_ == nullptr)
    return false;

  uint8_t raw[31] = {};
  size_t n = 0;
  raw[n++] = 0x02;
  raw[n++] = 0x01;
  raw[n++] = ADV_FLAGS;
  raw[n++] = 0x18;
  raw[n++] = 0xFF;
  n += ble_time::encode_manufacturer_data(raw + n, unix_s, year);

  esphome::nimble_hub::RawAdvertiseParams params;
  params.interval_min = 0xA0;  // 100 ms
  params.interval_max = 0xC0;  // 120 ms
  return this->hub_->start_raw_advertise(raw, n, params);
}

void Lv6BleTimeBeacon::stop_advertising_() {
  if (this->hub_ != nullptr)
    this->hub_->stop_advertise();
}

}  // namespace lv6
