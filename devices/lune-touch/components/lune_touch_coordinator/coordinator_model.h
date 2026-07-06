#pragma once

#include <cstddef>
#include <cstdint>

namespace lune_touch {

static constexpr size_t MAX_NODES = 4;
static constexpr size_t ZONES_PER_NODE = 6;
static constexpr size_t MAX_HOUSE_ZONES = MAX_NODES * ZONES_PER_NODE;
static constexpr size_t LEDGER_CAPACITY = 32;
static constexpr uint32_t PERSISTED_STATE_MAGIC = 0x4C544348;  // LTCH
static constexpr uint16_t PERSISTED_STATE_VERSION = 8;
static constexpr uint16_t PERSISTED_STATE_VERSION_V7 = 7;
static constexpr uint16_t PERSISTED_STATE_VERSION_V6 = 6;
static constexpr uint16_t PERSISTED_STATE_VERSION_V5 = 5;
static constexpr uint16_t PERSISTED_STATE_VERSION_V4 = 4;
static constexpr uint16_t PERSISTED_STATE_VERSION_V3 = 3;
static constexpr uint32_t PERSISTED_LEDGER_MAGIC = 0x4C544C47;  // LTLG
static constexpr uint16_t PERSISTED_LEDGER_VERSION = 1;

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
  BLOCKED_STALE = 4,
  BLOCKED_UNREACHABLE = 5,
  BLOCKED_UNTRUSTED = 6,
};

struct PairedNode {
  char node_id[24]{};
  char hostname[64]{};
  char fallback_ip[16]{};
  char model[24]{};
  char firmware[24]{};
  char pairing_fingerprint[24]{};
  NodeTrust trust{NodeTrust::UNPAIRED};
  uint32_t last_seen_ms{0};
  bool reachable{false};
};

struct ZoneBinding {
  char room_id[32]{};
  char room_name[48]{};
  uint8_t node_index{0};
  uint8_t zone_index{0};
  uint8_t exterior_walls{0};
  float wind_exposure{0.5f};
  float solar_gain{0.3f};
  uint8_t thermal_lead_h{4};
  float max_offset_c{1.5f};
  float comfort_setpoint_c{21.0f};
  float comfort_bias_c{0.0f};
  float schedule_setpoint_c{21.0f};
  uint16_t schedule_start_min{360};
  uint16_t schedule_end_min{1320};
  uint8_t schedule_day_mask{0x7F};
  uint8_t priority{1};
  uint16_t thermal_samples{0};
  float learned_heat_gain_c_per_h{0.0f};
  float learned_cool_loss_c_per_h{0.0f};
  bool enabled{false};
  bool schedule_enabled{false};
};

struct ZoneLiveState {
  char room_id[32]{};
  float temperature_c{0.0f};
  float setpoint_c{0.0f};
  float valve_pct{0.0f};
  char status[16]{"unknown"};
  uint32_t updated_at_ms{0};
  bool has_temperature{false};
  bool has_setpoint{false};
  bool has_valve{false};
  bool fresh{false};
};

struct ZoneHistory {
  uint32_t samples{0};
  uint32_t calling_samples{0};
  uint32_t first_sample_ms{0};
  uint32_t last_sample_ms{0};
  float min_temperature_c{0.0f};
  float max_temperature_c{0.0f};
  float average_temperature_c{0.0f};
  float last_temperature_c{0.0f};
  float last_delta_c_per_h{0.0f};
  bool has_temperature{false};
  bool has_delta{false};
};

struct LearningSnapshot {
  uint32_t zones_with_history{0};
  uint32_t total_samples{0};
  uint32_t total_calling_samples{0};
  uint32_t zones_with_delta{0};
  uint32_t warming_zones{0};
  uint32_t cooling_zones{0};
  float calling_ratio{0.0f};
  float average_delta_c_per_h{0.0f};
};

struct EffectiveComfort {
  float setpoint_c{21.0f};
  char source[12]{"comfort"};
  bool time_valid{false};
  bool schedule_active{false};
};

struct ResolvedZone {
  const PairedNode *node{nullptr};
  const ZoneBinding *binding{nullptr};
  const ZoneLiveState *live{nullptr};
};

struct StrategySnapshot {
  bool has_physical_temperature{false};
  float physical_temperature_c{0.0f};
  float comfort_average_c{0.0f};
  float comfort_demand_c{0.0f};
  size_t contributing_zones{0};
  size_t demand_zones{0};
  char driver_room_id[32]{};
  char driver_room_name[48]{};
  float driver_deficit_c{0.0f};
  uint8_t driver_priority{0};
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

struct PersistedState {
  uint32_t magic{PERSISTED_STATE_MAGIC};
  uint16_t version{PERSISTED_STATE_VERSION};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  PairedNode nodes[MAX_NODES]{};
  ZoneBinding zones[MAX_HOUSE_ZONES]{};
  ZoneHistory histories[MAX_HOUSE_ZONES]{};
};

struct PersistedLedger {
  uint32_t magic{PERSISTED_LEDGER_MAGIC};
  uint16_t version{PERSISTED_LEDGER_VERSION};
  uint16_t reserved{0};
  uint32_t next{0};
  uint32_t count{0};
  CommandRecord records[LEDGER_CAPACITY]{};
};

class HouseModel {
 public:
  void set_node_stale_after_ms(uint32_t value) { node_stale_after_ms_ = value; }
  uint32_t node_stale_after_ms() const { return node_stale_after_ms_; }

