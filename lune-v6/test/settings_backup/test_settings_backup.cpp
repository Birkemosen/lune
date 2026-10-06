// Host test for the Lune V6 settings backup (export / import) helpers.
//
//   clang++ -std=c++17 -O2 -Wall -Wextra \
//       -I components/lv6_dashboard -I components/lv6_config_store \
//       test/settings_backup/test_settings_backup.cpp \
//       components/lv6_dashboard/settings_backup.cpp -o /tmp/test_settings_backup

#include "settings_backup.h"

#include <cmath>
#include <cstdio>
#include <cstring>
#include <string>

namespace sb = esphome::lv6_dashboard::settings_backup;

namespace {

int failures = 0;

void expect(bool condition, const char *message) {
  if (condition) {
    std::printf("PASS  %s\n", message);
  } else {
    std::printf("FAIL  %s\n", message);
    failures++;
  }
}

void expect_near(float actual, float expected, const char *message) {
  const bool ok = std::fabs(actual - expected) < 1e-3f;
  if (!ok)
    std::printf("      expected %.6f, got %.6f\n", expected, actual);
  expect(ok, message);
}

std::string replace_once(const std::string &src, const std::string &from, const std::string &to) {
  const size_t at = src.find(from);
  if (at == std::string::npos) {
    std::printf("FAIL  fixture: cannot find \"%s\" in document\n", from.c_str());
    failures++;
    return src;
  }
  std::string out = src;
  out.replace(at, from.size(), to);
  return out;
}

lv6::DeviceConfig make_known_config() {
  lv6::DeviceConfig cfg{};

  std::snprintf(cfg.authority.installation_id, sizeof(cfg.authority.installation_id), "house-1");
  std::snprintf(cfg.authority.coordinator_id, sizeof(cfg.authority.coordinator_id), "touch-1");
  std::snprintf(cfg.authority.shared_key, sizeof(cfg.authority.shared_key),
                "SUPER-SECRET-SHARED-KEY");

  cfg.manifold_type = lv6::ManifoldType::NC;

  cfg.motor.default_profile = lv6::MotorProfile::GENERIC;
  cfg.motor.close_current_factor = 1.85f;
  cfg.motor.working_range_learning = false;
  cfg.motor.learn_open_start_ripples = 2050;
  cfg.motor.learn_samples = 4;
  cfg.motor.close_slope_threshold_ma_per_s = 0.8f;
  cfg.motor.close_slope_current_factor = 1.4f;
  cfg.motor.open_current_factor = 1.55f;
  cfg.motor.open_slope_threshold_ma_per_s = 0.2f;
  cfg.motor.open_slope_current_factor = 1.2f;
  cfg.motor.open_ripple_limit_factor = 1.25f;
  cfg.motor.pin_engage_step_ma = 4.5f;
  cfg.motor.pin_engage_margin_ripples = 60;
  cfg.motor.generic_profile_runtime_limit_s = 55;
  cfg.motor.hmip_vdmot_runtime_limit_s = 32;
  cfg.motor.relearn_after_movements = 1500;
  cfg.motor.relearn_after_hours = 200;
  cfg.motor.learned_factor_min_samples = 7;
  cfg.motor.learned_factor_max_deviation_pct = 0.2f;
  cfg.motor.auto_apply_learned_factors = false;
  cfg.motor.motion_decision_ms = 900;
  cfg.motor.stall_plateau_factor_x10 = 35;
  cfg.motor.stall_plateau_floor_ms = 180;
  cfg.motor.stall_plateau_ceiling_ms = 800;
  cfg.motor.endpoint_window_tolerance_pct = 30;
  cfg.motor.open_endstop_current_factor = 1.35f;
  cfg.motor.contact_recovery_ripples = 22;

  cfg.control.comfort_band_c = 0.75f;
  cfg.control.simple_preheat_enabled = false;
  cfg.control.preheat_absorb_enabled = false;
  cfg.control.preheat_absorb_band_c = 1.5f;
  cfg.control.preheat_detect_delta_c = 9.5f;
  cfg.control.mode = lv6::HeatingProfile::NORMAL;
  cfg.control.hp_overheat_margin_c = 1.2f;
  cfg.control.hp_base_pct = 55.0f;
  cfg.control.hp_trim_floor_pct = 12.0f;
  cfg.control.hp_demand_pct = 85.0f;

  cfg.balancing.secondary_flow_commissioning_enabled = true;
  cfg.balancing.secondary_min_total_opening_pct = 45.0f;
  cfg.balancing.mode = lv6::BalanceMode::ADAPTIVE;

  cfg.sensor_config.ble_clock_sync_enabled = false;
  cfg.sensor_config.ble_clock_sync_interval_min = 120;

  cfg.probes.manifold_flow_probe = 5;
  cfg.probes.manifold_return_probe = lv6::PROBE_UNASSIGNED;
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++)
    cfg.probes.zone_return_probe[i] = static_cast<int8_t>(lv6::NUM_ZONES - 1 - i);

  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    lv6::ZoneConfig &z = cfg.zones[i];
    std::snprintf(z.name, sizeof(z.name), "Zone \"%u\"", i + 1u);
    z.enabled = (i % 2) == 0;
    z.setpoint_c = 21.5f + 0.25f * i;
    z.area_m2 = 12.0f + i;
    z.pipe_spacing_mm = 150.0f + 10.0f * i;
    z.pipe_type = lv6::PipeType::PEX_18X2;
    z.sync_to_zone = (i == 1) ? 0 : -1;
    z.motor_profile_override =
        (i == 2) ? lv6::MotorProfile::HMIP_VDMOT : lv6::MotorProfile::INHERIT;
    z.min_offset_c = -1.5f;
    z.max_offset_c = 2.5f;
    z.abs_min_c = 6.0f;
    z.abs_max_c = 28.0f;

