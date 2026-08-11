# Rev 3.2 electrical architecture

Schematic ECO level `rev3.2-B`. Every quantitative claim below is asserted by
`check_design.py` against the generated sheets and the exported netlist.

## Safety and signal flow

```text
USB-C 5 V -> ESD + TPS2553-1 input limiter (latch-off)
                   +-> SY8089 3V3_LOGIC -> ESP32-S3 + logic + analog
                   +-> AP2112 3V3_MOTOR -> 0.5R Kelvin shunt -> 3 x dual H-bridge -> 6 motors
                                                   |            |
                                                   |            +-> nFAULT_N
                                                   +-> INA180 -> 1k/100n -> ADC_CURRENT
                                                               -> fixed comparator -> FAULT_N_RAW

ESP32 A[2:0] + DIR/A3 -> 74HC4514 -> Q0..Q5 / Q8..Q13 -> one bridge input only
NAND(MOTOR_ENABLE, DRIVE_PERMIT) --------------------> decoder E (HIGH disables all)

0.5R shunt -> INA180 CURRENT_RAW -> 1.6..339 Hz band-pass, gain ~85
                                 -> LMV393 Schmitt -> COMM_TACHO_N -> ESP32 PCNT/RMT
                                 -> 1k -> ADC_TACHO (waveform + digital cross-check)

LATCH_STATE (latch /Q) -> reset of 74HC4060 timer -> open-drain FAULT_N_RAW at timeout
driver faults + overcurrent + timeout -> async fault latch -> persistent shutdown
```

## Six channels and driver choice

The production baseline is six channels. A seventh and eighth channel would add
one dual driver, two sense resistors, two connectors, output ESD, decoupling and
roughly 15 mm of connector edge. The extra channels reuse feeder types, but
they still increase populated placements and prevent the preferred compact
outline. A separate eight-channel SKU can reuse this architecture later.

Three `DRV8411PWPR` devices provide six bridges. With `1.0 ohm`, 1% xISEN
resistors, the 180/200/230 mV trip specification gives 178.2/200/232.3 mA
including sense-resistor tolerance.

`DRV8833PWPR` is a TI-listed direct pin-to-pin replacement and six DNP
capacitor pads (VINT to GND, VCP to VM) keep it a drop-in. It is a shortage
substitute, not the population, for two documented reasons: its
electrical-characteristics table specifies **no** xISEN trip limits, so the
current ceiling would become a typical value rather than a guaranteed one; and
its datasheet states that on-resistance increases and output current is reduced
below `VM = 5 V`, reaching 350 mΩ + 300 mΩ at `VM = 2.7 V`, 85 °C against the
DRV8411's 200 mΩ + 200 mΩ characterized from 1.65 V. On a 3.2 V motor rail that
already loses 0.5 Ω to the shunt and 1 Ω to xISEN, six 0603 capacitors are a
cheap price for the specified part.

Both are preferred over DRV8214 because each package supplies two bridges and
does not charge for unused per-channel telemetry.

### Why the candidate list is this short

The binding constraint is that `VM` must be **specified** at the ~3.18 V the
driver pin actually sees (3.3 V rail less the 0.116 V shunt drop). Most of the
H-bridge market starts at 5 V or 8 V, so it is excluded before any other
criterion is applied. Add shunt-programmable current regulation with a specified
trip voltage, an open-drain `nFAULT` and internal input pulldowns for S-01, and
the field narrows to one family.

| Candidate | VM floor | Current ceiling | Verdict |
|---|---|---|---|
| **DRV8411** | 1.65 V | xISEN, 180/200/230 mV specified | **Population.** Cheapest, best stocked and most capable of the set. |
| DRV8410 | 1.65 V | xISEN, same 180/200/230 mV | Functional drop-in — same pinout including NC 11/14, same nFAULT/nSLEEP/pulldowns, same chop timings. Only RDS(on) differs (800 vs 400 mΩ), worth 40 mV instead of 20 mV at 50 mA. Not at LCSC and dearer elsewhere, so not a cost-down; best second source if it ever appears. |
| DRV8411A | 1.65 V | IPROPI mirror, no external trip | Same pin positions but 3/6 are current-mirror outputs; TI lists no direct replacement. A 1 Ω there sets a mirror scale, not a trip point. Not a drop-in. |
| DRV8833 / DRV8833C | 2.7 V | xISEN, **trip not specified** | The only LCSC-stocked fallback, hence the DNP pads. 2.0× the price, 0.35× the stock, six extra capacitors, RDS(on) explicitly derated below 5 V. |
| DRV8841 / 8842 / 8844 | 8.0–8.2 V | — | Cheaper at LCSC ($0.54–0.62) and irrelevant: cannot run on a 3.3 V rail. |
| DRV8835 / DRV8836 | 0 V | none | 220 mΩ and cheap, but no current regulation and no fault output — two nested layers for under $1/board. |
| TC78H660FNG | 2.5 V | fixed internal ~2 A, no external trip | Sense-resistor-less current detection removes both the specified ceiling and the 1.5 Ω retune path. |

