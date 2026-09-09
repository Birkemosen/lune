#pragma once

#include <cstddef>
#include <cstdint>
#include <functional>
#include <vector>

#include "esphome/core/automation.h"
#include "esphome/core/component.h"

struct ble_gap_event;
struct ble_gap_disc_desc;

namespace esphome {
namespace nimble_hub {

struct AdvertisementInfo {
  uint8_t address[6];  // display/MSB-first order (label style)
  int8_t rssi{0};
  const char *name{nullptr};
  const uint8_t *payload{nullptr};
  uint8_t payload_len{0};
};

struct RawAdvertiseParams {
  uint16_t interval_min{0x00A0};  // 100 ms in 0.625 ms units
  uint16_t interval_max{0x00C0};  // 120 ms
};

using AdvertisementCallback = std::function<void(const AdvertisementInfo &)>;

class NimbleHub : public Component {
 public:
  void set_enable_on_boot(bool enable) { enable_on_boot_ = enable; }
  void set_default_scan(uint16_t interval_ms, uint16_t window_ms, bool active) {
    scan_interval_ms_ = interval_ms;
    scan_window_ms_ = window_ms;
    scan_active_ = active;
  }

  void setup() override;
  void loop() override;
  void dump_config() override;
  float get_setup_priority() const override { return setup_priority::AFTER_BLUETOOTH; }

  void enable();
  void disable();
  bool is_enabled() const { return enabled_; }

  bool start_scan(uint16_t interval_ms, uint16_t window_ms, bool active, bool continuous = true);
  bool start_scan(bool continuous = true) {
    return this->start_scan(scan_interval_ms_, scan_window_ms_, scan_active_, continuous);
  }
  void stop_scan();
  bool scanning() const { return scanning_; }

  // Scan liveness (updated from the NimBLE host task; read from loop/HTTP).
  float ads_per_sec() const { return ads_per_sec_; }
  uint32_t last_adv_age_ms() const;
  uint32_t last_adv_ms() const { return last_adv_ms_; }
  uint32_t adv_total() const { return adv_total_; }

  void register_advertisement_callback(AdvertisementCallback cb);

  bool start_raw_advertise(const uint8_t *data, size_t len, const RawAdvertiseParams &params);
  void stop_advertise();
  bool advertising() const { return advertising_; }

  // Called from NimBLE host task.
  void on_sync_();
  void on_reset_(int reason);
  int on_gap_event_(struct ble_gap_event *event);

 protected:
  bool init_stack_();
  void deinit_stack_();
  bool start_scan_locked_();
  void stop_scan_locked_();
  void resume_scan_after_advertise_();
  void dispatch_advertisement_(const struct ble_gap_disc_desc *disc);
  void note_advertisement_();
  void update_ads_rate_();
  static uint16_t ms_to_units_(uint16_t ms);

  bool enable_on_boot_{false};
  bool enabled_{false};
  bool synced_{false};
  bool want_scan_{false};
  bool scanning_{false};
  bool continuous_scan_{true};
  bool advertising_{false};
  bool scan_paused_for_adv_{false};

  // Quieter 50% duty default (640/320): longer quiet gaps than 320/160.
  uint16_t scan_interval_ms_{640};
  uint16_t scan_window_ms_{320};
  bool scan_active_{false};

  uint8_t own_addr_type_{0};
  std::vector<AdvertisementCallback> callbacks_;

  // Parsed name buffer for the active GAP callback (not re-entrant).
  char name_buf_[32]{};

  uint32_t adv_total_{0};
  uint32_t last_adv_ms_{0};
  uint32_t rate_window_start_ms_{0};
  uint32_t rate_window_count_{0};
  float ads_per_sec_{0.0f};
};

template<typename... Ts> class EnableAction : public Action<Ts...> {
 public:
  explicit EnableAction(NimbleHub *parent) : parent_(parent) {}
  void play(Ts... x) override { this->parent_->enable(); }

 protected:
  NimbleHub *parent_;
};

template<typename... Ts> class DisableAction : public Action<Ts...> {
 public:
  explicit DisableAction(NimbleHub *parent) : parent_(parent) {}
  void play(Ts... x) override { this->parent_->disable(); }

 protected:
  NimbleHub *parent_;
};

template<typename... Ts> class StartScanAction : public Action<Ts...> {
 public:
  explicit StartScanAction(NimbleHub *parent) : parent_(parent) {}
  void set_continuous(bool continuous) { continuous_ = continuous; }
  void play(Ts... x) override { this->parent_->start_scan(this->continuous_); }

 protected:
  NimbleHub *parent_;
  bool continuous_{true};
};

template<typename... Ts> class StopScanAction : public Action<Ts...> {
 public:
  explicit StopScanAction(NimbleHub *parent) : parent_(parent) {}
  void play(Ts... x) override { this->parent_->stop_scan(); }

 protected:
  NimbleHub *parent_;
};

}  // namespace nimble_hub
}  // namespace esphome
