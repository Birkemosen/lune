#!/usr/bin/env python3
"""Machine checks for the Lune V6 Rev 3.2 schematic.

Rev 3.2 was released as a schematic-only ECO without the Rev 3.1 audit
scripts.  Nothing then cross-checked ``design-contract.json`` against the
generated sheets, and README/architecture placement counts silently drifted by
the ten parts the BEMF removal deleted.  This script closes that gap and also
encodes the topology invariants the design review had to establish by hand, so
they become regressions rather than review findings.

Inputs (all committed artifacts, no KiCad Python required):

* ``lune-v6-rev3.2-*.kicad_sch`` - symbol properties and fabrication attributes
* ``lune-v6-rev3.2.net``         - KiCad-exported netlist, the pin/net authority
* ``design-contract.json``       - the numbers the documentation quotes

Regenerate the netlist after any schematic change::

    kicad-cli sch export netlist --format kicadsexpr \\
        --output lune-v6-rev3.2.net lune-v6-rev3.2.kicad_sch

Note that ``kicad-cli sch erc`` does *not* read the project's ERC severities:
the "Global label only appears once" class stays ignored in ``erc.rpt`` however
the project is configured.  Label integrity is gated here, not by the ERC run.
"""

from __future__ import annotations

import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SHEETS = sorted(ROOT.glob("lune-v6-rev3.2-*.kicad_sch"))
NETLIST = ROOT / "lune-v6-rev3.2.net"
CONTRACT_PATH = ROOT / "design-contract.json"
GOLDEN = ROOT / "netlist-golden.json"
KICAD_SYMBOLS = Path("/Applications/KiCad/KiCad.app/Contents/SharedSupport/symbols")

failures: list[str] = []
notes: list[str] = []


def check(condition: bool, message: str) -> bool:
    if condition:
        print(f"  ok    {message}")
    else:
        print(f"  FAIL  {message}")
        failures.append(message)
    return condition


def info(message: str) -> None:
    print(f"  --    {message}")


def close(actual: float, expected: float, tolerance: float = 0.01) -> bool:
    return abs(actual - expected) <= tolerance * max(abs(expected), 1e-12)


# --------------------------------------------------------------------------- #
# Parsing
# --------------------------------------------------------------------------- #


def symbol_blocks(text: str):
    """Yield every top-level symbol instance as a source span."""
    for match in re.finditer(r"\n\t\(symbol\b", text):
        start = match.start() + 1
        depth = 0
        for index in range(start, len(text)):
            if text[index] == "(":
                depth += 1
            elif text[index] == ")":
                depth -= 1
                if depth == 0:
                    yield text[start:index + 1]
                    break


def prop(block: str, name: str) -> str | None:
    match = re.search(r'\(property "%s" "([^"]*)"' % re.escape(name), block)
    return match.group(1) if match else None


class Symbol:
    def __init__(self, block: str, sheet: str):
        self.sheet = sheet
        self.lib_id = (re.search(r'\(lib_id "([^"]+)"', block) or [None, ""])[1]
        self.reference = prop(block, "Reference") or "?"
        self.value = prop(block, "Value") or ""
        self.footprint = prop(block, "Footprint") or ""
        self.mpn = prop(block, "MPN")
        self.lcsc = prop(block, "LCSC")
        self.dnp_field = prop(block, "DNP")
        self.assembly = prop(block, "Assembly") or ""
        self.sourcing = prop(block, "Sourcing")
        self.dielectric = prop(block, "Dielectric")
        self.native_dnp = "(dnp yes)" in block
        self.in_bom = "(in_bom yes)" in block
        self.unit = int((re.search(r"\(unit (\d+)\)", block) or [0, 1])[1])

    @property
    def is_power_flag(self) -> bool:
        return self.reference.startswith("#")

    @property
    def is_mechanical(self) -> bool:
        return self.assembly == "MECHANICAL_ONLY"

    @property
    def is_copper_only(self) -> bool:
        return self.assembly == "COPPER_ONLY"

    @property
    def is_populated(self) -> bool:
        return not (
            self.is_power_flag
            or self.is_mechanical
            or self.is_copper_only
            or self.native_dnp
        )


