#include "rev32_logic.h"

#include <cassert>
#include <cstdio>
#include <set>

using lv6::classify_rev32_endpoint;
using lv6::rev32_decision_records_endpoint;
using lv6::rev32_decoder_address;
using lv6::Rev32DecoderSelection;
using lv6::Rev32Direction;
using lv6::Rev32EndpointDecision;
using lv6::Rev32EndpointEvidence;
using lv6::Rev32StrokeConfig;
using lv6::Rev32StrokePhase;
using lv6::Rev32StrokeTracker;
using lv6::Rev32TachoQualifier;

// decoder.channel_address_map, transcribed from design-contract.json.  If this
// table and the header disagree, the contract is right and the header is stale.
struct ContractRow {
  uint8_t channel;
  uint8_t forward;
  uint8_t reverse;
};
static constexpr ContractRow CONTRACT[] = {
    {1, 7, 6}, {2, 4, 5}, {3, 13, 12}, {4, 14, 15}, {5, 9, 8}, {6, 10, 11},
};

static void test_address_map_matches_the_contract() {
  std::set<uint8_t> seen;
  for (const auto &row : CONTRACT) {
    const uint8_t index = row.channel - 1;
    assert(rev32_decoder_address(index, Rev32Direction::FORWARD) == row.forward);
    assert(rev32_decoder_address(index, Rev32Direction::REVERSE) == row.reverse);
    // Q0-Q3 reach no bridge input, so no reachable address may land there.
    assert(row.forward >= 4 && row.forward <= 15);
    assert(row.reverse >= 4 && row.reverse <= 15);
    assert(seen.insert(row.forward).second);
    assert(seen.insert(row.reverse).second);
  }
  assert(seen.size() == 12);
  // Out-of-range channels must not silently alias onto a real motor.
  assert(rev32_decoder_address(6, Rev32Direction::FORWARD) == lv6::REV32_ADDRESS_INVALID);
  assert(rev32_decoder_address(200, Rev32Direction::REVERSE) == lv6::REV32_ADDRESS_INVALID);
}

// The Rev 3.1 encoding was (dir << 3) | (channel - 1).  If firmware ever
// regressed to that formula it would drive the wrong motor on ten of twelve
// combinations, so assert the two disagree loudly.
static void test_superseded_formula_is_not_equivalent() {
  int disagreements = 0;
  for (const auto &row : CONTRACT) {
    const uint8_t index = row.channel - 1;
    if (rev32_decoder_address(index, Rev32Direction::FORWARD) != index)
      ++disagreements;
    if (rev32_decoder_address(index, Rev32Direction::REVERSE) != (index + 8u))
      ++disagreements;
  }
  assert(disagreements >= 10);
}

static void test_selection_is_fail_safe() {
  Rev32DecoderSelection selection;
  // Boot state is unarmed, so drive is refused before any latch handshake.
  assert(!selection.armed);
  assert(!selection.enable());

  // Arming is rejected while LATCH_STATE reads high (faulted or not armed).
  assert(!selection.arm(true));
  assert(!selection.armed);

  assert(selection.arm(false));
  assert(selection.armed);

  for (uint8_t index = 0; index < lv6::REV32_CHANNEL_COUNT; ++index) {
    selection.coast();
    assert(selection.select(index, Rev32Direction::FORWARD));
    assert(selection.decoder_address() == CONTRACT[index].forward);
    assert(selection.enable());
    // Address changes are refused while the bridge is live.
    assert(!selection.select(0, Rev32Direction::REVERSE));
    assert(selection.decoder_address() == CONTRACT[index].forward);

    selection.coast();
    assert(selection.select(index, Rev32Direction::REVERSE));
    assert(selection.decoder_address() == CONTRACT[index].reverse);
    assert(selection.enable());
  }
  selection.coast();
  assert(!selection.select(lv6::REV32_CHANNEL_COUNT, Rev32Direction::FORWARD));
}

