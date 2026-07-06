#include "coordinator_model.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>

using namespace lune_touch;

static int g_failures = 0;

static void expect(bool cond, const char *what) {
  if (cond) {
    std::printf("PASS  %s\n", what);
  } else {
    std::printf("FAIL  %s\n", what);
    g_failures++;
  }
}

static CommandRecord command(const char *id, uint32_t now_ms, uint32_t ttl_ms) {
  CommandRecord record{};
  std::strncpy(record.request_id, id, sizeof(record.request_id) - 1);
  std::strncpy(record.source, "forecast", sizeof(record.source) - 1);
  std::strncpy(record.reason, "wind preload", sizeof(record.reason) - 1);
  record.node_index = 0;
  record.zone_index = 2;
  record.requested_offset_c = 1.25f;
  record.created_at_ms = now_ms;
  record.expires_at_ms = now_ms + ttl_ms;
  return record;
}

static void test_node_staleness() {
  HouseModel model;
  model.set_node_stale_after_ms(300000);

  int ground = model.upsert_node("v6-ground", "lune-v6-ground.local", "192.168.1.51",
                                 "lune-v6", "1.4.0", NodeTrust::TRUSTED);
  expect(ground == 0, "node: first insert returns index 0");
  expect(model.is_node_stale(0, 1000), "node: unseen node is stale");

  expect(model.mark_node_seen(0, 1000), "node: mark seen succeeds");
  expect(!model.is_node_stale(0, 300000), "node: fresh inside stale window");
  expect(model.is_node_stale(0, 302001), "node: stale after window");

  int updated = model.upsert_node("v6-ground", "lune-v6-ground-new.local", "192.168.1.52",
                                  "lune-v6", "1.4.1", NodeTrust::TRUSTED);
  expect(updated == 0 && model.node_count() == 1, "node: upsert updates existing node");
  const PairedNode *node = model.node(0);
  expect(node != nullptr && std::strcmp(node->firmware, "1.4.1") == 0, "node: firmware updated");
  expect(model.update_node_metadata(0, "lune-v6", "1.4.2", "192.168.1.60"),
         "node: metadata update succeeds");
  node = model.node(0);
  expect(node != nullptr && std::strcmp(node->firmware, "1.4.2") == 0 &&
             std::strcmp(node->fallback_ip, "192.168.1.60") == 0,
         "node: metadata refresh updates firmware and ip");
  expect(model.update_node_identity(0, "hv6-001122334455"),
         "node: identity update succeeds");
  node = model.node(0);
  expect(node != nullptr && std::strcmp(node->pairing_fingerprint, "hv6-001122334455") == 0,
         "node: identity fingerprint stored");
  expect(!model.update_node_metadata(2, "lune-v6", "bad", "192.168.1.99"),
         "node: metadata rejects missing index");
  expect(!model.update_node_identity(2, "hv6-missing"),
         "node: identity rejects missing index");
}

static void test_node_unreachable_marks_zones_stale() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.bind_zone("living", "Living", 0, 0);
  model.update_zone_live("living", 21.0f, true, 21.0f, true, "heat", true, 1000);
  expect(model.mark_node_seen(0, 1000), "node: reachable before failure");
  expect(model.mark_node_unreachable(0, 2000), "node: mark unreachable succeeds");
  expect(model.is_node_stale(0, 2000), "node: unreachable is stale");
  ResolvedZone living = model.resolve_room("living");
  expect(living.live != nullptr && !living.live->fresh && std::strcmp(living.live->status, "stale") == 0,
         "node: unreachable marks bound zones stale");
}

