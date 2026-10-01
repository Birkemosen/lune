// =============================================================================
// LV6 Zone Controller — ESPHome Component Implementation
// =============================================================================
// Ported from lib/zone_controller/src/zone_controller.cpp
// Key changes:
//   - Reads temperatures from ESPHome sensor entities (not SensorManager)
//   - No WiFi connectivity tracking (ESPHome handles that)
//   - Control algorithms and hydraulic balancing preserved 1:1
// =============================================================================

#include "lv6_zone_controller.h"
#include "flow_allocator.h"
#include "control_mode_policy.h"
#include "preheat_absorb_logic.h"
#include "absorb_command_logic.h"
#include "preheat_policy.h"
#include "probe_mapping.h"
#include "thermal_model.h"
#include "../lv6_config_store/group_model.h"
#include "esphome/core/log.h"
#include "esp_timer.h"
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <ctime>
#include <strings.h>
#include <numeric>
#include <inttypes.h>

namespace lv6 {

static const char *const TAG = "hv6_zone_ctrl";
static constexpr float ALPHA_TOP = 10.8f;  // W/(m²·K) convective+radiative at floor

// =============================================================================
// ESPHome Lifecycle
// =============================================================================

void Lv6ZoneController::setup() {
  snapshot_mutex_ = xSemaphoreCreateMutex();
  if (snapshot_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create snapshot mutex");
    this->mark_failed();
    return;
  }

  helios_mutex_ = xSemaphoreCreateMutex();
  if (helios_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create helios mutex");
    this->mark_failed();
    return;
  }

  adj_queue_ = xQueueCreate(ADJ_QUEUE_LEN, sizeof(SetpointAdjustment));
  if (adj_queue_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create adjustment queue");
    this->mark_failed();
    return;
  }

  ble_seen_mutex_ = xSemaphoreCreateMutex();
  if (ble_seen_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create BLE seen mutex");
    this->mark_failed();
    return;
  }
  memset(ble_seen_.data(), 0, sizeof(ble_seen_));

  setpoint_offsets_.fill(0.0f);
  helios_cmds_.fill({});
  balance_factors_.fill(1.0f);
  last_valid_temp_ms_.fill(0);
  external_temp_last_ms_.fill(0);
  // Restore learned preheat advance from NVS so the device doesn't start from
  // zero after every reboot.
  if (config_store_) {
    for (uint8_t i = 0; i < NUM_ZONES; i++)
      preheat_advance_c_[i] = config_store_->get_zone_config(i).preheat_advance_c;
  } else {
    preheat_advance_c_.fill(0.0f);
  }
  preheat_episode_active_.fill(false);
  preheat_episode_min_temp_c_.fill(NAN);
  preheat_episode_max_temp_c_.fill(NAN);
  preheat_episode_setpoint_c_.fill(0.0f);
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    external_temperatures_[i] = NAN;

  // Always seed runtime setpoints from durable NVS (or ZoneConfig defaults).
  // Zero-initialized requested_setpoints_ used to be replaced with
  // FALLBACK_SETPOINT_C first, which then skipped the config-store copy because
  // 20 °C is already in-range — so every reboot ignored the user's setpoint.
  if (config_store_) {
    const auto &cfg = config_store_->get_config();
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      algorithms_[i].set_algorithm(cfg.zones[i].algorithm);
      algorithms_[i].set_pid_params(cfg.pid);
      float sp = cfg.zones[i].setpoint_c;
      if (sp < 5.0f || sp > 35.0f)
        sp = FALLBACK_SETPOINT_C;
      requested_setpoints_[i] = sp;
    }
  } else {
    requested_setpoints_.fill(FALLBACK_SETPOINT_C);
  }

  recalculate_balance_factors_();
  // The initial balance was calculated synchronously above.  Do not repeat it
  // from the newly-created task before setup() has yielded; that second pass
  // races the remaining ESPHome component setup and can leave the snapshot
  // mutex contended during the watchdog's boot window.
  balance_dirty_ = false;

  // Start zone control task
  BaseType_t ok = xTaskCreatePinnedToCore(
      task_func_, "hv6_zone", STACK_SIZE, this, PRIORITY, &task_handle_, CORE);
  if (ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create zone task");
    this->mark_failed();
    return;
  }

  ESP_LOGI(TAG, "Zone controller initialized (%" PRIu32 "ms cycle)", cycle_interval_ms_);
}

void Lv6ZoneController::dump_config() {
  ESP_LOGCONFIG(TAG, "LV6 Zone Controller:");
  ESP_LOGCONFIG(TAG, "  Cycle interval: %" PRIu32 "ms", cycle_interval_ms_);
  if (config_store_) {
    auto cfg = config_store_->get_config();
    ESP_LOGCONFIG(TAG, "  Flow probe: %d", cfg.probes.manifold_flow_probe + 1);
    ESP_LOGCONFIG(TAG, "  Return probe: %d", cfg.probes.manifold_return_probe + 1);
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      ESP_LOGCONFIG(TAG, "  Zone %d probe: %d", i + 1, cfg.probes.zone_return_probe[i] + 1);
    }
  }
  for (uint8_t i = 0; i < MAX_PROBES; i++) {
    ESP_LOGCONFIG(TAG, "  Probe %d: %s", i + 1, probe_sensors_[i] ? "sensor assigned" : "no sensor");
  }
}

// =============================================================================
// Public API (thread-safe)
// =============================================================================

ZoneSnapshot Lv6ZoneController::get_zone_snapshot(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return {};
  if (snapshot_mutex_ == nullptr)
    return snapshots_[zone];
  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  ZoneSnapshot copy = snapshots_[zone];
  xSemaphoreGive(snapshot_mutex_);
  return copy;
}

bool Lv6ZoneController::try_get_system_snapshot(SystemSnapshot *out, uint32_t timeout_ms) const {
  if (out == nullptr || snapshot_mutex_ == nullptr)
    return false;

  // Take the configuration snapshot before the zone snapshot lock.  The
  // config store has its own mutex; acquiring it while holding
  // snapshot_mutex_ creates a lock-order inversion with command/config paths
  // that already hold the config mutex and then publish a zone snapshot.
  const auto cfg = config_store_ ? config_store_->get_config() : DeviceConfig{};

  if (xSemaphoreTake(snapshot_mutex_, pdMS_TO_TICKS(timeout_ms)) != pdTRUE)
    return false;

  SystemSnapshot sys = {};
  float sum_valve = 0.0f;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    sys.zones[i] = snapshots_[i];
    sum_valve += snapshots_[i].valve_position_pct;
    if (cfg.zones[i].enabled && snapshots_[i].state != ZoneState::UNKNOWN)
      sys.active_zones++;
  }
  xSemaphoreGive(snapshot_mutex_);

  if (sys.active_zones > 0)
    sys.avg_valve_pct = sum_valve / static_cast<float>(sys.active_zones);

  sys.manifold_flow_temp_c = read_manifold_flow_();
  sys.manifold_return_temp_c = read_manifold_return_();
  sys.preheat_absorbing = preheat_absorb_active_.load();
  sys.heat_demand = heat_demand_;
  sys.control_mode = config_store_ ? config_store_->get_config().control.mode : HeatingProfile::HEAT_PUMP;
  sys.effective_control_mode = get_effective_control_mode();
  sys.control_mode_from_touch = touch_authority_active_.load(std::memory_order_acquire) &&
                                touch_control_mode_valid_.load(std::memory_order_acquire);
  sys.uptime_s = static_cast<uint32_t>(esp_timer_get_time() / 1000000);
  sys.free_heap = esp_get_free_heap_size();
  sys.cycle_count = cycle_count_;
  sys.controller_state = controller_state_;
  sys.system_condition_state = system_condition_state_;
  sys.wifi_connected = true;  // ESPHome manages WiFi

  *out = sys;
  return true;
}

SystemSnapshot Lv6ZoneController::get_system_snapshot() const {
  SystemSnapshot sys = {};

  if (try_get_system_snapshot(&sys))
    return sys;

  ESP_LOGW(TAG, "System snapshot skipped: snapshot mutex busy");
  sys.manifold_flow_temp_c = read_manifold_flow_();
  sys.manifold_return_temp_c = read_manifold_return_();
  sys.preheat_absorbing = preheat_absorb_active_.load();
  sys.uptime_s = static_cast<uint32_t>(esp_timer_get_time() / 1000000);
  sys.free_heap = esp_get_free_heap_size();
  sys.cycle_count = cycle_count_;
  sys.controller_state = controller_state_;
  sys.system_condition_state = system_condition_state_;
  sys.wifi_connected = true;

  return sys;
}

float Lv6ZoneController::get_zone_temperature(uint8_t zone) const {
  return read_zone_temperature_(zone);
}

float Lv6ZoneController::get_manifold_flow_temperature() const {
  return read_manifold_flow_();
}

float Lv6ZoneController::get_manifold_return_temperature() const {
  return read_manifold_return_();
}

float Lv6ZoneController::get_valve_position(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  if (snapshot_mutex_ == nullptr)
    return snapshots_[zone].valve_position_pct;
  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  float pos = snapshots_[zone].valve_position_pct;
  xSemaphoreGive(snapshot_mutex_);
  return pos;
}

float Lv6ZoneController::get_zone_preheat_advance(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  return std::clamp(preheat_advance_c_[zone], 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);
}

void Lv6ZoneController::set_zone_setpoint(uint8_t zone, float setpoint_c) {
  if (zone >= NUM_ZONES)
    return;
  setpoint_c = std::clamp(setpoint_c, 5.0f, 35.0f);

  requested_setpoints_[zone] = setpoint_c;

  if (snapshot_mutex_ != nullptr && xSemaphoreTake(snapshot_mutex_, pdMS_TO_TICKS(50)) == pdTRUE) {
    snapshots_[zone].setpoint_c = setpoint_c;
    xSemaphoreGive(snapshot_mutex_);
  }

  if (config_store_) {
    auto zone_cfg = config_store_->get_zone_config(zone);
    if (std::fabs(zone_cfg.setpoint_c - setpoint_c) > 0.01f) {
      zone_cfg.setpoint_c = setpoint_c;
      config_store_->update_zone(zone, zone_cfg);
    }
  }
}

bool Lv6ZoneController::apply_setpoint_adjustment(uint8_t zone, float offset_c) {
  if (zone >= NUM_ZONES)
    return false;
  if (adj_queue_ == nullptr)
    return false;
  SetpointAdjustment adj = {zone, offset_c};
  return xQueueSend(adj_queue_, &adj, pdMS_TO_TICKS(50)) == pdTRUE;
}

void Lv6ZoneController::apply_helios_command(uint8_t zone, const HeliosZoneCommand &cmd) {
  if (zone >= NUM_ZONES)
    return;
  if (helios_mutex_ == nullptr) {
    helios_cmds_[zone] = cmd;
    return;
  }
  xSemaphoreTake(helios_mutex_, portMAX_DELAY);
  helios_cmds_[zone] = cmd;
  xSemaphoreGive(helios_mutex_);
}

void Lv6ZoneController::clear_all_helios_commands() {
  if (helios_mutex_ == nullptr) {
    helios_cmds_.fill({});
    return;
  }
  xSemaphoreTake(helios_mutex_, portMAX_DELAY);
  helios_cmds_.fill({});
  xSemaphoreGive(helios_mutex_);
  ESP_LOGI(TAG, "Helios: all zone commands cleared");
}

void Lv6ZoneController::set_zone_enabled(uint8_t zone, bool enabled) {
  if (zone >= NUM_ZONES || !config_store_)
    return;

  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].enabled == enabled)
    return;

  cfg.zones[zone].enabled = enabled;
  config_store_->update_zone(zone, cfg.zones[zone]);

  ESP_LOGI(TAG, "Zone %d %s", zone + 1, enabled ? "enabled" : "disabled");

  if (!enabled && valve_controller_) {
    // Actively close the valve when disabling a zone
    valve_controller_->request_position(zone, 0.0f);
  }

  balance_dirty_ = true;
}

bool Lv6ZoneController::is_zone_enabled(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return false;
  return config_store_->get_config().zones[zone].enabled;
}

