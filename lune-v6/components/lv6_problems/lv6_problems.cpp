#include "lv6_problems.h"

#include <cmath>
#include <cstdio>
#include <cstring>

#include "esphome/core/application.h"
#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#ifdef USE_API_HOMEASSISTANT_SERVICES
#include "esphome/components/api/api_server.h"
#endif

namespace lv6 {

using problems::Event;
using problems::Input;
using problems::Kind;
using problems::Severity;

static const char *const TAG = "lv6_problems";
static const char *const EVENT_TYPE = "esphome.lune_problem";
// TODO(i18n): V6 firmware has no device language yet; see problem_texts.h.
static constexpr problems::Lang LANG = problems::Lang::DA;
static constexpr size_t TEXT_MAX = 255;  ///< Contract: `Problems` cut to 255 characters

// Per-zone slot order.
static constexpr Kind ZONE_KINDS[] = {Kind::VALVE_FAULT, Kind::VALVE_STALL, Kind::VALVE_CALIBRATION,
                                      Kind::SENSOR_ROOM, Kind::BATTERY,     Kind::HUMIDITY};

uint8_t Lv6Problems::zone_slot_(uint8_t zone, Kind k) {
  for (uint8_t i = 0; i < PER_ZONE; i++)
    if (ZONE_KINDS[i] == k)
      return static_cast<uint8_t>(zone * PER_ZONE + i);
  return 0;
}

Kind Lv6Problems::slot_kind_(uint8_t slot) {
  if (slot == SLOT_FLOW)
    return Kind::SENSOR_FLOW;
  if (slot == SLOT_RETURN)
    return Kind::SENSOR_RETURN;
  return ZONE_KINDS[slot % PER_ZONE];
}

int8_t Lv6Problems::slot_zone_(uint8_t slot) {
  return slot < SLOT_FLOW ? static_cast<int8_t>(slot / PER_ZONE) : -1;
}

void Lv6Problems::setup() {
  if (zones_ == nullptr || valves_ == nullptr || config_ == nullptr) {
    ESP_LOGE(TAG, "zone controller, valve controller or config store missing");
    this->mark_failed();
  }
}

void Lv6Problems::dump_config() {
  ESP_LOGCONFIG(TAG, "Lune problems (%u slots, event %s)", static_cast<unsigned>(NUM_SLOTS), EVENT_TYPE);
#ifndef USE_API_HOMEASSISTANT_SERVICES
  ESP_LOGCONFIG(TAG, "  api homeassistant_services off: events are not sent");
#endif
}

void Lv6Problems::update() {
  const uint32_t now = esphome::millis();
  this->evaluate_(now);
  this->publish_entities_();
  this->send_one_event_(now);
}

bool Lv6Problems::probe_installed_(int8_t probe) const {
  return probe >= 0 && probe < MAX_PROBES && (probe_mapped_mask_ & (1u << probe)) != 0;
}

void Lv6Problems::evaluate_(uint32_t now) {
  const ProbeConfig probes = config_->get_probe_config();
  const uint8_t calib_failed = valves_->calibration_failed_mask();
  char buf[SENSOR_ID_LEN];

  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    const ZoneConfig zc = config_->get_zone_config(z);

    // ---- valve: motor fault, stall, calibration failed ----------------------
    const MotorTelemetry t = valves_->get_telemetry(z);
    // A driver with no actuator ever learned on it is an unused output, not a fault.
    const bool never_fitted = t.presence_known && !t.present && t.learned_open_ms == 0 &&
                              t.learned_open_ripples == 0;
    const bool valve_applies = zc.enabled && !never_fitted;
    const FaultCode f = t.last_fault_code;
    const bool stall = f == FaultCode::STALL || f == FaultCode::BLOCKED;
    const bool other = f != FaultCode::NONE && !stall;
    problems::step(slots_[zone_slot_(z, Kind::VALVE_FAULT)],
                   valve_applies && other ? Input::RAISE : Input::CLEAR, now, problems::DEFAULT_HOLD_MS,
                   Severity::ERROR, static_cast<uint8_t>(f));
    problems::step(slots_[zone_slot_(z, Kind::VALVE_STALL)],
                   valve_applies && stall ? Input::RAISE : Input::CLEAR, now, problems::DEFAULT_HOLD_MS,
                   Severity::ERROR, static_cast<uint8_t>(f));
    problems::step(slots_[zone_slot_(z, Kind::VALVE_CALIBRATION)],
                   valve_applies && (calib_failed & (1u << z)) ? Input::RAISE : Input::CLEAR, now,
                   problems::DEFAULT_HOLD_MS, Severity::ERROR);

    // ---- sensor: room temperature missing 30 min ----------------------------
    const TempSource src = config_->get_zone_temp_source(z);
    bool configured = false;
    bool ble_bound = false;
    if (src == TempSource::BLE_SENSOR) {
      config_->get_zone_ble_mac_str(z, buf, sizeof(buf));
      configured = ble_bound = buf[0] != '\0';
    } else if (src == TempSource::EXTERNAL) {
      config_->get_zone_sensor_id_str(z, buf, sizeof(buf));
      configured = buf[0] != '\0';
    } else {
      configured = zc.probe_role == ProbeRole::ROOM_TEMPERATURE && probe_installed_(probes.zone_return_probe[z]);
    }
    Input room = Input::CLEAR;
    if (zc.enabled && configured)
      room = std::isnan(zones_->get_zone_temperature(z)) ? Input::RAISE : Input::CLEAR;
    problems::step(slots_[zone_slot_(z, Kind::SENSOR_ROOM)], room, now, problems::SENSOR_HOLD_MS, Severity::ERROR,
                   static_cast<uint8_t>(src));

    // ---- BTHome sensor bound to this zone: battery, humidity ----------------
    const bool ble_applies = zc.enabled && ble_bound;
    {
      const int pct = zones_->get_zone_battery_pct(z);
      Severity sev = Severity::WARNING;
      const Input in = ble_applies ? problems::battery_input(pct, &sev) : Input::CLEAR;
      problems::step(slots_[zone_slot_(z, Kind::BATTERY)], in, now, problems::DEFAULT_HOLD_MS, sev, 0,
                     static_cast<uint8_t>(pct < 0 ? 0 : pct));
    }
    {
      problems::Slot &s = slots_[zone_slot_(z, Kind::HUMIDITY)];
      const float rh = zones_->get_zone_humidity_pct(z);
      uint8_t variant = problems::HUMIDITY_LOW;
      const Input in = ble_applies ? problems::humidity_input(rh, s.active(), s.variant, &variant) : Input::CLEAR;
      const long rounded = std::isfinite(rh) ? lroundf(rh) : 0;
      problems::step(s, in, now, problems::HUMIDITY_HOLD_MS, Severity::WARNING, variant,
                     static_cast<uint8_t>(rounded < 0 ? 0 : (rounded > 100 ? 100 : rounded)));
    }
  }

