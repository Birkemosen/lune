// =============================================================================
// LV6 Problems — problem notifications through Home Assistant
// =============================================================================
// Polls zone / valve / probe state on the main loop, keeps one ProblemTracker
// slot per problem instance and fires `esphome.lune_problem` events over the
// native API (shared/contracts/lune_notifications_contract_v1.md). Read-only
// towards control: it never changes a setpoint, valve or fault.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/core/defines.h"
#ifdef USE_SENSOR
#include "esphome/components/sensor/sensor.h"
#endif
#ifdef USE_TEXT_SENSOR
#include "esphome/components/text_sensor/text_sensor.h"
#endif
#include "../lv6_config_store/lv6_config_store.h"
#include "../lv6_valve_controller/lv6_valve_controller.h"
#include "../lv6_zone_controller/lv6_zone_controller.h"
#include "problem_texts.h"
#include "problem_tracker.h"

namespace lv6 {

class Lv6Problems : public esphome::PollingComponent {
 public:
  void set_zone_controller(Lv6ZoneController *z) { zones_ = z; }
  void set_valve_controller(Lv6ValveController *v) { valves_ = v; }
  void set_config_store(Lv6ConfigStore *c) { config_ = c; }
#ifdef USE_SENSOR
  void set_active_sensor(esphome::sensor::Sensor *s) { active_sensor_ = s; }
#endif
#ifdef USE_TEXT_SENSOR
  void set_problems_text(esphome::text_sensor::TextSensor *t) { problems_text_ = t; }
#endif
  /// Bit per 1-Wire probe slot whose ROM is learned (probe_addr_N != 0), i.e. a
  /// probe is installed there. Set by the probe watchdog in lune.yaml.
  void set_probe_mapped_mask(uint8_t mask) { probe_mapped_mask_ = mask; }

  void setup() override;
  void update() override;
  void dump_config() override;
  float get_setup_priority() const override { return esphome::setup_priority::LATE; }

 protected:
  // Slot layout: per zone VALVE_FAULT..HUMIDITY except FLOW/RETURN, then the
  // two manifold probes.
  static constexpr uint8_t PER_ZONE = 6;  // fault, stall, calibration, room, battery, humidity
  static constexpr uint8_t NUM_SLOTS = NUM_ZONES * PER_ZONE + 2;
  static constexpr uint8_t SLOT_FLOW = NUM_ZONES * PER_ZONE;
  static constexpr uint8_t SLOT_RETURN = SLOT_FLOW + 1;

  static uint8_t zone_slot_(uint8_t zone, problems::Kind k);
  static problems::Kind slot_kind_(uint8_t slot);
  static int8_t slot_zone_(uint8_t slot);

  void evaluate_(uint32_t now);
  bool probe_installed_(int8_t probe) const;
  void publish_entities_();
  void send_one_event_(uint32_t now);
  bool fire_(uint8_t slot, problems::Event ev);
  void room_label_(int8_t zone, char *out, size_t cap) const;

  Lv6ZoneController *zones_{nullptr};
  Lv6ValveController *valves_{nullptr};
  Lv6ConfigStore *config_{nullptr};
#ifdef USE_SENSOR
  esphome::sensor::Sensor *active_sensor_{nullptr};
#endif
#ifdef USE_TEXT_SENSOR
  esphome::text_sensor::TextSensor *problems_text_{nullptr};
#endif
  problems::Slot slots_[NUM_SLOTS]{};
  uint8_t probe_mapped_mask_{0};
  int16_t last_count_{-1};
};

}  // namespace lv6
