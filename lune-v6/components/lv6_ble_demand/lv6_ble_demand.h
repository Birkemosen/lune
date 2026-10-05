#pragma once

#include "esphome/components/lv6_config_store/lv6_config_store.h"
#include "esphome/components/nimble_hub/nimble_hub.h"
#include "esphome/core/component.h"

namespace lv6 {

/// Enables NimBLE only while WiFi is settled and config still needs BLE
/// (any zone TempSource::BLE_SENSOR, or ble_clock_sync_enabled).
class Lv6BleDemand : public esphome::Component {
 public:
  void set_hub(esphome::nimble_hub::NimbleHub *hub) { hub_ = hub; }
  void set_config_store(Lv6ConfigStore *store) { config_store_ = store; }
  void set_wifi_settle_ms(uint32_t ms) { wifi_settle_ms_ = ms; }
  void set_idle_grace_ms(uint32_t ms) { idle_grace_ms_ = ms; }

  void setup() override;
  void loop() override;
  void dump_config() override;
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }

  bool demanded() const { return demanded_; }
  bool wifi_ready() const { return wifi_ready_; }

 protected:
  bool compute_demand_() const;
  bool wifi_connected_() const;
  void apply_demand_(bool want_on, uint32_t now_ms);

  esphome::nimble_hub::NimbleHub *hub_{nullptr};
  Lv6ConfigStore *config_store_{nullptr};

  uint32_t wifi_settle_ms_{15000};
  uint32_t idle_grace_ms_{30000};

  bool demanded_{false};
  bool wifi_ready_{false};
  bool wifi_was_connected_{false};
  uint32_t wifi_connected_since_ms_{0};
  uint32_t idle_since_ms_{0};
};

}  // namespace lv6