    cfg.sensor_config.zone_temp_source[i] =
        (i == 0) ? lv6::TempSource::LOCAL_PROBE
                 : (i == 1) ? lv6::TempSource::EXTERNAL : lv6::TempSource::BLE_SENSOR;
    std::snprintf(cfg.sensor_config.zone_ble_mac[i], lv6::BLE_MAC_LEN, "AA:BB:CC:DD:EE:0%u", i);
    if (i == 1) {
      std::snprintf(cfg.sensor_config.zone_sensor_id[i], lv6::SENSOR_ID_LEN, "sensor.living_room");
      std::snprintf(cfg.sensor_config.zone_sensor_name[i], lv6::SENSOR_NAME_LEN, "Living");
    }
  }

  return cfg;
}

void fill_learned(lv6::MotorTelemetry learned[lv6::NUM_ZONES]) {
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    learned[i].stroke_model = lv6::StrokeModel::WORKING_RANGE;
    learned[i].learned_open_ripples = 1000u + 37u * i;
    learned[i].learned_close_ripples = 900u + 41u * i;
    learned[i].contact_to_stop_close_ripples = 950u + 29u * i;
    learned[i].learned_open_ms = 12000u + 100u * i;
    learned[i].learned_close_ms = 13000u + 100u * i;
    learned[i].learned_open_current_factor = 1.6f + 0.05f * i;
    learned[i].learned_close_current_factor = 1.7f + 0.05f * i;
  }
}

}  // namespace

