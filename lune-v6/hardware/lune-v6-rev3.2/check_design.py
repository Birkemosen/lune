#!/usr/bin/env python3
"""Lune V6 Rev 3.2 design checks, read from the EasyEDA Pro project.

EasyEDA Pro is the source of truth for Rev 3.2.  The KiCad schematic that the
first Rev 3.2 ECOs were authored in was deleted once layout moved here; it
survives in git history and in ``design-contract.json`` under
``designator_history``, which maps every KiCad reference to the designator the
board actually carries.  Nothing in this folder reads KiCad any more.

This script reads the board, not a schematic export.  That is deliberate: the
PCB document is the artefact that becomes Gerbers, and every defect class this
gate exists to catch - a wrong comparator input, a fault source that stopped
reaching the latch, a copper-only pad that would be ordered and placed - is a
property of what gets fabricated.  Checking the schematic instead would let a
schematic/PCB divergence pass, which is exactly what happened while both KiCad
and EasyEDA were live.

The project file is a SQLite database.  Each document's ``dataStr`` is a
gzip'd, base64'd stream of one JSON array per line.  We only read it; the
editor owns writes.

Usage:
    python3 check_design.py
    python3 check_design.py --update-golden
"""

from __future__ import annotations

import base64
import collections
import gzip
import json
import math
import re
import sqlite3
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTRACT_PATH = ROOT / "design-contract.json"
GOLDEN = ROOT / "netlist-golden.json"

MIL = 25.4 / 1000.0  # EasyEDA Pro stores PCB geometry in mils

failures: list[str] = []


def check(condition: bool, message: str) -> bool:
    print(f"  {'ok  ' if condition else 'FAIL'}  {message}")
    if not condition:
        failures.append(message)
    return condition


def info(message: str) -> None:
    print(f"  --    {message}")


_OHM_SUFFIX = {"m": 1e-3, "": 1.0, "k": 1e3, "K": 1e3, "M": 1e6, "R": 1.0}


def parse_ohms(value: str) -> float | None:
    """'23.7kΩ' -> 23700.0.  Returns None if the string is not a resistance.

    The project stores a machine-readable Value on every passive, which is the
    only field a sourcing swap cannot change without changing the part: an MPN
    allowlist would need editing on every substitution, and parsing the MPN is
    manufacturer-specific.
    """
    match = re.fullmatch(r"\s*([0-9.]+)\s*([mkKMR]?)\s*(?:Ω|ohm|R)?\s*", value or "")
    if not match:
        return None
    try:
        return float(match.group(1)) * _OHM_SUFFIX[match.group(2)]
    except (ValueError, KeyError):
        return None


def close(actual: float, expected: float, tolerance: float = 0.01) -> bool:
    if expected == 0:
        return abs(actual) <= tolerance
    return abs(actual - expected) / abs(expected) <= tolerance


# --------------------------------------------------------------------------- #
# EasyEDA Pro project reader
# --------------------------------------------------------------------------- #

# ESP32-S3-WROOM-1 module pad -> GPIO number, from the module datasheet.  Pads
# that are not GPIOs map to their rail name.  This table is the only place the
# module's physical pinout is encoded; the contract holds signal -> GPIO and the
# board holds pad -> net, and check_gpio joins the three.
MODULE_PAD_GPIO: dict[int, int | str] = {
    1: "GND", 2: "3V3", 3: "EN",
    4: 4, 5: 5, 6: 6, 7: 7, 8: 15, 9: 16, 10: 17, 11: 18, 12: 8,
    13: 19, 14: 20, 15: 3, 16: 46, 17: 9, 18: 10, 19: 11, 20: 12,
    21: 13, 22: 14, 23: 21, 24: 47, 25: 48, 26: 45, 27: 0,
    28: 35, 29: 36, 30: 37, 31: 38, 32: 39, 33: 40, 34: 41, 35: 42,
    36: 44, 37: 43, 38: 2, 39: 1, 40: "GND", 41: "GND",
}

# 74HC4514 TSSOP-24: output Q index -> pin number.
DECODER_Q_PIN = {0: 11, 1: 9, 2: 10, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4,
                 8: 18, 9: 17, 10: 20, 11: 19, 12: 14, 13: 13, 14: 16, 15: 15}


@dataclass
class Part:
    """One placement on the PCB, joined with its library device."""

    uid: str
    designator: str
    device: str
    mpn: str
    lcsc: str
    value: str
    in_bom: bool
    layer: int
    x: float
    y: float
    rotation: float
    symbol_uuid: str | None
    footprint_name: str
    pads: dict[str, str] = field(default_factory=dict)

    @property
    def nets(self) -> set[str]:
        return {n for n in self.pads.values() if n}


