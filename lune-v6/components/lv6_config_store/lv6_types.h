// =============================================================================
// LV6 Shared Types — Configuration structs, enums, and constants
// =============================================================================
// Single source of truth for all HeatValve-6 data types.
// Ported directly from src/app_config.h, adapted for ESPHome.
// =============================================================================

#pragma once

#include <cstdint>
#include <cstddef>
#include <cmath>
#include <cstring>
#include <strings.h>
#include <algorithm>
#include <array>

namespace lv6 {

// =============================================================================
// Constants
// =============================================================================

static constexpr uint8_t NUM_ZONES = 6;
static constexpr uint8_t MAX_PROBES = 8;
static constexpr int8_t PROBE_UNASSIGNED = -1;
static constexpr uint32_t I2C_FREQ_HZ = 100000;
static constexpr float IPROPI_RESISTOR_OHM = 5100.0f;
static constexpr float IPROPI_GAIN_UA_A = 5320.0f;
static constexpr float IPROPI_DIVISOR = 0.027132f;

// =============================================================================
// Enums
// =============================================================================

enum class ControlAlgorithm : uint8_t {
  TANH = 0,
  LINEAR = 1,
  PID = 2,
  ADAPTIVE = 3,
};

enum class ZoneState : int8_t {
  UNKNOWN = -1,
  OVERHEATED = 0,
  SATISFIED = 1,
  DEMAND = 2,
};

enum class ZoneDisplayState : int8_t {
  UNKNOWN = -1,
  OFF = 0,
  MANUAL = 1,
  CALIBRATING = 2,
  WAITING_CALIBRATION = 3,
  WAITING_ROOM_TEMP = 4,
  HEATING = 5,
  IDLE = 6,
  OVERHEATED = 7,
};

enum class SystemConditionState : int8_t {
  UNKNOWN = -1,
  NORMAL = 0,
  ABOVE_SETPOINT = 1,
  OVERHEATED = 2,
};

enum class ControllerState : int8_t {
  UNKNOWN = -1,
  OFF = 0,
  MANUAL = 1,
  CALIBRATING = 2,
  WAITING_INPUT = 3,
  IDLE = 4,
  HEATING = 5,
  MIXED = 6,
  FAULT = 7,
};

enum class MotorDirection : int8_t {
  CLOSE = 0,
  OPEN = 1,
};

enum class MotorProfile : uint8_t {
  INHERIT = 0,
  GENERIC = 1,
  HMIP_VDMOT = 2,
};

enum class FaultCode : uint8_t {
  NONE = 0,
  OPEN_CIRCUIT = 1,
  BLOCKED = 2,
  TIMEOUT = 3,
  OVERCURRENT = 4,
  THERMAL = 5,
  STALL = 6,
  UNKNOWN_FAULT = 7,
  MECHANICAL_OVERRUN = 8,
};

enum class MotorFsmState : uint8_t {
  IDLE = 0,
  BOOST = 1,
  HOLD = 2,
  STOPPING = 3,
};

enum class PipeType : uint8_t {
  PEX_12X2 = 0,
  PEX_14X2 = 1,
  PEX_16X2 = 2,
  PEX_17X2 = 3,
  PEX_18X2 = 4,
  PEX_20X2 = 5,
  ALUPEX_16X2 = 6,
  ALUPEX_20X2 = 7,
};

enum class FloorType : uint8_t {
  TILE = 0,
  PARQUET = 1,
  OAK = 2,
  CARPET = 3,
};

/// Room-physics contract v1 — active floor construction (loop-owned).
enum class SlabType : uint8_t {
  CAST_CONCRETE = 0,
  SCREED = 1,
  DRY_PLATES = 2,
  TIMBER_JOISTS = 3,
  UNSET = 255,
};

/// Room-physics contract v1 — floor covering (loop-owned).
enum class CoveringType : uint8_t {
  TILE_STONE = 0,
  VINYL_LINOLEUM = 1,
  PARQUET_LAMINATE = 2,
  CARPET = 3,
  UNSET = 255,
};

/// Origin of calibrated house-physics unit parameters.
enum class PhysicsParamSource : uint8_t {
  DEFAULT = 0,
  CALIBRATED = 1,
};

/// How a loop participates in a manifold group.
enum class GroupRole : uint8_t {
  SINGLE = 0,
  PRIMARY = 1,
  MEMBER = 2,
};

/// Local heating control law. Heat-pump mode keeps loops mostly open so the
/// source can settle at the lowest constant feed temperature; Normal closes
/// zones at setpoint like a classic boiler manifold. Touch may override the
/// effective mode while its lease is active.
enum class HeatingProfile : uint8_t {
  NORMAL = 0,     ///< Boiler / gas / district — close at setpoint
  HEAT_PUMP = 1,  ///< Continuous distribution — base opening + soft overheat trim
};

enum class ManifoldType : uint8_t {
  NO = 0,
  NC = 1,
};

enum class TempSource : uint8_t {
  LOCAL_PROBE = 0,
  BLE_SENSOR = 1,
  EXTERNAL = 2,  ///< Wi‑Fi HTTP ingest (sensor_id → zone on V6)
};

/// Hydraulic-balancing strategy. STATIC uses the resistance-aware design model
/// only; ADAPTIVE adds a slow room-temperature correction on top (no return
/// probes); RETURN_TEMP is the legacy ΔT-from-return-probe balancer (superseded
/// by ADAPTIVE, kept for back-compat). See docs/adaptive_balancing.md.
enum class BalanceMode : uint8_t {
  STATIC = 0,
  RETURN_TEMP = 1,
  ADAPTIVE = 2,
};

static constexpr TempSource DEFAULT_ZONE_TEMP_SOURCE = TempSource::BLE_SENSOR;

/// What the zone's local DS18B20 probe measures.
enum class ProbeRole : uint8_t {
  ROOM_TEMPERATURE = 0,   ///< Measures room/air temperature (used as control input)
  RETURN_WATER = 1,       ///< Measures return-pipe water temperature (enables dynamic balancing)
};

// =============================================================================
// Configuration Structs
// =============================================================================

struct ZoneConfig {
  bool enabled = true;
  float area_m2 = 15.0f;
  float max_opening_pct = 90.0f;
  PipeType pipe_type = PipeType::PEX_16X2;
  FloorType floor_type = FloorType::TILE;
  float pipe_spacing_mm = 200.0f;
  float floor_cover_thickness_mm = 15.0f;
  float setpoint_c = 21.0f;
  ControlAlgorithm algorithm = ControlAlgorithm::TANH;
  float heat_loss_w_m2 = 35.0f;
  float supply_pipe_length_m = 2.0f;
  float cooling_delta_c = 5.0f;
  float concrete_thickness_mm = 50.0f;
  char name[16] = "";
  ProbeRole probe_role = ProbeRole::ROOM_TEMPERATURE;
  int8_t sync_to_zone = -1;  ///< -1 = independent, 0–5 = synced to that zone (shares setpoint + avg temp)
  MotorProfile motor_profile_override = MotorProfile::INHERIT;
  // Motor-specific endstop tuning (0.0 = use global default from MotorConfig)
  float motor_close_current_factor_override = 0.0f;  ///< Per-motor close threshold (slower motors may need 1.6x vs 1.7x to avoid premature pop-off)
  float motor_open_current_factor_override = 0.0f;   ///< Per-motor open threshold
  // Helios-3 per-zone setpoint offset safety limits
  float min_offset_c = -2.0f;  ///< Minimum setpoint offset from Helios (firmware safety clamp)
  float max_offset_c = 2.0f;   ///< Maximum setpoint offset from Helios (firmware safety clamp)
  float abs_min_c = 5.0f;      ///< Absolute minimum effective setpoint (overrides all offsets)
  float abs_max_c = 30.0f;     ///< Absolute maximum effective setpoint (overrides all offsets)
  // Adaptive balancing — learned room-temp correction multiplier (adapt_i). Rides
  // on top of the resistance-aware static prior; persisted in the durable zones
  // blob so it survives legacy main-config resets. See docs/adaptive_balancing.md.
  float balance_adapt = 1.0f;
  // Simple preheat — learned per-zone head-start (°C above setpoint to start
  // heating so the zone reaches temperature on time). Adapts over time; persisted
  // so the device doesn't have to re-learn from zero after every reboot.
  float preheat_advance_c = 0.0f;

