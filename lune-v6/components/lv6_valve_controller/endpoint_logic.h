#pragma once

#include <cstdint>

namespace lv6 {

// Host-testable stroke-phase + endpoint decision for the discrete GPIO-bridge
// motor path (Rev 3.3).  Keep this file free of ESP-IDF
// and free of board-revision names so detection is not coupled to a PCB spin.
//
// Closing a manifold valve is four mechanically distinct phases, and phases 2
// and 4 look nearly identical in the current domain - both are a rise under
// load. Telling them apart is the whole problem:
//
//   1 FREE_TRAVEL  the plunger has not reached the pin. Flat current, steady
//                  cadence.
//   2 CONTACT      pin contact. There is an initial resistance to overcome and
//                  then the resistance FALLS AGAIN. The motor slows and then
//                  RECOVERS.
//   3 UNDER_LOAD   pressing the pin down. Sustained, slowly rising resistance.
//   4 STOPPING     the pin is fully down. The motor slows and does NOT recover.
//                  Failing to find this phase is what pops the actuator head off.
//
// Opening mirrors it with no pressure phase: free travel back toward the
// housing, then the motor's own gear train bottoming out.
//
// CLOSING is the harder direction to detect, not opening. Instrumented
// measurements of this actuator give a flat 15-20 mA while opening with a clean
// ~5x step at the stop, against a closing current that the valve spring drives
// continuously from 15-20 mA up to ~90 mA, where the endstop adds only ~10 mA
// on top. So the two directions need different REFERENCES, not just different
// constants: opening measures against free travel, closing against a trailing
// window (see safety_limits.h TrailingStepDetector).
//
// An earlier revision claimed the opposite and accepted an opening endpoint with
// no current evidence at all, citing Rev 3.1 measurements taken at 70% PWM hold
// duty which are invalid for continuous drive. That is why classify_endpoint()
// now requires at least weak load evidence before an opening plateau counts.
//
// Cadence recovery discriminates phase 2 from phase 4 and is
// magnitude-independent - but on this actuator it cannot be relied on alone:
// at a hard stop the counter does NOT plateau, because brush arcing keeps
// producing edges (a measured trace showed the rate RISING to 88 Hz while the
// current said the rotor was stationary). Current-domain trips must therefore
// never be withheld pending a plateau.
enum class StrokePhase : uint8_t {
  FREE_TRAVEL,
  CONTACT,
  UNDER_LOAD,
  STOPPING,
};

struct StrokeConfig {
  // Current step above the free-travel baseline that marks pin contact. The
  // measured pin ramp is ~1 mA/s and the seat ramp ~2 mA/s, so this has to be
  // small enough to catch a slow ramp against a FROZEN baseline.
  float contact_step_ma{2.0f};
  // Commutations the cadence has to recover within for a current bump to read
  // as contact rather than a stop.
  uint16_t contact_recovery_ripples{15};
  // Gap-to-cadence ratio (x10) that counts as the motor slowing.
  uint16_t slowdown_x10{15};
  // ...and the ratio that counts as it stopping. This is a PRECURSOR to the
  // backend's debounced commutation plateau, never a substitute for it.
  uint16_t stopping_x10{30};
  // observe() runs on the 10 ms FSM tick against a 13 ms commutation period, so
  // a single noisy tick could otherwise latch contact_count_ at the wrong
  // commutation - and that count is the datum for the closing endpoint window.
  uint8_t contact_confirm_ticks{3};
};

// Tracks which phase a stroke is in. Pure state machine over (count, current,
// cadence) - no timing anchors, because position is measured in commutations,
// not milliseconds.
class StrokeTracker {
 public:
  explicit StrokeTracker(const StrokeConfig &cfg = {}) : cfg_(cfg) {}

  void set_config(const StrokeConfig &cfg) { cfg_ = cfg; }

