# Lune V6 web UI (Design System 2)

Static HTML/CSS shell + thin binder for live `/api/v1` data.

```text
web/
  build_ui.py          Build-time i18n → dist/{en,da}/index.html + web_ui.h
  i18n/{en,da}.json    String catalogue
  binder-src/          Live binder (esbuild → ui/binder.js)
  dashboard-src/       Shared API/store helpers still used by the binder
  ui/                  Built CSS, HTML, binder (make dashboard-build)
```

## Build

From repo root or `lune-v6/`:

```bash
make design-tokens    # sibling ../lune-design-system → ui/lune-ui.css
make dashboard-build  # HTML + binder.js → web/ui/ + preview.html
```

Open [`preview.html`](preview.html) (and `preview-da.html`) in a browser for a
local live preview — inline CSS + mock binder (`ui/binder.js`). Temperatures,
logs and forms tick without a device. Prefer a tiny static server if your
browser blocks `file://` scripts:

```bash
python3 -m http.server 8765 -d lune-v6/web
# → http://127.0.0.1:8765/preview.html
```

Product screenshot used in the root README:
[`docs/shots/lune-v6-dashboard-split.png`](../../docs/shots/lune-v6-dashboard-split.png)
(light / dark split).

Requires a checkout of [`lune-design-system`](https://github.com/Birkemosen/lune-design-system)
as a sibling of this repo.

## Architecture

- Information architecture follows LDS 2.3 (DESIGN.md 15): **Hjem** (`#m-home`,
  `#v-home-sys`), one **sheet** per zone and one for the manifold (native `popover`,
  tabs Overview · History · Settings) and **System** (`#m-sys`, `#v-sys`, categories
  Device · Manifold and motors · Connections · Firmware and backup · Service, Motor lab
  only on dev firmware). Where every old field went: [`MAPPING.md`](MAPPING.md).
- Navigation is radio inputs, `popover` and `<details>` — no JS needed to move around.
  Deep links: `#z3`, `#z3/settings`, `#system/connections` (slugs from i18n `hash.*`);
  old `#s-z3` / `#s-sys` links from Lune Touch are rewritten by the binder.
- JS (`ui/binder.js`) paints `[data-bind*]`, handles `lune:save` → `/api/v1`, and bundles
  the design system's `js/lune-forms.js` (dirty/save, autosave, sheets, deep links).
- `python3 check_fields.py` checks that every old field/action/data-bind
  (`conf_fields.txt`) still exists and that settings groups stay within DESIGN.md 15.5.
- Firmware serves `/`, `/en/`, `/da/`, `/lune-ui.css`, `/binder.js`.
