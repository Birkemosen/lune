"""Generate a rev3.2 PLACEMENT FLOORPLAN (unrouted) at 90 x 70 mm."""
import re, os, sys, collections
import pcbnew

ROOT = "/Users/birkemose/workspace/github.com/birkemosen/lune/lune-v6/hardware/lune-v6-rev3.2"
FPBASE = "/Applications/KiCad/KiCad.app/Contents/SharedSupport/footprints"
W, H = 100.0, 70.0
mm = pcbnew.FromMM
def V(x, y): return pcbnew.VECTOR2I(mm(x), mm(y))

# ---- read netlist: ref -> footprint, and (ref,pad) -> net -------------------
txt = open(f"{ROOT}/lune-v6-rev3.2.net").read()
fp_of = dict(re.findall(r'\(comp\s+\(ref\s+"([^"]+)"\).*?\(footprint\s+"([^"]*)"\)', txt, re.S))
pin_net = {}
for chunk in re.split(r'\n\t\t\(net\b', txt)[1:]:
    m = re.search(r'\(name "([^"]*)"', chunk)
    if not m: continue
    for nd in re.finditer(r'\(ref "([^"]+)"\)\s*\(pin "([^"]+)"\)', chunk):
        pin_net[(nd.group(1), nd.group(2))] = m.group(1)

board = pcbnew.CreateEmptyBoard()

# ---- board outline ---------------------------------------------------------
# Outline carries a 21 x 7 mm notch at the antenna end of U1.  Espressif's
# guideline ranks "antenna beyond the board edge" and "antenna at the board
# edge" as the two recommended options and allows a hollowed area otherwise;
# 7 mm is exactly the pad-free length of the module (northmost pad edge sits
# 7.04 mm inside the body), and 21 mm gives 1.5 mm either side of the 18 mm
# module.  Espressif's "at least 15 mm in all directions" is a clearance to
# metal in the *housing*, not a copper keepout on the board - which is what the
# stock 48 x 21 mm footprint zone encodes (18 + 15 + 15 wide, 6 + 15 deep).
NOTCH_W, NOTCH_D = 21.0, 7.0
nx0, nx1 = 50.0 - NOTCH_W/2, 50.0 + NOTCH_W/2
OUTLINE = [(0,0), (nx0,0), (nx0,NOTCH_D), (nx1,NOTCH_D), (nx1,0),
           (W,0), (W,H), (0,H), (0,0)]
for a, b in zip(OUTLINE, OUTLINE[1:]):
    seg = pcbnew.PCB_SHAPE(board)
    seg.SetShape(pcbnew.SHAPE_T_SEGMENT)
    seg.SetStart(V(*a)); seg.SetEnd(V(*b))
    seg.SetLayer(pcbnew.Edge_Cuts); seg.SetWidth(mm(0.1))
    board.Add(seg)

# ---- explicit anchors ------------------------------------------------------
# South edge, west to east: 6x RJ9, then USB-C, then the 1-wire terminal.
# First origin = west margin + the RJ9 courtyard's own left offset (4.21 mm).
CONN_X = [12.71 + 12.25*i for i in range(6)]            # 12.25 mm pitch invariant
DRV_X  = [(CONN_X[0]+CONN_X[1])/2, (CONN_X[2]+CONN_X[3])/2, (CONN_X[4]+CONN_X[5])/2]

anchor = {}
for i, cx in enumerate(CONN_X, 1):
    anchor[f"J{10+i}"] = (cx, H - 13.75, 0)               # 1.0 mm south projection
    anchor[f"D{38+2*i}"]   = (cx - 3.0, H - 22.5, 0)       # TVS for _A at its pin
    anchor[f"D{39+2*i}"]   = (cx + 3.0, H - 22.5, 0)       # TVS for _B at its pin
for i, (ref, dx) in enumerate(zip(("U20","U21","U22"), DRV_X), 1):
    anchor[ref] = (dx, H - 32.0, 0)
    anchor[f"RSA{i}"] = (dx - 4.5, H - 27.0, 90)           # xISEN, own via to plane
    anchor[f"RSB{i}"] = (dx + 4.5, H - 27.0, 90)
    anchor[f"C{28+2*i}"] = (dx - 3.0, H - 37.0, 0)         # VM bulk
    anchor[f"C{29+2*i}"] = (dx + 3.0, H - 37.0, 0)         # VM 100n
    # The six DNP VINT/VCP pads that used to sit at dx +/- 6.5 are gone, which
    # widens the decoder gap from 9.90 to 16.90 mm and clears the y = 35.5 band
    # that the FWD/REV fan-out needs.
