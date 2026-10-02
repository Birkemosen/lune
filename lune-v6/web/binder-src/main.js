/**
 * Lune V6 LDS2 binder — live data + form saves for the static HTML shell.
 * Navigation/theme stay pure CSS; this file only paints values and posts /api/v1.
 */
import { connect, refreshDashboard } from '../dashboard-src/core/sse.js';
import {
  ev, es, isEntityOn, getDeviceLog, getDashboardValue, subscribeDashboard,
  setDashboardValue, getZoneSeries, sampleHistory, setEntity,
} from '../dashboard-src/core/store.js';
import { key, gkey } from '../dashboard-src/utils/keys.js';
import { parseProbeIndex } from '../dashboard-src/utils/available-probes.js';
import {
  setSetpoint, setEnabled, setDriversEnabled, setGlobalSelect, setGlobalNumber, setGlobalText,
  setZoneSelect, setZoneText, setZoneNumber, applyZoneName, approveTouchProposal, revokeTouchConnection,
  setMotorTarget, openMotorTimed, closeMotorTimed, stopMotor, command, runI2cScan, postZonePhysics, postForecastProfile, postGroups,
  exportSettings, importSettings, saveSettingsBackup, fetchLatestRelease,
  firmwareCheck, firmwareInstall, uploadFirmware, downloadDeviceLogs,
  setManualMode, emergencyStopMotors, fetchPhysicsAlerts, fetchBleScan,
  resetMotorFault, resetMotorAndRelearn, calibrateAllMotors,
} from '../dashboard-src/core/api.js';
import { projectTemperature, PROJ_HORIZON } from './projection.js';

/** History entry indices for appended zone temp / sp_plan (after demand @ 10). */
const HIST_TEMP0 = 11;
const HIST_SP0 = 17;

const I18N = (() => {
  try {
    const el = document.getElementById('i18n');
    return el ? JSON.parse(el.textContent || '{}') : {};
  } catch {
    return {};
  }
})();

function t(k, vars) {
  let s = I18N[k] || k;
  if (vars) {
    for (const [name, val] of Object.entries(vars)) s = s.replace(`{${name}}`, String(val));
  }
  return s;
}

function dec() {
  return I18N._dec || '.';
}

function num(v, digits = 1) {
  // Number(null) === 0 — treat null/undefined/'' as missing, not zero.
  if (v == null || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits).replace('.', dec());
}

// Like Number(), but null/undefined/'' are missing (NaN), never 0.
function toNum(v) {
  return v == null || v === '' ? NaN : Number(v);
}

// Value with unit, or "—" alone when the value is missing.
function withUnit(v, unit, digits = 1) {
  return Number.isFinite(v) ? `${num(v, digits)} <small>${unit}</small>` : '—';
}

// Short degree form for tiles and lists: "21.4°" or "—".
function deg(v) {
  return Number.isFinite(v) ? `${num(v)}°` : '—';
}

function zoneLastFault(z) {
  return String(es(key.motorLastFault(z)) || '').trim().toLowerCase();
}

function zoneMotorLearned(z) {
  const open = toNum(ev(key.motorOpenRipples(z)));
  const close = toNum(ev(key.motorCloseRipples(z)));
  return (Number.isFinite(open) && open > 0) || (Number.isFinite(close) && close > 0);
}

/** Live end-stop learning for this zone. Firmware also labels idle unlearned
 *  zones CALIBRATING — that is "not learned", not an in-flight process. */
function zoneLearning(z) {
  const phase = String(es(key.motorLearnPhase(z)) || '').trim().toLowerCase();
  return phase === 'home' || phase === 'open' || phase === 'close';
}

/** Motor stage: learning | blocked | fault | learned | unlearned */
function zoneMotorStage(z) {
  if (zoneLearning(z)) return 'learning';
  const fault = zoneLastFault(z);
  if (fault === 'blocked') return 'blocked';
  if (fault && fault !== 'none' && fault !== 'ok') return 'fault';
  return zoneMotorLearned(z) ? 'learned' : 'unlearned';
}

function zoneNeedsLearning(z) {
  if (!isEntityOn(key.enabled(z))) return false;
  return zoneMotorStage(z) === 'unlearned';
}

function zoneState(z) {
  const motor = zoneMotorStage(z);
  if (motor === 'learning' || motor === 'blocked' || motor === 'fault') return motor;
  if (!isEntityOn(key.enabled(z))) return 'off';

  const zoneSt = String(es(key.state(z)) || '').trim().toLowerCase();
  if (zoneSt === 'heating') return 'calling';
  if (zoneSt === 'idle' || zoneSt === 'overheated' || zoneSt === 'manual'
      || zoneSt === 'waiting_room_temp' || zoneSt === 'waiting_calibration'
      || zoneSt === 'calibrating' || zoneSt === 'off') {
    return 'idle';
  }

  const valve = toNum(ev(key.valve(z)));
  if (Number.isFinite(valve) && valve > 5) return 'calling';
  return 'idle';
}

