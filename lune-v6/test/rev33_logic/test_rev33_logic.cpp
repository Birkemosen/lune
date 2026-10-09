#include "rev33_logic.h"

#include <cassert>
#include <cstdio>
#include <set>

// Endpoint detection is revision-neutral (endpoint_logic.h); exercise the
// shared names here.
using lv6::classify_endpoint;
using lv6::endpoint_decision_records_position;
using lv6::endpoint_decision_stops_drive;
using lv6::EndpointDecision;
using lv6::EndpointEvidence;
using lv6::StrokeConfig;
using lv6::StrokePhase;
using lv6::StrokeTracker;
using lv6::rev33_decoder_address;
using lv6::Rev33DecoderSelection;
using lv6::Rev33Direction;
using lv6::Rev33TachoQualifier;

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
    assert(rev33_decoder_address(index, Rev33Direction::FORWARD) == row.forward);
    assert(rev33_decoder_address(index, Rev33Direction::REVERSE) == row.reverse);
    // Q0-Q3 reach no bridge input, so no reachable address may land there.
    assert(row.forward >= 4 && row.forward <= 15);
    assert(row.reverse >= 4 && row.reverse <= 15);
    assert(seen.insert(row.forward).second);
    assert(seen.insert(row.reverse).second);
  }
  assert(seen.size() == 12);
  // Out-of-range channels must not silently alias onto a real motor.
  assert(rev33_decoder_address(6, Rev33Direction::FORWARD) == lv6::REV33_ADDRESS_INVALID);
  assert(rev33_decoder_address(200, Rev33Direction::REVERSE) == lv6::REV33_ADDRESS_INVALID);
}

// The Rev 3.1 encoding was (dir << 3) | (channel - 1).  If firmware ever
// regressed to that formula it would drive the wrong motor on ten of twelve
// combinations, so assert the two disagree loudly.
static void test_superseded_formula_is_not_equivalent() {
  int disagreements = 0;
  for (const auto &row : CONTRACT) {
    const uint8_t index = row.channel - 1;
    if (rev33_decoder_address(index, Rev33Direction::FORWARD) != index)
      ++disagreements;
    if (rev33_decoder_address(index, Rev33Direction::REVERSE) != (index + 8u))
      ++disagreements;
  }
  assert(disagreements >= 10);
}

static void test_selection_is_fail_safe() {
  Rev33DecoderSelection selection;
  // Boot state is unarmed, so drive is refused before the permit is granted.
  assert(!selection.armed);
  assert(!selection.enable());

  // Arming is rejected while a fault net is asserted.
  assert(!selection.arm(true));
  assert(!selection.armed);

  assert(selection.arm(false));
  assert(selection.armed);

  for (uint8_t index = 0; index < lv6::REV33_CHANNEL_COUNT; ++index) {
    selection.coast();
    assert(selection.select(index, Rev33Direction::FORWARD));
    assert(selection.decoder_address() == CONTRACT[index].forward);
    assert(selection.enable());
    // Address changes are refused while the bridge is live.
    assert(!selection.select(0, Rev33Direction::REVERSE));
    assert(selection.decoder_address() == CONTRACT[index].forward);

    selection.coast();
    assert(selection.select(index, Rev33Direction::REVERSE));
    assert(selection.decoder_address() == CONTRACT[index].reverse);
    assert(selection.enable());
  }
  selection.coast();
  assert(!selection.select(lv6::REV33_CHANNEL_COUNT, Rev33Direction::FORWARD));
}

static void test_arm_only_from_coast_and_fault_drops_drive() {
  Rev33DecoderSelection selection;
  assert(selection.arm(false));
  assert(selection.select(2, Rev33Direction::FORWARD));
  assert(selection.enable());

  // Re-granting the permit on a live bridge is refused.
  assert(!selection.arm(false));

  // A fault net asserting removes drive and the armed state together.
  selection.observe_fault(true);
  assert(!selection.enabled);
  assert(!selection.armed);
  assert(!selection.enable());

  // A clear reading does not silently re-arm; that needs an explicit grant.
  selection.observe_fault(false);
  assert(!selection.armed);
  assert(selection.arm(false));
}

