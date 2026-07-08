# Lune Touch Build Plan

Lune Touch is the visible house coordinator for the Lune heating system: a 7-inch
wall-mounted touch device that coordinates one or more Lune V6 manifold nodes while
keeping each node independently safe.

## Product Role

Lune Touch should provide:

- Whole-house overview across one or more Lune V6 units
- Zone comfort planning and prioritization
- Learned thermal response per room / floor / house
- Weather, wind, solar, and flow-temperature-aware preload decisions
- Asgard / Odin bridge decisions using physical temperature and separate comfort demand
- Installation, diagnostics, commissioning, and recovery workflows

Lune Touch should not be required for Lune V6 to heat safely. If Touch is offline, each
V6 keeps running local fail-safe control with conservative setpoints and clamps.

## Hardware Direction

Target platform:

- ESP32-S3 module with PSRAM
- 7-inch capacitive touch display
- Local WiFi
- USB-C for power, debug, and provisioning
- Optional speaker / buzzer for installer feedback
- Optional ambient light sensor for display brightness
- Optional wired expansion connector for future service tooling

The first prototype can use an ESP32-S3 7-inch dev kit if it exposes enough PSRAM,
display bandwidth, touch support, and stable ESPHome / LVGL compatibility. The production
design should move to a controlled module and display stack once the UI and coordinator
contracts are proven.

## Firmware Architecture

Recommended starting point:

- ESPHome on ESP-IDF
- LVGL for local UI
- Native ESPHome API only for Home Assistant compatibility
- Dedicated Lune coordinator service for V6 discovery, snapshots, and commands
- NVS-backed local configuration with explicit schema versions
- OTA, safe mode, USB provisioning, and structured diagnostics from the beginning

The starter workspace for coordinator-owned code lives in [devices/lune-touch/](../devices/lune-touch/).
The first extracted module is the legacy wind-aware forecast preload producer, now kept as
reference implementation under `devices/lune-touch/components/hv6_forecast/`.

Initial firmware scaffolding now exists at
`devices/lune-touch/configurations/lune-touch-7.yaml`. It includes the 16 MB OTA
partition table, ESP32-S3/PSRAM SDK memory profile, network/OTA diagnostics
packages, LCD/LVGL stability documentation, and a host-testable coordinator model
for paired V6 nodes, zone registry mapping, stale-node detection, and command
ledger expiry.
The Lune Touch build now verifies the produced firmware against the configured
OTA slot so dashboard growth fails early instead of creating a field update risk.

The first hardware profile targets Waveshare ESP32-S3-Touch-LCD-7B: 1024 x 600
RGB565 over 16-bit RGB, GT911 touch on GPIO8/GPIO9 I2C, and CH422G-controlled
LCD/touch reset, VDD/VCOM enable, and backlight lines. The pin map and timings
are captured in `devices/lune-touch/docs/waveshare_esp32_s3_touch_lcd_7b.md`.

Lune Mini now has a headless coordinator entrypoint at
`devices/lune-touch/configurations/lune-mini.yaml`. It shares the same
coordinator/API/dashboard runtime as Touch and leaves display/LVGL out at the
entrypoint level, so Mini can be tested without introducing a separate runtime
branch.

Coordinator responsibilities:

- Discover and pair Lune V6 nodes
- Store a stable V6 identity fingerprint during commissioning and reject later
  polling responses from a different device on the same hostname/IP
- Poll `/api/hv6/v1/overview` and `/api/hv6/v1/zones`, while retaining `/state`
  as a migration/debug snapshot
- Maintain local house model and persisted lightweight per-zone history as the
  first learning layer for response rate, heat-call frequency, and future comfort tuning
- Persist a first per-zone schedule primitive (daily window, day mask, and
  schedule setpoint) alongside comfort intent and bias, ready for the later
  effective-comfort resolver
- Issue validated command-path offsets / biases to V6 nodes
- Expire commands aggressively when data becomes stale
- Block forecast dispatch to stale or unreachable V6 nodes before send, with
  diagnostics that distinguish skipped/offline decisions from actual send failures
- Expose an advisory Asgard / Odin strategy snapshot with priority-weighted
  physical house temperature and separate comfort demand
- Persist only coordinator-owned settings and learned model state

Lune V6 responsibilities remain local:

- Valve movement and endstop detection
- Motor fault handling and relearn actions
- Sensor freshness and local temperature source selection
- Minimum flow protection
- Zone safety clamps for external commands
- Snapshot and command API

## V6 API Requirements Before Touch

Before Lune Touch becomes the primary coordinator, Lune V6 should expose a clearer
resource-shaped API on top of the current `/api/hv6/v1` namespace:

- `GET /api/hv6/v1/overview`
- `GET /api/hv6/v1/zones`
- `GET /api/hv6/v1/diagnostics`
- `GET /api/hv6/v1/events` for server-sent events
- JSON-body command writes in addition to query-string compatibility
- Stable command-path fields for coordinator offsets, expiry, source, and reason

The existing raw `/state` endpoint can remain during migration so the current dashboard
continues to work.

## Touch UI Structure

The first screen should be the operating console, not a landing page.

Primary views:

