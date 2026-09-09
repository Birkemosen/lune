#pragma once

#include "esphome/components/lv6_config_store/lv6_config_store.h"
#include "esphome/components/lv6_zone_controller/lv6_zone_controller.h"
#include "esphome/components/sensor/sensor.h"
#include "esphome/components/text_sensor/text_sensor.h"
#include "esphome/components/web_server_base/web_server_base.h"
#include "request_guard.h"
#include "smart_log.h"
#include "touch_auth.h"
#include "authority_lease.h"
#ifdef LV6_HAS_UPDATE
#include "esphome/components/update/update_entity.h"
#endif
#include "esphome/core/component.h"
#include "esphome/core/progmem.h"
#include <cstdint>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <freertos/task.h>
#include <string>
#include <vector>

#ifdef LV6_HAS_DASHBOARD_JS
extern const uint8_t LV6_DASHBOARD_JS_DATA[] PROGMEM;
extern const size_t LV6_DASHBOARD_JS_SIZE;
#endif

namespace lv6 {
class Lv6BleTimeBeacon;
}
namespace esphome {
namespace nimble_hub {
class NimbleHub;
}
}

namespace esphome {
namespace lv6_dashboard {

static constexpr size_t SNAPSHOT_TEXT_LEN = 64;

struct DashboardSnapshot {
  // --- scalar sensors ---
  uint32_t uptime_s;
  float    wifi_dbm;
  float    manifold_flow_c;
  float    manifold_return_c;
  float    zone_temp_c[6];
  float    zone_valve_pct[6];
  float    zone_preheat_c[6];
  float    motor_open_ripple[6];
  float    motor_close_ripple[6];
  float    motor_open_factor[6];
  float    motor_close_factor[6];
  float    probe_temp_c[8];

  // --- text sensors: fixed-size char arrays, null-terminated, pre-sanitized ---
  char firmware_version[SNAPSHOT_TEXT_LEN];
  char ip_address[SNAPSHOT_TEXT_LEN];
  char connected_ssid[SNAPSHOT_TEXT_LEN];
  char mac_address[SNAPSHOT_TEXT_LEN];
  char zone_state[6][SNAPSHOT_TEXT_LEN];
  char motor_fault[6][SNAPSHOT_TEXT_LEN];

  // --- live runtime flags ---
  bool drivers_enabled;

  // --- system diagnostics (FreeRTOS runtime stats + heap) ---
  float    cpu0_pct{NAN};        // Core 0 load % (loop/web/API/WiFi/zone task)
  float    cpu1_pct{NAN};        // Core 1 load % (valve/ripple/HTTP tasks)
  uint32_t free_internal_kb{0};       // free internal heap (KB)
  uint32_t free_dma_kb{0};            // free DMA-capable heap (KB)
  uint32_t largest_internal_kb{0};    // largest free internal block (KB)
  uint32_t min_internal_kb{0};        // min free internal heap since boot (KB)
  uint32_t free_psram_kb{0};          // free PSRAM (KB), 0 if none
  uint32_t largest_psram_kb{0};       // largest free PSRAM block (KB)
  // multi_heap_info (INTERNAL) — attribution aids beyond free/largest/min
  uint32_t internal_allocated_kb{0};  // total allocated bytes in INTERNAL heaps
  uint32_t internal_free_blocks{0};
  uint32_t internal_alloc_blocks{0};

  // --- BLE scan liveness (nimble_hub) ---
  bool     ble_hub_enabled{false};
  bool     ble_scanning{false};
  bool     ble_demanded{false};
  float    ble_ads_per_sec{0.0f};
  uint32_t ble_last_adv_age_ms{UINT32_MAX};

