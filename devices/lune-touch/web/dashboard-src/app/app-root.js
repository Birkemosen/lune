import { renderHeader, bindHeader } from './header.js';
import { refreshAll } from '../core/api.js';
import { state, subscribe } from '../core/store.js';
import { bindActions, renderCommands, renderDiagnostics, renderForecast, renderManifolds, renderOverview, renderSettings, renderZones } from '../components/views.js';

const css = `
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");
:root {
  --accent:#ff8531; --blue:#7aa7ce; --bg:#00131d; --surface:#002f45; --card:#021d2b;
  --border:rgba(120,146,200,.24); --text:#fff; --text-strong:#fff4e6; --muted:rgba(247,233,221,.74);
  --ok:#79d17e; --warn:#ffa600; --danger:#ff6361; --disabled:#6e7e96;
  --font-ui:"Source Sans 3",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --font-display:"Montserrat",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
*{box-sizing:border-box} html{font-size:13px} body{margin:0;font-family:var(--font-ui);background:radial-gradient(1200px 720px at 92% -10%,rgba(255,133,49,.13),transparent 58%),radial-gradient(1100px 760px at 12% -8%,rgba(122,167,206,.11),transparent 62%),var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
button,input,select{font:inherit}.shell{width:min(1320px,100%);margin:0 auto;padding:18px}.topbar{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:18px;background:rgba(0,47,69,.34);box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 18px 38px rgba(0,0,0,.28)}
.top-menu{display:flex;flex-wrap:wrap;gap:7px}.menu-link,.btn{border:1px solid rgba(120,146,200,.30);background:rgba(124,155,208,.10);color:var(--text);border-radius:11px;padding:9px 11px;cursor:pointer;font-weight:700}.menu-link.active,.btn:hover{background:var(--accent);border-color:var(--accent);color:#00202e}.brand{text-align:center}.brand-title{font-family:var(--font-display);font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:var(--accent)}.brand-sub{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.8px}.top-meta{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.meta-chip{border:1px solid var(--border);background:rgba(124,155,208,.10);border-radius:14px;padding:7px 10px;font-weight:800}.meta-chip.ok,.ok{color:var(--ok)}.meta-chip.warn,.warn{color:var(--warn)}.muted{color:var(--disabled)}
.panel{margin-top:14px;border:1px solid var(--border);border-radius:18px;background:rgba(0,47,69,.26);box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 20px 48px rgba(0,0,0,.28);padding:18px}.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}h2,h3{font-family:var(--font-display);margin:0;color:var(--text-strong)}h2{font-size:1.24rem}h3{font-size:.84rem;text-transform:uppercase;letter-spacing:1.1px;color:var(--accent);margin-bottom:8px}.note{color:var(--muted)}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.stat,.card,.zone-card{border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,rgba(2,29,43,.96),rgba(2,23,35,.92));padding:14px}.stat span{display:block;color:var(--muted);text-transform:uppercase;font-size:.7rem;font-weight:800;letter-spacing:.8px}.stat strong{display:block;font-size:1.8rem;font-family:var(--font-display);margin-top:3px}.stat em{font-style:normal;color:var(--muted)}
	.zone-matrix{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.zone-card{padding:9px 10px;border-radius:12px}.zone-card.ok{border-color:rgba(121,209,126,.42)}.zone-card.warn{border-color:rgba(255,166,0,.5)}.zone-top,.zone-bottom{display:flex;justify-content:space-between;gap:8px}.zone-top strong{font-size:1rem}.zone-top span{font-family:var(--font-display);font-weight:800}.zone-bottom{margin-top:6px;color:var(--muted);font-size:.82rem}.data-table{display:grid;gap:1px;overflow:auto;border:1px solid var(--border);border-radius:14px}.tr{display:grid;grid-template-columns:1.1fr .7fr .7fr .7fr .9fr 1fr;gap:10px;align-items:center;background:rgba(2,29,43,.84);padding:9px 11px;min-width:820px}.tr.head{background:rgba(255,133,49,.14);color:var(--text-strong);font-weight:800;text-transform:uppercase;font-size:.75rem}.card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.slim{padding:5px 8px;font-size:.82rem}.danger{border-color:rgba(255,99,97,.42);color:#ffd9d9}.input{display:block;margin:8px 0 12px;width:100%;border:1px solid var(--border);background:rgba(124,155,208,.10);color:var(--text);border-radius:10px;padding:9px 10px}.inline-form{display:grid;grid-template-columns:1fr 1fr .7fr .7fr auto;gap:8px;align-items:end;margin:0 0 14px}.mini-input{margin:0}.error{margin-top:14px;border:1px solid rgba(255,99,97,.5);background:rgba(255,99,97,.12);border-radius:12px;padding:10px;color:#ffd9d9}
	.forecast-location{grid-template-columns:1fr 1fr auto auto;margin-top:12px}
	.tr.commands{grid-template-columns:.9fr .7fr 1fr .75fr .7fr .7fr .65fr .7fr;min-width:1020px}
	@media(max-width:900px){.topbar{grid-template-columns:1fr}.top-meta{justify-content:center}.top-menu{justify-content:center}.stat-grid,.card-grid,.two-col,.zone-matrix,.inline-form{grid-template-columns:1fr}}
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

export function mountApp(root) {
  if (!document.getElementById('lt-style')) {
    const style = document.createElement('style');
    style.id = 'lt-style';
    style.textContent = css;
    document.head.appendChild(style);
  }
  function render() {
    root.innerHTML = `<div class="shell">${renderHeader()}${state.error ? `<div class="error">${state.error}</div>` : ''}${view()}</div>`;
    bindHeader(root);
    bindActions(root);
  }
  subscribe(render);
  render();
  refreshAll();
  setInterval(refreshAll, 5000);
}
