#pragma once

#include "../lv6_config_store/lv6_types.h"

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdint>

namespace lv6::control_mode_policy {

/// Resolve the effective heating mode for this cycle.
/// Touch may override the local mode while its lease is active and it supplied
/// a control_mode. Absent Touch mode keeps the local setting.
inline HeatingProfile resolve_mode(HeatingProfile local, bool touch_active,
                                   bool touch_mode_valid, HeatingProfile touch_mode) {
  if (touch_active && touch_mode_valid)
    return touch_mode;
  return local;
}

/// Classify a zone under the effective mode.
///
/// Normal mode: closes at setpoint and stays latched closed until the room
/// drops below setpoint − comfort_band (hysteresis). Heat-pump mode closes only
/// past setpoint + margin (+ absorb band while buffering).
inline ZoneState classify(HeatingProfile mode, float temp, float setpoint,
                          float comfort_band, float hp_overheat_margin_c,
                          float preheat_advance_c, float absorb_band_c,
                          bool &normal_latched_closed) {
  if (std::isnan(temp))
    return ZoneState::UNKNOWN;

  if (mode == HeatingProfile::NORMAL) {
    if (normal_latched_closed) {
      if (temp < setpoint - comfort_band)
        normal_latched_closed = false;
      else
        return ZoneState::OVERHEATED;
    }
    if (temp >= setpoint) {
      normal_latched_closed = true;
      return ZoneState::OVERHEATED;
    }
    const float demand_threshold = setpoint - comfort_band + preheat_advance_c;
    if (temp >= demand_threshold)
      return ZoneState::SATISFIED;
    return ZoneState::DEMAND;
  }

  // Heat pump
  normal_latched_closed = false;
  const float overheat_cut = setpoint + comfort_band + hp_overheat_margin_c + absorb_band_c;
  if (temp > overheat_cut)
    return ZoneState::OVERHEATED;
  const float demand_threshold = setpoint - comfort_band + preheat_advance_c;
  if (temp >= demand_threshold)
    return ZoneState::SATISFIED;
  return ZoneState::DEMAND;
}

/// Normal-mode opening for a classified state (before hydraulic balance).
/// Heat-pump mode does not use this: dynamic balancing sets every opening
/// (dynamic_balance.h).
///
/// `raw_algorithm_pct` is tanh/linear/PID (+ demand boost) for DEMAND.
inline float normal_position(ZoneState state, float raw_algorithm_pct,
                             float maintenance_base_pct, float max_opening_pct) {
  switch (state) {
    case ZoneState::OVERHEATED:
      return 0.0f;
    case ZoneState::DEMAND:
      return std::clamp(raw_algorithm_pct, 0.0f, max_opening_pct);
    case ZoneState::UNKNOWN:
    case ZoneState::SATISFIED:
    default:
      return maintenance_base_pct;
  }
}

struct HeatDemandTimers {
  uint32_t saturated_ms{0};
  uint32_t headroom_ms{0};
};

struct HeatDemandZoneInput {
  bool enabled{false};
  bool is_primary{true};          ///< Sync-group primary (secondaries inherit)
  bool calibrated{false};
  ZoneState state{ZoneState::UNKNOWN};
  float opening_pct{0.0f};
  float max_opening_pct{100.0f};
  float error_c{NAN};             ///< setpoint − room temperature
};

/// Update saturation/headroom timers and produce the published heat_demand summary.
/// `dt_ms` is the elapsed time since the previous cycle (clamped).
///
/// With dynamic balancing a room in DEMAND already has its full load factor: only
/// a higher supply temperature gives it more (the warmer rooms then hand it their
/// flow). So: RAISE after 20 min with a room in DEMAND; LOWER after 30 min with no
/// room below its target. The critical zone is the room with the greatest deficit.
inline HeatDemandSummary step_heat_demand(HeatDemandTimers &timers, uint32_t dt_ms,
                                          HeatingProfile mode,
                                          const HeatDemandZoneInput *zones, size_t n) {
  static constexpr uint32_t SATURATION_THRESHOLD_MS = 20u * 60u * 1000u;
  static constexpr uint32_t HEADROOM_THRESHOLD_MS = 30u * 60u * 1000u;

  HeatDemandSummary out{};
  if (mode != HeatingProfile::HEAT_PUMP) {
    timers = {};
    return out;
  }

  dt_ms = std::min(dt_ms, uint32_t{60000});  // Cap one cycle's contribution

  float worst_error = -INFINITY;
  bool any_demand = false;
  bool any_known = false;
  bool any_below_target = false;

  for (size_t i = 0; i < n; ++i) {
    const auto &z = zones[i];
    if (!z.enabled || !z.is_primary || !z.calibrated)
      continue;
    if (std::isfinite(z.error_c)) {
      any_known = true;
      if (z.error_c > 0.0f)
        any_below_target = true;
    }
    if (z.state != ZoneState::DEMAND)
      continue;
    any_demand = true;
    out.demanding_zones++;
    const float err = std::isfinite(z.error_c) ? z.error_c : 0.0f;
    if (err >= worst_error) {
      worst_error = err;
      out.critical_zone = static_cast<int8_t>(i);
      out.critical_opening_ratio = z.opening_pct / std::max(1.0f, z.max_opening_pct);
    }
  }

  if (any_demand)
    timers.saturated_ms = std::min(timers.saturated_ms + dt_ms, SATURATION_THRESHOLD_MS * 2);
  else
    timers.saturated_ms = 0;

  out.headroom = any_known && !any_below_target;
  if (out.headroom)
    timers.headroom_ms = std::min(timers.headroom_ms + dt_ms, HEADROOM_THRESHOLD_MS * 2);
  else
    timers.headroom_ms = 0;

  out.saturated_s = timers.saturated_ms / 1000u;

  if (timers.saturated_ms >= SATURATION_THRESHOLD_MS)
    out.recommendation = HeatDemandRecommendation::RAISE;
  else if (timers.headroom_ms >= HEADROOM_THRESHOLD_MS)
    out.recommendation = HeatDemandRecommendation::LOWER;
  else
    out.recommendation = HeatDemandRecommendation::HOLD;

  return out;
}

}  // namespace lv6::control_mode_policy
