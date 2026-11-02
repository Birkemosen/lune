#pragma once

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdint>

// Dynamic balancing — the heat-pump law (docs/dynamic_balancing.md).
//
// The manifold behaves like a statically balanced installation whose balancing
// valves follow the rooms' load: every loop has flow, warm rooms hand their flow to
// cold ones, and the manifold's total follows its most demanding room (full when
// that room is a band below target). Loops close only when overheated. Pure C++,
// host-testable.
namespace lv6::dynamic_balance {

static constexpr float G_MIN = 0.25f;           ///< Load factor at target + overheat margin
static constexpr float MIN_OPEN_PCT = 10.0f;    ///< Smallest opening for an open loop
static constexpr float REOPEN_HYST_C = 0.3f;    ///< Closed loop reopens this far below its limit

struct Loop {
  bool enabled{false};
  float design_share{0.0f};   ///< Static prior × learned correction (index loop ≈ 1)
  float house_balance{1.0f};  ///< Touch's per-loop factor (≤ 1)
  float temp_c{NAN};
  float setpoint_c{NAN};
  float max_opening_pct{100.0f};
};

struct Params {
  float comfort_band_c{0.5f};
  float overheat_margin_c{1.0f};
  float absorb_band_c{0.0f};  ///< Extra headroom while Touch pre-buffers
};

/// Load factor from the room's error: 1 at least one band below target, G_MIN at
/// target + margin, linear between. No temperature → 1 (statically balanced).
inline float load_factor(float temp_c, float setpoint_c, const Params &p) {
  if (!std::isfinite(temp_c) || !std::isfinite(setpoint_c))
    return 1.0f;
  const float band = std::max(0.1f, p.comfort_band_c);
  const float margin = std::max(0.1f, p.overheat_margin_c);
  const float e = setpoint_c - temp_c;  // + = cold
  if (e >= band)
    return 1.0f;
  if (e <= -margin)
    return G_MIN;
  const float t = (e + margin) / (band + margin);  // 0 at −margin → 1 at +band
  return G_MIN + t * (1.0f - G_MIN);
}

/// Temperature above which a loop closes.
inline float close_limit_c(float setpoint_c, const Params &p) {
  return setpoint_c + std::max(0.1f, p.comfort_band_c) + std::max(0.1f, p.overheat_margin_c) +
         std::max(0.0f, p.absorb_band_c);
}

/// Overheat latch: closes above the limit, reopens REOPEN_HYST_C below it.
inline bool update_closed(bool closed, float temp_c, float setpoint_c, const Params &p) {
  if (!std::isfinite(temp_c) || !std::isfinite(setpoint_c))
    return false;
  const float limit = close_limit_c(setpoint_c, p);
  if (temp_c > limit)
    return true;
  if (closed && temp_c > limit - REOPEN_HYST_C)
    return true;
  return false;
}

struct Result {
  float q_ref{0.0f};    ///< Σ relative flow of the balanced manifold
  float load{0.0f};     ///< Manifold load: the largest load factor of an open loop
  float q_target{0.0f}; ///< q_ref × load
  float q_total{0.0f};  ///< Σ relative flow commanded
  float scale{0.0f};    ///< Common factor s
};

/// Relative flows q_i (0..1) with Σ q = Q_ref × load, by water-filling: loops that
/// reach 1.0 stay there, the others share the rest in proportion to their weight.
/// The load is the largest load factor among open loops, so the most demanding
/// room decides how much the whole manifold passes (without balancing between
/// manifolds a warm floor must not keep its full flow), while the split inside the
/// manifold moves flow from warm rooms to cold ones. `closed[i]` loops get 0 (their
/// flow goes to the others). Openings in percent.
template <size_t N>
inline Result distribute(const Loop (&loops)[N], const Params &p, bool (&closed)[N],
                         float (&opening_pct)[N], float (&q)[N]) {
  Result r;
  float w[N]{};
  bool any_open = false;
  for (size_t i = 0; i < N; i++) {
    q[i] = 0.0f;
    opening_pct[i] = 0.0f;
    if (!loops[i].enabled) {
      closed[i] = false;
      continue;
    }
    const float share = std::max(0.0f, loops[i].design_share) *
                        std::clamp(loops[i].house_balance, 0.0f, 1.0f);
    r.q_ref += std::min(1.0f, share);
    if (!closed[i]) {
      const float g = load_factor(loops[i].temp_c, loops[i].setpoint_c, p);
      w[i] = share * g;
      if (w[i] > 0.0f) {
        any_open = true;
        r.load = std::max(r.load, g);
      }
    }
  }
  // Never all closed: keep the loop nearest its limit open at the minimum load.
  if (!any_open) {
    size_t best = N;
    float best_surplus = 0.0f;
    for (size_t i = 0; i < N; i++) {
      if (!loops[i].enabled || !(loops[i].design_share > 0.0f))
        continue;
      const float surplus = (std::isfinite(loops[i].temp_c) && std::isfinite(loops[i].setpoint_c))
                                ? loops[i].temp_c - close_limit_c(loops[i].setpoint_c, p)
                                : 0.0f;
      if (best == N || surplus < best_surplus) {
        best = i;
        best_surplus = surplus;
      }
    }
    if (best == N)
      return r;
    closed[best] = false;
    w[best] = std::max(0.0f, loops[best].design_share) *
              std::clamp(loops[best].house_balance, 0.0f, 1.0f) * G_MIN;
    r.load = G_MIN;
  }
  r.q_target = r.q_ref * r.load;

  // Water-filling for Σ min(1, s·w_i) = q_target.
  bool capped[N]{};
  float remaining = r.q_target;
  for (size_t pass = 0; pass < N + 1; pass++) {
    float w_free = 0.0f;
    for (size_t i = 0; i < N; i++)
      if (!capped[i])
        w_free += w[i];
    if (!(w_free > 0.0f) || !(remaining > 0.0f))
      break;
    const float s = remaining / w_free;
    r.scale = s;
    bool newly_capped = false;
    for (size_t i = 0; i < N; i++) {
      if (capped[i] || !(w[i] > 0.0f))
        continue;
      if (s * w[i] >= 1.0f) {
        capped[i] = true;
        q[i] = 1.0f;
        remaining -= 1.0f;
        newly_capped = true;
      }
    }
    if (!newly_capped) {
      for (size_t i = 0; i < N; i++)
        if (!capped[i])
          q[i] = s * w[i];
      break;
    }
  }

  for (size_t i = 0; i < N; i++) {
    if (!(q[i] > 0.0f))
      continue;
    const float max_open = std::clamp(loops[i].max_opening_pct, 0.0f, 100.0f);
    const float open = std::max(MIN_OPEN_PCT, 100.0f * q[i]);
    opening_pct[i] = std::min(open, max_open);
    r.q_total += q[i];
  }
  return r;
}

}  // namespace lv6::dynamic_balance
