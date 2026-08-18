#include "hydraulic_policy.h"

#include <cassert>
#include <cstdio>

using namespace lv6::hydraulic_policy;

int main() {
  const bool enabled[3]{true, true, true};
  float closed[3]{0.0f, 0.0f, 0.0f};
  auto result = preserve_secondary_flow<3>(SecondaryFlowPolicy{false, 40.0f}, enabled, closed);
  assert(!result.applied && closed[0] == 0.0f && closed[1] == 0.0f && closed[2] == 0.0f);

  result = preserve_secondary_flow<3>(SecondaryFlowPolicy{true, 40.0f}, enabled, closed);
  assert(!result.applied && result.accepting_loops == 0);  // no satisfied room is opened

  float demand[3]{10.0f, 0.0f, 10.0f};
  result = preserve_secondary_flow<3>(SecondaryFlowPolicy{true, 40.0f}, enabled, demand);
  assert(result.applied && result.accepting_loops == 2);
  assert(demand[0] == 20.0f && demand[1] == 0.0f && demand[2] == 20.0f);
  std::puts("Hydraulic secondary-flow policy tests passed.");
}
