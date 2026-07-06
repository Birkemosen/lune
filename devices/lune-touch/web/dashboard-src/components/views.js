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
  return samples ? `${samples} / ${fmtValue(history.last_delta_c_per_h, ' C/h')}` : '0 / -';
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
  add_node: 'add node',
  fix_node_poll: 'fix node poll',
  verify_node_identity: 'verify identity',
  trust_node: 'trust node',
  map_zones: 'map zones',
  wait_for_fresh_zone_poll: 'wait for zones',
  set_forecast_location: 'set location',
  ready: 'ready',
}[action] || action || 'unknown');
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
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const nodePayloadFromCandidate = (input, candidate = {}) => {
  const value = String(input || '');
  const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(value);
  return {
    node_id: candidate.id || undefined,
    hostname: candidate.hostname || (isIp ? '' : value),
    ip: candidate.ip || (isIp ? value : ''),
    pairing_fingerprint: candidate.pairing_fingerprint || '',
  };
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
    return `<div class="chart-card"><div class="chart-head"><span class="chart-title">Weather load</span><span class="chart-sub">no cache</span></div><svg class="forecast-chart" viewBox="0 0 ${w} ${h}"><text x="${w / 2}" y="${h / 2}" text-anchor="middle" class="chart-empty">Fetch weather to populate forecast graph</text></svg></div>`;
  }
  const x = (index) => left + (hours.length <= 1 ? 0 : index / (hours.length - 1)) * plotW;
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
  return `<div class="chart-card">
    <div class="chart-head"><span class="chart-title">Weather load</span><span class="chart-sub">${hours.length} h cache</span></div>
    <div class="chart-legend">
      <span class="legend-item" style="color:var(--series-cool)"><span class="legend-dot"></span>Temp</span>
      <span class="legend-item" style="color:var(--series-warm)"><span class="legend-dot"></span>Wind</span>
      <span class="legend-item" style="color:var(--series-solar)"><span class="legend-dot"></span>Solar</span>
    </div>
    <svg class="forecast-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      ${grid}<line x1="${left}" y1="${plotB}" x2="${left + plotW}" y2="${plotB}" class="chart-axis"></line>${hourTicks}
      ${solarArea ? `<path d="${solarArea}" fill="rgba(255,193,77,.10)" stroke="none"></path>` : ''}
      <path d="${smoothPath(points.solar)}" fill="none" stroke="var(--series-solar)" stroke-width="1.8" stroke-linecap="round"></path>
      <path d="${smoothPath(points.temp)}" fill="none" stroke="var(--series-cool)" stroke-width="2.4" stroke-linecap="round"></path>
      <path d="${smoothPath(points.wind)}" fill="none" stroke="var(--series-warm)" stroke-width="2.2" stroke-linecap="round"></path>
    </svg>
  </div>`;
}

function readinessStrip() {
  const commissioning = state.diagnostics?.commissioning || {};
  return `<div class="readiness-strip">
    <div class="readiness-chip"><span>Next</span><strong class="${commissioning.next_action === 'ready' ? 'ok' : 'warn'}">${esc(fmtNextAction(commissioning.next_action))}</strong></div>
    <div class="readiness-chip"><span>Nodes</span><strong>${commissioning.trusted_nodes || 0} trusted / ${commissioning.reachable_nodes || 0} reachable</strong></div>
    <div class="readiness-chip"><span>Identity</span><strong class="${commissioning.identity_missing_nodes ? 'warn' : 'ok'}">${commissioning.identity_missing_nodes || 0} missing</strong></div>
    <div class="readiness-chip"><span>Commands</span><strong class="${commissioning.ready_for_commands ? 'ok' : 'warn'}">${commissioning.ready_for_commands ? 'ready' : 'blocked'}</strong></div>
  </div>`;
}

function statusClass(status) {
  if (status === 'heat' || status === 'call' || status === 'preheat') return 'ok';
  if (status === 'stale' || status === 'rejected' || status === 'expired' || status === 'blocked_stale' || status === 'blocked_unreachable' || status === 'blocked_untrusted') return 'warn';
  if (status === 'unused') return 'muted';
  return '';
}

