# Lune V6 Rev 3.0 — retained reference documents

Rev 3.0 is superseded by [Rev 3.2](../lune-v6-rev3.2/). Its schematic, placement
PCB, generators, BOM, cost model and preview images have been removed; only the
three documents Rev 3.2 still cites are kept here.

| File | Why it is kept |
|---|---|
| `requirements.md` | **Still the normative requirements document.** Rev 3.2 has none of its own, so the `shall`/`must`/`release blocker` clauses (F-01..F-08, E-01..E-10, S-01..S-08, R-01..R-10) are the ones Rev 3.2 is measured against. Note that F-03/F-04 mandate eight channels and E-03 mandates differential BEMF, both of which Rev 3.2 deliberately supersedes — see `../lune-v6-rev3.2/design-review.md` finding D5. |
| `pinout-audit.md` | Datasheet pin-by-pin audit evidence. Rev 3.2 relies on its TPS2553-1 finding (active-high enable, latch-off, 23.7k giving a 1.00–1.17 A limit). It does **not** cover the Rev 3.2 analog chain, the `Q14` timer tap or the `+3V3_EXT` branch, so a Rev 3.2 audit is still owed. |
| `rev2-review.md` | The evidence-backed Rev 2.1 electrical findings and disposition. `../lune-v6-rev3.2/rev2-review-addendum.md` supersedes only its channel-count and driver recommendation and explicitly keeps the rest, so this is the document that record points at. |

## Recovering the removed files

Everything deleted from this folder is preserved in a snapshot ref created before
the cleanup — the Rev 3.0 and Rev 3.1 folders were staged but never committed, so
ordinary branch history does not contain them:

```sh
git ls-tree -r --name-only refs/snapshots/pre-hardware-cleanup \
    -- devices/lune-v6/hardware/lune-v6-rev3.0
git restore --source=refs/snapshots/pre-hardware-cleanup \
    -- devices/lune-v6/hardware/lune-v6-rev3.0/<file>
```

Do not delete `refs/snapshots/pre-hardware-cleanup` until this content is either
committed or confirmed unwanted.
