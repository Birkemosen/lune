#!/usr/bin/env python3
"""
Lune V6 web-UI — Lune Design System 2.3 (Hjem / ark / System, DESIGN.md 15).
Bygger siden med build-time i18n oven på dist/v6/lune-ui.css.

    python build_ui.py                       # standard: --langs en,da
    python build_ui.py --langs de,en         # vælg sprog ved compile
    LUNE_UI_LANGS=da python build_ui.py      # eller via miljøvariabel (fx fra PlatformIO)

Output (i --out, standard ./dist):
    lune-ui.css(.gz)              fælles stylesheet
    <lang>/index.html(.gz)        én færdigoversat side pr. sprog
    web_ui.h                      gzip-bytes som C-arrays + sprogtabel til firmwaren

Struktur:
    Hjem    (#m-home, #v-home-sys)  statuslinje, fejl, Varme nu, Komfort pr. zone
    Ark     (.sheet popover)        manifold + én pr. zone: Overblik · Historik · Indstillinger
    System  (#m-sys, #v-sys)        Enhed · Manifold og motorer · Forbindelser ·
                                    Firmware og backup · Service (+ Motorlab i dev-firmware)

Første sprog i listen er standard/fallback. Mangler en nøgle i et katalog,
bruges engelsk (eller første sprog), og buildet advarer. Med ét sprog
udelades sprogvælgeren helt.

Sprogskift kræver ingen JavaScript: vælgeren er almindelige links til
/en/ og /da/. Firmwaren serverer "/" ud fra cookie → Accept-Language →
standardsprog (se lune_ui_pick() i web_ui.h).
"""
import argparse, gzip, json, math, os, sys, pathlib

ROOT = pathlib.Path(__file__).parent
LDS_ROOT = next((c for c in (
    ROOT.parents[2] / "lune-design-system",
    ROOT.parents[1] / "lune-design-system",
    pathlib.Path.home() / "workspace/github.com/birkemosen/lune-design-system",
) if (c / "tools/lds_build.py").exists()), None)

# ---------------------------------------------------------------- katalog --
class Cat:
    def __init__(self, lang, fallback):
        self.d = json.load(open(ROOT / "i18n" / f"{lang}.json", encoding="utf-8"))
        self.fb = fallback
        self.missing = set()
    def __call__(self, k, **kw):
        if k in self.d: s = self.d[k]
        elif self.fb and k in self.fb.d:
            self.missing.add(k); s = self.fb.d[k]
        else:
            raise KeyError(f"Mangler i18n-nøgle: {k}")
        return s.format(**kw) if kw else s
    def num(self, x, dec=1):
        return f"{x:.{dec}f}".replace(".", self.d["_dec"])
    def meta(self, k): return self.d[k]

# ---------------------------------------------------------------- data -----
# Eksempeldata til preview. I firmwaren erstattes værdierne af binderen
# (data-bind*) eller ved server-side rendering.
Z = [
 (1,"Josephine",21.4,22.0,"calling",62,29.1,None,"sw","ble",12.0,150,"PEX 16mm"),
 (2,"Laura",20.8,21.0,"idle",18,28.2,None,"ne","ble",11.0,150,"PEX 16mm"),
 (3,"Toilet",22.6,22.0,"idle",6,28.9,None,"","probe",4.5,100,"PEX 16mm"),
 (4,"Stue rum 1",21.1,21.5,"calling",54,28.4,None,"s","probe",22.0,150,"PEX 16mm"),
 (5,"Stue rum 2",21.0,21.5,"calling",54,28.5,None,"sw","probe",18.0,150,"PEX 16mm"),
 (6,"Soveværelse",17.8,19.0,"fault",0,22.1,None,"n","ble",14.0,200,"ALUPEX 16mm"),
]
PIPES=["PEX 12mm","PEX 14mm","PEX 16mm","PEX 17mm","PEX 18mm","PEX 20mm","ALUPEX 16mm","ALUPEX 20mm","Unknown"]
def level(z): return 0 if z[4] in ("fault","off") else max(1, math.ceil(z[5]/10))   # 10 segmenter á 10 %
def tid(z): return "Z4–5" if z[7]=="primary" else f"Z{z[0]}"
def rid(z): return "Z5" if z[7]=="member" else tid(z)

