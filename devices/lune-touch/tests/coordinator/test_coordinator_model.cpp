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
  model.bind_zone("living", "Living", 0, 4);
  model.update_zone_live("living", 21.4f, true, 21.0f, true, "heat", true, 1234);

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
  expect(living.binding != nullptr && living.binding->zone_index == 4,
         "persist: zone binding restored");
  expect(living.live != nullptr && !living.live->fresh && std::strcmp(living.live->status, "unknown") == 0,
         "persist: live state is runtime-only");

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
  expect(model.update_zone_live("bath", 19.0f, true, 20.0f, true, "stale", false, 5000),
         "live: update stale room");
  expect(!model.update_zone_live("missing", 0.0f, false, 0.0f, false, "idle", false, 5000),
         "live: reject unknown room");
  expect(model.calling_zone_count() == 1, "live: calling zone count");
  expect(model.stale_zone_count() == 1, "live: stale zone count");

  ResolvedZone living = model.resolve_room("living");
  expect(living.live != nullptr && living.live->has_temperature && living.live->temperature_c > 20.8f,
         "live: resolve includes snapshot");
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

  CommandRecord accepted = command("cmd-3", 3000, 10000);
  accepted.result = CommandResult::ACCEPTED;
  accepted.accepted_offset_c = 1.0f;
  accepted.clamp_applied = true;
  ledger.append(accepted);

  const CommandRecord *latest = ledger.latest();
  expect(latest != nullptr && std::strcmp(latest->request_id, "cmd-3") == 0, "ledger: latest record");
  expect(latest && latest->clamp_applied && latest->accepted_offset_c == 1.0f,
         "ledger: clamp result preserved");
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
  test_zone_registry();
  test_remove_node_remaps_zones();
  test_persisted_state_roundtrip();
  test_zone_live_state();
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
