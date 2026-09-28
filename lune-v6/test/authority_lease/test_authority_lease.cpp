#include "authority_lease.h"
#include <cstdio>
#include <cstdlib>

static void expect(bool condition, const char *message) { if (!condition) { std::fprintf(stderr, "FAIL  %s\n", message); std::exit(1); } std::printf("PASS  %s\n", message); }
int main() {
  lv6_authority::Lease lease; lease.configure("house-1", "touch-1"); lease.reset_after_boot();
  expect(!lease.touch_lease_active(0), "boot starts without an active Touch lease");
  lv6_authority::Request first{"house-1", "touch-1", "lease-a", 1, 1000, 90000};
  expect(lease.acquire_or_renew(first, false, 1000) == lv6_authority::Result::AUTH_REQUIRED, "unauthenticated lease is rejected");
  expect(lease.acquire_or_renew(first, true, 1000) == lv6_authority::Result::GRANTED, "authenticated Touch acquires lease");
  expect(lease.touch_lease_active(1001), "valid lease is active");
  expect(!lease.activate_fallback_if_due(1001, true), "V6-A cannot write during a valid Touch lease");
  first.sequence = 2;
  first.degraded = true;
  expect(lease.acquire_or_renew(first, true, 1500) == lv6_authority::Result::RENEWED, "degraded Touch renews lease");
  expect(lease.snapshot(1500).state == lv6_authority::State::TOUCH_DEGRADED, "degraded Touch state is visible to V6");
  first.degraded = false;
  expect(lease.acquire_or_renew(first, true, 2000) == lv6_authority::Result::REPLAYED, "replayed sequence is rejected");
  lv6_authority::Request conflict{"house-1", "touch-1", "lease-b", 3, 2000, 90000};
  expect(lease.acquire_or_renew(conflict, true, 2000) == lv6_authority::Result::CONFLICT, "conflicting lease id is rejected");
  lease.reset_after_boot(); expect(!lease.touch_lease_active(3000), "reboot does not restore active lease");
  expect(lease.acquire_or_renew(first, true, 3000) == lv6_authority::Result::GRANTED, "persisted identity can acquire after reboot");
  lease.expire_if_needed(93000); expect(!lease.touch_lease_active(93000), "expired lease is no longer active");
  expect(lease.snapshot(93000).state == lv6_authority::State::V6_FALLBACK_PENDING, "expiry enters fallback pending");
  expect(!lease.activate_fallback_if_due(123000, false), "V6-B never becomes fallback writer");
  expect(lease.activate_fallback_if_due(123000, true), "V6-A enters fallback only after lease guard");
  expect(lease.snapshot(123000).state == lv6_authority::State::V6_FALLBACK_ACTIVE, "fallback writer state is explicit");
  lv6_authority::Request recovery{"house-1", "touch-1", "lease-a", 3, 123000, 90000};
  expect(lease.acquire_or_renew(recovery, true, 123000) == lv6_authority::Result::PENDING, "Touch recovery waits for stability");
  expect(lease.snapshot(123000).state == lv6_authority::State::TOUCH_RECOVERY_PENDING, "recovery is explicit and has no writer");
  recovery.sequence = 4;
  expect(lease.acquire_or_renew(recovery, true, 243000) == lv6_authority::Result::GRANTED, "stable Touch recovery receives a new lease");

  // Optional control_mode on the lease
  {
    lv6_authority::Lease mode_lease;
    mode_lease.configure("house-1", "touch-1");
    mode_lease.reset_after_boot();
    lv6_authority::Request with_mode{"house-1", "touch-1", "lease-mode", 1, 1000, 90000, false,
                                     lv6_authority::ControlMode::NORMAL};
    expect(mode_lease.acquire_or_renew(with_mode, true, 1000) == lv6_authority::Result::GRANTED,
           "lease with control_mode is granted");
    expect(mode_lease.snapshot(1000).control_mode == lv6_authority::ControlMode::NORMAL,
           "active lease exposes control_mode");
    expect(std::strcmp(lv6_authority::control_mode_to_string(mode_lease.snapshot(1000).control_mode),
                       "normal") == 0,
           "control_mode serialises as normal");
    mode_lease.expire_if_needed(100000);
    expect(mode_lease.snapshot(100000).control_mode == lv6_authority::ControlMode::UNSET,
           "expired lease clears control_mode");

    lv6_authority::Request unset_mode{"house-1", "touch-1", "lease-mode", 2, 100000, 90000};
    expect(mode_lease.acquire_or_renew(unset_mode, true, 100000) == lv6_authority::Result::GRANTED,
           "lease without control_mode is granted");
    expect(mode_lease.snapshot(100000).control_mode == lv6_authority::ControlMode::UNSET,
           "absent control_mode stays UNSET");
    expect(lv6_authority::control_mode_from_string("heat_pump") ==
               lv6_authority::ControlMode::HEAT_PUMP,
           "control_mode_from_string accepts heat_pump");
    expect(lv6_authority::control_mode_from_string("") == lv6_authority::ControlMode::UNSET,
           "empty control_mode string is UNSET");
  }

  std::puts("All authority lease tests passed.");
}
