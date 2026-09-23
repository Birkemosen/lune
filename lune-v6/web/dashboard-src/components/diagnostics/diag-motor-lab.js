import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, subscribeDashboard, setDashboardValue, zoneLabel } from '../../core/store.js';
import {
  emergencyStopMotors, fetchDiagnostics, fetchMotorTraceCsv,
  openMotorTimed, closeMotorTimed, probeArmClock, setDriversEnabled, setGlobalNumber, setManualMode,
  resetMotorLearnedFactors,
} from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import {
  analyzeMotorTrace, downloadMotorTraceCsv, downsampleMotorTraceMean, mergeMotorTraceSamples, overlayLevels,
  parseMotorTraceCsv, strokePhaseKey, TRACE_PULL_MS, BROWSER_TRACE_HZ, BROWSER_TRACE_MAX_MS,
} from '../../utils/motor-trace.js';
import { renderMotorLabCharts } from './motor-lab-charts.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// Diagnostics + chart rebuild must not pile up: an async setInterval at 100 ms
// was saturating the device HTTP worker mid-stroke and freezing the whole UI.
const POLL_MS = 400;
const CHART_PAINT_MS = 500;
const CAPTURE_TIMEOUT_MS = 45000;
const START_GRACE_MS = 2000;
const STEPS = ['setup', 'arm', 'seat', 'open', 'close', 'review'];

// Mirrors FaultCode in lv6_types.h. The panel used to render the bare integer,
// so MECHANICAL_OVERRUN read as "8".
const FAULT_NAMES = [
  'none', 'open_circuit', 'blocked', 'timeout', 'overcurrent',
  'thermal', 'stall', 'unknown', 'mechanical_overrun',
];
const FAULT_MECHANICAL_OVERRUN = 8;
// Mirrors EndpointDecision in endpoint_logic.h. STOPPED_UNCONFIRMED stops the
// drive and records no position while deliberately raising no fault, so without
// this it presented as a clean, successful capture.
const DECISION_NAMES = [
  'continue', 'endpoint', 'jam', 'overcurrent', 'disconnected',
  'tacho_fault', 'blocked_or_unknown', 'stopped_unconfirmed',
];
// Mirrors FastTrip in safety_limits.h.
const FAST_TRIP_NAMES = [
  '', 'close_seat', 'open_stop', 'close_popoff', 'stall_cap', 'circuit_fault',
];

// "OK" is only honest when the move actually confirmed an endpoint. A
// STOPPED_UNCONFIRMED or a fast-trip stop is a real outcome the operator needs
// to see, and neither raises a fault code.
function decisionText(decision) {
  const n = Number(decision) || 0;
  return DECISION_NAMES[n] || String(n);
}

function faultText(code) {
  const n = Number(code) || 0;
  if (!n) return null;
  return FAULT_NAMES[n] ? `${FAULT_NAMES[n]} (${n})` : String(n);
}

