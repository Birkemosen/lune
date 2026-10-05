#pragma once

#include <cctype>
#include <cmath>
#include <cstdint>
#include <cstring>

// Absorb-window command helpers (Touch → V6).
// Reason is ledger/display only — never drives control behaviour.
// Unknown reason codes are stored as "other"; they never reject the command.
namespace lv6::absorb_command {

constexpr uint32_t TTL_MIN_S = 60;
constexpr uint32_t TTL_MAX_S = 7200;  // 2 h — V6 ceiling regardless of Odin valid_until

inline bool eq_reason_(const char *a, const char *b) {
  if (a == nullptr || b == nullptr)
    return false;
  while (*a && *b) {
    if (std::tolower(static_cast<unsigned char>(*a)) !=
        std::tolower(static_cast<unsigned char>(*b)))
      return false;
    ++a;
    ++b;
  }
  return *a == '\0' && *b == '\0';
}

/// Clamp requested TTL into [TTL_MIN_S, TTL_MAX_S]. Sets *clamp_applied when
/// the accepted value differs from the finite requested input.
inline uint32_t clamp_ttl_s(float requested_s, bool *clamp_applied) {
  float accepted = requested_s;
  if (!std::isfinite(accepted))
    accepted = 1800.0f;
  if (accepted < static_cast<float>(TTL_MIN_S))
    accepted = static_cast<float>(TTL_MIN_S);
  if (accepted > static_cast<float>(TTL_MAX_S))
    accepted = static_cast<float>(TTL_MAX_S);
  if (clamp_applied != nullptr) {
    *clamp_applied = !std::isfinite(requested_s) ||
                     std::fabs(accepted - requested_s) > 0.001f;
  }
  return static_cast<uint32_t>(accepted);
}

/// Copy a bounded reason code into out. Empty/omitted stays empty.
/// Known codes pass through; anything else becomes "other".
inline void normalize_reason(const char *in, char *out, size_t out_len) {
  if (out == nullptr || out_len == 0)
    return;
  out[0] = '\0';
  if (in == nullptr || in[0] == '\0' || out_len < 2)
    return;

  if (eq_reason_(in, "thermal_buffer") || eq_reason_(in, "energy_cost")) {
    size_t i = 0;
    for (; in[i] != '\0' && i + 1 < out_len; ++i)
      out[i] = static_cast<char>(std::tolower(static_cast<unsigned char>(in[i])));
    out[i] = '\0';
    return;
  }

  static constexpr char kOther[] = "other";
  const size_t n = sizeof(kOther) - 1 < out_len - 1 ? sizeof(kOther) - 1 : out_len - 1;
  std::memcpy(out, kOther, n);
  out[n] = '\0';
}

inline bool is_disarm_action(const char *action) {
  return action != nullptr && eq_reason_(action, "disarm");
}

}  // namespace lv6::absorb_command
