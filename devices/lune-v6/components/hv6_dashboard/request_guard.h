#pragma once

#include <cstdint>
#include <cstring>

namespace esphome {
namespace hv6_dashboard {
namespace request_guard {

enum class Decision : uint8_t { ACCEPT, DUPLICATE, STALE };

struct Entry {
  char key[48]{};
  uint32_t expires_ms{0};
};

template<size_t N>
class Guard {
 public:
  Decision check(uint32_t expected_revision, uint32_t current_revision, const char *key,
                 uint32_t now_ms) {
    if (expected_revision != 0 && expected_revision != current_revision)
      return Decision::STALE;
    if (key == nullptr || key[0] == '\0')
      return Decision::ACCEPT;  // legacy/non-physical writes remain conditional only when supplied
    for (auto &entry : entries_) {
      if (entry.key[0] != '\0' && !expired_(now_ms, entry.expires_ms) && strcmp(entry.key, key) == 0)
        return Decision::DUPLICATE;
    }
    Entry &entry = entries_[next_++ % N];
    strncpy(entry.key, key, sizeof(entry.key) - 1);
    entry.key[sizeof(entry.key) - 1] = '\0';
    entry.expires_ms = now_ms + 300000UL;
    return Decision::ACCEPT;
  }

 private:
  static bool expired_(uint32_t now, uint32_t expiry) { return static_cast<int32_t>(now - expiry) >= 0; }
  Entry entries_[N]{};
  size_t next_{0};
};

}  // namespace request_guard
}  // namespace hv6_dashboard
}  // namespace esphome
