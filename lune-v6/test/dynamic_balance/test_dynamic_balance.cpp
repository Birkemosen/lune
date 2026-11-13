#include "dynamic_balance.h"
#include "zone_area.h"

#include <cmath>
#include <cstdio>
#include <cstdlib>

using namespace lv6::dynamic_balance;

static void expect(bool cond, const char *msg) {
  if (!cond) {
    std::fprintf(stderr, "FAIL  %s\n", msg);
    std::exit(1);
  }
  std::printf("PASS  %s\n", msg);
}

static void expect_near(float a, float b, float tol, const char *msg) {
  if (std::fabs(a - b) > tol)
    std::fprintf(stderr, "      got %.4f, want %.4f\n", a, b);
  expect(std::fabs(a - b) <= tol, msg);
}

static float sum6(const float (&v)[6]) {
  float s = 0.0f;
  for (float x : v) s += x;
  return s;
}

static void test_load_factor() {
  const Params p{0.5f, 1.0f, 0.0f};
  expect_near(load_factor(20.0f, 21.0f, p), 1.0f, 1e-4f, "load: one band below target → 1");
  expect_near(load_factor(20.5f, 21.0f, p), 1.0f, 1e-4f, "load: exactly one band below → 1");
  expect_near(load_factor(22.0f, 21.0f, p), G_MIN, 1e-4f, "load: target + margin → G_MIN");
  expect_near(load_factor(23.0f, 21.0f, p), G_MIN, 1e-4f, "load: hotter still → G_MIN");
  const float at_target = G_MIN + (1.0f / 1.5f) * (1.0f - G_MIN);
  expect_near(load_factor(21.0f, 21.0f, p), at_target, 1e-4f, "load: at target, linear");
  expect_near(load_factor(NAN, 21.0f, p), 1.0f, 1e-4f, "load: no temperature → 1");
  expect(load_factor(21.2f, 21.0f, p) < load_factor(21.1f, 21.0f, p), "load: falls as the room warms");
}

static void test_closed_latch() {
  const Params p{0.5f, 1.0f, 0.0f};
  // Limit = 21 + 0.5 + 1.0 = 22.5
  expect(!update_closed(false, 22.5f, 21.0f, p), "latch: at the limit stays open");
  expect(update_closed(false, 22.6f, 21.0f, p), "latch: above the limit closes");
  expect(update_closed(true, 22.3f, 21.0f, p), "latch: stays closed inside the hysteresis");
  expect(!update_closed(true, 22.1f, 21.0f, p), "latch: reopens 0.3 below the limit");
  const Params absorb{0.5f, 1.0f, 1.0f};
  expect(!update_closed(false, 23.0f, 21.0f, absorb), "latch: absorb band raises the limit");
  expect(!update_closed(true, NAN, 21.0f, p), "latch: no temperature → open");
}

// Ground floor priors from a real manifold (design share incl. learned correction).
static const float SHARES[6] = {0.35f, 0.315f, 0.67f, 0.85f, 1.0f, 0.24f};

static void make_loops(Loop (&loops)[6], const float (&temps)[6], float sp) {
  for (int i = 0; i < 6; i++) {
    loops[i].enabled = true;
    loops[i].design_share = SHARES[i];
    loops[i].house_balance = 1.0f;
    loops[i].temp_c = temps[i];
    loops[i].setpoint_c = sp;
    loops[i].max_opening_pct = 100.0f;
    loops[i].curve = {0.0f, 100.0f};  // linear: openings read as relative flow
  }
}

static void test_all_cold_is_static_balance() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {20, 20, 20, 20, 20, 20};
  make_loops(loops, temps, 21.0f);
  bool closed[6]{};
  float open[6], q[6];
  const Result r = distribute(loops, p, closed, open, q);
  expect_near(r.q_ref, 3.425f, 1e-3f, "static: Q_ref = Σ shares");
  expect_near(sum6(q), r.q_ref, 1e-3f, "static: total equals Q_ref");
  expect_near(open[4], 100.0f, 0.01f, "static: index loop fully open");
  expect_near(open[3], 85.0f, 0.01f, "static: others at their design share");
  expect_near(open[5], 24.0f, 0.01f, "static: smallest at its share");
}

