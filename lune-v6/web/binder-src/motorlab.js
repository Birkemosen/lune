/**
 * Motor lab (System › Motor lab, dev builds only): one stroke at a time on one motor.
 *
 * Arm (manual mode + drivers on) → seat (close until seated) → record the opening
 * stroke → record the closing stroke, plus timed manual moves. While the motor runs,
 * /diagnostics (motor_safety) is polled for the live board and /motor-trace.csv is
 * pulled often enough that successive ring windows (~13 s on the device) overlap; the
 * browser merges them into one trace for the whole stroke. Background polling pauses
 * meanwhile (motorLabBusy). Finish turns manual mode off so automatic control resumes.
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
} from '../dashboard-src/utils/motor-trace.js';

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
    if (ms_) paintLive(ms_);
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

/** The zone list carries the zones' names once state has loaded. */
export function paintMotorLab() {
  const sel = document.getElementById('lab_zone');
  if (!sel) return;
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
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lab]');
    if (!b || !root() || !root().contains(b)) return;
    const a = b.dataset.lab;
    const jog = () => Math.round(Math.max(1, Math.min(45, Number(document.getElementById('lab_ms')?.value) || 10)) * 1000);
    if (a === 'stop') { if (run) run.stop = true; return; }
    if (a === 'csv') { downloadMotorTraceCsv(samples, `lune-v6-z${zone()}-${lastDir}.csv`); return; }
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
