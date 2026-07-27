# HV6 API v1 Contract

This document defines the dedicated dashboard API contract for Lune V6.

`/api/hv6/v1` is intentionally retained as an internal compatibility namespace during
the public rename from HeatValve-6 to Lune V6.

## Scope

- Dedicated namespace: `/api/hv6/v1`
- Dashboard transport: HTTP JSON + SSE
- Home Assistant integration remains on ESPHome API/entities/services
- Dashboard no longer depends on ESPHome entity-name REST routes
- Dashboard source is modularized under `devices/lune-v6/web/dashboard-src/` and bundled into `devices/lune-v6/web/dashboard.js`

## Current Implementation Status

All endpoints are served by the `hv6_dashboard` component as an `AsyncWebHandler` on the
device web server (port 80). The legacy `/dashboard/set`, `/dashboard/state`,
`/dashboard/history` and `/dashboard/ble-scan` routes have been removed; the dashboard app
itself is still served at `/dashboard` + `/dashboard.js`.

- Read endpoints (raw JSON, no envelope yet — see "Planned"):
  - `GET /api/hv6/v1/state` — full dashboard snapshot (entity-id → value map consumed by the frontend store)
  - `GET /api/hv6/v1/history` — 24 h ring buffer (288 slots @ 5 min). Each entry is
    `[uptime_s, z0, z1, z2, z3, z4, z5, absorbing, flow_c, return_c, demand_pct]` where
    `z0..z5` are `ZoneDisplayState` codes (`0xFF` = unknown), `absorbing` is `1` when preheat
    absorption was active at that sample (else `0`), `flow_c`/`return_c` are the manifold
    flow/return temps in °C (`null` if no reading), and `demand_pct` is the mean open-valve %
    above the active per-zone minimum-flow floor over zones with a reading (`null` if unknown).
    The trailing `flow_c`/`return_c`/`demand_pct`
    fields are appended after `absorbing` so index-based consumers (e.g. the zone-state timeline)
    are unaffected. Shape:
    `{"interval_s":300,"uptime_s":N,"count":N,"entries":[[…],…]}`
  - `GET /api/hv6/v1/logs?since=<seq>` — live device-log ring (last ~96 lines). Returns only lines
    newer than `<seq>`. Shape: `{"next_seq":N,"lines":[[seq,level,"tag","msg"],…]}` where `level`
    is the ESPHome log level (1=ERROR … 7=VERY_VERBOSE). Pass the previous `next_seq` (or the
    highest seen `seq`) back as `?since=` to append only new lines. RAM-only; reset on reboot.
  - `GET /api/hv6/v1/ble-scan` — discovered BTHome sensors
  - `GET /api/hv6/v1/peer` — compact board-to-board zone snapshot
    (`{"ok":true,"zones":[{"t":21.4,"sp":21.0,"area":18.5,"en":true},…]}`) consumed by the peer
    board's Asgard bridge; see [ecodan_integration.md](ecodan_integration.md)
- Write endpoints (JSON request bodies or backwards-compatible query parameters; return the v1 response envelope):
  - `POST /api/hv6/v1/zones/{zone}/setpoint?setpoint_c=<float>`
  - `POST /api/hv6/v1/zones/{zone}/enabled?enabled=true|false`
  - `POST /api/hv6/v1/zones/{zone}/setpoint-command`
  - `POST /api/hv6/v1/commands?command=<name>[&zone=1..6]`
  - `POST /api/hv6/v1/drivers/enabled?enabled=true|false`
  - `POST /api/hv6/v1/motors/{zone}/target?value=<0..100>`
  - `POST /api/hv6/v1/motors/{zone}/open_timed`
  - `POST /api/hv6/v1/motors/{zone}/close_timed`
  - `POST /api/hv6/v1/motors/{zone}/stop`
  - `POST /api/hv6/v1/settings/select?key=<name>&value=<value>[&zone=1..6]`
  - `POST /api/hv6/v1/settings/number?key=<name>&value=<value>[&zone=1..6]`
  - `POST /api/hv6/v1/settings/text?key=<name>&value=<value>[&zone=1..6]`
  - `POST /api/hv6/v1/manual_mode?enabled=true|false`
- Migration reads:
  - `GET /api/hv6/v1/overview`, `GET /api/hv6/v1/zones`,
    `GET /api/hv6/v1/zones/{zone}`, `GET /api/hv6/v1/settings`,
    `GET /api/hv6/v1/diagnostics`
  - `GET /api/hv6/v1/events` (SSE hello/poll stream placeholder)

