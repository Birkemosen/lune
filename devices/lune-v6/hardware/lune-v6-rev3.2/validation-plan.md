# Rev 3.2 validation and release plan

The design target is low risk, not a claim that schematic analysis can make an
endpoint impossible to overrun. Fabrication release requires measured evidence.

Schematic ECO level `rev3.2-B`.

## 1. Electrical design gates

Available now, run on every change:

- `python3 check_design.py` passes. It re-derives the netlist from the
  generated sheets and asserts label integrity, the placement count against
  `design-contract.json`, native DNP/BOM attributes, LCSC coverage, the ESP32
  GPIO map read from the KiCad module symbol, the decoder `Q`-pin mapping, the
  safety-net topology invariants, and every derived analog and timing number.
- KiCad ERC: zero unexplained errors and warnings via
  `kicad-cli sch erc --severity-error --severity-warning --exit-code-violations`.
  Note that `kicad-cli` does **not** read the project's ERC severity overrides,
  so *Global label only appears once* stays in the ignored list; in a design
  where all connectivity is global labels that class is gated by
  `check_design.py` instead, not by the ERC report.
- `lune-v6-rev3.2.net` is regenerated whenever a sheet changes, otherwise
  `check_design.py` is auditing a stale netlist.
- Manual pin-by-pin audit against current manufacturer data sheets, recorded in
  a `pinout-audit.md` for this revision. The Rev 3.0 audit does not cover the
  Rev 3.2 analog chain, the `Q14` timer tap or the `+3V3_EXT` branch.
- Source `C25` (22 nF ±5% 50 V C0G/NP0 1206) and record its LCSC part number.
  `check_design.py` lists it as the single open sourcing item and fails if the
  declaration goes stale.

Required once the PCB exists. These scripts are retained in
`../lune-v6-rev3.1-lean/`, which holds nothing else. Each is hard-wired to Rev 3.1
filenames, Rev 3.1 limits and a routed PCB that no longer exists, so every one
must be ported rather than copied:

- `audit_placement.py` proves the 90 x 75 mm outline, symmetric 82 x 67 mm
  M3 pattern, centered RJ9 body row and 0-2 mm connector-face projection.
- `audit_pcb.py` passes the physical driver-sense, shunt/INA180, hardware
  safety-net and external 1-wire invariants.
- `audit_layout_integrity.py` bounds path resistance, USB mismatch and analog
  trace length; extend its ADC-length limits to cover `ADC_TACHO`.
- PCB DRC: zero errors, zero unrouted nets.
- Connectivity audit proves decoder `Q0..Q5/Q8..Q13` reach exactly one bridge
  input and unused outputs reach none.
- Bottom-layer ground continuity and every high-current return path are reviewed
  from Gerber, not only the KiCad view.
- ESP32 antenna keepout is copper-free on both layers.

## 2. Analog fixture characterization

For each of five boards:

- Measure ADC current offset with drivers asleep and at 10, 20, 30, 50, 100,
  150 and 200 mA fixture loads. Record which ADC attenuation each sweep used:
  operation is specified at 6 dB (full scale near 175 mA), so the 150 and
  200 mA points require the 12 dB range.
- Record gain, offset, noise, settling and comparator trip at 4.75/5.0/5.25 V
  USB input and cold/ambient/hot board conditions.
- Confirm that removing the ADC clamp did not introduce an over-range event at
  any operating or fault condition, and that the remaining offset drift over
  temperature is inside the calibration budget.
- Verify worst measured rail trip remains above the highest measured bridge
  chop by at least 10%, and below the destructive-current contract ceiling.
  The comparator now senses `CURRENT_RAW`, so measure its trip response time
  and confirm no nuisance trip while a bridge is chopping into a stall.
- Inject representative ripple waveforms at `CURRENT_RAW` and verify the tacho
  band-pass across the supply range. Confirm the measured corners against the
  design intent: 1.6 Hz high-pass, ~84-90 in-band gain over 20-40 Hz, 339 Hz
  low-pass, 148 mV comparator hysteresis.
- Measure the attenuation of the current-regulation chop at `TACHO_AMP` while a
  bridge is regulating into a hard stop. The design predicts -43 dB; a
  measured figure materially worse than that invalidates the plateau evidence
  precisely when it matters most.
- Measure the AC-coupling settling time after drive start. The design predicts
  100 ms; the firmware blanking window must exceed the measured value with
  margin and must not exceed the 250 ms already-at-stop decision point.
- Verify active-drive and cable transients cannot force the INA180, tacho
  op-amp, comparator or ESP32 input beyond qualified limits.
