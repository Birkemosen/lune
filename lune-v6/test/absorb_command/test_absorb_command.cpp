#include "absorb_command_logic.h"

#include <cassert>
#include <cstdio>
#include <cstring>

using lv6::absorb_command::clamp_ttl_s;
using lv6::absorb_command::is_disarm_action;
using lv6::absorb_command::normalize_reason;
using lv6::absorb_command::TTL_MAX_S;
using lv6::absorb_command::TTL_MIN_S;

int main() {
  // Known reasons pass through (case-insensitive).
  {
    char out[32]{};
    normalize_reason("thermal_buffer", out, sizeof(out));
    assert(std::strcmp(out, "thermal_buffer") == 0);
    normalize_reason("Energy_Cost", out, sizeof(out));
    assert(std::strcmp(out, "energy_cost") == 0);
  }

  // Unknown → other; never reject.
  {
    char out[32]{};
    normalize_reason("odin preload hour", out, sizeof(out));
    assert(std::strcmp(out, "other") == 0);
    normalize_reason("weird_code", out, sizeof(out));
    assert(std::strcmp(out, "other") == 0);
  }

  // Empty / omitted stays empty.
  {
    char out[32] = {'x'};
    normalize_reason("", out, sizeof(out));
    assert(out[0] == '\0');
    normalize_reason(nullptr, out, sizeof(out));
    assert(out[0] == '\0');
  }

  // TTL ceiling and floor.
  {
    bool clamped = false;
    assert(clamp_ttl_s(1800.0f, &clamped) == 1800u);
    assert(!clamped);
    assert(clamp_ttl_s(14400.0f, &clamped) == TTL_MAX_S);
    assert(clamped);
    assert(clamp_ttl_s(10.0f, &clamped) == TTL_MIN_S);
    assert(clamped);
  }

  assert(is_disarm_action("disarm"));
  assert(is_disarm_action("DISARM"));
  assert(!is_disarm_action("arm"));
  assert(!is_disarm_action(nullptr));

  std::puts("Absorb command logic tests passed.");
  return 0;
}
