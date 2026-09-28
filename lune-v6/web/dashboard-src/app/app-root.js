import { component, mountComponent, subscribe } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, subscribeDashboard, setSection, setSettingsPanel, setSelectedZone, zoneFriendly, zoneIdShort, zoneLabel, zoneTitleMarkup } from '../core/store.js';
import { localize, subscribeLanguage, t } from '../core/i18n.js';
import { gkey, key } from '../utils/keys.js';
import { fmtT, fmtV } from '../utils/format.js';
import { applyTheme } from '../core/theme.js';
import { isDevBuild } from '../utils/dev-build.js';
import { paintMark, manifoldMetaHtml, fmtDeg, zonePipeKind } from '../core/canvas.js';
import { heatDemandSummaryLine, heatingModeSummary, zoneControlStatusLabel } from '../utils/control-mode.js';
import { luneTouchLockup } from '../core/lune-mark.generated.js';
import { MANIFOLD_ROW_CSS, loopCellHtml, demandBarLevel } from '../core/lds-manifold-row.generated.js';
import { FORM_CSS, formShellHtml } from '../core/lds-form.generated.js';
import { INT_SPLIT_CSS, intSplitHtml } from '../core/lds-int-split.generated.js';

applyTheme();

const css = `
:root {
  --control-width:180px;
  --state-disabled:var(--disabled);
  --mono:var(--font-mono);
  --text:var(--text-main);
  --text-secondary:var(--text-muted);
  --muted:var(--text-muted);
  --border:var(--separator);
  --panel-border:var(--separator);
  --divider:var(--separator-soft);
  --card:var(--surface);
  --panel-bg-flat:var(--surface-raised);
  --panel-bg-vibrant:var(--surface-raised);
  --panel-shadow:none;
  --overlay-bg:color-mix(in srgb,var(--bg) 96%,transparent);
  --control-border-strong:color-mix(in srgb,var(--control-border) 100%,transparent);
  --control-border-hover:rgba(var(--accent-rgb),.5);
  --control-knob:var(--text-strong);
  --focus-ring-soft:var(--focus-ring);
  --focus-border:var(--accent);
  --accent-bg-soft:rgba(var(--accent-rgb),.12);
  --accent-border:rgba(var(--accent-rgb),.36);
  --accent-border-hover:rgba(var(--accent-rgb),.52);
  --accent-text-soft:var(--accent);
  --success-bg:color-mix(in srgb,var(--ok) 16%,transparent);
  --success-bg-soft:color-mix(in srgb,var(--ok) 10%,transparent);
  --success-border:color-mix(in srgb,var(--ok) 38%,transparent);
  --danger-bg:color-mix(in srgb,var(--danger) 16%,transparent);
  --danger-bg-soft:color-mix(in srgb,var(--danger) 10%,transparent);
  --danger-bg-strong:color-mix(in srgb,var(--danger) 22%,transparent);
  --danger-border:color-mix(in srgb,var(--danger) 42%,transparent);
  --danger-border-soft:color-mix(in srgb,var(--danger) 30%,transparent);
  --danger-border-strong:color-mix(in srgb,var(--danger) 56%,transparent);
  --danger-text:var(--danger);
  --warn-bg-soft:color-mix(in srgb,var(--warn) 10%,transparent);
  --warn-border:color-mix(in srgb,var(--warn) 38%,transparent);
  --blue:var(--info);
  --red:var(--danger);
  --series-cool-fill:color-mix(in srgb,var(--series-cool) 14%,transparent);
  --chart-axis:var(--text-muted);
  --flow-track:color-mix(in srgb,var(--text-muted) 70%,var(--bg));
  --flow-disabled:var(--disabled);
  --flow-unknown:var(--text-faint);
  --flow-return:var(--series-cool);
  --flow-label:var(--text-main);
  --flow-source-bg:var(--control-bg);
}
*,*::before,*::after{box-sizing:border-box} html{font-size:100%;scroll-behavior:smooth} body{margin:0;background:var(--bg);color:var(--text-main);font-family:var(--font-ui);line-height:1.45;-webkit-font-smoothing:antialiased} button,input,select{font:inherit} button,a,select,input{ -webkit-tap-highlight-color:transparent }
app-root{display:block}.app{min-height:100vh;position:relative}.shell{position:relative;z-index:1;display:grid;grid-template-columns:var(--sidebar-width) minmax(0,1fr);min-height:100vh}.side-panel{grid-column:1;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:18px 12px 14px;border-right:1px solid var(--separator);background:transparent;overflow:visible}.side-brand{display:flex;align-items:center;gap:8px;min-height:0;padding:6px 8px 16px;color:inherit;font:inherit;letter-spacing:0}.side-brand .lune-mark{width:var(--brand-lockup-w,80px);height:var(--brand-lockup-h,59px)}.side-subtitle{display:none}
.manifold-mark .lune-mark .pipe{stroke:var(--pipe-idle)!important;opacity:.42;animation:none!important;stroke-dasharray:none!important;filter:none!important}.side-nav-slot{display:flex;flex:1;min-height:0}.main-panel{grid-column:2;min-width:0}.hdr{position:sticky;top:0;z-index:20;padding:22px 36px 16px;border-bottom:1px solid var(--separator);background:var(--bg)}.view-panel{min-width:0;width:100%;margin:0;padding:var(--content-pad)}.ftr{margin-top:48px;color:var(--text-faint);font-size:.75rem}.sec{display:none}.sec.active{display:block}
.view-lead{max-width:720px;margin:0 0 28px;padding-bottom:24px;border-bottom:1px solid var(--separator)}.view-lead h2{margin:0;color:var(--text-strong);font-size:1.1rem;font-weight:650}.view-lead p{margin:6px 0 0;color:var(--text-muted);font-size:.92rem}
.status-summary{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(4,minmax(100px,1fr));gap:0;margin:0 0 24px;padding:20px 0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}.settings-readiness,.diagnostics-readiness{grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr))}.status-summary-main{padding-right:24px}.eyebrow{display:block;color:var(--text-faint);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.status-summary h2{margin:5px 0 4px;color:var(--text-strong);font-size:1.65rem;letter-spacing:-.025em}.status-summary p{margin:0;color:var(--text-muted);font-size:.9rem}.status-fact{padding:0 16px;border-left:1px solid var(--separator)}.status-fact strong{display:block;margin-top:5px;color:var(--text-strong);font-size:1.15rem;font-variant-numeric:tabular-nums}.status-fact small{display:block;margin-top:3px;color:var(--text-muted);font-size:.78rem}.status-ok{color:var(--state-ok)!important}.status-summary h2.status-ok{color:var(--text-strong)!important}.status-warn{color:var(--state-warn)!important}.status-danger{color:var(--state-danger)!important}
.attention{margin:0 0 24px;border-left:3px solid var(--state-warn);padding:13px 16px;background:rgba(245,158,11,.055)}.attention[hidden]{display:none}.attention strong{display:block;color:var(--text-strong);font-size:.9rem}.attention span{display:block;margin-top:3px;color:var(--text-muted);font-size:.85rem}
.content-group{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.content-group + .content-group{margin-top:24px}.group-title{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:58px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--separator)}.group-title-main{min-width:0}.group-title h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.group-title span{display:block;margin-top:2px;color:var(--text-muted);font-size:.78rem}.group-navigation{min-height:var(--control-height);padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.group-navigation:hover{background:rgba(var(--accent-rgb),.10)}.zone-grid{display:grid;grid-template-columns:1fr;gap:0;margin:0}
.zone-id-short{display:inline}.zone-id-long{display:none}@media(min-width:901px){.zone-id-short{display:none}.zone-id-long{display:inline}}.zone-label-compact .zone-id-short{display:inline!important}.zone-label-compact .zone-id-long{display:none!important}.zone-title-id{min-width:0}.zone-title-name{font-weight:500;color:var(--text-faint)}@media(max-width:900px){.zone-label-compact .zone-title-name,.mobile-zone-dock .zone-title-name{display:none}}
.zone-overview{margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-detail-heading{margin:0 0 12px;padding:0;border:0}.zone-detail-heading .eyebrow,.zone-detail-heading p{display:none}.zone-detail-heading h2{margin:4px 0 0;color:var(--text-strong);font-size:1.2rem;font-weight:650;letter-spacing:-.02em}.zones-detail-pane{min-width:0}.int-split>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mobile-zone-dock{display:none}
.zone-live{min-width:0}
.provision .form-actions:not(:has(button)){display:none}
.provision .zone-actuator-slot{margin-top:4px;padding-top:16px;border-top:1px solid var(--separator)}
.provision .ui-card,.provision .lds-settings-card{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;height:auto!important}
.provision .ui-card-title,.provision .lds-settings-card-title,.provision .ui-section,.provision .ui-form-banner,.provision .help-badge{display:none!important}
.provision .ui-row{display:grid;gap:6px;min-height:0;padding:0;margin:0 0 14px;border:0;align-items:stretch;color:var(--text-muted);font-size:.72rem;font-weight:650}
.provision .ui-label{color:var(--text-muted);font-size:.72rem;font-weight:650}
.provision .ui-sublabel{display:none}
.provision .ui-field{width:100%;display:block}
.provision .ui-input,.provision .ui-select,.provision .ble-input,.provision .ext-input{width:100%;max-width:none;height:var(--control-compact,32px)!important;min-height:var(--control-compact,32px)!important;text-align:left;margin:0;box-shadow:none}
.provision .btn-scan{width:auto;max-width:none;flex:0 0 auto;height:var(--control-compact,32px)!important;min-height:var(--control-compact,32px)!important;margin:0;box-shadow:none}
.provision .zone-sensor-card .ble-row{display:flex;gap:6px;align-items:center;margin-top:0}
.provision .zone-sensor-card .ble-row .ble-input{flex:1 1 auto;width:auto;min-width:0;font-family:var(--font-mono,ui-monospace,monospace);font-size:.78rem;letter-spacing:.02em}
.provision .zone-sensor-card .ui-note,.provision .zone-sensor-card .ext-age{margin:4px 0 0;color:var(--text-muted);font-size:.78rem;font-style:normal}
.provision .zone-actuator-slot .disclosure{border:0;border-radius:0;background:transparent;overflow:visible}
.provision .zone-actuator-slot .disclosure summary{min-height:var(--control-compact,32px);padding:0;color:var(--text-muted);font-size:.78rem;font-weight:650;text-transform:none;letter-spacing:0}
.provision .zone-actuator-slot .disclosure summary::after{content:'›';font-size:1.1rem}
.provision .zone-actuator-slot .disclosure[open] summary::after{transform:rotate(90deg)}
.provision .zone-actuator-slot .disclosure-body{padding:12px 0 0;border:0}
.provision .zone-actuator-slot .za-stats{display:flex;flex-wrap:wrap;gap:12px 20px;padding:0 0 12px}
.provision .zone-actuator-slot .za-stat{padding:0;border:0}
.provision .zone-actuator-slot .za-action{grid-template-columns:minmax(0,1fr) auto;min-height:var(--control-compact,32px);padding:6px 0}
.provision .zone-actuator-slot .za-btn{min-width:0;height:var(--control-compact,32px);min-height:var(--control-compact,32px);padding:0 10px;font-size:.78rem}
.zone-kicker{margin:0;color:var(--text-muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
@media(min-width:901px){
  .shell.nav-collapsed{grid-template-columns:var(--sidebar-collapsed) minmax(0,1fr)}
  .shell.nav-collapsed .side-subtitle,.shell.nav-collapsed .v6-nav-heading,.shell.nav-collapsed .menu-label,.shell.nav-collapsed .side-brand .product,.shell.nav-collapsed .lds-live-status,.shell.nav-collapsed .lds-nav-switch,.shell.nav-collapsed .nav-switch{display:none}
  .shell.nav-collapsed .v6-side-link{justify-content:center;padding:0 8px}
  .shell.nav-collapsed .side-brand{justify-content:center;padding-left:0;padding-right:0;gap:0}
  .shell.nav-collapsed .side-brand .lune-mark{width:48px;height:36px}
  .shell.nav-collapsed .v6-side-link .dot{margin:0 auto}
}
.mobile-zone-dock .zone-chipstrip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;flex:1;min-width:0;padding:3px;border-radius:11px;background:rgba(255,255,255,.04)}
.mobile-zone-dock .zone-chip{min-width:0;min-height:var(--control-height,44px);padding:0 6px;border:0;border-radius:8px;background:transparent;color:var(--text-muted);font:inherit;font-size:.72rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.mobile-zone-dock .zone-chip:hover{color:var(--text-strong);background:var(--control-bg-hover)}
.mobile-zone-dock .zone-chip[aria-selected="true"]{background:var(--fill-forest);color:var(--text-strong)}
.zone-picker-field{display:none}
.disclosure{border:0;border-radius:0;background:transparent;overflow:visible}.disclosure + .disclosure{margin-top:0;border-top:1px solid var(--separator)}.disclosure summary{display:flex;align-items:center;justify-content:space-between;min-height:var(--control-height);padding:14px 0;color:var(--text-strong);cursor:pointer;list-style:none;font-size:.95rem;font-weight:650}.disclosure summary::-webkit-details-marker{display:none}.disclosure summary::after{content:'›';color:var(--text-muted);font-size:1.2rem;transition:transform .16s ease}.disclosure[open] summary::after{transform:rotate(90deg)}.disclosure summary:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}.disclosure summary small{margin-left:auto;margin-right:14px;color:var(--text-muted);font-size:.78rem;font-weight:400}.disclosure-body{padding:0 0 18px;border:0}
.overview-details,.settings-layout,.diagnostics-layout{display:grid;gap:0;padding-top:8px;border-top:1px solid var(--separator)}.overview-attention,.diagnostics-attention{width:100%;border:0;border-left:3px solid var(--state-warn);border-radius:0;text-align:left;color:inherit;cursor:pointer}.overview-attention:hover,.diagnostics-attention:hover{background:rgba(var(--accent-rgb),.09)}.settings-panel{display:none;gap:22px}.settings-panel.is-active{display:grid}.settings-panel-block + .settings-panel-block{margin-top:8px;padding-top:18px;border-top:1px solid var(--separator)}.settings-panel-block h3{margin:0 0 4px;color:var(--text-strong);font-size:.95rem;font-weight:650}.settings-panel-block p{margin:0 0 12px;color:var(--text-muted);font-size:.82rem}.settings-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:0 0 12px}.settings-panel-head .settings-panel-copy{min-width:0;flex:1 1 auto}.settings-panel-head .settings-panel-copy h3{margin:0 0 4px}.settings-panel-head .settings-panel-copy p{margin:0;color:var(--text-muted);font-size:.82rem}.settings-panel-toggle{flex:0 0 auto;padding-top:2px;display:flex;align-items:center}.settings-panel-head--pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(12rem,1fr);gap:16px 28px;align-items:start}.settings-panel-pair{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;min-width:0}.settings-panel-pair .settings-panel-copy{flex:1 1 auto}.settings-panel-block--toggle.is-collapsed .settings-panel-body{display:none}.settings-panel-block--probes.is-collapsed .return-temp-slot{display:none}.settings-panel-block--probes.is-collapsed .settings-panel-head{margin-bottom:12px}.settings-panel-block--toggle.is-collapsed .settings-panel-head{margin-bottom:0}@media(max-width:720px){.settings-panel-head--pair{grid-template-columns:1fr}}.settings-disclosure>.disclosure-body,.diagnostics-disclosure>.disclosure-body{padding:0 0 18px}.settings-disclosure .ui-card,.settings-disclosure .connectivity-card,.diagnostics-disclosure .ui-card,.diagnostics-disclosure .settings-card,.diagnostics-disclosure .logs-view,.diagnostics-disclosure .diag-zone-motor,.diagnostics-disclosure .connectivity-card,.diagnostics-disclosure .diag-i2c{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.settings-disclosure .ui-card-title,.settings-disclosure .help-badge,.settings-disclosure .connectivity-card .card-title{display:none}.settings-disclosure .ui-row{display:grid;gap:6px;min-height:0;padding:0 0 12px;border:0;align-items:stretch}.settings-disclosure .ui-label{color:var(--text-muted);font-size:.72rem;font-weight:650}.settings-disclosure .ui-field{width:100%;display:block}.settings-disclosure .ui-input,.settings-disclosure .ui-select,.settings-disclosure .ui-btn,.settings-disclosure button:not(.lds-nav-switch):not(.nav-switch),.diagnostics-disclosure button:not(.lds-nav-switch):not(.nav-switch),.diagnostics-disclosure select,.diagnostics-disclosure input{min-height:var(--control-compact,32px);height:var(--control-compact,32px)}.settings-disclosure .lds-nav-switch,.settings-disclosure .nav-switch,.diagnostics-disclosure .lds-nav-switch,.diagnostics-disclosure .nav-switch{width:34px;height:20px;min-height:20px;min-width:34px;padding:0;flex:0 0 auto}.settings-disclosure .ui-input,.settings-disclosure .ui-select{width:100%;max-width:28rem;text-align:left}.settings-disclosure .touch-approve{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--text-on-accent)!important}.settings-disclosure .touch-disconnect{background:transparent!important}.diagnostics-disclosure .card-title,.diagnostics-disclosure .ui-card-title{color:var(--text-faint)!important;font-size:.68rem!important;font-weight:750!important;letter-spacing:.1em!important;text-transform:uppercase!important;border:0!important;padding:0 0 10px!important;margin:0 0 8px!important}.diagnostics-disclosure .logs-stream{height:min(420px,50vh);background:transparent;border:1px solid var(--separator);box-shadow:none}.diagnostics-disclosure.danger-zone{margin-top:12px;border-top:1px solid color-mix(in srgb,var(--danger) 35%,var(--separator))}.diagnostics-disclosure.danger-zone>summary{color:var(--danger-text)}
.settings-readiness,.diagnostics-readiness{display:none}
.help-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.help-item{display:block;padding:18px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-main);text-decoration:none}.help-item:hover{border-color:rgba(var(--accent-rgb),.45)}.help-item strong{display:block;color:var(--text-strong);font-size:.95rem}.help-item p{margin:5px 0 0;color:var(--text-muted);font-size:.83rem}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,.zone-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}@media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}@media (prefers-contrast:more){:root{--separator:rgba(230,238,250,.28);--text-muted:rgba(239,244,252,.82);--text-faint:rgba(231,239,250,.68)}}
:root[data-color-scheme="light"] .side-panel{background:rgba(17,24,39,.018)}
:root[data-color-scheme="light"] .attention{background:rgba(154,91,0,.07)}
:root[data-color-scheme="light"] .diagnostics-disclosure .logs-stream,
:root[data-color-scheme="light"] .diag-i2c,
:root[data-color-scheme="light"] .logs-stream{background:rgba(17,24,39,.045)}
:root[data-color-scheme="light"] .zone-card:hover{background:rgba(17,24,39,.035)}
@media (prefers-contrast:more){:root[data-color-scheme="light"]{--separator:rgba(31,41,55,.32);--text-muted:rgba(24,30,39,.86);--text-faint:rgba(35,42,52,.72)}}
.overview-dashboard{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);column-gap:28px;border-top:1px solid var(--separator)}.dashboard-section{min-width:0;padding:24px 0;border-bottom:1px solid var(--separator)}.dashboard-hydraulic{grid-column:1/-1}.dashboard-activity{grid-column:1/-1}.dashboard-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:0 0 18px}.dashboard-section-head h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.dashboard-section-head p{margin:3px 0 0;color:var(--text-muted);font-size:.82rem}.overview-dashboard .graph-card,.overview-dashboard .timeline-card{margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.overview-dashboard .graph-card{margin-top:18px!important;padding-top:18px!important;border-top:1px solid var(--separator)!important}
.zone-configuration-groups{display:grid;gap:10px;width:100%}.zone-configuration-groups .ui-card{height:auto!important}.zone-configuration-groups .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot{width:100%}.zone-actuator-slot .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot .disclosure-body>.ui-section:first-child{margin-top:0}
@media(min-width:901px){.zone-configuration-groups{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"sensor room" "sensor coordination";align-items:stretch}.provision .zone-configuration-groups{grid-template-columns:1fr!important;grid-template-areas:none!important;align-items:start;gap:14px}.zone-room-slot{grid-area:room;min-width:0}.zone-sensor-slot{grid-area:sensor;min-width:0;display:flex;flex-direction:column}.zone-coordination-slot{grid-area:coordination;min-width:0}.provision .zone-room-slot,.provision .zone-sensor-slot,.provision .zone-coordination-slot{grid-area:auto!important;display:block}.zone-sensor-slot>.ui-card{flex:1 1 auto;align-self:stretch;height:auto!important}.provision .zone-sensor-slot>.ui-card{height:auto!important}}
@media(max-width:900px){.shell{display:block;padding-bottom:78px}.shell.has-zone-dock{padding-bottom:132px}.main-panel{min-width:0}.side-panel{position:fixed;z-index:40;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:auto;padding:7px;border:1px solid var(--separator);border-radius:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);box-shadow:0 10px 32px rgba(0,0,0,.32);overflow:visible}.side-brand,.side-subtitle{display:none}.side-nav-slot,.side-nav-slot hv6-sidebar{flex:0 0 auto;min-height:auto}.mobile-zone-dock{display:flex;align-items:center;gap:4px;margin:0 0 6px;padding:0 0 6px;border-bottom:1px solid var(--separator)}.mobile-zone-dock[hidden]{display:none!important}.zone-overview{margin-bottom:16px}.manifold{grid-template-columns:1fr!important}.manifold-mark{margin:0 auto}.manifold .zone-overview-strip,.manifold .loops,.zone-overview-strip{grid-template-columns:repeat(3,minmax(0,1fr))!important}.manifold-meta{text-align:left}.zone-overview-strip .loop{pointer-events:none;cursor:default}.hdr{padding:9px 14px}.view-panel{width:100%;padding:24px 16px 48px}.status-summary{grid-template-columns:1fr 1fr;gap:16px}.status-summary-main{grid-column:1/-1;padding:0 0 12px;border-bottom:1px solid var(--separator)}.status-fact{padding:0;border:0}.zone-card{grid-template-columns:minmax(120px,1fr) 90px 90px 28px;gap:10px}.zone-card .zc-valve{display:none}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:3}.zone-card::after{grid-column:4}.zone-detail-secondary,.help-list{grid-template-columns:1fr}}
@media(max-width:900px){.overview-dashboard{grid-template-columns:1fr}.dashboard-hydraulic,.dashboard-activity{grid-column:1}}
@media(max-width:900px){.v6-toolbar h1{font-size:1.15rem}.v6-toolbar p{font-size:.78rem}.v6-toolbar-icon{display:none}.v6-live{font-size:0}.v6-live::before{width:8px;height:8px}.status-summary h2{font-size:1.35rem}.group-title{align-items:center}.group-title span{margin-top:4px}.zone-card{min-height:88px;grid-template-columns:minmax(0,1fr) 82px 28px}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:1;margin-top:51px}.zone-card::after{grid-column:3}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.mobile-zone-dock .zone-chip{font-size:.68rem}}
`;
injectStyle('hv6-app-root', css);
injectStyle('lds-manifold-row', MANIFOLD_ROW_CSS);
injectStyle('lds-form', FORM_CSS);
injectStyle('lds-int-split', INT_SPLIT_CSS);

