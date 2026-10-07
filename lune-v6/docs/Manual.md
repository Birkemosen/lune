# Lune V6 Manual

Installer- and operator-facing guide for the local web UI. The `?` help in the UI links
here. Deep engineering notes stay in the other files under [`docs/`](./).

Lune V6 is a **local 6-zone hydronic manifold controller**. It stays safe without
Lune Touch: motors, endstops, temperature freshness, and command clamps run on
the device. Touch may send setpoints and weather preload; it never chooses the
zone for room temperatures.

<!-- toc -->
**[The web UI](#the-web-ui)**

**[Home](#home)**

**[Zone sheet](#zone-sheet)**

- [Settings › Comfort and Room](#settings--comfort-and-room)
- [Settings › Floor and Weather](#settings--floor-and-weather)
- [Settings › Advanced](#settings--advanced)

**[Manifold sheet](#manifold-sheet)**

- [Settings › Heating mode and Heat pump limits](#settings--heating-mode-and-heat-pump-limits)
- [Settings › Preheat absorption and balancing](#settings--preheat-absorption-and-balancing)

**[System](#system)**

- [Device](#device)
- [Manifold and motors](#manifold-and-motors)
- [Connections](#connections)
- [Firmware and backup](#firmware-and-backup)
- [Service](#service)
- [Motor lab (dev builds)](#motor-lab-dev-builds)

**[External room temperatures (ingest)](#external-room-temperatures-ingest)**

**[Safety principles](#safety-principles)**
<!-- /toc -->

---

## The web UI

The UI has three places, following the Lune design system:

- **Home** — what is happening now: heat, comfort per zone, faults. Nothing to save.
- **Sheets** — one per thing: a sheet per **zone** (Z1–Z6) and one for the **manifold**.
  A sheet slides in over Home and has the tabs **Overview**, **History** and **Settings**.
  Settings for that one thing live in its sheet.
- **System** — the device itself and its connections: identity, manifold and motors,
  Lune Touch and Wi-Fi, firmware and backup, service.

The **zone strip** at the top opens a zone's sheet; the **System** tile opens the manifold
sheet. The **device menu** (logo) shows identity (name, location, IP, MAC, firmware,
ESPHome, uptime), **Copy diagnostics**, and other Lune devices on the LAN.

Each settings tab and System category has one save bar at the bottom: **Undo** and **Save**.
Switches save immediately; leaving with unsaved changes asks first. Links can point
straight at a place, for example `#z3/settings` or `#system/connections`.

---

## Home

- **Status line** — number of zones, how many call for heat, faults.
- **Fault panel** — appears when a zone has a motor fault; the button opens that zone.
- **Heat now** — manifold supply, return, ΔT, total opening and the last 24 hours.
  **Open manifold** opens the manifold sheet.
- **Comfort by zone** — temperature against target for each zone over 24 hours;
  a row opens the zone's sheet.

The zone tiles show temperature, a chip with the distance to target (blue below,
neutral near, orange above) and the valve opening in five steps.

---

## Zone sheet

**Overview** — temperature and target (− / + saves by itself), opening, return,
motor state, preheat advance, weather offset, temperature source, and the fault panel
with **Reset fault** when the motor has latched a fault. A grouped member zone shows
which zone it follows and opens that one; its target is locked.

**History** — the last 24 hours and a 6-hour projection.

<a id="zone-room"></a>
### Settings › Comfort and Room

**Comfort**: target and **Zone enabled** (saves immediately).

**Room**: name, area and temperature source (**probe** or **BLE**, with scan and
assign). With 8 return probes, the zone's return probe is chosen here.

External Wi‑Fi room temperatures (Shelly / Home Assistant / Homey) map
`sensor_id` → zone **only on V6**. Producers never send a zone index. See
[external room temperature](./external_room_temperature.md).

<a id="zone-floor"></a>
### Settings › Floor and Weather

**Floor**: pipe spacing and type, slab, covering and thickness. **Weather**: exterior
walls, wind and solar factors. These feed local physics and Touch preload.

<a id="zone-motor"></a>
### Settings › Advanced

**Motor and calibration** (subpage): learned open/close ripples and factors, preheat
advance and the last fault. **Reset fault** clears a latched endstop fault.

**Grouping** (subpage): **Group with** merges loops into one room — shared target,
valves open together.

**Reset and relearn** (last on the tab, asks first) wipes calibration and runs
end-stop learning again — the zone will not heat normally until learning finishes.

Details: [endstop detection](./endstop_detection.md).

---

## Manifold sheet

**Overview** — supply, return, ΔT and total opening; the **balancing** table with
the current mode; **Live readings** of every 1-Wire probe, so wiring can be checked.

**History** — supply and return over the last 24 hours.

<a id="heating"></a>
### Settings › Heating mode and Heat pump limits

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

<a id="regulation"></a>
### Settings › Preheat absorption and balancing

**Preheat absorption** (switch saves immediately) with its band and delta.

House balancing adapts slowly from observed room behaviour; the mode is shown on the
balancing table. **Reset balancing** (last on the tab, asks first) forgets learned
factors for all zones and returns to priors.

Coordinator-owned whole-house learning (Touch / Mini) may override strategy; V6
still clamps locally. See [adaptive balancing](./adaptive_balancing.md) for the
algorithm notes.

---

## System

### Device

<a id="device-identity"></a>
**Device identity**: display name and location, shown in the device menu and to Lune Touch.

<a id="ble-clock"></a>
**BLE clock**: when enabled, V6 continuously emits Shelly Date/Time Broadcast (~one
packet every 2 s) **concurrently with BLE scan**, so BLU displays can set their clock
without NTP. Automatic display sync is typically once per day.

**Sync now** refreshes the beacon timestamp immediately. To force a display:
press once to enter setup (`SEt`), then press twice rapidly. Bluetooth must be
on (hold ~5 s to toggle if needed).

<a id="manifold"></a>
### Manifold and motors

Valve type (**NO** / **NC**) and which 1-Wire probes measure manifold supply and
return. That drives ΔT on the strip and the direction motors must run.

<a id="return-probes"></a>
**Probe layout**: **2 probes** — shared supply/return on the manifold. **8 probes** —
a return sensor per zone for finer diagnostics and commissioning; assign each zone's
return in its sheet under Settings › Room. Check the wiring with **Live readings** in
the manifold sheet before saving the layout.

**Motors**: motor drivers can be disabled to electrically disconnect all six actuators.
Default motor profile and max run time apply until a zone has learned its own stroke.

**Advanced** (subpages **Close end stop**, **Open end stop**, **Relearning**): expert
endstop limits in the firmware's units. They are commissioning defaults — once
learned, per-zone factors take over. **Relearn all** (last, asks first) restarts
learning for every zone.

Further reading: [endstop detection](./endstop_detection.md),
[hydraulic commissioning](./hydraulic_commissioning.md).

### Connections

<a id="touch"></a>
**Lune Touch**: approve or revoke Touch control of this manifold. Discovery alone never
grants authority. Without approval, V6 stays fully local and conservative. The actions
shown follow the state (approve, cancel, retry, revoke); technical IDs are on a subpage.

Touch may deliver **weather preload**, **setpoints**, **absorb arming**, and a
**heating mode** override while its lease is active. Zone exposure (walls, wind,
solar) is set in each zone's sheet under Settings › Weather — not here.

<a id="wifi"></a>
**WiFi**: shows the network V6 is on and lets you move it to another one (for example
after changing the router password). Enter the network name and password and
press **Change network**. If the new network does not connect within 30 seconds,
V6 goes back to the current one. The setting survives firmware updates.

If V6 cannot reach its network at all, it opens the setup network
**Lune V6 Setup** after 5 minutes. Join it and open http://192.168.4.1 to pick a
network and enter its password.

**External room temperatures**: how BYO hubs send room temperatures — see
[below](#ingest).

### Firmware and backup

<a id="firmware"></a>
**Firmware**: check for updates, install from the network, or upload a `.bin` /
`.ota.bin`. Valves hold position across reboot (~10 s). Prefer release builds for
production.

<a id="backup"></a>
**Backup**: export or import settings as JSON (import asks first). Secrets and
authority keys are never included. Learned motor ripples/factors are optional — leave
them out when moving config to a replacement board that should relearn.

### Service

<a id="health"></a>
**Diagnostics**: live CPU, heap and PSRAM. Task dump, I²C scan and 1-Wire dump write
into the device log for installers.

<a id="logs"></a>
**Device logs**: streaming device log. Pause, clear or download when diagnosing faults.
Newest lines first.

<a id="manual"></a>
**Manual motor control**: turns off automatic control of **all** zones until disabled.
Drive to a valve position, or run a timed open/close (1–45 s, subpage **Timed run**)
with endstop detection still armed. Leaving manual mode on leaves the house without
closed-loop heating.

<a id="device-actions"></a>
**Device actions** (last, each asks first): **reset probe map** (re-assign every probe)
and **restart**. Identity lives under System › Device, not here.

<a id="motor-lab"></a>
### Motor lab (dev builds)

Stroke capture for development firmware only. Suspends automatic control while
recording; use the emergency stop if needed.

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
4. Destructive actions stay behind confirmation; identity stays in System › Device.

For firmware architecture and FreeRTOS layout see [ARCHITECTURE.md](./ARCHITECTURE.md).
