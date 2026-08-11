import { patch } from './store.js';

const BASE = '/api/lune-touch/v1';
let refreshController = null;
let refreshGeneration = 0;

function mockData(path) {
  if (path === '/overview') return { summary: { zones: 18, nodes: 3, calling: 5, stale_nodes: 1, comfort_avg_c: 21.1, forecast_status: 'stale', latest_command: 'accepted' } };
  if (path === '/nodes') return { nodes: [
    { id: 'v6-a', name: 'Ground floor manifold', hostname: 'lune-v6-a.local', ip: '192.168.1.51', firmware: 'mock', pairing_fingerprint: 'hv6-mock-a', reachable: true, trust: 2, trust_label: 'trusted', last_success_host: 'lune-v6-a.local', last_failure: '', health: { mapped_zones: 6, fresh_zones: 6, stale_zones: 0, calling_zones: 2, avg_temp_c: 20.9, avg_setpoint_c: 21.0 }, runtime: { active_zones: 6, avg_valve_pct: 28.5, flow_c: 33.8, return_c: 30.6, drivers_enabled: true, motor_fault: false, motor_current_ma: 18.2 } },
    { id: 'v6-b', name: 'Workshop manifold', hostname: 'lune-v6-b.local', ip: '192.168.1.52', firmware: 'mock', pairing_fingerprint: 'hv6-mock-b', reachable: true, trust: 2, trust_label: 'trusted', last_success_host: '192.168.1.52', last_failure: '', health: { mapped_zones: 6, fresh_zones: 6, stale_zones: 0, calling_zones: 2, avg_temp_c: 18.9, avg_setpoint_c: 18.9 }, runtime: { active_zones: 4, avg_valve_pct: 19.7, flow_c: 31.2, return_c: 28.9, drivers_enabled: true, motor_fault: true, motor_current_ma: 12.4 } },
    { id: 'v6-c', name: 'Unverified manifold', hostname: 'lune-v6-c.local', ip: '192.168.1.53', firmware: 'mock', pairing_fingerprint: 'hv6-mock-c', reachable: false, trust: 1, trust_label: 'paired', last_success_host: '', last_failure: 'overview failed status=0', health: { mapped_zones: 6, fresh_zones: 5, stale_zones: 1, calling_zones: 1, avg_temp_c: 19.3, avg_setpoint_c: 18.6 }, runtime: { active_zones: 0, avg_valve_pct: null, flow_c: null, return_c: null, drivers_enabled: false, motor_fault: false, motor_current_ma: null } },
  ] };
  if (path === '/zones') {
    const names = ['Living','Kitchen','Bath','Hall','Office','Bedroom','Guest','Utility','Laundry','Workshop','Pantry','Landing','Kids west','Kids east','Ensuite','Basement','Garage','Spare'];
    const statuses = ['heat','idle','call','hold','idle','preheat','idle','heat','idle','call','idle','hold','idle','heat','call','stale','idle','unused'];
    const comfortSetpoints = [21.5,21.0,22.5,20.0,21.0,19.5,20.0,19.0,18.5,18.0,18.0,20.0,20.5,20.5,22.0,18.0,12.0,18.0];
    const comfortBiases = [0.2,0.0,0.1,0.0,-0.2,0.0,0.0,0.3,0.0,0.4,0.0,0.0,0.0,0.2,0.0,0.0,0.0,0.0];
    const roomId = (i) => i < 3 ? 'room-01' : `room-${String(i + 1).padStart(2, '0')}`;
    const roomName = (i) => i < 3 ? 'Living' : names[i];
    return { count: 18, rooms: [
      { room_id: 'room-01', name: 'Living', loop_count: 3, area_m2: 48, include_in_house_temperature: true },
      ...names.slice(3).map((name, i) => ({ room_id: `room-${String(i + 4).padStart(2, '0')}`, name, loop_count: 1, area_m2: 12, include_in_house_temperature: true })),
    ], zones: names.map((name, i) => ({
      room_id: roomId(i),
      name: roomName(i),
      name_source: i % 5 === 0 ? 'touch' : 'v6',
      node_index: Math.floor(i / 6),
      zone_index: i % 6,
      temperature_c: [21.3,21.2,21.3,20.1,20.8,19.4,19.8,18.9,18.7,17.6,18.1,20.3,20.5,20.0,21.8,null,12.4,null][i],
      setpoint_c: [21.0,21.0,22.5,20.0,21.0,19.5,20.0,19.0,18.5,18.0,18.0,20.0,20.5,20.5,22.0,18.0,12.0,null][i],
      valve_pct: [45,18,28,15,15,35,10,42,15,58,12,15,16,38,30,null,15,null][i],
      status: statuses[i],
      fresh: statuses[i] !== 'stale',
      room: { revision: 1, total_area_m2: i < 3 ? 48 : 12, physical_weight: i < 3 ? 48 : 12, include_in_house_temperature: true },
      comfort: {
        setpoint_c: comfortSetpoints[i],
        bias_c: comfortBiases[i],
        effective_setpoint_c: comfortSetpoints[i] + comfortBiases[i],
        effective_source: i < 8 ? 'schedule' : 'comfort',
        schedule_active: i < 8,
        time_valid: true,
        priority: i < 3 ? 3 : 1,
      },
      resolver: {
        base_setpoint_c: comfortSetpoints[i] + comfortBiases[i],
        base_source: i < 8 ? 'schedule' : 'comfort',
        manual_offset_c: i === 0 ? 0.5 : 0,
        forecast_offset_c: i === 5 ? 0.2 : 0,
        learned_offset_c: i === 9 ? 0.35 : 0,
        command_offset_c: i === 0 ? 0.5 : (i === 5 ? 0.2 : 0),
        command_source: i === 0 ? 'manual' : (i === 5 ? 'forecast' : 'none'),
        target_setpoint_c: comfortSetpoints[i] + comfortBiases[i] + (i === 0 ? 0.5 : (i === 5 ? 0.2 : 0)) + (i === 9 ? 0.35 : 0),
      },
      schedule: { enabled: i < 8, day_mask: i < 8 ? 31 : 127, start_min: 360, end_min: 1320, setpoint_c: comfortSetpoints[i] },
      sensor: { battery_pct: null },
      history: {
        samples: statuses[i] === 'unused' || statuses[i] === 'stale' ? 0 : 36 + i,
        calling_samples: [18,6,9,2,3,12,1,8,2,16,1,3,2,10,7,0,1,0][i],
        avg_temp_c: [21.1,20.8,22.0,20.0,20.7,19.6,19.7,18.8,18.6,17.9,18.1,20.2,20.4,20.1,21.7,null,12.3,null][i],
        min_temp_c: [20.6,20.4,21.6,19.8,20.2,19.1,19.5,18.3,18.1,17.2,17.8,19.9,20.0,19.7,21.1,null,11.8,null][i],
        max_temp_c: [21.5,21.2,22.4,20.3,21.0,19.9,20.1,19.0,18.9,18.2,18.3,20.5,20.8,20.3,22.0,null,12.6,null][i],
        last_delta_c_per_h: statuses[i] === 'unused' || statuses[i] === 'stale' ? null : [0.4,-0.1,0.2,0.0,-0.2,0.3,0.1,0.5,-0.1,0.6,0.0,-0.1,0.2,0.4,0.3,null,0.1,null][i],
      },
      thermal_model: {
        samples: statuses[i] === 'unused' || statuses[i] === 'stale' ? 0 : 8 + i,
        heat_gain_c_per_h: statuses[i] === 'unused' || statuses[i] === 'stale' ? 0 : 0.18 + (i % 5) * 0.08,
        cool_loss_c_per_h: statuses[i] === 'unused' || statuses[i] === 'stale' ? 0 : 0.08 + (i % 4) * 0.04,
        confidence: statuses[i] === 'unused' || statuses[i] === 'stale' ? 0 : Math.min(1, (8 + i) / 24),
      },
    })) };
  }
  if (path === '/forecast') {
    const baseEpoch = Math.floor(Date.now() / 3600000) * 3600;
    const hours = Array.from({ length: 72 }, (_, h) => {
      const dayPhase = Math.sin((h - 8) / 24 * Math.PI * 2);
      const temp = 3.5 + dayPhase * 3.4 - Math.max(0, h - 36) * 0.04;
      const wind = 4.5 + Math.sin(h / 8) * 2.2 + (h > 18 && h < 34 ? 3.2 : 0);
      const solar = Math.max(0, Math.sin((h % 24 - 6) / 12 * Math.PI)) * 420;
      return { h, timestamp_s: baseEpoch + h * 3600, temp_c: temp, wind_ms: wind, wind_dir_deg: 235 + Math.sin(h / 9) * 55, solar_wm2: solar };
    });
    return {
    status: 'ok',
    location: { mode: 'manual', latitude: 55.6761, longitude: 12.5683 },
    weather: { max_boost_c: 1.5 },
    fetch_pending: false,
    last_fetch_age_s: 420,
    cache: { hours: 72, min_temp_c: -2.1, max_wind_ms: 13.4, peak_wind_dir_deg: 275, max_solar_wm2: 180, fetch_epoch_s: baseEpoch, provider_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, decision_start_index: 0, restored: false },
    last_error: '',
    commands: { active: 2, sent: 1, skipped: 1, failed: 0, blocked_stale: 1, blocked_unreachable: 0, blocked_untrusted: 0 },
    hours,
    decisions: [
      { room_id: 'room-01', name: 'Living', node_index: 0, zone_index: 0, comfort_setpoint_c: 21.5, priority: 3, offset_c: 0.4, peak_load: 1.8, peak_in_h: 3, configured_thermal_lead_h: 4, learned_thermal_lead_h: 9, active_thermal_lead_h: 9, active: true },
      { room_id: 'room-06', name: 'Bedroom', node_index: 0, zone_index: 5, comfort_setpoint_c: 19.5, priority: 1, offset_c: 0.2, peak_load: 1.4, peak_in_h: 4, configured_thermal_lead_h: 4, learned_thermal_lead_h: 0, active_thermal_lead_h: 4, active: true },
    ],
  };
  }
  if (path === '/strategy') return {
    physical: { has_temperature: true, temperature_c: 20.8, contributing_rooms: 14, coverage_ratio: 1, quality: 'healthy', expected_manifolds: 2, contributing_manifolds: 2 },
    weighted_temperature: { available: true, value_c: 20.8, contributing_rooms: 14 },
    comfort: { average_c: 20.7, demand_c: 0.6, demand_zones: 5 },
    driver: { room_id: 'room-03', name: 'Bath', deficit_c: 1.3, priority: 3 },
    schedule: { time_valid: true, active_zones: 8, driver_room_id: 'room-03', driver_name: 'Bath', driver_setpoint_c: 22.0, driver_priority: 3 },
    house_target: { available: true, value_c: 21.1, source: 'area_weighted_room_targets', contributing_area_m2: 164 },
    heat_source: { enabled: true, mode: 'active' },
  };
  if (path === '/heat-source') return {
    enabled: true,
    host: 'heat-source.local',
    port: 80,
    weighted_temperature_variable: 'house_temperature',
    push_interval_s: 30,
    weighted_temperature: { available: true, value_c: 20.8, contributing_rooms: 14 },
    send_preview: { available: true, value_c: 20.8, zones: 14, target_setpoint_c: 21.1, target_available: true, mode: 'active' },
    push: { has_result: true, status: 'confirmed', http_status: 204, requested_value_c: 20.8, confirmed_value_c: 20.8, write_age_s: 12, confirmation_age_s: 12, failure_count: 3, failure_streak: 0, last_error: '' },
  };
  if (path === '/commands') return { commands: [
    { request_id: 'mock-forecast-1', source: 'forecast', reason: 'wind preload', room_id: 'room-01', name: 'Living', node_index: 0, zone_index: 0, requested_offset_c: 0.4, accepted_offset_c: 0.4, created_at_ms: Date.now() - 600000, expires_at_ms: Date.now() + 2100000, result: 'accepted', clamp_applied: false },
    { request_id: 'mock-dashboard-1', source: 'dashboard', reason: 'quick boost', room_id: 'room-10', name: 'Workshop', node_index: 1, zone_index: 3, requested_offset_c: 1.1, accepted_offset_c: 0.8, created_at_ms: Date.now() - 420000, expires_at_ms: Date.now() + 900000, result: 'accepted', clamp_applied: true },
    { request_id: 'mock-forecast-2', source: 'forecast', reason: 'wind preload', room_id: 'room-14', name: 'Kids east', node_index: 2, zone_index: 1, requested_offset_c: 0.3, accepted_offset_c: 0.0, created_at_ms: Date.now() - 240000, expires_at_ms: Date.now() + 1800000, result: 'blocked_unreachable', clamp_applied: false },
  ] };
  if (path === '/events') return { events: [
    { ts_ms: 694200, level: 'info', source: 'forecast', message: 'fetch completed' },
    { ts_ms: 613100, level: 'warn', source: 'poll', message: 'node 2 overview failed status=0' },
    { ts_ms: 511000, level: 'info', source: 'commands', message: 'setpoint room-01 accepted' },
    { ts_ms: 492500, level: 'info', source: 'commissioning', message: 'node v6-a trust trusted' },
    { ts_ms: 440100, level: 'info', source: 'boot', message: 'coordinator ready' },
  ] };
  if (path === '/diagnostics') return {
    heap: 'watching',
    nodes: 3,
    zones: 18,
    ledger: 3,
    screen: 'sidebar-views',
    api: BASE,
    command_results: { pending: 0, accepted: 2, rejected: 0, failed: 0, expired: 0, blocked: 1, blocked_stale: 0, blocked_unreachable: 1, blocked_untrusted: 0, clamped: 1 },
    polling: { last_poll_ms: Date.now() % 900000, success: 42, fail: 1, last_error: 'mock stale node' },
    commissioning: {
      paired_nodes: 1,
      trusted_nodes: 2,
      reachable_nodes: 2,
      reachable_trusted_nodes: 2,
      stale_nodes: 1,
      trusted_stale_nodes: 0,
      identity_missing_nodes: 0,
      bound_zones: 18,
      fresh_zones: 17,
      stale_zones: 1,
      ready_for_commands: true,
      ready_for_forecast: true,
      next_action: 'ready',
      blockers: [{ scope: 'node', target: 'v6-c', reason: 'not_trusted', action: 'trust_node' }],
    },
    ota: { running_label: 'app0', running_subtype: 16, running_slot_size: 6553600, configured_slot_size: 6553600, state: 'valid', pending_verify: false },
    learning: { zones_with_history: 16, total_samples: 692, total_calling_samples: 101, calling_ratio: 0.146, zones_with_delta: 14, warming_zones: 5, cooling_zones: 3, average_delta_c_per_h: 0.12 },
    forecast: { status: 'ok', fetch_pending: false, last_fetch_age_s: 420, last_error: '' },
    forecast_commands: { active: 2, sent: 1, skipped: 1, failed: 0, blocked_stale: 1, blocked_unreachable: 0, blocked_untrusted: 0 },
  };
  if (path === '/settings') return {
    coordinator: { name: 'Lune Touch', install_id: 'house-main', site_label: 'Birkemosen', install_mode: 'commissioning' },
    authority: { leader_node_id: 'v6-a', coordinator_id: 'lune-touch', authentication_configured: true, state: 'touch_normal', reason: 'lease_renewed', generation: 3, lease_remaining_s: 72 },
    weather: { max_boost_c: 1.5 },
  };
  return {};
}