Driver cost is `3 x $1.18 = $3.54` against a per-board budget near $43, and
726 units in stock is 242 boards of headroom against the validation plan's
25-board requirement. The original "DRV8833 as the cost-down" framing was
inverted: at $2.37 it is more expensive, less available, needs more parts and is
less specified. Chasing a cheaper bridge is not where prototype cost lives.

## Hardware one-hot control

The `74HC4514` has mutually exclusive active-high outputs and an active-high
inhibit input `E`. `LE` is driven by the same `DECODER_INHIBIT` net: the
address is transparent while all outputs are inhibited, then is physically
latched for the complete enabled move.

- `A0..A2` select channel 0..5.
- `A3=0` selects `Q0..Q5`; `A3=1` selects `Q8..Q13`.
- `Q6`, `Q7`, `Q14`, and `Q15` are unconnected.
- `E = NOT(MOTOR_ENABLE AND DRIVE_PERMIT)` from one `SN74LVC1G00` NAND; either
  inactive enable or a faulted/disarmed latch forces every output low.
- `LE = DECODER_INHIBIT`; GPIO address or direction changes cannot redirect an
  already-active bridge even if firmware misbehaves, so a reversal must pass
  through coast as a matter of hardware rather than firmware promise.
- `MOTOR_ENABLE` has an external pull-down, so reset, boot and unpowered ESP32
  states are safe. The DRV8411 additionally holds nSLEEP with an internal
  500 kΩ pulldown and each xIN pin with 100 kΩ.
- Firmware may change any address bit only with `MOTOR_ENABLE=0`, followed by
  at least 1 ms coast before drive is enabled.

The NAND is retained deliberately. `DRIVE_PERMIT` already gates every driver
`nSLEEP`, so dropping the gate would save two placements — but it would also
collapse two independent paths by which the latch removes drive into one.

This makes the shared current/tacho measurement unambiguous by construction.

## Current analog path

Only motor current crosses the 0.5 ohm, 1%, 1 W rail shunt. An `INA180A1`
(gain 20) produces:

```text
V_ADC_CURRENT = I_MOTOR * 0.5 ohm * 20 = I_MOTOR * 10 V/A
```

Measured free-running 14-19 mA therefore appears as 0.14-0.19 V and the 5 mA
pin-engagement step as 50 mV, rather than being lost near ADC ground.
A 1k/100n anti-alias filter feeds the ESP32-S3 ADC1 input. Firmware uses **6 dB
attenuation** for operation, which puts full scale near 175 mA and covers the
whole operating range at 1.8x the resolution of the 12 dB range; the 12 dB range
is available for the high-current fixture sweep. Production firmware calibrates
offset with all drivers asleep and calibrates gain with a fixture load; raw ADC
codes are never interpreted using nominal ESP32 ADC accuracy.

There is no Schottky clamp on this node. The INA180 is powered from
`+3V3_ANALOG` and cannot drive its output outside 0-3V3, so a clamp protected
nothing, while its reverse leakage returning through the 1 kΩ series resistor
added a few millivolts of temperature-dependent offset — hundreds of
microamperes referred to a 14 mA operating point, and not removable by a
room-temperature offset calibration.

