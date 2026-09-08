// =============================================================================
// LV6 Smart Log — dual PSRAM log rings for the dashboard
// =============================================================================
// Two rings are fed from the single ESPHome logger callback:
//
//   * live scratch (LIVE_SLOTS)   — everything ERROR..DEBUG, short window.
//                                   Served by GET /api/hv6/v1/logs?since=.
//   * smart FIFO   (SMART_SLOTS)  — long window, admission-filtered. Served by
//                                   GET /api/hv6/v1/logs/download.
//
// The smart FIFO exists so a support download covers hours of runtime without
// 2048 slots of routine zone-cycle chatter. Admission keeps:
//
//   * every ERROR and WARN,
//   * INFO/CONFIG from rare-event tags (boot, NVS, Wi-Fi, OTA, authority),
//   * the ~CTX_SLOTS lines that preceded each alarm (flushed on the alarm), and
//   * DEBUG/INFO from the alarm's own tag group for COOLDOWN_MS afterwards.
//
// VERBOSE and VERY_VERBOSE never enter either ring.
//
// The writer runs on arbitrary tasks, so it takes the lock non-blocking and
// drops the line on contention: logging is never stalled by an HTTP reader.
// =============================================================================

#pragma once

#include <cstddef>
#include <cstdint>
#include <cstring>

#include <esp_heap_caps.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <freertos/task.h>

#include "esphome/core/hal.h"
#include "esphome/core/log.h"

namespace esphome {
namespace lv6_dashboard {

static constexpr size_t LOG_TAG_LEN = 16;
static constexpr size_t LOG_MSG_LEN = 112;

struct LogLine {
  uint32_t seq;   ///< Monotonic; 0 = empty slot. Client passes ?since=<last seq>.
  uint8_t  level; ///< ESPHome log level (1=ERROR .. 7=VERY_VERBOSE)
  char     tag[LOG_TAG_LEN];
  char     msg[LOG_MSG_LEN];
};

/// Coarse tag grouping. On a WARN/ERROR the buffer widens admission for the
/// alarm's own subsystem only, so a motor fault does not pull in unrelated
/// Wi-Fi debug traffic.
enum class LogGroup : uint8_t {
  NONE = 0,
  MOTOR,
  ZONE,
  PERSIST,
  NET,
  BLE,
};

namespace smart_log_detail {

/// LogLine::tag is truncated at LOG_TAG_LEN-1, so "lv6_config_store" arrives as
/// "lv6_config_stor". Always match on a prefix that survives truncation.
inline bool tag_starts_with(const char *tag, const char *prefix) {
  return std::strncmp(tag, prefix, std::strlen(prefix)) == 0;
}

inline bool tag_in(const char *tag, const char *const *prefixes, size_t count) {
  for (size_t i = 0; i < count; i++) {
    if (tag_starts_with(tag, prefixes[i]))
      return true;
  }
  return false;
}

inline LogGroup classify(const char *tag) {
  static const char *const MOTOR[] = {"hv6_valve", "hv6_rev31", "hv6_rev32", "drv8215"};
  static const char *const ZONE[]  = {"hv6_zone", "hv6_onewire", "dallas", "one_wire", "ds18b20"};
  static const char *const PERSIST[] = {"lv6_config", "nvs", "preferences"};
  static const char *const NET[] = {"wifi",     "http_request", "ota",   "lv6_dashboard",
                                    "esp-tls",  "web_server",   "mdns",  "api",
                                    "safe_mode", "update",      "esp_netif"};
  static const char *const BLE[] = {"ble", "esp32_ble", "nimble_hub", "lv6_ble", "lv6_bthome", "bt_"};

  if (tag == nullptr || tag[0] == '\0')
    return LogGroup::NONE;
  if (tag_in(tag, MOTOR, sizeof(MOTOR) / sizeof(MOTOR[0])))
    return LogGroup::MOTOR;
  if (tag_in(tag, ZONE, sizeof(ZONE) / sizeof(ZONE[0])))
    return LogGroup::ZONE;
  if (tag_in(tag, PERSIST, sizeof(PERSIST) / sizeof(PERSIST[0])))
    return LogGroup::PERSIST;
  if (tag_in(tag, NET, sizeof(NET) / sizeof(NET[0])))
    return LogGroup::NET;
  if (tag_in(tag, BLE, sizeof(BLE) / sizeof(BLE[0])))
    return LogGroup::BLE;
  return LogGroup::NONE;
}

/// Tags whose INFO/CONFIG lines are rare and worth keeping unconditionally:
/// boot identity, NVS migrations, driver bring-up, connectivity and authority.
inline bool info_allowlisted(const char *tag) {
  static const char *const ALLOW[] = {
      "lv6_config", "lv6_dashboard", "lv6_ble", "wifi",   "ota",       "http_request",
      "safe_mode",  "update",        "esphome", "app",    "nvs",       "preferences",
      "i2c",        "drv8215",       "boot",    "md5",    "partition", "spi_flash",
      "cpu_start",  "heap_init",     "esp_image",
  };
  if (tag == nullptr || tag[0] == '\0')
    return false;
  return tag_in(tag, ALLOW, sizeof(ALLOW) / sizeof(ALLOW[0]));
}

}  // namespace smart_log_detail

/// Chronological read cursor over the smart FIFO. Positions are absolute write
/// indices, so a concurrent admission can never shift an in-flight download's
/// view: a slot recycled since `begin` is skipped instead of re-emitted.
struct SmartLogCursor {
  uint32_t next{0};
  uint32_t last{0};
  bool done() const { return next >= last; }
};

class SmartLogBuffer {
 public:
  static constexpr uint16_t LIVE_SLOTS  = 256;   ///< live scratch served by /logs
  static constexpr uint16_t SMART_SLOTS = 2048;  ///< download FIFO
  static constexpr uint16_t CTX_SLOTS   = 64;    ///< pre-alarm context scratch
  static constexpr uint32_t COOLDOWN_MS = 20000; ///< post-alarm widened admission

