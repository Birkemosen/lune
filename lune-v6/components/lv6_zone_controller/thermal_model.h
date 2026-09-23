#pragma once

#include "../lv6_config_store/lv6_types.h"

#include <algorithm>
#include <cmath>
#include <cstdint>

// Static thermal estimate from ZoneConfig geometry.
 // Denominator is slab + cover thermal mass (not air alone).
 // Concrete ≈ 0.58 kWh/(m³·K). Typical 20 m² × 80 mm → ~1–2 kWh/K.
namespace lv6::thermal_model {

static constexpr float CONCRETE_KWH_PER_M3_K = 0.58f;
static constexpr float COVER_KWH_PER_M3_K = 0.35f;  ///< wood/tile blend prior
static constexpr float AIR_HEIGHT_M = 2.5f;
static constexpr float AIR_KWH_PER_M3_K = 0.00034f;  ///< ~1.2 kJ/(m³·K) → kWh
static constexpr float FURNITURE_FACTOR = 0.15f;     ///< extra mass ≈ 15 % of slab
static constexpr float TAU_MIN_H = 8.0f;
static constexpr float TAU_MAX_H = 80.0f;
static constexpr float MAX_RATE_C_PER_H = 3.0f;

struct Estimate {
  float ua_w_per_k{NAN};
  float thermal_mass_kwh_per_k{NAN};
  float tau_h{NAN};
  float heat_gain_c_per_h{NAN};  ///< at design ΔT = cooling_delta_c (supply − room proxy)
  float cool_loss_c_per_h{NAN};  ///< UA · 20 K / mass (outdoor design ΔT)
  bool plausible{false};
  const char *reject_reason{""};
};

inline float slab_thickness_m(const ZoneConfig &z) {
  const float mm = z.concrete_thickness_mm > 0.0f ? z.concrete_thickness_mm : 50.0f;
  return mm / 1000.0f;
}

inline float cover_thickness_m(const ZoneConfig &z) {
  const float mm = z.floor_cover_thickness_mm > 0.0f ? z.floor_cover_thickness_mm : 15.0f;
  return mm / 1000.0f;
}

inline Estimate estimate(const ZoneConfig &z, float outdoor_delta_c = 20.0f) {
  Estimate out{};
  const float area = std::clamp(z.area_m2, 1.0f, 120.0f);
  const float heat_loss = std::clamp(z.heat_loss_w_m2, 5.0f, 120.0f);
  out.ua_w_per_k = area * heat_loss / outdoor_delta_c;  // W/K at design outdoor ΔT

  const float slab_m3 = area * slab_thickness_m(z);
  const float cover_m3 = area * cover_thickness_m(z);
  const float air_m3 = area * AIR_HEIGHT_M;
  float mass = slab_m3 * CONCRETE_KWH_PER_M3_K + cover_m3 * COVER_KWH_PER_M3_K +
               air_m3 * AIR_KWH_PER_M3_K;
  mass *= (1.0f + FURNITURE_FACTOR);
  out.thermal_mass_kwh_per_k = mass;

  if (!(mass > 0.05f) || !(out.ua_w_per_k > 0.0f)) {
    out.reject_reason = "invalid_mass_or_ua";
    return out;
  }

  // τ = C / UA  (C in kWh/K, UA in W/K = kW/K × 1000 → hours)
  out.tau_h = (mass * 1000.0f) / out.ua_w_per_k;

  // Cool loss at outdoor_delta_c: (UA · ΔT) / C → °C/h
  out.cool_loss_c_per_h = (out.ua_w_per_k * outdoor_delta_c / 1000.0f) / mass;

  // Heat gain prior: design loop ΔT applied as available power into the zone.
  const float design_dt = z.cooling_delta_c > 0.5f ? z.cooling_delta_c : 5.0f;
  // Available power ≈ UA_loop proxy: area · heat_loss at comfort (same order).
  const float available_kw = (area * heat_loss) / 1000.0f;
  out.heat_gain_c_per_h = available_kw / mass;
  (void) design_dt;

  if (out.tau_h < TAU_MIN_H || out.tau_h > TAU_MAX_H) {
    out.reject_reason = "tau_out_of_range";
    return out;
  }
  if (out.cool_loss_c_per_h > MAX_RATE_C_PER_H || out.heat_gain_c_per_h > MAX_RATE_C_PER_H) {
    out.reject_reason = "rate_implausible";
    return out;
  }
  out.plausible = true;
  out.reject_reason = "";
  return out;
}

}  // namespace lv6::thermal_model