const zonesCanvasHtml = intSplitHtml({
  liveHtml: `<div class="zone-live"><p class="zone-kicker">Comfort control</p><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-slot"></div></div>`,
  provisionHtml: formShellHtml({
    title: '<span class="provision-zone-title">Zone</span>',
    stack: `<section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section><div class="zone-actuator-slot"></div>`,
  }),
});

const template = () => `
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand lune-lockup" aria-label="Lune V6"><span data-live-mark="sidebar"></span><span class="product">V6</span></div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><article class="manifold" data-overview-manifold><div class="manifold-mark" data-live-mark="overview"></div><div class="loops" data-overview-loops></div><div class="manifold-meta" data-overview-meta></div></article><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Flow history</h3><p>24-hour flow, return and demand.</p></div></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><article class="manifold zone-overview"><div class="manifold-mark" data-live-mark="zones"></div><div class="zone-overview-strip loops" role="group" aria-label="Select zone"></div><div class="manifold-meta" data-zone-meta></div></article>${zonesCanvasHtml}</section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout">
<div class="settings-panel settings-disclosure touch-settings is-active" data-panel="touch"><div class="disclosure-body touch-slot"></div></div>
<div class="settings-panel settings-disclosure" data-panel="hydraulics"><div class="settings-panel-block"><h3 data-i18n="settings.heatingMode.panelTitle">Heating mode</h3><p data-i18n="settings.heatingMode.panelSub">How valves behave when rooms reach setpoint</p><div class="heating-mode-slot"></div></div><div class="settings-panel-block settings-panel-block--probes" data-collapse-block="return-temp"><div class="settings-panel-head settings-panel-head--pair"><div class="settings-panel-copy"><h3 data-i18n="settings.manifold.panelTitle">Manifold and probes</h3><p data-i18n="settings.manifold.panelSub">Valve polarity and live 1-Wire readings</p></div><div class="settings-panel-pair"><div class="settings-panel-copy"><h3 data-i18n="settings.returnTemp.title">Return temperature</h3><p class="settings-probe-mode" data-probe-mode-hint data-i18n="settings.returnTemp.modeOff">2 probes · flow/return only</p></div><div class="settings-panel-toggle" data-toggle-host="return-temp"></div></div></div><div class="manifold-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="comfort"><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="ble-clock"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.bleClock.title">Room clocks</h3><p data-i18n="settings.bleClock.panelSub">Shelly BLU display time</p></div><div class="settings-panel-toggle" data-toggle-host="ble-clock"></div></div><div class="settings-panel-body ble-clock-slot" data-collapse-body="ble-clock"></div></div><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="preheat"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.preheat.title">Preheat absorption</h3><p data-i18n="settings.preheat.panelSub">Local handling of external preload</p></div><div class="settings-panel-toggle" data-toggle-host="preheat"></div></div><div class="settings-panel-body preheat-slot" data-collapse-body="preheat"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="motors"><div class="settings-panel-block"><h3>Motor configuration</h3><p>Drivers, profile and learning limits</p><div class="motor-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="device"><div class="settings-panel-block"><h3>Connection</h3><p>Network and firmware identity</p><div class="connectivity-slot"></div></div><div class="settings-panel-block"><h3>Firmware</h3><p>Version, updates and manual upload</p><div class="firmware-slot"></div></div><div class="settings-panel-block"><h3>Backup and restore</h3><p>Save or reapply local configuration</p><div class="backup-slot"></div></div><div class="settings-panel-block"><h3>Appearance</h3><p>Product colour</p><div class="appearance-slot"></div></div></div>
</div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I²C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-external-slot"></div><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Heating modes, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 · Local manifold controller</div></main></div></div></div>`;

