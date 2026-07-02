#!/usr/bin/env python3
"""Generate the HeatValve-6 Rev 2.1 KiCad schematic.

Requires kicad-sch-api 0.5.6. The generated files are committed so running this
script is only needed when changing the programmatic source.
"""

from pathlib import Path
import os

os.environ.setdefault("HOME", "/private/tmp")

import kicad_sch_api as ksa


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "heatvalve-6-rev2.1.kicad_sch"
KICAD_SYMBOLS = Path(
    "/Applications/KiCad/KiCad.app/Contents/SharedSupport/symbols"
)


def load_libraries():
    cache = ksa.get_symbol_cache()
    for name in (
        "74xx",
        "4xxx",
        "Amplifier_Current",
        "Amplifier_Operational",
        "Comparator",
        "Connector",
        "Connector_Generic",
        "Device",
        "Diode",
        "Driver_Motor",
        "Power_Protection",
        "RF_Module",
        "Switch",
        "power",
    ):
        path = KICAD_SYMBOLS / f"{name}.kicad_sym"
        if not cache.add_library_path(path):
            raise RuntimeError(f"Unable to load KiCad library: {path}")


sch = None


def add(lib, ref, value, pos, footprint="", unit=1, rotation=0, **fields):
    return sch.components.add(
        lib_id=lib,
        reference=ref,
        value=value,
        position=pos,
        footprint=footprint,
        unit=unit,
        rotation=rotation,
        **fields,
    )


def net(comp, pin, name):
    point = comp.get_pin_position(str(pin))
    if point is None:
        raise RuntimeError(f"Pin {comp.reference}.{pin} not found")
    # kicad-sch-api 0.5.6 mirrors symbol-local Y when calculating pin
    # positions. All symbols in this generated sheet use rotation 0, so
    # reflect the returned Y coordinate around the symbol origin.
    point_y = 2 * comp.position.y - point.y
    sch.add_label(name, position=(point.x, point_y), size=1.0)


def nc(comp, pin):
    point = comp.get_pin_position(str(pin))
    if point is None:
        raise RuntimeError(f"Pin {comp.reference}.{pin} not found")
    point_y = 2 * comp.position.y - point.y
    sch.no_connects.add(position=(point.x, point_y))


def passive(ref, value, pos, a, b, footprint="Resistor_SMD:R_0603_1608Metric", **fields):
    lib = "Device:C" if ref.startswith("C") else "Device:R"
    comp = add(lib, ref, value, pos, footprint, **fields)
    net(comp, 1, a)
    net(comp, 2, b)
    return comp


def decoupling(ref, value, pos, rail, ground="GND", footprint="Capacitor_SMD:C_0603_1608Metric"):
    return passive(ref, value, pos, rail, ground, footprint)


def section(text, pos):
    # Keep left-edge headings inside the printable A2 frame. KiCad anchors
    # schematic text at its centre rather than at the left edge.
    x, y = pos
    if x < 100:
        x += 38
    sch.add_text(text, (x, y), size=2.0, bold=True)


def note(text, pos):
    x, y = pos
    if x < 100:
        x = 105
    sch.add_text(text, (x, y), size=1.0)


