#include "control_mode_policy.h"

#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>

using namespace lv6;
using namespace lv6::control_mode_policy;

static void expect(bool cond, const char *msg) {
  if (!cond) {
    std::fprintf(stderr, "FAIL  %s\n", msg);
    std::exit(1);
  }
  std::printf("PASS  %s\n", msg);
}

static void expect_near(float a, float b, float tol, const char *msg) {
  expect(std::fabs(a - b) <= tol, msg);
}

static void test_resolve_mode() {
  expect(resolve_mode(HeatingProfile::HEAT_PUMP, false, true, HeatingProfile::NORMAL) ==
             HeatingProfile::HEAT_PUMP,
         "no Touch lease → local mode");
  expect(resolve_mode(HeatingProfile::HEAT_PUMP, true, false, HeatingProfile::NORMAL) ==
             HeatingProfile::HEAT_PUMP,
         "Touch lease without control_mode → local mode");
  expect(resolve_mode(HeatingProfile::HEAT_PUMP, true, true, HeatingProfile::NORMAL) ==
             HeatingProfile::NORMAL,
         "Touch lease with control_mode overrides local");
}

static void test_normal_latch() {
  bool latched = false;
  const float sp = 21.0f;
  const float band = 0.5f;

  expect(classify(HeatingProfile::NORMAL, 20.0f, sp, band, 1.0f, 0.0f, 0.0f, latched) ==
             ZoneState::DEMAND,
         "Normal: below band → DEMAND");
  expect(!latched, "Normal: DEMAND does not latch");

  expect(classify(HeatingProfile::NORMAL, 21.0f, sp, band, 1.0f, 0.0f, 0.0f, latched) ==
             ZoneState::OVERHEATED,
         "Normal: at setpoint → OVERHEATED and latch");
  expect(latched, "Normal: latched closed at setpoint");

  expect(classify(HeatingProfile::NORMAL, 20.7f, sp, band, 1.0f, 0.0f, 0.0f, latched) ==
             ZoneState::OVERHEATED,
         "Normal: stays latched above setpoint − band");
  expect(latched, "Normal: still latched");

  expect(classify(HeatingProfile::NORMAL, 20.4f, sp, band, 1.0f, 0.0f, 0.0f, latched) ==
             ZoneState::DEMAND,
         "Normal: below setpoint − band clears latch → DEMAND");
  expect(!latched, "Normal: latch cleared");
}

static void test_heat_pump_base_trim_cutoff() {
  bool latched = false;
  const float sp = 21.0f;
  const float band = 0.5f;
  const float margin = 1.0f;
  const float base = 60.0f;
  const float floor = 15.0f;
  const float max_open = 90.0f;

  expect(classify(HeatingProfile::HEAT_PUMP, 20.0f, sp, band, margin, 0.0f, 0.0f, latched) ==
             ZoneState::DEMAND,
         "HP: below band → DEMAND");

  expect(classify(HeatingProfile::HEAT_PUMP, 21.0f, sp, band, margin, 0.0f, 0.0f, latched) ==
             ZoneState::SATISFIED,
         "HP: at setpoint → SATISFIED (not closed)");

  float hold = position_for_state(HeatingProfile::HEAT_PUMP, ZoneState::SATISFIED, 0.0f, 0.0f,
                                  15.0f, base, floor, margin, sp, sp, max_open, false, 0.0f);
  expect_near(hold, base, 0.01f, "HP: at setpoint holds base opening");

  float mid = position_for_state(HeatingProfile::HEAT_PUMP, ZoneState::SATISFIED, 0.0f, 0.0f, 15.0f,
                                 base, floor, margin, sp + 0.5f, sp, max_open, false, 0.0f);
  expect(mid < base && mid > floor, "HP: mid-margin soft-trims between base and floor");

  float at_margin = position_for_state(HeatingProfile::HEAT_PUMP, ZoneState::SATISFIED, 0.0f, 0.0f,
                                       15.0f, base, floor, margin, sp + margin, sp, max_open, false,
                                       0.0f);
  expect_near(at_margin, 0.0f, 0.01f, "HP: at margin edge closes");

  expect(classify(HeatingProfile::HEAT_PUMP, sp + band + margin + 0.1f, sp, band, margin, 0.0f, 0.0f,
                  latched) == ZoneState::OVERHEATED,
         "HP: past margin → OVERHEATED");

  float closed = position_for_state(HeatingProfile::HEAT_PUMP, ZoneState::OVERHEATED, 0.0f, 0.0f,
                                    15.0f, base, floor, margin, 30.0f, sp, max_open, false, 0.0f);
  expect_near(closed, 0.0f, 0.01f, "HP: OVERHEATED → 0%");
}