async function get(path, signal) {
  if (window.LUNE_TOUCH_DASHBOARD_CONFIG?.mock) return mockData(path);
  const response = await fetch(BASE + path, { cache: 'no-store', signal });
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  const json = await response.json();
  if (json && json.ok === false) throw new Error(json.error?.message || 'API error');
  return json.data || json;
}

function queryUrl(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(key, String(value));
  });
  return `${BASE}${path}${query.toString() ? `?${query}` : ''}`;
}

async function refreshPaths(paths, { loading = false } = {}) {
  refreshController?.abort();
  refreshController = new AbortController();
  const generation = ++refreshGeneration;
  if (loading) patch({ loading: true, error: '' });
  try {
    const values = await Promise.all(paths.map((path) => get(path, refreshController.signal)));
    if (generation !== refreshGeneration) return;
    const next = { error: '' };
    paths.forEach((path, index) => {
      const value = values[index];
      if (path === '/overview') next.overview = value;
      if (path === '/nodes') next.nodes = value.nodes || [];
      if (path === '/zones') {
        next.rooms = value.rooms || [];
        next.zones = value.zones || [];
      }
      if (path === '/strategy') next.strategy = value;
      if (path === '/forecast') next.forecast = value;
      if (path === '/commands') next.commands = value.commands || [];
      if (path === '/events') next.events = value.events || [];
      if (path === '/diagnostics') next.diagnostics = value;
      if (path === '/settings') next.settings = value;
      if (path === '/heat-source') next.heatSource = value;
    });
    if (loading) next.loading = false;
    patch(next);
  } catch (error) {
    if (error?.name === 'AbortError' || generation !== refreshGeneration) return;
    patch({ loading: false, error: error.message || String(error) });
  }
}