class Project:
    def __init__(self, path: Path, pcb_document: str | None = None):
        self.path = path
        self.con = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
        self.devices = {u: t for u, t in
                        self.con.execute("select uuid, display_title from devices")}
        self.footprints = {u: t for u, t in
                           self.con.execute("select uuid, display_title from components")}
        self.attrs: dict[str, dict[str, str]] = collections.defaultdict(dict)
        for key, value, device_uuid in self.con.execute(
                "select key, value, device_uuid from attributes"):
            self.attrs[device_uuid][key] = value

        self.documents: dict[str, tuple[int, list]] = {}
        for uuid, title, doctype in self.con.execute(
                "select uuid, title, docType from documents order by sheet_id"):
            self.documents[title] = (doctype, self._records(uuid, "documents"))

        self.schematic_sheets = sorted(t for t, (d, _) in self.documents.items() if d == 1)
        self.pcb_documents = sorted(t for t, (d, _) in self.documents.items() if d == 3)
        self.pcb_name = pcb_document or (self.pcb_documents[-1] if self.pcb_documents else "")
        if self.pcb_name not in self.documents:
            raise SystemExit(f"PCB document {self.pcb_name!r} not in project "
                             f"(have: {', '.join(self.pcb_documents)})")

        self.pcb: dict[str, list] = collections.defaultdict(list)
        for record in self.documents[self.pcb_name][1]:
            self.pcb[record[0]].append(record)
        self.instance_overrides = self._load_instance_overrides()
        self.parts = self._load_parts()

    def _load_instance_overrides(self) -> dict[str, dict[str, str]]:
        """designator -> per-instance field overrides, from the schematic sheets.

        A field like ``Add into BOM`` exists in two places: on the library device
        (the ``attributes`` table, shared by every placement of that device) and
        as a per-instance override on the schematic symbol.  Reading only the
        device attribute is wrong and quietly so - it reports every test point
        and both JST headers as BOM-included while the schematic excludes them
        individually, which is the opposite of the truth and would have failed
        the gate on twelve items that were already correct.

        Schematic ATTR records are ``[ATTR, id, owner, key, value, ...]`` - the
        symbol-document layout, not the PCB one.  Instance fields are grouped by
        owner and keyed back to the designator, which is unique across sheets.
        """
        out: dict[str, dict[str, str]] = {}
        for title, (doctype, records) in self.documents.items():
            if doctype != 1:  # schematic sheets only
                continue
            by_owner: dict[str, dict[str, str]] = collections.defaultdict(dict)
            for record in records:
                if record[0] == "ATTR" and len(record) > 4 and record[2]:
                    by_owner[record[2]][record[3]] = record[4]
            for fields in by_owner.values():
                designator = fields.get("Designator")
                if designator:
                    out.setdefault(str(designator), {}).update(fields)
        return out

    # -- raw document access ------------------------------------------------ #

    def _records(self, uuid: str, table: str) -> list:
        row = self.con.execute(
            f"select dataStr from {table} where uuid = ?", (uuid,)).fetchone()
        if not row or not row[0]:
            return []
        blob = row[0]
        if blob.startswith("base64"):
            blob = gzip.decompress(base64.b64decode(blob[len("base64"):])).decode("utf-8")
        out = []
        for line in blob.splitlines():
            line = line.strip()
            if line:
                try:
                    out.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return out

    def symbol_pins(self, symbol_uuid: str | None) -> dict[str, str]:
        """pin number -> pin name, from the device's schematic symbol.

        A symbol document's ATTR record is ``[ATTR, id, owner, key, value, ...]``
        - note this is NOT the PCB document's ATTR layout, which carries the key
        at index 7.  Getting the two confused silently yields an empty map, so
        callers must treat ``{}`` as "unavailable" and not as "no pins".
        """
        if not symbol_uuid:
            return {}
        names: dict[str, str] = {}
        numbers: dict[str, str] = {}
        for record in self._records(symbol_uuid, "components"):
            if record[0] == "ATTR" and len(record) > 4 and record[2]:
                if record[3] == "NAME":
                    names[record[2]] = record[4]
                elif record[3] == "NUMBER":
                    numbers[record[2]] = record[4]
        return {numbers[pin]: names.get(pin, "?") for pin in numbers}

    # -- placements --------------------------------------------------------- #

    def _load_parts(self) -> dict[str, Part]:
        raw: dict[str, dict] = {}
        for record in self.pcb["COMPONENT"]:
            raw[record[1]] = {"layer": record[3], "x": record[4] * MIL,
                              "y": record[5] * MIL, "rot": record[6], "fields": {}}
        # PCB ATTR: [ATTR, id, ?, owner, layer, x, y, key, value, ...]
        for record in self.pcb["ATTR"]:
            owner = record[3]
            if owner in raw:
                raw[owner]["fields"][record[7]] = record[8]
        pads: dict[str, dict[str, str]] = collections.defaultdict(dict)
        for record in self.pcb["PAD_NET"]:
            pads[record[1]][record[2]] = record[3]

        parts: dict[str, Part] = {}
        for uid, data in raw.items():
            fields = data["fields"]
            device_uuid = fields.get("Device")
            designator = str(fields.get("Designator", "?"))
            # Per-instance schematic overrides win over the shared library device.
            attrs = dict(self.attrs.get(device_uuid, {}))
            attrs.update(self.instance_overrides.get(designator, {}))
            parts[designator] = Part(
                uid=uid,
                designator=designator,
                device=self.devices.get(device_uuid, "?"),
                mpn=(attrs.get("Manufacturer Part") or "").strip(),
                lcsc=(attrs.get("Supplier Part") or "").strip(),
                value=(attrs.get("Value") or "").strip(),
                in_bom=(attrs.get("Add into BOM", "yes").strip().lower() == "yes"),
                layer=data["layer"],
                x=data["x"],
                y=data["y"],
                rotation=data["rot"],
                symbol_uuid=attrs.get("Symbol"),
                footprint_name=self.footprints.get(fields.get("Footprint"), "?"),
                pads=dict(pads.get(uid, {})),
            )
        return parts

    # -- derived views ------------------------------------------------------ #

    def pin_net(self) -> dict[tuple[str, str], str]:
        return {(p.designator, pad): net
                for p in self.parts.values() for pad, net in p.pads.items() if net}

    def net_pins(self) -> dict[str, set[tuple[str, str]]]:
        out: dict[str, set[tuple[str, str]]] = collections.defaultdict(set)
        for (designator, pad), net in self.pin_net().items():
            out[net].add((designator, pad))
        return out

    def no_connect_pads(self) -> set[tuple[str, str]]:
        return {(p.designator, pad)
                for p in self.parts.values() for pad, net in p.pads.items() if not net}

    def outline_bounds(self) -> tuple[float, float, float, float]:
        """(x_min, y_min, x_max, y_max) of the board outline, in mm.

        The origin is not the south-west corner and must not be assumed to be:
        extending the south edge moved y_min to -2 while everything else kept its
        coordinate.  Deriving edge distances from width/height instead of from
        these bounds measures against edges that are not there - which passed the
        antenna-cutout check for the wrong reason and mis-measured every
        copper-to-edge distance by the same offset.
        """
        points, _, _ = self.outline()
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        return (min(xs), min(ys), max(xs), max(ys)) if points else (0.0, 0.0, 0.0, 0.0)

    def outline(self) -> tuple[list[tuple[float, float]], float, float]:
        points: list[tuple[float, float]] = []
        for record in self.pcb["POLY"] + self.pcb["LINE"]:
            if record[4] != 11:
                continue
            tokens = record[6] if record[0] == "POLY" else record[5:9]
            numbers = [t for t in tokens if isinstance(t, (int, float))]
            points += [(numbers[i] * MIL, numbers[i + 1] * MIL)
                       for i in range(0, len(numbers) - 1, 2)]
        if not points:
            return [], 0.0, 0.0
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        return points, max(xs) - min(xs), max(ys) - min(ys)

    def mounting_holes(self) -> list[tuple[float, float]]:
        # Standalone PADs (not owned by a COMPONENT) on the multi layer are the
        # mounting holes; every other pad belongs to a placement.
        return sorted((round(r[6] * MIL, 3), round(r[7] * MIL, 3))
                      for r in self.pcb["PAD"] if r[4] == 12)


# --------------------------------------------------------------------------- #
# Checks
# --------------------------------------------------------------------------- #


