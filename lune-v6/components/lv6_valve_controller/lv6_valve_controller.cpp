// =============================================================================
// LV6 Valve Controller — ESPHome Component Implementation
// =============================================================================
// Ported from lib/valve_controller/src/valve_controller.cpp
// Key change: uses ESPHome I2C bus and sensor abstractions instead of raw
// ESP-IDF drivers. The FreeRTOS motor task is preserved because the 10ms
// tick motor FSM cannot run in ESPHome's main loop (too slow, non-deterministic).
// =============================================================================

#include "lv6_valve_controller.h"
#include "esphome/core/log.h"
#include "esphome/core/hal.h"
#include "esp_timer.h"
#include "esp_heap_caps.h"
#include "esp_adc/adc_oneshot.h"   // adc_oneshot_io_to_channel() for GPIO→channel mapping
#include "esp_adc/adc_continuous.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include <algorithm>
#include <utility>
#include <cstdio>
#include <cmath>
#include <cstdarg>
#include <inttypes.h>

// File-static ISR callback: DMA conversion-done → notify ripple processor task.
// Must be in IRAM and return quickly.
static IRAM_ATTR bool ripple_adc_conv_done_(
    adc_continuous_handle_t /*hdl*/,
    const adc_continuous_evt_data_t * /*edata*/,
    void *user_data)
{
  auto *task_handle = static_cast<TaskHandle_t *>(user_data);
  BaseType_t must_yield = pdFALSE;
  vTaskNotifyGiveFromISR(*task_handle, &must_yield);
  portYIELD_FROM_ISR(must_yield);
  return false;
}

namespace lv6 {

static const char *const TAG = "hv6_valve_ctrl";

// =============================================================================
// ESPHome Lifecycle
// =============================================================================

void Lv6ValveController::setup() {
  mean_open_currents_.fill(INITIAL_MEAN_CURRENT_MA);
  mean_close_currents_.fill(INITIAL_MEAN_CURRENT_MA);

  telemetry_mutex_ = xSemaphoreCreateMutex();
  if (telemetry_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create telemetry mutex");
    this->mark_failed();
    return;
  }

  trace_mutex_ = xSemaphoreCreateMutex();
  if (trace_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create trace mutex");
    this->mark_failed();
    return;
  }

  trace_samples_ = static_cast<MotorTraceSample *>(
      heap_caps_malloc(TRACE_MAX_SAMPLES * sizeof(MotorTraceSample), MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
  if (trace_samples_ == nullptr) {
    ESP_LOGW(TAG, "PSRAM alloc for trace buffer failed — motor trace disabled");
  } else {
    memset(trace_samples_, 0, TRACE_MAX_SAMPLES * sizeof(MotorTraceSample));
    ESP_LOGI(TAG, "Motor trace buffer: %u samples (%.1f KB) in PSRAM",
             TRACE_MAX_SAMPLES, TRACE_MAX_SAMPLES * sizeof(MotorTraceSample) / 1024.0f);
  }

  cmd_queue_ = xQueueCreate(CMD_QUEUE_LEN, sizeof(ValveCommand));
  if (cmd_queue_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create command queue");
    this->mark_failed();
    return;
  }

  // Load motor config from config store
  if (config_store_) {
    motor_cfg_ = config_store_->get_config().motor;
    sanitize_motor_cfg_();
  }

  if (gpio_backend_enabled_) {
    if (backend_kind_ == MotorBackendKind::REV32_GPIO) {
      rev32_pins_.adc_current = ipropi_pin_;
      rev32_pins_.motor_enable = nsleep_pin_;
      rev32_pins_.latch_state = nfault_pin_;
      rev32_backend_ = new Rev32MotorBackend(rev32_pins_, rev32_tacho_);
      gpio_backend_ = rev32_backend_;
    } else {
      rev31_pins_.adc_current = ipropi_pin_;
      rev31_pins_.motor_enable = nsleep_pin_;
      rev31_pins_.latch_state = nfault_pin_;
      rev31_backend_ = new Rev31MotorBackend(rev31_pins_, bemf_threshold_raw_);
      gpio_backend_ = rev31_backend_;
    }
    if (!gpio_backend_->setup()) {
      ESP_LOGE(TAG, "%s GPIO/ADC backend setup failed; motors remain inhibited",
               gpio_backend_->backend_name());
      this->mark_failed();
      return;
    }

    const bool armed = gpio_backend_->arm_latch();
    any_driver_present_ = true;  // Three populated dual bridges; actuator presence is learned on first move.
    for (uint8_t i = 0; i < NUM_ZONES; ++i) {
      telemetry_[i].present = true;
      telemetry_[i].presence_known = false;
    }
    drivers_enabled_ = armed && auto_start_calibration_;
    auto_start_done_ = !auto_start_calibration_;
    // The motion counter is fed by the backend, not by the DMA ripple task:
    // BEMF coast samples on Rev 3.1, the hardware commutation count on Rev 3.2.
    ripple_enabled_ = true;
    // Rev 3.2 still needs the ADC stream — for the current itself, and for the
    // analog cross-check on the commutation count. Rev 3.1 reads its ADC through
    // the backend's oneshot driver, so it must not open a continuous one.
    if (rev32_backend_ != nullptr)
      start_adc_stream_();
    if (!drivers_enabled_)
      gpio_backend_->coast();
    if (rev32_backend_) {
      ESP_LOGI(TAG,
               "%s backend ready: latch=%s, automatic motion=%s, tacho qualification "
               "%u us min pulse / %" PRIu32 "-%" PRIu32 " us period",
               gpio_backend_->backend_name(), armed ? "armed" : "faulted",
               auto_start_calibration_ ? "enabled" : "disabled pending manual enable",
               rev32_tacho_.min_pulse_us, rev32_tacho_.min_period_us,
               rev32_tacho_.max_period_us);
    } else {
      ESP_LOGI(TAG,
               "%s backend ready: latch=%s, automatic motion=%s, BEMF threshold=%u raw",
               gpio_backend_->backend_name(), armed ? "armed" : "faulted",
               auto_start_calibration_ ? "enabled" : "disabled pending manual enable",
               bemf_threshold_raw_);
    }
  } else {

  // Configure nSLEEP (output, default LOW = sleep)
  gpio_config_t nsleep_cfg = {};
  nsleep_cfg.pin_bit_mask = 1ULL << nsleep_pin_;
  nsleep_cfg.mode = GPIO_MODE_OUTPUT;
  nsleep_cfg.pull_up_en = GPIO_PULLUP_DISABLE;
  nsleep_cfg.pull_down_en = GPIO_PULLDOWN_DISABLE;
  gpio_config(&nsleep_cfg);
  set_nsleep_(false);

  // Configure nFAULT (input, active-low, wired-OR)
  gpio_config_t nfault_cfg = {};
  nfault_cfg.pin_bit_mask = 1ULL << nfault_pin_;
  nfault_cfg.mode = GPIO_MODE_INPUT;
  nfault_cfg.pull_up_en = GPIO_PULLUP_ENABLE;
  nfault_cfg.pull_down_en = GPIO_PULLDOWN_DISABLE;
  gpio_config(&nfault_cfg);

  start_adc_stream_();

  // Wake DRV8215 chips for initial probe/setup only.  Keep the bus asleep
  // after probing if this PCB has no matching drivers; otherwise a pinout or
  // power mismatch can draw current and destabilise WiFi before networking is
  // even started.
  set_nsleep_(true);
  vTaskDelay(pdMS_TO_TICKS(5));

  // Create DRV8215 instances
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    drivers_[i] = new DRV8215(i2c_bus_, motor_addresses_[i], i + 1);
    if (!drivers_[i]->init()) {
      ESP_LOGW(TAG, "Motor %d init failed (addr 0x%02X)", i + 1, motor_addresses_[i]);
      telemetry_[i].present = false;
      telemetry_[i].presence_known = true;
    } else {
      telemetry_[i].present = true;
      telemetry_[i].presence_known = true;
      any_driver_present_ = true;
    }
  }

  log_startup_self_test_();

  // Boot default: only keep the motor bus awake when at least one expected
  // driver answered.  With no ACKs, leave nSLEEP low and permanently skip the
  // automatic calibration pass.  This is both safer for a mismatched PCB and
  // prevents a floating IPROPI input from producing false critical faults.
  if (any_driver_present_) {
    if (!DEVELOPMENT_KEEP_NSLEEP_AWAKE)
      set_nsleep_(true);
    drivers_enabled_ = true;
    ESP_LOGI(TAG, "Motors start enabled; auto-calibration will run in %" PRIu32 "s",
             AUTO_START_DELAY_MS / 1000);
  } else {
    set_nsleep_(false);
    drivers_enabled_ = false;
    auto_start_done_ = true;
    ESP_LOGW(TAG, "No DRV8215 drivers detected; motors remain disabled and auto-calibration is skipped");
  }
  if (DEVELOPMENT_KEEP_NSLEEP_AWAKE)
    ESP_LOGW(TAG, "Development mode: nSLEEP kept HIGH to avoid enable-time reboot");
  }

  // Load persisted calibration data
  if (config_store_) {
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      MotorTelemetry saved;
      if (config_store_->load_motor_telemetry(i, saved)) {
        xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
        telemetry_[i].learned_open_ms = saved.learned_open_ms;
        telemetry_[i].learned_close_ms = saved.learned_close_ms;
        telemetry_[i].deadzone_ms = saved.deadzone_ms;
        telemetry_[i].mean_current_ma = saved.mean_current_ma;
        telemetry_[i].mean_open_current_ma = saved.mean_open_current_ma;
        telemetry_[i].mean_close_current_ma = saved.mean_close_current_ma;
        telemetry_[i].movement_count = saved.movement_count;
        telemetry_[i].movements_since_learn = saved.movements_since_learn;
        telemetry_[i].last_learn_ms = saved.last_learn_ms;
        telemetry_[i].learned_open_ripples = saved.learned_open_ripples;
        telemetry_[i].learned_close_ripples = saved.learned_close_ripples;
        telemetry_[i].pin_engage_close_ripples = saved.pin_engage_close_ripples;
        telemetry_[i].learned_open_current_factor = saved.learned_open_current_factor;
        telemetry_[i].learned_close_current_factor = saved.learned_close_current_factor;
        telemetry_[i].learned_open_confidence = saved.learned_open_confidence;
        telemetry_[i].learned_close_confidence = saved.learned_close_confidence;
        telemetry_[i].last_open_candidate_factor = saved.last_open_candidate_factor;
        telemetry_[i].last_close_candidate_factor = saved.last_close_candidate_factor;
        telemetry_[i].last_open_peak_ma = saved.last_open_peak_ma;
        telemetry_[i].last_close_peak_ma = saved.last_close_peak_ma;
        telemetry_[i].last_learning_sample_valid = saved.last_learning_sample_valid;
        telemetry_[i].last_fault_code = saved.last_fault_code;
        // Seed per-direction means from the durable telemetry. A blob written by
        // a pre-v19 build (size mismatch) won't load at all, so these fields carry
        // their struct defaults; once loaded they hold the learned per-direction means.
        mean_open_currents_[i] = saved.mean_open_current_ma;
        mean_close_currents_[i] = saved.mean_close_current_ma;
        xSemaphoreGive(telemetry_mutex_);
      }
    }
  }

  // Start motor FSM task on Core 1
  BaseType_t ok = xTaskCreatePinnedToCore(
      task_func_, "hv6_valve", STACK_SIZE, this, PRIORITY, &task_handle_, CORE);
  if (ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create valve task");
    this->mark_failed();
    return;
  }

  boot_time_ms_ = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  ESP_LOGI(TAG, "Valve controller initialized (%d motors)", NUM_ZONES);
}

void Lv6ValveController::dump_config() {
  ESP_LOGCONFIG(TAG, "LV6 Valve Controller:");
  ESP_LOGCONFIG(TAG, "  backend: %s",
                gpio_backend_ ? gpio_backend_->backend_name()
                              : (gpio_backend_enabled_ ? "gpio (not built)" : "drv8215_i2c"));
  if (rev32_backend_) {
    ESP_LOGCONFIG(TAG, "  MOTOR_ENABLE GPIO%d, LATCH_STATE GPIO%d (high = faulted or unarmed), LATCH_ARM GPIO%d",
                  nsleep_pin_, nfault_pin_, rev32_pins_.latch_arm);
    ESP_LOGCONFIG(TAG, "  ADDR GPIO%d/%d/%d/%d (4-bit, 12-entry map; no direction bit)",
                  rev32_pins_.address0, rev32_pins_.address1,
                  rev32_pins_.address2, rev32_pins_.address3);
    ESP_LOGCONFIG(TAG, "  ADC_CURRENT GPIO%d @6dB, ADC_TACHO GPIO%d, COMM_TACHO_N GPIO%d, auto-calibration=%s",
                  ipropi_pin_, rev32_pins_.adc_tacho, rev32_pins_.comm_tacho,
                  auto_start_calibration_ ? "yes" : "no");
    return;
  }
  if (gpio_backend_enabled_) {
    ESP_LOGCONFIG(TAG, "  MOTOR_ENABLE GPIO%d, LATCH_STATE GPIO%d, ADC_CURRENT GPIO%d, ADC_BEMF GPIO%d",
                  nsleep_pin_, nfault_pin_, ipropi_pin_, rev31_pins_.adc_bemf);
    ESP_LOGCONFIG(TAG, "  ADDR GPIO%d/%d/%d, DIR GPIO%d, LATCH_ARM GPIO%d, auto-calibration=%s",
                  rev31_pins_.address0, rev31_pins_.address1, rev31_pins_.address2,
                  rev31_pins_.terminal_direction, rev31_pins_.latch_arm,
                  auto_start_calibration_ ? "yes" : "no");
    return;
  }
  ESP_LOGCONFIG(TAG, "  nSLEEP pin: GPIO%d", nsleep_pin_);
  ESP_LOGCONFIG(TAG, "  nFAULT pin: GPIO%d", nfault_pin_);
  ESP_LOGCONFIG(TAG, "  IPROPI pin: GPIO%d  ripple=%s  dma=%s", ipropi_pin_,
                ripple_enabled_ ? "yes" : "no",
                adc_continuous_handle_ ? "yes" : "no");
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ESP_LOGCONFIG(TAG, "  Motor %d: addr=0x%02X present=%s", i + 1,
                  motor_addresses_[i], telemetry_[i].present ? "yes" : "no");
  }
}

void Lv6ValveController::log_startup_self_test_() {
  ESP_LOGI(TAG, "Startup self-test:");

  int nfault_level = gpio_get_level(nfault_pin_);
  ESP_LOGI(TAG, "  nFAULT GPIO%d level=%d (%s)", nfault_pin_, nfault_level,
           nfault_level ? "HIGH" : "LOW (asserted)");

  char discovered[256];
  int off = 0;
  auto append_discovered = [&](const char *fmt, ...) {
    if (off < 0 || off >= static_cast<int>(sizeof(discovered)))
      return;
    va_list args;
    va_start(args, fmt);
    int n = std::vsnprintf(discovered + off, sizeof(discovered) - off, fmt, args);
    va_end(args);
    if (n > 0)
      off += n;
  };
  append_discovered("  I2C ACK addresses:");
  bool found_any = false;

  for (uint8_t addr = 0x03; addr <= 0x77; addr++) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(addr);
    auto err = dev.write(nullptr, 0);
    if (err == esphome::i2c::ERROR_OK) {
      found_any = true;
      append_discovered(" 0x%02X", addr);
      if (off >= static_cast<int>(sizeof(discovered)) - 6)
        break;
    }
  }

  if (!found_any) {
    std::snprintf(discovered, sizeof(discovered), "  I2C ACK addresses: none");
  }
  ESP_LOGI(TAG, "%s", discovered);

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ESP_LOGI(TAG, "  Motor %d addr=0x%02X present=%s", i + 1, motor_addresses_[i],
             telemetry_[i].present ? "yes" : "no");
  }
}

void Lv6ValveController::loop() {
  // Publish latest current to ESPHome sensor only while a motor is running
  if (!motor_turning_ || !current_sensor_)
    return;
  uint32_t now = esphome::millis();
  if (now - last_publish_ms_ >= 500) {
    last_publish_ms_ = now;
    current_sensor_->publish_state(latest_current_ma_);
  }
}

// =============================================================================
// Public API (thread-safe)
// =============================================================================

