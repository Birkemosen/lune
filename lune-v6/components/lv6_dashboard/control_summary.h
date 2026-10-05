// =============================================================================
// Control summary — a coarse fingerprint of what a coordinator acts on
// (pure C++, host-testable)
// =============================================================================
// Lune Touch polls every V6 every 15 s. Most polls return the same picture:
// temperatures drift by hundredths, valves by a percent. GET /api/v1/summary
// returns a fingerprint of the state at *control* resolution — zone state,
// temperature in 0.2 °C steps, valve in 5 % steps, setpoints, coordinator
// offsets, absorb, heating mode, heat-demand recommendation, lease and the
// config revision. Touch fetches /overview + /zones only when the fingerprint
// changes (and at least once a minute), so a change such as a zone starting to
// call is seen within one 15 s tick, with far less HTTP and JSON work on both
// devices. `/revision` stays as is: it tracks display resolution for the UI.
// =============================================================================

#pragma once

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstring>

namespace lv6_summary {

static constexpr size_t MAX_ZONES = 6;

struct ZoneInput {
  const char *state = "";      ///< zone state text (calling/idle/fault/learning/…)
  bool enabled = false;
  float temp_c = NAN;
  float valve_pct = NAN;
  float effective_setpoint_c = NAN;
  float coordinator_offset_c = NAN;
  bool absorb_armed = false;
  bool motor_fault = false;
};

struct Input {
  ZoneInput zones[MAX_ZONES]{};
  uint8_t absorb_mode = 0;          ///< 0 idle, 1 reactive, 2 armed
  uint8_t heating_mode = 0;
  uint8_t effective_heating_mode = 0;
  uint8_t recommendation = 0;       ///< heat-demand recommendation enum
  int8_t critical_zone = -1;
  bool demand_headroom = false;
  bool lease_active = false;
  uint32_t data_revision = 0;       ///< config / command writes
};

/// Quantise a value to `step`; NaN maps to a fixed sentinel.
inline int32_t quantise(float v, float step) {
  if (!std::isfinite(v))
    return INT32_MIN;
  return static_cast<int32_t>(std::lround(v / step));
}

struct Fnv {
  uint32_t h = 2166136261u;
  void byte(uint8_t b) {
    h ^= b;
    h *= 16777619u;
  }
  void u32(uint32_t v) {
    for (int i = 0; i < 4; i++)
      byte(static_cast<uint8_t>(v >> (8 * i)));
  }
  void i32(int32_t v) { u32(static_cast<uint32_t>(v)); }
  void str(const char *s) {
    if (s != nullptr)
      for (; *s != '\0'; ++s)
        byte(static_cast<uint8_t>(*s));
    byte(0);
  }
};

inline uint32_t fingerprint(const Input &in) {
  Fnv f;
  for (size_t i = 0; i < MAX_ZONES; i++) {
    const ZoneInput &z = in.zones[i];
    f.str(z.state);
    f.byte(static_cast<uint8_t>((z.enabled ? 1 : 0) | (z.absorb_armed ? 2 : 0) | (z.motor_fault ? 4 : 0)));
    f.i32(quantise(z.temp_c, 0.2f));
    f.i32(quantise(z.valve_pct, 5.0f));
    f.i32(quantise(z.effective_setpoint_c, 0.1f));
    f.i32(quantise(z.coordinator_offset_c, 0.1f));
  }
  f.byte(in.absorb_mode);
  f.byte(in.heating_mode);
  f.byte(in.effective_heating_mode);
  f.byte(in.recommendation);
  f.byte(static_cast<uint8_t>(in.critical_zone));
  f.byte(static_cast<uint8_t>((in.demand_headroom ? 1 : 0) | (in.lease_active ? 2 : 0)));
  f.u32(in.data_revision);
  return f.h;
}

/// Parse the `since` query value (8 hex digits as returned in `rev`).
inline bool parse_rev(const char *text, uint32_t *out) {
  if (text == nullptr || out == nullptr || text[0] == '\0')
    return false;
  uint32_t v = 0;
  size_t n = 0;
  for (const char *p = text; *p != '\0'; ++p, ++n) {
    const char c = *p;
    uint32_t d;
    if (c >= '0' && c <= '9')
      d = static_cast<uint32_t>(c - '0');
    else if (c >= 'a' && c <= 'f')
      d = static_cast<uint32_t>(c - 'a' + 10);
    else if (c >= 'A' && c <= 'F')
      d = static_cast<uint32_t>(c - 'A' + 10);
    else
      return false;
    if (n >= 8)
      return false;
    v = (v << 4) | d;
  }
  *out = v;
  return true;
}

}  // namespace lv6_summary