- Record `CURRENT_RAW` (`TP7`), `TACHO_AMP` (`TP6`) and `COMM_TACHO_N` (`TP5`)
  with a logic analyser and oscilloscope during free-run, valve engagement and
  both mechanical stops. Confirm the band-pass, hysteresis and PCNT/RMT
  pulse-width rejection against measured commutation spectra; do not release
  against nominal values alone.
- Cross-check `ADC_TACHO` against `COMM_TACHO_N` on the same moves. Agreement
  between the hardware counter and a digital count taken from the amplified
  analog signal is the missed-edge/false-edge measurement, and once it is
  established on the bench it can be logged by the device on every later run.
- Repeat full-stroke learning at least 20 times per actuator and direction.
  The qualified count distribution must establish a direction-specific endpoint
  window with margin for supply, cable and temperature variation.

## 2a. Firmware integration gates

- `make test-rev31-logic` and the complete Lune V6 host test suite pass.
- A Rev 3.2 configuration validates and compiles; the legacy `drv8215_i2c`
  configuration also compiles. **The Rev 3.1 entrypoint must not be flashed on
  Rev 3.2 hardware**: it samples `GPIO5` as BEMF, which is now the amplified
  tacho input, and it names `GPIO17` as an active-low `nFAULT` when the hardware
  drives it as an active-high latched fault.
- Generated sdkconfig proves 8 MB flash, Octal PSRAM and Quad PSRAM disabled.
- Boot with motor power present and absent. `MOTOR_ENABLE` remains low until an
  explicit arm and command; automatic startup calibration remains disabled.
- Confirm firmware arms the fault latch **per move**. Verify that an idle armed
  latch self-disarming at the hardware cutoff is handled as a normal state and
  re-armed, not reported as a fault, and that a genuine persistent fault is
  still distinguished by a failed re-arm.
- Inject missing, implausibly fast and implausibly slow tacho pulses while
  current is present. Firmware must inhibit drive and report a tacho sensor
  fault; no endpoint position may be recorded.
- Expire a drive-to-endstop command without an endpoint classification. The
  stored position must remain unconfirmed and a safety fault must be reported.
- Exercise PCNT/RMT count wraparound and scheduling jitter around the
  stopped-motion debounce interval before release.
- Confirm no tacho edge is accepted inside the drive-start blanking window.

## 3. Actuator endpoint matrix

Test at least three actuators per supported model, including a high-hours unit.
Run at minimum/nominal/maximum valid supply and cold/ambient/hot conditions.
Note that Rev 3.2 cannot PWM the bridge, so the actuator now sees the rail
continuously rather than the 70% hold the previous hardware applied: every
current level, stroke time and commutation count must be measured afresh and
none of the existing thresholds may be carried over unmeasured.

For both OPEN and CLOSE directions record:

- inrush, free-run, engagement, loaded travel, soft approach and hard-stop
  current distributions;
- commutation count, cadence, pulse-width distribution, missed-edge rate and
  false-edge rate for the hardware `COMM_TACHO_N` output;
- commutation cadence and stopped-motion latency;
- elapsed full stroke, backlash and repeatability;
- detected endpoint latency and additional energized time after physical stop.

Required cases:

- full travel in both directions;
- already at requested endpoint;
- start at 10%, 50% and 90% positions;
- mechanical obstruction early/mid/late stroke;
- open circuit, intermittent connector and shorted cable. Scope `V(xISEN)`
  during the shorted-cable case: the DRV8833 abs-max is -0.3 to 0.5 V and the
  DRV8411 ±0.6 V, and current during the 1.8 µs blanking plus 1 µs deglitch is
  limited only by 2 x RDS(on) + 1 Ω, so confirm the rail collapses before the
  pin rating does rather than assuming it;
- missing/noisy tacho with valid current;
- biased/stuck current ADC with valid tacho;
- reset, brownout and watchdog during motion;
- 1000 open/close endurance cycles on at least one channel per board.

Release criteria:

- zero endpoint false negatives in the qualified matrix;
- no false commutation edges while the selected motor is stationary, and no
  missed edge rate that makes the learned endpoint window overlap a jam window;
- zero jam/disconnect cases reported as a normal endpoint;
- normal endpoint stop latency is bounded by the measured safe energized time,
  and the measured latency is reconciled against Rev 3.0 requirement E-08's
  250 ms bound — either the bound is met or it is restated with this evidence;
