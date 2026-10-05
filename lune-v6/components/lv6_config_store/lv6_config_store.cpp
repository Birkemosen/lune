// =============================================================================
// LV6 Config Store — ESPHome Component Implementation
// =============================================================================

#include "lv6_config_store.h"
#include "esphome/core/log.h"
#include "group_model.h"
#include <cinttypes>
#include <cctype>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <cmath>
#include <vector>
#include "esp_system.h"

namespace lv6 {

static const char *const TAG = "lv6_config_store";

namespace {

bool is_blank_or_whitespace(const char *s) {
  if (s == nullptr)
    return true;
  for (size_t i = 0; s[i] != '\0'; i++) {
    if (!std::isspace(static_cast<unsigned char>(s[i])))
      return false;
  }
  return true;
}

void trim_copy(char *dst, size_t dst_len, const char *src) {
  if (dst == nullptr || dst_len == 0) {
    return;
  }
  dst[0] = '\0';
  if (src == nullptr)
    return;

  size_t start = 0;
  size_t len = std::strlen(src);
  while (start < len && std::isspace(static_cast<unsigned char>(src[start])))
    start++;
  while (len > start && std::isspace(static_cast<unsigned char>(src[len - 1])))
    len--;

  size_t out_len = std::min(dst_len - 1, len - start);
  if (out_len > 0) {
    std::memcpy(dst, src + start, out_len);
  }
  dst[out_len] = '\0';
}

// Persist/restore an arbitrary POD config section under its own NVS key with an
// independent version tag, so release/schema churn in the legacy main `config`
// blob cannot reset unrelated user settings. Bump the matching *_CONFIG_VERSION
// only when that struct's layout changes — that resets just that section, not
// the whole configuration.
template<typename T>
void save_section(nvs_handle_t handle, const char *key, uint32_t version, const T &obj) {
  uint8_t blob[sizeof(uint32_t) + sizeof(T)];
  std::memcpy(blob, &version, sizeof(uint32_t));
  std::memcpy(blob + sizeof(uint32_t), &obj, sizeof(T));
  nvs_set_blob(handle, key, blob, sizeof(blob));
}

/// Overlays `out` and returns true iff a matching-size, matching-version blob exists.
///
/// A section that EXISTS but is stale (other size or version) resets `out` to
/// defaults. It must not keep what the main blob gave: the main blob carries
/// every section too, and when a version bump leaves the layout unchanged it
/// still loads at full size - so "keep the main blob" silently restored the
/// very values the bump was meant to replace. Only an absent section falls
/// back to the main blob, which is the pre-section migration case.
template<typename T>
bool load_section(nvs_handle_t handle, const char *key, uint32_t version, T &out) {
  size_t size = 0;
  if (nvs_get_blob(handle, key, nullptr, &size) != ESP_OK)
    return false;  // no durable copy yet (first boot, or pre-upgrade firmware)
  if (size != sizeof(uint32_t) + sizeof(T)) {
    ESP_LOGW(TAG, "Section '%s' layout changed; resetting it to defaults", key);
    out = T{};
    return false;
  }
  uint8_t blob[sizeof(uint32_t) + sizeof(T)];
  size_t read_size = size;
  if (nvs_get_blob(handle, key, blob, &read_size) != ESP_OK)
    return false;
  uint32_t v = 0;
  std::memcpy(&v, blob, sizeof(uint32_t));
  if (v != version) {
    ESP_LOGW(TAG, "Section '%s' v%" PRIu32 " is stale (current v%" PRIu32 "); resetting it to defaults",
             key, v, version);
    out = T{};
    return false;
  }
  std::memcpy(&out, blob + sizeof(uint32_t), sizeof(T));
  return true;
}

// Firmware before the manifold/Touch split stored the three Touch credentials
// at the tail of the legacy heat-source section. Import them once so an upgrade does
// not silently orphan the coordinator authentication key.
struct LegacyAuthoritySection {
  bool enabled;
  bool coordinator;
  char host[64];
  uint16_t port;
  char entity_name[48];
  uint16_t push_interval_s;
  char peer_host[64];
  uint16_t peer_port;
  uint16_t peer_stale_after_s;
  char authority_installation_id[32];
  char authority_coordinator_id[32];
  char authority_shared_key[64];
};

bool load_legacy_authority(nvs_handle_t handle, AuthorityConfig &out) {
  LegacyAuthoritySection legacy{};
  if (!load_section(handle, "asgard", 2, legacy))
    return false;
  trim_copy(out.installation_id, sizeof(out.installation_id), legacy.authority_installation_id);
  trim_copy(out.coordinator_id, sizeof(out.coordinator_id), legacy.authority_coordinator_id);
  trim_copy(out.shared_key, sizeof(out.shared_key), legacy.authority_shared_key);
  return out.installation_id[0] || out.coordinator_id[0] || out.shared_key[0];
}


}  // namespace

void Lv6ConfigStore::setup() {
  mutex_ = xSemaphoreCreateMutex();
  if (mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create mutex");
    this->mark_failed();
    return;
  }

  // Create deferred-save timer
  esp_timer_create_args_t timer_args = {};
  timer_args.callback = &Lv6ConfigStore::dirty_timer_cb_;
  timer_args.arg = this;
  timer_args.name = "cfg_save";
  if (esp_timer_create(&timer_args, &dirty_timer_) != ESP_OK) {
    ESP_LOGE(TAG, "Failed to create dirty timer");
    this->mark_failed();
    return;
  }

  // Binary semaphore + dedicated NVS task. The timer callback gives the
  // semaphore; the task wakes, takes a config snapshot, and performs the
  // NVS commit (which can block 50\u2013500 ms) without ever stalling the main
  // loop, the lwIP task, or the IDF httpd. Pinned to Core 1 at the lowest
  // useful priority so it yields to networking immediately when needed.
  save_sem_ = xSemaphoreCreateBinary();
  if (save_sem_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create save semaphore");
    this->mark_failed();
    return;
  }
  BaseType_t task_ok = xTaskCreatePinnedToCore(
      &Lv6ConfigStore::nvs_task_entry_, "lv6_nvs", NVS_TASK_STACK, this,
      NVS_TASK_PRIO, &nvs_task_, NVS_TASK_CORE);
  if (task_ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create NVS persistence task");
    this->mark_failed();
    return;
  }

  initialized_ = true;
  migrate_legacy_nvs_namespace_();
  load_config_();

  ESP_LOGI(TAG, "Config store initialized");
}

void Lv6ConfigStore::loop() {
  // Persistence runs on the dedicated nvs_task_; loop() is intentionally
  // empty so the main loop task is never blocked by an NVS commit.
}

void Lv6ConfigStore::dump_config() {
  ESP_LOGCONFIG(TAG, "LV6 Config Store:");
  ESP_LOGCONFIG(TAG, "  Controller ID: %s", config_.system.controller_id);
  ESP_LOGCONFIG(TAG, "  Heating mode: %s", heating_profile_to_string(config_.control.mode));
  ESP_LOGCONFIG(TAG, "  Manifold type: %s", config_.manifold_type == ManifoldType::NC ? "NC" : "NO");
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ESP_LOGCONFIG(TAG, "  Zone %d: %s, setpoint=%.1f°C, max=%.0f%%",
                  i + 1, config_.zones[i].enabled ? "enabled" : "disabled",
                  config_.zones[i].setpoint_c, config_.zones[i].max_opening_pct);
  }
}

