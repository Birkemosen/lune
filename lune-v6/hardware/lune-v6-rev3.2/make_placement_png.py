"""Draw the rev3.2 placement floorplan from the .kicad_pcb geometry.

Two steps, because pcbnew only runs under KiCad's own Python:
  1) KiCad python:  export geometry to geom.json   (--export)
  2) system python: render geom.json -> SVG        (default)
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GEOM = os.path.join(HERE, "placement-geom.json")
SVG  = os.path.join(HERE, "placement-floorplan.svg")
PCB  = os.path.join(HERE, "lune-v6-rev3.2.kicad_pcb")
W, H = 100.0, 70.0

if "--export" in sys.argv:                      # run me with KiCad's python
    import pcbnew
    b = pcbnew.LoadBoard(PCB); mm = pcbnew.ToMM
    out = []
    for f in b.Footprints():
        x, y = mm(f.GetPosition().x), mm(f.GetPosition().y)
        if x >= 105:                            # parked off-board
            continue
        bb = f.GetBoundingBox(False, False)
        out.append(dict(ref=f.GetReference(), x=x, y=y,
                        x0=mm(bb.GetLeft()), y0=mm(bb.GetTop()),
                        x1=mm(bb.GetRight()), y1=mm(bb.GetBottom())))
    json.dump(out, open(GEOM, "w"), indent=1)
    print(f"exported {len(out)} on-board footprints -> {GEOM}")
    raise SystemExit

g = json.load(open(GEOM))
S = 13.0
PADL, PADT, PADR, PADB = 74, 62, 620, 100
Xp = lambda v: PADL + v * S
Yp = lambda v: PADT + v * S
DIMX, BANDX, LEGX = Xp(W) + 22, Xp(W) + 40, Xp(W) + 190

BLOCK = {}
for r in ("J11", "J12", "J13", "J14", "J15", "J16"): BLOCK[r] = ("conn", "#2E6F9E")
for r in ("J1", "J20"):                              BLOCK[r] = ("io",   "#3E8CC4")
for n in range(40, 52):                              BLOCK[f"D{n}"] = ("tvs", "#6B4FBF")
for r in ("U20", "U21", "U22"):                      BLOCK[r] = ("drv",  "#0C6F60")
for r in (["C30","C31","C32","C33","C34","C35"] + [f"C{n}" for n in (110,111,112,114,115,116)]
          + [f"RSA{i}" for i in (1,2,3)] + [f"RSB{i}" for i in (1,2,3)]):
    BLOCK[r] = ("pass", "#5FAF9F")
BLOCK["U1"] = ("mcu", "#6E7A80"); BLOCK["U24"] = ("dec", "#B07A1E")
for r in ("H1", "H2", "H3", "H4"): BLOCK[r] = ("mnt", "#9AA3A8")

CW, CH = PADL + W*S + PADR, PADT + H*S + PADB
s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{CW:.0f}" height="{CH:.0f}" viewBox="0 0 {CW:.0f} {CH:.0f}">',
     '<rect width="100%" height="100%" fill="#FBFBF9"/>',
     '<style>text{font-family:Helvetica,Arial,sans-serif}'
     '.ref{font-size:11px;font-weight:600;fill:#14201F}'
     '.hd{font-size:23px;font-weight:700;fill:#14201F}'
     '.sub{font-size:13px;fill:#55655F}.dim{font-size:12px;fill:#55655F}'
     '.band{font-size:11.5px;font-weight:600;fill:#0C6F60;letter-spacing:0.06em}'
     '.ann{font-size:12.5px;fill:#5B43AD}.lg{font-size:13px;fill:#14201F}</style>']

NW, ND = 21.0, 7.0
nx0, nx1 = 50.0-NW/2, 50.0+NW/2
s.append(f'<rect x="{Xp(nx0):.1f}" y="{Yp(0):.1f}" width="{NW*S:.1f}" height="{ND*S:.1f}" '
         f'fill="#FBFBF9" stroke="#6B4FBF" stroke-width="1.6" stroke-dasharray="5 3"/>')
s.append(f'<text class="ann" x="{Xp(nx1)+10:.1f}" y="{Yp(ND)-4:.1f}">antenna cutout 21 x 7 mm</text>')

# Bands and corridors, measured off the placed parts rather than hardcoded.
by = lambda ref, i: [c for c in g if c["ref"] == ref][0][("x0","y0","x1","y1")[i]]
mod_bottom = [c for c in g if c["ref"] == "U1"][0]["y"] + 12.75
drv_block  = ["U20","U21","U22"] + [f"C{n}" for n in (30,31,32,33,34,35,110,111,112,114,115,116)] \
             + [f"RSA{i}" for i in (1,2,3)] + [f"RSB{i}" for i in (1,2,3)]
drv_top    = min(by(r, 1) for r in drv_block)   # the VM caps, not U20's courtyard
tvs_bottom = max(by(f"D{n}", 3) for n in range(40, 52))
conn_top   = min(by(f"J{n}", 1) for n in range(11, 17))

# The only way from the west side of the module to the east: the antenna cutout
# removes the board north of it, so the rail has to pass south of the module.
s_corr = f'''<rect x="{Xp(0)}" y="{Yp(mod_bottom):.1f}" width="{W*S}" height="{(drv_top-mod_bottom)*S:.1f}"
     fill="#C2621A" fill-opacity="0.10" stroke="#C2621A" stroke-width="1.3" stroke-dasharray="7 4"/>'''
s.append(s_corr)
s.append(f'<text class="corr" x="{BANDX}" y="{Yp((mod_bottom+drv_top)/2)-2:.1f}">ROUTING CORRIDOR</text>')
s.append(f'<text class="dim" x="{BANDX}" y="{Yp((mod_bottom+drv_top)/2)+11:.1f}">{drv_top-mod_bottom:.2f} mm clear - the only route east</text>')

# +3V3_LOGIC: pad 2 (west) -> corridor -> up into the analog island
rail_y = drv_top - 1.6
path = [(41.2, 9.3), (37.6, 9.3), (37.6, rail_y), (62.0, rail_y), (62.0, 16.0)]
d = " ".join(("M" if i == 0 else "L") + f"{Xp(x):.1f},{Yp(y):.1f}" for i, (x, y) in enumerate(path))
s.append(f'<path d="{d}" fill="none" stroke="#C2621A" stroke-width="2.4" stroke-dasharray="6 3" marker-end="url(#railArrow)"/>')
s.append(f'<circle cx="{Xp(41.2):.1f}" cy="{Yp(9.3):.1f}" r="3.4" fill="#C2621A"/>')
s.append(f'<text class="corr" x="{Xp(37.0):.1f}" y="{Yp(9.3)-7:.1f}" text-anchor="end">+3V3_LOGIC</text>')
s.append(f'<text class="dim" x="{Xp(37.0):.1f}" y="{Yp(9.3)+6:.1f}" text-anchor="end">pad 2</text>')
s.append(f'<text class="corr" x="{Xp(63.0):.1f}" y="{Yp(19.0):.1f}">analog island: FB1 + C10</text>')
s.append(f'<text class="corr" x="{Xp(63.0):.1f}" y="{Yp(19.0)+13:.1f}">belong HERE, not at the buck</text>')

# the strip that must NOT carry the analog rail
s.append(f'''<rect x="{Xp(0)}" y="{Yp(tvs_bottom):.1f}" width="{W*S}" height="{(conn_top-tvs_bottom)*S:.1f}"
     fill="url(#hatch)" stroke="#A32118" stroke-width="1.2"/>''')
s.append(f'<text class="no" x="{BANDX}" y="{Yp(conn_top)+13:.1f}">ESD RETURN &#8212; no analog rail here</text>')
s.append(f'<text class="dim" x="{BANDX}" y="{Yp(conn_top)+26:.1f}">{conn_top-tvs_bottom:.2f} mm, and 12 motor traces cross it</text>')

for y0, y1, lbl in ((H-19.0, H, "MOTOR CONNECTORS"), (H-22.6, H-19.0, "TVS ROW"), (H-36.5, H-22.6, "DRIVER BAND")):
    s.append(f'<rect x="{Xp(0)}" y="{Yp(y0):.1f}" width="{W*S}" height="{(y1-y0)*S:.1f}" fill="#0C6F60" opacity="0.045"/>')
    s.append(f'<text class="band" x="{BANDX}" y="{Yp((y0+y1)/2)+4:.1f}">{lbl}</text>')
NW2, ND2 = 21.0, 7.0
ox0, ox1 = 50.0-NW2/2, 50.0+NW2/2
pts=[(0,0),(ox0,0),(ox0,ND2),(ox1,ND2),(ox1,0),(W,0),(W,H),(0,H)]
d=" ".join(("M" if i==0 else "L")+f"{Xp(x):.1f},{Yp(y):.1f}" for i,(x,y) in enumerate(pts))+" Z"
s.append(f'<path d="{d}" fill="none" stroke="#14201F" stroke-width="2.4"/>')

for c in g:
    ref = c["ref"]; kind, col = BLOCK.get(ref, ("other", "#8A8F94"))
    if kind == "mnt":
        s.append(f'<circle cx="{Xp(c["x"]):.1f}" cy="{Yp(c["y"]):.1f}" r="{3.0*S:.1f}" fill="none" stroke="{col}" stroke-width="1.6"/>')
        s.append(f'<circle cx="{Xp(c["x"]):.1f}" cy="{Yp(c["y"]):.1f}" r="{1.6*S:.1f}" fill="{col}" opacity="0.35"/>')
        s.append(f'<text class="ref" x="{Xp(c["x"]):.1f}" y="{Yp(c["y"])+4:.1f}" text-anchor="middle">{ref}</text>')
        continue
    if ref == "U1": x0, y0, x1, y1 = c["x"]-9, c["y"]-12.75, c["x"]+9, c["y"]+12.75
    else:           x0, y0, x1, y1 = c["x0"], c["y0"], c["x1"], c["y1"]
    s.append(f'<rect x="{Xp(x0):.1f}" y="{Yp(y0):.1f}" width="{(x1-x0)*S:.1f}" height="{(y1-y0)*S:.1f}" '
             f'fill="{col}" fill-opacity="0.30" stroke="{col}" stroke-width="1.5" rx="1.5"/>')
    tvs = ref.startswith("D") and len(ref) == 3
    s.append(f'<text class="ref" x="{(Xp(c["x"]) if tvs else Xp((x0+x1)/2)):.1f}" '
             f'y="{(Yp(y0)-4 if tvs else Yp((y0+y1)/2)+4):.1f}" text-anchor="middle">{ref}</text>')

s.append(f'<text class="hd" x="{PADL}" y="32">Lune V6 rev3.2 &#8212; component placement floorplan</text>')
s.append(f'<text class="sub" x="{PADL}" y="51">100 x 70 mm (21 x 7 mm antenna cutout) &#183; 2 layers &#183; 47 of 144 parts anchored by rule &#183; unrouted</text>')
s.append(f'<line x1="{Xp(0)}" y1="{Yp(H)+38}" x2="{Xp(W)}" y2="{Yp(H)+38}" stroke="#55655F" stroke-width="1"/>')
s.append(f'<text class="dim" x="{Xp(W/2):.1f}" y="{Yp(H)+56:.1f}" text-anchor="middle">100.0 mm</text>')
s.append(f'<line x1="{DIMX}" y1="{Yp(0)}" x2="{DIMX}" y2="{Yp(H)}" stroke="#55655F" stroke-width="1"/>')
s.append(f'<text class="dim" x="{DIMX-6:.1f}" y="{Yp(H/2):.1f}" text-anchor="end" '
         f'transform="rotate(-90 {DIMX-6:.1f} {Yp(H/2):.1f})">70.0 mm</text>')
s.append(f'<text class="dim" x="{Xp(0)}" y="{Yp(H)+78:.1f}">South edge: M3 6.0 + 6x RJ9 73.35 (12.25 mm pitch) + 1-wire 8.0 + M3 6.0 = 99.35 mm</text>')
s.append(f'<text class="dim" x="{Xp(0)}" y="{Yp(H)+94:.1f}">RJ9 and 1-wire project +1.03 mm south &#183; USB-C flush on west &#183; M3 rectangle 90.35 x 61 mm</text>')

LY = Yp(0)+6
for i, (lbl, col) in enumerate((("Motor connectors (RJ9)", "#2E6F9E"), ("USB-C (west) / 1-wire (south)", "#3E8CC4"),
        ("ESD TVS / antenna cutout", "#6B4FBF"), ("DRV8411 drivers", "#0C6F60"),
        ("Driver passives / xISEN", "#5FAF9F"), ("ESP32-S3 module", "#6E7A80"),
        ("74HC4514 one-hot decoder", "#B07A1E"), ("M3 mounting (3.2 mm drill)", "#9AA3A8"))):
    s.append(f'<rect x="{LEGX}" y="{LY+i*24}" width="15" height="12" fill="{col}" fill-opacity="0.30" stroke="{col}" stroke-width="1.4"/>')
    s.append(f'<text class="lg" x="{LEGX+23}" y="{LY+i*24+11}">{lbl}</text>')
ny = LY+8*24+26
for ln in ("Not shown: 97 parts parked off-board,", "awaiting manual placement.", "",
           "The analog island belongs north of the", "driver band, clear of the ESD return path."):
    if ln: s.append(f'<text class="sub" x="{LEGX}" y="{ny}">{ln}</text>')
    ny += 18
s.append('</svg>')
open(SVG, "w").write("\n".join(s))
print(f"wrote {SVG}")
