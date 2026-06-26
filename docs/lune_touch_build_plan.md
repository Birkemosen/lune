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

Coordinator responsibilities:

- Discover and pair Lune V6 nodes
- Poll `/api/hv6/v1/state`, `/api/hv6/v1/peer`, and future resource-shaped reads
- Maintain local house model and per-zone history
- Issue validated command-path offsets / biases to V6 nodes
- Expire commands aggressively when data becomes stale
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
- Per-zone thermal model coefficients
- Weather and forecast cache metadata
- Command ledger with source, reason, expiry, requested value, accepted value, and clamp
- Asgard / Odin integration settings

The data model should distinguish physical measurements, user comfort intent, optimizer
recommendations, and local safety results.

## Build Phases

1. Prototype UI shell on ESP32-S3 7-inch hardware with LVGL, OTA, WiFi, and mock V6 data.
2. Pair and poll one Lune V6 over the current `/api/hv6/v1/state` endpoint.
3. Add multi-V6 zone registry, health model, and read-only house overview.
4. Implement command-path writes with expiry, clamp reporting, and local fallback proof.
5. Move forecast preload and adaptive whole-house logic from V6 toward Touch.
6. Add Asgard / Odin strategy: physical temperature selection plus separate comfort demand.
7. Harden commissioning, offline behavior, OTA recovery, and production enclosure decisions.

## Open Decisions

- Whether Lune Touch should remain ESPHome/LVGL-only or run a richer local web UI stack
- Pairing and trust model between Touch and V6 nodes
- Minimum viable local storage for useful house learning
- How much weather history is stored locally versus fetched on demand
- Whether Lune Mini shares identical firmware with display features disabled
- Long-term migration path from `/api/hv6/v1` to a public Lune API namespace
