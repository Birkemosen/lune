# HeatValve-6 Rev 2.1 electrical design review

## Scope and status

This directory is the editable KiCad 10 implementation of Rev 2.1. The
programmatic schematic source has been updated to a shared-driver / motor-mux
architecture after teardown review of the HmIP-FALMOT-C12. The committed
`.kicad_sch` has been regenerated from the generator; the `.kicad_pcb` artifact
still needs regeneration/routing work.

The PCB remains a placement baseline, not a fabrication release: copper routing,
mechanical fit, mux part selection, and final review still need to be completed.
Power is USB-C-only in this revision; there is no mains input, no auxiliary
low-voltage input, and no separate external motor supply.

## Motor architecture

Rev 2.1 now exploits the invariant that only one valve motor moves at a time.
Instead of six independent H-bridges, one shared DRV8837 drives a two-wire motor
bus:

```text
DRV8837 OUT1 -> MOT_COM -> pin 2 on all motor jacks
DRV8837 OUT2 -> MOT_DRV -> selected pin 3 through one mux channel
```

Each motor connector keeps the center pair, but pin 2 is common across all
outputs and pin 3 is the per-zone selected terminal. With only one mux channel
enabled, the active actuator sees normal bidirectional H-bridge drive. Inactive
actuators have only `MOT_COM` connected and therefore no return path through
`MOT_DRV`.

The generator represents each mux as `TBD_LOW_RON_SPST` until a final component
is selected. The production part must be a low-Ron bidirectional analog/load
switch suitable for rail-to-rail 3.3 V motor terminals, at least 250 mA peak
current, high off-isolation, and safe high-Z behavior when unpowered or disabled.
Target on resistance is <=1 ohm so the actuator still sees essentially the full
3.3 V rail. The exact MPN/pinout is a release blocker.

Firmware must assert exactly one `MUX_ENn` during any drive window. Hardware
review must also consider whether a small logic interlock is needed before fab,
so a firmware bug cannot connect two valves to `MOT_DRV` at once.

## Current sensing and protection

`RSH1` is 1.0 ohm, with `RSH2` as a DNP parallel tuning footprint. The shared
driver return joins the `SHUNT` side; only one valve may be driven at a time.
`R13` makes the single connection from the quiet shunt ground pickup to the main
ground plane.

The INA180A1 gain is 20 V/V:

| Motor current | Shunt voltage | INA180 output |
|---:|---:|---:|
| 30 mA | 30 mV | 0.60 V |
| 60 mA | 60 mV | 1.20 V |
| 100 mA | 100 mV | 2.00 V |
| 150 mA | 150 mV | 3.00 V nominal |

This range preserves the temporary pin-engagement current peak instead of clipping it.
The LM339B force comparator independently reads the raw shunt node. The INA180 is
powered from 3.3 V, and `R14` plus the BAT54S clamp limit ADC injection during transients.

`FLIM_PWM` is filtered, attenuated by 9.1k/1k, and buffered. Its nominal 0–3.3 V
PWM-DAC range becomes approximately 0–174 mV at `FLIM_REF`, corresponding to a
raw-shunt threshold range of approximately 0–174 mA with the 1.0 ohm shunt.
The production setting must exceed measured startup and engagement peaks with margin,
while remaining below the destructive pop-off/grinding current.

Current is therefore the preferred signal for load, pin engagement, jam, normal
endstop detection, and destructive force protection. It is not used as the sole
position counter.

## Differential BEMF and tacho

The selected actuator is already present on the shared motor bus, so the separate
74HC4051 BEMF selectors are removed from the new source design. `MOT_COM` and
`MOT_DRV` enter the differential front end through 10k current-limiting resistors.

The matched terminal/input and feedback network (`10k + 90.9k`, with 47k feedback)
produces approximately:

```text
BEMF_RAW = VBIAS + 0.466 * (MOT_B - MOT_A)
```

This keeps a nominal full-rail differential inside the 3.3 V analog domain.
`ADC_BEMF` is the protected raw ADC channel for waveform capture, coast-window
measurement, and motion validation. A separate AC-coupled x11 stage and LM339B
comparator produce `TACHO_EDGE` for ESP32 PCNT.

The tacho circuit is a first-class design requirement, not an optional debug
output. It exists to count candidate real motor commutations so valve position can
be learned from motion, while current remains the stop/load signal. The comparator
output is not sufficient by itself. Switching transitions must be blanked, edge
intervals must match a physically plausible commutation cadence, and firmware
must confirm motion using the raw BEMF waveform. If continuous-drive sensing is
not clean enough, firmware shall briefly command both DRV8837 inputs low, allow
the recirculation transient to decay, sample differential BEMF, and resume drive.

## Fail-safe behavior

