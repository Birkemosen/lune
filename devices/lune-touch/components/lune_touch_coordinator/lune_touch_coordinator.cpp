#include "lune_touch_coordinator.h"
#include "asgard_adapter.h"
#include "asgard_confirmation.h"
#include "forecast_timeline.h"
#include "esphome/components/network/util.h"
#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include "esp_crt_bundle.h"
#include "esp_heap_caps.h"
#include "esp_http_client.h"
#include "esp_ota_ops.h"
#include "esp_system.h"
#include <nvs.h>
#include <nvs_flash.h>
#include <ArduinoJson.h>
#include <algorithm>
#include <cctype>
#include <cmath>
#include <cstdarg>
#include <ctime>
#include <cstdio>
#include <cstring>

namespace esphome {
namespace lune_touch_coordinator {

static const char *const TAG = "lune_touch";
static const char *const TOUCH_NAMESPACE = "touch";
static const char *const WEATHER_NAMESPACE = "weather";
static const char *const LEDGER_NAMESPACE = "ledger";
static const char *const SETTINGS_NAMESPACE = "touch_settings";
static const char *const IDENTITY_NAMESPACE = "touch_identity";
static const char *const TOUCH_REGISTRY_PARTITION = "touchreg";

namespace {

static constexpr float DEG_TO_RAD = 3.14159265358979f / 180.0f;
static constexpr float WIND_REF_MS = 10.0f;
static constexpr float COLD_REF_K = 10.0f;
static constexpr float SOLAR_REF_WM2 = 800.0f;
static constexpr float LOAD_THRESHOLD = 1.0f;
static constexpr float GAIN_C_PER_LOAD = 0.5f;
static constexpr uint32_t OTA_SLOT_BYTES = 0x640000;
static constexpr uint32_t FORECAST_CACHE_MAGIC = 0x4C544657;  // LTFW
static constexpr uint16_t FORECAST_CACHE_VERSION =
    lune_touch_forecast_timeline::PERSISTED_FORECAST_CACHE_VERSION;
static constexpr size_t REGISTRY_CHUNK_SIZE = 3072;
static constexpr size_t REGISTRY_CHUNK_COUNT =
    (sizeof(::lune_touch::PersistedState) + REGISTRY_CHUNK_SIZE - 1) / REGISTRY_CHUNK_SIZE;
static constexpr const char *REGISTRY_CHUNK_KEYS[] = {
    "registry_a", "registry_b", "registry_c", "registry_d",
    "registry_e", "registry_f", "registry_g", "registry_h",
};
static_assert(REGISTRY_CHUNK_COUNT <= sizeof(REGISTRY_CHUNK_KEYS) / sizeof(REGISTRY_CHUNK_KEYS[0]),
              "Touch registry chunk key list is too short");

// Command records are expired on reboot by design.  Keep only a short recent
// history in NVS so the human-readable ledger does not consume the space
// needed by the coordinator registry.
static constexpr size_t PERSISTED_LEDGER_RECORDS = 4;
static bool touch_registry_partition_ready_ = false;
static bool dedicated_touch_registry_valid_ = false;

// LVGL's built-in Montserrat fonts include the Font Awesome symbols below,
// but not arbitrary Unicode arrows, geometric circles, or middle dots. Keep
// these UTF-8 sequences independent of lvgl.h so the coordinator model remains
// buildable in the host-side tests.
static constexpr const char DISPLAY_ICON_OK[] = "\xEF\x80\x8C";       // U+F00C
static constexpr const char DISPLAY_ICON_CLOSE[] = "\xEF\x80\x8D";    // U+F00D
static constexpr const char DISPLAY_ICON_RIGHT[] = "\xEF\x81\x94";    // U+F054
static constexpr const char DISPLAY_ICON_WARNING[] = "\xEF\x81\xB1";  // U+F071
static constexpr const char DISPLAY_ICON_UP[] = "\xEF\x81\xB7";       // U+F077
static constexpr const char DISPLAY_ICON_DOWN[] = "\xEF\x81\xB8";     // U+F078
static constexpr const char DISPLAY_ICON_WIND[] = "\xEF\x81\xB4";     // U+F074

uint32_t display_hash_mix_(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619UL;
  return hash;
}

uint32_t display_hash_text_(uint32_t hash, const char *value) {
  if (value == nullptr)
    return display_hash_mix_(hash, 0);
  while (*value != '\0')
    hash = display_hash_mix_(hash, static_cast<uint8_t>(*value++));
  return hash;
}

uint32_t display_hash_float_(uint32_t hash, float value) {
  if (!std::isfinite(value))
    return display_hash_mix_(hash, 0x7FC00000UL);
  return display_hash_mix_(hash, static_cast<uint32_t>(std::lround(value * 10.0f)));
}

void append_form_component_(std::string &out, const char *value) {
  static constexpr char HEX[] = "0123456789ABCDEF";
  if (value == nullptr)
    return;
  for (const unsigned char *p = reinterpret_cast<const unsigned char *>(value); *p != '\0'; ++p) {
    const unsigned char c = *p;
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '~') {
      out.push_back(static_cast<char>(c));
    } else {
      out.push_back('%');
      out.push_back(HEX[(c >> 4) & 0x0F]);
      out.push_back(HEX[c & 0x0F]);
    }
  }
}

bool json_object_to_form_(const char *payload, std::string &form) {
  JsonDocument doc;
  const DeserializationError error = deserializeJson(doc, payload != nullptr ? payload : "{}");
  if (error || !doc.is<JsonObject>())
    return false;

  form.clear();
  for (JsonPairConst pair : doc.as<JsonObjectConst>()) {
    if (!form.empty())
      form.push_back('&');
    append_form_component_(form, pair.key().c_str());
    form.push_back('=');

    JsonVariantConst value = pair.value();
    if (value.is<JsonObject>() || value.is<JsonArray>())
      return false;
    if (value.is<const char *>()) {
      append_form_component_(form, value.as<const char *>());
    } else {
      std::string scalar;
      serializeJson(value, scalar);
      append_form_component_(form, scalar.c_str());
    }
  }
  return true;
}

void init_touch_registry_partition_() {
  const esp_err_t err = nvs_flash_init_partition(TOUCH_REGISTRY_PARTITION);
  if (err == ESP_OK) {
    touch_registry_partition_ready_ = true;
    ESP_LOGI(TAG, "Using dedicated Touch registry NVS partition");
    return;
  }
  // Older partition tables do not contain touchreg yet. Keep the compatibility
  // path operational until the one-time USB partition-table install is done.
  touch_registry_partition_ready_ = false;
  ESP_LOGW(TAG, "Dedicated Touch registry partition unavailable (%s); using legacy NVS",
           esp_err_to_name(err));
}

esp_err_t open_touch_registry_nvs_(nvs_open_mode_t mode, nvs_handle_t *handle) {
  if (touch_registry_partition_ready_)
    return nvs_open_from_partition(TOUCH_REGISTRY_PARTITION, TOUCH_NAMESPACE, mode, handle);
  return nvs_open(TOUCH_NAMESPACE, mode, handle);
}
struct PersistedLedgerCompact {
  uint32_t magic{::lune_touch::PERSISTED_LEDGER_MAGIC};
  uint16_t version{1};
  uint16_t reserved{0};
  uint32_t boot_id{0};
  uint32_t count{0};
  ::lune_touch::CommandRecord records[PERSISTED_LEDGER_RECORDS]{};
};

template <typename State>
bool load_registry_chunks_for_(nvs_handle_t handle, State *state) {
  if (state == nullptr)
    return false;
  size_t lengths[sizeof(REGISTRY_CHUNK_KEYS) / sizeof(REGISTRY_CHUNK_KEYS[0])]{};
  size_t total = 0;
  size_t chunk_count = 0;
  while (total < sizeof(*state) && chunk_count < sizeof(REGISTRY_CHUNK_KEYS) / sizeof(REGISTRY_CHUNK_KEYS[0])) {
    const size_t i = chunk_count++;
    lengths[i] = 0;
    if (nvs_get_blob(handle, REGISTRY_CHUNK_KEYS[i], nullptr, &lengths[i]) != ESP_OK ||
        lengths[i] == 0 || lengths[i] > REGISTRY_CHUNK_SIZE ||
        total + lengths[i] > sizeof(*state))
      return false;
    total += lengths[i];
  }
  if (total != sizeof(*state) || chunk_count == 0)
    return false;

  uint8_t *destination = reinterpret_cast<uint8_t *>(state);
  size_t offset = 0;
  for (size_t i = 0; i < chunk_count; i++) {
    size_t length = lengths[i];
    if (nvs_get_blob(handle, REGISTRY_CHUNK_KEYS[i], destination + offset, &length) != ESP_OK ||
        length != lengths[i])
      return false;
    offset += length;
  }
  return true;
}

bool load_registry_chunks_(nvs_handle_t handle, ::lune_touch::PersistedState *state) {
  return load_registry_chunks_for_(handle, state);
}

void cleanup_legacy_touch_registry_() {
  if (!touch_registry_partition_ready_ || !dedicated_touch_registry_valid_)
    return;

  nvs_handle_t legacy_handle;
  const esp_err_t open_err = nvs_open(TOUCH_NAMESPACE, NVS_READWRITE, &legacy_handle);
  if (open_err == ESP_ERR_NVS_NOT_FOUND)
    return;
  if (open_err != ESP_OK) {
    ESP_LOGW(TAG, "Could not open legacy Touch registry for cleanup: %s",
             esp_err_to_name(open_err));
    return;
  }
  const esp_err_t erase_err = nvs_erase_all(legacy_handle);
  const esp_err_t commit_err = erase_err == ESP_OK ? nvs_commit(legacy_handle) : erase_err;
  nvs_close(legacy_handle);
  if (commit_err == ESP_OK)
    ESP_LOGI(TAG, "Removed migrated Touch registry from default NVS");
  else if (commit_err != ESP_ERR_NVS_NOT_FOUND)
    ESP_LOGW(TAG, "Could not remove legacy Touch registry: %s", esp_err_to_name(commit_err));
}

struct PersistedForecastCache {
  uint32_t magic{FORECAST_CACHE_MAGIC};
  uint16_t version{FORECAST_CACHE_VERSION};
  uint16_t reserved{0};
  uint8_t hours_count{0};
  uint8_t reserved2[3]{};
  int64_t fetch_epoch_s{0};
  char provider_timezone[48]{};
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
  const char *state = doc[key]["state"].as<const char *>();
  if (state == nullptr)
    state = doc[key]["value"].as<const char *>();
  return state;
}

bool state_is_on_(const char *state) {
  return state == nullptr || std::strcmp(state, "on") == 0 || std::strcmp(state, "ON") == 0 ||
         std::strcmp(state, "true") == 0 || std::strcmp(state, "1") == 0;
}

void nullable_float_(char *out, size_t out_len, bool has_value, float value) {
  if (out == nullptr || out_len == 0)
    return;
  if (has_value && std::isfinite(value))
    snprintf(out, out_len, "%.1f", value);
  else
    std::strncpy(out, "null", out_len - 1);
  out[out_len - 1] = '\0';
}

void json_float_token_(char *out, size_t out_len, float value, unsigned decimals) {
  if (out == nullptr || out_len == 0)
    return;
  if (!std::isfinite(value)) {
    std::strncpy(out, "null", out_len - 1);
    out[out_len - 1] = '\0';
    return;
  }
  const char *format = decimals >= 6 ? "%.6f" : decimals == 3 ? "%.3f" :
                       decimals == 2 ? "%.2f" : decimals == 0 ? "%.0f" : "%.1f";
  snprintf(out, out_len, format, value);
  out[out_len - 1] = '\0';
}

// HTTP/TLS parsers expect ordinary byte-addressable memory. Keep their response
// buffers in the internal heap whenever possible; PSRAM remains a fallback for
// the larger legacy V6 snapshot and forecast responses.
char *alloc_http_body_(size_t capacity) {
  if (capacity == 0)
    return nullptr;
  char *body = static_cast<char *>(heap_caps_malloc(capacity, MALLOC_CAP_INTERNAL | MALLOC_CAP_8BIT));
  if (body == nullptr)
    body = static_cast<char *>(heap_caps_malloc(capacity, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
  return body;
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

int64_t current_epoch_s_() {
  const int64_t epoch_s = static_cast<int64_t>(::time(nullptr));
  return epoch_s >= lune_touch_forecast_timeline::MIN_VALID_EPOCH_S ? epoch_s : 0;
}

void stamp_command_timing_(::lune_touch::CommandRecord *record, uint32_t now_ms, uint32_t ttl_s) {
  if (record == nullptr)
    return;
  record->created_at_ms = now_ms;
  record->expires_at_ms = now_ms + ttl_s * 1000UL;
  const int64_t now_epoch_s = current_epoch_s_();
  if (now_epoch_s > 0) {
    record->created_at_epoch_s = now_epoch_s;
    record->expires_at_epoch_s = now_epoch_s + static_cast<int64_t>(ttl_s);
  }
}

void stamp_command_target_(::lune_touch::CommandRecord *record,
                           const ::lune_touch::PairedNode *node,
                           const ::lune_touch::ZoneBinding *binding) {
  if (record == nullptr || node == nullptr || binding == nullptr)
    return;
  std::strncpy(record->room_id, binding->room_id, sizeof(record->room_id) - 1);
  std::strncpy(record->node_id, node->node_id, sizeof(record->node_id) - 1);
  std::strncpy(record->loop_id, binding->loop_id, sizeof(record->loop_id) - 1);
}

const char *cache_validation_error_(lune_touch_forecast_timeline::CacheValidation validation) {
  switch (validation) {
    case lune_touch_forecast_timeline::CacheValidation::EXPIRED:
      return "cache_expired";
    case lune_touch_forecast_timeline::CacheValidation::UNALIGNABLE:
      return "cache_unalignable";
    case lune_touch_forecast_timeline::CacheValidation::FRESH:
    default:
      return "restored_cache";
  }
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

struct PairedNodeV8 {
  char node_id[24]{};
  char hostname[64]{};
  char fallback_ip[16]{};
  char model[24]{};
  char firmware[24]{};
  char pairing_fingerprint[24]{};
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

struct ZoneBindingV8 {
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
  PairedNodeV8 nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV7 zones[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct PersistedStateV7 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V7};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  PairedNodeV8 nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV7 zones[::lune_touch::MAX_HOUSE_ZONES]{};
  ::lune_touch::ZoneHistory histories[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct PersistedStateV8 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V8};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  PairedNodeV8 nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV8 zones[::lune_touch::MAX_HOUSE_ZONES]{};
  ::lune_touch::ZoneHistory histories[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct ZoneBindingV9 {
  char room_id[32]{}; char room_name[48]{}; uint8_t node_index{0}; uint8_t zone_index{0};
  uint8_t exterior_walls{0}; float wind_exposure{0.5f}; float solar_gain{0.3f};
  uint8_t thermal_lead_h{4}; float max_offset_c{1.5f}; float comfort_setpoint_c{21.0f};
  float comfort_bias_c{0.0f}; float schedule_setpoint_c{21.0f}; uint16_t schedule_start_min{360};
  uint16_t schedule_end_min{1320}; uint8_t schedule_day_mask{0x7F}; uint8_t priority{1};
  ::lune_touch::ZoneNameSource name_source{::lune_touch::ZoneNameSource::GENERATED};
  uint16_t thermal_samples{0}; float learned_heat_gain_c_per_h{0.0f};
  float learned_cool_loss_c_per_h{0.0f}; bool enabled{false}; bool schedule_enabled{false};
};
struct PersistedStateV9 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC}; uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V9};
  uint16_t reserved{0}; uint32_t node_count{0}; uint32_t zone_count{0};
  ::lune_touch::PairedNode nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV9 zones[::lune_touch::MAX_HOUSE_ZONES]{};
  ::lune_touch::ZoneHistory histories[::lune_touch::MAX_HOUSE_ZONES]{};
};

struct ZoneBindingV10 {
  char room_id[32]{}; char room_name[48]{}; char loop_id[48]{};
  uint8_t node_index{0}; uint8_t zone_index{0}; uint8_t exterior_walls{0};
  float wind_exposure{0.5f}; float solar_gain{0.3f}; uint8_t thermal_lead_h{4};
  float max_offset_c{1.5f}; float comfort_setpoint_c{21.0f}; float comfort_bias_c{0.0f};
  float schedule_setpoint_c{21.0f}; uint16_t schedule_start_min{360};
  uint16_t schedule_end_min{1320}; uint8_t schedule_day_mask{0x7F}; uint8_t priority{1};
  ::lune_touch::ZoneNameSource name_source{::lune_touch::ZoneNameSource::GENERATED};
  uint16_t thermal_samples{0}; float learned_heat_gain_c_per_h{0.0f};
  float learned_cool_loss_c_per_h{0.0f}; bool enabled{false}; bool schedule_enabled{false};
};
struct PersistedStateV10 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V10}; uint16_t reserved{0};
  uint32_t node_count{0}; uint32_t zone_count{0};
  ::lune_touch::PairedNode nodes[::lune_touch::MAX_NODES]{};
  ZoneBindingV10 zones[::lune_touch::MAX_HOUSE_ZONES]{};
  ::lune_touch::ZoneHistory histories[::lune_touch::MAX_HOUSE_ZONES]{};
};

// v11 used the current node/room/zone records but persisted runtime-only
// temperature history as a fixed array. Keep this wire shape solely to migrate
// existing NVS data; v12 deliberately omits histories from the registry.
struct PersistedStateV11 {
  uint32_t magic{::lune_touch::PERSISTED_STATE_MAGIC};
  uint16_t version{::lune_touch::PERSISTED_STATE_VERSION_V11};
  uint16_t reserved{0};
  uint32_t node_count{0};
  uint32_t zone_count{0};
  uint32_t room_count{0};
  ::lune_touch::PairedNode nodes[::lune_touch::MAX_NODES]{};
  ::lune_touch::LogicalRoom rooms[::lune_touch::MAX_HOUSE_ROOMS]{};
  ::lune_touch::ZoneBinding zones[::lune_touch::MAX_HOUSE_ZONES]{};
  ::lune_touch::ZoneHistory histories[::lune_touch::MAX_HOUSE_ZONES]{};
};

void copy_legacy_zone_v9_(::lune_touch::ZoneBinding &dest, const ZoneBindingV9 &src,
                          const ::lune_touch::PairedNode *node) {
  std::strncpy(dest.room_id, src.room_id, sizeof(dest.room_id) - 1);
  std::strncpy(dest.room_name, src.room_name, sizeof(dest.room_name) - 1);
  dest.node_index=src.node_index; dest.zone_index=src.zone_index; dest.exterior_walls=src.exterior_walls;
  dest.wind_exposure=src.wind_exposure; dest.solar_gain=src.solar_gain; dest.thermal_lead_h=src.thermal_lead_h;
  dest.max_offset_c=src.max_offset_c; dest.comfort_setpoint_c=src.comfort_setpoint_c;
  dest.comfort_bias_c=src.comfort_bias_c; dest.schedule_setpoint_c=src.schedule_setpoint_c;
  dest.schedule_start_min=src.schedule_start_min; dest.schedule_end_min=src.schedule_end_min;
  dest.schedule_day_mask=src.schedule_day_mask; dest.priority=src.priority; dest.name_source=src.name_source;
  dest.thermal_samples=src.thermal_samples; dest.learned_heat_gain_c_per_h=src.learned_heat_gain_c_per_h;
  dest.learned_cool_loss_c_per_h=src.learned_cool_loss_c_per_h; dest.enabled=src.enabled;
  dest.schedule_enabled=src.schedule_enabled;
  if (node != nullptr && node->node_id[0] != '\0')
    snprintf(dest.loop_id, sizeof(dest.loop_id), "loop-%s-%02u", node->node_id,
             static_cast<unsigned>(src.zone_index + 1));
}

void copy_legacy_zone_v10_(::lune_touch::ZoneBinding &dest, const ZoneBindingV10 &src) {
  std::strncpy(dest.room_id, src.room_id, sizeof(dest.room_id) - 1);
  std::strncpy(dest.room_name, src.room_name, sizeof(dest.room_name) - 1);
  std::strncpy(dest.loop_id, src.loop_id, sizeof(dest.loop_id) - 1);
  dest.node_index = src.node_index; dest.zone_index = src.zone_index;
  dest.exterior_walls = src.exterior_walls; dest.wind_exposure = src.wind_exposure;
  dest.solar_gain = src.solar_gain; dest.thermal_lead_h = src.thermal_lead_h;
  dest.max_offset_c = src.max_offset_c; dest.comfort_setpoint_c = src.comfort_setpoint_c;
  dest.comfort_bias_c = src.comfort_bias_c; dest.schedule_setpoint_c = src.schedule_setpoint_c;
  dest.schedule_start_min = src.schedule_start_min; dest.schedule_end_min = src.schedule_end_min;
  dest.schedule_day_mask = src.schedule_day_mask; dest.priority = src.priority;
  dest.name_source = src.name_source; dest.thermal_samples = src.thermal_samples;
  dest.learned_heat_gain_c_per_h = src.learned_heat_gain_c_per_h;
  dest.learned_cool_loss_c_per_h = src.learned_cool_loss_c_per_h;
  dest.enabled = src.enabled; dest.schedule_enabled = src.schedule_enabled; dest.commissioned = src.enabled;
}

bool populate_missing_loop_ids_(::lune_touch::PersistedState *state) {
  if (state == nullptr)
    return false;
  bool changed = false;
  for (size_t i = 0; i < state->zone_count; i++) {
    ::lune_touch::ZoneBinding &zone = state->zones[i];
    if (!zone.enabled || zone.loop_id[0] != '\0')
      continue;
    if (zone.node_index >= state->node_count || state->nodes[zone.node_index].node_id[0] == '\0') {
      // An unidentified legacy loop is not safe to command; retain it as disabled history.
      zone.enabled = false;
      changed = true;
      continue;
    }
    std::snprintf(zone.loop_id, sizeof(zone.loop_id), "loop-%s-%02u",
                  state->nodes[zone.node_index].node_id,
                  static_cast<unsigned>(zone.zone_index + 1));
    changed = true;
  }
  for (size_t i = 0; i < state->zone_count; i++) {
    ::lune_touch::ZoneBinding &zone = state->zones[i];
    if (zone.node_index < state->node_count && state->nodes[zone.node_index].node_id[0] != '\0' &&
        zone.node_id[0] == '\0') {
      std::strncpy(zone.node_id, state->nodes[zone.node_index].node_id, sizeof(zone.node_id) - 1);
      changed = true;
    }
  }
  return changed;
}

void copy_legacy_node_(::lune_touch::PairedNode &dest, const PairedNodeV5 &src) {
  std::strncpy(dest.node_id, src.node_id, sizeof(dest.node_id) - 1);
  std::strncpy(dest.name, src.node_id, sizeof(dest.name) - 1);
  std::strncpy(dest.hostname, src.hostname, sizeof(dest.hostname) - 1);
  std::strncpy(dest.fallback_ip, src.fallback_ip, sizeof(dest.fallback_ip) - 1);
  std::strncpy(dest.model, src.model, sizeof(dest.model) - 1);
  std::strncpy(dest.firmware, src.firmware, sizeof(dest.firmware) - 1);
  dest.trust = src.trust;
  dest.last_seen_ms = src.last_seen_ms;
  dest.reachable = src.reachable;
}

void copy_legacy_node_(::lune_touch::PairedNode &dest, const PairedNodeV8 &src) {
  std::strncpy(dest.node_id, src.node_id, sizeof(dest.node_id) - 1);
  std::strncpy(dest.name, src.node_id, sizeof(dest.name) - 1);
  std::strncpy(dest.hostname, src.hostname, sizeof(dest.hostname) - 1);
  std::strncpy(dest.fallback_ip, src.fallback_ip, sizeof(dest.fallback_ip) - 1);
  std::strncpy(dest.model, src.model, sizeof(dest.model) - 1);
  std::strncpy(dest.firmware, src.firmware, sizeof(dest.firmware) - 1);
  std::strncpy(dest.pairing_fingerprint, src.pairing_fingerprint,
               sizeof(dest.pairing_fingerprint) - 1);
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
  dest.name_source = ::lune_touch::ZoneNameSource::TOUCH;
}

void copy_legacy_zone_(::lune_touch::ZoneBinding &dest, const ZoneBindingV8 &src) {
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
  dest.thermal_samples = src.thermal_samples;
  dest.learned_heat_gain_c_per_h = src.learned_heat_gain_c_per_h;
  dest.learned_cool_loss_c_per_h = src.learned_cool_loss_c_per_h;
  dest.enabled = src.enabled;
  dest.schedule_enabled = src.schedule_enabled;
  dest.name_source = ::lune_touch::ZoneNameSource::TOUCH;
}

const char *zone_name_source_name_(::lune_touch::ZoneNameSource source) {
  switch (source) {
    case ::lune_touch::ZoneNameSource::V6:
      return "v6";
    case ::lune_touch::ZoneNameSource::TOUCH:
      return "touch";
    case ::lune_touch::ZoneNameSource::GENERATED:
    default:
      return "generated";
  }
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
  init_touch_registry_partition_();
  boot_id_ = esp_random();
  if (boot_id_ == 0)
    boot_id_ = 1;
  ledger_.set_boot_id(boot_id_);
  model_.set_node_stale_after_ms(node_stale_after_ms_);
  // Compact the historical command ledger before migrating/saving the larger
  // coordinator registry; both namespaces share the small NVS partition.
  load_ledger_();
  const bool loaded_registry = load_registry_();
  cleanup_legacy_touch_registry_();
  load_forecast_settings_();
  load_settings_();
  ensure_automatic_identity_();
  std::snprintf(authority_lease_id_, sizeof(authority_lease_id_), "touch-%08lx",
                static_cast<unsigned long>(boot_id_));
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
  const size_t expired = ledger_.expire_pending(now, current_epoch_s_());
  give_state_lock_();
  if (expired > 0)
    save_ledger_();
}

void LuneTouchCoordinator::dump_config() {
  ESP_LOGCONFIG(TAG, "Lune Touch Coordinator:");
  ESP_LOGCONFIG(TAG, "  Node stale after: %u ms", static_cast<unsigned>(node_stale_after_ms_));
  ESP_LOGCONFIG(TAG, "  V6 endpoints: /api/hv6/v1/overview, /zones, /events");
  ESP_LOGCONFIG(TAG, "  Command path: expiring coordinator commands, clamped by Lune V6");
  ESP_LOGCONFIG(TAG, "  Heat source: %s:%u / %s every %us",
                heat_source_.host, static_cast<unsigned>(heat_source_.port),
                heat_source_.weighted_temperature_variable,
                static_cast<unsigned>(heat_source_.push_interval_s));
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
  // An explicit dashboard scan must wake the task even during the normal
  // boot grace period; a plain vTaskDelay would leave the user waiting the
  // full nine seconds before any V6 names could be fetched.
  ulTaskNotifyTake(pdTRUE, pdMS_TO_TICKS(POLL_BOOT_DELAY_MS));
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
      bool odin_due = false;
      if (take_state_lock_(100)) {
        const uint32_t odin_now = esphome::millis();
        odin_due = odin_plan_.enabled && odin_plan_.host[0] != '\0' &&
                   (odin_plan_.last_fetch_ms == 0 ||
                    odin_now - odin_plan_.last_fetch_ms >=
                        static_cast<uint32_t>(odin_plan_.refresh_interval_s) * 1000UL);
        give_state_lock_();
      }
      if (odin_due)
        fetch_odin_plan_();
      bool node_refresh_requested = false;
      if (take_state_lock_(100)) {
        node_refresh_requested = node_refresh_requested_;
        node_refresh_requested_ = false;
        give_state_lock_();
      }
      // Keep the normal periodic poll and let an explicit dashboard refresh
      // wake this task without doing network I/O on the HTTP server stack.
      (void) node_refresh_requested;
      poll_once_();
      if (take_state_lock_(100)) {
        poll_generation_++;
        give_state_lock_();
      }
      bool push_due = false;
      const uint32_t now = esphome::millis();
      if (take_state_lock_(100)) {
        push_due = heat_source_push_requested_ ||
                   (heat_source_.enabled && heat_source_.host[0] != '\0' &&
                    (heat_source_.last_write_ms == 0 ||
                     now - heat_source_.last_write_ms >=
                         static_cast<uint32_t>(heat_source_.push_interval_s) * 1000UL));
        heat_source_push_requested_ = false;
        give_state_lock_();
      }
      const bool lease_due = authority_last_renew_ms_ == 0 ||
                             now - authority_last_renew_ms_ >= 30000UL;
      if (lease_due)
        renew_authority_lease_();
      if (push_due && authority_expires_at_ms_ != 0 &&
          static_cast<int32_t>(esphome::millis() - authority_expires_at_ms_) < 0)
        push_weighted_temperature_();
    }
    ulTaskNotifyTake(pdTRUE, pdMS_TO_TICKS(POLL_INTERVAL_MS));
  }
}

bool LuneTouchCoordinator::read_asgard_number_(const HeatSourceState &source, float *value,
                                               char *error, size_t error_capacity) {
  if (value == nullptr || error == nullptr || error_capacity == 0)
    return false;
  *value = NAN;
  error[0] = '\0';
  const asgard_adapter::Config adapter_config{
      source.host, source.port, source.weighted_temperature_variable};
  char url[320];
  if (!asgard_adapter::build_physical_read_url(adapter_config, url, sizeof(url))) {
    std::snprintf(error, error_capacity, "invalid read endpoint");
    return false;
  }
  for (uint8_t attempt = 0; attempt < asgard_confirmation::MAX_READ_ATTEMPTS; ++attempt) {
    char body[384];
    int status = 0;
    if (esphome::network::is_connected() && fetch_json_(url, body, sizeof(body), &status)) {
      if (asgard_adapter::parse_number_response(body, value)) {
        return true;
      }
      std::snprintf(error, error_capacity, "read value missing");
    } else {
      std::snprintf(error, error_capacity, status > 0 ? "read http %d" : "read unreachable", status);
    }
    if (attempt + 1 < asgard_confirmation::MAX_READ_ATTEMPTS)
      vTaskDelay(pdMS_TO_TICKS(asgard_confirmation::readback_backoff_ms(attempt)));
  }
  return false;
}

bool LuneTouchCoordinator::push_weighted_temperature_() {
  static constexpr uint32_t COVERAGE_GRACE_MS = 300000;
  HeatSourceState source;
  ::lune_touch::StrategySnapshot strategy;
  if (!take_state_lock_(100))
    return false;
  source = heat_source_;
  strategy = model_.strategy_snapshot();
  give_state_lock_();

  char error[sizeof(heat_source_.last_error)]{};
  bool ok = false;
  asgard_confirmation::Status confirmation_status = asgard_confirmation::Status::UNREACHABLE;
  float confirmed_value = NAN;
  float value_to_write = NAN;
  int write_http_status = 0;
  if (!source.enabled) {
    std::strncpy(error, "disabled", sizeof(error) - 1);
  } else if (source.host[0] == '\0') {
    std::strncpy(error, "address missing", sizeof(error) - 1);
  } else if (strategy.has_physical_temperature && std::isfinite(strategy.physical_temperature_c)) {
    value_to_write = strategy.physical_temperature_c;
    if (authority_smooth_first_write_ && std::isfinite(authority_last_fallback_value_c_)) {
      value_to_write = std::clamp(value_to_write, authority_last_fallback_value_c_ - 0.5f,
                                  authority_last_fallback_value_c_ + 0.5f);
    }
  } else if (std::isfinite(source.last_confirmed_value_c) && source.last_healthy_physical_ms != 0 &&
             esphome::millis() - source.last_healthy_physical_ms <= COVERAGE_GRACE_MS) {
    value_to_write = source.last_confirmed_value_c;
    std::strncpy(error, "coverage grace", sizeof(error) - 1);
  } else {
    std::strncpy(error, "coverage degraded", sizeof(error) - 1);
  }
  if (!std::isfinite(value_to_write)) {
    // No healthy or safely held physical signal; do not publish a partial-house average.
  } else if (!esphome::network::is_connected()) {
    std::strncpy(error, "network down", sizeof(error) - 1);
  } else {
    char url[320];
    const asgard_adapter::Config adapter_config{
        source.host, source.port, source.weighted_temperature_variable};
    if (!asgard_adapter::build_physical_write_url(adapter_config, value_to_write, url, sizeof(url))) {
      std::strncpy(error, "invalid endpoint", sizeof(error) - 1);
    } else {
    esp_http_client_config_t http_cfg{};
    http_cfg.url = url;
    http_cfg.method = HTTP_METHOD_POST;
    http_cfg.timeout_ms = HTTP_TIMEOUT_MS;
    http_cfg.disable_auto_redirect = true;
    esp_http_client_handle_t client = esp_http_client_init(&http_cfg);
    if (client == nullptr) {
      std::strncpy(error, "http init failed", sizeof(error) - 1);
    } else {
      esp_http_client_set_post_field(client, "", 0);
      const esp_err_t err = esp_http_client_perform(client);
      const int status = err == ESP_OK ? esp_http_client_get_status_code(client) : 0;
      write_http_status = status;
      const bool write_ok = asgard_adapter::request_succeeded(err == ESP_OK, status);
      if (!write_ok) {
        if (err == ESP_OK)
          snprintf(error, sizeof(error), "http %d", status);
        else
          snprintf(error, sizeof(error), "http %s", esp_err_to_name(err));
      } else {
        confirmation_status = asgard_confirmation::Status::SENT;
        if (read_asgard_number_(source, &confirmed_value, error, sizeof(error))) {
          if (asgard_confirmation::values_match(value_to_write, confirmed_value)) {
            confirmation_status = asgard_confirmation::Status::CONFIRMED;
            ok = true;
            error[0] = '\0';
          } else {
            confirmation_status = asgard_confirmation::Status::MISMATCH;
            std::snprintf(error, sizeof(error), "requested %.2f, read %.2f",
                          value_to_write, confirmed_value);
          }
        }
      }
      esp_http_client_close(client);
      esp_http_client_cleanup(client);
    }
    }
  }

  if (take_state_lock_(100)) {
    heat_source_.has_last_push = true;
    std::strncpy(heat_source_.last_status, asgard_confirmation::status_name(confirmation_status),
                 sizeof(heat_source_.last_status) - 1);
    heat_source_.last_status[sizeof(heat_source_.last_status) - 1] = '\0';
    heat_source_.last_write_ms = esphome::millis();
    heat_source_.last_http_status = write_http_status;
    if (std::isfinite(value_to_write))
      heat_source_.last_requested_value_c = value_to_write;
    if (std::isfinite(confirmed_value))
      heat_source_.last_confirmed_value_c = confirmed_value;
    if (ok) {
      if (strategy.has_physical_temperature)
        heat_source_.last_healthy_physical_ms = esphome::millis();
      heat_source_.last_confirmed_ms = esphome::millis();
      heat_source_.failure_streak = 0;
      heat_source_.last_error[0] = '\0';
      authority_smooth_first_write_ = false;
    } else {
      if (heat_source_.failure_count < UINT32_MAX)
        heat_source_.failure_count++;
      if (heat_source_.failure_streak < UINT32_MAX)
        heat_source_.failure_streak++;
      std::strncpy(heat_source_.last_error, error, sizeof(heat_source_.last_error) - 1);
      heat_source_.last_error[sizeof(heat_source_.last_error) - 1] = '\0';
    }
    give_state_lock_();
  }
  log_event_(ok ? "info" : "warn", "heat_source",
             ok ? "weighted temperature confirmed" : error);
  return ok;
}

bool LuneTouchCoordinator::fetch_odin_plan_() {
  OdinPlanState settings;
  if (!take_state_lock_(100))
    return false;
  settings = odin_plan_;
  give_state_lock_();
  if (!settings.enabled || settings.host[0] == '\0')
    return false;

  char error[sizeof(settings.last_error)]{};
  int status = 0;
  odin_plan::Snapshot plan{};
  static char body[12288];
  char url[160];
  std::snprintf(url, sizeof(url), "http://%s:%u/dashboard/odin", settings.host,
                static_cast<unsigned>(settings.port));
  const bool fetched = fetch_json_(url, body, sizeof(body), &status);
  if (!fetched) {
    std::snprintf(error, sizeof(error), status > 0 ? "http %d" : "unreachable", status);
  } else {
    JsonDocument doc;
    const DeserializationError json_error = deserializeJson(doc, body);
    JsonObjectConst response = doc.as<JsonObjectConst>();
    auto copy_float_array = [](JsonVariantConst source, float *destination) {
      JsonArrayConst values = source.as<JsonArrayConst>();
      if (values.isNull() || values.size() != odin_plan::HORIZON_HOURS)
        return false;
      for (size_t i = 0; i < odin_plan::HORIZON_HOURS; ++i) {
        const float value = values[i].as<float>();
        if (!std::isfinite(value))
          return false;
        destination[i] = value;
      }
      return true;
    };
    auto copy_operation_mode_array = [](JsonVariantConst source, int *destination) {
      JsonArrayConst values = source.as<JsonArrayConst>();
      if (values.isNull() || values.size() != odin_plan::HORIZON_HOURS)
        return false;
      for (size_t i = 0; i < odin_plan::HORIZON_HOURS; ++i) {
        const float value = values[i].as<float>();
        if (!std::isfinite(value))
          return false;
        destination[i] = static_cast<int>(std::lround(value));
      }
      return true;
    };
    const int current_hour = response["current_hour"] | -1;
    const int today_start_index = response["today_start_index"] | -1;
    const int current_index = today_start_index + current_hour;
    plan.success = !json_error && (response["success"] | false) && current_hour >= 0 &&
                   current_hour < 24 && today_start_index >= 0 &&
                   today_start_index < static_cast<int>(odin_plan::HORIZON_HOURS) &&
                   current_index >= 0 && current_index < static_cast<int>(odin_plan::HORIZON_HOURS);
    plan.current_hour = plan.success ? static_cast<uint8_t>(current_hour) : 0;
    plan.today_start_index = plan.success ? static_cast<uint8_t>(today_start_index) : 0;
    plan.current_index = plan.success ? static_cast<uint8_t>(current_index) : 0;
    plan.success = plan.success &&
                   copy_float_array(response["sched_base"], plan.sched_base) &&
                   copy_float_array(response["sched_min"], plan.sched_min) &&
                   copy_float_array(response["sched_max"], plan.sched_max) &&
                   copy_float_array(response["expected_begin_temp"], plan.expected_begin_temp) &&
                   copy_float_array(response["expected_end_temp"], plan.expected_end_temp) &&
                   copy_float_array(response["prices"], plan.prices) &&
                   copy_float_array(response["heat_production"], plan.heat_production) &&
                   copy_operation_mode_array(response["operation_mode"], plan.operation_mode) &&
                   odin_plan::validate(plan);
    if (!plan.success)
      std::strncpy(error, json_error ? "invalid json" : "invalid Asgard ODIN plan", sizeof(error) - 1);
  }

  const bool valid = fetched && plan.success;
  if (take_state_lock_(100)) {
    odin_plan_.last_fetch_ms = esphome::millis();
    odin_plan_.last_http_status = status;
    odin_plan_.available = valid;
    if (valid) {
      odin_plan_.current_hour = plan.current_hour;
      odin_plan_.current_index = plan.current_index;
      odin_plan_.current_target_c = plan.sched_base[plan.current_index];
      odin_plan_.current_min_c = plan.sched_min[plan.current_index];
      odin_plan_.current_max_c = plan.sched_max[plan.current_index];
      odin_plan_.current_price = plan.prices[plan.current_index];
      odin_plan_.current_planned_heat_kw = plan.heat_production[plan.current_index];
      odin_plan_.current_operation_mode_raw = plan.operation_mode[plan.current_index];
      std::strncpy(odin_plan_.status, "available", sizeof(odin_plan_.status) - 1);
      odin_plan_.last_error[0] = '\0';
    } else {
      std::strncpy(odin_plan_.status, "invalid", sizeof(odin_plan_.status) - 1);
      std::strncpy(odin_plan_.last_error, error, sizeof(odin_plan_.last_error) - 1);
      odin_plan_.last_error[sizeof(odin_plan_.last_error) - 1] = '\0';
    }
    give_state_lock_();
  }
  log_event_(valid ? "info" : "warn", "odin_plan", valid ? "Asgard ODIN plan refreshed" : error);
  return valid;
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

  constexpr size_t BODY_CAP = 3072;
  char *body = alloc_http_body_(BODY_CAP);
  if (body == nullptr) {
    note_node_poll_failure_(node_index, "overview no_body_heap");
    return false;
  }

  int last_status = 0;
  for (size_t h = 0; h < host_count; h++) {
    char url[160];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/overview", hosts[h]);

    int status = 0;
    if (!fetch_json_(url, body, BODY_CAP, &status)) {
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
    const char *model = data["node"]["model"].as<const char *>();
    const char *firmware = data["node"]["firmware"].as<const char *>();
    const char *ip = data["node"]["ip"].as<const char *>();
    const char *pairing_fingerprint = data["pairing"]["fingerprint"].as<const char *>();
    if (pairing_fingerprint == nullptr || pairing_fingerprint[0] == '\0')
      pairing_fingerprint = data["node"]["pairing_fingerprint"].as<const char *>();
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

    // V6 owns the consent boundary for coordinator control. Touch mirrors the
    // approval reported by the node instead of promoting itself from the UI.
    const bool approval_reported = !data["coordination"].isNull();
    const bool control_approved = data["coordination"]["control_approved"] | false;
    const char *approved_installation = data["coordination"]["installation_id"] | "";
    const char *approved_coordinator = data["coordination"]["coordinator_id"] | "";

    const bool identity_matches = control_approved && install_id_[0] != '\0' &&
        authority_coordinator_id_[0] != '\0' &&
        std::strcmp(approved_installation, install_id_) == 0 &&
        std::strcmp(approved_coordinator, authority_coordinator_id_) == 0;
    if (!take_state_lock_(100)) {
      heap_caps_free(body);
      return false;
    }
    model_.update_node_metadata(node_index, model, firmware, ip);
    model_.update_node_identity(node_index, pairing_fingerprint);
    if (approval_reported) {
      model_.update_node_trust(node.node_id, identity_matches
          ? ::lune_touch::NodeTrust::TRUSTED
          : ::lune_touch::NodeTrust::PAIRED);
    }
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
    if (!identity_matches)
      propose_authority_to_node_(node_index, node, hosts[h], now_ms);
    note_node_poll_success_(node_index, hosts[h]);
    heap_caps_free(body);
    return true;
  }

  char reason[80];
  snprintf(reason, sizeof(reason), "overview failed status=%d", last_status);
  note_node_poll_failure_(node_index, reason);
  heap_caps_free(body);
  return false;
}

bool LuneTouchCoordinator::propose_authority_to_node_(size_t node_index,
                                                       const ::lune_touch::PairedNode &node,
                                                       const char *preferred_host,
                                                       uint32_t now_ms) {
  if (node_index >= ::lune_touch::MAX_NODES || preferred_host == nullptr || preferred_host[0] == '\0')
    return false;
  const uint32_t last = authority_proposal_last_ms_[node_index];
  if (last != 0 && static_cast<int32_t>(now_ms - last) < 30000)
    return false;
  authority_proposal_last_ms_[node_index] = now_ms;

  char installation_id[32]{};
  char coordinator_id[32]{};
  char shared_key[64]{};
  char coordinator_name[32]{};
  char site_label[48]{};
  if (!take_state_lock_(100))
    return false;
  std::strncpy(installation_id, install_id_, sizeof(installation_id) - 1);
  std::strncpy(coordinator_id, authority_coordinator_id_, sizeof(coordinator_id) - 1);
  std::strncpy(shared_key, authority_shared_key_, sizeof(shared_key) - 1);
  std::strncpy(coordinator_name, coordinator_name_, sizeof(coordinator_name) - 1);
  std::strncpy(site_label, site_label_, sizeof(site_label) - 1);
  give_state_lock_();
  if (installation_id[0] == '\0' || coordinator_id[0] == '\0' || std::strlen(shared_key) < 16)
    return false;

  char escaped_name[72]{};
  char escaped_site[104]{};
  json_escape_(coordinator_name, escaped_name, sizeof(escaped_name));
  json_escape_(site_label, escaped_site, sizeof(escaped_site));
  char payload[384]{};
  std::snprintf(payload, sizeof(payload),
                "{\"installation_id\":\"%s\",\"coordinator_id\":\"%s\","
                "\"shared_key\":\"%s\",\"name\":\"%s\",\"site\":\"%s\"}",
                installation_id, coordinator_id, shared_key, escaped_name, escaped_site);
  char url[192]{};
  char response[256]{};
  int status = 0;
  std::snprintf(url, sizeof(url), "http://%s/api/hv6/v1/authority/proposal", preferred_host);
  const bool sent = post_json_(url, payload, response, sizeof(response), &status);
  if (sent)
    ESP_LOGI(TAG, "Sent connection proposal to %s via %s", node.node_id, preferred_host);
  else
    ESP_LOGW(TAG, "Connection proposal to %s via %s failed (HTTP %d)", node.node_id,
             preferred_host, status);
  return sent;
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

  // The v1 zones document includes a forecast object for every valve.  The
  // earlier 4 KiB buffer silently truncated valid six-zone responses; the
  // truncated JSON then fell through to the legacy /state endpoint and
  // recreated generated room names.
  constexpr size_t V1_BODY_CAP = 12288;
  char *v1_body = alloc_http_body_(V1_BODY_CAP);
  if (v1_body == nullptr) {
    note_node_poll_failure_(node_index, "zones no_body_heap");
    return false;
  }

  int last_status = 0;
  for (size_t h = 0; h < host_count; h++) {
    char url[160];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/zones", hosts[h]);

    int status = 0;
    if (!fetch_json_(url, v1_body, V1_BODY_CAP, &status)) {
      last_status = status;
      ESP_LOGD(TAG, "V6 zones poll failed for %s via %s (%d)", node.node_id, hosts[h], status);
      continue;
    }
    if (!ingest_v6_zones_(node_index, v1_body, now_ms)) {
      ESP_LOGW(TAG, "V6 zones poll returned unusable data for %s via %s", node.node_id, hosts[h]);
      last_status = status;
      note_node_poll_failure_(node_index, "zones invalid_json");
      continue;
    }
    note_node_poll_success_(node_index, hosts[h]);
    heap_caps_free(v1_body);
    return true;
  }

  heap_caps_free(v1_body);

  // A real v1 response means the route exists. Do not follow a server-side 5xx
  // with the much larger legacy snapshot fetch; that failure path used to put
  // avoidable pressure on the poll task and could corrupt its stack.
  if (last_status != 0 && last_status != 404) {
    char reason[80];
    snprintf(reason, sizeof(reason), "zones failed status=%d", last_status);
    note_node_poll_failure_(node_index, reason);
    return false;
  }

  for (size_t h = 0; h < host_count; h++) {
    char url[160];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/state", hosts[h]);

    constexpr size_t LEGACY_BODY_CAP = 14336;
    char *body = alloc_http_body_(LEGACY_BODY_CAP);
    if (body == nullptr)
      continue;

    int status = 0;
    const bool fetched = fetch_json_(url, body, LEGACY_BODY_CAP, &status);
    if (fetched && ingest_v6_legacy_state_(node_index, node, body, now_ms)) {
      heap_caps_free(body);
      note_node_poll_success_(node_index, hosts[h]);
      return true;
    }
    last_status = status;
    heap_caps_free(body);
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
                                      size_t body_capacity, int *status_code,
                                      const char *authority_key) {
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

  // ESPHome's ESP-IDF web server accepts URL-encoded form bodies for POST and
  // deliberately declines application/json before a component handler can
  // read the body. Keep JSON as the internal call-site representation, but
  // encode its flat object as form data on the wire.
  std::string form_body;
  if (!json_object_to_form_(payload, form_body)) {
    ESP_LOGW(TAG, "Unable to encode POST payload for %s", url);
    esp_http_client_cleanup(client);
    return false;
  }
  const char *post_body = form_body.c_str();
  const size_t post_length = std::strlen(post_body);
  esp_http_client_set_header(client, "Content-Type", "application/x-www-form-urlencoded");
  if (authority_key != nullptr && authority_key[0] != '\0')
    esp_http_client_set_header(client, "X-Lune-Authority-Key", authority_key);

  bool ok = false;
  // esp_http_client_open() is the streaming API: its write_len argument
  // becomes Content-Length and replaces any earlier set_post_field length.
  // Opening with zero therefore sent an empty request even though a post
  // field had been configured. Write the complete form body explicitly.
  esp_err_t err = esp_http_client_open(client, static_cast<int>(post_length));
  if (err == ESP_OK) {
    size_t written = 0;
    while (written < post_length) {
      const int count = esp_http_client_write(client, post_body + written,
                                              static_cast<int>(post_length - written));
      if (count <= 0) {
        err = ESP_FAIL;
        break;
      }
      written += static_cast<size_t>(count);
    }
    if (err == ESP_OK) {
      esp_http_client_fetch_headers(client);
      const int status = esp_http_client_get_status_code(client);
      if (status_code != nullptr)
        *status_code = status;
      const int len = esp_http_client_read_response(client, body, body_capacity - 1);
      if (len > 0)
        body[len] = '\0';
      if (status >= 200 && status < 300 && len > 0)
        ok = true;
    }
  } else {
    ESP_LOGD(TAG, "HTTP POST failed: %s", esp_err_to_name(err));
  }

  esp_http_client_close(client);
  esp_http_client_cleanup(client);
  return ok;
}

bool LuneTouchCoordinator::renew_authority_lease_() {
  char leader_id[32]{};
  char installation_id[32]{};
  char coordinator_id[32]{};
  char shared_key[64]{};
  char host[64]{};
  char lease_id[32]{};
  uint32_t sequence = 0;
  bool degraded = true;
  bool leader_selected = false;
  if (!take_state_lock_(100))
    return false;
  std::strncpy(leader_id, authority_leader_node_id_, sizeof(leader_id) - 1);
  std::strncpy(installation_id, install_id_, sizeof(installation_id) - 1);
  std::strncpy(coordinator_id, authority_coordinator_id_, sizeof(coordinator_id) - 1);
  std::strncpy(shared_key, authority_shared_key_, sizeof(shared_key) - 1);
  std::strncpy(lease_id, authority_lease_id_, sizeof(lease_id) - 1);
  if (leader_id[0] != '\0') {
    for (size_t index = 0; index < model_.node_count(); index++) {
      const auto *node = model_.node(index);
      if (node != nullptr && std::strcmp(node->node_id, leader_id) == 0) {
        std::strncpy(host, node->hostname[0] != '\0' ? node->hostname : node->fallback_ip,
                     sizeof(host) - 1);
        break;
      }
    }
  }
  if (host[0] == '\0' && model_.node_count() > 0) {
    const auto *node = model_.node(0);
    if (node != nullptr) {
      std::strncpy(host, node->hostname[0] != '\0' ? node->hostname : node->fallback_ip,
                   sizeof(host) - 1);
      if (host[0] != '\0') {
        std::strncpy(authority_leader_node_id_, node->node_id,
                     sizeof(authority_leader_node_id_) - 1);
        authority_leader_node_id_[sizeof(authority_leader_node_id_) - 1] = '\0';
        std::strncpy(leader_id, authority_leader_node_id_, sizeof(leader_id) - 1);
        leader_selected = true;
      }
    }
  }
  sequence = authority_sequence_ + 1;
  const auto strategy = model_.strategy_snapshot();
  degraded = !strategy.has_physical_temperature;
  give_state_lock_();
  if (leader_selected)
    save_settings_();
  if (host[0] == '\0' || installation_id[0] == '\0' || coordinator_id[0] == '\0' ||
      shared_key[0] == '\0') {
    if (take_state_lock_(100)) {
      std::strncpy(authority_state_, "no_publisher", sizeof(authority_state_) - 1);
      std::strncpy(authority_reason_, "authority configuration incomplete", sizeof(authority_reason_) - 1);
      authority_expires_at_ms_ = 0;
      give_state_lock_();
    }
    return false;
  }
  char url[192];
  char payload[256];
  char response[384];
  std::snprintf(url, sizeof(url), "http://%s/api/hv6/v1/authority/lease", host);
  std::snprintf(payload, sizeof(payload),
                "{\"installation_id\":\"%s\",\"coordinator_id\":\"%s\",\"lease_id\":\"%s\","
                "\"sequence\":%lu,\"issued_ms\":%lu,\"duration_ms\":90000,\"degraded\":%s}",
                installation_id, coordinator_id, lease_id, static_cast<unsigned long>(sequence),
                static_cast<unsigned long>(esphome::millis()), degraded ? "true" : "false");
  post_json_(url, payload, response, sizeof(response), nullptr, shared_key);
  JsonDocument doc;
  // A 409 is an expected, observable recovery-pending response. Keep its
  // state/reason instead of presenting a reachable V6 as an outage.
  const bool parsed = response[0] != '\0' && !deserializeJson(doc, response);
  const char *result = parsed ? doc["data"]["result"] | "" : "";
  const char *state = parsed ? doc["data"]["state"] | "no_publisher" : "no_publisher";
  const char *reason = parsed ? doc["data"]["reason"] | "lease renewal failed" : "lease renewal failed";
  const uint32_t remaining_s = parsed ? doc["data"]["lease_remaining_s"] | 0U : 0U;
  const bool lease_granted = parsed &&
      (std::strcmp(result, "granted") == 0 || std::strcmp(result, "renewed") == 0);
  if (take_state_lock_(100)) {
    const bool was_recovery = std::strcmp(authority_state_, "touch_recovery_pending") == 0;
    authority_last_renew_ms_ = esphome::millis();
    std::strncpy(authority_state_, state, sizeof(authority_state_) - 1);
    std::strncpy(authority_reason_, reason, sizeof(authority_reason_) - 1);
    if (lease_granted) {
      authority_sequence_ = sequence;
      authority_expires_at_ms_ = esphome::millis() + remaining_s * 1000UL;
      authority_generation_ = doc["data"]["generation"] | 0U;
      authority_last_fallback_value_c_ = doc["data"]["last_fallback_value_c"] | NAN;
      authority_last_asgard_value_c_ = doc["data"]["last_asgard_value_c"] | NAN;
      authority_v6_local_zones_ = doc["data"]["local_zones"] | 0U;
      authority_v6_peer_zones_ = doc["data"]["peer_zones"] | 0U;
      std::strncpy(authority_v6_peer_status_, doc["data"]["peer_status"] | "unknown",
                   sizeof(authority_v6_peer_status_) - 1);
      authority_v6_peer_status_[sizeof(authority_v6_peer_status_) - 1] = '\0';
      authority_smooth_first_write_ = was_recovery && std::isfinite(authority_last_fallback_value_c_);
    } else {
      authority_expires_at_ms_ = 0;
    }
    give_state_lock_();
  }
  log_event_(lease_granted ? "info" : (parsed ? "info" : "warn"), "authority",
             parsed ? result : "lease renewal failed");
  return lease_granted;
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
  bool weather_boost_changed = false;
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
    const char *status = zone["state"].as<const char *>();
    if (status == nullptr)
      status = zone["status"] | "unknown";
    // Do not use `| nullptr` here.  With ArduinoJson that selects the
    // generic default-value overload for std::nullptr_t, so it returns null
    // even when the JSON member is a string.  Read the optional string
    // directly, then fall back to the legacy `name` member.
    const char *v6_name = zone["friendly_name"].as<const char *>();
    if (v6_name == nullptr || v6_name[0] == '\0')
      v6_name = zone["name"].as<const char *>();
    const bool fresh = zone["fresh"] | true;
    const size_t zone_index = static_cast<size_t>(zone_number - 1);
    if (v6_name != nullptr && v6_name[0] != '\0')
      model_.update_zone_name_from_v6_by_binding(node_index, zone_index, v6_name);
    bool stored = model_.update_zone_live_by_binding(node_index, zone_index,
                                                     temp, has_temp, setpoint, has_setpoint,
                                                     status, fresh, now_ms, valve, has_valve);
    if (!stored) {
      char room_id[32];
      char room_name[48];
      snprintf(room_id, sizeof(room_id), "v6%u-z%u", static_cast<unsigned>(node_index + 1),
               static_cast<unsigned>(zone_number));
      snprintf(room_name, sizeof(room_name), "%s",
               v6_name != nullptr && v6_name[0] != '\0' ? v6_name : room_id);
      if (model_.bind_zone_with_source(room_id, room_name, node_index, zone_index,
                                       v6_name != nullptr && v6_name[0] != '\0'
                                           ? ::lune_touch::ZoneNameSource::V6
                                           : ::lune_touch::ZoneNameSource::GENERATED)) {
        stored = model_.update_zone_live_by_binding(node_index, zone_index,
                                                    temp, has_temp, setpoint, has_setpoint,
                                                    status, fresh, now_ms, valve, has_valve);
      }
    }
    if (stored) {
      updated++;
    }
    JsonVariant forecast = zone["forecast"];
    const float wind_exposure = forecast["wind_exposure"] | zone["wind_exposure"] | 0.5f;
    const float solar_gain = forecast["solar_gain"] | zone["solar_gain"] | 0.3f;
    const uint8_t thermal_lead_h = forecast["thermal_lead_h"] | zone["thermal_lead_h"] | 4;
    const float max_offset_c = forecast["max_offset_c"] | zone["max_offset_c"] | 1.5f;
    if (!weather_max_boost_configured_ && std::isfinite(max_offset_c) && max_offset_c > 0.0f) {
      const float clamped = std::max(0.0f, std::min(5.0f, max_offset_c));
      weather_max_boost_c_ = weather_max_boost_seeded_from_v6_
                                 ? std::min(weather_max_boost_c_, clamped)
                                 : clamped;
      weather_max_boost_seeded_from_v6_ = true;
      weather_boost_changed = true;
    }
    model_.update_zone_forecast_profile_by_binding(node_index, zone_index,
                                                   0, wind_exposure, solar_gain,
                                                   thermal_lead_h, max_offset_c,
                                                   false /* exterior walls are Touch-owned */);
  }
  if (updated > 0) {
    model_.mark_node_seen(node_index, now_ms);
    learning_dirty_ = true;
  }
  give_state_lock_();
  if (weather_boost_changed)
    save_settings_();
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
      if (model_.bind_zone_with_source(room_id, room_name, node_index, zone_index,
                                       ::lune_touch::ZoneNameSource::GENERATED)) {
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
                                             char *provider_timezone, size_t provider_timezone_capacity,
                                             ForecastHourState *hours_out, size_t hours_capacity) {
  if (error != nullptr && error_len > 0)
    error[0] = '\0';
  if (hours_count != nullptr)
    *hours_count = 0;
  if (provider_timezone != nullptr && provider_timezone_capacity > 0)
    provider_timezone[0] = '\0';

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
  char *body = alloc_http_body_(BODY_CAP);
  if (body == nullptr) {
    snprintf(error, error_len, "no_body_heap");
    return false;
  }

  esp_http_client_handle_t client = esp_http_client_init(&cfg);
  if (client == nullptr) {
    heap_caps_free(body);
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
      filter["timezone"] = true;
      filter["hourly"]["time"] = true;
      filter["hourly"]["temperature_2m"] = true;
      filter["hourly"]["wind_speed_10m"] = true;
      filter["hourly"]["wind_direction_10m"] = true;
      filter["hourly"]["shortwave_radiation"] = true;

      JsonDocument doc;
      DeserializationError jerr = deserializeJson(doc, body, len, DeserializationOption::Filter(filter));
      if (!jerr) {
        JsonArray times = doc["hourly"]["time"].as<JsonArray>();
        JsonArray temps = doc["hourly"]["temperature_2m"].as<JsonArray>();
        JsonArray winds = doc["hourly"]["wind_speed_10m"].as<JsonArray>();
        JsonArray dirs = doc["hourly"]["wind_direction_10m"].as<JsonArray>();
        JsonArray solar = doc["hourly"]["shortwave_radiation"].as<JsonArray>();
        const char *timezone = doc["timezone"] | "";
        const size_t count = temps.size();
        if (times.size() == 0) {
          snprintf(error, error_len, "missing_hourly_time");
        } else if (!lune_touch_forecast_timeline::hourly_arrays_match(
                       times.size(), temps.size(), winds.size(), dirs.size(), solar.size())) {
          snprintf(error, error_len, "hourly_arrays_mismatch");
        } else if (!lune_touch_forecast_timeline::provider_timezone_valid(timezone)) {
          snprintf(error, error_len, "missing_timezone");
        } else if (count >= 24 && hours_out != nullptr && hours_capacity >= 24) {
          float min_temp = temps[0] | 0.0f;
          float max_wind = 0.0f;
          float wind_dir = 0.0f;
          float max_solar = 0.0f;
          uint8_t kept = 0;
          int64_t timestamps[72]{};
          for (size_t i = 0; i < count && kept < 72; i++, kept++) {
            const int64_t timestamp_s = times[i] | 0LL;
            const float temp = temps[i] | 0.0f;
            const float wind = winds[i] | 0.0f;
            const float dir = dirs[i] | 0.0f;
            const float sun = solar[i] | 0.0f;
            if (kept >= hours_capacity)
              break;
            timestamps[kept] = timestamp_s;
            hours_out[kept] = {timestamp_s, temp, wind, dir, sun};
            if (temp < min_temp)
              min_temp = temp;
            if (wind > max_wind) {
              max_wind = wind;
              wind_dir = dir;
            }
            if (sun > max_solar)
              max_solar = sun;
          }
          if (!lune_touch_forecast_timeline::timestamps_are_consecutive_hours(timestamps, kept)) {
            snprintf(error, error_len, "hourly_time_unalignable");
          } else {
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
            if (provider_timezone != nullptr && provider_timezone_capacity > 0) {
              std::strncpy(provider_timezone, timezone, provider_timezone_capacity - 1);
              provider_timezone[provider_timezone_capacity - 1] = '\0';
            }
            ok = true;
          }
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
  heap_caps_free(body);
  return ok;
}

void LuneTouchCoordinator::recompute_forecast_decisions_() {
  forecast_decision_count_ = 0;
  if (forecast_hours_count_ == 0)
    return;

  int64_t timestamps[72]{};
  for (uint8_t i = 0; i < forecast_hours_count_; i++)
    timestamps[i] = forecast_hours_[i].timestamp_s;
  const size_t now_index = lune_touch_forecast_timeline::first_index_at_or_after(
      timestamps, forecast_hours_count_, current_epoch_s_());
  // A forecast with no wall-clock alignment must never create a preload command.
  if (now_index == lune_touch_forecast_timeline::NO_INDEX)
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
    out.configured_thermal_lead_h = zone->thermal_lead_h;
    out.learned_thermal_lead_h = ::lune_touch::HouseModel::learned_thermal_lead_h(*zone);
    out.active_thermal_lead_h = ::lune_touch::HouseModel::active_thermal_lead_h(*zone);
    if (live == nullptr || !live->fresh)
      continue;

    const float indoor_ref_c = out.comfort_setpoint_c;
    const size_t last = std::min(static_cast<size_t>(forecast_hours_count_) - 1,
                                 now_index + static_cast<size_t>(out.active_thermal_lead_h));
    float peak_load = 0.0f;
    int8_t peak_in_h = -1;
    for (size_t h = now_index; h <= last; h++) {
      const float load = zone_hour_load_(forecast_hours_[h], *zone, indoor_ref_c);
      if (load > peak_load) {
        peak_load = load;
        peak_in_h = static_cast<int8_t>(h - now_index);
      }
    }
    if (peak_in_h < 0)
      peak_in_h = 0;
    const float above = peak_load - LOAD_THRESHOLD;
    const float priority_gain = 1.0f + 0.1f * static_cast<float>(out.priority > 0 ? out.priority - 1 : 0);
    const float offset_c = above > 0.0f
                               ? std::fmin(weather_max_boost_c_, above * GAIN_C_PER_LOAD * priority_gain)
                               : 0.0f;

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
    char preferred_host[64]{};
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
    const auto target = model_.resolve_room(decision.room_id);
    if (target.node == nullptr || target.binding == nullptr)
      continue;
    if (ledger_.has_recent_similar("forecast", target.node->node_id, target.binding->loop_id,
                                   decision.offset_c, now, FORECAST_COMMAND_DEDUPE_MS,
                                   FORECAST_COMMAND_EPSILON_C, current_epoch_s_())) {
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
      stamp_command_timing_(&record, now, 0);
      const auto target = model_.resolve_room(decision.room_id);
      stamp_command_target_(&record, target.node, target.binding);
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
    if (decision.node_index < ::lune_touch::MAX_NODES) {
      std::strncpy(items[item_count].preferred_host, node_last_success_host_[decision.node_index],
                   sizeof(items[item_count].preferred_host) - 1);
      items[item_count].preferred_host[sizeof(items[item_count].preferred_host) - 1] = '\0';
    }
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
    stamp_command_timing_(&record, now, FORECAST_COMMAND_TTL_S);
    const auto target = model_.resolve_room(decision.room_id);
    stamp_command_target_(&record, target.node, target.binding);
    record.result = ::lune_touch::CommandResult::PENDING;

    ::lune_touch::CommandRecord final_record = record;
    const bool sent = send_v6_setpoint_command_(node, decision.zone_index, record,
                                                FORECAST_COMMAND_TTL_S, &final_record,
                                                items[i].preferred_host);
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

bool LuneTouchCoordinator::send_v6_zone_setpoint_(const ::lune_touch::PairedNode &node,
                                                  uint8_t zone_index, float setpoint_c) {
  const char *hosts[2]{};
  size_t host_count = 0;
  if (node.hostname[0] != '\0')
    hosts[host_count++] = node.hostname;
  if (node.fallback_ip[0] != '\0' &&
      (host_count == 0 || std::strcmp(node.fallback_ip, hosts[0]) != 0))
    hosts[host_count++] = node.fallback_ip;
  char payload[64];
  snprintf(payload, sizeof(payload), "{\"setpoint_c\":%.1f}", setpoint_c);
  for (size_t i = 0; i < host_count; i++) {
    char url[192];
    char body[256];
    int status = 0;
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/zones/%u/setpoint", hosts[i],
             static_cast<unsigned>(zone_index + 1));
    if (post_json_(url, payload, body, sizeof(body), &status))
      return true;
    ESP_LOGD(TAG, "V6 setpoint update failed via %s (%d)", hosts[i], status);
  }
  return false;
}

bool LuneTouchCoordinator::send_v6_zone_setting_(const ::lune_touch::PairedNode &node,
                                                 uint8_t zone_index, const char *kind,
                                                 const char *key, const char *value) {
  const char *hosts[2]{};
  size_t host_count = 0;
  if (node.hostname[0] != '\0')
    hosts[host_count++] = node.hostname;
  if (node.fallback_ip[0] != '\0' &&
      (host_count == 0 || std::strcmp(node.fallback_ip, hosts[0]) != 0))
    hosts[host_count++] = node.fallback_ip;
  char escaped_value[96];
  json_escape_(value != nullptr ? value : "", escaped_value, sizeof(escaped_value));
  char payload[192];
  if (std::strcmp(kind, "number") == 0)
    snprintf(payload, sizeof(payload), "{\"key\":\"%s\",\"value\":%s,\"zone\":%u}",
             key, escaped_value, static_cast<unsigned>(zone_index + 1));
  else
    snprintf(payload, sizeof(payload), "{\"key\":\"%s\",\"value\":\"%s\",\"zone\":%u}",
             key, escaped_value, static_cast<unsigned>(zone_index + 1));
  for (size_t i = 0; i < host_count; i++) {
    char url[192];
    char body[256];
    int status = 0;
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/settings/%s", hosts[i], kind);
    if (post_json_(url, payload, body, sizeof(body), &status))
      return true;
    ESP_LOGD(TAG, "V6 setting %s failed via %s (%d)", key, hosts[i], status);
  }
  return false;
}

bool LuneTouchCoordinator::send_v6_setpoint_command_(const ::lune_touch::PairedNode &node, uint8_t zone_index,
                                                     const ::lune_touch::CommandRecord &request,
                                                     uint32_t ttl_s, ::lune_touch::CommandRecord *result,
                                                     const char *preferred_host) {
  if (result == nullptr)
    return false;
  *result = request;

  if (!esphome::network::is_connected())
    return false;

  const char *hosts[3]{};
  size_t host_count = 0;
  auto add_host = [&](const char *host) {
    if (host == nullptr || host[0] == '\0' || host_count >= 3)
      return;
    for (size_t i = 0; i < host_count; i++) {
      if (std::strcmp(hosts[i], host) == 0)
        return;
    }
    hosts[host_count++] = host;
  };
  add_host(preferred_host);
  add_host(node.hostname);
  add_host(node.fallback_ip);
  if (host_count == 0)
    return false;

  char request_id[64];
  char source[64];
  char reason[128];
  json_escape_(request.request_id, request_id, sizeof(request_id));
  json_escape_("lune-touch", source, sizeof(source));
  json_escape_(request.reason, reason, sizeof(reason));

  char payload[512];
  const int64_t auth_timestamp_s = current_epoch_s_();
  snprintf(payload, sizeof(payload),
           "{\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\","
           "\"setpoint_offset_c\":%.2f,\"ttl_s\":%lu,\"auth_timestamp_s\":%lld,"
           "\"auth_nonce\":\"%s\"}",
           request_id, source, reason, request.requested_offset_c,
           static_cast<unsigned long>(ttl_s), static_cast<long long>(auth_timestamp_s), request_id);

  for (size_t i = 0; i < host_count; i++) {
    char url[320];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/zones/%u/setpoint-command",
             hosts[i], static_cast<unsigned>(zone_index + 1));

    char body[512];
    int status = 0;
    if (!post_json_(url, payload, body, sizeof(body), &status, authority_shared_key_)) {
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
    const char *result_name = data["result"].as<const char *>();
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
  static ::lune_touch::PersistedState state;
  std::memset(&state, 0, sizeof(state));
  state.magic = ::lune_touch::PERSISTED_STATE_MAGIC;
  state.version = ::lune_touch::PERSISTED_STATE_VERSION;

  // Prefer the dedicated partition when it is installed. Its format is v12;
  // v11 migration is deliberately read from the legacy default partition below.
  if (touch_registry_partition_ready_) {
    nvs_handle_t dedicated_handle;
    if (nvs_open_from_partition(TOUCH_REGISTRY_PARTITION, TOUCH_NAMESPACE, NVS_READONLY,
                                &dedicated_handle) == ESP_OK) {
      if (load_registry_chunks_(dedicated_handle, &state)) {
        nvs_close(dedicated_handle);
        if (state.magic == ::lune_touch::PERSISTED_STATE_MAGIC &&
            state.version == ::lune_touch::PERSISTED_STATE_VERSION) {
          const bool registry_migrated = populate_missing_loop_ids_(&state);
          if (!model_.import_state(state)) {
            ESP_LOGW(TAG, "Ignoring incompatible dedicated Touch registry");
            return false;
          }
          ESP_LOGI(TAG, "Loaded dedicated Touch registry: nodes=%u zones=%u",
                   static_cast<unsigned>(model_.node_count()),
                   static_cast<unsigned>(model_.zone_count()));
          dedicated_touch_registry_valid_ = true;
          if (registry_migrated)
            save_registry_();
          return true;
        }
      } else {
        nvs_close(dedicated_handle);
      }
    }
    std::memset(&state, 0, sizeof(state));
    state.magic = ::lune_touch::PERSISTED_STATE_MAGIC;
    state.version = ::lune_touch::PERSISTED_STATE_VERSION;
  }

  nvs_handle_t handle;
  const esp_err_t open_err = nvs_open(TOUCH_NAMESPACE, NVS_READONLY, &handle);
  if (open_err != ESP_OK) {
    ESP_LOGI(TAG, "Touch registry unavailable: nvs_open(%s)=%s", TOUCH_NAMESPACE,
             esp_err_to_name(open_err));
    return false;
  }

  bool registry_migrated = false;
  static PersistedStateV11 legacy_chunked;
  std::memset(&legacy_chunked, 0, sizeof(legacy_chunked));
  if (load_registry_chunks_for_(handle, &legacy_chunked)) {
    nvs_close(handle);
    if (legacy_chunked.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy_chunked.version != ::lune_touch::PERSISTED_STATE_VERSION_V11 ||
        legacy_chunked.node_count > ::lune_touch::MAX_NODES ||
        legacy_chunked.room_count > ::lune_touch::MAX_HOUSE_ROOMS ||
        legacy_chunked.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      ESP_LOGW(TAG, "Ignoring incompatible v11 chunked Touch registry");
      return false;
    }
    state.node_count = legacy_chunked.node_count;
    state.room_count = legacy_chunked.room_count;
    state.zone_count = legacy_chunked.zone_count;
    for (size_t i = 0; i < legacy_chunked.node_count; i++)
      state.nodes[i] = legacy_chunked.nodes[i];
    for (size_t i = 0; i < legacy_chunked.room_count; i++)
      state.rooms[i] = legacy_chunked.rooms[i];
    for (size_t i = 0; i < legacy_chunked.zone_count; i++)
      state.zones[i] = legacy_chunked.zones[i];
    registry_migrated = true;
    ESP_LOGI(TAG, "Migrated chunked Touch registry from v11; runtime history reset");
  }
  if (registry_migrated) {
    registry_migrated = populate_missing_loop_ids_(&state) || registry_migrated;
    if (!model_.import_state(state)) {
      ESP_LOGW(TAG, "Ignoring incompatible v11 chunked Touch registry");
      return false;
    }
    ESP_LOGI(TAG, "Loaded migrated Touch registry: nodes=%u zones=%u",
             static_cast<unsigned>(model_.node_count()),
             static_cast<unsigned>(model_.zone_count()));
    if (touch_registry_partition_ready_)
      ESP_LOGI(TAG, "Copying migrated registry to dedicated Touch NVS");
    save_registry_();
    return true;
  }
  if (load_registry_chunks_(handle, &state)) {
    nvs_close(handle);
    if (state.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        state.version > ::lune_touch::PERSISTED_STATE_VERSION) {
      ESP_LOGW(TAG, "Ignoring chunked Touch registry magic/version mismatch (magic=0x%08lx version=%u)",
               static_cast<unsigned long>(state.magic), static_cast<unsigned>(state.version));
      return false;
    }
    if (state.version != ::lune_touch::PERSISTED_STATE_VERSION) {
      state.version = ::lune_touch::PERSISTED_STATE_VERSION;
      registry_migrated = true;
    }
    registry_migrated = populate_missing_loop_ids_(&state) || registry_migrated;
    if (!model_.import_state(state)) {
      ESP_LOGW(TAG, "Ignoring incompatible chunked Touch registry blob");
      return false;
    }
    ESP_LOGI(TAG, "Loaded chunked Touch registry: nodes=%u zones=%u",
             static_cast<unsigned>(model_.node_count()),
             static_cast<unsigned>(model_.zone_count()));
    if (registry_migrated || touch_registry_partition_ready_) {
      if (touch_registry_partition_ready_)
        ESP_LOGI(TAG, "Copying legacy Touch registry to dedicated NVS");
      save_registry_();
    }
    return true;
  }

  size_t len = 0;
  esp_err_t err = nvs_get_blob(handle, "registry", nullptr, &len);
  if (err != ESP_OK) {
    nvs_close(handle);
    ESP_LOGI(TAG, "Touch registry not stored yet: %s", esp_err_to_name(err));
    return false;
  }

  if (len == sizeof(state)) {
    err = nvs_get_blob(handle, "registry", &state, &len);
    nvs_close(handle);
    if (err != ESP_OK)
      return false;
    // Some releases changed only the schema marker after an append-only
    // change. Keep the registry when the binary layout is still identical;
    // otherwise a normal OTA update looks like a factory reset to the user.
    if (state.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        state.version > ::lune_touch::PERSISTED_STATE_VERSION) {
      ESP_LOGW(TAG, "Ignoring Touch registry magic/version mismatch (magic=0x%08lx version=%u)",
               static_cast<unsigned long>(state.magic), static_cast<unsigned>(state.version));
      return false;
    }
    if (state.version != ::lune_touch::PERSISTED_STATE_VERSION) {
      ESP_LOGI(TAG, "Migrating compatible Touch registry version %u to %u",
               static_cast<unsigned>(state.version),
               static_cast<unsigned>(::lune_touch::PERSISTED_STATE_VERSION));
      state.version = ::lune_touch::PERSISTED_STATE_VERSION;
      registry_migrated = true;
    }
  } else if (len == sizeof(PersistedStateV11)) {
    registry_migrated = true;
    static PersistedStateV11 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V11 ||
        legacy.node_count > ::lune_touch::MAX_NODES || legacy.room_count > ::lune_touch::MAX_HOUSE_ROOMS ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES)
      return false;
    state.node_count = legacy.node_count;
    state.room_count = legacy.room_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      state.nodes[i] = legacy.nodes[i];
    for (size_t i = 0; i < legacy.room_count; i++)
      state.rooms[i] = legacy.rooms[i];
    for (size_t i = 0; i < legacy.zone_count; i++)
      state.zones[i] = legacy.zones[i];
    ESP_LOGI(TAG, "Migrated Touch registry from v11; runtime history reset");
  } else if (len == sizeof(PersistedStateV10)) {
    registry_migrated = true;
    static PersistedStateV10 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V10 ||
        legacy.node_count > ::lune_touch::MAX_NODES || legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES)
      return false;
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      state.nodes[i] = legacy.nodes[i];
    for (size_t i = 0; i < legacy.zone_count; i++) {
      copy_legacy_zone_v10_(state.zones[i], legacy.zones[i]);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v10 to v11");
  } else if (len == sizeof(PersistedStateV9)) {
    registry_migrated = true;
    static PersistedStateV9 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V9 ||
        legacy.node_count > ::lune_touch::MAX_NODES || legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES)
      return false;
    state.node_count = legacy.node_count; state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++) state.nodes[i] = legacy.nodes[i];
    for (size_t i = 0; i < legacy.zone_count; i++) {
      const auto *node = legacy.zones[i].node_index < legacy.node_count ?
          &legacy.nodes[legacy.zones[i].node_index] : nullptr;
      copy_legacy_zone_v9_(state.zones[i], legacy.zones[i], node);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v9 to v10");
  } else if (len == sizeof(PersistedStateV8)) {
    registry_migrated = true;
    static PersistedStateV8 legacy;
    std::memset(&legacy, 0, sizeof(legacy));
    err = nvs_get_blob(handle, "registry", &legacy, &len);
    nvs_close(handle);
    if (err != ESP_OK || legacy.magic != ::lune_touch::PERSISTED_STATE_MAGIC ||
        legacy.version != ::lune_touch::PERSISTED_STATE_VERSION_V8 ||
        legacy.node_count > ::lune_touch::MAX_NODES ||
        legacy.zone_count > ::lune_touch::MAX_HOUSE_ZONES) {
      return false;
    }
    state.node_count = legacy.node_count;
    state.zone_count = legacy.zone_count;
    for (size_t i = 0; i < legacy.node_count; i++)
      copy_legacy_node_(state.nodes[i], legacy.nodes[i]);
    for (size_t i = 0; i < legacy.zone_count; i++) {
      copy_legacy_zone_(state.zones[i], legacy.zones[i]);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v8 to v9");
  } else if (len == sizeof(PersistedStateV7)) {
    registry_migrated = true;
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
      copy_legacy_node_(state.nodes[i], legacy.nodes[i]);
    for (size_t i = 0; i < legacy.zone_count; i++) {
      copy_legacy_zone_(state.zones[i], legacy.zones[i]);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v7 to v9");
  } else if (len == sizeof(PersistedStateV6)) {
    registry_migrated = true;
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
      copy_legacy_node_(state.nodes[i], legacy.nodes[i]);
    for (size_t i = 0; i < legacy.zone_count; i++)
      copy_legacy_zone_(state.zones[i], legacy.zones[i]);
    ESP_LOGI(TAG, "Migrated Touch registry from v6 to v9");
  } else if (len == sizeof(PersistedStateV5)) {
    registry_migrated = true;
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
    ESP_LOGI(TAG, "Migrated Touch registry from v5 to v9");
  } else if (len == sizeof(PersistedStateV4)) {
    registry_migrated = true;
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
      state.zones[i].name_source = ::lune_touch::ZoneNameSource::TOUCH;
      state.zones[i].enabled = legacy.zones[i].enabled;
      state.zones[i].schedule_enabled = false;
      std::strncpy(state.zones[i].room_id, legacy.zones[i].room_id,
                   sizeof(state.zones[i].room_id) - 1);
      std::strncpy(state.zones[i].room_name, legacy.zones[i].room_name,
                   sizeof(state.zones[i].room_name) - 1);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v4 to v9");
  } else if (len == sizeof(PersistedStateV3)) {
    registry_migrated = true;
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
      state.zones[i].name_source = ::lune_touch::ZoneNameSource::TOUCH;
      state.zones[i].enabled = legacy.zones[i].enabled;
      state.zones[i].schedule_enabled = false;
      std::strncpy(state.zones[i].room_id, legacy.zones[i].room_id,
                   sizeof(state.zones[i].room_id) - 1);
      std::strncpy(state.zones[i].room_name, legacy.zones[i].room_name,
                   sizeof(state.zones[i].room_name) - 1);
    }
    ESP_LOGI(TAG, "Migrated Touch registry from v3 to v9");
  } else {
    nvs_close(handle);
    ESP_LOGW(TAG, "Ignoring Touch registry with unsupported blob size: %u (expected %u)",
             static_cast<unsigned>(len), static_cast<unsigned>(sizeof(state)));
    return false;
  }

  registry_migrated = populate_missing_loop_ids_(&state) || registry_migrated;

  if (!model_.import_state(state)) {
    ESP_LOGW(TAG, "Ignoring incompatible Touch registry blob (version=%u nodes=%u zones=%u rooms=%u)",
             static_cast<unsigned>(state.version), static_cast<unsigned>(state.node_count),
             static_cast<unsigned>(state.zone_count), static_cast<unsigned>(state.room_count));
    return false;
  }
  ESP_LOGI(TAG, "Loaded Touch registry: nodes=%u zones=%u",
           static_cast<unsigned>(model_.node_count()),
           static_cast<unsigned>(model_.zone_count()));
  if (registry_migrated || touch_registry_partition_ready_) {
    if (touch_registry_partition_ready_)
      ESP_LOGI(TAG, "Copying legacy Touch registry to dedicated NVS");
    save_registry_();
  }
  return true;
}

void LuneTouchCoordinator::save_registry_() {
  static bool registry_namespace_ready = false;
  if (!take_state_lock_(250)) {
    ESP_LOGW(TAG, "Could not lock registry for save");
    return;
  }
  static ::lune_touch::PersistedState state;
  std::memset(&state, 0, sizeof(state));
  if (!model_.export_state(&state)) {
    give_state_lock_();
    return;
  }

  nvs_handle_t handle;
  const esp_err_t open_err = open_touch_registry_nvs_(NVS_READWRITE, &handle);
  if (open_err != ESP_OK) {
    ESP_LOGE(TAG, "Could not open Touch registry for save: %s", esp_err_to_name(open_err));
    give_state_lock_();
    return;
  }
  // The legacy fallback partition may contain a large single blob. Remove it
  // before writing the chunked registry; the in-memory model remains intact if
  // a write still fails and the error is explicit in the monitor log.
  // Clear stale single-blob/chunk remnants once per boot before the first
  // successful chunked write. This handles interrupted migrations where no
  // legacy key remains but old chunk entries still consume NVS pages. Normal
  // subsequent saves overwrite the four chunks in place. WiFi, weather,
  // settings, and ledger use separate namespaces.
  if (!registry_namespace_ready) {
    const esp_err_t erase_err = nvs_erase_all(handle);
    if (erase_err != ESP_OK && erase_err != ESP_ERR_NVS_NOT_FOUND) {
      ESP_LOGE(TAG, "Could not clear Touch registry namespace: %s", esp_err_to_name(erase_err));
      nvs_close(handle);
      give_state_lock_();
      return;
    }
    const esp_err_t erase_commit = nvs_commit(handle);
    if (erase_commit != ESP_OK) {
      ESP_LOGE(TAG, "Could not clear legacy Touch registry blob: %s", esp_err_to_name(erase_commit));
      nvs_close(handle);
      give_state_lock_();
      return;
    }
  }
  esp_err_t set_err = ESP_OK;
  const uint8_t *source = reinterpret_cast<const uint8_t *>(&state);
  for (size_t i = 0; i < REGISTRY_CHUNK_COUNT; i++) {
    const size_t offset = i * REGISTRY_CHUNK_SIZE;
    const size_t length = std::min(REGISTRY_CHUNK_SIZE, sizeof(state) - offset);
    set_err = nvs_set_blob(handle, REGISTRY_CHUNK_KEYS[i], source + offset, length);
    if (set_err != ESP_OK) {
      ESP_LOGE(TAG, "Touch registry chunk %u/%u failed (%u bytes): %s",
               static_cast<unsigned>(i + 1), static_cast<unsigned>(REGISTRY_CHUNK_COUNT),
               static_cast<unsigned>(length), esp_err_to_name(set_err));
      nvs_stats_t stats{};
      const char *partition_name = touch_registry_partition_ready_ ? TOUCH_REGISTRY_PARTITION : nullptr;
      if (nvs_get_stats(partition_name, &stats) == ESP_OK)
        ESP_LOGE(TAG, "NVS usage: used=%u free=%u total=%u namespaces=%u",
                 static_cast<unsigned>(stats.used_entries), static_cast<unsigned>(stats.free_entries),
                 static_cast<unsigned>(stats.total_entries), static_cast<unsigned>(stats.namespace_count));
      break;
    }
  }
  const esp_err_t commit_err = set_err == ESP_OK ? nvs_commit(handle) : set_err;
  if (commit_err != ESP_OK)
    ESP_LOGE(TAG, "Could not save chunked Touch registry (%u bytes in %u chunks): %s",
             static_cast<unsigned>(sizeof(state)), static_cast<unsigned>(REGISTRY_CHUNK_COUNT),
             esp_err_to_name(commit_err));
  else
    ESP_LOGD(TAG, "Saved chunked Touch registry (%u bytes in %u chunks)",
             static_cast<unsigned>(sizeof(state)), static_cast<unsigned>(REGISTRY_CHUNK_COUNT));
  if (commit_err == ESP_OK)
    registry_namespace_ready = true;
  if (commit_err == ESP_OK && touch_registry_partition_ready_)
    dedicated_touch_registry_valid_ = true;
  nvs_close(handle);
  give_state_lock_();
}

void LuneTouchCoordinator::load_ledger_() {
  nvs_handle_t handle;
  if (nvs_open(LEDGER_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return;

  PersistedLedgerCompact compact{};
  size_t compact_len = sizeof(compact);
  if (nvs_get_blob(handle, "recent4", &compact, &compact_len) == ESP_OK &&
      compact_len == sizeof(compact) && compact.magic == ::lune_touch::PERSISTED_LEDGER_MAGIC &&
      compact.version == 1 && compact.count <= PERSISTED_LEDGER_RECORDS) {
    static ::lune_touch::PersistedLedger state;
    std::memset(&state, 0, sizeof(state));
    state.magic = ::lune_touch::PERSISTED_LEDGER_MAGIC;
    state.version = ::lune_touch::PERSISTED_LEDGER_VERSION;
    state.boot_id = compact.boot_id;
    state.count = compact.count;
    state.next = compact.count % ::lune_touch::LEDGER_CAPACITY;
    for (size_t i = 0; i < compact.count; i++)
      state.records[i] = compact.records[i];
    nvs_close(handle);
    if (ledger_.import_state(state, boot_id_, current_epoch_s_()))
      ESP_LOGI(TAG, "Loaded compact Touch command ledger: records=%u",
               static_cast<unsigned>(ledger_.count()));
    return;
  }

  static ::lune_touch::PersistedLedger state;
  std::memset(&state, 0, sizeof(state));
  size_t len = sizeof(state);
  const esp_err_t err = nvs_get_blob(handle, "recent", &state, &len);
  nvs_close(handle);
  if (err != ESP_OK || len != sizeof(state))
    return;
  if (!ledger_.import_state(state, boot_id_, current_epoch_s_())) {
    ESP_LOGW(TAG, "Ignoring incompatible Touch command ledger blob");
    return;
  }
  ESP_LOGI(TAG, "Loaded Touch command ledger: records=%u",
           static_cast<unsigned>(ledger_.count()));
  // Migrate the old large ledger blob to the compact form on the next save.
  save_ledger_();
}

void LuneTouchCoordinator::save_ledger_() {
  static ::lune_touch::PersistedLedger state;
  std::memset(&state, 0, sizeof(state));
  if (!ledger_.export_state(&state))
    return;

  PersistedLedgerCompact compact{};
  compact.boot_id = state.boot_id;
  compact.count = std::min<size_t>(state.count, PERSISTED_LEDGER_RECORDS);
  const size_t start = state.count < ::lune_touch::LEDGER_CAPACITY
                           ? (state.count > compact.count ? state.count - compact.count : 0)
                           : (state.next + ::lune_touch::LEDGER_CAPACITY - compact.count) %
                                 ::lune_touch::LEDGER_CAPACITY;
  for (size_t i = 0; i < compact.count; i++) {
    const size_t source_index = (start + i) % ::lune_touch::LEDGER_CAPACITY;
    compact.records[i] = state.records[source_index];
  }

  nvs_handle_t handle;
  if (nvs_open(LEDGER_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  // The previous ledger was a large single blob. Clear the ledger namespace
  // only during that migration; normal saves overwrite the compact blob.
  size_t legacy_len = 0;
  const bool has_legacy_ledger = nvs_get_blob(handle, "recent", nullptr, &legacy_len) == ESP_OK;
  if (has_legacy_ledger) {
    const esp_err_t erase_err = nvs_erase_all(handle);
    if (erase_err != ESP_OK && erase_err != ESP_ERR_NVS_NOT_FOUND) {
      ESP_LOGE(TAG, "Could not clear Touch ledger namespace: %s", esp_err_to_name(erase_err));
      nvs_close(handle);
      return;
    }
    const esp_err_t erase_commit = nvs_commit(handle);
    if (erase_commit != ESP_OK) {
      ESP_LOGE(TAG, "Could not clear legacy Touch command ledger: %s", esp_err_to_name(erase_commit));
      nvs_close(handle);
      return;
    }
  }
  const esp_err_t set_err = nvs_set_blob(handle, "recent4", &compact, sizeof(compact));
  const esp_err_t commit_err = set_err == ESP_OK ? nvs_commit(handle) : set_err;
  if (commit_err != ESP_OK)
    ESP_LOGE(TAG, "Could not save compact Touch command ledger: %s", esp_err_to_name(commit_err));
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

void LuneTouchCoordinator::save_forecast_settings_(float latitude, float longitude, const char *mode) {
  nvs_handle_t handle;
  if (nvs_open(WEATHER_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;
  nvs_set_i32(handle, "lat_e6", static_cast<int32_t>(latitude * 1000000.0f));
  nvs_set_i32(handle, "lon_e6", static_cast<int32_t>(longitude * 1000000.0f));
  nvs_set_str(handle, "mode", mode != nullptr && mode[0] != '\0' ? mode : "manual");
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
      !lune_touch_forecast_timeline::cache_version_supported(cache.version) || cache.hours_count == 0 ||
      cache.hours_count > 72) {
    return;
  }
  int64_t timestamps[72]{};
  for (uint8_t i = 0; i < cache.hours_count; i++)
    timestamps[i] = cache.hours[i].timestamp_s;
  const auto validation = lune_touch_forecast_timeline::validate_cache(
      cache.fetch_epoch_s, cache.provider_timezone, timestamps, cache.hours_count, current_epoch_s_(),
      FORECAST_CACHE_MAX_AGE_S);
  if (validation != lune_touch_forecast_timeline::CacheValidation::FRESH) {
    std::strncpy(forecast_status_, "stale", sizeof(forecast_status_) - 1);
    forecast_status_[sizeof(forecast_status_) - 1] = '\0';
    std::strncpy(forecast_last_error_, cache_validation_error_(validation),
                 sizeof(forecast_last_error_) - 1);
    forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
    clear_forecast_cache_();
    return;
  }
  forecast_hours_count_ = cache.hours_count;
  for (uint8_t i = 0; i < forecast_hours_count_; i++)
    forecast_hours_[i] = cache.hours[i];
  forecast_min_temp_c_ = cache.min_temp_c;
  forecast_max_wind_ms_ = cache.max_wind_ms;
  forecast_peak_wind_dir_deg_ = cache.peak_wind_dir_deg;
  forecast_max_solar_wm2_ = cache.max_solar_wm2;
  forecast_fetch_epoch_s_ = cache.fetch_epoch_s;
  std::strncpy(forecast_provider_timezone_, cache.provider_timezone,
               sizeof(forecast_provider_timezone_) - 1);
  forecast_provider_timezone_[sizeof(forecast_provider_timezone_) - 1] = '\0';
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
  cache.fetch_epoch_s = forecast_fetch_epoch_s_;
  std::strncpy(cache.provider_timezone, forecast_provider_timezone_,
               sizeof(cache.provider_timezone) - 1);
  cache.provider_timezone[sizeof(cache.provider_timezone) - 1] = '\0';
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
  if (nvs_open(SETTINGS_NAMESPACE, NVS_READONLY, &handle) == ESP_OK) {
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
    len = sizeof(authority_leader_node_id_);
    nvs_get_str(handle, "auth_leader", authority_leader_node_id_, &len);
    len = sizeof(authority_coordinator_id_);
    nvs_get_str(handle, "auth_coord", authority_coordinator_id_, &len);
    len = sizeof(authority_shared_key_);
    nvs_get_str(handle, "auth_key", authority_shared_key_, &len);
    uint8_t heat_source_enabled = heat_source_.enabled ? 1 : 0;
    if (nvs_get_u8(handle, "hs_en", &heat_source_enabled) == ESP_OK)
      heat_source_.enabled = heat_source_enabled != 0;
    len = sizeof(heat_source_.host);
    nvs_get_str(handle, "hs_host", heat_source_.host, &len);
    uint16_t heat_source_port = heat_source_.port;
    if (nvs_get_u16(handle, "hs_port", &heat_source_port) == ESP_OK)
      heat_source_.port = heat_source_port;
    len = sizeof(heat_source_.weighted_temperature_variable);
    nvs_get_str(handle, "hs_temp_var", heat_source_.weighted_temperature_variable, &len);
    uint16_t heat_source_interval = heat_source_.push_interval_s;
    if (nvs_get_u16(handle, "hs_interval", &heat_source_interval) == ESP_OK)
      heat_source_.push_interval_s = heat_source_interval;
    float max_boost_c = weather_max_boost_c_;
    len = sizeof(max_boost_c);
    if (nvs_get_blob(handle, "weather_boost", &max_boost_c, &len) == ESP_OK &&
        len == sizeof(max_boost_c) && std::isfinite(max_boost_c)) {
      weather_max_boost_c_ = std::max(0.0f, std::min(5.0f, max_boost_c));
      weather_max_boost_configured_ = true;
      weather_max_boost_seeded_from_v6_ = true;
    }
    nvs_close(handle);
  }
  heat_source_.port = std::max<uint16_t>(1, heat_source_.port);
  heat_source_.push_interval_s = std::max<uint16_t>(5, heat_source_.push_interval_s);

  // Security identity is mirrored into the dedicated Touch partition. This
  // keeps V6 approval stable even if the small default NVS is crowded by an
  // older registry after an OTA migration.
  identity_persistence_needs_sync_ = touch_registry_partition_ready_;
  if (touch_registry_partition_ready_) {
    nvs_handle_t identity_handle;
    if (nvs_open_from_partition(TOUCH_REGISTRY_PARTITION, IDENTITY_NAMESPACE, NVS_READONLY,
                                &identity_handle) == ESP_OK) {
      char persisted_install_id[sizeof(install_id_)]{};
      char persisted_coordinator_id[sizeof(authority_coordinator_id_)]{};
      char persisted_key[sizeof(authority_shared_key_)]{};
      size_t install_len = sizeof(persisted_install_id);
      size_t coordinator_len = sizeof(persisted_coordinator_id);
      size_t key_len = sizeof(persisted_key);
      const bool complete =
          nvs_get_str(identity_handle, "install_id", persisted_install_id, &install_len) == ESP_OK &&
          nvs_get_str(identity_handle, "coord_id", persisted_coordinator_id, &coordinator_len) == ESP_OK &&
          nvs_get_str(identity_handle, "shared_key", persisted_key, &key_len) == ESP_OK &&
          persisted_install_id[0] != '\0' && persisted_coordinator_id[0] != '\0' &&
          std::strlen(persisted_key) >= 16;
      nvs_close(identity_handle);
      if (complete) {
        std::strncpy(install_id_, persisted_install_id, sizeof(install_id_) - 1);
        std::strncpy(authority_coordinator_id_, persisted_coordinator_id,
                     sizeof(authority_coordinator_id_) - 1);
        std::strncpy(authority_shared_key_, persisted_key, sizeof(authority_shared_key_) - 1);
        identity_persistence_needs_sync_ = false;
        ESP_LOGI(TAG, "Loaded OTA-stable Touch installation identity");
      }
    }
  }
}

void LuneTouchCoordinator::ensure_automatic_identity_() {
  const bool missing_install = install_id_[0] == '\0' || std::strcmp(install_id_, "unassigned") == 0;
  const bool missing_key = authority_shared_key_[0] == '\0';
  const bool untouched_defaults = missing_install && missing_key;
  bool changed = false;

  if (missing_install) {
    const uint32_t a = esp_random();
    const uint32_t b = esp_random();
    std::snprintf(install_id_, sizeof(install_id_), "lune-%08lx%08lx",
                  static_cast<unsigned long>(a), static_cast<unsigned long>(b));
    changed = true;
  }
  if (authority_coordinator_id_[0] == '\0' ||
      (untouched_defaults && std::strcmp(authority_coordinator_id_, "lune-touch") == 0)) {
    std::snprintf(authority_coordinator_id_, sizeof(authority_coordinator_id_), "touch-%08lx",
                  static_cast<unsigned long>(esp_random()));
    changed = true;
  }
  if (missing_key) {
    static constexpr char HEX[] = "0123456789abcdef";
    size_t off = 0;
    while (off + 8 < sizeof(authority_shared_key_)) {
      const uint32_t value = esp_random();
      for (int shift = 28; shift >= 0 && off + 1 < sizeof(authority_shared_key_); shift -= 4)
        authority_shared_key_[off++] = HEX[(value >> shift) & 0x0F];
      if (off >= 48)
        break;
    }
    authority_shared_key_[off] = '\0';
    changed = true;
  }

  if (!changed && !identity_persistence_needs_sync_)
    return;
  save_settings_();
  ESP_LOGI(TAG, changed ? "Generated and persisted Touch installation identity"
                        : "Migrated Touch installation identity to dedicated NVS");
}

void LuneTouchCoordinator::save_settings_() {
  nvs_handle_t handle;
  const esp_err_t settings_open = nvs_open(SETTINGS_NAMESPACE, NVS_READWRITE, &handle);
  if (settings_open == ESP_OK) {
    esp_err_t err = nvs_set_str(handle, "name", coordinator_name_);
    if (err == ESP_OK) err = nvs_set_str(handle, "install_id", install_id_);
    if (err == ESP_OK) err = nvs_set_str(handle, "site", site_label_);
    if (err == ESP_OK) err = nvs_set_str(handle, "mode", install_mode_);
    if (err == ESP_OK) err = nvs_set_u8(handle, "asgard_en", asgard_enabled_ ? 1 : 0);
    if (err == ESP_OK) err = nvs_set_str(handle, "asgard_mode", asgard_mode_);
    if (err == ESP_OK) err = nvs_set_str(handle, "auth_leader", authority_leader_node_id_);
    if (err == ESP_OK) err = nvs_set_str(handle, "auth_coord", authority_coordinator_id_);
    if (err == ESP_OK) err = nvs_set_str(handle, "auth_key", authority_shared_key_);
    if (err == ESP_OK) err = nvs_set_u8(handle, "hs_en", heat_source_.enabled ? 1 : 0);
    if (err == ESP_OK) err = nvs_set_str(handle, "hs_host", heat_source_.host);
    if (err == ESP_OK) err = nvs_set_u16(handle, "hs_port", heat_source_.port);
    if (err == ESP_OK) err = nvs_set_str(handle, "hs_temp_var", heat_source_.weighted_temperature_variable);
    if (err == ESP_OK) err = nvs_set_u16(handle, "hs_interval", heat_source_.push_interval_s);
    if (err == ESP_OK)
      err = nvs_set_blob(handle, "weather_boost", &weather_max_boost_c_, sizeof(weather_max_boost_c_));
    if (err == ESP_OK)
      err = nvs_commit(handle);
    nvs_close(handle);
    if (err != ESP_OK)
      ESP_LOGE(TAG, "Could not persist Touch settings: %s", esp_err_to_name(err));
  } else {
    ESP_LOGE(TAG, "Could not open Touch settings NVS: %s", esp_err_to_name(settings_open));
  }

  if (!touch_registry_partition_ready_)
    return;
  nvs_handle_t identity_handle;
  const esp_err_t identity_open = nvs_open_from_partition(
      TOUCH_REGISTRY_PARTITION, IDENTITY_NAMESPACE, NVS_READWRITE, &identity_handle);
  if (identity_open != ESP_OK) {
    ESP_LOGE(TAG, "Could not open dedicated Touch identity NVS: %s", esp_err_to_name(identity_open));
    return;
  }
  esp_err_t identity_err = nvs_set_str(identity_handle, "install_id", install_id_);
  if (identity_err == ESP_OK)
    identity_err = nvs_set_str(identity_handle, "coord_id", authority_coordinator_id_);
  if (identity_err == ESP_OK)
    identity_err = nvs_set_str(identity_handle, "shared_key", authority_shared_key_);
  if (identity_err == ESP_OK)
    identity_err = nvs_commit(identity_handle);
  nvs_close(identity_handle);
  if (identity_err == ESP_OK)
    identity_persistence_needs_sync_ = false;
  else
    ESP_LOGE(TAG, "Could not persist OTA-stable Touch identity: %s", esp_err_to_name(identity_err));
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
  stamp_command_timing_(&record, esphome::millis(), 45UL * 60UL);
  const auto mock_target = model_.resolve_room("room-01");
  stamp_command_target_(&record, mock_target.node, mock_target.binding);
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
  // PairedNode::node_id is the canonical identity used by all subsequent
  // /nodes/{id}/... routes.  Reject overlong caller-supplied ids instead of
  // silently truncating them in HouseModel::upsert_node(); silent truncation
  // leaves the UI holding an id that later trust/profile/remove calls cannot
  // resolve and surfaces as the misleading node_not_found error.
  if (std::strlen(node_id) >= sizeof(::lune_touch::PairedNode{}.node_id)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_id_too_long\"}");
    return false;
  }
  for (const char *p = node_id; *p != '\0'; ++p) {
    const unsigned char c = static_cast<unsigned char>(*p);
    if (!std::isalnum(c) && c != '-' && c != '_') {
      snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_id_invalid\"}");
      return false;
    }
  }
  if ((hostname == nullptr || hostname[0] == '\0') && (fallback_ip == nullptr || fallback_ip[0] == '\0')) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"hostname_or_ip_required\"}");
    return false;
  }
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const int index = model_.upsert_node(node_id, hostname, fallback_ip, "lune-v6", "unknown", ::lune_touch::NodeTrust::PAIRED);
  if (index < 0) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_registry_full\"}");
    return false;
  }
  model_.update_node_identity(static_cast<size_t>(index), pairing_fingerprint);
  const auto *stored_node = model_.node(static_cast<size_t>(index));
  char canonical_node_id[sizeof(::lune_touch::PairedNode{}.node_id)]{};
  std::strncpy(canonical_node_id, stored_node != nullptr ? stored_node->node_id : node_id,
               sizeof(canonical_node_id) - 1);
  give_state_lock_();
  save_registry_();
  char node_id_esc[48];
  char pairing_fingerprint_esc[48];
  json_escape_(canonical_node_id, node_id_esc, sizeof(node_id_esc));
  json_escape_(pairing_fingerprint != nullptr ? pairing_fingerprint : "",
               pairing_fingerprint_esc, sizeof(pairing_fingerprint_esc));
  snprintf(response, capacity, "{\"result\":\"stored\",\"node_id\":\"%s\",\"node_index\":%d,"
           "\"pairing_fingerprint\":\"%s\"}",
           node_id_esc, index, pairing_fingerprint_esc);
  char event[112];
  snprintf(event, sizeof(event), "paired node %s", canonical_node_id);
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

  const char *hosts[2]{};
  size_t host_count = 0;
  if (hostname != nullptr && hostname[0] != '\0')
    hosts[host_count++] = hostname;
  if (fallback_ip != nullptr && fallback_ip[0] != '\0' &&
      (host_count == 0 || std::strcmp(fallback_ip, hosts[0]) != 0))
    hosts[host_count++] = fallback_ip;
  const char *primary_host = host_count > 0 ? hosts[0] : "";
  char host_esc[128];
  char ip_esc[48];
  char id_esc[48];
  json_escape_(primary_host, host_esc, sizeof(host_esc));
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

  constexpr size_t PROBE_BODY_CAP = 3072;
  char *body = alloc_http_body_(PROBE_BODY_CAP);
  if (body == nullptr) {
    snprintf(response, capacity,
             "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
             "\"hostname\":\"%s\",\"ip\":\"%s\",\"reachable\":false,\"stale\":true,"
             "\"source\":\"manual_probe\",\"error\":\"no_body_heap\"}]}",
             id_esc, host_esc, ip_esc);
    return false;
  }
  int status = 0;
  int last_status = 0;
  const char *success_host = nullptr;
  JsonDocument doc;
  bool parsed = false;
  for (size_t i = 0; i < host_count; i++) {
    char url[192];
    snprintf(url, sizeof(url), "http://%s/api/hv6/v1/overview", hosts[i]);
    if (!fetch_json_(url, body, PROBE_BODY_CAP, &status)) {
      last_status = status;
      ESP_LOGD(TAG, "V6 probe failed via %s (%d)", hosts[i], status);
      continue;
    }
    DeserializationError err = deserializeJson(doc, body);
    if (err) {
      last_status = status;
      ESP_LOGW(TAG, "V6 probe JSON parse failed via %s: %s", hosts[i], err.c_str());
      doc.clear();
      continue;
    }
    success_host = hosts[i];
    parsed = true;
    break;
  }
  if (!parsed) {
    snprintf(response, capacity,
             "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
             "\"hostname\":\"%s\",\"ip\":\"%s\",\"reachable\":false,\"stale\":true,"
             "\"source\":\"manual_probe\",\"http_status\":%d,\"error\":\"probe_failed\"}]}",
             id_esc, host_esc, ip_esc, last_status);
    heap_caps_free(body);
    return false;
  }

  JsonVariant data = doc["data"];
  if (data.isNull())
    data = doc;
  const char *model = data["node"]["model"] | "lune-v6";
  const char *firmware = data["node"]["firmware"] | "unknown";
  const char *pairing_fingerprint = data["pairing"]["fingerprint"].as<const char *>();
  if (pairing_fingerprint == nullptr || pairing_fingerprint[0] == '\0')
    pairing_fingerprint = data["node"]["pairing_fingerprint"] | "";
  const char *reported_ip = data["node"]["ip"].as<const char *>();
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
  json_escape_(success_host != nullptr ? success_host : primary_host, host_esc, sizeof(host_esc));

  snprintf(response, capacity,
           "{\"scan\":\"probe\",\"discovery\":\"manual_probe\",\"found\":[{\"id\":\"%s\","
           "\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\",\"firmware\":\"%s\","
           "\"pairing_fingerprint\":\"%s\","
           "\"reachable\":true,\"stale\":false,\"source\":\"manual_probe\",\"http_status\":%d}]}",
           id_esc, host_esc, reported_ip_esc, model_esc, firmware_esc,
           pairing_fingerprint_esc, status);
  heap_caps_free(body);
  return true;
}

bool LuneTouchCoordinator::scan_registered_nodes(char *response, size_t capacity) {
  if (take_state_lock_(100)) {
    node_refresh_requested_ = true;
    give_state_lock_();
  }
  if (poll_task_handle_ != nullptr)
    xTaskNotifyGive(poll_task_handle_);
  // Return immediately. Network probing belongs to the coordinator task, not
  // the HTTP worker; otherwise concurrent overview/nodes/zones requests fail.
  write_node_scan_json(response, capacity);
  return esphome::network::is_connected();
}

bool LuneTouchCoordinator::set_node_trust(const char *node_id, ::lune_touch::NodeTrust trust,
                                          const char *confirmation, char *response,
                                          size_t capacity) {
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
  if (trust == ::lune_touch::NodeTrust::TRUSTED &&
      (confirmation == nullptr || std::strcmp(confirmation, target->pairing_fingerprint) != 0)) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"fingerprint_confirmation_required\"}");
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

bool LuneTouchCoordinator::set_node_profile(const char *node_id, const char *name,
                                            char *response, size_t capacity) {
  if (node_id == nullptr || node_id[0] == '\0' || name == nullptr || name[0] == '\0') {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"name_required\"}");
    return false;
  }
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const bool updated = model_.update_node_name(node_id, name);
  give_state_lock_();
  if (!updated) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"node_not_found\"}");
    return false;
  }
  save_registry_();
  char node_id_esc[48];
  char name_esc[80];
  json_escape_(node_id, node_id_esc, sizeof(node_id_esc));
  json_escape_(name, name_esc, sizeof(name_esc));
  snprintf(response, capacity, "{\"result\":\"stored\",\"node_id\":\"%s\",\"name\":\"%s\"}",
           node_id_esc, name_esc);
  char event[112];
  snprintf(event, sizeof(event), "renamed node %s", node_id);
  log_event_("info", "commissioning", event);
  return true;
}

bool LuneTouchCoordinator::remove_node(const char *node_id, const char *confirmation,
                                       char *response, size_t capacity) {
  if (node_id == nullptr || node_id[0] == '\0' ||
      confirmation == nullptr || std::strcmp(confirmation, node_id) != 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"confirmation_required\"}");
    return false;
  }
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const bool removed = model_.remove_node(node_id);
  give_state_lock_();
  if (!removed) {
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
  if (open_touch_registry_nvs_(NVS_READWRITE, &handle) == ESP_OK) {
    nvs_erase_all(handle);
    nvs_commit(handle);
    nvs_close(handle);
  }
  if (nvs_open(LEDGER_NAMESPACE, NVS_READWRITE, &handle) == ESP_OK) {
    nvs_erase_all(handle);
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
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const bool bound = model_.bind_zone(room_id, room_name, node_index, zone_index);
  give_state_lock_();
  if (!bound) {
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
  if (!std::isfinite(comfort_setpoint_c) || comfort_setpoint_c < 5.0f || comfort_setpoint_c > 35.0f) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_comfort_setpoint\"}");
    return false;
  }
  if (!std::isfinite(comfort_bias_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_comfort_bias\"}");
    return false;
  }
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  ::lune_touch::ResolvedRoomLoop loops[::lune_touch::MAX_HOUSE_ZONES]{};
  const size_t loop_count = model_.resolve_room_loops(room_id, loops, ::lune_touch::MAX_HOUSE_ZONES);
  if (loop_count == 0) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  uint8_t target_node_indexes[::lune_touch::MAX_HOUSE_ZONES]{};
  uint8_t target_zones[::lune_touch::MAX_HOUSE_ZONES]{};
  for (size_t i = 0; i < loop_count; i++) {
    if (loops[i].node == nullptr || loops[i].binding == nullptr) {
      give_state_lock_();
      snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
      return false;
    }
    target_node_indexes[i] = loops[i].binding->node_index;
    target_zones[i] = loops[i].binding->zone_index;
    const bool mock = std::strcmp(loops[i].node->firmware, "mock") == 0;
    if (!mock && (!loops[i].node->reachable ||
                  loops[i].node->trust != ::lune_touch::NodeTrust::TRUSTED)) {
      give_state_lock_();
      snprintf(response, capacity,
               "{\"result\":\"rejected\",\"error\":\"v6_control_unavailable\"}");
      return false;
    }
  }
  give_state_lock_();
  for (size_t i = 0; i < loop_count; i++) {
    if (!take_state_lock_(100)) {
      snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
      return false;
    }
    const auto *node = model_.node(target_node_indexes[i]);
    if (node == nullptr) {
      give_state_lock_();
      snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
      return false;
    }
    const ::lune_touch::PairedNode target_node = *node;
    give_state_lock_();
    if (std::strcmp(target_node.firmware, "mock") != 0 &&
        !send_v6_zone_setpoint_(target_node, target_zones[i], comfort_setpoint_c)) {
      snprintf(response, capacity,
               "{\"result\":\"rejected\",\"error\":\"v6_setpoint_failed\","
               "\"updated_loops\":%u,\"required_loops\":%u}",
               static_cast<unsigned>(i), static_cast<unsigned>(loop_count));
      return false;
    }
  }
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const bool updated = model_.update_zone_comfort(room_id, comfort_setpoint_c, priority, comfort_bias_c);
  if (updated)
    recompute_forecast_decisions_();
  give_state_lock_();
  if (!updated) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
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
           "\"comfort_bias_c\":%.1f,\"effective_setpoint_c\":%.1f,\"priority\":%u,"
           "\"synced_loops\":%u}",
           room_id_esc, stored, stored_bias, effective,
           static_cast<unsigned>(stored_priority), static_cast<unsigned>(loop_count));
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
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const bool updated = model_.update_zone_schedule(room_id, enabled, day_mask, start_min, end_min, setpoint_c);
  give_state_lock_();
  if (!updated) {
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
  if (!std::isfinite(wind_exposure) || !std::isfinite(solar_gain)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_forecast_profile\"}");
    return false;
  }
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const auto target = model_.resolve_room(room_id);
  if (target.node == nullptr || target.binding == nullptr) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  const ::lune_touch::PairedNode target_node = *target.node;
  const uint8_t target_zone = target.binding->zone_index;
  give_state_lock_();
  if (std::strcmp(target_node.firmware, "mock") != 0) {
    char wind[16], solar[16], lead[16];
    snprintf(wind, sizeof(wind), "%.2f", wind_exposure);
    snprintf(solar, sizeof(solar), "%.2f", solar_gain);
    snprintf(lead, sizeof(lead), "%u", static_cast<unsigned>(thermal_lead_h));
    const bool pushed =
        send_v6_zone_setting_(target_node, target_zone, "number", "zone_wind_exposure", wind) &&
        send_v6_zone_setting_(target_node, target_zone, "number", "zone_solar_gain", solar) &&
        send_v6_zone_setting_(target_node, target_zone, "number", "zone_thermal_lead_h", lead);
    if (!pushed) {
      snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"v6_weather_settings_failed\"}");
      return false;
    }
  }
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const bool updated = model_.update_zone_forecast_profile(room_id, exterior_walls, wind_exposure, solar_gain,
                                                           thermal_lead_h, max_offset_c);
  if (updated)
    recompute_forecast_decisions_();
  give_state_lock_();
  if (!updated) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
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

bool LuneTouchCoordinator::update_room_atomically(const char *room_id,
                                                  const ::lune_touch::RoomUpdate &update,
                                                  char *response, size_t capacity) {
  if (!take_state_lock_(250)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  uint32_t revision = 0;
  const auto result = model_.apply_room_update(room_id, update, &revision);
  if (result == ::lune_touch::RoomUpdateResult::STORED)
    recompute_forecast_decisions_();
  give_state_lock_();
  if (result != ::lune_touch::RoomUpdateResult::STORED) {
    const char *error = result == ::lune_touch::RoomUpdateResult::STALE_REVISION
                            ? "stale_revision"
                            : result == ::lune_touch::RoomUpdateResult::NOT_FOUND
                                  ? "room_not_mapped" : "invalid_room_update";
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"%s\"}", error);
    return false;
  }
  save_registry_();
  char room_id_esc[48];
  json_escape_(room_id, room_id_esc, sizeof(room_id_esc));
  snprintf(response, capacity,
           "{\"result\":\"stored\",\"room\":{\"room_id\":\"%s\",\"revision\":%lu,"
           "\"comfort_setpoint_c\":%.1f,\"comfort_bias_c\":%.1f,\"priority\":%u,"
           "\"schedule\":{\"enabled\":%s,\"day_mask\":%u,\"start_min\":%u,\"end_min\":%u,\"setpoint_c\":%.1f},"
           "\"forecast\":{\"exterior_walls\":%u,\"wind_exposure\":%.2f,\"solar_gain\":%.2f,\"thermal_lead_h\":%u,\"max_offset_c\":%.2f},"
           "\"geometry\":{\"total_area_m2\":%.2f,\"physical_weight\":%.2f,\"include_in_house_temperature\":%s}}}",
           room_id_esc, static_cast<unsigned long>(revision), update.comfort_setpoint_c,
           update.comfort_bias_c, static_cast<unsigned>(update.priority),
           update.schedule_enabled ? "true" : "false", static_cast<unsigned>(update.schedule_day_mask & 0x7F),
           static_cast<unsigned>(update.schedule_start_min), static_cast<unsigned>(update.schedule_end_min),
           update.schedule_setpoint_c, static_cast<unsigned>(update.exterior_walls & 0x0F),
           update.wind_exposure, update.solar_gain, static_cast<unsigned>(update.thermal_lead_h),
           update.max_offset_c, update.total_area_m2, update.physical_weight,
           update.include_in_house_temperature ? "true" : "false");
  log_event_("info", "zones", "atomic room configuration stored");
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
  ::lune_touch::ResolvedRoomLoop loops[::lune_touch::MAX_HOUSE_ZONES]{};
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  const size_t loop_count = model_.resolve_room_loops(room_id, loops, ::lune_touch::MAX_HOUSE_ZONES);
  if (loop_count == 0) {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"room_not_mapped\"}");
    return false;
  }
  give_state_lock_();
  size_t accepted = 0;
  char command_id[20]{};
  snprintf(command_id, sizeof(command_id), "room-%08lx", static_cast<unsigned long>(now));
  size_t off = 0;
  appendf_(response, capacity, off, "{\"command_id\":\"%s\",\"room_id\":\"%s\",\"loops\":[",
           command_id, room_id);
  for (size_t i = 0; i < loop_count; i++) {
    const auto &target = loops[i];
    ::lune_touch::CommandRecord final_record{};
    if (target.node != nullptr && target.binding != nullptr) {
      std::strncpy(final_record.request_id, command_id, sizeof(final_record.request_id) - 1);
      std::strncpy(final_record.source, "dashboard", sizeof(final_record.source) - 1);
      std::strncpy(final_record.reason, reason != nullptr && reason[0] != '\0' ? reason : "dashboard command",
                   sizeof(final_record.reason) - 1);
      final_record.node_index = target.binding->node_index;
      final_record.zone_index = target.binding->zone_index;
      final_record.requested_offset_c = requested_offset_c;
      stamp_command_timing_(&final_record, now, ttl_s);
      stamp_command_target_(&final_record, target.node, target.binding);
      const bool mock = std::strcmp(target.node->firmware, "mock") == 0;
      if (!target.node->reachable && !mock)
        final_record.result = ::lune_touch::CommandResult::BLOCKED_UNREACHABLE;
      else if (target.node->trust != ::lune_touch::NodeTrust::TRUSTED)
        final_record.result = ::lune_touch::CommandResult::BLOCKED_UNTRUSTED;
      else if (model_.is_node_stale(target.binding->node_index, now) && !mock)
        final_record.result = ::lune_touch::CommandResult::BLOCKED_STALE;
      else {
        char host[64]{};
        std::strncpy(host, node_last_success_host_[target.binding->node_index], sizeof(host) - 1);
        if (!send_v6_setpoint_command_(*target.node, target.binding->zone_index, final_record, ttl_s,
                                       &final_record, host))
          final_record.result = ::lune_touch::CommandResult::FAILED;
      }
    }
    if (final_record.result == ::lune_touch::CommandResult::ACCEPTED ||
        final_record.result == ::lune_touch::CommandResult::PENDING)
      accepted++;
    ledger_.append(final_record);
    appendf_(response, capacity, off,
             "%s{\"loop_id\":\"%s\",\"node_id\":\"%s\",\"zone_index\":%u,"
             "\"result\":\"%s\",\"accepted_offset_c\":%.2f}",
             i == 0 ? "" : ",", final_record.loop_id,
             final_record.node_id, static_cast<unsigned>(final_record.zone_index),
             ::lune_touch::command_result_name(final_record.result), final_record.accepted_offset_c);
  }
  const auto outcome = ::lune_touch::room_command_outcome(accepted, loop_count);
  appendf_(response, capacity, off, "],\"result\":\"%s\",\"ttl_s\":%lu,"
           "\"partial_application\":%s}",
           ::lune_touch::room_command_outcome_name(outcome),
           static_cast<unsigned long>(ttl_s),
           outcome == ::lune_touch::RoomCommandOutcome::PARTIAL ? "true" : "false");
  save_ledger_();
  log_event_(outcome == ::lune_touch::RoomCommandOutcome::ACCEPTED ? "info" : "warn",
             "commands", outcome == ::lune_touch::RoomCommandOutcome::PARTIAL
                             ? "room command partially applied; child results retained"
                             : "room command failed");
  // V6 commands cannot be rolled back safely across a node outage. A partial
  // application is explicit, persisted per loop, and never presented as room success.
  return outcome == ::lune_touch::RoomCommandOutcome::ACCEPTED;
}

bool LuneTouchCoordinator::request_motor_action(const char *room_id, const char *action,
                                                const char *confirmation, char *response,
                                                size_t capacity) {
  const char *v6_command = nullptr;
  const char *requested_action = action != nullptr ? action : "";
  if (std::strcmp(requested_action, "reset_fault") == 0) {
    v6_command = "motor_reset_fault";
  } else if (std::strcmp(requested_action, "reset_learned") == 0) {
    v6_command = "motor_reset_learned_factors";
  } else if (std::strcmp(requested_action, "relearn") == 0) {
    v6_command = "motor_reset_and_relearn";
  } else {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_motor_action\"}");
    return false;
  }
  if ((std::strcmp(requested_action, "reset_learned") == 0 ||
       std::strcmp(requested_action, "relearn") == 0) &&
      (confirmation == nullptr || std::strcmp(confirmation, requested_action) != 0)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"confirmation_required\"}");
    return false;
  }

