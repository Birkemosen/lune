#pragma once

#include <algorithm>
#include <cmath>

// Valve opening model: relative loop flow (0..1) against actuator opening (%).
//
// The opening is the pin's position over its learned travel (0 % = in the seat,
// 100 % = pin free). Per-loop curves measured from the pump's flow are gone: the
// pump computes its flow from power and speed, far from the manifold, and could not
// tell 1 mm of lift from 2 mm, so every measured curve put "full flow" at about 1 mm
// of a 2–3 mm stroke and held the valves there (Laura, 1. sal, 2026-11-13: 51 %,
// 1.0 mm measured with a caliper, room falling).
//
// One fixed model for every loop: a loop that is to give heat opens at least
// MIN_HEAT_OPEN_PCT (past the seat's dead zone, ~0.2 mm), and above that flow is taken
// as linear in opening. The room loop closes on temperature, so the valve's real
// (quick-opening) characteristic is absorbed by the control. Pure C++, host-testable.
namespace lv6::valve_curve {

static constexpr float MIN_HEAT_OPEN_PCT = 10.0f;

struct Curve {
  float start_pct{MIN_HEAT_OPEN_PCT};
  float full_pct{100.0f};
};

/// Relative flow at an opening: 0 up to start, 1 from full.
inline float flow_fraction(float opening_pct, const Curve &c = {}) {
  if (!std::isfinite(opening_pct) || opening_pct <= c.start_pct)
    return 0.0f;
  if (opening_pct >= c.full_pct)
    return 1.0f;
  return (opening_pct - c.start_pct) / (c.full_pct - c.start_pct);
}

/// Opening for a relative flow q (0..1). q ≤ 0 → closed (0 %).
inline float opening_for(float q, const Curve &c = {}) {
  if (!(q > 0.0f))
    return 0.0f;
  return c.start_pct + std::min(q, 1.0f) * (c.full_pct - c.start_pct);
}

/// As opening_for, but q above 1 continues the line past the full point; capped at
/// 100 %.
inline float opening_for_extended(float q, const Curve &c = {}) {
  if (!(q > 0.0f))
    return 0.0f;
  return std::min(100.0f, c.start_pct + q * (c.full_pct - c.start_pct));
}

/// Pin lift (mm) per motor count: Laura's actuator, 1. sal, 2026-11-13 — 900 counts
/// from the seat measured 1.0 mm with a caliper (4 mm plunger stroke in ~40 s).
static constexpr float MM_PER_COUNT = 0.0011f;

/// Opening (%) of a pin travel of `range_counts` motor counts, in mm. NaN if unknown.
inline float opening_mm(float opening_pct, float range_counts) {
  if (!std::isfinite(opening_pct) || !(range_counts > 0.0f))
    return NAN;
  return std::clamp(opening_pct, 0.0f, 100.0f) / 100.0f * range_counts * MM_PER_COUNT;
}

}  // namespace lv6::valve_curve