def load_symbols() -> dict[str, list[Symbol]]:
    by_ref: dict[str, list[Symbol]] = defaultdict(list)
    for sheet in SHEETS:
        text = sheet.read_text(encoding="utf-8")
        for block in symbol_blocks(text):
            symbol = Symbol(block, sheet.name)
            if symbol.reference != "?":
                by_ref[symbol.reference].append(symbol)
    return by_ref


def load_labels() -> tuple[dict[str, int], int]:
    """Return (global label name -> occurrences, plain label count)."""
    counts: dict[str, int] = defaultdict(int)
    plain = 0
    for sheet in SHEETS:
        text = sheet.read_text(encoding="utf-8")
        for match in re.finditer(r'\(global_label "([^"]+)"', text):
            counts[match.group(1)] += 1
        plain += len(re.findall(r'^\s*\(label "', text, re.MULTILINE))
    return counts, plain


def load_netlist() -> tuple[dict[tuple[str, str], str], dict[str, set[tuple[str, str]]]]:
    """Return (ref, pin) -> net and net -> {(ref, pin)}."""
    if not NETLIST.exists():
        return {}, {}
    text = NETLIST.read_text(encoding="utf-8")
    pin_net: dict[tuple[str, str], str] = {}
    net_pins: dict[str, set[tuple[str, str]]] = defaultdict(set)
    chunks = re.split(r"\n\t\t\(net\b", text)
    for chunk in chunks[1:]:
        name = re.search(r'\(name "([^"]*)"', chunk)
        if not name:
            continue
        net = name.group(1)
        for node in re.finditer(r'\(ref "([^"]+)"\)\s*\(pin "([^"]+)"\)', chunk):
            key = (node.group(1), node.group(2))
            pin_net[key] = net
            net_pins[net].add(key)
    return pin_net, net_pins


def module_pin_to_gpio() -> dict[int, str]:
    """Read the ESP32-S3-WROOM-1 pin names straight from the KiCad library."""
    library = KICAD_SYMBOLS / "RF_Module.kicad_sym"
    if not library.exists():
        return {}
    text = library.read_text(encoding="utf-8")
    start = text.find('(symbol "ESP32-S3-WROOM-1"')
    if start < 0:
        return {}
    depth = 0
    for index in range(start, len(text)):
        if text[index] == "(":
            depth += 1
        elif text[index] == ")":
            depth -= 1
            if depth == 0:
                break
    block = text[start:index + 1]
    mapping: dict[int, str] = {}
    for match in re.finditer(r'\(pin\s+\S+\s+\S+(.*?)\(number\s+"(\d+)"', block, re.S):
        name = re.search(r'\(name\s+"([^"]*)"', match.group(1))
        if name:
            mapping[int(match.group(2))] = name.group(1)
    return mapping


# --------------------------------------------------------------------------- #
# Checks
# --------------------------------------------------------------------------- #


def check_labels(labels: dict[str, int], plain: int, net_pins: dict) -> None:
    """Net integrity.

    Once local topology is drawn as wires, a global label that appears only once
    is correct and desirable - it names a wired net rather than substituting for
    a connection - so the orphan test is taken from the netlist instead: every
    net must reach at least two pins.  That is the invariant the label-count
    heuristic was standing in for, and it holds regardless of drawing style.
    """
    print("\n[1] Label and net integrity")
    check(plain == 0, f"no sheet-local labels ({plain} found)")
    if net_pins:
        orphans = sorted(
            net for net, pins in net_pins.items()
            if len(pins) < 2 and not net.startswith("unconnected-")
        )
        check(not orphans, f"every net reaches at least two pins ({len(orphans)} orphaned)"
              + (f": {', '.join(orphans[:8])}" if orphans else ""))
        info(f"{len(net_pins)} nets in the netlist")
    unnamed = "n/a"
    info(f"{len(labels)} named nets, {sum(labels.values())} label instances "
         f"(unnamed wired nets: {unnamed})")


