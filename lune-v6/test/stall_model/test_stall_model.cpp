// Host tests for stall_model.h, replayed against the two measured Motor Lab
// fixtures.  The close fixture is the run that destroyed an actuator; the open
// fixture was captured on the same, already-broken unit.
//
//   make test-stall-model

#include "stall_model.h"

#include "safety_limits.h"

#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>
#include <vector>

using namespace lv6;

namespace {

struct Sample {
  uint32_t t_ms;
  float count;
  float current_ma;
};

std::vector<Sample> load_fixture(const std::string &path) {
  std::vector<Sample> rows;
  FILE *f = std::fopen(path.c_str(), "r");
  if (f == nullptr) {
    std::fprintf(stderr, "cannot open fixture %s\n", path.c_str());
    std::exit(1);
  }
  char line[2048];
  if (std::fgets(line, sizeof line, f) == nullptr) {  // header
    std::fclose(f);
    return rows;
  }
  while (std::fgets(line, sizeof line, f) != nullptr) {
    char *s = line;
    char *a = strsep(&s, ",");
    char *b = strsep(&s, ",");
    char *c = strsep(&s, ",");
    if (a == nullptr || b == nullptr || c == nullptr)
      continue;
    rows.push_back({static_cast<uint32_t>(std::atof(a)),
                    static_cast<float>(std::atof(b)),
                    static_cast<float>(std::atof(c))});
  }
  std::fclose(f);
  return rows;
}

/// Replay a fixture and return the time at which the detector latched, or 0.
uint32_t first_spurious_ms(const std::vector<Sample> &rows, float current_offset_ma,
                           float current_gain) {
  SpuriousCountDetector det{};
  det.reset();
  uint32_t first = 0;
  for (size_t i = 1; i < rows.size(); i++) {
    const float dt_s = static_cast<float>(rows[i].t_ms - rows[i - 1].t_ms) / 1000.0f;
    if (dt_s <= 0.0f)
      continue;
    const float cadence = (rows[i].count - rows[i - 1].count) / dt_s;
    const float cur = rows[i].current_ma * current_gain + current_offset_ma;
    det.observe(rows[i].t_ms, cur, cadence);
    if (det.spurious() && first == 0)
      first = rows[i].t_ms;
  }
  return first;
}

std::string fixture_dir = "test/fixtures";

// ---------------------------------------------------------------------------

void test_close_fixture_detects_arcing_counts() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-close.csv");
  assert(rows.size() > 100);

  const uint32_t first = first_spurious_ms(rows, 0.0f, 1.0f);
  assert(first != 0 && "arcing counts must be detected on the destruction trace");

  // Must stay silent through free travel, the pin-contact step and the whole
  // 17.5 s pressure plateau - those are legitimate motion under load.
  assert(first > 44000 && "must not fire during legitimate loaded travel");
  // ...and must have caught it well before the trace ends.
  assert(first < 50000);
}

void test_open_fixture_never_fires() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-open.csv");
  assert(rows.size() > 50);
  // Decoupled actuator: flat current, constant cadence, no load anywhere.
  assert(first_spurious_ms(rows, 0.0f, 1.0f) == 0);
}

void test_offset_immunity() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-close.csv");
  const uint32_t base = first_spurious_ms(rows, 0.0f, 1.0f);
  // Our sense is rail-total, so every reading carries a fixed offset from the
  // driver quiescent current.  The verdict must not move at all.
  for (float off : {2.0f, 8.0f, 20.0f}) {
    const uint32_t shifted = first_spurious_ms(rows, off, 1.0f);
    assert(shifted == base && "detector must be offset-immune");
  }
}

void test_gain_tolerance() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-close.csv");
  const uint32_t base = first_spurious_ms(rows, 0.0f, 1.0f);
  // Shunt + INA gain tolerance, swept far wider than the real +/-5% so the
  // verdict is known to sit well away from a cliff.  The tuning that made this
  // pass is min_cadence_rise_hz = 12: at 6 Hz a +10% gain error dragged the
  // verdict back to the pin-contact step at 22.75 s, i.e. into legitimate
  // travel, because cadence noise there is transiently positive.
  for (float g : {0.8f, 0.9f, 1.1f, 1.2f, 1.3f}) {
    const uint32_t scaled = first_spurious_ms(rows, 0.0f, g);
    assert(scaled != 0 && "gain error must not lose the verdict");
    assert(scaled > 44000 && "gain error must not drag it into legitimate travel");
    assert(scaled == base && "verdict should be gain-insensitive in this band");
  }
}

