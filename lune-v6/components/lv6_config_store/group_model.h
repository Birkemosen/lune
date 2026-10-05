#pragma once

#include "lv6_types.h"

#include <cstdio>
#include <cstring>

// Manifold group helpers — contract §2.1.
namespace lv6::group_model {

enum class ValidateError : uint8_t {
  OK = 0,
  INVALID_PRIMARY,
  PRIMARY_FAULT,
  CHAIN_OR_CYCLE,
  MEMBER_IS_PRIMARY,
  LOOP_IN_MULTIPLE,
  EMPTY_GROUP,
  UNKNOWN_GROUP,
};

inline const char *validate_error_string(ValidateError e) {
  switch (e) {
    case ValidateError::OK: return "ok";
    case ValidateError::INVALID_PRIMARY: return "invalid_primary";
    case ValidateError::PRIMARY_FAULT: return "primary_fault";
    case ValidateError::CHAIN_OR_CYCLE: return "chain_or_cycle";
    case ValidateError::MEMBER_IS_PRIMARY: return "member_is_primary";
    case ValidateError::LOOP_IN_MULTIPLE: return "loop_in_multiple_groups";
    case ValidateError::EMPTY_GROUP: return "empty_group";
    case ValidateError::UNKNOWN_GROUP: return "unknown_group";
  }
  return "invalid_group";
}

inline bool group_active(const GroupConfig &g) {
  return g.primary_loop >= 0 && g.primary_loop < static_cast<int8_t>(NUM_ZONES) &&
         g.group_id[0] != '\0';
}

inline uint8_t group_loop_mask(const GroupConfig &g) {
  if (!group_active(g))
    return 0;
  return static_cast<uint8_t>(g.member_mask | (1u << g.primary_loop));
}

inline bool loop_in_group(const GroupConfig &g, uint8_t loop) {
  if (loop >= NUM_ZONES || !group_active(g))
    return false;
  return (group_loop_mask(g) & (1u << loop)) != 0;
}

/// Resolve which explicit group owns `loop` (−1 if none / singleton).
inline int8_t find_group_index(const GroupsConfig &cfg, uint8_t loop) {
  if (loop >= NUM_ZONES)
    return -1;
  for (uint8_t i = 0; i < MAX_GROUPS; i++) {
    if (loop_in_group(cfg.groups[i], loop))
      return static_cast<int8_t>(i);
  }
  return -1;
}

inline GroupRole role_for_loop(const GroupsConfig &cfg, uint8_t loop) {
  const int8_t gi = find_group_index(cfg, loop);
  if (gi < 0)
    return GroupRole::SINGLE;
  const GroupConfig &g = cfg.groups[gi];
  if (g.member_mask == 0)
    return GroupRole::SINGLE;
  return g.primary_loop == static_cast<int8_t>(loop) ? GroupRole::PRIMARY : GroupRole::MEMBER;
}

inline int8_t primary_for_loop(const GroupsConfig &cfg, const ZoneConfig zones[NUM_ZONES],
                               uint8_t loop) {
  const int8_t gi = find_group_index(cfg, loop);
  if (gi >= 0)
    return cfg.groups[gi].primary_loop;
  // Legacy sync_to_zone mirror
  if (loop < NUM_ZONES && zones[loop].sync_to_zone >= 0 &&
      zones[loop].sync_to_zone < static_cast<int8_t>(NUM_ZONES)) {
    int8_t cur = zones[loop].sync_to_zone;
    for (uint8_t guard = 0; guard < NUM_ZONES; guard++) {
      if (zones[cur].sync_to_zone < 0)
        return cur;
      cur = zones[cur].sync_to_zone;
      if (cur == static_cast<int8_t>(loop))
        return static_cast<int8_t>(loop);
    }
  }
  return static_cast<int8_t>(loop);
}

/// Validate a candidate GroupsConfig atomically (no mutation).
inline ValidateError validate(const GroupsConfig &cfg, const bool zone_fault[NUM_ZONES]) {
  uint8_t claimed = 0;
  for (uint8_t i = 0; i < MAX_GROUPS; i++) {
    const GroupConfig &g = cfg.groups[i];
    if (!group_active(g))
      continue;
    if (g.primary_loop < 0 || g.primary_loop >= static_cast<int8_t>(NUM_ZONES))
      return ValidateError::INVALID_PRIMARY;
    if (zone_fault != nullptr && zone_fault[g.primary_loop])
      return ValidateError::PRIMARY_FAULT;
    // Members must not include primary; no bit outside 0..5
    if ((g.member_mask & (1u << g.primary_loop)) != 0)
      return ValidateError::CHAIN_OR_CYCLE;
    if ((g.member_mask & ~static_cast<uint8_t>((1u << NUM_ZONES) - 1)) != 0)
      return ValidateError::INVALID_PRIMARY;

    const uint8_t mask = group_loop_mask(g);
    if (mask == 0)
      return ValidateError::EMPTY_GROUP;
    if ((claimed & mask) != 0)
      return ValidateError::LOOP_IN_MULTIPLE;
    claimed = static_cast<uint8_t>(claimed | mask);
  }

  // A member of one group must not be primary of another (already covered by
  // exclusive claimed mask). Double-check primaries aren't members elsewhere.
  for (uint8_t i = 0; i < MAX_GROUPS; i++) {
    if (!group_active(cfg.groups[i]))
      continue;
    for (uint8_t j = 0; j < MAX_GROUPS; j++) {
      if (i == j || !group_active(cfg.groups[j]))
        continue;
      if ((cfg.groups[j].member_mask & (1u << cfg.groups[i].primary_loop)) != 0)
        return ValidateError::MEMBER_IS_PRIMARY;
    }
  }
  return ValidateError::OK;
}

/// Build GroupsConfig from legacy sync_to_zone stars.
inline GroupsConfig from_sync_to_zone(const ZoneConfig zones[NUM_ZONES]) {
  GroupsConfig out{};
  bool used[NUM_ZONES]{};
  uint8_t slot = 0;
  for (uint8_t root = 0; root < NUM_ZONES; root++) {
    if (used[root])
      continue;
    // Resolve root: zone that nothing points... actually find star primary.
    int8_t primary = static_cast<int8_t>(root);
    if (zones[root].sync_to_zone >= 0 && zones[root].sync_to_zone < static_cast<int8_t>(NUM_ZONES)) {
      // follower — skip; handled when we visit its root
      int8_t cur = zones[root].sync_to_zone;
      for (uint8_t g = 0; g < NUM_ZONES; g++) {
        if (zones[cur].sync_to_zone < 0) {
          primary = cur;
          break;
        }
        cur = zones[cur].sync_to_zone;
      }
      if (primary != static_cast<int8_t>(root))
        continue;
    }
    uint8_t members = 0;
    for (uint8_t z = 0; z < NUM_ZONES; z++) {
      if (z == static_cast<uint8_t>(primary))
        continue;
      int8_t p = primary_for_loop(GroupsConfig{}, zones, z);
      if (p == primary) {
        members = static_cast<uint8_t>(members | (1u << z));
        used[z] = true;
      }
    }
    used[primary] = true;
    if (members == 0)
      continue;  // singleton remains implicit
    if (slot >= MAX_GROUPS)
      break;
    GroupConfig &g = out.groups[slot++];
    std::snprintf(g.group_id, sizeof(g.group_id), "g%u", static_cast<unsigned>(primary + 1));
    g.primary_loop = primary;
    g.member_mask = members;
    g.include_in_house_temperature = true;
    g.revision = 1;
  }
  return out;
}

/// Mirror groups back into sync_to_zone for legacy API/UI.
inline void apply_sync_mirror(const GroupsConfig &cfg, ZoneConfig zones[NUM_ZONES]) {
  for (uint8_t z = 0; z < NUM_ZONES; z++)
    zones[z].sync_to_zone = -1;
  for (uint8_t i = 0; i < MAX_GROUPS; i++) {
    const GroupConfig &g = cfg.groups[i];
    if (!group_active(g) || g.member_mask == 0)
      continue;
    for (uint8_t z = 0; z < NUM_ZONES; z++) {
      if (z == static_cast<uint8_t>(g.primary_loop))
        continue;
      if ((g.member_mask & (1u << z)) != 0)
        zones[z].sync_to_zone = g.primary_loop;
    }
  }
}

inline void make_default_group_id(char *out, size_t len, uint8_t primary) {
  if (out == nullptr || len == 0)
    return;
  std::snprintf(out, len, "g%u", static_cast<unsigned>(primary + 1));
}

}  // namespace lv6::group_model
