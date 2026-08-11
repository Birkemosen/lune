#pragma once

#include <cstddef>
#include <cstdint>

namespace lune_touch {

static constexpr size_t MAX_NODES = 4;
static constexpr size_t ZONES_PER_NODE = 6;
static constexpr size_t MAX_HOUSE_ZONES = MAX_NODES * ZONES_PER_NODE;
static constexpr size_t MAX_HOUSE_ROOMS = MAX_HOUSE_ZONES;
static constexpr size_t LEDGER_CAPACITY = 32;
static constexpr uint32_t PERSISTED_STATE_MAGIC = 0x4C544348;  // LTCH
static constexpr uint16_t PERSISTED_STATE_VERSION = 12;
static constexpr uint16_t PERSISTED_STATE_VERSION_V11 = 11;
static constexpr uint16_t PERSISTED_STATE_VERSION_V10 = 10;
static constexpr uint16_t PERSISTED_STATE_VERSION_V9 = 9;
static constexpr uint16_t PERSISTED_STATE_VERSION_V8 = 8;
static constexpr uint16_t PERSISTED_STATE_VERSION_V7 = 7;
static constexpr uint16_t PERSISTED_STATE_VERSION_V6 = 6;
static constexpr uint16_t PERSISTED_STATE_VERSION_V5 = 5;
static constexpr uint16_t PERSISTED_STATE_VERSION_V4 = 4;
static constexpr uint16_t PERSISTED_STATE_VERSION_V3 = 3;
static constexpr uint32_t PERSISTED_LEDGER_MAGIC = 0x4C544C47;  // LTLG
static constexpr uint16_t PERSISTED_LEDGER_VERSION = 3;

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
  FAILED = 7,
};

enum class ZoneNameSource : uint8_t {
  GENERATED = 0,
  V6 = 1,
  TOUCH = 2,
};

struct PairedNode {
  char node_id[24]{};
  char name[48]{};
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
  char loop_id[48]{};
  char node_id[24]{};
  uint8_t node_index{0};
  uint8_t zone_index{0};
  float served_area_m2{0.0f};
  bool commissioned{true};
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
  ZoneNameSource name_source{ZoneNameSource::GENERATED};
  uint16_t thermal_samples{0};
  float learned_heat_gain_c_per_h{0.0f};
  float learned_cool_loss_c_per_h{0.0f};
  bool enabled{false};
  bool schedule_enabled{false};
};