static void test_arm_only_from_coast_and_latch_drops_drive() {
  Rev32DecoderSelection selection;
  assert(selection.arm(false));
  assert(selection.select(2, Rev32Direction::FORWARD));
  assert(selection.enable());

  // Re-arming a live bridge would reset the runtime cutoff mid-move.
  assert(!selection.arm(false));

  // LATCH_STATE going high removes drive and the armed state together.
  selection.observe_latch(true);
  assert(!selection.enabled);
  assert(!selection.armed);
  assert(!selection.enable());

  // A low reading does not silently re-arm; that needs an explicit arm pulse.
  selection.observe_latch(false);
  assert(!selection.armed);
  assert(selection.arm(false));
}

static void test_tacho_blanking_and_qualification() {
  Rev32TachoQualifier tacho(200, 8000, 200000);
  tacho.reset(1000);

  // Everything inside the blanking window is discarded, however well formed.
  assert(tacho.blanked(1000));
  assert(tacho.blanked(1000 + Rev32TachoQualifier::BLANKING_MS - 1));
  assert(!tacho.observe_edge(1000000, 5000, 1100));
  assert(tacho.count() == 0);
  assert(!tacho.blanked(1000 + Rev32TachoQualifier::BLANKING_MS));

  // A chopper-width pulse is rejected on width alone.
  assert(!tacho.observe_edge(2000000, 20, 1300));
  assert(tacho.count() == 0);

  // First qualified edge has no period to check yet.
  assert(tacho.observe_edge(2000000, 5000, 1300));
  assert(tacho.count() == 1);

  // 25-50 ms is the measured commutation period; 1 ms is too fast.
  assert(!tacho.observe_edge(2001000, 5000, 1301));
  assert(tacho.count() == 1);
  // ...and half a second is too slow.
  assert(!tacho.observe_edge(2500000, 5000, 1800));
  assert(tacho.count() == 1);

  assert(tacho.observe_edge(2030000, 5000, 1330));
  assert(tacho.count() == 2);
  assert(tacho.last_period_us() == 30000);
  assert(tacho.rejected() == 4);
}

static void test_plateau_requires_edges_first() {
  Rev32TachoQualifier tacho;
  tacho.reset(0);
  // No edges yet: silence is not a plateau, it is a motor that never turned.
  assert(!tacho.plateau_for(100000, 750));

  assert(tacho.observe_edge(1000000, 5000, 300));
  assert(!tacho.plateau_for(1000, 750));
  assert(tacho.plateau_for(300 + 750, 750));
}

// PCNT gives a count, not widths.  The count path must still refuse to credit
// a delta whose implied cadence is far above the commutation band.
static void test_hardware_count_path() {
  Rev32TachoQualifier tacho(200, 8000, 200000);
  tacho.reset(1000);

  // The first observation only establishes the baseline; a counter that was
  // never cleared must not be credited as travel.
  assert(tacho.observe_count(41234, 1000) == 0);
  assert(tacho.count() == 0);

  // Inside blanking the delta is discarded, not carried forward.
  assert(tacho.observe_count(41240, 1100) == 0);
  assert(tacho.count() == 0);
  assert(tacho.rejected() == 6);

  // 3 edges over 100 ms is 33 ms implied, inside the 20-40 Hz band.
  assert(tacho.observe_count(41243, 1350) == 3);
  assert(tacho.count() == 3);
  assert(tacho.last_period_us() == (1350 - 1000) * 1000 / 3);

  // 200 edges in 50 ms implies 250 us: chopper burst, credited to nothing.
  assert(tacho.observe_count(41443, 1400) == 0);
  assert(tacho.count() == 3);
  assert(tacho.rejected() == 206);

  // A poll with no change is not a rejection either.
  assert(tacho.observe_count(41443, 1450) == 0);
  assert(tacho.rejected() == 206);

  // The plateau clock runs from the last *credited* delta, so the rejected
  // burst above did not refresh it.
  assert(tacho.plateau_for(1350 + 750, 750));

  // Edges accumulated while the bridge was off are neither travel nor noise.
  const uint32_t before = tacho.count();
  const uint32_t rejected_before = tacho.rejected();
  tacho.rebase_count(41600);
  assert(tacho.count() == before);
  assert(tacho.rejected() == rejected_before);
  // ...and the next real delta is measured from the new baseline, so the coast
  // gap is not credited on the first poll after it.
  assert(tacho.observe_count(41603, 1500) == 3);
}

