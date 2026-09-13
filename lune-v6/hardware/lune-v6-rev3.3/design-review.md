# Rev 3.2 design review

> **Historical record.** This review was performed against the KiCad schematic,
> which was the source of truth through ECO rev3.2-B. **Every designator below is
> a KiCad-era reference and has been renumbered on the board** - `U20`/`U21`/`U22`
> were the drivers and are now ESD diodes, `U24` was the decoder and is now the USB
> current limiter, and `R27`/`R28`/`C25` name the deleted timer block here but live
> parts on the board. Read it with `design-contract.json` ->
> `designator_history` open. The findings and their dispositions stand; only the
> names moved.

Reviewed: the five generated schematic sheets, `generate_kicad.py`, `design-contract.json`,
`README.md`, `architecture.md`, `validation-plan.md`, `firmware-integration.md`,
`layout-audit.md`, `rev2-review-addendum.md`, `erc.rpt` and the project file — against
`lune-v6-rev3.0/requirements.md`, `lune-v6-rev3.0/pinout-audit.md`, the Rev 3.1 Lean
folder, and the device docs (`ARCHITECTURE.md`, `endstop_detection.md`,
`hardware_rev2.md`, `esp32_ripple_spec_strict.md`, `hv6_api_v1.md`).

Datasheet cross-checks were done against TI SLVSGI0C (DRV8411), SLVSAR1E (DRV8833) and
the installed KiCad 10 symbol libraries. Placement counts and net connectivity were
computed from the generated `.kicad_sch` files.

> **Superseded, 2026-08: findings B3 and B4 no longer apply.** The whole
> `74HC4060` runtime-cutoff block (`U36`, `R27`, `R28`, `C25`, `Q2`, `C24`) was
> removed by hazard assessment — see `actuator_overrun_hazard` in
> `design-contract.json` and *No hardware runtime cutoff* in `architecture.md`.
> The open question below about the `Rt`/`Rs`/`Ct` star topology was answered,
> and the answer was bad: the network was wired **rotated one position** around
> the star (`Ct` on `RTC`, `Rt` on `RS`, `Rs` on `CTC`), so the 71.4 s that B4
> was gated on was never what the board would have produced. That, plus a
> collision with learning mode — 43–85 s to reach both end stops against a
> 56–86 s cutoff, latching a fault firmware cannot clear — is why the subsystem
> went rather than got fixed.

Overall: the safety architecture is sound and a clear improvement over Rev 3.1 — hardware
one-hot selection with a latched address, nested protection layers, and correct failsafe
defaults. The pin-level work is accurate; I found no pinout errors. The problems are
concentrated in the one block that is new in this ECO — the commutation tacho — plus a
set of documentation/contract inconsistencies that the loss of the Rev 3.1 audit scripts
allowed to drift.

---

## 0. Resolution status — ECO `rev3.2-B`

Everything below was reviewed against schematic level `rev3.2-A`. ECO `rev3.2-B`
addresses it as follows. The "gated by" column names the check that now fails if the
finding is reintroduced; all of them are in `check_design.py`, which is verified against
re-injected copies of each defect.

| # | Finding | Disposition | Gated by |
|---|---|---|---|
| B1 | Tacho hysteresis on the wrong comparator input | **Fixed** — `R50` bridges the output to pin 5 (non-inverting); pin 6 is the fixed reference | tacho hysteresis / threshold-feedback checks |
| B2 | Tacho gain and passband mismatched to the actuator | **Fixed** — 1.6 Hz / gain ~85 / 339 Hz band-pass, stiff 1k/1k reference | corner, gain, hysteresis, chop-rejection and band checks |
| B3 | Runtime cutoff reset by the duty-control signal | **Moot** — the entire cutoff block is removed (hazard assessment) | removed-part / removed-net invariants |
| B4 | Class-2 timing capacitor cannot hold 50–90 s | **Moot** — `C25` removed with the block; the C0G fix was correct but the oscillator was miswired anyway | removed-part / removed-net invariants |
| B5 | DNP intent absent from native attributes | **Fixed** — generator emits `(dnp yes)` / `(in_bom no)` | fabrication-attribute checks |
| D1 | Placement counts wrong in README/architecture | **Fixed** — 111 / 117, recounted from the sheets and asserted | placement-count checks |
| D2 | `removed_gpio: 5` overstated | **Fixed** — now 1 (`ADC_BEMF`) | — |
| D3 | Rev 3.1 entrypoint wrong for Rev 3.2 hardware | **Fixed in documentation** — contract no longer names it as the Rev 3.2 entrypoint and records the GPIO5/GPIO17 hazards; the firmware backend itself is still to be written | — |
| D4 | Missing verification artifacts | **Partly fixed** — `check_design.py` and the exported netlist added; `audit_placement.py` / `audit_pcb.py` / `audit_layout_integrity.py` are listed as required-at-layout, since they need a PCB that does not exist yet | — |
| D5 | Requirements traceability (F-03/F-04, E-08, E-09) | **Documented, not resolved** — E-08's 250 ms bound is flagged in architecture, firmware and § 3 with the measurement that decides it; a Rev 3.2 requirements document is still owed | — |
| D6 | `docs/ARCHITECTURE.md` still describes DRV8215 | **Open** — device-level doc, outside this folder | — |
| D7 | Contract nits, stale project file | **Fixed** — 232.3 mA, driver population settled, project sheet list populated, ERC-severity caveat documented | — |
| O1 | Current thresholds 4–6× above the actuator | **Documented, deliberately not retuned** — reclassified as board-protection backstops; `1.5 Ω` recorded as the retune option with its window. Narrowing it on the prototype would clip the § 3 distributions the prototype exists to measure | trip-margin check |
| O2 | Current channel uses 4–16 % of ADC span | **Fixed the free half** — 6 dB attenuation specified (~1.8× resolution). INA180A2 rejected: at 25 V/A full scale is 130 mA, below the bridge ceiling and the fixture sweep |  — |
| O3 | Overcurrent comparator on the filtered node | **Fixed** — senses `CURRENT_RAW`; nuisance margin re-derived | comparator sense-node check |
| O4 | BAT54S ADC clamp | **Fixed** — removed | — |
| O5 | Unprotected 3V3 pin on `J20` | **Fixed** — `R52` 33 Ω + `D7` TVS as `+3V3_EXT`; PTC flagged for production | 1-wire supply-branch checks |
| O6 | TPS2553-1 latch-off is a silent board death | **Fixed** — ECO `rev3.3-M` moved `U24` to `TPS2553DBVR` (C55266), the constant-current auto-retry variant. A trip now self-clears and, via `FAULT_USB_RAW` on GPIO15, is visible to firmware. Note the library device brought a different SOT-23-6 land with it; see `usb_input.fault_response_eco.footprint_warning` | — |
| O7 | DRV8833 is the weaker choice at this rail | **Fixed** — DRV8411 is the population; DRV8833 demoted to shortage substitute with the reasoning recorded | — |
| O8 | xISEN abs-max on a shorted cable | **Documented** — § 3 now scopes `V(xISEN)` explicitly | — |
| O9 | No I2C pull-ups on the display pads | **Documented** — stated in README, architecture and the contract | — |
| O10 | 22 Ω USB series resistors | **Fixed** — removed | — |
| O11 | Unsourced 47 k / 2.2 M feeders; U34 unit BOM | **Fixed** — tacho rebuilt from stocked values only; MPN/LCSC on all three `LMV393` units | LCSC coverage + multi-unit consistency checks |
| O12 | `LATCH_STATE` cannot distinguish disarmed from faulted | **Documented** — architecture and firmware doc describe the arm-and-re-read recovery; a spare GPIO on `FAULT_N_RAW` remains the cheap fix | — |
| **B6** | **U37 drawn with the wrong TLV9001 pinout variant** (found later, while re-authoring the sheets) | **Fixed** — see below | amplifier-pinout checks |

### B6. U37 was drawn with the wrong TLV9001 pinout variant

TLV9001 ships two different pinouts (datasheet SBOS833R Table 6-1):

| Name | DBV SOT-23 / T-DCK | DCK SC70 / DRL / U-DBV |
|---|---|---|
| OUT | **1** | 4 |
| IN+ | **3** | 1 |
| IN− | **4** | 3 |