void Lv6ZoneController::set_control_algorithm(ControlAlgorithm algorithm) {
  if (!config_store_)
    return;

  auto cfg = config_store_->get_config();
  bool changed = false;
  for (uint8_t zone = 0; zone < NUM_ZONES; zone++) {
    if (cfg.zones[zone].algorithm == algorithm)
      continue;
    cfg.zones[zone].algorithm = algorithm;
    config_store_->update_zone(zone, cfg.zones[zone]);
    algorithms_[zone].set_algorithm(algorithm);
    changed = true;
  }
  if (!changed)
    return;

  const char *algo_name = "Tanh";
  switch (algorithm) {
    case ControlAlgorithm::LINEAR:
      algo_name = "Linear";
      break;
    case ControlAlgorithm::PID:
      algo_name = "PID";
      break;
    case ControlAlgorithm::ADAPTIVE:
      algo_name = "Adaptive";
      break;
    case ControlAlgorithm::TANH:
    default:
      algo_name = "Tanh";
      break;
  }

  ESP_LOGI(TAG, "Control algorithm set to %s for all zones", algo_name);
}

void Lv6ZoneController::set_simple_preheat_enabled(bool enabled) {
  (void) enabled;
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.control.simple_preheat_enabled)
    return;
  cfg.control.simple_preheat_enabled = true;
  config_store_->update_control(cfg.control);
  ESP_LOGI(TAG, "Simple preheat is always active; stored disabled flag repaired");
}

bool Lv6ZoneController::is_simple_preheat_enabled() const {
  return true;
}

ControlAlgorithm Lv6ZoneController::get_control_algorithm() const {
  if (!config_store_)
    return ControlAlgorithm::TANH;
  return config_store_->get_config().zones[0].algorithm;
}

bool Lv6ZoneController::set_zone_probe(uint8_t zone, int8_t probe) {
  if (zone >= NUM_ZONES || !config_store_)
    return false;
  if (probe != PROBE_UNASSIGNED && (probe < 0 || probe >= MAX_PROBES))
    return false;

  const auto probes = config_store_->get_config().probes;
  const int8_t previous = probes.zone_return_probe[zone];
  if (previous == probe)
    return true;
  if (probe != PROBE_UNASSIGNED &&
      !probe_mapping::is_free(probes, probe, static_cast<int8_t>(zone))) {
    ESP_LOGW(TAG, "Zone %d probe %d rejected: already assigned to another role",
             zone + 1, probe + 1);
    return false;
  }
  config_store_->set_zone_return_probe(zone, probe);
  if (probe == PROBE_UNASSIGNED) {
    ESP_LOGI(TAG, "Zone %d return probe disabled (None)", zone + 1);
  } else {
    ESP_LOGI(TAG, "Zone %d now uses probe %d", zone + 1, probe + 1);
  }
  return true;
}

int8_t Lv6ZoneController::get_zone_probe(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return PROBE_UNASSIGNED;
  int8_t probe = config_store_->get_config().probes.zone_return_probe[zone];
  return (probe >= 0 && probe < MAX_PROBES) ? probe : PROBE_UNASSIGNED;
}

bool Lv6ZoneController::set_manifold_flow_probe(int8_t probe) {
  if (!config_store_)
    return false;
  if (probe < 0 || probe >= MAX_PROBES)
    return false;

  auto cfg = config_store_->get_config();
  if (cfg.probes.manifold_flow_probe == probe)
    return true;
  if (!probe_mapping::is_free(cfg.probes, probe, -1, /*ignore_manifold_flow=*/true, false)) {
    ESP_LOGW(TAG, "Manifold flow probe %d rejected: already assigned", probe + 1);
    return false;
  }
  cfg.probes.manifold_flow_probe = probe;
  config_store_->update_probes(cfg.probes);
  ESP_LOGI(TAG, "Manifold flow now uses probe %d", probe + 1);
  return true;
}

int8_t Lv6ZoneController::get_manifold_flow_probe() const {
  if (!config_store_)
    return PROBE_UNASSIGNED;
  int8_t probe = config_store_->get_config().probes.manifold_flow_probe;
  return (probe >= 0 && probe < MAX_PROBES) ? probe : 0;
}

bool Lv6ZoneController::set_manifold_return_probe(int8_t probe) {
  if (!config_store_)
    return false;
  if (probe < 0 || probe >= MAX_PROBES)
    return false;

  auto cfg = config_store_->get_config();
  if (cfg.probes.manifold_return_probe == probe)
    return true;
  if (!probe_mapping::is_free(cfg.probes, probe, -1, false, /*ignore_manifold_return=*/true)) {
    ESP_LOGW(TAG, "Manifold return probe %d rejected: already assigned", probe + 1);
    return false;
  }
  cfg.probes.manifold_return_probe = probe;
  config_store_->update_probes(cfg.probes);
  ESP_LOGI(TAG, "Manifold return now uses probe %d", probe + 1);
  return true;
}

int8_t Lv6ZoneController::get_manifold_return_probe() const {
  if (!config_store_)
    return PROBE_UNASSIGNED;
  int8_t probe = config_store_->get_config().probes.manifold_return_probe;
  return (probe >= 0 && probe < MAX_PROBES) ? probe : 0;
}

// =============================================================================
// External Temperature
// =============================================================================

void Lv6ZoneController::set_zone_external_temperature(uint8_t zone, float temp_c) {
  if (zone >= NUM_ZONES)
    return;
  external_temperatures_[zone] = temp_c;
  external_temp_last_ms_[zone] = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  ESP_LOGD(TAG, "Zone %d external temp: %.1f°C", zone + 1, temp_c);
}

float Lv6ZoneController::get_zone_external_temperature(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return NAN;
  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  const uint32_t stale_ms =
      (get_zone_temp_source(zone) == TempSource::EXTERNAL) ? EXTERNAL_HTTP_TEMP_STALE_MS
                                                           : EXTERNAL_TEMP_STALE_MS;
  if (external_temp_last_ms_[zone] > 0 && (now_ms - external_temp_last_ms_[zone]) > stale_ms)
    return NAN;
  return external_temperatures_[zone];
}

uint32_t Lv6ZoneController::get_zone_external_temp_age_ms(uint8_t zone) const {
  if (zone >= NUM_ZONES || external_temp_last_ms_[zone] == 0)
    return UINT32_MAX;
  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  return now_ms - external_temp_last_ms_[zone];
}

void Lv6ZoneController::set_zone_temp_source(uint8_t zone, TempSource source) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.sensor_config.zone_temp_source[zone] == source)
    return;
  cfg.sensor_config.zone_temp_source[zone] = source;
  config_store_->update_sensor_config(cfg.sensor_config);
  const char *label = "Local Probe";
  if (source == TempSource::BLE_SENSOR)
    label = "BLE";
  else if (source == TempSource::EXTERNAL)
    label = "External";
  ESP_LOGI(TAG, "Zone %d temp source: %s", zone + 1, label);
}

TempSource Lv6ZoneController::get_zone_temp_source(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return TempSource::LOCAL_PROBE;
  return config_store_->get_config().sensor_config.zone_temp_source[zone];
}

void Lv6ZoneController::set_zone_ble_mac(uint8_t zone, const std::string &mac) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.sensor_config.zone_ble_mac[zone], mac.c_str(), BLE_MAC_LEN - 1);
  cfg.sensor_config.zone_ble_mac[zone][BLE_MAC_LEN - 1] = '\0';
  for (char *p = cfg.sensor_config.zone_ble_mac[zone]; *p; ++p)
    *p = toupper(static_cast<unsigned char>(*p));
  config_store_->update_sensor_config(cfg.sensor_config);
  ESP_LOGI(TAG, "Zone %d BLE MAC: '%s'", zone + 1, cfg.sensor_config.zone_ble_mac[zone]);
}

std::string Lv6ZoneController::get_zone_ble_mac(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return "";
  return std::string(config_store_->get_config().sensor_config.zone_ble_mac[zone]);
}

void Lv6ZoneController::set_zone_sensor_id(uint8_t zone, const std::string &sensor_id) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.sensor_config.zone_sensor_id[zone], sensor_id.c_str(), SENSOR_ID_LEN - 1);
  cfg.sensor_config.zone_sensor_id[zone][SENSOR_ID_LEN - 1] = '\0';
  config_store_->update_sensor_config(cfg.sensor_config);
  ESP_LOGI(TAG, "Zone %d sensor_id: '%s'", zone + 1, cfg.sensor_config.zone_sensor_id[zone]);
}

std::string Lv6ZoneController::get_zone_sensor_id(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return "";
  char id[SENSOR_ID_LEN];
  config_store_->get_zone_sensor_id_str(zone, id, sizeof(id));
  return std::string(id);
}

void Lv6ZoneController::set_zone_sensor_name(uint8_t zone, const std::string &name) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.sensor_config.zone_sensor_name[zone], name.c_str(), SENSOR_NAME_LEN - 1);
  cfg.sensor_config.zone_sensor_name[zone][SENSOR_NAME_LEN - 1] = '\0';
  config_store_->update_sensor_config(cfg.sensor_config);
}

std::string Lv6ZoneController::get_zone_sensor_name(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return "";
  return std::string(config_store_->get_config().sensor_config.zone_sensor_name[zone]);
}

int8_t Lv6ZoneController::match_ble_mac(const char *mac) const {
  if (mac == nullptr || mac[0] == '\0' || !config_store_)
    return -1;
  char cfg[BLE_MAC_LEN];
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (get_zone_temp_source(z) != TempSource::BLE_SENSOR)
      continue;
    config_store_->get_zone_ble_mac_str(z, cfg, sizeof(cfg));
    if (cfg[0] == '\0')
      continue;
    if (strncasecmp(cfg, mac, BLE_MAC_LEN) == 0)
      return static_cast<int8_t>(z);
  }
  return -1;
}

int8_t Lv6ZoneController::match_external_sensor_id(const char *sensor_id) const {
  if (sensor_id == nullptr || sensor_id[0] == '\0' || !config_store_)
    return -1;
  // Copy SensorConfig only — avoid stacking a full DeviceConfig (~2 KB) here.
  const SensorConfig sc = config_store_->get_sensor_config();
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (sc.zone_temp_source[z] != TempSource::EXTERNAL)
      continue;
    if (sc.zone_sensor_id[z][0] == '\0')
      continue;
    if (strcasecmp(sc.zone_sensor_id[z], sensor_id) == 0)
      return static_cast<int8_t>(z);
  }
  return -1;
}

int8_t Lv6ZoneController::apply_external_room_temperature(const char *sensor_id, float temp_c,
                                                          int64_t observed_at_ms) {
  if (!std::isfinite(temp_c) || temp_c < -40.0f || temp_c > 85.0f)
    return -1;
  const int8_t z = match_external_sensor_id(sensor_id);
  if (z < 0)
    return -1;

  if (observed_at_ms > 0) {
    const int64_t now_ms = static_cast<int64_t>(::time(nullptr)) * 1000LL;
    if (now_ms > 1000000000000LL) {
      const int64_t age = now_ms - observed_at_ms;
      if (age > static_cast<int64_t>(EXTERNAL_HTTP_TEMP_STALE_MS))
        return -1;
      if (age < -120000)
        return -1;
    }
  }

  set_zone_external_temperature(static_cast<uint8_t>(z), temp_c);
  return z;
}

void Lv6ZoneController::set_zone_name(uint8_t zone, const std::string &name) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  char buf[sizeof(cfg.zones[zone].name)];
  strncpy(buf, name.c_str(), sizeof(buf) - 1);
  buf[sizeof(buf) - 1] = '\0';
  if (strncmp(cfg.zones[zone].name, buf, sizeof(buf)) == 0)
    return;  // unchanged — skip the NVS write
  strncpy(cfg.zones[zone].name, buf, sizeof(cfg.zones[zone].name));
  cfg.zones[zone].name[sizeof(cfg.zones[zone].name) - 1] = '\0';
  config_store_->update_zone(zone, cfg.zones[zone]);  // persists in the durable zones blob
  ESP_LOGI(TAG, "Zone %d name: '%s'", zone + 1, buf);
}

void Lv6ZoneController::set_zone_area_m2(uint8_t zone, float area_m2) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  area_m2 = std::clamp(area_m2, 1.0f, 120.0f);
  auto cfg = config_store_->get_config();
  if (std::fabs(cfg.zones[zone].area_m2 - area_m2) < 0.01f)
    return;
  cfg.zones[zone].area_m2 = area_m2;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d area: %.1f m2", zone + 1, area_m2);
}

