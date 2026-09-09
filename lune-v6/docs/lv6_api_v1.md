# LV6 API v1 Contract

This document defines the dedicated dashboard API contract for Lune V6.

The cross-product v1 envelope, compatibility rules, and fixtures are in
[`shared/contracts/lune_api_v1.md`](../../../shared/contracts/lune_api_v1.md).

Hydraulic commissioning is documented in [hydraulic_commissioning.md](hydraulic_commissioning.md).

Canonical HTTP namespace is `/api/v1` — V6 owns the device host, so the path needs
no product segment. Former paths `/api/lv6/v1` and `/api/hv6/v1` have been removed
(hard cut, no alias). Internal component ids remain `lv6_*`; NVS stays `"hv6"`.

## Scope

- Dedicated namespace: `/api/v1`
- Dashboard transport: HTTP JSON responses, URL-encoded POST forms, and revision polling
- Home Assistant integration remains on ESPHome API/entities/services
- Dashboard no longer depends on ESPHome entity-name REST routes
- Dashboard source is modularized under `devices/lune-v6/web/dashboard-src/` and bundled into `devices/lune-v6/web/dashboard.js`

## Current Implementation Status

All endpoints are served by the `lv6_dashboard` component as an `AsyncWebHandler` on the
device web server (port 80). The legacy `/dashboard/set`, `/dashboard/state`,
`/dashboard/history` and `/dashboard/ble-scan` routes have been removed; the dashboard app
itself is served at `/` + `/dashboard.js`; `/dashboard` and `/dashboard/` are
legacy bookmarks that redirect to `/`.

- Read endpoints (raw JSON, no envelope yet — see "Planned"):
  - `GET /api/v1/state` — full dashboard snapshot (entity-id → value map consumed by the frontend store)
  - `GET /api/v1/revision` — lightweight revision-polling resource. The dashboard polls
    this every three seconds and fetches the full state only when `data_revision` changes;
    this intentionally replaces the unsafe one-shot pseudo-SSE route. The payload also
    includes `uptime_s` so the UI can keep device uptime current without a full snapshot.
  - `GET /api/v1/history` — 24 h ring buffer (288 slots @ 5 min). Each entry is
    `[uptime_s, z0, z1, z2, z3, z4, z5, absorbing, flow_c, return_c, demand_pct]` where
    `z0..z5` are `ZoneDisplayState` codes (`0xFF` = unknown), `absorbing` is `1` when preheat
    absorption was active at that sample (else `0`), `flow_c`/`return_c` are the manifold
    flow/return temps in °C (`null` if no reading), and `demand_pct` is the mean open-valve %
    above the active per-zone minimum-flow floor over zones with a reading (`null` if unknown).
    The trailing `flow_c`/`return_c`/`demand_pct`
    fields are appended after `absorbing` so index-based consumers (e.g. the zone-state timeline)
    are unaffected. Shape:
    `{"interval_s":300,"uptime_s":N,"count":N,"entries":[[…],…]}`
  - `GET /api/v1/logs?since=<seq>` — live device-log ring (last ~96 lines). Returns only lines
    newer than `<seq>`. Shape: `{"next_seq":N,"lines":[[seq,level,"tag","msg"],…]}` where `level`
    is the ESPHome log level (1=ERROR … 7=VERY_VERBOSE). Pass the previous `next_seq` (or the
    highest seen `seq`) back as `?since=` to append only new lines. RAM-only; reset on reboot.
  - `GET /api/v1/logs/download` — the same log ring as a single `text/plain`
    attachment for bug reports. See "Maintenance endpoints".
  - `GET /api/v1/ble-scan` — discovered BTHome sensors
  - `GET /api/v1/settings/export[?include_learned=0|1]` — configuration backup as a
    downloadable JSON document. See "Maintenance endpoints".
  - `POST /api/v1/authority/lease` — V6-A-only authenticated Touch lease acquisition
    and renewal. The URL-encoded form body contains `installation_id`, `coordinator_id`, `lease_id`,
    `sequence`, `issued_ms`, and a 30–120 second `duration_ms`; the request must supply the
    provisioned `X-Lune-Authority-Key`. V6 never restores an active lease after reboot and
    rejects missing authentication, mismatched identity, replayed sequence, and conflicting
    lease ID. Authority state, remaining lease time, generation, and transition reason are
    included in `GET /diagnostics`. Touch includes a `degraded` coverage-health flag in each
    renewal. V6 does not aggregate zones or write to a heat source.
  - `POST /api/v1/authority/proposal` — receives the automatically generated Touch
    installation identity and authentication material as a three-minute, RAM-only proposal.
    A proposal never grants control and the shared key is never returned by a read endpoint.
  - `POST /api/v1/authority/approve-proposal` — local, explicit approval of the current
    proposal. V6 persists the proposed identity only after this action and returns the local
    browser credential once so the approving browser can continue making authenticated writes.
  - `POST /api/v1/authority/revoke` — fail-safe local revocation. It removes the approved
    coordinator identity and immediately rejects subsequent Touch commands.
