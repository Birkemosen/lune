#include "coordinator_model.h"

#include <cmath>
#include <cstdio>
#include <cstring>

namespace lune_touch {

static void copy_text_(char *dest, size_t dest_size, const char *src) {
  if (dest_size == 0)
    return;
  if (src == nullptr)
    src = "";
  std::strncpy(dest, src, dest_size - 1);
  dest[dest_size - 1] = '\0';
}

static bool same_text_(const char *a, const char *b) {
  if (a == nullptr || b == nullptr)
    return false;
  return std::strcmp(a, b) == 0;
}

static void make_loop_id_(char *out, size_t out_size, const char *node_id, size_t zone_index) {
  if (out == nullptr || out_size == 0)
    return;
  std::snprintf(out, out_size, "loop-%s-%02u", node_id != nullptr ? node_id : "",
                static_cast<unsigned>(zone_index + 1));
}

static float clamp_float_(float value, float lo, float hi, float fallback) {
  if (!std::isfinite(value))
    return fallback;
  if (value < lo)
    return lo;
  if (value > hi)
    return hi;
  return value;
}

static float rolling_average_(float current, float sample, uint16_t count) {
  if (count == 0 || current <= 0.0f)
    return sample;
  const uint16_t effective_count = count > 200 ? 200 : count;
  return current + (sample - current) / static_cast<float>(effective_count + 1);
}

LogicalRoom *HouseModel::find_room_(const char *room_id) {
  if (room_id == nullptr || room_id[0] == '\0')
    return nullptr;
  for (size_t i = 0; i < room_count_; i++) {
    if (same_text_(rooms_[i].room_id, room_id))
      return &rooms_[i];
  }
  return nullptr;
}

const LogicalRoom *HouseModel::find_room_(const char *room_id) const {
  return const_cast<HouseModel *>(this)->find_room_(room_id);
}

size_t HouseModel::room_index_(const char *room_id) const {
  if (room_id == nullptr || room_id[0] == '\0')
    return room_count_;
  for (size_t i = 0; i < room_count_; i++) {
    if (same_text_(rooms_[i].room_id, room_id))
      return i;
  }
  return room_count_;
}

LogicalRoom *HouseModel::ensure_room_(const char *room_id, const char *room_name,
                                      ZoneNameSource source) {
  LogicalRoom *existing = find_room_(room_id);
  if (existing != nullptr) {
    if (room_name != nullptr && room_name[0] != '\0')
      copy_text_(existing->room_name, sizeof(existing->room_name), room_name);
    existing->name_source = source;
    existing->enabled = true;
    return existing;
  }
  if (room_count_ >= MAX_HOUSE_ROOMS)
    return nullptr;
  LogicalRoom &room = rooms_[room_count_++];
  copy_text_(room.room_id, sizeof(room.room_id), room_id);
  copy_text_(room.room_name, sizeof(room.room_name), room_name);
  room.name_source = source;
  room.enabled = true;
  room_revisions_[room_count_ - 1] = 1;
  return &room;
}

int HouseModel::upsert_node(const char *node_id, const char *hostname, const char *fallback_ip,
                            const char *model, const char *firmware, NodeTrust trust) {
  if (node_id == nullptr || node_id[0] == '\0')
    return -1;

  for (size_t i = 0; i < node_count_; i++) {
    if (same_text_(nodes_[i].node_id, node_id)) {
      if (nodes_[i].name[0] == '\0')
        copy_text_(nodes_[i].name, sizeof(nodes_[i].name), node_id);
      copy_text_(nodes_[i].hostname, sizeof(nodes_[i].hostname), hostname);
      copy_text_(nodes_[i].fallback_ip, sizeof(nodes_[i].fallback_ip), fallback_ip);
      copy_text_(nodes_[i].model, sizeof(nodes_[i].model), model);
      copy_text_(nodes_[i].firmware, sizeof(nodes_[i].firmware), firmware);
      nodes_[i].trust = trust;
      return static_cast<int>(i);
    }
  }

  if (node_count_ >= MAX_NODES)
    return -1;

  PairedNode &node = nodes_[node_count_];
  copy_text_(node.node_id, sizeof(node.node_id), node_id);
  copy_text_(node.name, sizeof(node.name), node_id);
  copy_text_(node.hostname, sizeof(node.hostname), hostname);
  copy_text_(node.fallback_ip, sizeof(node.fallback_ip), fallback_ip);
  copy_text_(node.model, sizeof(node.model), model);
  copy_text_(node.firmware, sizeof(node.firmware), firmware);
  node.trust = trust;
  node.reachable = false;
  node.last_seen_ms = 0;
  return static_cast<int>(node_count_++);
}

bool HouseModel::update_node_name(const char *node_id, const char *name) {
  if (node_id == nullptr || node_id[0] == '\0' || name == nullptr || name[0] == '\0')
    return false;
  for (size_t i = 0; i < node_count_; i++) {
    if (!same_text_(nodes_[i].node_id, node_id))
      continue;
    copy_text_(nodes_[i].name, sizeof(nodes_[i].name), name);
    return true;
  }
  return false;
}

bool HouseModel::remove_node(const char *node_id) {
  if (node_id == nullptr || node_id[0] == '\0')
    return false;

  size_t remove_index = MAX_NODES;
  for (size_t i = 0; i < node_count_; i++) {
    if (same_text_(nodes_[i].node_id, node_id)) {
      remove_index = i;
      break;
    }
  }
  if (remove_index >= node_count_)
    return false;

  for (size_t i = remove_index; i + 1 < node_count_; i++)
    nodes_[i] = nodes_[i + 1];
  nodes_[node_count_ - 1] = {};
  node_count_--;

  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled)
      continue;
    if (zones_[i].node_index == remove_index) {
      zones_[i].enabled = false;
    } else if (zones_[i].node_index > remove_index) {
      zones_[i].node_index--;
    }
  }
  return true;
}

bool HouseModel::mark_node_seen(size_t node_index, uint32_t now_ms) {
  if (node_index >= node_count_)
    return false;
  nodes_[node_index].last_seen_ms = now_ms;
  nodes_[node_index].reachable = true;
  return true;
}

bool HouseModel::mark_node_unreachable(size_t node_index, uint32_t now_ms) {
  if (node_index >= node_count_)
    return false;
  nodes_[node_index].reachable = false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || zones_[i].node_index != node_index)
      continue;
    copy_text_(live_[i].status, sizeof(live_[i].status), "stale");
    live_[i].fresh = false;
    live_[i].updated_at_ms = now_ms;
  }
  return true;
}

bool HouseModel::update_node_metadata(size_t node_index, const char *model, const char *firmware,
                                      const char *fallback_ip) {
  if (node_index >= node_count_)
    return false;
  if (model != nullptr && model[0] != '\0')
    copy_text_(nodes_[node_index].model, sizeof(nodes_[node_index].model), model);
  if (firmware != nullptr && firmware[0] != '\0')
    copy_text_(nodes_[node_index].firmware, sizeof(nodes_[node_index].firmware), firmware);
  if (fallback_ip != nullptr && fallback_ip[0] != '\0')
    copy_text_(nodes_[node_index].fallback_ip, sizeof(nodes_[node_index].fallback_ip), fallback_ip);
  return true;
}

