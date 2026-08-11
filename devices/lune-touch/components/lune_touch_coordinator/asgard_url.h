#pragma once

#include <cctype>
#include <cstdint>
#include <cstdio>
#include <cstring>

namespace esphome::lune_touch_coordinator::asgard_url {

inline bool valid_host(const char *host) {
  return host != nullptr && host[0] != '\0' && std::strpbrk(host, " /?#") == nullptr;
}

inline bool request_succeeded(bool transport_ok, int status_code) {
  return transport_ok && status_code >= 200 && status_code < 300;
}

inline bool encode_entity_once(const char *src, char *out, size_t out_len) {
  if (out_len == 0 || src == nullptr) return false;
  static constexpr char HEX[] = "0123456789ABCDEF";
  size_t off = 0;
  for (size_t i = 0; src[i] != '\0'; ++i) {
    const unsigned char c = static_cast<unsigned char>(src[i]);
    const bool safe = std::isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~';
    const bool encoded = c == '%' && std::isxdigit(static_cast<unsigned char>(src[i + 1])) &&
                         std::isxdigit(static_cast<unsigned char>(src[i + 2]));
    if (off + (safe ? 1 : 3) >= out_len) { out[0] = '\0'; return false; }
    if (safe) out[off++] = static_cast<char>(c);
    else if (encoded) { out[off++] = '%'; out[off++] = src[++i]; out[off++] = src[++i]; }
    else { out[off++] = '%'; out[off++] = HEX[c >> 4]; out[off++] = HEX[c & 0x0f]; }
  }
  out[off] = '\0';
  return true;
}

inline bool build_number_url(const char *host, uint16_t port, const char *entity, float value,
                             char *out, size_t out_len) {
  char encoded[145];
  if (!valid_host(host) || port == 0 || !encode_entity_once(entity, encoded, sizeof(encoded))) return false;
  const int written = std::snprintf(out, out_len, "http://%s:%u/number/%s/set?value=%.2f",
                                    host, static_cast<unsigned>(port), encoded, value);
  return written >= 0 && static_cast<size_t>(written) < out_len;
}

inline bool build_number_read_url(const char *host, uint16_t port, const char *entity,
                                  char *out, size_t out_len) {
  char encoded[145];
  if (!valid_host(host) || port == 0 || !encode_entity_once(entity, encoded, sizeof(encoded))) return false;
  const int written = std::snprintf(out, out_len, "http://%s:%u/number/%s",
                                    host, static_cast<unsigned>(port), encoded);
  return written >= 0 && static_cast<size_t>(written) < out_len;
}

}  // namespace esphome::lune_touch_coordinator::asgard_url
