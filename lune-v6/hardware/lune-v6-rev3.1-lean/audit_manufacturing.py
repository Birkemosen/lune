#!/usr/bin/env python3
"""Fail-fast checks for the Rev 3.1 Lean JLCPCB handoff package."""

from __future__ import annotations

import csv
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MFG = ROOT / "manufacturing"
BOM = MFG / "lune-v6-rev3.1-lean-jlc-bom.csv"
CPL = MFG / "lune-v6-rev3.1-lean-jlc-cpl.csv"
DRV8833_BOM = MFG / "lune-v6-rev3.1-lean-drv8833-jlc-bom.csv"
DRV8833_CPL = MFG / "lune-v6-rev3.1-lean-drv8833-jlc-cpl.csv"
ARCHIVE = MFG / "lune-v6-rev3.1-lean-gerbers.zip"
DRC = ROOT / "routed-drc.rpt"
PREFIX = "lune-v6-rev3.1-lean-routed-"
EXPECTED_ARCHIVE = {
    PREFIX + suffix for suffix in (
        "F_Cu.gtl", "B_Cu.gbl", "F_Paste.gtp", "B_Paste.gbp",
        "F_Silkscreen.gto", "B_Silkscreen.gbo", "F_Mask.gts",
        "B_Mask.gbs", "Edge_Cuts.gm1", "PTH.drl", "NPTH.drl",
    )
}
EXPECTED_PLACEMENTS = 108


def bom_refs(path: Path = BOM) -> set[str]:
    seen: set[str] = set()
    with path.open(encoding="utf-8", newline="") as source:
        reader = csv.DictReader(source)
        assert reader.fieldnames == [
            "Comment", "Designator", "Footprint", "JLCPCB Part #"
        ]
        for row in reader:
            assert row["Comment"] and row["Footprint"]
            assert re.fullmatch(r"C\d+", row["JLCPCB Part #"]), row
            refs = {ref.strip() for ref in row["Designator"].split(",")}
            assert refs and "" not in refs
            assert not seen.intersection(refs), "duplicate designator in BOM"
            seen.update(refs)
    return seen


def cpl_refs(path: Path = CPL) -> set[str]:
    seen: set[str] = set()
    coordinate = re.compile(r"-?\d+(?:\.\d+)?mm")
    with path.open(encoding="utf-8", newline="") as source:
        reader = csv.DictReader(source)
        assert reader.fieldnames == [
            "Designator", "Mid X", "Mid Y", "Layer", "Rotation"
        ]
        for row in reader:
            ref = row["Designator"].strip()
            assert ref and ref not in seen, f"duplicate CPL designator: {ref}"
            assert coordinate.fullmatch(row["Mid X"]), row
            assert coordinate.fullmatch(row["Mid Y"]), row
            assert row["Layer"] in {"Top", "Bottom"}, row
            rotation = float(row["Rotation"])
            assert 0.0 <= rotation < 360.0, row
            seen.add(ref)
    return seen


def check_archive() -> None:
    with zipfile.ZipFile(ARCHIVE) as archive:
        names = set(archive.namelist())
        assert names == EXPECTED_ARCHIVE, (
            f"Gerber archive mismatch; missing={EXPECTED_ARCHIVE - names}, "
            f"extra={names - EXPECTED_ARCHIVE}"
        )
        for info in archive.infolist():
            assert info.file_size > 0, f"empty fabrication file: {info.filename}"
            assert "/" not in info.filename, "archive must have a flat layout"


def check_drc() -> None:
    report = DRC.read_text(encoding="utf-8")
    assert "** Found 0 DRC violations **" in report
    assert "** Found 0 unconnected pads **" in report


def main() -> None:
    bom = bom_refs()
    cpl = cpl_refs()
    assert len(bom) == EXPECTED_PLACEMENTS
    assert len(cpl) == EXPECTED_PLACEMENTS
    assert bom == cpl, f"BOM/CPL mismatch: BOM-only={bom-cpl}, CPL-only={cpl-bom}"
    drv8833_bom = bom_refs(DRV8833_BOM)
    drv8833_cpl = cpl_refs(DRV8833_CPL)
    assert len(drv8833_bom) == EXPECTED_PLACEMENTS + 6
    assert len(drv8833_cpl) == EXPECTED_PLACEMENTS + 6
    assert drv8833_bom == drv8833_cpl
    assert drv8833_bom - bom == {"C110", "C111", "C112", "C114", "C115", "C116"}
    check_archive()
    check_drc()
    print("Manufacturing package audit passed")
    print(f"  {len(bom)} BOM/CPL references match exactly")
    print(f"  {len(drv8833_bom)} DRV8833-variant BOM/CPL references match exactly")
    print(f"  {len(EXPECTED_ARCHIVE)} production files in flat Gerber/drill ZIP")
    print("  routed board report remains DRC 0 / unconnected 0")


if __name__ == "__main__":
    main()