  /// Allocate the rings. Prefers PSRAM; falls back to the internal heap with a
  /// reduced smart FIFO so no-PSRAM boards still serve live logs.
  bool init() {
    if (this->lock_ != nullptr)
      return true;
    this->lock_ = xSemaphoreCreateMutex();
    if (this->lock_ == nullptr)
      return false;

    this->live_ = alloc_ring_(LIVE_SLOTS, &this->live_cap_);
    this->smart_ = alloc_ring_(SMART_SLOTS, &this->smart_cap_);
    this->ctx_ = alloc_ring_(CTX_SLOTS, &this->ctx_cap_);
    return this->live_ != nullptr;
  }

  bool ready() const { return this->live_ != nullptr; }
  uint32_t next_seq() const { return this->next_seq_; }
  uint32_t dropped() const { return this->dropped_; }

  /// Logger callback body. Wait-free: never blocks, never allocates, and drops
  /// the line rather than contend with a reader.
  void on_log(uint8_t level, const char *tag, const char *message, size_t /*message_len*/) {
    if (this->live_ == nullptr || message == nullptr)
      return;
    // Routine tracing would swamp both rings, and NONE is not a real line.
    if (level == ESPHOME_LOG_LEVEL_NONE || level > ESPHOME_LOG_LEVEL_DEBUG)
      return;
    if (xPortInIsrContext())
      return;
    if (xSemaphoreTake(this->lock_, 0) != pdTRUE) {
      this->dropped_++;
      return;
    }

    LogLine &slot = this->live_[this->live_head_];
    fill_(slot, this->next_seq_++, level, tag, message);
    this->live_head_ = static_cast<uint16_t>((this->live_head_ + 1) % this->live_cap_);

    this->admit_(slot);
    xSemaphoreGive(this->lock_);
  }

  /// Copy live-scratch lines with `seq > since` into `out`, oldest first.
  /// `next_seq` is the sequence the caller should pass on the next poll — when
  /// `out_cap` truncates the read it points just past the last copied line, so
  /// the remainder is delivered on the following poll instead of being skipped.
  bool copy_live_since(uint32_t since, LogLine *out, uint16_t out_cap, uint16_t *out_count,
                       uint32_t *next_seq) {
    if (out_count != nullptr)
      *out_count = 0;
    if (next_seq != nullptr)
      *next_seq = this->next_seq_;
    if (this->live_ == nullptr || out == nullptr || out_cap == 0)
      return false;
    if (xSemaphoreTake(this->lock_, pdMS_TO_TICKS(50)) != pdTRUE)
      return false;

    uint16_t n = 0;
    for (uint16_t i = 0; i < this->live_cap_ && n < out_cap; i++) {
      const LogLine &l = this->live_[(this->live_head_ + i) % this->live_cap_];
      if (l.seq == 0 || l.seq <= since)
        continue;
      out[n++] = l;
    }
    if (next_seq != nullptr)
      *next_seq = n != 0 ? out[n - 1].seq + 1 : this->next_seq_;
    xSemaphoreGive(this->lock_);
    if (out_count != nullptr)
      *out_count = n;
    return true;
  }

  /// Open a chronological read over everything currently in the smart FIFO.
  void smart_begin(SmartLogCursor *cursor) const {
    if (cursor == nullptr)
      return;
    const uint32_t writes = this->smart_writes_;
    cursor->last = writes;
    cursor->next = (this->smart_cap_ != 0 && writes > this->smart_cap_)
                       ? writes - this->smart_cap_
                       : 0;
  }

  /// Copy up to `out_cap` further lines. Returns the number copied; 0 means the
  /// cursor is exhausted (or the lock was unavailable — retry or stop).
  uint16_t smart_next_chunk(SmartLogCursor *cursor, LogLine *out, uint16_t out_cap) {
    if (this->smart_ == nullptr || cursor == nullptr || out == nullptr || out_cap == 0)
      return 0;
    if (xSemaphoreTake(this->lock_, pdMS_TO_TICKS(50)) != pdTRUE)
      return 0;

    uint16_t n = 0;
    while (cursor->next < cursor->last && n < out_cap) {
      const uint32_t index = cursor->next++;
      // Recycled since smart_begin() — emitting it would break chronology.
      if (this->smart_writes_ - index > this->smart_cap_)
        continue;
      const LogLine &l = this->smart_[index % this->smart_cap_];
      if (l.seq == 0)
        continue;
      out[n++] = l;
    }
    xSemaphoreGive(this->lock_);
    return n;
  }

