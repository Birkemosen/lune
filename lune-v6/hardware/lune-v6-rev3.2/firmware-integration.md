# Rev 3.2 firmware integration

The Rev 3.2 entrypoint is `lune-v6/configurations/lune-v6-rev32.yaml`.
It selects the `rev32_gpio` motor backend
(`components/lv6_valve_controller/rev32_motor_backend.{h,cpp}` over the pure
contract in `rev32_logic.h`) and the single-LED status package.

Build it from `lune-v6` with:

```sh
make config CONFIG=configurations/lune-v6-rev32.yaml BUILD_NAME=lune-v6-rev32
make build  CONFIG=configurations/lune-v6-rev32.yaml BUILD_NAME=lune-v6-rev32
```

`lune-v6-rev31.yaml` remains for Rev 3.1 Lean and `lune-ble.yaml` keeps the
`drv8215_i2c` backend. **Neither revision's firmware may be flashed on the
other's hardware.** Every one of these collides:

| | Rev 3.1 | Rev 3.2 |
|---|---:|---:|
| `ADC_CURRENT` | 4 | 2 |
| `ADC_BEMF` / `ADC_TACHO` | 5 | 1 |
| `MOTOR_ENABLE` | 13 | 18 |
| latch readback | `nFAULT` 17, active low | `LATCH_STATE` 16, active **high** |
| `LATCH_ARM` | 16, DC-coupled | 17, edge-coupled |
| address lines | 3 bits + a direction pin | 4 plain address bits |
| motion evidence | BEMF mux across a coast | `COMM_TACHO_N` on GPIO38 |

GPIO4 is `STATUS_LED_N` on Rev 3.2, so Rev 3.1's `ADC_CURRENT` would sit on the
status LED. The component enforces what it can: `rev32_gpio` rejects
`adc_bemf_pin`, `direction_pin` and `bemf_threshold_raw` outright, rejects any
duplicate or forbidden motor GPIO, and requires `ipropi_pin` and `adc_tacho_pin`
to be on ADC1. It cannot tell which board it is soldered to.

The N8R8 module is configured for 8 MB flash and Octal PSRAM. The generated
ESP-IDF sdkconfig must contain `CONFIG_ESPTOOLPY_FLASHSIZE_8MB=y` and
`CONFIG_SPIRAM_MODE_OCT=y`; a PlatformIO board-description line that says
"No PSRAM" is generic board metadata and is not the effective sdkconfig.

## GPIO contract

| Signal | GPIO | Safe state |
|---|---:|---|
| ADC_CURRENT | 2 | input (ADC1_CH1), 6 dB attenuation |
| ADC_TACHO | 1 | input (ADC1_CH0), amplified commutation ripple |
| COMM_TACHO_N | 38 | PCNT/RMT input |
| I2C SDA / SCL | 21 / 47 | 4k7 pull-ups fitted (`R37`/`R38`) |
| MOTOR_ADDR0 | 12 | only change while inhibited |
| MOTOR_ADDR1 | 11 | only change while inhibited |
| MOTOR_ADDR2 | 14 | only change while inhibited |
| MOTOR_ADDR3 | 13 | only change while inhibited |
| MOTOR_ENABLE | 18 | low |
| LATCH_ARM | 17 | low pulse source |
| LATCH_STATE | 16 | input, **high means faulted or not armed** |
| ONEWIRE_MCU | 8 | protected external bus (declared ADC1 exception) |
| UART_TX / UART_RX | 43 / 44 | ROM console; 1k series to `J9` |
| STATUS_LED_N | 4 | active low (declared ADC1 exception) |

All four address lines are plain address bits: **no bit encodes direction**. The
decoder's output assignment is a layout choice, so the channel/direction pair maps
to an address through the 12-entry `decoder.channel_address_map`:

| Channel | Forward | Reverse |
|---|---|---|
| 1 | 7 | 6 |
| 2 | 4 | 5 |
| 3 | 13 | 12 |
| 4 | 14 | 15 |
| 5 | 9 | 8 |
| 6 | 10 | 11 |

Addresses 0-3 are unreachable by design; `Q0`-`Q3` reach no bridge input.

Every number in these two tables is the `gpio` map in `design-contract.json`,
which `check_design.py` asserts against the schematic. If they disagree, the
contract is right and this file is stale.

The backend drives `MOTOR_ENABLE` low before configuring any selection pin.
Selection changes are accepted only in coast, followed by at least 1 ms before
enable. A hardware-latch assertion immediately inhibits the decoder and stops
the move. Re-arm is possible only in coast and is rejected while the raw fault
persists.

`FAULT_N_RAW` reaches only a test point, so firmware cannot read the raw fault
state or attribute a fault to a source. The only recovery mechanism is to
attempt an arm and re-read `LATCH_STATE`; a failed arm means the raw fault is
still asserted. Firmware can neither assert nor clear a hardware fault.