  int upsert_node(const char *node_id, const char *hostname, const char *fallback_ip,
                  const char *model, const char *firmware, NodeTrust trust);
  bool remove_node(const char *node_id);
  bool mark_node_seen(size_t node_index, uint32_t now_ms);
  bool mark_node_unreachable(size_t node_index, uint32_t now_ms);
  bool update_node_metadata(size_t node_index, const char *model, const char *firmware,
                            const char *fallback_ip);
  bool update_node_identity(size_t node_index, const char *pairing_fingerprint);
  bool update_node_trust(const char *node_id, NodeTrust trust);
  bool is_node_stale(size_t node_index, uint32_t now_ms) const;

  bool bind_zone(const char *room_id, const char *room_name, size_t node_index, size_t zone_index);
  bool update_zone_forecast_profile_by_binding(size_t node_index, size_t zone_index,
                                               uint8_t exterior_walls, float wind_exposure,
                                               float solar_gain, uint8_t thermal_lead_h,
                                               float max_offset_c);
  bool update_zone_comfort(const char *room_id, float comfort_setpoint_c, uint8_t priority,
                           float comfort_bias_c = 0.0f);
  bool update_zone_schedule(const char *room_id, bool enabled, uint8_t day_mask,
                            uint16_t start_min, uint16_t end_min, float setpoint_c);
  bool update_zone_live(const char *room_id, float temperature_c, bool has_temperature,
                        float setpoint_c, bool has_setpoint, const char *status,
                        bool fresh, uint32_t now_ms, float valve_pct = 0.0f,
                        bool has_valve = false);
  bool update_zone_live_by_binding(size_t node_index, size_t zone_index,
                                   float temperature_c, bool has_temperature,
                                   float setpoint_c, bool has_setpoint, const char *status,
                                   bool fresh, uint32_t now_ms, float valve_pct = 0.0f,
                                   bool has_valve = false);
  ResolvedZone resolve_room(const char *room_id) const;
  size_t active_zone_count() const;
  size_t calling_zone_count() const;
  size_t stale_zone_count() const;
  float average_comfort_setpoint_c() const;
  static float effective_comfort_setpoint_c(const ZoneBinding &zone);
  static EffectiveComfort effective_comfort(const ZoneBinding &zone, bool time_valid,
                                            uint8_t day_index, uint16_t minute_of_day);
  StrategySnapshot strategy_snapshot(bool time_valid, uint8_t day_index,
                                     uint16_t minute_of_day) const;
  static bool scheduled_comfort_setpoint_c(const ZoneBinding &zone, uint8_t day_index,
                                           uint16_t minute_of_day, float *out);
  StrategySnapshot strategy_snapshot() const;
  LearningSnapshot learning_snapshot() const;

  const PairedNode *node(size_t index) const;
  const ZoneBinding *zone(size_t index) const;
  const ZoneLiveState *zone_live(size_t index) const;
  const ZoneHistory *zone_history(size_t index) const;
  size_t node_count() const { return node_count_; }
  size_t zone_count() const { return zone_count_; }
  bool export_state(PersistedState *out) const;
  bool import_state(const PersistedState &state);

 private:
  uint32_t node_stale_after_ms_{300000};
  PairedNode nodes_[MAX_NODES]{};
  ZoneBinding zones_[MAX_HOUSE_ZONES]{};
  ZoneLiveState live_[MAX_HOUSE_ZONES]{};
  ZoneHistory history_[MAX_HOUSE_ZONES]{};
  size_t node_count_{0};
  size_t zone_count_{0};

  void record_zone_history_(size_t zone_index, float temperature_c, const char *status,
                            bool fresh, uint32_t now_ms);
};

class CommandLedger {
 public:
  bool append(const CommandRecord &record);
  size_t expire_pending(uint32_t now_ms);
  size_t count() const { return count_; }
  size_t count_result(CommandResult result) const;
  bool has_recent_similar(const char *source, uint8_t node_index, uint8_t zone_index,
                          float requested_offset_c, uint32_t now_ms,
                          uint32_t min_interval_ms, float epsilon_c) const;
  const CommandRecord *latest() const;
  const CommandRecord *at(size_t index) const;
  bool export_state(PersistedLedger *out) const;
  bool import_state(const PersistedLedger &state);

 private:
  CommandRecord records_[LEDGER_CAPACITY]{};
  size_t next_{0};
  size_t count_{0};
};

const char *command_result_name(CommandResult result);
const char *node_trust_name(NodeTrust trust);

}  // namespace lune_touch
