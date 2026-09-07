import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, getDashboardValue, isEntityOn, subscribeDashboard, setDashboardValue } from '../../core/store.js';
import {
  emergencyStopMotors, fetchDiagnostics, fetchMotorTraceCsv,
  openMotorTimed, closeMotorTimed, setDriversEnabled, setGlobalNumber, setManualMode,
} from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { analyzeMotorTrace, overlayLevels, parseMotorTraceCsv, strokePhaseKey } from '../../utils/motor-trace.js';
import { renderMotorLabCharts } from './motor-lab-charts.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const POLL_MS = 250;
const CAPTURE_TIMEOUT_MS = 20000;
const STEPS = ['setup', 'arm', 'seat', 'open', 'close', 'review'];

const css = `
.diag-motor-lab { color: var(--text-main); }
.diag-motor-lab .lab-toolbar {
  position: sticky; top: 0; z-index: 3;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  margin: 0 0 14px; padding: 10px 0 12px;
  border-bottom: 1px solid var(--separator);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
}
.diag-motor-lab .lab-toolbar-lead {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0;
}
.diag-motor-lab .lab-dev {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--text-muted); font-size: .78rem; font-weight: 650;
}
.diag-motor-lab .lab-dev strong {
  display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px;
  border-radius: 999px; background: var(--warn-bg-soft); border: 1px solid var(--warn-border);
  color: var(--state-warn); font-size: .66rem; letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-select {
  min-height: 44px; min-width: 148px; max-width: 220px; padding: 0 12px;
  border: 1px solid var(--control-border); border-radius: 8px;
  background: var(--control-bg); color: var(--text-strong); font-weight: 650;
}
.diag-motor-lab .lab-zone-chip {
  display: inline-flex; align-items: center; min-height: 32px; padding: 0 12px;
  border: 1px solid var(--separator); border-radius: 999px;
  color: var(--text-strong); font-size: .76rem; font-weight: 650; white-space: nowrap;
  background: color-mix(in srgb, var(--surface-raised) 70%, transparent);
}
.diag-motor-lab .lab-zone-chip[hidden] { display: none; }
.diag-motor-lab .lab-step-chip {
  display: inline-flex; align-items: center; min-height: 32px; padding: 0 12px;
  border: 1px solid var(--separator); border-radius: 999px;
  color: var(--text-muted); font-size: .76rem; font-weight: 650; white-space: nowrap;
}
.diag-motor-lab .lab-step-chip[data-state="active"] {
  color: var(--accent); border-color: var(--accent-border); background: var(--accent-bg-soft);
}
.diag-motor-lab .lab-step-chip[data-state="halted"] {
  color: var(--danger-text); border-color: var(--danger-border);
}
.diag-motor-lab .lab-estop {
  min-width: 148px; min-height: 48px; padding: 0 18px;
  border: 1px solid var(--danger-border-strong); border-radius: 10px;
  background: var(--danger-bg-strong); color: var(--danger-text);
  font-weight: 800; letter-spacing: .04em; text-transform: uppercase; cursor: pointer;
  box-shadow: 0 0 0 4px var(--danger-bg);
}
.diag-motor-lab .lab-estop:hover { filter: brightness(1.08); }
.diag-motor-lab .lab-estop:focus-visible { outline: 3px solid var(--state-danger); outline-offset: 3px; }
.diag-motor-lab .lab-estop[data-armed="true"] { animation: lab-estop-pulse 1.1s ease-in-out infinite; }
@keyframes lab-estop-pulse { 50% { box-shadow: 0 0 0 7px var(--danger-bg); } }
.diag-motor-lab .lab-banner {
  display: none; margin: 0 0 14px; padding: 10px 12px; border-left: 3px solid var(--state-danger);
  background: var(--danger-bg-soft); color: var(--danger-text); font-size: .84rem; font-weight: 650;
}
.diag-motor-lab .lab-banner.show { display: block; }
.diag-motor-lab .lab-guide {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px 28px;
  align-items: end;
  margin: 0 0 18px; padding: 0 0 16px;
  border-bottom: 1px solid var(--separator);
}
.diag-motor-lab .lab-guide[data-setup="true"] {
  grid-template-columns: minmax(0, 1.35fr) auto auto;
}
.diag-motor-lab .lab-stage { margin: 0; min-width: 0; }
.diag-motor-lab .lab-kicker {
  color: var(--text-faint); font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-stage h3 { margin: 4px 0 6px; color: var(--text-strong); font-size: 1.15rem; font-weight: 700; }
.diag-motor-lab .lab-stage p { margin: 0; color: var(--text-muted); font-size: .88rem; line-height: 1.45; max-width: 46rem; }
.diag-motor-lab .lab-setup {
  display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch;
  gap: 8px; margin: 0; min-width: 148px;
}
.diag-motor-lab .lab-setup[hidden] { display: none; }
.diag-motor-lab .lab-label {
  color: var(--text-faint); font-size: .72rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-actions {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end;
  gap: 8px; margin: 0;
}
.diag-motor-lab .lab-actions .ui-btn {
  flex: 0 0 auto; width: auto; min-width: 148px; min-height: 44px;
}
.diag-motor-lab .lab-actions .ui-btn.primary {
  background: var(--accent); border-color: var(--accent); color: var(--text-on-accent);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 8px 18px rgba(0,0,0,.16);
}
.diag-motor-lab .lab-actions .ui-btn.primary:hover { filter: brightness(1.06); color: var(--text-on-accent); }
.diag-motor-lab .lab-actions .ui-btn:disabled { opacity: .45; cursor: not-allowed; }
.diag-motor-lab .lab-board {
  margin: 0 0 16px; border: 1px solid var(--separator); border-radius: 12px;
  background: var(--surface-raised); overflow: hidden;
}
.diag-motor-lab .lab-phase-row {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  margin: 0; padding: 12px 16px;
  border-bottom: 1px solid var(--separator);
}
.diag-motor-lab .lab-phase-row small {
  color: var(--text-faint); font-size: .68rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-phase-label {
  color: var(--text-strong); font-size: 1.05rem; font-weight: 750; letter-spacing: -.02em;
}
.diag-motor-lab .lab-phase-label[data-kind="run"] { color: var(--state-warn); }
.diag-motor-lab .lab-phase-label[data-kind="ok"] { color: var(--state-ok); }
.diag-motor-lab .lab-phase-label[data-kind="halt"] { color: var(--state-danger); }
.diag-motor-lab .lab-instruments {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0;
  margin: 0; border: 0; border-radius: 0; background: transparent; overflow: visible;
}
.diag-motor-lab .lab-cluster {
  padding: 14px 16px; border-right: 1px solid var(--separator);
}
.diag-motor-lab .lab-cluster:last-child { border-right: 0; }
.diag-motor-lab .lab-cluster h4 {
  margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--separator);
  color: var(--text-faint); font-size: .68rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-gauges {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px 14px;
}
.diag-motor-lab .lab-gauge span {
  display: block; color: var(--text-faint); font-size: .64rem; font-weight: 700;
  letter-spacing: .07em; text-transform: uppercase;
}
.diag-motor-lab .lab-gauge b {
  display: block; margin-top: 3px; color: var(--text-strong);
  font-family: var(--mono); font-size: 1.05rem; font-variant-numeric: tabular-nums;
}
.diag-motor-lab .lab-gauge b[data-phase="contact"],
.diag-motor-lab .lab-gauge b[data-seen="true"] { color: var(--state-warn); }
.diag-motor-lab .lab-gauge b[data-phase="load"] { color: var(--state-ok); }
.diag-motor-lab .lab-gauge b[data-phase="stopping"] { color: var(--state-danger); }
.diag-motor-lab .lab-log {
  margin: 0 0 16px; padding: 10px 12px;
  border: 1px solid var(--separator); border-radius: 10px;
  color: var(--text-muted); font-family: var(--mono); font-size: .74rem; line-height: 1.55;
  max-height: 7.4em; overflow: auto;
}
.diag-motor-lab .lab-log div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.diag-motor-lab .lab-chart { margin: 0 0 14px; }
.diag-motor-lab .lab-metrics {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 0 0 14px;
}
.diag-motor-lab .lab-metric {
  padding: 10px 12px; border: 1px solid var(--separator); border-radius: 10px; background: var(--surface-raised);
}
.diag-motor-lab .lab-metric span { display: block; color: var(--text-faint); font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.diag-motor-lab .lab-metric strong { display: block; margin-top: 4px; color: var(--text-strong); font-size: 1.05rem; font-variant-numeric: tabular-nums; }
.diag-motor-lab .lab-suggest { width: 100%; border-collapse: collapse; margin: 0 0 12px; }
.diag-motor-lab .lab-suggest th, .diag-motor-lab .lab-suggest td {
  padding: 8px 6px; text-align: left; font-size: .82rem; border-bottom: 1px solid var(--separator);
}
.diag-motor-lab .lab-suggest th { color: var(--text-faint); font-size: .68rem; letter-spacing: .06em; text-transform: uppercase; }
.diag-motor-lab .lab-suggest td { color: var(--text-strong); font-variant-numeric: tabular-nums; }
.diag-motor-lab .lab-suggest .better { color: var(--state-ok); font-weight: 700; }
@media (max-width: 980px) {
  .diag-motor-lab .lab-instruments { grid-template-columns: 1fr; }
  .diag-motor-lab .lab-cluster { border-right: 0; border-bottom: 1px solid var(--separator); }
  .diag-motor-lab .lab-cluster:last-child { border-bottom: 0; }
}
@media (max-width: 860px) {
  .diag-motor-lab .lab-guide,
  .diag-motor-lab .lab-guide[data-setup="true"] {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 14px;
  }
  .diag-motor-lab .lab-actions { justify-content: flex-start; }
}
@media (max-width: 720px) {
  .diag-motor-lab .lab-metrics { grid-template-columns: 1fr 1fr; }
  .diag-motor-lab .lab-toolbar { align-items: stretch; }
  .diag-motor-lab .lab-estop { width: 100%; }
  .diag-motor-lab .lab-select { max-width: none; width: 100%; }
  .diag-motor-lab .lab-gauges { grid-template-columns: 1fr 1fr; }
}
`;