static void test_warm_rooms_give_flow_to_cold() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  // Kontor cold, everyone else 0.8 above target.
  const float temps[6] = {20.0f, 21.8f, 21.8f, 21.8f, 21.8f, 21.8f};
  make_loops(loops, temps, 21.0f);
  bool closed[6]{};
  float open[6], q[6];
  const Result r = distribute(loops, p, closed, open, q);
  expect_near(r.load, 1.0f, 1e-4f, "redistribute: a cold room keeps the manifold at full load");
  expect_near(open[0], 100.0f, 0.01f, "redistribute: cold room takes up to full flow");
  const float g = load_factor(21.8f, 21.0f, p);
  for (int i = 1; i < 6; i++)
    expect_near(q[i], std::max(SHARES[i] * g, Q_MIN), 1e-3f,
                "redistribute: warm rooms keep their share × load, not the cold room's surplus");
  expect(sum6(q) < r.q_ref, "redistribute: what the cold room cannot take is not passed on");
}

static void test_closed_flow_goes_to_others() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {21.0f, 21.0f, 21.0f, 21.0f, 23.0f, 21.0f};  // index overheated
  make_loops(loops, temps, 21.0f);
  bool closed[6]{};
  for (int i = 0; i < 6; i++)
    closed[i] = update_closed(closed[i], loops[i].temp_c, loops[i].setpoint_c, p);
  float open[6], q[6];
  const Result r = distribute(loops, p, closed, open, q);
  expect(closed[4], "closed: overheated index loop latched");
  expect_near(open[4], 0.0f, 1e-4f, "closed: no flow in the overheated loop");
  expect_near(r.load, load_factor(21.0f, 21.0f, p), 1e-4f, "closed: load = the neediest open room");
  expect_near(sum6(q), r.q_ref * r.load, 1e-3f, "closed: the others carry the manifold's flow");
  expect(q[3] > 0.85f * r.load + 0.05f, "closed: the next loop gets more than its own share");
}

static void test_closed_flow_skips_warm_rooms() {
  // Stueetage 2026-11-05 01:00: five rooms closed, Bad open at target + 1.0 (limit 23.0).
  const Params p{0.5f, 0.5f, 0.0f};
  Loop loops[6];
  const float temps[6] = {23.4f, 23.9f, 23.4f, 23.3f, 23.4f, 23.0f};
  make_loops(loops, temps, 22.0f);
  bool closed[6]{};
  for (int i = 0; i < 6; i++)
    closed[i] = update_closed(closed[i], loops[i].temp_c, loops[i].setpoint_c, p);
  float open[6], q[6];
  const Result r = distribute(loops, p, closed, open, q);
  expect(!closed[5] && closed[0] && closed[4], "warm rest: only Bad stays open");
  expect_near(q[5], std::max(SHARES[5] * G_MIN, Q_MIN), 1e-3f, "warm rest: Bad keeps its own share × load (min Q_MIN), not the closed loops' flow");
  expect_near(r.q_target, SHARES[5] * G_MIN, 1e-3f, "warm rest: the target counts only the open loop");
}

static void test_warm_manifold_throttles() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  // Every room above target (a warm floor): the manifold passes less in total.
  const float temps[6] = {22.6f, 22.5f, 22.8f, 23.2f, 22.9f, 23.0f};
  make_loops(loops, temps, 22.0f);
  bool closed[6]{};
  float open[6], q[6];
  const Result r = distribute(loops, p, closed, open, q);
  expect_near(r.load, load_factor(22.5f, 22.0f, p), 1e-4f, "warm floor: load = the coolest room");
  expect(r.load < 0.6f, "warm floor: well below full load");
  for (int i = 0; i < 6; i++)
    expect_near(q[i], std::max(SHARES[i] * load_factor(temps[i], 22.0f, p), Q_MIN), 1e-3f,
                "warm floor: every room at its share × its own load");
  expect(sum6(q) <= r.q_ref * r.load + Q_MIN, "warm floor: total at most Q_ref × load (+ the Q_MIN floor)");
  expect(open[4] < 100.0f, "warm floor: index loop no longer fully open");
  for (int i = 0; i < 6; i++)
    expect(open[i] > 0.0f, "warm floor: every loop keeps flow");
}