  // --- Room physics contract v1 (appended; v5→v6 migrates with unset defaults) ---
  uint8_t exterior_walls = 0;  ///< Bitmask N=1 E=2 S=4 W=8; validate 0–15
  SlabType slab_type = SlabType::UNSET;
  CoveringType covering = CoveringType::UNSET;
  float active_thickness_cm = 0.0f;  ///< 0 → type default; ignored for dry/timber
  float r_override_m2k_per_w = NAN;  ///< NaN = none; clamp 0–0.25 when set
  float ua_weight_override = 1.0f;   ///< 0.25–4.0
  float ua_learned_w_per_k = NAN;    ///< NaN = absent
  float ua_learned_confidence = NAN;
  uint16_t ua_learned_observed_days = 0;
  uint32_t ua_learned_ts_epoch_s = 0;
  float tau_learned_h = NAN;  ///< NaN = absent; local τ for absorb mass scale
  // Back-compat only — Touch owns weather; V6 stores but does not use for control.
  float wind_exposure = 0.0f;
  float solar_gain = 0.0f;
};

/// Unit/house thermal parameters (defaults; Touch may calibrate).
struct HousePhysicsConfig {
  float u_base = 0.5f;   ///< W/(m²·K)
  float u_wall = 0.4f;   ///< W/(m²·K) per exterior wall
  float c_struct = 0.06f;  ///< kWh/(m²·K) walls/furniture
  PhysicsParamSource source = PhysicsParamSource::DEFAULT;
  uint32_t calibrated_at_epoch_s = 0;
};

struct ControlConfig {
  float comfort_band_c = 0.5f;
  float maintenance_base_pct = 15.0f;  ///< Normal-mode satisfied opening (and heat-pump trim floor default)
  float demand_boost_pct = 30.0f;
  float boost_factor = 1.0f;
  float min_movement_pct = 5.0f;
  float tanh_steepness = 0.70f;
  bool simple_preheat_enabled = true;
  // Preheat absorption — when Lune Touch pre-buffers
  // the slab, hot water arrives while no zone demands heat. Without this, zones
  // hit OVERHEATED and close, blocking the buffer. While absorbing, the overheat
  // cutoff is raised by preheat_absorb_band_c (scaled per zone by floor thermal
  // mass) so satisfied zones keep their maintenance opening.
  bool preheat_absorb_enabled = true;
  float preheat_absorb_band_c = 1.0f;   ///< Extra °C above comfort band before OVERHEATED while absorbing
  float preheat_detect_delta_c = 8.0f;  ///< Flow must exceed house-average temp by this to detect pre-buffering
  // Heating mode — local law when Touch is not coordinating. Default HEAT_PUMP
  // preserves today's continuous-distribution behaviour for existing installs.
  HeatingProfile mode = HeatingProfile::HEAT_PUMP;
  float hp_overheat_margin_c = 1.0f;  ///< °C above setpoint before a heat-pump zone closes
  float hp_base_pct = 60.0f;          ///< Satisfied opening in heat-pump mode (keeps floors open)
  float hp_trim_floor_pct = 15.0f;    ///< Soft-trim floor between setpoint and overheat margin
};

struct ProbeConfig {
  // Probe indices are 0-based (Probe 1 = index 0).
  // Defaults: P1 flow, P2 manifold return. Zone return probes stay unassigned
  // until return-temperature mode is enabled (then Zone N → Probe N+2). The
  // enable toggle is not a separate NVS bit — disabled means every
  // zone_return_probe[] entry is PROBE_UNASSIGNED (persisted under KEY_PROBES).
  int8_t manifold_flow_probe = 0;    // Probe 1
  int8_t manifold_return_probe = 1;  // Probe 2
  int8_t zone_return_probe[NUM_ZONES] = {
      PROBE_UNASSIGNED, PROBE_UNASSIGNED, PROBE_UNASSIGNED,
      PROBE_UNASSIGNED, PROBE_UNASSIGNED, PROBE_UNASSIGNED,
  };
};

static constexpr uint8_t BLE_MAC_LEN = 18;  // "AA:BB:CC:DD:EE:FF" + null
static constexpr uint8_t SENSOR_ID_LEN = 48;   ///< EXTERNAL producer id (MAC or hub entity id)
static constexpr uint8_t SENSOR_NAME_LEN = 24; ///< Optional friendly label (UI only)

static constexpr uint8_t GROUP_ID_LEN = 8;
static constexpr uint8_t GROUP_MAX_SENSORS = 4;
static constexpr uint8_t MAX_GROUPS = NUM_ZONES;

/// Explicit manifold group (star: one primary + zero or more members).
struct GroupConfig {
  char group_id[GROUP_ID_LEN] = "";
  int8_t primary_loop = -1;  ///< -1 = inactive slot
  uint8_t member_mask = 0;   ///< Bits for members excluding primary; primary always counted in group
  bool include_in_house_temperature = true;
  uint32_t revision = 0;
  char sensor_ids[GROUP_MAX_SENSORS][BLE_MAC_LEN] = {};
};

struct GroupsConfig {
  GroupConfig groups[MAX_GROUPS]{};
};

struct SensorConfig {
  TempSource zone_temp_source[NUM_ZONES] = {
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
  };
  char zone_ble_mac[NUM_ZONES][BLE_MAC_LEN] = {};
  // Room-clock Date/Time Broadcast for nearby Shelly BLU displays.
  bool ble_clock_sync_enabled = true;
  uint16_t ble_clock_sync_interval_min = 60;
  // v3 append: EXTERNAL HTTP ingest identity (routing) + optional display name.
  char zone_sensor_id[NUM_ZONES][SENSOR_ID_LEN] = {};
  char zone_sensor_name[NUM_ZONES][SENSOR_NAME_LEN] = {};
};

/// Version tag for the standalone sensor-pairing NVS blob. This is persisted
/// under its own key (separate from the main DeviceConfig blob) so BLE MAC
/// pairings + temp sources survive legacy main-config resets on firmware update.
/// Bump only when SensorConfig's layout changes.
/// v1: zone_temp_source + zone_ble_mac
/// v2: + ble_clock_sync_enabled / ble_clock_sync_interval_min (append-only)
/// v3: + zone_sensor_id / zone_sensor_name (EXTERNAL ingest)
static constexpr uint32_t SENSOR_CONFIG_VERSION = 3;
static constexpr uint32_t SENSOR_CONFIG_VERSION_V1 = 1;
static constexpr uint32_t SENSOR_CONFIG_VERSION_V2 = 2;
/// Byte length of the v1 SensorConfig payload (fields before the room-clock
/// append). Used to migrate durable NVS blobs after the v2 layout growth.
static constexpr size_t SENSOR_CONFIG_V1_SIZE =
    offsetof(SensorConfig, ble_clock_sync_enabled);
static constexpr size_t SENSOR_CONFIG_V2_SIZE =
    offsetof(SensorConfig, zone_sensor_id);

/// Version tag for the standalone zone-config NVS blob. Persisted under its own
/// key (separate from the main DeviceConfig blob) so per-zone settings (area,
/// pipe type/spacing, etc.) survive legacy main-config resets on firmware
/// update. Bump only when ZoneConfig's layout changes.
/// v2 adds balance_adapt (learned adaptive-balancing multiplier).
/// v3 adds preheat_advance_c (learned simple-preheat head-start per zone).
/// v4 adds physical-loop hydraulic commissioning fields. v3 blobs are safely
/// invalidated rather than guessing manifold identity or measured values.
/// v5 drops Touch-owned weather/preload metadata and unused hydraulic
/// commissioning identity fields (room mapping lives on Touch).
/// v6 adds room-physics contract fields (walls, slab, covering, learned UA/τ).
static constexpr uint32_t ZONE_CONFIG_VERSION = 6;
static constexpr uint32_t ZONE_CONFIG_VERSION_V5 = 5;
/// Byte length of one v5 ZoneConfig (fields before the room-physics append).
static constexpr size_t ZONE_CONFIG_V5_SIZE = offsetof(ZoneConfig, exterior_walls);

inline constexpr bool zone_config_blob_is_current(uint32_t version, size_t bytes) {
  return version == ZONE_CONFIG_VERSION &&
         bytes == sizeof(uint32_t) + sizeof(ZoneConfig) * NUM_ZONES;
}

inline constexpr bool zone_config_blob_is_v5(uint32_t version, size_t bytes) {
  return version == ZONE_CONFIG_VERSION_V5 &&
         bytes == sizeof(uint32_t) + ZONE_CONFIG_V5_SIZE * NUM_ZONES;
}

static constexpr uint32_t HOUSE_PHYSICS_CONFIG_VERSION = 1;
static constexpr uint32_t GROUPS_CONFIG_VERSION = 1;

/// Per-section durable NVS blob versions. Each global-settings section is mirrored
/// to its own NVS key (like zones/sensors above) so it survives any discard of
/// the legacy main `config` blob. Bump an individual
/// constant ONLY when that one struct's layout changes — that resets just that
/// section, not the user's whole configuration. See lv6_config_store.cpp.
/// v3 removes obsolete heat-source/pump fields from the local system section.
/// v4 keeps only controller_id (heating mode moved to ControlConfig).
/// v5 adds user-facing display_name and location for the dashboard device menu.
static constexpr uint32_t SYSTEM_CONFIG_VERSION = 5;
/// v2 adds heating mode + heat-pump base/margin/trim; drops unused min_valve_opening_pct.
static constexpr uint32_t CONTROL_CONFIG_VERSION = 2;
/// v2 moves defaults to P1 flow / P2 manifold return with zone return probes
/// unassigned (return-temperature mode off until the user enables it). Layout
/// is unchanged; the bump replaces stored v1 values that still carried the
/// old factory map (zones→P1–P6, manifold P7/P8).
static constexpr uint32_t PROBE_CONFIG_VERSION = 2;
static constexpr uint32_t PID_CONFIG_VERSION = 1;
/// v2 adds the GPIO-bridge endstop policy (continuous drive, commutation-cadence
/// stall debounce, learned-count endpoint window, phase-2 contact recovery) and
/// drops open_hard_cap_factor / open_hard_cap_floor_ma, which were persisted but
/// never read after that detection path was reverted.
/// v4 makes the mechanical ceiling direction-asymmetric and expresses it in
/// commutation counts as well as milliseconds, adds the absolute current-cap
/// ladder, and drops calibration_timeout_s / presence_test_duration_ms /
/// adaptive_runtime_margin_ms / drift_relearn_threshold_pct (no read sites).
/// v5 moves the endstop bring-up defaults onto the measured Rev 3.3 traces
/// (close_current_factor 1.45, cap_stall_ma 65, cap_close_seat_frames 4). The
/// layout is unchanged; the bump exists so stored v4 values are replaced.
/// v6 repeats that reset. Firmware carrying v5 still had the loader bug that
/// kept the main blob's copy of a stale section, so it re-saved the old v4
/// values under the v5 marker and v5 alone can no longer tell them apart.
/// v7 adds the working-range learning policy (learn_*).
static constexpr uint32_t MOTOR_CONFIG_VERSION = 7;
static constexpr uint32_t MANIFOLD_CONFIG_VERSION = 1;
/// v2 replaces unsafe per-zone "modulating heat source" floors with an explicit
/// secondary-loop commissioning floor. Old values are safely invalidated.
/// v3 drops average-opening feed-temp thresholds and the dynamic_balancing alias.
static constexpr uint32_t BALANCING_CONFIG_VERSION = 3;
/// v2 adds the persisted authority identities and shared authentication key.
/// Active leases remain runtime-only and are never restored from NVS.
static constexpr uint32_t AUTHORITY_CONFIG_VERSION = 1;

struct BalancingConfig {
  bool secondary_flow_commissioning_enabled = false;  ///< Explicit UFH-secondary commissioning only
  float secondary_min_total_opening_pct = 0.0f;       ///< Total across accepting loops; 0 disables
  float target_delta_t_c = 5.0f;            ///< Target ΔT (flow − return) for dynamic (RETURN_TEMP) balancing
  float damping_factor = 0.3f;              ///< EMA damping for balance factor updates (0..1, lower = slower)
  // --- Adaptive balancing (room-temperature feedback; docs/adaptive_balancing.md) ---
  BalanceMode mode = BalanceMode::STATIC;
  uint32_t adapt_interval_s = 3600;         ///< Outer-loop period (learned-factor step cadence)
  float    adapt_step = 0.02f;              ///< k: max factor move per update
  float    adapt_min = 0.5f;                ///< Clamp on the learned multiplier (lower)
  float    adapt_max = 1.5f;                ///< Clamp on the learned multiplier (upper)
  float    adapt_error_window_s = 1800.0f;  ///< β = dt / window for the per-zone error EMA
  uint16_t adapt_min_samples = 30;          ///< Eligible cycles a zone needs before it can update
  float    adapt_heat_margin_c = 2.0f;      ///< flow_temp must exceed room by this to count a sample
};

/// Credentials used by Lune Touch to coordinate this local manifold node.
/// Heat-source transport and whole-house aggregation live on Lune Touch.
struct AuthorityConfig {
  char installation_id[32] = "";
  char coordinator_id[32] = "";
  char shared_key[64] = "";
};

struct PIDParams {
  float kp = 5.0f;
  float ki = 0.005f;
  float kd = 0.0f;
  float integral_limit = 50.0f;
};

/// How often a move re-establishes its datum at the close endstop.
enum class RehomePolicy : uint8_t {
  EVERY_MOVE = 0,   ///< every intermediate target re-homes first (default)
  PERIODIC = 1,     ///< re-home after N moves or H hours, otherwise move relative
  OPPORTUNISTIC = 2,///< only when a 0% target makes the close leg free anyway
  NEVER = 3,        ///< relative moves only
};

/// What a zone's learned counts mean.
enum class StrokeModel : uint8_t {
  /// Legacy: 0-100 % spans seat to the OPEN endstop; 100 % drives into it.
  FULL_STROKE = 0,
  /// 0 % is the seat, 100 % is pin release (+ margin). Everything beyond is dead
  /// space and the open endstop is never a target. See stroke_learning.h.
  WORKING_RANGE = 1,
};

struct MotorConfig {
  MotorProfile default_profile = MotorProfile::HMIP_VDMOT;
  uint32_t pwm_boost_ms = 350;
  uint8_t pwm_hold_duty_pct = 70;
  uint32_t pwm_period_ms = 40;
  // Soft-approach: reduce drive force in the final stretch of a drive-to-endstop
  // move so the actuator coasts into the mechanical stop instead of slamming it
  // (prevents piston-lock / socket pop-off). 0 disables.
  uint8_t pwm_approach_duty_pct = 40;  // reduced hold duty during final approach
  uint8_t approach_zone_pct = 80;      // begin soft-approach at this % of the move
  // --- Mechanical ceilings ----------------------------------------------------
  // 40 s of CLOSE travel puts the HmIP-VDMOT plunger at the housing exit, where
  // the anti-rotation tap leaves its guide and snaps. That is the hard ceiling
  // (HMIP_VDMOT_RUNTIME_LIMIT_MAX_S). Default stays at 38 s for headroom.
  //
  // Counts are the mechanically meaningful currency — plunger extension follows
  // commutations, not seconds — and 40 s at the measured 78 Hz free-travel
  // cadence is ~3120 counts. The millisecond ceiling covers the case where the
  // tacho dies and the count stops advancing. Whichever is reached first wins.
  //
  // The two directions are NOT symmetric: closing ejects the plunger (abrupt,
  // unrecoverable), opening bottoms out the gear train (cumulative, slow).
  uint32_t max_runtime_s = 40;
  uint32_t generic_profile_runtime_limit_s = 45;
  /// CLOSE ceiling. UI/backup keep the historical field name.
  uint32_t hmip_vdmot_runtime_limit_s = 38;
  uint32_t hmip_vdmot_open_runtime_limit_s = 45;
  uint32_t close_runtime_limit_counts = 2600;
  uint32_t open_runtime_limit_counts = 3600;
  /// Allowance added past the learned stroke before the ceiling bites.
  uint32_t close_overrun_budget_ms = 2000;
  uint32_t open_overrun_budget_ms = 3000;
  uint32_t close_overrun_budget_counts = 150;
  uint32_t open_overrun_budget_counts = 250;
  /// Learned strokes are scaled by this before the budget is added.
  uint8_t stroke_uncertainty_pct = 20;
  /// Below this a move cannot clear blanking + guard + debounce.
  uint32_t runtime_floor_ms = 2000;
  // Close-direction endstop — VdMot Controller method (Lenti84): trip when
  // filtered current exceeds free-travel mean × 1.7 after inrush debounce.
  // Tach/commutation is for position only and must not withhold this trip.
  // See https://github.com/Lenti84/VdMot_Controller (motor.cpp TimerHandler0).
  // 1.45, not VdMot's 1.7: against the measured 24.0 mA free-travel minimum
  // 1.7 is ~41 mA, which the Rev 3.3 close trace only reaches at ~41.5 s -
  // past the 40 s / 3120-count housing-exit boundary. Even 1.5 (36 mA) lands at
  // 40.25 s. 1.45 (~34.8 mA) clears the 31-33.6 mA pressure plateau and trips
  // at 39.75 s; only the seat cap (39.25 s) is earlier. test_stall_model replays this.
  float close_current_factor = 1.45f;
  float close_slope_threshold_ma_per_s = 0.6f;
  float close_slope_current_factor = 1.3f;
  // Open-direction endstop (gentler ramp — spring assist)
  float open_current_factor = 1.7f;
  float open_slope_threshold_ma_per_s = 0.15f;
  float open_slope_current_factor = 1.3f;
  // Ripple safety limit for opening: learned_open_ripples × factor (0 = disabled)
  float open_ripple_limit_factor = 1.10f;
  // Pin engagement detection (calibration)
  // 2.0, not 3.0: this is now wired into StrokeTracker (it used to be inert),
  // and the measured pin ramp is ~1 mA/s against a FROZEN baseline. At 3.0 the
  // NVS value silently overrode StrokeConfig's retuned default and the tracker
  // missed the very ramps it was retuned for.
  float pin_engage_step_ma = 2.0f;              // Current increase to detect pin contact
  uint16_t pin_engage_margin_ripples = 50;       // Offset toward open from detected point