static void test_node_trust_updates() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::PAIRED);
  expect(model.node(0) != nullptr && model.node(0)->trust == NodeTrust::PAIRED,
         "trust: node starts paired");
  expect(!model.update_node_trust("v6-a", NodeTrust::TRUSTED),
         "trust: reject trusted promotion without identity");
  expect(model.update_node_identity(0, "hv6-aabbccddeeff"),
         "trust: identity must be stored before promotion");
  expect(model.update_node_trust("v6-a", NodeTrust::TRUSTED),
         "trust: promote identified paired node");
  expect(model.node(0) != nullptr && model.node(0)->trust == NodeTrust::TRUSTED,
         "trust: node promoted to trusted");
  expect(std::strcmp(node_trust_name(model.node(0)->trust), "trusted") == 0,
         "trust: trusted label");
  expect(model.update_node_trust("v6-a", NodeTrust::PAIRED),
         "trust: demote trusted node to paired");
  expect(model.node(0) != nullptr && model.node(0)->trust == NodeTrust::PAIRED,
         "trust: node demoted to paired");
  expect(!model.update_node_trust("missing", NodeTrust::TRUSTED),
         "trust: reject missing node");
}

static void test_zone_registry() {
  HouseModel model;
  int ground = model.upsert_node("v6-ground", "ground.local", "", "lune-v6", "1.4.0", NodeTrust::TRUSTED);
  int first = model.upsert_node("v6-first", "first.local", "", "lune-v6", "1.4.0", NodeTrust::TRUSTED);
  expect(ground == 0 && first == 1, "registry: two V6 nodes inserted");

  expect(model.bind_zone("living", "Living Room", 0, 1), "registry: bind living room");
  expect(model.bind_zone("bath", "Bathroom", 1, 4), "registry: bind bathroom");
  expect(!model.bind_zone("bad", "Bad", 3, 0), "registry: reject missing node");
  expect(!model.bind_zone("bad-zone", "Bad Zone", 0, 6), "registry: reject invalid V6 zone");

  ResolvedZone living = model.resolve_room("living");
  expect(living.node != nullptr && living.binding != nullptr, "registry: resolve bound room");
  expect(living.binding && living.binding->node_index == 0 && living.binding->zone_index == 1,
         "registry: resolved room maps to node/zone");
  expect(model.active_zone_count() == 2, "registry: active zone count");
  expect(model.update_zone_comfort("living", 22.0f, 3), "registry: update comfort intent");
  living = model.resolve_room("living");
  expect(living.binding != nullptr && living.binding->comfort_setpoint_c == 22.0f &&
             living.binding->comfort_bias_c == 0.0f && living.binding->priority == 3,
         "registry: comfort intent stored separately");
  expect(model.average_comfort_setpoint_c() > 21.4f && model.average_comfort_setpoint_c() < 21.6f,
         "registry: average comfort setpoint");
  expect(model.update_zone_comfort("living", 22.0f, 3, -0.5f), "registry: update comfort bias");
  living = model.resolve_room("living");
  expect(living.binding != nullptr && living.binding->comfort_bias_c == -0.5f &&
             HouseModel::effective_comfort_setpoint_c(*living.binding) > 21.4f &&
             HouseModel::effective_comfort_setpoint_c(*living.binding) < 21.6f,
         "registry: comfort bias affects effective comfort");
  expect(model.update_zone_schedule("living", true, 0x1F, 390, 1290, 20.5f),
         "registry: update schedule");
  living = model.resolve_room("living");
  expect(living.binding != nullptr && living.binding->schedule_enabled &&
             living.binding->schedule_day_mask == 0x1F &&
             living.binding->schedule_start_min == 390 &&
             living.binding->schedule_end_min == 1290 &&
             living.binding->schedule_setpoint_c > 20.4f,
         "registry: schedule stored");
  float scheduled = 0.0f;
  expect(living.binding != nullptr &&
             HouseModel::scheduled_comfort_setpoint_c(*living.binding, 0, 390, &scheduled) &&
             scheduled > 19.9f && scheduled < 20.1f,
         "registry: schedule resolves with comfort bias");
  expect(living.binding != nullptr &&
             !HouseModel::scheduled_comfort_setpoint_c(*living.binding, 0, 389, &scheduled),
         "registry: schedule inactive before start");
  expect(living.binding != nullptr &&
             !HouseModel::scheduled_comfort_setpoint_c(*living.binding, 0, 1290, &scheduled),
         "registry: schedule inactive at end");
  expect(living.binding != nullptr &&
             !HouseModel::scheduled_comfort_setpoint_c(*living.binding, 6, 420, &scheduled),
         "registry: schedule inactive on masked day");
  expect(!model.update_zone_schedule("living", true, 0, 390, 1290, 20.5f),
         "registry: reject enabled schedule without days");
  expect(!model.update_zone_schedule("living", true, 0x7F, 1290, 390, 20.5f),
         "registry: reject invalid schedule window");

  expect(model.bind_zone("living", "Living Room North", 1, 2), "registry: rebind existing room");
  living = model.resolve_room("living");
  expect(living.binding && living.binding->node_index == 1 && living.binding->zone_index == 2,
         "registry: rebind updates target");
}

