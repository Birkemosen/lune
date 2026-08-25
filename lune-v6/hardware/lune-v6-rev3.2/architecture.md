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

driver faults + rail overcurrent + TPS2553 fault -> async fault latch -> shutdown
LATCH_STATE (latch /Q) -> ESP32 pad 9, the only firmware view of the armed state
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
faults. Mechanical protection of the valve rests on the firmware runtime limit
and on the commutation tacho as rotation/stall evidence - see *No hardware
runtime cutoff* below for why no hardware timer backs them up.

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
from `COMM_TACHO_N` and, with `ADC_TACHO`, an amplified analog view of the same
ripple. The current path, tacho pulse qualification and hard shutdown paths are
retained. This trade does not transfer the overcurrent latch or the one-hot
inhibit into firmware.

**One correction to the original rationale.** It said the commutation ripple
gives the same evidence the BEMF channel gave, only less directly. That is right
about position and about stall-by-absence, but wrong about one thing: the ripple
cannot distinguish **rotation from brush chatter or rotor buzz against a hard
stop**. Both are in-band current ripple and are indistinguishable in the current
domain. Back-EMF measured during a coast interruption is the only measurement
that separates them - a turning rotor generates it, a stalled one does not - so
the removal did trade that discrimination away.

The trade still holds, for three reasons rather than the one originally given:

- A false-edge stall reads as *elevated current, still moving*, i.e. a heavy move
  continuing. It does not produce a false endpoint, because the classifier below
  requires motion to have **ceased**. It is caught by the firmware runtime limit.
- Every non-mechanical ripple source is excluded quantitatively: the current
  regulator engages only at 178-232 mA against a 23-50 mA measured stall, the
  buck sits at 1.5 MHz against a 339 Hz low-pass, and 100 Hz supply ripple
  arrives through the LDO's PSRR at roughly 0.03% of the commutation ripple.
- The tacho is not load bearing. See `commutation_tacho.degradation_path`: if
  qualified commutation proves unreliable, firmware falls back to stall-and-time
  using the DC current step, which needs no hardware change at all.

What the removal costs is therefore bounded and backstopped, and the open
qualification item `false_edge_immunity_...` is the measurement that closes it:
stall an actuator deliberately, capture `ADC_TACHO`, and see whether
`COMM_TACHO_N` keeps ticking.

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

## No hardware runtime cutoff

Firmware limits normal HmIP VdMot movement to 40 s and generic profiles to
45 s, and that limit is the bound. `Rev3.2-B` carried a `74HC4060D`
oscillator/counter as an independent hardware max-on-time, resetting on
`LATCH_STATE` and injecting a latched fault through a `2N7002` at ~71 s. It is
removed. The removal is a hazard-assessment result and is recorded as
`actuator_overrun_hazard` in the design contract, not as an omission.

### The hazard is bounded and is not electrical

An over-driven actuator strips its own gear train, **in the opening direction
only**. If the head parts from the manifold, the valve insert and its seal stay
behind — the head is a removable cap, and the hydraulic seal was never in it —
so the pin is released to full flow. The system is closed, nothing escapes, and
a stuck-open loop cannot exceed the mixing valve's supply temperature. Worst
case is one actuator, and the failure announces itself: the room overshoots and
that loop's return temperature stays high.

Note what does *not* help. The rail overcurrent comparator offers no protection
against this at all: stall current sits below its 280 mA trip, and the damage
mechanism is torque times duration, while the comparator bounds current — that
is, torque — and never duration.

### Why a fixed timer was the wrong instrument anyway

Gear damage accumulates in tens of seconds. Any cutoff long enough to clear a
legitimate stroke is therefore already long enough to strip the train, so a
max-on-time could only ever have bounded the *indefinite* case. Detecting the
end stop quickly is the only effective defence, which makes the tacho's
`missed_and_false_edge_rate` qualification the real release gate.

### And the part cost more than it saved

Two defects, both found only under review:

