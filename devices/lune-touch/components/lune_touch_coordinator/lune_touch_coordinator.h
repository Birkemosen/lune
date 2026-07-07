#pragma once

#include "coordinator_model.h"
#include "esphome/components/time/real_time_clock.h"
#include "esphome/core/component.h"
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <freertos/task.h>
#include <cstddef>
#include <cstdint>
#include <string>

namespace esphome {
namespace lune_touch_coordinator {

struct ForecastHourState {
  float temp_c{0.0f};
  float wind_speed_ms{0.0f};
  float wind_dir_deg{0.0f};
  float shortwave_wm2{0.0f};
};

struct ForecastDecisionState {
  char room_id[32]{};
  char room_name[48]{};
  uint8_t node_index{0};
  uint8_t zone_index{0};
  float comfort_setpoint_c{21.0f};
  uint8_t priority{1};
  float offset_c{0.0f};
  float peak_load{0.0f};
  int8_t peak_in_h{-1};
  uint8_t configured_thermal_lead_h{4};
  uint8_t learned_thermal_lead_h{0};
  uint8_t active_thermal_lead_h{4};
  bool active{false};
};

struct ForecastDispatchSummary {
  uint8_t active{0};
  uint8_t sent{0};
  uint8_t skipped{0};
  uint8_t failed{0};
  uint8_t blocked_stale{0};
  uint8_t blocked_unreachable{0};
  uint8_t blocked_untrusted{0};
};

struct NodeTelemetryState {
  float flow_c{0.0f};
  float return_c{0.0f};
  float avg_valve_pct{0.0f};
  float motor_current_ma{0.0f};
  uint8_t active_zones{0};
  bool has_flow{false};
  bool has_return{false};
  bool has_avg_valve{false};
  bool has_motor_current{false};
  bool drivers_enabled{false};
  bool has_drivers_enabled{false};
  bool motor_fault{false};
  bool has_motor_fault{false};
};

struct EventRecord {
  uint32_t ts_ms{0};
  char level[8]{};
  char source[20]{};
  char message[96]{};
};

class LuneTouchCoordinator : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }
  void setup() override;
  void loop() override;
  void dump_config() override;

  void set_node_stale_after_ms(uint32_t stale_after_ms) {
    node_stale_after_ms_ = stale_after_ms;
  }
  void set_time(esphome::time::RealTimeClock *time) { time_ = time; }

  void write_overview_json(char *buffer, size_t capacity) const;
  void write_nodes_json(char *buffer, size_t capacity) const;
  void write_node_scan_json(char *buffer, size_t capacity) const;
  void write_zones_json(char *buffer, size_t capacity) const;
  void write_strategy_json(char *buffer, size_t capacity) const;
  void write_forecast_json(char *buffer, size_t capacity) const;
  void write_commands_json(char *buffer, size_t capacity) const;
  void write_diagnostics_json(char *buffer, size_t capacity) const;
  void write_settings_json(char *buffer, size_t capacity) const;
  void write_events_json(char *buffer, size_t capacity) const;
  std::string house_summary_text() const;
  std::string zone_line_text(uint8_t row) const;
  std::string forecast_summary_text() const;
  std::string forecast_decision_text(uint8_t row) const;
  std::string command_summary_text() const;

  bool add_node(const char *node_id, const char *hostname, const char *fallback_ip,
                const char *pairing_fingerprint, char *response, size_t capacity);
  bool scan_node_candidate(const char *hostname, const char *fallback_ip,
                           char *response, size_t capacity);
  bool set_node_trust(const char *node_id, ::lune_touch::NodeTrust trust,
                      const char *confirmation, char *response, size_t capacity);
  bool remove_node(const char *node_id, char *response, size_t capacity);
  bool reset_registry(const char *confirmation, char *response, size_t capacity);
  bool bind_room(const char *room_id, const char *room_name, size_t node_index, size_t zone_index,
                 char *response, size_t capacity);
  bool set_zone_comfort(const char *room_id, float comfort_setpoint_c, uint8_t priority,
                        float comfort_bias_c, char *response, size_t capacity);
  bool set_zone_schedule(const char *room_id, bool enabled, uint8_t day_mask,
                         uint16_t start_min, uint16_t end_min, float setpoint_c,
                         char *response, size_t capacity);
  bool set_zone_forecast_profile(const char *room_id, uint8_t exterior_walls,
                                 float wind_exposure, float solar_gain,
                                 uint8_t thermal_lead_h, float max_offset_c,
                                 char *response, size_t capacity);
  bool queue_setpoint_command(const char *room_id, float requested_offset_c, uint32_t ttl_s,
                              const char *reason, char *response, size_t capacity);
  bool request_motor_action(const char *room_id, const char *action, const char *confirmation,
                            char *response, size_t capacity);
  bool set_forecast_location(float latitude, float longitude, const char *mode,
                             char *response, size_t capacity);
  bool request_forecast_fetch(char *response, size_t capacity);
  bool set_settings(const char *coordinator_name, const char *install_id,
                    const char *site_label, const char *install_mode,
                    bool has_asgard_enabled, bool asgard_enabled,
                    const char *asgard_mode,
                    char *response, size_t capacity);

