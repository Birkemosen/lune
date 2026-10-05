// =============================================================================
// LV6 Valve Controller — ESPHome Component Header
// =============================================================================
// Motor supervisor FSM: 6x DRV8215, sequential execution, current-sense
// endstop detection, calibration, and position tracking.
// Runs as a FreeRTOS task (10ms tick, Core 1) alongside ESPHome's main loop.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/components/i2c/i2c.h"
#include "esphome/components/sensor/sensor.h"
#include "../lv6_config_store/lv6_config_store.h"
#include "../lv6_config_store/lv6_types.h"
#include "drv8215.h"
#include "ripple_counter.h"
#include "gpio_motor_backend.h"
#include "rev31_motor_backend.h"
#include "rev32_motor_backend.h"
#include "rev33_motor_backend.h"
#include "endpoint_logic.h"
#include "safety_limits.h"
#include "stall_model.h"
#include "stroke_learning.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"
#include <array>
#include <atomic>
#include <string>

namespace lv6 {

struct ValveCommand {
  uint8_t zone;
  float target_pct;
  uint16_t timed_duration_ms = 0;  // 0 = position-based, >0 = timed duration
  bool override_drivers = false;    // Bypass drivers_enabled check (manual mode)
  MotorDirection timed_direction = MotorDirection::OPEN;  // Direction for timed moves
};


struct MotorTraceSample {
  uint32_t t_ms = 0;
  uint32_t ripple_count = 0;
  int16_t current_ma_x10 = 0;
  uint16_t adc_raw = 0xFFFF;
  uint16_t bemf_raw_a = 0xFFFF;
  uint16_t bemf_raw_b = 0xFFFF;
  int16_t bemf_differential_raw = 0;
  uint16_t bemf_separation_us = 0xFFFF;
  // Rev 3.2 columns.  The commutation count itself is `ripple_count`, which is
  // the motion-evidence counter of whichever backend is active.
  uint32_t tacho_period_us = 0;
  uint16_t tacho_amp_raw = 0xFFFF;
  uint8_t drive_on = 0;
  uint8_t bemf_valid = 0;
  uint8_t bemf_moving = 0;
  uint8_t invalid_bemf_samples = 0;
  uint8_t armed = 0;
  uint8_t direction_open = 0;
  /// StrokePhase. Reading a closing trace without it is guesswork: the pin
  /// contact bump and the seat both show up as a current rise.
  uint8_t stroke_phase = 0;
};

// Thread-safe, read-only bring-up snapshot of the analog/safety path.  Raw ADC
// values are intentionally exposed: production thresholds must be derived from
// measured actuator populations rather than nominal assumptions.
//
// The bemf_* members are Rev 3.1 only and the tacho_* members Rev 3.2 only;
// `backend` says which set is meaningful.
struct MotorSafetyDiagnostics {
  bool backend_enabled{false};
  const char *backend{"drv8215_i2c"};
  bool motor_busy{false};
  bool drive_on{false};
  bool drivers_enabled{false};
  bool latch_faulted{true};
  bool sample_valid{false};
  bool sample_moving{false};
  uint16_t bemf_raw_a{0};
  uint16_t bemf_raw_b{0};
  int16_t bemf_differential_raw{0};
  uint16_t sample_separation_us{0};
  uint16_t bemf_threshold_raw{0};
  uint8_t consecutive_invalid_samples{0};
  uint32_t motion_evidence_count{0};
  uint32_t sample_sequence{0};
  uint32_t motor_runtime_ms{0};
  float current_ma{0.0f};
  // Rev 3.2 commutation tacho.  `motion_evidence_count` carries the qualified
  // count; these add the cadence, what was thrown away, and the analog
  // cross-check that § 2 of the validation plan measures the count against.
  bool armed{false};
  int8_t latch_arm_level{-1};
  int8_t latch_state_level{-1};
  int8_t motor_enable_level{-1};
  /// Rev 3.3 only. -1 when the backend has no such pin. All three fault nets
  /// are active LOW (0 = asserted). driver_nsleep_level is the firmware-held
  /// drive permit (1 = awake).
  int8_t driver_nsleep_level{-1};
  int8_t rail_overcurrent_level{-1};
  int8_t fault_usb_level{-1};
  uint8_t decoder_address{0};
  uint32_t tacho_period_us{0};
  uint32_t tacho_cadence_us{0};
  uint32_t tacho_rejected{0};
  uint32_t tacho_hardware_count{0};
  uint16_t tacho_amp_raw{0xFFFF};
  /// Independent count of the SAME waveform from the analog side. Comparing it
  /// against tacho_hardware_count is how the missed- and false-edge rate is
  /// measured, which is § 2 of the validation plan's release gate.
  uint32_t tacho_adc_count{0};
  /// StrokePhase as an integer: 0 free travel, 1 pin contact, 2 under
  /// load, 3 stopping. See endpoint_logic.h.
  uint8_t stroke_phase{0};
  /// Bring-up instrumentation for the continuous ADC, which delivered nothing
  /// on either channel through a full energised move during Rev 3.2-D. These
  /// separate "never started" from "no frames" from "frames on channels the
  /// reader does not recognise" without needing the log ring.
  uint32_t adc_notifies{0};
  uint32_t adc_frames{0};
  uint32_t adc_read_errors{0};
  /// One bit per ADC channel id seen in the stream, so a channel mismatch shows
  /// up as a mask that does not contain ipropi_channel_ or tacho_adc_channel_.
  uint32_t adc_channel_mask{0};
  /// -1 = adc_continuous_start() never attempted (the stream was never armed),
  /// 0 = attempted and returned ESP_OK, anything else is the esp_err_t.
  int32_t adc_start_err{-1};
  /// ripple_enabled_ && the continuous handle exists, i.e. whether the per-move
  /// start is even reachable.
  bool adc_stream_ready{false};
  FaultCode fault{FaultCode::NONE};

