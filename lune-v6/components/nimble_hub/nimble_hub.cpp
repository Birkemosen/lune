#include "nimble_hub.h"

#include <cstdint>
#include <cstring>

#include "esphome/core/application.h"
#include "esphome/core/log.h"

#ifdef USE_ESP32
#include <esp_heap_caps.h>
#include "host/ble_gap.h"
#include "host/ble_hs.h"
#include "host/ble_hs_adv.h"
#include "host/util/util.h"
#include "nimble/nimble_port.h"
#include "nimble/nimble_port_freertos.h"
#endif

namespace esphome {
namespace nimble_hub {

static const char *const TAG = "nimble_hub";

#ifdef USE_ESP32
static NimbleHub *g_hub = nullptr;

extern "C" void ble_store_config_init(void);

static void nimble_host_task(void *param) {
  (void) param;
  nimble_port_run();
  nimble_port_freertos_deinit();
}

static void on_reset(int reason) {
  if (g_hub != nullptr)
    g_hub->on_reset_(reason);
}

static void on_sync(void) {
  if (g_hub != nullptr)
    g_hub->on_sync_();
}

static int gap_event_cb(struct ble_gap_event *event, void *arg) {
  auto *hub = static_cast<NimbleHub *>(arg);
  if (hub == nullptr)
    return 0;
  return hub->on_gap_event_(event);
}
#endif

void NimbleHub::setup() {
#ifdef USE_ESP32
  g_hub = this;
  if (this->enable_on_boot_)
    this->enable();
#else
  ESP_LOGW(TAG, "nimble_hub requires ESP32 ESP-IDF");
#endif
}

void NimbleHub::loop() { this->update_ads_rate_(); }

void NimbleHub::dump_config() {
  ESP_LOGCONFIG(TAG, "NimBLE hub:");
  ESP_LOGCONFIG(TAG, "  Enable on boot: %s", YESNO(this->enable_on_boot_));
  ESP_LOGCONFIG(TAG, "  Scan interval: %u ms", this->scan_interval_ms_);
  ESP_LOGCONFIG(TAG, "  Scan window: %u ms", this->scan_window_ms_);
  ESP_LOGCONFIG(TAG, "  Scan active: %s", YESNO(this->scan_active_));
}

uint32_t NimbleHub::last_adv_age_ms() const {
  if (this->last_adv_ms_ == 0)
    return UINT32_MAX;
  return esphome::millis() - this->last_adv_ms_;
}

void NimbleHub::note_advertisement_() {
  const uint32_t now = esphome::millis();
  this->adv_total_++;
  this->last_adv_ms_ = now;
  this->rate_window_count_++;
  if (this->rate_window_start_ms_ == 0)
    this->rate_window_start_ms_ = now;
}

void NimbleHub::update_ads_rate_() {
  const uint32_t now = esphome::millis();
  if (this->rate_window_start_ms_ == 0) {
    this->rate_window_start_ms_ = now;
    return;
  }
  const uint32_t elapsed = now - this->rate_window_start_ms_;
  if (elapsed < 1000)
    return;
  this->ads_per_sec_ = (this->rate_window_count_ * 1000.0f) / static_cast<float>(elapsed);
  this->rate_window_count_ = 0;
  this->rate_window_start_ms_ = now;
  if (!this->enabled_ || !this->scanning_)
    this->ads_per_sec_ = 0.0f;
}

void NimbleHub::register_advertisement_callback(AdvertisementCallback cb) {
  this->callbacks_.push_back(std::move(cb));
}

uint16_t NimbleHub::ms_to_units_(uint16_t ms) {
  // BLE scan/adv units are 0.625 ms. Round to nearest, clamp to at least 1.
  uint32_t units = (static_cast<uint32_t>(ms) * 8u + 2u) / 5u;
  if (units < 1)
    units = 1;
  if (units > 0xFFFF)
    units = 0xFFFF;
  return static_cast<uint16_t>(units);
}

void NimbleHub::enable() {
#ifdef USE_ESP32
  if (this->enabled_)
    return;
  if (!this->init_stack_()) {
    ESP_LOGE(TAG, "Failed to init NimBLE stack");
    return;
  }
  this->enabled_ = true;
  ESP_LOGI(TAG, "NimBLE enabled (free_heap=%u internal=%u)",
           static_cast<unsigned>(esp_get_free_heap_size()),
           static_cast<unsigned>(heap_caps_get_free_size(MALLOC_CAP_INTERNAL)));
#else
  ESP_LOGW(TAG, "enable() unsupported on this platform");
#endif
}

void NimbleHub::disable() {
#ifdef USE_ESP32
  if (!this->enabled_)
    return;
  this->want_scan_ = false;
  this->stop_advertise();
  this->stop_scan_locked_();
  this->deinit_stack_();
  this->enabled_ = false;
  this->synced_ = false;
  this->ads_per_sec_ = 0.0f;
  this->rate_window_count_ = 0;
  this->rate_window_start_ms_ = 0;
  ESP_LOGI(TAG, "NimBLE disabled (free_heap=%u internal=%u)",
           static_cast<unsigned>(esp_get_free_heap_size()),
           static_cast<unsigned>(heap_caps_get_free_size(MALLOC_CAP_INTERNAL)));
#endif
}

bool NimbleHub::init_stack_() {
#ifdef USE_ESP32
  esp_err_t err = nimble_port_init();
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "nimble_port_init failed: %s", esp_err_to_name(err));
    return false;
  }