float Lv6ZoneController::get_zone_area_m2(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return 0.0f;
  return config_store_->get_config().zones[zone].area_m2;
}

void Lv6ZoneController::set_zone_pipe_spacing_mm(uint8_t zone, float spacing_mm) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  spacing_mm = std::clamp(spacing_mm, 50.0f, 500.0f);
  auto cfg = config_store_->get_config();
  if (std::fabs(cfg.zones[zone].pipe_spacing_mm - spacing_mm) < 0.01f)
    return;
  cfg.zones[zone].pipe_spacing_mm = spacing_mm;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d pipe spacing: %.0f mm", zone + 1, spacing_mm);
}

float Lv6ZoneController::get_zone_pipe_spacing_mm(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return 0.0f;
  return config_store_->get_config().zones[zone].pipe_spacing_mm;
}

void Lv6ZoneController::set_zone_pipe_type(uint8_t zone, PipeType type) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].pipe_type == type)
    return;
  cfg.zones[zone].pipe_type = type;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d pipe type updated", zone + 1);
}

PipeType Lv6ZoneController::get_zone_pipe_type(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return PipeType::PEX_16X2;
  return config_store_->get_config().zones[zone].pipe_type;
}

// =============================================================================
// Probe Role
// =============================================================================

void Lv6ZoneController::set_zone_probe_role(uint8_t zone, ProbeRole role) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].probe_role == role)
    return;
  cfg.zones[zone].probe_role = role;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d probe role: %s", zone + 1,
           role == ProbeRole::RETURN_WATER ? "return water" : "room temperature");
}

ProbeRole Lv6ZoneController::get_zone_probe_role(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return ProbeRole::ROOM_TEMPERATURE;
  return config_store_->get_config().zones[zone].probe_role;
}

// =============================================================================
// Zone Sync
// =============================================================================

void Lv6ZoneController::set_zone_sync(uint8_t zone, int8_t target_zone) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  if (target_zone >= static_cast<int8_t>(NUM_ZONES))
    return;
  auto cfg = config_store_->get_config();
  if (target_zone == static_cast<int8_t>(zone))
    target_zone = -1;

  // Resolve target to an explicit group primary (star topology).
  if (target_zone >= 0) {
    int8_t root = group_model::primary_for_loop(cfg.groups, cfg.zones,
                                                static_cast<uint8_t>(target_zone));
    for (uint8_t guard = 0; guard < NUM_ZONES; guard++) {
      int8_t next = cfg.zones[root].sync_to_zone;
      if (next < 0 || next >= static_cast<int8_t>(NUM_ZONES))
        break;
      root = next;
      if (root == static_cast<int8_t>(zone)) {
        ESP_LOGW(TAG, "Zone %d sync rejected: would create a circular group", zone + 1);
        return;
      }
    }
    target_zone = root;
  }

  // Rebuild groups from the desired sync edge (atomic replace).
  ZoneConfig zones_tmp[NUM_ZONES];
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    zones_tmp[i] = cfg.zones[i];
  zones_tmp[zone].sync_to_zone = target_zone;
  GroupsConfig next = group_model::from_sync_to_zone(zones_tmp);
  // Preserve include_in_house / sensor_ids / revision where group_id matches.
  for (uint8_t i = 0; i < MAX_GROUPS; i++) {
    if (!group_model::group_active(next.groups[i]))
      continue;
    for (uint8_t j = 0; j < MAX_GROUPS; j++) {
      if (!group_model::group_active(cfg.groups.groups[j]))
        continue;
      if (cfg.groups.groups[j].primary_loop == next.groups[i].primary_loop) {
        next.groups[i].include_in_house_temperature =
            cfg.groups.groups[j].include_in_house_temperature;
        next.groups[i].revision = cfg.groups.groups[j].revision + 1;
        std::memcpy(next.groups[i].sensor_ids, cfg.groups.groups[j].sensor_ids,
                    sizeof(next.groups[i].sensor_ids));
        if (cfg.groups.groups[j].group_id[0] != '\0')
          std::memcpy(next.groups[i].group_id, cfg.groups.groups[j].group_id,
                      sizeof(next.groups[i].group_id));
        break;
      }
    }
  }
  bool faults[NUM_ZONES]{};
  if (valve_controller_) {
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      auto telem = valve_controller_->get_telemetry(i);
      faults[i] = telem.last_fault_code != FaultCode::NONE;
    }
  }
  auto err = group_model::validate(next, faults);
  if (err != group_model::ValidateError::OK) {
    ESP_LOGW(TAG, "Zone %d sync rejected: %s", zone + 1, group_model::validate_error_string(err));
    return;
  }
  config_store_->update_groups(next);
  ESP_LOGI(TAG, "Zone %d sync: %s", zone + 1,
           target_zone >= 0 ? ("Zone " + std::to_string(target_zone + 1)).c_str() : "None");
}

int8_t Lv6ZoneController::get_zone_sync(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return -1;
  return config_store_->get_config().zones[zone].sync_to_zone;
}

// =============================================================================
// Balancing Configuration
// =============================================================================

void Lv6ZoneController::set_balance_mode(BalanceMode mode) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.balancing.mode == mode)
    return;
  cfg.balancing.mode = mode;
  config_store_->update_balancing(cfg.balancing);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Balance mode: %s", balance_mode_to_string(mode));
}

BalanceMode Lv6ZoneController::get_balance_mode() const {
  if (!config_store_)
    return BalanceMode::STATIC;
  return effective_balance_mode(config_store_->get_config().balancing);
}

void Lv6ZoneController::set_secondary_flow_commissioning(bool enabled) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.balancing.secondary_flow_commissioning_enabled == enabled)
    return;
  cfg.balancing.secondary_flow_commissioning_enabled = enabled;
  config_store_->update_balancing(cfg.balancing);
  ESP_LOGI(TAG, "Secondary-flow commissioning: %s", enabled ? "YES" : "NO");
}

bool Lv6ZoneController::secondary_flow_commissioning_enabled() const {
  if (!config_store_)
    return false;
  return config_store_->get_config().balancing.secondary_flow_commissioning_enabled;
}

void Lv6ZoneController::set_secondary_min_total_opening_pct(float pct) {
  if (!config_store_)
    return;
  pct = std::clamp(pct, 0.0f, 50.0f);
  auto cfg = config_store_->get_config();
  cfg.balancing.secondary_min_total_opening_pct = pct;
  config_store_->update_balancing(cfg.balancing);
  ESP_LOGI(TAG, "Secondary minimum total opening: %.0f%%", pct);
}

float Lv6ZoneController::get_secondary_min_total_opening_pct() const {
  if (!config_store_)
    return 15.0f;
  return config_store_->get_config().balancing.secondary_min_total_opening_pct;
}

void Lv6ZoneController::set_target_delta_t(float delta_c) {
  if (!config_store_)
    return;
  delta_c = std::clamp(delta_c, 1.0f, 15.0f);
  auto cfg = config_store_->get_config();
  cfg.balancing.target_delta_t_c = delta_c;
  config_store_->update_balancing(cfg.balancing);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Target ΔT: %.1f°C", delta_c);
}

float Lv6ZoneController::get_target_delta_t() const {
  if (!config_store_)
    return 5.0f;
  return config_store_->get_config().balancing.target_delta_t_c;
}

void Lv6ZoneController::set_touch_control_mode(bool valid, HeatingProfile mode) {
  touch_control_mode_valid_.store(valid, std::memory_order_release);
  touch_control_mode_.store(static_cast<uint8_t>(mode), std::memory_order_release);
}

HeatingProfile Lv6ZoneController::get_effective_control_mode() const {
  if (!config_store_)
    return HeatingProfile::HEAT_PUMP;
  return control_mode_policy::resolve_mode(
      config_store_->get_config().control.mode,
      touch_authority_active_.load(std::memory_order_acquire),
      touch_control_mode_valid_.load(std::memory_order_acquire),
      static_cast<HeatingProfile>(touch_control_mode_.load(std::memory_order_acquire)));
}

HeatDemandSummary Lv6ZoneController::get_heat_demand() const {
  return heat_demand_;
}

void Lv6ZoneController::set_heating_mode(HeatingProfile mode) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.control.mode == mode)
    return;
  cfg.control.mode = mode;
  config_store_->update_control(cfg.control);
  ESP_LOGI(TAG, "Heating mode: %s", heating_profile_to_string(mode));
}

void Lv6ZoneController::set_hp_overheat_margin_c(float margin_c) {
  if (!config_store_)
    return;
  margin_c = std::clamp(margin_c, 0.3f, 3.0f);
  auto cfg = config_store_->get_config();
  if (std::fabs(cfg.control.hp_overheat_margin_c - margin_c) < 0.001f)
    return;
  cfg.control.hp_overheat_margin_c = margin_c;
  config_store_->update_control(cfg.control);
}

void Lv6ZoneController::set_hp_base_pct(float pct) {
  if (!config_store_)
    return;
  pct = std::clamp(pct, 30.0f, 100.0f);
  auto cfg = config_store_->get_config();
  if (std::fabs(cfg.control.hp_base_pct - pct) < 0.01f)
    return;
  cfg.control.hp_base_pct = pct;
  if (cfg.control.hp_trim_floor_pct > pct)
    cfg.control.hp_trim_floor_pct = pct;
  config_store_->update_control(cfg.control);
}

void Lv6ZoneController::set_hp_trim_floor_pct(float pct) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  pct = std::clamp(pct, 0.0f, cfg.control.hp_base_pct);
  if (std::fabs(cfg.control.hp_trim_floor_pct - pct) < 0.01f)
    return;
  cfg.control.hp_trim_floor_pct = pct;
  config_store_->update_control(cfg.control);
}

// =============================================================================
// FreeRTOS Task
// =============================================================================

void Lv6ZoneController::task_func_(void *arg) {
  static_cast<Lv6ZoneController *>(arg)->run_();
}

void Lv6ZoneController::run_() {
  TickType_t last_wake = xTaskGetTickCount();

  while (true) {
    SetpointAdjustment adj;
    while (xQueueReceive(adj_queue_, &adj, 0) == pdTRUE) {
      if (adj.zone < NUM_ZONES) {
        setpoint_offsets_[adj.zone] = adj.offset_c;
        ESP_LOGI(TAG, "Zone %d offset: %.2f°C", adj.zone + 1, adj.offset_c);
      }
    }

    check_failsafes_();
    run_cycle_();
    update_controller_state_();
    update_zone_display_states_();
    update_system_condition_state_();
    cycle_count_++;

    vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(cycle_interval_ms_));
  }
}

// =============================================================================
// Core Control Cycle
// =============================================================================

