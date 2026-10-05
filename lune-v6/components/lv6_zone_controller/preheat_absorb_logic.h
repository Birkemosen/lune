#pragma once

#include <cmath>
#include <cstdint>

// Local reactive preheat-absorption detection.
//
// Fail-safe-on: auto-detection stays live under Touch authority. An armed
// absorb window (coordinator command) supersedes auto-detection when set.
//
// Redistribution: once absorbing, a new DEMAND does not release the window —
// the control loop keeps the absorb band on high-capacity zones and gives
// DEMAND zones normal openings. Release only when flow cools below threshold.
namespace lv6::preheat_absorb {

struct DetectInput {
  bool enabled{true};
  /// When true, an armed absorb command owns the window — auto-detection yields.
  bool arm_active{false};
  bool flow_valid{false};
  float flow_c{NAN};
  float house_avg_c{NAN};
  bool any_demand{false};
  float detect_delta_c{8.0f};
  bool currently_active{false};
  uint8_t detect_cycles{0};
  /// Reactive hot-flow detection. False while a Touch lease is active: with
  /// several manifolds, hot supply can be another manifold's demand, not
  /// surplus — only Touch (whole-house view) may arm absorb then.
  bool auto_detect{true};
};

struct DetectOutput {
  bool active{false};
  uint8_t detect_cycles{0};
};

inline DetectOutput step(const DetectInput &in) {
  DetectOutput out{};
  if (!in.enabled) {
    out.active = false;
    out.detect_cycles = 0;
    return out;
  }

  // Armed window owns absorption — auto-detection yields but absorb stays on.
  if (in.arm_active) {
    out.active = true;
    out.detect_cycles = 0;
    return out;
  }

  if (!in.auto_detect) {
    out.active = false;
    out.detect_cycles = 0;
    return out;
  }

  if (!in.flow_valid || !std::isfinite(in.flow_c) || !std::isfinite(in.house_avg_c)) {
    out.active = false;
    out.detect_cycles = 0;
    return out;
  }

  // 2 °C release hysteresis so the state does not flap on probe noise.
  const float threshold =
      in.house_avg_c + in.detect_delta_c - (in.currently_active ? 2.0f : 0.0f);
  const bool hot_flow = in.flow_c > threshold;

  // Activation still requires no DEMAND (avoid fighting a real call at start).
  // Once active, DEMAND redistributes instead of releasing (P5).
  if (in.currently_active) {
    out.active = hot_flow;
    out.detect_cycles = hot_flow ? in.detect_cycles : 0;
    return out;
  }

  const bool condition = !in.any_demand && hot_flow;
  uint8_t cycles = in.detect_cycles;
  if (condition) {
    if (cycles < 255)
      cycles++;
  } else {
    cycles = 0;
  }

  // Require 2 consecutive cycles before activating.
  out.active = condition && cycles >= 2;
  out.detect_cycles = cycles;
  return out;
}

}  // namespace lv6::preheat_absorb
