#include "../../components/lv6_zone_controller/probe_mapping.h"

#include <cassert>
#include <cstdio>

using namespace lv6;
using namespace lv6::probe_mapping;

int main() {
  ProbeConfig probes{};
  ZoneConfig zones[NUM_ZONES]{};
  for (uint8_t z = 0; z < NUM_ZONES; z++)
    zones[z].enabled = true;

  // Defaults: P1 flow, P2 return, zones unassigned.
  assert(is_free(probes, 2));
  assert(!is_free(probes, 0));  // flow
  assert(!is_free(probes, 1));  // return

  // Assign zone 0 → P3, then zone 1 cannot take P3.
  probes.zone_return_probe[0] = 2;
  assert(!is_free(probes, 2, /*ignore_zone=*/1));
  assert(is_free(probes, 2, /*ignore_zone=*/0));  // rewriting own assignment ok

  // Manifold return cannot steal a zone probe.
  assert(!is_free(probes, 2, -1, false, true));

  // Unused-probe warning: 6 enabled, 1 assigned → warn.
  assert(unused_zone_probe_warning(probes, zones));
  for (uint8_t z = 0; z < NUM_ZONES; z++)
    probes.zone_return_probe[z] = static_cast<int8_t>(z + 2);
  assert(!unused_zone_probe_warning(probes, zones));

  // Return-temp off (no zone probes) → no warning.
  for (uint8_t z = 0; z < NUM_ZONES; z++)
    probes.zone_return_probe[z] = PROBE_UNASSIGNED;
  assert(!unused_zone_probe_warning(probes, zones));

  // Plausibility: heating, zone return outside band.
  probes.zone_return_probe[0] = 2;
  float zone_ret[NUM_ZONES];
  for (uint8_t z = 0; z < NUM_ZONES; z++)
    zone_ret[z] = NAN;
  zone_ret[0] = 40.0f;  // above flow
  auto p = check_plausibility(35.0f, 28.0f, zone_ret, probes);
  assert(p.heating);
  assert(p.manifold_ok);
  assert(!p.zones_ok);
  assert(p.bad_zone == 0);

  zone_ret[0] = 30.0f;
  p = check_plausibility(35.0f, 28.0f, zone_ret, probes);
  assert(p.zones_ok);

  p = check_plausibility(35.0f, 36.0f, zone_ret, probes);
  assert(!p.heating);  // not heating — skip checks

  std::puts("Probe mapping tests passed.");
  return 0;
}
