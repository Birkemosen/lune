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

/// Below this many °C above the room, manifold flow cannot heat a zone. An
/// overheated heat-pump zone then keeps its floor opening: closing it would
/// only cut flow (the heat pump runs hotter for everyone) without protecting
/// the room — the water may even carry its surplus to colder zones.
static constexpr float HP_COOL_FLOW_MARGIN_C = 1.0f;

/// Map classified state to a raw valve opening (before hydraulic balance).
///
/// `allocator_opening_pct` is the flow-allocator share (heat-pump DEMAND only);
/// `raw_algorithm_pct` is tanh/linear/PID (+ demand boost) for Normal DEMAND and
/// as a fallback when the allocator share is near zero.
///
/// Heat-pump mode follows one continuous curve so floors always see flow and
/// the heat pump can stay at the lowest flow temperature:
///   below setpoint − band     ≥ hp_demand_pct (allocator may give more)
///   setpoint − band → sp      hp_demand_pct → hp_base_pct
///   setpoint → sp + margin    hp_base_pct → hp_trim_floor_pct
///   sp + margin → overheated  hp_trim_floor_pct (held)
///   overheated                0, unless the flow is no warmer than the room
/// NaN for hp_demand_pct / flow_temp_c keeps the previous behaviour (demand
/// floor = base; overheated closes).
inline float position_for_state(HeatingProfile mode, ZoneState state,
                                float allocator_opening_pct, float raw_algorithm_pct,
                                float maintenance_base_pct, float hp_base_pct,
                                float hp_trim_floor_pct, float hp_overheat_margin_c,
                                float temp, float setpoint, float max_opening_pct,
                                bool absorbing, float absorb_band_c,
                                float hp_demand_pct = NAN, float comfort_band_c = 0.5f,
                                float flow_temp_c = NAN) {
  const bool hp = mode == HeatingProfile::HEAT_PUMP;
  const float demand_pct =
      std::isnan(hp_demand_pct) ? hp_base_pct : std::max(hp_demand_pct, hp_base_pct);
  const float floor_pct = std::min(hp_trim_floor_pct, hp_base_pct);
  switch (state) {
    case ZoneState::OVERHEATED:
      if (hp && !std::isnan(flow_temp_c) && !std::isnan(temp) &&
          flow_temp_c <= temp + HP_COOL_FLOW_MARGIN_C)
        return std::clamp(floor_pct, 0.0f, max_opening_pct);
      return 0.0f;
    case ZoneState::UNKNOWN:
      return maintenance_base_pct;
    case ZoneState::DEMAND: {
      float position = 0.0f;
      if (hp && allocator_opening_pct > 1.0f)
        position = allocator_opening_pct;
      else
        position = raw_algorithm_pct;
      // Heat pump: a zone that needs heat never opens less than the demand
      // opening. The allocator decides how much MORE.
      if (hp)
        position = std::max(position, demand_pct);
      return std::clamp(position, 0.0f, max_opening_pct);
    }
    case ZoneState::SATISFIED: {
      if (!hp)
        return maintenance_base_pct;

      float base = hp_base_pct;
      if (absorbing && allocator_opening_pct > 0.0f)
        base = std::max(base, allocator_opening_pct * 0.5f);

      if (temp < setpoint) {
        // Below setpoint but inside the comfort band: lean toward the demand
        // opening the colder the room is.
        const float band = std::max(0.1f, comfort_band_c);
        const float t = std::clamp((setpoint - temp) / band, 0.0f, 1.0f);
        const float target = std::max(base, demand_pct);
        return std::clamp(base + t * (target - base), 0.0f, max_opening_pct);
      }
      if (!(temp > setpoint))
        return std::clamp(base, 0.0f, max_opening_pct);

      const float margin = std::max(0.1f, hp_overheat_margin_c + absorb_band_c);
      const float zone_floor = std::min(floor_pct, base);
      const float excess = temp - setpoint;
      if (excess >= margin)
        return std::clamp(zone_floor, 0.0f, max_opening_pct);  // held until OVERHEATED
      const float t = excess / margin;  // 0 at setpoint → 1 at margin
      return std::clamp(base + t * (zone_floor - base), 0.0f, max_opening_pct);
    }
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
  float max_opening_pct{90.0f};
  float pre_floor_opening_pct{0.0f};  ///< Opening before min-flow floor raise
};

/// Update saturation/headroom timers and produce the published heat_demand summary.
/// `dt_ms` is the elapsed time since the previous cycle (clamped).
inline HeatDemandSummary step_heat_demand(HeatDemandTimers &timers, uint32_t dt_ms,
                                          HeatingProfile mode, float hp_base_pct,
                                          const HeatDemandZoneInput *zones, size_t n) {
  static constexpr uint32_t SATURATION_THRESHOLD_MS = 20u * 60u * 1000u;
  static constexpr uint32_t HEADROOM_THRESHOLD_MS = 30u * 60u * 1000u;
  static constexpr float SATURATION_RATIO = 0.90f;

  HeatDemandSummary out{};
  if (mode != HeatingProfile::HEAT_PUMP) {
    timers = {};
    return out;
  }

  dt_ms = std::min(dt_ms, uint32_t{60000});  // Cap one cycle's contribution

  float best_ratio = 0.0f;
  float max_opening = 0.0f;
  bool any_saturated = false;
  bool any_demand = false;

  for (size_t i = 0; i < n; ++i) {
    const auto &z = zones[i];
    if (!z.enabled || !z.is_primary || !z.calibrated)
      continue;
    // Exclude openings that were forced up by the minimum-flow floor.
    if (z.opening_pct > z.pre_floor_opening_pct + 0.01f)
      continue;

    const float max_open = std::max(1.0f, z.max_opening_pct);
    const float ratio = z.opening_pct / max_open;
    if (z.opening_pct > max_opening)
      max_opening = z.opening_pct;

    if (z.state == ZoneState::DEMAND) {
      any_demand = true;
      out.demanding_zones++;
      if (ratio >= best_ratio) {
        best_ratio = ratio;
        out.critical_zone = static_cast<int8_t>(i);
        out.critical_opening_ratio = ratio;
      }
      if (ratio >= SATURATION_RATIO)
        any_saturated = true;
    }
  }

  if (any_saturated)
    timers.saturated_ms = std::min(timers.saturated_ms + dt_ms, SATURATION_THRESHOLD_MS * 2);
  else
    timers.saturated_ms = 0;

  out.headroom = !any_demand && max_opening < hp_base_pct;
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
