# LV6 API v1 Contract

This document defines the dedicated dashboard API contract for Lune V6.

The cross-product v1 envelope, compatibility rules, and fixtures are in
[`shared/contracts/lune_api_v1.md`](../../../shared/contracts/lune_api_v1.md).

Hydraulic commissioning is documented in [hydraulic_commissioning.md](hydraulic_commissioning.md).

Canonical HTTP namespace is `/api/v1` — V6 owns the device host, so the path needs
no product segment. Former paths `/api/lv6/v1` and the HeatValve-era `/api/hv6/v1`
have been removed (hard cut, no alias). Component ids, log tags, and NVS use `lv6`
(one-time NVS migrate from the legacy `"hv6"` namespace on first boot).

## Scope

- Dedicated namespace: `/api/v1`
- Dashboard transport: HTTP JSON responses, URL-encoded POST forms, and revision polling
- Home Assistant integration remains on ESPHome API/entities/services
- Dashboard no longer depends on ESPHome entity-name REST routes
- Dashboard source is modularized under `lune-v6/web/` (LDS2 HTML shell +
  `binder-src/`) and built into `lune-v6/web/ui/` (`lune-ui.css`, `en/`/`da/`
  HTML, `binder.js`), which is embedded in firmware

## Current Implementation Status

All endpoints are served by the `lv6_dashboard` component as an `AsyncWebHandler` on the
device web server (port 80). The legacy `/dashboard/set`, `/dashboard/state`,
`/dashboard/history` and `/dashboard/ble-scan` routes have been removed; the dashboard
itself is served at `/` (language-negotiated), `/en/`, `/da/`, `/lune-ui.css`, and
`/binder.js` (also aliased as `/dashboard.js`); `/dashboard` and `/dashboard/` are
legacy bookmarks that redirect to `/`.

- Read endpoints (raw JSON, no envelope yet — see "Planned"):
  - `GET /api/v1/state` — full dashboard snapshot (entity-id → value map consumed by the frontend store)
  - `GET /api/v1/revision` — lightweight revision-polling resource. The dashboard polls
    this on a slow idle cadence (~10 s) and fetches the full state when `data_revision`
    **or** `runtime_revision` changes (also on tab focus / visibility). `data_revision`
    tracks config/command writes (and is used by write guards); `runtime_revision` tracks
    live telemetry the UI must refresh without invalidating those guards (zone
    temperatures / valves / manifold flow-return at display resolution, motor learning,
    motor faults). The payload also includes `uptime_s` so the UI can keep device uptime
    current without a full snapshot. While a zone is learning, the binder additionally
    pulls `/state` at 1 Hz.
  - `GET /api/v1/history` — 24 h ring buffer (288 slots @ 5 min). Each entry is
    `[uptime_s, z0, z1, z2, z3, z4, z5, absorbing, flow_c, return_c, demand_pct,
    t0..t5, sp0..sp5]` where
    `z0..z5` are `ZoneDisplayState` codes (`0xFF` = unknown), `absorbing` is `0` idle /
    `1` reactive / `2` armed, `flow_c`/`return_c` are the manifold
    flow/return temps in °C (`null` if no reading), `demand_pct` is the mean open-valve %
    above the active per-zone minimum-flow floor over zones with a reading (`null` if unknown),
    `t0..t5` are per-zone room temperatures °C, and `sp0..sp5` are planned/effective
    setpoints °C (`sp_plan`; flat current setpoint on V6 — no local schedule). Binder
    downsamples to half-hours and computes the damped 6 h projection; there is **no**
    `fc` / `fc_lo` / `fc_hi` series. Trailing fields are appended so index-based consumers
    of the zone-state / flow / return columns stay compatible. Shape:
    `{"interval_s":300,"uptime_s":N,"count":N,"entries":[[…],…]}`
  - `GET /api/v1/logs?since=<seq>` — live device-log ring (last ~96 lines). Returns only lines
    newer than `<seq>`. Shape: `{"next_seq":N,"lines":[[seq,level,"tag","msg"],…]}` where `level`
    is the ESPHome log level (1=ERROR … 7=VERY_VERBOSE). Pass the previous `next_seq` (or the
    highest seen `seq`) back as `?since=` to append only new lines. RAM-only; reset on reboot.
  - `GET /api/v1/logs/download` — the same log ring as a single `text/plain`
    attachment for bug reports. See "Maintenance endpoints".
  - `GET /api/v1/ble-scan` — discovered BTHome sensors
  - `POST /api/v1/room-temperatures` — EXTERNAL room-temp ingest by `sensor_id` (V6 maps to zone)
  - `GET /api/v1/settings/export[?include_learned=0|1]` — configuration backup as a
    downloadable JSON document. See "Maintenance endpoints".
  - `POST /api/v1/absorb-window` — house-level absorb arm/disarm (Touch). Auth +
    TTL like setpoint-command; runtime arm/disarm with ledger (`clamp_applied`,
    normalized `reason`). Fixtures under `shared/contracts/absorb-command/`.
  - `POST /api/v1/authority/lease` — V6-A-only authenticated Touch lease acquisition
    and renewal. The URL-encoded form body contains `installation_id`, `coordinator_id`, `lease_id`,
    `sequence`, `issued_ms`, a 30–120 second `duration_ms`, optional `degraded`, and optional
    `control_mode` (`normal` | `heat_pump`); the request must supply the
    provisioned `X-Lune-Authority-Key`. Absent `control_mode` keeps V6's local heating mode;
    the override clears when the lease expires or is revoked. V6 never restores an active lease after reboot and
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