static void test_remove_node_remaps_zones() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.upsert_node("v6-b", "b.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.upsert_node("v6-c", "c.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.bind_zone("living", "Living", 0, 0);
  model.bind_zone("bath", "Bath", 1, 2);
  model.bind_zone("bed", "Bedroom", 2, 3);

  expect(model.remove_node("v6-b"), "registry: remove middle node");
  expect(model.node_count() == 2, "registry: node count after remove");
  expect(model.resolve_room("bath").binding == nullptr, "registry: removed node disables bound rooms");
  ResolvedZone bed = model.resolve_room("bed");
  expect(bed.binding != nullptr && bed.binding->node_index == 1, "registry: later zones remap down");
  expect(!model.remove_node("missing"), "registry: reject missing node remove");
}

static void test_persisted_state_roundtrip() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "192.168.1.51", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.update_node_identity(0, "hv6-aabbccddeeff");
  model.bind_zone("living", "Living", 0, 4);
  model.update_zone_comfort("living", 21.8f, 2, 0.4f);
  model.update_zone_schedule("living", true, 0x7F, 360, 1320, 21.2f);
  model.update_zone_live("living", 21.4f, true, 21.0f, true, "heat", true, 1234);
  model.update_zone_live("living", 21.9f, true, 21.0f, true, "heat", true, 3601234);

  PersistedState state{};
  expect(model.export_state(&state), "persist: export succeeds");
  expect(state.magic == PERSISTED_STATE_MAGIC && state.version == PERSISTED_STATE_VERSION,
         "persist: magic and version set");

  HouseModel restored;
  expect(restored.import_state(state), "persist: import succeeds");
  expect(restored.node_count() == 1 && restored.zone_count() == 1, "persist: counts restored");
  ResolvedZone living = restored.resolve_room("living");
  expect(living.node != nullptr && std::strcmp(living.node->hostname, "a.local") == 0,
         "persist: node fields restored");
  expect(living.node != nullptr && std::strcmp(living.node->pairing_fingerprint, "hv6-aabbccddeeff") == 0,
         "persist: node identity restored");
  expect(living.binding != nullptr && living.binding->zone_index == 4,
         "persist: zone binding restored");
  expect(living.binding != nullptr && living.binding->comfort_setpoint_c > 21.7f &&
             living.binding->comfort_bias_c > 0.3f && living.binding->priority == 2,
         "persist: comfort intent restored");
  expect(living.binding != nullptr && living.binding->schedule_enabled &&
             living.binding->schedule_start_min == 360 &&
             living.binding->schedule_end_min == 1320 &&
             living.binding->schedule_setpoint_c > 21.1f,
         "persist: schedule restored");
  expect(living.binding != nullptr && living.binding->thermal_samples == 1 &&
             living.binding->learned_heat_gain_c_per_h > 0.4f,
         "persist: thermal model restored");
  expect(living.live != nullptr && !living.live->fresh && std::strcmp(living.live->status, "unknown") == 0,
         "persist: live state is runtime-only");
  const ZoneHistory *living_history = restored.zone_history(0);
  expect(living_history != nullptr && living_history->has_temperature &&
             living_history->samples == 2 && living_history->calling_samples == 2 &&
             living_history->average_temperature_c > 21.3f,
         "persist: learning history restored");

  state.magic = 0;
  expect(!restored.import_state(state), "persist: reject invalid magic");
}