bool HouseModel::update_node_identity(size_t node_index, const char *pairing_fingerprint) {
  if (node_index >= node_count_)
    return false;
  if (pairing_fingerprint != nullptr && pairing_fingerprint[0] != '\0')
    copy_text_(nodes_[node_index].pairing_fingerprint,
               sizeof(nodes_[node_index].pairing_fingerprint), pairing_fingerprint);
  return true;
}

bool HouseModel::update_node_trust(const char *node_id, NodeTrust trust) {
  if (node_id == nullptr || node_id[0] == '\0')
    return false;
  for (size_t i = 0; i < node_count_; i++) {
    if (!same_text_(nodes_[i].node_id, node_id))
      continue;
    if (trust == NodeTrust::TRUSTED && nodes_[i].pairing_fingerprint[0] == '\0')
      return false;
    nodes_[i].trust = trust;
    return true;
  }
  return false;
}

bool HouseModel::is_node_stale(size_t node_index, uint32_t now_ms) const {
  if (node_index >= node_count_)
    return true;
  const PairedNode &node = nodes_[node_index];
  if (!node.reachable || node.last_seen_ms == 0)
    return true;
  if (now_ms < node.last_seen_ms)
    return false;
  return (now_ms - node.last_seen_ms) > node_stale_after_ms_;
}

bool HouseModel::bind_zone(const char *room_id, const char *room_name, size_t node_index, size_t zone_index) {
  return bind_zone_with_source(room_id, room_name, node_index, zone_index, ZoneNameSource::TOUCH);
}

bool HouseModel::bind_zone_with_source(const char *room_id, const char *room_name, size_t node_index,
                                       size_t zone_index, ZoneNameSource source) {
  if (room_id == nullptr || room_id[0] == '\0' || node_index >= node_count_ || zone_index >= ZONES_PER_NODE)
    return false;

  for (size_t i = 0; i < zone_count_; i++) {
    if (zones_[i].node_index != node_index || zones_[i].zone_index != zone_index)
      continue;
    // Polling may rediscover the same binding, but another logical room may
    // never claim this physical valve loop.
    if (!same_text_(zones_[i].room_id, room_id) || !zones_[i].enabled)
      return false;
    if (source == ZoneNameSource::TOUCH || zones_[i].name_source != ZoneNameSource::TOUCH) {
      copy_text_(zones_[i].room_name, sizeof(zones_[i].room_name), room_name);
      zones_[i].name_source = source;
      LogicalRoom *room = ensure_room_(room_id, room_name, source);
      if (room == nullptr)
        return false;
    }
    return true;
  }

  LogicalRoom *room = ensure_room_(room_id, room_name, source);
  if (room == nullptr || zone_count_ >= MAX_HOUSE_ZONES)
    return false;

  const size_t index = zone_count_++;
  ZoneBinding &zone = zones_[index];
  copy_text_(zone.room_id, sizeof(zone.room_id), room_id);
  copy_text_(zone.room_name, sizeof(zone.room_name), room->room_name);
  make_loop_id_(zone.loop_id, sizeof(zone.loop_id), nodes_[node_index].node_id, zone_index);
  copy_text_(zone.node_id, sizeof(zone.node_id), nodes_[node_index].node_id);
  zone.node_index = static_cast<uint8_t>(node_index);
  zone.zone_index = static_cast<uint8_t>(zone_index);
  zone.name_source = source;
  zone.enabled = true;
  zone.commissioned = true;
  if (room->primary_loop_id[0] == '\0')
    copy_text_(room->primary_loop_id, sizeof(room->primary_loop_id), zone.loop_id);
  live_[index] = {};
  copy_text_(live_[index].room_id, sizeof(live_[index].room_id), room_id);
  return true;
}

bool HouseModel::remove_loop(const char *loop_id) {
  if (loop_id == nullptr || loop_id[0] == '\0')
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!same_text_(zones_[i].loop_id, loop_id))
      continue;
    LogicalRoom *room = find_room_(zones_[i].room_id);
    zones_[i].enabled = false;
    zones_[i].commissioned = false;
    history_[i] = {};
    live_[i] = {};
    if (room != nullptr && same_text_(room->primary_loop_id, loop_id)) {
      room->primary_loop_id[0] = '\0';
      for (size_t candidate = 0; candidate < zone_count_; candidate++) {
        if (zones_[candidate].enabled && zones_[candidate].commissioned &&
            same_text_(zones_[candidate].room_id, room->room_id)) {
          copy_text_(room->primary_loop_id, sizeof(room->primary_loop_id), zones_[candidate].loop_id);
          break;
        }
      }
    }
    return true;
  }
  return false;
}

bool HouseModel::set_room_geometry(const char *room_id, float total_area_m2, float physical_weight,
                                   bool include_in_house_temperature) {
  LogicalRoom *room = find_room_(room_id);
  if (room == nullptr || !std::isfinite(total_area_m2) || total_area_m2 < 0.0f ||
      !std::isfinite(physical_weight) || physical_weight < 0.0f)
    return false;
  room->total_area_m2 = total_area_m2;
  room->physical_weight = physical_weight;
  room->include_in_house_temperature = include_in_house_temperature;
  return true;
}

bool HouseModel::set_loop_served_area(const char *loop_id, float served_area_m2) {
  if (loop_id == nullptr || !std::isfinite(served_area_m2) || served_area_m2 < 0.0f)
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (same_text_(zones_[i].loop_id, loop_id)) {
      zones_[i].served_area_m2 = served_area_m2;
      return true;
    }
  }
  return false;
}

bool HouseModel::update_zone_name_from_v6_by_binding(size_t node_index, size_t zone_index,
                                                     const char *room_name) {
  if (node_index >= node_count_ || zone_index >= ZONES_PER_NODE || room_name == nullptr ||
      room_name[0] == '\0')
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || zones_[i].node_index != node_index || zones_[i].zone_index != zone_index)
      continue;
    if (zones_[i].name_source == ZoneNameSource::TOUCH)
      return false;
    copy_text_(zones_[i].room_name, sizeof(zones_[i].room_name), room_name);
    zones_[i].name_source = ZoneNameSource::V6;
    // The dashboard renders logical rooms from the separate room list. Keep
    // that aggregate in sync as well, otherwise a V6 name updates the loop
    // but the UI continues to show the old generated room name.
    LogicalRoom *room = find_room_(zones_[i].room_id);
    bool touch_owned = false;
    if (room != nullptr) {
      for (size_t candidate = 0; candidate < zone_count_; candidate++) {
        if (zones_[candidate].enabled && same_text_(zones_[candidate].room_id, room->room_id) &&
            zones_[candidate].name_source == ZoneNameSource::TOUCH) {
          touch_owned = true;
          break;
        }
      }
    }
    if (room != nullptr && !touch_owned) {
      copy_text_(room->room_name, sizeof(room->room_name), room_name);
      room->name_source = ZoneNameSource::V6;
    }
    return true;
  }
  return false;
}

