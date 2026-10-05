# Lune V6 Rev 3.1 Lean — retained PCB audit scripts

Rev 3.1 Lean is superseded by [Rev 3.2](../lune-v6-rev3.2/). Its schematic, routed
PCB, gerbers, manufacturing outputs, EasyEDA exports, preview images, generators
and documents have been removed. Its prose is already carried forward: Rev 3.2
owns `architecture.md`, `validation-plan.md`, `firmware-integration.md`,
`rev2-review-addendum.md` and a copy of `layout-audit.md` marked as Rev 3.1
historical evidence.

What is kept is **not documentation** — it is the six PCB-stage audit scripts that
`../lune-v6-rev3.2/validation-plan.md` § 1 names as required-at-layout, and that
`design-review.md` finding D4 lists as owed work. Deleting them would leave a
release gate pointing at nothing.

| Script | What the Rev 3.2 validation plan needs it for |
|---|---|
| `audit_placement.py` | 90 x 75 mm outline, symmetric 82 x 67 mm M3 pattern, centered RJ9 body row, 0–2 mm connector-face projection |
| `audit_pcb.py` | physical driver-sense, shunt/INA180, hardware safety-net and external 1-wire invariants |
| `audit_layout_integrity.py` | path resistance, USB DP/DM mismatch and analog trace-length bounds — must be extended to cover `ADC_TACHO` as well as `ADC_CURRENT` |
| `audit_ground_plane.py` | bottom-plane continuity and stitching-via coverage |
| `audit_manufacturing.py` | fabrication-output sanity before upload |
| `generate_jlc_files.py` | gerber/BOM/CPL generation. Must be re-checked against the native DNP attributes Rev 3.2 now emits, so the six second-source capacitors and fourteen copper-only pads stay excluded |

**None of these run against Rev 3.2 as-is.** They are hard-wired to Rev 3.1
filenames and to a PCB that does not exist yet, and they encode Rev 3.1 limits
(the BEMF frontend, the 108/114 placement counts, 49 stitching vias). Porting
them is a Rev 3.2 layout task, not a copy.

Everything else that was here — plus the whole Rev 3.0 folder and the Rev 2.1
folder — is preserved in a snapshot ref, because these folders were staged but
never committed and so are absent from branch history:

```sh
git ls-tree -r --name-only refs/snapshots/pre-hardware-cleanup \
    -- devices/lune-v6/hardware/lune-v6-rev3.1-lean
git restore --source=refs/snapshots/pre-hardware-cleanup \
    -- devices/lune-v6/hardware/lune-v6-rev3.1-lean/<file>
```

Do not delete `refs/snapshots/pre-hardware-cleanup` until this content is either
committed or confirmed unwanted.