void Lv6ValveController::set_drivers_enabled(bool enabled) {
  if (enabled && !any_driver_present_) {
    ESP_LOGW(TAG, "Motor enable rejected: no compatible driver backend detected");
    return;
  }

  if (gpio_backend_enabled_) {
    if (!gpio_backend_)
      return;
    if (!enabled) {
      if (motor_turning_)
        stop_motor_(false);
      gpio_backend_->coast();
      drivers_enabled_ = false;
      ESP_LOGI(TAG, "%s motor path DISABLED", gpio_backend_->backend_name());
      return;
    }
    if (gpio_backend_->fault_latched() && !gpio_backend_->arm_latch()) {
      drivers_enabled_ = false;
      ESP_LOGE(TAG, "%s motor enable rejected: hardware fault remains latched",
               gpio_backend_->backend_name());
      return;
    }
    gpio_backend_->coast();
    drivers_enabled_ = true;
    ESP_LOGI(TAG, "%s motor path ENABLED (decoder remains inhibited until a move)",
             gpio_backend_->backend_name());
    return;
  }

  if (enabled == drivers_enabled_)
    return;

  // Ignore disable commands briefly after boot to reduce sensitivity to
  // replayed startup commands. Always allow disable while a motor is turning
  // so STOP actions remain responsive during startup.
  if (!enabled && !motor_turning_ && boot_time_ms_ > 0) {
    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
    if (uptime_ms < 5000) {
      ESP_LOGW(TAG, "Driver disable ignored during startup window (%" PRIu32 "ms)", uptime_ms);
      return;
    }
  }

  if (!enabled && motor_turning_) {
    stop_motor_(false);
    ESP_LOGW(TAG, "Motor stopped due to driver disable");
  }

  if (!DEVELOPMENT_KEEP_NSLEEP_AWAKE)
    set_nsleep_(enabled);
  drivers_enabled_ = enabled;

  if (enabled) {
    // Explicitly coast all drivers to prevent unwanted movement
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (drivers_[i])
        drivers_[i]->coast();
    }
    vTaskDelay(pdMS_TO_TICKS(5));
  } else {
    // Logical disable in development mode: force all drivers to coast.
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (drivers_[i])
        drivers_[i]->coast();
    }
  }

  ESP_LOGI(TAG, "Motor drivers %s", enabled ? "ENABLED" : "DISABLED");
}

void Lv6ValveController::reload_motor_config() {
  if (config_store_) {
    motor_cfg_ = config_store_->get_motor_config();
    sanitize_motor_cfg_();
  }
  ESP_LOGI(TAG, "Motor config: profile=%s runtime(user=%" PRIu32 "s generic=%" PRIu32 "s hmip=%" PRIu32 "s) close(%.2fx, slope %.2f mA/s, floor %.2fx) "
           "open(%.2fx, slope %.2f mA/s, floor %.2fx, ripple_lim %.2f) "
           "pin(step %.1f mA, margin %" PRIu16 ") learning(samples=%u, dev=%.0f%%, auto=%s)",
           motor_profile_to_string(motor_cfg_.default_profile),
           motor_cfg_.max_runtime_s, motor_cfg_.generic_profile_runtime_limit_s,
           motor_cfg_.hmip_vdmot_runtime_limit_s,
           motor_cfg_.close_current_factor, motor_cfg_.close_slope_threshold_ma_per_s,
           motor_cfg_.close_slope_current_factor,
           motor_cfg_.open_current_factor, motor_cfg_.open_slope_threshold_ma_per_s,
           motor_cfg_.open_slope_current_factor, motor_cfg_.open_ripple_limit_factor,
           motor_cfg_.pin_engage_step_ma, motor_cfg_.pin_engage_margin_ripples,
           motor_cfg_.learned_factor_min_samples,
           motor_cfg_.learned_factor_max_deviation_pct * 100.0f,
           motor_cfg_.auto_apply_learned_factors ? "yes" : "no");
}

MotorProfile Lv6ValveController::effective_motor_profile_(uint8_t zone) const {
  if (!config_store_ || zone >= NUM_ZONES)
    return motor_cfg_.default_profile;
  const auto cfg = config_store_->get_config();
  MotorProfile profile = cfg.zones[zone].motor_profile_override;
  if (profile == MotorProfile::INHERIT)
    profile = cfg.motor.default_profile;
  if (profile == MotorProfile::INHERIT)
    profile = MotorProfile::HMIP_VDMOT;
  return profile;
}

uint32_t Lv6ValveController::effective_runtime_limit_s_(uint8_t zone) const {
  uint32_t profile_limit = motor_cfg_.generic_profile_runtime_limit_s;
  switch (effective_motor_profile_(zone)) {
    case MotorProfile::HMIP_VDMOT:
      profile_limit = motor_cfg_.hmip_vdmot_runtime_limit_s;
      break;
    case MotorProfile::GENERIC:
    case MotorProfile::INHERIT:
    default:
      profile_limit = motor_cfg_.generic_profile_runtime_limit_s;
      break;
  }
  profile_limit = std::max<uint32_t>(1, profile_limit);
  return std::min(std::max<uint32_t>(1, motor_cfg_.max_runtime_s), profile_limit);
}

float Lv6ValveController::effective_current_factor_(uint8_t zone, MotorDirection dir) const {
  bool is_opening = (dir == MotorDirection::OPEN);
  float factor = is_opening ? motor_cfg_.open_current_factor : motor_cfg_.close_current_factor;

  if (config_store_ && zone < NUM_ZONES) {
    const auto cfg = config_store_->get_config();
    const auto &zone_cfg = cfg.zones[zone];
    float manual_override = is_opening ? zone_cfg.motor_open_current_factor_override
                                       : zone_cfg.motor_close_current_factor_override;
    if (manual_override > 0.0f)
      return manual_override;
  }

  if (!motor_cfg_.auto_apply_learned_factors || zone >= NUM_ZONES)
    return factor;

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  const auto &t = telemetry_[zone];
  float learned_factor = is_opening ? t.learned_open_current_factor : t.learned_close_current_factor;
  uint8_t confidence = is_opening ? t.learned_open_confidence : t.learned_close_confidence;
  xSemaphoreGive(telemetry_mutex_);

  if (learned_factor > 0.0f && confidence >= motor_cfg_.learned_factor_min_samples)
    factor = learned_factor;
  return factor;
}

void Lv6ValveController::update_learned_factor_(uint8_t zone, MotorDirection dir, float average_ma,
                                                float peak_ma, bool sample_valid) {
  if (zone >= NUM_ZONES)
    return;

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  auto &t = telemetry_[zone];
  t.last_learning_sample_valid = sample_valid;

  if (!sample_valid || average_ma <= 0.5f || peak_ma <= average_ma) {
    xSemaphoreGive(telemetry_mutex_);
    return;
  }

  float candidate = std::clamp(peak_ma / average_ma, 1.0f, 3.0f);
  float &learned_factor = (dir == MotorDirection::OPEN) ? t.learned_open_current_factor : t.learned_close_current_factor;
  uint8_t &confidence = (dir == MotorDirection::OPEN) ? t.learned_open_confidence : t.learned_close_confidence;
  float &last_candidate = (dir == MotorDirection::OPEN) ? t.last_open_candidate_factor : t.last_close_candidate_factor;
  float &last_peak = (dir == MotorDirection::OPEN) ? t.last_open_peak_ma : t.last_close_peak_ma;

  last_candidate = candidate;
  last_peak = peak_ma;

  if (candidate < 1.05f || candidate > 2.8f) {
    xSemaphoreGive(telemetry_mutex_);
    return;
  }

  if (learned_factor <= 0.0f) {
    learned_factor = candidate;
    confidence = 1;
  } else {
    float deviation = std::fabs(candidate - learned_factor) / learned_factor;
    if (deviation <= motor_cfg_.learned_factor_max_deviation_pct) {
      learned_factor = learned_factor * 0.7f + candidate * 0.3f;
      if (confidence < 255)
        confidence++;
    } else {
      learned_factor = candidate;
      confidence = 1;
    }
  }

  xSemaphoreGive(telemetry_mutex_);
}

bool Lv6ValveController::request_position(uint8_t zone, float target_pct) {
  if (zone >= NUM_ZONES)
    return false;
  if (!drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting position request");
    return false;
  }
  if (calibrating_ || calibration_request_ >= 0) {
    ESP_LOGW(TAG, "Calibration active/pending, rejecting position request for zone %d", zone + 1);
    return false;
  }
  ValveCommand cmd = {zone, logical_to_actuator_pct_(target_pct)};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

bool Lv6ValveController::request_timed_open(uint8_t zone, uint16_t duration_ms, bool override_drivers) {
  if (zone >= NUM_ZONES)
    return false;
  if (!override_drivers && !drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting timed open for zone %d", zone + 1);
    return false;
  }
  if (calibrating_ || calibration_request_ >= 0 || calibration_pending_mask_ != 0) {
    ESP_LOGW(TAG, "Calibration active/pending, rejecting timed open for zone %d", zone + 1);
    return false;
  }
  ValveCommand cmd = {zone, 0.0f, duration_ms, override_drivers, MotorDirection::OPEN};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

bool Lv6ValveController::request_timed_close(uint8_t zone, uint16_t duration_ms, bool override_drivers) {
  if (zone >= NUM_ZONES)
    return false;
  if (!override_drivers && !drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting timed close for zone %d", zone + 1);
    return false;
  }
  if (calibrating_ || calibration_request_ >= 0 || calibration_pending_mask_ != 0) {
    ESP_LOGW(TAG, "Calibration active/pending, rejecting timed close for zone %d", zone + 1);
    return false;
  }
  ValveCommand cmd = {zone, 0.0f, duration_ms, override_drivers, MotorDirection::CLOSE};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

bool Lv6ValveController::request_stop(uint8_t zone) {
  if (zone >= NUM_ZONES)
    return false;
  if (motor_turning_ && current_zone_ == zone)
    stop_motor_(true);
  return true;
}

void Lv6ValveController::log_i2c_scan() {
  if (!i2c_bus_) {
    ESP_LOGW(TAG, "I2C_SCAN: i2c_bus not configured");
    return;
  }

  char discovered[256];
  int off = 0;
  auto append_discovered = [&](const char *fmt, ...) {
    if (off < 0 || off >= static_cast<int>(sizeof(discovered)))
      return;
    va_list args;
    va_start(args, fmt);
    int n = std::vsnprintf(discovered + off, sizeof(discovered) - off, fmt, args);
    va_end(args);
    if (n > 0)
      off += n;
  };
  append_discovered("I2C_SCAN: ACK");
  bool found_any = false;

  for (uint8_t addr = 0x03; addr <= 0x77; addr++) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(addr);
    auto err = dev.write(nullptr, 0);
    if (err == esphome::i2c::ERROR_OK) {
      found_any = true;
      append_discovered(" 0x%02X", addr);
      if (off >= static_cast<int>(sizeof(discovered)) - 6)
        break;
    }
  }

  if (!found_any)
    std::snprintf(discovered, sizeof(discovered), "I2C_SCAN: ACK none");

  ESP_LOGW(TAG, "I2C_SCAN: ----- begin -----");
  ESP_LOGW(TAG, "%s", discovered);

  char motor_line[256];
  off = 0;
  auto append_motor_line = [&](const char *fmt, ...) {
    if (off < 0 || off >= static_cast<int>(sizeof(motor_line)))
      return;
    va_list args;
    va_start(args, fmt);
    int n = std::vsnprintf(motor_line + off, sizeof(motor_line) - off, fmt, args);
    va_end(args);
    if (n > 0)
      off += n;
  };
  append_motor_line("I2C_SCAN: Motors");
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(motor_addresses_[i]);
    bool ack = (dev.write(nullptr, 0) == esphome::i2c::ERROR_OK);
    append_motor_line(" M%d:0x%02X=%s", i + 1, motor_addresses_[i], ack ? "OK" : "MISS");
    if (off >= static_cast<int>(sizeof(motor_line)) - 16)
      break;
  }
  ESP_LOGW(TAG, "%s", motor_line);
  ESP_LOGW(TAG, "I2C_SCAN: nFAULT GPIO%d=%d", nfault_pin_, gpio_get_level(nfault_pin_));
  ESP_LOGW(TAG, "I2C_SCAN: ----- end -----");
}

float Lv6ValveController::get_position(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  if (telemetry_mutex_ == nullptr)
    return 0.0f;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  float pos = telemetry_[zone].current_position_pct;
  xSemaphoreGive(telemetry_mutex_);
  return actuator_to_logical_pct_(pos);
}

void Lv6ValveController::set_manifold_type(ManifoldType type) {
  if (!config_store_)
    return;
  if (motor_turning_) {
    ESP_LOGW(TAG, "Ignoring manifold type change while motor is running");
    return;
  }

  auto cfg = config_store_->get_config();
  if (cfg.manifold_type == type)
    return;

  cfg.manifold_type = type;
  config_store_->set_config(cfg);
  ESP_LOGI(TAG, "Manifold type set to %s", type == ManifoldType::NC ? "NC" : "NO");
}

ManifoldType Lv6ValveController::get_manifold_type() const {
  if (!config_store_)
    return ManifoldType::NC;
  return config_store_->get_config().manifold_type;
}

MotorTelemetry Lv6ValveController::get_telemetry(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return {};
  if (telemetry_mutex_ == nullptr)
    return {};
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  MotorTelemetry copy = telemetry_[zone];
  xSemaphoreGive(telemetry_mutex_);
  return copy;
}

void Lv6ValveController::request_calibration(uint8_t zone) {
  if (zone >= NUM_ZONES || !drivers_enabled_)
    return;

  // Guard against retained/replayed commands immediately after reboot.
  if (boot_time_ms_ > 0) {
    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
    if (uptime_ms < CALIBRATION_REQUEST_GUARD_MS) {
      ESP_LOGW(TAG, "Calibration request ignored during startup guard (%" PRIu32 "ms)", uptime_ms);
      return;
    }
  }

  calibration_request_ = static_cast<int8_t>(zone);
}

void Lv6ValveController::request_calibration_all() {
  if (!drivers_enabled_)
    return;

  // Guard against startup replay
  if (boot_time_ms_ > 0) {
    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
    if (uptime_ms < CALIBRATION_REQUEST_GUARD_MS) {
      ESP_LOGW(TAG, "Calibration all request ignored during startup guard (%" PRIu32 "ms)", uptime_ms);
      return;
    }
  }

  uint8_t mask = 0;
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    bool enabled = true;
    if (config_store_) {
      const auto &cfg = config_store_->get_config();
      enabled = cfg.zones[z].enabled;
    }
    if (enabled)
      mask |= (1u << z);
  }
  if (mask == 0) {
    ESP_LOGW(TAG, "request_calibration_all: no enabled zones");
    return;
  }
  calibration_pending_mask_ = mask;
  // Prime calibration_request_ with the first pending zone
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (calibration_pending_mask_ & (1u << z)) {
      calibration_pending_mask_ &= ~(1u << z);
      calibration_request_ = static_cast<int8_t>(z);
      break;
    }
  }
  ESP_LOGI(TAG, "request_calibration_all: queued zones mask=0x%02X", mask);
}

bool Lv6ValveController::reset_fault(uint8_t zone) {
  if (zone >= NUM_ZONES)
    return false;
  if (motor_turning_ || calibrating_) {
    ESP_LOGW(TAG, "Reset fault denied for zone %d: controller busy", zone + 1);
    return false;
  }

  if (gpio_backend_enabled_) {
    if (!gpio_backend_ || !gpio_backend_->arm_latch()) {
      ESP_LOGE(TAG, "Zone %d fault reset rejected: hardware fault remains active",
               zone + 1);
      return false;
    }
  } else if (drivers_[zone] != nullptr) {
    drivers_[zone]->clear_fault();
  }

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  auto &t = telemetry_[zone];
  t.blocked = false;
  t.calibration_retries = 0;
  t.last_fault_code = FaultCode::NONE;
  t.last_learning_sample_valid = false;
  xSemaphoreGive(telemetry_mutex_);

  current_fault_code_ = FaultCode::NONE;
  save_telemetry_(zone);
  ESP_LOGI(TAG, "Zone %d fault state reset", zone + 1);
  return true;
}

bool Lv6ValveController::reset_and_relearn(uint8_t zone) {
  if (!drivers_enabled_) {
    ESP_LOGW(TAG, "Reset+relearn denied for zone %d: drivers disabled", zone + 1);
    return false;
  }
  if (!reset_fault(zone))
    return false;
  request_calibration(zone);
  ESP_LOGI(TAG, "Zone %d reset and relearn requested", zone + 1);
  return true;
}

bool Lv6ValveController::reset_learned_factors(uint8_t zone) {
  if (zone >= NUM_ZONES)
    return false;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  auto &t = telemetry_[zone];
  t.learned_open_current_factor = 0.0f;
  t.learned_close_current_factor = 0.0f;
  t.learned_open_confidence = 0;
  t.learned_close_confidence = 0;
  t.last_open_candidate_factor = 0.0f;
  t.last_close_candidate_factor = 0.0f;
  t.last_open_peak_ma = 0.0f;
  t.last_close_peak_ma = 0.0f;
  t.last_learning_sample_valid = false;
  xSemaphoreGive(telemetry_mutex_);
  save_telemetry_(zone);
  ESP_LOGI(TAG, "Zone %d learned factors reset", zone + 1);
  return true;
}

bool Lv6ValveController::manifold_is_nc_() const {
  return get_manifold_type() == ManifoldType::NC;
}

float Lv6ValveController::logical_to_actuator_pct_(float logical_pct) const {
  logical_pct = std::clamp(logical_pct, 0.0f, 100.0f);
  return manifold_is_nc_() ? 100.0f - logical_pct : logical_pct;
}