The INA180 output also feeds a 5 V-powered `LMV393` comparator with a fixed
2.80 V threshold (`3.3 V * 56k/(10k+56k)`), giving a nominal 280 mA trip and an
estimated 267-293 mA worst-case interval, 15% above the worst-case 232.3 mA
selected-bridge regulation. The comparator senses `CURRENT_RAW` **before** the
ADC filter: an output-to-GND short bypasses the xISEN resistor entirely
(VM → high-side FET → short → GND) and the DRV8411's own OCP is 4 A, so this
comparator is the only fast protection for that fault and the filter was adding
100 µs to it. Nuisance margin survives even the bounding case where the whole
current-regulation chop ripple crosses the shunt: 232 mA peak is 2.32 V against
a 2.80 V threshold, and in practice the driver's local 10 µF absorbs most of the
50 kHz ripple. The comparator output is open-collector, so its 5 V supply does
not reach the 3.3 V logic it drives.

## What the current thresholds actually protect

Worth stating plainly, because the numbers do not support a stronger claim. The
qualified actuator (HmIP VdMot + Danfoss RA-N) draws 14-19 mA running, peaks at
23-27 mA on the opening stop and 33-50 mA on the closing stop, and spikes to
30-40 mA on opening inrush. Firmware applies a 100 mA hard cap.

Against that population the 178-232 mA bridge regulation and the 267-293 mA rail
comparator are **board-protection backstops**: neither can engage in normal
operation or at a hard mechanical stop, and the bridge limit is roughly 4x the
actuator's stall torque, so it is not a torque ceiling. They act on wiring
faults. Mechanical protection of the valve rests on firmware plus the
independent runtime cutoff.

xISEN is therefore recorded as a production tuning parameter. `1.5 ohm` would
give a 118.8-154.9 mA window, sitting just above the 100 mA firmware cap while
staying clear of the 50 mA stop peak and the 40 mA inrush, and the rail
comparator would still have 72% of margin above it. It is deliberately **not**
narrowed on the prototype: § 3 of the validation plan exists to measure the
current distributions across actuators, wear and temperature, and a tight
ceiling would clip the data it is there to collect.

## Continuous commutation tacho

Rev 3.2 derives learned position from continuous tacho edges. The `CURRENT_RAW`
output of the INA180 is tapped before the 1k/100n ADC filter, AC-coupled around
a stiff mid-rail reference, band-pass amplified by a `TLV9001` stage, and
digitised by the otherwise spare channel of the 5 V-powered `LMV393`. The
open-drain output is pulled to `+3V3_LOGIC` as `COMM_TACHO_N` and connects to
ESP32-S3 GPIO15 for PCNT/RMT capture.

Only one bridge can be active because the 4514 decoder is hardware one-hot;
therefore the shunt ripple and every tacho edge belong to the selected motor.
This path runs continuously while the motor is energised and is the source for
commutator count, speed, learned travel and a rotation-stall plateau.

The stage is a deliberate band-pass rather than a wideband gain block, because
the signal and the interference are three decades apart:

| Quantity | Value | Source |
|---|---|---|
| Commutation events per stroke | 659 close / 1048 open | measured, `docs/endstop_detection.md` |
| Commutation fundamental | ~20-40 Hz, falling to 0 into the stop | derived from the above |
| Ripple current | ~0.7-3 mA on a 14-19 mA average | derived |
| Ripple at `CURRENT_RAW` | 7-30 mV | 10 V/A |
| Current-regulation chop | 20-50 kHz (DRV8411 `t_OFF` = 20 µs) | SLVSGI0C |

Accordingly:

- `R45 * C44` = 100k × 1 µF → **1.6 Hz** high-pass, below the signal band even
  as the motor slows into the stop. The 100 ms settling time is a firmware
  requirement: tacho edges must be blanked for at least 250 ms after drive
  start, which sits inside the existing startup guard.
- `R46 / R47` = 100k / 1k → asymptotic gain 101, ~84-90 across 20-40 Hz. The
  7-30 mV ripple becomes 0.6-2.5 V. Clipping above ~20 mV of input is harmless
  for a zero-crossing detector.
- `R46 * C47` = 100k × 4.7 nF → **339 Hz** low-pass, giving -43 dB at the
  50 kHz chop. Chopping only starts once the current limit is reached, i.e.
  during stall — exactly when the count plateau is being evaluated — so
  rejecting it in the analog domain matters more than the frequency ratio
  suggests.
- `TACHO_REF` is a 1k/1k mid-rail bypassed by 22 µF. The gain-setting return
  and the comparator threshold both come from this node, so its impedance is
  part of the gain: at 47k/47k the gain collapsed to ~6.6 at 20 Hz and the
  comparator injected its own transitions back into the reference.
