#include "lune_touch_coordinator.h"
#include "esphome/core/log.h"

namespace esphome {
namespace lune_touch_coordinator {

static const char *const TAG = "lune_touch";

void LuneTouchCoordinator::setup() {
  model_.set_node_stale_after_ms(node_stale_after_ms_);
  ESP_LOGI(TAG, "Lune Touch coordinator model ready");
  ESP_LOGI(TAG, "  stale_after=%ums max_nodes=%u ledger_capacity=%u",
           static_cast<unsigned>(node_stale_after_ms_),
           static_cast<unsigned>(::lune_touch::MAX_NODES),
           static_cast<unsigned>(::lune_touch::LEDGER_CAPACITY));
}

void LuneTouchCoordinator::dump_config() {
  ESP_LOGCONFIG(TAG, "Lune Touch Coordinator:");
  ESP_LOGCONFIG(TAG, "  Node stale after: %u ms", static_cast<unsigned>(node_stale_after_ms_));
  ESP_LOGCONFIG(TAG, "  V6 endpoints: /api/hv6/v1/state, /peer, /logs");
  ESP_LOGCONFIG(TAG, "  Command path: expiring coordinator commands, clamped by Lune V6");
}

}  // namespace lune_touch_coordinator
}  // namespace esphome
