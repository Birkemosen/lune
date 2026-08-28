#pragma once

#include <cstdint>

namespace lv6 {

// Pure, host-testable contract for the Rev 3.2 one-hot decoder, its per-move
// fault latch and the commutation-tacho endpoint decision.  Keep this file free
// of ESP-IDF so the safety invariants can be exercised in CI.
//
// Rev 3.2 differs from Rev 3.1 in three ways that matter here:
//
//   1. All four address lines are plain address bits.  No bit encodes
//      direction, so the channel/direction pair maps to a decoder output
//      through a twelve-entry table rather than a formula.  See
//      decoder.address_bit0_rationale in design-contract.json.
//   2. The runtime cutoff is referenced to LATCH_STATE rather than to decoder
//      inhibit, so it bounds total armed time.  The latch is armed per move.
//   3. The BEMF mux is gone.  Motion evidence comes from COMM_TACHO_N, a
//      digital comparator output counted continuously while driving.
enum class Rev32Direction : uint8_t { FORWARD = 0, REVERSE = 1 };

inline constexpr uint8_t REV32_CHANNEL_COUNT = 6;
inline constexpr uint8_t REV32_ADDRESS_INVALID = 0xFFu;

// decoder.channel_address_map, indexed by channel - 1.  Addresses 0-3 are
// unreachable by design: Q0-Q3 reach no bridge input.
inline constexpr uint8_t REV32_FORWARD_ADDRESS[REV32_CHANNEL_COUNT] = {
    7u, 4u, 13u, 14u, 9u, 10u};
inline constexpr uint8_t REV32_REVERSE_ADDRESS[REV32_CHANNEL_COUNT] = {
    6u, 5u, 12u, 15u, 8u, 11u};

constexpr bool rev32_valid_channel_index(uint8_t index) {
  return index < REV32_CHANNEL_COUNT;
}

// index is 0-based; channel 1 in the contract is index 0 here, matching the
// zone numbering the rest of the controller uses.
constexpr uint8_t rev32_decoder_address(uint8_t index, Rev32Direction direction) {
  return rev32_valid_channel_index(index)
             ? (direction == Rev32Direction::REVERSE ? REV32_REVERSE_ADDRESS[index]
                                                     : REV32_FORWARD_ADDRESS[index])
             : REV32_ADDRESS_INVALID;
}

constexpr bool rev32_address_is_reachable(uint8_t address) {
  return address >= 4u && address <= 15u;
}

// Selection state machine.  The address may only change while the decoder is
// inhibited, and drive is refused while the latch reports faulted or unarmed.
struct Rev32DecoderSelection {
  uint8_t index{0};
  Rev32Direction direction{Rev32Direction::FORWARD};
  bool enabled{false};
  bool armed{false};

  constexpr uint8_t decoder_address() const {
    return rev32_decoder_address(index, direction);
  }

  bool select(uint8_t new_index, Rev32Direction new_direction) {
    if (enabled || !rev32_valid_channel_index(new_index))
      return false;
    index = new_index;
    direction = new_direction;
    return true;
  }

  bool enable() {
    if (!armed || !rev32_valid_channel_index(index))
      return false;
    enabled = true;
    return true;
  }

  void coast() { enabled = false; }

  // The latch may only be armed from coast.  An arm attempt that finds the raw
  // fault still asserted leaves the selection unarmed; firmware cannot clear a
  // hardware fault, so this is the only recovery path there is.
  bool arm(bool latch_state_high) {
    if (enabled)
      return false;
    armed = !latch_state_high;
    return armed;
  }

  // LATCH_STATE going high mid-move is a fault.  Going high while idle is the
  // runtime cutoff self-disarming, which is normal; the caller distinguishes
  // the two by whether a move was in progress.
  void observe_latch(bool latch_state_high) {
    if (!latch_state_high)
      return;
    armed = false;
    enabled = false;
  }
};

// Commutation edges are qualified on width and period before they count.  The
// analog band-pass rejects the 50 kHz chopper; this is the cheap second line
// against the ~20 us pulses that survive it.
class Rev32TachoQualifier {
 public:
  Rev32TachoQualifier(uint16_t min_pulse_us = 200, uint32_t min_period_us = 8000,
                      uint32_t max_period_us = 200000)
      : min_pulse_us_(min_pulse_us),
        min_period_us_(min_period_us),
        max_period_us_(max_period_us) {}

