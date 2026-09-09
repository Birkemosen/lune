#include "lv6_ble_demand.h"

#include "esphome/core/log.h"

#ifdef USE_WIFI
#include "esphome/components/wifi/wifi_component.h"
#endif

namespace lv6 {

static const char *const TAG = "lv6_ble_demand";

void Lv6BleDemand::setup() {
  if (this->hub_ == nullptr || this->config_store_ == nullptr) {
    ESP_LOGE(TAG, "hub or config store missing");
    this->mark_failed();
    return;
  }
  ESP_LOGI(TAG, "BLE demand gate ready (wifi_settle=%lums idle_grace=%lums)",
           static_cast<unsigned long>(this->wifi_settle_ms_),
           static_cast<unsigned long>(this->idle_grace_ms_));
}

void Lv6BleDemand::dump_config() {
  ESP_LOGCONFIG(TAG, "BLE demand gate:");
  ESP_LOGCONFIG(TAG, "  WiFi settle: %lu ms", static_cast<unsigned long>(this->wifi_settle_ms_));
  ESP_LOGCONFIG(TAG, "  Idle grace: %lu ms", static_cast<unsigned long>(this->idle_grace_ms_));
}

bool Lv6BleDemand::wifi_connected_() const {
#ifdef USE_WIFI
  return esphome::wifi::global_wifi_component != nullptr &&
         esphome::wifi::global_wifi_component->is_connected();
#else
  return false;
#endif
}

bool Lv6BleDemand::compute_demand_() const {
  if (this->config_store_ == nullptr)
    return false;
  const auto &sensors = this->config_store_->get_config().sensor_config;
  if (sensors.ble_clock_sync_enabled)
    return true;
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (sensors.zone_temp_source[z] == TempSource::BLE_SENSOR)
      return true;
  }
  return false;
}

void Lv6BleDemand::apply_demand_(bool want_on, uint32_t now_ms) {
  if (this->hub_ == nullptr)
    return;

  if (want_on) {
    this->idle_since_ms_ = 0;
    if (!this->hub_->is_enabled()) {
      ESP_LOGI(TAG, "BLE demanded — enabling NimBLE hub");
      this->hub_->enable();
    }
    if (!this->hub_->scanning() && !this->hub_->advertising()) {
      ESP_LOGI(TAG, "BLE demanded — starting scan");
      this->hub_->start_scan(true);
    } else if (!this->hub_->scanning()) {
      // Advertise may have paused scan; ask hub to resume when the burst ends.
      this->hub_->start_scan(true);
    }
    return;
  }

  if (!this->hub_->is_enabled() && !this->hub_->scanning()) {
    this->idle_since_ms_ = 0;
    return;
  }

  if (this->idle_since_ms_ == 0) {
    this->idle_since_ms_ = now_ms;
    ESP_LOGI(TAG, "BLE idle — grace %lums before disable",
             static_cast<unsigned long>(this->idle_grace_ms_));
    return;
  }

  if ((now_ms - this->idle_since_ms_) < this->idle_grace_ms_)
    return;

  ESP_LOGI(TAG, "BLE idle grace elapsed — stopping scan and disabling hub");
  this->hub_->stop_scan();
  this->hub_->disable();
  this->idle_since_ms_ = 0;
}

void Lv6BleDemand::loop() {
  if (this->is_failed() || this->hub_ == nullptr)
    return;

  const uint32_t now = esphome::millis();
  const bool wifi_up = this->wifi_connected_();

  if (wifi_up) {
    if (!this->wifi_was_connected_) {
      this->wifi_was_connected_ = true;
      this->wifi_connected_since_ms_ = now;
      this->wifi_ready_ = false;
      ESP_LOGI(TAG, "WiFi connected — BLE settle %lums",
               static_cast<unsigned long>(this->wifi_settle_ms_));
    } else if (!this->wifi_ready_ &&
               (now - this->wifi_connected_since_ms_) >= this->wifi_settle_ms_) {
      this->wifi_ready_ = true;
      ESP_LOGI(TAG, "WiFi settled — BLE may start if demanded");
    }
  } else {
    if (this->wifi_was_connected_ || this->hub_->is_enabled()) {
      ESP_LOGI(TAG, "WiFi down — disabling NimBLE hub");
      this->hub_->stop_scan();
      this->hub_->disable();
    }
    this->wifi_was_connected_ = false;
    this->wifi_ready_ = false;
    this->wifi_connected_since_ms_ = 0;
    this->idle_since_ms_ = 0;
    this->demanded_ = false;
    return;
  }

  this->demanded_ = this->compute_demand_();
  const bool want_on = this->demanded_ && this->wifi_ready_;
  this->apply_demand_(want_on, now);
}

}  // namespace lv6