bool HouseModel::update_zone_forecast_profile_by_binding(size_t node_index, size_t zone_index,
                                                         uint8_t exterior_walls, float wind_exposure,
                                                         float solar_gain, uint8_t thermal_lead_h,
                                                         float max_offset_c) {
  if (node_index >= node_count_ || zone_index >= ZONES_PER_NODE)
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || zones_[i].node_index != node_index || zones_[i].zone_index != zone_index)
      continue;
    zones_[i].exterior_walls = exterior_walls & 0x0F;
    zones_[i].wind_exposure = clamp_float_(wind_exposure, 0.0f, 1.0f, zones_[i].wind_exposure);
    zones_[i].solar_gain = clamp_float_(solar_gain, 0.0f, 1.0f, zones_[i].solar_gain);
    zones_[i].thermal_lead_h = thermal_lead_h > 0 ? thermal_lead_h : zones_[i].thermal_lead_h;
    if (zones_[i].thermal_lead_h > 24)
      zones_[i].thermal_lead_h = 24;
    zones_[i].max_offset_c = clamp_float_(max_offset_c, 0.0f, 5.0f, zones_[i].max_offset_c);
    return true;
  }
  return false;
}

bool HouseModel::update_zone_forecast_profile(const char *room_id, uint8_t exterior_walls,
                                              float wind_exposure, float solar_gain,
                                              uint8_t thermal_lead_h, float max_offset_c) {
  if (room_id == nullptr || room_id[0] == '\0')
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!same_text_(zones_[i].room_id, room_id))
      continue;
    return update_zone_forecast_profile_by_binding(zones_[i].node_index, zones_[i].zone_index,
                                                   exterior_walls, wind_exposure, solar_gain,
                                                   thermal_lead_h, max_offset_c);
  }
  return false;
}

bool HouseModel::update_zone_comfort(const char *room_id, float comfort_setpoint_c, uint8_t priority,
                                     float comfort_bias_c) {
  LogicalRoom *room = find_room_(room_id);
  if (room == nullptr)
    return false;
  room->comfort_setpoint_c = clamp_float_(comfort_setpoint_c, 5.0f, 35.0f,
                                          room->comfort_setpoint_c);
  room->comfort_bias_c = clamp_float_(comfort_bias_c, -3.0f, 3.0f, room->comfort_bias_c);
  room->priority = priority > 3 ? 3 : priority;
  bool updated = false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || !same_text_(zones_[i].room_id, room_id))
      continue;
    zones_[i].comfort_setpoint_c = room->comfort_setpoint_c;
    zones_[i].comfort_bias_c = room->comfort_bias_c;
    zones_[i].priority = room->priority;
    updated = true;
  }
  return updated;
}

bool HouseModel::update_zone_schedule(const char *room_id, bool enabled, uint8_t day_mask,
                                      uint16_t start_min, uint16_t end_min, float setpoint_c) {
  LogicalRoom *room = find_room_(room_id);
  if (room == nullptr)
    return false;
  if (start_min > 1439 || end_min > 1440 || start_min >= end_min)
    return false;
  day_mask &= 0x7F;
  if (enabled && day_mask == 0)
    return false;
  room->schedule_enabled = enabled;
  room->schedule_day_mask = day_mask;
  room->schedule_start_min = start_min;
  room->schedule_end_min = end_min;
  room->schedule_setpoint_c = clamp_float_(setpoint_c, 5.0f, 35.0f, room->schedule_setpoint_c);
  bool updated = false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || !same_text_(zones_[i].room_id, room_id))
      continue;
    zones_[i].schedule_enabled = room->schedule_enabled;
    zones_[i].schedule_day_mask = room->schedule_day_mask;
    zones_[i].schedule_start_min = room->schedule_start_min;
    zones_[i].schedule_end_min = room->schedule_end_min;
    zones_[i].schedule_setpoint_c = room->schedule_setpoint_c;
    updated = true;
  }
  return updated;
}

RoomUpdateResult HouseModel::apply_room_update(const char *room_id, const RoomUpdate &update,
                                               uint32_t *new_revision) {
  const size_t room_index = room_index_(room_id);
  if (room_index >= room_count_)
    return RoomUpdateResult::NOT_FOUND;
  if (update.expected_revision != room_revisions_[room_index])
    return RoomUpdateResult::STALE_REVISION;
  if (!std::isfinite(update.total_area_m2) || update.total_area_m2 <= 0.0f ||
      !std::isfinite(update.physical_weight) || update.physical_weight < 0.0f ||
      !std::isfinite(update.comfort_setpoint_c) || update.comfort_setpoint_c < 5.0f ||
      update.comfort_setpoint_c > 35.0f || !std::isfinite(update.comfort_bias_c) ||
      update.comfort_bias_c < -3.0f || update.comfort_bias_c > 3.0f ||
      !std::isfinite(update.schedule_setpoint_c) || update.schedule_setpoint_c < 5.0f ||
      update.schedule_setpoint_c > 35.0f || update.priority > 3 || update.schedule_start_min > 1439 ||
      update.schedule_end_min > 1440 || update.schedule_start_min >= update.schedule_end_min ||
      (update.schedule_enabled && (update.schedule_day_mask & 0x7F) == 0) ||
      !std::isfinite(update.wind_exposure) || update.wind_exposure < 0.0f || update.wind_exposure > 1.0f ||
      !std::isfinite(update.solar_gain) || update.solar_gain < 0.0f || update.solar_gain > 1.0f ||
      update.thermal_lead_h == 0 || update.thermal_lead_h > 24 || !std::isfinite(update.max_offset_c) ||
      update.max_offset_c < 0.0f || update.max_offset_c > 5.0f)
    return RoomUpdateResult::INVALID;
  bool has_loop = false;
  for (size_t i = 0; i < zone_count_; i++)
    has_loop = has_loop || (zones_[i].enabled && same_text_(zones_[i].room_id, room_id));
  if (!has_loop)
    return RoomUpdateResult::NOT_FOUND;

  // All validation is complete before mutating the room or any of its loops.
  LogicalRoom &room = rooms_[room_index];
  room.total_area_m2 = update.total_area_m2;
  room.physical_weight = update.physical_weight;
  room.include_in_house_temperature = update.include_in_house_temperature;
  room.comfort_setpoint_c = update.comfort_setpoint_c;
  room.comfort_bias_c = update.comfort_bias_c;
  room.priority = update.priority;
  room.schedule_enabled = update.schedule_enabled;
  room.schedule_day_mask = update.schedule_day_mask & 0x7F;
  room.schedule_start_min = update.schedule_start_min;
  room.schedule_end_min = update.schedule_end_min;
  room.schedule_setpoint_c = update.schedule_setpoint_c;
  for (size_t i = 0; i < zone_count_; i++) {
    ZoneBinding &zone = zones_[i];
    if (!zone.enabled || !same_text_(zone.room_id, room_id))
      continue;
    zone.comfort_setpoint_c = room.comfort_setpoint_c;
    zone.comfort_bias_c = room.comfort_bias_c;
    zone.priority = room.priority;
    zone.schedule_enabled = room.schedule_enabled;
    zone.schedule_day_mask = room.schedule_day_mask;
    zone.schedule_start_min = room.schedule_start_min;
    zone.schedule_end_min = room.schedule_end_min;
    zone.schedule_setpoint_c = room.schedule_setpoint_c;
    zone.exterior_walls = update.exterior_walls & 0x0F;
    zone.wind_exposure = update.wind_exposure;
    zone.solar_gain = update.solar_gain;
    zone.thermal_lead_h = update.thermal_lead_h;
    zone.max_offset_c = update.max_offset_c;
  }
  if (room_revisions_[room_index] < UINT32_MAX)
    room_revisions_[room_index]++;
  if (new_revision != nullptr)
    *new_revision = room_revisions_[room_index];
  return RoomUpdateResult::STORED;
}