float Lv6ValveController::actuator_to_logical_pct_(float actuator_pct) const {
  actuator_pct = std::clamp(actuator_pct, 0.0f, 100.0f);
  return manifold_is_nc_() ? 100.0f - actuator_pct : actuator_pct;
}

float Lv6ValveController::flow_to_physical_pct_(uint8_t zone, float flow_pct) {
  flow_pct = std::clamp(flow_pct, 0.0f, 100.0f);

  // 0% flow always maps to 0% physical (closed endstop)
  if (flow_pct <= 0.01f)
    return 0.0f;

  // Need pin engagement data from calibration
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t pin_ripples = telemetry_[zone].pin_engage_close_ripples;
  uint32_t close_ripples = telemetry_[zone].learned_close_ripples;
  xSemaphoreGive(telemetry_mutex_);

  if (pin_ripples == 0 || close_ripples == 0)
    return flow_pct;

  // Effective engagement point with margin offset toward open.
  // Subtracting margin means 100% flow maps to a position where the pin is
  // fully disengaged from the valve body, ensuring unobstructed flow.
  uint32_t margin = motor_cfg_.pin_engage_margin_ripples;
  uint32_t effective = (pin_ripples > margin) ? (pin_ripples - margin) : 0;

  // Max flow position in physical %.
  // pin_engage is 'effective' ripples from the open end during closing.
  // The physical position beyond this point is dead zone (no flow change).
  float max_flow_pct = (1.0f - static_cast<float>(effective) /
                        static_cast<float>(close_ripples)) * 100.0f;
  max_flow_pct = std::clamp(max_flow_pct, 10.0f, 100.0f);

  // Remap: flow 0–100% → physical 0% to max_flow_pct
  return std::clamp(flow_pct * max_flow_pct / 100.0f, 0.0f, 100.0f);
}

// =============================================================================
// FreeRTOS Task (10ms tick, Core 1)
// =============================================================================

void Lv6ValveController::task_func_(void *arg) {
  static_cast<Lv6ValveController *>(arg)->run_();
}

void Lv6ValveController::run_() {
  TickType_t last_wake = xTaskGetTickCount();

  while (true) {
    // Auto-start: enable drivers and calibrate all detected zones once after boot delay
    if (!auto_start_done_ && boot_time_ms_ > 0) {
      uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
      if (uptime_ms >= AUTO_START_DELAY_MS) {
        auto_start_done_ = true;
        ESP_LOGI(TAG, "Auto-start: enabling motor drivers and calibrating enabled zones");
        set_drivers_enabled(true);
        for (uint8_t z = 0; z < NUM_ZONES; z++) {
          if (!telemetry_[z].present) {
            ESP_LOGW(TAG, "Auto-start: zone %d has no detected driver, skipping calibration", z + 1);
            continue;
          }
          bool enabled = true;
          if (config_store_) {
            const auto &cfg = config_store_->get_config();
            enabled = cfg.zones[z].enabled;
          }
          if (enabled)
          run_calibration_(z);
          else
            ESP_LOGI(TAG, "Auto-start: zone %d disabled, skipping calibration", z + 1);
        }
        last_wake = xTaskGetTickCount();  // Resync tick after long calibration run
      }
    }

    if (!drivers_enabled_) {
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(TICK_MS));
      continue;
    }

    if (motor_turning_) {
      // Fast 1ms loop: ADC + ripple each tick, FSM every 10th tick
      motor_loop_();
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(FAST_TICK_MS));
    } else {
      fsm_tick_count_ = 0;

      if (calibration_request_ >= 0) {
        uint8_t zone = static_cast<uint8_t>(calibration_request_);
        calibration_request_ = -1;
        run_calibration_(zone);
        // Advance to next pending zone in the queue
        if (calibration_pending_mask_ != 0) {
          for (uint8_t z = 0; z < NUM_ZONES; z++) {
            if (calibration_pending_mask_ & (1u << z)) {
              calibration_pending_mask_ &= ~(1u << z);
              calibration_request_ = static_cast<int8_t>(z);
              break;
            }
          }
        }
      }

      process_command_queue_();
      check_relearn_triggers_();
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(TICK_MS));
    }
  }
}

void Lv6ValveController::process_command_queue_() {
  ValveCommand cmd;
  if (xQueueReceive(cmd_queue_, &cmd, 0) == pdTRUE) {
    if (cmd.timed_duration_ms > 0) {
      execute_timed_move_(cmd.zone, cmd.timed_duration_ms, cmd.timed_direction, cmd.override_drivers);
          } else {
      execute_move_(cmd.zone, cmd.target_pct);
    }
  }
}

void Lv6ValveController::execute_timed_move_(uint8_t zone, uint16_t duration_ms, MotorDirection dir, bool override_drivers) {
  if (zone >= NUM_ZONES)
    return;
  if (!override_drivers) {
    if (!telemetry_[zone].present || !drivers_enabled_)
      return;
  }
  if (!start_motor_(zone, dir, override_drivers))
    return;

  ESP_LOGI(TAG, "Motor %d timed %s %" PRIu16 "ms (override=%d)",
           zone + 1, dir == MotorDirection::OPEN ? "OPEN" : "CLOSE",
           duration_ms, override_drivers);

  uint32_t elapsed = 0;
  while (motor_turning_ && elapsed < static_cast<uint32_t>(duration_ms)) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));
    elapsed += FAST_TICK_MS;
  }

  if (motor_turning_)
    stop_motor_(true);
}

void Lv6ValveController::execute_move_(uint8_t zone, float target_pct) {
  if (zone >= NUM_ZONES || !telemetry_[zone].present || !drivers_enabled_)
    return;
  if (telemetry_[zone].blocked) {
    ESP_LOGW(TAG, "Zone %d blocked, skipping move", zone + 1);
    return;
  }

  float current_pct = telemetry_[zone].current_position_pct;

  // Remap flow % → physical % based on pin engagement data
  float physical_target = flow_to_physical_pct_(zone, target_pct);
  if (std::fabs(physical_target - target_pct) > 0.1f) {
    ESP_LOGD(TAG, "Motor %d flow %.1f%% → physical %.1f%%",
             zone + 1, target_pct, physical_target);
  }
  target_pct = physical_target;

  float diff = target_pct - current_pct;
  float min_move = 5.0f;
  if (config_store_)
    min_move = config_store_->get_config().control.min_movement_pct;

  if (std::fabs(diff) < min_move)
    return;

  MotorDirection dir = (diff > 0) ? MotorDirection::OPEN : MotorDirection::CLOSE;
  float diff_pct = std::fabs(diff);

  // Drive-to-endstop mode: for full open (100%) or full close (0%) targets,
  // run the motor until endstop detection fires instead of using time/ripple
  // estimates. This guarantees the valve is physically at the mechanical limit.
  bool drive_to_endstop = (target_pct <= 0.01f || target_pct >= 99.99f);

  // Compute ripple target (if calibrated and not driving to endstop)
  uint32_t target_ripples = 0;
  uint32_t learned_ripples = 0;
  if (!drive_to_endstop) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    learned_ripples = (dir == MotorDirection::OPEN)
        ? telemetry_[zone].learned_open_ripples
        : telemetry_[zone].learned_close_ripples;
    xSemaphoreGive(telemetry_mutex_);

    if (ripple_enabled_ && learned_ripples > 0)
      target_ripples = static_cast<uint32_t>((diff_pct / 100.0f) * learned_ripples);
  }

  // Time estimate (always computed — used as primary, timeout, or safety cap for endstop mode)
  float travel_time_ms = estimate_travel_time_ms_(zone, current_pct, target_pct);
  if (travel_time_ms < 100.0f && !drive_to_endstop)
    return;

  uint32_t timeout_ms;
  if (drive_to_endstop) {
    // Drive-to-endstop always uses the full per-profile runtime limit as the
    // safety timeout. The motor could be anywhere (position tracking may have
    // drifted, or the valve was manually moved) so we must allow a full stroke.
    // Endstop detection will fire well before this in the normal case.
    // Uses effective_runtime_limit_s_() (per-profile: 40s HmIP, 45s Generic)
    // rather than the legacy max_runtime_s which does not respect the profile.
    timeout_ms = effective_runtime_limit_s_(zone) * 1000;
  } else if (target_ripples > 0) {
    timeout_ms = static_cast<uint32_t>(travel_time_ms * 1.5f);
  } else {
    timeout_ms = static_cast<uint32_t>(travel_time_ms);
  }

  if (!start_motor_(zone, dir))
    return;

  // --- Soft-approach + adaptive endstop guard context for this move ---
  // approach_stroke_* are the estimated travel for THIS move (remaining distance
  // to the target), so soft-approach engages in the final stretch regardless of
  // where the move started.
  drive_to_endstop_active_ = drive_to_endstop;
  approach_stroke_ms_ = (travel_time_ms > 0.0f) ? static_cast<uint32_t>(travel_time_ms) : 0;
  approach_stroke_ripples_ = 0;
  if (ripple_enabled_) {
    if (!drive_to_endstop) {
      approach_stroke_ripples_ = target_ripples;
    } else {
      float remaining = (dir == MotorDirection::OPEN) ? (100.0f - current_pct) : current_pct;
      remaining = std::clamp(remaining, 0.0f, 100.0f) / 100.0f;
      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      uint32_t full = (dir == MotorDirection::OPEN)
          ? telemetry_[zone].learned_open_ripples
          : telemetry_[zone].learned_close_ripples;
      xSemaphoreGive(telemetry_mutex_);
      if (full > 0)
        approach_stroke_ripples_ = static_cast<uint32_t>(remaining * static_cast<float>(full));
    }
  }

  // Adaptive inrush blind window: base = boost + settle; shrink toward a floor
  // just past boost when little travel remains (valve already near the stop) so a
  // near-endstop move is not blind. The fast raw hard-cap (gated only on the boost
  // phase) still protects the boost→guard region.
  if (!calibrating_) {
    uint32_t base_guard = motor_cfg_.pwm_boost_ms + ENDSTOP_SETTLE_MS;
    uint32_t guard = base_guard;
    if (drive_to_endstop && approach_stroke_ms_ > 0 && approach_stroke_ms_ < base_guard) {
      uint32_t floor_guard = motor_cfg_.pwm_boost_ms + 100;
      guard = std::max(floor_guard, approach_stroke_ms_ / 2);
    }
    endstop_guard_ms_ = guard;
  }

  // Ripple safety limit for opening: stop if we exceed learned open stroke × factor
  uint32_t open_ripple_limit = 0;
  if (drive_to_endstop && dir == MotorDirection::OPEN
      && motor_cfg_.open_ripple_limit_factor > 0.0f) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    uint32_t open_ripples = telemetry_[zone].learned_open_ripples;
    xSemaphoreGive(telemetry_mutex_);
    if (ripple_enabled_ && open_ripples > 0) {
      open_ripple_limit = static_cast<uint32_t>(
          open_ripples * motor_cfg_.open_ripple_limit_factor);
    }
  }

  if (drive_to_endstop) {
    ESP_LOGI(TAG, "Motor %d drive-to-endstop %s (travel_est=%.0fms safety timeout %" PRIu32 "ms, ripple_lim=%" PRIu32 ")",
             zone + 1, dir == MotorDirection::OPEN ? "OPEN" : "CLOSE",
             travel_time_ms, timeout_ms, open_ripple_limit);
  }

  while (motor_turning_) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));

    if (drive_to_endstop) {
      // In drive-to-endstop mode, the motor runs until endstop detection
      // in process_tick_() calls stop_motor_(), or safety timeout fires.
      if (motor_run_time_ms_ >= timeout_ms)
        break;
      // Ripple safety: stop if we've exceeded the learned stroke length × factor
      uint32_t cur_rip = live_ripple_count_.load(std::memory_order_relaxed);
      if (open_ripple_limit > 0 && cur_rip >= open_ripple_limit) {
        ESP_LOGI(TAG, "Motor %d open ripple limit (%" PRIu32 "/%" PRIu32 ")",
                 zone + 1, cur_rip, open_ripple_limit);
        break;
      }
    } else {
      // Ripple-based stop (precise)
      if (target_ripples > 0 &&
          live_ripple_count_.load(std::memory_order_relaxed) >= target_ripples)
        break;
      // Time-based stop (fallback when no ripple data)
      if (target_ripples == 0 && motor_run_time_ms_ >= timeout_ms)
        break;
      // Safety timeout (always)
      if (target_ripples > 0 && motor_run_time_ms_ >= timeout_ms)
        break;
    }
  }

  if (motor_turning_) {
    if (drive_to_endstop && !endpoint_confirmed_)
      trigger_fault_(FaultCode::MECHANICAL_OVERRUN,
                     "drive-to-endstop window expired without qualified endpoint");
    else
      stop_motor_(true);
  }

  // Update position
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  if (current_fault_code_ == FaultCode::NONE) {
    if (drive_to_endstop) {
      if (endpoint_confirmed_) {
        // Endstop reached — position is definitively at the limit.
        telemetry_[zone].current_position_pct = target_pct;
      }
      // Otherwise retain the previous position: a timeout or unclassified
      // stop must never be promoted to a confirmed mechanical limit.
    } else if (target_ripples > 0 && learned_ripples > 0 &&
               get_motion_count_() > 0) {
      // Precise position from actual ripple count (safe: DMA stopped in stop_motor_)
      float actual_pct = (static_cast<float>(get_motion_count_()) /
                          static_cast<float>(learned_ripples)) * 100.0f;
      float new_pos = (dir == MotorDirection::OPEN)
          ? current_pct + actual_pct
          : current_pct - actual_pct;
      telemetry_[zone].current_position_pct = std::clamp(new_pos, 0.0f, 100.0f);
    } else {
      telemetry_[zone].current_position_pct = target_pct;
    }
  }
  xSemaphoreGive(telemetry_mutex_);
}

float Lv6ValveController::estimate_travel_time_ms_(uint8_t zone, float from_pct, float to_pct) {
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t learned_open = telemetry_[zone].learned_open_ms;
  uint32_t learned_close = telemetry_[zone].learned_close_ms;
  xSemaphoreGive(telemetry_mutex_);

  float diff_pct = std::fabs(to_pct - from_pct);

  if (to_pct > from_pct && learned_open > 0) {
    return (diff_pct / 100.0f) * static_cast<float>(learned_open);
  } else if (to_pct < from_pct && learned_close > 0) {
    return (diff_pct / 100.0f) * static_cast<float>(learned_close);
  }
  return (diff_pct / 100.0f) * 60000.0f;
}

// =============================================================================
// Motor Control
// =============================================================================