The ordered part is `TLV9001IDBVR` in SOT-23-5, so OUT is pin 1 — and the generator's net
assignment matches that, so **the board was always correct**. But KiCad only ships a
`TLV9001IDCK` symbol, which is the *other* variant, and that is what Rev 3.2-A drew. The
schematic therefore displayed the amplifier with its input and output swapped, and ERC's
electrical-type checks for U37 were validating the wrong pins entirely.

This is a reviewability defect rather than a board defect, but it is the same class of trap
as B1: it makes a wrong drawing look right. It also becomes a real board defect the moment
anyone swaps the MPN to a DCK, DRL or U-DBV variant to chase stock or price, since the pin
numbers would silently invert.

Fixed by drawing U37 with `Amplifier_Operational:OPA310xDBV` purely as a correctly numbered
DBV carrier symbol — geometrically identical to the INA180 beside it — with the substitution
recorded in a `Symbol_Carrier` property. `check_design.py` now resolves both amplifier
symbols against the KiCad library and asserts the output is on pin 1 and the inputs on pins
3/4, so the mismatch cannot return. My earlier review verified the board-level pin
assignment and flagged the footprint-filter mismatch, but did not catch that the symbol was
a different pinout variant.

Net effect: 111 populated placements (was 110), two fewer BOM lines, no electrolytic, no
7.7 mm part, no unsourced values, and a self-verifying folder. The count did not fall —
the fixes for real defects cost slightly more than the removals bought.

### Drawing style: the reason B1 and B6 were invisible

Both B1 (hysteresis on the wrong comparator input) and B6 (wrong amplifier pinout variant)
are errors that a drawn schematic shows at a glance and a label-only schematic hides
completely. Rev 3.2-A had **zero wires, zero junctions and zero hierarchical sheet pins**
across all six files — every one of its 406 connections was a global label stuck on a pin,
and the root sheet was a table of contents rather than a block diagram.

