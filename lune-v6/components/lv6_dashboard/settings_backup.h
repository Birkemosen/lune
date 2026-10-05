// =============================================================================
// LV6 Settings Backup — human-readable settings export / import
// =============================================================================
// Serializes the user-owned parts of DeviceConfig as named JSON fields rather
// than binary NVS blobs, so a backup taken on one firmware can still be
// restored after a per-section NVS version bump.
//
// Secrets are never exported: authority.shared_key, Wi-Fi credentials and local
// access keys are outside this file's scope and are never read from an import.
//
// Pure C++ (no ESP-IDF), so it can be host-tested:
//   clang++ -std=c++17 -I components/lv6_dashboard -I components/lv6_config_store \
//       test/settings_backup/test_settings_backup.cpp \
//       components/lv6_dashboard/settings_backup.cpp -o /tmp/test_settings_backup
// =============================================================================

#pragma once

#include <cstddef>
#include <cstdint>

#include "../lv6_config_store/lv6_types.h"

namespace esphome {
namespace lv6_dashboard {
namespace settings_backup {

/// Export envelope schema version. Independent of any NVS section version: it
/// only describes the shape of the JSON document. An import whose `_version`
/// is higher than this is rejected rather than partially understood.
static constexpr uint32_t EXPORT_SCHEMA_VERSION = 1;

/// Envelope discriminator. Anything else is rejected.
static constexpr const char *EXPORT_TYPE = "lune-v6-settings";

struct ExportOptions {
  bool include_learned{true};
};

struct ImportResult {
  bool ok{false};
  char error_code[32]{};
  char error_message[96]{};
  uint16_t applied{0};  ///< Fields taken from the file
  uint16_t skipped{0};  ///< Fields present but deliberately not applied
  uint16_t ignored{0};  ///< Keys this firmware does not understand
};

/// Write the export document into `out` (always null-terminated on success).
/// Returns bytes written excluding the NUL, or 0 if the buffer was too small.
///
/// `learned` may be null (or `has_learned` false) to omit the learned block;
/// `probe_addrs` may be null to omit the 1-Wire address map.
size_t write_export_json(char *out, size_t out_cap, const lv6::DeviceConfig &cfg,
                         const char *firmware_version,
                         const lv6::MotorTelemetry learned[lv6::NUM_ZONES],
                         bool has_learned,
                         const uint64_t probe_addrs[lv6::MAX_PROBES],
                         const ExportOptions &opt);

/// Parse `json` and apply it to `cfg`. This only mutates the in-memory config —
/// the caller is responsible for persisting through config_store.
///
/// `learned_out` is filled only when `restore_learned` is set and the file
/// carries a learned block; it is merged field-by-field, so the caller should
/// pass the current telemetry. `probe_addrs_out` behaves the same way.
/// Either may be null to decline that part of the restore.
ImportResult apply_import_json(const char *json, lv6::DeviceConfig &cfg,
                               bool restore_learned,
                               lv6::MotorTelemetry learned_out[lv6::NUM_ZONES],
                               bool *learned_applied,
                               uint64_t probe_addrs_out[lv6::MAX_PROBES],
                               bool *probes_applied);

}  // namespace settings_backup
}  // namespace lv6_dashboard
}  // namespace esphome