component({ tag:'app-root', render:template, onMount(ctx, el) {
  el.querySelector('.hdr').appendChild(mountComponent('hv6-header'));
  el.querySelector('.side-nav-slot').appendChild(mountComponent('hv6-sidebar'));
  el.querySelector('.hydraulic-history-slot').appendChild(mountComponent('graph-widgets',{variant:'flow-return'}));
  el.querySelector('.timeline-slot').appendChild(mountComponent('zone-state-timeline'));
  el.querySelector('.connectivity-slot').appendChild(mountComponent('connectivity-card'));
  el.querySelector('.zone-detail-slot').appendChild(mountComponent('zone-detail',{zone:getDashboardValue('selectedZone')}));
  el.querySelector('.zone-sensor-slot').appendChild(mountComponent('zone-sensor-card'));
  el.querySelector('.zone-coordination-slot').appendChild(mountComponent('zone-coordination-card'));
  el.querySelector('.zone-actuator-slot').appendChild(mountComponent('zone-actuator-card'));
  el.querySelector('.zone-room-slot').appendChild(mountComponent('zone-room-card'));
  el.querySelector('.touch-slot').appendChild(mountComponent('settings-touch-card'));
  const manifoldCard = mountComponent('settings-manifold-card');
  el.querySelector('.manifold-slot').appendChild(manifoldCard);
  manifoldCard.querySelector('.return-temp-slot').appendChild(mountComponent('settings-return-temp-card'));
  el.querySelector('.heating-mode-slot').appendChild(mountComponent('settings-heating-mode-card'));
  el.querySelector('.ble-clock-slot').appendChild(mountComponent('settings-ble-clock-card'));
  el.querySelector('.preheat-slot').appendChild(mountComponent('smart-preheat-card'));
  el.querySelector('.motor-slot').appendChild(mountComponent('settings-motor-calibration-card'));
  el.querySelector('.firmware-slot').appendChild(mountComponent('settings-firmware-card'));
  el.querySelector('.backup-slot').appendChild(mountComponent('settings-backup-card'));
  el.querySelector('.appearance-slot').appendChild(mountComponent('settings-appearance-card'));
  el.querySelector('.diag-actions-slot').appendChild(mountComponent('settings-control-card'));
  el.querySelector('.manual-control-col').appendChild(mountComponent('diag-manual-badge'));
  el.querySelector('.manual-control-col').appendChild(mountComponent('diag-zone-motor-card',{zone:getDashboardValue('selectedZone')||1}));
  const labSlot=el.querySelector('.motor-lab-slot');
  const labSection=el.querySelector('.sec[data-section="motorlab"]');
  function updateMotorLab(){
    const show=isDevBuild(es(gkey.firmware)||getDashboardValue('firmwareVersion'));
    const navLink=el.querySelector('.v6-side-link[data-section="motorlab"]');
    if(navLink) navLink.hidden=!show;
    if(labSection) labSection.hidden=!show;
    if(show&&labSlot&&!labSlot.firstChild) labSlot.appendChild(mountComponent('diag-motor-lab'));
    if(!show&&getDashboardValue('section')==='motorlab') setSection('diagnostics');
  }
  subscribe(gkey.firmware,updateMotorLab);
  subscribeDashboard('firmwareVersion',updateMotorLab);
  subscribeDashboard('section',updateMotorLab);
  updateMotorLab();
  el.querySelector('.logs-main-col').appendChild(mountComponent('logs-view'));
  el.querySelector('.system-health-slot').appendChild(mountComponent('diag-system-card'));
  el.querySelector('.diag-health-slot').appendChild(mountComponent('connectivity-card'));
  el.querySelector('.diag-health-slot').appendChild(mountComponent('diag-i2c'));
  const helpExt = el.querySelector('.help-external-slot');
  if (helpExt) helpExt.appendChild(mountComponent('help-external-ingest'));
  const sections=el.querySelectorAll('.sec'); const shell=el.querySelector('.shell'); const detail=el.querySelector('.zone-detail-view'); const selectedTitle=el.querySelector('.selected-zone-title'); const provisionTitle=el.querySelector('.provision-zone-title'); const zoneOverview=el.querySelector('.zone-overview-strip'); const overviewLoops=el.querySelector('[data-overview-loops]'); const overviewMeta=el.querySelector('[data-overview-meta]'); const zoneMeta=el.querySelector('[data-zone-meta]'); const mobileZoneDock=el.querySelector('.mobile-zone-dock'); const mobileZoneChips=el.querySelector('.mobile-zone-dock .zone-chipstrip');
  function paintLiveMarks(){
    el.querySelectorAll('[data-live-mark]').forEach((node)=>{
      const id=node.getAttribute('data-live-mark');
      if(id==='sidebar'){
        if(node.dataset.staticLockup==='1') return;
        node.innerHTML=luneTouchLockup();
        node.dataset.staticLockup='1';
        return;
      }
      // Manifold marks: static V6 brand (no live pipe chase).
      if(node.dataset.staticMark==='1') return;
      paintMark(node,{states:['idle','idle','idle','idle','idle','idle'],selected:-1,prefix:id,landscape:true,sku:'V6'});
      node.dataset.staticMark='1';
    });
    const meta=manifoldMetaHtml();
    if(overviewMeta) overviewMeta.innerHTML=meta;
    if(zoneMeta) zoneMeta.innerHTML=meta;
  }
  function zoneDisplayState(zone){
    const enabled=isEntityOn(key.enabled(zone));
    const rawState=String(es(key.state(zone))||'').toUpperCase()||'OFF';
    const lastFault=String(es(key.motorLastFault(zone))||'').toUpperCase();
    const hasFault=lastFault&&lastFault!=='NONE'&&lastFault!=='OK';
    const state=(enabled&&(rawState==='FAULT'||hasFault))?'FAULT':rawState;
    return enabled?state:'OFF';
  }
  function zoneStatusLabel(displayState, zone){
    if (zone != null) return zoneControlStatusLabel(zone, displayState);
    return displayState==='HEATING'?t('state.heating'):
      displayState==='IDLE'?t('state.idle'):
      displayState==='FAULT'?t('common.fault'):
      displayState==='MANUAL'?t('state.manual'):
      displayState==='OVERHEATED'?t('state.overheated'):
      displayState==='CALIBRATING'?t('state.calibrating'):
      t('state.off');
  }
  function isDesktopZoneSwitcher(){ return window.matchMedia('(min-width: 901px)').matches; }
  function rebuildZoneOverview(){
    const selectedZone=getDashboardValue('selectedZone')||1;
    const desktop=isDesktopZoneSwitcher();
    zoneOverview.setAttribute('role',desktop?'group':'list');
    zoneOverview.setAttribute('aria-label',desktop?'Select zone':'Zone status overview');
    zoneOverview.innerHTML=Array.from({length:6},(_,i)=>{
      const value=i+1;
      const selected=value===selectedZone;
      const label=zoneLabel(value);
      const kind=zonePipeKind(value);
      const shortId=zoneIdShort(value);
      const valveRaw=ev(key.valve(value));
      const current=kind==='unused'?'—':fmtDeg(ev(key.temp(value)));
      const valve=kind==='unused'?'—':fmtV(valveRaw);
      const level=demandBarLevel(valveRaw, kind);
      const friendly=kind==='unused'?'—':(zoneFriendly(value)||'—');
      const displayState=zoneDisplayState(value);
      const statusLabel=zoneStatusLabel(displayState, value);
      const ariaLabel=`${label}, ${current}, valve ${valve}, ${statusLabel}`.replace(/"/g,'&quot;');
      const attrs=desktop
        ? `data-zone-select="${value}" aria-current="${selected?'true':'false'}" aria-label="${ariaLabel}" title="${ariaLabel}" tabindex="${selected?'0':'-1'}"`
        : `role="listitem" aria-label="${ariaLabel}" title="${ariaLabel}"`;
      return loopCellHtml({
        id: shortId,
        name: friendly,
        temp: current,
        level,
        kind,
        selected: desktop && selected,
        tag: desktop ? 'button' : 'div',
        attrs,
      });
    }).join('');
  }
  function rebuildMobileZoneChips(){
    const selectedZone=getDashboardValue('selectedZone')||1;
    mobileZoneChips.innerHTML=Array.from({length:6},(_,i)=>{
      const value=i+1;
      const selected=value===selectedZone;
      const label=zoneLabel(value);
      const title=zoneTitleMarkup(value);
      const aria=label.replace(/"/g,'&quot;');
      return `<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${selected}" aria-label="${aria}" title="${aria}" tabindex="${selected?'0':'-1'}" data-zone-select="${value}">${title}</button>`;
    }).join('');
  }
  function rebuildOverviewLoops(){
    if(!overviewLoops) return;
    overviewLoops.innerHTML=Array.from({length:6},(_,i)=>{
      const value=i+1;
      const label=zoneLabel(value);
      const kind=zonePipeKind(value);
      const shortId=zoneIdShort(value);
      const valveRaw=ev(key.valve(value));
      const current=kind==='unused'?'—':fmtDeg(ev(key.temp(value)));
      const valve=kind==='unused'?'—':fmtV(valveRaw);
      const level=demandBarLevel(valveRaw, kind);
      const friendly=kind==='unused'?'—':(zoneFriendly(value)||'—');
      const displayState=zoneDisplayState(value);
      const statusLabel=zoneStatusLabel(displayState, value);
      const ariaLabel=`${label}, ${current}, valve ${valve}, ${statusLabel}`.replace(/"/g,'&quot;');
      return loopCellHtml({
        id: shortId,
        name: friendly,
        temp: current,
        level,
        kind,
        attrs: `data-open-zone="${value}" aria-label="${ariaLabel}" title="${ariaLabel}"`,
      });
    }).join('');
  }
  function rebuildZoneChrome(){ rebuildZoneOverview(); rebuildMobileZoneChips(); rebuildOverviewLoops(); paintLiveMarks(); }
  function updateMobileZoneDock(){ const inZones=getDashboardValue('section')==='zones'; mobileZoneDock.hidden=!inZones; mobileZoneDock.setAttribute('aria-hidden',inZones?'false':'true'); shell.classList.toggle('has-zone-dock',inZones); }
  function selectZone(value){ setSelectedZone(value); }
  function updateSection(){ const section=getDashboardValue('section')||'overview'; sections.forEach((node)=>node.classList.toggle('active',node.dataset.section===section)); updateZoneDetail(); updateSettingsPanel(); }
  function updateSettingsPanel(){
    const panel=getDashboardValue('settingsPanel')||'touch';
    el.querySelectorAll('.settings-panel[data-panel]').forEach((node)=>{
      node.classList.toggle('is-active', node.dataset.panel===panel);
    });
  }
  function updateSummary(){
    const enabled=[]; let active=0; const faultList=[];
    for(let z=1;z<=6;z++){
      const on=String(es(key.enabled(z))).toLowerCase()==='on';
      const state=String(es(key.state(z))).toLowerCase();
      const fault=String(es(key.motorLastFault(z))||'').toUpperCase();
      if(on) enabled.push(z);
      if(on&&['heating','calling'].includes(state)) active++;
      const hasFault=state==='fault'||(fault!==''&&fault!=='NONE'&&fault!=='OK');
      if(hasFault) faultList.push({zone:z,fault:fault||'FAULT'});
    }
    const faults=faultList.length;
    const flow=ev(gkey.flow), ret=ev(gkey.ret), touch=String(es(gkey.authorityState)||'').replace(/_/g,' '); const healthy=faults===0&&getDashboardValue('live');
    const dt=flow!=null&&ret!=null?Number(flow)-Number(ret):null;
    const dtText=dt==null?'—':`${dt.toFixed(1)}°C`;
    const modeInfo=heatingModeSummary();
    const heatDemand=heatDemandSummaryLine();
    const html=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${healthy?'status-ok':getDashboardValue('live')?'status-warn':'status-danger'}">${healthy?'Operating normally':getDashboardValue('live')?'Needs attention':'Device offline'}</h2><p>${faults?faults+' zone fault'+(faults===1?'':'s')+' require attention.':getDashboardValue('live')?heatDemand:'Unable to read current manifold state.'}</p></div><div class="status-fact"><span class="eyebrow">Mode</span><strong>${modeInfo.modeLabel}</strong><small>${modeInfo.source}</small></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${active} zones</strong><small>${enabled.length} enabled · ${active}/${enabled.length||0} calling</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${fmtT(flow)}</strong><small>Return ${fmtT(ret)} · ΔT ${dtText}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${touch||'not connected'}</strong><small>${ev(gkey.authorityLeaseRemainingS)?Math.round(ev(gkey.authorityLeaseRemainingS))+' s lease':'local control'}</small></div>`;
    const touchApproved=isEntityOn(gkey.authorityConfigured); const drivers=String(es(gkey.drivers)||'off');
    el.querySelector('.overview-status').innerHTML=html; el.querySelector('.settings-readiness').innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${getDashboardValue('live')?'status-ok':'status-danger'}">${getDashboardValue('live')?'Ready':'Waiting for device'}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${getDashboardValue('live')?'Live':'Offline'}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${touchApproved?'Approved':'Not approved'}</strong><small>${touchApproved?'authenticated control':'local control only'}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${drivers}</strong><small>motor outputs</small></div>`; el.querySelector('.diagnostics-readiness').innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${faults?'status-danger':healthy?'status-ok':'status-warn'}">${faults?faults+' issue'+(faults===1?'':'s'):healthy?'Healthy':'Awaiting data'}</h2><p>${faults?'Resolve current exceptions before using service controls.':'No active motor faults reported.'}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${faults}</strong><small>${faults?'requires review':'none reported'}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${drivers}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${touch||'not connected'}</strong><small>${touchApproved?'approved':'local control'}</small></div>`;
    const faultDetail=faultList.map((f)=>t('overview.attention.faultDetail',{zone:f.zone,fault:f.fault})).join(' ');
    [el.querySelector('.overview-attention'),el.querySelector('.diagnostics-attention')].forEach((attention)=>{
      attention.hidden=!faults;
      attention.innerHTML=faults
        ? `<strong>${faults===1?t('status.attention.zoneFaultOne'):t('status.attention.zoneFaultMany',{count:faults})}</strong><span>${faultDetail}</span>`
        : '';
    });
  }
  function updateZoneDetail(){ const zone=getDashboardValue('selectedZone')||1; const inZones=getDashboardValue('section')==='zones'; const friendly=zoneFriendly(zone); const canvasTitle=friendly?`${zoneIdShort(zone)} · ${friendly}`:zoneIdShort(zone); selectedTitle.textContent=canvasTitle; if(provisionTitle) provisionTitle.textContent=canvasTitle; rebuildZoneChrome(); updateMobileZoneDock(); detail.hidden=!inZones; }
  function onZoneSelectClick(event){ const tab=event.target.closest('[data-zone-select]'); if(tab) selectZone(Number(tab.dataset.zoneSelect)); }
  function onZoneOverviewClick(event){ if(!isDesktopZoneSwitcher()) return; onZoneSelectClick(event); }
  function onZoneOverviewKeydown(event){ if(!isDesktopZoneSwitcher()) return; if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const current=getDashboardValue('selectedZone')||1; const next=event.key==='Home'?1:event.key==='End'?6:event.key==='ArrowLeft'?(current===1?6:current-1):(current===6?1:current+1); selectZone(next); requestAnimationFrame(()=>zoneOverview.querySelector(`[data-zone-select="${next}"]`)?.focus()); }
  function onZoneChipKeydown(event){ if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const current=getDashboardValue('selectedZone')||1; const next=event.key==='Home'?1:event.key==='End'?6:event.key==='ArrowLeft'?(current===1?6:current-1):(current===6?1:current+1); selectZone(next); requestAnimationFrame(()=>mobileZoneChips.querySelector(`[data-zone-select="${next}"]`)?.focus()); }
  function onOverviewLoopClick(event){ const tab=event.target.closest('[data-open-zone]'); if(!tab) return; selectZone(Number(tab.dataset.openZone)); setSection('zones'); }
  zoneOverview.addEventListener('click',onZoneOverviewClick);
  zoneOverview.addEventListener('keydown',onZoneOverviewKeydown);
  if(overviewLoops) overviewLoops.addEventListener('click',onOverviewLoopClick);
  window.matchMedia('(min-width: 901px)').addEventListener('change',rebuildZoneOverview);
  mobileZoneChips.addEventListener('click',onZoneSelectClick);
  mobileZoneChips.addEventListener('keydown',onZoneChipKeydown);
  el.querySelectorAll('[data-open-zones]').forEach((button)=>button.addEventListener('click',()=>setSection('zones')));
  el.querySelectorAll('[data-help-section]').forEach((node)=>node.addEventListener('click',(event)=>{event.preventDefault();setSection(node.dataset.helpSection)}));
  subscribeDashboard('section',updateSection); subscribeDashboard('settingsPanel',updateSettingsPanel); subscribeDashboard('selectedZone',updateZoneDetail); subscribeDashboard('live',updateSummary); subscribeDashboard('zoneNames',()=>{ updateZoneDetail(); updateSummary(); }); subscribeLanguage(()=>{ localize(el); rebuildZoneChrome(); updateZoneDetail(); });
  for(let z=1;z<=6;z++){ [key.temp(z),key.setpoint(z),key.effectiveSetpoint(z),key.valve(z),key.state(z),key.enabled(z),key.motorLastFault(z),key.syncTo(z)].forEach((id)=>subscribe(id,()=>{ updateSummary(); rebuildZoneChrome(); })); } [gkey.flow,gkey.ret,gkey.authorityConfigured,gkey.authorityState,gkey.authorityLeaseRemainingS,gkey.drivers,gkey.heatingMode,gkey.effectiveHeatingMode,gkey.heatingModeSource,gkey.heatDemandRecommendation,gkey.heatDemandCriticalZone,gkey.heatDemandSaturatedS,gkey.hpBasePct,gkey.hpTrimFloorPct].forEach((id)=>subscribe(id,()=>{ updateSummary(); rebuildZoneChrome(); })); localize(el); updateSection(); updateZoneDetail(); updateSummary();
  const boot=new URLSearchParams(location.search); const bootSection=boot.get('section'); const bootZone=Number(boot.get('zone')); if(bootSection) setSection(bootSection); if(bootZone>=1&&bootZone<=6) setSelectedZone(bootZone);
 }});
