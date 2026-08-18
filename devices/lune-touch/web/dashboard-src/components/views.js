import { api, refreshAll, refreshSection } from '../core/api.js';
import { patch, state } from '../core/store.js';

const runAction = (action) => {
  patch({ error: '' });
  Promise.resolve()
    .then(action)
    .then(() => window.dispatchEvent(new Event('lune-touch-write-success')))
    .catch((error) => patch({ error: error.message || String(error) }));
};

const runNodeAction = (message, action) => {
  patch({ error: '', nodeActivity: message });
  Promise.resolve()
    .then(action)
    .then(() => window.dispatchEvent(new Event('lune-touch-write-success')))
    .catch((error) => patch({ error: error.message || String(error) }))
    .finally(() => patch({ nodeActivity: '' }));
};

const fmtC = (value) => value == null || Number.isNaN(value) ? '--.- C' : `${Number(value).toFixed(1)} C`;
const fmtAuthority = (value) => ({
  touch_normal: 'Touch normal', touch_degraded: 'Touch degraded',
  v6_fallback_pending: 'V6-A fallback pending', v6_fallback_active: 'V6-A fallback active',
  touch_recovery_pending: 'Recovery pending', no_publisher: 'No publisher', conflict: 'Conflict',
}[value] || 'No publisher');
const fmtOdinOperation = (value) => ({
  1: 'DHW on',
  2: 'Heating on',
  3: 'Cooling on',
  255: 'Unavailable',
}[Math.round(Number(value))] || 'Off');
const fmtCoverage = (physical = {}) => {
  const ratio = Number(physical.coverage_ratio);
  const coverage = Number.isFinite(ratio) ? `${Math.round(ratio * 100)}% coverage` : 'coverage unknown';
  const expected = Number(physical.expected_manifolds || 0);
  return expected ? `${coverage} / ${physical.contributing_manifolds || 0} of ${expected} manifolds` : coverage;
};
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
  verify_node_identity: 'Approve control on V6',
  trust_node: 'Approve control on V6',
  review_v6_zones: 'Check V6 zones',
  wait_for_fresh_zone_poll: 'Wait for zone data',
  set_forecast_location: 'Set weather location',
  ready: 'Ready',
}[action] || action || 'unknown');
const commissioningTarget = (action) => ({
  add_node: ['manifolds', 'Open manifolds'],
  verify_node_identity: ['manifolds', 'Open manifolds'],
  trust_node: ['manifolds', 'Open manifolds'],
  fix_node_poll: ['manifolds', 'Open manifolds'],
  review_v6_zones: ['manifolds', 'Open manifolds'],
  wait_for_fresh_zone_poll: ['diagnostics', 'Open diagnostics'],
  set_forecast_location: ['weather', 'Open weather'],
}[action] || ['diagnostics', 'Open diagnostics']);
const commissioningActionButton = (action) => {
  if (!action || action === 'ready') return '<button class="btn slim" data-section="diagnostics">Open diagnostics</button>';
  const [section, label] = commissioningTarget(action);
  return `<button class="btn slim" data-section="${section}">${label}</button>`;
};
const fmtEventSource = (source) => source === 'commissioning' ? 'installation' : (source || 'touch');
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
const roomsOutsideTarget = (zones = []) => {
  const rooms = new Map();
  zones.forEach((zone) => {
    const roomId = zone.room_id || `${zone.node_index}:${zone.zone_index}`;
    const current = Number(zone.temperature_c);
    const target = selectedRoomTarget(zone);
    const deficit = target - current;
    const existing = rooms.get(roomId);
    if (!existing || deficit > existing.deficit_c) {
      rooms.set(roomId, { name: zone.name || roomId, deficit_c: deficit, fresh: zone.fresh !== false && zone.status !== 'stale' });
    }
  });
  return Array.from(rooms.values()).filter((room) => room.fresh && room.deficit_c >= 0.5)
    .sort((a, b) => b.deficit_c - a.deficit_c);
};
const logicalRooms = (rooms = [], zones = []) => {
  const grouped = new Map();
  rooms.forEach((room) => grouped.set(room.room_id, { ...room, loops: [] }));
  zones.forEach((zone) => {
    const roomId = zone.room_id || `${zone.node_index}:${zone.zone_index}`;
    if (!grouped.has(roomId)) grouped.set(roomId, {
      room_id: roomId,
      name: zone.name || roomId,
      loop_count: 0,
      area_m2: zone.room?.total_area_m2,
      include_in_house_temperature: zone.room?.include_in_house_temperature,
      loops: [],
    });
    grouped.get(roomId).loops.push(zone);
  });
  return Array.from(grouped.values()).map((room) => ({ ...room, loop_count: room.loops.length || room.loop_count || 0 }));
};
const sensorFreshness = (loops = []) => {
  const fresh = loops.filter((loop) => loop.fresh && loop.status !== 'stale').length;
  return `${fresh}/${loops.length} fresh`;
};
const sensorBattery = (loops = []) => {
  const values = loops.map((loop) => Number(loop.sensor?.battery_pct ?? loop.battery_pct)).filter(Number.isFinite);
  return values.length ? `${Math.round(Math.min(...values))}% battery` : 'battery not reported';
};
const roomRepresentative = (room) => room.loops.find((loop) => loop.fresh && Number.isFinite(Number(loop.temperature_c))) || room.loops[0] || {};
const roomTrend = (room) => {
  const delta = Number(roomRepresentative(room).history?.last_delta_c_per_h);
  return Number.isFinite(delta) ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)} C/h` : 'trend learning';
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
    return `<div class="chart-card"><div class="chart-head"><span class="chart-title">Forecast / preload</span><span class="chart-sub">no cache</span></div><svg class="forecast-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="No weather forecast is available"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" class="chart-empty">Fetch weather to populate forecast graph</text></svg></div>`;
  }
  const x = (index) => left + (hours.length <= 1 ? 0 : index / (hours.length - 1)) * plotW;
  const decisionStartIndex = clamp(Number(forecast.cache?.decision_start_index), 0, Math.max(0, hours.length - 1));
  const peakHourIndex = (peakInHours) => clamp(decisionStartIndex + Math.round(peakInHours), 0, hours.length - 1);
  const hourLabel = (hour, index) => {
    const timestamp = Number(hour.timestamp_s);
    if (Number.isFinite(timestamp) && timestamp > 1700000000) {
      return new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
        .format(new Date(timestamp * 1000));
    }
    return `+${hour.h ?? index}h`;
  };
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
    return `<text x="${tx}" y="${plotB + 18}" text-anchor="middle" class="chart-hour">${esc(hourLabel(hour, index))}</text>`;
  }).join('');
  const preloadMarkers = activeDecisions.map((decision, index) => {
    const targetHour = Number(decision.peak_in_h);
    const markerX = x(peakHourIndex(targetHour));
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
    <svg class="forecast-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${hours.length}-hour forecast of temperature, wind, and solar gain${activeDecisions.length ? ` with ${activeDecisions.length} preload markers` : ''}">
      ${grid}<line x1="${left}" y1="${plotB}" x2="${left + plotW}" y2="${plotB}" class="chart-axis"></line>${hourTicks}
      ${solarArea ? `<path d="${solarArea}" fill="rgba(255,193,77,.10)" stroke="none"></path>` : ''}
      <path d="${smoothPath(points.solar)}" fill="none" stroke="var(--series-solar)" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 4"></path>
      <path d="${smoothPath(points.temp)}" fill="none" stroke="var(--series-cool)" stroke-width="2.4" stroke-linecap="round"></path>
      <path d="${smoothPath(points.wind)}" fill="none" stroke="var(--series-warm)" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="8 3"></path>
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

const comfortDefault = (z) => {
  const candidates = [z.comfort?.setpoint_c, z.setpoint_c, 21];
  const value = candidates.map(Number).find((candidate) => Number.isFinite(candidate) && candidate >= 5);
  return value ?? 21;
};

const selectedRoomTarget = (z) => {
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
  const returnLabel = state.section === 'rooms' || state.section === 'zones' ? 'Back to zones' : 'Back to manifolds';
  const seenRooms = new Set();
  const zoneOptions = state.zones.filter((zone) => {
    if (!zone.room_id || seenRooms.has(zone.room_id)) return false;
    seenRooms.add(zone.room_id);
    return true;
  }).map((zone) => `<option value="${esc(zone.room_id)}" ${zone.room_id === z.room_id ? 'selected' : ''}>${esc(zone.name || zone.room_id)}</option>`).join('');
  return `<section class="view zone-subscreen" data-zone-index="${index}">
    <div class="section-head zone-detail-navigation"><div><button class="btn slim" data-cancel-zone-edit>‹ ${returnLabel}</button><div><h2>${esc(z.name || z.room_id)}</h2><span class="note">${esc(nodeLabel(z.node_index))} / Z${Number(z.zone_index) + 1}</span></div></div><label class="zone-detail-picker"><span>Zone</span><select class="input" data-zone-picker aria-label="Select zone">${zoneOptions}</select></label></div>
    <section class="zone-target-card">
      <div><span class="chart-title">Target temperature</span><div class="target-stepper"><button class="spb" data-zone-target="${(comfortSetpoint - 0.5).toFixed(1)}">−</button><strong>${fmtC(comfortSetpoint)}</strong><button class="spb" data-zone-target="${(comfortSetpoint + 0.5).toFixed(1)}">+</button></div><small>Touch owns zone intent. Lune V6 reports its locally applied target and remains safe offline.</small></div>
      <div class="zone-live-facts"><div><span>Current</span><strong>${fmtC(z.temperature_c)}</strong></div><div><span>Valve</span><strong>${fmtValue(z.valve_pct, '%')}</strong></div><div><span>Status</span><strong class="${statusClass(z.status)}">${esc(z.status || 'unknown')}</strong></div></div>
    </section>
    <div class="zone-subgrid">
      <section class="settings-panel settings-section">
        <div class="settings-section-head"><div><h3>Physical zone</h3><p class="note">Name and valve output are imported automatically from V6.</p></div></div>
        <div class="settings-facts">
          <div><span>Name</span><strong>${esc(z.name || z.room_id)}</strong><small>Managed on V6</small></div>
          <div><span>Manifold</span><strong>${esc(nodeLabel(z.node_index))}</strong><small>Connected automatically</small></div>
          <div><span>Output</span><strong>Z${Number(z.zone_index || 0) + 1}</strong><small>Managed on V6</small></div>
        </div>
      </section>
      <section class="settings-panel settings-section">
        <div class="settings-section-head"><div><h3>Exterior walls</h3><p class="note">Saved atomically with the zone schedule and comfort intent.</p></div><button class="btn slim" data-save-room="${index}">Save zone</button></div>
        <div class="field-grid four walls-grid zone-wall-grid">
          ${[['north', 1, 'North'], ['east', 2, 'East'], ['south', 4, 'South'], ['west', 8, 'West']].map(([key, bit, label]) => `<label class="check mini-check"><input data-zone-wall="${key}" type="checkbox" ${walls & bit ? 'checked' : ''}> ${label}</label>`).join('')}
        </div>
      </section>
      <section class="settings-panel settings-section wide">
        <div class="settings-section-head"><div><h3>Touch schedule</h3><p class="note">Zone intent is saved atomically with weather and inclusion settings.</p></div><button class="btn slim" data-save-room="${index}">Save zone</button></div>
        <div class="field-grid schedule zone-schedule-grid">
          <label class="check mini-check"><input data-zone-field="schedule-enabled" type="checkbox" ${scheduleValues.enabled ? 'checked' : ''}> Enabled</label>
          <label>Start<input class="input" data-zone-field="schedule-start" type="time" value="${fmtClock(scheduleValues.start)}"></label>
          <label>End<input class="input" data-zone-field="schedule-end" type="time" value="${fmtClock(scheduleValues.end)}"></label>
          <label>Target<input class="input" data-zone-field="schedule-setpoint" type="number" step="0.5" min="5" max="35" value="${Number(scheduleValues.setpoint).toFixed(1)}"></label>
        </div>
      </section>
      <details class="settings-panel settings-section wide zone-editor-advanced">
        <summary>Advanced zone model</summary>
        <p class="note">Use these physical inputs only when the commissioning record changes. Comfort priority never changes the physical house-temperature weighting.</p>
        <div class="settings-form-grid">
          <label>Zone area (m²)<input class="input" data-zone-field="total-area" type="number" min="1" max="500" step="0.1" value="${Number(z.room?.total_area_m2 || 1).toFixed(1)}"></label>
          <label>Physical weight (m²)<input class="input" data-zone-field="physical-weight" type="number" min="1" max="500" step="0.1" value="${Number(z.room?.physical_weight || z.room?.total_area_m2 || 1).toFixed(1)}"></label>
          <label class="check"><input data-zone-field="include-physical" type="checkbox" ${z.room?.include_in_house_temperature === false ? '' : 'checked'}> Include in physical house temperature</label>
          <label>Wind exposure<select class="input" data-zone-field="forecast-wind-level">${exposureOptions(exposureLevel(z.forecast?.wind_exposure, 'wind'), 'wind')}</select></label>
          <label>Solar gain<select class="input" data-zone-field="forecast-solar-level">${exposureOptions(exposureLevel(z.forecast?.solar_gain, 'solar'), 'solar')}</select></label>
        </div>
        <p class="note">Thermal estimate: ${esc(fmtThermal(z.thermal_model || {}))}. Wind and solar exposure are configured with the zone’s exterior walls above. Physical names and outputs remain owned by V6.</p>
        <div class="action-row"><button class="btn slim" data-save-room="${index}">Save advanced zone model</button><button class="btn slim" data-section="heat-source">Open heat-source diagnostics</button></div>
      </details>
    </div>
  </section>`;
}

function manifoldZoneRow(z, index) {
  const source = `${nodeLabel(z.node_index)} / Z${Number(z.zone_index) + 1}`;
  const status = z.status || 'unknown';
  return `<article class="manifold-zone-row ${statusClass(status)}" role="listitem">
    <div class="manifold-zone-identity"><strong>${esc(z.name || z.room_id)}</strong><small>${esc(source)} · ${esc(z.room_id || '')}</small></div>
    <div class="manifold-zone-reading"><small>Current</small><strong>${fmtC(z.temperature_c)}</strong><span class="${statusClass(status)}"><i aria-hidden="true"></i>${esc(status)}</span></div>
    <div class="manifold-zone-measure"><small>Target</small><strong>${fmtC(z.setpoint_c ?? comfortDefault(z))}</strong></div>
    <div class="manifold-zone-measure"><small>Valve</small><strong>${fmtValue(z.valve_pct, '%')}</strong></div>
    <button class="manifold-zone-open" data-edit-zone-row="${index}" aria-label="Open ${esc(z.name || z.room_id)} settings"><span aria-hidden="true">›</span></button>
  </article>`;
}

function logicalRoomCard(room) {
  const representative = roomRepresentative(room);
  const resolver = representative.resolver || {};
  const schedule = representative.schedule || {};
  const thermal = representative.thermal_model || {};
  const command = resolver.command_source && resolver.command_source !== 'none'
    ? `${resolver.command_source} ${Number(resolver.command_offset_c || 0) >= 0 ? '+' : ''}${fmtValue(resolver.command_offset_c, ' C')}`
    : 'no temporary override';
  const allFresh = room.loops.length > 0 && room.loops.every((loop) => loop.fresh && loop.status !== 'stale');
  const current = Number(representative.temperature_c);
  // The row shows the logical-zone target selected by the user. Resolver output
  // can contain temporary and learned modifiers and belongs in Zone details.
  const target = selectedRoomTarget(representative);
  const hasTemperature = Number.isFinite(current);
  const difference = hasTemperature && Number.isFinite(target) ? target - current : null;
  const status = !hasTemperature
    ? { tone: 'warn', title: 'No temperature', detail: 'Sensor data is unavailable' }
    : !allFresh
      ? { tone: 'warn', title: 'Sensor coverage incomplete', detail: `${sensorFreshness(room.loops)} reporting` }
      : difference >= 0.5
        ? { tone: 'warn', title: `${difference.toFixed(1)} C below target`, detail: 'Heating may be required' }
        : difference <= -0.5
          ? { tone: 'neutral', title: `${Math.abs(difference).toFixed(1)} C above target`, detail: 'No heat required' }
          : { tone: 'ok', title: 'On target', detail: 'Comfort is on track' };
  const area = Number(room.area_m2 || representative.room?.total_area_m2 || 0);
  const metadata = [room.room_id, area > 0 ? `${area.toFixed(0)} m²` : '', `${room.loop_count} loop${room.loop_count === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
  const roomName = room.name || room.room_id;
  return `<article class="logical-room-card room-row ${status.tone}" role="listitem">
    <div class="room-row-primary">
      <div class="room-identity"><strong>${esc(roomName)}</strong><span>${esc(metadata)}</span></div>
      <div class="room-comfort">
        <span class="room-value ${hasTemperature ? '' : 'unavailable'}">${fmtC(representative.temperature_c)}</span>
        <span class="room-state ${status.tone}"><i aria-hidden="true"></i>${esc(status.title)}</span>
        <small>${esc(hasTemperature ? roomTrend(room) : status.detail)}</small>
      </div>
      <div class="room-target"><span>Target</span><strong>${fmtC(target)}</strong><small>${esc(fmtSchedule(schedule))}</small></div>
      <button class="room-open-button" data-open-room="${esc(room.room_id)}" aria-label="Open target and schedule for ${esc(roomName)}"><span aria-hidden="true">›</span></button>
    </div>
    <details class="room-details room-disclosure">
      <summary><span>Zone details</span><small>Schedule, resolver and ${room.loop_count} manifold loop${room.loop_count === 1 ? '' : 's'}</small></summary>
      <div class="room-detail-content">
        <dl class="room-detail-facts">
          <div><dt>Sensor</dt><dd class="${allFresh ? 'ok' : 'warn'}">${sensorFreshness(room.loops)}</dd><small>${sensorBattery(room.loops)}</small></div>
          <div><dt>Resolver</dt><dd>${esc(fmtResolver(resolver))}</dd></div>
          <div><dt>Schedule and override</dt><dd>${esc(fmtSchedule(schedule))}</dd><small>${esc(command)}</small></div>
          <div><dt>Recovery</dt><dd>${esc(fmtThermal(thermal))}</dd></div>
        </dl>
        <div class="room-loop-group"><h3>Manifold loops</h3><div class="room-loops">${room.loops.map((loop) => `<div class="room-loop"><span>${esc(nodeLabel(loop.node_index))} / Z${Number(loop.zone_index) + 1}</span><span>${fmtC(loop.temperature_c)} · ${fmtValue(loop.valve_pct, '%')} valve</span><span class="${loop.fresh && loop.status !== 'stale' ? 'ok' : 'warn'}">${esc(loop.status || 'unknown')}</span></div>`).join('')}</div></div>
        <div class="room-quick-actions" aria-label="Quick actions for ${esc(roomName)}"><button class="btn slim" data-command-room="${esc(room.room_id)}">Boost 0.5 C for 45 min</button><button class="btn slim" data-away-room="${esc(room.room_id)}">Set away for 6 hours</button></div>
      </div>
    </details>
  </article>`;
}