bool Lv6ValveController::start_motor_(uint8_t zone, MotorDirection dir, bool override_drivers) {
  if (zone >= NUM_ZONES || motor_turning_ || (!drivers_enabled_ && !override_drivers))
    return false;

  DRV8215 *driver = nullptr;
  if (!gpio_backend_enabled_) {
    driver = drivers_[zone];
    if (!driver)
      return false;
  } else if (!gpio_backend_) {
    return false;
  }

  // If drivers are physically asleep and we're overriding, temporarily wake nSLEEP
  nsleep_overridden_ = false;
  if (!gpio_backend_enabled_ && override_drivers && !drivers_enabled_ && !DEVELOPMENT_KEEP_NSLEEP_AWAKE) {
    set_nsleep_(true);
    vTaskDelay(pdMS_TO_TICKS(5));  // DRV8215 wakeup time
    nsleep_overridden_ = true;
  }

  if (driver)
    driver->clear_fault();

  current_zone_ = zone;
  current_dir_ = dir;
  motor_run_time_ms_ = 0;
  drive_phase_elapsed_ms_ = 0;
  drive_output_enabled_ = false;
  current_filtered_ma_ = 0.0f;
  current_raw_ma_ = 0.0f;
  current_peak_ma_ = 0.0f;
  current_sum_ = 0.0f;
  current_count_ = 0;
  debounce_count_ = 0;
  endstop_high_count_ = 0;
  hard_cap_high_count_ = 0;
  open_fast_cap_armed_ = false;
  open_fast_cap_count_ = 0;
  low_current_count_ = 0;
  oc_last_ripple_count_ = 0;
  stall_last_ripple_count_ = 0;
  stall_last_advance_ms_ = 0;
  stall_initialized_ = false;
  cal_baseline_ma_ = 0.0f;
  cal_baseline_set_ = false;
  // Conservative defaults — execute_move_() overrides these for normal moves.
  // Calibration passes call start_motor_() directly and keep this blind window:
  // just past boost + settle (not the old ~1.2 s) so the high-current close endstop
  // is detected quickly even when the valve starts already closed (pop-off safety).
  drive_to_endstop_active_ = false;
  endpoint_confirmed_ = false;
  soft_approach_active_ = false;
  endstop_guard_ms_ = motor_cfg_.pwm_boost_ms + ENDSTOP_SETTLE_MS;
  approach_stroke_ripples_ = 0;
  approach_stroke_ms_ = 0;
  slope_prev_current_ma_ = 0.0f;
  slope_tick_count_ = 0;
  current_slope_ma_per_s_ = 0.0f;
  slope_initialized_ = false;
  slope_endstop_windows_ = 0;
  pin_detect_baseline_set_ = false;
  pin_detected_ = false;
  pin_detected_ripples_ = 0;
  pin_detect_sustained_ = 0;
  current_fault_code_ = FaultCode::NONE;
  fsm_state_ = MotorFsmState::BOOST;
  motor_turning_ = true;

  // Reset ripple counter and start ADC DMA
  ripple_counter_.reset();
  live_ripple_count_ = 0;
  dma_debounce_remaining_ = dma_debounce_samples_;
  ripple_drive_was_on_ = false;
  hard_cap_tripped_.store(false, std::memory_order_relaxed);
  if (tacho_adc_counter_ != nullptr) {
    tacho_adc_counter_->reset();
    tacho_adc_count_ = 0;
    tacho_adc_raw_ = 0xFFFF;
  }
  // The stroke phase model restarts with the move: which direction it is, and
  // therefore whether a pin-contact phase is expected at all, changes with it.
  stroke_.reset(dir == MotorDirection::OPEN);
  fsm_tick_count_ = 0;
  trace_reset_();
  last_bemf_sample_ms_ = 0;
  rev31_invalid_bemf_samples_ = 0;
  rev31_diag_raw_a_ = 0;
  rev31_diag_raw_b_ = 0;
  rev31_diag_differential_ = 0;
  rev31_diag_separation_us_ = 0;
  rev31_diag_sample_valid_ = 0;
  rev31_diag_sample_moving_ = 0;
  rev31_diag_invalid_samples_ = 0;
  motor_diag_evidence_count_ = 0;
  motor_diag_sample_sequence_ = 0;
  motor_diag_runtime_ms_ = 0;
  motor_diag_current_ma_x10_ = 0;
  if (gpio_backend_)
    gpio_backend_->reset_motion();

  if (ripple_enabled_ && adc_continuous_handle_)
    adc_continuous_start(static_cast<adc_continuous_handle_t>(adc_continuous_handle_));

  if (gpio_backend_enabled_) {
    // Rev 3.2 arms the fault latch per move.  Nothing re-disarms it on its own
    // since ECO rev3.2-C removed the 74HC4060, so the arm is both the drive
    // precondition and the only test firmware has for a raw fault - FAULT_N_RAW
    // reaches TP3 only.  Rev 3.1 keeps arming at boot and on enable.
    const bool reverse = dir == MotorDirection::OPEN;
    if ((rev32_backend_ && !rev32_backend_->arm_latch()) ||
        !gpio_backend_->select_zone(zone, reverse) || !gpio_backend_->drive()) {
      motor_turning_ = false;
      fsm_state_ = MotorFsmState::IDLE;
      drive_output_enabled_ = false;
      ESP_LOGE(TAG, "Motor %d start rejected by the %s safety backend", zone + 1,
                gpio_backend_->backend_name());
      return false;
    }
  } else if (dir == MotorDirection::OPEN) {
    driver->reverse();
  } else {
    driver->forward();
  }
  drive_output_enabled_ = true;

  ESP_LOGI(TAG, "Motor %d started %s", zone + 1,
           dir == MotorDirection::OPEN ? "OPEN" : "CLOSE");
  return true;
}

void Lv6ValveController::stop_motor_(bool record_event) {
  if (!motor_turning_)
    return;

  DRV8215 *driver = drivers_[current_zone_];
  if (gpio_backend_enabled_ && gpio_backend_)
    gpio_backend_->coast();
  else if (driver)
    driver->coast();
  drive_output_enabled_ = false;

  // Stop DMA and allow the ripple processor task to drain any pending frames
  // before the motor task reads the final ripple count.
  if (ripple_enabled_ && adc_continuous_handle_) {
    adc_continuous_stop(static_cast<adc_continuous_handle_t>(adc_continuous_handle_));
    vTaskDelay(pdMS_TO_TICKS(25));  // ~2 frame periods; ripple task drains here
  }

  if (record_event) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    auto &t = telemetry_[current_zone_];
    t.movement_count++;
    t.movements_since_learn++;
    if (current_dir_ == MotorDirection::OPEN)
      t.open_count++;
    else
      t.close_count++;

    if (current_count_ > 0) {
      float avg = current_sum_ / static_cast<float>(current_count_);
      float &m = mean_current_(current_zone_, current_dir_);
      m = m * 0.9f + avg * 0.1f;
      if (current_dir_ == MotorDirection::OPEN)
        t.mean_open_current_ma = m;
      else
        t.mean_close_current_ma = m;
      t.mean_current_ma = m;  // legacy mirror (most recent move, either direction)
    }
    xSemaphoreGive(telemetry_mutex_);

    if (telemetry_[current_zone_].movement_count % 50 == 0)
      save_telemetry_(current_zone_);
  }

  motor_turning_ = false;
  fsm_state_ = MotorFsmState::IDLE;
  timed_mode_active_ = false;
  timed_move_duration_ms_ = 0;
  // If nSLEEP was raised for an override move, restore it to sleep
  if (nsleep_overridden_ && !DEVELOPMENT_KEEP_NSLEEP_AWAKE) {
    set_nsleep_(false);
    nsleep_overridden_ = false;
  }
  ESP_LOGI(TAG, "Motor %d stopped (%" PRIu32 "ms)", current_zone_ + 1, motor_run_time_ms_);
}

// =============================================================================
// FSM Tick (10ms)
// =============================================================================

void Lv6ValveController::process_tick_() {
  if (!motor_turning_)
    return;

  // Check if timed move duration has elapsed
  if (timed_mode_active_) {
    uint32_t now_ms = esp_timer_get_time() / 1000;
    uint32_t elapsed_ms = now_ms - timed_move_start_ms_;
    if (elapsed_ms >= timed_move_duration_ms_) {
      ESP_LOGI(TAG, "Zone %d timed move completed (%u ms)",
               current_zone_ + 1, elapsed_ms);
      stop_motor_(true);
      timed_mode_active_ = false;
      return;
    }
  }

  motor_run_time_ms_ += TICK_MS;
  drive_phase_elapsed_ms_ += TICK_MS;

  apply_drive_output_();

  // Check nFAULT — only react to thermal and overcurrent, not stall
  // (DRV8215 stall threshold ~500mA is too high for these valve motors)
  if (!read_nfault_()) {
    if (gpio_backend_enabled_) {
      trigger_fault_(FaultCode::UNKNOWN_FAULT,
                     "persistent hardware fault latch asserted");
      drivers_enabled_ = false;
      return;
    }
    DRV8215 *driver = drivers_[current_zone_];
    if (driver) {
      auto fault = driver->read_fault();
      if (fault.tsd)
        trigger_fault_(FaultCode::THERMAL, "thermal shutdown");
      else if (fault.ocp)
        trigger_fault_(FaultCode::OVERCURRENT, "overcurrent");
      else if (!fault.stall)
        trigger_fault_(FaultCode::UNKNOWN_FAULT, "nFAULT asserted");
      // stall flag is ignored — endstop detection is done via current sensing
    }
    return;
  }

  // Runtime timeout
  float base_runtime_ms = static_cast<float>(effective_runtime_limit_s_(current_zone_)) * 1000.0f;
  float max_runtime_ms = base_runtime_ms;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t lo = telemetry_[current_zone_].learned_open_ms;
  uint32_t lc = telemetry_[current_zone_].learned_close_ms;
  xSemaphoreGive(telemetry_mutex_);

  uint32_t adaptive_cap = 0;
  bool adaptive_applied = false;
  if (calibrating_) {
    // During calibration use the full profile window — a short prior from an
    // interrupted/failed run must not cap the pass below the real stroke length.
    // Endstop detection (current threshold/slope) handles early stop; the profile
    // limit (hmip_vdmot_runtime_limit_s = 40 s) is the fallback for missed detection.
    // adaptive_cap stays 0 → not applied.
  } else if (lo > 0 && lc > 0) {
    uint32_t learned_max = std::max(lo, lc);
    adaptive_cap = learned_max + motor_cfg_.adaptive_runtime_margin_ms;
  }
  if (adaptive_cap > 1000 && static_cast<float>(adaptive_cap) < max_runtime_ms) {
    max_runtime_ms = static_cast<float>(adaptive_cap);
    adaptive_applied = true;
  }

  if (motor_run_time_ms_ >= static_cast<uint32_t>(max_runtime_ms)) {
    ESP_LOGW(TAG,
             "Motor %d timeout context: run=%" PRIu32 "ms limit=%.0fms base=%.0fms adaptive_cap=%" PRIu32 "ms adaptive=%s learned_open=%" PRIu32 "ms learned_close=%" PRIu32 "ms",
             current_zone_ + 1, motor_run_time_ms_, max_runtime_ms, base_runtime_ms,
             adaptive_cap, adaptive_applied ? "applied" : "not_applied", lo, lc);
    trigger_fault_(FaultCode::MECHANICAL_OVERRUN,
                   "runtime safety cutoff (possible actuator pop-off)");
    return;
  }

  // Calibration-only fast abort for a missing motor. A connected actuator
  // produces commutation ripples within the first couple of seconds; if ripple
  // counting is active and we've seen zero ripples well past the inrush window,
  // nothing is wired to this driver. The IPROPI lines are wire-ORed onto one
  // floating ADC pin, so noise can intermittently exceed the low-current
  // threshold and defeat detect_open_circuit_(), letting the pass otherwise run
  // to the full ~45 s runtime cap. Bail now so calibration fails fast instead
  // of pinning the CPU for the whole safety window on every pass.
  if (calibrating_ && ripple_enabled_ &&
      motor_run_time_ms_ >= CALIBRATION_NO_RIPPLE_ABORT_MS &&
      live_ripple_count_.load(std::memory_order_relaxed) == 0) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    telemetry_[current_zone_].present = false;
    telemetry_[current_zone_].presence_known = true;
    xSemaphoreGive(telemetry_mutex_);
    trigger_fault_(FaultCode::OPEN_CIRCUIT, "no ripple — motor not connected");
    return;
  }

  // Read current from ESPHome ADC sensor
  float raw_ma = read_current_ma_();
  current_raw_ma_ = raw_ma;
  current_filtered_ma_ = current_filtered_ma_ * (1.0f - CURRENT_FILTER_ALPHA) +
                          raw_ma * CURRENT_FILTER_ALPHA;
  current_peak_ma_ = std::max(current_peak_ma_, current_filtered_ma_);

  current_sum_ += current_filtered_ma_;
  current_count_++;
  if (debounce_count_ < 255)
    debounce_count_++;

  // Rev 3.2 drains the hardware commutation counter every tick.  There is no
  // coast interruption: the count is qualified against the commutation band and
  // blanked for the first 250 ms, because the AC-coupled front end saturates on
  // the drive-start step and emits spurious edges for about that long.
  if (rev32_backend_) {
    rev32_backend_->poll_motion(motor_run_time_ms_, drive_output_enabled_);
    const uint32_t count = rev32_backend_->motion_evidence_count();
    live_ripple_count_.store(count, std::memory_order_relaxed);
    motor_diag_evidence_count_.store(count, std::memory_order_relaxed);
    motor_diag_tacho_period_us_.store(rev32_backend_->tacho_period_us(),
                                      std::memory_order_relaxed);
    motor_diag_tacho_rejected_.store(rev32_backend_->tacho_rejected(),
                                     std::memory_order_relaxed);
    motor_diag_tacho_hardware_.store(rev32_backend_->tacho_hardware_count(),
                                     std::memory_order_relaxed);
    motor_diag_armed_.store(rev32_backend_->armed() ? 1 : 0,
                            std::memory_order_relaxed);
    motor_diag_decoder_address_.store(rev32_backend_->decoder_address(),
                                      std::memory_order_relaxed);
    motor_diag_runtime_ms_.store(motor_run_time_ms_, std::memory_order_relaxed);
    motor_diag_sample_sequence_.fetch_add(1, std::memory_order_relaxed);
    motor_diag_tacho_cadence_us_.store(rev32_backend_->tacho_cadence_us(),
                                       std::memory_order_relaxed);
    if (rev32_backend_->fault_latched()) {
      drive_output_enabled_ = false;
      trigger_fault_(FaultCode::UNKNOWN_FAULT,
                     "hardware fault latch asserted mid-move");
      return;
    }

    // Advance the stroke-phase model. The current bump at pin contact and the
    // one at the hard stop are the same shape; what separates them is whether
    // the rotor recovers, which is what stretch_x10 measures.
    if (drive_output_enabled_ && !rev32_backend_->tacho_blanked(motor_run_time_ms_)) {
      stroke_.observe(count, current_filtered_ma_,
                      rev32_backend_->tacho_stretch_x10(motor_run_time_ms_));
      motor_diag_stroke_phase_.store(static_cast<uint8_t>(stroke_.phase()),
                                     std::memory_order_relaxed);
    }
  }

  // Rev 3.1 proves motion independently of current by briefly inhibiting the
  // decoder and sampling both motor terminals through the shared 4067.  The
  // backend restores the original latched direction only after the mandatory
  // 1 ms coast interval.
  if (rev31_backend_ && drive_output_enabled_ &&
      (last_bemf_sample_ms_ == 0 ||
       motor_run_time_ms_ - last_bemf_sample_ms_ >= REV31_BEMF_SAMPLE_PERIOD_MS)) {
    last_bemf_sample_ms_ = motor_run_time_ms_;
    const auto sample = rev31_backend_->sample_bemf(motor_run_time_ms_, true);
    rev31_diag_raw_a_.store(static_cast<uint16_t>(sample.raw_a & 0x0FFF),
                            std::memory_order_relaxed);
    rev31_diag_raw_b_.store(static_cast<uint16_t>(sample.raw_b & 0x0FFF),
                            std::memory_order_relaxed);
    rev31_diag_differential_.store(sample.motion.differential_raw,
                                   std::memory_order_relaxed);
    rev31_diag_separation_us_.store(sample.motion.separation_us,
                                    std::memory_order_relaxed);
    rev31_diag_sample_valid_.store(sample.motion.valid ? 1 : 0,
                                   std::memory_order_relaxed);
    rev31_diag_sample_moving_.store(sample.motion.moving ? 1 : 0,
                                    std::memory_order_relaxed);
    motor_diag_evidence_count_.store(rev31_backend_->motion_evidence_count(),
                                     std::memory_order_relaxed);
    motor_diag_runtime_ms_.store(motor_run_time_ms_,
                                       std::memory_order_relaxed);
    motor_diag_sample_sequence_.fetch_add(1, std::memory_order_relaxed);
    drive_output_enabled_ = !rev31_backend_->fault_latched();
    live_ripple_count_.store(rev31_backend_->motion_evidence_count(),
                             std::memory_order_relaxed);
    if (!sample.motion.valid) {
      if (rev31_invalid_bemf_samples_ < UINT8_MAX)
        rev31_invalid_bemf_samples_++;
      rev31_diag_invalid_samples_.store(rev31_invalid_bemf_samples_,
                                        std::memory_order_relaxed);
      ESP_LOGW(TAG, "BEMF sample rejected (%u/%u): ADC failure or terminal separation %u us exceeds 50 us",
               rev31_invalid_bemf_samples_, REV31_MAX_INVALID_BEMF_SAMPLES,
               sample.motion.separation_us);
      trace_sample_(-1, current_raw_ma_);
      if (rev31_invalid_bemf_samples_ >= REV31_MAX_INVALID_BEMF_SAMPLES) {
        trigger_fault_(FaultCode::UNKNOWN_FAULT,
                       "BEMF endpoint sensor invalid");
        return;
      }
    } else {
      rev31_invalid_bemf_samples_ = 0;
      rev31_diag_invalid_samples_ = 0;
      trace_sample_(-1, current_raw_ma_);
    }
  }

  // Early already-at-stop — evaluated DURING boost, before the current-filter debounce,
  // so it can fire before sustained boost force pops an already-closed actuator off its
  // pin. The motor commutates within the first tens of ms of the 100%-duty boost, so
  // zero ripples by EARLY_STALL_MS means it never moved → it is already against the stop
  // it was commanded toward. Current presence (boost current) confirms it is connected,
  // not missing. Gated to endstop-seeking moves; a moving motor (any ripples) is exempt.
  //
  // Rev 3.2 is excluded. EARLY_STALL_MS is 250 ms and so is the tacho blanking,
  // so the commutation count is zero here BY CONSTRUCTION and this would fire on
  // a healthy move. already_at_stop in detect_endstop_() covers the same
  // condition, anchored to motion_decision_ms_() and routed through the endpoint
  // classifier instead of stopping the move behind its back.
  if ((calibrating_ || drive_to_endstop_active_) && ripple_enabled_ &&
      rev32_backend_ == nullptr &&
      motor_run_time_ms_ >= EARLY_STALL_MS &&
      live_ripple_count_.load(std::memory_order_relaxed) == 0 &&
      current_raw_ma_ >= motor_cfg_.low_current_threshold_ma) {
    if (gpio_backend_enabled_) {
      // With no prior motion, current+BEMF cannot distinguish a genuine
      // already-at-stop condition from a pre-existing mechanical obstruction.
      // Stop early, but do not promote the ambiguous state to a known endpoint.
      trigger_fault_(FaultCode::BLOCKED,
                     "no startup motion under load; endpoint versus jam is ambiguous");
      return;
    }
    ESP_LOGI(TAG, "Motor %d endstop (at_stop_early: raw=%.1f mA, t=%" PRIu32 "ms)",
             current_zone_ + 1, current_raw_ma_, motor_run_time_ms_);
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    auto &t = telemetry_[current_zone_];
    if (current_dir_ == MotorDirection::OPEN) {
      t.last_open_endstop_ms = motor_run_time_ms_;
      t.current_position_pct = 100.0f;
    } else {
      t.last_close_endstop_ms = motor_run_time_ms_;
      t.current_position_pct = 0.0f;
    }
    xSemaphoreGive(telemetry_mutex_);
    endpoint_confirmed_ = true;
    stop_motor_(true);
    return;
  }

  if (debounce_count_ < DEBOUNCE_TICKS)
    return;

  detect_endstop_();
  detect_open_circuit_();
  detect_pin_engagement_();
}