- Its oscillator network shipped **rotated one position around the timing
  star** — `Ct` on `RTC`, `Rt` on `RS`, `Rs` on `CTC`. Neither ERC nor
  `check_design.py` could see it, because the timeout was computed from
  contract values rather than from schematic topology. The 71.4 s figure was
  never what the board would have produced. `design-review.md` had already
  asked for the star topology to be confirmed against the datasheet; it never
  was.
- Bounding *total armed time* collided with learning mode, which must reach
  both end stops. 659 + 1048 commutation counts across a 20-40 Hz band is
  **43-85 s** against a cutoff whose ±21% stack spans **56-86 s** — so
  commissioning could latch a fault that firmware is, by design, unable to
  clear.

A protection device whose realistic failure mode is bricking the product during
commissioning, weighed against one gear train, does not earn its place.

### What is retained

The firmware runtime limit already in service, the commutation tacho as
rotation/stall evidence, the ESP32 task watchdog, and `R10`-`R15` to define a
safe state whenever the GPIOs go high-Z.

The fault latch **stays**, and not as a leftover: `U35` pin 6 is the *only*
consumer of `FAULT_N_RAW`, which five sources feed — the rail comparator, all
three `DRV8411` `nFAULT` outputs and the `TPS2553` fault pin. Deleting it would
strand the whole chain, so `check_design.py` now asserts that consumer and
those five contributors as an invariant.

One behavioural change: the latch **no longer self-disarms** when left idle,
because that property came from the counter. It is benign. `MOTOR_ENABLE`
falling to its 100 k pulldown drives `DECODER_INHIBIT` high, and the 4514's
inhibit turns every output off regardless of `DRIVE_PERMIT` — so an armed latch
left behind by a crashed firmware holds awake drivers with dead outputs.

Reassess if a supported actuator turns out to have its rigid internal stop on
the closing side, if a system omits supply-temperature limiting, or if a head
ever carries the hydraulic seal itself.

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

Rev3.2 places every connector on the **south edge**: the board outline dictates
the enclosure, and one cable-exit face is worth more than a few millimetres of
board. That single decision sets the width, and the width then sets everything
else.

### Outline: 100 x 70 mm

- **Width is set by the south edge, not by the circuit.** With 6.0 mm M3 pads
  in the south corners, measured from the actual footprints:

  | Item | Width |
  |---|---|
  | margin | 1.5 mm |
  | M3 corner pad | 6.0 mm |
  | gap | 1.0 mm |
  | 6 x RJ9 courtyard span @ 12.25 mm pitch | 73.35 mm |
  | gap | 1.0 mm |
  | 1-wire terminal, rotated for south wire entry | 8.0 mm |
  | gap | 1.0 mm |
  | M3 corner pad | 6.0 mm |
  | margin | 1.5 mm |
  | **total** | **99.35 mm** |

  100 mm is therefore the width, and it is also the last width inside the
  JLCPCB `100 x 100 mm` price class.

- **USB-C cannot also be on the south edge.** It is 10.64 mm wide against the
  1-wire terminal's 8.0 mm, which pushes the same budget to 101.99 mm. Corner
  M3 pads plus *all three* connector types on the south edge needs 110.99 mm.
  USB-C therefore sits on the **west** edge, as it did in Rev3.1. The 1-wire
  terminal keeps the south edge because it is field wiring and belongs with the
  motor cables; USB-C is power and service.

- **Height 70 mm.** The naive north-south sum is 75.5 mm (RJ9 19.0, TVS row
  3.0, driver band 14, mixed band 13, ESP32 column 26.5), but the bands are not
  exclusive: the ESP32 is only 18 mm of the 100 mm width, so the north band is
  shared with the decoder, USB-C and the analog island. Measured free area at
  70 mm is 2315 mm2 against the 877 mm2 the unplaced parts need - **38% fill**,
  comfortably inside the 45% that two-layer routing wants.
- 80 mm was the first working height and drops to 26% fill; 68 mm still passes
  DRC. 70 mm was chosen as the point where the enclosure gets smaller without
  spending the routing slack that the analog island needs.
- **Price is flat below 100 x 100 mm**, so 70 mm buys nothing in prototype
  quantities. At volume, where cost follows area, 100 x 70 is 12.5% less
  laminate than 100 x 80. The real gain is a smaller enclosure.