export function renderSetup() {
  const commissioning = state.diagnostics?.commissioning || {};
  const ready = commissioning.next_action === 'ready';
  const topics = [
    ['Manifolds and zones', 'Connect V6 manifolds; their zones appear automatically.', 'manifolds'],
    ['Zones and comfort', 'Set zone targets, schedules, temporary boosts, and away periods.', 'rooms'],
    ['Weather preload', 'Review the forecast and see why Touch preheats a zone.', 'weather'],
    ['Heat source publishing', 'Connect the whole-house temperature signal and verify delivery.', 'heat-source'],
    ['Settings', 'Review Touch identity, installation, and recovery preferences.', 'system'],
    ['Diagnostics', 'Inspect commands, polling, firmware, learning, and recovery evidence.', 'diagnostics'],
  ];
  return `<section class="view help-view">
    <div class="section-head"><h2>Help</h2><span class="note">Guidance for daily use and installation</span></div>
    <section class="help-intro"><span class="eyebrow">Lune Touch</span><h2>Comfort coordination without giving up local safety</h2><p>Touch coordinates logical zones, weather preload, and the whole-house signal. Each V6 manifold continues to protect valves and provide safe local heating if Touch is unavailable.</p></section>
    ${ready ? '' : `<section class="help-next-action"><div><span class="eyebrow">Continue installation</span><h3>${esc(fmtNextAction(commissioning.next_action))}</h3><p>${commissioning.reachable_trusted_nodes || 0} manifolds ready · ${commissioning.fresh_zones || 0} fresh zones</p></div>${commissioningActionButton(commissioning.next_action)}</section>`}
    <section class="help-topics" aria-labelledby="help-topics-title"><div class="subsection-head"><div><h2 id="help-topics-title">Topics</h2><p>Open the relevant view to inspect or change the system.</p></div></div><div class="help-topic-list" role="list">
      ${topics.map(([title, description, section]) => `<button class="help-topic-row" role="listitem" data-section="${section}"><span><strong>${title}</strong><small>${description}</small></span><span class="help-topic-chevron" aria-hidden="true">›</span></button>`).join('')}
    </div></section>
    <details class="group-disclosure help-ownership"><summary><span>Who controls what?</span><small>Touch, V6, and Heat Source responsibilities</small></summary><div class="group-disclosure-content ownership-list"><div><strong>Touch</strong><p>Logical zones, schedules, weather preload, distribution, and publishing.</p></div><div><strong>V6 manifolds</strong><p>Valve safety, local clamps, command expiry, and fallback heating.</p></div><div><strong>Heat Source</strong><p>Heat-pump timing, compressor behavior, prices, optimization, and DHW.</p></div></div></details>
  </section>`;
}

