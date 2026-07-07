#include "lune_touch_coordinator.h"
#include "esphome/components/network/util.h"
#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include "esp_crt_bundle.h"
#include "esp_heap_caps.h"
#include "esp_http_client.h"
#include "esp_ota_ops.h"
#include <nvs.h>
#include <ArduinoJson.h>
#include <algorithm>
#include <cmath>
#include <cstdarg>
#include <cstdio>
#include <cstring>

namespace esphome {
namespace lune_touch_coordinator {

static const char *const TAG = "lune_touch";
static const char *const TOUCH_NAMESPACE = "touch";
static const char *const WEATHER_NAMESPACE = "weather";
static const char *const LEDGER_NAMESPACE = "ledger";
static const char *const SETTINGS_NAMESPACE = "touch_settings";

namespace {

static constexpr float DEG_TO_RAD = 3.14159265358979f / 180.0f;
static constexpr float WIND_REF_MS = 10.0f;
static constexpr float COLD_REF_K = 10.0f;
static constexpr float SOLAR_REF_WM2 = 800.0f;
static constexpr float LOAD_THRESHOLD = 1.0f;
static constexpr float GAIN_C_PER_LOAD = 0.5f;
static constexpr uint32_t OTA_SLOT_BYTES = 0x640000;
static constexpr uint32_t FORECAST_CACHE_MAGIC = 0x4C544657;  // LTFW
static constexpr uint16_t FORECAST_CACHE_VERSION = 1;

struct PersistedForecastCache {
  uint32_t magic{FORECAST_CACHE_MAGIC};
  uint16_t version{FORECAST_CACHE_VERSION};
  uint16_t reserved{0};
  uint8_t hours_count{0};
  uint8_t reserved2[3]{};
  uint32_t saved_at_ms{0};
  float min_temp_c{0.0f};
  float max_wind_ms{0.0f};
  float peak_wind_dir_deg{0.0f};
  float max_solar_wm2{0.0f};
  ForecastHourState hours[72]{};
};

const char *ota_state_name_(esp_ota_img_states_t state) {
  switch (state) {
    case ESP_OTA_IMG_NEW:
      return "new";
    case ESP_OTA_IMG_PENDING_VERIFY:
      return "pending_verify";
    case ESP_OTA_IMG_VALID:
      return "valid";
    case ESP_OTA_IMG_INVALID:
      return "invalid";
    case ESP_OTA_IMG_ABORTED:
      return "aborted";
    case ESP_OTA_IMG_UNDEFINED:
    default:
      return "undefined";
  }
}

bool appendf_(char *buffer, size_t capacity, size_t &offset, const char *fmt, ...) {
  if (buffer == nullptr || offset >= capacity)
    return false;
  va_list args;
  va_start(args, fmt);
  const int written = vsnprintf(buffer + offset, capacity - offset, fmt, args);
  va_end(args);
  if (written < 0)
    return false;
  if (static_cast<size_t>(written) >= capacity - offset) {
    offset = capacity;
    return false;
  }
  offset += static_cast<size_t>(written);
  return true;
}

bool entity_number_(JsonDocument &doc, const char *key, float *out) {
  if (out == nullptr || key == nullptr)
    return false;
  JsonVariant value = doc[key]["value"];
  if (value.isNull())
    value = doc[key];
  if (value.isNull())
    return false;
  *out = value | 0.0f;
  return true;
}

const char *entity_state_(JsonDocument &doc, const char *key) {
  if (key == nullptr)
    return nullptr;
  const char *state = doc[key]["state"] | nullptr;
  if (state == nullptr)
    state = doc[key]["value"] | nullptr;
  return state;
}

bool state_is_on_(const char *state) {
  return state == nullptr || std::strcmp(state, "on") == 0 || std::strcmp(state, "ON") == 0 ||
         std::strcmp(state, "true") == 0 || std::strcmp(state, "1") == 0;
}

void nullable_float_(char *out, size_t out_len, bool has_value, float value) {
  if (out == nullptr || out_len == 0)
    return;
  if (has_value)
    snprintf(out, out_len, "%.1f", value);
  else
    std::strncpy(out, "null", out_len - 1);
  out[out_len - 1] = '\0';
}

bool current_schedule_time_(esphome::time::RealTimeClock *time, uint8_t *day_index,
                            uint16_t *minute_of_day) {
  if (time == nullptr)
    return false;
  const auto now = time->now();
  if (!now.is_valid())
    return false;
  if (day_index != nullptr)
    *day_index = now.day_of_week == 1 ? 6 : static_cast<uint8_t>(now.day_of_week - 2);
  if (minute_of_day != nullptr)
    *minute_of_day = static_cast<uint16_t>(now.hour) * 60 + now.minute;
  return true;
}

void legacy_zone_status_(const char *raw, bool enabled, bool has_temp, float temp,
                         bool has_setpoint, float setpoint, char *out, size_t out_len) {
  if (out == nullptr || out_len == 0)
    return;
  const char *status = "idle";
  if (!enabled) {
    status = "unused";
  } else if (raw != nullptr && raw[0] != '\0') {
    if (std::strcmp(raw, "HEATING") == 0 || std::strcmp(raw, "heat") == 0 ||
        std::strcmp(raw, "CALL") == 0 || std::strcmp(raw, "call") == 0) {
      status = "heat";
    } else if (std::strcmp(raw, "PREHEAT") == 0 || std::strcmp(raw, "preheat") == 0) {
      status = "preheat";
    } else if (std::strcmp(raw, "HOLD") == 0 || std::strcmp(raw, "hold") == 0) {
      status = "hold";
    } else if (std::strcmp(raw, "STALE") == 0 || std::strcmp(raw, "stale") == 0) {
      status = "stale";
    }
  } else if (has_temp && has_setpoint && temp < setpoint - 0.2f) {
    status = "call";
  }
  std::strncpy(out, status, out_len - 1);
  out[out_len - 1] = '\0';
}

struct ZoneBindingV3 {
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
  uint8_t priority{1};
  bool enabled{false};
};

struct PairedNodeV5 {
  char node_id[24]{};
  char hostname[64]{};
  char fallback_ip[16]{};
  char model[24]{};
  char firmware[24]{};
  ::lune_touch::NodeTrust trust{::lune_touch::NodeTrust::UNPAIRED};
  uint32_t last_seen_ms{0};
  bool reachable{false};
};

struct PersistedStateV3 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V3};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  PairedNodeV5 nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV3 zones[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct ZoneBindingV4 {
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
  uint8_t priority{1};
  bool enabled{false};
};

struct ZoneBindingV7 {
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
  bool enabled{false};
  bool schedule_enabled{false};
};

struct PersistedStateV4 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V4};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  PairedNodeV5 nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV4 zones[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct PersistedStateV5 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V5};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  PairedNodeV5 nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV7 zones[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct PersistedStateV6 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V6};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  ::lune_touch::PairedNode nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV7 zones[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct PersistedStateV7 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V7};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  ::lune_touch::PairedNode nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV7 zones[::lune_touch::MAX_HOUSE_ZONES]{};
  ::lune_touch::ZoneHistory histories[::lune_touch::MAX_HOUSE_ZONES]{};
};

void copy_legacy_node_(::lune_touch::PairedNode &dest, const PairedNodeV5 &src) {
  std::strncpy(dest.node_id, src.node_id, sizeof(dest.node_id) - 1);
  std::strncpy(dest.hostname, src.hostname, sizeof(dest.hostname) - 1);
  std::strncpy(dest.fallback_ip, src.fallback_ip, sizeof(dest.fallback_ip) - 1);
  std::strncpy(dest.model, src.model, sizeof(dest.model) - 1);
  std::strncpy(dest.firmware, src.firmware, sizeof(dest.firmware) - 1);
  dest.trust = src.trust;
  dest.last_seen_ms = src.last_seen_ms;
  dest.reachable = src.reachable;
}

void copy_legacy_zone_(::lune_touch::ZoneBinding &dest, const ZoneBindingV7 &src) {
  std::strncpy(dest.room_id, src.room_id, sizeof(dest.room_id) - 1);
  std::strncpy(dest.room_name, src.room_name, sizeof(dest.room_name) - 1);
  dest.node_index = src.node_index;
  dest.zone_index = src.zone_index;
  dest.exterior_walls = src.exterior_walls;
  dest.wind_exposure = src.wind_exposure;
  dest.solar_gain = src.solar_gain;
  dest.thermal_lead_h = src.thermal_lead_h;
  dest.max_offset_c = src.max_offset_c;
  dest.comfort_setpoint_c = src.comfort_setpoint_c;
  dest.comfort_bias_c = src.comfort_bias_c;
  dest.schedule_setpoint_c = src.schedule_setpoint_c;
  dest.schedule_start_min = src.schedule_start_min;
  dest.schedule_end_min = src.schedule_end_min;
  dest.schedule_day_mask = src.schedule_day_mask;
  dest.priority = src.priority;
  dest.enabled = src.enabled;
  dest.schedule_enabled = src.schedule_enabled;
}

float wind_alignment_(uint8_t exterior_walls, float wind_dir_deg) {
  struct Wall {
    uint8_t bit;
    float normal_deg;
  };
  static constexpr Wall WALLS[] = {
      {1 << 0, 0.0f}, {1 << 1, 90.0f}, {1 << 2, 180.0f}, {1 << 3, 270.0f}};

  float best = 0.0f;
  for (const Wall &wall : WALLS) {
    if (!(exterior_walls & wall.bit))
      continue;
    const float aligned = std::cos((wind_dir_deg - wall.normal_deg) * DEG_TO_RAD);
    if (aligned > best)
      best = aligned;
  }
  return best > 0.0f ? best : 0.0f;
}

float zone_hour_load_(const ForecastHourState &hour, const ::lune_touch::ZoneBinding &zone,
                      float indoor_ref_c) {
  const float wind_term = zone.wind_exposure * wind_alignment_(zone.exterior_walls, hour.wind_dir_deg) *
                          (hour.wind_speed_ms / WIND_REF_MS);
  const float cold_term = std::fmax(0.0f, indoor_ref_c - hour.temp_c) / COLD_REF_K;
  const float solar_relief = zone.solar_gain * (std::fmax(0.0f, hour.shortwave_wm2) / SOLAR_REF_WM2);
  return std::fmax(0.0f, wind_term * cold_term - solar_relief);
}

void json_escape_(const char *src, char *out, size_t out_len) {
  if (out_len == 0)
    return;
  if (src == nullptr)
    src = "";
  size_t off = 0;
  for (const char *p = src; *p != '\0' && off + 1 < out_len; ++p) {
    const char c = *p;
    if ((c == '"' || c == '\\') && off + 2 < out_len) {
      out[off++] = '\\';
      out[off++] = c;
    } else if (static_cast<unsigned char>(c) < 0x20) {
      out[off++] = ' ';
    } else {
      out[off++] = c;
    }
  }
  out[off] = '\0';
}

}  // namespace

void LuneTouchCoordinator::setup() {
  state_lock_ = xSemaphoreCreateMutex();
  model_.set_node_stale_after_ms(node_stale_after_ms_);
  const bool loaded_registry = load_registry_();
  load_ledger_();
  load_forecast_settings_();
  load_settings_();
  load_forecast_cache_();
  log_event_("info", "boot", "coordinator ready");
  if (!loaded_registry)
    ESP_LOGI(TAG, "No persisted Touch registry; waiting for dashboard pairing");
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
  ESP_LOGCONFIG(TAG, "  V6 endpoints: /api/hv6/v1/overview, /zones, /events");
  ESP_LOGCONFIG(TAG, "  Command path: expiring coordinator commands, clamped by Lune V6");
}

bool LuneTouchCoordinator::take_state_lock_(uint32_t timeout_ms) const {
  return state_lock_ == nullptr || xSemaphoreTake(state_lock_, pdMS_TO_TICKS(timeout_ms)) == pdTRUE;
}

void LuneTouchCoordinator::give_state_lock_() const {
  if (state_lock_ != nullptr)
    xSemaphoreGive(state_lock_);
}

void LuneTouchCoordinator::log_event_(const char *level, const char *source, const char *message) {
  if (!take_state_lock_(5))
    return;
  EventRecord &event = events_[event_next_];
  event.ts_ms = esphome::millis();
  std::strncpy(event.level, level != nullptr && level[0] != '\0' ? level : "info",
               sizeof(event.level) - 1);
  event.level[sizeof(event.level) - 1] = '\0';
  std::strncpy(event.source, source != nullptr && source[0] != '\0' ? source : "touch",
               sizeof(event.source) - 1);
  event.source[sizeof(event.source) - 1] = '\0';
  std::strncpy(event.message, message != nullptr && message[0] != '\0' ? message : "-",
               sizeof(event.message) - 1);
  event.message[sizeof(event.message) - 1] = '\0';
  event_next_ = (event_next_ + 1) % EVENT_CAPACITY;
  if (event_count_ < EVENT_CAPACITY)
    event_count_++;
  give_state_lock_();
}

void LuneTouchCoordinator::poll_task_func_(void *arg) {
  static_cast<LuneTouchCoordinator *>(arg)->poll_task_();
}

