/**
 * Motor lab (System › Motor lab, dev builds only): one stroke at a time on one motor.
 *
 * Arm (manual mode + drivers on) → seat (close until seated) → record the opening
 * stroke → record the closing stroke, plus timed manual moves. While the motor runs,
 * /diagnostics (motor_safety) is polled for the live board and /motor-trace.csv is
 * pulled often enough that successive ring windows (~13 s on the device) overlap; the
 * browser merges them into one trace for the whole stroke. Background polling pauses
 * meanwhile (motorLabBusy). Finish turns manual mode off so automatic control resumes.
 *
 * After a stroke the end-stop explorer replays the trace (or the reference trace)
 * through the firmware's trip paths with the thresholds in the form below it, so an
 * edit shows at once where the motor would stop; Save writes the thresholds. The valve
 * curve shows the selected zone's flow against opening, as the control uses it.
 */
import { ev, es, setDashboardValue } from '../dashboard-src/core/store.js';
import { key, gkey } from '../dashboard-src/utils/keys.js';
import {
  setManualMode, setDriversEnabled, openMotorTimed, closeMotorTimed, stopMotor,
  emergencyStopMotors, fetchDiagnostics, fetchMotorTraceCsv,
} from '../dashboard-src/core/api.js';
import {
  parseMotorTraceCsv, mergeMotorTraceSamples, motorTraceSeries, strokePhaseKey,
  downloadMotorTraceCsv, pinContactSample,
  analyzeMotorTrace,
} from '../dashboard-src/utils/motor-trace.js';
import { explainEndstop } from '../dashboard-src/utils/endstop-explorer.js';
import { REFERENCE_CLOSE, REFERENCE_OPEN, referenceSamples } from '../dashboard-src/utils/motor-reference-traces.js';

const POLL_MS = 400;          // live board
const PULL_MS = 3000;         // trace ring pull; the device ring holds ~13 s
const TRACE_HZ = 25;          // browser-side mean buckets: ~1000 rows for a 40 s stroke
const STOP_GRACE_MS = 5000;   // past the commanded run time before giving up
const W = 600;                // SVG viewBox width (height 100)

let h = null;                 // helpers from main.js: t, num, escapeHtml, setBind, setShow
let state = 'setup';
let samples = [];
let lastDir = 'open';
let run = null;               // { stop: bool, halted: bool }
const done = new Set();
let capture = null;           // { dir, samples } of the latest traced move
let learnedStallMa = null;    // motor_safety.learned_stall_ma when known
let zones = null;             // /api/v1/zones rows (valve curves)
let zonesAt = 0;

const root = () => document.querySelector('.lab');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function zone() {
  const sel = document.getElementById('lab_zone');
  return Math.max(1, Math.min(6, Number(sel && sel.value) || 1));
}

/** Full-stroke run time: the motor profile's limit (end-stop detection stops it earlier). */
function strokeMs() {
  const hmip = String(ev(gkey.motorProfileDefault) || '').toLowerCase().includes('hmip');
  const s = Number(ev(hmip ? gkey.hmipRuntimeLimitSeconds : gkey.genericRuntimeLimitSeconds));
  return Math.round(Math.max(5, Math.min(45, Number.isFinite(s) && s > 0 ? s : 40)) * 1000);
}

function setState(s, note) {
  state = s;
  const el = root();
  if (el) el.dataset.state = s;
  h.setBind('lab.status', h.escapeHtml(note || h.t(`lab.state.${s}`)));
  for (const k of ['arm', 'seat', 'open', 'close']) h.setShow(`lab.done.${k}`, done.has(k));
  const sel = document.getElementById('lab_zone');
  if (sel) sel.disabled = s !== 'setup' && s !== 'halted';
}

function metric(bind, value, digits = 1) {
  h.setBind(bind, Number.isFinite(value) ? `${h.num(value, digits)}` : '—');
}