static void test_tacho_blanking_and_qualification() {
  Rev33TachoQualifier tacho(200, 8000, 200000);
  tacho.reset(1000);

  // Everything inside the blanking window is discarded, however well formed.
  assert(tacho.blanked(1000));
  assert(tacho.blanked(1000 + Rev33TachoQualifier::BLANKING_MS - 1));
  assert(!tacho.observe_edge(1000000, 5000, 1100));
  assert(tacho.count() == 0);
  assert(!tacho.blanked(1000 + Rev33TachoQualifier::BLANKING_MS));

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
  Rev33TachoQualifier tacho;
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
  Rev33TachoQualifier tacho(200, 8000, 200000);
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
  Rev33TachoQualifier tacho(200, 8000, 200000);
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
  Rev33TachoQualifier tacho(200, 8000, 200000);
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
// The baseline is injected by the caller in firmware (a frozen running minimum
// of the free-travel current), so the harness supplies it here too.
static float g_baseline = 14.0f;

static void feed(StrokeTracker &t, uint32_t count, float ma, uint16_t stretch,
                 int ticks = 1) {
  for (int i = 0; i < ticks; ++i)
    t.observe(count, ma, g_baseline, stretch);
}

static void test_pin_contact_is_not_an_endstop() {
  StrokeTracker tracker;
  tracker.reset(/*direction_is_open=*/false);

  // Phase 1: free travel, ~14 mA, steady cadence.
  feed(tracker, 0, 14.0f, 2);
  feed(tracker, 100, 14.0f, 2, 5);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);
  assert(!tracker.contact_seen());

  // Phase 2: pin contact.  Current steps up AND the rotor slows - at this
  // instant it is indistinguishable from the hard stop.  One tick must not be
  // enough: observe() runs at 10 ms against a ~13 ms commutation period, and
  // contact_count_ is the datum for the closing endpoint window.
  feed(tracker, 200, 18.0f, 18);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);
  feed(tracker, 200, 18.0f, 18, 2);
  assert(tracker.phase() == StrokePhase::CONTACT);
  assert(tracker.contact_seen());
  assert(tracker.contact_count() == 200);

  // The classifier must refuse an endpoint for as long as that is unresolved,
  // even with full load evidence and a commanded endpoint.
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.phase = StrokePhase::CONTACT;
  assert(classify_endpoint(e) == EndpointDecision::CONTINUE);

  // ...and it resolves: the resistance falls again and the rotor picks its
  // speed back up.  That is the pin, not the seat.
  feed(tracker, 205, 14.5f, 4);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);
  assert(tracker.contact_recovered());
}

// The measured pin ramp is ~1 mA/s.  An internally-tracked baseline chased it
// and never produced a step, leaving the tracker stuck in one phase for a whole
// stroke.  With the baseline frozen, the same ramp must reach CONTACT.
static void test_slow_ramp_still_reaches_contact() {
  StrokeTracker tracker;
  tracker.reset(false);
  g_baseline = 24.2f;  // measured free travel

  feed(tracker, 0, 24.2f, 2);
  feed(tracker, 100, 24.2f, 2, 10);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);

  // ~1 mA/s over 4 s, which is the measured pin-contact ramp: far too slow for
  // an internally-EMA'd baseline (tau ~200 ms) to ever register as a step.
  uint32_t count = 100;
  for (int i = 1; i <= 400; ++i) {
    const float ma = 24.2f + static_cast<float>(i) * 0.01f;  // 0.01 mA per 10 ms tick
    feed(tracker, count, ma, 18);
    if (i % 2 == 0)
      count += 1;
  }
  assert(tracker.phase() == StrokePhase::CONTACT ||
         tracker.phase() == StrokePhase::UNDER_LOAD);
  assert(tracker.contact_seen());
  g_baseline = 14.0f;
}

