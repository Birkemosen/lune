#include "lv6_dashboard.h"
#include "../lv6_zone_controller/hydraulic_diagnostics.h"
#include "esphome/components/lv6_ble_time_beacon/lv6_ble_time_beacon.h"
#include "settings_backup.h"

#include "esphome/core/log.h"
#ifdef USE_LOGGER
#include "esphome/components/logger/logger.h"
#endif
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cstdarg>
#include <ctime>
#include <new>
#include <esp_http_server.h>
#include <esp_heap_caps.h>
#include <esp_system.h>

namespace esphome {
namespace lv6_dashboard {

static const char *const TAG = "lv6_dashboard";
static constexpr size_t STATIC_CHUNK_SIZE = 2048;

namespace {

bool appendf(char *buffer, size_t capacity, size_t &offset, const char *fmt, ...) {
  if (offset >= capacity)
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

const char *http_status_line(int code) {
  switch (code) {
    case 200: return "200 OK";
    case 204: return "204 No Content";
    case 400: return "400 Bad Request";
    case 404: return "404 Not Found";
    case 405: return "405 Method Not Allowed";
    case 503: return "503 Service Unavailable";
    default: return "500 Internal Server Error";
  }
}

bool is_dashboard_js_url(const char *url) {
  static constexpr const char PATH[] = "/dashboard.js";
  static constexpr size_t PATH_LEN = sizeof(PATH) - 1;
  return url != nullptr && strncmp(url, PATH, PATH_LEN) == 0 &&
         (url[PATH_LEN] == '\0' || url[PATH_LEN] == '?');
}

// Append `s` as the body of a JSON string (without surrounding quotes),
// escaping the characters JSON requires. Control chars become spaces.
void append_json_escaped(char *buffer, size_t capacity, size_t &offset, const char *s) {
  for (const char *p = s; p != nullptr && *p != '\0'; ++p) {
    if (offset + 2 >= capacity)
      return;
    const unsigned char c = static_cast<unsigned char>(*p);
    if (c == '"' || c == '\\') {
      buffer[offset++] = '\\';
      buffer[offset++] = static_cast<char>(c);
    } else if (c < 0x20) {
      buffer[offset++] = ' ';
    } else {
      buffer[offset++] = static_cast<char>(c);
    }
  }
}

void format_float_token(char *buffer, size_t capacity, float value, int decimals = 1) {
  if (!std::isfinite(value)) {
    snprintf(buffer, capacity, "null");
    return;
  }

  long scale = 1;
  for (int i = 0; i < decimals; i++)
    scale *= 10;

  const long scaled = lroundf(value * static_cast<float>(scale));
  const long whole = scaled / scale;
  const long fraction = std::labs(scaled % scale);

  if (decimals <= 0) {
    snprintf(buffer, capacity, "%ld", whole);
    return;
  }

  char frac_fmt[8];
  snprintf(frac_fmt, sizeof(frac_fmt), "%%0%dld", decimals);
  char frac_buf[16];
  snprintf(frac_buf, sizeof(frac_buf), frac_fmt, fraction);
  snprintf(buffer, capacity, "%ld.%s", whole, frac_buf);
}

void format_pairing_fingerprint(const char *mac, char *buffer, size_t capacity) {
  if (capacity == 0)
    return;
  size_t off = 0;
  off += snprintf(buffer + off, capacity - off, "hv6-");
  for (const char *p = mac; p != nullptr && *p != '\0' && off + 1 < capacity; ++p) {
    char c = *p;
    if (c >= 'A' && c <= 'F')
      c = static_cast<char>(c - 'A' + 'a');
    if ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))
      buffer[off++] = c;
  }
  buffer[off] = '\0';
  if (std::strcmp(buffer, "hv6-") == 0)
    std::strncpy(buffer, "hv6-unknown", capacity - 1);
  buffer[capacity - 1] = '\0';
}

void sanitize_text(const std::string &src, char *buffer, size_t capacity) {
  if (capacity == 0)
    return;

  size_t out = 0;
  for (size_t i = 0; i < src.size() && out + 1 < capacity; i++) {
    const char c = src[i];
    buffer[out++] = (c == '"' || c == '\\') ? '_' : c;
  }
  buffer[out] = '\0';
}

// --- minimal JSON field extractors for POST body ---

static bool json_get_str(const char *body, const char *field, char *out, size_t out_len) {
  char pat[48];
  snprintf(pat, sizeof(pat), "\"%s\"", field);
  const char *p = strstr(body, pat);
  if (!p) return false;
  p += strlen(pat);
  while (*p == ' ') p++;
  if (*p != ':') return false;
  p++;
  while (*p == ' ') p++;
  if (*p != '"') return false;
  p++;
  const char *end = strchr(p, '"');
  if (!end) return false;
  const size_t len = std::min(static_cast<size_t>(end - p), out_len - 1);
  memcpy(out, p, len);
  out[len] = '\0';
  return true;
}

static bool json_get_num(const char *body, const char *field, float *out) {
  char pat[48];
  snprintf(pat, sizeof(pat), "\"%s\"", field);
  const char *p = strstr(body, pat);
  if (!p) return false;
  p += strlen(pat);
  while (*p == ' ') p++;
  if (*p != ':') return false;
  p++;
  while (*p == ' ') p++;
  if (*p == '"' || *p == '{' || *p == '[') return false;
  char *end;
  const float v = strtof(p, &end);
  if (end == p) return false;
  *out = v;
  return true;
}

static bool json_get_bool(const char *body, const char *field, bool *out) {
  char pat[48];
  snprintf(pat, sizeof(pat), "\"%s\"", field);
  const char *p = strstr(body, pat);
  if (!p) return false;
  p += strlen(pat);
  while (*p == ' ') p++;
  if (*p != ':') return false;
  p++;
  while (*p == ' ') p++;
  if (strncmp(p, "true", 4) == 0) {
    *out = true;
    return true;
  }
  if (strncmp(p, "false", 5) == 0) {
    *out = false;
    return true;
  }
  float num = 0.0f;
  if (json_get_num(body, field, &num)) {
    *out = std::fabs(num) > 0.001f;
    return true;
  }
  return false;
}

// --- string → enum parsers ---

static bool parse_probe_option(const char *raw, int8_t *out) {
  if (strcasecmp(raw, "None") == 0) { *out = lv6::PROBE_UNASSIGNED; return true; }
  int n = 0;
  if (sscanf(raw, "Probe %d", &n) == 1 && n >= 1 && n <= static_cast<int>(lv6::MAX_PROBES)) {
    *out = static_cast<int8_t>(n - 1);
    return true;
  }
  return false;
}

static bool parse_temp_source(const char *raw, lv6::TempSource *out) {
  if (strcasecmp(raw, "Local Probe") == 0) { *out = lv6::TempSource::LOCAL_PROBE; return true; }
  if (strcasecmp(raw, "BLE") == 0 || strcasecmp(raw, "BLE Sensor") == 0) {
    *out = lv6::TempSource::BLE_SENSOR;
    return true;
  }
  return false;
}

static const char *dashboard_variant_str() {
  return "ble";
}

static const char *temp_source_to_dashboard_str(lv6::TempSource src) {
  switch (src) {
    case lv6::TempSource::LOCAL_PROBE:
      return "Local Probe";
    case lv6::TempSource::BLE_SENSOR:
      return "BLE";
    default:
      return "Local Probe";
  }
}

static const char *pipe_type_to_api_str(lv6::PipeType type) {
  switch (type) {
    case lv6::PipeType::PEX_12X2: return "PEX_12X2";
    case lv6::PipeType::PEX_14X2: return "PEX_14X2";
    case lv6::PipeType::PEX_16X2: return "PEX_16X2";
    case lv6::PipeType::PEX_17X2: return "PEX_17X2";
    case lv6::PipeType::PEX_18X2: return "PEX_18X2";
    case lv6::PipeType::PEX_20X2: return "PEX_20X2";
    case lv6::PipeType::ALUPEX_16X2: return "ALUPEX_16X2";
    case lv6::PipeType::ALUPEX_20X2: return "ALUPEX_20X2";
    default: return "UNKNOWN";
  }
}

static const char *motor_profile_to_api_str(lv6::MotorProfile profile) {
  switch (profile) {
    case lv6::MotorProfile::INHERIT: return "INHERIT";
    case lv6::MotorProfile::GENERIC: return "GENERIC";
    case lv6::MotorProfile::HMIP_VDMOT: return "HMIP_VDMOT";
    default: return "UNKNOWN";
  }
}

static bool parse_pipe_type(const char *raw, lv6::PipeType *out) {
  struct { const char *s; lv6::PipeType v; } map[] = {
    {"PEX 12mm", lv6::PipeType::PEX_12X2}, {"PEX 12x2", lv6::PipeType::PEX_12X2},
    {"PEX 14mm", lv6::PipeType::PEX_14X2}, {"PEX 14x2", lv6::PipeType::PEX_14X2},
    {"PEX 16mm", lv6::PipeType::PEX_16X2}, {"PEX 16x2", lv6::PipeType::PEX_16X2},
    {"PEX 17mm", lv6::PipeType::PEX_17X2}, {"PEX 17x2", lv6::PipeType::PEX_17X2},
    {"PEX 18mm", lv6::PipeType::PEX_18X2}, {"PEX 18x2", lv6::PipeType::PEX_18X2},
    {"PEX 20mm", lv6::PipeType::PEX_20X2}, {"PEX 20x2", lv6::PipeType::PEX_20X2},
    {"ALUPEX 16mm", lv6::PipeType::ALUPEX_16X2}, {"ALUPEX 16x2", lv6::PipeType::ALUPEX_16X2},
    {"ALUPEX 20mm", lv6::PipeType::ALUPEX_20X2}, {"ALUPEX 20x2", lv6::PipeType::ALUPEX_20X2},
  };
  for (const auto &e : map) {
    if (strcasecmp(raw, e.s) == 0) { *out = e.v; return true; }
  }
  return false;
}

static bool parse_motor_profile(const char *raw, lv6::MotorProfile *out) {
  if (strcasecmp(raw, "Inherit") == 0) { *out = lv6::MotorProfile::INHERIT; return true; }
  if (strcasecmp(raw, "Generic") == 0) { *out = lv6::MotorProfile::GENERIC; return true; }
  if (strcasecmp(raw, "HmIP VdMot") == 0 || strcasecmp(raw, "HMIP_VDMOT") == 0) { *out = lv6::MotorProfile::HMIP_VDMOT; return true; }
  return false;
}

}  // namespace

static const char DASHBOARD_HTML[] =
    "<!doctype html><html><head>"
    "<meta charset=\"utf-8\">"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
    "<meta name=\"color-scheme\" content=\"light dark\">"
    "<link rel=\"icon\" href=\"data:,\">"
    "<title>Lune V6</title>"
    "</head><body>"
    "<div id=\"app\">Loading dashboard...</div>"
    "<script src=\"/dashboard.js?v=v6-zone-identity-20260815\"></script>"
    "</body></html>";

void LV6Dashboard::update_snapshot_() {
  // This function runs on ESPHome's loopTask.  DashboardSnapshot is several
  // kilobytes and used to be allocated here alongside temporary DeviceConfig
  // copies, exhausting loopTask during boot on 4 MB modules.  Reuse the
  // component-owned scratch buffer instead; it is never read by HTTP handlers.
  DashboardSnapshot &s = this->update_snap_buf_;
  memset(&s, 0, sizeof(s));

  s.uptime_s = millis() / 1000UL;
  // System diagnostics — per-core CPU load (sampled in loop()) + live heap.
  s.cpu0_pct = cpu0_pct_;
  s.cpu1_pct = cpu1_pct_;
  s.free_internal_kb = heap_caps_get_free_size(MALLOC_CAP_INTERNAL) / 1024;
  s.free_psram_kb = heap_caps_get_free_size(MALLOC_CAP_SPIRAM) / 1024;

  auto snap_float = [](sensor::Sensor *sns) -> float {
    return (sns && sns->has_state()) ? sns->state : NAN;
  };

  s.wifi_dbm          = snap_float(this->wifi_signal_sensor_);
  s.manifold_flow_c   = snap_float(this->manifold_flow_sensor_);
  s.manifold_return_c = snap_float(this->manifold_return_sensor_);
  for (uint8_t i = 0; i < 6; i++) {
    s.zone_temp_c[i]        = snap_float(this->zone_temp_sensors_[i]);
    s.zone_valve_pct[i]     = snap_float(this->zone_valve_sensors_[i]);
    s.zone_preheat_c[i]     = snap_float(this->zone_preheat_sensors_[i]);
    s.motor_open_ripple[i]  = snap_float(this->motor_open_ripple_sensors_[i]);
    s.motor_close_ripple[i] = snap_float(this->motor_close_ripple_sensors_[i]);
    s.motor_open_factor[i]  = snap_float(this->motor_open_factor_sensors_[i]);
    s.motor_close_factor[i] = snap_float(this->motor_close_factor_sensors_[i]);
  }
  for (uint8_t i = 0; i < 8; i++)
    s.probe_temp_c[i] = snap_float(this->probe_temp_sensors_[i]);

  auto snap_text = [](text_sensor::TextSensor *ts, char *out, size_t len) {
    if (ts && ts->has_state()) {
      sanitize_text(ts->state, out, len);
    } else {
      out[0] = '\0';
    }
  };
  snap_text(this->firmware_version_text_, s.firmware_version, sizeof(s.firmware_version));
  snap_text(this->ip_address_text_,       s.ip_address,       sizeof(s.ip_address));
  snap_text(this->connected_ssid_text_,   s.connected_ssid,   sizeof(s.connected_ssid));
  snap_text(this->mac_address_text_,      s.mac_address,      sizeof(s.mac_address));
  snap_text(this->reset_reason_text_,     s.reset_reason,     sizeof(s.reset_reason));
  for (uint8_t i = 0; i < 6; i++) {
    snap_text(this->zone_state_sensors_[i],  s.zone_state[i],  sizeof(s.zone_state[i]));
    snap_text(this->motor_fault_sensors_[i], s.motor_fault[i], sizeof(s.motor_fault[i]));
  }

  s.drivers_enabled = this->valve_controller_ && this->valve_controller_->are_drivers_enabled();

  // Touch authority is local coordination state only; heat-source transport is
  // owned by Lune Touch. Expiry is checked here so stale leases stop gating
  // local command handling without a second background task.
  if (this->config_store_) {
    s.authority = this->config_store_->get_authority_config();
    this->authority_.configure(s.authority.installation_id, s.authority.coordinator_id);
    this->authority_.expire_if_needed(millis());
    if (this->zone_controller_)
      this->zone_controller_->set_touch_authority_active(this->authority_.snapshot(millis()).touch_lease_active);
  }
  const auto authority_snapshot = this->authority_.snapshot(millis());
  strncpy(s.authority_state, lv6_authority::state_name(authority_snapshot.state), sizeof(s.authority_state) - 1);
  strncpy(s.authority_reason, authority_snapshot.last_reason, sizeof(s.authority_reason) - 1);
  s.authority_lease_remaining_s = authority_snapshot.remaining_ms / 1000UL;
  s.authority_generation = authority_snapshot.lease_generation;
  s.authority_v6_write_allowed = false;
  s.authority_state[sizeof(s.authority_state) - 1] = '\0';
  s.authority_reason[sizeof(s.authority_reason) - 1] = '\0';

  if (this->config_store_) {
    s.system                 = this->config_store_->get_config().system;
    s.probes                 = this->config_store_->get_probe_config();
    s.motor                  = this->config_store_->get_motor_config();
    s.manifold_type          = this->config_store_->get_manifold_type();
    s.simple_preheat_enabled = this->config_store_->get_simple_preheat_enabled();
    const auto ctrl_cfg = this->config_store_->get_config().control;
    s.preheat_absorb_enabled = ctrl_cfg.preheat_absorb_enabled;
    s.preheat_absorb_band_c  = ctrl_cfg.preheat_absorb_band_c;
    s.preheat_detect_delta_c = ctrl_cfg.preheat_detect_delta_c;
    s.preheat_absorbing = this->zone_controller_ && this->zone_controller_->is_preheat_absorbing();
    s.authority              = this->config_store_->get_authority_config();
    s.balancing              = this->config_store_->get_config().balancing;
    s.min_zone_flow_pct      = s.balancing.secondary_min_total_opening_pct;
    s.minimum_flow_always    = s.balancing.secondary_flow_commissioning_enabled;
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      s.zones[i]            = this->config_store_->get_zone_config(i);
      s.zone_temp_source[i] = this->config_store_->get_zone_temp_source(i);
      this->config_store_->get_zone_ble_mac_str(i, s.zone_ble_mac[i], sizeof(s.zone_ble_mac[i]));
    }
  }

  if (this->ble_time_beacon_) {
    s.ble_clock_sync_enabled = this->ble_time_beacon_->enabled();
    s.ble_clock_sync_interval_min = this->ble_time_beacon_->interval_min();
    s.ble_clock_sync_last_ok_s = this->ble_time_beacon_->last_ok_s();
    strncpy(s.ble_clock_sync_last_error, this->ble_time_beacon_->last_error(),
            sizeof(s.ble_clock_sync_last_error) - 1);
    s.ble_clock_sync_last_error[sizeof(s.ble_clock_sync_last_error) - 1] = '\0';
    s.ble_clock_sync_advertising = this->ble_time_beacon_->advertising();
  } else if (this->config_store_) {
    const auto sensors = this->config_store_->get_config().sensor_config;
    s.ble_clock_sync_enabled = sensors.ble_clock_sync_enabled;
    s.ble_clock_sync_interval_min = sensors.ble_clock_sync_interval_min;
  }