void Lv6ZoneController::run_cycle_() {
  if (!config_store_ || !valve_controller_)
    return;

  // Manual mode: skip automatic valve positioning entirely.
  // Manual commands (open/close/calibrate via UI buttons) still work
  // because they call valve_controller_->request_position() directly.
  if (manual_mode_ || DEVELOPMENT_MANUAL_ONLY)
    return;

  // If drivers are disabled, keep computing snapshots but don't enqueue
  // movement commands that will be rejected by the valve controller.
  bool drivers_enabled = valve_controller_->are_drivers_enabled();

  const auto cfg = config_store_->get_config();

  const BalanceMode bmode = effective_balance_mode(cfg.balancing);
  const bool adaptive_mode = (bmode == BalanceMode::ADAPTIVE);

  // RETURN_TEMP recomputes every cycle (live return temps); STATIC/ADAPTIVE only
  // rebuild when marked dirty (config edit, or an adaptive outer-loop step).
  if (balance_dirty_ || bmode == BalanceMode::RETURN_TEMP) {
    recalculate_balance_factors_();
    balance_dirty_ = false;
  }

  std::array<float, NUM_ZONES> target_positions;
  target_positions.fill(0.0f);

  // Read raw temperatures and setpoints for all zones first
  std::array<float, NUM_ZONES> zone_temps;
  std::array<float, NUM_ZONES> zone_setpoints;
  std::array<float, NUM_ZONES> helios_offsets{};   // forecast/optimizer offset per zone (adaptive gate)
  std::array<ZoneState, NUM_ZONES> zone_states{};  // classified state per zone (adaptive gate)
  zone_states.fill(ZoneState::UNKNOWN);
  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    zone_temps[i] = read_zone_temperature_(i);
    if (!std::isnan(zone_temps[i]))
      last_valid_temp_ms_[i] = now_ms;

    // Read Helios command under mutex, then apply with per-zone clamping
    float helios_off = 0.0f;
    float preheat_floor = 0.0f;
    if (helios_mutex_ != nullptr && xSemaphoreTake(helios_mutex_, pdMS_TO_TICKS(5)) == pdTRUE) {
      helios_off = helios_cmds_[i].setpoint_offset_c;
      preheat_floor = helios_cmds_[i].preheat_floor_c;
      xSemaphoreGive(helios_mutex_);
    }
    helios_off = std::clamp(helios_off, cfg.zones[i].min_offset_c, cfg.zones[i].max_offset_c);
    helios_offsets[i] = helios_off;
    float eff = requested_setpoints_[i] + setpoint_offsets_[i] + helios_off;
    eff = std::clamp(eff, cfg.zones[i].abs_min_c, cfg.zones[i].abs_max_c);
    if (preheat_floor > 0.0f)
      eff = std::max(eff, std::min(preheat_floor, cfg.zones[i].abs_max_c));
    zone_setpoints[i] = eff;
  }

  auto sync_root = [&cfg](uint8_t zone) -> int8_t {
    int8_t root = static_cast<int8_t>(zone);
    for (uint8_t guard = 0; guard < NUM_ZONES; guard++) {
      int8_t next = cfg.zones[root].sync_to_zone;
      if (next < 0 || next >= static_cast<int8_t>(NUM_ZONES))
        return root;
      if (next == static_cast<int8_t>(zone))
        return static_cast<int8_t>(zone);
      root = next;
    }
    return static_cast<int8_t>(zone);
  };

  std::array<int8_t, NUM_ZONES> sync_roots{};
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    sync_roots[i] = sync_root(i);

  // Apply zone sync groups: one primary may own multiple secondary zones.
  // Members share the primary setpoint and one true mean room temperature.
  for (uint8_t root = 0; root < NUM_ZONES; root++) {
    if (!cfg.zones[root].enabled)
      continue;

    float temp_sum = 0.0f;
    uint8_t temp_count = 0;
    uint8_t member_count = 0;
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled || sync_roots[i] != static_cast<int8_t>(root))
        continue;
      member_count++;
      if (!std::isnan(zone_temps[i])) {
        temp_sum += zone_temps[i];
        temp_count++;
      }
    }
    if (member_count <= 1)
      continue;

    const float avg = temp_count > 0 ? temp_sum / temp_count : NAN;
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled || sync_roots[i] != static_cast<int8_t>(root))
        continue;
      zone_setpoints[i] = zone_setpoints[root];
      zone_temps[i] = avg;
    }
  }

  // Detect external pre-buffering before classifying zones — when active, the
  // overheat cutoff is raised (per zone, weighted by absorb capacity rank).
  update_preheat_absorb_(cfg, zone_temps, zone_setpoints);

  // Capacity ranking per group (contract §7): absorb_capacity_kwh descending.
  {
    const HousePhysicsConfig house = cfg.house_physics;
    struct CapEntry { uint8_t zi; float cap; float r_eff; uint8_t gid; };
    CapEntry caps[NUM_ZONES];
    uint8_t ncap = 0;
    float group_cap[MAX_GROUPS]{};
    float group_r[MAX_GROUPS]{};
    float absorb_band = cfg.control.preheat_absorb_band_c > 0.0f ? cfg.control.preheat_absorb_band_c : 1.0f;

    for (uint8_t gi = 0; gi < MAX_GROUPS; gi++) {
      const GroupConfig &g = cfg.groups.groups[gi];
      if (!group_model::group_active(g) || g.member_mask == 0)
        continue;
      float sum = 0.0f;
      float r_sum = 0.0f;
      uint8_t r_n = 0;
      bool any_fresh = false;
      bool any_fault = false;
      float t_room = NAN;
      float sp = NAN;
      float t_sum = 0.0f;
      uint8_t t_n = 0;
      const uint8_t mask = group_model::group_loop_mask(g);
      for (uint8_t i = 0; i < NUM_ZONES; i++) {
        if ((mask & (1u << i)) == 0)
          continue;
        if (!cfg.zones[i].enabled) {
          any_fault = true;
          continue;
        }
        if (std::isfinite(zone_temps[i])) {
          any_fresh = true;
          t_sum += zone_temps[i];
          t_n++;
        }
        sp = zone_setpoints[g.primary_loop];
        const auto th = thermal_model::estimate(cfg.zones[i], house);
        sum += thermal_model::c_slab_eff_kwh_per_k(cfg.zones[i], th) * th.absorb_headroom_k;
        if (std::isfinite(th.r_m2k_per_w)) {
          r_sum += th.r_m2k_per_w;
          r_n++;
        }
      }
      if (t_n > 0)
        t_room = t_sum / static_cast<float>(t_n);
      float m_band = 0.0f;
      if (std::isfinite(t_room) && std::isfinite(sp)) {
        const float t_max = sp + absorb_band;
        const float den = t_max - sp;
        if (den > 1e-3f)
          m_band = std::clamp((t_max - t_room) / den, 0.0f, 1.0f);
      }
      if (!any_fresh || any_fault || !(m_band > 0.0f))
        group_cap[gi] = 0.0f;
      else
        group_cap[gi] = m_band * sum;
      group_r[gi] = r_n > 0 ? r_sum / static_cast<float>(r_n) : 1.0f;
    }

    // Singletons (loops not in an explicit multi-member group)
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      absorb_capacity_rank_[i] = 0;
      if (!cfg.zones[i].enabled)
        continue;
      const int8_t gi = group_model::find_group_index(cfg.groups, i);
      float cap = 0.0f;
      float r_eff = 1.0f;
      uint8_t gid = i;
      if (gi >= 0 && group_model::group_active(cfg.groups.groups[gi]) &&
          cfg.groups.groups[gi].member_mask != 0) {
        // Only rank the primary of multi-member groups; members inherit.
        if (cfg.groups.groups[gi].primary_loop != static_cast<int8_t>(i))
          continue;
        cap = group_cap[gi];
        r_eff = group_r[gi];
        gid = static_cast<uint8_t>(gi);
      } else {
        const auto th = thermal_model::estimate(cfg.zones[i], house);
        float m_band = 0.0f;
        if (std::isfinite(zone_temps[i]) && std::isfinite(zone_setpoints[i])) {
          const float t_max = zone_setpoints[i] + absorb_band;
          const float den = t_max - zone_setpoints[i];
          if (den > 1e-3f)
            m_band = std::clamp((t_max - zone_temps[i]) / den, 0.0f, 1.0f);
        }
        if (std::isfinite(zone_temps[i]) && m_band > 0.0f)
          cap = m_band * thermal_model::c_slab_eff_kwh_per_k(cfg.zones[i], th) *
                th.absorb_headroom_k;
        r_eff = std::isfinite(th.r_m2k_per_w) ? th.r_m2k_per_w : 1.0f;
      }
      if (!(cap > 0.0f))
        continue;
      caps[ncap++] = {i, cap, r_eff, gid};
    }
    for (uint8_t a = 1; a < ncap; a++) {
      CapEntry key = caps[a];
      int b = static_cast<int>(a) - 1;
      while (b >= 0 && (caps[b].cap < key.cap ||
                        (caps[b].cap == key.cap &&
                         (caps[b].r_eff > key.r_eff ||
                          (caps[b].r_eff == key.r_eff && caps[b].gid > key.gid))))) {
        caps[b + 1] = caps[b];
        b--;
      }
      caps[b + 1] = key;
    }
    for (uint8_t r = 0; r < ncap; r++) {
      absorb_capacity_rank_[caps[r].zi] = static_cast<uint8_t>(r + 1);
      // Propagate rank to group members
      const int8_t gi = group_model::find_group_index(cfg.groups, caps[r].zi);
      if (gi >= 0) {
        const uint8_t mask = group_model::group_loop_mask(cfg.groups.groups[gi]);
        for (uint8_t m = 0; m < NUM_ZONES; m++) {
          if ((mask & (1u << m)) != 0)
            absorb_capacity_rank_[m] = static_cast<uint8_t>(r + 1);
        }
      }
    }
  }

  // Flow allocator: heat-pump mode only (continuous share across demanding zones).
  const HeatingProfile effective_mode = control_mode_policy::resolve_mode(
      cfg.control.mode, touch_authority_active_.load(std::memory_order_acquire),
      touch_control_mode_valid_.load(std::memory_order_acquire),
      static_cast<HeatingProfile>(touch_control_mode_.load(std::memory_order_acquire)));
  if (effective_mode != last_effective_mode_) {
    normal_closed_.fill(false);
    heat_demand_timers_ = {};
    last_effective_mode_ = effective_mode;
  }

  if (effective_mode == HeatingProfile::HEAT_PUMP) {
    flow_allocator::ZoneSample samples[flow_allocator::MAX_ZONES]{};
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      samples[i].enabled = cfg.zones[i].enabled;
      const auto th = thermal_model::estimate(cfg.zones[i], cfg.house_physics);
      samples[i].ua_w_per_k = th.plausible ? th.ua_effective_w_per_k : (cfg.zones[i].area_m2 * 2.0f);
      samples[i].temp_c = zone_temps[i];
      samples[i].setpoint_c = zone_setpoints[i];
      samples[i].max_opening_pct = cfg.zones[i].max_opening_pct;
      if (valve_controller_) {
        auto telem = valve_controller_->get_telemetry(i);
        samples[i].learned_open_ripples = static_cast<float>(telem.learned_open_ripples);
      }
    }
    const uint32_t now_ms = esphome::millis();
    float dt_h = 0.0f;
    if (flow_alloc_last_ms_ != 0 && now_ms > flow_alloc_last_ms_)
      dt_h = static_cast<float>(now_ms - flow_alloc_last_ms_) / 3600000.0f;
    flow_alloc_last_ms_ = now_ms;
    float target_total = cfg.balancing.secondary_min_total_opening_pct;
    if (!(target_total > 10.0f))
      target_total = 60.0f;  // keep pump on a workable Kv when floor unset
    // Prefer natural demand total when higher than the commissioning floor.
    float demand_hint = 0.0f;
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled || std::isnan(zone_temps[i]))
        continue;
      if (zone_temps[i] < zone_setpoints[i] - cfg.control.comfort_band_c)
        demand_hint += std::min(cfg.zones[i].max_opening_pct, 40.0f);
    }
    target_total = std::max(target_total, demand_hint);
    flow_allocator::step(flow_alloc_, samples, dt_h, target_total);
    for (uint8_t i = 0; i < NUM_ZONES; i++)
      loop_share_pct_[i] = flow_alloc_.loop_share[i] * 100.0f;
  } else {
    flow_alloc_ = {};
    loop_share_pct_.fill(0.0f);
  }

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      target_positions[i] = 0.0f;
      normal_closed_[i] = false;
      xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
      snapshots_[i].state = ZoneState::UNKNOWN;
      snapshots_[i].valve_position_pct = 0.0f;
      xSemaphoreGive(snapshot_mutex_);
      continue;
    }

    float temp = zone_temps[i];
    float setpoint = zone_setpoints[i];

    algorithms_[i].set_algorithm(cfg.zones[i].algorithm);

    const bool allow_v6_preheat = preheat_policy::allow_v6_preheat(touch_authority_active_.load());
    float preheat_advance = allow_v6_preheat ? preheat_advance_c_[i] : 0.0f;
    // Capacity-weighted absorb band: rank 1 (highest mass) keeps full band;
    // lower ranks scale down so DEMAND zones reclaim flow first (redistribute).
    float absorb_band = 0.0f;
    if (preheat_absorb_active_.load()) {
      float r = 0.0f, headroom = 1.8f;
      thermal_model::covering_priors(cfg.zones[i].covering, &r, &headroom);
      float cap_scale = headroom / 3.0f;  // tile_stone baseline
      if (absorb_capacity_rank_[i] > 0) {
        const float rank_scale =
            1.0f - 0.12f * static_cast<float>(absorb_capacity_rank_[i] - 1);
        cap_scale *= std::clamp(rank_scale, 0.4f, 1.0f);
      }
      absorb_band = cfg.control.preheat_absorb_band_c * cap_scale;
    }
    ZoneState state = control_mode_policy::classify(
        effective_mode, temp, setpoint, cfg.control.comfort_band_c, cfg.control.hp_overheat_margin_c,
        preheat_advance, absorb_band, normal_closed_[i]);
    zone_states[i] = state;

    float raw_algo = 0.0f;
    if (state == ZoneState::DEMAND) {
      raw_algo = compute_raw_position_(i, temp, setpoint);
      raw_algo += cfg.control.demand_boost_pct;
    }
    float position = control_mode_policy::position_for_state(
        effective_mode, state, flow_alloc_.opening_pct[i], raw_algo,
        cfg.control.maintenance_base_pct, cfg.control.hp_base_pct, cfg.control.hp_trim_floor_pct,
        cfg.control.hp_overheat_margin_c, temp, setpoint, cfg.zones[i].max_opening_pct,
        preheat_absorb_active_.load(), absorb_band);
    bool was_overheated = (state == ZoneState::OVERHEATED);

    position = apply_hydraulic_balance_(i, position);
    target_positions[i] = position;

    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    snapshots_[i].temperature_c = temp;
    snapshots_[i].setpoint_c = setpoint;
    snapshots_[i].valve_position_pct = position;
    snapshots_[i].preheat_advance_c = preheat_advance;
    snapshots_[i].state = state;
    snapshots_[i].hydraulic_factor = balance_factors_[i];
    snapshots_[i].was_overheated = was_overheated;
    xSemaphoreGive(snapshot_mutex_);

    if (allow_v6_preheat)
      update_simple_preheat_(i, temp, setpoint, cfg.control.comfort_band_c, state);
    else
      preheat_episode_active_[i] = false;
  }

  // Group flow share: within a multi-loop group, distribute the primary's
  // commanded opening by loop area (or learned Kv when ripples exist) — not
  // identical valve positions (contract §2.1).
  for (uint8_t gi = 0; gi < MAX_GROUPS; gi++) {
    const GroupConfig &g = cfg.groups.groups[gi];
    if (!group_model::group_active(g) || g.member_mask == 0)
      continue;
    if (!cfg.zones[g.primary_loop].enabled)
      continue;
    const uint8_t mask = group_model::group_loop_mask(g);
    const float primary_open = target_positions[g.primary_loop];
    float area_sum = 0.0f;
    float weight[NUM_ZONES]{};
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if ((mask & (1u << i)) == 0 || !cfg.zones[i].enabled)
        continue;
      float w = std::max(cfg.zones[i].area_m2, 0.1f);
      if (valve_controller_) {
        auto telem = valve_controller_->get_telemetry(i);
        if (telem.learned_open_ripples > 0)
          w *= flow_allocator::kv_at_pct(std::max(primary_open, 30.0f),
                                         static_cast<float>(telem.learned_open_ripples));
      }
      weight[i] = w;
      area_sum += w;
    }
    if (!(area_sum > 0.0f))
      continue;
    // Scale so weighted mean opening ≈ primary command (preserves total Kv roughly).
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if ((mask & (1u << i)) == 0 || !cfg.zones[i].enabled)
        continue;
      const float share = weight[i] / area_sum;
      // Map share relative to equal split: opening_i = primary * (share / (1/n))
      uint8_t n = 0;
      for (uint8_t j = 0; j < NUM_ZONES; j++)
        if ((mask & (1u << j)) != 0 && cfg.zones[j].enabled)
          n++;
      const float equal = n > 0 ? 1.0f / static_cast<float>(n) : 1.0f;
      float pos = primary_open * (share / equal);
      pos = std::clamp(pos, 0.0f, cfg.zones[i].max_opening_pct);
      target_positions[i] = pos;
      xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
      snapshots_[i].valve_position_pct = pos;
      xSemaphoreGive(snapshot_mutex_);
    }
  }

  // Snapshot demand-driven openings before the minimum-flow floors are applied —
  // the adaptive sampler below skips any zone whose opening was forced up (those
  // openings no longer reflect natural demand). §3.
  std::array<float, NUM_ZONES> pre_floor_positions = target_positions;
  float pre_floor_total = 0.0f;
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    if (cfg.zones[i].enabled)
      pre_floor_total += pre_floor_positions[i];
  // Heat-pump mode keeps flow through the base opening; a total floor there
  // would only fight the soft trim.
  const bool floor_applies = effective_mode == HeatingProfile::NORMAL;
  const bool min_total_triggered = floor_applies &&
      cfg.balancing.secondary_flow_commissioning_enabled &&
      cfg.balancing.secondary_min_total_opening_pct > 0.0f &&
      pre_floor_total < cfg.balancing.secondary_min_total_opening_pct;

  if (floor_applies)
    enforce_minimum_total_opening_(target_positions);

  // Heat-demand summary for Touch / Asgard feed-temperature trim (heat-pump mode).
  {
    control_mode_policy::HeatDemandZoneInput inputs[NUM_ZONES]{};
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      inputs[i].enabled = cfg.zones[i].enabled;
      inputs[i].is_primary = (sync_roots[i] == static_cast<int8_t>(i));
      inputs[i].state = zone_states[i];
      inputs[i].opening_pct = target_positions[i];
      inputs[i].max_opening_pct = cfg.zones[i].max_opening_pct;
      inputs[i].pre_floor_opening_pct = pre_floor_positions[i];
      if (valve_controller_) {
        auto telem = valve_controller_->get_telemetry(i);
        inputs[i].calibrated = (telem.learned_open_ms != 0 && telem.learned_close_ms != 0);
      }
    }
    const uint32_t now_ms = esphome::millis();
    uint32_t dt_ms = 0;
    if (heat_demand_last_ms_ != 0 && now_ms > heat_demand_last_ms_)
      dt_ms = now_ms - heat_demand_last_ms_;
    heat_demand_last_ms_ = now_ms;
    heat_demand_ = control_mode_policy::step_heat_demand(
        heat_demand_timers_, dt_ms, effective_mode, cfg.control.hp_base_pct, inputs, NUM_ZONES);
  }

  // The snapshot represents the final commanded target, including safety-flow
  // floors.  Keeping the pre-floor value here made the dashboard claim that a
  // configured minimum was not being enforced even when the command path had
  // raised it.
  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    snapshots_[i].valve_position_pct = target_positions[i];
  xSemaphoreGive(snapshot_mutex_);

  // ---- Adaptive balancing: accumulate the relative control error, step hourly ----
  if (adaptive_mode) {
    if (adapt_reset_pending_.exchange(false, std::memory_order_acq_rel)) {
      adapt_err_ema_.fill(0.0f);
      adapt_samples_.fill(0);
      last_adapt_ms_ = 0;
    }
    float flow_temp = read_manifold_flow_();
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled || cfg.zones[i].sync_to_zone >= 0)
        continue;  // disabled, or a synced secondary (inherits primary's adapt)
      // Calibrated only — learned travel is needed for the opening to track demand.
      auto telem = valve_controller_->get_telemetry(i);
      if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0)
        continue;
      // Only DEMAND/SATISFIED reflect a balancing condition (not OVERHEATED/UNKNOWN).
      if (zone_states[i] != ZoneState::DEMAND && zone_states[i] != ZoneState::SATISFIED)
        continue;
      float temp = zone_temps[i];
      if (std::isnan(temp))
        continue;
      // Heat must actually be available, else a cold room is a no-heat artefact.
      if (std::isnan(flow_temp) || flow_temp < temp + cfg.balancing.adapt_heat_margin_c)
        continue;
      // Artificial openings bias the error: preheat-absorb, forecast preload offset.
      if (preheat_absorb_active_.load())
        continue;
      if (std::fabs(helios_offsets[i]) > 0.001f)
        continue;
      // Minimum-flow overrides force openings unrelated to demand.
      if (min_total_triggered)
        continue;
      // Eligible — fold the relative control error into the long-window EMA.
      accumulate_balance_error_(i, zone_setpoints[i] - temp, cfg.balancing.adapt_error_window_s);
    }
    // Mirror the live error to the snapshot so the dashboard shows convergence
    // every cycle (static_factor/balance_adapt only change at a rebuild).
    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    for (uint8_t i = 0; i < NUM_ZONES; i++)
      snapshots_[i].adapt_err_ema = (adapt_samples_[i] > 0) ? adapt_err_ema_[i] : NAN;
    xSemaphoreGive(snapshot_mutex_);
    update_adaptive_balance_(cfg);
  }

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!drivers_enabled)
      continue;
    if (!cfg.zones[i].enabled)
      continue;

    // Skip zones that haven't been calibrated yet — position estimates
    // would be unreliable without learned travel data.
    auto telem = valve_controller_->get_telemetry(i);
    if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0)
      continue;

    float current_pos = valve_controller_->get_position(i);
    float diff = std::fabs(target_positions[i] - current_pos);
    const bool safety_floor_raised = target_positions[i] > pre_floor_positions[i] + 0.01f;
    const bool below_safety_floor = safety_floor_raised && current_pos + 0.01f < target_positions[i];

    // min_movement_pct suppresses normal control chatter.  It must not suppress
    // a safety-flow correction: a 3% correction toward a 15% floor still needs
    // to reach the valve even though the ordinary movement deadband is 5%.
    if (diff >= cfg.control.min_movement_pct || below_safety_floor)
      valve_controller_->request_position(i, target_positions[i]);
  }
}

