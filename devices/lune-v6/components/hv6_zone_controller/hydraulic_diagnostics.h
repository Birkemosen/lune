#pragma once

#include <cstdint>
#include <cmath>

namespace hv6::hydraulic_diagnostics {

enum class State : uint8_t { OK, WARNING, UNAVAILABLE };

struct Input {
  float average_valve_pct{NAN};
  bool room_temperature_rise_known{false};
  float room_temperature_rise_c_per_h{NAN};
  bool manifold_delta_known{false};
  float manifold_delta_c{NAN};
  bool manifold_starved_known{false};
  bool manifold_starved{false};
};

struct Alarm {
  State state{State::UNAVAILABLE};
  const char *id{""};
  const char *action{""};
};

inline Alarm evaluate(uint8_t index, const Input &in) {
  switch (index) {
    case 0:
      {
      const bool known = std::isfinite(in.average_valve_pct) && in.room_temperature_rise_known &&
                         std::isfinite(in.room_temperature_rise_c_per_h);
      return {known ? (in.average_valve_pct >= 80.0f && in.room_temperature_rise_c_per_h <= 0.0f ? State::WARNING : State::OK) : State::UNAVAILABLE,
              "high_valve_demand_no_temperature_rise", "Check flow, balancing, actuator travel, and the room-temperature source."};
    }
    case 1:
      return {in.manifold_delta_known && std::isfinite(in.manifold_delta_c)
                    ? (in.manifold_delta_c >= 10.0f ? State::WARNING : State::OK)
                    : State::UNAVAILABLE,
              "excessive_manifold_supply_return_delta", "Check secondary flow, air, filters, and valve balancing."};
    case 2:
      return {in.manifold_starved_known ? (in.manifold_starved ? State::WARNING : State::OK) : State::UNAVAILABLE,
              "manifold_persistently_starved", "Compare both manifolds using documented flow telemetry and rebalance if needed."};
    default:
      return {State::UNAVAILABLE, "unknown", "No local manifold diagnostic is defined for this index."};
  }
}

inline const char *state_str(State state) {
  switch (state) {
    case State::OK: return "ok";
    case State::WARNING: return "warning";
    default: return "unavailable";
  }
}

}  // namespace hv6::hydraulic_diagnostics