  // --- full config copies (POD structs, safe to memcpy) ---
  lv6::ZoneConfig   zones[lv6::NUM_ZONES];
  lv6::SystemConfig system;
  lv6::TempSource   zone_temp_source[lv6::NUM_ZONES];
  char              zone_ble_mac[lv6::NUM_ZONES][lv6::BLE_MAC_LEN];
  lv6::ProbeConfig  probes;
  lv6::MotorConfig  motor;
  lv6::ManifoldType manifold_type;
  bool              simple_preheat_enabled;
  bool              preheat_absorb_enabled;
  float             preheat_absorb_band_c;
  float             preheat_detect_delta_c;
  bool              preheat_absorbing;

  // --- Touch coordination authority (heat-source integration is external) ---
  lv6::AuthorityConfig authority;
  char              authority_state[32]{"no_publisher"};
  char              authority_reason[32]{"boot"};
  uint32_t          authority_lease_remaining_s{0};
  uint32_t          authority_generation{0};
  bool              authority_v6_write_allowed{false};
  float             zone_effective_setpoint_c[6]{};
  float             zone_coordinator_offset_c[6]{};
  uint32_t          zone_coordinator_remaining_s[6]{};
  float             min_zone_flow_pct{0.0f};   // legacy entity: secondary total-opening floor
  bool              minimum_flow_always{false}; // legacy entity: explicit commissioning only

  lv6::BalancingConfig balancing;       // retained for local secondary-flow commissioning settings

  bool     ble_clock_sync_enabled{true};
  uint16_t ble_clock_sync_interval_min{60};
  uint32_t ble_clock_sync_last_ok_s{0};
  char     ble_clock_sync_last_error[16]{};
  bool     ble_clock_sync_advertising{false};

  // --- managed firmware update (update: platform http_request) ---
  char firmware_update_current[SNAPSHOT_TEXT_LEN]{};
  char firmware_update_latest[SNAPSHOT_TEXT_LEN]{};
  char firmware_update_status[32]{"unknown"};  // unknown|no_update|available|installing
  bool firmware_update_available{false};
  char reset_reason[SNAPSHOT_TEXT_LEN]{};
};

struct DashboardAction {
  std::string key;
  std::string value_str;
  float num_val;
  int zone;
  bool has_num;
  bool has_str;
  bool zone_valid;
  uint8_t zi;
};

// -----------------------------------------------------------------------
// Zone-state history ring buffer
// Samples every HISTORY_INTERVAL_MS, keeps HISTORY_SLOTS entries (24 h).
// Each entry: uptime_s + one uint8_t per zone (ZoneDisplayState, 0xFF=unknown)
// + preheat-absorption flag + manifold flow/return (deci-°C) + mean demand %.
// Total RAM: HISTORY_SLOTS * sizeof(HistoryEntry) = 288 * 16 = 4608 bytes.
// -----------------------------------------------------------------------
static constexpr uint16_t HISTORY_SLOTS         = 288;       // 24 h at 5 min
static constexpr uint32_t HISTORY_INTERVAL_MS   = 5 * 60 * 1000UL;
static constexpr uint8_t  HISTORY_STATE_UNKNOWN = 0xFF;
static constexpr int16_t  HISTORY_TEMP_NONE     = INT16_MIN; ///< flow/return: no reading
static constexpr uint8_t  HISTORY_DEMAND_NONE   = 0xFF;      ///< demand: unknown

struct HistoryEntry {
  uint32_t uptime_s;
  uint8_t  zone_state[lv6::NUM_ZONES];
  uint8_t  absorbing;   ///< 1 if preheat absorption was active at sample time, else 0
  int16_t  flow_dc;     ///< manifold flow temp ×10 (deci-°C), HISTORY_TEMP_NONE = no reading
  int16_t  return_dc;   ///< manifold return temp ×10 (deci-°C), HISTORY_TEMP_NONE = no reading
  uint8_t  demand_pct;  ///< mean open-valve % over zones with a reading, HISTORY_DEMAND_NONE = unknown
};

// -----------------------------------------------------------------------
// Device logs
// LogLine and the dual live/smart PSRAM rings live in smart_log.h. The live
// scratch backs GET /api/hv6/v1/logs?since=<seq>; the smart FIFO backs
// GET /api/hv6/v1/logs/download. Both are RAM-only; lost on reboot.
// -----------------------------------------------------------------------

#if defined(CONFIG_HEAP_TRACING_STANDALONE) || defined(CONFIG_HEAP_TRACING)
// TEMPORARY — remove with packages/debug/heap-tracing.yaml after investigation.
// Idempotent; safe from early on_boot (priority 900) and again from setup().
void start_heap_tracing_early();
#endif

class LV6Dashboard : public Component, public AsyncWebHandler {
 public:
  void setup() override;
  void loop() override;
  float get_setup_priority() const override { return setup_priority::WIFI - 1.0f; }
  ~LV6Dashboard() override;

