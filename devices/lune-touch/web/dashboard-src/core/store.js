const listeners = new Set();

function storedNavState() {
  try {
    return localStorage.getItem('lune-touch-nav-collapsed') === '1';
  } catch {
    return false;
  }
}

export const state = {
  section: 'dashboard',
  navCollapsed: storedNavState(),
  loading: false,
  error: '',
  overview: null,
  nodes: [],
  zones: [],
  strategy: null,
  forecast: null,
  commands: [],
  events: [],
  diagnostics: null,
  settings: null,
  heatSource: null,
  scanResult: null,
  zoneEditRoomId: '',
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(state);
}

export function setSection(section) {
  state.section = section;
  notify();
}

export function toggleNavigation() {
  state.navCollapsed = !state.navCollapsed;
  try {
    localStorage.setItem('lune-touch-nav-collapsed', state.navCollapsed ? '1' : '0');
  } catch {
    // Storage may be unavailable in private or embedded browser contexts.
  }
  notify();
}

export function patch(next) {
  Object.assign(state, next);
  notify();
}
