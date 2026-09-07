// core/api.js

import { beginPendingWrite, endPendingWrite, setEntity, es, ev, setI2cResult, setLive, addActivity, setDashboardValue, setZoneStateHistory, appendDeviceLog, getDeviceLogSeq, getDeviceLog } from './store.js';
import { handleMockPost, mockLatestRelease, mockSettingsExport, mockSettingsImport, mockDiagnosticsSnapshot, mockMotorTraceCsv } from './mock.js';
import { saveBlob, saveText, stampedName } from '../utils/download.js';
import { key, gkey } from '../utils/keys.js';

export const BASE = '/api/hv6/v1';

// Firmware releases are published on GitHub. The browser asks GitHub directly
// (on Settings open and on the explicit Check button) so the device never
// needs outbound internet for the version comparison itself.
export const RELEASE_LATEST_API = 'https://api.github.com/repos/birkemosen/lune/releases/latest';
export const RELEASE_DOWNLOAD_BASE = 'https://github.com/birkemosen/lune/releases/latest/download/';

// ESPHome's web_server OTA handler accepts a multipart POST on /update and
// reboots the node once the image has been flashed.
export const OTA_UPLOAD_PATH = '/update';

// Backup files carry this marker so a foreign JSON file is rejected in the
// browser instead of reaching the device.
export const SETTINGS_BACKUP_TYPE = 'lune-v6-settings';

function isMock() {
  return !!(window.LV6_DASHBOARD_CONFIG && window.LV6_DASHBOARD_CONFIG.mock);
}

function queryUrl(path, params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null) qs.append(k, v);
  }
  const query = qs.toString();
  return BASE + path + (query ? '?' + query : '');
}

// POST to a /api/hv6/v1 write endpoint. ESPHome's ESP-IDF server consumes
// URL-encoded form bodies; query params remain as a compatibility fallback.
// mockBody carries the legacy {key, value, zone?} action shape consumed by core/mock.js.
function postV1(path, params, mockBody) {
  beginPendingWrite();

  if (isMock()) {
    try {
      handleMockPost(mockBody);
      return Promise.resolve({ ok: true });
    } finally {
      endPendingWrite();
    }
  }

  let localKey = sessionStorage.getItem('hv6_local_access_key') || '';
  const body = new URLSearchParams();
  for (const [name, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null) body.append(name, String(value));
  }
  const send = (accessKey) => fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'X-Lune-Local-Key': accessKey, 'X-Lune-CSRF': accessKey,
      'Idempotency-Key': crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) },
    body: body.toString(),
  });
  return send(localKey).then(async resp => {
    // Reads stay prompt-free. Ask only after an explicit write is rejected
    // because the local access key is not provisioned in this browser.
    if (resp.status === 403 && !localKey) {
      const entered = window.prompt('Enter the Lune commissioning key to change local settings') || '';
      if (entered) {
        sessionStorage.setItem('hv6_local_access_key', entered);
        localKey = entered;
        resp = await send(localKey);
      }
    }
    if (!resp.ok && [400, 404, 415].includes(resp.status)) {
      return fetch(queryUrl(path, params), { method: 'POST' });
    }
    if (!resp.ok) {
      console.warn(`API call failed: POST ${path} status=${resp.status}`);
    }
    return resp;
  }).catch(err => {
    console.error(`API call error: POST ${path}:`, err);
    throw err;
  }).finally(() => {
    endPendingWrite();
  });
}

function localAccessKey() {
  return sessionStorage.getItem('hv6_local_access_key') || '';
}

// POST a JSON document to a /api/hv6/v1 write endpoint. Only the settings
// restore path uses this: a backup envelope is a nested document that does not
// fit the flat form-urlencoded shape every other write endpoint uses. The
// device reads the raw body from request->arg("plain").
function postJsonV1(path, payload, params) {
  beginPendingWrite();
  const accessKey = localAccessKey();
  return fetch(queryUrl(path, params), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Lune-Local-Key': accessKey,
      'X-Lune-CSRF': accessKey,
      'Idempotency-Key': crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    },
    body: JSON.stringify(payload),
  }).finally(() => {
    endPendingWrite();
  });
}

