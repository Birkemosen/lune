#include "settings_backup.h"

#include <cmath>
#include <cstdarg>
#include <cstdio>
#include <cstdlib>
#include <cstring>

namespace esphome {
namespace lv6_dashboard {
namespace settings_backup {

namespace {

// =============================================================================
// Output buffer
// =============================================================================

struct Buf {
  char *out{nullptr};
  size_t cap{0};
  size_t len{0};
  bool ok{true};

  void addf(const char *fmt, ...) __attribute__((format(printf, 2, 3))) {
    if (!ok || cap == 0 || len >= cap - 1) {
      ok = false;
      return;
    }
    va_list ap;
    va_start(ap, fmt);
    const int n = std::vsnprintf(out + len, cap - len, fmt, ap);
    va_end(ap);
    if (n < 0 || static_cast<size_t>(n) >= cap - len) {
      ok = false;
      return;
    }
    len += static_cast<size_t>(n);
  }

  void add_raw(char c) {
    if (!ok)
      return;
    if (len + 1 >= cap) {
      ok = false;
      return;
    }
    out[len++] = c;
    out[len] = '\0';
  }

  /// Emits a JSON string literal including its surrounding quotes.
  void add_quoted(const char *s) {
    add_raw('"');
    for (const char *p = s ? s : ""; *p != '\0' && ok; p++) {
      const unsigned char c = static_cast<unsigned char>(*p);
      switch (c) {
        case '"': addf("\\\""); break;
        case '\\': addf("\\\\"); break;
        case '\n': addf("\\n"); break;
        case '\r': addf("\\r"); break;
        case '\t': addf("\\t"); break;
        default:
          if (c < 0x20)
            addf("\\u%04x", c);
          else
            add_raw(static_cast<char>(c));
          break;
      }
    }
    add_raw('"');
  }

  void key_str(const char *key, const char *value) {
    addf("\"%s\":", key);
    add_quoted(value);
  }

  void key_num(const char *key, double value) {
    if (!std::isfinite(value))
      addf("\"%s\":null", key);
    else
      addf("\"%s\":%.6g", key, value);
  }

  void key_int(const char *key, long long value) { addf("\"%s\":%lld", key, value); }