struct LogicalRoom {
  char room_id[32]{};
  char room_name[48]{};
  char primary_loop_id[48]{};
  float total_area_m2{0.0f};
  float physical_weight{0.0f};
  float comfort_setpoint_c{21.0f};
  float comfort_bias_c{0.0f};
  float schedule_setpoint_c{21.0f};
  uint16_t schedule_start_min{360};
  uint16_t schedule_end_min{1320};
  uint8_t schedule_day_mask{0x7F};
  uint8_t priority{1};
  ZoneNameSource name_source{ZoneNameSource::GENERATED};
  bool enabled{false};
  bool include_in_house_temperature{true};
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

struct ResolvedRoomLoop {
  const PairedNode *node{nullptr};
  const ZoneBinding *binding{nullptr};
  const ZoneLiveState *live{nullptr};
};

struct StrategySnapshot {
  bool has_physical_temperature{false};
  float physical_temperature_c{0.0f};
  // Diagnostic-only value from fresh primary zone sensors. This may be
  // available while the safety-gated physical aggregate is unavailable (for
  // example during commissioning before room geometry is configured).
  bool has_temperature_preview{false};
  float temperature_preview_c{0.0f};
  size_t preview_zones{0};
  bool has_setpoint_preview{false};
  float setpoint_preview_c{0.0f};
  size_t setpoint_preview_zones{0};
  bool has_house_target{false};
  float house_target_c{0.0f};
  float target_contributing_area_m2{0.0f};
  char house_target_source[12]{"none"};
  float comfort_average_c{0.0f};
  float comfort_demand_c{0.0f};
  size_t contributing_zones{0};
  size_t contributing_rooms{0};
  size_t missing_rooms{0};
  float contributing_area_m2{0.0f};
  float missing_area_m2{0.0f};
  float expected_area_m2{0.0f};
  float coverage_ratio{0.0f};
  bool coverage_healthy{false};
  size_t expected_manifolds{0};
  size_t contributing_manifolds{0};
  bool manifolds_healthy{false};
  char quality[16]{"no_coverage"};
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
  char room_id[32]{};
  char node_id[24]{};
  char loop_id[48]{};
  uint8_t node_index{0};
  uint8_t zone_index{0};
  float requested_offset_c{0.0f};
  float accepted_offset_c{0.0f};
  uint32_t created_at_ms{0};
  uint32_t expires_at_ms{0};
  int64_t created_at_epoch_s{0};
  int64_t expires_at_epoch_s{0};
  uint32_t boot_id{0};
  CommandResult result{CommandResult::PENDING};
  bool clamp_applied{false};
};

struct PersistedState {
  uint32_t magic{PERSISTED_STATE_MAGIC};
  uint16_t version{PERSISTED_STATE_VERSION};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  uint32_t room_count{0};
  PairedNode nodes[MAX_NODES]{};
  LogicalRoom rooms[MAX_HOUSE_ROOMS]{};
  ZoneBinding zones[MAX_HOUSE_ZONES]{};
};

struct PersistedLedger {
  uint32_t magic{PERSISTED_LEDGER_MAGIC};
  uint16_t version{PERSISTED_LEDGER_VERSION};
  uint16_t reserved{0};
  uint32_t boot_id{0};
  uint32_t next{0};
  uint32_t count{0};
  CommandRecord records[LEDGER_CAPACITY]{};
};

struct CommandOffsetResolution {
  bool has_manual_offset{false};
  bool has_forecast_offset{false};
  float manual_offset_c{0.0f};
  float forecast_offset_c{0.0f};
  float command_offset_c{0.0f};
  char command_source[20]{"none"};
};

// Pure Touch-side target calculation. The final V6 value can be further
// constrained by its independent local safety clamp and is reported separately.
struct TargetResolverInput {
  float fallback_base_target_c{21.0f};
  float touch_target_c{21.0f};
  bool touch_available{true};
  CommandOffsetResolution command{};
  float learned_modifier_c{0.0f};
  bool learned_confident{false};
  float dispatch_min_c{5.0f};
  float dispatch_max_c{35.0f};
};

struct TargetResolution {
  float fallback_base_target_c{21.0f};
  float base_target_c{21.0f};
  float manual_modifier_c{0.0f};
  float distribution_modifier_c{0.0f};
  float learned_modifier_c{0.0f};
  float pre_v6_target_c{21.0f};
  float dispatch_target_c{21.0f};
  bool touch_available{true};
  char base_source[16]{"touch"};
  char modifier_source[20]{"none"};
};

struct RoomUpdate {
  uint32_t expected_revision{0};
  float total_area_m2{0.0f};
  float physical_weight{0.0f};
  bool include_in_house_temperature{true};
  float comfort_setpoint_c{21.0f};
  float comfort_bias_c{0.0f};
  uint8_t priority{1};
  bool schedule_enabled{false};
  uint8_t schedule_day_mask{0x7F};
  uint16_t schedule_start_min{360};
  uint16_t schedule_end_min{1320};
  float schedule_setpoint_c{21.0f};
  uint8_t exterior_walls{0};
  float wind_exposure{0.5f};
  float solar_gain{0.3f};
  uint8_t thermal_lead_h{4};
  float max_offset_c{1.5f};
};

enum class RoomUpdateResult : uint8_t { STORED, NOT_FOUND, STALE_REVISION, INVALID };

enum class RoomCommandOutcome : uint8_t { ACCEPTED, PARTIAL, FAILED };
inline RoomCommandOutcome room_command_outcome(size_t accepted, size_t required) {
  return accepted == required && required > 0 ? RoomCommandOutcome::ACCEPTED :
         accepted > 0 ? RoomCommandOutcome::PARTIAL : RoomCommandOutcome::FAILED;
}
inline const char *room_command_outcome_name(RoomCommandOutcome value) {
  return value == RoomCommandOutcome::ACCEPTED ? "accepted" :
         value == RoomCommandOutcome::PARTIAL ? "partial" : "failed";
}

class HouseModel {
 public:
  void set_node_stale_after_ms(uint32_t value) { node_stale_after_ms_ = value; }
  void set_minimum_area_coverage(float value) {
    minimum_area_coverage_ = value < 0.0f ? 0.0f : (value > 1.0f ? 1.0f : value);
  }
  void set_allow_degraded_manifolds(bool value) { allow_degraded_manifolds_ = value; }
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
  bool update_node_name(const char *node_id, const char *name);
  bool is_node_stale(size_t node_index, uint32_t now_ms) const;