def check_placements(symbols: dict[str, list[Symbol]], contract: dict) -> None:
    print("\n[2] Placement accounting")
    populated = sorted(r for r, s in symbols.items() if s[0].is_populated)
    dnp = sorted(r for r, s in symbols.items() if s[0].native_dnp and not s[0].is_copper_only)
    pads = sorted(r for r, s in symbols.items() if s[0].is_copper_only)
    mech = sorted(r for r, s in symbols.items() if s[0].is_mechanical)

    info(f"populated {len(populated)} | second-source DNP {len(dnp)} | "
         f"copper-only pads {len(pads)} | mechanical {len(mech)}")

    check(
        len(populated) == contract["populated_placement_schematic_count"],
        f"populated count {len(populated)} matches contract "
        f"populated_placement_schematic_count "
        f"{contract['populated_placement_schematic_count']}",
    )
    check(
        contract["populated_placement_projection"]
        == contract["populated_placement_schematic_count"],
        "contract projection equals the schematic count",
    )
    driver = contract["driver"]
    check(
        driver["drv8411_populated_placements"] == len(populated),
        f"contract drv8411_populated_placements {driver['drv8411_populated_placements']} "
        f"matches {len(populated)}",
    )
    check(
        driver["drv8833_populated_placements"] == len(populated) + len(dnp),
        f"contract drv8833_populated_placements {driver['drv8833_populated_placements']} "
        f"matches populated + {len(dnp)} second-source caps",
    )


def check_fabrication_attributes(symbols: dict[str, list[Symbol]]) -> None:
    print("\n[3] Fabrication attributes reach the native fields")
    bad_dnp = [
        r for r, s in symbols.items()
        if (s[0].dnp_field == "yes" or "DNP" in s[0].value.upper()) and not s[0].native_dnp
    ]
    check(not bad_dnp, "every do-not-populate part carries (dnp yes)"
          + (f" (missing: {', '.join(sorted(bad_dnp))})" if bad_dnp else ""))

    in_bom = [
        r for r, s in symbols.items()
        if (s[0].is_copper_only or s[0].is_mechanical) and s[0].in_bom
    ]
    check(not in_bom, "copper-only and mechanical items are excluded from the BOM"
          + (f" (still in BOM: {', '.join(sorted(in_bom))})" if in_bom else ""))

    stray = [r for r, s in symbols.items() if s[0].native_dnp and s[0].is_populated]
    check(not stray, "no symbol is both populated and DNP")


def check_sourcing(symbols: dict[str, list[Symbol]], contract: dict) -> None:
    print("\n[4] Sourcing")
    allowed = set(contract.get("open_sourcing_items", []))
    missing = sorted(
        r for r, s in symbols.items()
        if s[0].is_populated and not (s[0].lcsc or "").strip()
    )
    unexpected = [r for r in missing if r not in allowed]
    check(
        not unexpected,
        "every populated part has an LCSC number or is a declared open item"
        + (f" (unsourced: {', '.join(unexpected)})" if unexpected else ""),
    )
    stale = sorted(allowed - set(missing))
    check(not stale, "no stale entries in open_sourcing_items"
          + (f" ({', '.join(stale)})" if stale else ""))
    for ref in missing:
        info(f"open sourcing item {ref}: {symbols[ref][0].value} "
             f"({symbols[ref][0].sourcing or 'no Sourcing note'})")

    inconsistent = []
    for ref, instances in symbols.items():
        if len(instances) > 1:
            if len({(i.mpn, i.lcsc) for i in instances}) > 1:
                inconsistent.append(ref)
    check(
        not inconsistent,
        "multi-unit symbols carry identical MPN/LCSC on every unit"
        + (f" (mismatched: {', '.join(sorted(inconsistent))})" if inconsistent else ""),
    )