  void reset(uint32_t drive_start_ms) {
    count_ = 0;
    rejected_ = 0;
    last_edge_us_ = 0;
    have_edge_ = false;
    drive_start_ms_ = drive_start_ms;
    last_count_change_ms_ = drive_start_ms;
    have_hw_count_ = false;
    hw_count_ = 0;
    cadence_us_ = 0;
    credited_advances_ = 0;
  }

  bool blanked(uint32_t now_ms) const {
    return (now_ms - drive_start_ms_) < BLANKING_MS;
  }

  // Returns true when the edge was counted.
  bool observe_edge(uint32_t edge_us, uint16_t pulse_width_us, uint32_t now_ms) {
    if (blanked(now_ms) || pulse_width_us < min_pulse_us_) {
      ++rejected_;
      return false;
    }
    if (have_edge_) {
      const uint32_t period = edge_us - last_edge_us_;
      if (period < min_period_us_ || period > max_period_us_) {
        ++rejected_;
        return false;
      }
      last_period_us_ = period;
      note_period_(period);
    }
    last_edge_us_ = edge_us;
    have_edge_ = true;
    ++count_;
    last_count_change_ms_ = now_ms;
    return true;
  }

  // Hardware-counter path.  A PCNT unit yields a monotonic count, not per-edge
  // widths, so the only qualification available here is the implied cadence: a
  // delta that implies a period below the commutation band is a burst of
  // chopper artefacts or a missed poll, and is recorded as rejected rather than
  // credited to travel.  Too-slow is not rejected - a single edge after a long
  // gap is exactly what leaving a plateau looks like.  Returns the number of
  // edges credited.
  uint32_t observe_count(uint32_t hardware_count, uint32_t now_ms) {
    if (!have_hw_count_) {
      hw_count_ = hardware_count;
      have_hw_count_ = true;
      return 0;
    }
    const uint32_t delta = hardware_count - hw_count_;
    hw_count_ = hardware_count;
    if (delta == 0)
      return 0;
    if (blanked(now_ms)) {
      rejected_ += delta;
      return 0;
    }
    const uint32_t elapsed_ms = now_ms - last_count_change_ms_;
    const uint32_t implied_us =
        elapsed_ms == 0 ? 0u : (elapsed_ms * 1000u) / delta;
    if (implied_us < min_period_us_) {
      rejected_ += delta;
      return 0;
    }
    last_period_us_ = implied_us;
    note_period_(implied_us);
    count_ += delta;
    last_count_change_ms_ = now_ms;
    return delta;
  }

  // Adopt a new hardware baseline without crediting or rejecting the delta.
  // Used when the bridge was off across the polling interval: edges there
  // cannot be commutation of the selected motor, but they are not evidence of
  // noise either, so they must not inflate the rejection rate that the
  // qualification plan measures.
  void rebase_count(uint32_t hardware_count) {
    hw_count_ = hardware_count;
    have_hw_count_ = true;
  }

  // A plateau is the absence of qualified edges for the debounce interval,
  // which is only meaningful once edges have been seen at all.
  bool plateau_for(uint32_t now_ms, uint32_t debounce_ms) const {
    return count_ > 0 && (now_ms - last_count_change_ms_) >= debounce_ms;
  }

  uint32_t count() const { return count_; }
  uint32_t rejected() const { return rejected_; }
  uint32_t last_period_us() const { return last_period_us_; }
  bool any_edges() const { return count_ > 0; }

  // Smoothed commutation period. 0 until the motor has actually established a
  // rate, which is the honest answer for "how fast is it turning" before then.
  uint32_t cadence_us() const { return cadence_us_; }