function overviewZoneRow(room) {
  const representative = roomRepresentative(room);
  const current = Number(representative.temperature_c);
  const target = selectedRoomTarget(representative);
  const hasTemperature = Number.isFinite(current);
  const fresh = room.loops.length > 0 && room.loops.some((loop) => loop.fresh && loop.status !== 'stale');
  const heating = room.loops.some((loop) => ['heat', 'heating', 'call', 'calling'].includes(String(loop.status || '').toLowerCase()) || Number(loop.valve_pct || 0) > 0);
  const difference = hasTemperature && Number.isFinite(target) ? target - current : null;
  const stateInfo = !hasTemperature || !fresh
    ? ['warn', 'Sensor unavailable']
    : difference >= 0.5
      ? ['warn', `${difference.toFixed(1)} C below target`]
      : heating
        ? ['active', 'Heating']
        : difference <= -0.5
          ? ['neutral', `${Math.abs(difference).toFixed(1)} C above target`]
          : ['ok', 'On target'];
  const roomName = room.name || room.room_id;
  return `<button type="button" class="overview-zone-row ${stateInfo[0]}" data-section="zones" data-open-room="${esc(room.room_id)}" aria-label="Open ${esc(roomName)} zone details">
    <span class="overview-zone-name"><strong>${esc(roomName)}</strong><small>${room.loop_count} manifold loop${room.loop_count === 1 ? '' : 's'}</small></span>
    <span class="overview-zone-value"><small>Temperature</small><strong>${fmtC(representative.temperature_c)}</strong></span>
    <span class="overview-zone-value"><small>Target</small><strong>${fmtC(target)}</strong></span>
    <span class="overview-zone-state"><i aria-hidden="true"></i>${esc(stateInfo[1])}</span>
    <span class="overview-zone-chevron" aria-hidden="true">›</span>
  </button>`;
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
  const physical = state.strategy?.physical || {};
  const quality = physical.quality || (weighted.available ? 'healthy' : 'no coverage');
  const push = heatSource.push || {};
  const authority = state.settings?.authority || {};
  const houseTarget = state.strategy?.house_target || {};
  const odin = forecast.odin_plan || {};
  const commissioning = diagnostics.commissioning || {};
  const rooms = logicalRooms(state.rooms, state.zones);
  const roomsNeedingHeat = roomsOutsideTarget(state.zones);
  const heatSourceHealthy = heatSource.enabled && quality === 'healthy' && push.ok !== false;
  const setupNeeded = commissioning.next_action && commissioning.next_action !== 'ready';
  const comfortNeedsAttention = roomsNeedingHeat.length > 0;
  const houseHealthy = !setupNeeded && !comfortNeedsAttention && !polling.fail && heatSourceHealthy;
  const statusTitle = setupNeeded ? 'Setup needs attention' : comfortNeedsAttention ? 'Zones need heat' : houseHealthy ? 'House is on track' : 'System needs review';
  const statusText = setupNeeded
    ? `${fmtNextAction(commissioning.next_action)} before Touch can coordinate normally.`
    : comfortNeedsAttention
      ? `${roomsNeedingHeat.length} zone${roomsNeedingHeat.length === 1 ? '' : 's'} are below their comfort target.`
      : houseHealthy ? 'Comfort, coverage and heat-source signal are healthy.' : 'Review the operational details before relying on automation.';
  const attentionSection = setupNeeded ? commissioningTarget(commissioning.next_action)[0]
    : comfortNeedsAttention ? 'zones'
      : polling.fail ? 'diagnostics' : heatSourceHealthy ? '' : 'heat-source';
  const attentionTitle = setupNeeded ? fmtNextAction(commissioning.next_action)
    : comfortNeedsAttention ? `Review ${roomsNeedingHeat.length} zone${roomsNeedingHeat.length === 1 ? '' : 's'} below target`
      : polling.fail ? 'Review manifold connectivity' : heatSourceHealthy ? '' : 'Review heat-source publishing';
  const attentionText = setupNeeded ? 'Complete the next installation step before Touch coordinates the house.'
    : comfortNeedsAttention ? 'Open Zones to inspect current temperature, target, and sensor coverage.'
      : polling.fail ? esc(polling.last_error || 'One or more V6 manifolds did not respond.') : heatSourceHealthy ? '' : 'The whole-house physical signal is not ready to publish.';
  const reportingRooms = rooms.filter((room) => Number.isFinite(Number(roomRepresentative(room).temperature_c))).length;
  const systemHealth = polling.fail || Number(commandResults.failed || 0) > 0 ? 'Needs review' : 'Healthy';
  return `<section class="view overview">
    <section class="overview-status" role="status" aria-live="polite">
      <div class="overview-status-main"><span class="eyebrow">House status</span><h2 class="${houseHealthy ? 'ok' : 'warn'}">${statusTitle}</h2><p>${esc(statusText)}</p></div>
      <div class="overview-status-fact"><span class="eyebrow">Physical</span><strong>${physical.has_temperature ? fmtC(physical.temperature_c) : 'Unavailable'}</strong><small>${fmtCoverage(physical)}</small></div>
      <div class="overview-status-fact"><span class="eyebrow">Comfort</span><strong>${summary.calling || 0} calling</strong><small>Target ${houseTarget.available ? fmtC(houseTarget.value_c) : 'unavailable'} · ${roomsNeedingHeat.length} outside</small></div>
      <div class="overview-status-fact"><span class="eyebrow">Manifolds</span><strong>${summary.nodes || 0} connected</strong><small>${summary.stale_nodes || 0} stale · ${reportingRooms}/${rooms.length} zones reporting</small></div>
    </section>
    ${attentionSection ? `<button type="button" class="overview-attention-row" data-section="${attentionSection}"><span><strong>${esc(attentionTitle)}</strong><small>${attentionText}</small></span><span aria-hidden="true">›</span></button>` : ''}
    <div class="overview-dashboard">
      <section class="overview-dashboard-section overview-zones" aria-labelledby="overview-zones-title"><div class="overview-dashboard-head"><div><h2 id="overview-zones-title">Zones</h2><p>Current temperature, comfort target, and immediate state.</p></div><button class="text-action" data-section="zones">View all</button></div>
        <div class="overview-zone-list" role="group" aria-label="Logical zones">${rooms.map(overviewZoneRow).join('') || '<p class="empty-state">No logical zones configured.</p>'}</div>
      </section>
      <section class="overview-dashboard-section overview-forecast" aria-labelledby="overview-forecast-title"><div class="overview-dashboard-head"><div><h2 id="overview-forecast-title">Forecast and preload</h2><p>${activeDecisions.length ? `${activeDecisions.length} active preload decision${activeDecisions.length === 1 ? '' : 's'}.` : 'No forecast-driven changes are active.'}</p></div><button class="text-action" data-section="weather">Weather</button></div>
        ${forecastChart(forecast)}
        ${activeDecisions.length ? `<ul class="overview-preload-list">${activeDecisions.slice(0, 4).map((decision) => `<li><strong>${esc(decision.name || decision.room_id)}</strong><span>+${fmtValue(decision.offset_c, ' C')} · peak in ${decision.peak_in_h}h</span></li>`).join('')}</ul>` : ''}
      </section>
      <section class="overview-dashboard-section overview-coordination" aria-labelledby="overview-coordination-title"><div class="overview-dashboard-head"><div><h2 id="overview-coordination-title">System coordination</h2><p>Publishing, authority, forecast, and command health.</p></div><button class="text-action" data-section="diagnostics">Diagnostics</button></div>
        <dl class="overview-coordination-facts">
          <div><dt>Touch authority</dt><dd>${fmtAuthority(authority.state)}</dd><small>${authority.lease_remaining_s || 0}s · ${esc(authority.reason || 'unconfigured')}</small></div>
          <div><dt>Heat source signal</dt><dd class="${heatSourceHealthy ? 'ok' : 'warn'}">${heatSource.enabled ? 'Enabled' : 'Not configured'}</dd><small>${quality}${weighted.available ? ` · ${fmtC(weighted.value_c)}` : ''}</small></div>
          <div><dt>Heat Source / DHW</dt><dd class="${odin.fresh ? 'ok' : 'warn'}">${odin.enabled ? (odin.fresh ? 'Plan fresh' : 'Plan stale') : 'Not configured'}</dd><small>${fmtOdinOperation(odin.operation_mode_raw)}</small></div>
          <div><dt>System health</dt><dd class="${systemHealth === 'Healthy' ? 'ok' : 'warn'}">${systemHealth}</dd><small>${polling.success || 0} polls · forecast ${forecastStatus.status || summary.forecast_status || 'unknown'} · ${commandResults.failed || 0} failed</small></div>
        </dl>
      </section>
    </div>
  </section>`;
}

