#include "rev32_motor_backend.h"

#include "esphome/core/hal.h"
#include "esphome/core/log.h"
#include "esp_rom_sys.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include <inttypes.h>

namespace lv6 {

static const char *const TAG = "lv6_rev32_motor";

void Rev32MotorBackend::delay_us_(uint32_t microseconds) const {
  esp_rom_delay_us(microseconds);
}

void Rev32MotorBackend::delay_ms_(uint32_t milliseconds) const {
  // ESPHome pins CONFIG_FREERTOS_HZ at 1000, so a millisecond is a tick.  The
  // floor of one tick keeps this honest if that ever changes.
  TickType_t ticks = pdMS_TO_TICKS(milliseconds);
  vTaskDelay(ticks == 0 ? 1 : ticks);
}

bool Rev32MotorBackend::configure_tacho_() {
  pcnt_unit_config_t unit_cfg = {};
  unit_cfg.low_limit = -1;
  unit_cfg.high_limit = PCNT_HIGH_LIMIT;
  // A full stroke is 659-1048 commutations, so the 16-bit counter would not
  // wrap on its own; accumulating on the watch point makes that independent of
  // how long a learning move runs.
  unit_cfg.flags.accum_count = 1;
  if (pcnt_new_unit(&unit_cfg, &pcnt_unit_) != ESP_OK) {
    ESP_LOGE(TAG, "PCNT unit for COMM_TACHO_N unavailable");
    return false;
  }

  pcnt_glitch_filter_config_t filter_cfg = {};
  filter_cfg.max_glitch_ns = PCNT_GLITCH_NS;
  if (pcnt_unit_set_glitch_filter(pcnt_unit_, &filter_cfg) != ESP_OK)
    return false;

  pcnt_chan_config_t chan_cfg = {};
  chan_cfg.edge_gpio_num = static_cast<int>(pins_.comm_tacho);
  chan_cfg.level_gpio_num = -1;
  if (pcnt_new_channel(pcnt_unit_, &chan_cfg, &pcnt_channel_) != ESP_OK)
    return false;

  // COMM_TACHO_N is open-collector with a pull-up to 3V3_LOGIC, so a
  // commutation event is a falling edge.  Counting one edge per event keeps
  // the count directly comparable to the measured 659/1048 stroke figures.
  if (pcnt_channel_set_edge_action(pcnt_channel_,
                                   PCNT_CHANNEL_EDGE_ACTION_HOLD,
                                   PCNT_CHANNEL_EDGE_ACTION_INCREASE) != ESP_OK)
    return false;

  if (pcnt_unit_add_watch_point(pcnt_unit_, PCNT_HIGH_LIMIT) != ESP_OK ||
      pcnt_unit_enable(pcnt_unit_) != ESP_OK ||
      pcnt_unit_clear_count(pcnt_unit_) != ESP_OK ||
      pcnt_unit_start(pcnt_unit_) != ESP_OK)
    return false;

  return true;
}

bool Rev32MotorBackend::setup() {
  gpio_reset_pin(pins_.latch_arm);
  gpio_reset_pin(pins_.motor_enable);
  gpio_reset_pin(pins_.latch_state);

  const uint64_t output_mask = (1ULL << pins_.address0) |
                               (1ULL << pins_.address1) |
                               (1ULL << pins_.address2) |
                               (1ULL << pins_.address3) |
                               (1ULL << pins_.motor_enable);
  gpio_config_t outputs = {};
  outputs.pin_bit_mask = output_mask;
  // INPUT_OUTPUT, not OUTPUT: gpio_get_level() on a pure output returns 0
  // because the input buffer is disabled, so the decoder-address readback in
  // the diagnostics and in probe_decoder() would report 0000 for every address.
  // Driving is unaffected; this only enables the input path as well.
  outputs.mode = GPIO_MODE_INPUT_OUTPUT;
  outputs.pull_up_en = GPIO_PULLUP_DISABLE;
  outputs.pull_down_en = GPIO_PULLDOWN_ENABLE;
  if (gpio_config(&outputs) != ESP_OK)
    return false;

  if (!configure_latch_arm_gpio_())
    return false;

  // Address 0 is the safest value there is: Q0-Q3 reach no bridge input, so an
  // all-low address selects nothing even if the decoder were not inhibited.
  gpio_set_level(pins_.motor_enable, 0);
  gpio_set_level(pins_.address0, 0);
  gpio_set_level(pins_.address1, 0);
  gpio_set_level(pins_.address2, 0);
  gpio_set_level(pins_.address3, 0);
  gpio_set_level(pins_.latch_arm, 0);

  gpio_config_t latch_input = {};
  latch_input.pin_bit_mask = 1ULL << pins_.latch_state;
  latch_input.mode = GPIO_MODE_INPUT;
  latch_input.pull_up_en = GPIO_PULLUP_DISABLE;
  latch_input.pull_down_en = GPIO_PULLDOWN_DISABLE;
  if (gpio_config(&latch_input) != ESP_OK)
    return false;

  // ADC1 belongs to the controller's continuous driver; the backend only owns
  // the decoder, the latch and the commutation counter. A missing PCNT unit
  // must not inhibit the latch: otherwise LATCH_ARM never pulses and bring-up
  // looks like a stuck hardware fault.
  if (!configure_tacho_())
    ESP_LOGE(TAG, "COMM_TACHO_N PCNT unavailable; latch and drive still enabled");

  ready_ = true;
  return true;
}

bool Rev32MotorBackend::configure_latch_arm_gpio_() {
  // Idempotent on purpose. This used to run gpio_hold_dis + gpio_reset_pin on
  // every arm; gpio_reset_pin disables the output driver and enables the ~45k
  // internal pull-up, so the pad drifted high through a resistor instead of
  // being driven, and the edge the coupling network saw was an RC ramp rather
  // than a 0 -> 3V3 step. Configure once, then only ever set levels.
  if (latch_arm_ready_)
    return true;

  gpio_hold_dis(pins_.latch_arm);
  gpio_config_t arm = {};
  arm.pin_bit_mask = 1ULL << static_cast<uint32_t>(pins_.latch_arm);
  // INPUT_OUTPUT so gpio_get_level() reads the pad, not a stale output latch.
  arm.mode = GPIO_MODE_INPUT_OUTPUT;
  arm.pull_up_en = GPIO_PULLUP_DISABLE;
  arm.pull_down_en = GPIO_PULLDOWN_DISABLE;
  // This is now the only call that puts LATCH_ARM into output mode, so an
  // unchecked failure here would make every later gpio_set_level a silent no-op.
  const esp_err_t err = gpio_config(&arm);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "LATCH_ARM GPIO%d config failed: %s",
             static_cast<int>(pins_.latch_arm), esp_err_to_name(err));
    return false;
  }
  latch_arm_ready_ = true;
  return true;
}