  // How long silence has to last before it counts as a stall, scaled to how
  // fast this motor is actually turning. A fixed debounce has to be sized for
  // the slowest case, which on this actuator means waiting out 15-30 missed
  // commutations; scaling it keeps the same confidence at a quarter of the
  // latency. With no cadence yet there is nothing to scale, so the ceiling
  // stands - that is the conservative answer, not a guess.
  uint32_t adaptive_plateau_ms(uint16_t factor_x10, uint32_t floor_ms,
                               uint32_t ceiling_ms) const {
    if (cadence_us_ == 0 || factor_x10 == 0)
      return ceiling_ms;
    const uint32_t scaled = (cadence_us_ / 1000u) * factor_x10 / 10u;
    if (scaled < floor_ms)
      return floor_ms;
    return scaled > ceiling_ms ? ceiling_ms : scaled;
  }

  // How far the current gap has stretched past the established cadence, x10.
  // 0 when there is no cadence to compare against. This is the deceleration
  // signal: it rises continuously as the motor slows, without waiting for the
  // edge that would terminate the period.
  uint16_t stretch_x10(uint32_t now_ms) const {
    if (cadence_us_ == 0)
      return 0;
    const uint64_t gap_us = static_cast<uint64_t>(now_ms - last_count_change_ms_) * 1000u;
    const uint64_t ratio = gap_us * 10u / cadence_us_;
    return ratio > 0xFFFFu ? 0xFFFFu : static_cast<uint16_t>(ratio);
  }

  // The AC-coupled front end settles in about 100 ms; 250 ms sits inside the
  // existing startup guard and at the already-at-stop decision point.
  static constexpr uint32_t BLANKING_MS = 250;

 private:
  // The first credited advance after reset() spans from drive start, so it
  // carries the whole blanking window and would set the cadence to ~250 ms.
  // Take it as the origin and start measuring from the second one.
  void note_period_(uint32_t period_us) {
    if (++credited_advances_ < 2)
      return;
    cadence_us_ = cadence_us_ == 0 ? period_us
                                   : (cadence_us_ * 3u + period_us) / 4u;
  }

  uint16_t min_pulse_us_;
  uint32_t min_period_us_;
  uint32_t max_period_us_;
  uint32_t count_{0};
  uint32_t rejected_{0};
  uint32_t last_edge_us_{0};
  uint32_t last_period_us_{0};
  uint32_t drive_start_ms_{0};
  uint32_t last_count_change_ms_{0};
  uint32_t hw_count_{0};
  uint32_t cadence_us_{0};
  uint32_t credited_advances_{0};
  bool have_edge_{false};
  bool have_hw_count_{false};
};

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
// housing, then the motor's own gear train bottoming out. That stop is a
// materially SMALLER resistance than the closing hard stop, which is why the
// opening endpoint cannot reuse the closing current threshold - and why the
// contract names opening as the damaging direction.
//
// Cadence recovery is the discriminator, and it is magnitude-independent, so it
// works equally well on the gentle opening stop where the current barely moves.
enum class Rev32StrokePhase : uint8_t {
  FREE_TRAVEL,
  CONTACT,
  UNDER_LOAD,
  STOPPING,
};

struct Rev32StrokeConfig {
  // Current step above the free-travel baseline that marks pin contact.
  float contact_step_ma{3.0f};
  // Commutations the cadence has to recover within for a current bump to read
  // as contact rather than a stop.
  uint16_t contact_recovery_ripples{15};
  // Gap-to-cadence ratio (x10) that counts as the motor slowing.
  uint16_t slowdown_x10{15};
  // ...and the ratio that counts as it stopping.
  uint16_t stall_x10{30};
};

// Tracks which phase a stroke is in. Pure state machine over (count, current,
// cadence) - no timing anchors, because on Rev 3.2 position is measured in
// commutations, not milliseconds.
class Rev32StrokeTracker {
 public:
  explicit Rev32StrokeTracker(const Rev32StrokeConfig &cfg = {}) : cfg_(cfg) {}

