#include "coordinator_model.h"

#include <cmath>
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

int HouseModel::upsert_node(const char *node_id, const char *hostname, const char *fallback_ip,
                            const char *model, const char *firmware, NodeTrust trust) {
  if (node_id == nullptr || node_id[0] == '\0')
    return -1;

  for (size_t i = 0; i < node_count_; i++) {
    if (same_text_(nodes_[i].node_id, node_id)) {
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
  copy_text_(node.hostname, sizeof(node.hostname), hostname);
  copy_text_(node.fallback_ip, sizeof(node.fallback_ip), fallback_ip);
  copy_text_(node.model, sizeof(node.model), model);
  copy_text_(node.firmware, sizeof(node.firmware), firmware);
  node.trust = trust;
  node.reachable = false;
  node.last_seen_ms = 0;
  return static_cast<int>(node_count_++);
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
  if (room_id == nullptr || room_id[0] == '\0' || node_index >= node_count_ || zone_index >= ZONES_PER_NODE)
    return false;

  for (size_t i = 0; i < zone_count_; i++) {
    if (same_text_(zones_[i].room_id, room_id)) {
      copy_text_(zones_[i].room_name, sizeof(zones_[i].room_name), room_name);
      zones_[i].node_index = static_cast<uint8_t>(node_index);
      zones_[i].zone_index = static_cast<uint8_t>(zone_index);
      zones_[i].enabled = true;
      return true;
    }
  }

  if (zone_count_ >= MAX_HOUSE_ZONES)
    return false;

  const size_t index = zone_count_++;
  ZoneBinding &zone = zones_[index];
  copy_text_(zone.room_id, sizeof(zone.room_id), room_id);
  copy_text_(zone.room_name, sizeof(zone.room_name), room_name);
  zone.node_index = static_cast<uint8_t>(node_index);
  zone.zone_index = static_cast<uint8_t>(zone_index);
  zone.enabled = true;
  live_[index] = {};
  copy_text_(live_[index].room_id, sizeof(live_[index].room_id), room_id);
  return true;
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

bool HouseModel::update_zone_comfort(const char *room_id, float comfort_setpoint_c, uint8_t priority,
                                     float comfort_bias_c) {
  if (room_id == nullptr || room_id[0] == '\0')
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || !same_text_(zones_[i].room_id, room_id))
      continue;
    zones_[i].comfort_setpoint_c = clamp_float_(comfort_setpoint_c, 5.0f, 35.0f,
                                                zones_[i].comfort_setpoint_c);
    zones_[i].comfort_bias_c = clamp_float_(comfort_bias_c, -3.0f, 3.0f, zones_[i].comfort_bias_c);
    zones_[i].priority = priority > 3 ? 3 : priority;
    return true;
  }
  return false;
}

bool HouseModel::update_zone_schedule(const char *room_id, bool enabled, uint8_t day_mask,
                                      uint16_t start_min, uint16_t end_min, float setpoint_c) {
  if (room_id == nullptr || room_id[0] == '\0')
    return false;
  if (start_min > 1439 || end_min > 1440 || start_min >= end_min)
    return false;
  day_mask &= 0x7F;
  if (enabled && day_mask == 0)
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled || !same_text_(zones_[i].room_id, room_id))
      continue;
    zones_[i].schedule_enabled = enabled;
    zones_[i].schedule_day_mask = day_mask;
    zones_[i].schedule_start_min = start_min;
    zones_[i].schedule_end_min = end_min;
    zones_[i].schedule_setpoint_c = clamp_float_(setpoint_c, 5.0f, 35.0f,
                                                 zones_[i].schedule_setpoint_c);
    return true;
  }
  return false;
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
    return update_zone_live(zones_[i].room_id, temperature_c, has_temperature,
                            setpoint_c, has_setpoint, status, fresh, now_ms, valve_pct, has_valve);
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
  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled)
      continue;
    sum += effective_comfort_setpoint_c(zones_[i]);
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

StrategySnapshot HouseModel::strategy_snapshot() const {
  return strategy_snapshot(false, 0, 0);
}

