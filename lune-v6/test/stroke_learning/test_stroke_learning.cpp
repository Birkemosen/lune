// Host tests for stroke_learning.h: pin onset from current, and the
// working-range learning sequence (home -> bounded open -> close, repeated).

#include "stroke_learning.h"

#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

using namespace lv6;

namespace {

struct Row {
  uint32_t t_ms;
  float count;
  float current_ma;
};

std::string fixture_dir = "test/fixtures";

std::vector<Row> load(const std::string &name) {
  std::vector<Row> rows;
  FILE *f = std::fopen((fixture_dir + "/" + name).c_str(), "r");
  if (f == nullptr) {
    std::fprintf(stderr, "cannot open fixture %s\n", name.c_str());
    std::exit(1);
  }
  char line[2048];
  if (std::fgets(line, sizeof line, f) == nullptr) {
    std::fclose(f);
    return rows;
  }
  while (std::fgets(line, sizeof line, f) != nullptr) {
    char *s = line;
    char *a = strsep(&s, ",");
    char *b = strsep(&s, ",");
    char *c = strsep(&s, ",");
    if (a && b && c)
      rows.push_back({static_cast<uint32_t>(std::atof(a)), static_cast<float>(std::atof(b)),
                      static_cast<float>(std::atof(c))});
  }
  std::fclose(f);
  return rows;
}

/// Replay at the 10 ms FSM tick with the firmware's running-minimum baseline.
PinOnsetDetector replay_onset(const std::vector<Row> &rows) {
  PinOnsetDetector det{};
  det.reset();
  float baseline = 0.0f;
  size_t i = 0;
  for (uint32_t now = rows.front().t_ms; now <= rows.back().t_ms; now += 10) {
    while (i + 1 < rows.size() && rows[i + 1].t_ms <= now)
      i++;
    const Row &a = rows[i];
    const Row &b = rows[i + 1 < rows.size() ? i + 1 : i];
    const float f = b.t_ms > a.t_ms ? float(now - a.t_ms) / float(b.t_ms - a.t_ms) : 0.0f;
    const float c = a.current_ma + (b.current_ma - a.current_ma) * f;
    const uint32_t count = static_cast<uint32_t>(a.count + (b.count - a.count) * f);
    if (now >= 400 && (baseline == 0.0f || c < baseline - 0.5f))
      baseline = c;
    det.observe(now, count, c, baseline);
  }
  return det;
}

void test_pin_onset_on_the_close_fixture() {
  // The measured pin ramp starts at ~12.3-12.8 s, count ~960-1000, and climbs
  // ~1 mA/s. A 2 mA step alone latches ~2 s / ~150 counts later; the onset
  // must be back-projected to where the ramp left the baseline.
  const auto det = replay_onset(load("motor-lab-z1-close.csv"));
  assert(det.detected() && "pin contact must be found on the close fixture");
  assert(det.onset_count() >= 900 && det.onset_count() <= 1050);
  assert(det.detect_count() > det.onset_count() + 50 && "the step itself latches late");
}

void test_pin_onset_ignores_flat_travel() {
  // The open fixture decays from breakaway to a flat 24.4 mA: nothing rises.
  const auto det = replay_onset(load("motor-lab-z1-open.csv"));
  assert(!det.detected());
}

void test_pin_onset_needs_a_sustained_step() {
  PinOnsetDetector det{};
  det.reset();
  uint32_t count = 0;
  for (uint32_t t = 10; t <= 3000; t += 10, count++) {
    // One 100 ms spike of +3 mA at 1.5 s: shorter than the 200 ms sustain.
    const float c = (t >= 1500 && t < 1600) ? 27.0f : 24.0f;
    det.observe(t, count, c, 24.0f);
  }
  assert(!det.detected());
}

// --- seat rise ----------------------------------------------------------------

struct SeatReplay {
  bool tripped{false};
  uint32_t trip_count{0};
  float plateau_ma{0.0f};
  float rise_ma{0.0f};
};

/// Same replay as the onset, feeding the seat detector from pin contact on.
SeatReplay replay_seat(const std::vector<Row> &rows) {
  PinOnsetDetector pin{};
  SeatRiseDetector seat{};
  pin.reset();
  seat.reset();
  float baseline = 0.0f;
  size_t i = 0;
  SeatReplay out;
  for (uint32_t now = rows.front().t_ms; now <= rows.back().t_ms; now += 10) {
    while (i + 1 < rows.size() && rows[i + 1].t_ms <= now)
      i++;
    const Row &a = rows[i];
    const Row &b = rows[i + 1 < rows.size() ? i + 1 : i];
    const float f = b.t_ms > a.t_ms ? float(now - a.t_ms) / float(b.t_ms - a.t_ms) : 0.0f;
    const float c = a.current_ma + (b.current_ma - a.current_ma) * f;
    const uint32_t count = static_cast<uint32_t>(a.count + (b.count - a.count) * f);
    if (!pin.detected() && now >= 400 && (baseline == 0.0f || c < baseline - 0.5f))
      baseline = c;
    pin.observe(now, count, c, baseline);
    if (!pin.detected())
      continue;
    seat.observe(now, count, c, pin.onset_count(), baseline);
    if (seat.tripped()) {
      out.tripped = true;
      out.trip_count = count;
      out.plateau_ma = seat.plateau_ma();
      out.rise_ma = seat.rise_ma();
      break;
    }
  }
  return out;
}

void test_soft_seat_is_found_before_the_count_ceiling() {
  // Both z1 strokes ran into the 3000-count ceiling: the bump at ~1530 counts
  // reaches 35-36.5 mA, the ~32 mA plateau follows, and the seat rises slowly
  // from ~2650 counts. The stop must land past the bump and inside the ceiling.
  for (const char *name : {"motor-lab-z1-close-soft-seat-a.csv",
                           "motor-lab-z1-close-soft-seat-b.csv"}) {
    const SeatReplay r = replay_seat(load(name));
    std::printf("  %s: seat at %u counts, %.2f mA over %.1f mA plateau\n", name, r.trip_count,
                r.rise_ma, r.plateau_ma);
    assert(r.tripped && "the soft seat must be detected");
    assert(r.trip_count > 2600 && "the pin bump is not the seat");
    assert(r.trip_count < 3000 && "the seat must be found inside the ceiling");
    assert(r.plateau_ma > 31.0f && r.plateau_ma < 33.0f);
  }
}

void test_pin_ramp_is_not_a_seat() {
  // z1 stopped at 1429 counts / 33.3 mA on a contact-anchored level tuned to
  // 1.3x: ~500 counts past contact, still climbing toward the bump.
  const SeatReplay r = replay_seat(load("motor-lab-z1-close-pin-ramp-stop.csv"));
  assert(!r.tripped && "the pin ramp must not read as the seat");
}

void test_seat_rise_ignores_a_dip_in_the_pin_ramp() {
  SeatRiseDetector det{};
  det.reset();
  uint32_t count = 1000;
  for (uint32_t t = 10; t <= 6000; t += 10, count++) {
    // A rising ramp with a 200 ms, 2 mA dip: too short to count as break-over.
    float c = 24.0f + static_cast<float>(t) * 0.0015f;
    if (t >= 2000 && t < 2200)
      c -= 2.0f;
    det.observe(t, count, c, 1000, 22.0f);
  }
  assert(!det.armed() && "a transient dip is not the bump");
}

void test_seat_rise_arms_by_distance_without_a_bump() {
  SeatRiseDetector det{};
  det.reset();
  uint32_t count = 1000;
  bool armed_early = false;
  for (uint32_t t = 10; t <= 20000; t += 10) {
    count = 1000 + t / 12;
    // Ramp to a flat 30 mA, then a +2 mA seat from count 2500.
    float c = std::min(30.0f, 24.0f + static_cast<float>(count - 1000) * 0.02f);
    if (count >= 2500)
      c += std::min(2.0f, static_cast<float>(count - 2500) * 0.02f);
    det.observe(t, count, c, 1000, 24.0f);
    if (det.armed() && count < 1800)
      armed_early = true;
    if (det.tripped())
      break;
  }
  assert(!armed_early);
  assert(det.tripped() && count >= 2500 && count < 2700);
}

/// Flat pin load at `plateau`, then a seat of `seat_step` mA from count 2500.
/// Returns the trip count, 0 = never tripped.
uint32_t synthetic_seat(float free_travel, float plateau, float seat_step, float *rise = nullptr) {
  SeatRiseDetector det{};
  det.reset();
  for (uint32_t t = 10; t <= 30000; t += 10) {
    const uint32_t count = 1000 + t / 12;
    float c = std::min(plateau, free_travel + static_cast<float>(count - 1000) * 0.02f);
    if (count >= 2500)
      c += std::min(seat_step, static_cast<float>(count - 2500) * 0.01f);
    det.observe(t, count, c, 1000, free_travel);
    if (det.tripped()) {
      if (rise)
        *rise = det.rise_ma();
      return count;
    }
  }
  return 0;
}

void test_seat_rise_scales_with_the_pin_load() {
  // Weak motor / soft pin: 5 mA pin load, the seat adds only 1.2 mA. A fixed
  // 1.5 mA would run it into the ceiling; the scaled rise sits at the floor.
  float rise = 0.0f;
  const uint32_t weak = synthetic_seat(22.0f, 27.0f, 1.2f, &rise);
  assert(weak > 2500 && std::fabs(rise - 1.0f) < 0.01f);
  // Strong motor / hard pin: 16 mA pin load needs a 2.56 mA seat, so a
  // 1.8 mA wobble on its plateau is not one...
  assert(synthetic_seat(22.0f, 38.0f, 1.8f) == 0);
  // ...while its real, proportionally larger seat is.
  const uint32_t strong = synthetic_seat(22.0f, 38.0f, 4.0f, &rise);
  assert(strong > 2500 && std::fabs(rise - 2.56f) < 0.01f);
}

// --- learner ------------------------------------------------------------------

/// Round numbers so the expansion arithmetic reads plainly in the asserts.
StrokeLearningConfig test_cfg() {
  StrokeLearningConfig c{};
  c.open_start_ripples = 2400;
  c.open_step_ripples = 400;
  c.open_max_ripples = 3600;
  return c;
}

OpenLegResult open_ok(uint32_t count, uint32_t ms = 0, bool stop = false) {
  OpenLegResult r;
  r.ok = true;
  r.count = count;
  r.ms = ms ? ms : count * 12;  // ~85 Hz
  r.open_stop_hit = stop;
  return r;
}

ClosePassResult close_ok(uint32_t pin, uint32_t total, bool pin_seen = true) {
  ClosePassResult r;
  r.seat_confirmed = true;
  r.pin_seen = pin_seen;
  r.pin_count = pin;
  r.total_count = total;
  r.ms = total * 13;  // ~78 Hz
  return r;
}

void test_happy_path_learns_the_median_range() {
  StrokeLearner l{test_cfg()};
  const uint32_t works[] = {2000, 2040, 1980};
  for (uint32_t w : works) {
    assert(l.step() == LearnStep::OPEN_LEG);
    assert(l.next_open_ripples() == 2400);
    l.on_open_leg(open_ok(2400));
    assert(l.step() == LearnStep::CLOSE_PASS);
    l.on_close_pass(close_ok(400, 400 + w));
  }
  assert(l.step() == LearnStep::DONE);
  const LearnedStroke r = l.result();
  assert(r.working_ripples == 2000);
  assert(r.open_span_ripples == 2050);
  assert(r.free_ripples == 400);
  assert(r.spread_ripples == 60);
  // Times are scaled from the legs' own speed, not copied from a full stroke.
  assert(r.open_ms == 2050u * 12u);
  assert(r.close_ms == 2050u * 13u);
}

void test_starting_on_the_pin_grows_the_open_leg() {
  StrokeLearner l{test_cfg()};
  l.on_open_leg(open_ok(2400));
  // Only 30 counts of free travel: the leg ended with the pin still engaged.
  l.on_close_pass(close_ok(30, 2030));
  assert(l.step() == LearnStep::OPEN_LEG);
  assert(l.next_open_ripples() == 2800);
  // No pin at all is the same answer: it never left the pressure phase.
  l.on_open_leg(open_ok(2800));
  l.on_close_pass(close_ok(0, 2400, false));
  assert(l.step() == LearnStep::OPEN_LEG && l.next_open_ripples() == 3200);
}

void test_no_dead_space_within_the_open_limit_fails() {
  StrokeLearningConfig cfg = test_cfg();
  cfg.open_start_ripples = 3200;
  StrokeLearner l{cfg};
  l.on_open_leg(open_ok(3200));
  l.on_close_pass(close_ok(20, 3000));
  assert(l.next_open_ripples() == 3600);
  l.on_open_leg(open_ok(3600));
  l.on_close_pass(close_ok(20, 3400));
  assert(l.step() == LearnStep::FAILED && l.failure() == LearnFailure::NO_DEAD_SPACE);
}

void test_open_stop_without_pin_is_pin_not_found() {
  StrokeLearner l{test_cfg()};
  // The gear stop came first: fully retracted is dead space by definition...
  l.on_open_leg(open_ok(1900, 0, true));
  // ...so a close pass with no onset means the detector missed the pin.
  l.on_close_pass(close_ok(0, 1900, false));
  assert(l.step() == LearnStep::FAILED && l.failure() == LearnFailure::PIN_NOT_FOUND);
}

void test_open_stop_caps_later_legs() {
  StrokeLearner l{test_cfg()};
  l.on_open_leg(open_ok(2100, 0, true));
  assert(l.next_open_ripples() == 2100);
  l.on_close_pass(close_ok(300, 2400));
  assert(l.step() == LearnStep::OPEN_LEG && l.next_open_ripples() == 2100);
}

void test_disagreeing_samples_fail_after_the_extra_attempts() {
  StrokeLearner l{test_cfg()};
  const uint32_t works[] = {2000, 2600, 1500, 2300, 1700};
  for (uint32_t w : works) {
    if (l.step() != LearnStep::OPEN_LEG)
      break;
    l.on_open_leg(open_ok(2400));
    l.on_close_pass(close_ok(400, 400 + w));
  }
  assert(l.step() == LearnStep::FAILED && l.failure() == LearnFailure::NOT_REPEATABLE);
}

void test_an_early_outlier_is_outlived() {
  StrokeLearner l{test_cfg()};
  const uint32_t works[] = {2600, 2000, 2020, 1990};
  for (uint32_t w : works) {
    l.on_open_leg(open_ok(2400));
    l.on_close_pass(close_ok(400, 400 + w));
  }
  assert(l.step() == LearnStep::DONE);
  assert(l.result().working_ripples == 2000);
}

void test_a_failed_seat_or_open_leg_aborts() {
  StrokeLearner a{test_cfg()};
  a.on_open_leg(open_ok(2400));
  ClosePassResult bad = close_ok(400, 2400);
  bad.seat_confirmed = false;
  a.on_close_pass(bad);
  assert(a.failure() == LearnFailure::CLOSE_FAILED);

  StrokeLearner b{test_cfg()};
  OpenLegResult fault{};
  b.on_open_leg(fault);
  assert(b.failure() == LearnFailure::OPEN_FAILED);
}

void test_firmware_defaults_fit_the_close_ceiling() {
  // Every leg is closed again under the 2600-count close ceiling with a
  // 150-count budget, so the defaults may never plan a longer leg.
  const StrokeLearningConfig d{};
  assert(d.open_max_ripples <= 2600 - 150);
  assert(d.open_start_ripples <= d.open_max_ripples);
  StrokeLearner l{d};
  uint32_t legs = 0;
  while (l.step() == LearnStep::OPEN_LEG && legs < 20) {
    assert(l.next_open_ripples() <= 2450);
    l.on_open_leg(open_ok(l.next_open_ripples()));
    l.on_close_pass(close_ok(20, 2000));  // never proves dead space
    legs++;
  }
  assert(l.failure() == LearnFailure::NO_DEAD_SPACE);
}

void test_an_implausibly_short_range_fails() {
  StrokeLearner l{test_cfg()};
  l.on_open_leg(open_ok(2400));
  l.on_close_pass(close_ok(2300, 2400));
  assert(l.failure() == LearnFailure::SPAN_IMPLAUSIBLE);
}

}  // namespace

int main(int argc, char **argv) {
  if (argc > 1)
    fixture_dir = argv[1];
  test_pin_onset_on_the_close_fixture();
  test_pin_onset_ignores_flat_travel();
  test_pin_onset_needs_a_sustained_step();
  test_soft_seat_is_found_before_the_count_ceiling();
  test_pin_ramp_is_not_a_seat();
  test_seat_rise_ignores_a_dip_in_the_pin_ramp();
  test_seat_rise_arms_by_distance_without_a_bump();
  test_seat_rise_scales_with_the_pin_load();
  test_happy_path_learns_the_median_range();
  test_starting_on_the_pin_grows_the_open_leg();
  test_no_dead_space_within_the_open_limit_fails();
  test_open_stop_without_pin_is_pin_not_found();
  test_open_stop_caps_later_legs();
  test_disagreeing_samples_fail_after_the_extra_attempts();
  test_an_early_outlier_is_outlived();
  test_a_failed_seat_or_open_leg_aborts();
  test_an_implausibly_short_range_fails();
  test_firmware_defaults_fit_the_close_ceiling();
  std::printf("stroke_learning: all assertions passed\n");
  return 0;
}