injectStyle('diag-motor-lab', css);

const template = () => `
  <div class="diag-motor-lab">
    <div class="lab-toolbar">
      <div class="lab-toolbar-lead">
        <div class="lab-dev"><strong>Dev</strong><span data-i18n="diagnostics.lab.hint">Guided stroke capture for endstop thresholds.</span></div>
        <span class="lab-zone-chip" hidden></span>
        <span class="lab-step-chip" data-state="active"></span>
      </div>
      <button type="button" class="lab-estop" data-i18n="diagnostics.lab.estop" data-i18n-label="diagnostics.lab.estopHint">Emergency stop</button>
    </div>
    <div class="lab-banner" role="status" aria-live="assertive"></div>
    <section class="lab-guide" data-setup="true">
      <section class="lab-stage">
        <div class="lab-kicker"></div>
        <h3></h3>
        <p></p>
      </section>
      <div class="lab-setup" hidden>
        <label class="lab-label" for="lab-zone-select" data-i18n="diagnostics.lab.motor">Motor</label>
        <select id="lab-zone-select" class="lab-select lab-zone" aria-label="Motor"></select>
      </div>
      <div class="lab-actions">
        <button type="button" class="ui-btn primary lab-primary"></button>
        <button type="button" class="ui-btn lab-secondary" hidden></button>
      </div>
    </section>
    <section class="lab-board" aria-label="Status">
      <div class="lab-phase-row" aria-live="polite">
        <small data-i18n="diagnostics.lab.status">Status</small>
        <strong class="lab-phase-label">Idle</strong>
      </div>
      <div class="lab-instruments">
        <section class="lab-cluster" aria-labelledby="lab-cluster-motion">
          <h4 id="lab-cluster-motion" data-i18n="diagnostics.lab.cluster.motion">Motion</h4>
          <div class="lab-gauges">
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.currentMa">Current</span><b data-k="current">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.mean">Running mean</span><b data-k="mean">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.peak">Peak</span><b data-k="peak">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.slope">Slope</span><b data-k="slope">—</b></div>
          </div>
        </section>
        <section class="lab-cluster" aria-labelledby="lab-cluster-position">
          <h4 id="lab-cluster-position" data-i18n="diagnostics.lab.cluster.position">Position</h4>
          <div class="lab-gauges">
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.runtime">Runtime</span><b data-k="runtime">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.motion">Motion count</span><b data-k="motion">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.cadence">Cadence</span><b data-k="cadence">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.stroke">Stroke</span><b data-k="stroke">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pin">Pin</span><b data-k="pin">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.direction">Direction</span><b data-k="direction">—</b></div>
          </div>
        </section>
        <section class="lab-cluster" aria-labelledby="lab-cluster-hardware">
          <h4 id="lab-cluster-hardware" data-i18n="diagnostics.lab.cluster.hardware">Hardware</h4>
          <div class="lab-gauges">
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.drivers">Drivers</span><b data-k="drivers">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.busyFlag">Motor busy</span><b data-k="busy">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.armed">Armed</span><b data-k="armed">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.backend">Backend</span><b data-k="backend">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.fault">Fault</span><b data-k="fault">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.invalidSamples">Invalid samples</span><b data-k="invalid">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.tachoRejected">Tacho rejected</span><b data-k="tachoRejected">—</b></div>
          </div>
        </section>
      </div>
    </section>
    <div class="lab-chart"></div>
    <div class="lab-metrics"></div>
    <table class="lab-suggest" hidden>
      <thead>
        <tr>
          <th data-i18n="diagnostics.lab.param">Parameter</th>
          <th data-i18n="diagnostics.lab.current">Current</th>
          <th data-i18n="diagnostics.lab.suggested">Suggested</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <div class="lab-log" aria-label="Event log"></div>
  </div>
`;

