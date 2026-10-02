#include "lv6_ble_time_beacon.h"

#include <cstring>

#include "esphome/core/log.h"

namespace lv6 {

static const char *const TAG = "lv6_ble_clock";
// BLE flags: General Discoverable + BR/EDR Not Supported (same as ESP_BLE_ADV_FLAG_*).
static constexpr uint8_t ADV_FLAGS = 0x06;

void Lv6BleTimeBeacon::setup() {
  ESP_LOGI(TAG, "Shelly BLU Date/Time Broadcast ready (Europe/Copenhagen, concurrent ~2s)");
}

void Lv6BleTimeBeacon::dump_config() {
  ESP_LOGCONFIG(TAG, "BLE clock sync:");
  ESP_LOGCONFIG(TAG, "  Enabled: %s", this->enabled() ? "YES" : "NO");
  ESP_LOGCONFIG(TAG, "  Advertise interval: %u ms (concurrent with scan)",
                static_cast<unsigned>(ble_time::CLOCK_SYNC_ADV_INTERVAL_MS));
}

bool Lv6BleTimeBeacon::enabled() const {
  if (this->config_store_ == nullptr)
    return true;
  return this->config_store_->get_config().sensor_config.ble_clock_sync_enabled;
}

uint16_t Lv6BleTimeBeacon::interval_min() const {
  // Legacy config field kept for settings backup; beacon is continuous ~2s.
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
  if (!enabled)
    this->stop_advertising_();
  else
    this->pending_now_ = true;
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
  if (!this->enabled()) {
    if (this->advertising_)
      this->stop_advertising_();
    return;
  }

  const uint32_t now_ms = esphome::millis();
  if (!this->pending_now_ && now_ms < this->next_try_ms_)
    return;

  if (!this->advertising_ || this->pending_now_) {
    if (!this->ensure_advertising_())
      return;
  } else if (now_ms >= this->next_refresh_ms_) {
    if (!this->refresh_payload_())
      return;
  }
}

bool Lv6BleTimeBeacon::encode_payload_(uint8_t *raw, size_t *len_out, uint32_t *unix_s_out) {
  if (this->time_ == nullptr) {
    this->set_error_("clock_invalid");
    return false;
  }
  const esphome::ESPTime now = this->time_->now();
  if (!this->clock_is_valid_(now)) {
    this->set_error_("clock_invalid");
    return false;
  }

  const uint32_t unix_s = static_cast<uint32_t>(now.timestamp);
  const int year_utc = esphome::ESPTime::from_epoch_utc(now.timestamp).year;

  size_t n = 0;
  raw[n++] = 0x02;
  raw[n++] = 0x01;
  raw[n++] = ADV_FLAGS;
  raw[n++] = 0x18;
  raw[n++] = 0xFF;
  n += ble_time::encode_manufacturer_data(raw + n, unix_s, year_utc);

  *len_out = n;
  *unix_s_out = unix_s;
  return true;
}

bool Lv6BleTimeBeacon::ensure_advertising_() {
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

  uint8_t raw[31] = {};
  size_t n = 0;
  uint32_t unix_s = 0;
  if (!this->encode_payload_(raw, &n, &unix_s)) {
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  esphome::nimble_hub::RawAdvertiseParams params;
  // ~2 s non-connectable interval (0.625 ms units). One packet ≈ 1 ms airtime.
  params.interval_min = ble_time::ms_to_adv_units(ble_time::CLOCK_SYNC_ADV_INTERVAL_MS);
  params.interval_max = ble_time::ms_to_adv_units(ble_time::CLOCK_SYNC_ADV_INTERVAL_MS + 200);

  if (!this->hub_->start_raw_advertise(raw, n, params)) {
    this->set_error_("ble_busy");
    this->advertising_ = false;
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  this->pending_now_ = false;
  this->advertising_ = true;
  this->last_ok_s_ = unix_s;
  this->last_error_[0] = '\0';
  this->next_refresh_ms_ = esphome::millis() + ble_time::CLOCK_SYNC_PAYLOAD_REFRESH_MS;
  this->next_try_ms_ = 0;
  ESP_LOGI(TAG, "Date/Time Broadcast on (utc=%lu concurrent itvl=%ums)",
           static_cast<unsigned long>(this->last_ok_s_),
           static_cast<unsigned>(ble_time::CLOCK_SYNC_ADV_INTERVAL_MS));
  return true;
}

bool Lv6BleTimeBeacon::refresh_payload_() {
  if (this->hub_ == nullptr || !this->advertising_)
    return false;

  uint8_t raw[31] = {};
  size_t n = 0;
  uint32_t unix_s = 0;
  if (!this->encode_payload_(raw, &n, &unix_s)) {
    this->next_try_ms_ = esphome::millis() + 15000;
    return false;
  }

  if (!this->hub_->set_raw_advertise_data(raw, n)) {
    // Controller may have dropped adv; try a full restart next loop.
    this->set_error_("ble_busy");
    this->advertising_ = false;
    this->pending_now_ = true;
    this->next_try_ms_ = esphome::millis() + 1000;
    return false;
  }

  this->last_ok_s_ = unix_s;
  this->last_error_[0] = '\0';
  this->next_refresh_ms_ = esphome::millis() + ble_time::CLOCK_SYNC_PAYLOAD_REFRESH_MS;
  return true;
}

void Lv6BleTimeBeacon::stop_advertising_() {
  if (this->hub_ != nullptr)
    this->hub_->stop_advertise();
  this->advertising_ = false;
}

}  // namespace lv6