// =============================================================================
// Failsafe Logic
// =============================================================================

void Lv6ZoneController::check_failsafes_() {
  if (!config_store_ || !valve_controller_)
    return;

  if (DEVELOPMENT_MANUAL_ONLY)
    return;

  if (!valve_controller_->are_drivers_enabled())
    return;

  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);

  // Temperature sensor failsafe — avoid nesting DeviceConfig under run_cycle_().
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    const ZoneConfig zc = config_store_->get_zone_config(i);
    if (!zc.enabled)
      continue;
    if (last_valid_temp_ms_[i] == 0)
      continue;

    uint32_t elapsed = now_ms - last_valid_temp_ms_[i];
    if (elapsed > TEMP_FAILSAFE_MS) {
      float temp = read_zone_temperature_(i);
      if (std::isnan(temp)) {
        const float maint = config_store_->get_config().control.maintenance_base_pct;
        valve_controller_->request_position(i, maint);
        ESP_LOGW(TAG, "Zone %d temp failsafe (%" PRIu32 "s)", i + 1, elapsed / 1000);
      }
    }
  }
}

// =============================================================================
// Sensor Reading
// =============================================================================

float Lv6ZoneController::read_zone_temperature_(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return NAN;

  // Avoid nesting a full DeviceConfig copy under run_cycle_() (zone task stack).
  const TempSource src = config_store_->get_zone_temp_source(zone);
  if (src == TempSource::BLE_SENSOR || src == TempSource::EXTERNAL)
    return get_zone_external_temperature(zone);

  // Default: local probe (only if role is ROOM_TEMPERATURE; if RETURN_WATER, room temp
  // must come from BLE — return NAN to trigger failsafe/maintenance positioning)
  const ZoneConfig zc = config_store_->get_zone_config(zone);
  if (zc.probe_role == ProbeRole::RETURN_WATER)
    return NAN;

  const ProbeConfig probes = config_store_->get_probe_config();
  const int8_t probe = probes.zone_return_probe[zone];
  if (probe < 0 || probe >= MAX_PROBES || probe_sensors_[probe] == nullptr)
    return NAN;
  if (!probe_sensors_[probe]->has_state())
    return NAN;
  return probe_sensors_[probe]->state;
}

/// Read the return water temperature for a zone (only when probe_role == RETURN_WATER).
float Lv6ZoneController::read_zone_return_temperature_(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return NAN;

  const ZoneConfig zc = config_store_->get_zone_config(zone);
  if (zc.probe_role != ProbeRole::RETURN_WATER)
    return NAN;

  const ProbeConfig probes = config_store_->get_probe_config();
  const int8_t probe = probes.zone_return_probe[zone];
  if (probe < 0 || probe >= MAX_PROBES || probe_sensors_[probe] == nullptr)
    return NAN;
  if (!probe_sensors_[probe]->has_state())
    return NAN;
  return probe_sensors_[probe]->state;
}

float Lv6ZoneController::read_manifold_flow_() const {
  if (!config_store_)
    return NAN;

  const int8_t probe = config_store_->get_probe_config().manifold_flow_probe;
  if (probe >= 0 && probe < MAX_PROBES && probe_sensors_[probe] && probe_sensors_[probe]->has_state())
    return probe_sensors_[probe]->state;
  return NAN;
}