  void reset(bool direction_is_open) {
    direction_is_open_ = direction_is_open;
    phase_ = Rev32StrokePhase::FREE_TRAVEL;
    baseline_ma_ = 0.0f;
    have_baseline_ = false;
    peak_ma_ = 0.0f;
    contact_count_ = 0;
    contact_seen_ = false;
    contact_recovered_ = false;
  }

  // `stretch_x10` is Rev32TachoQualifier::stretch_x10(): how far the current
  // silence has stretched past the established cadence. `count` is the
  // qualified commutation count.
  void observe(uint32_t count, float current_ma, uint16_t stretch_x10) {
    if (!have_baseline_) {
      // The first settled reading of free travel is the reference everything
      // else is measured against.
      baseline_ma_ = current_ma;
      have_baseline_ = true;
      return;
    }

    const bool stopping = stretch_x10 >= cfg_.stall_x10;
    const bool slowing = stretch_x10 >= cfg_.slowdown_x10;
    const bool stepped = current_ma >= baseline_ma_ + cfg_.contact_step_ma;

    if (stopping) {
      phase_ = Rev32StrokePhase::STOPPING;
      return;
    }

    switch (phase_) {
      case Rev32StrokePhase::FREE_TRAVEL:
        // A current step alone is not contact; the motor has to feel it too.
        if (stepped && slowing) {
          phase_ = Rev32StrokePhase::CONTACT;
          contact_count_ = count;
          contact_seen_ = true;
          peak_ma_ = current_ma;
        } else if (!stepped) {
          // Track the free-travel level so a drifting baseline does not make
          // the step test progressively easier.
          baseline_ma_ = baseline_ma_ * 0.95f + current_ma * 0.05f;
        }
        break;

      case Rev32StrokePhase::CONTACT:
        peak_ma_ = current_ma > peak_ma_ ? current_ma : peak_ma_;
        if (count - contact_count_ > cfg_.contact_recovery_ripples) {
          // The bump outlasted the recovery window: this is real seating, not
          // the pin-contact transient.
          phase_ = Rev32StrokePhase::UNDER_LOAD;
        } else if (!stepped && !slowing) {
          // The resistance fell again and the motor picked its speed back up.
          // This is phase 2 completing, not an endpoint.
          contact_recovered_ = true;
          phase_ = Rev32StrokePhase::FREE_TRAVEL;
          baseline_ma_ = current_ma;
        }
        break;

      case Rev32StrokePhase::UNDER_LOAD:
        peak_ma_ = current_ma > peak_ma_ ? current_ma : peak_ma_;
        if (!stepped && !slowing) {
          // Load released without ever stopping - back to free travel.
          phase_ = Rev32StrokePhase::FREE_TRAVEL;
          baseline_ma_ = current_ma;
        }
        break;

      case Rev32StrokePhase::STOPPING:
        // Recovering from a stall means it was not one.
        if (!slowing)
          phase_ = contact_seen_ ? Rev32StrokePhase::UNDER_LOAD
                                 : Rev32StrokePhase::FREE_TRAVEL;
        break;
    }
  }

  Rev32StrokePhase phase() const { return phase_; }
  bool direction_is_open() const { return direction_is_open_; }
  bool contact_seen() const { return contact_seen_; }
  bool contact_recovered() const { return contact_recovered_; }
  uint32_t contact_count() const { return contact_count_; }
  float baseline_ma() const { return baseline_ma_; }
  float peak_ma() const { return peak_ma_; }

