#include "lv6_bthome_bridge.h"

#include <cmath>
#include <cstring>

#include "esphome/core/log.h"

namespace lv6 {

static const char *const TAG = "lv6_bthome";
static constexpr uint16_t BTHOME_UUID = 0xFCD2;
static constexpr uint32_t THROTTLE_MS = 30000;

void Lv6BthomeBridge::setup() {
  if (this->hub_ == nullptr || this->zones_ == nullptr) {
    ESP_LOGE(TAG, "hub or zone controller missing");
    this->mark_failed();
    return;
  }
  this->hub_->register_advertisement_callback(
      [this](const esphome::nimble_hub::AdvertisementInfo &info) { this->on_advertisement_(info); });
  ESP_LOGI(TAG, "BTHome bridge listening on nimble_hub");
}

void Lv6BthomeBridge::dump_config() {
  ESP_LOGCONFIG(TAG, "BTHome bridge (0xFCD2 → zones)");
}

bool Lv6BthomeBridge::parse_bthome_temperature_(const uint8_t *data, size_t len, float *out_temp) {
  if (data == nullptr || len < 3 || out_temp == nullptr)
    return false;

  size_t pos = 1;  // skip device info byte
  float temperature = NAN;

  while (pos < len) {
    uint8_t obj_id = data[pos];
    uint8_t dlen = 0;
    if (obj_id >= 0x0F && obj_id <= 0x2D) {
      dlen = 1;
    } else {
      switch (obj_id) {
        case 0x00:
        case 0x01:
        case 0x09:
        case 0x2E:
        case 0x3A:
        case 0x3C:
          dlen = 1;
          break;
        case 0x02:
        case 0x03:
        case 0x06:
        case 0x07:
        case 0x08:
        case 0x0C:
        case 0x0D:
        case 0x0E:
        case 0x2F:
        case 0x3D:
        case 0x40:
        case 0x41:
        case 0x43:
        case 0x44:
        case 0x45:
        case 0x46:
        case 0x48:
        case 0x49:
        case 0x4A:
        case 0x4F:
        case 0x51:
        case 0x52:
          dlen = 2;
          break;
        case 0x04:
        case 0x05:
        case 0x0A:
        case 0x0B:
        case 0x42:
        case 0x4B:
          dlen = 3;
          break;
        case 0x3E:
        case 0x47:
        case 0x4C:
        case 0x4D:
        case 0x4E:
        case 0x50:
          dlen = 4;
          break;
        default:
          dlen = 1;
          break;
      }
    }

    if (pos + 1 + dlen > len)
      break;
    if (obj_id == 0x02) {
      int16_t raw = static_cast<int16_t>(data[pos + 1] | (data[pos + 2] << 8));
      temperature = raw * 0.01f;
    } else if (obj_id == 0x45) {
      int16_t raw = static_cast<int16_t>(data[pos + 1] | (data[pos + 2] << 8));
      temperature = raw * 0.1f;
    }
    pos += 1 + dlen;
  }

  if (std::isnan(temperature))
    return false;
  *out_temp = temperature;
  return true;
}

void Lv6BthomeBridge::on_advertisement_(const esphome::nimble_hub::AdvertisementInfo &info) {
  if (info.payload == nullptr || info.payload_len == 0)
    return;

  const uint8_t *p = info.payload;
  const uint8_t *end = info.payload + info.payload_len;
  const uint8_t *svc = nullptr;
  size_t svc_len = 0;

  while (p < end) {
    uint8_t field_len = p[0];
    if (field_len == 0 || p + 1 + field_len > end)
      break;
    uint8_t type = p[1];
    const uint8_t *val = p + 2;
    uint8_t val_len = field_len - 1;
    // 0x16 = Service Data - 16-bit UUID
    if (type == 0x16 && val_len >= 3) {
      uint16_t uuid = static_cast<uint16_t>(val[0] | (val[1] << 8));
      if (uuid == BTHOME_UUID) {
        svc = val + 2;
        svc_len = val_len - 2;
        break;
      }
    }
    p += 1 + field_len;
  }

  if (svc == nullptr)
    return;

  char mac_buf[18];
  snprintf(mac_buf, sizeof(mac_buf), "%02X:%02X:%02X:%02X:%02X:%02X", info.address[0], info.address[1],
           info.address[2], info.address[3], info.address[4], info.address[5]);

  uint32_t now = esphome::millis();
  int slot = -1;
  for (int i = 0; i < 16; i++) {
    if (this->last_update_[i].used && memcmp(this->last_update_[i].mac, mac_buf, 18) == 0) {
      slot = i;
      break;
    }
  }
  if (slot >= 0 && (now - this->last_update_[slot].ts) < THROTTLE_MS)
    return;
  if (slot < 0) {
    int oldest = 0;
    uint32_t oldest_ts = UINT32_MAX;
    for (int i = 0; i < 16; i++) {
      if (!this->last_update_[i].used) {
        oldest = i;
        break;
      }
      if (this->last_update_[i].ts < oldest_ts) {
        oldest_ts = this->last_update_[i].ts;
        oldest = i;
      }
    }
    slot = oldest;
    memcpy(this->last_update_[slot].mac, mac_buf, 18);
    this->last_update_[slot].used = true;
  }
  this->last_update_[slot].ts = now;

  float temperature = NAN;
  bool has_temp = parse_bthome_temperature_(svc, svc_len, &temperature);
  if (!has_temp)
    temperature = NAN;

  ESP_LOGD(TAG, "BTHome advertisement %s: temp=%s RSSI=%d dBm", mac_buf,
           has_temp ? "decoded" : "n/a", static_cast<int>(info.rssi));

  this->zones_->report_ble_sensor_seen(mac_buf, temperature, info.rssi, info.name);

  if (!has_temp)
    return;

  int8_t mz = this->zones_->match_ble_mac(mac_buf);
  if (mz < 0)
    return;

  uint8_t z = static_cast<uint8_t>(mz);
  ESP_LOGI(TAG, "Zone %d BLE temp: %.1f°C (%s)", z + 1, temperature, mac_buf);
  this->zones_->set_zone_external_temperature(z, temperature);
  if (z < 6 && this->zone_temp_[z] != nullptr)
    this->zone_temp_[z]->publish_state(temperature);
}

}  // namespace lv6