  const uint32_t now = esphome::millis();
  ::lune_touch::PairedNode target_node{};
  uint8_t target_node_index = 0;
  uint8_t target_zone = 0;
  bool target_stale = true;
  char preferred_host[64]{};
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
  if (target_node_index < ::lune_touch::MAX_NODES) {
    std::strncpy(preferred_host, node_last_success_host_[target_node_index],
                 sizeof(preferred_host) - 1);
    preferred_host[sizeof(preferred_host) - 1] = '\0';
  }
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
      const char *hosts[3]{};
      size_t host_count = 0;
      auto add_host = [&](const char *host) {
        if (host == nullptr || host[0] == '\0' || host_count >= 3)
          return;
        for (size_t i = 0; i < host_count; i++) {
          if (std::strcmp(hosts[i], host) == 0)
            return;
        }
        hosts[host_count++] = host;
      };
      add_host(preferred_host);
      add_host(target_node.hostname);
      add_host(target_node.fallback_ip);
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
  char saved_mode[sizeof(forecast_location_mode_)]{};
  forecast_latitude_ = latitude;
  forecast_longitude_ = longitude;
  std::strncpy(forecast_location_mode_, mode != nullptr && mode[0] != '\0' ? mode : "manual",
               sizeof(forecast_location_mode_) - 1);
  forecast_location_mode_[sizeof(forecast_location_mode_) - 1] = '\0';
  std::strncpy(saved_mode, forecast_location_mode_, sizeof(saved_mode) - 1);
  std::strncpy(forecast_status_, "stale", sizeof(forecast_status_) - 1);
  forecast_status_[sizeof(forecast_status_) - 1] = '\0';
  forecast_last_error_[0] = '\0';
  forecast_last_fetch_ms_ = 0;
  forecast_fetch_epoch_s_ = 0;
  forecast_provider_timezone_[0] = '\0';
  forecast_fetch_requested_ = true;
  forecast_hours_count_ = 0;
  forecast_decision_count_ = 0;
  forecast_cache_restored_ = false;
  forecast_boot_refresh_pending_ = false;
  last_forecast_dispatch_ = {};
  give_state_lock_();
  save_forecast_settings_(latitude, longitude, saved_mode);
  clear_forecast_cache_();
  snprintf(response, capacity,
           "{\"result\":\"saved\",\"latitude\":%.6f,\"longitude\":%.6f,\"status\":\"stale\","
           "\"fetch_pending\":true}",
           latitude, longitude);
  log_event_("info", "forecast", "location updated");
  return true;
}

bool LuneTouchCoordinator::set_weather_settings(float max_boost_c, char *response, size_t capacity) {
  if (!std::isfinite(max_boost_c)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_max_boost\"}");
    return false;
  }
  const float stored = std::max(0.0f, std::min(5.0f, max_boost_c));
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  weather_max_boost_c_ = stored;
  weather_max_boost_configured_ = true;
  weather_max_boost_seeded_from_v6_ = true;
  recompute_forecast_decisions_();
  give_state_lock_();
  save_settings_();
  snprintf(response, capacity, "{\"result\":\"saved\",\"weather\":{\"max_boost_c\":%.1f}}", stored);
  log_event_("info", "settings", "weather settings updated");
  return true;
}