### Connector projection

The 0-2 mm projection invariant holds, but not at the same value on every part:

| Connector | Edge | Projection | Nearest copper |
|---|---|---|---|
| J11-J16 RJ9 | south | +1.03 mm | 5.78 mm inside |
| J20 1-wire | south | +1.03 mm | 0.40 mm inside |
| J1 USB-C | west | **0.00 mm (flush)** | 1.00 mm inside |

USB-C also had to move north to `y = 30` at this height: at 70 mm the TVS row
sits 12 mm further north than at 80 mm and collided with it on the west edge.

The `TYPE-C-31-M-12` footprint **cannot project 1 mm through a straight board
edge**: its pads sit too close to the shell front, and any projection drops
copper-to-edge below 0.25 mm. Either the enclosure gives the west wall a deeper
opening, or the outline gets a local notch at J1. This is an enclosure decision,
not a placement one.

### ESP32 antenna: a 21 x 7 mm cutout, not a 48 x 21 mm keepout

The stock KiCad footprint carries one keepout zone - `x -24..24`,
`y -27.75..-6.75` relative to the module origin, forbidding tracks, vias, pads,
copper pour **and footprints**. That is 48 x 21 mm, and it is misleading: the
arithmetic is `18 + 15 + 15` wide and `6 + 15` deep. It is Espressif's
**"at least 15 mm clearance in all directions"** recommendation baked into a
footprint zone - and that 15 mm is a clearance to metal in the **product
housing**, not a copper rule on the base board. Enforced as drawn it sterilises
a 48 mm band across the north edge, including for mounting holes, for a
constraint the board does not own.

What the board actually owes the antenna:

- Espressif's hardware design guidelines rank the options: antenna beyond the
  board edge, or antenna at the board edge, are both **strongly recommended**;
  a hollowed clearance area is the fallback if neither is possible.
- The datasheet land pattern marks an **Antenna Area** of about 18 x 6 mm, and
  measurement of the footprint confirms the module has **7.04 mm of pad-free
  length** at the antenna end - the northmost pad edge sits 5.71 mm from the
  origin against a body half-length of 12.75 mm.

Rev3.2 therefore cuts a **21 x 7 mm notch** in the north edge, centred on the
module: 7 mm is the pad-free length, 21 mm gives 1.5 mm either side of the
18 mm module. The module sits 0.5 mm inside the edge so the northmost pads keep
0.54 mm to the cut. The board loses 147 mm2 and the antenna gets air under it,
which is the recommended arrangement rather than a compromise.

The stock footprint keepout is **removed on the board instance** because it
encodes the housing rule. The 15 mm does still apply - as an **enclosure**
constraint:

> No metal within 15 mm of the antenna in any direction: no screws, no shield
> cans, no foil, no metallised plastic. This is an enclosure requirement and
> must be checked on the mechanical design, not on the PCB.

**Do not turn the 15 mm into a copper keepout beside the cutout.** That would
invert the guideline. Espressif's wording is the opposite: *"Please note that
sufficient ground copper and dense ground vias should be placed on the base
board near the antenna."* What harms the antenna is the **dielectric** under
it, which is why the instruction is to *"cut off the base board on both sides
of the antenna and below it"* - and that is what the 21 x 7 mm notch does, 1.5
mm past each module edge and the full pad-free depth.

So the rule beside the cutout is a positive one, not a prohibition:

- **Bring ground copper right up to the cutout edge on both layers, with dense
  stitching vias along it.** The pour is wanted there; it is the antenna's
  counterpoise.
- What to keep away is **magnetics and switching**, not copper: the
  `SWPA4018S` buck inductor, the buck switch node, and anything else with a
  ferrite or metal body belong at the far end of the board from the notch.
  This design helps itself here - no electrolytics remain and the tallest
  passive is 1.45 mm, so there is nothing else with a metal body to place.
- Components as such need no 15 mm exclusion on the board. The constraint that
  matters is the housing one above.

### Mounting holes: the inherited 82 x 67 rectangle does not survive

