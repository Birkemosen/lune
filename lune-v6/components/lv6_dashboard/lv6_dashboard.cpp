#include "lv6_dashboard.h"
#include "../lv6_zone_controller/absorb_command_logic.h"
#include "../lv6_zone_controller/hydraulic_diagnostics.h"
#include "../lv6_zone_controller/probe_mapping.h"
#include "../lv6_zone_controller/thermal_model.h"
#include "../lv6_config_store/group_model.h"
#include "esphome/components/lv6_ble_time_beacon/lv6_ble_time_beacon.h"
#include "esphome/components/nimble_hub/nimble_hub.h"
#include "settings_backup.h"

#include "esphome/core/log.h"
#include "esphome/core/version.h"
#ifdef USE_LOGGER
#include "esphome/components/logger/logger.h"
#endif
#include <algorithm>
#include <cctype>
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
#if defined(CONFIG_HEAP_TRACING_STANDALONE) || defined(CONFIG_HEAP_TRACING)
#include <esp_heap_trace.h>
#include <esp_memory_utils.h>
#endif

namespace esphome {
namespace lv6_dashboard {

static const char *const TAG = "lv6_dashboard";
static constexpr size_t STATIC_CHUNK_SIZE = 2048;

namespace {

/// Large scratch: PSRAM first, internal heap as fallback. free() routes back to
/// the correct heap for either allocation.
void *alloc_scratch(size_t bytes) {
  void *p = heap_caps_malloc(bytes, MALLOC_CAP_SPIRAM);
  return p != nullptr ? p : malloc(bytes);
}

// Append formatted text without ever committing a truncated write. A partial
// vsnprintf into a chunk buffer used to leave a NUL mid-payload; chunked HTTP
// then shipped that NUL and the dashboard failed to parse /api/v1/state.
bool appendfv(char *buffer, size_t capacity, size_t &offset, const char *fmt, va_list args) {
  if (offset >= capacity)
    return false;

  va_list probe;
  va_copy(probe, args);
  const int need = vsnprintf(nullptr, 0, fmt, probe);
  va_end(probe);
  if (need < 0)
    return false;
  // Keep one byte for the C terminator vsnprintf writes; it is not part of offset.
  if (offset + static_cast<size_t>(need) >= capacity)
    return false;

  const int written = vsnprintf(buffer + offset, capacity - offset, fmt, args);
  if (written < 0 || written != need)
    return false;

  offset += static_cast<size_t>(written);
  return true;
}

bool appendf(char *buffer, size_t capacity, size_t &offset, const char *fmt, ...) {
  va_list args;
  va_start(args, fmt);
  const bool ok = appendfv(buffer, capacity, offset, fmt, args);
  va_end(args);
  return ok;
}

// Every code `send_v1_` can emit must appear here: an unmapped code silently
// becomes 500, and the dashboard branches on the exact status. A missing 403
// masked CSRF rejection as a server error.
const char *http_status_line(int code) {
  switch (code) {
    case 200: return "200 OK";
    case 204: return "204 No Content";
    case 400: return "400 Bad Request";
    case 403: return "403 Forbidden";
    case 404: return "404 Not Found";
    case 405: return "405 Method Not Allowed";
    case 409: return "409 Conflict";
    case 429: return "429 Too Many Requests";
    case 503: return "503 Service Unavailable";
    default: return "500 Internal Server Error";
  }
}

bool is_dashboard_js_url(const char *url) {
  if (url == nullptr) return false;
  static constexpr const char PATHS[][16] = {"/dashboard.js", "/binder.js"};
  for (const char *path : PATHS) {
    const size_t path_len = strlen(path);
    if (strncmp(url, path, path_len) == 0 && (url[path_len] == '\0' || url[path_len] == '?'))
      return true;
  }
  return false;
}

bool is_ui_css_url(const char *url) {
  static constexpr const char PATH[] = "/lune-ui.css";
  static constexpr size_t PATH_LEN = sizeof(PATH) - 1;
  return url != nullptr && strncmp(url, PATH, PATH_LEN) == 0 &&
         (url[PATH_LEN] == '\0' || url[PATH_LEN] == '?');
}

bool is_lang_html_url(const char *url, const char *lang) {
  if (url == nullptr || lang == nullptr) return false;
  char path[8];
  snprintf(path, sizeof(path), "/%s/", lang);
  const size_t path_len = strlen(path);
  if (strncmp(url, path, path_len) == 0)
    return url[path_len] == '\0' || strcmp(url + path_len, "index.html") == 0 ||
           url[path_len] == '?';
  // Also accept /en and /da without trailing slash.
  char bare[6];
  snprintf(bare, sizeof(bare), "/%s", lang);
  return strcmp(url, bare) == 0;
}

const char *pick_ui_lang(AsyncWebServerRequest *request) {
  const auto cookie = request->get_header("Cookie");
  if (cookie.has_value()) {
    const char *c = strstr(cookie->c_str(), "lune_lang=");
    if (c != nullptr) {
      c += 10;
      if (strncmp(c, "da", 2) == 0) return "da";
      if (strncmp(c, "en", 2) == 0) return "en";
    }
  }
  const auto accept = request->get_header("Accept-Language");
  if (accept.has_value()) {
    const char *a = accept->c_str();
    const char *da = strstr(a, "da");
    const char *en = strstr(a, "en");
    if (da && (!en || da < en)) return "da";
  }
  return "en";
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
  off += snprintf(buffer + off, capacity - off, "lv6-");
  for (const char *p = mac; p != nullptr && *p != '\0' && off + 1 < capacity; ++p) {
    char c = *p;
    if (c >= 'A' && c <= 'F')
      c = static_cast<char>(c - 'A' + 'a');
    if ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))
      buffer[off++] = c;
  }
  buffer[off] = '\0';
  if (std::strcmp(buffer, "lv6-") == 0)
    std::strncpy(buffer, "lv6-unknown", capacity - 1);
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
  if (strcasecmp(raw, "Local Probe") == 0 || strcasecmp(raw, "probe") == 0) {
    *out = lv6::TempSource::LOCAL_PROBE;
    return true;
  }
  if (strcasecmp(raw, "BLE") == 0 || strcasecmp(raw, "BLE Sensor") == 0) {
    *out = lv6::TempSource::BLE_SENSOR;
    return true;
  }
  if (strcasecmp(raw, "External") == 0 || strcasecmp(raw, "EXTERNAL") == 0 ||
      strcasecmp(raw, "External (Wi-Fi)") == 0 || strcasecmp(raw, "External (Wi‑Fi)") == 0) {
    *out = lv6::TempSource::EXTERNAL;
    return true;
  }
  return false;
}

static const char *device_display_name_cstr(const lv6::SystemConfig &sys) {
  return sys.display_name[0] != '\0' ? sys.display_name : "Lune V6";
}

static void json_escape_cstr(const char *in, char *out, size_t out_len) {
  if (out_len == 0)
    return;
  size_t o = 0;
  for (size_t i = 0; in[i] != '\0' && o < out_len - 2; i++) {
    char c = in[i];
    if (c == '"' || c == '\\') {
      if (o + 2 >= out_len)
        break;
      out[o++] = '\\';
    }
    out[o++] = (c >= 0x20) ? c : ' ';
  }
  out[o] = '\0';
}

static const char *temp_source_to_dashboard_str(lv6::TempSource src) {
  switch (src) {
    case lv6::TempSource::LOCAL_PROBE:
      return "Local Probe";
    case lv6::TempSource::BLE_SENSOR:
      return "BLE";
    case lv6::TempSource::EXTERNAL:
      return "External";
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

#ifndef LV6_DASHBOARD_ASSET_V
#define LV6_DASHBOARD_ASSET_V "dev"
#endif
#ifndef LV6_UI_ASSET_V
#define LV6_UI_ASSET_V LV6_DASHBOARD_ASSET_V
#endif

// Legacy fallback shell used only when LDS2 HTML assets are not embedded.
static const char DASHBOARD_HTML_FALLBACK[] =
    "<!doctype html><html><head>"
    "<meta charset=\"utf-8\">"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
    "<meta name=\"color-scheme\" content=\"light dark\">"
    "<link rel=\"icon\" href=\"data:,\">"
    "<title>Lune V6</title>"
    "<link rel=\"stylesheet\" href=\"/lune-ui.css?v=" LV6_UI_ASSET_V "\">"
    "</head><body>"
    "<p>Dashboard UI assets missing. Run <code>make dashboard-build</code>.</p>"
    "<script src=\"/binder.js?v=" LV6_DASHBOARD_ASSET_V "\"></script>"
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
  s.free_dma_kb = heap_caps_get_free_size(MALLOC_CAP_DMA) / 1024;
  s.largest_internal_kb = heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL) / 1024;
  s.min_internal_kb = heap_caps_get_minimum_free_size(MALLOC_CAP_INTERNAL) / 1024;
  s.free_psram_kb = heap_caps_get_free_size(MALLOC_CAP_SPIRAM) / 1024;
  s.largest_psram_kb = heap_caps_get_largest_free_block(MALLOC_CAP_SPIRAM) / 1024;
  {
    multi_heap_info_t info{};
    heap_caps_get_info(&info, MALLOC_CAP_INTERNAL);
    s.internal_allocated_kb = info.total_allocated_bytes / 1024;
    s.internal_free_blocks = info.free_blocks;
    s.internal_alloc_blocks = info.allocated_blocks;
  }

  if (this->nimble_hub_) {
    s.ble_hub_enabled = this->nimble_hub_->is_enabled();
    s.ble_scanning = this->nimble_hub_->scanning();
    s.ble_ads_per_sec = this->nimble_hub_->ads_per_sec();
    s.ble_last_adv_age_ms = this->nimble_hub_->last_adv_age_ms();
  }

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
    s.motor_working_ripple[i] = NAN;
    s.motor_pin_free_ripple[i] = NAN;
    s.motor_stroke_model[i] = 0;
    s.motor_learn_pct[i] = 0;
    s.motor_learn_phase[i] = 0;
    s.motor_learn_sample[i] = 0;
    s.motor_learn_samples_needed[i] = 0;
  }
  // Prefer live valve telemetry over the 10 s ESPHome template sensors so the
  // zone UI updates as soon as a relearn finishes (or fails).
  if (this->valve_controller_) {
    uint16_t fault_fp = 0;
    for (uint8_t i = 0; i < 6; i++) {
      const auto t = this->valve_controller_->get_telemetry(i);
      s.motor_open_ripple[i] = static_cast<float>(t.learned_open_ripples);
      s.motor_close_ripple[i] = static_cast<float>(t.learned_close_ripples);
      s.motor_open_factor[i] = t.learned_open_current_factor;
      s.motor_close_factor[i] = t.learned_close_current_factor;
      s.motor_working_ripple[i] = static_cast<float>(t.contact_to_stop_close_ripples);
      s.motor_pin_free_ripple[i] = static_cast<float>(t.pin_engage_close_ripples);
      s.motor_stroke_model[i] = static_cast<uint8_t>(t.stroke_model);
      const char *fault = lv6::fault_code_to_string(t.last_fault_code);
      std::strncpy(s.motor_fault[i], fault, sizeof(s.motor_fault[i]) - 1);
      s.motor_fault[i][sizeof(s.motor_fault[i]) - 1] = '\0';
      fault_fp = static_cast<uint16_t>((fault_fp * 33u) ^ static_cast<uint8_t>(t.last_fault_code));
    }
    if (fault_fp != this->last_motor_fault_fp_) {
      this->last_motor_fault_fp_ = fault_fp;
      if (this->runtime_revision_ != UINT32_MAX)
        this->runtime_revision_++;
    }
    const auto lp = this->valve_controller_->get_learning_progress();
    if (lp.zone < 6) {
      s.motor_learn_pct[lp.zone] = lp.pct;
      s.motor_learn_phase[lp.zone] = lp.phase;
      s.motor_learn_sample[lp.zone] = lp.sample;
      s.motor_learn_samples_needed[lp.zone] = lp.samples_needed;
    }
    const uint32_t packed = this->valve_controller_->get_learning_progress_packed();
    if (packed != this->last_learning_progress_packed_) {
      this->last_learning_progress_packed_ = packed;
      if (this->runtime_revision_ != UINT32_MAX)
        this->runtime_revision_++;
    }
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
    // motor_fault[] is filled from live valve telemetry above when available.
    if (!this->valve_controller_)
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
    if (this->zone_controller_) {
      const auto auth_snap = this->authority_.snapshot(millis());
      this->zone_controller_->set_touch_authority_active(auth_snap.touch_lease_active);
      if (auth_snap.touch_lease_active && auth_snap.control_mode != lv6_authority::ControlMode::UNSET) {
        const auto mode = (auth_snap.control_mode == lv6_authority::ControlMode::NORMAL)
                              ? lv6::HeatingProfile::NORMAL
                              : lv6::HeatingProfile::HEAT_PUMP;
        this->zone_controller_->set_touch_control_mode(true, mode);
      } else {
        this->zone_controller_->set_touch_control_mode(false, lv6::HeatingProfile::HEAT_PUMP);
      }
    }
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
    s.heating_mode = ctrl_cfg.mode;
    s.hp_overheat_margin_c = ctrl_cfg.hp_overheat_margin_c;
    s.hp_base_pct = ctrl_cfg.hp_base_pct;
    s.hp_trim_floor_pct = ctrl_cfg.hp_trim_floor_pct;
    s.preheat_absorbing = this->zone_controller_ && this->zone_controller_->is_preheat_absorbing();
    s.absorb_mode = this->zone_controller_ ? this->zone_controller_->absorb_mode_code() : 0;
    if (this->zone_controller_) {
      std::strncpy(s.absorb_reason, this->zone_controller_->absorb_arm_reason(),
                   sizeof(s.absorb_reason) - 1);
      s.absorb_reason[sizeof(s.absorb_reason) - 1] = '\0';
      std::strncpy(s.absorb_end_reason, this->zone_controller_->absorb_arm_end_reason(),
                   sizeof(s.absorb_end_reason) - 1);
      s.absorb_end_reason[sizeof(s.absorb_end_reason) - 1] = '\0';
    } else {
      s.absorb_reason[0] = '\0';
      s.absorb_end_reason[0] = '\0';
    }
    if (this->zone_controller_) {
      s.effective_heating_mode = this->zone_controller_->get_effective_control_mode();
      s.heating_mode_from_touch = this->zone_controller_->is_touch_authority_active() &&
                                  this->zone_controller_->has_touch_control_mode();
      s.heat_demand = this->zone_controller_->get_heat_demand();
    } else {
      s.effective_heating_mode = ctrl_cfg.mode;
      s.heating_mode_from_touch = false;
      s.heat_demand = {};
    }
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      if (this->zone_controller_) {
        s.zone_loop_share_pct[i] = this->zone_controller_->get_loop_share_pct(i);
        s.zone_absorb_capacity_rank[i] = this->zone_controller_->get_absorb_capacity_rank(i);
        s.zone_relative_kv[i] =
            this->zone_controller_->get_relative_kv(i, s.zone_valve_pct[i]);
        const auto zs = this->zone_controller_->get_zone_snapshot(i);
        s.zone_static_factor[i] = zs.static_factor;
        s.zone_balance_adapt[i] = zs.balance_adapt;
        s.zone_hydraulic_factor[i] = zs.hydraulic_factor;
      } else {
        s.zone_loop_share_pct[i] = NAN;
        s.zone_absorb_capacity_rank[i] = 0;
        s.zone_relative_kv[i] = NAN;
        s.zone_static_factor[i] = NAN;
        s.zone_balance_adapt[i] = 1.0f;
        s.zone_hydraulic_factor[i] = NAN;
      }
    }
    s.authority              = this->config_store_->get_authority_config();
    s.balancing              = this->config_store_->get_config().balancing;
    s.min_zone_flow_pct      = s.balancing.secondary_min_total_opening_pct;
    s.minimum_flow_always    = s.balancing.secondary_flow_commissioning_enabled;
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      s.zones[i]            = this->config_store_->get_zone_config(i);
      s.zone_temp_source[i] = this->config_store_->get_zone_temp_source(i);
      this->config_store_->get_zone_ble_mac_str(i, s.zone_ble_mac[i], sizeof(s.zone_ble_mac[i]));
      const auto &sc = this->config_store_->get_config().sensor_config;
      strncpy(s.zone_sensor_id[i], sc.zone_sensor_id[i], sizeof(s.zone_sensor_id[i]) - 1);
      s.zone_sensor_id[i][sizeof(s.zone_sensor_id[i]) - 1] = '\0';
      strncpy(s.zone_sensor_name[i], sc.zone_sensor_name[i], sizeof(s.zone_sensor_name[i]) - 1);
      s.zone_sensor_name[i][sizeof(s.zone_sensor_name[i]) - 1] = '\0';
      s.zone_external_temp_age_ms[i] =
          this->zone_controller_ ? this->zone_controller_->get_zone_external_temp_age_ms(i)
                                 : UINT32_MAX;
      if (s.zone_temp_source[i] == lv6::TempSource::BLE_SENSOR)
        s.ble_demanded = true;
    }
    if (this->config_store_->get_config().sensor_config.ble_clock_sync_enabled)
      s.ble_demanded = true;
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

  // Notify the dashboard only when displayable live values change. Quantize so
  // sub-display noise does not bump runtime_revision every snapshot tick.
  {
    auto mix = [](uint32_t h, uint32_t v) -> uint32_t {
      h ^= v + 0x9e3779b9u + (h << 6) + (h >> 2);
      return h;
    };
    auto q_dc = [](float c) -> uint32_t {
      if (!std::isfinite(c)) return 0x7FFFu;
      long v = lroundf(c * 10.0f);  // 0.1 °C
      if (v < -2000) v = -2000;
      if (v > 2000) v = 2000;
      return static_cast<uint32_t>(v + 2000);
    };
    auto q_pct = [](float p) -> uint32_t {
      if (!std::isfinite(p)) return 0xFFu;
      long v = lroundf(p);
      if (v < 0) v = 0;
      if (v > 100) v = 100;
      return static_cast<uint32_t>(v);
    };
    uint32_t fp = 2166136261u;
    fp = mix(fp, q_dc(s.manifold_flow_c));
    fp = mix(fp, q_dc(s.manifold_return_c));
    for (uint8_t i = 0; i < 6; i++) {
      fp = mix(fp, q_dc(s.zone_temp_c[i]));
      fp = mix(fp, q_pct(s.zone_valve_pct[i]));
      fp = mix(fp, q_dc(s.zone_preheat_c[i]));
      // Zone state string → cheap length + first byte (enough for idle/heating/fault flips).
      fp = mix(fp, static_cast<uint32_t>(s.zone_state[i][0]) |
                       (static_cast<uint32_t>(strnlen(s.zone_state[i], 16)) << 8));
    }
    // Learning progress already bumps runtime_revision_ separately above —
    // keep it out of this fingerprint so idle clients are not woken every %.
    if (fp != this->last_live_telemetry_fp_) {
      this->last_live_telemetry_fp_ = fp;
      if (this->runtime_revision_ != UINT32_MAX)
        this->runtime_revision_++;
    }
  }

  if (xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(5)) == pdTRUE) {
    memcpy(&this->snapshot_, &s, sizeof(s));
    this->snapshot_ready_ = true;
    xSemaphoreGive(snapshot_lock_);
  }
}