bool LuneTouchCoordinator::set_settings(const char *coordinator_name, const char *install_id,
                                        const char *site_label, const char *install_mode,
                                        bool has_asgard_enabled, bool asgard_enabled,
                                        const char *asgard_mode, const char *authority_leader_node_id,
                                        const char *authority_coordinator_id, const char *authority_shared_key,
                                        char *response, size_t capacity) {
  if ((coordinator_name == nullptr || coordinator_name[0] == '\0') &&
      (install_id == nullptr || install_id[0] == '\0') &&
      (site_label == nullptr || site_label[0] == '\0') &&
      (install_mode == nullptr || install_mode[0] == '\0') &&
      !has_asgard_enabled &&
      (asgard_mode == nullptr || asgard_mode[0] == '\0') &&
      (authority_leader_node_id == nullptr || authority_leader_node_id[0] == '\0') &&
      (authority_coordinator_id == nullptr || authority_coordinator_id[0] == '\0') &&
      (authority_shared_key == nullptr || authority_shared_key[0] == '\0')) {
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
  if (authority_leader_node_id != nullptr && authority_leader_node_id[0] != '\0')
    std::strncpy(authority_leader_node_id_, authority_leader_node_id, sizeof(authority_leader_node_id_) - 1);
  if (authority_coordinator_id != nullptr && authority_coordinator_id[0] != '\0')
    std::strncpy(authority_coordinator_id_, authority_coordinator_id, sizeof(authority_coordinator_id_) - 1);
  if (authority_shared_key != nullptr && authority_shared_key[0] != '\0')
    std::strncpy(authority_shared_key_, authority_shared_key, sizeof(authority_shared_key_) - 1);
  if ((authority_leader_node_id != nullptr && authority_leader_node_id[0] != '\0') ||
      (authority_coordinator_id != nullptr && authority_coordinator_id[0] != '\0') ||
      (authority_shared_key != nullptr && authority_shared_key[0] != '\0')) {
    authority_expires_at_ms_ = 0;
    std::strncpy(authority_state_, "no_publisher", sizeof(authority_state_) - 1);
    std::strncpy(authority_reason_, "authority settings changed", sizeof(authority_reason_) - 1);
  }
  save_settings_();
  give_state_lock_();
  snprintf(response, capacity, "{\"result\":\"saved\",\"install_mode\":\"%s\","
           "\"asgard_enabled\":%s,\"asgard_mode\":\"%s\",\"authority_configured\":%s}",
           install_mode_, asgard_enabled_ ? "true" : "false", asgard_mode_,
           authority_leader_node_id_[0] && authority_coordinator_id_[0] && authority_shared_key_[0] ? "true" : "false");
  log_event_("info", "settings", "coordinator settings updated");
  return true;
}

bool LuneTouchCoordinator::set_heat_source_settings(
    bool has_enabled, bool enabled, const char *host, uint16_t port,
    const char *weighted_temperature_variable, uint16_t push_interval_s,
    char *response, size_t capacity) {
  if (!has_enabled && (host == nullptr || host[0] == '\0') && port == 0 &&
      (weighted_temperature_variable == nullptr || weighted_temperature_variable[0] == '\0') &&
      push_interval_s == 0) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"settings_required\"}");
    return false;
  }
  if ((host != nullptr && std::strpbrk(host, " /?#") != nullptr) ||
      (push_interval_s != 0 && (push_interval_s < 5 || push_interval_s > 3600))) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_heat_source_settings\"}");
    return false;
  }
  if (weighted_temperature_variable != nullptr && weighted_temperature_variable[0] != '\0') {
    for (const char *p = weighted_temperature_variable; *p != '\0'; ++p) {
      const unsigned char c = static_cast<unsigned char>(*p);
      if (c < 0x20 || c > 0x7e) {
        snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"invalid_weighted_temperature_variable\"}");
        return false;
      }
    }
  }
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  if (has_enabled)
    heat_source_.enabled = enabled;
  if (host != nullptr && host[0] != '\0') {
    std::strncpy(heat_source_.host, host, sizeof(heat_source_.host) - 1);
    heat_source_.host[sizeof(heat_source_.host) - 1] = '\0';
  }
  if (port != 0)
    heat_source_.port = port;
  if (weighted_temperature_variable != nullptr && weighted_temperature_variable[0] != '\0') {
    std::strncpy(heat_source_.weighted_temperature_variable, weighted_temperature_variable,
                 sizeof(heat_source_.weighted_temperature_variable) - 1);
    heat_source_.weighted_temperature_variable[sizeof(heat_source_.weighted_temperature_variable) - 1] = '\0';
  }
  if (push_interval_s != 0)
    heat_source_.push_interval_s = push_interval_s;
  // Keep the legacy fields coherent for existing API clients.
  asgard_enabled_ = heat_source_.enabled;
  std::strncpy(asgard_mode_, heat_source_.enabled ? "advisory" : "disabled", sizeof(asgard_mode_) - 1);
  asgard_mode_[sizeof(asgard_mode_) - 1] = '\0';
  save_settings_();
  char escaped_host[128];
  char escaped_variable[96];
  json_escape_(heat_source_.host, escaped_host, sizeof(escaped_host));
  json_escape_(heat_source_.weighted_temperature_variable, escaped_variable, sizeof(escaped_variable));
  snprintf(response, capacity,
           "{\"result\":\"saved\",\"heat_source\":{\"enabled\":%s,\"host\":\"%s\",\"port\":%u,\"weighted_temperature_variable\":\"%s\",\"push_interval_s\":%u}}",
           heat_source_.enabled ? "true" : "false", escaped_host,
           static_cast<unsigned>(heat_source_.port), escaped_variable,
           static_cast<unsigned>(heat_source_.push_interval_s));
  give_state_lock_();
  log_event_("info", "heat_source", "heat source settings updated");
  return true;
}