- Hysteresis is `R49`/`R50` = 4.7k/100k from the output back to the comparator's
  **non-inverting** input: 148 mV at the comparator, ~1.7 mV at `CURRENT_RAW`,
  ~0.17 mA of ripple current — 4x to 17x below the expected signal. Applying it
  to the threshold input instead is negative feedback and produces a 144 mV
  relaxation-oscillator dead band; that was the `rev3.2-A` defect and
  `check_design.py` now fails on it.

`R51` (1 kΩ) brings `TACHO_AMP` to `GPIO5` as `ADC_TACHO`. That is one resistor
for two things the qualification programme needs: the § 2 and § 3 waveform,
missed-edge and false-edge measurements can be logged through the device's own
motor trace instead of requiring a scope on every board × actuator ×
temperature combination, and firmware gets an independent digital cross-check on
the hardware comparator using the already-tested `RippleCounter` code path. The
series resistor isolates the ESP32 ADC sampling kickback from the comparator
input. `TP5`, `TP6` and `TP7` expose `COMM_TACHO_N`, `TACHO_AMP` and
`CURRENT_RAW` for a logic analyser and scope during this work.

The band-pass corners, gain, hysteresis and pulse-width rejection remain
qualification parameters. They are now *derived from* measured actuator data
rather than nominal, but they must still be confirmed against measurement.

## No firmware duty-cycle control

The 4514 supplies the driver inputs with static logic, so the only handle
firmware has for modulating motor voltage is chopping `MOTOR_ENABLE`. That is a
deliberate architectural consequence and it must be recorded, because the
existing DRV8215 firmware drives a boost/hold profile at 70% duty with a 40 ms
PWM period. On Rev 3.2 the actuator sees the rail continuously, so measured
current levels, stroke times and commutation counts all shift and must be
re-characterized.

If duty control is ever reintroduced, note that the previous design tied the
runtime timer's reset to `DECODER_INHIBIT`, so chopping at 25 Hz would have
prevented the timer from ever expiring. That coupling is removed (below).

## Omitted BEMF frontend

The Rev3.1 terminal-tap mux, buffer, clamp and ADC path are omitted from the
production Rev3.2 schematic. They consume ten mounted parts, an ADC GPIO and a
coast interruption, while firmware gets continuous position and stall evidence
from `COMM_TACHO_N` — and, with `ADC_TACHO`, an amplified analog view of the
same ripple that the old BEMF channel was providing far less directly. The
current path, tacho pulse qualification and hard shutdown paths are retained.
This trade does not transfer the overcurrent latch, one-hot inhibit or hardware
timeout into firmware.

## Endpoint classifier in both directions

Every move has independent `open` and `close` learned values. The normal endpoint
decision requires all of:

1. the inrush/engagement blanking window has passed (at least 250 ms, which
   also covers the tacho AC-coupling settling time);
2. current is consistent with load or is rising relative to that direction's
   learned free-running band;
3. qualified commutation was observed during the move, or an explicit
   already-at-stop path sees non-zero connected-motor current;
4. qualified motion has ceased for a bounded debounce interval;
5. elapsed time/position lies in a plausible learned endpoint window.

Classification is conservative:

| Current | Motion | Position/time | Result |
|---|---|---|---|
| elevated | stopped | endpoint window | normal endpoint; stop and resync |
| elevated | stopped | mid-stroke | jam; stop and preserve position |
| low/zero | stopped | any | disconnect/open circuit; stop |
| elevated | continuing | any | load/engagement; continue within limits |
| implausible | implausible | any | sensor fault; stop |

At power-up or after calibration loss, the controller uses conservative
direction-specific time windows and requires both connected-current and stopped
motion. It never treats missing commutation evidence alone as a successful endpoint.

Note the interaction with Rev 3.0 requirement **E-08** (endpoint detected within
250 ms of qualified motion cessation). At a 20-40 Hz commutation rate the period
is 25-50 ms and stretches as the motor slows, so a plateau confirmed over
several periods approaches or exceeds that budget — the shipping firmware
already uses a 750 ms no-ripple-advance timer. E-08 needs either a measured
justification for a longer bound or an explicit restatement; § 3 of the
validation plan measures the latency that decides it.

## Persistent fault latch

