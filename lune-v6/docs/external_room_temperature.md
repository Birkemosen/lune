# External room temperature (BYO / large homes)

Lune V6 heats from three room-temperature sources per zone:

| Source | Transport | When |
|---|---|---|
| Local Probe | 1-Wire DS18B20 | Wired probe assigned as room temperature |
| BLE Sensor | On-manifold BTHome scan | Sensor within radio range of V6 |
| External | HTTP `POST /api/v1/room-temperatures` | Remote rooms, Shelly gateway, HA, Homey |

## Mapping rule

**`sensor_id` → zone is configured only on V6.** Producers never send a zone number.

1. On the zone Temperature card choose **External (Wi‑Fi)**.
2. Set **sensor_id** (BLU MAC, HA entity id, Homey device id, …).
3. Optional **friendly name** for the UI only.
4. Copy an example from **Help → External room temperature** (Shelly / Home Assistant / Homey).
5. Producer POSTs `{ "sensor_id", "temp_c", "observed_at_ms"? }` with `X-Lune-Local-Key` and `X-Lune-CSRF` (same key when local access is provisioned).

Unbound `sensor_id` values are ignored (HTTP 200 with `applied: false`) so one Shelly script can forward every heard BLU.

## Freshness (TTL)

| Path | Stale after | Notes |
|---|---|---|
| HTTP External | **15 minutes** | Tuned for hub scripts that post often; fail-safe sooner than BLE |
| BLE / legacy external slot | **60 minutes** | On-manifold BTHome may be quiet for long periods |

Stale / missing → `NAN` → conservative valve / maintenance behavior (same fail-safe family as before).

Local Probe and External zones do **not** consume BTHome MAC matches; only `TempSource::BLE_SENSOR` does. BLE radio demand-gate follows BLE zones (and clock sync) only.

## Commissioning (large homes / BYO)

Recommended layout:

```text
Near manifold: BLU ──BLE──▶ V6
Far rooms / Zigbee / Z-Wave: sensor ──hub──HTTP POST──▶ V6 EXTERNAL
Optional Touch: setpoints only (never room temps)
```

Checklist:

1. Prefer **BLE** for sensors the V6 radio can hear reliably; use **External** for everything else.
2. Pick a stable `sensor_id` once (MAC or hub entity id) and bind it on V6 — moving a sensor to another room is a V6 bind change only.
3. One hub script may POST all heard sensors; V6 applies only bound ids.
4. After binding, confirm **Last ingest** on the zone Temperature card updates within a minute of a producer event.
5. Confirm stale fail-safe: stop the producer and wait past the 15‑minute EXTERNAL window — zone temperature should go invalid / conservative.
6. Keep the local access key on the hub only; rotate by changing V6 Settings and updating scripts.

Do not hardcode zone numbers in customer scripts. Do not put MQTT on V6 or Touch for room temperature.

## Diagnostics

- Zone card: **Last ingest …s ago** (`external_temp_age_ms` via dashboard state).
- `GET /api/v1/zones/{n}`: `sensor_id`, `sensor_name`, `external_temp_age_ms`.
- `GET /api/v1/diagnostics`: `room_temperatures[]` with `temp_source`, `sensor_id`, `external_temp_age_ms`, `ingest_fresh` (HTTP External within 15 min).

## Shelly Mini PM / BLU Gateway

1. Enable Bluetooth + BLE gateway; add BLU as BTHome component in Shelly UI.
2. Bind that BLU’s MAC as `sensor_id` on the V6 zone (External).
3. Run the Shelly script from Help (adjust `sensor_id` / call `postTemp` from your BTHome handler).

## Home Assistant / Homey / Zigbee

Use the hub you already have. Forward entity temperatures with the Help examples. Zigbee never talks to V6 directly.

## Lune Touch

Touch does **not** ingest room temperatures. It only sends setpoint / authority commands. V6 remains the sensor authority.

## Future products

**Lune Gateway** / **Lune Sense** (optional BLE mesh between them) may later POST into the same HTTP contract. Not required for BYO hubs today. No MQTT bridge on V6 or Touch.
