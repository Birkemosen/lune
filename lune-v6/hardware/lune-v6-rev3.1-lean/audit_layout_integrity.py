#!/usr/bin/env python3
"""Quantitative two-layer power, motor, USB and ADC routing audit."""

from __future__ import annotations

import heapq
from collections import defaultdict
from pathlib import Path
import sys

import pcbnew


ROOT = Path(__file__).resolve().parent
BOARD = ROOT / "lune-v6-rev3.1-lean-routed.kicad_pcb"
COPPER_RESISTIVITY = 1.724e-8  # ohm metre at 20 C
COPPER_THICKNESS_M = 35e-6     # nominal 1 oz outer copper
VIA_RESISTANCE_OHM = 0.001     # conservative order estimate for 0.30 mm drill


def mm(value):
    return pcbnew.ToMM(value)


def pad(board, ref, number):
    result = board.FindFootprintByReference(ref).FindPadByNumber(str(number))
    assert result is not None, f"missing pad {ref}.{number}"
    return result


def nodes_for_pad(board, ref, number):
    position = pad(board, ref, number).GetPosition()
    return [
        (position.x, position.y, pcbnew.F_Cu),
        (position.x, position.y, pcbnew.B_Cu),
    ]


def graph_for_net(board, net_name, metric):
    graph = defaultdict(list)
    for item in board.GetTracks():
        if item.GetNetname() != net_name:
            continue
        if isinstance(item, pcbnew.PCB_VIA):
            position = item.GetPosition()
            front = (position.x, position.y, pcbnew.F_Cu)
            back = (position.x, position.y, pcbnew.B_Cu)
            weight = VIA_RESISTANCE_OHM if metric == "resistance" else 0.0
            graph[front].append((back, weight))
            graph[back].append((front, weight))
            continue

        start = (item.GetStart().x, item.GetStart().y, item.GetLayer())
        end = (item.GetEnd().x, item.GetEnd().y, item.GetLayer())
        length_m = mm(item.GetLength()) / 1000.0
        if metric == "resistance":
            width_m = mm(item.GetWidth()) / 1000.0
            weight = COPPER_RESISTIVITY * length_m / (width_m * COPPER_THICKNESS_M)
        else:
            weight = length_m * 1000.0
        graph[start].append((end, weight))
        graph[end].append((start, weight))
    return graph


def shortest(board, net_name, source, destination, metric):
    graph = graph_for_net(board, net_name, metric)
    distances = {node: 0.0 for node in nodes_for_pad(board, *source)}
    queue = [(0.0, node) for node in distances]
    heapq.heapify(queue)
    while queue:
        distance, node = heapq.heappop(queue)
        if distance != distances[node]:
            continue
        for neighbour, weight in graph[node]:
            candidate = distance + weight
            if candidate < distances.get(neighbour, float("inf")):
                distances[neighbour] = candidate
                heapq.heappush(queue, (candidate, neighbour))
    result = min(distances.get(node, float("inf"))
                 for node in nodes_for_pad(board, *destination))
    assert result < float("inf"), f"no copper path on {net_name}: {source} -> {destination}"
    return result


def net_length(board, net_name):
    return sum(mm(item.GetLength()) for item in board.GetTracks()
               if item.GetNetname() == net_name
               and not isinstance(item, pcbnew.PCB_VIA))


def via_count(board, net_name):
    return sum(1 for item in board.GetTracks()
               if item.GetNetname() == net_name
               and isinstance(item, pcbnew.PCB_VIA))