export function renderZones() {
  const selectedZoneIndex = state.zones.findIndex((zone) => zone.room_id === state.zoneEditRoomId);
  if (selectedZoneIndex >= 0) return zoneDetailScreen(state.zones[selectedZoneIndex], selectedZoneIndex);
  const rooms = logicalRooms(state.rooms, state.zones);
  const reporting = rooms.filter((room) => {
    const representative = roomRepresentative(room);
    return Number.isFinite(Number(representative.temperature_c)) && room.loops.some((loop) => loop.fresh && loop.status !== 'stale');
  }).length;
  const missingSensors = rooms.length - reporting;
  const belowTarget = rooms.filter((room) => {
    const representative = roomRepresentative(room);
    const current = Number(representative.temperature_c);
    const target = selectedRoomTarget(representative);
    return Number.isFinite(current) && Number.isFinite(target) && target - current >= 0.5;
  }).length;
  const loopCount = rooms.reduce((sum, room) => sum + Number(room.loop_count || 0), 0);
  const summaryTitle = missingSensors
    ? `${missingSensors} zone${missingSensors === 1 ? '' : 's'} need sensor data`
    : belowTarget
      ? `${belowTarget} zone${belowTarget === 1 ? '' : 's'} below target`
      : rooms.length ? 'All reporting zones are on track' : 'No zones configured';
  return `<section class="view rooms-view">
    <div class="section-head"><h2>Zones</h2><span class="note">${rooms.length} zone${rooms.length === 1 ? '' : 's'} · ${reporting} reporting · ${loopCount} manifold loop${loopCount === 1 ? '' : 's'}</span></div>
    ${rooms.length ? `<section class="rooms-summary ${missingSensors || belowTarget ? 'warn' : 'ok'}" role="status" aria-live="polite"><span class="eyebrow">Zone status</span><h2>${summaryTitle}</h2><p>${missingSensors ? 'Connect or restore zone sensors before relying on comfort decisions.' : belowTarget ? 'Review zones below target and adjust only when the current schedule is not appropriate.' : 'Temperatures and targets are available for every configured zone.'}</p></section>
    <div class="room-list" role="list" aria-label="Configured zones">${rooms.map(logicalRoomCard).join('')}</div>`
      : '<section class="rooms-empty"><h2>No zones received</h2><p>Configure and name zones on the V6 manifold. Touch imports them automatically.</p><button class="btn" data-section="manifolds">Open manifolds</button></section>'}
  </section>`;
}