function commandStats(commands = []) {
  const blockingResults = new Set(['rejected', 'failed', 'blocked_stale', 'blocked_unreachable', 'blocked_untrusted']);
  return commands.reduce((stats, command) => {
    if (command.result === 'pending') stats.pending += 1;
    if (command.result === 'accepted') stats.accepted += 1;
    if (command.clamp_applied) stats.clamped += 1;
    if (blockingResults.has(command.result)) stats.blocked += 1;
    return stats;
  }, { pending: 0, accepted: 0, clamped: 0, blocked: 0 });
}

function commandNeedsAttention(command = {}) {
  return command.clamp_applied || ['rejected', 'failed', 'blocked_stale', 'blocked_unreachable', 'blocked_untrusted'].includes(command.result);
}

function zoneCard(zone) {
  return `<article class="zone-card ${statusClass(zone.status)}">
    <div class="zone-top"><strong>${zone.name}</strong><span>${fmtC(zone.temperature_c)}</span></div>
    <div class="zone-bottom"><span>Set ${fmtC(zone.setpoint_c)}</span><span>${fmtValue(zone.valve_pct, '%')}</span><span>${zone.status}</span><span>${v6Name(zone.node_index)}</span></div>
  </article>`;
}

export function renderOverview() {
  const summary = state.overview?.summary || {};
  return `<section class="panel">
    <div class="section-head"><h2>House</h2><button class="btn" data-action="refresh">Refresh</button></div>
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
      ${forecastChart(state.forecast || {})}
    </div>
  </section>`;
}

export function renderZones() {
  const nodeOptions = state.nodes.map((node, index) => `<option value="${index}">${node.id || v6Name(index)}</option>`).join('');
  return `<section class="panel">
    <div class="section-head"><h2>Zone control</h2><span class="note">Expiring commands only. V6 clamps locally.</span></div>
    <div class="inline-form">
      <input class="input mini-input" id="map-room-id" placeholder="room-id">
      <input class="input mini-input" id="map-room-name" placeholder="Room name">
      <select class="input mini-input" id="map-node">${nodeOptions || '<option value="0">V6-0</option>'}</select>
      <input class="input mini-input" id="map-zone" type="number" min="1" max="6" value="1">
      <button class="btn" data-action="save-room-map">Map room</button>
    </div>
    <div class="inline-form">
      <input class="input mini-input" id="comfort-room-id" placeholder="room-id">
      <input class="input mini-input" id="comfort-setpoint" type="number" step="0.1" min="5" max="35" value="21.0">
      <input class="input mini-input" id="comfort-bias" type="number" step="0.1" min="-3" max="3" value="0.0">
      <select class="input mini-input" id="comfort-priority"><option value="1">Normal</option><option value="2">High</option><option value="3">Critical</option><option value="0">Low</option></select>
      <button class="btn" data-action="save-comfort">Save comfort</button>
    </div>
    <div class="inline-form">
      <input class="input mini-input" id="schedule-room-id" placeholder="room-id">
      <input class="input mini-input" id="schedule-start" type="time" value="06:00">
      <input class="input mini-input" id="schedule-end" type="time" value="22:00">
      <input class="input mini-input" id="schedule-setpoint" type="number" step="0.1" min="5" max="35" value="21.0">
      <input class="input mini-input" id="schedule-day-mask" type="number" min="1" max="127" value="127">
      <label class="check"><input id="schedule-enabled" type="checkbox" checked> On</label>
      <button class="btn" data-action="save-schedule">Save schedule</button>
    </div>
    <div class="data-table">
      <div class="tr head zones"><span>Room</span><span>Current</span><span>Comfort</span><span>Schedule</span><span>Status</span><span>Source</span><span>Valve</span><span>Learning</span><span>Command</span></div>
      ${state.zones.map((z) => `<div class="tr">
        <span>${z.name}</span><span>${fmtC(z.temperature_c)}</span><span>${fmtComfortIntent(z.comfort, z.setpoint_c)}</span><span>${fmtSchedule(z.schedule)}</span><span class="${statusClass(z.status)}">${z.status}</span><span>${v6Name(z.node_index)} / Z${Number(z.zone_index) + 1}</span>
        <span>${fmtValue(z.valve_pct, '%')}</span>
        <span>${fmtLearning(z.history)}</span>
        <span><button class="btn slim" data-command-room="${z.room_id}">+0.5 C / 45m</button></span>
      </div>`).join('')}
    </div>
  </section>`;
}