export function setSetpoint(zone, value) {
  // Zone detail paints Applied Target from effectiveSetpoint (falling back to
  // setpoint). Keep all three in lockstep so +/- feels immediate and a state
  // poll cannot leave the UI on a stale effective value.
  const next = Number(value);
  setEntity(key.setpoint(zone), { value: next });
  setEntity(key.baseSetpoint(zone), { value: next });
  const offset = Number(ev(key.coordinatorOffset(zone)));
  const effective = Number.isFinite(offset) ? next + offset : next;
  setEntity(key.effectiveSetpoint(zone), { value: effective });
  return postV1(`/zones/${zone}/setpoint`, { setpoint_c: next }, { key: 'zone_setpoint', value: next, zone });
}

export function setEnabled(zone, enabled) {
  setEntity(key.enabled(zone), { state: enabled ? 'on' : 'off', value: enabled });
  return postV1(`/zones/${zone}/enabled`, { enabled: !!enabled }, { key: 'zone_enabled', value: enabled ? 1 : 0, zone });
}

export function setDriversEnabled(enabled) {
  setEntity(gkey.drivers, { state: enabled ? 'on' : 'off', value: enabled });
  return postV1('/drivers/enabled', { enabled: !!enabled }, { key: 'drivers_enabled', value: enabled ? 1 : 0 });
}

export function command(name, zone) {
  return postV1('/commands', { command: name, zone: zone || undefined }, { key: 'command', value: name, zone: zone || undefined });
}

export function runI2cScan() {
  setI2cResult('Scanning I2C bus...');
  addActivity('I2C scan started');
  return command('i2c_scan');
}

const zoneSelectMap = {
  zone_probe: (zone) => key.probe(zone),
  zone_temp_source: (zone) => key.tempSource(zone),
  zone_sync_to: (zone) => key.syncTo(zone)
};

const zoneTextMap = {
  zone_ble_mac: (zone) => key.ble(zone),
  zone_name: (zone) => key.name(zone)
};

const globalSelectMap = {
  manifold_type: gkey.manifoldType,
  manifold_flow_probe: gkey.manifoldFlowProbe,
  manifold_return_probe: gkey.manifoldReturnProbe,
  motor_profile_default: gkey.motorProfileDefault,
  simple_preheat_enabled: gkey.simplePreheatEnabled,
  ble_clock_sync_enabled: gkey.bleClockSyncEnabled
};

const globalNumberMap = {
  close_threshold_multiplier: gkey.closeThresholdMultiplier,
  close_slope_threshold: gkey.closeSlopeThreshold,
  close_slope_current_factor: gkey.closeSlopeCurrentFactor,
  open_threshold_multiplier: gkey.openThresholdMultiplier,
  open_slope_threshold: gkey.openSlopeThreshold,
  open_slope_current_factor: gkey.openSlopeCurrentFactor,
  open_ripple_limit_factor: gkey.openRippleLimitFactor,
  generic_runtime_limit_seconds: gkey.genericRuntimeLimitSeconds,
  hmip_runtime_limit_seconds: gkey.hmipRuntimeLimitSeconds,
  relearn_after_movements: gkey.relearnAfterMovements,
  relearn_after_hours: gkey.relearnAfterHours,
  learned_factor_min_samples: gkey.learnedFactorMinSamples,
  learned_factor_max_deviation_pct: gkey.learnedFactorMaxDeviationPct,
  ble_clock_sync_interval_min: gkey.bleClockSyncIntervalMin,
};

export function setZoneSelect(zone, settingKey, value) {
  const idBuilder = zoneSelectMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return postV1('/settings/select', { key: settingKey, value, zone }, { key: settingKey, value, zone });
}

export function setZoneText(zone, settingKey, value) {
  const idBuilder = zoneTextMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return postV1('/settings/text', { key: settingKey, value, zone }, { key: settingKey, value, zone });
}

export function setGlobalSelect(settingKey, value) {
  const id = globalSelectMap[settingKey];
  if (id) setEntity(id, { state: value });
  return postV1('/settings/select', { key: settingKey, value }, { key: settingKey, value });
}

export function setGlobalNumber(settingKey, value) {
  const numeric = Number(value);
  const id = globalNumberMap[settingKey];
  if (id && !Number.isNaN(numeric)) setEntity(id, { value: numeric });
  return postV1('/settings/number', { key: settingKey, value: numeric }, { key: settingKey, value: numeric });
}

export function setGlobalText(settingKey, value) {
  return postV1('/settings/text', { key: settingKey, value }, { key: settingKey, value });
}

