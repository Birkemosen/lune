import { patch } from './store.js';

const BASE = '/api/lune-touch/v1';

function mockData(path) {
  if (path === '/overview') return { summary: { zones: 18, nodes: 3, calling: 5, stale_nodes: 1, comfort_avg_c: 21.1, forecast_status: 'stale', latest_command: 'accepted' } };
  if (path === '/nodes') return { nodes: [
    { id: 'v6-a', hostname: 'lune-v6-a.local', ip: '192.168.1.51', firmware: 'mock', pairing_fingerprint: 'hv6-mock-a', reachable: true, trust: 2, trust_label: 'trusted', last_success_host: 'lune-v6-a.local', last_failure: '', health: { mapped_zones: 6, fresh_zones: 6, stale_zones: 0, calling_zones: 2, avg_temp_c: 20.9, avg_setpoint_c: 21.0 }, runtime: { active_zones: 6, avg_valve_pct: 28.5, flow_c: 33.8, return_c: 30.6, drivers_enabled: true, motor_fault: false, motor_current_ma: 18.2 } },
    { id: 'v6-b', hostname: 'lune-v6-b.local', ip: '192.168.1.52', firmware: 'mock', pairing_fingerprint: 'hv6-mock-b', reachable: true, trust: 2, trust_label: 'trusted', last_success_host: '192.168.1.52', last_failure: '', health: { mapped_zones: 6, fresh_zones: 6, stale_zones: 0, calling_zones: 2, avg_temp_c: 18.9, avg_setpoint_c: 18.9 }, runtime: { active_zones: 4, avg_valve_pct: 19.7, flow_c: 31.2, return_c: 28.9, drivers_enabled: true, motor_fault: false, motor_current_ma: 12.4 } },
    { id: 'v6-c', hostname: 'lune-v6-c.local', ip: '192.168.1.53', firmware: 'mock', pairing_fingerprint: 'hv6-mock-c', reachable: false, trust: 1, trust_label: 'paired', last_success_host: '', last_failure: 'overview failed status=0', health: { mapped_zones: 6, fresh_zones: 5, stale_zones: 1, calling_zones: 1, avg_temp_c: 19.3, avg_setpoint_c: 18.6 }, runtime: { active_zones: 0, avg_valve_pct: null, flow_c: null, return_c: null, drivers_enabled: false, motor_fault: false, motor_current_ma: null } },
  ] };
  if (path === '/zones') {
    const names = ['Living','Kitchen','Bath','Hall','Office','Bedroom','Guest','Utility','Laundry','Workshop','Pantry','Landing','Kids west','Kids east','Ensuite','Basement','Garage','Spare'];
    const statuses = ['heat','idle','call','hold','idle','preheat','idle','heat','idle','call','idle','hold','idle','heat','call','stale','idle','unused'];
    const comfortSetpoints = [21.5,21.0,22.5,20.0,21.0,19.5,20.0,19.0,18.5,18.0,18.0,20.0,20.5,20.5,22.0,18.0,12.0,18.0];
    const comfortBiases = [0.2,0.0,0.1,0.0,-0.2,0.0,0.0,0.3,0.0,0.4,0.0,0.0,0.0,0.2,0.0,0.0,0.0,0.0];
    return { count: 18, zones: names.map((name, i) => ({
      room_id: `room-${String(i + 1).padStart(2, '0')}`,
      name,
      node_index: Math.floor(i / 6),
      zone_index: i % 6,
      temperature_c: [21.3,20.9,22.2,20.1,20.8,19.4,19.8,18.9,18.7,17.6,18.1,20.3,20.5,20.0,21.8,null,12.4,null][i],
      setpoint_c: [21.0,21.0,22.5,20.0,21.0,19.5,20.0,19.0,18.5,18.0,18.0,20.0,20.5,20.5,22.0,18.0,12.0,null][i],
      valve_pct: [45,18,28,15,15,35,10,42,15,58,12,15,16,38,30,null,15,null][i],
      status: statuses[i],
      fresh: statuses[i] !== 'stale',
      comfort: {
        setpoint_c: comfortSetpoints[i],
        bias_c: comfortBiases[i],
        effective_setpoint_c: comfortSetpoints[i] + comfortBiases[i],
        effective_source: i < 8 ? 'schedule' : 'comfort',
        schedule_active: i < 8,
        time_valid: true,
        priority: i < 3 ? 3 : 1,
      },
      schedule: { enabled: i < 8, day_mask: i < 8 ? 31 : 127, start_min: 360, end_min: 1320, setpoint_c: comfortSetpoints[i] },
      history: {
        samples: statuses[i] === 'unused' || statuses[i] === 'stale' ? 0 : 36 + i,
        calling_samples: [18,6,9,2,3,12,1,8,2,16,1,3,2,10,7,0,1,0][i],
        avg_temp_c: [21.1,20.8,22.0,20.0,20.7,19.6,19.7,18.8,18.6,17.9,18.1,20.2,20.4,20.1,21.7,null,12.3,null][i],
        min_temp_c: [20.6,20.4,21.6,19.8,20.2,19.1,19.5,18.3,18.1,17.2,17.8,19.9,20.0,19.7,21.1,null,11.8,null][i],
        max_temp_c: [21.5,21.2,22.4,20.3,21.0,19.9,20.1,19.0,18.9,18.2,18.3,20.5,20.8,20.3,22.0,null,12.6,null][i],
        last_delta_c_per_h: statuses[i] === 'unused' || statuses[i] === 'stale' ? null : [0.4,-0.1,0.2,0.0,-0.2,0.3,0.1,0.5,-0.1,0.6,0.0,-0.1,0.2,0.4,0.3,null,0.1,null][i],
      },
    })) };
  }
  if (path === '/forecast') {
    const hours = Array.from({ length: 72 }, (_, h) => {
      const dayPhase = Math.sin((h - 8) / 24 * Math.PI * 2);
      const temp = 3.5 + dayPhase * 3.4 - Math.max(0, h - 36) * 0.04;
      const wind = 4.5 + Math.sin(h / 8) * 2.2 + (h > 18 && h < 34 ? 3.2 : 0);
      const solar = Math.max(0, Math.sin((h % 24 - 6) / 12 * Math.PI)) * 420;
      return { h, temp_c: temp, wind_ms: wind, wind_dir_deg: 235 + Math.sin(h / 9) * 55, solar_wm2: solar };
    });
    return {
    status: 'ok',
    location: { mode: 'manual', latitude: 55.6761, longitude: 12.5683 },
    last_fetch_age_s: 420,
    cache: { hours: 72, min_temp_c: -2.1, max_wind_ms: 13.4, peak_wind_dir_deg: 275, max_solar_wm2: 180 },
    last_error: '',
    commands: { active: 2, sent: 1, skipped: 1, failed: 0, blocked_stale: 1, blocked_unreachable: 0, blocked_untrusted: 0 },
    hours,
    decisions: [
      { room_id: 'room-01', name: 'Living', node_index: 0, zone_index: 0, comfort_setpoint_c: 21.5, priority: 3, offset_c: 0.4, peak_load: 1.8, peak_in_h: 3, active: true },
      { room_id: 'room-06', name: 'Bedroom', node_index: 0, zone_index: 5, comfort_setpoint_c: 19.5, priority: 1, offset_c: 0.2, peak_load: 1.4, peak_in_h: 4, active: true },
    ],
  };
  }
  if (path === '/strategy') return {
    physical: { has_temperature: true, temperature_c: 20.8, contributing_zones: 14 },
    comfort: { average_c: 20.7, demand_c: 0.6, demand_zones: 5 },
    driver: { room_id: 'room-03', name: 'Bath', deficit_c: 1.3, priority: 3 },
    schedule: { time_valid: true, active_zones: 8, driver_room_id: 'room-03', driver_name: 'Bath', driver_setpoint_c: 22.0, driver_priority: 3 },
    asgard_odin: {
      physical_signal: 'priority_weighted_house_temp',
      comfort_signal: 'separate_weighted_demand',
      mode: 'advisory',
    },
  };
  if (path === '/commands') return { commands: [
    { request_id: 'mock-forecast-1', source: 'forecast', reason: 'wind preload', node_index: 0, zone_index: 0, requested_offset_c: 0.4, accepted_offset_c: 0.4, created_at_ms: Date.now() - 600000, expires_at_ms: Date.now() + 2100000, result: 'accepted', clamp_applied: false },
    { request_id: 'mock-dashboard-1', source: 'dashboard', reason: 'quick boost', node_index: 1, zone_index: 3, requested_offset_c: 1.1, accepted_offset_c: 0.8, created_at_ms: Date.now() - 420000, expires_at_ms: Date.now() + 900000, result: 'accepted', clamp_applied: true },
    { request_id: 'mock-forecast-2', source: 'forecast', reason: 'wind preload', node_index: 2, zone_index: 1, requested_offset_c: 0.3, accepted_offset_c: 0.0, created_at_ms: Date.now() - 240000, expires_at_ms: Date.now() + 1800000, result: 'blocked_unreachable', clamp_applied: false },
  ] };
  if (path === '/diagnostics') return {
    heap: 'watching',
    nodes: 3,
    zones: 18,
    ledger: 3,
    screen: 'overview-only',
    api: BASE,
    polling: { last_poll_ms: Date.now() % 900000, success: 42, fail: 1, last_error: 'mock stale node' },
    commissioning: { paired_nodes: 1, trusted_nodes: 2, reachable_nodes: 2, stale_nodes: 1, bound_zones: 18, fresh_zones: 17, stale_zones: 1, ready_for_commands: true, ready_for_forecast: true, next_action: 'ready' },
    ota: { running_label: 'app0', running_subtype: 16, running_slot_size: 6553600, configured_slot_size: 6553600, state: 'valid', pending_verify: false },
    learning: { zones_with_history: 16, total_samples: 692, total_calling_samples: 101, calling_ratio: 0.146, zones_with_delta: 14, warming_zones: 5, cooling_zones: 3, average_delta_c_per_h: 0.12 },
    forecast_commands: { active: 2, sent: 1, skipped: 1, failed: 0, blocked_stale: 1, blocked_unreachable: 0, blocked_untrusted: 0 },
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
      if (path === '/strategy') next.strategy = value;
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
  return refreshPaths(['/overview', '/nodes', '/zones', '/strategy', '/forecast', '/commands', '/diagnostics'], {
    loading: options.loading ?? true,
  });
}

export async function refreshSection(section) {
  if (section === 'overview') return refreshPaths(['/overview', '/zones', '/forecast', '/diagnostics']);
  if (section === 'manifolds') return refreshPaths(['/overview', '/nodes']);
  if (section === 'forecast') return refreshPaths(['/forecast', '/diagnostics']);
  if (section === 'commands') return refreshPaths(['/commands']);
  if (section === 'settings') return refreshPaths(['/overview', '/nodes', '/strategy', '/diagnostics']);
  if (section === 'diagnostics') return refreshPaths(['/strategy', '/forecast', '/commands', '/diagnostics']);
  return Promise.resolve();
}

async function post(path, body = {}) {
  if (window.LUNE_TOUCH_DASHBOARD_CONFIG?.mock) {
    if (path === '/nodes/scan') return {
      scan: body.hostname || body.ip ? 'probe' : 'known_nodes',
      discovery: body.hostname || body.ip ? 'manual_probe' : 'manual_or_known_nodes',
      found: [{ id: 'v6-a', hostname: body.hostname || 'lune-v6-a.local', ip: body.ip || '192.168.1.51', model: 'lune-v6', firmware: 'mock', pairing_fingerprint: 'hv6-mock-a', reachable: true, stale: false, source: body.hostname || body.ip ? 'manual_probe' : 'known_node' }],
    };
    if (path.includes('/motor-action')) return { result: 'accepted', action: body.action || 'reset_fault', target_node: 'v6-a', zone_index: 0 };
    return { result: 'mock' };
  }
  const query = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });
  const url = `${BASE}${path}${query.toString() ? `?${query}` : ''}`;
  const response = await fetch(url, { method: 'POST', body: '' });
  if (!response.ok) {
    let message = `${path} failed: ${response.status}`;
    try {
      const errorJson = await response.json();
      message = errorJson?.error?.message || errorJson?.error?.code || message;
    } catch {
      // Keep the HTTP status fallback.
    }
    throw new Error(message);
  }
  const json = await response.json();
  if (json && json.ok === false) throw new Error(json.error?.message || 'API error');
  return json.data || json;
}

export const api = {
  scanNodes: (candidate = {}) => post('/nodes/scan', candidate),
  addNode: (node) => post('/nodes', node),
  trustNode: (id, trust) => post(`/nodes/${encodeURIComponent(id)}/trust`, { trust }),
  removeNode: (id) => post(`/nodes/${encodeURIComponent(id)}/remove`),
  resetRegistry: () => post('/recovery/reset-registry', { confirm: 'reset-registry' }),
  saveZone: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}`, data),
  saveComfort: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/comfort`, data),
  saveSchedule: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/schedule`, data),
  setpointCommand: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/setpoint-command`, data),
  motorAction: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/motor-action`, data),
  saveForecast: (data) => post('/forecast/settings', data),
  fetchForecast: () => post('/forecast/fetch'),
};
