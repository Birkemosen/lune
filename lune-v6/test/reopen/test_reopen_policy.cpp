#include "reopen_policy.h"

#include <cmath>
#include <cstdio>
#include <cstdlib>

using namespace lv6;
using namespace lv6::reopen_policy;

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

static constexpr uint32_t MIN_MS = 60u * 1000u;
static constexpr uint32_t HOUR_MS = 60u * MIN_MS;

static void test_floor_lag() {
  expect_near(floor_lag_h(SlabType::CAST_CONCRETE, 8.0f, 0.08f), 1.9f, 0.01f,
              "parquet on 8 cm concrete: 1.5 h + 0.4 h");
  expect_near(floor_lag_h(SlabType::UNSET, 0.0f, NAN), 1.9f, 0.01f, "unset floor uses concrete + parquet");
  expect(floor_lag_h(SlabType::DRY_PLATES, 0.0f, 0.015f) < 0.6f, "dry plates with tile answer fast");
  expect(floor_lag_h(SlabType::CAST_CONCRETE, 15.0f, 0.12f) <= 3.0f, "lag capped at 3 h");
}

static void test_trend() {
  Trend t{};
  update_trend(t, 22.0f, 1000);
  expect(std::isnan(t.slope_c_per_h), "first sample only anchors");
  update_trend(t, 21.9f, 1000 + 10 * MIN_MS);
  expect(std::isnan(t.slope_c_per_h), "no slope inside the window");
  update_trend(t, 21.9f, 1000 + 30 * MIN_MS);
  expect_near(t.slope_c_per_h, -0.2f, 0.001f, "0.1 °C over 30 min = -0.2 °C/h");
  update_trend(t, 21.9f, 1000 + 60 * MIN_MS);
  expect_near(t.slope_c_per_h, -0.12f, 0.001f, "EWMA pulls toward a flat sample");
  update_trend(t, NAN, 1000 + 61 * MIN_MS);
  expect(std::isnan(t.anchor_c) && std::isnan(t.slope_c_per_h), "missing temperature resets the trend");

  Trend w{};
  update_trend(w, 21.0f, 0xFFFFFFFFu - 10 * MIN_MS);
  update_trend(w, 21.5f, 20 * MIN_MS);
  expect_near(w.slope_c_per_h, 1.0f, 0.001f, "millis() wrap keeps the window");
}

static void test_expected_temp() {
  expect_near(expected_temp(22.0f, 0.1f, 2.0f, 0), 22.0f, 1e-6f, "rising room taken as measured");
  expect_near(expected_temp(22.0f, NAN, 2.0f, 0), 22.0f, 1e-6f, "no trend yet: measured");
  expect_near(expected_temp(22.0f, -0.2f, 1.5f, 0), 21.7f, 1e-4f, "falling 0.2 °C/h × 1.5 h");
  expect_near(expected_temp(22.0f, -0.2f, 1.5f, 2 * HOUR_MS), 21.55f, 1e-4f, "2 h closed stretches lag ×1.5");
  expect_near(expected_temp(22.0f, -0.2f, 1.5f, 10 * HOUR_MS), 21.4f, 1e-4f, "stretch saturates at ×2");
  expect_near(expected_temp(22.0f, -3.0f, 3.0f, 10 * HOUR_MS), 21.0f, 1e-4f, "anticipation capped at 1 °C");
}

static void test_reopen_point() {
  expect_near(reopen_point(21.5f, 21.5f), 21.3f, 1e-4f, "Normal (closes at setpoint): 0.2 below it");
  expect_near(reopen_point(21.5f, 22.0f), 21.8f, 1e-4f, "close above +0.5: reopen at +0.3");
  expect_near(reopen_point(21.5f, 23.0f), 21.8f, 1e-4f, "HP overheat cut far above: reopen at +0.3");
}

static void test_step() {
  const float sp = 21.5f, close = 22.0f, lag = 1.9f;
  State s{};
  uint32_t t = 5000;
  expect(!step(s, false, 22.1f, -0.2f, sp, close, lag, t), "open loop: nothing to anticipate");
  expect(!step(s, true, 21.6f, -0.2f, sp, close, lag, t), "just closed: waits for minimum closed time");
  t += 19 * MIN_MS;
  expect(!step(s, true, 21.6f, -0.2f, sp, close, lag, t), "19 min closed: still waiting");
  t += 2 * MIN_MS;
  expect(step(s, true, 21.9f, -0.2f, sp, close, lag, t), "21 min, 21.9 falling 0.2 °C/h: expected 21.5 ≤ 21.8 → reopen");

  State flat{};
  step(flat, true, 21.9f, 0.0f, sp, close, lag, t);
  expect(!step(flat, true, 21.9f, 0.0f, sp, close, lag, t + 30 * MIN_MS), "steady at +0.4: stays closed");
  expect(step(flat, true, 21.8f, 0.0f, sp, close, lag, t + 31 * MIN_MS), "steady at +0.3: reopens");

  expect(step(s, true, 21.9f, 0.0f, sp, close, lag, t + MIN_MS), "inside hysteresis: stays reopened");
  expect(!step(s, true, 22.0f, 0.1f, sp, close, lag, t + 2 * MIN_MS), "rising to +0.5: closes again");
  expect(!step(s, true, 21.6f, -0.3f, sp, close, lag, t + 3 * MIN_MS), "closed anew: minimum closed time restarts");
  expect(step(s, true, 21.6f, -0.3f, sp, close, lag, t + 23 * MIN_MS), "after 20 min: reopens again");

  expect(!step(s, false, 21.4f, -0.3f, sp, close, lag, t + 24 * MIN_MS), "law opens the loop itself: state cleared");
  expect(s.closed_since_ms == 0 && !s.active, "cleared state");

  // Normal closes at setpoint, so it reopens 0.2 °C below it (was setpoint − comfort band).
  State n{};
  const uint32_t t0 = 1000;
  step(n, true, 21.5f, 0.0f, sp, sp, lag, t0);
  expect(!step(n, true, 21.4f, 0.0f, sp, sp, lag, t0 + 25 * MIN_MS), "Normal: steady 21.4 stays closed");
  expect(step(n, true, 21.45f, -0.1f, sp, sp, lag, t0 + 26 * MIN_MS),
         "Normal: 21.45 falling 0.1 °C/h → expected 21.24 ≤ 21.3 → reopen");
}

int main() {
  test_floor_lag();
  test_trend();
  test_expected_temp();
  test_reopen_point();
  test_step();
  std::printf("All reopen policy tests passed\n");
  return 0;
}
