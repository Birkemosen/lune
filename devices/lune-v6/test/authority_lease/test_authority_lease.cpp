#include "authority_lease.h"
#include <cstdio>
#include <cstdlib>

static void expect(bool condition, const char *message) { if (!condition) { std::fprintf(stderr, "FAIL  %s\n", message); std::exit(1); } std::printf("PASS  %s\n", message); }
int main() {
  hv6_authority::Lease lease; lease.configure("house-1", "touch-1"); lease.reset_after_boot();
  expect(!lease.touch_lease_active(0), "boot starts without an active Touch lease");
  hv6_authority::Request first{"house-1", "touch-1", "lease-a", 1, 1000, 90000};
  expect(lease.acquire_or_renew(first, false, 1000) == hv6_authority::Result::AUTH_REQUIRED, "unauthenticated lease is rejected");
  expect(lease.acquire_or_renew(first, true, 1000) == hv6_authority::Result::GRANTED, "authenticated Touch acquires lease");
  expect(lease.touch_lease_active(1001), "valid lease is active");
  expect(!lease.activate_fallback_if_due(1001, true), "V6-A cannot write during a valid Touch lease");
  first.sequence = 2;
  first.degraded = true;
  expect(lease.acquire_or_renew(first, true, 1500) == hv6_authority::Result::RENEWED, "degraded Touch renews lease");
  expect(lease.snapshot(1500).state == hv6_authority::State::TOUCH_DEGRADED, "degraded Touch state is visible to V6");
  first.degraded = false;
  expect(lease.acquire_or_renew(first, true, 2000) == hv6_authority::Result::REPLAYED, "replayed sequence is rejected");
  hv6_authority::Request conflict{"house-1", "touch-1", "lease-b", 3, 2000, 90000};
  expect(lease.acquire_or_renew(conflict, true, 2000) == hv6_authority::Result::CONFLICT, "conflicting lease id is rejected");
  lease.reset_after_boot(); expect(!lease.touch_lease_active(3000), "reboot does not restore active lease");
  expect(lease.acquire_or_renew(first, true, 3000) == hv6_authority::Result::GRANTED, "persisted identity can acquire after reboot");
  lease.expire_if_needed(93000); expect(!lease.touch_lease_active(93000), "expired lease is no longer active");
  expect(lease.snapshot(93000).state == hv6_authority::State::V6_FALLBACK_PENDING, "expiry enters fallback pending");
  expect(!lease.activate_fallback_if_due(123000, false), "V6-B never becomes fallback writer");
  expect(lease.activate_fallback_if_due(123000, true), "V6-A enters fallback only after lease guard");
  expect(lease.snapshot(123000).state == hv6_authority::State::V6_FALLBACK_ACTIVE, "fallback writer state is explicit");
  hv6_authority::Request recovery{"house-1", "touch-1", "lease-a", 3, 123000, 90000};
  expect(lease.acquire_or_renew(recovery, true, 123000) == hv6_authority::Result::PENDING, "Touch recovery waits for stability");
  expect(lease.snapshot(123000).state == hv6_authority::State::TOUCH_RECOVERY_PENDING, "recovery is explicit and has no writer");
  recovery.sequence = 4;
  expect(lease.acquire_or_renew(recovery, true, 243000) == hv6_authority::Result::GRANTED, "stable Touch recovery receives a new lease");
  std::puts("All authority lease tests passed.");
}
