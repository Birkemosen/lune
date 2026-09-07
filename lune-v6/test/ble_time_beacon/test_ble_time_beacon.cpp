#include "ble_datetime_broadcast.h"

#include <cassert>
#include <cstdio>

int main() {
  using namespace lv6::ble_time;

  assert(clamp_interval_min(0) == 15);
  assert(clamp_interval_min(15) == 15);
  assert(clamp_interval_min(60) == 60);
  assert(clamp_interval_min(1440) == 1440);
  assert(clamp_interval_min(9999) == 1440);

  // 2026: last Sundays are 29 Mar and 25 Oct.
  const DstBounds y2026 = europe_dst_bounds(2026);
  assert(y2026.start_s == unix_utc(2026, 3, 29, 1));
  assert(y2026.end_s == unix_utc(2026, 10, 25, 1));
  assert(y2026.start_s == 1774746000u);
  assert(y2026.end_s == 1792890000u);

  // 2027: 28 Mar and 31 Oct.
  const DstBounds y2027 = europe_dst_bounds(2027);
  assert(y2027.start_s == unix_utc(2027, 3, 28, 1));
  assert(y2027.end_s == unix_utc(2027, 10, 31, 1));

  uint8_t pkt[DATETIME_BROADCAST_SIZE] = {};
  encode_datetime_broadcast(pkt, 0x01020304u, -3600, 0x11121314u, 0x21222324u, 3600);
  assert(pkt[0] == 0x0d);
  assert(pkt[1] == 0x04 && pkt[2] == 0x03 && pkt[3] == 0x02 && pkt[4] == 0x01);
  assert(pkt[5] == 0xF0 && pkt[6] == 0xF1 && pkt[7] == 0xFF && pkt[8] == 0xFF);  // -3600 LE
  assert(pkt[9] == 0x14 && pkt[10] == 0x13 && pkt[11] == 0x12 && pkt[12] == 0x11);
  assert(pkt[13] == 0x24 && pkt[14] == 0x23 && pkt[15] == 0x22 && pkt[16] == 0x21);
  assert(pkt[17] == 0x10 && pkt[18] == 0x0E && pkt[19] == 0x00 && pkt[20] == 0x00);

  uint8_t mfg[2 + DATETIME_BROADCAST_SIZE] = {};
  const size_t n = encode_manufacturer_data(mfg, 1774746000u, 2026);
  assert(n == 23);
  assert(mfg[0] == 0xD2 && mfg[1] == 0xFC);
  assert(mfg[2] == 0x0d);

  std::puts("BLE Date/Time Broadcast tests passed.");
}
