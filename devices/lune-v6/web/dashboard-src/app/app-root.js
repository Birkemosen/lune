import { component, mountComponent } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../core/store.js';
import { localize, subscribeLanguage } from '../core/i18n.js';

// =====================
// CSS
// =====================
const css = `
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");

:root {
  /* ===========================================================
     Palette (thermal utility):
       #00131d #002f45 #2c4875 #7aa7ce #9dbc78
       #ff6361 #ff8531 #ffa600 #ffd380
     Dark cool tones → surfaces/borders; orange → primary accent,
     muted steel blue → secondary/cool return/weather data; warm members
     → data series + states. Greens for "OK" status are kept for status
     legibility.
     =========================================================== */
  --accent: #ff8a3d;          /* orange — primary accent */
  --blue: #7eb6d8;            /* muted cool blue — secondary / return / wind accent */
  /* Chart data series — orange (warm) + muted blue (cool). */
  --series-warm: #ff8a3d;
  --series-cool: #7eb6d8;
  --series-cool-fill: rgba(126,182,216,.14);
  --series-solar: #ffd36a;    /* gold — solar irradiance / current-hour highlight */
  /* Axis/tick label color — warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(238,230,218,.82);
  --bg: #091217;
  --surface: rgba(18,30,36,.58);
  --card: rgba(18,30,36,.74);
  --border: rgba(229,240,244,.20);
  --text: #f8f2e9;
  --text-strong: #fff8ea;
  --text-secondary: rgba(232,226,216,.78);
  --muted: rgba(232,226,216,.72);
  --text-faint: rgba(216,226,232,.50);
  --text-on-accent: #071015;
  --overlay-bg: rgba(7,16,21,.90);
  --overlay-bg-soft: rgba(7,16,21,.66);
  --soft: rgba(255,255,255,.08);
  --panel-border: rgba(229,240,244,.20);
  --panel-border-soft: rgba(229,240,244,.12);
  --divider: rgba(255,255,255,.08);
  --divider-dashed: rgba(229,240,244,.18);
  --panel-bg: rgba(255,255,255,.075);
  --panel-bg-vibrant: linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.04));
  --panel-bg-flat: linear-gradient(145deg, rgba(255,255,255,.085), rgba(255,255,255,.035));
  --panel-shadow: 16px 18px 38px rgba(0,0,0,.34), -10px -10px 28px rgba(255,255,255,.035), inset 0 1px 0 rgba(255,255,255,.16);
  --panel-shadow-soft: var(--panel-shadow);
  --state-ok: #8fe08e;
  --state-warn: #ffbd4a;
  --state-danger: #ff7572;
  --state-disabled: #7e8b95;
  --control-bg: rgba(255,255,255,.085);
  --control-bg-hover: rgba(255,255,255,.14);
  --control-border: rgba(235,245,248,.22);
  --control-border-strong: rgba(235,245,248,.36);
  --control-border-hover: rgba(235,245,248,.48);
  --control-knob: #efe6dd;
  --focus-ring: rgba(124,155,208,.72);
  --focus-ring-soft: rgba(124,155,208,.60);
  --focus-border: rgba(124,155,208,.55);
  --accent-bg-soft: rgba(255,138,61,.14);
  --accent-border: rgba(255,138,61,.38);
  --accent-border-hover: rgba(255,138,61,.54);
  --accent-text-soft: #ffe8ba;
  --success-bg: rgba(45,110,45,.28);
  --success-bg-soft: rgba(121,209,126,.25);
  --success-border: rgba(121,209,126,.50);
  --success-border-soft: rgba(121,209,126,.25);
  --success-text-soft: #CBFFD0;
  --warn-bg-soft: rgba(255,166,0,.12);
  --warn-border: rgba(255,166,0,.42);
  --danger-bg: rgba(255,118,118,.20);
  --danger-bg-strong: rgba(255,100,100,.30);
  --danger-bg-soft: rgba(255,100,100,.15);
  --danger-border: rgba(255,118,118,.50);
  --danger-border-soft: rgba(255,118,118,.40);
  --danger-border-strong: rgba(255,100,100,.60);
  --danger-text: #FFD9D9;
  --status-muted-bg: rgba(70,70,70,.28);
  --status-muted-border: rgba(150,150,150,.25);
  --status-muted-text: #ADADAD;
  --viz-flow-low: #7aa7ce;
  --viz-flow-mid: #9dbc78;
  --viz-flow-high: #ff8531;
  --viz-flow-hot: #ffa600;
  --viz-delta-low: #7aa7ce;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #ff6361;
  --green: #8fe08e;
  --red: #ff7572;
  --font-ui: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 100%; scroll-behavior: smooth; }
body {
  font-family: var(--font-ui);
  background: linear-gradient(135deg, #071015 0%, #0c2026 38%, #171612 70%, #081015 100%);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    linear-gradient(115deg, rgba(255,255,255,.08), transparent 28%, rgba(126,182,216,.07) 50%, transparent 72%, rgba(255,138,61,.08)),
    repeating-linear-gradient(90deg, rgba(255,255,255,.028) 0 1px, transparent 1px 84px),
    repeating-linear-gradient(0deg, rgba(255,255,255,.018) 0 1px, transparent 1px 84px);
  mask-image: linear-gradient(180deg, rgba(0,0,0,.92), rgba(0,0,0,.36));
}

.app {
  display: block;
  min-height: 100vh;
}

.shell {
  padding: 18px;
  width: min(1320px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 0 18px;
  align-items: start;
}

.hdr {
  grid-column: 1 / -1;
}

.side-panel {
  position: sticky;
  top: 14px;
  min-width: 0;
  min-height: calc(100vh - 112px);
  padding: 12px 14px 12px 0;
  border-right: 1px solid var(--panel-border-soft);
}

.view-panel {
  min-width: 0;
}

.sec {
  display: none;
  margin-bottom: 22px;
}

.sec.active {
  display: block;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > * {
  flex: 1;
}

.zone-layout,
.logs-layout {
  display: grid;
  gap: 14px;
}

/* Logs: main log stream (2/3) + stacked diagnostics column (1/3). */
.logs-layout {
  grid-template-columns: 2fr 1fr;
  align-items: start;
}

.logs-main-col,
.logs-side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot,
.zone-recovery-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > *,
.zone-recovery-slot > * {
  flex: 1;
}

/* Middle column stacks the sensor (connectivity) and fault/relearn cards,
   stretching to match the Zone and Zone Settings columns' height. */
.zone-mid-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
/* Slots grow to share the column's full height so the stack matches the Zone
   and Zone Settings columns (no gap left below the last card). */
.zone-mid-col > * { width: 100%; flex: 1 1 auto; }

.zone-layout .ui-card,
.zone-layout .zone-detail,
.zone-layout .diag-zone-recovery {
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
}

.settings-layout,
.diagnostics-layout {
  display: grid;
  gap: 18px;
}

.settings-layout {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.settings-group {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
  backdrop-filter: blur(16px) saturate(1.18);
}

.diagnostics-group {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
  backdrop-filter: blur(16px) saturate(1.18);
}

.diagnostics-group {
  padding-top: 14px;
}

.settings-group-head,
.diagnostics-group-head {
  display: flex;
  align-items: center;
  min-height: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-group-title,
.diagnostics-group-title {
  font-family: var(--font-display);
  color: var(--accent);
  font-size: .875rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.settings-group-grid,
.diagnostics-group-grid {
  display: grid;
  gap: 12px;
  align-items: start;
  align-content: start;
}

.settings-installation-grid {
  grid-template-columns: 1fr;
}

.settings-hydraulic-grid {
  grid-template-columns: 1fr;
}

.settings-motor-grid {
  grid-template-columns: 1fr;
}

.settings-hydraulic-stack,
.manual-control-col {
  display: grid;
  gap: 12px;
}

.settings-group .ui-card,
.settings-group .settings-card {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 !important;
}

.settings-group-grid > * + *,
.settings-group .ui-card + .ui-card,
.settings-group .settings-card + .settings-card,
.settings-hydraulic-stack > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.settings-group .ui-card-title,
.settings-group .settings-card .card-title {
  color: var(--muted);
  font-size: .74rem;
  letter-spacing: .78px;
  margin-bottom: 2px;
  padding-bottom: 4px;
  border-bottom: 0;
}

.settings-group .settings-card .toggle-row {
  padding: 8px 0 10px !important;
  border: 0 !important;
  border-bottom: 1px solid var(--panel-border-soft) !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.settings-group .gated-body,
.settings-group .settings-motor-cal-card .mc-advanced-body {
  background: transparent !important;
  box-shadow: none !important;
}

.settings-group .settings-motor-cal-card .runtime-note {
  box-shadow: none !important;
}

.diagnostics-layout {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
}

.diagnostics-logs-group,
.diagnostics-health-group {
  grid-column: span 2;
}

.logs-main-col,
.manual-control-col {
  min-width: 0;
}

.diag-health-grid,
.diag-actions-grid {
  grid-template-columns: 1fr;
}

.diagnostics-group .ui-card,
.diagnostics-group .settings-card,
.diagnostics-group .logs-view,
.diagnostics-group .diag-zone-motor,
.diagnostics-group .connectivity-card,
.diagnostics-group .diag-i2c {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.diagnostics-group-grid > * + *,
.manual-control-col > * + *,
.logs-main-col > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.diagnostics-group .ui-card-title,
.diagnostics-group .settings-card .card-title,
.diagnostics-group .logs-view .card-title,
.diagnostics-group .diag-zone-motor .card-title,
.diagnostics-group .connectivity-card .card-title,
.diagnostics-group .diag-i2c .card-title {
  color: var(--text-secondary);
  font-size: .76rem;
  letter-spacing: .9px;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom-color: var(--panel-border-soft);
}

.diagnostics-group .authority-card .setpoint-box {
  padding: 10px 0 12px;
  border: 0;
  border-top: 1px solid var(--panel-border-soft);
  border-bottom: 1px solid var(--panel-border-soft);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.diagnostics-group .logs-stream,
.diagnostics-group .diag-i2c pre {
  background: rgba(0,0,0,.10);
  border-color: var(--panel-border-soft);
  box-shadow: none;
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .78rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}

.placeholder-card h3 {
  font-size: .875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
}

.placeholder-card p {
  color: var(--muted);
  font-size: .86rem;
}

@media (max-width: 1200px) {
  .diagnostics-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .shell {
    display: block;
    padding: 12px 12px 78px;
  }

  .side-panel {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 10px;
    top: auto;
    z-index: 40;
    min-height: 0;
    padding: 8px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: rgba(9,18,23,.82);
    box-shadow: var(--panel-shadow);
    backdrop-filter: blur(18px) saturate(1.25);
  }

  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .logs-layout,
  .diagnostics-layout { grid-template-columns: 1fr; }

  .diagnostics-logs-group,
  .diagnostics-health-group {
    grid-column: auto;
  }

  .zone-detail-slot {
    grid-column: 1;
  }
}

/* ============================
   GLOBAL INTERACTIVE STATES
   ============================ */

/* Consistent focus ring for all interactive elements */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Disabled state for all buttons/inputs */
button:disabled,
input:disabled,
select:disabled {
  opacity: .40;
  cursor: not-allowed;
  pointer-events: none;
}

/* Gated card body: faded + non-interactive when its feature is disabled.
   The enable toggle stays outside this wrapper so it remains clickable. */
.gated-body {
  transition: opacity .2s ease;
}
.gated-body.is-disabled {
  opacity: .42;
  pointer-events: none;
  user-select: none;
}
`;