  void reset(bool direction_is_open) {
    direction_is_open_ = direction_is_open;
    phase_ = StrokePhase::FREE_TRAVEL;
    baseline_ma_ = 0.0f;
    peak_ma_ = 0.0f;
    contact_count_ = 0;
    contact_seen_ = false;
    contact_recovered_ = false;
    contact_run_ = 0;
  }

  // `stretch_x10` is how far the current silence has stretched past the
  // established cadence (see TachoQualifier::stretch_x10). `count` is the
  // qualified commutation count. `baseline_ma` is the stroke's free-travel
  // reference, supplied by the caller.
  //
  // The baseline is INJECTED rather than tracked here. An internal EMA chased
  // the filtered current with roughly its own time constant, so any ramp slower
  // than ~15 mA/s never produced a step - and the measured pin and seat ramps
  // are 1-2 mA/s. On a real trace that left the tracker reporting UNDER_LOAD
  // from 250 ms through 12 s of genuine free travel, which silently broke pin
  // detection and left the seat cap's phase gate permanently open.
  void observe(uint32_t count, float current_ma, float baseline_ma,
               uint16_t stretch_x10) {
    baseline_ma_ = baseline_ma;
    if (baseline_ma <= 0.0f)
      return;  // no reference yet - nothing can be said about phase

    const bool stopping = stretch_x10 >= cfg_.stopping_x10;
    const bool slowing = stretch_x10 >= cfg_.slowdown_x10;
    const bool stepped = current_ma >= baseline_ma + cfg_.contact_step_ma;

    if (stopping) {
      phase_ = StrokePhase::STOPPING;
      contact_run_ = 0;
      return;
    }

    switch (phase_) {
      case StrokePhase::FREE_TRAVEL:
        // A current step alone is not contact; the motor has to feel it too,
        // and it has to still feel it a commutation later.
        if (stepped && slowing) {
          if (contact_run_ < 255)
            contact_run_++;
          if (contact_run_ >= cfg_.contact_confirm_ticks) {
            phase_ = StrokePhase::CONTACT;
            contact_count_ = count;
            contact_seen_ = true;
            peak_ma_ = current_ma;
            contact_run_ = 0;
          }
        } else {
          contact_run_ = 0;
        }
        break;

      case StrokePhase::CONTACT:
        peak_ma_ = current_ma > peak_ma_ ? current_ma : peak_ma_;
        if (count - contact_count_ > cfg_.contact_recovery_ripples) {
          // The bump outlasted the recovery window: this is real seating, not
          // the pin-contact transient.
          phase_ = StrokePhase::UNDER_LOAD;
        } else if (!stepped && !slowing) {
          // The resistance fell again and the motor picked its speed back up.
          // This is phase 2 completing, not an endpoint.
          contact_recovered_ = true;
          phase_ = StrokePhase::FREE_TRAVEL;
        }
        break;

      case StrokePhase::UNDER_LOAD:
        peak_ma_ = current_ma > peak_ma_ ? current_ma : peak_ma_;
        if (!stepped && !slowing) {
          // Load released without ever stopping - back to free travel.
          phase_ = StrokePhase::FREE_TRAVEL;
        }
        break;

      case StrokePhase::STOPPING:
        // Recovering from a stall means it was not one.
        if (!slowing)
          phase_ = contact_seen_ ? StrokePhase::UNDER_LOAD
                                 : StrokePhase::FREE_TRAVEL;
        break;
    }
  }

  // Pin contact proven by the current alone (PinOnsetDetector). On this
  // actuator the pin barely moves the cadence, so observe() can miss it and the
  // closing stroke stays in FREE_TRAVEL - where classify_endpoint() reads the
  // pin ramp as an obstruction (JAM) and the zone ends up BLOCKED. There is no
  // cadence transient to wait out, so it goes straight to pressing the pin.
  // `count` is the onset: the last commutation still at the free-travel level.
  void note_current_contact(uint32_t count, float current_ma) {
    if (direction_is_open_ || contact_seen_ || phase_ != StrokePhase::FREE_TRAVEL)
      return;
    phase_ = StrokePhase::UNDER_LOAD;
    contact_count_ = count;
    contact_seen_ = true;
    peak_ma_ = current_ma;
    contact_run_ = 0;
  }