void LuneTouchCoordinator::poll_task_() {
  vTaskDelay(pdMS_TO_TICKS(POLL_BOOT_DELAY_MS));
  while (true) {
    if (esphome::network::is_connected()) {
      bool fetch_requested = false;
      if (take_state_lock_(100)) {
        const uint32_t now = esphome::millis();
        const bool has_location = std::isfinite(forecast_latitude_) && std::isfinite(forecast_longitude_) &&
                                  (std::fabs(forecast_latitude_) >= 0.0001f ||
                                   std::fabs(forecast_longitude_) >= 0.0001f);
        const bool initial_fetch_due = has_location && forecast_last_fetch_ms_ == 0;
        const bool boot_refresh_due = has_location && forecast_boot_refresh_pending_;
        const bool interval_fetch_due =
            has_location && forecast_last_fetch_ms_ != 0 &&
            now - forecast_last_fetch_ms_ >= FORECAST_AUTO_FETCH_INTERVAL_MS;
        fetch_requested = forecast_fetch_requested_ || initial_fetch_due || boot_refresh_due || interval_fetch_due;
        forecast_fetch_requested_ = false;
        if (fetch_requested)
          forecast_boot_refresh_pending_ = false;
        give_state_lock_();
      }
      if (fetch_requested) {
        char response[384];
        perform_forecast_fetch_(response, sizeof(response));
      }
      poll_once_();
    }
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
  bool any_success = false;
  for (size_t i = 0; i < count; i++) {
    if (nodes[i].hostname[0] == '\0' && nodes[i].fallback_ip[0] == '\0')
      continue;
    if (std::strcmp(nodes[i].firmware, "mock") == 0)
      continue;
    const bool overview_ok = poll_node_overview_(i, nodes[i], now);
    const bool zones_ok = poll_node_zones_(i, nodes[i], now);
    if (!overview_ok && !zones_ok) {
      poll_fail_count_++;
      snprintf(last_poll_error_, sizeof(last_poll_error_), "poll failed");
      if (take_state_lock_(100)) {
        model_.mark_node_unreachable(i, now);
        give_state_lock_();
      }
    } else {
      any_success = true;
      poll_success_count_++;
      last_poll_error_[0] = '\0';
    }
  }
  if (any_success && learning_dirty_ &&
      (last_learning_save_ms_ == 0 ||
       static_cast<int32_t>(now - last_learning_save_ms_) >= static_cast<int32_t>(LEARNING_SAVE_INTERVAL_MS))) {
    save_registry_();
    learning_dirty_ = false;
    last_learning_save_ms_ = now;
  }
}

bool LuneTouchCoordinator::poll_node_overview_(size_t node_index, const ::lune_touch::PairedNode &node, uint32_t now_ms) {
  const char *hosts[2]{};
  size_t host_count = 0;
  if (node.hostname[0] != '\0')
    hosts[host_count++] = node.hostname;
  if (node.fallback_ip[0] != '\0' &&
      (host_count == 0 || std::strcmp(node.fallback_ip, hosts[0]) != 0))
    hosts[host_count++] = node.fallback_ip;
  if (host_count == 0)
    return false;

  int last_status = 0;
  for (size_t h = 0; h < host_count; h++) {
    char url[160];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/overview", hosts[h]);

    char body[2048];
    int status = 0;
    if (!fetch_json_(url, body, sizeof(body), &status)) {
      last_status = status;
      ESP_LOGD(TAG, "V6 overview poll failed for %s via %s (%d)", node.node_id, hosts[h], status);
      continue;
    }

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, body);
    if (err) {
      ESP_LOGW(TAG, "V6 overview JSON parse failed for %s via %s: %s", node.node_id, hosts[h], err.c_str());
      note_node_poll_failure_(node_index, "overview invalid_json");
      continue;
    }
    JsonVariant data = doc["data"];
    if (data.isNull())
      data = doc;
    const char *model = data["node"]["model"] | nullptr;
    const char *firmware = data["node"]["firmware"] | nullptr;
    const char *ip = data["node"]["ip"] | nullptr;
    const char *pairing_fingerprint = data["pairing"]["fingerprint"] | nullptr;
    if (pairing_fingerprint == nullptr || pairing_fingerprint[0] == '\0')
      pairing_fingerprint = data["node"]["pairing_fingerprint"] | nullptr;
    if (node.pairing_fingerprint[0] != '\0' && pairing_fingerprint != nullptr &&
        pairing_fingerprint[0] != '\0' &&
        std::strcmp(node.pairing_fingerprint, pairing_fingerprint) != 0) {
      ESP_LOGW(TAG, "V6 identity mismatch for %s via %s", node.node_id, hosts[h]);
      if (take_state_lock_(100)) {
        model_.mark_node_unreachable(node_index, now_ms);
        give_state_lock_();
      }
      note_node_poll_failure_(node_index, "overview identity_mismatch");
      continue;
    }

    if (!take_state_lock_(100))
      return false;
    model_.update_node_metadata(node_index, model, firmware, ip);
    model_.update_node_identity(node_index, pairing_fingerprint);
    model_.mark_node_seen(node_index, now_ms);
    if (node_index < ::lune_touch::MAX_NODES) {
      NodeTelemetryState &telemetry = node_telemetry_[node_index];
      if (!data["manifold"]["flow_c"].isNull()) {
        telemetry.flow_c = data["manifold"]["flow_c"] | 0.0f;
        telemetry.has_flow = true;
      }
      if (!data["manifold"]["return_c"].isNull()) {
        telemetry.return_c = data["manifold"]["return_c"] | 0.0f;
        telemetry.has_return = true;
      }
      if (!data["avg_valve_pct"].isNull()) {
        telemetry.avg_valve_pct = data["avg_valve_pct"] | 0.0f;
        telemetry.has_avg_valve = true;
      }
      telemetry.active_zones = static_cast<uint8_t>(std::min(255, data["active_zones"] | 0));
      if (!data["motor"]["drivers_enabled"].isNull()) {
        telemetry.drivers_enabled = data["motor"]["drivers_enabled"] | false;
        telemetry.has_drivers_enabled = true;
      }
      if (!data["motor"]["fault"].isNull()) {
        telemetry.motor_fault = data["motor"]["fault"] | false;
        telemetry.has_motor_fault = true;
      }
      if (!data["motor"]["current_ma"].isNull()) {
        telemetry.motor_current_ma = data["motor"]["current_ma"] | 0.0f;
        telemetry.has_motor_current = true;
      }
    }
    give_state_lock_();
    note_node_poll_success_(node_index, hosts[h]);
    return true;
  }

  char reason[80];
  snprintf(reason, sizeof(reason), "overview failed status=%d", last_status);
  note_node_poll_failure_(node_index, reason);
  return false;
}

bool LuneTouchCoordinator::poll_node_zones_(size_t node_index, const ::lune_touch::PairedNode &node, uint32_t now_ms) {
  const char *hosts[2]{};
  size_t host_count = 0;
  if (node.hostname[0] != '\0')
    hosts[host_count++] = node.hostname;
  if (node.fallback_ip[0] != '\0' &&
      (host_count == 0 || std::strcmp(node.fallback_ip, hosts[0]) != 0))
    hosts[host_count++] = node.fallback_ip;
  if (host_count == 0)
    return false;

  int last_status = 0;
  for (size_t h = 0; h < host_count; h++) {
    char url[160];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/zones", hosts[h]);

    char body[3072];
    int status = 0;
    if (!fetch_json_(url, body, sizeof(body), &status)) {
      last_status = status;
      ESP_LOGD(TAG, "V6 zones poll failed for %s via %s (%d)", node.node_id, hosts[h], status);
      continue;
    }
    if (!ingest_v6_zones_(node_index, body, now_ms)) {
      ESP_LOGW(TAG, "V6 zones poll returned unusable data for %s via %s", node.node_id, hosts[h]);
      note_node_poll_failure_(node_index, "zones invalid_json");
      continue;
    }
    note_node_poll_success_(node_index, hosts[h]);
    return true;
  }

  for (size_t h = 0; h < host_count; h++) {
    char url[160];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/state", hosts[h]);

    constexpr size_t LEGACY_BODY_CAP = 14336;
    char *body = static_cast<char *>(heap_caps_malloc(LEGACY_BODY_CAP, MALLOC_CAP_SPIRAM));
    if (body == nullptr)
      body = static_cast<char *>(heap_caps_malloc(LEGACY_BODY_CAP, MALLOC_CAP_8BIT));
    if (body == nullptr)
      continue;

    int status = 0;
    const bool fetched = fetch_json_(url, body, LEGACY_BODY_CAP, &status);
    if (fetched && ingest_v6_legacy_state_(node_index, node, body, now_ms)) {
      free(body);
      note_node_poll_success_(node_index, hosts[h]);
      return true;
    }
    last_status = status;
    free(body);
  }

  char reason[80];
  snprintf(reason, sizeof(reason), "zones failed status=%d", last_status);
  note_node_poll_failure_(node_index, reason);
  return false;
}

void LuneTouchCoordinator::note_node_poll_success_(size_t node_index, const char *host) {
  if (node_index >= ::lune_touch::MAX_NODES)
    return;
  std::strncpy(node_last_success_host_[node_index], host != nullptr ? host : "",
               sizeof(node_last_success_host_[node_index]) - 1);
  node_last_success_host_[node_index][sizeof(node_last_success_host_[node_index]) - 1] = '\0';
  node_last_failure_[node_index][0] = '\0';
}

void LuneTouchCoordinator::note_node_poll_failure_(size_t node_index, const char *reason) {
  if (node_index >= ::lune_touch::MAX_NODES)
    return;
  const char *next_reason = reason != nullptr ? reason : "poll failed";
  const bool changed = std::strcmp(node_last_failure_[node_index], next_reason) != 0;
  std::strncpy(node_last_failure_[node_index], reason != nullptr ? reason : "poll failed",
               sizeof(node_last_failure_[node_index]) - 1);
  node_last_failure_[node_index][sizeof(node_last_failure_[node_index]) - 1] = '\0';
  if (changed) {
    char message[112];
    snprintf(message, sizeof(message), "node %u %s", static_cast<unsigned>(node_index), next_reason);
    log_event_("warn", "poll", message);
  }
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

bool LuneTouchCoordinator::post_json_(const char *url, const char *payload, char *body,
                                      size_t body_capacity, int *status_code) {
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

  const char *post_body = payload != nullptr ? payload : "{}";
  esp_http_client_set_header(client, "Content-Type", "application/json");
  esp_http_client_set_post_field(client, post_body, std::strlen(post_body));

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
    const bool has_valve = !zone["valve_pct"].isNull();
    const float temp = has_temp ? (zone["temperature_c"] | 0.0f) : 0.0f;
    const float setpoint = has_setpoint ? (zone["setpoint_c"] | 0.0f) : 0.0f;
    const float valve = has_valve ? (zone["valve_pct"] | 0.0f) : 0.0f;
    const char *status = zone["state"] | nullptr;
    if (status == nullptr)
      status = zone["status"] | "unknown";
    const bool fresh = zone["fresh"] | true;
    if (model_.update_zone_live_by_binding(node_index, static_cast<size_t>(zone_number - 1),
                                           temp, has_temp, setpoint, has_setpoint,
                                           status, fresh, now_ms, valve, has_valve))
      updated++;
    JsonVariant forecast = zone["forecast"];
    const uint8_t exterior_walls = forecast["exterior_walls"] | zone["exterior_walls"] | 0;
    const float wind_exposure = forecast["wind_exposure"] | zone["wind_exposure"] | 0.5f;
    const float solar_gain = forecast["solar_gain"] | zone["solar_gain"] | 0.3f;
    const uint8_t thermal_lead_h = forecast["thermal_lead_h"] | zone["thermal_lead_h"] | 4;
    const float max_offset_c = forecast["max_offset_c"] | zone["max_offset_c"] | 1.5f;
    model_.update_zone_forecast_profile_by_binding(node_index, static_cast<size_t>(zone_number - 1),
                                                   exterior_walls, wind_exposure, solar_gain,
                                                   thermal_lead_h, max_offset_c);
  }
  if (updated > 0) {
    model_.mark_node_seen(node_index, now_ms);
    learning_dirty_ = true;
  }
  give_state_lock_();
  return updated > 0;
}

bool LuneTouchCoordinator::ingest_v6_legacy_state_(size_t node_index, const ::lune_touch::PairedNode &node,
                                                   const char *body, uint32_t now_ms) {
  if (body == nullptr || body[0] == '\0')
    return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err) {
    ESP_LOGW(TAG, "V6 legacy state JSON parse failed: %s", err.c_str());
    return false;
  }

  if (!take_state_lock_(100))
    return false;

  const char *firmware = entity_state_(doc, "text_sensor-firmware_version");
  const char *identity = entity_state_(doc, "text_sensor-mac_address");
  model_.update_node_metadata(node_index, "lune-v6", firmware, nullptr);
  model_.update_node_identity(node_index, identity);
  NodeTelemetryState &telemetry = node_telemetry_[node_index];
  if (entity_number_(doc, "sensor-manifold_flow_temperature", &telemetry.flow_c))
    telemetry.has_flow = true;
  if (entity_number_(doc, "sensor-manifold_return_temperature", &telemetry.return_c))
    telemetry.has_return = true;
  telemetry.drivers_enabled = state_is_on_(entity_state_(doc, "switch-motor_drivers_enabled"));
  telemetry.has_drivers_enabled = true;
  telemetry.motor_fault = false;
  telemetry.has_motor_fault = true;

  size_t updated = 0;
  float valve_sum = 0.0f;
  size_t valve_count = 0;
  uint8_t active_zones = 0;
  for (size_t zone_number = 1; zone_number <= ::lune_touch::ZONES_PER_NODE; zone_number++) {
    char temp_key[40];
    char setpoint_key[40];
    char state_key[40];
    char enabled_key[40];
    char valve_key[40];
    char fault_key[48];
    snprintf(temp_key, sizeof(temp_key), "sensor-zone_%u_temperature", static_cast<unsigned>(zone_number));
    snprintf(setpoint_key, sizeof(setpoint_key), "number-zone_%u_setpoint", static_cast<unsigned>(zone_number));
    snprintf(state_key, sizeof(state_key), "text_sensor-zone_%u_state", static_cast<unsigned>(zone_number));
    snprintf(enabled_key, sizeof(enabled_key), "switch-zone_%u_enabled", static_cast<unsigned>(zone_number));
    snprintf(valve_key, sizeof(valve_key), "sensor-zone_%u_valve_pct", static_cast<unsigned>(zone_number));
    snprintf(fault_key, sizeof(fault_key), "text_sensor-motor_%u_last_fault", static_cast<unsigned>(zone_number));

    float temp = 0.0f;
    float setpoint = 0.0f;
    float valve_pct = 0.0f;
    const bool has_temp = entity_number_(doc, temp_key, &temp);
    const bool has_setpoint = entity_number_(doc, setpoint_key, &setpoint);
    const bool has_valve = entity_number_(doc, valve_key, &valve_pct);
    if (has_valve) {
      valve_sum += valve_pct;
      valve_count++;
      if (valve_pct > 0.5f)
        active_zones++;
    }
    const char *fault = entity_state_(doc, fault_key);
    if (fault != nullptr && fault[0] != '\0' && std::strcmp(fault, "NONE") != 0 &&
        std::strcmp(fault, "none") != 0 && std::strcmp(fault, "OK") != 0 &&
        std::strcmp(fault, "ok") != 0) {
      telemetry.motor_fault = true;
    }
    const bool enabled = state_is_on_(entity_state_(doc, enabled_key));
    if (!has_temp && !has_setpoint)
      continue;

    char status[16];
    legacy_zone_status_(entity_state_(doc, state_key), enabled, has_temp, temp, has_setpoint, setpoint,
                        status, sizeof(status));

    const size_t zone_index = zone_number - 1;
    bool stored = model_.update_zone_live_by_binding(node_index, zone_index, temp, has_temp,
                                                     setpoint, has_setpoint, status,
                                                     enabled && has_temp, now_ms, valve_pct, has_valve);
    if (!stored) {
      char room_id[32];
      char room_name[48];
      snprintf(room_id, sizeof(room_id), "v6%u-z%u", static_cast<unsigned>(node_index + 1),
               static_cast<unsigned>(zone_number));
      snprintf(room_name, sizeof(room_name), "%s Z%u",
               node.node_id[0] != '\0' ? node.node_id : "V6",
               static_cast<unsigned>(zone_number));
      if (model_.bind_zone(room_id, room_name, node_index, zone_index)) {
        stored = model_.update_zone_live_by_binding(node_index, zone_index, temp, has_temp,
                                                    setpoint, has_setpoint, status,
                                                    enabled && has_temp, now_ms, valve_pct, has_valve);
      }
    }
    if (stored)
      updated++;
  }
  if (valve_count > 0) {
    telemetry.avg_valve_pct = valve_sum / static_cast<float>(valve_count);
    telemetry.has_avg_valve = true;
    telemetry.active_zones = active_zones;
  }

  if (updated > 0) {
    model_.mark_node_seen(node_index, now_ms);
    learning_dirty_ = true;
  }
  give_state_lock_();
  return updated > 0;
}