injectStyle('app-root', css);

// =====================
// TEMPLATE
// =====================
const template = (ctx) => `
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <aside class="side-panel"></aside>
      <div class="view-panel">
        <section class="sec active" data-section="overview">
          <div class="overview-flow"></div>
          <div class="overview-timeline" style="margin-top:14px"></div>
          <div class="dashboard-grid">
            <div class="overview-flow-return"></div>
          </div>
        </section>
        <section class="sec" data-section="zones">
          <div class="zone-selector"></div>
          <div class="zone-layout">
            <div class="zone-detail-slot"></div>
            <div class="zone-mid-col">
              <div class="zone-sensor-slot"></div>
              <div class="zone-recovery-slot"></div>
            </div>
            <div class="zone-room-slot"></div>
          </div>
        </section>
        <section class="sec" data-section="settings">
          <div class="settings-layout">
            <div class="settings-group settings-installation-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.installation">Installation</span></div>
              <div class="settings-group-grid settings-installation-grid">
                <div class="settings-manifold-slot"></div>
              </div>
            </div>
            <div class="settings-group settings-hydraulic-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.hydraulic">Hydraulic Safety</span></div>
              <div class="settings-group-grid settings-hydraulic-grid">
                <div class="settings-hydraulic-stack">
                  <div class="settings-min-flow-slot"></div>
                  <div class="settings-preheat-slot"></div>
                </div>
              </div>
            </div>
            <div class="settings-group settings-motor-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.motorAdvanced">Motor Advanced</span></div>
              <div class="settings-group-grid settings-motor-grid">
                <div class="settings-motor-cal-slot"></div>
              </div>
            </div>
          </div>
        </section>
        <section class="sec" data-section="diagnostics">
          <div class="diagnostics-layout">
            <div class="diagnostics-group diagnostics-logs-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.logs">Logs</span></div>
              <div class="logs-main-col"></div>
            </div>
            <div class="diagnostics-group diagnostics-manual-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.manual">Manual Motor Control</span></div>
              <div class="manual-control-col"></div>
            </div>
            <div class="diagnostics-group diagnostics-actions-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.actions">Service Actions</span></div>
              <div class="diagnostics-group-grid diag-actions-grid"></div>
            </div>
            <div class="diagnostics-group diagnostics-health-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.health">Device Health</span></div>
              <div class="diagnostics-group-grid diag-health-grid"></div>
            </div>
          </div>
        </section>
        <div class="ftr" data-i18n="footer.product">LUNE V6 · LOCAL MANIFOLD CONTROLLER</div>
      </div>
    </main>
  </div>
`;