function configuredFor(direction) {
  if (direction === 'open') {
    return {
      factor: ev(gkey.openThresholdMultiplier),
      slope: ev(gkey.openSlopeThreshold),
      floor: ev(gkey.openSlopeCurrentFactor),
      ripple: ev(gkey.openRippleLimitFactor),
    };
  }
  return {
    factor: ev(gkey.closeThresholdMultiplier),
    slope: ev(gkey.closeSlopeThreshold),
    floor: ev(gkey.closeSlopeCurrentFactor),
  };
}

function suggestionRows(analysis) {
  const cfg = configuredFor(analysis.direction);
  const prefix = analysis.direction === 'open' ? 'open' : 'close';
  const rows = [
    { key: prefix + '_threshold_multiplier', labelKey: analysis.direction === 'open' ? 'settings.motor.openThreshold' : 'settings.motor.closeThreshold', current: cfg.factor, suggested: analysis.suggested_factor, unit: 'x' },
    { key: prefix + '_slope_threshold', labelKey: analysis.direction === 'open' ? 'settings.motor.openSlope' : 'settings.motor.closeSlope', current: cfg.slope, suggested: analysis.suggested_slope, unit: 'mA/s' },
    { key: prefix + '_slope_current_factor', labelKey: analysis.direction === 'open' ? 'settings.motor.openSlopeFloor' : 'settings.motor.closeSlopeFloor', current: cfg.floor, suggested: analysis.suggested_slope_floor, unit: 'x' },
  ];
  if (analysis.direction === 'open' && analysis.suggested_ripple_limit != null) {
    rows.push({ key: 'open_ripple_limit_factor', labelKey: 'settings.motor.openRippleLimit', current: cfg.ripple, suggested: analysis.suggested_ripple_limit, unit: 'x' });
  }
  return rows;
}