- no profile uses a threshold derived from a single actuator;
- OPEN and CLOSE parameters remain separate;
- already-at-stop and pre-existing jam are not conflated: the prototype uses a
  conservative blocked/unknown result; qualify any later controlled
  release-and-reapproach proof before enabling it;
- the measured current distributions are used to decide the production xISEN
  value. `1 ohm` is the prototype value and is a board-protection backstop
  only; `1.5 ohm` (118.8-154.9 mA) is the documented retune option.

## 4. Independent timeout and fault latch

- Measure hardware timeout on every board across supply and temperature, and
  trim `Rt` from the first measurement. Qualified interval must remain 50-90 s:
  above the 45 s firmware limit plus arm-to-move latency, but short enough to
  bound a frozen-controller stall.
- Confirm the cutoff is referenced to armed time, not drive time: hold the
  latch armed and chop `MOTOR_ENABLE` continuously, and separately insert brief
  coasts every few seconds. The timeout must still expire in both cases. This
  is the specific failure the `rev3.2-A` wiring allowed.
- Verify `Ct` is the specified C0G/NP0 part on every assembled board; a class-2
  substitution cannot hold the window and is not visually distinguishable.
- Hold the ESP32 drive output active and stop all firmware servicing. Hardware
  must pull raw fault low, latch shutdown, and require an explicit re-arm.
- Assert driver fault and rail comparator fault separately. A stuck ESP output
  must not defeat either shutdown.
- Attempt re-arm while raw fault is held and while drive is enabled; both fail.
- Ramp logic power at the slowest and fastest qualified rates; the Schmitt-input
  latch must always reach the disarmed state before any drive permit is possible.
- Power-cycle into every legal/illegal GPIO strap combination; no motor pulse is
  permitted.

## 5. External 1-wire temperature probes

- Populate representative waterproof DS18B20-class probes on the supply and
  return pipes, including the intended maximum total cable length and branch
  topology.
- Verify discovery, unique address binding, resolution, conversion time and
  update cadence with one and two probes attached.
- Measure the `+3V3_EXT` drop across `R52` at the maximum probe count and
  conversion duty. The design budget is 100 mV at 3 mA against a DS18B20
  minimum of 3.0 V; if the installed probe count or cable pushes it further,
  lower `R52` or move to a resettable PTC.
- Measure supply/return agreement in an isothermal fixture and characterize
  installed pipe-to-sensor lag and offset over the qualified temperature range.
- Test open data wire, short to GND, short to 3.3 V, missing pull-up, swapped
  probes, duplicate/replacement addresses, CRC errors and a sensor frozen at a
  plausible value. Short the `+3V3_EXT` conductor to GND and confirm the ESP32
  does not reset; note that `R52` is a one-shot fusible link at that current, so
  record whether a PTC is required for production serviceability.
- Enforce a bounded freshness timeout. Stale, missing or implausible
  temperatures must be reported explicitly and must not defeat local motor
  timeout, endstop or minimum-flow safety.
- Apply cable ESD/EFT with the 33 ohm series resistors, 4.7k pull-up and both
  `D5` and `D7` fitted. Confirm that the ESP32 pin and the logic rail remain
  qualified and that faults on the external cable cannot energize a motor.
- Verify operation at minimum/maximum 3.3 V and with the cable capacitance of
  the supported installation; lower the bus rate or cable limit if rise time
  margin is inadequate.

## 6. EMC, thermal and production

- Contact/air ESD and EFT injection with representative actuator cables.
- Observe motor rail, logic rail, current ADC, tacho comparator output and latch during tests.
- Confirm USB enumeration and sustained throughput with the series resistors
  removed, across 1 m, 3 m and poor-quality cables.
- Worst-case continuous regulated stall until hardware timeout, repeated on all
  six channels; driver, LDO, shunt and connector temperatures remain qualified.
- USB inrush and brownout tests with 1 m, 3 m and poor-quality cables. Total
  downstream capacitance is about 84 µF of ceramic; confirm the TPS2553-1 does
  not latch off on inrush, and record the recovery procedure, because a latch-off
  removes power from the ESP32 and is therefore silent and unrecoverable without
  a physical re-plug. Decide before production whether to move to the
  auto-retry variant or keep the logic rail alive upstream.
- JLCPCB Gerber/BOM/CPL upload resolves every populated designator and rotation.
  Confirm the six DNP second-source capacitors and the fourteen copper-only pads
  are excluded, which the native attributes now encode and `check_design.py`
  asserts.
- Live stock covers at least 25 boards or alternates are validated.
- Five-board landed checkout price, including freight and expected EU VAT/fees,
  is at or below 1500 DKK before order approval.