anchor["U1"]  = (50.0, 13.25, 0)    # north-centre: frees both north corners; antenna at north edge
anchor["U24"] = (31.3, 38.0, 0)    # decoder in the 9.9 mm gap between U20's and U21's
                                   # VM-cap clusters, at the driver row's latitude and
                                   # unrotated: side A (pins 4..11) then faces WEST at
                                   # U20 and side B (13..20) faces EAST at U21/U22, so
                                   # no output crosses the package.  Earlier revisions
                                   # put it east of the module on the grounds that its
                                   # 17 nets are static logic - true, but that ignored
                                   # 12 traces x ~45 mm cutting the bottom pour across
                                   # the whole width, where the motor return flows.
anchor["J1"]  = (5.35, 30.0, 90)   # USB-C, WEST edge, flush. This footprint cannot
                                   # project without breaking 0.5 mm copper-to-edge;
                                   # the enclosure needs a deeper west opening, or a
                                   # board notch if a real projection is wanted.
anchor["J20"] = (5.5, 17.5, 90)    # 1-wire, WEST edge beside USB-C.  Its GPIO moved to
                                   # pad 11 to follow it, so ONEWIRE_MCU is a short west-row
                                   # run instead of crossing the module from the east row.
anchor["J21"] = (84.0, 16.0, 0)    # display I2C, EAST.  Unpopulated JST PH pads: 13.2 x 10.2 mm
anchor["J22"] = (84.0, 30.0, 0)    # UART console, EAST.  Both clear the analog island (ends
                                   # x = 73) by 4.4 mm and H2's pad (starts x = 91.85) by 1.25.
anchor["R16"] = (78.0, 23.0, 0)    # I2C pull-ups between the two connectors, so the bus
anchor["R17"] = (82.0, 23.0, 0)    # is held defined even with no display fitted
# The README's 82 x 67 M3 rectangle does not survive at 90 x 70: the corners are
# taken by the ESP32 antenna keepout, the USB-C receptacle and the connector row.
# These four are the positions that are actually clear; the real ones must be
# agreed against the enclosure bosses.
for i,(hx,hy) in enumerate(((4.5,4.5),(94.85,4.5),(4.5,H-4.5),(94.85,H-4.5)),1):
    anchor[f"H{i}"] = (hx, hy, 0)

# ---- zones for everything else: (x0,y0,x1,y1) ------------------------------
# Analog island: Kelvin pair (RSH1 + INA180), tacho chain, and its reference.
# Sits beside the ESP32 ADC pins and as far from the connector edge as the
# board allows, so ESD return current never crosses it.
ANALOG = {"RSH1","U32","U37","U34","C43","C44","C45","C47","C19","C18","C17","C10","C11",
          "R43","R44","R45","R46","R47","R48","R49","R50","R51","R20","R21","R22","FB1",
          "TP1","TP5","TP6","TP7"}
MOTRAIL = {"U4","C7","C8","C9"}
LOGIC  = {"U25","U35","Q1","C20","C21","C23","R23","R24","R25",
          "R13","R14","R15","TP3","R105","R104","D7","R52","R41","R42"}
POWER  = {"U2","U3","U5","L1","C1","C2","C3","C4","C5","C6","C12","C13","C14","C15",
          "C16","C22","D5","D6","R1","R2","R5","R8","R9","R10","R11","R12","SW1","SW2",
          "R110","J21","J22","R16","R17","U34x"}
# The ESP32 antenna keepout is a 48 x 21 mm rectangle at the antenna end.
# With the module at x=10 and its antenna at the top edge, the on-board part
# of that keepout is x 0..34, y 0..6.5 - so nothing may be placed there.
PARK = (104.0, 4.0, 174.0, 130.0)     # off-board staging, as a netlist import would
GROUP = {}
for _r in ANALOG:  GROUP[_r] = "analog"
for _r in MOTRAIL: GROUP[_r] = "motor-rail"