void Lv6ValveController::apply_drive_output_() {
  DRV8215 *driver = drivers_[current_zone_];
  if (gpio_backend_enabled_ && !gpio_backend_)
    return;
  if (!gpio_backend_enabled_ && !driver)
    return;

  auto drive_selected = [&]() -> bool {
    if (gpio_backend_enabled_)
      return gpio_backend_->drive();
    if (current_dir_ == MotorDirection::OPEN)
      driver->reverse();
    else
      driver->forward();
    return true;
  };
  auto coast_selected = [&]() {
    if (gpio_backend_enabled_)
      gpio_backend_->coast();
    else
      driver->coast();
  };

  if (fsm_state_ == MotorFsmState::BOOST) {
    if (!drive_output_enabled_) {
      drive_output_enabled_ = drive_selected();
    }
    if (motor_run_time_ms_ >= motor_cfg_.pwm_boost_ms) {
      fsm_state_ = MotorFsmState::HOLD;
      drive_phase_elapsed_ms_ = 0;
    }
  } else if (fsm_state_ == MotorFsmState::HOLD) {
    uint32_t period = motor_cfg_.pwm_period_ms;
    if (period == 0)
      period = 40;
    uint32_t on_time = (period * effective_hold_duty_()) / 100;
    uint32_t phase_pos = drive_phase_elapsed_ms_ % period;

    if (phase_pos < on_time) {
      if (!drive_output_enabled_) {
        drive_output_enabled_ = drive_selected();
      }
    } else {
      if (drive_output_enabled_) {
        coast_selected();
        drive_output_enabled_ = false;
      }
    }
  }
}

void Lv6ValveController::sanitize_motor_cfg_() {
  // NVS holds bring-up values that an operator can edit, so a nonsensical pair
  // must not silently disable the stall verdict. A floor above the ceiling would
  // make adaptive_plateau_ms() return the floor unconditionally, which is a
  // longer debounce than either value asked for.
  if (motor_cfg_.stall_plateau_floor_ms > motor_cfg_.stall_plateau_ceiling_ms) {
    ESP_LOGW(TAG, "stall_plateau floor %" PRIu32 "ms exceeds ceiling %" PRIu32 "ms; swapping",
             motor_cfg_.stall_plateau_floor_ms, motor_cfg_.stall_plateau_ceiling_ms);
    std::swap(motor_cfg_.stall_plateau_floor_ms, motor_cfg_.stall_plateau_ceiling_ms);
  }
  if (motor_cfg_.endpoint_window_tolerance_pct > 100)
    motor_cfg_.endpoint_window_tolerance_pct = 100;
  // A motion decision inside the blanking window would see a zero commutation
  // count by construction and read it as "never moved".
  if (motor_cfg_.rev32_motion_decision_ms > 0 &&
      motor_cfg_.rev32_motion_decision_ms <= Rev32TachoQualifier::BLANKING_MS) {
    ESP_LOGW(TAG, "rev32_motion_decision_ms %" PRIu32 "ms is inside the %" PRIu32
             "ms tacho blanking; deriving it instead",
             motor_cfg_.rev32_motion_decision_ms, Rev32TachoQualifier::BLANKING_MS);
    motor_cfg_.rev32_motion_decision_ms = 0;
  }
}

bool Lv6ValveController::start_adc_stream_() {
  // One continuous (DMA) stream owns the ADC unit. The oneshot and continuous
  // drivers cannot share a unit, which is why Rev 3.2's backend does not read
  // its own ADC: reading two channels from the motor task at 100 Hz cost 200
  // blocking conversions a second and sampled TACHO_AMP at Nyquist against the
  // 20-40 Hz commutation band, so it could never cross-check the count anyway.
  //
  // adc_oneshot_io_to_channel() is a pure GPIO -> (unit, channel) lookup and
  // allocates no oneshot handle, so it is safe here.
  const bool rev32 = rev32_backend_ != nullptr;

  adc_unit_t current_unit;
  adc_channel_t current_chan;
  esp_err_t adc_err = adc_oneshot_io_to_channel(static_cast<int>(ipropi_pin_),
                                                &current_unit, &current_chan);
  if (adc_err != ESP_OK) {
    ESP_LOGW(TAG, "ADC_CURRENT GPIO%d is not ADC-capable; current sensing disabled",
             ipropi_pin_);
    ripple_enabled_ = false;
    return false;
  }
  ipropi_channel_ = static_cast<int>(current_chan);

  // Rev 3.2 reads ADC_CURRENT at 6 dB — full scale lands near 175 mA at the
  // INA180's 10 V/A, covering the whole operating range at ~1.8x the resolution
  // of the 12 dB span. The DRV8215 current mirror needs the full 12 dB range.
  const adc_atten_t current_atten = rev32 ? ADC_ATTEN_DB_6 : ADC_ATTEN_DB_12;
  adc_current_atten_ = current_atten;

  adc_digi_pattern_config_t pattern[2] = {};
  uint8_t pattern_num = 1;
  pattern[0].atten = current_atten;
  pattern[0].channel = current_chan;
  pattern[0].unit = current_unit;
  pattern[0].bit_width = ADC_BITWIDTH_12;

  if (rev32) {
    adc_unit_t tacho_unit;
    adc_channel_t tacho_chan;
    if (adc_oneshot_io_to_channel(static_cast<int>(rev32_pins_.adc_tacho),
                                  &tacho_unit, &tacho_chan) != ESP_OK ||
        tacho_unit != current_unit) {
      ESP_LOGE(TAG, "ADC_TACHO GPIO%d must be on the same ADC unit as ADC_CURRENT",
               rev32_pins_.adc_tacho);
      ripple_enabled_ = false;
      return false;
    }
    tacho_adc_channel_ = static_cast<int>(tacho_chan);
    // TACHO_AMP is an ~85x amplified ripple riding on the mid-rail reference,
    // so it needs the full-scale range even though the ripple itself is small.
    pattern[1].atten = ADC_ATTEN_DB_12;
    pattern[1].channel = tacho_chan;
    pattern[1].unit = tacho_unit;
    pattern[1].bit_width = ADC_BITWIDTH_12;
    pattern_num = 2;
  }

  // Two channels share the sample rate round-robin, so the aggregate is doubled
  // to keep each channel at the per-channel rate the filters are derived for.
  const uint32_t sample_rate = rev32 ? REV32_ADC_SAMPLE_RATE_HZ * 2
                                     : RIPPLE_SAMPLE_RATE_HZ;
  const uint32_t frame_bytes = rev32 ? REV32_DMA_FRAME_BYTES : RIPPLE_DMA_FRAME_BYTES;

  adc_continuous_handle_cfg_t cont_handle_cfg = {};
  cont_handle_cfg.max_store_buf_size = frame_bytes * 4;
  cont_handle_cfg.conv_frame_size = frame_bytes;
  adc_continuous_handle_t adc_cont_h = nullptr;
  adc_err = adc_continuous_new_handle(&cont_handle_cfg, &adc_cont_h);
  adc_continuous_handle_ = adc_cont_h;

  if (adc_err == ESP_OK) {
    adc_continuous_config_t cont_cfg = {};
    cont_cfg.sample_freq_hz = sample_rate;
    cont_cfg.conv_mode = ADC_CONV_SINGLE_UNIT_1;
    cont_cfg.format = ADC_DIGI_OUTPUT_FORMAT_TYPE2;
    cont_cfg.pattern_num = pattern_num;
    cont_cfg.adc_pattern = pattern;
    adc_err = adc_continuous_config(
        static_cast<adc_continuous_handle_t>(adc_continuous_handle_), &cont_cfg);
  }
  if (adc_err == ESP_OK) {
    adc_continuous_evt_cbs_t cbs = {};
    cbs.on_conv_done = ripple_adc_conv_done_;
    adc_err = adc_continuous_register_event_callbacks(
        static_cast<adc_continuous_handle_t>(adc_continuous_handle_), &cbs,
        &ripple_task_handle_);
  }
  if (adc_err == ESP_OK) {
    adc_cali_curve_fitting_config_t cali_cfg = {};
    cali_cfg.unit_id = current_unit;
    cali_cfg.chan = current_chan;
    cali_cfg.atten = current_atten;
    cali_cfg.bitwidth = ADC_BITWIDTH_12;
    adc_cali_handle_t cali_h = nullptr;
    if (adc_cali_create_scheme_curve_fitting(&cali_cfg, &cali_h) != ESP_OK) {
      ESP_LOGW(TAG, "ADC calibration init failed, using uncalibrated");
      cali_h = nullptr;
    }
    adc_cali_handle_ = cali_h;
  }
  if (adc_err != ESP_OK) {
    ESP_LOGW(TAG, "ADC continuous init failed (err=%d), ripple counting disabled", adc_err);
    ripple_enabled_ = false;
    return false;
  }

  if (rev32) {
    // The RippleCounter constants were derived for 15 kHz on the DRV8215 current
    // mirror. On Rev 3.2 it runs on the amplified tacho waveform at a different
    // rate, so the sample-rate-dependent terms are re-derived here. Amplitude
    // terms (threshold, hysteresis) are bring-up values and must be re-measured.
    RippleCounter::Config cfg = kRippleConfig;
    cfg.sampleRate = static_cast<float>(REV32_ADC_SAMPLE_RATE_HZ);
    cfg.minPeriodSamples = REV32_ADC_SAMPLE_RATE_HZ / REV32_TACHO_GATE_HZ;
    tacho_adc_counter_ = new RippleCounter(cfg);
    // The contract's mandatory 250 ms blanking, expressed in samples of this
    // stream. Rev 3.2 drives continuously, so this fires once per move.
    dma_debounce_samples_ =
        REV32_ADC_SAMPLE_RATE_HZ * Rev32TachoQualifier::BLANKING_MS / 1000;
  }

  BaseType_t task_ok = xTaskCreatePinnedToCore(
      ripple_task_func_, "hv6_ripple", 4096, this, PRIORITY - 1,
      &ripple_task_handle_, CORE);
  if (task_ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create ripple processor task");
    ripple_enabled_ = false;
    return false;
  }

  ripple_enabled_ = true;
  if (rev32) {
    ESP_LOGI(TAG,
             "ADC continuous @ %" PRIu32 "Hz: ADC_CURRENT GPIO%d @6dB + ADC_TACHO GPIO%d @12dB "
             "(%" PRIu32 "Hz each, %" PRIu32 " byte frames)",
             sample_rate, ipropi_pin_, rev32_pins_.adc_tacho,
             REV32_ADC_SAMPLE_RATE_HZ, frame_bytes);
  } else {
    ESP_LOGI(TAG, "IPROPI ADC continuous @ %" PRIu32 "Hz (GPIO%d), ripple counting enabled",
             sample_rate, ipropi_pin_);
  }
  return true;
}

uint32_t Lv6ValveController::motion_decision_ms_() const {
  if (rev32_backend_ == nullptr)
    return motor_cfg_.pwm_boost_ms + ALREADY_AT_STOP_MS;

  // Blanking discards every edge for the first 250 ms, and the qualifier needs a
  // poll after that to credit the first one. Two worst-case commutation periods
  // of headroom past blanking makes a zero count mean "it never turned" rather
  // than "we have not looked yet".
  const uint32_t configured = motor_cfg_.rev32_motion_decision_ms;
  if (configured > 0)
    return std::max(configured, Rev32TachoQualifier::BLANKING_MS + 1);
  return Rev32TachoQualifier::BLANKING_MS + 2 * (rev32_tacho_.max_period_us / 1000);
}

uint8_t Lv6ValveController::effective_hold_duty_() {
  // Full-duty calibration: drive 100% (continuous, no coast off-phase) so the motor
  // makes full torque and IPROPI is never coast-zeroed. The 70% hold both weakens the
  // stall and dilutes the EMA current ~0.7×, which can hide the endstop stall current on
  // weaker motors; at full duty the stall current is strong and undiluted, so the
  // self-referential threshold detects the stop instead of grinding to the safety cap.
  if (calibrating_) {
    soft_approach_active_ = false;
    return CALIBRATION_DUTY_PCT;
  }

  // Rev 3.2 has no duty-cycle control at all: the 4514 feeds the driver inputs
  // static logic, so the only way to modulate would be to chop MOTOR_ENABLE.
  // That is actively harmful here — the 40 ms chop period sits *inside* the
  // 25-50 ms commutation period the tacho counts, and every off-edge is a fresh
  // drive-start step into an AC-coupled front end with a 100 ms settling time.
  // Soft-approach therefore does not exist on Rev 3.2; fast endpoint detection
  // is the pop-off defence instead (architecture.md, No hardware runtime cutoff).
  if (rev32_backend_ != nullptr) {
    soft_approach_active_ = false;
    return 100;
  }

  uint8_t hold = motor_cfg_.pwm_hold_duty_pct;
  uint8_t approach = motor_cfg_.pwm_approach_duty_pct;
  uint8_t zone_pct = motor_cfg_.approach_zone_pct;

  // Soft-approach only applies when heading to a mechanical limit with usable
  // travel data and a sane, lower approach duty configured.
  if (!drive_to_endstop_active_ || approach == 0 || approach >= hold ||
      zone_pct == 0 || zone_pct >= 100) {
    soft_approach_active_ = false;
    return hold;
  }

  float progress;
  if (ripple_enabled_ && approach_stroke_ripples_ > 0) {
    uint32_t rip = live_ripple_count_.load(std::memory_order_relaxed);
    progress = static_cast<float>(rip) / static_cast<float>(approach_stroke_ripples_);
  } else if (approach_stroke_ms_ > 0) {
    progress = static_cast<float>(motor_run_time_ms_) / static_cast<float>(approach_stroke_ms_);
  } else {
    soft_approach_active_ = false;  // no learned travel data — keep full force
    return hold;
  }

  bool active = progress >= (static_cast<float>(zone_pct) / 100.0f);
  if (active && !soft_approach_active_) {
    ESP_LOGD(TAG, "Motor %d soft-approach engaged (progress=%.0f%%, duty %u%%->%u%%)",
             current_zone_ + 1, progress * 100.0f, hold, approach);
  }
  soft_approach_active_ = active;
  return active ? approach : hold;
}

bool Lv6ValveController::endpoint_window_reached_() const {
  const uint32_t count = live_ripple_count_.load(std::memory_order_relaxed);
  const float tolerance =
      1.0f - static_cast<float>(motor_cfg_.endpoint_window_tolerance_pct) / 100.0f;

  // Closing: the seat is a fixed depth past pin contact, and that depth is far
  // more repeatable than the full stroke, which depends on where the move
  // started. Measure from the contact the tracker actually observed.
  if (current_dir_ == MotorDirection::CLOSE && stroke_.contact_seen()) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    const uint32_t seating = telemetry_[current_zone_].contact_to_stop_close_ripples;
    xSemaphoreGive(telemetry_mutex_);
    if (seating > 0) {
      const uint32_t expected =
          stroke_.contact_count() + static_cast<uint32_t>(seating * tolerance);
      return count >= expected;
    }
  }

  // Otherwise fall back to the travel estimated for this move. Opening has no
  // contact phase to measure from, so this is the only anchor it has.
  if (approach_stroke_ripples_ == 0)
    return true;  // uncalibrated: nothing to withhold an endpoint against
  return count >= static_cast<uint32_t>(approach_stroke_ripples_ * tolerance);
}

