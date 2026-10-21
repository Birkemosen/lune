#pragma once

#include "../lv6_config_store/lv6_types.h"

#include <algorithm>
#include <cmath>
#include <cstdint>

// Anticipated reopening of a loop closed because its room is warm.
//
// A floor answers 1–3 h after its valve opens, so a room that waits for its
// measured temperature to cross the reopen point keeps falling for hours and
// undershoots. Instead the loop reopens on the temperature expected one floor
// lag ahead (measured fall × lag), and the lag is stretched the longer the loop
// has been closed: the slab has given up more of its stored heat and takes
// longer to recharge. The reopened loop starts at the gentle end of the law
// (satisfied opening), not at a demand opening.
namespace lv6::reopen_policy {

/// A closed room reopens when its expected temperature is at or below setpoint + this.
static constexpr float REOPEN_ABOVE_C = 0.3f;
/// Hysteresis on the expected temperature (and gap below the close point).
static constexpr float HYSTERESIS_C = 0.2f;
/// A loop stays closed at least this long before anticipation may reopen it.
static constexpr uint32_t MIN_CLOSED_MS = 20u * 60u * 1000u;
/// The lag stretches linearly with closed time, up to 2× after this many hours.
static constexpr float CLOSED_SATURATE_H = 4.0f;
/// Anticipation never looks further ahead than this (°C).
static constexpr float MAX_ANTICIPATION_C = 1.0f;
/// Trend: one slope sample per window (sensors resolve 0.1 °C), EWMA over samples.
static constexpr uint32_t SLOPE_WINDOW_MS = 30u * 60u * 1000u;
static constexpr float SLOPE_ALPHA = 0.4f;
static constexpr float MAX_SLOPE_C_PER_H = 3.0f;

/// Floor lag prior (h): slab mass (scaled by active thickness for concrete and
/// screed) plus 5 h per m²K/W of covering resistance (parquet ≈ +0.4 h).
inline float floor_lag_h(SlabType slab, float active_thickness_cm, float covering_r_m2k_per_w) {
  float lag = 1.5f;
  switch (slab) {
    case SlabType::SCREED:
      lag = 1.0f * (active_thickness_cm > 0.0f ? active_thickness_cm / 5.0f : 1.0f);
      break;
    case SlabType::DRY_PLATES:
      lag = 0.4f;
      break;
    case SlabType::TIMBER_JOISTS:
      lag = 0.6f;
      break;
    case SlabType::CAST_CONCRETE:
    case SlabType::UNSET:
    default:
      lag = 1.5f * (active_thickness_cm > 0.0f ? active_thickness_cm / 8.0f : 1.0f);
      break;
  }
  const float r = std::isfinite(covering_r_m2k_per_w) ? std::max(0.0f, covering_r_m2k_per_w) : 0.08f;
  return std::clamp(lag + 5.0f * r, 0.25f, 3.0f);
}

/// Room temperature trend (°C/h), sampled once per window.
struct Trend {
  uint32_t anchor_ms{0};
  float anchor_c{NAN};
  float slope_c_per_h{NAN};
};

inline void update_trend(Trend &t, float temp, uint32_t now_ms) {
  if (!std::isfinite(temp)) {
    t = {};
    return;
  }
  if (!std::isfinite(t.anchor_c)) {
    t.anchor_c = temp;
    t.anchor_ms = now_ms;
    return;
  }
  const uint32_t elapsed_ms = now_ms - t.anchor_ms;
  if (elapsed_ms < SLOPE_WINDOW_MS)
    return;
  float s = (temp - t.anchor_c) / (static_cast<float>(elapsed_ms) / 3600000.0f);
  s = std::clamp(s, -MAX_SLOPE_C_PER_H, MAX_SLOPE_C_PER_H);
  t.slope_c_per_h = std::isfinite(t.slope_c_per_h) ? t.slope_c_per_h + SLOPE_ALPHA * (s - t.slope_c_per_h) : s;
  t.anchor_c = temp;
  t.anchor_ms = now_ms;
}

/// Temperature expected one (stretched) floor lag ahead. Only a falling room is
/// anticipated; a steady or rising one is taken as measured.
inline float expected_temp(float temp, float slope_c_per_h, float lag_h, uint32_t closed_ms) {
  if (!std::isfinite(slope_c_per_h) || slope_c_per_h >= 0.0f || !(lag_h > 0.0f))
    return temp;
  const float closed_h = static_cast<float>(closed_ms) / 3600000.0f;
  const float stretch = 1.0f + std::clamp(closed_h / CLOSED_SATURATE_H, 0.0f, 1.0f);
  const float drop = std::min(-slope_c_per_h * lag_h * stretch, MAX_ANTICIPATION_C);
  return temp - drop;
}

/// Reopen point: setpoint + REOPEN_ABOVE_C, but always HYSTERESIS_C below the
/// point where the law closes the loop (Normal closes at setpoint).
inline float reopen_point(float setpoint, float close_point) {
  return std::min(setpoint + REOPEN_ABOVE_C, close_point - HYSTERESIS_C);
}

struct State {
  uint32_t closed_since_ms{0};  ///< 0 = not closed
  bool active{false};
};

/// Step one zone. `closed` is the base law's verdict (loop at 0 because the room
/// is warm). Returns true while the loop should be reopened in anticipation.
inline bool step(State &s, bool closed, float temp, float slope_c_per_h, float setpoint,
                 float close_point, float lag_h, uint32_t now_ms) {
  if (!closed || !std::isfinite(temp) || !std::isfinite(setpoint)) {
    s = {};
    return false;
  }
  if (s.closed_since_ms == 0)
    s.closed_since_ms = now_ms != 0 ? now_ms : 1;
  const uint32_t closed_ms = now_ms - s.closed_since_ms;
  const float expected = expected_temp(temp, slope_c_per_h, lag_h, closed_ms);
  const float reopen = reopen_point(setpoint, close_point);
  if (s.active) {
    if (expected >= reopen + HYSTERESIS_C) {
      // The room turned warm again: closed anew, the minimum closed time restarts.
      s.active = false;
      s.closed_since_ms = now_ms != 0 ? now_ms : 1;
    }
  } else if (closed_ms >= MIN_CLOSED_MS && expected <= reopen) {
    s.active = true;
  }
  return s.active;
}

}  // namespace lv6::reopen_policy