// Measured Rev 3.3 close (motor-lab-z1-close.csv): 23 -> 28 mA over ~2 s at the
// pin while the cadence stays at ~1.1x. observe() alone never leaves
// FREE_TRAVEL, and the trailing-step trip on the pin ramp was classified as a
// JAM - the stroke stopped at the pin and the zone was marked BLOCKED.
static void test_current_only_pin_contact_is_not_a_jam() {
  StrokeTracker tracker;
  tracker.reset(false);
  g_baseline = 23.1f;

  uint32_t count = 0;
  for (int i = 0; i < 200; ++i, ++count)
    feed(tracker, count, 23.1f + static_cast<float>(i) * 0.025f, 11);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);

  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = false;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.phase = tracker.phase();
  assert(classify_endpoint(e) == EndpointDecision::JAM);

  tracker.note_current_contact(/*onset=*/60, 28.0f);
  assert(tracker.contact_seen());
  assert(tracker.contact_count() == 60);
  assert(tracker.phase() == StrokePhase::UNDER_LOAD);

  // Before the seat window the same load evidence waits instead of faulting.
  e.phase = tracker.phase();
  e.endpoint_window = false;
  assert(classify_endpoint(e) == EndpointDecision::CONTINUE);

  // Pressing the pin keeps the current above the step, so it stays loaded.
  feed(tracker, count + 10, 28.5f, 11, 5);
  assert(tracker.phase() == StrokePhase::UNDER_LOAD);

  // Idempotent, and never applies to opening.
  tracker.note_current_contact(150, 30.0f);
  assert(tracker.contact_count() == 60);
  StrokeTracker opening;
  opening.reset(true);
  opening.note_current_contact(60, 28.0f);
  assert(!opening.contact_seen());
  assert(opening.phase() == StrokePhase::FREE_TRAVEL);
  g_baseline = 14.0f;
}

static void test_no_phase_without_a_baseline() {
  StrokeTracker tracker;
  tracker.reset(false);
  // Before the free-travel minimum has settled there is no reference, so no
  // phase claim may be made however strong the signal looks.
  for (int i = 0; i < 10; ++i)
    tracker.observe(100, 50.0f, 0.0f, 40);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);
  assert(!tracker.contact_seen());
}

static void test_seating_outlasts_the_contact_window() {
  StrokeConfig cfg;
  cfg.contact_recovery_ripples = 15;
  StrokeTracker tracker(cfg);
  tracker.reset(false);

  feed(tracker, 0, 14.0f, 2);
  feed(tracker, 200, 18.0f, 18, 3);
  assert(tracker.phase() == StrokePhase::CONTACT);

  // Phase 3: the load does not release.  Past the recovery window this is real
  // seating, not the contact transient.
  feed(tracker, 216, 19.0f, 18);
  assert(tracker.phase() == StrokePhase::UNDER_LOAD);
  assert(!tracker.contact_recovered());

  // Phase 4: the rotor stops and stays stopped.
  feed(tracker, 216, 40.0f, 35);
  assert(tracker.phase() == StrokePhase::STOPPING);
}

