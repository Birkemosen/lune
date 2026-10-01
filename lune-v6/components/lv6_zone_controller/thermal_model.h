#pragma once

#include "../lv6_config_store/lv6_types.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>

// Room-physics contract v1 — static priors from loop geometry + house params.
// See shared/contracts/lune_room_physics_contract_v1.md §§3–6, §9, §12.
namespace lv6::thermal_model {

static constexpr float CONCRETE_KWH_PER_M3_K = 0.58f;
static constexpr float DEFAULT_C_STRUCT = 0.06f;
static constexpr float DEFAULT_U_BASE = 0.5f;
static constexpr float DEFAULT_U_WALL = 0.4f;
static constexpr float UA_LEARNED_CONFIDENCE_MIN = 0.60f;
static constexpr uint16_t UA_LEARNED_DAYS_MIN = 7;
static constexpr float TAU_REL_MIN = 0.3f;
static constexpr float TAU_REL_MAX = 3.0f;
static constexpr float TAU_ABS_MIN_H = 4.0f;
static constexpr float TAU_ABS_MAX_H = 400.0f;
static constexpr float MAX_RATE_C_PER_H = 3.0f;
static constexpr float HIGH_FLOOR_R = 0.15f;

struct Estimate {
  float c_slab_per_m2{NAN};
  float c_slab_kwh_per_k{NAN};
  float c_zone_kwh_per_k{NAN};
  float r_m2k_per_w{NAN};
  float absorb_headroom_k{NAN};
  float ua_prior_w_per_k{NAN};
  float ua_learned_w_per_k{NAN};
  float ua_effective_w_per_k{NAN};
  float tau_prior_h{NAN};
  float thermal_mass_kwh_per_k{NAN};  ///< alias of c_zone for older callers
  float ua_w_per_k{NAN};              ///< alias of ua_effective
  float tau_h{NAN};                   ///< alias of tau_prior
  float heat_gain_c_per_h{NAN};
  float cool_loss_c_per_h{NAN};
  const char *ua_source{"prior"};  ///< "prior" | "learned"
  bool floor_unset{true};
  bool thickness_ignored{false};
  bool high_floor_resistance{false};
  bool plausible{false};
  const char *reject_reason{""};
};

inline float default_thickness_cm(SlabType t) {
  switch (t) {
    case SlabType::CAST_CONCRETE: return 8.0f;
    case SlabType::SCREED: return 5.0f;
    default: return 0.0f;
  }
}

inline bool thickness_allowed(SlabType t, float cm) {
  switch (t) {
    case SlabType::CAST_CONCRETE: return cm >= 4.0f && cm <= 15.0f;
    case SlabType::SCREED: return cm >= 3.0f && cm <= 8.0f;
    case SlabType::DRY_PLATES:
    case SlabType::TIMBER_JOISTS:
      return true;  // ignored when set
    case SlabType::UNSET:
      return cm <= 0.0f || (cm >= 4.0f && cm <= 15.0f);
  }
  return false;
}

inline float c_slab_per_m2_for(SlabType raw_type, float active_thickness_cm, bool *thickness_ignored) {
  if (thickness_ignored)
    *thickness_ignored = false;
  SlabType t = raw_type == SlabType::UNSET ? SlabType::CAST_CONCRETE : raw_type;
  switch (t) {
    case SlabType::DRY_PLATES:
      if (thickness_ignored && active_thickness_cm > 0.0f)
        *thickness_ignored = true;
      return 0.005f;
    case SlabType::TIMBER_JOISTS:
      if (thickness_ignored && active_thickness_cm > 0.0f)
        *thickness_ignored = true;
      return 0.008f;
    case SlabType::SCREED: {
      float cm = active_thickness_cm > 0.0f ? active_thickness_cm : 5.0f;
      return CONCRETE_KWH_PER_M3_K * (cm / 100.0f);
    }
    case SlabType::CAST_CONCRETE:
    case SlabType::UNSET:
    default: {
      float cm = active_thickness_cm > 0.0f ? active_thickness_cm : 8.0f;
      return CONCRETE_KWH_PER_M3_K * (cm / 100.0f);
    }
  }
}

inline void covering_priors(CoveringType raw, float *r_out, float *headroom_out) {
  CoveringType t = raw == CoveringType::UNSET ? CoveringType::PARQUET_LAMINATE : raw;
  switch (t) {
    case CoveringType::TILE_STONE:
      *r_out = 0.015f;
      *headroom_out = 3.0f;
      break;
    case CoveringType::VINYL_LINOLEUM:
      *r_out = 0.030f;
      *headroom_out = 2.4f;
      break;
    case CoveringType::PARQUET_LAMINATE:
      *r_out = 0.080f;
      *headroom_out = 1.8f;
      break;
    case CoveringType::CARPET:
      *r_out = 0.120f;
      *headroom_out = 1.2f;
      break;
    case CoveringType::UNSET:
    default:
      *r_out = 0.080f;
      *headroom_out = 1.8f;
      break;
  }
}

inline float ua_prior_w_per_k(float area_m2, uint8_t exterior_walls, float u_base, float u_wall) {
  if (!(area_m2 > 0.0f) || !std::isfinite(area_m2))
    return 0.0f;
  const float ub = std::isfinite(u_base) ? u_base : DEFAULT_U_BASE;
  const float uw = std::isfinite(u_wall) ? u_wall : DEFAULT_U_WALL;
  const uint8_t n = popcount_walls(exterior_walls);
  return area_m2 * (ub + uw * static_cast<float>(n));
}

inline bool learned_ua_in_range(float learned, float prior) {
  if (!(prior > 0.0f) || !std::isfinite(learned) || !(learned > 0.0f))
    return false;
  return learned >= 0.2f * prior && learned <= 5.0f * prior;
}

inline bool learned_tau_in_range(float learned_h, float prior_h) {
  if (!std::isfinite(learned_h) || !std::isfinite(prior_h) || !(prior_h > 0.0f))
    return false;
  if (learned_h < TAU_ABS_MIN_H || learned_h > TAU_ABS_MAX_H)
    return false;
  return learned_h >= TAU_REL_MIN * prior_h && learned_h <= TAU_REL_MAX * prior_h;
}

inline Estimate estimate(const ZoneConfig &z, const HousePhysicsConfig &house = HousePhysicsConfig{}) {
  Estimate out{};
  out.floor_unset = (z.slab_type == SlabType::UNSET || z.covering == CoveringType::UNSET);

  const float area = std::isfinite(z.area_m2) ? std::max(0.0f, z.area_m2) : 0.0f;
  bool thick_ignored = false;
  out.c_slab_per_m2 = c_slab_per_m2_for(z.slab_type, z.active_thickness_cm, &thick_ignored);
  out.thickness_ignored = thick_ignored;
  out.c_slab_kwh_per_k = area * out.c_slab_per_m2;

  const float c_struct =
      (std::isfinite(house.c_struct) && house.c_struct >= 0.0f) ? house.c_struct : DEFAULT_C_STRUCT;
  out.c_zone_kwh_per_k = area * (out.c_slab_per_m2 + c_struct);
  out.thermal_mass_kwh_per_k = out.c_zone_kwh_per_k;

  float r_table = 0.0f;
  covering_priors(z.covering, &r_table, &out.absorb_headroom_k);
  if (std::isfinite(z.r_override_m2k_per_w) && z.r_override_m2k_per_w >= 0.0f) {
    out.r_m2k_per_w = std::clamp(z.r_override_m2k_per_w, 0.0f, 0.25f);
  } else {
    out.r_m2k_per_w = r_table;
  }
  out.high_floor_resistance = out.r_m2k_per_w > HIGH_FLOOR_R;

  const float u_base = std::isfinite(house.u_base) ? house.u_base : DEFAULT_U_BASE;
  const float u_wall = std::isfinite(house.u_wall) ? house.u_wall : DEFAULT_U_WALL;
  out.ua_prior_w_per_k = ua_prior_w_per_k(area, z.exterior_walls, u_base, u_wall);

  out.ua_learned_w_per_k = z.ua_learned_w_per_k;
  out.ua_source = "prior";
  float ua_src = out.ua_prior_w_per_k;
  const bool learned_ok =
      std::isfinite(z.ua_learned_w_per_k) && z.ua_learned_w_per_k > 0.0f &&
      std::isfinite(z.ua_learned_confidence) &&
      z.ua_learned_confidence >= UA_LEARNED_CONFIDENCE_MIN &&
      z.ua_learned_observed_days >= UA_LEARNED_DAYS_MIN &&
      learned_ua_in_range(z.ua_learned_w_per_k, out.ua_prior_w_per_k);
  if (learned_ok) {
    ua_src = z.ua_learned_w_per_k;
    out.ua_source = "learned";
  }

  float weight = std::isfinite(z.ua_weight_override) ? z.ua_weight_override : 1.0f;
  weight = std::clamp(weight, 0.25f, 4.0f);
  out.ua_effective_w_per_k = ua_src * weight;
  out.ua_w_per_k = out.ua_effective_w_per_k;

  if (out.ua_effective_w_per_k > 0.0f && out.c_zone_kwh_per_k > 0.0f) {
    out.tau_prior_h = out.c_zone_kwh_per_k / (out.ua_effective_w_per_k / 1000.0f);
    out.tau_h = out.tau_prior_h;
    out.cool_loss_c_per_h =
        (out.ua_effective_w_per_k * 20.0f / 1000.0f) / out.c_zone_kwh_per_k;
    out.heat_gain_c_per_h = (out.ua_prior_w_per_k / 1000.0f) / out.c_zone_kwh_per_k;
  } else {
    out.tau_prior_h = NAN;
    out.tau_h = NAN;
  }

  if (!(out.c_zone_kwh_per_k > 0.05f) || !(out.ua_effective_w_per_k > 0.0f)) {
    out.reject_reason = "invalid_mass_or_ua";
    return out;
  }
  if (std::isfinite(out.cool_loss_c_per_h) && out.cool_loss_c_per_h > MAX_RATE_C_PER_H) {
    out.reject_reason = "rate_implausible";
    return out;
  }
  out.plausible = true;
  out.reject_reason = "";
  return out;
}

/// Back-compat overload used by older call sites that only pass ZoneConfig.
inline Estimate estimate(const ZoneConfig &z, float /*outdoor_delta_c*/) {
  return estimate(z, HousePhysicsConfig{});
}

inline float c_slab_eff_kwh_per_k(const ZoneConfig &z, const Estimate &e) {
  if (!std::isfinite(e.c_slab_kwh_per_k))
    return 0.0f;
  float factor = 1.0f;
  if (std::isfinite(z.tau_learned_h) && z.tau_learned_h > 0.0f &&
      std::isfinite(e.tau_prior_h) && e.tau_prior_h > 0.0f &&
      std::isfinite(e.ua_effective_w_per_k) && e.ua_effective_w_per_k > 0.0f &&
      std::isfinite(e.c_zone_kwh_per_k) && e.c_zone_kwh_per_k > 0.0f) {
    const float c_learned = z.tau_learned_h * (e.ua_effective_w_per_k / 1000.0f);
    factor = std::clamp(c_learned / e.c_zone_kwh_per_k, 0.5f, 2.0f);
  }
  return e.c_slab_kwh_per_k * factor;
}

}  // namespace lv6::thermal_model