void Lv6ValveController::detect_endstop_() {
  // Rev 3.2 has no boost phase — it drives continuously — so the guard comes
  // from the tacho contract instead of the PWM profile.
  bool past_boost = motor_run_time_ms_ >= (rev32_backend_ != nullptr
                                               ? motion_decision_ms_()
                                               : motor_cfg_.pwm_boost_ms);
  const bool gpio_motion_observed = gpio_backend_enabled_ && gpio_backend_ &&
                                     gpio_backend_->motion_observed();

  // How long silence has to last before it counts as a stall. Rev 3.1's fixed
  // 750 ms has to be sized for the slowest case; Rev 3.2 scales it to the
  // cadence this motor is actually turning at, which on the qualified actuator
  // lands at the 150 ms floor — inside E-08's 250 ms bound and four times
  // quicker to take the drive off a hard stop.
  const uint32_t stall_debounce_ms =
      rev32_backend_ != nullptr
          ? rev32_backend_->stall_debounce_ms(motor_cfg_.stall_plateau_factor_x10,
                                              motor_cfg_.stall_plateau_floor_ms,
                                              motor_cfg_.stall_plateau_ceiling_ms)
          : RIPPLE_STALL_MS;
  const bool gpio_motion_stopped = gpio_backend_enabled_ && gpio_backend_ &&
      gpio_backend_->motion_stopped_for(motor_run_time_ms_, stall_debounce_ms);

  // --- Fast hard safety cap (low latency) ---
  // Evaluate the absolute over-current cap against the *raw* per-frame current
  // (~17 ms latency) with a tiny debounce, rather than the ~200 ms-lagged EMA.
  // Active as soon as the boost/inrush phase is over so it protects the
  // vulnerable near-stop region even before the slope/threshold guard opens.
  bool hard_cap_endstop = false;
  if (past_boost) {
    // Absolute catastrophic ceiling only (shorted winding / hard stall). A lower,
    // direction-aware open cap was tried but fired on the open breakaway/early-travel
    // current (~45 mA) — well above the gentle open stall — killing the open pass at
    // ~600 ms. The open endstop is instead handled by the threshold/slope and the
    // magnitude-independent rotation-stall path, so the hard cap stays a pure safety net.
    if (current_raw_ma_ > ENDSTOP_HARD_CAP_MA) {
      if (hard_cap_high_count_ < 255)
        hard_cap_high_count_++;
    } else {
      hard_cap_high_count_ = 0;
    }
    hard_cap_endstop = hard_cap_high_count_ >= HARD_CAP_TICKS;
  }

  // --- Fast open hard-stop cap (low latency, self-gated past breakaway) ---
  // The open retract stop is a sharp ~47-52 mA raw bite, but the slope path only updates
  // once per 500 ms window — the gears grind for up to ~500 ms (1-3 ticks) before it
  // reacts. Trip on the raw current in ~30 ms instead. The ~45 mA open breakaway current
  // (first ~600 ms) would false-fire a naive cap, so arm only AFTER the current has
  // settled back into the low free-travel band; from then on only the end-stop bite trips
  // it. If the current never settles low, this never arms and the slope path still covers.
  bool open_fast_endstop = false;
  if (current_dir_ == MotorDirection::OPEN && past_boost) {
    if (!open_fast_cap_armed_ && current_filtered_ma_ < OPEN_FAST_CAP_ARM_BELOW_MA)
      open_fast_cap_armed_ = true;
    if (open_fast_cap_armed_) {
      if (current_raw_ma_ > OPEN_FAST_CAP_MA) {
        if (open_fast_cap_count_ < 255)
          open_fast_cap_count_++;
      } else {
        open_fast_cap_count_ = 0;
      }
      open_fast_endstop = open_fast_cap_count_ >= OPEN_FAST_CAP_TICKS;
    }
  }

  // Threshold and slope detection only run after the (adaptive) inrush guard —
  // shorter than the conservative calibration window, and shrunk further for
  // moves that start already near the stop (see execute_move_).
  bool threshold_endstop = false;
  bool slope_endstop = false;
  if (motor_run_time_ms_ >= endstop_guard_ms_) {
    bool is_opening = (current_dir_ == MotorDirection::OPEN);
    float cfg_current_factor = effective_current_factor_(current_zone_, current_dir_);
    // On Rev 3.2 the opening endstop is the motor's own gear train bottoming
    // out — a materially smaller resistance than the closing hard stop, which
    // presses a pin into a seat. Reusing the closing factor barely reaches it,
    // and opening is the direction where overrunning strips the gears.
    if (is_opening && rev32_backend_ != nullptr)
      cfg_current_factor = motor_cfg_.open_endstop_current_factor;
    float cfg_slope_thr      = is_opening ? motor_cfg_.open_slope_threshold_ma_per_s
                                          : motor_cfg_.close_slope_threshold_ma_per_s;
    float cfg_slope_cur_fac  = is_opening ? motor_cfg_.open_slope_current_factor
                                          : motor_cfg_.close_slope_current_factor;

    // Detection reference current. During calibration this is SELF-REFERENTIAL: the
    // running current measured fresh in this very pass (first settled reading past the
    // guard), never the stored mean — a corrupted prior (e.g. an inflated mean) must not
    // break a fresh re-learn. Normal moves use the learned per-direction mean.
    float detect_mean;
    if (calibrating_) {
      if (!cal_baseline_set_) {
        cal_baseline_ma_ = std::max(current_filtered_ma_, 1.0f);
        cal_baseline_set_ = true;
      }
      detect_mean = cal_baseline_ma_;
    } else {
      detect_mean = mean_current_(current_zone_, current_dir_);
    }
    if (soft_approach_active_ && motor_cfg_.pwm_hold_duty_pct > 0) {
      detect_mean *= static_cast<float>(motor_cfg_.pwm_approach_duty_pct) /
                     static_cast<float>(motor_cfg_.pwm_hold_duty_pct);
    }

    // --- Slope tracking (dI/dt) ---
    // Initialize on first call after the guard so slope_prev starts from a
    // settled current reading, not zero.
    if (!slope_initialized_) {
      slope_prev_current_ma_ = current_filtered_ma_;
      slope_tick_count_ = 0;
      current_slope_ma_per_s_ = 0.0f;
      slope_endstop_windows_ = 0;
      slope_initialized_ = true;
    }

    // Update slope estimate every SLOPE_WINDOW_TICKS (500ms). The VdMot current
    // graphs show endstop as a gradual ramp over the last ~25% of travel (e.g.
    // 19→35 mA closing, 15→25 mA opening). Unlike VdMot (dedicated AC-coupled
    // tacho), LV6 derives both ripple and current from the single IPROPI pin, so
    // slope detection on the current signal is the best secondary indicator.
    slope_tick_count_++;
    if (slope_tick_count_ >= SLOPE_WINDOW_TICKS) {
      float dt_s = static_cast<float>(SLOPE_WINDOW_TICKS * TICK_MS) / 1000.0f;
      current_slope_ma_per_s_ = (current_filtered_ma_ - slope_prev_current_ma_) / dt_s;
      slope_prev_current_ma_ = current_filtered_ma_;
      slope_tick_count_ = 0;

      // Endstop-like slope: current rising AND above mean×slope_current_factor
      // (avoids false trigger on the mid-travel step when the pin engages).
      bool window_rising = current_slope_ma_per_s_ > cfg_slope_thr
                           && current_filtered_ma_ > detect_mean * cfg_slope_cur_fac;
      if (window_rising) {
        if (slope_endstop_windows_ < 255)
          slope_endstop_windows_++;
      } else {
        slope_endstop_windows_ = 0;
      }
    }

    // --- Primary path: absolute threshold with sustained debounce ---
    float threshold = detect_mean * cfg_current_factor;
    if (current_filtered_ma_ > threshold) {
      if (endstop_high_count_ < 255)
        endstop_high_count_++;
    } else {
      endstop_high_count_ = 0;
    }

    uint8_t slope_windows_req = is_opening ? ENDSTOP_SLOPE_WINDOWS_OPEN : ENDSTOP_SLOPE_WINDOWS;
    threshold_endstop = endstop_high_count_ >= ENDSTOP_HIGH_TICKS;
    slope_endstop = slope_endstop_windows_ >= slope_windows_req;
  }

  // --- Path 5: rotation stall (ripple plateau) — magnitude-independent ---
  // A motor pressed against the mechanical stop can no longer commutate, so its
  // ripple count stops advancing. This catches low-current motors whose open
  // stall never reaches the current-referenced thresholds above (which on a fresh
  // calibration — before a real mean_open is learned — would otherwise grind to
  // the runtime-safety cap).
  //
  // "Connected" arms on EITHER observed rotation (≥ MIN_COUNT ripples) OR current
  // present: a motor energized and pressed against a stop draws current but never
  // turns, which is the "valve already at this endstop" case — e.g. homing open a
  // valve that reset to fully open. Like VdMot, we treat current (not rotation) as
  // proof the motor is connected, so already-at-endstop reads as endstop-reached,
  // not a false OPEN_CIRCUIT. A truly disconnected motor (no current AND no ripples)
  // never arms and is left to the open-circuit / no-ripple paths. The window is
  // baselined from the guard (not motor start) so a slow breakaway gets a full
  // RIPPLE_STALL_MS to show its first ripple before being declared stalled.
  bool stall_endstop = false;
  if (ripple_enabled_ && (calibrating_ || drive_to_endstop_active_) &&
      motor_run_time_ms_ >= endstop_guard_ms_) {
    uint32_t rip = live_ripple_count_.load(std::memory_order_relaxed);
    if (!stall_initialized_) {
      stall_last_ripple_count_ = rip;
      stall_last_advance_ms_ = motor_run_time_ms_;
      stall_initialized_ = true;
    } else if (rip > stall_last_ripple_count_) {
      stall_last_ripple_count_ = rip;
      stall_last_advance_ms_ = motor_run_time_ms_;
    }
    bool connected = rip >= RIPPLE_STALL_MIN_COUNT ||
                     current_filtered_ma_ >= motor_cfg_.low_current_threshold_ma;
    if (connected && (motor_run_time_ms_ - stall_last_advance_ms_) >= stall_debounce_ms)
      stall_endstop = true;
  }

  // --- Fast already-at-endstop (never moved off the stop) ---
  // The motor commutates during the boost phase, so zero ripples shortly after boost
  // while drawing current means it is already pressed against the stop it was driven
  // toward (closing an already-closed valve, or a valve that reset fully open). Stop
  // now — this is what avoids driving full force into an engaged stop for the whole
  // blind window (the actuator pop-off), without trial-and-error current tuning. A
  // disconnected motor draws no current here, so it is left to the open-circuit path.
  bool already_at_stop = ripple_enabled_ && (calibrating_ || drive_to_endstop_active_) &&
      motor_run_time_ms_ >= motion_decision_ms_() &&
      live_ripple_count_.load(std::memory_order_relaxed) == 0 &&
      current_filtered_ma_ >= motor_cfg_.low_current_threshold_ma;

  // Endpoint acceptance on both discrete revisions is two-factor: load evidence
  // plus previously observed motion that has now ceased.  Current alone may stop
  // the drive as a safety event, but cannot establish a position endpoint.  On
  // Rev 3.2 the motion half is the commutation count, which cannot tell rotation
  // from brush chatter against a hard stop - so it is only ever allowed to
  // *withhold* an endpoint, never to assert one.
  if (gpio_backend_enabled_) {
    threshold_endstop = threshold_endstop && gpio_motion_observed && gpio_motion_stopped;
    slope_endstop = slope_endstop && gpio_motion_observed && gpio_motion_stopped;
    open_fast_endstop = open_fast_endstop && gpio_motion_observed && gpio_motion_stopped;
    stall_endstop = stall_endstop && gpio_motion_observed && gpio_motion_stopped;
  }

  if (rev32_backend_) {
    // Rev 3.2 runs the decision through the host-tested table in rev32_logic.h
    // rather than a second copy of it here.  `make test-rev32-logic` is what
    // proves the table; this block only supplies evidence.
    Rev32EndpointEvidence evidence;
    evidence.blanking_elapsed = motor_run_time_ms_ >= Rev32TachoQualifier::BLANKING_MS;
    evidence.current_present = current_filtered_ma_ >= motor_cfg_.low_current_threshold_ma;
    evidence.load_evidence = threshold_endstop || slope_endstop || open_fast_endstop ||
                             hard_cap_endstop || stall_endstop;
    evidence.current_over_cap = hard_cap_endstop;
    // `already_at_stop` is the FSM's own "never commutated at the decision
    // point" signal, and it carries the timing anchor that raw blanking does
    // not.  Before that window opens, absence of a commutation count is not yet
    // evidence of anything.
    evidence.commutation_observed = gpio_motion_observed || !already_at_stop;
    evidence.commutation_plateau = gpio_motion_stopped;
    evidence.commanded_endpoint = calibrating_ || drive_to_endstop_active_;
    evidence.direction_is_open = current_dir_ == MotorDirection::OPEN;
    evidence.phase = stroke_.phase();
    evidence.endpoint_window = endpoint_window_reached_();

    switch (classify_rev32_endpoint(evidence)) {
      case Rev32EndpointDecision::CONTINUE:
        return;
      case Rev32EndpointDecision::ENDPOINT:
        break;  // falls through to the endpoint record below
      case Rev32EndpointDecision::OVERCURRENT:
        trigger_fault_(FaultCode::OVERCURRENT,
                       "current safety cap reached without qualified stopped-motion endpoint");
        return;
      case Rev32EndpointDecision::JAM:
        trigger_fault_(FaultCode::BLOCKED,
                       "motion stopped under load outside a commanded endpoint window");
        return;
      case Rev32EndpointDecision::BLOCKED_OR_UNKNOWN:
        trigger_fault_(FaultCode::BLOCKED,
                       "no qualified motion under load; endpoint versus jam is ambiguous");
        return;
      case Rev32EndpointDecision::TACHO_FAULT:
        trigger_fault_(FaultCode::UNKNOWN_FAULT,
                       "commutation ceased while current vanished: tacho or current-sense fault");
        return;
      case Rev32EndpointDecision::DISCONNECTED:
        // No current and no commutation.  detect_open_circuit_() owns this and
        // has the debounce for it; stopping on a single tick would fire on a
        // slow breakaway.
        return;
    }
  } else if (gpio_backend_enabled_) {
    if (already_at_stop) {
      trigger_fault_(FaultCode::BLOCKED,
                     "no qualified motion; endpoint versus jam is ambiguous");
      return;
    }

    if (hard_cap_endstop && !(gpio_motion_observed && gpio_motion_stopped)) {
      trigger_fault_(FaultCode::OVERCURRENT,
                     "current safety cap reached without qualified stopped-motion endpoint");
      return;
    }

    const bool stopped_under_load = gpio_motion_observed && gpio_motion_stopped &&
        current_filtered_ma_ >= motor_cfg_.low_current_threshold_ma;
    if (stopped_under_load && !calibrating_ && !drive_to_endstop_active_) {
      trigger_fault_(FaultCode::BLOCKED,
                     "motion stopped under load outside a commanded endpoint window");
      return;
    }
  }

  if (!threshold_endstop && !slope_endstop && !hard_cap_endstop && !stall_endstop &&
      !already_at_stop && !open_fast_endstop)
    return;

  const char *trigger = hard_cap_endstop ? "hard_cap"
                        : open_fast_endstop ? "open_fast"
                        : threshold_endstop ? "threshold"
                        : slope_endstop ? "slope"
                        : already_at_stop ? "at_stop" : "stall";
  ESP_LOGI(TAG, "Motor %d endstop (%s: filt=%.1f mA, raw=%.1f mA, mean=%.1f, slope=%.2f mA/s, t=%" PRIu32 "ms%s)",
           current_zone_ + 1, trigger, current_filtered_ma_, current_raw_ma_,
           mean_current_(current_zone_, current_dir_), current_slope_ma_per_s_, motor_run_time_ms_,
           soft_approach_active_ ? ", soft" : "");

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  auto &t = telemetry_[current_zone_];
  if (current_dir_ == MotorDirection::OPEN) {
    t.last_open_endstop_ms = motor_run_time_ms_;
    t.current_position_pct = 100.0f;
  } else {
    t.last_close_endstop_ms = motor_run_time_ms_;
    t.current_position_pct = 0.0f;
  }
  xSemaphoreGive(telemetry_mutex_);

  endpoint_confirmed_ = true;
  stop_motor_(true);
}

void Lv6ValveController::detect_open_circuit_() {
  if (motor_cfg_.low_current_threshold_ma <= 0.0f)
    return;

  // A disconnected valve shows BOTH no current AND no rotation. A real motor merely
  // opening slowly under low load (spring-assisted, low torque) draws little current
  // while still turning, so any commutation-ripple progress proves it is connected —
  // reset the low-current timer on rotation and only accumulate when the motor is
  // both starved of current and not turning. Prevents false OPEN_CIRCUIT on the
  // gentle, low-current open stroke.
  uint32_t rip = live_ripple_count_.load(std::memory_order_relaxed);
  bool turning = rip > oc_last_ripple_count_;
  oc_last_ripple_count_ = rip;

  if (current_filtered_ma_ < motor_cfg_.low_current_threshold_ma && !turning) {
    low_current_count_++;
    uint32_t window_ticks = motor_cfg_.low_current_window_ms / TICK_MS;
    if (static_cast<uint32_t>(low_current_count_) >= window_ticks) {
      ESP_LOGW(TAG, "Motor %d open circuit: %.1f mA < %.1f mA for %" PRIu32 "ms",
               current_zone_ + 1, current_filtered_ma_,
               motor_cfg_.low_current_threshold_ma, motor_cfg_.low_current_window_ms);
      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      telemetry_[current_zone_].present = false;
      telemetry_[current_zone_].presence_known = true;
      xSemaphoreGive(telemetry_mutex_);
      trigger_fault_(FaultCode::OPEN_CIRCUIT, "no current — valve not connected");
    }
  } else {
    low_current_count_ = 0;
  }
}

