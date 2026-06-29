import { patch } from './store.js';

const BASE = '/api/lune-touch/v1';

function mockData(path) {
  if (path === '/overview') return { summary: { zones: 18, nodes: 3, calling: 5, stale_nodes: 1, comfort_avg_c: 21.1, forecast_status: 'stale', latest_command: 'accepted' } };
  if (path === '/nodes') return { nodes: [
    { id: 'v6-a', hostname: 'lune-v6-a.local', ip: '192.168.1.51', firmware: 'mock', reachable: true, trust: 2 },
    { id: 'v6-b', hostname: 'lune-v6-b.local', ip: '192.168.1.52', firmware: 'mock', reachable: true, trust: 2 },
    { id: 'v6-c', hostname: 'lune-v6-c.local', ip: '192.168.1.53', firmware: 'mock', reachable: false, trust: 1 },
  ] };
  if (path === '/zones') {
    const names = ['Living','Kitchen','Bath','Hall','Office','Bedroom','Guest','Utility','Laundry','Workshop','Pantry','Landing','Kids west','Kids east','Ensuite','Basement','Garage','Spare'];
    const statuses = ['heat','idle','call','hold','idle','preheat','idle','heat','idle','call','idle','hold','idle','heat','call','stale','idle','unused'];
    return { count: 18, zones: names.map((name, i) => ({
      room_id: `room-${String(i + 1).padStart(2, '0')}`,
      name,
      node_index: Math.floor(i / 6),
      zone_index: i % 6,
      temperature_c: [21.3,20.9,22.2,20.1,20.8,19.4,19.8,18.9,18.7,17.6,18.1,20.3,20.5,20.0,21.8,null,12.4,null][i],
      setpoint_c: [21.0,21.0,22.5,20.0,21.0,19.5,20.0,19.0,18.5,18.0,18.0,20.0,20.5,20.5,22.0,18.0,12.0,null][i],
      status: statuses[i],
      fresh: statuses[i] !== 'stale',
    })) };
  }
  if (path === '/forecast') return {
    status: 'ok',
    location: { mode: 'manual', latitude: 55.6761, longitude: 12.5683 },
    last_fetch_age_s: 420,
    cache: { hours: 72, min_temp_c: -2.1, max_wind_ms: 13.4, peak_wind_dir_deg: 275, max_solar_wm2: 180 },
    last_error: '',
    decisions: [],
  };
  if (path === '/commands') return { commands: [{ request_id: 'mock-forecast-1', source: 'forecast', reason: 'wind preload', node_index: 0, zone_index: 0, requested_offset_c: 0.4, accepted_offset_c: 0.4, created_at_ms: Date.now() - 600000, expires_at_ms: Date.now() + 2100000, result: 'accepted', clamp_applied: false }] };
  if (path === '/diagnostics') return {
    heap: 'watching',
    nodes: 3,
    zones: 18,
    ledger: 1,
    screen: 'overview-only',
    api: BASE,
    polling: { last_poll_ms: Date.now() % 900000, success: 42, fail: 1, last_error: 'mock stale node' },
  };
  return {};
}

async function get(path) {
  if (window.LUNE_TOUCH_DASHBOARD_CONFIG?.mock) return mockData(path);
  const response = await fetch(BASE + path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  const json = await response.json();
  if (json && json.ok === false) throw new Error(json.error?.message || 'API error');
  return json.data || json;
}

async function refreshPaths(paths, { loading = false } = {}) {
  if (loading) patch({ loading: true, error: '' });
  try {
    const values = await Promise.all(paths.map(get));
    const next = { error: '' };
    paths.forEach((path, index) => {
      const value = values[index];
      if (path === '/overview') next.overview = value;
      if (path === '/nodes') next.nodes = value.nodes || [];
      if (path === '/zones') next.zones = value.zones || [];
      if (path === '/forecast') next.forecast = value;
      if (path === '/commands') next.commands = value.commands || [];
      if (path === '/diagnostics') next.diagnostics = value;
    });
    if (loading) next.loading = false;
    patch(next);
  } catch (error) {
    patch({ loading: false, error: error.message || String(error) });
  }
}

export async function refreshAll(options = {}) {
  return refreshPaths(['/overview', '/nodes', '/zones', '/forecast', '/commands', '/diagnostics'], {
    loading: options.loading ?? true,
  });
}

export async function refreshSection(section) {
  if (section === 'overview') return refreshPaths(['/overview', '/zones']);
  if (section === 'manifolds') return refreshPaths(['/overview', '/nodes']);
  if (section === 'forecast') return refreshPaths(['/forecast']);
  if (section === 'commands') return refreshPaths(['/commands']);
  if (section === 'diagnostics') return refreshPaths(['/diagnostics']);
  return Promise.resolve();
}

async function post(path, body = {}) {
  if (window.LUNE_TOUCH_DASHBOARD_CONFIG?.mock) return { ok: true };
  const query = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });
  const url = `${BASE}${path}${query.toString() ? `?${query}` : ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return response.json();
}

export const api = {
  scanNodes: () => post('/nodes/scan'),
  addNode: (node) => post('/nodes', node),
  removeNode: (id) => post(`/nodes/${encodeURIComponent(id)}/remove`),
  saveZone: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}`, data),
  setpointCommand: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/setpoint-command`, data),
  saveForecast: (data) => post('/forecast/settings', data),
  fetchForecast: () => post('/forecast/fetch'),
};
