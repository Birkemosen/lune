#include "lune_touch_coordinator.h"
#include "esphome/components/network/util.h"
#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include "esp_http_client.h"
#include <nvs.h>
#include <ArduinoJson.h>
#include <cmath>
#include <cstdio>
#include <cstring>

namespace esphome {
namespace lune_touch_coordinator {

static const char *const TAG = "lune_touch";
static const char *const TOUCH_NAMESPACE = "touch";
static const char *const WEATHER_NAMESPACE = "weather";
static const char *const LEDGER_NAMESPACE = "ledger";

void LuneTouchCoordinator::setup() {
  state_lock_ = xSemaphoreCreateMutex();
  model_.set_node_stale_after_ms(node_stale_after_ms_);
  const bool loaded_registry = load_registry_();
  load_ledger_();
  load_forecast_settings_();
  if (!loaded_registry)
    seed_mock_house_();
  ESP_LOGI(TAG, "Lune Touch coordinator model ready");
  ESP_LOGI(TAG, "  stale_after=%ums max_nodes=%u ledger_capacity=%u",
           static_cast<unsigned>(node_stale_after_ms_),
           static_cast<unsigned>(::lune_touch::MAX_NODES),
           static_cast<unsigned>(::lune_touch::LEDGER_CAPACITY));
  xTaskCreatePinnedToCore(poll_task_func_, "lune_touch_poll", POLL_STACK_SIZE, this,
                          POLL_PRIORITY, &poll_task_handle_, POLL_CORE);
}

void LuneTouchCoordinator::loop() {
  const uint32_t now = esphome::millis();
  if ((int32_t) (now - last_ledger_expire_ms_) < 5000)
    return;
  last_ledger_expire_ms_ = now;

  if (!take_state_lock_(10))
    return;
  const size_t expired = ledger_.expire_pending(now);
  give_state_lock_();
  if (expired > 0)
    save_ledger_();
}

void LuneTouchCoordinator::dump_config() {
  ESP_LOGCONFIG(TAG, "Lune Touch Coordinator:");
  ESP_LOGCONFIG(TAG, "  Node stale after: %u ms", static_cast<unsigned>(node_stale_after_ms_));
  ESP_LOGCONFIG(TAG, "  V6 endpoints: /api/hv6/v1/state, /peer, /logs");
  ESP_LOGCONFIG(TAG, "  Command path: expiring coordinator commands, clamped by Lune V6");
}

bool LuneTouchCoordinator::take_state_lock_(uint32_t timeout_ms) const {
  return state_lock_ == nullptr || xSemaphoreTake(state_lock_, pdMS_TO_TICKS(timeout_ms)) == pdTRUE;
}

void LuneTouchCoordinator::give_state_lock_() const {
  if (state_lock_ != nullptr)
    xSemaphoreGive(state_lock_);
}

void LuneTouchCoordinator::poll_task_func_(void *arg) {
  static_cast<LuneTouchCoordinator *>(arg)->poll_task_();
}

void LuneTouchCoordinator::poll_task_() {
  vTaskDelay(pdMS_TO_TICKS(POLL_BOOT_DELAY_MS));
  while (true) {
    if (esphome::network::is_connected())
      poll_once_();
    vTaskDelay(pdMS_TO_TICKS(POLL_INTERVAL_MS));
  }
}

void LuneTouchCoordinator::poll_once_() {
  ::lune_touch::PairedNode nodes[::lune_touch::MAX_NODES]{};
  size_t count = 0;
  if (!take_state_lock_(100))
    return;
  count = model_.node_count();
  if (count > ::lune_touch::MAX_NODES)
    count = ::lune_touch::MAX_NODES;
  for (size_t i = 0; i < count; i++) {
    const auto *node = model_.node(i);
    if (node != nullptr)
      nodes[i] = *node;
  }
  give_state_lock_();

  const uint32_t now = esphome::millis();
  last_poll_ms_ = now;
  for (size_t i = 0; i < count; i++) {
    if (nodes[i].hostname[0] == '\0' && nodes[i].fallback_ip[0] == '\0')
      continue;
    if (!poll_node_zones_(i, nodes[i], now)) {
      poll_fail_count_++;
      snprintf(last_poll_error_, sizeof(last_poll_error_), "poll failed");
      if (take_state_lock_(100)) {
        model_.mark_node_unreachable(i, now);
        give_state_lock_();
      }
    } else {
      poll_success_count_++;
      last_poll_error_[0] = '\0';
    }
  }
}

bool LuneTouchCoordinator::poll_node_zones_(size_t node_index, const ::lune_touch::PairedNode &node, uint32_t now_ms) {
  const char *host = node.hostname[0] != '\0' ? node.hostname : node.fallback_ip;
  if (host == nullptr || host[0] == '\0')
    return false;

  char url[160];
  snprintf(url, sizeof(url), "http://%s/api/hv6/v1/zones", host);

  char body[3072];
  int status = 0;
  if (!fetch_json_(url, body, sizeof(body), &status)) {
    ESP_LOGD(TAG, "V6 poll failed for %s (%d)", node.node_id, status);
    return false;
  }
  if (!ingest_v6_zones_(node_index, body, now_ms)) {
    ESP_LOGW(TAG, "V6 poll returned unusable zones for %s", node.node_id);
    return false;
  }
  return true;
}

bool LuneTouchCoordinator::fetch_json_(const char *url, char *body, size_t body_capacity, int *status_code) {
  if (body == nullptr || body_capacity == 0 || url == nullptr)
    return false;
  body[0] = '\0';
  if (status_code != nullptr)
    *status_code = 0;

  esp_http_client_config_t cfg{};
  cfg.url = url;
  cfg.method = HTTP_METHOD_GET;
  cfg.timeout_ms = HTTP_TIMEOUT_MS;
  cfg.disable_auto_redirect = true;

  esp_http_client_handle_t client = esp_http_client_init(&cfg);
  if (client == nullptr)
    return false;

  bool ok = false;
  esp_err_t err = esp_http_client_open(client, 0);
  if (err == ESP_OK) {
    esp_http_client_fetch_headers(client);
    const int status = esp_http_client_get_status_code(client);
    if (status_code != nullptr)
      *status_code = status;
    const int len = esp_http_client_read_response(client, body, body_capacity - 1);
    if (status == 200 && len > 0) {
      body[len] = '\0';
      ok = true;
    }
  } else {
    ESP_LOGD(TAG, "HTTP GET failed: %s", esp_err_to_name(err));
  }

  esp_http_client_close(client);
  esp_http_client_cleanup(client);
  return ok;
}

bool LuneTouchCoordinator::post_json_(const char *url, char *body, size_t body_capacity, int *status_code) {
  if (body == nullptr || body_capacity == 0 || url == nullptr)
    return false;
  body[0] = '\0';
  if (status_code != nullptr)
    *status_code = 0;

  esp_http_client_config_t cfg{};
  cfg.url = url;
  cfg.method = HTTP_METHOD_POST;
  cfg.timeout_ms = HTTP_TIMEOUT_MS;
  cfg.disable_auto_redirect = true;

  esp_http_client_handle_t client = esp_http_client_init(&cfg);
  if (client == nullptr)
    return false;

  bool ok = false;
  esp_err_t err = esp_http_client_open(client, 0);
  if (err == ESP_OK) {
    esp_http_client_fetch_headers(client);
    const int status = esp_http_client_get_status_code(client);
    if (status_code != nullptr)
      *status_code = status;
    const int len = esp_http_client_read_response(client, body, body_capacity - 1);
    if (status >= 200 && status < 300 && len > 0) {
      body[len] = '\0';
      ok = true;
    }
  } else {
    ESP_LOGD(TAG, "HTTP POST failed: %s", esp_err_to_name(err));
  }

  esp_http_client_close(client);
  esp_http_client_cleanup(client);
  return ok;
}

bool LuneTouchCoordinator::ingest_v6_zones_(size_t node_index, const char *body, uint32_t now_ms) {
  if (body == nullptr || body[0] == '\0')
    return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err) {
    ESP_LOGW(TAG, "V6 zones JSON parse failed: %s", err.c_str());
    return false;
  }