bool LuneTouchCoordinator::fetch_open_meteo_(float latitude, float longitude, char *error, size_t error_len,
                                             uint8_t *hours_count, float *min_temp_c, float *max_wind_ms,
                                             float *peak_wind_dir_deg, float *max_solar_wm2,
                                             ForecastHourState *hours_out, size_t hours_capacity) {
  if (error != nullptr && error_len > 0)
    error[0] = '\0';
  if (hours_count != nullptr)
    *hours_count = 0;

  char url[320];
  snprintf(url, sizeof(url),
           "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f"
           "&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,shortwave_radiation"
           "&forecast_days=3&timeformat=unixtime&wind_speed_unit=ms&timezone=auto",
           latitude, longitude);

  esp_http_client_config_t cfg{};
  cfg.url = url;
  cfg.method = HTTP_METHOD_GET;
  cfg.timeout_ms = 8000;
  cfg.disable_auto_redirect = true;
  cfg.crt_bundle_attach = esp_crt_bundle_attach;
  cfg.buffer_size = 2048;

  constexpr size_t BODY_CAP = 16384;
  char *body = static_cast<char *>(heap_caps_malloc(BODY_CAP, MALLOC_CAP_SPIRAM));
  if (body == nullptr)
    body = static_cast<char *>(heap_caps_malloc(BODY_CAP, MALLOC_CAP_8BIT));
  if (body == nullptr) {
    snprintf(error, error_len, "no_body_heap");
    return false;
  }

  esp_http_client_handle_t client = esp_http_client_init(&cfg);
  if (client == nullptr) {
    free(body);
    snprintf(error, error_len, "http_init_failed");
    return false;
  }

  bool ok = false;
  esp_err_t err = esp_http_client_open(client, 0);
  if (err == ESP_OK) {
    esp_http_client_fetch_headers(client);
    const int status = esp_http_client_get_status_code(client);
    const int len = esp_http_client_read_response(client, body, BODY_CAP - 1);
    if (status == 200 && len > 0) {
      body[len] = '\0';

      JsonDocument filter;
      filter["hourly"]["temperature_2m"] = true;
      filter["hourly"]["wind_speed_10m"] = true;
      filter["hourly"]["wind_direction_10m"] = true;
      filter["hourly"]["shortwave_radiation"] = true;

      JsonDocument doc;
      DeserializationError jerr = deserializeJson(doc, body, len, DeserializationOption::Filter(filter));
      if (!jerr) {
        JsonArray temps = doc["hourly"]["temperature_2m"].as<JsonArray>();
        JsonArray winds = doc["hourly"]["wind_speed_10m"].as<JsonArray>();
        JsonArray dirs = doc["hourly"]["wind_direction_10m"].as<JsonArray>();
        JsonArray solar = doc["hourly"]["shortwave_radiation"].as<JsonArray>();
        const size_t count = temps.size();
        if (count >= 24 && winds.size() >= count && dirs.size() >= count && solar.size() >= count) {
          float min_temp = temps[0] | 0.0f;
          float max_wind = 0.0f;
          float wind_dir = 0.0f;
          float max_solar = 0.0f;
          uint8_t kept = 0;
          for (size_t i = 0; i < count && kept < 72; i++, kept++) {
            const float temp = temps[i] | 0.0f;
            const float wind = winds[i] | 0.0f;
            const float dir = dirs[i] | 0.0f;
            const float sun = solar[i] | 0.0f;
            if (hours_out != nullptr && kept < hours_capacity)
              hours_out[kept] = {temp, wind, dir, sun};
            if (temp < min_temp)
              min_temp = temp;
            if (wind > max_wind) {
              max_wind = wind;
              wind_dir = dir;
            }
            if (sun > max_solar)
              max_solar = sun;
          }
          if (hours_count != nullptr)
            *hours_count = kept;
          if (min_temp_c != nullptr)
            *min_temp_c = min_temp;
          if (max_wind_ms != nullptr)
            *max_wind_ms = max_wind;
          if (peak_wind_dir_deg != nullptr)
            *peak_wind_dir_deg = wind_dir;
          if (max_solar_wm2 != nullptr)
            *max_solar_wm2 = max_solar;
          ok = true;
        } else {
          snprintf(error, error_len, "short_forecast");
        }
      } else {
        snprintf(error, error_len, "json_%s", jerr.c_str());
      }
    } else {
      snprintf(error, error_len, "http_%d_len_%d", status, len);
    }
  } else {
    snprintf(error, error_len, "%s", esp_err_to_name(err));
  }

  esp_http_client_close(client);
  esp_http_client_cleanup(client);
  free(body);
  return ok;
}

void LuneTouchCoordinator::recompute_forecast_decisions_() {
  forecast_decision_count_ = 0;
  if (forecast_hours_count_ == 0)
    return;

  uint8_t day_index = 0;
  uint16_t minute_of_day = 0;
  const bool time_valid = current_schedule_time_(time_, &day_index, &minute_of_day);

  for (size_t i = 0; i < model_.zone_count() &&
                     forecast_decision_count_ < ::lune_touch::MAX_HOUSE_ZONES; i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone == nullptr || !zone->enabled)
      continue;

    ForecastDecisionState &out = forecast_decisions_[forecast_decision_count_++];
    std::strncpy(out.room_id, zone->room_id, sizeof(out.room_id) - 1);
    out.room_id[sizeof(out.room_id) - 1] = '\0';
    std::strncpy(out.room_name, zone->room_name, sizeof(out.room_name) - 1);
    out.room_name[sizeof(out.room_name) - 1] = '\0';
    out.node_index = zone->node_index;
    out.zone_index = zone->zone_index;
    const auto effective = ::lune_touch::HouseModel::effective_comfort(*zone, time_valid,
                                                                       day_index, minute_of_day);
    out.comfort_setpoint_c = effective.setpoint_c;
    out.priority = zone->priority;
    if (live == nullptr || !live->fresh)
      continue;

    const float indoor_ref_c = out.comfort_setpoint_c;
    const size_t last = std::min(static_cast<size_t>(forecast_hours_count_) - 1,
                                 static_cast<size_t>(zone->thermal_lead_h));
    float peak_load = 0.0f;
    int8_t peak_in_h = -1;
    for (size_t h = 0; h <= last; h++) {
      const float load = zone_hour_load_(forecast_hours_[h], *zone, indoor_ref_c);
      if (load > peak_load) {
        peak_load = load;
        peak_in_h = static_cast<int8_t>(h);
      }
    }
    if (peak_in_h < 0)
      peak_in_h = 0;
    const float above = peak_load - LOAD_THRESHOLD;
    const float priority_gain = 1.0f + 0.1f * static_cast<float>(out.priority > 0 ? out.priority - 1 : 0);
    const float offset_c = above > 0.0f ? std::fmin(zone->max_offset_c, above * GAIN_C_PER_LOAD * priority_gain) : 0.0f;

    out.offset_c = offset_c;
    out.peak_load = peak_load;
    out.peak_in_h = peak_in_h;
    out.active = offset_c > 0.01f;
  }
}

ForecastDispatchSummary LuneTouchCoordinator::dispatch_forecast_commands_() {
  struct DispatchItem {
    ForecastDecisionState decision{};
    ::lune_touch::PairedNode node{};
  };

  ForecastDispatchSummary summary{};
  DispatchItem items[::lune_touch::MAX_HOUSE_ZONES]{};
  size_t item_count = 0;
  const uint32_t now = esphome::millis();
  bool ledger_changed = false;

  if (!take_state_lock_(100))
    return summary;
  for (size_t i = 0; i < forecast_decision_count_ && item_count < ::lune_touch::MAX_HOUSE_ZONES; i++) {
    const ForecastDecisionState &decision = forecast_decisions_[i];
    if (!decision.active || decision.offset_c <= 0.01f)
      continue;
    summary.active++;
    if (ledger_.has_recent_similar("forecast", decision.node_index, decision.zone_index,
                                   decision.offset_c, now, FORECAST_COMMAND_DEDUPE_MS,
                                   FORECAST_COMMAND_EPSILON_C)) {
      summary.skipped++;
      continue;
    }
    auto append_blocked_record = [&](::lune_touch::CommandResult result, const char *reason) {
      ::lune_touch::CommandRecord record{};
      snprintf(record.request_id, sizeof(record.request_id), "fb-%lu-%02u",
               static_cast<unsigned long>(now), static_cast<unsigned>(i));
      std::strncpy(record.source, "forecast", sizeof(record.source) - 1);
      std::strncpy(record.reason, reason, sizeof(record.reason) - 1);
      record.node_index = decision.node_index;
      record.zone_index = decision.zone_index;
      record.requested_offset_c = decision.offset_c;
      record.accepted_offset_c = 0.0f;
      record.created_at_ms = now;
      record.expires_at_ms = now;
      record.result = result;
      ledger_.append(record);
      ledger_changed = true;
    };
    const auto *node = model_.node(decision.node_index);
    if (node == nullptr || (!node->reachable && std::strcmp(node->firmware, "mock") != 0)) {
      summary.blocked_unreachable++;
      summary.skipped++;
      append_blocked_record(::lune_touch::CommandResult::BLOCKED_UNREACHABLE,
                            "forecast blocked: node unreachable");
      continue;
    }
    if (node->trust != ::lune_touch::NodeTrust::TRUSTED) {
      summary.blocked_untrusted++;
      summary.skipped++;
      append_blocked_record(::lune_touch::CommandResult::BLOCKED_UNTRUSTED,
                            "forecast blocked: node untrusted");
      continue;
    }
    if (model_.is_node_stale(decision.node_index, now)) {
      summary.blocked_stale++;
      summary.skipped++;
      append_blocked_record(::lune_touch::CommandResult::BLOCKED_STALE,
                            "forecast blocked: node stale");
      continue;
    }
    items[item_count].decision = decision;
    items[item_count].node = *node;
    item_count++;
  }
  give_state_lock_();

  for (size_t i = 0; i < item_count; i++) {
    const ForecastDecisionState &decision = items[i].decision;
    const ::lune_touch::PairedNode &node = items[i].node;

    ::lune_touch::CommandRecord record{};
    snprintf(record.request_id, sizeof(record.request_id), "fc-%lu-%02u",
             static_cast<unsigned long>(now), static_cast<unsigned>(i));
    std::strncpy(record.source, "forecast", sizeof(record.source) - 1);
    snprintf(record.reason, sizeof(record.reason), "weather peak in %dh",
             static_cast<int>(decision.peak_in_h));
    record.node_index = decision.node_index;
    record.zone_index = decision.zone_index;
    record.requested_offset_c = decision.offset_c;
    record.created_at_ms = now;
    record.expires_at_ms = now + FORECAST_COMMAND_TTL_S * 1000UL;
    record.result = ::lune_touch::CommandResult::PENDING;

    ::lune_touch::CommandRecord final_record = record;
    const bool sent = send_v6_setpoint_command_(node, decision.zone_index, record,
                                                FORECAST_COMMAND_TTL_S, &final_record);
    if (!sent)
      final_record.result = ::lune_touch::CommandResult::FAILED;

    if (final_record.result == ::lune_touch::CommandResult::ACCEPTED ||
        final_record.result == ::lune_touch::CommandResult::PENDING) {
      summary.sent++;
    } else {
      summary.failed++;
    }
    if (take_state_lock_(100)) {
      ledger_.append(final_record);
      give_state_lock_();
    } else {
      ledger_.append(final_record);
    }
    ledger_changed = true;
  }

  if (ledger_changed)
    save_ledger_();

  if (take_state_lock_(100)) {
    last_forecast_dispatch_ = summary;
    give_state_lock_();
  }
  return summary;
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

  const char *hosts[2]{};
  size_t host_count = 0;
  if (node.hostname[0] != '\0')
    hosts[host_count++] = node.hostname;
  if (node.fallback_ip[0] != '\0' &&
      (host_count == 0 || std::strcmp(node.fallback_ip, hosts[0]) != 0))
    hosts[host_count++] = node.fallback_ip;
  if (host_count == 0)
    return false;

  char request_id[64];
  char source[64];
  char reason[128];
  json_escape_(request.request_id, request_id, sizeof(request_id));
  json_escape_("lune-touch", source, sizeof(source));
  json_escape_(request.reason, reason, sizeof(reason));

  char payload[320];
  snprintf(payload, sizeof(payload),
           "{\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\","
           "\"setpoint_offset_c\":%.2f,\"ttl_s\":%lu}",
           request_id, source, reason, request.requested_offset_c,
           static_cast<unsigned long>(ttl_s));

  for (size_t i = 0; i < host_count; i++) {
    char url[320];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/zones/%u/setpoint-command",
             hosts[i], static_cast<unsigned>(zone_index + 1));

    char body[512];
    int status = 0;
    if (!post_json_(url, payload, body, sizeof(body), &status)) {
      ESP_LOGD(TAG, "V6 setpoint command failed via %s (%d)", hosts[i], status);
      continue;
    }

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, body);
    if (err) {
      ESP_LOGW(TAG, "V6 setpoint command JSON parse failed via %s: %s", hosts[i], err.c_str());
      continue;
    }

    JsonVariant data = doc["data"];
    const char *result_name = data["result"] | nullptr;
    if (result_name == nullptr)
      result_name = doc["result"] | "";
    const bool accepted = std::strcmp(result_name, "accepted") == 0 ||
                          (result_name[0] == '\0' && doc["ok"] == true);
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
  return false;
}