- Write endpoints (`application/x-www-form-urlencoded` request bodies or backwards-compatible query parameters; return the v1 response envelope):
  - `POST /api/v1/zones/{zone}/setpoint?setpoint_c=<float>`
  - `POST /api/v1/zones/{zone}/enabled?enabled=true|false`
  - `POST /api/v1/zones/{zone}/setpoint-command`
  - `POST /api/v1/commands?command=<name>[&zone=1..6]`
  - `POST /api/v1/drivers/enabled?enabled=true|false`
  - `POST /api/v1/motors/{zone}/target?value=<0..100>`
  - `POST /api/v1/motors/{zone}/open_timed`
  - `POST /api/v1/motors/{zone}/close_timed`
  - `POST /api/v1/motors/{zone}/stop`
  - `POST /api/v1/settings/select?key=<name>&value=<value>[&zone=1..6]`
  - `POST /api/v1/settings/number?key=<name>&value=<value>[&zone=1..6]`
  - `POST /api/v1/settings/text?key=<name>&value=<value>[&zone=1..6]`
  - `POST /api/v1/settings/import[?restore_learned=0|1]` — restore a backup produced
    by `GET /settings/export`; the body is the JSON document. See "Maintenance endpoints".
- `POST /api/v1/manual_mode?enabled=true|false`

Local dashboard writes remain available while a V6 is standalone and no
`authority.shared_key` has been provisioned. After Touch provisioning, the
same writes require `X-Lune-Local-Key` and a matching `X-Lune-CSRF` header;
coordinator commands always require the separate authority authentication
described below.
- Migration reads:
  - `GET /api/v1/overview`, `GET /api/v1/zones`,
    `GET /api/v1/zones/{zone}`, `GET /api/v1/settings`,
    `GET /api/v1/diagnostics`
  - `GET /api/v1/events` is retained only as a compatibility placeholder; clients must
    use documented revision polling until real SSE can be safely maintained on the target.

Implemented command names:

- `i2c_scan`
- `motor_reset_fault` (requires `zone`)
- `motor_reset_and_relearn` (requires `zone`)
- `motor_reset_learned_factors` (requires `zone`)
- `open_motor_timed` / `close_motor_timed` / `stop_motor` (requires `zone`; also exposed as motor routes)
- `ble_clock_sync_now` — start a Shelly Date/Time Broadcast burst so nearby BLU displays can resync
- `firmware_check` / `firmware_prepare` / `firmware_install` — managed firmware update
  from GitHub Releases. See "Firmware updates".

Implemented global settings keys (legacy names retained for dashboard compatibility) relevant
to secondary-flow commissioning:

- `min_zone_flow_pct` (number) — minimum total valve opening across loops already accepting heat
- `minimum_flow_always` (select: `on` | `off`) — explicit secondary-loop commissioning mode
- `ble_clock_sync_enabled` (select: `on` | `off`) — emit Shelly Date/Time Broadcast advertisements
- `ble_clock_sync_interval_min` (number, 15–1440) — minutes between broadcast bursts (default 60)

These controls cannot guarantee primary-side heat delivery and never open a satisfied room merely
to protect the primary circuit.

## Touch command authentication

`POST /zones/{zone}/setpoint-command` is fail-closed. It requires the provisioned installation
key in `X-Lune-Authority-Key`, a valid UTC `auth_timestamp_s` within 120 seconds, and a unique
`auth_nonce`; V6 retains used nonces for five minutes. A missing/invalid clock or key leaves
the device in read-only degraded behavior for Touch commands. A MAC-derived pairing fingerprint
is identity evidence only and cannot authorize a command.

Coordinator consent is owned by V6. Touch generates and persists an opaque installation ID,
a unique coordinator ID, and a random shared key, then proposes them to every registered V6.
The local V6 Settings view presents this as one “Approve Lune Touch” action. Raw identity and
key entry are not exposed, and the generic settings endpoints reject authority fields. A newly
discovered proposal can replace obsolete authority only after the same explicit approval. Touch
may discover and read an unapproved V6, but it must
not treat that node as command-ready until `GET /overview` reports a matching
approved coordinator. Revoking the connection on V6 immediately returns command
handling to fail-closed behavior.

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