Implemented command names:

- `i2c_scan`
- `motor_reset_fault` (requires `zone`)
- `motor_reset_and_relearn` (requires `zone`)
- `motor_reset_learned_factors` (requires `zone`)
- `open_motor_timed` / `close_motor_timed` / `stop_motor` (requires `zone`; also exposed as motor routes)

Implemented global settings keys (selection/number) relevant to local minimum flow:

- `min_zone_flow_pct` (number) — per-zone minimum opening used by the manual minimum-flow control
- `minimum_flow_always` (select: `on` | `off`) — manually enforce that floor for a modulating heat source, independent of the heat-source bridge

## Response Envelope

All JSON responses use this structure:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 1713111111000,
  "data": {}
}
```

Error responses:

```json
{
  "ok": false,
  "version": "v1",
  "ts_ms": 1713111111000,
  "error": {
    "code": "invalid_zone",
    "message": "Zone must be in range 1..6"
  }
}
```

## Read Endpoints

### `GET /api/hv6/v1/overview`

Returns controller-level snapshot:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 1713111111000,
  "data": {
    "controller_state": "running",
    "system_condition_state": "normal",
    "active_zones": 2,
    "avg_valve_pct": 31.5,
    "manifold": {
      "flow_c": 33.8,
      "return_c": 30.6
    },
    "motor": {
      "drivers_enabled": true,
      "fault": false,
      "current_ma": 21.4
    },
    "connectivity": {
      "ip": "192.168.1.50",
      "ssid": "MyWiFi",
      "mac": "AA:BB:CC:DD:EE:FF",
      "uptime_s": 123456
    },
    "firmware": {
      "version": "1.4.12"
    },
    "node": {
      "model": "lune-v6",
      "firmware": "1.4.12",
      "ip": "192.168.1.50",
      "mac": "AA:BB:CC:DD:EE:FF",
      "pairing_fingerprint": "hv6-aabbccddeeff"
    },
    "pairing": {
      "method": "mac-fingerprint-v1",
      "fingerprint": "hv6-aabbccddeeff"
    }
  }
}
```

`pairing.fingerprint` is a stable identity hint derived from the V6 MAC address.
Lune Touch stores it during commissioning and treats later overview responses
with a different fingerprint as an identity mismatch.

### `GET /api/hv6/v1/zones`

