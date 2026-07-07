import { renderHeader, bindHeader } from './header.js';
import { refreshAll, refreshSection } from '../core/api.js';
import { state, subscribe } from '../core/store.js';
import { bindActions, renderCommands, renderDiagnostics, renderForecast, renderManifolds, renderOverview, renderSettings, renderZones } from '../components/views.js';

const css = `
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");
:root {
  --accent:#ff8531; --blue:#7aa7ce; --series-warm:#ff8531; --series-cool:#7aa7ce; --series-solar:#ffc14d;
  --bg:#00131d; --surface:#002f45; --card:#021d2b;
  --border:rgba(120,146,200,.28); --border-soft:rgba(120,146,200,.18);
  --text:#fff; --text-strong:#fff4e6; --muted:rgba(247,233,221,.74); --text-faint:rgba(229,216,222,.56);
  --ok:#79d17e; --warn:#ffa600; --danger:#ff6361; --disabled:#6e7e96; --axis:rgba(233,222,210,.82);
  --panel-bg:rgba(0,47,69,.34); --control-bg:rgba(124,155,208,.10); --control-border:rgba(120,146,200,.30);
  --panel-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 12px 30px rgba(0,0,0,.32);
  --font-ui:"Source Sans 3",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --font-display:"Montserrat",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
*{box-sizing:border-box} html{font-size:13px} body{margin:0;font-family:var(--font-ui);background:radial-gradient(1400px 760px at 92% -14%,rgba(255,133,49,.12),transparent 56%),radial-gradient(1200px 820px at 18% -8%,rgba(122,167,206,.10),transparent 64%),var(--bg);color:var(--text);line-height:1.45;-webkit-font-smoothing:antialiased}
button,input,select{font:inherit}.shell{width:min(1400px,100%);min-height:100vh;margin:0 auto;padding:18px;display:grid;grid-template-columns:238px minmax(0,1fr);gap:18px}.main{min-width:0;padding-bottom:18px}.sidebar{position:sticky;top:18px;align-self:start;min-height:calc(100vh - 36px);display:flex;flex-direction:column;gap:18px;padding:16px;border:1px solid var(--border);border-radius:8px;background:linear-gradient(180deg,rgba(0,47,69,.48),rgba(0,31,46,.34));box-shadow:var(--panel-shadow)}
.top-menu{display:grid;gap:8px}.menu-link,.btn{border:1px solid var(--control-border);background:var(--control-bg);color:var(--text);border-radius:8px;padding:9px 11px;cursor:pointer;font-weight:800;letter-spacing:.4px}.menu-link{width:100%;text-align:left;text-transform:uppercase;font-size:.78rem}.menu-link.active,.btn:hover{background:var(--accent);border-color:var(--accent);color:#00202e}.btn:disabled{opacity:.45;cursor:wait}.brand{text-align:left;padding-bottom:4px;border-bottom:1px solid var(--border-soft)}.brand-title{font-family:var(--font-display);font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:var(--accent)}.brand-sub{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.8px}.top-meta{margin-top:auto;display:grid;gap:8px}.meta-chip{display:inline-flex;align-items:center;min-height:34px;border:1px solid var(--border);background:var(--control-bg);border-radius:8px;padding:6px 10px;font-weight:800}.meta-chip.ok,.ok{color:var(--ok)}.meta-chip.warn,.warn{color:var(--warn)}.muted{color:var(--disabled)}
.panel{padding:0}.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}h2,h3{font-family:var(--font-display);margin:0;color:var(--text-strong)}h2{font-size:1.24rem}h3{font-size:.84rem;text-transform:uppercase;letter-spacing:1.1px;color:var(--accent);margin-bottom:8px}.note{color:var(--muted)}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}.stat,.card,.zone-card,.chart-card{border:1px solid var(--border);border-radius:8px;background:linear-gradient(180deg,rgba(2,29,43,.96),rgba(2,23,35,.92));box-shadow:var(--panel-shadow);padding:14px}.stat span{display:block;color:var(--muted);text-transform:uppercase;font-size:.7rem;font-weight:800;letter-spacing:.8px}.stat strong{display:block;font-size:1.8rem;font-family:var(--font-display);margin-top:3px}.stat em{font-style:normal;color:var(--muted)}
.zone-matrix{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.zone-card{padding:9px 10px;min-height:74px}.zone-card.ok{border-color:rgba(121,209,126,.42)}.zone-card.warn{border-color:rgba(255,166,0,.5)}.zone-top,.zone-bottom{display:flex;justify-content:space-between;gap:8px}.zone-top strong{font-size:1rem}.zone-top span{font-family:var(--font-display);font-weight:800}.zone-bottom{margin-top:6px;color:var(--muted);font-size:.82rem}.resolver-note{display:block;margin-top:5px;color:var(--muted);font-size:.74rem;white-space:nowrap}.data-table{display:grid;gap:1px;overflow:auto;border:1px solid var(--border);border-radius:8px}.tr{display:grid;grid-template-columns:1.05fr .65fr .8fr .95fr .65fr .85fr .55fr .75fr 1fr;gap:10px;align-items:center;background:rgba(2,29,43,.84);padding:9px 11px;min-width:1180px}.tr.head{background:rgba(255,133,49,.14);color:var(--text-strong);font-weight:800;text-transform:uppercase;font-size:.75rem}.card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.split-main{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:14px}.stack{display:grid;gap:12px}.health-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:12px 0;border:1px solid var(--border-soft);border-radius:8px;overflow:hidden}.health-cell{background:rgba(124,155,208,.06);border:0;border-top:1px solid rgba(255,255,255,.06);padding:8px}.health-cell:nth-child(-n+3){border-top:0}.health-cell span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.7px;font-weight:800}.health-cell strong{display:block;margin-top:2px;font-family:var(--font-display);font-size:1.05rem;color:var(--text-strong)}.slim{padding:5px 8px;font-size:.82rem}.danger{border-color:rgba(255,99,97,.42);color:#ffd9d9}.input{display:block;margin:8px 0 12px;width:100%;border:1px solid var(--border);background:var(--control-bg);color:var(--text);border-radius:8px;padding:9px 10px}.inline-form{display:grid;grid-template-columns:1fr 1fr .7fr .7fr auto;gap:8px;align-items:end;margin:0 0 14px}.mini-input{margin:0}.check{display:flex;gap:6px;align-items:center;border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--muted)}.error{margin-top:14px;border:1px solid rgba(255,99,97,.5);background:rgba(255,99,97,.12);border-radius:8px;padding:10px;color:#ffd9d9}
.forecast-location{grid-template-columns:1fr 1fr auto auto;margin-top:12px}.tr.commands{grid-template-columns:.9fr .7fr 1fr .75fr .7fr .7fr .65fr .7fr;min-width:1020px}
.chart-card{position:relative;display:flex;flex-direction:column;gap:6px}.chart-head{display:flex;align-items:center;gap:9px}.chart-head::before{content:'';width:4px;height:13px;border-radius:2px;background:var(--accent)}.chart-title{color:var(--accent);font-size:.74rem;font-weight:800;letter-spacing:1.4px;text-transform:uppercase}.chart-sub{margin-left:auto;color:var(--text-faint);font-size:.7rem;font-weight:700}.chart-legend{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin:2px 0 6px}.legend-item{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:.7rem;font-weight:700}.legend-dot{width:10px;height:10px;border-radius:999px;border:2px solid currentColor;background:color-mix(in srgb,currentColor 30%,transparent)}.forecast-chart{width:100%;height:auto;display:block;border-radius:8px;background:rgba(0,32,46,.34);overflow:visible}.chart-grid{stroke:rgba(150,168,205,.14);stroke-width:1}.chart-axis{stroke:rgba(150,168,205,.34);stroke-width:1}.chart-tick{fill:var(--axis);font-size:11px}.chart-hour{fill:rgba(202,219,248,.78);font-family:Montserrat,sans-serif;font-size:9px;font-weight:600}.chart-empty{fill:var(--text-faint);font-size:13px}.chart-preload-line{stroke:var(--ok);stroke-width:1;stroke-dasharray:4 4;opacity:.72;vector-effect:non-scaling-stroke}.chart-preload-dot{fill:var(--ok);stroke:rgba(2,29,43,.96);stroke-width:1.5}.chart-preload-label{fill:var(--text-strong);font-size:10px;font-weight:800;paint-order:stroke;stroke:rgba(0,19,29,.78);stroke-width:3px}.readiness-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.readiness-chip{border:1px solid var(--border-soft);background:var(--control-bg);border-radius:8px;padding:10px}.readiness-chip span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.8px;font-weight:800}.readiness-chip strong{font-family:var(--font-display);font-size:1.05rem;color:var(--text-strong)}
.metric-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.metric-strip.compact{margin:8px 0 12px}.metric{min-width:0;border-top:1px solid var(--border);background:linear-gradient(180deg,rgba(124,155,208,.10),rgba(0,32,46,.10));padding:10px 0}.metric span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.75px;font-weight:800}.metric strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-display);font-size:1rem;color:var(--text-strong)}.diagnostics-layout,.settings-layout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.settings-head{grid-column:1/-1;margin-bottom:2px}.ops-panel,.settings-panel{border-top:1px solid var(--border);background:linear-gradient(180deg,rgba(2,29,43,.62),rgba(2,23,35,.36));padding:13px 0 0}.ops-panel.wide,.settings-panel.wide{grid-column:span 2}.ops-panel p,.settings-panel p{margin:5px 0;color:var(--muted)}.ops-panel .btn,.settings-panel .btn{margin-top:10px}.settings-panel .inline-form{grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:0}.diagnostics-table{margin-top:8px;border-radius:8px}.tr.diagnostics{grid-template-columns:.7fr .7fr .7fr .8fr 1.2fr;min-width:760px}.tr.events{grid-template-columns:.6fr .5fr .75fr 1.8fr;min-width:720px}.empty-row{background:rgba(2,29,43,.84);padding:11px;color:var(--muted)}
.action-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
@media(max-width:1100px){.shell{grid-template-columns:200px minmax(0,1fr)}.zone-matrix{grid-template-columns:repeat(3,minmax(0,1fr))}.split-main{grid-template-columns:1fr}.readiness-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.shell{display:block;padding:12px}.sidebar{position:static;min-height:0;margin-bottom:14px}.top-menu{grid-template-columns:repeat(3,minmax(0,1fr))}.top-meta{grid-template-columns:repeat(3,minmax(0,1fr))}.stat-grid,.card-grid,.two-col,.zone-matrix,.inline-form,.readiness-strip,.health-grid,.metric-strip,.diagnostics-layout,.settings-layout{grid-template-columns:1fr}.health-cell:nth-child(-n+3){border-top:1px solid rgba(255,255,255,.06)}.health-cell:first-child{border-top:0}.ops-panel.wide,.settings-panel.wide{grid-column:auto}}
@media(max-width:520px){.top-menu,.top-meta{grid-template-columns:1fr}.menu-link{text-align:center}}
`;