export function renderManifolds() {
  return `<section class="panel">
    <div class="section-head"><h2>Manifolds</h2><button class="btn" data-action="scan">Scan</button></div>
    <div class="card-grid">${state.nodes.map((n) => {
      const h = n.health || {};
      const r = n.runtime || {};
      return `<article class="card">
      <h3>${n.id}</h3><p>${n.hostname || n.ip || 'no address'}</p>
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
      <dl><dt>Firmware</dt><dd>${n.firmware || '-'}</dd><dt>Status</dt><dd class="${n.reachable ? 'ok' : 'warn'}">${n.reachable ? 'reachable' : 'stale'}</dd><dt>Identity</dt><dd>${esc(n.pairing_fingerprint || '-')}</dd><dt>Last host</dt><dd>${esc(n.last_success_host || '-')}</dd><dt>Last error</dt><dd class="${n.last_failure ? 'warn' : 'muted'}">${esc(n.last_failure || '-')}</dd></dl>
      <div class="inline-form">
        <button class="btn slim" data-trust-node="${n.id}" data-trust-value="trusted">Trust</button>
        <button class="btn slim" data-trust-node="${n.id}" data-trust-value="paired">Pair only</button>
        <button class="btn slim danger" data-remove-node="${n.id}">Remove</button>
      </div>
    </article>`;
    }).join('')}</div>
  </section>`;
}

export function renderForecast() {
  const f = state.forecast || {};
  const cache = f.cache || {};
  const location = f.location || {};
  const commands = f.commands || {};
  const activeDecisions = (f.decisions || []).filter((d) => d.active);
  return `<section class="panel">
    <div class="split-main">
    <div class="stack">
      <div class="section-head"><h2>Weather</h2><button class="btn" data-action="forecast-fetch">Fetch now</button></div>
      ${forecastChart(f)}
      <div class="card"><h3>Status</h3><p class="${f.status === 'ok' ? 'ok' : 'warn'}">${f.status || 'unknown'}</p><p>Last fetch: ${fmtAge(f.last_fetch_age_s)}</p><p class="${f.last_error ? 'warn' : 'muted'}">${f.last_error || 'no current forecast error'}</p></div>
      <div class="card"><h3>Location</h3><p>${location.mode || 'manual'} (${Number(location.latitude || 0).toFixed(5)}, ${Number(location.longitude || 0).toFixed(5)})</p>
        <div class="inline-form forecast-location">
          <input class="input mini-input" id="forecast-lat" type="number" step="0.000001" placeholder="Latitude" value="${location.latitude || ''}">
          <input class="input mini-input" id="forecast-lon" type="number" step="0.000001" placeholder="Longitude" value="${location.longitude || ''}">
          <button class="btn" data-action="save-forecast-location">Save</button>
          <button class="btn" data-action="geo">Use browser</button>
        </div>
      </div>
    </div>
    <div class="stack">
      <div class="card"><h3>Cache</h3><dl><dt>Hours</dt><dd>${cache.hours || 0}</dd><dt>Min temp</dt><dd>${fmtValue(cache.min_temp_c, ' C')}</dd><dt>Max wind</dt><dd>${fmtValue(cache.max_wind_ms, ' m/s')} from ${Math.round(cache.peak_wind_dir_deg || 0)} deg</dd><dt>Max solar</dt><dd>${fmtValue(cache.max_solar_wm2, ' W/m2')}</dd></dl></div>
      <div class="card"><h3>Commands</h3><dl><dt>Active</dt><dd>${commands.active || 0}</dd><dt>Sent</dt><dd>${commands.sent || 0}</dd><dt>Skipped</dt><dd>${commands.skipped || 0}</dd><dt>Failed</dt><dd class="${commands.failed ? 'warn' : 'ok'}">${commands.failed || 0}</dd><dt>Blocked</dt><dd class="${commands.blocked_stale || commands.blocked_unreachable || commands.blocked_untrusted ? 'warn' : 'ok'}">${commands.blocked_stale || 0} stale / ${commands.blocked_unreachable || 0} offline / ${commands.blocked_untrusted || 0} trust</dd></dl></div>
      <div class="card"><h3>Decisions</h3>${activeDecisions.map((d) => `<p>${d.room_id}: +${fmtValue(d.offset_c, ' C')}, P${d.priority ?? 1}, comfort ${fmtC(d.comfort_setpoint_c)}, peak ${fmtValue(d.peak_load)} in ${d.peak_in_h}h</p>`).join('') || '<p>No active decisions</p>'}</div>
    </div>
    </div>
  </section>`;
}

