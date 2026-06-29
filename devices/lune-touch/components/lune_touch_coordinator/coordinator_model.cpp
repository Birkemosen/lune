#include "coordinator_model.h"

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

bool HouseModel::update_zone_live(const char *room_id, float temperature_c, bool has_temperature,
                                  float setpoint_c, bool has_setpoint, const char *status,
                                  bool fresh, uint32_t now_ms) {
  if (room_id == nullptr || room_id[0] == '\0')
    return false;
  for (size_t i = 0; i < zone_count_; i++) {
    if (!same_text_(zones_[i].room_id, room_id))
      continue;
    copy_text_(live_[i].room_id, sizeof(live_[i].room_id), room_id);
    live_[i].temperature_c = temperature_c;
    live_[i].setpoint_c = setpoint_c;
    live_[i].has_temperature = has_temperature;
    live_[i].has_setpoint = has_setpoint;
    copy_text_(live_[i].status, sizeof(live_[i].status), status != nullptr && status[0] != '\0' ? status : "unknown");
    live_[i].fresh = fresh;
    live_[i].updated_at_ms = now_ms;
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

const PairedNode *HouseModel::node(size_t index) const {
  return index < node_count_ ? &nodes_[index] : nullptr;
}

const ZoneBinding *HouseModel::zone(size_t index) const {
  return index < zone_count_ ? &zones_[index] : nullptr;
}

const ZoneLiveState *HouseModel::zone_live(size_t index) const {
  return index < zone_count_ ? &live_[index] : nullptr;
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
  for (size_t i = 0; i < zone_count_; i++)
    out->zones[i] = zones_[i];
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
  node_count_ = state.node_count;
  zone_count_ = state.zone_count;
  for (size_t i = 0; i < node_count_; i++)
    nodes_[i] = state.nodes[i];
  for (size_t i = 0; i < zone_count_; i++) {
    zones_[i] = state.zones[i];
    copy_text_(live_[i].room_id, sizeof(live_[i].room_id), zones_[i].room_id);
    copy_text_(live_[i].status, sizeof(live_[i].status), "unknown");
    if (zones_[i].node_index >= node_count_)
      zones_[i].enabled = false;
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
    default:
      return "pending";
  }
}

}  // namespace lune_touch
