# Lune V6 Rev 3.2

Status: ECO level **rev3.2-H**; PCB placed and routed; DRC, fabrication export
and physical qualification pending.

**Source of truth: `EasyEdaPro/lune-v6-rev3.2.eprj`, PCB document `pcb1_1`.**
Rev 3.2 was authored in KiCad through ECO rev3.2-B and every ECO from rev3.2-C
onward was done in EasyEDA Pro. The KiCad sheets, generator, exported netlist and
ERC report were deleted once keeping both live produced a schematic/PCB
divergence no gate could see; they remain in git history, and
`design-contract.json` → `designator_history` maps every old reference to the
designator the board carries.

Rev 3.2 is the successor to Rev 3.1 Lean. It retains the compact, two-layer,
six-channel manifold controller with an embedded `ESP32-S3-WROOM-1-N8R8`. The
design deliberately optimizes populated component count without removing
independent endpoint evidence or hard safety layers.

ECO **rev3.2-B** supersedes the first Rev 3.2 schematic. It corrects the
commutation tacho, re-references the independent runtime cutoff, and removes
three parts that were not earning their place. See
[design-review.md](design-review.md) for the findings behind each change and
§ [ECO rev3.2-B](#eco-rev32-b) below for the change list. Seven further ECOs have
landed since; each has its own section below, and the schematic is at
**rev3.2-H**.

## Decision

- Six channels, because that is the actual product need. Channels seven and
  eight do not reduce feeder count enough to justify their connectors, driver,
  protection and board-edge area.
- Three dual H-bridges, `DRV8411PWPR`, with no DNP second-source pads: the
  DRV8411 integrates its charge-pump and regulator capacitors, so pins 11 and 14
  stay open. `DRV8410PWPR` is the nominated second source - pin-compatible
  including those NC pins - but is not stocked at LCSC. DRV8833 was dropped in
  ECO rev3.2-E; see `driver.alternatives_evaluated` in the contract.
- One active-high 4-to-16 decoder gives a physically one-hot drive path:
  `Q0..Q5` drive one direction and `Q8..Q13` the opposite direction.
- One calibrated, shared high-side current channel measures force. Its raw,
  AC-coupled commutation ripple feeds a dedicated band-pass amplifier and
  comparator and an ESP32 counter input, so every selected-motor commutation
  can be counted. The tacho function is 14 mounted parts: one single op-amp,
  nine resistors and four capacitors. It reuses the spare `LMV393` comparator
  channel and the existing shunt; there are no per-motor sensors or extra mux.
- The amplified ripple is also brought to `GPIO1` as `ADC_TACHO` through one
  resistor. That
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
  persistent hardware fault latch and firmware runtime limits form nested
  protection layers. There is deliberately **no** hardware max-on-time; ECO
  rev3.2-C removed it on a hazard assessment recorded as
  `actuator_overrun_hazard`.
- Base board has LED status and an unpopulated `GND/3V3/SCL/SDA` display header
  (`J8`). A fixed OLED is not populated: it costs board area and assembly money
  without improving local heating safety. The bus pull-ups **are** on the board
  (ECO rev3.2-F) so SDA and SCL cannot float when no display is fitted.
- A protected three-pin `3V3/1-WIRE/GND` service connector supports external
  supply and return temperature probes. Both the data line and the supply pin
  have a series resistor and a local 3.3 V TVS; temperature freshness remains a
  firmware safety requirement, not a substitute for motor endpoint evidence.

## ECO rev3.2-B

Every item is verified by `check_design.py`, which fails if any of them is
reverted.

| # | Change | Why |
|---|---|---|
| 1 | Tacho comparator hysteresis moved from the threshold input to the non-inverting input (`R15` now bridges `COMM_TACHO_N` to `TACHO_CMP`) | Feedback to the inverting input is negative feedback. As drawn it was a relaxation oscillator with a 144 mV chatter band, not a Schmitt trigger - and PCNT counts that chatter. |
| 2 | Tacho stage rebuilt as a band-pass: high-pass 1.6 Hz (was 15.9 Hz), in-band gain ~85 (was 11), new 339 Hz low-pass | Measured commutation is 20-40 Hz at 14-19 mA, i.e. 7-30 mV at `CURRENT_RAW`. The old corner sat inside the signal band, the old gain matched the hysteresis, and nothing rejected the 50 kHz current-regulation chop. Now -43 dB at the chop. |
| 3 | `TACHO_REF` is a stiff 1k/1k mid-rail bypassed by 22 µF (was 47k/47k + 1 µF) | The gain-setting return used to see a 23.5 kΩ source impedance, so gain fell to ~6.6 at 20 Hz, and comparator transitions injected back into the reference. |
| 4 | ~~74HC4060 master reset moved to `LATCH_STATE`~~ | **Superseded by ECO rev3.2-C** — the whole timer block is removed. |
| 5 | ~~Timing set `Rt = 180k`, `Rs = 360k`, `Ct = 22 nF C0G` on `Q14`~~ | **Superseded by ECO rev3.2-C** — the C0G reasoning was right, but the oscillator was wired rotated one position around the star, so 71.4 s was never what the board would have made. |
| 6 | Rail overcurrent comparator senses `CURRENT_RAW` instead of the filtered ADC node | An output-to-GND short bypasses the xISEN resistor and the DRV8411 OCP is 4 A, so this comparator is the only fast protection for that fault. The 1k/100n filter was adding 100 µs to it. |
| 7 | `D1` BAT54S ADC clamp removed | The INA180 runs from `+3V3_ANALOG` and cannot drive the node outside 0-3V3, so the clamp protected nothing, while its reverse leakage through `R1` added a temperature-dependent offset that room-temperature calibration cannot remove. |
| 8 | `R3`/`R4` 22 Ω USB series resistors removed | ESP32-S3 native USB drives D+/D- directly in Espressif reference designs; 22 Ω moved the single-ended impedance away from the ~45 Ω target for no protection benefit. |
| 9 | `C41` 220 µF electrolytic replaced by a second stocked 22 µF ceramic | The actuator draws 14-19 mA running and 23-50 mA stalled. This removes the only wet part, the tallest passive (7.7 mm) and one BOM line. |
| 10 | `J1` supply pin fed through `R22` 33 Ω + `D2` TVS as `+3V3_EXT` | It used to be a bare tap on the ESP32's own rail, so a shorted or ESD-struck field wire hit the MCU supply directly - against S-06. |
| 11 | Native `(dnp yes)` / `(in_bom no)` attributes now emitted | DNP intent lived only in a text property, so a generated BOM/CPL would have ordered and placed the six second-source capacitors and tried to place twelve test pads. |
| 12 | `check_design.py` added; `C46` DNP pad and ~130 lines of dead generator code removed | Rev 3.2 shipped without the Rev 3.1 audit scripts, which is why the placement counts in this file drifted by ten parts. |

Feeder consolidation: the tacho rebuild uses only values already in the BOM, so
the unsourced 47k and 2.2M values are gone. Net BOM lines are down by two
(22 Ω, BAT54S and the electrolytic out; 22 nF C0G in). The C0G timing capacitor
left again with the whole timer block in ECO rev3.2-C, so no open sourcing items
remain; `check_design.py` fails if that declaration goes stale.

## ECO rev3.2-C - the runtime cutoff is removed

The 74HC4060 timer block - six parts, **~100 mm2**
of courtyard out of the congested west block - is deleted, plus the `TIMEOUT_Q14`,
`TIMER_RTC`, `TIMER_RS`, `TIMER_CTC` and `TIMING_COMMON` nets and one
characterization gate.

> Its KiCad designators were `U36`, `R27`, `R28`, `C25`, `Q2` and `C24`. Do not
> use those as a regression guard: the EasyEDA scheme reuses `R27`, `R28` and
> `C25` for unrelated parts. `check_design.py` guards the removal by device
> (`actuator_overrun_hazard.removed_devices`), which is what it should always
> have been.

This is a hazard-assessment result, recorded as `actuator_overrun_hazard` in the design
contract. Two things drove it:

- **The hazard is bounded and not electrical.** An over-driven actuator strips its own
  gear train, in the *opening* direction only. A parted head leaves the valve insert and
  its seal in the manifold, releasing the pin to full flow - closed system, no escape, and
  the loop cannot exceed the mixing-valve supply temperature. Worst case is one actuator,
  and it announces itself. The rail comparator never helped here: stall current sits below
  its 280 mA trip, and the damage mechanism is torque x duration while the comparator
  bounds current.
- **The part cost more than it saved.** Its oscillator was wired rotated one position
  around the timing star, invisible to ERC and to `check_design.py` because the timeout
  was computed from contract values rather than schematic topology. And bounding *total
  armed time* collided with learning mode, which needs 43-85 s to reach both end stops
  against a 56-86 s cutoff - so commissioning could latch a fault firmware cannot clear.

Retained: the firmware runtime limit already in service, the commutation tacho as
rotation/stall evidence, the ESP32 task watchdog, and `R26`-`R31` for a defined safe state
when GPIOs go high-Z. The **fault latch stays** - `U2` pin 6 is the only consumer of
`FAULT_N_RAW`, which five sources feed, so `check_design.py` now asserts that consumer and
those contributors as an invariant.

One behavioural change: the latch no longer self-disarms when idle. That is benign -
`MOTOR_ENABLE` falling to its 100 k pulldown drives `DECODER_INHIBIT` high and the 4514
turns every output off regardless of `DRIVE_PERMIT`.

## ECO rev3.2-D - decoder package, placement and address map

`U28` goes from `XL74HC4514D` in **SOIC-24W** to Nexperia **`74HC4514PW,118`** (`C58910`,
TSSOP-24). Same logic, same pin numbering, so the netlist is unaffected by the package
change itself.

| | Courtyard |
|---|---|
| `SOIC-24W` | 188.6 mm² |
| `TSSOP-24` | **63.9 mm²** (66% less) |

Two smaller chips were considered and rejected. Active-low decoders (`'138`, `'139`, `'137`,
`'4515`) are out on safety grounds: with active-low outputs, idle becomes `IN1=IN2=1`, i.e.
**brake on all six channels**, and `DECODER_INHIBIT` would assert brake rather than release
to coast. Shift registers (`'595`) give a three-wire bus and lovely routing but let firmware
write any pattern, which destroys the structural one-hot guarantee - and one-hot is load
bearing for the *measurement* too, since the shared shunt would otherwise sum two motors and
the commutation tacho would count garbage. That leaves only `74HC4514` and `74HC237`, and two
`'237` cost more copper (232 mm vs 200 mm) and more area (84.7 mm² vs 63.9) because you trade
four long output runs for five long bus runs.

### Placement and remap

`U28` moves from east of the module into the gap between `U9`'s and `U10`'s VM-cap
clusters**, unrotated, at the driver row's latitude. Its pin rows then run north-south and
each flank faces the drivers it serves - side A west to `U9`, side B east to `U10` then
`U11` - so **no output crosses the package**. Output trace budget falls from ~540 mm spanning
the whole board to ~120 mm beside the drivers.

The address-to-output assignment is remapped to suit that geometry. `MOTOR_TERM_DIR` is
renamed **`MOTOR_ADDR3`**: keeping bit 3 as the direction bit is exactly what forced every
motor's forward/reverse pair to straddle the package, because Q0-Q7 all sit on side A and
Q8-Q15 on side B. And addresses **0-3 are unreachable by design** - side A keeps four spare
outputs rather than being packed, since packing them would move a driver's signals onto the
flank facing away from it. `check_design.py` asserts that `Q0`-`Q3` reach no bridge input.

> ~~`address = (channel_code << 1) | direction`, direction 0 = forward, so bit 0 is the
> direction bit and firmware needs only a six-entry code table.~~ **Superseded by the
> as-built assignment.** Routing `U28` north-around - outputs leave the flank, pass north of
> the package, run along and drop south into the driver input row - puts the southernmost
> decoder pin in the southernmost lane serving the *nearest* destination, which inverts the
> order against a straight-across layout. Direction then tracks bit 0 only on odd channels
> and inverts on even ones, because the mirrored bridge order swaps the FWD/REV sense
> between motor A and motor B of each driver. **No bit encodes direction.**

The as-built map is `decoder.channel_address_map` in `design-contract.json`, which
`check_design.py` asserts against the schematic, and firmware uses those twelve entries
rather than a formula (`REV32_FORWARD_ADDRESS` / `REV32_REVERSE_ADDRESS` in `rev32_logic.h`,
asserted against this table by `make test-rev32-logic`):

| Channel | Forward | Reverse |
|---|---|---|
| 1 | 7 | 6 |
| 2 | 4 | 5 |
| 3 | 13 | 12 |
| 4 | 14 | 15 |
| 5 | 9 | 8 |
| 6 | 10 | 11 |

## ECO rev3.2-E - the six DNP second-source pads are removed

`C110`-`C112` (VINT, 2.2 µF) and `C114`-`C116` (VCP, 10 nF) are deleted, and `DRV8411`
pins 11 and 14 are left open. `check_design.py` now asserts that **no DNP placement
remains**, so they cannot come back quietly.

They existed to keep the pin-compatible `DRV8833` available as a shortage substitute. TI
now lists `DRV8411` as the **newer replacement for** `DRV8833` — pin-for-pin with the same
functionality, adding integrated VCP and VINT capacitors, 1.8 V logic inputs and ultra-low
sleep current. So the pads preserved the *older* part, which carries more EOL risk than the
one it was backing up.

And this contract had already argued the substitute was not viable: 2.0× the unit price,
0.35× the stock, six extra capacitors, and — decisively — no specified `xISEN` trip limits
with `RDS(on)` explicitly derated below `VM = 5 V`. On a 3.18 V motor rail the DRV8833 is
unspecified in exactly the current-ceiling role it would have had to fill.

The nominated second source becomes **`DRV8410`**, which is pin-compatible *including* the NC
pins 11 and 14 — so it needs no external capacitors and drops in with no board change. It is
not stocked at LCSC today; that is the open item, not the pads.

### What it buys

| | Before | After |
|---|---|---|
| Placements | 114 + 6 DNP | **114, no DNP** |
| Nets | `VINT1-3`, `VCP1-3` | gone |
| Decoder gap | 9.90 mm | **16.90 mm** |
| Clearance each side of `U28` | 1.10 mm | **4.60 mm** |

The two pads per driver at `dx ± 6.5` were what pinned the decoder gap. Removing them also
clears the **y = 35.5 band**, so the `FWD`/`REV` fan-out heading east now crosses only
`+3V3_MOTOR` instead of three traces per driver — the crossing problem the previous ECO was
working around disappears rather than being solved.

## ECO rev3.2-F - connector-driven pin moves, I2C pull-ups, JST pads

Four signals move so that each sits on the side of the module its connector is on, and
so that nothing digital occupies an ADC1 channel:

| Net | Pad | GPIO | Why |
|---|---|---|---|
| `MOTOR_ENABLE` | 18 → **8** | 10 → **15** | Off ADC1, and onto the west row beside the latch block it feeds. *Moved again in rev3.2-H to pad 11 / GPIO18.* |
| `ONEWIRE_MCU` | 35 → **11** | 42 → **18** | Connector moved beside USB-C on the west edge; frees a JTAG pin. *Moved again in rev3.2-H to pad 12 / GPIO8.* |
| `I2C_SDA` | 12 → **23** | 8 → **21** | Display connector goes east; frees an ADC1 channel |
| `I2C_SCL` | 17 → **24** | 9 → **47** | Same, and adjacent to SDA on the module's south edge |

**ADC1 is now reserved for analog.** It is `GPIO1`–`GPIO10` and the only ADC usable while
WiFi runs; ADC2 (`GPIO11`–`GPIO20`) is not, which is where slow digital belongs. Only
`ADC_TACHO` (1), `ADC_CURRENT` (2) and one declared exception sit on ADC1, leaving **six
spare channels**. `check_design.py` asserts the rule, so a future pin move cannot quietly
eat an analog channel — which is exactly what these three signals were doing.

Exceptions are declared data, not a code exemption: they live in `design-contract.json`
under `adc1_digital_exceptions`, and `check_design.py` prints each one on every run and
fails if a listed signal is no longer on ADC1, so the list cannot go stale. There is one —
`STATUS_LED_N` on `GPIO4` (§ [ECO rev3.2-G](#eco-rev32-g---status_led_n-moves-off-the-south-row))
and `ONEWIRE_MCU` on `GPIO8` (§ [ECO rev3.2-H](#eco-rev32-h---two-pin-moves-and-the-console-series-resistors)).
Two analog channels, two exceptions, five spare.

### I2C pull-ups added

`R37`/`R38`, 4k7 to `+3V3_LOGIC`. The bus had none. They are not optional and not only for
the bus to function: without them `SDA` and `SCL` float on the ESP32's inputs whenever no
display is fitted, which is the failure `R26`–`R29` exist to prevent at the decoder — a
floating CMOS input sits near mid-rail with both transistors conducting. A display module
carrying its own pull-ups gives 2k35 effective, still inside spec, and a 100 ns rise into
50 pF against the 300 ns that 400 kHz allows.

### Two unpopulated JST footprints replace eight test pads

`TP30`–`TP37` are gone. In their place:

| | Pins | Footprint |
|---|---|---|
| `J8` display I2C | GND, +3V3_LOGIC, SDA, SCL | `JST_PH_S4B-PH-SM4-TB_1x04-1MP_P2.00mm_Horizontal` |
| `J9` UART console | GND, +3V3_LOGIC, TXD0, RXD0 | same |

Both are `COPPER_ONLY`: the pads exist, nothing is ordered or placed, and a connector gets
soldered on only when a display or a console is actually wanted. Side-entry SMD so no drill
holes cut the ground pour, and PH's 2.00 mm pitch is the most hand-solderable JST — which is
the whole point of pads you fit by hand. Copper-only items go from 14 to 8.

## ECO rev3.2-G - STATUS_LED_N moves off the south row

`STATUS_LED_N` moves from module **pad 25 (`GPIO48`)** to **pad 4 (`GPIO4`)**. Nothing about
the LED changes: `D3` is still a plain green `KT-0805G` sinking through `R23` 1 k from
`+3V3_LOGIC`, still active low. Only the pin and therefore the escape direction change.

**It is a layout change, not an electrical one.** On pad 25 the net left the module on the
south row, which put `D3` and `R23` in the `x 49–52 / y 38–43` pocket, and `R23`'s supply
tap is what drags the `3V3_LOGIC` spine up to `y = 37.21`. That pocket is the only room
available to re-arrange the `3V3_LOGIC`, `VBUS_PROTECTED` and `3V3_MOTOR` spines, which
today leave a single one-trace-wide lane between them. `UART_TX_DBG`, `UART_RX_DBG`,
`I2C_SDA` and `I2C_SCL` are all still unrouted and none of them has a top-layer route
while that lane is one wide. Pad 4 leaves west instead, clear of the band entirely.

**It spends an ADC1 channel, and that is the cost.** `GPIO4` is `ADC1_CH3`, so the move
needs the declared exception described under the ADC1 reserve above. No cheaper pin exists:

| Pads | GPIOs | Why not |
|---|---|---|
| 5, 6, 7, 12 | `IO5`–`IO7`, `IO8` | Same ADC1 reserve — no better than pad 4 |
| 15, 17, 18 | `IO3`, `IO9`, `IO10` | ADC1 as well, and `IO3` is a strapping pin |
| 16, 26 | `IO46`, `IO45` | Strapping. The LED pulls its pin high through 1 k at reset, which on `IO46` suppresses the ROM log and on `IO45` selects 1.8 V `VDD_SPI` |
| 28, 29, 30 | `IO35`–`IO37` | Octal PSRAM |
| 32–35 | `IO39`–`IO42` | Free, but on the east side with the analog island — the wrong direction |

The BEMF frontend that would have wanted a third analog channel was removed in Rev 3.2, so
the reserve had the headroom. Two analog channels and one exception leave six spare.

**Firmware.** `lune.yaml` still declares `pin_rgb_status_led: GPIO48` and also
`pin_nfault: "4"`. The rev3.2 migration already marks `pin_nfault` for deletion; both edits
must land together or `GPIO4` is assigned twice. See § Migration status in
`../../README.md`.

## ECO rev3.2-H - two pin moves and the console series resistors

Three changes, all of them layout consequences that the schematic has to record.

### `MOTOR_ENABLE` pad 8 → 11, `ONEWIRE_MCU` pad 11 → 12

The safety cluster that `MOTOR_ENABLE` feeds sits at one latitude: `U7` at
`y = 49.01`, `R30` at `48.90`, `Q1` at `49.04`. Module pad 11 is at `y = 49.19`,
so from there the net is a straight west line. From pad 8 at `y = 53.00` it had
to drop 4 mm across the escapes of pads 9 and 10 - `LATCH_STATE` and
`LATCH_ARM`, the two nets it least wants to cross. `ONEWIRE_MCU` followed onto
pad 12.

**It costs an ADC1 channel.** Pad 12 is `IO8`, which is the channel `I2C_SDA`
was moved off in rev3.2-F, so this partly reverses that move. The difference is
what sits there now: `I2C` is a live bus on every boot, while 1-wire is a
15 kbit/s field bus behind a 33 Ω series resistor and a TVS. Of the two, it is
the cheaper one to put back.

No cheaper pin exists. Every other free pad on the west and south rows is either
an ADC1 channel (15/17/18 = `IO3`/`IO9`/`IO10`) or a strapping pin (16/26 =
`IO46`/`IO45`); pads 28-30 are the octal PSRAM; pads 32-35 sit east with the
analog island. The move is declared in `adc1_digital_exceptions`, so
`check_design.py` prints it on every run and fails if it ever stops being true.

### `R39`/`R40`, 1 kΩ in series with the console

`J9` sits 34 mm east of the module and the run crosses the analog island's
south flank. `TXD0` is a full-speed CMOS output with roughly 2 ns edges; 1 kΩ
against the ~40 pF the run presents stretches that to about 90 ns, which is 1 %
of a bit at 115200 and removes the harmonic content the ADC and tacho nodes
would otherwise see. Both resistors sit at the module end so the whole run is
damped. The `RXD0` one is pin protection rather than edge rate - that edge is
driven by whatever adapter is plugged in.

1 kΩ is already a BOM line six times over (`R1`, `R8`, `R11`, `R12`, `R13`,
`R23`), so this adds no part number.

**Consequence for net names:** `UART_TX_DBG` and `UART_RX_DBG` now name the
**header** side. The module side is `UART_TX` and `UART_RX`, and that is
what the `gpio` map tracks. Pads 36/37 are `RXD0`/`TXD0` - the ROM bootloader
console - and cannot move.

### Antenna cutout 21 → 22 mm

The notch was cut 1 mm wider than specified, so the module gets 2.0 mm of air
either side instead of 1.5. That is margin, not a defect; the contract now
records what the board has. Ground copper and stitching run up to the cut on
both flanks and along its south edge at a 2 mm pitch.

### Also corrected in this ECO

`pcb.block_placement` still described the Rev3.1 arrangement, with the analog
block in the west. The rev3.2 pin reassignment moved `ADC_CURRENT` and
`ADC_TACHO` to the module's east row and the block followed; the contract now
carries the as-built positions. `firmware-integration.md`'s pin table had
drifted on five entries and is now generated from the same `gpio` map that
`check_design.py` asserts.

## Size and assembly target

- 2 layers, `90 x 75 mm`, within the JLCPCB `100 x 100 mm` price class.
- Four M3 holes form a symmetric `82 x 67 mm` rectangle. The six RJ9 body
  outlines are centered as a row along the bottom edge and project 1.0 mm;
  USB-C is rotated 90 degrees counter-clockwise and projects 1.0 mm at the
  left edge; the 1-wire terminal projects 1.75 mm at the right edge.
- The tacho components must be placed adjacent to the existing current-sense
  amplifier and kept away from motor loops and the current ADC. Copper, pours,
  thermal design and final placement remain a Rev3.2 layout task.
- **116 populated placements**, no DNP parts, 8
  copper-only pads and 4 mounting holes. The DRV8833 substitute population is
  117. No electrolytic parts; tallest passive is 1.45 mm.
- The final footprint total, assembly price and manufacturing files are
  deliberately not projected until the Rev3.2 PCB exists.

## Release state

Rev 3.2 is a schematic-only ECO. The Rev 3.1 routed PCB, Gerbers, BOM and CPL
do not include the Rev 3.2 analog changes and must not be fabricated as
Rev 3.2.

Firmware exists and is the default Lune V6 build: `configurations/lune-v6.yaml`
(hostname `lune-v6-<mac>`). The board package `packages/board/lune-v6-rev32.yaml`
selects the `rev32_gpio` backend, which owns the 4-bit decoder, the per-move latch arm,
the 6 dB `ADC_CURRENT` range and PCNT capture on `COMM_TACHO_N`. Automatic startup
calibration stays off - the thresholds are bring-up values, and the tacho's
missed/false-edge rate is unmeasured. Neither revision's entrypoint may be
flashed on the other's hardware; see the collision table in
`firmware-integration.md`. Remaining release gates are:

1. ~~Close the open items `check_design.py` reports.~~ **Done** - the gate passes.
2. Run DRC to zero errors and zero unrouted nets, then export Gerber, BOM and
   CPL into this folder so the fabrication package is reviewable in git. These
   are the three gates `check_design.py` deliberately does not claim to cover.
3. Capture the raw shunt commutation spectrum on supported actuators and
   confirm the band-pass, hysteresis and counter pulse-rejection limits against
   measurement.
4. Characterize both endpoint directions on every supported actuator sample,
   including cold/hot, supply tolerance, already-at-stop, jam, disconnect and
   cable-transient cases.
5. Qualify the external 1-wire cable and supply/return probes for ESD, open,
   short, stale data and sensor substitution faults.
6. Settle the deferred production decisions: the `xISEN` value once § 3 has the
   current distributions, the TPS2553 fault-response variant, and a resettable
   PTC on the 1-wire supply branch. The motor-output ferrite rating is settled -
   200 mA is kept, see `motor_output_ferrites.derating_decision`.
7. Add a copper-only pad on `FAULT_N_RAW`. It reaches no GPIO and, on the
   as-built board, no test pad either, so neither firmware nor a scope can see
   which source faulted.

## Verification

EasyEDA Pro is the source of truth. `check_design.py` reads the project file
directly - placements, net connectivity, BOM flags, symbol pinouts and the
routed geometry - and asserts it against `design-contract.json`:

```sh
python3 check_design.py
```

It checks the **PCB** document rather than the schematic on purpose. The PCB is
what becomes Gerbers, and every defect class this gate exists to catch is a
property of what gets fabricated. Checking the schematic instead would let a
schematic/PCB divergence pass, which is what happened while KiCad and EasyEDA
were both live: 57 of 79 nets matched, and the differences included twelve
undocumented series ferrites and a changed motor-connector pinout.

`netlist-golden.json` is a committed snapshot of every pad-to-net connection.
Any edit that alters connectivity fails loudly instead of passing as a layout
that merely looks plausible. Regenerate it only when a change is intended:

```sh
python3 check_design.py --update-golden
```

Three gates stay with the editor because the project file does not record them:
**DRC to zero errors**, **zero unrouted nets**, and the **Gerber/BOM/CPL
export**. `validation-plan.md` § 1 owns them; `check_design.py` prints a
reminder rather than pretending to cover them.

Designators were renumbered when the source of truth moved. Documentation
written before ECO rev3.2-G may still use the KiCad names;
`design-contract.json` → `designator_history` maps all 118 of them.

See [rev2-review-addendum.md](rev2-review-addendum.md),
[architecture.md](architecture.md), [design-review.md](design-review.md),
[validation-plan.md](validation-plan.md),
[firmware-integration.md](firmware-integration.md),
[design-contract.json](design-contract.json), and the five generated schematic
sheets. `layout-audit.md` is retained as Rev3.1 historical evidence only; it
does not validate the Rev3.2 analog ECO.

## Drawing convention, and why two findings stayed invisible

Rev 3.2-A was authored in KiCad and carried 100% of its connectivity on global
labels attached to pins: zero wires, zero junctions, zero hierarchical sheet
pins. That is electrically valid but it is a netlist rendered as text, and it is
why two findings survived review. B1 - the tacho hysteresis resistor landing on
the comparator's threshold input instead of its signal input - is something a
drawn feedback loop shows at a glance and a label cannot show at all. B6 - the
amplifier drawn with the wrong TLV9001 pinout variant - is the same class: it
made a wrong drawing look right, and pointed ERC at the wrong pins.

Two rules came out of that and both outlived the tool:

- **Local sub-circuit topology gets drawn**, not labelled. Dividers, RC
  networks, the amplifier feedback loop, the comparator hysteresis, the arm
  path, the sense resistors, the USB data pairs, the inhibit node. Rails and
  cross-sheet fan-out keep names.
- **Every net carries a name.** A wired-but-unnamed net is invisible to
  documentation and to the golden-netlist guard, and it cannot be discussed in
  a review. `check_design.py` asserts this; seven nets arrived from the KiCad
  import without labels and are still open.

The mechanical guard against the B6 class is now `pcb.symbol_pinouts` in the
contract, asserted against the project's own symbol library. It covers the two
5-pin amplifiers, the comparator and the status LED - the LED because pin 1 is
the anode in this library and the cathode in KiCad's, so the two schematics
disagreed on paper while both boards were in fact correct.

## Schematic sheets

Five sheets in `EasyEdaPro/lune-v6-rev3.2.eprj`, asserted by
`pcb.schematic_sheets`:

- `power` — USB input protection and the power rails.
- `controller` — ESP32, one-hot decoder and safety logic.
- `motors` — the three dual H-bridges, six outputs, ferrites and TVS clamps.
- `analog` — current sensing, safety latch and commutation tacho.
- `connectors` — actuators, sensors, service header and test pads.

The board is the `pcb1_1` document. A second document, `pcb1`, is a near
identical earlier copy and must be deleted: two PCB documents in one project is
a Gerber-export hazard, and `check_design.py` fails while both exist.
