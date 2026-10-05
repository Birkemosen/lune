#pragma once
// =============================================================================
// stroke_learning.h — learn the working range: pin contact (100 %) to seat (0 %)
// =============================================================================
// Everything on the open side of pin contact is dead space: the plunger has let
// go of the valve pin, so further opening changes no flow and only walks the
// actuator toward its own gear-train stop - the direction whose overrun strips
// gears and whose endstop has never been measured on a healthy unit. So the
// open endstop is never a target. What is learned instead is the range that
// matters, measured entirely on CLOSE passes:
//
//     home      close to the seat (the robust, high-current direction)
//     open B    a bounded number of counts, meant to land in dead space
//     close     must show FREE TRAVEL before pin contact - that is the proof
//               it started in dead space; without it B grows and it repeats
//     record    pin onset and seat -> working range W = seat - pin
//     repeat    until `samples` agree; the median wins
//
// 100 % then means "W + margin counts open from the seat", which always stops
// short of the gear stop. The open endstop paths stay armed only as backstops.
//
// Pure (no ESP-IDF); host-tested by `make test-stroke-learning`.
// =============================================================================

#include <algorithm>
#include <cstddef>
#include <cstdint>

namespace lv6 {

// ---------------------------------------------------------------------------
// Pin onset from current
// ---------------------------------------------------------------------------
// The stroke tracker's contact test needs the rotor to slow as well, and on
// this actuator pin contact barely moves the cadence (measured 78 Hz free,
// ~77 Hz pressing the pin). Current is the usable signal: a slow ramp, ~1 mA/s,
// from the flat free-travel level. A step detector on that ramp latches late -
// 2 mA above baseline is ~2 s and ~150 counts after the ramp began - so the
// onset is taken as the LAST count the current was still at the baseline,
// which is where the plunger first touched the pin.
struct PinOnsetConfig {
  float step_ma{2.0f};         ///< sustained rise above baseline that proves contact
  uint32_t sustain_ms{200};    ///< ...held this long
  float onset_eps_ma{0.5f};    ///< "still at baseline" band for the onset count
};

class PinOnsetDetector {
 public:
  explicit PinOnsetDetector(const PinOnsetConfig &cfg = {}) : cfg_(cfg) {}
  void set_config(const PinOnsetConfig &cfg) { cfg_ = cfg; }

  void reset() {
    detected_ = false;
    onset_count_ = 0;
    detect_count_ = 0;
    last_near_count_ = 0;
    have_near_ = false;
    run_ms_ = 0;
    last_ms_ = 0;
  }

  /// `baseline_ma` is the stroke's frozen free-travel minimum; 0 = none yet.
  void observe(uint32_t now_ms, uint32_t count, float current_ma, float baseline_ma) {
    const uint32_t dt = last_ms_ == 0 ? 0 : now_ms - last_ms_;
    last_ms_ = now_ms;
    if (detected_ || baseline_ma <= 0.0f)
      return;
    if (current_ma <= baseline_ma + cfg_.onset_eps_ma) {
      last_near_count_ = count;
      have_near_ = true;
    }
    if (have_near_ && current_ma >= baseline_ma + cfg_.step_ma) {
      run_ms_ += dt;
      if (run_ms_ >= cfg_.sustain_ms) {
        detected_ = true;
        onset_count_ = last_near_count_;
        detect_count_ = count;
      }
    } else {
      run_ms_ = 0;
    }
  }

  bool detected() const { return detected_; }
  uint32_t onset_count() const { return onset_count_; }
  uint32_t detect_count() const { return detect_count_; }

