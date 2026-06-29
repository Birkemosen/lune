#pragma once

#include <cstddef>
#include <cstdint>

namespace lune_touch {

static constexpr size_t MAX_NODES = 4;
static constexpr size_t ZONES_PER_NODE = 6;
static constexpr size_t MAX_HOUSE_ZONES = MAX_NODES * ZONES_PER_NODE;
static constexpr size_t LEDGER_CAPACITY = 32;

enum class NodeTrust : uint8_t {
  UNPAIRED = 0,
  PAIRED = 1,
  TRUSTED = 2,
};

enum class CommandResult : uint8_t {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2,
  EXPIRED = 3,
};

struct PairedNode {
  char node_id[24]{};
  char hostname[64]{};
  char fallback_ip[16]{};
  char model[24]{};
  char firmware[24]{};
  NodeTrust trust{NodeTrust::UNPAIRED};
  uint32_t last_seen_ms{0};
  bool reachable{false};
};

struct ZoneBinding {
  char room_id[32]{};
  char room_name[48]{};
  uint8_t node_index{0};
  uint8_t zone_index{0};
  bool enabled{false};
};

struct ResolvedZone {
  const PairedNode *node{nullptr};
  const ZoneBinding *binding{nullptr};
};

struct CommandRecord {
  char request_id[20]{};
  char source[20]{};
  char reason[64]{};
  uint8_t node_index{0};
  uint8_t zone_index{0};
  float requested_offset_c{0.0f};
  float accepted_offset_c{0.0f};
  uint32_t created_at_ms{0};
  uint32_t expires_at_ms{0};
  CommandResult result{CommandResult::PENDING};
  bool clamp_applied{false};
};

class HouseModel {
 public:
  void set_node_stale_after_ms(uint32_t value) { node_stale_after_ms_ = value; }
  uint32_t node_stale_after_ms() const { return node_stale_after_ms_; }

  int upsert_node(const char *node_id, const char *hostname, const char *fallback_ip,
                  const char *model, const char *firmware, NodeTrust trust);
  bool mark_node_seen(size_t node_index, uint32_t now_ms);
  bool is_node_stale(size_t node_index, uint32_t now_ms) const;

  bool bind_zone(const char *room_id, const char *room_name, size_t node_index, size_t zone_index);
  ResolvedZone resolve_room(const char *room_id) const;
  size_t active_zone_count() const;

  const PairedNode *node(size_t index) const;
  const ZoneBinding *zone(size_t index) const;
  size_t node_count() const { return node_count_; }
  size_t zone_count() const { return zone_count_; }

 private:
  uint32_t node_stale_after_ms_{300000};
  PairedNode nodes_[MAX_NODES]{};
  ZoneBinding zones_[MAX_HOUSE_ZONES]{};
  size_t node_count_{0};
  size_t zone_count_{0};
};

class CommandLedger {
 public:
  bool append(const CommandRecord &record);
  size_t expire_pending(uint32_t now_ms);
  size_t count() const { return count_; }
  size_t count_result(CommandResult result) const;
  const CommandRecord *latest() const;
  const CommandRecord *at(size_t index) const;

 private:
  CommandRecord records_[LEDGER_CAPACITY]{};
  size_t next_{0};
  size_t count_{0};
};

const char *command_result_name(CommandResult result);

}  // namespace lune_touch