uint32_t HouseModel::room_revision(const char *room_id) const {
  const size_t index = room_index_(room_id);
  return index < room_count_ ? room_revisions_[index] : 0;
}

bool HouseModel::update_zone_live(const char *room_id, float temperature_c, bool has_temperature,
                                  float setpoint_c, bool has_setpoint, const char *status,
                                  bool fresh, uint32_t now_ms, float valve_pct, bool has_valve) {
  if (room_id == nullptr || room_id[0] == '\0')
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!same_text_(zones_[i].room_id, room_id))
      continue;
    copy_text_(live_[i].room_id, sizeof(live_[i].room_id), room_id);
    live_[i].temperature_c = temperature_c;
    live_[i].setpoint_c = setpoint_c;
    live_[i].valve_pct = clamp_float_(valve_pct, 0.0f, 100.0f, 0.0f);
    live_[i].has_temperature = has_temperature;
    live_[i].has_setpoint = has_setpoint;
    live_[i].has_valve = has_valve;
    copy_text_(live_[i].status, sizeof(live_[i].status), status != nullptr && status[0] != '\0' ? status : "unknown");
    live_[i].fresh = fresh;
    live_[i].updated_at_ms = now_ms;
    record_zone_history_(i, temperature_c, live_[i].status, fresh && has_temperature, now_ms);
    return true;
  }
  return false;
}

bool HouseModel::update_zone_live_by_binding(size_t node_index, size_t zone_index,
                                             float temperature_c, bool has_temperature,
                                             float setpoint_c, bool has_setpoint, const char *status,
                                             bool fresh, uint32_t now_ms, float valve_pct, bool has_valve) {
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || zones_[i].node_index != node_index || zones_[i].zone_index != zone_index)
      continue;
    copy_text_(live_[i].room_id, sizeof(live_[i].room_id), zones_[i].room_id);
    live_[i].temperature_c = temperature_c;
    live_[i].setpoint_c = setpoint_c;
    live_[i].valve_pct = clamp_float_(valve_pct, 0.0f, 100.0f, 0.0f);
    live_[i].has_temperature = has_temperature;
    live_[i].has_setpoint = has_setpoint;
    live_[i].has_valve = has_valve;
    copy_text_(live_[i].status, sizeof(live_[i].status), status != nullptr && status[0] != '\0' ? status : "unknown");
    live_[i].fresh = fresh;
    live_[i].updated_at_ms = now_ms;
    record_zone_history_(i, temperature_c, live_[i].status, fresh && has_temperature, now_ms);
    return true;
  }
  return false;
}

ResolvedZone HouseModel::resolve_room(const char *room_id) const {
  if (room_id == nullptr)
    return {};
  for (size_t i = 0; i < zone_count_; i++) {
    if (zones_[i].enabled && same_text_(zones_[i].room_id, room_id)) {
      const size_t node_index = zones_[i].node_index;
      return {node(node_index), &zones_[i], &live_[i]};
    }
  }
  return {};
}

size_t HouseModel::resolve_room_loops(const char *room_id, ResolvedRoomLoop *out, size_t capacity) const {
  if (room_id == nullptr || out == nullptr || capacity == 0 || find_room_(room_id) == nullptr)
    return 0;
  size_t count = 0;
  for (size_t i = 0; i < zone_count_ && count < capacity; i++) {
    if (!zones_[i].enabled || !zones_[i].commissioned || !same_text_(zones_[i].room_id, room_id))
      continue;
    out[count++] = {node(zones_[i].node_index), &zones_[i], &live_[i]};
  }
  return count;
}

size_t HouseModel::active_zone_count() const {
  size_t total = 0;
  for (size_t i = 0; i < zone_count_; i++) {
    if (zones_[i].enabled)
      total++;
  }
  return total;
}

size_t HouseModel::calling_zone_count() const {
  size_t total = 0;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled)
      continue;
    if (same_text_(live_[i].status, "heat") || same_text_(live_[i].status, "call") ||
        same_text_(live_[i].status, "preheat"))
      total++;
  }
  return total;
}

size_t HouseModel::stale_zone_count() const {
  size_t total = 0;
  for (size_t i = 0; i < zone_count_; i++) {
    if (zones_[i].enabled && (!live_[i].fresh || same_text_(live_[i].status, "stale")))
      total++;
  }
  return total;
}

float HouseModel::average_comfort_setpoint_c() const {
  float sum = 0.0f;
  size_t count = 0;
  for (size_t i = 0; i < room_count_; i++) {
    if (!rooms_[i].enabled)
      continue;
    sum += clamp_float_(rooms_[i].comfort_setpoint_c + rooms_[i].comfort_bias_c, 5.0f, 35.0f,
                        rooms_[i].comfort_setpoint_c);
    count++;
  }
  return count > 0 ? sum / static_cast<float>(count) : 0.0f;
}

float HouseModel::effective_comfort_setpoint_c(const ZoneBinding &zone) {
  return effective_comfort(zone, false, 0, 0).setpoint_c;
}

EffectiveComfort HouseModel::effective_comfort(const ZoneBinding &zone, bool time_valid,
                                               uint8_t day_index, uint16_t minute_of_day) {
  EffectiveComfort result{};
  result.time_valid = time_valid;
  result.setpoint_c = clamp_float_(zone.comfort_setpoint_c + zone.comfort_bias_c, 5.0f, 35.0f,
                                   zone.comfort_setpoint_c);
  copy_text_(result.source, sizeof(result.source), "comfort");
  float scheduled = 0.0f;
  if (time_valid && scheduled_comfort_setpoint_c(zone, day_index, minute_of_day, &scheduled)) {
    result.setpoint_c = scheduled;
    result.schedule_active = true;
    copy_text_(result.source, sizeof(result.source), "schedule");
  }
  return result;
}