def check_gpio(pin_net: dict, contract: dict) -> None:
    print("\n[5] ESP32 GPIO contract")
    pin_names = module_pin_to_gpio()
    if not pin_names:
        info("KiCad RF_Module library unavailable; skipping module pin cross-check")
        return
    gpio_of_pin = {}
    for pin, name in pin_names.items():
        match = re.fullmatch(r"IO(\d+)", name)
        if match:
            gpio_of_pin[pin] = int(match.group(1))
    gpio_of_pin.update({13: 19, 14: 20, 36: 44, 37: 43})  # USB_D-/D+, RXD0, TXD0

    wanted = {signal: int(gpio) for signal, gpio in contract["gpio"].items()}
    seen: dict[str, int] = {}
    for (ref, pin), net in pin_net.items():
        if ref != "U1":
            continue
        gpio = gpio_of_pin.get(int(pin))
        if gpio is not None and net in wanted:
            seen[net] = gpio

    for signal, gpio in sorted(wanted.items(), key=lambda item: item[1]):
        check(
            seen.get(signal) == gpio,
            f"{signal} is on GPIO{gpio}"
            + ("" if seen.get(signal) == gpio else f" (schematic: {seen.get(signal)})"),
        )
    forbidden = set(contract["forbidden_motor_control_gpio"])
    motor_signals = {"MOTOR_ADDR0", "MOTOR_ADDR1", "MOTOR_ADDR2", "MOTOR_ENABLE",
                     "MOTOR_TERM_DIR", "LATCH_ARM", "LATCH_STATE", "ADC_CURRENT",
                     "ADC_TACHO", "COMM_TACHO_N"}
    clash = sorted(s for s in motor_signals if wanted.get(s) in forbidden)
    check(not clash, "no motor-control signal uses a forbidden GPIO"
          + (f" ({', '.join(clash)})" if clash else ""))


def check_decoder(pin_net: dict, contract: dict) -> None:
    print("\n[6] One-hot decoder mapping")
    decoder = contract["decoder"]
    # KiCad 4514 symbol: Q0..Q5 -> 11,9,10,8,7,6 and Q8..Q13 -> 18,17,20,19,14,13.
    q_pin = {0: 11, 1: 9, 2: 10, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4,
             8: 18, 9: 17, 10: 20, 11: 19, 12: 14, 13: 13, 14: 16, 15: 15}
    for index, q in enumerate(decoder["connected_forward_outputs"], 1):
        check(pin_net.get(("U24", str(q_pin[q]))) == f"FWD{index}",
              f"decoder Q{q} (pin {q_pin[q]}) drives FWD{index}")
    for index, q in enumerate(decoder["connected_reverse_outputs"], 1):
        check(pin_net.get(("U24", str(q_pin[q]))) == f"REV{index}",
              f"decoder Q{q} (pin {q_pin[q]}) drives REV{index}")
    unused = [6, 7, 14, 15]
    dangling = [q for q in unused if ("U24", str(q_pin[q])) in pin_net]
    check(not dangling, "decoder Q6/Q7/Q14/Q15 reach no bridge input"
          + (f" (connected: {dangling})" if dangling else ""))
    check(pin_net.get(("U24", "1")) == decoder["latch_enable_net"],
          f"decoder LE is {decoder['latch_enable_net']}")
    check(pin_net.get(("U24", "23")) == "DECODER_INHIBIT",
          "decoder active-high inhibit is DECODER_INHIBIT")