The Rev3.1 `(4,4) (86,4) (4,71) (86,71)` pattern was checked against this
outline and **fails at all four corners**: north-west collides with the ESP32
and its keepout, north-east with the USB-C receptacle, and both south corners
with the RJ9 row. Corner holes and edge connectors on the same face are
mutually exclusive here.

The resolution is to move the **ESP32 to the north centre**, which frees both
north corners, and to size the south edge so the corner pads fit beside the
connector row. Holes are `MountingHole_3.2mm_M3_ISO14580_Pad` - 3.2 mm drill,
5.5 mm pad, 6.0 mm courtyard - at `(4.5, 4.5)`, `(94.85, 4.5)`, `(4.5, 75.5)`
and `(94.85, 65.5)`, a `90.35 x 61 mm` rectangle. That is close to the full
board and carries connector insertion force properly.

### Module variant: N8R8 with PSRAM ECC

`ESP32-S3-WROOM-1-N8R8` (LCSC `C2913201`), chosen over `N8R2` on price:
$3.63 vs $3.83 at 100+, $3.41 vs $3.57 at 1300+. About $0.18 per board.

The 8 MB octal PSRAM is surplus - measured use on a running board is ~75 kB,
plus whatever the NimBLE host takes - and octal PSRAM costs two things:
`IO33..IO37` are consumed by the PSRAM interface, so module pads 28/29/30 are
unavailable, and the R8 variants are rated **-40 ~ 65 °C ambient** where the
quad-PSRAM variants get 85 °C. Neither cost decided against it: the pin budget
is not tight, and 2 MB was never the constraint.

The 65 °C is recovered by enabling ECC. The datasheet:

> R8 and R16V series modules operate at -40 ~ 65 °C ambient temperature ... if
> the PSRAM ECC function is enabled, the maximum ambient temperature can be
> improved to 85 °C, while the usable size of PSRAM will be reduced by 1/16.

**This makes a datasheet temperature rating depend on a build flag, and that is
the real cost of the choice.** Two config items must both be right:

```
CONFIG_SPIRAM_MODE_OCT=y      # octal hardware needs octal mode
CONFIG_SPIRAM_ECC_ENABLE=y    # depends on SPIRAM_MODE_OCT
```

Neither is set today. The current build has `CONFIG_SPIRAM_MODE_QUAD=y` on an
octal module together with `CONFIG_SPIRAM_IGNORE_NOTFOUND=y`, so the PSRAM is
silently absent and ECC is not even selectable. That is exactly the failure mode
this note exists to prevent, and it has already happened once.

There is a runtime assertion for it. ECC reserves 1/16 of the array, so the
firmware's own **Free PSRAM** sensor distinguishes the two states:

| Free PSRAM | ECC | Ambient rating |
|---|---|---|
| ~7680 kB | on | **85 °C** |
| ~8192 kB | off | 65 °C |

Read that sensor before shipping. Anything near 8192 kB means the board is out
of spec above 65 °C. Also drop `SPIRAM_IGNORE_NOTFOUND`: a missing PSRAM should
fail loudly, not on a warm day.

### The module's pinout decides the west/east split

Measured off the placed footprint, U1's nets group by side, and that - not
aesthetics - is what fixes where the blocks go:

| Module side | Nets |
|---|---|
| **West, north end** | `+3V3_LOGIC`, `STATUS_LED_N` (pad 4), `LATCH_STATE` (pad 9), `LATCH_ARM` (pad 10) |
| **West, south end** | `USB_DM`, `USB_DP`, `I2C_SDA` |
| **South row** | `MOTOR_ADDR0..3`, `MOTOR_ENABLE`, `I2C_SCL` |
| **East** | `ADC_CURRENT`, `ADC_TACHO`, `COMM_TACHO_N`, `ONEWIRE_MCU`, `UART_TX_DBG`, `UART_RX_DBG`, `BOOT_N` |

The analog signals were **moved** to the east side to get them off the west,
where the USB pair lives - see the reassignment table below.

Three consequences:

- **USB-C stays on the west edge.** `USB_DM`/`USB_DP` are pads 13 and 14, at
  the *south* end of the west side. J1 sits directly below them, so the
  differential pair is a short straight run. Moving USB-C east would drag that
  pair the full width of the board, across or under the analog island - which
  the routing rules already forbid.