def check_project(project: Project, contract: dict) -> None:
    print("\n[1] Project and net integrity")
    pcb = contract["pcb"]

    check(len(project.pcb_documents) == 1,
          f"exactly one PCB document in the project "
          f"(found {len(project.pcb_documents)}: {', '.join(project.pcb_documents)})")
    check(project.pcb_name == pcb["document"],
          f"checking the PCB document the contract names ({pcb['document']})")
    expected_sheets = contract["pcb"]["schematic_sheets"]
    check(project.schematic_sheets == sorted(expected_sheets),
          f"schematic sheets match the contract ({', '.join(project.schematic_sheets)})")

    net_pins = project.net_pins()
    orphans = sorted(net for net, pins in net_pins.items() if len(pins) < 2)
    check(not orphans, f"every net reaches at least two pads ({len(orphans)} orphaned)"
          + (f": {', '.join(orphans[:8])}" if orphans else ""))

    # An unnamed net is a net the documentation cannot refer to.  Six of these
    # survived the KiCad-to-EasyEDA move because the labels lived on the KiCad
    # sheets, not in the imported schematic - including USB_DM/USB_DP on the
    # connector side, which the layout audit measures by name.
    unnamed = sorted(n for n in net_pins if n.startswith("$"))
    wanted = contract["pcb"].get("required_net_names", {})
    detail = ", ".join(f"{n} -> {wanted.get(n, 'name it')}" for n in unnamed)
    check(not unnamed,
          f"every net carries a name, not an editor-generated id ({len(unnamed)} unnamed)"
          + (f": {detail}" if unnamed else ""))

    declared = {tuple(pad) for pad in contract["pcb"]["declared_no_connect_pads"]}
    actual = project.no_connect_pads()
    undeclared = sorted(actual - declared)
    stale = sorted(declared - actual)
    check(not undeclared,
          f"every unconnected pad is declared in the contract ({len(undeclared)} undeclared)"
          + (f": {', '.join(f'{r}.{p}' for r, p in undeclared[:10])}" if undeclared else ""))
    check(not stale, "no stale entries in declared_no_connect_pads"
          + (f" ({', '.join(f'{r}.{p}' for r, p in stale)})" if stale else ""))
    info(f"{len(net_pins)} nets, {len(project.pin_net())} pad->net entries, "
         f"{len(actual)} declared no-connects")


def copper_only_refs(project: Project, contract: dict) -> set[str]:
    """Designators that are bare copper, not parts.

    Classified by library device plus an explicit ref list, never by a hardcoded
    designator list: test-point designators get renamed, and a list would turn
    every rename into a false failure on the placement count, sourcing and BOM
    checks at once.
    """
    devices = set(contract["copper_only_devices"])
    return ({d for d, part in project.parts.items() if part.device in devices}
            | set(contract["copper_only_refs"]))


def check_placements(project: Project, contract: dict) -> None:
    print("\n[2] Placement accounting")
    copper_only = copper_only_refs(project, contract)
    populated = sorted(d for d in project.parts if d not in copper_only)
    pads = sorted(d for d in project.parts if d in copper_only)

    missing = sorted(set(contract["copper_only_refs"]) - set(project.parts))
    check(not missing, "every explicitly declared copper-only ref exists on the board"
          + (f" (absent: {', '.join(missing)})" if missing else ""))

    info(f"populated {len(populated)} | copper-only pads {len(pads)} | "
         f"mounting holes {len(project.mounting_holes())}")
    check(len(populated) == contract["populated_placement_board_count"],
          f"populated count {len(populated)} matches contract "
          f"populated_placement_board_count "
          f"{contract['populated_placement_board_count']}")
    check(contract["populated_placement_projection"]
          == contract["populated_placement_board_count"],
          "contract projection equals the board count")
    check(contract["driver"]["drv8411_populated_placements"] == len(populated),
          f"contract drv8411_populated_placements "
          f"{contract['driver']['drv8411_populated_placements']} matches {len(populated)}")
    check(len(pads) == contract["copper_only_pads"],
          f"copper-only pad count {len(pads)} matches contract {contract['copper_only_pads']}")
    check(len(project.mounting_holes()) == contract["mechanical_items"],
          f"mounting hole count {len(project.mounting_holes())} matches contract "
          f"{contract['mechanical_items']}")

    # The board adds one ferrite per motor terminal on top of the analog rail
    # bead.  They are series elements in the motor loop, so their count and DCR
    # belong in the contract rather than being discovered from the BOM.
    ferrite = contract["motor_output_ferrites"]
    beads = sorted(d for d, p in project.parts.items() if p.mpn == ferrite["part"])
    motor_beads = sorted(set(beads) - set(ferrite["rail_filter_refs"]))
    check(len(motor_beads) == ferrite["count"],
          f"{len(motor_beads)} motor-output ferrites match contract {ferrite['count']}")
    check(sorted(ferrite["refs"]) == motor_beads,
          "motor-output ferrite designators match the contract"
          + ("" if sorted(ferrite["refs"]) == motor_beads else f" (board: {motor_beads})"))


def check_fabrication_attributes(project: Project, contract: dict) -> None:
    print("\n[3] Fabrication attributes and designator hygiene")
    copper_only = copper_only_refs(project, contract)

    # A copper-only pad in the BOM is a part JLCPCB will buy and place.  This is
    # exactly design-review finding B5, which the KiCad generator fixed with
    # native (dnp yes); on this side the equivalent switch is "Add into BOM".
    wrongly_in_bom = sorted(d for d in copper_only
                            if d in project.parts and project.parts[d].in_bom)
    check(not wrongly_in_bom,
          "copper-only pads are excluded from the BOM"
          + (f" (still in BOM: {', '.join(wrongly_in_bom)})" if wrongly_in_bom else ""))

    excluded_but_populated = sorted(d for d, p in project.parts.items()
                                   if not p.in_bom and d not in copper_only)
    check(not excluded_but_populated,
          "no populated part is excluded from the BOM"
          + (f" ({', '.join(excluded_but_populated)})" if excluded_but_populated else ""))

    # JLCPCB matches BOM to CPL on the designator string, and a BOM line lists
    # several designators separated by commas.  Whitespace or a comma inside a
    # designator therefore mis-associates or splits a line - this is
    # fabrication-breaking, not cosmetic.  The rest of the character set is not:
    # hyphens and underscores travel fine, so a semantic name like
    # TP-VBUS_PROTECTED is a legitimate choice and more use on a silkscreen and
    # in a test procedure than a serial number would be.
    unsafe = sorted(d for d in project.parts if re.search(r"[\s,;]", d))
    check(not unsafe, "no designator contains whitespace, a comma or a semicolon"
          + (f" ({', '.join(repr(d) for d in unsafe)})" if unsafe else ""))

    bad_chars = sorted(d for d in project.parts if not re.fullmatch(r"[A-Za-z0-9_-]+", d))
    check(not bad_chars, "every designator uses only letters, digits, hyphen and underscore"
          + (f" ({', '.join(repr(d) for d in bad_chars)})" if bad_chars else ""))

    # A bare prefix with nothing after it ("TP", "R") is a placeholder that was
    # never finished.  This is the real case the old ends-in-a-digit rule was
    # reaching for; the contract's naming convention decides the rest.
    exceptions = set(contract["pcb"]["designator_exceptions"])
    placeholders = sorted(d for d in project.parts
                          if d not in exceptions and re.fullmatch(r"[A-Za-z]+", d))
    check(not placeholders, "no designator is a bare prefix with nothing after it"
          + (f" ({', '.join(repr(d) for d in placeholders)})" if placeholders else ""))

    # Duplicates are a genuine fabrication defect - an ambiguous BOM and CPL row -
    # and this reader keys placements by designator, so a duplicate would silently
    # collapse into one and be invisible to every other check in this script.
    total = len(project.pcb["COMPONENT"])
    check(total == len(project.parts),
          f"every placement has a unique designator ({total} placements, "
          f"{len(project.parts)} distinct designators)")

    single_sided = contract["pcb"]["single_sided_assembly"]
    bottom = sorted(d for d, p in project.parts.items() if p.layer != 1)
    check(bool(single_sided) == (not bottom),
          f"assembly is single-sided as contracted ({len(bottom)} parts on the bottom)"
          + (f": {', '.join(bottom)}" if bottom else ""))