 protected:
  static LogLine *alloc_ring_(uint16_t slots, uint16_t *cap_out) {
    *cap_out = 0;
    const size_t bytes = sizeof(LogLine) * slots;
    auto *ring = static_cast<LogLine *>(heap_caps_calloc(1, bytes, MALLOC_CAP_SPIRAM));
    uint16_t cap = slots;
    if (ring == nullptr) {
      // No PSRAM: keep a quarter of the window rather than losing the ring.
      cap = static_cast<uint16_t>(slots >= 4 ? slots / 4 : slots);
      ring = static_cast<LogLine *>(heap_caps_calloc(1, sizeof(LogLine) * cap, MALLOC_CAP_8BIT));
    }
    if (ring != nullptr)
      *cap_out = cap;
    return ring;
  }

  /// Fill a slot from the callback arguments, stripping ANSI colour escapes and
  /// flattening whitespace so every entry is one clean line.
  static void fill_(LogLine &slot, uint32_t seq, uint8_t level, const char *tag,
                    const char *message) {
    slot.seq = seq;
    slot.level = level;
    if (tag != nullptr) {
      std::strncpy(slot.tag, tag, LOG_TAG_LEN - 1);
      slot.tag[LOG_TAG_LEN - 1] = '\0';
    } else {
      slot.tag[0] = '\0';
    }
    size_t o = 0;
    for (const char *p = message; *p != '\0' && o < LOG_MSG_LEN - 1; ++p) {
      if (*p == '\x1b') {
        while (*p != '\0' && *p != 'm')
          ++p;
        if (*p == '\0')
          break;
        continue;  // also skip the terminating 'm'
      }
      char c = *p;
      if (c == '\n' || c == '\r' || c == '\t')
        c = ' ';
      slot.msg[o++] = c;
    }
    slot.msg[o] = '\0';
  }

  void push_smart_(const LogLine &line) {
    if (this->smart_ == nullptr)
      return;
    this->smart_[this->smart_writes_ % this->smart_cap_] = line;
    this->smart_writes_++;
  }

  void push_ctx_(const LogLine &line) {
    if (this->ctx_ == nullptr)
      return;
    this->ctx_[this->ctx_head_] = line;
    this->ctx_head_ = static_cast<uint16_t>((this->ctx_head_ + 1) % this->ctx_cap_);
    if (this->ctx_count_ < this->ctx_cap_)
      this->ctx_count_++;
  }

  /// Move the pre-alarm context scratch into the smart FIFO, oldest first, and
  /// clear it so the next alarm gets a fresh window.
  void flush_ctx_() {
    if (this->ctx_ == nullptr)
      return;
    const uint16_t start =
        static_cast<uint16_t>((this->ctx_head_ + this->ctx_cap_ - this->ctx_count_) % this->ctx_cap_);
    for (uint16_t i = 0; i < this->ctx_count_; i++)
      this->push_smart_(this->ctx_[(start + i) % this->ctx_cap_]);
    this->ctx_count_ = 0;
  }

  /// Smart-FIFO admission. Called with the lock held.
  void admit_(const LogLine &line) {
    const LogGroup group = smart_log_detail::classify(line.tag);

    if (line.level <= ESPHOME_LOG_LEVEL_WARN) {
      this->flush_ctx_();
      this->push_smart_(line);
      this->cooldown_group_ = group;
      this->cooldown_until_ms_ = millis() + COOLDOWN_MS;
      return;
    }

    const bool rare_event = line.level <= ESPHOME_LOG_LEVEL_CONFIG &&
                            smart_log_detail::info_allowlisted(line.tag);
    const bool in_cooldown = this->cooldown_group_ != LogGroup::NONE &&
                             group == this->cooldown_group_ &&
                             static_cast<int32_t>(this->cooldown_until_ms_ - millis()) > 0;
    if (rare_event || in_cooldown) {
      this->push_smart_(line);
      return;
    }
    // Not admitted on its own merit: hold it as context for the next alarm.
    this->push_ctx_(line);
  }

  SemaphoreHandle_t lock_{nullptr};

  LogLine *live_{nullptr};
  uint16_t live_cap_{0};
  uint16_t live_head_{0};

  LogLine *smart_{nullptr};
  uint16_t smart_cap_{0};
  uint32_t smart_writes_{0};  ///< total admissions; slot = index % smart_cap_

  LogLine *ctx_{nullptr};
  uint16_t ctx_cap_{0};
  uint16_t ctx_head_{0};
  uint16_t ctx_count_{0};

  uint32_t next_seq_{1};
  uint32_t dropped_{0};
  LogGroup cooldown_group_{LogGroup::NONE};
  uint32_t cooldown_until_ms_{0};
};

}  // namespace lv6_dashboard
}  // namespace esphome
