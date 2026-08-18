#pragma once

#include <cstddef>
#include <cstdint>

namespace lv6::hydraulic_policy {

// Lune V6 is on the UFH secondary side of a four-way buffer. Valve opening can
// influence secondary distribution only; it cannot guarantee primary-side heat delivery.
struct SecondaryFlowPolicy {
  bool commissioning_enabled{false};
  float minimum_total_opening_pct{0.0f};
};

struct Result {
  bool applied{false};
  float added_opening_pct{0.0f};
  uint8_t accepting_loops{0};
};

template <size_t N>
inline Result preserve_secondary_flow(const SecondaryFlowPolicy &policy,
                                      const bool *enabled, float *positions) {
  Result result;
  if (!policy.commissioning_enabled || policy.minimum_total_opening_pct <= 0.0f)
    return result;

  float total = 0.0f;
  for (size_t i = 0; i < N; ++i) {
    if (!enabled[i]) continue;
    if (positions[i] > 0.0f) {
      result.accepting_loops++;
      total += positions[i];
    }
  }
  // Never open a satisfied loop merely to protect a different hydraulic circuit.
  if (result.accepting_loops == 0 || total >= policy.minimum_total_opening_pct)
    return result;

  float remaining = policy.minimum_total_opening_pct - total;
  for (size_t pass = 0; pass < N && remaining > 0.001f; ++pass) {
    uint8_t eligible = 0;
    for (size_t i = 0; i < N; ++i)
      if (enabled[i] && positions[i] > 0.0f && positions[i] < 100.0f)
        eligible++;
    if (eligible == 0) break;
    const float share = remaining / static_cast<float>(eligible);
    float added = 0.0f;
    for (size_t i = 0; i < N; ++i) {
      if (!enabled[i] || positions[i] <= 0.0f || positions[i] >= 100.0f) continue;
      const float delta = (positions[i] + share > 100.0f) ? 100.0f - positions[i] : share;
      positions[i] += delta;
      added += delta;
    }
    remaining -= added;
    result.added_opening_pct += added;
  }
  result.applied = result.added_opening_pct > 0.001f;
  return result;
}

}  // namespace lv6::hydraulic_policy