bool HouseModel::scheduled_comfort_setpoint_c(const ZoneBinding &zone, uint8_t day_index,
                                              uint16_t minute_of_day, float *out) {
  if (!zone.enabled || !zone.schedule_enabled || day_index > 6 || minute_of_day > 1439)
    return false;
  if ((zone.schedule_day_mask & (1u << day_index)) == 0)
    return false;
  if (minute_of_day < zone.schedule_start_min || minute_of_day >= zone.schedule_end_min)
    return false;
  if (out != nullptr)
    *out = clamp_float_(zone.schedule_setpoint_c + zone.comfort_bias_c, 5.0f, 35.0f,
                        zone.schedule_setpoint_c);
  return true;
}

float HouseModel::learned_comfort_offset_c(const ZoneBinding &zone, const ZoneLiveState *live,
                                           float base_setpoint_c) {
  if (live == nullptr || !live->fresh || !live->has_temperature ||
      !std::isfinite(live->temperature_c) || !std::isfinite(base_setpoint_c))
    return 0.0f;
  if (zone.thermal_samples < 12 || !std::isfinite(zone.learned_heat_gain_c_per_h) ||
      zone.learned_heat_gain_c_per_h < 0.05f || zone.learned_heat_gain_c_per_h > 0.35f)
    return 0.0f;

  const float deficit_c = base_setpoint_c - live->temperature_c;
  if (deficit_c < 0.4f)
    return 0.0f;

  const float cap_c = clamp_float_(zone.max_offset_c * 0.35f, 0.0f, 0.5f, 0.0f);
  return clamp_float_((deficit_c - 0.2f) * 0.25f, 0.0f, cap_c, 0.0f);
}

TargetResolution HouseModel::resolve_target(const TargetResolverInput &input) {
  TargetResolution result{};
  const float lower = std::isfinite(input.dispatch_min_c) ? input.dispatch_min_c : 5.0f;
  const float upper = std::isfinite(input.dispatch_max_c) && input.dispatch_max_c >= lower
                          ? input.dispatch_max_c : 35.0f;
  result.fallback_base_target_c = clamp_float_(input.fallback_base_target_c, lower, upper, 21.0f);
  result.touch_available = input.touch_available;
  result.base_target_c = input.touch_available
                             ? clamp_float_(input.touch_target_c, lower, upper, result.fallback_base_target_c)
                             : result.fallback_base_target_c;
  copy_text_(result.base_source, sizeof(result.base_source),
             input.touch_available ? "touch" : "fallback");
  if (input.command.has_manual_offset) {
    result.manual_modifier_c = input.command.manual_offset_c;
    copy_text_(result.modifier_source, sizeof(result.modifier_source), "manual");
  } else if (input.command.has_forecast_offset) {
    result.distribution_modifier_c = input.command.forecast_offset_c;
    copy_text_(result.modifier_source, sizeof(result.modifier_source), "forecast");
  }
  if (input.learned_confident)
    result.learned_modifier_c = input.learned_modifier_c;
  result.pre_v6_target_c = result.base_target_c + result.manual_modifier_c +
                           result.distribution_modifier_c + result.learned_modifier_c;
  result.dispatch_target_c = clamp_float_(result.pre_v6_target_c, lower, upper, result.base_target_c);
  return result;
}

uint8_t HouseModel::learned_thermal_lead_h(const ZoneBinding &zone) {
  if (zone.thermal_samples < 6 || !std::isfinite(zone.learned_heat_gain_c_per_h) ||
      zone.learned_heat_gain_c_per_h < 0.05f)
    return 0;

  const float hours_to_gain_1c = std::ceil(1.0f / zone.learned_heat_gain_c_per_h);
  if (!std::isfinite(hours_to_gain_1c) || hours_to_gain_1c < 1.0f)
    return 1;
  if (hours_to_gain_1c > 24.0f)
    return 24;
  return static_cast<uint8_t>(hours_to_gain_1c);
}

uint8_t HouseModel::active_thermal_lead_h(const ZoneBinding &zone) {
  const uint8_t configured = zone.thermal_lead_h == 0 ? 4 : zone.thermal_lead_h;
  const uint8_t learned = learned_thermal_lead_h(zone);
  const uint8_t active = learned > configured ? learned : configured;
  return active > 24 ? 24 : active;
}

StrategySnapshot HouseModel::strategy_snapshot() const {
  return strategy_snapshot(false, 0, 0);
}