  // ---- sensor: manifold flow / return probe fault -----------------------------
  problems::step(slots_[SLOT_FLOW],
                 probe_installed_(probes.manifold_flow_probe) && std::isnan(zones_->get_manifold_flow_temperature())
                     ? Input::RAISE
                     : Input::CLEAR,
                 now, problems::SENSOR_HOLD_MS, Severity::ERROR);
  problems::step(slots_[SLOT_RETURN],
                 probe_installed_(probes.manifold_return_probe) &&
                         std::isnan(zones_->get_manifold_return_temperature())
                     ? Input::RAISE
                     : Input::CLEAR,
                 now, problems::SENSOR_HOLD_MS, Severity::ERROR);
}

void Lv6Problems::room_label_(int8_t zone, char *out, size_t cap) const {
  if (zone < 0) {
    if (cap > 0)
      out[0] = '\0';
    return;
  }
  const ZoneConfig zc = config_->get_zone_config(static_cast<uint8_t>(zone));
  char name[sizeof(zc.name) + 1];
  std::memcpy(name, zc.name, sizeof(zc.name));
  name[sizeof(zc.name)] = '\0';
  problems::zone_label(LANG, static_cast<uint8_t>(zone), name, out, cap);
}

void Lv6Problems::publish_entities_() {
  int16_t count = 0;
  char text[TEXT_MAX + 1];
  size_t off = 0;
  text[0] = '\0';
  bool full = false;
  char room[24];
  char title[96];
  for (uint8_t i = 0; i < NUM_SLOTS; i++) {
    const problems::Slot &s = slots_[i];
    if (!s.active())
      continue;
    count++;
    if (full)
      continue;
    room_label_(slot_zone_(i), room, sizeof(room));
    problems::title(LANG, slot_kind_(i), s.variant, room, title, sizeof(title));
    if (off > 0)
      full = !problems::append_utf8(text, sizeof(text), off, "; ");
    if (!full)
      full = !problems::append_utf8(text, sizeof(text), off, title);
  }

#ifdef USE_SENSOR
  if (active_sensor_ != nullptr && count != last_count_)
    active_sensor_->publish_state(static_cast<float>(count));
#endif
  last_count_ = count;
#ifdef USE_TEXT_SENSOR
  if (problems_text_ != nullptr && (!problems_text_->has_state() || problems_text_->state != text))
    problems_text_->publish_state(text);
#endif
}

