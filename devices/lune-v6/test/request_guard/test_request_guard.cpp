#include <cassert>
#include "../../components/lv6_dashboard/request_guard.h"
#include "../../components/lv6_dashboard/touch_auth.h"

int main() {
  esphome::lv6_dashboard::request_guard::Guard<2> guard;
  using esphome::lv6_dashboard::request_guard::Decision;
  assert(guard.check(7, 7, "motor-1", 100) == Decision::ACCEPT);
  assert(guard.check(7, 7, "motor-1", 101) == Decision::DUPLICATE);
  assert(guard.check(6, 7, "new-key", 102) == Decision::STALE);
  assert(guard.check(7, 7, "motor-1", 300101) == Decision::ACCEPT);

  using namespace esphome::lv6_dashboard::touch_auth;
  constexpr int64_t NOW = 1735689600;
  assert(!request_is_authenticated("", "", NOW, NOW, "nonce"));
  assert(!request_is_authenticated("provisioned", "incorrect", NOW, NOW, "nonce"));
  assert(!request_is_authenticated("provisioned", "provisioned", MIN_VALID_UTC_EPOCH_S - 1, NOW, "nonce"));
  assert(!request_is_authenticated("provisioned", "provisioned", NOW, NOW - MAX_TIMESTAMP_SKEW_S - 1, "nonce"));
  assert(!request_is_authenticated("provisioned", "provisioned", NOW, NOW + MAX_TIMESTAMP_SKEW_S + 1, "nonce"));
  assert(!request_is_authenticated("provisioned", "provisioned", NOW, NAN, "nonce"));
  assert(!request_is_authenticated("provisioned", "provisioned", NOW, NOW, ""));
  assert(request_is_authenticated("provisioned", "provisioned", NOW, NOW, "nonce"));
  return 0;
}
