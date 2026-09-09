import { component, mountComponent, subscribe } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, subscribeDashboard, setSection, setSelectedZone, zoneIdShort, zoneLabel, zoneTitleMarkup } from '../core/store.js';
import { localize, subscribeLanguage, t } from '../core/i18n.js';
import { gkey, key } from '../utils/keys.js';
import { fmtT } from '../utils/format.js';
import { applyTheme } from '../core/theme.js';
import { isDevBuild } from '../utils/dev-build.js';

applyTheme();

const css = `
:root { --control-height:44px; --control-width:180px; --bg:#0b0e14; --surface:#131620; --surface-raised:rgba(255,255,255,.035); --text-main:#f2f5f8; --text-strong:#f8fafc; --text-muted:rgba(226,231,240,.62); --text-faint:rgba(207,215,228,.45); --separator:rgba(199,211,232,.105); --separator-soft:rgba(199,211,232,.06); --control-border:rgba(199,211,232,.15); --control-bg:rgba(255,255,255,.045); --accent:#F59E0B; --accent-rgb:245,158,11; --state-ok:#34D399; --state-warn:#F59E0B; --state-danger:#EF4444; --state-disabled:#8b94a3; --focus-ring:rgba(245,158,11,.92); --font-ui:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif; --font-display:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif; --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  /* Legacy components inherit the same neutral system. Themes replace only accent and focus. */
  --text:var(--text-main); --text-secondary:var(--text-muted); --muted:var(--text-muted); --border:var(--separator); --panel-border:var(--separator); --divider:var(--separator-soft); --card:var(--surface); --panel-bg-flat:var(--surface-raised); --panel-bg-vibrant:var(--surface-raised); --panel-shadow:none; --overlay-bg:rgba(11,14,20,.96); --text-on-accent:var(--bg); --control-bg-hover:rgba(255,255,255,.075); --control-border-strong:rgba(199,211,232,.24); --control-border-hover:rgba(var(--accent-rgb),.5); --control-knob:var(--text-strong); --focus-ring-soft:var(--focus-ring); --focus-border:var(--accent); --accent-bg-soft:rgba(var(--accent-rgb),.12); --accent-border:rgba(var(--accent-rgb),.36); --accent-border-hover:rgba(var(--accent-rgb),.52); --accent-text-soft:var(--accent); --success-bg:rgba(52,211,153,.16); --success-bg-soft:rgba(52,211,153,.10); --success-border:rgba(52,211,153,.38); --danger-bg:rgba(239,68,68,.16); --danger-bg-soft:rgba(239,68,68,.10); --danger-bg-strong:rgba(239,68,68,.22); --danger-border:rgba(239,68,68,.42); --danger-border-soft:rgba(239,68,68,.30); --danger-border-strong:rgba(239,68,68,.56); --danger-text:var(--state-danger); --warn-bg-soft:rgba(245,158,11,.10); --warn-border:rgba(245,158,11,.38); --blue:#7aa7ce; --red:var(--state-danger); --series-warm:var(--accent); --series-cool:#7cc5f3; --series-cool-fill:rgba(124,197,243,.14); --series-solar:#fcd34d; --chart-axis:rgba(226,231,240,.72); --flow-track:#596779; --flow-disabled:#7c8797; --flow-unknown:#9aa6b6; --flow-return:var(--series-cool); --flow-label:#d8e1ec; --flow-source-bg:#202630;
}
.theme-refined-ember { --accent:#F59E0B; --accent-rgb:245,158,11; --focus-ring:rgba(245,158,11,.92); }
.theme-deep-forest { --accent:#10B981; --accent-rgb:16,185,129; --focus-ring:rgba(52,211,153,.92); }
:root[data-color-scheme="light"] {
  --bg:#f5f6f8; --surface:#ffffff; --surface-raised:rgba(255,255,255,.82); --text-main:#262a31; --text-strong:#111318; --text-muted:rgba(35,40,49,.68); --text-faint:rgba(45,51,61,.50); --separator:rgba(31,41,55,.14); --separator-soft:rgba(31,41,55,.08); --control-border:rgba(31,41,55,.19); --control-bg:rgba(255,255,255,.90); --state-ok:#147a52; --state-warn:#9a5b00; --state-danger:#c73535; --state-disabled:#6b7280;
  --overlay-bg:rgba(245,246,248,.96); --text-on-accent:#ffffff; --control-bg-hover:rgba(17,24,39,.07); --control-border-strong:rgba(31,41,55,.29); --success-bg:rgba(20,122,82,.12); --success-bg-soft:rgba(20,122,82,.08); --success-border:rgba(20,122,82,.30); --danger-bg:rgba(199,53,53,.12); --danger-bg-soft:rgba(199,53,53,.08); --danger-bg-strong:rgba(199,53,53,.16); --danger-border:rgba(199,53,53,.34); --danger-border-soft:rgba(199,53,53,.24); --danger-border-strong:rgba(199,53,53,.45); --warn-bg-soft:rgba(154,91,0,.09); --warn-border:rgba(154,91,0,.30); --blue:#276b99; --series-cool:#1f78a8; --series-cool-fill:rgba(31,120,168,.12); --series-solar:#8a6500; --chart-axis:rgba(35,40,49,.70); --flow-track:#738096; --flow-disabled:#8a94a3; --flow-unknown:#667386; --flow-label:#2d3948; --flow-source-bg:#edf0f4;
}
:root[data-color-scheme="light"].theme-refined-ember { --accent:#b45309; --accent-rgb:180,83,9; --focus-ring:rgba(180,83,9,.78); }
:root[data-color-scheme="light"].theme-deep-forest { --accent:#047857; --accent-rgb:4,120,87; --focus-ring:rgba(4,120,87,.78); }
*,*::before,*::after{box-sizing:border-box} html{font-size:100%;scroll-behavior:smooth} body{margin:0;background:var(--bg);color:var(--text-main);font-family:var(--font-ui);line-height:1.45;-webkit-font-smoothing:antialiased} button,input,select{font:inherit} button,a,select,input{ -webkit-tap-highlight-color:transparent }
app-root{display:block}.app{min-height:100vh}.shell{display:grid;grid-template-columns:224px minmax(0,1fr);min-height:100vh}.side-panel{grid-column:1;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:18px 12px 14px;border-right:1px solid var(--separator);background:rgba(255,255,255,.022);overflow-y:auto}.side-brand{min-height:0;padding:7px 10px 0;color:var(--accent);font-size:1rem;font-weight:750;letter-spacing:.12em}.side-subtitle{margin:2px 10px 30px;color:var(--text-faint);font-size:.72rem}.side-nav-slot{display:flex;flex:1;min-height:0}.main-panel{grid-column:2;min-width:0}.hdr{position:sticky;top:0;z-index:20;padding:12px 28px;border-bottom:1px solid var(--separator);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(20px) saturate(1.25)}.view-panel{min-width:0;width:min(1120px,100%);margin:0 auto;padding:28px 34px 64px}.ftr{margin-top:48px;color:var(--text-faint);font-size:.75rem}.sec{display:none}.sec.active{display:block}
.view-lead{max-width:720px;margin:0 0 28px;padding-bottom:24px;border-bottom:1px solid var(--separator)}.view-lead h2{margin:0;color:var(--text-strong);font-size:1.1rem;font-weight:650}.view-lead p{margin:6px 0 0;color:var(--text-muted);font-size:.92rem}
.status-summary{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr));gap:0;margin:0 0 24px;padding:20px 0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}.settings-readiness,.diagnostics-readiness{grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr))}.status-summary-main{padding-right:24px}.eyebrow{display:block;color:var(--text-faint);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.status-summary h2{margin:5px 0 4px;color:var(--text-strong);font-size:1.65rem;letter-spacing:-.025em}.status-summary p{margin:0;color:var(--text-muted);font-size:.9rem}.status-fact{padding:0 16px;border-left:1px solid var(--separator)}.status-fact strong{display:block;margin-top:5px;color:var(--text-strong);font-size:1.15rem;font-variant-numeric:tabular-nums}.status-fact small{display:block;margin-top:3px;color:var(--text-muted);font-size:.78rem}.status-ok{color:var(--state-ok)!important}.status-summary h2.status-ok{color:var(--text-strong)!important}.status-warn{color:var(--state-warn)!important}.status-danger{color:var(--state-danger)!important}
.attention{margin:0 0 24px;border-left:3px solid var(--state-warn);padding:13px 16px;background:rgba(245,158,11,.055)}.attention[hidden]{display:none}.attention strong{display:block;color:var(--text-strong);font-size:.9rem}.attention span{display:block;margin-top:3px;color:var(--text-muted);font-size:.85rem}
.content-group{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.content-group + .content-group{margin-top:24px}.group-title{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:58px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--separator)}.group-title-main{min-width:0}.group-title h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.group-title span{display:block;margin-top:2px;color:var(--text-muted);font-size:.78rem}.group-navigation{min-height:var(--control-height);padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.group-navigation:hover{background:rgba(var(--accent-rgb),.10)}.zone-grid{display:grid;grid-template-columns:1fr;gap:0;margin:0}
.zone-id-short{display:inline}.zone-id-long{display:none}@media(min-width:901px){.zone-id-short{display:none}.zone-id-long{display:inline}}.zone-label-compact .zone-id-short{display:inline!important}.zone-label-compact .zone-id-long{display:none!important}.zone-title-id{min-width:0}.zone-title-name{font-weight:500;color:var(--text-faint)}@media(max-width:900px){.zone-label-compact .zone-title-name,.mobile-zone-dock .zone-title-name{display:none}}
.zone-overview{margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-overview-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.zone-overview-card{position:relative;min-width:0;min-height:64px;padding:10px 12px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-muted);display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:2px;text-align:left;overflow:hidden;font:inherit}.zone-overview-card.is-merged{border-color:color-mix(in srgb,var(--accent) 32%,var(--separator));background:color-mix(in srgb,var(--accent) 5%,var(--surface-raised))}.zone-overview-card.zo-pair-start{border-top-right-radius:4px;border-bottom-right-radius:4px}.zone-overview-card.zo-pair-cont{border-top-left-radius:4px;border-bottom-left-radius:4px;margin-left:-4px;padding-left:14px;border-left-color:color-mix(in srgb,var(--accent) 22%,var(--separator))}.zone-overview-card .zo-status{position:absolute;top:10px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--state-disabled)}.zone-overview-card.zs-heating .zo-status{background:var(--accent)}.zone-overview-card.zs-idle .zo-status,.zone-overview-card.zs-off .zo-status{background:var(--state-disabled)}.zone-overview-card.zs-fault .zo-status{background:var(--state-danger)}.zone-overview-card .zo-title{min-width:0;padding-right:14px;color:var(--text-strong);font-size:.78rem;font-weight:750;letter-spacing:.02em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-title .zone-title-name{font-size:.72rem;font-weight:560;letter-spacing:0;color:var(--text-faint)}.zone-overview-card .zo-temps{min-width:0;padding-right:4px;color:var(--text-muted);font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-merge{min-width:0;padding-right:4px;color:var(--text-faint);font-size:.68rem;font-weight:600;letter-spacing:.01em;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(min-width:901px){.zone-overview-card{cursor:pointer}.zone-overview-card:hover{color:var(--text-strong);background:color-mix(in srgb,var(--surface-raised) 70%,rgba(255,255,255,.06));border-color:color-mix(in srgb,var(--separator) 60%,rgba(199,211,232,.28))}.zone-overview-card[aria-current="true"]{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 42%,var(--separator));background:rgba(var(--accent-rgb),.12)}.zone-overview-card[aria-current="true"] .zo-title,.zone-overview-card[aria-current="true"] .zo-temps{color:inherit}.zone-overview-card[aria-current="true"] .zo-title .zone-title-name{color:inherit;opacity:.72}.zone-overview-card[aria-current="true"].is-merged{border-color:color-mix(in srgb,var(--accent) 48%,var(--separator));background:rgba(var(--accent-rgb),.14)}.zone-overview-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}}.zone-detail-heading{margin:0 0 14px;padding:2px 0 16px;border-bottom:1px solid var(--separator)}.zone-detail-heading h2{margin:3px 0 0;color:var(--text-strong);font-size:1.35rem;font-weight:700;letter-spacing:-.02em}.zone-detail-heading p{margin:4px 0 0;color:var(--text-muted);font-size:.84rem}.zones-detail-pane{min-width:0}.zone-detail-layout{display:grid;grid-template-columns:1fr;gap:10px}.zone-detail-layout>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}.zone-detail-layout .ui-card,.zone-detail-layout .zone-detail{border:1px solid var(--separator)!important;border-radius:10px!important;background:var(--surface-raised)!important;box-shadow:none!important}
.mobile-zone-dock{display:none}
.mobile-zone-dock .zone-chipstrip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;flex:1;min-width:0;padding:3px;border-radius:11px;background:rgba(255,255,255,.04)}
.mobile-zone-dock .zone-chip{min-width:0;min-height:var(--control-height,44px);padding:0 6px;border:0;border-radius:8px;background:transparent;color:var(--text-muted);font:inherit;font-size:.72rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.mobile-zone-dock .zone-chip:hover{color:var(--text-strong);background:var(--control-bg-hover)}
.mobile-zone-dock .zone-chip[aria-selected="true"]{background:rgba(var(--accent-rgb),.15);color:var(--accent)}
.zone-picker-field{display:none}
.disclosure{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.disclosure + .disclosure{margin-top:8px}.disclosure summary{display:flex;align-items:center;justify-content:space-between;min-height:var(--control-height);padding:10px 18px;color:var(--text-strong);cursor:pointer;list-style:none;font-size:.92rem;font-weight:650}.disclosure summary::-webkit-details-marker{display:none}.disclosure summary::after{content:'›';color:var(--text-muted);font-size:1.35rem;transition:transform .16s ease}.disclosure[open] summary::after{transform:rotate(90deg)}.disclosure summary:focus-visible{outline:3px solid var(--focus-ring);outline-offset:-3px}.disclosure summary small{margin-left:auto;margin-right:18px;color:var(--text-muted);font-size:.78rem;font-weight:400}.disclosure-body{padding:18px;border-top:1px solid var(--separator)}
.overview-details,.settings-layout,.diagnostics-layout{display:grid;gap:8px}.overview-attention,.diagnostics-attention{width:100%;border:0;border-left:3px solid var(--state-warn);border-radius:0;text-align:left;color:inherit;cursor:pointer}.overview-attention:hover,.diagnostics-attention:hover{background:rgba(var(--accent-rgb),.09)}.settings-disclosure>.disclosure-body,.diagnostics-disclosure>.disclosure-body{padding:0 18px 18px}.settings-disclosure .ui-card,.diagnostics-disclosure .ui-card,.diagnostics-disclosure .settings-card,.diagnostics-disclosure .logs-view,.diagnostics-disclosure .diag-zone-motor,.diagnostics-disclosure .connectivity-card,.diagnostics-disclosure .diag-i2c{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.settings-disclosure .ui-card-title{display:none}.settings-disclosure .ui-row{min-height:var(--control-height)}.settings-disclosure .ui-input,.settings-disclosure .ui-select,.settings-disclosure .ui-btn,.settings-disclosure button,.diagnostics-disclosure button,.diagnostics-disclosure select,.diagnostics-disclosure input{min-height:var(--control-height)}.settings-disclosure .touch-approve{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--text-on-accent)!important}.settings-disclosure .touch-disconnect{background:transparent!important}.diagnostics-disclosure .card-title,.diagnostics-disclosure .ui-card-title{color:var(--text-strong)!important;font-size:.92rem!important;font-weight:650!important;letter-spacing:0!important;text-transform:none!important}.diagnostics-disclosure .logs-stream{height:min(420px,50vh);background:rgba(0,0,0,.14);box-shadow:none}.diagnostics-disclosure.danger-zone{margin-top:20px;border-color:var(--danger-border-soft)}.diagnostics-disclosure.danger-zone>summary{color:var(--danger-text)}
.help-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.help-item{display:block;padding:18px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-main);text-decoration:none}.help-item:hover{border-color:rgba(var(--accent-rgb),.45)}.help-item strong{display:block;color:var(--text-strong);font-size:.95rem}.help-item p{margin:5px 0 0;color:var(--text-muted);font-size:.83rem}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,.zone-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}@media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}@media (prefers-contrast:more){:root{--separator:rgba(230,238,250,.28);--text-muted:rgba(239,244,252,.82);--text-faint:rgba(231,239,250,.68)}}
:root[data-color-scheme="light"] .side-panel{background:rgba(17,24,39,.018)}
:root[data-color-scheme="light"] .attention{background:rgba(154,91,0,.07)}
:root[data-color-scheme="light"] .diagnostics-disclosure .logs-stream,
:root[data-color-scheme="light"] .diag-i2c,
:root[data-color-scheme="light"] .logs-stream{background:rgba(17,24,39,.045)}
:root[data-color-scheme="light"] .zone-card:hover{background:rgba(17,24,39,.035)}
@media (prefers-contrast:more){:root[data-color-scheme="light"]{--separator:rgba(31,41,55,.32);--text-muted:rgba(24,30,39,.86);--text-faint:rgba(35,42,52,.72)}}
.overview-dashboard{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);column-gap:28px;border-top:1px solid var(--separator)}.dashboard-section{min-width:0;padding:24px 0;border-bottom:1px solid var(--separator)}.dashboard-hydraulic{grid-column:1/-1}.dashboard-activity{grid-column:1}.dashboard-connection{grid-column:2;padding-left:28px;border-left:1px solid var(--separator)}.dashboard-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:0 0 18px}.dashboard-section-head h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.dashboard-section-head p{margin:3px 0 0;color:var(--text-muted);font-size:.82rem}.hydraulic-summary{color:var(--text-muted);font-size:.84rem;font-variant-numeric:tabular-nums}.overview-dashboard .flow-wrap,.overview-dashboard .graph-card,.overview-dashboard .timeline-card,.overview-dashboard .connectivity-card{margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.overview-dashboard .connectivity-card{padding:0!important}.overview-dashboard .connectivity-card .card-title{display:none}.overview-dashboard .graph-card{margin-top:18px!important;padding-top:18px!important;border-top:1px solid var(--separator)!important}
.zone-configuration-groups{display:grid;gap:10px;width:100%}.zone-configuration-groups .ui-card{height:auto!important}.zone-configuration-groups .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot{width:100%}.zone-actuator-slot .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot .disclosure-body>.ui-section:first-child{margin-top:0}
@media(min-width:901px){.zone-configuration-groups{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"sensor room" "sensor coordination";align-items:stretch}.zone-room-slot{grid-area:room;min-width:0}.zone-sensor-slot{grid-area:sensor;min-width:0;display:flex;flex-direction:column}.zone-coordination-slot{grid-area:coordination;min-width:0}.zone-sensor-slot>.ui-card{flex:1 1 auto;align-self:stretch;height:100%!important}}
@media(max-width:900px){.shell{display:block;padding-bottom:78px}.shell.has-zone-dock{padding-bottom:132px}.main-panel{min-width:0}.side-panel{position:fixed;z-index:40;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:auto;padding:7px;border:1px solid var(--separator);border-radius:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);box-shadow:0 10px 32px rgba(0,0,0,.32);backdrop-filter:blur(22px) saturate(1.3);overflow:visible}.side-brand,.side-subtitle{display:none}.side-nav-slot,.side-nav-slot hv6-sidebar{flex:0 0 auto;min-height:auto}.mobile-zone-dock{display:flex;align-items:center;gap:4px;margin:0 0 6px;padding:0 0 6px;border-bottom:1px solid var(--separator)}.mobile-zone-dock[hidden]{display:none!important}.zone-overview{margin-bottom:16px}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.zone-overview-card{min-height:58px;padding:9px 12px;pointer-events:none;cursor:default}.zone-overview-card.zo-pair-start,.zone-overview-card.zo-pair-cont{border-radius:10px;margin-left:0;padding-left:12px}.zone-overview-card .zo-title{font-size:.78rem}.zone-overview-card .zo-temps{font-size:.78rem}.hdr{padding:9px 14px}.view-panel{width:100%;padding:24px 16px 48px}.status-summary{grid-template-columns:1fr 1fr;gap:16px}.status-summary-main{grid-column:1/-1;padding:0 0 12px;border-bottom:1px solid var(--separator)}.status-fact{padding:0;border:0}.zone-card{grid-template-columns:minmax(120px,1fr) 90px 90px 28px;gap:10px}.zone-card .zc-valve{display:none}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:3}.zone-card::after{grid-column:4}.zone-detail-secondary,.help-list{grid-template-columns:1fr}}
@media(max-width:900px){.overview-dashboard{grid-template-columns:1fr}.dashboard-hydraulic,.dashboard-activity,.dashboard-connection{grid-column:1}.dashboard-connection{padding-left:0;border-left:0}}
@media(max-width:520px){.v6-toolbar h1{font-size:1.15rem}.v6-toolbar p{font-size:.78rem}.v6-toolbar-icon{display:none}.v6-live{font-size:0}.v6-live::before{width:8px;height:8px}.status-summary h2{font-size:1.35rem}.group-title{align-items:center}.group-title span{margin-top:4px}.zone-card{min-height:88px;grid-template-columns:minmax(0,1fr) 82px 28px}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:1;margin-top:51px}.zone-card::after{grid-column:3}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.zone-overview-card{min-height:56px;padding:8px 10px}.zone-overview-card.zo-pair-cont{padding-left:10px}.mobile-zone-dock .zone-chip{font-size:.68rem}}
`;
injectStyle('hv6-app-root', css);