### `GET /api/v1/overview`

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
    },
    "coordination": {
      "installation_id": "house-1",
      "coordinator_id": "lune-touch",
      "control_approved": true
    }
  }
}
```

`pairing.fingerprint` is a stable identity hint derived from the V6 MAC address.
Lune Touch stores it during commissioning and treats later overview responses
with a different fingerprint as an identity mismatch.

### `GET /api/v1/zones`

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

### `GET /api/v1/zones/{zone}`

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

### `GET /api/v1/diagnostics`

Returns diagnostics summary and latest fault/calibration state. The `heap`
object reports free INTERNAL/DMA/PSRAM (KB), largest/min free INTERNAL blocks,
plus `internal_allocated_kb` / `internal_free_blocks` / `internal_alloc_blocks`
from `multi_heap_info_t` (still totals — not call-site owners). For a region
walk and per-task stack table, POST `dump_task_stats`. On Rev 3.1 the
`motor_safety` object exposes the live bring-up evidence used by the endpoint
classifier: shared current, raw terminal A/B ADC samples, differential BEMF,
A/B sample separation, validity/motion flags, invalid-sample count, motion
evidence count, runtime and persistent latch state. These raw values are for
qualification and diagnostics; clients must not infer or command an endpoint
from them.

### `GET /api/v1/motor-trace.csv`

Downloads the most recently completed motor capture in chronological order.
Rev 3.1 rows contain current, raw BEMF terminal A/B, differential BEMF,
measured sample separation, validity/motion flags and consecutive invalid-sample
count. The endpoint returns `409 motor_busy` while a motor is moving so a CSV
can never mix an active, wrapping capture with older samples.

### `GET /api/v1/settings`

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
    "ble_clock_sync": {
      "enabled": true,
      "interval_min": 60,
      "last_ok_s": 1774746000,
      "last_error": "",
      "advertising": false
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
        "base_setpoint_c": 21.0,
        "effective_setpoint_c": 21.0,
        "coordinator_offset_c": 0.0,
        "coordinator_command_remaining_s": 0,
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

### `POST /api/v1/zones/{zone}/setpoint`

Request:

```json
{
  "setpoint_c": 22.5
}
```

### `POST /api/v1/zones/{zone}/enabled`

Request:

```json
{
  "enabled": true
}
```

### `POST /api/v1/zones/{zone}/setpoint-command`

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

### `POST /api/v1/commands`

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
- `ble_clock_sync_now`
- `dump_task_stats` — logs FreeRTOS per-task CPU%/stack headroom plus
  `multi_heap_info` / `heap_caps_print_heap_info` for INTERNAL, DMA, and SPIRAM
  to the device log (serial + live log ring). Prefer this before enabling
  temporary `packages/debug/heap-tracing.yaml` (INTERNAL top sites via logger).
- `firmware_check`
- `firmware_prepare`
- `firmware_install`

### `POST /api/v1/settings`

Applies validated partial settings payload.

Touch owns exterior-wall geometry and does not mirror it to V6. The remaining
legacy weather-profile settings routes are `zone_wind_exposure`,
`zone_solar_gain`, and `zone_thermal_lead_h` (`number`). All include the
one-based `zone` field.

## Maintenance Endpoints

These exist so a user can take a settings backup before a firmware update and hand
over a log capture with a bug report. Both are local-only surfaces.

### `GET /api/v1/settings/export`

Returns the user-owned configuration as a downloadable JSON document — a file, not
the v1 envelope:

```text
Content-Type: application/json
Content-Disposition: attachment; filename=lune-v6-settings.json
```

Parameters:

- `include_learned=0|1` (default `1`) — include the learned motor timings block.

The document is written by
[`settings_backup`](../components/lv6_dashboard/settings_backup.cpp) as **named
fields, not binary NVS blobs**, which is what lets a backup survive a per-section
NVS version bump:

```json
{
  "_type": "lune-v6-settings",
  "_version": 1,
  "firmware": "v1.2.3",
  "config_versions": {
    "zone": 4, "motor": 2, "sensor": 1, "system": 3, "control": 1,
    "probe": 1, "pid": 1, "manifold": 1, "balancing": 2
  },
  "metadata": {
    "authority": {
      "installation_id": "house-1",
      "coordinator_id": "lune-touch"
    }
  },
  "settings": {
    "manifold": {},
    "motor": {},
    "control": {},
    "balancing": {},
    "sensor": {},
    "probes": {},
    "zones": []
  },
  "learned": { "zones": [] }
}
```

`_version` is the envelope schema version and is independent of the
`config_versions` section numbers, which are recorded for diagnosis and migration.
`metadata` is informational only and is never applied on import.

Secrets are never exported: the authority shared key, local access keys and WiFi
credentials are outside this document, so a backup file cannot grant control.

Errors: `503 config_store_unavailable`, `503 out_of_memory` (the ~8 KB document is
built in PSRAM scratch), `500 export_failed` if the document does not fit.

### `POST /api/v1/settings/import`

Restores a document produced by `GET /settings/export`. The request body **is** the
JSON document. Requires the same write authorization as the other write endpoints.

Parameters:

- `restore_learned=0|1` (default `1`) — restoring learned motor timings onto
  different hardware is wrong, so a caller can decline that part while still
  restoring user settings.

The document is validated and applied to an in-memory copy of the config first, so a
rejected import changes nothing:

```json
{
  "ok": true,
  "version": "v1",
  "data": {
    "applied": 87,
    "skipped": 0,
    "ignored": 3,
    "learned_restored": true,
    "data_revision": 412
  }
}
```

`applied` counts fields taken from the file, `skipped` fields present but
deliberately not applied, and `ignored` keys this firmware does not understand —
that last one is how a backup from a newer minor version still restores cleanly.

Rejections return `400` with the envelope's `error.code`:

- `missing_body` — empty request body.
- `bad_json` — not a JSON object, or unterminated.
- `bad_type` — missing `_type`, or not a Lune V6 settings backup.
- `unsupported_version` — `_version` is newer than this firmware understands.
- `no_settings` — no `settings` object, or nothing in it this firmware recognizes.

Import does not restore authority material and does not move motors; the next
zone-controller cycle acts on the restored setpoints. A successful import bumps
`data_revision`, so revision-polling clients refresh on their own.

### `GET /api/v1/logs/download`

Returns the same log ring as `GET /api/v1/logs` as a single `text/plain`
attachment (`filename=lune-v6-logs.txt`), oldest line first, one
`[<level>] <tag>: <message>` line each, where level is `E`, `W`, `I`, `C`, `D` or
`V`. The ring is RAM-only, so capture it *before* restarting a device that
misbehaved.

## Firmware Updates

Releases are published to
[GitHub Releases](https://github.com/birkemosen/lune/releases) with an
ESP-Web-Tools manifest (`manifest-lune-v6.json`). The device's own
`update: platform: http_request` entity polls
`releases/latest/download/manifest-lune-v6.json`, and the dashboard drives that same
entity through `POST /api/v1/commands`:

- `firmware_check` — re-fetch the manifest and refresh the fields below. It does not
  download the image.
- `firmware_prepare` — quiesce the motors before an image lands, used ahead of a
  browser-pushed upload to `/update`. An OTA must not interrupt a stroke and leave a
  valve at an unknown position.
- `firmware_install` — prepare the motors, then install the manifest's `ota.path`,
  verified against the published MD5. The device reboots into the new image on
  success.

`firmware_check` and `firmware_install` require the `update` entity to be wired into
`lv6_dashboard` (`firmware_update_id`); without it they are accepted and ignored.
`safe_mode` marks an OTA boot good only after 60 s, so an image that crashes during
startup rolls back to the previous one.

`GET /diagnostics` reports the update state and the last reset cause:

```json
{
  "firmware": {
    "update": {
      "current": "v1.2.3",
      "latest": "v1.3.0",
      "available": true,
      "status": "available"
    }
  },
  "reset_reason": "Software Reset CPU",
  "logs_endpoint": "/api/v1/logs",
  "logs_download_endpoint": "/api/v1/logs/download"
}
```

`status` is one of `unknown`, `no_update`, `available` or `installing`. The `state`
snapshot carries the same values as `firmware_update` (`current`, `latest`,
`available`, `status`) plus the `text_sensor-reset_reason` entity. `reset_reason`
comes from the `debug` platform text sensor and is what separates a clean OTA
restart from a panic, watchdog or brownout.

Clients must treat `available` as advisory and never auto-install: installing is an
explicit local action.

Manual uploads bypass the manifest entirely — `POST` an `.ota.bin` to `/update`,
which is the `web_server` OTA platform on `web_server_base`. The stock ESPHome web UI
is not compiled into the firmware, so `/update` accepts the upload but serves no page
of its own; the dashboard provides the form. A first flash of a blank board still
needs the `.factory.bin` over USB, because the OTA image carries no bootloader or
partition table.

## SSE Endpoint

### `GET /api/v1/events`

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
