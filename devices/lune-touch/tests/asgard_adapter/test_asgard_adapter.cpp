#include "asgard_adapter.h"

#include <cassert>
#include <cstring>

using namespace esphome::lune_touch_coordinator::asgard_adapter;

class FakeTransport final : public Transport {
 public:
  bool get(const char *url, char *body, size_t body_len, int *status) override {
    std::strncpy(last_url, url, sizeof(last_url) - 1);
    std::snprintf(body, body_len, "{\"value\":21.25}");
    *status = 200;
    return true;
  }
  bool post_empty(const char *url, int *status) override {
    std::strncpy(last_url, url, sizeof(last_url) - 1);
    *status = 200;
    return true;
  }
  char last_url[320]{};
};

int main() {
  Config config{"asgard.local", 80, "Virtual Thermostat Input z1"};
  const Compatibility compat = compatibility(config);
  assert(compat.physical_temperature == CapabilityStatus::READY);
  assert(compat.target_sync == CapabilityStatus::UNSUPPORTED);
  assert(compat.operating_state == CapabilityStatus::UNSUPPORTED);
  char url[320];
  assert(build_physical_write_url(config, 21.0f, url, sizeof(url)));
  assert(std::strcmp(url, "http://asgard.local:80/number/Virtual%20Thermostat%20Input%20z1/set?value=21.00") == 0);
  assert(build_physical_read_url(config, url, sizeof(url)));
  FakeTransport fake;
  float value = NAN;
  int status = 0;
  assert(read_number(fake, url, &value, &status));
  assert(value == 21.25f && status == 200);
  assert(std::strcmp(compat.target_blocker, "target synchronization intentionally unsupported") == 0);
  assert(std::strcmp(compat.operating_state_blocker,
                     "external operating-state ingestion intentionally unsupported") == 0);
  assert(parse_number_response("{\"state\":\"20.50\"}", &value) && value == 20.5f);
  assert(!parse_number_response("{\"state\":\"unknown\"}", &value));
  std::puts("Asgard adapter tests passed.");
}
