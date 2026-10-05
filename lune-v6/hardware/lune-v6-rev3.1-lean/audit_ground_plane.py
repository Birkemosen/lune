#!/usr/bin/env python3
"""Quantify whether B.Cu is used only for short signal crossovers."""

from collections import Counter, defaultdict
from pathlib import Path
import sys

import pcbnew


ROOT = Path(__file__).resolve().parent
DEFAULT_BOARD = ROOT / "lune-v6-rev3.1-lean-routed.kicad_pcb"


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_BOARD
    board = pcbnew.LoadBoard(str(path))
    assert board.GetCopperLayerCount() == 2
    bottom = [item for item in board.GetTracks()
              if not isinstance(item, pcbnew.PCB_VIA)
              and item.GetLayer() == pcbnew.B_Cu
              and item.GetNetname() != "/GND"]
    by_net = defaultdict(float)
    for item in bottom:
        by_net[item.GetNetname()] += pcbnew.ToMM(item.GetLength())
    total = sum(by_net.values())
    longest_segment = max((pcbnew.ToMM(item.GetLength()) for item in bottom), default=0.0)
    long_nets = Counter({net: round(length, 1) for net, length in by_net.items()
                         if length > 110.0})
    ground_vias = sum(1 for item in board.GetTracks()
                      if isinstance(item, pcbnew.PCB_VIA)
                      and item.GetNetname() == "/GND")
    zone_layers = {zone.GetLayer() for zone in board.Zones()
                   if zone.GetNetname() == "/GND"}

    # These are review gates, not generic fab minima.  The bottom layer must
    # remain a plane with local crossovers rather than becoming a second full
    # signal-routing layer.
    print(f"  {len(bottom)} signal segments, {total:.1f} mm total")
    print(f"  longest segment {longest_segment:.1f} mm")
    print(f"  {ground_vias} GND stitching vias and pours on both sides")
    assert zone_layers == {pcbnew.F_Cu, pcbnew.B_Cu}
    assert ground_vias >= 40, f"only {ground_vias} GND stitching vias"
    assert longest_segment <= 45.0, (
        f"longest B.Cu signal segment is {longest_segment:.1f} mm")
    assert not long_nets, f"long B.Cu signal nets: {dict(long_nets)}"
    assert total <= 2000.0, f"total B.Cu signal length is {total:.1f} mm"

    print("Bottom-plane audit passed")


if __name__ == "__main__":
    main()