## Arm the latch per move

The fault latch powers up disarmed and, since ECO rev3.2-C deleted the 74HC4060,
nothing re-disarms it: once armed it stays armed until `FAULT_N_RAW`
asynchronously resets it. Arm before each move anyway, for two reasons that
survive the timer's removal:

1. The arm attempt is the only fault test firmware has. `FAULT_N_RAW` reaches
   no GPIO and, on the as-built board, no test pad either, so a *failed* arm is
   the sole evidence that a raw fault is asserted - `LATCH_STATE` alone cannot
   tell "never armed" from "faulted".
2. It keeps the armed window as short as the move, so a firmware crash between
   moves leaves the drive permit off rather than latched on.

Once armed, `LATCH_STATE` going high is **always a fault**: it means
`FAULT_N_RAW` fired. There is no benign self-disarm to filter out any more.

`LATCH_ARM` is edge-coupled - 10 kOhm in series with 10 nF into the flip-flop
clock, pulled down by 100 kOhm - and the clock is clamped while `MOTOR_ENABLE`
is high. Two consequences for firmware:

- the arm is a **rising edge issued from coast**; pulsing a live bridge silently
  does nothing, so the backend refuses it rather than reporting success;
- the coupling network decays with tau = 110 kOhm x 10 nF = 1.1 ms, so
  `LATCH_ARM` must rest low for about 5.5 ms on either side of the pulse before
  the next edge can be delivered.

There is **no hardware max-on-time**. The 40 s (HmIP VdMot) / 45 s (generic)
firmware runtime limit is the only bound on energized time. That is a deliberate
hazard-assessment result recorded as `actuator_overrun_hazard` in the contract,
not an omission - see *No hardware runtime cutoff* in `architecture.md`.

## No duty-cycle control

The 4514 feeds the driver inputs static logic. The only way firmware could
modulate motor voltage is to chop `MOTOR_ENABLE`, which the architecture no
longer intends - and which would be actively harmful here: the 40 ms chop period
sits *inside* the 25-50 ms commutation period the tacho counts, and every off-edge
is a fresh drive-start step into an AC-coupled front end with a 100 ms settling
time. `effective_hold_duty_()` returns 100% on Rev 3.2.

Two consequences. The actuator sees the rail continuously, so **every current
threshold, stroke time and commutation count inherited from the 100%-boost /
70%-hold DRV8215 profile is invalid until re-measured on Rev 3.2 hardware.** And
**soft-approach does not exist** - there is no duty to reduce near the stop, so
detection speed is the pop-off protection instead. That is the same conclusion
`architecture.md` reaches in *No hardware runtime cutoff*.

## Continuous tacho capture

`COMM_TACHO_N` is open-collector with a pull-up to `3V3_LOGIC`, so a commutation
event is a **falling** edge. The backend counts it with a PCNT unit
(`accum_count` on, high limit 10000) started once at setup and cleared before
each move, and drains that counter from the FSM tick. Nothing samples this net
from the controller task edge by edge.

**Blanking is mandatory and is implemented.** The tacho input is AC-coupled with
a 100 ms settling time, so the drive-start step saturates the output and emits
spurious edges for roughly that long. `Rev32TachoQualifier::BLANKING_MS` is 250,
counted from drive start, which sits inside the existing startup guard and at the
already-at-stop decision point. Deltas that arrive inside the window are counted
as *rejected*, never credited.

Edges that arrive while `MOTOR_ENABLE` is low are re-baselined rather than
rejected: they cannot be commutation of the selected motor, and folding them into
the rejection rate would corrupt the very number § 2 of the validation plan
measures.

### What is filtered, and what is not

The contract asks firmware to "reject pulses outside the board-characterized
minimum and maximum width/period". Only part of that is reachable on this path,
and the gap is deliberate rather than an oversight:

- **Period** is enforced. Each poll's count delta implies a cadence; a delta
  implying a period below `tacho_min_period_us` (default 8000 us, i.e. 125 Hz
  against a 20-40 Hz band) is a chopper burst or a missed poll and is rejected
  wholesale. Too-*slow* is not rejected, because a single edge after a long gap
  is exactly what leaving a plateau looks like.
- **Width** is enforced only to PCNT's hardware glitch filter, which counts APB
  cycles into a 10-bit field and therefore tops out near **12 us** - not the
  200 us the contract asks for. The 20 us artefacts the driver's current
  regulation can produce survive it. They are caught by the period check above
  and by the analog band-pass (-43 dB at the 50 kHz chop), not by width. The
  10 kHz `ADC_TACHO` stream gives 100 us resolution on the same waveform, which
  is enough to *measure* whether sub-200 us features are actually present - so
  the question is now answerable before anything is rebuilt around it.