  // Managed firmware update. The snapshot was memset above, so the status
  // string is always written here rather than relying on its member default.
  strncpy(s.firmware_update_status, "unknown", sizeof(s.firmware_update_status) - 1);
#ifdef LV6_HAS_UPDATE
  if (this->firmware_update_ != nullptr) {
    const char *status = "unknown";
    switch (this->firmware_update_->state) {
      case update::UPDATE_STATE_NO_UPDATE:  status = "no_update";  break;
      case update::UPDATE_STATE_AVAILABLE:  status = "available";  break;
      case update::UPDATE_STATE_INSTALLING: status = "installing"; break;
      default:                              status = "unknown";    break;
    }
    strncpy(s.firmware_update_status, status, sizeof(s.firmware_update_status) - 1);
    s.firmware_update_available = this->firmware_update_->state == update::UPDATE_STATE_AVAILABLE;
    sanitize_text(this->firmware_update_->update_info.current_version, s.firmware_update_current,
                  sizeof(s.firmware_update_current));
    sanitize_text(this->firmware_update_->update_info.latest_version, s.firmware_update_latest,
                  sizeof(s.firmware_update_latest));
  }
#endif
  s.firmware_update_status[sizeof(s.firmware_update_status) - 1] = '\0';

  if (xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(5)) == pdTRUE) {
    memcpy(&this->snapshot_, &s, sizeof(s));
    this->snapshot_ready_ = true;
    xSemaphoreGive(snapshot_lock_);
  }
}

void LV6Dashboard::setup() {
  if (this->base_ == nullptr) {
    ESP_LOGE(TAG, "web_server_base is null; dashboard handler not registered");
    return;
  }

  this->action_lock_ = xSemaphoreCreateMutex();
  this->snapshot_lock_ = xSemaphoreCreateMutex();
  this->history_lock_ = xSemaphoreCreateMutex();
  if (!this->logs_.init())
    ESP_LOGW(TAG, "Log rings unavailable; /logs will be empty");

#ifdef USE_LOGGER
  // Tap the ESPHome logger so the dashboard Logs view can stream device logs.
  // The callback runs on arbitrary tasks; it must stay non-blocking (see on_log_).
  if (logger::global_logger != nullptr)
    logger::global_logger->add_log_callback(this, &LV6Dashboard::on_log_static_);
#endif

  // Prime snapshot so the first GET doesn't return 503.
  this->update_snapshot_();
  this->snapshot_last_ms_ = millis();

  this->base_->init();
  this->base_->add_handler(this);
  ESP_LOGI(TAG, "Dashboard endpoints registered: /, /dashboard (redirect), /dashboard.js");
}

// =============================================================================
// FreeRTOS runtime diagnostics (CONFIG_FREERTOS_GENERATE_RUN_TIME_STATS)
// =============================================================================

void LV6Dashboard::sample_cpu_load_() {
  UBaseType_t count = uxTaskGetNumberOfTasks();
  if (count == 0)
    return;
  task_status_buf_.resize(count + 4);  // headroom for tasks spawned mid-call
  uint32_t total_runtime = 0;
  UBaseType_t got = uxTaskGetSystemState(task_status_buf_.data(),
                                         (UBaseType_t) task_status_buf_.size(), &total_runtime);
  if (got == 0)
    return;

  uint32_t idle0 = 0, idle1 = 0;
  for (UBaseType_t i = 0; i < got; i++) {
    const char *name = task_status_buf_[i].pcTaskName;
    if (name == nullptr)
      continue;
    if (strcmp(name, "IDLE0") == 0 || strcmp(name, "IDLE") == 0)
      idle0 = task_status_buf_[i].ulRunTimeCounter;
    else if (strcmp(name, "IDLE1") == 0)
      idle1 = task_status_buf_[i].ulRunTimeCounter;
  }

  // Need a previous sample, and skip the cycle when the run-time counter wrapped.
  if (cpu_last_total_ > 0 && total_runtime > cpu_last_total_) {
    float dt = (float) (total_runtime - cpu_last_total_);
    float c0 = 100.0f - (float) (idle0 - cpu_last_idle0_) / dt * 100.0f;
    float c1 = 100.0f - (float) (idle1 - cpu_last_idle1_) / dt * 100.0f;
    cpu0_pct_ = std::max(0.0f, std::min(100.0f, c0));
    cpu1_pct_ = std::max(0.0f, std::min(100.0f, c1));
  }
  cpu_last_total_ = total_runtime;
  cpu_last_idle0_ = idle0;
  cpu_last_idle1_ = idle1;
}

void LV6Dashboard::dump_task_stats_() {
  UBaseType_t count = uxTaskGetNumberOfTasks();
  if (count == 0)
    return;
  task_status_buf_.resize(count + 4);
  uint32_t total_runtime = 0;
  UBaseType_t got = uxTaskGetSystemState(task_status_buf_.data(),
                                         (UBaseType_t) task_status_buf_.size(), &total_runtime);
  if (got == 0 || total_runtime == 0)
    return;

  ESP_LOGI(TAG, "--- task stats: %u tasks | core0=%.0f%% core1=%.0f%% | heap int=%uKB psram=%uKB ---",
           (unsigned) got, cpu0_pct_, cpu1_pct_,
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_INTERNAL) / 1024),
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_SPIRAM) / 1024));
  // ulRunTimeCounter is the lifetime counter, so cpu% here is the since-boot
  // average per task (the live per-core figures above cover "now"). stack_free
  // is the lifetime minimum free stack — a small value flags near-overflow.
  for (UBaseType_t i = 0; i < got; i++) {
    const TaskStatus_t &t = task_status_buf_[i];
    float pct = (float) t.ulRunTimeCounter / (float) total_runtime * 100.0f;
    ESP_LOGI(TAG, "  %-16s pri=%2u cpu=%5.1f%% stack_free=%uB",
             t.pcTaskName ? t.pcTaskName : "?", (unsigned) t.uxCurrentPriority, pct,
             (unsigned) (t.usStackHighWaterMark * sizeof(StackType_t)));
  }
}

void LV6Dashboard::loop() {
  if (action_lock_ == nullptr)
    return;

  std::vector<DashboardAction> todo;
  if (xSemaphoreTake(action_lock_, pdMS_TO_TICKS(10)) == pdTRUE) {
    if (!action_queue_.empty()) {
      todo = action_queue_;
      action_queue_.clear();
    }
    xSemaphoreGive(action_lock_);
  }
  for (const auto &act : todo) {
    dispatch_set_(act);
    if (data_revision_ != UINT32_MAX)
      data_revision_++;
  }
  this->expire_coordinator_commands_();

  // Update snapshot at 1 Hz (int32_t cast for millis() rollover safety).
  const uint32_t now = millis();
  // Sample per-core CPU load every 2 s (needs two samples before it reports).
  if ((int32_t)(now - cpu_last_sample_ms_) >= (int32_t)CPU_SAMPLE_INTERVAL_MS) {
    cpu_last_sample_ms_ = now;
    sample_cpu_load_();
  }
  if ((int32_t)(now - snapshot_last_ms_) >= (int32_t)SNAPSHOT_INTERVAL_MS) {
    snapshot_last_ms_ = now;
    update_snapshot_();
  }

  // Sample zone-state history every 5 minutes.
  if ((int32_t)(now - history_last_sample_ms_) >= (int32_t)HISTORY_INTERVAL_MS) {
    history_last_sample_ms_ = now;
    sample_history_();
  }
}

static constexpr const char V1_PREFIX[] = "/api/hv6/v1";
static constexpr size_t V1_PREFIX_LEN = sizeof(V1_PREFIX) - 1;

bool LV6Dashboard::canHandle(AsyncWebServerRequest *request) const {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);
  if (url == "/" || url == "/dashboard" || url == "/dashboard/" || is_dashboard_js_url(url.c_str()))
    return true;
  return strncmp(url.c_str(), V1_PREFIX, V1_PREFIX_LEN) == 0 && url.c_str()[V1_PREFIX_LEN] == '/';
}

void LV6Dashboard::handleRequest(AsyncWebServerRequest *request) {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);

  if (url == "/dashboard" || url == "/dashboard/") {
    httpd_req_t *req = *request;
    httpd_resp_set_status(req, "308 Permanent Redirect");
    httpd_resp_set_hdr(req, "Location", "/");
    httpd_resp_set_hdr(req, "Cache-Control", "no-store");
    httpd_resp_send(req, nullptr, 0);
    return;
  }
  if (url == "/") {
    this->handle_root_(request);
    return;
  }
  if (is_dashboard_js_url(url.c_str())) {
    this->handle_js_(request);
    return;
  }
  if (strncmp(url.c_str(), V1_PREFIX, V1_PREFIX_LEN) == 0 && url.c_str()[V1_PREFIX_LEN] == '/') {
    this->handle_v1_(request, url.c_str() + V1_PREFIX_LEN);
    return;
  }

  send_text_(request, 404, "text/plain", "Not found");
}

void LV6Dashboard::handle_root_(AsyncWebServerRequest *request) {
  send_text_(request, 200, "text/html; charset=utf-8", DASHBOARD_HTML, false,
             "no-store, no-cache, max-age=0, must-revalidate");
}

void LV6Dashboard::handle_js_(AsyncWebServerRequest *request) {
#ifdef LV6_HAS_DASHBOARD_JS
  send_gzip_chunked_(request, "application/javascript; charset=utf-8",
                     LV6_DASHBOARD_JS_DATA, LV6_DASHBOARD_JS_SIZE,
                     "no-store, no-cache, max-age=0, must-revalidate");
#else
  send_text_(request, 404, "text/plain",
             "dashboard.js not configured. Add dashboard_js: web/dashboard.js to lv6_dashboard.");
#endif
}

void LV6Dashboard::send_text_(AsyncWebServerRequest *request, int code, const char *content_type,
                              const char *body, bool cors, const char *cache_control) {
  if (request == nullptr)
    return;
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, http_status_line(code));
  httpd_resp_set_type(req, content_type);
  httpd_resp_set_hdr(req, "Connection", "close");
  if (cache_control != nullptr)
    httpd_resp_set_hdr(req, "Cache-Control", cache_control);
  // Browser reads are same-origin. Deliberately do not emit wildcard CORS:
  // custom write headers are part of the CSRF boundary.
  (void) cors;
  httpd_resp_send(req, body != nullptr ? body : "", HTTPD_RESP_USE_STRLEN);
}

void LV6Dashboard::send_gzip_chunked_(AsyncWebServerRequest *request, const char *content_type,
                                      const uint8_t *data, size_t length,
                                      const char *cache_control) {
  if (request == nullptr || data == nullptr)
    return;
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, content_type);
  httpd_resp_set_hdr(req, "Content-Encoding", "gzip");
  httpd_resp_set_hdr(req, "Connection", "close");
  if (cache_control != nullptr)
    httpd_resp_set_hdr(req, "Cache-Control", cache_control);

  size_t offset = 0;
  while (offset < length) {
    const size_t to_send = std::min(STATIC_CHUNK_SIZE, length - offset);
    if (httpd_resp_send_chunk(req, reinterpret_cast<const char *>(data + offset), to_send) != ESP_OK)
      return;
    offset += to_send;
  }
  httpd_resp_send_chunk(req, nullptr, 0);
}