export function renderCommands() {
  return `<section class="panel">
    <div class="section-head"><h2>Command ledger</h2><span class="note">Requested vs accepted/clamped values</span></div>
    <div class="data-table">
      <div class="tr head commands"><span>ID</span><span>Source</span><span>Reason</span><span>Target</span><span>Request</span><span>Accept</span><span>Clamp</span><span>Expiry</span></div>
      ${state.commands.map((c) => `<div class="tr commands"><span>${c.request_id}</span><span>${c.source}</span><span>${c.reason}</span><span>${v6Name(c.node_index)} / Z${Number(c.zone_index) + 1}</span><span>${c.requested_offset_c}</span><span>${c.accepted_offset_c}</span><span class="${c.clamp_applied ? 'warn' : 'ok'}">${c.clamp_applied ? 'yes' : 'no'}</span><span class="${statusClass(c.result === 'accepted' ? 'heat' : c.result)}">${c.result} / ${fmtCommandExpiry(c)}</span></div>`).join('')}
    </div>
  </section>`;
}

export function renderSettings() {
  const scan = state.scanResult;
  const found = scan?.found || [];
  const strategy = state.strategy || {};
  const physical = strategy.physical || {};
  const comfort = strategy.comfort || {};
  const driver = strategy.driver || {};
  const commissioning = state.diagnostics?.commissioning || {};
  return `<section class="panel two-col">
    <div class="card"><h3>Register V6</h3><label>Hostname/IP<input class="input" id="node-host" placeholder="lune-v6-a.local"></label><div class="inline-form"><button class="btn" data-action="probe-node">Probe</button><button class="btn" data-action="add-node">Add node</button></div></div>
    <div class="card"><h3>Last scan</h3><p>${scan?.discovery || 'not run'}</p>${found.map((node) => `<p><strong>${esc(node.id)}</strong> ${esc(node.hostname || node.ip || '')} <span class="${node.reachable ? 'ok' : 'warn'}">${node.reachable ? 'reachable' : 'unreachable'}</span> ${node.firmware ? `<span>${esc(node.firmware)}</span>` : ''} ${node.pairing_fingerprint ? `<span>${esc(node.pairing_fingerprint)}</span>` : ''} <button class="btn slim" data-add-probed-host="${esc(node.hostname || '')}" data-add-probed-ip="${esc(node.ip || '')}" data-add-probed-fingerprint="${esc(node.pairing_fingerprint || '')}">Add</button></p>`).join('') || '<p>No candidates</p>'}</div>
    <div class="card"><h3>Asgard / Odin</h3><p>Physical ${physical.has_temperature ? fmtC(physical.temperature_c) : 'missing'} from ${physical.contributing_zones || 0} zones</p><p>Comfort demand ${fmtValue(comfort.demand_c, ' C')} across ${comfort.demand_zones || 0} zones</p><p>Driver ${esc(driver.name || driver.room_id || '-')} ${driver.priority != null ? `/ P${driver.priority}` : ''}</p><p class="note">${esc(strategy.asgard_odin?.mode || 'advisory')}</p></div>
    <div class="card"><h3>Commissioning</h3><p class="${commissioning.next_action === 'ready' ? 'ok' : 'warn'}">${esc(fmtNextAction(commissioning.next_action))}</p><p>${commissioning.trusted_nodes || 0} trusted / ${commissioning.paired_nodes || 0} paired / ${commissioning.reachable_nodes || 0} reachable</p><p class="${commissioning.identity_missing_nodes ? 'warn' : 'ok'}">${commissioning.identity_missing_nodes || 0} missing identities</p><p>${commissioning.fresh_zones || 0} fresh of ${commissioning.bound_zones || 0} mapped zones</p></div>
    <div class="card"><h3>Dashboard access</h3><p>Canonical URL is the device root: <strong>http://&lt;touch-ip&gt;/</strong>. The embedded dashboard does not depend on ESPHome's default dashboard UI.</p></div>
    <div class="card"><h3>Recovery</h3><p>${state.nodes.length} paired nodes, ${state.commands.length} command records</p><button class="btn danger" data-action="reset-registry">Reset registry</button></div>
  </section>`;
}

