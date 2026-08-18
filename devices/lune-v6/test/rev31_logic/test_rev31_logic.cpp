#include "rev31_logic.h"

#include <cassert>
#include <cstdio>

using lv6::Rev31DecoderSelection;
using lv6::Rev31Direction;
using lv6::Rev31EndpointDecision;
using lv6::Rev31EndpointEvidence;
using lv6::Rev31MotionTracker;
using lv6::classify_rev31_endpoint;

static void test_decoder_is_one_hot_and_fail_safe() {
  Rev31DecoderSelection selection;
  assert(selection.faulted);
  assert(!selection.enable());

  selection.arm();
  for (uint8_t zone = 0; zone < 6; ++zone) {
    selection.coast();
    assert(selection.select(zone, Rev31Direction::FORWARD));
    assert(selection.decoder_output() == zone);
    assert(selection.enable());
    assert(!selection.select(0, Rev31Direction::REVERSE));

    selection.coast();
    assert(selection.select(zone, Rev31Direction::REVERSE));
    assert(selection.decoder_output() == zone + 8);
    assert(selection.enable());
  }

  selection.latch_fault();
  assert(!selection.enabled);
  assert(!selection.enable());
  selection.coast();
  assert(!selection.select(6, Rev31Direction::FORWARD));
}

static void test_motion_requires_amplitude_and_timing() {
  Rev31MotionTracker tracker(40, 50);
  auto noise = tracker.observe(1000, 1020, 20, 10);
  assert(noise.valid && !noise.moving);
  assert(tracker.evidence_count() == 0);

  auto stale_pair = tracker.observe(1000, 1100, 51, 20);
  assert(!stale_pair.valid && !stale_pair.moving);

  auto motion = tracker.observe(1000, 1060, 18, 30);
  assert(motion.valid && motion.moving);
  assert(tracker.evidence_count() == 1);
  assert(!tracker.stopped_for(779, 750));
  assert(tracker.stopped_for(780, 750));
}

static void test_endpoint_requires_force_and_motion() {
  Rev31EndpointEvidence evidence;
  assert(classify_rev31_endpoint(evidence) == Rev31EndpointDecision::DISCONNECTED);

  evidence = {};
  evidence.current_present = true;
  evidence.already_at_stop_window = true;
  assert(classify_rev31_endpoint(evidence) ==
         Rev31EndpointDecision::ALREADY_AT_ENDPOINT);

  evidence = {};
  evidence.current_present = true;
  evidence.current_elevated = true;
  evidence.motion_stopped = true;
  evidence.endpoint_window = true;
  // No prior motion: a missing BEMF signal is never accepted as a normal endpoint.
  assert(classify_rev31_endpoint(evidence) == Rev31EndpointDecision::CONTINUE);

  evidence.motion_observed = true;
  assert(classify_rev31_endpoint(evidence) == Rev31EndpointDecision::ENDPOINT);
  evidence.endpoint_window = false;
  assert(classify_rev31_endpoint(evidence) == Rev31EndpointDecision::JAM);

  evidence.sample_valid = false;
  assert(classify_rev31_endpoint(evidence) == Rev31EndpointDecision::SENSOR_FAULT);
}

int main() {
  test_decoder_is_one_hot_and_fail_safe();
  test_motion_requires_amplitude_and_timing();
  test_endpoint_requires_force_and_motion();
  std::puts("Rev 3.1 motor-safety logic tests passed");
  return 0;
}
