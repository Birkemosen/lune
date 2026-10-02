const STORAGE_KEY = 'lv6_available_probes';
const listeners = new Set();

export const PROBES_FLOW_RETURN = 2;
export const PROBES_RETURN_TEMP = 8;

function clampCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return PROBES_FLOW_RETURN;
  // Only the two supported inventory sizes.
  return n >= PROBES_RETURN_TEMP ? PROBES_RETURN_TEMP : PROBES_FLOW_RETURN;
}

export function probesForReturnTemp(enabled) {
  return enabled ? PROBES_RETURN_TEMP : PROBES_FLOW_RETURN;
}

export function getAvailableProbes() {
  try {
    return clampCount(localStorage.getItem(STORAGE_KEY) || PROBES_FLOW_RETURN);
  } catch {
    return PROBES_FLOW_RETURN;
  }
}

export function setAvailableProbes(value) {
  const next = clampCount(value);
  let prev = PROBES_FLOW_RETURN;
  try {
    prev = clampCount(localStorage.getItem(STORAGE_KEY) || PROBES_FLOW_RETURN);
  } catch {
    prev = PROBES_FLOW_RETURN;
  }
  if (next === prev) return next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Ignore localStorage failures in constrained/mock environments.
  }
  for (const fn of listeners) fn(next);
  return next;
}

export function setReturnTempProbes(enabled) {
  return setAvailableProbes(probesForReturnTemp(enabled));
}

export function subscribeAvailableProbes(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function parseProbeIndex(state) {
  const match = String(state || '').match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/** Format live °C for a probe option label. */
export function formatProbeOptionLabel(probe, tempC) {
  const base = `Probe ${probe}`;
  if (tempC == null || Number.isNaN(Number(tempC))) return base;
  return `${base} · ${(Math.round(Number(tempC) * 10) / 10).toFixed(1)}°`;
}

/**
 * @param {{ includeNone?: boolean, count?: number, temps?: Record<number, number|null> }} opts
 */
export function probeSelectOptionsHtml({ includeNone = false, count = getAvailableProbes(), temps = null } = {}) {
  const n = clampCount(count);
  let html = includeNone ? '<option value="None" data-i18n="common.none">None</option>' : '';
  for (let probe = 1; probe <= n; probe++) {
    const temp = temps ? temps[probe] : null;
    const label = formatProbeOptionLabel(probe, temp);
    html += `<option value="Probe ${probe}">${label}</option>`;
  }
  return html;
}

export function clampProbeState(state, count = getAvailableProbes(), fallback = null) {
  const n = clampCount(count);
  const match = String(state || '').match(/(\d+)/);
  if (!match) return fallback || state;
  const idx = Number(match[1]);
  if (idx >= 1 && idx <= n) return `Probe ${idx}`;
  return fallback || `Probe ${n}`;
}

/**
 * Collect every probe role currently claimed. Keys are 1-based probe numbers;
 * values are short role labels for conflict messages.
 */
export function collectProbeRoles({ flow, return: ret, zoneProbes }) {
  const roles = Object.create(null);
  const flowIdx = parseProbeIndex(flow);
  const retIdx = parseProbeIndex(ret);
  if (flowIdx) roles[flowIdx] = 'flow';
  if (retIdx) {
    roles[retIdx] = roles[retIdx] ? 'flow+return' : 'return';
  }
  for (let zone = 1; zone <= 6; zone++) {
    const idx = parseProbeIndex(zoneProbes && zoneProbes[zone]);
    if (!idx) continue;
    roles[idx] = roles[idx] ? `${roles[idx]}+Z${zone}` : `Z${zone}`;
  }
  return roles;
}

/** True when assigning `probeState` would collide with another role (excluding self). */
export function probeWouldConflict(probeState, roles, selfRole) {
  const idx = parseProbeIndex(probeState);
  if (!idx) return false;
  const owner = roles[idx];
  if (!owner) return false;
  if (!selfRole) return true;
  // Allow keeping the same assignment (owner matches self).
  return owner !== selfRole && !String(owner).split('+').includes(selfRole);
}