The 74HC74 power-on RC holds asynchronous clear active, so `DRIVE_PERMIT` starts
low. Firmware explicitly arms the latch with a low pulse on `LATCH_ARM_N`. A rising
overcurrent comparator edge clocks D=0, dropping `DRIVE_PERMIT`; `LATCH_STATE`
is the complementary fault indication. `R29` also pulls permit low if the latch
output is not actively valid.

Firmware must never rely on the hardware latch as the normal stop mechanism, and
must still enforce the one-motor-at-a-time constraint.

## External interfaces

- USB-C USB 2.0 UFP and sole power input: 5.1k CC resistors, USBLC6-2SC6 ESD,
  22 ohm data resistors, fused VBUS into the 3.3 V buck.
- Six 4P4C jacks: pin 1 NC, pin 2 shared `MOT_COM`, pin 3 per-zone `MOTx_SEL`,
  pin 4 NC.
- Motor mux GPIOs: `MUX_EN1`..`MUX_EN6`; exactly one may be active during drive.
- Analog diagnostics: `ADC_CURRENT`, `ADC_BEMF`; pulse counter: `TACHO_EDGE`.
- Three shared OneWire connectors: pin 1 +3V3, pin 2 DQ, pin 3 GND; 33 ohm source
  resistor, 4.7k pull-up, and ESD diode.
- DNP I2C header: pin 1 GND, pin 2 +3V3, pin 3 SDA/GPIO1, pin 4 SCL/GPIO2, with
  DNP 2.2k pull-ups.

## PCB stack and placement intent

- Board: 120 x 75 mm, four layers, two 3.2 mm M3 mounting holes.
- Top: components and signal routing.
- Inner 1: continuous GND reference plane.
- Inner 2: +3V3_SYS distribution plane, split/necked as required around analog routing.
- Bottom: return/power routing and low-priority signals where needed.
- The ESP32 antenna bridges a 20 x 11.5 mm U-notch cut into the top board edge;
  the wider module keepout remains free of copper and parts.
- One shared driver sits beside six repeated mux lanes directly above their 4P4C
  connectors.
- Shunt/INA/BEMF/tacho/latch circuitry occupies the center analog region.

## Release gates

1. Confirm enclosure, connector pitch, USB opening, board outline, and mounting holes.
2. Confirm exact purchasable MPNs for the buck inductor, shunt, terminal blocks,
   USB connector, LEDs, and all protection parts.
3. Route the shunt as a true star return and route two Kelvin traces directly from
   `RSH1` pads; do not sample the high-current copper elsewhere.
4. Route USB D+/D- as a short, length-matched 90 ohm differential pair over GND.
5. Route the shared WSON motor outputs with a narrow neck-down escape, then widen
   the `MOT_COM` and `MOT_DRV` buses. Keep each mux channel short and symmetric
   from mux to connector.
6. Keep PWM, motor outputs, and buck switch node away from Kelvin traces,
   `BEMF_MUX_A/B`, `BEMF_RAW`, `BEMF_AC`, `FLIM_REF`, and both ADC traces.
7. Fill planes, run final KiCad DRC with zero errors/unconnected items, inspect
   Gerbers and drill files, then perform an independent schematic/PCB review.
8. Prototype with one populated mux lane first; tune coast blanking, BEMF gain,
   tacho cadence filtering, and force threshold before populating all six lanes.
9. Treat a weak or ambiguous `TACHO_EDGE` waveform as a board-release blocker,
   even if current-based endstop detection works.

## Prototype validation

1. Current-limited USB supply: verify no unintended motor enable during ramp/reset.
2. Check 3.3 V regulation, ripple, thermal rise, and worst-case USB current.
3. Verify native USB programming and ESD-protected data integrity.
4. Calibrate ADC current at 10, 30, 60, 100, and 150 mA. Capture startup and
   pin-engagement peaks without clipping.
5. Sweep `FLIM_PWM`, measure the raw-shunt trip threshold, and verify the latch trips
   with firmware stalled and stays tripped until explicitly re-armed.
6. Capture simultaneous `ADC_CURRENT`, `ADC_BEMF`, shared driver inputs,
   `MUX_ENn`, and `TACHO_EDGE`
   during free travel, pin engagement, loaded modulation, closed stop, open stop,
   mid-stroke obstruction, and disconnected-motor tests.
7. Tune C53/C54, x11 gain, hysteresis, switching blanking, and optional coast-window
   delay. Confirm `TACHO_EDGE` follows real commutations and that a stalled motor
   cannot generate accepted position counts.
8. Learn open, engagement, and closed commutation landmarks over at least 20 cycles
   per actuator. Quantify missed/double edges and directional backlash.
9. Verify normal engagement cannot trip the hardware latch, while destructive current
   trips it with firmware stalled.
10. Validate OneWire with three branches and worst-case cable lengths before final routing.