int Rev32MotorBackend::latch_arm_level() const {
  return gpio_get_level(pins_.latch_arm);
}

int Rev32MotorBackend::latch_state_level() const {
  return gpio_get_level(pins_.latch_state);
}

int Rev32MotorBackend::motor_enable_level() const {
  return gpio_get_level(pins_.motor_enable);
}

void Rev32MotorBackend::assert_arm_high() {
  gpio_set_direction(pins_.motor_enable, GPIO_MODE_OUTPUT);
  if (!configure_latch_arm_gpio_())
    return;
  gpio_set_level(pins_.motor_enable, 0);
  gpio_set_level(pins_.latch_arm, 1);
  ESP_LOGI(TAG, "LATCH_ARM GPIO%d forced HIGH (pad 10); readback=%d",
           static_cast<int>(pins_.latch_arm), gpio_get_level(pins_.latch_arm));
}

Rev32MotorBackend::ArmClockProbe Rev32MotorBackend::probe_arm_clock(uint32_t hz,
                                                                   uint32_t duration_ms,
                                                                   bool clamp) {
  ArmClockProbe result{};
  result.clamp = clamp;
  if (!configure_latch_arm_gpio_())
    return result;
  gpio_set_direction(pins_.motor_enable, GPIO_MODE_OUTPUT);
  // Q1 shorts ARM_CLK to ground while MOTOR_ENABLE is high, so every edge would
  // be swallowed and the probe would report an open path on a healthy board.
  coast();
  if (clamp) {
    // Deliberately the inverse test. Address 0 reaches no bridge input, so
    // raising MOTOR_ENABLE selects nothing even if the latch happens to be
    // armed — this energises no motor, it only closes Q1.
    gpio_set_level(pins_.address0, 0);
    gpio_set_level(pins_.address1, 0);
    gpio_set_level(pins_.address2, 0);
    gpio_set_level(pins_.address3, 0);
    gpio_set_level(pins_.motor_enable, 1);
  }

  if (hz == 0)
    hz = 100;
  if (hz > 500)
    hz = 500;
  if (duration_ms > 15000)
    duration_ms = 15000;
  // vTaskDelay resolves to whole ticks, so the half period is whole ms.
  uint32_t half_ms = 500u / hz;
  if (half_ms == 0)
    half_ms = 1;
  result.hz = 500u / half_ms;
  const uint32_t cycles = duration_ms / (2u * half_ms);

  result.latch_state_start = gpio_get_level(pins_.latch_state);
  gpio_set_level(pins_.latch_arm, 0);
  delay_ms_(ARM_SETTLE_MS);

  for (uint32_t i = 0; i < cycles; i++) {
    gpio_set_level(pins_.latch_arm, 1);
    delay_ms_(half_ms);
    if (!result.armed && gpio_get_level(pins_.latch_state) == 0) {
      result.armed = true;
      result.armed_at_cycle = i + 1;
    }
    gpio_set_level(pins_.latch_arm, 0);
    delay_ms_(half_ms);
    result.cycles = i + 1;
  }

  gpio_set_level(pins_.latch_arm, 0);
  coast();

  result.latch_state_end = gpio_get_level(pins_.latch_state);
  selection_.arm(result.latch_state_end != 0);
  ESP_LOGI(TAG,
           "ARM_CLK probe: %" PRIu32 " cycles at ~%" PRIu32 " Hz on LATCH_ARM GPIO%d, "
           "MOTOR_ENABLE %s. LATCH_STATE %d -> %d, armed=%s (first at cycle %" PRIu32 "). "
           "Measure U2 pin 1 in AC volts: with the clamp off a live R4/C4 path carries "
           "hundreds of mV; with the clamp on Q1 should collapse it to ~0.",
           result.cycles, result.hz, static_cast<int>(pins_.latch_arm),
           clamp ? "HELD HIGH (Q1 clamp test)" : "low",
           result.latch_state_start, result.latch_state_end,
           result.armed ? "yes" : "no", result.armed_at_cycle);
  return result;
}