# ---------------------------------------------------------------- render ---
def render(T, langs, lang_urls, css_href, inline_css=None, include_binder=True, binder_src="/binder.js", mock=False):
    ST={k:T(f"state.{k}") for k in ("calling","idle","fault","off")}
    H=T.meta("_h")

    # ---- byggesten
    def stepper(name,val,mn,mx,step,unit,label,dec=1,disabled=False,field=None):
        d=" disabled" if disabled else ""
        return (f'<div class="stepper"><button type="button" data-step="-1" aria-label="{T("common.decrease",x=label.lower())}"{d}>−</button>'
                f'<span class="value"><input type="number" inputmode="decimal" id="{name}" name="{field or name}" value="{val:.{dec}f}" min="{mn}" max="{mx}" step="{step}"{d}><span class="unit">{unit}</span></span>'
                f'<button type="button" data-step="1" aria-label="{T("common.increase",x=label.lower())}"{d}>+</button></div>')
    def seg(name,opts,sel,label):
        return f'<div class="seg" role="radiogroup" aria-label="{label}">'+"".join(f'<label><input type="radio" name="{name}" value="{v}"{" checked" if v==sel else ""}><span>{t}</span></label>' for v,t in opts)+'</div>'
    def probes(sel,name,include_none=True):
        none = f'<option value=""{"" if sel else " selected"}>{T("common.none")}</option>' if include_none else ""
        opts = "".join(f'<option value="{k}"{" selected" if k==sel else ""}>{T("csys.probe",n=k)}</option>' for k in range(1,9))
        return f'<select class="select" id="{name}" name="{name}">{none}{opts}</select>'
    def file_input(name, accept):
        return (f'<label class="input file w-lg" for="{name}">'
                f'<input class="sr-only" id="{name}" name="{name}" type="file" accept="{accept}">'
                f'<span class="file-pick">{T("common.chooseFile")}</span>'
                f'<span class="file-name" data-empty="{T("common.noFile")}">{T("common.noFile")}</span></label>')
    def metric(label,val,unit,bind="",cls="",attrs=""):
        b=f' data-bind="{bind}"' if bind else ""
        c=f' {cls}' if cls else ""
        u=f' <small>{unit}</small>' if unit else ""
        return f'<div class="metric{c}"{attrs}><dt>{label}</dt><dd{b}>{val}{u}</dd></div>'
    def help_btn(hid, topic):
        return f'<button class="help-btn" type="button" popovertarget="{hid}" style="anchor-name:--a-{hid}" aria-label="{T("help.aria", topic=topic)}">?</button>'
    def help_pop(hid, body_key, more=""):
        link=(f'<a href="https://github.com/Birkemosen/lune/blob/main/{more}" '
              f'target="_blank" rel="noopener noreferrer">{T("help.readMore")}</a>') if more else ""
        return f'<div id="{hid}" popover class="help-pop" style="position-anchor:--a-{hid}"><p>{T(body_key)}</p>{link}</div>'
    def confirm_pop(pid, trigger_key, title_key, note_key, value, confirm_key, attrs="", **kw):
        """Bekræftelses-popover (LDS 5.16) inde i formularen. Trigger slutter med …; submit sender name=action."""
        attr=f" {attrs}" if attrs else ""
        return (
            f'<button class="btn danger" type="button" popovertarget="{pid}"{attr}>{T(trigger_key, **kw)}</button>'
            f'<div id="{pid}" popover class="confirm-pop" role="alertdialog" aria-labelledby="{pid}-t" aria-describedby="{pid}-d">'
            f'<p class="confirm-title" id="{pid}-t">{T(title_key, **kw)}</p>'
            f'<p id="{pid}-d">{T(note_key, **kw)}</p>'
            f'<div class="confirm-actions">'
            f'<button class="btn" type="button" popovertarget="{pid}" popovertargetaction="hide" autofocus>{T("common.cancel")}</button>'
            f'<button class="btn danger-solid" type="submit" name="action" value="{value}" popovertarget="{pid}" popovertargetaction="hide">{T(confirm_key, **kw)}</button>'
            f'</div></div>'
        )

    # ---- grupperede lister, ark og gem-bjælke (DESIGN.md 15.5, 15.9)
    def lab(id_,text): return f'<label for="{id_}">{text}</label>'
    def span(text): return f'<span>{text}</span>'
    def srow(label,control,hint="",cls="",attrs=""):
        h=f"<small>{hint}</small>" if hint else ""
        return f'<div class="setting{(" "+cls) if cls else ""}"{attrs}><div class="setting-label">{label}{h}</div><div class="setting-control">{control}</div></div>'
    def sread(label,bind,val="—",cls=""):
        return srow(span(label),f'<span class="setting-value{(" "+cls) if cls else ""}" data-bind="{bind}">{val}</span>')
    def sstep(id_,label,*a,hint="",**k): return srow(lab(id_,label),stepper(id_,*a,label=label,**k),hint)
    def sswitch(name,t,sub,on):
        return (f'<label class="setting switch"><span class="setting-label"><b>{t}</b>{f"<small>{sub}</small>" if sub else ""}</span>'
                f'<input type="checkbox" role="switch" name="{name}"{" checked" if on else ""}></label>')
    def h4(title,help=""): return f'<h4>{title}{" "+help if help else ""}</h4>'
    def group(title,rows,extra="",pre="",help="",cls=""):
        return f'<section class="setting-group{(" "+cls) if cls else ""}">{h4(title,help)}{pre}<div class="setting-list">{rows}</div>{extra}</section>'
    def ggroup(title,sw,rows,extra="",pre="",help=""):
        return f'<section class="setting-group">{h4(title,help)}{pre}<div class="setting-list gated">{sw}<div class="gated-body">{rows}</div></div>{extra}</section>'
    def subpage(label,value,body,attrs=""):
        return (f'<details class="subpage"{attrs}><summary class="setting"><span class="sub-back">{T("common.back")}</span>'
                f'<span class="setting-label"><span>{label}</span></span><span class="setting-control">{value}</span></summary>'
                f'<div class="subpage-body">{body}</div></details>')
    def savebar(key,label):
        return (f'<footer class="savebar"><span class="save-status" id="ss-{key.replace("/","-")}" aria-live="polite"></span>'
                f'<button type="reset" class="btn">{T("common.undo")}</button><button class="btn primary" type="submit">{label}</button></footer>')
    def sheet(sid,hashv,icon,head,status,overview,history,settings):
        tabs=[("o","overview"),("h","history"),("s","settings")]
        radios="".join(f'<input class="state tab" type="radio" name="tab-{sid}" id="t-{sid}-{k}" value="{v}" data-hash="{T("hash."+v)}" aria-label="{T("tab."+v)}"{" checked" if k=="o" else ""}>' for k,v in tabs)
        labels="".join(f'<label for="t-{sid}-{k}" data-tab="{v}">{T("tab."+v)}</label>' for k,v in tabs)
        return f'''
  <div id="sheet-{sid}" popover class="sheet" role="dialog" aria-labelledby="sheet-{sid}-t" data-hash="{hashv}">
    {radios}
    <header class="sheet-head">
      <span class="chip-icon" aria-hidden="true">{icon}</span>
      <div><h2 id="sheet-{sid}-t">{head}</h2><p>{status}</p></div>
      <button class="sheet-close" type="button" popovertarget="sheet-{sid}" popovertargetaction="hide" aria-label="{T("sheet.close")}">×</button>
      <nav class="tabs" aria-label="{T("sheet.tabs")}">{labels}</nav>
    </header>
    <div class="sheet-body">
      <section class="tab-panel" data-tab="overview">{overview}</section>
      <section class="tab-panel" data-tab="history">{history}</section>
      <section class="tab-panel" data-tab="settings">{settings}</section>
    </div>
  </div>'''
    I_ROOM='<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12h8V4"/></svg>'
    I_MANI='<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/><path d="M8 7v10M16 7v10"/></svg>'

    # ---- strimmel: felterne åbner arkene (DESIGN.md 15.2)
    tiles="".join(f'''
          <button class="tile" type="button" popovertarget="sheet-z{z[0]}" data-state="{z[4]}" data-level="{level(z)}"{f' data-group="{z[7]}"' if z[7] else ''}>
            <span class="lvl" aria-hidden="true">{"<i></i>"*10}</span>
            <span class="tile-pct" data-bind="z{z[0]}.valve">{0 if z[4] in ("fault","off") else z[5]} %</span>
            <span class="tile-id">{tid(z)}</span>
            <span class="tile-name" data-bind="z{z[0]}.name">{z[1]}</span>
            <span class="tile-dev" data-bind="z{z[0]}.dev" hidden></span>
            <span class="tile-val" data-bind="z{z[0]}.temp">{T("tile.fault") if z[4]=="fault" else T.num(z[2])+"°"}</span>
          </button>''' for z in Z)
    strip=f'''<nav class="strip" aria-label="{T("strip.label")}">
          <button class="tile tile-sys" type="button" popovertarget="sheet-manifold" title="{T("scope.manifold")}">
            <span class="tile-id">{T("scope.manifold")}</span>
            <span class="temps">
              <span class="temp flow">
                <span class="temp-lab" title="{T("m.supply")}">{T("m.supplyShort")}</span>
                <span class="tile-val" data-bind="strip.flow">{T.num(34.2)}°</span>
              </span>
              <span class="temp ret">
                <span class="temp-lab" title="{T("m.return")}">{T("m.returnShort")}</span>
                <span class="tile-val" data-bind="strip.return">{T.num(29.8)}°</span>
              </span>
            </span>
          </button>{tiles}
        </nav>'''

    def manifold_metrics():
        return f'''<dl class="metrics">
            {metric(T("m.supply"),T.num(34.2),"°C","manifold.flow")}
            {metric(T("m.return"),T.num(29.8),"°C","manifold.return")}
            {metric(T("m.dt"),T.num(4.4),"K","manifold.dt")}
            {metric(T("m.opening"),"32","%","manifold.opening")}
          </dl>
          <div class="bar" style="--v:0%" role="meter" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="{T("m.openingAria")}" data-bind-bar="manifold.opening"><i></i></div>'''
    def trend_block():
        return f'''<div class="sub trend-wrap">
            <h4>{T("trend.title")} <span class="legend"><i class="lf"></i>{T("m.supply")}<i class="lr"></i>{T("m.return")}</span></h4>
            <p class="empty">{T("trend.empty")}</p>
            <svg class="trend" viewBox="0 0 240 80" preserveAspectRatio="none" role="img" aria-label="{T("trend.aria")}" data-bind-trend="manifold"></svg>
            <div class="axis" aria-hidden="true"><span>−24 {H}</span><span>−12 {H}</span><span>{T("trend.now")}</span></div>
          </div>'''

    # ---- Hjem (DESIGN.md 15.7): statuslinje, fejl, Varme nu, Komfort pr. zone. Ingen gem-knapper.
    comfort="".join(f'''
            <button type="button" popovertarget="sheet-z{z[0]}" data-state="{z[4]}">
              <span class="id">{rid(z)}</span>
              <span class="name" data-bind="z{z[0]}.name">{z[1]}</span>
              <span class="val" data-bind="z{z[0]}.comfort">—</span>
              <svg class="spark" viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true" data-bind-spark="z{z[0]}"></svg>
            </button>''' for z in Z)
    home=f'''
      <section class="view" id="v-home-sys" aria-labelledby="h-home">
        <header class="view-head"><h2 id="h-home">{T("scope.manifold")}</h2><p data-bind="dash.sys.sub">{T("dash.sys.sub",zones=6,calling=0,faults=0)}</p></header>

        <div class="panel alert" data-bind-show="dash.alert" hidden>
          <div class="panel-head"><h3 data-bind="dash.alertTitle">{T("alert.zoneFault",zone="—")}</h3></div>
          <p class="note">{T("alert.zoneFaultBody")}</p>
          <div class="panel-foot" style="justify-content:flex-start"><button class="btn" type="button" data-bind-for="dash.alertZone" popovertarget="sheet-z1">{T("common.open",x="—")}</button></div>
        </div>

        <section class="panel c5">
          <header class="panel-head"><h3>{T("heat.title")}</h3><span class="badge" data-bind="heat.badge">{T("state.idle")}</span></header>
          {manifold_metrics()}
          {trend_block()}
          <footer class="panel-foot"><button class="btn" type="button" popovertarget="sheet-manifold">{T("home.openManifold")}</button></footer>
        </section>

        <section class="panel c7">
          <header class="panel-head"><h3>{T("comfort.title")}</h3><p>{T("trend.title")}</p><span class="legend" aria-hidden="true"><i class="lt"></i>{T("legend.temp")}<i class="lg"></i>{T("legend.target")}</span></header>
          <div class="comfort">{comfort}
          </div>
        </section>
      </section>'''

    # ---- zone-ark (DESIGN.md 15.3)
    WL=T.meta("_walls"); WF=T.meta("_walls_full")
    def compass(i,walls):
        return f'<div class="compass inline" role="group" aria-label="{T("cz.walls")}"><i class="c"></i>'+"".join(f'<label data-wall="{k}"><input type="checkbox" name="z{i}_wall" value="{k}"{" checked" if k in walls else ""} aria-label="{WF[k]}"><span>{WL[k]}</span></label>' for k in "nesw")+'</div>'
    # Zonegrafen: 48 halvtimer bagud + 12 frem; "nu" er punkt 47 af 60 (binderen tegner .zc-plot).
    xpos=[0, round(23/59*100,2), round(47/59*100,2), 100]
    def zone_chart(i):
        xl=[f"−24 {H}",f"−12 {H}",T("zchart.now"),f"+6 {H}"]
        xlab="".join(f'<span style="left:{p}%"{" class=n" if j==2 else ""}>{l}</span>' for j,(l,p) in enumerate(zip(xl,xpos)))
        return f'''
        <section class="sub" aria-labelledby="zc-h-{i}">
          <h4 id="zc-h-{i}">{T("zchart.sub")}</h4>
          <dl class="metrics">
            <div class="metric" data-bind-show="z{i}.expected" hidden>
              <dt data-bind="z{i}.expectedLabel">{T("zchart.expected",time="—")}</dt>
              <dd><span data-bind="z{i}.expected">—</span> <small>°C</small></dd>
            </div>
          </dl>
          <div class="zc">
            <div class="zc-y" aria-hidden="true" data-bind="z{i}.zchartY"><span>—</span><span>—</span><span>—</span></div>
            <div class="zc-plot" role="img" aria-label="{T("zchart.aria")}">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none" data-bind-zchart="z{i}"></svg>
              <span class="zc-scrub" hidden aria-hidden="true"></span>
            </div>
            <div class="zc-x" aria-hidden="true">{xlab}</div>
          </div>
          <div class="fc-legend" aria-hidden="true">
            <span><i class="lt"></i>{T("zchart.lTemp")}</span>
            <span><i class="lsp"></i>{T("zchart.lTarget")}</span>
            <span><i class="lfc"></i>{T("zchart.lForecast")}</span>
          </div>
          <p class="note" data-bind="z{i}.zchartNote">{T("zchart.noForecast")}</p>
          <p class="hint">{T("zchart.projHint")}</p>
        </section>'''
    def zone_sheet(z):
        i,n,t,tg,st,fl,ret,grp,walls,src,area,sp,pipe=z
        zid=f"Z{i}"
        ta=T("zdash.targetAria")
        member=grp=="member"
        dis=' disabled' if member else ''
        status=f'{tid(z)} · <span data-bind="z{i}.sub">{ST[st]}</span>'
        # Overblik: fejl, gruppe, mål (autogem), åbning og retur, detaljer
        overview=f'''
        <form class="panel alert" data-save="zone/{i}/recovery" data-bind-show="z{i}.fault" hidden>
          <div class="panel-head"><h3>{T("zdash.faultTitle")}</h3></div>
          <p class="note">{T("zdash.faultBody")}</p>
          <div class="panel-foot" style="justify-content:flex-start"><button class="btn primary" type="submit" name="action" value="reset_fault">{T("common.resetFault")}</button></div>
        </form>
        <p class="msg violet" data-bind-show="z{i}.member" hidden><span data-bind="z{i}.memberNote"></span></p>
        <div class="actions" data-bind-show="z{i}.member" hidden><button class="btn" type="button" popovertarget="sheet-z{i}" data-bind="z{i}.openPrimary"></button></div>
        <form data-save="zone/{i}/target">
          <div class="climate">
            <div class="now">{T.num(t)}<small>°C</small></div>
            <div class="target">
              <button type="button" data-step="-1" aria-label="{T("common.decrease",x=ta)}"{dis}>−</button>
              <label class="value"><small>{T("zdash.target")}</small><input type="number" inputmode="decimal" name="z{i}_target" value="{tg:.1f}" min="16" max="28" step="0.5"{dis}></label>
              <button type="button" data-step="1" aria-label="{T("common.increase",x=ta)}"{dis}>+</button>
            </div>
          </div>
          <p class="autosave" aria-live="polite"></p>
        </form>
        <p class="msg info" data-bind-show="z{i}.preload" hidden><span><b>{T("zdash.preloadStrong")}</b> <span data-bind="z{i}.preload">{T("zdash.preload",offset="+0,0")}</span></span></p>
        <dl class="metrics">
          {metric(T("zdash.opening"),"—","",f"z{i}.flow")}
          {metric(T("m.return"),"—","",f"z{i}.return",cls="zone-ret")}
        </dl>
        <div class="bar" style="--v:0%" aria-hidden="true" data-bind-bar="z{i}.opening"><i></i></div>
        <dl class="kv">
          <div><dt>{T("zdash.motor")}</dt><dd data-bind="z{i}.motor">—</dd></div>
          <div><dt>{T("zdash.preheatAdv")}</dt><dd data-bind="z{i}.preheat">—</dd></div>
          <div><dt>{T("zdash.offsetNow")}</dt><dd data-bind="z{i}.offset">—</dd></div>
          <div><dt>{T("zdash.tempFrom")}</dt><dd data-bind="z{i}.tempFrom">—</dd></div>
        </dl>'''
        # Indstillinger: én formular, én gem-bjælke. data-patch: binderen skriver kun de ændrede dele.
        merge=f'<option value="">{T("common.none")}</option>'+"".join(f'<option value="{y[0]}" data-zone-opt="{y[0]}">Z{y[0]}</option>' for y in Z if y[0]!=i)
        pipes="".join(f'<option{" selected" if p==pipe else ""}>{p}</option>' for p in PIPES)
        slab=f'<select class="select" id="z{i}_slab" name="z{i}_slab"><option value="unset">{T("cz.slabUnset")}</option><option value="cast_concrete">{T("cz.slabConcrete")}</option><option value="screed">{T("cz.slabScreed")}</option><option value="dry_plates">{T("cz.slabDry")}</option><option value="timber_joists">{T("cz.slabTimber")}</option></select>'
        cover=f'<select class="select" id="z{i}_covering" name="z{i}_covering"><option value="unset">{T("cz.coverUnset")}</option><option value="tile_stone">{T("cz.coverTile")}</option><option value="vinyl_linoleum">{T("cz.coverVinyl")}</option><option value="parquet_laminate">{T("cz.coverParquet")}</option><option value="carpet">{T("cz.coverCarpet")}</option></select>'
        ble_seen=f'''<div hidden data-ble-seen-row="{i}">
                <p class="note" data-ble-seen-status="{i}" aria-live="polite"></p>
                <div class="table-wrap"><table class="table" aria-label="{T("cz.bleSeen")}">
                  <thead><tr><th>{T("cz.bleSeenSensor")}</th><th class="num">{T("cz.bleSeenTemp")}</th><th class="num">{T("cz.bleSeenRssi")}</th><th></th></tr></thead>
                  <tbody data-ble-seen="{i}"></tbody>
                </table></div>
              </div>'''
        motor_body=group(T("cz.motor"),
            sread(T("cz.ripples"),f"z{i}.ripples")+sread(T("cz.factors"),f"z{i}.factors")+
            sread(T("zdash.preheatAdv"),f"z{i}.preheat")+sread(T("cz.lastFault"),f"z{i}.lastFault"),
            f'''<div data-bind-show="z{i}.learnBar" hidden>
              <p class="hint" data-bind="z{i}.learnPhase"></p>
              <div class="bar violet" style="--v:0%" data-bind-bar="z{i}.learn" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="{T("cz.learnProgress")}"><i></i></div>
            </div>
            <div class="actions" data-bind-show="z{i}.fault" hidden><button class="btn primary" type="submit" name="action" value="reset_fault">{T("common.resetFault")}</button></div>''',
            help=help_btn("help-zone-motor",T("cz.motor")))
        group_body=group(T("zs.grouping"),srow(lab(f"z{i}_merge",T("cz.group")),f'<select class="select" id="z{i}_merge" name="z{i}_merge">{merge}</select>',T("cz.groupHint")))
        settings=f'''
        <form data-save="zone/{i}" data-patch>
          <p class="msg violet" data-bind-show="z{i}.member" hidden><span><b data-bind="z{i}.memberStrong"></b> <span data-bind="z{i}.memberBody"></span></span></p>
          {group(T("zs.comfort"),
                 sswitch(f"z{i}_enabled",T("cz.enabled"),"",st!="off")+
                 srow(lab(f"z{i}_target_s",T("legend.target")),stepper(f"z{i}_target_s",tg,16,28,0.5,"°C",ta,disabled=member,field=f"z{i}_target"),T("zs.targetHint")))}
          {group(T("cz.room"),
                 srow(lab(f"z{i}_name",T("cz.name")),f'<input class="input w-sm" id="z{i}_name" name="z{i}_name" value="{n}" maxlength="24">')+
                 sstep(f"z{i}_area",T("cz.area"),area,0,200,0.5,"m²")+
                 srow(span(T("cz.tempFrom")),seg(f"z{i}_src",[("probe",T("cz.probe")),("ble",T("cz.ble"))],src,T("cz.tempFrom")))+
                 srow(lab(f"z{i}_ble",T("cz.bleMac")),f'<input class="input w-md" id="z{i}_ble" name="z{i}_ble" placeholder="AA:BB:CC:DD:EE:FF" pattern="^([0-9A-Fa-f]{{2}}:){{5}}[0-9A-Fa-f]{{2}}$" autocomplete="off" spellcheck="false"><button type="button" class="btn" data-action="ble-scan" data-zone="{i}">{T("cz.scan")}</button>',T("cz.bleHint").replace("&","&amp;"))+
                 srow(lab(f"z{i}_ret",T("cz.returnSensor")),probes(None,f"z{i}_ret"),cls="zone-ret"),
                 ble_seen, help=help_btn("help-zone-room",T("cz.roomSensors")))}
          {group(T("zs.floor"),
                 sstep(f"z{i}_spacing",T("cz.spacing"),sp,50,300,25,"mm",dec=0)+
                 srow(lab(f"z{i}_pipe",T("cz.pipeType")),f'<select class="select" id="z{i}_pipe" name="z{i}_pipe">{pipes}</select>')+
                 srow(lab(f"z{i}_slab",T("cz.slab")),slab)+
                 srow(lab(f"z{i}_covering",T("cz.covering")),cover)+
                 sstep(f"z{i}_thick",T("cz.thickness"),0,0,15,0.5,"cm"),
                 help=help_btn("help-zone-floor",T("cz.floorWeather")))}
          {group(T("zs.weather"),
                 srow(span(T("cz.walls")),compass(i,walls),T("zs.wallsHint"))+
                 sstep(f"z{i}_wind",T("cz.wind"),1.0 if walls else 0.0,0,2,0.1,"×")+
                 sstep(f"z{i}_solar",T("cz.solar"),0.6 if "s" in walls else 0.2,0,2,0.1,"×"))}
          {group(T("zs.advanced"),
                 subpage(T("zs.motorCal"),f'<span class="badge" data-bind="z{i}.motorBadge">—</span>',motor_body)+
                 subpage(T("zs.grouping"),f'<span class="muted" data-bind="z{i}.mergeVal">{T("common.none")}</span>',group_body))}
          <div class="actions">{confirm_pop(f"confirm-relearn-z{i}","cz.relearn","cz.relearnTitle","cz.relearnNote","reset_relearn","cz.relearnConfirm",z=zid)}</div>
          {savebar(f"zone/{i}",T("cz.saveZone"))}
        </form>'''
        return sheet(f"z{i}",f"z{i}",I_ROOM,f'<span data-bind="z{i}.name">{n}</span>',status,overview,zone_chart(i),settings)

    # ---- manifold-ark: målinger, balancering og reguleringen (alt der hører til manifolden)
    def manifold_sheet():
        bal="".join(f'<tr data-bind-row="bal.z{z[0]}"><td data-bind="bal.z{z[0]}.id">{rid(z)}</td><td class="num" data-bind="bal.z{z[0]}.prior">—</td><td class="num c-violet" data-bind="bal.z{z[0]}.learned">—</td><td class="num" data-bind="bal.z{z[0]}.effective">—</td></tr>' for z in Z)
        overview=f'''
          {manifold_metrics()}
          <div class="sub"><h4>{T("bal.title")} <span class="badge violet" data-bind="bal.mode">{T("bal.adaptive")}</span></h4>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>{T("bal.zone")}</th><th class="num">{T("bal.prior")}</th><th class="num">{T("bal.learned")}</th><th class="num">{T("bal.effective")}</th></tr></thead>
              <tbody>{bal}</tbody>
            </table></div></div>
          <div class="sub"><h4>{T("csys.probeLive")}</h4>
            <dl class="metrics">
              {"".join(metric(T("csys.probe",n=k),"—","°C",f"probe.{k}",attrs=f' data-probe="{k}"') for k in range(1,9))}
            </dl></div>'''
        settings=f'''
        <form data-save="regulation">
          {group(T("csys.heating"),
                 srow(span(T("csys.heatMode")),seg("heat_mode",[("normal",T("csys.heatNormal")),("heat_pump",T("csys.heatPump"))],"heat_pump",T("csys.heatMode")))+
                 sstep("heat_min_open",T("csys.minOpening"),0,0,100,1,"%",dec=0),
                 help=help_btn("help-heating",T("csys.heating")))}
          {group(T("csys.heatPumpLimits"),
                 sstep("hp_demand",T("csys.hpDemand"),80,30,100,1,"%",dec=0)+
                 sstep("hp_base",T("csys.hpBase"),60,30,100,1,"%",dec=0)+
                 sstep("hp_overheat",T("csys.hpOverheat"),1.0,0.3,3.0,0.1,"°C")+
                 sstep("hp_trim",T("csys.hpTrim"),35,0,100,1,"%",dec=0),cls="hp-limits")}
          {ggroup(T("csys.preheat"),sswitch("preheat_enabled",T("csys.absorb"),T("csys.absorbSub"),False),
                  sstep("ph_band",T("csys.band"),0.5,0.1,5,0.1,"°C")+sstep("ph_delta",T("csys.delta"),0.3,0.1,10,0.1,"°C"),
                  extra=f'<p class="note" data-bind-show="absorb.touchNote" hidden>{T("csys.absorbTouch")}</p>',
                  help=help_btn("help-regulation",T("csys.regulation")))}
          <div class="actions">{confirm_pop("confirm-reset-bal","csys.resetBal","csys.resetBalTitle","csys.resetBalNote","reset_balancing","csys.resetBalConfirm")}</div>
          {savebar("regulation",T("csys.saveReg"))}
        </form>'''
        status=f'<span data-bind="manifold.status">—</span>'
        return sheet("manifold",T("hash.manifold"),I_MANI,T("sheet.manifold"),status,overview,trend_block(),settings)

    # ---- System (DESIGN.md 15.4): én kategori ad gangen, én gem-bjælke pr. kategori
    zone_opts="".join(f'<option value="{z[0]}" data-zone-opt="{z[0]}">Z{z[0]}</option>' for z in Z)
    def syscat(cat,title,body,attrs=""):
        return (f'<section class="sys-cat" data-cat="{cat}" aria-labelledby="h-c-{cat}"{attrs}><label class="sys-back" for="c-none">{T("sys.title")}</label>'
                f'<header><div><small>{T("sys.title")}</small><h2 id="h-c-{cat}">{title}</h2></div></header>{body}</section>')
    CATS=[("device",T("cat.device"),'<path d="M4 11l8-7 8 7v9H4z"/>'),
          ("manifold",T("csys.mm"),'<path d="M4 7h16M4 12h16M4 17h16"/>'),
          ("connections",T("cat.connections"),'<path d="M9 15l6-6M7 13l-2 2a3 3 0 0 0 4 4l2-2M17 11l2-2a3 3 0 0 0-4-4l-2 2"/>'),
          ("firmware",T("cat.firmware"),'<path d="M12 4v10M8 10l4 4 4-4M5 19h14"/>'),
          ("service",T("csys.service"),'<path d="M14 6a4 4 0 0 0-5 5l-5 5 3 3 5-5a4 4 0 0 0 5-5l-2 2-3-3z"/>'),
          ("motorlab",T("cat.motorlab"),'<circle cx="12" cy="12" r="7"/><path d="M12 8v4l3 2"/>')]
    DEV_ONLY={"motorlab"}   # vises af binderen, når firmwaren er et dev-build
    cats=[]
    cats.append(syscat("device",T("cat.device"),f'''
      <form data-save="device">
        {group(T("device.identity"),
               srow(lab("device_display_name",T("device.name")),'<input class="input w-md" id="device_display_name" name="device_display_name" value="Lune V6" maxlength="32" autocomplete="off">')+
               srow(lab("device_location",T("device.place")),f'<input class="input w-md" id="device_location" name="device_location" value="{T("device.sample")}" maxlength="64" autocomplete="off">'),
               help=help_btn("help-device-identity",T("device.identity")))}
        {savebar("device",T("device.saveIdentity"))}
      </form>
      <form data-save="ble_clock">
        {group(T("csys.bleClock"),
               sswitch("ble_clock_enabled",T("csys.bleClockEnable"),T("csys.bleClockSub"),False)+
               sread(T("csys.bleClockLastSync"),"ble.lastSync")+
               srow(span(T("csys.bleClockSync")),f'<button class="btn" type="submit" name="action" value="sync">{T("csys.bleClockSync")}</button>'),
               help=help_btn("help-ble-clock",T("csys.bleClock")))}
      </form>'''))
    cats.append(syscat("manifold",T("csys.mm"),f'''
      <form data-save="manifold" data-patch>
        {group(T("csys.manifold"),
               srow(span(T("csys.valveType")),seg("manifold_type",[("no",T("csys.no")),("nc",T("csys.nc"))],"nc",T("csys.valveType")))+
               srow(lab("probe_flow",T("csys.supplyProbe")),probes(1,"probe_flow",include_none=False))+
               srow(lab("probe_return",T("csys.returnProbe")),probes(2,"probe_return",include_none=False))+
               srow(span(T("csys.probeMode")),seg("return_probe_mode",[("2",T("csys.probeMode2")),("8",T("csys.probeMode8"))],"2",T("csys.probeMode"))),
               f'<p class="note">{T("csys.returnProbesNote")}</p>',
               help=help_btn("help-manifold",T("csys.mm")))}
        {ggroup(T("csys.motors"),sswitch("motor_drivers",T("csys.drivers"),T("csys.driversSub"),True),
                srow(lab("motor_type",T("csys.motorType")),'<select class="select" id="motor_type" name="motor_type"><option>Generic</option><option selected>HmIP VdMot</option></select>')+
                sstep("m_runtime",T("csys.maxRun"),38,5,40,1,"s",dec=0))}
        {group(T("zs.advanced"),
               subpage(T("csys.closeStop"),"",group(T("csys.closeStop"),
                   sstep("m_cthr",T("csys.threshold"),1.45,1.05,2.5,0.05,"×",dec=2)+sstep("m_cslope",T("csys.slope"),0.6,0,50,0.05,"mA/s",dec=2)+sstep("m_cfloor",T("csys.slopeFloor"),1.3,1,5,0.05,"×",dec=2)))+
               subpage(T("csys.openStop"),"",group(T("csys.openStop"),
                   sstep("m_othr",T("csys.threshold"),1.7,1.05,2.5,0.05,"×",dec=2)+sstep("m_oslope",T("csys.slope"),0.15,0,50,0.05,"mA/s",dec=2)+sstep("m_ofloor",T("csys.slopeFloor"),1.3,1,5,0.05,"×",dec=2)+sstep("m_ripple",T("csys.ripple"),1.1,0,5,0.05,"×",dec=2,hint=T("csys.rippleHint"))))+
               subpage(T("csys.relearn"),"",group(T("csys.relearn"),
                   sstep("m_relmov",T("csys.afterMoves"),200,10,2000,10,"",dec=0)+sstep("m_relh",T("csys.afterHours"),168,1,720,1,H,dec=0)+sstep("m_minsamp",T("csys.minSamples"),3,1,20,1,"",dec=0)+sstep("m_maxdev",T("csys.maxDev"),0.15,0.01,1,0.01,"",dec=2))),
               f'<p class="note">{T("csys.limitsMsg")}</p>')}
        <div class="actions">{confirm_pop("confirm-relearn-all","csys.relearnAll","csys.relearnAllTitle","csys.relearnAllNote","relearn_all","csys.relearnAllConfirm")}</div>
        {savebar("manifold",T("csys.saveManifold"))}
      </form>'''))
    copy_row=lambda key,bid,bind: srow(span(T(key)),f'<code class="mono" id="{bid}" data-bind="{bind}">—</code><button type="button" class="btn copy" data-copy="#{bid}">{T("common.copy")}</button>')
    cats.append(syscat("connections",T("cat.connections"),f'''
      <form data-save="connections" data-state="unpaired">
        {group(T("csys.touch"),
               srow(span(T("conn.state")),f'<span class="badge" data-bind="touch.badge">{T("csys.touchWaiting")}</span>')+
               srow(span(T("csys.touchName")),'<span data-bind="touch.name">—</span>',attrs=' data-show-when="approved pending error"')+
               srow(span(T("csys.touchDelivers")),f'<span>{T("csys.touchDeliversValue")}</span>',T("csys.touchDeliversHint"))+
               subpage(T("csys.touchIds"),"",group(T("csys.touchIds"),copy_row("csys.touchInstall","touch-install","touch.install")+copy_row("csys.touchCoord","touch-coord","touch.coord")),
                       attrs=' data-show-when="approved pending error" data-bind-show="touch.identity"'),
               pre=f'<p class="msg bad" data-show-when="error"><span>{T("csys.touchErrorBody")}</span></p><p class="note" data-show-when="unpaired pending approved" data-bind="touch.status">{T("csys.touchWaitingBody")}</p>',
               help=help_btn("help-connections",T("csys.touch")))}
        <div class="actions">
          <button class="btn primary" type="submit" name="action" value="approve" data-show-when="unpaired">{T("csys.touchApprove")}</button>
          <button class="btn" type="submit" name="action" value="cancel" data-show-when="pending">{T("csys.touchCancel")}</button>
          <button class="btn" type="submit" name="action" value="retry" data-show-when="error">{T("csys.touchRetry")}</button>
          {confirm_pop("confirm-touch","csys.touchRevoke","csys.touchRevokeTitle","csys.touchRevokeNote","revoke","csys.touchRevokeConfirm",attrs='data-show-when="approved error"')}
        </div>
      </form>
      <form data-save="wifi">
        {group(T("wifi.title"),
               sread(T("wifi.current"),"wifi.current")+sread(T("wifi.status"),"wifi.status")+
               srow(lab("wifi_ssid",T("wifi.ssid")),'<input class="input w-md" id="wifi_ssid" name="ssid" maxlength="32" autocomplete="off" spellcheck="false">')+
               srow(lab("wifi_password",T("wifi.password")),'<input class="input w-md" type="password" id="wifi_password" name="password" maxlength="64" autocomplete="new-password">'),
               f'<p class="note">{T("wifi.hint")}</p>',
               help=help_btn("help-wifi",T("wifi.title")))}
        {savebar("wifi",T("wifi.save"))}
      </form>
      <section class="setting-group">{h4(T("csys.helpIngest"))}<p class="note">{T("csys.helpIngestBody")}</p></section>'''))
    cats.append(syscat("firmware",T("cat.firmware"),f'''
      <form data-save="firmware">
        {group(T("csys.firmware"),
               sread(T("csys.fwInstalled"),"fw.installed")+sread(T("csys.fwLatest"),"fw.latest")+
               srow(span(T("csys.fwUpdate")),f'<button class="btn" type="submit" name="action" value="check">{T("csys.fwCheck")}</button><button class="btn" type="submit" name="action" value="install">{T("csys.fwInstall")}</button>')+
               srow(lab("ota_file",T("csys.fwUpload")),file_input("ota_file",".bin,.ota.bin"),cls="stack"),
               help=help_btn("help-firmware",T("csys.firmware")))}
        <div class="actions"><button class="btn" type="submit" name="action" value="upload">{T("csys.fwUploadBtn")}</button></div>
      </form>
      <form data-save="backup">
        {group(T("csys.backup"),
               sswitch("include_learned",T("csys.backupLearned"),T("csys.backupLearnedSub"),False)+
               srow(span(T("csys.backupExport")),f'<button class="btn" type="submit" name="action" value="export">{T("csys.backupExport")}</button>')+
               srow(lab("backup_file",T("csys.backupImport")),file_input("backup_file","application/json,.json"),cls="stack"),
               f'<p class="note">{T("csys.backupNote")}</p>',
               help=help_btn("help-backup",T("csys.backup")))}
        <div class="actions">{confirm_pop("confirm-import","csys.backupImportAsk","csys.backupImportTitle","csys.backupImportNote","import","csys.backupImportConfirm")}</div>
      </form>'''))
    cats.append(syscat("service",T("csys.service"),f'''
      <form data-save="service">
        {group(T("svc.diag"),
               sread("Wi-Fi","wifi.rssi","— <small>dBm</small>")+sread(T("dev.uptime"),"sys.uptime")+
               srow(span(T("conn.state")),f'<span class="badge" data-bind="dev.badge">{T("dev.online")}</span>')+
               srow(span(T("csys.health")),f'<button class="btn" type="submit" name="action" value="dump_tasks">{T("csys.tasks")}</button><button class="btn" type="submit" name="action" value="i2c_scan">{T("csys.i2cScan")}</button><button class="btn" type="submit" name="action" value="dump_ow">{T("csys.dumpOw")}</button>'),
               f'''<dl class="metrics">
                 {metric("CPU0","—","%","diag.cpu0")}{metric("CPU1","—","%","diag.cpu1")}{metric(T("csys.heap"),"—","kB","diag.heap")}{metric("PSRAM","—","kB","diag.psram")}
               </dl>
               <pre class="log" data-bind="diag.i2c" aria-live="polite" lang="en"></pre>''',
               help=help_btn("help-health",T("csys.health")))}
        {group(T("csys.logs"),
               srow(span(T("csys.logs")),f'<button class="btn" type="submit" name="action" value="logs_pause">{T("csys.logsPause")}</button><button class="btn" type="submit" name="action" value="logs_clear">{T("csys.logsClear")}</button><button class="btn" type="submit" name="action" value="logs_download">{T("csys.logsDownload")}</button>'),
               '<pre class="log" data-bind="log" aria-live="polite" lang="en"></pre>',
               help=help_btn("help-logs",T("csys.logs")))}
        {ggroup(T("csys.manual"),sswitch("manual_mode",T("csys.manualMode"),T("csys.manualSub"),False),
                srow(lab("man_zone",T("csys.motor")),f'<select class="select" id="man_zone" name="man_zone">{zone_opts}</select>')+
                sstep("man_target",T("csys.motorTarget"),50,0,100,5,"%",dec=0)+
                srow(span(T("csys.manualTargetHead")),f'<button class="btn" type="submit" name="action" value="stop">{T("csys.stop")}</button><button class="btn" type="submit" name="action" value="move">{T("csys.move")}</button>')+
                subpage(T("csys.manualTimedHead"),"",group(T("csys.manualTimedHead"),
                    srow(span(T("csys.manualDir")),seg("man_dir",[("open",T("csys.manualOpen")),("close",T("csys.manualClose"))],"open",T("csys.manualDir")))+
                    sstep("man_seconds",T("csys.manualSeconds"),10,1,45,1,"s",dec=0)+
                    srow(span(T("csys.manualRun")),f'<button class="btn" type="submit" name="action" value="stop">{T("csys.stop")}</button><button class="btn" type="submit" name="action" value="timed">{T("csys.manualRun")}</button>'))),
                pre=f'<p class="msg warn"><span>{T("csys.manualMsg")}</span></p>',
                help=help_btn("help-manual",T("csys.manual")))}
        <div class="actions">
          {confirm_pop("confirm-probes","csys.resetProbes","csys.resetProbesTitle","csys.resetProbesNote","reset_probe_map","csys.resetProbesConfirm")}
          {confirm_pop("confirm-restart","csys.restart","csys.restartTitle","csys.restartNote","restart","csys.restartConfirm")}
        </div>
      </form>'''))
    cats.append(syscat("motorlab",T("cat.motorlab"),f'''
      <p class="msg warn"><span>{T("csys.motorLabMsg")}</span></p>
      <div class="actions"><button class="btn" type="button" data-action="motorlab-estop">{T("csys.motorLabEstop")}</button></div>''',attrs=" data-dev-only hidden"))
    dev_attr=lambda c: " data-dev-only hidden" if c in DEV_ONLY else ""
    sys_radios=f'<input class="state" type="radio" name="syscat" id="c-none" checked aria-label="{T("sys.cats")}">'+"".join(
        f'<input class="state" type="radio" name="syscat" id="c-{c}" data-hash="{T("hash."+c)}" aria-label="{t}">' for c,t,_ in CATS)
    sys_nav="".join(f'<label for="c-{c}"{dev_attr(c)}><svg viewBox="0 0 24 24" aria-hidden="true">{ic}</svg>{t}</label>' for c,t,ic in CATS)
    sys_view=f'''
      <section class="view" id="v-sys" aria-labelledby="h-sys">
        <h2 class="sr-only" id="h-sys">{T("sys.title")}</h2>
        {sys_radios}
        <div class="sys">
          <nav class="sys-nav" aria-label="{T("sys.cats")}">{sys_nav}</nav>
          <div class="sys-main">{"".join(cats)}</div>
        </div>
      </section>'''

    views=home+sys_view
    sheets=manifold_sheet()+"".join(zone_sheet(z) for z in Z)
    helps="".join(help_pop(h,k,f"lune-v6/docs/Manual.md#{a}") for h,k,a in (
        ("help-zone-room","help.zoneRoom","zone-room"),("help-zone-floor","help.zoneFloor","zone-floor"),
        ("help-zone-motor","help.zoneMotor","zone-motor"),("help-heating","help.heating","heating"),
        ("help-regulation","help.regulation","regulation"),("help-device-identity","help.deviceIdentity","device-identity"),
        ("help-ble-clock","help.bleClock","ble-clock"),("help-manifold","help.manifold","manifold"),
        ("help-connections","help.connections","touch"),("help-wifi","help.wifi","wifi"),
        ("help-firmware","help.firmware","firmware"),("help-backup","help.backup","backup"),
        ("help-health","help.health","health"),("help-logs","help.logs","logs"),("help-manual","help.manual","manual")))

    # ---- sprogvælger (kun hvis >1 sprog)
    cur=T.meta("_lang")
    if len(langs)>1:
        links="".join(f'<a href="{lang_urls[c.meta("_lang")]}" hreflang="{c.meta("_lang")}" lang="{c.meta("_lang")}" title="{c.meta("_name")}"{" aria-current=\"true\"" if c.meta("_lang")==cur else ""}>{c.meta("_short")}</a>' for c in langs)
        langnav=f'<nav class="lang" aria-label="{T("lang.label")}">{links}</nav>'
    else:
        langnav=""

    # Dynamiske strenge til binderen (statusser, relative tider, gem-beskeder)
    # Kun nøgler, som binderen (main.js) og lune-forms.js faktisk slår op.
    rt_keys=("zdash.follows","zdash.primary","zdash.memberNote","common.open","cz.memberStrong","cz.member",
             "state.calling","state.idle","state.fault","state.off","state.learning","state.blocked",
             "tile.fault","tile.learningPct","tile.blocked","tile.charging","badge.calling","dash.sys.sub","sheet.manifoldStatus",
             "cz.learnPhase.home","cz.learnPhase.open","cz.learnPhase.close","cz.learnPhase.pass",
             "cz.bleAssign","cz.bleAssigned","cz.bleSeen","cz.bleSeenEmpty","cz.bleScanning","cz.scan",
             "common.days","common.hours","common.minutes","common.none","common.learned","common.notLearned",
             "rt.savedOk","rt.saveFailed","rt.saving","rt.unsaved.one","rt.unsaved.other","rt.nothingToSave","rt.leaveUnsaved",
             "rt.autoSaving","rt.autoSaved","rt.autoFailed","rt.retry","rt.secondsAgo","rt.minutesAgo",
             "device.copied","device.this","alert.zoneFault","bal.adaptive","bal.static","dev.online","dev.offline",
             "zdash.preload","zdash.preloadUntil","src.ble","src.probe",
             "csys.touchWaiting","csys.touchWaitingBody","csys.touchApproved","csys.touchPending","csys.touchControls","csys.touchReady","csys.touchLeaseLost",
             "zchart.expected","zchart.at","zchart.noForecast","zchart.faultStrong",
             "wifi.connectedTo","wifi.notConnected","wifi.apActive","wifi.sent","wifi.needSsid","wifi.busy",
             "wifi.switch.pending","wifi.switch.connected","wifi.switch.reverted","wifi.switch.failed")
    rt={k:T(k) for k in rt_keys}
    rt["_dec"]=T.meta("_dec"); rt["_lang"]=cur
    rt_json=json.dumps(rt,ensure_ascii=False,separators=(",",":"))

    LOGO='<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="var(--fg)"/><path d="M10 22V12M14 22V10M18 22V13M22 22V11" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"/></svg>'
    I_HOME='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>'
    I_SYS='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>'
    css_tag=f"<style>\n{inline_css}\n</style>" if inline_css else f'<link rel="stylesheet" href="{css_href}">'
    others="".join(f'<link rel="alternate" hreflang="{c.meta("_lang")}" href="{lang_urls[c.meta("_lang")]}">' for c in langs if c.meta("_lang")!=cur) if len(langs)>1 else ""

    page = f'''<!doctype html>
<html lang="{cur}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfaf8">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121210">
<title>{T("doc.title")}</title>
{others}
{css_tag}
</head>
<body>

<!-- TILSTAND — før .app. Rækkefølge: tilstand → omfang → tema (DESIGN.md 15.9) -->
<input class="state" type="radio" name="mode" id="m-home" checked aria-label="{T("nav.home")}">
<input class="state" type="radio" name="mode" id="m-sys" data-hash="{T("hash.system")}" aria-label="{T("nav.system")}">
<input class="state" type="radio" name="scope" id="s-sys" checked aria-label="{T("scope.manifold")}">
<input class="state" type="checkbox" id="theme" aria-label="{T("theme.toggle")}">

<div class="app" data-probe-layout="2">
  <div class="navbar-wrap wrap">
      <header class="header">
        <details class="device">
          <summary>{LOGO}<span class="name"><b data-bind="device.header.name">Lune V6</b><small data-bind="device.about.place">{T("device.sample")}</small></span><span class="caret" aria-hidden="true"></span></summary>
          <div class="device-menu">
            <section class="device-about" aria-labelledby="device-about-h">
              <h3 id="device-about-h">{T("device.about")}</h3>
              <dl class="kv">
                <div><dt>{T("device.name")}</dt><dd data-bind="device.about.name">Lune V6</dd></div>
                <div><dt>{T("device.place")}</dt><dd data-bind="device.about.place">{T("device.sample")}</dd></div>
                <div><dt>{T("device.ip")}</dt><dd data-bind="device.about.ip">—</dd></div>
                <div><dt>{T("device.mac")}</dt><dd data-bind="device.about.mac">—</dd></div>
                <div><dt>{T("device.firmware")}</dt><dd data-bind="device.about.firmware">—</dd></div>
                <div><dt>{T("device.esphome")}</dt><dd data-bind="device.about.esphome">—</dd></div>
                <div><dt>{T("device.uptime")}</dt><dd data-bind="device.about.uptime">—</dd></div>
              </dl>
              <button type="button" class="btn" data-action="copy-diag">{T("device.copyDiag")}</button>
            </section>
            <nav aria-label="{T("nav.devices")}" data-bind-devices>
              <a href="/" aria-current="page"><i></i>Lune V6<small>{T("device.this")}</small></a>
            </nav>
          </div>
        </details>

        <nav class="mode" aria-label="{T("nav.label")}">
          <label for="m-home">{I_HOME}{T("nav.home")}</label>
          <label for="m-sys">{I_SYS}{T("nav.system")}</label>
        </nav>

        <div class="tools">
          {langnav}
          <label class="icon-btn theme-btn" for="theme" title="{T("theme.toggle")}">
            <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>
            <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>
            <span class="sr-only">{T("theme.toggle")}</span>
          </label>
        </div>
      </header>
  </div>
  <div class="top">
    <div class="wrap">
      {strip}
    </div>
  </div>

  <main class="content wrap">{views}
  </main>
{sheets}
{helps}
</div>

<!-- Strenge til binderen: statusser og beskeder der skrives ved runtime -->
<script type="application/json" id="i18n">{rt_json}</script>

<!-- JavaScript: /binder.js (live data, gem, lune-forms.js fra LDS og +/−, hjælp, filnavn) -->
'''
    if include_binder:
        mock_boot = '<script>window.LV6_DASHBOARD_CONFIG={mock:true};</script>\n' if mock else ''
        binder_tag = f'{mock_boot}<script src="{binder_src}" defer></script>'
    else:
        binder_tag = '<!-- preview: static demo data, no binder -->'
    return (page + f'''{binder_tag}
</body>
</html>
''')