def generate():
    global sch
    load_libraries()
    sch = ksa.create_schematic("HeatValve-6 Rev 2.1")

    # ------------------------------------------------------------------
    # USB-C is the sole power input. The buck-derived 3.3 V rail powers both
    # logic and the low-voltage motor drive; no auxiliary motor supply exists.
    # ------------------------------------------------------------------
    section("USB-C INPUT / 3V3 POWER", (25, 18))
    j1 = add(
        "Connector:USB_C_Receptacle_USB2.0_16P",
        "J1",
        "USB4105-GF-A",
        (45, 48),
        "Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal",
        MPN="USB4105-GF-A",
    )
    for pin in ("A1", "A12", "B1", "B12", "SH"):
        net(j1, pin, "GND")
    for pin in ("A4", "A9", "B4", "B9"):
        net(j1, pin, "VBUS_RAW")
    net(j1, "A5", "CC1")
    net(j1, "B5", "CC2")
    for pin in ("A6", "B6"):
        net(j1, pin, "USB_DP_CONN")
    for pin in ("A7", "B7"):
        net(j1, pin, "USB_DM_CONN")
    for pin in ("A8", "B8"):
        nc(j1, pin)

    passive("R1", "5.1k", (25, 72), "CC1", "GND")
    passive("R2", "5.1k", (38, 72), "CC2", "GND")
    f1 = add("Device:Fuse", "F1", "500mA PTC", (62, 28), "Fuse:Fuse_1206_3216Metric", MPN="1206L050")
    net(f1, 1, "VBUS_RAW")
    net(f1, 2, "VBUS_FUSED")

    u2 = add(
        "Power_Protection:USBLC6-2SC6",
        "U2",
        "USBLC6-2SC6",
        (78, 52),
        "Package_TO_SOT_SMD:SOT-23-6",
    )
    for pin in (1, 6):
        net(u2, pin, "USB_DM_CONN")
    for pin in (3, 4):
        net(u2, pin, "USB_DP_CONN")
    net(u2, 2, "GND")
    net(u2, 5, "VBUS_FUSED")
    passive("R3", "22R", (92, 42), "USB_DM_CONN", "USB_DM", fields="USB series")
    passive("R4", "22R", (92, 59), "USB_DP_CONN", "USB_DP", fields="USB series")

    decoupling("C1", "10u", (58, 78), "VBUS_FUSED")
    decoupling("C2", "100n", (70, 78), "VBUS_FUSED")
    decoupling("C3", "100u", (82, 78), "VBUS_FUSED", footprint="Capacitor_SMD:CP_Elec_6.3x7.7")

    # MT2492 is represented as a 1x6 symbol; pin labels preserve the real pin names.
    u3 = add(
        "Connector_Generic:Conn_01x06",
        "U3",
        "MT2492",
        (112, 46),
        "Package_TO_SOT_SMD:SOT-23-6",
        MPN="MT2492",
        LCSC="C89358",
    )
    for pin, name in ((1, "BUCK_BS"), (2, "GND"), (3, "BUCK_FB"), (4, "VBUS_FUSED"), (5, "VBUS_FUSED"), (6, "BUCK_SW")):
        net(u3, pin, name)
    passive("C4", "22n", (104, 72), "BUCK_BS", "BUCK_SW", "Capacitor_SMD:C_0603_1608Metric")
    l1 = add("Device:L", "L1", "4.7uH / >=2.4A", (132, 40), "Inductor_SMD:L_Wuerth_HCI-5040")
    net(l1, 1, "BUCK_SW")
    net(l1, 2, "+3V3_SYS")
    passive("R5", "115k", (126, 64), "+3V3_SYS", "BUCK_FB")
    passive("R6", "25.5k", (139, 64), "BUCK_FB", "GND")
    decoupling("C5", "22u", (153, 48), "+3V3_SYS", footprint="Capacitor_SMD:C_0805_2012Metric")
    decoupling("C6", "22u", (164, 48), "+3V3_SYS", footprint="Capacitor_SMD:C_0805_2012Metric")
    fb1 = add("Device:FerriteBead", "FB1", "600R@100MHz", (153, 70), "Inductor_SMD:L_0603_1608Metric_Pad1.05x0.95mm_HandSolder")
    net(fb1, 1, "+3V3_SYS")
    net(fb1, 2, "+3V3_A")
    decoupling("C7", "10u", (170, 70), "+3V3_A", footprint="Capacitor_SMD:C_0805_2012Metric")
    decoupling("C8", "100n", (181, 70), "+3V3_A")
    note("U3 pins: 1 BS, 2 GND, 3 FB, 4 EN, 5 IN, 6 SW", (98, 88))
    note("USB-C VBUS is the only board power input; +3V3_SYS powers logic and motors.", (98, 94))

    # ------------------------------------------------------------------
    # ESP32-S3, buttons and status LEDs
    # ------------------------------------------------------------------
    section("ESP32-S3 / USB / GPIO", (205, 18))
    u1 = add(
        "RF_Module:ESP32-S3-WROOM-1",
        "U1",
        "ESP32-S3-WROOM-1-N16R8",
        (245, 64),
        "RF_Module:ESP32-S3-WROOM-1",
        MPN="ESP32-S3-WROOM-1-N16R8",
        LCSC="C2913202",
    )
    for pin in (1, 40, 41):
        net(u1, pin, "GND")
    net(u1, 2, "+3V3_SYS")
    gpio_nets = {
        3: "ESP_EN", 4: "ADC_CURRENT", 5: "ADC_BEMF",
        6: "MUX_EN1", 7: "MUX_EN2", 8: "TACHO_EDGE", 9: "FLIM_PWM",
        10: "LATCH_ARM_N", 11: "LATCH_STATE", 12: "MUX_EN3",
        13: "USB_DM", 14: "USB_DP",
        17: "MUX_EN4", 18: "MUX_EN5", 19: "MUX_EN6",
        20: "HBR_IN1", 21: "HBR_IN2",
        35: "OW_MCU", 27: "BOOT_N",
        38: "I2C_SCL_DNP", 39: "I2C_SDA_DNP",
    }
    for pin, name in gpio_nets.items():
        net(u1, pin, name)
    for pin in (15, 16, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 36, 37):
        nc(u1, pin)

    passive("R7", "10k", (202, 45), "+3V3_SYS", "ESP_EN")
    decoupling("C9", "100n", (202, 58), "ESP_EN")
    sw1 = add("Switch:SW_Push", "SW1", "RESET", (202, 72), "Button_Switch_SMD:SW_SPST_PTS810")
    net(sw1, 1, "ESP_EN"); net(sw1, 2, "GND")
    passive("R8", "10k", (286, 45), "+3V3_SYS", "BOOT_N")
    sw2 = add("Switch:SW_Push", "SW2", "BOOT", (286, 58), "Button_Switch_SMD:SW_SPST_PTS810")
    net(sw2, 1, "BOOT_N"); net(sw2, 2, "GND")
    decoupling("C10", "10u", (216, 100), "+3V3_SYS", footprint="Capacitor_SMD:C_0805_2012Metric")
    decoupling("C11", "100n", (228, 100), "+3V3_SYS")

    led_data = (
        ("D1", "USB", "VBUS_FUSED", "R9", (204, 116)),
        ("D2", "PWR", "+3V3_SYS", "R10", (224, 116)),
        ("D3", "FAULT", "LATCH_STATE", "R11", (244, 116)),
        ("D4", "PERMIT", "DRIVE_PERMIT", "R12", (264, 116)),
    )
    for dref, value, source, rref, pos in led_data:
        led = add("Device:LED", dref, value, pos, "LED_SMD:LED_0603_1608Metric")
        net(led, 2, source); net(led, 1, f"{dref}_K")
        passive(rref, "2.2k", (pos[0], pos[1] + 12), f"{dref}_K", "GND")

    # ------------------------------------------------------------------
    # Shared shunt, x20 current measurement and protected ADC
    # ------------------------------------------------------------------
    section("SHARED SHUNT / CURRENT", (25, 128))
    passive("RSH1", "1.0R 1%", (38, 150), "SHUNT", "GND_KELVIN", "Resistor_SMD:R_1206_3216Metric", MPN="1.0R 1206 1%")
    passive("RSH2", "DNP", (52, 150), "SHUNT", "GND_KELVIN", "Resistor_SMD:R_1206_3216Metric", DNP="yes")
    passive("R13", "0R", (67, 150), "GND_KELVIN", "GND")
    note("RSH1 use true Kelvin pickup. R13 is the single Kelvin-to-plane tie.", (25, 166))

    u9 = add("Amplifier_Current:INA180A1", "U9", "INA180A1 (x20)", (105, 150), "Package_TO_SOT_SMD:SOT-23-5", MPN="INA180A1IDBVR")
    net(u9, 3, "SHUNT"); net(u9, 4, "GND_KELVIN"); net(u9, 1, "INA_OUT")
    net(u9, 5, "+3V3_A"); net(u9, 2, "GND")
    decoupling("C12", "100n", (102, 174), "+3V3_A")
    passive("R14", "1k", (126, 150), "INA_OUT", "ADC_CURRENT")
    decoupling("C13", "4.7n", (140, 160), "ADC_CURRENT")
    u13 = add("Diode:BAT54S", "D5", "BAT54S ADC clamp", (158, 150), "Package_TO_SOT_SMD:SOT-23")
    net(u13, 1, "GND"); net(u13, 2, "+3V3_A"); net(u13, 3, "ADC_CURRENT")
    note("INA180 is 3V3-powered (intrinsic rail limit). R14 + D5 limit ADC injection transients.", (90, 185))
    note("30mA=0.60V, 60mA=1.20V, 150mA=3.00V. Current is endstop/load/force evidence.", (90, 191))

    # Mid-rail reference for the bidirectional differential BEMF front end.
    passive("R15", "10k", (196, 146), "+3V3_A", "VBIAS_DIV")
    passive("R16", "10k", (196, 160), "VBIAS_DIV", "GND")
    decoupling("C14", "1u", (208, 160), "VBIAS_DIV")
    u10a = add("Amplifier_Operational:MCP6004", "U10", "MCP6004", (230, 150), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=1, MPN="MCP6004-I/SL")
    net(u10a, 3, "VBIAS_DIV"); net(u10a, 2, "VBIAS"); net(u10a, 1, "VBIAS")

    # ------------------------------------------------------------------
    # Shared motor bus BEMF: selected motor appears directly on the driver bus
    # ------------------------------------------------------------------
    section("SHARED MOTOR BUS BEMF / TACHO", (225, 128))
    passive("R60", "10k", (255, 154), "MOT_COM", "BEMF_MUX_A")
    passive("R61", "10k", (255, 178), "MOT_DRV", "BEMF_MUX_B")
    passive("R62", "1M", (282, 198), "MOT_DRV", "GND")
    note("Only one mux channel may be enabled; the selected motor is visible on MOT_COM/MOT_DRV.", (235, 216))

    # 10k terminal resistors + 90.9k/47k network give ~0.466 differential gain.
    u10b = add("Amplifier_Operational:MCP6004", "U10", "MCP6004", (350, 166), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=2)
    passive("R50", "90.9k 1%", (325, 154), "BEMF_MUX_A", "BEMF_DIFF_N")
    passive("R51", "47k 1%", (369, 154), "BEMF_RAW", "BEMF_DIFF_N")
    passive("R52", "90.9k 1%", (325, 178), "BEMF_MUX_B", "BEMF_DIFF_P")
    passive("R53", "47k 1%", (350, 190), "BEMF_DIFF_P", "VBIAS")
    net(u10b, 5, "BEMF_DIFF_P"); net(u10b, 6, "BEMF_DIFF_N"); net(u10b, 7, "BEMF_RAW")

    # Raw ADC preserves waveforms for calibration; the separate AC path drives PCNT.
    passive("R54", "1k", (386, 166), "BEMF_RAW", "ADC_BEMF")
    decoupling("C52", "4.7n", (398, 177), "ADC_BEMF")
    d7 = add("Diode:BAT54S", "D7", "BAT54S BEMF ADC clamp", (414, 166), "Package_TO_SOT_SMD:SOT-23")
    net(d7, 1, "GND"); net(d7, 2, "+3V3_A"); net(d7, 3, "ADC_BEMF")

    passive("C53", "100n", (390, 200), "BEMF_RAW", "BEMF_AC",
            "Capacitor_SMD:C_0603_1608Metric")
    passive("C54", "100n DNP", (390, 212), "BEMF_RAW", "BEMF_AC",
            "Capacitor_SMD:C_0603_1608Metric", DNP="yes")
    passive("R55", "100k", (406, 212), "BEMF_AC", "VBIAS")
    u10d = add("Amplifier_Operational:MCP6004", "U10", "MCP6004", (440, 205), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=4)
    net(u10d, 12, "BEMF_AC"); net(u10d, 13, "BEMF_GAIN_FB"); net(u10d, 14, "BEMF_TACH_AMP")
    passive("R56", "10k", (425, 222), "BEMF_GAIN_FB", "VBIAS")
    passive("R57", "100k", (456, 222), "BEMF_TACH_AMP", "BEMF_GAIN_FB")

    u11a = add("Comparator:LM339", "U11", "LM339B", (480, 205), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=1, MPN="LM339BDR")
    net(u11a, 5, "BEMF_TACH_AMP"); net(u11a, 4, "VBIAS"); net(u11a, 2, "TACHO_EDGE")
    passive("R58", "1M", (496, 195), "TACHO_EDGE", "BEMF_TACH_AMP")
    passive("R59", "10k", (496, 212), "+3V3_SYS", "TACHO_EDGE")
    note("TACHO_EDGE is the required commutation-count channel; ADC_BEMF qualifies it.", (315, 238))

    # ------------------------------------------------------------------
    # PWM threshold, raw-shunt comparator and fail-safe latch
    # ------------------------------------------------------------------
    section("HARDWARE FORCE LIMIT / FAIL-SAFE LATCH", (395, 128))
    passive("R23", "10k", (405, 148), "FLIM_PWM", "FLIM_PWM_RC")
    decoupling("C17", "1u", (418, 158), "FLIM_PWM_RC")
    passive("R24", "18k", (430, 148), "FLIM_PWM_RC", "FLIM_DAC")
    passive("R25", "1k", (442, 158), "FLIM_DAC", "GND")
    u10c = add("Amplifier_Operational:MCP6004", "U10", "MCP6004", (463, 150), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=3)
    net(u10c, 10, "FLIM_DAC"); net(u10c, 9, "FLIM_REF"); net(u10c, 8, "FLIM_REF")

    u11b = add("Comparator:LM339", "U11", "LM339B", (495, 150), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=2)
    net(u11b, 7, "SHUNT"); net(u11b, 6, "FLIM_REF"); net(u11b, 1, "FLIM_TRIP_CLK")
    passive("R26", "10k", (510, 139), "+3V3_SYS", "FLIM_TRIP_CLK")

    u12a = add("74xx:74HC74", "U12", "74HC74", (545, 150), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=1)
    for pin, name in ((1, "POR_N"), (2, "GND"), (3, "FLIM_TRIP_CLK"), (4, "LATCH_ARM_N"), (5, "DRIVE_PERMIT"), (6, "LATCH_STATE")):
        net(u12a, pin, name)
    passive("R27", "100k", (528, 178), "+3V3_SYS", "POR_N")
    decoupling("C18", "1u", (540, 184), "POR_N")
    passive("R28", "10k", (552, 178), "+3V3_SYS", "LATCH_ARM_N")
    passive("R29", "47k", (565, 178), "DRIVE_PERMIT", "GND")
    note("POR holds nCLR low. Firmware pulses nPRE low to arm. Overcurrent clocks D=0.", (400, 195))

    # Safely terminate unused comparator/flip-flop sections and add power units.
    u10p = add("Amplifier_Operational:MCP6004", "U10", "MCP6004", (330, 184), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=5)
    net(u10p, 4, "+3V3_A"); net(u10p, 11, "GND")
    decoupling("C19", "100n", (345, 184), "+3V3_A")

    u11c = add("Comparator:LM339", "U11", "LM339B", (470, 184), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=3)
    net(u11c, 11, "GND"); net(u11c, 10, "VBIAS"); nc(u11c, 13)
    u11d = add("Comparator:LM339", "U11", "LM339B", (492, 184), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=4)
    net(u11d, 9, "GND"); net(u11d, 8, "VBIAS"); nc(u11d, 14)
    u11p = add("Comparator:LM339", "U11", "LM339B", (510, 184), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=5)
    net(u11p, 3, "+3V3_A"); net(u11p, 12, "GND")
    decoupling("C20", "100n", (520, 184), "+3V3_A")
    u12b = add("74xx:74HC74", "U12", "74HC74", (570, 212), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=2)
    for pin, name in ((13, "GND"), (12, "GND"), (11, "GND"), (10, "+3V3_SYS")):
        net(u12b, pin, name)
    nc(u12b, 8); nc(u12b, 9)
    u12p = add("74xx:74HC74", "U12", "74HC74", (550, 212), "Package_SO:SOIC-14_3.9x8.7mm_P1.27mm", unit=3)
    net(u12p, 14, "+3V3_SYS"); net(u12p, 7, "GND")
    decoupling("C21", "100n", (530, 212), "+3V3_SYS")

    # ------------------------------------------------------------------
    # One shared H-bridge, six low-Ron bilateral mux channels, and 4P4C connectors
    # ------------------------------------------------------------------
    section("SHARED DRV8837 + 6 x MOTOR MUX / 4P4C OUTPUTS", (25, 258))
    drv = add(
        "Driver_Motor:DRV8837", "U21", "DRV8837DSGR shared H-bridge", (55, 290),
        "Package_SON:WSON-8-1EP_2x2mm_P0.5mm_EP0.9x1.6mm",
        MPN="DRV8837DSGR", LCSC="C39159",
    )
    for pin, name in ((1, "+3V3_SYS"), (2, "MOT_COM"), (3, "MOT_DRV"),
                      (4, "SHUNT"), (5, "HBR_IN2"), (6, "HBR_IN1"),
                      (7, "DRIVE_PERMIT"), (8, "+3V3_SYS"), (9, "SHUNT")):
        net(drv, pin, name)
    decoupling("C30", "100n", (40, 318), "+3V3_SYS", "SHUNT")
    decoupling("C31", "1u", (55, 318), "+3V3_SYS", "SHUNT", "Capacitor_SMD:C_0805_2012Metric")
    passive("R70", "100k", (75, 276), "HBR_IN1", "GND")
    passive("R71", "100k", (90, 276), "HBR_IN2", "GND")

    # U31..U36 are placeholders for a production-selected low-Ron bilateral SPST
    # switch/load-switch part. Required behaviour: rail-to-rail 3.3 V signal path,
    # bidirectional current, <=1 ohm target Ron, >=250 mA peak, high-Z when disabled.
    driver_x = (130, 205, 280, 355, 430, 505)
    for idx, x in enumerate(driver_x, 1):
        mux = add(
            "Connector_Generic:Conn_01x06", f"U{30 + idx}",
            f"LOW_RON_BILATERAL_SPST MUX {idx}", (x, 292),
            "Package_TO_SOT_SMD:SOT-23-6", MPN="TBD_LOW_RON_SPST",
            Review="Select exact MPN/pinout before fab",
        )
        net(mux, 1, "+3V3_SYS"); net(mux, 2, "GND"); net(mux, 3, f"MUX_EN{idx}")
        net(mux, 4, "MOT_DRV"); net(mux, 5, f"MOT{idx}_SEL"); nc(mux, 6)
        passive(f"R{71 + idx}", "100k", (x, 320), f"MUX_EN{idx}", "GND")
        conn = add(
            "Connector_Generic:Conn_01x04", f"J{1 + idx}", f"MOTOR {idx} 4P4C",
            (x, 350), "Connector_RJ:RJ9_Evercom_5301-440xxx_Horizontal",
            MPN="5301-4P4C", LCSC="C3097715",
        )
        nc(conn, 1); net(conn, 2, "MOT_COM"); net(conn, 3, f"MOT{idx}_SEL"); nc(conn, 4)
    note("Connector pinout: 1 NC, 2 shared MOT_COM, 3 selected MOTx_SEL, 4 NC.", (25, 365))
    note("Firmware and hardware review must guarantee exactly one MUX_EN active during drive.", (25, 371))

    # ------------------------------------------------------------------
    # OneWire and DNP I2C expansion
    # ------------------------------------------------------------------
    section("ONEWIRE / DNP I2C EXPANSION", (25, 372))
    passive("R40", "33R", (45, 389), "OW_MCU", "OW_BUS")
    passive("R41", "4.7k", (58, 389), "+3V3_SYS", "OW_BUS")
    d6 = add("Device:D", "D6", "PESD3V3U1UL", (72, 389), "Diode_SMD:D_SOD-323")
    net(d6, 1, "GND"); net(d6, 2, "OW_BUS")
    for idx, x in enumerate((95, 140, 185), 8):
        conn = add(
            "Connector_Generic:Conn_01x03", f"J{idx}", f"ONEWIRE {idx-7}", (x, 394),
            "TerminalBlock_4Ucon:TerminalBlock_4Ucon_1x03_P3.50mm_Horizontal",
        )
        net(conn, 1, "+3V3_SYS"); net(conn, 2, "OW_BUS"); net(conn, 3, "GND")

    i2c = add(
        "Connector_Generic:Conn_01x04", "J11", "I2C EXPANSION DNP", (260, 394),
        "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical", DNP="yes",
    )
    net(i2c, 1, "GND"); net(i2c, 2, "+3V3_SYS"); net(i2c, 3, "I2C_SDA_DNP"); net(i2c, 4, "I2C_SCL_DNP")
    passive("R42", "2.2k DNP", (290, 384), "+3V3_SYS", "I2C_SDA_DNP", DNP="yes")
    passive("R43", "2.2k DNP", (305, 384), "+3V3_SYS", "I2C_SCL_DNP", DNP="yes")
    note("OneWire pinout: 1 +3V3, 2 DQ, 3 GND. J11 pinout: GND, +3V3, SDA, SCL.", (25, 414))

    # Power flags quiet power-input ERC while preserving explicit rail names.
    for idx, (rail, x) in enumerate((("VBUS_FUSED", 340), ("+3V3_SYS", 365), ("+3V3_A", 390), ("GND", 415), ("SHUNT", 440)), 1):
        flag = add("power:PWR_FLAG", f"#FLG0{idx}", "PWR_FLAG", (x, 405))
        net(flag, 1, rail)

    sch.save(OUT)
    # Use A2 landscape so the complete review schematic remains legible on one page.
    text = OUT.read_text()
    text = text.replace('(paper "A4")', '(paper "A2")')
    OUT.write_text(text)
    print(f"Generated {OUT}")


if __name__ == "__main__":
    generate()