def check_sourcing(project: Project, contract: dict) -> None:
    print("\n[4] Sourcing")
    copper_only = copper_only_refs(project, contract)
    allowed = set(contract.get("open_sourcing_items", []))
    missing_lcsc = sorted(d for d, p in project.parts.items()
                          if d not in copper_only and not p.lcsc)
    missing_mpn = sorted(d for d, p in project.parts.items()
                         if d not in copper_only and not p.mpn)
    unexpected = [d for d in missing_lcsc if d not in allowed]
    check(not unexpected,
          "every populated part has an LCSC number or is a declared open item"
          + (f" (unsourced: {', '.join(unexpected)})" if unexpected else ""))
    check(not missing_mpn, "every populated part has a manufacturer part number"
          + (f" ({', '.join(missing_mpn)})" if missing_mpn else ""))
    stale = sorted(allowed - set(missing_lcsc))
    check(not stale, "no stale entries in open_sourcing_items"
          + (f" ({', '.join(stale)})" if stale else ""))

    # One MPN reaching the board under two LCSC codes means two feeders were
    # loaded for one line item.
    by_mpn: dict[str, set[str]] = collections.defaultdict(set)
    for part in project.parts.values():
        if part.mpn:
            by_mpn[part.mpn].add(part.lcsc)
    split = sorted(m for m, codes in by_mpn.items() if len(codes) > 1)
    check(not split, "each manufacturer part maps to exactly one LCSC code"
          + (f" ({', '.join(split)})" if split else ""))
    info(f"{len(by_mpn)} distinct manufacturer parts across "
         f"{len(project.parts) - len(copper_only)} populated placements")


def check_gpio(project: Project, contract: dict) -> None:
    print("\n[5] ESP32 GPIO contract")
    module = contract["designators"]["module"]
    part = project.parts.get(module)
    if part is None:
        check(False, f"module placement {module} exists on the board")
        return

    wanted = {signal: int(gpio) for signal, gpio in contract["gpio"].items()}
    seen: dict[str, int] = {}
    for pad, net in part.pads.items():
        gpio = MODULE_PAD_GPIO.get(int(pad))
        if isinstance(gpio, int) and net:
            seen[net] = gpio

    for signal, gpio in sorted(wanted.items(), key=lambda item: item[1]):
        check(seen.get(signal) == gpio,
              f"{signal} is on GPIO{gpio}"
              + ("" if seen.get(signal) == gpio else f" (board: {seen.get(signal)})"))

    strays = sorted(net for net, gpio in seen.items()
                    if net not in wanted and net not in contract["gpio_untracked_nets"])
    check(not strays, "no undeclared signal sits on a module GPIO"
          + (f" ({', '.join(strays)})" if strays else ""))

    if contract.get("adc1_reserved_for_analog"):
        analog_ok = {"ADC_CURRENT", "ADC_TACHO", "ADC_BEMF"}
        exceptions = contract.get("adc1_digital_exceptions", {}) or {}
        squatters = sorted(f"{sig} on GPIO{gpio}" for sig, gpio in wanted.items()
                           if 1 <= gpio <= 10 and sig not in analog_ok
                           and sig not in exceptions)
        check(not squatters,
              "no undeclared digital signal occupies an ADC1 channel (GPIO1-10)"
              + (f" ({', '.join(squatters)})" if squatters else ""))
        for signal in sorted(exceptions):
            gpio = wanted.get(signal)
            check(gpio is not None and 1 <= gpio <= 10,
                  f"ADC1 exception {signal} is still on an ADC1 channel"
                  + ("" if gpio is not None and 1 <= gpio <= 10
                     else f" (now GPIO{gpio}) - drop it from adc1_digital_exceptions"))
        spare = sorted(set(range(1, 11)) - set(wanted.values()) - {3})
        info("ADC1 spare channels (GPIO3 excluded, strapping): "
             + ", ".join(f"GPIO{g}" for g in spare))

    forbidden = set(contract["forbidden_motor_control_gpio"])
    motor_signals = {"MOTOR_ADDR0", "MOTOR_ADDR1", "MOTOR_ADDR2", "MOTOR_ADDR3",
                     "MOTOR_ENABLE", "LATCH_ARM", "LATCH_STATE", "ADC_CURRENT",
                     "ADC_TACHO", "COMM_TACHO_N"}
    clash = sorted(s for s in motor_signals if wanted.get(s) in forbidden)
    check(not clash, "no motor-control signal uses a forbidden GPIO"
          + (f" ({', '.join(clash)})" if clash else ""))


def check_decoder(project: Project, contract: dict) -> None:
    print("\n[6] One-hot decoder mapping")
    decoder = contract["decoder"]
    ref = contract["designators"]["decoder"]
    pin_net = project.pin_net()
    no_connect = project.no_connect_pads()

    for index, q in enumerate(decoder["connected_forward_outputs"], 1):
        check(pin_net.get((ref, str(DECODER_Q_PIN[q]))) == f"FWD{index}",
              f"decoder Q{q} (pin {DECODER_Q_PIN[q]}) drives FWD{index}")
    for index, q in enumerate(decoder["connected_reverse_outputs"], 1):
        check(pin_net.get((ref, str(DECODER_Q_PIN[q]))) == f"REV{index}",
              f"decoder Q{q} (pin {DECODER_Q_PIN[q]}) drives REV{index}")

    unused = sorted(set(range(16)) - set(decoder["connected_forward_outputs"])
                    - set(decoder["connected_reverse_outputs"]))
    dangling = [q for q in unused
                if (ref, str(DECODER_Q_PIN[q])) not in no_connect
                and (ref, str(DECODER_Q_PIN[q])) in pin_net]
    check(not dangling,
          f"decoder {'/'.join('Q%d' % q for q in unused)} reach no bridge input"
          + (f" (connected: {dangling})" if dangling else ""))
    check(sorted(decoder["unreachable_addresses"]) == unused,
          f"contract unreachable_addresses matches the unconnected outputs {unused}")
    check(pin_net.get((ref, "1")) == decoder["latch_enable_net"],
          f"decoder LE is {decoder['latch_enable_net']}")
    check(pin_net.get((ref, "23")) == "DECODER_INHIBIT",
          "decoder active-high inhibit is DECODER_INHIBIT")