#if defined(CONFIG_HEAP_TRACING_STANDALONE) || defined(CONFIG_HEAP_TRACING)
// TEMPORARY — remove with packages/debug/heap-tracing.yaml after investigation.
//
// ESP-IDF heap_trace_dump() prints only via esp_rom_printf (UART ROM path). That
// bypasses ESPHome's logger callback, so dashboard / live-log views show the
// "--- heap_trace_dump ---" banner and then nothing. We dump through ESP_LOGI
// instead, skip malloc/heap_caps wrapper frames when picking an owner PC, and
// print a sample multi-frame PC stack for each top INTERNAL site.

namespace {

// Depth 8 → ~88 B/record with standalone TAILQ; 768 × 88 ≈ 66 KB in PSRAM.
constexpr size_t kHeapTraceRecords = 768;
constexpr size_t kHeapTraceTopSites = 24;
constexpr size_t kHeapTraceTopAllocs = 16;
constexpr uintptr_t kHeapWrapperWindow = 0x800;  // ~2 KB past each wrapper symbol

struct HeapTraceSiteAgg {
  void *owner_pc{nullptr};
  size_t bytes{0};
  size_t count{0};
  size_t max_bytes{0};
  void *sample_stack[CONFIG_HEAP_TRACING_STACK_DEPTH]{};
};

// Thin wrappers that usually own alloced_by[0] (and sometimes [1]) on Xtensa.
// Return addresses land a few bytes past the call site inside these functions.
extern "C" {
void *heap_caps_malloc(size_t size, uint32_t caps);
void *heap_caps_calloc(size_t n, size_t size, uint32_t caps);
void *heap_caps_realloc(void *ptr, size_t size, uint32_t caps);
void *heap_caps_aligned_alloc(size_t alignment, size_t size, uint32_t caps);
void *heap_caps_malloc_prefer(size_t size, size_t num, ...);
void *heap_caps_calloc_prefer(size_t n, size_t size, size_t num, ...);
void *pvPortMalloc(size_t xWantedSize);
void *__wrap_heap_caps_malloc_base(size_t size, uint32_t caps);
void *__wrap_heap_caps_realloc_base(void *ptr, size_t size, uint32_t caps);
void *__wrap_heap_caps_aligned_alloc_base(size_t alignment, size_t size, uint32_t caps);
}

bool pc_in_wrapper_window_(void *pc, void *fn) {
  if (pc == nullptr || fn == nullptr)
    return false;
  const uintptr_t p = reinterpret_cast<uintptr_t>(pc);
  const uintptr_t s = reinterpret_cast<uintptr_t>(fn);
  return p >= s && p < s + kHeapWrapperWindow;
}

bool is_heap_wrapper_pc_(void *pc) {
  if (pc == nullptr)
    return false;
  // malloc/calloc/realloc come from <cstdlib> / newlib — compare by address.
  return pc_in_wrapper_window_(pc, reinterpret_cast<void *>(heap_caps_malloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(heap_caps_calloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(heap_caps_realloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(heap_caps_aligned_alloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(heap_caps_malloc_prefer)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(heap_caps_calloc_prefer)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(malloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(calloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(realloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(pvPortMalloc)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(__wrap_heap_caps_malloc_base)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(__wrap_heap_caps_realloc_base)) ||
         pc_in_wrapper_window_(pc, reinterpret_cast<void *>(__wrap_heap_caps_aligned_alloc_base));
}

void *owner_pc_from_stack_(void *const *stack) {
  void *first = nullptr;
  for (int i = 0; i < CONFIG_HEAP_TRACING_STACK_DEPTH; i++) {
    void *pc = stack[i];
    if (pc == nullptr)
      break;
    if (first == nullptr)
      first = pc;
    if (!is_heap_wrapper_pc_(pc))
      return pc;
  }
  return first;  // all wrappers / empty — still attribute somewhere
}

void copy_alloc_stack_(void *dst[CONFIG_HEAP_TRACING_STACK_DEPTH],
                       void *const src[CONFIG_HEAP_TRACING_STACK_DEPTH]) {
  for (int i = 0; i < CONFIG_HEAP_TRACING_STACK_DEPTH; i++)
    dst[i] = src[i];
}

void format_pc_stack_(char *buf, size_t buf_len, void *const *stack) {
  if (buf_len == 0)
    return;
  buf[0] = '\0';
  size_t off = 0;
  for (int i = 0; i < CONFIG_HEAP_TRACING_STACK_DEPTH; i++) {
    if (stack[i] == nullptr)
      break;
    const int n = snprintf(buf + off, buf_len - off, "%s%p", (i == 0) ? "" : ":", stack[i]);
    if (n < 0 || static_cast<size_t>(n) >= buf_len - off)
      break;
    off += static_cast<size_t>(n);
  }
  if (off == 0)
    snprintf(buf, buf_len, "(none)");
}

void dump_heap_trace_via_logger_() {
  heap_trace_summary_t summary{};
  esp_err_t sum_err = heap_trace_summary(&summary);
  if (sum_err != ESP_OK) {
    ESP_LOGE(TAG, "heap_trace_summary failed: %s (tracing never init/started?)",
             esp_err_to_name(sum_err));
    return;
  }

  // Stop so LEAKS-mode iteration does not skip entries mid-dump; resume after.
  const bool was_running = (heap_trace_stop() == ESP_OK);

  ESP_LOGI(TAG,
           "heap_trace summary: mode=%s records=%u/%u high_water=%u overflow=%s "
           "total_alloc=%u total_free=%u stack_depth=%d",
           summary.mode == HEAP_TRACE_ALL ? "ALL" : "LEAKS", (unsigned) summary.count,
           (unsigned) summary.capacity, (unsigned) summary.high_water_mark,
           summary.has_overflowed ? "yes" : "no", (unsigned) summary.total_allocations,
           (unsigned) summary.total_frees, CONFIG_HEAP_TRACING_STACK_DEPTH);

  const size_t n = heap_trace_get_count();
  if (n == 0) {
    ESP_LOGW(TAG, "heap_trace: 0 outstanding records — nothing to attribute "
                  "(start failed, buffer empty, or all traced allocs already freed)");
    if (was_running)
      heap_trace_resume();
    return;
  }

  std::vector<HeapTraceSiteAgg> sites;
  sites.reserve(64);
  size_t internal_bytes = 0;
  size_t internal_count = 0;
  size_t psram_bytes = 0;
  size_t psram_count = 0;
  size_t other_bytes = 0;
  size_t other_count = 0;

  // Power-of-two size histogram for INTERNAL outstanding allocs.
  static constexpr size_t kHistEdges[] = {16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192};
  static constexpr size_t kHistBuckets = (sizeof(kHistEdges) / sizeof(kHistEdges[0])) + 1;
  size_t hist_count[kHistBuckets]{};
  size_t hist_bytes[kHistBuckets]{};

  struct LargeAlloc {
    size_t size;
    void *addr;
    void *owner_pc;
    void *stack[CONFIG_HEAP_TRACING_STACK_DEPTH];
  };
  LargeAlloc largest[kHeapTraceTopAllocs]{};
  size_t largest_n = 0;

  for (size_t i = 0; i < n; i++) {
    heap_trace_record_t rec{};
    if (heap_trace_get(i, &rec) != ESP_OK || rec.address == nullptr || rec.freed)
      continue;

    if (esp_ptr_external_ram(rec.address)) {
      psram_bytes += rec.size;
      psram_count++;
      continue;
    }
    if (!esp_ptr_internal(rec.address)) {
      other_bytes += rec.size;
      other_count++;
      continue;
    }

    internal_bytes += rec.size;
    internal_count++;

    size_t bucket = kHistBuckets - 1;
    for (size_t b = 0; b < sizeof(kHistEdges) / sizeof(kHistEdges[0]); b++) {
      if (rec.size <= kHistEdges[b]) {
        bucket = b;
        break;
      }
    }
    hist_count[bucket]++;
    hist_bytes[bucket] += rec.size;

    void *owner = owner_pc_from_stack_(rec.alloced_by);
    bool found = false;
    for (auto &s : sites) {
      if (s.owner_pc == owner) {
        s.bytes += rec.size;
        s.count++;
        if (rec.size > s.max_bytes) {
          s.max_bytes = rec.size;
          copy_alloc_stack_(s.sample_stack, rec.alloced_by);
        }
        found = true;
        break;
      }
    }
    if (!found) {
      HeapTraceSiteAgg s;
      s.owner_pc = owner;
      s.bytes = rec.size;
      s.count = 1;
      s.max_bytes = rec.size;
      copy_alloc_stack_(s.sample_stack, rec.alloced_by);
      sites.push_back(s);
    }

    // Track largest individual INTERNAL allocs (insertion into fixed top-N).
    size_t insert_at = largest_n;
    for (size_t k = 0; k < largest_n; k++) {
      if (rec.size > largest[k].size) {
        insert_at = k;
        break;
      }
    }
    if (insert_at < kHeapTraceTopAllocs) {
      size_t move_n = largest_n < kHeapTraceTopAllocs ? largest_n : (kHeapTraceTopAllocs - 1);
      for (size_t k = move_n; k > insert_at; k--)
        largest[k] = largest[k - 1];
      largest[insert_at].size = rec.size;
      largest[insert_at].addr = rec.address;
      largest[insert_at].owner_pc = owner;
      copy_alloc_stack_(largest[insert_at].stack, rec.alloced_by);
      if (largest_n < kHeapTraceTopAllocs)
        largest_n++;
    }
  }

  ESP_LOGI(TAG,
           "heap_trace caps split: INTERNAL %uB in %u allocs | PSRAM %uB in %u | other %uB in %u",
           (unsigned) internal_bytes, (unsigned) internal_count, (unsigned) psram_bytes,
           (unsigned) psram_count, (unsigned) other_bytes, (unsigned) other_count);

  ESP_LOGI(TAG, "--- INTERNAL size histogram ---");
  for (size_t b = 0; b < kHistBuckets; b++) {
    if (hist_count[b] == 0)
      continue;
    if (b == 0) {
      ESP_LOGI(TAG, "  <=%4u B: %u allocs, %u B", (unsigned) kHistEdges[0],
               (unsigned) hist_count[b], (unsigned) hist_bytes[b]);
    } else if (b < kHistBuckets - 1) {
      ESP_LOGI(TAG, "  <=%4u B: %u allocs, %u B", (unsigned) kHistEdges[b],
               (unsigned) hist_count[b], (unsigned) hist_bytes[b]);
    } else {
      ESP_LOGI(TAG, "   >%4u B: %u allocs, %u B",
               (unsigned) kHistEdges[kHistBuckets - 2], (unsigned) hist_count[b],
               (unsigned) hist_bytes[b]);
    }
  }

  std::sort(sites.begin(), sites.end(),
            [](const HeapTraceSiteAgg &a, const HeapTraceSiteAgg &b) { return a.bytes > b.bytes; });

  char stack_buf[CONFIG_HEAP_TRACING_STACK_DEPTH * 12];
  const size_t show = std::min(sites.size(), kHeapTraceTopSites);
  ESP_LOGI(TAG,
           "--- top INTERNAL alloc sites by total size (owner PC skips heap_caps/malloc) ---");
  for (size_t i = 0; i < show; i++) {
    format_pc_stack_(stack_buf, sizeof(stack_buf), sites[i].sample_stack);
    ESP_LOGI(TAG, "  #%02u %6u B ×%u (max %u B) owner=%p", (unsigned) (i + 1),
             (unsigned) sites[i].bytes, (unsigned) sites[i].count, (unsigned) sites[i].max_bytes,
             sites[i].owner_pc);
    ESP_LOGI(TAG, "       stack=%s", stack_buf);
  }
  if (show == 0)
    ESP_LOGW(TAG, "  (no INTERNAL outstanding records in buffer)");

  ESP_LOGI(TAG, "--- largest INTERNAL allocs ---");
  for (size_t i = 0; i < largest_n; i++) {
    format_pc_stack_(stack_buf, sizeof(stack_buf), largest[i].stack);
    ESP_LOGI(TAG, "  #%02u %6u B @ %p owner=%p", (unsigned) (i + 1), (unsigned) largest[i].size,
             largest[i].addr, largest[i].owner_pc);
    ESP_LOGI(TAG, "       stack=%s", stack_buf);
  }

  if (summary.has_overflowed) {
    ESP_LOGW(TAG, "heap_trace buffer overflowed — oldest sites dropped; bump kHeapTraceRecords");
  }

  if (was_running) {
    esp_err_t r = heap_trace_resume();
    if (r != ESP_OK)
      ESP_LOGW(TAG, "heap_trace_resume failed: %s", esp_err_to_name(r));
  }
}

}  // namespace

void start_heap_tracing_early() {
  static bool started = false;
  if (started)
    return;

  // Prefer PSRAM so INTERNAL stays available for the owners we attribute
  // (ISR allocs may not be recorded when the buffer is external).
  const char *buf_where = "PSRAM";
  heap_trace_record_t *records = static_cast<heap_trace_record_t *>(heap_caps_calloc(
      kHeapTraceRecords, sizeof(heap_trace_record_t), MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
  if (records == nullptr) {
    buf_where = "INTERNAL";
    records = static_cast<heap_trace_record_t *>(heap_caps_calloc(
        kHeapTraceRecords, sizeof(heap_trace_record_t), MALLOC_CAP_INTERNAL | MALLOC_CAP_8BIT));
  }
  if (records == nullptr) {
    ESP_LOGE(TAG, "heap_trace INIT FAILED: record buffer alloc failed (%u × %u B)",
             (unsigned) kHeapTraceRecords, (unsigned) sizeof(heap_trace_record_t));
    return;
  }

  esp_err_t err = heap_trace_init_standalone(records, kHeapTraceRecords);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "heap_trace INIT FAILED: heap_trace_init_standalone: %s", esp_err_to_name(err));
    heap_caps_free(records);
    return;
  }

  // LEAKS mode keeps outstanding allocs only — right tool for "who holds INTERNAL".
  err = heap_trace_start(HEAP_TRACE_LEAKS);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "heap_trace INIT FAILED: heap_trace_start: %s", esp_err_to_name(err));
    return;
  }

  started = true;
  const unsigned buf_kb =
      (unsigned) ((kHeapTraceRecords * sizeof(heap_trace_record_t) + 1023) / 1024);
  ESP_LOGW(TAG,
           "heap_trace STARTED ok: mode=HEAP_TRACE_LEAKS records=%u (~%u KB in %s) "
           "stack_depth=%d — Dump task stats prints INTERNAL top sites via logger",
           (unsigned) kHeapTraceRecords, buf_kb, buf_where, CONFIG_HEAP_TRACING_STACK_DEPTH);
}
#endif

LV6Dashboard::~LV6Dashboard() {
  if (this->json_buf_ != nullptr) {
    free(this->json_buf_);
    this->json_buf_ = nullptr;
  }
}

void LV6Dashboard::setup() {
#if defined(CONFIG_HEAP_TRACING_STANDALONE) || defined(CONFIG_HEAP_TRACING)
  // Fallback if on_boot priority 900 did not run (or package omitted init).
  start_heap_tracing_early();
#endif

  if (this->base_ == nullptr) {
    ESP_LOGE(TAG, "web_server_base is null; dashboard handler not registered");
    return;
  }

  this->json_buf_ = static_cast<char *>(alloc_scratch(JSON_BUF_SIZE));
  if (this->json_buf_ == nullptr) {
    ESP_LOGE(TAG, "Failed to allocate %u-byte JSON buffer (SPIRAM/INTERNAL); JSON API disabled",
             static_cast<unsigned>(JSON_BUF_SIZE));
    this->mark_failed();
    return;
  }
  ESP_LOGI(TAG, "JSON buffer: %u bytes in PSRAM/INTERNAL", static_cast<unsigned>(JSON_BUF_SIZE));

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
  ESP_LOGI(TAG, "Dashboard endpoints registered: /, /en/, /da/, /lune-ui.css, /binder.js");
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

void LV6Dashboard::dump_heap_cap_(const char *label, uint32_t caps) const {
  multi_heap_info_t info{};
  heap_caps_get_info(&info, caps);
  ESP_LOGI(TAG,
           "heap[%s]: free=%uB alloc=%uB largest_free=%uB min_free=%uB "
           "free_blocks=%u alloc_blocks=%u total_blocks=%u",
           label, (unsigned) info.total_free_bytes, (unsigned) info.total_allocated_bytes,
           (unsigned) info.largest_free_block, (unsigned) info.minimum_free_bytes,
           (unsigned) info.free_blocks, (unsigned) info.allocated_blocks,
           (unsigned) info.total_blocks);
  // ESP-IDF walks each heap region and prints free/used ranges — the tool for
  // seeing *which* banks are empty vs fragmented (not which call site owns bytes).
  heap_caps_print_heap_info(caps);
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

  ESP_LOGI(TAG,
           "--- task stats: %u tasks | core0=%.0f%% core1=%.0f%% | "
           "heap int=%uKB dma=%uKB largest_int=%uKB min_int=%uKB psram=%uKB largest_psram=%uKB ---",
           (unsigned) got, cpu0_pct_, cpu1_pct_,
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_INTERNAL) / 1024),
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_DMA) / 1024),
           (unsigned) (heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL) / 1024),
           (unsigned) (heap_caps_get_minimum_free_size(MALLOC_CAP_INTERNAL) / 1024),
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_SPIRAM) / 1024),
           (unsigned) (heap_caps_get_largest_free_block(MALLOC_CAP_SPIRAM) / 1024));
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

  ESP_LOGI(TAG, "--- heap caps (INTERNAL / DMA / SPIRAM) ---");
  this->dump_heap_cap_("INTERNAL", MALLOC_CAP_INTERNAL);
  this->dump_heap_cap_("DMA", MALLOC_CAP_DMA);
  this->dump_heap_cap_("SPIRAM", MALLOC_CAP_SPIRAM);