bool LuneTouchCoordinator::load_registry_() {
  nvs_handle_t handle;
  if (nvs_open(TOUCH_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return false;

  size_t len = 0;
  esp_err_t err = nvs_get_blob(handle, "registry", nullptr, &len);
  if (err != ESP_OK) {
    nvs_close(handle);
    return false;
  }

  static ::lune_touch::PersistedState state;
  std::memset(&state, 0, sizeof(state));
  if (len == sizeof(state)) {
    err = nvs_get_blob(handle, "registry", &state, &len);
    nvs_close(handle);
    if (err != ESP_OK)
      return false;
  } else if (len == sizeof(PersistedStateV7)) {
    static PersistedStateV7 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V7 ||
        legacy.node_count > ::lune_touch::MAX_NODES ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      return false;
    }
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      state.nodes[i] = legacy.nodes[i];
    for (size_t i = 0; i < legacy.zone_count; i++) {
      copy_legacy_zone_(state.zones[i], legacy.zones[i]);
      state.histories[i] = legacy.histories[i];
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v7 to v8");
  } else if (len == sizeof(PersistedStateV6)) {
    static PersistedStateV6 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V6 ||
        legacy.node_count > ::lune_touch::MAX_NODES ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      return false;
    }
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      state.nodes[i] = legacy.nodes[i];
    for (size_t i = 0; i < legacy.zone_count; i++)
      copy_legacy_zone_(state.zones[i], legacy.zones[i]);
    ESP_LOGI(TAG, "Migrated Touch registry from v6 to v8");
  } else if (len == sizeof(PersistedStateV5)) {
    static PersistedStateV5 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V5 ||
        legacy.node_count > ::lune_touch::MAX_NODES ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      return false;
    }
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      copy_legacy_node_(state.nodes[i], legacy.nodes[i]);
    for (size_t i = 0; i < legacy.zone_count; i++)
      copy_legacy_zone_(state.zones[i], legacy.zones[i]);
    ESP_LOGI(TAG, "Migrated Touch registry from v5 to v8");
  } else if (len == sizeof(PersistedStateV4)) {
    static PersistedStateV4 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V4 ||
        legacy.node_count > ::lune_touch::MAX_NODES ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      return false;
    }
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      copy_legacy_node_(state.nodes[i], legacy.nodes[i]);
    for (size_t i = 0; i < legacy.zone_count; i++) {
      state.zones[i].node_index = legacy.zones[i].node_index;
      state.zones[i].zone_index = legacy.zones[i].zone_index;
      state.zones[i].exterior_walls = legacy.zones[i].exterior_walls;
      state.zones[i].wind_exposure = legacy.zones[i].wind_exposure;
      state.zones[i].solar_gain = legacy.zones[i].solar_gain;
      state.zones[i].thermal_lead_h = legacy.zones[i].thermal_lead_h;
      state.zones[i].max_offset_c = legacy.zones[i].max_offset_c;
      state.zones[i].comfort_setpoint_c = legacy.zones[i].comfort_setpoint_c;
      state.zones[i].comfort_bias_c = legacy.zones[i].comfort_bias_c;
      state.zones[i].schedule_setpoint_c = legacy.zones[i].comfort_setpoint_c;
      state.zones[i].priority = legacy.zones[i].priority;
      state.zones[i].enabled = legacy.zones[i].enabled;
      state.zones[i].schedule_enabled = false;
      std::strncpy(state.zones[i].room_id, legacy.zones[i].room_id,
                   sizeof(state.zones[i].room_id) - 1);
      std::strncpy(state.zones[i].room_name, legacy.zones[i].room_name,
                   sizeof(state.zones[i].room_name) - 1);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v4 to v8");
  } else if (len == sizeof(PersistedStateV3)) {
    static PersistedStateV3 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V3 ||
        legacy.node_count > ::lune_touch::MAX_NODES ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      return false;
    }
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      copy_legacy_node_(state.nodes[i], legacy.nodes[i]);
    for (size_t i = 0; i < legacy.zone_count; i++) {
      state.zones[i].node_index = legacy.zones[i].node_index;
      state.zones[i].zone_index = legacy.zones[i].zone_index;
      state.zones[i].exterior_walls = legacy.zones[i].exterior_walls;
      state.zones[i].wind_exposure = legacy.zones[i].wind_exposure;
      state.zones[i].solar_gain = legacy.zones[i].solar_gain;
      state.zones[i].thermal_lead_h = legacy.zones[i].thermal_lead_h;
      state.zones[i].max_offset_c = legacy.zones[i].max_offset_c;
      state.zones[i].comfort_setpoint_c = legacy.zones[i].comfort_setpoint_c;
      state.zones[i].comfort_bias_c = 0.0f;
      state.zones[i].schedule_setpoint_c = legacy.zones[i].comfort_setpoint_c;
      state.zones[i].priority = legacy.zones[i].priority;
      state.zones[i].enabled = legacy.zones[i].enabled;
      state.zones[i].schedule_enabled = false;
      std::strncpy(state.zones[i].room_id, legacy.zones[i].room_id,
                   sizeof(state.zones[i].room_id) - 1);
      std::strncpy(state.zones[i].room_name, legacy.zones[i].room_name,
                   sizeof(state.zones[i].room_name) - 1);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v3 to v8");
  } else {
    nvs_close(handle);
    return false;
  }

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
  static ::lune_touch::PersistedState state;
  std::memset(&state, 0, sizeof(state));
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

  static ::lune_touch::PersistedLedger state;
  std::memset(&state, 0, sizeof(state));
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
  static ::lune_touch::PersistedLedger state;
  std::memset(&state, 0, sizeof(state));
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

void LuneTouchCoordinator::load_forecast_cache_() {
  nvs_handle_t handle;
  if (nvs_open(WEATHER_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return;
  static PersistedForecastCache cache;
  std::memset(&cache, 0, sizeof(cache));
  size_t len = sizeof(cache);
  const esp_err_t err = nvs_get_blob(handle, "cache", &cache, &len);
  nvs_close(handle);
  if (err != ESP_OK || len != sizeof(cache) || cache.magic != FORECAST_CACHE_MAGIC ||
      cache.version != FORECAST_CACHE_VERSION || cache.hours_count == 0 ||
      cache.hours_count > 72) {
    return;
  }
  forecast_hours_count_ = cache.hours_count;
  for (uint8_t i = 0; i < forecast_hours_count_; i++)
    forecast_hours_[i] = cache.hours[i];
  forecast_min_temp_c_ = cache.min_temp_c;
  forecast_max_wind_ms_ = cache.max_wind_ms;
  forecast_peak_wind_dir_deg_ = cache.peak_wind_dir_deg;
  forecast_max_solar_wm2_ = cache.max_solar_wm2;
  forecast_last_fetch_ms_ = esphome::millis();
  forecast_cache_restored_ = true;
  forecast_boot_refresh_pending_ = true;
  std::strncpy(forecast_status_, "cached", sizeof(forecast_status_) - 1);
  forecast_status_[sizeof(forecast_status_) - 1] = '\0';
  std::strncpy(forecast_last_error_, "restored_cache", sizeof(forecast_last_error_) - 1);
  forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
  recompute_forecast_decisions_();
  ESP_LOGI(TAG, "Restored Touch forecast cache: hours=%u", static_cast<unsigned>(forecast_hours_count_));
}

void LuneTouchCoordinator::save_forecast_cache_() {
  static PersistedForecastCache cache;
  std::memset(&cache, 0, sizeof(cache));
  cache.magic = FORECAST_CACHE_MAGIC;
  cache.version = FORECAST_CACHE_VERSION;
  if (!take_state_lock_(100))
    return;
  cache.hours_count = forecast_hours_count_;
  cache.saved_at_ms = esphome::millis();
  cache.min_temp_c = forecast_min_temp_c_;
  cache.max_wind_ms = forecast_max_wind_ms_;
  cache.peak_wind_dir_deg = forecast_peak_wind_dir_deg_;
  cache.max_solar_wm2 = forecast_max_solar_wm2_;
  for (uint8_t i = 0; i < forecast_hours_count_ && i < 72; i++)
    cache.hours[i] = forecast_hours_[i];
  give_state_lock_();
  if (cache.hours_count == 0)
    return;

  nvs_handle_t handle;
  if (nvs_open(WEATHER_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  if (nvs_set_blob(handle, "cache", &cache, sizeof(cache)) == ESP_OK)
    nvs_commit(handle);
  nvs_close(handle);
}

void LuneTouchCoordinator::clear_forecast_cache_() {
  nvs_handle_t handle;
  if (nvs_open(WEATHER_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  nvs_erase_key(handle, "cache");
  nvs_commit(handle);
  nvs_close(handle);
}

void LuneTouchCoordinator::load_settings_() {
  nvs_handle_t handle;
  if (nvs_open(SETTINGS_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return;
  size_t len = sizeof(coordinator_name_);
  nvs_get_str(handle, "name", coordinator_name_, &len);
  len = sizeof(install_id_);
  nvs_get_str(handle, "install_id", install_id_, &len);
  len = sizeof(site_label_);
  nvs_get_str(handle, "site", site_label_, &len);
  len = sizeof(install_mode_);
  nvs_get_str(handle, "mode", install_mode_, &len);
  uint8_t asgard_enabled = asgard_enabled_ ? 1 : 0;
  if (nvs_get_u8(handle, "asgard_en", &asgard_enabled) == ESP_OK)
    asgard_enabled_ = asgard_enabled != 0;
  len = sizeof(asgard_mode_);
  nvs_get_str(handle, "asgard_mode", asgard_mode_, &len);
  nvs_close(handle);
}

void LuneTouchCoordinator::save_settings_() {
  nvs_handle_t handle;
  if (nvs_open(SETTINGS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  nvs_set_str(handle, "name", coordinator_name_);
  nvs_set_str(handle, "install_id", install_id_);
  nvs_set_str(handle, "site", site_label_);
  nvs_set_str(handle, "mode", install_mode_);
  nvs_set_u8(handle, "asgard_en", asgard_enabled_ ? 1 : 0);
  nvs_set_str(handle, "asgard_mode", asgard_mode_);
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
  if (a >= 0) model_.update_node_identity(a, "hv6-mock-a");
  if (b >= 0) model_.update_node_identity(b, "hv6-mock-b");
  if (c >= 0) model_.update_node_identity(c, "hv6-mock-c");
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
                                    const char *pairing_fingerprint, char *response, size_t capacity) {
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
  model_.update_node_identity(static_cast<size_t>(index), pairing_fingerprint);
  save_registry_();
  char node_id_esc[48];
  char pairing_fingerprint_esc[48];
  json_escape_(node_id != nullptr ? node_id : "", node_id_esc, sizeof(node_id_esc));
  json_escape_(pairing_fingerprint != nullptr ? pairing_fingerprint : "",
               pairing_fingerprint_esc, sizeof(pairing_fingerprint_esc));
  snprintf(response, capacity, "{\"result\":\"stored\",\"node_id\":\"%s\",\"node_index\":%d,"
           "\"pairing_fingerprint\":\"%s\"}",
           node_id_esc, index, pairing_fingerprint_esc);
  char event[112];
  snprintf(event, sizeof(event), "paired node %s", node_id);
  log_event_("info", "commissioning", event);
  return true;
}

bool LuneTouchCoordinator::scan_node_candidate(const char *hostname, const char *fallback_ip,
                                               char *response, size_t capacity) {
  if ((hostname == nullptr || hostname[0] == '\0') &&
      (fallback_ip == nullptr || fallback_ip[0] == '\0')) {
    write_node_scan_json(response, capacity);
    return true;
  }

  char generated_id[24]{};
  make_node_id_(hostname, fallback_ip, generated_id, sizeof(generated_id));

  const char *host = (hostname != nullptr && hostname[0] != '\0') ? hostname : fallback_ip;
  char host_esc[128];
  char ip_esc[48];
  char id_esc[48];
  json_escape_(host != nullptr ? host : "", host_esc, sizeof(host_esc));
  json_escape_(fallback_ip != nullptr ? fallback_ip : "", ip_esc, sizeof(ip_esc));
  json_escape_(generated_id, id_esc, sizeof(id_esc));

  if (!esphome::network::is_connected()) {
    snprintf(response, capacity,
             "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
             "\"hostname\":\"%s\",\"ip\":\"%s\",\"reachable\":false,\"stale\":true,"
             "\"source\":\"manual_probe\",\"error\":\"network_offline\"}]}",
             id_esc, host_esc, ip_esc);
    return false;
  }

  char url[192];
  snprintf(url, sizeof(url), "http://%s/api/hv6/v1/overview", host);

  char body[2048];
  int status = 0;
  if (!fetch_json_(url, body, sizeof(body), &status)) {
    snprintf(response, capacity,
             "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
             "\"hostname\":\"%s\",\"ip\":\"%s\",\"reachable\":false,\"stale\":true,"
             "\"source\":\"manual_probe\",\"http_status\":%d,\"error\":\"probe_failed\"}]}",
             id_esc, host_esc, ip_esc, status);
    return false;
  }

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err) {
    snprintf(response, capacity,
             "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
             "\"hostname\":\"%s\",\"ip\":\"%s\",\"reachable\":false,\"stale\":true,"
             "\"source\":\"manual_probe\",\"http_status\":%d,\"error\":\"invalid_json\"}]}",
             id_esc, host_esc, ip_esc, status);
    return false;
  }

  JsonVariant data = doc["data"];
  if (data.isNull())
    data = doc;
  const char *model = data["node"]["model"] | "lune-v6";
  const char *firmware = data["node"]["firmware"] | "unknown";
  const char *pairing_fingerprint = data["pairing"]["fingerprint"] | nullptr;
  if (pairing_fingerprint == nullptr || pairing_fingerprint[0] == '\0')
    pairing_fingerprint = data["node"]["pairing_fingerprint"] | "";
  const char *reported_ip = data["node"]["ip"] | nullptr;
  if (reported_ip == nullptr || reported_ip[0] == '\0')
    reported_ip = fallback_ip != nullptr ? fallback_ip : "";
  char model_esc[32];
  char firmware_esc[64];
  char pairing_fingerprint_esc[48];
  char reported_ip_esc[48];
  json_escape_(model, model_esc, sizeof(model_esc));
  json_escape_(firmware, firmware_esc, sizeof(firmware_esc));
  json_escape_(pairing_fingerprint, pairing_fingerprint_esc, sizeof(pairing_fingerprint_esc));
  json_escape_(reported_ip, reported_ip_esc, sizeof(reported_ip_esc));

  snprintf(response, capacity,
           "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
           "\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\",\"firmware\":\"%s\","
           "\"pairing_fingerprint\":\"%s\","
           "\"reachable\":true,\"stale\":false,\"source\":\"manual_probe\",\"http_status\":%d}]}",
           id_esc, host_esc, reported_ip_esc, model_esc, firmware_esc,
           pairing_fingerprint_esc, status);
  return true;
}

bool LuneTouchCoordinator::set_node_trust(const char *node_id, ::lune_touch::NodeTrust trust,
                                          char *response, size_t capacity) {
  if (trust == ::lune_touch::NodeTrust::UNPAIRED) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_trust\"}");
    return false;
  }
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const ::lune_touch::PairedNode *target = nullptr;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node != nullptr && node_id != nullptr && std::strcmp(node->node_id, node_id) == 0) {
      target = node;
      break;
    }
  }
  if (target == nullptr) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_not_found\"}");
    return false;
  }
  if (trust == ::lune_touch::NodeTrust::TRUSTED && target->pairing_fingerprint[0] == '\0') {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"identity_required\"}");
    return false;
  }
  if (!model_.update_node_trust(node_id, trust)) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_not_found\"}");
    return false;
  }
  give_state_lock_();
  save_registry_();
  char node_id_esc[48];
  json_escape_(node_id != nullptr ? node_id : "", node_id_esc, sizeof(node_id_esc));
  snprintf(response, capacity, "{\"result\":\"stored\",\"node_id\":\"%s\",\"trust\":\"%s\"}",
           node_id_esc, ::lune_touch::node_trust_name(trust));
  char event[112];
  snprintf(event, sizeof(event), "node %s trust %s",
           node_id != nullptr ? node_id : "", ::lune_touch::node_trust_name(trust));
  log_event_("info", "commissioning", event);
  return true;
}

bool LuneTouchCoordinator::remove_node(const char *node_id, char *response, size_t capacity) {
  if (!model_.remove_node(node_id)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_not_found\"}");
    return false;
  }
  save_registry_();
  char node_id_esc[48];
  json_escape_(node_id != nullptr ? node_id : "", node_id_esc, sizeof(node_id_esc));
  snprintf(response, capacity, "{\"result\":\"removed\",\"node_id\":\"%s\"}", node_id_esc);
  char event[112];
  snprintf(event, sizeof(event), "removed node %s", node_id != nullptr ? node_id : "");
  log_event_("warn", "commissioning", event);
  return true;
}

bool LuneTouchCoordinator::reset_registry(const char *confirmation, char *response, size_t capacity) {
  if (confirmation == nullptr || std::strcmp(confirmation, "reset-registry") != 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"confirmation_required\"}");
    return false;
  }
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  model_ = {};
  model_.set_node_stale_after_ms(node_stale_after_ms_);
  ledger_ = {};
  std::memset(node_last_success_host_, 0, sizeof(node_last_success_host_));
  std::memset(node_last_failure_, 0, sizeof(node_last_failure_));
  last_poll_error_[0] = '\0';
  forecast_decision_count_ = 0;
  last_forecast_dispatch_ = {};
  give_state_lock_();

  nvs_handle_t handle;
  if (nvs_open(TOUCH_NAMESPACE, NVS_READWRITE, &handle) == ESP_OK) {
    nvs_erase_key(handle, "registry");
    nvs_commit(handle);
    nvs_close(handle);
  }
  if (nvs_open(LEDGER_NAMESPACE, NVS_READWRITE, &handle) == ESP_OK) {
    nvs_erase_key(handle, "recent");
    nvs_commit(handle);
    nvs_close(handle);
  }
  snprintf(response, capacity,
           "{\"result\":\"reset\",\"registry\":\"cleared\",\"ledger\":\"cleared\","
           "\"forecast_location\":\"kept\"}");
  log_event_("warn", "recovery", "registry and ledger reset");
  return true;
}

bool LuneTouchCoordinator::bind_room(const char *room_id, const char *room_name, size_t node_index, size_t zone_index,
                                     char *response, size_t capacity) {
  if (!model_.bind_zone(room_id, room_name, node_index, zone_index)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_zone_binding\"}");
    return false;
  }
  save_registry_();
  char room_id_esc[48];
  json_escape_(room_id != nullptr ? room_id : "", room_id_esc, sizeof(room_id_esc));
  snprintf(response, capacity,
           "{\"result\":\"stored\",\"room_id\":\"%s\",\"node_index\":%u,\"zone_index\":%u}",
           room_id_esc, static_cast<unsigned>(node_index), static_cast<unsigned>(zone_index));
  char event[112];
  snprintf(event, sizeof(event), "mapped %s to node %u zone %u",
           room_id != nullptr ? room_id : "", static_cast<unsigned>(node_index),
           static_cast<unsigned>(zone_index));
  log_event_("info", "zones", event);
  return true;
}

