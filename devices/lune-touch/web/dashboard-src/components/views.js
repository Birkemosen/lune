import { api, refreshAll, refreshSection } from '../core/api.js';
import { patch, state } from '../core/store.js';

const runAction = (action) => {
  patch({ error: '' });
  Promise.resolve()
    .then(action)
    .catch((error) => patch({ error: error.message || String(error) }));
};

const fmtC = (value) => value == null || Number.isNaN(value) ? '--.- C' : `${Number(value).toFixed(1)} C`;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const v6Name = (index) => `V6-${String.fromCharCode(65 + Number(index || 0))}`;
const nodeLabel = (index) => {
  const node = state.nodes[Number(index || 0)];
  return node?.name || node?.id || v6Name(index);
};
const fmtCommandExpiry = (command) => {
  if (!command?.expires_at_ms) return '-';
  if (command.result === 'expired') return 'expired';
  if (command.result !== 'pending') return 'done';
  const remaining = Math.max(0, Number(command.expires_at_ms) - Date.now());
  const minutes = Math.ceil(remaining / 60000);
  return minutes > 0 ? `${minutes} min` : 'now';
};
const fmtUptime = (ms) => {
  const totalSeconds = Math.floor(Number(ms || 0) / 1000);
  if (!totalSeconds) return 'never';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
};
const fmtAge = (seconds) => {
  const total = Math.floor(Number(seconds || 0));
  if (!total) return 'never';
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};
const fmtValue = (value, suffix = '') => value == null || Number.isNaN(Number(value)) ? '-' : `${Number(value).toFixed(1)}${suffix}`;
const fmtLearning = (history = {}) => {
  const samples = Number(history.samples || 0);
  return samples ? `${samples} samples / delta ${fmtValue(history.last_delta_c_per_h, ' C/h')}` : '0 samples';
};
const fmtThermal = (model = {}) => {
  const samples = Number(model.samples || 0);
  if (!samples) return 'thermal not learned';
  return `heat ${fmtValue(model.heat_gain_c_per_h, ' C/h')} / cool ${fmtValue(model.cool_loss_c_per_h, ' C/h')} / ${Math.round(Number(model.confidence || 0) * 100)}%`;
};
const fmtComfortIntent = (comfort = {}, fallback) => {
  const effective = comfort.effective_setpoint_c ?? comfort.setpoint_c ?? fallback;
  const bias = Number(comfort.bias_c || 0);
  const suffix = Math.abs(bias) > 0.05 ? ` (${bias > 0 ? '+' : ''}${bias.toFixed(1)})` : '';
  const source = comfort.effective_source === 'schedule' ? 'schedule' : 'comfort';
  return `${fmtC(effective)}${suffix} / P${comfort.priority ?? 1} / ${source}`;
};
const fmtTrust = (node = {}) => node.trust_label || (Number(node.trust) === 2 ? 'trusted' : Number(node.trust) === 1 ? 'paired' : 'unpaired');
const fmtNextAction = (action) => ({
  add_node: 'Add manifold',
  fix_node_poll: 'Fix manifold connection',
  verify_node_identity: 'Verify manifold',
  trust_node: 'Trust manifold',
  map_zones: 'Map zones',
  wait_for_fresh_zone_poll: 'Wait for zone data',
  set_forecast_location: 'Set weather location',
  ready: 'Ready',
}[action] || action || 'unknown');
const commissioningTarget = (action) => ({
  add_node: ['manifolds', 'Open manifolds'],
  verify_node_identity: ['manifolds', 'Open manifolds'],
  trust_node: ['manifolds', 'Open manifolds'],
  fix_node_poll: ['manifolds', 'Open manifolds'],
  map_zones: ['manifolds', 'Open manifolds'],
  wait_for_fresh_zone_poll: ['diagnostics', 'Open diagnostics'],
  set_forecast_location: ['weather', 'Open weather'],
}[action] || ['diagnostics', 'Open diagnostics']);
const commissioningActionButton = (action) => {
  if (!action || action === 'ready') return '<button class="btn slim" data-section="diagnostics">Open diagnostics</button>';
  const [section, label] = commissioningTarget(action);
  return `<button class="btn slim" data-section="${section}">${label}</button>`;
};
const fmtEventSource = (source) => source === 'commissioning' ? 'setup' : (source || 'touch');
const fmtClock = (minutes) => {
  const value = Math.max(0, Math.min(1440, Number(minutes || 0)));
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};
const parseClock = (value, fallback) => {
  const [hour, minute] = String(value || '').split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return fallback;
  return Math.max(0, Math.min(1440, hour * 60 + minute));
};
const fmtSchedule = (schedule = {}) => schedule.enabled ? `${fmtClock(schedule.start_min)}-${fmtClock(schedule.end_min)} / ${fmtC(schedule.setpoint_c)}` : 'off';
const fmtResolver = (resolver = {}) => {
  const source = resolver.command_source || 'none';
  const offset = Number(resolver.command_offset_c || 0);
  const learned = Number(resolver.learned_offset_c || 0);
  const target = resolver.target_setpoint_c;
  const parts = [];
  if (source !== 'none' && Math.abs(offset) >= 0.01) {
    parts.push(`${source} ${offset > 0 ? '+' : ''}${offset.toFixed(2)} C`);
  }
  if (Math.abs(learned) >= 0.01) {
    parts.push(`learned ${learned > 0 ? '+' : ''}${learned.toFixed(2)} C`);
  }
  return parts.length ? `${parts.join(' / ')} -> ${fmtC(target)}` : `target ${fmtC(target)}`;
};
const fmtDecisionLead = (decision = {}) => {
  const active = Number(decision.active_thermal_lead_h ?? decision.configured_thermal_lead_h ?? 0);
  const learned = Number(decision.learned_thermal_lead_h || 0);
  if (!active) return '';
  return learned > 0 && learned >= active ? ` / lead ${active}h learned` : ` / lead ${active}h`;
};
const fmtCommandTarget = (command = {}) => {
  const room = command.name || command.room_id;
  const binding = `${nodeLabel(command.node_index)} / Z${Number(command.zone_index) + 1}`;
  return room ? `${room} (${binding})` : binding;
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const isIpv4 = (value) => /^\d+\.\d+\.\d+\.\d+$/.test(String(value || '').trim());
const nodeProbePayload = (input) => {
  const value = String(input || '').trim();
  return isIpv4(value) ? { ip: value } : { hostname: value };
};
const nodePayloadFromCandidate = (input, candidate = {}) => {
  const value = String(input || candidate.hostname || candidate.ip || '').trim();
  const candidateHostname = String(candidate.hostname || '').trim();
  const candidateHostnameIsIp = isIpv4(candidateHostname);
  const inputIsIp = isIpv4(value);
  return {
    node_id: candidate.id || undefined,
    hostname: candidateHostnameIsIp ? '' : (candidateHostname || (inputIsIp ? '' : value)),
    ip: candidate.ip || (candidateHostnameIsIp ? candidateHostname : (inputIsIp ? value : '')),
    pairing_fingerprint: candidate.pairing_fingerprint || '',
  };
};

const renderScanResults = (scan) => {
  const found = scan?.found || [];
  return `<div class="scan-results">
    <div class="scan-results-head"><h3>Last scan</h3><span class="note">${esc(scan?.discovery || 'not run')}</span></div>
    ${found.map((node) => `<div class="scan-candidate">
      <strong>${esc(node.id || node.hostname || node.ip || 'candidate')}</strong>
      <span>${esc(node.hostname || node.ip || '')}</span>
      <span class="${node.reachable ? 'ok' : 'warn'}">${node.reachable ? 'reachable' : 'unreachable'}</span>
      ${node.firmware ? `<span>${esc(node.firmware)}</span>` : ''}
      ${node.error ? `<span class="warn">${esc(node.error)}</span>` : ''}
      <button class="btn slim" data-add-probed-host="${esc(node.hostname || '')}" data-add-probed-ip="${esc(node.ip || '')}" data-add-probed-fingerprint="${esc(node.pairing_fingerprint || '')}" data-add-probed-id="${esc(node.id || '')}">Add</button>
    </div>`).join('') || '<p class="note">No candidates yet. Probe a hostname/IP, or add manually.</p>'}
  </div>`;
};

function range(values, fallbackMin, fallbackMax) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (!finite.length) return { min: fallbackMin, max: fallbackMax };
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  return { min: min - pad, max: max + pad };
}

