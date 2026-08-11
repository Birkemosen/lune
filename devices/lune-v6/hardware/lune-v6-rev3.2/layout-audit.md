# Rev 3.1 Lean quantitative layout audit

> **Historical evidence only.** This file measures the Rev 3.1 Lean routed
> candidate. It does not validate Rev 3.2: the BEMF frontend it audits no longer
> exists, the commutation-tacho chain and `ADC_TACHO` route are not covered, and
> `audit_layout_integrity.py` lives in `../lune-v6-rev3.1-lean/`. When the Rev 3.2
> PCB exists, port that script forward and extend its ADC-length limits to cover
> `ADC_TACHO` as well as `ADC_CURRENT`.

This audit complements DRC. It checks whether the compact two-layer routing is
electrically proportionate to the one-motor-at-a-time architecture instead of
assuming that minimum-clearance copper is automatically acceptable.

`audit_layout_integrity.py` models 35 um outer copper at 20 C and includes a
1 mOhm allowance per 0.30 mm via. With the current routed candidate it reports:

| Path | Audit load | Calculated drop |
|---|---:|---:|
| TPS2553 output to motor regulator input | 0.50 A | 23.9 mV |
| Motor regulator output to rail shunt | 0.25 A | 22.6 mV |
| Rail shunt to worst-case driver | 0.20 A | 38.6 mV |
| Worst complete motor-output PCB loop | 0.20 A | 30.8 mV |

These values are compatible with the fixed approximately 200 mA bridge limit
and hardware one-hot selection. They are not permission to drive two motors at
once. Connector, cable, LDO, shunt and H-bridge drops are additional and must
be included when characterizing actuator voltage and endstop signatures.

Signal routing results:

- Complete connector-to-MCU USB DP/DM routes are 46.9/43.1 mm, with 3.8 mm
  mismatch and 5/2 vias. This is acceptable for ESP32-S3 full-speed USB but not evidence
  for a high-speed interface.
- The filtered current path from R20 to the MCU ADC is 45.8 mm.
- The filtered BEMF path from R30 to the MCU ADC is 48.7 mm.
- Moving TP1 from the service edge to the analog region removed 20.5 mm of
  unterminated current-ADC copper. Total `ADC_CURRENT` copper fell from 79.5
  to 61.4 mm. Total BEMF copper is 55.9 mm.

The bottom GND pour is interrupted by two-layer crossovers; F.Cu is also
GND-filled and 56 GND stitching vias provide local return paths. The automated
gate bounds B.Cu signal copper to 2000 mm total and any individual segment to
45 mm; the current result is 1784.1 mm and 34.6 mm. This is acceptable for a
fabrication prototype candidate, not proof of EMC robustness. Mass-production
release still requires:

1. oscilloscope verification of motor-rail bounce and ADC ground movement;
2. current/BEMF false-trigger testing during USB, Wi-Fi and motor commutation;
3. ESD/EFT tests at all motor and 1-wire cable connectors;
4. thermal measurement of the motor LDO, shunt and all three bridges;
5. inspection of fabricated copper and annular rings against the Gerber files.

The script deliberately fails if later routing exceeds the reviewed resistance,
USB mismatch or ADC-length limits.
