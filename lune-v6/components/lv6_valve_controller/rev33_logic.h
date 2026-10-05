#pragma once

#include <cstdint>

#include "endpoint_logic.h"

namespace lv6 {

// Pure, host-testable contract for the discrete one-hot decoder and its
// commutation-tacho qualifier used by the Rev 3.3 board.
// Keep this file free of ESP-IDF so the safety invariants can be exercised in
// CI.  Stroke-phase / endpoint *detection* lives in endpoint_logic.h so it is
// not tied to a PCB revision name.
//
// The GPIO-bridge path differs from Rev 3.1 in three ways that matter here:
//
//   1. All four address lines are plain address bits.  No bit encodes
//      direction, so the channel/direction pair maps to a decoder output
//      through a twelve-entry table rather than a formula.  See
//      decoder.address_bit0_rationale in design-contract.json.
//   2. There is no hardware fault latch.  DRIVER_N_SLEEP is the firmware-held
//      drive permit, and three active-LOW fault nets withdraw it.
//   3. The BEMF mux is gone.  Motion evidence comes from COMM_TACHO_N, a
//      digital comparator output counted continuously while driving.
enum class Rev33Direction : uint8_t { FORWARD = 0, REVERSE = 1 };

inline constexpr uint8_t REV33_CHANNEL_COUNT = 6;
inline constexpr uint8_t REV33_ADDRESS_INVALID = 0xFFu;

// decoder.channel_address_map, indexed by channel - 1.  Addresses 0-3 are
// unreachable by design: Q0-Q3 reach no bridge input.
inline constexpr uint8_t REV33_FORWARD_ADDRESS[REV33_CHANNEL_COUNT] = {
    7u, 4u, 13u, 14u, 9u, 10u};
inline constexpr uint8_t REV33_REVERSE_ADDRESS[REV33_CHANNEL_COUNT] = {
    6u, 5u, 12u, 15u, 8u, 11u};

constexpr bool rev33_valid_channel_index(uint8_t index) {
  return index < REV33_CHANNEL_COUNT;
}

// index is 0-based; channel 1 in the contract is index 0 here, matching the
// zone numbering the rest of the controller uses.
constexpr uint8_t rev33_decoder_address(uint8_t index, Rev33Direction direction) {
  return rev33_valid_channel_index(index)
             ? (direction == Rev33Direction::REVERSE ? REV33_REVERSE_ADDRESS[index]
                                                     : REV33_FORWARD_ADDRESS[index])
             : REV33_ADDRESS_INVALID;
}

constexpr bool rev33_address_is_reachable(uint8_t address) {
  return address >= 4u && address <= 15u;
}

// Selection state machine.  The address may only change while the decoder is
// inhibited, and drive is refused until the permit is granted with every fault
// net clear.
struct Rev33DecoderSelection {
  uint8_t index{0};
  Rev33Direction direction{Rev33Direction::FORWARD};
  bool enabled{false};
  bool armed{false};

  constexpr uint8_t decoder_address() const {
    return rev33_decoder_address(index, direction);
  }

  bool select(uint8_t new_index, Rev33Direction new_direction) {
    if (enabled || !rev33_valid_channel_index(new_index))
      return false;
    index = new_index;
    direction = new_direction;
    return true;
  }

  bool enable() {
    if (!armed || !rev33_valid_channel_index(index))
      return false;
    enabled = true;
    return true;
  }

  void coast() { enabled = false; }

  // The permit may only be granted from coast.  A grant attempt that finds a
  // fault net still asserted leaves the selection unarmed; firmware cannot clear
  // a hardware fault, so this is the only recovery path there is.
  bool arm(bool fault_asserted) {
    if (enabled)
      return false;
    armed = !fault_asserted;
    return armed;
  }

  // A fault net asserting withdraws the permit and the drive together.  The
  // caller distinguishes a mid-move fault from an idle one by whether a move
  // was in progress.
  void observe_fault(bool fault_asserted) {
    if (!fault_asserted)
      return;
    armed = false;
    enabled = false;
  }
};

// Commutation edges are qualified on width and period before they count.  The
// analog band-pass rejects the 50 kHz chopper; this is the cheap second line
// against the ~20 us pulses that survive it.
class Rev33TachoQualifier {
 public:
  Rev33TachoQualifier(uint16_t min_pulse_us = 200, uint32_t min_period_us = 8000,
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

}  // namespace lv6