def check_safety_topology(pin_net: dict, net_pins: dict, symbols: dict, contract: dict) -> None:
    print("\n[7] Safety-net topology invariants")

    # Rail overcurrent comparator must see the unfiltered shunt amplifier
    # output, not the 1k/100n ADC node (100 us of avoidable trip delay).
    check(pin_net.get(("U34", "2")) == "CURRENT_RAW",
          "rail comparator inverting input senses CURRENT_RAW")
    check(pin_net.get(("U34", "3")) == "FLIM_REF",
          "rail comparator non-inverting input is FLIM_REF")
    check(pin_net.get(("U34", "1")) == "FAULT_N_RAW",
          "rail comparator output joins the wired-AND fault net")

    # Tacho comparator hysteresis must be positive feedback into the signal
    # (non-inverting) input.  Feeding it to the threshold input makes a
    # relaxation oscillator, which was the Rev3.2-A defect.
    signal_net = pin_net.get(("U34", "5"))
    threshold_net = pin_net.get(("U34", "6"))
    output_net = pin_net.get(("U34", "7"))
    check(output_net == "COMM_TACHO_N", "tacho comparator output is COMM_TACHO_N")
    check(threshold_net == "TACHO_REF",
          f"tacho comparator threshold input is the fixed reference (is {threshold_net})")
    feedback = {ref for ref, _ in net_pins.get(output_net or "", set())
                if ref.startswith("R")}
    hysteresis = sorted(
        ref for ref in feedback
        if signal_net in {pin_net.get((ref, "1")), pin_net.get((ref, "2"))}
    )
    check(bool(hysteresis),
          "a hysteresis resistor bridges the tacho comparator output to its "
          f"non-inverting input ({', '.join(hysteresis) or 'none found'})")
    wrong = sorted(
        ref for ref in feedback
        if threshold_net in {pin_net.get((ref, "1")), pin_net.get((ref, "2"))}
    )
    check(not wrong,
          "no feedback path from the tacho comparator output to its threshold input"
          + (f" ({', '.join(wrong)})" if wrong else ""))

    # Runtime cutoff must not be resettable by the signal firmware chops for
    # duty control, and must not be defeated by a brief coast.
    cutoff = contract["hardware_runtime_cutoff"]
    check(pin_net.get(("U36", "12")) == cutoff["reset_net"],
          f"4060 master reset is {cutoff['reset_net']}")
    check(pin_net.get(("U36", "12")) != "DECODER_INHIBIT",
          "4060 master reset is not the decoder inhibit signal")
    tap = str(cutoff["timeout_output_pin"])
    timeout_net = pin_net.get(("U36", tap))
    check(timeout_net is not None, f"4060 pin {tap} carries the timeout output")
    check(pin_net.get(("Q2", "1")) == timeout_net,
          "timeout output drives the fault-injection MOSFET gate")
    check(pin_net.get(("Q2", "3")) == "FAULT_N_RAW",
          "timeout MOSFET pulls the wired-AND fault net")
    if "C25" in symbols:
        check(symbols["C25"][0].dielectric == "C0G_NP0_MANDATORY",
              "runtime-timeout capacitor declares a C0G/NP0 dielectric")

    # Fault latch wiring.
    check(pin_net.get(("U35", "6")) == "FAULT_N_RAW", "latch async reset is FAULT_N_RAW")
    check(pin_net.get(("U35", "5")) == "DRIVE_PERMIT", "latch Q is DRIVE_PERMIT")
    check(pin_net.get(("U35", "3")) == "LATCH_STATE", "latch /Q is LATCH_STATE")
    check(pin_net.get(("Q1", "1")) == "MOTOR_ENABLE",
          "arm-clock clamp is gated by MOTOR_ENABLE")

    # Every driver takes its enable from the latch and reports into the fault net.
    for ref in ("U20", "U21", "U22"):
        check(pin_net.get((ref, "1")) == "DRIVE_PERMIT", f"{ref} nSLEEP is DRIVE_PERMIT")
        check(pin_net.get((ref, "8")) == "FAULT_N_RAW", f"{ref} nFAULT joins the fault net")
        check(pin_net.get((ref, "12")) == "+3V3_MOTOR", f"{ref} VM is the shunted motor rail")

    # The external service connector must not tap the MCU rail directly.
    supply = pin_net.get(("J20", "1"))
    check(supply not in (None, "+3V3_LOGIC"),
          f"1-wire connector supply pin is a protected branch (is {supply})")
    branch = {ref for ref, _ in net_pins.get(supply or "", set())}
    check(any(r.startswith("R") for r in branch),
          "the 1-wire supply branch includes a series element")
    check(any(r.startswith("D") for r in branch),
          "the 1-wire supply branch includes a local TVS")