DeviceConfig Lv6ConfigStore::get_config() const {
  if (mutex_ == nullptr)
    return config_;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  DeviceConfig copy = config_;
  xSemaphoreGive(mutex_);
  return copy;
}

SensorConfig Lv6ConfigStore::get_sensor_config() const {
  if (mutex_ == nullptr)
    return config_.sensor_config;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  SensorConfig copy = config_.sensor_config;
  xSemaphoreGive(mutex_);
  return copy;
}

MotorConfig Lv6ConfigStore::get_motor_config() const {
  if (mutex_ == nullptr)
    return config_.motor;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  MotorConfig copy = config_.motor;
  xSemaphoreGive(mutex_);
  return copy;
}

ZoneConfig Lv6ConfigStore::get_zone_config(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return {};
  if (mutex_ == nullptr)
    return config_.zones[zone];
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ZoneConfig copy = config_.zones[zone];
  xSemaphoreGive(mutex_);
  return copy;
}

bool Lv6ConfigStore::get_simple_preheat_enabled() const {
  return true;
}

ManifoldType Lv6ConfigStore::get_manifold_type() const {
  if (mutex_ == nullptr)
    return config_.manifold_type;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ManifoldType val = config_.manifold_type;
  xSemaphoreGive(mutex_);
  return val;
}

ProbeConfig Lv6ConfigStore::get_probe_config() const {
  if (mutex_ == nullptr)
    return config_.probes;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ProbeConfig copy = config_.probes;
  xSemaphoreGive(mutex_);
  return copy;
}

TempSource Lv6ConfigStore::get_zone_temp_source(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return TempSource::LOCAL_PROBE;
  if (mutex_ == nullptr)
    return config_.sensor_config.zone_temp_source[zone];
  xSemaphoreTake(mutex_, portMAX_DELAY);
  TempSource val = config_.sensor_config.zone_temp_source[zone];
  xSemaphoreGive(mutex_);
  return val;
}