float Lv6ZoneController::read_manifold_return_() const {
  if (!config_store_)
    return NAN;

  const int8_t probe = config_store_->get_probe_config().manifold_return_probe;
  if (probe >= 0 && probe < MAX_PROBES && probe_sensors_[probe] && probe_sensors_[probe]->has_state())
    return probe_sensors_[probe]->state;
  return NAN;
}

// =============================================================================
// Zone Classification + Control
// =============================================================================

// Detect external pre-buffering: hot water arrives at the manifold while no
// zone demands heat. While active, the overheat cutoff is raised so satisfied
// zones keep their maintenance opening and the slab can absorb the buffer.
//
// Fail-safe-on: auto-detection stays live under Touch authority. An armed
// absorb window (coordinator command, P5) supersedes auto-detection when set.
void Lv6ZoneController::update_preheat_absorb_(const DeviceConfig &cfg,
                                               const std::array<float, NUM_ZONES> &temps,
                                               const std::array<float, NUM_ZONES> &setpoints) {
  expire_absorb_arm_if_needed_();

  float flow = read_manifold_flow_();
  float ua_temp_sum = 0.0f;
  float ua_sum = 0.0f;
  bool any_demand = false;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled || std::isnan(temps[i]))
      continue;
    // Weight by ua_effective of the loop's group (or the loop itself).
    const int8_t gi = group_model::find_group_index(cfg.groups, i);
    bool include = true;
    if (gi >= 0)
      include = cfg.groups.groups[gi].include_in_house_temperature;
    if (!include)
      continue;
    // Only count each group once (primary / singleton).
    if (gi >= 0 && cfg.groups.groups[gi].member_mask != 0 &&
        cfg.groups.groups[gi].primary_loop != static_cast<int8_t>(i))
      continue;
    const auto th = thermal_model::estimate(cfg.zones[i], cfg.house_physics);
    float ua = th.ua_effective_w_per_k > 0.0f ? th.ua_effective_w_per_k : cfg.zones[i].area_m2;
    if (gi >= 0 && cfg.groups.groups[gi].member_mask != 0) {
      ua = 0.0f;
      const uint8_t mask = group_model::group_loop_mask(cfg.groups.groups[gi]);
      for (uint8_t m = 0; m < NUM_ZONES; m++) {
        if ((mask & (1u << m)) == 0)
          continue;
        const auto thm = thermal_model::estimate(cfg.zones[m], cfg.house_physics);
        ua += thm.ua_effective_w_per_k > 0.0f ? thm.ua_effective_w_per_k : cfg.zones[m].area_m2;
      }
    }
    ua_temp_sum += temps[i] * ua;
    ua_sum += ua;
    float preheat_advance = std::clamp(preheat_advance_c_[i], 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);
    if (temps[i] < setpoints[i] - cfg.control.comfort_band_c + preheat_advance)
      any_demand = true;
  }

  preheat_absorb::DetectInput in{};
  in.enabled = cfg.control.preheat_absorb_enabled;
  in.arm_active = absorb_arm_active_();
  in.flow_valid = ua_sum > 0.0f && std::isfinite(flow);
  in.flow_c = flow;
  in.house_avg_c = ua_sum > 0.0f ? ua_temp_sum / ua_sum : NAN;
  in.any_demand = any_demand;
  in.detect_delta_c = cfg.control.preheat_detect_delta_c;
  in.currently_active = preheat_absorb_active_.load();
  in.detect_cycles = preheat_absorb_detect_cycles_;

  const auto out = preheat_absorb::step(in);
  preheat_absorb_detect_cycles_ = out.detect_cycles;
  if (out.active != preheat_absorb_active_.load()) {
    preheat_absorb_active_ = out.active;
    if (out.active && !absorb_arm_active_())
      absorb_arm_source_ = 2;  // reactive
    else if (!out.active && !absorb_arm_active_())
      absorb_arm_source_ = 0;
    ESP_LOGI(TAG, "Preheat absorption %s (flow=%.1f°C house_avg=%.1f°C mode=%u)",
             out.active ? "ACTIVE — satisfied zones stay open" : "ended",
             flow, in.house_avg_c, static_cast<unsigned>(absorb_mode_code()));
  }
}

bool Lv6ZoneController::absorb_arm_active_() const {
  if (absorb_arm_expires_at_ms_ == 0)
    return false;
  const uint32_t now = esphome::millis();
  return static_cast<int32_t>(absorb_arm_expires_at_ms_ - now) > 0;
}

void Lv6ZoneController::expire_absorb_arm_if_needed_() {
  if (absorb_arm_expires_at_ms_ == 0)
    return;
  if (absorb_arm_active_())
    return;
  // TTL elapsed — release arm ownership; local auto-detection resumes immediately.
  absorb_arm_expires_at_ms_ = 0;
  absorb_arm_source_ = 0;
  absorb_arm_request_id_[0] = '\0';
  std::strncpy(absorb_arm_end_reason_, "expired", sizeof(absorb_arm_end_reason_) - 1);
  absorb_arm_end_reason_[sizeof(absorb_arm_end_reason_) - 1] = '\0';
  ESP_LOGI(TAG, "Absorb window EXPIRED — local auto-detection resumes");
}

float Lv6ZoneController::arm_absorb_window(uint32_t ttl_s, const char *request_id, const char *reason) {
  ttl_s = std::clamp(ttl_s, lv6::absorb_command::TTL_MIN_S, lv6::absorb_command::TTL_MAX_S);
  absorb_arm_expires_at_ms_ = esphome::millis() + ttl_s * 1000u;
  absorb_arm_source_ = 1;
  absorb_arm_end_reason_[0] = '\0';
  if (request_id && request_id[0]) {
    std::strncpy(absorb_arm_request_id_, request_id, sizeof(absorb_arm_request_id_) - 1);
    absorb_arm_request_id_[sizeof(absorb_arm_request_id_) - 1] = '\0';
  } else {
    absorb_arm_request_id_[0] = '\0';
  }
  if (reason && reason[0]) {
    std::strncpy(absorb_arm_reason_, reason, sizeof(absorb_arm_reason_) - 1);
    absorb_arm_reason_[sizeof(absorb_arm_reason_) - 1] = '\0';
  } else {
    absorb_arm_reason_[0] = '\0';
  }
  preheat_absorb_active_ = true;
  preheat_absorb_detect_cycles_ = 0;
  ESP_LOGI(TAG, "Absorb window ARMED ttl=%lus request_id=%s reason=%s",
           static_cast<unsigned long>(ttl_s), absorb_arm_request_id_, absorb_arm_reason_);
  return static_cast<float>(ttl_s);
}

void Lv6ZoneController::clear_absorb_arm() {
  const bool was_active = absorb_arm_active_();
  const bool had_timer = absorb_arm_expires_at_ms_ != 0;
  if (was_active) {
    std::strncpy(absorb_arm_end_reason_, "disarm", sizeof(absorb_arm_end_reason_) - 1);
    absorb_arm_end_reason_[sizeof(absorb_arm_end_reason_) - 1] = '\0';
  } else if (had_timer && absorb_arm_end_reason_[0] == '\0') {
    std::strncpy(absorb_arm_end_reason_, "expired", sizeof(absorb_arm_end_reason_) - 1);
    absorb_arm_end_reason_[sizeof(absorb_arm_end_reason_) - 1] = '\0';
  }
  absorb_arm_expires_at_ms_ = 0;
  absorb_arm_source_ = 0;
  absorb_arm_request_id_[0] = '\0';
  // Disarm ends forced absorption immediately; auto-detection resumes next cycle.
  if (was_active || had_timer) {
    preheat_absorb_active_ = false;
    preheat_absorb_detect_cycles_ = 0;
  }
  if (was_active || had_timer) {
    ESP_LOGI(TAG, "Absorb window DISARMED — local auto-detection resumes");
  }
}

uint8_t Lv6ZoneController::absorb_mode_code() const {
  if (!preheat_absorb_active_.load())
    return 0;
  if (absorb_arm_active_())
    return 2;  // armed
  return 1;    // reactive
}

float Lv6ZoneController::get_loop_share_pct(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return NAN;
  return loop_share_pct_[zone];
}

uint8_t Lv6ZoneController::get_absorb_capacity_rank(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0;
  return absorb_capacity_rank_[zone];
}

float Lv6ZoneController::get_relative_kv(uint8_t zone, float opening_pct) const {
  float ripples = 0.0f;
  if (zone < NUM_ZONES && valve_controller_) {
    auto telem = valve_controller_->get_telemetry(zone);
    ripples = static_cast<float>(telem.learned_open_ripples);
  }
  return flow_allocator::kv_at_pct(opening_pct, ripples);
}

ZoneState Lv6ZoneController::classify_zone_(float temp, float setpoint, float comfort_band, float preheat_advance_c,
                                            float absorb_band_c) const {
  if (std::isnan(temp))
    return ZoneState::UNKNOWN;

  preheat_advance_c = std::clamp(preheat_advance_c, 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);
  float demand_threshold_c = setpoint - comfort_band + preheat_advance_c;

  // absorb_band_c > 0 while external pre-buffering is being absorbed: the zone
  // stays SATISFIED (maintenance opening) up to the raised cutoff.
  if (temp > setpoint + comfort_band + absorb_band_c)
    return ZoneState::OVERHEATED;
  if (temp >= demand_threshold_c)
    return ZoneState::SATISFIED;
  return ZoneState::DEMAND;
}

float Lv6ZoneController::compute_raw_position_(uint8_t zone, float temp, float setpoint) {
  if (!config_store_)
    return 0.0f;
  const auto cfg = config_store_->get_config();
  return algorithms_[zone].calculate(temp, setpoint, cfg.control, cfg.zones[zone]);
}

void Lv6ZoneController::update_simple_preheat_(uint8_t zone, float temp, float setpoint,
                                               float comfort_band, ZoneState state) {
  if (zone >= NUM_ZONES || std::isnan(temp)) {
    return;
  }

  // Start or continue a demand episode and track min/max room temperatures.
  if (state == ZoneState::DEMAND) {
    if (!preheat_episode_active_[zone]) {
      preheat_episode_active_[zone] = true;
      preheat_episode_setpoint_c_[zone] = setpoint;
      preheat_episode_min_temp_c_[zone] = temp;
      preheat_episode_max_temp_c_[zone] = temp;
    } else {
      preheat_episode_min_temp_c_[zone] = std::min(preheat_episode_min_temp_c_[zone], temp);
      preheat_episode_max_temp_c_[zone] = std::max(preheat_episode_max_temp_c_[zone], temp);
    }
  } else if (preheat_episode_active_[zone]) {
    float episode_min = preheat_episode_min_temp_c_[zone];
    float episode_max = std::max(preheat_episode_max_temp_c_[zone], temp);
    float episode_setpoint = preheat_episode_setpoint_c_[zone];

    float low_band = episode_setpoint - comfort_band;
    float high_band = episode_setpoint + comfort_band;
    float undershoot_c = std::max(0.0f, low_band - episode_min);
    float overshoot_c = std::max(0.0f, episode_max - high_band);

    float advance = preheat_advance_c_[zone];
    advance += undershoot_c * SIMPLE_PREHEAT_LEARN_UP_GAIN;
    advance -= overshoot_c * SIMPLE_PREHEAT_LEARN_DOWN_GAIN;
    preheat_advance_c_[zone] = std::clamp(advance, 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);

    ESP_LOGD(TAG,
             "Zone %d simple preheat: undershoot=%.2fC overshoot=%.2fC advance=%.2fC",
             zone + 1, undershoot_c, overshoot_c, preheat_advance_c_[zone]);

    preheat_episode_active_[zone] = false;
  }

  // Continuous small decay while overheated to back off early-start aggressiveness.
  if (state == ZoneState::OVERHEATED && preheat_advance_c_[zone] > 0.0f) {
    preheat_advance_c_[zone] = std::max(0.0f, preheat_advance_c_[zone] - SIMPLE_PREHEAT_OVERSHOOT_DECAY_C);
  }

  // Persist the learned advance so it survives reboots.
  if (config_store_) {
    auto zcfg = config_store_->get_zone_config(zone);
    if (zcfg.preheat_advance_c != preheat_advance_c_[zone]) {
      zcfg.preheat_advance_c = preheat_advance_c_[zone];
      config_store_->update_zone(zone, zcfg);
    }
  }
}