def check_safety_topology(project: Project, contract: dict) -> None:
    print("\n[7] Safety-net topology invariants")
    d = contract["designators"]
    pin_net = project.pin_net()
    net_pins = project.net_pins()
    comparator = d["comparator"]
    latch = d["fault_latch"]

    # Rail overcurrent comparator must see the unfiltered shunt amplifier
    # output, not the 1k/100n ADC node (100 us of avoidable trip delay).
    check(pin_net.get((comparator, "2")) == "CURRENT_RAW",
          "rail comparator inverting input senses CURRENT_RAW")
    check(pin_net.get((comparator, "3")) == "FLIM_REF",
          "rail comparator non-inverting input is FLIM_REF")
    check(pin_net.get((comparator, "1")) == "FAULT_N_RAW",
          "rail comparator output joins the wired-AND fault net")

    # Tacho comparator hysteresis must be positive feedback into the signal
    # (non-inverting) input.  Feeding it to the threshold input makes a
    # relaxation oscillator, which was the Rev3.2-A defect (design-review B1).
    signal_net = pin_net.get((comparator, "5"))
    threshold_net = pin_net.get((comparator, "6"))
    output_net = pin_net.get((comparator, "7"))
    check(output_net == "COMM_TACHO_N", "tacho comparator output is COMM_TACHO_N")
    check(threshold_net == "TACHO_REF",
          f"tacho comparator threshold input is the fixed reference (is {threshold_net})")
    feedback = {ref for ref, _ in net_pins.get(output_net or "", set())
                if ref.startswith("R")}
    hysteresis = sorted(ref for ref in feedback
                        if signal_net in project.parts[ref].nets)
    check(bool(hysteresis),
          "a hysteresis resistor bridges the tacho comparator output to its "
          f"non-inverting input ({', '.join(hysteresis) or 'none found'})")
    wrong = sorted(ref for ref in feedback
                   if threshold_net in project.parts[ref].nets)
    check(not wrong,
          "no feedback path from the tacho comparator output to its threshold input"
          + (f" ({', '.join(wrong)})" if wrong else ""))

    # The 74HC4060 max-on-time watchdog was removed by hazard assessment, not
    # dropped.  Guard the removal by DEVICE, not by designator: the EasyEDA
    # scheme reuses R27, R28 and C25 for unrelated parts, so a designator-based
    # guard would either false-fail or stop guarding.
    hazard = contract["actuator_overrun_hazard"]
    check(hazard["decision"] == "NO_HARDWARE_MAX_ON_TIME",
          "actuator overrun hazard declares no hardware max-on-time")
    banned = [pattern.upper() for pattern in hazard["removed_devices"]]
    readded = sorted(f"{p.designator} ({p.mpn})" for p in project.parts.values()
                     if any(b in (p.mpn or "").upper() or b in (p.device or "").upper()
                            for b in banned))
    check(not readded, "no removed runtime-cutoff device is back on the board"
          + (f" ({', '.join(readded)})" if readded else ""))
    revived = sorted(n for n in hazard["removed_nets"] if n in net_pins)
    check(not revived, "no removed runtime-cutoff net is back on the board"
          + (f" ({', '.join(revived)})" if revived else ""))

    # FAULT_N_RAW is a wired-AND with five contributors and exactly one
    # consumer.  Deleting that consumer would silently strand the rail
    # comparator, all three DRV8411 nFAULT outputs and the TPS2553 fault pin.
    fault_pins = net_pins.get("FAULT_N_RAW", set())
    check((latch, "6") in fault_pins,
          "the fault latch async reset is the consumer of FAULT_N_RAW")
    expected_sources = set(contract["fault_latch"]["fault_source_refs"])
    sources = {ref for ref, _ in fault_pins}
    check(sources >= expected_sources,
          "every fault source still reaches FAULT_N_RAW "
          f"(missing: {', '.join(sorted(expected_sources - sources)) or 'none'})")

    check(pin_net.get((latch, "6")) == "FAULT_N_RAW", "latch async reset is FAULT_N_RAW")
    check(pin_net.get((latch, "5")) == "DRIVER_N_SLEEP", "latch Q is DRIVER_N_SLEEP")
    check(pin_net.get((latch, "3")) == "LATCH_STATE", "latch /Q is LATCH_STATE")
    check(pin_net.get((d["arm_clamp"], "1")) == "MOTOR_ENABLE",
          "arm-clock clamp is gated by MOTOR_ENABLE")

    for ref in d["drivers"]:
        check(pin_net.get((ref, "1")) == "DRIVER_N_SLEEP",
              f"{ref} nSLEEP is the latched drive permit")
        check(pin_net.get((ref, "8")) == "FAULT_N_RAW", f"{ref} nFAULT joins the fault net")
        check(pin_net.get((ref, "12")) == "3V3_MOTOR", f"{ref} VM is the shunted motor rail")
        # DRV8411 integrates its charge-pump and regulator capacitors, so pins
        # 11 and 14 are NC.  A net there means someone fitted DRV8833 parts.
        if contract["driver"]["pins_11_and_14_must_stay_open"]:
            open_pins = [p for p in ("11", "14") if not project.parts[ref].pads.get(p)]
            check(open_pins == ["11", "14"], f"{ref} pins 11 and 14 stay open")

    # The external service connector must not tap the MCU rail directly.
    onewire = d["onewire_connector"]
    supply = pin_net.get((onewire, "1"))
    check(supply not in (None, "3V3_LOGIC"),
          f"1-wire connector supply pin is a protected branch (is {supply})")
    branch = {ref for ref, _ in net_pins.get(supply or "", set())}
    check(any(r.startswith("R") for r in branch),
          "the 1-wire supply branch includes a series element")
    check(any(r.startswith("D") for r in branch),
          "the 1-wire supply branch includes a local TVS")

    # I2C pull-ups are mandatory: without them SDA and SCL float on the ESP32
    # whenever no display is fitted.
    i2c = contract["i2c_bus"]
    if i2c["pull_ups_are_mandatory"]:
        for signal in ("I2C_SDA", "I2C_SCL"):
            pullups = sorted(ref for ref, _ in net_pins.get(signal, set())
                             if ref in i2c["pull_up_refs"])
            check(bool(pullups), f"{signal} carries a bus pull-up ({', '.join(pullups)})")

    # Every motor terminal gets a TVS at the connector and a ferrite inboard of
    # it.  Checking the order matters: a bead between the strike and the clamp
    # would present the strike to the clamp through an inductor.
    esd = contract["motor_esd"]
    for channel in range(1, contract["motor_channels"] + 1):
        for side in ("A", "B"):
            net = f"MOTOR_{channel}{side}_J"
            refs = {ref for ref, _ in net_pins.get(net, set())}
            has_tvs = any(project.parts[r].mpn == esd["part"] for r in refs
                          if r in project.parts)
            has_bead = any(project.parts[r].mpn
                           == contract["motor_output_ferrites"]["part"]
                           for r in refs if r in project.parts)
            check(has_tvs and has_bead,
                  f"{net} has its TVS and ferrite on the connector side"
                  + ("" if has_tvs and has_bead
                     else f" (tvs={has_tvs}, ferrite={has_bead})"))


