# Rev 3.2 firmware integration

There is no Rev 3.2 firmware entrypoint yet. `configurations/lune-v6-rev31.yaml`
is the closest reference — it selects the `rev31_gpio` motor backend and shares
most of the pin map — but **it must not be flashed onto Rev 3.2 hardware**:

- it sets `pin_adc_bemf: "5"` and `bemf_threshold_raw: 40`, and
  `Rev31PinConfig` defaults `adc_bemf{GPIO_NUM_5}`. On Rev 3.2 `GPIO5` carries
  the amplified commutation ripple, so the BEMF motion evidence would be read
  from a signal it was never calibrated against;
- it names `GPIO17` as `pin_nfault`, implying active-low. The hardware drives it
  as the fault latch's `/Q`: **high means faulted or not armed**;
- nothing in it references `GPIO15`, `COMM_TACHO_N`, PCNT or RMT.

The legacy `lune-ble.yaml` entrypoint keeps the `drv8215_i2c` backend.

Build the reference configuration from `devices/lune-v6` with:

```sh
make config CONFIG=configurations/lune-v6-rev31.yaml BUILD_NAME=lune-v6-rev31
make build CONFIG=configurations/lune-v6-rev31.yaml BUILD_NAME=lune-v6-rev31
```

The N8R8 module is configured for 8 MB flash and Octal PSRAM. The generated
ESP-IDF sdkconfig must contain `CONFIG_ESPTOOLPY_FLASHSIZE_8MB=y` and
`CONFIG_SPIRAM_MODE_OCT=y`; a PlatformIO board-description line that says
"No PSRAM" is generic board metadata and is not the effective sdkconfig.

## GPIO contract

| Signal | GPIO | Safe state |
|---|---:|---|
| ADC_CURRENT | 4 | input, 6 dB attenuation |
| ADC_TACHO | 5 | input, amplified commutation ripple |
| COMM_TACHO_N | 15 | PCNT/RMT input |
| I2C SDA / SCL | 8 / 9 | no on-board pull-ups |
| MOTOR_ADDR0..2 | 10 / 11 / 12 | only change while inhibited |
| MOTOR_ENABLE | 13 | low |
| MOTOR_TERM_DIR | 14 | only change while inhibited |
| LATCH_ARM | 16 | low pulse source |
| LATCH_STATE | 17 | input, **high means faulted or not armed** |
| ONEWIRE_MCU | 42 | protected external bus |
| STATUS_LED_N | 48 | active low |

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

The independent runtime cutoff is reset by `LATCH_STATE`, not by decoder
inhibit, so it bounds **total armed time** (71.4 s nominal, qualified 50-90 s)
rather than a single uninterrupted drive interval. Two consequences:

1. Arm before each move, not once at boot. Six sequential valve moves in one
   armed window will trip the cutoff mid-sequence.
2. An idle armed latch self-disarms at the cutoff. `LATCH_STATE` going high
   while no move is in progress is a **normal** state: re-arm before the next
   move. It is only a fault if the re-arm itself fails.

This is a deliberate strengthening. Referenced to decoder inhibit, the counter
was reset by every drive-off phase, so any firmware that chopped `MOTOR_ENABLE`
or inserted a brief coast could postpone the hardware timeout indefinitely.

## No duty-cycle control

The 4514 feeds the driver inputs static logic. The only way firmware could
modulate motor voltage is to chop `MOTOR_ENABLE`, which the architecture no
longer intends. The actuator therefore sees the rail continuously, unlike the
100%-boost / 70%-hold profile the DRV8215 firmware applies. Every current
threshold, stroke time and commutation count inherited from that profile is
invalid until re-measured on Rev 3.2 hardware.

## Continuous tacho capture

`COMM_TACHO_N` is connected to GPIO15 and must be captured by ESP32 PCNT or RMT
while `MOTOR_ENABLE` is asserted. Count every qualified comparator transition;
do not sample this net from the normal controller task. Firmware must reject
pulses outside the board-characterized minimum and maximum width/period, reset
the count before each move, and retain separate OPEN/CLOSE learned counts.

The measured commutation rate on the qualified actuator is only 20-40 Hz
(659 close / 1048 open events per stroke), so the counter has 25-50 ms of period
in which to reject the 20 µs pulses that the driver's current-regulation chopper
can produce. Use that margin: a minimum-pulse-width filter is cheap insurance on
top of the analog band-pass.

**Blanking is mandatory.** The tacho input is AC-coupled with a 100 ms settling
time, so the drive-start step produces a saturated output and spurious edges for
roughly that long. Blank tacho edges for at least 250 ms after drive start,
which sits inside the existing startup guard and at the already-at-stop decision
point.

A continuous count has three roles: learned travel/position, observed rotation,
and a rotation-stall plateau. A missing counter signal while current is present
is a tacho sensor fault, not proof of an endpoint.

## ADC_TACHO cross-check

`GPIO5` (ADC1_CH4) carries `TACHO_AMP`, the same amplified ripple the comparator
digitises, through a 1 kΩ isolation resistor. This is the qualification
instrument: sampling it lets the device measure the hardware counter's
missed-edge and false-edge rate against a digital count of the same waveform,
which is what § 2 and § 3 of the validation plan require across every board,
actuator and temperature combination.

The existing `RippleCounter` module (`docs/esp32_ripple_spec_strict.md`) is the
natural consumer: DC removal, high-pass, adaptive threshold, Schmitt hysteresis
and minimum-period rejection, already host-tested. It now operates on a signal
amplified by ~85 rather than on the raw current, so its threshold and filter
constants must be re-derived.

`COMM_TACHO_N` remains the authority for position. `ADC_TACHO` is evidence and
diagnosis, and must never be promoted to the endpoint decision path on its own.

## Current measurement

`ADC_CURRENT` (GPIO4, ADC1_CH3) sees 10 V/A. Use **6 dB attenuation** for
operation: full scale lands near 175 mA, covering the whole operating range and
the bridge-regulation window at about 1.8x the resolution of the 12 dB range.
The measured 14-19 mA running current is then 0.14-0.19 V and the 5 mA
pin-engagement step is 50 mV. Switch to 12 dB only for the high-current fixture
sweep, and record which range each calibration point used.

Calibrate offset with all drivers asleep and gain against a fixture load. There
is no clamp diode on this node, so a stuck-high reading is an amplifier or wiring
fault, not a clamp artefact.

## Endpoint evidence

Rev3.2 omits the low-rate BEMF mux and its coast sampling. Firmware leaves the
motor drive continuous, measures current, and maintains the qualified
commutation count and cadence throughout the move.

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

The host-testable logic is in `rev31_logic.h` and runs through
`make test-rev31-logic`. A successful compile proves integration and pin/config
consistency; it does not qualify endpoint thresholds, analog integrity or safe
energized time.

During bench qualification, poll `GET /api/hv6/v1/diagnostics`. Its
`motor_safety` object must report qualified commutation count, cadence,
current, runtime, armed state and hardware-latch state. Record `sample_sequence`
to detect missed polls; the API data is observation-only and cannot bypass the
local safety classifier.

After a move has stopped, download
`GET /api/hv6/v1/motor-trace.csv` for the complete chronological capture.
Rev3.2 firmware must record current, tacho edge/count/cadence, the `ADC_TACHO`
sample, direction, commanded position, armed state and latch state. Export is
rejected while a motor is active, preventing a wrapped buffer from being
mistaken for one coherent test run.