Local dashboard and LAN hub writes require only an `X-Lune-CSRF` header (any
non-empty value). This matches the Asgard/Odin LAN-trust model: no commissioning
secret for Motor Lab or settings from a phone on the home network. The custom
header blocks naive cross-site form POSTs; wildcard CORS is not emitted.
Coordinator (Touch) commands always require the separate authority authentication
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
- `ble_clock_sync_now` — refresh the continuous Shelly Date/Time Broadcast payload immediately
- `firmware_check` / `firmware_prepare` / `firmware_install` — managed firmware update
  from GitHub Releases. See "Firmware updates".

Implemented global settings keys (legacy names retained for dashboard compatibility) relevant
to secondary-flow commissioning:

- `min_zone_flow_pct` (number) — minimum total valve opening across loops already accepting heat
- `minimum_flow_always` (select: `on` | `off`) — explicit secondary-loop commissioning mode.
  The floor only applies while the effective heating mode is `normal`; in `heat_pump` mode the
  base opening keeps flow and the floor is skipped.
- `ble_clock_sync_enabled` (select: `on` | `off`) — emit Shelly Date/Time Broadcast (~every 2 s, concurrent with scan)
- `ble_clock_sync_interval_min` (number, 15–1440) — legacy settings field; continuous beacon ignores it

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
      "pairing_fingerprint": "lv6-aabbccddeeff"
    },
    "pairing": {
      "method": "mac-fingerprint-v1",
      "fingerprint": "lv6-aabbccddeeff"
    },
    "physics_contract": 1,
    "coordination": {
      "installation_id": "house-1",
      "coordinator_id": "lune-touch",
      "control_approved": true
    },
    "control": {
      "mode": "heat_pump",
      "effective_mode": "heat_pump",
      "mode_source": "local",
      "heat_demand": {
        "recommendation": "hold",
        "critical_zone": null,
        "critical_opening_ratio": 0.0,
        "saturated_s": 0,
        "demanding_zones": 0,
        "headroom": false
      }
    }
  }
}
```

`pairing.fingerprint` is a stable identity hint derived from the V6 MAC address.
Lune Touch stores it during commissioning and treats later overview responses
with a different fingerprint as an identity mismatch.

`control.mode` is the local Normal / Heat-pump setting. While a Touch lease
carries `control_mode`, `effective_mode` and `mode_source` reflect that override.
`heat_demand` is the published feed-temperature hint (V6 never writes the heat
source). See [`docs/lune_whole_house_flow_temperature.md`](../../docs/lune_whole_house_flow_temperature.md).

### `GET /api/v1/zones`

Returns all zones plus a stable `node_id`. Additive fields (schema-compatible;
older clients ignore):

- `node_id` — MAC-based (`lune-v6-<last6hex>`) for Touch room mapping
- `group_primary` / `group_members` — legacy sync-group root and members (1-based)
- `group_id` / `group_role` — first-class manifold group (`single` | `primary` | `member`)
- `opening_ratio` — current valve ÷ `max_opening_pct`
- Floor / UA / τ priors per
  [`lune_room_physics_contract_v1.md`](../../shared/contracts/lune_room_physics_contract_v1.md):
  `area_m2`, `exterior_walls`, `floor.{slab_type,covering,active_thickness_cm,r_m2k_per_w,c_slab_kwh_per_k,unset}`,
  `ua_prior_w_per_k`, `ua_learned_*`, `ua_effective_w_per_k`, `ua_source`, `tau_prior_h`, `warnings`
- Legacy aliases `ua_w_per_k` / `thermal_mass_kwh_per_k` / `tau_h` remain when present
- `return_c` — zone return probe °C when mapped, else null.
- `loop_share_pct` — flow-allocator share of total opening (0–100), Σ ≈ 100 across enabled zones.
- `absorb_capacity_rank` — 1 = highest thermal absorb capacity (group-level §7).
- `absorb_state` — `idle` | `reactive` | `armed`.

`GET /api/v1/overview` includes `physics_contract: 1`.

Manifold overview/diagnostics expose both `flow_c` (legacy) and `flow_temp_c`
(alias) so volume-flow fields can arrive later without renaming confusion.

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
        "temp_source": "local_probe",
        "group_id": "g1",
        "group_role": "single",
        "area_m2": 21.5,
        "exterior_walls": 3,
        "floor": {
          "slab_type": "cast_concrete",
          "covering": "tile_stone",
          "active_thickness_cm": 8,
          "r_m2k_per_w": 0.02,
          "c_slab_kwh_per_k": 0.998,
          "unset": false
        },
        "ua_prior_w_per_k": 36.55,
        "ua_effective_w_per_k": 36.55,
        "ua_source": "prior",
        "tau_prior_h": 62.7,
        "warnings": [],
        "return_c": null,
        "loop_share_pct": 18.5,
        "absorb_state": "idle",
        "absorb_capacity_rank": 2
      }
    ]
  }
}
```