function smoothPath(points) {
  if (!points.length) return '';
  if (points.length < 3) return `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const tension = 0.16;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function forecastChart(forecast = {}) {
  const hours = Array.isArray(forecast.hours) ? forecast.hours.slice(0, 72) : [];
  const activeDecisions = Array.isArray(forecast.decisions)
    ? forecast.decisions.filter((decision) => decision.active && Number.isFinite(Number(decision.peak_in_h))).slice(0, 8)
    : [];
  const w = 1000;
  const h = 220;
  const left = 46;
  const right = 44;
  const top = 18;
  const bottom = 44;
  const plotW = w - left - right;
  const plotH = h - top - bottom;
  const plotB = top + plotH;
  if (!hours.length) {
    return `<div class="chart-card"><div class="chart-head"><span class="chart-title">Forecast / preload</span><span class="chart-sub">no cache</span></div><svg class="forecast-chart" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" class="chart-empty">Fetch weather to populate forecast graph</text></svg></div>`;
  }
  const x = (index) => left + (hours.length <= 1 ? 0 : index / (hours.length - 1)) * plotW;
  const closestHourIndex = (targetHour) => hours.reduce((best, hour, index) => {
    const current = Number(hour.h ?? index);
    const previous = Number(hours[best]?.h ?? best);
    return Math.abs(current - targetHour) < Math.abs(previous - targetHour) ? index : best;
  }, 0);
  const tempRange = range(hours.map((hour) => Number(hour.temp_c)), -5, 15);
  const windRange = range(hours.map((hour) => Number(hour.wind_ms)), 0, 14);
  windRange.min = Math.min(0, windRange.min);
  const yTemp = (value) => top + (1 - (value - tempRange.min) / Math.max(0.001, tempRange.max - tempRange.min)) * plotH;
  const yWind = (value) => top + (1 - (value - windRange.min) / Math.max(0.001, windRange.max - windRange.min)) * plotH;
  const ySolar = (value) => top + (1 - clamp(value, 0, 900) / 900) * plotH;
  const points = {
    temp: hours.map((hour, index) => ({ x: x(index), y: yTemp(Number(hour.temp_c)) })).filter((p) => Number.isFinite(p.y)),
    wind: hours.map((hour, index) => ({ x: x(index), y: yWind(Number(hour.wind_ms)) })).filter((p) => Number.isFinite(p.y)),
    solar: hours.map((hour, index) => ({ x: x(index), y: ySolar(Number(hour.solar_wm2)) })).filter((p) => Number.isFinite(p.y)),
  };
  const solarArea = points.solar.length ? `${smoothPath(points.solar)} L ${points.solar[points.solar.length - 1].x.toFixed(1)} ${plotB} L ${points.solar[0].x.toFixed(1)} ${plotB} Z` : '';
  const grid = [0, 0.5, 1].map((ratio) => {
    const y = top + ratio * plotH;
    const temp = tempRange.max - (tempRange.max - tempRange.min) * ratio;
    const wind = windRange.max - (windRange.max - windRange.min) * ratio;
    return `<line x1="${left}" y1="${y}" x2="${left + plotW}" y2="${y}" class="chart-grid"></line><text x="${left - 8}" y="${y + 4}" text-anchor="end" class="chart-tick">${temp.toFixed(0)}C</text><text x="${left + plotW + 8}" y="${y + 4}" class="chart-tick">${wind.toFixed(0)}m/s</text>`;
  }).join('');
  const hourTicks = hours.map((hour, index) => {
    if (index % 6 !== 0 && index !== hours.length - 1) return '';
    const tx = x(index);
    return `<text x="${tx}" y="${plotB + 18}" text-anchor="middle" class="chart-hour">+${hour.h ?? index}h</text>`;
  }).join('');
  const preloadMarkers = activeDecisions.map((decision, index) => {
    const targetHour = Number(decision.peak_in_h);
    const markerX = x(closestHourIndex(targetHour));
    const labelY = top + 11 + (index % 3) * 15;
    const labelLeft = markerX > w - 190;
    const labelX = labelLeft ? markerX - 6 : markerX + 6;
    const label = decision.name || decision.room_id || `Z${Number(decision.zone_index || 0) + 1}`;
    return `<g class="chart-preload">
      <line x1="${markerX}" y1="${top}" x2="${markerX}" y2="${plotB}" class="chart-preload-line"></line>
      <circle cx="${markerX}" cy="${labelY - 4}" r="3.5" class="chart-preload-dot"></circle>
      <text x="${labelX}" y="${labelY}" text-anchor="${labelLeft ? 'end' : 'start'}" class="chart-preload-label">${esc(label)} +${fmtValue(decision.offset_c, ' C')}</text>
    </g>`;
  }).join('');
  return `<div class="chart-card">
    <div class="chart-head"><span class="chart-title">Forecast / preload</span><span class="chart-sub">${hours.length} h cache</span></div>
    <div class="chart-legend">
      <span class="legend-item" style="color:var(--series-cool)"><span class="legend-dot"></span>Temp</span>
      <span class="legend-item" style="color:var(--series-warm)"><span class="legend-dot"></span>Wind</span>
      <span class="legend-item" style="color:var(--series-solar)"><span class="legend-dot"></span>Solar</span>
      ${activeDecisions.length ? '<span class="legend-item" style="color:var(--ok)"><span class="legend-dot"></span>Preload</span>' : ''}
    </div>
    <svg class="forecast-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      ${grid}<line x1="${left}" y1="${plotB}" x2="${left + plotW}" y2="${plotB}" class="chart-axis"></line>${hourTicks}
      ${solarArea ? `<path d="${solarArea}" fill="rgba(255,193,77,.10)" stroke="none"></path>` : ''}
      <path d="${smoothPath(points.solar)}" fill="none" stroke="var(--series-solar)" stroke-width="1.8" stroke-linecap="round"></path>
      <path d="${smoothPath(points.temp)}" fill="none" stroke="var(--series-cool)" stroke-width="2.4" stroke-linecap="round"></path>
      <path d="${smoothPath(points.wind)}" fill="none" stroke="var(--series-warm)" stroke-width="2.2" stroke-linecap="round"></path>
      ${preloadMarkers}
    </svg>
  </div>`;
}

function readinessStrip() {
  const commissioning = state.diagnostics?.commissioning || {};
  const readyTrusted = commissioning.reachable_trusted_nodes ?? 0;
  const trustedNodes = commissioning.trusted_nodes || 0;
  return `<div class="readiness-strip">
    <div class="readiness-chip"><span>Next</span><strong class="${commissioning.next_action === 'ready' ? 'ok' : 'warn'}">${esc(fmtNextAction(commissioning.next_action))}</strong></div>
    <div class="readiness-chip"><span>Nodes</span><strong class="${readyTrusted > 0 ? 'ok' : 'warn'}">${readyTrusted} ready / ${trustedNodes} trusted</strong></div>
    <div class="readiness-chip"><span>Identity</span><strong class="${commissioning.identity_missing_nodes ? 'warn' : 'ok'}">${commissioning.identity_missing_nodes || 0} missing</strong></div>
    <div class="readiness-chip"><span>Commands</span><strong class="${commissioning.ready_for_commands ? 'ok' : 'warn'}">${commissioning.ready_for_commands ? 'ready' : 'blocked'}</strong></div>
  </div>`;
}

function statusClass(status) {
  if (status === 'heat' || status === 'call' || status === 'preheat') return 'ok';
  if (status === 'stale' || status === 'rejected' || status === 'failed' || status === 'expired' || status === 'blocked_stale' || status === 'blocked_unreachable' || status === 'blocked_untrusted') return 'warn';
  if (status === 'unused') return 'muted';
  return '';
}

function commandStats(commands = []) {
  const blockingResults = new Set(['rejected', 'failed', 'blocked_stale', 'blocked_unreachable', 'blocked_untrusted']);
  return commands.reduce((stats, command) => {
    if (command.result === 'pending') stats.pending += 1;
    if (command.result === 'accepted') stats.accepted += 1;
    if (command.result === 'rejected') stats.rejected += 1;
    if (command.result === 'failed') stats.failed += 1;
    if (command.result === 'expired') stats.expired += 1;
    if (command.result === 'blocked_stale') stats.blocked_stale += 1;
    if (command.result === 'blocked_unreachable') stats.blocked_unreachable += 1;
    if (command.result === 'blocked_untrusted') stats.blocked_untrusted += 1;
    if (command.clamp_applied) stats.clamped += 1;
    if (blockingResults.has(command.result)) stats.blocked += 1;
    return stats;
  }, {
    pending: 0,
    accepted: 0,
    rejected: 0,
    failed: 0,
    expired: 0,
    blocked: 0,
    blocked_stale: 0,
    blocked_unreachable: 0,
    blocked_untrusted: 0,
    clamped: 0,
  });
}

function commandNeedsAttention(command = {}) {
  return command.clamp_applied || ['rejected', 'failed', 'blocked_stale', 'blocked_unreachable', 'blocked_untrusted'].includes(command.result);
}

function zoneCard(zone) {
  return `<article class="zone-card ${statusClass(zone.status)}">
    <div class="zone-top"><strong>${esc(zone.name)}</strong><span>${fmtC(zone.temperature_c)}</span></div>
    <div class="zone-bottom"><span>Set ${fmtC(zone.setpoint_c)}</span><span>${fmtValue(zone.valve_pct, '%')}</span><span>${esc(zone.status)}</span><span>${esc(nodeLabel(zone.node_index))}</span></div>
  </article>`;
}

const priorityOptions = (value) => [
  [0, 'Low'],
  [1, 'Normal'],
  [2, 'High'],
  [3, 'Critical'],
].map(([priority, label]) => `<option value="${priority}" ${Number(value ?? 1) === priority ? 'selected' : ''}>${label}</option>`).join('');

