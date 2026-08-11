#pragma once

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstring>

namespace esphome::hv6_dashboard::touch_auth {

// Touch commands are only accepted after the device has a credible UTC clock.
static constexpr int64_t MIN_VALID_UTC_EPOCH_S = 1700000000;
static constexpr double MAX_TIMESTAMP_SKEW_S = 120.0;

inline bool keys_match(const char *expected, const char *provided) {
  expected = expected != nullptr ? expected : "";
  provided = provided != nullptr ? provided : "";
  const size_t expected_len = std::strlen(expected);
  const size_t provided_len = std::strlen(provided);
  unsigned char difference = static_cast<unsigned char>(expected_len ^ provided_len);
  const size_t compare_len = expected_len > provided_len ? expected_len : provided_len;
  for (size_t i = 0; i < compare_len; ++i) {
    const char lhs = i < expected_len ? expected[i] : '\0';
    const char rhs = i < provided_len ? provided[i] : '\0';
    difference |= static_cast<unsigned char>(lhs ^ rhs);
  }
  return expected_len != 0 && difference == 0;
}

inline bool timestamp_is_fresh(int64_t now_epoch_s, double supplied_epoch_s) {
  return now_epoch_s >= MIN_VALID_UTC_EPOCH_S && std::isfinite(supplied_epoch_s) &&
         std::fabs(static_cast<double>(now_epoch_s) - supplied_epoch_s) <= MAX_TIMESTAMP_SKEW_S;
}

inline bool request_is_authenticated(const char *expected_key, const char *provided_key,
                                     int64_t now_epoch_s, double supplied_epoch_s,
                                     const char *nonce) {
  return keys_match(expected_key, provided_key) &&
         timestamp_is_fresh(now_epoch_s, supplied_epoch_s) && nonce != nullptr && nonce[0] != '\0';
}

}  // namespace esphome::hv6_dashboard::touch_auth