Rev32MotorBackend::DecoderProbe Rev32MotorBackend::probe_decoder(uint8_t zone, bool reverse,
                                                                uint32_t hold_ms) {
  DecoderProbe result{};
  result.zone = zone;
  result.reverse = reverse;
  if (hold_ms > 30000)
    hold_ms = 30000;

  // MOTOR_ENABLE stays low for the whole probe. The decoder output is what we
  // want to observe; an energised bridge is not, and the drive permit may well
  // be asserted if the latch was armed by hand during bring-up.
  gpio_set_direction(pins_.motor_enable, GPIO_MODE_OUTPUT);
  coast();
  // `zone` is the 1-based channel the contract and the UI use; select() takes
  // the 0-based index the rest of the controller passes (rev32_logic.h:37).
  // Feeding it straight through silently probes the *next* channel.
  if (zone == 0 ||
      !select(static_cast<uint8_t>(zone - 1),
              reverse ? Rev32Direction::REVERSE : Rev32Direction::FORWARD)) {
    ESP_LOGE(TAG, "Decoder probe rejected zone %u %s: not in the channel map",
             static_cast<unsigned>(zone), reverse ? "reverse" : "forward");
    return result;
  }

  result.accepted = true;
  result.decoder_address = decoder_address();
  result.a0 = gpio_get_level(pins_.address0);
  result.a1 = gpio_get_level(pins_.address1);
  result.a2 = gpio_get_level(pins_.address2);
  result.a3 = gpio_get_level(pins_.address3);
  result.motor_enable = gpio_get_level(pins_.motor_enable);
  ESP_LOGI(TAG,
           "Decoder probe: zone %u %s -> address %u, A3..A0 = %d%d%d%d on "
           "GPIO%d/%d/%d/%d, MOTOR_ENABLE=%d. Holding %" PRIu32 " ms — the matching "
           "74HC4514 output should be the only one asserted.",
           static_cast<unsigned>(zone), reverse ? "REVERSE" : "FORWARD",
           static_cast<unsigned>(result.decoder_address),
           result.a3, result.a2, result.a1, result.a0,
           static_cast<int>(pins_.address3), static_cast<int>(pins_.address2),
           static_cast<int>(pins_.address1), static_cast<int>(pins_.address0),
           result.motor_enable, hold_ms);

  uint32_t remaining = hold_ms;
  while (remaining > 0) {
    const uint32_t chunk = remaining > 100 ? 100 : remaining;
    esphome::delay(chunk);
    remaining -= chunk;
  }

  // Park on address 0: Q0-Q3 reach no bridge input, so it selects nothing.
  coast();
  gpio_set_level(pins_.address0, 0);
  gpio_set_level(pins_.address1, 0);
  gpio_set_level(pins_.address2, 0);
  gpio_set_level(pins_.address3, 0);
  return result;
}

