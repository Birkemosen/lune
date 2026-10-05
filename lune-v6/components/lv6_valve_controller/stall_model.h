#pragma once

#include <cstdint>

// Physics cross-check for the commutation counter.
//
// A brushed DC motor obeys V = I*R + k*w, so speed and current are inversely
// related: as load rises, current rises and the rotor slows.  Two things follow.
//
// 1. SPURIOUS COUNT DETECTION (SpuriousCountDetector).
//    At a hard stop this actuator's commutation counter does NOT plateau -
//    brush arcing keeps it advancing.  A measured close trace showed the count
//    rate RISING from 58 to 88 Hz while the current climbed from 48 to 61 mA,
//    which is impossible for one motor on one supply.  Every rotation-domain
//    endstop path (plateau, STOPPING cadence, stall debounce) is defeated by
//    that, silently.
//
//    The test is that impossibility, and it needs NO constants: current and
//    cadence rising together over a window means the edges are not
//    commutations.  It is immune to the rail offset, to sense gain, to drive
//    voltage and to per-actuator spread, because it only looks at the SIGN of
//    two changes.
//
//    Validated on the measured fixtures: zero false positives across the whole
//    close trace (including the pin-contact step and the 17.5 s pressure
//    plateau) and across the open trace, latching continuously once the
//    mechanism began to fail.
//
// 2. STALL FRACTION (predicted_speed_fraction / rotor_is_stalled).
//    Where a genuine stall current is known - learned at a confirmed endstop -
//    the same relation says what fraction of free speed the rotor should have.
//
// Note on what is deliberately NOT here: an on-line least-squares fit of
// cadence against current to recover I_stall was tried and rejected.  Measured
// cadence noise is +/-12% and only the final ramp carries any correlation, so
// the fit never reached a usable r^2 on real data.  I_stall is learned at a
// confirmed endpoint instead, where the motor is known to be stalled.

namespace lv6 {

struct StallModelConfig {
  /// Look-back window for the rising/rising test.
  uint32_t window_ms{3000};
  /// Smoothing applied to both current and cadence before differencing.
  float ema_alpha{0.25f};
  /// Current must have risen at least this much across the window.
  float min_current_rise_ma{3.0f};
  /// ...and cadence at least this much, for the pair to be impossible.
  float min_cadence_rise_hz{12.0f};
  /// Consecutive qualifying samples before the verdict latches.
  uint8_t confirm_samples{2};
  /// Speed fraction at or below which the rotor counts as against a stop.
  float stall_fraction_trip{0.30f};
};

/// Detects a commutation count that is rising when the current says it cannot be.
///
/// Feed it every FSM tick.  It keeps its own smoothing and a small ring of
/// history, so the caller does not have to.
class SpuriousCountDetector {
 public:
  static constexpr uint8_t HISTORY = 24;

  explicit SpuriousCountDetector(const StallModelConfig &cfg = {}) : cfg_(cfg) {}

  void set_config(const StallModelConfig &cfg) { cfg_ = cfg; }

  void reset() {
    n_ = 0;
    head_ = 0;
    run_ = 0;
    latched_ = false;
    primed_ = false;
  }

  void observe(uint32_t now_ms, float current_ma, float cadence_hz) {
    if (!primed_) {
      cur_ema_ = current_ma;
      cad_ema_ = cadence_hz;
      primed_ = true;
    } else {
      const float a = cfg_.ema_alpha;
      cur_ema_ = cur_ema_ * (1.0f - a) + current_ma * a;
      cad_ema_ = cad_ema_ * (1.0f - a) + cadence_hz * a;
    }

    // Oldest sample still inside the window.
    bool have_ref = false;
    float ref_cur = 0.0f, ref_cad = 0.0f;
    for (uint8_t k = 0; k < n_; k++) {
      const uint8_t idx = static_cast<uint8_t>((head_ + HISTORY - 1 - k) % HISTORY);
      if (now_ms - t_[idx] >= cfg_.window_ms) {
        ref_cur = cur_[idx];
        ref_cad = cad_[idx];
        have_ref = true;
        break;
      }
    }

    if (have_ref) {
      const bool hit = (cur_ema_ - ref_cur) > cfg_.min_current_rise_ma &&
                       (cad_ema_ - ref_cad) > cfg_.min_cadence_rise_hz;
      if (hit) {
        if (run_ < 255)
          run_++;
        if (run_ >= cfg_.confirm_samples)
          latched_ = true;
      } else {
        run_ = 0;
      }
    }

    t_[head_] = now_ms;
    cur_[head_] = cur_ema_;
    cad_[head_] = cad_ema_;
    head_ = static_cast<uint8_t>((head_ + 1) % HISTORY);
    if (n_ < HISTORY)
      n_++;
  }

  /// Once true it stays true for the rest of the move: a mechanism that has
  /// started producing arc edges does not recover mid-stroke, and the counter
  /// must not be re-trusted for the position it is about to record.
  bool spurious() const { return latched_; }
  float smoothed_current_ma() const { return cur_ema_; }
  float smoothed_cadence_hz() const { return cad_ema_; }

 private:
  StallModelConfig cfg_;
  uint32_t t_[HISTORY]{};
  float cur_[HISTORY]{};
  float cad_[HISTORY]{};
  uint8_t n_{0}, head_{0}, run_{0};
  bool latched_{false}, primed_{false};
  float cur_ema_{0.0f}, cad_ema_{0.0f};
};

/// w / w_free for the given operating point.  1.0 = free running, 0.0 = stalled.
/// Returns 1.0 when the span is degenerate, so a missing model can never
/// manufacture a stall verdict.
constexpr float predicted_speed_fraction(float current_ma, float i_free_ma,
                                         float i_stall_ma) {
  const float span = i_stall_ma - i_free_ma;
  if (span <= 0.0f)
    return 1.0f;
  const float f = (i_stall_ma - current_ma) / span;
  return f < 0.0f ? 0.0f : (f > 1.0f ? 1.0f : f);
}

/// The rotor is against a stop when the current says its speed has collapsed,
/// regardless of what the counter reports.  `i_stall_ma` must come from a
/// confirmed endpoint; pass a non-positive value when none has been learned and
/// this returns false rather than guessing.
constexpr bool rotor_is_stalled(float current_ma, float i_free_ma, float i_stall_ma,
                                float stall_fraction_trip) {
  if (i_stall_ma <= 0.0f)
    return false;
  const float span = i_stall_ma - i_free_ma;
  if (span <= 0.0f)
    return false;
  return predicted_speed_fraction(current_ma, i_free_ma, i_stall_ma) <=
         stall_fraction_trip;
}

}  // namespace lv6