bool LuneTouchCoordinator::request_heat_source_push(char *response, size_t capacity) {
  if (!take_state_lock_(100)) {
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"coordinator_busy\"}");
    return false;
  }
  if (!heat_source_.enabled || heat_source_.host[0] == '\0') {
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"heat_source_not_ready\"}");
    return false;
  }
  heat_source_push_requested_ = true;
  give_state_lock_();
  snprintf(response, capacity, "{\"result\":\"queued\"}");
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
    forecast_fetch_requested_ = false;
    give_state_lock_();
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"location_required\"}");
    return false;
  }
  if (!esphome::network::is_connected()) {
    std::strncpy(forecast_status_, "offline", sizeof(forecast_status_) - 1);
    forecast_status_[sizeof(forecast_status_) - 1] = '\0';
    std::strncpy(forecast_last_error_, "network_offline", sizeof(forecast_last_error_) - 1);
    forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
    forecast_fetch_requested_ = false;
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
      forecast_fetch_requested_ = false;
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
      forecast_fetch_requested_ = false;
      give_state_lock_();
    }
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"network_offline\"}");
    return false;
  }

  const int64_t fetch_epoch_s = current_epoch_s_();
  if (fetch_epoch_s == 0) {
    if (take_state_lock_(100)) {
      std::strncpy(forecast_status_, "time_unaligned", sizeof(forecast_status_) - 1);
      forecast_status_[sizeof(forecast_status_) - 1] = '\0';
      std::strncpy(forecast_last_error_, "time_unavailable", sizeof(forecast_last_error_) - 1);
      forecast_last_error_[sizeof(forecast_last_error_) - 1] = '\0';
      give_state_lock_();
    }
    snprintf(response, capacity, "{\"result\":\"rejected\",\"error\":\"time_unavailable\"}");
    return false;
  }

  char error[96]{};
  char provider_timezone[48]{};
  uint8_t hours = 0;
  ForecastHourState fetched_hours[72]{};
  float min_temp = 0.0f;
  float max_wind = 0.0f;
  float wind_dir = 0.0f;
  float max_solar = 0.0f;
  const bool ok = fetch_open_meteo_(latitude, longitude, error, sizeof(error),
                                    &hours, &min_temp, &max_wind, &wind_dir, &max_solar,
                                    provider_timezone, sizeof(provider_timezone), fetched_hours, 72);

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
      forecast_fetch_epoch_s_ = fetch_epoch_s;
      std::strncpy(forecast_provider_timezone_, provider_timezone,
                   sizeof(forecast_provider_timezone_) - 1);
      forecast_provider_timezone_[sizeof(forecast_provider_timezone_) - 1] = '\0';
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
  const char *authority_label = "No publisher";
  if (std::strcmp(authority_state_, "touch_normal") == 0) authority_label = "Touch normal";
  else if (std::strcmp(authority_state_, "touch_degraded") == 0) authority_label = "Touch degraded";
  else if (std::strcmp(authority_state_, "v6_fallback_pending") == 0) authority_label = "V6-A fallback pending";
  else if (std::strcmp(authority_state_, "v6_fallback_active") == 0) authority_label = "V6-A fallback active";
  else if (std::strcmp(authority_state_, "touch_recovery_pending") == 0) authority_label = "Recovery pending";
  else if (std::strcmp(authority_state_, "conflict") == 0) authority_label = "Conflict";
  char buffer[160];
  snprintf(buffer, sizeof(buffer), "%u zones · %u heating · %u/%u manifolds ready · %s%s",
           static_cast<unsigned>(model_.active_zone_count()),
           static_cast<unsigned>(model_.calling_zone_count()),
           static_cast<unsigned>(ready_trusted_nodes),
           static_cast<unsigned>(trusted_nodes),
           authority_label, stale_nodes > 0 ? " · stale connection" : "");
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
    snprintf(empty, sizeof(empty), "Zone %u   Waiting for V6",
             static_cast<unsigned>(row + 1));
    return empty;
  }

  const uint32_t now = esphome::millis();
  const auto *live = model_.zone_live(zone_index);
  const auto offset = ledger_.resolve_command_offset(zone->node_index, zone->zone_index, now);
  uint8_t day_index = 0;
  uint16_t minute_of_day = 0;
  const bool time_valid = current_schedule_time_(time_, &day_index, &minute_of_day);
  const auto effective = ::lune_touch::HouseModel::effective_comfort(*zone, time_valid,
                                                                     day_index, minute_of_day);
  const float learned_offset =
      ::lune_touch::HouseModel::learned_comfort_offset_c(*zone, live, effective.setpoint_c);
  ::lune_touch::TargetResolverInput target_input{};
  target_input.fallback_base_target_c = zone->comfort_setpoint_c;
  target_input.touch_target_c = effective.setpoint_c;
  target_input.command = offset;
  target_input.learned_modifier_c = learned_offset;
  target_input.learned_confident = learned_offset > 0.0f;
  const auto target = ::lune_touch::HouseModel::resolve_target(target_input);
  const float target_c = target.dispatch_target_c;
  const char *name = zone->room_name[0] != '\0' ? zone->room_name : zone->room_id;
  const char *status = live != nullptr && live->fresh ? live->status : "stale";
  char temp[16];
  if (live != nullptr && live->has_temperature)
    snprintf(temp, sizeof(temp), "%.1f C", live->temperature_c);
  else
    snprintf(temp, sizeof(temp), "--.- C");

  char command[32];
  if (target.manual_modifier_c > 0.01f || target.distribution_modifier_c > 0.01f)
    snprintf(command, sizeof(command), "%s +%.1f C", target.modifier_source,
             target.manual_modifier_c + target.distribution_modifier_c);
  else if (learned_offset > 0.01f)
    snprintf(command, sizeof(command), "learned +%.1f C", learned_offset);
  else
    snprintf(command, sizeof(command), "%s", effective.source);

  char buffer[128];
  snprintf(buffer, sizeof(buffer), "%-14.14s  %s   Target %.1f C   %-8.8s   %s",
           name, temp, target_c, status, command);
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::forecast_summary_text() const {
  if (!take_state_lock_(50))
    return "forecast busy";
  char buffer[112];
  const int64_t now_epoch_s = current_epoch_s_();
  const unsigned long fetch_age_min =
      forecast_fetch_epoch_s_ == 0 || now_epoch_s < forecast_fetch_epoch_s_
          ? 0UL
          : static_cast<unsigned long>((now_epoch_s - forecast_fetch_epoch_s_) / 60);
  snprintf(buffer, sizeof(buffer), "Forecast %s%s · %u hours · updated %lu min ago",
           forecast_status_, forecast_fetch_requested_ ? " pending" : "",
           static_cast<unsigned>(forecast_hours_count_),
           fetch_age_min);
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::forecast_decision_text(uint8_t row) const {
  if (!take_state_lock_(50))
    return "forecast decisions busy";
  char buffer[144];
  if (forecast_decision_count_ == 0) {
    snprintf(buffer, sizeof(buffer), "No active preload");
    give_state_lock_();
    return buffer;
  }

  size_t decision_index = row;
  if (decision_index >= forecast_decision_count_)
    decision_index = forecast_decision_count_ - 1;
  const auto &decision = forecast_decisions_[decision_index];
  const char *name = decision.room_name[0] != '\0' ? decision.room_name : decision.room_id;
  snprintf(buffer, sizeof(buffer), "%s · %s %+.1f C · peak in %d h",
           name, decision.active ? "preload" : "watching", decision.offset_c,
           static_cast<int>(decision.peak_in_h));
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::command_summary_text() const {
  if (!take_state_lock_(50))
    return "commands busy";
  const uint32_t now = esphome::millis();
  const auto *active = ledger_.latest_active(now, current_epoch_s_());
  if (active != nullptr) {
    const uint32_t remaining_s = active->expires_at_ms > now ? (active->expires_at_ms - now) / 1000UL : 0UL;
    const float accepted_display =
        active->result == ::lune_touch::CommandResult::ACCEPTED ? active->accepted_offset_c : active->requested_offset_c;
    char buffer[128];
    snprintf(buffer, sizeof(buffer), "%s V6 %u/Z%u %.1f->%.1f C %lum %s",
             active->source, static_cast<unsigned>(active->node_index + 1),
             static_cast<unsigned>(active->zone_index + 1), active->requested_offset_c,
             accepted_display, static_cast<unsigned long>((remaining_s + 59UL) / 60UL),
             active->clamp_applied ? "clamped" : ::lune_touch::command_result_name(active->result));
    give_state_lock_();
    return buffer;
  }
  const size_t accepted = ledger_.count_result(::lune_touch::CommandResult::ACCEPTED);
  const size_t failed = ledger_.count_result(::lune_touch::CommandResult::FAILED);
  const size_t rejected = ledger_.count_result(::lune_touch::CommandResult::REJECTED);
  const size_t blocked = ledger_.count_blocked();
  const size_t clamped = ledger_.count_clamped();
  char buffer[96];
  snprintf(buffer, sizeof(buffer), "%u accepted / %u blocked / %u clamped / %u failed / %u rejected",
           static_cast<unsigned>(accepted),
           static_cast<unsigned>(blocked),
           static_cast<unsigned>(clamped),
           static_cast<unsigned>(failed),
           static_cast<unsigned>(rejected));
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::heating_summary_text() const {
  if (!take_state_lock_(50))
    return "heating state busy";
  const auto operation_mode = odin_plan::to_operation_mode(odin_plan_.current_operation_mode_raw);
  const char *mode = odin_plan::operation_mode_name(operation_mode);
  char buffer[144];
  snprintf(buffer, sizeof(buffer), "Heat source %s / Plan %s / %s",
           heat_source_.enabled ? heat_source_.last_status : "disabled",
           odin_plan_.available ? mode : "plan unavailable",
           odin_plan_.available && operation_mode == odin_plan::OperationMode::DHW_ON ? "DHW active" : "DHW unknown");
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::alarm_summary_text() const {
  if (!take_state_lock_(50))
    return "alarms busy";
  size_t motor_faults = 0;
  for (size_t i = 0; i < model_.node_count(); i++) {
    if (node_telemetry_[i].has_motor_fault && node_telemetry_[i].motor_fault)
      motor_faults++;
  }
  char buffer[112];
  if (std::strcmp(authority_state_, "conflict") == 0)
    snprintf(buffer, sizeof(buffer), "Alarm: authority conflict");
  else if (motor_faults > 0)
    snprintf(buffer, sizeof(buffer), "Alarm: %u motor fault%s", static_cast<unsigned>(motor_faults), motor_faults == 1 ? "" : "s");
  else if (poll_fail_count_ > 0)
    snprintf(buffer, sizeof(buffer), "Warning: %lu poll failures", static_cast<unsigned long>(poll_fail_count_));
  else
    snprintf(buffer, sizeof(buffer), "No active alarms");
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::display_refresh_token() const {
  if (!take_state_lock_(50))
    return display_refresh_token_cache_;

  uint32_t hash = 2166136261UL;
  hash = display_hash_text_(hash, authority_state_);
  hash = display_hash_text_(hash, forecast_status_);
  hash = display_hash_float_(hash, forecast_min_temp_c_);
  hash = display_hash_float_(hash, forecast_max_wind_ms_);
  hash = display_hash_mix_(hash, static_cast<uint32_t>(forecast_decision_count_));
  if (forecast_decision_count_ > 0) {
    const auto &decision = forecast_decisions_[0];
    hash = display_hash_text_(hash, decision.room_name);
    hash = display_hash_float_(hash, decision.offset_c);
    hash = display_hash_mix_(hash, static_cast<uint32_t>(decision.peak_in_h));
  }
  hash = display_hash_mix_(hash, heat_source_.enabled ? 1U : 0U);
  hash = display_hash_mix_(hash, heat_source_.has_last_push ? 1U : 0U);
  hash = display_hash_mix_(hash, heat_source_.failure_streak);
  hash = display_hash_text_(hash, heat_source_.last_status);
  hash = display_hash_float_(hash, heat_source_.last_requested_value_c);
  hash = display_hash_float_(hash, heat_source_.last_confirmed_value_c);

  // The local panel renders four manifolds. Changes on additional registered
  // nodes belong in the browser and must not wake the physical display.
  const size_t visible_node_count = std::min<size_t>(4, model_.node_count());
  const uint8_t display_page_count = std::max<uint8_t>(1, static_cast<uint8_t>((visible_node_count + 1) / 2));
  hash = display_hash_mix_(hash, std::min<uint8_t>(display_manifold_page_, display_page_count - 1));
  for (size_t node_index = 0; node_index < visible_node_count; node_index++) {
    const auto *node = model_.node(node_index);
    if (node == nullptr)
      continue;
    hash = display_hash_text_(hash, node->node_id);
    hash = display_hash_text_(hash, node->name);
    hash = display_hash_mix_(hash, node->reachable ? 1U : 0U);
    hash = display_hash_mix_(hash, model_.is_node_stale(node_index, esphome::millis()) ? 1U : 0U);
    const auto &telemetry = node_telemetry_[node_index];
    hash = display_hash_float_(hash, telemetry.has_flow ? telemetry.flow_c : NAN);
    hash = display_hash_float_(hash, telemetry.has_return ? telemetry.return_c : NAN);
    hash = display_hash_mix_(hash, telemetry.has_motor_fault && telemetry.motor_fault ? 1U : 0U);
  }
  for (size_t zone_index = 0; zone_index < model_.zone_count(); zone_index++) {
    const auto *zone = model_.zone(zone_index);
    const auto *live = model_.zone_live(zone_index);
    if (zone == nullptr || zone->node_index >= visible_node_count)
      continue;
    hash = display_hash_mix_(hash, zone->node_index);
    hash = display_hash_mix_(hash, zone->zone_index);
    hash = display_hash_mix_(hash, zone->enabled ? 1U : 0U);
    hash = display_hash_text_(hash, zone->room_name);
    hash = display_hash_float_(hash, zone->comfort_setpoint_c);
    if (live != nullptr) {
      hash = display_hash_float_(hash, live->has_temperature ? live->temperature_c : NAN);
      hash = display_hash_float_(hash, live->has_setpoint ? live->setpoint_c : NAN);
      // The panel shows valve demand in five 20% steps. Hash the rendered
      // level rather than every fractional motor report to avoid no-op redraw
      // passes while a valve moves within the same visible interval.
      const uint32_t valve_level = !live->has_valve || !std::isfinite(live->valve_pct)
                                       ? 0xFFFFFFFFUL
                                       : (live->valve_pct <= 0.0f
                                              ? 0U
                                              : static_cast<uint32_t>(std::min(5, (static_cast<int>(live->valve_pct) + 19) / 20)));
      hash = display_hash_mix_(hash, valve_level);
      hash = display_hash_text_(hash, live->status);
      hash = display_hash_mix_(hash, live->fresh ? 1U : 0U);
    }
  }

  give_state_lock_();

  char token[16];
  snprintf(token, sizeof(token), "%08lx", static_cast<unsigned long>(hash));
  std::strncpy(display_refresh_token_cache_, token, sizeof(display_refresh_token_cache_) - 1);
  display_refresh_token_cache_[sizeof(display_refresh_token_cache_) - 1] = '\0';
  return token;
}

std::string LuneTouchCoordinator::display_header_text() const {
  if (!take_state_lock_(50))
    return "Status unavailable";
  const auto strategy = model_.strategy_snapshot();
  size_t ready_nodes = 0;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node != nullptr && node->reachable && !model_.is_node_stale(i, esphome::millis()))
      ready_nodes++;
  }
  char buffer[112];
  if (strategy.has_physical_temperature) {
    snprintf(buffer, sizeof(buffer), "%s %.1f C  |  %u heating  |  %u/%u manifolds", DISPLAY_ICON_OK,
             strategy.physical_temperature_c,
             static_cast<unsigned>(model_.calling_zone_count()),
             static_cast<unsigned>(ready_nodes),
             static_cast<unsigned>(model_.node_count()));
  } else if (model_.node_count() > 0) {
    snprintf(buffer, sizeof(buffer), "%s --.- C  |  %u heating  |  %u/%u manifolds", DISPLAY_ICON_WARNING,
             static_cast<unsigned>(model_.calling_zone_count()),
             static_cast<unsigned>(ready_nodes),
             static_cast<unsigned>(model_.node_count()));
  } else {
    snprintf(buffer, sizeof(buffer), "Waiting for manifolds");
  }
  give_state_lock_();
  return buffer;
}

bool LuneTouchCoordinator::display_manifold_visible(uint8_t node_index) const {
  if (!take_state_lock_(50))
    return false;
  const bool visible = node_index < model_.node_count() && model_.node(node_index) != nullptr;
  give_state_lock_();
  return visible;
}

uint8_t LuneTouchCoordinator::display_zone_mask(uint8_t node_index) const {
  if (!take_state_lock_(50))
    return 0;
  const auto *node = model_.node(node_index);
  // Every V6 owns six physical outputs. The Touch panel mirrors all six and
  // never derives its topology from optional room bindings.
  const uint8_t mask = node == nullptr ? 0 : 0x3F;
  give_state_lock_();
  return mask;
}

uint8_t LuneTouchCoordinator::display_manifold_page_count() const {
  if (!take_state_lock_(50))
    return 1;
  const size_t visible_node_count = std::min<size_t>(4, model_.node_count());
  const uint8_t count = std::max<uint8_t>(1, static_cast<uint8_t>((visible_node_count + 1) / 2));
  give_state_lock_();
  return count;
}

uint8_t LuneTouchCoordinator::display_manifold_page() const {
  if (!take_state_lock_(50))
    return 0;
  const size_t visible_node_count = std::min<size_t>(4, model_.node_count());
  const uint8_t count = std::max<uint8_t>(1, static_cast<uint8_t>((visible_node_count + 1) / 2));
  const uint8_t page = std::min<uint8_t>(display_manifold_page_, count - 1);
  give_state_lock_();
  return page;
}

bool LuneTouchCoordinator::display_set_manifold_page(uint8_t page) {
  if (!take_state_lock_(50))
    return false;
  const size_t visible_node_count = std::min<size_t>(4, model_.node_count());
  const uint8_t count = std::max<uint8_t>(1, static_cast<uint8_t>((visible_node_count + 1) / 2));
  if (page >= count || page == display_manifold_page_) {
    give_state_lock_();
    return false;
  }
  display_manifold_page_ = page;
  give_state_lock_();
  return true;
}

std::string LuneTouchCoordinator::display_manifold_text(uint8_t node_index) const {
  if (!take_state_lock_(50))
    return "Manifold busy";
  const auto *node = model_.node(node_index);
  if (node == nullptr) {
    give_state_lock_();
    return "Not connected";
  }

  size_t heating = 0;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone == nullptr || !zone->enabled || zone->node_index != node_index)
      continue;
    if (live != nullptr && (std::strcmp(live->status, "heat") == 0 ||
                            std::strcmp(live->status, "call") == 0 ||
                            std::strcmp(live->status, "preheat") == 0))
      heating++;
  }

  const auto &telemetry = node_telemetry_[node_index];
  char flow[16] = "--.- C";
  char ret[16] = "--.- C";
  if (telemetry.has_flow)
    snprintf(flow, sizeof(flow), "%.1f C", telemetry.flow_c);
  if (telemetry.has_return)
    snprintf(ret, sizeof(ret), "%.1f C", telemetry.return_c);
  const bool stale = model_.is_node_stale(node_index, esphome::millis());
  const char *state = !node->reachable || stale ? "Offline" : heating > 0 ? "Heating" : "Ready";
  const char *state_icon = !node->reachable || stale ? DISPLAY_ICON_WARNING : DISPLAY_ICON_OK;
  const char *name = node->name[0] != '\0' ? node->name : node->node_id;
  char buffer[144];
  snprintf(buffer, sizeof(buffer), "%.17s\n%s %s\n%s %s  %s %s", name, state_icon, state,
           DISPLAY_ICON_UP, flow, DISPLAY_ICON_DOWN, ret);
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::display_zone_cell_text(uint8_t node_index, uint8_t physical_zone_index) const {
  if (!take_state_lock_(50))
    return "Zone busy";
  const auto *node = model_.node(node_index);
  if (node == nullptr) {
    give_state_lock_();
    return "";
  }

  const ::lune_touch::ZoneBinding *binding = nullptr;
  const ::lune_touch::ZoneLiveState *live = nullptr;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate != nullptr && candidate->enabled && candidate->node_index == node_index &&
        candidate->zone_index == physical_zone_index) {
      binding = candidate;
      live = model_.zone_live(i);
      break;
    }
  }

  char buffer[112];
  if (binding == nullptr) {
    snprintf(buffer, sizeof(buffer), "Waiting\n%s --.- C\n%s --.- C", DISPLAY_ICON_WARNING,
             DISPLAY_ICON_RIGHT);
    give_state_lock_();
    return buffer;
  }

  const char *name = binding->room_name[0] != '\0' ? binding->room_name : binding->room_id;
  char temperature[16] = "--.- C";
  if (live != nullptr && live->has_temperature)
    snprintf(temperature, sizeof(temperature), "%.1f C", live->temperature_c);

  char setpoint[16] = "--.- C";
  if (live != nullptr && live->has_setpoint)
    snprintf(setpoint, sizeof(setpoint), "%.1f C", live->setpoint_c);
  else if (std::isfinite(binding->comfort_setpoint_c))
    snprintf(setpoint, sizeof(setpoint), "%.1f C", binding->comfort_setpoint_c);
  snprintf(buffer, sizeof(buffer), "%.12s\n%s %s\n%s %s", name, DISPLAY_ICON_OK, temperature,
           DISPLAY_ICON_RIGHT, setpoint);
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::display_zone_name_text(uint8_t node_index,
                                                          uint8_t physical_zone_index) const {
  if (!take_state_lock_(50))
    return "Zone";
  const ::lune_touch::ZoneBinding *binding = nullptr;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate != nullptr && candidate->enabled && candidate->node_index == node_index &&
        candidate->zone_index == physical_zone_index) {
      binding = candidate;
      break;
    }
  }
  char buffer[40];
  if (binding == nullptr) {
    std::snprintf(buffer, sizeof(buffer), "Zone %u",
                  static_cast<unsigned>(physical_zone_index + 1));
  } else {
    const char *name = binding->room_name[0] != '\0' ? binding->room_name : binding->room_id;
    std::snprintf(buffer, sizeof(buffer), "%.13s", name);
  }
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::display_zone_temperature_text(
    uint8_t node_index, uint8_t physical_zone_index) const {
  if (!take_state_lock_(50))
    return "--.- C";
  char buffer[20] = "--.- C";
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone == nullptr || live == nullptr || !zone->enabled || zone->node_index != node_index ||
        zone->zone_index != physical_zone_index)
      continue;
    if (live->has_temperature)
      std::snprintf(buffer, sizeof(buffer), "%.1f C", live->temperature_c);
    break;
  }
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::display_zone_setpoint_text(
    uint8_t node_index, uint8_t physical_zone_index) const {
  if (!take_state_lock_(50))
    return "--.- C";
  char buffer[20] = "--.- C";
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone == nullptr || !zone->enabled || zone->node_index != node_index ||
        zone->zone_index != physical_zone_index)
      continue;
    if (live != nullptr && live->has_setpoint)
      std::snprintf(buffer, sizeof(buffer), "%.1f C", live->setpoint_c);
    else if (std::isfinite(zone->comfort_setpoint_c))
      std::snprintf(buffer, sizeof(buffer), "%.1f C", zone->comfort_setpoint_c);
    break;
  }
  give_state_lock_();
  return buffer;
}

