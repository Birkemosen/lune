#pragma once

#include "coordinator_model.h"
#include "esphome/core/component.h"
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <freertos/task.h>
#include <cstddef>
#include <cstdint>

namespace esphome {
namespace lune_touch_coordinator {

class LuneTouchCoordinator : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }
  void setup() override;
  void loop() override;
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
  bool take_state_lock_(uint32_t timeout_ms = 100) const;
  void give_state_lock_() const;
  static void poll_task_func_(void *arg);
  void poll_task_();
  void poll_once_();
  bool poll_node_zones_(size_t node_index, const ::lune_touch::PairedNode &node, uint32_t now_ms);
  bool fetch_json_(const char *url, char *body, size_t body_capacity, int *status_code);
  bool post_json_(const char *url, char *body, size_t body_capacity, int *status_code);
  bool ingest_v6_zones_(size_t node_index, const char *body, uint32_t now_ms);
  bool fetch_open_meteo_(float latitude, float longitude, char *error, size_t error_len,
                         uint8_t *hours_count, float *min_temp_c, float *max_wind_ms,
                         float *peak_wind_dir_deg, float *max_solar_wm2);
  bool send_v6_setpoint_command_(const ::lune_touch::PairedNode &node, uint8_t zone_index,
                                 const ::lune_touch::CommandRecord &request,
                                 uint32_t ttl_s, ::lune_touch::CommandRecord *result);
  void url_encode_(const char *src, char *out, size_t out_len) const;

  static constexpr uint32_t POLL_INTERVAL_MS = 15000;
  static constexpr uint32_t POLL_BOOT_DELAY_MS = 9000;
  static constexpr uint32_t HTTP_TIMEOUT_MS = 2500;
  static constexpr uint32_t POLL_STACK_SIZE = 12288;
  static constexpr UBaseType_t POLL_PRIORITY = 2;
  static constexpr BaseType_t POLL_CORE = 0;

  uint32_t node_stale_after_ms_{300000};
  mutable SemaphoreHandle_t state_lock_{nullptr};
  TaskHandle_t poll_task_handle_{nullptr};
  uint32_t last_ledger_expire_ms_{0};
  uint32_t last_poll_ms_{0};
  uint32_t poll_success_count_{0};
  uint32_t poll_fail_count_{0};
  char last_poll_error_[80]{};
  ::lune_touch::HouseModel model_{};
  ::lune_touch::CommandLedger ledger_{};
  float forecast_latitude_{0.0f};
  float forecast_longitude_{0.0f};
  char forecast_location_mode_[16]{"manual"};
  uint32_t forecast_last_fetch_ms_{0};
  char forecast_status_[16]{"stale"};
  char forecast_last_error_[96]{};
  uint8_t forecast_hours_count_{0};
  float forecast_min_temp_c_{0.0f};
  float forecast_max_wind_ms_{0.0f};
  float forecast_peak_wind_dir_deg_{0.0f};
  float forecast_max_solar_wm2_{0.0f};
};

}  // namespace lune_touch_coordinator
}  // namespace esphome