void Lv6Problems::send_one_event_(uint32_t now) {
  // At most one event per update keeps the small API send queue free for state.
  for (uint8_t i = 0; i < NUM_SLOTS; i++) {
    const Event ev = problems::due(slots_[i], now);
    if (ev == Event::NONE)
      continue;
    const bool delivered = this->fire_(i, ev);
    problems::sent(slots_[i], ev, delivered, now);
    ESP_LOGI(TAG, "Problem %s %s (%s)", problems::id_kind(slot_kind_(i)),
             ev == Event::RAISED ? "raised" : "cleared", delivered ? "sent" : "no Home Assistant client");
    return;
  }
}

bool Lv6Problems::fire_(uint8_t slot, Event ev) {
#ifdef USE_API_HOMEASSISTANT_SERVICES
  auto *api = esphome::api::global_api_server;
  if (api == nullptr || !api->is_connected())
    return false;

  const problems::Slot &s = slots_[slot];
  const Kind kind = slot_kind_(slot);
  const int8_t zone = slot_zone_(slot);
  const auto &node = esphome::App.get_name();

  char id[64];
  if (zone >= 0)
    snprintf(id, sizeof(id), "%s:%.*s-z%d", problems::id_kind(kind), static_cast<int>(node.size()), node.c_str(),
             zone + 1);
  else
    snprintf(id, sizeof(id), "%s:%.*s", problems::id_kind(kind), static_cast<int>(node.size()), node.c_str());
  char device[40];
  snprintf(device, sizeof(device), "%.*s", static_cast<int>(node.size()), node.c_str());
  const SystemConfig sys = config_->get_system_config();
  char device_name[sizeof(sys.display_name) + 1];
  snprintf(device_name, sizeof(device_name), "%s", sys.display_name[0] ? sys.display_name : "Lune V6");
  char room[24];
  room_label_(zone, room, sizeof(room));
  char title[96];
  problems::title(LANG, kind, s.variant, room, title, sizeof(title));
  char message[224];
  if (ev == Event::RAISED)
    problems::message(LANG, kind, s.severity, s.variant, s.value, message, sizeof(message));
  else
    snprintf(message, sizeof(message), "%s", problems::cleared_message(LANG));

  esphome::api::HomeassistantActionRequest req;
  req.service = esphome::StringRef(EVENT_TYPE);
  req.is_event = true;
  req.data.init(9);
  auto add = [&req](const char *key, const char *value) {
    auto &kv = req.data.emplace_back();
    kv.key = esphome::StringRef(key);
    kv.value = esphome::StringRef(value);
  };
  add("device", device);
  add("device_name", device_name);
  add("id", id);
  add("category", problems::category(kind));
  add("severity", problems::severity_name(s.severity));
  add("state", ev == Event::RAISED ? "raised" : "cleared");
  add("title", title);
  add("message", message);
  add("room", room);

  // Only clients that subscribed to actions get it: Home Assistant subscribes
  // when «Allow the device to perform Home Assistant actions» is on.
  bool delivered = false;
  for (const auto &client : api->active_clients())
    delivered |= client->send_homeassistant_action(req);
  return delivered;
#else
  (void) slot;
  (void) ev;
  return false;
#endif
}

}  // namespace lv6
