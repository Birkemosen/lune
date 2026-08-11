#include "odin_plan.h"

#include <cassert>
#include <cstring>
#include <cstdio>

using namespace esphome::lune_touch_coordinator::odin_plan;

int main() {
  assert(to_operation_mode(1) == OperationMode::DHW_ON);
  assert(to_operation_mode(2) == OperationMode::HEAT_ON);
  assert(to_operation_mode(3) == OperationMode::COOL_ON);
  assert(to_operation_mode(255) == OperationMode::UNAVAILABLE);
  assert(to_operation_mode(5) == OperationMode::OFF);
  assert(to_operation_mode(6) == OperationMode::OFF);
  assert(std::strcmp(operation_mode_name(to_operation_mode(1)), "DHW on") == 0);
  assert(!may_drive_room_control(to_operation_mode(1)));
  assert(!may_drive_room_control(to_operation_mode(2)));
  assert(!may_drive_room_control(to_operation_mode(3)));
  assert(!may_drive_room_control(to_operation_mode(255)));
  assert(!defrost_state_is_known());

  Snapshot plan{};
  plan.success = true;
  plan.current_hour = 13;
  plan.today_start_index = 24;
  plan.current_index = 37;
  for (size_t i = 0; i < HORIZON_HOURS; ++i) {
    plan.sched_min[i] = 20.0f;
    plan.sched_base[i] = 21.0f;
    plan.sched_max[i] = 22.5f;
    plan.expected_begin_temp[i] = 21.0f;
    plan.expected_end_temp[i] = 21.0f;
    plan.prices[i] = 0.27f;
    plan.heat_production[i] = 0.0f;
  }
  assert(validate(plan));
  assert(current_target_c(plan) == 21.0f);
  plan.sched_max[7] = 20.5f;
  assert(!validate(plan));
  assert(!std::isfinite(current_target_c(plan)));
  plan.sched_max[7] = 22.5f;
  plan.expected_end_temp[7] = NAN;
  assert(!validate(plan));
  plan.expected_end_temp[7] = 21.0f;
  plan.current_index = HORIZON_HOURS;
  assert(!validate(plan));
  std::puts("ODIN plan validation tests passed.");
}