static void test_never_all_closed() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {23.5f, 23.0f, 24.0f, 23.2f, 23.8f, 23.1f};
  make_loops(loops, temps, 21.0f);
  bool closed[6];
  for (bool &c : closed) c = true;
  float open[6], q[6];
  distribute(loops, p, closed, open, q);
  int open_count = 0;
  for (int i = 0; i < 6; i++)
    if (open[i] > 0.0f) open_count++;
  expect(open_count == 1, "all hot: exactly one loop stays open");
  expect(open[1] > 0.0f, "all hot: the one nearest its limit");
}

static void test_house_balance_and_caps() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {20, 20, 20, 20, 20, 20};
  make_loops(loops, temps, 21.0f);
  for (Loop &l : loops) l.house_balance = 0.5f;
  bool closed[6]{};
  float open[6], q[6];
  Result r = distribute(loops, p, closed, open, q);
  expect_near(r.q_ref, 3.425f * 0.5f, 1e-3f, "house balance: lowers the manifold's total");
  expect_near(open[4], 50.0f, 0.01f, "house balance: index at half");

  make_loops(loops, temps, 21.0f);
  loops[4].max_opening_pct = 80.0f;
  loops[5].design_share = 0.02f;
  r = distribute(loops, p, closed, open, q);
  expect_near(open[4], 80.0f, 0.01f, "cap: max opening respected");
  expect_near(open[5], 100.0f * Q_MIN, 0.01f, "floor: an open loop never below Q_MIN");

  loops[2].enabled = false;
  r = distribute(loops, p, closed, open, q);
  expect_near(open[2], 0.0f, 1e-4f, "disabled: no flow");
}

static void test_valve_curve() {
  using namespace lv6::valve_curve;
  const Curve c{8.0f, 40.0f};
  expect_near(flow_fraction(5.0f, c), 0.0f, 1e-6f, "curve: no flow below start");
  expect_near(flow_fraction(24.0f, c), 0.5f, 1e-6f, "curve: linear between start and full");
  expect_near(flow_fraction(70.0f, c), 1.0f, 1e-6f, "curve: full flow above full");
  expect_near(opening_for(0.5f, c), 24.0f, 1e-4f, "curve: inverse");
  expect_near(opening_for(0.0f, c), 0.0f, 1e-6f, "curve: zero flow is closed");
  expect_near(opening_for(1.5f, c), 40.0f, 1e-4f, "curve: q above 1 stops at full");
  // The fixed model: a heating loop opens at least MIN_HEAT_OPEN_PCT, linear to 100 %.
  expect_near(opening_for(0.01f), MIN_HEAT_OPEN_PCT + 0.9f, 1e-3f, "model: smallest flow opens past the minimum");
  expect_near(opening_for(1.0f), 100.0f, 1e-4f, "model: full flow is the pin's full travel");
  expect_near(flow_fraction(55.0f), 0.5f, 1e-4f, "model: linear between the minimum and 100 %");
  // Laura, 1. sal 2026-11-13: 51 % of 1767 counts measured 1.0 mm.
  expect_near(opening_mm(51.0f, 1767.0f), 0.99f, 0.02f, "model: 51 % of Laura's travel is 1.0 mm");
  expect(std::isnan(opening_mm(51.0f, 0.0f)), "model: no learned travel, no mm");
}

