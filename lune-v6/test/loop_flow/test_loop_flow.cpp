// Host tests for loop_flow.h (recommended max loop flow for the manifold preset).
#include <cassert>
#include <cmath>
#include <cstdio>

#include "loop_flow.h"

using namespace lv6::loop_flow;

static bool near(float a, float b, float tol) { return std::fabs(a - b) <= tol; }

int main() {
  // Pejsestue, ground floor 2026-11-26: 37.5 m², 300 mm, 2 m leads, UA 30.7 W/K, 22 °C.
  Result r = compute(30.7f, 22.0f, 0.0f, 37.5f, 300.0f, 2.0f);
  assert(near(r.loop_m, 129.0f, 0.5f));
  assert(near(r.design_w, 30.7f * 34.0f, 0.5f));          // −12 °C design day
  assert(near(r.design_lpm, 1043.8f / (5.0f * 69.7f), 0.01f));
  assert(near(r.max_lpm, r.design_lpm * 1.3f, 0.001f));
  assert(near(r.max_lpm, 3.89f, 0.02f));

  // Wind exposure 1.0 adds 60 % to the heat.
  Result w = compute(30.7f, 22.0f, 1.0f, 37.5f, 300.0f, 2.0f);
  assert(near(w.design_w, r.design_w * 1.6f, 0.5f));

  // No supply length: 2 m each way.
  assert(near(loop_length_m(18.0f, 300.0f, NAN), 64.0f, 0.01f));

  // Unknown heat loss: length still known, flow unknown.
  Result u = compute(NAN, 22.0f, 0.0f, 18.0f, 300.0f, 2.0f);
  assert(std::isfinite(u.loop_m));
  assert(!std::isfinite(u.max_lpm));

  // Missing geometry: no length.
  assert(!std::isfinite(loop_length_m(0.0f, 300.0f, 2.0f)));
  assert(!std::isfinite(loop_length_m(18.0f, 0.0f, 2.0f)));

  std::printf("loop_flow: all tests passed\n");
  return 0;
}
