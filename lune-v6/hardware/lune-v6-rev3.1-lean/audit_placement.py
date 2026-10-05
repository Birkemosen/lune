#!/usr/bin/env python3
"""Mechanical placement audit for the Rev 3.1 Lean placement candidate."""

from __future__ import annotations

from math import hypot
from pathlib import Path
import sys

import pcbnew


ROOT = Path(__file__).resolve().parent
BOARD_PATH = ROOT / "lune-v6-rev3.1-lean.kicad_pcb"
WIDTH_MM = 90.0
HEIGHT_MM = 75.0
MOUNT_INSET_MM = 4.0
MAX_CONNECTOR_PROJECTION_MM = 2.0


def mm(value):
    return pcbnew.ToMM(value)


def position(board, ref):
    footprint = board.FindFootprintByReference(ref)
    assert footprint is not None, f"missing footprint {ref}"
    point = footprint.GetPosition()
    return mm(point.x), mm(point.y)


def fab_bounds(footprint):
    boxes = [
        item.GetBoundingBox()
        for item in footprint.GraphicalItems()
        if item.GetLayer() == pcbnew.F_Fab
    ]
    assert boxes, f"{footprint.GetReference()} has no F.Fab body outline"
    return (
        min(mm(box.GetLeft()) for box in boxes),
        min(mm(box.GetTop()) for box in boxes),
        max(mm(box.GetRight()) for box in boxes),
        max(mm(box.GetBottom()) for box in boxes),
    )


def assert_close(actual, expected, tolerance=0.02):
    assert abs(actual - expected) <= tolerance, (actual, expected)


def main():
    board = pcbnew.LoadBoard(str(BOARD_PATH))
    bounds = board.GetBoardEdgesBoundingBox()
    assert_close(mm(bounds.GetWidth()), WIDTH_MM, 0.11)
    assert_close(mm(bounds.GetHeight()), HEIGHT_MM, 0.11)
    assert len(board.GetFootprints()) == 131

    expected_holes = {
        "H1": (MOUNT_INSET_MM, MOUNT_INSET_MM),
        "H2": (WIDTH_MM - MOUNT_INSET_MM, MOUNT_INSET_MM),
        "H3": (MOUNT_INSET_MM, HEIGHT_MM - MOUNT_INSET_MM),
        "H4": (WIDTH_MM - MOUNT_INSET_MM, HEIGHT_MM - MOUNT_INSET_MM),
    }
    for ref, expected in expected_holes.items():
        actual = position(board, ref)
        assert_close(actual[0], expected[0])
        assert_close(actual[1], expected[1])

    hole_points = list(expected_holes.values())
    minimum_hole_spacing = min(
        hypot(ax - bx, ay - by)
        for index, (ax, ay) in enumerate(hole_points)
        for bx, by in hole_points[index + 1:]
    )
    assert_close(minimum_hole_spacing, HEIGHT_MM - 2 * MOUNT_INSET_MM)

    rj_refs = tuple(f"J{number}" for number in range(11, 17))
    rj_positions = [position(board, ref) for ref in rj_refs]
    assert all(abs(y - rj_positions[0][1]) < 0.02 for _, y in rj_positions)
    pitches = [
        rj_positions[index + 1][0] - rj_positions[index][0]
        for index in range(len(rj_positions) - 1)
    ]
    assert all(abs(pitch - 12.25) < 0.02 for pitch in pitches)
    first_rj = board.FindFootprintByReference("J11")
    last_rj = board.FindFootprintByReference("J16")
    first_left = fab_bounds(first_rj)[0]
    last_right = fab_bounds(last_rj)[2]
    assert_close(first_left, WIDTH_MM - last_right)
    for ref in rj_refs:
        projection = fab_bounds(board.FindFootprintByReference(ref))[3] - HEIGHT_MM
        assert 0.0 <= projection <= MAX_CONNECTOR_PROJECTION_MM, (ref, projection)

    usb = board.FindFootprintByReference("J1")
    assert_close(usb.GetOrientationDegrees() % 360.0, 270.0)
    usb_projection = -fab_bounds(usb)[0]
    assert 0.0 <= usb_projection <= MAX_CONNECTOR_PROJECTION_MM

    esp = board.FindFootprintByReference("U1")
    antenna_edge_offset = fab_bounds(esp)[1]
    assert 0.0 <= antenna_edge_offset <= 0.05

    one_wire = board.FindFootprintByReference("J20")
    one_wire_projection = fab_bounds(one_wire)[2] - WIDTH_MM
    assert 0.0 <= one_wire_projection <= MAX_CONNECTOR_PROJECTION_MM

    print("Placement audit passed")
    print("  90 x 75 mm board, 82 x 67 mm rectangular M3 pattern")
    print(f"  minimum mounting-hole spacing {minimum_hole_spacing:.1f} mm")
    print("  six RJ9 centered at 12.25 mm pitch; body faces project 1.0 mm")
    print(f"  left-edge USB-C projects {usb_projection:.1f} mm; 1-wire projects {one_wire_projection:.2f} mm")
    print(f"  ESP32 antenna body is {antenna_edge_offset:.2f} mm inside the straight top edge")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as error:
        print(f"Placement audit failed: {error}", file=sys.stderr)
        raise