def check_analog_numbers(contract: dict) -> None:
    print("\n[8] Derived analog and timing numbers")
    rail = contract["rail_overcurrent"]
    driver = contract["driver"]

    volts_per_amp = rail["shunt_ohm"] * rail["amplifier_gain"]
    check(close(volts_per_amp, contract["current_sense_v_per_a"]),
          f"current sense scale {volts_per_amp:.1f} V/A matches the contract")

    trip = rail["threshold_volts"] / volts_per_amp * 1000.0
    check(close(trip, rail["nominal_trip_ma"], 0.02),
          f"rail comparator nominal trip {trip:.0f} mA matches "
          f"{rail['nominal_trip_ma']} mA")

    tol = driver["sense_resistor_tolerance_percent"] / 100.0
    r_isen = driver["bridge_current_limit_ohm"]
    low = driver["trip_voltage_min_mv"] / (r_isen * (1 + tol))
    high = driver["trip_voltage_max_mv"] / (r_isen * (1 - tol))
    check(close(low, driver["current_limit_min_ma"], 0.005),
          f"bridge ceiling minimum {low:.1f} mA matches the contract")
    check(close(high, driver["current_limit_max_ma"], 0.005),
          f"bridge ceiling maximum {high:.1f} mA matches the contract")
    margin = rail["estimated_worst_case_trip_min_ma"] / high
    check(margin >= 1.10,
          f"worst-case rail trip is {(margin - 1) * 100:.0f}% above the worst-case "
          "bridge ceiling (>=10% required)")

    tacho = contract["commutation_tacho"]
    hp = 1.0 / (2 * math.pi * tacho["input_bias_ohm"] * tacho["input_coupling_f"])
    lp = 1.0 / (2 * math.pi * tacho["feedback_ohm"] * tacho["feedback_f"])
    gain = 1.0 + tacho["feedback_ohm"] / tacho["gain_return_ohm"]
    check(close(hp, tacho["high_pass_hz"], 0.02), f"tacho high-pass {hp:.2f} Hz")
    check(close(lp, tacho["low_pass_hz"], 0.02), f"tacho low-pass {lp:.0f} Hz")
    check(close(gain, tacho["asymptotic_gain"], 0.02), f"tacho asymptotic gain {gain:.0f}")
    rejection_db = 20 * math.log10(lp / tacho["chop_frequency_hz"])
    check(rejection_db <= tacho["chop_rejection_db"],
          f"chop rejection {rejection_db:.0f} dB at or below the contracted "
          f"{tacho['chop_rejection_db']} dB "
          f"(low-pass {lp:.0f} Hz vs {tacho['chop_frequency_hz'] / 1000:.0f} kHz chop)")
    check(tacho["high_pass_hz"] < tacho["commutation_band_hz"][0],
          "high-pass corner sits below the measured commutation band")
    check(tacho["low_pass_hz"] > tacho["commutation_band_hz"][1],
          "low-pass corner sits above the measured commutation band")
    hyst = 3.3 * tacho["hysteresis_series_ohm"] / (
        tacho["hysteresis_series_ohm"] + tacho["hysteresis_feedback_ohm"])
    check(close(hyst * 1000, tacho["hysteresis_mv"], 0.02),
          f"comparator hysteresis {hyst * 1000:.0f} mV")
    settle_ms = tacho["input_bias_ohm"] * tacho["input_coupling_f"] * 1000
    check(settle_ms <= tacho["required_blanking_ms"],
          f"AC-coupling settling {settle_ms:.0f} ms fits the required "
          f"{tacho['required_blanking_ms']} ms drive-start blanking")

    cut = contract["hardware_runtime_cutoff"]
    for factor in (2.2, 2.5):
        seconds = (cut["timeout_first_high_cycles"] * factor
                   * cut["oscillator_rt_ohm"] * cut["oscillator_ct_f"])
        check(
            cut["required_characterized_minimum_s"] <= seconds
            <= cut["required_characterized_maximum_s"],
            f"4060 timeout {seconds:.1f} s (formula factor {factor}) lies inside "
            f"{cut['required_characterized_minimum_s']}-"
            f"{cut['required_characterized_maximum_s']} s",
        )
        check(seconds > contract["hardware_runtime_cutoff"]["normal_firmware_limit_generic_s"],
              f"4060 timeout {seconds:.1f} s exceeds the {cut['normal_firmware_limit_generic_s']} s "
              "firmware limit")
    check(cut["oscillator_r2_ohm"] >= 2 * cut["oscillator_rt_ohm"],
          "oscillator Rs is at least 2x Rt as the datasheet requires")

    # The formula factor and the initial RC tolerance are both trimmable with
    # Rt after the first measurement; the part-to-part and over-temperature
    # spread is not.  The release criterion is therefore that the tolerance
    # stack fits inside the acceptance window at all, whatever the nominal is.
    # A 10 uF class-2 Ct stacks to about +/-56% and cannot.
    stack = (
        cut["oscillator_ct_tolerance_percent"]
        + cut["oscillator_rt_tolerance_percent"]
        + cut["oscillator_device_spread_percent"]
    ) / 100.0
    check(close(stack * 100, cut["oscillator_tolerance_stack_percent"], 0.001),
          f"contracted tolerance stack {cut['oscillator_tolerance_stack_percent']}% "
          f"matches the component breakdown ({stack * 100:.0f}%)")
    spread_ratio = (1 + stack) / (1 - stack)
    window_ratio = (cut["required_characterized_maximum_s"]
                    / cut["required_characterized_minimum_s"])
    check(spread_ratio <= window_ratio,
          f"timing tolerance stack +/-{stack * 100:.0f}% (max/min ratio "
          f"{spread_ratio:.2f}) fits the "
          f"{cut['required_characterized_minimum_s']}-"
          f"{cut['required_characterized_maximum_s']} s window "
          f"(ratio {window_ratio:.2f})")