StrategySnapshot HouseModel::strategy_snapshot(bool time_valid, uint8_t day_index,
                                               uint16_t minute_of_day) const {
  StrategySnapshot snapshot{};

  float weighted_temp_sum = 0.0f;
  float weighted_demand_sum = 0.0f;
  float weight_sum = 0.0f;
  float best_weighted_deficit = 0.0f;
  float comfort_sum = 0.0f;
  size_t comfort_count = 0;

  for (size_t i = 0; i < zone_count_; i++) {
    if (!zones_[i].enabled)
      continue;
    const EffectiveComfort effective = effective_comfort(zones_[i], time_valid,
                                                         day_index, minute_of_day);
    comfort_sum += effective.setpoint_c;
    comfort_count++;
    const ZoneLiveState &live = live_[i];
    if (!live.fresh || !live.has_temperature)
      continue;

    const float priority_weight = 1.0f + static_cast<float>(zones_[i].priority);
    weighted_temp_sum += live.temperature_c * priority_weight;
    weight_sum += priority_weight;
    snapshot.contributing_zones++;

    const float deficit = effective.setpoint_c - live.temperature_c;
    if (deficit > 0.0f) {
      weighted_demand_sum += deficit * priority_weight;
      snapshot.demand_zones++;
      const float weighted_deficit = deficit * priority_weight;
      if (weighted_deficit > best_weighted_deficit) {
        best_weighted_deficit = weighted_deficit;
        snapshot.driver_deficit_c = deficit;
        snapshot.driver_priority = zones_[i].priority;
        copy_text_(snapshot.driver_room_id, sizeof(snapshot.driver_room_id), zones_[i].room_id);
        copy_text_(snapshot.driver_room_name, sizeof(snapshot.driver_room_name), zones_[i].room_name);
      }
    }
  }

  if (comfort_count > 0)
    snapshot.comfort_average_c = comfort_sum / static_cast<float>(comfort_count);
  if (weight_sum > 0.0f) {
    snapshot.has_physical_temperature = true;
    snapshot.physical_temperature_c = weighted_temp_sum / weight_sum;
    snapshot.comfort_demand_c = weighted_demand_sum / weight_sum;
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
  for (size_t i = 0; i < node_count_; i++)
    out->nodes[i] = nodes_[i];
  for (size_t i = 0; i < zone_count_; i++) {
    out->zones[i] = zones_[i];
    out->histories[i] = history_[i];
  }
  return true;
}

bool HouseModel::import_state(const PersistedState &state) {
  if (state.magic != PERSISTED_STATE_MAGIC || state.version != PERSISTED_STATE_VERSION)
    return false;
  if (state.node_count > MAX_NODES || state.zone_count > MAX_HOUSE_ZONES)
    return false;

  std::memset(nodes_, 0, sizeof(nodes_));
  std::memset(zones_, 0, sizeof(zones_));
  std::memset(live_, 0, sizeof(live_));
  std::memset(history_, 0, sizeof(history_));
  node_count_ = state.node_count;
  zone_count_ = state.zone_count;
  for (size_t i = 0; i < node_count_; i++)
    nodes_[i] = state.nodes[i];
  for (size_t i = 0; i < zone_count_; i++) {
    zones_[i] = state.zones[i];
    history_[i] = state.histories[i];
    copy_text_(live_[i].room_id, sizeof(live_[i].room_id), zones_[i].room_id);
    copy_text_(live_[i].status, sizeof(live_[i].status), "unknown");
    if (zones_[i].node_index >= node_count_) {
      zones_[i].enabled = false;
      history_[i] = {};
    }
  }
  return true;
}

bool CommandLedger::append(const CommandRecord &record) {
  records_[next_] = record;
  next_ = (next_ + 1) % LEDGER_CAPACITY;
  if (count_ < LEDGER_CAPACITY)
    count_++;
  return true;
}

size_t CommandLedger::expire_pending(uint32_t now_ms) {
  size_t expired = 0;
  for (size_t i = 0; i < count_; i++) {
    CommandRecord &record = records_[i];
    if (record.result == CommandResult::PENDING && record.expires_at_ms != 0 && now_ms >= record.expires_at_ms) {
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

bool CommandLedger::has_recent_similar(const char *source, uint8_t node_index, uint8_t zone_index,
                                       float requested_offset_c, uint32_t now_ms,
                                       uint32_t min_interval_ms, float epsilon_c) const {
  if (source == nullptr || source[0] == '\0')
    return false;
  for (size_t i = 0; i < count_; i++) {
    const CommandRecord &record = records_[i];
    if (!same_text_(record.source, source))
      continue;
    if (record.node_index != node_index || record.zone_index != zone_index)
      continue;
    if (record.result != CommandResult::PENDING && record.result != CommandResult::ACCEPTED)
      continue;
    if (record.expires_at_ms != 0 && static_cast<int32_t>(now_ms - record.expires_at_ms) >= 0)
      continue;
    if (min_interval_ms > 0 && static_cast<int32_t>(now_ms - record.created_at_ms) > static_cast<int32_t>(min_interval_ms))
      continue;
    if (std::fabs(record.requested_offset_c - requested_offset_c) <= epsilon_c)
      return true;
  }
  return false;
}

const CommandRecord *CommandLedger::latest() const {
  if (count_ == 0)
    return nullptr;
  const size_t latest_index = (next_ + LEDGER_CAPACITY - 1) % LEDGER_CAPACITY;
  return &records_[latest_index];
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
  out->next = static_cast<uint32_t>(next_);
  out->count = static_cast<uint32_t>(count_);
  for (size_t i = 0; i < LEDGER_CAPACITY; i++)
    out->records[i] = records_[i];
  return true;
}

bool CommandLedger::import_state(const PersistedLedger &state) {
  if (state.magic != PERSISTED_LEDGER_MAGIC || state.version != PERSISTED_LEDGER_VERSION)
    return false;
  if (state.next >= LEDGER_CAPACITY || state.count > LEDGER_CAPACITY)
    return false;
  std::memset(records_, 0, sizeof(records_));
  next_ = state.next;
  count_ = state.count;
  for (size_t i = 0; i < LEDGER_CAPACITY; i++)
    records_[i] = state.records[i];
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