export function approveTouchProposal() {
  return postV1('/authority/approve-proposal', {}, { key: 'authority_approve_proposal' })
    .then(async (response) => {
      if (!response?.ok) throw new Error('V6 could not approve the discovered Lune Touch.');
      const payload = typeof response.json === 'function' ? await response.json() : { data: {
        installation_id: es(gkey.authorityProposalInstallationId) || 'lune-mock',
        coordinator_id: es(gkey.authorityProposalCoordinatorId) || 'touch-mock',
        local_access_key: 'mock-local-access-key',
      } };
      const data = payload?.data || {};
      if (data.local_access_key) sessionStorage.setItem('hv6_local_access_key', data.local_access_key);
      if (data.installation_id) setEntity(gkey.authorityInstallationId, { state: data.installation_id });
      if (data.coordinator_id) setEntity(gkey.authorityCoordinatorId, { state: data.coordinator_id });
      setEntity(gkey.authorityConfigured, { state: 'on', value: true });
      setEntity(gkey.authorityProposalPending, { state: 'off', value: false });
      return payload;
    });
}

export function revokeTouchConnection() {
  return postV1('/authority/revoke', {}, { key: 'authority_revoke' }).then((response) => {
    if (!response?.ok) throw new Error('V6 could not disconnect Lune Touch.');
    sessionStorage.removeItem('hv6_local_access_key');
    setEntity(gkey.authorityInstallationId, { state: '' });
    setEntity(gkey.authorityCoordinatorId, { state: '' });
    setEntity(gkey.authorityConfigured, { state: 'off', value: false });
    return response;
  });
}

export function applyZoneName(zone, value) {
  const name = String(value || '').trim();
  addActivity('Zone ' + zone + ' renamed to ' + (name || '(blank)'), zone);
  // Persist device-side; the optimistic setEntity in setZoneText feeds the
  // text-zone_<n>_name bridge in store.js, which updates D.zoneNames.
  return setZoneText(zone, 'zone_name', name);
}

export function markConnected() {
  setLive(true);
}

// Motor control helpers
export function setMotorTarget(zone, targetPct) {
  const numeric = Number(targetPct);
  const clamped = Number.isNaN(numeric) ? 0 : Math.max(0, Math.min(100, Math.round(numeric)));
  setEntity(key.motorTarget(zone), { value: clamped });
  addActivity('Motor ' + zone + ' target set to ' + clamped + '%', zone);
  return postV1(`/motors/${zone}/target`, { value: clamped }, { key: 'motor_target', value: clamped, zone });
}

export function openMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' open for ' + durationMs + 'ms', zone);
  return postV1(`/motors/${zone}/open_timed`, {}, { key: 'command', value: 'open_motor_timed', zone });
}

export function closeMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' close for ' + durationMs + 'ms', zone);
  return postV1(`/motors/${zone}/close_timed`, {}, { key: 'command', value: 'close_motor_timed', zone });
}

export function stopMotor(zone) {
  addActivity('Motor ' + zone + ' stopped', zone);
  return postV1(`/motors/${zone}/stop`, {}, { key: 'command', value: 'stop_motor', zone });
}

export function emergencyStopMotors() {
  addActivity('Emergency stop — all motors halted');
  const stops = [];
  for (let zone = 1; zone <= 6; zone++) {
    stops.push(postV1(`/motors/${zone}/stop`, {}, { key: 'command', value: 'stop_motor', zone }));
  }
  return Promise.all(stops).then((results) => setDriversEnabled(false).then(() => results));
}

export async function fetchDiagnostics() {
  if (isMock()) return mockDiagnosticsSnapshot();
  const response = await fetch(BASE + '/diagnostics', { cache: 'no-store' });
  if (!response.ok) throw new Error('Diagnostics fetch failed: ' + response.status);
  return response.json();
}

export async function fetchMotorTraceCsv() {
  if (isMock()) return mockMotorTraceCsv();
  const response = await fetch(BASE + '/motor-trace.csv', { cache: 'no-store' });
  if (response.status === 409) {
    const err = new Error('motor_busy');
    err.code = 'motor_busy';
    throw err;
  }
  if (!response.ok) throw new Error('Motor trace fetch failed: ' + response.status);
  return response.text();
}

export function setManualMode(enabled) {
  setDashboardValue('manualMode', !!enabled);
  addActivity(enabled ? 'Manual mode enabled — automatic management paused' : 'Manual mode disabled — automatic management resumed');
  return postV1('/manual_mode', { enabled: !!enabled }, { key: 'manual_mode', value: enabled ? 1 : 0 });
}