def library_pin_names(lib_id: str) -> dict[str, str]:
    """Resolve a stock symbol's pin number -> pin name, following ``extends``."""
    library, _, symbol = lib_id.partition(":")
    path = KICAD_SYMBOLS / f"{library}.kicad_sym"
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")

    def span(name: str) -> str | None:
        start = text.find(f'(symbol "{name}"')
        if start < 0:
            return None
        depth = 0
        for index in range(start, len(text)):
            if text[index] == "(":
                depth += 1
            elif text[index] == ")":
                depth -= 1
                if depth == 0:
                    return text[start:index + 1]
        return None

    seen: set[str] = set()
    block = span(symbol)
    while block is not None:
        extends = re.search(r'\(extends "([^"]+)"', block)
        if not extends or extends.group(1) in seen:
            break
        seen.add(extends.group(1))
        block = span(extends.group(1))
    if block is None:
        return {}
    names: dict[str, str] = {}
    for match in re.finditer(r"\(pin\s+(\S+)\s+\S+\s*\n", block):
        depth = 0
        for index in range(match.start(), len(block)):
            if block[index] == "(":
                depth += 1
            elif block[index] == ")":
                depth -= 1
                if depth == 0:
                    break
        segment = block[match.start():index + 1]
        name = re.search(r'\(name "([^"]*)"', segment)
        number = re.search(r'\(number "([^"]*)"', segment)
        if number:
            names[number.group(1)] = (name.group(1) if name and name.group(1) else "OUT")
    return names