function zoneLearnPct(z) {
  const pct = toNum(ev(key.motorLearnPct(z)));
  if (!Number.isFinite(pct)) return 0;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

function zoneLearnPhaseLabel(z) {
  const phase = String(es(key.motorLearnPhase(z)) || '').trim().toLowerCase();
  let label = '';
  if (phase === 'home') label = t('cz.learnPhase.home');
  else if (phase === 'open') label = t('cz.learnPhase.open');
  else if (phase === 'close') label = t('cz.learnPhase.close');
  const sample = toNum(ev(key.motorLearnSample(z))) || 0;
  const need = toNum(ev(key.motorLearnSamplesNeeded(z))) || 0;
  if ((phase === 'open' || phase === 'close') && need > 0) {
    label = t('cz.learnPhase.pass', {
      phase: label,
      sample: Math.min(sample + 1, need) || 1,
      need,
    });
  }
  return label;
}

function zoneLearnShort(z) {
  return t('tile.learningPct', { pct: zoneLearnPct(z) });
}

function zoneLearnLong(z) {
  const phase = zoneLearnPhaseLabel(z);
  const pct = zoneLearnPct(z);
  return phase ? `${phase} · ${pct} %` : zoneLearnShort(z);
}

function zoneLevel(z) {
  const st = zoneState(z);
  if (st === 'fault' || st === 'blocked' || st === 'off') return 0;
  if (st === 'learning') {
    const pct = zoneLearnPct(z);
    return Math.max(1, Math.min(5, Math.ceil(Math.max(pct, 1) / 20)));
  }
  const valve = toNum(ev(key.valve(z)));
  if (!Number.isFinite(valve)) return 1;
  return Math.max(1, Math.min(5, Math.ceil(valve / 20)));
}

function setText(sel, html) {
  document.querySelectorAll(sel).forEach((el) => {
    el.innerHTML = html;
  });
}

function setBind(path, html) {
  setText(`[data-bind="${path}"]`, html);
}

function setShow(path, on) {
  document.querySelectorAll(`[data-bind-show="${path}"]`).forEach((el) => {
    el.hidden = !on;
  });
}

function formatOffset(v) {
  if (!Number.isFinite(v)) return '—';
  const s = num(Math.abs(v));
  return `${v >= 0 ? '+' : '−'}${s}`;
}

function formatRemaining(s) {
  if (!Number.isFinite(s) || s <= 0) return '';
  const sec = Math.round(s);
  if (sec < 60) return `${sec} s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function tempSourceLabel(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('ble')) return t('src.ble');
  if (s.includes('external') || s.includes('http')) return t('src.probe'); // fallback label
  return t('src.probe');
}

/** Form radios use probe|ble; firmware select expects Local Probe|BLE. */
function tempSourceSelectValue(raw) {
  const s = String(raw || '').toLowerCase();
  if (s === 'ble' || s.includes('ble')) return 'BLE';
  if (s.includes('external')) return 'External';
  return 'Local Probe';
}

/** Locale-safe number: "21,5" and "21.5" both parse. */
function parseNum(raw) {
  if (raw == null || raw === '') return NaN;
  if (typeof raw === 'number') return raw;
  return Number(String(raw).trim().replace(',', '.'));
}

function motorLearnedLabel(z) {
  const stage = zoneMotorStage(z);
  if (stage === 'learning') return `<span class="c-violet">${zoneLearnShort(z)}</span>`;
  if (stage === 'blocked') return `<span class="c-warn">${t('state.blocked')}</span>`;
  if (stage === 'fault') return `<span class="c-bad">${t('state.fault')}</span>`;
  if (stage === 'learned') return `<span class="c-ok">${t('common.learned')}</span>`;
  return `<span class="c-warn">${t('common.notLearned')}</span>`;
}

/** Firmware select values are "Probe N" / "None". */
function probeSelectValue(raw) {
  if (raw == null || raw === '' || String(raw).toLowerCase() === 'none') return 'None';
  const n = String(raw).replace(/\D/g, '');
  return n ? `Probe ${n}` : 'None';
}

/** Clear any zone that currently owns this 1-based probe index. */
async function freeProbeFromZones_(probe1based) {
  if (!(probe1based >= 1 && probe1based <= 8)) return;
  for (let z = 1; z <= 6; z++) {
    if (parseProbeIndex(es(key.probe(z))) === probe1based) {
      await setZoneSelect(z, 'zone_probe', 'None');
    }
  }
}

function firstFreeProbeIndex_(reserved) {
  const taken = new Set(reserved.filter((n) => n >= 1 && n <= 8));
  for (let z = 1; z <= 6; z++) {
    const idx = parseProbeIndex(es(key.probe(z)));
    if (idx) taken.add(idx);
  }
  const flow = parseProbeIndex(es(gkey.manifoldFlowProbe));
  const ret = parseProbeIndex(es(gkey.manifoldReturnProbe));
  if (flow) taken.add(flow);
  if (ret) taken.add(ret);
  for (let p = 1; p <= 8; p++) {
    if (!taken.has(p)) return p;
  }
  return 0;
}

/**
 * Assign manifold flow/return probes without probe_conflict 409s.
 * Handles swaps and steals from zone returns when the user remaps deliberately.
 */
async function applyManifoldProbes_(flowRaw, returnRaw) {
  const wantFlow = parseProbeIndex(probeSelectValue(flowRaw));
  const wantRet = parseProbeIndex(probeSelectValue(returnRaw));
  if (!wantFlow || !wantRet) {
    throw new Error('Manifold flow and return each need a probe (1–8)');
  }
  if (wantFlow === wantRet) {
    throw new Error('Flow and return cannot share the same probe');
  }

  const curFlow = parseProbeIndex(es(gkey.manifoldFlowProbe)) || 1;
  const curRet = parseProbeIndex(es(gkey.manifoldReturnProbe)) || 2;
  if (wantFlow === curFlow && wantRet === curRet) return;

  await freeProbeFromZones_(wantFlow);
  await freeProbeFromZones_(wantRet);

  // Pure swap (1↔2): park flow on a free temp probe first.
  if (wantFlow === curRet && wantRet === curFlow) {
    let temp = firstFreeProbeIndex_([wantFlow, wantRet, curFlow, curRet]);
    let borrowedZone = 0;
    let borrowedProbe = 0;
    if (!temp) {
      // 8-probe layout: borrow a zone return briefly as parking.
      for (let z = 1; z <= 6; z++) {
        const idx = parseProbeIndex(es(key.probe(z)));
        if (idx && idx !== wantFlow && idx !== wantRet) {
          borrowedZone = z;
          borrowedProbe = idx;
          await setZoneSelect(z, 'zone_probe', 'None');
          temp = idx;
          break;
        }
      }
    }
    if (!temp) throw new Error('No free probe to swap flow/return');
    await setGlobalSelect('manifold_flow_probe', `Probe ${temp}`);
    await setGlobalSelect('manifold_return_probe', `Probe ${wantRet}`);
    await setGlobalSelect('manifold_flow_probe', `Probe ${wantFlow}`);
    if (borrowedZone && borrowedProbe) {
      await setZoneSelect(borrowedZone, 'zone_probe', `Probe ${borrowedProbe}`);
    }
    return;
  }

  // Flow wants the probe return currently holds — move return first.
  if (wantFlow === curRet) {
    await setGlobalSelect('manifold_return_probe', `Probe ${wantRet}`);
    await setGlobalSelect('manifold_flow_probe', `Probe ${wantFlow}`);
    return;
  }

  // Return wants the probe flow currently holds — move flow first.
  if (wantRet === curFlow) {
    await setGlobalSelect('manifold_flow_probe', `Probe ${wantFlow}`);
    await setGlobalSelect('manifold_return_probe', `Probe ${wantRet}`);
    return;
  }

  if (wantFlow !== curFlow) await setGlobalSelect('manifold_flow_probe', `Probe ${wantFlow}`);
  if (wantRet !== curRet) await setGlobalSelect('manifold_return_probe', `Probe ${wantRet}`);
}

function anyZoneReturnAssigned() {
  for (let z = 1; z <= 6; z++) {
    if (parseProbeIndex(es(key.probe(z)))) return true;
  }
  return false;
}

function probeLayoutMode() {
  return anyZoneReturnAssigned() ? '8' : '2';
}

function setProbeLayoutUi(mode, { force = false } = {}) {
  const m = mode === '8' ? '8' : '2';
  const sample = document.querySelector('input[name="return_probe_mode"]');
  const locked = !force && sample && formIsLocked(sample);
  if (locked) return;
  const app = document.querySelector('.app');
  if (app) app.dataset.probeLayout = m;
  document.querySelectorAll('input[name="return_probe_mode"]').forEach((radio) => {
    radio.checked = radio.value === m;
  });
}

async function applyTwoProbeLayout() {
  for (let z = 1; z <= 6; z++) {
    await setZoneSelect(z, 'zone_probe', 'None');
  }
}

async function applyEightProbeDefaults() {
  // Free every probe first so manifold 1/2 and zone 3–8 never conflict.
  for (let z = 1; z <= 6; z++) {
    await setZoneSelect(z, 'zone_probe', 'None');
  }
  await setGlobalSelect('manifold_flow_probe', 'Probe 1');
  await setGlobalSelect('manifold_return_probe', 'Probe 2');
  for (let z = 1; z <= 6; z++) {
    await setZoneSelect(z, 'zone_probe', `Probe ${z + 2}`);
  }
}

function paintStrip() {
  const flow = toNum(ev(gkey.flow));
  const ret = toNum(ev(gkey.ret));
  const dt = Number.isFinite(flow) && Number.isFinite(ret) ? flow - ret : NaN;
  let calling = 0;
  let faults = 0;
  for (let z = 1; z <= 6; z++) {
    const st = zoneState(z);
    if (st === 'calling') calling += 1;
    if (st === 'fault') faults += 1;
    const tile = document.querySelector(`label.tile[for="s-z${z}"]`);
    const needsLearn = zoneNeedsLearning(z);
    if (tile) {
      tile.dataset.state = st;
      tile.dataset.level = String(zoneLevel(z));
      if (needsLearn) tile.dataset.learn = 'needed';
      else delete tile.dataset.learn;
      if (st === 'learning') tile.title = zoneLearnLong(z);
      else if (st === 'blocked') tile.title = t('state.blocked');
      else if (st === 'fault') tile.title = t('state.fault');
      else if (needsLearn) tile.title = t('common.notLearned');
      else tile.removeAttribute('title');
    }
    const name = es(key.name(z)) || `Zone ${z}`;
    setBind(`z${z}.name`, name);
    setBind(`z${z}.title`, `${z} ${name}`);
    setBind(`z${z}.temp`, st === 'fault' ? t('tile.fault')
      : st === 'blocked' ? t('tile.blocked')
      : st === 'learning' ? zoneLearnShort(z)
      : deg(toNum(ev(key.temp(z)))));
    const badgeKey = st === 'calling' ? 'state.calling'
      : st === 'fault' ? 'state.fault'
      : st === 'blocked' ? 'state.blocked'
      : st === 'learning' ? 'state.learning'
      : st === 'off' ? 'state.off'
      : 'state.idle';
    const badgeText = st === 'learning' ? zoneLearnShort(z) : t(badgeKey);
    setBind(`z${z}.badge`, badgeText);
    const badgeEl = document.querySelector(`#v-dash-z${z} [data-bind="z${z}.badge"]`);
    if (badgeEl) {
      badgeEl.className = st === 'calling' ? 'badge hot'
        : st === 'fault' ? 'badge bad'
        : st === 'blocked' ? 'badge warn'
        : st === 'learning' ? 'badge violet'
        : 'badge';
    }
    setBind(`z${z}.sub`, st === 'learning' ? zoneLearnLong(z) : t(badgeKey));
    setShow(`z${z}.fault`, st === 'fault');
    const offset = toNum(ev(key.coordinatorOffset(z)));
    const rem = toNum(ev(key.coordinatorRemaining(z)));
    const preloadOn = Number.isFinite(offset) && Math.abs(offset) >= 0.05;
    setShow(`z${z}.preload`, preloadOn);
    if (preloadOn) {
      const offLabel = formatOffset(offset);
      const remLabel = formatRemaining(rem);
      setBind(`z${z}.preload`, remLabel
        ? t('zdash.preloadUntil', { offset: offLabel, remaining: remLabel })
        : t('zdash.preload', { offset: offLabel }));
    }
    setBind(`z${z}.motor`, motorLearnedLabel(z));
    const preheat = toNum(ev(key.preheatAdvance(z)));
    setBind(`z${z}.preheat`, Number.isFinite(preheat) ? `${num(preheat, 2)} °C` : '—');
    const offsetDd = document.querySelector(`#v-dash-z${z} [data-bind="z${z}.offset"]`);
    const offsetHtml = Number.isFinite(offset) ? `${formatOffset(offset)} °C` : '—';
    setBind(`z${z}.offset`, offsetHtml);
    if (offsetDd) offsetDd.className = preloadOn ? 'c-info' : '';
    const srcHtml = `<span class="c-info">${tempSourceLabel(es(key.tempSource(z)))}</span>`;
    setBind(`z${z}.tempFrom`, srcHtml);
    paintMotorConf(z, st);
    const comfort = document.querySelector(`.comfort label[for="s-z${z}"]`);
    if (comfort) comfort.dataset.state = st;
    if (st === 'fault') {
      setBind(`z${z}.comfort`, `<b class="bad">${t('state.fault')}</b>`);
    } else if (st === 'blocked') {
      setBind(`z${z}.comfort`, `<b class="c-warn">${t('state.blocked')}</b>`);
    } else if (st === 'learning') {
      setBind(`z${z}.comfort`, `<b class="c-violet">${zoneLearnShort(z)}</b>`);
    } else {
      const temp = toNum(ev(key.temp(z)));
      const sp = toNum(ev(key.effectiveSetpoint(z)) ?? ev(key.setpoint(z)));
      const warn = Number.isFinite(temp) && Number.isFinite(sp) && sp - temp > 0.5;
      setBind(`z${z}.comfort`, `<b class="${warn ? 'c-warn' : ''}">${deg(temp)}</b> / ${deg(sp)}`);
    }
    const now = document.querySelector(`#v-dash-z${z} .climate .now`);
    if (now) {
      const nowT = toNum(ev(key.temp(z)));
      now.innerHTML = Number.isFinite(nowT) ? `${num(nowT)}<small>°C</small>` : '—';
    }
    const opening = toNum(ev(key.valve(z)));
    setBind(`z${z}.flow`, Number.isFinite(opening) ? String(Math.round(opening)) : '—');
    const zoneProbe = parseProbeIndex(es(key.probe(z)));
    if (zoneProbe) {
      setBind(`z${z}.return`, withUnit(toNum(ev(key.probeTemp(zoneProbe))), '°C'));
    } else {
      setBind(`z${z}.return`, '—');
    }
    const bar = document.querySelector(`#v-dash-z${z} .bar`);
    if (bar && Number.isFinite(opening)) {
      bar.style.setProperty('--v', `${Math.max(0, Math.min(100, opening))}%`);
    }
    const prior = toNum(ev(key.balancePrior(z)));
    const learned = toNum(ev(key.balanceLearned(z)));
    const effective = toNum(ev(key.balanceEffective(z)));
    setBind(`bal.z${z}.id`, `Z${z}`);
    setBind(`bal.z${z}.prior`, Number.isFinite(prior) ? num(prior, 2) : '—');
    setBind(`bal.z${z}.learned`, Number.isFinite(learned) ? num(learned, 2) : '—');
    setBind(`bal.z${z}.effective`, Number.isFinite(effective) ? num(effective, 2) : '—');
  }
  setBind('strip.flow', deg(flow));
  setBind('strip.return', deg(ret));
  setBind('strip.dt', deg(dt));
  for (const [cls, v] of [['flow', flow], ['ret', ret]]) {
    const el = document.querySelector(`.tile-sys .temp.${cls}`);
    if (el) el.toggleAttribute('data-empty', !Number.isFinite(v));
  }
  setBind('manifold.flow', withUnit(flow, '°C'));
  setBind('manifold.return', withUnit(ret, '°C'));
  setBind('manifold.dt', withUnit(dt, 'K'));
  let totalOpen = 0;
  let openCount = 0;
  let firstFault = 0;
  for (let z = 1; z <= 6; z++) {
    const v = toNum(ev(key.valve(z)));
    if (Number.isFinite(v)) { totalOpen += v; openCount += 1; }
    if (!firstFault && zoneState(z) === 'fault') firstFault = z;
  }
  const openingPct = openCount ? Math.round(totalOpen / 6) : NaN;
  setBind('manifold.opening', withUnit(openingPct, '%', 0));
  for (let p = 1; p <= 8; p++) {
    const pt = toNum(ev(key.probeTemp(p)));
    setBind(`probe.${p}`, Number.isFinite(pt) ? `${num(pt)} <small>°C</small>` : '—');
  }
  const mBar = document.querySelector('#v-dash-sys .bar');
  if (mBar) {
    const pct = Number.isFinite(openingPct) ? Math.max(0, Math.min(100, openingPct)) : 0;
    mBar.style.setProperty('--v', `${pct}%`);
    mBar.setAttribute('aria-valuenow', String(pct));
  }
  setBind('dash.sys.sub', t('dash.sys.sub', { zones: 6, calling, faults }));
  setShow('dash.alert', faults > 0);
  if (firstFault) {
    const fname = es(key.name(firstFault)) || `Zone ${firstFault}`;
    setBind('dash.alertTitle', t('alert.zoneFault', { zone: `Z${firstFault} ${fname}` }));
    const openBtn = document.querySelector('[data-bind-for="dash.alertZone"]');
    if (openBtn) {
      openBtn.setAttribute('for', `s-z${firstFault}`);
      openBtn.textContent = t('common.open', { x: `Z${firstFault}` });
    }
  }
  const heatBadge = document.querySelector('#v-dash-sys [data-bind="heat.badge"]');
  if (heatBadge) {
    heatBadge.textContent = calling > 0 ? t('badge.calling') : t('state.idle');
    heatBadge.className = calling > 0 ? 'badge hot' : 'badge';
  }
  const balMode = String(es(gkey.balancingMode) || '').toLowerCase();
  const balAdaptive = balMode.includes('adapt');
  setBind('bal.mode', balAdaptive ? t('bal.adaptive') : t('bal.static'));
  const balBadge = document.querySelector('#v-dash-sys [data-bind="bal.mode"]');
  if (balBadge) balBadge.className = balAdaptive ? 'badge violet' : 'badge';
  const live = !!getDashboardValue('live');
  const devBadge = document.querySelector('#v-dash-sys [data-bind="dev.badge"]');
  if (devBadge) {
    devBadge.textContent = live ? t('dev.online') : t('dev.offline');
    devBadge.className = live ? 'badge ok' : 'badge warn';
  }
}