# ---------------------------------------------------------------- C-header -
def c_array(name, data):
    lines=[",".join(f"0x{b:02x}" for b in data[i:i+20]) for i in range(0,len(data),20)]
    return f"static const uint8_t {name}[{len(data)}] PROGMEM = {{\n  " + ",\n  ".join(lines) + "\n};\n"

def write_header(out, css_gz, pages):
    langs=[l for l,_ in pages]
    h=["// Genereret af build_ui.py — redigér ikke. Sprog: " + ",".join(langs),
       "#pragma once", "#include <stdint.h>", "#include <stddef.h>", "#include <string.h>",
       "#ifndef PROGMEM", "#define PROGMEM", "#endif", ""]
    h.append(c_array("LUNE_UI_CSS_GZ", css_gz))
    for l,gz in pages: h.append(c_array(f"LUNE_UI_{l.upper()}_GZ", gz))
    h.append("struct LuneUiPage { const char *lang; const uint8_t *gz; size_t len; };")
    h.append("static const LuneUiPage LUNE_UI_PAGES[] = {")
    for l,gz in pages: h.append(f'  {{"{l}", LUNE_UI_{l.upper()}_GZ, sizeof(LUNE_UI_{l.upper()}_GZ)}},')
    h.append("};")
    h.append(f"static const size_t LUNE_UI_PAGE_COUNT = {len(pages)};")
    h.append(r'''
// Vælg side til "/": 1) cookie "lune_lang=xx", 2) første match i
// Accept-Language (i header-rækkefølge), 3) første sprog i buildet.
// Sæt cookien, når brugeren besøger /xx/ — så huskes valget uden JS.
static inline const LuneUiPage *lune_ui_find(const char *lang) {
  for (size_t i = 0; i < LUNE_UI_PAGE_COUNT; i++)
    if (lang && strncmp(lang, LUNE_UI_PAGES[i].lang, 2) == 0) return &LUNE_UI_PAGES[i];
  return nullptr;
}
static inline const LuneUiPage *lune_ui_pick(const char *cookie, const char *accept_language) {
  if (cookie) { const char *c = strstr(cookie, "lune_lang=");
    if (c) { const LuneUiPage *p = lune_ui_find(c + 10); if (p) return p; } }
  if (accept_language) {
    const char *best = nullptr; const LuneUiPage *bp = nullptr;
    for (size_t i = 0; i < LUNE_UI_PAGE_COUNT; i++) {
      const char *hit = strstr(accept_language, LUNE_UI_PAGES[i].lang);
      if (hit && (!best || hit < best)) { best = hit; bp = &LUNE_UI_PAGES[i]; }
    }
    if (bp) return bp;
  }
  return &LUNE_UI_PAGES[0];
}''')
    (out/"web_ui.h").write_text("\n".join(h), encoding="utf-8")