void test_predicted_speed_fraction() {
  // Free running.
  assert(std::fabs(predicted_speed_fraction(24.0f, 24.0f, 100.0f) - 1.0f) < 1e-4f);
  // Stalled.
  assert(std::fabs(predicted_speed_fraction(100.0f, 24.0f, 100.0f)) < 1e-4f);
  // Halfway.
  assert(std::fabs(predicted_speed_fraction(62.0f, 24.0f, 100.0f) - 0.5f) < 1e-3f);
  // Degenerate span must not manufacture a stall.
  assert(std::fabs(predicted_speed_fraction(50.0f, 60.0f, 60.0f) - 1.0f) < 1e-4f);
  // Clamped outside the span.
  assert(predicted_speed_fraction(150.0f, 24.0f, 100.0f) == 0.0f);
}

void test_rotor_stall_requires_a_learned_stall_current() {
  // No learned endpoint current: must refuse to guess.
  assert(!rotor_is_stalled(90.0f, 24.0f, 0.0f, 0.30f));
  assert(!rotor_is_stalled(90.0f, 24.0f, -1.0f, 0.30f));
  // With one: 90 mA of a 24..100 span is 13% of free speed.
  assert(rotor_is_stalled(90.0f, 24.0f, 100.0f, 0.30f));
  assert(!rotor_is_stalled(40.0f, 24.0f, 100.0f, 0.30f));
}

void test_latches_for_the_rest_of_the_move() {
  SpuriousCountDetector det{};
  det.reset();
  // Drive it into the latch with a rising/rising pair...
  for (uint32_t t = 0; t <= 8000; t += 250)
    det.observe(t, 20.0f + t / 400.0f, 30.0f + t / 150.0f);
  assert(det.spurious());
  // ...then feed it perfectly healthy data. It must not un-latch: the counter
  // has already been shown to be producing arc edges this stroke.
  for (uint32_t t = 8250; t <= 16000; t += 250)
    det.observe(t, 24.0f, 78.0f);
  assert(det.spurious());
  det.reset();
  assert(!det.spurious());
}

/// Replay a fixture through the closing trailing-step detector and return the
/// time it tripped, or 0.
uint32_t first_close_step_ms(const std::vector<Sample> &rows, float offset_ma,
                             const TrailingStepConfig &cfg) {
  TrailingStepDetector det{cfg};
  det.reset();
  for (const auto &r : rows) {
    det.observe(r.t_ms, r.current_ma + offset_ma);
    if (det.tripped())
      return r.t_ms;
  }
  return 0;
}

void test_close_step_fires_before_the_mechanical_wall() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-close.csv");
  const TrailingStepConfig cfg{};
  const uint32_t t = first_close_step_ms(rows, 0.0f, cfg);

  assert(t != 0 && "the closing endstop ramp must be detected at all");
  // 40 s of close travel puts the plunger at the housing exit. Detection has to
  // land before that, with margin.
  assert(t < 40000 && "must fire before the 40 s housing-exit wall");
  // ...and must not fire in free travel or during the 17.5 s pressure plateau.
  // The pin-contact ramp peaks at a 3.5 mA/2 s rise but only for one sample;
  // sustain is what separates it from the endstop ramp.
  assert(t > 36000 && "must not fire on the pin-contact ramp or the plateau");
}

void test_close_step_is_offset_immune() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-close.csv");
  const TrailingStepConfig cfg{};
  const uint32_t base = first_close_step_ms(rows, 0.0f, cfg);
  // Rail-total sense: a fixed offset must difference away exactly.
  for (float off : {2.0f, 8.0f, 25.0f})
    assert(first_close_step_ms(rows, off, cfg) == base);
}

void test_close_step_ignores_the_decoupled_open_trace() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-open.csv");
  const TrailingStepConfig cfg{};
  // Flat 24.4 mA for 40 s: nothing to detect, and detecting anything would be a
  // false endpoint on a broken actuator.
  assert(first_close_step_ms(rows, 0.0f, cfg) == 0);
}

void test_close_step_sustain_is_the_discriminator() {
  const auto rows = load_fixture(fixture_dir + "/motor-lab-z1-close.csv");
  TrailingStepConfig quick{};
  quick.sustain_ms = 0;  // debounce removed
  const uint32_t t_quick = first_close_step_ms(rows, 0.0f, quick);
  // Without sustain the isolated pin-contact sample trips it ~20 s early, in
  // the middle of legitimate travel. This is the regression this guards.
  assert(t_quick != 0 && t_quick < 36000);

  const TrailingStepConfig cfg{};
  assert(first_close_step_ms(rows, 0.0f, cfg) > t_quick);
}

}  // namespace

int main(int argc, char **argv) {
  if (argc > 1)
    fixture_dir = argv[1];

  test_close_fixture_detects_arcing_counts();
  test_open_fixture_never_fires();
  test_offset_immunity();
  test_gain_tolerance();
  test_predicted_speed_fraction();
  test_rotor_stall_requires_a_learned_stall_current();
  test_latches_for_the_rest_of_the_move();

  test_close_step_fires_before_the_mechanical_wall();
  test_close_step_is_offset_immune();
  test_close_step_ignores_the_decoupled_open_trace();
  test_close_step_sustain_is_the_discriminator();

  std::printf("stall_model: all assertions passed\n");
  return 0;
}
