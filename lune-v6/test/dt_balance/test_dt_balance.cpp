#include "dt_balance.h"

#include <cmath>
#include <cstdio>
#include <cstdlib>

using namespace lv6::dt_balance;

static void expect(bool cond, const char *msg) {
  if (!cond) {
    std::fprintf(stderr, "FAIL  %s\n", msg);
    std::exit(1);
  }
  std::printf("PASS  %s\n", msg);
}

static constexpr float DT = 10.0f;  // control cycle, s

// 1. sal 2026-11-13: supply 28.5, Toilet's return almost at the supply.
static void make(LoopIn (&in)[6]) {
  const float ret[6] = {26.0f, 25.9f, 27.6f, 25.3f, 25.7f, 23.0f};
  const float room[6] = {21.3f, 18.8f, 20.5f, 23.0f, 22.5f, 22.2f};
  const float sp[6] = {22.0f, 22.0f, 22.0f, 23.0f, 23.0f, 21.0f};
  const float open[6] = {100, 100, 27, 100, 100, 33};
  const float q[6] = {1.0f, 1.0f, 0.19f, 1.0f, 1.0f, 0.3f};
  const float share[6] = {0.88f, 0.88f, 0.15f, 1.0f, 1.0f, 1.0f};
  for (int i = 0; i < 6; i++) {
    in[i].enabled = true;
    in[i].has_return = true;
    in[i].return_c = ret[i];
    in[i].room_c = room[i];
    in[i].setpoint_c = sp[i];
    in[i].opening_pct = open[i];
    in[i].q = q[i];
    in[i].share = share[i];
  }
}

static void run(State<6> &s, const LoopIn (&in)[6], float seconds, bool running = true, bool hold = false) {
  for (float t = 0; t < seconds; t += DT)
    step(s, in, 28.5f, running, hold, DT);
}

static void test_waits_for_steady_running() {
  State<6> s;
  LoopIn in[6];
  make(in);
  run(s, in, 19 * 60);
  expect(s.f[2] == 1.0f, "waits: nothing learned in the first 20 min of running");
  run(s, in, 10 * 60, false);
  expect(s.f[2] == 1.0f && s.run_s == 0.0f, "waits: heat pump stopping restarts the run timer");
  run(s, in, 40 * 60);
  expect(s.f[2] < 1.0f, "waits: learns once running and steady");
}

static void test_short_loop_down_starved_up() {
  State<6> s;
  LoopIn in[6];
  make(in);
  run(s, in, 3 * 3600);
  expect(s.f[2] < 0.8f, "direction: Toilet (ΔT 0.9 K) loses share");
  expect(s.f[1] > 1.0f && s.f[0] > 1.0f, "direction: Laura and Josephine gain");
  expect(s.f[5] == 1.0f, "direction: Soveværelse (warm) is not compared");
  float l = 0;
  for (float f : s.f) l += std::log(f);
  expect(std::fabs(l) < 1e-3f, "direction: factors keep a geometric mean of 1");
}

static void test_only_configured_return_probes() {
  State<6> s;
  LoopIn in[6];
  make(in);
  in[0].has_return = false;
  in[1].has_return = false;
  run(s, in, 3 * 3600);
  expect(s.f[0] == 1.0f && s.f[1] == 1.0f, "probes: loops without a return probe keep the pipe model");
  // Stueetage: only manifold flow and return probes → no loop learns.
  for (auto &l : in) l.has_return = false;
  State<6> s2;
  const StepResult r = step(s2, in, 28.5f, true, false, DT);
  expect(r.eligible == 0 && !r.stepped, "probes: a manifold without loop return probes never learns");
}

static void test_exclusions() {
  State<6> s;
  LoopIn in[6];
  make(in);
  in[2].opening_pct = 15.0f;  // too little opening to trust
  in[3].closed = true;
  run(s, in, 2 * 3600);
  expect(s.f[3] == 1.0f, "exclude: a closed loop is not compared and keeps its factor");
  State<6> h;
  run(h, in, 2 * 3600, true, true);
  expect(h.f[0] == 1.0f && h.run_s == 0.0f, "exclude: a valve test or flush holds learning");
  State<6> c;
  LoopIn cold[6];
  make(cold);
  for (auto &l : cold) l.room_c = 26.5f;  // supply only 2 K above the rooms
  run(c, cold, 2 * 3600);
  expect(c.f[2] == 1.0f, "exclude: supply too close to the rooms");
}

static void test_converges() {
  // Plant: flow_i = s · share_i · K_i (K = the hydraulics the model misses), each loop
  // gives off the same 1 kW per unit of share → ΔT_i ∝ share_i / flow_i = 1 / (s K_i).
  // ΔT' = ΔT · q / share. Learning drives share ∝ 1 / K: equal ΔT.
  const float prior[6] = {0.88f, 0.88f, 0.15f, 1.0f, 1.0f, 1.0f};
  const float K[6] = {0.8f, 0.7f, 3.0f, 1.0f, 1.1f, 1.0f};
  State<6> s;
  LoopIn in[6];
  for (int it = 0; it < 4 * 24 * 360; it++) {
    float share[6], mx = 0;
    for (int i = 0; i < 6; i++) { share[i] = prior[i] * s.f[i]; mx = std::max(mx, share[i]); }
    for (int i = 0; i < 6; i++) {
      share[i] /= mx;
      const float q = 0.6f * share[i];  // uncapped
      const float flow = q * K[i];
      in[i].enabled = in[i].has_return = true;
      in[i].room_c = 21.0f;
      in[i].setpoint_c = 22.0f;
      in[i].opening_pct = 60.0f;
      in[i].q = q;
      in[i].share = share[i];
      in[i].return_c = 30.0f - std::min(12.0f, 2.0f * prior[i] / flow);
    }
    step(s, in, 30.0f, true, false, DT);
  }
  float dtn[6], lo = 1e9f, hi = 0;
  for (int i = 0; i < 6; i++) {
    dtn[i] = (30.0f - in[i].return_c);
    lo = std::min(lo, dtn[i]);
    hi = std::max(hi, dtn[i]);
  }
  std::printf("      ΔT after 4 days: %.2f %.2f %.2f %.2f %.2f %.2f\n", dtn[0], dtn[1], dtn[2], dtn[3], dtn[4], dtn[5]);
  expect(hi / lo < 1.1f, "converge: loops' ΔT within 10 % of each other after four days of running");
  expect(s.f[2] < s.f[1], "converge: the short, free loop ends with less than the long one");
}

int main() {
  test_waits_for_steady_running();
  test_short_loop_down_starved_up();
  test_only_configured_return_probes();
  test_exclusions();
  test_converges();
  std::printf("All ΔT balance tests passed\n");
  return 0;
}