 protected:
  bool load_registry_();
  void save_registry_();
  void load_ledger_();
  void save_ledger_();
  void load_forecast_settings_();
  void save_forecast_settings_();
  void load_forecast_cache_();
  void save_forecast_cache_();
  void clear_forecast_cache_();
  void load_settings_();
  void save_settings_();
  void seed_mock_house_();
  void make_node_id_(const char *hostname, const char *fallback_ip, char *out, size_t out_len) const;
  bool take_state_lock_(uint32_t timeout_ms = 100) const;
  void give_state_lock_() const;
  static void poll_task_func_(void *arg);
  void poll_task_();
  void poll_once_();
  bool perform_forecast_fetch_(char *response, size_t capacity);
  bool poll_node_overview_(size_t node_index, const ::lune_touch::PairedNode &node, uint32_t now_ms);
  bool poll_node_zones_(size_t node_index, const ::lune_touch::PairedNode &node, uint32_t now_ms);
  void note_node_poll_success_(size_t node_index, const char *host);
  void note_node_poll_failure_(size_t node_index, const char *reason);
  bool fetch_json_(const char *url, char *body, size_t body_capacity, int *status_code);
  bool post_json_(const char *url, const char *payload, char *body, size_t body_capacity, int *status_code);
  bool ingest_v6_zones_(size_t node_index, const char *body, uint32_t now_ms);
  bool ingest_v6_legacy_state_(size_t node_index, const ::lune_touch::PairedNode &node,
                               const char *body, uint32_t now_ms);
  bool fetch_open_meteo_(float latitude, float longitude, char *error, size_t error_len,
                         uint8_t *hours_count, float *min_temp_c, float *max_wind_ms,
                         float *peak_wind_dir_deg, float *max_solar_wm2,
                         ForecastHourState *hours_out, size_t hours_capacity);
  void recompute_forecast_decisions_();
  ForecastDispatchSummary dispatch_forecast_commands_();
  bool send_v6_setpoint_command_(const ::lune_touch::PairedNode &node, uint8_t zone_index,
                                 const ::lune_touch::CommandRecord &request,
                                 uint32_t ttl_s, ::lune_touch::CommandRecord *result,
                                 const char *preferred_host = nullptr);
  void url_encode_(const char *src, char *out, size_t out_len) const;
  void log_event_(const char *level, const char *source, const char *message);

  static constexpr uint32_t POLL_INTERVAL_MS = 15000;
  static constexpr uint32_t POLL_BOOT_DELAY_MS = 9000;
  static constexpr uint32_t HTTP_TIMEOUT_MS = 2500;
  static constexpr uint32_t POLL_STACK_SIZE = 16384;
  static constexpr UBaseType_t POLL_PRIORITY = 2;
  static constexpr BaseType_t POLL_CORE = 0;
  static constexpr uint32_t LEARNING_SAVE_INTERVAL_MS = 10UL * 60UL * 1000UL;
  static constexpr uint32_t FORECAST_COMMAND_TTL_S = 4500;
  static constexpr uint32_t FORECAST_COMMAND_DEDUPE_MS = 30UL * 60UL * 1000UL;
  static constexpr uint32_t FORECAST_AUTO_FETCH_INTERVAL_MS = 60UL * 60UL * 1000UL;
  static constexpr float FORECAST_COMMAND_EPSILON_C = 0.05f;
  static constexpr size_t EVENT_CAPACITY = 32;

  uint32_t node_stale_after_ms_{300000};
  esphome::time::RealTimeClock *time_{nullptr};
  mutable SemaphoreHandle_t state_lock_{nullptr};
  TaskHandle_t poll_task_handle_{nullptr};
  uint32_t last_ledger_expire_ms_{0};
  uint32_t last_learning_save_ms_{0};
  uint32_t last_poll_ms_{0};
  uint32_t poll_success_count_{0};
  uint32_t poll_fail_count_{0};
  bool learning_dirty_{false};
  char last_poll_error_[80]{};
  char node_last_success_host_[::lune_touch::MAX_NODES][64]{};
  char node_last_failure_[::lune_touch::MAX_NODES][80]{};
  NodeTelemetryState node_telemetry_[::lune_touch::MAX_NODES]{};
  EventRecord events_[EVENT_CAPACITY]{};
  size_t event_next_{0};
  size_t event_count_{0};
  ::lune_touch::HouseModel model_{};
  ::lune_touch::CommandLedger ledger_{};
  float forecast_latitude_{0.0f};
  float forecast_longitude_{0.0f};
  char forecast_location_mode_[16]{"manual"};
  char coordinator_name_[32]{"Lune Touch"};
  char install_id_[32]{"unassigned"};
  char site_label_[48]{"House"};
  char install_mode_[16]{"commissioning"};
  bool asgard_enabled_{true};
  char asgard_mode_[16]{"advisory"};
  uint32_t forecast_last_fetch_ms_{0};
  char forecast_status_[16]{"stale"};
  char forecast_last_error_[96]{};
  bool forecast_fetch_requested_{false};
  bool forecast_boot_refresh_pending_{false};
  bool forecast_cache_restored_{false};
  uint8_t forecast_hours_count_{0};
  ForecastHourState forecast_hours_[72]{};
  float forecast_min_temp_c_{0.0f};
  float forecast_max_wind_ms_{0.0f};
  float forecast_peak_wind_dir_deg_{0.0f};
  float forecast_max_solar_wm2_{0.0f};
  ForecastDecisionState forecast_decisions_[::lune_touch::MAX_HOUSE_ZONES]{};
  size_t forecast_decision_count_{0};
  ForecastDispatchSummary last_forecast_dispatch_{};
};

}  // namespace lune_touch_coordinator
}  // namespace esphome
