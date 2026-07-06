# Lune Touch API v1

The embedded browser dashboard and external commissioning tools use:

```text
/api/lune-touch/v1
```

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
- `GET /diagnostics`
- `GET /settings`

`GET /nodes` reports both configured hostname/IP and runtime poll evidence:
`last_success_host` shows whether the latest successful poll used mDNS hostname
or fallback IP, while `last_failure` carries the latest poll failure reason.
`trust` remains the compact enum value and `trust_label` is the stable human/tool
label: `paired` or `trusted`. `pairing_fingerprint` is the stored V6 identity
hint used to detect a different device answering on the same address.
Each node also includes a Touch-derived `health` block aggregated from mapped
zones so commissioning tools can show useful manifold status before the richer
V6 diagnostics poll is promoted:

```json
{
  "id": "v6-ground",
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

Returns the read-only Asgard / Odin strategy snapshot. The signal intentionally
keeps physical house temperature separate from comfort demand so external
bridges do not have to overload one thermostat value with two meanings:

```json
{
  "physical": {
    "has_temperature": true,
    "temperature_c": 20.7,
    "contributing_zones": 8
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
  "asgard_odin": {
    "physical_signal": "priority_weighted_house_temp",
    "comfort_signal": "separate_weighted_demand",
    "mode": "advisory"
  }
}
```

`GET /diagnostics` also exposes a compact `learning` summary derived from the
same persisted zone history, including zones with samples, total samples, heat-call
sample count, calling ratio, zones with temperature-rate estimates, and warming /
cooling counts. It also includes `ota` runtime data with the running partition
label/subtype, slot size, rollback state, and `pending_verify` flag so installers
can confirm OTA recovery assumptions.

Diagnostics includes a `commissioning` readiness block for field testing:

```json
{
  "paired_nodes": 1,
  "trusted_nodes": 1,
  "reachable_nodes": 1,
  "stale_nodes": 0,
  "identity_missing_nodes": 0,
  "bound_zones": 6,
  "fresh_zones": 6,
  "stale_zones": 0,
  "ready_for_commands": true,
  "ready_for_forecast": true,
  "next_action": "ready"
}
```

`next_action` is one of `add_node`, `fix_node_poll`,
`verify_node_identity`, `trust_node`, `map_zones`,
`wait_for_fresh_zone_poll`, `set_forecast_location`, or `ready`.

### `GET /zones`

Each zone includes Touch-owned comfort intent, latest live V6 state, forecast
tuning, and a lightweight persisted learning history block. Live temperature /
valve state still resets on reboot; history survives registry import/export:

```json
{
  "room_id": "living",
  "name": "Living",
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
    "heat_gain_c_per_h": 0.42,
    "cool_loss_c_per_h": 0.18,
    "confidence": 0.5
  }
}
```

`comfort.effective_setpoint_c` is resolved by Touch. When local time is valid and
the room schedule is active, `effective_source` is `schedule`; otherwise it is
`comfort`. The stored comfort bias is applied in both cases. `thermal_model`
contains Touch-learned, persisted coefficients derived from fresh temperature
history; it is observational and does not yet override local V6 safety behavior.

## Writes

Write endpoints accept query parameters and JSON request bodies. The embedded
dashboard uses query-parameter POSTs for small form writes, while external
commissioning tools can send normal JSON bodies. Invalid writes return HTTP `4xx`
with the standard `ok:false` envelope. Valid safety outcomes, such as a setpoint
command blocked because its V6 node is stale, are returned as successful write
responses and recorded in the command ledger.

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
  "trust": "trusted"
}
```

Accepted values are `paired` and `trusted`. Promotion to `trusted` requires a
stored `pairing_fingerprint`; if the node was added without one, probe or re-add
the candidate after V6 identity is available. Use `POST /nodes/{node_id}/remove`
to remove a node from the registry instead of writing `unpaired`.

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

Stores Touch-owned comfort intent separately from the V6 node's local measured
temperature and safety-clamped command path:

```json
{
  "comfort_setpoint_c": 21.5,
  "comfort_bias_c": 0.2,
  "priority": 2
}
```

`comfort_bias_c` is clamped to `-3..3` and is added to the stored comfort
setpoint for forecasting and Asgard / Odin demand. `priority` is clamped to
`0..3`, where higher values are more important for future whole-house
optimization.

### `POST /zones/{room_id}/schedule`

Stores the first Touch-owned schedule primitive: one daily comfort window per
room. The schedule is persisted and exposed in `GET /zones`; command dispatch is
still handled by explicit dashboard/forecast paths until the effective-comfort
resolver is introduced.

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

### `POST /zones/{room_id}/setpoint-command`

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
in that case.

### `POST /forecast/settings`

```json
{
  "latitude": 55.6761,
  "longitude": 12.5683,
  "source": "manual"
}
```

### `POST /settings`

Stores coordinator-owned identity and install profile fields:

```json
{
  "name": "Lune Touch",
  "install_id": "house-main",
  "site_label": "Birkemosen",
  "install_mode": "commissioning",
  "asgard_enabled": 1,
  "asgard_mode": "advisory"
}
```

All fields are optional, but at least one must be present. `install_mode` is one
of `commissioning`, `active`, or `service`. `asgard_mode` is `advisory` or
`disabled`; writing `disabled` also clears `asgard_enabled`. `GET /settings`
returns the same coordinator block plus the current Asgard / Odin integration
settings.

### `POST /forecast/fetch`

Fetches Open-Meteo, recomputes per-zone preload decisions, dispatches active
forecast commands only to fresh reachable V6 nodes, and reports dispatch counts.
`blocked_stale`, `blocked_unreachable`, and `blocked_untrusted` are counted as
skipped before send; `failed` means Touch attempted a command and did not get an
accepted response.

`GET /forecast` includes the cached hourly weather window for graphing:

```json
{
  "hours": [
    {
      "h": 0,
      "temp_c": 14.1,
      "wind_ms": 5.2,
      "wind_dir_deg": 261,
      "solar_wm2": 0
    }
  ],
  "cache": {
    "hours": 72,
    "restored": false
  }
}
```

The hourly forecast cache is persisted in Touch NVS after a successful fetch.
After reboot, `status` is `cached` and `cache.restored` is `true` until the next
successful live fetch or location change.

### `POST /zones/{room_id}/motor-action`

Requests a bounded V6-local motor recovery action for the mapped room:

```json
{
  "action": "relearn"
}
```

Accepted actions are `reset_fault`, `reset_learned`, and `relearn`. Touch resolves
the room mapping and only sends the corresponding V6-local command when the target
node is trusted, reachable, and fresh. Blocked outcomes are returned as successful
write responses with `result` set to `blocked_untrusted`, `blocked_unreachable`, or
`blocked_stale`; invalid actions and unmapped rooms return `4xx`.

### `POST /recovery/reset-registry`

Clears the Touch-owned node registry, zone mappings, persisted learning history,
and persisted command ledger. Forecast location settings are intentionally kept.
The request must include the confirmation token:

```json
{
  "confirm": "reset-registry"
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