 private:
  PinOnsetConfig cfg_;
  bool detected_{false};
  bool have_near_{false};
  uint32_t onset_count_{0};
  uint32_t detect_count_{0};
  uint32_t last_near_count_{0};
  uint32_t run_ms_{0};
  uint32_t last_ms_{0};
};

// ---------------------------------------------------------------------------
// Soft seat from current, referenced to the pressing plateau
// ---------------------------------------------------------------------------
// Measured Rev 3.3 z1 close past the pin: ramp 23 -> 32 mA over ~430 counts,
// a spring break-over bump to 35-36.5 mA ~600 counts past contact, a flat
// ~32 mA pressing plateau, then the seat - a slow rise of ~1 mA per 100 counts
// with no cadence drop at all (the rotor never slows). The bump reaches the
// seat's magnitude, so no absolute or contact-anchored level separates them;
// the plateau does. The reference is taken only once the bump is behind us
// (a clear fall from the running peak), or after a fixed distance past contact
// for a valve with no bump, and is the plateau's running minimum from then on.
//
// The rise is scaled to this motor's pin load (plateau - free travel): motor
// torque constant and pin spring move the pressing and seating loads together,
// so a weak motor or soft pin seats with a proportionally smaller step. z1:
// 1.5 mA over a 9.3 mA pin load = 0.16.
struct SeatRiseConfig {
  float rise_fraction{0.16f};       ///< seat = plateau + fraction x pin load...
  float rise_floor_ma{1.0f};        ///< ...never below this (plateau noise ~0.5 mA)
  float rise_ma{1.5f};              ///< used while no free-travel reference exists
  uint32_t sustain_ms{500};         ///< ...held this long
  float breakover_drop_ma{1.5f};    ///< fall from the post-contact peak = bump passed
  uint32_t arm_counts{800};         ///< ...or this far past contact without a bump
};

class SeatRiseDetector {
 public:
  explicit SeatRiseDetector(const SeatRiseConfig &cfg = {}) : cfg_(cfg) {}
  void set_config(const SeatRiseConfig &cfg) { cfg_ = cfg; }

  void reset() {
    armed_ = false;
    tripped_ = false;
    peak_ma_ = 0.0f;
    plateau_ma_ = 0.0f;
    rise_ma_ = 0.0f;
    run_ms_ = 0;
    drop_ms_ = 0;
    last_ms_ = 0;
  }

  /// Call every tick of a close stroke once pin contact has been seen.
  /// `free_travel_ma` is the stroke's frozen free-travel baseline; 0 = none.
  void observe(uint32_t now_ms, uint32_t count, float current_ma, uint32_t contact_count,
               float free_travel_ma) {
    const uint32_t dt = last_ms_ == 0 ? 0 : now_ms - last_ms_;
    last_ms_ = now_ms;
    if (tripped_)
      return;
    if (!armed_) {
      peak_ma_ = std::max(peak_ma_, current_ma);
      // Held, so a noise dip inside the still-rising pin ramp cannot arm it
      // with a reference below the plateau.
      if (current_ma <= peak_ma_ - cfg_.breakover_drop_ma)
        drop_ms_ += dt;
      else
        drop_ms_ = 0;
      const bool broke_over = drop_ms_ >= cfg_.sustain_ms;
      const bool far_enough = count >= contact_count + cfg_.arm_counts;
      if (!broke_over && !far_enough)
        return;
      armed_ = true;
      plateau_ma_ = current_ma;
    }
    plateau_ma_ = std::min(plateau_ma_, current_ma);
    rise_ma_ = free_travel_ma > 0.0f && plateau_ma_ > free_travel_ma
                   ? std::max(cfg_.rise_floor_ma,
                              cfg_.rise_fraction * (plateau_ma_ - free_travel_ma))
                   : cfg_.rise_ma;
    if (current_ma >= plateau_ma_ + rise_ma_) {
      run_ms_ += dt;
      if (run_ms_ >= cfg_.sustain_ms)
        tripped_ = true;
    } else {
      run_ms_ = 0;
    }
  }

  bool armed() const { return armed_; }
  bool tripped() const { return tripped_; }
  float plateau_ma() const { return plateau_ma_; }
  /// Rise currently required above the plateau.
  float rise_ma() const { return rise_ma_; }