  void set_web_server_base(web_server_base::WebServerBase *b) { this->base_ = b; }
  void set_zone_controller(lv6::Lv6ZoneController *controller) { this->zone_controller_ = controller; }
  void set_valve_controller(lv6::Lv6ValveController *ctrl) { this->valve_controller_ = ctrl; }
  void set_config_store(lv6::Lv6ConfigStore *store) { this->config_store_ = store; }
  void set_ble_time_beacon(lv6::Lv6BleTimeBeacon *beacon) { this->ble_time_beacon_ = beacon; }
  void set_nimble_hub(nimble_hub::NimbleHub *hub) { this->nimble_hub_ = hub; }
  void set_wifi_signal_sensor(sensor::Sensor *sensor) { this->wifi_signal_sensor_ = sensor; }
  void set_manifold_flow_sensor(sensor::Sensor *s) { this->manifold_flow_sensor_ = s; }
  void set_manifold_return_sensor(sensor::Sensor *s) { this->manifold_return_sensor_ = s; }
  void set_zone_temp_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->zone_temp_sensors_[index] = s;
  }
  void set_zone_valve_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->zone_valve_sensors_[index] = s;
  }
  void set_zone_preheat_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->zone_preheat_sensors_[index] = s;
  }
  void set_motor_open_ripple_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_open_ripple_sensors_[index] = s;
  }
  void set_motor_close_ripple_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_close_ripple_sensors_[index] = s;
  }
  void set_motor_open_factor_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_open_factor_sensors_[index] = s;
  }
  void set_motor_close_factor_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_close_factor_sensors_[index] = s;
  }
  void set_probe_temp_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 8) this->probe_temp_sensors_[index] = s;
  }
  void set_firmware_version_text(text_sensor::TextSensor *text) { this->firmware_version_text_ = text; }
  void set_ip_address_text(text_sensor::TextSensor *text) { this->ip_address_text_ = text; }
  void set_connected_ssid_text(text_sensor::TextSensor *text) { this->connected_ssid_text_ = text; }
  void set_mac_address_text(text_sensor::TextSensor *text) { this->mac_address_text_ = text; }
  void set_zone_state_sensor(uint8_t index, text_sensor::TextSensor *s) {
    if (index < 6) this->zone_state_sensors_[index] = s;
  }
  void set_motor_fault_sensor(uint8_t index, text_sensor::TextSensor *s) {
    if (index < 6) this->motor_fault_sensors_[index] = s;
  }
  void set_reset_reason_text(text_sensor::TextSensor *t) { this->reset_reason_text_ = t; }
#ifdef LV6_HAS_UPDATE
  void set_firmware_update(update::UpdateEntity *u) { this->firmware_update_ = u; }