StrategySnapshot HouseModel::strategy_snapshot(bool time_valid, uint8_t day_index,
                                               uint16_t minute_of_day) const {
  StrategySnapshot snapshot{};

  float weighted_temp_sum = 0.0f;
  float weighted_demand_sum = 0.0f;
  float weighted_target_sum = 0.0f;
  float weight_sum = 0.0f;
  float preview_temperature_sum = 0.0f;
  size_t preview_count = 0;
  float preview_setpoint_sum = 0.0f;
  size_t preview_setpoint_count = 0;
  float best_weighted_deficit = 0.0f;
  float comfort_sum = 0.0f;
  size_t comfort_count = 0;
  bool contributing_nodes[MAX_NODES]{};
  for (size_t node_index = 0; node_index < node_count_; node_index++) {
    bool serves_included_room = false;
    for (size_t loop_index = 0; loop_index < zone_count_; loop_index++) {
      if (zones_[loop_index].enabled && zones_[loop_index].commissioned &&
          zones_[loop_index].node_index == node_index) {
        const LogicalRoom *room = find_room_(zones_[loop_index].room_id);
        serves_included_room = room != nullptr && room->enabled && room->include_in_house_temperature;
        if (serves_included_room)
          break;
      }
    }
    if (serves_included_room)
      snapshot.expected_manifolds++;
  }

  for (size_t room_index = 0; room_index < room_count_; room_index++) {
    const LogicalRoom &room = rooms_[room_index];
    if (!room.enabled)
      continue;
    const ZoneBinding *primary = nullptr;
    const ZoneLiveState *live = nullptr;
    for (size_t loop_index = 0; loop_index < zone_count_; loop_index++) {
      if (zones_[loop_index].enabled && zones_[loop_index].commissioned &&
          same_text_(zones_[loop_index].room_id, room.room_id) &&
          same_text_(zones_[loop_index].loop_id, room.primary_loop_id)) {
        primary = &zones_[loop_index];
        live = &live_[loop_index];
        break;
      }
    }
    if (primary == nullptr)
      continue;
    const EffectiveComfort effective = effective_comfort(*primary, time_valid,
                                                         day_index, minute_of_day);
    comfort_sum += effective.setpoint_c;
    comfort_count++;
    if (live != nullptr && live->fresh && live->has_temperature &&
        std::isfinite(live->temperature_c)) {
      preview_temperature_sum += live->temperature_c;
      preview_count++;
    }
    if (live != nullptr && live->fresh && live->has_setpoint &&
        std::isfinite(live->setpoint_c) && live->setpoint_c >= 5.0f &&
        live->setpoint_c <= 35.0f) {
      preview_setpoint_sum += live->setpoint_c;
      preview_setpoint_count++;
    }
    const float weight = room.physical_weight > 0.0f ? room.physical_weight : room.total_area_m2;
    if (!room.include_in_house_temperature || !std::isfinite(weight) || weight <= 0.0f)
      continue;
    snapshot.expected_area_m2 += weight;
    if (live == nullptr || !live->fresh || !live->has_temperature || !std::isfinite(live->temperature_c)) {
      snapshot.missing_rooms++;
      snapshot.missing_area_m2 += weight;
      continue;
    }
    weighted_temp_sum += live->temperature_c * weight;
    weight_sum += weight;
    weighted_target_sum += effective.setpoint_c * weight;
    snapshot.target_contributing_area_m2 += weight;
    if (snapshot.house_target_source[0] == '\0' || std::strcmp(snapshot.house_target_source, "none") == 0)
      copy_text_(snapshot.house_target_source, sizeof(snapshot.house_target_source), effective.source);
    else if (std::strcmp(snapshot.house_target_source, effective.source) != 0)
      copy_text_(snapshot.house_target_source, sizeof(snapshot.house_target_source), "mixed");
    snapshot.contributing_zones++;
    snapshot.contributing_rooms++;
    snapshot.contributing_area_m2 += weight;
    if (primary->node_index < MAX_NODES)
      contributing_nodes[primary->node_index] = true;

    const float deficit = effective.setpoint_c - live->temperature_c;
    if (deficit > 0.0f) {
      weighted_demand_sum += deficit * weight;
      snapshot.demand_zones++;
      const float weighted_deficit = deficit * weight;
      if (weighted_deficit > best_weighted_deficit) {
        best_weighted_deficit = weighted_deficit;
        snapshot.driver_deficit_c = deficit;
        snapshot.driver_priority = room.priority;
        copy_text_(snapshot.driver_room_id, sizeof(snapshot.driver_room_id), room.room_id);
        copy_text_(snapshot.driver_room_name, sizeof(snapshot.driver_room_name), room.room_name);
      }
    }
  }

  if (comfort_count > 0)
    snapshot.comfort_average_c = comfort_sum / static_cast<float>(comfort_count);
  if (preview_count > 0) {
    snapshot.has_temperature_preview = true;
    snapshot.temperature_preview_c = preview_temperature_sum / static_cast<float>(preview_count);
    snapshot.preview_zones = preview_count;
  }
  if (preview_setpoint_count > 0) {
    snapshot.has_setpoint_preview = true;
    snapshot.setpoint_preview_c = preview_setpoint_sum / static_cast<float>(preview_setpoint_count);
    snapshot.setpoint_preview_zones = preview_setpoint_count;
  }
  if (weight_sum > 0.0f) {
    snapshot.physical_temperature_c = weighted_temp_sum / weight_sum;
    snapshot.comfort_demand_c = weighted_demand_sum / weight_sum;
    snapshot.has_house_target = true;
    snapshot.house_target_c = weighted_target_sum / weight_sum;
  }
  if (snapshot.expected_area_m2 > 0.0f) {
    snapshot.coverage_ratio = snapshot.contributing_area_m2 / snapshot.expected_area_m2;
    snapshot.coverage_healthy = snapshot.coverage_ratio >= minimum_area_coverage_;
  }
  for (size_t node_index = 0; node_index < node_count_; node_index++) {
    if (contributing_nodes[node_index])
      snapshot.contributing_manifolds++;
  }
  snapshot.manifolds_healthy = allow_degraded_manifolds_ || snapshot.expected_manifolds < 2 ||
                               snapshot.contributing_manifolds >= snapshot.expected_manifolds;
  if (snapshot.coverage_healthy && snapshot.manifolds_healthy) {
    snapshot.has_physical_temperature = true;
    copy_text_(snapshot.quality, sizeof(snapshot.quality), "healthy");
  } else if (weight_sum > 0.0f) {
    copy_text_(snapshot.quality, sizeof(snapshot.quality), "degraded");
  }
  return snapshot;
}

LearningSnapshot HouseModel::learning_snapshot() const {
  LearningSnapshot snapshot;
  float delta_sum = 0.0f;

  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled)
      continue;
    const ZoneHistory &history = history_[i];
    if (!history.has_temperature || history.samples == 0)
      continue;

    snapshot.zones_with_history++;
    snapshot.total_samples += history.samples;
    snapshot.total_calling_samples += history.calling_samples;

    if (history.has_delta) {
      snapshot.zones_with_delta++;
      delta_sum += history.last_delta_c_per_h;
      if (history.last_delta_c_per_h > 0.05f)
        snapshot.warming_zones++;
      else if (history.last_delta_c_per_h < -0.05f)
        snapshot.cooling_zones++;
    }
  }

  if (snapshot.total_samples > 0) {
    snapshot.calling_ratio =
        static_cast<float>(snapshot.total_calling_samples) / static_cast<float>(snapshot.total_samples);
  }
  if (snapshot.zones_with_delta > 0) {
    snapshot.average_delta_c_per_h = delta_sum / static_cast<float>(snapshot.zones_with_delta);
  }
  return snapshot;
}

const PairedNode *HouseModel::node(size_t index) const {
  return index < node_count_ ? &nodes_[index] : nullptr;
}

const LogicalRoom *HouseModel::room(size_t index) const {
  return index < room_count_ ? &rooms_[index] : nullptr;
}

const LogicalRoom *HouseModel::room_by_id(const char *room_id) const {
  return find_room_(room_id);
}

const ZoneBinding *HouseModel::zone(size_t index) const {
  return index < zone_count_ ? &zones_[index] : nullptr;
}

const ZoneLiveState *HouseModel::zone_live(size_t index) const {
  return index < zone_count_ ? &live_[index] : nullptr;
}

const ZoneHistory *HouseModel::zone_history(size_t index) const {
  return index < zone_count_ ? &history_[index] : nullptr;
}

