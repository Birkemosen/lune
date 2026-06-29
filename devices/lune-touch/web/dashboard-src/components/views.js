import { api, refreshAll } from '../core/api.js';
import { state } from '../core/store.js';

const fmtC = (value) => value == null || Number.isNaN(value) ? '--.- C' : `${Number(value).toFixed(1)} C`;
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

function statusClass(status) {
  if (status === 'heat' || status === 'call' || status === 'preheat') return 'ok';
  if (status === 'stale') return 'warn';
  if (status === 'unused') return 'muted';
  return '';
}

function zoneCard(zone) {
  return `<article class="zone-card ${statusClass(zone.status)}">
    <div class="zone-top"><strong>${zone.name}</strong><span>${fmtC(zone.temperature_c)}</span></div>
    <div class="zone-bottom"><span>Set ${fmtC(zone.setpoint_c)}</span><span>${zone.status}</span><span>${v6Name(zone.node_index)}</span></div>
  </article>`;
}

export function renderOverview() {
  const summary = state.overview?.summary || {};
  return `<section class="panel">
    <div class="stat-grid">
      <div class="stat"><span>Comfort</span><strong>${fmtC(summary.comfort_avg_c)}</strong></div>
      <div class="stat"><span>Zones</span><strong>${summary.zones || 0}</strong><em>${summary.calling || 0} calling</em></div>
      <div class="stat"><span>Manifolds</span><strong>${summary.nodes || 0}</strong><em>${summary.stale_nodes || 0} stale</em></div>
      <div class="stat"><span>Forecast</span><strong>${summary.forecast_status || 'unknown'}</strong><em>${summary.latest_command || 'no command'}</em></div>
    </div>
    <div class="section-head"><h2>House zones</h2><button class="btn" data-action="refresh">Refresh</button></div>
    <div class="zone-matrix">${state.zones.map(zoneCard).join('')}</div>
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
    <div class="data-table">
      <div class="tr head"><span>Room</span><span>Current</span><span>Setpoint</span><span>Status</span><span>Source</span><span>Command</span></div>
      ${state.zones.map((z) => `<div class="tr">
        <span>${z.name}</span><span>${fmtC(z.temperature_c)}</span><span>${fmtC(z.setpoint_c)}</span><span class="${statusClass(z.status)}">${z.status}</span><span>${v6Name(z.node_index)} / Z${Number(z.zone_index) + 1}</span>
        <span><button class="btn slim" data-command-room="${z.room_id}">+0.5 C / 45m</button></span>
      </div>`).join('')}
    </div>
  </section>`;
}

export function renderManifolds() {
  return `<section class="panel">
    <div class="section-head"><h2>Manifolds</h2><button class="btn" data-action="scan">Scan</button></div>
    <div class="card-grid">${state.nodes.map((n) => `<article class="card">
      <h3>${n.id}</h3><p>${n.hostname || n.ip || 'no address'}</p>
      <dl><dt>Firmware</dt><dd>${n.firmware || '-'}</dd><dt>Status</dt><dd class="${n.reachable ? 'ok' : 'warn'}">${n.reachable ? 'reachable' : 'stale'}</dd><dt>Trust</dt><dd>${n.trust}</dd></dl>
      <button class="btn slim danger" data-remove-node="${n.id}">Remove</button>
    </article>`).join('')}</div>
  </section>`;
}