  StrokePhase phase() const { return phase_; }
  bool direction_is_open() const { return direction_is_open_; }
  bool contact_seen() const { return contact_seen_; }
  bool contact_recovered() const { return contact_recovered_; }
  uint32_t contact_count() const { return contact_count_; }
  float baseline_ma() const { return baseline_ma_; }
  float peak_ma() const { return peak_ma_; }

 private:
  StrokeConfig cfg_;
  StrokePhase phase_{StrokePhase::FREE_TRAVEL};
  float baseline_ma_{0.0f};
  float peak_ma_{0.0f};
  uint32_t contact_count_{0};
  bool direction_is_open_{false};
  bool contact_seen_{false};
  bool contact_recovered_{false};
  uint8_t contact_run_{0};
};

enum class EndpointDecision : uint8_t {
  CONTINUE,
  ENDPOINT,
  JAM,
  OVERCURRENT,
  DISCONNECTED,
  TACHO_FAULT,
  BLOCKED_OR_UNKNOWN,
  /// The rotor stopped while drawing only free-travel current. A stalled DC
  /// motor has no back-EMF and must draw V/R, so this combination is physically
  /// impossible - it is instrument error, not a gentle endpoint. Stop the drive,
  /// record nothing, raise no fault.
  STOPPED_UNCONFIRMED,
};

struct EndpointEvidence {
  bool blanking_elapsed{false};
  bool current_present{false};
  // Current-domain detectors, or the magnitude-independent rotation-stall
  // plateau (itself load evidence for closing).
  bool load_evidence{false};
  /// A smaller current rise than a full trip - enough to prove the motor is
  /// working against something, not enough to be an endstop on its own.
  bool load_evidence_weak{false};
  bool current_over_cap{false};
  /// A board fault (short, two bridges energised). Never an endpoint, whatever
  /// the tacho says.
  bool current_over_circuit_fault{false};
  bool commutation_observed{false};
  bool commutation_plateau{false};
  bool endpoint_window{false};
  bool commanded_endpoint{false};
  StrokePhase phase{StrokePhase::FREE_TRAVEL};
  bool direction_is_open{false};
};

// The load-bearing pair is motion that has ceased while the motor is still
// drawing, plus a commanded endpoint window.  Current *rise* (threshold) is
// confirmation for closing; opening often has no useful current step, so a
// plateau (or STOPPING cadence) with current present is enough there.
// Commutation count alone must never declare an endpoint.
constexpr EndpointDecision classify_endpoint(const EndpointEvidence &e) {
  // A circuit fault outranks everything, including blanking: a short is a fault
  // from the first frame, and it must never be promoted to an endpoint.
  if (e.current_over_circuit_fault)
    return EndpointDecision::OVERCURRENT;

  if (!e.blanking_elapsed)
    return EndpointDecision::CONTINUE;

  // Nothing drawing and nothing turning: the actuator is not connected.
  if (!e.current_present && !e.commutation_observed)
    return EndpointDecision::DISCONNECTED;

  // The absolute cap trips regardless of what the tacho says, unless the tacho
  // has already qualified a stop - in which case it is a stall, classified
  // below on its merits.
  if (e.current_over_cap && !e.commutation_plateau)
    return EndpointDecision::OVERCURRENT;

  // Phase 2 (closing only): the motor is inside the pin-contact bump. Current
  // is elevated and the rotor has slowed, which is exactly what an endpoint
  // looks like - and at this instant the two are genuinely indistinguishable.
  // Wait for the window to resolve: the tracker leaves CONTACT either by
  // recovering (phase 2 was just the pin), by outlasting the window (real
  // seating, UNDER_LOAD), or by the rotor actually stopping (STOPPING). No
  // endpoint may be accepted while the question is still open.
  if (!e.direction_is_open && e.phase == StrokePhase::CONTACT)
    return EndpointDecision::CONTINUE;

  // Current with no commutation at all is ambiguous: a genuine already-at-stop
  // and a pre-existing obstruction are identical in two-wire signals.  Stop
  // early, report it, and do not record an endpoint.
  if (e.current_present && !e.commutation_observed)
    return EndpointDecision::BLOCKED_OR_UNKNOWN;

  // NOTE: an earlier revision accepted an opening endpoint here on STOPPING
  // cadence alone, ~60 ms before the debounced plateau and with no current
  // evidence at all. It was justified by Rev 3.1 70%-duty measurements showing a
  // "gentle" open stop - numbers the doc itself invalidates for continuous
  // drive, and no Rev 3.3 open stop has ever been measured. Instrumented data on
  // this actuator says the opposite: opening is a clean ~5x current step and
  // CLOSING is the direction with the weak signature. The branch is gone; the
  // plateau path below carries opening, and it now requires evidence.

  // VdMot Controller (Lenti84 motor.cpp): endstop is current above mean×factor
  // (or absolute seat/working cap). Commutation count is for position only —
  // brush chatter must not withhold a current-domain trip.
  // Closing: still require UNDER_LOAD/STOPPING so a mid-travel obstruction in
  // FREE_TRAVEL stays a jam, and CONTACT remains withheld (pin ≠ seat).
  if (e.load_evidence && e.current_present && e.commutation_observed &&
      e.commanded_endpoint && e.endpoint_window) {
    if (e.direction_is_open)
      return EndpointDecision::ENDPOINT;
    if (e.phase == StrokePhase::CONTACT)
      return EndpointDecision::CONTINUE;  // pin != seat
    // Closing under load before the plunger ever reached the pin is something
    // in the way. Previously this fell through to the plateau branch and, with
    // no plateau (brush chatter - the very reason this path exists), returned
    // CONTINUE: a mid-travel obstruction was invisible to the one path built to
    // see it.
    if (e.phase == StrokePhase::FREE_TRAVEL)
      return EndpointDecision::JAM;
    return EndpointDecision::ENDPOINT;  // UNDER_LOAD or STOPPING
  }

  // Commutation was seen and then stopped.
  if (e.commutation_observed && e.commutation_plateau) {
    if (!e.current_present)
      return EndpointDecision::TACHO_FAULT;

    // Opening: a plateau in a commanded window is the gear train bottoming out -
    // but only if the current agrees. A stalled rotor draws V/R; "stopped at
    // free-travel current" is a tacho fault or brush chatter, not a stop, and
    // accepting it would record a fictional 100% position.
    if (e.direction_is_open) {
      if (!e.commanded_endpoint || !e.endpoint_window)
        return EndpointDecision::JAM;
      if (e.load_evidence || e.load_evidence_weak)
        return EndpointDecision::ENDPOINT;
      return EndpointDecision::STOPPED_UNCONFIRMED;
    }

    if (!e.load_evidence)
      return EndpointDecision::CONTINUE;
    // Closing: stopping under load before the plunger ever reached the pin is
    // something in the way, not the valve seat. The seat is only reachable
    // through phases 2 and 3.
    if (e.phase == StrokePhase::FREE_TRAVEL)
      return EndpointDecision::JAM;
    if (e.commanded_endpoint && e.endpoint_window)
      return EndpointDecision::ENDPOINT;
    return EndpointDecision::JAM;
  }

  // Turning but drawing nothing measurable is a current-sense fault, not
  // proof of anything about the endpoint.
  if (e.commutation_observed && !e.current_present)
    return EndpointDecision::TACHO_FAULT;

  return EndpointDecision::CONTINUE;
}

// Only ENDPOINT may update the stored position.  A timeout must not.
constexpr bool endpoint_decision_records_position(EndpointDecision decision) {
  return decision == EndpointDecision::ENDPOINT;
}

constexpr bool endpoint_decision_stops_drive(EndpointDecision decision) {
  return decision != EndpointDecision::CONTINUE;
}

}  // namespace lv6