static void test_zone_live_state() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.bind_zone("living", "Living", 0, 0);
  model.bind_zone("bath", "Bath", 0, 1);

  expect(model.update_zone_live("living", 20.9f, true, 21.5f, true, "heat", true, 5000),
         "live: update mapped room");
  expect(model.update_zone_live("bath", 19.0f, true, 20.0f, true, "stale", false, 5000,
                                42.5f, true),
         "live: update stale room");
  expect(!model.update_zone_live("missing", 0.0f, false, 0.0f, false, "idle", false, 5000),
         "live: reject unknown room");
  expect(model.calling_zone_count() == 1, "live: calling zone count");
  expect(model.stale_zone_count() == 1, "live: stale zone count");
  const ZoneHistory *living_history = model.zone_history(0);
  expect(living_history != nullptr && living_history->samples == 1 &&
             living_history->calling_samples == 1,
         "history: first fresh sample recorded");
  expect(model.update_zone_live("living", 21.9f, true, 21.5f, true, "idle", true, 3605000),
         "history: second fresh sample update");
  living_history = model.zone_history(0);
  expect(living_history != nullptr && living_history->samples == 2 &&
             living_history->calling_samples == 1,
         "history: tracks samples and calling samples");
  expect(living_history != nullptr && living_history->min_temperature_c > 20.8f &&
             living_history->max_temperature_c > 21.8f &&
             living_history->average_temperature_c > 21.3f &&
             living_history->average_temperature_c < 21.5f,
         "history: tracks temperature range and average");
  expect(living_history != nullptr && living_history->has_delta &&
             living_history->last_delta_c_per_h > 0.9f &&
             living_history->last_delta_c_per_h < 1.1f,
         "history: tracks latest temperature rate");
  const LearningSnapshot learning = model.learning_snapshot();
  expect(learning.zones_with_history == 1 && learning.total_samples == 2,
         "learning: summarizes zone samples");
  expect(learning.total_calling_samples == 1 && learning.calling_ratio > 0.49f &&
             learning.calling_ratio < 0.51f,
         "learning: summarizes calling ratio");
  expect(learning.zones_with_delta == 1 && learning.warming_zones == 1 &&
             learning.cooling_zones == 0 && learning.average_delta_c_per_h > 0.9f,
         "learning: summarizes temperature rate");
  const ZoneBinding *living_binding = model.zone(0);
  expect(living_binding != nullptr && living_binding->thermal_samples == 1,
         "thermal: counts learned samples");
  expect(living_binding != nullptr && living_binding->learned_heat_gain_c_per_h == 0.0f &&
             living_binding->learned_cool_loss_c_per_h == 0.0f,
         "thermal: ignores idle warming as passive noise");
  expect(model.update_zone_live("living", 20.9f, true, 21.5f, true, "idle", true, 7205000),
         "thermal: passive cooling sample update");
  living_binding = model.zone(0);
  expect(living_binding != nullptr && living_binding->thermal_samples == 2 &&
             living_binding->learned_cool_loss_c_per_h > 0.9f,
         "thermal: learns passive cooling rate");
  expect(model.update_zone_live("living", 21.9f, true, 21.5f, true, "heat", true, 10805000),
         "thermal: warming sample update");
  living_binding = model.zone(0);
  expect(living_binding != nullptr && living_binding->thermal_samples == 3 &&
             living_binding->learned_heat_gain_c_per_h > 0.9f,
         "thermal: learns heat gain rate");

  ResolvedZone living = model.resolve_room("living");
  expect(living.live != nullptr && living.live->has_temperature && living.live->temperature_c > 21.8f,
         "live: resolve includes snapshot");
  ResolvedZone bath = model.resolve_room("bath");
  expect(bath.live != nullptr && bath.live->has_valve && bath.live->valve_pct > 42.4f &&
             bath.live->valve_pct < 42.6f,
         "live: tracks valve position");
  expect(model.update_zone_live_by_binding(0, 1, 22.0f, true, 22.5f, true, "call", true,
                                           6000, 125.0f, true),
         "live: update by node/zone binding");
  bath = model.resolve_room("bath");
  expect(bath.live != nullptr && std::strcmp(bath.live->status, "call") == 0,
         "live: binding update changes mapped room");
  expect(bath.live != nullptr && bath.live->has_valve && bath.live->valve_pct == 100.0f,
         "live: clamps valve position");
  expect(!model.update_zone_live_by_binding(2, 1, 0.0f, false, 0.0f, false, "idle", false, 6000),
         "live: reject unmapped binding");
  expect(model.update_zone_comfort("bath", 80.0f, 9, -8.0f), "live: comfort clamp update");
  bath = model.resolve_room("bath");
  expect(bath.binding != nullptr && bath.binding->comfort_setpoint_c == 35.0f &&
             bath.binding->comfort_bias_c == -3.0f && bath.binding->priority == 3,
         "live: comfort clamp stored");
  expect(!model.update_zone_comfort("missing", 21.0f, 1), "live: reject missing comfort room");
}