function paintLive(ms) {
  if (!ms) return;
  metric('lab.current', Number(ms.current_ma));
  metric('lab.runtime', Number(ms.motor_runtime_ms) / 1000);
  h.setBind('lab.ripples', Number.isFinite(Number(ms.motion_evidence_count)) ? String(ms.motion_evidence_count) : '—');
  h.setBind('lab.phase', h.escapeHtml(h.t(`lab.phase.${strokePhaseKey(ms.stroke_phase)}`)));
  h.setBind('lab.drivers', h.escapeHtml(h.t(ms.driver_nsleep_level ? 'lab.on' : 'lab.off')));
}

/** Path through (x, y) points scaled into the 600×100 box; gaps (null) break the line. */
function pathOf(points, t0, t1, lo, hi) {
  const span = Math.max(1, t1 - t0);
  const range = hi - lo || 1;
  let d = '';
  let pen = false;
  for (const [t, v] of points) {
    if (!Number.isFinite(v)) { pen = false; continue; }
    const x = ((t - t0) / span) * W;
    const y = 100 - ((v - lo) / range) * 100;
    d += `${pen ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

function scale(values, floorZero) {
  const v = values.filter(Number.isFinite);
  if (!v.length) return null;
  let lo = floorZero ? 0 : Math.min(...v);
  let hi = Math.max(...v);
  if (hi - lo < 1e-6) { hi += 1; lo -= floorZero ? 0 : 1; }
  const pad = (hi - lo) * 0.08;
  return { lo: floorZero ? lo : lo - pad, hi: hi + pad };
}

function yLabels(bind, sc, unit, digits) {
  if (!sc) { h.setBind(`lab.y.${bind}`, '<span>—</span><span>—</span><span>—</span>'); return; }
  const f = (v) => `${h.num(v, digits)}`;
  h.setBind(`lab.y.${bind}`,
    `<span>${f(sc.hi)} <small>${unit}</small></span><span>${f((sc.hi + sc.lo) / 2)}</span><span>${f(sc.lo)}</span>`);
}

function setPath(bind, d) {
  document.querySelectorAll(`[data-lab-path="${bind}"]`).forEach((el) => el.setAttribute('d', d));
}

function paintTrace() {
  const box = document.querySelector('.mtrace');
  if (!box) return;
  const rows = samples.filter((s) => Number.isFinite(s.t_ms));
  if (rows.length < 2) { box.setAttribute('data-empty', ''); return; }
  box.removeAttribute('data-empty');
  const t0 = rows[0].t_ms;
  const t1 = rows[rows.length - 1].t_ms;

  const cur = rows.map((s) => [s.t_ms, s.current_ma]);
  const cs = scale(cur.map((p) => p[1]), true);
  setPath('current', cs ? pathOf(cur, t0, t1, cs.lo, cs.hi) : '');
  yLabels('current', cs, 'mA', 0);

  const series = motorTraceSeries(rows);
  const cad = series.cadence.map((c) => [c.t_ms, c.rate_hz]);
  const cds = scale(cad.map((p) => p[1]), true);
  setPath('cadence', cds ? pathOf(cad, t0, t1, cds.lo, cds.hi) : '');
  yLabels('cadence', cds, 'Hz', 0);

  const slp = series.slopes.map((s) => [s.t_ms, s.slope]);
  const ss = scale(slp.map((p) => p[1]), false);
  setPath('slope', ss ? pathOf(slp, t0, t1, ss.lo, ss.hi) : '');
  yLabels('slope', ss, 'mA/s', 0);

  // Phases as segments along the same time axis.
  const segs = [];
  for (const s of rows) {
    const k = strokePhaseKey(s.stroke_phase);
    if (segs.length && segs[segs.length - 1].k === k) segs[segs.length - 1].b = s.t_ms;
    else segs.push({ k, a: s.t_ms, b: s.t_ms });
  }
  for (let i = 0; i + 1 < segs.length; i++) segs[i].b = segs[i + 1].a;
  h.setBind('lab.phases', segs.map((g) =>
    `<span data-phase="${g.k}" style="--w:${Math.max(1, g.b - g.a)}" title="${h.escapeHtml(h.t(`lab.phase.${g.k}`))}">${h.escapeHtml(h.t(`lab.phase.${g.k}`))}</span>`).join(''));

  const sec = (t1 - t0) / 1000;
  h.setBind('lab.x', `<span>0 s</span><span>${h.num(sec / 2, 1)} s</span><span>${h.num(sec, 1)} s</span>`);
  h.setBind('lab.chartMeta', h.escapeHtml(h.t('lab.chartMeta', {
    dir: h.t(`lab.dir.${lastDir}`), s: h.num(sec, 1), n: rows.length,
  })));

  const driven = rows.filter((s) => s.drive_on && Number.isFinite(s.current_ma)).map((s) => s.current_ma);
  metric('lab.mean', driven.length ? driven.reduce((a, b) => a + b, 0) / driven.length : NaN);
  metric('lab.peak', driven.length ? Math.max(...driven) : NaN);
  const pin = pinContactSample(rows);
  h.setBind('lab.pin', h.escapeHtml(pin
    ? h.t('lab.pinSeen', { s: h.num((pin.t_ms - t0) / 1000, 1), n: pin.motion_count })
    : h.t('lab.pinWaiting')));
}

async function pullTrace() {
  try {
    const rows = parseMotorTraceCsv(await fetchMotorTraceCsv());
    samples = mergeMotorTraceSamples(samples, rows, 60000, TRACE_HZ);
    paintTrace();
  } catch (_) { /* busy or offline: the next pull covers it (ring ~13 s) */ }
}

/** One timed move, traced until the motor stops. Returns false when it never ran. */
async function traced(dir, ms) {
  const z = zone();
  lastDir = dir;
  samples = [];
  paintTrace();
  run = { stop: false, halted: false };
  setDashboardValue('motorLabBusy', true);
  try {
    await (dir === 'open' ? openMotorTimed(z, ms) : closeMotorTimed(z, ms));
  } catch (_) {
    setDashboardValue('motorLabBusy', false);
    run = null;
    return false;
  }
  const start = Date.now();
  let lastPull = start;
  let idle = 0;
  while (!run.halted) {
    await sleep(POLL_MS);
    let ms_ = null;
    try { const r = await fetchDiagnostics(); ms_ = (r.data || r).motor_safety; } catch (_) { /* keep polling */ }
    if (ms_) {
      paintLive(ms_);
      if (Number(ms_.learned_stall_ma) > 0) learnedStallMa = Number(ms_.learned_stall_ma);
    }
    const now = Date.now();
    if (now - lastPull >= PULL_MS) { lastPull = now; await pullTrace(); }
    const moving = ms_ && (ms_.motor_busy || ms_.drive_on);
    idle = moving ? 0 : idle + 1;
    if (now - start > 1000 && idle >= 2) break;
    if (now - start > ms + STOP_GRACE_MS) break;
    if (run.stop) { run.stop = false; try { await stopMotor(z); } catch (_) { /* e-stop is the fallback */ } }
  }
  await pullTrace();
  setDashboardValue('motorLabBusy', false);
  if (samples.length > 1) capture = { dir, samples: samples.slice() };
  explore();
  refreshZones(true);
  const halted = run.halted;
  run = null;
  return !halted;
}

async function stroke(dir, key, next, ms) {
  const before = state;
  setState('running');
  const ok = await traced(dir, ms);
  if (state === 'halted') return;
  if (!ok) { setState(before, h.t('lab.err.failed')); return; }
  if (key) done.add(key);
  setState(next || before);
}

async function arm() {
  setState('running');
  try {
    await setManualMode(true);
    await setDriversEnabled(true);
  } catch (_) {
    setState('setup', h.t('lab.err.failed'));
    return;
  }
  for (let i = 0; i < 8; i++) {
    try {
      const r = await fetchDiagnostics();
      const d = r.data || r;
      if (d.drivers_enabled) { done.add('arm'); setState('armed'); return; }
    } catch (_) { /* retry */ }
    await sleep(400);
  }
  setState('setup', h.t('lab.err.drivers'));
}

async function finish() {
  if (run) run.halted = true;
  try { await setManualMode(false); } catch (_) { /* the switch under Service shows it */ }
  done.clear();
  setState('setup');
}

/** Emergency stop: every motor, drivers off; the sequence starts over. */
export async function labEmergencyStop() {
  if (run) run.halted = true;
  done.clear();
  if (h) setState('halted', h.t('lab.haltedMsg'));
  setDashboardValue('motorLabBusy', false);
  await emergencyStopMotors();
}

// ---- End-stop explorer --------------------------------------------------------

const THR_FORM = 'form[data-save="lab-thr"]';
const PATHS = {
  close: ['trailing', 'threshold', 'seat', 'popoff', 'stall', 'circuit', 'ceiling', 'wall'],
  open: ['threshold', 'openStop', 'stall', 'circuit', 'ceiling'],
};

function field(name) {
  const el = document.querySelector(`${THR_FORM} [name="${name}"]`);
  const v = el ? Number(String(el.value).replace(',', '.')) : NaN;
  return Number.isFinite(v) ? v : undefined;
}

/** Explorer parameters from the form (unsaved edits included). */
function params() {
  const hmip = String(ev(gkey.motorProfileDefault) || '').toLowerCase().includes('hmip');
  const runS = Number(ev(hmip ? gkey.hmipRuntimeLimitSeconds : gkey.genericRuntimeLimitSeconds));
  const p = {
    closeFactor: field('close_threshold_multiplier'),
    trailingStepMa: field('close_trailing_step_ma'),
    trailingWindowMs: field('close_trailing_ref_ms'),
    trailingSustainMs: field('close_trailing_sustain_ms'),
    openFactor: field('open_endstop_current_factor'),
    stallFraction: field('open_endstop_stall_fraction'),
    seatMa: field('cap_close_seat_ma'),
    seatFrames: field('cap_close_seat_frames'),
    popoffMa: field('cap_close_popoff_ma'),
    openStopMa: field('cap_open_stop_ma'),
    stallMa: field('cap_stall_ma'),
    circuitMa: field('cap_circuit_fault_ma'),
    closeCeilingCounts: field('close_runtime_limit_counts'),
    closeCeilingS: Number.isFinite(runS) && runS > 0 ? runS : undefined,
    learnedStallMa: learnedStallMa || undefined,
  };
  for (const k of Object.keys(p)) if (p[k] === undefined) delete p[k];
  return p;
}

function source() {
  const r = document.querySelector('input[name="lab_src"]:checked');
  return r ? r.value : 'capture';
}

function hline(cls, y) {
  return `<path class="${cls}" d="M0,${y.toFixed(1)}H${W}"/>`;
}

function vline(cls, x) {
  return `<path class="${cls}" d="M${x.toFixed(1)},0V100"/>`;
}

function fmtS(ms) {
  return `${h.num(ms / 1000, 1)} s`;
}

function explore() {
  const box = document.querySelector('[data-lab-explorer]');
  if (!box || !h) return;
  const src = source();
  const dir = capture ? capture.dir : 'close';
  const rows = src === 'reference'
    ? referenceSamples(dir === 'open' ? REFERENCE_OPEN : REFERENCE_CLOSE)
    : (capture ? capture.samples : []);
  if (rows.length < 4) { box.setAttribute('data-empty', ''); h.setShow('lab.thr.hasSuggest', false); return; }
  box.removeAttribute('data-empty');
  const res = explainEndstop(rows, dir, params());
  const series = res.series;
  if (!series.length) { box.setAttribute('data-empty', ''); return; }
  const t0 = series[0].t_ms;
  const t1 = series[series.length - 1].t_ms;
  const tx = (t) => ((t - t0) / Math.max(1, t1 - t0)) * W;

  // Current scale covers the trace and the dynamic threshold; caps above it are listed, not drawn.
  const vals = series.flatMap((r) => [r.current_ma, r.threshold_ma]).filter(Number.isFinite);
  const hi = Math.max(...vals) * 1.15;
  const lo = 0;
  const ty = (v) => 100 - ((v - lo) / (hi - lo)) * 100;
  const p = res.params;
  setThr('current', pathOf(series.map((r) => [r.t_ms, r.current_ma]), t0, t1, lo, hi));
  setThr('threshold', pathOf(series.map((r) => [r.t_ms, r.threshold_ma]), t0, t1, lo, hi));
  const caps = dir === 'close' ? [p.seatMa, p.popoffMa, p.stallMa, p.circuitMa] : [p.openStopMa, p.stallMa, p.circuitMa];
  if (res.baselineMa != null) caps.push(res.baselineMa);
  setThrHtml('caps', caps.filter((v) => Number.isFinite(v) && v <= hi).map((v) => hline('cap', ty(v))).join(''));
  setThrHtml('trips', PATHS[dir].filter((id) => res.trips[id])
    .map((id) => vline(id === res.first ? 'trip first' : 'trip', tx(res.trips[id].t_ms))).join(''));
  h.setBind('lab.y.thr', `<span>${h.num(hi, 0)} <small>mA</small></span><span>${h.num(hi / 2, 0)}</span><span>0</span>`);
  h.setBind('lab.thr.x', `<span>0 s</span><span>${fmtS((t1 - t0) / 2)}</span><span>${fmtS(t1 - t0)}</span>`);
  h.setBind('lab.thr.meta', h.escapeHtml(h.t('lab.thr.meta', {
    dir: h.t(`lab.dir.${dir}`), src: h.t(src === 'reference' ? 'lab.thr.reference' : 'lab.thr.capture'),
  })));

  // Trailing rise (closing only) against the step threshold.
  const closing = dir === 'close';
  h.setShow('lab.thr.rise', closing);
  if (closing) {
    const rise = series.map((r) => [r.t_ms, r.rise_ma]);
    const rv = rise.map((x) => x[1]).filter(Number.isFinite);
    const rhi = Math.max(p.trailingStepMa * 1.5, ...(rv.length ? rv : [1]));
    const rlo = Math.min(0, ...(rv.length ? rv : [0]));
    setThr('rise', pathOf(rise, t0, t1, rlo, rhi));
    setThrHtml('risecap', hline('cap', 100 - ((p.trailingStepMa - rlo) / (rhi - rlo)) * 100));
    h.setBind('lab.y.rise', `<span>${h.num(rhi, 1)} <small>mA</small></span><span>${h.num((rhi + rlo) / 2, 1)}</span><span>${h.num(rlo, 1)}</span>`);
  }

  // Table: every path, its threshold and where it would fire.
  const level = {
    threshold: res.series.slice().reverse().find((r) => r.threshold_ma != null),
    seat: p.seatMa, popoff: p.popoffMa, openStop: p.openStopMa, stall: p.stallMa, circuit: p.circuitMa,
  };
  const thrText = (id) => {
    if (id === 'threshold') return level.threshold ? `${h.num(level.threshold.threshold_ma, 1)} mA` : '—';
    if (id === 'trailing') return `${h.num(p.trailingStepMa, 1)} mA / ${h.num(p.trailingWindowMs / 1000, 1)} s`;
    if (id === 'ceiling') return `${h.num(closing ? p.closeCeilingS : p.openCeilingS, 0)} s`;
    if (id === 'wall') return '40 s';
    return Number.isFinite(level[id]) ? `${h.num(level[id], 0)} mA` : '—';
  };
  h.setBind('lab.thr.rows', PATHS[dir].map((id) => {
    const trip = res.trips[id];
    const first = id === res.first;
    const name = h.escapeHtml(h.t(`lab.path.${id}`));
    return `<tr${first ? ' class="first"' : ''}><td>${name}${first ? ` <span class="badge">${h.escapeHtml(h.t('lab.thr.first'))}</span>` : ''}</td>`
      + `<td class="num">${thrText(id)}</td>`
      + `<td class="num">${trip ? fmtS(trip.t_ms - t0) : h.escapeHtml(h.t('lab.thr.notReached'))}</td>`
      + `<td class="num">${trip ? trip.motion_count : '—'}</td></tr>`;
  }).join(''));

  // Verdict.
  let verdict;
  if (!res.first) verdict = h.t('lab.thr.verdictNone');
  else if (res.first === 'ceiling') verdict = h.t('lab.thr.verdictCeiling', { t: fmtS(res.trips.ceiling.t_ms - t0) });
  else {
    const tr = res.trips[res.first];
    const vars = { name: h.t(`lab.path.${res.first}`), t: fmtS(tr.t_ms - t0), ma: `${h.num(tr.current_ma, 1)} mA` };
    verdict = h.t(res.beforeWall ? 'lab.thr.verdictFirst' : 'lab.thr.verdictLate', vars);
  }
  h.setBind('lab.thr.verdict', h.escapeHtml(verdict));

  // Suggested factor from the recorded stroke (not from the reference trace).
  const a = src === 'capture' && capture ? analyzeMotorTrace(capture.samples, dir) : null;
  const ok = !!(a && a.ok && Number.isFinite(a.suggested_factor));
  h.setShow('lab.thr.hasSuggest', ok);
  if (ok) {
    const name = closing ? 'close_threshold_multiplier' : 'open_endstop_current_factor';
    const label = h.t(closing ? 'lab.p.closeFactor' : 'lab.p.openFactor');
    const btn = document.querySelector('[data-lab="suggest"]');
    if (btn) { btn.dataset.field = name; btn.dataset.value = String(a.suggested_factor); }
    h.setBind('lab.thr.suggest', h.escapeHtml(h.t('lab.thr.suggestText', { name: label, v: h.num(a.suggested_factor, 2) })));
  }
}

function setThr(k, d) {
  document.querySelectorAll(`[data-thr="${k}"]`).forEach((el) => el.setAttribute('d', d));
}

function setThrHtml(k, html) {
  document.querySelectorAll(`[data-thr="${k}"]`).forEach((el) => { el.innerHTML = html; });
}

/** Thresholds from state into the form, unless it is being edited. */
function paintThresholds() {
  const form = document.querySelector(THR_FORM);
  if (!form || !h || h.formIsLocked(form.querySelector('input'))) return;
  let changed = false;
  form.querySelectorAll('input[name]').forEach((el) => {
    const v = Number(ev(`number-${el.name}`));
    if (!Number.isFinite(v)) return;
    const dec = (String(el.step).split('.')[1] || '').length;
    const text = v.toFixed(dec);
    if (el.value !== text) { el.value = text; changed = true; }
  });
  if (changed) explore();
}

// ---- Zones (/api/v1/zones) -----------------------------------------------------

async function refreshZones(force) {
  if (!force && zones && Date.now() - zonesAt < 30000) return;
  zonesAt = Date.now();
  try {
    const r = await fetch('/api/v1/zones', { cache: 'no-store' });
    if (!r.ok) return;
    const d = await r.json();
    const data = d.data || d;
    zones = Array.isArray(data) ? data : (data.zones || []);
    paintZonePhysics();
  } catch (_) { /* offline: keep the last values */ }
}

/** Zone sheets: heat loss (UA) and time constant (τ), calculated / learned / used. */
function paintZonePhysics() {
  if (!h) return;
  const fin = (v) => v !== null && v !== undefined && Number.isFinite(Number(v)) && Number(v) > 0;
  const wk = (v) => (fin(v) ? h.escapeHtml(h.t('zdash.phys.wk', { v: h.num(Number(v), 1) })) : '—');
  const hrs = (v) => (fin(v) ? h.escapeHtml(h.t('zdash.phys.h', { v: h.num(Number(v), 0) })) : '—');
  for (const row of zones || []) {
    const z = Number(row.zone);
    const mass = Number(row.thermal_mass_kwh_per_k);
    const shown = fin(row.ua_prior_w_per_k);
    h.setShow(`z${z}.phys`, shown);
    if (!shown) continue;
    // τ = C / UA: calculated from the prior UA, used from the UA in use (or a learned τ).
    const tauCalc = fin(mass) ? (mass * 1000) / Number(row.ua_prior_w_per_k) : NaN;
    h.setBind(`z${z}.uaCalc`, wk(row.ua_prior_w_per_k));
    h.setBind(`z${z}.uaLearned`, wk(row.ua_learned_w_per_k));
    h.setBind(`z${z}.uaUsed`, wk(row.ua_effective_w_per_k));
    h.setBind(`z${z}.tauCalc`, hrs(tauCalc));
    h.setBind(`z${z}.tauLearned`, hrs(row.tau_learned_h));
    h.setBind(`z${z}.tauUsed`, hrs(fin(row.tau_learned_h) ? row.tau_learned_h : row.tau_h));
    const c = fin(mass) ? h.num(mass, 2) : '—';
    h.setBind(`z${z}.physNote`, h.escapeHtml(fin(row.ua_learned_w_per_k)
      ? h.t('zdash.phys.noteLearned', {
        c, d: Number(row.ua_learned_observed_days) || 0,
        p: h.num(Math.round(100 * (Number(row.ua_learned_confidence) || 0)), 0),
      })
      : h.t('zdash.phys.notePrior', { c })));
  }
}

/** The zone list carries the zones' names once state has loaded. */
export function paintMotorLab() {
  const sel = document.getElementById('lab_zone');
  if (!sel) return;
  paintThresholds();
  refreshZones(false);
  for (const opt of sel.options) {
    const z = Number(opt.value);
    const name = es(key.name(z));
    if (name) opt.textContent = `Z${z} ${name}`;
  }
}

export function initMotorLab(helpers) {
  h = helpers;
  if (!root()) return;
  setState('setup');
  document.addEventListener('input', (e) => {
    if (e.target.closest(THR_FORM)) explore();
  });
  document.addEventListener('change', (e) => {
    if (e.target.name === 'lab_src' || e.target.closest(THR_FORM)) explore();
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lab]');
    if (!b || !root() || !root().contains(b)) return;
    const a = b.dataset.lab;
    const jog = () => Math.round(Math.max(1, Math.min(45, Number(document.getElementById('lab_ms')?.value) || 10)) * 1000);
    if (a === 'stop') { if (run) run.stop = true; return; }
    if (a === 'csv') { downloadMotorTraceCsv(samples, `lune-v6-z${zone()}-${lastDir}.csv`); return; }
    if (a === 'suggest') {
      const el = document.querySelector(`${THR_FORM} [name="${b.dataset.field}"]`);
      if (el) {
        const dec = (String(el.step).split('.')[1] || '').length;
        el.value = Number(b.dataset.value).toFixed(dec);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }
    if (state === 'running') return;
    const armed = ['armed', 'seated', 'opened', 'closed'].includes(state);
    if (a.startsWith('jog-') && !armed) return;
    if (a === 'arm') arm();
    else if (a === 'seat') stroke('close', 'seat', 'seated', strokeMs());
    else if (a === 'open') stroke('open', 'open', 'opened', strokeMs());
    else if (a === 'close') stroke('close', 'close', 'closed', strokeMs());
    else if (a === 'jog-open') stroke('open', null, null, jog());
    else if (a === 'jog-close') stroke('close', null, null, jog());
    else if (a === 'finish') finish();
  });
}
