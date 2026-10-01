# Lune V6 Manual

Installer- and operator-facing guide for the local dashboard. Short in-UI help
(`?` on configuration panels) links here. Deep engineering notes stay in the
other files under [`docs/`](./).

Lune V6 is a **local 6-zone hydronic manifold controller**. It stays safe without
Lune Touch: motors, endstops, temperature freshness, and command clamps run on
the device. Touch may send setpoints and weather preload; it never chooses the
zone for room temperatures.

---

## Dashboard and navigation

- **Device menu** (logo): identity (name, location, IP, MAC, firmware, ESPHome,
  uptime) and **Copy diagnostics**. Other Lune devices on the LAN are listed
  below. No restart / OTA / reset here.
- **Mode pill**: Dashboard | Configuration.
- **Zone strip**: Manifold overview or a single zone.

---

## Configuration › Setup

<a id="manifold"></a>
### Manifold and motors

Valve type (**NO** / **NC**) and which 1-Wire probes measure manifold supply and
return. That drives ΔT on the strip and the direction motors must run.

Motor drivers can be disabled to electrically disconnect all six actuators.
Default motor profile and max run time apply until a zone has learned its own
stroke. Expert endstop limits under “Limits” are commissioning defaults — once
learned, per-zone factors take over.

Further reading: [endstop detection](./endstop_detection.md),
[hydraulic commissioning](./hydraulic_commissioning.md).

<a id="regulation"></a>
### Regulation

House balancing factors and optional preheat absorption. **Adaptive** mode
adjusts slowly from observed room behaviour; **Reset balancing** forgets learned
factors for all zones and returns to priors.

Coordinator-owned whole-house learning (Touch / Mini) may override strategy; V6
still clamps locally. See [adaptive balancing](./adaptive_balancing.md) for the
algorithm notes.

<a id="heating"></a>
### Heating mode

**Normal** vs **Heat pump**, plus a minimum total opening. Heat-pump limits
(base supply, overheat margin, trim) only apply in heat-pump mode and bound how
hard the manifold may call.

<a id="return-probes"></a>
### Return probes

**2 probes**: shared supply/return on the manifold. **8 probes**: add a return
sensor per zone for finer diagnostics and commissioning. Assign returns on each
zone under Room and sensors.

---

## Configuration › Connect

<a id="touch"></a>
### Lune Touch

Approve or revoke Touch control of this manifold. Discovery alone never grants
authority. Without approval, V6 stays fully local and conservative.

<a id="ble-clock"></a>
### BLE clock

Optional BLE time beacon so room displays (e.g. Shelly BLU) stay in sync without
NTP on every gadget. Interval is how often the beacon is advertised.

<a id="weather"></a>
### Weather preload

Forecast and wind/solar preload are owned by **Lune Touch**. V6 applies offsets
it receives and stores per-zone exposure (walls, wind, solar) under each zone’s
Floor and weather panel.

---

## Configuration › Maintain

<a id="firmware"></a>
### Firmware

Check for updates, install from the network, or upload a `.bin` / `.ota.bin`.
Valves hold position across reboot (~10 s). Prefer release builds for production.

<a id="backup"></a>
### Backup

Export or import settings as JSON. Secrets and authority keys are never
included. Learned motor ripples/factors are optional — leave them out when
moving config to a replacement board that should relearn.

---

## Configuration › Service

<a id="manual"></a>
### Manual motor control

Turns off automatic control of **all** zones until disabled. Use stop or
drive-to-target for service work only. Leaving manual mode on leaves the house
without closed-loop heating.

<a id="health"></a>
### Runtime health

Live CPU, heap and PSRAM. Task dump, I²C scan and 1-Wire dump write into the
device log for installers.

<a id="logs"></a>
### Device logs

Streaming device log. Pause, clear or download when diagnosing faults. Newest
lines first in the dashboard view.

<a id="device-actions"></a>
### Device actions

Destructive actions only: **reset probe map** (re-assign every probe) and
**restart**. Identity lives under the device menu, not here.

<a id="motor-lab"></a>
### Motor lab (dev builds)

Stroke capture for development firmware only. Suspends automatic control while
recording; use e-stop if needed.

---

## Zone configuration

<a id="zone-room"></a>
### Room and sensors

Name, area, enable, and temperature source (**probe** or **BLE**). **Group with**
merges loops into one room: shared target, valves open together — the hint under
the field is intentional.

External Wi‑Fi room temperatures (Shelly / Home Assistant / Homey) map
`sensor_id` → zone **only on V6**. Producers never send a zone index. See
[external room temperature](./external_room_temperature.md).

<a id="zone-floor"></a>
### Floor and weather

Pipe spacing/type, slab and covering, thermal lead, exterior walls, wind and
solar factors. These feed local physics and Touch preload.

<a id="zone-motor"></a>
### Motor

Learned open/close ripples and factors, last fault. **Reset fault** clears a
latched endstop fault. **Relearn** wipes calibration and runs end-stop learning
again — the zone will not heat normally until learning finishes.

Details: [endstop detection](./endstop_detection.md).

---

<a id="ingest"></a>
## External room temperatures (ingest)

BYO hubs POST to `/api/v1/room-temperatures`. Example:

```http
POST /api/v1/room-temperatures
X-Lune-CSRF: 1
Content-Type: application/json

{"sensor_id":"living-room","celsius":21.4}
```

Full contract and hub recipes: [external room temperature](./external_room_temperature.md),
[API v1](./lv6_api_v1.md).

---

## Safety principles

1. V6 validates and clamps every command locally.
2. Stale room temperatures fail safe (valves conservative / maintenance).
3. Touch and hubs never pick the zone for a temperature sample — only `sensor_id`
   mapping on V6 does.
4. Destructive actions stay behind confirmation; identity stays in the device menu.

For firmware architecture and FreeRTOS layout see [ARCHITECTURE.md](./ARCHITECTURE.md).