bool LuneTouchCoordinator::set_zone_comfort(const char *room_id, float comfort_setpoint_c, uint8_t priority,
                                            float comfort_bias_c, char *response, size_t capacity) {
  if (!std::isfinite(comfort_setpoint_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_comfort_setpoint\"}");
    return false;
  }
  if (!std::isfinite(comfort_bias_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_comfort_bias\"}");
    return false;
  }
  if (!model_.update_zone_comfort(room_id, comfort_setpoint_c, priority, comfort_bias_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  recompute_forecast_decisions_();
  save_registry_();
  const auto resolved = model_.resolve_room(room_id);
  const float stored = resolved.binding != nullptr ? resolved.binding->comfort_setpoint_c : comfort_setpoint_c;
  const float stored_bias = resolved.binding != nullptr ? resolved.binding->comfort_bias_c : comfort_bias_c;
  const float effective = resolved.binding != nullptr
                              ? ::lune_touch::HouseModel::effective_comfort_setpoint_c(*resolved.binding)
                              : stored + stored_bias;
  const uint8_t stored_priority = resolved.binding != nullptr ? resolved.binding->priority : priority;
  char room_id_esc[48];
  json_escape_(room_id != nullptr ? room_id : "", room_id_esc, sizeof(room_id_esc));
  snprintf(response, capacity,
           "{\"result\":\"stored\",\"room_id\":\"%s\",\"comfort_setpoint_c\":%.1f,"
           "\"comfort_bias_c\":%.1f,\"effective_setpoint_c\":%.1f,\"priority\":%u}",
           room_id_esc, stored, stored_bias, effective,
           static_cast<unsigned>(stored_priority));
  char event[112];
  snprintf(event, sizeof(event), "comfort %s %.1f C bias %.1f P%u",
           room_id != nullptr ? room_id : "", stored, stored_bias,
           static_cast<unsigned>(stored_priority));
  log_event_("info", "zones", event);
  return true;
}

bool LuneTouchCoordinator::set_zone_schedule(const char *room_id, bool enabled, uint8_t day_mask,
                                             uint16_t start_min, uint16_t end_min, float setpoint_c,
                                             char *response, size_t capacity) {
  if (!std::isfinite(setpoint_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_schedule_setpoint\"}");
    return false;
  }
  if (start_min > 1439 || end_min > 1440 || start_min >= end_min) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_schedule_window\"}");
    return false;
  }
  if (enabled && (day_mask & 0x7F) == 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_schedule_days\"}");
    return false;
  }
  if (!model_.update_zone_schedule(room_id, enabled, day_mask, start_min, end_min, setpoint_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  save_registry_();
  const auto resolved = model_.resolve_room(room_id);
  const auto *zone = resolved.binding;
  char room_id_esc[48];
  json_escape_(room_id != nullptr ? room_id : "", room_id_esc, sizeof(room_id_esc));
  snprintf(response, capacity,
           "{\"result\":\"stored\",\"room_id\":\"%s\",\"schedule\":{\"enabled\":%s,"
           "\"day_mask\":%u,\"start_min\":%u,\"end_min\":%u,\"setpoint_c\":%.1f}}",
           room_id_esc,
           zone != nullptr && zone->schedule_enabled ? "true" : "false",
           static_cast<unsigned>(zone != nullptr ? zone->schedule_day_mask : day_mask),
           static_cast<unsigned>(zone != nullptr ? zone->schedule_start_min : start_min),
           static_cast<unsigned>(zone != nullptr ? zone->schedule_end_min : end_min),
           zone != nullptr ? zone->schedule_setpoint_c : setpoint_c);
  char event[112];
  snprintf(event, sizeof(event), "schedule %s %s %u-%u %.1f C",
           room_id != nullptr ? room_id : "",
           zone != nullptr && zone->schedule_enabled ? "on" : "off",
           static_cast<unsigned>(zone != nullptr ? zone->schedule_start_min : start_min),
           static_cast<unsigned>(zone != nullptr ? zone->schedule_end_min : end_min),
           zone != nullptr ? zone->schedule_setpoint_c : setpoint_c);
  log_event_("info", "zones", event);
  return true;
}

bool LuneTouchCoordinator::set_zone_forecast_profile(const char *room_id, uint8_t exterior_walls,
                                                     float wind_exposure, float solar_gain,
                                                     uint8_t thermal_lead_h, float max_offset_c,
                                                     char *response, size_t capacity) {
  if (!std::isfinite(wind_exposure) || !std::isfinite(solar_gain) || !std::isfinite(max_offset_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_forecast_profile\"}");
    return false;
  }
  if (!model_.update_zone_forecast_profile(room_id, exterior_walls, wind_exposure, solar_gain,
                                           thermal_lead_h, max_offset_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  recompute_forecast_decisions_();
  save_registry_();
  const auto resolved = model_.resolve_room(room_id);
  const auto *zone = resolved.binding;
  char room_id_esc[48];
  json_escape_(room_id != nullptr ? room_id : "", room_id_esc, sizeof(room_id_esc));
  snprintf(response, capacity,
           "{\"result\":\"stored\",\"room_id\":\"%s\",\"forecast\":{\"exterior_walls\":%u,"
           "\"wind_exposure\":%.2f,\"solar_gain\":%.2f,\"thermal_lead_h\":%u,"
           "\"max_offset_c\":%.2f}}",
           room_id_esc,
           static_cast<unsigned>(zone != nullptr ? zone->exterior_walls : (exterior_walls & 0x0F)),
           zone != nullptr ? zone->wind_exposure : wind_exposure,
           zone != nullptr ? zone->solar_gain : solar_gain,
           static_cast<unsigned>(zone != nullptr ? zone->thermal_lead_h : thermal_lead_h),
           zone != nullptr ? zone->max_offset_c : max_offset_c);
  char event[112];
  snprintf(event, sizeof(event), "forecast profile %s walls %u lead %u",
           room_id != nullptr ? room_id : "",
           static_cast<unsigned>(zone != nullptr ? zone->exterior_walls : (exterior_walls & 0x0F)),
           static_cast<unsigned>(zone != nullptr ? zone->thermal_lead_h : thermal_lead_h));
  log_event_("info", "forecast", event);
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

  const uint32_t now = esphome::millis();
  ::lune_touch::PairedNode target_node{};
  uint8_t target_node_index = 0;
  uint8_t target_zone = 0;
  bool target_stale = true;
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
  target_stale = model_.is_node_stale(target_node_index, now);
  give_state_lock_();

  ::lune_touch::CommandRecord record{};
  snprintf(record.request_id, sizeof(record.request_id), "touch-%lu",
           static_cast<unsigned long>(now));
  std::strncpy(record.source, "dashboard", sizeof(record.source) - 1);
  std::strncpy(record.reason, reason != nullptr && reason[0] != '\0' ? reason : "dashboard command",
               sizeof(record.reason) - 1);
  record.node_index = target_node_index;
  record.zone_index = target_zone;
  record.requested_offset_c = requested_offset_c;
  record.accepted_offset_c = 0.0f;
  record.created_at_ms = now;
  record.expires_at_ms = record.created_at_ms + ttl_s * 1000UL;
  record.result = ::lune_touch::CommandResult::PENDING;

  ::lune_touch::CommandRecord final_record = record;
  const bool is_mock_node = std::strcmp(target_node.firmware, "mock") == 0;
  if (!target_node.reachable && !is_mock_node) {
    final_record.result = ::lune_touch::CommandResult::BLOCKED_UNREACHABLE;
    std::strncpy(final_record.reason, "blocked: node unreachable", sizeof(final_record.reason) - 1);
  } else if (target_node.trust != ::lune_touch::NodeTrust::TRUSTED) {
    final_record.result = ::lune_touch::CommandResult::BLOCKED_UNTRUSTED;
    std::strncpy(final_record.reason, "blocked: node not trusted", sizeof(final_record.reason) - 1);
  } else if (target_stale && !is_mock_node) {
    final_record.result = ::lune_touch::CommandResult::BLOCKED_STALE;
    std::strncpy(final_record.reason, "blocked: node stale", sizeof(final_record.reason) - 1);
  } else {
    const bool sent = send_v6_setpoint_command_(target_node, target_zone, record, ttl_s, &final_record);
    if (!sent)
      final_record.result = ::lune_touch::CommandResult::FAILED;
  }

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
  char event[112];
  snprintf(event, sizeof(event), "setpoint %s %s",
           final_record.request_id, ::lune_touch::command_result_name(final_record.result));
  log_event_(final_record.result == ::lune_touch::CommandResult::ACCEPTED ? "info" : "warn",
             "commands", event);
  return true;
}

bool LuneTouchCoordinator::request_motor_action(const char *room_id, const char *action, char *response,
                                                size_t capacity) {
  const char *v6_command = nullptr;
  if (std::strcmp(action != nullptr ? action : "", "reset_fault") == 0) {
    v6_command = "motor_reset_fault";
  } else if (std::strcmp(action != nullptr ? action : "", "reset_learned") == 0) {
    v6_command = "motor_reset_learned_factors";
  } else if (std::strcmp(action != nullptr ? action : "", "relearn") == 0) {
    v6_command = "motor_reset_and_relearn";
  } else {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_motor_action\"}");
    return false;
  }

  const uint32_t now = esphome::millis();
  ::lune_touch::PairedNode target_node{};
  uint8_t target_node_index = 0;
  uint8_t target_zone = 0;
  bool target_stale = true;
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
  target_stale = model_.is_node_stale(target_node_index, now);
  give_state_lock_();

  const bool is_mock_node = std::strcmp(target_node.firmware, "mock") == 0;
  const char *result = "accepted";
  const char *error = "";
  if (!target_node.reachable && !is_mock_node) {
    result = "blocked_unreachable";
    error = "node_unreachable";
  } else if (target_node.trust != ::lune_touch::NodeTrust::TRUSTED) {
    result = "blocked_untrusted";
    error = "node_not_trusted";
  } else if (target_stale && !is_mock_node) {
    result = "blocked_stale";
    error = "node_stale";
  } else if (!is_mock_node) {
    if (!esphome::network::is_connected()) {
      result = "failed";
      error = "network_offline";
    } else {
      const char *hosts[2]{};
      size_t host_count = 0;
      if (target_node.hostname[0] != '\0')
        hosts[host_count++] = target_node.hostname;
      if (target_node.fallback_ip[0] != '\0' &&
          (host_count == 0 || std::strcmp(target_node.fallback_ip, hosts[0]) != 0))
        hosts[host_count++] = target_node.fallback_ip;
      if (host_count == 0) {
        result = "failed";
        error = "missing_host";
      } else {
        char payload[128];
        snprintf(payload, sizeof(payload), "{\"command\":\"%s\",\"zone\":%u}",
                 v6_command, static_cast<unsigned>(target_zone + 1));
        bool accepted = false;
        bool rejected = false;
        for (size_t i = 0; i < host_count; i++) {
          char url[288];
          snprintf(url, sizeof(url), "http://%s/api/hv6/v1/commands", hosts[i]);
          char body[384];
          int status = 0;
          if (!post_json_(url, payload, body, sizeof(body), &status)) {
            ESP_LOGD(TAG, "V6 motor command failed via %s (%d)", hosts[i], status);
            continue;
          }
          JsonDocument doc;
          const DeserializationError err = deserializeJson(doc, body);
          if (err || doc["ok"] == false) {
            rejected = true;
            ESP_LOGW(TAG, "V6 motor command rejected via %s", hosts[i]);
            continue;
          }
          accepted = true;
          break;
        }
        if (!accepted) {
          result = "failed";
          error = rejected ? "v6_rejected" : "post_failed";
        }
      }
    }
  }

  char action_esc[32];
  char command_esc[48];
  char target_node_esc[48];
  char error_esc[48];
  json_escape_(action != nullptr ? action : "", action_esc, sizeof(action_esc));
  json_escape_(v6_command, command_esc, sizeof(command_esc));
  json_escape_(target_node.node_id, target_node_esc, sizeof(target_node_esc));
  json_escape_(error, error_esc, sizeof(error_esc));
  snprintf(response, capacity,
           "{\"result\":\"%s\",\"action\":\"%s\",\"v6_command\":\"%s\","
           "\"target_node\":\"%s\",\"zone_index\":%u,\"error\":\"%s\"}",
           result, action_esc, command_esc, target_node_esc,
           static_cast<unsigned>(target_zone), error_esc);
  char event[112];
  snprintf(event, sizeof(event), "motor %s %s", action != nullptr ? action : "", result);
  log_event_(std::strcmp(result, "accepted") == 0 ? "info" : "warn", "recovery", event);
  return true;
}

bool LuneTouchCoordinator::set_forecast_location(float latitude, float longitude, const char *mode,
                                                 char *response, size_t capacity) {
  if (!std::isfinite(latitude) || !std::isfinite(longitude) ||
      latitude < -90.0f || latitude > 90.0f || longitude < -180.0f || longitude > 180.0f ||
      (std::fabs(latitude) < 0.0001f && std::fabs(longitude) < 0.0001f)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_location\"}");
    return false;
  }
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  forecast_latitude_ = latitude;
  forecast_longitude_ = longitude;
  std::strncpy(forecast_location_mode_, mode != nullptr && mode[0] != '\0' ? mode : "manual",
               sizeof(forecast_location_mode_) - 1);
  forecast_location_mode_[sizeof(forecast_location_mode_) - 1] = '\0';
  std::strncpy(forecast_status_, "stale", sizeof(forecast_status_) - 1);
  forecast_status_[sizeof(forecast_status_) - 1] = '\0';
  forecast_last_error_[0] = '\0';
  forecast_hours_count_ = 0;
  forecast_decision_count_ = 0;
  forecast_cache_restored_ = false;
  forecast_boot_refresh_pending_ = false;
  last_forecast_dispatch_ = {};
  save_forecast_settings_();
  give_state_lock_();
  clear_forecast_cache_();
  snprintf(response, capacity, "{\"result\":\"saved\",\"latitude\":%.6f,\"longitude\":%.6f}",
           latitude, longitude);
  log_event_("info", "forecast", "location updated");
  return true;
}

bool LuneTouchCoordinator::set_settings(const char *coordinator_name, const char *install_id,
                                        const char *site_label, const char *install_mode,
                                        bool has_asgard_enabled, bool asgard_enabled,
                                        const char *asgard_mode,
                                        char *response, size_t capacity) {
  if ((coordinator_name == nullptr || coordinator_name[0] == '\0') &&
      (install_id == nullptr || install_id[0] == '\0') &&
      (site_label == nullptr || site_label[0] == '\0') &&
      (install_mode == nullptr || install_mode[0] == '\0') &&
      !has_asgard_enabled &&
      (asgard_mode == nullptr || asgard_mode[0] == '\0')) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"settings_required\"}");
    return false;
  }
  if (install_mode != nullptr && install_mode[0] != '\0' &&
      std::strcmp(install_mode, "commissioning") != 0 &&
      std::strcmp(install_mode, "active") != 0 &&
      std::strcmp(install_mode, "service") != 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_install_mode\"}");
    return false;
  }
  if (asgard_mode != nullptr && asgard_mode[0] != '\0' &&
      std::strcmp(asgard_mode, "advisory") != 0 &&
      std::strcmp(asgard_mode, "disabled") != 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_asgard_mode\"}");
    return false;
  }
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  if (coordinator_name != nullptr && coordinator_name[0] != '\0') {
    std::strncpy(coordinator_name_, coordinator_name, sizeof(coordinator_name_) - 1);
    coordinator_name_[sizeof(coordinator_name_) - 1] = '\0';
  }
  if (install_id != nullptr && install_id[0] != '\0') {
    std::strncpy(install_id_, install_id, sizeof(install_id_) - 1);
    install_id_[sizeof(install_id_) - 1] = '\0';
  }
  if (site_label != nullptr && site_label[0] != '\0') {
    std::strncpy(site_label_, site_label, sizeof(site_label_) - 1);
    site_label_[sizeof(site_label_) - 1] = '\0';
  }
  if (install_mode != nullptr && install_mode[0] != '\0') {
    std::strncpy(install_mode_, install_mode, sizeof(install_mode_) - 1);
    install_mode_[sizeof(install_mode_) - 1] = '\0';
  }
  if (has_asgard_enabled)
    asgard_enabled_ = asgard_enabled;
  if (asgard_mode != nullptr && asgard_mode[0] != '\0') {
    std::strncpy(asgard_mode_, asgard_mode, sizeof(asgard_mode_) - 1);
    asgard_mode_[sizeof(asgard_mode_) - 1] = '\0';
    if (std::strcmp(asgard_mode_, "disabled") == 0)
      asgard_enabled_ = false;
  }
  save_settings_();
  give_state_lock_();
  snprintf(response, capacity, "{\"result\":\"saved\",\"install_mode\":\"%s\","
           "\"asgard_enabled\":%s,\"asgard_mode\":\"%s\"}",
           install_mode_, asgard_enabled_ ? "true" : "false", asgard_mode_);
  log_event_("info", "settings", "coordinator settings updated");
  return true;
}

