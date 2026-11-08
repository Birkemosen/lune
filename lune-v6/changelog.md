# Changelog

## Unreleased (for v1.0.0)

- Web UI: the zone sheet's room physics showed its raw text keys (`zdash.phys.wk`, `zdash.phys.notePrior` …) and the back-off message `zdash.backOffSent`; those runtime texts were missing from the page's catalog.
- Heat-pump mode: a loop asked for all the flow it can carry opens to 110 % on its measured valve curve (the line continued 10 % of its span past the full point, within the max opening) instead of to the full point itself. The full point moves with the seat reference and the other loops' pressure; Stue (1. sal) was held at 28 % with full flow measured from 27.5 %. Not to 100 % stroke, which adds travel and drift.
- A learning close may run to 1.25 × the open leg it just counted (at most 3000 counts, the plunger's travel budget) instead of the fixed close ceiling (2600). Toilet (1. sal) has a long free travel; after a 2200-count open leg its wall lies past 2601, so learning failed three times.
- A re-home from a position that is only a hint (after a restart or a fault) accepts the wall as the seat however far it ran: past pin contact at the seat cap's current the valve is seated. Toilet pressed its seal 191 counts from a 0 % hint against a 146-count window and was faulted BLOCKED after every restart.
- Heat-pump mode: a room above its target gets at most its design share × its own load factor. The load law keeps the manifold's total at Q_ref × load and shared out what the cold rooms could not take (they were at full flow) among the rest, warm rooms included: 1. sal 2026-11-08 with Stue and Stue Repo at 100 %, Josephine (0.6 K warm) got 62 %, Laura (0.2 K) 83 % and Soveværelse (0.9 K) 51 %. Now the surplus is not passed on and the manifold passes less.
- The adaptive balance's basis check no longer restarts the board every hour. It read NVS from the zone task, whose stack lives in PSRAM; flash access from there aborts (`cache_utils.c`, «stack must be internal»), so every adaptive step (hourly) crashed both boards and the learned factors never moved. The basis is now read in setup, served from RAM, and written by the NVS task.
- A closing drive no longer takes a seat signal well short of a trusted seat (held position × stroke, short by more than 4 % of the stroke, min 40 counts) as the seat. On a valve with a long spring ramp (Kontor: pin contact 53 counts into a close from 94.7 %) the seat rise (+1 mA over the plateau) tripped 125–243 counts early; since 745479e that stop set 0 %, so every re-home from far open left the valve open and the next small opening passed far too much (10 % after 100 % ran like 23 %; Touch's valve probe read it as hysteresis and found no curve). Now the seat rise and close step start their reference over and the drive goes on; a stall short of it is a jam, and the back-off retry finds the seat. After a restart, a fault or the reset guide the position is a hint and an early seat is accepted as before. Learning uses the open leg it just counted as the expectation and only suppresses the early rise.
- A close that has found the seal ends on it 40 counts before the count ceiling instead of faulting there. Toilet (1. sal, z3) has ~700 counts of free travel before pin contact; its seal bears at ~2400 counts and the wall lies past the 2601 ceiling, so every learning close faulted MECHANICAL_OVERRUN and learning failed three times.
- A motor reversing within 500 ms of its last stop waits out the pause on every path. A relearn started right after an ordinary open move closed 12 ms later, the bridge faulted (raw fault net, «breakaway») and the first learning attempt failed homing.
- The zone sheet shows the room's physics under Overview: heat loss (UA, W/K) and time constant (τ = C/UA, hours) as calculated / learned / used, with the thermal mass and how long Touch has learned the heat loss. `/api/v1/zones` adds `tau_learned_h` (null until learned).
- Adaptive balancing learns each loop's deviation from the physics instead of a free multiplier on it. A room e K under its own setpoint needs (15 + e)/15 of the heat and about the square of that in flow; the manifold's common mode is removed, a deviation is taken up over a day and fades back to 1 over a week without evidence, and the factor stays within 0.75–1.33. The factors start over at 1 whenever the physics changes (method, measured shares, a loop's measured full flow); the old ones were learned against the pipe model and carried over when Touch's measured shares replaced it (1. sal: Soveværelse 0.50, 0.41 of full share while 0.7 K cold; Stue and Stue Repo 1.50). Small moves were also never stored (a step under 0.01 was dropped and the next update started from the old value); the factor now runs in RAM and is stored once it has moved.
- Every close presses to the same wall (Rev 3.3). The seat rise (+1 mA over the plateau) is where the seal first bears, not the seat: Kontor's insert compresses ~450 counts further from there (31 → 44 mA), and where the rise trips moves with motor temperature, so learning seated 450 counts above the seat every re-home found afterwards, and 100 % fell short by as much. Now the rise is only logged («seal at N counts»); a close past pin contact ends at the wall: the seat cap (`cap_close_seat_ma`, also for the FSM's fast close cap), a close step while the rotor is stopping, or a stall. If no wall comes within 700 counts (or 35 % of the stroke) of the seal, the seal is taken as the seat with a warning. The endstop line logs its count, and a re-home that finds the seat further than a trusted position said logs the drift.

- Heat-pump mode is statically balanced while the heat source is idle (Touch's heat-pump phase): every loop gets its design share, and a room over its limit stays closed only while the supply is warmer than it (it moves heat once the water is colder). The load law runs while the heat source runs or prestarts, and when Touch says nothing.
- Heat-pump mode moves heat: a loop closed because its room is too warm reopens while the manifold's supply is at least `hp_heat_move_k` colder than the room (setting «Heat moving», default 0.5 K, stops 0.3 K closer; room and supply probes can differ a few tenths) and another room on the manifold is at or below target. The water then carries the surplus (sun, stove, a warm slab) through the buffer to the rooms that want it; the open loops keep their flows. `/api/v1/zones` shows `heat_moving`.
- Public images without secrets: the WiFi seed, API encryption key and OTA password
  moved to `packages/network/build-secrets.yaml`, which only the development entrypoint
  (`configurations/lune-v6.yaml`) includes. `lune-v6-release.yaml` leaves it out; Home
  Assistant sets the API key when it adds the device. The v1.0.0-rc1 images were
  withdrawn because they carried the build host's API key and OTA password.

## v1.0.0-rc1 — first release candidate (2026-11-02)

First tagged release of Lune V6 as it runs today: ESPHome firmware on the hardware
revision 3.3 PCB (ESP32-S3), six actuator channels driven by three DRV8411 dual
H-bridges behind a hardware one-hot decoder, and a web UI on the Lune Design System.
It works on its own or with Lune Touch as the whole-house coordinator. If a week passes
without changes, this becomes v1.0.0.

### Heating
- Room temperature control per zone with a heat-pump mode: every loop keeps flow,
  zones that need heat open more, satisfied zones sit on a trim floor while the heat
  pump is idle, and warm-closed loops reopen ahead of the floor's lag. "Close fully
  above target" keeps a manifold flow guarantee.
- Room physics per zone (heat loss, thermal mass, time constant), learned daily from
  the house heat loss Lune Touch provides; Touch can calibrate it and set floor and walls.
- Accepts Touch's house balance per zone; balancing mode selectable.

### Valves and motors
- One actuator moves at a time through the decoder; position from current ripple
  counting, with a firmware-held driver sleep and a separate rail overcurrent input.
- Re-homing to the seat is never skipped; positions are kept across reboots.
- A motor fault stops only that motor; a blocked close backs off and retries; overrun
  stays blocked across restarts.
- Fault guide on Home: valve position, breakaway retry, drive back from the panel,
  reset; blocked zones raise the fault alert.

### Sensors and connectivity
- BLE (BTHome) room sensors with a sync watchdog and bounded reboots; 1-Wire probes at
  12 bit.
- Problem notifications to Home Assistant (contract v1), including a restart after a
  crash; last crash log in diagnostics.
- WiFi changeable from the web UI; credentials survive OTA.

### Web UI
- Home / sheet / System on the Lune Design System (2.3.29): zone cards with a 24 h
  chart (temperature, target, heating), fault panel, mobile layout.

### Stability
- No whole-config copies on loop, valve and httpd paths; smaller task stacks; NimBLE
  and zone task stacks and history buffers in PSRAM.

---

Entries below are from HeatValve-6, the predecessor of Lune V6, before this repository.

## v2.0.0 — ESP-IDF Rewrite (2025-07-09)

Complete rewrite from ESPHome YAML to pure ESP-IDF C++ with PlatformIO.

### Breaking Changes
- All ESPHome YAML configuration removed — firmware is now native C++
- Build system changed from ESPHome to PlatformIO (`make build` / `make flash`)
- Configuration via NVS + web dashboard instead of YAML substitutions

### Hardware (v2 PCB)
- Switched from legacy H-bridge + MUX to **6× DRV8215 I2C motor drivers**
- Removed INA219 + LMV358 tacho stage — current sensing via shared IPROPI (GPIO1)
- Added shared nSLEEP (GPIO2) and wired-OR nFAULT (GPIO7)
- Motor addresses: 0x30–0x35 via A1/A0 pin strapping

### Firmware
- **Pure ESP-IDF v5.x** with FreeRTOS tasks (no Arduino, no ESPHome runtime)
- 8 modular libraries: config_store, wifi_manager, valve_controller, sensor_manager, zone_controller, mqtt_handler, web_dashboard, ota_updater
- System manager with task watchdog (5s heartbeat) and coordinated startup
- Dual-core task layout: valve control on Core 1 (10ms), zone/sensor/mqtt on Core 0

### Control
- 4 algorithms retained: Tanh, Linear, PID, Adaptive (runtime-switchable)
- Hydraulic balancing with pipe length, spacing, and floor cover correction
- Failsafe: temperature timeout (5min → maintenance position), MQTT timeout (30min → clear offsets)
- Minimum flow enforcement (10% valve opening)

### Connectivity
- MQTT with Home Assistant auto-discovery (climate + sensor entities)
- Compatible with helios-6 Go service for multi-controller optimization
- Built-in web dashboard (responsive SPA, no external dependencies)
- OTA via HTTP POST to `/api/ota` with dual-partition rollback

### Documentation
- Rewrote ARCHITECTURE.md for ESP-IDF task model and data flow
- Rewrote README.md with PlatformIO build instructions and REST API reference

---

## v1.0.1 — Power & Docs Update (2026-02-13)

### Hardware
- ESP32 powered via 5V pin (VBUS) through SS14 Schottky diode for backfeed protection
- AMS1117 (3V3_LOG) now powers analog/peripherals only, not ESP32
- Added D_5V (SS14, 1A/40V, SMA) to BOM

### Documentation
- Updated power architecture: three independent paths (ESP32, 3V3_MOT, 3V3_LOG)
- Updated README GPIO table to match current design

---

## v1.0.0 — Initial Release (2026-02-13)

Complete redesign of HeatValve-6 floor heating valve controller.

### Hardware
- ESP32-S3 Super Mini with legacy H-bridge motor driver stage
- 6 valve channels via GAQY212GSX optocoupler multiplexing (odd/even)
- MUX inverter: SN74LVC1G04DBVR (U10)
- INA219 high-side current sense (I2C, 0x40, 100mΩ shunt on MCOM)
- LMV358 dual op-amp tacho conditioning (non-inverting amplifier + Schmitt trigger)
- Tuning pads (R12_ALT, R_REF2_ALT) for prototype tacho calibration
- MT2492 3.3V step-down (3V3_MOT), AMS1117-3.3V LDO (3V3_LOG)
- USB-C power input with 220µF bulk capacitor
- Dallas 1-Wire temperature sensors (8 probes)
- WS2812 status LED with color-coded states
- RJ11/RJ10 connectors, HmIP-VDMOT compatible (pin 1 + pin 3)

### GPIO Assignment
| GPIO | Function |
|------|----------|
| GPIO2 | Motor MUX |
| GPIO3 | ENA1 (DRV #2 nSLEEP) |
| GPIO4 | ENA2 (DRV #3 nSLEEP) |
| GPIO5 | DIR2 (IN2) |
| GPIO6 | DIR1 (IN1) |
| GPIO7 | Tacho (LMV358 output) |
| GPIO8 | I2C SCL |
| GPIO9 | I2C SDA |
| GPIO10 | 1-Wire |
| GPIO11 | ENA0 (DRV #1 nSLEEP) |
| GPIO48 | WS2812 LED |
| GPIO1, 12, 13 | Spare |

### Software
- ESPHome-based firmware with modular YAML architecture
- 4 control profiles: Tanh, Linear, PID, Remote
- Current-based endstop detection with adaptive mean learning
- IIR low-pass filtered current measurement (INA219)
- Tacho revolution counting via LMV358 Schmitt trigger
- Hydraulic balancing mode
- Standalone operation with WS2812 status indication

### Documentation
- Full schematic documentation (analog, motor, controller, power)
- Net naming convention: M1+..M6+, MNODD, MNEVEN, MCOM
- CC BY-NC-SA 4.0 license