void LV6Dashboard::handle_state_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_set_hdr(req_err, "Connection", "close");
    httpd_resp_send(req_err, "Snapshot not ready", HTTPD_RESP_USE_STRLEN);
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  DashboardSnapshot *snap = &this->state_snap_buf_;

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Connection", "close");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;

  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  char num_buf[24];

  appendf(buf, BUF_SIZE, offset, "{");

  // --- uptime & wifi ---
  char wifi_buf[24] = "null";
  if (std::isfinite(snap->wifi_dbm)) {
    snprintf(wifi_buf, sizeof(wifi_buf), "%ld", static_cast<long>(std::lround(snap->wifi_dbm)));
  }
  appendf(buf, BUF_SIZE, offset,
      "\"sensor-uptime\":{\"value\":%lu},"
      "\"sensor-wifi_signal\":{\"value\":%s},",
      static_cast<unsigned long>(snap->uptime_s), wifi_buf);

  // --- system diagnostics: per-core CPU load + free heap ---
  format_float_token(num_buf, sizeof(num_buf), snap->cpu0_pct, 1);
  appendf(buf, BUF_SIZE, offset, "\"sensor-cpu_load_core0\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->cpu1_pct, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"sensor-cpu_load_core1\":{\"value\":%s},"
      "\"sensor-free_internal_kb\":{\"value\":%lu},"
      "\"sensor-free_psram_kb\":{\"value\":%lu},",
      num_buf,
      static_cast<unsigned long>(snap->free_internal_kb),
      static_cast<unsigned long>(snap->free_psram_kb));

  // --- manifold temps ---
  format_float_token(num_buf, sizeof(num_buf), snap->manifold_flow_c);
  appendf(buf, BUF_SIZE, offset, "\"sensor-manifold_flow_temperature\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->manifold_return_c);
  appendf(buf, BUF_SIZE, offset, "\"sensor-manifold_return_temperature\":{\"value\":%s},", num_buf);

  // --- zone temperatures ---
  static const char *const ZONE_TEMP_KEYS[6] = {
    "sensor-zone_1_temperature", "sensor-zone_2_temperature", "sensor-zone_3_temperature",
    "sensor-zone_4_temperature", "sensor-zone_5_temperature", "sensor-zone_6_temperature",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_temp_c[i]);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", ZONE_TEMP_KEYS[i], num_buf);
  }

  // --- zone valve positions (0 decimals) ---
  static const char *const ZONE_VALVE_KEYS[6] = {
    "sensor-zone_1_valve_pct", "sensor-zone_2_valve_pct", "sensor-zone_3_valve_pct",
    "sensor-zone_4_valve_pct", "sensor-zone_5_valve_pct", "sensor-zone_6_valve_pct",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_valve_pct[i], 0);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", ZONE_VALVE_KEYS[i], num_buf);
  }

  // --- preheat advance ---
  static const char *const PREHEAT_KEYS[6] = {
    "sensor-zone_1_preheat_advance_c", "sensor-zone_2_preheat_advance_c", "sensor-zone_3_preheat_advance_c",
    "sensor-zone_4_preheat_advance_c", "sensor-zone_5_preheat_advance_c", "sensor-zone_6_preheat_advance_c",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_preheat_c[i]);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", PREHEAT_KEYS[i], num_buf);
  }

  // flush: cumulative ~1330 bytes; motor ripples (~840) would overflow
  if (!flush()) return;

  // --- motor learned ripples (0 decimals) ---
  static const char *const OPEN_RIPPLE_KEYS[6] = {
    "sensor-motor_1_learned_open_ripples", "sensor-motor_2_learned_open_ripples", "sensor-motor_3_learned_open_ripples",
    "sensor-motor_4_learned_open_ripples", "sensor-motor_5_learned_open_ripples", "sensor-motor_6_learned_open_ripples",
  };
  static const char *const CLOSE_RIPPLE_KEYS[6] = {
    "sensor-motor_1_learned_close_ripples", "sensor-motor_2_learned_close_ripples", "sensor-motor_3_learned_close_ripples",
    "sensor-motor_4_learned_close_ripples", "sensor-motor_5_learned_close_ripples", "sensor-motor_6_learned_close_ripples",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->motor_open_ripple[i], 0);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", OPEN_RIPPLE_KEYS[i], num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->motor_close_ripple[i], 0);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", CLOSE_RIPPLE_KEYS[i], num_buf);
  }

  // flush: motor factors (~900) would overflow
  if (!flush()) return;

  // --- motor learned factors (2 decimals) ---
  static const char *const OPEN_FACTOR_KEYS[6] = {
    "sensor-motor_1_learned_open_factor", "sensor-motor_2_learned_open_factor", "sensor-motor_3_learned_open_factor",
    "sensor-motor_4_learned_open_factor", "sensor-motor_5_learned_open_factor", "sensor-motor_6_learned_open_factor",
  };
  static const char *const CLOSE_FACTOR_KEYS[6] = {
    "sensor-motor_1_learned_close_factor", "sensor-motor_2_learned_close_factor", "sensor-motor_3_learned_close_factor",
    "sensor-motor_4_learned_close_factor", "sensor-motor_5_learned_close_factor", "sensor-motor_6_learned_close_factor",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->motor_open_factor[i], 2);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", OPEN_FACTOR_KEYS[i], num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->motor_close_factor[i], 2);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", CLOSE_FACTOR_KEYS[i], num_buf);
  }

  // flush: probe temps + text sensors would overflow combined
  if (!flush()) return;

  // --- probe temperatures ---
  static const char *const PROBE_TEMP_KEYS[8] = {
    "sensor-probe_1_temperature", "sensor-probe_2_temperature", "sensor-probe_3_temperature",
    "sensor-probe_4_temperature", "sensor-probe_5_temperature", "sensor-probe_6_temperature",
    "sensor-probe_7_temperature", "sensor-probe_8_temperature",
  };
  for (uint8_t i = 0; i < 8; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->probe_temp_c[i]);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", PROBE_TEMP_KEYS[i], num_buf);
  }

  // flush: text sensors (~1200) would overflow combined with probe temps (~460)
  if (!flush()) return;

  // --- text sensors (pre-sanitized in snapshot) ---
  static const char *const ZONE_STATE_KEYS[6] = {
    "text_sensor-zone_1_state", "text_sensor-zone_2_state", "text_sensor-zone_3_state",
    "text_sensor-zone_4_state", "text_sensor-zone_5_state", "text_sensor-zone_6_state",
  };
  static const char *const MOTOR_FAULT_KEYS[6] = {
    "text_sensor-motor_1_last_fault", "text_sensor-motor_2_last_fault", "text_sensor-motor_3_last_fault",
    "text_sensor-motor_4_last_fault", "text_sensor-motor_5_last_fault", "text_sensor-motor_6_last_fault",
  };

  appendf(buf, BUF_SIZE, offset, "\"text_sensor-firmware_version\":{\"state\":\"%s\"},", snap->firmware_version);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-ip_address\":{\"state\":\"%s\"},", snap->ip_address);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-connected_ssid\":{\"state\":\"%s\"},", snap->connected_ssid);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-mac_address\":{\"state\":\"%s\"},", snap->mac_address);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-reset_reason\":{\"state\":\"%s\"},", snap->reset_reason);
  appendf(buf, BUF_SIZE, offset, "\"text-device_variant\":{\"state\":\"%s\"},", dashboard_variant_str());
  appendf(buf, BUF_SIZE, offset,
          "\"firmware_update\":{\"current\":\"%s\",\"latest\":\"%s\",\"available\":%s,\"status\":\"%s\"},",
          snap->firmware_update_current, snap->firmware_update_latest,
          snap->firmware_update_available ? "true" : "false", snap->firmware_update_status);

  for (uint8_t i = 0; i < 6; i++) {
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"state\":\"%s\"},", ZONE_STATE_KEYS[i], snap->zone_state[i]);
  }
  for (uint8_t i = 0; i < 6; i++) {
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"state\":\"%s\"},", MOTOR_FAULT_KEYS[i], snap->motor_fault[i]);
  }

  // flush before config section; each zone config (~550 bytes) would overflow combined
  if (!flush()) return;

  // ---- config (read entirely from snapshot — no config_store_ calls) ----
  static const char *const PIPE_TYPE_STR[] = {
    "PEX 12mm", "PEX 14mm", "PEX 16mm", "PEX 17mm",
    "PEX 18mm", "PEX 20mm", "ALUPEX 16mm", "ALUPEX 20mm"
  };
  static const char *const MOTOR_PROFILE_STR[] = {
    "Inherit", "Generic", "HmIP VdMot"
  };

  // --- zone configs: flush after each to stay within buffer ---
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    const lv6::ZoneConfig &z = snap->zones[i];
    const uint8_t zn = i + 1;

    appendf(buf, BUF_SIZE, offset,
        "\"switch-zone_%u_enabled\":{\"state\":\"%s\"},"
        "\"number-zone_%u_setpoint\":{\"value\":",
        zn, z.enabled ? "on" : "off", zn);
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    appendf(buf, BUF_SIZE, offset, "%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_base_setpoint\":{\"value\":%s},", zn, num_buf);
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_effective_setpoint\":{\"value\":%s},", zn, num_buf);
    format_float_token(num_buf, sizeof(num_buf), this->coordinator_command_offsets_c_[i], 2);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_coordinator_offset\":{\"value\":%s},", zn, num_buf);
    const uint32_t remaining_s = this->coordinator_command_expires_at_ms_[i] > millis()
        ? (this->coordinator_command_expires_at_ms_[i] - millis()) / 1000UL : 0UL;
    appendf(buf, BUF_SIZE, offset, "\"sensor-zone_%u_coordinator_remaining_s\":{\"value\":%lu},", zn, static_cast<unsigned long>(remaining_s));

    format_float_token(num_buf, sizeof(num_buf), z.area_m2, 1);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_area_m2\":{\"value\":%s},", zn, num_buf);

    format_float_token(num_buf, sizeof(num_buf), z.pipe_spacing_mm, 0);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_pipe_spacing_mm\":{\"value\":%s},", zn, num_buf);

    const int8_t probe_idx = snap->probes.zone_return_probe[i];
    if (probe_idx >= 0 && probe_idx < static_cast<int8_t>(lv6::MAX_PROBES)) {
      appendf(buf, BUF_SIZE, offset,
          "\"select-zone_%u_probe\":{\"state\":\"Probe %d\"},",
          zn, static_cast<int>(probe_idx) + 1);
    } else {
      appendf(buf, BUF_SIZE, offset, "\"select-zone_%u_probe\":{\"state\":\"None\"},", zn);
    }

    const char *src_str = temp_source_to_dashboard_str(snap->zone_temp_source[i]);
    appendf(buf, BUF_SIZE, offset,
        "\"select-zone_%u_temp_source\":{\"state\":\"%s\"},", zn, src_str);

    if (z.sync_to_zone >= 0 && z.sync_to_zone < static_cast<int8_t>(lv6::NUM_ZONES)) {
      appendf(buf, BUF_SIZE, offset,
          "\"select-zone_%u_sync_to\":{\"state\":\"Zone %d\"},",
          zn, static_cast<int>(z.sync_to_zone) + 1);
    } else {
      appendf(buf, BUF_SIZE, offset, "\"select-zone_%u_sync_to\":{\"state\":\"None\"},", zn);
    }

    const uint8_t pt_idx = static_cast<uint8_t>(z.pipe_type);
    const char *pt_str = (pt_idx < 8) ? PIPE_TYPE_STR[pt_idx] : "Unknown";
    appendf(buf, BUF_SIZE, offset, "\"select-zone_%u_pipe_type\":{\"state\":\"%s\"},", zn, pt_str);

    appendf(buf, BUF_SIZE, offset,
        "\"text-zone_%u_ble_mac\":{\"state\":\"%s\"},", zn, snap->zone_ble_mac[i]);

    // Friendly zone name — JSON-escape quotes/backslashes/control chars.
    char name_esc[2 * sizeof(z.name)];
    size_t nesc = 0;
    for (size_t j = 0; z.name[j] != '\0' && nesc < sizeof(name_esc) - 2; j++) {
      char c = z.name[j];
      if (c == '"' || c == '\\') name_esc[nesc++] = '\\';
      name_esc[nesc++] = (c >= 0x20) ? c : ' ';
    }
    name_esc[nesc] = '\0';
    appendf(buf, BUF_SIZE, offset,
        "\"text-zone_%u_name\":{\"state\":\"%s\"},", zn, name_esc);

    // flush after each zone to stay within buffer
    if (!flush()) return;
  }

  // --- global config ---
  appendf(buf, BUF_SIZE, offset,
      "\"switch-motor_drivers_enabled\":{\"state\":\"%s\"},",
      snap->drivers_enabled ? "on" : "off");

  appendf(buf, BUF_SIZE, offset,
      "\"switch-simple_preheat_enabled\":{\"state\":\"%s\"},",
      snap->simple_preheat_enabled ? "on" : "off");

  format_float_token(num_buf, sizeof(num_buf), snap->preheat_absorb_band_c, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"switch-preheat_absorb_enabled\":{\"state\":\"%s\"},"
      "\"text-preheat_absorbing\":{\"state\":\"%s\"},"
      "\"number-preheat_absorb_band_c\":{\"value\":%s},",
      snap->preheat_absorb_enabled ? "on" : "off",
      snap->preheat_absorbing ? "active" : "idle",
      num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->preheat_detect_delta_c, 1);
  appendf(buf, BUF_SIZE, offset, "\"number-preheat_detect_delta_c\":{\"value\":%s},", num_buf);

  appendf(buf, BUF_SIZE, offset,
      "\"select-manifold_type\":{\"state\":\"%s\"},"
      "\"select-manifold_flow_probe\":{\"state\":\"Probe %d\"},"
      "\"select-manifold_return_probe\":{\"state\":\"Probe %d\"},",
      snap->manifold_type == lv6::ManifoldType::NC ? "NC (Normally Closed)" : "NO (Normally Open)",
      static_cast<int>(snap->probes.manifold_flow_probe) + 1,
      static_cast<int>(snap->probes.manifold_return_probe) + 1);

  const uint8_t mp_idx = static_cast<uint8_t>(snap->motor.default_profile);
  const char *mp_str = (mp_idx < 3) ? MOTOR_PROFILE_STR[mp_idx] : "Generic";
  appendf(buf, BUF_SIZE, offset, "\"select-motor_profile_default\":{\"state\":\"%s\"},", mp_str);

  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-close_threshold_multiplier\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_slope_threshold_ma_per_s, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-close_slope_threshold\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_slope_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-close_slope_current_factor\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_threshold_multiplier\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_slope_threshold_ma_per_s, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_slope_threshold\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_slope_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_slope_current_factor\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_ripple_limit_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_ripple_limit_factor\":{\"value\":%s},", num_buf);
  appendf(buf, BUF_SIZE, offset,
      "\"number-generic_runtime_limit_seconds\":{\"value\":%lu},"
      "\"number-hmip_runtime_limit_seconds\":{\"value\":%lu},"
      "\"number-relearn_after_movements\":{\"value\":%lu},"
      "\"number-relearn_after_hours\":{\"value\":%lu},"
      "\"number-learned_factor_min_samples\":{\"value\":%u},",
      static_cast<unsigned long>(snap->motor.generic_profile_runtime_limit_s),
      static_cast<unsigned long>(snap->motor.hmip_vdmot_runtime_limit_s),
      static_cast<unsigned long>(snap->motor.relearn_after_movements),
      static_cast<unsigned long>(snap->motor.relearn_after_hours),
      static_cast<unsigned>(snap->motor.learned_factor_min_samples));
  format_float_token(num_buf, sizeof(num_buf), snap->motor.learned_factor_max_deviation_pct * 100.0f, 2);
  appendf(buf, BUF_SIZE, offset,
      "\"number-learned_factor_max_deviation_pct\":{\"value\":%s},", num_buf);

  // flush before authority/flow section
  if (!flush()) return;

  // --- Touch authority + local secondary-flow commissioning ---
  appendf(buf, BUF_SIZE, offset,
      "\"text-authority_state\":{\"state\":\"%s\"},"
      "\"text-authority_reason\":{\"state\":\"%s\"},"
      "\"text-authority_installation_id\":{\"state\":\"%s\"},"
      "\"text-authority_coordinator_id\":{\"state\":\"%s\"},"
      "\"text-authority_proposal_installation_id\":{\"state\":\"%s\"},"
      "\"text-authority_proposal_coordinator_id\":{\"state\":\"%s\"},"
      "\"text-authority_proposal_name\":{\"state\":\"%s\"},"
      "\"text-authority_proposal_site\":{\"state\":\"%s\"},"
      "\"binary_sensor-authority_proposal_pending\":{\"state\":\"%s\",\"value\":%s},"
      "\"binary_sensor-authority_configured\":{\"state\":\"%s\",\"value\":%s},"
      "\"sensor-authority_lease_remaining_s\":{\"state\":%lu},",
      snap->authority_state, snap->authority_reason,
      snap->authority.installation_id, snap->authority.coordinator_id,
      authority_proposal_installation_id_, authority_proposal_coordinator_id_,
      authority_proposal_name_, authority_proposal_site_,
      authority_proposal_expires_at_ms_ != 0 &&
              static_cast<int32_t>(authority_proposal_expires_at_ms_ - millis()) > 0 ? "on" : "off",
      authority_proposal_expires_at_ms_ != 0 &&
              static_cast<int32_t>(authority_proposal_expires_at_ms_ - millis()) > 0 ? "true" : "false",
      snap->authority.shared_key[0] != '\0' ? "on" : "off",
      snap->authority.shared_key[0] != '\0' ? "true" : "false",
      static_cast<unsigned long>(snap->authority_lease_remaining_s));
  format_float_token(num_buf, sizeof(num_buf), snap->min_zone_flow_pct, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"switch-minimum_flow_always\":{\"state\":\"%s\"},"
      "\"number-min_zone_flow_pct\":{\"value\":%s},",
      snap->minimum_flow_always ? "on" : "off",
      num_buf);
  appendf(buf, BUF_SIZE, offset,
      "\"switch-ble_clock_sync_enabled\":{\"state\":\"%s\"},"
      "\"number-ble_clock_sync_interval_min\":{\"value\":%u},"
      "\"sensor-ble_clock_sync_last_ok_s\":{\"value\":%lu},"
      "\"text-ble_clock_sync_last_error\":{\"state\":\"%s\"},"
      "\"binary_sensor-ble_clock_sync_advertising\":{\"state\":\"%s\"},",
      snap->ble_clock_sync_enabled ? "on" : "off",
      static_cast<unsigned>(snap->ble_clock_sync_interval_min),
      static_cast<unsigned long>(snap->ble_clock_sync_last_ok_s),
      snap->ble_clock_sync_last_error,
      snap->ble_clock_sync_advertising ? "on" : "off");
  // Sentinel field closes the JSON object and absorbs any trailing comma.
  appendf(buf, BUF_SIZE, offset, "\"_\":{}}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
}

void LV6Dashboard::handle_overview_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    send_text_(request, 503, "application/json", "{\"ok\":false,\"error\":{\"code\":\"snapshot_not_ready\"}}",
               true, "no-cache");
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  const DashboardSnapshot *snap = &this->state_snap_buf_;
  uint8_t enabled = 0;
  uint8_t active = 0;
  float valve_sum = 0.0f;
  uint8_t valve_count = 0;
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    if (snap->zones[i].enabled)
      enabled++;
    if (std::isfinite(snap->zone_valve_pct[i])) {
      valve_sum += snap->zone_valve_pct[i];
      valve_count++;
      if (snap->zone_valve_pct[i] > 0.5f)
        active++;
    }
  }

  char flow[24], ret[24], demand[24], wifi[24];
  format_float_token(flow, sizeof(flow), snap->manifold_flow_c, 1);
  format_float_token(ret, sizeof(ret), snap->manifold_return_c, 1);
  format_float_token(demand, sizeof(demand), valve_count ? valve_sum / valve_count : NAN, 0);
  format_float_token(wifi, sizeof(wifi), snap->wifi_dbm, 0);
  char pairing_fingerprint[24];
  format_pairing_fingerprint(snap->mac_address, pairing_fingerprint, sizeof(pairing_fingerprint));

  snprintf(this->json_buf_, sizeof(this->json_buf_),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"node\":{\"model\":\"lune-v6\","
           "\"firmware\":\"%s\",\"ip\":\"%s\",\"ssid\":\"%s\",\"mac\":\"%s\","
           "\"pairing_fingerprint\":\"%s\",\"uptime_s\":%lu},"
           "\"pairing\":{\"method\":\"mac-fingerprint-v1\",\"fingerprint\":\"%s\"},"
           "\"coordination\":{\"installation_id\":\"%s\",\"coordinator_id\":\"%s\","
           "\"control_approved\":%s},"
           "\"zones\":{\"count\":%u,\"enabled\":%u,\"active\":%u,\"open_valves\":%u},"
           "\"manifold\":{\"flow_c\":%s,\"return_c\":%s,\"mean_valve_pct\":%s},"
           "\"system\":{\"wifi_dbm\":%s,\"drivers_enabled\":%s,\"free_internal_kb\":%lu,"
           "\"free_psram_kb\":%lu},\"safety\":{\"local_authority\":true,\"commands_clamped\":true,"
           "\"minimum_flow_always\":%s}}}",
           snap->firmware_version, snap->ip_address, snap->connected_ssid, snap->mac_address,
           pairing_fingerprint, static_cast<unsigned long>(snap->uptime_s),
           pairing_fingerprint,
           snap->authority.installation_id, snap->authority.coordinator_id,
           snap->authority.installation_id[0] != '\0' &&
                   snap->authority.coordinator_id[0] != '\0' &&
                   snap->authority.shared_key[0] != '\0' ? "true" : "false",
           static_cast<unsigned>(lv6::NUM_ZONES), static_cast<unsigned>(enabled),
           static_cast<unsigned>(active), static_cast<unsigned>(active),
           flow, ret, demand, wifi, snap->drivers_enabled ? "true" : "false",
           static_cast<unsigned long>(snap->free_internal_kb),
           static_cast<unsigned long>(snap->free_psram_kb),
           snap->minimum_flow_always ? "true" : "false");
  send_text_(request, 200, "application/json", this->json_buf_, true, "no-cache");
}

void LV6Dashboard::handle_zones_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    send_text_(request, 503, "application/json", "{\"ok\":false,\"error\":{\"code\":\"snapshot_not_ready\"}}",
               true, "no-cache");
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  const DashboardSnapshot *snap = &this->state_snap_buf_;
  char *buf = this->json_buf_;
  size_t off = 0;
  appendf(buf, sizeof(this->json_buf_), off, "{\"ok\":true,\"version\":\"v1\",\"data\":{\"count\":%u,\"zones\":[",
          static_cast<unsigned>(lv6::NUM_ZONES));
  for (uint8_t i = 0; i < lv6::NUM_ZONES && off + 360 < sizeof(this->json_buf_); i++) {
    char temp[24], setpoint[24], valve[24], preload[24];
    format_float_token(temp, sizeof(temp), snap->zone_temp_c[i], 1);
    format_float_token(setpoint, sizeof(setpoint), snap->zones[i].setpoint_c, 1);
    format_float_token(valve, sizeof(valve), snap->zone_valve_pct[i], 0);
    format_float_token(preload, sizeof(preload), snap->zone_preheat_c[i], 1);
    char wind[24], solar[24], max_offset[24];
    format_float_token(wind, sizeof(wind), snap->zones[i].wind_exposure, 2);
    format_float_token(solar, sizeof(solar), snap->zones[i].solar_gain_factor, 2);
    format_float_token(max_offset, sizeof(max_offset), snap->zones[i].max_offset_c, 2);
    appendf(buf, sizeof(this->json_buf_), off,
            "%s{\"zone\":%u,\"name\":\"",
            i ? "," : "", static_cast<unsigned>(i + 1));
    append_json_escaped(buf, sizeof(this->json_buf_), off, snap->zones[i].name);
    appendf(buf, sizeof(this->json_buf_), off,
            "\",\"friendly_name\":\"");
    append_json_escaped(buf, sizeof(this->json_buf_), off, snap->zones[i].name);
    appendf(buf, sizeof(this->json_buf_), off,
            "\",\"enabled\":%s,\"temperature_c\":%s,\"setpoint_c\":%s,\"valve_pct\":%s,"
            "\"preheat_c\":%s,\"state\":\"%s\",\"temp_source\":\"%s\",\"fresh\":%s,"
            "\"forecast\":{\"wind_exposure\":%s,\"solar_gain\":%s,"
            "\"thermal_lead_h\":%u,\"max_offset_c\":%s}}",
            snap->zones[i].enabled ? "true" : "false", temp, setpoint, valve, preload,
            snap->zone_state[i], temp_source_to_dashboard_str(snap->zone_temp_source[i]),
            std::isfinite(snap->zone_temp_c[i]) ? "true" : "false",
            wind, solar,
            static_cast<unsigned>(snap->zones[i].thermal_lead_h), max_offset);
  }
  appendf(buf, sizeof(this->json_buf_), off, "]}}");
  send_text_(request, 200, "application/json", buf, true, "no-cache");
}

