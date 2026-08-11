# Lune V6 Rev 3.2

Status: multi-sheet schematic ECO at level **rev3.2-B**; PCB placement, routing
and physical qualification pending.

Rev 3.2 is the successor to Rev 3.1 Lean. It retains the compact, two-layer,
six-channel manifold controller with an embedded `ESP32-S3-WROOM-1-N8R8`. The
design deliberately optimizes populated component count without removing
independent endpoint evidence or hard safety layers.

ECO **rev3.2-B** supersedes the first Rev 3.2 schematic. It corrects the
commutation tacho, re-references the independent runtime cutoff, and removes
three parts that were not earning their place. See
[design-review.md](design-review.md) for the findings behind each change and
§ [ECO rev3.2-B](#eco-rev32-b) below for the change list.

## Decision

- Six channels, because that is the actual product need. Channels seven and
  eight do not reduce feeder count enough to justify their connectors, driver,
  protection and board-edge area.
- Three dual H-bridges. `DRV8411PWPR` is the population. `DRV8833PWPR` is a
  TI-listed direct pin-to-pin replacement kept only as a shortage substitute:
  six DNP capacitor pads make it a drop-in, but its datasheet specifies no
  xISEN trip limits and derates on-resistance below `VM = 5 V`, so it is the
  weaker part in the current-ceiling role on a 3.2 V motor rail.
- One active-high 4-to-16 decoder gives a physically one-hot drive path:
  `Q0..Q5` drive one direction and `Q8..Q13` the opposite direction.
- One calibrated, shared high-side current channel measures force. Its raw,
  AC-coupled commutation ripple feeds a dedicated band-pass amplifier and
  comparator and an ESP32 counter input, so every selected-motor commutation
  can be counted. The tacho function is 14 mounted parts: one single op-amp,
  nine resistors and four capacitors. It reuses the spare `LMV393` comparator
  channel and the existing shunt; there are no per-motor sensors or extra mux.
- The amplified ripple is also brought to `GPIO5` through one resistor. That
  makes the qualification programme practical - the § 2 and § 3 edge-rate
  measurements can be logged by the device itself instead of needing a scope on
  every board, actuator and temperature combination - and it gives firmware an
  independent digital cross-check on the hardware comparator.
- The Rev3.1 BEMF mux, terminal resistor arrays, buffer and ADC clamp are
  deliberately omitted: they added ten mounted parts, one ADC GPIO and a coast
  interruption, while position learning is now continuous from `COMM_TACHO_N`.
- Endpoint classification requires direction-specific current, continuous
  commutation count/plateau, and a learned-count endpoint window. Current
  alone is never accepted as an endpoint.
- Fixed per-bridge current regulation, a fixed rail overcurrent comparator,
  persistent hardware fault latch, firmware runtime limits, and an independent
  hardware runtime timer form nested protection layers.
- Base board has LED status and unpopulated `GND/3V3/SCL/SDA` display pads. A
  fixed OLED is not populated: it costs board area and assembly money without
  improving local heating safety. The pads carry no I2C bus pull-ups.
- A protected three-pin `3V3/1-WIRE/GND` service connector supports external
  supply and return temperature probes. Both the data line and the supply pin
  have a series resistor and a local 3.3 V TVS; temperature freshness remains a
  firmware safety requirement, not a substitute for motor endpoint evidence.

## ECO rev3.2-B

Every item is verified by `check_design.py`, which fails if any of them is
reverted.

| # | Change | Why |
|---|---|---|
| 1 | Tacho comparator hysteresis moved from the threshold input to the non-inverting input (`R50` now bridges `COMM_TACHO_N` to `TACHO_CMP`) | Feedback to the inverting input is negative feedback. As drawn it was a relaxation oscillator with a 144 mV chatter band, not a Schmitt trigger - and PCNT counts that chatter. |
| 2 | Tacho stage rebuilt as a band-pass: high-pass 1.6 Hz (was 15.9 Hz), in-band gain ~85 (was 11), new 339 Hz low-pass | Measured commutation is 20-40 Hz at 14-19 mA, i.e. 7-30 mV at `CURRENT_RAW`. The old corner sat inside the signal band, the old gain matched the hysteresis, and nothing rejected the 50 kHz current-regulation chop. Now -43 dB at the chop. |
| 3 | `TACHO_REF` is a stiff 1k/1k mid-rail bypassed by 22 µF (was 47k/47k + 1 µF) | The gain-setting return used to see a 23.5 kΩ source impedance, so gain fell to ~6.6 at 20 Hz, and comparator transitions injected back into the reference. |
| 4 | 74HC4060 master reset moved from `DECODER_INHIBIT` to `LATCH_STATE` | `DECODER_INHIBIT` is the only handle firmware has for duty-cycle control, and the shipping firmware chops at 25 Hz - which reset the counter forever. Worse, *any* brief coast did. The cutoff now bounds total armed time. |
| 5 | Timing set is `Rt = 180k`, `Rs = 360k`, `Ct = 22 nF C0G` on `Q14` (was 180k/360k/10 µF X7R on `Q5`) | A 10 µF class-2 capacitor stacks tolerance, tempco, DC bias and aging to about ±56%, which cannot be trimmed into the 50-90 s window at all. C0G stacks to ±21%. Nominal is 71.4 s under either published formula factor. |
| 6 | Rail overcurrent comparator senses `CURRENT_RAW` instead of the filtered ADC node | An output-to-GND short bypasses the xISEN resistor and the DRV8411 OCP is 4 A, so this comparator is the only fast protection for that fault. The 1k/100n filter was adding 100 µs to it. |
| 7 | `D1` BAT54S ADC clamp removed | The INA180 runs from `+3V3_ANALOG` and cannot drive the node outside 0-3V3, so the clamp protected nothing, while its reverse leakage through `R20` added a temperature-dependent offset that room-temperature calibration cannot remove. |
| 8 | `R3`/`R4` 22 Ω USB series resistors removed | ESP32-S3 native USB drives D+/D- directly in Espressif reference designs; 22 Ω moved the single-ended impedance away from the ~45 Ω target for no protection benefit. |
| 9 | `C9` 220 µF electrolytic replaced by a second stocked 22 µF ceramic | The actuator draws 14-19 mA running and 23-50 mA stalled. This removes the only wet part, the tallest passive (7.7 mm) and one BOM line. |
| 10 | `J20` supply pin fed through `R52` 33 Ω + `D7` TVS as `+3V3_EXT` | It used to be a bare tap on the ESP32's own rail, so a shorted or ESD-struck field wire hit the MCU supply directly - against S-06. |
| 11 | Native `(dnp yes)` / `(in_bom no)` attributes now emitted | DNP intent lived only in a text property, so a generated BOM/CPL would have ordered and placed the six second-source capacitors and tried to place twelve test pads. |
| 12 | `check_design.py` added; `C46` DNP pad and ~130 lines of dead generator code removed | Rev 3.2 shipped without the Rev 3.1 audit scripts, which is why the placement counts in this file drifted by ten parts. |

Feeder consolidation: the tacho rebuild uses only values already in the BOM, so
the unsourced 47k and 2.2M values are gone. Net BOM lines are down by two
(22 Ω, BAT54S and the electrolytic out; 22 nF C0G in). `C25` is the single
remaining open sourcing item and `check_design.py` tracks it explicitly.

## Size and assembly target

- 2 layers, `90 x 75 mm`, within the JLCPCB `100 x 100 mm` price class.
- Four M3 holes form a symmetric `82 x 67 mm` rectangle. The six RJ9 body
  outlines are centered as a row along the bottom edge and project 1.0 mm;
  USB-C is rotated 90 degrees counter-clockwise and projects 1.0 mm at the
  left edge; the 1-wire terminal projects 1.75 mm at the right edge.
- The tacho components must be placed adjacent to the existing current-sense
  amplifier and kept away from motor loops and the current ADC. Copper, pours,
  thermal design and final placement remain a Rev3.2 layout task.
- **111 populated placements**, plus 6 DNP second-source capacitors, 14
  copper-only pads and 4 mounting holes. The DRV8833 substitute population is
  117. No electrolytic parts; tallest passive is 1.45 mm.
- The final footprint total, assembly price and manufacturing files are
  deliberately not projected until the Rev3.2 PCB exists.

## Release state

Rev 3.2 is a schematic-only ECO. The Rev 3.1 routed PCB, Gerbers, BOM and CPL
do not include the Rev 3.2 analog changes and must not be fabricated as
Rev 3.2. The dedicated firmware must add PCNT/RMT capture before automatic
calibration can be enabled, and the Rev 3.1 entrypoint must not be flashed onto
Rev 3.2 hardware - `GPIO5` was a no-connect and is now an amplified analog
input. Remaining release gates are:

1. Lay out the analog ECO, route it away from the ADC and motor loops, then
   pass ERC, DRC, placement and manufacturing audits.
2. Source a 22 nF ±5% 50 V C0G/NP0 1206 capacitor for `C25` and record the
   LCSC part number.
3. Capture the raw shunt commutation spectrum on supported actuators and
   confirm the band-pass, hysteresis and counter pulse-rejection limits against
   measurement.
4. Characterize both endpoint directions on every supported actuator sample,
   including cold/hot, supply tolerance, already-at-stop, jam, disconnect and
   cable-transient cases.
5. Qualify the external 1-wire cable and supply/return probes for ESD, open,
   short, stale data and sensor substitution faults.
6. Verify the independent hardware timeout across component and temperature
   tolerance, and trim `Rt` from the first measurement, before production
   release.

## Verification

```sh
kicad-cli sch erc --output erc.rpt --severity-error --severity-warning \
    --exit-code-violations lune-v6-rev3.2.kicad_sch
kicad-cli sch export netlist --format kicadsexpr \
    --output lune-v6-rev3.2.net lune-v6-rev3.2.kicad_sch
python3 check_design.py
```

`netlist-golden.json` is a committed snapshot of every pin-to-net connection.
`check_design.py` diffs the exported netlist against it, so any edit that alters
connectivity fails loudly instead of passing as a drawing that merely looks
plausible. Regenerate it only when a change is intended:

```sh
python3 check_design.py --update-golden
```

Two `kicad-cli` behaviours the checks work around, both verified experimentally:
it does not read the project's ERC severity overrides, and it **omits unnamed
nets from the netlist entirely** — which is why every net carries exactly one
label even when it never leaves its sheet, since a wired-but-unnamed net would
be invisible to the golden-netlist guard.

`erc.rpt` currently reports 0 errors and 0 warnings. Note that its "Ignored
checks" list includes *Global label only appears once* and that `kicad-cli`
does not read the project's ERC severity overrides - in a design where all
connectivity is carried by global labels that is the one class that would catch
a typo'd net, so `check_design.py`, not the ERC run, is the gate for label
integrity.

Regenerate the schematic from the editable source with:

```sh
python3 generate_kicad.py   # needs kicad-sch-api 0.5.6 and the KiCad 10 symbols
```

See [rev2-review-addendum.md](rev2-review-addendum.md),
[architecture.md](architecture.md), [design-review.md](design-review.md),
[validation-plan.md](validation-plan.md),
[firmware-integration.md](firmware-integration.md),
[design-contract.json](design-contract.json), and the five generated schematic
sheets. `layout-audit.md` is retained as Rev3.1 historical evidence only; it
does not validate the Rev3.2 analog ECO.

## Drawing convention

Rev 3.2-A carried 100% of its connectivity on global labels attached to pins:
zero wires, zero junctions, zero hierarchical sheet pins. That is electrically
valid but it is a netlist rendered as text, and it is why the tacho hysteresis
error (B1) survived review — with nothing drawn, there was no way to see that
the feedback resistor had landed on the threshold input.

The sheets are now drawn hybrid, which is the ordinary convention:

- **Local sub-circuit topology is wired** with orthogonal segments and junctions
  — dividers, RC networks, the amplifier feedback loop, the comparator
  hysteresis, the arm path, the oscillator, the sense resistors, the USB data
  pairs, the reset/boot groups, the inhibit node.
- **Rails keep per-pin labels** (`GND`, `+3V3_LOGIC`, `+3V3_ANALOG`,
  `+3V3_MOTOR`, `+3V3_MOTOR_REG`, `VBUS_RAW`, `VBUS_PROTECTED`), as does
  `TACHO_REF`, which is a local reference rail feeding six points.
- **Nets that fan out across a sheet or leave it are named**, not dragged across
  the page: the MCU's GPIO fan-out, the motor outputs of the three repeated
  driver blocks, and the shared `FAULT_N_RAW` / `DRIVE_PERMIT` / `LATCH_STATE`
  nets. Where several of a named net's pins are adjacent, they are wired
  together and the net is named once instead of once per pin.

| Sheet | wires | junctions | labels |
|---|---:|---:|---:|
| analog | 49 | 24 | 75 |
| power | 16 | 6 | 62 |
| controller | 13 | 8 | 74 |
| motors | 12 | 0 | 105 |
| connectors | 8 | 5 | 25 |
| **total** | **98** | **43** | **341** (was 406) |

Three `kicad-sch-api` / KiCad behaviours the generator works around, all found
by experiment and all documented at the point of use:

1. **Rotated symbols resolve pins wrongly** — a label requested on a rot-90
   resistor's pin 1 lands on pin 2, and one on a rot-90 op-amp pin does not
   connect at all. Every symbol is therefore placed at rotation 0 and routes are
   built from queried pin coordinates.
2. **`get_component_pin_position` is not unit-aware** — for the three-unit `U34`
   it returns the same coordinate for pins 1/7, 2/6 and 3/5, so routing by
   reference would wire the wrong comparator. Pins are resolved through the
   component instance instead.
3. **A `wire` element takes exactly two points, and a pin lying mid-wire does
   not connect.** A three-point polyline still parses — symbols are enumerated —
   but KiCad then forms *no nets at all* on that sheet, so ERC stays silent
   while every pin drops out of the netlist. Runs are emitted as consecutive
   two-point segments, and pins sitting on a spine get an explicit junction.

The golden netlist is what makes this safe: the conversion changed the drawing
of all five sheets and left all 400 pin-to-net connections byte-identical.

## Schematic sheets

- `lune-v6-rev3.2-power.kicad_sch` — USB input protection and the power rails.
- `lune-v6-rev3.2-controller.kicad_sch` — ESP32, one-hot decoder and safety logic.
- `lune-v6-rev3.2-motors.kicad_sch` — the three dual H-bridges and six outputs.
- `lune-v6-rev3.2-analog.kicad_sch` — current sensing, safety latch and commutation tacho.
- `lune-v6-rev3.2-connectors.kicad_sch` — actuators, sensors, service and test points.