// The cadence baseline is what lets the stall debounce scale to how fast this
// motor actually turns.  Its first sample is the trap: the first credited
// advance after reset() spans from drive start, so it carries the whole
// blanking window.
static void test_cadence_baseline() {
  Rev32TachoQualifier tacho(200, 8000, 200000);
  tacho.reset(0);
  assert(tacho.cadence_us() == 0);

  // Baseline poll, then the first credited advance at t=300: its implied period
  // is 300 ms because it runs from drive start.  It must not become the cadence.
  assert(tacho.observe_count(0, 10) == 0);
  assert(tacho.observe_count(1, 300) == 1);
  assert(tacho.last_period_us() == 300000);
  assert(tacho.cadence_us() == 0);

  // Second advance: 30 ms, a real commutation period.  This is the origin.
  assert(tacho.observe_count(2, 330) == 1);
  assert(tacho.cadence_us() == 30000);

  // ...and further samples are smoothed into it rather than replacing it.
  assert(tacho.observe_count(3, 380) == 1);
  assert(tacho.cadence_us() > 30000 && tacho.cadence_us() < 50000);
}

static void test_adaptive_plateau() {
  Rev32TachoQualifier tacho(200, 8000, 200000);
  tacho.reset(0);

  // No cadence yet: the ceiling stands.  That is the conservative answer, and
  // it is exactly the fixed 750 ms the Rev 3.1 path uses.
  assert(tacho.adaptive_plateau_ms(30, 150, 750) == 750);

  tacho.observe_count(0, 10);
  tacho.observe_count(1, 300);
  tacho.observe_count(2, 330);
  assert(tacho.cadence_us() == 30000);

  // 30 ms x 3.0 = 90 ms, below the floor, so the floor stands.  This is the
  // normal case on the qualified actuator: 150 ms, inside E-08's 250 ms bound
  // and five times faster than the fixed debounce it replaces.
  assert(tacho.adaptive_plateau_ms(30, 150, 750) == 150);
  // A slower motor scales up rather than being cut short.
  assert(tacho.adaptive_plateau_ms(100, 150, 750) == 300);
  // ...but never past the ceiling.
  assert(tacho.adaptive_plateau_ms(300, 150, 750) == 750);

  // Stretch is measured against the same baseline and rises with the silence,
  // without waiting for the edge that would end the period.
  assert(tacho.stretch_x10(330) == 0);
  assert(tacho.stretch_x10(360) == 10);   // one cadence of silence
  assert(tacho.stretch_x10(420) == 30);   // three: the stall threshold
}

// Closing is four phases and two of them look the same in the current domain.
// These are the traces that separate them.
static void feed(Rev32StrokeTracker &t, uint32_t count, float ma, uint16_t stretch,
                 int ticks = 1) {
  for (int i = 0; i < ticks; ++i)
    t.observe(count, ma, stretch);
}

static void test_pin_contact_is_not_an_endstop() {
  Rev32StrokeTracker tracker;
  tracker.reset(/*direction_is_open=*/false);

  // Phase 1: free travel, ~14 mA, steady cadence.
  feed(tracker, 0, 14.0f, 2);
  feed(tracker, 100, 14.0f, 2, 5);
  assert(tracker.phase() == Rev32StrokePhase::FREE_TRAVEL);
  assert(!tracker.contact_seen());

  // Phase 2: pin contact.  Current steps up AND the rotor slows - at this
  // instant it is indistinguishable from the hard stop.
  feed(tracker, 200, 18.0f, 18);
  assert(tracker.phase() == Rev32StrokePhase::CONTACT);
  assert(tracker.contact_seen());
  assert(tracker.contact_count() == 200);

  // The classifier must refuse an endpoint for as long as that is unresolved,
  // even with full load evidence and a commanded endpoint.
  Rev32EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.phase = Rev32StrokePhase::CONTACT;
  assert(classify_rev32_endpoint(e) == Rev32EndpointDecision::CONTINUE);

  // ...and it resolves: the resistance falls again and the rotor picks its
  // speed back up.  That is the pin, not the seat.
  feed(tracker, 205, 14.5f, 4);
  assert(tracker.phase() == Rev32StrokePhase::FREE_TRAVEL);
  assert(tracker.contact_recovered());
}