uint8_t LuneTouchCoordinator::display_zone_valve_pct(uint8_t node_index, uint8_t physical_zone_index) const {
  if (!take_state_lock_(50))
    return 0;
  uint8_t result = 0;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    if (zone == nullptr || live == nullptr || !zone->enabled || zone->node_index != node_index ||
        zone->zone_index != physical_zone_index || !live->has_valve)
      continue;
    result = static_cast<uint8_t>(std::lround(std::max(0.0f, std::min(100.0f, live->valve_pct))));
    break;
  }
  give_state_lock_();
  return result;
}

uint32_t LuneTouchCoordinator::display_zone_status_color(uint8_t node_index,
                                                         uint8_t physical_zone_index) const {
  if (!take_state_lock_(50))
    return 0x8E8E8E;
  const auto *node = model_.node(node_index);
  if (node == nullptr || !node->reachable || model_.is_node_stale(node_index, esphome::millis())) {
    give_state_lock_();
    return 0x8E8E8E;
  }
  if (node_index < ::lune_touch::MAX_NODES && node_telemetry_[node_index].has_motor_fault &&
      node_telemetry_[node_index].motor_fault) {
    give_state_lock_();
    return 0xFF453A;
  }
  const ::lune_touch::ZoneLiveState *live = nullptr;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *zone = model_.zone(i);
    if (zone != nullptr && zone->enabled && zone->node_index == node_index &&
        zone->zone_index == physical_zone_index) {
      live = model_.zone_live(i);
      break;
    }
  }
  uint32_t color = 0x8E8E8E;
  if (live == nullptr || !live->fresh)
    color = live == nullptr ? 0x8E8E8E : 0xFF453A;
  else if (std::strcmp(live->status, "fault") == 0)
    color = 0xFF453A;
  else if (std::strcmp(live->status, "heat") == 0 || std::strcmp(live->status, "call") == 0 ||
           std::strcmp(live->status, "preheat") == 0)
    color = 0xFF9F0A;
  else
    color = 0x32D74B;
  give_state_lock_();
  return color;
}

