#pragma once

#include <cstdint>

// Mechanical-protection primitives for the GPIO-bridge motor path.
//
// Everything here is pure: no ESP-IDF, no board-revision names, no floats that
// depend on a particular PCB spin.  Two independent guarantees live here and
// neither depends on endstop *detection* working at all:
//
//   1. compute_move_ceiling() - how far a move may run before it is cut, in
//      BOTH commutation counts and milliseconds.  Counts are the mechanically
//      meaningful currency (the plunger's extension follows commutations, not
//      seconds); milliseconds cover the case where the tacho dies and counts
//      stop advancing.  Whichever is reached first wins.
//
//   2. evaluate_cap_ladder() - a severity-ordered set of absolute current caps
//      evaluated on the DMA frame path, so a rigid stop is taken off drive in
//      ~13 ms rather than ~50 ms.  Torque x duration is the damage mechanism.
//
// Field note that shapes both: during a stall this actuator's commutation
// counter does not stop - brush arcing keeps it advancing at full rate, and a
// measured trace showed it *rising* while the rotor was provably stationary.
// Count inflation therefore makes the count ceiling fire EARLY, which is
// fail-safe.  Under-counting (weak signal) is the dangerous direction, and the
// millisecond ceiling is what covers it.

namespace lv6 {

// ---------------------------------------------------------------------------
// Small helpers - kept local so this header pulls in nothing.
// ---------------------------------------------------------------------------

constexpr uint32_t sl_min_u32(uint32_t a, uint32_t b) { return a < b ? a : b; }
constexpr uint32_t sl_max_u32(uint32_t a, uint32_t b) { return a > b ? a : b; }
constexpr float sl_min_f(float a, float b) { return a < b ? a : b; }
constexpr float sl_max_f(float a, float b) { return a > b ? a : b; }
constexpr float sl_clamp_f(float v, float lo, float hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}
constexpr uint32_t sl_clamp_u32(uint32_t v, uint32_t lo, uint32_t hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

// ---------------------------------------------------------------------------
// Current thresholds - expressed as a fraction of the measured stall span.
// ---------------------------------------------------------------------------

// trip = I_free + k * (I_stall - I_free)
//
// Deliberately NOT `baseline * factor`.  Our sense is a high-side shunt on the
// whole motor rail, so every reading carries a fixed offset O from the driver
// quiescent current.  A ratio is not offset-immune; a fraction of the span is,
// because (O + I_stall) - (O + I_free) == I_stall - I_free exactly.  That also
// makes the same k valid across drive voltages, sense topologies and individual
// actuators, which is what lets one constant serve hardware we have not
// characterised yet.
//
// A k >= 1.0 is nonsensical by construction (it would sit at or above stall and
// could never trip), so the clamp below cannot silently disable detection the
// way a corrupted multiplicative factor can.
constexpr float current_trip_ma(float i_free_ma, float i_stall_ma, float k,
                                float floor_ma, float ceiling_ma) {
  const float span = i_stall_ma - i_free_ma;
  const float raw = span > 0.0f ? i_free_ma + k * span : floor_ma;
  return sl_clamp_f(raw, floor_ma, ceiling_ma);
}

// ---------------------------------------------------------------------------
// Per-move runtime ceiling
// ---------------------------------------------------------------------------

enum class CeilingSource : uint8_t {
  LEARNED,      ///< derived from this zone's learned stroke
  BOOTSTRAP,    ///< no learned stroke yet; the direction's hard ceiling
  USER_MAX,     ///< operator-configured max_runtime clamped it
  TIMED,        ///< a timed (Motor Lab) duration clamped it
  FLOOR,        ///< the computed value was below the minimum viable move
};

struct MoveCeilingInputs {
  bool direction_is_open{false};
  bool calibrating{false};
  bool drive_to_endstop{false};
  /// Position tracking is only trusted after a confirmed endpoint.  When false
  /// `remaining_fraction` is ignored and a full stroke is assumed, so travel
  /// scaling can only ever TIGHTEN the window, never widen it on stale data.
  bool position_confident{false};

  uint32_t learned_stroke_ms{0};      ///< this direction; 0 == uncalibrated
  uint32_t learned_stroke_counts{0};  ///< this direction; 0 == uncalibrated
  float remaining_fraction{1.0f};     ///< 0..1
  uint32_t timed_duration_ms{0};      ///< 0 == not a timed move

  // --- policy (from MotorConfig) ---
  uint32_t bootstrap_ms{0};
  uint32_t bootstrap_counts{0};
  uint32_t overrun_budget_ms{0};
  uint32_t overrun_budget_counts{0};
  uint8_t stroke_uncertainty_pct{20};
  uint32_t runtime_floor_ms{2000};
  uint32_t user_max_runtime_ms{0};  ///< 0 == no operator limit
};

struct MoveCeiling {
  uint32_t limit_ms{0};
  uint32_t limit_counts{0};  ///< 0 == no count limit available (tacho disabled)
  CeilingSource source{CeilingSource::BOOTSTRAP};
  /// A normal drive-to-endstop move on a zone that has never been calibrated.
  /// Ordinary operation must not be the thing that discovers the stroke length,
  /// so the caller refuses the move and queues calibration instead.
  bool requires_calibration{false};
};

constexpr MoveCeiling compute_move_ceiling(const MoveCeilingInputs &in) {
  MoveCeiling out{};

  const bool have_stroke = in.learned_stroke_ms > 0;
  out.requires_calibration =
      !have_stroke && in.drive_to_endstop && !in.calibrating;

  const float frac =
      in.position_confident ? sl_clamp_f(in.remaining_fraction, 0.0f, 1.0f) : 1.0f;
  const float unc = 1.0f + static_cast<float>(in.stroke_uncertainty_pct) / 100.0f;

  // --- milliseconds ---
  uint32_t ms = 0;
  if (have_stroke) {
    ms = static_cast<uint32_t>(static_cast<float>(in.learned_stroke_ms) * frac * unc) +
         in.overrun_budget_ms;
    out.source = CeilingSource::LEARNED;
  } else {
    ms = in.bootstrap_ms;
    out.source = CeilingSource::BOOTSTRAP;
  }

  // The direction's bootstrap value is also the absolute hard ceiling: a
  // learned stroke may tighten the window but must never be able to widen it
  // past the mechanical limit.
  if (ms > in.bootstrap_ms) {
    ms = in.bootstrap_ms;
    out.source = CeilingSource::BOOTSTRAP;
  }
  if (in.user_max_runtime_ms > 0 && ms > in.user_max_runtime_ms) {
    ms = in.user_max_runtime_ms;
    out.source = CeilingSource::USER_MAX;
  }
  if (in.timed_duration_ms > 0 && ms > in.timed_duration_ms) {
    ms = in.timed_duration_ms;
    out.source = CeilingSource::TIMED;
  }
  if (ms < in.runtime_floor_ms) {
    ms = in.runtime_floor_ms;
    out.source = CeilingSource::FLOOR;
  }
  out.limit_ms = ms;

  // --- counts ---
  uint32_t counts = 0;
  if (in.learned_stroke_counts > 0) {
    counts = static_cast<uint32_t>(
                 static_cast<float>(in.learned_stroke_counts) * frac * unc) +
             in.overrun_budget_counts;
  } else {
    counts = in.bootstrap_counts;
  }
  if (in.bootstrap_counts > 0 && counts > in.bootstrap_counts)
    counts = in.bootstrap_counts;
  out.limit_counts = counts;

  return out;
}

// ---------------------------------------------------------------------------
// Absolute current-cap ladder (evaluated per DMA frame)
// ---------------------------------------------------------------------------

/// Ordered by severity - a higher value always wins when two rungs trip in the
/// same frame, so a circuit fault can never be masked by a seat trip.
enum class FastTrip : uint8_t {
  NONE = 0,
  CLOSE_SEAT,     ///< endpoint: the valve is seated
  OPEN_STOP,      ///< endpoint: the gear train has bottomed out
  CLOSE_POPOFF,   ///< ungated close backstop: full-torque press into something rigid
  STALL_CAP,      ///< rotor is stalled; classify on the tacho's merits
  CIRCUIT_FAULT,  ///< never an endpoint - wiring/driver fault
};

struct CapLadder {
  float seat_ma{34.0f};     ///< endpoint, gated to a seated stroke phase
  float popoff_ma{36.0f};   ///< ungated close backstop
  float stall_ma{65.0f};    ///< rotor stalled; above the 57-59 mA open breakaway
  float circuit_ma{85.0f};  ///< board fault, evaluated on the frame PEAK
  float open_stop_ma{40.0f};///< endpoint, armed only past breakaway

  uint8_t seat_frames{4};
  uint8_t popoff_frames{2};
  uint8_t stall_frames{3};
  uint8_t circuit_frames{2};
  uint8_t open_frames{3};

  /// A frame straddling drive-start can carry very few valid samples and
  /// produce a meaningless mean.  Peak-based rungs are unaffected.
  uint16_t min_valid_samples{16};
};

struct CapContext {
  bool direction_is_open{false};
  bool past_blanking{false};
  /// Stroke tracker reports UNDER_LOAD or STOPPING - only then may the seat cap
  /// be an endpoint, so pin contact cannot trip it.
  bool seat_phase{false};
  /// Open cap arms only once the free-travel baseline has settled, i.e. past
  /// the breakaway transient (measured at 57-59 mA for ~4 s on this actuator).
  bool open_cap_armed{false};
};

struct FrameStats {
  float mean_ma{0.0f};
  float peak_ma{0.0f};
  uint16_t valid_samples{0};
};

struct CapCounters {
  uint8_t seat{0};
  uint8_t popoff{0};
  uint8_t stall{0};
  uint8_t circuit{0};
  uint8_t open{0};
};

namespace detail {
/// Advance `c` if `hit`, else reset it; return true once it reaches `need`.
constexpr bool cap_step(uint8_t &c, bool hit, uint8_t need) {
  if (!hit) {
    c = 0;
    return false;
  }
  if (c < 255)
    c++;
  return c >= need && need > 0;
}
}  // namespace detail

/// Evaluate one DMA frame against the ladder.  `counters` is per-move state,
/// mutated in place.  Returns the highest-severity rung that tripped.
constexpr FastTrip evaluate_cap_ladder(const CapLadder &cfg, const CapContext &ctx,
                                       const FrameStats &f, CapCounters &counters) {
  FastTrip worst = FastTrip::NONE;

  // Peak-based, and deliberately NOT gated on blanking: a short or a
  // double-energised bridge is a fault from the first frame.
  if (detail::cap_step(counters.circuit, f.peak_ma > cfg.circuit_ma, cfg.circuit_frames))
    worst = FastTrip::CIRCUIT_FAULT;

  const bool mean_usable = f.valid_samples >= cfg.min_valid_samples && ctx.past_blanking;
  if (!mean_usable) {
    counters.stall = 0;
    counters.popoff = 0;
    counters.seat = 0;
    counters.open = 0;
    return worst;
  }

  if (detail::cap_step(counters.stall, f.mean_ma > cfg.stall_ma, cfg.stall_frames))
    if (worst < FastTrip::STALL_CAP)
      worst = FastTrip::STALL_CAP;

  if (!ctx.direction_is_open) {
    if (detail::cap_step(counters.popoff, f.mean_ma > cfg.popoff_ma, cfg.popoff_frames))
      if (worst < FastTrip::CLOSE_POPOFF)
        worst = FastTrip::CLOSE_POPOFF;
    if (detail::cap_step(counters.seat, ctx.seat_phase && f.mean_ma > cfg.seat_ma,
                         cfg.seat_frames))
      if (worst < FastTrip::CLOSE_SEAT)
        worst = FastTrip::CLOSE_SEAT;
    counters.open = 0;
  } else {
    if (detail::cap_step(counters.open, ctx.open_cap_armed && f.mean_ma > cfg.open_stop_ma,
                         cfg.open_frames))
      if (worst < FastTrip::OPEN_STOP)
        worst = FastTrip::OPEN_STOP;
    counters.popoff = 0;
    counters.seat = 0;
  }

  return worst;
}

// ---------------------------------------------------------------------------
// Closing endstop: a trailing step, not a level
// ---------------------------------------------------------------------------
//
// Measured closing has no flat baseline - the valve spring drives the current
// up continuously over the whole stroke and the endstop adds only ~10% on top -
// so any free-travel reference trips mid-travel.  What separates them is the
// rise RATE: the pressure plateau runs at ~0.06 mA/s against ~2 mA/s at the
// stop, a 30x margin.
//
// Expressed as a step over a trailing window rather than a derivative, so it
// needs no differentiation of a noisy signal.  A constant sense offset
// differences away, exactly as in current_trip_ma().
//
// Sustain is the discriminator, not magnitude.  On the measured trace the
// pin-contact ramp produces ONE isolated 3.5 mA/2 s sample while the endstop
// ramp holds 3.6-4.6 mA/2 s continuously, so a short debounce false-fires on
// the pin and a sustained one does not.
struct TrailingStepConfig {
  uint32_t window_ms{2000};
  float step_ma{2.5f};
  uint32_t sustain_ms{1000};
};

class TrailingStepDetector {
 public:
  static constexpr uint8_t HISTORY = 48;

  explicit TrailingStepDetector(const TrailingStepConfig &cfg = {}) : cfg_(cfg) {}
  void set_config(const TrailingStepConfig &cfg) { cfg_ = cfg; }

  void reset() {
    n_ = 0;
    head_ = 0;
    run_ms_ = 0;
    last_ms_ = 0;
    last_store_ms_ = 0;
    tripped_ = false;
  }

  /// History is decimated so HISTORY slots always span two windows. It used to
  /// store every observation: at the FSM's 10 ms tick 48 slots reach back only
  /// 470 ms, no sample was ever `window_ms` old, and the detector could never
  /// trip on the device. Replaying 500 ms fixture rows hid that completely.
  static constexpr uint32_t store_interval_ms(uint32_t window_ms) {
    const uint32_t v = window_ms / (HISTORY / 2);
    return v > 0 ? v : 1;
  }

  void observe(uint32_t now_ms, float current_ma) {
    bool have_ref = false;
    float ref = 0.0f;
    for (uint8_t k = 0; k < n_; k++) {
      const uint8_t idx = static_cast<uint8_t>((head_ + HISTORY - 1 - k) % HISTORY);
      if (now_ms - t_[idx] >= cfg_.window_ms) {
        ref = v_[idx];
        have_ref = true;
        break;
      }
    }
    const uint32_t dt = last_ms_ == 0 ? 0 : now_ms - last_ms_;
    last_ms_ = now_ms;

    if (have_ref && (current_ma - ref) > cfg_.step_ma) {
      run_ms_ += dt;
      if (run_ms_ >= cfg_.sustain_ms)
        tripped_ = true;
    } else {
      run_ms_ = 0;
    }

    if (n_ == 0 || now_ms - last_store_ms_ >= store_interval_ms(cfg_.window_ms)) {
      last_store_ms_ = now_ms;
      t_[head_] = now_ms;
      v_[head_] = current_ma;
      head_ = static_cast<uint8_t>((head_ + 1) % HISTORY);
      if (n_ < HISTORY)
        n_++;
    }
  }

  bool tripped() const { return tripped_; }
  uint32_t sustained_ms() const { return run_ms_; }

 private:
  TrailingStepConfig cfg_;
  uint32_t t_[HISTORY]{};
  float v_[HISTORY]{};
  uint32_t last_ms_{0}, run_ms_{0}, last_store_ms_{0};
  uint8_t n_{0}, head_{0};
  bool tripped_{false};
};

constexpr bool cap_ladder_is_monotonic(const CapLadder &c) {
  return c.seat_ma < c.popoff_ma && c.popoff_ma < c.stall_ma &&
         c.stall_ma < c.circuit_ma;
}

/// A partially reordered ladder is not obviously safe, so a violation resets
/// ALL of the current thresholds to the compile-time defaults rather than
/// swapping the offending pair.
constexpr CapLadder sanitize_cap_ladder(CapLadder c, float rail_trip_ma) {
  if (!cap_ladder_is_monotonic(c)) {
    const CapLadder d{};
    c.seat_ma = d.seat_ma;
    c.popoff_ma = d.popoff_ma;
    c.stall_ma = d.stall_ma;
    c.circuit_ma = d.circuit_ma;
    c.open_stop_ma = d.open_stop_ma;
  }
  // Firmware must always see a circuit fault before the hardware comparator.
  const float hw_ceiling = rail_trip_ma * 0.9f;
  if (c.circuit_ma > hw_ceiling)
    c.circuit_ma = hw_ceiling;
  if (c.stall_ma >= c.circuit_ma)
    c.stall_ma = c.circuit_ma - 1.0f;

  c.seat_frames = static_cast<uint8_t>(sl_clamp_u32(c.seat_frames, 1, 8));
  c.popoff_frames = static_cast<uint8_t>(sl_clamp_u32(c.popoff_frames, 1, 8));
  c.stall_frames = static_cast<uint8_t>(sl_clamp_u32(c.stall_frames, 1, 8));
  c.circuit_frames = static_cast<uint8_t>(sl_clamp_u32(c.circuit_frames, 1, 8));
  c.open_frames = static_cast<uint8_t>(sl_clamp_u32(c.open_frames, 1, 8));
  c.min_valid_samples =
      static_cast<uint16_t>(sl_clamp_u32(c.min_valid_samples, 1, 64));
  return c;
}

}  // namespace lv6