static void test_opening_has_no_pressure_phase() {
  StrokeTracker tracker;
  tracker.reset(/*direction_is_open=*/true);
  assert(tracker.direction_is_open());

  // Free retract toward the housing, then the gear train bottoms out.  The
  // current barely moves - 15 to 25 mA - so the rotor stopping is the evidence.
  feed(tracker, 0, 15.0f, 2);
  feed(tracker, 500, 15.0f, 3, 5);
  assert(tracker.phase() == StrokePhase::FREE_TRAVEL);
  assert(!tracker.contact_seen());

  feed(tracker, 1040, 15.5f, 40);
  assert(tracker.phase() == StrokePhase::STOPPING);

  // A rotor that has stopped while still drawing only free-travel current is
  // physically impossible - a stalled motor has no back-EMF and must draw V/R -
  // so this is instrument error, not an endpoint. It stops the drive but must
  // not record a position.
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = false;
  e.load_evidence_weak = false;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.phase = StrokePhase::FREE_TRAVEL;
  e.direction_is_open = true;
  assert(classify_endpoint(e) == EndpointDecision::STOPPED_UNCONFIRMED);
  assert(!endpoint_decision_records_position(classify_endpoint(e)));
  assert(endpoint_decision_stops_drive(classify_endpoint(e)));

  // Even a weak current rise is enough to make the same plateau a real stop.
  e.load_evidence_weak = true;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);

  // STOPPING cadence alone, before the debounced plateau, is NOT sufficient:
  // it pre-empted the plateau by ~60 ms while carrying no extra evidence.
  e.commutation_plateau = false;
  e.phase = StrokePhase::STOPPING;
  e.load_evidence_weak = false;
  assert(classify_endpoint(e) != EndpointDecision::ENDPOINT);

  // Outside a commanded window a plateau is a jam, not an endpoint.
  e.commutation_plateau = true;
  e.phase = StrokePhase::FREE_TRAVEL;
  e.load_evidence = true;
  e.endpoint_window = false;
  assert(classify_endpoint(e) == EndpointDecision::JAM);
  e.endpoint_window = true;
  e.load_evidence = false;

  // ...but on closing the seat is only reachable through contact, so the same
  // plateau evidence in free travel is something in the way.
  e.commutation_plateau = true;
  e.load_evidence = true;
  e.phase = StrokePhase::FREE_TRAVEL;
  e.direction_is_open = false;
  assert(classify_endpoint(e) == EndpointDecision::JAM);
}

static void test_learned_window_withholds_an_endpoint() {
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.commanded_endpoint = true;
  e.phase = StrokePhase::UNDER_LOAD;

  e.endpoint_window = true;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);

  // Stopped under load well short of the learned count: a jam, and it must not
  // update the stored position.
  e.endpoint_window = false;
  assert(classify_endpoint(e) == EndpointDecision::JAM);
  assert(!endpoint_decision_records_position(classify_endpoint(e)));
}

// Measured HmIP close traces keep advancing motion_count through the seat grind
// (brush chatter). Current-domain load evidence in UNDER_LOAD must still stop
// the drive before the 40 s housing-exit wall — without requiring a tach plateau
// (VdMot Controller method: current trip, count for position only).
static void test_close_seat_without_tacho_plateau() {
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = false;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.direction_is_open = false;
  e.phase = StrokePhase::UNDER_LOAD;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);
  assert(endpoint_decision_records_position(classify_endpoint(e)));

  e.phase = StrokePhase::STOPPING;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);

  // Pin-contact ambiguity still withholds.
  e.phase = StrokePhase::CONTACT;
  assert(classify_endpoint(e) == EndpointDecision::CONTINUE);

  // Closing under load before the plunger ever reached the pin is something in
  // the way. This used to fall through to the plateau branch and return
  // CONTINUE when there was no plateau - i.e. exactly when brush chatter kept
  // the counter alive, which is the case this whole path exists for.
  e.phase = StrokePhase::FREE_TRAVEL;
  assert(classify_endpoint(e) == EndpointDecision::JAM);

  // Opening: VdMot pure current trip (no tach plateau required).
  e.direction_is_open = true;
  e.phase = StrokePhase::FREE_TRAVEL;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);

  // No current-domain load signature → keep looking (do not invent an endpoint).
  e.direction_is_open = false;
  e.phase = StrokePhase::UNDER_LOAD;
  e.load_evidence = false;
  assert(classify_endpoint(e) == EndpointDecision::CONTINUE);
}