// Recovery/reset helpers
export function resetMotorFault(zone) {
  addActivity('Motor ' + zone + ' fault reset', zone);
  return command('motor_reset_fault', zone);
}

export function resetMotorLearnedFactors(zone) {
  addActivity('Motor ' + zone + ' learned factors reset', zone);
  return command('motor_reset_learned_factors', zone);
}

export function resetMotorAndRelearn(zone) {
  addActivity('Motor ' + zone + ' reset and relearn started', zone);
  return command('motor_reset_and_relearn', zone);
}

export function dumpTaskStats() {
  addActivity('Task stats dumped to device log');
  return command('dump_task_stats');
}

export function fetchHistory() {
  if (isMock()) return;
  fetch(BASE + '/history', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) setZoneStateHistory(data); })
    .catch(() => { /* history fetch errors are non-fatal */ });
}

// ---- firmware updates ----

export function firmwareCheck() {
  return command('firmware_check');
}

// Device-pulled update: V6 downloads the release asset itself, stops the
// valves and reboots into the new image.
export function firmwareInstall() {
  addActivity('Firmware install requested');
  return command('firmware_install');
}

// Quiesce motors and free RAM before a browser-pushed image lands on /update.
export function firmwarePrepare() {
  return command('firmware_prepare');
}

// Conventional asset name for a release tag, used when a release carries no
// asset metadata or when only the device reported the newer version.
export function releaseAssetFor(tag) {
  const name = 'lune-v6-' + (tag || 'latest') + '.ota.bin';
  return { name, url: RELEASE_DOWNLOAD_BASE + name };
}

// Pick the flashable asset from a GitHub release, preferring the Lune V6
// `.ota.bin`.
function pickReleaseAsset(assets, tag) {
  const list = Array.isArray(assets) ? assets : [];
  const named = (pattern) => list.find((asset) => pattern.test(String(asset && asset.name || '')));
  const asset = named(/^lune-v6.*\.ota\.bin$/i) || named(/\.ota\.bin$/i) || named(/\.bin$/i);
  if (asset && asset.browser_download_url) {
    return { name: String(asset.name), url: String(asset.browser_download_url) };
  }
  return releaseAssetFor(tag);
}

export class ReleaseCheckError extends Error {
  constructor(code, status, message) {
    super(message || code);
    this.name = 'ReleaseCheckError';
    this.code = code;
    this.status = status || 0;
  }
}

// Read the newest published release. Called on Settings open and from the
// Check button only — never from the 3 s state poll — to stay far inside
// GitHub's unauthenticated rate limit.
//
// GitHub returns 404 for /releases/latest when the repo has no published
// (non-draft) release yet — that is not a network failure.
export async function fetchLatestRelease() {
  if (isMock()) {
    const payload = mockLatestRelease();
    const tag = String(payload && payload.tag_name || '');
    return {
      tag,
      notes: String(payload && payload.body || ''),
      publishedAt: String(payload && payload.published_at || ''),
      asset: pickReleaseAsset(payload && payload.assets, tag),
    };
  }

  let response;
  try {
    response = await fetch(RELEASE_LATEST_API, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json' },
    });
  } catch (err) {
    throw new ReleaseCheckError('network', 0, err && err.message ? err.message : 'network');
  }

  if (response.status === 404) {
    throw new ReleaseCheckError('no_releases', 404, 'No published GitHub release');
  }
  if (!response.ok) {
    throw new ReleaseCheckError('http', response.status, 'Release check failed: ' + response.status);
  }

  const payload = await response.json();
  const tag = String(payload && payload.tag_name || '');
  if (!tag) {
    throw new ReleaseCheckError('no_releases', 404, 'No published GitHub release');
  }
  return {
    tag,
    notes: String(payload && payload.body || ''),
    publishedAt: String(payload && payload.published_at || ''),
    asset: pickReleaseAsset(payload && payload.assets, tag),
  };
}