### `GET /api/v1/groups`

Returns manifold groups (explicit + implicit singletons) with aggregate area/UA
and per-member flow shares. Write with `POST /api/v1/groups` (atomic validate;
`expected_revision`) and `POST /api/v1/groups/{id}/remove`.

### `POST /api/v1/zones/{zone}/physics`

Local CSRF (or Touch write-through) provisioning for area, exterior walls, slab,
covering, thickness, and optional R override. Bumps zone config revision.

### `POST /api/v1/zones/{zone}/ua-learned`

Coordinator authority key (same as `setpoint-command`). Persists learned UA when
inside 0.2–5× prior; rejects and logs otherwise.

### `POST /api/v1/physics/house`

Trusted write for house `u_base` / `u_wall` / `c_struct` (same authority as
`ua-learned`).

### `GET /api/v1/zones/{zone}`

Returns one zone with the settings and diagnostics fields required by dashboard details
panels and coordinator pairing checks:

Room temperature sources: `Local Probe`, `BLE`, `External`.

For `External`, V6 binds a stable `sensor_id` (and optional `sensor_name` for UI). Producers
must not send zone numbers — see `POST /api/v1/room-temperatures`.

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
    "sensor_id": "",
    "sensor_name": "",
    "external_temp_age_ms": null,
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

Weather exposure (`wind_exposure`, `solar_gain`, `thermal_lead_h`) is owned by
Lune Touch rooms. V6 may still store and return `wind_exposure` / `solar_gain`
on `/api/v1/zones` for older Touch clients, and accepts
`POST /api/v1/zones/{id}/forecast-profile` as a store-only no-op. V6 does **not**
use those values for control. Loop physics (area, walls, floor, UA, τ) and
within-manifold groups are owned by V6 per
[`shared/contracts/lune_room_physics_contract_v1.md`](../../shared/contracts/lune_room_physics_contract_v1.md);
`GET /api/v1/overview` reports `physics_contract: 1`.

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

Also includes `room_temperatures[]`: per-zone `temp_source`, bound `sensor_id` /
`sensor_name`, `external_temp_age_ms`, and `ingest_fresh` (true when External and
last HTTP ingest is within the 15‑minute EXTERNAL TTL).

### `GET /api/v1/motor-trace.csv`

Downloads the motor capture ring in chronological order. Columns:

```
t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,
stroke_phase,tacho_period_us,tacho_amp_raw
```

`stroke_phase` is the `StrokeTracker` state (0 free travel, 1 pin contact,
2 under load, 3 stopping) and `tacho_period_us` / `tacho_amp_raw` are the
commutation tacho — together these carry the information the endstop decision
is actually made from.

The six `bemf_*` columns were removed: only the Rev 3.1 BEMF backend populated
them and no board package selects it, so on shipping hardware they were a
constant sentinel block. Captures taken before the change still parse, because
the browser-side parser keys off the header row rather than column position.