// =====================
// COMPONENT
// =====================
component({
  tag: 'app-root',

  render: template,

  onMount(ctx, el) {
    el.querySelector('.hdr').appendChild(mountComponent('hv6-header'));
    el.querySelector('.side-panel').appendChild(mountComponent('hv6-sidebar'));
    el.querySelector('.overview-flow').appendChild(mountComponent('flow-diagram'));
    el.querySelector('.overview-timeline').appendChild(mountComponent('zone-state-timeline'));
    el.querySelector('.overview-flow-return').appendChild(mountComponent('graph-widgets', { variant: 'flow-return' }));

    el.querySelector('.zone-selector').appendChild(mountComponent('zone-grid'));
    el.querySelector('.zone-detail-slot').appendChild(mountComponent('zone-detail', { zone: getDashboardValue('selectedZone') }));
    // Middle column: sensor (connectivity) + fault/relearn, both following the selected zone.
    el.querySelector('.zone-sensor-slot').appendChild(mountComponent('zone-sensor-card'));
    el.querySelector('.zone-recovery-slot').appendChild(mountComponent('diag-zone-recovery-card'));
    el.querySelector('.zone-room-slot').appendChild(mountComponent('zone-room-card'));

    el.querySelector('.settings-manifold-slot').appendChild(mountComponent('settings-manifold-card'));
    el.querySelector('.settings-min-flow-slot').appendChild(mountComponent('settings-minimum-flow-card'));
    el.querySelector('.settings-preheat-slot').appendChild(mountComponent('smart-preheat-card'));
    el.querySelector('.settings-motor-cal-slot').appendChild(mountComponent('settings-motor-calibration-card'));

    const logsMain = el.querySelector('.logs-main-col');
    logsMain.appendChild(mountComponent('logs-view'));
    const manualCol = el.querySelector('.manual-control-col');
    manualCol.appendChild(mountComponent('diag-manual-badge'));
    manualCol.appendChild(mountComponent('diag-zone-motor-card', { zone: getDashboardValue('selectedZone') || 1 }));
    const healthGrid = el.querySelector('.diag-health-grid');
    healthGrid.appendChild(mountComponent('connectivity-card'));
    healthGrid.appendChild(mountComponent('diag-system-card'));
    healthGrid.appendChild(mountComponent('diag-i2c'));
    const actionsGrid = el.querySelector('.diag-actions-grid');
    actionsGrid.appendChild(mountComponent('settings-control-card'));

    const sectionNodes = el.querySelectorAll('.sec');

    function updateSection() {
      const section = getDashboardValue('section');
      sectionNodes.forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-section') === section);
      });
    }

    subscribeDashboard('section', updateSection);
    subscribeLanguage(() => localize(el));
    localize(el);
    updateSection();
  }
});
