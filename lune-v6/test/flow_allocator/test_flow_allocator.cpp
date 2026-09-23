#include "flow_allocator.h"

#include <cassert>
#include <cmath>
#include <cstdio>

using namespace lv6::flow_allocator;

static void fill_two_zones(ZoneSample samples[MAX_ZONES], float ua_a, float ua_b) {
  for (uint8_t i = 0; i < MAX_ZONES; i++)
    samples[i] = ZoneSample{};
  samples[0].enabled = true;
  samples[0].ua_w_per_k = ua_a;
  samples[0].temp_c = 20.0f;
  samples[0].setpoint_c = 22.0f;
  samples[0].max_opening_pct = 100.0f;
  samples[1].enabled = true;
  samples[1].ua_w_per_k = ua_b;
  samples[1].temp_c = 20.0f;
  samples[1].setpoint_c = 22.0f;
  samples[1].max_opening_pct = 100.0f;
}

int main() {
  // Kv prior is monotonic and near-zero at closed.
  {
    assert(kv_at_pct(0.0f) < 0.01f);
    assert(kv_at_pct(50.0f) > kv_at_pct(30.0f));
    assert(kv_at_pct(100.0f) > kv_at_pct(50.0f));
  }

  // Two zones, different UA, same setpoint error → stable different shares.
  {
    ZoneSample samples[MAX_ZONES];
    fill_two_zones(samples, 20.0f, 60.0f);  // B is 3× UA of A
    State st{};
    const float dt_h = 0.1f;  // 6 min
    const float target = 80.0f;

    float prev_share_a = -1.0f;
    float prev_share_b = -1.0f;
    for (int k = 0; k < 48; k++) {  // ~4.8 h
      step(st, samples, dt_h, target);
      const float sum = st.loop_share[0] + st.loop_share[1];
      assert(std::fabs(sum - 1.0f) < 0.02f);
      // B must claim more flow than A once debt has accumulated.
      if (k > 5) {
        assert(st.loop_share[1] > st.loop_share[0]);
        assert(st.opening_pct[1] > st.opening_pct[0]);
      }
      // No oscillation: share changes decay after warm-up.
      if (k > 20) {
        assert(std::fabs(st.loop_share[0] - prev_share_a) < 0.05f);
        assert(std::fabs(st.loop_share[1] - prev_share_b) < 0.05f);
      }
      prev_share_a = st.loop_share[0];
      prev_share_b = st.loop_share[1];
    }
    // Steady ratio roughly tracks UA ratio (3:1) within a soft band.
    const float ratio = st.loop_share[1] / st.loop_share[0];
    assert(ratio > 2.0f && ratio < 4.5f);
  }

  // Credit reduces debt and reallocates.
  {
    ZoneSample samples[MAX_ZONES];
    fill_two_zones(samples, 40.0f, 40.0f);
    State st{};
    step(st, samples, 1.0f, 60.0f);
    const float before = st.debt_kwh[0];
    credit_delivered(st, 0, 0.5f);
    assert(st.debt_kwh[0] < before);
  }

  std::puts("Flow allocator tests passed.");
  return 0;
}