std::string LuneTouchCoordinator::display_heat_source_text() const {
  if (!take_state_lock_(50))
    return "Heat source busy";
  const HeatSourceState source = heat_source_;
  give_state_lock_();

  char signal[16] = "--.- C";
  char confirmed[16] = "--.- C";
  if (std::isfinite(source.last_requested_value_c))
    snprintf(signal, sizeof(signal), "%.1f C", source.last_requested_value_c);
  if (std::isfinite(source.last_confirmed_value_c))
    snprintf(confirmed, sizeof(confirmed), "%.1f C", source.last_confirmed_value_c);
  const bool healthy = source.enabled && source.has_last_push && source.failure_streak == 0;
  const char *state = !source.enabled ? "Off" : healthy ? "On" : "Needs attention";
  const char *state_icon = !source.enabled ? DISPLAY_ICON_CLOSE : healthy ? DISPLAY_ICON_OK : DISPLAY_ICON_WARNING;
  char buffer[128];
  snprintf(buffer, sizeof(buffer), "%s %s | sent %s | confirmed %s", state_icon, state, signal, confirmed);
  return buffer;
}

std::string LuneTouchCoordinator::display_forecast_text() const {
  if (!take_state_lock_(50))
    return "Forecast busy";
  char decision[80] = "No preload";
  if (forecast_decision_count_ > 0) {
    const auto &item = forecast_decisions_[0];
    const char *name = item.room_name[0] != '\0' ? item.room_name : item.room_id;
    snprintf(decision, sizeof(decision), "%.18s  %+.1f C | %d h", name, item.offset_c,
             static_cast<int>(item.peak_in_h));
  }
  char buffer[128];
  snprintf(buffer, sizeof(buffer), "%s %.1f C | %s %.1f m/s | %s", DISPLAY_ICON_DOWN,
           forecast_min_temp_c_, DISPLAY_ICON_WIND, forecast_max_wind_ms_, decision);
  give_state_lock_();
  return buffer;
}