const exposureLevel = (value, type) => {
  const n = Number(value);
  if (type === 'wind') return n <= 0.3 ? 'sheltered' : n >= 0.75 ? 'exposed' : 'normal';
  return n <= 0.2 ? 'low' : n >= 0.6 ? 'high' : 'normal';
};
const levelValue = (level, type) => {
  if (type === 'wind') return level === 'sheltered' ? 0.2 : level === 'exposed' ? 0.9 : 0.5;
  return level === 'low' ? 0.1 : level === 'high' ? 0.75 : 0.3;
};
const exposureOptions = (selected, type) => {
  const options = type === 'wind'
    ? [['sheltered', 'Sheltered'], ['normal', 'Normal'], ['exposed', 'Exposed']]
    : [['low', 'Low'], ['normal', 'Normal'], ['high', 'High']];
  return options.map(([value, label]) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`).join('');
};

const nodeOptions = (selected) => {
  const options = state.nodes.map((node, index) => `<option value="${index}" ${Number(selected || 0) === index ? 'selected' : ''}>${esc(node.name || node.id || v6Name(index))}</option>`).join('');
  return options || `<option value="0" ${Number(selected || 0) === 0 ? 'selected' : ''}>V6-0</option>`;
};

const comfortDefault = (z) => {
  const candidates = [z.comfort?.setpoint_c, z.setpoint_c, 21];
  const value = candidates.map(Number).find((candidate) => Number.isFinite(candidate) && candidate >= 5);
  return value ?? 21;
};

const scheduleDefault = (z) => {
  const schedule = z.schedule || {};
  const comfort = comfortDefault(z);
  const start = Number(schedule.start_min);
  const end = Number(schedule.end_min);
  const setpoint = Number(schedule.setpoint_c);
  return {
    enabled: schedule.enabled === true,
    start: Number.isFinite(start) && start > 0 ? start : 360,
    end: Number.isFinite(end) && end > 0 ? end : 1320,
    setpoint: Number.isFinite(setpoint) && setpoint >= 5 ? setpoint : comfort,
  };
};

function zoneDetailScreen(z, index) {
  const schedule = z.schedule || {};
  const scheduleValues = scheduleDefault(z);
  const forecast = z.forecast || {};
  const comfortSetpoint = comfortDefault(z);
  const walls = Number(forecast.exterior_walls || 0);
  return `<section class="view zone-subscreen" data-zone-index="${index}">
    <div class="section-head"><div><button class="btn slim" data-cancel-zone-edit>Back to manifolds</button><h2>${esc(z.name || z.room_id)}</h2></div><span class="note">${esc(nodeLabel(z.node_index))} / Z${Number(z.zone_index) + 1}</span></div>
    <section class="zone-target-card">
      <div><span class="chart-title">Target temperature</span><div class="target-stepper"><button class="spb" data-zone-target="${(comfortSetpoint - 0.5).toFixed(1)}">−</button><strong>${fmtC(comfortSetpoint)}</strong><button class="spb" data-zone-target="${(comfortSetpoint + 0.5).toFixed(1)}">+</button></div><small>Stored on Lune V6 and synchronized both ways.</small></div>
      <div class="zone-live-facts"><div><span>Current</span><strong>${fmtC(z.temperature_c)}</strong></div><div><span>Valve</span><strong>${fmtValue(z.valve_pct, '%')}</strong></div><div><span>Status</span><strong class="${statusClass(z.status)}">${esc(z.status || 'unknown')}</strong></div></div>
    </section>
    <div class="zone-subgrid">
      <section class="settings-panel settings-section">
        <div class="settings-section-head"><div><h3>Zone</h3><p class="note">Name and valve mapping.</p></div><button class="btn slim" data-save-zone-mapping="${index}">Save</button></div>
        <div class="settings-form-grid">
          <label>Zone name<input class="input" data-zone-field="name" value="${esc(z.name || '')}"></label>
          <label>Manifold<select class="input" data-zone-field="node">${nodeOptions(z.node_index)}</select></label>
          <label>Valve output<input class="input" data-zone-field="zone" type="number" min="1" max="6" value="${Number(z.zone_index || 0) + 1}"></label>
        </div>
      </section>
      <section class="settings-panel settings-section">
        <div class="settings-section-head"><div><h3>Exterior walls</h3><p class="note">The same weather control stored on Lune V6.</p></div><button class="btn slim" data-save-zone-weather="${index}">Save</button></div>
        <div class="field-grid four walls-grid zone-wall-grid">
          ${[['north', 1, 'North'], ['east', 2, 'East'], ['south', 4, 'South'], ['west', 8, 'West']].map(([key, bit, label]) => `<label class="check mini-check"><input data-zone-wall="${key}" type="checkbox" ${walls & bit ? 'checked' : ''}> ${label}</label>`).join('')}
        </div>
      </section>
      <section class="settings-panel settings-section wide">
        <div class="settings-section-head"><div><h3>Touch schedule</h3><p class="note">Optional coordinator schedule. The normal target remains on V6.</p></div><button class="btn slim" data-save-zone-schedule="${index}">Save</button></div>
        <div class="field-grid schedule zone-schedule-grid">
          <label class="check mini-check"><input data-zone-field="schedule-enabled" type="checkbox" ${scheduleValues.enabled ? 'checked' : ''}> Enabled</label>
          <label>Start<input class="input" data-zone-field="schedule-start" type="time" value="${fmtClock(scheduleValues.start)}"></label>
          <label>End<input class="input" data-zone-field="schedule-end" type="time" value="${fmtClock(scheduleValues.end)}"></label>
          <label>Target<input class="input" data-zone-field="schedule-setpoint" type="number" step="0.5" min="5" max="35" value="${Number(scheduleValues.setpoint).toFixed(1)}"></label>
        </div>
      </section>
    </div>
  </section>`;
}

function zoneListItem(z, index) {
  const source = `${nodeLabel(z.node_index)} / Z${Number(z.zone_index) + 1}`;
  const nameSource = z.name_source === 'touch' ? 'Touch name' : z.name_source === 'v6' ? 'V6 name' : 'Generated name';
  return `<article class="zone-row zone-row-compact ${statusClass(z.status)}">
    <div class="zone-row-main zone-compact-main">
      <div class="zone-room">
        <strong>${esc(z.name || z.room_id)}</strong>
        <span>${esc(nameSource)} · ${esc(z.room_id || '')} · ${esc(source)}</span>
      </div>
      <div class="zone-reading"><span>Current</span><strong>${fmtC(z.temperature_c)}</strong></div>
      <div class="zone-pill ${statusClass(z.status)}"><span>Status</span><strong>${esc(z.status || 'unknown')}</strong></div>
      <div class="zone-metrics">
        <div><span>Target</span><strong>${fmtC(z.setpoint_c ?? comfortDefault(z))}</strong></div>
        <div><span>Valve</span><strong>${fmtValue(z.valve_pct, '%')}</strong></div>
      </div>
      <div class="zone-row-actions">
        <button class="btn slim" data-command-room="${esc(z.room_id)}">+0.5 C / 45m</button>
        <button class="btn slim" data-edit-zone-row="${index}">Open</button>
      </div>
    </div>
  </article>`;
}

export function renderSetup() {
  const settings = state.settings || {};
  const coordinator = settings.coordinator || {};
  const commissioning = state.diagnostics?.commissioning || {};
  const forecast = state.forecast || {};
  const weather = settings.weather || forecast.weather || {};
  const ready = commissioning.next_action === 'ready';
  const steps = [
    ['Name this Touch', coordinator.name || coordinator.site_label, 'system', 'Open system'],
    ['Add a V6 manifold', state.nodes.length ? `${state.nodes.length} manifold${state.nodes.length === 1 ? '' : 's'}` : '', 'manifolds', 'Open manifolds'],
    ['Verify manifold identity', commissioning.trusted_nodes ? `${commissioning.trusted_nodes} trusted` : '', 'manifolds', 'Verify'],
    ['Name each manifold', state.nodes.some((node) => node.name && node.name !== node.id) ? 'named' : '', 'manifolds', 'Name manifolds'],
    ['Import and confirm zones', commissioning.bound_zones ? `${commissioning.bound_zones} zones` : '', 'manifolds', 'Open manifolds'],
    ['Set weather location', forecast.location?.latitude ? `${Number(forecast.location.latitude).toFixed(3)}, ${Number(forecast.location.longitude).toFixed(3)}` : '', 'weather', 'Open weather'],
    ['Configure heat source', state.heatSource?.host || '', 'heat-source', 'Open heat source'],
  ];
  return `<section class="view">
    <div class="section-head"><h2>Setup</h2><span class="note">${ready ? 'Ready for daily use' : `Next: ${esc(fmtNextAction(commissioning.next_action))}`}</span></div>
    ${readinessStrip()}
    <div class="setup-layout">
      <div class="setup-steps">
        ${steps.map(([title, value, section, label], index) => {
          const done = !!value;
          return `<article class="setup-step ${done ? 'ok' : 'warn'}">
            <span>${index + 1}</span>
            <div><strong>${esc(title)}</strong><small>${esc(value || 'Needs attention')}</small></div>
            <button class="btn slim" data-section="${section}">${esc(label)}</button>
          </article>`;
        }).join('')}
      </div>
      <div class="stack">
        <div class="ops-panel">
          <h3>Current state</h3>
          <p class="${commissioning.ready_for_commands ? 'ok' : 'warn'}">Commands ${commissioning.ready_for_commands ? 'ready' : 'blocked'}</p>
          <p>${commissioning.reachable_trusted_nodes || 0} ready manifolds / ${commissioning.fresh_zones || 0} fresh zones</p>
          <p>Weather boost cap ${fmtValue(weather.max_boost_c ?? 1.5, ' C')}</p>
          ${commissioningActionButton(commissioning.next_action)}
        </div>
        <div class="ops-panel">
          <h3>What Touch owns</h3>
          <p>Zone comfort, schedules, weather preload, learned house behavior, and command history.</p>
          <p>V6 still owns valve safety, local clamps, expiry, and fallback heating.</p>
        </div>
      </div>
    </div>
  </section>`;
}

export function renderOverview() {
  const summary = state.overview?.summary || {};
  const forecast = state.forecast || {};
  const activeDecisions = (forecast.decisions || []).filter((decision) => decision.active).slice(0, 5);
  const diagnostics = state.diagnostics || {};
  const polling = diagnostics.polling || {};
  const forecastStatus = diagnostics.forecast || {};
  const commandResults = diagnostics.command_results || {};
  const heatSource = state.heatSource || {};
  const weighted = heatSource.weighted_temperature || state.strategy?.weighted_temperature || {};
  const push = heatSource.push || {};
  return `<section class="view">
    <div class="section-head"><h2>Dashboard</h2><button class="btn" data-action="refresh">Refresh</button></div>
    <div class="stat-grid">
      <div class="stat"><span>Comfort</span><strong>${fmtC(summary.comfort_avg_c)}</strong></div>
      <div class="stat"><span>Zones</span><strong>${summary.zones || 0}</strong><em>${summary.calling || 0} calling</em></div>
      <div class="stat"><span>Manifolds</span><strong>${summary.nodes || 0}</strong><em>${summary.stale_nodes || 0} stale</em></div>
      <div class="stat"><span>Weather</span><strong>${summary.forecast_status || 'unknown'}</strong><em>${summary.latest_command || 'no command'}</em></div>
    </div>
    ${readinessStrip()}
    <div class="split-main">
      <div>
        <div class="section-head"><h2>Zones</h2><span class="note">Heat demand and source freshness</span></div>
        <div class="zone-matrix">${state.zones.map(zoneCard).join('')}</div>
      </div>
      <div class="stack">
        ${forecastChart(forecast)}
        <div class="ops-panel">
          <h3>Active preload</h3>
          ${activeDecisions.map((decision) => `<p>${esc(decision.name || decision.room_id)}: +${fmtValue(decision.offset_c, ' C')} / P${decision.priority ?? 1} / peak in ${decision.peak_in_h}h${fmtDecisionLead(decision)}</p>`).join('') || '<p>No active preload decisions</p>'}
        </div>
        <div class="ops-panel">
          <h3>Heat source</h3>
          <p class="${heatSource.enabled && push.ok !== false ? 'ok' : 'warn'}">${heatSource.enabled ? 'enabled' : 'not configured'} / ${weighted.available ? fmtC(weighted.value_c) : 'weighted temperature missing'}</p>
          <p>${weighted.contributing_rooms || 0} zones / ${heatSource.host || 'no address'}${heatSource.host ? `:${heatSource.port || 80}` : ''}</p>
          <button class="btn slim" data-section="heat-source">Manage heat source</button>
        </div>
        <div class="ops-panel">
          <h3>System health</h3>
          <p class="${polling.fail ? 'warn' : 'ok'}">${polling.success || 0} polls ok / ${polling.fail || 0} failed</p>
          <p class="${forecastStatus.status === 'ok' || forecastStatus.status === 'cached' ? 'ok' : 'warn'}">Forecast ${forecastStatus.status || summary.forecast_status || 'unknown'}${forecastStatus.fetch_pending ? ' / pending' : ''}</p>
          <p class="${commandResults.failed || commandResults.blocked ? 'warn' : 'muted'}">${commandResults.accepted || 0} commands accepted / ${commandResults.blocked || 0} blocked / ${commandResults.failed || 0} failed</p>
        </div>
      </div>
    </div>
  </section>`;
}

export function renderZones() {
  return `<section class="view">
    <div class="section-head"><h2>Zones</h2><span class="note">Comfort, schedules, and manifold mapping.</span></div>
    <div class="zone-list">
      ${state.zones.map(zoneListItem).join('')}
    </div>
  </section>`;
}

export function renderManifolds() {
  const selectedZoneIndex = state.zones.findIndex((zone) => zone.room_id === state.zoneEditRoomId);
  if (selectedZoneIndex >= 0)
    return zoneDetailScreen(state.zones[selectedZoneIndex], selectedZoneIndex);
  const scan = state.scanResult;
  return `<section class="view">
    <div class="section-head"><h2>Manifolds</h2><button class="btn" data-action="scan">Scan</button></div>
    <div class="manifold-register">
      <div>
        <h3>Register manifold</h3>
        <p class="note">Add and verify each manifold, then manage its zones below.</p>
      </div>
      <div class="inline-form manifold-form">
        <input class="input mini-input" id="node-host" placeholder="lune-v6-a.local or 192.168.20.120">
        <button class="btn" data-action="probe-node">Probe</button>
        <button class="btn" data-action="add-node">Add manually</button>
      </div>
    </div>
    ${renderScanResults(scan)}
    <div class="node-list">${state.nodes.map((n) => {
      const h = n.health || {};
      const r = n.runtime || {};
      const nodeIndex = state.nodes.findIndex((node) => node.id === n.id);
      const recoveryZone = state.zones.find((zone) => Number(zone.node_index) === nodeIndex && zone.room_id);
      const manifoldZones = state.zones.filter((zone) => Number(zone.node_index) === nodeIndex);
      return `<article class="node-panel">
      <div>
        <h3>${esc(n.name || n.id)}</h3>
        <label class="node-name-field">Friendly name<input class="input mini-input" data-node-name="${esc(n.id)}" value="${esc(n.name || n.id || '')}"></label>
        <p>${n.hostname || n.ip || 'no address'}</p>
        <p class="${n.reachable ? 'ok' : 'warn'}">${n.reachable ? 'reachable' : 'stale'} / ${fmtTrust(n)}</p>
        <div class="node-actions">
          <button class="btn slim" data-save-node-profile="${esc(n.id)}">Save name</button>
          <button class="btn slim" data-action="refresh-node-names">Import names from V6</button>
          ${r.motor_fault && recoveryZone ? `<button class="btn slim danger" data-motor-action="reset_fault" data-motor-room="${esc(recoveryZone.room_id)}">Reset fault</button>` : ''}
          <button class="btn slim" data-trust-node="${n.id}" data-trust-value="trusted" data-trust-confirm="${esc(n.pairing_fingerprint || '')}">Verify manifold</button>
          <button class="btn slim" data-trust-node="${n.id}" data-trust-value="paired" data-trust-confirm="">Pair only</button>
          <button class="btn slim danger" data-remove-node="${n.id}">Remove</button>
        </div>
      </div>
      <div class="health-grid">
        <div class="health-cell"><span>Zones</span><strong>${h.mapped_zones ?? 0}</strong></div>
        <div class="health-cell"><span>Fresh</span><strong class="${h.stale_zones ? 'warn' : 'ok'}">${h.fresh_zones ?? 0}/${h.mapped_zones ?? 0}</strong></div>
        <div class="health-cell"><span>Calling</span><strong>${h.calling_zones ?? 0}</strong></div>
        <div class="health-cell"><span>Temp</span><strong>${fmtC(h.avg_temp_c)}</strong></div>
        <div class="health-cell"><span>Setpoint</span><strong>${fmtC(h.avg_setpoint_c)}</strong></div>
        <div class="health-cell"><span>Trust</span><strong class="${fmtTrust(n) === 'trusted' ? 'ok' : 'warn'}">${fmtTrust(n)}</strong></div>
        <div class="health-cell"><span>Flow</span><strong>${fmtC(r.flow_c)}</strong></div>
        <div class="health-cell"><span>Return</span><strong>${fmtC(r.return_c)}</strong></div>
        <div class="health-cell"><span>Valve</span><strong>${fmtValue(r.avg_valve_pct, '%')}</strong></div>
        <div class="health-cell"><span>Active</span><strong>${r.active_zones ?? 0}</strong></div>
        <div class="health-cell"><span>Drivers</span><strong class="${r.drivers_enabled ? 'ok' : 'warn'}">${r.drivers_enabled ? 'on' : 'off'}</strong></div>
        <div class="health-cell"><span>Fault</span><strong class="${r.motor_fault ? 'warn' : 'ok'}">${r.motor_fault ? 'yes' : 'none'}</strong></div>
      </div>
      <dl><dt>ID</dt><dd>${esc(n.id || '-')}</dd><dt>Firmware</dt><dd>${n.firmware || '-'}</dd><dt>Status</dt><dd class="${n.reachable ? 'ok' : 'warn'}">${n.reachable ? 'reachable' : 'stale'}</dd><dt>Identity</dt><dd>${esc(n.pairing_fingerprint || '-')}</dd><dt>Last host</dt><dd>${esc(n.last_success_host || '-')}</dd><dt>Last error</dt><dd class="${n.last_failure ? 'warn' : 'muted'}">${esc(n.last_failure || '-')}</dd></dl>
      <section class="manifold-zones">
        <div class="settings-section-head"><div><h3>Zones</h3><p class="note">Names, comfort, schedules, and forecast settings for this manifold.</p></div></div>
        <div class="zone-list">${manifoldZones.map((zone) => zoneListItem(zone, state.zones.indexOf(zone))).join('') || '<div class="empty-row">No zones imported yet</div>'}</div>
      </section>
    </article>`;
    }).join('')}</div>
  </section>`;
}

export function renderForecast() {
  const f = state.forecast || {};
  const cache = f.cache || {};
  const location = f.location || {};
  const weather = state.settings?.weather || f.weather || {};
  const maxBoost = Number(weather.max_boost_c ?? 1.5);
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const latitudeValue = Number.isFinite(latitude) ? String(latitude) : '';
  const longitudeValue = Number.isFinite(longitude) ? String(longitude) : '';
  const commands = f.commands || {};
  const activeDecisions = (f.decisions || []).filter((d) => d.active);
  const forecastHealthy = f.status === 'ok' || f.status === 'cached';
  const statusLabel = `${f.status || 'unknown'}${f.fetch_pending ? ' / pending' : ''}`;
  return `<section class="view">
    <div class="section-head"><h2>Weather</h2><button class="btn" data-action="forecast-fetch">Fetch now</button></div>
    <div class="metric-strip">
      <div class="metric"><span>Status</span><strong class="${forecastHealthy ? 'ok' : 'warn'}">${statusLabel}</strong></div>
      <div class="metric"><span>Cache</span><strong>${cache.hours || 0} h / ${cache.restored ? 'restored' : 'live'}</strong></div>
      <div class="metric"><span>Wind</span><strong>${fmtValue(cache.max_wind_ms, ' m/s')} / ${Math.round(cache.peak_wind_dir_deg || 0)} deg</strong></div>
      <div class="metric"><span>Dispatch</span><strong class="${commands.failed ? 'warn' : 'ok'}">${commands.sent || 0} sent / ${commands.failed || 0} failed</strong></div>
    </div>
    <div class="split-main">
      <div class="stack">
        ${forecastChart(f)}
        <div class="ops-panel">
          <h3>Weather settings</h3><p>${location.mode || 'manual'} (${Number(latitude || 0).toFixed(5)}, ${Number(longitude || 0).toFixed(5)}) / boost cap ${fmtValue(maxBoost, ' C')}</p>
          <div class="inline-form forecast-location">
            <input class="input mini-input" id="forecast-lat" type="number" step="0.000001" placeholder="Latitude" value="${latitudeValue}">
            <input class="input mini-input" id="forecast-lon" type="number" step="0.000001" placeholder="Longitude" value="${longitudeValue}">
            <button class="btn" data-action="save-forecast-location">Apply</button>
            <button class="btn" data-discard-section="forecast">Discard</button>
            <button class="btn" data-action="geo">Use browser</button>
          </div>
          <div class="inline-form weather-cap-form">
            <input class="input mini-input" id="weather-max-boost" type="number" step="0.1" min="0" max="5" value="${Number.isFinite(maxBoost) ? maxBoost.toFixed(1) : '1.5'}">
            <button class="btn" data-action="save-weather-settings">Save boost cap</button>
          </div>
        </div>
        <div class="diagnostics-layout">
          <div class="ops-panel"><h3>Status</h3><p class="${forecastHealthy ? 'ok' : 'warn'}">${statusLabel} / last fetch ${fmtAge(f.last_fetch_age_s)}</p><p class="${f.fetch_pending ? 'warn' : 'muted'}">${f.fetch_pending ? 'fetch queued; waiting for poll task' : 'fetch queue idle'}</p><p class="${f.last_error ? 'warn' : 'muted'}">${f.last_error || 'no current forecast error'}</p></div>
          <div class="ops-panel"><h3>Cache</h3><p>${cache.hours || 0} hours, min ${fmtValue(cache.min_temp_c, ' C')}</p><p>Wind ${fmtValue(cache.max_wind_ms, ' m/s')} from ${Math.round(cache.peak_wind_dir_deg || 0)} deg</p><p>Solar ${fmtValue(cache.max_solar_wm2, ' W/m2')}</p></div>
          <div class="ops-panel"><h3>Commands</h3><p>${commands.active || 0} active / ${commands.sent || 0} sent / ${commands.skipped || 0} skipped</p><p class="${commands.blocked_stale || commands.blocked_unreachable || commands.blocked_untrusted ? 'warn' : 'muted'}">${commands.blocked_stale || 0} stale / ${commands.blocked_unreachable || 0} offline / ${commands.blocked_untrusted || 0} trust</p></div>
        </div>
      </div>
      <div class="stack">
        <div class="ops-panel"><h3>Active preload decisions</h3>${activeDecisions.map((d) => `<p>${esc(d.room_id)}: +${fmtValue(d.offset_c, ' C')}, P${d.priority ?? 1}, comfort ${fmtC(d.comfort_setpoint_c)}, peak ${fmtValue(d.peak_load)} in ${d.peak_in_h}h${fmtDecisionLead(d)}</p>`).join('') || '<p>No active decisions</p>'}</div>
      </div>
    </div>
  </section>`;
}

export function renderCommands() {
  return `<section class="view">
    <div class="section-head"><h2>Command ledger</h2><span class="note">Requested vs accepted/clamped values</span></div>
    <div class="data-table">
      <div class="tr head commands"><span>ID</span><span>Source</span><span>Reason</span><span>Target</span><span>Request</span><span>Accept</span><span>Clamp</span><span>Expiry</span></div>
      ${state.commands.map((c) => `<div class="tr commands"><span>${esc(c.request_id)}</span><span>${esc(c.source)}</span><span>${esc(c.reason || '-')}</span><span>${esc(fmtCommandTarget(c))}</span><span>${fmtValue(c.requested_offset_c, ' C')}</span><span>${fmtValue(c.accepted_offset_c, ' C')}</span><span class="${c.clamp_applied ? 'warn' : 'ok'}">${c.clamp_applied ? 'yes' : 'no'}</span><span class="${statusClass(c.result === 'accepted' ? 'heat' : c.result)}">${esc(c.result)} / ${fmtCommandExpiry(c)}</span></div>`).join('')}
    </div>
  </section>`;
}

export function renderHeatSource() {
  const source = state.heatSource || {};
  const weighted = source.weighted_temperature || {};
  const push = source.push || {};
  const configured = !!source.host;
  const ready = source.enabled && configured && weighted.available;
  return `<section class="view settings-page">
    <div class="section-head settings-head">
      <h2>Heat Source</h2>
      <span class="settings-badge ${ready ? 'ok' : 'warn'}">${ready ? 'Ready' : 'Needs setup'}</span>
    </div>
    <div class="split-main">
      <div class="stack">
        <section class="settings-panel settings-section">
          <div class="settings-section-head">
            <div><h3>Connection</h3><p class="note">Touch pushes the weighted temperature to this heat source.</p></div>
            <div class="action-row">
              <button class="btn" data-action="save-heat-source">Apply</button>
              <button class="btn" data-discard-section="heat-source">Discard</button>
            </div>
          </div>
          <div class="settings-form-grid integration-grid">
            <label class="check"><input id="heat-source-enabled" type="checkbox" ${source.enabled ? 'checked' : ''}> Heat source enabled</label>
            <label>Address<input class="input" id="heat-source-host" value="${esc(source.host || '')}" placeholder="asgard.local or 192.168.20.120" maxlength="63"></label>
            <label>Port<input class="input" id="heat-source-port" type="number" min="1" max="65535" value="${Number(source.port || 80)}"></label>
            <label>Weighted temperature variable<input class="input" id="heat-source-variable" value="${esc(source.weighted_temperature_variable || 'virtual_thermostat_input_z1')}" maxlength="47"></label>
            <label>Push interval (s)<input class="input" id="heat-source-interval" type="number" min="5" max="3600" value="${Number(source.push_interval_s || 30)}"></label>
          </div>
          <div class="settings-facts">
            <div><span>Weighted temperature</span><strong>${weighted.available ? fmtC(weighted.value_c) : 'missing'}</strong><small>${weighted.contributing_rooms || 0} zones</small></div>
            <div><span>Last push</span><strong class="${push.has_result && !push.ok ? 'warn' : 'ok'}">${push.has_result ? (push.ok ? 'ok' : 'failed') : 'not sent'}</strong><small>${push.has_result ? `${fmtAge(push.last_push_age_s)} ago` : 'waiting for first push'}</small></div>
            <div><span>Last value</span><strong>${push.has_result ? fmtC(push.last_value_c) : '-'}</strong><small>${push.failure_count || 0} failures</small></div>
          </div>
          <div class="action-row"><button class="btn" data-action="push-heat-source">Send now</button></div>
          <p class="${push.last_error ? 'warn' : 'muted'}">${esc(push.last_error || 'No current error')}</p>
        </section>
      </div>
      <div class="stack">
        <div class="ops-panel">
          <h3>What is pushed</h3>
          <p>Weighted temperature is the priority-weighted zone temperature. It is a temperature, not a generic signal.</p>
          <p>Variable: <strong>${esc(source.weighted_temperature_variable || '-')}</strong></p>
        </div>
        <div class="ops-panel">
          <h3>What Touch owns</h3>
          <p>Zone priority, weighted-temperature calculation, and push timing.</p>
          <p>V6 still validates, clamps, expires, and reports commands locally.</p>
        </div>
      </div>
    </div>
  </section>`;
}

export function renderSettings() {
  const settings = state.settings || {};
  const coordinator = settings.coordinator || {};
  const diagnostics = state.diagnostics || {};
  const ota = diagnostics.ota || {};
  const polling = diagnostics.polling || {};
  return `<section class="view settings-page">
    <div class="section-head settings-head">
      <h2>System</h2>
      <span class="note">Touch identity, recovery, diagnostics</span>
    </div>
    <div class="settings-grid">
      <div class="settings-main">
        <section class="settings-panel settings-section">
          <div class="settings-section-head">
            <div><h3>Touch identity</h3><p class="note">Names shown in the dashboard and local network tools.</p></div>
            <div class="action-row">
              <button class="btn" data-action="save-settings">Apply</button>
              <button class="btn" data-discard-section="settings">Discard</button>
            </div>
          </div>
          <div class="settings-form-grid">
            <label>Name<input class="input" id="settings-name" value="${esc(coordinator.name || '')}" placeholder="Lune Touch"></label>
            <label>Site<input class="input" id="settings-site-label" value="${esc(coordinator.site_label || '')}" placeholder="House"></label>
            <label>Install ID<input class="input" id="settings-install-id" value="${esc(coordinator.install_id || '')}" placeholder="house-main"></label>
          </div>
        </section>
      </div>

      <aside class="settings-side">
        <section class="settings-panel settings-section">
          <div class="settings-section-head"><div><h3>Device health</h3><p class="note">Network polling, OTA, and local recovery.</p></div></div>
          <p class="${polling.fail ? 'warn' : 'ok'}">${polling.success || 0} polls ok / ${polling.fail || 0} failed</p>
          <p>${esc(ota.running_label || 'unknown')} / ${esc(ota.state || 'unknown')}</p>
          <button class="btn" data-section="diagnostics">Open detailed diagnostics</button>
        </section>
        <section class="settings-panel settings-section recovery-section">
          <div class="settings-section-head"><div><h3>Recovery</h3><p class="note">${state.nodes.length} paired nodes, ${state.commands.length} command records.</p></div></div>
          <button class="btn danger" data-action="reset-registry">Reset registry</button>
        </section>
      </aside>
    </div>
  </section>`;
}

export function renderDiagnostics() {
  const d = state.diagnostics || {};
  const polling = d.polling || {};
  const commissioning = d.commissioning || {};
  const ota = d.ota || {};
  const learning = d.learning || {};
  const forecastStatus = d.forecast || state.forecast || {};
  const forecastCommands = d.forecast_commands || state.forecast?.commands || {};
  const stats = d.command_results || commandStats(state.commands);
  const attentionCommands = state.commands.filter(commandNeedsAttention).slice(-5).reverse();
  const events = state.events.slice(0, 10);
  const blockers = Array.isArray(commissioning.blockers) ? commissioning.blockers.slice(0, 5) : [];
  const recoveryOptions = state.zones
    .filter((zone) => zone.room_id && zone.status !== 'unused')
    .map((zone) => `<option value="${esc(zone.room_id)}">${esc(zone.name || zone.room_id)} (${v6Name(zone.node_index)} / Z${Number(zone.zone_index) + 1})</option>`)
    .join('');
  const strategy = state.strategy || d.strategy || {};
  const weighted = strategy.weighted_temperature || {};
  const comfort = strategy.comfort || {};
  const driver = strategy.driver || {};
  const schedule = strategy.schedule || {};
  return `<section class="view">
    <div class="section-head"><h2>Diagnostics</h2><button class="btn" data-action="refresh">Refresh</button></div>
    <div class="metric-strip">
      <div class="metric"><span>API</span><strong>${d.api || '/api/lune-touch/v1'}</strong></div>
      <div class="metric"><span>Coordinator</span><strong>${d.nodes || 0} nodes / ${d.zones || 0} zones</strong></div>
      <div class="metric"><span>Ledger</span><strong>${d.ledger || 0} records</strong></div>
      <div class="metric"><span>Heap</span><strong>${d.heap || 'watching'}</strong></div>
    </div>
    <div class="diagnostics-layout">
      <div class="ops-panel wide">
        <h3>Command attention</h3>
        <div class="metric-strip compact">
          <div class="metric"><span>Accepted</span><strong class="ok">${stats.accepted}</strong></div>
          <div class="metric"><span>Pending</span><strong>${stats.pending}</strong></div>
          <div class="metric"><span>Clamped</span><strong class="${stats.clamped ? 'warn' : 'ok'}">${stats.clamped}</strong></div>
          <div class="metric"><span>Blocked</span><strong class="${stats.blocked ? 'warn' : 'ok'}">${stats.blocked}</strong></div>
        </div>
        <p class="${stats.failed || stats.rejected || stats.expired ? 'warn' : 'muted'}">${stats.failed || 0} failed / ${stats.rejected || 0} rejected / ${stats.expired || 0} expired</p>
        <p class="${stats.blocked_stale || stats.blocked_unreachable || stats.blocked_untrusted ? 'warn' : 'muted'}">${stats.blocked_stale || 0} stale / ${stats.blocked_unreachable || 0} offline / ${stats.blocked_untrusted || 0} trust</p>
        <div class="data-table diagnostics-table">
          <div class="tr head diagnostics"><span>Source</span><span>Target</span><span>Request</span><span>Result</span><span>Reason</span></div>
          ${attentionCommands.map((c) => `<div class="tr diagnostics"><span>${esc(c.source)}</span><span>${esc(fmtCommandTarget(c))}</span><span>${fmtValue(c.requested_offset_c, ' C')}</span><span class="${statusClass(c.result)}">${esc(c.result)}${c.clamp_applied ? ' / clamp' : ''}</span><span>${esc(c.reason || c.request_id || '-')}</span></div>`).join('') || '<div class="empty-row">No failed, blocked, or clamped commands</div>'}
        </div>
        <button class="btn slim" data-section="commands">Open ledger</button>
      </div>
      <div class="ops-panel wide">
        <h3>Event log</h3>
        <div class="data-table diagnostics-table">
          <div class="tr head events"><span>Time</span><span>Level</span><span>Source</span><span>Message</span></div>
          ${events.map((event) => `<div class="tr events"><span>${fmtUptime(event.ts_ms)}</span><span class="${event.level === 'warn' || event.level === 'error' ? 'warn' : 'ok'}">${esc(event.level || 'info')}</span><span>${esc(fmtEventSource(event.source))}</span><span>${esc(event.message || '-')}</span></div>`).join('') || '<div class="empty-row">No runtime events</div>'}
        </div>
      </div>
      <div class="ops-panel">
        <h3>Device health</h3>
        <p><strong>http://&lt;touch-ip&gt;/</strong></p>
        <p>${d.api || '/api/lune-touch/v1'}</p>
        <p>${d.screen || 'overview-only'}</p>
        <p>Heap ${d.heap || 'watching'} / ledger ${d.ledger || 0} records</p>
      </div>
      <div class="ops-panel">
        <h3>V6 polling</h3>
        <p>Last poll at ${fmtUptime(polling.last_poll_ms)} uptime</p>
        <p><span class="ok">${polling.success || 0} ok</span> / <span class="${polling.fail ? 'warn' : 'ok'}">${polling.fail || 0} failed</span></p>
        <p class="${polling.last_error ? 'warn' : 'muted'}">${esc(polling.last_error || 'no current error')}</p>
      </div>
      <div class="ops-panel">
        <h3>Setup Readiness</h3>
        <p class="${commissioning.next_action === 'ready' ? 'ok' : 'warn'}">${esc(fmtNextAction(commissioning.next_action))}</p>
        <p>${commissioning.reachable_trusted_nodes || 0} ready trusted / ${commissioning.trusted_nodes || 0} trusted / ${commissioning.paired_nodes || 0} paired</p>
        <p>${commissioning.reachable_nodes || 0} reachable / ${commissioning.stale_nodes || 0} stale nodes / ${commissioning.trusted_stale_nodes || 0} stale trusted</p>
        <p class="${commissioning.identity_missing_nodes ? 'warn' : 'ok'}">${commissioning.identity_missing_nodes || 0} missing identities</p>
        <p>${commissioning.fresh_zones || 0} fresh of ${commissioning.bound_zones || 0} bound zones</p>
        <p class="${commissioning.ready_for_commands ? 'ok' : 'warn'}">Commands ${commissioning.ready_for_commands ? 'ready' : 'blocked'} / forecast ${commissioning.ready_for_forecast ? 'ready' : 'blocked'}</p>
        ${blockers.map((blocker) => `<p class="warn">${esc(blocker.target || blocker.scope || 'system')}: ${esc(blocker.reason || 'blocked')} -> ${esc(fmtNextAction(blocker.action))}</p>`).join('') || '<p class="muted">No setup blockers</p>'}
        ${commissioningActionButton(commissioning.next_action)}
      </div>
      <div class="ops-panel">
        <h3>Forecast dispatch</h3>
        <p class="${forecastStatus.status === 'ok' || forecastStatus.status === 'cached' ? 'ok' : 'warn'}">${forecastStatus.status || 'unknown'}${forecastStatus.fetch_pending ? ' / pending' : ''} / ${fmtAge(forecastStatus.last_fetch_age_s)}</p>
        <p class="${forecastStatus.last_error ? 'warn' : 'muted'}">${forecastStatus.last_error || 'no current forecast error'}</p>
        <p>${forecastCommands.active || 0} active / ${forecastCommands.sent || 0} sent / ${forecastCommands.skipped || 0} skipped</p>
        <p class="${forecastCommands.failed ? 'warn' : 'ok'}">${forecastCommands.failed || 0} failed</p>
        <p class="${forecastCommands.blocked_stale || forecastCommands.blocked_unreachable || forecastCommands.blocked_untrusted ? 'warn' : 'muted'}">${forecastCommands.blocked_stale || 0} stale / ${forecastCommands.blocked_unreachable || 0} offline / ${forecastCommands.blocked_untrusted || 0} trust</p>
        <button class="btn slim" data-action="forecast-fetch">Fetch now</button>
      </div>
      <div class="ops-panel">
        <h3>OTA</h3>
        <p>${esc(ota.running_label || 'unknown')} / subtype ${ota.running_subtype ?? '-'}</p>
        <p class="${ota.pending_verify ? 'warn' : 'ok'}">${esc(ota.state || 'undefined')}</p>
        <p>${Math.round(Number(ota.running_slot_size || 0) / 1024)} KB slot</p>
        <p class="${ota.running_slot_size && ota.configured_slot_size && ota.running_slot_size !== ota.configured_slot_size ? 'warn' : 'muted'}">Configured ${Math.round(Number(ota.configured_slot_size || 0) / 1024)} KB</p>
      </div>
      <div class="ops-panel">
        <h3>Weighted temperature</h3>
        <p>${weighted.available ? fmtC(weighted.value_c) : 'missing'} from ${weighted.contributing_rooms || 0} zones</p>
        <p>Comfort demand ${fmtValue(comfort.demand_c, ' C')} across ${comfort.demand_zones || 0} zones</p>
        <p>Driver ${esc(driver.name || driver.room_id || d.strategy?.driver_room || '-')} ${driver.priority != null ? `/ P${driver.priority}` : ''}</p>
      </div>
      <div class="ops-panel">
        <h3>Schedule</h3>
        <p class="${schedule.time_valid ? 'ok' : 'warn'}">${schedule.time_valid ? `${schedule.active_zones || 0} active` : 'time missing'}</p>
        <p>${esc(schedule.driver_name || schedule.driver_room_id || '-')} ${schedule.driver_priority ? `/ P${schedule.driver_priority}` : ''}</p>
        <p>${schedule.driver_setpoint_c ? fmtC(schedule.driver_setpoint_c) : '-'}</p>
      </div>
      <div class="ops-panel">
        <h3>Learning</h3>
        <p>${learning.zones_with_history || 0} zones, ${learning.total_samples || 0} samples</p>
        <p>Calling ${Math.round(Number(learning.calling_ratio || 0) * 100)}%</p>
        <p>${learning.warming_zones || 0} warming / ${learning.cooling_zones || 0} cooling, avg ${fmtValue(learning.average_delta_c_per_h, ' C/h')}</p>
      </div>
      <div class="ops-panel">
        <h3>Recovery actions</h3>
        <select class="input mini-input" id="recovery-room">${recoveryOptions || '<option value="">No mapped zones</option>'}</select>
        <div class="action-row">
          <button class="btn slim" data-motor-action="reset_fault">Reset fault</button>
          <button class="btn slim" data-motor-action="reset_learned">Reset learned</button>
          <button class="btn slim danger" data-motor-action="relearn">Relearn</button>
        </div>
      </div>
      <div class="ops-panel">
        <h3>Screen</h3>
        <p>${d.screen || 'overview-only'}</p>
      </div>
    </div>
  </section>`;
}

export function bindActions(root) {
  root.querySelector('[data-action="refresh"]')?.addEventListener('click', () => runAction(refreshAll));
  const getNodeHost = () => root.querySelector('#node-host')?.value?.trim() || '';
  const refreshAfterNodeChange = () => refreshSection(state.section === 'settings' ? 'settings' : 'manifolds');
  const probeNodeHost = (host) => api.scanNodes(nodeProbePayload(host)).then((result) => {
    patch({ scanResult: result });
    return result;
  });
  const addNodeHost = (host) => probeNodeHost(host)
    .catch((error) => {
      patch({ scanResult: { scan: 'probe', discovery: 'manual_probe', found: [{ id: host, hostname: host, reachable: false, stale: true, source: 'manual_entry', error: error.message || String(error) }] } });
      return { found: [] };
    })
    .then((result) => {
      const candidate = result?.found?.[0] || {};
      return api.addNode(nodePayloadFromCandidate(host, candidate));
    })
    .then(refreshAfterNodeChange);
  root.querySelectorAll('[data-discard-section]').forEach((btn) => {
    btn.addEventListener('click', () => runAction(() => refreshSection(btn.dataset.discardSection)));
  });
  root.querySelectorAll('[data-edit-zone-row]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const zone = state.zones[Number(btn.dataset.editZoneRow)];
      patch({ zoneEditRoomId: state.zoneEditRoomId === zone?.room_id ? '' : (zone?.room_id || '') });
    });
  });
  root.querySelectorAll('[data-cancel-zone-edit]').forEach((btn) => {
    btn.addEventListener('click', () => patch({ zoneEditRoomId: '' }));
  });
  root.querySelectorAll('[data-zone-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('[data-zone-index]');
      const zone = state.zones[Number(panel?.dataset.zoneIndex)];
      const setpoint = Number(btn.dataset.zoneTarget);
      if (!zone?.room_id || !Number.isFinite(setpoint)) return;
      runAction(() => api.saveComfort(zone.room_id, {
        comfort_setpoint_c: setpoint,
        comfort_bias_c: Number(zone.comfort?.bias_c || 0),
        priority: Number(zone.comfort?.priority || 1),
      }).then(() => refreshSection('manifolds')));
    });
  });
  root.querySelectorAll('[data-save-zone-mapping]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.saveZoneMapping);
      const zone = state.zones[index];
      const panel = btn.closest('[data-zone-index]');
      const field = (name) => panel?.querySelector(`[data-zone-field="${name}"]`);
      const name = field('name')?.value?.trim() || zone?.name || zone?.room_id;
      const node_index = Number(field('node')?.value);
      const zone_index = Math.max(0, Number(field('zone')?.value || 1) - 1);
      if (!zone?.room_id || !name || !Number.isInteger(node_index) || !Number.isInteger(zone_index)) return;
      runAction(() => api.saveZone(zone.room_id, { name, node_index, zone_index })
        .then(() => refreshSection('manifolds')));
    });
  });
  root.querySelectorAll('[data-save-zone-weather]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.saveZoneWeather);
      const zone = state.zones[index];
      const panel = btn.closest('[data-zone-index]');
      const exterior_walls = [['north', 1], ['east', 2], ['south', 4], ['west', 8]]
        .reduce((mask, [key, bit]) => mask + (panel?.querySelector(`[data-zone-wall="${key}"]`)?.checked ? bit : 0), 0);
      const forecast = zone?.forecast || {};
      if (!zone?.room_id) return;
      runAction(() => api.saveForecastProfile(zone.room_id, {
        exterior_walls,
        wind_exposure: Number(forecast.wind_exposure ?? 0.5),
        solar_gain: Number(forecast.solar_gain ?? 0.3),
        thermal_lead_h: Number(forecast.thermal_lead_h ?? 4),
        max_offset_c: Number(forecast.max_offset_c ?? 1.5),
      }).then(() => refreshSection('manifolds')));
    });
  });
  root.querySelectorAll('[data-save-zone-schedule]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.saveZoneSchedule);
      const zone = state.zones[index];
      const panel = btn.closest('[data-zone-index]');
      const field = (name) => panel?.querySelector(`[data-zone-field="${name}"]`);
      const start_min = parseClock(field('schedule-start')?.value, 360);
      const end_min = parseClock(field('schedule-end')?.value, 1320);
      const setpoint_c = Number(field('schedule-setpoint')?.value);
      const enabled = field('schedule-enabled')?.checked ? 1 : 0;
      if (!zone?.room_id || !Number.isFinite(setpoint_c)) return;
      runAction(() => api.saveSchedule(zone.room_id, {
        enabled, day_mask: Number(zone.schedule?.day_mask || 127), start_min, end_min, setpoint_c,
      }).then(() => refreshSection('manifolds')));
    });
  });
  root.querySelectorAll('[data-save-zone-row]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.saveZoneRow);
      const zone = state.zones[index];
      const row = btn.closest('[data-zone-index]');
      if (!zone || !row || !zone.room_id) return;
      const field = (name) => row.querySelector(`[data-zone-field="${name}"]`);
      const name = field('name')?.value?.trim() || zone.room_id;
      const nodeIndex = Number(field('node')?.value || 0);
      const zoneIndex = Math.max(0, Number(field('zone')?.value || 1) - 1);
      const comfort = Number(field('comfort')?.value);
      const bias = Number(field('bias')?.value || 0);
      const priority = Number(field('priority')?.value || 1);
      const startMin = parseClock(field('schedule-start')?.value, 360);
      const endMin = parseClock(field('schedule-end')?.value, 1320);
      const setpoint = Number(field('schedule-setpoint')?.value);
      const dayMask = Number(zone.schedule?.day_mask || 127);
      const enabled = field('schedule-enabled')?.checked ? 1 : 0;
      const exterior_walls = [
        ['north', 1],
        ['east', 2],
        ['south', 4],
        ['west', 8],
      ].reduce((mask, [key, bit]) => mask + (row.querySelector(`[data-zone-wall="${key}"]`)?.checked ? bit : 0), 0);
      const wind_exposure = levelValue(field('forecast-wind-level')?.value || 'normal', 'wind');
      const solar_gain = levelValue(field('forecast-solar-level')?.value || 'normal', 'solar');
      const thermal_lead_h = Number(field('forecast-lead')?.value || 4);
      if (!Number.isFinite(comfort) || !Number.isFinite(bias) || !Number.isFinite(setpoint) ||
          !Number.isFinite(exterior_walls) || !Number.isFinite(wind_exposure) ||
          !Number.isFinite(solar_gain) || !Number.isFinite(thermal_lead_h)) {
        patch({ error: 'Zone values must be numeric' });
        return;
      }
      runAction(() => api.saveZone(zone.room_id, { name, node_index: nodeIndex, zone_index: zoneIndex })
        .then(() => api.saveComfort(zone.room_id, { comfort_setpoint_c: comfort, comfort_bias_c: bias, priority }))
        .then(() => api.saveSchedule(zone.room_id, { enabled, day_mask: dayMask, start_min: startMin, end_min: endMin, setpoint_c: setpoint }))
        .then(() => api.saveForecastProfile(zone.room_id, { exterior_walls, wind_exposure, solar_gain, thermal_lead_h }))
        .then(() => patch({ zoneEditRoomId: '' }))
        .then(() => refreshSection('zones')));
    });
  });
  root.querySelector('[data-action="scan"]')?.addEventListener('click', () => runAction(() => api.scanNodes().then((result) => {
    patch({ scanResult: result });
    return refreshAfterNodeChange();
  })));
  root.querySelectorAll('[data-action="refresh-node-names"]').forEach((btn) => {
    btn.addEventListener('click', () => runAction(() => refreshSection('manifolds').then(() => refreshSection('rooms'))));
  });
  root.querySelectorAll('[data-save-node-profile]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.saveNodeProfile;
      const input = Array.from(root.querySelectorAll('[data-node-name]')).find((el) => el.dataset.nodeName === id);
      const name = input?.value?.trim();
      if (!id || !name) {
        patch({ error: 'Manifold name is required' });
        return;
      }
      runAction(() => api.saveNodeProfile(id, { name }).then(refreshAll));
    });
  });
  root.querySelector('[data-action="forecast-fetch"]')?.addEventListener('click', () => runAction(() => api.fetchForecast().then(() => {
    refreshSection('forecast');
    setTimeout(() => refreshSection('forecast'), 6000);
    setTimeout(() => refreshSection('forecast'), 18000);
  })));
  root.querySelector('[data-action="save-forecast-location"]')?.addEventListener('click', () => {
    const latText = root.querySelector('#forecast-lat')?.value?.trim() || '';
    const lonText = root.querySelector('#forecast-lon')?.value?.trim() || '';
    const latitude = Number(latText);
    const longitude = Number(lonText);
    if (!latText || !lonText || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      patch({ error: 'Latitude and longitude are required' });
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      patch({ error: 'Forecast location is outside valid latitude/longitude range' });
      return;
    }
    if (Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001) {
      patch({ error: 'Forecast location cannot be 0,0' });
      return;
    }
    runAction(() => api.saveForecast({ latitude, longitude, source: 'manual' }).then(refreshAll));
  });
  root.querySelector('[data-action="save-weather-settings"]')?.addEventListener('click', () => {
    const value = Number(root.querySelector('#weather-max-boost')?.value);
    if (!Number.isFinite(value) || value < 0 || value > 5) {
      patch({ error: 'Weather boost cap must be between 0 and 5 C' });
      return;
    }
    runAction(() => api.saveWeather({ max_boost_c: value }).then(refreshAll));
  });
  root.querySelector('[data-action="geo"]')?.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      runAction(() => api.saveForecast({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, source: 'browser' }).then(refreshAll));
    }, (error) => patch({ error: error.message || 'Browser location failed' }));
  });
  root.querySelector('[data-action="save-settings"]')?.addEventListener('click', () => {
    const data = {};
    const nameEl = root.querySelector('#settings-name');
    const installEl = root.querySelector('#settings-install-id');
    const siteEl = root.querySelector('#settings-site-label');
    if (nameEl) data.name = nameEl.value.trim();
    if (installEl) data.install_id = installEl.value.trim();
    if (siteEl) data.site_label = siteEl.value.trim();
    runAction(() => api.saveSettings(data).then(refreshAll));
  });
  root.querySelector('[data-action="save-heat-source"]')?.addEventListener('click', () => {
    const host = root.querySelector('#heat-source-host')?.value?.trim() || '';
    const port = Number(root.querySelector('#heat-source-port')?.value);
    const weighted_temperature_variable = root.querySelector('#heat-source-variable')?.value?.trim() || '';
    const push_interval_s = Number(root.querySelector('#heat-source-interval')?.value);
    const enabled = root.querySelector('#heat-source-enabled')?.checked ? 1 : 0;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 ||
        !/^[A-Za-z0-9_-]+$/.test(weighted_temperature_variable) ||
        !Number.isInteger(push_interval_s) || push_interval_s < 5 || push_interval_s > 3600) {
      patch({ error: 'Enter a valid address, port, weighted temperature variable, and push interval' });
      return;
    }
    runAction(() => api.saveHeatSource({ enabled, host, port, weighted_temperature_variable, push_interval_s })
      .then(() => refreshSection('heat-source')));
  });
  root.querySelector('[data-action="push-heat-source"]')?.addEventListener('click', () => {
    runAction(() => api.pushHeatSource().then(() => {
      setTimeout(() => refreshSection('heat-source'), 18000);
    }));
  });
  root.querySelector('[data-action="add-node"]')?.addEventListener('click', () => {
    const host = getNodeHost();
    if (host) runAction(() => addNodeHost(host));
  });
  root.querySelector('[data-action="probe-node"]')?.addEventListener('click', () => {
    const host = getNodeHost();
    if (host) runAction(() => probeNodeHost(host));
  });
  root.querySelectorAll('[data-remove-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm(`Remove ${btn.dataset.removeNode}?`)) runAction(() => api.removeNode(btn.dataset.removeNode).then(refreshAll));
    });
  });
  root.querySelectorAll('[data-trust-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const trust = btn.dataset.trustValue;
      const confirmToken = trust === 'trusted' ? btn.dataset.trustConfirm : '';
      runAction(() => api.trustNode(btn.dataset.trustNode, trust, confirmToken).then(refreshAll));
    });
  });
  root.querySelectorAll('[data-add-probed-host]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hostname = btn.dataset.addProbedHost || '';
      const ip = btn.dataset.addProbedIp || '';
      const pairing_fingerprint = btn.dataset.addProbedFingerprint || '';
      const node_id = btn.dataset.addProbedId || undefined;
      if (hostname || ip) runAction(() => api.addNode({ node_id, hostname, ip, pairing_fingerprint }).then(refreshAfterNodeChange));
    });
  });
  root.querySelectorAll('[data-command-room]').forEach((btn) => {
    btn.addEventListener('click', () => runAction(() => api.setpointCommand(btn.dataset.commandRoom, { offset_c: 0.5, ttl_s: 2700, reason: 'dashboard quick boost' }).then(refreshAll)));
  });
  root.querySelectorAll('[data-motor-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const roomId = btn.dataset.motorRoom || root.querySelector('#recovery-room')?.value;
      if (!roomId) return;
      const action = btn.dataset.motorAction;
      if (confirm(`${btn.textContent.trim()} for ${roomId}?`)) {
        runAction(() => api.motorAction(roomId, { action, confirm: action }).then(refreshAll));
      }
    });
  });
  root.querySelector('[data-action="reset-registry"]')?.addEventListener('click', () => {
    if (confirm('Reset Lune Touch registry, zone mappings and command ledger? Forecast location is kept.')) runAction(() => api.resetRegistry().then(refreshAll));
  });
}
