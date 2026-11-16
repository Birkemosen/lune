// Host tests for floor_response.h (learned floor response time).
#include "floor_response.h"

#include <cassert>
#include <cmath>
#include <cstdio>

using namespace lv6::floor_response;

static bool near(float a, float b, float tol = 0.05f) { return std::fabs(a - b) <= tol; }

// Run `minutes` of 1-minute cycles at a fixed input, the room from `room(t_min)`.
template <typename F>
static float run(Loop &l, float input_k, int minutes, F room, int t0 = 0) {
  float got = NAN;
  for (int m = 0; m < minutes; m++) {
    const float s = step(l, input_k, room(t0 + m), false, 60.0f);
    if (std::isfinite(s))
      got = s;
  }
  return got;
}

int main() {
  // --- heat input -------------------------------------------------------------
  assert(near(heat_input_k(100.0f, 36.0f, 20.0f), 16.0f));
  assert(near(heat_input_k(50.0f, 36.0f, 20.0f), 8.0f));
  assert(heat_input_k(10.0f, 36.0f, 20.0f) == 0.0f);   // below the minimum opening
  assert(heat_input_k(100.0f, NAN, 20.0f) == 0.0f);
  assert(heat_input_k(100.0f, 18.0f, 20.0f) == 0.0f);  // water colder than the room

  // --- off edge: Laura 2026-11-14 ------------------------------------------------
  // Heat from 20:30 to 03:00, room rising; after the stop it reaches 20.0 at 03:30,
  // holds to 05:15 and is 19.8 at 06:30. Turn = middle of 03:30–05:15 ≈ 1.4 h.
  {
    Loop l;
    run(l, 16.0f, 120, [](int) { return 19.5f; });      // 2 h heating (quiet before the edge)
    auto room = [](int m) {                               // m = minutes after 03:00
      if (m < 30) return 19.9f;
      if (m < 135) return 20.0f;
      if (m < 180) return 19.9f;
      return 19.8f;
    };
    const float s = run(l, 2.0f, 240, room);
    assert(near(s, (30.0f + 134.0f) / 2.0f / 60.0f));
    assert(l.samples == 1 && near(l.learned_h, s));
  }

  // --- on edge: room falls, floor answers after ~1 h ----------------------------------
  {
    Loop l;
    run(l, 0.0f, 120, [](int) { return 20.0f; });       // 2 h without heat
    auto room = [](int m) {
      if (m < 20) return 19.9f;
      if (m < 80) return 19.8f;                           // plateau 20–79 min
      if (m < 110) return 19.9f;
      return 20.0f;
    };
    const float s = run(l, 12.0f, 180, room);
    assert(near(s, (20.0f + 79.0f) / 2.0f / 60.0f));
  }

  // --- no episode: the state before the edge was too short ------------------------
  {
    Loop l;
    run(l, 16.0f, 60, [](int) { return 20.0f; });       // only 1 h heating
    const float s = run(l, 0.0f, 240, [](int m) { return m < 60 ? 20.2f : 19.9f; });
    assert(!std::isfinite(s) && l.samples == 0);
  }

  // --- the input flips back before the turn: no sample (00:00–01:00 pause) ---------
  {
    Loop l;
    run(l, 16.0f, 180, [](int) { return 19.4f; });
    run(l, 0.0f, 60, [](int) { return 19.5f; });        // room holds, never turns
    const float s = run(l, 16.0f, 60, [](int) { return 19.6f; });
    assert(!std::isfinite(s) && l.samples == 0);
  }

  // --- a valve test drops the episode ------------------------------------------------
  {
    Loop l;
    run(l, 16.0f, 120, [](int) { return 20.0f; });
    step(l, 0.0f, 20.0f, false, 60.0f);
    step(l, 0.0f, 20.0f, true, 60.0f);
    assert(l.edge == Edge::NONE);
  }

  // --- hysteresis: between OFF_K and ON_K the state holds ---------------------------
  {
    Loop l;
    step(l, 9.0f, 20.0f, false, 60.0f);
    assert(l.heating);
    step(l, 5.0f, 20.0f, false, 60.0f);                   // buffer water 25 °C, room 20
    assert(l.heating);
    step(l, 3.0f, 20.0f, false, 60.0f);
    assert(!l.heating);
  }

  // --- learning and the blend with the prior ----------------------------------------
  {
    Loop l;
    assert(near(effective_lag_h(l, 1.0f), 1.0f));
    add_sample(l, 2.0f);
    assert(near(effective_lag_h(l, 1.0f), 1.25f));      // 1 of 4 samples
    add_sample(l, 2.0f);
    add_sample(l, 2.0f);
    add_sample(l, 2.0f);
    assert(near(effective_lag_h(l, 1.0f), 2.0f));       // fully learned
    add_sample(l, 9.0f);                                  // implausible: dropped
    assert(l.samples == 4);
    add_sample(l, 1.0f);
    assert(near(l.learned_h, 2.0f + ALPHA * (1.0f - 2.0f)));
  }

  std::printf("floor_response: all assertions passed\n");
  return 0;
}