bool LuneTouchCoordinator::display_problem_visible() const {
  if (!take_state_lock_(50))
    return false;
  bool visible = std::strcmp(authority_state_, "conflict") == 0 ||
                 (heat_source_.enabled && heat_source_.failure_streak > 0);
  for (size_t node_index = 0; !visible && node_index < model_.node_count(); node_index++) {
    const auto *node = model_.node(node_index);
    const auto &telemetry = node_telemetry_[node_index];
    visible = node == nullptr || !node->reachable || model_.is_node_stale(node_index, esphome::millis()) ||
              (telemetry.has_motor_fault && telemetry.motor_fault);
  }
  for (size_t zone_index = 0; !visible && zone_index < model_.zone_count(); zone_index++) {
    const auto *zone = model_.zone(zone_index);
    const auto *live = model_.zone_live(zone_index);
    visible = zone != nullptr && zone->enabled &&
              (live == nullptr || !live->fresh || std::strcmp(live->status, "fault") == 0);
  }
  give_state_lock_();
  return visible;
}

std::string LuneTouchCoordinator::display_problem_text() const {
  if (!take_state_lock_(50))
    return "Status unavailable";
  size_t offline_nodes = 0;
  size_t motor_faults = 0;
  size_t stale_zones = 0;
  for (size_t node_index = 0; node_index < model_.node_count(); node_index++) {
    const auto *node = model_.node(node_index);
    if (node == nullptr || !node->reachable || model_.is_node_stale(node_index, esphome::millis()))
      offline_nodes++;
    const auto &telemetry = node_telemetry_[node_index];
    if (telemetry.has_motor_fault && telemetry.motor_fault)
      motor_faults++;
  }
  for (size_t zone_index = 0; zone_index < model_.zone_count(); zone_index++) {
    const auto *zone = model_.zone(zone_index);
    const auto *live = model_.zone_live(zone_index);
    if (zone != nullptr && zone->enabled &&
        (live == nullptr || !live->fresh || std::strcmp(live->status, "fault") == 0))
      stale_zones++;
  }
  char buffer[160];
  if (std::strcmp(authority_state_, "conflict") == 0)
    snprintf(buffer, sizeof(buffer), "%s Control conflict | open Diagnostics in the web interface",
             DISPLAY_ICON_WARNING);
  else if (motor_faults > 0)
    snprintf(buffer, sizeof(buffer), "%s %u motor fault%s | check the affected manifold",
             DISPLAY_ICON_WARNING, static_cast<unsigned>(motor_faults), motor_faults == 1 ? "" : "s");
  else if (offline_nodes > 0)
    snprintf(buffer, sizeof(buffer), "%s %u manifold%s offline | heating continues locally",
             DISPLAY_ICON_WARNING, static_cast<unsigned>(offline_nodes), offline_nodes == 1 ? "" : "s");
  else if (heat_source_.enabled && heat_source_.failure_streak > 0)
    snprintf(buffer, sizeof(buffer), "%s Heat source connection needs attention", DISPLAY_ICON_WARNING);
  else if (stale_zones > 0)
    snprintf(buffer, sizeof(buffer), "%s %u zone sensor%s need attention", DISPLAY_ICON_WARNING,
             static_cast<unsigned>(stale_zones), stale_zones == 1 ? "" : "s");
  else
    buffer[0] = '\0';
  give_state_lock_();
  return buffer;
}

std::string LuneTouchCoordinator::display_selected_room_text() const {
  if (!take_state_lock_(50))
    return "Zone data busy";
  const ::lune_touch::ZoneBinding *selected = nullptr;
  size_t selected_index = 0;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate != nullptr && candidate->enabled &&
        candidate->node_index == display_selected_node_index_ &&
        candidate->zone_index == display_selected_zone_index_) {
      selected = candidate;
      selected_index = i;
      break;
    }
  }
  if (selected == nullptr) {
    give_state_lock_();
    return "Select a zone";
  }

  uint8_t day_index = 0;
  uint16_t minute_of_day = 0;
  const bool time_valid = current_schedule_time_(time_, &day_index, &minute_of_day);
  const auto effective = ::lune_touch::HouseModel::effective_comfort(
      *selected, time_valid, day_index, minute_of_day);
  const auto *live = model_.zone_live(selected_index);
  const char *name = selected->room_name[0] != '\0' ? selected->room_name : selected->room_id;
  const char *status = live != nullptr && live->fresh ? live->status : "sensor unavailable";
  char temperature[16];
  if (live != nullptr && live->has_temperature)
    snprintf(temperature, sizeof(temperature), "%.1f C", live->temperature_c);
  else
    snprintf(temperature, sizeof(temperature), "--.- C");
  char buffer[128];
  snprintf(buffer, sizeof(buffer), "%s  %s  Target %.1f C  %s",
           name, temperature, effective.setpoint_c, status);
  give_state_lock_();
  return buffer;
}

bool LuneTouchCoordinator::display_select_zone(uint8_t node_index, uint8_t physical_zone_index) {
  if (!take_state_lock_(50))
    return false;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate == nullptr || !candidate->enabled || candidate->node_index != node_index ||
        candidate->zone_index != physical_zone_index)
      continue;
    display_selected_node_index_ = node_index;
    display_selected_zone_index_ = physical_zone_index;
    give_state_lock_();
    return true;
  }
  give_state_lock_();
  return false;
}

bool LuneTouchCoordinator::display_select_room(uint8_t row) {
  if (!take_state_lock_(50))
    return false;
  size_t active_count = 0;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate == nullptr || !candidate->enabled)
      continue;
    if (active_count == row) {
      display_selected_node_index_ = candidate->node_index;
      display_selected_zone_index_ = candidate->zone_index;
      give_state_lock_();
      return true;
    }
    active_count++;
  }
  give_state_lock_();
  return false;
}

bool LuneTouchCoordinator::display_adjust_primary_target(float delta_c) {
  if (!std::isfinite(delta_c) || !take_state_lock_(100))
    return false;
  const ::lune_touch::ZoneBinding *binding = nullptr;
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate != nullptr && candidate->enabled &&
        candidate->node_index == display_selected_node_index_ &&
        candidate->zone_index == display_selected_zone_index_) {
      binding = candidate;
      break;
    }
  }
  if (binding == nullptr) {
    give_state_lock_();
    return false;
  }
  char room_id[sizeof(binding->room_id)]{};
  std::strncpy(room_id, binding->room_id, sizeof(room_id) - 1);
  const float setpoint = binding->comfort_setpoint_c + delta_c;
  const uint8_t priority = binding->priority;
  const float bias = binding->comfort_bias_c;
  give_state_lock_();
  char response[192]{};
  return set_zone_comfort(room_id, setpoint, priority, bias, response, sizeof(response));
}

bool LuneTouchCoordinator::display_boost_primary_room() {
  if (!take_state_lock_(100))
    return false;
  char room_id[32]{};
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate != nullptr && candidate->enabled &&
        candidate->node_index == display_selected_node_index_ &&
        candidate->zone_index == display_selected_zone_index_) {
      std::strncpy(room_id, candidate->room_id, sizeof(room_id) - 1);
      break;
    }
  }
  give_state_lock_();
  if (room_id[0] == '\0')
    return false;
  char response[320]{};
  return queue_setpoint_command(room_id, 0.5f, 2700, "local display boost", response, sizeof(response));
}