Returns all zones:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 1713111111000,
  "data": {
    "count": 6,
    "zones": [
      {
        "zone": 1,
        "name": "Zone 1",
        "enabled": true,
        "state": "heating",
        "temperature_c": 21.3,
        "setpoint_c": 22.0,
        "valve_pct": 47.0,
        "probe_temp_c": 21.2,
        "temp_source": "local_probe"
      }
    ]
  }
}
```

### `GET /api/hv6/v1/zones/{zone}`

Returns one zone with the settings and diagnostics fields required by dashboard details
panels and coordinator pairing checks:

```json
{
  "ok": true,
  "version": "v1",
  "data": {
    "zone": 1,
    "name": "Living",
    "enabled": true,
    "state": "HEATING",
    "fresh": true,
    "temperature_c": 21.3,
    "setpoint_c": 22.0,
    "valve_pct": 47,
    "preheat_c": 0.2,
    "temp_source": "BLE",
    "probe_index": 2,
    "probe_temp_c": 21.1,
    "ble_mac": "AA:BB:CC:DD:EE:FF",
    "settings": {
      "area_m2": 18.5,
      "pipe_spacing_mm": 150,
      "pipe_type": 2,
      "sync_to_zone": 0,
      "abs_min_c": 5.0,
      "abs_max_c": 35.0,
      "min_offset_c": -3.00,
      "max_offset_c": 3.00
    },
    "forecast": {
      "exterior_walls": 9,
      "wind_exposure": 0.80,
      "solar_gain": 0.20,
      "thermal_lead_h": 8,
      "max_offset_c": 1.25
    },
    "motor": {
      "fault": "none",
      "open_ripples": 120,
      "close_ripples": 118,
      "open_factor": 1.00,
      "close_factor": 1.00
    }
  }
}
```

### `GET /api/hv6/v1/diagnostics`

Returns diagnostics summary and latest fault/calibration state.

### `GET /api/hv6/v1/settings`

Returns dashboard-editable settings currently backed by config store and controllers:

```json
{
  "ok": true,
  "version": "v1",
  "data": {
    "control": {
      "simple_preheat_enabled": true,
      "preheat_absorb_enabled": true,
      "preheat_absorb_band_c": 1.0,
      "preheat_detect_delta_c": 8.0
    },
    "minimum_flow": {
      "enabled": false,
      "min_zone_flow_pct": 15.0
    },
    "manifold": {
      "type": "NC",
      "flow_probe": 7,
      "return_probe": 8
    },
    "motor": {
      "default_profile": "HMIP_VDMOT",
      "generic_runtime_limit_s": 45,
      "hmip_runtime_limit_s": 40,
      "relearn_after_movements": 120,
      "relearn_after_hours": 720
    },
    "asgard": {
      "enabled": false,
      "coordinator": false,
      "host": "",
      "port": 80,
      "entity_name": "virtual_thermostat_input_z1",
      "peer_host": "",
      "peer_port": 80,
      "peer_stale_after_s": 300
    },
    "zones": [
      {
        "zone": 1,
        "name": "Living",
        "enabled": true,
        "setpoint_c": 21.0,
        "area_m2": 18.5,
        "pipe_spacing_mm": 150,
        "pipe_type": "PEX_16X2",
        "temp_source": "BLE",
        "probe_index": 1,
        "sync_to_zone": 0,
        "ble_mac": "AA:BB:CC:DD:EE:FF",
        "limits": {
          "min_offset_c": -2.00,
          "max_offset_c": 2.00,
          "abs_min_c": 5.0,
          "abs_max_c": 30.0
        },
        "forecast": {
          "exterior_walls": 9,
          "wind_exposure": 0.80,
          "solar_gain": 0.20,
          "thermal_lead_h": 8,
          "max_offset_c": 2.00
        },
        "motor_profile": "INHERIT"
      }
    ]
  }
}
```

## Write Endpoints

### `POST /api/hv6/v1/zones/{zone}/setpoint`

Request:

```json
{
  "setpoint_c": 22.5
}
```

### `POST /api/hv6/v1/zones/{zone}/enabled`

Request:

```json
{
  "enabled": true
}
```

### `POST /api/hv6/v1/zones/{zone}/setpoint-command`

Coordinator-owned, expiring setpoint offset. Lune V6 clamps the offset locally before
applying it and returns the accepted/effective values.

Request:

```json
{
  "request_id": "fc-12345-00",
  "source": "forecast",
  "reason": "weather peak in 4h",
  "setpoint_offset_c": 0.4,
  "ttl_s": 4500
}
```

`requested_offset_c` is accepted as an alias for `setpoint_offset_c`. Query parameters
with the same names remain accepted during dashboard/coordinator migration.

### `POST /api/hv6/v1/commands`

Generic command endpoint for button-style actions.

Request:

```json
{
  "command": "motor_reset_fault",
  "zone": 3
}
```

Minimum command set:

- `motor_reset_fault`
- `motor_reset_and_relearn`
- `motor_reset_learned_factors`
- `calibrate_all_motors`
- `i2c_scan`

### `POST /api/hv6/v1/settings`

Applies validated partial settings payload.

Touch uses the existing typed settings routes for V6-owned zone weather data:
`zone_exterior_walls` (`text`), `zone_wind_exposure`, `zone_solar_gain`, and
`zone_thermal_lead_h` (`number`). All include the one-based `zone` field.

## SSE Endpoint

### `GET /api/hv6/v1/events`

Event types:

- `state`
- `diagnostics`
- `command_ack`
- `log`

Event payload envelope:

```json
{
  "type": "state",
  "ts_ms": 1713111111000,
  "data": {}
}
```

`command_ack` example:

```json
{
  "type": "command_ack",
  "ts_ms": 1713111111000,
  "data": {
    "request_id": "c6dc7f1d",
    "command": "motor_reset_fault",
    "ok": true,
    "message": "Zone 3 fault reset requested"
  }
}
```

## HTTP Status Codes

- `200` success
- `400` validation error
- `404` unknown route/resource
- `409` command rejected due to busy/unsafe state
- `500` internal error

## Migration Constraints

- Dashboard runtime must not call `/climate`, `/switch`, `/number`, `/select`, `/text`, `/button`.
- HA services and entities remain intact for automations and integrations.
- The API component currently exists as a scaffold and will implement endpoints incrementally in this order:
  1. `GET overview`
  2. `GET zones`
  3. `POST setpoint` and `POST enabled`
  4. `POST commands`
  5. `GET events` SSE
