#!/usr/bin/env python3
"""Physical invariants for the Rev 3.1 Lean routing candidate."""

from collections import Counter
from math import hypot
from pathlib import Path
import sys

import pcbnew


ROOT = Path(__file__).resolve().parent
BOARD_PATH = ROOT / "lune-v6-rev3.1-lean-routed.kicad_pcb"
DRC_PATH = ROOT / "routed-drc.rpt"


def mm(value):
    return pcbnew.ToMM(value)


def pad(board, ref, number):
    footprint = board.FindFootprintByReference(ref)
    assert footprint is not None, f"Missing footprint {ref}"
    result = footprint.FindPadByNumber(number)
    assert result is not None, f"Missing pad {ref}.{number}"
    return result


def distance_mm(left, right):
    a = left.GetPosition()
    b = right.GetPosition()
    return hypot(mm(a.x - b.x), mm(a.y - b.y))


def orientation(board, ref):
    return board.FindFootprintByReference(ref).GetOrientation().AsDegrees() % 360


def connected_track_count(board, target_pad, tolerance_mm=0.03):
    position = target_pad.GetPosition()
    count = 0
    for item in board.GetTracks():
        if isinstance(item, pcbnew.PCB_VIA):
            continue
        if item.GetNetCode() != target_pad.GetNetCode():
            continue
        for endpoint in (item.GetStart(), item.GetEnd()):
            if (abs(mm(endpoint.x - position.x)) <= tolerance_mm and
                    abs(mm(endpoint.y - position.y)) <= tolerance_mm):
                count += 1
                break
    return count


def net_track_length_mm(tracks, net_name):
    return sum(mm(track.GetLength()) for track in tracks
               if track.GetNetname() == net_name)


def main():
    board_path = Path(sys.argv[1]) if len(sys.argv) > 1 else BOARD_PATH
    drc_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DRC_PATH
    board = pcbnew.LoadBoard(str(board_path))
    report = drc_path.read_text()
    assert "Found 0 DRC violations" in report
    assert "Found 0 unconnected pads" in report

    assert board.GetCopperLayerCount() == 2
    bounds = board.GetBoardEdgesBoundingBox()
    # Bounding box includes half of the 0.10 mm Edge.Cuts stroke on each side.
    assert abs(mm(bounds.GetWidth()) - 90.0) < 0.11
    assert abs(mm(bounds.GetHeight()) - 75.0) < 0.11
    assert len(board.GetFootprints()) == 131
    assert sum(footprint.IsDNP() for footprint in board.GetFootprints()) == 19
    assert sum(footprint.IsExcludedFromPosFiles()
               for footprint in board.GetFootprints()) == 23

    tracks = [item for item in board.GetTracks()
              if not isinstance(item, pcbnew.PCB_VIA)]
    vias = [item for item in board.GetTracks()
            if isinstance(item, pcbnew.PCB_VIA)]
    assert tracks and vias
    assert min(mm(track.GetWidth()) for track in tracks) >= 0.20
    assert min(mm(via.GetWidth(pcbnew.F_Cu)) for via in vias) >= 0.60
    assert min(mm(via.GetDrillValue()) for via in vias) >= 0.30

    assert orientation(board, "J1") == 270
    assert orientation(board, "U5") == 90
    # Antenna-side fab body must remain flush with the straight top edge.
    esp = board.FindFootprintByReference("U1")
    fab_layers = pcbnew.LSET()
    fab_layers.AddLayer(pcbnew.F_Fab)
    assert abs(mm(esp.GetLayerBoundingBox(fab_layers).GetTop()) - 0.01) < 0.05
    for ref in ("U40", "U41", "U42", "RN1", "RN2", "RN3",
                "RSA1", "RSA2", "RSA3", "RSB1", "RSB2", "RSB3"):
        assert orientation(board, ref) == 180, f"Unexpected {ref} orientation"

    # Each xISEN programming resistor has its signal pad facing and close to
    # the corresponding driver pin.  This was a routing-critical placement.
    for index, driver in enumerate(("U20", "U21", "U22"), 1):
        assert distance_mm(pad(board, driver, "3"), pad(board, f"RSA{index}", "1")) < 2.5
        assert distance_mm(pad(board, driver, "6"), pad(board, f"RSB{index}", "1")) < 2.5

    # INA180 inputs share the two shunt nets and are physically local.  Both
    # shunt and amplifier pads must be direct track endpoints, preserving a
    # reviewable Kelvin take-off rather than an implicit zone-only connection.
    shunt_high = pad(board, "RSH1", "1")
    shunt_low = pad(board, "RSH1", "2")
    ina_high = pad(board, "U32", "3")
    ina_low = pad(board, "U32", "4")
    assert shunt_high.GetNetname() == ina_high.GetNetname() == "/+3V3_MOTOR_REG"
    assert shunt_low.GetNetname() == ina_low.GetNetname() == "/+3V3_MOTOR"
    assert distance_mm(shunt_high, ina_high) < 10.0
    assert distance_mm(shunt_low, ina_low) < 10.0
    for item in (shunt_high, shunt_low, ina_high, ina_low):
        assert connected_track_count(board, item) >= 1, f"No direct track at {item}"

    # External 1-wire connector and its local series, pull-up and ESD network.
    one_wire_pads = (
        pad(board, "J20", "2"), pad(board, "R40", "2"),
        pad(board, "R41", "2"), pad(board, "D5", "1"),
    )
    assert all(item.GetNetname() == "/ONEWIRE_BUS" for item in one_wire_pads)
    assert board.FindFootprintByReference("J20").GetValue() == "ONEWIRE DAISY CHAIN"
    assert board.FindFootprintByReference("R40").GetValue() == "33R"
    assert board.FindFootprintByReference("R41").GetValue() == "4.7k"
    assert board.FindFootprintByReference("D5").GetValue() == "PESD3V3U1UA,115"

    # Hardware safety nets must all have routed copper, independent of the MCU.
    safety_nets = (
        "/DECODER_INHIBIT", "/DRIVE_PERMIT", "/FAULT_N_RAW",
        "/MOTOR_ENABLE", "/TIMEOUT_Q5", "/ADC_CURRENT", "/ADC_BEMF",
        "/ONEWIRE_BUS",
    )
    segment_counts = Counter(track.GetNetname() for track in tracks)
    for net_name in safety_nets:
        assert segment_counts[net_name] > 0, f"Unrouted safety net {net_name}"

    # TP1 is intentionally local to the current front end.  This bounds the
    # total filtered ADC copper and prevents the old service-edge antenna stub
    # from returning during placement/routing regeneration.
    tp1_position = board.FindFootprintByReference("TP1").GetPosition()
    assert distance_mm(pad(board, "TP1", "1"), pad(board, "RSH1", "1")) < 5.0
    assert 20.0 < mm(tp1_position.x) < 23.0
    assert net_track_length_mm(tracks, "/ADC_CURRENT") <= 65.0

    assert len(board.Zones()) == 2
    zone_layers = {zone.GetLayer() for zone in board.Zones()
                   if zone.GetNetname() == "/GND"}
    assert zone_layers == {pcbnew.F_Cu, pcbnew.B_Cu}

    print("PCB audit passed")
    print(f"  {len(board.GetFootprints())} footprints")
    print(f"  {len(tracks)} tracks, {len(vias)} vias, F.Cu/B.Cu GND zones")
    print("  2 layers, 90 x 75 mm, 0 DRC, 0 unconnected")
    print("  driver sense, shunt Kelvin, safety and 1-wire invariants passed")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as error:
        print(f"PCB audit failed: {error}", file=sys.stderr)
        raise