- **The analog island moves to the east side.** `ADC_CURRENT` and `ADC_TACHO`
  are now on pads 38/39 (`GPIO2`/`GPIO1`), the only ADC-capable pins on that
  side: ADC1 is `GPIO1..GPIO10` and ADC2 is unusable while WiFi runs, so pads
  34/35 (`IO41`/`IO42`) were never an option - they have no ADC at all. This
  leaves the whole west side to USB and the logic supply, and puts the full
  board width between the buck and the tacho chain.
- **The whole safety-logic block stays west**, at pads 9/10. Counting nets
  suggested putting `U35` over the driver row - it has six driver connections -
  but that weighs the wrong thing: `DRIVE_PERMIT` is a static level with a 100 k
  pulldown and `FAULT_N_RAW` is an open-drain wired-OR filtered by 10 k/100 n
  (1 ms), so both are length-indifferent by design. The one sensitive node is
  **`ARM_CLK`**: edge-coupled through 10 nF onto a 100 k pulldown at the
  flip-flop clock. A spike there arms the drive, which is a safety-relevant
  false trigger, so `U35` + `Q1` + `R25` + `C23` must be one compact cluster
  next to `LATCH_ARM`.
- `LATCH_STATE` is on pad 9 and `LATCH_ARM` on pad 10 - **swapped** from Rev3.1.
  On the 74LVC1G74, CLK (pin 1) and /Q (pin 3) sit on the same side of the
  package, so this order lets the arm network and the readback route without
  crossing. Both are plain I/O on ADC2 channels that WiFi makes unusable, so the
  swap costs nothing.
- **The decoder goes into the driver row, not east.** An earlier revision put
  `U24` east of the module, reasoning that all seventeen of its nets are static
  logic - the address is latched while driving and the only firmware handle is
  `DECODER_INHIBIT` - so run length is electrically free. That is true and it
  was the wrong conclusion: it weighed only signal integrity. From the east side
  the twelve outputs are ~45 mm each, about **540 mm of trace** that on a
  two-layer board cuts the bottom pour into ribbons across the whole width,
  exactly where the motor return current flows, and threads past the analog
  island.

  `U24` now sits in the **16.9 mm gap between `U20`'s and `U21`'s VM-cap
  clusters** - widened from 9.9 mm by ECO rev3.2-E, which deleted the six DNP
  VINT/VCP pads that used to sit at `dx +/- 6.5`, at the driver row's own latitude and unrotated. In `TSSOP-24` the
  courtyard is 7.70 x 8.30 mm, so it fits with ~1 mm either side - the old
  `SOIC-24W` at 11.86 x 15.90 mm could not have. The pin rows then run
  north-south and each flank faces the drivers it serves:

  | Flank | Faces | Serves |
  |---|---|---|
  | Side A, pins 4-11 | west | `U20` (four used, four spare) |
  | Side B, pins 13-20 | east | `U21` northern four, `U22` southern four |

  **No output crosses the package**, and the output budget drops to ~120 mm
  confined to a band beside the drivers. The control cluster - pins 1,2,3 and
  21-24 - sits at the north end of both flanks, facing the module's address
  pads.

The one thing this does *not* solve is where the buck goes. `U3`, `L1` and the
`+3V3_LOGIC` bulk are the noisiest block on the board, and the analog island is
the most sensitive; they must not share the west side. Split the power chain by
what it is, not by which connector it belongs to:

- `J1` + `U2` (the USB-C receptacle and its current limiter) stay west at the
  connector, with the USB pair.
- `U3` + `L1` + `C5`/`C6` (the buck) go **east or south-east**. `VBUS_PROTECTED`
  feeding them is a DC rail and does not care about the distance.
- `U4` + `C7`-`C9` + `RSH1` + `INA180` stay **north-west** with the analog
  island. The shunt and the amplifier are a Kelvin pair and cannot be separated,
  and they must be near the ADC pads.

### Placement rules