 private:
  SeatRiseConfig cfg_;
  bool armed_{false};
  bool tripped_{false};
  float peak_ma_{0.0f};
  float plateau_ma_{0.0f};
  float rise_ma_{0.0f};
  uint32_t run_ms_{0};
  uint32_t drop_ms_{0};
  uint32_t last_ms_{0};
};

// ---------------------------------------------------------------------------
// The learning sequence
// ---------------------------------------------------------------------------
struct StrokeLearningConfig {
  // Defaults mirror MotorConfig::learn_*: the max is the close ceiling (2600)
  // minus its budget (150), since every leg must be closed again inside it.
  uint32_t open_start_ripples{2200};  ///< first bounded open leg from the seat
  uint32_t open_step_ripples{125};    ///< added each time dead space was not proven
  uint32_t open_max_ripples{2450};    ///< never open further than this
  uint32_t min_free_ripples{100};     ///< free travel before pin = proof of dead space
  uint32_t min_working_ripples{200};  ///< a shorter pin-to-seat range is implausible
  uint8_t samples{3};                 ///< agreeing close passes required
  uint8_t max_spread_pct{10};         ///< (max - min) / median of the working range
  uint8_t extra_attempts{2};          ///< close passes allowed beyond `samples`
  uint16_t margin_ripples{50};        ///< opened past pin onset so it fully lets go
};

enum class LearnStep : uint8_t { OPEN_LEG, CLOSE_PASS, DONE, FAILED };

enum class LearnFailure : uint8_t {
  NONE,
  OPEN_FAILED,     ///< a bounded open leg faulted
  CLOSE_FAILED,    ///< a close pass did not confirm the seat
  NO_DEAD_SPACE,   ///< open_max reached and still no free travel before the pin
  PIN_NOT_FOUND,   ///< free travel proven (open stop reached) but no pin onset
  SPAN_IMPLAUSIBLE,///< pin-to-seat shorter than min_working_ripples
  NOT_REPEATABLE,  ///< samples disagree by more than max_spread_pct
};

inline const char *learn_failure_to_string(LearnFailure f) {
  switch (f) {
    case LearnFailure::NONE: return "none";
    case LearnFailure::OPEN_FAILED: return "open leg failed";
    case LearnFailure::CLOSE_FAILED: return "close pass did not confirm the seat";
    case LearnFailure::NO_DEAD_SPACE: return "no free travel before the pin within the open limit";
    case LearnFailure::PIN_NOT_FOUND: return "pin contact not detected";
    case LearnFailure::SPAN_IMPLAUSIBLE: return "pin-to-seat range implausibly short";
    case LearnFailure::NOT_REPEATABLE: return "working range not repeatable";
  }
  return "unknown";
}

struct OpenLegResult {
  bool ok{false};            ///< no fault
  bool open_stop_hit{false}; ///< an open endpoint fired before the count target
  uint32_t count{0};
  uint32_t ms{0};
};

struct ClosePassResult {
  bool seat_confirmed{false};
  bool pin_seen{false};
  uint32_t pin_count{0};     ///< onset, counted from the start of this pass
  uint32_t total_count{0};   ///< counts to the seat
  uint32_t ms{0};
};

struct LearnedStroke {
  uint32_t working_ripples{0};  ///< median pin -> seat
  uint32_t free_ripples{0};     ///< median free travel before the pin (diagnostic)
  uint32_t open_span_ripples{0};///< working + margin: what 100 % opens by
  uint32_t open_ms{0};          ///< estimated time for the open span
  uint32_t close_ms{0};         ///< estimated time for the same span closing
  uint32_t spread_ripples{0};
};

class StrokeLearner {
 public:
  static constexpr uint8_t MAX_SAMPLES = 8;

  explicit StrokeLearner(const StrokeLearningConfig &cfg = {}) : cfg_(cfg) { reset(); }

  void reset() {
    step_ = LearnStep::OPEN_LEG;
    failure_ = LearnFailure::NONE;
    open_target_ = std::min(cfg_.open_start_ripples, cfg_.open_max_ripples);
    open_limit_ = cfg_.open_max_ripples;
    n_ = 0;
    close_passes_ = 0;
    open_ms_sum_ = open_count_sum_ = 0;
    close_ms_sum_ = close_count_sum_ = 0;
    last_open_stop_hit_ = false;
  }

  LearnStep step() const { return step_; }
  LearnFailure failure() const { return failure_; }
  uint32_t next_open_ripples() const { return open_target_; }
  uint8_t samples() const { return n_; }

  void on_open_leg(const OpenLegResult &r) {
    if (step_ != LearnStep::OPEN_LEG)
      return;
    if (!r.ok) {
      fail(LearnFailure::OPEN_FAILED);
      return;
    }
    last_open_stop_hit_ = r.open_stop_hit;
    // The gear stop is closer than planned: fully retracted is dead space by
    // definition, and there is no point asking for more than it allows.
    if (r.open_stop_hit && r.count > 0) {
      open_limit_ = std::min(open_limit_, r.count);
      open_target_ = std::min(open_target_, open_limit_);
    }
    if (r.count > 0 && r.ms > 0) {
      open_ms_sum_ += r.ms;
      open_count_sum_ += r.count;
    }
    step_ = LearnStep::CLOSE_PASS;
  }