bool Rev32MotorBackend::arm_latch() {
  return pulse_arm_(ARM_EDGE_MS);
}

bool Rev32MotorBackend::arm_latch_probe() {
  return pulse_arm_(ARM_PROBE_MS, /*leave_high=*/true);
}

bool Rev32MotorBackend::pulse_arm_(uint32_t hold_ms, bool leave_high) {
  gpio_set_direction(pins_.motor_enable, GPIO_MODE_OUTPUT);
  if (!configure_latch_arm_gpio_())
    return false;

  // The arm clock is edge-coupled and clamped while MOTOR_ENABLE is high, so a
  // pulse issued on a live bridge is swallowed without any indication.  Coast
  // first, then give the 110k x 10n coupling network five time constants at the
  // low level before and after the edge.
  coast();
  const int enable_level = gpio_get_level(pins_.motor_enable);
  const int state_before = gpio_get_level(pins_.latch_state);
  gpio_set_level(pins_.latch_arm, 0);
  delay_ms_(ARM_SETTLE_MS);
  ESP_LOGI(TAG, "Driving LATCH_ARM GPIO%d HIGH for %" PRIu32 " ms — pad 10 should read 3.3 V",
           static_cast<int>(pins_.latch_arm), hold_ms);
  gpio_set_level(pins_.latch_arm, 1);
  delay_us_(20);
  const int arm_level = gpio_get_level(pins_.latch_arm);
  // U2 latches on the edge itself, so sample LATCH_STATE while the coupled pulse
  // is still fresh. Reading only after the hold cannot tell "never armed" from
  // "armed, then asynchronously reset by FAULT_N_RAW" — and those two point at
  // opposite halves of the circuit.
  delay_ms_(1);
  const int state_after_edge = gpio_get_level(pins_.latch_state);
  ESP_LOGI(TAG, "LATCH_ARM readback=%d (expect 1), LATCH_STATE 1 ms after edge=%d (expect 0)",
           arm_level, state_after_edge);
  uint32_t remaining = hold_ms;
  while (remaining > 0) {
    const uint32_t chunk = remaining > 100 ? 100 : remaining;
    esphome::delay(chunk);
    remaining -= chunk;
  }
  if (!leave_high) {
    gpio_set_level(pins_.latch_arm, 0);
    delay_ms_(ARM_SETTLE_MS);
  }

  const int state_after = gpio_get_level(pins_.latch_state);
  if (state_after_edge == 0 && state_after != 0)
    ESP_LOGE(TAG,
             "LATCH_STATE went low 1 ms after the edge and high again by the end "
             "of the %" PRIu32 " ms hold: U2 armed and was asynchronously reset. "
             "That is FAULT_N_RAW firing, not a dead arm clock.",
             hold_ms);
  if (!selection_.arm(state_after != 0)) {
    ESP_LOGE(TAG,
             "Fault latch did not arm; LATCH_STATE GPIO%d was %d before the pulse, "
             "%d at 1 ms after the edge and %d at the end (high = faulted or "
             "unarmed), MOTOR_ENABLE GPIO%d=%d, LATCH_ARM readback=%d. If readback "
             "was 0, GPIO%d never left the pad. If readback was 1 and pad 10 "
             "measures 3.3 V, the edge reached the pad but not U2's clock: scope "
             "ARM_CLK for a >2.0 V spike (R4 10k / C4 10n / R5 100k gives ~3.0 V "
             "peak, ~446 us above VIH). No spike means C4, R4 or Q1; a good spike "
             "with no arm means U2 or FAULT_N_RAW.",
             static_cast<int>(pins_.latch_state), state_before, state_after_edge,
             state_after, static_cast<int>(pins_.motor_enable), enable_level,
             arm_level, static_cast<int>(pins_.latch_arm));
    return false;
  }
  return true;
}