bool LuneTouchCoordinator::request_forecast_fetch(char *response, size_t capacity) {
  float latitude = 0.0f;
  float longitude = 0.0f;
  if (take_state_lock_(100)) {
    latitude = forecast_latitude_;
    longitude = forecast_longitude_;
  } else {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }

  if (!std::isfinite(latitude) || !std::isfinite(longitude) ||
      (std::fabs(latitude) < 0.0001f && std::fabs(longitude) < 0.0001f)) {
    std::strncpy(forecast_status_, "needs_location", sizeof(forecast_status_) - 1);
    forecast_status_[sizeof(forecast_status_) - 1] = '\0';
    std::strncpy(forecast_last_error_, "location_required", sizeof(forecast_last_error_) - 1);
    forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"location_required\"}");
    return false;
  }
  if (!esphome::network::is_connected()) {
    std::strncpy(forecast_status_, "offline", sizeof(forecast_status_) - 1);
    forecast_status_[sizeof(forecast_status_) - 1] = '\0';
    std::strncpy(forecast_last_error_, "network_offline", sizeof(forecast_last_error_) - 1);
    forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"network_offline\"}");
    return false;
  }

  forecast_fetch_requested_ = true;
  std::strncpy(forecast_status_, "queued", sizeof(forecast_status_) - 1);
  forecast_status_[sizeof(forecast_status_) - 1] = '\0';
  forecast_last_error_[0] = '\0';
  give_state_lock_();
  snprintf(response, capacity, "{\"result\":\"queued\",\"status\":\"queued\"}");
  log_event_("info", "forecast", "fetch queued");
  return true;
}

bool LuneTouchCoordinator::perform_forecast_fetch_(char *response, size_t capacity) {
  float latitude = 0.0f;
  float longitude = 0.0f;
  if (take_state_lock_(100)) {
    latitude = forecast_latitude_;
    longitude = forecast_longitude_;
    std::strncpy(forecast_status_, "fetching", sizeof(forecast_status_) - 1);
    forecast_status_[sizeof(forecast_status_) - 1] = '\0';
    give_state_lock_();
  } else {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }

  if (!std::isfinite(latitude) || !std::isfinite(longitude) ||
      (std::fabs(latitude) < 0.0001f && std::fabs(longitude) < 0.0001f)) {
    if (take_state_lock_(100)) {
      std::strncpy(forecast_status_, "needs_location", sizeof(forecast_status_) - 1);
      forecast_status_[sizeof(forecast_status_) - 1] = '\0';
      std::strncpy(forecast_last_error_, "location_required", sizeof(forecast_last_error_) - 1);
      forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
      give_state_lock_();
    }
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"location_required\"}");
    return false;
  }
  if (!esphome::network::is_connected()) {
    if (take_state_lock_(100)) {
      std::strncpy(forecast_status_, "offline", sizeof(forecast_status_) - 1);
      forecast_status_[sizeof(forecast_status_) - 1] = '\0';
      std::strncpy(forecast_last_error_, "network_offline", sizeof(forecast_last_error_) - 1);
      forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
      give_state_lock_();
    }
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"network_offline\"}");
    return false;
  }

  char error[96]{};
  uint8_t hours = 0;
  ForecastHourState fetched_hours[72]{};
  float min_temp = 0.0f;
  float max_wind = 0.0f;
  float wind_dir = 0.0f;
  float max_solar = 0.0f;
  const bool ok = fetch_open_meteo_(latitude, longitude, error, sizeof(error),
                                    &hours, &min_temp, &max_wind, &wind_dir, &max_solar,
                                    fetched_hours, 72);

  if (take_state_lock_(100)) {
    forecast_last_fetch_ms_ = esphome::millis();
    if (ok) {
      std::strncpy(forecast_status_, "ok", sizeof(forecast_status_) - 1);
      forecast_status_[sizeof(forecast_status_) - 1] = '\0';
      forecast_last_error_[0] = '\0';
      forecast_hours_count_ = hours;
      for (uint8_t i = 0; i < hours && i < 72; i++)
        forecast_hours_[i] = fetched_hours[i];
      forecast_min_temp_c_ = min_temp;
      forecast_max_wind_ms_ = max_wind;
      forecast_peak_wind_dir_deg_ = wind_dir;
      forecast_max_solar_wm2_ = max_solar;
      forecast_cache_restored_ = false;
      recompute_forecast_decisions_();
    } else {
      std::strncpy(forecast_status_, "error", sizeof(forecast_status_) - 1);
      forecast_status_[sizeof(forecast_status_) - 1] = '\0';
      std::strncpy(forecast_last_error_, error[0] != '\0' ? error : "fetch_failed",
                   sizeof(forecast_last_error_) - 1);
      forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
      forecast_decision_count_ = 0;
    }
    give_state_lock_();
  }

  ForecastDispatchSummary dispatch{};
  if (ok)
    dispatch = dispatch_forecast_commands_();
  if (ok)
    save_forecast_cache_();

  if (!ok) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"status\":\"error\",\"error\":\"%s\"}",
             error[0] != '\0' ? error : "fetch_failed");
    log_event_("warn", "forecast", error[0] != '\0' ? error : "fetch_failed");
    return false;
  }
  snprintf(response, capacity,
           "{\"result\":\"fetched\",\"status\":\"ok\",\"hours\":%u,\"min_temp_c\":%.1f,"
           "\"max_wind_ms\":%.1f,\"peak_wind_dir_deg\":%.0f,"
           "\"commands\":{\"active\":%u,\"sent\":%u,\"skipped\":%u,\"failed\":%u,"
           "\"blocked_stale\":%u,\"blocked_unreachable\":%u,\"blocked_untrusted\":%u}}",
           static_cast<unsigned>(hours), min_temp, max_wind, wind_dir,
           static_cast<unsigned>(dispatch.active), static_cast<unsigned>(dispatch.sent),
           static_cast<unsigned>(dispatch.skipped), static_cast<unsigned>(dispatch.failed),
           static_cast<unsigned>(dispatch.blocked_stale),
           static_cast<unsigned>(dispatch.blocked_unreachable),
           static_cast<unsigned>(dispatch.blocked_untrusted));
  log_event_("info", "forecast", "fetch completed");
  return true;
}

std::string LuneTouchCoordinator::house_summary_text() const {
  if (!take_state_lock_(50))
    return "coordinator busy";
  const uint32_t now = esphome::millis();
  size_t stale_nodes = 0;
  size_t trusted_nodes = 0;
  size_t ready_trusted_nodes = 0;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    const bool stale = model_.is_node_stale(i, now);
    if (stale)
      stale_nodes++;
    if (node->trust == ::lune_touch::NodeTrust::TRUSTED) {
      trusted_nodes++;
      if (node->reachable && !stale)
        ready_trusted_nodes++;
    }
  }
  char buffer[96];
  snprintf(buffer, sizeof(buffer), "%uz / ready %u/%u / stale %u / call %u",
           static_cast<unsigned>(model_.active_zone_count()),
           static_cast<unsigned>(ready_trusted_nodes),
           static_cast<unsigned>(trusted_nodes),
           static_cast<unsigned>(stale_nodes),
           static_cast<unsigned>(model_.calling_zone_count()));
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::zone_line_text(uint8_t row) const {
  if (!take_state_lock_(50))
    return "zone data busy";
  const ::lune_touch::ZoneBinding *zone = nullptr;
  size_t zone_index = 0;
  size_t active_index = 0;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate == nullptr || !candidate->enabled)
      continue;
    if (active_index == row) {
      zone = candidate;
      zone_index = i;
      break;
    }
    active_index++;
  }
  if (zone == nullptr || !zone->enabled) {
    give_state_lock_();
    char empty[80];
    snprintf(empty, sizeof(empty), "Zone row %u waiting for mapped room",
             static_cast<unsigned>(row + 1));
    return empty;
  }

  const uint32_t now = esphome::millis();
  const auto *live = model_.zone_live(zone_index);
  const auto offset = ledger_.resolve_command_offset(zone->node_index, zone->zone_index, now);
  const char *name = zone->room_name[0] != '\0' ? zone->room_name : zone->room_id;
  const char *status = live != nullptr ? live->status : "unknown";
  char temp[16];
  if (live != nullptr && live->has_temperature)
    snprintf(temp, sizeof(temp), "%.1f C", live->temperature_c);
  else
    snprintf(temp, sizeof(temp), "--.- C");

  char command[32];
  if (offset.command_offset_c > 0.01f)
    snprintf(command, sizeof(command), "%s +%.1f C", offset.command_source, offset.command_offset_c);
  else
    snprintf(command, sizeof(command), "local");

  char buffer[128];
  snprintf(buffer, sizeof(buffer), "%-12.12s V6 %u / Z%u  %s  %-8.8s  %s",
           name, static_cast<unsigned>(zone->node_index + 1),
           static_cast<unsigned>(zone->zone_index + 1), temp, status, command);
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::forecast_summary_text() const {
  if (!take_state_lock_(50))
    return "forecast busy";
  char buffer[112];
  snprintf(buffer, sizeof(buffer), "%s%s / %u h cache / %lu min old",
           forecast_status_, forecast_fetch_requested_ ? " pending" : "",
           static_cast<unsigned>(forecast_hours_count_),
           forecast_last_fetch_ms_ == 0 ? 0UL :
               static_cast<unsigned long>((esphome::millis() - forecast_last_fetch_ms_) / 60000UL));
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::forecast_decision_text(uint8_t row) const {
  if (!take_state_lock_(50))
    return "forecast decisions busy";
  char buffer[144];
  if (forecast_decision_count_ == 0) {
    snprintf(buffer, sizeof(buffer), "No preload decisions yet / %s / %u h cache",
             forecast_status_, static_cast<unsigned>(forecast_hours_count_));
    give_state_lock_();
    return buffer;
  }

  size_t decision_index = row;
  if (decision_index >= forecast_decision_count_)
    decision_index = forecast_decision_count_ - 1;
  const auto &decision = forecast_decisions_[decision_index];
  const char *name = decision.room_name[0] != '\0' ? decision.room_name : decision.room_id;
  snprintf(buffer, sizeof(buffer), "%s: %s %.1f C / peak %.1f in %dh / P%u",
           name, decision.active ? "preload" : "watch", decision.offset_c,
           decision.peak_load, static_cast<int>(decision.peak_in_h),
           static_cast<unsigned>(decision.priority));
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::command_summary_text() const {
  if (!take_state_lock_(50))
    return "commands busy";
  const size_t accepted = ledger_.count_result(::lune_touch::CommandResult::ACCEPTED);
  const size_t failed = ledger_.count_result(::lune_touch::CommandResult::FAILED);
  const size_t rejected = ledger_.count_result(::lune_touch::CommandResult::REJECTED);
  const size_t blocked = ledger_.count_result(::lune_touch::CommandResult::BLOCKED_STALE) +
                         ledger_.count_result(::lune_touch::CommandResult::BLOCKED_UNREACHABLE) +
                         ledger_.count_result(::lune_touch::CommandResult::BLOCKED_UNTRUSTED);
  char buffer[96];
  snprintf(buffer, sizeof(buffer), "%u accepted / %u failed / %u rejected / %u blocked",
           static_cast<unsigned>(accepted),
           static_cast<unsigned>(failed),
           static_cast<unsigned>(rejected),
           static_cast<unsigned>(blocked));
  give_state_lock_();
  return buffer;
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
           "\"comfort_avg_c\":%.1f,\"forecast_status\":\"%s\",\"latest_command\":\"%s\"}}",
           static_cast<unsigned>(model_.active_zone_count()),
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.calling_zone_count()),
           static_cast<unsigned>(stale_nodes),
           model_.average_comfort_setpoint_c(),
           forecast_status_,
           latest != nullptr ? ::lune_touch::command_result_name(latest->result) : "none");
}

