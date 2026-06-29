#include "lune_touch_coordinator.h"
#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include <cmath>
#include <cstdio>
#include <cstring>

namespace esphome {
namespace lune_touch_coordinator {

static const char *const TAG = "lune_touch";

void LuneTouchCoordinator::setup() {
  model_.set_node_stale_after_ms(node_stale_after_ms_);
  seed_mock_house_();
  ESP_LOGI(TAG, "Lune Touch coordinator model ready");
  ESP_LOGI(TAG, "  stale_after=%ums max_nodes=%u ledger_capacity=%u",
           static_cast<unsigned>(node_stale_after_ms_),
           static_cast<unsigned>(::lune_touch::MAX_NODES),
           static_cast<unsigned>(::lune_touch::LEDGER_CAPACITY));
}

void LuneTouchCoordinator::dump_config() {
  ESP_LOGCONFIG(TAG, "Lune Touch Coordinator:");
  ESP_LOGCONFIG(TAG, "  Node stale after: %u ms", static_cast<unsigned>(node_stale_after_ms_));
  ESP_LOGCONFIG(TAG, "  V6 endpoints: /api/hv6/v1/state, /peer, /logs");
  ESP_LOGCONFIG(TAG, "  Command path: expiring coordinator commands, clamped by Lune V6");
}

void LuneTouchCoordinator::seed_mock_house_() {
  if (model_.node_count() > 0)
    return;
  int a = model_.upsert_node("v6-a", "lune-v6-a.local", "192.168.1.51", "lune-v6", "mock", ::lune_touch::NodeTrust::TRUSTED);
  int b = model_.upsert_node("v6-b", "lune-v6-b.local", "192.168.1.52", "lune-v6", "mock", ::lune_touch::NodeTrust::TRUSTED);
  int c = model_.upsert_node("v6-c", "lune-v6-c.local", "192.168.1.53", "lune-v6", "mock", ::lune_touch::NodeTrust::PAIRED);
  if (a >= 0) model_.mark_node_seen(a, esphome::millis());
  if (b >= 0) model_.mark_node_seen(b, esphome::millis());

  const char *rooms[18] = {
      "Living", "Kitchen", "Bath", "Hall", "Office", "Bedroom",
      "Guest", "Utility", "Laundry", "Workshop", "Pantry", "Landing",
      "Kids west", "Kids east", "Ensuite", "Basement", "Garage", "Spare"};
  for (size_t i = 0; i < 18; i++) {
    const size_t node = i / ::lune_touch::ZONES_PER_NODE;
    char id[16];
    snprintf(id, sizeof(id), "room-%02u", static_cast<unsigned>(i + 1));
    model_.bind_zone(id, rooms[i], node, i % ::lune_touch::ZONES_PER_NODE);
  }

  ::lune_touch::CommandRecord record{};
  std::strncpy(record.request_id, "mock-forecast-1", sizeof(record.request_id) - 1);
  std::strncpy(record.source, "forecast", sizeof(record.source) - 1);
  std::strncpy(record.reason, "wind preload", sizeof(record.reason) - 1);
  record.node_index = 0;
  record.zone_index = 0;
  record.requested_offset_c = 0.4f;
  record.accepted_offset_c = 0.4f;
  record.created_at_ms = esphome::millis();
  record.expires_at_ms = esphome::millis() + 45UL * 60UL * 1000UL;
  record.result = ::lune_touch::CommandResult::ACCEPTED;
  ledger_.append(record);
}

void LuneTouchCoordinator::write_overview_json(char *buffer, size_t capacity) const {
  snprintf(buffer, capacity,
           "{\"summary\":{\"zones\":%u,\"nodes\":%u,\"calling\":5,\"stale_nodes\":1,"
           "\"comfort_avg_c\":21.1,\"forecast_status\":\"stale\",\"latest_command\":\"accepted\"}}",
           static_cast<unsigned>(model_.active_zone_count()),
           static_cast<unsigned>(model_.node_count()));
}

void LuneTouchCoordinator::write_nodes_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  off += snprintf(buffer + off, capacity - off, "{\"nodes\":[");
  for (size_t i = 0; i < model_.node_count() && off < capacity; i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    off += snprintf(buffer + off, capacity - off,
                    "%s{\"id\":\"%s\",\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\","
                    "\"firmware\":\"%s\",\"reachable\":%s,\"trust\":%u,\"last_seen_ms\":%lu}",
                    i ? "," : "", node->node_id, node->hostname, node->fallback_ip, node->model,
                    node->firmware, node->reachable ? "true" : "false",
                    static_cast<unsigned>(node->trust), static_cast<unsigned long>(node->last_seen_ms));
  }
  snprintf(buffer + off, capacity - off, "]}");
}

void LuneTouchCoordinator::write_zones_json(char *buffer, size_t capacity) const {
  static const float temps[18] = {21.3f,20.9f,22.2f,20.1f,20.8f,19.4f,19.8f,18.9f,18.7f,17.6f,18.1f,20.3f,20.5f,20.0f,21.8f,NAN,12.4f,NAN};
  static const float setpoints[18] = {21.0f,21.0f,22.5f,20.0f,21.0f,19.5f,20.0f,19.0f,18.5f,18.0f,18.0f,20.0f,20.5f,20.5f,22.0f,18.0f,12.0f,NAN};
  static const char *states[18] = {"heat","idle","call","hold","idle","preheat","idle","heat","idle","call","idle","hold","idle","heat","call","stale","idle","unused"};
  size_t off = 0;
  off += snprintf(buffer + off, capacity - off, "{\"count\":%u,\"zones\":[", static_cast<unsigned>(model_.active_zone_count()));
  for (size_t i = 0; i < model_.zone_count() && i < 18 && off + 180 < capacity; i++) {
    const auto *zone = model_.zone(i);
    if (zone == nullptr)
      continue;
    const char *temp = std::isnan(temps[i]) ? "null" : "";
    const char *sp = std::isnan(setpoints[i]) ? "null" : "";
    char temp_buf[16];
    char sp_buf[16];
    if (!std::isnan(temps[i])) snprintf(temp_buf, sizeof(temp_buf), "%.1f", temps[i]); else std::strncpy(temp_buf, temp, sizeof(temp_buf));
    if (!std::isnan(setpoints[i])) snprintf(sp_buf, sizeof(sp_buf), "%.1f", setpoints[i]); else std::strncpy(sp_buf, sp, sizeof(sp_buf));
    off += snprintf(buffer + off, capacity - off,
                    "%s{\"room_id\":\"%s\",\"name\":\"%s\",\"node_index\":%u,\"zone_index\":%u,"
                    "\"temperature_c\":%s,\"setpoint_c\":%s,\"status\":\"%s\",\"fresh\":%s}",
                    i ? "," : "", zone->room_id, zone->room_name,
                    static_cast<unsigned>(zone->node_index), static_cast<unsigned>(zone->zone_index),
                    temp_buf, sp_buf, states[i], strcmp(states[i], "stale") == 0 ? "false" : "true");
  }
  snprintf(buffer + off, capacity - off, "]}");
}

void LuneTouchCoordinator::write_forecast_json(char *buffer, size_t capacity) const {
  snprintf(buffer, capacity,
           "{\"status\":\"stale\",\"location\":{\"mode\":\"manual\",\"latitude\":0,\"longitude\":0},"
           "\"last_fetch_age_s\":0,\"decisions\":[{\"room_id\":\"room-01\",\"offset_c\":0.4,"
           "\"peak_in_h\":10,\"reason\":\"mock wind preload\"}]}");
}

void LuneTouchCoordinator::write_commands_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  off += snprintf(buffer + off, capacity - off, "{\"commands\":[");
  for (size_t i = 0; i < ledger_.count() && off + 220 < capacity; i++) {
    const auto *record = ledger_.at(i);
    if (record == nullptr)
      continue;
    off += snprintf(buffer + off, capacity - off,
                    "%s{\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\","
                    "\"node_index\":%u,\"zone_index\":%u,\"requested_offset_c\":%.2f,"
                    "\"accepted_offset_c\":%.2f,\"result\":\"%s\",\"clamp_applied\":%s}",
                    i ? "," : "", record->request_id, record->source, record->reason,
                    static_cast<unsigned>(record->node_index), static_cast<unsigned>(record->zone_index),
                    record->requested_offset_c, record->accepted_offset_c,
                    ::lune_touch::command_result_name(record->result),
                    record->clamp_applied ? "true" : "false");
  }
  snprintf(buffer + off, capacity - off, "]}");
}

void LuneTouchCoordinator::write_diagnostics_json(char *buffer, size_t capacity) const {
  snprintf(buffer, capacity,
           "{\"heap\":\"watching\",\"nodes\":%u,\"zones\":%u,\"ledger\":%u,"
           "\"screen\":\"overview-only\",\"api\":\"/api/lune-touch/v1\"}",
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.zone_count()),
           static_cast<unsigned>(ledger_.count()));
}

}  // namespace lune_touch_coordinator
}  // namespace esphome