- House: all zones, heat demand, active preloads, system health
- Zones: per-room comfort, schedule / bias, source freshness, learned response
- Manifolds: one card per Lune V6, motor state, valve positions, faults, flow / return
- Weather: forecast load, wind direction, solar relief, next preload decisions
- Diagnostics: pairing, API health, logs, failed commands, relearn actions
- Settings: coordinator identity, paired V6 nodes, Asgard / Odin, update controls

Interaction rules:

- Operational thermostat controls may be live
- Configuration changes use per-card Apply / Discard
- Potentially disruptive actions require explicit confirmation
- Stale data must be visually different from healthy data
- Every coordinator command should show source, target, expiry, and local clamp result

## Data Model

Core persisted entities:

- Coordinator identity and install profile
- Paired V6 nodes with hostname, fallback IP, model, firmware, and trust state
- Zone registry mapping house rooms to V6 zone indices
- Per-room comfort intent, schedule, bias, and optimization priority, stored separately
  from V6's local measured temperature and safety-clamped setpoint command path
- Per-zone thermal model coefficients
- Weather and forecast cache metadata
- Command ledger with source, reason, expiry, requested value, accepted value, and clamp
- Asgard / Odin integration settings

The data model should distinguish physical measurements, user comfort intent, optimizer
recommendations, and local safety results.

## Build Phases

| Phase | Status | Current state |
| --- | --- | --- |
| 1. Prototype UI shell on ESP32-S3 7-inch hardware with LVGL, OTA, WiFi, and mock V6 data. | Implemented | `lune-touch-7.yaml` builds for the Waveshare ESP32-S3 7-inch profile with OTA size checks, LVGL display wiring, local dashboard, and mock/runtime coordinator data. |
| 2. Pair and poll one Lune V6 over the current `/api/hv6/v1/state` endpoint. | Implemented | Touch stores nodes, scans/polls candidates, retains legacy `/state` ingestion as fallback, and prefers resource-shaped V6 endpoints when available. |
| 3. Add multi-V6 zone registry, health model, and read-only house overview. | Implemented | The coordinator model supports multiple V6 nodes, room-to-node/zone bindings, stale-state propagation, node health summaries, and house/zone/manifold dashboard views. |
| 4. Implement command-path writes with expiry, clamp reporting, and local fallback proof. | Implemented | Touch issues dashboard and forecast setpoint-offset commands with TTL, source/reason metadata, stale/unreachable/untrusted blocking, V6 response handling, persisted ledger records, and clamp reporting. V6 remains the safety authority. |
| 5. Move forecast preload and adaptive whole-house logic from V6 toward Touch. | Implemented for first field build | Touch owns Open-Meteo fetch/cache, per-zone wind/solar/thermal-lead decisions, forecast dispatch, dedupe, learned thermal-lead inputs, and forecast diagnostics. |
| 6. Add Asgard / Odin strategy: physical temperature selection plus separate comfort demand. | Implemented as advisory API | `GET /strategy` exposes priority-weighted physical house temperature, separate comfort demand, schedule driver, and advisory Asgard/Odin mode. |
| 7. Harden commissioning, offline behavior, OTA recovery, and production enclosure decisions. | Partly implemented, needs field validation | Commissioning readiness/blockers, identity fingerprint checks, destructive-action confirmations, offline command blocking, OTA partition diagnostics, CORS/preflight, and recovery APIs are in place. Remaining work is hardware soak, real V6 commissioning runs, final auth/pairing policy, and production enclosure/display decisions. |

## Field Readiness Boundary

The remaining work now depends on real hardware or installation context rather
than more speculative implementation. The firmware should be treated as ready
for structured field debugging when these repository-side checks pass:

- `make test-lune-touch`
- `make build-lune-touch`
- `make -C devices/lune-touch build-mini`
- `GET /api/lune-touch/v1/diagnostics` reports a concrete `commissioning.next_action`
- `GET /api/lune-touch/v1/forecast` exposes location/cache/fetch state without UI crashes
- `GET /api/lune-touch/v1/commands` shows blocked commands when nodes are stale,
  unreachable, or untrusted

Field validation is tracked in
[`devices/lune-touch/docs/field_validation.md`](../devices/lune-touch/docs/field_validation.md).

## Open Decisions

- UI runtime: keep ESPHome/LVGL plus embedded local web dashboard for this field
  build. Revisit a richer UI stack only after coordinator behavior is proven.
- Pairing/authentication: current field build uses stored V6 identity
  fingerprints and explicit trust promotion. Stronger authentication remains a
  production decision.
- Learning storage: current field build persists lightweight per-zone history,
  thermal coefficients, and command ledger state. Larger history stores remain
  out of scope until useful field signals are known.
- Resolver ordering: current implementation resolves comfort/schedule base,
  then active manual dashboard offsets over forecast offsets, then learned
  comfort tuning for eligible slow zones.
- Weather history: current implementation persists the latest forecast cache and
  metadata, not long-term weather history.
- Touch/Mini split: current field build keeps one shared coordinator/API/dashboard
  runtime, with display/LVGL selected by entrypoint.
- API namespace: current integration stays under `/api/hv6/v1` for V6 and
  `/api/lune-touch/v1` for Touch. A public Lune namespace remains a future
  migration.
