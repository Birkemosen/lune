#pragma once

#include "../lv6_config_store/lv6_types.h"

#include <cmath>
#include <cstdint>

namespace lv6::probe_mapping {

enum class Role : uint8_t {
  NONE = 0,
  MANIFOLD_FLOW = 1,
  MANIFOLD_RETURN = 2,
  ZONE_RETURN = 3,
};

struct Assignment {
  Role role{Role::NONE};
  int8_t zone{-1};  ///< 0-based when role == ZONE_RETURN
};

/// Who currently owns `probe` (0-based), excluding an optional self-assignment
/// that is being rewritten (`ignore_zone` / `ignore_manifold_*`).
inline Assignment owner_of(const ProbeConfig &probes, int8_t probe,
                           int8_t ignore_zone = -1,
                           bool ignore_manifold_flow = false,
                           bool ignore_manifold_return = false) {
  Assignment out{};
  if (probe < 0 || probe >= MAX_PROBES)
    return out;
  if (!ignore_manifold_flow && probes.manifold_flow_probe == probe) {
    out.role = Role::MANIFOLD_FLOW;
    return out;
  }
  if (!ignore_manifold_return && probes.manifold_return_probe == probe) {
    out.role = Role::MANIFOLD_RETURN;
    return out;
  }
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (static_cast<int8_t>(z) == ignore_zone)
      continue;
    if (probes.zone_return_probe[z] == probe) {
      out.role = Role::ZONE_RETURN;
      out.zone = static_cast<int8_t>(z);
      return out;
    }
  }
  return out;
}

inline bool is_free(const ProbeConfig &probes, int8_t probe,
                    int8_t ignore_zone = -1,
                    bool ignore_manifold_flow = false,
                    bool ignore_manifold_return = false) {
  if (probe == PROBE_UNASSIGNED)
    return true;
  return owner_of(probes, probe, ignore_zone, ignore_manifold_flow,
                  ignore_manifold_return)
             .role == Role::NONE;
}

/// Count enabled zones that have a zone-return probe assigned.
inline uint8_t assigned_zone_probe_count(const ProbeConfig &probes,
                                         const ZoneConfig zones[NUM_ZONES]) {
  uint8_t n = 0;
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (!zones[z].enabled)
      continue;
    const int8_t p = probes.zone_return_probe[z];
    if (p >= 0 && p < MAX_PROBES)
      n++;
  }
  return n;
}

inline uint8_t enabled_zone_count(const ZoneConfig zones[NUM_ZONES]) {
  uint8_t n = 0;
  for (uint8_t z = 0; z < NUM_ZONES; z++)
    if (zones[z].enabled)
      n++;
  return n;
}

/// True when return-temp mode is in use (any zone probe assigned) and more
/// enabled zones lack a zone-return probe than have one — i.e. unused probe
/// capacity relative to active zones.
inline bool unused_zone_probe_warning(const ProbeConfig &probes,
                                      const ZoneConfig zones[NUM_ZONES]) {
  const uint8_t enabled = enabled_zone_count(zones);
  const uint8_t assigned = assigned_zone_probe_count(probes, zones);
  if (assigned == 0)
    return false;  // return-temp mode off
  return enabled > assigned;
}

struct Plausibility {
  bool heating{false};       ///< flow sufficiently above manifold return
  bool manifold_ok{true};    ///< return < flow when heating
  bool zones_ok{true};       ///< every assigned zone return in [return, flow]
  int8_t bad_zone{-1};       ///< first offending zone, or -1
};

/// Under heating (flow − return ≥ margin), manifold return must be below flow,
/// and each zone return must lie between them.
inline Plausibility check_plausibility(float flow_c, float manifold_return_c,
                                       const float zone_return_c[NUM_ZONES],
                                       const ProbeConfig &probes,
                                       float margin_c = 1.0f) {
  Plausibility out{};
  if (!std::isfinite(flow_c) || !std::isfinite(manifold_return_c))
    return out;
  out.heating = flow_c >= manifold_return_c + margin_c;
  if (!out.heating)
    return out;
  out.manifold_ok = manifold_return_c < flow_c;
  if (!out.manifold_ok)
    return out;
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    const int8_t p = probes.zone_return_probe[z];
    if (p < 0 || p >= MAX_PROBES)
      continue;
    const float zr = zone_return_c[z];
    if (!std::isfinite(zr))
      continue;
    if (zr < manifold_return_c - 0.5f || zr > flow_c + 0.5f) {
      out.zones_ok = false;
      out.bad_zone = static_cast<int8_t>(z);
      return out;
    }
  }
  return out;
}

}  // namespace lv6::probe_mapping