All five sheets are now drawn hybrid: local topology wired with orthogonal segments and
junctions, rails and cross-sheet fan-out named. 98 wires and 43 junctions replace 65 of the
labels, and the golden netlist confirms all 400 connections are unchanged. See
`README.md` § *Drawing convention* for the split and for the three KiCad/API behaviours the
generator has to work around — one of which (a three-point wire silently voiding a whole
sheet's connectivity while ERC stays clean) is worth knowing about independently.

---

## 1. Blocking — fix before starting layout

### B1. Tacho comparator hysteresis is wired to the wrong input

`generate_kicad.py:611-627`. U34B has the signal `TACHO_AMP` on pin 5 (IN B+) and the
threshold `TACHO_THRESH` on pin 6 (IN B−). R50 (2.2 M) feeds the output `COMM_TACHO_N`
back to **pin 6** — the inverting input. Output-to-inverting-input is negative feedback,
not hysteresis.

The result is a ~144 mV dead band in which the comparator oscillates rather than latching:

| Output state | `TACHO_THRESH` |
|---|---|
| low (0 V) | 1.65 × 2.2M/2.3M = **1.578 V** |
| high (3.3 V) | (1.65×2.2 + 3.3×0.1)/2.3 = **1.722 V** |

An input anywhere inside 1.578–1.722 V drives continuous chatter: crossing 1.578 V raises
the threshold above the input, which drops the output, which lowers the threshold again.
This is a relaxation oscillator.

`COMM_TACHO_N` feeds PCNT/RMT, and everything in the Rev 3.2 endpoint story — learned
position, learned travel, the rotation-stall plateau — is derived from that count. This
directly threatens requirement **E-09** ("no accepted position counts while the rotor is
physically stalled").

**Fix:** move the 2.2 M feedback to pin 5 (non-inverting), with the AC-coupled signal
arriving through a series resistor, and drive pin 6 from the reference. R45 (100 k, the
bias resistor from `TACHO_AC` to `TACHO_REF`) then becomes part of the hysteresis divider,
so re-derive the ratio. The intent described in `architecture.md` and
`design-contract.json` ("about 140 mV total hysteresis around the 1.65 V mid-rail") is
correct and the 143 mV figure matches — this reads as a wiring slip, not a concept error.

### B2. Tacho gain and passband do not match the measured actuator

Grounding numbers from `docs/endstop_detection.md` (HmIP VdMot + Danfoss RA-N, the
qualified actuator): steady-state **14–19 mA**, endstop peak 23–50 mA, and **659 (close) /
1048 (open) commutation events per stroke**. Over a 25–35 s stroke that is a commutation
fundamental of roughly **20–40 Hz**, falling toward zero as the motor slows into the stop.

Three problems follow:

1. **Gain is roughly an order of magnitude too low.** INA180A1 gives 10 V/A, so a 10 %
   ripple on 14 mA is 1.4 mA = 14 mV at `CURRENT_RAW`. Gain 11 (R46 100k / R47 10k) yields
   ~154 mV at `TACHO_AMP` — about the same size as the intended 143 mV hysteresis band.
   There is no headroom at all.

2. **The high-pass corner sits inside the signal band.** R45·C44 = 100 kΩ × 100 nF =
   **15.9 Hz**, against a 20–40 Hz fundamental that drops *below* the corner exactly when
   the motor slows near the stop — i.e. the signal is attenuated at the moment the plateau
   logic needs it. The gain also rolls off at low frequency because R47 returns to
   `TACHO_REF`, whose 47k‖47k = 23.5 kΩ source impedance is bypassed only by C43 (1 µF,
   corner 6.8 Hz): at 20 Hz the effective gain is ≈6.6, not 11.

3. **There is no upper band limit.** TLV9001 GBW 1 MHz / gain 11 → ~91 kHz closed-loop.
   The DRV8411 current-regulation off-time is 20 µs (SLVSGI0C) and the DRV8833's internal
   current-control PWM is 50 kHz (SLVSAR1E) — both pass at nearly full gain. Chopping only
   begins when the current limit is reached, i.e. during stall, which is precisely when the
   plateau is being evaluated.

**Fix:** raise the gain into the 100–500 range (see also O2), drop the high-pass corner to
~2–5 Hz, and add one capacitor across R46 to set an upper corner at ~200–500 Hz — that
single part buys roughly 40 dB of chop rejection. Buffer `TACHO_REF`, or use a much larger
C43, so it is not simultaneously the bias node, the gain-network return and the comparator
threshold source (comparator transitions currently inject back into it through R49).

Note also that 20–40 Hz means PCNT/RMT is not needed for *rate*, only for noise immunity.
Firmware min-pulse-width rejection has 25–50 ms of period available to reject 20 µs chop
pulses — a useful second line of defence, but not a substitute for band-limiting the
analog stage, because a chattering comparator can emit edges far faster than the counter
can be filtered.

### B3. The independent runtime cutoff is reset by the only signal firmware can use for duty control

74HC4060 MR (pin 12) = `DECODER_INHIBIT` = NOT(`MOTOR_ENABLE` AND `DRIVE_PERMIT`). The
4514 supplies static logic to the DRV inputs, so the **only** handle firmware has for
modulating motor voltage is chopping `MOTOR_ENABLE` — which drives `DECODER_INHIBIT` high
on every off phase and resets the timer to zero.

The shipping firmware does exactly this: boost 100 % → hold **70 % duty at a 40 ms PWM
period** (`docs/endstop_detection.md`, Timing Sequence). At 25 Hz the 4060 can never reach
16 oscillator periods of 4.5 s each, so the last-resort hardware timeout would never fire.

Two consequences need an explicit decision, written down:

- **If Rev 3.2 forbids PWM**, the actuator now sees the full rail continuously instead of
  the validated 70 % hold. Every measured current level, stroke time and ripple count
  changes. The validation plan requires re-characterization, but nowhere states that PWM
  capability was removed by this architecture — that should be recorded as a deliberate
  behavioural change.
- **If PWM is retained**, the 4060 needs a reset source immune to short inhibit pulses —
  e.g. reset from an RC-stretched/retriggerable one-shot, or from a "move active" latch
  rather than instantaneous inhibit.

### B4. The timing capacitor cannot hold the required 50–90 s window

C25 is a 10 µF 25 V **X7R** 1206 (Yageo CC1206KKX7R8BB106, ±10 %). Stacking initial
tolerance (−10 %), X7R temperature coefficient (±15 % over −55…125 °C), DC-bias derating
(typically −10…−20 % for a 10 µF/25 V 1206 at a few volts) and aging (−2.5 %/decade-hour)
gives a plausible worst case near −40 % → a cutoff around **43 s**. That is *below* the
45 s firmware limit and below the contract's `required_characterized_minimum_s: 50`, which
turns a normal long move into a latched hardware fault requiring an explicit re-arm. The
capacitance also varies within each oscillator cycle, because the bias swings across the
rail, skewing the waveform.

**Fix:** use a C0G/NP0 (or film) timing capacitor and move the tap to a higher divider.
Q14 (pin 3, first HIGH at 8192 cycles) with Ct = 10 nF C0G and Rt ≈ 350 k gives the same
72 s nominal from a ±30 ppm/°C part.

Two related items:

- `architecture.md` and `design-contract.json` use fosc = 1/(2.5·Rt·Ct). Nexperia and TI
  publish 1/(2.2·Rt·Ct) for the 4060 family, which makes the nominal 63 s rather than 72 s.
  Cite the exact figure and datasheet edition being used.
- ~~Confirm the Rt/Rs/Ct star topology (all three meeting at `TIMING_COMMON`) against the
  datasheet oscillator figure.~~ **Answered: it was rotated one position.** This bullet
  was the one that mattered and it stayed open until the block was deleted. ERC cannot detect a wrong-but-connected oscillator, and an
  oscillator that does not start silently removes the last safety layer. The validation
  plan does require measuring the timeout on every board, which bounds the risk — but the
  topology should be confirmed on paper first.

### B5. DNP intent is not expressed in a form any fabrication export honours

Every symbol in all five sheets carries the native `(dnp no)` attribute plus `(in_bom yes)`
and `(on_board yes)`. The DNP intent for C46 and the six DRV8833 capacitors
(C110–C112, C114–C116) exists only as a custom `"DNP" "yes"` text property and inside the
Value string; the 12 test pads rely on a custom `Assembly = COPPER_ONLY` property.

A BOM/CPL generated from this schematic therefore lists **110 + 7 capacitors and 12 test
pads as populated**. The validation-plan gate "JLCPCB Gerber/BOM/CPL upload resolves every
populated designator and rotation" would pass while ordering and placing parts that must
not be fitted.

**Fix:** have the generator set the native DNP attribute, and `exclude_from_bom` on the
copper-only pads and mounting holes.

### B7. R4 slews the arm clock ~10× past the flip-flop's input transition limit

Found on the bench during Rev 3.2-D bring-up, on two assembled boards. The fault latch
cannot be armed, so `DRIVER_N_SLEEP` never asserts and **no motor can be driven at all**.

`LATCH_ARM` (GPIO17) reaches `U2` pin 1 through R4 (10 kΩ) in series with C4 (10 nF), with
R5 (100 kΩ) to ground. The DC design is sound — the step peak is
`3.3 × 100/110 = 3.0 V`, comfortably above the 2.0 V `V_IH` in 74LVC1G74 data sheet rev 18
table 8 — and that is why every static measurement looks correct.

The edge rate does not survive. The clock node does not rise with the driver; it rises as
R4 charges the pin's own capacitance (`C_I` = 4.0 pF per table 8, plus Q1 and trace, ~15 pF
total). Crossing the 0.8–2.0 V band then takes

```
tau = 10 kOhm x 15 pF = 150 ns
t(0.8 V) = tau x ln(3.0/2.2) =  47 ns
t(2.0 V) = tau x ln(3.0/1.0) = 165 ns
  ->  118 ns / 1.2 V = 99 ns/V
```

against the **10 ns/V maximum** in table 7 (`Δt/ΔV`, V_CC = 2.7–5.5 V). Schmitt-trigger
inputs make the part tolerant of slow edges, so this is a violated recommended operating
condition rather than a proven mechanism — but it is the only specification the circuit
breaks, and the observed behaviour matches a marginal input rather than a dead one.

**Measured**, board 2, firmware v1.0.0-79, `POST /api/v1/motors/arm-clock-probe`:

| Stimulus | Edges | Armed |
|---|---|---|
| 100 Hz square wave, 3 runs | 3500 | never |
| 250 Hz, 2 runs | 5000 | never |
| 500 Hz, 5 runs | 32500 | twice, at random cycles (one at 4850 of 7500) |

Roughly two successes in 30000 edges, never deterministic, identical on both boards. DMM
readings that bracket it: `ARM_EDGE_IN` 1.67 V AC (a 0–3.3 V square wave is 1.65 V RMS, so
the meter reads true), U2 pin 1 0.571 V AC, `FAULT_N_RAW` 3.3 V DC and 0.01 V AC (reset
genuinely released), `FLIM_REF` 2.82 V. R4 10.0 kΩ, R5 100 kΩ, C4 10.26 nF, U2 marking
`V74` (= 74LVC1G74DP, table 2), continuity confirmed on every node including pin 4.

**Fix:** R4 → **1 kΩ**, Yageo RC0603FR-071KL, LCSC **C22548**. Already on this BOM as R1,
R8, R11–R13, R23, R39 and R40, so no new feeder. That gives 8.3 ns/V (inside the limit),
raises the peak to 3.27 V, and leaves tau at 1.01 ms so the firmware's 6 ms settle either
side of the edge still holds. The negative excursion then clamps through 1 kΩ at ~2.6 mA,
far below the 50 mA `I_IK` of table 6, and table 6 note [1] explicitly permits exceeding
the input voltage rating while the current rating is observed.

1 kΩ is the largest standard value that passes; 2.2 kΩ still gives 19 ns/V.

Do **not** fix this by deleting C4 and DC-coupling the arm. The edge coupling is what makes
arming edge-only, so firmware cannot hold the drive permit asserted — a safety property the
contract records as `arm_clock_edge_coupled`.

`check_design.py` now asserts this limit from `fault_latch.arm_max_slew_ns_per_v` and fails
until `arm_series_ohm` becomes 1000. The same commit adds the pin-1/2/7 net checks: CP, D
and /SD were previously unverified, and swapping CP and D — or floating /SD — would pass
every other check in the file while bricking every board.

### B8. The continuous ADC delivers nothing, so there is no current measurement at all

Found on the bench during Rev 3.2-D bring-up, board 2, firmware v1.0.0-83, with the fault
latch armed by hand so the drive permit was asserted. A timed move on zone 3 ran the bridge
for ~0.5 s and reported:

```
          before move   during move   after
current_ma       0.0           0.0      0.0
tacho_amp_raw  65535         65535    65535     (0xFFFF = the never-written sentinel)
tacho_adc_count    0             0        0
```

An actuator under load draws hundreds of mA, so `current_ma = 0.0` through an energised
move is not a rest artifact. `tacho_adc_raw_` is stored unconditionally on every TACHO
frame (`lv6_valve_controller.cpp:2551`), so the sentinel surviving a real move proves no
frame on that channel has ever been processed either.

Both ADC1 channels are therefore dead, which removes:

- every current-based protection and the current-based endstop detection, since
  `ADC_CURRENT` is the primary input for both, and
- the analog cross-check on the commutation count, which is what § 2 of the validation
  plan measures `tacho_hardware_count` against.

What survives is the digital commutation count alone — and see O13 for how much of that is
being discarded.

The pin map is not the problem: pad 38 = GPIO2 (`ADC_CURRENT`), pad 39 = GPIO1
(`ADC_TACHO`), pad 31 = GPIO38 (`COMM_TACHO_N`), all matching the contract, and
`check_design.py` passes the GPIO checks. No `ADC continuous init failed` warning appears
in the device's smart-log FIFO, which admits every WARN, so initialisation appears to
succeed.

**Root cause, confirmed.** Instrumentation exposed in `/api/v1/diagnostics` narrowed it to
"the stream was never initialised" (`adc_stream_ready` false, `adc_start_err` −1), and a
serial capture across a reset produced the line the device's own smart-log ring can never
hold:

```
[W][hv6_valve_ctrl:1865]: ADC continuous init failed (err=258), ripple counting disabled
```

258 is `ESP_ERR_INVALID_ARG`, from `adc_continuous.c:507-515` in ESP-IDF 5.5.5:

```c
if (pat->unit == ADC_UNIT_1) {
    if (handle->adc1_atten == atten_uninitialized) {
        handle->adc1_atten = pat->atten;
    } else if (handle->adc1_atten != pat->atten) {
        return ESP_ERR_INVALID_ARG;
    }
}
```

**Every channel on one ADC unit must share one attenuation.** The config asked for
`ADC_CURRENT` at 6 dB (resolution) and `ADC_TACHO` at 12 dB (an ~85x amplified ripple on
the mid-rail reference), both on ADC1. Every other check passed — `conv_frame_size` 512 is
a multiple of 4, `pattern_num` 2 ≤ 24, 20 kHz is inside 611–83333 Hz, 12-bit is supported.

**Fixed** by dropping `ADC_TACHO` from the stream: `ADC_CURRENT` is the safety input and
wins, and the analog tacho was only ever a cross-check on the hardware commutation count,
so this costs a validation instrument rather than a protection. `tacho_adc_count` now
stays 0 by design and the boot log says so. Restoring it needs both channels on one
attenuation, a second ADC unit, or a separate mechanism — a design decision for Rev 3.3,
not something to paper over in firmware. Sample rate dropped from `REV32_ADC_SAMPLE_RATE_HZ
* 2` to `REV32_ADC_SAMPLE_RATE_HZ` with the round-robin gone.

Two further defects found in the same path and fixed alongside:

- `adc_continuous_start()` is called per move at `lv6_valve_controller.cpp:1339` and its
  return was **discarded**. Any failure was indistinguishable from working hardware
  reporting zero current. Now checked and logged.
- the ripple task read `RIPPLE_DMA_FRAME_BYTES` (1024, the Rev 3.1 constant) from a stream
  configured with `REV32_DMA_FRAME_BYTES` (512). Now follows the backend.

**Verified fixed**, firmware v1.0.0-89, zone 3, 10 s timed move:

```
adc_stream_ready  true     adc_start_err     0
adc_notifies       788     adc_frames   100864     adc_read_errors 0
adc_channel_mask     2  -> channel 1 only = ADC1_CH1 = GPIO2, exactly as intended
current_ma        23.6     motor_runtime_ms 10000
```

The move ran its full timer instead of aborting at ~0.5 s, which confirms the spurious
"commutation ceased while current vanished" stalls were caused by the missing current
signal rather than by the tacho. Current calibration still has to be characterised against
a known load before the endstop thresholds mean anything.

**Diagnosability gap worth fixing separately:** none of this was visible in
`/api/v1/logs/download`. The smart-log ring is fed from the logger callback registered by
`lv6_dashboard`, which sets up at priority 249, while `lv6_valve_controller` sets up at
799. Every log line from the initialisation of every safety-critical component is emitted
before the ring starts listening, so only `dump_config()` output survives. The ring needs
its own early registration.

---

## 2. Documentation and contract defects

### D1. Placement counts in README.md and architecture.md are wrong

Counted from the generated sheets: **110 populated placements** for the DRV8411 population,
**116** with the six DRV8833 capacitors. (117 symbols classify as populated, minus the 7
carrying the DNP field; 12 test pads and 4 mounting holes excluded.)

`design-contract.json` is correct (110 / 116). `README.md` ("120 mounted placements" /
"126") and `architecture.md` ("DRV8411 gives the 120-placement option … 126-placement
cost-down option") are wrong by exactly the removed BEMF parts: Rev 3.1 was 108/114, and
108 + 12 (tacho) = 120 is the arithmetic that was performed. 108 − 10 (BEMF) + 12 = **110**
is correct. The "12 mounted parts" tacho figure in README.md is right (U37, R43–R50,
C43–C45).

### D2. `removed_gpio: 5` overstates the GPIO saving

The Rev 3.1 mux select lines were shared with `MOTOR_ADDR0..2` / `MOTOR_TERM_DIR`, which
are still in use. Only `ADC_BEMF` is freed. `architecture.md` correctly says "an ADC GPIO";
the contract should say 1.

### D3. The declared prototype firmware entrypoint is actively wrong for Rev 3.2 hardware

`design-contract.json` names `configurations/lune-v6-rev31.yaml` with
`build_verified: true`. That config sets `pin_adc_bemf: "5"` and `bemf_threshold_raw: 40`,
and `Rev31PinConfig` (`rev31_motor_backend.h:15`) defaults `adc_bemf{GPIO_NUM_5}`. Module
pin 5 (GPIO5) is a **no-connect** in the Rev 3.2 schematic, so motion evidence would be
sampled from a floating pin. Nothing in the firmware references GPIO15, `COMM_TACHO_N`,
PCNT or RMT.

The contract does flag `required_rev3.2_change` and
`commutation_counter_firmware_complete: false`, but `build_verified: true` beside a named
entrypoint invites someone to flash it onto Rev 3.2 hardware. Either gate Rev 3.2 behind a
new configuration, or make the backend fail `setup()` when the tacho pin is unconfigured,
so a floating-pin BEMF read cannot happen on Rev 3.2 silicon.

Also: `pin_nfault: "17"` names GPIO17 as an active-low fault, while Rev 3.2 drives it as
/Q — **active high** means faulted/disarmed (`logic.fault_latch_faulted_level: 1`). Confirm
the sense in `rev31_motor_backend.cpp` before bring-up.

### D4. Missing verification artifacts

`validation-plan.md` §1 requires `check_design.py`, `audit_placement.py` and
`audit_pcb.py`; `layout-audit.md` cites `audit_layout_integrity.py`. **None exist in this
folder** — only `generate_kicad.py`. Also absent versus Rev 3.1: `bom.csv`, `pinmap.md`,
`pinout-audit.md`, `prototype-cost-model.csv`, `generate_pcb.py`, and any PCB.

This is the direct cause of D1 and D2: the contract's numbers are no longer cross-checked
against the schematic (`generate_kicad.py` reads only `CONTRACT["module"]`). Port the
Rev 3.1 audit scripts and add a placement-count assertion as a gate before layout begins.

### D5. Requirements traceability

The normative document is still `lune-v6-rev3.0/requirements.md`, which mandates eight
motor connectors (**F-03**) and eight-channel-capable routing (**F-04**), and specifies
differential BEMF as the motion evidence (**E-03**). Rev 3.2 deliberately violates F-03/F-04
and replaces the E-03 mechanism, but the only record is prose in `rev2-review-addendum.md`.
Rev 3.2 has no requirements document of its own.

Two numeric conflicts worth resolving at the same time:

- **E-08** requires endpoint detection within 250 ms of qualified motion cessation. At
  20–40 Hz commutation (25–50 ms period, stretching as the motor slows) a robust plateau
  needs several periods, and the shipping firmware already uses a **750 ms** no-ripple-
  advance timer. Either relax E-08 with measured justification or state the plateau budget
  explicitly — Rev 3.2's validation plan replaces the number with the unquantified
  "bounded by the measured safe energized time".
- **E-09** ("no accepted position counts while the rotor is physically stalled") is exactly
  what B1 and B2 put at risk.

### D6. `docs/ARCHITECTURE.md` has not been reconciled with Rev 3.x

It still documents the DRV8215 I2C hardware layer (6 × DRV8215, wire-ORed IPROPI on GPIO7)
and digital ripple counting per `esp32_ripple_spec_strict.md`, which opens with "No analog
comparator is available; all processing must be digital". Rev 3.2 introduces exactly such a
comparator and a different driver topology.

### D7. Minor contract nits

- `current_limit_max_ma: 232.4` vs `architecture.md`'s 232.3 (230/0.99 = 232.32).
- `architecture.md` calls DRV8833 "the default economic choice" while
  `driver.primary_part` is `DRV8411PWPR` and the schematic populates DRV8411 with the
  DRV8833 capacitors DNP. Pick one (see O7 — the electrical answer is DRV8411).
- `lune-v6-rev3.2.kicad_pro` is older than the sheets (07:32 vs 07:48) and records
  `sheets: []`, so it does not describe the hierarchy.
- The ERC run ignored "Global label only appears once in the schematic". In a design where
  100 % of connectivity is global labels and there are no wires except 10 explicit local
  pairs, that is *the* check that would catch a typo'd net. I verified manually that there
  are no singletons (below), but it should be enabled and asserted by a script.

---

## 3. Design observations worth acting on

### O1. All hardware current thresholds sit 4–6× above anything this actuator produces

xISEN 1 Ω → 178–232 mA regulation; rail comparator → 267–293 mA. Measured actuator:
14–19 mA running, 23–50 mA at the hard stop, 30–40 mA opening inrush.

The per-bridge regulation will therefore **never engage** in normal operation or at a hard
mechanical stop — only on a wiring fault. Describing it as "an immutable torque/current
ceiling" (`architecture.md`, contract) is not supportable at ~4× the actuator's stall
torque. The 178–232 mA figure looks inherited from `hardware_rev2.md`'s "120 mA actuator
rating" rather than from the measured population.

If a genuine ceiling is wanted, ~2.2 Ω xISEN gives 82–105 mA — just above the firmware's
100 mA hard cap and clear of the 50 mA endstop peak and 40 mA inrush — at the cost of
110 mV drop at 50 mA. Otherwise drop the torque-ceiling claim and state plainly that
mechanical protection is firmware plus the 4060 timeout, which makes B3 and B4 more
important, not less. (Related: at 3.3 V and 50 mA the AP2112 dissipates ~85 mW, so the
motor-rail LDO thermals are a non-issue as long as the current ceiling stays unreachable.
A 200 mA-class actuator would put ~0.4 W in a SOT-23-5 and change that conclusion.)

### O2. The current channel uses only 4–16 % of the ADC span

10 V/A puts the 14 mA operating point at 140 mV and the 5 mA pin-engagement step at 50 mV,
against ~3.1 V full scale. **INA180A2** (×50 → 25 V/A) would put 14 mA at 350 mV and
130 mA at full scale: ~2.5× better resolution across the entire useful range, 2.5× more
tacho signal, and it moves the rail comparator to ≈112 mA where it can actually protect the
actuator rather than only the board. Trade-off: the ADC clips above ~130 mA, so the
validation plan's 150/200 mA fixture points need rethinking, and a genuine short saturates
the amplifier (still tripping the comparator).

At minimum, **specify the ADC attenuation setting** — neither the contract nor
`firmware-integration.md` does, and it determines whether the 5 mA engagement step is
62 LSB or 180 LSB.

### O3. The hard overcurrent comparator is fed from the filtered ADC node

U34A compares `ADC_CURRENT` — after R20/C18 = 1 kΩ/100 nF, τ = 100 µs — against
`FLIM_REF`. Note that an output-to-GND short bypasses the xISEN resistor entirely
(VM → high-side FET → short → GND), and the DRV8411's own OCP is 4 A, so this comparator is
the *only* fast protection for that fault — and it is deliberately slowed by 100 µs.

Give the comparator its own fast tap (e.g. 1 kΩ/1 nF from `CURRENT_RAW`) so nuisance
immunity and trip speed can be set independently, and add hysteresis so it cannot chatter
on the shared open-collector `FAULT_N_RAW` net.

### O4. D1 (BAT54S ADC clamp) may not earn its place

The INA180 is powered from `+3V3_ANALOG` and cannot drive `ADC_CURRENT` outside 0…3.3 V, so
the clamp protects against nothing in normal operation. It does add a temperature-dependent
error: reverse leakage from `+3V3_ANALOG` through the upper diode flows through R20 (1 kΩ),
so a few µA at elevated temperature becomes several mV — 0.3–0.5 mA equivalent at a 14 mA
operating point, and **not** removed by a room-temperature offset calibration. Either move
the clamp to the amplifier side of R20, delete it (saving a placement), or add a
leakage-versus-temperature line to §2 of the validation plan.

### O5. The 3.3 V pin of J20 is unprotected

The 1-wire *data* line has R40 (33 Ω), R41 (4.7 k) and D5. The 3V3 pin on the same external
connector is a direct tap on `+3V3_LOGIC` — the ESP32's own rail — with no series element,
no current limit and no TVS. A short or ESD strike on that conductor brownouts the
controller, which conflicts with **S-06** ("no ESP32 resets during connector hot-plug") and
with the §5 "short to 3.3 V" test.

Add a series resistor or resettable fuse plus a TVS, and feed it from a filtered branch
rather than the MCU rail. README.md's claim of "a protected three-pin 3V3/1-WIRE/GND
service connector" currently holds for one of the three pins.

### O6. A TPS2553-1 trip is a silent, unrecoverable, whole-board failure

The `-1` suffix is latch-off (confirmed: TPS2553-1 is active-high enable, latch-off,
reverse-blocking — so tying EN to `VBUS_RAW` is correct, and R5 = 23.7 k giving ~1.0–1.17 A
matches `lune-v6-rev3.0/pinout-audit.md`).

Because the ESP32 sits downstream of the switch, an overcurrent or reverse-voltage event
kills the controller with no status LED, no API and no recovery except physically
re-plugging the USB cable — on a permanently installed manifold controller, mid-season,
with the valves wherever they happened to be. Worth a deliberate decision: the auto-retry
variant, or keep the logic rail alive upstream behind its own smaller limiter so the fault
can be annunciated.

Also note total downstream capacitance is ~280 µF (C2 + C4 + C7 + C9's 220 µF + C10 +
3 × 10 µF driver caps, plus 44 µF behind the buck). §6's inrush test should confirm the
internal slew-rate control keeps charging current under the ~1.0 A limit.

### O7. The DRV8833 cost-down option is the electrically weaker choice at this rail

DRV8833 is specified for VM 2.7–10.8 V and its datasheet states that "RDS(ON) increases and
maximum output current is reduced at VM supply voltages below 5 V" — at VM = 2.7 V, 85 °C
the on-resistance is 350 mΩ (HS) + 300 mΩ (LS) = **650 mΩ**. DRV8411 is characterized from
1.65 V at 200 mΩ + 200 mΩ. On a 3.3 V rail already losing 0.5 Ω (shunt) + 1 Ω (xISEN),
that difference is real motor voltage.

More importantly: the DRV8411 datasheet **specifies** xISEN V_TRIP as 180/200/230 mV
min/typ/max, whereas the DRV8833 electrical-characteristics table has **no xISEN trip
specification at all**. The contract's `trip_voltage_min_mv`/`max_mv` are DRV8411 limits
being applied to the DRV8833 population, so on the "default economic choice" the current
ceiling is a typical value, not a guaranteed one.

Six 0603 capacitors is a cheap price for a specified ceiling plus better motor voltage.
Recommend DRV8411 as the population unless the quote gap is large.

### O8. xISEN absolute-maximum exposure on a shorted actuator cable

DRV8833's xISEN abs max is −0.3…0.5 V (DRV8411 ±0.6 V). With a terminal-to-terminal short,
current during the 1.8 µs blanking + 1 µs deglitch is limited only by 2 × RDS(on) + 1 Ω,
i.e. ~2.4 A from 3.3 V, putting ~2.4 V momentarily on xISEN. In practice the local 10 µF
and the AP2112 current limit collapse the rail first, but §3's "shorted cable" case should
scope V(xISEN) explicitly rather than only confirming the board survives.

### O9. No I2C pull-ups on the display pads

TP30–TP33 expose GND/3V3/SDA/SCL with no bus pull-ups on the board. Most SSD1306 modules
carry their own, but the pads are advertised as a display interface — either add two DNP
pull-up footprints or state the dependency in README.md.

### O10. 22 Ω series resistors in the native-USB data lines

R3/R4. ESP32-S3 reference designs route USB D+/D− directly to the module (0 Ω
placeholders); 22 Ω raises the source impedance well away from the ~45 Ω single-ended
target. Full-speed is tolerant, and Rev 3.1's layout audit measured acceptable DP/DM
routing (46.9/43.1 mm, 3.8 mm mismatch), so this is unlikely to break enumeration — but it
is an unnecessary deviation. Consider 0 Ω.

### O11. Unnecessary new feeder values, unsourced

R43/R44 (47 k) and R50 (2.2 M) have no MPN/LCSC — `PASSIVE_DEFAULTS` has no entry for
either value — and both are new feeders against **R-08** ("minimize unique feeder-loaded
values"). 100 k is already stocked and works for the mid-rail divider. Separately, U34
(LMV393) carries MPN/LCSC on unit 1 only; units 2 and 3 were added without those fields, so
a BOM tool that reads a different unit first produces a blank line.

### O12. LATCH_STATE cannot distinguish "never armed" from "faulted"

/Q is high both at power-on (disarmed) and after a latch, and `FAULT_N_RAW` reaches only
TP3. Firmware cannot see which source faulted, nor whether a raw fault has cleared, except
by attempting an arm and re-reading GPIO17. That is workable for the prototype and does
satisfy the "re-arm fails while raw fault persists" test, but the diagnostics API is
specified to report hardware-latch state and the field will want fault attribution. A spare
GPIO on `FAULT_N_RAW` is cheap.

### O13. The tacho qualifier discards two thirds of the commutation edges

Measured on Rev 3.2-D, board 2, with real actuators on all six channels. The digital count
works electrically — `COMM_TACHO_N` on GPIO38 reaches PCNT and counts — but most of what it
counts is thrown away:

| | six manual moves | 0.5 s move (B8 unfixed) | 10 s move (B8 fixed) |
|---|---|---|---|
| `tacho_hardware_count` | 56 | 73 | 2448 |
| `motion_evidence_count` | 16 | 24 | 893 |
| `tacho_rejected` | 40 (71 %) | 48 (66 %) | 1554 (63 %) |

The rejection rate is stable at roughly two thirds regardless of move length, so it is a
property of the qualifier's constants rather than of the short aborted moves.

`tacho_cadence_us` read 13115 (~76 Hz). That is inside the configured window
(`tacho_min_period_us` 8000 = 125 Hz, `tacho_max_period_us` 200000 = 5 Hz) but well above
the 20–40 Hz band `firmware-integration.md` describes as the qualified commutation band, so
either the band documentation or the bring-up constants are wrong for this actuator.

These are explicitly bring-up values derived from measured data rather than production
constants, so this may be nothing more than uncalibrated. It matters because B8 leaves the
digital count as the *only* motion evidence there is: with no current signal and two thirds
of the edges discarded, an early stop is exactly what should be expected — and the zone 3
move did end after ~0.5 s rather than running its timer out.

Re-characterise the band against a scope on `TACHO_AMP` (pad 39 / GPIO1) once B8 is fixed
and the analog cross-check is available again, before anything is allowed to depend on
stall detection.

---

## 4. Verified correct

Recorded explicitly so it does not need re-deriving.

**ESP32-S3-WROOM-1 module mapping — all 19 signals correct**, checked pin-by-pin against
the KiCad symbol: GPIO4/15/16/17/8/9/10/11/12/13/14/48/0/42/43/44 → module pins
4/8/9/10/12/17/18/19/20/21/22/25/27/35/37/36; USB D−/D+ → 13/14; GND on 1/40/41; 3V3 on 2.
GPIO35/36/37 (module pins 28–30, consumed by the N8R8 octal PSRAM) are correctly
no-connected. Forbidden GPIOs 0/3/19/20/45/46 are respected for motor control.

**DRV8411 pinout exactly right** (SLVSGI0C): 1 nSLEEP, 2 AOUT1, 3 AISEN, 4 AOUT2, 5 BOUT2,
6 BISEN, 7 BOUT1, 8 nFAULT, 9 BIN1, 10 BIN2, 11 NC, 12 VM, 13 GND, 14 NC, 15 AIN2, 16 AIN1,
PAD → GND. V_TRIP 180/200/230 mV matches the contract exactly; 1 Ω 1 % → 178.2/200/232.3 mA
is arithmetically right. VM 1.65–11 V covers 3.3 V operation. DRV8833 is a TI-listed direct
pin-to-pin replacement, its pins 11/14 are VCP/VINT, and the DNP values (2.2 µF VINT→GND,
10 nF VCP→VM, 10 µF VM bulk) match its external-component table.

**74HC4514 output mapping correct**: Q0–Q5 → pins 11/9/10/8/7/6; Q8–Q13 → pins
18/17/20/19/14/13; Q6/Q7/Q14/Q15 (pins 5/4/16/15) unconnected, so addresses 6/7 and 14/15
cannot energize a bridge. Control pins (1 EL, 2 A0, 3 A1, 21 A2, 22 A3, 23 /EN, 12 VSS,
24 VDD) are right. LE = E = `DECODER_INHIBIT` genuinely makes direction reversal pass
through coast in hardware rather than by firmware promise (F-06).

**Driver-input polarity consistent across all six channels**: FWD → AIN1/BIN1 (pins 16/9),
REV → AIN2/BIN2 (pins 15/10), so "forward" means the same direction on every channel.
One-hot decoding means the idle state is coast (both inputs low), never brake.

**Failsafe defaults are in hardware, not firmware** (S-01): nSLEEP has an internal 500 kΩ
pulldown and the xIN pins 100 kΩ pulldowns, plus external 100 k pulldowns (R10–R14) on all
five ESP32 control lines and R15 on `DRIVE_PERMIT`.

**Fault latch correct**: D and /SD tied high, /RD = `FAULT_N_RAW`, Q = `DRIVE_PERMIT`,
/Q = `LATCH_STATE`. The Nexperia 74LVC1G74's Schmitt inputs tolerate the R23/C20 1 ms
power-on edge. The Q1 clamp plus the R24/C23/R25 AC-coupled arm path means releasing the
clamp cannot manufacture a rising clock edge. `ARM_CLK` peaks at 3.0 V decaying with
τ = 1.1 ms, staying above the LVC V_IH (2.31 V) for ~290 µs — ample.

**Analog front end**: INA180A1 orientation right (IN+ upstream of RSH1, IN− downstream →
positive differential), and its common-mode range is independent of its 3.3 V supply.
LMV393 is confirmed **open-collector**, so running it from 5 V with pull-ups to
`+3V3_LOGIC` is safe for both GPIO15 and the flip-flop's /RD. Rail comparator polarity is
right (output low when current exceeds `FLIM_REF`). FLIM_REF = 3.3 × 56/(10+56) = **2.80 V**
→ 280 mA at 10 V/A, a 15 % margin over the 232 mA worst-case bridge regulation, meeting the
plan's ≥10 % requirement.

**Also correct**: BAT54S clamp orientation (pin 1 A → GND, 2 K → rail, 3 COM → signal);
D5 TVS cathode to signal; active-low status LED (KiCad `Device:LED` pin 1 = K); SY8089
feedback 0.6 × (1 + 453/100) = 3.32 V; AP2112 pinout; USBLC6-2SC6 channel pairing (1/6 and
3/4); 4060 tap (pin 5 = Q5, ÷32, first HIGH at 16 cycles → 16 × 4.5 s = 72 s nominal); Rs =
2 × Rt as recommended.

**Connectivity is complete**: 404 global-label instances across 88 nets, **zero singleton
labels**, zero plain sheet-local labels, and ERC reports 0 errors / 0 warnings. Since "pin
not connected" is an ERC error by default, that also confirms every generated label landed
on its intended pin — which is worth knowing given the `net()` helper's coordinate-mirror
hack. See D7 for the caveat about the ignored global-label check.

---

## 5. What remains after ECO `rev3.2-B`

> **Superseded.** This list was written at ECO rev3.2-B and six ECOs have landed
> since. Items 1 and 2 are done or moot: the C0G timing capacitor left with the whole
> timer block in rev3.2-C, and the Rev 3.2 firmware backend exists
> (`rev32_motor_backend.cpp`, `rev32_logic.h`, `configurations/lune-v6-rev32.yaml`).
> Item 4 is superseded: the Rev 3.1 audit scripts are **not** being ported - they read
> KiCad files, and `check_design.py` section 11 now covers the layout invariants
> directly against the EasyEDA project. For the live list read `README.md`
> § *Remaining release gates*, `validation-plan.md` § 1, and the output of
> `python3 check_design.py`.

The schematic side is closed; see § 0 for the per-finding disposition. Outstanding work,
as assessed at rev3.2-B:

1. Source `C25` (22 nF ±5 % 50 V C0G/NP0 1206) and record its LCSC number. It is the only
   open sourcing item and `check_design.py` tracks it.
2. Write a Rev 3.2 firmware backend: PCNT/RMT on GPIO15, `ADC_TACHO` on GPIO5, 6 dB
   attenuation on `ADC_CURRENT`, per-move arming, and ≥250 ms drive-start tacho blanking.
   Until it exists, do not flash the Rev 3.1 entrypoint on Rev 3.2 hardware (D3).
3. Write a Rev 3.2 `requirements.md`. F-03/F-04 (eight channels) are superseded by prose
   only, and E-08's 250 ms endpoint bound needs either a measured justification or a
   restatement (D5).
4. Lay out the board, then port `audit_placement.py`, `audit_pcb.py` and
   `audit_layout_integrity.py` forward from `../lune-v6-rev3.1-lean/` (retained for exactly
   this purpose) and extend the ADC-length limits to cover `ADC_TACHO` (D4).
5. Reconcile `lune-v6/docs/ARCHITECTURE.md` with Rev 3.x — it still documents the
   DRV8215 I2C hardware layer and asserts that no analog comparator exists (D6).
6. Carry the deferred production decisions into the Rev 3.2 to Rev 4 gate: the xISEN value
   once § 3 has the current distributions (O1), the TPS2553 fault-response variant (O6),
   and a resettable PTC for the 1-wire supply branch (O5).

---

## 6. Rev 3.3 decisions

Taken after Rev 3.2-D bench bring-up on two assembled boards. Each one is a change to the
schematic, so `design-contract.json` and `check_design.py` move with it.

### R3.3-1. `R4` 10 kΩ → 1 kΩ

Closes B7. Yageo `RC0603FR-071KL`, LCSC **C22548**, already on this BOM as R1, R8, R11-R13,
R23, R39 and R40, so no new feeder. Slew drops from 99 ns/V to 8.3 ns/V against the
10 ns/V limit, peak rises 3.00 → 3.27 V, tau stays 1.01 ms. Set `arm_series_ohm` to 1000;
`check_arm_slew` fails until then.

Keep this even if R3.3-3 removes the latch, so a board built from an intermediate BOM is
not silently broken.

### R3.3-2. Delete the `TACHO_AMP` ADC tap; do not route to ADC2

Routing `TACHO_AMP` to ADC2 was considered and rejected. It fails on two independent
grounds before layout difficulty is even weighed:

- `soc_caps.h:103` — `SOC_ADC_DIG_SUPPORTED_UNIT(UNIT) ((UNIT == 0) ? 1 : 0)`. On ESP32-S3
  only ADC1 has the digital controller, so ADC2 cannot do continuous DMA sampling at all;
  `adc_continuous_config()` rejects it with "Only support using ADC1 DMA mode".
- ADC2 is contended with Wi-Fi, which is why the contract reserves GPIO1-10 for analog in
  the first place (`lv6_valve_controller/__init__.py:59-61`).

Oneshot sampling from a task is not a substitute: ~100 Hz is Nyquist against the 20-40 Hz
commutation band, so it could never cross-check the count.

Note what is *not* being deleted: `U5` also drives the comparator that produces
`COMM_TACHO_N`, which PCNT counts and which remains the motion evidence. Only the ADC tap
on GPIO1 goes, which frees an ADC1 pin.

**If the analog cross-check is judged worth keeping**, the cheap route is neither ADC2 nor
a second MCU pin: scale `TACHO_AMP` to fit the same attenuation as `ADC_CURRENT` (6 dB,
full scale ~1.75 V) with a divider on the amplifier output or a lower mid-rail reference.
Both channels then share one attenuation and the existing DMA stream carries them again —
two passives instead of a trace under the module. B8 documents why they cannot differ.

### R3.3-3. Remove the fault latch; route the fault sources to GPIOs

`U2`, `Q1`, `R4`, `R5` and `C4` come out. `FAULT_N_RAW` and the rail comparator each get a
GPIO, and `DRIVER_N_SLEEP` is tied to its safe state.

**GPIO assignment.** Removing the latch frees exactly the two pins it consumed, and both
are already routed into that cluster, so this is the minimum layout churn available:

| Signal | GPIO | Module pad | Was |
|---|---|---|---|
| `FAULT_USB_RAW` (`U24` pin 4, separated) | **15** | 8 | unused |
| `FAULT_N_RAW` (three DRV8411 `nFAULT`, wired-AND) | **16** | 9 | `LATCH_STATE` |
| `DRIVER_N_SLEEP` (drive permit, was `U2` pin 5) | **17** | 10 | `LATCH_ARM` |
| `RAIL_OVERCURRENT` (`U3` pin 1, separated) | **48** | 25 | unused |

None is a strapping pin (S3 straps are 0, 3, 45, 46), octal PSRAM (33-37) or JTAG (39-42),
and none sits in GPIO1-10, so the ADC1 reservation is untouched and needs no
`adc1_digital_exceptions` entry. `GPIO9` (pad 17) and `GPIO10` (pad 18) stay free.

`RAIL_OVERCURRENT` takes pad 25 rather than a neighbour of `FAULT_N_RAW` because the two
arrive from opposite sides of the board — the drivers are along the south edge, `U3` sits
in the analog island — and of the six free pads, five are on one module edge and only pad
25 is on another. It is routed instead alongside `COMM_TACHO_N`, which leaves the same
comparator for the same edge, with `R41` at the module end mirroring `R16`.

Each of the three new fault nets carries its own pull-up to `3V3_LOGIC` and a 1 nF to
ground at the module end: `R3`/`C3`, `R41`/`C43`, `R42`/`C42`. The pull-up is mandatory —
all three sources are open-drain, which is what made the wired-AND possible in the first
place — and must go to 3V3, not to the 5 V rail `U24` runs from, because the ESP32-S3 is
not 5 V tolerant. The capacitor is insurance against coupling: `RAIL_OVERCURRENT` passes
the buck switch node and `FAULT_USB_RAW` runs beside the USB data pair, and a 10 kohm
open-drain net is high-impedance enough to care. It costs 10-100 us of response, which is
immaterial now that firmware rather than a latch is the actor.

**Implementation note:** `U3` is open-drain, which is what made the wired-AND possible.
Taking its output onto a private net needs its own pull-up to `3V3_LOGIC`; `R3` stays with
`FAULT_N_RAW`.

**Why two nets instead of one.** The wired-AND is why firmware cannot attribute a fault
today (O12). Splitting the rail comparator off separates "one bridge reported a fault"
from "total rail current exceeded", which are different conditions with different
responses — and it makes the comparator observable, which is a precondition for R3.3-4.

**Why not one GPIO per driver.** Considered and rejected. The GPIO budget allows it —
after R3.3-2 and R3.3-3 the free non-analog pins are 15, 16, 17 and 48, plus GPIO1 once
the `TACHO_AMP` tap goes — but it buys little. The decoder selects one bridge at a time and
firmware knows which zone it selected, so an `nFAULT` arriving during a move already
attributes itself. Separate pins would only add attribution for faults raised while that
bridge is *not* selected: lingering thermal shutdown, or a `3V3_MOTOR` sag asserting all
three at once — and the latter is what the rail comparator on its own pin is for. Against
that: three open-drain nets need three pull-ups instead of `R3` alone, and three traces
from drivers spread along the south edge up to the module on a two-layer board already
carrying 887 top segments. The three `DRV8411` `nFAULT` outputs therefore stay wired-OR.

`U24`'s fault pin **was** going to stay on the shared net, on the argument that a TPS2553-1
trip removes power from the whole board including the MCU (O6), so reading it separately is
pointless. That was too pessimistic. The part asserts FAULT during the current-limiting
window *before* latch-off completes, and in that window the board is still alive — so a
shared net would have reported a USB overcurrent as a bridge fault. It now has `GPIO15` and
`FAULT_USB_RAW` of its own.

The result is full attribution across all three fault classes, which closes O12 outright
rather than halfway: `FAULT_N_RAW` low means a bridge, `RAIL_OVERCURRENT` low means total
rail current, `FAULT_USB_RAW` low means the USB switch. `GPIO9` and `GPIO10` stay spare.

One forward-looking note: if O6 is ever resolved by keeping the logic rail alive upstream,
`3V3_LOGIC` can be powered while `VBUS_RAW` is dead, and `R42` would then push current into
an unpowered `U24` through its substrate diodes. Harmless today — both rails die together
because the whole board is fed through the switch — but it belongs in that decision.

### R3.3-4. Re-examine the rail comparator threshold

O1 records that every hardware current threshold sits 4-6× above anything this actuator
produces, so the comparator may never fire in service. Removing the latch while keeping a
protection that cannot trip would be the worst of both.

`FLIM_REF` measured **2.82 V** on board 2. Now that B8 is fixed and `current_ma` reports
real values, characterise the current distribution across the six channels — free travel,
pin contact, under load, and against both end stops — and set `FLIM_REF` from that with a
stated margin. This is § 3 of the validation plan and it is now unblocked.

**Settled in two steps.** `R7` first went 56k → 10k, giving `FLIM_REF` 1.65 V and a 165 mA
trip. That cleared the actuator by a wide margin but left only **5 mA** below the DRV8411's
178.2 mA regulation floor — and above that floor the bridge caps the rail current, so the
comparator can never fire for a fault the bridge regulates. The threshold had moved off one
edge of the window onto the other. `R6` 10k → 12k (`C22790`, Basic) rebalanced it:
`FLIM_REF` 1.500 V, trip **150 mA**, worst case 142–158 mA.

| | Lower bound | Upper bound |
|---|---|---|
| What it guards | a healthy actuator must not trip it | it must fire before the bridge regulates |
| Bound | 60 mA measured peak | 178.2 mA regulation floor |
| Worst case | 142 mA = **2.4×** | 158 mA = **11% below** |

**The margin rule had to be restated, and that is ECO `rev3.3-P`.** The two rules as written
— 20 % above the 120 mA nameplate, 10 % below the regulation floor — cannot both be met. The
window is only 1.485× wide, which pins the nominal trip into 151.6–152.7 mA, and no E24
divider lands inside 1.1 mA. That was checked across `R6` = 8.2k…22k against a fixed 10k `R7`;
every value fails one rule or the other.

The lower rule gave, because it was the one built on a number this actuator cannot reach.
120 mA is a rating at the actuator's own drive voltage; from *this* rail the winding is 68 Ω
across 3.2 V, so locked rotor is **47 mA** and measured end-stop stall is 47–60 mA. The
nuisance trip that rule guards against is not physically available. The upper rule was kept
untouched, because it guards the failure that made the original 280 mA setting worthless.

The margin is now stated against the current the actuator can actually draw, not a nameplate
— so a different actuator model, or this one on a higher rail, moves the number rather than
silently invalidating the rule. `check_design.py` derives `FLIM_REF` from the fitted `R6`/`R7`
rather than from the contract's own `threshold_volts`, which is what let the 10k → 12k edit
pass unnoticed the first time.

### R3.3-5. `U24` to the auto-retry TPS2553 variant

Closes O6, which had stood as a deferred production decision. `TPS2553DBVR-1` (C111738) is
latch-off: a trip removes power from the ESP32 itself, so the failure had no LED, no API, no
log and no recovery short of a physical replug. `TPS2553DBVR` (C55266) is the constant-current
variant — it asserts `FAULT` and keeps regulating.

R3.3-3 is what makes this the right trade rather than a wash. `FAULT_USB_RAW` now reaches
GPIO15, so the event is observable; pairing an observable fault with a part that also
self-clears turns the worst failure mode in the power path into a logged, recoverable one.
What is given up is circuit-breaker behaviour on a persistent short, and the part's own
thermal shutdown covers that: constant current into a hard short is roughly 6 W, so it
thermally cycles rather than sitting there.

**Watch the footprint.** The library device brought its own land — SOT-23-6 `…-BL` became
`…-BR`, pads went 1.072 × 0.532 mm → 1.100 × 0.600 mm and each row moved 0.20 mm outward, so
the land span went 2.83 → 3.30 mm. Pin pitch, pin-1 corner and orientation are unchanged and
the netlist is identical, so the design is right — but copper, paste and mask around `U24`
all moved, and this was **not** the BOM-only swap it looked like. Re-run DRC. ECO `rev3.3-M`.

### R3.3-6. Rebuild the 1-wire supply branch for eight probes

The probe count was fixed at eight. The old budget field was named
`supply_drop_mv_at_two_probes` and meant it: 100 mV was computed at *two* probes. ESPHome
issues a Skip-ROM `Convert T`, so all eight convert at once — 12 mA, and 33 Ω drops 396 mV,
putting the probe at **2.90 V against a 3.0 V minimum**. The branch was out of specification
before cable resistance was even counted.

No single resistor fixes it. Holding 100 mV at 12 mA needs ≤ 8.3 Ω, which raises the short
current from 100 mA to over 400 mA and puts 1.3 W into an 0603. And no PPTC fixes it alone
either: the 0603 parts in this class have `Ri_min` 0.9 Ω, so a dead short demands 3.67 A,
which with the board's own ~400 mA is 4.07 A against an SY8089 whose limit is near 3.5 A —
the logic rail collapses and the ESP32 browns out for the whole trip window.

`R22` is therefore replaced by **`F1`** (BSMD0603-010-36V, C18377604) in series with **`R43`**
(4.7 Ω). `R43` is what keeps the fault inside the buck's headroom; `F1` is what makes a
shorted cable self-clearing instead of the permanent loss of the probe supply that a one-shot
fusible link produced.

| | Fresh | After a trip |
|---|---|---|
| Series resistance | 5.6 Ω | 12.7 Ω |
| Probe supply at 12 mA | 3.23 V | 3.15 V |

Short current 589 mA, 2.0× `F1`'s 300 mA trip, well inside the 500 ms datasheet maximum. The
motor rail does not load the buck — `U26` feeds `3V3_MOTOR` directly from `VBUS_PROTECTED` —
so the headroom is the ESP32's alone.

`R1_max`, not `Ri`, is the parameter that binds once `R43` is present, because it decides
whether the probes stay in specification for the life of the board. That is why C2153881
(Littelfuse, 100 ms trip, `Ri` 2 Ω) lost despite being the only part that could have dropped
`R43`: its `R1_max` of 14 Ω leaves 80 mV of margin, and its stock was 238 pieces.

**Accepted trade.** The supply branch's ESD series impedance falls from 33 Ω to 5.6 Ω. `U29`
remains the clamp at the connector and `3V3_LOGIC` is low-impedance behind a 2 A buck, so this
is acceptable — but `U29` now carries proportionally more of a strike, and the validation plan
says to watch that. ECO `rev3.3-N`.

### Hazard decision: no hardware-independent drive cutoff

Recorded deliberately, as `actuator_overrun_hazard` was.

**What is given up.** An asynchronous, firmware-independent removal of the drive permit on
a fault. After R3.3-3, a fault is handled by an ISR reading GPIO16 or GPIO17 and dropping
`MOTOR_ENABLE`.

**Why that is judged acceptable:**

1. **Three of the five sources are redundant.** The DRV8411 has internal overcurrent
   protection, thermal shutdown and UVLO, and disables its own outputs when it faults.
   `nFAULT` is a report, not the protection. Cutting `nSLEEP` afterwards protects nothing
   that is not already protected, and since the decoder selects one bridge at a time, a
   fault in one is not a reason to cut the others.
2. **The USB switch source is firmware's to handle, and it now can.** This argument was
   originally that the source was *moot*: `U24` was the latch-off `TPS2553DBVR-1`, so a trip
   removed power from the whole board including the MCU (O6), and cutting `nSLEEP` changed
   nothing. ECO `rev3.3-M` moved `U24` to the auto-retry variant, so that no longer holds —
   the board now survives a USB overload with the switch regulating at its limit. The useful
   response is therefore *load shedding*: drop the drive permit so the rail recovers. A latch
   could not do that selectively; `FAULT_USB_RAW` on GPIO15 lets firmware do exactly it. The
   conclusion is unchanged and the reasoning is stronger than when it was written.
3. **The crash case is already covered elsewhere.** `MOTOR_ENABLE`'s 100 kΩ pulldown drives
   `DECODER_INHIBIT` high whenever the GPIOs go high-Z, and the 4514's inhibit turns every
   output off regardless of the drive permit.
4. **The per-move arming property no longer exists.** ECO rev3.2-C removed the 74HC4060, so
   nothing re-disarms the latch; it stays armed until `FAULT_N_RAW` fires. The "armed
   window as short as the move" rationale in `firmware-integration.md:99` does not hold on
   as-built hardware.
5. **The timing difference is immaterial.** The latch cuts in nanoseconds, an ISR in
   microseconds, against an actuator at 100-300 mA whose mechanical and thermal constants
   are milliseconds to seconds.
6. **The removed circuit is itself a demonstrated failure source.** The AC-coupled arm path
   blocked two assembled boards outright (B7), and it carries firmware complexity —
   per-move arming, settle windows, coast-before-arm, the Q1 clamp interlock — plus the
   "never armed" / "faulted" ambiguity of O12.

**Residual risk accepted.** Firmware hung *and* a fault occurring *and* `MOTOR_ENABLE` left
asserted. The most likely fault in that state, bridge overcurrent, is self-protected by the
driver.

**Conditions.** This decision is void if R3.3-3 is implemented without the GPIOs, which
would leave the board with no system-level fault response at all, or if R3.3-4 is skipped.

**Revisit if** the product is ever required to meet a standard demanding a hardware
drive cutoff independent of firmware — IEC 60730 Annex H class B or similar. Nothing in
this repository documents such a requirement today; that was checked, not assumed.