def check_connectors(project: Project, contract: dict) -> None:
    print("\n[8] Connector pinouts as built")
    pin_net = project.pin_net()

    # The motor connector pinout is a cable contract, not an internal detail.
    # 4P4C cords are normally reversing (1<->4, 2<->3): on the centre pair that
    # only swaps polarity, but on pins 1 and 3 the conductors land on 4 and 2 and
    # the actuator gets nothing.  Assert the as-built choice so it cannot drift
    # silently, and keep the cable requirement beside it in the contract.
    motor = contract["motor_connector"]
    a_pin, b_pin = str(motor["terminal_a_pin"]), str(motor["terminal_b_pin"])
    for index, ref in enumerate(contract["designators"]["motor_connectors"], 1):
        check(pin_net.get((ref, a_pin)) == f"MOTOR_{index}A_J",
              f"{ref} pin {a_pin} is MOTOR_{index}A_J")
        check(pin_net.get((ref, b_pin)) == f"MOTOR_{index}B_J",
              f"{ref} pin {b_pin} is MOTOR_{index}B_J")
    check(bool(motor["cable_must_be_straight_through"]),
          "the contract records the straight-through cable requirement "
          f"({motor['cable_rationale'][:60]}...)")

    # The display and console headers are documented pinouts that someone will
    # crimp a cable to.  Both had a signal order that disagreed with the
    # contract while KiCad and EasyEDA were both live.
    for name, key in (("display", "display_connector"), ("console", "uart_connector")):
        ref = contract["designators"][key]
        expected = contract["pcb"]["header_pinouts"][key]
        actual = [pin_net.get((ref, str(pin))) for pin in range(1, len(expected) + 1)]
        check(actual == expected,
              f"{name} header {ref} pinout is {' / '.join(expected)}"
              + ("" if actual == expected else f" (board: {' / '.join(map(str, actual))})"))


def check_analog_numbers(project: Project, contract: dict) -> None:
    print("\n[9] Derived analog and timing numbers")
    rail = contract["rail_overcurrent"]
    driver = contract["driver"]

    volts_per_amp = rail["shunt_ohm"] * rail["amplifier_gain"]
    check(close(volts_per_amp, contract["current_sense_v_per_a"]),
          f"current sense scale {volts_per_amp:.1f} V/A matches the contract")

    trip = rail["threshold_volts"] / volts_per_amp * 1000.0
    check(close(trip, rail["nominal_trip_ma"], 0.02),
          f"rail comparator nominal trip {trip:.0f} mA matches {rail['nominal_trip_ma']} mA")

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

    # The ferrites are series elements in the motor loop, so their DC resistance
    # eats motor voltage on a 3.3 V rail that already loses the shunt and xISEN.
    ferrite = contract["motor_output_ferrites"]
    loop_dcr = 2 * ferrite["dc_resistance_ohm"]
    drop_mv = loop_dcr * driver["measured_actuator_stall_ma"][1] / 1000.0 * 1000.0
    check(drop_mv <= ferrite["max_loop_drop_mv"],
          f"ferrite pair costs {drop_mv:.0f} mV at the {driver['measured_actuator_stall_ma'][1]} mA "
          f"measured stall, within the contracted {ferrite['max_loop_drop_mv']} mV")
    # A ferrite's rated current is a thermal figure (a stated temperature rise), not
    # a breakdown limit, so the question is not "is the rating above the absolute
    # worst case" but "is the operating envelope inside it, and is the fault-only
    # excursion bounded".  Comparing against the bridge ceiling asked the first
    # question of a current that only ever appears on a wiring fault.
    rating = ferrite["saturation_current_ma"]
    envelope = driver["firmware_hard_cap_ma"]
    check(rating >= envelope * ferrite["operating_margin"],
          f"ferrite rating {rating} mA covers the {envelope} mA firmware current cap "
          f"with the contracted {ferrite['operating_margin']}x margin "
          f"(actual {rating / envelope:.1f}x)")
    excursion = driver["current_limit_max_ma"] / rating
    check(excursion <= ferrite["fault_overcurrent_ratio_max"],
          f"worst-case bridge regulation is {excursion:.2f}x the ferrite rating, within "
          f"the contracted {ferrite['fault_overcurrent_ratio_max']}x fault excursion")
    fault_mw = (driver["current_limit_max_ma"] / 1000.0) ** 2 * \
        ferrite["dc_resistance_ohm"] * 1000.0
    check(fault_mw <= ferrite["package_power_mw"] * 0.5,
          f"one bead dissipates {fault_mw:.0f} mW at the worst-case ceiling, under half "
          f"the {ferrite['package_power_mw']} mW the {ferrite['package']} package carries")
    check(bool(ferrite.get("derating_decision")),
          "the contract records an explicit ferrite derating decision")

    # USB input current limit.  R34 programs it, and a "that part is out of stock,
    # use this one" swap that also moves the value would otherwise be invisible:
    # the TPS2553-1 is latch-off, so its trip point removes power from the ESP32
    # with no status LED and no API.  Assert the board's value, then re-derive the
    # window from the datasheet rather than trusting a transcribed number.
    usb = contract["usb_input"]
    r_ilim = parse_ohms(project.parts[usb["ilim_ref"]].value)
    check(r_ilim is not None and close(r_ilim, usb["ilim_ohm"], 0.001),
          f"{usb['ilim_ref']} is {usb['ilim_ohm'] / 1000:g} kOhm as contracted "
          f"(board: {project.parts[usb['ilim_ref']].value})")
    low, high = usb["ilim_datasheet_range_kohm"]
    check(r_ilim is not None and low <= r_ilim / 1000 <= high,
          f"R_ILIM is inside the datasheet's {low}-{high} kOhm stability range")
    if r_ilim:
        kohm = r_ilim / 1000.0
        eq = usb["ilim_equations"]
        derived = {name: eq[name]["k"] / kohm ** eq[name]["exponent"]
                   for name in ("min", "nom", "max")}
        window = usb["current_limit_window_a"]
        check(close(derived["min"] / 1000, window[0], 0.01)
              and close(derived["max"] / 1000, window[1], 0.01),
              f"current limit {derived['min']:.0f}-{derived['max']:.0f} mA re-derived from "
              f"{eq['source'].split(',')[0]} matches the contracted "
              f"{window[0] * 1000:.0f}-{window[1] * 1000:.0f} mA")
        tol = usb["ilim_tolerance_percent"] / 100.0
        spread = [eq["min"]["k"] / (kohm * (1 + tol)) ** eq["min"]["exponent"] / 1000,
                  eq["max"]["k"] / (kohm * (1 - tol)) ** eq["max"]["exponent"] / 1000]
        contracted = usb["current_limit_window_with_resistor_tolerance_a"]
        check(close(spread[0], contracted[0], 0.01) and close(spread[1], contracted[1], 0.01),
              f"with +-{usb['ilim_tolerance_percent']}% on {usb['ilim_ref']} the window is "
              f"{spread[0] * 1000:.0f}-{spread[1] * 1000:.0f} mA, as contracted")
        # Every part declared interchangeable here must actually be the same value.
        sourcing = usb["ilim_sourcing"]
        parts = sourcing["interchangeable_parts"]
        part = project.parts[usb["ilim_ref"]]
        check(any(p["lcsc"] == part.lcsc for p in parts),
              f"the fitted {usb['ilim_ref']} ({part.lcsc}) is a declared interchangeable part "
              f"({', '.join(p['lcsc'] for p in parts)})")
        # A supplier swap is a BOM-only change and leaves the Gerbers, drill and
        # CPL untouched - but only while the footprint is unchanged.  Swapping by
        # choosing a different library device rather than editing the supplier
        # part brings that device's own footprint, and different pad geometry
        # changes copper, paste and mask.
        check(part.footprint_name == sourcing["footprint_must_not_change"],
              f"{usb['ilim_ref']} still uses footprint "
              f"{sourcing['footprint_must_not_change']}, so the swap is BOM-only "
              f"(board: {part.footprint_name})")

    tacho = contract["commutation_tacho"]
    for field_name, signal in (("gpio", "COMM_TACHO_N"), ("analog_monitor_gpio", "ADC_TACHO")):
        check(tacho[field_name] == contract["gpio"][signal],
              f"commutation_tacho.{field_name} agrees with gpio[{signal}] "
              f"(= GPIO{contract['gpio'][signal]})")
    check(tacho["is_load_bearing"] is False,
          "the commutation tacho is recorded as an enhancement, not load bearing")

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