static void test_effective_comfort_resolver() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.bind_zone("living", "Living", 0, 0);
  model.update_zone_comfort("living", 20.0f, 2, 0.4f);
  model.update_zone_schedule("living", true, 0x01, 360, 540, 22.0f);
  const auto *living = model.resolve_room("living").binding;
  expect(living != nullptr, "effective: mapped room exists");

  EffectiveComfort no_time = HouseModel::effective_comfort(*living, false, 0, 420);
  expect(no_time.setpoint_c > 20.3f && no_time.setpoint_c < 20.5f &&
             std::strcmp(no_time.source, "comfort") == 0 && !no_time.schedule_active,
         "effective: comfort used without valid time");

  EffectiveComfort active = HouseModel::effective_comfort(*living, true, 0, 420);
  expect(active.setpoint_c > 22.3f && active.setpoint_c < 22.5f &&
             std::strcmp(active.source, "schedule") == 0 && active.schedule_active,
         "effective: schedule overrides comfort inside window");

  EffectiveComfort outside = HouseModel::effective_comfort(*living, true, 0, 600);
  expect(outside.setpoint_c > 20.3f && outside.setpoint_c < 20.5f &&
             std::strcmp(outside.source, "comfort") == 0 && !outside.schedule_active,
         "effective: comfort used outside schedule window");
}

static void test_strategy_snapshot() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.bind_zone("living", "Living", 0, 0);
  model.bind_zone("bath", "Bath", 0, 1);
  model.bind_zone("bed", "Bedroom", 0, 2);
  model.update_zone_comfort("living", 21.0f, 1);
  model.update_zone_comfort("bath", 22.5f, 3, 0.5f);
  model.update_zone_comfort("bed", 19.0f, 0);
  model.update_zone_live("living", 20.0f, true, 20.5f, true, "heat", true, 1000);
  model.update_zone_live("bath", 21.0f, true, 22.0f, true, "call", true, 1000);
  model.update_zone_live("bed", 19.5f, true, 19.0f, true, "idle", true, 1000);

  StrategySnapshot strategy = model.strategy_snapshot();
  expect(strategy.has_physical_temperature, "strategy: has physical temperature");
  expect(strategy.contributing_zones == 3, "strategy: counts contributing zones");
  expect(strategy.demand_zones == 2, "strategy: counts demand zones");
  expect(strategy.physical_temperature_c > 20.4f && strategy.physical_temperature_c < 20.8f,
         "strategy: priority-weighted physical temperature");
  expect(strategy.comfort_demand_c > 1.3f && strategy.comfort_demand_c < 1.6f,
         "strategy: separates comfort demand");
  expect(std::strcmp(strategy.driver_room_id, "bath") == 0 && strategy.driver_priority == 3,
         "strategy: selects strongest demand driver");

  model.update_zone_schedule("living", true, 0x01, 0, 1440, 25.0f);
  strategy = model.strategy_snapshot(true, 0, 720);
  expect(strategy.comfort_average_c > 22.2f && strategy.comfort_average_c < 22.5f,
         "strategy: schedule affects comfort average");
  expect(std::strcmp(strategy.driver_room_id, "living") == 0,
         "strategy: active schedule can drive demand");
}