- `tacho_min_pulse_us` is carried through to `Rev32TachoQualifier` and is
  exercised by `make test-rev32-logic`, but the PCNT path feeds
  `observe_count()`, which has no width to test. Reaching a true 200 us width
  filter means moving capture to RMT, which returns symbol durations; that is a
  bring-up decision to make **after** § 2 measures how often the current filter
  is actually wrong.

A continuous count has three roles: learned travel/position, observed rotation,
and a rotation-stall plateau. A missing counter signal while current is present
is a tacho sensor fault, not proof of an endpoint.

## ADC_TACHO cross-check

`GPIO1` (ADC1_CH0) carries `TACHO_AMP`, the same amplified ripple the comparator
digitises, through a 1 kΩ isolation resistor. This is the qualification
instrument: sampling it lets the device measure the hardware counter's
missed-edge and false-edge rate against a digital count of the same waveform,
which is what § 2 and § 3 of the validation plan require across every board,
actuator and temperature combination.

`ADC_TACHO` is sampled by DMA at 10 kHz, interleaved with `ADC_CURRENT` in one
ADC1 continuous pattern, and fed to a second `RippleCounter`
(`docs/esp32_ripple_spec_strict.md` - DC removal, high-pass, adaptive threshold,
Schmitt hysteresis, minimum-period rejection, already host-tested). Its count is
published as `tacho_adc_count` beside `tacho_hardware_count`, so the hardware
counter's missed- and false-edge rate is computable **on the device**.

The sample-rate-dependent constants are re-derived for 10 kHz and the 20-40 Hz
band. The amplitude terms - threshold and hysteresis - are **not**: the module was
tuned for the raw DRV8215 current, and this signal is amplified by ~85. Re-measure
them before the cross-check number means anything.

`COMM_TACHO_N` remains the authority for position. `ADC_TACHO` is evidence and
diagnosis, and must never be promoted to the endpoint decision path on its own.

## Current measurement

`ADC_CURRENT` (GPIO2, ADC1_CH1) sees 10 V/A. Use **6 dB attenuation** for
operation: full scale lands near 175 mA, covering the whole operating range and
the bridge-regulation window at about 1.8x the resolution of the 12 dB range.
The measured 14-19 mA running current is then 0.14-0.19 V and the 5 mA
pin-engagement step is 50 mV. Switch to 12 dB only for the high-current fixture
sweep, and record which range each calibration point used.

Calibrate offset with all drivers asleep and gain against a fixture load. There
is no clamp diode on this node, so a stuck-high reading is an amplifier or wiring
fault, not a clamp artefact.

`ADC_CURRENT` is sampled by DMA at 10 kHz, interleaved with `ADC_TACHO` in one
ADC1 continuous pattern. The oneshot and continuous drivers cannot share an ADC
unit, so `Rev32MotorBackend` does **not** read its own ADC - the ripple task tells
it the current. Each frame is a ~64-sample average window, so the absolute cap is
evaluated there on the frame peak and acted on by `motor_loop_()` at 1 ms rather
than at the 10 ms FSM tick with a 2-tick debounce. On the closing hard stop that
20 ms is stall torque into a rigid stop, and torque x duration is exactly the
damage mechanism `actuator_overrun_hazard` names.

## The four phases of a stroke

Closing presses the manifold pin down in four mechanically distinct phases, and
**phases 2 and 4 are near-identical in the current domain** - both are a rise
under load:

| Phase | Closing | Current | Rotation |
|---|---|---|---|
| 1 | Free travel - the plunger has not reached the pin | flat | steady |
| 2 | **Pin contact** - an initial resistance to overcome, after which it *falls again* | steps up, then partly back | slows, then **recovers** |
| 3 | Pressure - pressing the pin down | elevated, rising | stretching |
| 4 | **Hard stop** - the pin is fully down | sharp rise | stops, **no recovery** |

Opening mirrors it **without a pressure phase**: free travel back toward the
housing, then the motor's own gear train bottoming out. That stop is a materially
**smaller** resistance than the closing hard stop - which is why
`open_endstop_current_factor` (1.25x) is below `close_current_factor` (1.7x), and
why opening is the direction `actuator_overrun_hazard` names as damaging.

Missing phase 4 while closing is what pops the actuator head off. It is an abrupt,
high-current stop: easy to see, expensive to miss, and every millisecond of
latency past it is stall torque into a rigid stop.

**Cadence recovery is the discriminator.** At pin contact the rotor slows and
picks its speed back up; at either physical stop it slows and does not. That test
is magnitude-independent, so it works just as well on the gentle opening stop
where the current hardly moves - exactly where the current-domain tests are
weakest. `Rev32StrokeTracker` in `rev32_logic.h` implements it, and
`classify_rev32_endpoint()` refuses to accept an endpoint while the phase is
`CONTACT`, because at that instant the question is genuinely unanswered.