static void test_seating_outlasts_the_contact_window() {
  Rev32StrokeConfig cfg;
  cfg.contact_recovery_ripples = 15;
  Rev32StrokeTracker tracker(cfg);
  tracker.reset(false);

  feed(tracker, 0, 14.0f, 2);
  feed(tracker, 200, 18.0f, 18);
  assert(tracker.phase() == Rev32StrokePhase::CONTACT);

  // Phase 3: the load does not release.  Past the recovery window this is real
  // seating, not the contact transient.
  feed(tracker, 216, 19.0f, 18);
  assert(tracker.phase() == Rev32StrokePhase::UNDER_LOAD);
  assert(!tracker.contact_recovered());

  // Phase 4: the rotor stops and stays stopped.
  feed(tracker, 216, 40.0f, 35);
  assert(tracker.phase() == Rev32StrokePhase::STOPPING);
}

static void test_opening_has_no_pressure_phase() {
  Rev32StrokeTracker tracker;
  tracker.reset(/*direction_is_open=*/true);
  assert(tracker.direction_is_open());

  // Free retract toward the housing, then the gear train bottoms out.  The
  // current barely moves - 15 to 25 mA - so the rotor stopping is the evidence.
  feed(tracker, 0, 15.0f, 2);
  feed(tracker, 500, 15.0f, 3, 5);
  assert(tracker.phase() == Rev32StrokePhase::FREE_TRAVEL);
  assert(!tracker.contact_seen());

  feed(tracker, 1040, 15.5f, 40);
  assert(tracker.phase() == Rev32StrokePhase::STOPPING);

  // A stop out of free travel is the normal opening endpoint...
  Rev32EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.phase = Rev32StrokePhase::FREE_TRAVEL;
  e.direction_is_open = true;
  assert(classify_rev32_endpoint(e) == Rev32EndpointDecision::ENDPOINT);

  // ...but on closing the seat is only reachable through contact, so the same
  // evidence in free travel is something in the way.
  e.direction_is_open = false;
  assert(classify_rev32_endpoint(e) == Rev32EndpointDecision::JAM);
}

static void test_learned_window_withholds_an_endpoint() {
  Rev32EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.commanded_endpoint = true;
  e.phase = Rev32StrokePhase::UNDER_LOAD;

  e.endpoint_window = true;
  assert(classify_rev32_endpoint(e) == Rev32EndpointDecision::ENDPOINT);

  // Stopped under load well short of the learned count: a jam, and it must not
  // update the stored position.
  e.endpoint_window = false;
  assert(classify_rev32_endpoint(e) == Rev32EndpointDecision::JAM);
  assert(!rev32_decision_records_endpoint(classify_rev32_endpoint(e)));
}

// A closing move that is past pin contact and pressing the pin down. This is
// the phase a closing endpoint is actually reached in; a stop before contact is
// covered by test_opening_has_no_pressure_phase().
static Rev32EndpointEvidence moving_normally() {
  Rev32EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.commutation_observed = true;
  e.phase = Rev32StrokePhase::UNDER_LOAD;
  return e;
}