export function renderDiagnostics() {
  const d = state.diagnostics || {};
  const polling = d.polling || {};
  const commissioning = d.commissioning || {};
  const ota = d.ota || {};
  const learning = d.learning || {};
  const forecastCommands = d.forecast_commands || state.forecast?.commands || {};
  const stats = commandStats(state.commands);
  const attentionCommands = state.commands.filter(commandNeedsAttention).slice(-5).reverse();
  const recoveryOptions = state.zones
    .filter((zone) => zone.room_id && zone.status !== 'unused')
    .map((zone) => `<option value="${esc(zone.room_id)}">${esc(zone.name || zone.room_id)} (${v6Name(zone.node_index)} / Z${Number(zone.zone_index) + 1})</option>`)
    .join('');
  const strategy = state.strategy || d.strategy || {};
  const physical = strategy.physical || {};
  const comfort = strategy.comfort || {};
  const driver = strategy.driver || {};
  const schedule = strategy.schedule || {};
  return `<section class="panel">
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
        <div class="data-table diagnostics-table">
          <div class="tr head diagnostics"><span>Source</span><span>Target</span><span>Request</span><span>Result</span><span>Reason</span></div>
          ${attentionCommands.map((c) => `<div class="tr diagnostics"><span>${esc(c.source)}</span><span>${v6Name(c.node_index)} / Z${Number(c.zone_index) + 1}</span><span>${fmtValue(c.requested_offset_c, ' C')}</span><span class="${statusClass(c.result)}">${esc(c.result)}${c.clamp_applied ? ' / clamp' : ''}</span><span>${esc(c.reason || c.request_id || '-')}</span></div>`).join('') || '<div class="empty-row">No failed, blocked, or clamped commands</div>'}
        </div>
        <button class="btn slim" data-section="commands">Open ledger</button>
      </div>
      <div class="ops-panel">
        <h3>V6 polling</h3>
        <p>Last poll at ${fmtUptime(polling.last_poll_ms)} uptime</p>
        <p><span class="ok">${polling.success || 0} ok</span> / <span class="${polling.fail ? 'warn' : 'ok'}">${polling.fail || 0} failed</span></p>
        <p class="${polling.last_error ? 'warn' : 'muted'}">${esc(polling.last_error || 'no current error')}</p>
      </div>
      <div class="ops-panel">
        <h3>Commissioning</h3>
        <p class="${commissioning.next_action === 'ready' ? 'ok' : 'warn'}">${esc(fmtNextAction(commissioning.next_action))}</p>
        <p>${commissioning.trusted_nodes || 0} trusted / ${commissioning.paired_nodes || 0} paired / ${commissioning.reachable_nodes || 0} reachable</p>
        <p class="${commissioning.identity_missing_nodes ? 'warn' : 'ok'}">${commissioning.identity_missing_nodes || 0} missing identities</p>
        <p>${commissioning.fresh_zones || 0} fresh of ${commissioning.bound_zones || 0} bound zones</p>
        <p class="${commissioning.ready_for_commands ? 'ok' : 'warn'}">Commands ${commissioning.ready_for_commands ? 'ready' : 'blocked'} / forecast ${commissioning.ready_for_forecast ? 'ready' : 'blocked'}</p>
      </div>
      <div class="ops-panel">
        <h3>Forecast dispatch</h3>
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
        <h3>Asgard / Odin</h3>
        <p>Physical ${physical.has_temperature ? fmtC(physical.temperature_c) : 'missing'} from ${physical.contributing_zones || 0} zones</p>
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
  root.querySelector('[data-action="scan"]')?.addEventListener('click', () => runAction(() => api.scanNodes().then((result) => {
    patch({ scanResult: result });
    return refreshAll();
  })));
  root.querySelector('[data-action="forecast-fetch"]')?.addEventListener('click', () => runAction(() => api.fetchForecast().then(() => {
    refreshSection('forecast');
    setTimeout(() => refreshSection('forecast'), 6000);
    setTimeout(() => refreshSection('forecast'), 18000);
  })));
  root.querySelector('[data-action="save-forecast-location"]')?.addEventListener('click', () => {
    const latitude = Number(root.querySelector('#forecast-lat')?.value);
    const longitude = Number(root.querySelector('#forecast-lon')?.value);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      runAction(() => api.saveForecast({ latitude, longitude, source: 'manual' }).then(refreshAll));
    }
  });
  root.querySelector('[data-action="geo"]')?.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      runAction(() => api.saveForecast({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, source: 'browser' }).then(refreshAll));
    }, (error) => patch({ error: error.message || 'Browser location failed' }));
  });
  root.querySelector('[data-action="add-node"]')?.addEventListener('click', () => {
    const host = root.querySelector('#node-host')?.value?.trim();
    if (host) runAction(() => api.scanNodes({ hostname: host }).then((result) => {
      patch({ scanResult: result });
      const candidate = result?.found?.[0] || {};
      return api.addNode(nodePayloadFromCandidate(host, candidate));
    }).then(refreshAll));
  });
  root.querySelector('[data-action="probe-node"]')?.addEventListener('click', () => {
    const host = root.querySelector('#node-host')?.value?.trim();
    if (host) runAction(() => api.scanNodes({ hostname: host }).then((result) => patch({ scanResult: result })));
  });
  root.querySelector('[data-action="save-room-map"]')?.addEventListener('click', () => {
    const roomId = root.querySelector('#map-room-id')?.value?.trim();
    const name = root.querySelector('#map-room-name')?.value?.trim() || roomId;
    const nodeIndex = Number(root.querySelector('#map-node')?.value || 0);
    const zoneIndex = Math.max(0, Number(root.querySelector('#map-zone')?.value || 1) - 1);
    if (roomId) runAction(() => api.saveZone(roomId, { name, node_index: nodeIndex, zone_index: zoneIndex }).then(refreshAll));
  });
  root.querySelector('[data-action="save-comfort"]')?.addEventListener('click', () => {
    const roomId = root.querySelector('#comfort-room-id')?.value?.trim();
    const comfort = Number(root.querySelector('#comfort-setpoint')?.value);
    const bias = Number(root.querySelector('#comfort-bias')?.value || 0);
    const priority = Number(root.querySelector('#comfort-priority')?.value || 1);
    if (roomId && Number.isFinite(comfort) && Number.isFinite(bias)) {
      runAction(() => api.saveComfort(roomId, { comfort_setpoint_c: comfort, comfort_bias_c: bias, priority }).then(refreshAll));
    }
  });
  root.querySelector('[data-action="save-schedule"]')?.addEventListener('click', () => {
    const roomId = root.querySelector('#schedule-room-id')?.value?.trim();
    const startMin = parseClock(root.querySelector('#schedule-start')?.value, 360);
    const endMin = parseClock(root.querySelector('#schedule-end')?.value, 1320);
    const setpoint = Number(root.querySelector('#schedule-setpoint')?.value);
    const dayMask = Number(root.querySelector('#schedule-day-mask')?.value || 127);
    const enabled = root.querySelector('#schedule-enabled')?.checked ? 1 : 0;
    if (roomId && Number.isFinite(setpoint)) {
      runAction(() => api.saveSchedule(roomId, { enabled, day_mask: dayMask, start_min: startMin, end_min: endMin, setpoint_c: setpoint }).then(refreshAll));
    }
  });
  root.querySelectorAll('[data-remove-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm(`Remove ${btn.dataset.removeNode}?`)) runAction(() => api.removeNode(btn.dataset.removeNode).then(refreshAll));
    });
  });
  root.querySelectorAll('[data-trust-node]').forEach((btn) => {
    btn.addEventListener('click', () => runAction(() => api.trustNode(btn.dataset.trustNode, btn.dataset.trustValue).then(refreshAll)));
  });
  root.querySelectorAll('[data-add-probed-host]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hostname = btn.dataset.addProbedHost || '';
      const ip = btn.dataset.addProbedIp || '';
      const pairing_fingerprint = btn.dataset.addProbedFingerprint || '';
      if (hostname || ip) runAction(() => api.addNode({ hostname, ip, pairing_fingerprint }).then(refreshAll));
    });
  });
  root.querySelectorAll('[data-command-room]').forEach((btn) => {
    btn.addEventListener('click', () => runAction(() => api.setpointCommand(btn.dataset.commandRoom, { offset_c: 0.5, ttl_s: 2700, reason: 'dashboard quick boost' }).then(refreshAll)));
  });
  root.querySelectorAll('[data-motor-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const roomId = root.querySelector('#recovery-room')?.value;
      if (!roomId) return;
      const action = btn.dataset.motorAction;
      if (confirm(`${btn.textContent.trim()} for ${roomId}?`)) {
        runAction(() => api.motorAction(roomId, { action }).then(refreshAll));
      }
    });
  });
  root.querySelector('[data-action="reset-registry"]')?.addEventListener('click', () => {
    if (confirm('Reset Lune Touch registry and command ledger?')) runAction(() => api.resetRegistry().then(refreshAll));
  });
}
