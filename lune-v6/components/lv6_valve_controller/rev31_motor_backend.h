#pragma once

#include "gpio_motor_backend.h"
#include "rev31_logic.h"

#include "driver/gpio.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_oneshot.h"

#include <cstdint>

namespace lv6 {

struct Rev31PinConfig {
  gpio_num_t adc_current{GPIO_NUM_4};
  gpio_num_t adc_bemf{GPIO_NUM_5};
  gpio_num_t address0{GPIO_NUM_10};
  gpio_num_t address1{GPIO_NUM_11};
  gpio_num_t address2{GPIO_NUM_12};
  gpio_num_t motor_enable{GPIO_NUM_13};
  gpio_num_t terminal_direction{GPIO_NUM_14};
  gpio_num_t latch_arm{GPIO_NUM_16};
  gpio_num_t latch_state{GPIO_NUM_17};
};

struct Rev31BemfReading {
  int raw_a{0};
  int raw_b{0};
  Rev31MotionSample motion{};
};

// Low-level owner of the Rev 3.1 GPIO decoder, fault latch and ADC channels.
// All address transitions are forced through coast; the class never exposes a
// raw GPIO write that could select two motors or reverse a live bridge.
class Rev31MotorBackend : public GpioMotorBackend {
 public:
  explicit Rev31MotorBackend(const Rev31PinConfig &pins,
                             uint16_t bemf_threshold_raw = 40)
      : pins_(pins), motion_tracker_(bemf_threshold_raw, 50) {}

  bool setup() override;
  bool arm_latch() override;
  bool select_zone(uint8_t zone, bool reverse) override {
    return select(zone, reverse ? Rev31Direction::REVERSE : Rev31Direction::FORWARD);
  }
  bool select(uint8_t zone, Rev31Direction direction);
  bool drive() override;
  void coast() override;
  bool fault_latched() const override;
  const char *backend_name() const override { return "rev31_gpio"; }

  float read_current_ma() override;
  Rev31BemfReading sample_bemf(uint32_t now_ms, bool restore_drive);
  void reset_motion() override;
  uint32_t motion_evidence_count() const override { return motion_tracker_.evidence_count(); }
  bool motion_observed() const override { return motion_tracker_.ever_moved(); }
  bool motion_stopped_for(uint32_t now_ms, uint32_t debounce_ms) const override {
    return motion_tracker_.stopped_for(now_ms, debounce_ms);
  }
  uint16_t last_sample_separation_us() const { return last_sample_separation_us_; }
  int16_t last_bemf_differential_raw() const { return last_bemf_differential_raw_; }

 private:
  // ADC_BEMF has a 1k/4.7n output filter (tau=4.7 us). Twenty microseconds
  // gives 98.6% large-step settling while retaining margin inside the measured
  // 50 us A/B sample-separation contract.
  static constexpr uint32_t BEMF_SETTLE_US = 20;
  bool configure_adc_();
  bool read_adc_(adc_channel_t channel, adc_cali_handle_t calibration,
                 int *raw, int *millivolts);
  void write_selection_();
  void delay_us_(uint32_t microseconds) const;

  Rev31PinConfig pins_;
  Rev31DecoderSelection selection_{};
  Rev31MotionTracker motion_tracker_;

  adc_oneshot_unit_handle_t adc_handle_{nullptr};
  adc_cali_handle_t current_calibration_{nullptr};
  adc_channel_t current_channel_{ADC_CHANNEL_0};
  adc_channel_t bemf_channel_{ADC_CHANNEL_0};
  adc_unit_t adc_unit_{ADC_UNIT_1};

  uint16_t last_sample_separation_us_{0};
  int16_t last_bemf_differential_raw_{0};
  bool ready_{false};
};

}  // namespace lv6