int main() {
  const lv6::DeviceConfig source = make_known_config();

  lv6::MotorTelemetry learned[lv6::NUM_ZONES]{};
  fill_learned(learned);

  uint64_t probe_addrs[lv6::MAX_PROBES]{};
  for (uint8_t i = 0; i < lv6::MAX_PROBES; i++)
    probe_addrs[i] = 0x28FF000000000001ull + i;

  // --- 1. Export -----------------------------------------------------------
  char buffer[16384];
  const sb::ExportOptions opt{};
  const size_t written =
      sb::write_export_json(buffer, sizeof(buffer), source, "v1.2.3", learned, true, probe_addrs, opt);
  expect(written > 0 && written == std::strlen(buffer), "export writes a null-terminated document");
  const std::string doc(buffer);
  expect(doc.find("\"_type\":\"lune-v6-settings\"") != std::string::npos,
         "export carries the envelope type");
  expect(doc.find("\"_version\":1") != std::string::npos, "export carries the schema version");
  expect(doc.find("\"zone\":6") != std::string::npos, "export carries config_versions from lv6_types");
  expect(doc.find("\"installation_id\":\"house-1\"") != std::string::npos,
         "authority identity is exported as metadata");

  // --- 2. No secrets in the export ----------------------------------------
  expect(doc.find("shared_key") == std::string::npos, "export never names shared_key");
  expect(doc.find("SUPER-SECRET-SHARED-KEY") == std::string::npos,
         "export never contains the shared key value");

  char tiny[64];
  expect(sb::write_export_json(tiny, sizeof(tiny), source, "v1.2.3", learned, true, probe_addrs,
                               opt) == 0,
         "export reports failure instead of truncating");

  // --- 3. Round trip -------------------------------------------------------
  lv6::DeviceConfig restored{};
  lv6::MotorTelemetry restored_learned[lv6::NUM_ZONES]{};
  uint64_t restored_addrs[lv6::MAX_PROBES]{};
  bool learned_applied = false;
  bool probes_applied = false;
  sb::ImportResult r = sb::apply_import_json(doc.c_str(), restored, true, restored_learned,
                                             &learned_applied, restored_addrs, &probes_applied);
  expect(r.ok, "round-trip import succeeds");
  expect(r.applied > 100, "round-trip import applies the full settings set");
  expect(r.ignored == 0, "a self-produced export has no unknown keys");

  expect(restored.manifold_type == lv6::ManifoldType::NC, "manifold type round-trips");
  expect(restored.motor.default_profile == lv6::MotorProfile::GENERIC,
         "default motor profile round-trips");
  expect_near(restored.motor.close_current_factor, 1.85f, "close current factor round-trips");
  expect(!restored.motor.working_range_learning && restored.motor.learn_open_start_ripples == 2050 &&
             restored.motor.learn_samples == 4,
         "working-range learning policy round-trips");
  expect_near(restored.motor.open_ripple_limit_factor, 1.25f, "open ripple limit round-trips");
  expect(restored.motor.generic_profile_runtime_limit_s == 55u, "generic runtime limit round-trips");
  expect(restored.motor.hmip_vdmot_runtime_limit_s == 32u, "HmIP close runtime limit round-trips");
  expect(restored.motor.relearn_after_movements == 1500u, "relearn movements round-trip");
  expect(restored.motor.relearn_after_hours == 200u, "relearn hours round-trip");
  expect(!restored.motor.auto_apply_learned_factors, "auto-apply learned factors round-trips");
  expect(restored.motor.learned_factor_min_samples == 7, "learned factor samples round-trip");
  expect(restored.motor.motion_decision_ms == 900u, "motion decision point round-trips");
  expect(restored.motor.stall_plateau_factor_x10 == 35, "stall plateau factor round-trips");
  expect_near(restored.motor.open_endstop_current_factor, 1.35f,
              "open endstop factor round-trips");
  expect(restored.motor.contact_recovery_ripples == 22, "contact recovery round-trips");

  expect_near(restored.control.comfort_band_c, 0.75f, "comfort band round-trips");
  expect(restored.control.mode == lv6::HeatingProfile::NORMAL, "heating mode round-trips");
  expect_near(restored.control.hp_overheat_margin_c, 1.2f, "hp overheat margin round-trips");
  expect_near(restored.control.hp_base_pct, 55.0f, "hp base opening round-trips");
  expect_near(restored.control.hp_trim_floor_pct, 12.0f, "hp trim floor round-trips");
  expect_near(restored.control.hp_demand_pct, 85.0f, "hp demand opening round-trips");
  expect(!restored.control.simple_preheat_enabled, "simple preheat flag round-trips");
  expect_near(restored.control.preheat_absorb_band_c, 1.5f, "preheat absorb band round-trips");

  expect(restored.balancing.secondary_flow_commissioning_enabled,
         "secondary flow commissioning round-trips");
  expect_near(restored.balancing.secondary_min_total_opening_pct, 45.0f,
              "secondary min opening round-trips");
  expect(restored.balancing.mode == lv6::BalanceMode::ADAPTIVE, "balance mode round-trips");

  expect(!restored.sensor_config.ble_clock_sync_enabled, "BLE clock sync flag round-trips");
  expect(restored.sensor_config.ble_clock_sync_interval_min == 120,
         "BLE clock sync interval round-trips");

  expect(restored.probes.manifold_flow_probe == 5, "manifold flow probe round-trips");
  expect(restored.probes.manifold_return_probe == lv6::PROBE_UNASSIGNED,
         "unassigned manifold return probe round-trips");

  bool zones_ok = true;
  bool probes_ok = true;
  bool sensors_ok = true;
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    const lv6::ZoneConfig &a = source.zones[i];
    const lv6::ZoneConfig &b = restored.zones[i];
    zones_ok = zones_ok && std::strcmp(a.name, b.name) == 0 && a.enabled == b.enabled &&
               std::fabs(a.setpoint_c - b.setpoint_c) < 1e-3f &&
               std::fabs(a.area_m2 - b.area_m2) < 1e-3f &&
               std::fabs(a.pipe_spacing_mm - b.pipe_spacing_mm) < 1e-3f &&
               a.pipe_type == b.pipe_type && a.sync_to_zone == b.sync_to_zone &&
               a.motor_profile_override == b.motor_profile_override &&
               std::fabs(a.min_offset_c - b.min_offset_c) < 1e-3f &&
               std::fabs(a.max_offset_c - b.max_offset_c) < 1e-3f &&
               std::fabs(a.abs_min_c - b.abs_min_c) < 1e-3f &&
               std::fabs(a.abs_max_c - b.abs_max_c) < 1e-3f;
    sensors_ok = sensors_ok &&
                 source.sensor_config.zone_temp_source[i] ==
                     restored.sensor_config.zone_temp_source[i] &&
                 std::strcmp(source.sensor_config.zone_ble_mac[i],
                             restored.sensor_config.zone_ble_mac[i]) == 0 &&
                 std::strcmp(source.sensor_config.zone_sensor_id[i],
                             restored.sensor_config.zone_sensor_id[i]) == 0 &&
                 std::strcmp(source.sensor_config.zone_sensor_name[i],
                             restored.sensor_config.zone_sensor_name[i]) == 0;
    probes_ok = probes_ok && source.probes.zone_return_probe[i] == restored.probes.zone_return_probe[i];
  }
  expect(zones_ok, "every zone's settings round-trip (including quoted names)");
  expect(sensors_ok, "zone temp source, BLE MAC, and EXTERNAL sensor_id round-trip");
  expect(probes_ok, "zone return probe map round-trips");

  expect(learned_applied, "learned data is restored when the caller confirms");
  bool learned_ok = true;
  for (uint8_t i = 0; i < lv6::NUM_ZONES; i++) {
    learned_ok = learned_ok &&
                 restored_learned[i].learned_open_ripples == learned[i].learned_open_ripples &&
                 restored_learned[i].learned_close_ripples == learned[i].learned_close_ripples &&
                 restored_learned[i].stroke_model == lv6::StrokeModel::WORKING_RANGE &&
                 restored_learned[i].contact_to_stop_close_ripples ==
                     learned[i].contact_to_stop_close_ripples &&
                 restored_learned[i].learned_open_ms == learned[i].learned_open_ms &&
                 restored_learned[i].learned_close_ms == learned[i].learned_close_ms &&
                 std::fabs(restored_learned[i].learned_open_current_factor -
                           learned[i].learned_open_current_factor) < 1e-3f &&
                 std::fabs(restored_learned[i].learned_close_current_factor -
                           learned[i].learned_close_current_factor) < 1e-3f;
  }
  expect(learned_ok, "learned ripples and current factors round-trip");

  // Full-stroke counts must never come back as a working range: 100 % would
  // then open far past pin release, toward the gear stop.
  {
    lv6::MotorTelemetry legacy[lv6::NUM_ZONES]{};
    fill_learned(legacy);
    for (auto &t : legacy)
      t.stroke_model = lv6::StrokeModel::FULL_STROKE;
    char legacy_buf[16384];
    sb::write_export_json(legacy_buf, sizeof(legacy_buf), source, "v1.2.3", legacy, true,
                          probe_addrs, opt);
    lv6::DeviceConfig cfg{};
    lv6::MotorTelemetry into[lv6::NUM_ZONES]{};
    bool applied = false;
    sb::apply_import_json(legacy_buf, cfg, true, into, &applied, nullptr, nullptr);
    bool untouched = true;
    for (const auto &t : into)
      untouched = untouched && t.learned_open_ripples == 0 && t.learned_close_ripples == 0 &&
                  t.stroke_model == lv6::StrokeModel::FULL_STROKE;
    expect(untouched, "full-stroke learned counts are not restored");
  }

  expect(probes_applied, "1-Wire probe addresses are restored");
  bool addrs_ok = true;
  for (uint8_t i = 0; i < lv6::MAX_PROBES; i++)
    addrs_ok = addrs_ok && restored_addrs[i] == probe_addrs[i];
  expect(addrs_ok, "1-Wire probe addresses round-trip exactly");

  // --- 4. Learned is skipped without confirmation --------------------------
  {
    lv6::DeviceConfig cfg{};
    lv6::MotorTelemetry keep[lv6::NUM_ZONES]{};
    bool applied = true;
    const sb::ImportResult res =
        sb::apply_import_json(doc.c_str(), cfg, false, keep, &applied, nullptr, nullptr);
    expect(res.ok && !applied, "learned data is skipped when the caller declines");
    expect(keep[0].learned_open_ripples == 0, "declined learned data leaves telemetry untouched");
    expect(res.skipped > 0, "declined learned data is counted as skipped");
  }

  // --- 4b. Legacy key from before the Rev 3.2 removal ----------------------
  {
    lv6::DeviceConfig cfg{};
    const std::string legacy =
        replace_once(doc, "\"motion_decision_ms\"", "\"rev32_motion_decision_ms\"");
    const sb::ImportResult res =
        sb::apply_import_json(legacy.c_str(), cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(res.ok && cfg.motor.motion_decision_ms == 900u,
           "legacy rev32_motion_decision_ms still imports");
  }

  // --- 5. Envelope rejection ----------------------------------------------
  {
    lv6::DeviceConfig cfg{};
    const std::string bad = replace_once(doc, "lune-v6-settings", "lune-touch-settings");
    const sb::ImportResult res =
        sb::apply_import_json(bad.c_str(), cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(!res.ok && std::strcmp(res.error_code, "bad_type") == 0,
           "a foreign _type is rejected");
    expect(cfg.manifold_type == lv6::ManifoldType::NO, "a rejected import changes nothing");
  }
  {
    lv6::DeviceConfig cfg{};
    const std::string bad = replace_once(doc, "\"_version\":1", "\"_version\":99");
    const sb::ImportResult res =
        sb::apply_import_json(bad.c_str(), cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(!res.ok && std::strcmp(res.error_code, "unsupported_version") == 0,
           "a newer schema version is rejected");
  }
  {
    lv6::DeviceConfig cfg{};
    const sb::ImportResult res =
        sb::apply_import_json("{ not json at all", cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(!res.ok, "malformed JSON is rejected");
  }

  // --- 6. Unknown keys are ignored, known ones still apply -----------------
  {
    lv6::DeviceConfig cfg{};
    std::string extended = replace_once(doc, "{\"_type\"", "{\"future_root\":[1,2,{\"x\":3}],\"_type\"");
    extended = replace_once(extended, "\"settings\":{",
                            "\"settings\":{\"future_section\":{\"nested\":{\"deep\":true}},");
    extended = replace_once(extended, "\"comfort_band_c\"",
                            "\"future_control_field\":\"whatever\",\"comfort_band_c\"");
    const sb::ImportResult res =
        sb::apply_import_json(extended.c_str(), cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(res.ok, "unknown keys do not fail the import");
    expect(res.ignored >= 2, "unknown top-level and settings keys are counted as ignored");
    expect_near(cfg.control.comfort_band_c, 0.75f,
                "known fields still apply alongside unknown ones");
    expect(cfg.manifold_type == lv6::ManifoldType::NC, "unknown sections do not shadow known ones");
  }

  // --- 7. Older zone semantics: unknown hydraulic keys are ignored ---------
  {
    lv6::DeviceConfig cfg{};
    // Inject legacy Touch-owned identity keys; they must not fail the import.
    std::string legacy = replace_once(doc, "\"setpoint_c\"",
                                      "\"manifold_id\":\"UFH-A\",\"room_id\":\"room-1\","
                                      "\"setpoint_c\"");
    const sb::ImportResult res =
        sb::apply_import_json(legacy.c_str(), cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(res.ok, "a backup with legacy identity keys still imports");
    expect_near(cfg.zones[0].setpoint_c, 21.5f, "zone settings still apply beside unknown keys");
  }

  // --- 8. Credentials are never restored -----------------------------------
  {
    lv6::DeviceConfig cfg{};
    std::snprintf(cfg.authority.installation_id, sizeof(cfg.authority.installation_id), "real-house");
    std::snprintf(cfg.authority.coordinator_id, sizeof(cfg.authority.coordinator_id), "real-touch");
    std::snprintf(cfg.authority.shared_key, sizeof(cfg.authority.shared_key), "REAL-DEVICE-KEY");

    const std::string malicious = replace_once(
        doc, "\"settings\":{",
        "\"settings\":{\"authority\":{\"shared_key\":\"ATTACKER-KEY\",\"installation_id\":"
        "\"attacker-house\",\"coordinator_id\":\"attacker-touch\"},");
    const sb::ImportResult res =
        sb::apply_import_json(malicious.c_str(), cfg, true, nullptr, nullptr, nullptr, nullptr);
    expect(res.ok, "a backup carrying credentials still imports its settings");
    expect(std::strcmp(cfg.authority.shared_key, "REAL-DEVICE-KEY") == 0,
           "shared key is never overwritten by an import");
    expect(std::strcmp(cfg.authority.installation_id, "real-house") == 0,
           "installation id is never overwritten by an import");
    expect(std::strcmp(cfg.authority.coordinator_id, "real-touch") == 0,
           "coordinator id is never overwritten by an import");
    expect(cfg.manifold_type == lv6::ManifoldType::NC,
           "settings around the credentials block still apply");
  }

  // --- Rev 3.3 mechanical-ceiling guards -----------------------------------
  // apply_int/apply_float CLAMP into the accepted range rather than rejecting,
  // so the property under test is that the accepted range itself can no longer
  // Mechanical housing-exit ceiling is 40 s; values above it are clamped.
  {
    lv6::DeviceConfig cfg = make_known_config();
    const char *json = "{\"_type\":\"lune-v6-settings\",\"_version\":1,"
                       "\"config_versions\":{\"motor\":4},"
                       "\"settings\":{\"motor\":{\"hmip_vdmot_runtime_limit_s\":40}}}";
    sb::ImportResult r =
        sb::apply_import_json(json, cfg, false, nullptr, nullptr, nullptr, nullptr);
    expect(r.ok, "close-ceiling import completes");
    expect(cfg.motor.hmip_vdmot_runtime_limit_s == 40u,
           "40 s close ceiling is accepted as the mechanical max");
  }
  {
    lv6::DeviceConfig cfg = make_known_config();
    const char *json = "{\"_type\":\"lune-v6-settings\",\"_version\":1,"
                       "\"config_versions\":{\"motor\":4},"
                       "\"settings\":{\"motor\":{\"hmip_vdmot_runtime_limit_s\":41}}}";
    sb::ImportResult r =
        sb::apply_import_json(json, cfg, false, nullptr, nullptr, nullptr, nullptr);
    expect(r.ok, "over-ceiling import completes");
    expect(cfg.motor.hmip_vdmot_runtime_limit_s <= 40u,
           "values above 40 s are clamped to the mechanical ceiling");
  }
  {
    // A file predating the v4 motor blob knows nothing about the direction-split
    // ceilings, so they must stay at their measured defaults rather than being
    // paired with v3 values.
    lv6::DeviceConfig cfg = make_known_config();
    const char *json = "{\"_type\":\"lune-v6-settings\",\"_version\":1,"
                       "\"config_versions\":{\"motor\":3},"
                       "\"settings\":{\"motor\":{\"generic_profile_runtime_limit_s\":55,"
                       "\"close_runtime_limit_counts\":9999}}}";
    sb::ImportResult r =
        sb::apply_import_json(json, cfg, false, nullptr, nullptr, nullptr, nullptr);
    expect(r.ok, "older motor blob still imports");
    expect(cfg.motor.generic_profile_runtime_limit_s == 55u,
           "v3 fields still restore from a v3 file");
    const lv6::MotorConfig d{};
    expect(cfg.motor.close_runtime_limit_counts == d.close_runtime_limit_counts,
           "v3 file leaves the v4 ceiling policy at its measured defaults");
  }
  {
    // pin_engage_step_ma used to be inert, so stored garbage was harmless. It
    // now configures StrokeTracker directly against a ~1 mA/s ramp.
    lv6::DeviceConfig cfg = make_known_config();
    const char *json = "{\"_type\":\"lune-v6-settings\",\"_version\":1,"
                       "\"config_versions\":{\"motor\":4},"
                       "\"settings\":{\"motor\":{\"pin_engage_step_ma\":8.0}}}";
    sb::ImportResult r =
        sb::apply_import_json(json, cfg, false, nullptr, nullptr, nullptr, nullptr);
    expect(r.ok, "pin-step import completes");
    expect(cfg.motor.pin_engage_step_ma <= 4.0f,
           "an oversized pin step is clamped so pin detection still works");
  }

  if (failures == 0) {
    std::puts("All settings backup tests passed.");
    return 0;
  }
  std::printf("%d settings backup test(s) failed.\n", failures);
  return 1;
}