  void on_close_pass(const ClosePassResult &r) {
    if (step_ != LearnStep::CLOSE_PASS)
      return;
    close_passes_++;
    if (!r.seat_confirmed) {
      fail(LearnFailure::CLOSE_FAILED);
      return;
    }
    if (r.total_count > 0 && r.ms > 0) {
      close_ms_sum_ += r.ms;
      close_count_sum_ += r.total_count;
    }

    const bool proven = r.pin_seen && r.pin_count >= cfg_.min_free_ripples &&
                        r.total_count > r.pin_count;
    if (!proven) {
      if (last_open_stop_hit_ && !r.pin_seen) {
        // It started fully retracted and still never met the pin.
        fail(LearnFailure::PIN_NOT_FOUND);
        return;
      }
      if (open_target_ >= open_limit_) {
        fail(r.pin_seen ? LearnFailure::NO_DEAD_SPACE : LearnFailure::PIN_NOT_FOUND);
        return;
      }
      open_target_ = std::min(open_target_ + cfg_.open_step_ripples, open_limit_);
      step_ = LearnStep::OPEN_LEG;
      return;
    }

    const uint32_t working = r.total_count - r.pin_count;
    if (working < cfg_.min_working_ripples) {
      fail(LearnFailure::SPAN_IMPLAUSIBLE);
      return;
    }
    if (n_ < MAX_SAMPLES) {
      working_[n_] = working;
      free_[n_] = r.pin_count;
      n_++;
    }

    if (n_ >= required_samples()) {
      if (spread_ok()) {
        step_ = LearnStep::DONE;
        return;
      }
      if (close_passes_ >= required_samples() + cfg_.extra_attempts || n_ >= MAX_SAMPLES) {
        fail(LearnFailure::NOT_REPEATABLE);
        return;
      }
    }
    step_ = LearnStep::OPEN_LEG;
  }

  LearnedStroke result() const {
    LearnedStroke out{};
    if (step_ != LearnStep::DONE || n_ == 0)
      return out;
    // The samples that passed the spread check, not every sample taken.
    const uint8_t k = required_samples();
    const uint32_t *w = working_ + (n_ - k);
    const uint32_t *f = free_ + (n_ - k);
    out.working_ripples = median(w, k);
    out.free_ripples = median(f, k);
    out.open_span_ripples = out.working_ripples + cfg_.margin_ripples;
    out.spread_ripples = max_of(w, k) - min_of(w, k);
    if (open_count_sum_ > 0)
      out.open_ms = static_cast<uint32_t>(
          static_cast<uint64_t>(open_ms_sum_) * out.open_span_ripples / open_count_sum_);
    if (close_count_sum_ > 0)
      out.close_ms = static_cast<uint32_t>(
          static_cast<uint64_t>(close_ms_sum_) * out.open_span_ripples / close_count_sum_);
    return out;
  }

 private:
  uint8_t required_samples() const {
    const uint8_t s = cfg_.samples == 0 ? 1 : cfg_.samples;
    return s > MAX_SAMPLES ? MAX_SAMPLES : s;
  }

  // The most recent `required_samples()` must agree, so one early outlier (the
  // first pass after homing from an unknown position) can be outlived.
  bool spread_ok() const {
    const uint8_t k = required_samples();
    const uint32_t *w = working_ + (n_ - k);
    const uint32_t med = median(w, k);
    if (med == 0)
      return false;
    return (max_of(w, k) - min_of(w, k)) * 100u <= static_cast<uint32_t>(cfg_.max_spread_pct) * med;
  }

  static uint32_t median(const uint32_t *v, uint8_t n) {
    uint32_t tmp[MAX_SAMPLES];
    std::copy(v, v + n, tmp);
    std::sort(tmp, tmp + n);
    return (n % 2) ? tmp[n / 2] : (tmp[n / 2 - 1] + tmp[n / 2]) / 2;
  }
  static uint32_t max_of(const uint32_t *v, uint8_t n) { return *std::max_element(v, v + n); }
  static uint32_t min_of(const uint32_t *v, uint8_t n) { return *std::min_element(v, v + n); }

  void fail(LearnFailure f) {
    failure_ = f;
    step_ = LearnStep::FAILED;
  }

  StrokeLearningConfig cfg_;
  LearnStep step_{LearnStep::OPEN_LEG};
  LearnFailure failure_{LearnFailure::NONE};
  uint32_t open_target_{0};
  uint32_t open_limit_{0};
  uint32_t working_[MAX_SAMPLES]{};
  uint32_t free_[MAX_SAMPLES]{};
  uint8_t n_{0};
  uint8_t close_passes_{0};
  uint64_t open_ms_sum_{0}, open_count_sum_{0};
  uint64_t close_ms_sum_{0}, close_count_sum_{0};
  bool last_open_stop_hit_{false};
};

}  // namespace lv6