void LV6Dashboard::handle_zone_(AsyncWebServerRequest *request, uint8_t zone) {
  if (zone < 1 || zone > lv6::NUM_ZONES) {
    this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
    return;
  }
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    send_text_(request, 503, "application/json", "{\"ok\":false,\"error\":{\"code\":\"snapshot_not_ready\"}}",
               true, "no-cache");
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  const uint8_t i = zone - 1;
  const DashboardSnapshot *snap = &this->state_snap_buf_;
  const lv6::ZoneConfig &z = snap->zones[i];
  char temp[24], setpoint[24], valve[24], preload[24], probe[24];
  char area[24], spacing[24], wind[24], solar[24], max_offset[24];
  char open_ripple[24], close_ripple[24], open_factor[24], close_factor[24];
  char loop_length[24], design_flow[24], measured_flow[24], actuator_cal[24], thermal_delay[24];
  format_float_token(temp, sizeof(temp), snap->zone_temp_c[i], 1);
  format_float_token(setpoint, sizeof(setpoint), z.setpoint_c, 1);
  format_float_token(valve, sizeof(valve), snap->zone_valve_pct[i], 0);
  format_float_token(preload, sizeof(preload), snap->zone_preheat_c[i], 1);
  format_float_token(area, sizeof(area), z.area_m2, 1);
  format_float_token(spacing, sizeof(spacing), z.pipe_spacing_mm, 0);
  format_float_token(wind, sizeof(wind), z.wind_exposure, 2);
  format_float_token(solar, sizeof(solar), z.solar_gain_factor, 2);
  format_float_token(max_offset, sizeof(max_offset), z.max_offset_c, 2);
  format_float_token(open_ripple, sizeof(open_ripple), snap->motor_open_ripple[i], 0);
  format_float_token(close_ripple, sizeof(close_ripple), snap->motor_close_ripple[i], 0);
  format_float_token(open_factor, sizeof(open_factor), snap->motor_open_factor[i], 2);
  format_float_token(close_factor, sizeof(close_factor), snap->motor_close_factor[i], 2);
  format_float_token(loop_length, sizeof(loop_length), z.loop_pipe_length_m, 1);
  format_float_token(design_flow, sizeof(design_flow), z.design_flow_l_h, 1);
  format_float_token(measured_flow, sizeof(measured_flow), z.measured_flow_l_h, 1);
  format_float_token(actuator_cal, sizeof(actuator_cal), z.actuator_calibration_pct, 1);
  format_float_token(thermal_delay, sizeof(thermal_delay), z.expected_thermal_delay_min, 1);

  const int8_t probe_idx = snap->probes.zone_return_probe[i];
  if (probe_idx >= 0 && probe_idx < static_cast<int8_t>(lv6::MAX_PROBES))
    format_float_token(probe, sizeof(probe), snap->probe_temp_c[probe_idx], 1);
  else
    snprintf(probe, sizeof(probe), "null");

  char *buf = this->json_buf_;
  size_t off = 0;
  appendf(buf, sizeof(this->json_buf_), off,
          "{\"ok\":true,\"version\":\"v1\",\"data\":{\"zone\":%u,\"name\":\"",
          static_cast<unsigned>(zone));
  append_json_escaped(buf, sizeof(this->json_buf_), off, z.name);
  appendf(buf, sizeof(this->json_buf_), off,
          "\",\"enabled\":%s,\"state\":\"%s\",\"fresh\":%s,"
          "\"temperature_c\":%s,\"setpoint_c\":%s,\"valve_pct\":%s,\"preheat_c\":%s,"
          "\"temp_source\":\"%s\",\"probe_index\":%d,\"probe_temp_c\":%s,\"ble_mac\":\"%s\","
          "\"settings\":{\"area_m2\":%s,\"pipe_spacing_mm\":%s,\"pipe_type\":%u,"
          "\"sync_to_zone\":%d,\"abs_min_c\":%.1f,\"abs_max_c\":%.1f,"
          "\"min_offset_c\":%.2f,\"max_offset_c\":%.2f},"
          "\"forecast\":{\"wind_exposure\":%s,\"solar_gain\":%s,"
          "\"thermal_lead_h\":%u,\"max_offset_c\":%s},"
          "\"commissioning\":{\"manifold_id\":\"%s\",\"manifold_port\":%u,\"room_id\":\"%s\","
          "\"loop_pipe_length_m\":%s,\"design_flow_l_h\":%s,\"measured_flow_l_h\":%s,"
          "\"flooring_type\":%u,\"actuator_calibration_pct\":%s,\"expected_thermal_delay_min\":%s},"
          "\"motor\":{\"fault\":\"%s\",\"open_ripples\":%s,\"close_ripples\":%s,"
          "\"open_factor\":%s,\"close_factor\":%s}}}",
          z.enabled ? "true" : "false", snap->zone_state[i],
          std::isfinite(snap->zone_temp_c[i]) ? "true" : "false",
          temp, setpoint, valve, preload, temp_source_to_dashboard_str(snap->zone_temp_source[i]),
          probe_idx >= 0 ? static_cast<int>(probe_idx) + 1 : 0, probe, snap->zone_ble_mac[i],
          area, spacing, static_cast<unsigned>(z.pipe_type),
          z.sync_to_zone >= 0 ? static_cast<int>(z.sync_to_zone) + 1 : 0,
          z.abs_min_c, z.abs_max_c, z.min_offset_c, z.max_offset_c,
          wind, solar,
          static_cast<unsigned>(z.thermal_lead_h), max_offset,
          z.manifold_id, static_cast<unsigned>(z.manifold_port), z.room_id,
          loop_length, design_flow, measured_flow, static_cast<unsigned>(z.floor_type), actuator_cal, thermal_delay,
          snap->motor_fault[i], open_ripple, close_ripple, open_factor, close_factor);
  send_text_(request, 200, "application/json", buf, true, "no-cache");
}

void LV6Dashboard::handle_settings_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    send_text_(request, 503, "application/json", "{\"ok\":false,\"error\":{\"code\":\"snapshot_not_ready\"}}",
               true, "no-cache");
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  const DashboardSnapshot *snap = &this->state_snap_buf_;
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Connection", "close");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t off = 0;

  auto flush = [&]() -> bool {
    if (off == 0) return true;
    const bool ok = httpd_resp_send_chunk(req, buf, off) == ESP_OK;
    off = 0;
    return ok;
  };

  char preheat_band[24], preheat_delta[24], min_flow[24];
  format_float_token(preheat_band, sizeof(preheat_band), snap->preheat_absorb_band_c, 1);
  format_float_token(preheat_delta, sizeof(preheat_delta), snap->preheat_detect_delta_c, 1);
  format_float_token(min_flow, sizeof(min_flow), snap->min_zone_flow_pct, 1);

  appendf(buf, BUF_SIZE, off,
          "{\"ok\":true,\"version\":\"v1\",\"data\":{\"control\":{"
          "\"simple_preheat_enabled\":%s,\"preheat_absorb_enabled\":%s,"
          "\"preheat_absorb_band_c\":%s,\"preheat_detect_delta_c\":%s},"
          "\"minimum_flow\":{\"enabled\":%s,\"min_zone_flow_pct\":%s},"
          "\"ble_clock_sync\":{\"enabled\":%s,\"interval_min\":%u,\"last_ok_s\":%lu,"
          "\"last_error\":\"%s\",\"advertising\":%s},"
          "\"manifold\":{\"type\":\"%s\",\"flow_probe\":%d,\"return_probe\":%d},"
          "\"motor\":{\"default_profile\":\"%s\",\"generic_runtime_limit_s\":%lu,"
          "\"hmip_runtime_limit_s\":%lu,\"relearn_after_movements\":%lu,"
          "\"relearn_after_hours\":%lu},"
          "\"authority\":{\"installation_id\":\"%s\",\"coordinator_id\":\"%s\",\"authentication_configured\":%s},\"zones\":[",
          snap->simple_preheat_enabled ? "true" : "false",
          snap->preheat_absorb_enabled ? "true" : "false",
          preheat_band, preheat_delta,
          snap->minimum_flow_always ? "true" : "false", min_flow,
          snap->ble_clock_sync_enabled ? "true" : "false",
          static_cast<unsigned>(snap->ble_clock_sync_interval_min),
          static_cast<unsigned long>(snap->ble_clock_sync_last_ok_s),
          snap->ble_clock_sync_last_error,
          snap->ble_clock_sync_advertising ? "true" : "false",
          snap->manifold_type == lv6::ManifoldType::NC ? "NC" : "NO",
          static_cast<int>(snap->probes.manifold_flow_probe) + 1,
          static_cast<int>(snap->probes.manifold_return_probe) + 1,
          motor_profile_to_api_str(snap->motor.default_profile),
          static_cast<unsigned long>(snap->motor.generic_profile_runtime_limit_s),
          static_cast<unsigned long>(snap->motor.hmip_vdmot_runtime_limit_s),
          static_cast<unsigned long>(snap->motor.relearn_after_movements),
          static_cast<unsigned long>(snap->motor.relearn_after_hours),
          snap->authority.installation_id, snap->authority.coordinator_id,
          snap->authority.shared_key[0] != '\0' ? "true" : "false");
  if (!flush()) return;

  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    char setpoint[24], area[24], spacing[24], min_offset[24], max_offset[24];
    char abs_min[24], abs_max[24], wind[24], solar[24];
    format_float_token(setpoint, sizeof(setpoint), snap->zones[i].setpoint_c, 1);
    format_float_token(area, sizeof(area), snap->zones[i].area_m2, 1);
    format_float_token(spacing, sizeof(spacing), snap->zones[i].pipe_spacing_mm, 0);
    format_float_token(min_offset, sizeof(min_offset), snap->zones[i].min_offset_c, 2);
    format_float_token(max_offset, sizeof(max_offset), snap->zones[i].max_offset_c, 2);
    format_float_token(abs_min, sizeof(abs_min), snap->zones[i].abs_min_c, 1);
    format_float_token(abs_max, sizeof(abs_max), snap->zones[i].abs_max_c, 1);
    format_float_token(wind, sizeof(wind), snap->zones[i].wind_exposure, 2);
    format_float_token(solar, sizeof(solar), snap->zones[i].solar_gain_factor, 2);

    appendf(buf, BUF_SIZE, off,
            "%s{\"zone\":%u,\"name\":\"",
            i ? "," : "", static_cast<unsigned>(i + 1));
    append_json_escaped(buf, BUF_SIZE, off, snap->zones[i].name);
    appendf(buf, BUF_SIZE, off,
            "\",\"enabled\":%s,\"setpoint_c\":%s,\"area_m2\":%s,"
            "\"pipe_spacing_mm\":%s,\"pipe_type\":\"%s\",\"temp_source\":\"%s\","
            "\"probe_index\":%d,\"sync_to_zone\":%d,\"ble_mac\":\"%s\","
            "\"limits\":{\"min_offset_c\":%s,\"max_offset_c\":%s,"
            "\"abs_min_c\":%s,\"abs_max_c\":%s},"
            "\"forecast\":{\"wind_exposure\":%s,"
            "\"solar_gain\":%s,\"thermal_lead_h\":%u,\"max_offset_c\":%s},"
            "\"motor_profile\":\"%s\"}",
            snap->zones[i].enabled ? "true" : "false", setpoint, area, spacing,
            pipe_type_to_api_str(snap->zones[i].pipe_type),
            temp_source_to_dashboard_str(snap->zone_temp_source[i]),
            snap->probes.zone_return_probe[i] >= 0 ? static_cast<int>(snap->probes.zone_return_probe[i]) + 1 : 0,
            snap->zones[i].sync_to_zone >= 0 ? static_cast<int>(snap->zones[i].sync_to_zone) + 1 : 0,
            snap->zone_ble_mac[i], min_offset, max_offset, abs_min, abs_max,
            wind, solar,
            static_cast<unsigned>(snap->zones[i].thermal_lead_h), max_offset,
            motor_profile_to_api_str(snap->zones[i].motor_profile_override));
    if (!flush()) return;
  }

  appendf(buf, BUF_SIZE, off, "]}}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
}

void LV6Dashboard::handle_diagnostics_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    send_text_(request, 503, "application/json", "{\"ok\":false,\"error\":{\"code\":\"snapshot_not_ready\"}}",
               true, "no-cache");
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  const DashboardSnapshot *snap = &this->state_snap_buf_;
  const lv6::MotorSafetyDiagnostics motor_diag = this->valve_controller_
      ? this->valve_controller_->get_motor_safety_diagnostics()
      : lv6::MotorSafetyDiagnostics{};
  char cpu0[24], cpu1[24], flow[24], ret[24];
  format_float_token(cpu0, sizeof(cpu0), snap->cpu0_pct, 1);
  format_float_token(cpu1, sizeof(cpu1), snap->cpu1_pct, 1);
  format_float_token(flow, sizeof(flow), snap->manifold_flow_c, 1);
  format_float_token(ret, sizeof(ret), snap->manifold_return_c, 1);
  lv6::hydraulic_diagnostics::Input hydraulic{};
  float valve_total = 0.0f;
  uint8_t valve_count = 0;
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    if (std::isfinite(snap->zone_valve_pct[i])) {
      valve_total += snap->zone_valve_pct[i];
      valve_count++;
    }
  }
  hydraulic.average_valve_pct = valve_count ? valve_total / valve_count : NAN;
  hydraulic.manifold_delta_known = std::isfinite(snap->manifold_flow_c) &&
                                    std::isfinite(snap->manifold_return_c);
  hydraulic.manifold_delta_c = hydraulic.manifold_delta_known
      ? snap->manifold_flow_c - snap->manifold_return_c : NAN;

  // Keep the large diagnostic assembly buffer out of the HTTP task stack. The
  // endpoint is serialized by ESP-IDF's single request worker, so a static
  // buffer is safe here and leaves ample stack for snprintf/httpd internals.
  static char hydraulic_json[2300];
  memset(hydraulic_json, 0, sizeof(hydraulic_json));
  size_t hydraulic_off = 0;
  const char *const freshness = "snapshot_observed_source_timestamp_unavailable";
  appendf(hydraulic_json, sizeof(hydraulic_json), hydraulic_off, "\"hydraulic_alarms\":[");
  for (uint8_t i = 0; i < 3; i++) {
    const auto alarm = lv6::hydraulic_diagnostics::evaluate(i, hydraulic);
    const char *evidence = "required documented telemetry is unavailable";
    if (i == 1 && hydraulic.manifold_delta_known)
      evidence = "observed manifold supply-return delta";
    appendf(hydraulic_json, sizeof(hydraulic_json), hydraulic_off,
            "%s{\"id\":\"%s\",\"state\":\"%s\",\"freshness\":\"%s\",\"evidence\":\"%s\",\"suggested_action\":\"%s\"}",
            i ? "," : "", alarm.id, lv6::hydraulic_diagnostics::state_str(alarm.state),
            freshness, evidence, alarm.action);
  }
  appendf(hydraulic_json, sizeof(hydraulic_json), hydraulic_off, "]");
  snprintf(this->json_buf_, sizeof(this->json_buf_),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"heap\":{\"internal_kb\":%lu,"
           "\"psram_kb\":%lu},\"cpu\":{\"core0_pct\":%s,\"core1_pct\":%s},"
           "\"manifold\":{\"flow_c\":%s,\"return_c\":%s},\"drivers_enabled\":%s,"
           "\"motor_safety\":{\"backend\":\"%s\",\"motor_busy\":%s,\"drive_on\":%s,"
           "\"latch_faulted\":%s,\"fault_code\":%u,\"current_ma\":%.1f,"
           "\"bemf_raw_a\":%u,\"bemf_raw_b\":%u,\"bemf_differential_raw\":%d,"
           "\"sample_separation_us\":%u,\"bemf_threshold_raw\":%u,"
           "\"sample_valid\":%s,\"sample_moving\":%s,\"invalid_samples\":%u,"
           "\"armed\":%s,\"decoder_address\":%u,\"stroke_phase\":%u,"
           "\"tacho_period_us\":%lu,\"tacho_cadence_us\":%lu,"
           "\"tacho_rejected\":%lu,\"tacho_hardware_count\":%lu,"
           "\"tacho_adc_count\":%lu,\"tacho_amp_raw\":%u,"
           "\"motion_evidence_count\":%lu,\"sample_sequence\":%lu,\"motor_runtime_ms\":%lu},"
           "\"authority\":{\"state\":\"%s\",\"reason\":\"%s\",\"lease_remaining_s\":%lu,\"generation\":%lu,\"v6_write_allowed\":%s},"
           "\"firmware\":{\"update\":{\"current\":\"%s\",\"latest\":\"%s\",\"available\":%s,"
           "\"status\":\"%s\"}},\"reset_reason\":\"%s\","
           "%s,\"logs_endpoint\":\"/api/hv6/v1/logs\","
           "\"logs_download_endpoint\":\"/api/hv6/v1/logs/download\"}}",
           static_cast<unsigned long>(snap->free_internal_kb),
           static_cast<unsigned long>(snap->free_psram_kb), cpu0, cpu1, flow, ret,
           snap->drivers_enabled ? "true" : "false",
           motor_diag.backend,
           motor_diag.motor_busy ? "true" : "false",
           motor_diag.drive_on ? "true" : "false",
           motor_diag.latch_faulted ? "true" : "false",
           static_cast<unsigned>(motor_diag.fault), motor_diag.current_ma,
           static_cast<unsigned>(motor_diag.bemf_raw_a),
           static_cast<unsigned>(motor_diag.bemf_raw_b),
           static_cast<int>(motor_diag.bemf_differential_raw),
           static_cast<unsigned>(motor_diag.sample_separation_us),
           static_cast<unsigned>(motor_diag.bemf_threshold_raw),
           motor_diag.sample_valid ? "true" : "false",
           motor_diag.sample_moving ? "true" : "false",
           static_cast<unsigned>(motor_diag.consecutive_invalid_samples),
           motor_diag.armed ? "true" : "false",
           static_cast<unsigned>(motor_diag.decoder_address),
           static_cast<unsigned>(motor_diag.stroke_phase),
           static_cast<unsigned long>(motor_diag.tacho_period_us),
           static_cast<unsigned long>(motor_diag.tacho_cadence_us),
           static_cast<unsigned long>(motor_diag.tacho_rejected),
           static_cast<unsigned long>(motor_diag.tacho_hardware_count),
           static_cast<unsigned long>(motor_diag.tacho_adc_count),
           static_cast<unsigned>(motor_diag.tacho_amp_raw),
           static_cast<unsigned long>(motor_diag.motion_evidence_count),
           static_cast<unsigned long>(motor_diag.sample_sequence),
           static_cast<unsigned long>(motor_diag.motor_runtime_ms),
           snap->authority_state,
           snap->authority_reason, static_cast<unsigned long>(snap->authority_lease_remaining_s),
           static_cast<unsigned long>(snap->authority_generation),
           snap->authority_v6_write_allowed ? "true" : "false",
           snap->firmware_update_current, snap->firmware_update_latest,
           snap->firmware_update_available ? "true" : "false",
           snap->firmware_update_status, snap->reset_reason, hydraulic_json);
  send_text_(request, 200, "application/json", this->json_buf_, true, "no-cache");
}

