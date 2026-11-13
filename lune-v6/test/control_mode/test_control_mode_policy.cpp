#include <limits>
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

static void test_heat_pump_classify() {
  bool latched = false;
  const float sp = 21.0f;
  const float band = 0.5f;
  const float margin = 1.0f;

  expect(classify(HeatingProfile::HEAT_PUMP, 20.0f, sp, band, margin, 0.0f, 0.0f, latched) ==
             ZoneState::DEMAND,
         "HP: below band → DEMAND");
  expect(classify(HeatingProfile::HEAT_PUMP, 21.0f, sp, band, margin, 0.0f, 0.0f, latched) ==
             ZoneState::SATISFIED,
         "HP: at setpoint → SATISFIED (not closed)");
  expect(classify(HeatingProfile::HEAT_PUMP, sp + band + margin + 0.1f, sp, band, margin, 0.0f, 0.0f,
                  latched) == ZoneState::OVERHEATED,
         "HP: past band + margin → OVERHEATED");
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

static void test_normal_position() {
  expect_near(normal_position(ZoneState::OVERHEATED, 50.0f, 15.0f, 90.0f), 0.0f, 0.01f,
              "Normal OVERHEATED → 0%");
  expect_near(normal_position(ZoneState::SATISFIED, 40.0f, 15.0f, 90.0f), 15.0f, 0.01f,
              "Normal SATISFIED uses maintenance base");
  expect_near(normal_position(ZoneState::DEMAND, 55.0f, 15.0f, 90.0f), 55.0f, 0.01f,
              "Normal DEMAND uses algorithm opening");
  expect_near(normal_position(ZoneState::DEMAND, 120.0f, 15.0f, 90.0f), 90.0f, 0.01f,
              "Normal DEMAND capped at max opening");
  expect_near(normal_position(ZoneState::UNKNOWN, 0.0f, 15.0f, 90.0f), 15.0f, 0.01f,
              "Normal UNKNOWN uses maintenance base");
}

static HeatDemandZoneInput zone(bool enabled, bool primary, bool calibrated, ZoneState state,
                                float opening, float error_c) {
  HeatDemandZoneInput z{};
  z.enabled = enabled;
  z.is_primary = primary;
  z.calibrated = calibrated;
  z.state = state;
  z.opening_pct = opening;
  z.max_opening_pct = 100.0f;
  z.error_c = error_c;
  return z;
}

static void test_heat_demand() {
  HeatDemandTimers timers{};
  HeatDemandZoneInput zones[3] = {
      zone(true, true, true, ZoneState::DEMAND, 40.0f, 0.6f),
      zone(true, true, true, ZoneState::DEMAND, 100.0f, 0.9f),
      zone(true, true, true, ZoneState::SATISFIED, 60.0f, -0.2f),
  };

  auto hold = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, zones, 3);
  expect(hold.recommendation == HeatDemandRecommendation::HOLD, "heat_demand starts at HOLD");
  expect(hold.demanding_zones == 2, "two demanding zones counted");
  expect(hold.critical_zone == 1, "critical zone is the greatest deficit");
  expect_near(hold.critical_opening_ratio, 1.0f, 1e-4f, "critical opening ratio reported");
  expect(hold.saturated_s == 60u, "saturated_s advances while a room is in demand");

  for (int i = 0; i < 20; i++)
    hold = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, zones, 3);
  expect(hold.recommendation == HeatDemandRecommendation::RAISE,
         "heat_demand RAISE after 20 min with a room in demand");

  // A demanding room with a small opening still raises: it already has its full share.
  timers = {};
  HeatDemandZoneInput small[1] = {zone(true, true, true, ZoneState::DEMAND, 24.0f, 0.7f)};
  for (int i = 0; i < 21; i++)
    hold = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, small, 1);
  expect(hold.recommendation == HeatDemandRecommendation::RAISE,
         "small loop in demand raises too");

  // Uncalibrated loops are ignored.
  timers = {};
  HeatDemandZoneInput uncal[1] = {zone(true, true, false, ZoneState::DEMAND, 100.0f, 1.0f)};
  auto ignored = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, uncal, 1);
  expect(ignored.demanding_zones == 0, "uncalibrated loop excluded");

  // Every room at or above target → LOWER after 30 min.
  timers = {};
  HeatDemandZoneInput calm[2] = {
      zone(true, true, true, ZoneState::SATISFIED, 100.0f, -0.1f),
      zone(true, true, true, ZoneState::SATISFIED, 40.0f, 0.0f),
  };
  auto lower = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, calm, 2);
  expect(lower.headroom, "headroom when no room is below target");
  for (int i = 0; i < 30; i++)
    lower = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, calm, 2);
  expect(lower.recommendation == HeatDemandRecommendation::LOWER,
         "heat_demand LOWER after 30 min headroom");

  // A room just below target (inside the band) holds: no raise, no lower.
  timers = {};
  HeatDemandZoneInput mid[1] = {zone(true, true, true, ZoneState::SATISFIED, 80.0f, 0.2f)};
  for (int i = 0; i < 40; i++)
    lower = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, mid, 1);
  expect(lower.recommendation == HeatDemandRecommendation::HOLD, "inside the band → HOLD");

  // No temperatures → no headroom.
  timers = {};
  HeatDemandZoneInput blind[1] = {zone(true, true, true, ZoneState::UNKNOWN, 50.0f, NAN)};
  auto none = step_heat_demand(timers, 60'000u, HeatingProfile::HEAT_PUMP, blind, 1);
  expect(!none.headroom, "unknown temperatures give no headroom");

  // Normal mode clears timers / holds recommendation
  timers.saturated_ms = 999999;
  auto normal = step_heat_demand(timers, 60'000u, HeatingProfile::NORMAL, zones, 3);
  expect(normal.recommendation == HeatDemandRecommendation::HOLD,
         "Normal mode does not emit raise/lower");
  expect(timers.saturated_ms == 0, "Normal mode clears heat_demand timers");
}

int main() {
  test_resolve_mode();
  test_normal_latch();
  test_heat_pump_classify();
  test_heat_pump_absorb_extends_margin();
  test_normal_position();
  test_heat_demand();
  std::puts("Control mode policy tests passed.");
  return 0;
}
