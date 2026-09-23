#include "preheat_absorb_logic.h"

#include <cassert>
#include <cstdio>

using lv6::preheat_absorb::DetectInput;
using lv6::preheat_absorb::DetectOutput;
using lv6::preheat_absorb::step;

static DetectInput base_hot_idle() {
  DetectInput in{};
  in.enabled = true;
  in.arm_active = false;
  in.flow_valid = true;
  in.flow_c = 35.0f;
  in.house_avg_c = 21.0f;
  in.any_demand = false;
  in.detect_delta_c = 8.0f;
  in.currently_active = false;
  in.detect_cycles = 0;
  return in;
}

int main() {
  // Under Touch authority auto-detection must still run (fail-safe-on).
  // The authority flag is no longer an input — only enabled/arm_active gate.
  {
    auto in = base_hot_idle();
    DetectOutput o1 = step(in);
    assert(!o1.active);
    assert(o1.detect_cycles == 1);
    in.detect_cycles = o1.detect_cycles;
    DetectOutput o2 = step(in);
    assert(o2.active);
    assert(o2.detect_cycles == 2);
  }

  // Arm active owns the window — absorb stays on, auto cycles cleared.
  {
    auto in = base_hot_idle();
    in.arm_active = true;
    in.detect_cycles = 5;
    in.currently_active = false;
    DetectOutput o = step(in);
    assert(o.active);
    assert(o.detect_cycles == 0);
  }

  // Disabled suppresses auto-detection.
  {
    auto in = base_hot_idle();
    in.enabled = false;
    DetectOutput o = step(in);
    assert(!o.active);
  }

  // Demand while inactive blocks activation; demand while active redistributes.
  {
    auto in = base_hot_idle();
    in.currently_active = true;
    in.detect_cycles = 10;
    in.any_demand = true;
    DetectOutput o = step(in);
    assert(o.active);  // stay absorbing — redistribute, don't release
  }

  // Demand while inactive prevents activation.
  {
    auto in = base_hot_idle();
    in.any_demand = true;
    DetectOutput o1 = step(in);
    assert(!o1.active);
    in.detect_cycles = o1.detect_cycles;
    DetectOutput o2 = step(in);
    assert(!o2.active);
  }

  // Below threshold does not arm.
  {
    auto in = base_hot_idle();
    in.flow_c = 25.0f;  // house_avg 21 + 8 = 29 threshold
    DetectOutput o = step(in);
    assert(!o.active);
    assert(o.detect_cycles == 0);
  }

  std::puts("Preheat absorb logic tests passed.");
  return 0;
}
