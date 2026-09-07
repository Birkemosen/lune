#pragma once

#include <cstddef>
#include <cstdint>
#include <cstring>

// Shelly Date/Time Broadcast (BLE manufacturer ID 0xFCD2, firmware 2.0+).
// Little-endian payload; no ESP-IDF dependency so host tests can encode it.
namespace lv6::ble_time {

static constexpr uint16_t SHELLY_MFG_ID = 0xFCD2;
static constexpr uint8_t DATETIME_BLOCK_ID = 0x0d;
static constexpr size_t DATETIME_BROADCAST_SIZE = 21;
static constexpr int32_t COPENHAGEN_STD_OFFSET_S = 3600;
static constexpr int32_t COPENHAGEN_DST_SHIFT_S = 3600;
static constexpr uint16_t CLOCK_SYNC_INTERVAL_MIN_DEFAULT = 60;
static constexpr uint16_t CLOCK_SYNC_INTERVAL_MIN_LO = 15;
static constexpr uint16_t CLOCK_SYNC_INTERVAL_MIN_HI = 1440;
static constexpr uint32_t CLOCK_SYNC_BURST_MS = 12000;

struct DstBounds {
  uint32_t start_s;
  uint32_t end_s;
};

inline uint16_t clamp_interval_min(int value) {
  if (value < static_cast<int>(CLOCK_SYNC_INTERVAL_MIN_LO))
    return CLOCK_SYNC_INTERVAL_MIN_LO;
  if (value > static_cast<int>(CLOCK_SYNC_INTERVAL_MIN_HI))
    return CLOCK_SYNC_INTERVAL_MIN_HI;
  return static_cast<uint16_t>(value);
}

inline void write_le32(uint8_t *out, uint32_t value) {
  out[0] = static_cast<uint8_t>(value);
  out[1] = static_cast<uint8_t>(value >> 8);
  out[2] = static_cast<uint8_t>(value >> 16);
  out[3] = static_cast<uint8_t>(value >> 24);
}

inline void write_le_i32(uint8_t *out, int32_t value) {
  write_le32(out, static_cast<uint32_t>(value));
}

// Howard Hinnant civil calendar → days since 1970-01-01.
inline int64_t days_from_civil(int year, unsigned month, unsigned day) {
  year -= month <= 2;
  const int era = (year >= 0 ? year : year - 399) / 400;
  const unsigned yoe = static_cast<unsigned>(year - era * 400);
  const unsigned doy = (153 * (month + (month > 2 ? -3 : 9)) + 2) / 5 + day - 1;
  const unsigned doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
  return static_cast<int64_t>(era) * 146097 + static_cast<int>(doe) - 719468;
}

inline uint32_t unix_utc(int year, unsigned month, unsigned day, int hour) {
  return static_cast<uint32_t>(days_from_civil(year, month, day) * 86400LL + hour * 3600LL);
}

// 0 = Sunday. Unix epoch 1970-01-01 is Thursday.
inline int weekday_utc(int year, unsigned month, unsigned day) {
  const int64_t days = days_from_civil(year, month, day);
  int wd = static_cast<int>((days + 4) % 7);
  if (wd < 0)
    wd += 7;
  return wd;
}

inline unsigned last_sunday(int year, unsigned month, unsigned last_day) {
  return last_day - static_cast<unsigned>(weekday_utc(year, month, last_day));
}

// EU DST: last Sunday of March 01:00 UTC → last Sunday of October 01:00 UTC.
inline DstBounds europe_dst_bounds(int year) {
  const unsigned march_sun = last_sunday(year, 3, 31);
  const unsigned oct_sun = last_sunday(year, 10, 31);
  return DstBounds{unix_utc(year, 3, march_sun, 1), unix_utc(year, 10, oct_sun, 1)};
}

inline void encode_datetime_broadcast(uint8_t out[DATETIME_BROADCAST_SIZE], uint32_t unix_utc_s,
                                      int32_t std_offset_s, uint32_t dst_start_s, uint32_t dst_end_s,
                                      int32_t dst_shift_s) {
  out[0] = DATETIME_BLOCK_ID;
  write_le32(out + 1, unix_utc_s);
  write_le_i32(out + 5, std_offset_s);
  write_le32(out + 9, dst_start_s);
  write_le32(out + 13, dst_end_s);
  write_le_i32(out + 17, dst_shift_s);
}

inline void encode_copenhagen_broadcast(uint8_t out[DATETIME_BROADCAST_SIZE], uint32_t unix_utc_s,
                                        int year_utc) {
  const DstBounds dst = europe_dst_bounds(year_utc);
  encode_datetime_broadcast(out, unix_utc_s, COPENHAGEN_STD_OFFSET_S, dst.start_s, dst.end_s,
                            COPENHAGEN_DST_SHIFT_S);
}

// Manufacturer AD payload: company ID (LE) + 21-byte block.
inline size_t encode_manufacturer_data(uint8_t out[2 + DATETIME_BROADCAST_SIZE], uint32_t unix_utc_s,
                                       int year_utc) {
  out[0] = static_cast<uint8_t>(SHELLY_MFG_ID);
  out[1] = static_cast<uint8_t>(SHELLY_MFG_ID >> 8);
  encode_copenhagen_broadcast(out + 2, unix_utc_s, year_utc);
  return 2 + DATETIME_BROADCAST_SIZE;
}

}  // namespace lv6::ble_time