#if defined(CONFIG_HEAP_TRACING_STANDALONE) || defined(CONFIG_HEAP_TRACING)
  // Opt-in debug builds only (packages/debug/heap-tracing.yaml). Do NOT call
  // heap_trace_dump() here — it uses esp_rom_printf and never reaches the
  // ESPHome logger / dashboard Logs view.
  ESP_LOGI(TAG, "--- heap_trace INTERNAL sites (CONFIG_HEAP_TRACING*) ---");
  dump_heap_trace_via_logger_();
#endif
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

static constexpr const char V1_PREFIX[] = "/api/v1";
static constexpr size_t V1_PREFIX_LEN = sizeof(V1_PREFIX) - 1;

bool LV6Dashboard::canHandle(AsyncWebServerRequest *request) const {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);
  if (url == "/" || url == "/dashboard" || url == "/dashboard/" || is_dashboard_js_url(url.c_str()) ||
      is_ui_css_url(url.c_str()) || is_lang_html_url(url.c_str(), "en") ||
      is_lang_html_url(url.c_str(), "da"))
    return true;
  return strncmp(url.c_str(), V1_PREFIX, V1_PREFIX_LEN) == 0 && url.c_str()[V1_PREFIX_LEN] == '/';
}

void LV6Dashboard::handleBody(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index,
                              size_t total) {
  if (index == 0) {
    this->post_body_.clear();
    if (total > 0 && total <= POST_BODY_MAX)
      this->post_body_.reserve(total);
  }
  if (data == nullptr || len == 0)
    return;
  if (this->post_body_.size() + len > POST_BODY_MAX) {
    this->post_body_.clear();
    return;
  }
  this->post_body_.append(reinterpret_cast<const char *>(data), len);
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
  if (is_lang_html_url(url.c_str(), "en")) {
    this->handle_ui_html_(request, "en", true);
    return;
  }
  if (is_lang_html_url(url.c_str(), "da")) {
    this->handle_ui_html_(request, "da", true);
    return;
  }
  if (is_ui_css_url(url.c_str())) {
    this->handle_ui_css_(request);
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
  this->handle_ui_html_(request, pick_ui_lang(request), false);
}

void LV6Dashboard::handle_ui_html_(AsyncWebServerRequest *request, const char *lang, bool set_cookie) {
  httpd_req_t *req = *request;
  static char cookie_hdr[48];
  if (set_cookie && lang != nullptr) {
    snprintf(cookie_hdr, sizeof(cookie_hdr), "lune_lang=%s; Path=/; Max-Age=31536000", lang);
    httpd_resp_set_hdr(req, "Set-Cookie", cookie_hdr);
  }
#if defined(LV6_HAS_UI_HTML_DA) || defined(LV6_HAS_UI_HTML_EN)
  const bool want_da = lang != nullptr && strncmp(lang, "da", 2) == 0;
#ifdef LV6_HAS_UI_HTML_DA
  if (want_da) {
    send_gzip_chunked_(request, "text/html; charset=utf-8", LV6_UI_HTML_DA_DATA, LV6_UI_HTML_DA_SIZE,
                       "no-store, no-cache, max-age=0, must-revalidate");
    return;
  }
#endif
#ifdef LV6_HAS_UI_HTML_EN
  send_gzip_chunked_(request, "text/html; charset=utf-8", LV6_UI_HTML_EN_DATA, LV6_UI_HTML_EN_SIZE,
                     "no-store, no-cache, max-age=0, must-revalidate");
  return;
#endif
#endif
  send_text_(request, 200, "text/html; charset=utf-8", DASHBOARD_HTML_FALLBACK, false,
             "no-store, no-cache, max-age=0, must-revalidate");
}

void LV6Dashboard::handle_ui_css_(AsyncWebServerRequest *request) {
#ifdef LV6_HAS_UI_CSS
  send_gzip_chunked_(request, "text/css; charset=utf-8", LV6_UI_CSS_DATA, LV6_UI_CSS_SIZE,
                     "no-store, no-cache, max-age=0, must-revalidate");
#else
  send_text_(request, 404, "text/plain", "lune-ui.css not configured. Run make dashboard-build.");
#endif
}

void LV6Dashboard::handle_js_(AsyncWebServerRequest *request) {
#ifdef LV6_HAS_DASHBOARD_JS
  send_gzip_chunked_(request, "application/javascript; charset=utf-8",
                     LV6_DASHBOARD_JS_DATA, LV6_DASHBOARD_JS_SIZE,
                     "no-store, no-cache, max-age=0, must-revalidate");
#else
  send_text_(request, 404, "text/plain",
             "binder.js not configured. Add binder_js: ../web/ui/binder.js to lv6_dashboard.");
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

  // Flush the current chunk and retry when a field does not fit — never
  // truncate mid-token (that shipped a NUL and broke JSON.parse on the binder).
  auto append = [&](const char *fmt, ...) -> bool {
    va_list args;
    va_start(args, fmt);
    va_list copy;
    va_copy(copy, args);
    bool ok = appendfv(buf, BUF_SIZE, offset, fmt, copy);
    va_end(copy);
    if (!ok) {
      if (!flush()) {
        va_end(args);
        return false;
      }
      ok = appendfv(buf, BUF_SIZE, offset, fmt, args);
    }
    va_end(args);
    return ok;
  };

  char num_buf[24];

  if (!append("{")) return;

  // --- uptime & wifi ---
  char wifi_buf[24] = "null";
  if (std::isfinite(snap->wifi_dbm)) {
    snprintf(wifi_buf, sizeof(wifi_buf), "%ld", static_cast<long>(std::lround(snap->wifi_dbm)));
  }
  if (!append(
      "\"sensor-uptime\":{\"value\":%lu},"
      "\"sensor-wifi_signal\":{\"value\":%s},",
      static_cast<unsigned long>(snap->uptime_s), wifi_buf)) return;

  // --- system diagnostics: per-core CPU load + free heap + BLE scan liveness ---
  format_float_token(num_buf, sizeof(num_buf), snap->cpu0_pct, 1);
  if (!append( "\"sensor-cpu_load_core0\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->cpu1_pct, 1);
  if (!append(
      "\"sensor-cpu_load_core1\":{\"value\":%s},"
      "\"sensor-free_internal_kb\":{\"value\":%lu},"
      "\"sensor-free_dma_kb\":{\"value\":%lu},"
      "\"sensor-largest_internal_kb\":{\"value\":%lu},"
      "\"sensor-min_internal_kb\":{\"value\":%lu},"
      "\"sensor-free_psram_kb\":{\"value\":%lu},"
      "\"sensor-largest_psram_kb\":{\"value\":%lu},",
      num_buf,
      static_cast<unsigned long>(snap->free_internal_kb),
      static_cast<unsigned long>(snap->free_dma_kb),
      static_cast<unsigned long>(snap->largest_internal_kb),
      static_cast<unsigned long>(snap->min_internal_kb),
      static_cast<unsigned long>(snap->free_psram_kb),
      static_cast<unsigned long>(snap->largest_psram_kb))) return;
  char ble_ads_buf[24];
  format_float_token(ble_ads_buf, sizeof(ble_ads_buf), snap->ble_ads_per_sec, 2);
  if (!append(
      "\"binary_sensor-ble_hub_enabled\":{\"state\":\"%s\"},"
      "\"binary_sensor-ble_scanning\":{\"state\":\"%s\"},"
      "\"binary_sensor-ble_demanded\":{\"state\":\"%s\"},"
      "\"sensor-ble_ads_per_sec\":{\"value\":%s},"
      "\"sensor-ble_last_adv_age_ms\":{\"value\":%lu},",
      snap->ble_hub_enabled ? "on" : "off",
      snap->ble_scanning ? "on" : "off",
      snap->ble_demanded ? "on" : "off",
      ble_ads_buf,
      static_cast<unsigned long>(snap->ble_last_adv_age_ms == UINT32_MAX ? 0
                                                                        : snap->ble_last_adv_age_ms))) return;

  // --- manifold temps ---
  format_float_token(num_buf, sizeof(num_buf), snap->manifold_flow_c);
  if (!append( "\"sensor-manifold_flow_temperature\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->manifold_return_c);
  if (!append( "\"sensor-manifold_return_temperature\":{\"value\":%s},", num_buf)) return;

  // --- zone temperatures ---
  static const char *const ZONE_TEMP_KEYS[6] = {
    "sensor-zone_1_temperature", "sensor-zone_2_temperature", "sensor-zone_3_temperature",
    "sensor-zone_4_temperature", "sensor-zone_5_temperature", "sensor-zone_6_temperature",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_temp_c[i]);
    if (!append( "\"%s\":{\"value\":%s},", ZONE_TEMP_KEYS[i], num_buf)) return;
  }

  // --- zone valve positions (0 decimals) ---
  static const char *const ZONE_VALVE_KEYS[6] = {
    "sensor-zone_1_valve_pct", "sensor-zone_2_valve_pct", "sensor-zone_3_valve_pct",
    "sensor-zone_4_valve_pct", "sensor-zone_5_valve_pct", "sensor-zone_6_valve_pct",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_valve_pct[i], 0);
    if (!append( "\"%s\":{\"value\":%s},", ZONE_VALVE_KEYS[i], num_buf)) return;
  }

  // --- preheat advance ---
  static const char *const PREHEAT_KEYS[6] = {
    "sensor-zone_1_preheat_advance_c", "sensor-zone_2_preheat_advance_c", "sensor-zone_3_preheat_advance_c",
    "sensor-zone_4_preheat_advance_c", "sensor-zone_5_preheat_advance_c", "sensor-zone_6_preheat_advance_c",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_preheat_c[i]);
    if (!append( "\"%s\":{\"value\":%s},", PREHEAT_KEYS[i], num_buf)) return;
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
    if (!append( "\"%s\":{\"value\":%s},", OPEN_RIPPLE_KEYS[i], num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), snap->motor_close_ripple[i], 0);
    if (!append( "\"%s\":{\"value\":%s},", CLOSE_RIPPLE_KEYS[i], num_buf)) return;
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
    if (!append( "\"%s\":{\"value\":%s},", OPEN_FACTOR_KEYS[i], num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), snap->motor_close_factor[i], 2);
    if (!append( "\"%s\":{\"value\":%s},", CLOSE_FACTOR_KEYS[i], num_buf)) return;
  }

  // flush: working-range telemetry would overflow with factors
  if (!flush()) return;

  // --- working-range learning (live from valve telemetry) ---
  static const char *const WORKING_RIPPLE_KEYS[6] = {
    "sensor-motor_1_working_ripples", "sensor-motor_2_working_ripples", "sensor-motor_3_working_ripples",
    "sensor-motor_4_working_ripples", "sensor-motor_5_working_ripples", "sensor-motor_6_working_ripples",
  };
  static const char *const PIN_FREE_KEYS[6] = {
    "sensor-motor_1_pin_free_ripples", "sensor-motor_2_pin_free_ripples", "sensor-motor_3_pin_free_ripples",
    "sensor-motor_4_pin_free_ripples", "sensor-motor_5_pin_free_ripples", "sensor-motor_6_pin_free_ripples",
  };
  static const char *const STROKE_MODEL_KEYS[6] = {
    "text_sensor-motor_1_stroke_model", "text_sensor-motor_2_stroke_model", "text_sensor-motor_3_stroke_model",
    "text_sensor-motor_4_stroke_model", "text_sensor-motor_5_stroke_model", "text_sensor-motor_6_stroke_model",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->motor_working_ripple[i], 0);
    if (!append( "\"%s\":{\"value\":%s},", WORKING_RIPPLE_KEYS[i], num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), snap->motor_pin_free_ripple[i], 0);
    if (!append( "\"%s\":{\"value\":%s},", PIN_FREE_KEYS[i], num_buf)) return;
    const char *model = snap->motor_stroke_model[i] == static_cast<uint8_t>(lv6::StrokeModel::WORKING_RANGE)
                            ? "working_range"
                            : "full_stroke";
    if (!append( "\"%s\":{\"state\":\"%s\"},", STROKE_MODEL_KEYS[i], model)) return;
  }

  // flush: learning progress would overflow with stroke model
  if (!flush()) return;

  static const char *const LEARN_PCT_KEYS[6] = {
    "sensor-motor_1_learn_pct", "sensor-motor_2_learn_pct", "sensor-motor_3_learn_pct",
    "sensor-motor_4_learn_pct", "sensor-motor_5_learn_pct", "sensor-motor_6_learn_pct",
  };
  static const char *const LEARN_PHASE_KEYS[6] = {
    "text_sensor-motor_1_learn_phase", "text_sensor-motor_2_learn_phase", "text_sensor-motor_3_learn_phase",
    "text_sensor-motor_4_learn_phase", "text_sensor-motor_5_learn_phase", "text_sensor-motor_6_learn_phase",
  };
  static const char *const LEARN_SAMPLE_KEYS[6] = {
    "sensor-motor_1_learn_sample", "sensor-motor_2_learn_sample", "sensor-motor_3_learn_sample",
    "sensor-motor_4_learn_sample", "sensor-motor_5_learn_sample", "sensor-motor_6_learn_sample",
  };
  static const char *const LEARN_NEED_KEYS[6] = {
    "sensor-motor_1_learn_samples_needed", "sensor-motor_2_learn_samples_needed",
    "sensor-motor_3_learn_samples_needed", "sensor-motor_4_learn_samples_needed",
    "sensor-motor_5_learn_samples_needed", "sensor-motor_6_learn_samples_needed",
  };
  static const char *const LEARN_PHASE_NAME[] = {
    "", "home", "open", "close", "done", "failed",
  };
  for (uint8_t i = 0; i < 6; i++) {
    if (!append( "\"%s\":{\"value\":%u},", LEARN_PCT_KEYS[i],
            static_cast<unsigned>(snap->motor_learn_pct[i]))) return;
    const uint8_t ph = snap->motor_learn_phase[i];
    const char *phase =
        ph < (sizeof(LEARN_PHASE_NAME) / sizeof(LEARN_PHASE_NAME[0])) ? LEARN_PHASE_NAME[ph] : "";
    if (!append( "\"%s\":{\"state\":\"%s\"},", LEARN_PHASE_KEYS[i], phase)) return;
    if (!append( "\"%s\":{\"value\":%u},", LEARN_SAMPLE_KEYS[i],
            static_cast<unsigned>(snap->motor_learn_sample[i]))) return;
    if (!append( "\"%s\":{\"value\":%u},", LEARN_NEED_KEYS[i],
            static_cast<unsigned>(snap->motor_learn_samples_needed[i]))) return;
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
    if (!append( "\"%s\":{\"value\":%s},", PROBE_TEMP_KEYS[i], num_buf)) return;
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

  if (!append( "\"text_sensor-firmware_version\":{\"state\":\"%s\"},", snap->firmware_version)) return;
  if (!append( "\"text_sensor-ip_address\":{\"state\":\"%s\"},", snap->ip_address)) return;
  if (!append( "\"text_sensor-connected_ssid\":{\"state\":\"%s\"},", snap->connected_ssid)) return;
  if (!append( "\"text_sensor-mac_address\":{\"state\":\"%s\"},", snap->mac_address)) return;
  if (!append( "\"text_sensor-reset_reason\":{\"state\":\"%s\"},", snap->reset_reason)) return;
  if (!append( "\"text-device_variant\":{\"state\":\"Lune V6\"},")) return;
  if (!append( "\"text-esphome_version\":{\"state\":\"%s\"},", ESPHOME_VERSION)) return;
  {
    char name_esc[2 * sizeof(snap->system.display_name)];
    char place_esc[2 * sizeof(snap->system.location)];
    json_escape_cstr(device_display_name_cstr(snap->system), name_esc, sizeof(name_esc));
    json_escape_cstr(snap->system.location, place_esc, sizeof(place_esc));
    if (!append( "\"text-device_display_name\":{\"state\":\"%s\"},", name_esc)) return;
    if (!append( "\"text-device_location\":{\"state\":\"%s\"},", place_esc)) return;
  }
  if (!append(
          "\"firmware_update\":{\"current\":\"%s\",\"latest\":\"%s\",\"available\":%s,\"status\":\"%s\"},",
          snap->firmware_update_current, snap->firmware_update_latest,
          snap->firmware_update_available ? "true" : "false", snap->firmware_update_status)) return;

  for (uint8_t i = 0; i < 6; i++) {
    if (!append( "\"%s\":{\"state\":\"%s\"},", ZONE_STATE_KEYS[i], snap->zone_state[i])) return;
  }
  for (uint8_t i = 0; i < 6; i++) {
    if (!append( "\"%s\":{\"state\":\"%s\"},", MOTOR_FAULT_KEYS[i], snap->motor_fault[i])) return;
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

    if (!append(
        "\"switch-zone_%u_enabled\":{\"state\":\"%s\"},"
        "\"number-zone_%u_setpoint\":{\"value\":",
        zn, z.enabled ? "on" : "off", zn)) return;
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    if (!append( "%s},", num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    if (!append( "\"number-zone_%u_base_setpoint\":{\"value\":%s},", zn, num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    if (!append( "\"number-zone_%u_effective_setpoint\":{\"value\":%s},", zn, num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), this->coordinator_command_offsets_c_[i], 2);
    if (!append( "\"number-zone_%u_coordinator_offset\":{\"value\":%s},", zn, num_buf)) return;
    const uint32_t remaining_s = this->coordinator_command_expires_at_ms_[i] > millis()
        ? (this->coordinator_command_expires_at_ms_[i] - millis()) / 1000UL : 0UL;
    if (!append( "\"sensor-zone_%u_coordinator_remaining_s\":{\"value\":%lu},", zn, static_cast<unsigned long>(remaining_s))) return;

    format_float_token(num_buf, sizeof(num_buf), z.area_m2, 1);
    if (!append( "\"number-zone_%u_area_m2\":{\"value\":%s},", zn, num_buf)) return;

    format_float_token(num_buf, sizeof(num_buf), z.pipe_spacing_mm, 0);
    if (!append( "\"number-zone_%u_pipe_spacing_mm\":{\"value\":%s},", zn, num_buf)) return;

    const int8_t probe_idx = snap->probes.zone_return_probe[i];
    if (probe_idx >= 0 && probe_idx < static_cast<int8_t>(lv6::MAX_PROBES)) {
      if (!append(
          "\"select-zone_%u_probe\":{\"state\":\"Probe %d\"},",
          zn, static_cast<int>(probe_idx) + 1)) return;
    } else {
      if (!append( "\"select-zone_%u_probe\":{\"state\":\"None\"},", zn)) return;
    }

    const char *src_str = temp_source_to_dashboard_str(snap->zone_temp_source[i]);
    if (!append(
        "\"select-zone_%u_temp_source\":{\"state\":\"%s\"},", zn, src_str)) return;

    if (z.sync_to_zone >= 0 && z.sync_to_zone < static_cast<int8_t>(lv6::NUM_ZONES)) {
      if (!append(
          "\"select-zone_%u_sync_to\":{\"state\":\"Zone %d\"},",
          zn, static_cast<int>(z.sync_to_zone) + 1)) return;
    } else {
      if (!append( "\"select-zone_%u_sync_to\":{\"state\":\"None\"},", zn)) return;
    }

    const uint8_t pt_idx = static_cast<uint8_t>(z.pipe_type);
    const char *pt_str = (pt_idx < 8) ? PIPE_TYPE_STR[pt_idx] : "Unknown";
    if (!append( "\"select-zone_%u_pipe_type\":{\"state\":\"%s\"},", zn, pt_str)) return;

    char age_ent[16];
    if (snap->zone_external_temp_age_ms[i] == UINT32_MAX)
      snprintf(age_ent, sizeof(age_ent), "null");
    else
      snprintf(age_ent, sizeof(age_ent), "%lu",
               static_cast<unsigned long>(snap->zone_external_temp_age_ms[i]));
    if (!append(
        "\"text-zone_%u_ble_mac\":{\"state\":\"%s\"},"
        "\"text-zone_%u_sensor_id\":{\"state\":\"%s\"},"
        "\"text-zone_%u_sensor_name\":{\"state\":\"%s\"},"
        "\"sensor-zone_%u_external_temp_age_ms\":{\"value\":%s},",
        zn, snap->zone_ble_mac[i], zn, snap->zone_sensor_id[i], zn, snap->zone_sensor_name[i],
        zn, age_ent)) return;

    // Friendly zone name — JSON-escape quotes/backslashes/control chars.
    char name_esc[2 * sizeof(z.name)];
    size_t nesc = 0;
    for (size_t j = 0; z.name[j] != '\0' && nesc < sizeof(name_esc) - 2; j++) {
      char c = z.name[j];
      if (c == '"' || c == '\\') name_esc[nesc++] = '\\';
      name_esc[nesc++] = (c >= 0x20) ? c : ' ';
    }
    name_esc[nesc] = '\0';
    if (!append(
        "\"text-zone_%u_name\":{\"state\":\"%s\"},", zn, name_esc)) return;

    // flush after each zone to stay within buffer
    if (!flush()) return;
  }

  // --- global config ---
  if (!append(
      "\"switch-motor_drivers_enabled\":{\"state\":\"%s\"},",
      snap->drivers_enabled ? "on" : "off")) return;

  if (!append(
      "\"switch-simple_preheat_enabled\":{\"state\":\"%s\"},",
      snap->simple_preheat_enabled ? "on" : "off")) return;

  format_float_token(num_buf, sizeof(num_buf), snap->preheat_absorb_band_c, 1);
  if (!append(
      "\"switch-preheat_absorb_enabled\":{\"state\":\"%s\"},"
      "\"text-preheat_absorbing\":{\"state\":\"%s\"},"
      "\"text-preheat_absorb_reason\":{\"state\":\"%s\"},"
      "\"text-preheat_absorb_end_reason\":{\"state\":\"%s\"},"
      "\"number-preheat_absorb_band_c\":{\"value\":%s},",
      snap->preheat_absorb_enabled ? "on" : "off",
      snap->absorb_mode == 2 ? "armed" : (snap->absorb_mode == 1 ? "reactive" : "idle"),
      snap->absorb_reason,
      snap->absorb_end_reason,
      num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->preheat_detect_delta_c, 1);
  if (!append( "\"number-preheat_detect_delta_c\":{\"value\":%s},", num_buf)) return;

  if (!append(
      "\"select-heating_mode\":{\"state\":\"%s\"},"
      "\"text-effective_heating_mode\":{\"state\":\"%s\"},"
      "\"text-heating_mode_source\":{\"state\":\"%s\"},"
      "\"text-heat_demand_recommendation\":{\"state\":\"%s\"},",
      lv6::heating_profile_to_string(snap->heating_mode),
      lv6::heating_profile_to_string(snap->effective_heating_mode),
      snap->heating_mode_from_touch ? "touch" : "local",
      lv6::heat_demand_recommendation_to_string(snap->heat_demand.recommendation))) return;
  format_float_token(num_buf, sizeof(num_buf), snap->hp_overheat_margin_c, 1);
  if (!append( "\"number-hp_overheat_margin_c\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->hp_base_pct, 0);
  if (!append( "\"number-hp_base_pct\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->hp_trim_floor_pct, 0);
  if (!append( "\"number-hp_trim_floor_pct\":{\"value\":%s},", num_buf)) return;
  if (snap->heat_demand.critical_zone >= 0)
    if (!append( "\"sensor-heat_demand_critical_zone\":{\"value\":%d},",
            snap->heat_demand.critical_zone + 1)) return;
  if (!append( "\"sensor-heat_demand_saturated_s\":{\"value\":%lu},",
          static_cast<unsigned long>(snap->heat_demand.saturated_s))) return;

  {
    const char *bal_mode = "static";
    switch (snap->balancing.mode) {
      case lv6::BalanceMode::ADAPTIVE: bal_mode = "adaptive"; break;
      case lv6::BalanceMode::RETURN_TEMP: bal_mode = "return_temp"; break;
      default: bal_mode = "static"; break;
    }
    if (!append( "\"select-balancing_mode\":{\"state\":\"%s\"},", bal_mode)) return;
  }
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    const uint8_t zn = i + 1;
    format_float_token(num_buf, sizeof(num_buf), snap->zone_static_factor[i], 2);
    if (!append( "\"sensor-zone_%u_balance_prior\":{\"value\":%s},", zn, num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), snap->zone_balance_adapt[i], 2);
    if (!append( "\"sensor-zone_%u_balance_learned\":{\"value\":%s},", zn, num_buf)) return;
    format_float_token(num_buf, sizeof(num_buf), snap->zone_hydraulic_factor[i], 2);
    if (!append( "\"sensor-zone_%u_balance_effective\":{\"value\":%s},", zn, num_buf)) return;
  }

  if (!append(
      "\"select-manifold_type\":{\"state\":\"%s\"},"
      "\"select-manifold_flow_probe\":{\"state\":\"Probe %d\"},"
      "\"select-manifold_return_probe\":{\"state\":\"Probe %d\"},",
      snap->manifold_type == lv6::ManifoldType::NC ? "NC (Normally Closed)" : "NO (Normally Open)",
      static_cast<int>(snap->probes.manifold_flow_probe) + 1,
      static_cast<int>(snap->probes.manifold_return_probe) + 1)) return;

  const uint8_t mp_idx = static_cast<uint8_t>(snap->motor.default_profile);
  const char *mp_str = (mp_idx < 3) ? MOTOR_PROFILE_STR[mp_idx] : "Generic";
  if (!append( "\"select-motor_profile_default\":{\"state\":\"%s\"},", mp_str)) return;

  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_current_factor, 2);
  if (!append( "\"number-close_threshold_multiplier\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_slope_threshold_ma_per_s, 2);
  if (!append( "\"number-close_slope_threshold\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_slope_current_factor, 2);
  if (!append( "\"number-close_slope_current_factor\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_current_factor, 2);
  if (!append( "\"number-open_threshold_multiplier\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_slope_threshold_ma_per_s, 2);
  if (!append( "\"number-open_slope_threshold\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_slope_current_factor, 2);
  if (!append( "\"number-open_slope_current_factor\":{\"value\":%s},", num_buf)) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_ripple_limit_factor, 2);
  if (!append( "\"number-open_ripple_limit_factor\":{\"value\":%s},", num_buf)) return;
  if (!append(
      "\"number-generic_runtime_limit_seconds\":{\"value\":%lu},"
      "\"number-hmip_runtime_limit_seconds\":{\"value\":%lu},"
      "\"number-relearn_after_movements\":{\"value\":%lu},"
      "\"number-relearn_after_hours\":{\"value\":%lu},"
      "\"number-learned_factor_min_samples\":{\"value\":%u},",
      static_cast<unsigned long>(snap->motor.generic_profile_runtime_limit_s),
      static_cast<unsigned long>(snap->motor.hmip_vdmot_runtime_limit_s),
      static_cast<unsigned long>(snap->motor.relearn_after_movements),
      static_cast<unsigned long>(snap->motor.relearn_after_hours),
      static_cast<unsigned>(snap->motor.learned_factor_min_samples))) return;
  format_float_token(num_buf, sizeof(num_buf), snap->motor.learned_factor_max_deviation_pct * 100.0f, 2);
  if (!append(
      "\"number-learned_factor_max_deviation_pct\":{\"value\":%s},", num_buf)) return;

  // Rev 3.2/3.3 endstop policy: the fields detect_endstop_() and the DMA cap
  // ladder actually read on the GPIO-bridge backends.
  if (!flush()) return;
  struct MotorNum { const char *key; float value; int decimals; };
  const MotorNum rev3x_motor[] = {
      {"open_endstop_current_factor", snap->motor.open_endstop_current_factor, 2},
      {"open_endstop_stall_fraction", snap->motor.open_endstop_stall_fraction, 2},
      {"close_trailing_step_ma", snap->motor.close_trailing_step_ma, 2},
      {"close_trailing_sustain_ms", static_cast<float>(snap->motor.close_trailing_sustain_ms), 0},
      {"close_trailing_ref_ms", static_cast<float>(snap->motor.close_trailing_ref_ms), 0},
      {"cap_close_seat_ma", snap->motor.cap_close_seat_ma, 1},
      {"cap_close_seat_frames", static_cast<float>(snap->motor.cap_close_seat_frames), 0},
      {"cap_close_popoff_ma", snap->motor.cap_close_popoff_ma, 1},
      {"cap_stall_ma", snap->motor.cap_stall_ma, 1},
      {"cap_open_stop_ma", snap->motor.cap_open_stop_ma, 1},
      {"cap_circuit_fault_ma", snap->motor.cap_circuit_fault_ma, 1},
      {"close_runtime_limit_counts", static_cast<float>(snap->motor.close_runtime_limit_counts), 0},
      // Working-range learning (stroke_learning.h) and the pin detector it uses.
      {"working_range_learning", snap->motor.working_range_learning ? 1.0f : 0.0f, 0},
      {"learn_open_start_ripples", static_cast<float>(snap->motor.learn_open_start_ripples), 0},
      {"learn_open_step_ripples", static_cast<float>(snap->motor.learn_open_step_ripples), 0},
      {"learn_open_max_ripples", static_cast<float>(snap->motor.learn_open_max_ripples), 0},
      {"learn_min_free_ripples", static_cast<float>(snap->motor.learn_min_free_ripples), 0},
      {"learn_samples", static_cast<float>(snap->motor.learn_samples), 0},
      {"learn_max_spread_pct", static_cast<float>(snap->motor.learn_max_spread_pct), 0},
      {"pin_engage_step_ma", snap->motor.pin_engage_step_ma, 2},
      {"pin_engage_margin_ripples", static_cast<float>(snap->motor.pin_engage_margin_ripples), 0},
  };
  for (const auto &n : rev3x_motor) {
    format_float_token(num_buf, sizeof(num_buf), n.value, n.decimals);
    if (!append( "\"number-%s\":{\"value\":%s},", n.key, num_buf)) return;
  }

  // flush before authority/flow section
  if (!flush()) return;

  // --- Touch authority + local secondary-flow commissioning ---
  if (!append(
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
      static_cast<unsigned long>(snap->authority_lease_remaining_s))) return;
  format_float_token(num_buf, sizeof(num_buf), snap->min_zone_flow_pct, 1);
  if (!append(
      "\"switch-minimum_flow_always\":{\"state\":\"%s\"},"
      "\"number-min_zone_flow_pct\":{\"value\":%s},",
      snap->minimum_flow_always ? "on" : "off",
      num_buf)) return;
  if (!append(
      "\"switch-ble_clock_sync_enabled\":{\"state\":\"%s\"},"
      "\"number-ble_clock_sync_interval_min\":{\"value\":%u},"
      "\"sensor-ble_clock_sync_last_ok_s\":{\"value\":%lu},"
      "\"text-ble_clock_sync_last_error\":{\"state\":\"%s\"},"
      "\"binary_sensor-ble_clock_sync_advertising\":{\"state\":\"%s\"},",
      snap->ble_clock_sync_enabled ? "on" : "off",
      static_cast<unsigned>(snap->ble_clock_sync_interval_min),
      static_cast<unsigned long>(snap->ble_clock_sync_last_ok_s),
      snap->ble_clock_sync_last_error,
      snap->ble_clock_sync_advertising ? "on" : "off")) return;
  // Sentinel field closes the JSON object and absorbs any trailing comma.
  if (!append( "\"_\":{}}")) return;
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

  char flow[24], ret[24], demand[24], wifi[24], ble_ads_status[24];
  format_float_token(flow, sizeof(flow), snap->manifold_flow_c, 1);
  format_float_token(ret, sizeof(ret), snap->manifold_return_c, 1);
  format_float_token(demand, sizeof(demand), valve_count ? valve_sum / valve_count : NAN, 0);
  format_float_token(wifi, sizeof(wifi), snap->wifi_dbm, 0);
  format_float_token(ble_ads_status, sizeof(ble_ads_status), snap->ble_ads_per_sec, 2);
  char pairing_fingerprint[24];
  format_pairing_fingerprint(snap->mac_address, pairing_fingerprint, sizeof(pairing_fingerprint));

  char critical_zone_tok[8];
  if (snap->heat_demand.critical_zone >= 0)
    snprintf(critical_zone_tok, sizeof(critical_zone_tok), "%d",
             snap->heat_demand.critical_zone + 1);
  else
    snprintf(critical_zone_tok, sizeof(critical_zone_tok), "null");

  const char *absorb_state =
      snap->absorb_mode == 2 ? "armed" : (snap->absorb_mode == 1 ? "reactive" : "idle");

  snprintf(this->json_buf_, JSON_BUF_SIZE,
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"node\":{\"model\":\"lune-v6\","
           "\"firmware\":\"%s\",\"ip\":\"%s\",\"ssid\":\"%s\",\"mac\":\"%s\","
           "\"pairing_fingerprint\":\"%s\",\"uptime_s\":%lu},"
           "\"pairing\":{\"method\":\"mac-fingerprint-v1\",\"fingerprint\":\"%s\"},"
           "\"coordination\":{\"installation_id\":\"%s\",\"coordinator_id\":\"%s\","
           "\"control_approved\":%s},"
           "\"control\":{\"mode\":\"%s\",\"effective_mode\":\"%s\",\"mode_source\":\"%s\","
           "\"heat_demand\":{\"recommendation\":\"%s\",\"critical_zone\":%s,"
           "\"critical_opening_ratio\":%.3f,\"saturated_s\":%lu,\"demanding_zones\":%u,"
           "\"headroom\":%s}},"
           "\"absorb\":{\"state\":\"%s\",\"reason\":\"%s\",\"end_reason\":\"%s\"},"
           "\"zones\":{\"count\":%u,\"enabled\":%u,\"active\":%u,\"open_valves\":%u},"
           "\"manifold\":{\"flow_c\":%s,\"flow_temp_c\":%s,\"return_c\":%s,\"mean_valve_pct\":%s},"
           "\"system\":{\"wifi_dbm\":%s,\"drivers_enabled\":%s,\"free_internal_kb\":%lu,"
           "\"free_dma_kb\":%lu,\"largest_internal_kb\":%lu,\"min_internal_kb\":%lu,"
           "\"free_psram_kb\":%lu,\"largest_psram_kb\":%lu,"
           "\"ble_enabled\":%s,\"ble_scanning\":%s,\"ble_demanded\":%s,"
           "\"ble_ads_per_sec\":%s,\"ble_last_adv_age_ms\":%lu},"
           "\"safety\":{\"local_authority\":true,\"commands_clamped\":true,"
           "\"minimum_flow_always\":%s},\"physics_contract\":1}}",
           snap->firmware_version, snap->ip_address, snap->connected_ssid, snap->mac_address,
           pairing_fingerprint, static_cast<unsigned long>(snap->uptime_s),
           pairing_fingerprint,
           snap->authority.installation_id, snap->authority.coordinator_id,
           snap->authority.installation_id[0] != '\0' &&
                   snap->authority.coordinator_id[0] != '\0' &&
                   snap->authority.shared_key[0] != '\0' ? "true" : "false",
           lv6::heating_profile_to_string(snap->heating_mode),
           lv6::heating_profile_to_string(snap->effective_heating_mode),
           snap->heating_mode_from_touch ? "touch" : "local",
           lv6::heat_demand_recommendation_to_string(snap->heat_demand.recommendation),
           critical_zone_tok, snap->heat_demand.critical_opening_ratio,
           static_cast<unsigned long>(snap->heat_demand.saturated_s),
           static_cast<unsigned>(snap->heat_demand.demanding_zones),
           snap->heat_demand.headroom ? "true" : "false",
           absorb_state, snap->absorb_reason, snap->absorb_end_reason,
           static_cast<unsigned>(lv6::NUM_ZONES), static_cast<unsigned>(enabled),
           static_cast<unsigned>(active), static_cast<unsigned>(active),
           flow, flow, ret, demand, wifi, snap->drivers_enabled ? "true" : "false",
           static_cast<unsigned long>(snap->free_internal_kb),
           static_cast<unsigned long>(snap->free_dma_kb),
           static_cast<unsigned long>(snap->largest_internal_kb),
           static_cast<unsigned long>(snap->min_internal_kb),
           static_cast<unsigned long>(snap->free_psram_kb),
           static_cast<unsigned long>(snap->largest_psram_kb),
           snap->ble_hub_enabled ? "true" : "false",
           snap->ble_scanning ? "true" : "false",
           snap->ble_demanded ? "true" : "false",
           ble_ads_status,
           static_cast<unsigned long>(snap->ble_last_adv_age_ms == UINT32_MAX
                                          ? 0
                                          : snap->ble_last_adv_age_ms),
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

  // Zone physics / groups write through config_store immediately, but the
  // periodic snapshot can lag by one tick. Overlay live zone config so
  // GET /zones reflects the latest provisioned floor fields right after POST.
  if (this->config_store_) {
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++)
      this->state_snap_buf_.zones[i] = this->config_store_->get_zone_config(i);
  }

  const DashboardSnapshot *snap = &this->state_snap_buf_;
  char *buf = this->json_buf_;
  size_t off = 0;

  // node_id: "lune-v6-" + last 6 hex digits of MAC (or controller_id fallback).
  char node_id[40] = "lune-v6";
  {
    char hex[13]{};
    size_t hi = 0;
    for (const char *p = snap->mac_address; *p && hi + 1 < sizeof(hex); ++p) {
      if ((*p >= '0' && *p <= '9') || (*p >= 'a' && *p <= 'f') || (*p >= 'A' && *p <= 'F'))
        hex[hi++] = static_cast<char>(tolower(static_cast<unsigned char>(*p)));
    }
    if (hi >= 6)
      snprintf(node_id, sizeof(node_id), "lune-v6-%s", hex + (hi - 6));
    else if (snap->system.controller_id[0])
      snprintf(node_id, sizeof(node_id), "%s", snap->system.controller_id);
  }

  // Resolve sync-group primaries for group_members / group_primary.
  int8_t sync_roots[lv6::NUM_ZONES];
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    int8_t root = static_cast<int8_t>(i);
    for (uint8_t guard = 0; guard < lv6::NUM_ZONES; guard++) {
      int8_t next = snap->zones[root].sync_to_zone;
      if (next < 0 || next >= static_cast<int8_t>(lv6::NUM_ZONES))
        break;
      if (next == static_cast<int8_t>(i)) {
        root = static_cast<int8_t>(i);
        break;
      }
      root = next;
    }
    sync_roots[i] = root;
  }

  appendf(buf, JSON_BUF_SIZE, off,
          "{\"ok\":true,\"version\":\"v1\",\"data\":{\"node_id\":\"%s\",\"count\":%u,\"zones\":[",
          node_id, static_cast<unsigned>(lv6::NUM_ZONES));
  for (uint8_t i = 0; i < lv6::NUM_ZONES && off + 1200 < JSON_BUF_SIZE; i++) {
    char temp[24], setpoint[24], valve[24], preload[24];
    format_float_token(temp, sizeof(temp), snap->zone_temp_c[i], 1);
    format_float_token(setpoint, sizeof(setpoint), snap->zones[i].setpoint_c, 1);
    format_float_token(valve, sizeof(valve), snap->zone_valve_pct[i], 0);
    format_float_token(preload, sizeof(preload), snap->zone_preheat_c[i], 1);
    char max_offset[24];
    format_float_token(max_offset, sizeof(max_offset), snap->zones[i].max_offset_c, 2);
    lv6::HousePhysicsConfig house{};
    if (this->config_store_)
      house = this->config_store_->get_house_physics();
    const auto th = lv6::thermal_model::estimate(snap->zones[i], house);
    char ua[24], mass[24], tau[24], return_c[24];
    char ua_prior[24], ua_learned[24], ua_eff[24], conf[24];
    char c_slab_m2[24], c_slab[24], c_zone[24], r_tok[24], headroom[24];
    format_float_token(ua, sizeof(ua), th.ua_effective_w_per_k, 1);
    format_float_token(mass, sizeof(mass), th.c_zone_kwh_per_k, 3);
    format_float_token(tau, sizeof(tau), th.tau_prior_h, 1);
    format_float_token(ua_prior, sizeof(ua_prior), th.ua_prior_w_per_k, 1);
    if (std::isfinite(snap->zones[i].ua_learned_w_per_k))
      format_float_token(ua_learned, sizeof(ua_learned), snap->zones[i].ua_learned_w_per_k, 1);
    else
      snprintf(ua_learned, sizeof(ua_learned), "null");
    format_float_token(ua_eff, sizeof(ua_eff), th.ua_effective_w_per_k, 1);
    if (std::isfinite(snap->zones[i].ua_learned_confidence))
      format_float_token(conf, sizeof(conf), snap->zones[i].ua_learned_confidence, 2);
    else
      snprintf(conf, sizeof(conf), "null");
    format_float_token(c_slab_m2, sizeof(c_slab_m2), th.c_slab_per_m2, 4);
    format_float_token(c_slab, sizeof(c_slab), th.c_slab_kwh_per_k, 3);
    format_float_token(c_zone, sizeof(c_zone), th.c_zone_kwh_per_k, 3);
    format_float_token(r_tok, sizeof(r_tok), th.r_m2k_per_w, 3);
    format_float_token(headroom, sizeof(headroom), th.absorb_headroom_k, 1);
    const int8_t zr = snap->probes.zone_return_probe[i];
    if (zr >= 0 && zr < static_cast<int8_t>(lv6::MAX_PROBES))
      format_float_token(return_c, sizeof(return_c), snap->probe_temp_c[zr], 1);
    else
      snprintf(return_c, sizeof(return_c), "null");
    char share[24], rank[16], opening_ratio[24];
    if (std::isfinite(snap->zone_loop_share_pct[i]))
      format_float_token(share, sizeof(share), snap->zone_loop_share_pct[i], 1);
    else
      snprintf(share, sizeof(share), "null");
    if (snap->zone_absorb_capacity_rank[i] > 0)
      snprintf(rank, sizeof(rank), "%u", static_cast<unsigned>(snap->zone_absorb_capacity_rank[i]));
    else
      snprintf(rank, sizeof(rank), "null");
    const float max_open = std::max(1.0f, snap->zones[i].max_opening_pct);
    format_float_token(opening_ratio, sizeof(opening_ratio), snap->zone_valve_pct[i] / max_open, 3);
    const char *absorb_state =
        snap->absorb_mode == 2 ? "armed" : (snap->absorb_mode == 1 ? "reactive" : "idle");
    const int8_t primary = sync_roots[i];
    lv6::GroupsConfig groups{};
    if (this->config_store_)
      groups = this->config_store_->get_groups();
    const lv6::GroupRole role = lv6::group_model::role_for_loop(groups, i);
    char group_id[lv6::GROUP_ID_LEN] = "";
    const int8_t gi = lv6::group_model::find_group_index(groups, i);
    if (gi >= 0)
      strncpy(group_id, groups.groups[gi].group_id, sizeof(group_id) - 1);
    else
      lv6::group_model::make_default_group_id(group_id, sizeof(group_id), i);

    appendf(buf, JSON_BUF_SIZE, off,
            "%s{\"zone\":%u,\"loop_id\":\"z%u\",\"name\":\"",
            i ? "," : "", static_cast<unsigned>(i + 1), static_cast<unsigned>(i + 1));
    append_json_escaped(buf, JSON_BUF_SIZE, off, snap->zones[i].name);
    appendf(buf, JSON_BUF_SIZE, off,
            "\",\"friendly_name\":\"");
    append_json_escaped(buf, JSON_BUF_SIZE, off, snap->zones[i].name);
    appendf(buf, JSON_BUF_SIZE, off,
            "\",\"enabled\":%s,\"temperature_c\":%s,\"setpoint_c\":%s,\"valve_pct\":%s,"
            "\"opening_ratio\":%s,\"preheat_c\":%s,\"state\":\"%s\",\"temp_source\":\"%s\","
            "\"fresh\":%s,\"group_primary\":%u,\"group_members\":[",
            snap->zones[i].enabled ? "true" : "false", temp, setpoint, valve, opening_ratio, preload,
            snap->zone_state[i], temp_source_to_dashboard_str(snap->zone_temp_source[i]),
            std::isfinite(snap->zone_temp_c[i]) ? "true" : "false",
            static_cast<unsigned>(primary + 1));
    bool first_member = true;
    for (uint8_t m = 0; m < lv6::NUM_ZONES; m++) {
      if (sync_roots[m] != primary)
        continue;
      appendf(buf, JSON_BUF_SIZE, off, "%s%u", first_member ? "" : ",", static_cast<unsigned>(m + 1));
      first_member = false;
    }
    char days_tok[16];
    if (std::isfinite(snap->zones[i].ua_learned_w_per_k))
      snprintf(days_tok, sizeof(days_tok), "%u",
               static_cast<unsigned>(snap->zones[i].ua_learned_observed_days));
    else
      snprintf(days_tok, sizeof(days_tok), "null");
    char thick_tok[24];
    if (snap->zones[i].active_thickness_cm > 0.0f)
      snprintf(thick_tok, sizeof(thick_tok), "%.1f", snap->zones[i].active_thickness_cm);
    else
      snprintf(thick_tok, sizeof(thick_tok), "null");
    char r_ov_tok[24];
    if (std::isfinite(snap->zones[i].r_override_m2k_per_w))
      snprintf(r_ov_tok, sizeof(r_ov_tok), "%.3f", snap->zones[i].r_override_m2k_per_w);
    else
      snprintf(r_ov_tok, sizeof(r_ov_tok), "null");
    appendf(buf, JSON_BUF_SIZE, off,
            "],\"area_m2\":%.1f,\"exterior_walls\":%u,"
            "\"floor\":{\"slab_type\":\"%s\",\"active_thickness_cm\":%s,\"covering\":\"%s\","
            "\"r_override_m2k_per_w\":%s,\"c_slab_per_m2\":%s,\"c_slab_kwh_per_k\":%s,"
            "\"c_zone_kwh_per_k\":%s,\"r_m2k_per_w\":%s,\"absorb_headroom_k\":%s,\"unset\":%s},"
            "\"ua_prior_w_per_k\":%s,\"ua_learned_w_per_k\":%s,\"ua_learned_confidence\":%s,"
            "\"ua_learned_observed_days\":%s,\"ua_source\":\"%s\",\"ua_weight_override\":%.2f,"
            "\"ua_effective_w_per_k\":%s,\"tau_prior_h\":%s,"
            "\"ua_w_per_k\":%s,\"thermal_mass_kwh_per_k\":%s,\"tau_h\":%s,"
            "\"return_c\":%s,\"loop_share_pct\":%s,\"absorb_state\":\"%s\","
            "\"absorb_capacity_rank\":%s,\"max_offset_c\":%s,"
            "\"group_id\":\"%s\",\"group_role\":\"%s\","
            "\"wind_exposure\":%.2f,\"solar_gain\":%.2f,\"warnings\":[",
            snap->zones[i].area_m2, static_cast<unsigned>(snap->zones[i].exterior_walls & 0x0F),
            lv6::slab_type_to_string(snap->zones[i].slab_type), thick_tok,
            lv6::covering_type_to_string(snap->zones[i].covering), r_ov_tok, c_slab_m2, c_slab,
            c_zone, r_tok, headroom, th.floor_unset ? "true" : "false", ua_prior, ua_learned, conf,
            days_tok, th.ua_source, snap->zones[i].ua_weight_override, ua_eff,
            th.plausible && std::isfinite(th.tau_prior_h) ? tau : "null",
            th.plausible ? ua : "null", th.plausible ? mass : "null",
            th.plausible && std::isfinite(th.tau_prior_h) ? tau : "null", return_c, share,
            absorb_state, rank, max_offset, group_id, lv6::group_role_to_string(role),
            snap->zones[i].wind_exposure, snap->zones[i].solar_gain);
    bool fw = true;
    if (th.thickness_ignored) {
      appendf(buf, JSON_BUF_SIZE, off, "%s\"thickness_ignored\"", fw ? "" : ",");
      fw = false;
    }
    if (th.high_floor_resistance) {
      appendf(buf, JSON_BUF_SIZE, off, "%s\"high_floor_resistance\"", fw ? "" : ",");
      fw = false;
    }
    appendf(buf, JSON_BUF_SIZE, off, "]}");
  }
  appendf(buf, JSON_BUF_SIZE, off, "]}}");
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
  char area[24], spacing[24], max_offset[24];
  char open_ripple[24], close_ripple[24], open_factor[24], close_factor[24];
  char working_ripple[24], pin_free[24];
  format_float_token(temp, sizeof(temp), snap->zone_temp_c[i], 1);
  format_float_token(setpoint, sizeof(setpoint), z.setpoint_c, 1);
  format_float_token(valve, sizeof(valve), snap->zone_valve_pct[i], 0);
  format_float_token(preload, sizeof(preload), snap->zone_preheat_c[i], 1);
  format_float_token(area, sizeof(area), z.area_m2, 1);
  format_float_token(spacing, sizeof(spacing), z.pipe_spacing_mm, 0);
  format_float_token(max_offset, sizeof(max_offset), z.max_offset_c, 2);
  format_float_token(open_ripple, sizeof(open_ripple), snap->motor_open_ripple[i], 0);
  format_float_token(close_ripple, sizeof(close_ripple), snap->motor_close_ripple[i], 0);
  format_float_token(open_factor, sizeof(open_factor), snap->motor_open_factor[i], 2);
  format_float_token(close_factor, sizeof(close_factor), snap->motor_close_factor[i], 2);
  format_float_token(working_ripple, sizeof(working_ripple), snap->motor_working_ripple[i], 0);
  format_float_token(pin_free, sizeof(pin_free), snap->motor_pin_free_ripple[i], 0);
  const char *stroke_model =
      snap->motor_stroke_model[i] == static_cast<uint8_t>(lv6::StrokeModel::WORKING_RANGE)
          ? "working_range"
          : "full_stroke";

  const int8_t probe_idx = snap->probes.zone_return_probe[i];
  if (probe_idx >= 0 && probe_idx < static_cast<int8_t>(lv6::MAX_PROBES))
    format_float_token(probe, sizeof(probe), snap->probe_temp_c[probe_idx], 1);
  else
    snprintf(probe, sizeof(probe), "null");

  char ua[24], mass[24], tau[24], share[24], rank[16];
  const auto th = lv6::thermal_model::estimate(
      z, this->config_store_ ? this->config_store_->get_house_physics() : lv6::HousePhysicsConfig{});
  format_float_token(ua, sizeof(ua), th.ua_w_per_k, 1);
  format_float_token(mass, sizeof(mass), th.thermal_mass_kwh_per_k, 2);
  format_float_token(tau, sizeof(tau), th.tau_h, 1);
  if (std::isfinite(snap->zone_loop_share_pct[i]))
    format_float_token(share, sizeof(share), snap->zone_loop_share_pct[i], 1);
  else
    snprintf(share, sizeof(share), "null");
  if (snap->zone_absorb_capacity_rank[i] > 0)
    snprintf(rank, sizeof(rank), "%u", static_cast<unsigned>(snap->zone_absorb_capacity_rank[i]));
  else
    snprintf(rank, sizeof(rank), "null");
  const char *absorb_state =
      snap->absorb_mode == 2 ? "armed" : (snap->absorb_mode == 1 ? "reactive" : "idle");

  char *buf = this->json_buf_;
  size_t off = 0;
  char age_tok[16];
  if (snap->zone_external_temp_age_ms[i] == UINT32_MAX)
    snprintf(age_tok, sizeof(age_tok), "null");
  else
    snprintf(age_tok, sizeof(age_tok), "%lu",
             static_cast<unsigned long>(snap->zone_external_temp_age_ms[i]));
  appendf(buf, JSON_BUF_SIZE, off,
          "{\"ok\":true,\"version\":\"v1\",\"data\":{\"zone\":%u,\"name\":\"",
          static_cast<unsigned>(zone));
  append_json_escaped(buf, JSON_BUF_SIZE, off, z.name);
  appendf(buf, JSON_BUF_SIZE, off,
          "\",\"enabled\":%s,\"state\":\"%s\",\"fresh\":%s,"
          "\"temperature_c\":%s,\"setpoint_c\":%s,\"valve_pct\":%s,\"preheat_c\":%s,"
          "\"temp_source\":\"%s\",\"probe_index\":%d,\"probe_temp_c\":%s,\"ble_mac\":\"%s\","
          "\"sensor_id\":\"%s\",\"sensor_name\":\"%s\",\"external_temp_age_ms\":%s,"
          "\"ua_w_per_k\":%s,\"thermal_mass_kwh_per_k\":%s,\"tau_h\":%s,"
          "\"return_c\":%s,\"loop_share_pct\":%s,\"absorb_state\":\"%s\","
          "\"absorb_capacity_rank\":%s,"
          "\"settings\":{\"area_m2\":%s,\"pipe_spacing_mm\":%s,\"pipe_type\":%u,"
          "\"sync_to_zone\":%d,\"abs_min_c\":%.1f,\"abs_max_c\":%.1f,"
          "\"min_offset_c\":%.2f,\"max_offset_c\":%.2f},"
          "\"motor\":{\"fault\":\"%s\",\"open_ripples\":%s,\"close_ripples\":%s,"
          "\"open_factor\":%s,\"close_factor\":%s,\"working_ripples\":%s,"
          "\"pin_free_ripples\":%s,\"stroke_model\":\"%s\"}}}",
          z.enabled ? "true" : "false", snap->zone_state[i],
          std::isfinite(snap->zone_temp_c[i]) ? "true" : "false",
          temp, setpoint, valve, preload, temp_source_to_dashboard_str(snap->zone_temp_source[i]),
          probe_idx >= 0 ? static_cast<int>(probe_idx) + 1 : 0, probe, snap->zone_ble_mac[i],
          snap->zone_sensor_id[i], snap->zone_sensor_name[i], age_tok,
          th.plausible ? ua : "null", th.plausible ? mass : "null",
          th.plausible ? tau : "null", probe, share, absorb_state, rank,
          area, spacing, static_cast<unsigned>(z.pipe_type),
          z.sync_to_zone >= 0 ? static_cast<int>(z.sync_to_zone) + 1 : 0,
          z.abs_min_c, z.abs_max_c, z.min_offset_c, z.max_offset_c,
          snap->motor_fault[i], open_ripple, close_ripple, open_factor, close_factor,
          working_ripple, pin_free, stroke_model);
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
  char hp_margin[24], hp_base[24], hp_trim[24];
  format_float_token(preheat_band, sizeof(preheat_band), snap->preheat_absorb_band_c, 1);
  format_float_token(preheat_delta, sizeof(preheat_delta), snap->preheat_detect_delta_c, 1);
  format_float_token(min_flow, sizeof(min_flow), snap->min_zone_flow_pct, 1);
  format_float_token(hp_margin, sizeof(hp_margin), snap->hp_overheat_margin_c, 1);
  format_float_token(hp_base, sizeof(hp_base), snap->hp_base_pct, 0);
  format_float_token(hp_trim, sizeof(hp_trim), snap->hp_trim_floor_pct, 0);

  appendf(buf, BUF_SIZE, off,
          "{\"ok\":true,\"version\":\"v1\",\"data\":{\"control\":{"
          "\"simple_preheat_enabled\":%s,\"preheat_absorb_enabled\":%s,"
          "\"preheat_absorb_band_c\":%s,\"preheat_detect_delta_c\":%s,"
          "\"heating_mode\":\"%s\",\"hp_overheat_margin_c\":%s,"
          "\"hp_base_pct\":%s,\"hp_trim_floor_pct\":%s},"
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
          lv6::heating_profile_to_string(snap->heating_mode), hp_margin, hp_base, hp_trim,
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
    char abs_min[24], abs_max[24];
    format_float_token(setpoint, sizeof(setpoint), snap->zones[i].setpoint_c, 1);
    format_float_token(area, sizeof(area), snap->zones[i].area_m2, 1);
    format_float_token(spacing, sizeof(spacing), snap->zones[i].pipe_spacing_mm, 0);
    format_float_token(min_offset, sizeof(min_offset), snap->zones[i].min_offset_c, 2);
    format_float_token(max_offset, sizeof(max_offset), snap->zones[i].max_offset_c, 2);
    format_float_token(abs_min, sizeof(abs_min), snap->zones[i].abs_min_c, 1);
    format_float_token(abs_max, sizeof(abs_max), snap->zones[i].abs_max_c, 1);

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
            "\"motor_profile\":\"%s\"}",
            snap->zones[i].enabled ? "true" : "false", setpoint, area, spacing,
            pipe_type_to_api_str(snap->zones[i].pipe_type),
            temp_source_to_dashboard_str(snap->zone_temp_source[i]),
            snap->probes.zone_return_probe[i] >= 0 ? static_cast<int>(snap->probes.zone_return_probe[i]) + 1 : 0,
            snap->zones[i].sync_to_zone >= 0 ? static_cast<int>(snap->zones[i].sync_to_zone) + 1 : 0,
            snap->zone_ble_mac[i], min_offset, max_offset, abs_min, abs_max,
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
  char cpu0[24], cpu1[24], flow[24], ret[24], ble_ads[24];
  format_float_token(cpu0, sizeof(cpu0), snap->cpu0_pct, 1);
  format_float_token(cpu1, sizeof(cpu1), snap->cpu1_pct, 1);
  format_float_token(flow, sizeof(flow), snap->manifold_flow_c, 1);
  format_float_token(ret, sizeof(ret), snap->manifold_return_c, 1);
  format_float_token(ble_ads, sizeof(ble_ads), snap->ble_ads_per_sec, 2);
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
  static char extras_json[3600];
  memset(extras_json, 0, sizeof(extras_json));
  size_t extras_off = 0;
  appendf(extras_json, sizeof(extras_json), extras_off, "\"room_temperatures\":[");
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    char age_tok[16];
    if (snap->zone_external_temp_age_ms[i] == UINT32_MAX)
      snprintf(age_tok, sizeof(age_tok), "null");
    else
      snprintf(age_tok, sizeof(age_tok), "%lu",
               static_cast<unsigned long>(snap->zone_external_temp_age_ms[i]));
    const bool http_external = snap->zone_temp_source[i] == lv6::TempSource::EXTERNAL;
    const bool ingest_fresh =
        http_external && snap->zone_external_temp_age_ms[i] != UINT32_MAX &&
        snap->zone_external_temp_age_ms[i] <=
            lv6::Lv6ZoneController::EXTERNAL_HTTP_TEMP_STALE_MS;
    appendf(extras_json, sizeof(extras_json), extras_off,
            "%s{\"zone\":%u,\"temp_source\":\"%s\",\"sensor_id\":\"%s\","
            "\"sensor_name\":\"%s\",\"external_temp_age_ms\":%s,\"ingest_fresh\":%s}",
            i ? "," : "", static_cast<unsigned>(i + 1),
            temp_source_to_dashboard_str(snap->zone_temp_source[i]), snap->zone_sensor_id[i],
            snap->zone_sensor_name[i], age_tok, ingest_fresh ? "true" : "false");
  }
  appendf(extras_json, sizeof(extras_json), extras_off, "],");
  const char *const freshness = "snapshot_observed_source_timestamp_unavailable";
  appendf(extras_json, sizeof(extras_json), extras_off, "\"hydraulic_alarms\":[");
  for (uint8_t i = 0; i < 3; i++) {
    const auto alarm = lv6::hydraulic_diagnostics::evaluate(i, hydraulic);
    const char *evidence = "required documented telemetry is unavailable";
    if (i == 1 && hydraulic.manifold_delta_known)
      evidence = "observed manifold supply-return delta";
    appendf(extras_json, sizeof(extras_json), extras_off,
            "%s{\"id\":\"%s\",\"state\":\"%s\",\"freshness\":\"%s\",\"evidence\":\"%s\",\"suggested_action\":\"%s\"}",
            i ? "," : "", alarm.id, lv6::hydraulic_diagnostics::state_str(alarm.state),
            freshness, evidence, alarm.action);
  }
  appendf(extras_json, sizeof(extras_json), extras_off, "]");

  // Probe temperature plausibility under heating.
  {
    float zone_ret[lv6::NUM_ZONES];
    for (uint8_t z = 0; z < lv6::NUM_ZONES; z++)
      zone_ret[z] = NAN;
    for (uint8_t z = 0; z < lv6::NUM_ZONES; z++) {
      const int8_t pi = snap->probes.zone_return_probe[z];
      if (pi >= 0 && pi < static_cast<int8_t>(lv6::MAX_PROBES) &&
          std::isfinite(snap->probe_temp_c[pi]))
        zone_ret[z] = snap->probe_temp_c[pi];
    }
    const auto plaus = lv6::probe_mapping::check_plausibility(
        snap->manifold_flow_c, snap->manifold_return_c, zone_ret, snap->probes);
    const char *state = "unavailable";
    const char *action = "Map flow and return probes to enable heating plausibility checks.";
    if (plaus.heating) {
      if (!plaus.manifold_ok) {
        state = "warning";
        action = "Manifold return is at or above flow while heating — check probe mapping.";
      } else if (!plaus.zones_ok) {
        state = "warning";
        action = "A zone return probe is outside the flow/return band — check mapping.";
      } else {
        state = "ok";
        action = "Probe temperatures are consistent with heating flow.";
      }
    } else if (std::isfinite(snap->manifold_flow_c) &&
               std::isfinite(snap->manifold_return_c)) {
      state = "ok";
      action = "Not in a clear heating regime; plausibility checks idle.";
    }
    char bad_zone_tok[8];
    if (plaus.bad_zone >= 0)
      snprintf(bad_zone_tok, sizeof(bad_zone_tok), "%d", static_cast<int>(plaus.bad_zone) + 1);
    else
      snprintf(bad_zone_tok, sizeof(bad_zone_tok), "null");
    appendf(extras_json, sizeof(extras_json), extras_off,
            ",\"probe_plausibility\":{\"state\":\"%s\",\"heating\":%s,"
            "\"manifold_ok\":%s,\"zones_ok\":%s,\"bad_zone\":%s,"
            "\"suggested_action\":\"%s\"}",
            state, plaus.heating ? "true" : "false",
            plaus.manifold_ok ? "true" : "false",
            plaus.zones_ok ? "true" : "false",
            bad_zone_tok, action);
  }

  const int written = snprintf(this->json_buf_, JSON_BUF_SIZE,
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"heap\":{\"internal_kb\":%lu,"
           "\"dma_kb\":%lu,\"largest_internal_kb\":%lu,\"min_internal_kb\":%lu,"
           "\"psram_kb\":%lu,\"largest_psram_kb\":%lu,"
           "\"internal_allocated_kb\":%lu,\"internal_free_blocks\":%lu,"
           "\"internal_alloc_blocks\":%lu},"
           "\"cpu\":{\"core0_pct\":%s,\"core1_pct\":%s},"
           "\"ble\":{\"enabled\":%s,\"scanning\":%s,\"demanded\":%s,"
           "\"ads_per_sec\":%s,\"last_adv_age_ms\":%lu},"
           "\"manifold\":{\"flow_c\":%s,\"flow_temp_c\":%s,\"return_c\":%s},\"drivers_enabled\":%s,"
           "\"motor_safety\":{\"backend\":\"%s\",\"motor_busy\":%s,\"drive_on\":%s,"
           "\"latch_faulted\":%s,\"fault_code\":%u,\"current_ma\":%.1f,"
           "\"bemf_raw_a\":%u,\"bemf_raw_b\":%u,\"bemf_differential_raw\":%d,"
           "\"sample_separation_us\":%u,\"bemf_threshold_raw\":%u,"
           "\"sample_valid\":%s,\"sample_moving\":%s,\"invalid_samples\":%u,"
           "\"armed\":%s,\"latch_arm_level\":%d,\"latch_state_level\":%d,"
           "\"motor_enable_level\":%d,\"driver_nsleep_level\":%d,"
           "\"rail_overcurrent_level\":%d,\"fault_usb_level\":%d,"
           "\"adc_notifies\":%lu,\"adc_frames\":%lu,"
           "\"adc_read_errors\":%lu,\"adc_channel_mask\":%lu,\"adc_start_err\":%ld,"
           "\"adc_stream_ready\":%s,"
           "\"decoder_address\":%u,\"stroke_phase\":%u,"
           "\"tacho_period_us\":%lu,\"tacho_cadence_us\":%lu,"
           "\"tacho_rejected\":%lu,\"tacho_hardware_count\":%lu,"
           "\"tacho_adc_count\":%lu,\"tacho_amp_raw\":%u,"
           "\"motion_evidence_count\":%lu,\"sample_sequence\":%lu,\"motor_runtime_ms\":%lu,"
           "\"baseline_ma\":%.1f,\"baseline_settled\":%s,\"counts_spurious\":%s,"
           "\"last_fast_trip\":%u,\"endpoint_decision\":%u,"
           "\"ceiling_ms\":%lu,\"ceiling_counts\":%lu,\"ceiling_source\":%u,"
           "\"requires_calibration\":%s,\"position_confident\":%s,"
           "\"close_step_sustained_ms\":%lu,\"learned_stall_ma\":%.1f,"
           "\"cap_seat_ma\":%.1f,\"cap_popoff_ma\":%.1f,\"cap_open_ma\":%.1f,"
           "\"cap_stall_ma\":%.1f,\"cap_circuit_ma\":%.1f},"
           "\"authority\":{\"state\":\"%s\",\"reason\":\"%s\",\"lease_remaining_s\":%lu,\"generation\":%lu,\"v6_write_allowed\":%s},"
           "\"firmware\":{\"update\":{\"current\":\"%s\",\"latest\":\"%s\",\"available\":%s,"
           "\"status\":\"%s\"}},\"reset_reason\":\"%s\","
           "%s,\"logs_endpoint\":\"/api/v1/logs\","
           "\"logs_download_endpoint\":\"/api/v1/logs/download\"}}",
           static_cast<unsigned long>(snap->free_internal_kb),
           static_cast<unsigned long>(snap->free_dma_kb),
           static_cast<unsigned long>(snap->largest_internal_kb),
           static_cast<unsigned long>(snap->min_internal_kb),
           static_cast<unsigned long>(snap->free_psram_kb),
           static_cast<unsigned long>(snap->largest_psram_kb),
           static_cast<unsigned long>(snap->internal_allocated_kb),
           static_cast<unsigned long>(snap->internal_free_blocks),
           static_cast<unsigned long>(snap->internal_alloc_blocks), cpu0, cpu1,
           snap->ble_hub_enabled ? "true" : "false",
           snap->ble_scanning ? "true" : "false",
           snap->ble_demanded ? "true" : "false",
           ble_ads, static_cast<unsigned long>(snap->ble_last_adv_age_ms == UINT32_MAX
                                                   ? 0
                                                   : snap->ble_last_adv_age_ms),
           flow, flow, ret,
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
           static_cast<int>(motor_diag.latch_arm_level),
           static_cast<int>(motor_diag.latch_state_level),
           static_cast<int>(motor_diag.motor_enable_level),
           static_cast<int>(motor_diag.driver_nsleep_level),
           static_cast<int>(motor_diag.rail_overcurrent_level),
           static_cast<int>(motor_diag.fault_usb_level),
           static_cast<unsigned long>(motor_diag.adc_notifies),
           static_cast<unsigned long>(motor_diag.adc_frames),
           static_cast<unsigned long>(motor_diag.adc_read_errors),
           static_cast<unsigned long>(motor_diag.adc_channel_mask),
           static_cast<long>(motor_diag.adc_start_err),
           motor_diag.adc_stream_ready ? "true" : "false",
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
           motor_diag.baseline_ma,
           motor_diag.baseline_settled ? "true" : "false",
           motor_diag.counts_spurious ? "true" : "false",
           motor_diag.last_fast_trip, motor_diag.endpoint_decision,
           static_cast<unsigned long>(motor_diag.ceiling_ms),
           static_cast<unsigned long>(motor_diag.ceiling_counts),
           motor_diag.ceiling_source,
           motor_diag.requires_calibration ? "true" : "false",
           motor_diag.position_confident ? "true" : "false",
           static_cast<unsigned long>(motor_diag.close_step_sustained_ms),
           motor_diag.learned_stall_ma,
           motor_diag.cap_seat_ma, motor_diag.cap_popoff_ma, motor_diag.cap_open_ma,
           motor_diag.cap_stall_ma, motor_diag.cap_circuit_ma,
           snap->authority_state,
           snap->authority_reason, static_cast<unsigned long>(snap->authority_lease_remaining_s),
           static_cast<unsigned long>(snap->authority_generation),
           snap->authority_v6_write_allowed ? "true" : "false",
           snap->firmware_update_current, snap->firmware_update_latest,
           snap->firmware_update_available ? "true" : "false",
           snap->firmware_update_status, snap->reset_reason, extras_json);
  // snprintf truncates silently, which would emit structurally invalid JSON and
  // present to the dashboard as a parse error with no clue where it came from.
  if (written < 0 || static_cast<size_t>(written) >= JSON_BUF_SIZE) {
    ESP_LOGE(TAG, "diagnostics JSON truncated (%d bytes into %u); raise JSON_BUF_SIZE",
             written, static_cast<unsigned>(JSON_BUF_SIZE));
    send_text_(request, 500, "application/json",
               "{\"error\":\"diagnostics_json_truncated\"}", false, "no-cache");
    return;
  }
  send_text_(request, 200, "application/json", this->json_buf_, true, "no-cache");
}

void LV6Dashboard::handle_motor_trace_(AsyncWebServerRequest *request) {
  if (this->valve_controller_ == nullptr) {
    send_text_(request, 503, "application/json",
               "{\"ok\":false,\"error\":{\"code\":\"controller_unavailable\"}}",
               true, "no-cache");
    return;
  }
  // Live export is allowed while the motor runs so the dashboard can merge
  // successive ring windows into a longer browser-side capture (~40 s).
  // Samples are read under the trace mutex; overlapping windows are fine.

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "text/csv; charset=utf-8");
  httpd_resp_set_hdr(req, "Cache-Control", "no-store");
  httpd_resp_set_hdr(req, "Content-Disposition", "attachment; filename=lune-v6-motor-trace.csv");
  httpd_resp_set_hdr(req, "Connection", "close");

  // The six bemf_* columns are gone. They were only ever populated by the Rev
  // 3.1 BEMF backend, which no board package selects any more, so on the
  // shipping hardware every row carried a constant 65535,65535,0,65535,0,0,0 -
  // a quarter of the row width, against a fixed line buffer. The browser parser
  // is header-keyed, so older captures still load.
  static constexpr char HEADER[] =
      "t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,"
      "stroke_phase,tacho_period_us,tacho_amp_raw\n";
  if (httpd_resp_send_chunk(req, HEADER, sizeof(HEADER) - 1) != ESP_OK)
    return;

  const uint16_t count = this->valve_controller_->get_motor_trace_sample_count();
  // Ten columns, widest plausible row well under 128. 160 leaves headroom for
  // a future column without reintroducing the truncation hazard.
  char line[160];
  for (uint16_t index = 0; index < count; index++) {
    lv6::MotorTraceSample sample{};
    if (!this->valve_controller_->get_motor_trace_sample(index, &sample))
      break;
    const int length = snprintf(
        line, sizeof(line), "%lu,%lu,%.1f,%u,%u,%u,%u,%u,%lu,%u\n",
        static_cast<unsigned long>(sample.t_ms),
        static_cast<unsigned long>(sample.ripple_count),
        static_cast<float>(sample.current_ma_x10) / 10.0f,
        static_cast<unsigned>(sample.adc_raw),
        static_cast<unsigned>(sample.drive_on),
        static_cast<unsigned>(sample.direction_open),
        static_cast<unsigned>(sample.armed),
        static_cast<unsigned>(sample.stroke_phase),
        static_cast<unsigned long>(sample.tacho_period_us),
        static_cast<unsigned>(sample.tacho_amp_raw));
    // A row that does not fit is a firmware bug, and returning here used to
    // abandon the chunked response WITHOUT its terminator - the client saw a
    // malformed download with nothing to diagnose it by.
    if (length <= 0 || length >= static_cast<int>(sizeof(line))) {
      ESP_LOGE(TAG, "motor trace row %u did not fit in %u bytes; truncating export",
               static_cast<unsigned>(index), static_cast<unsigned>(sizeof(line)));
      break;
    }
    if (httpd_resp_send_chunk(req, line, static_cast<size_t>(length)) != ESP_OK)
      return;  // client went away; the connection is already unusable
  }
  httpd_resp_send_chunk(req, nullptr, 0);
}

void LV6Dashboard::handle_events_(AsyncWebServerRequest *request) {
  send_text_(request, 200, "text/event-stream",
             "event: hello\n"
             "data: {\"resource\":\"/api/v1/state\",\"stream\":\"poll\"}\n\n",
             true, "no-cache");
}

void LV6Dashboard::handle_revision_(AsyncWebServerRequest *request) {
  char response[320];
  snprintf(response, sizeof(response),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"data_revision\":%lu,"
           "\"runtime_revision\":%lu,"
           "\"uptime_s\":%lu,\"poll_after_ms\":10000,\"freshness\":\"runtime\"}}",
           static_cast<unsigned long>(data_revision_),
           static_cast<unsigned long>(runtime_revision_),
           static_cast<unsigned long>(millis() / 1000UL));
  send_text_(request, 200, "application/json", response, false, "no-cache");
}

// =============================================================================
// /api/v1 - request routing (contract: lune-v6/docs/lv6_api_v1.md)
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

// Local writes trust the LAN, same model as Asgard/Odin: no commissioning
// secret for Motor Lab / settings from a phone on the home network. Touch
// coordinator commands keep their own authority authentication. A custom CSRF
// header is still required so naive cross-site form POSTs cannot mutate state
// (simple HTML forms cannot set custom headers, and wildcard CORS is off).
bool LV6Dashboard::authorize_write_(AsyncWebServerRequest *request) {
  const auto csrf_header = request->get_header("X-Lune-CSRF");
  if (!csrf_header.has_value() || csrf_header->empty()) {
    ESP_LOGW(TAG, "Write to %s rejected: missing X-Lune-CSRF", request->url().c_str());
    this->send_v1_(request, 403, "csrf_required", "X-Lune-CSRF header required");
    return false;
  }
  return true;
}

void LV6Dashboard::prepare_motors_for_ota_() {
  // Persist any debounced settings (setpoint etc.) before the OTA reboot so a
  // change made within the last second is not lost with the dirty timer.
  if (this->config_store_ != nullptr)
    this->config_store_->flush_now();

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
  if (strcmp(path, "/groups") == 0) {
    this->handle_groups_(request);
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

  const std::string body_str_early = !this->post_body_.empty()
                                         ? this->post_body_
                                         : request->arg("plain");
  this->post_body_.clear();
  if (strcmp(path, "/room-temperatures") == 0) {
    this->handle_room_temperatures_(request, body_str_early.c_str());
    return;
  }

  DashboardAction act{};
  float num = 0.0f;
  bool flag = false;
  const std::string body_str = body_str_early;
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
    // Revoke clears Touch authority (shared_key / lease). Still gated by the
    // same CSRF header as every other local write.
    if (!this->authorize_write_(request))
      return;
    this->handle_authority_revoke_(request);
    return;
  }
  if (strcmp(path, "/absorb-window") == 0) {
    this->handle_absorb_window_(request, body);
    return;
  }
  if (strcmp(path, "/groups") == 0) {
    this->handle_groups_write_(request, body);
    return;
  }
  if (strncmp(path, "/groups/", 8) == 0) {
    const char *rest = path + 8;
    const char *slash = strchr(rest, '/');
    if (slash != nullptr && strcmp(slash, "/remove") == 0) {
      char gid[lv6::GROUP_ID_LEN]{};
      size_t n = static_cast<size_t>(slash - rest);
      if (n >= sizeof(gid))
        n = sizeof(gid) - 1;
      memcpy(gid, rest, n);
      gid[n] = '\0';
      this->handle_group_remove_(request, gid, body);
      return;
    }
  }
  if (strcmp(path, "/physics/house") == 0) {
    this->handle_physics_house_(request, body);
    return;
  }
  if ((zone = match_zone_route(path, "/zones", "physics")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    this->handle_zone_physics_(request, static_cast<uint8_t>(zone), body);
    return;
  }
  if ((zone = match_zone_route(path, "/zones", "ua-learned")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    this->handle_zone_ua_learned_(request, static_cast<uint8_t>(zone), body);
    return;
  }
  if ((zone = match_zone_route(path, "/zones", "forecast-profile")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    this->handle_forecast_profile_(request, static_cast<uint8_t>(zone), body);
    return;
  }
  // Bring-up instrument, not a control surface: it only wiggles LATCH_ARM while
  // the bridges are coasting, so it lives outside the queued-action path.
  if (strcmp(path, "/motors/arm-clock-probe") == 0) {
    if (!this->authorize_write_(request))
      return;
    this->handle_arm_clock_probe_(request, body);
    return;
  }
  if (strcmp(path, "/motors/decoder-probe") == 0) {
    if (!this->authorize_write_(request))
      return;
    this->handle_decoder_probe_(request, body);
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
    // Motor Lab / zone jog pass duration_ms; default remains 10 s when omitted.
    if ((act.value_str == "open_motor_timed" || act.value_str == "close_motor_timed") &&
        parse_num_param(request, body, "duration_ms", &num) && num > 0.0f) {
      act.num_val = num;
      act.has_num = true;
    }
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
    float zone_num = 0.0f;
    if (!parse_num_param(request, body, "zone", &zone_num))
      zone_num = 0.0f;
    if ((strcmp(cmd_buf, "open_motor_timed") == 0 || strcmp(cmd_buf, "close_motor_timed") == 0) &&
        parse_num_param(request, body, "duration_ms", &num) && num > 0.0f) {
      act.num_val = num;
      act.has_num = true;
    }
    apply_zone(act, static_cast<int>(zone_num));

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
  if (act.key == "drivers_enabled" && act.has_num && act.num_val != 0.0f &&
      this->valve_controller_ && this->valve_controller_->has_fault_latch())
    this->valve_controller_->assert_latch_arm_high();

  // Probe role uniqueness — reject before enqueue so the client sees 409.
  if (this->config_store_ &&
      (act.key == "zone_probe" || act.key == "manifold_flow_probe" ||
       act.key == "manifold_return_probe") &&
      act.has_str) {
    int8_t probe = lv6::PROBE_UNASSIGNED;
    if (parse_probe_option(act.value_str.c_str(), &probe) && probe != lv6::PROBE_UNASSIGNED) {
      const auto probes = this->config_store_->get_config().probes;
      const bool ignore_flow = (act.key == "manifold_flow_probe");
      const bool ignore_ret = (act.key == "manifold_return_probe");
      const int8_t ignore_zone =
          (act.key == "zone_probe" && act.zone_valid) ? static_cast<int8_t>(act.zi)
                                                      : static_cast<int8_t>(-1);
      if (!lv6::probe_mapping::is_free(probes, probe, ignore_zone, ignore_flow, ignore_ret)) {
        this->send_v1_(request, 409, "probe_conflict",
                       "Probe already assigned to another role");
        return;
      }
    }
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
  char control_mode_str[24]{};
  parse_text_param(request, body, "control_mode", "", control_mode_str, sizeof(control_mode_str));
  lv6_authority::Request lease_request{installation_id, coordinator_id, lease_id,
                                        static_cast<uint32_t>(sequence),
                                        static_cast<uint32_t>(issued_ms),
                                        static_cast<uint32_t>(duration_ms), degraded,
                                        lv6_authority::control_mode_from_string(control_mode_str)};
  this->authority_.configure(cfg.installation_id, cfg.coordinator_id);
  const auto result = this->authority_.acquire_or_renew(lease_request, diff == 0, millis());
  const auto snapshot = this->authority_.snapshot(millis());
  if (this->zone_controller_) {
    this->zone_controller_->set_touch_authority_active(snapshot.touch_lease_active);
    if (snapshot.touch_lease_active && snapshot.control_mode != lv6_authority::ControlMode::UNSET) {
      const auto mode = (snapshot.control_mode == lv6_authority::ControlMode::NORMAL)
                            ? lv6::HeatingProfile::NORMAL
                            : lv6::HeatingProfile::HEAT_PUMP;
      this->zone_controller_->set_touch_control_mode(true, mode);
    } else {
      this->zone_controller_->set_touch_control_mode(false, lv6::HeatingProfile::HEAT_PUMP);
    }
  }
  const int status = (result == lv6_authority::Result::GRANTED || result == lv6_authority::Result::RENEWED) ? 200 :
                     (result == lv6_authority::Result::AUTH_REQUIRED ? 401 : 409);
  const char *mode_json = lv6_authority::control_mode_to_string(snapshot.control_mode);
  char response[640];
  snprintf(response, sizeof(response),
           "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"result\":\"%s\",\"state\":\"%s\","
           "\"generation\":%lu,\"lease_remaining_s\":%lu,\"reason\":\"%s\","
           "\"control_mode\":%s%s%s,\"authority_only\":true}}",
           status == 200 ? "true" : "false", lv6_authority::result_name(result),
           lv6_authority::state_name(snapshot.state), static_cast<unsigned long>(snapshot.lease_generation),
           static_cast<unsigned long>(snapshot.remaining_ms / 1000UL), snapshot.last_reason,
           mode_json ? "\"" : "null", mode_json ? mode_json : "", mode_json ? "\"" : "");
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
  if (this->zone_controller_) {
    this->zone_controller_->set_touch_authority_active(false);
    this->zone_controller_->set_touch_control_mode(false, lv6::HeatingProfile::HEAT_PUMP);
  }
  if (data_revision_ != UINT32_MAX)
    data_revision_++;
  send_text_(request, 200, "application/json",
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"status\":\"revoked\"}}",
             false, "no-store");
}

void LV6Dashboard::handle_absorb_window_(AsyncWebServerRequest *request, const char *body) {
  // House-level absorb arm/disarm (Touch). Same auth + nonce ledger as setpoint-command.
  // Runtime effect: arm forces absorb until TTL/disarm; local auto-detection resumes after.
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
                   "Absorb command requires provisioned key, valid UTC timestamp, and nonce");
    return;
  }
  if (request_guard_.check(0, data_revision_, auth_nonce, millis()) == request_guard::Decision::DUPLICATE) {
    this->send_v1_(request, 409, "replayed_nonce", "Absorb command nonce was already used");
    return;
  }
  if (this->zone_controller_ == nullptr) {
    this->send_v1_(request, 503, "controller_unavailable", "Zone controller unavailable");
    return;
  }

  char action[16]{};
  parse_text_param(request, body, "action", "arm", action, sizeof(action));
  const bool disarm = lv6::absorb_command::is_disarm_action(action);

  char request_id[48]{};
  char source[32]{};
  char reason_raw[48]{};
  char reason[32]{};
  parse_text_param(request, body, "request_id", "", request_id, sizeof(request_id));
  parse_text_param(request, body, "source", "lune-touch", source, sizeof(source));
  parse_text_param(request, body, "reason", "", reason_raw, sizeof(reason_raw));
  lv6::absorb_command::normalize_reason(reason_raw, reason, sizeof(reason));

  float ttl_requested = 1800.0f;
  bool clamp_applied = false;
  uint32_t ttl_s = 0;
  if (!disarm) {
    parse_num_param(request, body, "ttl_s", &ttl_requested);
    ttl_s = lv6::absorb_command::clamp_ttl_s(ttl_requested, &clamp_applied);
  }

  // Ledger (runtime-only) — accepted envelope including clamp + normalized reason.
  std::strncpy(this->absorb_ledger_request_id_, request_id, sizeof(this->absorb_ledger_request_id_) - 1);
  this->absorb_ledger_request_id_[sizeof(this->absorb_ledger_request_id_) - 1] = '\0';
  std::strncpy(this->absorb_ledger_source_, source, sizeof(this->absorb_ledger_source_) - 1);
  this->absorb_ledger_source_[sizeof(this->absorb_ledger_source_) - 1] = '\0';
  std::strncpy(this->absorb_ledger_reason_, reason, sizeof(this->absorb_ledger_reason_) - 1);
  this->absorb_ledger_reason_[sizeof(this->absorb_ledger_reason_) - 1] = '\0';
  std::strncpy(this->absorb_ledger_action_, disarm ? "disarm" : "arm",
               sizeof(this->absorb_ledger_action_) - 1);
  this->absorb_ledger_action_[sizeof(this->absorb_ledger_action_) - 1] = '\0';
  this->absorb_ledger_ttl_s_ = static_cast<float>(ttl_s);
  this->absorb_ledger_clamp_applied_ = clamp_applied;
  this->absorb_ledger_at_ms_ = millis();

  if (disarm) {
    // Idempotent: clearing when no arm is active is still accepted.
    this->zone_controller_->clear_absorb_arm();
    if (data_revision_ != UINT32_MAX)
      data_revision_++;
    char response[384];
    snprintf(response, sizeof(response),
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"accepted\":true,\"status\":\"disarmed\","
             "\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\",\"action\":\"disarm\","
             "\"end_reason\":\"%s\",\"survives_reboot\":false}}",
             request_id, source, reason, this->zone_controller_->absorb_arm_end_reason());
    send_text_(request, 200, "application/json", response, true, "no-store");
    return;
  }

  const float accepted_ttl =
      this->zone_controller_->arm_absorb_window(ttl_s, request_id, reason);
  this->absorb_ledger_ttl_s_ = accepted_ttl;
  if (data_revision_ != UINT32_MAX)
    data_revision_++;

  char response[448];
  snprintf(response, sizeof(response),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"accepted\":true,\"status\":\"armed\","
           "\"request_id\":\"%s\",\"source\":\"%s\",\"reason\":\"%s\",\"action\":\"arm\","
           "\"ttl_s\":%lu,\"ttl_requested_s\":%.0f,\"clamp_applied\":%s,"
           "\"survives_reboot\":false}}",
           request_id, source, reason, static_cast<unsigned long>(accepted_ttl),
           std::isfinite(ttl_requested) ? ttl_requested : 1800.0f,
           clamp_applied ? "true" : "false");
  send_text_(request, 200, "application/json", response, true, "no-store");
}

// Square-waves LATCH_ARM for a few seconds. A single arm edge is a ~3 V spike
// that decays in about a millisecond, so no multimeter can confirm whether it
// survives R4/C4 and reaches U2's clock. A periodic edge can be read on U2
// pin 1 in AC volts. Runs inline on the HTTP task: the ESPHome loop must not
// block for seconds, and nothing here energises a bridge.
void LV6Dashboard::handle_arm_clock_probe_(AsyncWebServerRequest *request, const char *body) {
  if (this->valve_controller_ == nullptr) {
    this->send_v1_(request, 503, "controller_unavailable", "Valve controller unavailable");
    return;
  }
  float num = 0.0f;
  bool flag = false;
  const uint32_t hz =
      parse_num_param(request, body, "hz", &num) ? static_cast<uint32_t>(num) : 100u;
  const uint32_t duration_ms =
      parse_num_param(request, body, "duration_ms", &num) ? static_cast<uint32_t>(num) : 5000u;
  const bool clamp = parse_bool_param(request, body, "clamp", &flag) && flag;

  lv6::Rev32MotorBackend::ArmClockProbe probe{};
  if (!this->valve_controller_->has_fault_latch()) {
    this->send_v1_(request, 400, "no_latch",
                   "Rev 3.3 has no LATCH_ARM; GPIO17 is DRIVER_N_SLEEP");
    return;
  }
  if (!this->valve_controller_->probe_arm_clock(hz, duration_ms, clamp, &probe)) {
    this->send_v1_(request, 503, "backend_unavailable", "Rev 3.2 motor backend is not active");
    return;
  }

  char buf[320];
  snprintf(buf, sizeof(buf),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"cycles\":%u,\"hz\":%u,"
           "\"clamp\":%s,\"armed\":%s,\"armed_at_cycle\":%u,\"latch_state_start\":%d,"
           "\"latch_state_end\":%d}}",
           static_cast<unsigned>(probe.cycles), static_cast<unsigned>(probe.hz),
           probe.clamp ? "true" : "false",
           probe.armed ? "true" : "false", static_cast<unsigned>(probe.armed_at_cycle),
           probe.latch_state_start, probe.latch_state_end);
  send_text_(request, 200, "application/json", buf, true, "no-store");
}

// Holds one decoder address with the bridges coasting so the 74HC4514 outputs
// can be checked against the twelve-entry channel map with a meter. Nothing is
// energised: MOTOR_ENABLE stays low for the whole hold, and the decoder is
// parked back on address 0 afterwards.
void LV6Dashboard::handle_decoder_probe_(AsyncWebServerRequest *request, const char *body) {
  if (this->valve_controller_ == nullptr) {
    this->send_v1_(request, 503, "controller_unavailable", "Valve controller unavailable");
    return;
  }
  float num = 0.0f;
  bool flag = false;
  if (!parse_num_param(request, body, "zone", &num)) {
    this->send_v1_(request, 400, "missing_param", "zone is required");
    return;
  }
  const int zone = static_cast<int>(num);
  if (zone < 1 || zone > static_cast<int>(lv6::NUM_ZONES)) {
    this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
    return;
  }
  const bool reverse = parse_bool_param(request, body, "reverse", &flag) && flag;
  const uint32_t hold_ms =
      parse_num_param(request, body, "duration_ms", &num) ? static_cast<uint32_t>(num) : 10000u;

  lv6::Rev32MotorBackend::DecoderProbe probe{};
  if (!this->valve_controller_->probe_decoder(static_cast<uint8_t>(zone), reverse,
                                              hold_ms, &probe)) {
    this->send_v1_(request, 503, "probe_unavailable",
                   "Rev 3.2 backend inactive, or a move is in progress");
    return;
  }
  if (!probe.accepted) {
    this->send_v1_(request, 400, "unmapped_selection",
                   "That zone/direction pair has no decoder address");
    return;
  }

  char buf[320];
  snprintf(buf, sizeof(buf),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"zone\":%u,\"reverse\":%s,"
           "\"decoder_address\":%u,\"a3\":%d,\"a2\":%d,\"a1\":%d,\"a0\":%d,"
           "\"motor_enable\":%d}}",
           static_cast<unsigned>(probe.zone), probe.reverse ? "true" : "false",
           static_cast<unsigned>(probe.decoder_address),
           probe.a3, probe.a2, probe.a1, probe.a0, probe.motor_enable);
  send_text_(request, 200, "application/json", buf, true, "no-store");
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
      // Default 10 s for zone jog; Motor Lab sends profile runtime (≈40–45 s).
      uint32_t hold_ms = 10000u;
      if (has_num && num_val > 0.0f)
        hold_ms = static_cast<uint32_t>(std::clamp(num_val, 100.0f, 60000.0f));
      this->valve_controller_->request_timed_open(zi, static_cast<uint16_t>(hold_ms), true);
    } else if (strcmp(str_val, "close_motor_timed") == 0 && zone_valid && this->valve_controller_) {
      uint32_t hold_ms = 10000u;
      if (has_num && num_val > 0.0f)
        hold_ms = static_cast<uint32_t>(std::clamp(num_val, 100.0f, 60000.0f));
      this->valve_controller_->request_timed_close(zi, static_cast<uint16_t>(hold_ms), true);
    } else if (strcmp(str_val, "stop_motor") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_stop(zi);
    } else if (strcmp(str_val, "motor_reset_fault") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_fault(zi);
    } else if (strcmp(str_val, "motor_reset_learned_factors") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_learned_factors(zi);
    } else if (strcmp(str_val, "motor_reset_and_relearn") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_and_relearn(zi);
    } else if (strcmp(str_val, "calibrate_all_motors") == 0 && this->valve_controller_) {
      this->valve_controller_->request_calibration_all();
    } else if (strcmp(str_val, "ble_clock_sync_now") == 0) {
      if (this->ble_time_beacon_)
        this->ble_time_beacon_->request_sync_now();
    } else if (strcmp(str_val, "ble_scan") == 0) {
      // User-initiated discovery: enable NimBLE and start (or keep) passive
      // scan so GET /api/v1/ble-scan can return BTHome sensors. lv6_ble_demand
      // keeps the hub up for idle_grace (~30 s) even without config demand.
      if (this->nimble_hub_) {
        if (!this->nimble_hub_->is_enabled())
          this->nimble_hub_->enable();
        this->nimble_hub_->start_scan(true);
      }
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

  // ---- device_display_name / device_location (SystemConfig) ----
  } else if (strcmp(key, "device_display_name") == 0 && has_str && this->config_store_) {
    auto cfg = this->config_store_->get_config();
    char buf[sizeof(cfg.system.display_name)];
    strncpy(buf, str_val, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\0';
    if (strncmp(cfg.system.display_name, buf, sizeof(buf)) != 0) {
      strncpy(cfg.system.display_name, buf, sizeof(cfg.system.display_name));
      cfg.system.display_name[sizeof(cfg.system.display_name) - 1] = '\0';
      this->config_store_->update_system(cfg.system);
    }
  } else if (strcmp(key, "device_location") == 0 && has_str && this->config_store_) {
    auto cfg = this->config_store_->get_config();
    char buf[sizeof(cfg.system.location)];
    strncpy(buf, str_val, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\0';
    if (strncmp(cfg.system.location, buf, sizeof(buf)) != 0) {
      strncpy(cfg.system.location, buf, sizeof(cfg.system.location));
      cfg.system.location[sizeof(cfg.system.location) - 1] = '\0';
      this->config_store_->update_system(cfg.system);
    }

  // ---- zone_name (friendly name, persisted device-side in ZoneConfig) ----
  } else if (strcmp(key, "zone_name") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_name(zi, std::string(str_val));

  // ---- zone_ble_mac ----
  } else if (strcmp(key, "zone_ble_mac") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_ble_mac(zi, std::string(str_val));

  // ---- zone_sensor_id (EXTERNAL) ----
  } else if (strcmp(key, "zone_sensor_id") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_sensor_id(zi, std::string(str_val));

  // ---- zone_sensor_name (friendly, UI only) ----
  } else if (strcmp(key, "zone_sensor_name") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_sensor_name(zi, std::string(str_val));

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

  // ---- heating_mode (normal | heat_pump) ----
  } else if (strcmp(key, "heating_mode") == 0 && has_str && this->zone_controller_) {
    this->zone_controller_->set_heating_mode(lv6::heating_profile_from_string(str_val));

  } else if (strcmp(key, "hp_overheat_margin_c") == 0 && has_num && this->zone_controller_) {
    this->zone_controller_->set_hp_overheat_margin_c(num_val);

  } else if (strcmp(key, "hp_base_pct") == 0 && has_num && this->zone_controller_) {
    this->zone_controller_->set_hp_base_pct(num_val);

  } else if (strcmp(key, "hp_trim_floor_pct") == 0 && has_num && this->zone_controller_) {
    this->zone_controller_->set_hp_trim_floor_pct(num_val);

  // ---- preheat_absorb_band_c ----
  } else if (strcmp(key, "preheat_absorb_band_c") == 0 && has_num && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_absorb_band_c = std::max(0.0f, std::min(5.0f, num_val));
    this->config_store_->update_control(ctrl);

  // ---- preheat_detect_delta_c ----
  } else if (strcmp(key, "preheat_detect_delta_c") == 0 && has_num && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_detect_delta_c = std::max(0.1f, std::min(10.0f, num_val));
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
    // Rev 3.2/3.3 endstop policy. Range checks live in sanitize_motor_cfg_(),
    // which reload_motor_config() runs, so a bad value cannot reach a trip path.
    else if (strcmp(key, "open_endstop_current_factor") == 0)
      motor_cfg.open_endstop_current_factor = num_val;
    else if (strcmp(key, "open_endstop_stall_fraction") == 0)
      motor_cfg.open_endstop_stall_fraction = num_val;
    else if (strcmp(key, "close_trailing_step_ma") == 0)
      motor_cfg.close_trailing_step_ma = num_val;
    else if (strcmp(key, "close_trailing_sustain_ms") == 0)
      motor_cfg.close_trailing_sustain_ms = static_cast<uint32_t>(std::max(0.0f, num_val));
    else if (strcmp(key, "close_trailing_ref_ms") == 0)
      motor_cfg.close_trailing_ref_ms = static_cast<uint32_t>(std::max(0.0f, num_val));
    else if (strcmp(key, "cap_close_seat_ma") == 0)
      motor_cfg.cap_close_seat_ma = num_val;
    else if (strcmp(key, "cap_close_seat_frames") == 0)
      motor_cfg.cap_close_seat_frames = static_cast<uint8_t>(std::max(0.0f, std::min(255.0f, num_val)));
    else if (strcmp(key, "cap_close_popoff_ma") == 0)
      motor_cfg.cap_close_popoff_ma = num_val;
    else if (strcmp(key, "cap_stall_ma") == 0)
      motor_cfg.cap_stall_ma = num_val;
    else if (strcmp(key, "cap_open_stop_ma") == 0)
      motor_cfg.cap_open_stop_ma = num_val;
    else if (strcmp(key, "cap_circuit_fault_ma") == 0)
      motor_cfg.cap_circuit_fault_ma = num_val;
    else if (strcmp(key, "close_runtime_limit_counts") == 0)
      motor_cfg.close_runtime_limit_counts = static_cast<uint32_t>(std::max(0.0f, num_val));
    // Working-range learning. sanitize_motor_cfg_() bounds the legs by the close
    // ceiling, so a value too large for it is pulled back rather than obeyed.
    else if (strcmp(key, "working_range_learning") == 0)
      motor_cfg.working_range_learning = num_val >= 0.5f;
    else if (strcmp(key, "learn_open_start_ripples") == 0)
      motor_cfg.learn_open_start_ripples = static_cast<uint32_t>(std::max(0.0f, num_val));
    else if (strcmp(key, "learn_open_step_ripples") == 0)
      motor_cfg.learn_open_step_ripples = static_cast<uint32_t>(std::max(0.0f, num_val));
    else if (strcmp(key, "learn_open_max_ripples") == 0)
      motor_cfg.learn_open_max_ripples = static_cast<uint32_t>(std::max(0.0f, num_val));
    else if (strcmp(key, "learn_min_free_ripples") == 0)
      motor_cfg.learn_min_free_ripples = static_cast<uint32_t>(std::max(0.0f, num_val));
    else if (strcmp(key, "learn_samples") == 0)
      motor_cfg.learn_samples = static_cast<uint8_t>(std::max(0.0f, std::min(255.0f, num_val)));
    else if (strcmp(key, "learn_max_spread_pct") == 0)
      motor_cfg.learn_max_spread_pct = static_cast<uint8_t>(std::max(0.0f, std::min(255.0f, num_val)));
    else if (strcmp(key, "pin_engage_step_ma") == 0)
      motor_cfg.pin_engage_step_ma = num_val;
    else if (strcmp(key, "pin_engage_margin_ripples") == 0)
      motor_cfg.pin_engage_margin_ripples = static_cast<uint16_t>(std::max(0.0f, std::min(5000.0f, num_val)));
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
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    entry.zone_state[i] = HISTORY_STATE_UNKNOWN;
    entry.zone_temp_dc[i] = HISTORY_TEMP_NONE;
    entry.zone_sp_dc[i] = HISTORY_TEMP_NONE;
  }
  entry.absorbing = this->zone_controller_ != nullptr
                        ? this->zone_controller_->absorb_mode_code()
                        : 0;
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
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      entry.zone_state[i] = parse_zone_display_state_code(snapshot_.zone_state[i]);
      if (std::isfinite(snapshot_.zone_temp_c[i]))
        entry.zone_temp_dc[i] =
            static_cast<int16_t>(lroundf(snapshot_.zone_temp_c[i] * 10.0f));
      // sp_plan: current effective setpoint (V6 has no local schedule; Touch
      // may later overlay planned steps client-side). No fc/fc_lo/fc_hi.
      if (std::isfinite(snapshot_.zones[i].setpoint_c))
        entry.zone_sp_dc[i] =
            static_cast<int16_t>(lroundf(snapshot_.zones[i].setpoint_c * 10.0f));
    }
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
    // Each entry is at most ~160 bytes with zone temp/sp_plan appended.
    if (offset + 180 >= BUF_SIZE) {
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
    // then zone_temp[6] and zone_sp_plan[6]. No fc/fc_lo/fc_hi: binder
    // computes the damped projection from temp history (DESIGN.md §5.9).
    char zt[lv6::NUM_ZONES][12];
    char zs[lv6::NUM_ZONES][12];
    for (uint8_t zi = 0; zi < lv6::NUM_ZONES; zi++) {
      if (e.zone_temp_dc[zi] == HISTORY_TEMP_NONE) strcpy(zt[zi], "null");
      else snprintf(zt[zi], sizeof zt[zi], "%.1f", e.zone_temp_dc[zi] / 10.0f);
      if (e.zone_sp_dc[zi] == HISTORY_TEMP_NONE) strcpy(zs[zi], "null");
      else snprintf(zs[zi], sizeof zs[zi], "%.1f", e.zone_sp_dc[zi] / 10.0f);
    }

    offset += static_cast<size_t>(snprintf(buf + offset, BUF_SIZE - offset,
        "[%lu,%u,%u,%u,%u,%u,%u,%u,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s]",
        static_cast<unsigned long>(e.uptime_s),
        static_cast<unsigned>(e.zone_state[0]),
        static_cast<unsigned>(e.zone_state[1]),
        static_cast<unsigned>(e.zone_state[2]),
        static_cast<unsigned>(e.zone_state[3]),
        static_cast<unsigned>(e.zone_state[4]),
        static_cast<unsigned>(e.zone_state[5]),
        static_cast<unsigned>(e.absorbing),
        flow_s, return_s, demand_s,
        zt[0], zt[1], zt[2], zt[3], zt[4], zt[5],
        zs[0], zs[1], zs[2], zs[3], zs[4], zs[5]));
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

/// Lines staged per copy. The ring lock is held for the copy only, never for
/// the network write, so a slow client cannot make the logger drop lines.
constexpr uint16_t LIVE_COPY_SLOTS  = 128;
constexpr uint16_t SMART_COPY_SLOTS = 32;

}  // namespace

// GET /api/v1/logs?since=<seq> — live scratch only, lines newer than <seq>.
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

// GET /api/v1/logs/download — the smart FIFO as a plain-text attachment.
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

// GET /api/v1/settings/export[?include_learned=0|1]
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

// POST /api/v1/settings/import — body is an export document.
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

void LV6Dashboard::handle_room_temperatures_(AsyncWebServerRequest *request, const char *body) {
  if (!this->authorize_write_(request))
    return;
  if (this->zone_controller_ == nullptr) {
    this->send_v1_(request, 503, "unavailable", "Zone controller unavailable");
    return;
  }
  if (body == nullptr || body[0] == '\0') {
    this->send_v1_(request, 400, "missing_body", "JSON body required");
    return;
  }

  // Light per-minute budget separate from settings writes (hubs may POST often).
  static uint32_t room_temp_window_ms = 0;
  static uint16_t room_temp_count = 0;
  const uint32_t now_ms = millis();
  if (static_cast<int32_t>(now_ms - room_temp_window_ms) >= 60000) {
    room_temp_window_ms = now_ms;
    room_temp_count = 0;
  }
  if (room_temp_count >= 120) {
    this->send_v1_(request, 429, "rate_limited", "Too many room-temperature posts");
    return;
  }
  room_temp_count++;

  char sensor_id[lv6::SENSOR_ID_LEN]{};
  parse_text_param(request, body, "sensor_id", "", sensor_id, sizeof(sensor_id));
  if (sensor_id[0] == '\0') {
    this->send_v1_(request, 400, "missing_param", "sensor_id is required");
    return;
  }
  float temp_c = NAN;
  if (!parse_num_param(request, body, "temp_c", &temp_c) || !std::isfinite(temp_c)) {
    this->send_v1_(request, 400, "missing_param", "temp_c is required");
    return;
  }
  float observed = 0.0f;
  int64_t observed_at_ms = 0;
  if (parse_num_param(request, body, "observed_at_ms", &observed) && std::isfinite(observed) &&
      observed > 0.0f) {
    observed_at_ms = static_cast<int64_t>(observed);
  }

  const int8_t matched =
      this->zone_controller_->apply_external_room_temperature(sensor_id, temp_c, observed_at_ms);
  if (matched < 0) {
    // Unbound or rejected — no-op success so one producer can broadcast all sensors.
    char response[192];
    snprintf(response, sizeof(response),
             "{\"ok\":true,\"version\":\"v1\",\"data\":{\"applied\":false,"
             "\"sensor_id\":\"%s\",\"reason\":\"unbound_or_rejected\"}}",
             sensor_id);
    send_text_(request, 200, "application/json", response, false, "no-cache");
    return;
  }

  if (data_revision_ != UINT32_MAX)
    data_revision_++;
  char response[224];
  snprintf(response, sizeof(response),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"applied\":true,\"zone\":%u,"
           "\"sensor_id\":\"%s\",\"temp_c\":%.2f,\"data_revision\":%lu}}",
           static_cast<unsigned>(matched + 1), sensor_id, temp_c,
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