const template = () => `
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand">Lune V6</div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Hydraulic overview</h3><p>Current temperatures, valve demand and active loops.</p></div><span class="hydraulic-summary"></span></div><div class="flow-diagram-slot"></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section><section class="dashboard-section dashboard-connection" aria-labelledby="connection-heading"><div class="dashboard-section-head"><div><h3 id="connection-heading">Connection</h3><p>Touch, network and firmware.</p></div></div><div class="connectivity-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><div class="zone-overview"><div class="zone-overview-strip" role="group" aria-label="Select zone"></div></div><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-layout"><div class="zone-detail-slot"></div><div class="zone-actuator-slot"></div><section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section></div></section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout"><details class="disclosure settings-disclosure touch-settings" open><summary>Touch connection<small>Approval and coordinator identity</small></summary><div class="disclosure-body touch-slot"></div></details><details class="disclosure settings-disclosure"><summary>Manifold and probes<small>Valve type and temperature inputs</small></summary><div class="disclosure-body manifold-slot"></div></details><details class="disclosure settings-disclosure"><summary>Return temperature<small>Optional zone return probes</small></summary><div class="disclosure-body return-temp-slot"></div></details><details class="disclosure settings-disclosure"><summary>Hydraulic safety<small>Minimum active-loop opening</small></summary><div class="disclosure-body minimum-flow-slot"></div></details><details class="disclosure settings-disclosure"><summary>Room clocks<small>Shelly BLU display time</small></summary><div class="disclosure-body ble-clock-slot"></div></details><details class="disclosure settings-disclosure"><summary>Preheat absorption<small>Local handling of external preload</small></summary><div class="disclosure-body preheat-slot"></div></details><details class="disclosure settings-disclosure"><summary>Motor configuration<small>Drivers, profile and learning limits</small></summary><div class="disclosure-body motor-slot"></div></details><details class="disclosure settings-disclosure"><summary>Firmware<small>Version, updates and manual upload</small></summary><div class="disclosure-body firmware-slot"></div></details><details class="disclosure settings-disclosure"><summary>Backup and restore<small>Save or reapply local configuration</small></summary><div class="disclosure-body backup-slot"></div></details><details class="disclosure settings-disclosure"><summary>Appearance<small>Accent colour in this browser</small></summary><div class="disclosure-body appearance-slot"></div></details></div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I²C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-external-slot"></div><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 · Local manifold controller</div></main></div></div></div>`;