void Rev32MotorBackend::write_address_() {
  const uint8_t address = selection_.decoder_address();
  if (!rev32_address_is_reachable(address)) {
    // select() validates the index, so this is unreachable unless the address
    // map itself is wrong.  Leave the decoder on address 0 rather than guess.
    ESP_LOGE(TAG, "Refusing to write unreachable decoder address %u", address);
    return;
  }
  gpio_set_level(pins_.address0, address & 0x01u);
  gpio_set_level(pins_.address1, (address >> 1) & 0x01u);
  gpio_set_level(pins_.address2, (address >> 2) & 0x01u);
  gpio_set_level(pins_.address3, (address >> 3) & 0x01u);
}

bool Rev32MotorBackend::select(uint8_t index, Rev32Direction direction) {
  if (!ready_ || !selection_.select(index, direction))
    return false;
  write_address_();
  // The 4514's address latch is transparent only while inhibited.  Give the
  // address a full millisecond to settle before drive resumes.
  delay_us_(1000);
  return true;
}

bool Rev32MotorBackend::drive() {
  if (!ready_ || fault_latched()) {
    gpio_set_level(pins_.motor_enable, 0);
    selection_.observe_latch(true);
    return false;
  }
  if (!selection_.enable())
    return false;
  gpio_set_level(pins_.motor_enable, 1);
  return true;
}

void Rev32MotorBackend::coast() {
  gpio_set_level(pins_.motor_enable, 0);
  selection_.coast();
}

bool Rev32MotorBackend::fault_latched() const {
  // LATCH_STATE is the flip-flop's /Q: high means faulted *or* not armed.
  return gpio_get_level(pins_.latch_state) != 0;
}

void Rev32MotorBackend::reset_motion() {
  tacho_.reset(0);
  last_hardware_count_ = 0;
  if (pcnt_unit_)
    pcnt_unit_clear_count(pcnt_unit_);
}

void Rev32MotorBackend::poll_motion(uint32_t now_ms, bool drive_active) {
  if (!ready_ || pcnt_unit_ == nullptr)
    return;

  int hardware = 0;
  if (pcnt_unit_get_count(pcnt_unit_, &hardware) != ESP_OK)
    return;
  last_hardware_count_ = hardware < 0 ? 0u : static_cast<uint32_t>(hardware);

  if (drive_active) {
    tacho_.observe_count(last_hardware_count_, now_ms);
  } else {
    // The bridge is off - whatever the comparator did across this interval was
    // not commutation of the selected motor.
    tacho_.rebase_count(last_hardware_count_);
  }

  // A latch assertion removes the drive permit in hardware; mirror it in the
  // selection state so the next drive() has to go through arm_latch() again.
  if (fault_latched())
    selection_.observe_latch(true);
}

}  // namespace lv6
