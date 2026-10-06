#!/bin/sh
# Smoke checks for the LDS2 dashboard shell + binder + firmware routes.
set -eu

root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
web="$root/web"
ui="$web/ui"
binder="$web/binder-src/main.js"
build_ui="$web/build_ui.py"
en_i18n="$web/i18n/en.json"
da_i18n="$web/i18n/da.json"
cpp="$root/components/lv6_dashboard/lv6_dashboard.cpp"
yaml="$root/packages/zones/lv6_dashboard.yaml"
api="$web/dashboard-src/core/api.js"
sse="$web/dashboard-src/core/sse.js"
store="$web/dashboard-src/core/store.js"

test -f "$binder"
test -f "$build_ui"
test -f "$en_i18n"
test -f "$da_i18n"
test -f "$api"
test -f "$sse"
test -f "$store"

# Built artifacts (make dashboard-build)
test -f "$ui/lune-ui.css"
test -f "$ui/binder.js"
test -f "$ui/en/index.html"
test -f "$ui/da/index.html"
test -f "$web/preview.html"
test -f "$web/preview-da.html"
grep -qF 'id="v-home-sys"' "$web/preview.html"
grep -qF 'LV6_DASHBOARD_CONFIG' "$web/preview.html"
grep -qF 'ui/binder.js' "$web/preview.html"
grep -qF 'mock:true' "$web/preview.html"

# Shell contract (LDS 2.3, DESIGN.md 15): Home / sheets / System, radio state before .app
grep -qF 'id="m-home"' "$ui/en/index.html"
grep -qF 'id="m-sys"' "$ui/en/index.html"
grep -qF 'id="s-sys"' "$ui/en/index.html"
grep -qF 'id="v-home-sys"' "$ui/en/index.html"
grep -qF 'id="v-sys"' "$ui/en/index.html"
grep -qF 'id="sheet-manifold"' "$ui/en/index.html"
grep -qF 'id="sheet-z1"' "$ui/en/index.html"
grep -qF 'id="sheet-z6"' "$ui/en/index.html"
grep -qF 'popovertarget="sheet-z3"' "$ui/en/index.html"
grep -qF 'class="savebar"' "$ui/en/index.html"
grep -qF 'id="c-device"' "$ui/en/index.html"
grep -qF 'id="c-service"' "$ui/en/index.html"
grep -qF 'class="state"' "$ui/en/index.html"
! grep -qF 'id="m-dash"' "$ui/en/index.html"
! grep -qF 'id="m-conf"' "$ui/en/index.html"
! grep -qF 'id="v-dash-' "$ui/en/index.html"
! grep -qF 'id="v-conf-' "$ui/en/index.html"
grep -qF '/binder.js' "$ui/en/index.html"
grep -qF '/lune-ui.css' "$ui/en/index.html"
! grep -qF 'side-panel' "$ui/en/index.html"
! grep -qF 'fonts.googleapis.com' "$ui/en/index.html"
! grep -qF 'Montserrat' "$ui/en/index.html"

# Feature parity: forms on System and in the sheets
grep -qF 'data-save="connections"' "$ui/en/index.html"
grep -qF 'data-save="wifi"' "$ui/en/index.html"
grep -qF 'data-save="device"' "$ui/en/index.html"
grep -qF 'data-save="manifold"' "$ui/en/index.html"
grep -qF 'data-save="regulation"' "$ui/en/index.html"
grep -qF 'data-save="zone/1"' "$ui/en/index.html"
grep -qF 'data-save="zone/1/target"' "$ui/en/index.html"
grep -qF 'data-save="ble_clock"' "$ui/en/index.html"
grep -qF 'data-save="firmware"' "$ui/en/index.html"
grep -qF 'data-save="backup"' "$ui/en/index.html"
grep -qF 'data-save="service"' "$ui/en/index.html"
grep -qF 'data-dev-only' "$ui/en/index.html"
grep -qF 'External room temperatures' "$ui/en/index.html"

# No product forecast chart (Touch owns weather)
! grep -qF 'data-bind-fc=' "$ui/en/index.html"

# Danish page exists and differs
grep -qF 'lang="da"' "$ui/da/index.html"
grep -qF 'Hjem' "$ui/da/index.html"
grep -qF 'Indstillinger' "$ui/da/index.html"

# lune-forms.js (LDS) is bundled into the binder, not inlined in the page
grep -qF 'luneSaved' "$ui/binder.js"
grep -qF 'syscat' "$ui/binder.js"
! grep -qF 'luneSaved' "$ui/en/index.html"
if command -v node >/dev/null 2>&1; then
  # Binder unit tests
  node "$web/binder-src/projection.test.js" >/dev/null
fi

# Every old field/action and every data-bind key still exists; group limits (DESIGN.md 15.5)
python3 "$web/check_fields.py" "$ui/en/index.html"
python3 "$web/check_fields.py" "$ui/da/index.html"

# Binder hooks
grep -qF "lune:save" "$binder"
grep -qF "/api/v1" "$api"
grep -qF "connect(" "$sse"
grep -qF "approveTouchProposal" "$binder"
grep -qF "exportSettings" "$binder"

# Firmware serves LDS2 routes
grep -qF 'handle_ui_html_' "$cpp"
grep -qF 'handle_ui_css_' "$cpp"
grep -qF '/lune-ui.css' "$cpp"
grep -qF '/binder.js' "$cpp"
grep -qF 'lune_lang=' "$cpp"
grep -qF 'ui_css: ../web/ui/lune-ui.css' "$yaml"
grep -qF 'binder_js: ../web/ui/binder.js' "$yaml"

# i18n key parity
python3 - "$en_i18n" "$da_i18n" <<'PY'
import json, sys
en = json.load(open(sys.argv[1], encoding="utf-8"))
da = json.load(open(sys.argv[2], encoding="utf-8"))
missing = sorted(set(en) - set(da))
extra = sorted(set(da) - set(en))
assert not missing, missing
assert not extra, extra
assert len(en) >= 200
PY

echo "dashboard LDS2 smoke OK"