export async function refreshAll(options = {}) {
  return refreshPaths(['/overview', '/nodes', '/zones', '/strategy', '/forecast', '/commands', '/events', '/diagnostics', '/settings', '/heat-source'], {
    loading: options.loading ?? true,
  });
}

export async function refreshSection(section) {
  if (section === 'setup') return refreshPaths(['/overview', '/nodes', '/zones', '/forecast', '/diagnostics', '/settings', '/heat-source']);
  if (section === 'dashboard' || section === 'house' || section === 'overview') return refreshPaths(['/overview', '/zones', '/forecast', '/diagnostics', '/heat-source']);
  if (section === 'rooms' || section === 'zones') return refreshPaths(['/nodes', '/zones']);
  if (section === 'manifolds') return refreshPaths(['/overview', '/nodes', '/zones']);
  if (section === 'weather' || section === 'forecast') return refreshPaths(['/forecast', '/diagnostics', '/settings']);
  if (section === 'heat-source') return refreshPaths(['/heat-source']);
  if (section === 'commands') return refreshPaths(['/commands', '/events']);
  if (section === 'diagnostics') return refreshPaths(['/nodes', '/zones', '/strategy', '/forecast', '/commands', '/events', '/diagnostics']);
  if (section === 'system' || section === 'settings') return refreshPaths(['/settings', '/diagnostics', '/events']);
  return Promise.resolve();
}