# ---- place -----------------------------------------------------------------
def courtyard_size(fpname):
    lib,_,name = fpname.partition(":")
    path = f"{FPBASE}/{lib}.pretty/{name}.kicad_mod"
    if not os.path.exists(path): return (2.0, 2.0)
    t = open(path).read()
    pts=[]
    for m in re.finditer(r'\(fp_(?:line|poly|rect)\s(.*?)\n\t\)', t, re.S):
        if '"F.CrtYd"' in m.group(1):
            pts += [(float(a),float(b)) for a,b in
                    re.findall(r'\((?:start|end|xy) ([-\d.]+) ([-\d.]+)\)', m.group(1))]
    if not pts:
        pts=[(float(a),float(b)) for a,b in re.findall(r'\(at ([-\d.]+) ([-\d.]+)', t)] or [(0,0)]
    xs=[q[0] for q in pts]; ys=[q[1] for q in pts]
    return (max(xs)-min(xs)+0.5, max(ys)-min(ys)+0.5)

placed, missing, overflow = 0, [], []
_sx, _sy, _rowh = PARK[0], PARK[1], 0.0
def stage_slot(w, h):
    global _sx, _sy, _rowh
    if _sx + w > PARK[2]:
        _sx = PARK[0]; _sy += _rowh + 1.0; _rowh = 0.0
    x, y = _sx + w/2.0, _sy + h/2.0
    _sx += w + 1.0
    _rowh = max(_rowh, h)
    return x, y

# anchored parts first, then the rest tallest-first so shelves pack tightly
order = [r for r in sorted(fp_of) if r in anchor] + \
        sorted((r for r in fp_of if r not in anchor),
               key=lambda r: -courtyard_size(fp_of[r])[1])

for ref in order:
    fpname = fp_of[ref]
    lib, _, name = fpname.partition(":")
    path = f"{FPBASE}/{lib}.pretty"
    fp = pcbnew.FootprintLoad(path, name)
    if fp is None:
        missing.append((ref, fpname)); continue
    fp.SetReference(ref)
    if ref in anchor:
        x, y, rot = anchor[ref]
    else:
        w, h = courtyard_size(fpname)
        x, y = stage_slot(w, h)
        if y + h/2.0 > PARK[3]: overflow.append((ref, round(y,1)))
        rot = 0
    fp.SetPosition(V(x, y))
    if rot: fp.SetOrientationDegrees(rot)
    board.Add(fp)
    # connectivity so the ratsnest and DRC are meaningful
    for pad in fp.Pads():
        nn = pin_net.get((ref, pad.GetNumber()))
        if not nn: continue
        net = board.FindNet(nn)
        if net is None:
            net = pcbnew.NETINFO_ITEM(board, nn); board.Add(net)
        pad.SetNet(net)
    if ref == "U1":
        # Remove the stock 48 x 21 mm keepout zone.  It forbids *footprints* as
        # well as copper, which would sterilise a 48 mm band across the north
        # edge for a rule that is really about metal in the enclosure.  The
        # board requirement is the notch above; the 15 mm housing clearance is
        # recorded in architecture.md as an enclosure constraint instead.
        for z in list(fp.Zones()):
            fp.Remove(z)
    placed += 1

for tx, ty, msg in (
        (30.0, 63.0, "SOUTH: M3 + 6x RJ9 + 1-wire + M3 = 99.35 mm. USB-C had to move west."),
        (30.0, 61.5, "ESD: one TVS per wire, AT its connector pin, own GND via"),
        (30.0, 40.0, "DRIVER BAND - xISEN gets its own via, off the ESD return path"),
        (118.0, 2.0, "PARKED OFF-BOARD - awaiting manual placement"),
        (58.0, 32.0, "ANALOG ISLAND belongs here: north, off the ESD return path"),
        (38.0, 8.5,  "ESP32 antenna keepout 48 x 21 mm - keep clear")):
    t = pcbnew.PCB_TEXT(board)
    t.SetText(msg); t.SetPosition(V(tx, ty))
    t.SetLayer(pcbnew.Cmts_User); t.SetTextSize(pcbnew.VECTOR2I(mm(1.2), mm(1.2)))
    board.Add(t)

ds = board.GetDesignSettings()
ds.m_MinThroughDrill = mm(0.2)
ds.m_HoleToHoleMin   = mm(0.25)
ds.m_MinClearance    = mm(0.15)
ds.m_TrackMinWidth   = mm(0.15)
ds.m_CopperEdgeClearance = mm(0.25)

out = f"{ROOT}/lune-v6-rev3.2.kicad_pcb"
board.Save(out)
print(f"placed {placed}/{len(fp_of)} footprints, {board.GetNetCount()} nets -> {out}")
if missing: print("MISSING FOOTPRINTS:", missing)
if overflow: print(f"ZONE OVERFLOW ({len(overflow)}):", overflow[:12])