  JsonArray zones = doc["data"]["zones"].as<JsonArray>();
  if (zones.isNull())
    zones = doc["zones"].as<JsonArray>();
  if (zones.isNull())
    return false;

  if (!take_state_lock_(100))
    return false;

  size_t updated = 0;
  for (JsonObject zone : zones) {
    int zone_number = zone["zone"] | 0;
    if (zone_number <= 0) {
      zone_number = static_cast<int>(updated) + 1;
    }
    if (zone_number < 1 || zone_number > static_cast<int>(::lune_touch::ZONES_PER_NODE))
      continue;

    const bool has_temp = !zone["temperature_c"].isNull();
    const bool has_setpoint = !zone["setpoint_c"].isNull();
    const float temp = has_temp ? (zone["temperature_c"] | 0.0f) : 0.0f;
    const float setpoint = has_setpoint ? (zone["setpoint_c"] | 0.0f) : 0.0f;
    const char *status = zone["state"] | nullptr;
    if (status == nullptr)
      status = zone["status"] | "unknown";
    const bool fresh = zone["fresh"] | true;
    if (model_.update_zone_live_by_binding(node_index, static_cast<size_t>(zone_number - 1),
                                           temp, has_temp, setpoint, has_setpoint,
                                           status, fresh, now_ms))
      updated++;
  }
  if (updated > 0)
    model_.mark_node_seen(node_index, now_ms);
  give_state_lock_();
  return updated > 0;
}

void LuneTouchCoordinator::url_encode_(const char *src, char *out, size_t out_len) const {
  if (out_len == 0)
    return;
  if (src == nullptr)
    src = "";
  static const char HEX[] = "0123456789ABCDEF";
  size_t off = 0;
  for (const unsigned char *p = reinterpret_cast<const unsigned char *>(src);
       *p != '\0' && off + 1 < out_len; ++p) {
    const unsigned char c = *p;
    const bool safe = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
                      (c >= '0' && c <= '9') || c == '-' || c == '_' ||
                      c == '.' || c == '~';
    if (safe) {
      out[off++] = static_cast<char>(c);
    } else if (off + 3 < out_len) {
      out[off++] = '%';
      out[off++] = HEX[(c >> 4) & 0x0F];
      out[off++] = HEX[c & 0x0F];
    } else {
      break;
    }
  }
  out[off] = '\0';
}

bool LuneTouchCoordinator::send_v6_setpoint_command_(const ::lune_touch::PairedNode &node, uint8_t zone_index,
                                                     const ::lune_touch::CommandRecord &request,
                                                     uint32_t ttl_s, ::lune_touch::CommandRecord *result) {
  if (result == nullptr)
    return false;
  *result = request;

  if (!esphome::network::is_connected())
    return false;

  const char *host = node.hostname[0] != '\0' ? node.hostname : node.fallback_ip;
  if (host == nullptr || host[0] == '\0')
    return false;

  char request_id[64];
  char source[64];
  char reason[128];
  url_encode_(request.request_id, request_id, sizeof(request_id));
  url_encode_("lune-touch", source, sizeof(source));
  url_encode_(request.reason, reason, sizeof(reason));

  char url[320];
  snprintf(url, sizeof(url),
           "http://%s/api/hv6/v1/zones/%u/setpoint-command?"
           "request_id=%s&source=%s&reason=%s&setpoint_offset_c=%.2f&ttl_s=%lu",
           host, static_cast<unsigned>(zone_index + 1), request_id, source, reason,
           request.requested_offset_c, static_cast<unsigned long>(ttl_s));

  char body[512];
  int status = 0;
  if (!post_json_(url, body, sizeof(body), &status))
    return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err)
    return false;

