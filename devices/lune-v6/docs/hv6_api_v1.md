# HV6 API v1 Contract

This document defines the dedicated dashboard API contract for Lune V6.

The cross-product v1 envelope, compatibility rules, and fixtures are in
[`shared/contracts/lune_api_v1.md`](../../../shared/contracts/lune_api_v1.md).

Hydraulic commissioning is documented in [hydraulic_commissioning.md](hydraulic_commissioning.md).

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
itself is served at `/` + `/dashboard.js`; `/dashboard` and `/dashboard/` are
legacy bookmarks that redirect to `/`.

- Read endpoints (raw JSON, no envelope yet — see "Planned"):
  - `GET /api/hv6/v1/state` — full dashboard snapshot (entity-id → value map consumed by the frontend store)
  - `GET /api/hv6/v1/revision` — lightweight revision-polling resource. The dashboard polls
    this every three seconds and fetches the full state only when `data_revision` changes;
    this intentionally replaces the unsafe one-shot pseudo-SSE route.
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
  - `POST /api/hv6/v1/authority/lease` — V6-A-only authenticated Touch lease acquisition
    and renewal. The JSON body contains `installation_id`, `coordinator_id`, `lease_id`,
    `sequence`, `issued_ms`, and a 30–120 second `duration_ms`; the request must supply the
    provisioned `X-Lune-Authority-Key`. V6 never restores an active lease after reboot and
    rejects missing authentication, mismatched identity, replayed sequence, and conflicting
    lease ID. Authority state, remaining lease time, generation, and transition reason are
    included in `GET /diagnostics`. Touch includes a `degraded` coverage-health flag in each
    renewal. V6 does not aggregate zones or write to a heat source.
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

Local dashboard writes remain available while a V6 is standalone and no
`authority.shared_key` has been provisioned. After Touch provisioning, the
same writes require `X-Lune-Local-Key` and a matching `X-Lune-CSRF` header;
coordinator commands always require the separate authority authentication
described below.
- Migration reads:
  - `GET /api/hv6/v1/overview`, `GET /api/hv6/v1/zones`,
    `GET /api/hv6/v1/zones/{zone}`, `GET /api/hv6/v1/settings`,
    `GET /api/hv6/v1/diagnostics`
  - `GET /api/hv6/v1/events` is retained only as a compatibility placeholder; clients must
    use documented revision polling until real SSE can be safely maintained on the target.

Implemented command names:

- `i2c_scan`
- `motor_reset_fault` (requires `zone`)
- `motor_reset_and_relearn` (requires `zone`)
- `motor_reset_learned_factors` (requires `zone`)
- `open_motor_timed` / `close_motor_timed` / `stop_motor` (requires `zone`; also exposed as motor routes)

Implemented global settings keys (legacy names retained for dashboard compatibility) relevant
to secondary-flow commissioning:

- `min_zone_flow_pct` (number) — minimum total valve opening across loops already accepting heat
- `minimum_flow_always` (select: `on` | `off`) — explicit secondary-loop commissioning mode

These controls cannot guarantee primary-side heat delivery and never open a satisfied room merely
to protect the primary circuit.

## Touch command authentication

`POST /zones/{zone}/setpoint-command` is fail-closed. It requires the provisioned installation
key in `X-Lune-Authority-Key`, a valid UTC `auth_timestamp_s` within 120 seconds, and a unique
`auth_nonce`; V6 retains used nonces for five minutes. A missing/invalid clock or key leaves
the device in read-only degraded behavior for Touch commands. A MAC-derived pairing fingerprint
is identity evidence only and cannot authorize a command.

Rotate the key by physically commissioning Touch and the designated V6-A with a newly generated
installation key, confirm their clocks, then remove the old key from both. Do not rotate through
an unauthenticated browser request. V6-B remains a non-writer regardless of this key.

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

Returns diagnostics summary and latest fault/calibration state. On Rev 3.1 the
`motor_safety` object exposes the live bring-up evidence used by the endpoint
classifier: shared current, raw terminal A/B ADC samples, differential BEMF,
A/B sample separation, validity/motion flags, invalid-sample count, motion
evidence count, runtime and persistent latch state. These raw values are for
qualification and diagnostics; clients must not infer or command an endpoint
from them.

### `GET /api/hv6/v1/motor-trace.csv`

Downloads the most recently completed motor capture in chronological order.
Rev 3.1 rows contain current, raw BEMF terminal A/B, differential BEMF,
measured sample separation, validity/motion flags and consecutive invalid-sample
count. The endpoint returns `409 motor_busy` while a motor is moving so a CSV
can never mix an active, wrapping capture with older samples.

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
    "authority": {
      "installation_id": "house-1",
      "coordinator_id": "lune-touch",
      "authentication_configured": true
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