// Push a local .bin to ESPHome's web_server OTA endpoint. `update` is the
// multipart field name used by the stock ESPHome upload form.
export function uploadFirmware(file, onProgress) {
  if (isMock()) {
    return new Promise((resolve) => {
      let pct = 0;
      const step = setInterval(() => {
        pct = Math.min(100, pct + 20);
        if (onProgress) onProgress(pct);
        if (pct >= 100) {
          clearInterval(step);
          addActivity('Firmware image uploaded (mock)');
          resolve('Update Successful!');
        }
      }, 220);
    });
  }

  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('update', file, file.name);
    const request = new XMLHttpRequest();
    request.open('POST', OTA_UPLOAD_PATH);
    const accessKey = localAccessKey();
    if (accessKey) {
      request.setRequestHeader('X-Lune-Local-Key', accessKey);
      request.setRequestHeader('X-Lune-CSRF', accessKey);
    }
    request.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    request.onload = () => {
      const text = String(request.responseText || '');
      if (request.status >= 200 && request.status < 300 && !/fail/i.test(text)) {
        resolve(text);
        return;
      }
      reject(new Error('OTA upload rejected: ' + request.status + ' ' + text));
    };
    request.onerror = () => reject(new Error('OTA upload connection lost'));
    request.send(body);
  });
}

// ---- settings backup and restore ----

// Accepts both the bare backup envelope and the v1 {ok, data} response wrapper.
function unwrapBackup(payload) {
  if (payload && payload._type) return payload;
  if (payload && payload.data && payload.data._type) return payload.data;
  return payload && payload.data ? payload.data : payload;
}

export async function exportSettings(includeLearned = true) {
  if (isMock()) return unwrapBackup(mockSettingsExport(includeLearned));
  const response = await fetch(queryUrl('/settings/export', { include_learned: includeLearned ? 1 : 0 }), {
    cache: 'no-store',
    headers: { 'X-Lune-Local-Key': localAccessKey() },
  });
  if (!response.ok) throw new Error('Settings export failed: ' + response.status);
  return unwrapBackup(await response.json());
}

export function isSettingsBackup(payload) {
  const envelope = unwrapBackup(payload);
  return !!(envelope && envelope._type === SETTINGS_BACKUP_TYPE);
}

// Restore a backup file. `restore_learned` travels both in the JSON body and as
// a query parameter so the device can read it from whichever it parses first.
export async function importSettings(jsonText, restoreLearned = true) {
  const parsed = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
  const envelope = unwrapBackup(parsed);
  if (!isSettingsBackup(envelope)) {
    throw new Error('not_a_lune_backup');
  }

  if (isMock()) return mockSettingsImport(envelope, restoreLearned);

  const response = await postJsonV1(
    '/settings/import',
    Object.assign({}, envelope, { restore_learned: !!restoreLearned }),
    { restore_learned: restoreLearned ? 1 : 0 }
  );
  if (!response.ok) throw new Error('Settings restore failed: ' + response.status);
  const payload = await response.json().catch(() => ({}));
  const data = payload && payload.data ? payload.data : payload || {};
  addActivity('Settings restored from backup');
  return {
    applied: Number(data.applied || 0),
    skipped: Number(data.skipped || 0),
    ignored: Number(data.ignored || 0),
  };
}

export function saveSettingsBackup(envelope) {
  const filename = stampedName('lune-v6-settings', 'json');
  saveText(filename, JSON.stringify(envelope, null, 2), 'application/json');
  return filename;
}

// ---- device log export ----

function localLogText() {
  const levels = { 1: 'ERROR', 2: 'WARN', 3: 'INFO', 4: 'CONFIG', 5: 'DEBUG', 6: 'VERBOSE', 7: 'VERY_VERBOSE' };
  return getDeviceLog()
    .map((line) => '[' + (levels[line.level] || '?') + '] ' + (line.tag || '') + ': ' + (line.msg || ''))
    .join('\n');
}

// Save the device-side log ring as a text file. In mock mode the in-browser
// buffer is exported instead so the button behaves the same offline.
export async function downloadDeviceLogs() {
  const filename = stampedName('lune-v6-logs', 'txt');
  if (isMock()) {
    saveText(filename, localLogText() || 'No log lines buffered.');
    return filename;
  }
  const response = await fetch(BASE + '/logs/download', { cache: 'no-store' });
  if (!response.ok) throw new Error('Log download failed: ' + response.status);
  saveBlob(filename, await response.blob());
  return filename;
}

// Live device logs: only request lines newer than the last seq we've stored.
export function fetchLogs() {
  if (isMock()) return;
  const since = getDeviceLogSeq();
  fetch(BASE + '/logs?since=' + since, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) appendDeviceLog(data.lines, data.next_seq); })
    .catch(() => { /* log fetch errors are non-fatal */ });
}