#endif

  bool canHandle(AsyncWebServerRequest *request) const override;
  void handleRequest(AsyncWebServerRequest *request) override;
  bool isRequestHandlerTrivial() const override { return false; }

 protected:
  void handle_root_(AsyncWebServerRequest *request);
  void handle_js_(AsyncWebServerRequest *request);
  void send_text_(AsyncWebServerRequest *request, int code, const char *content_type,
                  const char *body, bool cors = false, const char *cache_control = nullptr);
  void send_gzip_chunked_(AsyncWebServerRequest *request, const char *content_type,
                          const uint8_t *data, size_t length, const char *cache_control);
  void handle_state_(AsyncWebServerRequest *request);
  void handle_revision_(AsyncWebServerRequest *request);
  void handle_overview_(AsyncWebServerRequest *request);
  void handle_zones_(AsyncWebServerRequest *request);
  void handle_zone_(AsyncWebServerRequest *request, uint8_t zone);
  void handle_settings_(AsyncWebServerRequest *request);
  void handle_diagnostics_(AsyncWebServerRequest *request);
  void handle_motor_trace_(AsyncWebServerRequest *request);
  void handle_events_(AsyncWebServerRequest *request);
  void handle_history_(AsyncWebServerRequest *request);
  void handle_logs_(AsyncWebServerRequest *request);
  void handle_logs_download_(AsyncWebServerRequest *request);
  void handle_settings_export_(AsyncWebServerRequest *request);
  void handle_settings_import_(AsyncWebServerRequest *request, const char *body);
  void handle_v1_(AsyncWebServerRequest *request, const char *path);
  void handle_ble_scan_(AsyncWebServerRequest *request);
  void handle_authority_lease_(AsyncWebServerRequest *request, const char *body);
  void handle_authority_proposal_(AsyncWebServerRequest *request, const char *body);
  void handle_authority_proposal_approval_(AsyncWebServerRequest *request);
  void handle_authority_revoke_(AsyncWebServerRequest *request);
  void send_v1_(AsyncWebServerRequest *request, int code, const char *err_code = nullptr,
                const char *err_message = nullptr);
  bool enqueue_action_(const DashboardAction &act);
  /// Same local-credential + CSRF gate the generic write path applies. Sends the
  /// 403 itself and returns false when the request must be refused.
  bool authorize_write_(AsyncWebServerRequest *request);
  /// Park the H-bridges before an OTA write: disable the drivers and wait for
  /// any in-flight stroke or calibration to finish, so a reboot mid-flash can
  /// never leave a motor energised.
  void prepare_motors_for_ota_();
  void dispatch_set_(const DashboardAction &act);
  void expire_coordinator_commands_();
  void sample_history_();

  web_server_base::WebServerBase *base_{nullptr};
  lv6::Lv6ZoneController *zone_controller_{nullptr};
  lv6::Lv6ValveController *valve_controller_{nullptr};
  lv6::Lv6ConfigStore *config_store_{nullptr};
  lv6::Lv6BleTimeBeacon *ble_time_beacon_{nullptr};
  nimble_hub::NimbleHub *nimble_hub_{nullptr};
  lv6_authority::Lease authority_{};
  char authority_proposal_installation_id_[32]{};
  char authority_proposal_coordinator_id_[32]{};
  char authority_proposal_shared_key_[64]{};
  char authority_proposal_name_[32]{};
  char authority_proposal_site_[48]{};
  uint32_t authority_proposal_expires_at_ms_{0};
  sensor::Sensor *wifi_signal_sensor_{nullptr};
  sensor::Sensor *manifold_flow_sensor_{nullptr};
  sensor::Sensor *manifold_return_sensor_{nullptr};
  sensor::Sensor *zone_temp_sensors_[6]{};
  sensor::Sensor *zone_valve_sensors_[6]{};
  sensor::Sensor *zone_preheat_sensors_[6]{};
  sensor::Sensor *motor_open_ripple_sensors_[6]{};
  sensor::Sensor *motor_close_ripple_sensors_[6]{};
  sensor::Sensor *motor_open_factor_sensors_[6]{};
  sensor::Sensor *motor_close_factor_sensors_[6]{};
  sensor::Sensor *probe_temp_sensors_[8]{};
  text_sensor::TextSensor *firmware_version_text_{nullptr};
  text_sensor::TextSensor *ip_address_text_{nullptr};
  text_sensor::TextSensor *connected_ssid_text_{nullptr};
  text_sensor::TextSensor *mac_address_text_{nullptr};
  text_sensor::TextSensor *zone_state_sensors_[6]{};
  text_sensor::TextSensor *motor_fault_sensors_[6]{};
  text_sensor::TextSensor *reset_reason_text_{nullptr};