void Lv6ZoneController::reset_simple_preheat_(uint8_t zone) {
  if (zone >= NUM_ZONES)
    return;
  preheat_advance_c_[zone] = 0.0f;
  preheat_episode_active_[zone] = false;
  preheat_episode_min_temp_c_[zone] = NAN;
  preheat_episode_max_temp_c_[zone] = NAN;
  preheat_episode_setpoint_c_[zone] = 0.0f;
  if (config_store_) {
    auto zcfg = config_store_->get_zone_config(zone);
    zcfg.preheat_advance_c = 0.0f;
    config_store_->update_zone(zone, zcfg);
  }
}

// =============================================================================
// Hydraulic Balancing
// =============================================================================

/// Resistance-aware static prior weight (un-normalized) for one zone:
///   demand · floor_factor · length_term · pipe_factor
/// demand = area · heat_loss (design heat → flow need). Each correction term is
/// multiplicatively neutral (1.0) for default inputs, so the model degrades
/// gracefully to the demand-only prior. See docs/adaptive_balancing.md §1a.
float Lv6ZoneController::static_balance_weight_(const ZoneConfig &zc) {
  float demand = zc.area_m2 * zc.heat_loss_w_m2;
  float floor_f = floor_correction_factor_(zc.floor_type, zc.floor_cover_thickness_mm);
  float pipe_f = pipe_correction_factor_(zc.pipe_type);
  float L = calculate_pipe_length_m_(zc.area_m2, zc.pipe_spacing_mm, zc.supply_pipe_length_m);
  // Longer loop ⇒ more opening for equal flow. Clamp like pipe_correction so a
  // single mis-entered number can't dominate the split.
  float length_term = std::clamp(L / LENGTH_REF_M, 0.85f, 1.35f);
  return demand * floor_f * length_term * pipe_f;
}

void Lv6ZoneController::recalculate_balance_factors_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  // Legacy return-temp balancing (uses measured return temperatures)
  if (effective_balance_mode(cfg.balancing) == BalanceMode::RETURN_TEMP) {
    recalculate_dynamic_balance_factors_();
    return;
  }

  const bool adaptive = (cfg.balancing.mode == BalanceMode::ADAPTIVE);

  // Refresh the physical hydraulic outputs (flow_lh, pipe length, floor temp)
  // for the diagnostics display — these stay demand-only / physical.
  calculate_hydraulic_outputs_();

  // Resistance-aware static prior: normalize the per-zone weight by the manifold
  // maximum so the most-demanding loop = 1.0 and the rest are throttled below it.
  std::array<float, NUM_ZONES> weights;
  weights.fill(0.0f);
  float max_w = 0.0f;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled)
      continue;
    weights[i] = static_balance_weight_(cfg.zones[i]);
    if (weights[i] > max_w)
      max_w = weights[i];
  }

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      balance_factors_[i] = 0.0f;
      snapshots_[i].static_factor = 0.0f;
      snapshots_[i].balance_adapt = cfg.zones[i].balance_adapt;
      snapshots_[i].hydraulic_factor = 0.0f;
      snapshots_[i].adapt_err_ema = NAN;
      continue;
    }
    float sf = (max_w > 0.0f) ? (weights[i] / max_w) : 1.0f;
    float adapt = adaptive ? cfg.zones[i].balance_adapt : 1.0f;
    float eff = std::clamp(sf * adapt, 0.0f, 1.0f);
    balance_factors_[i] = eff;
    snapshots_[i].static_factor = sf;
    snapshots_[i].balance_adapt = adapt;
    snapshots_[i].hydraulic_factor = eff;
    snapshots_[i].adapt_err_ema =
        (adaptive && adapt_samples_[i] > 0) ? adapt_err_ema_[i] : NAN;
  }
  xSemaphoreGive(snapshot_mutex_);

  ESP_LOGI(TAG, "%s balance: [%.2f, %.2f, %.2f, %.2f, %.2f, %.2f]",
           adaptive ? "Adaptive" : "Static",
           balance_factors_[0], balance_factors_[1], balance_factors_[2],
           balance_factors_[3], balance_factors_[4], balance_factors_[5]);
}

void Lv6ZoneController::recalculate_dynamic_balance_factors_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  float flow_temp = read_manifold_flow_();
  if (std::isnan(flow_temp)) {
    ESP_LOGW(TAG, "Dynamic balance: no flow temp, falling back to static");
    calculate_hydraulic_outputs_();
    return;
  }

  float target_dt = cfg.balancing.target_delta_t_c;
  float alpha = cfg.balancing.damping_factor;
  bool any_valid = false;

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      balance_factors_[i] = 0.0f;
      continue;
    }

    float return_temp = read_zone_return_temperature_(i);

    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    snapshots_[i].return_temp_c = return_temp;
    ZoneState last_state = snapshots_[i].state;
    xSemaphoreGive(snapshot_mutex_);

    if (std::isnan(return_temp)) {
      // No return temp sensor for this zone — keep existing factor
      continue;
    }

    // Only update balance factors for zones that had active flow last cycle.
    // A zone at 0% or maintenance flow has stagnant water whose return temp
    // drifts to floor/ambient temperature — not a valid ΔT measurement.
    if (last_state != ZoneState::DEMAND) {
      // If zone is re-entering demand next cycle, reset factor to 1.0f so we
      // don't carry over a factor computed during stagnant conditions.
      if (last_state == ZoneState::SATISFIED || last_state == ZoneState::OVERHEATED) {
        balance_factors_[i] = 1.0f;
      }
      continue;
    }

    float measured_dt = flow_temp - return_temp;

    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    snapshots_[i].measured_delta_t_c = measured_dt;
    xSemaphoreGive(snapshot_mutex_);

    // If measured ΔT > target: zone is getting too much heat → reduce factor
    // If measured ΔT < target: zone needs more flow → increase factor
    // Factor = target_ΔT / measured_ΔT, clamped to reasonable range
    float new_factor = 1.0f;
    if (measured_dt > 0.5f) {
      new_factor = target_dt / measured_dt;
      new_factor = std::clamp(new_factor, 0.3f, 1.5f);
    }

    // EMA smoothing to avoid oscillation
    float old_factor = balance_factors_[i];
    if (old_factor <= 0.0f || std::isnan(old_factor))
      old_factor = 1.0f;
    balance_factors_[i] = alpha * new_factor + (1.0f - alpha) * old_factor;

    any_valid = true;
  }

  if (!any_valid) {
    ESP_LOGW(TAG, "Dynamic balance: no valid return temps, keeping existing factors");
  } else {
    ESP_LOGI(TAG, "Dynamic balance: [%.2f, %.2f, %.2f, %.2f, %.2f, %.2f]",
             balance_factors_[0], balance_factors_[1], balance_factors_[2],
             balance_factors_[3], balance_factors_[4], balance_factors_[5]);
  }
}

float Lv6ZoneController::apply_hydraulic_balance_(uint8_t zone, float raw_position) {
  if (balance_factors_[zone] <= 0.0f)
    return 0.0f;
  return raw_position * balance_factors_[zone];
}

// =============================================================================
// Adaptive Balancing (room-temperature feedback; docs/adaptive_balancing.md)
// =============================================================================

void Lv6ZoneController::accumulate_balance_error_(uint8_t zone, float e_i, float window_s) {
  // Time-weighted EMA: β = dt / window. A few cycles can't swing the average.
  float dt = cycle_interval_ms_ / 1000.0f;
  float beta = (window_s > 0.0f) ? std::clamp(dt / window_s, 0.0f, 1.0f) : 1.0f;
  if (adapt_samples_[zone] == 0)
    adapt_err_ema_[zone] = e_i;  // seed with the first sample
  else
    adapt_err_ema_[zone] = beta * e_i + (1.0f - beta) * adapt_err_ema_[zone];
  adapt_samples_[zone]++;
}

void Lv6ZoneController::update_adaptive_balance_(const DeviceConfig &cfg) {
  if (!config_store_)
    return;

  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  uint32_t interval_ms = cfg.balancing.adapt_interval_s * 1000UL;
  if (interval_ms == 0)
    interval_ms = 3600000UL;

  // Seed the timer on the first cycle so a full interval of samples is collected
  // before the first step (and the boot-time accumulators aren't acted on).
  if (last_adapt_ms_ == 0) {
    last_adapt_ms_ = now_ms;
    return;
  }
  if ((now_ms - last_adapt_ms_) < interval_ms)
    return;
  last_adapt_ms_ = now_ms;

  // Gather the zones that collected enough valid samples this interval. Synced
  // secondary zones never adapt on their own (§5) — they inherit the primary's.
  float sum_e = 0.0f;
  uint8_t contrib = 0;
  std::array<bool, NUM_ZONES> contributes{};
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled || cfg.zones[i].sync_to_zone >= 0)
      continue;
    if (adapt_samples_[i] < cfg.balancing.adapt_min_samples)
      continue;
    contributes[i] = true;
    sum_e += adapt_err_ema_[i];
    contrib++;
  }

  // Need ≥2 loops to define a common-mode mean to redistribute around.
  if (contrib >= 2) {
    float e_mean = sum_e / static_cast<float>(contrib);
    lv6ab::AdaptParams p{cfg.balancing.adapt_step, cfg.balancing.adapt_min, cfg.balancing.adapt_max};
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!contributes[i])
        continue;
      float old_a = cfg.zones[i].balance_adapt;
      float new_a = lv6ab::next_adapt(old_a, adapt_err_ema_[i], e_mean, p);
      // Persist only on a meaningful move (NVS write ≈ a few/day, not per cycle).
      if (std::fabs(new_a - old_a) >= 0.01f) {
        ZoneConfig zc = config_store_->get_zone_config(i);
        zc.balance_adapt = new_a;
        config_store_->update_zone(i, zc);
        // Merged secondaries share the primary's correction (they open equally).
        for (uint8_t j = 0; j < NUM_ZONES; j++) {
          if (cfg.zones[j].enabled && cfg.zones[j].sync_to_zone == static_cast<int8_t>(i)) {
            ZoneConfig zs = config_store_->get_zone_config(j);
            zs.balance_adapt = new_a;
            config_store_->update_zone(j, zs);
          }
        }
        ESP_LOGI(TAG, "Adapt z%u: %.3f -> %.3f (e=%.2f, mean=%.2f, n=%u)",
                 i + 1, old_a, new_a, adapt_err_ema_[i], e_mean,
                 static_cast<unsigned>(adapt_samples_[i]));
      }
    }
    balance_dirty_ = true;  // rebuild balance_factors_ from the new multipliers
  } else {
    ESP_LOGD(TAG, "Adapt: only %u contributing zone(s) this interval, no update", contrib);
  }

  // Reset accumulators for the next interval regardless of whether we stepped.
  adapt_err_ema_.fill(0.0f);
  adapt_samples_.fill(0);
}

void Lv6ZoneController::reset_balancing() {
  if (!config_store_)
    return;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ZoneConfig zc = config_store_->get_zone_config(i);
    if (zc.balance_adapt != 1.0f) {
      zc.balance_adapt = 1.0f;
      config_store_->update_zone(i, zc);
    }
  }
  adapt_reset_pending_.store(true, std::memory_order_release);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Adaptive balancing reset (all balance_adapt = 1.0)");
}

void Lv6ZoneController::enforce_minimum_total_opening_(std::array<float, NUM_ZONES> &positions) {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();
  bool enabled[NUM_ZONES]{};
  for (uint8_t i = 0; i < NUM_ZONES; i++) enabled[i] = cfg.zones[i].enabled;
  const hydraulic_policy::SecondaryFlowPolicy policy{
      cfg.balancing.secondary_flow_commissioning_enabled,
      cfg.balancing.secondary_min_total_opening_pct};
  const auto result = hydraulic_policy::preserve_secondary_flow<NUM_ZONES>(policy, enabled, positions.data());
  if (result.applied)
    ESP_LOGD(TAG, "Secondary commissioning opening: +%.1f%% across %u accepting loops",
             result.added_opening_pct, result.accepting_loops);
}

// =============================================================================
// Hydraulic Model (Danfoss)
// =============================================================================