  void key_bool(const char *key, bool value) { addf("\"%s\":%s", key, value ? "true" : "false"); }
};

// =============================================================================
// Enum <-> string
// =============================================================================

bool ieq(const char *a, const char *b) {
  for (;; a++, b++) {
    unsigned char ca = static_cast<unsigned char>(*a);
    unsigned char cb = static_cast<unsigned char>(*b);
    if (ca >= 'A' && ca <= 'Z')
      ca = static_cast<unsigned char>(ca - 'A' + 'a');
    if (cb >= 'A' && cb <= 'Z')
      cb = static_cast<unsigned char>(cb - 'A' + 'a');
    if (ca != cb)
      return false;
    if (ca == '\0')
      return true;
  }
}

const char *manifold_type_str(lv6::ManifoldType t) {
  return t == lv6::ManifoldType::NC ? "NC" : "NO";
}

bool parse_manifold_type(const char *s, lv6::ManifoldType *out) {
  if (ieq(s, "NO")) { *out = lv6::ManifoldType::NO; return true; }
  if (ieq(s, "NC")) { *out = lv6::ManifoldType::NC; return true; }
  return false;
}

const char *motor_profile_str(lv6::MotorProfile p) {
  switch (p) {
    case lv6::MotorProfile::GENERIC: return "GENERIC";
    case lv6::MotorProfile::HMIP_VDMOT: return "HMIP_VDMOT";
    case lv6::MotorProfile::INHERIT:
    default: return "INHERIT";
  }
}

bool parse_motor_profile(const char *s, lv6::MotorProfile *out) {
  if (ieq(s, "INHERIT")) { *out = lv6::MotorProfile::INHERIT; return true; }
  if (ieq(s, "GENERIC")) { *out = lv6::MotorProfile::GENERIC; return true; }
  if (ieq(s, "HMIP_VDMOT") || ieq(s, "HmIP VdMot")) { *out = lv6::MotorProfile::HMIP_VDMOT; return true; }
  return false;
}

const char *balance_mode_str(lv6::BalanceMode m) {
  switch (m) {
    case lv6::BalanceMode::RETURN_TEMP: return "RETURN_TEMP";
    case lv6::BalanceMode::ADAPTIVE: return "ADAPTIVE";
    case lv6::BalanceMode::STATIC:
    default: return "STATIC";
  }
}

bool parse_balance_mode(const char *s, lv6::BalanceMode *out) {
  if (ieq(s, "STATIC")) { *out = lv6::BalanceMode::STATIC; return true; }
  if (ieq(s, "RETURN_TEMP")) { *out = lv6::BalanceMode::RETURN_TEMP; return true; }
  if (ieq(s, "ADAPTIVE")) { *out = lv6::BalanceMode::ADAPTIVE; return true; }
  return false;
}

struct PipeTypeName {
  const char *name;
  lv6::PipeType value;
};

const PipeTypeName PIPE_TYPES[] = {
    {"PEX_12X2", lv6::PipeType::PEX_12X2},
    {"PEX_14X2", lv6::PipeType::PEX_14X2},
    {"PEX_16X2", lv6::PipeType::PEX_16X2},
    {"PEX_17X2", lv6::PipeType::PEX_17X2},
    {"PEX_18X2", lv6::PipeType::PEX_18X2},
    {"PEX_20X2", lv6::PipeType::PEX_20X2},
    {"ALUPEX_16X2", lv6::PipeType::ALUPEX_16X2},
    {"ALUPEX_20X2", lv6::PipeType::ALUPEX_20X2},
};

const char *pipe_type_str(lv6::PipeType t) {
  for (const auto &e : PIPE_TYPES) {
    if (e.value == t)
      return e.name;
  }
  return "PEX_16X2";
}

bool parse_pipe_type(const char *s, lv6::PipeType *out) {
  for (const auto &e : PIPE_TYPES) {
    if (ieq(s, e.name)) {
      *out = e.value;
      return true;
    }
  }
  return false;
}

const char *temp_source_str(lv6::TempSource s) {
  switch (s) {
    case lv6::TempSource::BLE_SENSOR: return "BLE_SENSOR";
    case lv6::TempSource::EXTERNAL: return "EXTERNAL";
    default: return "LOCAL_PROBE";
  }
}

bool parse_temp_source(const char *s, lv6::TempSource *out) {
  if (ieq(s, "LOCAL_PROBE") || ieq(s, "Local Probe")) { *out = lv6::TempSource::LOCAL_PROBE; return true; }
  if (ieq(s, "BLE_SENSOR") || ieq(s, "BLE")) { *out = lv6::TempSource::BLE_SENSOR; return true; }
  if (ieq(s, "EXTERNAL") || ieq(s, "External")) { *out = lv6::TempSource::EXTERNAL; return true; }
  return false;
}

// =============================================================================
// Minimal JSON reader
//
// Same spirit as the json_get_* helpers in lv6_dashboard.cpp, but span-scoped
// so a key is only matched at the depth it is looked up at. No allocation, no
// document model: values are located on demand.
// =============================================================================

struct Span {
  const char *b{nullptr};
  const char *e{nullptr};
  bool empty() const { return b == nullptr || b >= e; }
  char first() const { return b < e ? *b : '\0'; }
};

bool is_ws(char c) { return c == ' ' || c == '\t' || c == '\n' || c == '\r'; }

const char *skip_ws(const char *p, const char *e) {
  while (p < e && is_ws(*p))
    p++;
  return p;
}

/// Returns the position just past the value starting at `p`.
const char *skip_value(const char *p, const char *e) {
  p = skip_ws(p, e);
  if (p >= e)
    return e;
  if (*p == '"') {
    p++;
    while (p < e) {
      if (*p == '\\') {
        p += 2;
        continue;
      }
      if (*p == '"')
        return p + 1;
      p++;
    }
    return e;
  }
  if (*p == '{' || *p == '[') {
    const char open = *p;
    const char close = (open == '{') ? '}' : ']';
    int depth = 0;
    while (p < e) {
      if (*p == '"') {
        p = skip_value(p, e);
        continue;
      }
      if (*p == open) {
        depth++;
      } else if (*p == close) {
        depth--;
        if (depth == 0)
          return p + 1;
      }
      p++;
    }
    return e;
  }
  while (p < e && *p != ',' && *p != '}' && *p != ']' && !is_ws(*p))
    p++;
  return p;
}

/// Inner span of an object/array value (contents between the brackets).
Span inner(Span v) {
  if (v.empty())
    return Span{};
  const char c = v.first();
  if (c != '{' && c != '[')
    return Span{};
  return Span{v.b + 1, v.e > v.b + 1 ? v.e - 1 : v.b + 1};
}

struct MemberIter {
  const char *p{nullptr};
  const char *e{nullptr};
};

MemberIter members_of(Span obj_inner) { return MemberIter{obj_inner.b, obj_inner.e}; }

bool next_member(MemberIter &it, Span *key, Span *value) {
  while (true) {
    it.p = skip_ws(it.p, it.e);
    if (it.p >= it.e)
      return false;
    if (*it.p == ',') {
      it.p++;
      continue;
    }
    if (*it.p != '"')
      return false;  // malformed; stop rather than guess
    const char *key_end_quote = skip_value(it.p, it.e);
    if (key_end_quote <= it.p + 1)
      return false;
    key->b = it.p + 1;
    key->e = key_end_quote - 1;
    const char *p = skip_ws(key_end_quote, it.e);
    if (p >= it.e || *p != ':')
      return false;
    value->b = skip_ws(p + 1, it.e);
    value->e = skip_value(value->b, it.e);
    it.p = value->e;
    return true;
  }
}

bool key_is(const Span &key, const char *name) {
  const size_t len = std::strlen(name);
  return static_cast<size_t>(key.e - key.b) == len && std::strncmp(key.b, name, len) == 0;
}

bool member(Span obj, const char *name, Span *out) {
  MemberIter it = members_of(obj);
  Span k{}, v{};
  while (next_member(it, &k, &v)) {
    if (key_is(k, name)) {
      *out = v;
      return true;
    }
  }
  return false;
}

/// Object/array member, already unwrapped to its inner span.
bool member_inner(Span obj, const char *name, Span *out) {
  Span v{};
  if (!member(obj, name, &v))
    return false;
  const Span in = inner(v);
  if (in.b == nullptr)
    return false;
  *out = in;
  return true;
}

bool array_element(Span arr_inner, size_t index, Span *out) {
  const char *p = arr_inner.b;
  size_t i = 0;
  while (true) {
    p = skip_ws(p, arr_inner.e);
    if (p >= arr_inner.e)
      return false;
    if (*p == ',') {
      p++;
      continue;
    }
    const char *end = skip_value(p, arr_inner.e);
    if (end <= p)
      return false;
    if (i == index) {
      *out = Span{p, end};
      return true;
    }
    i++;
    p = end;
  }
}

/// Copies an escaped JSON string value into a plain buffer.
bool span_to_cstr(Span v, char *out, size_t cap) {
  if (cap == 0 || v.empty() || v.first() != '"')
    return false;
  size_t o = 0;
  for (const char *p = v.b + 1; p < v.e - 1 && o + 1 < cap; p++) {
    char c = *p;
    if (c == '\\' && p + 1 < v.e - 1) {
      p++;
      switch (*p) {
        case 'n': c = '\n'; break;
        case 'r': c = '\r'; break;
        case 't': c = '\t'; break;
        case 'b': c = '\b'; break;
        case 'f': c = '\f'; break;
        case 'u': {
          // Only the ASCII range survives; anything else becomes '?'.
          char hex[5] = {};
          for (int i = 0; i < 4 && p + 1 < v.e - 1; i++)
            hex[i] = *++p;
          const long cp = std::strtol(hex, nullptr, 16);
          c = (cp > 0 && cp < 0x80) ? static_cast<char>(cp) : '?';
          break;
        }
        default: c = *p; break;
      }
    }
    out[o++] = c;
  }
  out[o] = '\0';
  return true;
}

bool span_to_double(Span v, double *out) {
  if (v.empty())
    return false;
  const char c = v.first();
  if (c != '-' && c != '+' && c != '.' && !(c >= '0' && c <= '9'))
    return false;
  char tmp[40];
  const size_t len = static_cast<size_t>(v.e - v.b);
  if (len == 0 || len >= sizeof(tmp))
    return false;
  std::memcpy(tmp, v.b, len);
  tmp[len] = '\0';
  char *end = nullptr;
  const double d = std::strtod(tmp, &end);
  if (end == tmp || !std::isfinite(d))
    return false;
  *out = d;
  return true;
}

bool span_to_bool(Span v, bool *out) {
  if (v.empty())
    return false;
  const size_t len = static_cast<size_t>(v.e - v.b);
  if (len == 4 && std::strncmp(v.b, "true", 4) == 0) { *out = true; return true; }
  if (len == 5 && std::strncmp(v.b, "false", 5) == 0) { *out = false; return true; }
  double d = 0.0;
  if (span_to_double(v, &d)) {
    *out = std::fabs(d) > 0.001;
    return true;
  }
  return false;
}

// =============================================================================
// Clamped field application
// =============================================================================

double clampd(double v, double lo, double hi) { return v < lo ? lo : (v > hi ? hi : v); }

bool apply_float(Span obj, const char *key, float &dst, double lo, double hi, uint16_t &applied) {
  Span v{};
  double d = 0.0;
  if (!member(obj, key, &v) || !span_to_double(v, &d))
    return false;
  dst = static_cast<float>(clampd(d, lo, hi));
  applied++;
  return true;
}

/// Sentinel-aware variant: `sentinel` (typically -1 = "not commissioned") is
/// accepted verbatim, anything else is clamped into [lo, hi].
bool apply_float_sentinel(Span obj, const char *key, float &dst, double sentinel, double lo,
                          double hi, uint16_t &applied) {
  Span v{};
  double d = 0.0;
  if (!member(obj, key, &v) || !span_to_double(v, &d))
    return false;
  dst = static_cast<float>(std::fabs(d - sentinel) < 1e-6 ? sentinel : clampd(d, lo, hi));
  applied++;
  return true;
}

template<typename T>
bool apply_int(Span obj, const char *key, T &dst, double lo, double hi, uint16_t &applied) {
  Span v{};
  double d = 0.0;
  if (!member(obj, key, &v) || !span_to_double(v, &d))
    return false;
  dst = static_cast<T>(clampd(d < 0 ? -std::floor(-d + 0.5) : std::floor(d + 0.5), lo, hi));
  applied++;
  return true;
}

bool apply_bool(Span obj, const char *key, bool &dst, uint16_t &applied) {
  Span v{};
  bool b = false;
  if (!member(obj, key, &v) || !span_to_bool(v, &b))
    return false;
  dst = b;
  applied++;
  return true;
}

bool apply_str(Span obj, const char *key, char *dst, size_t cap, uint16_t &applied) {
  Span v{};
  char tmp[64];
  if (!member(obj, key, &v) || !span_to_cstr(v, tmp, sizeof(tmp)))
    return false;
  std::snprintf(dst, cap, "%s", tmp);
  applied++;
  return true;
}

bool read_enum_str(Span obj, const char *key, char *tmp, size_t cap) {
  Span v{};
  return member(obj, key, &v) && span_to_cstr(v, tmp, cap);
}

uint16_t count_unknown(Span obj, const char *const *known, size_t known_count) {
  uint16_t unknown = 0;
  MemberIter it = members_of(obj);
  Span k{}, v{};
  while (next_member(it, &k, &v)) {
    bool found = false;
    for (size_t i = 0; i < known_count && !found; i++)
      found = key_is(k, known[i]);
    if (!found)
      unknown++;
  }
  return unknown;
}

ImportResult fail(const char *code, const char *message) {
  ImportResult r{};
  r.ok = false;
  std::snprintf(r.error_code, sizeof(r.error_code), "%s", code);
  std::snprintf(r.error_message, sizeof(r.error_message), "%s", message);
  return r;
}

}  // namespace

// =============================================================================
// Export
// =============================================================================

size_t write_export_json(char *out, size_t out_cap, const lv6::DeviceConfig &cfg,
                         const char *firmware_version,
                         const lv6::MotorTelemetry learned[lv6::NUM_ZONES], bool has_learned,
                         const uint64_t probe_addrs[lv6::MAX_PROBES], const ExportOptions &opt) {
  if (out == nullptr || out_cap == 0)
    return 0;
  out[0] = '\0';

  Buf b{out, out_cap, 0, true};

  b.addf("{");
  b.key_str("_type", EXPORT_TYPE);
  b.addf(",");
  b.key_int("_version", EXPORT_SCHEMA_VERSION);
  b.addf(",");
  b.key_str("firmware", firmware_version ? firmware_version : "");

  b.addf(",\"config_versions\":{");
  b.key_int("zone", lv6::ZONE_CONFIG_VERSION);
  b.addf(",");
  b.key_int("motor", lv6::MOTOR_CONFIG_VERSION);
  b.addf(",");
  b.key_int("sensor", lv6::SENSOR_CONFIG_VERSION);
  b.addf(",");
  b.key_int("system", lv6::SYSTEM_CONFIG_VERSION);
  b.addf(",");
  b.key_int("control", lv6::CONTROL_CONFIG_VERSION);
  b.addf(",");
  b.key_int("probe", lv6::PROBE_CONFIG_VERSION);
  b.addf(",");
  b.key_int("pid", lv6::PID_CONFIG_VERSION);
  b.addf(",");
  b.key_int("manifold", lv6::MANIFOLD_CONFIG_VERSION);
  b.addf(",");
  b.key_int("balancing", lv6::BALANCING_CONFIG_VERSION);
  b.addf("}");

  // Identity is informational only — it is never applied on import, and the
  // shared key is never written here at all.
  b.addf(",\"metadata\":{\"authority\":{");
  b.key_str("installation_id", cfg.authority.installation_id);
  b.addf(",");
  b.key_str("coordinator_id", cfg.authority.coordinator_id);
  b.addf("}}");

  b.addf(",\"settings\":{");

  b.addf("\"manifold\":{");
  b.key_str("type", manifold_type_str(cfg.manifold_type));
  b.addf("}");

  const lv6::MotorConfig &m = cfg.motor;
  b.addf(",\"motor\":{");
  b.key_str("default_profile", motor_profile_str(m.default_profile));
  b.addf(",");
  b.key_num("close_current_factor", m.close_current_factor);
  b.addf(",");
  b.key_num("close_slope_threshold_ma_per_s", m.close_slope_threshold_ma_per_s);
  b.addf(",");
  b.key_num("close_slope_current_factor", m.close_slope_current_factor);
  b.addf(",");
  b.key_num("open_current_factor", m.open_current_factor);
  b.addf(",");
  b.key_num("open_slope_threshold_ma_per_s", m.open_slope_threshold_ma_per_s);
  b.addf(",");
  b.key_num("open_slope_current_factor", m.open_slope_current_factor);
  b.addf(",");
  b.key_num("open_ripple_limit_factor", m.open_ripple_limit_factor);
  b.addf(",");
  b.key_num("pin_engage_step_ma", m.pin_engage_step_ma);
  b.addf(",");
  b.key_int("pin_engage_margin_ripples", m.pin_engage_margin_ripples);
  b.addf(",");
  b.key_int("generic_profile_runtime_limit_s", m.generic_profile_runtime_limit_s);
  b.addf(",");
  b.key_int("hmip_vdmot_runtime_limit_s", m.hmip_vdmot_runtime_limit_s);
  b.addf(",");
  b.key_int("relearn_after_movements", m.relearn_after_movements);
  b.addf(",");
  b.key_int("relearn_after_hours", m.relearn_after_hours);
  b.addf(",");
  b.key_int("learned_factor_min_samples", m.learned_factor_min_samples);
  b.addf(",");
  b.key_num("learned_factor_max_deviation_pct", m.learned_factor_max_deviation_pct);
  b.addf(",");
  b.key_bool("auto_apply_learned_factors", m.auto_apply_learned_factors);
  // Rev 3.2 endstop policy.
  b.addf(",");
  b.key_int("rev32_motion_decision_ms", m.rev32_motion_decision_ms);
  b.addf(",");
  b.key_int("stall_plateau_factor_x10", m.stall_plateau_factor_x10);
  b.addf(",");
  b.key_int("stall_plateau_floor_ms", m.stall_plateau_floor_ms);
  b.addf(",");
  b.key_int("stall_plateau_ceiling_ms", m.stall_plateau_ceiling_ms);
  b.addf(",");
  b.key_int("endpoint_window_tolerance_pct", m.endpoint_window_tolerance_pct);
  b.addf(",");
  b.key_num("open_endstop_current_factor", m.open_endstop_current_factor);
  b.addf(",");
  b.key_int("contact_recovery_ripples", m.contact_recovery_ripples);
  b.addf("}");

  const lv6::ControlConfig &c = cfg.control;
  b.addf(",\"control\":{");
  b.key_num("comfort_band_c", c.comfort_band_c);
  b.addf(",");
  b.key_num("min_valve_opening_pct", c.min_valve_opening_pct);
  b.addf(",");
  b.key_bool("simple_preheat_enabled", c.simple_preheat_enabled);
  b.addf(",");
  b.key_bool("preheat_absorb_enabled", c.preheat_absorb_enabled);
  b.addf(",");
  b.key_num("preheat_absorb_band_c", c.preheat_absorb_band_c);
  b.addf(",");
  b.key_num("preheat_detect_delta_c", c.preheat_detect_delta_c);
  b.addf("}");

  const lv6::BalancingConfig &bal = cfg.balancing;
  b.addf(",\"balancing\":{");
  b.key_bool("secondary_flow_commissioning_enabled", bal.secondary_flow_commissioning_enabled);
  b.addf(",");
  b.key_num("secondary_min_total_opening_pct", bal.secondary_min_total_opening_pct);
  b.addf(",");
  b.key_str("mode", balance_mode_str(bal.mode));
  b.addf("}");

  b.addf(",\"sensor\":{");
  b.key_bool("ble_clock_sync_enabled", cfg.sensor_config.ble_clock_sync_enabled);
  b.addf(",");
  b.key_int("ble_clock_sync_interval_min", cfg.sensor_config.ble_clock_sync_interval_min);
  b.addf("}");

  b.addf(",\"probes\":{");
  b.key_int("manifold_flow_probe", cfg.probes.manifold_flow_probe);
  b.addf(",");
  b.key_int("manifold_return_probe", cfg.probes.manifold_return_probe);
  b.addf(",\"zone_return_probe\":[");
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++)
    b.addf("%s%d", i ? "," : "", static_cast<int>(cfg.probes.zone_return_probe[i]));
  b.addf("]}");