void HouseModel::record_zone_history_(size_t zone_index, float temperature_c, const char *status,
                                      bool fresh, uint32_t now_ms) {
  if (zone_index >= zone_count_ || !fresh || !std::isfinite(temperature_c))
    return;

  ZoneHistory &history = history_[zone_index];
  const bool calling = same_text_(status, "heat") || same_text_(status, "call") ||
                       same_text_(status, "preheat");
  if (!history.has_temperature) {
    history.samples = 1;
    history.calling_samples = calling ? 1 : 0;
    history.first_sample_ms = now_ms;
    history.last_sample_ms = now_ms;
    history.min_temperature_c = temperature_c;
    history.max_temperature_c = temperature_c;
    history.average_temperature_c = temperature_c;
    history.last_temperature_c = temperature_c;
    history.last_delta_c_per_h = 0.0f;
    history.has_temperature = true;
    history.has_delta = false;
    return;
  }

  if (now_ms > history.last_sample_ms) {
    const float hours = static_cast<float>(now_ms - history.last_sample_ms) / 3600000.0f;
    if (hours > 0.0f) {
      history.last_delta_c_per_h = (temperature_c - history.last_temperature_c) / hours;
      history.has_delta = true;
      ZoneBinding &zone = zones_[zone_index];
      const uint16_t previous_samples = zone.thermal_samples;
      const float delta = history.last_delta_c_per_h;
      if (calling && delta > 0.02f) {
        zone.learned_heat_gain_c_per_h =
            rolling_average_(zone.learned_heat_gain_c_per_h, delta, previous_samples);
      } else if (!calling && delta < -0.02f) {
        zone.learned_cool_loss_c_per_h =
            rolling_average_(zone.learned_cool_loss_c_per_h, -delta, previous_samples);
      }
      if (zone.thermal_samples < 65535)
        zone.thermal_samples++;
    }
  }
  history.samples++;
  if (calling)
    history.calling_samples++;
  if (temperature_c < history.min_temperature_c)
    history.min_temperature_c = temperature_c;
  if (temperature_c > history.max_temperature_c)
    history.max_temperature_c = temperature_c;
  history.average_temperature_c +=
      (temperature_c - history.average_temperature_c) / static_cast<float>(history.samples);
  history.last_temperature_c = temperature_c;
  history.last_sample_ms = now_ms;
}

bool HouseModel::export_state(PersistedState *out) const {
  if (out == nullptr)
    return false;
  std::memset(out, 0, sizeof(*out));
  out->magic = PERSISTED_STATE_MAGIC;
  out->version = PERSISTED_STATE_VERSION;
  out->node_count = static_cast<uint32_t>(node_count_);
  out->zone_count = static_cast<uint32_t>(zone_count_);
  out->room_count = static_cast<uint32_t>(room_count_);
  for (size_t i = 0; i < node_count_; i++)
    out->nodes[i] = nodes_[i];
  for (size_t i = 0; i < room_count_; i++)
    out->rooms[i] = rooms_[i];
  for (size_t i = 0; i < zone_count_; i++) {
    out->zones[i] = zones_[i];
  }
  return true;
}

bool HouseModel::import_state(const PersistedState &state) {
  if (state.magic != PERSISTED_STATE_MAGIC || state.version != PERSISTED_STATE_VERSION)
    return false;
  if (state.node_count > MAX_NODES || state.zone_count > MAX_HOUSE_ZONES ||
      state.room_count > MAX_HOUSE_ROOMS)
    return false;

  std::memset(nodes_, 0, sizeof(nodes_));
  std::memset(rooms_, 0, sizeof(rooms_));
  std::memset(zones_, 0, sizeof(zones_));
  std::memset(live_, 0, sizeof(live_));
  std::memset(history_, 0, sizeof(history_));
  std::memset(room_revisions_, 0, sizeof(room_revisions_));
  node_count_ = state.node_count;
  zone_count_ = state.zone_count;
  room_count_ = state.room_count;
  for (size_t i = 0; i < node_count_; i++)
    nodes_[i] = state.nodes[i];
  for (size_t i = 0; i < node_count_; i++) {
    if (nodes_[i].name[0] == '\0')
      copy_text_(nodes_[i].name, sizeof(nodes_[i].name), nodes_[i].node_id);
  }
  for (size_t i = 0; i < room_count_; i++) {
    rooms_[i] = state.rooms[i];
    room_revisions_[i] = 1;
  }
  for (size_t i = 0; i < zone_count_; i++) {
    zones_[i] = state.zones[i];
    copy_text_(live_[i].room_id, sizeof(live_[i].room_id), zones_[i].room_id);
    copy_text_(live_[i].status, sizeof(live_[i].status), "unknown");
    if (zones_[i].node_index >= node_count_) {
      zones_[i].enabled = false;
      history_[i] = {};
      continue;
    }
    if (zones_[i].node_id[0] == '\0')
      copy_text_(zones_[i].node_id, sizeof(zones_[i].node_id), nodes_[zones_[i].node_index].node_id);
    if (find_room_(zones_[i].room_id) == nullptr) {
      LogicalRoom *room = ensure_room_(zones_[i].room_id, zones_[i].room_name, zones_[i].name_source);
      if (room == nullptr)
        return false;
      room->comfort_setpoint_c = zones_[i].comfort_setpoint_c;
      room->comfort_bias_c = zones_[i].comfort_bias_c;
      room->schedule_setpoint_c = zones_[i].schedule_setpoint_c;
      room->schedule_start_min = zones_[i].schedule_start_min;
      room->schedule_end_min = zones_[i].schedule_end_min;
      room->schedule_day_mask = zones_[i].schedule_day_mask;
      room->priority = zones_[i].priority;
      room->schedule_enabled = zones_[i].schedule_enabled;
      copy_text_(room->primary_loop_id, sizeof(room->primary_loop_id), zones_[i].loop_id);
    }
  }
  return true;
}

bool CommandLedger::append(const CommandRecord &record) {
  CommandRecord stored = record;
  if (stored.boot_id == 0)
    stored.boot_id = boot_id_;
  records_[next_] = stored;
  next_ = (next_ + 1) % LEDGER_CAPACITY;
  if (count_ < LEDGER_CAPACITY)
    count_++;
  return true;
}

namespace {

bool command_expired_(const CommandRecord &record, uint32_t now_ms, int64_t now_epoch_s) {
  if (now_epoch_s > 0 && record.expires_at_epoch_s > 0)
    return now_epoch_s >= record.expires_at_epoch_s;
  return record.expires_at_ms != 0 &&
         static_cast<int32_t>(now_ms - record.expires_at_ms) >= 0;
}

}  // namespace

size_t CommandLedger::expire_pending(uint32_t now_ms, int64_t now_epoch_s) {
  size_t expired = 0;
  for (size_t i = 0; i < count_; i++) {
    CommandRecord &record = records_[i];
    if ((record.result == CommandResult::PENDING || record.result == CommandResult::ACCEPTED) &&
        command_expired_(record, now_ms, now_epoch_s)) {
      record.result = CommandResult::EXPIRED;
      expired++;
    }
  }
  return expired;
}

size_t CommandLedger::count_result(CommandResult result) const {
  size_t total = 0;
  for (size_t i = 0; i < count_; i++) {
    if (records_[i].result == result)
      total++;
  }
  return total;
}

size_t CommandLedger::count_clamped() const {
  size_t total = 0;
  for (size_t i = 0; i < count_; i++) {
    if (records_[i].clamp_applied)
      total++;
  }
  return total;
}