def check_symbol_pinouts(project: Project, contract: dict) -> None:
    """Guard against ordering a package whose pinout differs from the symbol.

    TLV9001 ships two pinouts (SBOS833R Table 6-1): DBV SOT-23 and T-DCK put
    OUT on pin 1, while DCK SC70, DRL and U-DBV put IN+ there.  The ordered part
    is DBV, and a symbol drawn to the other variant inverts input and output
    while looking correct - design-review finding B6.  The same trap exists for
    any 5-pin single amplifier and for the polarised parts below.
    """
    print("\n[10] Symbol pinouts match the ordered package")
    for ref, expected in contract["pcb"]["symbol_pinouts"].items():
        part = project.parts.get(ref)
        if part is None:
            check(False, f"{ref} exists on the board")
            continue
        pins = project.symbol_pins(part.symbol_uuid)
        if not pins:
            info(f"{ref}: symbol unavailable in the project, skipping")
            continue
        for pin, name in expected.items():
            check(pins.get(pin) == name,
                  f"{ref} ({part.mpn}) pin {pin} is {name}"
                  + ("" if pins.get(pin) == name else f" (symbol says {pins.get(pin)!r})"))
        if "SOT-23-5" in part.footprint_name or "DBV" in (part.mpn or "").upper():
            check(expected.get("1", "").upper() in ("OUT", "K", "A"),
                  f"{ref} orders a SOT-23-5/DBV package, so pin 1 must be the "
                  f"output ({expected.get('1')})")