def check_amplifier_symbols(symbols: dict[str, list[Symbol]]) -> None:
    """Guard against ordering a package whose pinout differs from the symbol.

    TLV9001 ships two pinouts (SBOS833R Table 6-1): DBV SOT-23 and T-DCK put
    OUT on pin 1, while DCK SC70, DRL and U-DBV put IN+ there.  KiCad only
    ships the DCK variant, so a stock ``TLV9001IDCK`` symbol against an ordered
    DBV part draws the amplifier with input and output swapped and points ERC at
    the wrong pins.  The same trap exists for any 5-pin single amplifier.
    """
    print("\n[9] Amplifier symbols match the ordered package pinout")
    for ref in ("U32", "U37"):
        if ref not in symbols:
            continue
        symbol = symbols[ref][0]
        names = library_pin_names(symbol.lib_id)
        if not names:
            info(f"{ref}: symbol library unavailable, skipping")
            continue
        pin1 = names.get("1", "?")
        check(pin1 in ("OUT", "~"),
              f"{ref} ({symbol.value}) has the output on pin 1, not '{pin1}' "
              f"[symbol {symbol.lib_id}]")
        check(names.get("3") == "+" and names.get("4") == "-",
              f"{ref} has IN+ on pin 3 and IN- on pin 4 "
              f"(symbol says {names.get('3')} / {names.get('4')})")
        if "DBV" in (symbol.mpn or "").upper() or "DBV" in symbol.footprint.upper() \
                or "SOT-23-5" in symbol.footprint:
            check(pin1 in ("OUT", "~"),
                  f"{ref} orders a SOT-23-5/DBV package, so the symbol must use "
                  "the DBV pinout")


def check_golden_netlist(pin_net: dict, contract: dict) -> None:
    """Fail on any connectivity change not deliberately blessed.

    The wiring work replaces pin labels with drawn wires.  That must not alter a
    single connection, so the exported netlist is diffed against a committed
    snapshot.  Regenerate the snapshot only when a change is intended:
    ``python3 check_design.py --update-golden``.
    """
    print("\n[10] Netlist matches the golden snapshot")
    if not GOLDEN.exists():
        info("no netlist-golden.json committed; skipping")
        return
    golden = json.loads(GOLDEN.read_text(encoding="utf-8"))
    current = {f"{ref}.{pin}": net for (ref, pin), net in pin_net.items()}
    added = sorted(set(current) - set(golden))
    removed = sorted(set(golden) - set(current))
    changed = sorted(k for k in set(golden) & set(current) if golden[k] != current[k])
    check(not removed, f"no pin lost its connection ({len(removed)} lost)"
          + (f": {', '.join(removed[:8])}" if removed else ""))
    check(not added, f"no pin gained an unexpected connection ({len(added)} new)"
          + (f": {', '.join(added[:8])}" if added else ""))
    check(not changed, f"no pin changed net ({len(changed)} changed)"
          + (f": {', '.join(f'{k}: {golden[k]}->{current[k]}' for k in changed[:6])}"
             if changed else ""))
    info(f"{len(current)} pin->net entries compared against the snapshot")


def main() -> int:
    print(f"Lune V6 Rev 3.2 design checks ({len(SHEETS)} sheets)")
    if not SHEETS:
        print("  FAIL  no generated schematic sheets found")
        return 1
    contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    symbols = load_symbols()
    labels, plain = load_labels()
    pin_net, net_pins = load_netlist()

    check_labels(labels, plain, net_pins)
    check_placements(symbols, contract)
    check_fabrication_attributes(symbols)
    check_sourcing(symbols, contract)
    if not pin_net:
        print("\n  FAIL  lune-v6-rev3.2.net is missing; regenerate it with kicad-cli")
        failures.append("netlist missing")
    else:
        check_gpio(pin_net, contract)
        check_decoder(pin_net, contract)
        check_safety_topology(pin_net, net_pins, symbols, contract)
    check_analog_numbers(contract)
    check_amplifier_symbols(symbols)
    if pin_net:
        check_golden_netlist(pin_net, contract)

    print()
    if failures:
        print(f"{len(failures)} check(s) failed:")
        for message in failures:
            print(f"  - {message}")
        return 1
    print("All design checks passed.")
    return 0


if __name__ == "__main__":
    if "--update-golden" in sys.argv:
        _pin_net, _ = load_netlist()
        if not _pin_net:
            print("no netlist to snapshot; export it with kicad-cli first")
            sys.exit(1)
        GOLDEN.write_text(
            json.dumps({f"{r}.{p}": n for (r, p), n in _pin_net.items()},
                       indent=0, sort_keys=True) + "\n", encoding="utf-8")
        print(f"netlist-golden.json updated: {len(_pin_net)} pin->net entries")
        sys.exit(0)
    sys.exit(main())