static void test_zone_forecast_profile() {
  HouseModel model;
  model.upsert_node("v6-a", "a.local", "", "lune-v6", "1.0", NodeTrust::TRUSTED);
  model.bind_zone("living", "Living", 0, 0);

  expect(model.update_zone_forecast_profile_by_binding(0, 0, 0x05, 0.8f, 0.2f, 8, 1.25f),
         "forecast profile: update mapped binding");
  ResolvedZone living = model.resolve_room("living");
  expect(living.binding != nullptr && living.binding->exterior_walls == 0x05,
         "forecast profile: exterior walls stored");
  expect(living.binding != nullptr && living.binding->wind_exposure > 0.79f &&
             living.binding->solar_gain < 0.21f && living.binding->thermal_lead_h == 8,
         "forecast profile: factors stored");
  expect(living.binding != nullptr && living.binding->max_offset_c > 1.24f,
         "forecast profile: max offset stored");

  expect(model.update_zone_forecast_profile_by_binding(0, 0, 0xFF, 2.0f, -1.0f, 80, 9.0f),
         "forecast profile: clamps out-of-range values");
  living = model.resolve_room("living");
  expect(living.binding != nullptr && living.binding->exterior_walls == 0x0F &&
             living.binding->wind_exposure == 1.0f && living.binding->solar_gain == 0.0f &&
             living.binding->thermal_lead_h == 24 && living.binding->max_offset_c == 5.0f,
         "forecast profile: clamped values stored");
  expect(!model.update_zone_forecast_profile_by_binding(2, 0, 0, 0.5f, 0.3f, 4, 1.0f),
         "forecast profile: reject missing node");
}