def check_layout(project: Project, contract: dict) -> None:
    print("\n[11] Physical layout invariants")
    pcb = contract["pcb"]
    points, width, height = project.outline()
    check(bool(points), "the board has an outline on the outline layer")
    check(close(width, pcb["outline_mm"]["width"], 0.001)
          and close(height, pcb["outline_mm"]["height"], 0.001),
          f"outline is {width:.1f} x {height:.1f} mm, matching the contract "
          f"{pcb['outline_mm']['width']} x {pcb['outline_mm']['height']} mm")
    check(width <= contract["maximum_outline_mm"]["width"]
          and height <= contract["maximum_outline_mm"]["height"],
          "outline is inside the maximum panel size")

    holes = project.mounting_holes()
    wanted_holes = sorted(tuple(h) for h in pcb["mounting_hole_positions_mm"])
    check(holes == wanted_holes,
          f"mounting holes at {holes} match the contract"
          + ("" if holes == wanted_holes else f" (contract: {wanted_holes})"))
    bx0, by0, bx1, by1 = project.outline_bounds()
    insets = sorted({round(min(hx - bx0, bx1 - hx, hy - by0, by1 - hy), 3) for hx, hy in holes})
    check(insets == [pcb["mounting_hole_inset_mm"]],
          f"every mounting hole is {pcb['mounting_hole_inset_mm']} mm from the nearest board "
          f"edge (board: {insets})")

    check(contract["layers"] == 2, "the contract still describes a two-layer board")
    inner = [r for r in project.pcb["LAYER"] if r[1] in range(15, 47) and r[4] == 1]
    check(not inner, f"no inner copper layer is enabled ({len(inner)} found)")

    widths = collections.Counter(round(r[9] * MIL, 4) for r in project.pcb["LINE"]
                                 if r[4] in (1, 2))
    check(min(widths) >= pcb["minimum_track_width_mm"],
          f"narrowest track {min(widths):.3f} mm is at or above the contracted "
          f"{pcb['minimum_track_width_mm']} mm")
    info("track widths: " + ", ".join(f"{w} mm x{n}" for w, n in sorted(widths.items())))

    drills = {round(r[7] * MIL, 3) for r in project.pcb["VIA"]}
    diameters = {round(r[8] * MIL, 3) for r in project.pcb["VIA"]}
    check(drills == {pcb["via_drill_mm"]} and diameters == {pcb["via_diameter_mm"]},
          f"every via is {pcb['via_drill_mm']}/{pcb['via_diameter_mm']} mm "
          f"(board: {sorted(drills)}/{sorted(diameters)})")

    by_layer = collections.Counter(r[4] for r in project.pcb["LINE"] if r[4] in (1, 2))
    pours = {r[4]: r[3] for r in project.pcb["POUR"]}
    check(pours.get(1) == "GND" and pours.get(2) == "GND",
          f"both layers carry a GND pour (top={pours.get(1)}, bottom={pours.get(2)})")
    stitching = sum(1 for r in project.pcb["VIA"] if r[3] == "GND")
    check(stitching >= pcb["ground_stitching_vias_min"],
          f"{stitching} GND vias at or above the contracted minimum "
          f"{pcb['ground_stitching_vias_min']}")
    info(f"routing: {by_layer.get(1, 0)} top segments, {by_layer.get(2, 0)} bottom "
         f"segments, {len(project.pcb['VIA'])} vias")

    # Antenna cutout.  Espressif's 15 mm figure is a housing clearance, but the
    # cutout itself must be copper-free on both layers or the antenna is
    # detuned by the pour it sits over.
    cut = pcb["antenna_cutout_mm"]
    module = project.parts[contract["designators"]["module"]]
    x_min, y_min, x_max, y_max = project.outline_bounds()
    x0, x1 = module.x - cut["width"] / 2, module.x + cut["width"] / 2
    y0 = y_max - cut["depth"]
    check(close(x0, pcb["antenna_cutout_x_mm"][0], 0.02)
          and close(x1, pcb["antenna_cutout_x_mm"][1], 0.02),
          f"antenna cutout spans x {x0:.1f}-{x1:.1f} mm, centred on "
          f"{contract['designators']['module']}")

    def inside_cut(x: float, y: float) -> bool:
        return x0 <= x <= x1 and y >= y0

    intruders = []
    for record in project.pcb["LINE"]:
        if record[4] in (1, 2):
            for x, y in ((record[5] * MIL, record[6] * MIL),
                         (record[7] * MIL, record[8] * MIL)):
                if inside_cut(x, y):
                    intruders.append(f"track {record[3]}")
    for record in project.pcb["VIA"]:
        if inside_cut(record[5] * MIL, record[6] * MIL):
            intruders.append(f"via {record[3]}")
    check(not intruders, f"the antenna cutout is copper-free ({len(intruders)} intruders)"
          + (f": {', '.join(sorted(set(intruders))[:6])}" if intruders else ""))

    # Copper to board edge, including the cutout edges.
    def edge_clearance(x: float, y: float) -> float:
        distances = [x - x_min, x_max - x, y - y_min, y_max - y]
        if x0 <= x <= x1:
            distances.append(abs(y - y0))
        return min(distances)

    worst = None
    for record in project.pcb["LINE"]:
        if record[4] in (1, 2):
            half = record[9] * MIL / 2
            for x, y in ((record[5] * MIL, record[6] * MIL),
                         (record[7] * MIL, record[8] * MIL)):
                value = edge_clearance(x, y) - half
                if worst is None or value < worst[0]:
                    worst = (value, f"track {record[3]}", round(x, 2), round(y, 2))
    for record in project.pcb["VIA"]:
        value = edge_clearance(record[5] * MIL, record[6] * MIL) - record[8] * MIL / 2
        if worst is None or value < worst[0]:
            worst = (value, f"via {record[3]}", round(record[5] * MIL, 2),
                     round(record[6] * MIL, 2))
    check(worst is not None and worst[0] >= pcb["minimum_copper_to_edge_mm"],
          f"closest copper to a board edge is {worst[0]:.3f} mm at {worst[1]} "
          f"({worst[2]}, {worst[3]}), contracted minimum "
          f"{pcb['minimum_copper_to_edge_mm']} mm")

    # Kelvin pair: the shunt and the amplifier cannot be separated.
    shunt = project.parts[contract["designators"]["rail_shunt"]]
    amp = project.parts[contract["designators"]["shunt_amplifier"]]
    span = math.hypot(shunt.x - amp.x, shunt.y - amp.y)
    check(span <= pcb["kelvin_pair_max_mm"],
          f"shunt to amplifier spacing {span:.2f} mm is within the contracted "
          f"{pcb['kelvin_pair_max_mm']} mm Kelvin limit")

    info("DRC, unrouted-net and Gerber checks belong to the EasyEDA editor and "
         "are gated by validation-plan.md, not by this script")


def check_golden_netlist(project: Project) -> None:
    """Fail on any connectivity change not deliberately blessed.

    Unnamed nets are canonicalised to their pad set rather than stored under the
    editor's ``$5N314``-style id, which is not stable across a schematic
    re-derive.  Once every net is named the canonical form disappears.
    """
    print("\n[12] Netlist matches the golden snapshot")
    if not GOLDEN.exists():
        info("no netlist-golden.json committed; skipping")
        return
    golden = json.loads(GOLDEN.read_text(encoding="utf-8"))
    current = golden_snapshot(project)
    added = sorted(set(current) - set(golden))
    removed = sorted(set(golden) - set(current))
    changed = sorted(k for k in set(golden) & set(current) if golden[k] != current[k])
    check(not removed, f"no pad lost its connection ({len(removed)} lost)"
          + (f": {', '.join(removed[:8])}" if removed else ""))
    check(not added, f"no pad gained an unexpected connection ({len(added)} new)"
          + (f": {', '.join(added[:8])}" if added else ""))
    check(not changed, f"no pad changed net ({len(changed)} changed)"
          + (f": {', '.join(f'{k}: {golden[k]}->{current[k]}' for k in changed[:6])}"
             if changed else ""))
    info(f"{len(current)} pad->net entries compared against the snapshot")


def golden_snapshot(project: Project) -> dict[str, str]:
    net_pins = project.net_pins()
    canonical: dict[str, str] = {}
    for net, pins in net_pins.items():
        if net.startswith("$"):
            canonical[net] = "$UNNAMED:" + ",".join(sorted(f"{r}.{p}" for r, p in pins))
    return {f"{ref}.{pad}": canonical.get(net, net)
            for (ref, pad), net in project.pin_net().items()}


def main() -> int:
    contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    project_path = ROOT / contract["pcb"]["easyeda_project"]
    if not project_path.exists():
        print(f"  FAIL  EasyEDA project not found: {project_path}")
        return 1
    project = Project(project_path, contract["pcb"]["document"])
    print(f"Lune V6 Rev 3.2 design checks - {project_path.name}, "
          f"document {project.pcb_name}, {len(project.parts)} placements")

    check_project(project, contract)
    check_placements(project, contract)
    check_fabrication_attributes(project, contract)
    check_sourcing(project, contract)
    check_gpio(project, contract)
    check_decoder(project, contract)
    check_safety_topology(project, contract)
    check_connectors(project, contract)
    check_analog_numbers(project, contract)
    check_symbol_pinouts(project, contract)
    check_layout(project, contract)
    check_golden_netlist(project)

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
        _contract = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
        _project = Project(ROOT / _contract["pcb"]["easyeda_project"],
                           _contract["pcb"]["document"])
        _snapshot = golden_snapshot(_project)
        GOLDEN.write_text(json.dumps(_snapshot, indent=0, sort_keys=True) + "\n",
                          encoding="utf-8")
        print(f"netlist-golden.json updated: {len(_snapshot)} pad->net entries")
        sys.exit(0)
    sys.exit(main())