function paintMotorConf(z, st) {
  const openR = toNum(ev(key.motorOpenRipples(z)));
  const closeR = toNum(ev(key.motorCloseRipples(z)));
  const openF = toNum(ev(key.motorOpenFactor(z)));
  const closeF = toNum(ev(key.motorCloseFactor(z)));
  const stage = zoneMotorStage(z);
  const badge = document.querySelector(`#v-conf-z${z} [data-bind="z${z}.motorBadge"]`);
  if (badge) {
    if (stage === 'learning') {
      badge.textContent = zoneLearnShort(z);
      badge.className = 'badge violet';
    } else if (stage === 'blocked') {
      badge.textContent = t('state.blocked');
      badge.className = 'badge warn';
    } else if (stage === 'fault') {
      badge.textContent = t('state.fault');
      badge.className = 'badge bad';
    } else if (stage === 'learned') {
      badge.textContent = t('common.learned');
      badge.className = 'badge ok';
    } else {
      badge.textContent = t('common.notLearned');
      badge.className = 'badge warn';
    }
  }
  const ripples = (Number.isFinite(openR) || Number.isFinite(closeR))
    ? `${Number.isFinite(openR) ? Math.round(openR) : '—'} / ${Number.isFinite(closeR) ? Math.round(closeR) : '—'}`
    : '—';
  setBind(`z${z}.ripples`, ripples);
  const factors = (Number.isFinite(openF) || Number.isFinite(closeF))
    ? `${Number.isFinite(openF) && openF > 0 ? num(openF, 2) : '—'} / ${Number.isFinite(closeF) && closeF > 0 ? num(closeF, 2) : '—'}`
    : '—';
  setBind(`z${z}.factors`, factors);
  const faultRaw = String(es(key.motorLastFault(z)) || '').trim();
  const faultLabel = (!faultRaw || faultRaw.toLowerCase() === 'none')
    ? t('common.none')
    : faultRaw.replace(/_/g, ' ');
  const faultEl = document.querySelector(`#v-conf-z${z} [data-bind="z${z}.lastFault"]`);
  if (faultEl) {
    faultEl.textContent = faultLabel;
    faultEl.className = st === 'fault' ? 'bad' : st === 'blocked' ? 'c-warn' : '';
  }
  const learning = stage === 'learning';
  setShow(`z${z}.learnBar`, learning);
  setBind(`z${z}.learnPhase`, learning ? zoneLearnLong(z) : '');
  const learnBar = document.querySelector(`[data-bind-bar="z${z}.learn"]`);
  if (learnBar) {
    const pct = zoneLearnPct(z);
    learnBar.style.setProperty('--v', `${pct}%`);
    learnBar.setAttribute('aria-valuenow', String(pct));
    learnBar.setAttribute('aria-valuetext', zoneLearnLong(z));
  }
}

function formatUptime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '—';
  const s = Math.floor(sec);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d} <small>${t('common.days')}</small>`);
  if (d > 0 || h > 0) parts.push(`${h} <small>${t('common.hours')}</small>`);
  parts.push(`${m} <small>${t('common.minutes')}</small>`);
  return parts.join(' ');
}

function formatUptimePlain(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '—';
  const s = Math.floor(Number(sec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d} ${t('common.days')}`);
  if (d > 0 || h > 0) parts.push(`${h} ${t('common.hours')}`);
  parts.push(`${m} ${t('common.minutes')}`);
  return parts.join(' ');
}

function paintDevice() {
  const rssi = toNum(ev(gkey.wifi));
  setBind('wifi.rssi', `${Number.isFinite(rssi) ? Math.round(rssi) : '—'} <small>dBm</small>`);
  const up = toNum(ev(gkey.uptime));
  const upLabel = formatUptime(up);
  setBind('sys.uptime', upLabel);
  const displayName = es(gkey.deviceDisplayName) || es(gkey.deviceVariant) || 'Lune V6';
  const placeRaw = es(gkey.deviceLocation);
  const place = placeRaw || '—';
  const ip = es(gkey.ip) || '—';
  const mac = es(gkey.mac) || '—';
  const fw = es(gkey.firmware) || '—';
  const esphome = es(gkey.esphomeVersion) || getDashboardValue('esphomeVersion') || '—';
  setBind('device.header.name', displayName);
  setBind('device.about.name', displayName);
  setBind('device.about.place', place);
  setBind('device.about.ip', ip);
  setBind('device.about.mac', mac);
  setBind('device.about.firmware', fw);
  setBind('device.about.esphome', String(esphome));
  setBind('device.about.uptime', upLabel);
  setBind('fw.installed', fw);
  setBind('diag.cpu0', `${num(ev(gkey.cpuLoadCore0), 0)} <small>%</small>`);
  setBind('diag.cpu1', `${num(ev(gkey.cpuLoadCore1), 0)} <small>%</small>`);
  setBind('diag.heap', `${num(ev(gkey.freeInternalKb), 0)} <small>kB</small>`);
  setBind('diag.psram', `${num(ev(gkey.freePsramKb), 0)} <small>kB</small>`);
}

