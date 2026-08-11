#include "asgard_url.h"
#include "asgard_confirmation.h"
#include <cassert>
#include <cstring>
using namespace esphome::lune_touch_coordinator::asgard_url;
int main() {
  char url[320];
  assert(build_number_url("asgard.local", 80, "Virtual Thermostat Input z1", 21.0f, url, sizeof(url)));
  assert(std::strcmp(url, "http://asgard.local:80/number/Virtual%20Thermostat%20Input%20z1/set?value=21.00") == 0);
  assert(build_number_read_url("asgard.local", 80, "Virtual Thermostat Input z1", url, sizeof(url)));
  assert(std::strcmp(url, "http://asgard.local:80/number/Virtual%20Thermostat%20Input%20z1") == 0);
  assert(build_number_url("asgard.local", 80, "Virtual%20Thermostat%20Input%20z1", 21.0f, url, sizeof(url)));
  assert(std::strstr(url, "Virtual%20Thermostat%20Input%20z1") != nullptr);
  assert(!build_number_url("bad host", 80, "x", 21.0f, url, sizeof(url)));
  assert(!build_number_url("asgard.local", 0, "x", 21.0f, url, sizeof(url)));
  assert(!request_succeeded(false, 0));
  assert(!request_succeeded(true, 404));
  assert(!request_succeeded(true, 503));
  assert(request_succeeded(true, 200));
  using namespace esphome::lune_touch_coordinator::asgard_confirmation;
  assert(values_match(21.0f, 21.05f));
  assert(!values_match(21.0f, 21.06f));
  assert(std::strcmp(status_name(Status::SENT), "sent") == 0);
  assert(std::strcmp(status_name(Status::CONFIRMED), "confirmed") == 0);
  assert(std::strcmp(status_name(Status::MISMATCH), "mismatch") == 0);
  assert(std::strcmp(status_name(Status::UNREACHABLE), "unreachable") == 0);
  assert(MAX_READ_ATTEMPTS == 3 && readback_backoff_ms(0) == 250 && readback_backoff_ms(1) == 500);
  std::puts("Asgard URL tests passed.");
}