  if (probe_addrs != nullptr) {
    b.addf(",\"probe_addresses\":[");
    for (uint8_t i = 0; i < lv6::MAX_PROBES; i++)
      b.addf("%s\"0x%016llx\"", i ? "," : "",
             static_cast<unsigned long long>(probe_addrs[i]));
    b.addf("]");
  }

  b.addf(",\"zones\":[");
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    const lv6::ZoneConfig &z = cfg.zones[i];
    b.addf("%s{", i ? "," : "");
    b.key_int("index", i + 1);
    b.addf(",");
    b.key_str("name", z.name);
    b.addf(",");
    b.key_bool("enabled", z.enabled);
    b.addf(",");
    b.key_num("setpoint_c", z.setpoint_c);
    b.addf(",");
    b.key_num("area_m2", z.area_m2);
    b.addf(",");
    b.key_num("pipe_spacing_mm", z.pipe_spacing_mm);
    b.addf(",");
    b.key_str("pipe_type", pipe_type_str(z.pipe_type));
    b.addf(",");
    b.key_str("temp_source", temp_source_str(cfg.sensor_config.zone_temp_source[i]));
    b.addf(",");
    b.key_str("ble_mac", cfg.sensor_config.zone_ble_mac[i]);
    b.addf(",");
    b.key_str("sensor_id", cfg.sensor_config.zone_sensor_id[i]);
    b.addf(",");
    b.key_str("sensor_name", cfg.sensor_config.zone_sensor_name[i]);
    b.addf(",");
    b.key_int("sync_to_zone", z.sync_to_zone);
    b.addf(",");
    b.key_str("motor_profile_override", motor_profile_str(z.motor_profile_override));
    b.addf(",");
    b.key_num("min_offset_c", z.min_offset_c);
    b.addf(",");
    b.key_num("max_offset_c", z.max_offset_c);
    b.addf(",");
    b.key_num("abs_min_c", z.abs_min_c);
    b.addf(",");
    b.key_num("abs_max_c", z.abs_max_c);
    // Hydraulic commissioning identity (zone blob v4+).
    b.addf(",");
    b.key_str("manifold_id", z.manifold_id);
    b.addf(",");
    b.key_int("manifold_port", z.manifold_port);
    b.addf(",");
    b.key_str("room_id", z.room_id);
    b.addf(",");
    b.key_num("loop_pipe_length_m", z.loop_pipe_length_m);
    b.addf(",");
    b.key_num("design_flow_l_h", z.design_flow_l_h);
    b.addf(",");
    b.key_num("measured_flow_l_h", z.measured_flow_l_h);
    b.addf(",");
    b.key_num("actuator_calibration_pct", z.actuator_calibration_pct);
    b.addf(",");
    b.key_num("expected_thermal_delay_min", z.expected_thermal_delay_min);
    b.addf("}");
  }
  b.addf("]");

