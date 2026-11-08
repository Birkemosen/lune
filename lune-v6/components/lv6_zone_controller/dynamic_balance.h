#pragma once

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdint>

#include "valve_curve.h"

// Dynamic balancing — the heat-pump law (docs/dynamic_balancing.md).
//
// The manifold behaves like a statically balanced installation whose balancing
// valves follow the rooms' load: every loop has flow, warm rooms hand their flow to
// cold ones, and the manifold's total follows its most demanding room (full when
// that room is a band below target). Loops close only when overheated, and an
// overheated loop reopens while the supply is colder than its room: the water then
// carries the room's (or the floor's) surplus heat to the others through the
// buffer (heat moving). Flows are
// relative loop flows; each loop's valve curve turns them into openings. Pure C++,
// host-testable.
namespace lv6::dynamic_balance {

static constexpr float G_MIN = 0.25f;           ///< Load factor at target + overheat margin
static constexpr float Q_MIN = 0.10f;           ///< Smallest relative flow for an open loop
static constexpr float REOPEN_HYST_C = 0.3f;    ///< Closed loop reopens this far below its limit
static constexpr float MOVE_ON_K = 0.5f;        ///< Default: overheated loop moves heat when supply is this far below its room
static constexpr float MOVE_HYST_K = 0.3f;      ///< ...until the supply is less than (on − this) below it

struct Loop {
  bool enabled{false};
  float design_share{0.0f};   ///< Static prior × learned correction (index loop ≈ 1)
  float house_balance{1.0f};  ///< Touch's per-loop factor (≤ 1)
  float temp_c{NAN};
  float setpoint_c{NAN};
  float max_opening_pct{100.0f};
  valve_curve::Curve curve{};  ///< Opening ↔ relative flow
};

struct Params {
  float comfort_band_c{0.5f};
  float overheat_margin_c{1.0f};
  float absorb_band_c{0.0f};  ///< Extra headroom while Touch pre-buffers
  float supply_c{NAN};        ///< Manifold supply temperature (NaN: unknown, no heat moving)
  bool idle{false};           ///< Heat source not running (Touch): static balance, see distribute
  float move_on_k{MOVE_ON_K}; ///< Supply this far below the room starts heat moving
};

/// Design shares from measured loop flow: a loop needs flow in proportion to its heat
/// demand (W/K) and can carry its measured full flow (l/min), so its share of full flow
/// is demand / full_lmin, normalised so the most demanding loop is 1. Replaces the
/// friction estimate once Touch has measured every enabled loop. Returns false (out
/// untouched) unless every enabled loop has a demand and a measured full flow.
template <size_t N>
inline bool measured_shares(const bool (&enabled)[N], const float (&demand)[N], const float (&full_lmin)[N],
                            float (&out)[N]) {
  float need[N]{};
  float max_need = 0.0f;
  for (size_t i = 0; i < N; i++) {
    if (!enabled[i])
      continue;
    if (!(std::isfinite(demand[i]) && demand[i] > 0.0f && std::isfinite(full_lmin[i]) && full_lmin[i] > 0.0f))
      return false;
    need[i] = demand[i] / full_lmin[i];
    max_need = std::max(max_need, need[i]);
  }
  if (!(max_need > 0.0f))
    return false;
  for (size_t i = 0; i < N; i++)
    out[i] = enabled[i] ? need[i] / max_need : 0.0f;
  return true;
}

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

/// Heat-moving latch for an overheated loop: on while the supply is `on_k` below the
/// room, off once it is less than on_k − MOVE_HYST_K below.
inline bool update_moving(bool moving, float temp_c, float supply_c, float on_k = MOVE_ON_K) {
  if (!std::isfinite(temp_c) || !std::isfinite(supply_c))
    return false;
  const float d = temp_c - supply_c;
  return d >= on_k || (moving && d > on_k - MOVE_HYST_K);
}

struct Result {
  float q_ref{0.0f};    ///< Σ relative flow of the balanced manifold
  float load{0.0f};     ///< Manifold load: the largest load factor of an open loop
  float q_target{0.0f}; ///< (open loops' Q_ref, plus the closed loops' when a room is cold) × load
  float q_total{0.0f};  ///< Σ relative flow commanded
  float scale{0.0f};    ///< Common factor s
  uint8_t moving{0};    ///< Overheated loops moving heat
};

/// Relative flows q_i (0..1) with Σ q = Q_ref × load, by water-filling: loops that
/// reach their cap (full flow, or what the max opening passes) stay there, the
/// others share the rest in proportion to their weight. A room above its target
/// gets at most its design share × its own load factor, so Σ q falls short of the
/// target when the cold rooms are at full flow.
/// The load is the largest load factor among open loops, so the most demanding
/// room decides how much the whole manifold passes (without balancing between
/// manifolds a warm floor must not keep its full flow), while the split inside the
/// manifold moves flow from warm rooms to cold ones. `closed[i]` loops get 0; their
/// flow goes to the others only while an open room is at or below target, so a
/// warm room is never handed the flow of closed ones. A closed loop whose room is
/// warmer than the supply (`moving[i]`, update_moving) gets its balanced flow (its
/// design share, as in a statically balanced manifold) while an open room is at or
/// below target: it gathers heat for them rather than giving it. Its flow comes on
/// top, so the open loops keep the flows they had (closed loops' flow included).
/// Openings in
/// percent, through each loop's valve curve.
///
/// `p.idle` (the heat source is not running): the manifold is statically balanced.
/// Every open loop gets its design share (load factor 1), closed loops hand nothing
/// on, and an overheated loop moves heat whenever the supply is colder than its room,
/// whether or not another room wants it: the buffer's rest and the rooms' surplus
/// spread by themselves, and only a warm room the water would heat stays closed.
template <size_t N>
inline Result distribute(const Loop (&loops)[N], const Params &p, bool (&closed)[N],
                         float (&opening_pct)[N], float (&q)[N], bool (&moving)[N]) {
  Result r;
  float w[N]{};
  float cap[N]{};
  float ref[N]{};
  bool any_open = false;
  bool any_cold = false;  // An open room at or below target (or without a temperature)
  bool any_moving = false;
  for (size_t i = 0; i < N; i++) {
    q[i] = 0.0f;
    opening_pct[i] = 0.0f;
    if (!loops[i].enabled) {
      closed[i] = false;
      moving[i] = false;
      continue;
    }
    moving[i] = closed[i] && update_moving(moving[i], loops[i].temp_c, p.supply_c, p.move_on_k);
    cap[i] = valve_curve::flow_fraction(std::clamp(loops[i].max_opening_pct, 0.0f, 100.0f),
                                        loops[i].curve);
    const float share = std::max(0.0f, loops[i].design_share) *
                        std::clamp(loops[i].house_balance, 0.0f, 1.0f);
    ref[i] = std::min(cap[i], share);
    r.q_ref += ref[i];
    if (!closed[i]) {
      const float g = p.idle ? 1.0f : load_factor(loops[i].temp_c, loops[i].setpoint_c, p);
      w[i] = share * g;
      if (w[i] > 0.0f) {
        any_open = true;
        r.load = std::max(r.load, g);
        if (!(loops[i].temp_c > loops[i].setpoint_c))
          any_cold = true;
      }
    }
  }
  // Heat moves only while a room on the manifold wants it; otherwise it would go
  // back into rooms that are already warm.
  for (size_t i = 0; i < N; i++) {
    moving[i] = moving[i] && (any_cold || p.idle);
    any_moving = any_moving || moving[i];
  }
  // Never all closed: keep the loop nearest its limit open at the minimum load
  // (a loop moving heat already keeps water, and the supply probe, moving).
  if (!any_open && !any_moving) {
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
  float q_base = 0.0f;
  for (size_t i = 0; i < N; i++)
    if (loops[i].enabled && ((any_cold && !p.idle) || !closed[i]))
      q_base += ref[i];
  r.q_target = q_base * r.load;

  // Water-filling for Σ min(cap_i, s·w_i) = q_target. A room above its target is
  // held at its own share × load factor (s ≤ 1 for it): the flow a cold room cannot
  // take (it is at full flow) is not handed to warm rooms (1. sal 2026-11-08:
  // Stue at 100 % pushed Soveværelse, 0.9 K warm, to 51 %).
  float limit[N]{};
  for (size_t i = 0; i < N; i++)
    limit[i] = loops[i].temp_c > loops[i].setpoint_c ? std::min(cap[i], w[i]) : cap[i];
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
      if (s * w[i] >= limit[i]) {
        capped[i] = true;
        q[i] = limit[i];
        remaining -= limit[i];
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
    if (moving[i] && closed[i] && ref[i] > 0.0f) {
      q[i] = ref[i];
      r.moving++;
    }
    if (!(q[i] > 0.0f))
      continue;
    q[i] = std::min(std::max(q[i], Q_MIN), std::max(cap[i], Q_MIN));
    const float max_open = std::clamp(loops[i].max_opening_pct, 0.0f, 100.0f);
    opening_pct[i] = std::min(valve_curve::opening_for(q[i], loops[i].curve), max_open);
    r.q_total += q[i];
  }
  return r;
}

/// Without heat moving (no supply temperature).
template <size_t N>
inline Result distribute(const Loop (&loops)[N], const Params &p, bool (&closed)[N],
                         float (&opening_pct)[N], float (&q)[N]) {
  bool moving[N]{};
  return distribute(loops, p, closed, opening_pct, q, moving);
}

}  // namespace lv6::dynamic_balance