export function renderManifolds() {
  const selectedZoneIndex = state.zones.findIndex((zone) => zone.room_id === state.zoneEditRoomId);
  if (selectedZoneIndex >= 0)
    return zoneDetailScreen(state.zones[selectedZoneIndex], selectedZoneIndex);
  const scan = state.scanResult;
  const nodeActivity = state.nodeActivity;
  const reachable = state.nodes.filter((node) => node.reachable).length;
  const trusted = state.nodes.filter((node) => fmtTrust(node) === 'trusted').length;
  const faulted = state.nodes.filter((node) => node.runtime?.motor_fault).length;
  const needsAttention = faulted || reachable < state.nodes.length || trusted < state.nodes.length;
  const attentionCount = state.nodes.filter((node) => !node.reachable || fmtTrust(node) !== 'trusted' || node.runtime?.motor_fault).length;
  const summaryTitle = !state.nodes.length ? 'No manifolds registered'
    : needsAttention ? `${attentionCount} manifold${attentionCount === 1 ? '' : 's'} need attention`
      : 'All manifolds are ready';
  return `<section class="view manifolds-view">
    <div class="section-head"><h2>Manifolds</h2><div class="section-actions">${nodeActivity ? `<span class="operation-status" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span>${esc(nodeActivity)}</span>` : ''}<button class="btn" data-action="scan"${nodeActivity ? ' disabled' : ''}>Scan</button></div></div>
    <section class="manifold-summary ${needsAttention || !state.nodes.length ? 'warn' : 'ok'}" role="status" aria-live="polite">
      <span class="eyebrow">Connection status</span><h2>${summaryTitle}</h2>
      <p>${state.nodes.length ? `${reachable}/${state.nodes.length} reachable · ${trusted}/${state.nodes.length} approved by V6 · ${state.zones.length} imported zones` : 'Add a V6 manifold to import zone names and telemetry.'}</p>
    </section>
    <details class="group-disclosure manifold-add"${state.nodes.length ? '' : ' open'}>
      <summary><span>Add a manifold</span><small>Scan the network or enter a hostname or IP</small></summary>
      <div class="group-disclosure-content">
        <label class="field-label" for="node-host">Hostname or IP address</label>
        <div class="inline-form manifold-form">
          <input class="input mini-input" id="node-host" placeholder="lune-v6-a.local or 192.168.20.120">
          <button class="btn" data-action="probe-node"${nodeActivity ? ' disabled' : ''}>Probe</button>
          <button class="btn" data-action="add-node"${nodeActivity ? ' disabled' : ''}>Add manually</button>
        </div>
        ${renderScanResults(scan)}
      </div>
    </details>
    <div class="manifold-list" role="list" aria-label="Registered manifolds">${state.nodes.map((n) => {
      const h = n.health || {};
      const r = n.runtime || {};
      const nodeIndex = state.nodes.findIndex((node) => node.id === n.id);
      const recoveryZone = state.zones.find((zone) => Number(zone.node_index) === nodeIndex && zone.room_id);
      const manifoldZones = state.zones.filter((zone) => Number(zone.node_index) === nodeIndex);
      const ready = n.reachable && fmtTrust(n) === 'trusted' && !r.motor_fault;
      return `<article class="manifold-row" role="listitem">
      <details class="manifold-disclosure">
        <summary>
          <span class="manifold-identity"><strong>${esc(n.name || n.id)}</strong><small>${esc(n.hostname || n.ip || 'No address')}</small></span>
          <span class="manifold-state ${ready ? 'ok' : 'warn'}"><i aria-hidden="true"></i><strong>${r.motor_fault ? 'Motor fault' : !n.reachable ? 'Unreachable' : fmtTrust(n) !== 'trusted' ? 'Approval needed on V6' : 'Ready'}</strong><small>${fmtTrust(n) === 'trusted' ? 'control approved' : 'telemetry only'}</small></span>
          <span class="manifold-measure"><small>Fresh zones</small><strong>${h.fresh_zones ?? 0}/${h.imported_zones ?? h.mapped_zones ?? 0}</strong></span>
          <span class="manifold-measure"><small>Calling</small><strong>${h.calling_zones ?? 0}</strong></span>
          <span class="disclosure-chevron" aria-hidden="true">›</span>
        </summary>
        <div class="manifold-detail-content">
          ${!ready ? `<div class="manifold-next-action"><div><strong>${r.motor_fault ? 'Reset the motor fault before normal operation.' : !n.reachable ? 'Check the address and network connection.' : 'Approve this connection on the V6 manifold.'}</strong><span>${esc(n.last_failure || 'Touch can read telemetry now. Open the local V6 Settings view to approve authenticated control.')}</span></div>${r.motor_fault && recoveryZone ? `<button class="btn danger" data-motor-action="reset_fault" data-motor-room="${esc(recoveryZone.room_id)}">Reset fault</button>` : ''}</div>` : ''}
          <dl class="manifold-overview" aria-label="Manifold overview">
            <div><dt>Sensor coverage</dt><dd class="${h.stale_zones ? 'warn' : 'ok'}">${h.fresh_zones ?? 0}/${h.imported_zones ?? h.mapped_zones ?? 0}</dd><small>${h.stale_zones ? `${h.stale_zones} stale` : 'All zones fresh'}</small></div>
            <div><dt>Average temperature</dt><dd>${fmtC(h.avg_temp_c)}</dd><small>Target ${fmtC(h.avg_setpoint_c)}</small></div>
            <div><dt>Heat demand</dt><dd>${h.calling_zones ?? 0} calling</dd><small>${fmtValue(r.avg_valve_pct, '%')} average valve</small></div>
            <div><dt>Operation</dt><dd class="${r.motor_fault || !r.drivers_enabled ? 'warn' : 'ok'}">${r.motor_fault ? 'Motor fault' : r.drivers_enabled ? 'Normal' : 'Drivers off'}</dd><small>${r.active_zones ?? 0} active zones</small></div>
          </dl>
      <section class="manifold-zones"><div class="subsection-head"><div><h3>Zones</h3><p class="note">Names and valve outputs are imported from this V6 manifold.</p></div></div>
        <div class="manifold-zone-list" role="list">${manifoldZones.map((zone) => manifoldZoneRow(zone, state.zones.indexOf(zone))).join('') || '<div class="empty-row">No zones imported yet</div>'}</div>
      </section>
      <section class="device-details" aria-label="Device settings and telemetry">
        <div class="device-details-header"><div><h3>Device settings and telemetry</h3><p>Live manifold status, identity, and local management.</p></div><span>${esc(n.firmware || 'Unknown firmware')} · ${fmtC(r.flow_c)} flow · ${fmtC(r.return_c)} return</span></div>
        <div class="device-details-content">
        <section><h3>Telemetry</h3><dl class="device-telemetry"><div><dt>Flow</dt><dd>${fmtC(r.flow_c)}</dd></div><div><dt>Return</dt><dd>${fmtC(r.return_c)}</dd></div><div><dt>Average valve</dt><dd>${fmtValue(r.avg_valve_pct, '%')}</dd></div><div><dt>Active zones</dt><dd>${r.active_zones ?? 0}</dd></div><div><dt>Drivers</dt><dd>${r.drivers_enabled ? 'On' : 'Off'}</dd></div><div><dt>Control</dt><dd>${fmtTrust(n) === 'trusted' ? 'Approved on V6' : 'Telemetry only'}</dd></div></dl></section>
        <section><h3>Identity</h3><dl class="manifold-facts"><dt>ID</dt><dd>${esc(n.id || '-')}</dd><dt>Firmware</dt><dd>${esc(n.firmware || '-')}</dd><dt>Fingerprint</dt><dd>${esc(n.pairing_fingerprint || '-')}</dd><dt>Last host</dt><dd>${esc(n.last_success_host || '-')}</dd><dt>Last error</dt><dd class="${n.last_failure ? 'warn' : 'muted'}">${esc(n.last_failure || 'None')}</dd></dl></section>
        <section><h3>Management</h3><label class="field-label">Friendly name<input class="input mini-input" data-node-name="${esc(n.id)}" value="${esc(n.name || n.id || '')}"></label><div class="manifold-management-actions"><button class="btn" data-save-node-profile="${esc(n.id)}">Save</button><button class="btn" data-action="refresh-node-names"${nodeActivity ? ' disabled' : ''}>Import names</button>${fmtTrust(n) !== 'paired' && fmtTrust(n) !== 'trusted' ? `<button class="btn" data-trust-node="${esc(n.id)}" data-trust-value="paired" data-trust-confirm=""${nodeActivity ? ' disabled' : ''}>Pair for reading</button>` : ''}</div><button class="text-action danger-text" data-remove-node="${esc(n.id)}">Remove manifold…</button></section>
        </div>
      </section>
        </div>
      </details>
    </article>`;
    }).join('') || '<section class="manifold-empty"><p>No registered manifolds.</p></section>'}</div>
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
  const locationSummary = Number.isFinite(latitude) && Number.isFinite(longitude)
    ? `${location.mode || 'manual'} · ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
    : 'Location not set';
  const commands = f.commands || {};
  const activeDecisions = (f.decisions || []).filter((d) => d.active);
  const forecastHealthy = f.status === 'ok' || f.status === 'cached';
  const statusLabel = `${f.status || 'unknown'}${f.fetch_pending ? ' / pending' : ''}`;
  const weatherHeadline = !forecastHealthy ? 'Forecast needs attention' : activeDecisions.length ? `Preload is active in ${activeDecisions.length} zone${activeDecisions.length === 1 ? '' : 's'}` : 'No preload is needed';
  const weatherSummary = !forecastHealthy ? (f.last_error || 'Fetch a forecast or verify the configured location.') : `${cache.hours || 0} hours available · last fetch ${fmtAge(f.last_fetch_age_s)}`;
  return `<section class="view weather-view">
    <div class="section-head"><h2>Weather</h2><button class="btn" data-action="forecast-fetch">Fetch now</button></div>
    <section class="weather-summary ${forecastHealthy ? 'ok' : 'warn'}" role="status" aria-live="polite"><span class="eyebrow">Forecast status</span><h2>${weatherHeadline}</h2><p>${esc(weatherSummary)}</p></section>
    <section class="weather-primary" aria-labelledby="weather-outlook-title"><div class="subsection-head"><div><h2 id="weather-outlook-title">72-hour outlook</h2><p>Temperature, wind, solar gain, and scheduled preload peaks.</p></div><span>${cache.restored ? 'Restored cache' : 'Live forecast'}</span></div>${forecastChart(f)}</section>
    <section class="preload-section" aria-labelledby="preload-title"><div class="subsection-head"><div><h2 id="preload-title">Preload decisions</h2><p>${activeDecisions.length ? 'Zones are preheated ahead of forecast demand.' : 'Touch is not changing zone demand for the current forecast.'}</p></div></div>
      <div class="preload-list">${activeDecisions.map((d) => `<div class="preload-row"><span><strong>${esc(d.name || d.room_id)}</strong><small>Peak in ${d.peak_in_h} h${fmtDecisionLead(d)}</small></span><span><small>Offset</small><strong>+${fmtValue(d.offset_c, ' C')}</strong></span><span><small>Comfort</small><strong>${fmtC(d.comfort_setpoint_c)}</strong></span></div>`).join('') || '<p class="empty-state">No active preload decisions.</p>'}</div>
    </section>
    <div class="weather-disclosures">
      <details class="group-disclosure"><summary><span>Location and preload limit</span><small>${locationSummary} · max ${fmtValue(maxBoost, ' C')}</small></summary><div class="group-disclosure-content weather-settings-form">
          <div class="field-pair"><label class="field-label" for="forecast-lat">Latitude</label><label class="field-label" for="forecast-lon">Longitude</label></div>
          <div class="inline-form forecast-location">
            <input class="input mini-input" id="forecast-lat" type="number" step="0.000001" placeholder="Latitude" value="${latitudeValue}">
            <input class="input mini-input" id="forecast-lon" type="number" step="0.000001" placeholder="Longitude" value="${longitudeValue}">
            <button class="btn" data-action="save-forecast-location">Apply</button>
            <button class="btn" data-discard-section="forecast">Discard</button>
            <button class="btn" data-action="geo">Use browser</button>
          </div>
          <label class="field-label" for="weather-max-boost">Maximum weather boost</label><div class="inline-form weather-cap-form">
            <input class="input mini-input" id="weather-max-boost" type="number" step="0.1" min="0" max="5" value="${Number.isFinite(maxBoost) ? maxBoost.toFixed(1) : '1.5'}">
            <button class="btn" data-action="save-weather-settings">Save boost cap</button>
          </div>
        </div></details>
      <details class="group-disclosure"><summary><span>Forecast details</span><small>${statusLabel} · ${commands.sent || 0} sent · ${commands.failed || 0} failed</small></summary><div class="group-disclosure-content"><dl class="weather-facts"><div><dt>Fetch</dt><dd class="${forecastHealthy ? 'ok' : 'warn'}">${statusLabel}</dd><small>${f.fetch_pending ? 'Queued for polling' : `Last fetch ${fmtAge(f.last_fetch_age_s)}`}</small></div><div><dt>Forecast range</dt><dd>${cache.hours || 0} hours</dd><small>Minimum ${fmtValue(cache.min_temp_c, ' C')}</small></div><div><dt>Wind and solar</dt><dd>${fmtValue(cache.max_wind_ms, ' m/s')} · ${fmtValue(cache.max_solar_wm2, ' W/m2')}</dd><small>Peak wind ${Math.round(cache.peak_wind_dir_deg || 0)}°</small></div><div><dt>Commands</dt><dd class="${commands.failed ? 'warn' : 'ok'}">${commands.sent || 0} sent · ${commands.failed || 0} failed</dd><small>${commands.skipped || 0} skipped · ${commands.blocked_stale || 0} stale · ${commands.blocked_unreachable || 0} offline · ${commands.blocked_untrusted || 0} trust</small></div></dl>${f.last_error ? `<p class="inline-notice warn">${esc(f.last_error)}</p>` : ''}</div></details>
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
  const sendPreview = source.send_preview || weighted;
  const physical = state.strategy?.physical || {};
  const quality = physical.quality || (weighted.available ? 'healthy' : 'no coverage');
  const push = source.push || {};
  const compatibility = source.compatibility || {};
  const configured = !!source.host;
  const ready = source.enabled && configured && weighted.available && quality === 'healthy';
  const deliveryOk = push.status === 'confirmed';
  const headline = !configured ? 'Connect a heat source'
    : !source.enabled ? 'Publishing is turned off'
      : !sendPreview.available ? 'Waiting for healthy zone coverage'
        : push.has_result && !deliveryOk ? 'The last write needs attention'
          : ready ? 'Whole-house temperature is ready to publish' : 'Publishing is not ready';
  const summary = !configured ? 'Enter the address and variable exposed by the receiving heat source.'
    : !source.enabled ? `Touch is calculating ${sendPreview.available ? fmtC(sendPreview.value_c) : 'a preview'}, but it will not send it.`
      : !sendPreview.available ? `Publishing pauses until physical coverage is healthy. Current quality: ${quality}.`
        : deliveryOk ? `${fmtC(push.confirmed_value_c)} confirmed ${fmtAge(push.confirmation_age_s)} ago.`
          : esc(push.last_error || 'Send a test value to verify the connection.');
  return `<section class="view heat-source-view">
    <div class="section-head"><h2>Heat Source</h2>${ready ? '<button class="btn" data-action="push-heat-source">Send now</button>' : ''}</div>
    <section class="heat-source-summary ${ready && (!push.has_result || deliveryOk) ? 'ok' : 'warn'}" role="status" aria-live="polite"><span class="eyebrow">Publishing status</span><h2>${headline}</h2><p>${summary}</p></section>
    <dl class="heat-source-overview" aria-label="Heat source overview">
      <div><dt>Value</dt><dd>${sendPreview.available ? fmtC(sendPreview.value_c) : 'Unavailable'}</dd><small>${source.enabled ? `${quality} · ${fmtCoverage(physical)}` : 'Preview only'}</small></div>
      <div><dt>Destination</dt><dd>${esc(source.host || 'Not configured')}</dd><small>${esc(source.weighted_temperature_variable || 'No variable')}</small></div>
      <div><dt>Delivery</dt><dd class="${deliveryOk ? 'ok' : push.has_result ? 'warn' : ''}">${push.has_result ? esc(push.status || 'Unreachable') : 'Not sent'}</dd><small>${push.has_result ? `HTTP ${push.http_status || '—'} · ${fmtAge(push.write_age_s)} ago` : 'No write history'}</small></div>
    </dl>
    <div class="heat-source-groups">
      <details class="group-disclosure"${configured ? '' : ' open'}><summary><span>Connection</span><small>${configured ? `${esc(source.host)}:${Number(source.port || 80)} · every ${Number(source.push_interval_s || 30)} s` : 'Address, variable, and publishing interval'}</small></summary><div class="group-disclosure-content">
        <div class="heat-source-form"><label class="check"><input id="heat-source-enabled" type="checkbox" ${source.enabled ? 'checked' : ''}> Enable publishing</label><label>Address<input class="input" id="heat-source-host" value="${esc(source.host || '')}" placeholder="heat-source.local or 192.168.20.120" maxlength="63"></label><label>Port<input class="input" id="heat-source-port" type="number" min="1" max="65535" value="${Number(source.port || 80)}"></label><label>Entity or variable<input class="input" id="heat-source-variable" value="${esc(source.weighted_temperature_variable || '')}" maxlength="47"></label><label>Publish interval (seconds)<input class="input" id="heat-source-interval" type="number" min="5" max="3600" value="${Number(source.push_interval_s || 30)}"></label></div>
        <div class="form-actions"><button class="btn" data-action="save-heat-source">Save connection</button><button class="btn" data-discard-section="heat-source">Discard changes</button></div>
      </div></details>
      <details class="group-disclosure"><summary><span>Publishing details</span><small>${push.failure_streak || 0} consecutive failures · target sync ${esc(compatibility.target_sync || 'unsupported')}</small></summary><div class="group-disclosure-content"><dl class="heat-source-details"><div><dt>Requested</dt><dd>${push.has_result ? fmtC(push.requested_value_c) : '—'}</dd></div><div><dt>Confirmed</dt><dd>${push.has_result ? fmtC(push.confirmed_value_c) : '—'}</dd></div><div><dt>Heat source target</dt><dd>${sendPreview.target_available ? fmtC(sendPreview.target_setpoint_c) : 'Unavailable'}</dd></div><div><dt>Failures</dt><dd>${push.failure_count || 0} total · ${push.failure_streak || 0} consecutive</dd></div><div><dt>Physical temperature</dt><dd>${esc(compatibility.physical_temperature || 'Unconfigured')}</dd></div><div><dt>Operating state</dt><dd>${esc(compatibility.operating_state || 'Unsupported')}</dd></div></dl>${push.last_error ? `<p class="inline-notice warn">${esc(push.last_error)}</p>` : ''}${compatibility.target_blocker ? `<p class="inline-notice warn">${esc(compatibility.target_blocker)}</p>` : ''}</div></details>
      <details class="group-disclosure"><summary><span>How publishing works</span><small>Calculation, confirmation, and safety ownership</small></summary><div class="group-disclosure-content publishing-explainer"><p>Touch sends the area-weighted physical temperature only while zone coverage is healthy. A write is confirmed after the heat source reads back the same value.</p><p>Touch owns zone coordination and publishing. Heat Source owns heat-pump timing and DHW. V6 retains local valve safety, clamps, and fallback heating.</p><button class="text-action" data-section="help">Open Help</button></div></details>
    </div>
  </section>`;
}

export function renderSettings() {
  const settings = state.settings || {};
  const coordinator = settings.coordinator || {};
  const authority = settings.authority || {};
  const authoritySync = authority.v6_sync || {};
  const diagnostics = state.diagnostics || {};
  const ota = diagnostics.ota || {};
  const polling = diagnostics.polling || {};
  const authorityHealthy = authority.state === 'touch_normal' || authority.state === 'v6_fallback_active';
  const serviceHealthy = authorityHealthy && !polling.fail && !ota.pending_verify;
  return `<section class="view service-view">
    <div class="section-head"><h2>Settings</h2></div>
    <section class="service-summary ${serviceHealthy ? 'ok' : 'warn'}" role="status" aria-live="polite"><span class="eyebrow">Coordinator configuration</span><h2>${serviceHealthy ? 'Touch is configured' : 'Configuration needs attention'}</h2><p>${authorityHealthy ? `${fmtAuthority(authority.state)} · ${authority.lease_remaining_s || 0} s lease remaining` : `${fmtAuthority(authority.state)} · ${esc(authority.reason || 'Authority is not configured')}`}</p></section>
    <dl class="service-overview" aria-label="Settings overview"><div><dt>Authority</dt><dd class="${authorityHealthy ? 'ok' : 'warn'}">${fmtAuthority(authority.state)}</dd><small>${esc(authority.reason || 'No current reason')}</small></div><div><dt>V6 polling</dt><dd class="${polling.fail ? 'warn' : 'ok'}">${polling.success || 0} successful</dd><small>${polling.fail || 0} failed</small></div><div><dt>Firmware</dt><dd class="${ota.pending_verify ? 'warn' : ''}">${esc(ota.running_label || 'Unknown')}</dd><small>${esc(ota.state || 'Unknown state')}</small></div></dl>
    <div class="service-groups">
      <details class="group-disclosure"><summary><span>Touch identity</span><small>${esc(coordinator.name || 'Lune Touch')} · generated automatically</small></summary><div class="group-disclosure-content"><p>Installation identity and authentication are created and stored by Lune Touch. They are sent as a local approval proposal when a V6 manifold is added.</p><dl class="service-details"><div><dt>Installation</dt><dd>${esc(coordinator.install_id || 'Generating…')}</dd></div><div><dt>Coordinator</dt><dd>${esc(authority.coordinator_id || 'Generating…')}</dd></div><div><dt>Authentication</dt><dd>${authority.authentication_configured ? 'Ready' : 'Generating…'}</dd></div><div><dt>Leader manifold</dt><dd>${esc(authority.leader_node_id || 'Selected automatically')}</dd></div></dl><div class="service-form"><label>Name<input class="input" id="settings-name" value="${esc(coordinator.name || '')}" placeholder="Lune Touch"></label><label>Site<input class="input" id="settings-site-label" value="${esc(coordinator.site_label || '')}" placeholder="House"></label></div><div class="form-actions"><button class="btn" data-action="save-settings">Save display names</button><button class="btn" data-discard-section="settings">Discard changes</button></div></div></details>
      <details class="group-disclosure"><summary><span>Authority and V6 synchronization</span><small>${authoritySync.local_zones || 0} local · ${authoritySync.peer_zones || 0} peer · ${esc(authoritySync.peer_status || 'unknown')}</small></summary><div class="group-disclosure-content"><dl class="service-details"><div><dt>State</dt><dd class="${authorityHealthy ? 'ok' : 'warn'}">${fmtAuthority(authority.state)}</dd></div><div><dt>Reason</dt><dd>${esc(authority.reason || 'None')}</dd></div><div><dt>Lease</dt><dd>${authority.lease_remaining_s || 0} seconds</dd></div><div><dt>Local zones</dt><dd>${authoritySync.local_zones || 0}</dd></div><div><dt>Peer zones</dt><dd>${authoritySync.peer_zones || 0}</dd></div><div><dt>Peer status</dt><dd>${esc(authoritySync.peer_status || 'Unknown')}</dd></div></dl></div></details>
      <details class="group-disclosure service-recovery"><summary><span>Recovery and reset</span><small>${state.nodes.length} manifolds · ${state.commands.length} command records</small></summary><div class="group-disclosure-content"><p>Motor recovery belongs in Diagnostics. Endstop calibration and firmware recovery remain in the V6 service browser.</p><div class="form-actions"><button class="btn" data-section="diagnostics">Open recovery tools</button><button class="btn danger" data-action="reset-registry">Reset registry…</button></div></div></details>
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
  const physical = strategy.physical || {};
  const quality = physical.quality || (weighted.available ? 'healthy' : 'no coverage');
  const comfort = strategy.comfort || {};
  const driver = strategy.driver || {};
  const schedule = strategy.schedule || {};
  const commandIssues = Number(stats.failed || 0) + Number(stats.rejected || 0) + Number(stats.expired || 0) + Number(stats.blocked || 0);
  const forecastHealthy = forecastStatus.status === 'ok' || forecastStatus.status === 'cached';
  const installationReady = commissioning.next_action === 'ready';
  const firmwareHealthy = !ota.pending_verify && (!ota.running_slot_size || !ota.configured_slot_size || ota.running_slot_size === ota.configured_slot_size);
  const attentionItems = [
    !installationReady ? [fmtNextAction(commissioning.next_action), 'Complete the next installation step before relying on automation.', commissioningTarget(commissioning.next_action)[0]] : null,
    polling.fail ? ['V6 polling needs attention', `${polling.fail} failed poll${polling.fail === 1 ? '' : 's'}${polling.last_error ? ` · ${polling.last_error}` : ''}`, 'manifolds'] : null,
    commandIssues ? ['Commands need review', `${commandIssues} failed, rejected, expired, or blocked · ${stats.clamped || 0} adjusted by safety limits`, 'commands'] : null,
    !forecastHealthy ? ['Forecast is unavailable', forecastStatus.last_error || 'Fetch a forecast or verify the location.', 'weather'] : null,
    !firmwareHealthy ? ['Firmware verification is pending', ota.state || 'Review the running firmware slot.', 'diagnostics'] : null,
  ].filter(Boolean);
  const diagnosticsHealthy = attentionItems.length === 0;
  const statusSummary = diagnosticsHealthy
    ? 'Polling, command delivery, installation state, forecast, and firmware show no current issues.'
    : `${attentionItems.length} area${attentionItems.length === 1 ? '' : 's'} need review. Start with the first item below.`;
  return `<section class="view diagnostics-view">
    <div class="section-head"><h2>Diagnostics</h2><div class="section-actions"><button class="btn" data-action="refresh">Refresh</button></div></div>
    <section class="diagnostics-summary ${diagnosticsHealthy ? 'ok' : 'warn'}" role="status" aria-live="polite"><span class="eyebrow">System diagnostics</span><h2>${diagnosticsHealthy ? 'No current issues' : `${attentionItems.length} area${attentionItems.length === 1 ? '' : 's'} need attention`}</h2><p>${esc(statusSummary)}</p></section>
    <dl class="diagnostics-overview" aria-label="Diagnostics overview">
      <div><dt>V6 polling</dt><dd class="${polling.fail ? 'warn' : 'ok'}">${polling.success || 0} successful</dd><small>${polling.fail || 0} failed · last at ${fmtUptime(polling.last_poll_ms)}</small></div>
      <div><dt>Commands</dt><dd class="${commandIssues ? 'warn' : 'ok'}">${commandIssues ? `${commandIssues} need review` : 'Delivering normally'}</dd><small>${stats.accepted || 0} accepted · ${stats.pending || 0} pending</small></div>
      <div><dt>Firmware</dt><dd class="${firmwareHealthy ? 'ok' : 'warn'}">${esc(ota.running_label || 'Unknown')}</dd><small>${esc(ota.state || 'Unknown state')}</small></div>
    </dl>
    ${attentionItems.length ? `<section class="diagnostics-attention" aria-labelledby="diagnostics-attention-title"><div class="subsection-head"><div><h2 id="diagnostics-attention-title">Needs attention</h2><p>Resolve items in this order.</p></div></div><div class="diagnostics-attention-list">${attentionItems.map(([title, detail, section]) => `<button class="diagnostics-attention-row" data-section="${section}"><span><strong>${esc(title)}</strong><small>${esc(detail)}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div></section>` : ''}
    <div class="diagnostics-groups">
      <details class="group-disclosure"><summary><span>Commands and events</span><small>${stats.accepted || 0} accepted · ${commandIssues} need review · ${events.length} recent events</small></summary><div class="group-disclosure-content diagnostics-section-content">
        <div class="subsection-head"><div><h3>Command activity</h3><p>Only failed, blocked, expired, rejected, or adjusted commands appear below.</p></div><button class="text-action" data-section="commands">Open full ledger</button></div>
        <dl class="diagnostics-facts four"><div><dt>Accepted</dt><dd class="ok">${stats.accepted || 0}</dd></div><div><dt>Pending</dt><dd>${stats.pending || 0}</dd></div><div><dt>Adjusted</dt><dd class="${stats.clamped ? 'warn' : ''}">${stats.clamped || 0}</dd></div><div><dt>Blocked</dt><dd class="${stats.blocked ? 'warn' : ''}">${stats.blocked || 0}</dd></div></dl>
        <div class="data-table diagnostics-table">
          <div class="tr head diagnostics"><span>Source</span><span>Target</span><span>Request</span><span>Result</span><span>Reason</span></div>
          ${attentionCommands.map((c) => `<div class="tr diagnostics"><span>${esc(c.source)}</span><span>${esc(fmtCommandTarget(c))}</span><span>${fmtValue(c.requested_offset_c, ' C')}</span><span class="${statusClass(c.result)}">${esc(c.result)}${c.clamp_applied ? ' / adjusted' : ''}</span><span>${esc(c.reason || c.request_id || '-')}</span></div>`).join('') || '<div class="empty-row">No commands need attention</div>'}
        </div>
        <div class="diagnostics-subsection"><div class="subsection-head"><div><h3>Recent events</h3><p>Newest runtime events from Touch.</p></div></div><div class="data-table diagnostics-table"><div class="tr head events"><span>Time</span><span>Level</span><span>Source</span><span>Message</span></div>${events.map((event) => `<div class="tr events"><span>${fmtUptime(event.ts_ms)}</span><span class="${event.level === 'warn' || event.level === 'error' ? 'warn' : 'ok'}">${esc(event.level || 'info')}</span><span>${esc(fmtEventSource(event.source))}</span><span>${esc(event.message || '-')}</span></div>`).join('') || '<div class="empty-row">No runtime events</div>'}</div></div>
      </div></details>
      <details class="group-disclosure"><summary><span>Connections and installation</span><small>${commissioning.reachable_trusted_nodes || 0} ready · ${commissioning.fresh_zones || 0}/${commissioning.bound_zones || 0} fresh zones</small></summary><div class="group-disclosure-content diagnostics-section-content">
        <dl class="diagnostics-facts"><div><dt>Installation</dt><dd class="${installationReady ? 'ok' : 'warn'}">${esc(fmtNextAction(commissioning.next_action))}</dd><small>${commissioning.ready_for_commands ? 'Control ready' : 'Control not ready'}</small></div><div><dt>Manifolds</dt><dd>${commissioning.reachable_nodes || 0} reachable</dd><small>${commissioning.stale_nodes || 0} stale · ${commissioning.identity_missing_nodes || 0} missing identity</small></div><div><dt>V6 polling</dt><dd class="${polling.fail ? 'warn' : 'ok'}">${polling.success || 0} successful</dd><small>${esc(polling.last_error || 'No current error')}</small></div></dl>
        ${blockers.length ? `<div class="diagnostic-blockers">${blockers.map((blocker) => `<div><strong>${esc(blocker.target || blocker.scope || 'System')}</strong><span>${esc(fmtNextAction(blocker.action))} · ${esc(blocker.reason || 'Blocked')}</span></div>`).join('')}</div>` : '<p class="empty-state">No installation blockers.</p>'}
        ${installationReady ? '' : commissioningActionButton(commissioning.next_action)}
        <p class="diagnostics-meta">API ${esc(d.api || '/api/lune-touch/v1')} · ${d.nodes || 0} manifolds · ${d.zones || 0} zones · heap ${esc(d.heap || 'watching')}</p>
      </div></details>
      <details class="group-disclosure"><summary><span>Coordination details</span><small>Forecast, physical temperature, schedules, and learning</small></summary><div class="group-disclosure-content diagnostics-section-content">
        <dl class="diagnostics-facts"><div><dt>Forecast</dt><dd class="${forecastHealthy ? 'ok' : 'warn'}">${esc(forecastStatus.status || 'Unknown')}</dd><small>${forecastCommands.active || 0} active · ${forecastCommands.failed || 0} failed</small></div><div><dt>Physical temperature</dt><dd class="${quality === 'healthy' ? 'ok' : 'warn'}">${weighted.available ? fmtC(weighted.value_c) : 'Unavailable'}</dd><small>${fmtCoverage(physical)} · ${weighted.contributing_rooms || 0} zones</small></div><div><dt>Schedule</dt><dd class="${schedule.time_valid ? 'ok' : 'warn'}">${schedule.time_valid ? `${schedule.active_zones || 0} active` : 'Time missing'}</dd><small>${esc(schedule.driver_name || schedule.driver_room_id || 'No driver')}</small></div></dl>
        <dl class="diagnostics-facts"><div><dt>Comfort demand</dt><dd>${fmtValue(comfort.demand_c, ' C')}</dd><small>${comfort.demand_zones || 0} zones</small></div><div><dt>Driver</dt><dd>${esc(driver.name || driver.room_id || d.strategy?.driver_room || 'None')}</dd><small>${driver.priority != null ? `Priority ${driver.priority}` : 'No priority'}</small></div><div><dt>Learning</dt><dd>${learning.total_samples || 0} samples</dd><small>${learning.warming_zones || 0} warming · ${learning.cooling_zones || 0} cooling</small></div></dl>
        ${forecastStatus.last_error ? `<p class="inline-notice warn">${esc(forecastStatus.last_error)}</p>` : ''}
        <button class="btn slim" data-action="forecast-fetch">Fetch forecast now</button>
      </div></details>
      <details class="group-disclosure"><summary><span>Firmware and recovery</span><small>${esc(ota.running_label || 'Unknown firmware')} · ${esc(d.screen || 'overview-only')}</small></summary><div class="group-disclosure-content diagnostics-section-content">
        <dl class="diagnostics-facts"><div><dt>Firmware</dt><dd class="${firmwareHealthy ? 'ok' : 'warn'}">${esc(ota.state || 'Unknown')}</dd><small>Subtype ${ota.running_subtype ?? '—'}</small></div><div><dt>Running slot</dt><dd>${Math.round(Number(ota.running_slot_size || 0) / 1024)} KB</dd><small>Configured ${Math.round(Number(ota.configured_slot_size || 0) / 1024)} KB</small></div><div><dt>Display</dt><dd>${esc(d.screen || 'overview-only')}</dd><small>${d.ledger || 0} command records</small></div></dl>
        <div class="recovery-actions"><label class="field-label" for="recovery-room">Manifold zone</label><select class="input mini-input" id="recovery-room">${recoveryOptions || '<option value="">No imported zones</option>'}</select><div class="form-actions"><button class="btn slim" data-motor-action="reset_fault">Reset fault</button><button class="btn slim" data-motor-action="reset_learned">Reset learning</button><button class="btn slim danger" data-motor-action="relearn">Relearn endstops…</button></div></div>
      </div></details>
    </div>
  </section>`;
}

export function bindActions(root) {
  root.querySelector('[data-action="refresh"]')?.addEventListener('click', () => runAction(refreshAll));
  const getNodeHost = () => root.querySelector('#node-host')?.value?.trim() || '';
  const refreshAfterNodeChange = () => refreshSection(state.section === 'settings' ? 'settings' : 'manifolds');
  const waitForNodePoll = (scanResult) => {
    const startGeneration = Number(scanResult?.poll_generation);
    // The static dashboard mock has no coordinator task. Do not make mock
    // interactions wait for the real-device completion handshake.
    if (!Number.isFinite(startGeneration)) return Promise.resolve();
    const deadline = Date.now() + 12000;
    const check = () => api.nodePollStatus()
      .then((status) => {
        const generation = Number(status?.poll_generation ?? 0);
        if (generation > startGeneration || Date.now() >= deadline) return;
        return new Promise((resolve) => setTimeout(resolve, 300)).then(check);
      })
      .catch(() => undefined);
    return check();
  };
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
  root.querySelectorAll('[data-open-room]').forEach((btn) => {
    btn.addEventListener('click', () => {
      patch({ zoneEditRoomId: btn.dataset.openRoom || '' });
    });
  });
  root.querySelectorAll('[data-cancel-zone-edit]').forEach((btn) => {
    btn.addEventListener('click', () => patch({ zoneEditRoomId: '' }));
  });
  root.querySelectorAll('[data-zone-picker]').forEach((picker) => {
    picker.addEventListener('change', () => patch({ zoneEditRoomId: picker.value || '' }));
  });
  const atomicRoomPayload = (zone, panel, comfortOverride) => {
    const field = (name) => panel?.querySelector(`[data-zone-field="${name}"]`);
    const room = zone.room || {};
    const forecast = zone.forecast || {};
    const schedule = zone.schedule || {};
    const finiteOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const clamp = (value, min, max, fallback) => Math.min(max, Math.max(min, finiteOr(value, fallback)));
    const positiveOr = (value, fallback = 1) => {
      const number = finiteOr(value, fallback);
      return number > 0 ? number : fallback;
    };
    const exterior_walls = [['north', 1], ['east', 2], ['south', 4], ['west', 8]]
      .reduce((mask, [key, bit]) => mask + (panel?.querySelector(`[data-zone-wall="${key}"]`)?.checked ? bit : 0), 0);
    const total_area_m2 = positiveOr(field('total-area')?.value ?? room.total_area_m2, 1);
    const physical_weight = positiveOr(field('physical-weight')?.value ?? room.physical_weight, total_area_m2);
    let schedule_start_min = parseClock(field('schedule-start')?.value, finiteOr(schedule.start_min, 360));
    let schedule_end_min = parseClock(field('schedule-end')?.value, finiteOr(schedule.end_min, 1320));
    if (schedule_start_min >= schedule_end_min) {
      schedule_start_min = 360;
      schedule_end_min = 1320;
    }
    const scheduleEnabledField = field('schedule-enabled');
    return {
      expected_revision: Number(room.revision || 1),
      total_area_m2, physical_weight,
      include_in_house_temperature: field('include-physical') ? (field('include-physical').checked ? 1 : 0) : (room.include_in_house_temperature === false ? 0 : 1),
      comfort_setpoint_c: clamp(comfortOverride ?? zone.comfort?.setpoint_c, 5, 35, comfortDefault(zone)),
      comfort_bias_c: clamp(zone.comfort?.bias_c, -3, 3, 0),
      priority: Math.round(clamp(zone.comfort?.priority, 0, 3, 1)),
      schedule_enabled: scheduleEnabledField ? (scheduleEnabledField.checked ? 1 : 0) : (schedule.enabled ? 1 : 0),
      schedule_day_mask: Math.round(clamp(schedule.day_mask, 0, 127, 127)),
      schedule_start_min,
      schedule_end_min,
      schedule_setpoint_c: clamp(field('schedule-setpoint')?.value ?? schedule.setpoint_c, 5, 35, comfortDefault(zone)),
      exterior_walls,
      wind_exposure: field('forecast-wind-level') ? levelValue(field('forecast-wind-level').value, 'wind') : clamp(forecast.wind_exposure, 0, 1, 0.5),
      solar_gain: field('forecast-solar-level') ? levelValue(field('forecast-solar-level').value, 'solar') : clamp(forecast.solar_gain, 0, 1, 0.3),
      thermal_lead_h: Math.round(clamp(forecast.thermal_lead_h, 1, 24, 4)),
      max_offset_c: clamp(forecast.max_offset_c, 0, 5, 1.5),
    };
  };
  root.querySelectorAll('[data-zone-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('[data-zone-index]');
      const zone = state.zones[Number(panel?.dataset.zoneIndex)];
      const setpoint = Number(btn.dataset.zoneTarget);
      if (!zone?.room_id || !Number.isFinite(setpoint)) return;
      runAction(() => api.saveComfort(zone.room_id, {
        comfort_setpoint_c: setpoint,
        comfort_bias_c: Number(zone.comfort?.bias_c || 0),
        priority: Number(zone.comfort?.priority ?? 1),
      }).then(() => refreshSection(state.section === 'manifolds' ? 'manifolds' : 'rooms')));
    });
  });
  root.querySelectorAll('[data-save-room]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.saveRoom);
      const zone = state.zones[index];
      const panel = btn.closest('[data-zone-index]');
      if (!zone?.room_id) return;
      const payload = atomicRoomPayload(zone, panel);
      if (!Number.isFinite(payload.schedule_setpoint_c)) {
        patch({ error: 'Schedule target must be a number; your edits remain on screen.' });
        return;
      }
      if (!Number.isFinite(payload.total_area_m2) || !Number.isFinite(payload.physical_weight) ||
          payload.total_area_m2 <= 0 || payload.physical_weight <= 0) {
        patch({ error: 'Zone area and physical weight must be positive numbers; your edits remain on screen.' });
        return;
      }
      runAction(() => api.saveRoomAtomic(zone.room_id, payload).then(() => refreshSection('manifolds')));
    });
  });
  root.querySelector('[data-action="scan"]')?.addEventListener('click', () => runNodeAction('Probing registered V6 manifolds…', () => api.scanNodes().then((result) => {
    patch({ scanResult: result });
    return waitForNodePoll(result).then(refreshAfterNodeChange);
  })));
  root.querySelectorAll('[data-action="refresh-node-names"]').forEach((btn) => {
    btn.addEventListener('click', () => runNodeAction('Fetching zone names from V6…', () => api.scanNodes()
      .then((result) => {
        patch({ scanResult: result });
        return waitForNodePoll(result);
      })
      .then(() => Promise.all([refreshSection('manifolds'), refreshSection('rooms')]))));
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
    const siteEl = root.querySelector('#settings-site-label');
    if (nameEl) data.name = nameEl.value.trim();
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
        !/^[\x20-\x7E]+$/.test(weighted_temperature_variable) ||
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
    if (host) runNodeAction('Probing V6 identity…', () => probeNodeHost(host));
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
      runNodeAction(trust === 'trusted' ? 'Verifying manifold identity…' : 'Pairing manifold…', () => api.trustNode(btn.dataset.trustNode, trust, confirmToken).then(refreshAll));
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
  root.querySelectorAll('[data-away-room]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const roomId = btn.dataset.awayRoom;
      if (roomId && confirm(`Apply an away offset to ${roomId} for 6 hours? V6 will clamp it locally.`)) {
        runAction(() => api.setpointCommand(roomId, { offset_c: -2, ttl_s: 21600, reason: 'dashboard room away' }).then(refreshAll));
      }
    });
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
    if (confirm('Reset imported manifold records and command history? Forecast location is kept.')) runAction(() => api.resetRegistry().then(refreshAll));
  });
}
