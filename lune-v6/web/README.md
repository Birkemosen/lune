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

Requires a checkout of [`lune-design-system`](https://github.com/Birkemosen/lune-design-system)
as a sibling of this repo.

## Architecture

- Navigation is radio inputs + CSS (`m-dash`/`m-conf` × `s-sys`/`s-z1`…`s-z6`).
- JS only paints `[data-bind*]` and handles `lune:save` → `/api/v1`.
- Firmware serves `/`, `/en/`, `/da/`, `/lune-ui.css`, `/binder.js`.