function onOff(value) {
  return t(value ? 'common.on' : 'common.off');
}

function emptyLive() {
  return {
    current: null, mean: null, peak: null, slope: null,
    runtime: 0, motion: 0, busy: false, direction: '—', stroke: 0,
    pinSeen: false, pinAt: null, pinMa: null,
    tachoPeriodUs: null, tachoCadenceUs: null, cadenceHz: null,
    faultCode: 0, armed: false, backend: '—',
    invalidSamples: 0, tachoRejected: 0,
  };
}

export default component({
  tag: 'diag-motor-lab',
  render: template,
  onMount(ctx, el) {
    let zone = Number(getDashboardValue('selectedZone') || 1);
    let step = 'setup';
    let phase = 'idle';
    let run = { active: false, aborted: false, direction: null, timer: null, live: [], started: 0 };
    let captures = { open: null, close: null, seat: null };
    let view = { samples: [], analysis: null, live: false };
    let chartVisible = { current: true, overlays: true, phase: true, cadence: true, slope: true };
    const logLines = [];
    let liveDiag = emptyLive();

    const stepChip = el.querySelector('.lab-step-chip');
    const zoneChip = el.querySelector('.lab-zone-chip');
    const banner = el.querySelector('.lab-banner');
    const guideEl = el.querySelector('.lab-guide');
    const kicker = el.querySelector('.lab-kicker');
    const titleEl = el.querySelector('.lab-stage h3');
    const copyEl = el.querySelector('.lab-stage p');
    const setupEl = el.querySelector('.lab-setup');
    const zoneSelect = el.querySelector('.lab-zone');
    const phaseEl = el.querySelector('.lab-phase-label');
    const logEl = el.querySelector('.lab-log');
    const chartEl = el.querySelector('.lab-chart');
    const metricsEl = el.querySelector('.lab-metrics');
    const table = el.querySelector('.lab-suggest');
    const primaryBtn = el.querySelector('.lab-primary');
    const secondaryBtn = el.querySelector('.lab-secondary');
    const estopBtn = el.querySelector('.lab-estop');
    const gauges = {
      current: el.querySelector('[data-k="current"]'),
      mean: el.querySelector('[data-k="mean"]'),
      peak: el.querySelector('[data-k="peak"]'),
      slope: el.querySelector('[data-k="slope"]'),
      runtime: el.querySelector('[data-k="runtime"]'),
      motion: el.querySelector('[data-k="motion"]'),
      cadence: el.querySelector('[data-k="cadence"]'),
      direction: el.querySelector('[data-k="direction"]'),
      drivers: el.querySelector('[data-k="drivers"]'),
      busy: el.querySelector('[data-k="busy"]'),
      stroke: el.querySelector('[data-k="stroke"]'),
      pin: el.querySelector('[data-k="pin"]'),
      armed: el.querySelector('[data-k="armed"]'),
      backend: el.querySelector('[data-k="backend"]'),
      fault: el.querySelector('[data-k="fault"]'),
      invalid: el.querySelector('[data-k="invalid"]'),
      tachoRejected: el.querySelector('[data-k="tachoRejected"]'),
    };

    function stepIndex(id) {
      return STEPS.indexOf(id);
    }

    function zoneLabel() {
      return t('common.zone') + ' ' + zone;
    }

    function rebuildZones() {
      const current = String(zone);
      zoneSelect.innerHTML = Array.from({ length: 6 }, (_, i) =>
        '<option value="' + (i + 1) + '">' + t('common.zone') + ' ' + (i + 1) + '</option>').join('');
      zoneSelect.value = current;
      zoneSelect.setAttribute('aria-label', t('diagnostics.lab.motor'));
      zoneChip.textContent = zoneLabel();
      zoneChip.setAttribute('aria-label', t('diagnostics.lab.motor'));
    }

    function pushLog(key, vars) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      logLines.push(time + '  ' + t(key, vars));
      if (logLines.length > 8) logLines.shift();
      logEl.innerHTML = logLines.map((line) => '<div>' + line + '</div>').join('');
      logEl.scrollTop = logEl.scrollHeight;
    }

    function showBanner(text) {
      banner.textContent = text || '';
      banner.classList.toggle('show', !!text);
    }

    function setPhase(next, kind) {
      phase = next;
      phaseEl.dataset.kind = kind || '';
      phaseEl.textContent = t('diagnostics.lab.phase.' + next);
    }

    function paintGauges() {
      const phaseKey = strokePhaseKey(liveDiag.stroke);
      gauges.current.textContent = liveDiag.current == null ? '—' : liveDiag.current.toFixed(1) + ' mA';
      gauges.mean.textContent = liveDiag.mean == null ? '—' : liveDiag.mean.toFixed(1) + ' mA';
      gauges.peak.textContent = liveDiag.peak == null ? '—' : liveDiag.peak.toFixed(1) + ' mA';
      gauges.slope.textContent = liveDiag.slope == null ? '—' : liveDiag.slope.toFixed(1) + ' mA/s';
      gauges.runtime.textContent = liveDiag.runtime ? (liveDiag.runtime / 1000).toFixed(1) + ' s' : '—';
      gauges.motion.textContent = liveDiag.motion ? String(liveDiag.motion) : '—';
      gauges.cadence.textContent = liveDiag.cadenceHz == null ? '—' : liveDiag.cadenceHz.toFixed(1) + ' /s';
      gauges.direction.textContent = liveDiag.direction;
      gauges.drivers.textContent = onOff(isEntityOn(gkey.drivers));
      gauges.busy.textContent = onOff(liveDiag.busy);
      gauges.armed.textContent = onOff(liveDiag.armed);
      gauges.backend.textContent = liveDiag.backend || '—';
      gauges.fault.textContent = liveDiag.faultCode ? String(liveDiag.faultCode) : t('common.ok');
      gauges.invalid.textContent = String(liveDiag.invalidSamples || 0);
      gauges.tachoRejected.textContent = String(liveDiag.tachoRejected || 0);
      gauges.stroke.textContent = t('diagnostics.lab.stroke.' + phaseKey);
      gauges.stroke.dataset.phase = phaseKey;
      if (liveDiag.pinSeen) {
        gauges.pin.textContent = t('diagnostics.lab.pinSeen', { count: liveDiag.pinAt });
        gauges.pin.dataset.seen = 'true';
      } else {
        gauges.pin.textContent = t('diagnostics.lab.pinWaiting');
        gauges.pin.dataset.seen = 'false';
      }
    }

    function paintCharts() {
      const overlays = view.analysis ? overlayLevels(view.analysis, configuredFor(view.analysis.direction)) : [];
      const controls = renderMotorLabCharts(chartEl, {
        samples: view.samples,
        analysis: view.analysis,
        live: view.live,
        overlays,
        visible: chartVisible,
      });
      if (!controls) return;
      controls.addEventListener('click', (event) => {
        const btn = event.target.closest('.gw-toggle');
        if (!btn) return;
        const layer = btn.dataset.layer;
        chartVisible[layer] = !chartVisible[layer];
        const any = Object.keys(chartVisible).some((key) => chartVisible[key]);
        if (!any) chartVisible[layer] = true;
        paintCharts();
      });
    }

    function paintAnalysis(analysis, samples, live) {
      view = {
        analysis: analysis && analysis.ok ? analysis : null,
        samples: samples || [],
        live: !!live,
      };
      if (view.analysis) {
        liveDiag.mean = view.analysis.mean_ma;
        liveDiag.peak = view.analysis.peak_ma;
        liveDiag.slope = view.analysis.max_stall_slope_ma_s;
      }
      paintCharts();
      const rows = [];
      if (step === 'review') {
        if (captures.open) rows.push(...suggestionRows(captures.open));
        if (captures.close) rows.push(...suggestionRows(captures.close));
      } else if (view.analysis) {
        rows.push(...suggestionRows(view.analysis));
      }
      if (!view.analysis && step !== 'review') {
        metricsEl.innerHTML = '';
        table.hidden = true;
        return;
      }
      const source = step === 'review' ? (captures.close || captures.open) : view.analysis;
      if (!source) {
        metricsEl.innerHTML = '';
        table.hidden = true;
        return;
      }
      const pinLabel = source.pin_seen
        ? t('diagnostics.lab.pinMetric', { ms: source.pin_t_ms, count: source.pin_motion_count })
        : t('diagnostics.lab.pinWaiting');
      const cells = [
        [t('diagnostics.lab.mean'), source.mean_ma.toFixed(1) + ' mA'],
        [t('diagnostics.lab.peak'), source.peak_ma.toFixed(1) + ' mA'],
        [t('diagnostics.lab.runtime'), (source.runtime_ms / 1000).toFixed(1) + ' s'],
        [t('diagnostics.lab.ripples'), String(source.ripples)],
        [t('diagnostics.lab.pin'), pinLabel],
      ];
      if (step === 'review' && captures.open && captures.close) {
        cells[0] = [t('diagnostics.lab.mean'), captures.open.mean_ma.toFixed(1) + ' / ' + captures.close.mean_ma.toFixed(1) + ' mA'];
        cells[1] = [t('diagnostics.lab.peak'), captures.open.peak_ma.toFixed(1) + ' / ' + captures.close.peak_ma.toFixed(1) + ' mA'];
        const closePin = captures.close.pin_seen
          ? t('diagnostics.lab.pinMetric', { ms: captures.close.pin_t_ms, count: captures.close.pin_motion_count })
          : t('diagnostics.lab.pinWaiting');
        cells[4] = [t('diagnostics.lab.pin'), closePin];
      }
      metricsEl.innerHTML = cells.map((cell) =>
        '<div class="lab-metric"><span>' + cell[0] + '</span><strong>' + cell[1] + '</strong></div>').join('');
      table.querySelector('tbody').innerHTML = rows.map((row) =>
        '<tr><td>' + t(row.labelKey) + '</td><td>' + Number(row.current).toFixed(1) + ' ' + row.unit +
        '</td><td class="better">' + Number(row.suggested).toFixed(1) + ' ' + row.unit + '</td></tr>').join('');
      table.hidden = !rows.length;
    }

    function paintStage() {
      const halted = step === 'halted';
      const current = halted ? 'setup' : step;
      const index = stepIndex(current);
      const chipState = halted ? 'halted' : 'active';
      stepChip.dataset.state = chipState;
      stepChip.textContent = halted
        ? t('diagnostics.lab.halted')
        : t('diagnostics.lab.stepChip', {
          step: index + 1,
          total: STEPS.length,
          name: t('diagnostics.lab.steps.' + current),
        });
      kicker.textContent = halted
        ? t('diagnostics.lab.halted')
        : t('diagnostics.lab.stepOf', { step: index + 1, total: STEPS.length });
      titleEl.textContent = t('diagnostics.lab.' + (halted ? 'halt' : current) + '.title');
      const finished = (step === 'seat' && captures.seat) || (step === 'open' && captures.open) || (step === 'close' && captures.close);
      const copyKey = halted ? 'diagnostics.lab.halt.copy'
        : (finished ? 'diagnostics.lab.' + current + '.done' : 'diagnostics.lab.' + current + '.copy');
      copyEl.textContent = t(copyKey);
      const inSetup = step === 'setup';
      guideEl.dataset.setup = inSetup ? 'true' : 'false';
      setupEl.hidden = !inSetup;
      zoneSelect.disabled = !inSetup || run.active;
      zoneChip.hidden = inSetup;
      zoneChip.textContent = zoneLabel();
      estopBtn.dataset.armed = run.active ? 'true' : 'false';
      paintGauges();

      const busy = run.active;
      let primary = { key: 'diagnostics.lab.next', disabled: busy, action: 'next' };
      let secondary = null;
      if (step === 'setup') primary = { key: 'diagnostics.lab.setup.action', disabled: false, action: 'start' };
      else if (step === 'arm') primary = { key: 'diagnostics.lab.arm.action', disabled: busy, action: 'arm' };
      else if (step === 'seat') primary = { key: captures.seat ? 'diagnostics.lab.next' : 'diagnostics.lab.seat.action', disabled: busy, action: captures.seat ? 'next' : 'seat' };
      else if (step === 'open') primary = { key: captures.open ? 'diagnostics.lab.next' : 'diagnostics.lab.open.action', disabled: busy, action: captures.open ? 'next' : 'open' };
      else if (step === 'close') primary = { key: captures.close ? 'diagnostics.lab.next' : 'diagnostics.lab.close.action', disabled: busy, action: captures.close ? 'next' : 'close' };
      else if (step === 'review') {
        primary = { key: 'diagnostics.lab.apply', disabled: !(captures.open || captures.close), action: 'apply' };
        secondary = { key: 'diagnostics.lab.restart', action: 'restart' };
      } else if (halted) primary = { key: 'diagnostics.lab.restart', disabled: false, action: 'restart' };

      if (busy) primary = { key: 'diagnostics.lab.runningAction', disabled: true, action: 'none' };
      if (!busy && (step === 'seat' || step === 'open' || step === 'close') && !captures[step === 'seat' ? 'seat' : step] && phase === 'failed') {
        primary = { key: 'diagnostics.lab.retry', disabled: false, action: step };
      }
      if (!busy && finished && (step === 'seat' || step === 'open' || step === 'close')) {
        secondary = { key: 'diagnostics.lab.restart', action: 'restart' };
      }

      primaryBtn.dataset.action = primary.action;
      primaryBtn.disabled = !!primary.disabled;
      primaryBtn.textContent = t(primary.key);
      if (secondary) {
        secondaryBtn.hidden = false;
        secondaryBtn.dataset.action = secondary.action;
        secondaryBtn.textContent = t(secondary.key);
      } else {
        secondaryBtn.hidden = true;
        secondaryBtn.dataset.action = '';
      }
    }

    function stopPoll() {
      if (run.timer) clearInterval(run.timer);
      run.timer = null;
    }

    function go(next) {
      step = next;
      if (next === 'arm' || next === 'setup') showBanner('');
      if (next === 'review') {
        const latest = captures.close || captures.open;
        paintAnalysis(latest, latest ? latest.samples : [], false);
        setPhase('done', 'ok');
      } else if (next === 'setup') {
        paintAnalysis(null, [], false);
      }
      paintStage();
    }

    async function armController() {
      if (run.active) return;
      run.active = true;
      setPhase('arming', 'run');
      paintStage();
      pushLog('diagnostics.lab.log.arming', { zone });
      try {
        if (!getDashboardValue('manualMode')) {
          setDashboardValue('manualMode', true);
          await setManualMode(true);
          pushLog('diagnostics.lab.log.manual');
        }
        if (run.aborted) return;
        if (!isEntityOn(gkey.drivers)) {
          await setDriversEnabled(true);
          pushLog('diagnostics.lab.log.drivers');
        }
        if (run.aborted) return;
        liveDiag.busy = false;
        liveDiag.armed = true;
        setPhase('armed', 'ok');
        pushLog('diagnostics.lab.log.armed');
        run.active = false;
        go('seat');
      } catch (err) {
        run.active = false;
        setPhase('failed', 'halt');
        pushLog('diagnostics.lab.log.armFailed');
        paintStage();
      }
    }

    async function ingestCsv(text, direction, storeKey) {
      setPhase('analyzing', 'run');
      paintStage();
      const samples = parseMotorTraceCsv(text);
      const analysis = analyzeMotorTrace(samples, direction);
      const used = analysis.ok ? analysis.samples : samples;
      if (storeKey) captures[storeKey] = analysis.ok ? analysis : null;
      paintAnalysis(analysis, used, false);
      if (!analysis.ok) {
        setPhase('failed', 'halt');
        pushLog(storeKey === 'seat' ? 'diagnostics.lab.log.seatShort' : 'diagnostics.lab.log.weak');
        if (storeKey === 'seat') {
          captures.seat = { short: true };
          pushLog('diagnostics.lab.log.seatContinue');
        }
      } else {
        setPhase('done', 'ok');
        pushLog('diagnostics.lab.log.captured', {
          direction: t('diagnostics.lab.dir.' + analysis.direction),
          peak: analysis.peak_ma.toFixed(1),
        });
        if (analysis.pin_seen) {
          const already = liveDiag.pinSeen;
          liveDiag.pinSeen = true;
          liveDiag.pinAt = analysis.pin_motion_count;
          liveDiag.pinMa = analysis.pin_current_ma;
          liveDiag.stroke = 1;
          if (!already) {
            pushLog('diagnostics.lab.log.pinTrace', {
              count: analysis.pin_motion_count,
              ma: analysis.pin_current_ma.toFixed(1),
              ms: analysis.pin_t_ms,
            });
          }
        } else if (storeKey === 'close' || storeKey === 'seat') {
          pushLog('diagnostics.lab.log.pinMissing');
        }
      }
    }

    async function finishCapture(direction, storeKey) {
      for (let attempt = 0; attempt < 6; attempt++) {
        if (run.aborted) return;
        try {
          setPhase('fetching', 'run');
          paintStage();
          const csv = await fetchMotorTraceCsv();
          pushLog('diagnostics.lab.log.trace');
          await ingestCsv(csv, direction, storeKey);
          return;
        } catch (err) {
          if (err && err.code === 'motor_busy') {
            await new Promise((resolve) => setTimeout(resolve, 250));
            continue;
          }
          setPhase('failed', 'halt');
          pushLog('diagnostics.lab.log.traceFailed');
          paintAnalysis(null, run.live, true);
          return;
        }
      }
      setPhase('failed', 'halt');
    }

    function updateLiveMeans(samples) {
      const currents = samples.map((sample) => sample.current_ma).filter(Number.isFinite);
      if (!currents.length) return;
      const sum = currents.reduce((a, b) => a + b, 0);
      liveDiag.mean = Math.round((sum / currents.length) * 10) / 10;
      liveDiag.peak = Math.round(Math.max(...currents) * 10) / 10;
      if (samples.length >= 2) {
        const a = samples[Math.max(0, samples.length - 3)];
        const b = samples[samples.length - 1];
        const dt = (b.t_ms - a.t_ms) / 1000;
        if (dt > 0.05) liveDiag.slope = Math.round(((b.current_ma - a.current_ma) / dt) * 10) / 10;
      }
    }

    async function capture(direction, storeKey) {
      if (run.active) return;
      run = { active: true, aborted: false, direction, timer: null, live: [], started: Date.now() };
      liveDiag = emptyLive();
      liveDiag.direction = t('diagnostics.lab.dir.' + direction);
      setPhase('starting', 'run');
      paintStage();
      paintAnalysis(null, [], true);
      pushLog('diagnostics.lab.log.starting', { direction: t('diagnostics.lab.dir.' + direction), zone });
      try {
        if (direction === 'open') await openMotorTimed(zone, 10000);
        else await closeMotorTimed(zone, 10000);
        if (run.aborted) return;
        setPhase('waiting', 'run');
        paintStage();
        let sawBusy = false;
        const poll = async () => {
          if (run.aborted) return;
          try {
            const payload = await fetchDiagnostics();
            const safety = payload && payload.data && payload.data.motor_safety ? payload.data.motor_safety : {};
            const current = Number(safety.current_ma);
            const busy = !!safety.motor_busy;
            const driveOn = safety.drive_on != null ? !!safety.drive_on : busy;
            if (busy && !sawBusy) {
              sawBusy = true;
              setPhase('running', 'run');
              pushLog('diagnostics.lab.log.busy');
            }
            liveDiag.busy = busy;
            liveDiag.runtime = Date.now() - run.started;
            liveDiag.motion = Number(safety.motion_evidence_count) || liveDiag.motion;
            liveDiag.stroke = Number(safety.stroke_phase) || 0;
            liveDiag.tachoPeriodUs = Number(safety.tacho_period_us) || liveDiag.tachoPeriodUs;
            liveDiag.tachoCadenceUs = Number(safety.tacho_cadence_us) || liveDiag.tachoCadenceUs;
            const period = liveDiag.tachoPeriodUs || liveDiag.tachoCadenceUs;
            liveDiag.cadenceHz = period > 0 ? 1e6 / period : null;
            liveDiag.faultCode = Number(safety.fault_code) || 0;
            liveDiag.armed = !!safety.armed;
            liveDiag.backend = safety.backend || liveDiag.backend;
            liveDiag.invalidSamples = Number(safety.invalid_samples) || 0;
            liveDiag.tachoRejected = Number(safety.tacho_rejected) || 0;
            if (!liveDiag.pinSeen && (liveDiag.stroke === 1 || liveDiag.stroke === 2)) {
              liveDiag.pinSeen = true;
              liveDiag.pinAt = liveDiag.motion;
              liveDiag.pinMa = Number.isFinite(current) ? current : liveDiag.current;
              pushLog('diagnostics.lab.log.pin', {
                count: liveDiag.pinAt,
                ma: Number(liveDiag.pinMa || 0).toFixed(1),
              });
            }
            if (Number.isFinite(current)) {
              liveDiag.current = current;
              run.live.push({
                t_ms: Date.now() - run.started,
                current_ma: current,
                motion_count: liveDiag.motion,
                drive_on: driveOn,
                direction_open: direction === 'open',
                stroke_phase: liveDiag.stroke,
                tacho_period_us: liveDiag.tachoPeriodUs,
                tacho_cadence_us: liveDiag.tachoCadenceUs,
                armed: liveDiag.armed,
                fault_code: liveDiag.faultCode,
                backend: liveDiag.backend,
              });
              updateLiveMeans(run.live);
              paintAnalysis(null, run.live, true);
            }
            paintGauges();
            if ((sawBusy && !busy) || Date.now() - run.started > CAPTURE_TIMEOUT_MS) {
              stopPoll();
              liveDiag.busy = false;
              if (sawBusy) pushLog('diagnostics.lab.log.stopped');
              run.active = false;
              await finishCapture(direction, storeKey);
              paintStage();
            }
          } catch (err) {
            if (Date.now() - run.started > CAPTURE_TIMEOUT_MS) {
              stopPoll();
              run.active = false;
              setPhase('failed', 'halt');
              pushLog('diagnostics.lab.log.traceFailed');
              paintStage();
            }
          }
        };
        run.timer = setInterval(poll, POLL_MS);
        poll();
      } catch (err) {
        run.active = false;
        setPhase('failed', 'halt');
        pushLog('diagnostics.lab.log.startFailed');
        paintStage();
      }
    }

    function restart() {
      stopPoll();
      run = { active: false, aborted: false, direction: null, timer: null, live: [], started: 0 };
      captures = { open: null, close: null, seat: null };
      liveDiag = emptyLive();
      logLines.length = 0;
      logEl.innerHTML = '';
      showBanner('');
      setPhase('idle');
      go('setup');
    }

    async function estop() {
      run.aborted = true;
      run.active = false;
      stopPoll();
      liveDiag.busy = false;
      showBanner(t('diagnostics.lab.estopDone'));
      setPhase('halted', 'halt');
      pushLog('diagnostics.lab.log.estop');
      step = 'halted';
      paintStage();
      try { await emergencyStopMotors(); } catch (err) { /* still halted */ }
      paintGauges();
    }

    function nextStep() {
      const index = stepIndex(step);
      if (index < 0 || index >= STEPS.length - 1) return;
      go(STEPS[index + 1]);
    }

    function onAction(action) {
      if (action === 'start') {
        pushLog('diagnostics.lab.log.selected', { zone });
        go('arm');
        return;
      }
      if (action === 'arm') return armController();
      if (action === 'seat') return capture('close', 'seat');
      if (action === 'open') return capture('open', 'open');
      if (action === 'close') return capture('close', 'close');
      if (action === 'next') return nextStep();
      if (action === 'restart') return restart();
      if (action === 'apply') {
        const rows = [];
        if (captures.open) rows.push(...suggestionRows(captures.open));
        if (captures.close) rows.push(...suggestionRows(captures.close));
        rows.forEach((row) => setGlobalNumber(row.key, row.suggested));
        setPhase('applied', 'ok');
        pushLog('diagnostics.lab.log.applied');
        paintStage();
      }
    }

    primaryBtn.addEventListener('click', () => onAction(primaryBtn.dataset.action));
    secondaryBtn.addEventListener('click', () => onAction(secondaryBtn.dataset.action));
    estopBtn.addEventListener('click', estop);
    zoneSelect.addEventListener('change', () => {
      zone = Number(zoneSelect.value || 1);
      zoneChip.textContent = zoneLabel();
    });

    function onKey(event) {
      if (event.key !== 'Escape') return;
      if (getDashboardValue('section') !== 'motorlab') return;
      event.preventDefault();
      estop();
    }
    window.addEventListener('keydown', onKey);

    rebuildZones();
    setPhase('idle');
    paintAnalysis(null, [], false);
    paintStage();
    subscribe(gkey.drivers, paintGauges);
    subscribeDashboard('manualMode', paintGauges);
    subscribeDashboard('selectedZone', () => {
      if (step !== 'setup') return;
      zone = Number(getDashboardValue('selectedZone') || zone);
      zoneSelect.value = String(zone);
    });
    subscribeLanguage(() => {
      rebuildZones();
      localize(el);
      paintStage();
      paintAnalysis(view.analysis, view.samples, view.live);
    });
    localize(el);
  }
});
