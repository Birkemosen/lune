#pragma once

#include <algorithm>
#include <cmath>

// Recommended max loop flow — what to set the manifold's flow preset to.
//
// A loop with low resistance (short, or wide pipe) takes far more water than its
// room needs when the valve is open, and takes the pump's pressure from the long
// loops: on the ground floor at home (PEX 20, 300 mm) an open loop took ~6 l/min
// against 1–3 l/min needed, while the upper floor's AluPEX 16 loops got 2–3
// (2026-11-26). The preset should cap each loop near what its room needs on a
// design day, with room to charge the floor:
//
//   heat  = UA · (1 + WIND_LOSS_FACTOR · wind_exposure) · (setpoint − DESIGN_OUTDOOR_C)
//   flow  = heat / (DESIGN_DT_K · c_water)
//   max   = flow · (1 + RESERVE)
//
// DESIGN_OUTDOOR_C is the Danish design outdoor temperature (DS 418). Wind uses the
// zone's exposure on the same scale as Touch's weather presets (×0.6 extra loss at
// 10 m/s head-on per 1.0 exposure).
namespace lv6::loop_flow {

static constexpr float DESIGN_OUTDOOR_C = -12.0f;
static constexpr float DESIGN_DT_K = 5.0f;
static constexpr float RESERVE = 0.3f;
static constexpr float WIND_LOSS_FACTOR = 0.6f;
static constexpr float WATER_W_PER_LPM_K = 69.7f;  ///< 1 l/min × 1 K ≈ 69.7 W
static constexpr float LEAD_EACH_WAY_M = 2.0f;     ///< when the zone has no supply length

struct Result {
  float loop_m{NAN};      ///< estimated loop length
  float design_w{NAN};    ///< heat on a design day
  float design_lpm{NAN};  ///< flow for that heat at DESIGN_DT_K
  float max_lpm{NAN};     ///< recommended preset
};

/// Area ÷ spacing plus the supply and return leads.
inline float loop_length_m(float area_m2, float spacing_mm, float supply_m) {
  if (!(area_m2 > 0.0f) || !(spacing_mm > 0.0f))
    return NAN;
  const float lead = std::isfinite(supply_m) && supply_m >= 0.0f ? supply_m : LEAD_EACH_WAY_M;
  return area_m2 * 1000.0f / spacing_mm + 2.0f * lead;
}

inline Result compute(float ua_w_per_k, float setpoint_c, float wind_exposure, float area_m2,
                      float spacing_mm, float supply_m) {
  Result r;
  r.loop_m = loop_length_m(area_m2, spacing_mm, supply_m);
  if (!(ua_w_per_k > 0.0f) || !std::isfinite(setpoint_c))
    return r;
  const float wind = std::isfinite(wind_exposure) ? std::clamp(wind_exposure, 0.0f, 4.0f) : 0.0f;
  const float dt = std::max(0.0f, setpoint_c - DESIGN_OUTDOOR_C);
  r.design_w = ua_w_per_k * (1.0f + WIND_LOSS_FACTOR * wind) * dt;
  r.design_lpm = r.design_w / (DESIGN_DT_K * WATER_W_PER_LPM_K);
  r.max_lpm = r.design_lpm * (1.0f + RESERVE);
  return r;
}

}  // namespace lv6::loop_flow