// A closing move that is past pin contact and pressing the pin down. This is
// the phase a closing endpoint is actually reached in; a stop before contact is
// covered by test_opening_has_no_pressure_phase().
static EndpointEvidence moving_normally() {
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.commutation_observed = true;
  e.phase = StrokePhase::UNDER_LOAD;
  return e;
}

static void test_endpoint_classifier() {
  // Inside blanking nothing is decided.
  EndpointEvidence blanked = moving_normally();
  blanked.blanking_elapsed = false;
  blanked.commutation_plateau = true;
  blanked.load_evidence = true;
  assert(classify_endpoint(blanked) == EndpointDecision::CONTINUE);

  // Healthy travel.
  assert(classify_endpoint(moving_normally()) == EndpointDecision::CONTINUE);

  // Nothing drawing, nothing turning.
  EndpointEvidence dead;
  dead.blanking_elapsed = true;
  assert(classify_endpoint(dead) == EndpointDecision::DISCONNECTED);

  // Current but never any commutation: ambiguous, must not record an endpoint.
  EndpointEvidence stuck = moving_normally();
  stuck.commutation_observed = false;
  stuck.load_evidence = true;
  stuck.commanded_endpoint = true;
  stuck.endpoint_window = true;
  assert(classify_endpoint(stuck) == EndpointDecision::BLOCKED_OR_UNKNOWN);
  assert(!endpoint_decision_records_position(classify_endpoint(stuck)));

  // The absolute cap trips before the tacho has qualified a stop.
  EndpointEvidence over = moving_normally();
  over.current_over_cap = true;
  assert(classify_endpoint(over) == EndpointDecision::OVERCURRENT);

  // A real endpoint needs all of: plateau, elevated current, commanded
  // endpoint and the learned-count window.
  EndpointEvidence endpoint = moving_normally();
  endpoint.commutation_plateau = true;
  endpoint.load_evidence = true;
  endpoint.commanded_endpoint = true;
  endpoint.endpoint_window = true;
  assert(classify_endpoint(endpoint) == EndpointDecision::ENDPOINT);
  assert(endpoint_decision_records_position(EndpointDecision::ENDPOINT));

  // Same stop, but not where an endpoint was commanded: that is a jam.
  EndpointEvidence jam = endpoint;
  jam.commanded_endpoint = false;
  assert(classify_endpoint(jam) == EndpointDecision::JAM);
  assert(!endpoint_decision_records_position(classify_endpoint(jam)));

  // Stopped inside the command but outside the learned window is also a jam.
  EndpointEvidence early = endpoint;
  early.endpoint_window = false;
  assert(classify_endpoint(early) == EndpointDecision::JAM);

  // Plateau without a current step is just a slow patch on closing, not a stop.
  EndpointEvidence coasting = endpoint;
  coasting.load_evidence = false;
  assert(classify_endpoint(coasting) == EndpointDecision::CONTINUE);

  // Opening: the same plateau with no current evidence is not a stop either -
  // it is a counter that disagrees with physics.
  EndpointEvidence open_gentle = coasting;
  open_gentle.direction_is_open = true;
  open_gentle.phase = StrokePhase::FREE_TRAVEL;
  assert(classify_endpoint(open_gentle) == EndpointDecision::STOPPED_UNCONFIRMED);
  open_gentle.load_evidence_weak = true;
  assert(classify_endpoint(open_gentle) == EndpointDecision::ENDPOINT);

  // Counter went quiet while current vanished: instrument fault, not endpoint.
  EndpointEvidence sensor = endpoint;
  sensor.current_present = false;
  assert(classify_endpoint(sensor) == EndpointDecision::TACHO_FAULT);
  assert(!endpoint_decision_records_position(classify_endpoint(sensor)));
}

