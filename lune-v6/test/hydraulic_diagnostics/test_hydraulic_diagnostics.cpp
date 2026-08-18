#include <cassert>
#include "../../components/lv6_zone_controller/hydraulic_diagnostics.h"

int main() {
  using namespace lv6::hydraulic_diagnostics;
  Input input{};
  assert(evaluate(0, input).state == State::UNAVAILABLE);
  assert(evaluate(3, input).state == State::UNAVAILABLE);
  input.average_valve_pct = 90.0f;
  input.room_temperature_rise_known = true;
  input.room_temperature_rise_c_per_h = 0.0f;
  assert(evaluate(0, input).state == State::WARNING);
  input.manifold_delta_known = true;
  input.manifold_delta_c = 11.0f;
  assert(evaluate(1, input).state == State::WARNING);
  input.manifold_starved_known = true;
  input.manifold_starved = true;
  assert(evaluate(2, input).state == State::WARNING);
  return 0;
}