export function renderForecast() {
  const f = state.forecast || {};
  return `<section class="panel two-col">
    <div>
      <div class="section-head"><h2>Forecast</h2><button class="btn" data-action="forecast-fetch">Fetch now</button></div>
      <div class="card"><h3>Status</h3><p class="${f.status === 'ok' ? 'ok' : 'warn'}">${f.status || 'unknown'}</p><p>Location: ${f.location?.mode || 'manual'} (${f.location?.latitude || 0}, ${f.location?.longitude || 0})</p></div>
      <div class="card"><h3>Location fallback</h3><p>Browser geolocation may seed these values; manual latitude/longitude remains durable fallback in Touch NVS.</p><button class="btn" data-action="geo">Use browser location</button></div>
    </div>
    <div class="card"><h3>Decisions</h3>${(f.decisions || []).map((d) => `<p>${d.room_id}: +${d.offset_c} C, peak in ${d.peak_in_h}h</p>`).join('') || '<p>No active decisions</p>'}</div>
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
  return `<section class="panel two-col">
    <div class="card"><h3>Register V6</h3><label>Hostname/IP<input class="input" id="node-host" placeholder="lune-v6-a.local"></label><button class="btn" data-action="add-node">Add node</button></div>
    <div class="card"><h3>Dashboard access</h3><p>Canonical URL is the device root: <strong>http://&lt;touch-ip&gt;/</strong>. The embedded dashboard does not depend on ESPHome's default dashboard UI.</p></div>
  </section>`;
}

export function renderDiagnostics() {
  const d = state.diagnostics || {};
  const polling = d.polling || {};
  return `<section class="panel">
    <div class="section-head"><h2>Diagnostics</h2><span class="note">${d.api || '/api/lune-touch/v1'}</span></div>
    <div class="card-grid">
      <div class="card"><h3>Coordinator</h3><p>${d.nodes || 0} nodes, ${d.zones || 0} zones, ${d.ledger || 0} ledger records</p></div>
      <div class="card"><h3>V6 polling</h3><p>Last poll at ${fmtUptime(polling.last_poll_ms)} uptime</p><p><span class="ok">${polling.success || 0} ok</span> / <span class="${polling.fail ? 'warn' : 'ok'}">${polling.fail || 0} failed</span></p><p class="${polling.last_error ? 'warn' : 'muted'}">${polling.last_error || 'no current error'}</p></div>
      <div class="card"><h3>Screen</h3><p>${d.screen || 'overview-only'}</p></div>
      <div class="card"><h3>Heap</h3><p>${d.heap || 'watching'}</p></div>
    </div>
  </section>`;
}

export function bindActions(root) {
  root.querySelector('[data-action="refresh"]')?.addEventListener('click', refreshAll);
  root.querySelector('[data-action="scan"]')?.addEventListener('click', () => api.scanNodes().then(refreshAll));
  root.querySelector('[data-action="forecast-fetch"]')?.addEventListener('click', () => api.fetchForecast().then(refreshAll));
  root.querySelector('[data-action="geo"]')?.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      api.saveForecast({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, source: 'browser' }).then(refreshAll);
    });
  });
  root.querySelector('[data-action="add-node"]')?.addEventListener('click', () => {
    const host = root.querySelector('#node-host')?.value?.trim();
    if (host) api.addNode({ hostname: host }).then(refreshAll);
  });
  root.querySelector('[data-action="save-room-map"]')?.addEventListener('click', () => {
    const roomId = root.querySelector('#map-room-id')?.value?.trim();
    const name = root.querySelector('#map-room-name')?.value?.trim() || roomId;
    const nodeIndex = Number(root.querySelector('#map-node')?.value || 0);
    const zoneIndex = Math.max(0, Number(root.querySelector('#map-zone')?.value || 1) - 1);
    if (roomId) api.saveZone(roomId, { name, node_index: nodeIndex, zone_index: zoneIndex }).then(refreshAll);
  });
  root.querySelectorAll('[data-remove-node]').forEach((btn) => {
    btn.addEventListener('click', () => api.removeNode(btn.dataset.removeNode).then(refreshAll));
  });
  root.querySelectorAll('[data-command-room]').forEach((btn) => {
    btn.addEventListener('click', () => api.setpointCommand(btn.dataset.commandRoom, { offset_c: 0.5, ttl_s: 2700, reason: 'dashboard quick boost' }).then(refreshAll));
  });
}