Driver `nFAULT`, the rail comparator and timeout transistor share an open-drain
`FAULT_N_RAW` net connected to the active-low asynchronous reset of a
`74LVC1G74`. Its Schmitt-trigger inputs tolerate the bounded power-on RC edge.
`D` and asynchronous set are tied HIGH; a deliberate rising `LATCH_ARM` edge
sets `Q=DRIVE_PERMIT` only after raw fault has released. Complementary `Q` is
the active-high latched fault/status signal on `LATCH_STATE`.

An already-used `2N7002`, gated by active-high `MOTOR_ENABLE`, clamps the latch
clock LOW throughout a move. `LATCH_ARM` reaches that clock through 10k and a
10n coupling capacitor, with a 100k clock pull-down. The AC coupling is
deliberate: releasing the clamp while the GPIO happens to remain HIGH cannot
create an unintended rising clock edge. `ARM_CLK` peaks at 3.0 V and decays with
a 1.1 ms time constant, staying above the LVC `V_IH` for about 290 µs.
Firmware must issue a fresh LOW-to-HIGH arm pulse while drive is disabled.
`DRIVE_PERMIT` controls all driver `nSLEEP` inputs and the NAND/decoder path
independently of the ESP32 address outputs.

Two properties are worth stating because firmware depends on them. Firmware
can **assert** nothing on `FAULT_N_RAW` and cannot **clear** a latched fault:
recovery is always an arm attempt, which fails while raw fault persists.
And `LATCH_STATE` alone cannot distinguish "never armed" from "faulted" —
`FAULT_N_RAW` reaches only `TP3`, so fault-source attribution is not available
to firmware. Both are acceptable for the prototype; a spare GPIO on
`FAULT_N_RAW` is the cheap fix if field diagnosis needs it.

## Independent runtime cutoff

Firmware limits normal HmIP VdMot movement to 40 s and generic profiles to
45 s. A `74HC4060D` RC oscillator/counter provides the hardware bound.

Its master reset is `LATCH_STATE`, the latch's `/Q`. This is the change that
makes the layer real. Referenced to `DECODER_INHIBIT`, as in `rev3.2-A`, the
counter was reset on every drive-off phase — so firmware chopping
`MOTOR_ENABLE` for duty control would have prevented expiry entirely, and even
without PWM a single brief coast every few seconds postponed it forever.
Referenced to the armed state, the cutoff bounds **total armed time** and is
immune to both. The consequences for firmware are explicit:

- arm the latch per move, not once at boot;
- an idle armed latch self-disarms after the cutoff; treat "disarmed while
  idle" as a normal state and re-arm before the next move rather than as a
  fault;
- the cutoff must exceed the longest single move plus arm-to-move latency,
  which the 50 s floor guarantees against the 45 s firmware limit.