  // --- GPIO-bridge endstop policy ---------------------------------------------
  // Rev 3.3 drives continuously and its motion evidence is the commutation
  // tacho, so none of the PWM-anchored timing above applies. See
  // hardware/lune-v6-rev3.3/firmware-integration.md. All of these are bring-up
  // values derived from measured actuator data, not production constants.
  //
  // Point at which a zero commutation count means "it never turned". 0 derives
  // it from the tacho contract (blanking + 2 × worst-case period).
  uint32_t motion_decision_ms = 0;
  // Stall verdict debounce = observed cadence × factor, clamped. Scaling with
  // the motor's actual speed instead of a fixed 750 ms is what brings detection
  // latency inside Rev 3.0 requirement E-08's 250 ms bound.
  uint16_t stall_plateau_factor_x10 = 30;
  uint32_t stall_plateau_floor_ms = 150;
  uint32_t stall_plateau_ceiling_ms = 750;   // also the value used when cadence is unknown
  // Lower bound on the learned commutation count before an endpoint is accepted.
  uint8_t endpoint_window_tolerance_pct = 25;
  // The opening endstop is the motor's own gear train bottoming out, which is a
  // materially smaller resistance than the closing hard stop — reusing
  // open_current_factor (1.7×) barely reaches it. Closing keeps the higher bar.
  float open_endstop_current_factor = 1.25f;
  // Phase 2 discriminator: at pin contact the motor slows and then RECOVERS, at
  // a physical stop it does not. This is how many commutations the cadence has
  // to recover within for the current bump to be read as contact, not an endstop.
  uint16_t contact_recovery_ripples = 15;
  float low_current_threshold_ma = 5.0f;
  uint32_t low_current_window_ms = 1200;
  uint32_t calibration_min_travel_ms = 3000;
  /// Minimum commutations per calibration pass. Derived, not copied from VdMot
  /// (their 3000 is on a different encoder scale): 3000 ms at the slow end of
  /// the qualified commutation band is ~60 counts, so 100 keeps margin while
  /// staying well under a real stroke. This is the check that catches "motor
  /// runs, tacho dead", which the time-only gate was blind to.
  uint32_t calibration_min_travel_ripples = 100;
  uint8_t calibration_max_retries = 2;
  uint32_t relearn_after_movements = 2000;
  uint32_t relearn_after_hours = 168;
  bool auto_apply_learned_factors = true;
  uint8_t learned_factor_min_samples = 3;
  float learned_factor_max_deviation_pct = 0.12f;