bool LuneTouchCoordinator::display_away_primary_room() {
  if (!take_state_lock_(100))
    return false;
  char room_id[32]{};
  for (size_t i = 0; i < model_.zone_count(); i++) {
    const auto *candidate = model_.zone(i);
    if (candidate != nullptr && candidate->enabled &&
        candidate->node_index == display_selected_node_index_ &&
        candidate->zone_index == display_selected_zone_index_) {
      std::strncpy(room_id, candidate->room_id, sizeof(room_id) - 1);
      break;
    }
  }
  give_state_lock_();
  if (room_id[0] == '\0')
    return false;
  char response[320]{};
  return queue_setpoint_command(room_id, -2.0f, 21600, "local display away", response, sizeof(response));
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
  appendf_(buffer, capacity, off, "{\"poll_generation\":%lu,\"nodes\":[",
           static_cast<unsigned long>(poll_generation_));
  bool first = true;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    char success_host[96];
    char failure[112];
    char pairing_fingerprint[48];
    char node_id_esc[48];
    char node_name_esc[80];
    char hostname_esc[96];
    char ip_esc[48];
    char model_esc[40];
    char firmware_esc[48];
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
    json_escape_(node->node_id, node_id_esc, sizeof(node_id_esc));
    json_escape_(node->name[0] != '\0' ? node->name : node->node_id, node_name_esc, sizeof(node_name_esc));
    json_escape_(node->hostname, hostname_esc, sizeof(hostname_esc));
    json_escape_(node->fallback_ip, ip_esc, sizeof(ip_esc));
    json_escape_(node->model, model_esc, sizeof(model_esc));
    json_escape_(node->firmware, firmware_esc, sizeof(firmware_esc));
    if (!appendf_(buffer, capacity, off,
                  "%s{\"id\":\"%s\",\"name\":\"%s\",\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\","
                  "\"firmware\":\"%s\",\"reachable\":%s,\"trust\":%u,\"trust_label\":\"%s\","
                  "\"pairing_fingerprint\":\"%s\",\"last_seen_ms\":%lu,"
                  "\"last_success_host\":\"%s\",\"last_failure\":\"%s\","
                  "\"health\":{\"imported_zones\":%u,\"mapped_zones\":%u,\"fresh_zones\":%u,\"stale_zones\":%u,"
                  "\"calling_zones\":%u,\"avg_temp_c\":%s,\"avg_setpoint_c\":%s},"
                  "\"runtime\":{\"active_zones\":%u,\"avg_valve_pct\":%s,"
                  "\"flow_c\":%s,\"return_c\":%s,\"drivers_enabled\":%s,"
                  "\"motor_fault\":%s,\"motor_current_ma\":%s}}",
                  first ? "" : ",", node_id_esc, node_name_esc, hostname_esc, ip_esc, model_esc,
                  firmware_esc, node->reachable ? "true" : "false",
                  static_cast<unsigned>(node->trust), ::lune_touch::node_trust_name(node->trust),
                  pairing_fingerprint,
                  static_cast<unsigned long>(node->last_seen_ms),
                  success_host, failure,
                  static_cast<unsigned>(mapped_zones),
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
           "\"poll_generation\":%lu,\"poll_pending\":%s,"
           "\"found\":[",
           static_cast<unsigned long>(poll_generation_),
           node_refresh_requested_ ? "true" : "false");
  // The scan endpoint only queues work. Keep the response fast and expose
  // the generation the UI should wait beyond before fetching names.
  // The pending flag is conservative because the coordinator may consume the
  // notification immediately after the response starts being assembled.
  bool first = true;
  for (size_t i = 0; i < model_.node_count(); i++) {
    const auto *node = model_.node(i);
    if (node == nullptr)
      continue;
    const bool stale = model_.is_node_stale(i, now);
    char pairing_fingerprint[48];
    char node_id_esc[48];
    char node_name_esc[80];
    char hostname_esc[96];
    char ip_esc[48];
    char model_esc[40];
    char firmware_esc[48];
    json_escape_(node->pairing_fingerprint, pairing_fingerprint, sizeof(pairing_fingerprint));
    json_escape_(node->node_id, node_id_esc, sizeof(node_id_esc));
    json_escape_(node->name[0] != '\0' ? node->name : node->node_id, node_name_esc, sizeof(node_name_esc));
    json_escape_(node->hostname, hostname_esc, sizeof(hostname_esc));
    json_escape_(node->fallback_ip, ip_esc, sizeof(ip_esc));
    json_escape_(node->model, model_esc, sizeof(model_esc));
    json_escape_(node->firmware, firmware_esc, sizeof(firmware_esc));
    if (!appendf_(buffer, capacity, off,
                  "%s{\"id\":\"%s\",\"name\":\"%s\",\"hostname\":\"%s\",\"ip\":\"%s\",\"model\":\"%s\","
                  "\"firmware\":\"%s\",\"pairing_fingerprint\":\"%s\","
                  "\"reachable\":%s,\"stale\":%s,\"source\":\"known_node\"}",
                  first ? "" : ",", node_id_esc, node_name_esc, hostname_esc, ip_esc,
                  model_esc, firmware_esc, pairing_fingerprint,
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
  appendf_(buffer, capacity, off, "{\"count\":%u,\"rooms\":[", static_cast<unsigned>(model_.room_count()));
  for (size_t room_index = 0; room_index < model_.room_count(); room_index++) {
    const auto *room = model_.room(room_index);
    if (room == nullptr || !room->enabled)
      continue;
    ::lune_touch::ResolvedRoomLoop room_loops[::lune_touch::MAX_HOUSE_ZONES]{};
    const size_t loop_count = model_.resolve_room_loops(room->room_id, room_loops,
                                                         ::lune_touch::MAX_HOUSE_ZONES);
    appendf_(buffer, capacity, off, "%s{\"room_id\":\"%s\",\"name\":\"%s\","
             "\"loop_count\":%u,\"area_m2\":%.1f,\"include_in_house_temperature\":%s}",
             room_index == 0 ? "" : ",", room->room_id, room->room_name,
             static_cast<unsigned>(loop_count), room->total_area_m2,
             room->include_in_house_temperature ? "true" : "false");
  }
  appendf_(buffer, capacity, off, "],\"zones\":[");
  bool first = true;
  for (size_t i = 0; i < model_.zone_count() && i < 18; i++) {
    const auto *zone = model_.zone(i);
    const auto *live = model_.zone_live(i);
    const auto *history = model_.zone_history(i);
    const auto *room = model_.room_by_id(zone != nullptr ? zone->room_id : "");
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
    char room_id_esc[48];
    char room_name_esc[80];
    char status_esc[32];
    json_escape_(zone->room_id, room_id_esc, sizeof(room_id_esc));
    json_escape_(zone->room_name, room_name_esc, sizeof(room_name_esc));
    json_escape_(status, status_esc, sizeof(status_esc));
    const auto effective = ::lune_touch::HouseModel::effective_comfort(*zone, time_valid,
                                                                       day_index, minute_of_day);
    const uint32_t now_ms = esphome::millis();
    const auto command_resolution =
        ledger_.resolve_command_offset(zone->node_index, zone->zone_index, now_ms);
    const float learned_offset_c =
        ::lune_touch::HouseModel::learned_comfort_offset_c(*zone, live, effective.setpoint_c);
    ::lune_touch::TargetResolverInput target_input{};
    target_input.fallback_base_target_c = zone->comfort_setpoint_c;
    target_input.touch_target_c = effective.setpoint_c;
    target_input.command = command_resolution;
    target_input.learned_modifier_c = learned_offset_c;
    target_input.learned_confident = learned_offset_c > 0.0f;
    const auto target = ::lune_touch::HouseModel::resolve_target(target_input);
    const float resolved_target_c = target.dispatch_target_c;
    const float thermal_confidence = zone->thermal_samples >= 24 ? 1.0f :
        static_cast<float>(zone->thermal_samples) / 24.0f;
    const uint8_t learned_thermal_lead_h = ::lune_touch::HouseModel::learned_thermal_lead_h(*zone);
    const uint8_t active_thermal_lead_h = ::lune_touch::HouseModel::active_thermal_lead_h(*zone);
    if (!appendf_(buffer, capacity, off,
                  "%s{\"room_id\":\"%s\",\"name\":\"%s\",\"name_source\":\"%s\","
                  "\"node_index\":%u,\"zone_index\":%u,"
                  "\"room\":{\"revision\":%lu,\"total_area_m2\":%.2f,\"physical_weight\":%.2f,\"include_in_house_temperature\":%s},"
                  "\"temperature_c\":%s,\"setpoint_c\":%s,\"status\":\"%s\",\"fresh\":%s,"
                  "\"valve_pct\":%s,\"updated_at_ms\":%lu,\"comfort\":{\"setpoint_c\":%.1f,"
                  "\"bias_c\":%.1f,\"effective_setpoint_c\":%.1f,\"effective_source\":\"%s\","
                  "\"schedule_active\":%s,\"time_valid\":%s,\"priority\":%u},"
                  "\"resolver\":{\"fallback_base_target_c\":%.1f,\"touch_available\":%s,"
                  "\"base_setpoint_c\":%.1f,\"base_source\":\"%s\","
                  "\"manual_offset_c\":%.2f,\"forecast_offset_c\":%.2f,"
                  "\"learned_offset_c\":%.2f,\"command_offset_c\":%.2f,"
                  "\"command_source\":\"%s\",\"pre_v6_target_c\":%.1f,"
                  "\"target_setpoint_c\":%.1f},"
                  "\"schedule\":{\"enabled\":%s,\"day_mask\":%u,\"start_min\":%u,"
                  "\"end_min\":%u,\"setpoint_c\":%.1f},"
                  "\"history\":{\"samples\":%lu,\"calling_samples\":%lu,"
                  "\"avg_temp_c\":%s,\"min_temp_c\":%s,\"max_temp_c\":%s,"
                  "\"last_delta_c_per_h\":%s},"
                  "\"thermal_model\":{\"samples\":%u,\"heat_gain_c_per_h\":%.3f,"
                  "\"cool_loss_c_per_h\":%.3f,\"confidence\":%.2f},"
                  "\"forecast\":{\"exterior_walls\":%u,"
                  "\"wind_exposure\":%.2f,\"solar_gain\":%.2f,\"thermal_lead_h\":%u,"
                  "\"learned_thermal_lead_h\":%u,\"active_thermal_lead_h\":%u,"
                  "\"max_offset_c\":%.2f}}",
                  first ? "" : ",", room_id_esc, room_name_esc,
                  zone_name_source_name_(zone->name_source),
                  static_cast<unsigned>(zone->node_index), static_cast<unsigned>(zone->zone_index),
                  static_cast<unsigned long>(model_.room_revision(zone->room_id)),
                  room != nullptr ? room->total_area_m2 : 0.0f,
                  room != nullptr ? room->physical_weight : 0.0f,
                  room != nullptr && room->include_in_house_temperature ? "true" : "false",
                  temp_buf, sp_buf, status_esc, live != nullptr && live->fresh && zone->enabled ? "true" : "false",
                  valve_buf,
                  static_cast<unsigned long>(live != nullptr ? live->updated_at_ms : 0),
                  zone->comfort_setpoint_c, zone->comfort_bias_c,
                  effective.setpoint_c,
                  effective.source,
                  effective.schedule_active ? "true" : "false",
                  effective.time_valid ? "true" : "false",
                  static_cast<unsigned>(zone->priority),
                  target.fallback_base_target_c, target.touch_available ? "true" : "false",
                  target.base_target_c, target.base_source,
                  target.manual_modifier_c, target.distribution_modifier_c,
                  target.learned_modifier_c,
                  target.manual_modifier_c + target.distribution_modifier_c,
                  target.modifier_source, target.pre_v6_target_c,
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
                  static_cast<unsigned>(learned_thermal_lead_h),
                  static_cast<unsigned>(active_thermal_lead_h),
                  zone->max_offset_c))
      break;
    first = false;
  }
  appendf_(buffer, capacity, off, "]}");
}

void LuneTouchCoordinator::write_strategy_json(char *buffer, size_t capacity) const {
  if (buffer == nullptr || capacity == 0)
    return;
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
  char physical_temperature[16];
  char comfort_average[16];
  char comfort_demand[16];
  char driver_deficit[16];
  char schedule_setpoint[16];
  char house_target[16];
  char weighted_temperature[16];
  json_escape_(strategy.driver_room_id, driver_room_id, sizeof(driver_room_id));
  json_escape_(strategy.driver_room_name, driver_room_name, sizeof(driver_room_name));
  json_escape_(schedule_driver_room_id_raw, schedule_driver_room_id, sizeof(schedule_driver_room_id));
  json_escape_(schedule_driver_room_name_raw, schedule_driver_room_name, sizeof(schedule_driver_room_name));
  json_escape_(asgard_mode_, asgard_mode, sizeof(asgard_mode));
  json_float_token_(physical_temperature, sizeof(physical_temperature), strategy.physical_temperature_c, 2);
  json_float_token_(comfort_average, sizeof(comfort_average), strategy.comfort_average_c, 2);
  json_float_token_(comfort_demand, sizeof(comfort_demand), strategy.comfort_demand_c, 2);
  json_float_token_(driver_deficit, sizeof(driver_deficit), strategy.driver_deficit_c, 2);
  json_float_token_(schedule_setpoint, sizeof(schedule_setpoint), schedule_driver_setpoint, 1);
  json_float_token_(house_target, sizeof(house_target), strategy.house_target_c, 2);
  json_float_token_(weighted_temperature, sizeof(weighted_temperature), strategy.physical_temperature_c, 2);

  snprintf(buffer, capacity,
           "{\"physical\":{\"has_temperature\":%s,\"temperature_c\":%s,"
           "\"contributing_rooms\":%u,\"missing_rooms\":%u,\"contributing_area_m2\":%.1f,\"missing_area_m2\":%.1f,\"coverage_ratio\":%.3f,\"quality\":\"%s\",\"expected_manifolds\":%u,\"contributing_manifolds\":%u},\"comfort\":{\"average_c\":%s,"
           "\"demand_c\":%s,\"demand_zones\":%u},\"driver\":{\"room_id\":\"%s\","
           "\"name\":\"%s\",\"deficit_c\":%s,\"priority\":%u},"
           "\"schedule\":{\"time_valid\":%s,\"active_zones\":%u,"
           "\"driver_room_id\":\"%s\",\"driver_name\":\"%s\","
           "\"driver_setpoint_c\":%s,\"driver_priority\":%u},"
           "\"house_target\":{\"available\":%s,\"value_c\":%s,\"source\":\"%s\",\"contributing_area_m2\":%.1f},"
           "\"weighted_temperature\":{\"source\":\"physical_area_weighted\",\"available\":%s,\"value_c\":%s,\"contributing_rooms\":%u},"
           "\"heat_source\":{\"enabled\":%s,\"mode\":\"%s\"},"
           "\"asgard_odin\":{\"enabled\":%s,\"physical_signal\":\"area_weighted_house_temp\","
           "\"comfort_signal\":\"separate_weighted_demand\",\"mode\":\"%s\"}}",
           strategy.has_physical_temperature ? "true" : "false",
           physical_temperature,
           static_cast<unsigned>(strategy.contributing_rooms),
           static_cast<unsigned>(strategy.missing_rooms),
           strategy.contributing_area_m2,
           strategy.missing_area_m2,
           strategy.coverage_ratio,
           strategy.quality,
           static_cast<unsigned>(strategy.expected_manifolds),
           static_cast<unsigned>(strategy.contributing_manifolds),
           comfort_average,
           comfort_demand,
           static_cast<unsigned>(strategy.demand_zones),
           driver_room_id,
           driver_room_name,
           driver_deficit,
           static_cast<unsigned>(strategy.driver_priority),
           schedule_time_valid ? "true" : "false",
           static_cast<unsigned>(schedule_active),
           schedule_driver_room_id,
           schedule_driver_room_name,
           schedule_setpoint,
           static_cast<unsigned>(schedule_driver_priority),
           strategy.has_house_target ? "true" : "false",
           house_target,
           strategy.house_target_source,
           strategy.target_contributing_area_m2,
           strategy.has_physical_temperature ? "true" : "false",
           weighted_temperature,
           static_cast<unsigned>(strategy.contributing_rooms),
           heat_source_.enabled ? "true" : "false", heat_source_.enabled ? "active" : "disabled",
           asgard_enabled_ ? "true" : "false",
           asgard_mode);
}

void LuneTouchCoordinator::write_settings_json(char *buffer, size_t capacity) const {
  char name[64];
  char install_id[64];
  char site[96];
  char mode[32];
  char authority_leader[64];
  char authority_coordinator[64];
  char authority_state[48];
  char authority_reason[96];
  char authority_peer_status[32];
  char authority_last_fallback[16];
  char authority_last_asgard[16];
  char weather_max_boost[16];
  json_escape_(coordinator_name_, name, sizeof(name));
  json_escape_(install_id_, install_id, sizeof(install_id));
  json_escape_(site_label_, site, sizeof(site));
  json_escape_(install_mode_, mode, sizeof(mode));
  json_escape_(authority_leader_node_id_, authority_leader, sizeof(authority_leader));
  json_escape_(authority_coordinator_id_, authority_coordinator, sizeof(authority_coordinator));
  json_escape_(authority_state_, authority_state, sizeof(authority_state));
  json_escape_(authority_reason_, authority_reason, sizeof(authority_reason));
  json_escape_(authority_v6_peer_status_, authority_peer_status, sizeof(authority_peer_status));
  json_float_token_(authority_last_fallback, sizeof(authority_last_fallback), authority_last_fallback_value_c_, 2);
  json_float_token_(authority_last_asgard, sizeof(authority_last_asgard), authority_last_asgard_value_c_, 2);
  json_float_token_(weather_max_boost, sizeof(weather_max_boost), weather_max_boost_c_, 1);
  snprintf(buffer, capacity,
           "{\"coordinator\":{\"name\":\"%s\",\"install_id\":\"%s\","
           "\"site_label\":\"%s\",\"install_mode\":\"%s\"},"
           "\"authority\":{\"leader_node_id\":\"%s\",\"coordinator_id\":\"%s\","
           "\"authentication_configured\":%s,\"state\":\"%s\",\"reason\":\"%s\","
           "\"generation\":%lu,\"lease_remaining_s\":%lu,\"v6_sync\":{"
           "\"last_fallback_value_c\":%s,\"last_asgard_value_c\":%s,"
           "\"local_zones\":%u,\"peer_zones\":%u,\"peer_status\":\"%s\"}},"
           "\"weather\":{\"max_boost_c\":%s}}",
           name, install_id, site, mode, authority_leader, authority_coordinator,
           authority_shared_key_[0] != '\0' ? "true" : "false", authority_state, authority_reason,
           static_cast<unsigned long>(authority_generation_),
           authority_expires_at_ms_ == 0 ? 0UL : static_cast<unsigned long>((authority_expires_at_ms_ - esphome::millis()) / 1000UL),
           authority_last_fallback, authority_last_asgard,
           static_cast<unsigned>(authority_v6_local_zones_), static_cast<unsigned>(authority_v6_peer_zones_), authority_peer_status,
           weather_max_boost);
}

void LuneTouchCoordinator::write_heat_source_json(char *buffer, size_t capacity) const {
  HeatSourceState source;
  ::lune_touch::StrategySnapshot strategy;
  if (take_state_lock_(50)) {
    source = heat_source_;
    strategy = model_.strategy_snapshot();
    give_state_lock_();
  }
  char host[128];
  char variable[96];
  char error[192];
  char target_blocker[128];
  char operating_state_blocker[128];
  char weighted_temperature[16];
  char preview_setpoint[16];
  char requested_value[16];
  char confirmed_value[16];
  json_escape_(source.host, host, sizeof(host));
  json_escape_(source.weighted_temperature_variable, variable, sizeof(variable));
  json_escape_(source.last_error, error, sizeof(error));
  const asgard_adapter::Config adapter_config{
      source.host, source.port, source.weighted_temperature_variable};
  const asgard_adapter::Compatibility adapter_compatibility =
      asgard_adapter::compatibility(adapter_config);
  json_escape_(adapter_compatibility.target_blocker, target_blocker, sizeof(target_blocker));
  json_escape_(adapter_compatibility.operating_state_blocker, operating_state_blocker,
               sizeof(operating_state_blocker));
  json_float_token_(weighted_temperature, sizeof(weighted_temperature), strategy.physical_temperature_c, 2);
  char preview_temperature[16];
  json_float_token_(preview_temperature, sizeof(preview_temperature),
                    strategy.temperature_preview_c, 2);
  // Prefer the setpoint currently reported by V6. This is the useful value
  // during commissioning, when Touch's local room comfort fields may still
  // contain their default/clamped value. Once live data is unavailable, use
  // the area-weighted Touch target or the configured comfort average.
  const bool has_preview_setpoint = strategy.has_setpoint_preview || strategy.has_house_target ||
                                    (std::isfinite(strategy.comfort_average_c) &&
                                     strategy.comfort_average_c >= 5.0f &&
                                     strategy.comfort_average_c <= 35.0f);
  const float preview_setpoint_c = strategy.has_setpoint_preview
                                       ? strategy.setpoint_preview_c
                                       : strategy.has_house_target
                                             ? strategy.house_target_c
                                             : strategy.comfort_average_c;
  json_float_token_(preview_setpoint, sizeof(preview_setpoint), preview_setpoint_c, 2);
  json_float_token_(requested_value, sizeof(requested_value), source.last_requested_value_c, 2);
  json_float_token_(confirmed_value, sizeof(confirmed_value), source.last_confirmed_value_c, 2);
  const uint32_t now = esphome::millis();
  const uint32_t write_age_s = source.last_write_ms == 0 ? 0 : (now - source.last_write_ms) / 1000UL;
  const uint32_t confirmation_age_s = source.last_confirmed_ms == 0 ? 0 :
                                      (now - source.last_confirmed_ms) / 1000UL;
  snprintf(buffer, capacity,
           "{\"enabled\":%s,\"host\":\"%s\",\"port\":%u,"
           "\"weighted_temperature_variable\":\"%s\",\"push_interval_s\":%u,"
           "\"compatibility\":{\"physical_temperature\":\"%s\",\"target_sync\":\"%s\","
           "\"operating_state\":\"%s\",\"target_blocker\":\"%s\","
           "\"operating_state_blocker\":\"%s\"},"
           "\"weighted_temperature\":{\"available\":%s,\"value_c\":%s,\"contributing_rooms\":%u},"
           "\"send_preview\":{\"available\":%s,\"value_c\":%s,\"zones\":%u,"
           "\"target_setpoint_c\":%s,\"target_available\":%s,\"mode\":\"%s\"},"
           "\"push\":{\"has_result\":%s,\"status\":\"%s\",\"http_status\":%d,\"requested_value_c\":%s,"
           "\"confirmed_value_c\":%s,\"write_age_s\":%u,\"confirmation_age_s\":%u,"
           "\"failure_count\":%u,\"failure_streak\":%u,\"last_error\":\"%s\"}}",
           source.enabled ? "true" : "false", host, static_cast<unsigned>(source.port), variable,
           static_cast<unsigned>(source.push_interval_s),
           asgard_adapter::capability_status_name(adapter_compatibility.physical_temperature),
           asgard_adapter::capability_status_name(adapter_compatibility.target_sync),
           asgard_adapter::capability_status_name(adapter_compatibility.operating_state), target_blocker,
           operating_state_blocker,
           strategy.has_physical_temperature ? "true" : "false",
           weighted_temperature, static_cast<unsigned>(strategy.contributing_zones),
           strategy.has_temperature_preview ? "true" : "false", preview_temperature,
           static_cast<unsigned>(strategy.preview_zones),
           preview_setpoint, has_preview_setpoint ? "true" : "false",
           source.enabled ? "active" : "disabled_preview",
           source.has_last_push ? "true" : "false", source.last_status, source.last_http_status,
           requested_value, confirmed_value,
           static_cast<unsigned>(write_age_s), static_cast<unsigned>(confirmation_age_s),
           static_cast<unsigned>(source.failure_count), static_cast<unsigned>(source.failure_streak), error);
}

void LuneTouchCoordinator::write_forecast_json(char *buffer, size_t capacity) const {
  size_t off = 0;
  OdinPlanState odin_plan;
  if (take_state_lock_(50)) {
    odin_plan = odin_plan_;
    give_state_lock_();
  }
  char forecast_last_error[128];
  char forecast_location_mode[32];
  char forecast_provider_timezone[64];
  char odin_status[24];
  char odin_error[128];
  json_escape_(forecast_last_error_, forecast_last_error, sizeof(forecast_last_error));
  json_escape_(forecast_location_mode_, forecast_location_mode, sizeof(forecast_location_mode));
  json_escape_(forecast_provider_timezone_, forecast_provider_timezone, sizeof(forecast_provider_timezone));
  json_escape_(odin_plan.status, odin_status, sizeof(odin_status));
  json_escape_(odin_plan.last_error, odin_error, sizeof(odin_error));
  const int64_t now_epoch_s = current_epoch_s_();
  const unsigned long fetch_age_s =
      forecast_fetch_epoch_s_ == 0 || now_epoch_s < forecast_fetch_epoch_s_
          ? 0UL
          : static_cast<unsigned long>(now_epoch_s - forecast_fetch_epoch_s_);
  const unsigned long odin_age_s = odin_plan.last_fetch_ms == 0 ? 0UL :
      static_cast<unsigned long>((esphome::millis() - odin_plan.last_fetch_ms) / 1000UL);
  const bool odin_fresh = odin_plan.available && odin_plan.last_fetch_ms != 0 &&
      esphome::millis() - odin_plan.last_fetch_ms <= ODIN_PLAN_STALE_MS;
  int64_t timestamps[72]{};
  for (uint8_t i = 0; i < forecast_hours_count_; i++)
    timestamps[i] = forecast_hours_[i].timestamp_s;
  const size_t decision_start_index = lune_touch_forecast_timeline::first_index_at_or_after(
      timestamps, forecast_hours_count_, now_epoch_s);
  char weather_max_boost[16];
  char odin_target[16];
  char odin_min[16];
  char odin_max[16];
  char odin_price[16];
  char odin_heat[16];
  char forecast_min_temp[16];
  char forecast_max_wind[16];
  char forecast_peak_dir[16];
  char forecast_max_solar[16];
  json_float_token_(weather_max_boost, sizeof(weather_max_boost), weather_max_boost_c_, 1);
  json_float_token_(odin_target, sizeof(odin_target), odin_plan.current_target_c, 2);
  json_float_token_(odin_min, sizeof(odin_min), odin_plan.current_min_c, 2);
  json_float_token_(odin_max, sizeof(odin_max), odin_plan.current_max_c, 2);
  json_float_token_(odin_price, sizeof(odin_price), odin_plan.current_price, 3);
  json_float_token_(odin_heat, sizeof(odin_heat), odin_plan.current_planned_heat_kw, 2);
  json_float_token_(forecast_min_temp, sizeof(forecast_min_temp), forecast_min_temp_c_, 1);
  json_float_token_(forecast_max_wind, sizeof(forecast_max_wind), forecast_max_wind_ms_, 1);
  json_float_token_(forecast_peak_dir, sizeof(forecast_peak_dir), forecast_peak_wind_dir_deg_, 0);
  json_float_token_(forecast_max_solar, sizeof(forecast_max_solar), forecast_max_solar_wm2_, 0);
  appendf_(buffer, capacity, off,
           "{\"status\":\"%s\",\"location\":{\"mode\":\"%s\",\"latitude\":%.6f,\"longitude\":%.6f},"
           "\"fetch_pending\":%s,\"last_fetch_age_s\":%lu,"
           "\"weather\":{\"max_boost_c\":%s},"
           "\"odin_plan\":{\"enabled\":%s,\"source\":\"asgard_odin\",\"available\":%s,"
           "\"fresh\":%s,\"status\":\"%s\",\"http_status\":%d,\"age_s\":%lu,"
           "\"current_hour\":%u,\"current_index\":%u,\"target_c\":%s,\"min_c\":%s,\"max_c\":%s,"
           "\"price\":%s,\"planned_heat_kw\":%s,\"operation_mode_raw\":%d,"
           "\"applies_valve_commands\":false,\"last_error\":\"%s\"},"
           "\"cache\":{\"hours\":%u,\"min_temp_c\":%s,"
           "\"max_wind_ms\":%s,\"peak_wind_dir_deg\":%s,\"max_solar_wm2\":%s,"
           "\"fetch_epoch_s\":%lld,\"provider_timezone\":\"%s\",\"decision_start_index\":%d,"
           "\"restored\":%s},"
           "\"last_error\":\"%s\",\"commands\":{\"active\":%u,\"sent\":%u,\"skipped\":%u,\"failed\":%u,"
           "\"blocked_stale\":%u,\"blocked_unreachable\":%u,\"blocked_untrusted\":%u},"
           "\"hours\":[",
           forecast_status_, forecast_location_mode, forecast_latitude_, forecast_longitude_,
           forecast_fetch_requested_ ? "true" : "false",
           fetch_age_s,
           weather_max_boost,
           odin_plan.enabled ? "true" : "false", odin_plan.available ? "true" : "false",
           odin_fresh ? "true" : "false", odin_status, odin_plan.last_http_status, odin_age_s,
           static_cast<unsigned>(odin_plan.current_hour), static_cast<unsigned>(odin_plan.current_index), odin_target,
           odin_min, odin_max, odin_price,
           odin_heat, odin_plan.current_operation_mode_raw, odin_error,
           static_cast<unsigned>(forecast_hours_count_), forecast_min_temp, forecast_max_wind,
           forecast_peak_dir, forecast_max_solar,
           static_cast<long long>(forecast_fetch_epoch_s_), forecast_provider_timezone,
           decision_start_index == lune_touch_forecast_timeline::NO_INDEX
               ? -1
               : static_cast<int>(decision_start_index),
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
             "%s{\"h\":%u,\"timestamp_s\":%lld,\"temp_c\":%.1f,\"wind_ms\":%.1f,"
             "\"wind_dir_deg\":%.0f,\"solar_wm2\":%.0f}",
             i ? "," : "", static_cast<unsigned>(i), static_cast<long long>(h.timestamp_s),
             h.temp_c, h.wind_speed_ms,
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
             "\"peak_load\":%.2f,\"peak_in_h\":%d,\"configured_thermal_lead_h\":%u,"
             "\"learned_thermal_lead_h\":%u,\"active_thermal_lead_h\":%u,\"active\":%s}",
             i ? "," : "", room_id, room_name, static_cast<unsigned>(d.node_index),
             static_cast<unsigned>(d.zone_index), d.comfort_setpoint_c,
             static_cast<unsigned>(d.priority), d.offset_c, d.peak_load,
             static_cast<int>(d.peak_in_h),
             static_cast<unsigned>(d.configured_thermal_lead_h),
             static_cast<unsigned>(d.learned_thermal_lead_h),
             static_cast<unsigned>(d.active_thermal_lead_h),
             d.active ? "true" : "false");
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
    char room_id[48];
    char room_name[80];
    json_escape_(record->request_id, request_id, sizeof(request_id));
    json_escape_(record->source, source, sizeof(source));
    json_escape_(record->reason, reason, sizeof(reason));
    json_escape_(record->room_id, room_id, sizeof(room_id));
    json_escape_(record->room_id, room_name, sizeof(room_name));
    if (!appendf_(buffer, capacity, off,
                  "%s{\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\","
                  "\"room_id\":\"%s\",\"name\":\"%s\",\"node_id\":\"%s\",\"loop_id\":\"%s\","
                  "\"node_index\":%u,\"zone_index\":%u,"
                  "\"requested_offset_c\":%.2f,"
                  "\"accepted_offset_c\":%.2f,\"created_at_ms\":%lu,\"expires_at_ms\":%lu,"
                  "\"created_at_epoch_s\":%lld,\"expires_at_epoch_s\":%lld,\"boot_id\":%lu,"
                  "\"result\":\"%s\",\"clamp_applied\":%s}",
                  first ? "" : ",", request_id, source, reason, room_id, room_name,
                  record->node_id, record->loop_id,
                  static_cast<unsigned>(record->node_index), static_cast<unsigned>(record->zone_index),
                  record->requested_offset_c, record->accepted_offset_c,
                  static_cast<unsigned long>(record->created_at_ms),
                  static_cast<unsigned long>(record->expires_at_ms),
                  static_cast<long long>(record->created_at_epoch_s),
                  static_cast<long long>(record->expires_at_epoch_s),
                  static_cast<unsigned long>(record->boot_id),
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
    next_action = "review_v6_zones";
  else if (fresh_zones == 0)
    next_action = "wait_for_fresh_zone_poll";
  else if (!has_forecast_location)
    next_action = "set_forecast_location";

  diagnostics_blockers_[0] = '\0';
  size_t blockers_off = 0;
  size_t blockers_count = 0;
  auto append_blocker = [&](const char *scope, const char *target, const char *reason, const char *action) {
    if (blockers_count >= 8 || blockers_off + 128 >= sizeof(diagnostics_blockers_))
      return;
    char scope_esc[24];
    char target_esc[48];
    char reason_esc[40];
    char action_esc[40];
    json_escape_(scope, scope_esc, sizeof(scope_esc));
    json_escape_(target, target_esc, sizeof(target_esc));
    json_escape_(reason, reason_esc, sizeof(reason_esc));
    json_escape_(action, action_esc, sizeof(action_esc));
    if (appendf_(diagnostics_blockers_, sizeof(diagnostics_blockers_), blockers_off,
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
    append_blocker("zones", "v6_manifolds", "no_imported_zones", "review_v6_zones");
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
           "\"ownership\":{\"odin\":\"heat_pump_timing_prices_weather_solar_compressor_dhw\","
           "\"touch\":\"logical_rooms_distribution_schedules_house_signals_asgard_normal\","
           "\"v6\":\"local_safe_heating_and_explicit_fallback_only\","
           "\"touch_prices\":\"read_only\"},"
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
           diagnostics_blockers_,
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