  JsonVariant data = doc["data"];
  const char *result_name = data["result"] | nullptr;
  if (result_name == nullptr)
    result_name = doc["result"] | "";
  const bool accepted = std::strcmp(result_name, "accepted") == 0 || doc["ok"] == true;
  result->result = accepted ? ::lune_touch::CommandResult::ACCEPTED : ::lune_touch::CommandResult::REJECTED;
  if (!data["accepted_offset_c"].isNull())
    result->accepted_offset_c = data["accepted_offset_c"] | request.requested_offset_c;
  else if (!data["requested_offset_c"].isNull())
    result->accepted_offset_c = data["requested_offset_c"] | request.requested_offset_c;
  else
    result->accepted_offset_c = request.requested_offset_c;
  result->clamp_applied = data["clamp_applied"] | false;
  const uint32_t expires_at = data["expires_at_ms"] | 0UL;
  if (expires_at != 0)
    result->expires_at_ms = expires_at;
  return true;
}

bool LuneTouchCoordinator::load_registry_() {
  nvs_handle_t handle;
  if (nvs_open(TOUCH_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return false;

  ::lune_touch::PersistedState state{};
  size_t len = sizeof(state);
  const esp_err_t err = nvs_get_blob(handle, "registry", &state, &len);
  nvs_close(handle);
  if (err != ESP_OK || len != sizeof(state))
    return false;

  if (!model_.import_state(state)) {
    ESP_LOGW(TAG, "Ignoring incompatible Touch registry blob");
    return false;
  }
  ESP_LOGI(TAG, "Loaded Touch registry: nodes=%u zones=%u",
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.zone_count()));
  return true;
}

void LuneTouchCoordinator::save_registry_() {
  ::lune_touch::PersistedState state{};
  if (!model_.export_state(&state))
    return;

  nvs_handle_t handle;
  if (nvs_open(TOUCH_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  if (nvs_set_blob(handle, "registry", &state, sizeof(state)) == ESP_OK)
    nvs_commit(handle);
  nvs_close(handle);
}

void LuneTouchCoordinator::load_ledger_() {
  nvs_handle_t handle;
  if (nvs_open(LEDGER_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return;

  ::lune_touch::PersistedLedger state{};
  size_t len = sizeof(state);
  const esp_err_t err = nvs_get_blob(handle, "recent", &state, &len);
  nvs_close(handle);
  if (err != ESP_OK || len != sizeof(state))
    return;
  if (!ledger_.import_state(state)) {
    ESP_LOGW(TAG, "Ignoring incompatible Touch command ledger blob");
    return;
  }
  ESP_LOGI(TAG, "Loaded Touch command ledger: records=%u",
           static_cast<unsigned>(ledger_.count()));
}

void LuneTouchCoordinator::save_ledger_() {
  ::lune_touch::PersistedLedger state{};
  if (!ledger_.export_state(&state))
    return;

  nvs_handle_t handle;
  if (nvs_open(LEDGER_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  if (nvs_set_blob(handle, "recent", &state, sizeof(state)) == ESP_OK)
    nvs_commit(handle);
  nvs_close(handle);
}

void LuneTouchCoordinator::load_forecast_settings_() {
  nvs_handle_t handle;
  if (nvs_open(WEATHER_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return;
  int32_t lat_e6 = 0;
  int32_t lon_e6 = 0;
  if (nvs_get_i32(handle, "lat_e6", &lat_e6) == ESP_OK)
    forecast_latitude_ = static_cast<float>(lat_e6) / 1000000.0f;
  if (nvs_get_i32(handle, "lon_e6", &lon_e6) == ESP_OK)
    forecast_longitude_ = static_cast<float>(lon_e6) / 1000000.0f;
  size_t mode_len = sizeof(forecast_location_mode_);
  nvs_get_str(handle, "mode", forecast_location_mode_, &mode_len);
  nvs_close(handle);
}

void LuneTouchCoordinator::save_forecast_settings_() {
  nvs_handle_t handle;
  if (nvs_open(WEATHER_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  nvs_set_i32(handle, "lat_e6", static_cast<int32_t>(forecast_latitude_ * 1000000.0f));
  nvs_set_i32(handle, "lon_e6", static_cast<int32_t>(forecast_longitude_ * 1000000.0f));
  nvs_set_str(handle, "mode", forecast_location_mode_);
  nvs_commit(handle);
  nvs_close(handle);
}

void LuneTouchCoordinator::make_node_id_(const char *hostname, const char *fallback_ip, char *out, size_t out_len) const {
  if (out_len == 0)
    return;
  const char *source = (hostname != nullptr && hostname[0] != '\0') ? hostname : fallback_ip;
  if (source == nullptr || source[0] == '\0')
    source = "lune-v6";
  size_t off = 0;
  for (const char *p = source; *p != '\0' && off + 1 < out_len; ++p) {
    const char c = *p;
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
      out[off++] = c;
    } else if (c == '-' || c == '_') {
      out[off++] = c;
    } else if (c == '.' && off + 1 < out_len) {
      out[off++] = '-';
    }
  }
  out[off] = '\0';
  if (out[0] == '\0')
    std::strncpy(out, "lune-v6", out_len - 1);
  out[out_len - 1] = '\0';
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
  static const float temps[18] = {21.3f,20.9f,22.2f,20.1f,20.8f,19.4f,19.8f,18.9f,18.7f,17.6f,18.1f,20.3f,20.5f,20.0f,21.8f,NAN,12.4f,NAN};
  static const float setpoints[18] = {21.0f,21.0f,22.5f,20.0f,21.0f,19.5f,20.0f,19.0f,18.5f,18.0f,18.0f,20.0f,20.5f,20.5f,22.0f,18.0f,12.0f,NAN};
  static const char *states[18] = {"heat","idle","call","hold","idle","preheat","idle","heat","idle","call","idle","hold","idle","heat","call","stale","idle","unused"};
  for (size_t i = 0; i < 18; i++) {
    const size_t node = i / ::lune_touch::ZONES_PER_NODE;
    char id[16];
    snprintf(id, sizeof(id), "room-%02u", static_cast<unsigned>(i + 1));
    model_.bind_zone(id, rooms[i], node, i % ::lune_touch::ZONES_PER_NODE);
    model_.update_zone_live(id, temps[i], !std::isnan(temps[i]), setpoints[i], !std::isnan(setpoints[i]),
                            states[i], strcmp(states[i], "stale") != 0 && strcmp(states[i], "unused") != 0,
                            esphome::millis());
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
  save_ledger_();
  save_registry_();
}

bool LuneTouchCoordinator::add_node(const char *node_id, const char *hostname, const char *fallback_ip,
                                    char *response, size_t capacity) {
  char generated_id[24]{};
  if (node_id == nullptr || node_id[0] == '\0') {
    make_node_id_(hostname, fallback_ip, generated_id, sizeof(generated_id));
    node_id = generated_id;
  }
  if ((hostname == nullptr || hostname[0] == '\0') && (fallback_ip == nullptr || fallback_ip[0] == '\0')) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"hostname_or_ip_required\"}");
    return false;
  }
  const int index = model_.upsert_node(node_id, hostname, fallback_ip, "lune-v6", "unknown", ::lune_touch::NodeTrust::PAIRED);
  if (index < 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_registry_full\"}");
    return false;
  }
  save_registry_();
  snprintf(response, capacity, "{\"result\":\"stored\",\"node_id\":\"%s\",\"node_index\":%d}", node_id, index);
  return true;
}

bool LuneTouchCoordinator::remove_node(const char *node_id, char *response, size_t capacity) {
  if (!model_.remove_node(node_id)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_not_found\"}");
    return false;
  }
  save_registry_();
  snprintf(response, capacity, "{\"result\":\"removed\",\"node_id\":\"%s\"}", node_id != nullptr ? node_id : "");
  return true;
}

bool LuneTouchCoordinator::bind_room(const char *room_id, const char *room_name, size_t node_index, size_t zone_index,
                                     char *response, size_t capacity) {
  if (!model_.bind_zone(room_id, room_name, node_index, zone_index)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_zone_binding\"}");
    return false;
  }
  save_registry_();
  snprintf(response, capacity,
           "{\"result\":\"stored\",\"room_id\":\"%s\",\"node_index\":%u,\"zone_index\":%u}",
           room_id != nullptr ? room_id : "", static_cast<unsigned>(node_index), static_cast<unsigned>(zone_index));
  return true;
}

bool LuneTouchCoordinator::queue_setpoint_command(const char *room_id, float requested_offset_c, uint32_t ttl_s,
                                                  const char *reason, char *response, size_t capacity) {
  if (!std::isfinite(requested_offset_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_offset\"}");
    return false;
  }
  if (ttl_s < 60)
    ttl_s = 60;
  if (ttl_s > 21600)
    ttl_s = 21600;

  ::lune_touch::PairedNode target_node{};
  uint8_t target_node_index = 0;
  uint8_t target_zone = 0;
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const auto resolved = model_.resolve_room(room_id);
  if (resolved.node == nullptr || resolved.binding == nullptr) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  target_node = *resolved.node;
  target_node_index = resolved.binding->node_index;
  target_zone = resolved.binding->zone_index;
  give_state_lock_();

  ::lune_touch::CommandRecord record{};
  snprintf(record.request_id, sizeof(record.request_id), "touch-%lu",
           static_cast<unsigned long>(esphome::millis()));
  std::strncpy(record.source, "dashboard", sizeof(record.source) - 1);
  std::strncpy(record.reason, reason != nullptr && reason[0] != '\0' ? reason : "dashboard command",
               sizeof(record.reason) - 1);
  record.node_index = target_node_index;
  record.zone_index = target_zone;
  record.requested_offset_c = requested_offset_c;
  record.accepted_offset_c = 0.0f;
  record.created_at_ms = esphome::millis();
  record.expires_at_ms = record.created_at_ms + ttl_s * 1000UL;
  record.result = ::lune_touch::CommandResult::PENDING;

  ::lune_touch::CommandRecord final_record = record;
  const bool sent = send_v6_setpoint_command_(target_node, target_zone, record, ttl_s, &final_record);
  if (!sent)
    final_record.result = ::lune_touch::CommandResult::REJECTED;

  if (take_state_lock_(100)) {
    ledger_.append(final_record);
    give_state_lock_();
  } else {
    ledger_.append(final_record);
  }
  save_ledger_();

  snprintf(response, capacity,
           "{\"result\":\"%s\",\"request_id\":\"%s\",\"target_node\":\"%s\","
           "\"zone_index\":%u,\"requested_offset_c\":%.2f,\"accepted_offset_c\":%.2f,"
           "\"clamp_applied\":%s,\"ttl_s\":%lu}",
           ::lune_touch::command_result_name(final_record.result), final_record.request_id,
           target_node.node_id, static_cast<unsigned>(final_record.zone_index),
           final_record.requested_offset_c, final_record.accepted_offset_c,
           final_record.clamp_applied ? "true" : "false", static_cast<unsigned long>(ttl_s));
  return true;
}

bool LuneTouchCoordinator::set_forecast_location(float latitude, float longitude, const char *mode,
                                                 char *response, size_t capacity) {
  if (!std::isfinite(latitude) || !std::isfinite(longitude) ||
      latitude < -90.0f || latitude > 90.0f || longitude < -180.0f || longitude > 180.0f) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_location\"}");
    return false;
  }
  forecast_latitude_ = latitude;
  forecast_longitude_ = longitude;
  std::strncpy(forecast_location_mode_, mode != nullptr && mode[0] != '\0' ? mode : "manual",
               sizeof(forecast_location_mode_) - 1);
  forecast_location_mode_[sizeof(forecast_location_mode_) - 1] = '\0';
  save_forecast_settings_();
  snprintf(response, capacity, "{\"result\":\"saved\",\"latitude\":%.6f,\"longitude\":%.6f}",
           forecast_latitude_, forecast_longitude_);
  return true;
}

bool LuneTouchCoordinator::request_forecast_fetch(char *response, size_t capacity) {
  forecast_last_fetch_ms_ = esphome::millis();
  snprintf(response, capacity, "{\"result\":\"queued\",\"status\":\"fetch_pending\"}");
  return true;
}

void LuneTouchCoordinator::write_overview_json(char *buffer, size_t capacity) const {
  size_t stale_nodes = 0;
  const uint32_t now = esphome::millis();
  for (size_t i = 0; i < model_.node_count(); i++) {
    if (model_.is_node_stale(i, now))
      stale_nodes++;
  }
  const auto *latest = ledger_.latest();
  snprintf(buffer, capacity,
           "{\"summary\":{\"zones\":%u,\"nodes\":%u,\"calling\":%u,\"stale_nodes\":%u,"
           "\"comfort_avg_c\":21.1,\"forecast_status\":\"stale\",\"latest_command\":\"%s\"}}",
           static_cast<unsigned>(model_.active_zone_count()),
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.calling_zone_count()),
           static_cast<unsigned>(stale_nodes),
           latest != nullptr ? ::lune_touch::command_result_name(latest->result) : "none");
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
  size_t off = 0;
  off += snprintf(buffer + off, capacity - off, "{\"count\":%u,\"zones\":[", static_cast<unsigned>(model_.active_zone_count()));
  for (size_t i = 0; i < model_.zone_count() && i < 18 && off + 180 < capacity; i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone == nullptr)
      continue;
    char temp_buf[16];
    char sp_buf[16];
    if (live != nullptr && live->has_temperature) snprintf(temp_buf, sizeof(temp_buf), "%.1f", live->temperature_c); else std::strncpy(temp_buf, "null", sizeof(temp_buf));
    if (live != nullptr && live->has_setpoint) snprintf(sp_buf, sizeof(sp_buf), "%.1f", live->setpoint_c); else std::strncpy(sp_buf, "null", sizeof(sp_buf));
    temp_buf[sizeof(temp_buf) - 1] = '\0';
    sp_buf[sizeof(sp_buf) - 1] = '\0';
    const char *status = live != nullptr && live->status[0] != '\0' ? live->status : (zone->enabled ? "unknown" : "unused");
    off += snprintf(buffer + off, capacity - off,
                    "%s{\"room_id\":\"%s\",\"name\":\"%s\",\"node_index\":%u,\"zone_index\":%u,"
                    "\"temperature_c\":%s,\"setpoint_c\":%s,\"status\":\"%s\",\"fresh\":%s,"
                    "\"updated_at_ms\":%lu}",
                    i ? "," : "", zone->room_id, zone->room_name,
                    static_cast<unsigned>(zone->node_index), static_cast<unsigned>(zone->zone_index),
                    temp_buf, sp_buf, status, live != nullptr && live->fresh && zone->enabled ? "true" : "false",
                    static_cast<unsigned long>(live != nullptr ? live->updated_at_ms : 0));
  }
  snprintf(buffer + off, capacity - off, "]}");
}

void LuneTouchCoordinator::write_forecast_json(char *buffer, size_t capacity) const {
  snprintf(buffer, capacity,
           "{\"status\":\"stale\",\"location\":{\"mode\":\"%s\",\"latitude\":%.6f,\"longitude\":%.6f},"
           "\"last_fetch_age_s\":%lu,\"decisions\":[{\"room_id\":\"room-01\",\"offset_c\":0.4,"
           "\"peak_in_h\":10,\"reason\":\"mock wind preload\"}]}",
           forecast_location_mode_, forecast_latitude_, forecast_longitude_,
           forecast_last_fetch_ms_ == 0 ? 0UL : static_cast<unsigned long>((esphome::millis() - forecast_last_fetch_ms_) / 1000UL));
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
                    "\"accepted_offset_c\":%.2f,\"created_at_ms\":%lu,\"expires_at_ms\":%lu,"
                    "\"result\":\"%s\",\"clamp_applied\":%s}",
                    i ? "," : "", record->request_id, record->source, record->reason,
                    static_cast<unsigned>(record->node_index), static_cast<unsigned>(record->zone_index),
                    record->requested_offset_c, record->accepted_offset_c,
                    static_cast<unsigned long>(record->created_at_ms),
                    static_cast<unsigned long>(record->expires_at_ms),
                    ::lune_touch::command_result_name(record->result),
                    record->clamp_applied ? "true" : "false");
  }
  snprintf(buffer + off, capacity - off, "]}");
}

void LuneTouchCoordinator::write_diagnostics_json(char *buffer, size_t capacity) const {
  snprintf(buffer, capacity,
           "{\"heap\":\"watching\",\"nodes\":%u,\"zones\":%u,\"ledger\":%u,"
           "\"screen\":\"overview-only\",\"api\":\"/api/lune-touch/v1\","
           "\"polling\":{\"last_poll_ms\":%lu,\"success\":%lu,\"fail\":%lu,\"last_error\":\"%s\"}}",
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.zone_count()),
           static_cast<unsigned>(ledger_.count()),
           static_cast<unsigned long>(last_poll_ms_),
           static_cast<unsigned long>(poll_success_count_),
           static_cast<unsigned long>(poll_fail_count_),
           last_poll_error_);
}

}  // namespace lune_touch_coordinator
}  // namespace esphome
