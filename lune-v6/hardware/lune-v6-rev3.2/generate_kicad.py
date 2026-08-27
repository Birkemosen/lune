#!/usr/bin/env python3
"""Generate the complete Lune V6 Rev 3.2 review schematic.

The script is the editable electrical source.  It requires kicad-sch-api 0.5.6
and the KiCad 10 symbol libraries.  Custom/alternate pin-compatible parts use
generic connector symbols with an explicit ``Pinout`` property so the physical
pad numbers remain reviewable without maintaining a private symbol library.

ECO ``rev3.2-B`` (commutation-tacho and runtime-timeout correction) supersedes
the first Rev 3.2 schematic.  See ``design-review.md`` for the findings and
``README.md`` for the change list.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

os.environ.setdefault("HOME", "/private/tmp")

import kicad_sch_api as ksa


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "lune-v6-rev3.2.kicad_sch"
CONTRACT = json.loads((ROOT / "design-contract.json").read_text(encoding="utf-8"))
KICAD_SYMBOLS = Path("/Applications/KiCad/KiCad.app/Contents/SharedSupport/symbols")

sch = None


def load_libraries() -> None:
    cache = ksa.get_symbol_cache()
    for name in (
        "4xxx_IEEE",
        "74xx",
        "Amplifier_Current",
        "Amplifier_Operational",
        "Comparator",
        "Connector",
        "Connector_Generic",
        "Device",
        "Diode",
        "Mechanical",
        "Power_Protection",
        "RF_Module",
        "Regulator_Linear",
        "Switch",
        "Transistor_FET",
        "power",
    ):
        path = KICAD_SYMBOLS / f"{name}.kicad_sym"
        if not cache.add_library_path(path):
            raise RuntimeError(f"Unable to load KiCad library: {path}")


def add(lib, ref, value, pos, footprint="", unit=1, rotation=0, **fields):
    component = sch.components.add(
        lib_id=lib,
        reference=ref,
        value=value,
        position=pos,
        footprint=footprint,
        unit=unit,
        rotation=rotation,
    )
    component.add_properties({name: str(field) for name, field in fields.items()}, hidden=True)
    return component


def net(comp, pin, name):
    """Attach a project-wide label directly to a symbol pin.

    These sheets are intentionally label-centric: the functional blocks are
    separated hierarchically and global labels carry the electrically named
    connections between them.  Keeping the label on the actual pin also
    avoids a dangling free end on a short visual stub.

    Because 100% of connectivity is carried by label *names*, ``check_design.py``
    re-derives the netlist from the generated sheets and fails on any net that
    appears only once - KiCad ignores that ERC class by default.
    """
    point = comp.get_pin_position(str(pin))
    if point is None:
        raise RuntimeError(f"Pin {comp.reference}.{pin} not found")
    point_y = 2 * comp.position.y - point.y
    # ``add_label`` is used here because kicad-sch-api's global-label writer
    # drops newly-created entries.  ``save_page`` upgrades these labels to
    # KiCad's native global-label syntax immediately after serialisation.
    sch.add_label(name, position=(point.x, point_y))


def nc(comp, pin):
    point = comp.get_pin_position(str(pin))
    if point is None:
        raise RuntimeError(f"Pin {comp.reference}.{pin} not found")
    point_y = 2 * comp.position.y - point.y
    sch.no_connects.add(position=(point.x, point_y))


# --------------------------------------------------------------------------- #
# Orthogonal wiring toolkit
# --------------------------------------------------------------------------- #
# Every symbol is placed at rotation 0.  kicad-sch-api 0.5.6 resolves pin
# coordinates inconsistently for rotated instances - a label requested on a
# rotated resistor's pin 1 lands on pin 2, and a label on a rotated op-amp pin
# does not connect at all - so routes are built from queried pin coordinates of
# unrotated symbols instead.  ``check_design.py`` compares the exported netlist
# against ``netlist-golden.json`` so any route that lands on the wrong pin or
# grazes an unrelated one shows up as a connectivity diff, not as a drawing that
# merely looks plausible.

GRID = 1.27


def snap(value: float) -> float:
    return round(round(value / GRID) * GRID, 3)


def xy(comp, pin):
    """True schematic connection point of a pin on an unrotated symbol.

    Deliberately resolved through the *component instance*.  The schematic-level
    ``get_component_pin_position`` is not unit-aware in kicad-sch-api 0.5.6: for
    the three-unit ``U34`` it returns the same coordinate for pins 1 and 7, 2
    and 6, and 3 and 5, which would quietly wire the wrong comparator.
    """
    point = comp.get_pin_position(str(pin))
    if point is None:
        raise RuntimeError(f"Pin {comp.reference}.{pin} not found")
    return (round(point.x, 3), round(2 * comp.position.y - point.y, 3))


def wire(*points):
    """Draw an orthogonal run as consecutive two-point segments.

    A KiCad ``wire`` element carries exactly two points.  Emitting a three-point
    polyline produces a file that still parses - the symbols are enumerated - but
    KiCad forms no nets on that sheet at all, so ERC stays silent and every pin
    quietly drops out of the netlist.  Corners are therefore separate segments
    with coincident endpoints, which is what KiCad connects on.
    """
    pts = [(round(x, 3), round(y, 3)) for x, y in points]
    for start, end in zip(pts, pts[1:]):
        if start != end:
            sch.wires.add(start=start, end=end)


def junction(point):
    sch.junctions.add((round(point[0], 3), round(point[1], 3)))


def label_at(net, point, rotation=0):
    sch.add_label(net, position=(round(point[0], 3), round(point[1], 3)), rotation=rotation)


def bus(pins, spine_y=None, spine_x=None, label=None, pad=6.35, reach=()):
    """Join ``(component, pin)`` pairs to one orthogonal spine.

    ``reach`` forces the spine to span extra coordinates.  ``label`` attaches a
    single global label to the far end, which is how a cross-sheet net is named
    exactly once per sheet instead of once per pin.  A junction is emitted only
    where three or more wire ends actually meet, which is what KiCad requires.
    """
    points = [xy(comp, pin) for comp, pin in pins]
    if (spine_y is None) == (spine_x is None):
        raise ValueError("bus() needs exactly one of spine_y / spine_x")

    if spine_y is not None:
        line = snap(spine_y)
        along = [p[0] for p in points] + [r[0] for r in reach]
        lo, hi = min(along), max(along)
        if label is not None:
            hi += pad
        wire((lo, line), (hi, line))
        meet = {}
        for point in points:
            if abs(point[1] - line) > 1e-6:
                wire(point, (point[0], line))
                meet[point[0]] = meet.get(point[0], 0) + 1
            elif lo + 1e-6 < point[0] < hi - 1e-6:
                # A pin sitting mid-wire does not connect in KiCad; only wire
                # endpoints and junctions do.  Force the connection point.
                junction(point)
        for at, stubs in meet.items():
            degree = stubs + (2 if lo + 1e-6 < at < hi - 1e-6 else 1)
            if degree >= 3:
                junction((at, line))
        if label is not None:
            label_at(label, (hi, line))
        return line

    line = snap(spine_x)
    along = [p[1] for p in points] + [r[1] for r in reach]
    lo, hi = min(along), max(along)
    if label is not None:
        hi += pad
    wire((line, lo), (line, hi))
    meet = {}
    for point in points:
        if abs(point[0] - line) > 1e-6:
            wire(point, (line, point[1]))
            meet[point[1]] = meet.get(point[1], 0) + 1
        elif lo + 1e-6 < point[1] < hi - 1e-6:
            junction(point)
    for at, stubs in meet.items():
        degree = stubs + (2 if lo + 1e-6 < at < hi - 1e-6 else 1)
        if degree >= 3:
            junction((line, at))
    if label is not None:
        label_at(label, (line, hi))
    return line


def link(a, b, label=None, corner="h"):
    """Two-pin orthogonal route: straight if aligned, otherwise one corner.

    ``label`` names the resulting net.  Every net gets exactly one name even
    when it is entirely local, because ``kicad-cli sch export netlist`` omits
    unnamed nets altogether - a wired-but-unnamed net is invisible to the
    golden-netlist guard, which is the one place a wiring mistake must not hide.
    """
    pa, pb = xy(a[0], a[1]), xy(b[0], b[1])
    if abs(pa[0] - pb[0]) < 1e-6 or abs(pa[1] - pb[1]) < 1e-6:
        wire(pa, pb)
        mid = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
    elif corner == "h":
        wire(pa, (pb[0], pa[1]), pb)
        mid = ((pa[0] + pb[0]) / 2, pa[1])
    else:
        wire(pa, (pa[0], pb[1]), pb)
        mid = (pa[0], (pa[1] + pb[1]) / 2)
    if label is not None:
        label_at(label, (snap(mid[0]), snap(mid[1])))


PASSIVE_DEFAULTS = {
    # Verified LCSC selections for the production BOM.  Explicit fields on a
    # call take precedence over these value/package defaults.
    ("R", "1k", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-071KL", "LCSC": "C22548"},
    ("R", "4.7k", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-074K7L", "LCSC": "C99782"},
    ("R", "5.1k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "0603WAF5101T5E", "LCSC": "C23186"},
    ("R", "10k", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-0710KL", "LCSC": "C98220"},
    ("R", "10k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-0710KL", "LCSC": "C98220"},
    ("R", "23.7k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-0723K7L", "LCSC": "C165751"},
    ("R", "33R", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "CRCW060333R0FKEA", "LCSC": "C844927"},
    ("R", "56k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-0756KL", "LCSC": "C114630"},
    ("R", "100k", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-07100KL", "LCSC": "C14675"},
    ("R", "100k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-07100KL", "LCSC": "C14675"},
    ("R", "180k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-07180KL", "LCSC": "C123419"},
    ("R", "360k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-07360KL", "LCSC": "C137740"},
    ("R", "453k 1%", "Resistor_SMD:R_0603_1608Metric"):
        {"MPN": "RC0603FR-07453KL", "LCSC": "C273765"},
    ("C", "4.7n", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "CC0603KRX7R9BB472", "LCSC": "C106218"},
    ("C", "10n", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "CL10B103KB8NNNC", "LCSC": "C1589"},
    ("C", "100n 10V", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "CC0603KRX7R9BB104", "LCSC": "C14663"},
    ("C", "100n", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "CC0603KRX7R9BB104", "LCSC": "C14663"},
    ("C", "1u", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "0603B105K160CT", "LCSC": "C108463"},
    ("C", "1u 10V", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "0603B105K160CT", "LCSC": "C108463"},
    ("C", "10u", "Capacitor_SMD:C_0805_2012Metric"):
        {"MPN": "TCC0805X7R106K100FT", "LCSC": "C380346"},
    ("C", "10u 10V", "Capacitor_SMD:C_0805_2012Metric"):
        {"MPN": "TCC0805X7R106K100FT", "LCSC": "C380346"},
    ("C", "22u 6.3V", "Capacitor_SMD:C_0805_2012Metric"):
        {"MPN": "TCC0805X5R226K6R3FT", "LCSC": "C380337"},
    # The runtime-timeout capacitor is the only remaining open sourcing item.
    # It must be C0G/NP0: a class-2 dielectric cannot hold the 50-90 s
    # qualified window once tolerance, tempco, DC bias and aging are stacked.
    # Initial tolerance can be trimmed with Rt after the first measurement;
    # temperature coefficient cannot, so the dielectric is not negotiable.
    ("C", "22n 5% 50V C0G", "Capacitor_SMD:C_1206_3216Metric"):
        {"Dielectric": "C0G_NP0_MANDATORY",
         "Sourcing": "OPEN_VERIFY_LCSC_22N_5PCT_50V_C0G_1206"},
    # 0805 -> 0603 shrink.  The 16 V rating is not margin, it is capacitance:
    # a 10 uF 10 V part in 0603 loses roughly half its value to DC bias at
    # 3.3 V, while a 16 V part keeps most of it.  X7R does not exist at
    # 10 uF/16 V in 0603, so this ratifies X5R in place of the X7R the 0805
    # part used: the derating band widens from -55..125 C to -55..85 C, which
    # the cabinet ambient still clears.  Same CCTC TCC family as the outgoing
    # part and the same K (+/-10%) tolerance.  Initial tolerance is noise next
    # to DC-bias loss, so the effective capacitance at 3.3 V is a measurement
    # item in the validation plan, not a sourcing question.
    ("C", "10u 16V", "Capacitor_SMD:C_0603_1608Metric"):
        {"MPN": "TCC0603X5R106K160CT", "LCSC": "C18164635",
         "Dielectric": "X5R_RATIFIED_VERIFY_EFFECTIVE_C_AT_3V3"},
}


def passive(ref, value, pos, a, b, footprint=None, **fields):
    lib = "Device:C" if ref.startswith("C") else "Device:R"
    if footprint is None:
        footprint = (
            "Capacitor_SMD:C_0603_1608Metric"
            if ref.startswith("C")
            else "Resistor_SMD:R_0603_1608Metric"
        )
    defaults = PASSIVE_DEFAULTS.get((ref[0], value, footprint), {})
    for name, field_value in defaults.items():
        fields.setdefault(name, field_value)
    comp = add(lib, ref, value, pos, footprint, **fields)
    net(comp, 1, a)
    net(comp, 2, b)
    return comp


def passive_wired(ref, value, pos, footprint=None, **fields):
    """Place a two-pin passive with no labels on its pins.

    Its pins are joined by drawn wires instead; call ``net()`` only for the ends
    that genuinely carry a rail or a cross-sheet name.
    """
    lib = "Device:C" if ref.startswith("C") else "Device:R"
    if footprint is None:
        footprint = (
            "Capacitor_SMD:C_0603_1608Metric"
            if ref.startswith("C")
            else "Resistor_SMD:R_0603_1608Metric"
        )
    defaults = PASSIVE_DEFAULTS.get((ref[0], value, footprint), {})
    for name, field_value in defaults.items():
        fields.setdefault(name, field_value)
    return add(lib, ref, value, pos, footprint, **fields)


def decoupling(
    ref,
    value,
    pos,
    rail,
    ground="GND",
    footprint="Capacitor_SMD:C_0603_1608Metric",
    **fields,
):
    return passive(ref, value, pos, rail, ground, footprint, **fields)


def section(text, pos):
    x, y = pos
    if x < 100:
        x += 38
    sch.add_text(text, (x, y), size=2.0, bold=True)


def note(text, pos):
    x, y = pos
    if x < 100:
        x = 105
    sch.add_text(text, (x, y), size=1.0)


def test_pad(ref, value, pos, signal=None):
    """A copper-only probe pad.  ``signal=None`` leaves the pin to be wired."""
    pad = add(
        "Connector:TestPoint",
        ref,
        value,
        pos,
        "TestPoint:TestPoint_Pad_D1.0mm",
        DNP="yes",
        Assembly="COPPER_ONLY",
    )
    if signal is not None:
        net(pad, 1, signal)
    return pad


def add_usb_and_power():
    section("USB-C / INPUT PROTECTION / SEPARATE 3V3 RAILS", (25, 18))
    j1 = add(
        "Connector:USB_C_Receptacle_USB2.0_16P",
        "J1",
        "TYPE-C-31-M-12",
        (60, 60),
        "Connector_USB:USB_C_Receptacle_HRO_TYPE-C-31-M-12",
        MPN="TYPE-C-31-M-12",
        LCSC="C165948",
    )
    for pin in ("A1", "A12", "B1", "B12", "SH"):
        net(j1, pin, "GND")
    for pin in ("A4", "A9", "B4", "B9"):
        net(j1, pin, "VBUS_RAW")
    net(j1, "A5", "CC1")
    net(j1, "B5", "CC2")
    # ECO rev3.2-B: the Rev3.2-A 22R series resistors are removed.  ESP32-S3
    # native USB is a matched full-speed driver; Espressif reference designs
    # route D+/D- straight to the module.  22R raised the single-ended source
    # impedance well away from the ~45 ohm target for no protection benefit.
    for pin in ("A8", "B8"):
        nc(j1, pin)
    r1 = passive_wired("R1", "5.1k 1%", (110, 75), LCSC="C23186")
    net(r1, 2, "GND")
    r2 = passive_wired("R2", "5.1k 1%", (132, 75), LCSC="C23186")
    net(r2, 2, "GND")
    link((j1, "A5"), (r1, 1), label="CC1")
    link((j1, "B5"), (r2, 1), label="CC2")
    decoupling("C1", "1u 10V", (90, 95), "VBUS_RAW")

    # The USBLC6 channel pins sit on both sides of the symbol at one height, so
    # each data pair is drawn as a straight run passing through the clamp - which
    # is how the symbol is meant to read - and named once instead of five times.
    esd = add(
        "Power_Protection:USBLC6-2SC6",
        "U5",
        "USBLC6-2SC6",
        (170, 60),
        "Package_TO_SOT_SMD:SOT-23-6",
        MPN="USBLC6-2SC6",
        LCSC="C7519",
    )
    net(esd, 2, "GND")
    net(esd, 5, "VBUS_RAW")
    bus(((j1, "A7"), (j1, "B7"), (esd, 1), (esd, 6)),
        spine_y=xy(esd, 1)[1], label="USB_DM")
    bus(((j1, "A6"), (j1, "B6"), (esd, 3), (esd, 4)),
        spine_y=xy(esd, 3)[1], label="USB_DP")

    # TPS2553 DBV: 1 IN, 2 GND, 3 EN, 4 nFAULT, 5 ILIM, 6 OUT.
    # The -1 suffix is active-high EN with latch-off fault response, so EN tied
    # to VBUS_RAW is permanently enabled.  Latch-off means an overcurrent or
    # reverse-voltage event kills the whole board, including the ESP32, until
    # USB is physically re-plugged - see validation-plan.md section 6.
    u2 = add(
        "Connector_Generic:Conn_01x06",
        "U2",
        "TPS2553DBVR-1",
        (250, 60),
        "Package_TO_SOT_SMD:SOT-23-6",
        MPN="TPS2553DBVR-1",
        LCSC="C111738",
        Pinout="1 IN; 2 GND; 3 EN; 4 nFAULT; 5 ILIM; 6 OUT",
    )
    net(u2, 1, "VBUS_RAW")
    net(u2, 2, "GND")
    net(u2, 3, "VBUS_RAW")
    net(u2, 4, "FAULT_N_RAW")
    net(u2, 6, "VBUS_PROTECTED")
    r5 = passive_wired("R5", "23.7k 1%", (220, 85))
    net(r5, 2, "GND")
    link((u2, 5), (r5, 1), label="USB_ILIM")
    decoupling("C2", "10u 16V", (280, 40), "VBUS_PROTECTED", footprint="Capacitor_SMD:C_0603_1608Metric")
    decoupling("C3", "100n 10V", (298, 40), "VBUS_PROTECTED")

    # SY8089AAAC: 1 EN, 2 GND, 3 LX, 4 IN, 5 FB.  Internally compensated, so
    # the Rev3.2-A DNP feedforward pad (C46) is removed.
    u3 = add(
        "Connector_Generic:Conn_01x05",
        "U3",
        "SY8089AAAC",
        (360, 60),
        "Package_TO_SOT_SMD:SOT-23-5",
        MPN="SY8089AAAC",
        LCSC="C78988",
        Pinout="1 EN; 2 GND; 3 LX; 4 IN; 5 FB",
    )
    net(u3, 1, "VBUS_PROTECTED")
    net(u3, 2, "GND")
    net(u3, 4, "VBUS_PROTECTED")
    decoupling("C4", "10u 16V", (330, 35), "VBUS_PROTECTED", footprint="Capacitor_SMD:C_0603_1608Metric")
    l1 = add(
        "Device:L",
        "L1",
        "2.2uH 2.2A",
        (330, 88),
        "Inductor_SMD:L_Sunlord_SWPA4018S",
        MPN="SPH4018H2R2MT",
        LCSC="C370436",
    )
    net(l1, 2, "+3V3_LOGIC")
    link((u3, 3), (l1, 1), label="LOGIC_SW")
    decoupling("C5", "22u 6.3V", (300, 112), "+3V3_LOGIC", footprint="Capacitor_SMD:C_0805_2012Metric")
    decoupling("C6", "22u 6.3V", (318, 112), "+3V3_LOGIC", footprint="Capacitor_SMD:C_0805_2012Metric")
    r104 = passive_wired("R104", "453k 1%", (410, 82))
    net(r104, 1, "+3V3_LOGIC")
    r105 = passive_wired("R105", "100k 1%", (410, 104))
    net(r105, 2, "GND")
    bus(((u3, 5), (r104, 2), (r105, 1)), spine_x=390, label="LOGIC_FB")

    u4 = add(
        "Regulator_Linear:AP2112K-3.3",
        "U4",
        "AP2112K-3.3TRG1",
        (470, 60),
        "Package_TO_SOT_SMD:SOT-23-5",
        MPN="AP2112K-3.3TRG1",
        LCSC="C51118",
    )
    net(u4, 1, "VBUS_PROTECTED")
    net(u4, 2, "GND")
    net(u4, 3, "VBUS_PROTECTED")
    nc(u4, 4)
    net(u4, 5, "+3V3_MOTOR_REG")
    decoupling("C7", "10u 16V", (500, 40), "+3V3_MOTOR_REG", footprint="Capacitor_SMD:C_0603_1608Metric")
    decoupling("C8", "100n 10V", (518, 40), "+3V3_MOTOR_REG")
    # ECO rev3.2-B: the Rev3.2-A 220 uF 6.3x7.7 mm electrolytic is replaced by
    # a second stocked 22 uF ceramic.  The qualified actuator draws 14-19 mA
    # running and 23-50 mA at a hard stop, so the motor rail never needed
    # electrolytic bulk; this removes the only wet part, the tallest passive
    # and one BOM line.
    decoupling("C9", "22u 6.3V", (536, 40), "+3V3_MOTOR_REG", footprint="Capacitor_SMD:C_0805_2012Metric")

    fb = add(
        "Device:FerriteBead",
        "FB1",
        "600R@100MHz",
        (575, 60),
        "Inductor_SMD:L_0603_1608Metric",
        MPN="GZ1608D601TF",
        LCSC="C1002",
    )
    net(fb, 1, "+3V3_LOGIC")
    net(fb, 2, "+3V3_ANALOG")
    decoupling("C10", "10u 16V", (605, 40), "+3V3_ANALOG", footprint="Capacitor_SMD:C_0603_1608Metric")
    decoupling("C11", "100n 10V", (623, 40), "+3V3_ANALOG", LCSC="C14663")
    note("TPS2553-1 is latch-off: an input fault removes power from the ESP32 too. Validate USB inrush and the ~1 A limit.", (110, 140))
    note("Logic buck, motor LDO and analog ferrite branch share one deliberate ground plane.", (110, 149))
    note("USB D+/D- run straight from J1 to U1; no series resistors (ECO rev3.2-B).", (110, 158))


def add_esp32():
    section("EMBEDDED ESP32-S3-WROOM-1-N8R8", (420, 18))
    u1 = add(
        "RF_Module:ESP32-S3-WROOM-1",
        "U1",
        CONTRACT["module"],
        (300, 120),
        "RF_Module:ESP32-S3-WROOM-1",
        MPN=CONTRACT["module"],
        LCSC="C2913201",
    )
    for pin in (1, 40, 41):
        net(u1, pin, "GND")
    net(u1, 2, "+3V3_LOGIC")
    module_pin_nets = {
        3: "ESP_EN",             # EN
        # The analog block moved to the module's east side.  ADC1 is GPIO1..10 and
        # ADC2 is unusable while WiFi runs, so pads 38/39 (IO2/IO1) are the only
        # ADC-capable pins on that side - pads 34/35 carry IO41/IO42, which have
        # no ADC at all.  This frees the module's west side for the USB pair on
        # pads 13/14 and keeps the buck away from the tacho chain.
        38: "ADC_CURRENT",       # GPIO2  / ADC1_CH1
        39: "ADC_TACHO",         # GPIO1  / ADC1_CH0 amplified commutation ripple
        31: "COMM_TACHO_N",      # GPIO38 / PCNT-RMT capture, follows the comparator east
        # LATCH_ARM/LATCH_STATE stay west: they serve U35, which belongs over the
        # driver row, and both are slow digital.  IO16/IO17 are ADC2 channels that
        # WiFi makes unusable anyway, so nothing is wasted by keeping them here.
        # Swapped relative to Rev3.1 to match the 74LVC1G74 pin order: CLK on
        # U35 pin 1 and /Q on pin 3 sit on the same side of the package, so
        # putting LATCH_STATE on the northern module pad and LATCH_ARM on the
        # southern one lets the arm network (R25/C23/Q1) and the /Q readback
        # route without crossing.  Both GPIOs are plain I/O - ADC2 channels that
        # WiFi makes unusable anyway - so the swap is free.
        9: "LATCH_STATE",        # GPIO16
        10: "LATCH_ARM",         # GPIO17
        # Digital functions are kept OFF ADC1 (GPIO1..10), which is the only ADC
        # usable while WiFi runs.  ADC2 (GPIO11..20) is unusable then anyway, so
        # it is where slow digital belongs.  MOTOR_ENABLE and ONEWIRE_MCU moved
        # here from GPIO10 and GPIO42, and both moved again in rev3.2-H to sit
        # one pad further south on the west row.  MOTOR_ENABLE on pad 11 leaves
        # at y = 49.19, which is 0.19 mm off the latitude of the safety cluster
        # it feeds (U7 49.01, R30 48.90, Q1 49.04), so the run is a straight
        # west line instead of a 4 mm drop across the LATCH_STATE/LATCH_ARM
        # escapes.  ONEWIRE_MCU follows onto pad 12 and spends an ADC1 channel
        # doing it - see adc1_digital_exceptions in the contract.
        11: "MOTOR_ENABLE",      # GPIO18 / ADC2, worthless for analog
        12: "ONEWIRE_MCU",       # GPIO8  / ADC1_CH7, spent on purpose
        # I2C moved off GPIO8/GPIO9 - two ADC1 channels - onto two unencumbered
        # pins that are adjacent on the module's south edge, east of centre, so
        # the display connector can sit in the east with SDA/SCL side by side.
        23: "I2C_SDA",           # GPIO21
        24: "I2C_SCL",           # GPIO47
        13: "USB_DM",            # GPIO19 native USB D-
        14: "USB_DP",            # GPIO20 native USB D+
        # Pads 18..22 are IO10..IO14 - all plain digital I/O, none on the
        # forbidden list, no strapping or peripheral binding - so the order is
        # free and is chosen to match how the four address lines and MOTOR_ENABLE
        # leave the module toward U24.  GPIO10 is an ADC1 channel spent on
        # digital, which costs little: pads 5-7 carry IO5-IO7, three more free
        # ADC1 channels (pad 4 carries STATUS_LED_N and pad 12 carries
        # ONEWIRE_MCU, both declared exceptions).  MOTOR_ENABLE cannot move to IO3 or IO46 - both are
        # strapping pins, so its 100k safe-state pulldown would be sampled as
        # boot configuration at every reset, and that pulldown is what defines
        # coast when the GPIO is high-Z.
        19: "MOTOR_ADDR1",       # GPIO11
        20: "MOTOR_ADDR0",       # GPIO12
        21: "MOTOR_ADDR3",       # GPIO13 - a plain address bit since the remap;
        #                          it no longer selects direction.
        22: "MOTOR_ADDR2",       # GPIO14
        # STATUS_LED_N moved from pad 25 (GPIO48) to pad 4 (GPIO4) in rev3.2-G.
        # This deliberately spends an ADC1 channel, which the ADC1 reserve
        # otherwise forbids - see adc1_digital_exceptions in the contract.  The
        # reason is layout, not electrical: on pad 25 the LED left the module on
        # the south row and put D3 and R23 in the x 49-52 / y 38-43 pocket,
        # which is the only place the 3V3_LOGIC, VBUS_PROTECTED and 3V3_MOTOR
        # spines can be re-arranged to open a two-wide channel for UART and I2C.
        # R23's supply tap is also what drags the 3V3_LOGIC spine up to y=37.21.
        # Pad 4 leaves west instead, clear of that band.  Every other free pad on
        # the west and south rows is either an ADC1 channel or a strapping pin,
        # so no cheaper pin exists: 15/17/18 are IO3/IO9/IO10, 16 and 26 are
        # IO46/IO45 (strapping), 28-30 are the octal PSRAM, and 32-35 are on the
        # east side with the analog island.
        4: "STATUS_LED_N",       # GPIO4 / ADC1_CH3, spent on purpose
        27: "BOOT_N",            # GPIO0
        # ECO rev3.2-H splits both console lines with a series resistor, so the
        # module pins carry *_MCU and the header carries *_DBG.  The GPIO
        # contract tracks the module-side names.
        36: "UART_RX_MCU",       # GPIO44 (RXD0) -> R54 -> UART_RX_DBG at J22
        37: "UART_TX_MCU",       # GPIO43 (TXD0) -> R53 -> UART_TX_DBG at J22
    }
    for pin, name in module_pin_nets.items():
        net(u1, pin, name)
    used = {1, 2, 40, 41, *module_pin_nets.keys()}
    for pin in range(1, 42):
        if pin not in used:
            nc(u1, pin)

    # Console edge damping, ECO rev3.2-H.  J22 sits 34 mm east of the module and
    # the run crosses the analog island's south flank, while TXD0 is a full-speed
    # CMOS output with roughly 2 ns edges.  1k against the ~40 pF the run
    # presents stretches that to ~90 ns, which is 1% of a bit at 115200 and
    # removes the harmonic content the ADC and tacho nodes would otherwise see.
    # Both resistors sit at the module end so the whole run is damped; the RXD0
    # one is pin protection rather than edge rate, since that edge is driven by
    # whatever adapter is plugged into J22.  1k is already a BOM line six times
    # over, so this adds no part number.
    passive("R53", "1k", (500, 100), "UART_TX_MCU", "UART_TX_DBG")
    passive("R54", "1k", (500, 140), "UART_RX_MCU", "UART_RX_DBG")

    # Reset and boot groups are local, so both are drawn: pull-up, filter and
    # button hanging off one node into the module pin.
    r8 = passive_wired("R8", "10k", (240, 90))
    net(r8, 1, "+3V3_LOGIC")
    c12 = passive_wired("C12", "1u", (215, 108))
    net(c12, 2, "GND")
    sw1 = add(
        "Switch:SW_Push",
        "SW1",
        "RESET",
        (215, 125),
        "Button_Switch_SMD:SW_SPST_PTS810",
        MPN="PTS810SJG250SMTRLFS",
        LCSC="C221895",
    )
    net(sw1, 2, "GND")
    bus(((r8, 2), (u1, 3), (c12, 1), (sw1, 1)), spine_x=260, label="ESP_EN")
    r9 = passive_wired("R9", "10k", (240, 160))
    net(r9, 1, "+3V3_LOGIC")
    sw2 = add(
        "Switch:SW_Push",
        "SW2",
        "BOOT",
        (215, 180),
        "Button_Switch_SMD:SW_SPST_PTS810",
        MPN="PTS810SJG250SMTRLFS",
        LCSC="C221895",
    )
    net(sw2, 2, "GND")
    bus(((u1, 27), (r9, 2), (sw2, 1)), spine_x=272, label="BOOT_N")
    decoupling("C13", "10u 16V", (355, 175), "+3V3_LOGIC", footprint="Capacitor_SMD:C_0603_1608Metric")
    decoupling("C14", "100n", (373, 175), "+3V3_LOGIC", LCSC="C14663")
    note("Motor-control GPIOs avoid GPIO0/3/19/20/45/46; GPIO35-37 belong to the N8R8 octal PSRAM.", (110, 195))
    note("GPIO5 samples the amplified commutation ripple: qualification evidence and a digital cross-check on COMM_TACHO_N.", (110, 204))


def add_decoder_logic():
    section("HARDWARE-LATCHED ONE-HOT MOTOR SELECTION", (25, 125))
    decoder = add(
        "4xxx_IEEE:4514",
        "U24",
        "74HC4514PW,118",
        (110, 250),
        "Package_SO:TSSOP-24_4.4x7.8mm_P0.65mm",
        MPN="74HC4514PW,118",
        LCSC="C58910",
    )
    net(decoder, 2, "MOTOR_ADDR0")
    net(decoder, 3, "MOTOR_ADDR1")
    net(decoder, 21, "MOTOR_ADDR2")
    net(decoder, 22, "MOTOR_ADDR3")
    net(decoder, 12, "GND")
    net(decoder, 24, "+3V3_LOGIC")
    # Address-to-output assignment is a layout choice, not the datasheet's, and
    # this is the third iteration - the first two got the geometry wrong.
    #
    # U24 is centred at the driver row's own latitude, so its output pins sit
    # level with the driver BODIES, not with their input rows ~2.5 mm further
    # north.  There is therefore no straight path sideways: every output has to
    # go north around the package first, run along, and drop south into the pin
    # row.  In that topology the SOUTHERNMOST decoder pin ends up in the
    # southernmost lane of the bundle and drops at the NEAREST destination, so
    # the order inverts against the naive straight-across assumption.
    #
    #     side A (pins 4..7)   -> U20, west
    #     side B (pins 13..16) -> U21, the NEAR eastern driver
    #     side B (pins 17..20) -> U22, the FAR eastern driver
    #
    # Note the east groups are the other way round from a straight-across
    # layout: both share one northbound channel, so the southern pins have to
    # serve the nearer driver or the two groups cross inside the channel.
    #
    # Within each group FWD takes the two OUTER pins and REV the two inner ones.
    # That mirror symmetry is not cosmetic - the DRV8411's two bridges are
    # themselves mirrored along the input flank (AIN1, AIN2 ... BIN2, BIN1), so
    # the pair order that is crossing-free for motor A is reversed for motor B.
    #
    # Bit 0 is no longer uniformly the direction bit; it alternates with channel
    # parity. Firmware uses the 12-entry channel_address_map in the contract.
    output_pins = {
        4: "FWD1", 5: "REV1", 6: "REV2", 7: "FWD2",           # -> U20, west
        13: "FWD3", 14: "REV3", 15: "REV4", 16: "FWD4",       # -> U21, near east
        17: "FWD5", 18: "REV5", 19: "REV6", 20: "FWD6",       # -> U22, far east
    }
    for pin, name in output_pins.items():
        net(decoder, pin, name)
    for pin in (8, 9, 10, 11):
        nc(decoder, pin)
    decoupling("C15", "100n", (175, 210), "+3V3_LOGIC", LCSC="C14663")

    # SN74LVC1G00DBV: 1=A, 2=B, 3=GND, 4=Y, 5=VCC.
    # Retained deliberately.  DRIVE_PERMIT already gates every driver nSLEEP,
    # but the NAND gives the latch a second, independent path to remove drive.
    # Dropping it would save two placements at the cost of a protection layer.
    nand = add(
        "Connector_Generic:Conn_01x05",
        "U25",
        "SN74LVC1G00DCKR",
        (110, 310),
        "Package_TO_SOT_SMD:SOT-353_SC-70-5",
        MPN="SN74LVC1G00DCKR",
        LCSC="C8185",
        Pinout="1 A; 2 B; 3 GND; 4 Y; 5 VCC",
    )
    net(nand, 1, "MOTOR_ENABLE")
    net(nand, 2, "DRIVE_PERMIT")
    net(nand, 3, "GND")
    net(nand, 5, "+3V3_LOGIC")
    decoupling("C16", "100n", (150, 310), "+3V3_LOGIC", LCSC="C14663")

    # Retained for S-01: the 4514 has no input pulldowns, so an unpowered or
    # reset ESP32 would otherwise leave four HC inputs floating.
    # The five selection pull-downs and the DRIVE_PERMIT pull-down stay labelled:
    # each net fans out from the module across the sheet, which is what a name is
    # for.  The inhibit node, which gates both decoder control pins, is drawn.
    for index, name in enumerate(
        ("MOTOR_ADDR0", "MOTOR_ADDR1", "MOTOR_ADDR2", "MOTOR_ADDR3", "MOTOR_ENABLE"),
        10,
    ):
        passive(f"R{index}", "100k", (330 + (index - 10) * 20, 250), name, "GND")
    passive("R15", "100k", (430, 250), "DRIVE_PERMIT", "GND")
    tp4 = test_pad("TP4", "DECODER_INHIBIT", (70, 330), None)
    bus(((decoder, 1), (decoder, 23), (nand, 4), (tp4, 1)), spine_x=70,
        label="DECODER_INHIBIT")
    note("LE=E=DECODER_INHIBIT: address is transparent while off and immutable while driving.", (110, 350))
    note("Only Q0..Q5 and Q8..Q13 are wired; invalid addresses 6/7 cannot energize a bridge.", (110, 359))


def add_current_fault_latch_and_timeout():
    section("CALIBRATED CURRENT / PERSISTENT FAULT / INDEPENDENT TIMEOUT", (60, 30))

    # ---- Block 1: rail shunt, current amplifier, ADC anti-alias -----------
    passive(
        "RSH1",
        "0.5R 1% 1W",
        (60, 50),
        "+3V3_MOTOR_REG",
        "+3V3_MOTOR",
        "Resistor_SMD:R_1206_3216Metric",
        MPN="HoYH1206-1W-500mR-1%",
        LCSC="C601092",
        Layout="KELVIN_PAIR_REQUIRED",
    )
    sense = add(
        "Amplifier_Current:INA180A1",
        "U32",
        "INA180A1 x20",
        (105, 70),
        "Package_TO_SOT_SMD:SOT-23-5",
        MPN="INA180A1IDBVR",
        LCSC="C122228",
    )
    net(sense, 3, "+3V3_MOTOR_REG")
    net(sense, 4, "+3V3_MOTOR")
    net(sense, 5, "+3V3_ANALOG")
    net(sense, 2, "GND")
    decoupling("C17", "100n", (80, 100), "+3V3_ANALOG", LCSC="C14663")
    # ADC anti-alias only.  The Rev3.2-A BAT54S clamp (D1) is removed: the
    # INA180 is powered from +3V3_ANALOG and physically cannot drive this node
    # outside 0..3V3, so the clamp protected nothing while its reverse leakage
    # through R20 added an uncalibratable temperature-dependent offset at the
    # 14 mA operating point.
    tp7 = test_pad("TP7", "CURRENT_RAW", (130, 70), None)
    r20 = passive_wired("R20", "1k", (150, 84))
    bus(((sense, 1), (tp7, 1), (r20, 1)), spine_y=70, label="CURRENT_RAW")

    c18 = passive_wired("C18", "100n", (172, 105), LCSC="C14663")
    net(c18, 2, "GND")
    tp1 = test_pad("TP1", "ADC_CURRENT", (195, 95), None)
    bus(((r20, 2), (c18, 1), (tp1, 1)), spine_y=95, label="ADC_CURRENT")

    # Rail overcurrent: 3.3 V * 56k/(10k+56k) = 2.8 V -> 280 mA at 10 V/A.
    # ECO rev3.2-B: the comparator now senses CURRENT_RAW directly instead of
    # the filtered ADC node.  An output-to-GND short bypasses the xISEN
    # resistor entirely and the DRV8411 OCP is 4 A, so this comparator is the
    # only fast protection for that fault; the 1k/100n ADC filter was adding
    # 100 us of delay to it.  Nuisance margin holds even in the bounding case
    # where the whole current-regulation chop ripple crosses the shunt: peak
    # bridge current is 232 mA = 2.32 V against the 2.80 V threshold.  In
    # practice the driver's local 10 uF absorbs most of the 50 kHz ripple.
    r21 = passive_wired("R21", "10k 1%", (225, 150))
    net(r21, 1, "+3V3_ANALOG")
    r22 = passive_wired("R22", "56k 1%", (225, 175))
    net(r22, 2, "GND")
    c19 = passive_wired("C19", "100n", (205, 163), LCSC="C14663")
    net(c19, 2, "GND")
    cmp1 = add(
        "Comparator:LMV393",
        "U34",
        "LMV393",
        (270, 150),
        "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
        unit=1,
        MPN="LMV393IDR",
        LCSC="C7984",
    )
    bus(((cmp1, 3), (r21, 2), (c19, 1), (r22, 1)), spine_x=240, label="FLIM_REF")
    net(cmp1, 2, "CURRENT_RAW")
    net(cmp1, 1, "FAULT_N_RAW")
    cmpp = add(
        "Comparator:LMV393",
        "U34",
        "LMV393",
        (270, 195),
        "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
        unit=3,
        MPN="LMV393IDR",
        LCSC="C7984",
    )
    net(cmpp, 8, "VBUS_PROTECTED")
    net(cmpp, 4, "GND")
    decoupling("C21", "100n 10V", (245, 195), "VBUS_PROTECTED", LCSC="C14663")

    # ---- Block 3: shared wired-AND fault net, latch and arm path ----------
    # C20 also guarantees a bounded power-on reset.  The fault net fans out to
    # the comparator, both MOSFETs, three driver nFAULT pins and the TPS2553, so
    # those remote pins keep labels; only the local pull-up group is drawn.
    r23 = passive_wired("R23", "10k", (350, 70))
    net(r23, 1, "+3V3_LOGIC")
    c20 = passive_wired("C20", "100n", (372, 90), LCSC="C14663")
    net(c20, 2, "GND")
    tp3 = test_pad("TP3", "FAULT_N_RAW", (395, 80), None)
    bus(((r23, 2), (c20, 1), (tp3, 1)), spine_y=80, label="FAULT_N_RAW")

    # Nexperia 74LVC1G74DP TSSOP8: CP,D,/Q,GND,Q,/RD,/SD,VCC.
    latch = add(
        "Connector_Generic:Conn_01x08",
        "U35",
        "74LVC1G74DP,125",
        (430, 150),
        "Package_SO:TSSOP-8_3x3mm_P0.65mm",
        MPN="74LVC1G74DP,125",
        LCSC="C458768",
        Pinout="1 CP; 2 D; 3 /Q; 4 GND; 5 Q; 6 /RD; 7 /SD; 8 VCC",
    )
    net(latch, 2, "+3V3_LOGIC")
    net(latch, 3, "LATCH_STATE")
    net(latch, 4, "GND")
    net(latch, 5, "DRIVE_PERMIT")
    net(latch, 6, "FAULT_N_RAW")
    net(latch, 7, "+3V3_LOGIC")
    net(latch, 8, "+3V3_LOGIC")
    decoupling("C22", "100n", (455, 150), "+3V3_LOGIC", LCSC="C14663")

    # AC coupling makes clamp release incapable of becoming a new arm edge.
    # ARM_EDGE_IN and ARM_CLK are both local, so the whole arm path is drawn:
    # the coupling pair on the left, the pull-down and the MOSFET clamp hanging
    # off the clock node, and the flip-flop clock entering from the right.
    r24 = passive_wired("R24", "10k", (360, 110))
    net(r24, 1, "LATCH_ARM")
    c23 = passive_wired("C23", "10n", (360, 130))
    link((r24, 2), (c23, 1), label="ARM_EDGE_IN")
    r25 = passive_wired("R25", "100k", (338, 150))
    net(r25, 2, "GND")
    arm_inhibit = add(
        "Transistor_FET:2N7002",
        "Q1",
        "2N7002 ARM INHIBIT",
        (395, 175),
        "Package_TO_SOT_SMD:SOT-23",
        MPN="2N7002",
        LCSC="C8545",
    )
    net(arm_inhibit, 1, "MOTOR_ENABLE")
    net(arm_inhibit, 2, "GND")
    bus(((c23, 2), (latch, 1), (r25, 1), (arm_inhibit, 3)), spine_x=375,
        label="ARM_CLK")

    # -------- No hardware runtime cutoff (ECO rev3.2-C, deliberate) --------
    # Rev3.2-B carried a 74HC4060 max-on-time watchdog (U36 + Rt/Rs/Ct + Q2)
    # that reset on LATCH_STATE and injected a latched fault after ~71 s.  It
    # is removed, and the removal is a hazard-assessment result, not an
    # omission - see design-contract.json "actuator_overrun_hazard".
    #
    # The hazard it addressed is bounded: an over-driven actuator strips its
    # own gear train, in the opening direction only.  If the head parts from
    # the manifold the valve insert and its seal stay behind, so the pin is
    # released to full flow - a closed system, no water escape, and the floor
    # cannot exceed the mixing-valve supply temperature.  Worst case is one
    # actuator, and the stuck-open loop is self-announcing.  The rail
    # overcurrent comparator gives no protection here at all: stall current
    # sits below its 280 mA trip, and the damage mechanism is torque x time.
    #
    # Against that, the part cost more than it saved.  Its oscillator network
    # shipped rotated one position around the timing star (Ct on RTC, Rt on
    # RS, Rs on CTC), which neither ERC nor check_design could see because the
    # timeout was computed from contract values rather than from topology.  And
    # bounding *total armed time* collided with learning mode, which must drive
    # to both end stops: 659 + 1048 commutation counts over a 20-40 Hz band is
    # 43-85 s against a 56-86 s cutoff, so commissioning could latch a fault
    # that firmware is by design unable to clear.
    #
    # Retained instead: the firmware runtime limit already in service, the
    # commutation tacho as rotation/stall evidence, the ESP32 task watchdog,
    # and R10-R15 for a defined safe state whenever the GPIOs go high-Z.  Note
    # that the latch no longer self-disarms when left idle; that is benign,
    # because MOTOR_ENABLE falling to its 100k pulldown drives DECODER_INHIBIT
    # high and the 4514 turns every output off regardless of DRIVE_PERMIT.

    # ------------- Continuous commutation tacho (ECO rev3.2-B) --------------
    # Measured HmIP VdMot + Danfoss RA-N: 14-19 mA running, 659/1048 commutation
    # events per stroke, i.e. a ~20-40 Hz fundamental and roughly 0.7-3 mA of
    # ripple = 7-30 mV at CURRENT_RAW (10 V/A).  The DRV8411 current-regulation
    # chopper runs near 50 kHz (t_OFF = 20 us).  The stage is therefore a
    # deliberate band-pass, not a wideband gain block:
    #
    #   R45*C44  = 100k * 1u   -> 1.6 Hz high-pass (100 ms settling; blank
    #                             drive start, well inside the 250 ms guard)
    #   R46/R47  = 100k / 1k   -> gain ~84-90 across 20-40 Hz, 101 asymptotic
    #   R46*C47  = 100k * 4.7n -> 339 Hz low-pass, -43 dB at the 50 kHz chop
    #
    # TACHO_REF is a stiff 1k/1k mid-rail bypassed by 22 uF so the gain-setting
    # return no longer sees a 23.5k source impedance, and the comparator no
    # longer injects its transitions back into the reference.
    #
    # Hysteresis is applied to the comparator's NON-inverting input (pin 5).
    # Rev3.2-A fed it back to pin 6, the threshold input; that is negative
    # feedback and produced a ~144 mV relaxation-oscillator dead band instead
    # of a Schmitt trigger.  R49/R50 give 3.3 * 4.7k/104.7k = 148 mV at the
    # comparator, i.e. ~1.7 mV at CURRENT_RAW or ~0.17 mA of ripple current -
    # 4x to 17x below the expected commutation ripple.
    # TACHO_REF is treated as a local reference rail rather than a drawn node:
    # it feeds the input bias, the gain return and the comparator threshold at
    # six points spread across the block, which is exactly the case a named rail
    # exists for.  Everything downstream of it is drawn.
    passive("R43", "1k", (80, 315), "+3V3_ANALOG", "TACHO_REF")
    passive("R44", "1k", (80, 340), "TACHO_REF", "GND")
    decoupling("C43", "22u 6.3V", (105, 330), "TACHO_REF", footprint="Capacitor_SMD:C_0805_2012Metric")
    c44 = passive_wired("C44", "1u", (140, 332))
    net(c44, 1, "CURRENT_RAW")
    r45 = passive_wired("R45", "100k", (165, 348))
    net(r45, 2, "TACHO_REF")
    # TLV9001 ships two different pinouts (datasheet SBOS833R Table 6-1):
    #   DBV SOT-23 and T-DCK : 1=OUT  2=V-  3=IN+  4=IN-  5=V+   <- ordered part
    #   DCK SC70, DRL, U-DBV : 1=IN+  2=V-  3=IN-  4=OUT  5=V+
    # KiCad only ships "TLV9001IDCK", which is the second one.  Rev3.2-A drew a
    # DBV part with that symbol, so the schematic showed the amplifier with its
    # input and output swapped and ERC checked the wrong pins - the board was
    # right, the drawing was not.  OPA310xDBV is used purely as a correctly
    # numbered DBV carrier symbol; it is geometrically identical to the INA180
    # beside it.  check_design.py asserts pin 1 is the output.
    tacho_amp = add(
        "Amplifier_Operational:OPA310xDBV",
        "U37",
        "TLV9001IDBVR",
        (215, 340),
        "Package_TO_SOT_SMD:SOT-23-5",
        MPN="TLV9001IDBVR",
        LCSC="C398363",
        Symbol_Carrier="OPA310xDBV_CHOSEN_FOR_TLV9001_DBV_PINOUT",
    )
    net(tacho_amp, 2, "GND")
    net(tacho_amp, 5, "+3V3_ANALOG")

    # Input high-pass: CURRENT_RAW through C44 to the bias node, R45 returning
    # it to the mid-rail reference.
    ac_line = bus(((c44, 2), (r45, 1), (tacho_amp, 3)), spine_y=337.46)
    label_at("TACHO_AC", (snap(152), ac_line))

    # Feedback: R46 sets the gain against R47, C47 sets the 339 Hz corner.  Both
    # feedback parts sit above the amplifier and return to the inverting input,
    # so the loop is a visible rectangle instead of four matching net names.
    r46 = passive_wired("R46", "100k", (250, 318))
    c47 = passive_wired("C47", "4.7n", (275, 318))
    r47 = passive_wired("R47", "1k", (300, 355))
    net(r47, 2, "TACHO_REF")
    # The amplifier's two inputs share an x, so the inverting input cannot rise
    # vertically without shorting to the non-inverting pin: it steps left first.
    # Both the riser and the spine are derived from the same snapped values so
    # their endpoints coincide exactly.
    fb_line, fb_x = snap(352), snap(198)
    fb_pin = xy(tacho_amp, 4)
    wire(fb_pin, (fb_x, fb_pin[1]), (fb_x, fb_line))
    bus(((r46, 2), (c47, 2), (r47, 1)), spine_y=fb_line,
        reach=((fb_x, fb_line),), label="TACHO_FB")
    decoupling("C45", "100n", (245, 375), "+3V3_ANALOG", LCSC="C14663")

    # Comparator: R49 feeds the signal into the NON-inverting input and R50
    # returns the open-collector output to that same node, which is what makes
    # this a Schmitt trigger rather than the Rev3.2-A relaxation oscillator.
    r50 = passive_wired("R50", "100k", (320, 340))
    net(r50, 1, "COMM_TACHO_N")
    r49 = passive_wired("R49", "4.7k", (350, 340))
    cmp2 = add(
        "Comparator:LMV393",
        "U34",
        "LMV393",
        (410, 360),
        "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
        unit=2,
        MPN="LMV393IDR",
        LCSC="C7984",
    )
    net(cmp2, 6, "TACHO_REF")
    net(cmp2, 7, "COMM_TACHO_N")
    cmp_line = bus(((r50, 2), (r49, 2), (cmp2, 5)), spine_y=368)
    label_at("TACHO_CMP", (snap(335), cmp_line))

    # 1k isolates the ESP32 ADC sampling kickback from the comparator input.
    r51 = passive_wired("R51", "1k", (420, 330))
    net(r51, 2, "ADC_TACHO")
    tp6 = test_pad("TP6", "TACHO_AMP", (450, 305), None)
    bus(((tacho_amp, 1), (r46, 1), (c47, 1), (r49, 1), (r51, 1), (tp6, 1)),
        spine_y=305, label="TACHO_AMP")

    passive("R48", "10k", (450, 375), "+3V3_LOGIC", "COMM_TACHO_N")
    test_pad("TP5", "COMM TACHO", (480, 360), "COMM_TACHO_N")

    note("INA180 gives 10 V/A. LMV393A senses CURRENT_RAW directly: nominal 280 mA trip with no filter delay.", (60, 400))
    note("Tacho band-pass 1.6 Hz .. 339 Hz, gain ~85: matched to 20-40 Hz commutation, -43 dB at the 50 kHz chop.", (60, 409))
    note("Hysteresis (R49/R50) is on the comparator non-inverting input.", (60, 418))
    note("No hardware max-on-time: the firmware runtime limit and tacho stall evidence bound actuator travel. See actuator_overrun_hazard.", (60, 427))


DRIVER_PIN_NAMES = {
    1: "nSLEEP",
    2: "AOUT1",
    3: "AISEN",
    4: "AOUT2",
    5: "BOUT2",
    6: "BISEN",
    7: "BOUT1",
    8: "nFAULT",
    9: "BIN1",
    10: "BIN2",
    11: "NC (VCP on die)",
    12: "VM",
    13: "GND",
    14: "NC (VINT on die)",
    15: "AIN2",
    16: "AIN1",
    17: "EP",
}


def add_motor_drivers():
    section("3 x DRV8411 / SIX CURRENT-LIMITED MOTOR OUTPUTS", (25, 275))
    driver_positions = (("U20", 110, 1, 2), ("U21", 270, 3, 4), ("U22", 430, 5, 6))
    for index, (ref, x, channel_a, channel_b) in enumerate(driver_positions, 1):
        drv = add(
            "Connector_Generic:Conn_01x17",
            ref,
            "DRV8411PWPR",
            (x, 320),
            "Package_SO:HTSSOP-16-1EP_4.4x5mm_P0.65mm_EP3x3mm",
            MPN="DRV8411PWPR",
            LCSC="C18212622",
            Alternate_MPN="DRV8833PWPR",
            Alternate_LCSC="C50506",
            Alternate_Status="SECOND_SOURCE_ONLY_SEE_ARCHITECTURE_MD",
            Pinout="; ".join(f"{pin} {name}" for pin, name in DRIVER_PIN_NAMES.items()),
        )
        pin_nets = {
            1: "DRIVE_PERMIT",
            2: f"MOT{channel_a}_A",

            4: f"MOT{channel_a}_B",
            5: f"MOT{channel_b}_B",

            7: f"MOT{channel_b}_A",
            8: "FAULT_N_RAW",
            9: f"FWD{channel_b}",
            10: f"REV{channel_b}",

            12: "+3V3_MOTOR",
            13: "GND",

            15: f"REV{channel_a}",
            16: f"FWD{channel_a}",
            17: "GND",
        }
        for pin, name in pin_nets.items():
            net(drv, pin, name)

        decoupling(
            f"C{28 + index * 2}",
            "10u 16V",
            (x - 18, 372),
            "+3V3_MOTOR",
            footprint="Capacitor_SMD:C_0603_1608Metric",
        )
        decoupling(f"C{29 + index * 2}", "100n 10V", (x, 372), "+3V3_MOTOR", LCSC="C14663")
        # Pins 11 and 14 are NC on the DRV8411 - it integrates the charge-pump
        # and internal-regulator capacitors on die - so they are left open.
        # Rev3.2-B carried six DNP 0603 pads here (VINT 2.2 uF, VCP 10 nF) to
        # keep the pin-compatible DRV8833 available as a shortage substitute.
        # They are removed; see driver.second_source_rationale.  Sense resistors
        # are still placed level with the pin they serve so each connection is a
        # single straight wire rather than a matching pair of net names.
        nc(drv, 11)
        nc(drv, 14)
        rsa = passive_wired(
            f"RSA{index}",
            "1R 1% 0.5W",
            (x - 55, xy(drv, 3)[1] + 3.81),
            footprint="Resistor_SMD:R_0603_1608Metric",
            MPN="RC0603FR-071RL",
            LCSC="C112305",
            Status="PRODUCTION_TUNING_PARAMETER",
        )
        net(rsa, 2, "GND")
        link((drv, 3), (rsa, 1), label=f"AISEN{channel_a}")
        rsb = passive_wired(
            f"RSB{index}",
            "1R 1% 0.5W",
            (x - 30, xy(drv, 6)[1] + 3.81),
            footprint="Resistor_SMD:R_0603_1608Metric",
            MPN="RC0603FR-071RL",
            LCSC="C112305",
            Status="PRODUCTION_TUNING_PARAMETER",
        )
        net(rsb, 2, "GND")
        link((drv, 6), (rsb, 1), label=f"BISEN{channel_b}")

        for channel, offset in ((channel_a, -32), (channel_b, 32)):
            conn = add(
                "Connector_Generic:Conn_01x04",
                f"J{10 + channel}",
                f"MOTOR {channel} 4P4C",
                (x + offset, 415),
                "Connector_RJ:RJ9_Evercom_5301-440xxx_Horizontal",
                MPN="5301-4P4C",
                LCSC="C3097715",
            )
            nc(conn, 1)
            net(conn, 2, f"MOT{channel}_A")
            net(conn, 3, f"MOT{channel}_B")
            nc(conn, 4)

            # One GND-referenced TVS per motor wire, at its own connector pin.
            #
            # This replaces the three USBLC6-4SC6 quad arrays.  Those are rail
            # clamps: ST's own datasheet gives VCL+ = V_TRANSIL + V_F, so a
            # positive strike is steered *up* through a steering diode into the
            # VBUS pin before it ever reaches ground.  VBUS was tied to
            # +3V3_MOTOR, which is the DRV8411 VM node and the INA180 IN- node,
            # so the fast edge was routed into the one rail the current sense
            # and the commutation tacho both depend on.  ST's worked example for
            # an 8 kV contact discharge is +31.2 V at the I/O, against a
            # DRV8411 output rated -V_SD..VM+V_SD and a VM ramp limit of 2 V/us.
            #
            # TPD1E10B06 has no supply pin at all, so the strike goes straight
            # to the plane: 10 V max clamp at 1 A, 0.4 ohm dynamic resistance,
            # +/-30 kV IEC contact.  Two pins and bidirectional, so it cannot be
            # fitted backwards - the failure recorded against the OneWire TVS in
            # rev2-review-addendum.md item 7 is not reachable here.
            #
            # Per wire rather than per connector or per driver because the only
            # trace that sets the clamp is connector pin -> TVS -> GND via.
            # Everything downstream of the clamp is layout-free.
            for leg, dx in (("A", -9), ("B", 9)):
                tvs = add(
                    "Device:D_TVS",
                    f"D{38 + 2 * channel + (0 if leg == 'A' else 1)}",
                    "TPD1E10B06 ESD",
                    (x + offset + dx, 392),
                    "Diode_SMD:D_SOD-523",
                    MPN="TPD1E10B06DYAR",
                    LCSC="C3712135",
                )
                net(tvs, 1, f"MOT{channel}_{leg}")
                net(tvs, 2, "GND")
    note("Motor ESD is one GND-referenced TPD1E10B06 per wire at its own connector pin. Do not substitute a rail-clamp", (105, 470))
    note("array (USBLC6 class): its VBUS pin steers positive strikes into +3V3_MOTOR, i.e. into DRV8411 VM and INA180 IN-.", (105, 479))
    note("1R xISEN gives a 178..232 mA bridge ceiling: a board-protection backstop, ~4x above the 23..50 mA measured stall.", (105, 443))
    note("xISEN is a production tuning parameter. 1.5R -> 119..155 mA sits just above the 100 mA firmware cap; do not", (105, 452))
    note("narrow it before the section 3 current distributions exist, or the prototype clips the data it must collect.", (105, 461))


def add_external_interfaces_and_flags():
    section("ONEWIRE / STATUS / COPPER-ONLY DEBUG AND DISPLAY PADS", (25, 585))

    # ---- 1-Wire bus ------------------------------------------------------
    # ONEWIRE_BUS is sheet-local, so it is drawn: a vertical bus spine with the
    # pull-up above it, the MCU series resistor entering from the left, the TVS
    # clamping to the right and the field terminal at the far right.
    r41 = passive_wired("R41", "4.7k", (112, 574))
    net(r41, 1, "+3V3_LOGIC")
    r40 = passive_wired("R40", "33R", (89, 589))
    net(r40, 1, "ONEWIRE_MCU")
    onewire_esd = add(
        "Device:D",
        "D5",
        "PESD3V3U1UA,115",
        (136, 589),
        "Diode_SMD:D_SOD-323",
        MPN="PESD3V3U1UA,115",
        LCSC="C403915",
    )
    net(onewire_esd, 2, "GND")  # anode to ground, cathode at the signal
    j20 = add(
        "Connector_Generic:Conn_01x03",
        "J20",
        "ONEWIRE DAISY CHAIN",
        (190, 601),
        "TerminalBlock_4Ucon:TerminalBlock_4Ucon_1x03_P3.50mm_Horizontal",
        MPN="DB301V-3.5-3P-GN-S",
        LCSC="C695630",
        Status="FROZEN",
    )
    net(j20, 3, "GND")
    bus(((r41, 2), (r40, 2), (onewire_esd, 1), (j20, 2)), spine_x=112,
        label="ONEWIRE_BUS")

    # ---- protected external supply branch --------------------------------
    # ECO rev3.2-B: the sensor supply pin is no longer a bare tap on the MCU
    # rail.  33R drops only 0.1 V at the 3 mA two-probe load but limits a
    # shorted field wire to ~100 mA, which the 2 A logic buck absorbs without
    # a brownout, and D7 clamps cable ESD locally.  Evaluate a resettable PTC
    # for production: at 0.33 W the 0603 resistor is a one-shot fusible link.
    r52 = passive_wired("R52", "33R", (160, 585))
    net(r52, 1, "+3V3_LOGIC")
    ext_esd = add(
        "Device:D",
        "D7",
        "PESD3V3U1UA,115",
        (178, 593),
        "Diode_SMD:D_SOD-323",
        MPN="PESD3V3U1UA,115",
        LCSC="C403915",
    )
    net(ext_esd, 2, "GND")
    bus(((r52, 2), (ext_esd, 1), (j20, 1)), spine_x=160, label="+3V3_EXT")

    # ---- status LED ------------------------------------------------------
    led = add(
        "Device:LED",
        "D6",
        "GREEN STATUS",
        (207, 593),
        "LED_SMD:LED_0805_2012Metric",
        MPN="KT-0805G",
        LCSC="C2297",
    )
    net(led, 1, "STATUS_LED_N")  # cathode to the GPIO: active low
    r42 = passive_wired("R42", "1k", (222, 589))
    net(r42, 1, "+3V3_LOGIC")
    link((led, 2), (r42, 2), label="STATUS_LED_A")

    # The eight scattered display/debug test pads are replaced by two JST XH
    # footprints - the series already in stock, so no new part to buy.  Both are
    # COPPER_ONLY: the pads exist, nothing is ordered or placed, and a connector
    # gets soldered on only when a display or a console is actually wanted.
    #
    # XH is 2.50 mm pitch, not the 2.54 it is often sold as, and it is
    # through-hole only, so each connector puts four drills through the ground
    # pour.  That is acceptable here: both sit at x 77..91, more than 4 mm east
    # of the analog island, where the pour is reference plane and not a return
    # path for anything.  Vertical entry so the cable leaves toward a lid-mounted
    # display; the B4B body is also 13.40 x 6.75 mm, smaller than the PH SMD
    # alternative it replaces.
    for ref, label, pos, pins in (
        ("J21", "DISPLAY I2C", (245, 608),
         ("GND", "+3V3_LOGIC", "I2C_SDA", "I2C_SCL")),
        ("J22", "UART CONSOLE", (345, 608),
         ("GND", "+3V3_LOGIC", "UART_TX_DBG", "UART_RX_DBG")),
    ):
        conn = add(
            "Connector_Generic:Conn_01x04",
            ref,
            label,
            pos,
            "Connector_JST:JST_XH_B4B-XH-A_1x04_P2.50mm_Vertical",
            Assembly="COPPER_ONLY",
            Pinout="1 GND; 2 +3V3_LOGIC; 3 data/TX; 4 clock/RX",
        )
        for index, signal in enumerate(pins, 1):
            net(conn, index, signal)

    # I2C has no pull-ups anywhere on the board.  They are not optional: without
    # them SDA and SCL float on the ESP32's inputs whenever no display is fitted,
    # which is the same failure R10-R13 exist to prevent at the decoder - a
    # floating CMOS input sits near mid-rail with both transistors conducting.
    # 4k7 to +3V3_LOGIC; a display module carrying its own gives 2k35 effective,
    # still well inside spec and a 100 ns rise into 50 pF against 400 kHz.
    for ref, signal, x in (("R16", "I2C_SDA", 265), ("R17", "I2C_SCL", 285)):
        pull = passive_wired(ref, "4k7", (x, 585),
                            footprint="Resistor_SMD:R_0603_1608Metric",
                            MPN="RC0603FR-074K7L", LCSC="C23162")
        net(pull, 1, "+3V3_LOGIC")
        net(pull, 2, signal)

    for index, (rail, x) in enumerate(
        (
            ("VBUS_RAW", 425),
            ("VBUS_PROTECTED", 450),
            ("+3V3_LOGIC", 475),
            ("+3V3_ANALOG", 500),
            ("+3V3_MOTOR", 525),
            ("GND", 550),
        ),
        1,
    ):
        flag = add("power:PWR_FLAG", f"#FLG0{index}", "PWR_FLAG", (x, 608))
        net(flag, 1, rail)

    for index, pos in enumerate(((620, 600), (640, 600), (660, 600), (680, 600)), 1):
        add(
            "Mechanical:MountingHole",
            f"H{index}",
            "M3",
            pos,
            "MountingHole:MountingHole_3.2mm_M3_ISO14580_Pad",
            Assembly="MECHANICAL_ONLY",
        )
    note("J21/J22 are unpopulated JST PH pads: display I2C with R16/R17 4k7 pull-ups, and the UART console.", (105, 652))
    note("Four M3 holes and the ESP32 antenna keepout are mandatory PCB release constraints.", (105, 661))


def _symbol_blocks(text: str):
    """Yield (start, end) spans of every top-level symbol instance.

    Parenthesis-matched rather than regex-matched so a nested property block
    cannot terminate the span early.  ``lib_symbols`` definitions live at a
    deeper indent and are skipped by the indentation test.
    """
    for match in re.finditer(r"\n\t\(symbol\b", text):
        start = match.start() + 1
        depth = 0
        for index in range(start, len(text)):
            char = text[index]
            if char == "(":
                depth += 1
            elif char == ")":
                depth -= 1
                if depth == 0:
                    yield start, index + 1
                    break


def _apply_assembly_attributes(text: str) -> str:
    """Turn the ``DNP``/``Assembly`` properties into native KiCad attributes.

    kicad-sch-api writes every instance with ``(dnp no) (in_bom yes)``.  Left
    alone, a generated BOM/CPL would order and place the second-source
    capacitors and the copper-only pads, so the intent has to reach the native
    attributes that fabrication exports actually read.
    """
    out = []
    cursor = 0
    for start, end in _symbol_blocks(text):
        block = text[start:end]
        dnp = '(property "DNP" "yes"' in block
        assembly = re.search(r'\(property "Assembly" "([^"]*)"', block)
        assembly = assembly.group(1) if assembly else ""
        if dnp or assembly:
            if dnp or assembly == "COPPER_ONLY":
                block = block.replace("(dnp no)", "(dnp yes)", 1)
            if assembly in ("COPPER_ONLY", "MECHANICAL_ONLY"):
                block = block.replace("(in_bom yes)", "(in_bom no)", 1)
        out.append(text[cursor:start])
        out.append(block)
        cursor = end
    out.append(text[cursor:])
    return "".join(out)


def save_page(path: Path) -> None:
    sch.save(path)
    text = path.read_text(encoding="utf-8").replace('(paper "A4")', '(paper "A0")')
    # kicad-sch-api 0.5.6 stores its global-label data using the ordinary
    # ``label`` token.  KiCad then treats each sheet as isolated.  Convert
    # these generated net labels to the native global-label form after save;
    # no ordinary net labels are emitted by this generator.
    text = re.sub(
        r"^(\s*)\(label (\"[^\"]+\")\n",
        r"\1(global_label \2\n\1\t(shape bidirectional)\n",
        text,
        flags=re.MULTILINE,
    )
    text = _apply_assembly_attributes(text)
    path.write_text(text, encoding="utf-8")


def generate_page(filename: str, title: str, builders) -> None:
    global sch
    sch = ksa.create_schematic(title)
    for builder in builders:
        builder()
    save_page(ROOT / filename)


def generate():
    global sch
    load_libraries()
    pages = (
        ("lune-v6-rev3.2-power.kicad_sch", "Power", (add_usb_and_power,)),
        ("lune-v6-rev3.2-controller.kicad_sch", "Controller and Safety", (add_esp32, add_decoder_logic)),
        ("lune-v6-rev3.2-motors.kicad_sch", "Motor Drivers", (add_motor_drivers,)),
        ("lune-v6-rev3.2-analog.kicad_sch", "Current and Commutation Tacho", (add_current_fault_latch_and_timeout,)),
        ("lune-v6-rev3.2-connectors.kicad_sch", "Connectors and Interfaces", (add_external_interfaces_and_flags,)),
    )
    for filename, title, builders in pages:
        generate_page(filename, title, builders)

    sch = ksa.create_schematic("Lune V6 Rev 3.2")
    sch.add_text("Lune V6 Rev 3.2 - six-channel two-wire manifold controller", (40, 35), size=2.0, bold=True)
    sch.add_text("Hierarchical schematic: Power, Controller, Motors, Analog, and Connectors", (40, 45), size=1.2)
    sch.add_text("ECO rev3.2-B: commutation-tacho and runtime-timeout correction", (40, 53), size=1.2)
    for index, (filename, title, _) in enumerate(pages):
        column = index % 2
        row = index // 2
        sch.add_sheet(title, filename, (45 + column * 115, 65 + row * 55), (90, 35), page_number=str(index + 2))
    save_page(OUT)
    print(f"Generated {OUT} and {len(pages)} functional sheets")


if __name__ == "__main__":
    generate()
