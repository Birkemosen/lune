#!/usr/bin/env python3
"""
Tjek Lune V6-siden efter flytningen til Hjem / ark / System (LDS DESIGN.md 15).
Efter lune-design-system/examples/v6/check_fields.py, udvidet med binderens kontrakt.

    python lune-v6/web/check_fields.py [lune-v6/web/ui/da/index.html]

1. Hvert felt og hver handling i conf_fields.txt (den gamle Dashboard/Konfiguration)
   findes i den nye markup; hver bind:-nøgle findes som data-bind. Felter på listen
   removed: (med begrundelse) må IKKE findes.
2. Ingen grupperet liste har mere end 6 rækker; ingen fane, System-kategori
   eller underside har mere end 5 grupper.
3. Tekstfelter i grupperede lister har en bredde fra 15.6 (.w-*).
4. De gamle visninger og tilstande (v-dash-*, v-conf-*, m-dash, m-conf, s-zN) er væk.
5. Hver data-save-nøgle i siden håndteres af binderen (binder-src/main.js), og
   hver ark-fane / System-kategori har højst én gem-bjælke.
Afslutter med kode 1 ved fejl.
"""
import pathlib, re, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent
MAX_ROWS, MAX_GROUPS = 6, 5

# data-save → mønster, som handleSave() i main.js skal indeholde.
SAVE_KEYS = {
    r"device": "saveKey === 'device'",
    r"ble_clock": "saveKey === 'ble_clock'",
    r"manifold": "saveKey === 'manifold'",
    r"regulation": "saveKey === 'regulation'",
    r"connections": "saveKey === 'connections'",
    r"wifi": "saveKey === 'wifi'",
    r"firmware": "saveKey === 'firmware'",
    r"backup": "saveKey === 'backup'",
    r"service": "saveKey === 'service'",
    r"zone/\d": r"/^zone\/(\d+)$/",
    r"zone/\d/target": r"/^zone\/(\d+)\/target$/",
    r"zone/\d/recovery": r"/^zone\/(\d+)\/recovery$/",
}


class Walk(HTMLParser):
    """Tæller rækker pr. .setting-list, grupper og gem-bjælker pr. fane/kategori/underside."""
    VOID = {"input", "br", "img", "meta", "link", "hr", "source", "use", "path", "circle", "rect", "line", "polyline", "polygon"}

    def __init__(self):
        super().__init__()
        self.stack = []          # (tag, classes, info)
        self.errors = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = set((a.get("class") or "").split())
        parent = self.stack[-1] if self.stack else None
        # række i en liste: barn af .setting-list eller .gated-body (evt. via en show-when-wrapper)
        if parent and (cls & {"setting"} or tag == "details"):
            hosts = [s for s in reversed(self.stack) if s[1] & {"setting-list", "gated-body"}]
            direct = parent[1] & {"setting-list", "gated-body"} or (
                hosts and self.stack.index(hosts[0]) == len(self.stack) - 2 and "data-show-when" in parent[2]["attrs"])
            if direct:
                lst = next(s for s in reversed(self.stack) if "setting-list" in s[1])
                lst[2]["rows"] += 1
        if "setting-group" in cls:
            host = next((s for s in reversed(self.stack) if s[1] & {"tab-panel", "sys-cat", "subpage-body"}), None)
            if host:
                host[2]["groups"] += 1
        if "savebar" in cls:
            host = next((s for s in reversed(self.stack) if s[1] & {"tab-panel", "sys-cat"}), None)
            if host:
                host[2]["savebars"] += 1
        if tag == "input" and "input" in cls and not any(c.startswith("w-") for c in cls):
            if any("setting-control" in s[1] for s in self.stack):
                self.errors.append(f'tekstfelt uden .w-* i grupperet liste: id="{a.get("id")}"')
        info = {"rows": 0, "groups": 0, "savebars": 0, "attrs": a,
                "label": a.get("id") or a.get("data-cat") or a.get("data-tab") or ""}
        if tag not in self.VOID:
            self.stack.append((tag, cls, info))

    def handle_startendtag(self, tag, attrs):
        # <path …/> o.l.: tæl, men læg ikke på stakken (ellers popper endtag for meget).
        self.VOID = self.VOID | {tag}
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in self.VOID or not any(t == tag for t, _, _ in self.stack):
            return
        while self.stack:
            t, cls, info = self.stack.pop()
            if "setting-list" in cls and info["rows"] > MAX_ROWS:
                self.errors.append(f"gruppe med {info['rows']} rækker (maks. {MAX_ROWS}) i {self.where()}")
            if cls & {"tab-panel", "sys-cat", "subpage-body"} and info["groups"] > MAX_GROUPS:
                self.errors.append(f"{self.where()} {info['label'] or t} har {info['groups']} grupper (maks. {MAX_GROUPS})")
            if cls & {"tab-panel", "sys-cat"} and info["savebars"] > 1:
                self.errors.append(f"{self.where()} {info['label'] or t} har {info['savebars']} gem-bjælker (maks. 1)")
            if t == tag:
                break

    def where(self):
        for t, cls, info in reversed(self.stack):
            if cls & {"sheet", "sys-cat"}:
                return info["label"]
        return "?"


def main():
    page = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "ui" / "da" / "index.html"
    html = page.read_text(encoding="utf-8")
    markup = html.split('<script type="application/json"')[0]      # uden lune-forms.js/binder
    binder = (ROOT / "binder-src" / "main.js").read_text(encoding="utf-8")
    rows = [l.strip() for l in (ROOT / "conf_fields.txt").read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]
    removed = {}
    for l in rows:
        if l.startswith("removed:"):
            name, _, why = l[len("removed:"):].partition("|")
            if not why.strip():
                errors_pre = f"removed:{name.strip()} mangler begrundelse"
                print("FEJL ", errors_pre); sys.exit(1)
            removed[name.strip()] = why.strip()
    want = [l for l in rows if not l.startswith("removed:")]
    errors = []

    names = set(re.findall(r'\bname="([^"]+)"', markup))
    actions = set(re.findall(r'name="action" value="([^"]+)"', markup))
    data_actions = set(re.findall(r'data-action="([^"]+)"', markup))
    binds = set(re.findall(r'data-bind="([^"]+)"', markup))
    for w in want:
        kind, _, v = w.partition(":") if ":" in w else ("", "", w)
        ok = {"action": actions, "data-action": data_actions, "bind": binds}.get(kind, names)
        if (v if kind else w) not in ok:
            errors.append(f"mangler: {w}")

    for name in removed:
        if f'name="{name}"' in markup:
            errors.append(f"bevidst fjernet felt findes stadig: {name}")

    for old in ('id="v-dash-', 'id="v-conf-', 'id="m-dash"', 'id="m-conf"', 'id="s-z', 'for="s-z'):
        if old in markup:
            errors.append(f"gammel markup findes stadig: {old}")

    for key in sorted(set(re.findall(r'data-save="([^"]+)"', markup))):
        pat = next((p for k, p in SAVE_KEYS.items() if re.fullmatch(k, key)), None)
        if not pat:
            errors.append(f"data-save=\"{key}\" er ukendt for check_fields (tilføj den i SAVE_KEYS)")
        elif pat not in binder:
            errors.append(f"data-save=\"{key}\" håndteres ikke i binder-src/main.js ({pat})")

    walk = Walk()
    walk.feed(markup)
    errors += walk.errors

    for e in errors:
        print("FEJL ", e)
    print(f"{page}: {len(want)} felter/handlinger/bindinger tjekket, {len(removed)} bevidst fjernet, {len(errors)} fejl")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
