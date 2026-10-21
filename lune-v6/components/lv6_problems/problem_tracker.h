// =============================================================================
// Problem tracker — raise / clear bookkeeping for Home Assistant notifications
// =============================================================================
// Pure logic (no ESP-IDF, no ESPHome): host-tested by `make test-problem-tracker`.
// Implements the rules of shared/contracts/lune_notifications_contract_v1.md:
//
//   * A problem is raised only after its raise condition has held for the hold
//     time, so blips don't notify.
//   * The same problem (slot) sends a `raised` event at most once per hour.
//   * A `cleared` event is sent only for a raise that was sent.
//   * Hysteresis is the caller's: it reports RAISE while the raise condition
//     holds, CLEAR once the clear condition holds, NEUTRAL in between and
//     UNKNOWN when data is missing (missing data never raises or clears).
//
// Problems are runtime state: nothing here is persisted, so after a reboot a
// still-present problem is raised again once its hold time has passed.
// =============================================================================

#pragma once

#include <cstddef>
#include <cstdint>

namespace lv6 {
namespace problems {

enum class Severity : uint8_t { WARNING = 0, ERROR = 1 };

/// What the caller observed this tick.
enum class Input : uint8_t {
  UNKNOWN = 0,  ///< No data: keep everything as it is (hold timer keeps running)
  NEUTRAL = 1,  ///< Raise condition false, clear condition false (hysteresis band)
  RAISE = 2,    ///< Raise condition holds
  CLEAR = 3,    ///< Clear condition holds (or the problem no longer applies)
};

enum class Event : uint8_t { NONE = 0, RAISED = 1, CLEARED = 2 };

static constexpr uint32_t RAISE_INTERVAL_MS = 60u * 60u * 1000u;  ///< ≤ 1 raise per id per hour
static constexpr uint32_t DEFAULT_HOLD_MS = 10u * 60u * 1000u;

/// One problem instance (12 bytes).
struct Slot {
  static constexpr uint8_t HOLDING = 0x01;        ///< Raise condition holding since `since_ms`
  static constexpr uint8_t ACTIVE = 0x02;         ///< Raised locally (counted, shown)
  static constexpr uint8_t SENT = 0x04;           ///< HA has a `raised` for this episode
  static constexpr uint8_t EVER_SENT = 0x08;      ///< `last_sent_ms` is valid
  static constexpr uint8_t PENDING_RAISE = 0x10;  ///< A `raised` event is waiting
  static constexpr uint8_t PENDING_CLEAR = 0x20;  ///< A `cleared` event is waiting

  uint32_t since_ms = 0;
  uint32_t last_sent_ms = 0;
  uint8_t flags = 0;
  Severity severity = Severity::WARNING;
  uint8_t variant = 0;  ///< Caller's detail (fault code, high/low, source)
  uint8_t value = 0;    ///< Caller's number for the message (battery %, RH %)

  bool has(uint8_t f) const { return (flags & f) != 0; }
  void set(uint8_t f, bool on) { flags = on ? static_cast<uint8_t>(flags | f) : static_cast<uint8_t>(flags & ~f); }
  bool active() const { return has(ACTIVE); }
};

/// Feed one observation. Returns true when the slot's local state (active,
/// severity or variant) changed, i.e. the entities need republishing.
inline bool step(Slot &s, Input in, uint32_t now_ms, uint32_t hold_ms, Severity severity = Severity::WARNING,
                 uint8_t variant = 0, uint8_t value = 0) {
  switch (in) {
    case Input::UNKNOWN:
      return false;
    case Input::NEUTRAL:
      if (!s.active())
        s.set(Slot::HOLDING, false);
      return false;
    case Input::CLEAR:
      s.set(Slot::HOLDING, false);
      if (!s.active())
        return false;
      s.set(Slot::ACTIVE, false);
      s.set(Slot::PENDING_RAISE, false);
      if (s.has(Slot::SENT))
        s.set(Slot::PENDING_CLEAR, true);
      return true;
    case Input::RAISE:
      break;
  }

  if (s.active()) {
    // Escalation (e.g. battery warning → error) is a new raise, still ≤ 1/h.
    if (static_cast<uint8_t>(severity) > static_cast<uint8_t>(s.severity)) {
      s.severity = severity;
      s.variant = variant;
      s.value = value;
      s.set(Slot::PENDING_RAISE, true);
      return true;
    }
    return false;
  }

  if (!s.has(Slot::HOLDING)) {
    s.set(Slot::HOLDING, true);
    s.since_ms = now_ms;
  }
  if (now_ms - s.since_ms < hold_ms)
    return false;

  s.set(Slot::HOLDING, false);
  s.set(Slot::ACTIVE, true);
  s.severity = severity;
  s.variant = variant;
  s.value = value;
  if (s.has(Slot::PENDING_CLEAR)) {
    // Back before the `cleared` went out: HA still shows the earlier raise.
    s.set(Slot::PENDING_CLEAR, false);
  } else {
    s.set(Slot::PENDING_RAISE, true);
  }
  return true;
}

/// The event this slot wants to send now, if any.
inline Event due(const Slot &s, uint32_t now_ms) {
  if (s.has(Slot::PENDING_CLEAR))
    return Event::CLEARED;
  if (s.has(Slot::PENDING_RAISE) &&
      (!s.has(Slot::EVER_SENT) || now_ms - s.last_sent_ms >= RAISE_INTERVAL_MS))
    return Event::RAISED;
  return Event::NONE;
}

/// Record a send attempt. An event that could not be delivered (no Home
/// Assistant client, actions not subscribed) is dropped, not retried; a raise
/// that was never delivered is never followed by a `cleared`.
inline void sent(Slot &s, Event ev, bool delivered, uint32_t now_ms) {
  if (ev == Event::RAISED) {
    s.set(Slot::PENDING_RAISE, false);
    if (delivered) {
      s.set(Slot::SENT, true);
      s.set(Slot::EVER_SENT, true);
      s.last_sent_ms = now_ms;
    }
  } else if (ev == Event::CLEARED) {
    s.set(Slot::PENDING_CLEAR, false);
    s.set(Slot::SENT, false);
  }
}

/// Copy `src` onto `out` at `off`, never splitting a UTF-8 sequence; keeps
/// `out` NUL-terminated. Returns false when `src` did not fit completely.
inline bool append_utf8(char *out, size_t cap, size_t &off, const char *src) {
  if (out == nullptr || cap == 0)
    return false;
  for (const char *p = src; p != nullptr && *p != '\0';) {
    const unsigned char c = static_cast<unsigned char>(*p);
    size_t n = 1;
    if (c >= 0xF0)
      n = 4;
    else if (c >= 0xE0)
      n = 3;
    else if (c >= 0xC0)
      n = 2;
    if (off + n >= cap) {
      out[off] = '\0';
      return false;
    }
    for (size_t i = 0; i < n; i++) {
      if (p[i] == '\0') {  // truncated sequence in the source
        out[off] = '\0';
        return false;
      }
      out[off++] = p[i];
    }
    p += n;
  }
  out[off] = '\0';
  return true;
}

}  // namespace problems
}  // namespace lv6