void Lv6ZoneController::calculate_hydraulic_outputs_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      snapshots_[i].heat_output_w = 0.0f;
      snapshots_[i].pipe_length_m = 0.0f;
      snapshots_[i].flow_lh = 0.0f;
      snapshots_[i].floor_surface_temp_c = 0.0f;
      snapshots_[i].pipe_length_warning = false;
      continue;
    }

    const auto &zc = cfg.zones[i];

    float Q = zc.area_m2 * zc.heat_loss_w_m2;
    snapshots_[i].heat_output_w = Q;

    float L = calculate_pipe_length_m_(zc.area_m2, zc.pipe_spacing_mm, zc.supply_pipe_length_m);
    snapshots_[i].pipe_length_m = L;
    snapshots_[i].pipe_length_warning = (L > pipe_max_length_m(zc.pipe_type));

    float delta = zc.cooling_delta_c;
    if (delta < 1.0f)
      delta = 5.0f;
    float V = Q / (delta * 1.163f);
    snapshots_[i].flow_lh = V;

    float lambda;
    switch (zc.floor_type) {
      case FloorType::TILE: lambda = 1.30f; break;
      case FloorType::PARQUET: lambda = 0.13f; break;
      case FloorType::OAK: lambda = 0.18f; break;
      case FloorType::CARPET: lambda = 0.09f; break;
      default: lambda = 1.30f; break;
    }
    if (lambda < 0.01f)
      lambda = 0.01f;
    float R_cover = (zc.floor_cover_thickness_mm / 1000.0f) / lambda;
    float theta_room = zc.setpoint_c;
    float theta_floor = theta_room + zc.heat_loss_w_m2 * (R_cover + 1.0f / ALPHA_TOP);
    snapshots_[i].floor_surface_temp_c = theta_floor;
  }
  xSemaphoreGive(snapshot_mutex_);
}

float Lv6ZoneController::calculate_pipe_length_m_(float area_m2, float spacing_mm, float supply_pipe_m) {
  float spacing_m = spacing_mm / 1000.0f;
  if (spacing_m <= 0.0f)
    spacing_m = 0.20f;  // 200 mm standard — matches ZoneConfig::pipe_spacing_mm default
  float zone_pipe = area_m2 / spacing_m;
  return zone_pipe + 2.0f * supply_pipe_m + 2.0f;
}

float Lv6ZoneController::pipe_correction_factor_(PipeType type) {
  float inner_d = pipe_inner_diameter_mm(type);
  float baseline = 12.0f;
  float factor = std::sqrt(baseline / inner_d);
  return std::clamp(factor, 0.85f, 1.35f);
}

float Lv6ZoneController::floor_correction_factor_(FloorType type, float cover_thickness_mm) {
  float lambda;
  switch (type) {
    case FloorType::TILE: lambda = 1.30f; break;
    case FloorType::PARQUET: lambda = 0.13f; break;
    case FloorType::OAK: lambda = 0.18f; break;
    case FloorType::CARPET: lambda = 0.09f; break;
    default: lambda = 1.30f; break;
  }
  float thickness_m = cover_thickness_mm / 1000.0f;
  if (thickness_m <= 0.0f)
    thickness_m = 0.015f;
  float resistance = thickness_m / lambda;
  float baseline_r = 0.015f / 1.30f;
  float factor = 1.0f + (resistance - baseline_r) * 5.0f;
  return std::clamp(factor, 0.7f, 1.5f);
}

// =============================================================================
// State Machine Updates
// =============================================================================

void Lv6ZoneController::update_controller_state_() {
  if (!config_store_ || !valve_controller_)
    return;

  ControllerState new_state = ControllerState::UNKNOWN;

  // Determine primary action state
  if (manual_mode_) {
    new_state = ControllerState::MANUAL;
  } else if (DEVELOPMENT_MANUAL_ONLY) {
    new_state = ControllerState::MANUAL;
  } else if (!valve_controller_->are_drivers_enabled()) {
    new_state = ControllerState::OFF;
  } else {
    // Check if any zone is calibrating
    bool any_calibrating = false;
    const auto cfg = config_store_->get_config();
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled)
        continue;
      auto telem = valve_controller_->get_telemetry(i);
      if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0) {
        any_calibrating = true;
        break;
      }
    }

    if (any_calibrating) {
      new_state = ControllerState::CALIBRATING;
    } else {
      // Count active zones and their demand states
      uint8_t active_count = 0;
      uint8_t heating_count = 0;

      xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
      for (uint8_t i = 0; i < NUM_ZONES; i++) {
        if (!cfg.zones[i].enabled)
          continue;
        if (snapshots_[i].state == ZoneState::UNKNOWN)
          continue;

        active_count++;
        if (snapshots_[i].state == ZoneState::DEMAND)
          heating_count++;
      }
      xSemaphoreGive(snapshot_mutex_);

      // Determine state based on zone activity
      if (active_count == 0) {
        new_state = ControllerState::WAITING_INPUT;
      } else if (heating_count > 0) {
        if (heating_count == active_count) {
          new_state = ControllerState::HEATING;
        } else {
          new_state = ControllerState::MIXED;
        }
      } else {
        new_state = ControllerState::IDLE;
      }
    }
  }

  if (new_state != controller_state_) {
    controller_state_ = new_state;
    ESP_LOGI(TAG, "Controller state: %d", static_cast<int>(new_state));
  }
}

void Lv6ZoneController::update_system_condition_state_() {
  if (!config_store_)
    return;

  SystemConditionState new_state = SystemConditionState::UNKNOWN;

  const auto cfg = config_store_->get_config();
  uint8_t active_zones = 0;
  uint8_t overheated_count = 0;
  uint8_t above_target_count = 0;

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled)
      continue;
    if (snapshots_[i].state == ZoneState::UNKNOWN)
      continue;

    active_zones++;

    // Derive system condition directly from control state.
    if (snapshots_[i].state == ZoneState::OVERHEATED) {
      overheated_count++;
    } else if (snapshots_[i].state == ZoneState::SATISFIED) {
      above_target_count++;
    }
  }
  xSemaphoreGive(snapshot_mutex_);

  // Determine system-level condition
  if (active_zones == 0) {
    new_state = SystemConditionState::UNKNOWN;
  } else if (overheated_count > 0) {
    new_state = SystemConditionState::OVERHEATED;
  } else if (above_target_count == active_zones) {
    // All active zones are above setpoint
    new_state = SystemConditionState::ABOVE_SETPOINT;
  } else {
    new_state = SystemConditionState::NORMAL;
  }

  if (new_state != system_condition_state_) {
    system_condition_state_ = new_state;
    ESP_LOGD(TAG, "System condition: %d", static_cast<int>(new_state));
  }
}

void Lv6ZoneController::update_zone_display_states_() {
  if (!config_store_ || !valve_controller_)
    return;

  const auto cfg = config_store_->get_config();
  const bool drivers_enabled = valve_controller_->are_drivers_enabled();
  const bool manual = manual_mode_ || DEVELOPMENT_MANUAL_ONLY;

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      snapshots_[i].display_state = ZoneDisplayState::OFF;
      continue;
    }

    if (manual) {
      snapshots_[i].display_state = ZoneDisplayState::MANUAL;
      continue;
    }

    if (!drivers_enabled) {
      snapshots_[i].display_state = ZoneDisplayState::OFF;
      continue;
    }

    // Live calibration / relearn: keep CALIBRATING even when a previous stroke
    // is still stored (reset_and_relearn does not clear learned_* up front).
    if (valve_controller_->is_calibrating()) {
      const auto lp = valve_controller_->get_learning_progress();
      if (lp.zone == i) {
        snapshots_[i].display_state = ZoneDisplayState::CALIBRATING;
        continue;
      }
    }

    auto telem = valve_controller_->get_telemetry(i);
    if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0) {
      snapshots_[i].display_state = ZoneDisplayState::CALIBRATING;
      continue;
    }

    if (std::isnan(snapshots_[i].temperature_c)) {
      snapshots_[i].display_state = ZoneDisplayState::WAITING_ROOM_TEMP;
      continue;
    }

    switch (snapshots_[i].state) {
      case ZoneState::DEMAND:
        snapshots_[i].display_state = ZoneDisplayState::HEATING;
        break;
      case ZoneState::SATISFIED:
      case ZoneState::OVERHEATED:
        snapshots_[i].display_state = ZoneDisplayState::IDLE;
        break;
      case ZoneState::UNKNOWN:
      default:
        snapshots_[i].display_state = ZoneDisplayState::WAITING_ROOM_TEMP;
        break;
    }
  }
  xSemaphoreGive(snapshot_mutex_);
}

// =============================================================================
// BLE Sensor Discovery
// =============================================================================

void Lv6ZoneController::report_ble_sensor_seen(const char *mac, float temp_c, int8_t rssi, const char *name) {
  if (ble_seen_mutex_ == nullptr || mac == nullptr)
    return;
  if (xSemaphoreTake(ble_seen_mutex_, pdMS_TO_TICKS(5)) != pdTRUE)
    return;

  const bool has_name = name != nullptr && name[0] != '\0';
  uint32_t now = esphome::millis();
  int oldest_slot = 0;
  uint32_t oldest_ms = UINT32_MAX;

  for (uint8_t i = 0; i < BLE_SEEN_SLOTS; i++) {
    if (ble_seen_[i].mac[0] == '\0') {
      // Empty slot — claim it
      strncpy(ble_seen_[i].mac, mac, sizeof(ble_seen_[i].mac) - 1);
      ble_seen_[i].mac[sizeof(ble_seen_[i].mac) - 1] = '\0';
      if (has_name) {
        strncpy(ble_seen_[i].name, name, sizeof(ble_seen_[i].name) - 1);
        ble_seen_[i].name[sizeof(ble_seen_[i].name) - 1] = '\0';
      } else {
        ble_seen_[i].name[0] = '\0';
      }
      ble_seen_[i].temp_c = temp_c;
      ble_seen_[i].rssi = rssi;
      ble_seen_[i].last_ms = now;
      if (ble_seen_count_ < BLE_SEEN_SLOTS)
        ble_seen_count_++;
      xSemaphoreGive(ble_seen_mutex_);
      return;
    }
    if (memcmp(ble_seen_[i].mac, mac, 17) == 0) {
      // Already tracked — update. Keep last known name/temperature when this
      // packet omits them (Shelly BLU rotates fields across advertisements).
      if (has_name) {
        strncpy(ble_seen_[i].name, name, sizeof(ble_seen_[i].name) - 1);
        ble_seen_[i].name[sizeof(ble_seen_[i].name) - 1] = '\0';
      }
      if (!std::isnan(temp_c))
        ble_seen_[i].temp_c = temp_c;
      ble_seen_[i].rssi = rssi;
      ble_seen_[i].last_ms = now;
      xSemaphoreGive(ble_seen_mutex_);
      return;
    }
    if (ble_seen_[i].last_ms < oldest_ms) {
      oldest_ms = ble_seen_[i].last_ms;
      oldest_slot = i;
    }
  }

  // All slots occupied — evict oldest
  strncpy(ble_seen_[oldest_slot].mac, mac, sizeof(ble_seen_[0].mac) - 1);
  ble_seen_[oldest_slot].mac[sizeof(ble_seen_[0].mac) - 1] = '\0';
  if (has_name) {
    strncpy(ble_seen_[oldest_slot].name, name, sizeof(ble_seen_[0].name) - 1);
    ble_seen_[oldest_slot].name[sizeof(ble_seen_[0].name) - 1] = '\0';
  } else {
    ble_seen_[oldest_slot].name[0] = '\0';
  }
  ble_seen_[oldest_slot].temp_c = temp_c;
  ble_seen_[oldest_slot].rssi = rssi;
  ble_seen_[oldest_slot].last_ms = now;
  xSemaphoreGive(ble_seen_mutex_);
}

uint8_t Lv6ZoneController::get_ble_discovered(BleSensorSeen *out, uint8_t max) const {
  if (ble_seen_mutex_ == nullptr || out == nullptr || max == 0)
    return 0;
  if (xSemaphoreTake(ble_seen_mutex_, pdMS_TO_TICKS(20)) != pdTRUE)
    return 0;

  uint32_t now = esphome::millis();
  uint8_t count = 0;
  for (uint8_t i = 0; i < BLE_SEEN_SLOTS && count < max; i++) {
    if (ble_seen_[i].mac[0] == '\0')
      continue;
    if ((now - ble_seen_[i].last_ms) > BLE_SEEN_STALE_MS)
      continue;
    out[count++] = ble_seen_[i];
  }
  xSemaphoreGive(ble_seen_mutex_);
  return count;
}

}  // namespace lv6
