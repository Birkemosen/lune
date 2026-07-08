# Lune Touch / Mini

This folder holds functionality that belongs in Lune Touch / Lune Mini rather than in
Lune V6's local manifold firmware.

## Firmware Workspace

The active Lune Touch prototype entrypoint is:

```text
devices/lune-touch/configurations/lune-touch-7.yaml
```

It targets a 7-inch ESP32-S3 RGB touch device with 16 MB flash and PSRAM. The
firmware skeleton already includes:

- custom 16 MB OTA partition table in `partitions/lune_touch_16mb_ota.csv`
- ESP-IDF/ESPHome board profile with PSRAM, WiFi, coredump, and mbedTLS memory rules
- network, OTA, safe mode, USB serial provisioning, and diagnostics packages
- a `lune_touch_coordinator` external component with host-testable coordinator models
- runtime per-zone temperature / heat-call history exposed through the Touch API
- LCD/LVGL stability rules documented in `docs/LCD_STABILITY.md`
- field validation steps documented in `docs/field_validation.md`

Useful commands from the repo root:

```bash
make config-lune-touch
make build-lune-touch
make config-lune-mini
make build-lune-mini
make test-lune-touch
```

`make build-lune-touch` also checks the produced firmware against the 0x640000
OTA slot from `partitions/lune_touch_16mb_ota.csv`.

The headless Lune Mini entrypoint is:

```text
devices/lune-touch/configurations/lune-mini.yaml
```

It includes the same coordinator, API, OTA, diagnostics, and local web dashboard
runtime as Lune Touch, but omits the display/LVGL package. This keeps the
Touch/Mini coordinator behavior shared while making display hardware an
entrypoint-level feature.

## Current Extraction

The first extracted module is the wind-aware forecast preload producer:

- `components/hv6_forecast/` - legacy ESPHome component and pure forecast model
- `packages/forecast.yaml` - legacy package wiring kept as reference
- `tests/forecast/` - host tests for the pure preload model
- `docs/forecast_preload.md` - coordinator-oriented design note
- `docs/api_v1.md` - embedded Touch dashboard/API contract

Lune V6 no longer builds or starts the local `hv6_forecast` HTTPS task. It keeps the local
setpoint-offset command path and firmware clamps, because coordinator commands must still
be validated and bounded by the manifold node.

## Ownership Boundary

Coordinator-owned:

- Weather fetch and caching
- Wind / solar / thermal-lead model
- House-wide preload decisions across one or more V6 nodes
- Adaptive whole-house learning and zone prioritization
- Per-room comfort bias, kept as coordinator intent and folded into strategy /
  forecast decisions before any V6 command is issued
- Persisted per-zone learning signals: samples, heat-call samples, temperature
  range, average temperature, and latest temperature rate
- Command ledger: source, reason, requested value, accepted value, expiry, clamp result

Lune V6-owned:

- Motor movement and endstop safety
- Local temperature source freshness
- Conservative zone control without coordinator
- Minimum flow protection
- Command validation, clamp, expiry, and reporting
- Snapshot / diagnostics API for local state

## Bringup Boundary

The first hardware profile is now concrete: Waveshare ESP32-S3-Touch-LCD-7B with
1024 x 600 RGB565, GT911 touch, and CH422G-controlled panel power/reset lines.
The remaining boundary is validation, not pin discovery. Treat changes to LCD
timings, LVGL buffers, HTTPS forecast behavior, dashboard bundle size, or poll
cadence as field-sensitive and re-run the checks in `docs/field_validation.md`
before trusting a flashed build.