void LV6Dashboard::handle_motor_trace_(AsyncWebServerRequest *request) {
  if (this->valve_controller_ == nullptr) {
    send_text_(request, 503, "application/json",
               "{\"ok\":false,\"error\":{\"code\":\"controller_unavailable\"}}",
               true, "no-cache");
    return;
  }
  // Export only a stable, completed capture. Reading while the ring is being
  // overwritten would silently mix different chronological windows.
  if (this->valve_controller_->is_motor_busy()) {
    send_text_(request, 409, "application/json",
               "{\"ok\":false,\"error\":{\"code\":\"motor_busy\",\"message\":\"Stop the motor before exporting trace\"}}",
               true, "no-cache");
    return;
  }

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "text/csv; charset=utf-8");
  httpd_resp_set_hdr(req, "Cache-Control", "no-store");
  httpd_resp_set_hdr(req, "Content-Disposition", "attachment; filename=lune-v6-motor-trace.csv");
  httpd_resp_set_hdr(req, "Connection", "close");

  static constexpr char HEADER[] =
      "t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,"
      "stroke_phase,tacho_period_us,tacho_amp_raw,"
      "bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,"
      "bemf_valid,bemf_moving,invalid_bemf_samples\n";
  if (httpd_resp_send_chunk(req, HEADER, sizeof(HEADER) - 1) != ESP_OK)
    return;

  const uint16_t count = this->valve_controller_->get_motor_trace_sample_count();
  char line[224];
  for (uint16_t index = 0; index < count; index++) {
    lv6::MotorTraceSample sample{};
    if (!this->valve_controller_->get_motor_trace_sample(index, &sample))
      break;
    const int length = snprintf(
        line, sizeof(line), "%lu,%lu,%.1f,%u,%u,%u,%u,%u,%lu,%u,%u,%u,%d,%u,%u,%u,%u\n",
        static_cast<unsigned long>(sample.t_ms),
        static_cast<unsigned long>(sample.ripple_count),
        static_cast<float>(sample.current_ma_x10) / 10.0f,
        static_cast<unsigned>(sample.adc_raw),
        static_cast<unsigned>(sample.drive_on),
        static_cast<unsigned>(sample.direction_open),
        static_cast<unsigned>(sample.armed),
        static_cast<unsigned>(sample.stroke_phase),
        static_cast<unsigned long>(sample.tacho_period_us),
        static_cast<unsigned>(sample.tacho_amp_raw),
        static_cast<unsigned>(sample.bemf_raw_a),
        static_cast<unsigned>(sample.bemf_raw_b),
        static_cast<int>(sample.bemf_differential_raw),
        static_cast<unsigned>(sample.bemf_separation_us),
        static_cast<unsigned>(sample.bemf_valid),
        static_cast<unsigned>(sample.bemf_moving),
        static_cast<unsigned>(sample.invalid_bemf_samples));
    if (length <= 0 || length >= static_cast<int>(sizeof(line)) ||
        httpd_resp_send_chunk(req, line, static_cast<size_t>(length)) != ESP_OK)
      return;
  }
  httpd_resp_send_chunk(req, nullptr, 0);
}

void LV6Dashboard::handle_events_(AsyncWebServerRequest *request) {
  send_text_(request, 200, "text/event-stream",
             "event: hello\n"
             "data: {\"resource\":\"/api/hv6/v1/state\",\"stream\":\"poll\"}\n\n",
             true, "no-cache");
}

void LV6Dashboard::handle_revision_(AsyncWebServerRequest *request) {
  char response[256];
  snprintf(response, sizeof(response),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"data_revision\":%lu,"
           "\"uptime_s\":%lu,\"poll_after_ms\":3000,\"freshness\":\"runtime\"}}",
           static_cast<unsigned long>(data_revision_),
           static_cast<unsigned long>(millis() / 1000UL));
  send_text_(request, 200, "application/json", response, false, "no-cache");
}

// =============================================================================
// /api/hv6/v1 - request routing (contract: devices/lune-v6/docs/hv6_api_v1.md)
// =============================================================================

namespace {

/// Matches "<prefix>/{zone}/<action>". Returns the zone (1..NUM_ZONES),
/// 0 if the route shape matched but the zone is out of range, or -1 if the
/// path does not match this route at all.
int match_zone_route(const char *path, const char *prefix, const char *action) {
  const size_t plen = strlen(prefix);
  if (strncmp(path, prefix, plen) != 0 || path[plen] != '/')
    return -1;
  char *end = nullptr;
  const long zone = strtol(path + plen + 1, &end, 10);
  if (end == path + plen + 1 || *end != '/' || strcmp(end + 1, action) != 0)
    return -1;
  if (zone < 1 || zone > static_cast<long>(lv6::NUM_ZONES))
    return 0;
  return static_cast<int>(zone);
}

/// Matches "<prefix>/{zone}" exactly. Return semantics match match_zone_route().
int match_zone_resource(const char *path, const char *prefix) {
  const size_t plen = strlen(prefix);
  if (strncmp(path, prefix, plen) != 0 || path[plen] != '/')
    return -1;
  char *end = nullptr;
  const long zone = strtol(path + plen + 1, &end, 10);
  if (end == path + plen + 1 || *end != '\0')
    return -1;
  if (zone < 1 || zone > static_cast<long>(lv6::NUM_ZONES))
    return 0;
  return static_cast<int>(zone);
}

bool parse_num_arg(AsyncWebServerRequest *request, const char *name, float *out) {
  const std::string val = request->arg(name);
  if (val.empty())
    return false;
  char *end = nullptr;
  const float parsed = strtof(val.c_str(), &end);
  if (end == val.c_str() || *end != '\0')
    return false;
  *out = parsed;
  return true;
}

bool parse_num_param(AsyncWebServerRequest *request, const char *body, const char *name, float *out) {
  if (parse_num_arg(request, name, out))
    return true;
  return body != nullptr && body[0] != '\0' && json_get_num(body, name, out);
}

bool parse_bool_arg(AsyncWebServerRequest *request, const char *name, bool *out) {
  const std::string val = request->arg(name);
  if (val.empty())
    return false;
  *out = strcasecmp(val.c_str(), "true") == 0 || val == "1" || strcasecmp(val.c_str(), "on") == 0;
  return true;
}

bool parse_bool_param(AsyncWebServerRequest *request, const char *body, const char *name, bool *out) {
  if (parse_bool_arg(request, name, out))
    return true;
  return body != nullptr && body[0] != '\0' && json_get_bool(body, name, out);
}

void parse_text_param(AsyncWebServerRequest *request, const char *body, const char *name,
                      const char *fallback, char *out, size_t out_len) {
  if (out_len == 0)
    return;
  const std::string arg = request->arg(name);
  if (!arg.empty()) {
    sanitize_text(arg, out, out_len);
    return;
  }
  if (body != nullptr && body[0] != '\0' && json_get_str(body, name, out, out_len))
    return;
  sanitize_text(fallback != nullptr ? std::string(fallback) : std::string(), out, out_len);
}

void apply_zone(DashboardAction &act, int zone) {
  act.zone = zone;
  act.zone_valid = zone >= 1 && zone <= static_cast<int>(lv6::NUM_ZONES);
  act.zi = act.zone_valid ? static_cast<uint8_t>(zone - 1) : 0;
}

}  // namespace

void LV6Dashboard::send_v1_(AsyncWebServerRequest *request, int code, const char *err_code,
                            const char *err_message) {
  char buf[224];
  const long long ts_ms = static_cast<long long>(::time(nullptr)) * 1000LL;
  if (err_code == nullptr) {
    snprintf(buf, sizeof(buf), "{\"ok\":true,\"version\":\"v1\",\"ts_ms\":%lld}", ts_ms);
  } else {
    snprintf(buf, sizeof(buf),
             "{\"ok\":false,\"version\":\"v1\",\"ts_ms\":%lld,\"error\":{\"code\":\"%s\",\"message\":\"%s\"}}",
             ts_ms, err_code, err_message != nullptr ? err_message : "");
  }
  send_text_(request, code, "application/json", buf, true, "no-cache");
}

bool LV6Dashboard::enqueue_action_(const DashboardAction &act) {
  if (action_lock_ == nullptr || xSemaphoreTake(action_lock_, pdMS_TO_TICKS(100)) != pdTRUE)
    return false;
  action_queue_.push_back(act);
  xSemaphoreGive(action_lock_);
  return true;
}

// Once Touch has provisioned an authority key, same-origin dashboard writes
// require that key and a matching CSRF header. During standalone V6
// commissioning the key is intentionally empty; keep local setup usable in that
// state and let Touch provisioning close the write gate later. Cross-origin
// forms cannot add these headers because wildcard CORS is removed.
bool LV6Dashboard::authorize_write_(AsyncWebServerRequest *request) {
  const auto local_key_header = request->get_header("X-Lune-Local-Key");
  const auto csrf_header = request->get_header("X-Lune-CSRF");
  const auto local_cfg = this->config_store_ ? this->config_store_->get_authority_config() : lv6::AuthorityConfig{};
  const char *local_key = local_key_header.has_value() ? local_key_header->c_str() : "";
  const char *csrf = csrf_header.has_value() ? csrf_header->c_str() : "";
  const size_t local_len = strlen(local_cfg.shared_key);
  const size_t supplied_len = strlen(local_key);
  unsigned char local_diff = static_cast<unsigned char>(local_len ^ supplied_len);
  for (size_t i = 0; i < std::max(local_len, supplied_len); i++)
    local_diff |= static_cast<unsigned char>((i < local_len ? local_cfg.shared_key[i] : '\0') ^
                                             (i < supplied_len ? local_key[i] : '\0'));
  if (local_len != 0 && (local_diff != 0 || strcmp(local_key, csrf) != 0)) {
    this->send_v1_(request, 403, "local_auth_failed", "Local credential and CSRF header required");
    return false;
  }
  return true;
}

void LV6Dashboard::prepare_motors_for_ota_() {
  if (this->valve_controller_ == nullptr)
    return;
  // Cut drive first: a reboot mid-flash must not leave an H-bridge energised.
  this->valve_controller_->set_drivers_enabled(false);
  const uint32_t deadline = millis() + 5000;
  while (this->valve_controller_->is_motor_busy() || this->valve_controller_->is_calibrating()) {
    if (static_cast<int32_t>(millis() - deadline) >= 0) {
      ESP_LOGW(TAG, "Motors still busy after 5s; continuing OTA preparation");
      break;
    }
    delay(20);
  }
  ESP_LOGI(TAG, "Motors parked for firmware update");
}

void LV6Dashboard::expire_coordinator_commands_() {
  if (this->zone_controller_ == nullptr)
    return;
  const uint32_t now = millis();
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    const uint32_t expires_at = this->coordinator_command_expires_at_ms_[i];
    if (expires_at == 0)
      continue;
    if ((int32_t) (now - expires_at) < 0)
      continue;
    lv6::HeliosZoneCommand clear{};
    this->zone_controller_->apply_helios_command(i, clear);
    this->coordinator_command_expires_at_ms_[i] = 0;
    this->coordinator_command_offsets_c_[i] = 0.0f;
    ESP_LOGI(TAG, "Coordinator command expired for zone %u", static_cast<unsigned>(i + 1));
  }
}