static void test_command_ledger() {
  CommandLedger ledger;
  ledger.append(command("cmd-1", 1000, 5000));
  ledger.append(command("cmd-2", 2000, 10000));

  expect(ledger.count() == 2, "ledger: append increments count");
  expect(ledger.count_result(CommandResult::PENDING) == 2, "ledger: pending count");
  expect(ledger.expire_pending(5999) == 0, "ledger: no early expiry");
  expect(ledger.expire_pending(6000) == 1, "ledger: first command expires at deadline");
  expect(ledger.count_result(CommandResult::EXPIRED) == 1, "ledger: expired count");
  expect(std::strcmp(command_result_name(CommandResult::EXPIRED), "expired") == 0,
         "ledger: result name");
  expect(std::strcmp(command_result_name(CommandResult::BLOCKED_STALE), "blocked_stale") == 0 &&
             std::strcmp(command_result_name(CommandResult::BLOCKED_UNREACHABLE), "blocked_unreachable") == 0 &&
             std::strcmp(command_result_name(CommandResult::BLOCKED_UNTRUSTED), "blocked_untrusted") == 0,
         "ledger: blocked result names");

  CommandRecord accepted = command("cmd-3", 3000, 10000);
  accepted.result = CommandResult::ACCEPTED;
  accepted.accepted_offset_c = 1.0f;
  accepted.clamp_applied = true;
  ledger.append(accepted);

  const CommandRecord *latest = ledger.latest();
  expect(latest != nullptr && std::strcmp(latest->request_id, "cmd-3") == 0, "ledger: latest record");
  expect(latest && latest->clamp_applied && latest->accepted_offset_c == 1.0f,
         "ledger: clamp result preserved");

  CommandRecord forecast = command("cmd-4", 100000, 3600000);
  std::strncpy(forecast.source, "forecast", sizeof(forecast.source) - 1);
  forecast.node_index = 1;
  forecast.zone_index = 3;
  forecast.requested_offset_c = 0.5f;
  forecast.result = CommandResult::ACCEPTED;
  ledger.append(forecast);
  expect(ledger.has_recent_similar("forecast", 1, 3, 0.52f, 110000, 1800000, 0.05f),
         "ledger: detects recent similar forecast command");
  expect(!ledger.has_recent_similar("forecast", 1, 3, 0.7f, 110000, 1800000, 0.05f),
         "ledger: allows materially different forecast offset");
  expect(!ledger.has_recent_similar("dashboard", 1, 3, 0.52f, 110000, 1800000, 0.05f),
         "ledger: source separates forecast from dashboard");
  expect(!ledger.has_recent_similar("forecast", 1, 3, 0.52f, 2000000, 1800000, 0.05f),
         "ledger: old similar command no longer blocks");
}

static void test_ledger_ring_capacity() {
  CommandLedger ledger;
  for (size_t i = 0; i < LEDGER_CAPACITY + 5; i++) {
    char id[20];
    std::snprintf(id, sizeof(id), "cmd-%02u", static_cast<unsigned>(i));
    ledger.append(command(id, static_cast<uint32_t>(i * 1000), 10000));
  }

  expect(ledger.count() == LEDGER_CAPACITY, "ledger: ring count capped");
  const CommandRecord *latest = ledger.latest();
  expect(latest != nullptr && std::strcmp(latest->request_id, "cmd-36") == 0,
         "ledger: latest survives wrap");
}

static void test_ledger_persisted_state_roundtrip() {
  CommandLedger ledger;
  CommandRecord first = command("cmd-a", 1000, 5000);
  first.result = CommandResult::ACCEPTED;
  ledger.append(first);
  ledger.append(command("cmd-b", 2000, 5000));

  PersistedLedger state{};
  expect(ledger.export_state(&state), "ledger persist: export succeeds");
  expect(state.magic == PERSISTED_LEDGER_MAGIC && state.version == PERSISTED_LEDGER_VERSION,
         "ledger persist: magic and version set");

  CommandLedger restored;
  expect(restored.import_state(state), "ledger persist: import succeeds");
  expect(restored.count() == 2, "ledger persist: count restored");
  expect(restored.count_result(CommandResult::ACCEPTED) == 1, "ledger persist: result restored");
  const CommandRecord *latest = restored.latest();
  expect(latest != nullptr && std::strcmp(latest->request_id, "cmd-b") == 0,
         "ledger persist: latest restored");

  state.version = 99;
  expect(!restored.import_state(state), "ledger persist: reject invalid version");
}

int main() {
  test_node_staleness();
  test_node_unreachable_marks_zones_stale();
  test_node_trust_updates();
  test_zone_registry();
  test_remove_node_remaps_zones();
  test_persisted_state_roundtrip();
  test_zone_live_state();
  test_effective_comfort_resolver();
  test_strategy_snapshot();
  test_zone_forecast_profile();
  test_command_ledger();
  test_ledger_ring_capacity();
  test_ledger_persisted_state_roundtrip();

  if (g_failures > 0) {
    std::printf("%d test(s) FAILED.\n", g_failures);
    return EXIT_FAILURE;
  }
  std::printf("All tests passed.\n");
  return EXIT_SUCCESS;
}
