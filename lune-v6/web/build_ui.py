#!/usr/bin/env python3
"""
Lune V6 web-UI — referenceimplementering af Lune Design System 2.
Bygger dashboardet med build-time i18n oven på dist/v6/lune-ui.css.

    python build_ui.py                       # standard: --langs en,da
    python build_ui.py --langs de,en         # vælg sprog ved compile
    LUNE_UI_LANGS=da python build_ui.py      # eller via miljøvariabel (fx fra PlatformIO)

Output (i --out, standard ./dist):
    lune-ui.css(.gz)              fælles stylesheet
    <lang>/index.html(.gz)        én færdigoversat side pr. sprog
    web_ui.h                      gzip-bytes som C-arrays + sprogtabel til firmwaren

Første sprog i listen er standard/fallback. Mangler en nøgle i et katalog,
bruges engelsk (eller første sprog), og buildet advarer. Med ét sprog
udelades sprogvælgeren helt.

Sprogskift kræver ingen JavaScript: vælgeren er almindelige links til
/en/ og /da/. Firmwaren serverer "/" ud fra cookie → Accept-Language →
standardsprog (se lune_ui_pick() i web_ui.h).
"""
import argparse, gzip, json, math, os, random, sys, pathlib

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
 (4,"Stue rum 1",21.1,21.5,"calling",54,28.4,"primary","s","probe",22.0,150,"PEX 16mm"),
 (5,"Stue rum 2",21.0,21.5,"calling",54,28.5,"member","sw","probe",18.0,150,"PEX 16mm"),
 (6,"Soveværelse",17.8,19.0,"fault",0,22.1,None,"n","ble",14.0,200,"ALUPEX 16mm"),
]
PIPES=["PEX 12mm","PEX 14mm","PEX 16mm","PEX 17mm","PEX 18mm","PEX 20mm","ALUPEX 16mm","ALUPEX 20mm","Unknown"]
def level(z): return 0 if z[4] in ("fault","off") else max(1, math.ceil(z[5]/20))
def tid(z): return "Z4–5" if z[7]=="primary" else f"Z{z[0]}"
def rid(z): return "Z5" if z[7]=="member" else tid(z)

def history(z):
    random.seed(z[0]*7)
    i,n,t,tg,st=z[:5]; tgt=[]; tmp=[]; cur=tg-0.6
    for k in range(48):
        h=(k/2+10)%24; night=(h>=22 or h<6)
        g=tg-(1.5 if (night and i in (2,6)) else 0.5 if night else 0)
        tgt.append(g); cur+=(g-cur)*0.18+random.uniform(-.08,.08)
        if st=="fault" and k>=42: cur-=0.28
        tmp.append(cur)
    d=t-tmp[-1]
    for j in range(8): tmp[-8+j]+=d*(j+1)/8
    return tgt,tmp