void LV6Dashboard::handle_v1_(AsyncWebServerRequest *request, const char *path) {
  // ---- read endpoints ----
  int zone;
  if (strcmp(path, "/state") == 0) {
    this->handle_state_(request);
    return;
  }
  if (strcmp(path, "/revision") == 0) {
    this->handle_revision_(request);
    return;
  }
  if (strcmp(path, "/overview") == 0) {
    this->handle_overview_(request);
    return;
  }
  if (strcmp(path, "/zones") == 0) {
    this->handle_zones_(request);
    return;
  }
  if ((zone = match_zone_resource(path, "/zones")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    this->handle_zone_(request, static_cast<uint8_t>(zone));
    return;
  }
  if (strcmp(path, "/settings") == 0) {
    this->handle_settings_(request);
    return;
  }
  if (strcmp(path, "/settings/export") == 0) {
    this->handle_settings_export_(request);
    return;
  }
  if (strcmp(path, "/diagnostics") == 0) {
    this->handle_diagnostics_(request);
    return;
  }
  if (strcmp(path, "/motor-trace.csv") == 0) {
    this->handle_motor_trace_(request);
    return;
  }
  if (strcmp(path, "/events") == 0) {
    this->handle_events_(request);
    return;
  }
  if (strcmp(path, "/history") == 0) {
    this->handle_history_(request);
    return;
  }
  if (strcmp(path, "/logs") == 0) {
    this->handle_logs_(request);
    return;
  }
  if (strcmp(path, "/logs/download") == 0) {
    this->handle_logs_download_(request);
    return;
  }
  if (strcmp(path, "/ble-scan") == 0) {
    this->handle_ble_scan_(request);
    return;
  }

  // ---- write endpoints ----
  if (request->method() != HTTP_POST) {
    this->send_v1_(request, 405, "method_not_allowed", "Use POST for write endpoints");
    return;
  }

  DashboardAction act{};
  float num = 0.0f;
  bool flag = false;
  const std::string body_str = request->arg("plain");
  const char *body = body_str.c_str();

  // Settings import replaces whole config sections at once, so it bypasses the
  // single-key action queue and persists inline. Must be matched before the
  // generic "/settings/<type>" branch below.
  if (strcmp(path, "/settings/import") == 0) {
    this->handle_settings_import_(request, body);
    return;
  }
  if (strcmp(path, "/authority/lease") == 0) {
    this->handle_authority_lease_(request, body);
    return;
  }
  if (strcmp(path, "/authority/proposal") == 0) {
    this->handle_authority_proposal_(request, body);
    return;
  }
  if (strcmp(path, "/authority/approve-proposal") == 0) {
    this->handle_authority_proposal_approval_(request);
    return;
  }
  if (strcmp(path, "/authority/revoke") == 0) {
    this->handle_authority_revoke_(request);
    return;
  }

  if ((zone = match_zone_route(path, "/zones", "setpoint")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_num_param(request, body, "setpoint_c", &num)) {
      this->send_v1_(request, 400, "missing_param", "setpoint_c is required");
      return;
    }
    act.key = "zone_setpoint";
    act.num_val = num;
    act.has_num = true;
    apply_zone(act, zone);

  } else if ((zone = match_zone_route(path, "/zones", "setpoint-command")) != -1 ||
             (zone = match_zone_route(path, "/zones", "coordinator-command")) != -1 ||
             (zone = match_zone_route(path, "/zones", "coordinator_command")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_num_param(request, body, "setpoint_offset_c", &num) &&
        !parse_num_param(request, body, "requested_offset_c", &num)) {
      this->send_v1_(request, 400, "missing_param", "setpoint_offset_c is required");
      return;
    }
    if (!std::isfinite(num)) {
      this->send_v1_(request, 400, "invalid_value", "setpoint_offset_c must be finite");
      return;
    }
    // Coordinator commands require a provisioned per-installation key, valid UTC
    // timestamp, and single-use nonce. A pairing fingerprint is never an authorizer.
    if (this->config_store_ == nullptr) {
      this->send_v1_(request, 503, "auth_unavailable", "Authentication configuration unavailable");
      return;
    }
    const auto auth_cfg = this->config_store_->get_authority_config();
    const auto key_header = request->get_header("X-Lune-Authority-Key");
    const char *provided_key = key_header.has_value() ? key_header->c_str() : "";
    float auth_timestamp_s = 0.0f;
    char auth_nonce[48]{};
    parse_num_param(request, body, "auth_timestamp_s", &auth_timestamp_s);
    parse_text_param(request, body, "auth_nonce", "", auth_nonce, sizeof(auth_nonce));
    const time_t now_s = ::time(nullptr);
    if (!touch_auth::request_is_authenticated(auth_cfg.shared_key, provided_key,
                                              now_s, auth_timestamp_s, auth_nonce)) {
      this->send_v1_(request, 403, "touch_auth_failed",
                     "Touch command requires provisioned key, valid UTC timestamp, and nonce");
      return;
    }
    if (request_guard_.check(0, data_revision_, auth_nonce, millis()) == request_guard::Decision::DUPLICATE) {
      this->send_v1_(request, 409, "replayed_nonce", "Touch command nonce was already used");
      return;
    }
    float ttl_s = 3600.0f;
    parse_num_param(request, body, "ttl_s", &ttl_s);
    if (!std::isfinite(ttl_s))
      ttl_s = 3600.0f;
    ttl_s = std::clamp(ttl_s, 60.0f, 21600.0f);

    DashboardSnapshot snap{};
    if (snapshot_lock_ != nullptr && snapshot_ready_ &&
        xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) == pdTRUE) {
      memcpy(&snap, &this->snapshot_, sizeof(snap));
      xSemaphoreGive(snapshot_lock_);
    } else if (this->config_store_) {
      snap.zones[zone - 1] = this->config_store_->get_zone_config(zone - 1);
    }
    const uint8_t zi = static_cast<uint8_t>(zone - 1);
    const lv6::ZoneConfig &cfg = snap.zones[zi];
    const float accepted_offset = std::clamp(num, cfg.min_offset_c, cfg.max_offset_c);
    const float effective_setpoint = std::clamp(cfg.setpoint_c + accepted_offset, cfg.abs_min_c, cfg.abs_max_c);
    const bool clamp_applied = std::fabs(accepted_offset - num) > 0.001f ||
                               std::fabs(effective_setpoint - (cfg.setpoint_c + accepted_offset)) > 0.001f;

    if (this->zone_controller_ == nullptr) {
      this->send_v1_(request, 503, "controller_unavailable", "Zone controller unavailable");
      return;
    }
    lv6::HeliosZoneCommand cmd{};
    cmd.setpoint_offset_c = accepted_offset;
    this->zone_controller_->apply_helios_command(zi, cmd);
    this->coordinator_command_expires_at_ms_[zi] = millis() + static_cast<uint32_t>(ttl_s * 1000.0f);
    this->coordinator_command_offsets_c_[zi] = accepted_offset;

    char request_id[48];
    char source[32];
    char reason[80];
    parse_text_param(request, body, "request_id", "", request_id, sizeof(request_id));
    parse_text_param(request, body, "source", "lune-touch", source, sizeof(source));
    parse_text_param(request, body, "reason", "coordinator command", reason, sizeof(reason));

    char response[384];
    snprintf(response, sizeof(response),
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"request_id\":\"%s\","
             "\"source\":\"%s\",\"reason\":\"%s\",\"zone\":%u,\"requested_offset_c\":%.2f,"
             "\"accepted_offset_c\":%.2f,\"effective_setpoint_c\":%.2f,\"expires_at_ms\":%lu,"
             "\"ttl_s\":%lu,\"clamp_applied\":%s,\"result\":\"accepted\"}}",
             request_id, source, reason,
             static_cast<unsigned>(zone), num, accepted_offset, effective_setpoint,
             static_cast<unsigned long>(this->coordinator_command_expires_at_ms_[zi]),
             static_cast<unsigned long>(ttl_s), clamp_applied ? "true" : "false");
    send_text_(request, 200, "application/json", response, true, "no-cache");
    return;

  } else if ((zone = match_zone_route(path, "/zones", "enabled")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_bool_param(request, body, "enabled", &flag)) {
      this->send_v1_(request, 400, "missing_param", "enabled is required");
      return;
    }
    act.key = "zone_enabled";
    act.num_val = flag ? 1.0f : 0.0f;
    act.has_num = true;
    apply_zone(act, zone);

  } else if (strcmp(path, "/drivers/enabled") == 0 || strcmp(path, "/manual_mode") == 0) {
    if (!parse_bool_param(request, body, "enabled", &flag)) {
      this->send_v1_(request, 400, "missing_param", "enabled is required");
      return;
    }
    act.key = (path[1] == 'd') ? "drivers_enabled" : "manual_mode";
    act.num_val = flag ? 1.0f : 0.0f;
    act.has_num = true;

  } else if ((zone = match_zone_route(path, "/motors", "target")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_num_param(request, body, "value", &num)) {
      this->send_v1_(request, 400, "missing_param", "value is required");
      return;
    }
    act.key = "motor_target";
    act.num_val = num;
    act.has_num = true;
    apply_zone(act, zone);

  } else if ((zone = match_zone_route(path, "/motors", "open_timed")) != -1 ||
             (zone = match_zone_route(path, "/motors", "close_timed")) != -1 ||
             (zone = match_zone_route(path, "/motors", "stop")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    act.key = "command";
    if (match_zone_route(path, "/motors", "open_timed") > 0)
      act.value_str = "open_motor_timed";
    else if (match_zone_route(path, "/motors", "close_timed") > 0)
      act.value_str = "close_motor_timed";
    else
      act.value_str = "stop_motor";
    act.has_str = true;
    apply_zone(act, zone);

  } else if (strcmp(path, "/commands") == 0) {
    char cmd_buf[48];
    parse_text_param(request, body, "command", "", cmd_buf, sizeof(cmd_buf));
    if (cmd_buf[0] == '\0') {
      this->send_v1_(request, 400, "missing_param", "command is required");
      return;
    }
    act.key = "command";
    act.value_str = cmd_buf;
    act.has_str = true;
    if (!parse_num_param(request, body, "zone", &num))
      num = 0.0f;
    apply_zone(act, static_cast<int>(num));

  } else if (strncmp(path, "/settings/", 10) == 0) {
    const char *kind = path + 10;
    const bool is_number = strcmp(kind, "number") == 0;
    if (!is_number && strcmp(kind, "select") != 0 && strcmp(kind, "text") != 0) {
      this->send_v1_(request, 404, "unknown_route", "Unknown settings type");
      return;
    }
    char key_buf[48];
    char value_buf[96];
    parse_text_param(request, body, "key", "", key_buf, sizeof(key_buf));
    act.key = key_buf;
    if (act.key.empty()) {
      this->send_v1_(request, 400, "missing_param", "key is required");
      return;
    }
    if (act.key.rfind("authority_", 0) == 0) {
      this->send_v1_(request, 403, "authority_pairing_required",
                     "Authority identity can only be installed from an approved Touch proposal");
      return;
    }
    parse_text_param(request, body, "value", "", value_buf, sizeof(value_buf));
    act.value_str = value_buf;
    act.has_str = !act.value_str.empty();
    if (is_number) {
      // Reject mixed/locale decimal separators before parsing. strtof() is "C"-locale
      // and stops at a comma, so "55,7" or "12.345,6" would otherwise be silently
      // truncated (e.g. "55,7" -> 55.0). Require '.' only.
      if (act.value_str.find(',') != std::string::npos) {
        this->send_v1_(request, 400, "invalid_value",
                       "use '.' as the decimal separator (no ',')");
        return;
      }
      if (!parse_num_param(request, body, "value", &num) || !std::isfinite(num)) {
        this->send_v1_(request, 400, "invalid_value", "value must be a finite number");
        return;
      }
      act.num_val = num;
      act.has_num = true;
    }
    if (!parse_num_param(request, body, "zone", &num))
      num = 0.0f;
    apply_zone(act, static_cast<int>(num));

  } else {
    this->send_v1_(request, 404, "unknown_route", "Unknown route");
    return;
  }

  float expected_revision = 0.0f;
  if (parse_num_param(request, body, "expected_revision", &expected_revision) &&
      (!std::isfinite(expected_revision) || expected_revision < 0.0f)) {
    this->send_v1_(request, 400, "invalid_revision", "expected_revision must be a non-negative integer");
    return;
  }
  char idempotency_key[48]{};
  const auto idempotency_header = request->get_header("Idempotency-Key");
  if (idempotency_header.has_value())
    sanitize_text(idempotency_header->c_str(), idempotency_key, sizeof(idempotency_key));
  else
    parse_text_param(request, body, "idempotency_key", "", idempotency_key, sizeof(idempotency_key));
  if (!this->authorize_write_(request))
    return;
  const uint32_t now_ms = millis();
  if (static_cast<int32_t>(now_ms - write_rate_window_ms_) >= 60000) {
    write_rate_window_ms_ = now_ms;
    write_rate_count_ = 0;
  }
  if (write_rate_count_ >= 30) {
    this->send_v1_(request, 429, "rate_limited", "Too many write requests");
    return;
  }
  write_rate_count_++;
  const auto guard_result = request_guard_.check(static_cast<uint32_t>(expected_revision), data_revision_,
                                                  idempotency_key, millis());
  if (guard_result == request_guard::Decision::STALE) {
    char response[192];
    snprintf(response, sizeof(response),
             "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"stale_revision\","
             "\"message\":\"write based on an older revision\",\"current_revision\":%lu}}",
             static_cast<unsigned long>(data_revision_));
    send_text_(request, 409, "application/json", response, false, "no-cache");
    return;
  }
  if (guard_result == request_guard::Decision::DUPLICATE) {
    char response[160];
    snprintf(response, sizeof(response),
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"duplicate\":true,\"data_revision\":%lu}}",
             static_cast<unsigned long>(data_revision_));
    send_text_(request, 200, "application/json", response, false, "no-cache");
    return;
  }
  if (!this->enqueue_action_(act)) {
    this->send_v1_(request, 503, "busy", "System busy, try again");
    return;
  }
  char response[144];
  snprintf(response, sizeof(response),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"accepted\":true,\"data_revision\":%lu}}",
           static_cast<unsigned long>(data_revision_));
  send_text_(request, 200, "application/json", response, false, "no-cache");
}

void LV6Dashboard::handle_authority_lease_(AsyncWebServerRequest *request, const char *body) {
  if (this->config_store_ == nullptr) {
    this->send_v1_(request, 503, "authority_unavailable", "Authority configuration unavailable");
    return;
  }
  const lv6::AuthorityConfig cfg = this->config_store_->get_authority_config();
  if (cfg.shared_key[0] == '\0') {
    this->send_v1_(request, 403, "authority_auth_unconfigured", "Authority authentication is not provisioned");
    return;
  }
  const auto header = request->get_header("X-Lune-Authority-Key");
  const char *provided = header.has_value() ? header->c_str() : "";
  const size_t expected_len = strlen(cfg.shared_key);
  const size_t provided_len = strlen(provided);
  unsigned char diff = static_cast<unsigned char>(expected_len ^ provided_len);
  const size_t compare_len = std::max(expected_len, provided_len);
  for (size_t i = 0; i < compare_len; i++) {
    const char expected = i < expected_len ? cfg.shared_key[i] : '\0';
    const char actual = i < provided_len ? provided[i] : '\0';
    diff |= static_cast<unsigned char>(expected ^ actual);
  }
  char installation_id[32]{};
  char coordinator_id[32]{};
  char lease_id[32]{};
  parse_text_param(request, body, "installation_id", "", installation_id, sizeof(installation_id));
  parse_text_param(request, body, "coordinator_id", "", coordinator_id, sizeof(coordinator_id));
  parse_text_param(request, body, "lease_id", "", lease_id, sizeof(lease_id));
  float sequence = 0.0f;
  float issued_ms = 0.0f;
  float duration_ms = static_cast<float>(lv6_authority::DEFAULT_LEASE_MS);
  bool degraded = false;
  parse_num_param(request, body, "sequence", &sequence);
  parse_num_param(request, body, "issued_ms", &issued_ms);
  parse_num_param(request, body, "duration_ms", &duration_ms);
  parse_bool_param(request, body, "degraded", &degraded);
  lv6_authority::Request lease_request{installation_id, coordinator_id, lease_id,
                                        static_cast<uint32_t>(sequence),
                                        static_cast<uint32_t>(issued_ms),
                                        static_cast<uint32_t>(duration_ms), degraded};
  this->authority_.configure(cfg.installation_id, cfg.coordinator_id);
  const auto result = this->authority_.acquire_or_renew(lease_request, diff == 0, millis());
  const auto snapshot = this->authority_.snapshot(millis());
  if (this->zone_controller_)
    this->zone_controller_->set_touch_authority_active(snapshot.touch_lease_active);
  const int status = (result == lv6_authority::Result::GRANTED || result == lv6_authority::Result::RENEWED) ? 200 :
                     (result == lv6_authority::Result::AUTH_REQUIRED ? 401 : 409);
  char response[512];
  snprintf(response, sizeof(response),
           "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"result\":\"%s\",\"state\":\"%s\","
           "\"generation\":%lu,\"lease_remaining_s\":%lu,\"reason\":\"%s\","
           "\"authority_only\":true}}",
           status == 200 ? "true" : "false", lv6_authority::result_name(result),
           lv6_authority::state_name(snapshot.state), static_cast<unsigned long>(snapshot.lease_generation),
           static_cast<unsigned long>(snapshot.remaining_ms / 1000UL), snapshot.last_reason);
  send_text_(request, status, "application/json", response, true, "no-cache");
}

void LV6Dashboard::handle_authority_proposal_(AsyncWebServerRequest *request, const char *body) {
  char installation_id[32]{};
  char coordinator_id[32]{};
  char shared_key[64]{};
  char name[32]{};
  char site[48]{};
  parse_text_param(request, body, "installation_id", "", installation_id, sizeof(installation_id));
  parse_text_param(request, body, "coordinator_id", "", coordinator_id, sizeof(coordinator_id));
  parse_text_param(request, body, "shared_key", "", shared_key, sizeof(shared_key));
  parse_text_param(request, body, "name", "Lune Touch", name, sizeof(name));
  parse_text_param(request, body, "site", "", site, sizeof(site));
  if (installation_id[0] == '\0' || coordinator_id[0] == '\0' || std::strlen(shared_key) < 16) {
    this->send_v1_(request, 400, "invalid_proposal", "Touch identity and a key of at least 16 characters are required");
    return;
  }

  const auto current = this->config_store_ ? this->config_store_->get_authority_config() : lv6::AuthorityConfig{};
  if (current.shared_key[0] != '\0' &&
      std::strcmp(current.installation_id, installation_id) == 0 &&
      std::strcmp(current.coordinator_id, coordinator_id) == 0) {
    send_text_(request, 200, "application/json",
               "{\"ok\":true,\"version\":\"v1\",\"data\":{\"status\":\"already_approved\"}}",
               false, "no-store");
    return;
  }
  // Discovery never grants control. Keep a replacement proposal visible even
  // when an obsolete or manually provisioned authority exists; the local user
  // still has to approve the exact identity before it replaces current trust.
  std::strncpy(authority_proposal_installation_id_, installation_id,
               sizeof(authority_proposal_installation_id_) - 1);
  std::strncpy(authority_proposal_coordinator_id_, coordinator_id,
               sizeof(authority_proposal_coordinator_id_) - 1);
  std::strncpy(authority_proposal_shared_key_, shared_key,
               sizeof(authority_proposal_shared_key_) - 1);
  std::strncpy(authority_proposal_name_, name, sizeof(authority_proposal_name_) - 1);
  std::strncpy(authority_proposal_site_, site, sizeof(authority_proposal_site_) - 1);
  authority_proposal_expires_at_ms_ = millis() + 180000UL;
  if (data_revision_ != UINT32_MAX)
    data_revision_++;
  send_text_(request, 200, "application/json",
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"status\":\"awaiting_local_approval\"}}",
             false, "no-store");
}

void LV6Dashboard::handle_authority_proposal_approval_(AsyncWebServerRequest *request) {
  if (this->config_store_ == nullptr) {
    this->send_v1_(request, 503, "authority_unavailable", "Authority configuration unavailable");
    return;
  }
  const bool pending = authority_proposal_expires_at_ms_ != 0 &&
      static_cast<int32_t>(authority_proposal_expires_at_ms_ - millis()) > 0 &&
      authority_proposal_installation_id_[0] != '\0' &&
      authority_proposal_coordinator_id_[0] != '\0' &&
      std::strlen(authority_proposal_shared_key_) >= 16;
  if (!pending) {
    this->send_v1_(request, 409, "proposal_expired", "Wait for Lune Touch to send a new connection proposal");
    return;
  }
  lv6::AuthorityConfig approved{};
  std::strncpy(approved.installation_id, authority_proposal_installation_id_,
               sizeof(approved.installation_id) - 1);
  std::strncpy(approved.coordinator_id, authority_proposal_coordinator_id_,
               sizeof(approved.coordinator_id) - 1);
  std::strncpy(approved.shared_key, authority_proposal_shared_key_, sizeof(approved.shared_key) - 1);
  this->config_store_->update_authority(approved);
  this->authority_.configure(approved.installation_id, approved.coordinator_id);
  authority_proposal_expires_at_ms_ = 0;
  authority_proposal_installation_id_[0] = '\0';
  authority_proposal_coordinator_id_[0] = '\0';
  authority_proposal_name_[0] = '\0';
  authority_proposal_site_[0] = '\0';
  if (data_revision_ != UINT32_MAX)
    data_revision_++;

  char response[256]{};
  std::snprintf(response, sizeof(response),
                "{\"ok\":true,\"version\":\"v1\",\"data\":{"
                "\"status\":\"approved\",\"installation_id\":\"%s\","
                "\"coordinator_id\":\"%s\",\"local_access_key\":\"%s\"}}",
                approved.installation_id, approved.coordinator_id, approved.shared_key);
  send_text_(request, 200, "application/json", response, false, "no-store");
  authority_proposal_shared_key_[0] = '\0';
}

void LV6Dashboard::handle_authority_revoke_(AsyncWebServerRequest *request) {
  if (this->config_store_ == nullptr) {
    this->send_v1_(request, 503, "authority_unavailable", "Authority configuration unavailable");
    return;
  }
  this->config_store_->update_authority(lv6::AuthorityConfig{});
  this->authority_.configure("", "");
  if (this->zone_controller_)
    this->zone_controller_->set_touch_authority_active(false);
  if (data_revision_ != UINT32_MAX)
    data_revision_++;
  send_text_(request, 200, "application/json",
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"status\":\"revoked\"}}",
             false, "no-store");
}

void LV6Dashboard::dispatch_set_(const DashboardAction &act) {
  const char *key = act.key.c_str();
  char str_val[64] = {};
  strncpy(str_val, act.value_str.c_str(), sizeof(str_val) - 1);
  const float num_val = act.num_val;
  const bool has_num = act.has_num;
  const bool has_str = act.has_str;
  const bool zone_valid = act.zone_valid;
  const uint8_t zi = act.zi;

  // ---- zone_setpoint ----
  if (strcmp(key, "zone_setpoint") == 0) {
    if (zone_valid && has_num && this->zone_controller_)
      this->zone_controller_->set_zone_setpoint(zi, num_val);

  // ---- zone_enabled ----
  } else if (strcmp(key, "zone_enabled") == 0) {
    if (zone_valid && has_num && this->zone_controller_)
      this->zone_controller_->set_zone_enabled(zi, num_val != 0.0f);

  // ---- drivers_enabled ----
  } else if (strcmp(key, "drivers_enabled") == 0) {
    if (has_num && this->valve_controller_)
      this->valve_controller_->set_drivers_enabled(num_val != 0.0f);

  // ---- manual_mode ----
  } else if (strcmp(key, "manual_mode") == 0) {
    if (has_num && this->zone_controller_)
      this->zone_controller_->set_manual_mode(num_val != 0.0f);

  // ---- motor_target ----
  } else if (strcmp(key, "motor_target") == 0) {
    if (zone_valid && has_num && this->valve_controller_) {
      const float clamped = std::max(0.0f, std::min(100.0f, num_val));
      this->valve_controller_->request_position(zi, clamped);
    }

  // ---- command ----
  } else if (strcmp(key, "command") == 0 && has_str) {
    if (strcmp(str_val, "i2c_scan") == 0) {
      if (this->valve_controller_) this->valve_controller_->log_i2c_scan();
    } else if (strcmp(str_val, "open_motor_timed") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_timed_open(zi, 10000, true);
    } else if (strcmp(str_val, "close_motor_timed") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_timed_close(zi, 10000, true);
    } else if (strcmp(str_val, "stop_motor") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_stop(zi);
    } else if (strcmp(str_val, "motor_reset_fault") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_fault(zi);
    } else if (strcmp(str_val, "motor_reset_learned_factors") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_learned_factors(zi);
    } else if (strcmp(str_val, "motor_reset_and_relearn") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_and_relearn(zi);
    } else if (strcmp(str_val, "ble_clock_sync_now") == 0) {
      if (this->ble_time_beacon_)
        this->ble_time_beacon_->request_sync_now();
    } else if (strcmp(str_val, "dump_task_stats") == 0) {
      this->dump_task_stats_();
    } else if (strcmp(str_val, "firmware_prepare") == 0) {
      this->prepare_motors_for_ota_();
#ifdef LV6_HAS_UPDATE
    } else if (strcmp(str_val, "firmware_check") == 0) {
      if (this->firmware_update_)
        this->firmware_update_->check();
    } else if (strcmp(str_val, "firmware_install") == 0) {
      if (this->firmware_update_) {
        // Park the motors before the flash write starts, not after.
        this->prepare_motors_for_ota_();
        this->firmware_update_->perform(false);
      }
#endif
    } else if (strcmp(str_val, "restart") == 0) {
      ESP_LOGW(TAG, "Restarting device on dashboard request");
      esp_restart();
    }
    // Unknown commands are silently accepted

  // ---- zone_probe ----
  } else if (strcmp(key, "zone_probe") == 0 && has_str && zone_valid && this->zone_controller_) {
    int8_t probe = lv6::PROBE_UNASSIGNED;
    parse_probe_option(str_val, &probe);
    this->zone_controller_->set_zone_probe(zi, probe);

  // ---- zone_temp_source ----
  } else if (strcmp(key, "zone_temp_source") == 0 && has_str && zone_valid && this->zone_controller_) {
    lv6::TempSource src = lv6::TempSource::LOCAL_PROBE;
    if (parse_temp_source(str_val, &src))
      this->zone_controller_->set_zone_temp_source(zi, src);

  // ---- zone_sync_to ----
  } else if (strcmp(key, "zone_sync_to") == 0 && has_str && zone_valid && this->zone_controller_) {
    int8_t target = -1;
    if (strcasecmp(str_val, "None") != 0) {
      int n = 0;
      if (sscanf(str_val, "Zone %d", &n) == 1 && n >= 1 && n <= 6)
        target = static_cast<int8_t>(n - 1);
    }
    this->zone_controller_->set_zone_sync(zi, target);

  // ---- zone_pipe_type ----
  } else if (strcmp(key, "zone_pipe_type") == 0 && has_str && zone_valid && this->zone_controller_) {
    lv6::PipeType pt;
    if (parse_pipe_type(str_val, &pt))
      this->zone_controller_->set_zone_pipe_type(zi, pt);

  // ---- zone_name (friendly name, persisted device-side in ZoneConfig) ----
  } else if (strcmp(key, "zone_name") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_name(zi, std::string(str_val));

  // ---- physical-loop commissioning metadata (passive records only) ----
  } else if (strcmp(key, "zone_manifold_id") == 0 && has_str && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    strncpy(cfg.manifold_id, str_val, sizeof(cfg.manifold_id) - 1);
    cfg.manifold_id[sizeof(cfg.manifold_id) - 1] = '\0';
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_room_id") == 0 && has_str && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    strncpy(cfg.room_id, str_val, sizeof(cfg.room_id) - 1);
    cfg.room_id[sizeof(cfg.room_id) - 1] = '\0';
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_manifold_port") == 0 && has_num && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    cfg.manifold_port = static_cast<uint8_t>(std::clamp(num_val, 0.0f, 6.0f));
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_loop_pipe_length_m") == 0 && has_num && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    cfg.loop_pipe_length_m = std::max(-1.0f, num_val);
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_design_flow_l_h") == 0 && has_num && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    cfg.design_flow_l_h = std::max(-1.0f, num_val);
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_measured_flow_l_h") == 0 && has_num && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    cfg.measured_flow_l_h = std::max(-1.0f, num_val);
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_actuator_calibration_pct") == 0 && has_num && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    cfg.actuator_calibration_pct = std::clamp(num_val, -1.0f, 100.0f);
    this->config_store_->update_zone(zi, cfg);
  } else if (strcmp(key, "zone_expected_thermal_delay_min") == 0 && has_num && zone_valid && this->config_store_) {
    auto cfg = this->config_store_->get_zone_config(zi);
    cfg.expected_thermal_delay_min = std::max(-1.0f, num_val);
    this->config_store_->update_zone(zi, cfg);

  // ---- zone_ble_mac ----
  } else if (strcmp(key, "zone_ble_mac") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_ble_mac(zi, std::string(str_val));

  // ---- coordinator weather metadata (same durable V6 zone config) ----
  } else if (strcmp(key, "zone_wind_exposure") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_wind_exposure(zi, num_val);

  } else if (strcmp(key, "zone_solar_gain") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_solar_gain(zi, num_val);

  } else if (strcmp(key, "zone_thermal_lead_h") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_thermal_lead_h(zi, static_cast<uint8_t>(std::clamp(num_val, 0.0f, 48.0f)));

  // ---- zone_area_m2 ----
  } else if (strcmp(key, "zone_area_m2") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_area_m2(zi, num_val);

  // ---- zone_pipe_spacing_mm ----
  } else if (strcmp(key, "zone_pipe_spacing_mm") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_pipe_spacing_mm(zi, num_val);

  // ---- manifold_flow_probe ----
  } else if (strcmp(key, "manifold_flow_probe") == 0 && has_str && this->zone_controller_) {
    int8_t probe = lv6::PROBE_UNASSIGNED;
    if (parse_probe_option(str_val, &probe))
      this->zone_controller_->set_manifold_flow_probe(probe);

  // ---- manifold_return_probe ----
  } else if (strcmp(key, "manifold_return_probe") == 0 && has_str && this->zone_controller_) {
    int8_t probe = lv6::PROBE_UNASSIGNED;
    if (parse_probe_option(str_val, &probe))
      this->zone_controller_->set_manifold_return_probe(probe);

  // ---- manifold_type ----
  } else if (strcmp(key, "manifold_type") == 0 && has_str && this->valve_controller_) {
    lv6::ManifoldType mt = lv6::ManifoldType::NC;
    if (strcasecmp(str_val, "NO (Normally Open)") == 0 || strcasecmp(str_val, "NO") == 0)
      mt = lv6::ManifoldType::NO;
    this->valve_controller_->set_manifold_type(mt);

  // ---- preheat_absorb_enabled ----
  } else if (strcmp(key, "preheat_absorb_enabled") == 0 && has_str && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_absorb_enabled = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->config_store_->update_control(ctrl);

  // ---- preheat_absorb_band_c ----
  } else if (strcmp(key, "preheat_absorb_band_c") == 0 && has_num && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_absorb_band_c = std::max(0.0f, std::min(5.0f, num_val));
    this->config_store_->update_control(ctrl);

  // ---- preheat_detect_delta_c ----
  } else if (strcmp(key, "preheat_detect_delta_c") == 0 && has_num && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_detect_delta_c = std::max(2.0f, std::min(25.0f, num_val));
    this->config_store_->update_control(ctrl);

  // ---- simple_preheat_enabled ----
  } else if (strcmp(key, "simple_preheat_enabled") == 0 && has_str && this->zone_controller_) {
    const bool en = strcasecmp(str_val, "on") == 0 || strcasecmp(str_val, "true") == 0 || strcmp(str_val, "1") == 0;
    this->zone_controller_->set_simple_preheat_enabled(en);

  // ---- motor_profile_default ----
  } else if (strcmp(key, "motor_profile_default") == 0 && has_str && this->config_store_ && this->valve_controller_) {
    lv6::MotorProfile mp;
    if (parse_motor_profile(str_val, &mp)) {
      auto motor_cfg = this->config_store_->get_motor_config();
      motor_cfg.default_profile = mp;
      this->config_store_->update_motor(motor_cfg);
      this->valve_controller_->reload_motor_config();
    }

  // ---- min_zone_flow_pct (secondary total, active only during commissioning) ----
  } else if (strcmp(key, "min_zone_flow_pct") == 0 && has_num && this->config_store_) {
    auto bal = this->config_store_->get_config().balancing;
    bal.secondary_min_total_opening_pct = std::max(0.0f, std::min(100.0f, num_val));
    this->config_store_->update_balancing(bal);

  // ---- minimum_flow_always (legacy API key; explicit secondary commissioning) ----
  } else if (strcmp(key, "minimum_flow_always") == 0 && has_str && this->zone_controller_) {
    const bool enabled = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->zone_controller_->set_secondary_flow_commissioning(enabled);

  } else if (strcmp(key, "ble_clock_sync_enabled") == 0 && has_str && this->ble_time_beacon_) {
    const bool enabled = (strcasecmp(str_val, "on") == 0 || strcasecmp(str_val, "true") == 0 ||
                          strcmp(str_val, "1") == 0);
    this->ble_time_beacon_->set_enabled(enabled);

  } else if (strcmp(key, "ble_clock_sync_interval_min") == 0 && has_num && this->ble_time_beacon_) {
    this->ble_time_beacon_->set_interval_min(static_cast<uint16_t>(num_val));

  // ---- motor config numeric setters ----
  } else if (has_num && this->config_store_ && this->valve_controller_) {
    auto motor_cfg = this->config_store_->get_motor_config();
    bool dirty = true;
    if (strcmp(key, "close_threshold_multiplier") == 0)
      motor_cfg.close_current_factor = num_val;
    else if (strcmp(key, "close_slope_threshold") == 0)
      motor_cfg.close_slope_threshold_ma_per_s = num_val;
    else if (strcmp(key, "close_slope_current_factor") == 0)
      motor_cfg.close_slope_current_factor = num_val;
    else if (strcmp(key, "open_threshold_multiplier") == 0)
      motor_cfg.open_current_factor = num_val;
    else if (strcmp(key, "open_slope_threshold") == 0)
      motor_cfg.open_slope_threshold_ma_per_s = num_val;
    else if (strcmp(key, "open_slope_current_factor") == 0)
      motor_cfg.open_slope_current_factor = num_val;
    else if (strcmp(key, "open_ripple_limit_factor") == 0)
      motor_cfg.open_ripple_limit_factor = num_val;
    else if (strcmp(key, "generic_runtime_limit_seconds") == 0)
      motor_cfg.generic_profile_runtime_limit_s = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "hmip_runtime_limit_seconds") == 0)
      motor_cfg.hmip_vdmot_runtime_limit_s = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "relearn_after_movements") == 0)
      motor_cfg.relearn_after_movements = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "relearn_after_hours") == 0)
      motor_cfg.relearn_after_hours = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "learned_factor_min_samples") == 0)
      motor_cfg.learned_factor_min_samples = static_cast<uint8_t>(num_val);
    else if (strcmp(key, "learned_factor_max_deviation_pct") == 0)
      motor_cfg.learned_factor_max_deviation_pct = num_val / 100.0f;
    else
      dirty = false;

    if (dirty) {
      this->config_store_->update_motor(motor_cfg);
      this->valve_controller_->reload_motor_config();
    }
  }
}

