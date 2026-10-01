/**
 * Lune V6 LDS2 binder — live data + form saves for the static HTML shell.
 * Navigation/theme stay pure CSS; this file only paints values and posts /api/v1.
 */
import { connect } from '../dashboard-src/core/sse.js';
import {
  ev, es, isEntityOn, getDeviceLog, getDashboardValue, subscribeDashboard,
  setDashboardValue,
} from '../dashboard-src/core/store.js';
import { key, gkey } from '../dashboard-src/utils/keys.js';
import {
  setSetpoint, setEnabled, setDriversEnabled, setGlobalSelect, setGlobalNumber,
  setZoneSelect, setZoneText, applyZoneName, approveTouchProposal, revokeTouchConnection,
  setMotorTarget, command, runI2cScan, postZonePhysics, postGroups,
  exportSettings, importSettings, saveSettingsBackup, fetchLatestRelease,
  firmwareCheck, firmwareInstall, uploadFirmware, downloadDeviceLogs,
  setManualMode, emergencyStopMotors,
} from '../dashboard-src/core/api.js';

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
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits).replace('.', dec());
}

function zoneState(z) {
  const fault = String(es(key.motorLastFault(z)) || '').trim().toLowerCase();
  // Firmware uses FaultCode::NONE → "NONE". Empty / none / ok = healthy.
  if (fault && fault !== 'none' && fault !== 'ok') return 'fault';
  const zoneSt = String(es(key.state(z)) || '').trim().toLowerCase();
  if (zoneSt === 'fault') return 'fault';
  if (!isEntityOn(key.enabled(z))) return 'off';
  const valve = Number(ev(key.valve(z)));
  if (Number.isFinite(valve) && valve > 5) return 'calling';
  return 'idle';
}

