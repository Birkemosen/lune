#include "../../components/lv6_config_store/group_model.h"

#include <cassert>
#include <cstdio>
#include <cstring>

using lv6::GroupConfig;
using lv6::GroupsConfig;
using lv6::ZoneConfig;
using lv6::group_model::ValidateError;
using lv6::group_model::from_sync_to_zone;
using lv6::group_model::validate;

int main() {
  ZoneConfig zones[lv6::NUM_ZONES]{};
  zones[1].sync_to_zone = 0;  // Z2 → Z1
  zones[2].sync_to_zone = 0;  // Z3 → Z1
  GroupsConfig g = from_sync_to_zone(zones);
  assert(lv6::group_model::group_active(g.groups[0]));
  assert(g.groups[0].primary_loop == 0);
  assert((g.groups[0].member_mask & (1u << 1)) != 0);
  assert((g.groups[0].member_mask & (1u << 2)) != 0);

  bool faults[lv6::NUM_ZONES]{};
  assert(validate(g, faults) == ValidateError::OK);

  // Cycle / dual membership: make Z1 a member of another group while primary of first
  GroupsConfig bad = g;
  bad.groups[1].primary_loop = 3;
  std::strncpy(bad.groups[1].group_id, "g4", sizeof(bad.groups[1].group_id));
  bad.groups[1].member_mask = (1u << 0);  // Z1 is member elsewhere
  assert(validate(bad, faults) == ValidateError::MEMBER_IS_PRIMARY ||
         validate(bad, faults) == ValidateError::LOOP_IN_MULTIPLE);

  // Faulted primary rejected
  faults[0] = true;
  assert(validate(g, faults) == ValidateError::PRIMARY_FAULT);

  // Chain via sync conversion should star-resolve
  ZoneConfig chain[lv6::NUM_ZONES]{};
  chain[2].sync_to_zone = 1;
  chain[1].sync_to_zone = 0;
  GroupsConfig starred = from_sync_to_zone(chain);
  // Z3 and Z2 should end under primary 0
  bool found = false;
  for (uint8_t i = 0; i < lv6::MAX_GROUPS; i++) {
    if (!lv6::group_model::group_active(starred.groups[i]))
      continue;
    if (starred.groups[i].primary_loop == 0) {
      found = true;
      assert((starred.groups[i].member_mask & (1u << 1)) != 0);
      assert((starred.groups[i].member_mask & (1u << 2)) != 0);
    }
  }
  assert(found);

  std::puts("Group model tests passed.");
  return 0;
}
