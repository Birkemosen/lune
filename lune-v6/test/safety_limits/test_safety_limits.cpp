// Host tests for safety_limits.h - the runtime ceilings and the absolute
// current-cap ladder.  These are the two guarantees that do not depend on
// endstop detection working at all.
//
//   make test-safety-limits

#include "safety_limits.h"

#include <cassert>
#include <initializer_list>
#include <cmath>
#include <cstdio>

using namespace lv6;

namespace {

// Measured/derived policy for the HmIP-VDMOT on Rev 3.3.  40 s of close travel
// puts the plunger at the housing exit (3120 counts at the measured 78 Hz), so
// the close ceilings sit ~17% inside that.
constexpr uint32_t kCloseBootstrapMs = 34000;
constexpr uint32_t kCloseBootstrapCounts = 2600;
constexpr uint32_t kOpenBootstrapMs = 45000;
constexpr uint32_t kOpenBootstrapCounts = 3600;

MoveCeilingInputs close_inputs() {
  MoveCeilingInputs in{};
  in.direction_is_open = false;
  in.bootstrap_ms = kCloseBootstrapMs;
  in.bootstrap_counts = kCloseBootstrapCounts;
  in.overrun_budget_ms = 2000;
  in.overrun_budget_counts = 150;
  in.stroke_uncertainty_pct = 20;
  in.runtime_floor_ms = 2000;
  return in;
}

MoveCeilingInputs open_inputs() {
  MoveCeilingInputs in = close_inputs();
  in.direction_is_open = true;
  in.bootstrap_ms = kOpenBootstrapMs;
  in.bootstrap_counts = kOpenBootstrapCounts;
  in.overrun_budget_ms = 3000;
  in.overrun_budget_counts = 250;
  return in;
}

// ---------------------------------------------------------------------------
// Runtime ceilings
// ---------------------------------------------------------------------------

/// The load-bearing invariant: nothing a caller can ask for may produce a close
/// ceiling past the mechanical limit.  Swept over the whole input space.
void test_close_ceiling_never_exceeds_destruction() {
  for (uint32_t stroke_ms = 0; stroke_ms <= 120000; stroke_ms += 2500) {
    for (uint32_t stroke_ct = 0; stroke_ct <= 6000; stroke_ct += 250) {
      for (int fi = 0; fi <= 10; fi++) {
        for (int flags = 0; flags < 8; flags++) {
          MoveCeilingInputs in = close_inputs();
          in.learned_stroke_ms = stroke_ms;
          in.learned_stroke_counts = stroke_ct;
          in.remaining_fraction = static_cast<float>(fi) / 10.0f;
          in.calibrating = (flags & 1) != 0;
          in.drive_to_endstop = (flags & 2) != 0;
          in.position_confident = (flags & 4) != 0;

          const MoveCeiling c = compute_move_ceiling(in);
          assert(c.limit_ms <= kCloseBootstrapMs);
          assert(c.limit_counts <= kCloseBootstrapCounts);
          assert(c.limit_ms >= in.runtime_floor_ms);
        }
      }
    }
  }
}

void test_travel_scaling_tightens_a_partial_move() {
  MoveCeilingInputs in = close_inputs();
  in.learned_stroke_ms = 20000;
  in.learned_stroke_counts = 2000;
  in.position_confident = true;
  in.remaining_fraction = 0.20f;

  const MoveCeiling c = compute_move_ceiling(in);
  // 20000 * 0.20 * 1.2 + 2000 = 6800 ms, not the full 34 s.
  assert(c.limit_ms == 6800);
  assert(c.source == CeilingSource::LEARNED);
  assert(c.limit_counts == static_cast<uint32_t>(2000 * 0.20f * 1.2f) + 150);
}

void test_untrusted_position_is_identical_to_a_full_stroke() {
  MoveCeilingInputs a = close_inputs();
  a.learned_stroke_ms = 20000;
  a.learned_stroke_counts = 2000;
  a.position_confident = false;
  a.remaining_fraction = 0.05f;  // must be ignored

  MoveCeilingInputs b = a;
  b.position_confident = true;
  b.remaining_fraction = 1.0f;

  const MoveCeiling ca = compute_move_ceiling(a);
  const MoveCeiling cb = compute_move_ceiling(b);
  assert(ca.limit_ms == cb.limit_ms);
  assert(ca.limit_counts == cb.limit_counts);
}

void test_timed_and_user_max_can_only_lower() {
  MoveCeilingInputs in = close_inputs();
  in.learned_stroke_ms = 20000;
  in.learned_stroke_counts = 2000;
  in.position_confident = true;
  in.remaining_fraction = 1.0f;
  const uint32_t base = compute_move_ceiling(in).limit_ms;

  in.timed_duration_ms = 5000;
  const MoveCeiling timed = compute_move_ceiling(in);
  assert(timed.limit_ms == 5000 && timed.source == CeilingSource::TIMED);

  // A timed duration longer than the derived ceiling must not raise it - this
  // is the Motor Lab "+15 s headroom" path that destroyed a plunger.
  in.timed_duration_ms = 90000;
  assert(compute_move_ceiling(in).limit_ms == base);

  in.timed_duration_ms = 0;
  in.user_max_runtime_ms = 7000;
  const MoveCeiling um = compute_move_ceiling(in);
  assert(um.limit_ms == 7000 && um.source == CeilingSource::USER_MAX);
}

void test_uncalibrated_bootstrap_and_refusal() {
  MoveCeilingInputs in = close_inputs();
  in.learned_stroke_ms = 0;

  // A calibration pass is allowed to run on the bootstrap ceiling...
  in.calibrating = true;
  in.drive_to_endstop = true;
  MoveCeiling c = compute_move_ceiling(in);
  assert(c.source == CeilingSource::BOOTSTRAP);
  assert(c.limit_ms == kCloseBootstrapMs);
  assert(!c.requires_calibration);

  // ...but an ordinary drive-to-endstop move on an unlearned zone must not be
  // the thing that discovers the stroke length.
  in.calibrating = false;
  c = compute_move_ceiling(in);
  assert(c.requires_calibration);
}

void test_directions_are_not_symmetric() {
  MoveCeilingInputs c = close_inputs();
  MoveCeilingInputs o = open_inputs();
  c.learned_stroke_ms = o.learned_stroke_ms = 0;
  const MoveCeiling cc = compute_move_ceiling(c);
  const MoveCeiling oo = compute_move_ceiling(o);
  // Guards against a symmetric regression creeping back in.
  assert(cc.limit_ms != oo.limit_ms);
  assert(cc.limit_counts != oo.limit_counts);
  assert(cc.limit_ms < oo.limit_ms);
}

void test_floor_applies() {
  MoveCeilingInputs in = close_inputs();
  in.learned_stroke_ms = 500;
  in.learned_stroke_counts = 40;
  in.position_confident = true;
  in.remaining_fraction = 0.01f;
  in.overrun_budget_ms = 0;
  const MoveCeiling c = compute_move_ceiling(in);
  assert(c.limit_ms == in.runtime_floor_ms);
  assert(c.source == CeilingSource::FLOOR);
}

// ---------------------------------------------------------------------------
// Current thresholds
// ---------------------------------------------------------------------------

void test_trip_is_offset_immune() {
  // Our sense is rail-total: every reading carries a fixed offset from the
  // driver quiescent current.  A fraction of the stall span must cancel it
  // exactly, which is why this is not `baseline * factor`.
  const float k = 0.30f;
  const float base = current_trip_ma(24.0f, 100.0f, k, 0.0f, 1000.0f);
  for (float off : {2.0f, 5.0f, 8.0f, 20.0f}) {
    const float shifted = current_trip_ma(24.0f + off, 100.0f + off, k, 0.0f, 1000.0f);
    assert(std::fabs((shifted - off) - base) < 1e-3f);
  }
}

void test_trip_is_clamped_and_cannot_be_disabled() {
  // A corrupted k must not put the threshold out of reach (VdMot #132 saw a
  // stored factor silently become 3.7, which could never trip).
  assert(current_trip_ma(24.0f, 100.0f, 5.0f, 30.0f, 44.0f) == 44.0f);
  assert(current_trip_ma(24.0f, 100.0f, -1.0f, 30.0f, 44.0f) == 30.0f);
  // Degenerate span falls back to the floor rather than producing nonsense.
  assert(current_trip_ma(50.0f, 50.0f, 0.3f, 30.0f, 44.0f) == 30.0f);
  assert(current_trip_ma(60.0f, 50.0f, 0.3f, 30.0f, 44.0f) == 30.0f);
}

// ---------------------------------------------------------------------------
// Cap ladder
// ---------------------------------------------------------------------------

CapContext close_ctx() {
  CapContext c{};
  c.direction_is_open = false;
  c.past_blanking = true;
  c.seat_phase = false;
  return c;
}

FastTrip feed(const CapLadder &l, const CapContext &ctx, float mean, float peak,
              int frames, uint16_t valid = 64) {
  CapCounters c{};
  FastTrip worst = FastTrip::NONE;
  for (int i = 0; i < frames; i++) {
    const FastTrip t = evaluate_cap_ladder(l, ctx, {mean, peak, valid}, c);
    if (t > worst)
      worst = t;
  }
  return worst;
}

void test_healthy_transient_fires_nothing() {
  // The case that killed the earlier naive open cap: a commutation transient
  // peaks at 60 mA while the frame mean is a perfectly normal 30 mA.
  const CapLadder l{};
  assert(feed(l, close_ctx(), 30.0f, 60.0f, 10) == FastTrip::NONE);
  CapContext o = close_ctx();
  o.direction_is_open = true;
  o.open_cap_armed = true;
  assert(feed(l, o, 30.0f, 60.0f, 10) == FastTrip::NONE);
}

void test_close_popoff_is_ungated() {
  // No stroke phase, no learned stroke, nothing but a sustained mean - this is
  // the rung that has to work when the phase machine is the thing that broke.
  const CapLadder l{};
  CapContext ctx = close_ctx();
  ctx.seat_phase = false;
  assert(feed(l, ctx, 37.0f, 40.0f, 1) == FastTrip::NONE);
  assert(feed(l, ctx, 37.0f, 40.0f, 2) == FastTrip::CLOSE_POPOFF);
}

void test_seat_cap_requires_a_seated_phase() {
  const CapLadder l{};
  CapContext ctx = close_ctx();
  ctx.seat_phase = false;
  assert(feed(l, ctx, 35.0f, 35.0f, 6) == FastTrip::NONE);  // pin contact must not trip
  ctx.seat_phase = true;
  assert(feed(l, ctx, 35.0f, 35.0f, 6) == FastTrip::CLOSE_SEAT);
}

void test_open_cap_does_not_arm_during_breakaway() {
  // Measured open breakaway is 57-59 mA for ~4 s. Before the baseline settles
  // the cap must be inert or every open move dies at t=0.
  const CapLadder l{};
  CapContext ctx{};
  ctx.direction_is_open = true;
  ctx.past_blanking = true;
  ctx.open_cap_armed = false;
  assert(feed(l, ctx, 58.0f, 60.0f, 10) != FastTrip::OPEN_STOP);
  ctx.open_cap_armed = true;
  assert(feed(l, ctx, 45.0f, 46.0f, 3) == FastTrip::OPEN_STOP);
}

void test_circuit_fault_wins_and_ignores_blanking() {
  const CapLadder l{};
  CapContext ctx = close_ctx();
  ctx.seat_phase = true;
  // A peak fault arriving in the same frame as a seat trip must not be masked.
  CapCounters c{};
  FastTrip t = FastTrip::NONE;
  for (int i = 0; i < 4; i++)
    t = evaluate_cap_ladder(l, ctx, {35.0f, 90.0f, 64}, c);
  assert(t == FastTrip::CIRCUIT_FAULT);

  // ...and it is not gated on blanking: a short is a fault from frame one.
  ctx.past_blanking = false;
  assert(feed(l, ctx, 0.0f, 90.0f, 2) == FastTrip::CIRCUIT_FAULT);
}

void test_short_frames_do_not_advance_mean_rungs() {
  const CapLadder l{};
  CapContext ctx = close_ctx();
  // A frame straddling drive-start carries few valid samples; its mean is junk.
  assert(feed(l, ctx, 37.0f, 40.0f, 10, /*valid=*/4) == FastTrip::NONE);
  // The peak rung still works on such a frame.
  assert(feed(l, ctx, 0.0f, 90.0f, 2, /*valid=*/4) == FastTrip::CIRCUIT_FAULT);
}

void test_counter_resets_on_a_clean_frame() {
  const CapLadder l{};
  CapContext ctx = close_ctx();
  CapCounters c{};
  evaluate_cap_ladder(l, ctx, {37.0f, 40.0f, 64}, c);
  assert(c.popoff == 1);
  evaluate_cap_ladder(l, ctx, {20.0f, 25.0f, 64}, c);
  assert(c.popoff == 0 && "a single below-threshold frame must reset the rung");
}

void test_sanitize_rejects_a_reordered_ladder_wholesale() {
  CapLadder bad{};
  bad.seat_ma = 90.0f;  // above circuit - nonsense
  const CapLadder fixed = sanitize_cap_ladder(bad, 150.0f);
  assert(cap_ladder_is_monotonic(fixed));
  const CapLadder def{};
  assert(fixed.seat_ma == def.seat_ma);
  assert(fixed.popoff_ma == def.popoff_ma);

  // Firmware must always see a circuit fault before the hardware comparator.
  CapLadder high{};
  high.circuit_ma = 200.0f;
  const CapLadder clamped = sanitize_cap_ladder(high, 150.0f);
  assert(clamped.circuit_ma <= 150.0f * 0.9f + 1e-3f);
  assert(cap_ladder_is_monotonic(clamped));

  CapLadder z{};
  z.seat_frames = 0;
  z.min_valid_samples = 0;
  const CapLadder zf = sanitize_cap_ladder(z, 150.0f);
  assert(zf.seat_frames >= 1 && zf.min_valid_samples >= 1);
}

}  // namespace

int main() {
  test_close_ceiling_never_exceeds_destruction();
  test_travel_scaling_tightens_a_partial_move();
  test_untrusted_position_is_identical_to_a_full_stroke();
  test_timed_and_user_max_can_only_lower();
  test_uncalibrated_bootstrap_and_refusal();
  test_directions_are_not_symmetric();
  test_floor_applies();

  test_trip_is_offset_immune();
  test_trip_is_clamped_and_cannot_be_disabled();

  test_healthy_transient_fires_nothing();
  test_close_popoff_is_ungated();
  test_seat_cap_requires_a_seated_phase();
  test_open_cap_does_not_arm_during_breakaway();
  test_circuit_fault_wins_and_ignores_blanking();
  test_short_frames_do_not_advance_mean_rungs();
  test_counter_resets_on_a_clean_frame();
  test_sanitize_rejects_a_reordered_ladder_wholesale();

  std::printf("safety_limits: all assertions passed\n");
  return 0;
}
