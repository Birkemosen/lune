# Motor Driver Schematic

## Overview

Rev 2.1 uses one shared H-bridge and six motor-mux channels. This replaces the
older per-valve DRV8215/DRV8837 approach and follows the same system-level idea
observed in the HmIP-FALMOT-C12 teardown: only one valve motor moves at a time,
so the expensive direction and sensing hardware can be shared.

```text
ESP32-S3
  -> HBR_IN1 / HBR_IN2
  -> MUX_EN1..MUX_EN6
  -> shared current, BEMF, and tacho measurement

DRV8837 shared H-bridge
  OUT1 -> MOT_COM
  OUT2 -> MOT_DRV

Six motor mux channels
  MOT_DRV -> selected MOTx_SEL
  MOT_COM -> all motor connector pin 2
  MOTx_SEL -> motor connector pin 3
```

The invariant is simple and important: exactly one `MUX_ENn` may be active while
the shared H-bridge is enabled.

## Block Diagram

```text
                         +3V3_SYS
                            |
                      shared DRV8837
                     +-------------+
 HBR_IN1 ----------->| IN1    OUT1 |---- MOT_COM ---- pin 2 on J2..J7
 HBR_IN2 ----------->| IN2    OUT2 |---- MOT_DRV ----+---- mux 1 ---- pin 3 J2
 DRIVE_PERMIT ------>| nSLEEP      |                 +---- mux 2 ---- pin 3 J3
                     | GND         |                 +---- mux 3 ---- pin 3 J4
                     +------+------+                 +---- mux 4 ---- pin 3 J5
                            |                        +---- mux 5 ---- pin 3 J6
                          SHUNT                      +---- mux 6 ---- pin 3 J7
                            |
                          RSH1
                            |
                           GND
```

Direction is set by the shared H-bridge:

| Function | HBR_IN1 | HBR_IN2 | MOT_COM | MOT_DRV |
|---|---:|---:|---|---|
| Coast | 0 | 0 | Hi-Z | Hi-Z |
| Direction A | 1 | 0 | High | Low |
| Direction B | 0 | 1 | Low | High |
| Brake | 1 | 1 | Low/High per DRV mode | Low/High per DRV mode |

The exact open/close polarity is a firmware calibration constant.

## Motor Mux

Each channel is represented in the KiCad generator as `TBD_LOW_RON_SPST`. This
is intentional: the final part must be selected before fab against the actual
actuator current profile.

Minimum requirements:

- Bidirectional analog/load switch behavior.
- Rail-to-rail 0..3.3 V signal path on the motor terminal.
- Target `Ron <= 1 ohm` at 3.3 V control.
- At least 250 mA peak current with margin over the observed 120 mA motor rating.
- High off-isolation so inactive motors cannot backfeed the bus.
- Defined high-Z/off state during reset and when unpowered.
- Package and pinout confirmed in KiCad before schematic release.

FALMOT appears to implement a similar function with three discrete transistors
per channel. For Lune V6 the first review source keeps this as a part-selected
bilateral SPST/load switch, because it is easier to reason about, route, and
validate than a cloned unknown discrete network.

## Sensing

The shared driver return passes through `RSH1`, so `ADC_CURRENT`, the hardware
force-limit comparator, and the tacho/BEMF logic all see the active motor only.
Current is treated as the endstop, jam, load, and force signal. It is not the
primary position signal.

Because the selected actuator is physically on the shared motor bus, no separate
BEMF selector is needed:

```text
MOT_COM / MOT_DRV
  -> 10k input resistors
  -> differential BEMF front end
  -> ADC_BEMF
  -> AC gain + comparator
  -> TACHO_EDGE / PCNT
```

`TACHO_EDGE` is a required commutation-candidate channel, inspired by the VdMot
approach of learning valve travel from motor revolutions. Firmware only promotes
those edges to position counts after BEMF, direction, blanking, cadence, and mux
state checks pass.

For BEMF coast sampling, firmware keeps the selected mux enabled, commands both
H-bridge inputs low, waits for recirculation current to decay, samples
`ADC_BEMF`, and then resumes drive.

## Fault Model

Firmware must reject motion evidence unless exactly one mux channel is active
and it matches the commanded zone. These are hard faults:

- No mux enabled while the H-bridge is driving.
- More than one mux enabled.
- `MUX_ENn` state disagrees with the active zone.
- Current present with no active channel.
- BEMF/tacho edges on an invalid mux state.

Hardware review should decide whether a small interlock is needed so a firmware
bug cannot drive two valves at once.

## Connector Pinout

The motor connectors remain 4P4C/RJ-style jacks using the center pair:

| Pin | Net | Purpose |
|---:|---|---|
| 1 | NC | reserved |
| 2 | `MOT_COM` | shared motor terminal |
| 3 | `MOTx_SEL` | selected motor terminal |
| 4 | NC | reserved |

## Bring-Up

1. Populate the shared H-bridge, one mux channel, one connector, shunt, and BEMF
   front end.
2. Verify reset state: all `MUX_ENn` low, `DRIVE_PERMIT` low, H-bridge Hi-Z.
3. Drive one actuator both directions and measure mux voltage drop at startup,
   free travel, engagement, and endstop.
4. Capture `ADC_CURRENT`, `ADC_BEMF`, `TACHO_EDGE`, `HBR_IN1/2`, and `MUX_ENn`.
   Confirm `TACHO_EDGE` cadence tracks real commutations, not PWM or decay edges.
5. Confirm inactive connectors cannot move or backfeed during active drive.
6. Populate remaining mux channels only after current/BEMF signatures are clean.
