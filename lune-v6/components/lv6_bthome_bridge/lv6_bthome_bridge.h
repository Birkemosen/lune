#pragma once

#include "esphome/components/lv6_zone_controller/lv6_zone_controller.h"
#include "esphome/components/nimble_hub/nimble_hub.h"
#include "esphome/components/sensor/sensor.h"
#include "esphome/core/component.h"

#include <cmath>

namespace lv6 {

class Lv6BthomeBridge : public esphome::Component {
 public:
  void set_hub(esphome::nimble_hub::NimbleHub *hub) { hub_ = hub; }
  void set_zone_controller(Lv6ZoneController *zones) { zones_ = zones; }
  void set_zone_temp_sensor(uint8_t zone, esphome::sensor::Sensor *sensor) {
    if (zone < 6)
      zone_temp_[zone] = sensor;
  }

  void setup() override;
  void dump_config() override;
  float get_setup_priority() const override { return esphome::setup_priority::LATE; }

 protected:
  void on_advertisement_(const esphome::nimble_hub::AdvertisementInfo &info);
  /// Values decoded from one BTHome v2 service-data payload (NAN / -1 = absent).
  struct Reading {
    float temperature_c = NAN;
    float humidity_pct = NAN;   ///< 0x03 (0.01 %) or 0x2E (1 %)
    int16_t battery_pct = -1;   ///< 0x01 (1 %)
  };
  static void parse_bthome_(const uint8_t *svc_data, size_t len, Reading *out);

  esphome::nimble_hub::NimbleHub *hub_{nullptr};
  Lv6ZoneController *zones_{nullptr};
  esphome::sensor::Sensor *zone_temp_[6]{};

  struct LastSeen {
    char mac[18];
    uint32_t ts;
    bool used;
  };
  LastSeen last_update_[16]{};
};

}  // namespace lv6