static void test_heat_pump_absorb_extends_margin() {
  bool latched = false;
  const float sp = 21.0f;
  const float band = 0.5f;
  const float margin = 1.0f;
  const float absorb = 1.0f;

  // Without absorb: past margin → OVERHEATED
  expect(classify(HeatingProfile::HEAT_PUMP, sp + band + margin + 0.2f, sp, band, margin, 0.0f, 0.0f,
                  latched) == ZoneState::OVERHEATED,
         "HP without absorb: past margin closes");

  // With absorb band: same temp still SATISFIED
  expect(classify(HeatingProfile::HEAT_PUMP, sp + band + margin + 0.2f, sp, band, margin, 0.0f,
                  absorb, latched) == ZoneState::SATISFIED,
         "HP with absorb: margin extended keeps SATISFIED");
}

static void test_normal_position_closes() {
  float closed = position_for_state(HeatingProfile::NORMAL, ZoneState::OVERHEATED, 40.0f, 50.0f,
                                    15.0f, 60.0f, 15.0f, 1.0f, 21.5f, 21.0f, 90.0f, false, 0.0f);
  expect_near(closed, 0.0f, 0.01f, "Normal OVERHEATED → 0%");

  float sat = position_for_state(HeatingProfile::NORMAL, ZoneState::SATISFIED, 0.0f, 40.0f, 15.0f,
                                 60.0f, 15.0f, 1.0f, 20.8f, 21.0f, 90.0f, false, 0.0f);
  expect_near(sat, 15.0f, 0.01f, "Normal SATISFIED uses maintenance base");

  float dem = position_for_state(HeatingProfile::NORMAL, ZoneState::DEMAND, 0.0f, 55.0f, 15.0f, 60.0f,
                                 15.0f, 1.0f, 20.0f, 21.0f, 90.0f, false, 0.0f);
  expect_near(dem, 55.0f, 0.01f, "Normal DEMAND uses algorithm opening");
}

static HeatDemandZoneInput zone(bool enabled, bool primary, bool calibrated, ZoneState state,
                                float opening, float max_open, float pre_floor) {
  HeatDemandZoneInput z{};
  z.enabled = enabled;
  z.is_primary = primary;
  z.calibrated = calibrated;
  z.state = state;
  z.opening_pct = opening;
  z.max_opening_pct = max_open;
  z.pre_floor_opening_pct = pre_floor;
  return z;
}

static void test_heat_demand() {
  HeatDemandTimers timers{};
  HeatDemandZoneInput zones[2] = {
      zone(true, true, true, ZoneState::DEMAND, 90.0f, 90.0f, 90.0f),
      zone(true, true, true, ZoneState::SATISFIED, 50.0f, 90.0f, 50.0f),
  };

  auto hold = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, 60.0f, zones, 2);
  expect(hold.recommendation == HeatDemandRecommendation::HOLD, "heat_demand starts at HOLD");
  expect(hold.demanding_zones == 1, "one demanding zone counted");
  expect(hold.critical_zone == 0, "critical zone is the saturated demander");
  expect(hold.saturated_s == 60u, "saturated_s advances while saturated");

  // Advance past 20 minutes of saturation
  for (int i = 0; i < 20; i++)
    hold = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, 60.0f, zones, 2);
  expect(hold.recommendation == HeatDemandRecommendation::RAISE,
         "heat_demand RAISE after 20 min saturation");

  // Min-flow-raised zone excluded from demand accounting
  timers = {};
  HeatDemandZoneInput floored[1] = {
      zone(true, true, true, ZoneState::DEMAND, 40.0f, 90.0f, 10.0f),
  };
  auto ignored =
      step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, 60.0f, floored, 1);
  expect(ignored.demanding_zones == 0, "min-flow-raised openings excluded");
  expect(ignored.recommendation == HeatDemandRecommendation::HOLD,
         "excluded floor raise does not drive RAISE");

  // Headroom → LOWER after 30 min
  timers = {};
  HeatDemandZoneInput calm[1] = {
      zone(true, true, true, ZoneState::SATISFIED, 40.0f, 90.0f, 40.0f),
  };
  auto lower = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, 60.0f, calm, 1);
  expect(lower.headroom, "headroom when no demand and opening below base");
  for (int i = 0; i < 30; i++)
    lower = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, 60.0f, calm, 1);
  expect(lower.recommendation == HeatDemandRecommendation::LOWER,
         "heat_demand LOWER after 30 min headroom");

  // Normal mode clears timers / holds recommendation
  timers.saturated_ms = 999999;
  auto normal = step_heat_demand(timers, 60'000u, HeatingProfile::NORMAL, 60.0f, zones, 2);
  expect(normal.recommendation == HeatDemandRecommendation::HOLD,
         "Normal mode does not emit raise/lower");
  expect(timers.saturated_ms == 0, "Normal mode clears heat_demand timers");
}

int main() {
  test_resolve_mode();
  test_normal_latch();
  test_heat_pump_base_trim_cutoff();
  test_heat_pump_absorb_extends_margin();
  test_normal_position_closes();
  test_heat_demand();
  std::puts("Control mode policy tests passed.");
  return 0;
}