void Lv6ValveController::detect_pin_engagement_() {
  if (!pin_detect_enabled_ || pin_detected_)
    return;

  // Only detect during close direction
  if (current_dir_ != MotorDirection::CLOSE)
    return;

  // On Rev 3.2 the stroke tracker already separates pin contact from the seat,
  // and it does so on cadence recovery rather than on current magnitude alone.
  // Take its answer instead of running a second, weaker detector against a
  // fixed time anchor that has no meaning without a boost phase.
  if (rev32_backend_ != nullptr) {
    if (!stroke_.contact_seen())
      return;
    pin_detected_ = true;
    pin_detected_ripples_ = stroke_.contact_count();
    ESP_LOGI(TAG, "Motor %d pin contact at commutation %" PRIu32
             " (free travel %.1f mA, peak %.1f mA)",
             current_zone_ + 1, pin_detected_ripples_, stroke_.baseline_ma(),
             stroke_.peak_ma());
    return;
  }

  // Wait for current to settle after boost
  if (motor_run_time_ms_ < ENDSTOP_MIN_RUNTIME_MS)
    return;

  // Set baseline from first settled reading
  if (!pin_detect_baseline_set_) {
    pin_detect_baseline_ma_ = current_filtered_ma_;
    pin_detect_baseline_set_ = true;
    return;
  }

  // Look for sustained current increase above baseline
  if (current_filtered_ma_ > pin_detect_baseline_ma_ + motor_cfg_.pin_engage_step_ma) {
    if (pin_detect_sustained_ < 255)
      pin_detect_sustained_++;
  } else {
    pin_detect_sustained_ = 0;
  }

  if (pin_detect_sustained_ >= PIN_ENGAGE_DEBOUNCE_TICKS) {
    pin_detected_ = true;
    pin_detected_ripples_ = get_motion_count_();
    ESP_LOGI(TAG, "Motor %d pin engagement at ripple %" PRIu32
             " (baseline=%.1f mA, current=%.1f mA)",
             current_zone_ + 1, pin_detected_ripples_,
             pin_detect_baseline_ma_, current_filtered_ma_);

    // Re-baseline the close endstop detection to the seating onset. The detection
    // baseline was captured during pre-engagement free travel (~13-15 mA), so the
    // gentle current rise right at pin contact trips the slope path within ~1s and
    // stops the valve barely seated ("caught on pin engagement"). Re-anchoring the
    // threshold/slope to the engagement current — and clearing the debouncers so the
    // contact step itself can't fire — forces detection onto the HARD-seat ramp that
    // climbs ABOVE contact, so the valve compresses fully onto its seat. Only runs
    // when a real pin step was seen (an already-engaged start never gets here and
    // keeps the prior behavior). Safety nets (hard cap, runtime cap) are unchanged.
    if (calibrating_) {
      cal_baseline_set_ = false;
      endstop_high_count_ = 0;
      hard_cap_high_count_ = 0;
      slope_initialized_ = false;
      slope_endstop_windows_ = 0;
    }
  }
}

void Lv6ValveController::trigger_fault_(FaultCode code, const char *reason) {
  ESP_LOGE(TAG, "Motor %d FAULT: %s (%s)", current_zone_ + 1,
           fault_code_to_string(code), reason);
  current_fault_code_ = code;

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  telemetry_[current_zone_].last_fault_code = code;
  telemetry_[current_zone_].last_learning_sample_valid = false;
  xSemaphoreGive(telemetry_mutex_);

  if (code == FaultCode::BLOCKED || code == FaultCode::OPEN_CIRCUIT ||
      code == FaultCode::MECHANICAL_OVERRUN) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    telemetry_[current_zone_].blocked = true;
    xSemaphoreGive(telemetry_mutex_);
  }

  stop_motor_(false);
}

// =============================================================================
// Relearn Trigger — periodic check for recalibration need
// =============================================================================

void Lv6ValveController::check_relearn_triggers_() {
  if (!config_store_)
    return;

  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  if (now_ms - last_relearn_check_ms_ < RELEARN_CHECK_INTERVAL_MS)
    return;
  last_relearn_check_ms_ = now_ms;

  // Don't queue relearn if a calibration is already pending or running
  if (calibration_request_ >= 0 || calibrating_)
    return;

  const auto cfg = config_store_->get_config();

  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (!cfg.zones[z].enabled)
      continue;

    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    const auto &t = telemetry_[z];

    // Skip zones that haven't been learned, are blocked, or not present
    if (t.learned_open_ms == 0 || t.blocked || !t.present) {
      xSemaphoreGive(telemetry_mutex_);
      continue;
    }

    bool needs_relearn = false;
    const char *reason = "";

    // Movement count trigger
    if (motor_cfg_.relearn_after_movements > 0 &&
        t.movements_since_learn >= motor_cfg_.relearn_after_movements) {
      needs_relearn = true;
      reason = "movement count";
    }

    // Time-based trigger (hours since last learn)
    if (!needs_relearn && motor_cfg_.relearn_after_hours > 0 && t.last_learn_ms > 0) {
      uint32_t elapsed_ms = now_ms - t.last_learn_ms;
      uint32_t limit_ms = motor_cfg_.relearn_after_hours * 3600000UL;
      if (elapsed_ms >= limit_ms) {
        needs_relearn = true;
        reason = "time elapsed";
      }
    }

    uint32_t moves = t.movements_since_learn;
    uint32_t last_ms = t.last_learn_ms;
    xSemaphoreGive(telemetry_mutex_);

    if (needs_relearn) {
      uint32_t hours_since = (t.last_learn_ms > 0) ? (now_ms - last_ms) / 3600000UL : 0;
      ESP_LOGI(TAG, "Zone %d relearn triggered (%s: %" PRIu32 " moves, %" PRIu32 "h since last)",
               z + 1, reason, moves, hours_since);
      calibration_request_ = static_cast<int8_t>(z);
      return;  // one at a time
    }
  }
}

// =============================================================================
// Fast Motor Loop (1ms) — ADC sampling + ripple detection
// =============================================================================

void Lv6ValveController::motor_loop_() {
  if (!motor_turning_)
    return;

  // 1 ms: the absolute current cap. The ripple task raises this from a DMA
  // frame's peak, so the drive comes off within a millisecond instead of
  // waiting out the 10 ms FSM tick and its 2-tick debounce. On the closing hard
  // stop that difference is stall torque into a rigid stop, and the damage
  // mechanism is torque times duration.
  if (hard_cap_tripped_.exchange(false, std::memory_order_relaxed)) {
    if (drive_output_enabled_) {
      if (gpio_backend_)
        gpio_backend_->coast();
      drive_output_enabled_ = false;
    }
    trigger_fault_(FaultCode::OVERCURRENT,
                   "absolute current cap reached (fast DMA path)");
    return;
  }

  // 10ms: run full FSM tick (endstop, fault detection, PWM cycling)
  fsm_tick_count_++;
  if (fsm_tick_count_ >= TICKS_PER_FSM) {
    fsm_tick_count_ = 0;
    process_tick_();
  }
}

// =============================================================================
// Ripple counter — DMA processor task
// =============================================================================

void Lv6ValveController::ripple_task_func_(void *arg) {
  static_cast<Lv6ValveController *>(arg)->run_ripple_task_();
}

void Lv6ValveController::run_ripple_task_() {
  while (true) {
    // Sleep until the ISR callback wakes us when a DMA frame is ready
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);

    if (!adc_continuous_handle_ || !ripple_enabled_)
      continue;

    uint32_t bytes_read = 0;
    auto *h = static_cast<adc_continuous_handle_t>(adc_continuous_handle_);
    esp_err_t ret = adc_continuous_read(
        h, adc_frame_buf_, RIPPLE_DMA_FRAME_BYTES, &bytes_read, 0 /* non-blocking */);
    if (ret != ESP_OK || bytes_read == 0)
      continue;

    const uint32_t n_frames = bytes_read / sizeof(adc_digi_output_data_t);
    const auto *frames = reinterpret_cast<const adc_digi_output_data_t *>(adc_frame_buf_);
    const int expected_chan = ipropi_channel_;

    float sum_ma     = 0.0f;
    uint32_t n_valid = 0;
    int last_raw     = -1;
    float peak_ma    = 0.0f;

    for (uint32_t i = 0; i < n_frames; ++i) {
      // ESP32-S3 TYPE2 output format
      const int chan = static_cast<int>(frames[i].type2.channel);

      // Rev 3.2 interleaves TACHO_AMP into the same stream. It is the analog
      // cross-check on the hardware commutation count and must never reach the
      // endpoint decision, so it is counted separately and only published.
      if (chan == tacho_adc_channel_) {
        const uint16_t tacho_raw = frames[i].type2.data & 0x0FFFu;
        tacho_adc_raw_.store(tacho_raw, std::memory_order_relaxed);
        if (tacho_adc_counter_ != nullptr &&
            drive_output_enabled_.load(std::memory_order_relaxed) &&
            dma_debounce_remaining_ == 0) {
          tacho_adc_counter_->update(tacho_raw);
          tacho_adc_count_.store(tacho_adc_counter_->getRippleCount(),
                                 std::memory_order_relaxed);
        }
        continue;
      }

      if (chan != expected_chan)
        continue;

      const uint16_t raw = frames[i].type2.data & 0x0FFFu;  // 12-bit value

      // --- PWM drive gate (replaces legacy drive_output_enabled_ check) ---
      // Track drive_output_enabled_ transitions to apply per-transition debounce,
      // matching the original sample_ripple_() behaviour for the HOLD/coast phase.
      if (!drive_output_enabled_.load(std::memory_order_relaxed)) {
        ripple_drive_was_on_ = false;
        continue;  // IPROPI reads zero during coast — skip to avoid corrupting filters
      }
      if (!ripple_drive_was_on_) {
        // Drive just turned on — apply inrush debounce. On Rev 3.2 the drive is
        // continuous, so this fires exactly once per move and becomes the
        // mandatory 250 ms tacho blanking: the AC-coupled front end saturates on
        // the drive-start step and emits spurious edges for about that long.
        ripple_drive_was_on_  = true;
        dma_debounce_remaining_ = dma_debounce_samples_;
      }
      if (dma_debounce_remaining_ > 0) {
        --dma_debounce_remaining_;
        continue;
      }

      // --- Feed sample to ripple counter ---
      // On Rev 3.2 the commutation count comes from PCNT on COMM_TACHO_N, not
      // from this filter — the current ripple is at the ADC noise floor there,
      // which is why the analog tacho chain exists at all.
      const float sample_ma = adc_raw_to_ma_(static_cast<int>(raw));
      if (rev32_backend_ == nullptr)
        ripple_counter_.update(raw);
      sum_ma  += sample_ma;
      if (sample_ma > peak_ma)
        peak_ma = sample_ma;
      last_raw = static_cast<int>(raw);
      ++n_valid;
    }

    if (n_valid > 0) {
      latest_current_ma_ = sum_ma / static_cast<float>(n_valid);
      if (rev32_backend_ != nullptr) {
        rev32_backend_->publish_current_ma(latest_current_ma_);
        // The absolute cap decided here rather than at the 10 ms FSM tick with a
        // 2-tick debounce: on the closing hard stop the 20 ms difference is
        // stall torque into a rigid stop, and torque x duration is exactly the
        // damage mechanism. The frame is already a ~64-sample average window, so
        // a single noisy conversion cannot trip it.
        if (peak_ma > ENDSTOP_HARD_CAP_MA)
          hard_cap_tripped_.store(true, std::memory_order_relaxed);
      } else {
        live_ripple_count_.store(ripple_counter_.getRippleCount(),
                                 std::memory_order_relaxed);
      }
      if (last_raw >= 0)
        trace_sample_(last_raw, latest_current_ma_);
    }
  }
}


float Lv6ValveController::adc_raw_to_ma_(int raw) {
  if (adc_cali_handle_) {
    int voltage_mv = 0;
    auto ch = static_cast<adc_cali_handle_t>(adc_cali_handle_);
    if (adc_cali_raw_to_voltage(ch, raw, &voltage_mv) == ESP_OK)
      return static_cast<float>(voltage_mv) / 1000.0f * volts_to_ma_();
  }
  // Fallback: uncalibrated linear approximation against the channel's nominal
  // full scale — 1.75 V at 6 dB, 3.1 V at 12 dB.
  const float full_scale_v = adc_current_atten_ == ADC_ATTEN_DB_6 ? 1.75f : 3.1f;
  const float voltage = (static_cast<float>(raw) / 4095.0f) * full_scale_v;
  return voltage * volts_to_ma_();
}

float Lv6ValveController::volts_to_ma_() const {
  // Rev 3.2: INA180A1 at gain 20 into a 0.5 ohm shunt is 10 V/A, so 1 V is
  // 100 mA. The DRV8215 path divides by its IPROPI current-mirror constant
  // instead — a different measurement entirely, on a different pin.
  return rev32_backend_ != nullptr ? 100.0f : 1.0f / IPROPI_DIVISOR;
}

float Lv6ValveController::read_current_ma_() {
  if (gpio_backend_enabled_ && gpio_backend_) {
    // Rev 3.2's current already arrives from the DMA stream at frame rate, so
    // there is nothing to read here — reading it back through the backend would
    // just be a round trip. Rev 3.1 still owns its own oneshot ADC.
    if (rev32_backend_ == nullptr)
      latest_current_ma_ = gpio_backend_->read_current_ma();
    motor_diag_current_ma_x10_.store(
        static_cast<int32_t>(std::lround(latest_current_ma_ * 10.0f)),
        std::memory_order_relaxed);
    return latest_current_ma_;
  }
  // With DMA ripple task running, latest_current_ma_ is updated at ~60 Hz
  // (per 17 ms frame) — more than sufficient for the 10 ms FSM tick.
  if (ripple_enabled_)
    return latest_current_ma_;
  // Fallback: ESPHome ADC sensor (updated from main loop, slower)
  if (current_sensor_ && current_sensor_->has_state()) {
    float voltage = current_sensor_->state;
    return voltage / IPROPI_DIVISOR;
  }
  return 0.0f;
}

void Lv6ValveController::set_nsleep_(bool enabled) {
  if (gpio_backend_enabled_) {
    // MOTOR_ENABLE is a per-move decoder gate, not a global nSLEEP.
    // A generic enable request only arms policy; it must never energize a motor.
    if (!enabled && gpio_backend_)
      gpio_backend_->coast();
    return;
  }
  gpio_set_level(nsleep_pin_, enabled ? 1 : 0);
}

bool Lv6ValveController::read_nfault_() {
  if (gpio_backend_enabled_ && gpio_backend_)
    return !gpio_backend_->fault_latched();
  return gpio_get_level(nfault_pin_) == 1;
}

uint32_t Lv6ValveController::get_motion_count_() const {
  if (gpio_backend_enabled_ && gpio_backend_)
    return gpio_backend_->motion_evidence_count();
  return ripple_counter_.getRippleCount();
}

void Lv6ValveController::save_telemetry_(uint8_t zone) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  MotorTelemetry copy = telemetry_[zone];
  xSemaphoreGive(telemetry_mutex_);
  config_store_->save_motor_telemetry(zone, copy);
}

// =============================================================================
// Calibration — double-pass (close→open→close) like VdMot
// =============================================================================

uint32_t Lv6ValveController::calibration_pass_(uint8_t zone, MotorDirection dir) {
  // Enable pin engagement detection during close passes
  pin_detect_enabled_ = (dir == MotorDirection::CLOSE);

  if (!start_motor_(zone, dir))
    return 0;

  // Calibration runs at full hold duty the whole way — NO soft-approach. Soft-approach
  // drops to ~40% duty near the stop, which these low-torque valve motors cannot push
  // through, so the pass stalls short and runs to the runtime cap (MECHANICAL_OVERRUN).
  // It also engaged off stale learned strokes (progress jumped to 80% immediately on a
  // short stored value). The rotation-stall + already-at-stop paths ease the endstop
  // contact instead, and soft-approach remains active only for normal operating moves.

  while (motor_turning_) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));
  }

  pin_detect_enabled_ = false;

  uint32_t elapsed = motor_run_time_ms_;

  // If a fault occurred (open circuit, timeout, etc.) return 0 to signal failure
  if (current_fault_code_ != FaultCode::NONE) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    telemetry_[zone].last_learning_sample_valid = false;
    xSemaphoreGive(telemetry_mutex_);
    ESP_LOGW(TAG, "Calibration pass %s zone %d fault: %s",
             dir == MotorDirection::CLOSE ? "CLOSE" : "OPEN",
             zone + 1, fault_code_to_string(current_fault_code_));
    return 0;
  }

  // Update the per-direction mean current from this pass
  if (current_count_ > 0) {
    float avg = current_sum_ / static_cast<float>(current_count_);
    float &m = mean_current_(zone, dir);
    m = (m + avg) / 2.0f;
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    if (dir == MotorDirection::OPEN)
      telemetry_[zone].mean_open_current_ma = m;
    else
      telemetry_[zone].mean_close_current_ma = m;
    telemetry_[zone].mean_current_ma = m;
    xSemaphoreGive(telemetry_mutex_);
    // update_learned_factor_() takes telemetry_mutex_ — call it after releasing.
    update_learned_factor_(zone, dir, avg, current_peak_ma_, true);
  }

  ESP_LOGI(TAG, "Calibration pass %s zone %d: %" PRIu32 "ms, %" PRIu32 " ripples",
           dir == MotorDirection::CLOSE ? "CLOSE" : "OPEN",
           zone + 1, elapsed, get_motion_count_());

  vTaskDelay(pdMS_TO_TICKS(500));
  return elapsed;
}