function view() {
  if (state.section === 'zones') return renderZones();
  if (state.section === 'manifolds') return renderManifolds();
  if (state.section === 'forecast') return renderForecast();
  if (state.section === 'commands') return renderCommands();
  if (state.section === 'settings') return renderSettings();
  if (state.section === 'diagnostics') return renderDiagnostics();
  return renderOverview();
}

function hasActiveEditor(root) {
  const el = document.activeElement;
  return !!el && root.contains(el) && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
}

function shouldAutoRefresh(root) {
  if (hasActiveEditor(root)) return false;
  return ['overview', 'manifolds', 'commands', 'diagnostics'].includes(state.section);
}

export function mountApp(root) {
  if (!document.getElementById('lt-style')) {
    const style = document.createElement('style');
    style.id = 'lt-style';
    style.textContent = css;
    document.head.appendChild(style);
  }
  function render() {
    root.innerHTML = `<div class="shell">${renderHeader()}<main class="main">${state.error ? `<div class="error">${state.error}</div>` : ''}${view()}</main></div>`;
    bindHeader(root);
    bindActions(root);
  }
  subscribe(render);
  render();
  refreshAll({ loading: true });
  setInterval(() => {
    if (shouldAutoRefresh(root)) refreshSection(state.section);
  }, 20000);
}