- All six RJ9 body outlines on the south edge at 12.25 mm pitch, projecting
  1.0 mm, with the 1-wire terminal rotated for south wire entry beside them.
  USB-C is on the west edge. Connector projection remains a checked 0-2 mm
  mechanical invariant - see the table above for the achieved values.
- **Motor ESD: one GND-referenced TVS per wire, at its own connector pin.** The
  only trace that sets the clamp is `connector pin -> TVS -> GND via`; ST's own
  worked example shows 10 mm of track adding 144 V to the clamp voltage. Give
  each TVS its own ground via straight into the plane. Everything downstream of
  the clamp is layout-free, so the drivers may sit wherever suits the routing.
  This supersedes the Rev3.1 rule that placed motor ESD "between the motor rail
  spine and its two connectors" - that put the array inboard, behind the very
  track inductance that is the problem.
- Do not substitute a rail-clamp ESD array (USBLC6 class). Its VBUS pin steers
  positive strikes into `+3V3_MOTOR`, i.e. into DRV8411 `VM` and INA180 `IN-`.
- Place each driver with its VM capacitors and sense resistors above its two
  connectors. **Each xISEN resistor gets its own via to the plane, close to the
  driver and outside the ESD return path**: the pin tolerates only +/-0.6 V and
  trips at 200 mV, so ground bounce there is a false overcurrent and a latched
  shutdown.
- One unbroken ground plane. Do **not** split the ground to keep ESD out of the
  analog island - a split forces return current through a narrow bridge and
  makes it worse. Let the TVS ground vias spread the discharge into the plane
  immediately at the south edge, and place the analog island at the north so
  ESD return current never flows under it.
- Place the analog chain adjacent to the ESP32 ADC1 pins, with the tacho
  op-amp/comparator immediately beside the INA180. `TACHO_REF` and its 22 uF
  bypass belong in the same quiet island; the reference is part of the gain
  network, so its ground return is a signal-integrity item, not a bypass
  detail. Target region is east of the ESP32 and below the keepout band -
  about 260 mm2 against the roughly 130 mm2 the block needs.
- Shunt-to-INA180 traces are a Kelvin pair taken from the shunt's own pads, not
  from rail copper, routed as a tight differential pair with no ESD or motor
  return current sharing that copper.
- `ADC_CURRENT` and `ADC_TACHO` may run together toward the MCU; keep both away
  from `COMM_TACHO_N`, which is a fast digital edge.
- Do not route digital address, USB or buck switch nodes under the current
  amplifier, tacho chain, ADC traces or ESP32 antenna.
- Top carries components and most routing. Both sides require GND pours; the
  stitching-via count and B.Cu crossover budget are Rev3.2 layout outputs, not
  inherited Rev3.1 facts.
- No electrolytic parts remain; the tallest passive is 1.45 mm, which relaxes
  the enclosure profile.
- No fabrication release until bottom-plane continuity, return-current paths,
  thermal copper and every unrouted item have been reviewed manually.

## Simplifications considered and rejected

Recorded so they are not re-proposed without the counter-argument.

| Candidate | Saving | Why rejected |
|---|---|---|
| Drop `R10`-`R13` address/direction pull-downs | 4 placements | The 4514 has no input pulldowns and inhibit alone would leave four HC inputs floating during ESP32 reset. Requirement S-01 covers "all motor-drive inputs"; four resistors is not a reason to weaken it. |
| Drop the `SN74LVC1G00` NAND and inhibit straight from a pulled-up GPIO | 2 placements | `nSLEEP` would become the latch's only path to remove drive. Two independent paths is the point. |
| Delete the tacho chain and count ripple digitally from `ADC_CURRENT` | 14 placements | 7-30 mV of ripple against ESP32-S3 ADC noise is roughly unity SNR. `ADC_TACHO` gets the digital path its amplified signal for one resistor instead. |
| ~~Delete the six DRV8833 DNP pads~~ | **done, rev3.2-E** | The second source they preserved is the part TI has superseded, and it is unspecified for xISEN trip on this rail. Removing them widened the decoder gap from 9.9 to 16.9 mm and cleared the fan-out band. |
| Delete `SW2`/`R9` (BOOT) | 2 placements | Removing recovery hardware from a bring-up board is false economy. |