void LuneTouchCoordinator::write_nodes_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  appendf_(buffer, capacity, off, "{\"nodes\":[");
  bool first = true;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    char success_host[96];
    char failure[112];
    char pairing_fingerprint[48];
    char avg_temp[16] = "null";
    char avg_setpoint[16] = "null";
    char flow_c[16];
    char return_c[16];
    char avg_valve_pct[16];
    char motor_current_ma[16];
    size_t mapped_zones = 0;
    size_t fresh_zones = 0;
    size_t calling_zones = 0;
    float temp_sum = 0.0f;
    size_t temp_count = 0;
    float setpoint_sum = 0.0f;
    size_t setpoint_count = 0;
    for (size_t z = 0; z < model_.zone_count(); z++) {
      const auto *zone = model_.zone(z);
      const auto *live = model_.zone_live(z);
      if (zone == nullptr || !zone->enabled || zone->node_index != i)
        continue;
      mapped_zones++;
      if (live != nullptr && live->fresh)
        fresh_zones++;
      if (live != nullptr &&
          (std::strcmp(live->status, "heat") == 0 || std::strcmp(live->status, "call") == 0 ||
           std::strcmp(live->status, "preheat") == 0))
        calling_zones++;
      if (live != nullptr && live->has_temperature) {
        temp_sum += live->temperature_c;
        temp_count++;
      }
      if (live != nullptr && live->has_setpoint) {
        setpoint_sum += live->setpoint_c;
        setpoint_count++;
      }
    }
    if (temp_count > 0)
      snprintf(avg_temp, sizeof(avg_temp), "%.1f", temp_sum / static_cast<float>(temp_count));
    if (setpoint_count > 0)
      snprintf(avg_setpoint, sizeof(avg_setpoint), "%.1f", setpoint_sum / static_cast<float>(setpoint_count));
    const NodeTelemetryState &telemetry = node_telemetry_[i];
    nullable_float_(flow_c, sizeof(flow_c), telemetry.has_flow, telemetry.flow_c);
    nullable_float_(return_c, sizeof(return_c), telemetry.has_return, telemetry.return_c);
    nullable_float_(avg_valve_pct, sizeof(avg_valve_pct), telemetry.has_avg_valve, telemetry.avg_valve_pct);
    nullable_float_(motor_current_ma, sizeof(motor_current_ma), telemetry.has_motor_current, telemetry.motor_current_ma);
    json_escape_(node_last_success_host_[i], success_host, sizeof(success_host));
    json_escape_(node_last_failure_[i], failure, sizeof(failure));
    json_escape_(node->pairing_fingerprint, pairing_fingerprint, sizeof(pairing_fingerprint));
    if (!appendf_(buffer, capacity, off,
                  "%s{\"id\":\"%s\",\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\","
                  "\"firmware\":\"%s\",\"reachable\":%s,\"trust\":%u,\"trust_label\":\"%s\","
                  "\"pairing_fingerprint\":\"%s\",\"last_seen_ms\":%lu,"
                  "\"last_success_host\":\"%s\",\"last_failure\":\"%s\","
                  "\"health\":{\"mapped_zones\":%u,\"fresh_zones\":%u,\"stale_zones\":%u,"
                  "\"calling_zones\":%u,\"avg_temp_c\":%s,\"avg_setpoint_c\":%s},"
                  "\"runtime\":{\"active_zones\":%u,\"avg_valve_pct\":%s,"
                  "\"flow_c\":%s,\"return_c\":%s,\"drivers_enabled\":%s,"
                  "\"motor_fault\":%s,\"motor_current_ma\":%s}}",
                  first ? "" : ",", node->node_id, node->hostname, node->fallback_ip, node->model,
                  node->firmware, node->reachable ? "true" : "false",
                  static_cast<unsigned>(node->trust), ::lune_touch::node_trust_name(node->trust),
                  pairing_fingerprint,
                  static_cast<unsigned long>(node->last_seen_ms),
                  success_host, failure,
                  static_cast<unsigned>(mapped_zones),
                  static_cast<unsigned>(fresh_zones),
                  static_cast<unsigned>(mapped_zones > fresh_zones ? mapped_zones - fresh_zones : 0),
                  static_cast<unsigned>(calling_zones), avg_temp, avg_setpoint,
                  static_cast<unsigned>(telemetry.active_zones), avg_valve_pct, flow_c, return_c,
                  telemetry.has_drivers_enabled && telemetry.drivers_enabled ? "true" : "false",
                  telemetry.has_motor_fault && telemetry.motor_fault ? "true" : "false",
                  motor_current_ma))
      break;
    first = false;
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_node_scan_json(char *buffer, size_t capacity) const {
  const uint32_t now = esphome::millis();
  size_t off = 0;
  appendf_(buffer, capacity, off,
           "{\"scan\":\"known_nodes\",\"discovery\":\"manual_or_known_nodes\","
           "\"found\":[");
  bool first = true;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    const bool stale = model_.is_node_stale(i, now);
    char pairing_fingerprint[48];
    json_escape_(node->pairing_fingerprint, pairing_fingerprint, sizeof(pairing_fingerprint));
    if (!appendf_(buffer, capacity, off,
                  "%s{\"id\":\"%s\",\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\","
                  "\"firmware\":\"%s\",\"pairing_fingerprint\":\"%s\","
                  "\"reachable\":%s,\"stale\":%s,\"source\":\"known_node\"}",
                  first ? "" : ",", node->node_id, node->hostname, node->fallback_ip,
                  node->model, node->firmware, pairing_fingerprint,
                  node->reachable ? "true" : "false",
                  stale ? "true" : "false"))
      break;
    first = false;
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_zones_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  uint8_t day_index = 0;
  uint16_t minute_of_day = 0;
  const bool time_valid = current_schedule_time_(time_, &day_index, &minute_of_day);
  appendf_(buffer, capacity, off, "{\"count\":%u,\"zones\":[", static_cast<unsigned>(model_.active_zone_count()));
  bool first = true;
  for (size_t i = 0; i < model_.zone_count() && i < 18; i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    const auto *history = model_.zone_history(i);
    if (zone == nullptr)
      continue;
    char temp_buf[16];
    char sp_buf[16];
    char valve_buf[16];
    char hist_avg_buf[16];
    char hist_min_buf[16];
    char hist_max_buf[16];
    char hist_delta_buf[16];
    if (live != nullptr && live->has_temperature) snprintf(temp_buf, sizeof(temp_buf), "%.1f", live->temperature_c); else std::strncpy(temp_buf, "null", sizeof(temp_buf));
    if (live != nullptr && live->has_setpoint) snprintf(sp_buf, sizeof(sp_buf), "%.1f", live->setpoint_c); else std::strncpy(sp_buf, "null", sizeof(sp_buf));
    if (live != nullptr && live->has_valve) snprintf(valve_buf, sizeof(valve_buf), "%.1f", live->valve_pct); else std::strncpy(valve_buf, "null", sizeof(valve_buf));
    if (history != nullptr && history->has_temperature) {
      snprintf(hist_avg_buf, sizeof(hist_avg_buf), "%.2f", history->average_temperature_c);
      snprintf(hist_min_buf, sizeof(hist_min_buf), "%.2f", history->min_temperature_c);
      snprintf(hist_max_buf, sizeof(hist_max_buf), "%.2f", history->max_temperature_c);
    } else {
      std::strncpy(hist_avg_buf, "null", sizeof(hist_avg_buf));
      std::strncpy(hist_min_buf, "null", sizeof(hist_min_buf));
      std::strncpy(hist_max_buf, "null", sizeof(hist_max_buf));
    }
    if (history != nullptr && history->has_delta)
      snprintf(hist_delta_buf, sizeof(hist_delta_buf), "%.2f", history->last_delta_c_per_h);
    else
      std::strncpy(hist_delta_buf, "null", sizeof(hist_delta_buf));
    temp_buf[sizeof(temp_buf) - 1] = '\0';
    sp_buf[sizeof(sp_buf) - 1] = '\0';
    valve_buf[sizeof(valve_buf) - 1] = '\0';
    hist_avg_buf[sizeof(hist_avg_buf) - 1] = '\0';
    hist_min_buf[sizeof(hist_min_buf) - 1] = '\0';
    hist_max_buf[sizeof(hist_max_buf) - 1] = '\0';
    hist_delta_buf[sizeof(hist_delta_buf) - 1] = '\0';
    const char *status = live != nullptr && live->status[0] != '\0' ? live->status : (zone->enabled ? "unknown" : "unused");
    const auto effective = ::lune_touch::HouseModel::effective_comfort(*zone, time_valid,
                                                                       day_index, minute_of_day);
    const uint32_t now_ms = esphome::millis();
    const auto command_resolution =
        ledger_.resolve_command_offset(zone->node_index, zone->zone_index, now_ms);
    const float learned_offset_c = 0.0f;
    const float resolved_target_c = std::fmin(35.0f, std::fmax(5.0f,
        effective.setpoint_c + command_resolution.command_offset_c + learned_offset_c));
    const float thermal_confidence = zone->thermal_samples >= 24 ? 1.0f :
        static_cast<float>(zone->thermal_samples) / 24.0f;
    if (!appendf_(buffer, capacity, off,
                  "%s{\"room_id\":\"%s\",\"name\":\"%s\",\"node_index\":%u,\"zone_index\":%u,"
                  "\"temperature_c\":%s,\"setpoint_c\":%s,\"status\":\"%s\",\"fresh\":%s,"
                  "\"valve_pct\":%s,\"updated_at_ms\":%lu,\"comfort\":{\"setpoint_c\":%.1f,"
                  "\"bias_c\":%.1f,\"effective_setpoint_c\":%.1f,\"effective_source\":\"%s\","
                  "\"schedule_active\":%s,\"time_valid\":%s,\"priority\":%u},"
                  "\"resolver\":{\"base_setpoint_c\":%.1f,\"base_source\":\"%s\","
                  "\"manual_offset_c\":%.2f,\"forecast_offset_c\":%.2f,"
                  "\"learned_offset_c\":%.2f,\"command_offset_c\":%.2f,"
                  "\"command_source\":\"%s\",\"target_setpoint_c\":%.1f},"
                  "\"schedule\":{\"enabled\":%s,\"day_mask\":%u,\"start_min\":%u,"
                  "\"end_min\":%u,\"setpoint_c\":%.1f},"
                  "\"history\":{\"samples\":%lu,\"calling_samples\":%lu,"
                  "\"avg_temp_c\":%s,\"min_temp_c\":%s,\"max_temp_c\":%s,"
                  "\"last_delta_c_per_h\":%s},"
                  "\"thermal_model\":{\"samples\":%u,\"heat_gain_c_per_h\":%.3f,"
                  "\"cool_loss_c_per_h\":%.3f,\"confidence\":%.2f},"
                  "\"forecast\":{\"exterior_walls\":%u,"
                  "\"wind_exposure\":%.2f,\"solar_gain\":%.2f,\"thermal_lead_h\":%u,"
                  "\"max_offset_c\":%.2f}}",
                  first ? "" : ",", zone->room_id, zone->room_name,
                  static_cast<unsigned>(zone->node_index), static_cast<unsigned>(zone->zone_index),
                  temp_buf, sp_buf, status, live != nullptr && live->fresh && zone->enabled ? "true" : "false",
                  valve_buf,
                  static_cast<unsigned long>(live != nullptr ? live->updated_at_ms : 0),
                  zone->comfort_setpoint_c, zone->comfort_bias_c,
                  effective.setpoint_c,
                  effective.source,
                  effective.schedule_active ? "true" : "false",
                  effective.time_valid ? "true" : "false",
                  static_cast<unsigned>(zone->priority),
                  effective.setpoint_c,
                  effective.source,
                  command_resolution.has_manual_offset ? command_resolution.manual_offset_c : 0.0f,
                  command_resolution.has_forecast_offset ? command_resolution.forecast_offset_c : 0.0f,
                  learned_offset_c,
                  command_resolution.command_offset_c,
                  command_resolution.command_source,
                  resolved_target_c,
                  zone->schedule_enabled ? "true" : "false",
                  static_cast<unsigned>(zone->schedule_day_mask),
                  static_cast<unsigned>(zone->schedule_start_min),
                  static_cast<unsigned>(zone->schedule_end_min),
                  zone->schedule_setpoint_c,
                  static_cast<unsigned long>(history != nullptr ? history->samples : 0),
                  static_cast<unsigned long>(history != nullptr ? history->calling_samples : 0),
                  hist_avg_buf, hist_min_buf, hist_max_buf, hist_delta_buf,
                  static_cast<unsigned>(zone->thermal_samples),
                  zone->learned_heat_gain_c_per_h,
                  zone->learned_cool_loss_c_per_h,
                  thermal_confidence,
                  static_cast<unsigned>(zone->exterior_walls), zone->wind_exposure,
                  zone->solar_gain, static_cast<unsigned>(zone->thermal_lead_h),
                  zone->max_offset_c))
      break;
    first = false;
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_strategy_json(char *buffer, size_t capacity) const {
  uint8_t day_index = 0;
  uint16_t minute_of_day = 0;
  const bool schedule_time_valid = current_schedule_time_(time_, &day_index, &minute_of_day);
  const auto strategy = model_.strategy_snapshot(schedule_time_valid, day_index, minute_of_day);
  uint8_t schedule_active = 0;
  uint8_t schedule_driver_priority = 0;
  float schedule_driver_setpoint = 0.0f;
  char schedule_driver_room_id_raw[32]{};
  char schedule_driver_room_name_raw[48]{};
  if (schedule_time_valid) {
    for (size_t i = 0; i < model_.zone_count(); i++) {
      const auto *zone = model_.zone(i);
      if (zone == nullptr)
        continue;
      const auto effective = ::lune_touch::HouseModel::effective_comfort(*zone, true,
                                                                         day_index, minute_of_day);
      if (!effective.schedule_active)
        continue;
      schedule_active++;
      if (zone->priority >= schedule_driver_priority) {
        schedule_driver_priority = zone->priority;
        schedule_driver_setpoint = effective.setpoint_c;
        std::strncpy(schedule_driver_room_id_raw, zone->room_id,
                     sizeof(schedule_driver_room_id_raw) - 1);
        std::strncpy(schedule_driver_room_name_raw, zone->room_name,
                     sizeof(schedule_driver_room_name_raw) - 1);
      }
    }
  }
  char driver_room_id[64];
  char driver_room_name[96];
  char schedule_driver_room_id[64];
  char schedule_driver_room_name[96];
  char asgard_mode[32];
  json_escape_(strategy.driver_room_id, driver_room_id, sizeof(driver_room_id));
  json_escape_(strategy.driver_room_name, driver_room_name, sizeof(driver_room_name));
  json_escape_(schedule_driver_room_id_raw, schedule_driver_room_id, sizeof(schedule_driver_room_id));
  json_escape_(schedule_driver_room_name_raw, schedule_driver_room_name, sizeof(schedule_driver_room_name));
  json_escape_(asgard_mode_, asgard_mode, sizeof(asgard_mode));

  snprintf(buffer, capacity,
           "{\"physical\":{\"has_temperature\":%s,\"temperature_c\":%.2f,"
           "\"contributing_zones\":%u},\"comfort\":{\"average_c\":%.2f,"
           "\"demand_c\":%.2f,\"demand_zones\":%u},\"driver\":{\"room_id\":\"%s\","
           "\"name\":\"%s\",\"deficit_c\":%.2f,\"priority\":%u},"
           "\"schedule\":{\"time_valid\":%s,\"active_zones\":%u,"
           "\"driver_room_id\":\"%s\",\"driver_name\":\"%s\","
           "\"driver_setpoint_c\":%.1f,\"driver_priority\":%u},"
           "\"asgard_odin\":{\"enabled\":%s,\"physical_signal\":\"priority_weighted_house_temp\","
           "\"comfort_signal\":\"separate_weighted_demand\",\"mode\":\"%s\"}}",
           strategy.has_physical_temperature ? "true" : "false",
           strategy.physical_temperature_c,
           static_cast<unsigned>(strategy.contributing_zones),
           strategy.comfort_average_c,
           strategy.comfort_demand_c,
           static_cast<unsigned>(strategy.demand_zones),
           driver_room_id,
           driver_room_name,
           strategy.driver_deficit_c,
           static_cast<unsigned>(strategy.driver_priority),
           schedule_time_valid ? "true" : "false",
           static_cast<unsigned>(schedule_active),
           schedule_driver_room_id,
           schedule_driver_room_name,
           schedule_driver_setpoint,
           static_cast<unsigned>(schedule_driver_priority),
           asgard_enabled_ ? "true" : "false",
           asgard_mode);
}

void LuneTouchCoordinator::write_settings_json(char *buffer, size_t capacity) const {
  char name[64];
  char install_id[64];
  char site[96];
  char mode[32];
  json_escape_(coordinator_name_, name, sizeof(name));
  json_escape_(install_id_, install_id, sizeof(install_id));
  json_escape_(site_label_, site, sizeof(site));
  json_escape_(install_mode_, mode, sizeof(mode));
  char asgard_mode[32];
  json_escape_(asgard_mode_, asgard_mode, sizeof(asgard_mode));
  snprintf(buffer, capacity,
           "{\"coordinator\":{\"name\":\"%s\",\"install_id\":\"%s\","
           "\"site_label\":\"%s\",\"install_mode\":\"%s\"},"
           "\"asgard_odin\":{\"enabled\":%s,\"mode\":\"%s\","
           "\"physical_signal\":\"priority_weighted_house_temp\","
           "\"comfort_signal\":\"separate_weighted_demand\"}}",
           name, install_id, site, mode, asgard_enabled_ ? "true" : "false", asgard_mode);
}

void LuneTouchCoordinator::write_forecast_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  char forecast_last_error[128];
  char forecast_location_mode[32];
  json_escape_(forecast_last_error_, forecast_last_error, sizeof(forecast_last_error));
  json_escape_(forecast_location_mode_, forecast_location_mode, sizeof(forecast_location_mode));
  appendf_(buffer, capacity, off,
           "{\"status\":\"%s\",\"location\":{\"mode\":\"%s\",\"latitude\":%.6f,\"longitude\":%.6f},"
           "\"fetch_pending\":%s,\"last_fetch_age_s\":%lu,\"cache\":{\"hours\":%u,\"min_temp_c\":%.1f,"
           "\"max_wind_ms\":%.1f,\"peak_wind_dir_deg\":%.0f,\"max_solar_wm2\":%.0f,"
           "\"restored\":%s},"
           "\"last_error\":\"%s\",\"commands\":{\"active\":%u,\"sent\":%u,\"skipped\":%u,\"failed\":%u,"
           "\"blocked_stale\":%u,\"blocked_unreachable\":%u,\"blocked_untrusted\":%u},"
           "\"hours\":[",
           forecast_status_, forecast_location_mode, forecast_latitude_, forecast_longitude_,
           forecast_fetch_requested_ ? "true" : "false",
           forecast_last_fetch_ms_ == 0 ? 0UL : static_cast<unsigned long>((esphome::millis() - forecast_last_fetch_ms_) / 1000UL),
           static_cast<unsigned>(forecast_hours_count_), forecast_min_temp_c_, forecast_max_wind_ms_,
           forecast_peak_wind_dir_deg_, forecast_max_solar_wm2_,
           forecast_cache_restored_ ? "true" : "false", forecast_last_error,
           static_cast<unsigned>(last_forecast_dispatch_.active),
           static_cast<unsigned>(last_forecast_dispatch_.sent),
           static_cast<unsigned>(last_forecast_dispatch_.skipped),
           static_cast<unsigned>(last_forecast_dispatch_.failed),
           static_cast<unsigned>(last_forecast_dispatch_.blocked_stale),
           static_cast<unsigned>(last_forecast_dispatch_.blocked_unreachable),
           static_cast<unsigned>(last_forecast_dispatch_.blocked_untrusted));
  for (size_t i = 0; i < forecast_hours_count_ && i < 72 && off + 96 < capacity; i++) {
    const ForecastHourState &h = forecast_hours_[i];
    appendf_(buffer, capacity, off,
             "%s{\"h\":%u,\"temp_c\":%.1f,\"wind_ms\":%.1f,"
             "\"wind_dir_deg\":%.0f,\"solar_wm2\":%.0f}",
             i ? "," : "", static_cast<unsigned>(i), h.temp_c, h.wind_speed_ms,
             h.wind_dir_deg, h.shortwave_wm2);
  }
  appendf_(buffer, capacity, off, "],\"decisions\":[");
  for (size_t i = 0; i < forecast_decision_count_ && off + 180 < capacity; i++) {
    const ForecastDecisionState &d = forecast_decisions_[i];
    char room_id[48];
    char room_name[80];
    json_escape_(d.room_id, room_id, sizeof(room_id));
    json_escape_(d.room_name, room_name, sizeof(room_name));
    appendf_(buffer, capacity, off,
             "%s{\"room_id\":\"%s\",\"name\":\"%s\",\"node_index\":%u,\"zone_index\":%u,"
             "\"comfort_setpoint_c\":%.1f,\"priority\":%u,\"offset_c\":%.2f,"
             "\"peak_load\":%.2f,\"peak_in_h\":%d,\"active\":%s}",
             i ? "," : "", room_id, room_name, static_cast<unsigned>(d.node_index),
             static_cast<unsigned>(d.zone_index), d.comfort_setpoint_c,
             static_cast<unsigned>(d.priority), d.offset_c, d.peak_load,
             static_cast<int>(d.peak_in_h), d.active ? "true" : "false");
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_commands_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  appendf_(buffer, capacity, off, "{\"commands\":[");
  bool first = true;
  for (size_t i = 0; i < ledger_.count(); i++) {
    const auto *record = ledger_.at(i);
    if (record == nullptr)
      continue;
    char request_id[32];
    char source[32];
    char reason[96];
    json_escape_(record->request_id, request_id, sizeof(request_id));
    json_escape_(record->source, source, sizeof(source));
    json_escape_(record->reason, reason, sizeof(reason));
    if (!appendf_(buffer, capacity, off,
                  "%s{\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\","
                  "\"node_index\":%u,\"zone_index\":%u,\"requested_offset_c\":%.2f,"
                  "\"accepted_offset_c\":%.2f,\"created_at_ms\":%lu,\"expires_at_ms\":%lu,"
                  "\"result\":\"%s\",\"clamp_applied\":%s}",
                  first ? "" : ",", request_id, source, reason,
                  static_cast<unsigned>(record->node_index), static_cast<unsigned>(record->zone_index),
                  record->requested_offset_c, record->accepted_offset_c,
                  static_cast<unsigned long>(record->created_at_ms),
                  static_cast<unsigned long>(record->expires_at_ms),
                  ::lune_touch::command_result_name(record->result),
                  record->clamp_applied ? "true" : "false"))
      break;
    first = false;
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_events_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  appendf_(buffer, capacity, off, "{\"events\":[");
  if (take_state_lock_(50)) {
    for (size_t i = 0; i < event_count_; i++) {
      const size_t idx = (event_next_ + EVENT_CAPACITY - 1 - i) % EVENT_CAPACITY;
      const EventRecord &event = events_[idx];
      char level[16];
      char source[32];
      char message[128];
      json_escape_(event.level, level, sizeof(level));
      json_escape_(event.source, source, sizeof(source));
      json_escape_(event.message, message, sizeof(message));
      if (!appendf_(buffer, capacity, off,
                    "%s{\"ts_ms\":%lu,\"level\":\"%s\",\"source\":\"%s\","
                    "\"message\":\"%s\"}",
                    i ? "," : "", static_cast<unsigned long>(event.ts_ms),
                    level, source, message))
        break;
    }
    give_state_lock_();
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_diagnostics_json(char *buffer, size_t capacity) const {
  uint8_t day_index = 0;
  uint16_t minute_of_day = 0;
  const bool schedule_time_valid = current_schedule_time_(time_, &day_index, &minute_of_day);
  const auto strategy = model_.strategy_snapshot(schedule_time_valid, day_index, minute_of_day);
  const auto learning = model_.learning_snapshot();
  const uint32_t now_ms = esphome::millis();
  size_t paired_nodes = 0;
  size_t trusted_nodes = 0;
  size_t reachable_nodes = 0;
  size_t reachable_trusted_nodes = 0;
  size_t stale_nodes = 0;
  size_t trusted_stale_nodes = 0;
  size_t identity_missing_nodes = 0;
  size_t trusted_identity_missing_nodes = 0;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    const bool node_stale = model_.is_node_stale(i, now_ms);
    if (node->trust == ::lune_touch::NodeTrust::PAIRED)
      paired_nodes++;
    if (node->trust == ::lune_touch::NodeTrust::TRUSTED)
      trusted_nodes++;
    if ((node->trust == ::lune_touch::NodeTrust::PAIRED ||
         node->trust == ::lune_touch::NodeTrust::TRUSTED) &&
        node->pairing_fingerprint[0] == '\0') {
      identity_missing_nodes++;
      if (node->trust == ::lune_touch::NodeTrust::TRUSTED)
        trusted_identity_missing_nodes++;
    }
    if (node->reachable)
      reachable_nodes++;
    if (node->trust == ::lune_touch::NodeTrust::TRUSTED && node->reachable && !node_stale)
      reachable_trusted_nodes++;
    if (node_stale) {
      stale_nodes++;
      if (node->trust == ::lune_touch::NodeTrust::TRUSTED)
        trusted_stale_nodes++;
    }
  }
  size_t fresh_zones = 0;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone != nullptr && zone->enabled && live != nullptr && live->fresh)
      fresh_zones++;
  }
  const size_t pending_commands = ledger_.count_result(::lune_touch::CommandResult::PENDING);
  const size_t accepted_commands = ledger_.count_result(::lune_touch::CommandResult::ACCEPTED);
  const size_t rejected_commands = ledger_.count_result(::lune_touch::CommandResult::REJECTED);
  const size_t failed_commands = ledger_.count_result(::lune_touch::CommandResult::FAILED);
  const size_t expired_commands = ledger_.count_result(::lune_touch::CommandResult::EXPIRED);
  const size_t blocked_stale_commands = ledger_.count_result(::lune_touch::CommandResult::BLOCKED_STALE);
  const size_t blocked_unreachable_commands = ledger_.count_result(::lune_touch::CommandResult::BLOCKED_UNREACHABLE);
  const size_t blocked_untrusted_commands = ledger_.count_result(::lune_touch::CommandResult::BLOCKED_UNTRUSTED);
  const size_t blocked_commands = blocked_stale_commands + blocked_unreachable_commands + blocked_untrusted_commands;
  size_t clamped_commands = 0;
  for (size_t i = 0; i < ledger_.count(); i++) {
    const auto *record = ledger_.at(i);
    if (record != nullptr && record->clamp_applied)
      clamped_commands++;
  }
  const size_t bound_zones = model_.active_zone_count();
  const size_t stale_zones = model_.stale_zone_count();
  const bool has_forecast_location = std::isfinite(forecast_latitude_) && std::isfinite(forecast_longitude_) &&
                                     (std::fabs(forecast_latitude_) >= 0.0001f ||
                                      std::fabs(forecast_longitude_) >= 0.0001f);
  const bool ready_for_commands = reachable_trusted_nodes > 0 && trusted_identity_missing_nodes == 0 &&
                                  bound_zones > 0 && fresh_zones > 0;
  const bool ready_for_forecast = ready_for_commands && has_forecast_location;
  const char *next_action = "ready";
  if (model_.node_count() == 0)
    next_action = "add_node";
  else if (trusted_identity_missing_nodes > 0 || (trusted_nodes == 0 && identity_missing_nodes > 0))
    next_action = "verify_node_identity";
  else if (trusted_nodes == 0)
    next_action = "trust_node";
  else if (reachable_trusted_nodes == 0)
    next_action = "fix_node_poll";
  else if (bound_zones == 0)
    next_action = "map_zones";
  else if (fresh_zones == 0)
    next_action = "wait_for_fresh_zone_poll";
  else if (!has_forecast_location)
    next_action = "set_forecast_location";

  char blockers[768]{};
  size_t blockers_off = 0;
  size_t blockers_count = 0;
  auto append_blocker = [&](const char *scope, const char *target, const char *reason, const char *action) {
    if (blockers_count >= 8 || blockers_off + 128 >= sizeof(blockers))
      return;
    char scope_esc[24];
    char target_esc[48];
    char reason_esc[40];
    char action_esc[40];
    json_escape_(scope, scope_esc, sizeof(scope_esc));
    json_escape_(target, target_esc, sizeof(target_esc));
    json_escape_(reason, reason_esc, sizeof(reason_esc));
    json_escape_(action, action_esc, sizeof(action_esc));
    if (appendf_(blockers, sizeof(blockers), blockers_off,
                 "%s{\"scope\":\"%s\",\"target\":\"%s\",\"reason\":\"%s\",\"action\":\"%s\"}",
                 blockers_count ? "," : "", scope_esc, target_esc, reason_esc, action_esc))
      blockers_count++;
  };
  if (model_.node_count() == 0)
    append_blocker("system", "coordinator", "no_nodes", "add_node");
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    const bool node_stale = model_.is_node_stale(i, now_ms);
    const char *target = node->node_id[0] != '\0' ? node->node_id : node->hostname;
    if ((node->trust == ::lune_touch::NodeTrust::PAIRED ||
         node->trust == ::lune_touch::NodeTrust::TRUSTED) &&
        node->pairing_fingerprint[0] == '\0') {
      append_blocker("node", target, "identity_missing", "verify_node_identity");
    } else if (node->trust == ::lune_touch::NodeTrust::PAIRED) {
      append_blocker("node", target, "not_trusted", "trust_node");
    } else if (node->trust == ::lune_touch::NodeTrust::TRUSTED && !node->reachable) {
      append_blocker("node", target, "unreachable", "fix_node_poll");
    } else if (node->trust == ::lune_touch::NodeTrust::TRUSTED && node_stale) {
      append_blocker("node", target, "stale", "fix_node_poll");
    }
  }
  if (trusted_nodes == 0 && identity_missing_nodes == 0 && model_.node_count() > 0)
    append_blocker("system", "coordinator", "no_trusted_nodes", "trust_node");
  if (bound_zones == 0)
    append_blocker("zones", "registry", "no_mapped_zones", "map_zones");
  else if (fresh_zones == 0)
    append_blocker("zones", "registry", "no_fresh_zone_telemetry", "wait_for_fresh_zone_poll");
  if (!has_forecast_location)
    append_blocker("forecast", "location", "location_missing", "set_forecast_location");

  const esp_partition_t *running_partition = esp_ota_get_running_partition();
  const char *running_label = running_partition != nullptr ? running_partition->label : "unknown";
  const uint32_t running_size = running_partition != nullptr ? running_partition->size : 0;
  const uint8_t running_subtype = running_partition != nullptr ? running_partition->subtype : 0;
  esp_ota_img_states_t ota_state = ESP_OTA_IMG_UNDEFINED;
  if (running_partition != nullptr)
    esp_ota_get_state_partition(running_partition, &ota_state);
  char driver_room_id[64];
  char last_poll_error[112];
  char forecast_last_error[128];
  char ota_label[32];
  json_escape_(strategy.driver_room_id, driver_room_id, sizeof(driver_room_id));
  json_escape_(last_poll_error_, last_poll_error, sizeof(last_poll_error));
  json_escape_(forecast_last_error_, forecast_last_error, sizeof(forecast_last_error));
  json_escape_(running_label, ota_label, sizeof(ota_label));

  snprintf(buffer, capacity,
           "{\"heap\":\"watching\",\"nodes\":%u,\"zones\":%u,\"ledger\":%u,"
           "\"screen\":\"sidebar-views\",\"api\":\"/api/lune-touch/v1\","
           "\"command_results\":{\"pending\":%u,\"accepted\":%u,\"rejected\":%u,"
           "\"failed\":%u,\"expired\":%u,\"blocked\":%u,\"blocked_stale\":%u,"
           "\"blocked_unreachable\":%u,\"blocked_untrusted\":%u,\"clamped\":%u},"
           "\"polling\":{\"last_poll_ms\":%lu,\"success\":%lu,\"fail\":%lu,\"last_error\":\"%s\"},"
           "\"commissioning\":{\"paired_nodes\":%u,\"trusted_nodes\":%u,"
           "\"reachable_nodes\":%u,\"reachable_trusted_nodes\":%u,"
           "\"stale_nodes\":%u,\"trusted_stale_nodes\":%u,\"identity_missing_nodes\":%u,"
           "\"bound_zones\":%u,"
           "\"fresh_zones\":%u,\"stale_zones\":%u,\"ready_for_commands\":%s,"
           "\"ready_for_forecast\":%s,\"next_action\":\"%s\",\"blockers\":[%s]},"
           "\"ota\":{\"running_label\":\"%s\",\"running_subtype\":%u,"
           "\"running_slot_size\":%lu,\"configured_slot_size\":%lu,"
           "\"state\":\"%s\",\"pending_verify\":%s},"
           "\"strategy\":{\"has_physical_temperature\":%s,\"physical_temperature_c\":%.2f,"
           "\"comfort_demand_c\":%.2f,\"driver_room\":\"%s\"},"
           "\"learning\":{\"zones_with_history\":%lu,\"total_samples\":%lu,"
           "\"total_calling_samples\":%lu,\"calling_ratio\":%.3f,"
           "\"zones_with_delta\":%lu,\"warming_zones\":%lu,\"cooling_zones\":%lu,"
           "\"average_delta_c_per_h\":%.3f},"
           "\"forecast\":{\"status\":\"%s\",\"fetch_pending\":%s,"
           "\"last_fetch_age_s\":%lu,\"last_error\":\"%s\"},"
           "\"forecast_commands\":{\"active\":%u,\"sent\":%u,\"skipped\":%u,\"failed\":%u,"
           "\"blocked_stale\":%u,\"blocked_unreachable\":%u,\"blocked_untrusted\":%u}}",
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.zone_count()),
           static_cast<unsigned>(ledger_.count()),
           static_cast<unsigned>(pending_commands),
           static_cast<unsigned>(accepted_commands),
           static_cast<unsigned>(rejected_commands),
           static_cast<unsigned>(failed_commands),
           static_cast<unsigned>(expired_commands),
           static_cast<unsigned>(blocked_commands),
           static_cast<unsigned>(blocked_stale_commands),
           static_cast<unsigned>(blocked_unreachable_commands),
           static_cast<unsigned>(blocked_untrusted_commands),
           static_cast<unsigned>(clamped_commands),
           static_cast<unsigned long>(last_poll_ms_),
           static_cast<unsigned long>(poll_success_count_),
           static_cast<unsigned long>(poll_fail_count_),
           last_poll_error,
           static_cast<unsigned>(paired_nodes),
           static_cast<unsigned>(trusted_nodes),
           static_cast<unsigned>(reachable_nodes),
           static_cast<unsigned>(reachable_trusted_nodes),
           static_cast<unsigned>(stale_nodes),
           static_cast<unsigned>(trusted_stale_nodes),
           static_cast<unsigned>(identity_missing_nodes),
           static_cast<unsigned>(bound_zones),
           static_cast<unsigned>(fresh_zones),
           static_cast<unsigned>(stale_zones),
           ready_for_commands ? "true" : "false",
           ready_for_forecast ? "true" : "false",
           next_action,
           blockers,
           ota_label,
           static_cast<unsigned>(running_subtype),
           static_cast<unsigned long>(running_size),
           static_cast<unsigned long>(OTA_SLOT_BYTES),
           ota_state_name_(ota_state),
           ota_state == ESP_OTA_IMG_PENDING_VERIFY ? "true" : "false",
           strategy.has_physical_temperature ? "true" : "false",
           strategy.physical_temperature_c,
           strategy.comfort_demand_c,
           driver_room_id,
           static_cast<unsigned long>(learning.zones_with_history),
           static_cast<unsigned long>(learning.total_samples),
           static_cast<unsigned long>(learning.total_calling_samples),
           learning.calling_ratio,
           static_cast<unsigned long>(learning.zones_with_delta),
           static_cast<unsigned long>(learning.warming_zones),
           static_cast<unsigned long>(learning.cooling_zones),
           learning.average_delta_c_per_h,
           forecast_status_,
           forecast_fetch_requested_ ? "true" : "false",
           forecast_last_fetch_ms_ == 0 ? 0UL : static_cast<unsigned long>((esphome::millis() - forecast_last_fetch_ms_) / 1000UL),
           forecast_last_error,
           static_cast<unsigned>(last_forecast_dispatch_.active),
           static_cast<unsigned>(last_forecast_dispatch_.sent),
           static_cast<unsigned>(last_forecast_dispatch_.skipped),
           static_cast<unsigned>(last_forecast_dispatch_.failed),
           static_cast<unsigned>(last_forecast_dispatch_.blocked_stale),
           static_cast<unsigned>(last_forecast_dispatch_.blocked_unreachable),
           static_cast<unsigned>(last_forecast_dispatch_.blocked_untrusted));
}

}  // namespace lune_touch_coordinator
}  // namespace esphome
