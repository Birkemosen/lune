#pragma once

#include <algorithm>
#include <cmath>

// Valve characteristic: relative loop flow (0..1) against actuator opening (%).
//
// Manifold valve inserts open quickly: nothing passes until the pin lifts off the
// seat, most of the flow arrives over the next part of the stroke, and the rest of
// the stroke adds little. Measured on the author's manifolds (pump flow against
// single valve moves): no flow up to ~7 %, little change above ~35–40 %.
//
// Modelled as two points per loop: `start_pct` (flow begins) and `full_pct` (full
// flow), linear between. Pure C++, host-testable.
//
// The default is for boards without a measured curve. Touch measured 12 loops on two
// manifolds: flow starts at 4–29 % (median 15.5) and is full at 27–48 % (median 34).
// One curve cannot fit them all, and the errors are not equal: a start set too low
// leaves a loop with no flow, a full point set too low starves the index loop. So the
// default is wide, 15 → 50 %: still far narrower than the pin's stroke.
namespace lv6::valve_curve {

static constexpr float DEFAULT_START_PCT = 15.0f;
static constexpr float DEFAULT_FULL_PCT = 50.0f;
static constexpr float MAX_START_PCT = 50.0f;
static constexpr float MIN_SPAN_PCT = 10.0f;  ///< full − start

struct Curve {
  float start_pct{DEFAULT_START_PCT};
  float full_pct{DEFAULT_FULL_PCT};
};

/// Keeps a curve usable: start 0..50, full at least MIN_SPAN above start, ≤ 100.
/// Non-finite values fall back to the defaults.
inline Curve sanitize(Curve c) {
  if (!std::isfinite(c.start_pct))
    c.start_pct = DEFAULT_START_PCT;
  if (!std::isfinite(c.full_pct))
    c.full_pct = DEFAULT_FULL_PCT;
  c.start_pct = std::clamp(c.start_pct, 0.0f, MAX_START_PCT);
  c.full_pct = std::clamp(c.full_pct, c.start_pct + MIN_SPAN_PCT, 100.0f);
  return c;
}

/// Relative flow at an opening: 0 up to start, 1 from full.
inline float flow_fraction(float opening_pct, const Curve &c) {
  if (!std::isfinite(opening_pct) || opening_pct <= c.start_pct)
    return 0.0f;
  if (opening_pct >= c.full_pct)
    return 1.0f;
  return (opening_pct - c.start_pct) / (c.full_pct - c.start_pct);
}

/// Opening for a relative flow q (0..1). q ≤ 0 → closed (0 %).
inline float opening_for(float q, const Curve &c) {
  if (!(q > 0.0f))
    return 0.0f;
  return c.start_pct + std::min(q, 1.0f) * (c.full_pct - c.start_pct);
}

/// As opening_for, but q above 1 continues the line past the full point (q = 1.1 is
/// 10 % of the span beyond it). For a margin on full flow; capped at 100 %.
inline float opening_for_extended(float q, const Curve &c) {
  if (!(q > 0.0f))
    return 0.0f;
  return std::min(100.0f, c.start_pct + q * (c.full_pct - c.start_pct));
}

}  // namespace lv6::valve_curve
