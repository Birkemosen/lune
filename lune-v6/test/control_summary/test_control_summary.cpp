// Host tests for control_summary.h (GET /api/v1/summary fingerprint).
#include "control_summary.h"

#include <cassert>
#include <cmath>
#include <cstdio>

using namespace lv6_summary;

static Input base() {
  Input in{};
  for (size_t i = 0; i < MAX_ZONES; i++) {
    in.zones[i].state = "idle";
    in.zones[i].enabled = true;
    in.zones[i].temp_c = 21.2f;
    in.zones[i].valve_pct = 15.0f;
    in.zones[i].effective_setpoint_c = 21.5f;
    in.zones[i].coordinator_offset_c = 0.0f;
  }
  in.heating_mode = 1;
  in.effective_heating_mode = 1;
  in.lease_active = true;
  in.data_revision = 7;
  return in;
}

int main() {
  const uint32_t r0 = fingerprint(base());
  assert(fingerprint(base()) == r0);  // deterministic

  // Below control resolution → unchanged.
  Input small = base();
  small.zones[2].temp_c = 21.23f;    // 0.03 °C
  small.zones[2].valve_pct = 16.0f;  // 1 %
  assert(fingerprint(small) == r0);

  // Control-relevant changes → changed.
  Input calling = base();
  calling.zones[1].state = "calling";
  assert(fingerprint(calling) != r0);
  Input warmer = base();
  warmer.zones[0].temp_c = 21.6f;  // 0.3 °C
  assert(fingerprint(warmer) != r0);
  Input valve = base();
  valve.zones[4].valve_pct = 30.0f;
  assert(fingerprint(valve) != r0);
  Input offset = base();
  offset.zones[3].coordinator_offset_c = 0.5f;
  assert(fingerprint(offset) != r0);
  Input absorb = base();
  absorb.zones[5].absorb_armed = true;
  assert(fingerprint(absorb) != r0);
  Input lease = base();
  lease.lease_active = false;
  assert(fingerprint(lease) != r0);
  Input cfg = base();
  cfg.data_revision = 8;
  assert(fingerprint(cfg) != r0);
  Input fault = base();
  fault.zones[0].motor_fault = true;
  assert(fingerprint(fault) != r0);
  // Lost temperature (NaN) is a change too.
  Input lost = base();
  lost.zones[0].temp_c = NAN;
  assert(fingerprint(lost) != r0);

  // `since` parsing.
  uint32_t v = 0;
  assert(parse_rev("0a1B2c3D", &v) && v == 0x0a1b2c3du);
  assert(!parse_rev("", &v));
  assert(!parse_rev("xyz", &v));
  assert(!parse_rev("123456789", &v));

  std::puts("Control summary tests passed.");
  return 0;
}