  ble_hs_cfg.reset_cb = on_reset;
  ble_hs_cfg.sync_cb = on_sync;
  ble_hs_cfg.store_status_cb = ble_store_util_status_rr;
  ble_store_config_init();

  this->synced_ = false;
  nimble_port_freertos_init(nimble_host_task);
  return true;
#else
  return false;
#endif
}

void NimbleHub::deinit_stack_() {
#ifdef USE_ESP32
  int rc = nimble_port_stop();
  if (rc != 0) {
    ESP_LOGW(TAG, "nimble_port_stop rc=%d", rc);
  }
  nimble_port_deinit();
#endif
}

void NimbleHub::on_reset_(int reason) {
  ESP_LOGW(TAG, "NimBLE reset; reason=%d", reason);
  this->synced_ = false;
  this->scanning_ = false;
  this->advertising_ = false;
}

void NimbleHub::on_sync_() {
#ifdef USE_ESP32
  int rc = ble_hs_util_ensure_addr(0);
  if (rc != 0) {
    ESP_LOGW(TAG, "ensure_addr failed rc=%d", rc);
  }
  rc = ble_hs_id_infer_auto(0, &this->own_addr_type_);
  if (rc != 0) {
    ESP_LOGW(TAG, "infer_auto addr failed rc=%d", rc);
    this->own_addr_type_ = 0;
  }
  this->synced_ = true;
  ESP_LOGI(TAG, "NimBLE synced (free_heap=%u internal=%u)",
           static_cast<unsigned>(esp_get_free_heap_size()),
           static_cast<unsigned>(heap_caps_get_free_size(MALLOC_CAP_INTERNAL)));
  if (this->want_scan_ && !this->advertising_)
    this->start_scan_locked_();
#endif
}

bool NimbleHub::start_scan(uint16_t interval_ms, uint16_t window_ms, bool active, bool continuous) {
#ifdef USE_ESP32
  if (!this->enabled_) {
    ESP_LOGW(TAG, "start_scan ignored; hub disabled");
    return false;
  }
  if (window_ms > interval_ms)
    window_ms = interval_ms;
  this->scan_interval_ms_ = interval_ms;
  this->scan_window_ms_ = window_ms;
  this->scan_active_ = active;
  this->continuous_scan_ = continuous;
  this->want_scan_ = true;
  if (this->advertising_) {
    // Demand gate may re-call start_scan every loop during a clock advertise
    // burst (~12s); only log the first defer so DEBUG stays usable.
    if (!this->scan_paused_for_adv_) {
      ESP_LOGD(TAG, "Scan deferred until advertise ends");
    }
    this->scan_paused_for_adv_ = true;
    return true;
  }
  if (!this->synced_) {
    ESP_LOGD(TAG, "Scan queued until NimBLE sync");
    return true;
  }
  return this->start_scan_locked_();
#else
  return false;
#endif
}

void NimbleHub::stop_scan() {
  this->want_scan_ = false;
  this->continuous_scan_ = false;
  this->scan_paused_for_adv_ = false;
  this->stop_scan_locked_();
}

bool NimbleHub::start_scan_locked_() {
#ifdef USE_ESP32
  if (this->scanning_)
    return true;
  if (ble_gap_disc_active()) {
    this->scanning_ = true;
    return true;
  }

  struct ble_gap_disc_params params = {};
  params.itvl = ms_to_units_(this->scan_interval_ms_);
  params.window = ms_to_units_(this->scan_window_ms_);
  params.filter_policy = BLE_HCI_SCAN_FILT_NO_WL;
  params.limited = 0;
  params.passive = this->scan_active_ ? 0 : 1;
  params.filter_duplicates = 0;

  int rc = ble_gap_disc(this->own_addr_type_, BLE_HS_FOREVER, &params, gap_event_cb, this);
  if (rc != 0) {
    ESP_LOGW(TAG, "ble_gap_disc failed rc=%d", rc);
    this->scanning_ = false;
    return false;
  }
  this->scanning_ = true;
  ESP_LOGI(TAG, "Scan started interval=%ums window=%ums active=%s", this->scan_interval_ms_,
           this->scan_window_ms_, YESNO(this->scan_active_));
  return true;
#else
  return false;
#endif
}

void NimbleHub::stop_scan_locked_() {
#ifdef USE_ESP32
  if (!this->scanning_ && !ble_gap_disc_active()) {
    this->scanning_ = false;
    return;
  }
  int rc = ble_gap_disc_cancel();
  if (rc != 0 && rc != BLE_HS_EALREADY) {
    ESP_LOGD(TAG, "ble_gap_disc_cancel rc=%d", rc);
  }
  this->scanning_ = false;
#endif
}