// =============================================================================
// Zone-state history
// =============================================================================

// Map a ZoneDisplayState string (from snapshot) to a compact uint8_t code.
// Returns HISTORY_STATE_UNKNOWN (0xFF) for empty / unrecognised strings.
static uint8_t parse_zone_display_state_code(const char *s) {
  if (!s || !s[0]) return HISTORY_STATE_UNKNOWN;
  if (strcasecmp(s, "OFF") == 0)                  return 0;
  if (strcasecmp(s, "MANUAL") == 0)               return 1;
  if (strcasecmp(s, "CALIBRATING") == 0)          return 2;
  if (strcasecmp(s, "WAITING_CALIBRATION") == 0)  return 3;
  if (strcasecmp(s, "WAITING_ROOM_TEMP") == 0)    return 4;
  if (strcasecmp(s, "HEATING") == 0)              return 5;
  if (strcasecmp(s, "IDLE") == 0)                 return 6;
  if (strcasecmp(s, "OVERHEATED") == 0)           return 7;
  return HISTORY_STATE_UNKNOWN;
}

void LV6Dashboard::sample_history_() {
  if (history_lock_ == nullptr) return;

  // Read current zone states from the live snapshot (brief lock).
  HistoryEntry entry{};
  entry.uptime_s = millis() / 1000UL;
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++)
    entry.zone_state[i] = HISTORY_STATE_UNKNOWN;
  entry.absorbing = (this->zone_controller_ != nullptr &&
                     this->zone_controller_->is_preheat_absorbing()) ? 1 : 0;
  entry.flow_dc = HISTORY_TEMP_NONE;
  entry.return_dc = HISTORY_TEMP_NONE;
  entry.demand_pct = HISTORY_DEMAND_NONE;

  float demand_floor_pct = 0.0f;
  if (this->config_store_ != nullptr) {
    const auto cfg = this->config_store_->get_config();
    if (cfg.balancing.secondary_flow_commissioning_enabled)
      demand_floor_pct = std::max(0.0f, std::min(100.0f, cfg.balancing.secondary_min_total_opening_pct));
  }

  if (snapshot_lock_ != nullptr && snapshot_ready_ &&
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(10)) == pdTRUE) {
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++)
      entry.zone_state[i] = parse_zone_display_state_code(snapshot_.zone_state[i]);
    if (!std::isnan(snapshot_.manifold_flow_c))
      entry.flow_dc = static_cast<int16_t>(lroundf(snapshot_.manifold_flow_c * 10.0f));
    if (!std::isnan(snapshot_.manifold_return_c))
      entry.return_dc = static_cast<int16_t>(lroundf(snapshot_.manifold_return_c * 10.0f));
    // Mean open-valve % above the active minimum-flow floor. This keeps the
    // demand index focused on extra heat demand instead of the manual baseline
    // flow held for a modulating heat source.
    float demand_sum = 0.0f;
    uint8_t demand_n = 0;
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      if (!std::isnan(snapshot_.zone_valve_pct[i])) {
        demand_sum += std::max(0.0f, snapshot_.zone_valve_pct[i] - demand_floor_pct);
        demand_n++;
      }
    }
    if (demand_n > 0) {
      long d = lroundf(demand_sum / demand_n);
      entry.demand_pct = static_cast<uint8_t>(d < 0 ? 0 : (d > 100 ? 100 : d));
    } else {
      entry.demand_pct = 0;
    }
    xSemaphoreGive(snapshot_lock_);
  }

  if (xSemaphoreTake(history_lock_, pdMS_TO_TICKS(10)) == pdTRUE) {
    history_ring_[history_head_] = entry;
    history_head_ = static_cast<uint16_t>((history_head_ + 1) % HISTORY_SLOTS);
    if (history_count_ < HISTORY_SLOTS) history_count_++;
    xSemaphoreGive(history_lock_);
  }
}