static void test_only_endpoint_records_position() {
  const EndpointDecision all[] = {
      EndpointDecision::CONTINUE,   EndpointDecision::ENDPOINT,
      EndpointDecision::JAM,        EndpointDecision::OVERCURRENT,
      EndpointDecision::DISCONNECTED, EndpointDecision::TACHO_FAULT,
      EndpointDecision::BLOCKED_OR_UNKNOWN,
  };
  int recording = 0;
  for (const auto decision : all) {
    if (endpoint_decision_records_position(decision))
      ++recording;
    // Everything except CONTINUE ends the move.
    assert(endpoint_decision_stops_drive(decision) ==
           (decision != EndpointDecision::CONTINUE));
  }
  assert(recording == 1);
}

// A board fault must never become a mechanical verdict, whatever the tacho says.
static void test_circuit_fault_never_becomes_an_endpoint() {
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.endpoint_window = true;
  e.commanded_endpoint = true;
  e.phase = StrokePhase::UNDER_LOAD;
  e.current_over_circuit_fault = true;
  assert(classify_endpoint(e) == EndpointDecision::OVERCURRENT);
  assert(!endpoint_decision_records_position(classify_endpoint(e)));
  // ...and it outranks blanking: a short is a fault from the first frame.
  e.blanking_elapsed = false;
  assert(classify_endpoint(e) == EndpointDecision::OVERCURRENT);
}

// A valve already on its seat: re-homing toward the seat stops under load at
// once, and the stroke tracker never leaves FREE_TRAVEL. That is the seat, not a
// jam - otherwise a closed valve can never be re-homed (seen 2026-10-09: every
// zone BLOCKED, every open refused). A mid-travel stop is still a jam.
static void test_seated_start_closing_is_the_seat() {
  EndpointEvidence e;
  e.blanking_elapsed = true;
  e.current_present = true;
  e.load_evidence = true;
  e.commutation_observed = true;
  e.commutation_plateau = true;
  e.endpoint_window = false;
  e.commanded_endpoint = true;
  e.phase = StrokePhase::FREE_TRAVEL;
  e.direction_is_open = false;
  assert(classify_endpoint(e) == EndpointDecision::JAM);
  e.seated_start = true;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);
  // Past pin contact (UNDER_LOAD) the learned seating window is never reached
  // from the seat either; the seated start still decides.
  e.phase = StrokePhase::UNDER_LOAD;
  assert(classify_endpoint(e) == EndpointDecision::ENDPOINT);
  e.seated_start = false;
  assert(classify_endpoint(e) == EndpointDecision::JAM);
  e.seated_start = true;
  e.phase = StrokePhase::FREE_TRAVEL;
  // Not a commanded endpoint (a normal move): still a jam.
  e.commanded_endpoint = false;
  assert(classify_endpoint(e) == EndpointDecision::JAM);
  // Without load evidence nothing is decided yet.
  e.commanded_endpoint = true;
  e.load_evidence = false;
  assert(classify_endpoint(e) == EndpointDecision::CONTINUE);
}

int main() {
  test_seated_start_closing_is_the_seat();
  test_address_map_matches_the_contract();
  test_superseded_formula_is_not_equivalent();
  test_selection_is_fail_safe();
  test_arm_only_from_coast_and_fault_drops_drive();
  test_tacho_blanking_and_qualification();
  test_plateau_requires_edges_first();
  test_hardware_count_path();
  test_cadence_baseline();
  test_adaptive_plateau();
  test_pin_contact_is_not_an_endstop();
  test_slow_ramp_still_reaches_contact();
  test_current_only_pin_contact_is_not_a_jam();
  test_no_phase_without_a_baseline();
  test_seating_outlasts_the_contact_window();
  test_opening_has_no_pressure_phase();
  test_learned_window_withholds_an_endpoint();
  test_close_seat_without_tacho_plateau();
  test_endpoint_classifier();
  test_only_endpoint_records_position();
  test_circuit_fault_never_becomes_an_endpoint();
  std::printf("endpoint_logic + rev33_logic: all assertions passed\n");
  return 0;
}