size_t CommandLedger::count_blocked() const {
  return count_result(CommandResult::BLOCKED_STALE) +
         count_result(CommandResult::BLOCKED_UNREACHABLE) +
         count_result(CommandResult::BLOCKED_UNTRUSTED);
}

bool CommandLedger::has_recent_similar(const char *source, const char *node_id, const char *loop_id,
                                       float requested_offset_c, uint32_t now_ms,
                                       uint32_t min_interval_ms, float epsilon_c,
                                       int64_t now_epoch_s) const {
  if (source == nullptr || source[0] == '\0' || node_id == nullptr || node_id[0] == '\0' ||
      loop_id == nullptr || loop_id[0] == '\0')
    return false;
  for (size_t i = 0; i < count_; i++) {
    const CommandRecord &record = records_[i];
    if (!same_text_(record.source, source))
      continue;
    if (!same_text_(record.node_id, node_id) || !same_text_(record.loop_id, loop_id))
      continue;
    if (record.result != CommandResult::PENDING && record.result != CommandResult::ACCEPTED)
      continue;
    if (command_expired_(record, now_ms, now_epoch_s))
      continue;
    if (min_interval_ms > 0 && static_cast<int32_t>(now_ms - record.created_at_ms) > static_cast<int32_t>(min_interval_ms))
      continue;
    if (std::fabs(record.requested_offset_c - requested_offset_c) <= epsilon_c)
      return true;
  }
  return false;
}

bool CommandLedger::active_offset_for(const char *source, uint8_t node_index, uint8_t zone_index,
                                      uint32_t now_ms, float *offset_c, int64_t now_epoch_s) const {
  if (source == nullptr || source[0] == '\0')
    return false;
  const CommandRecord *best = nullptr;
  for (size_t i = 0; i < count_; i++) {
    const CommandRecord &record = records_[i];
    if (!same_text_(record.source, source))
      continue;
    if (record.node_index != node_index || record.zone_index != zone_index)
      continue;
    if (record.result != CommandResult::PENDING && record.result != CommandResult::ACCEPTED)
      continue;
    if (command_expired_(record, now_ms, now_epoch_s))
      continue;
    if (best == nullptr || static_cast<int32_t>(record.created_at_ms - best->created_at_ms) > 0)
      best = &record;
  }
  if (best == nullptr)
    return false;
  if (offset_c != nullptr)
    *offset_c = best->result == CommandResult::ACCEPTED ? best->accepted_offset_c : best->requested_offset_c;
  return true;
}

CommandOffsetResolution CommandLedger::resolve_command_offset(uint8_t node_index,
                                                              uint8_t zone_index,
                                                              uint32_t now_ms,
                                                              int64_t now_epoch_s) const {
  CommandOffsetResolution resolution{};
  resolution.has_manual_offset =
      active_offset_for("dashboard", node_index, zone_index, now_ms, &resolution.manual_offset_c,
                        now_epoch_s);
  resolution.has_forecast_offset =
      active_offset_for("forecast", node_index, zone_index, now_ms, &resolution.forecast_offset_c,
                        now_epoch_s);
  if (resolution.has_manual_offset) {
    resolution.command_offset_c = resolution.manual_offset_c;
    copy_text_(resolution.command_source, sizeof(resolution.command_source), "manual");
  } else if (resolution.has_forecast_offset) {
    resolution.command_offset_c = resolution.forecast_offset_c;
    copy_text_(resolution.command_source, sizeof(resolution.command_source), "forecast");
  }
  return resolution;
}

const CommandRecord *CommandLedger::latest() const {
  if (count_ == 0)
    return nullptr;
  const size_t latest_index = (next_ + LEDGER_CAPACITY - 1) % LEDGER_CAPACITY;
  return &records_[latest_index];
}

const CommandRecord *CommandLedger::latest_active(uint32_t now_ms, int64_t now_epoch_s) const {
  for (size_t n = 0; n < count_; n++) {
    const size_t index = (next_ + LEDGER_CAPACITY - 1 - n) % LEDGER_CAPACITY;
    const CommandRecord &record = records_[index];
    if (record.result != CommandResult::PENDING && record.result != CommandResult::ACCEPTED)
      continue;
    if (command_expired_(record, now_ms, now_epoch_s))
      continue;
    return &record;
  }
  return nullptr;
}

const CommandRecord *CommandLedger::at(size_t index) const {
  return index < count_ ? &records_[index] : nullptr;
}

bool CommandLedger::export_state(PersistedLedger *out) const {
  if (out == nullptr)
    return false;
  std::memset(out, 0, sizeof(*out));
  out->magic = PERSISTED_LEDGER_MAGIC;
  out->version = PERSISTED_LEDGER_VERSION;
  out->boot_id = boot_id_;
  out->next = static_cast<uint32_t>(next_);
  out->count = static_cast<uint32_t>(count_);
  for (size_t i = 0; i < LEDGER_CAPACITY; i++)
    out->records[i] = records_[i];
  return true;
}

bool CommandLedger::import_state(const PersistedLedger &state, uint32_t current_boot_id,
                                 int64_t now_epoch_s) {
  if (state.magic != PERSISTED_LEDGER_MAGIC || state.version != PERSISTED_LEDGER_VERSION)
    return false;
  if (state.next >= LEDGER_CAPACITY || state.count > LEDGER_CAPACITY)
    return false;
  std::memset(records_, 0, sizeof(records_));
  next_ = state.next;
  count_ = state.count;
  boot_id_ = current_boot_id;
  for (size_t i = 0; i < LEDGER_CAPACITY; i++)
    records_[i] = state.records[i];
  for (size_t i = 0; i < count_; i++) {
    CommandRecord &record = records_[i];
    if (record.result != CommandResult::PENDING && record.result != CommandResult::ACCEPTED)
      continue;
    if (current_boot_id == 0 || record.boot_id == 0 || record.boot_id != current_boot_id ||
        command_expired_(record, 0, now_epoch_s)) {
      record.result = CommandResult::EXPIRED;
    }
  }
  return true;
}

const char *command_result_name(CommandResult result) {
  switch (result) {
    case CommandResult::ACCEPTED:
      return "accepted";
    case CommandResult::REJECTED:
      return "rejected";
    case CommandResult::EXPIRED:
      return "expired";
    case CommandResult::BLOCKED_STALE:
      return "blocked_stale";
    case CommandResult::BLOCKED_UNREACHABLE:
      return "blocked_unreachable";
    case CommandResult::BLOCKED_UNTRUSTED:
      return "blocked_untrusted";
    case CommandResult::FAILED:
      return "failed";
    default:
      return "pending";
  }
}

const char *node_trust_name(NodeTrust trust) {
  switch (trust) {
    case NodeTrust::UNPAIRED:
      return "unpaired";
    case NodeTrust::PAIRED:
      return "paired";
    case NodeTrust::TRUSTED:
      return "trusted";
  }
  return "unknown";
}

}  // namespace lune_touch