static void test_endpoint_classifier() {
  // Inside blanking nothing is decided.
  Rev32EndpointEvidence blanked = moving_normally();
  blanked.blanking_elapsed = false;
  blanked.commutation_plateau = true;
  blanked.load_evidence = true;
  assert(classify_rev32_endpoint(blanked) == Rev32EndpointDecision::CONTINUE);

  // Healthy travel.
  assert(classify_rev32_endpoint(moving_normally()) == Rev32EndpointDecision::CONTINUE);

  // Nothing drawing, nothing turning.
  Rev32EndpointEvidence dead;
  dead.blanking_elapsed = true;
  assert(classify_rev32_endpoint(dead) == Rev32EndpointDecision::DISCONNECTED);

  // Current but never any commutation: ambiguous, must not record an endpoint.
  Rev32EndpointEvidence stuck = moving_normally();
  stuck.commutation_observed = false;
  stuck.load_evidence = true;
  stuck.commanded_endpoint = true;
  stuck.endpoint_window = true;
  assert(classify_rev32_endpoint(stuck) == Rev32EndpointDecision::BLOCKED_OR_UNKNOWN);
  assert(!rev32_decision_records_endpoint(classify_rev32_endpoint(stuck)));

  // The absolute cap trips before the tacho has qualified a stop.
  Rev32EndpointEvidence over = moving_normally();
  over.current_over_cap = true;
  assert(classify_rev32_endpoint(over) == Rev32EndpointDecision::OVERCURRENT);

  // A real endpoint needs all of: plateau, elevated current, commanded
  // endpoint and the learned-count window.
  Rev32EndpointEvidence endpoint = moving_normally();
  endpoint.commutation_plateau = true;
  endpoint.load_evidence = true;
  endpoint.commanded_endpoint = true;
  endpoint.endpoint_window = true;
  assert(classify_rev32_endpoint(endpoint) == Rev32EndpointDecision::ENDPOINT);
  assert(rev32_decision_records_endpoint(Rev32EndpointDecision::ENDPOINT));

  // Same stop, but not where an endpoint was commanded: that is a jam.
  Rev32EndpointEvidence jam = endpoint;
  jam.commanded_endpoint = false;
  assert(classify_rev32_endpoint(jam) == Rev32EndpointDecision::JAM);
  assert(!rev32_decision_records_endpoint(classify_rev32_endpoint(jam)));

  // Stopped inside the command but outside the learned window is also a jam.
  Rev32EndpointEvidence early = endpoint;
  early.endpoint_window = false;
  assert(classify_rev32_endpoint(early) == Rev32EndpointDecision::JAM);

  // Plateau without a current step is just a slow patch, not a stop.
  Rev32EndpointEvidence coasting = endpoint;
  coasting.load_evidence = false;
  assert(classify_rev32_endpoint(coasting) == Rev32EndpointDecision::CONTINUE);

  // Counter went quiet while current vanished: instrument fault, not endpoint.
  Rev32EndpointEvidence sensor = endpoint;
  sensor.current_present = false;
  assert(classify_rev32_endpoint(sensor) == Rev32EndpointDecision::TACHO_FAULT);
  assert(!rev32_decision_records_endpoint(classify_rev32_endpoint(sensor)));
}

static void test_only_endpoint_records_position() {
  const Rev32EndpointDecision all[] = {
      Rev32EndpointDecision::CONTINUE,   Rev32EndpointDecision::ENDPOINT,
      Rev32EndpointDecision::JAM,        Rev32EndpointDecision::OVERCURRENT,
      Rev32EndpointDecision::DISCONNECTED, Rev32EndpointDecision::TACHO_FAULT,
      Rev32EndpointDecision::BLOCKED_OR_UNKNOWN,
  };
  int recording = 0;
  for (const auto decision : all) {
    if (rev32_decision_records_endpoint(decision))
      ++recording;
    // Everything except CONTINUE ends the move.
    assert(lv6::rev32_decision_stops_drive(decision) ==
           (decision != Rev32EndpointDecision::CONTINUE));
  }
  assert(recording == 1);
}

int main() {
  test_address_map_matches_the_contract();
  test_superseded_formula_is_not_equivalent();
  test_selection_is_fail_safe();
  test_arm_only_from_coast_and_latch_drops_drive();
  test_tacho_blanking_and_qualification();
  test_plateau_requires_edges_first();
  test_hardware_count_path();
  test_cadence_baseline();
  test_adaptive_plateau();
  test_pin_contact_is_not_an_endstop();
  test_seating_outlasts_the_contact_window();
  test_opening_has_no_pressure_phase();
  test_learned_window_withholds_an_endpoint();
  test_endpoint_classifier();
  test_only_endpoint_records_position();
  std::printf("rev32_logic: all assertions passed\n");
  return 0;
}