  b.addf("}");  // settings

  if (opt.include_learned && has_learned && learned != nullptr) {
    b.addf(",\"learned\":{\"zones\":[");
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      const lv6::MotorTelemetry &t = learned[i];
      b.addf("%s{", i ? "," : "");
      b.key_int("index", i + 1);
      b.addf(",");
      b.key_int("open_ripples", t.learned_open_ripples);
      b.addf(",");
      b.key_int("close_ripples", t.learned_close_ripples);
      b.addf(",");
      b.key_num("open_factor", t.learned_open_current_factor);
      b.addf(",");
      b.key_num("close_factor", t.learned_close_current_factor);
      b.addf("}");
    }
    b.addf("]}");
  }

  b.addf("}");

  if (!b.ok) {
    out[0] = '\0';
    return 0;
  }
  return b.len;
}

// =============================================================================
// Import
// =============================================================================

ImportResult apply_import_json(const char *json, lv6::DeviceConfig &cfg, bool restore_learned,
                               lv6::MotorTelemetry learned_out[lv6::NUM_ZONES],
                               bool *learned_applied, uint64_t probe_addrs_out[lv6::MAX_PROBES],
                               bool *probes_applied) {
  if (learned_applied != nullptr)
    *learned_applied = false;
  if (probes_applied != nullptr)
    *probes_applied = false;

  if (json == nullptr || json[0] == '\0')
    return fail("bad_json", "empty document");

  const Span doc_value{json, json + std::strlen(json)};
  const char *p = skip_ws(doc_value.b, doc_value.e);
  if (p >= doc_value.e || *p != '{')
    return fail("bad_json", "document is not a JSON object");
  const Span root = inner(Span{p, skip_value(p, doc_value.e)});
  if (root.b == nullptr)
    return fail("bad_json", "unterminated JSON object");

  char text[64];
  if (!read_enum_str(root, "_type", text, sizeof(text)))
    return fail("bad_type", "missing _type");
  if (std::strcmp(text, EXPORT_TYPE) != 0)
    return fail("bad_type", "not a Lune V6 settings backup");

  Span version_value{};
  double version = 0.0;
  if (!member(root, "_version", &version_value) || !span_to_double(version_value, &version))
    return fail("unsupported_version", "missing _version");
  if (version > static_cast<double>(EXPORT_SCHEMA_VERSION)) {
    ImportResult r = fail("unsupported_version", "backup is newer than this firmware");
    return r;
  }

  Span settings{};
  if (!member_inner(root, "settings", &settings))
    return fail("no_settings", "missing settings object");

  ImportResult result{};
  result.ok = true;

  // A file older than the current zone blob semantics cannot describe hydraulic
  // identity: v3 predates those fields, so restoring them would invent a
  // manifold port and commissioning results.
  uint32_t file_zone_version = lv6::ZONE_CONFIG_VERSION;
  Span config_versions{};
  if (member_inner(root, "config_versions", &config_versions)) {
    Span v{};
    double d = 0.0;
    if (member(config_versions, "zone", &v) && span_to_double(v, &d))
      file_zone_version = static_cast<uint32_t>(d);
  }
  const bool allow_hydraulic = file_zone_version >= lv6::ZONE_CONFIG_VERSION;

  static const char *const KNOWN_ROOT[] = {"_type",    "_version", "firmware", "config_versions",
                                           "metadata", "settings", "learned"};
  static const char *const KNOWN_SETTINGS[] = {"manifold",        "motor",  "control",
                                               "balancing",       "sensor", "probes",
                                               "probe_addresses", "zones",  "authority"};
  result.ignored =
      static_cast<uint16_t>(count_unknown(root, KNOWN_ROOT, sizeof(KNOWN_ROOT) / sizeof(*KNOWN_ROOT)) +
                            count_unknown(settings, KNOWN_SETTINGS,
                                          sizeof(KNOWN_SETTINGS) / sizeof(*KNOWN_SETTINGS)));

  // Identity and credentials are never restored, however the file spells them.
  Span authority{};
  if (member(settings, "authority", &authority))
    result.skipped++;

  Span node{};

  if (member_inner(settings, "manifold", &node)) {
    lv6::ManifoldType mt{};
    if (read_enum_str(node, "type", text, sizeof(text)) && parse_manifold_type(text, &mt)) {
      cfg.manifold_type = mt;
      result.applied++;
    }
  }

  if (member_inner(settings, "motor", &node)) {
    lv6::MotorConfig &m = cfg.motor;
    lv6::MotorProfile profile{};
    if (read_enum_str(node, "default_profile", text, sizeof(text)) &&
        parse_motor_profile(text, &profile) && profile != lv6::MotorProfile::INHERIT) {
      m.default_profile = profile;
      result.applied++;
    }
    apply_float(node, "close_current_factor", m.close_current_factor, 1.0, 5.0, result.applied);
    apply_float(node, "close_slope_threshold_ma_per_s", m.close_slope_threshold_ma_per_s, 0.0, 50.0,
                result.applied);
    apply_float(node, "close_slope_current_factor", m.close_slope_current_factor, 1.0, 5.0,
                result.applied);
    apply_float(node, "open_current_factor", m.open_current_factor, 1.0, 5.0, result.applied);
    apply_float(node, "open_slope_threshold_ma_per_s", m.open_slope_threshold_ma_per_s, 0.0, 50.0,
                result.applied);
    apply_float(node, "open_slope_current_factor", m.open_slope_current_factor, 1.0, 5.0,
                result.applied);
    apply_float(node, "open_ripple_limit_factor", m.open_ripple_limit_factor, 0.0, 5.0,
                result.applied);
    apply_float(node, "pin_engage_step_ma", m.pin_engage_step_ma, 0.0, 100.0, result.applied);
    apply_int(node, "pin_engage_margin_ripples", m.pin_engage_margin_ripples, 0, 5000,
              result.applied);
    apply_int(node, "generic_profile_runtime_limit_s", m.generic_profile_runtime_limit_s, 5, 300,
              result.applied);
    apply_int(node, "hmip_vdmot_runtime_limit_s", m.hmip_vdmot_runtime_limit_s, 5, 300,
              result.applied);
    apply_int(node, "relearn_after_movements", m.relearn_after_movements, 0, 1000000,
              result.applied);
    apply_int(node, "relearn_after_hours", m.relearn_after_hours, 0, 100000, result.applied);
    apply_int(node, "learned_factor_min_samples", m.learned_factor_min_samples, 1, 100,
              result.applied);
    apply_float(node, "learned_factor_max_deviation_pct", m.learned_factor_max_deviation_pct, 0.0,
                1.0, result.applied);
    apply_bool(node, "auto_apply_learned_factors", m.auto_apply_learned_factors, result.applied);
    apply_int(node, "rev32_motion_decision_ms", m.rev32_motion_decision_ms, 0, 10000,
              result.applied);
    apply_int(node, "stall_plateau_factor_x10", m.stall_plateau_factor_x10, 1, 200, result.applied);
    apply_int(node, "stall_plateau_floor_ms", m.stall_plateau_floor_ms, 10, 5000, result.applied);
    apply_int(node, "stall_plateau_ceiling_ms", m.stall_plateau_ceiling_ms, 10, 10000,
              result.applied);
    apply_int(node, "endpoint_window_tolerance_pct", m.endpoint_window_tolerance_pct, 0, 100,
              result.applied);
    apply_float(node, "open_endstop_current_factor", m.open_endstop_current_factor, 1.0, 5.0,
                result.applied);
    apply_int(node, "contact_recovery_ripples", m.contact_recovery_ripples, 0, 1000,
              result.applied);
  }

  if (member_inner(settings, "control", &node)) {
    lv6::ControlConfig &c = cfg.control;
    apply_float(node, "comfort_band_c", c.comfort_band_c, 0.1, 5.0, result.applied);
    apply_float(node, "min_valve_opening_pct", c.min_valve_opening_pct, 0.0, 100.0, result.applied);
    apply_bool(node, "simple_preheat_enabled", c.simple_preheat_enabled, result.applied);
    apply_bool(node, "preheat_absorb_enabled", c.preheat_absorb_enabled, result.applied);
    apply_float(node, "preheat_absorb_band_c", c.preheat_absorb_band_c, 0.0, 10.0, result.applied);
    apply_float(node, "preheat_detect_delta_c", c.preheat_detect_delta_c, 0.0, 40.0,
                result.applied);
  }

  if (member_inner(settings, "balancing", &node)) {
    lv6::BalancingConfig &bal = cfg.balancing;
    apply_bool(node, "secondary_flow_commissioning_enabled",
               bal.secondary_flow_commissioning_enabled, result.applied);
    apply_float(node, "secondary_min_total_opening_pct", bal.secondary_min_total_opening_pct, 0.0,
                600.0, result.applied);
    lv6::BalanceMode mode{};
    if (read_enum_str(node, "mode", text, sizeof(text)) && parse_balance_mode(text, &mode)) {
      bal.mode = mode;
      result.applied++;
    }
  }

  if (member_inner(settings, "sensor", &node)) {
    apply_bool(node, "ble_clock_sync_enabled", cfg.sensor_config.ble_clock_sync_enabled,
               result.applied);
    apply_int(node, "ble_clock_sync_interval_min", cfg.sensor_config.ble_clock_sync_interval_min, 1,
              1440, result.applied);
  }

  if (member_inner(settings, "probes", &node)) {
    const double max_probe = static_cast<double>(lv6::MAX_PROBES) - 1.0;
    apply_int(node, "manifold_flow_probe", cfg.probes.manifold_flow_probe, lv6::PROBE_UNASSIGNED,
              max_probe, result.applied);
    apply_int(node, "manifold_return_probe", cfg.probes.manifold_return_probe,
              lv6::PROBE_UNASSIGNED, max_probe, result.applied);
    Span list{};
    if (member_inner(node, "zone_return_probe", &list)) {
      for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
        Span v{};
        double d = 0.0;
        if (array_element(list, i, &v) && span_to_double(v, &d)) {
          cfg.probes.zone_return_probe[i] =
              static_cast<int8_t>(clampd(d, lv6::PROBE_UNASSIGNED, max_probe));
          result.applied++;
        }
      }
    }
  }

  if (probe_addrs_out != nullptr) {
    Span list{};
    if (member_inner(settings, "probe_addresses", &list)) {
      bool any = false;
      for (uint8_t i = 0; i < lv6::MAX_PROBES; i++) {
        Span v{};
        if (!array_element(list, i, &v) || !span_to_cstr(v, text, sizeof(text)))
          continue;
        const char *hex = text;
        if (hex[0] == '0' && (hex[1] == 'x' || hex[1] == 'X'))
          hex += 2;
        char *end = nullptr;
        const unsigned long long addr = std::strtoull(hex, &end, 16);
        if (end == hex)
          continue;
        probe_addrs_out[i] = static_cast<uint64_t>(addr);
        result.applied++;
        any = true;
      }
      if (any && probes_applied != nullptr)
        *probes_applied = true;
    }
  } else if (member(settings, "probe_addresses", &node)) {
    result.skipped++;
  }

  Span zones{};
  if (member_inner(settings, "zones", &zones)) {
    for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
      Span entry{};
      if (!array_element(zones, i, &entry))
        break;
      const Span z_json = inner(entry);
      if (z_json.b == nullptr)
        continue;
      lv6::ZoneConfig &z = cfg.zones[i];

      apply_str(z_json, "name", z.name, sizeof(z.name), result.applied);
      apply_bool(z_json, "enabled", z.enabled, result.applied);
      apply_float(z_json, "setpoint_c", z.setpoint_c, 5.0, 30.0, result.applied);
      apply_float(z_json, "area_m2", z.area_m2, 0.1, 500.0, result.applied);
      apply_float(z_json, "pipe_spacing_mm", z.pipe_spacing_mm, 50.0, 500.0, result.applied);

      lv6::PipeType pt{};
      if (read_enum_str(z_json, "pipe_type", text, sizeof(text)) && parse_pipe_type(text, &pt)) {
        z.pipe_type = pt;
        result.applied++;
      }
      lv6::TempSource ts{};
      if (read_enum_str(z_json, "temp_source", text, sizeof(text)) && parse_temp_source(text, &ts)) {
        cfg.sensor_config.zone_temp_source[i] = ts;
        result.applied++;
      }
      apply_str(z_json, "ble_mac", cfg.sensor_config.zone_ble_mac[i], lv6::BLE_MAC_LEN,
                result.applied);
      apply_str(z_json, "sensor_id", cfg.sensor_config.zone_sensor_id[i], lv6::SENSOR_ID_LEN,
                result.applied);
      apply_str(z_json, "sensor_name", cfg.sensor_config.zone_sensor_name[i], lv6::SENSOR_NAME_LEN,
                result.applied);

      apply_int(z_json, "sync_to_zone", z.sync_to_zone, -1, lv6::NUM_ZONES - 1, result.applied);
      if (z.sync_to_zone == static_cast<int8_t>(i))
        z.sync_to_zone = -1;  // a zone cannot follow itself

      lv6::MotorProfile profile{};
      if (read_enum_str(z_json, "motor_profile_override", text, sizeof(text)) &&
          parse_motor_profile(text, &profile)) {
        z.motor_profile_override = profile;
        result.applied++;
      }

      apply_float(z_json, "min_offset_c", z.min_offset_c, -10.0, 10.0, result.applied);
      apply_float(z_json, "max_offset_c", z.max_offset_c, -10.0, 10.0, result.applied);
      apply_float(z_json, "abs_min_c", z.abs_min_c, 5.0, 30.0, result.applied);
      apply_float(z_json, "abs_max_c", z.abs_max_c, 5.0, 40.0, result.applied);
      if (z.max_offset_c < z.min_offset_c)
        z.max_offset_c = z.min_offset_c;
      if (z.abs_max_c < z.abs_min_c)
        z.abs_max_c = z.abs_min_c;

      if (allow_hydraulic) {
        apply_str(z_json, "manifold_id", z.manifold_id, sizeof(z.manifold_id), result.applied);
        apply_int(z_json, "manifold_port", z.manifold_port, 0, lv6::NUM_ZONES, result.applied);
        apply_str(z_json, "room_id", z.room_id, sizeof(z.room_id), result.applied);
        apply_float_sentinel(z_json, "loop_pipe_length_m", z.loop_pipe_length_m, -1.0, 0.0, 500.0,
                             result.applied);
        apply_float_sentinel(z_json, "design_flow_l_h", z.design_flow_l_h, -1.0, 0.0, 2000.0,
                             result.applied);
        apply_float_sentinel(z_json, "measured_flow_l_h", z.measured_flow_l_h, -1.0, 0.0, 2000.0,
                             result.applied);
        apply_float_sentinel(z_json, "actuator_calibration_pct", z.actuator_calibration_pct, -1.0,
                             0.0, 100.0, result.applied);
        apply_float_sentinel(z_json, "expected_thermal_delay_min", z.expected_thermal_delay_min,
                             -1.0, 0.0, 600.0, result.applied);
      } else {
        static const char *const HYDRAULIC[] = {
            "manifold_id",      "manifold_port",           "room_id",
            "loop_pipe_length_m", "design_flow_l_h",       "measured_flow_l_h",
            "actuator_calibration_pct", "expected_thermal_delay_min"};
        Span present{};
        for (const char *key : HYDRAULIC) {
          if (member(z_json, key, &present))
            result.skipped++;
        }
      }
    }
  }

  Span learned_zones{};
  Span learned_node{};
  if (member(root, "learned", &learned_node) &&
      member_inner(inner(learned_node), "zones", &learned_zones)) {
    // Learned endstop data describes the motor policy that produced it, so a
    // backup written under a different motor blob version can be misleading.
    // restore_learned is the caller's explicit consent to take it anyway.
    if (learned_out == nullptr || !restore_learned) {
      result.skipped++;
    } else {
      bool any = false;
      for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
        Span entry{};
        if (!array_element(learned_zones, i, &entry))
          break;
        const Span l = inner(entry);
        if (l.b == nullptr)
          continue;
        lv6::MotorTelemetry &t = learned_out[i];
        any |= apply_int(l, "open_ripples", t.learned_open_ripples, 0, 1000000, result.applied);
        any |= apply_int(l, "close_ripples", t.learned_close_ripples, 0, 1000000, result.applied);
        any |= apply_float(l, "open_factor", t.learned_open_current_factor, 0.0, 5.0,
                           result.applied);
        any |= apply_float(l, "close_factor", t.learned_close_current_factor, 0.0, 5.0,
                           result.applied);
      }
      if (any && learned_applied != nullptr)
        *learned_applied = true;
    }
  }

  if (result.applied == 0)
    return fail("no_settings", "no known settings found in backup");

  return result;
}

}  // namespace settings_backup
}  // namespace lv6_dashboard
}  // namespace esphome