function zoneLevel(z) {
  const st = zoneState(z);
  if (st === 'fault' || st === 'off') return 0;
  const valve = Number(ev(key.valve(z)));
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

function paintStrip() {
  const flow = Number(ev(gkey.flow));
  const ret = Number(ev(gkey.ret));
  const dt = Number.isFinite(flow) && Number.isFinite(ret) ? flow - ret : NaN;
  let calling = 0;
  let faults = 0;
  for (let z = 1; z <= 6; z++) {
    const st = zoneState(z);
    if (st === 'calling') calling += 1;
    if (st === 'fault') faults += 1;
    const tile = document.querySelector(`label.tile[for="s-z${z}"]`);
    if (tile) {
      tile.dataset.state = st;
      tile.dataset.level = String(zoneLevel(z));
    }
    const name = es(key.name(z)) || `Zone ${z}`;
    setBind(`z${z}.name`, name);
    setBind(`z${z}.temp`, st === 'fault' ? t('tile.fault') : `${num(ev(key.temp(z)))}°`);
    const comfort = document.querySelector(`.comfort label[for="s-z${z}"]`);
    if (comfort) {
      comfort.dataset.state = st;
      const nameEl = comfort.querySelector('.name');
      if (nameEl) nameEl.textContent = name;
      const val = comfort.querySelector('.val');
      if (val) {
        if (st === 'fault') {
          val.innerHTML = `<b class="bad">${t('state.fault')}</b>`;
        } else {
          const temp = Number(ev(key.temp(z)));
          const sp = Number(ev(key.effectiveSetpoint(z)) ?? ev(key.setpoint(z)));
          const warn = Number.isFinite(temp) && Number.isFinite(sp) && sp - temp > 0.5;
          val.innerHTML = `<b class="${warn ? 'c-warn' : ''}">${num(temp)}°</b> / ${num(sp)}°`;
        }
      }
    }
    const now = document.querySelector(`#v-dash-z${z} .climate .now`);
    if (now) now.innerHTML = `${num(ev(key.temp(z)))}<small>°C</small>`;
    const opening = Number(ev(key.valve(z)));
    setBind(`z${z}.flow`, Number.isFinite(opening) ? String(Math.round(opening)) : '—');
    setBind(`z${z}.return`, `${num(ev(gkey.ret))} <small>°C</small>`);
    const bar = document.querySelector(`#v-dash-z${z} .bar`);
    if (bar && Number.isFinite(opening)) {
      bar.style.setProperty('--v', `${Math.max(0, Math.min(100, opening))}%`);
    }
  }
  const dtLabel = Number.isFinite(dt) ? num(dt) : '—';
  setBind('strip.flow', `${num(flow)}°`);
  setBind('strip.return', `${num(ret)}°`);
  setBind('strip.dt', `${dtLabel}°`);
  setBind('manifold.flow', `${num(flow)} <small>°C</small>`);
  setBind('manifold.return', `${num(ret)} <small>°C</small>`);
  setBind('manifold.dt', `${num(dt)} <small>K</small>`);
  let totalOpen = 0;
  for (let z = 1; z <= 6; z++) {
    const v = Number(ev(key.valve(z)));
    if (Number.isFinite(v)) totalOpen += v;
  }
  const openingPct = Math.round(totalOpen / 6);
  setBind('manifold.opening', `${openingPct} <small>%</small>`);
  const mBar = document.querySelector('#v-dash-sys .bar');
  if (mBar) {
    mBar.style.setProperty('--v', `${openingPct}%`);
    mBar.setAttribute('aria-valuenow', String(openingPct));
  }
  const sub = document.querySelector('#h-dash-sys + p, #v-dash-sys .view-head p');
  if (sub) sub.textContent = t('dash.sys.sub', { zones: 6, calling, faults });
  const alert = document.querySelector('#v-dash-sys .panel.alert');
  if (alert) alert.hidden = faults === 0;
}

function paintDevice() {
  const rssi = Number(ev(gkey.wifi));
  setBind('wifi.rssi', `${Number.isFinite(rssi) ? Math.round(rssi) : '—'} <small>dBm</small>`);
  const up = Number(ev(gkey.uptime));
  const days = Number.isFinite(up) ? Math.floor(up / 86400) : '—';
  const upLabel = Number.isFinite(up)
    ? `${days} <small>${t('common.days')}</small>`
    : '—';
  setBind('sys.uptime', upLabel);
  const product = es(gkey.deviceVariant) || 'Lune V6';
  const place = t('device.sample');
  const ip = es(gkey.ip) || '—';
  const mac = es(gkey.mac) || '—';
  const fw = es(gkey.firmware) || '—';
  const esphome = getDashboardValue('esphomeVersion') || '—';
  setBind('device.about.name', product);
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
    `Name: ${es(gkey.deviceVariant) || 'Lune V6'}`,
    `Location: ${t('device.sample')}`,
    `IP: ${es(gkey.ip) || '—'}`,
    `MAC: ${es(gkey.mac) || '—'}`,
    `Firmware: ${es(gkey.firmware) || '—'}`,
    `ESPHome: ${getDashboardValue('esphomeVersion') || '—'}`,
    `Uptime_s: ${ev(gkey.uptime) ?? '—'}`,
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
  const badge = pending ? t('csys.touchApprove') : configured ? t('common.on') : t('csys.touchWaiting');
  setBind('touch.badge', badge);
  setBind('touch.status', pending
    ? `${es(gkey.authorityProposalName) || 'Lune Touch'} is ready to connect`
    : configured
      ? `Control approved · ${(es(gkey.authorityState) || '').replace(/_/g, ' ')}`
      : t('csys.touchWaitingBody'));
  setBind('touch.name', pending ? (es(gkey.authorityProposalName) || '—') : 'Lune Touch');
  setBind('touch.site', pending ? (es(gkey.authorityProposalSite) || '—') : 'Approved');
  setBind('touch.install', pending
    ? (es(gkey.authorityProposalInstallationId) || '—')
    : (es(gkey.authorityInstallationId) || '—'));
  setBind('touch.coord', pending
    ? (es(gkey.authorityProposalCoordinatorId) || '—')
    : (es(gkey.authorityCoordinatorId) || '—'));
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
  // Static demo sparklines ship in HTML; live history is applied when
  // /api/v1/history payloads are wired into store series (future polish).
}

/** True while the user is editing a save-form (focus or unsaved local change). */
function formIsLocked(el) {
  const form = el && el.closest && el.closest('form[data-save]');
  if (!form) return false;
  if (form.dataset.dirty === '1') return true;
  const ae = document.activeElement;
  if (!ae || !form.contains(ae)) return false;
  // Hold while typing/selecting; ignore submit/stepper button focus so post-save paint works.
  return ae.matches('input:not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea');
}

function markFormDirty(el) {
  const form = el && el.closest && el.closest('form[data-save]');
  if (form) form.dataset.dirty = '1';
}

function clearFormDirty(saveKey) {
  document.querySelectorAll('form[data-save]').forEach((form) => {
    if (form.dataset.save === saveKey) delete form.dataset.dirty;
  });
}

function paintFormsFromState() {
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
  const heat = es(gkey.heatingMode) || 'normal';
  const heatRadio = document.querySelector(`input[name="heat_mode"][value="${heat === 'heat_pump' ? 'heat_pump' : 'normal'}"]`);
  if (heatRadio && !formIsLocked(heatRadio)) heatRadio.checked = true;
  const ble = document.querySelector('input[name="ble_clock_enabled"]');
  if (ble && !formIsLocked(ble)) ble.checked = isEntityOn(gkey.bleClockSyncEnabled);
  for (let z = 1; z <= 6; z++) {
    const name = document.getElementById(`z${z}_name`);
    if (name && !formIsLocked(name)) name.value = es(key.name(z)) || name.value;
    const en = document.querySelector(`input[name="z${z}_enabled"]`);
    if (en && !formIsLocked(en)) en.checked = isEntityOn(key.enabled(z));
    const tgt = document.querySelector(`input[name="z${z}_target"]`);
    if (tgt && !formIsLocked(tgt)) {
      const sp = Number(ev(key.baseSetpoint(z)) ?? ev(key.setpoint(z)));
      if (Number.isFinite(sp)) tgt.value = sp.toFixed(1);
    }
    const bleMac = document.getElementById(`z${z}_ble`);
    if (bleMac && !formIsLocked(bleMac)) bleMac.value = es(key.ble(z)) || '';
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

async function handleSave(detail) {
  const { key: saveKey, data } = detail || {};
  if (!saveKey) return;
  const form = fd(data);
  const action = form.action;
  try {
    if (saveKey === 'touch') {
      if (action === 'revoke') await revokeTouchConnection();
      else await approveTouchProposal();
    } else if (saveKey === 'manifold') {
      await setGlobalSelect('manifold_type', form.manifold_type === 'no' ? 'normally_open' : 'normally_closed');
      if (form.probe_flow) await setGlobalSelect('manifold_flow_probe', `probe_${form.probe_flow}`);
      if (form.probe_return) await setGlobalSelect('manifold_return_probe', `probe_${form.probe_return}`);
      await setDriversEnabled(!!form.motor_drivers);
      if (form.motor_type) {
        const profile = String(form.motor_type).toLowerCase().includes('hmip') ? 'hmip_vdmot' : 'generic';
        await setGlobalSelect('motor_profile_default', profile);
      }
      if (form.m_runtime != null) await setGlobalNumber('generic_runtime_limit_seconds', form.m_runtime);
      if (form.m_relmov != null) await setGlobalNumber('relearn_after_movements', form.m_relmov);
      if (form.m_relh != null) await setGlobalNumber('relearn_after_hours', form.m_relh);
      if (form.m_minsamp != null) await setGlobalNumber('learned_factor_min_samples', form.m_minsamp);
      if (form.m_maxdev != null) await setGlobalNumber('learned_factor_max_deviation_pct', Number(form.m_maxdev) * 100);
    } else if (saveKey === 'regulation') {
      if (action === 'reset_balancing') {
        await command('reset_balancing');
      } else {
        if (form.preheat_enabled != null) {
          await setGlobalSelect('simple_preheat_enabled', form.preheat_enabled ? 'on' : 'off');
        }
        // Adaptive balancing numbers go through settings/number when present.
        if (form.ph_band != null) await setGlobalNumber('preheat_absorb_band_c', form.ph_band);
        if (form.ph_delta != null) await setGlobalNumber('preheat_detect_delta_c', form.ph_delta);
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
        if (form.ble_clock_interval != null) {
          await setGlobalNumber('ble_clock_sync_interval_min', Math.max(1, Math.round(Number(form.ble_clock_interval) / 60)));
        }
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
      else if (action === 'move') await setMotorTarget(Number(form.man_zone) || 1, form.man_target);
      else if (action === 'stop') await command('stop_motor', Number(form.man_zone) || 1);
      else if (form.manual_mode != null) await setManualMode(!!form.manual_mode);
    } else if (/^zone\/(\d+)\/target$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      const v = form[`z${z}_target`];
      if (v != null) await setSetpoint(z, v);
    } else if (/^zone\/(\d+)\/recovery$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      await command('clear_motor_fault', z);
    } else if (/^zone\/(\d+)\/room$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      await setEnabled(z, !!form[`z${z}_enabled`]);
      if (form[`z${z}_name`] != null) await applyZoneName(z, form[`z${z}_name`]);
      if (form[`z${z}_src`]) await setZoneSelect(z, 'zone_temp_source', form[`z${z}_src`]);
      if (form[`z${z}_ble`] != null) await setZoneText(z, 'zone_ble_mac', form[`z${z}_ble`]);
      if (form[`z${z}_ret`]) await setZoneSelect(z, 'zone_probe', `probe_${form[`z${z}_ret`]}`);
      const merge = form[`z${z}_merge`];
      if (merge) await postGroups({ primary: Number(merge), members: [z] });
      const area = Number(form[`z${z}_area`]);
      if (Number.isFinite(area) && area > 0) {
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
      const thick = Number(form[`z${z}_thick`]);
      await postZonePhysics(z, {
        exterior_walls_mask: mask,
        slab: form[`z${z}_slab`] || 'unset',
        covering: form[`z${z}_covering`] || 'unset',
        active_thickness_cm: Number.isFinite(thick) && thick > 0 ? thick : null,
        area_m2: Number(form[`z${z}_area`]) || undefined,
      });
    } else if (/^zone\/(\d+)\/motor$/.test(saveKey)) {
      const z = Number(RegExp.$1);
      if (action === 'reset_fault') await command('clear_motor_fault', z);
      if (action === 'reset_relearn') await command('reset_motor_learning', z);
    }
    clearFormDirty(saveKey);
    paintAll();
  } catch (err) {
    console.error('lune:save failed', saveKey, err);
    addToast(t('rt.saveFailed'));
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

function boot() {
  // Set language cookie when visiting /en/ or /da/
  const m = location.pathname.match(/^\/(en|da)\/?/);
  if (m) document.cookie = `lune_lang=${m[1]};path=/;max-age=31536000`;

  document.addEventListener('lune:save', (e) => {
    handleSave(e.detail);
  });

  // Stepper +/- dispatches change; typing fires input. Hold the form until save.
  document.addEventListener('input', (e) => markFormDirty(e.target), true);
  document.addEventListener('change', (e) => markFormDirty(e.target), true);

  document.addEventListener('click', (e) => {
    const scan = e.target.closest('[data-action="ble-scan"]');
    if (scan) {
      e.preventDefault();
      command('ble_scan', Number(scan.dataset.zone) || undefined);
    }
    if (e.target.closest('[data-action="motorlab-estop"]')) {
      emergencyStopMotors();
    }
    if (e.target.closest('[data-action="copy-diag"]')) {
      e.preventDefault();
      copyDiagnostics();
    }
  });

  // Repaint when live flips and on a steady tick once entities exist.
  // paintFormsFromState skips dirty/focused forms so the 1s tick cannot wipe edits.
  subscribeDashboard('live', () => paintAll());
  subscribeDashboard('deviceLog', () => paintAll());
  subscribeDashboard('i2cResult', () => paintAll());
  setInterval(paintAll, 1000);

  connect();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