  // --- Rev 3.3 endstop architecture -----------------------------------------
  // Everything the new safety path computes was log-only, which left the Motor
  // Lab plotting constants that no longer exist and reporting "OK" for moves
  // that deliberately recorded nothing.
  /// Free-travel reference the trip thresholds are actually computed from.
  float baseline_ma{0.0f};
  bool baseline_settled{false};
  /// The commutation counter is producing brush-arc edges, not commutations, so
  /// cadence and motion count are actively wrong for the rest of this move.
  bool counts_spurious{false};
  /// Which DMA cap-ladder rung last cut the drive (FastTrip).
  uint8_t last_fast_trip{0};
  /// Last classifier verdict (EndpointDecision). STOPPED_UNCONFIRMED stops the
  /// drive and records no position while deliberately raising no fault, so it
  /// is invisible unless reported here.
  uint8_t endpoint_decision{0};
  /// Mechanical ceiling in force for the move in flight.
  uint32_t ceiling_ms{0};
  uint32_t ceiling_counts{0};
  uint8_t ceiling_source{0};
  bool requires_calibration{false};
  bool position_confident{false};
  /// Absolute current-cap ladder in force, so the UI plots the limits that
  /// actually fire instead of a hardcoded one that does not.
  float cap_seat_ma{0.0f};
  float cap_popoff_ma{0.0f};
  float cap_open_ma{0.0f};
  float cap_stall_ma{0.0f};
  float cap_circuit_ma{0.0f};
  /// Endpoint current learned for the active zone/direction (0 = none yet).
  float learned_stall_ma{0.0f};
  /// Progress of the closing trailing-step detector toward its sustain.
  uint32_t close_step_sustained_ms{0};
};

enum class MotorBackendKind : uint8_t {
  DRV8215_I2C = 0,
  REV31_GPIO = 1,
  REV32_GPIO = 2,
  REV33_GPIO = 3,
};

class Lv6ValveController : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::HARDWARE - 1.0f; }
  void setup() override;
  void loop() override;
  void dump_config() override;

  // Configuration setters (called from Python codegen)
  void set_config_store(Lv6ConfigStore *store) { config_store_ = store; }
  void set_i2c_bus(esphome::i2c::I2CBus *bus) { i2c_bus_ = bus; }
  void set_nsleep_pin(int pin) { nsleep_pin_ = static_cast<gpio_num_t>(pin); }
  void set_nfault_pin(int pin) { nfault_pin_ = static_cast<gpio_num_t>(pin); }
  void set_ipropi_pin(int pin) { ipropi_pin_ = static_cast<gpio_num_t>(pin); }
  // 0 = drv8215_i2c, 1 = rev31_gpio, 2 = rev32_gpio.  Kept as an int so the
  // Python codegen does not have to mirror the enum.
  void set_backend_kind(int kind) {
    backend_kind_ = static_cast<MotorBackendKind>(kind);
    gpio_backend_enabled_ = backend_kind_ != MotorBackendKind::DRV8215_I2C;
  }
  // Address lines 0-2 and LATCH_ARM exist on both discrete revisions; the rest
  // belong to one of them.
  void set_address0_pin(int pin) {
    rev31_pins_.address0 = static_cast<gpio_num_t>(pin);
    rev32_pins_.address0 = static_cast<gpio_num_t>(pin);
  }
  void set_address1_pin(int pin) {
    rev31_pins_.address1 = static_cast<gpio_num_t>(pin);
    rev32_pins_.address1 = static_cast<gpio_num_t>(pin);
  }
  void set_address2_pin(int pin) {
    rev31_pins_.address2 = static_cast<gpio_num_t>(pin);
    rev32_pins_.address2 = static_cast<gpio_num_t>(pin);
  }
  void set_latch_arm_pin(int pin) {
    rev31_pins_.latch_arm = static_cast<gpio_num_t>(pin);
    rev32_pins_.latch_arm = static_cast<gpio_num_t>(pin);
  }
  void set_adc_bemf_pin(int pin) { rev31_pins_.adc_bemf = static_cast<gpio_num_t>(pin); }
  void set_direction_pin(int pin) { rev31_pins_.terminal_direction = static_cast<gpio_num_t>(pin); }
  void set_address3_pin(int pin) { rev32_pins_.address3 = static_cast<gpio_num_t>(pin); }
  void set_comm_tacho_pin(int pin) { rev32_pins_.comm_tacho = static_cast<gpio_num_t>(pin); }
  void set_adc_tacho_pin(int pin) {
    rev32_pins_.adc_tacho = static_cast<gpio_num_t>(pin);
    rev33_pins_.adc_tacho = static_cast<gpio_num_t>(pin);
  }
  // Rev 3.3 only. The latch is gone: the drive permit is a GPIO, and the fault
  // net split into three attributable, ACTIVE LOW inputs.
  void set_driver_nsleep_pin(int pin) { rev33_pins_.driver_nsleep = static_cast<gpio_num_t>(pin); }
  void set_rail_overcurrent_pin(int pin) { rev33_pins_.rail_overcurrent = static_cast<gpio_num_t>(pin); }
  void set_fault_usb_pin(int pin) { rev33_pins_.fault_usb = static_cast<gpio_num_t>(pin); }
  // Rev 3.3+ only. ADC_TACHO shares ADC_CURRENT's attenuation, so the board must
  // centre TACHO_REF inside that span; on Rev 3.2's 1.65 V mid-rail the channel
  // saturates from ~1 mV of ripple. Off unless the board declares otherwise.
  void set_adc_tacho_enabled(bool enabled) { adc_tacho_enabled_ = enabled; }
  void set_tacho_min_pulse_us(uint16_t us) { rev32_tacho_.min_pulse_us = us; }
  void set_tacho_min_period_us(uint32_t us) { rev32_tacho_.min_period_us = us; }
  void set_tacho_max_period_us(uint32_t us) { rev32_tacho_.max_period_us = us; }
  void set_bemf_threshold_raw(uint16_t threshold) { bemf_threshold_raw_ = threshold; }
  void set_auto_start_calibration(bool enabled) { auto_start_calibration_ = enabled; }
  void set_current_sensor(esphome::sensor::Sensor *sensor) { current_sensor_ = sensor; }
  void set_motor_address(uint8_t index, uint8_t address) {
    if (index < NUM_ZONES)
      motor_addresses_[index] = address;
  }

  // Thread-safe public API
  bool request_position(uint8_t zone, float target_pct);
  /// Zone controller hook: suppress re-homing while closing a zone would breach
  /// minimum flow. Re-homing falls back to a relative move for that request.
  void set_rehome_inhibited(bool inhibited) {
    rehome_inhibited_.store(inhibited, std::memory_order_relaxed);
  }
  bool request_timed_open(uint8_t zone, uint16_t duration_ms, bool override_drivers = false);
  bool request_timed_close(uint8_t zone, uint16_t duration_ms, bool override_drivers = false);
  bool request_stop(uint8_t zone);
  float get_position(uint8_t zone) const;
  MotorTelemetry get_telemetry(uint8_t zone) const;
  FaultCode get_last_fault() const { return current_fault_code_.load(std::memory_order_acquire); }
  bool is_motor_busy() const { return motor_turning_.load(std::memory_order_acquire); }
  bool is_calibrating() const { return calibrating_.load(std::memory_order_acquire); }
  /// Live learning progress for the zone currently calibrating (if any).
  struct LearningProgress {
    uint8_t zone{0xFF};       ///< 0-based zone, 0xFF = idle
    uint8_t pct{0};           ///< 0-100
    uint8_t sample{0};        ///< agreeing close samples so far
    uint8_t samples_needed{0};///< target sample count
    /// 0 none, 1 home, 2 open, 3 close, 4 done, 5 failed
    uint8_t phase{0};
  };
  LearningProgress get_learning_progress() const;
  /// Packed progress word used by the dashboard to bump runtime_revision.
  uint32_t get_learning_progress_packed() const {
    return learning_progress_packed_.load(std::memory_order_acquire);
  }
  uint32_t get_live_ripple_count() const { return live_ripple_count_.load(std::memory_order_relaxed); }
  void request_calibration(uint8_t zone);
  void request_calibration_all();
  bool reset_fault(uint8_t zone);
  bool reset_and_relearn(uint8_t zone);
  bool reset_learned_factors(uint8_t zone);
  void log_i2c_scan();
  void set_manifold_type(ManifoldType type);
  ManifoldType get_manifold_type() const;
  uint16_t get_motor_trace_sample_count() const;
  bool get_motor_trace_sample(uint16_t logical_index, MotorTraceSample *out) const;
  void clear_motor_trace();
  MotorSafetyDiagnostics get_motor_safety_diagnostics() const;

  /// Enable or disable all motor drivers (nSLEEP control).
  /// When disabled, all motors are put to sleep and commands are rejected.
  void set_drivers_enabled(bool enabled);
  bool are_drivers_enabled() const { return drivers_enabled_.load(std::memory_order_acquire); }
  /// Manual mode (zone controller): automatic learning and relearn wait.
  /// Explicit requests (Reset and relearn, Relearn all) still run.
  void set_auto_learn_hold(bool hold) {
    auto_learn_hold_.store(hold, std::memory_order_release);
    // Turning manual mode on stops a learn that is already running.
    if (hold && calibrating_.load(std::memory_order_acquire))
      calibration_abort_.store(true, std::memory_order_release);
  }
  // Drive LATCH_ARM high on the HTTP thread so pad 10 is high before loop()
  // drains the queued enable. Bring-up only, and a no-op on Rev 3.3: GPIO17
  // is DRIVER_N_SLEEP there.
  void assert_latch_arm_high();
  bool has_fault_latch() const {
    return rev32_backend_ != nullptr && rev33_backend_ == nullptr;
  }
  // Reads the board revision from the hardware rather than trusting the YAML.
  // On Rev 3.3 RAIL_OVERCURRENT and FAULT_USB_RAW carry external 10k pull-ups;
  // on Rev 3.2 those pads are unconnected. An internal pull-down loses to the
  // external pull-up and wins against a floating pad, so the two revisions are
  // distinguishable with no extra hardware.
  bool probe_board_is_rev33_();
  // Bring-up only: square-wave LATCH_ARM so the AC-coupled arm path can be
  // measured with a multimeter. False when there is no Rev 3.2 latch.
  bool probe_arm_clock(uint32_t hz, uint32_t duration_ms, bool clamp,
                       Rev32MotorBackend::ArmClockProbe *out);
  // Bring-up only: hold one decoder address with the bridges coasting so the
  // 74HC4514 outputs can be verified against the channel map with a meter.
  bool probe_decoder(uint8_t zone, bool reverse, uint32_t hold_ms,
                     Rev32MotorBackend::DecoderProbe *out);

  /// Reload motor config from config store (call after UI changes).
  void reload_motor_config();

 protected:
  static constexpr uint32_t TICK_MS = 10;
  static constexpr uint32_t FAST_TICK_MS = 1;
  static constexpr uint8_t TICKS_PER_FSM = TICK_MS / FAST_TICK_MS;
  // Calibration nests execute_move_ → motor_loop_ → process_tick_ with large
  // locals; 8 KB overflowed on enable→auto-relearn. Match zone task headroom.
  static constexpr uint32_t STACK_SIZE = 16384;
  static constexpr UBaseType_t PRIORITY = 7;
  static constexpr BaseType_t CORE = 1;
  static constexpr uint8_t CMD_QUEUE_LEN = 12;
  static constexpr float CURRENT_FILTER_ALPHA = 0.05f;
  // --- Free-travel baseline (see move_baseline_ma_) --------------------------
  static constexpr uint32_t BASELINE_SEARCH_START_MS = 400;   ///< past blanking + a primed filter
  static constexpr uint32_t BASELINE_STABLE_MS = 300;         ///< unchanged this long = settled
  static constexpr float BASELINE_EPSILON_MA = 0.5f;          ///< ~12 LSB; above the noise floor
  static constexpr float BASELINE_FLOOR_MA = 8.0f;            ///< below this it is an open circuit
  static constexpr float BASELINE_CEILING_MA = 32.0f;         ///< above this it is a stuck breakaway
  /// Arm the open cap even if the minimum never settles, so a fault cannot
  /// leave the open direction permanently unprotected.
  static constexpr uint32_t OPEN_ARM_FALLBACK_MS = 8000;
  /// A real endpoint cannot be reached without travel. Without this floor an
  /// uncalibrated move satisfied the endpoint window from t=0, so any cadence
  /// hiccup could write a learned position - which is how a Motor Lab jog ended
  /// up able to record one.
  static constexpr uint32_t ENDPOINT_MIN_RIPPLES = 50;
  /// Weak load evidence for the opening direction: half the measured pin step,
  /// a sixth of the open stop's rise. Enough to show the motor is loaded without
  /// requiring the full trip.
  static constexpr float OPEN_WEAK_STEP_MA = 4.0f;
  static constexpr float OPEN_WEAK_FACTOR = 1.15f;
  static constexpr uint8_t DEBOUNCE_TICKS = 50;
  static constexpr float INITIAL_MEAN_CURRENT_MA = 20.0f;
  static constexpr uint32_t ENDSTOP_MIN_RUNTIME_MS = 1200;      ///< Conservative blind window (calibration)
  static constexpr uint32_t ENDSTOP_SETTLE_MS = 300;            ///< Post-boost settle before threshold/slope detection
  static constexpr uint8_t ENDSTOP_HIGH_TICKS = 6;
  static constexpr float ENDSTOP_HARD_CAP_MA = 100.0f;          ///< Safety cap: immediate endstop above this
  /// LMV393 rail comparator trip (design-contract rev3.3-P: 150 mA nominal,
  /// 142-158 worst case). Firmware must always see a fault before the hardware.
  static constexpr float RAIL_COMPARATOR_TRIP_MA = 150.0f;
  static constexpr uint8_t HARD_CAP_TICKS = 2;                  ///< Consecutive raw-current ticks above cap to stop
  /// Hard mechanical ceiling for HmIP-VDMOT (design-contract runtime_limit_ms).
  static constexpr uint32_t HMIP_VDMOT_RUNTIME_LIMIT_MAX_S = 40;
  // Fast open hard-stop cap: the open retract stop is a sharp ~47-52 mA raw bite, but the
  // slope path only updates once per 500 ms window, so the gears grind for up to ~500 ms
  // (1-3 ticks) before it reacts. A raw-current trip catches it in ~30 ms. To dodge the
  // ~45 mA open BREAKAWAY current (which false-fired a naive open cap at ~600 ms), arm
  // only AFTER the current has settled back below the free-travel band — then only the
  // end-stop bite can trip it. No travel estimate needed; degrades to stall/STOPPING if never armed.
  static constexpr float OPEN_FAST_CAP_MA = 40.0f;             ///< Raw-current fast trip for the open hard stop
  static constexpr float OPEN_FAST_CAP_ARM_BELOW_MA = 28.0f;   ///< Arm only after post-breakaway settle below this
  static constexpr uint8_t OPEN_FAST_CAP_TICKS = 3;            ///< ~30 ms raw debounce
  // Close seat absolute (our continuous-drive sense path). VdMot's published
  // absolute experiments used ~65–70 mA on their ADC; with our INA/ADC scale the
  // same mechanical seat sits near ~38 mA (free ~24 mA, pin plateau ~31–33 mA).
  // Arm only in UNDER_LOAD/STOPPING so pin contact cannot trip.
  // HmIP mechanical hard wall remains 40 s — plunger is at housing exit by then.
  static constexpr float CLOSE_FAST_CAP_MA = 38.0f;
  static constexpr uint8_t CLOSE_FAST_CAP_TICKS = 4;           ///< ~40 ms at 10 ms FSM tick
  /// VdMot-style intermediate absolute (their TimerHandler0 overcnt at 60 mA).
  static constexpr float VDMOT_WORKING_CAP_MA = 60.0f;
  static constexpr uint8_t VDMOT_WORKING_CAP_TICKS = 2;        ///< ~20 ms
  static constexpr uint32_t SLOPE_WINDOW_TICKS = 50;             ///< 500ms window for dI/dt telemetry (not a trip)
  static constexpr float ENDSTOP_SLOPE_MA_PER_S = 0.4f;         ///< Legacy; slope no longer stops the drive
  static constexpr float ENDSTOP_SLOPE_CURRENT_FACTOR = 1.3f;   ///< Legacy; slope no longer stops the drive
  static constexpr uint8_t ENDSTOP_SLOPE_WINDOWS = 2;           ///< Legacy; slope no longer stops the drive
  static constexpr uint8_t ENDSTOP_SLOPE_WINDOWS_OPEN = 1;      ///< Legacy; slope no longer stops the drive
  static constexpr uint32_t RIPPLE_STALL_MS = 750;             ///< Ripple-plateau (rotation stall) endstop: no commutation this long = stalled
  static constexpr uint32_t RIPPLE_STALL_MIN_COUNT = 20;      ///< Require real rotation first, so a never-started motor isn't called "stalled"
  static constexpr uint32_t ALREADY_AT_STOP_MS = 100;         ///< After boost, zero ripples + current present = valve already against the commanded stop (fast, pop-off-safe)
  static constexpr uint32_t EARLY_STALL_MS = 250;             ///< Evaluated DURING boost (before the current debounce): 0 ripples by here = never moved = already at the stop; stop before boost force pops an already-closed actuator
  static constexpr uint8_t CALIBRATION_DUTY_PCT = 100;        ///< Calibration drives at full duty (no 70% hold, no coast): full torque + undiluted IPROPI so the endstop stall current is strong and detectable
  static constexpr uint32_t RELEARN_CHECK_INTERVAL_MS = 10000;  ///< Check relearn triggers every 10s
  static constexpr uint32_t CALIBRATION_REQUEST_GUARD_MS = 15000;  ///< Ignore calibration requests briefly after boot
  static constexpr uint32_t AUTO_START_DELAY_MS = 10000;  ///< Delay after boot before auto-enable + full calibration
  static constexpr uint32_t CALIBRATION_NO_RIPPLE_ABORT_MS = 3000;  ///< Abort a calibration pass if no commutation ripples seen (no motor wired)
  /// Homing close that hits BLOCKED/overrun (already seated, or seated without
  /// a confirmed endpoint) opens this long before closing again. Steps up on
  /// each retry so a short pop-off still leaves enough dead space for pin detect.
  static constexpr uint32_t LEARN_CLOSE_BACKOFF_OPEN_MS = 10000;
  static constexpr uint32_t LEARN_CLOSE_BACKOFF_STEP_MS = 5000;
  static constexpr uint8_t LEARN_CLOSE_BACKOFF_MAX = 3;
  /// Coast time between a homing stop and the reversing backoff open. Reversing
  /// a motor that is still loaded trips the bridge over-current latch (nFAULT),
  /// which aborted learning ~14 ms into the second backoff.
  static constexpr uint32_t LEARN_REVERSE_SETTLE_MS = 600;
  static constexpr UBaseType_t CALIBRATION_BOOST_PRIORITY = PRIORITY + 3;  ///< Modest boost during calibration; stays below ESP-IDF system tasks
  static constexpr bool DEVELOPMENT_KEEP_NSLEEP_AWAKE = false;  ///< Set true only when debugging brownout/resets
  static constexpr uint16_t TRACE_MAX_SAMPLES = 2000;
  static constexpr uint32_t TRACE_SAMPLE_PERIOD_US = 2000;

  // Ripple detection constants (DMA continuous mode @ 15 kHz)
  static constexpr uint32_t RIPPLE_SAMPLE_RATE_HZ      = 15000;
  static constexpr uint32_t RIPPLE_DMA_FRAME_BYTES     = 1024;  ///< ~256 samples × 4 B = ~17 ms per frame
  static constexpr uint32_t RIPPLE_DMA_STORE_BYTES     = 4096;  ///< 4 frames of internal DMA ring buffer
  static constexpr uint32_t RIPPLE_DMA_DEBOUNCE_SAMPLES = 75;   ///< 5 ms inrush blanking at 15 kHz
  static constexpr RippleCounter::Config kRippleConfig = {
    .sampleRate       = 15000.0f,
    .lpAlpha          = 0.002f,
    .hpAlpha          = 0.90f,
    .threshold        = 3.0f,
    .hysteresis       = 0.5f,
    .ripplesPerRev    = 24,
    .minPeriodSamples = 75,   ///< floor(15000 / 200 Hz) — gate above 200 Hz
  };
  static constexpr uint8_t PIN_ENGAGE_DEBOUNCE_TICKS = 20;      ///< 200ms sustained current step for detection

  // Rev 3.2 ADC stream. Two channels share one continuous unit, so the hardware
  // sample rate is twice this and each channel lands here.
  static constexpr uint32_t REV32_ADC_SAMPLE_RATE_HZ = 10000;
  /// 128 samples = 64 per channel = 6.4 ms per frame. Half the DRV8215 frame:
  /// the closing hard stop is where pop-off happens, so frame latency is force
  /// into a rigid stop.
  static constexpr uint32_t REV32_DMA_FRAME_BYTES = 512;
  /// Minimum-period gate for the analog cross-check counter. The qualified
  /// commutation band is 20-40 Hz, so 100 Hz rejects anything far above it while
  /// leaving the band itself untouched.
  static constexpr uint32_t REV32_TACHO_GATE_HZ = 100;

  // FreeRTOS task
  static void task_func_(void *arg);
  void run_();

  // Core FSM
  void process_tick_();
  void process_command_queue_();
  void execute_move_(uint8_t zone, float target_pct);
  void execute_timed_move_(uint8_t zone, uint16_t duration_ms, MotorDirection dir, bool override_drivers);

  // Motor start/stop
  bool start_motor_(uint8_t zone, MotorDirection dir, bool override_drivers = false);
  void stop_motor_(bool record_event);
  void apply_drive_output_();
  uint8_t effective_hold_duty_();  ///< PWM hold duty for this tick (reduced during soft-approach)

  /// The point in a move at which "no motion evidence yet" becomes evidence of
  /// anything. On the DRV8215/Rev 3.1 path this is anchored to the PWM boost
  /// phase; Rev 3.2 has no boost, so it is derived from the tacho contract
  /// instead — blanking plus two worst-case commutation periods. Deriving it
  /// means it can never land inside the blanking window, whatever the tacho is
  /// configured to.
  uint32_t motion_decision_ms_() const;

  /// Open the ADC unit in continuous (DMA) mode. One stream owns the unit: the
  /// oneshot and continuous drivers cannot share it. Rev 3.2 puts two channels
  /// in the pattern (ADC_CURRENT and ADC_TACHO); everything else uses one.
  bool start_adc_stream_();

  /// Clamp motor config that came out of NVS. These are operator-editable
  /// bring-up values, so a nonsensical pair must not silently weaken a safety
  /// decision.
  void sanitize_motor_cfg_();

  // Current sensing
  float read_current_ma_();
  /// Endpoint window: has the move covered the commutation count a
  /// real endpoint takes? Closing measures the learned seating depth from the
  /// observed pin contact; opening has no contact phase, so it uses the travel
  /// estimated for the move. Uncalibrated, it cannot withhold an endpoint.
  bool endpoint_window_reached_() const;
  void detect_endstop_();
  void detect_open_circuit_();
  void detect_pin_engagement_();
  void check_relearn_triggers_();
  MotorProfile effective_motor_profile_(uint8_t zone) const;
  uint32_t effective_runtime_limit_s_(uint8_t zone) const;
  /// Assemble the per-move mechanical ceiling from config + learned telemetry.
  MoveCeilingInputs build_ceiling_inputs_(uint8_t zone, MotorDirection dir,
                                          bool drive_to_endstop, bool calibrating,
                                          uint32_t timed_duration_ms) const;
  /// Recompute the move ceiling once the caller has set drive_to_endstop_active_
  /// / timed state. start_motor_() installs a conservative bootstrap limit first,
  /// so a caller that forgets is still bounded.
  void refresh_move_limit_(uint32_t timed_duration_ms);
  /// Stall current learned at this zone's last confirmed endpoint in this
  /// direction, or 0 when none has been recorded. Measured where the motor is
  /// known to be stalled, so it needs no on-line fitting.
  float learned_stall_ma_(uint8_t zone, MotorDirection dir) const;
  /// Whether this move should re-establish its datum at the close endstop.
  bool rehome_required_(uint8_t zone) const;
  CapLadder cap_ladder_() const;
  StallModelConfig stall_model_cfg_() const;
  float effective_current_factor_(uint8_t zone, MotorDirection dir) const;
  void update_learned_factor_(uint8_t zone, MotorDirection dir, float average_ma, float peak_ma, bool sample_valid);
  uint32_t get_motion_count_() const;

  // Ripple counting (DMA continuous processor task)
  void motor_loop_();
  void run_ripple_task_();
  static void ripple_task_func_(void *arg);
  float adc_raw_to_ma_(int raw);
  /// Volts at the ADC pin to motor milliamps. The two hardware generations
  /// measure entirely different things: a DRV8215 IPROPI current mirror versus
  /// a shunt into an INA180A1 at 10 V/A.
  float volts_to_ma_() const;

  // Fault handling
  void trigger_fault_(FaultCode code, const char *reason);

  // Calibration
  void run_calibration_(uint8_t zone);

  /// Run a single close-to-endstop or open-to-endstop pass.
  /// Returns the run time in ms, or 0 on fault.
  uint32_t calibration_pass_(uint8_t zone, MotorDirection dir);
  /// Home to the close seat. If the valve is already seated, GPIO backends
  /// report BLOCKED instead of an endpoint — back off open, then close again.
  bool home_to_seat_(uint8_t zone);
  /// Timed open during learning (endstop still armed). Used to unseat a
  /// valve that homing-close found already closed. Faults are swallowed.
  void calibration_backoff_open_(uint8_t zone, uint32_t hold_ms);
  /// Working-range learning (stroke_learning.h): home, bounded open legs and
  /// close passes that must start in dead space. Returns true when learned.
  bool learn_working_range_(uint8_t zone, uint8_t attempt);
  void set_learning_progress_(uint8_t zone, uint8_t pct, uint8_t phase, uint8_t sample,
                              uint8_t samples_needed);
  void clear_learning_progress_();
  /// Open by at most `target_ripples` from wherever the valve is. The open
  /// endpoint paths stay armed as a backstop; hitting one is reported.
  OpenLegResult calibration_open_leg_(uint8_t zone, uint32_t target_ripples);
  bool working_range_learning_enabled_() const {
    return rev32_backend_ != nullptr && ripple_enabled_ && motor_cfg_.working_range_learning;
  }
  bool uses_working_range_(uint8_t zone) const;

  // Position estimation
  float estimate_travel_time_ms_(uint8_t zone, float from_pct, float to_pct);

  // Hardware helpers
  void set_nsleep_(bool enabled);
  bool read_nfault_();
  void save_telemetry_(uint8_t zone);
  void log_startup_self_test_();
  bool manifold_is_nc_() const;
  float logical_to_actuator_pct_(float logical_pct) const;
  float actuator_to_logical_pct_(float actuator_pct) const;
  float flow_to_physical_pct_(uint8_t zone, float flow_pct);
  void trace_reset_();
  void trace_sample_(int raw_adc, float current_ma);

  // Component references
  Lv6ConfigStore *config_store_ = nullptr;
  esphome::i2c::I2CBus *i2c_bus_ = nullptr;
  esphome::sensor::Sensor *current_sensor_ = nullptr;

  // Pin configuration
  gpio_num_t nsleep_pin_ = GPIO_NUM_6;
  gpio_num_t nfault_pin_ = GPIO_NUM_4;
  gpio_num_t ipropi_pin_ = GPIO_NUM_7;
  std::array<uint8_t, NUM_ZONES> motor_addresses_{};
  // Set after the startup I²C probe.  A controller mounted on an unpowered or
  // different PCB must never raise nSLEEP and energise a floating motor bus.
  bool any_driver_present_{false};

  // Discrete-GPIO backends (Rev 3.1 Lean, Rev 3.2).  On both of them
  // nsleep_pin_ is MOTOR_ENABLE, nfault_pin_ is the active-high LATCH_STATE and
  // ipropi_pin_ is the shared INA180 ADC_CURRENT - the names are inherited from
  // the DRV8215 path and the pins mean something else here.
  MotorBackendKind backend_kind_{MotorBackendKind::DRV8215_I2C};
  bool gpio_backend_enabled_{false};
  Rev31PinConfig rev31_pins_{};
  Rev32PinConfig rev32_pins_{};
  Rev33PinConfig rev33_pins_{};
  Rev32TachoConfig rev32_tacho_{};
  // Owning pointer to whichever backend was built; the typed pointers below
  // alias it and are non-null only for their own revision.
  GpioMotorBackend *gpio_backend_{nullptr};
  Rev31MotorBackend *rev31_backend_{nullptr};
  Rev32MotorBackend *rev32_backend_{nullptr};
  Rev33MotorBackend *rev33_backend_{nullptr};
  uint16_t bemf_threshold_raw_{40};
  bool auto_start_calibration_{true};
  uint32_t last_bemf_sample_ms_{0};
  uint8_t rev31_invalid_bemf_samples_{0};
  std::atomic<uint16_t> rev31_diag_raw_a_{0};
  std::atomic<uint16_t> rev31_diag_raw_b_{0};
  std::atomic<int16_t> rev31_diag_differential_{0};
  std::atomic<uint16_t> rev31_diag_separation_us_{0};
  std::atomic<uint8_t> rev31_diag_sample_valid_{0};
  std::atomic<uint8_t> rev31_diag_sample_moving_{0};
  std::atomic<uint8_t> rev31_diag_invalid_samples_{0};
  std::atomic<uint32_t> motor_diag_tacho_period_us_{0};
  std::atomic<uint32_t> motor_diag_tacho_rejected_{0};
  // Continuous-ADC instrumentation; see MotorSafetyDiagnostics.
  std::atomic<uint32_t> adc_notifies_{0};
  std::atomic<uint32_t> adc_frames_{0};
  std::atomic<uint32_t> adc_read_errors_{0};
  std::atomic<uint32_t> adc_channel_mask_{0};
  // -1 means adc_continuous_start() was never even attempted, which is a
  // different failure from it being attempted and returning ESP_OK (0).
  std::atomic<int32_t> adc_start_err_{-1};
  std::atomic<uint32_t> motor_diag_tacho_hardware_{0};
  std::atomic<uint8_t> motor_diag_armed_{0};
  std::atomic<uint8_t> motor_diag_decoder_address_{0};
  std::atomic<uint32_t> motor_diag_tacho_cadence_us_{0};
  std::atomic<uint8_t> motor_diag_stroke_phase_{0};
  std::atomic<uint32_t> motor_diag_evidence_count_{0};
  std::atomic<uint32_t> motor_diag_sample_sequence_{0};
  std::atomic<uint32_t> motor_diag_runtime_ms_{0};
  std::atomic<int32_t> motor_diag_current_ma_x10_{0};
  static constexpr uint32_t REV31_BEMF_SAMPLE_PERIOD_MS = 20;
  static constexpr uint8_t REV31_MAX_INVALID_BEMF_SAMPLES = 3;

  // DRV8215 driver instances
  std::array<DRV8215 *, NUM_ZONES> drivers_{};

  // Motor FSM state (atomic for cross-thread access)
  std::atomic<bool> motor_turning_{false};
  std::atomic<bool> drivers_enabled_{false};
  std::atomic<bool> auto_learn_hold_{false};
  /// Set by manual mode during a learn; every calibration loop checks it, the
  /// motor stops at once and nothing from the aborted run is stored.
  std::atomic<bool> calibration_abort_{false};
  bool calibration_aborted_() const { return calibration_abort_.load(std::memory_order_acquire); }
  uint8_t current_zone_ = 0;
  MotorDirection current_dir_ = MotorDirection::OPEN;
  MotorFsmState fsm_state_ = MotorFsmState::IDLE;
  uint32_t motor_run_time_ms_ = 0;
  uint32_t drive_phase_elapsed_ms_ = 0;
  std::atomic<bool> drive_output_enabled_{false};
  
  // Timed movement state
  bool timed_mode_active_ = false;
  uint32_t timed_move_start_ms_ = 0;
  uint16_t timed_move_duration_ms_ = 0;
  bool nsleep_overridden_ = false;  // nSLEEP raised temporarily for override move

  // Current sensing
  float current_raw_ma_ = 0.0f;
  float current_filtered_ma_ = 0.0f;
  float current_peak_ma_ = 0.0f;
  float current_sum_ = 0.0f;
  int current_count_ = 0;
  int debounce_count_ = 0;
  uint8_t endstop_high_count_ = 0;
  uint8_t hard_cap_high_count_ = 0;  ///< Consecutive raw-current ticks above the hard cap
  bool open_fast_cap_armed_ = false;  ///< Open fast cap arms only after post-breakaway current settle
  uint8_t open_fast_cap_count_ = 0;   ///< Consecutive raw-current ticks above the fast open cap
  uint8_t close_fast_cap_count_ = 0;  ///< Consecutive raw-current ticks above the close seat cap
  int low_current_count_ = 0;
  uint32_t oc_last_ripple_count_ = 0;  ///< Ripple count at last open-circuit check (rotation = connected)
  uint32_t stall_last_ripple_count_ = 0;  ///< Highest ripple count seen this move (rotation-stall endstop)
  uint32_t stall_last_advance_ms_ = 0;     ///< Runtime at last ripple advance (plateau = at the stop)
  bool stall_initialized_ = false;         ///< Baseline the stall window from the guard, not motor start
  // Calibration detection is self-referential: the running-current baseline is measured
  // fresh each pass (never the stored mean), so a corrupted prior value can't break a
  // re-learn. Endstop = current rising above this fresh baseline.
  float cal_baseline_ma_ = 0.0f;
  bool cal_baseline_set_ = false;
  /// This-stroke free-travel baseline (VdMot: meancurrent measured while turning normally).
  /// The stroke's free-travel reference: a running MINIMUM of the filtered
  /// current taken while the tracker is in FREE_TRAVEL, clamped, and treated as
  /// settled once it has stopped falling. Every mechanical feature on this
  /// actuator is ABOVE free travel, so a minimum is the only estimator a
  /// feature cannot drag toward itself - which is what an EMA did, hiding the
  /// 1-2 mA/s pin and seat ramps entirely.
  float move_baseline_ma_ = 0.0f;
  bool move_baseline_set_ = false;   ///< settled: safe to arm thresholds
  bool baseline_valid_ = false;      ///< a minimum exists: safe to phase-track
  uint32_t baseline_last_drop_ms_ = 0;
  bool current_filter_primed_ = false;
  /// Trailing-step detector for the CLOSE trip. Closing has no flat baseline -
  /// the valve spring drives the current up continuously and the endstop adds
  /// only ~10% on top - so a free-travel reference would trip mid-travel.
  /// Host-tested against the measured fixtures by `make test-stall-model`.
  TrailingStepDetector close_step_{};
  uint8_t vdmot_working_cap_count_ = 0;

  // --- Mechanical ceiling for the move in flight -----------------------------
  // Computed once in start_motor_() rather than per tick: it must not shift
  // mid-move if the operator edits settings, and effective_runtime_limit_s_()
  // was copying the whole config struct at 100 Hz to derive it.
  MoveCeiling move_limit_{};
  /// Wall-clock origin. motor_run_time_ms_ used to be a tick accumulator, which
  /// under-counts whenever the FSM task is starved — so every safety window
  /// silently stretched in real time under load. VdMot hit the same class of bug
  /// (changelog 1.0.9, "correct motor drive and stopping during high system
  /// loads") and moved their motor loop into a timer ISR.
  uint32_t move_start_ms_ = 0;
  /// Position is only trusted after a confirmed endpoint. Runtime-only: cleared
  /// on boot, on any fault and on relearn, so travel scaling can only tighten
  /// the ceiling, never widen it on stale data.
  bool position_confident_[NUM_ZONES] = {};
  /// Anti-drift: position is derived, never accumulated. A move to an
  /// intermediate target first drives to the close endstop and then opens by a
  /// ripple count, so error cannot compound across moves.
  uint32_t moves_since_rehome_[NUM_ZONES] = {};
  uint32_t last_rehome_ms_[NUM_ZONES] = {};
  /// Guards the one level of recursion in execute_move_().
  bool rehoming_ = false;
  /// Set by the zone controller while closing this zone would breach minimum
  /// flow. eQ-3 shipped a fix for exactly this: their weekly adaptation closed
  /// every valve at once and tripped heat-pump flow alarms.
  std::atomic<bool> rehome_inhibited_{false};
  /// Free-travel commutation cadence for this stroke, used as the reference for
  /// the spurious-count physics check.
  float free_cadence_hz_ = 0.0f;
  uint32_t last_cadence_count_ = 0;
  uint32_t last_cadence_ms_ = 0;
  SpuriousCountDetector spurious_{};
  CapCounters cap_counters_{};
  /// Sanitized once per move so the ripple task never reads motor_cfg_ and a
  /// mid-move settings edit cannot reorder the ladder under it.
  CapLadder cap_ladder_cached_{};
  /// Rung that the fast path cut the drive for, classified on the next FSM tick.
  /// Motor-task only; the cross-thread channel is fast_trip_.
  uint8_t last_fast_trip_ = 0;
  /// Set when the fast path has taken the drive off. apply_drive_output_() would
  /// otherwise re-energise the bridge on the very next tick.
  bool drive_inhibited_ = false;
  /// Last classifier verdict, kept so diagnostics can report outcomes that
  /// deliberately raise no fault.
  uint8_t last_endpoint_decision_ = 0;

  // Per-move context for soft-approach + adaptive endstop guard (set at move start)
  bool drive_to_endstop_active_ = false;  ///< Current move targets a mechanical limit
  bool endpoint_confirmed_ = false;       ///< Set only by a qualified endpoint classifier
  bool soft_approach_active_ = false;     ///< Reduced drive duty engaged this tick
  uint32_t endstop_guard_ms_ = ENDSTOP_MIN_RUNTIME_MS;  ///< Blind window before threshold/slope detection
  uint32_t approach_stroke_ripples_ = 0;  ///< Estimated ripples for this move (0 = unknown)
  uint32_t approach_stroke_ms_ = 0;       ///< Estimated travel time for this move (0 = unknown)

  // Slope-based endstop detection state
  float slope_prev_current_ma_ = 0.0f;
  uint32_t slope_tick_count_ = 0;
  float current_slope_ma_per_s_ = 0.0f;
  bool slope_initialized_ = false;
  uint8_t slope_endstop_windows_ = 0;

  // Stroke-phase tracker for the GPIO-bridge path (Rev 3.2/3.3). Closing is
  // free travel → pin contact → pressure → hard stop; opening is free travel
  // then the gear train bottoming out. Phases 2 and 4 are near-identical in
  // the current domain, so the tracker separates them on cadence recovery.
  // See endpoint_logic.h.
  StrokeTracker stroke_{};
  /// Pin onset from current on close moves. The tracker's contact test also
  /// needs the rotor to slow, which this actuator barely does at the pin.
  PinOnsetDetector pin_onset_{};
  /// Close moves: filtered current when pin contact was first seen. The level
  /// trip is referenced to it, since free-travel current is crossed by the pin
  /// ramp itself. 0 = no contact yet.
  float pin_anchor_ma_{0.0f};
  /// Close moves past the pin: soft seat as a rise over the pressing plateau.
  SeatRiseDetector seat_rise_{};
  /// Zone has a learned pin-to-seat depth, so the endpoint window can place
  /// the seat and the rate-based close trip may be trusted past the pin.
  bool close_seating_learned_{false};
  /// Set while learn_working_range_() runs. The stroke being relearned must not
  /// size its own ceilings: an open leg does not update the position, so the old
  /// stroke x a 0 % position would cut the next close pass after ~150 counts.
  bool learning_active_{false};

  // Pin engagement detection (calibration close passes)
  bool pin_detect_enabled_ = false;
  float pin_detect_baseline_ma_ = 0.0f;
  bool pin_detect_baseline_set_ = false;
  bool pin_detected_ = false;
  uint32_t pin_detected_ripples_ = 0;
  uint8_t pin_detect_sustained_ = 0;

  // Relearn scheduling
  uint32_t last_relearn_check_ms_ = 0;

  // Fault (atomic for cross-thread reads)
  std::atomic<FaultCode> current_fault_code_{FaultCode::NONE};

  // Telemetry
  mutable SemaphoreHandle_t telemetry_mutex_ = nullptr;
  std::array<MotorTelemetry, NUM_ZONES> telemetry_{};
  // Endstop threshold base, tracked per direction: closing draws materially more
  // current than opening, so a single blended mean inflates the open threshold and
  // lets the motor grind past the open stop. Indexed via mean_current_().
  std::array<float, NUM_ZONES> mean_open_currents_;
  std::array<float, NUM_ZONES> mean_close_currents_;
  float &mean_current_(uint8_t zone, MotorDirection dir) {
    return dir == MotorDirection::OPEN ? mean_open_currents_[zone] : mean_close_currents_[zone];
  }

  // Command queue + task
  QueueHandle_t cmd_queue_ = nullptr;
  TaskHandle_t task_handle_ = nullptr;

  // Calibration request (atomic for cross-thread access)
  std::atomic<int8_t> calibration_request_{-1};
  std::atomic<uint8_t> calibration_pending_mask_{0};
  std::atomic<bool> calibrating_{false};
  /// Packed learning UI progress: zone(8) | pct(8) | sample(8) | phase(4) | need(4)
  /// Updated from the valve task; read lock-free from the dashboard snapshot.
  std::atomic<uint32_t> learning_progress_packed_{0};

  // Motor config cache
  MotorConfig motor_cfg_;

  // ADC continuous (DMA) for IPROPI @ 15 kHz
  // adc_continuous_handle_t and adc_cali_handle_t are kept as void* to avoid
  // pulling ESP-IDF headers into this header file.
  void *adc_continuous_handle_ = nullptr;
  void *adc_cali_handle_ = nullptr;
  int ipropi_channel_ = 0;
  bool ripple_enabled_ = false;
  /// Attenuation the ADC_CURRENT channel is sampling at. Rev 3.2 uses 6 dB, so
  /// the uncalibrated fallback conversion has a different full scale.
  int adc_current_atten_ = 0;
  /// Rev 3.2 only: TACHO_AMP's channel in the same DMA pattern, -1 when absent.
  int tacho_adc_channel_ = -1;
  bool adc_tacho_enabled_{false};

  // Ripple counter (written by ripple task, count read via live_ripple_count_)
  RippleCounter ripple_counter_{kRippleConfig};
  std::atomic<uint32_t> live_ripple_count_{0};

  // Rev 3.2 analog cross-check. COMM_TACHO_N through PCNT stays the authority
  // for position; this counts the SAME waveform from the analog side, so the
  // hardware counter's missed- and false-edge rate can be computed on-device.
  // That rate is the release gate in § 2 of the validation plan.
  RippleCounter *tacho_adc_counter_ = nullptr;
  std::atomic<uint32_t> tacho_adc_count_{0};
  std::atomic<uint16_t> tacho_adc_raw_{0xFFFF};

  // Set by the ripple task from the per-frame current peak and consumed by
  // motor_loop_() at 1 ms. On the closing hard stop every millisecond past the
  // cap is force into a rigid stop, so this does not wait for the 10 ms FSM tick.
  std::atomic<bool> hard_cap_tripped_{false};
  /// Severity-ordered fast trip raised by the ripple task and consumed exactly
  /// once by motor_loop_(). One atomic rather than one per rung, so a circuit
  /// fault arriving in the same frame as a seat trip cannot be lost.
  std::atomic<uint8_t> fast_trip_{0};
  /// Context the ripple task needs, published by the motor task. Single writer,
  /// single reader, one word — no mutex, no torn state.
  /// bit0 dir_is_open, bit1 past_blanking, bit2 seat_phase, bit3 open_cap_armed.
  std::atomic<uint8_t> cap_ctx_{0};

  // DMA task state
  TaskHandle_t ripple_task_handle_ = nullptr;
  uint32_t dma_debounce_remaining_ = 0;
  /// Samples blanked after each drive-on transition. 5 ms of inrush on the
  /// DRV8215 path; on Rev 3.2 this is the contract's mandatory 250 ms tacho
  /// blanking, set from the stream's per-channel rate in start_adc_stream_().
  uint32_t dma_debounce_samples_ = RIPPLE_DMA_DEBOUNCE_SAMPLES;
  bool ripple_drive_was_on_ = false;
  alignas(32) uint8_t adc_frame_buf_[RIPPLE_DMA_FRAME_BYTES];
  uint8_t fsm_tick_count_ = 0;
  float latest_current_ma_ = 0.0f;
  uint32_t last_publish_ms_ = 0;
  uint32_t boot_time_ms_ = 0;  // Set after setup() completes; guards replayed startup commands
  bool auto_start_done_ = false;  // Set once auto-enable + calibration runs on boot

  // High-rate motor trace buffer — PSRAM-allocated in setup() to save ~31 KB of internal heap
  mutable SemaphoreHandle_t trace_mutex_ = nullptr;
  MotorTraceSample *trace_samples_{nullptr};
  uint16_t trace_write_index_ = 0;
  bool trace_wrapped_ = false;
  uint32_t trace_start_us_ = 0;
  uint32_t trace_last_sample_us_ = 0;
};

}  // namespace lv6
