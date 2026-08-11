#pragma once

#include <cmath>
#include <cstddef>
#include <cstdint>

namespace esphome::lune_touch_coordinator::odin_plan {

// Asgard's approved ODIN route publishes the prior/current day plus its forecast.
static constexpr size_t HORIZON_HOURS = 72;

// These are the only operating-mode values documented by ODIN's optimizer
// source. The plan is advisory only: none of these values may create a Touch
// room command, change physical-temperature aggregation, or infer defrost.
enum class OperationMode : uint8_t { OFF, DHW_ON, HEAT_ON, COOL_ON, UNAVAILABLE };

inline OperationMode to_operation_mode(int raw) {
  switch (raw) {
    case 1: return OperationMode::DHW_ON;
    case 2: return OperationMode::HEAT_ON;
    case 3: return OperationMode::COOL_ON;
    case 255: return OperationMode::UNAVAILABLE;
    default: return OperationMode::OFF;
  }
}

inline const char *operation_mode_name(OperationMode mode) {
  switch (mode) {
    case OperationMode::DHW_ON: return "DHW on";
    case OperationMode::HEAT_ON: return "heating on";
    case OperationMode::COOL_ON: return "cooling on";
    case OperationMode::UNAVAILABLE: return "unavailable";
    case OperationMode::OFF:
    default: return "off";
  }
}

inline bool may_drive_room_control(OperationMode) { return false; }
inline bool defrost_state_is_known() { return false; }

struct Snapshot {
  bool success{false};
  uint8_t current_hour{0};
  uint8_t today_start_index{0};
  uint8_t current_index{0};
  float sched_base[HORIZON_HOURS]{};
  float sched_min[HORIZON_HOURS]{};
  float sched_max[HORIZON_HOURS]{};
  float expected_begin_temp[HORIZON_HOURS]{};
  float expected_end_temp[HORIZON_HOURS]{};
  float prices[HORIZON_HOURS]{};
  float heat_production[HORIZON_HOURS]{};
  int operation_mode[HORIZON_HOURS]{};  // Raw code retained for diagnostics.
};

inline bool valid_target_bounds(float minimum, float target, float maximum) {
  return std::isfinite(minimum) && std::isfinite(target) && std::isfinite(maximum) &&
         minimum >= 5.0f && maximum <= 35.0f && minimum <= target && target <= maximum;
}

inline bool validate(const Snapshot &plan) {
  if (!plan.success || plan.current_hour >= 24 || plan.today_start_index >= HORIZON_HOURS ||
      plan.current_index >= HORIZON_HOURS ||
      plan.current_index != plan.today_start_index + plan.current_hour)
    return false;
  for (size_t i = 0; i < HORIZON_HOURS; ++i) {
    if (!valid_target_bounds(plan.sched_min[i], plan.sched_base[i], plan.sched_max[i]) ||
        !std::isfinite(plan.expected_begin_temp[i]) || !std::isfinite(plan.expected_end_temp[i]) ||
        !std::isfinite(plan.prices[i]) || !std::isfinite(plan.heat_production[i]))
      return false;
  }
  return true;
}

inline float current_target_c(const Snapshot &plan) {
  return validate(plan) ? plan.sched_base[plan.current_index] : NAN;
}

}  // namespace esphome::lune_touch_coordinator::odin_plan
