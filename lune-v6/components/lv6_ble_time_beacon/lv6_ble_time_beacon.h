#pragma once

#include "ble_datetime_broadcast.h"
#include "esphome/components/lv6_config_store/lv6_config_store.h"
#include "esphome/components/nimble_hub/nimble_hub.h"
#include "esphome/components/time/real_time_clock.h"
#include "esphome/core/component.h"

namespace lv6 {

class Lv6BleTimeBeacon : public esphome::Component {
 public:
  void set_time(esphome::time::RealTimeClock *clock) { time_ = clock; }
  void set_config_store(Lv6ConfigStore *store) { config_store_ = store; }
  void set_hub(esphome::nimble_hub::NimbleHub *hub) { hub_ = hub; }

  void setup() override;
  void loop() override;
  void dump_config() override;
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }

  void request_sync_now();
  void set_enabled(bool enabled);
  void set_interval_min(uint16_t minutes);

  bool enabled() const;
  uint16_t interval_min() const;
  uint32_t last_ok_s() const { return last_ok_s_; }
  const char *last_error() const { return last_error_; }
  bool advertising() const { return advertising_; }

 protected:
  bool clock_is_valid_(const esphome::ESPTime &now) const;
  void set_error_(const char *code);
  bool ensure_advertising_();
  bool refresh_payload_();
  void stop_advertising_();
  bool encode_payload_(uint8_t *raw, size_t *len_out, uint32_t *unix_s_out);

  esphome::time::RealTimeClock *time_{nullptr};
  Lv6ConfigStore *config_store_{nullptr};
  esphome::nimble_hub::NimbleHub *hub_{nullptr};

  bool pending_now_{false};
  bool advertising_{false};
  uint32_t next_try_ms_{0};
  uint32_t next_refresh_ms_{0};
  uint32_t last_ok_s_{0};
  char last_error_[16]{};
};

}  // namespace lv6