void Lv6ValveController::run_calibration_(uint8_t zone) {
  if (zone >= NUM_ZONES || motor_turning_ || !drivers_enabled_)
    return;

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  bool present = telemetry_[zone].present;
  xSemaphoreGive(telemetry_mutex_);

  // If cached as not-present, do a live re-probe before skipping — startup
  // I2C scans can miss a motor transiently during driver wakeup.
  if (!present && i2c_bus_ != nullptr) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(motor_addresses_[zone]);
    if (dev.write(nullptr, 0) == esphome::i2c::ERROR_OK) {
      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      telemetry_[zone].present = true;
      telemetry_[zone].presence_known = true;
      xSemaphoreGive(telemetry_mutex_);
      present = true;
      ESP_LOGI(TAG, "Calibration zone %d: motor presence recovered on I2C (addr 0x%02X)",
               zone + 1, motor_addresses_[zone]);
    }
  }

  if (!present) {
    ESP_LOGW(TAG, "Calibration zone %d skipped: motor not present on I2C (addr 0x%02X)",
             zone + 1, motor_addresses_[zone]);
    return;
  }

  // Drop stale queued movement commands so calibration runs in a strictly
  // controlled sequence and doesn't execute delayed UI commands afterward.
  uint32_t dropped_cmds = 0;
  if (cmd_queue_) {
    ValveCommand stale_cmd;
    while (xQueueReceive(cmd_queue_, &stale_cmd, 0) == pdTRUE)
      dropped_cmds++;
  }
  if (dropped_cmds > 0) {
    ESP_LOGW(TAG, "Calibration zone %d: dropped %" PRIu32 " queued move command(s)",
             zone + 1, dropped_cmds);
  }

  // Calibration can run for tens of seconds; modestly boost this task's
  // priority so it preempts non-critical app work on the same core. Keep the
  // boost well below the ESP-IDF system services (esp_timer ~22, WiFi ~23,
  // IPC 24) — outranking those while a pass runs for seconds can starve them
  // and the ESPHome loop task, tripping the (panic-enabled) task watchdog.
  UBaseType_t original_prio = uxTaskPriorityGet(nullptr);
  UBaseType_t boosted_prio = original_prio;
  UBaseType_t safe_ceiling = (configMAX_PRIORITIES > 2) ? (configMAX_PRIORITIES - 2) : original_prio;
  UBaseType_t target_prio = std::min<UBaseType_t>(CALIBRATION_BOOST_PRIORITY, safe_ceiling);
  if (target_prio > boosted_prio)
    boosted_prio = target_prio;
  if (boosted_prio != original_prio)
    vTaskPrioritySet(nullptr, boosted_prio);

  calibrating_ = true;

  ESP_LOGI(TAG, "Calibrating zone %d (double-pass, ripple=%s, prio=%u->%u)",
           zone + 1, ripple_enabled_ ? "yes" : "no",
           static_cast<unsigned>(original_prio), static_cast<unsigned>(boosted_prio));

  uint8_t max_retries = motor_cfg_.calibration_max_retries;
  uint32_t min_travel = motor_cfg_.calibration_min_travel_ms;

  for (uint8_t attempt = 0; attempt <= max_retries; attempt++) {
    // Pass 1: close fully (reach the known closed reference). Closing is the
    // high-current direction, so its endstop is the reliable one to detect — VdMot
    // calibrates close-first for the same reason. A valve already at the closed stop
    // is caught fast by the already-at-stop path (zero ripples after boost + current
    // present) so we no longer over-drive a closed valve into its stop and pop the
    // actuator socket off the pin.
    uint32_t close1_ms = calibration_pass_(zone, MotorDirection::CLOSE);
    if (close1_ms == 0) {
      ESP_LOGW(TAG, "Calibration zone %d: initial close failed", zone + 1);
      break;
    }

    // Pass 2: open fully (measure opening travel)
    uint32_t open_ms = calibration_pass_(zone, MotorDirection::OPEN);
    uint32_t open_ripples = get_motion_count_();
    if (open_ms == 0) {
      ESP_LOGW(TAG, "Calibration zone %d: open pass failed", zone + 1);
      break;
    }

    // Pass 3: close fully again (measure closing travel + compute deadzone)
    uint32_t close2_ms = calibration_pass_(zone, MotorDirection::CLOSE);
    uint32_t close2_ripples = get_motion_count_();
    if (close2_ms == 0) {
      ESP_LOGW(TAG, "Calibration zone %d: second close failed", zone + 1);
      break;
    }

    ESP_LOGI(TAG, "Calibration zone %d: close1=%" PRIu32 "ms open=%" PRIu32 "ms/%" PRIu32 "r close2=%" PRIu32 "ms/%" PRIu32 "r",
             zone + 1, close1_ms, open_ms, open_ripples, close2_ms, close2_ripples);

    if (open_ms >= min_travel && close2_ms >= min_travel) {
      int32_t deadzone = static_cast<int32_t>(close2_ms) - static_cast<int32_t>(open_ms);

      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      auto &t = telemetry_[zone];
      t.learned_open_ms = open_ms;
      t.learned_close_ms = close2_ms;
      t.learned_open_ripples = open_ripples;
      t.learned_close_ripples = close2_ripples;
      t.deadzone_ms = deadzone;
      t.mean_open_current_ma = mean_open_currents_[zone];
      t.mean_close_current_ma = mean_close_currents_[zone];
      t.mean_current_ma = mean_close_currents_[zone];  // valve closed after pass 3
      t.drift_percent = 0.0f;
      t.movements_since_learn = 0;
      t.last_learn_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
      t.calibration_retries = attempt;
      t.blocked = false;
      t.current_position_pct = 0.0f;  // valve is closed after double-pass
      // Store pin engagement from close2 pass (if detected)
      if (pin_detected_ && pin_detected_ripples_ > 0) {
        t.pin_engage_close_ripples = pin_detected_ripples_;
        // Seating depth: commutations from pin contact to the hard stop. This is
        // the tightest endpoint window closing has, because it does not depend
        // on where the move started — unlike the full stroke.
        if (close2_ripples > pin_detected_ripples_)
          t.contact_to_stop_close_ripples = close2_ripples - pin_detected_ripples_;
      }
      xSemaphoreGive(telemetry_mutex_);

      save_telemetry_(zone);
      ESP_LOGI(TAG, "Calibration zone %d OK: open=%" PRIu32 "ms/%" PRIu32 "r close=%" PRIu32 "ms/%" PRIu32 "r dz=%" PRId32 "ms",
               zone + 1, open_ms, open_ripples, close2_ms, close2_ripples, deadzone);
      if (pin_detected_ && pin_detected_ripples_ > 0) {
        ESP_LOGI(TAG, "  Pin engagement at ripple %" PRIu32 " from open end (margin=%" PRIu16 " ensures full disengage at 100%% flow)",
                 pin_detected_ripples_, motor_cfg_.pin_engage_margin_ripples);
      } else {
        ESP_LOGW(TAG, "  Pin engagement not detected (step threshold %.1f mA)",
                 motor_cfg_.pin_engage_step_ma);
      }
      calibrating_ = false;
      if (boosted_prio != original_prio)
        vTaskPrioritySet(nullptr, original_prio);
      return;
    }

    ESP_LOGW(TAG, "Calibration zone %d attempt %d: travel too short (open=%" PRIu32 "ms close=%" PRIu32 "ms min=%" PRIu32 "ms)",
             zone + 1, attempt + 1, open_ms, close2_ms, min_travel);
  }

  bool has_previous_learning = false;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  has_previous_learning = telemetry_[zone].learned_open_ms > 0 && telemetry_[zone].learned_close_ms > 0;
  // Keep previously working zones operational if relearn fails.
  // Only hard-block when we have no learned fallback for this valve.
  telemetry_[zone].blocked = !has_previous_learning;
  xSemaphoreGive(telemetry_mutex_);

  if (has_previous_learning) {
    ESP_LOGW(TAG, "Calibration zone %d FAILED after %d attempts; keeping previous learned profile and leaving zone unblocked",
             zone + 1, max_retries + 1);
  } else {
    ESP_LOGE(TAG, "Calibration zone %d FAILED after %d attempts", zone + 1, max_retries + 1);
  }
  calibrating_ = false;
  if (boosted_prio != original_prio)
    vTaskPrioritySet(nullptr, original_prio);
}

// =============================================================================
// Motor Trace Buffer — High-rate CSV export for diagnostics
// =============================================================================

void Lv6ValveController::trace_reset_() {
  if (trace_mutex_ == nullptr)
    return;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  trace_write_index_ = 0;
  trace_wrapped_ = false;
  trace_start_us_ = esp_timer_get_time();
  trace_last_sample_us_ = trace_start_us_;
  xSemaphoreGive(trace_mutex_);
}

void Lv6ValveController::trace_sample_(int raw_adc, float current_ma) {
  if (trace_mutex_ == nullptr || trace_samples_ == nullptr)
    return;

  uint32_t now_us = esp_timer_get_time();
  if (now_us - trace_last_sample_us_ < TRACE_SAMPLE_PERIOD_US)
    return;  // Not enough time elapsed for next sample

  trace_last_sample_us_ = now_us;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);

  MotorTraceSample &sample = trace_samples_[trace_write_index_];
  sample.t_ms = static_cast<uint32_t>((now_us - trace_start_us_) / 1000);
  sample.ripple_count = live_ripple_count_.load(std::memory_order_relaxed);
  sample.current_ma_x10 = static_cast<int16_t>(current_ma * 10.0f);
  sample.adc_raw = raw_adc < 0 ? 0xFFFF : static_cast<uint16_t>(raw_adc & 0x0FFF);
  sample.armed = motor_diag_armed_.load(std::memory_order_relaxed);
  sample.direction_open = current_dir_ == MotorDirection::OPEN ? 1 : 0;

  // The buffer is reused, so every revision-specific column is reset to its
  // unused sentinel before the active backend fills its own.  A stale BEMF
  // reading carried into a Rev 3.2 trace would look like real data.
  sample.bemf_raw_a = 0xFFFF;
  sample.bemf_raw_b = 0xFFFF;
  sample.bemf_differential_raw = 0;
  sample.bemf_separation_us = 0xFFFF;
  sample.bemf_valid = 0;
  sample.bemf_moving = 0;
  sample.invalid_bemf_samples = 0;
  sample.tacho_period_us = 0;
  sample.tacho_amp_raw = 0xFFFF;
  sample.stroke_phase = 0;

  if (rev32_backend_) {
    sample.tacho_period_us = motor_diag_tacho_period_us_.load(std::memory_order_relaxed);
    sample.tacho_amp_raw = tacho_adc_raw_.load(std::memory_order_relaxed);
    sample.stroke_phase = motor_diag_stroke_phase_.load(std::memory_order_relaxed);
  } else if (rev31_backend_) {
    sample.bemf_raw_a = rev31_diag_raw_a_.load(std::memory_order_relaxed);
    sample.bemf_raw_b = rev31_diag_raw_b_.load(std::memory_order_relaxed);
    sample.bemf_differential_raw =
        rev31_diag_differential_.load(std::memory_order_relaxed);
    sample.bemf_separation_us =
        rev31_diag_separation_us_.load(std::memory_order_relaxed);
    sample.bemf_valid = rev31_diag_sample_valid_.load(std::memory_order_relaxed);
    sample.bemf_moving = rev31_diag_sample_moving_.load(std::memory_order_relaxed);
    sample.invalid_bemf_samples =
        rev31_diag_invalid_samples_.load(std::memory_order_relaxed);
  }
  sample.drive_on = drive_output_enabled_ ? 1 : 0;

  trace_write_index_++;
  if (trace_write_index_ >= TRACE_MAX_SAMPLES) {
    trace_write_index_ = 0;
    trace_wrapped_ = true;
  }

  xSemaphoreGive(trace_mutex_);
}

uint16_t Lv6ValveController::get_motor_trace_sample_count() const {
  if (trace_mutex_ == nullptr)
    return 0;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  uint16_t count = trace_wrapped_ ? TRACE_MAX_SAMPLES : trace_write_index_;
  xSemaphoreGive(trace_mutex_);
  return count;
}

bool Lv6ValveController::get_motor_trace_sample(
    uint16_t logical_index, MotorTraceSample *out) const {
  if (trace_mutex_ == nullptr || trace_samples_ == nullptr || out == nullptr)
    return false;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  const uint16_t count = trace_wrapped_ ? TRACE_MAX_SAMPLES : trace_write_index_;
  if (logical_index >= count) {
    xSemaphoreGive(trace_mutex_);
    return false;
  }
  const uint16_t oldest = trace_wrapped_ ? trace_write_index_ : 0;
  const uint16_t physical_index = static_cast<uint16_t>(
      (oldest + logical_index) % TRACE_MAX_SAMPLES);
  *out = trace_samples_[physical_index];
  xSemaphoreGive(trace_mutex_);
  return true;
}

void Lv6ValveController::clear_motor_trace() {
  if (trace_mutex_ == nullptr)
    return;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  trace_write_index_ = 0;
  trace_wrapped_ = false;
  if (trace_samples_ != nullptr)
    memset(trace_samples_, 0, TRACE_MAX_SAMPLES * sizeof(MotorTraceSample));
  xSemaphoreGive(trace_mutex_);
}

MotorSafetyDiagnostics Lv6ValveController::get_motor_safety_diagnostics() const {
  MotorSafetyDiagnostics result;
  result.backend_enabled = gpio_backend_enabled_;
  result.backend = gpio_backend_ ? gpio_backend_->backend_name() : "drv8215_i2c";
  result.motor_busy = motor_turning_.load(std::memory_order_acquire);
  result.drive_on = drive_output_enabled_.load(std::memory_order_acquire);
  result.drivers_enabled = drivers_enabled_.load(std::memory_order_acquire);
  result.latch_faulted = gpio_backend_enabled_ &&
      (!gpio_backend_ || gpio_backend_->fault_latched());
  result.sample_valid = rev31_diag_sample_valid_.load(std::memory_order_relaxed) != 0;
  result.sample_moving = rev31_diag_sample_moving_.load(std::memory_order_relaxed) != 0;
  result.bemf_raw_a = rev31_diag_raw_a_.load(std::memory_order_relaxed);
  result.bemf_raw_b = rev31_diag_raw_b_.load(std::memory_order_relaxed);
  result.bemf_differential_raw = rev31_diag_differential_.load(std::memory_order_relaxed);
  result.sample_separation_us = rev31_diag_separation_us_.load(std::memory_order_relaxed);
  result.bemf_threshold_raw = bemf_threshold_raw_;
  result.consecutive_invalid_samples =
      rev31_diag_invalid_samples_.load(std::memory_order_relaxed);
  result.motion_evidence_count =
      motor_diag_evidence_count_.load(std::memory_order_relaxed);
  result.sample_sequence = motor_diag_sample_sequence_.load(std::memory_order_relaxed);
  result.motor_runtime_ms = motor_diag_runtime_ms_.load(std::memory_order_relaxed);
  result.current_ma = static_cast<float>(
      motor_diag_current_ma_x10_.load(std::memory_order_relaxed)) / 10.0f;
  result.armed = motor_diag_armed_.load(std::memory_order_relaxed) != 0;
  result.decoder_address = motor_diag_decoder_address_.load(std::memory_order_relaxed);
  result.tacho_period_us = motor_diag_tacho_period_us_.load(std::memory_order_relaxed);
  result.tacho_cadence_us = motor_diag_tacho_cadence_us_.load(std::memory_order_relaxed);
  result.tacho_rejected = motor_diag_tacho_rejected_.load(std::memory_order_relaxed);
  result.tacho_hardware_count = motor_diag_tacho_hardware_.load(std::memory_order_relaxed);
  result.tacho_amp_raw = tacho_adc_raw_.load(std::memory_order_relaxed);
  result.tacho_adc_count = tacho_adc_count_.load(std::memory_order_relaxed);
  result.stroke_phase = motor_diag_stroke_phase_.load(std::memory_order_relaxed);
  result.fault = current_fault_code_.load(std::memory_order_acquire);
  return result;
}

}  // namespace lv6