function copyDiagnostics() {
  const lines = [
    `Name: ${es(gkey.deviceDisplayName) || es(gkey.deviceVariant) || 'Lune V6'}`,
    `Location: ${es(gkey.deviceLocation) || '—'}`,
    `IP: ${es(gkey.ip) || '—'}`,
    `MAC: ${es(gkey.mac) || '—'}`,
    `Firmware: ${es(gkey.firmware) || '—'}`,
    `ESPHome: ${es(gkey.esphomeVersion) || getDashboardValue('esphomeVersion') || '—'}`,
    `Uptime: ${formatUptimePlain(ev(gkey.uptime))}`,
    `Wi-Fi_dBm: ${ev(gkey.wifi) ?? '—'}`,
    `Reset: ${es(gkey.resetReason) || '—'}`,
  ];
  const text = lines.join('\n');
  const btn = document.querySelector('[data-action="copy-diag"]');
  const done = () => {
    if (!btn) return;
    const prev = btn.textContent;
    btn.textContent = t('device.copied');
    setTimeout(() => { btn.textContent = prev; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => {
      // Fallback for older webviews
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (_) { /* ignore */ }
      ta.remove();
    });
  }
}

function paintTouch() {
  const configured = isEntityOn(gkey.authorityConfigured);
  const pending = isEntityOn(gkey.authorityProposalPending);
  const form = document.querySelector('form.panel[data-save="connections"], form.panel[data-save="touch"]');
  let pair = 'unpaired';
  if (pending) pair = 'pending';
  else if (configured) pair = 'approved';
  if (form) {
    // Preserve save busy/error while a write is in flight.
    if (form.dataset.state !== 'saving' && form.dataset.state !== 'saved') {
      form.dataset.state = pair;
    }
    form.dataset.pair = pair;
  }
  const badge = pending ? t('csys.touchPending')
    : configured ? t('csys.touchApproved')
      : t('csys.touchWaiting');
  setBind('touch.badge', badge);
  const badgeEl = document.querySelector('[data-bind="touch.badge"]');
  if (badgeEl) {
    badgeEl.classList.toggle('ok', pair === 'approved');
    badgeEl.classList.toggle('warn', pair === 'pending');
    badgeEl.classList.toggle('bad', pair === 'error');
  }
  setBind('touch.status', pending
    ? `${es(gkey.authorityProposalName) || 'Lune Touch'} is ready to connect`
    : configured
      ? t('csys.touchControls')
      : t('csys.touchWaitingBody'));
  setBind('touch.name', pending ? (es(gkey.authorityProposalName) || '—') : (configured ? 'Lune Touch' : '—'));
  setBind('touch.install', pending
    ? (es(gkey.authorityProposalInstallationId) || '—')
    : (es(gkey.authorityInstallationId) || '—'));
  setBind('touch.coord', pending
    ? (es(gkey.authorityProposalCoordinatorId) || '—')
    : (es(gkey.authorityCoordinatorId) || '—'));
  setShow('touch.identity', pending || configured);

  const lastOk = toNum(ev(gkey.bleClockSyncLastOkS));
  let lastSync = '—';
  if (Number.isFinite(lastOk) && lastOk > 0) {
    const age = Math.max(0, Math.floor(Date.now() / 1000) - lastOk);
    if (age < 60) lastSync = t('rt.secondsAgo', { v: age });
    else if (age < 3600) lastSync = t('rt.minutesAgo', { v: Math.round(age / 60) });
    else {
      const d = new Date(lastOk * 1000);
      const p = (n) => String(n).padStart(2, '0');
      lastSync = `${p(d.getHours())}:${p(d.getMinutes())}`;
    }
  }
  setBind('ble.lastSync', lastSync);
}

function paintLogs() {
  const lines = getDeviceLog() || [];
  // Store keeps oldest→newest; show newest first in the live panel.
  const html = lines.slice(-40).reverse().map((line) => {
    if (typeof line === 'string') return escapeHtml(line);
    const lvl = line.level != null ? String(line.level) : '';
    const tag = line.tag || '';
    const msg = line.msg || line.message || '';
    const ts = formatLogClock(line);
    const body = `[${lvl}] ${tag}: ${msg}`;
    return escapeHtml(ts ? `${ts}  ${body}` : body);
  }).join('\n');
  setBind('log', html || '—');
  const i2c = getDashboardValue('i2cResult');
  if (i2c) setBind('diag.i2c', escapeHtml(String(i2c)));
}

function formatLogClock(line) {
  const ms = line && (line.at || line.ms);
  if (ms == null || !Number.isFinite(Number(ms))) return '';
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function paintSparks() {
  sampleHistory(false);
  for (let z = 1; z <= 6; z++) {
    const svg = document.querySelector(`[data-bind-spark="z${z}"]`);
    if (!svg) continue;
    const temps = getZoneSeries('temp', z);
    const sps = getZoneSeries('sp', z);
    const html = seriesToSparkSvg(temps, sps);
    svg.innerHTML = html;
    // No temperature → no sparkline (never a flat line); see DESIGN.md 5.9.
    const row = svg.closest('label');
    if (row) row.toggleAttribute('data-empty', !html);
  }
  paintTrend();
  paintZcharts();
}

function seriesToSparkSvg(temps, sps) {
  // A sparkline needs at least two real temperatures; the target alone is not a graph.
  if (temps.filter((v) => Number.isFinite(v)).length < 2) return '';
  const vals = temps.concat(sps).filter((v) => Number.isFinite(v));
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const mid = (lo + hi) / 2;
  const span = Math.max(hi - lo + 0.6, 3.0);
  lo = mid - span / 2;
  hi = mid + span / 2;
  const W = 240;
  const Hh = 40;
  const X = (k, len) => ((len <= 1 ? 0 : k / (len - 1)) * W).toFixed(1);
  const Y = (v) => (Hh - ((v - lo) / (hi - lo)) * Hh).toFixed(1);
  const line = (arr) => arr.map((v, k) => `${X(k, arr.length)},${Y(v)}`).join(' ');
  const tp = temps.length ? line(temps) : '';
  let gp = [];
  for (let k = 0; k < sps.length; k++) {
    if (k && sps[k] !== sps[k - 1]) gp.push(`${X(k, sps.length)},${Y(sps[k - 1])}`);
    gp.push(`${X(k, sps.length)},${Y(sps[k])}`);
  }
  const goal = gp.join(' ');
  if (!tp && !goal) return '';
  const area = tp && goal
    ? `<polygon class="a" points="${tp} ${[...gp].reverse().join(' ')}"/>`
    : '';
  return `${area}${goal ? `<polyline class="g" points="${goal}"/>` : ''}${tp ? `<polyline class="t" points="${tp}"/>` : ''}`;
}

function paintTrend() {
  const svg = document.querySelector('[data-bind-trend="manifold"]');
  if (!svg) return;
  const hist = getDashboardValue('zoneStateHistory');
  const entries = hist && Array.isArray(hist.entries) ? hist.entries : [];
  const flows = [];
  const rets = [];
  // Prefer device 24 h history; fall back to short client buffer.
  if (entries.length >= 2) {
    const step = Math.max(1, Math.floor(entries.length / 48));
    for (let i = 0; i < entries.length; i += step) {
      const e = entries[i];
      const f = e[8];
      const r = e[9];
      if (typeof f === 'number' && Number.isFinite(f)) flows.push(f);
      if (typeof r === 'number' && Number.isFinite(r)) rets.push(r);
    }
  } else {
    const hf = getDashboardValue('historyFlow') || [];
    const hr = getDashboardValue('historyReturn') || [];
    flows.push(...hf);
    rets.push(...hr);
  }
  const wrap = svg.closest('.trend-wrap');
  const empty = flows.length < 2 && rets.length < 2;
  if (wrap) wrap.toggleAttribute('data-empty', empty);
  if (empty) {
    svg.innerHTML = '';
    return;
  }
  const vals = flows.concat(rets).filter((v) => Number.isFinite(v));
  let lo = Math.min(...vals) - 1;
  let hi = Math.max(...vals) + 1;
  if (!(hi > lo)) { lo = 26; hi = 39; }
  const W = 240;
  const Hh = 80;
  const X = (k, len) => ((len <= 1 ? 0 : k / (len - 1)) * W).toFixed(1);
  const Y = (v) => (Hh - ((v - lo) / (hi - lo)) * Hh).toFixed(1);
  const line = (arr) => arr.map((v, k) => `${X(k, arr.length)},${Y(Number.isFinite(v) ? v : lo)}`).join(' ');
  const pf = flows.length ? line(flows) : '';
  const pr = rets.length ? line(rets) : '';
  const band = pf && pr
    ? `<polygon class="dt" points="${pf} ${pr.split(' ').reverse().join(' ')}"/>`
    : '';
  svg.innerHTML = `${band}${pf ? `<polyline class="f" points="${pf}"/>` : ''}${pr ? `<polyline class="r" points="${pr}"/>` : ''}`;
}

/**
 * Downsample 5-min history to half-hour points (every 6th sample, end-aligned).
 * Entry layout: […, demand@10, t0..t5@11..16, sp0..sp5@17..22].
 */
function halfHourZoneSeries(entries, zoneIndex0) {
  const temps = [];
  const sps = [];
  if (!Array.isArray(entries) || entries.length === 0) return { temps, sps };
  const step = 6;
  const start = entries.length % step === 0 ? 0 : entries.length % step;
  for (let i = start; i < entries.length; i += step) {
    const e = entries[i];
    if (!Array.isArray(e)) continue;
    const tv = e[HIST_TEMP0 + zoneIndex0];
    const sv = e[HIST_SP0 + zoneIndex0];
    temps.push(typeof tv === 'number' && Number.isFinite(tv) ? tv : null);
    sps.push(typeof sv === 'number' && Number.isFinite(sv) ? sv : null);
  }
  return { temps, sps };
}

function formatClock(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Half-hour index → clock label (index PAST-1 = now). */
function zchartClockAt(k, past) {
  const halfHoursFromNow = k - (past - 1);
  return formatClock(new Date(Date.now() + halfHoursFromNow * 30 * 60 * 1000));
}

function ensureZchartScrub(plot) {
  let scrub = plot.querySelector('.zchart-scrub');
  if (!scrub) {
    scrub = document.createElement('span');
    scrub.className = 'zchart-scrub';
    scrub.hidden = true;
    scrub.setAttribute('aria-hidden', 'true');
    plot.appendChild(scrub);
  }
  return scrub;
}

function restoreZchartMetric(data) {
  if (!data) return;
  const z = data.z;
  setShow(`z${z}.expected`, data.hasProj);
  if (data.hasProj) {
    setBind(`z${z}.expectedLabel`, escapeHtml(t('zchart.expected', { time: data.expectedTime })));
    setBind(`z${z}.expected`, data.expectedVal);
  }
}

function clearZchartScrub(plot) {
  if (!plot) return;
  const scrub = plot.querySelector('.zchart-scrub');
  if (scrub) scrub.hidden = true;
  plot.removeAttribute('data-scrubbing');
  const svg = plot.querySelector('[data-bind-zchart]');
  restoreZchartMetric(svg && svg._zchart);
}

function scrubZchart(plot, clientX) {
  const svg = plot.querySelector('[data-bind-zchart]');
  const data = svg && svg._zchart;
  if (!data || data.total < 2) return;
  const rect = plot.getBoundingClientRect();
  if (rect.width <= 0) return;
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const frac = x / rect.width;
  const k = Math.round(frac * (data.total - 1));
  let val = null;
  if (k < data.past) {
    const v = data.tPast[k];
    if (v != null && Number.isFinite(v)) val = v;
  } else if (data.projMid) {
    const pi = k - data.past;
    if (pi >= 0 && pi < data.projMid.length && Number.isFinite(data.projMid[pi])) {
      val = data.projMid[pi];
    }
  }

  const scrub = ensureZchartScrub(plot);
  scrub.style.left = `${((k / (data.total - 1)) * 100).toFixed(2)}%`;
  scrub.hidden = false;
  plot.setAttribute('data-scrubbing', '');

  const clock = zchartClockAt(k, data.past);
  const labelKey = k >= data.past ? 'zchart.expected' : 'zchart.at';
  setShow(`z${data.z}.expected`, true);
  setBind(`z${data.z}.expectedLabel`, escapeHtml(t(labelKey, { time: clock })));
  setBind(`z${data.z}.expected`, val == null ? '—' : num(val, 1));
}

function initZchartScrub() {
  document.addEventListener('pointermove', (e) => {
    const plot = e.target && e.target.closest && e.target.closest('.zchart-plot');
    if (!plot) return;
    scrubZchart(plot, e.clientX);
  });
  document.addEventListener('pointerout', (e) => {
    const plot = e.target && e.target.closest && e.target.closest('.zchart-plot');
    if (!plot) return;
    const next = e.relatedTarget;
    if (next && plot.contains(next)) return;
    clearZchartScrub(plot);
  });
}

function paintZcharts() {
  const hist = getDashboardValue('zoneStateHistory');
  const entries = hist && Array.isArray(hist.entries) ? hist.entries : [];
  for (let z = 1; z <= 6; z++) {
    const svg = document.querySelector(`[data-bind-zchart="z${z}"]`);
    if (!svg) continue;
    const enabled = isEntityOn(key.enabled(z));
    const fault = zoneState(z) === 'fault';
    const { temps, sps } = halfHourZoneSeries(entries, z - 1);
    // Prefer device history; fall back to short client buffers if history lacks temps.
    let pastT = temps;
    let pastSp = sps;
    if (pastT.filter((v) => v != null).length < 2) {
      pastT = getZoneSeries('temp', z);
      pastSp = getZoneSeries('sp', z);
    }
    const fallbackSp = (() => {
      for (let i = pastSp.length - 1; i >= 0; i--) {
        if (pastSp[i] != null && Number.isFinite(pastSp[i])) return pastSp[i];
      }
      const live = toNum(ev(key.effectiveSetpoint(z)) ?? ev(key.setpoint(z)));
      return Number.isFinite(live) ? live : null;
    })();
    const proj = projectTemperature({
      temp: pastT,
      spPlan: Array(PROJ_HORIZON).fill(fallbackSp),
      fallbackSp,
      enabled,
    });

    const hasProj = !!proj;
    const expectedTime = formatClock(new Date(Date.now() + 6 * 3600 * 1000));
    const expectedVal = hasProj ? num(proj.mid[proj.mid.length - 1], 1) : '—';
    const plot = svg.closest('.zchart-plot');
    const scrubbing = plot && plot.hasAttribute('data-scrubbing');
    if (!scrubbing) {
      setShow(`z${z}.expected`, hasProj);
      if (hasProj) {
        setBind(`z${z}.expectedLabel`, escapeHtml(t('zchart.expected', { time: expectedTime })));
        setBind(`z${z}.expected`, expectedVal);
      }
    }

    let note = t('zchart.noForecast');
    if (hasProj && fault) note = t('zchart.faultStrong');
    else if (hasProj) note = '';
    setBind(`z${z}.zchartNote`, escapeHtml(note));

    // Build SVG: 48 past + 12 future slots on a 300×100 viewBox; now at x=240 (80%).
    const PAST = 48;
    const TOTAL = PAST + PROJ_HORIZON; // 60
    const W = 300;
    const Hh = 100;
    const nowX = (PAST - 1) / (TOTAL - 1) * W;

    // Align past series to the right edge of the past window.
    const align = (arr, n) => {
      const out = Array(n).fill(null);
      const src = arr.slice(-n);
      const off = n - src.length;
      for (let i = 0; i < src.length; i++) out[off + i] = src[i];
      return out;
    };
    const tPast = align(pastT, PAST);
    const sPast = align(pastSp, PAST);
    // Extend setpoint plan flat into the future for the step display.
    const sAll = sPast.concat(Array(PROJ_HORIZON).fill(fallbackSp));

    const vals = [];
    for (const v of tPast) if (v != null && Number.isFinite(v)) vals.push(v);
    for (const v of sAll) if (v != null && Number.isFinite(v)) vals.push(v);
    if (hasProj) {
      vals.push(...proj.mid, ...proj.lo, ...proj.hi);
    }
    if (vals.length < 2) {
      svg.innerHTML = '';
      svg._zchart = null;
      if (plot) clearZchartScrub(plot);
      setBind(`z${z}.zchartY`, '<span>—</span><span>—</span><span>—</span>');
      continue;
    }
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    const mid = (lo + hi) / 2;
    const span = Math.max(hi - lo + 0.6, 3.0);
    lo = mid - span / 2;
    hi = mid + span / 2;
    const X = (k) => ((TOTAL <= 1 ? 0 : k / (TOTAL - 1)) * W).toFixed(1);
    const Y = (v) => (Hh - ((v - lo) / (hi - lo)) * Hh).toFixed(1);

    const tempPts = [];
    for (let k = 0; k < PAST; k++) {
      if (tPast[k] == null || !Number.isFinite(tPast[k])) continue;
      tempPts.push(`${X(k)},${Y(tPast[k])}`);
    }
    const spPts = [];
    for (let k = 0; k < TOTAL; k++) {
      const v = sAll[k];
      if (v == null || !Number.isFinite(v)) continue;
      if (k && sAll[k - 1] != null && sAll[k - 1] !== v) {
        spPts.push(`${X(k)},${Y(sAll[k - 1])}`);
      }
      spPts.push(`${X(k)},${Y(v)}`);
    }

    let band = '';
    let projLine = '';
    if (hasProj) {
      const midPts = [];
      const hiPts = [];
      const loPts = [];
      // Connect from last past temp if present.
      const lastT = tPast[PAST - 1];
      const startK = PAST - 1;
      if (lastT != null && Number.isFinite(lastT)) {
        midPts.push(`${X(startK)},${Y(lastT)}`);
        hiPts.push(`${X(startK)},${Y(lastT)}`);
        loPts.push(`${X(startK)},${Y(lastT)}`);
      }
      for (let k = 0; k < PROJ_HORIZON; k++) {
        const xi = PAST + k;
        midPts.push(`${X(xi)},${Y(proj.mid[k])}`);
        hiPts.push(`${X(xi)},${Y(proj.hi[k])}`);
        loPts.push(`${X(xi)},${Y(proj.lo[k])}`);
      }
      band = `<polygon class="pb" points="${hiPts.join(' ')} ${loPts.reverse().join(' ')}"/>`;
      projLine = `<polyline class="pj" points="${midPts.join(' ')}"/>`;
    }

    const gl = [0.25, 0.5, 0.75].map((f) => {
      const y = (Hh * (1 - f)).toFixed(1);
      return `<line class="gl" x1="0" x2="${W}" y1="${y}" y2="${y}"/>`;
    }).join('');
    svg.innerHTML = `${gl}${band}`
      + (spPts.length ? `<polyline class="g" points="${spPts.join(' ')}"/>` : '')
      + (tempPts.length ? `<polyline class="t" points="${tempPts.join(' ')}"/>` : '')
      + projLine
      + `<rect class="past" x="0" y="0" width="${nowX.toFixed(1)}" height="${Hh}"/>`
      + `<line class="now" x1="${nowX.toFixed(1)}" x2="${nowX.toFixed(1)}" y1="0" y2="${Hh}"/>`;

    const yHi = num(hi, 1);
    const yMid = num((lo + hi) / 2, 1);
    const yLo = num(lo, 1);
    setBind(`z${z}.zchartY`, `<span>${yHi}</span><span>${yMid}</span><span>${yLo}</span>`);

    const wrap = svg.closest('.zchart');
    if (wrap) wrap.style.setProperty('--now', `${((nowX / W) * 100).toFixed(2)}%`);

    svg._zchart = {
      z,
      past: PAST,
      total: TOTAL,
      tPast,
      projMid: hasProj ? proj.mid : null,
      hasProj,
      expectedTime,
      expectedVal,
    };
    if (plot) ensureZchartScrub(plot);
  }
}

/** True while the user is editing a save-form (focus or unsaved local change). */
function formIsLocked(el) {
  const form = el && el.closest && el.closest('form[data-save]');
  if (!form) return false;
  // Pending climate autosave (_autoT) or in-flight save must not be wiped by paintAll.
  if (form._autoT || form.hasAttribute('data-dirty') || form.dataset.state === 'saving'
      || form.dataset.state === 'error' || form.dataset.state === 'saved') return true;
  const ae = document.activeElement;
  if (!ae || !form.contains(ae)) return false;
  // Hold while typing/selecting; ignore submit/stepper button focus so post-save paint works.
  return ae.matches('input:not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea');
}

function saveFormEl(detail) {
  if (detail && detail.form) return detail.form;
  const key = detail && detail.key;
  return key ? document.querySelector(`form.panel[data-save="${key}"]`) : null;
}

function resnapCleanForms() {
  document.querySelectorAll('form.panel[data-save]').forEach((form) => {
    if (typeof form.luneResnap !== 'function') return;
    if (form.hasAttribute('data-dirty') || form.dataset.state === 'saving' || form.dataset.state === 'error' || form.dataset.state === 'saved') return;
    form.luneResnap();
  });
}

function isHmipMotorType(sel) {
  if (!sel) return true;
  const opt = sel.options[sel.selectedIndex];
  return String((opt && (opt.value || opt.textContent)) || sel.value || '')
    .toLowerCase()
    .includes('hmip');
}

/** HmIP close ceiling is 40 s; generic has no mechanical max (soft UI bound 3600). */
function syncRuntimeLimits() {
  const type = document.getElementById('motor_type');
  const runtime = document.querySelector('input[name="m_runtime"]');
  if (!runtime) return;
  const hmip = isHmipMotorType(type);
  runtime.min = '5';
  runtime.step = '1';
  if (hmip) {
    runtime.max = '40';
    if (Number(runtime.value) > 40) runtime.value = '40';
  } else {
    runtime.max = '3600';
  }
}

function paintFormsFromState() {
  setProbeLayoutUi(probeLayoutMode());
  const flowProbe = es(gkey.manifoldFlowProbe);
  const retProbe = es(gkey.manifoldReturnProbe);
  const mType = es(gkey.manifoldType);
  if (mType) {
    const radio = document.querySelector(`input[name="manifold_type"][value="${mType === 'normally_open' || mType === 'no' ? 'no' : 'nc'}"]`);
    if (radio && !formIsLocked(radio)) radio.checked = true;
  }
  const pf = document.getElementById('probe_flow');
  if (pf && flowProbe && !formIsLocked(pf)) pf.value = String(flowProbe).replace(/\D/g, '') || pf.value;
  const pr = document.getElementById('probe_return');
  if (pr && retProbe && !formIsLocked(pr)) pr.value = String(retProbe).replace(/\D/g, '') || pr.value;
  const drivers = document.querySelector('input[name="motor_drivers"]');
  if (drivers && !formIsLocked(drivers)) drivers.checked = isEntityOn(gkey.drivers);
  const profile = String(es(gkey.motorProfileDefault) || '').toLowerCase();
  const motorType = document.getElementById('motor_type');
  if (motorType && !formIsLocked(motorType)) {
    const wantHmip = profile.includes('hmip');
    for (const opt of motorType.options) {
      if (wantHmip === String(opt.value || opt.textContent || '').toLowerCase().includes('hmip')) {
        opt.selected = true;
        break;
      }
    }
  }
  const runtime = document.querySelector('input[name="m_runtime"]');
  if (runtime && !formIsLocked(runtime)) {
    const lim = toNum(ev(profile.includes('hmip') ? gkey.hmipRuntimeLimitSeconds : gkey.genericRuntimeLimitSeconds));
    if (Number.isFinite(lim) && lim > 0) runtime.value = String(Math.round(lim));
  }
  syncRuntimeLimits();
  const heat = es(gkey.heatingMode) || 'heat_pump';
  const heatRadio = document.querySelector(`input[name="heat_mode"][value="${heat === 'heat_pump' ? 'heat_pump' : 'normal'}"]`);
  if (heatRadio && !formIsLocked(heatRadio)) heatRadio.checked = true;
  const paintNum = (name, entityKey, digits = 0) => {
    const el = document.querySelector(`input[name="${name}"]`);
    if (!el || formIsLocked(el)) return;
    const n = toNum(ev(entityKey));
    if (!Number.isFinite(n)) return;
    el.value = digits > 0 ? n.toFixed(digits) : String(Math.round(n));
  };
  paintNum('heat_min_open', gkey.minZoneFlowPct, 0);
  paintNum('hp_base', gkey.hpBasePct, 0);
  paintNum('hp_overheat', gkey.hpOverheatMarginC, 1);
  paintNum('hp_trim', gkey.hpTrimFloorPct, 0);
  const devName = document.getElementById('device_display_name');
  if (devName && !formIsLocked(devName)) {
    devName.value = es(gkey.deviceDisplayName) || devName.value;
  }
  const devPlace = document.getElementById('device_location');
  if (devPlace && !formIsLocked(devPlace)) {
    devPlace.value = es(gkey.deviceLocation) || '';
  }
  const ble = document.querySelector('input[name="ble_clock_enabled"]');
  if (ble && !formIsLocked(ble)) ble.checked = isEntityOn(gkey.bleClockSyncEnabled);
  const manual = document.querySelector('input[name="manual_mode"]');
  if (manual && !formIsLocked(manual)) manual.checked = !!getDashboardValue('manualMode');
  const absorb = document.querySelector('input[name="preheat_enabled"]');
  if (absorb && !formIsLocked(absorb)) {
    absorb.checked = isEntityOn(gkey.preheatAbsorbEnabled) || isEntityOn(gkey.simplePreheatEnabled);
  }
  paintNum('ph_band', gkey.preheatAbsorbBandC, 1);
  paintNum('ph_delta', gkey.preheatDetectDeltaC, 1);
  for (let z = 1; z <= 6; z++) {
    const name = document.getElementById(`z${z}_name`);
    if (name && !formIsLocked(name)) name.value = es(key.name(z)) || name.value;
    const en = document.querySelector(`input[name="z${z}_enabled"]`);
    if (en && !formIsLocked(en)) en.checked = isEntityOn(key.enabled(z));
    const tgt = document.querySelector(`input[name="z${z}_target"]`);
    if (tgt && !formIsLocked(tgt)) {
      const sp = toNum(ev(key.baseSetpoint(z)) ?? ev(key.setpoint(z)));
      if (Number.isFinite(sp)) tgt.value = sp.toFixed(1);
    }
    const bleMac = document.getElementById(`z${z}_ble`);
    if (bleMac && !formIsLocked(bleMac)) bleMac.value = es(key.ble(z)) || '';
    const srcState = String(es(key.tempSource(z)) || '').toLowerCase();
    const srcVal = srcState.includes('ble') ? 'ble' : 'probe';
    const srcRadio = document.querySelector(`input[name="z${z}_src"][value="${srcVal}"]`);
    if (srcRadio && !formIsLocked(srcRadio)) srcRadio.checked = true;
    const retSel = document.getElementById(`z${z}_ret`);
    if (retSel && !formIsLocked(retSel)) {
      const idx = parseProbeIndex(es(key.probe(z)));
      retSel.value = idx ? String(idx) : '';
    }
    const areaEl = document.getElementById(`z${z}_area`);
    if (areaEl && !formIsLocked(areaEl)) {
      const area = toNum(ev(key.areaM2(z)));
      if (Number.isFinite(area) && area > 0) areaEl.value = area.toFixed(1);
    }
    const spacingEl = document.getElementById(`z${z}_spacing`);
    if (spacingEl && !formIsLocked(spacingEl)) {
      const spc = toNum(ev(key.pipeSpacingMm(z)));
      if (Number.isFinite(spc) && spc > 0) spacingEl.value = String(Math.round(spc));
    }
    const pipeEl = document.getElementById(`z${z}_pipe`);
    if (pipeEl && !formIsLocked(pipeEl)) {
      const pt = es(key.pipeType(z));
      if (pt) {
        for (const opt of pipeEl.options) {
          if (opt.value === pt || opt.textContent === pt) {
            opt.selected = true;
            break;
          }
        }
      }
    }
    const phys = (getDashboardValue('zonePhysics') || {})[z];
    if (phys) {
      const slab = document.getElementById(`z${z}_slab`);
      if (slab && !formIsLocked(slab) && phys.floor?.slab_type) slab.value = phys.floor.slab_type;
      const covering = document.getElementById(`z${z}_covering`);
      if (covering && !formIsLocked(covering) && phys.floor?.covering) covering.value = phys.floor.covering;
      const thick = document.getElementById(`z${z}_thick`);
      if (thick && !formIsLocked(thick)) {
        const cm = Number(phys.floor?.active_thickness_cm);
        if (Number.isFinite(cm) && cm > 0) thick.value = cm.toFixed(1);
      }
      const mask = Number(phys.exterior_walls) || 0;
      document.querySelectorAll(`input[name="z${z}_wall"]`).forEach((cb) => {
        if (formIsLocked(cb)) return;
        const bit = cb.value === 'n' ? 1 : cb.value === 'e' ? 2 : cb.value === 's' ? 4 : 8;
        cb.checked = !!(mask & bit);
      });
      const wind = document.getElementById(`z${z}_wind`);
      if (wind && !formIsLocked(wind) && Number.isFinite(Number(phys.wind_exposure))) {
        wind.value = Number(phys.wind_exposure).toFixed(1);
      }
      const solar = document.getElementById(`z${z}_solar`);
      if (solar && !formIsLocked(solar) && Number.isFinite(Number(phys.solar_gain))) {
        solar.value = Number(phys.solar_gain).toFixed(1);
      }
    }
  }
}

function paintAll() {
  // Wait until we have real entity data (first /state or mock seed). `live`
  // alone can flip true from a revision poll before entities are applied.
  const hasEntities = ev(gkey.uptime) != null || ev(gkey.flow) != null || !!es(gkey.firmware);
  if (!hasEntities) return;
  paintStrip();
  paintDevice();
  paintTouch();
  paintLogs();
  paintSparks();
  paintFormsFromState();
  resnapCleanForms();
  // Show motor lab on non-release firmware strings.
  const fw = String(es(gkey.firmware) || '');
  const isDev = /dev|dirty|\+\d|-\d+$/i.test(fw) || fw.includes('+');
  document.querySelectorAll('[data-dev-only]').forEach((el) => {
    el.hidden = !isDev;
  });
}

function fd(data) {
  const o = {};
  for (const [k, v] of data.entries()) o[k] = v;
  return o;
}

/** Drivers must be armed for position moves and relearn; timed override alone can brown-out. */
async function ensureMotorsReady_() {
  if (!isEntityOn(gkey.drivers)) {
    await setDriversEnabled(true);
    // Let the 24 V rail / bridge wake settle before the first drive edge.
    // Enabling and slamming a timed jog in the same tick dropped WiFi (looked
    // like a device crash) on USB-powered bring-up boards.
    await sleep(400);
  }
}

/** Accept a switch value into the form dirty snapshot so Save stays clean for it. */
function acceptSwitchSnap_(input) {
  const form = input.closest && input.closest('form.panel[data-save]');
  if (!form || !form._snap) return;
  const key = `${input.name}:${input.value || 'on'}`;
  form._snap[key] = input.checked;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Config toggles persist immediately. Backup-only switches (include_learned) are skipped.
 */
async function autosaveConfigSwitch_(input) {
  const name = input && input.name;
  if (!name || name === 'include_learned') return;
  const on = !!input.checked;
  if (name === 'motor_drivers') {
    await setDriversEnabled(on);
  } else if (name === 'manual_mode') {
    await setManualMode(on);
  } else if (name === 'ble_clock_enabled') {
    await setGlobalSelect('ble_clock_sync_enabled', on ? 'on' : 'off');
  } else if (name === 'preheat_enabled') {
    await setGlobalSelect('preheat_absorb_enabled', on ? 'on' : 'off');
    await setGlobalSelect('simple_preheat_enabled', on ? 'on' : 'off');
  } else if (/^z(\d+)_enabled$/.test(name)) {
    await setEnabled(Number(RegExp.$1), on);
  } else {
    return;
  }
  acceptSwitchSnap_(input);
}

async function handleSave(detail) {
  const { key: saveKey, data } = detail || {};
  if (!saveKey) return;
  const formEl = saveFormEl(detail);
  const form = fd(data);
  const action = form.action;
  try {
    if (saveKey === 'device') {
      await setGlobalText('device_display_name', String(form.device_display_name || '').trim() || 'Lune V6');
      await setGlobalText('device_location', String(form.device_location || '').trim());
    } else if (saveKey === 'touch' || saveKey === 'connections') {
      if (action === 'revoke') await revokeTouchConnection();
      else if (action === 'approve' || action === 'retry') await approveTouchProposal();
      else if (action === 'cancel') { /* pending cancel is local UX */ }
      else if (action === 'sync') await command('ble_clock_sync_now');
      else {
        await setGlobalSelect('ble_clock_sync_enabled', form.ble_clock_enabled ? 'on' : 'off');
      }
    } else if (saveKey === 'manifold') {
      if (action === 'relearn_all') {
        await ensureMotorsReady_();
        await calibrateAllMotors();
      } else {
        await setGlobalSelect('manifold_type', form.manifold_type === 'no' ? 'normally_open' : 'normally_closed');
        if (form.probe_flow != null || form.probe_return != null) {
          await applyManifoldProbes_(form.probe_flow, form.probe_return);
        }
        await setDriversEnabled(!!form.motor_drivers);
        if (form.motor_type) {
          const profile = String(form.motor_type).toLowerCase().includes('hmip') ? 'hmip_vdmot' : 'generic';
          await setGlobalSelect('motor_profile_default', profile);
          if (form.m_runtime != null) {
            await setGlobalNumber(
              profile === 'hmip_vdmot' ? 'hmip_runtime_limit_seconds' : 'generic_runtime_limit_seconds',
              form.m_runtime,
            );
          }
        } else if (form.m_runtime != null) {
          await setGlobalNumber('hmip_runtime_limit_seconds', form.m_runtime);
        }
        if (form.m_relmov != null) await setGlobalNumber('relearn_after_movements', form.m_relmov);
        if (form.m_relh != null) await setGlobalNumber('relearn_after_hours', form.m_relh);
        if (form.m_minsamp != null) await setGlobalNumber('learned_factor_min_samples', form.m_minsamp);
        if (form.m_maxdev != null) await setGlobalNumber('learned_factor_max_deviation_pct', Number(form.m_maxdev) * 100);
      }
    } else if (saveKey === 'return_probes') {
      const mode = form.return_probe_mode === '8' ? '8' : '2';
      if (mode === '8') await applyEightProbeDefaults();
      else await applyTwoProbeLayout();
      setProbeLayoutUi(mode, { force: true });
    } else if (saveKey === 'regulation') {
      if (action === 'reset_balancing') {
        await command('reset_balancing');
      } else {
        // Checkbox absent when off — always write both absorb flags.
        await setGlobalSelect('preheat_absorb_enabled', form.preheat_enabled ? 'on' : 'off');
        await setGlobalSelect('simple_preheat_enabled', form.preheat_enabled ? 'on' : 'off');
        if (form.ph_band != null) await setGlobalNumber('preheat_absorb_band_c', parseNum(form.ph_band));
        if (form.ph_delta != null) await setGlobalNumber('preheat_detect_delta_c', parseNum(form.ph_delta));
      }
    } else if (saveKey === 'heating') {
      await setGlobalSelect('heating_mode', form.heat_mode === 'heat_pump' ? 'heat_pump' : 'normal');
      if (form.heat_min_open != null) await setGlobalNumber('min_zone_flow_pct', form.heat_min_open);
      if (form.hp_overheat != null) await setGlobalNumber('hp_overheat_margin_c', form.hp_overheat);
      if (form.hp_base != null) await setGlobalNumber('hp_base_pct', form.hp_base);
      if (form.hp_trim != null) await setGlobalNumber('hp_trim_floor_pct', form.hp_trim);
    } else if (saveKey === 'ble_clock') {
      if (action === 'sync') await command('ble_clock_sync_now');
      else {
        await setGlobalSelect('ble_clock_sync_enabled', form.ble_clock_enabled ? 'on' : 'off');
      }
    } else if (saveKey === 'firmware') {
      if (action === 'check') {
        await firmwareCheck();
        const info = await fetchLatestRelease();
        setBind('fw.latest', (info && (info.tag_name || info.name)) || '—');
      } else if (action === 'install') await firmwareInstall();
      else if (action === 'upload') {
        const fileInput = document.getElementById('ota_file');
        if (fileInput && fileInput.files && fileInput.files[0]) await uploadFirmware(fileInput.files[0]);
      }
    } else if (saveKey === 'backup') {
      if (action === 'export') {
        const envelope = await exportSettings(!!form.include_learned);
        saveSettingsBackup(envelope);
      } else if (action === 'import') {
        const fileInput = document.getElementById('backup_file');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const text = await fileInput.files[0].text();
          await importSettings(text, !!form.include_learned);
        }
      }
    } else if (saveKey === 'service') {
      if (action === 'dump_tasks') await command('dump_task_stats');
      else if (action === 'i2c_scan') await runI2cScan();
      else if (action === 'dump_ow') await command('dump_onewire');
      else if (action === 'reset_probe_map') await command('reset_probe_map');
      else if (action === 'restart') await command('restart');
      else if (action === 'logs_download') await downloadDeviceLogs();
      else if (action === 'logs_clear') setDashboardValue('deviceLog', []);
      else if (action === 'logs_pause') setDashboardValue('logsPaused', !getDashboardValue('logsPaused'));
      else if (action === 'move' || action === 'timed' || action === 'stop') {
        const zone = Number(form.man_zone) || 1;
        // Manual control must reach the device — the switch alone only gates CSS.
        await setManualMode(true);
        if (action === 'stop') {
          await stopMotor(zone);
        } else {
          await ensureMotorsReady_();
          if (action === 'move') {
            await setMotorTarget(zone, form.man_target);
          } else {
            const secs = Math.max(1, Math.min(45, Math.round(parseNum(form.man_seconds) || 10)));
            const ms = secs * 1000;
            if (form.man_dir === 'close') await closeMotorTimed(zone, ms);
            else await openMotorTimed(zone, ms);
          }
        }
      }
      else if (form.manual_mode != null) await setManualMode(!!form.manual_mode);
    } else if (/^zone\/(\d+)\/target$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      const v = form[`z${z}_target`];
      if (v != null) await setSetpoint(z, v);
    } else if (/^zone\/(\d+)\/recovery$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      await resetMotorFault(z);
    } else if (/^zone\/(\d+)\/room$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      await setEnabled(z, !!form[`z${z}_enabled`]);
      if (form[`z${z}_name`] != null) await applyZoneName(z, form[`z${z}_name`]);
      if (form[`z${z}_src`]) {
        await setZoneSelect(z, 'zone_temp_source', tempSourceSelectValue(form[`z${z}_src`]));
      }
      if (form[`z${z}_ble`] != null) await setZoneText(z, 'zone_ble_mac', form[`z${z}_ble`]);
      // Two-probe layout: zone returns stay unassigned. Do not write the HTML
      // default (Probe N) that sits in the hidden select.
      if (probeLayoutMode() === '8') {
        await setZoneSelect(z, 'zone_probe', probeSelectValue(form[`z${z}_ret`]));
      } else {
        await setZoneSelect(z, 'zone_probe', 'None');
      }
      const merge = form[`z${z}_merge`];
      if (merge) await postGroups({ primary: Number(merge), members: [z] });
      const area = parseNum(form[`z${z}_area`]);
      if (Number.isFinite(area) && area > 0) {
        // settings/number is the proven write path; physics JSON also updated
        // once handleBody captures application/json on the device.
        await setZoneNumber(z, 'zone_area_m2', area);
        await postZonePhysics(z, { area_m2: area });
      }
    } else if (/^zone\/(\d+)\/floor$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      const walls = data.getAll(`z${z}_wall`);
      let mask = 0;
      if (walls.includes('n')) mask |= 1;
      if (walls.includes('e')) mask |= 2;
      if (walls.includes('s')) mask |= 4;
      if (walls.includes('w')) mask |= 8;
      const thick = parseNum(form[`z${z}_thick`]);
      const spacing = parseNum(form[`z${z}_spacing`]);
      const physics = {
        exterior_walls: mask,
        slab_type: form[`z${z}_slab`] || 'unset',
        covering: form[`z${z}_covering`] || 'unset',
      };
      if (Number.isFinite(thick) && thick > 0) physics.active_thickness_cm = thick;
      if (Number.isFinite(spacing) && spacing > 0) physics.pipe_spacing_mm = spacing;
      const pipe = form[`z${z}_pipe`];
      if (pipe) physics.pipe_type = pipe;
      await postZonePhysics(z, physics);
      if (Number.isFinite(spacing) && spacing > 0) {
        await setZoneNumber(z, 'zone_pipe_spacing_mm', spacing);
      }
      if (pipe) await setZoneSelect(z, 'zone_pipe_type', pipe);
      // Weather exposure is store-only on V6 (Touch owns control); keep UI values.
      const wind = parseNum(form[`z${z}_wind`]);
      const solar = parseNum(form[`z${z}_solar`]);
      const forecast = { exterior_walls: mask };
      if (Number.isFinite(wind)) forecast.wind_exposure = wind;
      if (Number.isFinite(solar)) forecast.solar_gain = solar;
      await postForecastProfile(z, forecast);
      await fetchPhysicsAlerts();
    } else if (/^zone\/(\d+)\/motor$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      if (action === 'reset_fault') await resetMotorFault(z);
      if (action === 'reset_relearn') {
        await ensureMotorsReady_();
        await resetMotorAndRelearn(z);
      }
    }
    if (formEl) {
      // Unlock so paintAll can write the accepted server values, then snap those.
      delete formEl.dataset.dirty;
      delete formEl.dataset.state;
    }
    paintAll();
    if (formEl && typeof formEl.luneSaved === 'function') formEl.luneSaved(true);
  } catch (err) {
    console.error('lune:save failed', saveKey, err);
    if (formEl && typeof formEl.luneSaved === 'function') formEl.luneSaved(false, t('rt.saveFailed'));
    else addToast(t('rt.saveFailed'));
  }
}

function addToast(msg) {
  let el = document.getElementById('lune-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lune-toast';
    el.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);background:var(--inv-bg);color:var(--inv-fg);padding:10px 14px;border-radius:8px;z-index:99;font-size:13px';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ''; }, 3200);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assignBleMac(zone, mac) {
  const input = document.getElementById(`z${zone}_ble`);
  if (!input || !mac) return;
  input.value = mac;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  // Prefer BLE as temperature source when assigning a scanned sensor.
  const bleSrc = document.querySelector(`input[name="z${zone}_src"][value="ble"]`);
  if (bleSrc && !bleSrc.checked) {
    bleSrc.checked = true;
    bleSrc.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function fillBleSeen(zone, sensors, { statusText } = {}) {
  const row = document.querySelector(`[data-ble-seen-row="${zone}"]`);
  const body = document.querySelector(`tbody[data-ble-seen="${zone}"]`);
  const status = document.querySelector(`[data-ble-seen-status="${zone}"]`);
  if (!row || !body) return;

  const list = Array.isArray(sensors) ? sensors.slice() : [];
  list.sort((a, b) => (Number(b.rssi) || -999) - (Number(a.rssi) || -999));

  body.replaceChildren();
  for (const s of list) {
    const mac = String(s.mac || '').trim();
    if (!mac) continue;
    const name = String(s.name || '').trim() || 'BTHome';
    const tr = document.createElement('tr');

    const tdSensor = document.createElement('td');
    const strong = document.createElement('b');
    strong.textContent = name;
    tdSensor.appendChild(strong);
    tdSensor.appendChild(document.createElement('br'));
    const macEl = document.createElement('span');
    macEl.className = 'note';
    macEl.textContent = mac;
    tdSensor.appendChild(macEl);
    const zAssigned = Number(s.zone);
    if (Number.isFinite(zAssigned) && zAssigned >= 1) {
      tdSensor.appendChild(document.createElement('br'));
      const used = document.createElement('span');
      used.className = 'note';
      used.textContent = t('cz.bleAssigned', { z: zAssigned });
      tdSensor.appendChild(used);
    }
    tr.appendChild(tdSensor);

    const tdTemp = document.createElement('td');
    tdTemp.className = 'num';
    const temp = Number(s.temp_c);
    tdTemp.textContent = Number.isFinite(temp) ? `${num(temp, 1)} °C` : '—';
    tr.appendChild(tdTemp);

    const tdRssi = document.createElement('td');
    tdRssi.className = 'num';
    const rssi = Number(s.rssi);
    tdRssi.textContent = Number.isFinite(rssi) ? `${Math.round(rssi)}` : '—';
    tr.appendChild(tdRssi);

    const tdAct = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.dataset.action = 'ble-assign';
    btn.dataset.zone = String(zone);
    btn.dataset.mac = mac;
    btn.textContent = t('cz.bleAssign');
    tdAct.appendChild(btn);
    tr.appendChild(tdAct);

    body.appendChild(tr);
  }

  if (status) {
    if (statusText) status.textContent = statusText;
    else if (!list.length) status.textContent = t('cz.bleSeenEmpty');
    else status.textContent = t('cz.bleSeen');
    status.hidden = false;
  }

  const wrap = body.closest('.table-wrap');
  if (wrap) wrap.hidden = list.length === 0;
  row.hidden = false;
}

async function runBleScanUi(zone, btn) {
  if (!(zone >= 1 && zone <= 6)) return;
  const label = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.textContent = t('cz.bleScanning');
  }
  fillBleSeen(zone, [], { statusText: t('cz.bleScanning') });
  try {
    // Kick scan, then poll a few times so first advertisements can land.
    let best = { count: 0, sensors: [] };
    for (let i = 0; i < 4; i++) {
      if (i) await sleep(1500);
      const data = await fetchBleScan({ start: i === 0 });
      if ((data.sensors || []).length >= (best.sensors || []).length) best = data;
      fillBleSeen(zone, best.sensors || []);
      if ((best.sensors || []).length > 0 && i >= 1) break;
    }
  } catch (err) {
    console.error('BLE scan failed', err);
    fillBleSeen(zone, [], { statusText: t('cz.bleSeenEmpty') });
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.textContent = label || t('cz.scan');
    }
  }
}

function boot() {
  // Set language cookie when visiting /en/ or /da/
  const m = location.pathname.match(/^\/(en|da)\/?/);
  if (m) document.cookie = `lune_lang=${m[1]};path=/;max-age=31536000`;

  initZchartScrub();

  document.addEventListener('lune:save', (e) => {
    handleSave(e.detail);
  });

  document.addEventListener('change', (e) => {
    const layout = e.target && e.target.name === 'return_probe_mode' ? e.target.value : null;
    if (layout === '2' || layout === '8') setProbeLayoutUi(layout, { force: true });
    if (e.target && e.target.id === 'motor_type') {
      const runtime = document.querySelector('input[name="m_runtime"]');
      const hmip = isHmipMotorType(e.target);
      syncRuntimeLimits();
      if (runtime && !formIsLocked(runtime)) {
        const lim = toNum(ev(hmip ? gkey.hmipRuntimeLimitSeconds : gkey.genericRuntimeLimitSeconds));
        if (Number.isFinite(lim) && lim > 0) runtime.value = String(Math.round(lim));
        else runtime.value = hmip ? '38' : '45';
      }
    }
    // Config switches apply immediately — do not wait for panel Save.
    const sw = e.target;
    if (sw && sw.matches && sw.matches('input[type="checkbox"][role="switch"]')) {
      const prev = !sw.checked;
      autosaveConfigSwitch_(sw).catch((err) => {
        console.error('switch autosave failed', sw.name, err);
        sw.checked = prev;
        acceptSwitchSnap_(sw);
        addToast(t('rt.saveFailed'));
      });
    }
  }, true);

  document.addEventListener('click', (e) => {
    const scan = e.target.closest('[data-action="ble-scan"]');
    if (scan) {
      e.preventDefault();
      runBleScanUi(Number(scan.dataset.zone) || 0, scan);
    }
    const assign = e.target.closest('[data-action="ble-assign"]');
    if (assign) {
      e.preventDefault();
      assignBleMac(Number(assign.dataset.zone) || 0, assign.dataset.mac || '');
    }
    if (e.target.closest('[data-action="motorlab-estop"]')) {
      emergencyStopMotors();
    }
    if (e.target.closest('[data-action="copy-diag"]')) {
      e.preventDefault();
      copyDiagnostics();
    }
  });

  // Repaint when live data lands — not on a 1 Hz timer. Uptime alone gets a
  // light paint so /revision cannot resnap forms / wipe climate.
  subscribeDashboard('live', () => paintAll());
  subscribeDashboard('stateTick', () => paintAll());
  subscribeDashboard('uptimeTick', () => paintDevice());
  subscribeDashboard('deviceLog', () => paintAll());
  subscribeDashboard('i2cResult', () => paintAll());
  subscribeDashboard('zoneStateHistory', () => { paintSparks(); });

  // Scope / mode radios: debounce so CSS nav does not stampede /revision.
  let presenceT = 0;
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (!el || !el.classList || !el.classList.contains('state')) return;
    clearTimeout(presenceT);
    presenceT = setTimeout(() => refreshDashboard(), 200);
  });

  connect();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
