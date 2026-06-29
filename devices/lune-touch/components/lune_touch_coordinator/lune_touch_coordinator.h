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

  bool add_node(const char *node_id, const char *hostname, const char *fallback_ip,
                char *response, size_t capacity);
  bool remove_node(const char *node_id, char *response, size_t capacity);
  bool bind_room(const char *room_id, const char *room_name, size_t node_index, size_t zone_index,
                 char *response, size_t capacity);
  bool queue_setpoint_command(const char *room_id, float requested_offset_c, uint32_t ttl_s,
                              const char *reason, char *response, size_t capacity);
  bool set_forecast_location(float latitude, float longitude, const char *mode,
                             char *response, size_t capacity);
  bool request_forecast_fetch(char *response, size_t capacity);

 protected:
  bool load_registry_();
  void save_registry_();
  void load_ledger_();
  void save_ledger_();
  void load_forecast_settings_();
  void save_forecast_settings_();
  void seed_mock_house_();
  void make_node_id_(const char *hostname, const char *fallback_ip, char *out, size_t out_len) const;

  uint32_t node_stale_after_ms_{300000};
  ::lune_touch::HouseModel model_{};
  ::lune_touch::CommandLedger ledger_{};
  float forecast_latitude_{0.0f};
  float forecast_longitude_{0.0f};
  char forecast_location_mode_[16]{"manual"};
  uint32_t forecast_last_fetch_ms_{0};
};

}  // namespace lune_touch_coordinator
}  // namespace esphome