// Slope stopped being a trip path in firmware ("// Slope remains telemetry
// only", detect_endstop_()). Offering the four slope fields here was actively
// harmful during bring-up: an operator whose stroke stopped early would raise
// them, observe nothing, and then over-raise the threshold multiplier instead.
const TUNE_FIELDS = [
  { cls: 'close-factor', key: 'close_threshold_multiplier', id: gkey.closeThresholdMultiplier, labelKey: 'settings.motor.closeThreshold', unit: 'x', step: '0.1' },
  { cls: 'open-factor', key: 'open_threshold_multiplier', id: gkey.openThresholdMultiplier, labelKey: 'settings.motor.openThreshold', unit: 'x', step: '0.1' },
  { cls: 'open-ripple', key: 'open_ripple_limit_factor', id: gkey.openRippleLimitFactor, labelKey: 'settings.motor.openRippleLimit', unit: 'x', step: '0.05' },
];

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
  height: var(--control-height, 44px); min-height: var(--control-height, 44px); min-width: 148px; max-width: 220px; padding: 0 12px;
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
  min-width: 148px; height: var(--control-height, 44px); min-height: var(--control-height, 44px); padding: 0 18px;
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
  flex: 0 0 auto; width: auto; min-width: 148px; height: var(--control-height, 44px); min-height: var(--control-height, 44px);
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
.diag-motor-lab .lab-capture-bar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0 0 14px;
}
.diag-motor-lab .lab-capture-meta {
  color: var(--text-faint); font-size: .74rem; font-variant-numeric: tabular-nums;
}
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
.diag-motor-lab .lab-tune {
  margin: 0 0 14px; padding: 12px 14px;
  border: 1px solid var(--separator); border-radius: 12px;
  background: var(--surface-raised);
}
.diag-motor-lab .lab-tune > summary {
  list-style: none; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  color: var(--text-strong); font-size: .88rem; font-weight: 700;
}
.diag-motor-lab .lab-tune > summary::-webkit-details-marker { display: none; }
.diag-motor-lab .lab-tune > summary::after {
  content: '+'; display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 8px; border: 1px solid var(--control-border);
  background: var(--control-bg); color: var(--accent); font-size: 1rem; line-height: 1;
}
.diag-motor-lab .lab-tune[open] > summary::after { content: '−'; }
.diag-motor-lab .lab-tune-copy {
  margin: 8px 0 12px; color: var(--text-muted); font-size: .8rem; line-height: 1.4;
}
.diag-motor-lab .lab-tune-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px;
}
.diag-motor-lab .lab-tune-row {
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(5.5rem, .8fr);
  gap: 8px; align-items: center;
}
.diag-motor-lab .lab-tune-row label {
  color: var(--text-muted); font-size: .72rem; font-weight: 650;
}
.diag-motor-lab .lab-tune-row input {
  width: 100%; height: var(--control-compact, 32px); min-height: var(--control-compact, 32px);
  padding: 0 8px; border: 1px solid var(--control-border); border-radius: 8px;
  background: var(--control-bg); color: var(--text-strong); font-variant-numeric: tabular-nums;
}
@media (max-width: 720px) {
  .diag-motor-lab .lab-tune-grid { grid-template-columns: 1fr; }
}
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
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pad10">Pad 10 ARM</span><b data-k="pad10">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pad9">Pad 9 STATE</span><b data-k="pad9">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pad11">Pad 11 EN</span><b data-k="pad11">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.backend">Backend</span><b data-k="backend">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.fault">Fault</span><b data-k="fault">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.invalidSamples">Invalid samples</span><b data-k="invalid">—</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.tachoRejected">Tacho rejected</span><b data-k="tachoRejected">—</b></div>
          </div>
        </section>
      </div>
    </section>
    <section class="lab-board" aria-label="Kv curve">
      <div class="lab-phase-row">
        <small data-i18n="diagnostics.lab.kvCurve">Relative Kv (orifice model)</small>
        <strong class="lab-kv-hint" data-i18n="diagnostics.lab.kvHint">Used by the flow allocator</strong>
      </div>
      <table class="lab-suggest lab-kv-table">
        <thead><tr><th>%</th><th>Kv</th><th>%</th><th>Kv</th><th>%</th><th>Kv</th></tr></thead>
        <tbody class="lab-kv-body"></tbody>
      </table>
    </section>
    <details class="lab-tune" open>
      <summary data-i18n="diagnostics.lab.tune.title">Endstop thresholds</summary>
      <p class="lab-tune-copy" data-i18n="diagnostics.lab.tune.copy">Raise multipliers or slopes if the stroke stops too early. Changes apply immediately to this controller.</p>
      <div class="lab-tune-grid">
        ${TUNE_FIELDS.map((field) => `
          <div class="lab-tune-row">
            <label data-i18n="${field.labelKey}">${field.labelKey}</label>
            <input type="number" class="lab-tune-input" data-tune-key="${field.key}" data-tune-id="${field.id}" step="${field.step}" inputmode="decimal" />
          </div>`).join('')}
      </div>
    </details>
    <div class="lab-chart"></div>
    <div class="lab-capture-bar">
      <button type="button" class="ui-btn lab-download" hidden data-i18n="diagnostics.lab.downloadCsv">Download CSV</button>
      <span class="lab-capture-meta" hidden></span>
    </div>
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

function configuredFor(direction, caps) {
  if (direction === 'open') {
    return {
      factor: ev(gkey.openThresholdMultiplier),
      slope: ev(gkey.openSlopeThreshold),
      floor: ev(gkey.openSlopeCurrentFactor),
      ripple: ev(gkey.openRippleLimitFactor),
      caps,
    };
  }
  return {
    factor: ev(gkey.closeThresholdMultiplier),
    slope: ev(gkey.closeSlopeThreshold),
    floor: ev(gkey.closeSlopeCurrentFactor),
    caps,
  };
}

function suggestionRows(analysis) {
  const cfg = configuredFor(analysis.direction);
  const prefix = analysis.direction === 'open' ? 'open' : 'close';
  // Only the threshold multiplier still reaches a trip path; the slope rows were
  // writing NVS values nothing reads.
  const rows = [
    { key: prefix + '_threshold_multiplier', labelKey: analysis.direction === 'open' ? 'settings.motor.openThreshold' : 'settings.motor.closeThreshold', current: cfg.factor, suggested: analysis.suggested_factor, unit: 'x' },
  ];
  if (analysis.direction === 'open' && analysis.suggested_ripple_limit != null) {
    rows.push({ key: 'open_ripple_limit_factor', labelKey: 'settings.motor.openRippleLimit', current: cfg.ripple, suggested: analysis.suggested_ripple_limit, unit: 'x' });
  }
  return rows;
}

function onOff(value) {
  return t(value ? 'common.on' : 'common.off');
}

function padLevel(value) {
  if (value === 1) return 'HIGH';
  if (value === 0) return 'LOW';
  return '—';
}

function hasFaultLatch(backend) {
  return backend === 'rev32_gpio' || backend === 'rev31_gpio';
}

