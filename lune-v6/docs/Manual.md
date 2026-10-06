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

**Normal** vs **Heat pump**, plus an optional minimum total opening across
accepting loops (0 disables; normal mode only). Heat-pump openings only apply in
heat-pump mode, where every loop keeps flow so the heat pump can hold the lowest
flow temperature:

- **Opening when calling** — a room below setpoint − comfort band opens at least
  this far; the flow allocator may open it further (default 80 %). Between that
  and setpoint the opening ramps down to the base opening.
- **Base opening** — valve position at setpoint (default 60 %)
- **Overheat margin** — °C above setpoint over which the opening trims from base
  to the trim floor (default 1.0 °C)
- **Trim floor** — opening held above setpoint + margin (default 15 %; 30–40 %
  keeps more flow). A zone only closes once it is past setpoint + comfort band +
  margin **and** the manifold supply (flow probe) is more than 1 °C warmer than
  the room — cooler water cannot heat it, so it keeps flowing.

All openings are for the hardest loop; the hydraulic balance scales each loop by
its resistance (area, pipe spacing, pipe type, supply length).

Default local mode is heat pump.

<a id="return-probes"></a>
### Return probes

**2 probes**: shared supply/return on the manifold. **8 probes**: add a return
sensor per zone for finer diagnostics and commissioning. Assign returns on each
zone under Room and sensors. Live readings on this panel show each 1-Wire probe
temperature so you can verify wiring before saving the layout.

---

## Configuration › Connections

<a id="touch"></a>
### Lune Touch

Approve or revoke Touch control of this manifold. Discovery alone never grants
authority. Without approval, V6 stays fully local and conservative.

Touch may deliver **weather preload**, **setpoints**, **absorb arming**, and a
**heating mode** override while its lease is active. Zone exposure (walls, wind,
solar) is set under each zone’s Floor and weather panel — not here.

<a id="ble-clock"></a>
### BLE clock

When enabled, V6 continuously emits Shelly Date/Time Broadcast (~one packet every
2 s) **concurrently with BLE scan**, so BLU displays can set their clock without
NTP. Automatic display sync is typically once per day.

**Sync now** refreshes the beacon timestamp immediately. To force a display:
press once to enter setup (`SEt`), then press twice rapidly. Bluetooth must be
on (hold ~5 s to toggle if needed).

<a id="wifi"></a>
### WiFi

Shows the network V6 is on and lets you move it to another one (for example
after changing the router password). Enter the network name and password and
press **Change network**. If the new network does not connect within 30 seconds,
V6 goes back to the current one. The setting survives firmware updates.

If V6 cannot reach its network at all, it opens the setup network
**Lune V6 Setup** after 5 minutes. Join it and open http://192.168.4.1 to pick a
network and enter its password.

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

Turns off automatic control of **all** zones until disabled. Drive to a valve
position, or run a timed open/close (1–45 s) with endstop detection still armed.
Leaving manual mode on leaves the house without closed-loop heating.

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
