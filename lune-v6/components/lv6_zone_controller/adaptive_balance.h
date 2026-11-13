// =============================================================================
// LV6 Adaptive Balancing — pure C++, host-testable (no ESP-IDF / ESPHome deps)
// =============================================================================
// Room-temperature-feedback hydraulic balancing. The physics (design share =
// heat demand UA / measured full flow, or the pipe model before Touch has
// measured) supplies the split; this module learns how far each loop deviates
// from it, as a multiplier f_i around 1.
//
// The deviation is physical: a room that settles e_i below its own setpoint
// while getting its share loses UA·(lift − e_i) where physics gave it UA·lift,
// so it needs (lift + e_i)/lift times the heat, and in a floor loop heat grows
// about as √flow, so FLOW_PER_HEAT times that in flow (log terms). The lift
// (room − outdoor) is not known on V6; DESIGN_LIFT_K is a heating-season value.
//
// Balancing is a *redistribution* of a shared flow, so the common mode is
// removed: if the whole house is cold because the supply is too cold, every
// room deviates equally and no factor moves. Without evidence a factor leaks
// back to the physics (leak_h), so it only ever holds a deviation that keeps
// showing. A changed basis (new measurement, method) starts it over at 1.
//
// Tested by test/adaptive_balance/test_adaptive_balance.cpp (make test-balance).
// See docs/adaptive_balancing.md.
// =============================================================================

#pragma once

#include <cmath>

namespace lv6ab {

struct DeviationParams {
  float lift_k = 15.0f;        ///< DESIGN_LIFT_K: room − outdoor in the heating season
  float flow_per_heat = 2.0f;  ///< d ln(flow) / d ln(heat) for a floor loop
  float learn_h = 24.0f;       ///< A persistent deviation is taken up over about this
  float leak_h = 168.0f;       ///< ...and fades back to the physics over this without evidence
  float interval_h = 1.0f;     ///< Update period
  float max_step = 0.05f;      ///< Largest ln-move per update
  float bound = 1.33f;         ///< f stays within [1/bound, bound]
};

/// Clamp helper (avoids pulling in <algorithm> for the firmware include path).
inline float clampf(float v, float lo, float hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

/// The loop's flow need against the physics, in ln terms, from its room's mean
/// error to its own setpoint (setpoint − temp, + = cold).
inline float flow_deviation(float error_c, const DeviationParams &p) {
  const float lift = p.lift_k > 1.0f ? p.lift_k : 1.0f;
  const float ratio = (lift + clampf(error_c, -0.5f * lift, 0.5f * lift)) / lift;
  return p.flow_per_heat * std::log(ratio);
}

/// One update of a loop's multiplier: ln f leaks toward 0 (the physics) and
/// integrates the loop's deviation beyond the manifold's common mode.
///   x_i, x_mean — flow_deviation of this loop and the contributing loops' mean.
inline float next_factor(float f, float x_i, float x_mean, const DeviationParams &p) {
  const float ln_bound = std::log(p.bound > 1.0f ? p.bound : 1.0f);
  const float ln_f = std::log(f > 0.0f ? f : 1.0f);
  const float k = p.learn_h > 0.0f ? clampf(p.interval_h / p.learn_h, 0.0f, 1.0f) : 1.0f;
  const float leak = p.leak_h > 0.0f ? clampf(p.interval_h / p.leak_h, 0.0f, 1.0f) : 0.0f;
  const float target = (1.0f - leak) * ln_f + k * (x_i - x_mean);
  const float step = clampf(target - ln_f, -p.max_step, p.max_step);
  return std::exp(clampf(ln_f + step, -ln_bound, ln_bound));
}

}  // namespace lv6ab