Export is permitted **while a motor is running**, so the dashboard can merge
successive ring windows into one longer browser-side capture. (An earlier
version of this document claimed a `409 motor_busy`; the endpoint does not
return one.)

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
      "_comment": "hmip_runtime_limit_s is the CLOSE ceiling. Hard max 40 s (housing exit); default 38 s. Opening has its own limit. Both are also bounded in commutations.",
      "default_profile": "HMIP_VDMOT",
      "generic_runtime_limit_s": 45,
      "hmip_runtime_limit_s": 34,
      "hmip_open_runtime_limit_s": 45,
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
        "motor_profile": "INHERIT"
      }
    ]
  }
}
```

## Write Endpoints

### `POST /api/v1/room-temperatures`

Authenticated EXTERNAL room-temperature ingest. **Zone mapping is only on V6** via
the zone's bound `sensor_id` (`temp_source=External`).

Headers:

- `X-Lune-CSRF: <any>` (required; CSRF boundary, not a shared secret)

Body:

```json
{
  "sensor_id": "AA:BB:CC:DD:EE:FF",
  "temp_c": 21.5,
  "observed_at_ms": 1713111111000,
  "producer_id": "shelly"
}
```

- `sensor_id` (required): stable producer identity; must match a zone bind.
- `temp_c` (required): °C, finite, roughly −40…85.
- `observed_at_ms` (optional): producer wall-clock ms; samples older than 15 minutes
  are rejected.
- `producer_id` (optional): informational; ignored for routing.
- Optional `name` in the body is ignored (friendly names are edited on V6 only).

Response when applied:

```json
{ "ok": true, "version": "v1", "data": { "applied": true, "zone": 2, "sensor_id": "…", "temp_c": 21.5, "data_revision": 12 } }
```

Unbound / rejected readings return `200` with `"applied": false` so a gateway may
forward every heard sensor without per-zone fan-out.

Do not document `/zones/{n}/…` temperature writes for customers.

See [external_room_temperature.md](external_room_temperature.md).

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

### `POST /api/v1/absorb-window`

House-level absorb arm/disarm (coordinator-owned). Same authority authentication
as setpoint-command (`X-Lune-Authority-Key`, `auth_timestamp_s`, single-use
`auth_nonce`). TTL is clamped to 60–7200 s; `clamp_applied` is true in the
response and ledger when the accepted TTL differs from the request. The arm is
**runtime-only** and does not survive reboot.

Optional `action`: `arm` (default) or `disarm`. Disarm is idempotent: it ends
forced absorption immediately and leaves local auto-detection active (also under
a Touch lease). After disarm or TTL expiry, auto-detection resumes on the next
control cycle.

Optional `reason` is ledger/display only. Known codes: `thermal_buffer`,
`energy_cost`. Unknown values are stored as `other` and never rejected. V6 does
not change control behaviour from `reason`.

Shared fixtures: [`shared/contracts/absorb-command/`](../../shared/contracts/absorb-command/).

Arm request:

```json
{
  "request_id": "absorb-fc-001",
  "action": "arm",
  "source": "lune-touch",
  "reason": "thermal_buffer",
  "ttl_s": 1800,
  "auth_timestamp_s": 1713111111,
  "auth_nonce": "n-absorb-001"
}
```

Disarm request:

```json
{
  "request_id": "absorb-fc-001-disarm",
  "action": "disarm",
  "source": "lune-touch",
  "auth_timestamp_s": 1713111112,
  "auth_nonce": "n-absorb-disarm-001"
}
```

Arm success returns `status: "armed"` with `ttl_s`, `ttl_requested_s`, and
`clamp_applied`. Disarm returns `status: "disarmed"` with `end_reason`
(`disarm` or prior `expired`). Auth failures use the normal v1 error envelope
(`403` / `409` / `503`). Reactive auto-detection of preheat absorption remains
live under a Touch lease when no arm is active (fail-safe-on).

`GET /api/v1/overview` exposes house-level
`absorb: { state, reason, end_reason }` (`state`: `idle` | `reactive` | `armed`).
Dashboard entities `text-preheat_absorbing`, `text-preheat_absorb_reason`, and
`text-preheat_absorb_end_reason` mirror the same fields.

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

Heating-mode keys (global):

- `heating_mode` (`select`): `normal` | `heat_pump`
- `hp_overheat_margin_c` (`number`): 0.3–3.0 °C
- `hp_base_pct` (`number`): 30–100
- `hp_trim_floor_pct` (`number`): 0 up to the current base

Weather exposure and room/manifold identity are owned by Lune Touch and have no
V6 settings routes.

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
    "zone": 4, "motor": 4, "sensor": 1, "system": 3, "control": 1,
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

Secrets are never exported: the authority shared key and WiFi
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
