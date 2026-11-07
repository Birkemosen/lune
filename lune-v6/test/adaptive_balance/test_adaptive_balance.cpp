// =============================================================================
// Adaptive balancing step math — Host-runnable unit tests
// =============================================================================
// Build + run (from repo root):
//   clang++ -std=c++17 -O2 -Wall -Wextra \
//     -I components/lv6_zone_controller \
//     test/adaptive_balance/test_adaptive_balance.cpp -o /tmp/test_balance -lm \
//   && /tmp/test_balance
// (Also wired up as `make test-balance`.)
// =============================================================================

#include "adaptive_balance.h"
#include <cmath>
#include <cstdio>

using namespace lv6ab;

static int g_failures = 0;

static void expect(bool cond, const char *what) {
  if (cond) {
    printf("PASS  %s\n", what);
  } else {
    printf("FAIL  %s\n", what);
    g_failures++;
  }
}

static bool near(float a, float b, float eps = 1e-4f) { return std::fabs(a - b) < eps; }

// A room 0.7 K under its setpoint needs 15.7/15 of the heat, about 9 % more flow.
static void test_flow_deviation() {
  DeviationParams p;
  expect(near(flow_deviation(0.0f, p), 0.0f), "deviation: at setpoint → none");
  expect(near(std::exp(flow_deviation(0.7f, p)), (15.7f / 15.0f) * (15.7f / 15.0f), 1e-3f),
         "deviation: 0.7 K cold → (15.7/15)² flow");
  expect(flow_deviation(-0.5f, p) < 0.0f, "deviation: warm room needs less");
  expect(std::isfinite(flow_deviation(-100.0f, p)), "deviation: absurd error stays finite");
}

// When a loop deviates like the others, the shortfall is the supply's, not the loop's.
static void test_common_mode() {
  DeviationParams p;
  p.leak_h = 0.0f;
  const float x = flow_deviation(1.5f, p);
  expect(near(next_factor(1.0f, x, x, p), 1.0f), "common mode: whole house cold equally → no move");
  expect(near(next_factor(1.2f, x, x, p), 1.2f), "common mode: learned factor kept");
}

static void test_direction_and_rate() {
  DeviationParams p;
  p.leak_h = 0.0f;
  const float x_cold = flow_deviation(0.7f, p), x_mean = flow_deviation(0.25f, p);
  const float up = next_factor(1.0f, x_cold, x_mean, p);
  expect(up > 1.0f, "cold loop: factor rises");
  expect(near(std::log(up), (x_cold - x_mean) / 24.0f), "cold loop: takes 1/24 of the deviation per hour");
  expect(next_factor(1.0f, flow_deviation(-0.3f, p), x_mean, p) < 1.0f, "warm loop: factor falls");
}

static void test_leak_to_physics() {
  DeviationParams p;
  float f = 1.3f;
  for (int h = 0; h < 168; h++)
    f = next_factor(f, 0.0f, 0.0f, p);
  expect(f < 1.12f && f > 1.0f, "leak: no evidence for a week → most of the way back to 1");
}

static void test_bounds_and_step() {
  DeviationParams p;
  p.learn_h = 1.0f;
  p.leak_h = 0.0f;
  expect(near(std::log(next_factor(1.0f, 5.0f, 0.0f, p)), p.max_step), "step: one update moves at most max_step");
  float f = 1.0f;
  for (int i = 0; i < 100; i++)
    f = next_factor(f, 5.0f, 0.0f, p);
  expect(near(f, p.bound, 1e-3f), "bound: never past bound");
  for (int i = 0; i < 100; i++)
    f = next_factor(f, -5.0f, 0.0f, p);
  expect(near(f, 1.0f / p.bound, 1e-3f), "bound: never under 1/bound");
}

// Two loops with opposite deviations move by the same ln amount: flow is moved, not added.
static void test_redistributes() {
  DeviationParams p;
  p.leak_h = 0.0f;
  const float a = flow_deviation(0.6f, p), b = flow_deviation(-0.6f, p);
  const float mean = 0.5f * (a + b);
  const float up = std::log(next_factor(1.0f, a, mean, p));
  const float down = std::log(next_factor(1.0f, b, mean, p));
  expect(near(up + down, 0.0f), "redistributes: ln moves sum to zero");
}

int main() {
  printf("=== Adaptive balancing step math tests ===\n");
  test_flow_deviation();
  test_common_mode();
  test_direction_and_rate();
  test_leak_to_physics();
  test_bounds_and_step();
  test_redistributes();
  if (g_failures == 0) {
    printf("\nAll tests passed.\n");
    return 0;
  }
  printf("\n%d test(s) FAILED.\n", g_failures);
  return 1;
}