  // --- Absolute current-cap ladder (evaluated on the DMA frame path) ---------
  // Severity-ordered and enforced monotonic by sanitize_motor_cfg_(). Derived
  // from our own measured trace, not from VdMot's or nliaudat's sense scale:
  // free travel 24 mA, pin plateau 31-33 mA, destruction ramp crossing 34 mA at
  // t=39.2 s against a 40 s wall. cap_circuit_fault_ma covers the 62-150 mA
  // window no hardware sees (DRV8411 OCP is 4 A, rail comparator 150 mA).
  float cap_close_seat_ma = 34.0f;
  float cap_close_popoff_ma = 36.0f;
  // 65, not 54: the measured open breakaway is 57-59 mA for ~4 s, and this
  // rung is not gated on breakaway - 54 would fault the first open.
  float cap_stall_ma = 65.0f;
  float cap_circuit_fault_ma = 85.0f;
  float cap_open_stop_ma = 40.0f;
  // 4 frames (~26 ms): the pressure plateau peaks at 33.6 mA in 500 ms means,
  // so single raw 6.4 ms frames already brush the 34 mA seat cap there.
  uint8_t cap_close_seat_frames = 4;
  uint8_t cap_close_popoff_frames = 2;
  uint8_t cap_stall_frames = 3;
  uint8_t cap_circuit_frames = 2;
  uint8_t cap_open_frames = 3;
  /// A frame straddling drive-start carries too few samples for a usable mean.
  uint16_t cap_min_valid_samples = 16;