static void test_distribute_through_curve() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {20, 20, 20, 20, 20, 20};
  make_loops(loops, temps, 21.0f);
  for (Loop &l : loops) l.curve = {8.0f, 40.0f};  // 8 → 40 %, independent of the default
  bool closed[6]{};
  float open[6], q[6];
  distribute(loops, p, closed, open, q);
  expect_near(open[4], 8.0f + 1.1f * 32.0f, 0.01f, "curve: index loop at 110 % on its curve, not 100 %");
  expect_near(open[3], 8.0f + 0.85f * 32.0f, 0.01f, "curve: share mapped through the curve");
  expect(open[5] > 8.0f, "curve: smallest loop above where flow starts");

  // Warm manifold: small flows stay above the start of the curve.
  const float warm[6] = {22.6f, 22.5f, 22.8f, 23.2f, 22.9f, 23.0f};
  make_loops(loops, warm, 22.0f);
  for (Loop &l : loops) l.curve = {8.0f, 40.0f};
  distribute(loops, p, closed, open, q);
  for (int i = 0; i < 6; i++)
    expect(open[i] >= 8.0f + Q_MIN * 32.0f - 1e-3f, "curve: warm loop keeps real flow");

  // Max opening below full flow caps the loop's flow.
  make_loops(loops, temps, 21.0f);
  for (Loop &l : loops) l.curve = {8.0f, 40.0f};
  loops[4].max_opening_pct = 24.0f;
  distribute(loops, p, closed, open, q);
  expect_near(q[4], 0.5f, 1e-3f, "curve: max opening 24 % caps the loop at half flow");
  expect_near(open[4], 24.0f, 0.01f, "curve: and the valve at 24 %");
  // Max opening above full flow does not cap.
  loops[4].max_opening_pct = 80.0f;
  distribute(loops, p, closed, open, q);
  expect_near(q[4], 1.0f, 1e-3f, "curve: max opening above full flow is no cap");
}

static void test_zone_area() {
  using namespace lv6::zone_area;
  lv6::ZoneConfig z[lv6::NUM_ZONES];
  expect(z[0].area_m2 == 0.0f && !is_set(z[0].area_m2), "area: a new zone has no area");
  expect_near(fallback(z), FALLBACK_M2, 1e-4f, "area: no areas anywhere → fallback");
  z[0].area_m2 = 20.0f;
  z[1].area_m2 = 10.0f;
  z[2].area_m2 = 40.0f;
  z[2].enabled = false;
  expect_near(fallback(z), 15.0f, 1e-4f, "area: mean of the enabled zones that have one");
  fill_unset(z);
  expect_near(z[3].area_m2, 15.0f, 1e-4f, "area: unset zone gets the mean");
  expect_near(z[0].area_m2, 20.0f, 1e-4f, "area: a set area is kept");
}

static void test_heat_moving() {
  // 1. sal 2026-11-07 afternoon: Stue Repo in the sun far over its limit, supply 25 C
  // from the buffer, Josephine below target.
  Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {22.3f, 22.4f, 22.6f, 30.5f, 22.5f, 22.5f};
  make_loops(loops, temps, 22.5f);
  bool closed[6]{};
  for (int i = 0; i < 6; i++)
    closed[i] = update_closed(closed[i], loops[i].temp_c, loops[i].setpoint_c, p);
  float open0[6], q0[6], open[6], q[6];
  bool closed0[6];
  for (int i = 0; i < 6; i++) closed0[i] = closed[i];
  distribute(loops, p, closed0, open0, q0);  // no supply temperature: no heat moving
  p.supply_c = 25.0f;
  bool moving[6]{};
  const Result r = distribute(loops, p, closed, open, q, moving);
  expect(closed[3] && moving[3] && r.moving == 1, "moving: the sunny room's loop reopens");
  expect_near(q[3], SHARES[3], 1e-3f, "moving: it gets its balanced share");
  for (int i = 0; i < 6; i++)
    if (i != 3)
      expect_near(q[i], q0[i], 1e-4f, "moving: the other loops keep their flows");

  // Hysteresis: 0.4 K below keeps it moving, but does not start it.
  loops[3].temp_c = 25.4f;
  distribute(loops, p, closed, open, q, moving);
  expect(closed[3] && moving[3], "moving: holds above on − MOVE_HYST_K");
  expect(!update_moving(false, 25.4f, 25.0f), "moving: does not start below MOVE_ON_K");
  expect(!update_moving(true, 25.15f, 25.0f), "moving: stops below on − MOVE_HYST_K");
  expect(update_moving(false, 25.0f, 25.0f, 0.0f), "moving: threshold 0 starts at equal temperatures");
  expect(!update_moving(false, 25.9f, 25.0f, 1.0f), "moving: threshold 1 waits for 1 K");

  // No room wants heat: nothing moves.
  const float warm[6] = {23.5f, 23.4f, 23.6f, 30.5f, 23.5f, 23.5f};
  make_loops(loops, warm, 22.5f);
  bool c2[6]{}, m2[6]{};
  for (int i = 0; i < 6; i++)
    c2[i] = update_closed(c2[i], loops[i].temp_c, loops[i].setpoint_c, p);
  const Result r2 = distribute(loops, p, c2, open, q, m2);
  expect(r2.moving == 0 && q[3] == 0.0f, "moving: not while every room is warm");
}

