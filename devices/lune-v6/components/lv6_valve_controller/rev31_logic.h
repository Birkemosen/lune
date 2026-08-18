#pragma once

#include <cstdint>

namespace lv6 {

// Pure, host-testable contract for the Rev 3.1 one-hot decoder and the
// current-plus-motion endpoint decision.  Keep this file free of ESP-IDF so
// the safety invariants can be exercised in CI.
enum class Rev31Direction : uint8_t { FORWARD = 0, REVERSE = 1 };

struct Rev31DecoderSelection {
  uint8_t zone{0};
  Rev31Direction direction{Rev31Direction::FORWARD};
  bool enabled{false};
  bool faulted{true};

  static constexpr bool valid_zone(uint8_t candidate) { return candidate < 6; }

  constexpr uint8_t decoder_output() const {
    return static_cast<uint8_t>(zone +
        (direction == Rev31Direction::REVERSE ? 8u : 0u));
  }

  bool select(uint8_t new_zone, Rev31Direction new_direction) {
    // Address and direction may only change while the decoder is inhibited.
    if (enabled || !valid_zone(new_zone))
      return false;
    zone = new_zone;
    direction = new_direction;
    return true;
  }

  bool enable() {
    if (faulted || !valid_zone(zone))
      return false;
    enabled = true;
    return true;
  }

  void coast() { enabled = false; }
  void latch_fault() {
    faulted = true;
    enabled = false;
  }
  void arm() { faulted = false; }
};

struct Rev31MotionSample {
  int16_t differential_raw{0};
  uint16_t separation_us{0};
  bool valid{false};
  bool moving{false};
};

class Rev31MotionTracker {
 public:
  explicit Rev31MotionTracker(uint16_t threshold_raw = 40,
                              uint16_t max_separation_us = 50)
      : threshold_raw_(threshold_raw), max_separation_us_(max_separation_us) {}

  void reset() {
    evidence_count_ = 0;
    ever_moved_ = false;
    last_motion_ms_ = 0;
  }

  Rev31MotionSample observe(int raw_a, int raw_b, uint16_t separation_us,
                            uint32_t now_ms) {
    int diff = raw_b - raw_a;
    if (diff > 32767) diff = 32767;
    if (diff < -32768) diff = -32768;
    const int magnitude = diff < 0 ? -diff : diff;
    const bool valid = separation_us <= max_separation_us_;
    const bool moving = valid && magnitude >= static_cast<int>(threshold_raw_);
    if (moving) {
      ++evidence_count_;
      ever_moved_ = true;
      last_motion_ms_ = now_ms;
    }
    return {static_cast<int16_t>(diff), separation_us, valid, moving};
  }

  bool stopped_for(uint32_t now_ms, uint32_t debounce_ms) const {
    return ever_moved_ && (now_ms - last_motion_ms_) >= debounce_ms;
  }

  uint32_t evidence_count() const { return evidence_count_; }
  bool ever_moved() const { return ever_moved_; }

 private:
  uint16_t threshold_raw_;
  uint16_t max_separation_us_;
  uint32_t evidence_count_{0};
  uint32_t last_motion_ms_{0};
  bool ever_moved_{false};
};

enum class Rev31EndpointDecision : uint8_t {
  CONTINUE,
  ENDPOINT,
  ALREADY_AT_ENDPOINT,
  JAM,
  DISCONNECTED,
  SENSOR_FAULT,
};

struct Rev31EndpointEvidence {
  bool current_present{false};
  bool current_elevated{false};
  bool motion_observed{false};
  bool motion_stopped{false};
  bool endpoint_window{false};
  bool already_at_stop_window{false};
  bool sample_valid{true};
};

constexpr Rev31EndpointDecision classify_rev31_endpoint(
    const Rev31EndpointEvidence &evidence) {
  if (!evidence.sample_valid)
    return Rev31EndpointDecision::SENSOR_FAULT;
  if (!evidence.current_present && !evidence.motion_observed)
    return Rev31EndpointDecision::DISCONNECTED;
  if (evidence.already_at_stop_window && evidence.current_present &&
      !evidence.motion_observed)
    return Rev31EndpointDecision::ALREADY_AT_ENDPOINT;
  if (evidence.current_elevated && evidence.motion_observed &&
      evidence.motion_stopped)
    return evidence.endpoint_window ? Rev31EndpointDecision::ENDPOINT
                                    : Rev31EndpointDecision::JAM;
  return Rev31EndpointDecision::CONTINUE;
}

}  // namespace lv6