  // --- Direction-specific endstop references --------------------------------
  // OPEN has a flat running baseline and a clean ~5x step at the stop, so a
  // fraction of the measured stall span works: trip = I_free + k*(I_stall-I_free).
  // That form is offset-immune (our sense is rail-total), drive-voltage
  // independent and self-scaling per actuator.
  float open_endstop_stall_fraction = 0.30f;
  // CLOSE has no flat baseline — the valve spring drives the current up
  // continuously and the endstop adds only ~10% on top — so referencing free
  // travel would trip mid-travel. It uses a trailing step instead.
  uint32_t close_trailing_ref_ms = 2000;
  float close_trailing_step_ma = 2.5f;
  /// Sustain is the discriminator, not magnitude: the measured pin-contact ramp
  /// produces one isolated qualifying sample, the endstop ramp holds for
  /// seconds. Validated against test/fixtures/motor-lab-z1-close.csv - at the
  /// real 10 ms tick it trips at ~40.16 s, just past the 40 s wall, so on that
  /// trace the seat cap, not this, is the first close stop.
  uint32_t close_trailing_sustain_ms = 1000;

  // --- Spurious-count detection ----------------------------------------------
  // At a hard stop the commutation counter does not plateau; brush arcing keeps
  // it advancing (measured: count rate RISING to 88 Hz while current said the
  // rotor was stopped). Current and cadence rising together is impossible for
  // one motor, and needs no calibrated constants.
  uint32_t spurious_window_ms = 3000;
  float spurious_current_rise_ma = 3.0f;
  float spurious_cadence_rise_hz = 12.0f;
  uint8_t spurious_confirm_samples = 2;

