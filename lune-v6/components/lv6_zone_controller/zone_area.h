#pragma once

#include <cmath>
#include <cstdint>

#include "../lv6_config_store/lv6_types.h"

// A zone's floor area sets its design share of the flow. A new zone has no area
// (0 = not set) rather than a plausible-looking default: the old default of 15 m²
// was indistinguishable from a real 15 m² room and gave a 6 m² toilet more than
// twice its share. Until the area is set, the control uses the mean area of the
// board's other enabled zones that have one, so the loop gets an ordinary share,
// and the problem list says «area not set». Pure C++, host-testable.
namespace lv6::zone_area {

static constexpr float FALLBACK_M2 = 15.0f;  ///< no zone on the board has an area

inline bool is_set(float area_m2) { return std::isfinite(area_m2) && area_m2 > 0.0f; }

/// Mean area of the enabled zones that have one (FALLBACK_M2 if none).
inline float fallback(const ZoneConfig (&zones)[NUM_ZONES]) {
  float sum = 0.0f;
  uint8_t n = 0;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (zones[i].enabled && is_set(zones[i].area_m2)) {
      sum += zones[i].area_m2;
      n++;
    }
  }
  return n ? sum / static_cast<float>(n) : FALLBACK_M2;
}

/// Replaces every unset area with the fallback, in a copy used for control only.
inline void fill_unset(ZoneConfig (&zones)[NUM_ZONES]) {
  const float f = fallback(zones);
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    if (!is_set(zones[i].area_m2))
      zones[i].area_m2 = f;
}

}  // namespace lv6::zone_area
