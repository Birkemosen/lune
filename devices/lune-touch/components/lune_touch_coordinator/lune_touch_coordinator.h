#pragma once

#include "coordinator_model.h"
#include "esphome/core/component.h"
#include <cstddef>
#include <cstdint>

namespace esphome {
namespace lune_touch_coordinator {

class LuneTouchCoordinator : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }
  void setup() override;
  void dump_config() override;

  void set_node_stale_after_ms(uint32_t stale_after_ms) {
    node_stale_after_ms_ = stale_after_ms;
  }

  void write_overview_json(char *buffer, size_t capacity) const;
  void write_nodes_json(char *buffer, size_t capacity) const;
  void write_zones_json(char *buffer, size_t capacity) const;
  void write_forecast_json(char *buffer, size_t capacity) const;
  void write_commands_json(char *buffer, size_t capacity) const;
  void write_diagnostics_json(char *buffer, size_t capacity) const;

 protected:
  void seed_mock_house_();

  uint32_t node_stale_after_ms_{300000};
  ::lune_touch::HouseModel model_{};
  ::lune_touch::CommandLedger ledger_{};
};

}  // namespace lune_touch_coordinator
}  // namespace esphome
