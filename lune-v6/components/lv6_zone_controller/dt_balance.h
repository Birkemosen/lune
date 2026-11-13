#pragma once

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdint>

// ΔT balancing — each loop's share learned from its return temperature
// (docs/dynamic_balancing.md, «ΔT learning»).
//
// A loop whose water comes back almost as warm as it left (low ΔT) carries more
// flow than its floor gives off; one that comes back cold (high ΔT) is starved.
// The pipe model's prior cannot see either: the loop's real length, its fittings,
// the valve insert and the floor's emission. While the heat pump runs space heat,
// every loop with a return probe whose opening has held still long enough is
// compared with the others on the manifold, and its factor moves a little each
// cycle so that their ΔT meets. The factor multiplies the pipe-model share.
//
// ΔT is compared per unit of the flow the loop was given relative to its share
// (ΔT · q / share): a cold room's loop at full flow or a warm room's turned-down
// loop is not mistaken for a hydraulic error. Only loops with a return probe
// configured for them learn (Lv6ZoneController::zone_has_return_probe_); the others
// keep the pipe model (factor 1). Each step keeps the compared loops' geometric mean, so the
// learning loops stay around 1 and the others keep their place. Pure C++, host-testable.
namespace lv6::dt_balance {

static constexpr float TAU_S = 6.0f * 3600.0f;     ///< Time constant over eligible running time
static constexpr float F_MIN = 0.3f;
static constexpr float F_MAX = 3.0f;
static constexpr float STEP_LOG_MAX = 0.7f;        ///< |ln(ratio)| is clamped to this per step
static constexpr float RUN_MIN_S = 20.0f * 60.0f;  ///< Space heat running this long first
static constexpr float STEADY_MIN_S = 15.0f * 60.0f;  ///< Opening held this long (water through the loop)
static constexpr float STEADY_TOL_PCT = 5.0f;      ///< Opening change that restarts the steady timer
static constexpr float OPEN_MIN_PCT = 20.0f;       ///< Below this a loop's flow and probe say little
static constexpr float SUPPLY_OVER_ROOM_K = 3.0f;  ///< Supply this far above the room
static constexpr float DT_MIN_K = 0.2f;            ///< A loop's ΔT must at least be this
static constexpr float MEAN_DT_MIN_K = 1.0f;       ///< Manifold's mean ΔT' too small to compare below this

struct LoopIn {
  bool enabled{false};
  bool has_return{false};    ///< Return probe configured for the loop
  float return_c{NAN};
  float room_c{NAN};
  float setpoint_c{NAN};
  float opening_pct{0.0f};   ///< Commanded opening
  float q{0.0f};             ///< Commanded relative flow (dynamic_balance::distribute)
  float share{0.0f};         ///< The share q was computed from
  bool closed{false};
};

template <size_t N>
struct State {
  float f[N];
  float steady_open[N];
  float steady_s[N];
  float run_s{0.0f};
  State() {
    for (size_t i = 0; i < N; i++) {
      f[i] = 1.0f;
      steady_open[i] = -100.0f;
      steady_s[i] = 0.0f;
    }
  }
};

struct Params {
  float comfort_band_c{0.5f};
  float tau_s{TAU_S};
};

struct StepResult {
  uint8_t eligible{0};    ///< Loops compared this cycle
  bool stepped{false};    ///< Factors moved
  float mean_dt{NAN};     ///< Geometric mean of ΔT' over the eligible loops
};

/// Normalised ΔT of an eligible loop: ΔT × q / share.
inline float normalised_dt(const LoopIn &l, float supply_c) {
  const float dt = supply_c - l.return_c;
  return l.share > 0.0f ? dt * l.q / l.share : NAN;
}

/// One control cycle. `running`: the heat pump runs space heat (Touch's phase).
/// `hold`: something else holds the valves (valve test, flush) — no learning, timers restart.
template <size_t N>
inline StepResult step(State<N> &s, const LoopIn (&in)[N], float supply_c, bool running, bool hold,
                       float dt_s, const Params &p = Params{}) {
  StepResult r;
  s.run_s = (running && !hold) ? s.run_s + dt_s : 0.0f;
  bool ok[N]{};
  float x[N]{};
  float log_sum = 0.0f;
  for (size_t i = 0; i < N; i++) {
    const LoopIn &l = in[i];
    if (!l.enabled || !l.has_return) {
      s.steady_s[i] = 0.0f;
      continue;
    }
    if (hold || std::fabs(l.opening_pct - s.steady_open[i]) > STEADY_TOL_PCT) {
      s.steady_open[i] = l.opening_pct;
      s.steady_s[i] = 0.0f;
    } else {
      s.steady_s[i] += dt_s;
    }
    if (s.run_s < RUN_MIN_S || s.steady_s[i] < STEADY_MIN_S)
      continue;
    if (l.closed || l.opening_pct < OPEN_MIN_PCT || !(l.q > 0.0f) || !(l.share > 0.0f))
      continue;
    if (!std::isfinite(l.return_c) || !std::isfinite(l.room_c) || !std::isfinite(supply_c))
      continue;
    if (std::isfinite(l.setpoint_c) && l.room_c > l.setpoint_c + p.comfort_band_c)
      continue;  // a warm room gives off less: its low ΔT is not the loop's
    if (supply_c - l.room_c < SUPPLY_OVER_ROOM_K || supply_c - l.return_c < DT_MIN_K)
      continue;
    x[i] = normalised_dt(l, supply_c);
    if (!(x[i] > 0.0f))
      continue;
    ok[i] = true;
    log_sum += std::log(x[i]);
    r.eligible++;
  }
  if (r.eligible < 2)
    return r;
  r.mean_dt = std::exp(log_sum / r.eligible);
  if (!(r.mean_dt >= MEAN_DT_MIN_K))
    return r;
  const float k = std::clamp(dt_s / std::max(1.0f, p.tau_s), 0.0f, 1.0f);
  float before = 0.0f, after = 0.0f;
  for (size_t i = 0; i < N; i++) {
    if (!ok[i])
      continue;
    before += std::log(s.f[i]);
    // High ΔT' (starved) → more share; low ΔT' (overfed) → less.
    const float e = std::clamp(std::log(x[i] / r.mean_dt), -STEP_LOG_MAX, STEP_LOG_MAX);
    s.f[i] = std::clamp(s.f[i] * std::exp(k * e), F_MIN, F_MAX);
    after += std::log(s.f[i]);
  }
  // The compared loops keep their geometric mean, so the others (no probe, closed,
  // warm) keep their place and the learning loops' mean stays at 1.
  const float g = std::exp((after - before) / r.eligible);
  for (size_t i = 0; i < N; i++)
    if (ok[i])
      s.f[i] = std::clamp(s.f[i] / g, F_MIN, F_MAX);
  r.stepped = true;
  return r;
}

}  // namespace lv6::dt_balance