async function post(path, body = {}) {
  if (window.LUNE_TOUCH_DASHBOARD_CONFIG?.mock) {
    if (path === '/nodes/scan') return {
      scan: body.hostname || body.ip ? 'probe' : 'known_nodes',
      discovery: body.hostname || body.ip ? 'manual_probe' : 'registered_probe',
      found: [{ id: 'v6-a', hostname: body.hostname || 'lune-v6-a.local', ip: body.ip || '192.168.1.51', model: 'lune-v6', firmware: 'mock', pairing_fingerprint: 'hv6-mock-a', reachable: true, stale: false, source: body.hostname || body.ip ? 'manual_probe' : 'known_node' }],
    };
    if (path === '/nodes/refresh') return {
      scan: 'known_nodes', discovery: 'registered_probe', found: [],
    };
    if (path.includes('/motor-action')) return { result: 'accepted', action: body.action || 'reset_fault', target_node: 'v6-a', zone_index: 0 };
    if (path === '/recovery/reset-registry') return { result: 'reset', registry: 'cleared', ledger: 'cleared', forecast_location: 'kept' };
    return { result: 'mock' };
  }
  let response = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!response.ok && [400, 404, 415].includes(response.status)) {
    response = await fetch(queryUrl(path, body), { method: 'POST', body: '' });
  }
  if (!response.ok) {
    let message = `${path} failed: ${response.status}`;
    try {
      const errorJson = await response.json();
      const code = errorJson?.error?.code || '';
      message = code === 'identity_required'
        ? 'Probe or add the V6 node with identity before trusting it'
        : code === 'fingerprint_confirmation_required'
          ? 'Trust requires confirming the displayed V6 fingerprint'
          : code === 'node_not_found'
            ? 'The V6 manifold is no longer registered; refresh the node list'
          : code === 'node_id_too_long'
            ? 'The V6 manifold name is too long; use a shorter hostname or IP'
          : code === 'node_id_invalid'
            ? 'The V6 manifold identity contains unsupported characters'
          : errorJson?.error?.message || code || message;
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
  nodePollStatus: () => get('/nodes'),
  refreshNodes: () => post('/nodes/refresh'),
  addNode: (node) => post('/nodes', node),
  trustNode: (id, trust, confirm) => post(`/nodes/${encodeURIComponent(id)}/trust`, { trust, confirm }),
  removeNode: (id) => post(`/nodes/${encodeURIComponent(id)}/remove`, { confirm: id }),
  resetRegistry: () => post('/recovery/reset-registry', { confirm: 'reset-registry' }),
  saveZone: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}`, data),
  saveRoomAtomic: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/room`, data),
  saveComfort: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/comfort`, data),
  saveSchedule: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/schedule`, data),
  saveForecastProfile: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/forecast-profile`, data),
  setpointCommand: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/setpoint-command`, data),
  motorAction: (roomId, data) => post(`/zones/${encodeURIComponent(roomId)}/motor-action`, data),
  saveForecast: (data) => post('/forecast/settings', data),
  saveWeather: (data) => post('/weather/settings', data),
  saveHeatSource: (data) => post('/heat-source/settings', data),
  pushHeatSource: () => post('/heat-source/push'),
  saveSettings: (data) => post('/settings', data),
  saveNodeProfile: (id, data) => post(`/nodes/${encodeURIComponent(id)}/profile`, data),
  fetchForecast: () => post('/forecast/fetch'),
};