static void test_idle_static_balance() {
  // Heat source idle: open loops at or below target at their design share; a warm room at
  // its share × load factor (1. sal 2026-11-13: Stue Repo 1.4 K warm at 100 %).
  Params p{0.5f, 1.0f, 0.0f};
  p.idle = true;
  p.supply_c = 30.0f;  // buffer still warm after a charge
  Loop loops[6];
  const float temps[6] = {21.0f, 22.4f, 22.9f, 25.0f, 22.0f, 23.2f};
  make_loops(loops, temps, 22.0f);
  bool closed[6]{}, moving[6]{};
  for (int i = 0; i < 6; i++)
    closed[i] = update_closed(closed[i], loops[i].temp_c, loops[i].setpoint_c, p);
  float open[6], q[6];
  distribute(loops, p, closed, open, q, moving);
  for (int i = 0; i < 6; i++) {
    if (i == 3)
      continue;
    if (temps[i] > 22.0f)
      expect_near(q[i], std::max(SHARES[i] * load_factor(temps[i], 22.0f, p), Q_MIN), 1e-3f,
                  "idle: a warm room at its share × load factor");
    else  // what the warm rooms no longer take goes to the rooms that want it
      expect(q[i] >= SHARES[i] - 1e-3f && q[i] <= 1.0f + 1e-3f, "idle: a cold room at least at its design share");
  }
  expect(q[5] < SHARES[5] * 0.5f, "idle: 1.2 K warm takes well under half its share");
  expect(closed[3] && !moving[3] && q[3] == 0.0f, "idle: a warm room stays closed while the water would heat it");

  // The buffer has cooled below the warm room: it moves heat even with no cold room.
  const float warm[6] = {23.2f, 23.4f, 23.0f, 25.0f, 23.1f, 23.2f};
  make_loops(loops, warm, 22.0f);
  p.supply_c = 23.5f;
  bool c2[6]{}, m2[6]{};
  for (int i = 0; i < 6; i++)
    c2[i] = update_closed(c2[i], loops[i].temp_c, loops[i].setpoint_c, p);
  distribute(loops, p, c2, open, q, m2);
  expect(c2[3] && m2[3], "idle: moves heat without a cold room");
  expect_near(q[3], SHARES[3], 1e-3f, "idle: the moving loop at its design share");
  expect_near(q[4], std::max(SHARES[4] * load_factor(23.1f, 22.0f, p), Q_MIN), 1e-3f,
              "idle: warm open rooms at their share × load factor");
}

static void test_full_flow_margin() {
  const Params p{0.5f, 1.0f, 0.0f};
  Loop loops[6];
  const float temps[6] = {20, 20, 20, 20, 20, 20};
  make_loops(loops, temps, 21.0f);
  loops[4].curve = {2.5f, 27.5f};  // Stue Repo
  bool closed[6]{};
  float open[6], q[6];
  distribute(loops, p, closed, open, q);
  expect_near(q[4], 1.0f, 1e-4f, "full margin: index loop at full flow");
  expect_near(open[4], 2.5f + 1.1f * 25.0f, 1e-3f, "full margin: opens to 110 % on its curve");
  loops[4].max_opening_pct = 29.0f;
  distribute(loops, p, closed, open, q);
  expect_near(open[4], 29.0f, 1e-3f, "full margin: never past the max opening");
}

int main() {
  test_full_flow_margin();
  test_zone_area();
  test_valve_curve();
  test_distribute_through_curve();
  test_load_factor();
  test_closed_latch();
  test_all_cold_is_static_balance();
  test_warm_rooms_give_flow_to_cold();
  test_closed_flow_goes_to_others();
  test_closed_flow_skips_warm_rooms();
  test_warm_manifold_throttles();
  test_never_all_closed();
  test_heat_moving();
  test_idle_static_balance();
  test_house_balance_and_caps();
  std::printf("All dynamic balance tests passed.\n");
  return 0;
}