## Endpoint evidence

Rev3.2 omits the low-rate BEMF mux and its coast sampling. Firmware leaves the
motor drive continuous, measures current, and maintains the qualified
commutation count and cadence throughout the move.

**Dependency order.** The commutation count is an *enhancement*. The load-bearing
pair is the DC current step - 140-190 mV running against 230-500 mV stalled, a
50 LSB floor at 12 bit - and the runtime limit. Do not build anything that
assumes the tacho is reliable: it cannot distinguish rotation from brush chatter
against a hard stop, so a false-edge stall presents as a heavy move continuing.
If qualified commutation proves unreliable, degrade to stall-and-time on the
current step alone; that path needs no hardware change.

A normal endpoint requires:

1. the drive-start blanking window has elapsed;
2. connected-motor current;
3. qualified commutation edges observed earlier in the move;
4. a commutation plateau for the debounce interval;
5. current/load evidence;
6. a direction-specific learned-count endpoint window; and
7. a commanded endpoint context.

Stopped motion under load outside an endpoint command is a jam. The absolute
current cap without qualified stopped-motion evidence is an overcurrent fault.
A drive-to-endstop timeout can no longer update the stored position as though
an endpoint was reached.

That table is `classify_rev32_endpoint()` in `rev32_logic.h`, and it is the
Rev 3.2 decision - `detect_endstop_()` supplies the evidence and acts on the
verdict rather than carrying a second copy of the rules. Two gaps to know about:

- **Condition 6 is anchored on the stroke phase.** Closing measures from the pin
  contact the tracker observed, using the learned seating depth
  (`contact_to_stop_close_ripples`) - far more repeatable than the full stroke,
  which depends on where the move started. Opening has no contact phase, so it
  uses the travel estimated for the move. Uncalibrated, it is supplied as
  satisfied: it may never withhold an endpoint on absent data.
- **Condition 3's timing anchor is `already_at_stop`, not raw blanking.** A
  commutation count that is still zero 250 ms into a move is not yet evidence of
  anything: the counter needs one poll to baseline and the motor may still be
  breaking away. The FSM's existing boost + `ALREADY_AT_STOP_MS` window is the
  point at which "no commutation" becomes meaningful, so that is what feeds
  `commutation_observed`.

A motor that starts without any commutation while drawing current is inherently
ambiguous: a genuine already-at-stop condition and a pre-existing mechanical
obstruction are physically identical in the available two-wire signals. The
prototype stops early, reports blocked/unknown and does not record an endpoint.
Production qualification may add a controlled release-and-reapproach proof
sequence; it must not infer this case from a single actuator threshold.

Note that a plateau confirmed over several commutation periods (25-50 ms each,
stretching as the motor slows) approaches Rev 3.0 requirement E-08's 250 ms
detection bound. The shipping firmware already uses a 750 ms no-ripple-advance
timer. Measure the real latency and either meet E-08 or restate it with that
evidence; do not silently exceed it.

## Prototype defaults and release gate

Automatic startup calibration is disabled. The current calibration, tacho
band-pass, hysteresis and pulse-rejection limits are bring-up values derived
from measured actuator data, not production constants. Enable motion only
manually on an instrumented board, validate the current offset/gain first, then
characterize both directions across actuator, voltage and temperature.

The host-testable logic is in `rev32_logic.h` and runs through
`make test-rev32-logic`, which asserts the twelve-entry address map against the
contract, the arm/select/enable ordering and the endpoint classifier. A
successful compile proves integration and pin/config consistency; it does not
qualify endpoint thresholds, analog integrity or safe energized time.

During bench qualification, poll `GET /api/hv6/v1/diagnostics`. Its
`motor_safety` object reports `backend`, `motion_evidence_count` (the qualified
count), `tacho_period_us` (cadence), `tacho_rejected`, `tacho_hardware_count`
(the raw PCNT total, so the rejection rate can be computed), `tacho_amp_raw`,
`current_ma`, `motor_runtime_ms`, `armed`, `decoder_address` and
`latch_faulted`. Record `sample_sequence` to detect missed polls; the API data is
observation-only and cannot bypass the local safety classifier.

After a move has stopped, download
`GET /api/hv6/v1/motor-trace.csv` for the complete chronological capture. Its
columns are `t_ms, motion_count, current_ma, adc_current_raw, drive_on,
direction_open, armed, tacho_period_us, tacho_amp_raw` followed by the six Rev
3.1 `bemf_*` columns, which a Rev 3.2 trace leaves at their unused sentinels.
Export is rejected while a motor is active, preventing a wrapped buffer from
being mistaken for one coherent test run.