 private:
  Rev32StrokeConfig cfg_;
  Rev32StrokePhase phase_{Rev32StrokePhase::FREE_TRAVEL};
  float baseline_ma_{0.0f};
  float peak_ma_{0.0f};
  uint32_t contact_count_{0};
  bool direction_is_open_{false};
  bool have_baseline_{false};
  bool contact_seen_{false};
  bool contact_recovered_{false};
};

enum class Rev32EndpointDecision : uint8_t {
  CONTINUE,
  ENDPOINT,
  JAM,
  OVERCURRENT,
  DISCONNECTED,
  TACHO_FAULT,
  BLOCKED_OR_UNKNOWN,
};

struct Rev32EndpointEvidence {
  bool blanking_elapsed{false};
  bool current_present{false};
  // Point 5 of the endpoint list: "current/load evidence".  Any of the
  // current-domain detectors, or the magnitude-independent rotation-stall
  // plateau, which is itself load evidence.
  bool load_evidence{false};
  bool current_over_cap{false};
  bool commutation_observed{false};
  bool commutation_plateau{false};
  bool endpoint_window{false};
  bool commanded_endpoint{false};
  // Where in the stroke this is happening. See Rev32StrokePhase.
  Rev32StrokePhase phase{Rev32StrokePhase::FREE_TRAVEL};
  bool direction_is_open{false};
};

// The load-bearing pair is the DC current step and the runtime limit.  The
// commutation count is an enhancement and must never be the sole reason to
// declare an endpoint, so every ENDPOINT path below also requires current
// evidence and a commanded endpoint context.
constexpr Rev32EndpointDecision classify_rev32_endpoint(
    const Rev32EndpointEvidence &e) {
  if (!e.blanking_elapsed)
    return Rev32EndpointDecision::CONTINUE;

  // Nothing drawing and nothing turning: the actuator is not connected.
  if (!e.current_present && !e.commutation_observed)
    return Rev32EndpointDecision::DISCONNECTED;

  // The absolute cap trips regardless of what the tacho says, unless the tacho
  // has already qualified a stop - in which case it is a stall, classified
  // below on its merits.
  if (e.current_over_cap && !e.commutation_plateau)
    return Rev32EndpointDecision::OVERCURRENT;

  // Phase 2: the motor is inside the pin-contact bump. Current is elevated and
  // the rotor has slowed, which is exactly what an endpoint looks like - and at
  // this instant the two are genuinely indistinguishable. Wait for the window
  // to resolve: the tracker leaves CONTACT either by recovering (phase 2 was
  // just the pin), by outlasting the window (real seating, UNDER_LOAD), or by
  // the rotor actually stopping (STOPPING). No endpoint may be accepted while
  // the question is still open, however strong the load evidence is.
  if (e.phase == Rev32StrokePhase::CONTACT)
    return Rev32EndpointDecision::CONTINUE;

  // Current with no commutation at all is ambiguous: a genuine already-at-stop
  // and a pre-existing obstruction are identical in two-wire signals.  Stop
  // early, report it, and do not record an endpoint.
  if (e.current_present && !e.commutation_observed)
    return Rev32EndpointDecision::BLOCKED_OR_UNKNOWN;

  // Commutation was seen and then stopped.
  if (e.commutation_observed && e.commutation_plateau) {
    if (!e.current_present)
      return Rev32EndpointDecision::TACHO_FAULT;
    if (!e.load_evidence)
      return Rev32EndpointDecision::CONTINUE;
    // Closing: stopping under load before the plunger ever reached the pin is
    // something in the way, not the valve seat. The seat is only reachable
    // through phases 2 and 3. Opening has no contact phase - the gear-train
    // stop is reached straight out of free travel - so this rule is closing
    // only.
    if (!e.direction_is_open && e.phase == Rev32StrokePhase::FREE_TRAVEL)
      return Rev32EndpointDecision::JAM;
    if (e.commanded_endpoint && e.endpoint_window)
      return Rev32EndpointDecision::ENDPOINT;
    return Rev32EndpointDecision::JAM;
  }

  // Turning but drawing nothing measurable is a current-sense fault, not
  // proof of anything about the endpoint.
  if (e.commutation_observed && !e.current_present)
    return Rev32EndpointDecision::TACHO_FAULT;

  return Rev32EndpointDecision::CONTINUE;
}

// Only ENDPOINT may update the stored position.  A timeout must not.
constexpr bool rev32_decision_records_endpoint(Rev32EndpointDecision decision) {
  return decision == Rev32EndpointDecision::ENDPOINT;
}

constexpr bool rev32_decision_stops_drive(Rev32EndpointDecision decision) {
  return decision != Rev32EndpointDecision::CONTINUE;
}

}  // namespace lv6