def forecast_data():
    random.seed(11); temp=[]; wind=[]
    for h in range(73):
        hod=h%24; day=min(h//24,2)
        t=[11.5,12.5,10.5][day]+[4.5,3.0,2.5][day]*math.sin((hod-9)/24*2*math.pi)+random.uniform(-.25,.25)
        w=4.5+1.5*math.sin(h/9)+random.uniform(-.4,.4)
        if 18<=h<=32: w+=5.5*math.sin((h-18)/14*math.pi)
        if h>52: w-=1.5
        temp.append(t); wind.append(max(.5,w))
    return temp,wind
def cond(h):
    hod=h%24
    if 21<=h<=29: return "rain"
    if h in (44,47,50): return "cloud"
    if hod<6 or hod>=20: return "moon"
    if hod in (9,12,15) and h<24: return "sun"
    if hod in (12,15): return "partly"
    return "cloud"

# ---------------------------------------------------------------- render ---
def render(T, langs, lang_urls, css_href, inline_css=None, include_binder=True, binder_src="/binder.js", mock=False):
    ST={k:T(f"state.{k}") for k in ("calling","idle","fault","off")}
    H=T.meta("_h")

    def stepper(name,val,mn,mx,step,unit,label,dec=1):
        return (f'<div class="stepper"><button type="button" data-step="-1" aria-label="{T("common.decrease",x=label.lower())}">−</button>'
                f'<span class="value"><input type="number" inputmode="decimal" id="{name}" name="{name}" value="{val:.{dec}f}" min="{mn}" max="{mx}" step="{step}"><span class="unit">{unit}</span></span>'
                f'<button type="button" data-step="1" aria-label="{T("common.increase",x=label.lower())}">+</button></div>')
    def switch(name,t,sub,on):
        return f'<label class="switch"><span class="switch-text"><b>{t}</b>{f"<small>{sub}</small>" if sub else ""}</span><input type="checkbox" role="switch" name="{name}"{" checked" if on else ""}></label>'
    def seg(name,opts,sel,label):
        return f'<div class="seg" role="radiogroup" aria-label="{label}">'+"".join(f'<label><input type="radio" name="{name}" value="{v}"{" checked" if v==sel else ""}><span>{t}</span></label>' for v,t in opts)+'</div>'
    def row(id_,label,control): return f'<div class="field row"><label for="{id_}">{label}</label>{control}</div>'
    def rstep(id_,label,*a,**k): return row(id_,label,stepper(id_,*a,label=label,**k))
    def probes(sel,name): return f'<select class="select" id="{name}" name="{name}">'+"".join(f'<option value="{k}"{" selected" if k==sel else ""}>{T("csys.probe",n=k)}</option>' for k in range(1,9))+'</select>'
    def file_input(name, accept):
        return (f'<label class="input file" for="{name}">'
                f'<input class="sr-only" id="{name}" name="{name}" type="file" accept="{accept}">'
                f'<span class="file-pick">{T("common.chooseFile")}</span>'
                f'<span class="file-name" data-empty="{T("common.noFile")}">{T("common.noFile")}</span></label>')
    def metric(label,val,unit,bind=""):
        b=f' data-bind="{bind}"' if bind else ""
        return f'<div class="metric"><dt>{label}</dt><dd{b}>{val} <small>{unit}</small></dd></div>'
    def title(z): return f"{tid(z)} {z[1]}"
    def help_btn(hid, topic):
        return f'<button class="help-btn" type="button" popovertarget="{hid}" style="anchor-name:--a-{hid}" aria-label="{T("help.aria", topic=topic)}">?</button>'
    def help_pop(hid, body_key, more=""):
        link=f'<a href="https://github.com/Birkemosen/lune/blob/main/{more}">{T("help.readMore")}</a>' if more else ""
        return f'<div id="{hid}" popover class="help-pop" style="position-anchor:--a-{hid}"><p>{T(body_key)}</p>{link}</div>'

    # ---- strimmel
    tiles="".join(f'''
          <label class="tile" for="s-z{z[0]}" data-state="{z[4]}" data-level="{level(z)}"{f' data-group="{z[7]}"' if z[7] else ''}>
            <span class="lvl" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
            <span class="tile-id">{tid(z)}</span>
            <span class="tile-name" data-bind="z{z[0]}.name">{z[1]}</span>
            <span class="tile-val" data-bind="z{z[0]}.temp">{T("tile.fault") if z[4]=="fault" else T.num(z[2])+"°"}</span>
          </label>''' for z in Z)
    strip=f'''<nav class="strip" aria-label="{T("strip.label")}">
          <label class="tile tile-sys" for="s-sys" title="{T("scope.manifold")}">
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
          </label>{tiles}
        </nav>'''

    # ---- grafer
    def spark(z):
        tgt,tmp=history(z)
        lo=min(min(tgt),min(tmp)); hi=max(max(tgt),max(tmp)); mid=(lo+hi)/2; span=max(hi-lo+.6,3.0)
        lo,hi=mid-span/2,mid+span/2; W,Hh=240,40
        X=lambda k: round(k*W/47,1); Y=lambda v: round(Hh-(v-lo)/(hi-lo)*Hh,1)
        tp=" ".join(f"{X(k)},{Y(v)}" for k,v in enumerate(tmp)); gp=[]
        for k,v in enumerate(tgt):
            if k and v!=tgt[k-1]: gp.append(f"{X(k)},{Y(tgt[k-1])}")
            gp.append(f"{X(k)},{Y(v)}")
        return f'<svg class="spark" viewBox="0 0 {W} {Hh}" preserveAspectRatio="none" aria-hidden="true" data-bind-spark="z{z[0]}"><polygon class="a" points="{tp} {" ".join(reversed(gp))}"/><polyline class="g" points="{" ".join(gp)}"/><polyline class="t" points="{tp}"/></svg>'
    def trend():
        random.seed(3); W,Hh=240,80; f=[];r=[]; cf=33; cr=29
        for k in range(48):
            h=(k/2+10)%24; night=(h>=22 or h<6)
            cf+=((36.5 if night else 33.5)-cf)*0.2+random.uniform(-.3,.3); cr+=((30.5 if night else 29.2)-cr)*0.2+random.uniform(-.2,.2)
            f.append(cf); r.append(cr)
        X=lambda k: round(k*W/47,1); Y=lambda v: round(Hh-(v-26)/13*Hh,1)
        pf=" ".join(f"{X(k)},{Y(v)}" for k,v in enumerate(f)); pr=" ".join(f"{X(k)},{Y(v)}" for k,v in enumerate(r))
        return f'<svg class="trend" viewBox="0 0 {W} {Hh}" preserveAspectRatio="none" role="img" aria-label="{T("trend.aria")}" data-bind-trend="manifold"><polygon class="dt" points="{pf} {" ".join(reversed(pr.split()))}"/><polyline class="f" points="{pf}"/><polyline class="r" points="{pr}"/></svg>'

    def forecast_panel():
        temp,wind=forecast_data(); W=720; X=lambda h: round(h*W/72,1)
        Yt=lambda v: round(100-(v-6)/14*100,1); Yw=lambda v: round(60-v/14*60,1)
        tp=" ".join(f"{X(h)},{Yt(v)}" for h,v in enumerate(temp)); wp=" ".join(f"{X(h)},{Yw(v)}" for h,v in enumerate(wind))
        NOW=14; now=X(NOW); p0,p1=X(20),X(31)
        gl=lambda ys: "".join(f'<line class="gl" x1="0" x2="{W}" y1="{y}" y2="{y}"/>' for y in ys)
        days="".join(f'<line class="day" x1="{X(d)}" x2="{X(d)}" y1="0" y2="100%"/>' for d in (24,48))
        thr=Yw(8)
        icons="".join(f'<svg class="ic {cond(h)}"><use href="#i-{cond(h)}"/></svg>' for h in range(0,72,3))
        dn=T.meta("_days"); labels=[dn[0],"06","12","18",dn[1],"06","12","18",dn[2],"06","12","18",""]
        xl="".join(f'<span{" class=d" if l in dn else ""}>{l}</span>' for l in labels)
        return f'''        <section class="panel">
          <header class="panel-head"><h3>{T("fc.title")}</h3><p>{T("fc.sub",model="DMI HARMONIE",time="14:05")}</p><span class="badge info">{T("fc.badge",v=T.num(0.4))}</span></header>
          <dl class="metrics">
            {metric(T("fc.now"),T.num(13.4),"°C","forecast.temp")}
            <div class="metric"><dt>{T("fc.wind")}</dt><dd class="c-info" data-bind="forecast.wind">6 <small>m/s</small> <svg class="dir" viewBox="0 0 16 16" style="--deg:296deg" aria-label="{T("fc.windFrom",dir=T.meta("_dir_ese"))}"><path d="M8 2v12M8 2l-4 4M8 2l4 4"/></svg><small>{T.meta("_dir_ese")}</small></dd></div>
            {metric(T("fc.windMax"),"11","m/s","forecast.windmax")}
            {metric(T("fc.tempMin"),T.num(6.8),"°C","forecast.tmin")}
          </dl>
          <p class="msg info"><span><b>{T("fc.msgStrong")}</b> {T("fc.msg")}</span></p>
          <div class="fc" style="--now:{NOW/72*100:.3f}%">
            <div class="fc-icons" aria-hidden="true">{icons}</div>
            <div class="fc-y"><span>20°</span><span>13°</span><span>6°</span></div>
            <div class="fc-plot fc-temp" role="img" aria-label="{T("fc.tempAria")}">
              <span class="fc-now">{T("fc.now")}</span>
              <svg viewBox="0 0 {W} 100" preserveAspectRatio="none" data-bind-fc="temp">{gl((0,50,100))}{days}<rect class="pre" x="{p0}" y="0" width="{p1-p0}" height="100"/><polyline class="tl" points="{tp}"/><rect class="past" x="0" y="0" width="{now}" height="100"/><line class="now" x1="{now}" x2="{now}" y1="0" y2="100"/></svg>
            </div>
            <div class="fc-y"><span>14</span><span>7</span><span>0</span></div>
            <div class="fc-plot fc-wind" role="img" aria-label="{T("fc.windAria")}">
              <svg viewBox="0 0 {W} 60" preserveAspectRatio="none" data-bind-fc="wind">{gl((0,30,60))}{days}<rect class="pre" x="{p0}" y="0" width="{p1-p0}" height="60"/><polygon class="wa" points="0,60 {wp} {W},60"/><polyline class="wl" points="{wp}"/><line class="thr" x1="0" x2="{W}" y1="{thr}" y2="{thr}"/><rect class="past" x="0" y="0" width="{now}" height="60"/><line class="now" x1="{now}" x2="{now}" y1="0" y2="60"/></svg>
            </div>
            <div class="fc-x" aria-hidden="true">{xl}</div>
          </div>
          <div class="fc-legend" aria-hidden="true"><span><i class="lt"></i>{T("fc.lTemp")}</span><span><i class="lw"></i>{T("fc.lWind")}</span><span><i class="lthr"></i>{T("fc.lThr")}</span><span><i class="lpre"></i>{T("fc.lPre")}</span></div>
        </section>'''

    # ---- dashboard: manifold
    comfort="".join(f'''
            <label for="s-z{z[0]}" data-state="{z[4]}">
              <span class="id">{rid(z)}</span>
              <span class="name">{z[1]}</span>
              <span class="val">{f'<b class="bad">{ST["fault"]}</b>' if z[4]=='fault' else f'<b class="{"c-warn" if z[3]-z[2]>0.5 else ""}">{T.num(z[2])}°</b> / {T.num(z[3])}°'}</span>
              {spark(z)}
            </label>''' for z in Z)
    balrows=[("1,00","1,08","1,08"),("0,85","0,81","0,81"),("0,40","0,44","0,44"),("1,00","0,97","0,97"),("1,00","0,97","0,97"),("0,85","—","0,85")]
    bal="".join(f'<tr><td>{rid(z)}</td>'+"".join(f'<td class="num{" c-violet" if j==1 else ""}">{v.replace(",",T.meta("_dec"))}</td>' for j,v in enumerate(r))+'</tr>' for z,r in zip(Z,balrows))
    faultz=Z[5]
    dash_sys=f'''
      <section class="view" id="v-dash-sys" aria-labelledby="h-dash-sys">
        <header class="view-head"><h2 id="h-dash-sys">{T("scope.manifold")}</h2><p>{T("dash.sys.sub",zones=6,calling=3,faults=1)}</p></header>

        <div class="panel alert">
          <div class="panel-head"><h3>{T("alert.zoneFault",zone=title(faultz))}</h3></div>
          <p class="note">{T("alert.zoneFaultBody")}</p>
          <div class="panel-foot" style="justify-content:flex-start"><label class="btn" for="s-z6">{T("common.open",x="Z6")}</label></div>
        </div>

        <section class="panel c5">
          <header class="panel-head"><h3>{T("heat.title")}</h3><span class="badge hot">{T("badge.calling")}</span></header>
          <dl class="metrics">
            {metric(T("m.supply"),T.num(34.2),"°C","manifold.flow")}
            {metric(T("m.return"),T.num(29.8),"°C","manifold.return")}
            {metric(T("m.dt"),T.num(4.4),"K","manifold.dt")}
            {metric(T("m.opening"),"32","%","manifold.opening")}
          </dl>
          <div class="bar" style="--v:32%" role="meter" aria-valuenow="32" aria-valuemin="0" aria-valuemax="100" aria-label="{T("m.openingAria")}"><i></i></div>
          <div class="sub trend-wrap">
            <h4>{T("trend.title")} <span class="legend"><i class="lf"></i>{T("m.supply")}<i class="lr"></i>{T("m.return")}</span></h4>
            {trend()}
            <div class="axis" aria-hidden="true"><span>−24 {H}</span><span>−12 {H}</span><span>{T("trend.now")}</span></div>
          </div>
        </section>

        <section class="panel c7">
          <header class="panel-head"><h3>{T("comfort.title")}</h3><p>{T("trend.title")}</p><span class="legend" aria-hidden="true"><i class="lt"></i>{T("legend.temp")}<i class="lg"></i>{T("legend.target")}</span></header>
          <div class="comfort">{comfort}
          </div>
        </section>


        <section class="panel c6">
          <header class="panel-head"><h3>{T("bal.title")}</h3><span class="badge violet">{T("bal.adaptive")}</span></header>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>{T("bal.zone")}</th><th class="num">{T("bal.prior")}</th><th class="num">{T("bal.learned")}</th><th class="num">{T("bal.effective")}</th></tr></thead>
            <tbody>{bal}</tbody>
          </table></div>
        </section>

        <section class="panel c6">
          <header class="panel-head"><h3>{T("dev.title")}</h3><span class="badge ok">{T("dev.online")}</span></header>
          <dl class="metrics">
            {metric("Wi-Fi","−58","dBm","wifi.rssi")}
            {metric(T("dev.uptime"),"6",T("common.days"),"sys.uptime")}
          </dl>
          <pre class="log" data-bind="log" aria-live="polite" lang="en">14:06  <span class="bad">zone Z6</span> FAULT, valve closed
14:06  <span class="bad">motor Z6</span> end-stop timeout (45 s)
14:05  <span class="violet">balancing</span> Z3 0.42 → 0.44
14:05  <span class="info">forecast</span> fetched, max wind 11 m/s</pre>
        </section>
      </section>'''

    # ---- dashboard: zone
    def dash_zone(z):
        i,n,t,tg,st,fl,ret,grp,walls,src,area,sp,pipe=z
        member=grp=="member"
        sub=ST[st]+(" · "+T("zdash.follows",z="Z4") if member else " · "+T("zdash.primary",g="Z4–5") if grp=="primary" else "")
        alert=f'''
        <form class="panel alert" data-save="zone/{i}/recovery">
          <div class="panel-head"><h3>{T("zdash.faultTitle")}</h3></div>
          <p class="note">{T("zdash.faultBody")}</p>
          <div class="panel-foot" style="justify-content:flex-start"><button class="btn" type="submit" name="action" value="reset_fault">{T("common.resetFault")}</button></div>
        </form>''' if st=="fault" else ""
        dis=' disabled' if member else ''
        badge={"calling":f'<span class="badge hot">{ST["calling"]}</span>',"idle":f'<span class="badge">{ST["idle"]}</span>',"fault":f'<span class="badge bad">{ST["fault"]}</span>'}[st]
        pre=f'<p class="msg info"><span><b>{T("zdash.preloadStrong")}</b> {T("zdash.preload")}</span></p>' if i in (1,5) else ""
        foot=(f'<span class="note">{T("zdash.memberNote",m="Z5",p="Z4")}</span><label class="btn" for="s-z4">{T("common.open",x="Z4–5")}</label>'
              if member else f'<button class="btn primary" type="submit">{T("zdash.saveTarget")}</button>')
        ta=T("zdash.targetAria")
        return f'''
      <section class="view" id="v-dash-z{i}" aria-labelledby="h-dash-z{i}">
        <header class="view-head"><h2 id="h-dash-z{i}">{title(z)}</h2><p>{sub}</p></header>{alert}

        <form class="panel c7" data-save="zone/{i}/target">
          <header class="panel-head"><h3>{T("zdash.comfort")}</h3>{badge}</header>
          {pre}
          <div class="climate">
            <div class="now" data-bind="z{i}.temp">{T.num(t)}<small>°C</small></div>
            <div class="target">
              <button type="button" data-step="-1" aria-label="{T("common.decrease",x=ta)}"{dis}>−</button>
              <label class="value"><small>{T("zdash.target")}</small><input type="number" inputmode="decimal" name="z{i}_target" value="{tg:.1f}" min="16" max="28" step="0.5"{dis}></label>
              <button type="button" data-step="1" aria-label="{T("common.increase",x=ta)}"{dis}>+</button>
            </div>
          </div>
          <footer class="panel-foot">{foot}</footer>
        </form>

        <section class="panel c5">
          <header class="panel-head"><h3>{T("zdash.valve")}</h3></header>
          <dl class="metrics">
            {metric(T("zdash.opening"),fl,"%",f"z{i}.flow")}
            {metric(T("m.return"),T.num(ret),"°C",f"z{i}.return")}
          </dl>
          <div class="bar" style="--v:{fl}%" aria-hidden="true"><i></i></div>
          <dl class="kv">
            <div><dt>{T("zdash.motor")}</dt><dd class="{'c-warn' if st=='fault' else 'c-ok'}">{T("common.needsLearning") if st=="fault" else T("common.learned")}</dd></div>
            <div><dt>{T("zdash.preheatAdv")}</dt><dd>{T.num(0.0 if st=="fault" else 0.35,2)} °C</dd></div>
            <div><dt>{T("zdash.offsetNow")}</dt><dd class="{'c-info' if i in (1,5) else ''}">{"+"+T.num(0.4) if i in (1,5) else T.num(0.0)} °C</dd></div>
            <div><dt>{T("zdash.tempFrom")}</dt><dd class="c-info">{T("src.ble") if src=="ble" else T("src.probe")}</dd></div>
          </dl>
        </section>
      </section>'''

    # ---- konfiguration: manifold
    zone_opts="".join(f'<option value="{z[0]}">Z{z[0]} {z[1]}</option>' for z in Z)
    def sect(key): return f'<header class="section-head"><span>{T(key)}</span></header>'
    conf_sys=f'''
      <section class="view" id="v-conf-sys" aria-labelledby="h-conf-sys">
        <header class="view-head"><h2 id="h-conf-sys">{T("scope.manifold")}</h2><p>{T("csys.sub")}</p></header>

        {sect("sect.setup")}

        <form class="panel c6" data-save="manifold">
          <header class="panel-head"><h3>{T("csys.mm")}</h3>{help_btn("help-manifold",T("csys.mm"))}</header>
          {help_pop("help-manifold","help.manifold","lune-v6/docs/Manual.md#manifold")}
          <div class="sub">
            <h4>{T("csys.manifold")}</h4>
            <div class="field"><span class="label">{T("csys.valveType")}</span>{seg("manifold_type",[("no",T("csys.no")),("nc",T("csys.nc"))],"nc",T("csys.valveType"))}</div>
            {row("probe_flow",T("csys.supplyProbe"),probes(7,"probe_flow"))}
            {row("probe_return",T("csys.returnProbe"),probes(8,"probe_return"))}
          </div>
          <div class="sub">
            <h4>{T("csys.motors")}</h4>
            {switch("motor_drivers",T("csys.drivers"),T("csys.driversSub"),True)}
            {row("motor_type",T("csys.motorType"),'<select class="select" id="motor_type" name="motor_type"><option>Generic</option><option selected>HmIP VdMot</option></select>')}
            {rstep("m_runtime",T("csys.maxRun"),45,10,120,5,"s",dec=0)}
          </div>
          <details class="more">
            <summary>{T("csys.limits")}</summary>
            <p class="msg violet"><span>{T("csys.limitsMsg")}</span></p>
            <div class="subs">
              <div class="sub">
                <h4>{T("csys.closeStop")}</h4>
                {rstep("m_cthr",T("csys.threshold"),180,50,500,10,"mA",dec=0)}
                {rstep("m_cslope",T("csys.slope"),12,1,50,1,"",dec=0)}
                {rstep("m_cfloor",T("csys.slopeFloor"),4,0,20,1,"",dec=0)}
              </div>
              <div class="sub">
                <h4>{T("csys.openStop")}</h4>
                {rstep("m_othr",T("csys.threshold"),160,50,500,10,"mA",dec=0)}
                {rstep("m_oslope",T("csys.slope"),10,1,50,1,"",dec=0)}
                {rstep("m_ofloor",T("csys.slopeFloor"),4,0,20,1,"",dec=0)}
                {rstep("m_ripple",T("csys.ripple"),600,100,2000,50,"",dec=0)}
              </div>
              <div class="sub">
                <h4>{T("csys.relearn")}</h4>
                {rstep("m_relmov",T("csys.afterMoves"),200,10,2000,10,"",dec=0)}
                {rstep("m_relh",T("csys.afterHours"),168,1,720,1,H,dec=0)}
                {rstep("m_minsamp",T("csys.minSamples"),3,1,20,1,"",dec=0)}
                {rstep("m_maxdev",T("csys.maxDev"),0.15,0.01,1,0.01,"",dec=2)}
              </div>
            </div>
          </details>
          <footer class="panel-foot"><button class="btn primary" type="submit">{T("csys.saveManifold")}</button></footer>
        </form>

        <form class="panel c6" data-save="regulation">
          <header class="panel-head"><h3>{T("csys.regulation")}</h3>{help_btn("help-regulation",T("csys.regulation"))}</header>
          {help_pop("help-regulation","help.regulation","lune-v6/docs/Manual.md#regulation")}
          <div class="sub">
            <h4>{T("csys.balancing")} <span class="badge violet" style="margin-left:6px">{T("csys.learningBadge")}</span></h4>
            <div class="field"><span class="label">{T("csys.mode")}</span>{seg("bal_mode",[("static",T("csys.static")),("adaptive",T("csys.adaptive"))],"adaptive",T("csys.mode"))}</div>
            {rstep("bal_interval",T("csys.interval"),300,60,3600,60,"s",dec=0)}
            {rstep("bal_step",T("csys.step"),0.02,0.01,0.2,0.01,"",dec=2)}
            {rstep("bal_min",T("csys.minFactor"),0.3,0.1,1,0.05,"",dec=2)}
            {rstep("bal_max",T("csys.maxFactor"),1.5,1,3,0.05,"",dec=2)}
          </div>
          <div class="sub gated">
            <h4>{T("csys.preheat")}</h4>
            {switch("preheat_enabled",T("csys.absorb"),T("csys.absorbSub"),False)}
            <div class="gated-body sub">
              {rstep("ph_band",T("csys.band"),0.5,0.1,3,0.1,"°C")}
              {rstep("ph_delta",T("csys.delta"),0.3,0.1,2,0.1,"°C")}
            </div>
          </div>
          <footer class="panel-foot">
            <details class="confirm" style="margin-right:auto">
              <summary class="btn danger">{T("csys.resetBal")}</summary>
              <p class="note">{T("csys.resetBalNote")}</p>
              <button class="btn danger" type="submit" name="action" value="reset_balancing">{T("csys.resetBalConfirm")}</button>
            </details>
            <button class="btn primary" type="submit">{T("csys.saveReg")}</button>
          </footer>
        </form>

        <form class="panel c6" data-save="heating">
          <header class="panel-head"><h3>{T("csys.heating")}</h3>{help_btn("help-heating",T("csys.heating"))}</header>
          {help_pop("help-heating","help.heating","lune-v6/docs/Manual.md#heating")}
          <div class="field"><span class="label">{T("csys.heatMode")}</span>{seg("heat_mode",[("normal",T("csys.heatNormal")),("heat_pump",T("csys.heatPump"))],"normal",T("csys.heatMode"))}</div>
          {rstep("heat_min_open",T("csys.minOpening"),15,0,100,1,"%",dec=0)}
          <div class="sub gated">
            <h4>{T("csys.heatPumpLimits")}</h4>
            {rstep("hp_base",T("csys.hpBase"),35,20,55,0.5,"°C")}
            {rstep("hp_overheat",T("csys.hpOverheat"),8,0,20,0.5,"K")}
            {rstep("hp_trim",T("csys.hpTrim"),-2,-10,10,0.5,"K")}
          </div>
          <footer class="panel-foot"><button class="btn primary" type="submit">{T("csys.saveHeating")}</button></footer>
        </form>

        <form class="panel c6" data-save="return_probes">
          <header class="panel-head"><h3>{T("csys.returnProbes")}</h3>{help_btn("help-return-probes",T("csys.returnProbes"))}</header>
          {help_pop("help-return-probes","help.returnProbes","lune-v6/docs/Manual.md#return-probes")}
          <div class="field"><span class="label">{T("csys.probeMode")}</span>{seg("return_probe_mode",[("2",T("csys.probeMode2")),("8",T("csys.probeMode8"))],"8",T("csys.probeMode"))}</div>
          <p class="note">{T("csys.returnProbesNote")}</p>
          <footer class="panel-foot"><button class="btn primary" type="submit">{T("csys.saveReturnProbes")}</button></footer>
        </form>

        {sect("sect.connect")}

        <form class="panel c6" data-save="touch">
          <header class="panel-head"><h3>{T("csys.touch")}</h3>{help_btn("help-touch",T("csys.touch"))}<span class="badge" data-bind="touch.badge">{T("csys.touchWaiting")}</span></header>
          {help_pop("help-touch","help.touch","lune-v6/docs/Manual.md#touch")}
          <p class="note" data-bind="touch.status">{T("csys.touchWaitingBody")}</p>
          <dl class="kv" data-bind-show="touch.identity">
            <div><dt>{T("csys.touchName")}</dt><dd data-bind="touch.name">—</dd></div>
            <div><dt>{T("csys.touchSite")}</dt><dd data-bind="touch.site">—</dd></div>
            <div><dt>{T("csys.touchInstall")}</dt><dd data-bind="touch.install">—</dd></div>
            <div><dt>{T("csys.touchCoord")}</dt><dd data-bind="touch.coord">—</dd></div>
          </dl>
          <footer class="panel-foot">
            <details class="confirm" style="margin-right:auto">
              <summary class="btn danger">{T("csys.touchRevoke")}</summary>
              <p class="note">{T("csys.touchRevokeNote")}</p>
              <button class="btn danger" type="submit" name="action" value="revoke">{T("csys.touchRevokeConfirm")}</button>
            </details>
            <button class="btn primary" type="submit" name="action" value="approve">{T("csys.touchApprove")}</button>
          </footer>
        </form>

        <form class="panel c6" data-save="ble_clock">
          <header class="panel-head"><h3>{T("csys.bleClock")}</h3>{help_btn("help-ble-clock",T("csys.bleClock"))}</header>
          {help_pop("help-ble-clock","help.bleClock","lune-v6/docs/Manual.md#ble-clock")}
          {switch("ble_clock_enabled",T("csys.bleClockEnable"),T("csys.bleClockSub"),False)}
          {rstep("ble_clock_interval",T("csys.bleClockInterval"),60,10,600,10,"s",dec=0)}
          <footer class="panel-foot">
            <button class="btn" type="submit" name="action" value="sync">{T("csys.bleClockSync")}</button>
            <button class="btn primary" type="submit">{T("csys.saveBleClock")}</button>
          </footer>
        </form>

        <section class="panel c6">
          <header class="panel-head"><h3>{T("csys.weather")}</h3><span class="badge info">{T("csys.weatherTouch")}</span></header>
          <p class="msg info"><span>{T("csys.weatherTouchBody")}</span></p>
          <p class="note">{T("csys.weatherTouchHint")}</p>
        </section>

        {sect("sect.maintain")}

        <form class="panel c6" data-save="firmware">
          <header class="panel-head"><h3>{T("csys.firmware")}</h3>{help_btn("help-firmware",T("csys.firmware"))}</header>
          {help_pop("help-firmware","help.firmware","lune-v6/docs/Manual.md#firmware")}
          <dl class="kv">
            <div><dt>{T("csys.fwInstalled")}</dt><dd data-bind="fw.installed">—</dd></div>
            <div><dt>{T("csys.fwLatest")}</dt><dd data-bind="fw.latest">—</dd></div>
          </dl>
          <div class="actions">
            <button class="btn" type="submit" name="action" value="check">{T("csys.fwCheck")}</button>
            <button class="btn" type="submit" name="action" value="install">{T("csys.fwInstall")}</button>
          </div>
          <div class="field"><label for="ota_file">{T("csys.fwUpload")}</label>{file_input("ota_file",".bin,.ota.bin")}</div>
          <footer class="panel-foot"><button class="btn primary" type="submit" name="action" value="upload">{T("csys.fwUploadBtn")}</button></footer>
        </form>

        <form class="panel c6" data-save="backup">
          <header class="panel-head"><h3>{T("csys.backup")}</h3>{help_btn("help-backup",T("csys.backup"))}</header>
          {help_pop("help-backup","help.backup","lune-v6/docs/Manual.md#backup")}
          <p class="note">{T("csys.backupNote")}</p>
          <label class="switch"><span class="switch-text"><b>{T("csys.backupLearned")}</b><small>{T("csys.backupLearnedSub")}</small></span><input type="checkbox" role="switch" name="include_learned"></label>
          <div class="field"><label for="backup_file">{T("csys.backupImport")}</label>{file_input("backup_file","application/json,.json")}</div>
          <footer class="panel-foot">
            <button class="btn" type="submit" name="action" value="export">{T("csys.backupExport")}</button>
            <button class="btn primary" type="submit" name="action" value="import">{T("csys.backupImportBtn")}</button>
          </footer>
        </form>

        {sect("sect.service")}

        <form class="panel" data-save="service">
          <header class="panel-head"><h3>{T("csys.manual")}</h3>{help_btn("help-manual",T("csys.manual"))}</header>
          {help_pop("help-manual","help.manual","lune-v6/docs/Manual.md#manual")}
          <div class="sub gated">
            <p class="msg warn"><span>{T("csys.manualMsg")}</span></p>
            {switch("manual_mode",T("csys.manualMode"),"",False)}
            <div class="gated-body sub">
              {row("man_zone",T("csys.motor"),f'<select class="select" id="man_zone" name="man_zone">{zone_opts}</select>')}
              {rstep("man_target",T("csys.motorTarget"),50,0,100,5,"%",dec=0)}
              <div class="actions"><button class="btn" type="submit" name="action" value="stop">{T("csys.stop")}</button><button class="btn" type="submit" name="action" value="move">{T("csys.move")}</button></div>
            </div>
          </div>
        </form>

        <form class="panel c6" data-save="service">
          <header class="panel-head"><h3>{T("csys.health")}</h3>{help_btn("help-health",T("csys.health"))}</header>
          {help_pop("help-health","help.health","lune-v6/docs/Manual.md#health")}
          <dl class="metrics">
            {metric("CPU0","—","%","diag.cpu0")}
            {metric("CPU1","—","%","diag.cpu1")}
            {metric(T("csys.heap"),"—","kB","diag.heap")}
            {metric("PSRAM","—","kB","diag.psram")}
          </dl>
          <div class="actions">
            <button class="btn" type="submit" name="action" value="dump_tasks">{T("csys.tasks")}</button>
            <button class="btn" type="submit" name="action" value="i2c_scan">{T("csys.i2cScan")}</button>
            <button class="btn" type="submit" name="action" value="dump_ow">{T("csys.dumpOw")}</button>
          </div>
          <pre class="log" data-bind="diag.i2c" aria-live="polite" lang="en"></pre>
        </form>

        <form class="panel c6" data-save="service">
          <header class="panel-head"><h3>{T("csys.logs")}</h3>{help_btn("help-logs",T("csys.logs"))}</header>
          {help_pop("help-logs","help.logs","lune-v6/docs/Manual.md#logs")}
          <div class="actions">
            <button class="btn" type="submit" name="action" value="logs_pause">{T("csys.logsPause")}</button>
            <button class="btn" type="submit" name="action" value="logs_clear">{T("csys.logsClear")}</button>
            <button class="btn" type="submit" name="action" value="logs_download">{T("csys.logsDownload")}</button>
          </div>
          <pre class="log" data-bind="log" aria-live="polite" lang="en"></pre>
        </form>

        <form class="panel c6" data-save="service">
          <header class="panel-head"><h3>{T("csys.device")}</h3>{help_btn("help-device-actions",T("csys.device"))}</header>
          {help_pop("help-device-actions","help.deviceActions","lune-v6/docs/Manual.md#device-actions")}
          <div class="actions">
            <details class="confirm">
              <summary class="btn danger">{T("csys.resetProbes")}</summary>
              <p class="note">{T("csys.resetProbesNote")}</p>
              <button class="btn danger" type="submit" name="action" value="reset_probe_map">{T("csys.resetProbesConfirm")}</button>
            </details>
            <details class="confirm">
              <summary class="btn danger">{T("csys.restart")}</summary>
              <p class="note">{T("csys.restartNote")}</p>
              <button class="btn danger" type="submit" name="action" value="restart">{T("csys.restartConfirm")}</button>
            </details>
          </div>
        </form>

        <section class="panel" data-dev-only hidden>
          <header class="panel-head"><h3>{T("csys.motorLab")}</h3></header>
          <p class="msg warn"><span>{T("csys.motorLabMsg")}</span></p>
          <div class="actions">
            <button class="btn" type="button" data-action="motorlab-start">{T("csys.motorLabStart")}</button>
            <button class="btn danger" type="button" data-action="motorlab-estop">{T("csys.motorLabEstop")}</button>
          </div>
          <div class="field"><canvas data-motorlab-chart width="480" height="160" style="width:100%;height:auto;background:var(--field)"></canvas></div>
        </section>
      </section>'''

    # ---- konfiguration: zone
    WL=T.meta("_walls"); WF=T.meta("_walls_full")
    def compass(i,walls):
        return f'<div class="compass" role="group" aria-label="{T("cz.walls")}"><i class="c"></i>'+"".join(f'<label data-wall="{k}"><input type="checkbox" name="z{i}_wall" value="{k}"{" checked" if k in walls else ""} aria-label="{WF[k]}"><span>{WL[k]}</span></label>' for k in "nesw")+'</div>'
    def conf_zone(z):
        i,n,t,tg,st,fl,ret,grp,walls,src,area,sp,pipe=z
        merge=f'<option value="">{T("common.none")}</option>'+"".join(f'<option value="{y[0]}"{" selected" if (i==5 and y[0]==4) else ""}>Z{y[0]} {y[1]}</option>' for y in Z if y[0]!=i)
        pipes="".join(f'<option{" selected" if p==pipe else ""}>{p}</option>' for p in PIPES)
        fault=st=="fault"
        L=(T("common.needsLearning"),"—","—",T.num(0,2),T("cz.endstopTimeout")) if fault else (T("common.learned"),"412 / 398",f"{T.num(0.96,2)} / {T.num(1.04,2)}",T.num(0.35,2),T("common.none"))
        member=f'<p class="msg violet"><span><b>{T("cz.memberStrong",p="Z4")}</b> {T("cz.member",p="Z4")}</span></p>' if grp=="member" else ""
        zid=f"Z{i}"
        return f'''
      <section class="view" id="v-conf-z{i}" aria-labelledby="h-conf-z{i}">
        <header class="view-head"><h2 id="h-conf-z{i}">{title(z)}</h2><p>{T("cz.sub")}</p></header>

        {sect("sect.zone")}

        <form class="panel c6" data-save="zone/{i}/room">
          <header class="panel-head"><h3>{T("cz.roomSensors")}</h3>{help_btn("help-zone-room",T("cz.roomSensors"))}</header>
          <div class="subs cols-2">
            <div class="sub">
              <h4>{T("cz.room")}</h4>
              {member}
              {switch(f"z{i}_enabled",T("cz.enabled"),"",st!="off")}
              <div class="field"><label for="z{i}_name">{T("cz.name")}</label><input class="input" id="z{i}_name" name="z{i}_name" value="{n}" maxlength="24"></div>
              <div class="field"><label for="z{i}_area">{T("cz.area")}</label>{stepper(f"z{i}_area",area,0,200,0.5,"m²",T("cz.area"))}</div>
              <div class="field"><label for="z{i}_merge">{T("cz.group")}<span class="hint">{T("cz.groupHint")}</span></label><select class="select" id="z{i}_merge" name="z{i}_merge">{merge}</select></div>
            </div>
            <div class="sub">
              <h4>{T("cz.sensors")}</h4>
              <div class="field"><span class="label">{T("cz.tempFrom")}</span>{seg(f"z{i}_src",[("probe",T("cz.probe")),("ble",T("cz.ble"))],src,T("cz.tempFrom"))}</div>
              <div class="field">
                <label for="z{i}_ble">{T("cz.bleMac")}<span class="hint">{T("cz.bleHint").replace("&","&amp;")}</span></label>
                <div class="pair wide-first">
                  <input class="input" id="z{i}_ble" name="z{i}_ble" placeholder="AA:BB:CC:DD:EE:FF" pattern="^([0-9A-Fa-f]{{2}}:){{5}}[0-9A-Fa-f]{{2}}$" autocomplete="off" spellcheck="false">
                  <button type="button" class="btn" data-action="ble-scan" data-zone="{i}">{T("cz.scan")}</button>
                </div>
              </div>
              <div class="field"><label for="z{i}_ret">{T("cz.returnSensor")}</label>{probes(i,f"z{i}_ret")}</div>
            </div>
          </div>
          <footer class="panel-foot"><button class="btn primary" type="submit">{T("cz.saveRoom")}</button></footer>
        </form>

        <form class="panel c6" data-save="zone/{i}/floor">
          <header class="panel-head"><h3>{T("cz.floorWeather")}</h3>{help_btn("help-zone-floor",T("cz.floorWeather"))}</header>
          <div class="subs cols-2">
            <div class="sub">
              <h4>{T("cz.floorPipes")}</h4>
              <div class="field"><label for="z{i}_spacing">{T("cz.spacing")}</label>{stepper(f"z{i}_spacing",sp,50,300,25,"mm",T("cz.spacing"),dec=0)}</div>
              <div class="field"><label for="z{i}_pipe">{T("cz.pipeType")}</label><select class="select" id="z{i}_pipe" name="z{i}_pipe">{pipes}</select></div>
              <div class="field"><label for="z{i}_slab">{T("cz.slab")}</label><select class="select" id="z{i}_slab" name="z{i}_slab"><option value="unset">{T("cz.slabUnset")}</option><option value="cast_concrete">{T("cz.slabConcrete")}</option><option value="screed">{T("cz.slabScreed")}</option><option value="dry_plates">{T("cz.slabDry")}</option><option value="timber_joists">{T("cz.slabTimber")}</option></select></div>
              <div class="field"><label for="z{i}_covering">{T("cz.covering")}</label><select class="select" id="z{i}_covering" name="z{i}_covering"><option value="unset">{T("cz.coverUnset")}</option><option value="tile_stone">{T("cz.coverTile")}</option><option value="vinyl_linoleum">{T("cz.coverVinyl")}</option><option value="parquet_laminate">{T("cz.coverParquet")}</option><option value="carpet">{T("cz.coverCarpet")}</option></select></div>
              <div class="field"><label for="z{i}_thick">{T("cz.thickness")}</label>{stepper(f"z{i}_thick",0,0,15,0.5,"cm",T("cz.thickness"))}</div>
              <div class="field"><label for="z{i}_lead">{T("cz.lead")}</label>{stepper(f"z{i}_lead",3.0,0,12,0.5,H,T("cz.lead"))}</div>
            </div>
            <div class="sub">
              <h4>{T("cz.weather")}</h4>
              <div class="field"><span class="label">{T("cz.walls")}</span>{compass(i,walls)}</div>
              <div class="field"><label for="z{i}_wind">{T("cz.wind")}</label>{stepper(f"z{i}_wind",1.0 if walls else 0.0,0,2,0.1,"×",T("cz.wind"))}</div>
              <div class="field"><label for="z{i}_solar">{T("cz.solar")}</label>{stepper(f"z{i}_solar",0.6 if "s" in walls else 0.2,0,2,0.1,"×",T("cz.solar"))}</div>
            </div>
          </div>
          <footer class="panel-foot"><button class="btn primary" type="submit">{T("cz.saveFloor")}</button></footer>
        </form>

        <form class="panel" data-save="zone/{i}/motor">
          <header class="panel-head"><h3>{T("cz.motor")}</h3>{help_btn("help-zone-motor",T("cz.motor"))}<span class="badge {'warn' if fault else 'ok'}">{L[0]}</span></header>
          <div class="subs cols-2">
            <dl class="kv"><div><dt>{T("cz.ripples")}</dt><dd>{L[1]}</dd></div><div><dt>{T("cz.factors")}</dt><dd>{L[2]}</dd></div></dl>
            <dl class="kv"><div><dt>{T("zdash.preheatAdv")}</dt><dd>{L[3]} °C</dd></div><div><dt>{T("cz.lastFault")}</dt><dd class="{'bad' if fault else ''}">{L[4]}</dd></div></dl>
          </div>
          <footer class="panel-foot">
            <button class="btn" type="submit" name="action" value="reset_fault"{'' if fault else ' disabled'}>{T("common.resetFault")}</button>
            <details class="confirm">
              <summary class="btn danger">{T("cz.relearn")}</summary>
              <p class="note">{T("cz.relearnNote",z=zid)}</p>
              <button class="btn danger" type="submit" name="action" value="reset_relearn">{T("cz.relearnConfirm",z=zid)}</button>
            </details>
          </footer>
        </form>
      </section>'''

    views=dash_sys+"".join(dash_zone(z) for z in Z)+conf_sys+"".join(conf_zone(z) for z in Z)
    views+=help_pop("help-zone-room","help.zoneRoom","lune-v6/docs/Manual.md#zone-room")
    views+=help_pop("help-zone-floor","help.zoneFloor","lune-v6/docs/Manual.md#zone-floor")
    views+=help_pop("help-zone-motor","help.zoneMotor","lune-v6/docs/Manual.md#zone-motor")

    # ---- sprogvælger (kun hvis >1 sprog)
    cur=T.meta("_lang")
    if len(langs)>1:
        links="".join(f'<a href="{lang_urls[c.meta("_lang")]}" hreflang="{c.meta("_lang")}" lang="{c.meta("_lang")}" title="{c.meta("_name")}"{" aria-current=\"true\"" if c.meta("_lang")==cur else ""}>{c.meta("_short")}</a>' for c in langs)
        langnav=f'<nav class="lang" aria-label="{T("lang.label")}">{links}</nav>'
    else:
        langnav=""

    # Dynamiske strenge til binderen (statusser, relative tider, gem-beskeder)
    rt={k:T(k) for k in ("state.calling","state.idle","state.fault","state.off","tile.fault","badge.calling","sys.dt","sys.dtstate","dash.sys.sub","common.days","rt.savedOk","rt.saveFailed","rt.secondsAgo","rt.minutesAgo","rt.offline","common.learned","common.needsLearning","device.copyDiag","device.copied","device.sample")}
    rt["_dec"]=T.meta("_dec"); rt["_lang"]=cur
    rt_json=json.dumps(rt,ensure_ascii=False,separators=(",",":"))

    LOGO='<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="var(--fg)"/><path d="M10 22V12M14 22V10M18 22V13M22 22V11" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round"/></svg>'
    I_DASH='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14a8 8 0 0 1 16 0"/><path d="M12 14l4-4"/><circle cx="12" cy="14" r="1.2"/></svg>'
    I_CONF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>'
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

<!-- TILSTAND — før .app. Rækkefølge: tilstand → omfang → tema -->
<input class="state" type="radio" name="mode" id="m-dash" checked aria-label="{T("mode.dash")}">
<input class="state" type="radio" name="mode" id="m-conf" aria-label="{T("mode.conf")}">
<input class="state" type="radio" name="scope" id="s-sys" checked aria-label="{T("scope.manifold")}">
{"".join(f'<input class="state" type="radio" name="scope" id="s-z{k}" aria-label="{T("scope.zone",n=k)}">' + chr(10) for k in range(1,7))}<input class="state" type="checkbox" id="theme" aria-label="{T("theme.toggle")}">

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/></symbol>
  <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 18z"/></symbol>
  <symbol id="i-partly" viewBox="0 0 24 24"><path d="M8 5V3.5M3.5 8H2M4.6 4.6l-1-1M11.4 4.6l1-1"/><path d="M5.4 10.4A3.5 3.5 0 0 1 11 6.6"/><path d="M9 19h8a3.5 3.5 0 0 0 0-7 4.8 4.8 0 0 0-9.2 1.3A2.9 2.9 0 0 0 9 19z"/></symbol>
  <symbol id="i-rain" viewBox="0 0 24 24"><path d="M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></symbol>
</svg>

<div class="app">
  <div class="top">
    <div class="wrap">
      <header class="header">
        <details class="device">
          <summary>{LOGO}<span class="name"><b>Lune V6</b><small data-bind="device.about.place">{T("device.sample")}</small></span><span class="caret" aria-hidden="true"></span></summary>
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
            <nav aria-label="{T("nav.devices")}">
              <a href="http://192.168.20.106/" aria-current="page"><i></i>Lune V6<small>192.168.20.106 · {T("device.this")}</small></a>
              <a href="http://192.168.20.186/"><i></i>Lune Touch<small>192.168.20.186</small></a>
            </nav>
          </div>
        </details>

        <nav class="mode" aria-label="{T("mode.label")}">
          <label for="m-dash">{I_DASH}{T("mode.dash")}</label>
          <label for="m-conf">{I_CONF}{T("mode.conf")}</label>
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

      {strip}
    </div>
  </div>

  <main class="content wrap">{views}
  </main>
</div>

<!-- Strenge til binderen: statusser og beskeder der skrives ved runtime -->
<script type="application/json" id="i18n">{rt_json}</script>

<!-- Progressive enhancement: +/−, luk enhedsmenu, hjælp-popover nær ?, filnavn, submit-hook -->
<script>
(function(){{
var helpBtn=null;
function placeHelp(pop, btn){{
  if(!pop||!btn||window.matchMedia('(max-width:599.98px)').matches) return;
  var r=btn.getBoundingClientRect(), gap=8;
  pop.style.position='fixed';
  pop.style.inset='unset';
  pop.style.right='auto';
  pop.style.bottom='auto';
  pop.style.margin='0';
  // Mål efter layout i top-lag
  pop.style.top='0px';
  pop.style.left='0px';
  var w=pop.offsetWidth||280, h=pop.offsetHeight||120;
  var left=Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth-w-8));
  var top=r.bottom+gap;
  if(top+h>window.innerHeight-8) top=Math.max(8, r.top-h-gap);
  pop.style.top=top+'px';
  pop.style.left=left+'px';
}}
document.addEventListener('pointerdown',function(e){{
  var h=e.target.closest&&e.target.closest('.help-btn');
  if(h) helpBtn=h;
}}, true);
document.addEventListener('beforetoggle',function(e){{
  if(e.newState!=='open'||!e.target.classList||!e.target.classList.contains('help-pop')) return;
  var id=e.target.id;
  var btn=(helpBtn&&helpBtn.getAttribute('popovertarget')===id)?helpBtn:null;
  if(!btn&&document.activeElement&&document.activeElement.getAttribute&&document.activeElement.getAttribute('popovertarget')===id)
    btn=document.activeElement;
  if(!btn) btn=document.querySelector('[popovertarget="'+id+'"]');
  if(btn){{ helpBtn=btn; placeHelp(e.target, btn); }}
}}, true);
document.addEventListener('toggle',function(e){{
  if(e.newState!=='open'||!e.target.classList||!e.target.classList.contains('help-pop')) return;
  var id=e.target.id;
  var btn=(helpBtn&&helpBtn.getAttribute('popovertarget')===id)?helpBtn:document.querySelector('[popovertarget="'+id+'"]');
  if(btn) placeHelp(e.target, btn);
}}, true);
document.addEventListener('click',function(e){{
  var h=e.target.closest&&e.target.closest('.help-btn');
  if(h){{
    helpBtn=h;
    var id=h.getAttribute('popovertarget');
    var pop=id&&document.getElementById(id);
    if(pop) requestAnimationFrame(function(){{ if(pop.matches(':popover-open')) placeHelp(pop,h); }});
  }}
  var b=e.target.closest('[data-step]');
  if(b&&!b.disabled){{var i=b.parentNode.querySelector('input');b.dataset.step>0?i.stepUp():i.stepDown();i.dispatchEvent(new Event('change',{{bubbles:true}}));}}
  var d=document.querySelector('.device[open]');if(d&&!d.contains(e.target))d.open=false;
}});
document.addEventListener('change',function(e){{
  var inp=e.target; if(!inp||inp.type!=='file') return;
  var lab=inp.closest('label.file'); if(!lab) return;
  var name=lab.querySelector('.file-name'); if(!name) return;
  name.textContent=(inp.files&&inp.files[0])?inp.files[0].name:(name.dataset.empty||'');
}});
document.addEventListener('submit',function(e){{e.preventDefault();document.dispatchEvent(new CustomEvent('lune:save',{{detail:{{key:e.target.dataset.save,data:new FormData(e.target,e.submitter)}}}}));}});
}})();
</script>
'''
    if include_binder:
        mock_boot = '<script>window.LV6_DASHBOARD_CONFIG={mock:true};</script>\n' if mock else ''
        binder_tag = f'{mock_boot}<script src="{binder_src}" defer></script>'
    else:
        binder_tag = '<!-- preview: static demo data, no binder -->'
    return page + f'''{binder_tag}
</body>
</html>
'''

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
