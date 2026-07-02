# Lune V6 — Rev 2 board design (shared driver, motor mux)

Status: **design draft for a PCB respin.** The KiCad schematic has been
regenerated from the shared-driver / motor-mux generator. The PCB artifact still
needs regeneration and routing review before fabrication.

## 1. Goals

- Safe deterministic calibration for 2-wire motor valves.
- Fewer active driver parts than six independent H-bridges.
- Preserve shared current, BEMF, tacho, and hardware force-limit sensing.
- Keep Lune V6 a safe local manifold node: one motor moves at a time and every
  command is validated locally.
- Power exclusively from USB-C. No mains input, no auxiliary low-voltage input,
  and no external motor supply on the controller PCB.

## 2. Architecture

Only one valve moves at a time. Lune therefore uses one shared H-bridge and six
motor-mux channels:

```text
ESP32-S3-N8R8
  -> HBR_IN1 / HBR_IN2
  -> MUX_EN1..MUX_EN6
  -> ADC_CURRENT / ADC_BEMF / TACHO_EDGE
  -> FLIM_PWM / latch state

shared DRV8837
  OUT1 -> MOT_COM -> pin 2 on all 4P4C motor jacks
  OUT2 -> MOT_DRV -> selected pin 3 through mux channel

one low-Ron bidirectional SPST/load switch per zone
  MUX_ENn selects exactly one valve
```

The teardown-inspired part is the mux, not the safety policy. Firmware and
hardware review must guarantee that exactly one mux channel can be active while
the bridge is driving.

## 3. Power

| Rail | Source | Notes |
|------|--------|-------|
| `VBUS_FUSED` | USB-C VBUS through input fuse | Sole board power input |
| `+3V3_SYS` | MT2492 buck from USB-C VBUS | Logic and motor rail in current Rev 2.1 source |
| `+3V3_A` | ferrite-filtered analog rail | INA, op-amp, comparator references |
| `VBIAS` | buffered half-rail | BEMF/tacho analog midpoint |

The motor rail is intentionally the same 3.3 V system rail. If future actuators
need more than 3.3 V, that is a different hardware variant; do not add a second
power input to this board revision.

## 4. Motor Driver and Mux

The shared H-bridge is `DRV8837DSGR` in the generator. It provides polarity
reversal, coast windows, and the single ground return through `SHUNT`.

Each mux channel is currently represented as `TBD_LOW_RON_SPST`. Required final
part properties:

- Bidirectional analog/load-switch path.
- Rail-to-rail 0..3.3 V motor terminal operation.
- Target `Ron <= 1 ohm` at 3.3 V control.
- At least 250 mA peak current with margin over the 120 mA actuator rating.
- High off-isolation and no backfeed from inactive channels.
- Known reset/unpowered behavior: off/high-Z.
- Confirmed KiCad footprint and JLC/LCSC availability before release.

Connector pinout:

| Pin | Net | Purpose |
|---:|---|---|
| 1 | NC | reserved |
| 2 | `MOT_COM` | shared motor terminal |
| 3 | `MOTx_SEL` | selected motor terminal |
| 4 | NC | reserved |

## 5. Shared Sensing

The shared driver return flows through `RSH1`, so all sensing sees only the active
motor:

```text
SHUNT -> INA180A1 -> ADC_CURRENT
SHUNT -> hardware comparator -> force-limit latch -> DRIVE_PERMIT
MOT_COM/MOT_DRV -> differential BEMF front end -> ADC_BEMF
ADC_BEMF AC path -> comparator -> TACHO_EDGE / PCNT
```

Current handles load, engagement, stall, jam, disconnect, endstop detection, and
force protection. BEMF/tacho handles real commutation evidence and position
counts. This mirrors the useful split seen in VdMot-style controllers: current is
good at saying "the motor is pushing/stopped"; tacho is the better signal for
"the rotor actually moved". Firmware must not accept position evidence unless
the active mux state matches the commanded zone.

## 6. Firmware Mapping

| Function | Signal |
|---|---|
| Shared bridge polarity/coast | `HBR_IN1`, `HBR_IN2` |
| Zone select | `MUX_EN1`..`MUX_EN6` |
| Current | `ADC_CURRENT` |
| BEMF waveform | `ADC_BEMF` |
| Tacho candidate edges | `TACHO_EDGE` |
| Force threshold | `FLIM_PWM` PWM-DAC |
| Hardware latch | `LATCH_ARM_N`, `LATCH_STATE`, `DRIVE_PERMIT` |

Firmware sequence:

1. Confirm `DRIVE_PERMIT` armed and all muxes off.
2. Assert exactly one `MUX_ENn`.
3. Set H-bridge direction.
4. Drive, sample current and BEMF, qualify tacho edges as motor commutations.
5. For coast-BEMF sampling, set both H-bridge inputs low while keeping the mux
   selected, then sample after the recirculation blanking delay.
6. Stop by coasting, then clear the mux enable.

## 7. Fault Model

Hard faults:

- More than one mux enabled.
- No mux enabled while bridge current is present.
- Current on `SHUNT` while all muxes are off.
- BEMF/tacho evidence from a non-commanded mux state.
- Elevated current with lost motion mid-stroke.
- Low current with no BEMF/tacho evidence during commanded motion.
- Hardware force-limit latch trip.

The firmware may fall back to conservative time-driven limp movement only when
current protection is still valid and the mux state is trustworthy.

## 8. Bring-Up

1. Populate the shared driver, one mux, one connector, shunt, and analog front end.
2. Verify reset state: `DRIVE_PERMIT` low, all `MUX_ENn` low, bridge Hi-Z.
3. Measure mux voltage drop and thermal rise across startup, free travel,
   engagement, loaded stroke, and endstop.
4. Capture `ADC_CURRENT`, `ADC_BEMF`, `TACHO_EDGE`, `HBR_IN1/2`, and `MUX_ENn`
   simultaneously.
5. Confirm inactive connectors cannot move or backfeed.
6. Populate remaining mux channels after one-channel current/BEMF signatures are
   clean.

## 9. Open Items

- Select final low-Ron mux/load-switch MPN.
- Decide whether a hardware one-hot interlock is needed for `MUX_EN1..6`.
- Tune `RSH1`, INA gain, BEMF gain, tacho hysteresis, and force threshold.
- Validate that `TACHO_EDGE` counts real motor commutations across the actuator
  population; do not release with current-only position estimation.
- Regenerate KiCad schematic/PCB artifacts and rerun ERC/DRC.