function emptyLive() {
  return {
    current: null, mean: null, peak: null, slope: null,
    runtime: 0, motion: 0, busy: false, direction: '—', stroke: 0,
    pinSeen: false, pinAt: null, pinMa: null,
    tachoPeriodUs: null, tachoCadenceUs: null, cadenceHz: null,
    faultCode: 0, armed: false, backend: '—',
    latchFaulted: false, driversEnabled: null,
    latchArmLevel: null, latchStateLevel: null, motorEnableLevel: null,
    invalidSamples: 0, tachoRejected: 0,
    // Rev 3.3 endstop architecture, reported live by the firmware so the lab
    // plots the limits that actually fire rather than hardcoded constants.
    caps: null, baselineMa: null, baselineSettled: false, countsSpurious: false,
    lastFastTrip: 0, endpointDecision: 0, ceilingMs: 0, ceilingCounts: 0,
    ceilingSource: 0, requiresCalibration: false, positionConfident: false,
    learnedStallMa: null,
  };
}

export default component({
  tag: 'diag-motor-lab',
  render: template,
  onMount(ctx, el) {
    let zone = Number(getDashboardValue('selectedZone') || 1);
    let step = 'setup';
    let phase = 'idle';
    let run = { active: false, aborted: false, direction: null, timer: null, live: [], hiRes: [], started: 0, pullAt: 0, pullInFlight: false };
    let captures = { open: null, close: null, seat: null };
    let view = { samples: [], analysis: null, live: false };
    let lastExportSamples = [];
    let chartVisible = { current: true, overlays: true, phase: true, cadence: true, slope: true };
    const logLines = [];
    let liveDiag = emptyLive();
    let spuriousWarned = false;

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
    const downloadBtn = el.querySelector('.lab-download');
    const captureMeta = el.querySelector('.lab-capture-meta');
    const metricsEl = el.querySelector('.lab-metrics');
    const table = el.querySelector('.lab-suggest');
    const primaryBtn = el.querySelector('.lab-primary');
    const secondaryBtn = el.querySelector('.lab-secondary');
    const estopBtn = el.querySelector('.lab-estop');
    const tuneInputs = Array.from(el.querySelectorAll('.lab-tune-input'));
    const kvBody = el.querySelector('.lab-kv-body');
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
      pad10: el.querySelector('[data-k="pad10"]'),
      pad9: el.querySelector('[data-k="pad9"]'),
      pad11: el.querySelector('[data-k="pad11"]'),
      backend: el.querySelector('[data-k="backend"]'),
      fault: el.querySelector('[data-k="fault"]'),
      invalid: el.querySelector('[data-k="invalid"]'),
      tachoRejected: el.querySelector('[data-k="tachoRejected"]'),
    };

    function paintCaptureBar(samples) {
      lastExportSamples = samples && samples.length ? samples : [];
      const n = lastExportSamples.length;
      downloadBtn.hidden = n < 2;
      captureMeta.hidden = n < 2;
      if (n < 2) return;
      const t0 = Number(lastExportSamples[0].t_ms) || 0;
      const t1 = Number(lastExportSamples[n - 1].t_ms) || 0;
      const seconds = Math.max(0, (t1 - t0) / 1000);
      captureMeta.textContent = t('diagnostics.lab.captureMeta', {
        n,
        hz: BROWSER_TRACE_HZ,
        seconds: seconds.toFixed(1),
      });
    }

    function relativeKv(pct) {
      const x = Math.max(0, Math.min(100, Number(pct) || 0)) / 100;
      if (x < 0.30) return 0.30 * Math.pow(Math.max(x / 0.30, 0), 1.5);
      return Math.pow(x, 1.5);
    }

    function paintKvTable() {
      if (!kvBody) return;
      const pts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      let html = '';
      for (let i = 0; i < pts.length; i += 3) {
        const cells = [];
        for (let j = 0; j < 3; j++) {
          const p = pts[i + j];
          if (p == null) {
            cells.push('<td></td><td></td>');
            continue;
          }
          cells.push(`<td>${p}</td><td>${relativeKv(p).toFixed(3)}</td>`);
        }
        html += `<tr>${cells.join('')}</tr>`;
      }
      kvBody.innerHTML = html;
    }
    paintKvTable();

    function stepIndex(id) {
      return STEPS.indexOf(id);
    }

    function motorZoneLabel() {
      return zoneLabel(zone);
    }

    function rebuildZones() {
      const current = String(zone);
      zoneSelect.innerHTML = Array.from({ length: 6 }, (_, i) =>
        '<option value="' + (i + 1) + '">' + zoneLabel(i + 1).replace(/</g, '&lt;') + '</option>').join('');
      zoneSelect.value = current;
      zoneSelect.setAttribute('aria-label', t('diagnostics.lab.motor'));
      zoneChip.textContent = motorZoneLabel();
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

    function paintTune() {
      for (const input of tuneInputs) {
        const value = ev(input.dataset.tuneId);
        if (value == null || Number.isNaN(Number(value))) continue;
        if (document.activeElement === input) continue;
        input.value = String(Number(value));
      }
    }

    function bindTune() {
      for (const input of tuneInputs) {
        const commit = () => {
          const next = Number(input.value);
          if (!Number.isFinite(next)) {
            paintTune();
            return;
          }
          setGlobalNumber(input.dataset.tuneKey, next);
          pushLog('diagnostics.lab.log.tune', {
            key: t(TUNE_FIELDS.find((field) => field.key === input.dataset.tuneKey)?.labelKey || input.dataset.tuneKey),
            value: next,
          });
          if (view.analysis) paintCharts();
        };
        input.addEventListener('change', commit);
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            input.blur();
            commit();
          }
        });
      }
    }

    function captureDurationMs() {
      const profile = es(gkey.motorProfileDefault) || 'HmIP VdMot';
      let seconds;
      if (profile === 'HmIP VdMot') {
        // Prefer the ceiling the firmware reports for the move in flight: it is
        // direction-split (close 34 s, open 45 s) and also bounded in
        // commutations, so a hardcoded 40 both over-requests on close - where
        // the request is silently clipped and the short capture reads as a UI
        // failure - and under-requests on open.
        const live = Number(liveDiag.ceilingMs);
        if (Number.isFinite(live) && live > 0) {
          return Math.min(BROWSER_TRACE_MAX_MS, Math.round(live));
        }
        seconds = Number(ev(gkey.hmipRuntimeLimitSeconds));
        if (!Number.isFinite(seconds) || seconds <= 0) seconds = 34;
        // 40 s of close travel is the plunger-at-housing-exit point, never a
        // target. Cap at the close ceiling until the firmware reports otherwise.
        seconds = Math.min(34, seconds);
      } else {
        seconds = Number(ev(gkey.genericRuntimeLimitSeconds));
        if (!Number.isFinite(seconds) || seconds <= 0) seconds = 45;
      }
      return Math.min(BROWSER_TRACE_MAX_MS, Math.round(seconds * 1000));
    }

    async function pullHiResTrace() {
      if (!run.active || run.aborted || run.pullInFlight) return;
      const now = Date.now();
      if (now - (run.pullAt || 0) < TRACE_PULL_MS) return;
      run.pullAt = now;
      run.pullInFlight = true;
      try {
        const csv = await fetchMotorTraceCsv();
        const chunk = parseMotorTraceCsv(csv);
        if (chunk.length) {
          run.hiRes = mergeMotorTraceSamples(run.hiRes || [], chunk);
          paintCaptureBar(run.hiRes);
        }
      } catch (err) {
        // Ring may be empty mid-move; keep polling.
      } finally {
        run.pullInFlight = false;
      }
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
      gauges.drivers.textContent = onOff(
        liveDiag.driversEnabled != null ? liveDiag.driversEnabled : isEntityOn(gkey.drivers));
      gauges.busy.textContent = onOff(liveDiag.busy);
      gauges.armed.textContent = onOff(liveDiag.armed);
      const latch = hasFaultLatch(liveDiag.backend);
      const pad10Label = gauges.pad10 && gauges.pad10.parentElement.querySelector('span');
      const pad9Label = gauges.pad9 && gauges.pad9.parentElement.querySelector('span');
      if (pad10Label) pad10Label.textContent = t(latch ? 'diagnostics.lab.pad10' : 'diagnostics.lab.pad10nsleep');
      if (pad9Label) pad9Label.textContent = t(latch ? 'diagnostics.lab.pad9' : 'diagnostics.lab.pad9fault');
      if (gauges.pad10) gauges.pad10.textContent = padLevel(liveDiag.latchArmLevel);
      if (gauges.pad9) gauges.pad9.textContent = padLevel(liveDiag.latchStateLevel);
      if (gauges.pad11) gauges.pad11.textContent = padLevel(liveDiag.motorEnableLevel);
      gauges.backend.textContent = liveDiag.backend || '—';
      const faultDisplay = () => {
        const f = faultText(liveDiag.faultCode);
        if (f) {
          // MECHANICAL_OVERRUN has two distinct causes and they mean different
          // things: the count ceiling is genuine overtravel, the time ceiling
          // usually means the tacho went quiet.
          if (liveDiag.faultCode === FAULT_MECHANICAL_OVERRUN && liveDiag.ceilingCounts > 0) {
            const viaCounts = liveDiag.motion >= liveDiag.ceilingCounts;
            return `${f} · ${viaCounts ? 'count ceiling' : 'time ceiling'}`;
          }
          return f;
        }
        if (liveDiag.endpointDecision === 7) return 'stopped, unconfirmed';
        if (liveDiag.lastFastTrip) return `stopped · ${FAST_TRIP_NAMES[liveDiag.lastFastTrip] || liveDiag.lastFastTrip}`;
        return t('common.ok');
      };
      gauges.fault.textContent = liveDiag.latchFaulted
        ? t('diagnostics.lab.faultLatch')
        : faultDisplay();
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
      const overlays = view.analysis
        ? overlayLevels(view.analysis, configuredFor(view.analysis.direction, liveDiag.caps))
        : [];
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
      paintCaptureBar(view.samples);
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
      const guideKey = (!halted && current === 'arm' && !hasFaultLatch(liveDiag.backend))
        ? 'enable' : (halted ? 'halt' : current);
      titleEl.textContent = t('diagnostics.lab.' + guideKey + '.title');
      const finished = (step === 'seat' && captures.seat) || (step === 'open' && captures.open) || (step === 'close' && captures.close);
      const copyKey = halted ? 'diagnostics.lab.halt.copy'
        : (finished ? 'diagnostics.lab.' + current + '.done' : 'diagnostics.lab.' + guideKey + '.copy');
      copyEl.textContent = t(copyKey);
      const inSetup = step === 'setup';
      guideEl.dataset.setup = inSetup ? 'true' : 'false';
      setupEl.hidden = !inSetup;
      zoneSelect.disabled = !inSetup || run.active;
      zoneChip.hidden = inSetup;
      zoneChip.textContent = motorZoneLabel();
      estopBtn.dataset.armed = run.active ? 'true' : 'false';
      paintGauges();

      const busy = run.active;
      let primary = { key: 'diagnostics.lab.next', disabled: busy, action: 'next' };
      let secondary = null;
      if (step === 'setup') primary = { key: 'diagnostics.lab.setup.action', disabled: false, action: 'start' };
      else if (step === 'arm') primary = {
        key: hasFaultLatch(liveDiag.backend) ? 'diagnostics.lab.arm.action' : 'diagnostics.lab.enable.action',
        disabled: busy,
        action: 'arm',
      };
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

    function holdHttpForLab(on) {
      setDashboardValue('motorLabBusy', !!on);
    }

    function stopPoll() {
      if (run.timer) clearTimeout(run.timer);
      run.timer = null;
    }

    function go(next) {
      step = next;
      if (next === 'arm' || next === 'setup') showBanner('');
      if (next === 'review') {
        holdHttpForLab(false);
        const latest = captures.close || captures.open;
        paintAnalysis(latest, latest ? latest.samples : [], false);
        setPhase('done', 'ok');
      } else if (next === 'setup') {
        holdHttpForLab(false);
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
        const payload = await fetchDiagnostics();
        const safety = payload && payload.data && payload.data.motor_safety
          ? payload.data.motor_safety : {};
        liveDiag.backend = safety.backend || liveDiag.backend;
        paintGauges();
        if (hasFaultLatch(liveDiag.backend)) {
          pushLog('diagnostics.lab.log.armProbeWait');
          const probePayload = await probeArmClock({ hz: 100, durationMs: 4000 });
          if (run.aborted) return;
          const probe = probePayload && probePayload.data ? probePayload.data : {};
          pushLog('diagnostics.lab.log.armProbe', {
            hz: probe.hz || 100,
            cycles: probe.cycles || 0,
            armed: probe.armed ? t('common.on') : t('common.off'),
            at: probe.armed_at_cycle || 0,
          });
          liveDiag.armed = !!probe.armed;
          liveDiag.latchFaulted = !probe.armed;
          paintGauges();
          if (!probe.armed) {
            showBanner(t('diagnostics.lab.latchBanner'));
            throw new Error('latch');
          }
        } else {
          pushLog('diagnostics.lab.log.enableWait');
        }
        await setDriversEnabled(true);
        pushLog('diagnostics.lab.log.drivers');
        const deadline = Date.now() + 4000;
        let armedOk = false;
        while (Date.now() < deadline) {
          if (run.aborted) return;
          const enabledPayload = await fetchDiagnostics();
          const data = enabledPayload && enabledPayload.data ? enabledPayload.data : {};
          const enabledSafety = data.motor_safety || {};
          liveDiag.driversEnabled = data.drivers_enabled != null ? !!data.drivers_enabled : liveDiag.driversEnabled;
          liveDiag.armed = !!enabledSafety.armed;
          liveDiag.latchFaulted = !!enabledSafety.latch_faulted;
          liveDiag.backend = enabledSafety.backend || liveDiag.backend;
          liveDiag.latchArmLevel = enabledSafety.latch_arm_level;
          liveDiag.latchStateLevel = enabledSafety.latch_state_level;
          liveDiag.motorEnableLevel = enabledSafety.motor_enable_level;
          paintGauges();
          if (data.drivers_enabled && !enabledSafety.latch_faulted) {
            armedOk = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        }
        if (!armedOk) {
          const latch = hasFaultLatch(liveDiag.backend);
          showBanner(t(latch ? 'diagnostics.lab.latchBanner' : 'diagnostics.lab.enableBanner'));
          throw new Error(latch ? 'latch' : 'enable');
        }
        setPhase('armed', 'ok');
        pushLog('diagnostics.lab.log.armed');
        run.active = false;
        go('seat');
      } catch (err) {
        run.active = false;
        setPhase('failed', 'halt');
        pushLog(err && err.message === 'arm_gpio'
          ? 'diagnostics.lab.log.armGpio'
          : (err && err.message === 'latch'
            ? 'diagnostics.lab.log.latchFaulted'
            : (err && err.message === 'enable'
              ? 'diagnostics.lab.log.enableFailed'
              : 'diagnostics.lab.log.armFailed')));
        paintStage();
      }
    }

    async function armController() {
      if (run.active) return;
      holdHttpForLab(true);
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
        const payload = await fetchDiagnostics();
        const safety = payload && payload.data && payload.data.motor_safety
          ? payload.data.motor_safety : {};
        liveDiag.backend = safety.backend || liveDiag.backend;
        paintGauges();
        if (hasFaultLatch(liveDiag.backend)) {
          pushLog('diagnostics.lab.log.armProbeWait');
          const probePayload = await probeArmClock({ hz: 100, durationMs: 4000 });
          if (run.aborted) return;
          const probe = probePayload && probePayload.data ? probePayload.data : {};
          pushLog('diagnostics.lab.log.armProbe', {
            hz: probe.hz || 100,
            cycles: probe.cycles || 0,
            armed: probe.armed ? t('common.on') : t('common.off'),
            at: probe.armed_at_cycle || 0,
          });
          liveDiag.armed = !!probe.armed;
          liveDiag.latchFaulted = !probe.armed;
          paintGauges();
          if (!probe.armed) {
            showBanner(t('diagnostics.lab.latchBanner'));
            throw new Error('latch');
          }
        } else {
          pushLog('diagnostics.lab.log.enableWait');
        }
        await setDriversEnabled(true);
        pushLog('diagnostics.lab.log.drivers');
        const deadline = Date.now() + 4000;
        let armedOk = false;
        while (Date.now() < deadline) {
          if (run.aborted) return;
          const enabledPayload = await fetchDiagnostics();
          const data = enabledPayload && enabledPayload.data ? enabledPayload.data : {};
          const enabledSafety = data.motor_safety || {};
          liveDiag.driversEnabled = data.drivers_enabled != null ? !!data.drivers_enabled : liveDiag.driversEnabled;
          liveDiag.armed = !!enabledSafety.armed;
          liveDiag.latchFaulted = !!enabledSafety.latch_faulted;
          liveDiag.backend = enabledSafety.backend || liveDiag.backend;
          liveDiag.latchArmLevel = enabledSafety.latch_arm_level;
          liveDiag.latchStateLevel = enabledSafety.latch_state_level;
          liveDiag.motorEnableLevel = enabledSafety.motor_enable_level;
          paintGauges();
          if (data.drivers_enabled && !enabledSafety.latch_faulted) {
            armedOk = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_MS));
        }
        if (!armedOk) {
          const latch = hasFaultLatch(liveDiag.backend);
          showBanner(t(latch ? 'diagnostics.lab.latchBanner' : 'diagnostics.lab.enableBanner'));
          throw new Error(latch ? 'latch' : 'enable');
        }
        setPhase('armed', 'ok');
        pushLog('diagnostics.lab.log.armed');
        run.active = false;
        go('seat');
      } catch (err) {
        run.active = false;
        holdHttpForLab(false);
        setPhase('failed', 'halt');
        pushLog(err && err.message === 'arm_gpio'
          ? 'diagnostics.lab.log.armGpio'
          : (err && err.message === 'latch'
            ? 'diagnostics.lab.log.latchFaulted'
            : (err && err.message === 'enable'
              ? 'diagnostics.lab.log.enableFailed'
              : 'diagnostics.lab.log.armFailed')));
        paintStage();
      }
    }

    async function finishCapture(direction, storeKey) {
      const liveSamples = run.live.slice();
      let csvSamples = [];
      for (let attempt = 0; attempt < 6; attempt++) {
        if (run.aborted) return;
        try {
          setPhase('fetching', 'run');
          paintStage();
          const csv = await fetchMotorTraceCsv();
          pushLog('diagnostics.lab.log.trace');
          csvSamples = parseMotorTraceCsv(csv);
          break;
        } catch (err) {
          if (err && err.code === 'motor_busy') {
            await new Promise((resolve) => setTimeout(resolve, 250));
            continue;
          }
          pushLog('diagnostics.lab.log.traceFailed');
          break;
        }
      }

      if (csvSamples.length)
        run.hiRes = mergeMotorTraceSamples(run.hiRes || [], csvSamples);

      const hiRes = run.hiRes || [];
      const liveEnd = liveSamples.length ? Number(liveSamples[liveSamples.length - 1].t_ms) || 0 : 0;
      const csvEnd = csvSamples.length ? Number(csvSamples[csvSamples.length - 1].t_ms) || 0 : 0;
      const hiEnd = hiRes.length ? Number(hiRes[hiRes.length - 1].t_ms) || 0 : 0;
      // Prefer the accumulated ~2 Hz browser log (full stroke); fall back to live
      // diagnostics samples, then the short device ring.
      const displaySamples = hiRes.length ? hiRes : (liveSamples.length ? liveSamples : csvSamples);
      const analysisSamples = (csvSamples.length >= 8 && csvEnd >= Math.max(400, Math.max(liveEnd, hiEnd) * 0.45))
        ? csvSamples
        : displaySamples;

      if (!displaySamples.length) {
        setPhase('failed', 'halt');
        pushLog('diagnostics.lab.log.traceFailed');
        paintAnalysis(null, [], false);
        return;
      }

      const analysis = analyzeMotorTrace(analysisSamples, direction);
      if (storeKey) captures[storeKey] = analysis.ok ? analysis : null;
      paintAnalysis(analysis, displaySamples, false);
      if (!analysis.ok) {
        setPhase('failed', 'halt');
        if (analysis.reason === 'no_endstop') {
          pushLog('diagnostics.lab.log.noEndstop', {
            direction: t('diagnostics.lab.dir.' + direction),
            seconds: ((analysis.runtime_ms || 0) / 1000).toFixed(0),
          });
        } else {
          pushLog(storeKey === 'seat' ? 'diagnostics.lab.log.seatShort' : 'diagnostics.lab.log.weak');
        }
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
        if (hiEnd > csvEnd + 250 || liveEnd > csvEnd + 250) {
          pushLog('diagnostics.lab.log.browserLog', {
            seconds: (Math.max(hiEnd, liveEnd) / 1000).toFixed(1),
          });
        }
      }
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
      run = { active: true, aborted: false, direction, timer: null, live: [], hiRes: [], started: Date.now(), pullAt: 0, pullInFlight: false, chartAt: 0 };
      holdHttpForLab(true);
      liveDiag = emptyLive();
      spuriousWarned = false;
      liveDiag.direction = t('diagnostics.lab.dir.' + direction);
      setPhase('starting', 'run');
      paintStage();
      paintAnalysis(null, [], true);
      paintCaptureBar([]);
      pushLog('diagnostics.lab.log.starting', { direction: t('diagnostics.lab.dir.' + direction), zone });
      try {
        // Clear learned means so a short false trip does not make the next retry slam.
        try {
          await resetMotorLearnedFactors(zone);
          pushLog('diagnostics.lab.log.resetLearned');
        } catch (err) {
          pushLog('diagnostics.lab.log.resetLearnedFailed');
        }
        if (run.aborted) return;
        const durationMs = captureDurationMs();
        const captureDeadlineMs = durationMs + 8000;
        pushLog('diagnostics.lab.log.duration', { seconds: (durationMs / 1000).toFixed(0) });
        if (direction === 'open') await openMotorTimed(zone, durationMs);
        else await closeMotorTimed(zone, durationMs);
        if (run.aborted) return;
        setPhase('waiting', 'run');
        paintStage();
        let sawBusy = false;
        let finished = false;

        const schedulePoll = () => {
          if (finished || run.aborted || !run.active) return;
          run.timer = setTimeout(poll, POLL_MS);
        };

        const poll = async () => {
          if (finished || run.aborted || !run.active) return;
          try {
            const payload = await fetchDiagnostics();
            if (finished || run.aborted || !run.active) return;
            const data = payload && payload.data ? payload.data : {};
            const safety = data.motor_safety || {};
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
            liveDiag.latchFaulted = !!safety.latch_faulted;
            liveDiag.latchArmLevel = safety.latch_arm_level;
            liveDiag.latchStateLevel = safety.latch_state_level;
            liveDiag.motorEnableLevel = safety.motor_enable_level;
            liveDiag.driversEnabled = data.drivers_enabled != null ? !!data.drivers_enabled : liveDiag.driversEnabled;
            liveDiag.backend = safety.backend || liveDiag.backend;
            liveDiag.invalidSamples = Number(safety.invalid_samples) || 0;
            liveDiag.tachoRejected = Number(safety.tacho_rejected) || 0;
            if (safety.cap_seat_ma != null) {
              liveDiag.caps = {
                seat: Number(safety.cap_seat_ma),
                popoff: Number(safety.cap_popoff_ma),
                open: Number(safety.cap_open_ma),
                stall: Number(safety.cap_stall_ma),
                circuit: Number(safety.cap_circuit_ma),
              };
            }
            if (safety.baseline_ma != null) liveDiag.baselineMa = Number(safety.baseline_ma);
            liveDiag.baselineSettled = !!safety.baseline_settled;
            liveDiag.countsSpurious = !!safety.counts_spurious;
            liveDiag.lastFastTrip = Number(safety.last_fast_trip) || 0;
            liveDiag.endpointDecision = Number(safety.endpoint_decision) || 0;
            liveDiag.ceilingMs = Number(safety.ceiling_ms) || 0;
            liveDiag.ceilingCounts = Number(safety.ceiling_counts) || 0;
            liveDiag.ceilingSource = Number(safety.ceiling_source) || 0;
            liveDiag.requiresCalibration = !!safety.requires_calibration;
            liveDiag.positionConfident = !!safety.position_confident;
            if (safety.learned_stall_ma != null) liveDiag.learnedStallMa = Number(safety.learned_stall_ma);
            if (liveDiag.countsSpurious && !spuriousWarned) {
              spuriousWarned = true;
              pushLog('diagnostics.lab.log.spurious', {});
            }
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
            }
            // Occasional ring pull only — full CSV mid-stroke saturates HTTP.
            // Live charts use mean-bucketed diagnostics samples instead.
            if (busy) pullHiResTrace();
            paintGauges();
            const now = Date.now();
            if (now - (run.chartAt || 0) >= CHART_PAINT_MS) {
              run.chartAt = now;
              const chartSamples = run.hiRes.length
                ? run.hiRes
                : downsampleMotorTraceMean(run.live, BROWSER_TRACE_HZ);
              paintAnalysis(null, chartSamples, true);
            }
            const elapsed = now - run.started;
            if (!sawBusy && elapsed > START_GRACE_MS) {
              finished = true;
              stopPoll();
              run.active = false;
              setPhase('failed', 'halt');
              if (safety.latch_faulted) {
                showBanner(t('diagnostics.lab.latchBanner'));
                pushLog('diagnostics.lab.log.latchFaulted');
              } else {
                pushLog('diagnostics.lab.log.neverStarted');
              }
              paintStage();
              return;
            }
            if ((sawBusy && !busy) || elapsed > captureDeadlineMs) {
              finished = true;
              stopPoll();
              liveDiag.busy = false;
              if (sawBusy) pushLog('diagnostics.lab.log.stopped');
              run.active = false;
              await finishCapture(direction, storeKey);
              paintStage();
              return;
            }
          } catch (err) {
            if (Date.now() - run.started > captureDeadlineMs) {
              finished = true;
              stopPoll();
              run.active = false;
              setPhase('failed', 'halt');
              pushLog('diagnostics.lab.log.traceFailed');
              paintStage();
              return;
            }
          }
          schedulePoll();
        };
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
      holdHttpForLab(false);
      run = { active: false, aborted: false, direction: null, timer: null, live: [], hiRes: [], started: 0, pullAt: 0, pullInFlight: false, chartAt: 0 };
      captures = { open: null, close: null, seat: null };
      liveDiag = emptyLive();
      spuriousWarned = false;
      logLines.length = 0;
      logEl.innerHTML = '';
      showBanner('');
      paintCaptureBar([]);
      setPhase('idle');
      go('setup');
    }

    async function estop() {
      run.aborted = true;
      run.active = false;
      stopPoll();
      holdHttpForLab(false);
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
        holdHttpForLab(true);
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
    downloadBtn.addEventListener('click', () => {
      if (!lastExportSamples.length) return;
      const dir = run.direction || 'trace';
      downloadMotorTraceCsv(lastExportSamples, 'motor-lab-z' + zone + '-' + dir + '.csv');
    });
    zoneSelect.addEventListener('change', () => {
      zone = Number(zoneSelect.value || 1);
      zoneChip.textContent = motorZoneLabel();
    });

    function onKey(event) {
      if (event.key !== 'Escape') return;
      if (getDashboardValue('section') !== 'motorlab') return;
      event.preventDefault();
      estop();
    }
    window.addEventListener('keydown', onKey);

    rebuildZones();
    bindTune();
    paintTune();
    setPhase('idle');
    paintAnalysis(null, [], false);
    paintStage();
    fetchDiagnostics().then((payload) => {
      const safety = payload && payload.data && payload.data.motor_safety
        ? payload.data.motor_safety : {};
      liveDiag.backend = safety.backend || liveDiag.backend;
      liveDiag.armed = !!safety.armed;
      liveDiag.latchFaulted = !!safety.latch_faulted;
      liveDiag.latchArmLevel = safety.latch_arm_level;
      liveDiag.latchStateLevel = safety.latch_state_level;
      liveDiag.motorEnableLevel = safety.motor_enable_level;
      if (payload && payload.data && payload.data.drivers_enabled != null)
        liveDiag.driversEnabled = !!payload.data.drivers_enabled;
      paintStage();
    }).catch(() => {});
    subscribe(gkey.drivers, paintGauges);
    for (const field of TUNE_FIELDS) subscribe(field.id, () => { paintTune(); if (view.analysis) paintCharts(); });
    subscribeDashboard('manualMode', paintGauges);
    subscribeDashboard('selectedZone', () => {
      if (step !== 'setup') return;
      zone = Number(getDashboardValue('selectedZone') || zone);
      zoneSelect.value = String(zone);
    });
    subscribeLanguage(() => {
      rebuildZones();
      localize(el);
      paintTune();
      paintStage();
      paintAnalysis(view.analysis, view.samples, view.live);
    });
    localize(el);
  }
});
