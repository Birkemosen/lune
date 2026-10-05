#!/usr/bin/env python3
"""Generate and cross-check JLCPCB assembly files for Rev 3.1 Lean.

Run with KiCad's bundled Python because placement data is read from the final
routed board.  The XML netlist remains the authority for value, footprint,
LCSC selection and assembly exclusions.
"""

from __future__ import annotations

import csv
import re
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

import pcbnew


ROOT = Path(__file__).resolve().parent
NETLIST = ROOT / "lune-v6-rev3.1-lean.xml"
BOARD = ROOT / "lune-v6-rev3.1-lean-routed.kicad_pcb"
OUTPUT = ROOT / "manufacturing"
BOM = OUTPUT / "lune-v6-rev3.1-lean-jlc-bom.csv"
CPL = OUTPUT / "lune-v6-rev3.1-lean-jlc-cpl.csv"
DRV8833_BOM = OUTPUT / "lune-v6-rev3.1-lean-drv8833-jlc-bom.csv"
DRV8833_CPL = OUTPUT / "lune-v6-rev3.1-lean-drv8833-jlc-cpl.csv"
EXPECTED_PLACEMENTS = 108


def natural_key(value: str) -> tuple:
    return tuple(int(part) if part.isdigit() else part for part in re.split(r"(\d+)", value))


def component_fields(component: ET.Element) -> dict[str, str]:
    return {
        field.get("name", ""): (field.text or "").strip()
        for field in component.findall("./fields/field")
    }


def assembly_components() -> dict[str, dict[str, str]]:
    root = ET.parse(NETLIST).getroot()
    result: dict[str, dict[str, str]] = {}
    for component in root.findall("./components/comp"):
        ref = component.get("ref", "").strip()
        fields = component_fields(component)
        excluded = (
            fields.get("DNP", "").lower() == "yes"
            or fields.get("Assembly") in {"COPPER_ONLY", "MECHANICAL_ONLY"}
        )
        if excluded:
            continue
        value = (component.findtext("value") or "").strip()
        footprint = (component.findtext("footprint") or "").strip()
        lcsc = fields.get("LCSC", "")
        mpn = fields.get("MPN", "")
        assert ref and value and footprint, f"incomplete component record: {ref}"
        assert lcsc, f"{ref} has no LCSC/JLCPCB part number"
        assert mpn, f"{ref} has no manufacturer part number"
        assert ref not in result, f"duplicate schematic reference: {ref}"
        result[ref] = {
            "value": value,
            "footprint": footprint.split(":")[-1],
            "lcsc": lcsc,
            "mpn": mpn,
        }
    assert len(result) == EXPECTED_PLACEMENTS, (
        f"expected {EXPECTED_PLACEMENTS} assembled references, found {len(result)}"
    )
    return result


def drv8833_components(
    baseline: dict[str, dict[str, str]],
) -> dict[str, dict[str, str]]:
    """Return the pin-compatible cost-down population variant.

    DRV8833 requires VINT and VCP capacitors on pins that are NC on DRV8411.
    The routed board already contains these six DNP footprints and nets.
    """
    result = {ref: dict(data) for ref, data in baseline.items()}
    for ref in ("U20", "U21", "U22"):
        result[ref].update({
            "value": "DRV8833PWPR",
            "mpn": "DRV8833PWPR",
            "lcsc": "C50506",
        })
    for ref in ("C110", "C111", "C112"):
        result[ref] = {
            "value": "2.2u 10V X5R",
            "footprint": "C_0603_1608Metric",
            "mpn": "CL10A225KP8NNNC",
            "lcsc": "C1607",
        }
    for ref in ("C114", "C115", "C116"):
        result[ref] = {
            "value": "10n 50V X7R",
            "footprint": "C_0603_1608Metric",
            "mpn": "CL10B103KB8NNNC",
            "lcsc": "C1589",
        }
    assert len(result) == EXPECTED_PLACEMENTS + 6
    return result


def write_bom(
    components: dict[str, dict[str, str]], output_path: Path = BOM
) -> set[str]:
    groups: dict[tuple[str, str, str, str], list[str]] = defaultdict(list)
    for ref, data in components.items():
        key = (data["value"], data["footprint"], data["mpn"], data["lcsc"])
        groups[key].append(ref)

    bom_refs: set[str] = set()
    with output_path.open("w", encoding="utf-8", newline="") as output:
        writer = csv.writer(output, lineterminator="\n")
        writer.writerow(("Comment", "Designator", "Footprint", "JLCPCB Part #"))
        for value, footprint, mpn, lcsc in sorted(groups):
            refs = sorted(groups[(value, footprint, mpn, lcsc)], key=natural_key)
            assert not bom_refs.intersection(refs), f"duplicate BOM references: {refs}"
            bom_refs.update(refs)
            writer.writerow((f"{value} | {mpn}", ",".join(refs), footprint, lcsc))
    return bom_refs


def write_cpl(
    components: dict[str, dict[str, str]], output_path: Path = CPL
) -> set[str]:
    board = pcbnew.LoadBoard(str(BOARD))
    footprints = {fp.GetReference(): fp for fp in board.GetFootprints()}
    missing = set(components) - set(footprints)
    assert not missing, "assembly references missing from PCB: " + ", ".join(sorted(missing))

    cpl_refs: set[str] = set()
    with output_path.open("w", encoding="utf-8", newline="") as output:
        writer = csv.writer(output, lineterminator="\n")
        writer.writerow(("Designator", "Mid X", "Mid Y", "Layer", "Rotation"))
        for ref in sorted(components, key=natural_key):
            footprint = footprints[ref]
            position = footprint.GetPosition()
            layer = "Top" if footprint.GetLayer() == pcbnew.F_Cu else "Bottom"
            rotation = footprint.GetOrientationDegrees() % 360.0
            writer.writerow((
                ref,
                f"{pcbnew.ToMM(position.x):.4f}mm",
                f"{pcbnew.ToMM(position.y):.4f}mm",
                layer,
                f"{rotation:.2f}",
            ))
            cpl_refs.add(ref)
    return cpl_refs


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    components = assembly_components()
    bom_refs = write_bom(components)
    cpl_refs = write_cpl(components)
    expected = set(components)
    assert bom_refs == expected, "BOM does not cover the complete assembly set"
    assert cpl_refs == expected, "CPL does not cover the complete assembly set"
    assert bom_refs == cpl_refs, "BOM/CPL reference sets differ"
    print(f"Wrote {BOM.name}: {len(bom_refs)} unique references")
    print(f"Wrote {CPL.name}: {len(cpl_refs)} placements")
    print("BOM/CPL reference sets match exactly")

    cost_down = drv8833_components(components)
    drv8833_bom_refs = write_bom(cost_down, DRV8833_BOM)
    drv8833_cpl_refs = write_cpl(cost_down, DRV8833_CPL)
    assert drv8833_bom_refs == set(cost_down)
    assert drv8833_cpl_refs == set(cost_down)
    assert drv8833_bom_refs == drv8833_cpl_refs
    print(f"Wrote {DRV8833_BOM.name}: {len(drv8833_bom_refs)} unique references")
    print(f"Wrote {DRV8833_CPL.name}: {len(drv8833_cpl_refs)} placements")
    print("DRV8833 BOM/CPL reference sets match exactly")


if __name__ == "__main__":
    main()