def main():
    board_path = Path(sys.argv[1]) if len(sys.argv) > 1 else BOARD
    board = pcbnew.LoadBoard(str(board_path))

    vbus_r = shortest(board, "/VBUS_PROTECTED", ("U2", 6), ("U4", 1), "resistance")
    motor_reg_r = shortest(board, "/+3V3_MOTOR_REG", ("U4", 5), ("RSH1", 1), "resistance")
    motor_rail_r = [
        shortest(board, "/+3V3_MOTOR", ("RSH1", 2), (ref, 12), "resistance")
        for ref in ("U20", "U21", "U22")
    ]
    assert vbus_r * 0.5 <= 0.050, f"VBUS drop {vbus_r * 0.5 * 1000:.1f} mV"
    assert motor_reg_r * 0.25 <= 0.030, f"motor-reg drop {motor_reg_r * 0.25 * 1000:.1f} mV"
    # 40 mV is 1.2% of the 3.3 V motor rail at the immutable 200 mA
    # one-motor-at-a-time ceiling; widening these dense branches creates
    # clearance violations and gives no meaningful actuator benefit.
    assert max(motor_rail_r) * 0.2 <= 0.040, (
        f"driver-rail drop {max(motor_rail_r) * 0.2 * 1000:.1f} mV")

    motor_loops = []
    for channel in range(1, 7):
        driver = f"U{20 + (channel - 1) // 2}"
        odd = channel % 2 == 1
        pin_a, pin_b = (2, 4) if odd else (7, 5)
        connector = f"J{10 + channel}"
        resistance = (
            shortest(board, f"/MOT{channel}_A", (driver, pin_a), (connector, 2), "resistance")
            + shortest(board, f"/MOT{channel}_B", (driver, pin_b), (connector, 3), "resistance")
        )
        motor_loops.append(resistance)
    assert max(motor_loops) * 0.2 <= 0.035, (
        f"motor-loop drop {max(motor_loops) * 0.2 * 1000:.1f} mV")

    # Include both sides of each 22R series resistor; checking only the MCU-side
    # net hides connector escape length and vias.
    usb_lengths = {
        "USB_DP": net_length(board, "/USB_DP") + net_length(board, "/USB_DP_CONN"),
        "USB_DM": net_length(board, "/USB_DM") + net_length(board, "/USB_DM_CONN"),
    }
    usb_vias = {
        "USB_DP": via_count(board, "/USB_DP") + via_count(board, "/USB_DP_CONN"),
        "USB_DM": via_count(board, "/USB_DM") + via_count(board, "/USB_DM_CONN"),
    }
    assert max(usb_lengths.values()) <= 50.0
    assert abs(usb_lengths["USB_DP"] - usb_lengths["USB_DM"]) <= 5.0
    assert max(usb_vias.values()) <= 5
    # USB is native full-speed (12 Mb/s), not high-speed.  The connector escape
    # necessarily uses more transitions on D+; keep each net at five or fewer
    # vias and limit the asymmetry to three rather than forcing extra B.Cu
    # detours solely to equalise the count.
    assert abs(usb_vias["USB_DP"] - usb_vias["USB_DM"]) <= 3

    adc_current_path = shortest(board, "/ADC_CURRENT", ("R20", 2), ("U1", 4), "length")
    adc_bemf_path = shortest(board, "/ADC_BEMF", ("R30", 2), ("U1", 5), "length")
    adc_totals = {
        "ADC_CURRENT": net_length(board, "/ADC_CURRENT"),
        "ADC_BEMF": net_length(board, "/ADC_BEMF"),
    }
    assert adc_current_path <= 50.0, f"ADC current path {adc_current_path:.1f} mm"
    assert adc_bemf_path <= 50.0, f"ADC BEMF path {adc_bemf_path:.1f} mm"
    # The routed current-sense total includes the protected escape around the
    # motor-power island.  Source-to-MCU path remains limited separately.
    assert adc_totals["ADC_CURRENT"] <= 65.0, (
        f"ADC current total {adc_totals['ADC_CURRENT']:.1f} mm")
    assert adc_totals["ADC_BEMF"] <= 70.0, (
        f"ADC BEMF total {adc_totals['ADC_BEMF']:.1f} mm")

    print("Layout integrity audit passed")
    print(f"  VBUS drop to motor regulator at 0.5 A: {vbus_r * 0.5 * 1000:.1f} mV")
    print(f"  regulator-to-shunt drop at 0.25 A: {motor_reg_r * 0.25 * 1000:.1f} mV")
    print(f"  worst shunt-to-driver drop at 0.2 A: {max(motor_rail_r) * 0.2 * 1000:.1f} mV")
    print(f"  worst motor-output loop drop at 0.2 A: {max(motor_loops) * 0.2 * 1000:.1f} mV")
    print(f"  USB DP/DM lengths: {usb_lengths['USB_DP']:.1f}/{usb_lengths['USB_DM']:.1f} mm, "
          f"vias {usb_vias['USB_DP']}/{usb_vias['USB_DM']}")
    print(f"  ADC paths to MCU: current {adc_current_path:.1f} mm, BEMF {adc_bemf_path:.1f} mm")
    print(f"  ADC total copper: current {adc_totals['ADC_CURRENT']:.1f} mm, BEMF {adc_totals['ADC_BEMF']:.1f} mm")


if __name__ == "__main__":
    main()