component({ tag:'app-root', render:template, onMount(ctx, el) {
  el.querySelector('.hdr').appendChild(mountComponent('hv6-header'));
  el.querySelector('.side-nav-slot').appendChild(mountComponent('hv6-sidebar'));
  el.querySelector('.flow-diagram-slot').appendChild(mountComponent('flow-diagram'));
  el.querySelector('.hydraulic-history-slot').appendChild(mountComponent('graph-widgets',{variant:'flow-return'}));
  el.querySelector('.timeline-slot').appendChild(mountComponent('zone-state-timeline'));
  el.querySelector('.connectivity-slot').appendChild(mountComponent('connectivity-card'));
  el.querySelector('.zone-detail-slot').appendChild(mountComponent('zone-detail',{zone:getDashboardValue('selectedZone')}));
  el.querySelector('.zone-sensor-slot').appendChild(mountComponent('zone-sensor-card'));
  el.querySelector('.zone-coordination-slot').appendChild(mountComponent('zone-coordination-card'));
  el.querySelector('.zone-actuator-slot').appendChild(mountComponent('zone-actuator-card'));
  el.querySelector('.zone-room-slot').appendChild(mountComponent('zone-room-card'));
  el.querySelector('.touch-slot').appendChild(mountComponent('settings-touch-card'));
  el.querySelector('.manifold-slot').appendChild(mountComponent('settings-manifold-card'));
  el.querySelector('.return-temp-slot').appendChild(mountComponent('settings-return-temp-card'));
  el.querySelector('.minimum-flow-slot').appendChild(mountComponent('settings-minimum-flow-card'));
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
  const sections=el.querySelectorAll('.sec'); const shell=el.querySelector('.shell'); const detail=el.querySelector('.zone-detail-view'); const selectedTitle=el.querySelector('.selected-zone-title'); const zoneOverview=el.querySelector('.zone-overview-strip'); const mobileZoneDock=el.querySelector('.mobile-zone-dock'); const mobileZoneChips=el.querySelector('.mobile-zone-dock .zone-chipstrip');
  function zoneDisplayState(zone){
    const enabled=isEntityOn(key.enabled(zone));
    const rawState=String(es(key.state(zone))||'').toUpperCase()||'OFF';
    const lastFault=String(es(key.motorLastFault(zone))||'').toUpperCase();
    const hasFault=lastFault&&lastFault!=='NONE'&&lastFault!=='OK';
    const state=(enabled&&(rawState==='FAULT'||hasFault))?'FAULT':rawState;
    return enabled?state:'OFF';
  }
  function zoneStatusLabel(displayState){
    return displayState==='HEATING'?t('state.heating'):
      displayState==='IDLE'?t('state.idle'):
      displayState==='FAULT'?t('common.fault'):
      displayState==='MANUAL'?t('state.manual'):
      displayState==='OVERHEATED'?t('state.overheated'):
      displayState==='CALIBRATING'?t('state.calibrating'):
      t('state.off');
  }
  function zoneStatusClass(displayState){
    if(displayState==='HEATING'||displayState==='CALLING') return 'zs-heating';
    if(displayState==='FAULT') return 'zs-fault';
    if(displayState==='IDLE') return 'zs-idle';
    return 'zs-off';
  }
  function parseSyncTarget(raw){
    const text=String(raw||'').trim();
    if(!text||/^none$/i.test(text)||text==='0'||text==='-1') return 0;
    const match=text.match(/(\d+)/);
    const zone=match?Number(match[1]):0;
    return zone>=1&&zone<=6?zone:0;
  }
  function zoneMergeMeta(){
    const targets=[0,0,0,0,0,0,0];
    for(let z=1;z<=6;z++) targets[z]=parseSyncTarget(es(key.syncTo(z)));
    const roots=[0,0,0,0,0,0,0];
    for(let z=1;z<=6;z++){
      let root=z;
      for(let guard=0;guard<6;guard++){
        const next=targets[root];
        if(!next||next<1||next>6) break;
        if(next===z){ root=z; break; }
        root=next;
      }
      roots[z]=root;
    }
    const membersByRoot={};
    for(let z=1;z<=6;z++) (membersByRoot[roots[z]]||=[]).push(z);
    const partners=[[],[],[],[],[],[],[]];
    for(let z=1;z<=6;z++){
      const members=membersByRoot[roots[z]]||[z];
      const isGroup=members.length>1&&members.some((member)=>targets[member]>0);
      partners[z]=isGroup?members.filter((member)=>member!==z):[];
    }
    return {roots,partners};
  }
  function isDesktopZoneSwitcher(){ return window.matchMedia('(min-width: 901px)').matches; }
  function rebuildZoneOverview(){
    const merge=zoneMergeMeta();
    const selectedZone=getDashboardValue('selectedZone')||1;
    const desktop=isDesktopZoneSwitcher();
    zoneOverview.setAttribute('role',desktop?'group':'list');
    zoneOverview.setAttribute('aria-label',desktop?'Select zone':'Zone status overview');
    zoneOverview.innerHTML=Array.from({length:6},(_,i)=>{
      const value=i+1;
      const selected=value===selectedZone;
      const label=zoneLabel(value);
      const title=zoneTitleMarkup(value);
      const current=fmtT(ev(key.temp(value)));
      const setpoint=fmtT(ev(key.effectiveSetpoint(value))??ev(key.setpoint(value)));
      const displayState=zoneDisplayState(value);
      const statusLabel=zoneStatusLabel(displayState);
      const statusClass=zoneStatusClass(displayState);
      const mergedWith=merge.partners[value];
      const isMerged=mergedWith.length>0;
      const mergeText=isMerged?t('overview.zone.mergedWith',{zones:mergedWith.map(zoneIdShort).join(', ')}):'';
      const pairStart=isMerged&&mergedWith.includes(value+1)&&merge.roots[value]===merge.roots[value+1];
      const pairCont=isMerged&&mergedWith.includes(value-1)&&merge.roots[value]===merge.roots[value-1];
      const mergeClass=[isMerged?'is-merged':'',pairStart?'zo-pair-start':'',pairCont?'zo-pair-cont':''].filter(Boolean).join(' ');
      const ariaLabel=`${label}, ${current} / ${setpoint}, ${statusLabel}${mergeText?', '+mergeText:''}`.replace(/"/g,'&quot;');
      const mergeLine=isMerged?`<span class="zo-merge">${mergeText}</span>`:'';
      if(desktop){
        return `<button type="button" class="zone-overview-card ${statusClass}${mergeClass?' '+mergeClass:''}" data-zone-select="${value}" aria-current="${selected?'true':'false'}" aria-label="${ariaLabel}" title="${ariaLabel}" tabindex="${selected?'0':'-1'}"><span class="zo-status" aria-hidden="true"></span><span class="zo-title zone-label-compact">${title}</span><span class="zo-temps">${current} / ${setpoint}</span>${mergeLine}</button>`;
      }
      return `<div class="zone-overview-card ${statusClass}${mergeClass?' '+mergeClass:''}" role="listitem" aria-label="${ariaLabel}" title="${ariaLabel}"><span class="zo-status" aria-hidden="true"></span><span class="zo-title zone-label-compact">${title}</span><span class="zo-temps">${current} / ${setpoint}</span>${mergeLine}</div>`;
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
  function rebuildZoneChrome(){ rebuildZoneOverview(); rebuildMobileZoneChips(); }
  function updateMobileZoneDock(){ const inZones=getDashboardValue('section')==='zones'; mobileZoneDock.hidden=!inZones; mobileZoneDock.setAttribute('aria-hidden',inZones?'false':'true'); shell.classList.toggle('has-zone-dock',inZones); }
  function selectZone(value){ setSelectedZone(value); }
  function updateSection(){ const section=getDashboardValue('section')||'overview'; sections.forEach((node)=>node.classList.toggle('active',node.dataset.section===section)); updateZoneDetail(); }
  function updateSummary(){
    const enabled=[]; let active=0; let faults=0; for(let z=1;z<=6;z++){ const on=String(es(key.enabled(z))).toLowerCase()==='on'; const state=String(es(key.state(z))).toLowerCase(); const fault=String(es(key.motorLastFault(z))).toLowerCase(); if(on) enabled.push(z); if(on&&['heating','calling'].includes(state)) active++; if(state==='fault'||(fault!==''&&fault!=='none'&&fault!=='ok')) faults++; }
    const flow=ev(gkey.flow), ret=ev(gkey.ret), touch=String(es(gkey.authorityState)||'').replace(/_/g,' '); const healthy=faults===0&&getDashboardValue('live');
    const html=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${healthy?'status-ok':getDashboardValue('live')?'status-warn':'status-danger'}">${healthy?'Operating normally':getDashboardValue('live')?'Needs attention':'Device offline'}</h2><p>${faults?faults+' zone fault'+(faults===1?'':'s')+' require attention.':getDashboardValue('live')?'V6 is running local control safely.':'Unable to read current manifold state.'}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${active} zones</strong><small>${enabled.length} enabled</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${fmtT(flow)}</strong><small>Return ${fmtT(ret)}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${touch||'not connected'}</strong><small>${ev(gkey.authorityLeaseRemainingS)?Math.round(ev(gkey.authorityLeaseRemainingS))+' s lease':'local control'}</small></div>`;
    const touchApproved=isEntityOn(gkey.authorityConfigured); const drivers=String(es(gkey.drivers)||'off');
    el.querySelector('.overview-status').innerHTML=html; el.querySelector('.hydraulic-summary').textContent=`${active} heating · Flow ${fmtT(flow)} · Return ${fmtT(ret)}`; el.querySelector('.settings-readiness').innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${getDashboardValue('live')?'status-ok':'status-danger'}">${getDashboardValue('live')?'Ready':'Waiting for device'}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${getDashboardValue('live')?'Live':'Offline'}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${touchApproved?'Approved':'Not approved'}</strong><small>${touchApproved?'authenticated control':'local control only'}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${drivers}</strong><small>motor outputs</small></div>`; el.querySelector('.diagnostics-readiness').innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${faults?'status-danger':healthy?'status-ok':'status-warn'}">${faults?faults+' issue'+(faults===1?'':'s'):healthy?'Healthy':'Awaiting data'}</h2><p>${faults?'Resolve current exceptions before using service controls.':'No active motor faults reported.'}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${faults}</strong><small>${faults?'requires review':'none reported'}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${drivers}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${touch||'not connected'}</strong><small>${touchApproved?'approved':'local control'}</small></div>`;
    [el.querySelector('.overview-attention'),el.querySelector('.diagnostics-attention')].forEach((attention)=>{ attention.hidden=!faults; attention.innerHTML=faults?`<strong>Review ${faults} zone fault${faults===1?'':'s'}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:''; });
  }
  function updateZoneDetail(){ const zone=getDashboardValue('selectedZone')||1; const inZones=getDashboardValue('section')==='zones'; selectedTitle.innerHTML=zoneTitleMarkup(zone); rebuildZoneChrome(); updateMobileZoneDock(); detail.hidden=!inZones; }
  function onZoneSelectClick(event){ const tab=event.target.closest('[data-zone-select]'); if(tab) selectZone(Number(tab.dataset.zoneSelect)); }
  function onZoneOverviewClick(event){ if(!isDesktopZoneSwitcher()) return; onZoneSelectClick(event); }
  function onZoneOverviewKeydown(event){ if(!isDesktopZoneSwitcher()) return; if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const current=getDashboardValue('selectedZone')||1; const next=event.key==='Home'?1:event.key==='End'?6:event.key==='ArrowLeft'?(current===1?6:current-1):(current===6?1:current+1); selectZone(next); requestAnimationFrame(()=>zoneOverview.querySelector(`[data-zone-select="${next}"]`)?.focus()); }
  function onZoneChipKeydown(event){ if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const current=getDashboardValue('selectedZone')||1; const next=event.key==='Home'?1:event.key==='End'?6:event.key==='ArrowLeft'?(current===1?6:current-1):(current===6?1:current+1); selectZone(next); requestAnimationFrame(()=>mobileZoneChips.querySelector(`[data-zone-select="${next}"]`)?.focus()); }
  zoneOverview.addEventListener('click',onZoneOverviewClick);
  zoneOverview.addEventListener('keydown',onZoneOverviewKeydown);
  window.matchMedia('(min-width: 901px)').addEventListener('change',rebuildZoneOverview);
  mobileZoneChips.addEventListener('click',onZoneSelectClick);
  mobileZoneChips.addEventListener('keydown',onZoneChipKeydown);
  el.querySelectorAll('[data-open-zones]').forEach((button)=>button.addEventListener('click',()=>setSection('zones')));
  el.querySelectorAll('[data-help-section]').forEach((node)=>node.addEventListener('click',(event)=>{event.preventDefault();setSection(node.dataset.helpSection)}));
  subscribeDashboard('section',updateSection); subscribeDashboard('selectedZone',updateZoneDetail); subscribeDashboard('live',updateSummary); subscribeDashboard('zoneNames',()=>{ rebuildZoneChrome(); updateSummary(); }); subscribeLanguage(()=>{ localize(el); rebuildZoneChrome(); });
  for(let z=1;z<=6;z++){ [key.temp(z),key.setpoint(z),key.effectiveSetpoint(z),key.valve(z),key.state(z),key.enabled(z),key.motorLastFault(z),key.syncTo(z)].forEach((id)=>subscribe(id,()=>{ updateSummary(); rebuildZoneChrome(); })); } [gkey.flow,gkey.ret,gkey.authorityConfigured,gkey.authorityState,gkey.authorityLeaseRemainingS,gkey.drivers].forEach((id)=>subscribe(id,updateSummary)); localize(el); updateSection(); updateZoneDetail(); updateSummary();
 }});