# ---------------------------------------------------------------- main -----
def main():
    ap=argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--langs", default=os.environ.get("LUNE_UI_LANGS","en,da"), help="kommasepareret, første = standard (default en,da)")
    ap.add_argument("--out", default="dist")
    ap.add_argument("--css", default="",
                    help="projekt-CSS (default: ./dist/lune-ui.css or sibling LDS dist/v6)")
    ap.add_argument("--preview", action="store_true", help="byg også selvstændige preview-<lang>.html med inline CSS")
    ap.add_argument("--preview-urls", default="", help="lang=url,... til sprogvælgeren i preview-filerne")
    a=ap.parse_args()

    codes=[c.strip() for c in a.langs.split(",") if c.strip()]
    avail=sorted(p.stem for p in (ROOT/"i18n").glob("*.json"))
    for c in codes:
        if c not in avail: sys.exit(f"Ukendt sprog '{c}'. Tilgængelige: {', '.join(avail)}")
    base=Cat("en",None) if "en" in avail else None
    cats=[Cat(c, None if c=="en" else base) for c in codes]

    out=pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
    if a.css:
        cssp=pathlib.Path(a.css)
    else:
        candidates=[ROOT/"ui"/"lune-ui.css"]
        if LDS_ROOT: candidates.append(LDS_ROOT/"dist"/"v6"/"lune-ui.css")
        cssp=next((c for c in candidates if c.exists()), candidates[0])
    if not cssp.exists():
        hint = f"python {LDS_ROOT}/tools/lds_build.py config/v6.json" if LDS_ROOT else "python tools/lds_build.py config/v6.json"
        sys.exit(f"Mangler {cssp}. Kør først: {hint} && cp dist/v6/lune-ui.css {ROOT}/ui/")
    css=cssp.read_text(encoding="utf-8")
    (out/"lune-ui.css").write_text(css, encoding="utf-8")
    css_gz=gzip.compress(css.encode(), 9, mtime=0)
    (out/"lune-ui.css.gz").write_bytes(css_gz)

    urls={c.meta("_lang"): f"/{c.meta('_lang')}/" for c in cats}
    pages=[]
    for c in cats:
        html=render(c, cats, urls, "/lune-ui.css")
        d=out/c.meta("_lang"); d.mkdir(exist_ok=True)
        (d/"index.html").write_text(html, encoding="utf-8")
        gz=gzip.compress(html.encode(), 9, mtime=0); (d/"index.html.gz").write_bytes(gz)
        pages.append((c.meta("_lang"), gz))
        if c.missing: print(f"ADVARSEL: {c.meta('_lang')} mangler {len(c.missing)} nøgler (bruger engelsk): {', '.join(sorted(c.missing))}")
    write_header(out, css_gz, pages)

    if a.preview:
        # Offline-openable shells next to the sources (web/preview.html) and
        # under --out. Default lang links are relative so file:// works.
        purls = {
            c.meta("_lang"): ("preview.html" if c.meta("_lang") == codes[0]
                              else f"preview-{c.meta('_lang')}.html")
            for c in cats
        }
        for kv in filter(None, a.preview_urls.split(",")):
            k, v = kv.split("=", 1)
            purls[k] = v
        for i, c in enumerate(cats):
            # Live mock binder: open file:// or via a static server and values tick.
            html = render(
                c, cats, purls, None,
                inline_css=css,
                include_binder=True,
                binder_src="ui/binder.js",
                mock=True,
            )
            name = "preview.html" if i == 0 else f"preview-{c.meta('_lang')}.html"
            (out / name).write_text(html, encoding="utf-8")
            (ROOT / name).write_text(html, encoding="utf-8")
        extras = [str(ROOT / f"preview-{c.meta('_lang')}.html") for c in cats[1:]]
        print("Preview: " + ", ".join([str(ROOT / "preview.html")] + extras))

    total=len(css_gz)+sum(len(g) for _,g in pages)
    print(f"Byggede {', '.join(codes)} → {out}/  (flash: {total/1024:.1f} kB gzip i alt: css {len(css_gz)/1024:.1f} kB + " +
          " + ".join(f"{l} {len(g)/1024:.1f} kB" for l,g in pages) + ")")

if __name__=="__main__":
    main()