#ifdef LV6_HAS_UPDATE
  update::UpdateEntity *firmware_update_{nullptr};
#endif

  SemaphoreHandle_t action_lock_{nullptr};
  std::vector<DashboardAction> action_queue_;
  request_guard::Guard<24> request_guard_{};
  uint32_t data_revision_{1};  // runtime-only; resets on boot alongside boot identity
  uint32_t write_rate_window_ms_{0};
  uint8_t write_rate_count_{0};
  uint32_t coordinator_command_expires_at_ms_[lv6::NUM_ZONES]{};
  float coordinator_command_offsets_c_[lv6::NUM_ZONES]{};

  SemaphoreHandle_t snapshot_lock_{nullptr};
  DashboardSnapshot snapshot_{};
  // LoopTask-only assembly buffer. Keep it separate from state_snap_buf_,
  // which HTTP handlers use while holding snapshot_lock_.
  DashboardSnapshot update_snap_buf_{};
  DashboardSnapshot state_snap_buf_;
  // Shared JSON scratch for HTTP handlers. Sized for the v1 zones response
  // (two names + forecast metadata for all six valves); truncation there makes
  // Touch reject the response and fall back to generated legacy names.
  // Allocated from PSRAM in setup() (INTERNAL fallback). Safe as a single shared
  // buffer because ESP-IDF httpd is single-threaded (one worker) — see also the
  // static BleSensorSeen buffer in handle_ble_scan_().
  static constexpr size_t JSON_BUF_SIZE = 8192;
  char *json_buf_{nullptr};
  uint32_t snapshot_last_ms_{0};
  bool snapshot_ready_{false};
  static constexpr uint32_t SNAPSHOT_INTERVAL_MS = 1000;
  void update_snapshot_();

  // --- FreeRTOS per-core CPU load sampling (protected by runtime-stats sdkconfig) ---
  static constexpr uint32_t CPU_SAMPLE_INTERVAL_MS = 2000;
  uint32_t cpu_last_sample_ms_{0};
  uint32_t cpu_last_total_{0};
  uint32_t cpu_last_idle0_{0};
  uint32_t cpu_last_idle1_{0};
  float cpu0_pct_{NAN};
  float cpu1_pct_{NAN};
  std::vector<TaskStatus_t> task_status_buf_;  // reused across samples (no per-call alloc)
  // Sample per-core load from the IDLE-task runtime counters (called from loop()).
  void sample_cpu_load_();
  // Log FreeRTOS per-task CPU%/stack headroom plus heap_caps / multi_heap_info
  // for INTERNAL, DMA, and SPIRAM. Triggered by dump_task_stats (dashboard button
  // or POST /api/hv6/v1/commands). Does not enable heap tracing by default —
  // see packages/board/esp32-s3.yaml for an optional debug build.
  void dump_task_stats_();
  // multi_heap_info + heap_caps_print_heap_info for one capability mask.
  void dump_heap_cap_(const char *label, uint32_t caps) const;

  // History ring buffer (protected by history_lock_)
  SemaphoreHandle_t history_lock_{nullptr};
  HistoryEntry history_ring_[HISTORY_SLOTS]{};
  uint16_t history_head_{0};
  uint16_t history_count_{0};
  uint32_t history_last_sample_ms_{0};

  // Device logs (see smart_log.h). The writer is the ESPHome logger callback on
  // arbitrary tasks; it takes the ring lock non-blocking and drops on contention
  // so logging is never stalled. on_log_static_ is the C trampoline.
  static void on_log_static_(void *self, uint8_t level, const char *tag,
                             const char *message, size_t message_len);
  void on_log_(uint8_t level, const char *tag, const char *message, size_t message_len);
  SmartLogBuffer logs_{};
};

}  // namespace lv6_dashboard
}  // namespace esphome