`Rt = 180k`, `Rs = 360k` (the datasheet's `Rs >= 2*Rt`) and `Ct = 22 nF C0G`
tapped at `Q14` (physical pin 3, first HIGH after 8192 oscillator periods) give
`T_osc = 2.2*Rt*Ct = 8.71 ms` and a **71.4 s** nominal — 81.1 s if the 2.5
formula factor some datasheet editions quote is the correct one, so the design
lands inside the required 50-90 s window either way and the formula ambiguity
stops being a risk.

The dielectric is not negotiable. A 10 µF class-2 part, as fitted in
`rev3.2-A`, stacks initial tolerance, X7R tempco, DC-bias derating and aging to
roughly ±40% on the capacitor alone — about ±56% with the device spread — which
gives a worst case near 43 s, under both the 45 s firmware limit and the 50 s
floor, and cannot be trimmed into the window at all. C0G stacks to ±21%
(max/min ratio 1.53 against the window's 1.80). Initial tolerance and the
formula factor are both trimmable with `Rt` after the first measurement;
temperature coefficient is not.

At timeout an already-used `2N7002` pulls `FAULT_N_RAW` low, the asynchronous
fault latch disables the decoder, and `LATCH_STATE` rising then resets the
counter — the latch stays faulted regardless. The exact RC/output selection is
not production-frozen: it must be measured at minimum/maximum supply and
temperature on every board. The hard timer is not endpoint detection; it bounds
harm if the ESP32, ADC or firmware fails.

## USB input

`TPS2553DBVR-1` is active-high enable with **latch-off** fault response, so
`EN` tied to `VBUS_RAW` is permanently enabled and `R5 = 23.7k` sets a
1.00-1.17 A limit. The consequence is worth designing around rather than
discovering: because the ESP32 sits downstream of the switch, an overcurrent or
reverse-voltage event removes power from the controller itself. There is no
status LED, no API and no local annunciation — recovery requires physically
re-plugging the USB cable, on a permanently installed manifold controller, with
the valves wherever they happened to be. The auto-retry variant, or a small
separate limiter keeping the logic rail alive so the fault can be reported, are
the two ways out; the choice is deferred to production with this note attached.

Total downstream capacitance is about 84 µF of ceramic (the 220 µF electrolytic
is gone), which the internal slew-rate control should charge well inside the
1 A limit — § 6 measures it.

## Display decision

The base product uses one status LED plus the local web UI. Four labelled,
unpopulated pads expose `GND`, `3V3_LOGIC`, `SCL` and `SDA` for an SSD1306-class
display daughterboard. They add no populated component and use the already
reserved I2C GPIOs. There are **no on-board bus pull-ups**: a display module
must bring its own, or two pull-up footprints must be added when the enclosure
is fixed.

A soldered display is not in the default BOM: common OLED modules vary in pin
order and mechanics, consume enclosure face area, introduce another supplier
item, and add no safety function.

## Two-layer layout targets

- Board `90 x 75 mm`, retaining the JLCPCB `100 x 100 mm` price class. Four
  3.2 mm NPTH M3 holes sit at `(4,4)`, `(86,4)`, `(4,71)` and `(86,71)`, giving
  a symmetric `82 x 67 mm` mounting rectangle.
- All six RJ9 body outlines are centered on the bottom edge at 12.25 mm pitch
  and project 1.0 mm. USB-C is rotated 90 degrees counter-clockwise and
  projects 1.0 mm through the left enclosure edge; the right-edge 1-wire
  terminal projects 1.75 mm. Connector projection is a checked 0-2 mm
  mechanical invariant.
- No electrolytic parts remain; the tallest passive is 1.45 mm, which relaxes
  the enclosure profile.
- Top should carry components and most routing. Both sides require GND pours;
  the necessary stitching-via count and B.Cu crossover budget are Rev3.2
  layout outputs, not inherited Rev3.1 facts.
- Do not route digital address, USB or buck switch nodes under the current
  amplifier, tacho chain, ADC traces or ESP32 antenna.
- Shunt-to-INA180 traces are a Kelvin pair with identical quiet routing.
- Place each driver, its VM capacitors, sense resistors and motor ESD between
  the motor rail spine and its two connectors.
- Place the analog chain adjacent to ESP32 ADC1 pins, with the tacho
  op-amp/comparator immediately beside the INA180. `TACHO_REF` and its 22 µF
  bypass belong in the same quiet island; the reference is now part of the gain
  network, so its ground return is a signal-integrity item, not a bypass
  detail. Separate the whole block from driver outputs by a quiet ground return.
- `ADC_CURRENT` and `ADC_TACHO` may run together toward the MCU; keep both away
  from `COMM_TACHO_N`, which is a fast digital edge.
- Preserve the ESP32 module antenna keepout on both copper layers and at the
  board edge.
- No fabrication release until bottom-plane continuity, return-current paths,
  thermal copper and every unrouted item have been reviewed manually.

## Simplifications considered and rejected

Recorded so they are not re-proposed without the counter-argument.

| Candidate | Saving | Why rejected |
|---|---|---|
| Drop `R10`-`R13` address/direction pull-downs | 4 placements | The 4514 has no input pulldowns and inhibit alone would leave four HC inputs floating during ESP32 reset. Requirement S-01 covers "all motor-drive inputs"; four resistors is not a reason to weaken it. |
| Drop the `SN74LVC1G00` NAND and inhibit straight from a pulled-up GPIO | 2 placements | `nSLEEP` would become the latch's only path to remove drive. Two independent paths is the point. |
| Delete the tacho chain and count ripple digitally from `ADC_CURRENT` | 14 placements | 7-30 mV of ripple against ESP32-S3 ADC noise is roughly unity SNR. `ADC_TACHO` gets the digital path its amplified signal for one resistor instead. |
| Delete the six DRV8833 DNP pads | 6 footprints | They cost no placements and keep a pin-compatible second source for a five-board prototype run during a shortage-prone period. |
| Delete `SW2`/`R9` (BOOT) | 2 placements | Removing recovery hardware from a bring-up board is false economy. |