  /// Cadence multiplier at which the stroke tracker calls the rotor "slowing"
  /// (stall_plateau_factor_x10 is the "stopping" threshold).
  uint16_t slowdown_plateau_factor_x10 = 15;

  // --- Anti-drift -------------------------------------------------------------
  // Position is derived, never accumulated: a move drives to the close endstop
  // and then opens by a ripple count. Re-homing is serialised across zones and
  // deferred while the zone controller reports minimum-flow pressure.
  RehomePolicy rehome_policy = RehomePolicy::EVERY_MOVE;
  uint32_t rehome_after_moves = 50;
  uint32_t rehome_after_hours = 168;

  // --- Working-range learning (Rev 3.3) ----------------------------------------
  // Learn pin contact (100 %) and seat (0 %) on close passes that start in dead
  // space, instead of driving into the open endstop. stroke_learning.h has the
  // sequence. Bring-up values: the Rev 3.3 trace put pin contact ~2000 counts
  // before the stop and showed 3417 counts of open travel without a gear stop,
  // so a first leg past ~2100 counts should land in dead space, well short of it.
  //
  // The open legs are capped by what the following close pass may travel: the
  // close bootstrap ceiling minus its budget (2600 - 150). That also bounds the
  // learnable working range - a longer one could not be closed from 100 % inside
  // the close ceiling either.
  bool working_range_learning = true;
  uint32_t learn_open_start_ripples = 2200;
  uint32_t learn_open_step_ripples = 125;
  uint32_t learn_open_max_ripples = 2450;
  uint32_t learn_min_free_ripples = 100;
  uint8_t learn_samples = 3;
  uint8_t learn_max_spread_pct = 10;
};

struct MotorTelemetry {
  uint32_t movement_count = 0;
  uint32_t open_count = 0;
  uint32_t close_count = 0;
  uint32_t last_open_endstop_ms = 0;
  uint32_t last_close_endstop_ms = 0;
  uint32_t learned_open_ms = 0;
  uint32_t learned_close_ms = 0;
  uint32_t learned_open_ripples = 0;
  uint32_t learned_close_ripples = 0;
  int32_t deadzone_ms = 0;
  float drift_percent = 0.0f;
  uint32_t movements_since_learn = 0;
  uint32_t last_learn_ms = 0;
  uint8_t calibration_retries = 0;
  bool blocked = false;
  bool present = false;
  bool presence_known = false;
  float mean_current_ma = 20.0f;
  float mean_open_current_ma = 20.0f;   ///< Running mean current, OPEN moves (open endstop threshold base)
  float mean_close_current_ma = 20.0f;  ///< Running mean current, CLOSE moves (close endstop threshold base)
  float current_position_pct = 0.0f;
  uint32_t pin_engage_close_ripples = 0;  // Ripples from open end at pin contact (close pass)
  /// How learned_*_ripples/_ms are to be read. Adding it changed the blob size,
  /// which discards telemetry learned under the old full-stroke meaning.
  StrokeModel stroke_model = StrokeModel::FULL_STROKE;
  // Stroke-phase anchors. The blob is size-validated on load, so adding
  // fields here invalidates old telemetry rather than misreading it.
  uint32_t pin_engage_open_ripples = 0;    // Ripples from closed end at pin release (open pass)
  // Seating depth: commutations from pin contact to the hard stop. Far more
  // repeatable than the full stroke, so it is the tighter endpoint window for
  // closing — the direction where missing the stop means pop-off.
  uint32_t contact_to_stop_close_ripples = 0;
  /// Count-based deadzone (VdMot: opening_count - closing_count). Counts survive
  /// a change in drive speed; deadzone_ms does not, and is never read.
  uint32_t deadzone_ripples = 0;
  float learned_open_current_factor = 0.0f;
  float learned_close_current_factor = 0.0f;
  uint8_t learned_open_confidence = 0;
  uint8_t learned_close_confidence = 0;
  float last_open_candidate_factor = 0.0f;
  float last_close_candidate_factor = 0.0f;
  float last_open_peak_ma = 0.0f;
  float last_close_peak_ma = 0.0f;
  bool last_learning_sample_valid = false;
  FaultCode last_fault_code = FaultCode::NONE;
};

struct ZoneSnapshot {
  float temperature_c = NAN;
  float setpoint_c = 21.0f;
  float valve_position_pct = 0.0f;
  float preheat_advance_c = 0.0f;
  ZoneState state = ZoneState::UNKNOWN;
  ZoneDisplayState display_state = ZoneDisplayState::UNKNOWN;
  float hydraulic_factor = 0.0f;      ///< Effective balance factor applied (static × adapt)
  float static_factor = 0.0f;         ///< Resistance-aware static prior (normalized, 0..1)
  float balance_adapt = 1.0f;         ///< Learned adaptive multiplier in effect (adapt_i)
  float adapt_err_ema = NAN;          ///< Long-window room-temp error EMA (NAN = no samples yet)
  bool was_overheated = false;
  float heat_output_w = 0.0f;
  float pipe_length_m = 0.0f;
  float flow_lh = 0.0f;
  float floor_surface_temp_c = 0.0f;
  bool pipe_length_warning = false;
  float return_temp_c = NAN;          ///< Measured return water temperature (when probe_role == RETURN_WATER)
  float measured_delta_t_c = NAN;     ///< Measured ΔT (flow − return)
};

/// Heat-demand summary published for Touch / Asgard feed-temperature trim.
/// Derived from post-floor valve targets; V6 never writes the heat source.
enum class HeatDemandRecommendation : uint8_t {
  HOLD = 0,
  RAISE = 1,
  LOWER = 2,
};

struct HeatDemandSummary {
  int8_t critical_zone = -1;               ///< 0-based; -1 = none
  float critical_opening_ratio = 0.0f;     ///< opening / max_opening for critical zone
  uint32_t saturated_s = 0;                ///< Seconds any demanding zone ≥ 90% of max
  uint8_t demanding_zones = 0;
  bool headroom = false;                   ///< No demand and max opening below heat-pump base
  HeatDemandRecommendation recommendation = HeatDemandRecommendation::HOLD;
};

struct SystemSnapshot {
  std::array<ZoneSnapshot, NUM_ZONES> zones{};
  ControllerState controller_state = ControllerState::UNKNOWN;
  SystemConditionState system_condition_state = SystemConditionState::UNKNOWN;
  uint8_t active_zones = 0;
  float avg_valve_pct = 0.0f;
  float manifold_flow_temp_c = NAN;
  float manifold_return_temp_c = NAN;
  bool preheat_absorbing = false;             ///< External pre-buffering detected; overheat cutoff raised
  HeatDemandSummary heat_demand{};
  HeatingProfile control_mode = HeatingProfile::HEAT_PUMP;
  HeatingProfile effective_control_mode = HeatingProfile::HEAT_PUMP;
  bool control_mode_from_touch = false;
  uint32_t uptime_s = 0;
  uint32_t free_heap = 0;
  uint32_t cycle_count = 0;
  bool wifi_connected = true;
};

struct SystemConfig {
  char controller_id[33] = "lune";
  /// Shown in the header and «About device» (defaults to product name when empty).
  char display_name[33] = "Lune V6";
  char location[65] = "";
};

/// Baseline version tag for the legacy all-in-one DeviceConfig blob.
///
/// Firmware release bumps must not change this value. User-facing settings are
/// mirrored into independently versioned NVS section blobs above; bump only the
/// affected *_CONFIG_VERSION when that section's binary layout is no longer
/// compatible. The main blob version is kept stable at schema v1.0 and is used
/// only as a broad fallback/normalization marker.
static constexpr uint32_t CONFIG_VERSION = 1;

struct DeviceConfig {
  uint32_t config_version = CONFIG_VERSION;
  SystemConfig system;
  ZoneConfig zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type = ManifoldType::NO;
  SensorConfig sensor_config;
  BalancingConfig balancing;
  AuthorityConfig authority;
  HousePhysicsConfig house_physics;
  GroupsConfig groups;
};

// =============================================================================
// Helper Functions
// =============================================================================

inline const char *fault_code_to_string(FaultCode code) {
  switch (code) {
    case FaultCode::NONE: return "NONE";
    case FaultCode::OPEN_CIRCUIT: return "OPEN_CIRCUIT";
    case FaultCode::BLOCKED: return "BLOCKED";
    case FaultCode::TIMEOUT: return "TIMEOUT";
    case FaultCode::OVERCURRENT: return "OVERCURRENT";
    case FaultCode::THERMAL: return "THERMAL";
    case FaultCode::STALL: return "STALL";
    case FaultCode::MECHANICAL_OVERRUN: return "MECHANICAL_OVERRUN";
    default: return "UNKNOWN";
  }
}

inline const char *motor_profile_to_string(MotorProfile profile) {
  switch (profile) {
    case MotorProfile::INHERIT: return "INHERIT";
    case MotorProfile::GENERIC: return "GENERIC";
    case MotorProfile::HMIP_VDMOT: return "HMIP_VDMOT";
    default: return "UNKNOWN";
  }
}

inline const char *balance_mode_to_string(BalanceMode mode) {
  switch (mode) {
    case BalanceMode::STATIC: return "STATIC";
    case BalanceMode::RETURN_TEMP: return "RETURN_TEMP";
    case BalanceMode::ADAPTIVE: return "ADAPTIVE";
    default: return "STATIC";
  }
}

/// Resolve the effective balance mode.
inline BalanceMode effective_balance_mode(const BalancingConfig &b) {
  return b.mode;
}

inline const char *heating_profile_to_string(HeatingProfile profile) {
  switch (profile) {
    case HeatingProfile::NORMAL: return "normal";
    case HeatingProfile::HEAT_PUMP: return "heat_pump";
    default: return "heat_pump";
  }
}

inline HeatingProfile heating_profile_from_string(const char *s) {
  if (s == nullptr) return HeatingProfile::HEAT_PUMP;
  if (strcasecmp(s, "normal") == 0 || strcasecmp(s, "boiler") == 0 ||
      strcasecmp(s, "gas") == 0 || strcasecmp(s, "district") == 0 ||
      strcasecmp(s, "district_heating") == 0)
    return HeatingProfile::NORMAL;
  return HeatingProfile::HEAT_PUMP;
}

inline const char *heat_demand_recommendation_to_string(HeatDemandRecommendation r) {
  switch (r) {
    case HeatDemandRecommendation::RAISE: return "raise";
    case HeatDemandRecommendation::LOWER: return "lower";
    case HeatDemandRecommendation::HOLD:
    default: return "hold";
  }
}

inline const char *slab_type_to_string(SlabType t) {
  switch (t) {
    case SlabType::CAST_CONCRETE: return "cast_concrete";
    case SlabType::SCREED: return "screed";
    case SlabType::DRY_PLATES: return "dry_plates";
    case SlabType::TIMBER_JOISTS: return "timber_joists";
    case SlabType::UNSET:
    default: return "unset";
  }
}

inline bool slab_type_from_string(const char *s, SlabType *out) {
  if (s == nullptr || out == nullptr) return false;
  if (strcasecmp(s, "cast_concrete") == 0) { *out = SlabType::CAST_CONCRETE; return true; }
  if (strcasecmp(s, "screed") == 0) { *out = SlabType::SCREED; return true; }
  if (strcasecmp(s, "dry_plates") == 0) { *out = SlabType::DRY_PLATES; return true; }
  if (strcasecmp(s, "timber_joists") == 0) { *out = SlabType::TIMBER_JOISTS; return true; }
  if (strcasecmp(s, "unset") == 0) { *out = SlabType::UNSET; return true; }
  return false;
}

inline const char *covering_type_to_string(CoveringType t) {
  switch (t) {
    case CoveringType::TILE_STONE: return "tile_stone";
    case CoveringType::VINYL_LINOLEUM: return "vinyl_linoleum";
    case CoveringType::PARQUET_LAMINATE: return "parquet_laminate";
    case CoveringType::CARPET: return "carpet";
    case CoveringType::UNSET:
    default: return "unset";
  }
}

inline bool covering_type_from_string(const char *s, CoveringType *out) {
  if (s == nullptr || out == nullptr) return false;
  if (strcasecmp(s, "tile_stone") == 0) { *out = CoveringType::TILE_STONE; return true; }
  if (strcasecmp(s, "vinyl_linoleum") == 0) { *out = CoveringType::VINYL_LINOLEUM; return true; }
  if (strcasecmp(s, "parquet_laminate") == 0) { *out = CoveringType::PARQUET_LAMINATE; return true; }
  if (strcasecmp(s, "carpet") == 0) { *out = CoveringType::CARPET; return true; }
  if (strcasecmp(s, "unset") == 0) { *out = CoveringType::UNSET; return true; }
  return false;
}

inline const char *group_role_to_string(GroupRole r) {
  switch (r) {
    case GroupRole::PRIMARY: return "primary";
    case GroupRole::MEMBER: return "member";
    case GroupRole::SINGLE:
    default: return "single";
  }
}

inline const char *physics_param_source_to_string(PhysicsParamSource s) {
  return s == PhysicsParamSource::CALIBRATED ? "calibrated" : "default";
}

inline uint8_t popcount_walls(uint8_t mask) {
  uint8_t n = 0;
  uint8_t m = mask & 0x0F;
  while (m) {
    n = static_cast<uint8_t>(n + (m & 1u));
    m = static_cast<uint8_t>(m >> 1);
  }
  return n;
}

inline const char *zone_state_to_string(ZoneState state) {
  switch (state) {
    case ZoneState::OVERHEATED: return "OVERHEATED";
    case ZoneState::SATISFIED: return "SATISFIED";
    case ZoneState::DEMAND: return "DEMAND";
    case ZoneState::UNKNOWN:
    default: return "UNKNOWN";
  }
}

inline const char *zone_display_state_to_string(ZoneDisplayState state) {
  switch (state) {
    case ZoneDisplayState::OFF: return "OFF";
    case ZoneDisplayState::MANUAL: return "MANUAL";
    case ZoneDisplayState::CALIBRATING: return "CALIBRATING";
    case ZoneDisplayState::WAITING_CALIBRATION: return "WAITING_CALIBRATION";
    case ZoneDisplayState::WAITING_ROOM_TEMP: return "WAITING_ROOM_TEMP";
    case ZoneDisplayState::HEATING: return "HEATING";
    case ZoneDisplayState::IDLE: return "IDLE";
    case ZoneDisplayState::OVERHEATED: return "OVERHEATED";
    case ZoneDisplayState::UNKNOWN:
    default:
      return "UNKNOWN";
  }
}

inline const char *controller_state_to_string(ControllerState state) {
  switch (state) {
    case ControllerState::OFF: return "OFF";
    case ControllerState::MANUAL: return "MANUAL";
    case ControllerState::CALIBRATING: return "CALIBRATING";
    case ControllerState::WAITING_INPUT: return "WAITING_INPUT";
    case ControllerState::IDLE: return "IDLE";
    case ControllerState::HEATING: return "HEATING";
    case ControllerState::MIXED: return "MIXED";
    case ControllerState::FAULT: return "FAULT";
    case ControllerState::UNKNOWN:
    default:
      return "UNKNOWN";
  }
}

inline float pipe_inner_diameter_mm(PipeType type) {
  switch (type) {
    case PipeType::PEX_12X2: return 8.0f;
    case PipeType::PEX_14X2: return 10.0f;
    case PipeType::PEX_16X2: return 12.0f;
    case PipeType::PEX_17X2: return 13.0f;
    case PipeType::PEX_18X2: return 14.0f;
    case PipeType::PEX_20X2: return 16.0f;
    case PipeType::ALUPEX_16X2: return 12.0f;
    case PipeType::ALUPEX_20X2: return 16.0f;
    default: return 12.0f;
  }
}

inline float pipe_max_length_m(PipeType type) {
  switch (type) {
    case PipeType::PEX_12X2: return 80.0f;
    case PipeType::PEX_14X2: return 90.0f;
    case PipeType::PEX_16X2: return 120.0f;
    case PipeType::PEX_17X2: return 120.0f;
    case PipeType::PEX_18X2: return 150.0f;
    case PipeType::PEX_20X2: return 150.0f;
    case PipeType::ALUPEX_16X2: return 100.0f;
    case PipeType::ALUPEX_20X2: return 125.0f;
    default: return 120.0f;
  }
}

}  // namespace lv6