void LV6Dashboard::handle_history_(AsyncWebServerRequest *request) {
  // Copy history data under lock.
  auto *ring_copy = static_cast<HistoryEntry *>(malloc(sizeof(HistoryEntry) * HISTORY_SLOTS));
  if (!ring_copy) {
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_set_hdr(req_err, "Connection", "close");
    httpd_resp_send(req_err, "Out of memory", HTTPD_RESP_USE_STRLEN);
    return;
  }

  uint16_t count = 0;
  uint16_t head  = 0;
  if (history_lock_ != nullptr &&
      xSemaphoreTake(history_lock_, pdMS_TO_TICKS(50)) == pdTRUE) {
    memcpy(ring_copy, history_ring_, sizeof(HistoryEntry) * HISTORY_SLOTS);
    count = history_count_;
    head  = history_head_;
    xSemaphoreGive(history_lock_);
  }

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Connection", "close");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;

  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  const uint32_t current_uptime = millis() / 1000UL;
  appendf(buf, BUF_SIZE, offset,
      "{\"interval_s\":%lu,\"uptime_s\":%lu,\"count\":%u,\"entries\":[",
      static_cast<unsigned long>(HISTORY_INTERVAL_MS / 1000UL),
      static_cast<unsigned long>(current_uptime),
      static_cast<unsigned>(count));

  // Iterate from oldest to newest entry.
  // oldest_index = (head - count + HISTORY_SLOTS) % HISTORY_SLOTS when buffer is full,
  // or simply 0..count-1 when not yet full (head == count in that case).
  const uint16_t oldest = static_cast<uint16_t>(count < HISTORY_SLOTS
      ? 0
      : head);

  bool first_entry = true;
  for (uint16_t idx = 0; idx < count; idx++) {
    const uint16_t slot = static_cast<uint16_t>((oldest + idx) % HISTORY_SLOTS);
    const HistoryEntry &e = ring_copy[slot];

    // Flush before entries that might overflow the 2 KB buffer.
    // Each entry is at most ~62 bytes:
    // "[4294967295,7,7,7,7,7,7,1,72.5,68.1,100]," → ~41 chars.
    if (offset + 72 >= BUF_SIZE) {
      if (!flush()) { free(ring_copy); return; }
    }

    if (!first_entry) {
      buf[offset++] = ',';
    }
    first_entry = false;

    // flow/return as 1-decimal °C (or null), demand as int % (or null).
    char flow_s[12], return_s[12], demand_s[8];
    if (e.flow_dc == HISTORY_TEMP_NONE) { strcpy(flow_s, "null"); }
    else { snprintf(flow_s, sizeof flow_s, "%.1f", e.flow_dc / 10.0f); }
    if (e.return_dc == HISTORY_TEMP_NONE) { strcpy(return_s, "null"); }
    else { snprintf(return_s, sizeof return_s, "%.1f", e.return_dc / 10.0f); }
    if (e.demand_pct == HISTORY_DEMAND_NONE) { strcpy(demand_s, "null"); }
    else { snprintf(demand_s, sizeof demand_s, "%u", static_cast<unsigned>(e.demand_pct)); }

    // Fields after the absorption flag (index 7) are flow, return, demand —
    // appended so the zone-state timeline's index-based parser is unaffected.
    offset += static_cast<size_t>(snprintf(buf + offset, BUF_SIZE - offset,
        "[%lu,%u,%u,%u,%u,%u,%u,%u,%s,%s,%s]",
        static_cast<unsigned long>(e.uptime_s),
        static_cast<unsigned>(e.zone_state[0]),
        static_cast<unsigned>(e.zone_state[1]),
        static_cast<unsigned>(e.zone_state[2]),
        static_cast<unsigned>(e.zone_state[3]),
        static_cast<unsigned>(e.zone_state[4]),
        static_cast<unsigned>(e.zone_state[5]),
        static_cast<unsigned>(e.absorbing ? 1u : 0u),
        flow_s, return_s, demand_s));
  }

  appendf(buf, BUF_SIZE, offset, "]}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
  free(ring_copy);
}

// =============================================================================
// Live device-log stream
// =============================================================================

void LV6Dashboard::on_log_static_(void *self, uint8_t level, const char *tag,
                                  const char *message, size_t message_len) {
  static_cast<LV6Dashboard *>(self)->on_log_(level, tag, message, message_len);
}

void LV6Dashboard::on_log_(uint8_t level, const char *tag, const char *message,
                           size_t message_len) {
  this->logs_.on_log(level, tag, message, message_len);
}

namespace {

/// Large per-request scratch: PSRAM first, internal heap as fallback. free()
/// routes back to the correct heap for either allocation.
void *alloc_scratch(size_t bytes) {
  void *p = heap_caps_malloc(bytes, MALLOC_CAP_SPIRAM);
  return p != nullptr ? p : malloc(bytes);
}

/// Lines staged per copy. The ring lock is held for the copy only, never for
/// the network write, so a slow client cannot make the logger drop lines.
constexpr uint16_t LIVE_COPY_SLOTS  = 128;
constexpr uint16_t SMART_COPY_SLOTS = 32;

}  // namespace

// GET /api/hv6/v1/logs?since=<seq> — live scratch only, lines newer than <seq>.
void LV6Dashboard::handle_logs_(AsyncWebServerRequest *request) {
  uint32_t since = 0;
  const std::string since_arg = request->arg("since");
  if (!since_arg.empty())
    since = static_cast<uint32_t>(strtoul(since_arg.c_str(), nullptr, 10));

  auto *staging = static_cast<LogLine *>(alloc_scratch(sizeof(LogLine) * LIVE_COPY_SLOTS));
  if (staging == nullptr) {
    this->send_v1_(request, 503, "out_of_memory", "Cannot allocate log buffer");
    return;
  }
  uint16_t count = 0;
  uint32_t next_seq = this->logs_.next_seq();
  // A truncated read reports the seq it actually reached, so the next poll picks
  // up the remainder instead of skipping it.
  this->logs_.copy_live_since(since, staging, LIVE_COPY_SLOTS, &count, &next_seq);

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Connection", "close");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;
  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  appendf(buf, BUF_SIZE, offset, "{\"next_seq\":%lu,\"lines\":[",
          static_cast<unsigned long>(next_seq));

  for (uint16_t i = 0; i < count; i++) {
    const LogLine &l = staging[i];
    // A full entry can approach LOG_TAG_LEN + LOG_MSG_LEN plus escaping; flush
    // whenever the remaining buffer can't safely hold one.
    if (offset + (LOG_TAG_LEN + LOG_MSG_LEN) * 2 + 32 >= BUF_SIZE) {
      if (!flush()) {
        free(staging);
        return;
      }
    }
    if (i != 0)
      buf[offset++] = ',';

    appendf(buf, BUF_SIZE, offset, "[%lu,%u,\"",
            static_cast<unsigned long>(l.seq), static_cast<unsigned>(l.level));
    append_json_escaped(buf, BUF_SIZE, offset, l.tag);
    appendf(buf, BUF_SIZE, offset, "\",\"");
    append_json_escaped(buf, BUF_SIZE, offset, l.msg);
    appendf(buf, BUF_SIZE, offset, "\"]");
  }

  appendf(buf, BUF_SIZE, offset, "]}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
  free(staging);
}

// GET /api/hv6/v1/logs/download — the smart FIFO as a plain-text attachment.
void LV6Dashboard::handle_logs_download_(AsyncWebServerRequest *request) {
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "text/plain; charset=utf-8");
  httpd_resp_set_hdr(req, "Cache-Control", "no-store");
  httpd_resp_set_hdr(req, "Content-Disposition", "attachment; filename=lune-v6-logs.txt");
  httpd_resp_set_hdr(req, "Connection", "close");

  // Levels are ESPHOME_LOG_LEVEL_*; index 0 (NONE) never reaches the ring.
  static const char LEVEL_CHAR[] = {'-', 'E', 'W', 'I', 'C', 'D', 'V', 'V'};
  auto *staging = static_cast<LogLine *>(alloc_scratch(sizeof(LogLine) * SMART_COPY_SLOTS));
  if (staging == nullptr) {
    httpd_resp_send_chunk(req, "log buffer unavailable\n", HTTPD_RESP_USE_STRLEN);
    httpd_resp_send_chunk(req, nullptr, 0);
    return;
  }

  SmartLogCursor cursor{};
  this->logs_.smart_begin(&cursor);
  char line[LOG_TAG_LEN + LOG_MSG_LEN + 32];
  while (!cursor.done()) {
    const uint16_t n = this->logs_.smart_next_chunk(&cursor, staging, SMART_COPY_SLOTS);
    if (n == 0)
      break;  // lock unavailable or nothing left; end the body cleanly
    for (uint16_t i = 0; i < n; i++) {
      const LogLine &l = staging[i];
      const char level = l.level < sizeof(LEVEL_CHAR) ? LEVEL_CHAR[l.level] : '?';
      const int length = snprintf(line, sizeof(line), "[%c] %s: %s\n", level, l.tag, l.msg);
      if (length <= 0 || httpd_resp_send_chunk(req, line, static_cast<size_t>(length)) != ESP_OK) {
        free(staging);
        return;
      }
    }
  }
  free(staging);
  httpd_resp_send_chunk(req, nullptr, 0);
}

// =============================================================================
// Settings backup — export / import
// =============================================================================

// GET /api/hv6/v1/settings/export[?include_learned=0|1]
void LV6Dashboard::handle_settings_export_(AsyncWebServerRequest *request) {
  if (this->config_store_ == nullptr) {
    this->send_v1_(request, 503, "config_store_unavailable", "No config store");
    return;
  }
  bool include_learned = true;
  parse_bool_arg(request, "include_learned", &include_learned);

  // ~8 KB of document plus a DeviceConfig copy and six telemetry structs is far
  // more than the httpd worker stack allows; take the scratch from PSRAM.
  static constexpr size_t EXPORT_CAP = 8192;
  struct ExportScratch {
    lv6::DeviceConfig cfg;
    lv6::MotorTelemetry learned[lv6::NUM_ZONES];
    char json[EXPORT_CAP];
  };
  void *raw = alloc_scratch(sizeof(ExportScratch));
  if (raw == nullptr) {
    this->send_v1_(request, 503, "out_of_memory", "Cannot allocate export buffer");
    return;
  }
  auto *scratch = new (raw) ExportScratch{};

  // The firmware version lives in the published snapshot; read it under the
  // snapshot lock rather than from the HTTP scratch copy, which another handler
  // may have left stale.
  char firmware_version[SNAPSHOT_TEXT_LEN]{};
  if (snapshot_lock_ != nullptr && xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) == pdTRUE) {
    strncpy(firmware_version, this->snapshot_.firmware_version, sizeof(firmware_version) - 1);
    xSemaphoreGive(snapshot_lock_);
  }

  scratch->cfg = this->config_store_->get_config();
  bool has_learned = false;
  if (include_learned) {
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      scratch->learned[i] = lv6::MotorTelemetry{};
      if (this->config_store_->load_motor_telemetry(i, scratch->learned[i]))
        has_learned = true;
    }
  }

  settings_backup::ExportOptions opt{};
  opt.include_learned = include_learned;
  // probe_addrs: the 1-Wire ROM map lives in ESPHome globals, not the config
  // store, so it is omitted until the dashboard can read it back.
  const size_t written = settings_backup::write_export_json(
      scratch->json, EXPORT_CAP, scratch->cfg, firmware_version,
      scratch->learned, has_learned, nullptr, opt);
  if (written == 0) {
    free(scratch);
    this->send_v1_(request, 500, "export_failed", "Export document did not fit");
    return;
  }

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-store");
  httpd_resp_set_hdr(req, "Content-Disposition", "attachment; filename=lune-v6-settings.json");
  httpd_resp_set_hdr(req, "Connection", "close");
  httpd_resp_send(req, scratch->json, static_cast<ssize_t>(written));
  free(scratch);
}

// POST /api/hv6/v1/settings/import — body is an export document.
void LV6Dashboard::handle_settings_import_(AsyncWebServerRequest *request, const char *body) {
  if (!this->authorize_write_(request))
    return;
  if (this->config_store_ == nullptr) {
    this->send_v1_(request, 503, "config_store_unavailable", "No config store");
    return;
  }
  if (body == nullptr || body[0] == '\0') {
    this->send_v1_(request, 400, "missing_body", "Import document is required");
    return;
  }
  // Restoring learned motor timings onto different hardware is wrong, so the
  // caller can decline that part while still restoring user settings.
  bool restore_learned = true;
  parse_bool_param(request, body, "restore_learned", &restore_learned);

  struct ImportScratch {
    lv6::DeviceConfig cfg;
    lv6::MotorTelemetry learned[lv6::NUM_ZONES];
  };
  void *raw = alloc_scratch(sizeof(ImportScratch));
  if (raw == nullptr) {
    this->send_v1_(request, 503, "out_of_memory", "Cannot allocate import buffer");
    return;
  }
  auto *scratch = new (raw) ImportScratch{};

  scratch->cfg = this->config_store_->get_config();
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    scratch->learned[i] = lv6::MotorTelemetry{};
    this->config_store_->load_motor_telemetry(i, scratch->learned[i]);
  }

  bool learned_applied = false;
  const auto result = settings_backup::apply_import_json(body, scratch->cfg, restore_learned,
                                                         scratch->learned, &learned_applied,
                                                         nullptr, nullptr);
  if (!result.ok) {
    char response[224];
    snprintf(response, sizeof(response),
             "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"%s\",\"message\":\"%s\"}}",
             result.error_code, result.error_message);
    free(scratch);
    send_text_(request, 400, "application/json", response, false, "no-cache");
    return;
  }

  this->config_store_->set_config(scratch->cfg);
  if (learned_applied) {
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++)
      this->config_store_->save_motor_telemetry(i, scratch->learned[i]);
  }
  free(scratch);

  if (data_revision_ != UINT32_MAX)
    data_revision_++;
  ESP_LOGI(TAG, "Settings import applied: %u fields (%u skipped, %u ignored), learned=%s",
           static_cast<unsigned>(result.applied), static_cast<unsigned>(result.skipped),
           static_cast<unsigned>(result.ignored), learned_applied ? "yes" : "no");

  char response[224];
  snprintf(response, sizeof(response),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"applied\":%u,\"skipped\":%u,"
           "\"ignored\":%u,\"learned_restored\":%s,\"data_revision\":%lu}}",
           static_cast<unsigned>(result.applied), static_cast<unsigned>(result.skipped),
           static_cast<unsigned>(result.ignored), learned_applied ? "true" : "false",
           static_cast<unsigned long>(data_revision_));
  send_text_(request, 200, "application/json", response, false, "no-cache");
}

void LV6Dashboard::handle_ble_scan_(AsyncWebServerRequest *request) {
  if (zone_controller_ == nullptr) {
    send_text_(request, 503, "application/json", "{\"ok\":false,\"error\":\"no zone controller\"}",
               true, "no-cache");
    return;
  }

  // Kept static (not on the stack): the httpd worker thread has only a ~4 KB
  // stack and the lwip send path below is deep, so large stack locals here
  // overflow it. The httpd server is single-threaded, so static is safe.
  static lv6::Lv6ZoneController::BleSensorSeen sensors[lv6::Lv6ZoneController::BLE_SEEN_SLOTS];
  uint8_t count = zone_controller_->get_ble_discovered(sensors, lv6::Lv6ZoneController::BLE_SEEN_SLOTS);

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Connection", "close");

  static char buf[2048];
  size_t off = 0;

  uint32_t now = millis();
  off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off,
      "{\"ok\":true,\"count\":%u,\"sensors\":[", static_cast<unsigned>(count)));

  for (uint8_t i = 0; i < count && off < sizeof(buf) - 128; i++) {
    const auto &s = sensors[i];
    uint32_t age_s = (now - s.last_ms) / 1000;

    // 1-based zone, or -1 if unassigned. match_ble_mac copies only the MAC
    // fields (never the whole DeviceConfig).
    int8_t mz = zone_controller_->match_ble_mac(s.mac);
    int8_t assigned_zone = (mz >= 0) ? static_cast<int8_t>(mz + 1) : -1;

    char temp_buf[12];
    if (std::isfinite(s.temp_c))
      snprintf(temp_buf, sizeof(temp_buf), "%.1f", s.temp_c);
    else
      snprintf(temp_buf, sizeof(temp_buf), "null");

    // JSON-escape the advertised name (quotes/backslashes/control chars).
    char name_esc[2 * sizeof(s.name)];
    size_t ne = 0;
    for (size_t j = 0; s.name[j] != '\0' && ne < sizeof(name_esc) - 2; j++) {
      char c = s.name[j];
      if (c == '"' || c == '\\') {
        name_esc[ne++] = '\\';
        name_esc[ne++] = c;
      } else if (static_cast<unsigned char>(c) >= 0x20) {
        name_esc[ne++] = c;
      }
    }
    name_esc[ne] = '\0';

    off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off,
        "%s{\"mac\":\"%s\",\"name\":\"%s\",\"temp_c\":%s,\"rssi\":%d,\"age_s\":%lu,\"zone\":%d}",
        (i > 0) ? "," : "",
        s.mac, name_esc, temp_buf, static_cast<int>(s.rssi),
        static_cast<unsigned long>(age_s),
        static_cast<int>(assigned_zone)));
  }

  if (off < sizeof(buf) - 2)
    off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off, "]}"));

  httpd_resp_send(req, buf, static_cast<ssize_t>(off));
}

}  // namespace lv6_dashboard
}  // namespace esphome
