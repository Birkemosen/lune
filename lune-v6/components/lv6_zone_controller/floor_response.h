#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>

// Floor response time — how long after heat starts or stops going into a loop its
// room turns (docs/Manual.md, «Floor response time»).
//
// reopen_policy::floor_lag_h() gives a prior from the floor's build (timber joists +
// parquet ≈ 1.0 h). Each loop learns its own from two edges of its heat input,
// opening × (supply − room):
//   on   heat goes in after at least QUIET_MIN_S without: the room keeps falling (or
//        holds) until the floor answers, then rises;
//   off  heat stops after at least QUIET_MIN_S of heating: the room keeps rising until
//        the floor has given off its charge, then falls.
// The turn is the middle of the plateau at the extreme the room reached after the
// edge (room sensors resolve 0.1 °C), confirmed once the room has moved TURN_K back.
// An episode ends without a sample if the input flips back first, a valve test holds
// the valves, or the turn takes longer than MAX_WAIT_S. Pure C++, host-testable.
namespace lv6::floor_response {

static constexpr float ON_K = 8.0f;            ///< Heat input above this (K × opening) = heating
static constexpr float OFF_K = 4.0f;           ///< …below this = not heating (hysteresis)
static constexpr float OPEN_MIN_PCT = 20.0f;   ///< Below this a loop carries too little to count
static constexpr float QUIET_MIN_S = 90.0f * 60.0f;  ///< State held this long before an edge counts
static constexpr float TURN_K = 0.2f;          ///< Room back this far from its extreme = turned
static constexpr float MAX_WAIT_S = 6.0f * 3600.0f;
static constexpr float LAG_MIN_H = 0.1f;       ///< Samples outside [MIN, MAX] are dropped
static constexpr float LAG_MAX_H = 5.0f;
static constexpr float ALPHA = 0.3f;           ///< EWMA weight of a new sample
static constexpr uint8_t TRUST_SAMPLES = 4;    ///< The learned value fully replaces the prior after this many
static constexpr uint8_t SAMPLES_MAX = 200;

enum class Edge : uint8_t { NONE = 0, ON = 1, OFF = 2 };

struct Loop {
  bool heating{false};
  float state_s{0.0f};      ///< Time in the current heating state
  Edge edge{Edge::NONE};    ///< Episode in progress
  float since_edge_s{0.0f};
  float extreme_c{NAN};     ///< Lowest (on) / highest (off) room temperature since the edge
  float extreme_first_s{0.0f};
  float extreme_last_s{0.0f};
  float learned_h{NAN};     ///< EWMA of the samples (NAN: none yet)
  uint8_t samples{0};
};

/// Heat input: opening (0–1) × (supply − room), 0 below OPEN_MIN_PCT or without readings.
inline float heat_input_k(float opening_pct, float supply_c, float room_c) {
  if (!(opening_pct >= OPEN_MIN_PCT) || !std::isfinite(supply_c) || !std::isfinite(room_c))
    return 0.0f;
  return std::min(opening_pct, 100.0f) / 100.0f * std::max(0.0f, supply_c - room_c);
}

/// Response time to use: the prior until samples arrive, then towards the learned value.
inline float effective_lag_h(const Loop &l, float prior_h) {
  if (l.samples == 0 || !std::isfinite(l.learned_h))
    return prior_h;
  const float w = std::min(1.0f, static_cast<float>(l.samples) / static_cast<float>(TRUST_SAMPLES));
  return prior_h * (1.0f - w) + l.learned_h * w;
}

inline void add_sample(Loop &l, float lag_h) {
  if (!(lag_h >= LAG_MIN_H && lag_h <= LAG_MAX_H))
    return;
  l.learned_h = (l.samples == 0 || !std::isfinite(l.learned_h)) ? lag_h : l.learned_h + ALPHA * (lag_h - l.learned_h);
  if (l.samples < SAMPLES_MAX)
    l.samples++;
}

/// One control cycle. `hold`: valve test or flush (no learning, episode dropped).
/// Returns the sample (h) when an episode completed this cycle, else NAN.
inline float step(Loop &l, float input_k, float room_c, bool hold, float dt_s) {
  if (hold || !std::isfinite(room_c)) {
    l.edge = Edge::NONE;
    l.state_s = 0.0f;
    return NAN;
  }
  const bool was = l.heating;
  if (!l.heating && input_k >= ON_K)
    l.heating = true;
  else if (l.heating && input_k <= OFF_K)
    l.heating = false;

  if (l.heating != was) {
    // An edge after a long enough steady state starts an episode; a flip back ends one.
    const bool quiet = l.state_s >= QUIET_MIN_S;
    l.edge = quiet ? (l.heating ? Edge::ON : Edge::OFF) : Edge::NONE;
    l.since_edge_s = 0.0f;
    l.extreme_c = room_c;
    l.extreme_first_s = l.extreme_last_s = 0.0f;
    l.state_s = 0.0f;
    return NAN;
  }
  l.state_s += dt_s;
  if (l.edge == Edge::NONE)
    return NAN;

  l.since_edge_s += dt_s;
  if (l.since_edge_s > MAX_WAIT_S) {
    l.edge = Edge::NONE;
    return NAN;
  }
  const bool on = l.edge == Edge::ON;
  // Sensors step by 0.1 °C: compare at that resolution.
  const float r = std::round(room_c * 10.0f) / 10.0f;
  const float x = std::round(l.extreme_c * 10.0f) / 10.0f;
  if (on ? r < x : r > x) {
    l.extreme_c = room_c;
    l.extreme_first_s = l.extreme_last_s = l.since_edge_s;
  } else if (r == x) {
    l.extreme_last_s = l.since_edge_s;
  } else if (on ? r >= x + TURN_K - 0.01f : r <= x - TURN_K + 0.01f) {
    const float lag_h = 0.5f * (l.extreme_first_s + l.extreme_last_s) / 3600.0f;
    l.edge = Edge::NONE;
    add_sample(l, lag_h);
    return lag_h;
  }
  return NAN;
}

}  // namespace lv6::floor_response
