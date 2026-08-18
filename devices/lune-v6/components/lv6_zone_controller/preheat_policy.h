#pragma once

// A live Touch lease makes Touch the room-distribution authority. V6 keeps its
// safe local heat control, but must not independently time/pre-buffer the whole
// house until it has entered explicit fallback.
namespace lv6::preheat_policy {

inline bool allow_v6_preheat(bool touch_authority_active) {
  return !touch_authority_active;
}

}  // namespace lv6::preheat_policy
