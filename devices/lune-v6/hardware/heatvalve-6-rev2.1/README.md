# HeatValve-6 Rev 2.1 hardware

Editable KiCad 10 design for the USB-C-only, six-channel HeatValve controller.

## Design state

- Schematic source: updated toward a shared-driver / motor-mux architecture after
  HmIP-FALMOT-C12 teardown review. `.kicad_sch` has been regenerated from
  `generate_kicad.py` with `kicad-sch-api`.
- PCB source: updated placement generator for one shared H-bridge and six motor-mux
  lanes. Regenerate `.kicad_pcb` after schematic regeneration.
- The PCB artifact may still reflect the previous placement until regenerated from
  the updated schematic.
- PCB: compact four-layer 120 x 75 mm placement review with electrical
  footprints, two M3 holes, an antenna notch, GND/+3V3 inner planes, and an
  intentionally unrouted ratsnest.
- Fabrication status: **not released**. Routing, mechanical confirmation, and final
  footprint/availability review are still required.
- PCB DRC: not current; KiCad CLI 10.0.3 aborts on both the original and updated
  board. See `drc.rpt` and rerun DRC in PCB Editor after routing.
- Prototype tuning: motor-mux part selection, BEMF filter/gain/blanking, force
  threshold, engagement signature, and optional parallel shunt.

## Generate and validate

```bash
PYTHONPATH=/private/tmp/kicad_pydeps HOME=/private/tmp \
  python3 devices/lune-v6/hardware/heatvalve-6-rev2.1/generate_kicad.py

kicad-cli sch erc \
  --output devices/lune-v6/hardware/heatvalve-6-rev2.1/erc.rpt \
  devices/lune-v6/hardware/heatvalve-6-rev2.1/heatvalve-6-rev2.1.kicad_sch

/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3.9 \
  devices/lune-v6/hardware/heatvalve-6-rev2.1/generate_pcb.py

kicad-cli pcb drc \
  --output devices/lune-v6/hardware/heatvalve-6-rev2.1/drc.rpt \
  devices/lune-v6/hardware/heatvalve-6-rev2.1/heatvalve-6-rev2.1.kicad_pcb
```

The committed `.kicad_sch` is usable without the Python generator dependency.

## Important design decisions

- USB-C VBUS is the sole board power input. There is no mains input, auxiliary
  low-voltage input, or separate external motor supply on this revision.
- Motors and logic operate from the MT2492-generated 3.3 V rail.
- Only one motor may run at a time; this is now a hardware architecture assumption,
  not just a firmware scheduling preference.
- A single shared DRV8837 H-bridge drives `MOT_COM` and `MOT_DRV`.
- Each 4P4C jack uses pin 2 as shared `MOT_COM`; pin 3 is selected onto `MOT_DRV`
  by one low-Ron bidirectional SPST mux/load switch.
- The mux component is intentionally marked `TBD_LOW_RON_SPST` in the generator
  until a purchasable part is chosen and validated for <=1 ohm Ron target,
  >=250 mA peak current, bidirectional off-isolation, and 3.3 V operation.
- The shared driver ground return meets `SHUNT`; `RSH1` is the only normal return
  to system ground.
- `RSH1` is 1.0 ohm and INA180A1 provides x20 gain: 30 mA = 0.60 V,
  60 mA = 1.20 V, and 150 mA = 3.00 V. This preserves the pin-engagement peak.
- `R14`, `C13`, and `D5` provide additional ADC filtering and rail clamp protection.
- The hardware force-limit comparator reads the raw Kelvin shunt and remains effective if the ADC path saturates.
- Because the selected motor is directly on the shared motor bus, the BEMF front
  end now samples `MOT_COM` and `MOT_DRV` directly. `ADC_BEMF` retains the raw
  waveform and `TACHO_EDGE` feeds PCNT after AC gain and hysteresis.
- Current is the primary endstop/load/force signal. Tacho/Back-EMF is the primary
  motion-count signal.
- Shunt ripple is not used as authoritative motion evidence. Firmware must qualify
  tacho edges as real motor commutations against BEMF waveform, direction,
  switching blanking, mux state, and cadence.
- The latch powers up with `DRIVE_PERMIT` low and must be explicitly armed by firmware.
- Three OneWire connectors share GPIO42. The DNP I2C header uses GPIO1/GPIO2.
- Motor jacks use the center pair: pin 2 shared `MOT_COM`, pin 3 per-zone
  `MOTx_SEL`.

See `design-review.md` for calculations and release gates, and
`measurement-and-position.md` for engagement, modulation, endstop, and position logic.
