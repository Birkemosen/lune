# Lune Touch API v1

The cross-product v1 envelope, compatibility rules, and fixtures are in
[`shared/contracts/lune_api_v1.md`](../../../shared/contracts/lune_api_v1.md).

The embedded browser dashboard and external commissioning tools use:

```text
/api/lune-touch/v1
```

The API returns CORS headers on success and error responses and answers
`OPTIONS` preflight requests with `GET, POST, OPTIONS` plus `Content-Type`, so
browser-based commissioning tools can call the Touch directly on the local LAN.

Read endpoints return the standard envelope:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 12345,
  "data": {}
}
```

## Reads

- `GET /overview`
- `GET /nodes`
- `GET /zones`
- `GET /strategy`
- `GET /forecast`
- `GET /commands`
- `GET /events`
- `GET /diagnostics`
- `GET /settings`
- `GET /heat-source`

`GET /nodes` reports both configured hostname/IP and runtime poll evidence:
`last_success_host` shows whether the latest successful poll used mDNS hostname
or fallback IP, while `last_failure` carries the latest poll failure reason.
Each node has a stable registry `id` plus a Touch-owned friendly `name`;
dashboards should display `name` first and keep `id` for confirmations,
automation, and diagnostics.
`trust` remains the compact enum value and `trust_label` is the stable human/tool
label: `paired` or `trusted`. `pairing_fingerprint` is the stored V6 identity
hint used to detect a different device answering on the same address.
Each node also includes a Touch-derived `health` block aggregated from mapped
zones so commissioning tools can show useful manifold status before the richer
V6 diagnostics poll is promoted:

```json
{
  "id": "v6-ground",
  "name": "Ground floor manifold",
  "reachable": true,
  "trust_label": "trusted",
  "health": {
    "mapped_zones": 6,
    "fresh_zones": 6,
    "stale_zones": 0,
    "calling_zones": 2,
    "avg_temp_c": 21.0,
    "avg_setpoint_c": 21.3
  },
  "runtime": {
    "active_zones": 6,
    "avg_valve_pct": 15.0,
    "flow_c": 33.8,
    "return_c": 30.6,
    "drivers_enabled": true,
    "motor_fault": false,
    "motor_current_ma": null
  }
}
```

### `GET /strategy`

Returns the read-only house strategy snapshot. `weighted_temperature` is the
physical area-weighted room temperature that a heat source receives. `house_target`
is a separate area-weighted comfort-intent advisory; it is never written to the
physical-temperature endpoint. Temporary command offsets are not comfort intent.
`physical.quality` is `healthy`, `degraded`, or `no_coverage`. A value is healthy
only when fresh contributing area meets the configured coverage threshold (75% by
default) and every expected manifold contributes, unless commissioning has explicitly
enabled degraded-manifold operation. `coverage_ratio`, `expected_manifolds`, and
`contributing_manifolds` make that decision observable to dashboards and clients.

```json
{
  "physical": {
    "has_temperature": true,
    "temperature_c": 20.7,
    "contributing_rooms": 8,
    "coverage_ratio": 1.0,
    "quality": "healthy",
    "expected_manifolds": 2,
    "contributing_manifolds": 2
  },
  "comfort": {
    "average_c": 21.1,
    "demand_c": 0.6,
    "demand_zones": 3
  },
  "driver": {
    "room_id": "bath",
    "name": "Bath",
    "deficit_c": 1.4,
    "priority": 3
  },
  "schedule": {
    "time_valid": true,
    "active_zones": 2,
    "driver_room_id": "bath",
    "driver_name": "Bath",
    "driver_setpoint_c": 22.0,
    "driver_priority": 3
  },
  "house_target": {
    "available": true,
    "value_c": 21.4,
    "source": "mixed",
    "contributing_area_m2": 96.0
  },
  "weighted_temperature": {
    "available": true,
    "value_c": 20.7,
    "contributing_rooms": 8
  },
  "heat_source": { "enabled": true, "mode": "active" }
}
```

`physical` and `asgard_odin` remain temporary compatibility fields for older
clients. New clients must use `weighted_temperature` and `GET /heat-source`.

### `GET /heat-source`

Returns heat-source configuration, current weighted temperature, and the last
write/confirmation result. `weighted_temperature_variable` is the configured
heat-source entity or variable name; Touch URL-encodes it once for
`POST /number/<encoded-name>/set?value=<temperature>`,
then performs bounded readback attempts against `GET /number/<encoded-name>`. The `push`
object reports `status` as `sent`, `confirmed`, `mismatch`, or `unreachable`, together
with the write `http_status`, requested and confirmed values, confirmation age, and both cumulative and consecutive
failure counters. A `sent` status means the POST succeeded but readback was unavailable;
it is not treated as confirmation.

`send_preview` always exposes the current calculated value that would be sent when a
healthy physical temperature is available, or the simple average of fresh primary zone
sensors during commissioning before room geometry is configured. Its
`target_setpoint_c` uses the fresh V6-reported setpoint while available, then falls back
to the area-weighted house target or configured room-comfort average; it is the
heat-source setpoint corresponding to the preview temperature. It is diagnostic-only while coverage is degraded and does not
relax the safety gate for actual publishing.
Its `mode` is `active` when publishing is enabled and `disabled_preview` otherwise.

The `compatibility` object reports the adapter capabilities separately. The currently
documented integration supports `physical_temperature` only. `target_sync` and
`operating_state` are intentionally `unsupported`: Touch keeps the separately aggregated
house target local and does not infer or write an external target endpoint or operating
state source. `target_blocker` and `operating_state_blocker` state those intentional
boundaries to dashboards and commissioning clients.

`GET /diagnostics` also exposes a compact `learning` summary derived from the
current-boot in-memory zone history, including zones with samples, total samples,
heat-call sample count, calling ratio, zones with temperature-rate estimates, and
warming / cooling counts. The history is intentionally runtime-only; learned thermal
coefficients are persisted separately in the zone registry. It also includes `ota` runtime data with the running partition
label/subtype, slot size, rollback state, and `pending_verify` flag so installers
can confirm OTA recovery assumptions.

Its `ownership` block is the operational boundary: ODIN owns heat-pump timing,
prices, whole-house weather/solar optimization, compressor behavior, and DHW; Touch
owns logical rooms, room distribution, schedules, house signals, and normal
heat-source integration; V6 owns safe local heating and explicit fallback only. Touch exposes
electricity prices as read-only and does not schedule the heat pump.

`GET /forecast` includes an `odin_plan` block from the explicitly approved read-only
ODIN JSON source. It reports provenance, availability/freshness, the source's
`current_hour` and resolved `current_index`, validated current schedule bounds, current
price/planned heat, and the raw (not normalized) operation-mode code.
`applies_valve_commands` is always false in this prototype. The schema and safety boundary
are in [`odin_plan_ingestion.md`](odin_plan_ingestion.md).

Diagnostics also includes `command_results`, a compact command-ledger summary for
field troubleshooting:

```json
{
  "pending": 0,
  "accepted": 2,
  "rejected": 0,
  "failed": 0,
  "expired": 0,
  "blocked": 1,
  "blocked_stale": 0,
  "blocked_unreachable": 1,
  "blocked_untrusted": 0,
  "clamped": 1
}
```

`failed` means Touch attempted to send the command and did not get a successful
V6 response; `rejected` means V6 answered but declined the command. `blocked`
is the sum of the local stale, unreachable, and untrusted safety blocks.

The diagnostics `forecast` block mirrors the current weather-fetch state:

```json
{
  "status": "queued",
  "fetch_pending": true,
  "last_fetch_age_s": 420,
  "last_error": ""
}
```

`fetch_pending` is true after `POST /forecast/fetch` queues a manual background
fetch and false once the poll task has picked it up. The full `GET /forecast`
response exposes the same `fetch_pending` field alongside cache metadata, hourly
weather, preload decisions, and dispatch counts. Touch also auto-refreshes the
forecast when a valid location exists and no cache has been fetched, shortly
after boot when an NVS forecast cache was restored, and then roughly every hour
while WiFi is connected.

Diagnostics includes a `commissioning` readiness block for field testing:

```json
{
  "paired_nodes": 1,
  "trusted_nodes": 1,
  "reachable_nodes": 1,
  "reachable_trusted_nodes": 1,
  "stale_nodes": 0,
  "trusted_stale_nodes": 0,
  "identity_missing_nodes": 0,
  "bound_zones": 6,
  "fresh_zones": 6,
  "stale_zones": 0,
  "ready_for_commands": true,
  "ready_for_forecast": true,
  "next_action": "ready",
  "blockers": []
}
```

`ready_for_commands` is only true when at least one trusted node is reachable
and fresh, trusted node identity is complete, and at least one mapped zone has
fresh telemetry.

`next_action` is one of `add_node`, `fix_node_poll`,
`verify_node_identity`, `trust_node`, `map_zones`,
`wait_for_fresh_zone_poll`, `set_forecast_location`, or `ready`.
`blockers` is a compact, ordered list of the first concrete commissioning
reasons that keep commands or forecast from being fully ready. Each blocker has
`scope`, `target`, `reason`, and the recommended `action`, for example
`{"scope":"node","target":"v6-ground","reason":"not_trusted","action":"trust_node"}`.

### `GET /events`

Returns the volatile runtime event ring, newest first, for dashboard diagnostics
and field troubleshooting. The log is intentionally small and reboot-local; it
captures coordinator lifecycle, commissioning changes, V6 poll failures,
forecast fetch outcomes, command dispatch results, and recovery actions:

```json
{
  "events": [
    {
      "ts_ms": 12345,
      "level": "warn",
      "source": "poll",
      "message": "node 2 overview failed status=0"
    }
  ]
}
```

### `GET /commands`

Returns the persisted command ledger. `room_id`, `node_id`, and `loop_id` are
captured when the command is issued; `name` is the stable room-ID display alias.
Older records therefore retain their original target, timing, and outcome even
after the registry changes:

```json
{
  "commands": [
    {
      "request_id": "touch-12345",
      "source": "forecast",
      "reason": "wind preload",
      "room_id": "living",
      "name": "Living",
      "node_id": "v6-ground-a4d9",
      "loop_id": "loop-v6-ground-a4d9-02",
      "node_index": 0,
      "zone_index": 1,
      "requested_offset_c": 0.4,
      "accepted_offset_c": 0.3,
      "created_at_ms": 12000,
      "expires_at_ms": 2712000,
      "created_at_epoch_s": 1735734600,
      "expires_at_epoch_s": 1735737300,
      "boot_id": 1409833421,
      "result": "accepted",
      "clamp_applied": true
    }
  ]
}
```

Command `room_id`, `node_id`, and `loop_id` are immutable target identity captured at
issuance. Numeric indexes are non-authoritative execution-location metadata and are never
used to retarget history after a node removal, reorder, or room rebind.

`created_at_ms` and `expires_at_ms` remain same-boot diagnostic values. When the
wall clock is valid, Touch also records UTC `*_epoch_s` timestamps. Every transient
record has a random `boot_id`; on boot, prior-boot pending or accepted commands are
retained as history but changed to `expired` before they can affect command resolution.
If the wall clock is unavailable, the boot ID still provides the fail-closed boundary.

### `GET /zones`

Each zone includes Touch-owned room intent, the latest V6-applied live state, forecast
tuning, and a lightweight learned thermal model. Live temperature, valve state, and
sampling history are runtime-only and reset on reboot; learned coefficients survive
registry import/export:

```json
{
  "room_id": "living",
  "name": "Living",
  "name_source": "v6",
  "node_index": 0,
  "zone_index": 1,
  "temperature_c": 21.3,
  "setpoint_c": 21.0,
  "valve_pct": 47.0,
  "status": "heat",
  "fresh": true,
  "comfort": {
    "setpoint_c": 21.5,
    "bias_c": 0.2,
    "effective_setpoint_c": 21.7,
    "effective_source": "schedule",
    "schedule_active": true,
    "time_valid": true,
    "priority": 3
  },
  "resolver": {
    "base_setpoint_c": 21.7,
    "base_source": "schedule",
    "manual_offset_c": 0.5,
    "forecast_offset_c": 0.3,
    "learned_offset_c": 0.3,
    "command_offset_c": 0.5,
    "command_source": "manual",
    "target_setpoint_c": 22.5
  },
  "schedule": {
    "enabled": true,
    "day_mask": 127,
    "start_min": 360,
    "end_min": 1320,
    "setpoint_c": 21.0
  },
  "history": {
    "samples": 42,
    "calling_samples": 18,
    "avg_temp_c": 21.12,
    "min_temp_c": 20.58,
    "max_temp_c": 21.54,
    "last_delta_c_per_h": 0.36
  },
  "thermal_model": {
    "samples": 12,
    "heat_gain_c_per_h": 0.18,
    "cool_loss_c_per_h": 0.18,
    "confidence": 0.5
  },
  "forecast": {
    "thermal_lead_h": 4,
    "learned_thermal_lead_h": 6,
    "active_thermal_lead_h": 6
  }
}
```

`name_source` is `generated`, `v6`, or `touch`. During V6 polling, Touch imports
the V6 `/api/hv6/v1/zones` friendly `name` as the default room name. Imported or
generated names may refresh from V6; a Touch-edited room name is preserved as a
local override.

`comfort.effective_setpoint_c` is resolved by Touch. When local time is valid and
the room schedule is active, `effective_source` is `schedule`; otherwise it is
`comfort`. The stored comfort bias is applied in both cases. `resolver` then
layers expiring manual/forecast command offsets and the small calculated
`learned_offset_c` into `target_setpoint_c` for diagnostics. The learned offset
is positive-only, requires fresh live temperature plus enough slow-zone thermal
samples, and does not create a persisted command by itself.

`thermal_model` contains Touch-learned, persisted coefficients derived from
fresh temperature history. `forecast.learned_thermal_lead_h` is derived from the
learned heat-gain rate after enough samples exist; `active_thermal_lead_h` is
the larger of the configured and learned lead. This can extend weather preload
for slow zones, but it never shortens the configured lead and still sends only
expiring V6-clamped
commands.

`resolver` is the read-only ordering view used by the dashboard for field
debugging. It starts with the persistent fallback base, uses Touch's current
comfort/schedule target while Touch is available, then chooses an active manual
dashboard offset over an active forecast distribution offset (never both).
`learned_offset_c` is added only for fresh, slow, under-heated zones with enough
thermal samples. `pre_v6_target_c` is clamped to Touch's dispatch envelope as
`target_setpoint_c`; V6 applies its independent final safety clamp. On a stale
Touch path, the resolver reports `base_source: "fallback"` and no temporary
command from a previous boot may remain active.

## Writes

Write endpoints accept JSON request bodies and retain query-parameter
compatibility for migration/debug tooling. The embedded dashboard sends JSON
bodies first and falls back to query parameters only when talking to older
firmware. Invalid writes return HTTP `4xx` with the standard `ok:false`
envelope. Valid safety outcomes, such as a setpoint command blocked because its
V6 node is stale, are returned as successful write responses and recorded in the
command ledger.

If a POST body is present and starts as JSON (`{` or `[`), malformed JSON is
rejected with HTTP `400` and `error.code = "invalid_json"`. Query-parameter
compatibility is still available for tools that send no JSON body.

### `POST /zones/{room_id}/room`

Atomically stores the Touch-owned room configuration. The complete mapping
validation, geometry/inclusion, comfort, schedule, and weather profile must be
supplied with the current runtime `expected_revision`; an invalid field or stale
revision returns no partial change (`409 stale_revision` for a conflicting edit).
The response contains the saved room and its new revision. V6 local applied
state is reported separately and is never silently copied back into this record.

```json
{
  "expected_revision": 4,
  "total_area_m2": 30,
  "physical_weight": 30,
  "include_in_house_temperature": true,
  "comfort_setpoint_c": 21.5,
  "comfort_bias_c": 0,
  "priority": 2,
  "schedule_enabled": true,
  "schedule_day_mask": 127,
  "schedule_start_min": 360,
  "schedule_end_min": 1320,
  "schedule_setpoint_c": 21,
  "exterior_walls": 1,
  "wind_exposure": 0.5,
  "solar_gain": 0.3,
  "thermal_lead_h": 4,
  "max_offset_c": 1.5
}
```

### `POST /nodes`

```json
{
  "node_id": "v6-ground",
  "hostname": "lune-v6-ground.local",
  "ip": "192.168.1.51",
  "pairing_fingerprint": "hv6-aabbccddeeff"
}
```

New nodes are stored as `paired`. A paired node can be polled and commissioned,
but Touch will not dispatch setpoint/forecast commands to it until installers
explicitly promote it to `trusted` after verifying the candidate is the intended
manifold. If a fingerprint was captured during probe/add, later polling must see
the same V6 fingerprint or Touch marks the node unreachable with
`overview identity_mismatch`.

### `POST /nodes/{node_id}/trust`

Promotes or demotes a stored node between commissioning trust states:

```json
{
  "trust": "trusted",
  "confirm": "hv6-aabbccddeeff"
}
```

Accepted values are `paired` and `trusted`. Promotion to `trusted` requires a
stored `pairing_fingerprint` and `confirm` must exactly match that displayed
fingerprint. If the node was added without one, probe or re-add the candidate
after V6 identity is available. Use `POST /nodes/{node_id}/remove` to remove a
node from the registry instead of writing `unpaired`.

### `POST /nodes/{node_id}/profile`

Stores Touch-owned manifold display metadata without changing the stable node id,
hostname/IP, or pairing fingerprint:

```json
{
  "name": "Ground floor manifold"
}
```

### `POST /nodes/{node_id}/remove`

Removes a node from the coordinator registry and disables mapped rooms that point
at it. The request must confirm the exact node id:

```json
{
  "confirm": "v6-ground"
}
```

### `POST /nodes/scan`

Without a request body, returns currently known/paired nodes as commissioning
candidates with reachability metadata. This is intentionally a truthful first scan
layer, not network-wide mDNS auto-discovery yet:

```json
{
  "scan": "known_nodes",
  "discovery": "manual_or_known_nodes",
  "found": [
    {
      "id": "v6-ground",
      "hostname": "lune-v6-ground.local",
      "ip": "192.168.1.51",
      "model": "lune-v6",
      "firmware": "1.4.12",
      "pairing_fingerprint": "hv6-aabbccddeeff",
      "reachable": true,
      "stale": false,
      "source": "known_node"
    }
  ]
}
```

With `hostname` or `ip`, Touch probes that V6 candidate's
`/api/hv6/v1/overview` endpoint without storing it:

```json
{
  "hostname": "lune-v6-ground.local"
}
```

Response:

During migration from older V6 firmware, Touch first tries the resource-shaped
`/api/hv6/v1/zones` endpoint and then falls back to the legacy
`/api/hv6/v1/state` snapshot. If no room mapping exists yet, legacy state ingest
creates provisional `v6N-zM` room ids so the first manifold can be tested before
the installer renames or remaps rooms.

```json
{
  "scan": "probe",
  "discovery": "manual_probe",
  "found": [
    {
      "id": "lune-v6-ground-local",
      "hostname": "lune-v6-ground.local",
      "ip": "192.168.1.51",
      "model": "lune-v6",
      "firmware": "1.4.12",
      "reachable": true,
      "stale": false,
      "source": "manual_probe",
      "http_status": 200
    }
  ]
}
```

### `POST /zones/{room_id}`

```json
{
  "name": "Living",
  "node_index": 0,
  "zone_index": 2
}
```

`zone_index` is zero-based and maps to V6 zones 1..6.

### `POST /zones/{room_id}/comfort`

Writes the permanent comfort target to the mapped V6 zone. Touch mirrors the
value immediately and refreshes it from V6 on every zone poll, so changes made
in either dashboard converge on the V6 value:

```json
{
  "comfort_setpoint_c": 21.5,
  "comfort_bias_c": 0.2,
  "priority": 2
}
```

`comfort_bias_c` and `priority` remain optional Touch coordination metadata;
the normal target itself is owned and persisted by V6.

### `POST /zones/{room_id}/schedule`

Stores the first Touch-owned schedule primitive: one daily comfort window per
room. The schedule is persisted and exposed in `GET /zones`; Touch uses it as
the effective-comfort base when local time is valid and the window is active.
Manual dashboard offsets and forecast preload offsets remain explicit command
paths layered on top of that base.

```json
{
  "enabled": 1,
  "day_mask": 127,
  "start_min": 360,
  "end_min": 1320,
  "setpoint_c": 21.0
}
```

`day_mask` uses bit 0 for Monday through bit 6 for Sunday. `start_min` and
`end_min` are local minutes after midnight, with `end_min` allowed to be `1440`.

### `POST /zones/{room_id}/forecast-profile`

Writes weather exposure inputs to the mapped V6 zone and mirrors them into the
Touch forecast model. V6 is the persisted source of truth and Touch refreshes
these values on every zone poll:

```json
{
  "exterior_walls": 5,
  "wind_exposure": 0.8,
  "solar_gain": 0.2,
  "thermal_lead_h": 8,
  "max_offset_c": 1.25
}
```

`exterior_walls` is a bitmask for north/east/south/west walls (`1|2|4|8`).
`wind_exposure` and `solar_gain` are clamped to `0..1`, and `thermal_lead_h` to
`1..24`. `max_offset_c` is retained as imported V6 legacy metadata and advanced
diagnostics context, but normal Touch forecast decisions use the house-level
`weather.max_boost_c` cap. Saving the profile recomputes current forecast
decisions and persists the mirrored zone registry.

### `POST /zones/{room_id}/setpoint-command`

A room command has one `command_id` and a child result for every required loop.
The room result is `accepted` only when every loop accepts. If a node is stale,
unreachable, or rejects its child, the result is `partial` (or `failed`) and
`partial_application` is true; successful child commands are retained rather
than rolled back unsafely across independent V6 nodes.

```json
{
  "offset_c": 0.5,
  "ttl_s": 2700,
  "reason": "dashboard quick boost"
}
```

Touch resolves the room mapping, sends an expiring V6 command, and stores the
accepted/clamped result in the command ledger. Dashboard commands are blocked
before send when the mapped V6 node is stale, unreachable, or not trusted; the
ledger result is `blocked_stale`, `blocked_unreachable`, or `blocked_untrusted`
in that case. If Touch attempts the send but cannot get a usable V6 response,
the ledger result is `failed`; if V6 responds and declines the command, the
ledger result is `rejected`.

### `POST /forecast/settings`

```json
{
  "latitude": 55.6761,
  "longitude": 12.5683,
  "source": "manual"
}
```

Saving a valid location clears the old cache and makes the next coordinator poll
eligible for an automatic forecast fetch. `0,0` is treated as unset and is not a
valid fetch location. `POST /forecast/fetch` can still be used to queue an
immediate manual refresh; it returns `queued` while the poll task performs the
HTTPS request and command dispatch in the background.

### `POST /weather/settings`

Stores house-level weather preload settings owned by Touch:

```json
{
  "max_boost_c": 1.5
}
```

`max_boost_c` is clamped to `0..5` and caps forecast preload offsets before
Touch sends expiring commands to V6. If no Touch value has been stored yet,
first V6 import seeds this from legacy V6 zone `max_offset_c` values using a
conservative minimum aggregate. V6 still applies its local per-zone command
clamps, absolute setpoint limits, expiry, and safety validation.

### `POST /settings`

Stores coordinator-owned identity and install profile fields:

```json
{
  "name": "Lune Touch",
  "install_id": "house-main",
  "site_label": "Birkemosen",
  "install_mode": "commissioning"
}
```

All fields are optional, but at least one must be present. `install_mode` is one
of `commissioning`, `active`, or `service`. `GET /settings` returns the same
coordinator block and the Touch-owned `weather.max_boost_c` cap.

### `POST /heat-source/settings`

Stores the direct heat-source connection. All configuration fields should be
sent together by management clients:

```json
{
  "enabled": 1,
  "host": "heat-source.local",
  "port": 80,
  "weighted_temperature_variable": "house_temperature",
  "push_interval_s": 30
}
```

`host` accepts a hostname or IPv4 address. Variable names accept letters,
digits, `_`, and `-`. Push interval is 5–3600 seconds. For example, an Asgard
installation could use `asgard.local` with `Virtual Thermostat Input z1` as the
entity name; other heat sources may use a different endpoint and variable.

### `POST /heat-source/push`

Queues an immediate weighted-temperature push on the coordinator task. The
alias `POST /heat-source/test` has the same behavior.

### `POST /forecast/fetch`

Fetches Open-Meteo, recomputes per-zone preload decisions, dispatches active
forecast commands only to fresh reachable V6 nodes, and reports dispatch counts.
`blocked_stale`, `blocked_unreachable`, and `blocked_untrusted` are counted as
skipped before send and are also recorded in the command ledger with source
`forecast`, target node/zone, requested offset, immediate expiry, and the matching
blocked result. `failed` means Touch attempted a command and did not get an
accepted response.

`GET /forecast` includes the cached hourly weather window for graphing:

```json
{
  "weather": {
    "max_boost_c": 1.5
  },
  "hours": [
    {
      "h": 0,
      "timestamp_s": 1735736400,
      "temp_c": 14.1,
      "wind_ms": 5.2,
      "wind_dir_deg": 261,
      "solar_wm2": 0
    }
  ],
  "cache": {
    "hours": 72,
    "fetch_epoch_s": 1735734600,
    "provider_timezone": "Europe/Copenhagen",
    "decision_start_index": 1,
    "restored": false
  },
  "decisions": [
    {
      "room_id": "living",
      "offset_c": 0.4,
      "peak_in_h": 8,
      "configured_thermal_lead_h": 4,
      "learned_thermal_lead_h": 9,
      "active_thermal_lead_h": 9
    }
  ]
}
```

`timestamp_s` is the Open-Meteo Unix timestamp for that exact hourly sample. Touch
uses the first sample at or after its current wall-clock time as the decision-window
origin, so `peak_in_h: 0` means the current or next forecast hour rather than the
midnight array entry. `cache.decision_start_index` identifies that origin in `hours`.

The hourly forecast cache is persisted in Touch NVS after a successful fetch with the
fetch epoch, provider timezone, and every hourly timestamp. After reboot, Touch restores
only a fresh (at most two hours old), clock-aligned cache; an expired cache, a missing
timezone, or malformed hourly timestamps is discarded safely. A restored cache reports
`status: "cached"` and `cache.restored: true` until the next successful live fetch or
location change.

### `POST /zones/{room_id}/motor-action`

Requests a bounded V6-local motor recovery action for the mapped room:

```json
{
  "action": "relearn",
  "confirm": "relearn"
}
```

Accepted actions are `reset_fault`, `reset_learned`, and `relearn`. `reset_learned`
and `relearn` require `confirm` to exactly match the action name. Touch resolves the
room mapping and only sends the corresponding V6-local command when the target node
is trusted, reachable, and fresh. Blocked outcomes are returned as successful write
responses with `result` set to `blocked_untrusted`, `blocked_unreachable`, or
`blocked_stale`; invalid actions, missing confirmations, and unmapped rooms return
`4xx`.

### `POST /recovery/reset-registry`

Clears the Touch-owned node registry, zone mappings, current in-memory learning
history, and persisted command ledger. Learned thermal coefficients are removed with
the zone registry. Forecast location settings are intentionally kept.
The request must include the confirmation token:

```json
{
  "confirm": "reset-registry"
}
```

Successful response:

```json
{
  "result": "reset",
  "registry": "cleared",
  "ledger": "cleared",
  "forecast_location": "kept"
}
```

This is a recovery/install workflow, not a normal operating command.

Forecast decisions include Touch-owned comfort intent so callers can distinguish
physical V6 state from optimizer intent:

```json
{
  "room_id": "living",
  "name": "Living",
  "node_index": 0,
  "zone_index": 1,
  "comfort_setpoint_c": 21.5,
  "priority": 3,
  "offset_c": 0.4,
  "peak_load": 1.8,
  "peak_in_h": 3,
  "active": true
}
```