void Lv6ConfigStore::get_zone_ble_mac_str(uint8_t zone, char *ble, size_t ble_len) const {
  if (zone >= NUM_ZONES) {
    if (ble && ble_len) ble[0] = '\0';
    return;
  }
  if (mutex_ == nullptr) {
    if (ble && ble_len) { strncpy(ble, config_.sensor_config.zone_ble_mac[zone], ble_len - 1); ble[ble_len - 1] = '\0'; }
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  if (ble && ble_len) { strncpy(ble, config_.sensor_config.zone_ble_mac[zone], ble_len - 1); ble[ble_len - 1] = '\0'; }
  xSemaphoreGive(mutex_);
}

void Lv6ConfigStore::get_zone_sensor_id_str(uint8_t zone, char *out, size_t out_len) const {
  if (zone >= NUM_ZONES) {
    if (out && out_len) out[0] = '\0';
    return;
  }
  if (mutex_ == nullptr) {
    if (out && out_len) {
      strncpy(out, config_.sensor_config.zone_sensor_id[zone], out_len - 1);
      out[out_len - 1] = '\0';
    }
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  if (out && out_len) {
    strncpy(out, config_.sensor_config.zone_sensor_id[zone], out_len - 1);
    out[out_len - 1] = '\0';
  }
  xSemaphoreGive(mutex_);
}

void Lv6ConfigStore::set_config(const DeviceConfig &config) {
  if (mutex_ == nullptr) {
    config_ = config;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_ = config;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::mark_dirty() {
  if (!initialized_ || !dirty_timer_)
    return;
  esp_timer_stop(dirty_timer_);
  esp_timer_start_once(dirty_timer_, DIRTY_DELAY_US);
}

void Lv6ConfigStore::flush_now() {
  if (!initialized_)
    return;
  // Drop any pending debounce so we do not double-save after this sync write.
  if (dirty_timer_)
    esp_timer_stop(dirty_timer_);
  save_pending_ = false;
  save_config_();
}

void Lv6ConfigStore::update_zone(uint8_t zone, const ZoneConfig &zone_cfg) {
  if (zone >= NUM_ZONES)
    return;
  if (mutex_ == nullptr) {
    config_.zones[zone] = zone_cfg;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.zones[zone] = zone_cfg;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_system(const SystemConfig &system) {
  if (mutex_ == nullptr) {
    config_.system = system;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.system = system;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_control(const ControlConfig &ctrl) {
  if (mutex_ == nullptr) {
    config_.control = ctrl;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.control = ctrl;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_probes(const ProbeConfig &probes) {
  if (mutex_ == nullptr) {
    config_.probes = probes;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.probes = probes;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::set_zone_return_probe(uint8_t zone, int8_t probe) {
  if (zone >= NUM_ZONES)
    return;
  if (mutex_ == nullptr) {
    if (config_.probes.zone_return_probe[zone] == probe)
      return;
    config_.probes.zone_return_probe[zone] = probe;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  const bool changed = config_.probes.zone_return_probe[zone] != probe;
  if (changed)
    config_.probes.zone_return_probe[zone] = probe;
  xSemaphoreGive(mutex_);
  if (changed)
    mark_dirty();
}

void Lv6ConfigStore::update_pid(const PIDParams &pid) {
  if (mutex_ == nullptr) {
    config_.pid = pid;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.pid = pid;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_motor(const MotorConfig &motor) {
  if (mutex_ == nullptr) {
    config_.motor = motor;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.motor = motor;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_sensor_config(const SensorConfig &sensor_config) {
  if (mutex_ == nullptr) {
    config_.sensor_config = sensor_config;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.sensor_config = sensor_config;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_balancing(const BalancingConfig &balancing) {
  if (mutex_ == nullptr) {
    config_.balancing = balancing;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.balancing = balancing;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

AuthorityConfig Lv6ConfigStore::get_authority_config() const {
  if (mutex_ == nullptr)
    return config_.authority;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  AuthorityConfig copy = config_.authority;
  xSemaphoreGive(mutex_);
  return copy;
}

void Lv6ConfigStore::update_authority(const AuthorityConfig &authority) {
  AuthorityConfig sanitized = authority;
  trim_copy(sanitized.installation_id, sizeof(sanitized.installation_id), authority.installation_id);
  trim_copy(sanitized.coordinator_id, sizeof(sanitized.coordinator_id), authority.coordinator_id);
  trim_copy(sanitized.shared_key, sizeof(sanitized.shared_key), authority.shared_key);

  if (mutex_ == nullptr) {
    config_.authority = sanitized;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.authority = sanitized;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Lv6ConfigStore::update_house_physics(const HousePhysicsConfig &house) {
  HousePhysicsConfig sanitized = house;
  sanitized.u_base = std::clamp(sanitized.u_base, 0.1f, 2.0f);
  sanitized.u_wall = std::clamp(sanitized.u_wall, 0.0f, 2.0f);
  sanitized.c_struct = std::clamp(sanitized.c_struct, 0.0f, 0.30f);
  if (mutex_ == nullptr) {
    config_.house_physics = sanitized;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.house_physics = sanitized;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

HousePhysicsConfig Lv6ConfigStore::get_house_physics() const {
  if (mutex_ == nullptr)
    return config_.house_physics;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  HousePhysicsConfig copy = config_.house_physics;
  xSemaphoreGive(mutex_);
  return copy;
}

void Lv6ConfigStore::update_groups(const GroupsConfig &groups) {
  if (mutex_ == nullptr) {
    config_.groups = groups;
    group_model::apply_sync_mirror(config_.groups, config_.zones);
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.groups = groups;
  group_model::apply_sync_mirror(config_.groups, config_.zones);
  xSemaphoreGive(mutex_);
  mark_dirty();
}

GroupsConfig Lv6ConfigStore::get_groups() const {
  if (mutex_ == nullptr)
    return config_.groups;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  GroupsConfig copy = config_.groups;
  xSemaphoreGive(mutex_);
  return copy;
}

void Lv6ConfigStore::save_motor_telemetry(uint8_t motor, const MotorTelemetry &telemetry) {
  if (motor >= NUM_ZONES)
    return;

  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;

  char key[8];
  snprintf(key, sizeof(key), "%s%d", KEY_MOTOR_PFX, motor);
  nvs_set_blob(handle, key, &telemetry, sizeof(MotorTelemetry));
  nvs_commit(handle);
  nvs_close(handle);
}

bool Lv6ConfigStore::load_motor_telemetry(uint8_t motor, MotorTelemetry &telemetry) {
  if (motor >= NUM_ZONES)
    return false;

  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return false;

  char key[8];
  snprintf(key, sizeof(key), "%s%d", KEY_MOTOR_PFX, motor);
  size_t size = 0;
  esp_err_t err = nvs_get_blob(handle, key, nullptr, &size);
  if (err != ESP_OK) {
    nvs_close(handle);
    return false;
  }

  if (size == sizeof(MotorTelemetry)) {
    size_t read_size = sizeof(MotorTelemetry);
    err = nvs_get_blob(handle, key, &telemetry, &read_size);
  } else {
    err = ESP_ERR_NVS_INVALID_LENGTH;
  }
  nvs_close(handle);
  return err == ESP_OK;
}

void Lv6ConfigStore::set_drivers_enabled_pref(bool enabled) {
  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK) {
    ESP_LOGW(TAG, "NVS open for drivers pref failed");
    return;
  }
  const uint8_t v = enabled ? 1 : 0;
  esp_err_t err = nvs_set_u8(handle, KEY_DRIVERS_EN, v);
  if (err == ESP_OK)
    err = nvs_commit(handle);
  nvs_close(handle);
  if (err != ESP_OK) {
    ESP_LOGW(TAG, "Failed to persist drivers_enabled=%d: %s",
             enabled ? 1 : 0, esp_err_to_name(err));
    return;
  }
  ESP_LOGI(TAG, "Persisted drivers_enabled=%s", enabled ? "on" : "off");
}

bool Lv6ConfigStore::load_drivers_enabled_pref(bool *out) const {
  if (out == nullptr)
    return false;
  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return false;
  uint8_t v = 0;
  esp_err_t err = nvs_get_u8(handle, KEY_DRIVERS_EN, &v);
  nvs_close(handle);
  if (err != ESP_OK)
    return false;
  *out = (v != 0);
  return true;
}

// -----------------------------------------------------------------------------
// Sensor pairing (BLE MAC + temp source) — persisted under its own key so it
// survives the version-based discard of the main config blob on firmware update.
// Blob format: [uint32 version][SensorConfig].
// -----------------------------------------------------------------------------

void Lv6ConfigStore::save_sensor_config_(nvs_handle_t handle, const SensorConfig &sensor) {
  uint8_t blob[sizeof(uint32_t) + sizeof(SensorConfig)];
  uint32_t version = SENSOR_CONFIG_VERSION;
  memcpy(blob, &version, sizeof(uint32_t));
  memcpy(blob + sizeof(uint32_t), &sensor, sizeof(SensorConfig));
  nvs_set_blob(handle, KEY_SENSORS, blob, sizeof(blob));
}

bool Lv6ConfigStore::load_sensor_config_(nvs_handle_t handle) {
  size_t size = 0;
  if (nvs_get_blob(handle, KEY_SENSORS, nullptr, &size) != ESP_OK)
    return false;  // no durable copy yet (first boot, or pre-upgrade firmware)
  if (size < sizeof(uint32_t))
    return false;

  std::vector<uint8_t> blob(size);
  size_t read_size = size;
  if (nvs_get_blob(handle, KEY_SENSORS, blob.data(), &read_size) != ESP_OK)
    return false;

  uint32_t version = 0;
  memcpy(&version, blob.data(), sizeof(uint32_t));
  const size_t payload = read_size - sizeof(uint32_t);

  xSemaphoreTake(mutex_, portMAX_DELAY);
  bool ok = false;
  if (version == SENSOR_CONFIG_VERSION && payload == sizeof(SensorConfig)) {
    memcpy(&config_.sensor_config, blob.data() + sizeof(uint32_t), sizeof(SensorConfig));
    ok = true;
  } else if (version == SENSOR_CONFIG_VERSION_V2 && payload == SENSOR_CONFIG_V2_SIZE) {
    memcpy(&config_.sensor_config, blob.data() + sizeof(uint32_t), SENSOR_CONFIG_V2_SIZE);
    ok = true;
  } else if (version == SENSOR_CONFIG_VERSION_V1 && payload == SENSOR_CONFIG_V1_SIZE) {
    // Append-only growth: keep pairing, leave room-clock / EXTERNAL fields at defaults.
    memcpy(&config_.sensor_config, blob.data() + sizeof(uint32_t), SENSOR_CONFIG_V1_SIZE);
    ok = true;
  }
  xSemaphoreGive(mutex_);
  if (ok)
    ESP_LOGI(TAG, "Sensor pairing restored from durable key (v%" PRIu32 ")", version);
  return ok;
}

// -----------------------------------------------------------------------------
// Zone configuration — persisted under its own key so the user's area / pipe /
// exterior-wall settings survive the version-based discard of the main config
// blob on firmware update. Blob format: [uint32 version][ZoneConfig x NUM_ZONES].
// -----------------------------------------------------------------------------

void Lv6ConfigStore::save_zone_config_(nvs_handle_t handle, const ZoneConfig (&zones)[NUM_ZONES]) {
  uint8_t blob[sizeof(uint32_t) + sizeof(ZoneConfig) * NUM_ZONES];
  uint32_t version = ZONE_CONFIG_VERSION;
  memcpy(blob, &version, sizeof(uint32_t));
  memcpy(blob + sizeof(uint32_t), zones, sizeof(ZoneConfig) * NUM_ZONES);
  nvs_set_blob(handle, KEY_ZONES, blob, sizeof(blob));
}

bool Lv6ConfigStore::load_zone_config_(nvs_handle_t handle) {
  size_t size = 0;
  if (nvs_get_blob(handle, KEY_ZONES, nullptr, &size) != ESP_OK)
    return false;  // no durable copy yet (first boot, or pre-upgrade firmware)

  std::vector<uint8_t> blob(size);
  size_t read_size = size;
  if (nvs_get_blob(handle, KEY_ZONES, blob.data(), &read_size) != ESP_OK)
    return false;
  if (read_size < sizeof(uint32_t))
    return false;

  uint32_t version = 0;
  memcpy(&version, blob.data(), sizeof(uint32_t));

  if (zone_config_blob_is_current(version, read_size)) {
    xSemaphoreTake(mutex_, portMAX_DELAY);
    memcpy(config_.zones, blob.data() + sizeof(uint32_t), sizeof(ZoneConfig) * NUM_ZONES);
    xSemaphoreGive(mutex_);
    ESP_LOGI(TAG, "Zone config restored from durable key (v%" PRIu32 ")", version);
    return true;
  }

  // v5 → v6 append-only migration: copy preserved prefix; physics fields keep
  // struct defaults (unset slab/covering, walls=0, no learned UA).
  if (zone_config_blob_is_v5(version, read_size)) {
    xSemaphoreTake(mutex_, portMAX_DELAY);
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      ZoneConfig z{};
      memcpy(&z, blob.data() + sizeof(uint32_t) + i * ZONE_CONFIG_V5_SIZE, ZONE_CONFIG_V5_SIZE);
      // Contract §11: migrated loops are unset until provisioned.
      z.exterior_walls = 0;
      z.slab_type = SlabType::UNSET;
      z.covering = CoveringType::UNSET;
      z.active_thickness_cm = 0.0f;
      z.r_override_m2k_per_w = NAN;
      z.ua_weight_override = 1.0f;
      z.ua_learned_w_per_k = NAN;
      z.ua_learned_confidence = NAN;
      z.ua_learned_observed_days = 0;
      z.ua_learned_ts_epoch_s = 0;
      z.tau_learned_h = NAN;
      z.wind_exposure = 0.0f;
      z.solar_gain = 0.0f;
      config_.zones[i] = z;
    }
    // Seed groups from legacy sync_to_zone stars when groups section is empty.
    bool any_group = false;
    for (uint8_t i = 0; i < MAX_GROUPS; i++) {
      if (group_model::group_active(config_.groups.groups[i])) {
        any_group = true;
        break;
      }
    }
    if (!any_group)
      config_.groups = group_model::from_sync_to_zone(config_.zones);
    xSemaphoreGive(mutex_);
    ESP_LOGI(TAG, "Zone config migrated v5→v6 from durable key");
    return true;
  }

  ESP_LOGW(TAG, "Zone config blob incompatible (v%" PRIu32 ", %u bytes); keeping defaults",
           version, static_cast<unsigned>(read_size));
  return false;
}

bool Lv6ConfigStore::nvs_namespace_has_config_(const char *ns) {
  nvs_handle_t handle;
  if (nvs_open(ns, NVS_READONLY, &handle) != ESP_OK)
    return false;

  const char *keys[] = {
      KEY_CONFIG, KEY_SENSORS, KEY_ZONES, KEY_SYSTEM, KEY_CONTROL, KEY_PROBES,
      KEY_PID, KEY_MOTOR_CFG, KEY_MANIFOLD, KEY_BALANCING, KEY_AUTHORITY,
      KEY_HOUSE_PHYS, KEY_GROUPS,
  };
  bool found = false;
  for (const char *key : keys) {
    size_t size = 0;
    if (nvs_get_blob(handle, key, nullptr, &size) == ESP_OK && size > 0) {
      found = true;
      break;
    }
  }
  if (!found) {
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      char key[8];
      snprintf(key, sizeof(key), "%s%u", KEY_MOTOR_PFX, static_cast<unsigned>(i));
      size_t size = 0;
      if (nvs_get_blob(handle, key, nullptr, &size) == ESP_OK && size > 0) {
        found = true;
        break;
      }
    }
  }
  nvs_close(handle);
  return found;
}

void Lv6ConfigStore::migrate_legacy_nvs_namespace_() {
  if (nvs_namespace_has_config_(NVS_NAMESPACE))
    return;
  if (!nvs_namespace_has_config_(NVS_NAMESPACE_LEGACY))
    return;

  nvs_handle_t src = 0;
  nvs_handle_t dst = 0;
  if (nvs_open(NVS_NAMESPACE_LEGACY, NVS_READONLY, &src) != ESP_OK)
    return;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &dst) != ESP_OK) {
    nvs_close(src);
    return;
  }

  const char *keys[] = {
      KEY_CONFIG, KEY_SENSORS, KEY_ZONES, KEY_SYSTEM, KEY_CONTROL, KEY_PROBES,
      KEY_PID, KEY_MOTOR_CFG, KEY_MANIFOLD, KEY_BALANCING, KEY_AUTHORITY,
      KEY_HOUSE_PHYS, KEY_GROUPS,
  };
  uint32_t copied = 0;
  auto copy_blob = [&](const char *key) {
    size_t size = 0;
    if (nvs_get_blob(src, key, nullptr, &size) != ESP_OK || size == 0)
      return;
    std::vector<uint8_t> buf(size);
    size_t read_size = size;
    if (nvs_get_blob(src, key, buf.data(), &read_size) != ESP_OK)
      return;
    if (nvs_set_blob(dst, key, buf.data(), read_size) == ESP_OK)
      copied++;
  };

  for (const char *key : keys)
    copy_blob(key);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    char key[8];
    snprintf(key, sizeof(key), "%s%u", KEY_MOTOR_PFX, static_cast<unsigned>(i));
    copy_blob(key);
  }

  nvs_commit(dst);
  nvs_close(src);
  nvs_close(dst);

  ESP_LOGW(TAG, "Migrated %" PRIu32 " NVS key(s) from legacy '%s' → '%s'",
           copied, NVS_NAMESPACE_LEGACY, NVS_NAMESPACE);

  // Drop the legacy namespace so a later factory erase does not leave a stale
  // copy, and so the HeatValve-era name disappears from the partition table.
  nvs_handle_t legacy = 0;
  if (nvs_open(NVS_NAMESPACE_LEGACY, NVS_READWRITE, &legacy) == ESP_OK) {
    nvs_erase_all(legacy);
    nvs_commit(legacy);
    nvs_close(legacy);
  }
}

bool Lv6ConfigStore::erase_namespace() {
  if (!initialized_)
    return false;

  // Prevent a deferred write from racing with the erase operation.
  if (dirty_timer_)
    esp_timer_stop(dirty_timer_);

  auto erase_one = [](const char *ns) -> bool {
    nvs_handle_t handle;
    esp_err_t err = nvs_open(ns, NVS_READWRITE, &handle);
    if (err == ESP_ERR_NVS_NOT_FOUND)
      return true;  // already gone
    if (err != ESP_OK) {
      ESP_LOGE(TAG, "NVS open for erase ('%s') failed: %s", ns, esp_err_to_name(err));
      return false;
    }
    err = nvs_erase_all(handle);
    if (err != ESP_OK) {
      ESP_LOGE(TAG, "NVS erase ('%s') failed: %s", ns, esp_err_to_name(err));
      nvs_close(handle);
      return false;
    }
    err = nvs_commit(handle);
    nvs_close(handle);
    if (err != ESP_OK) {
      ESP_LOGE(TAG, "NVS commit after erase ('%s') failed: %s", ns, esp_err_to_name(err));
      return false;
    }
    return true;
  };

  if (!erase_one(NVS_NAMESPACE))
    return false;
  // Best-effort: also clear any leftover HeatValve-era namespace.
  erase_one(NVS_NAMESPACE_LEGACY);

  ESP_LOGW(TAG, "Erased NVS namespace '%s'", NVS_NAMESPACE);
  return true;
}

bool Lv6ConfigStore::erase_namespace_and_restart() {
  if (!erase_namespace())
    return false;

  ESP_LOGW(TAG, "Restarting after NVS erase");
  esp_restart();
  return true;
}

// =============================================================================
// Private
// =============================================================================

void Lv6ConfigStore::load_config_() {
  nvs_handle_t handle;
  esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle);
  if (err == ESP_ERR_NVS_NOT_FOUND) {
    ESP_LOGI(TAG, "No saved config, using defaults");
    return;
  }
  if (err != ESP_OK) {
    ESP_LOGW(TAG, "NVS open failed: %s", esp_err_to_name(err));
    return;
  }

  bool normalize_main_config_version = false;
  size_t stored_size = 0;
  err = nvs_get_blob(handle, KEY_CONFIG, nullptr, &stored_size);
  if (err == ESP_OK && stored_size > 0) {
    std::vector<uint8_t> raw(stored_size);
    size_t read_size = stored_size;
    err = nvs_get_blob(handle, KEY_CONFIG, raw.data(), &read_size);
    if (err == ESP_OK) {
      // The all-in-one blob is now only a legacy fallback. Keep same-size blobs
      // even when their coarse version differs, then normalize the marker on the
      // next commit. Real reset boundaries live in the per-section versions.
      uint32_t stored_version = 0;
      if (read_size >= sizeof(uint32_t))
        memcpy(&stored_version, raw.data(), sizeof(uint32_t));

      if (read_size == sizeof(DeviceConfig)) {
        xSemaphoreTake(mutex_, portMAX_DELAY);
        memcpy(&config_, raw.data(), sizeof(DeviceConfig));
        config_.config_version = CONFIG_VERSION;
        xSemaphoreGive(mutex_);
        normalize_main_config_version = (stored_version != CONFIG_VERSION);
        if (normalize_main_config_version) {
          ESP_LOGI(TAG, "Config loaded from compatible legacy blob (%u bytes, stored v%" PRIu32 ", normalized to v%" PRIu32 ")",
                   (unsigned) read_size, stored_version, CONFIG_VERSION);
        } else {
          ESP_LOGI(TAG, "Config loaded (%u bytes, version %" PRIu32 ")", (unsigned) read_size, stored_version);
        }
      } else {
        ESP_LOGW(TAG, "Config size mismatch (stored v%" PRIu32 " %u bytes, expected v%" PRIu32 " %u bytes), using defaults",
                 stored_version, static_cast<unsigned>(read_size),
                 CONFIG_VERSION, static_cast<unsigned>(sizeof(DeviceConfig)));
      }
    }
  }

  // Overlay the durable sensor pairing and zone config on top of whatever the
  // main blob loaded (or the defaults, when the main blob was size-discarded
  // above).
  bool had_durable_sensors = load_sensor_config_(handle);
  bool had_durable_zones = load_zone_config_(handle);

  // Overlay the remaining durable global-settings sections (each independent of
  // the legacy main-blob version). Done under the mutex; the section loaders are plain memcpys
  // (they don't take the mutex themselves, so no re-entrancy).
  bool had_all_sections = true;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  had_all_sections &= load_section(handle, KEY_SYSTEM, SYSTEM_CONFIG_VERSION, config_.system);
  had_all_sections &= load_section(handle, KEY_CONTROL, CONTROL_CONFIG_VERSION, config_.control);
  {
    // Stale probes blobs are reset to ProbeConfig{} inside load_section. An
    // *absent* section still falls back to the main blob — rewrite the pre-v2
    // factory map (zones→P1–P6, manifold P7/P8) so return-temperature probes
    // stay disabled until the user enables them.
    const bool had_probes =
        load_section(handle, KEY_PROBES, PROBE_CONFIG_VERSION, config_.probes);
    if (!had_probes && config_.probes.manifold_flow_probe == 6 &&
        config_.probes.manifold_return_probe == 7) {
      bool legacy_zones = true;
      for (uint8_t z = 0; z < NUM_ZONES; z++) {
        if (config_.probes.zone_return_probe[z] != static_cast<int8_t>(z)) {
          legacy_zones = false;
          break;
        }
      }
      if (legacy_zones) {
        ESP_LOGW(TAG, "Section 'probes' carried pre-v2 factory map; resetting to defaults");
        config_.probes = ProbeConfig{};
      }
    }
    had_all_sections &= had_probes;
  }
  had_all_sections &= load_section(handle, KEY_PID, PID_CONFIG_VERSION, config_.pid);
  had_all_sections &= load_section(handle, KEY_MOTOR_CFG, MOTOR_CONFIG_VERSION, config_.motor);
  had_all_sections &= load_section(handle, KEY_MANIFOLD, MANIFOLD_CONFIG_VERSION, config_.manifold_type);
  had_all_sections &= load_section(handle, KEY_BALANCING, BALANCING_CONFIG_VERSION, config_.balancing);
  bool had_authority = load_section(handle, KEY_AUTHORITY, AUTHORITY_CONFIG_VERSION, config_.authority);
  if (!had_authority)
    had_authority = load_legacy_authority(handle, config_.authority);
  had_all_sections &= had_authority;
  had_all_sections &= load_section(handle, KEY_HOUSE_PHYS, HOUSE_PHYSICS_CONFIG_VERSION,
                                   config_.house_physics);
  bool had_groups = load_section(handle, KEY_GROUPS, GROUPS_CONFIG_VERSION, config_.groups);
  if (!had_groups) {
    // First boot of groups section: derive from sync_to_zone on current zones.
    config_.groups = group_model::from_sync_to_zone(config_.zones);
  }
  had_all_sections &= had_groups;
  xSemaphoreGive(mutex_);
  if (had_all_sections)
    ESP_LOGI(TAG, "Global settings restored from durable keys");

  nvs_close(handle);

  // Migration: a returning device whose settings only lived in the main blob has
  // no durable copies yet. Seed them now (deferred commit) while the data is
  // still present, so they survive future main-blob resets.
  if (normalize_main_config_version || !had_durable_sensors || !had_durable_zones || !had_all_sections)
    mark_dirty();
}

void Lv6ConfigStore::save_config_() {
  if (mutex_ == nullptr)
    return;

  DeviceConfig snapshot;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  snapshot = config_;
  snapshot.config_version = CONFIG_VERSION;
  config_.config_version = CONFIG_VERSION;
  xSemaphoreGive(mutex_);

  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;

  nvs_set_blob(handle, KEY_CONFIG, &snapshot, sizeof(DeviceConfig));

  // Mirror the sensor pairing and zone config to their own keys so they outlive
  // any reset of the legacy all-in-one config blob.
  save_sensor_config_(handle, snapshot.sensor_config);
  save_zone_config_(handle, snapshot.zones);

  // Mirror the remaining global-settings sections likewise — each under its own
  // versioned key so legacy main-blob resets no longer wipe the user's settings.
  save_section(handle, KEY_SYSTEM, SYSTEM_CONFIG_VERSION, snapshot.system);
  save_section(handle, KEY_CONTROL, CONTROL_CONFIG_VERSION, snapshot.control);
  save_section(handle, KEY_PROBES, PROBE_CONFIG_VERSION, snapshot.probes);
  save_section(handle, KEY_PID, PID_CONFIG_VERSION, snapshot.pid);
  save_section(handle, KEY_MOTOR_CFG, MOTOR_CONFIG_VERSION, snapshot.motor);
  save_section(handle, KEY_MANIFOLD, MANIFOLD_CONFIG_VERSION, snapshot.manifold_type);
  save_section(handle, KEY_BALANCING, BALANCING_CONFIG_VERSION, snapshot.balancing);
  save_section(handle, KEY_AUTHORITY, AUTHORITY_CONFIG_VERSION, snapshot.authority);
  save_section(handle, KEY_HOUSE_PHYS, HOUSE_PHYSICS_CONFIG_VERSION, snapshot.house_physics);
  save_section(handle, KEY_GROUPS, GROUPS_CONFIG_VERSION, snapshot.groups);

  nvs_commit(handle);
  nvs_close(handle);
  ESP_LOGI(TAG, "Config saved to NVS");
}

void Lv6ConfigStore::dirty_timer_cb_(void *arg) {
  auto *store = static_cast<Lv6ConfigStore *>(arg);
  if (store == nullptr)
    return;
  // Mark dirty (legacy flag preserved for diagnostics) and wake the NVS
  // task. xSemaphoreGive coalesces \u2014 if the task is already running, the
  // pending give is harmless and the next iteration will pick up the
  // newest snapshot.
  store->save_pending_ = true;
  if (store->save_sem_ != nullptr)
    xSemaphoreGive(store->save_sem_);
}

void Lv6ConfigStore::nvs_task_entry_(void *arg) {
  auto *store = static_cast<Lv6ConfigStore *>(arg);
  if (store != nullptr)
    store->nvs_task_loop_();
  vTaskDelete(nullptr);
}

void Lv6ConfigStore::nvs_task_loop_() {
  ESP_LOGI(TAG, "NVS persistence task started (core %d, prio %u, stack %u)",
           (int) NVS_TASK_CORE, (unsigned) NVS_TASK_PRIO, (unsigned) NVS_TASK_STACK);
  for (;;) {
    if (xSemaphoreTake(save_sem_, portMAX_DELAY) != pdTRUE)
      continue;
    // Coalesce bursts: drain any additional gives so we don't write twice
    // for a back-to-back batch of dirty marks.
    while (xSemaphoreTake(save_sem_, 0) == pdTRUE) {
    }
    save_pending_ = false;
    save_config_();
  }
}

}  // namespace lv6
