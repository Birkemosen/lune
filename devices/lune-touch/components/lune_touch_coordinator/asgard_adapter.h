#pragma once

#include "asgard_url.h"

#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <initializer_list>

// The coordinator owns the physical signal and authority policy.  This adapter owns
// only the documented Asgard display-entity contract so paths and response parsing do
// not leak into that policy.
namespace esphome::lune_touch_coordinator::asgard_adapter {

enum class CapabilityStatus : uint8_t {
  READY,
  UNCONFIGURED,
  UNSUPPORTED,
};

inline const char *capability_status_name(CapabilityStatus status) {
  switch (status) {
    case CapabilityStatus::READY: return "ready";
    case CapabilityStatus::UNCONFIGURED: return "unconfigured";
    case CapabilityStatus::UNSUPPORTED: return "unsupported";
  }
  return "unknown";
}

struct Config {
  const char *host{nullptr};
  uint16_t port{80};
  const char *physical_temperature_entity{nullptr};
};

struct Compatibility {
  CapabilityStatus physical_temperature{CapabilityStatus::UNCONFIGURED};
  CapabilityStatus target_sync{CapabilityStatus::UNSUPPORTED};
  CapabilityStatus operating_state{CapabilityStatus::UNSUPPORTED};
  const char *target_blocker{"target synchronization intentionally unsupported"};
  const char *operating_state_blocker{"external operating-state ingestion intentionally unsupported"};
};

inline bool valid_entity(const char *entity) {
  if (entity == nullptr || entity[0] == '\0') return false;
  for (const char *p = entity; *p != '\0'; ++p) {
    const unsigned char c = static_cast<unsigned char>(*p);
    if (c < 0x20 || c > 0x7e) return false;
  }
  return true;
}

inline Compatibility compatibility(const Config &config) {
  Compatibility result;
  result.physical_temperature =
      asgard_url::valid_host(config.host) && config.port != 0 && valid_entity(config.physical_temperature_entity)
          ? CapabilityStatus::READY
          : CapabilityStatus::UNCONFIGURED;
  return result;
}

inline bool build_physical_write_url(const Config &config, float value, char *out, size_t out_len) {
  return compatibility(config).physical_temperature == CapabilityStatus::READY &&
         asgard_url::build_number_url(config.host, config.port, config.physical_temperature_entity,
                                      value, out, out_len);
}

inline bool build_physical_read_url(const Config &config, char *out, size_t out_len) {
  return compatibility(config).physical_temperature == CapabilityStatus::READY &&
         asgard_url::build_number_read_url(config.host, config.port, config.physical_temperature_entity,
                                           out, out_len);
}

inline bool request_succeeded(bool transport_ok, int status_code) {
  return asgard_url::request_succeeded(transport_ok, status_code);
}

// A narrow transport seam keeps host tests independent of ESPHome HTTP while making
// endpoint discovery/readback behavior testable with a fake adapter transport.
class Transport {
 public:
  virtual ~Transport() = default;
  virtual bool get(const char *url, char *body, size_t body_len, int *status) = 0;
  virtual bool post_empty(const char *url, int *status) = 0;
};

inline bool parse_number_response(const char *body, float *value) {
  if (body == nullptr || value == nullptr) return false;
  *value = NAN;
  for (const char *key : {"\"value\"", "\"state\""}) {
    const char *field = std::strstr(body, key);
    if (field == nullptr) continue;
    const char *colon = std::strchr(field + std::strlen(key), ':');
    if (colon == nullptr) continue;
    const char *start = colon + 1;
    while (*start == ' ' || *start == '\t' || *start == '\"') ++start;
    char *end = nullptr;
    const float parsed = std::strtof(start, &end);
    if (end != start && std::isfinite(parsed)) {
      *value = parsed;
      return true;
    }
  }
  return false;
}

inline bool read_number(Transport &transport, const char *url, float *value, int *status) {
  if (value == nullptr || status == nullptr || url == nullptr) return false;
  char body[384]{};
  *status = 0;
  return transport.get(url, body, sizeof(body), status) &&
         asgard_url::request_succeeded(true, *status) && parse_number_response(body, value);
}

}  // namespace esphome::lune_touch_coordinator::asgard_adapter
