#include "preheat_policy.h"

#include <cassert>
#include <cstdio>

int main() {
  assert(!lv6::preheat_policy::allow_v6_preheat(true));
  assert(lv6::preheat_policy::allow_v6_preheat(false));
  std::puts("Preheat ownership policy tests passed.");
}