  bool bind_zone(const char *room_id, const char *room_name, size_t node_index, size_t zone_index);
  bool bind_zone_with_source(const char *room_id, const char *room_name, size_t node_index,
                             size_t zone_index, ZoneNameSource source);
  bool remove_loop(const char *loop_id);
  bool set_room_geometry(const char *room_id, float total_area_m2, float physical_weight,
                         bool include_in_house_temperature);
  bool set_loop_served_area(const char *loop_id, float served_area_m2);
  bool update_zone_name_from_v6_by_binding(size_t node_index, size_t zone_index,
                                           const char *room_name);
  bool update_zone_forecast_profile_by_binding(size_t node_index, size_t zone_index,
                                               uint8_t exterior_walls, float wind_exposure,
                                               float solar_gain, uint8_t thermal_lead_h,
                                               float max_offset_c);
  bool update_zone_forecast_profile(const char *room_id, uint8_t exterior_walls,
                                    float wind_exposure, float solar_gain,
                                    uint8_t thermal_lead_h, float max_offset_c);
  bool update_zone_comfort(const char *room_id, float comfort_setpoint_c, uint8_t priority,
                           float comfort_bias_c = 0.0f);
  bool update_zone_schedule(const char *room_id, bool enabled, uint8_t day_mask,
                            uint16_t start_min, uint16_t end_min, float setpoint_c);
  RoomUpdateResult apply_room_update(const char *room_id, const RoomUpdate &update,
                                     uint32_t *new_revision = nullptr);
  uint32_t room_revision(const char *room_id) const;
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
  size_t resolve_room_loops(const char *room_id, ResolvedRoomLoop *out, size_t capacity) const;
  size_t active_zone_count() const;
  size_t calling_zone_count() const;
  size_t stale_zone_count() const;
  float average_comfort_setpoint_c() const;
  static float effective_comfort_setpoint_c(const ZoneBinding &zone);
  static EffectiveComfort effective_comfort(const ZoneBinding &zone, bool time_valid,
                                            uint8_t day_index, uint16_t minute_of_day);
  static float learned_comfort_offset_c(const ZoneBinding &zone, const ZoneLiveState *live,
                                        float base_setpoint_c);
  static TargetResolution resolve_target(const TargetResolverInput &input);
  static uint8_t learned_thermal_lead_h(const ZoneBinding &zone);
  static uint8_t active_thermal_lead_h(const ZoneBinding &zone);
  StrategySnapshot strategy_snapshot(bool time_valid, uint8_t day_index,
                                     uint16_t minute_of_day) const;
  static bool scheduled_comfort_setpoint_c(const ZoneBinding &zone, uint8_t day_index,
                                           uint16_t minute_of_day, float *out);
  StrategySnapshot strategy_snapshot() const;
  LearningSnapshot learning_snapshot() const;

  const PairedNode *node(size_t index) const;
  const LogicalRoom *room(size_t index) const;
  const LogicalRoom *room_by_id(const char *room_id) const;
  const ZoneBinding *zone(size_t index) const;
  const ZoneLiveState *zone_live(size_t index) const;
  const ZoneHistory *zone_history(size_t index) const;
  size_t node_count() const { return node_count_; }
  size_t zone_count() const { return zone_count_; }
  size_t room_count() const { return room_count_; }
  bool export_state(PersistedState *out) const;
  bool import_state(const PersistedState &state);

 private:
  uint32_t node_stale_after_ms_{300000};
  float minimum_area_coverage_{0.75f};
  bool allow_degraded_manifolds_{false};
  PairedNode nodes_[MAX_NODES]{};
  LogicalRoom rooms_[MAX_HOUSE_ROOMS]{};
  ZoneBinding zones_[MAX_HOUSE_ZONES]{};
  ZoneLiveState live_[MAX_HOUSE_ZONES]{};
  ZoneHistory history_[MAX_HOUSE_ZONES]{};
  uint32_t room_revisions_[MAX_HOUSE_ROOMS]{};  // runtime optimistic-concurrency revisions
  size_t node_count_{0};
  size_t zone_count_{0};
  size_t room_count_{0};

  LogicalRoom *find_room_(const char *room_id);
  const LogicalRoom *find_room_(const char *room_id) const;
  size_t room_index_(const char *room_id) const;
  LogicalRoom *ensure_room_(const char *room_id, const char *room_name, ZoneNameSource source);

  void record_zone_history_(size_t zone_index, float temperature_c, const char *status,
                            bool fresh, uint32_t now_ms);
};

class CommandLedger {
 public:
  void set_boot_id(uint32_t boot_id) { boot_id_ = boot_id; }
  uint32_t boot_id() const { return boot_id_; }
  bool append(const CommandRecord &record);
  size_t expire_pending(uint32_t now_ms, int64_t now_epoch_s = 0);
  size_t count() const { return count_; }
  size_t count_result(CommandResult result) const;
  size_t count_clamped() const;
  size_t count_blocked() const;
  bool has_recent_similar(const char *source, const char *node_id, const char *loop_id,
                          float requested_offset_c, uint32_t now_ms,
                          uint32_t min_interval_ms, float epsilon_c,
                          int64_t now_epoch_s = 0) const;
  bool active_offset_for(const char *source, uint8_t node_index, uint8_t zone_index,
                         uint32_t now_ms, float *offset_c, int64_t now_epoch_s = 0) const;
  CommandOffsetResolution resolve_command_offset(uint8_t node_index, uint8_t zone_index,
                                                 uint32_t now_ms, int64_t now_epoch_s = 0) const;
  const CommandRecord *latest() const;
  const CommandRecord *latest_active(uint32_t now_ms, int64_t now_epoch_s = 0) const;
  const CommandRecord *at(size_t index) const;
  bool export_state(PersistedLedger *out) const;
  bool import_state(const PersistedLedger &state, uint32_t current_boot_id = 0,
                    int64_t now_epoch_s = 0);

 private:
  CommandRecord records_[LEDGER_CAPACITY]{};
  size_t next_{0};
  size_t count_{0};
  uint32_t boot_id_{0};
};

const char *command_result_name(CommandResult result);
const char *node_trust_name(NodeTrust trust);

}  // namespace lune_touch