bool NimbleHub::start_raw_advertise(const uint8_t *data, size_t len, const RawAdvertiseParams &params) {
#ifdef USE_ESP32
  if (!this->enabled_ || !this->synced_) {
    ESP_LOGW(TAG, "advertise ignored; hub not ready");
    return false;
  }
  if (data == nullptr || len == 0 || len > BLE_HS_ADV_MAX_SZ) {
    ESP_LOGW(TAG, "invalid advertise payload len=%u", static_cast<unsigned>(len));
    return false;
  }
  if (this->advertising_) {
    ESP_LOGW(TAG, "already advertising");
    return false;
  }

  // Scan ↔ advertise mutex: pause discovery for the burst.
  if (this->scanning_ || ble_gap_disc_active()) {
    this->scan_paused_for_adv_ = this->want_scan_;
    this->stop_scan_locked_();
  }

  int rc = ble_gap_adv_set_data(data, static_cast<int>(len));
  if (rc != 0) {
    ESP_LOGW(TAG, "ble_gap_adv_set_data rc=%d", rc);
    this->resume_scan_after_advertise_();
    return false;
  }

  struct ble_gap_adv_params adv = {};
  adv.conn_mode = BLE_GAP_CONN_MODE_NON;
  adv.disc_mode = BLE_GAP_DISC_MODE_GEN;
  adv.itvl_min = params.interval_min;
  adv.itvl_max = params.interval_max;

  rc = ble_gap_adv_start(this->own_addr_type_, nullptr, BLE_HS_FOREVER, &adv, gap_event_cb, this);
  if (rc != 0) {
    ESP_LOGW(TAG, "ble_gap_adv_start rc=%d", rc);
    this->resume_scan_after_advertise_();
    return false;
  }
  this->advertising_ = true;
  return true;
#else
  (void) data;
  (void) len;
  (void) params;
  return false;
#endif
}

void NimbleHub::stop_advertise() {
#ifdef USE_ESP32
  if (!this->advertising_ && !ble_gap_adv_active()) {
    this->advertising_ = false;
    return;
  }
  int rc = ble_gap_adv_stop();
  if (rc != 0 && rc != BLE_HS_EALREADY) {
    ESP_LOGD(TAG, "ble_gap_adv_stop rc=%d", rc);
  }
  this->advertising_ = false;
  this->resume_scan_after_advertise_();
#endif
}

void NimbleHub::resume_scan_after_advertise_() {
  if (this->scan_paused_for_adv_ || this->want_scan_) {
    this->scan_paused_for_adv_ = false;
    if (this->want_scan_ && this->synced_ && this->enabled_)
      this->start_scan_locked_();
  }
}

void NimbleHub::dispatch_advertisement_(const struct ble_gap_disc_desc *disc) {
#ifdef USE_ESP32
  if (disc == nullptr || this->callbacks_.empty())
    return;

  AdvertisementInfo info{};
  // NimBLE stores the address little-endian; convert to label/MSB-first order.
  for (int i = 0; i < 6; i++)
    info.address[i] = disc->addr.val[5 - i];
  info.rssi = disc->rssi;
  info.payload = disc->data;
  info.payload_len = disc->length_data;

  this->name_buf_[0] = '\0';
  const uint8_t *p = disc->data;
  const uint8_t *end = disc->data + disc->length_data;
  while (p < end) {
    uint8_t field_len = p[0];
    if (field_len == 0 || p + 1 + field_len > end)
      break;
    uint8_t type = p[1];
    const uint8_t *val = p + 2;
    uint8_t val_len = field_len - 1;
    if ((type == BLE_HS_ADV_TYPE_COMP_NAME || type == BLE_HS_ADV_TYPE_INCOMP_NAME) && val_len > 0) {
      size_t n = val_len;
      if (n >= sizeof(this->name_buf_))
        n = sizeof(this->name_buf_) - 1;
      memcpy(this->name_buf_, val, n);
      this->name_buf_[n] = '\0';
    }
    p += 1 + field_len;
  }
  info.name = this->name_buf_[0] != '\0' ? this->name_buf_ : nullptr;

  for (auto &cb : this->callbacks_) {
    if (cb)
      cb(info);
  }
#else
  (void) disc;
#endif
}

int NimbleHub::on_gap_event_(struct ble_gap_event *event) {
#ifdef USE_ESP32
  switch (event->type) {
    case BLE_GAP_EVENT_DISC:
      this->note_advertisement_();
      this->dispatch_advertisement_(&event->disc);
      return 0;
    case BLE_GAP_EVENT_DISC_COMPLETE:
      this->scanning_ = false;
      if (this->want_scan_ && this->continuous_scan_ && !this->advertising_)
        this->start_scan_locked_();
      return 0;
    case BLE_GAP_EVENT_ADV_COMPLETE:
      this->advertising_ = false;
      this->resume_scan_after_advertise_();
      return 0;
    default:
      return 0;
  }
#else
  (void) event;
  return 0;
#endif
}

}  // namespace nimble_hub
}  // namespace esphome
