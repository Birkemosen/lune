const listeners = new Set();

export const THEMES = Object.freeze(['refined-ember', 'deep-forest']);
const THEME_STORAGE_KEY = 'lune-touch-theme';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
let colorSchemeMedia = null;
let colorSchemeListenerBound = false;

function storedTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.includes(value) ? value : THEMES[0];
  } catch {
    return THEMES[0];
  }
}

export function getColorScheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export function applySystemAppearance() {
  const scheme = getColorScheme();
  if (typeof document === 'undefined') return scheme;
  const root = document.documentElement;
  root.dataset.colorScheme = scheme;
  root.style.colorScheme = scheme;

  if (!colorSchemeListenerBound && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    colorSchemeMedia = window.matchMedia(COLOR_SCHEME_QUERY);
    const update = () => {
      const next = colorSchemeMedia.matches ? 'dark' : 'light';
      root.dataset.colorScheme = next;
      root.style.colorScheme = next;
      window.dispatchEvent(new CustomEvent('lune-color-scheme-change', { detail: next }));
    };
    if (typeof colorSchemeMedia.addEventListener === 'function') colorSchemeMedia.addEventListener('change', update);
    else if (typeof colorSchemeMedia.addListener === 'function') colorSchemeMedia.addListener(update);
    colorSchemeListenerBound = true;
  }
  return scheme;
}

export function applyTheme(theme = storedTheme()) {
  const selected = THEMES.includes(theme) ? theme : THEMES[0];
  if (typeof document === 'undefined') return selected;
  applySystemAppearance();
  const root = document.documentElement;
  THEMES.forEach((name) => root.classList.remove(`theme-${name}`));
  root.classList.add(`theme-${selected}`);
  root.dataset.theme = selected;
  return selected;
}

function storedNavState() {
  try {
    return localStorage.getItem('lune-touch-nav-collapsed') === '1';
  } catch {
    return false;
  }
}

export const state = {
  section: 'overview',
  navCollapsed: storedNavState(),
  theme: storedTheme(),
  loading: false,
  error: '',
  overview: null,
  nodes: [],
  rooms: [],
  zones: [],
  strategy: null,
  forecast: null,
  commands: [],
  events: [],
  diagnostics: null,
  settings: null,
  heatSource: null,
  scanResult: null,
  nodeActivity: '',
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

export function setTheme(theme) {
  const selected = applyTheme(theme);
  state.theme = selected;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, selected);
  } catch {
    // Storage may be unavailable in private or embedded browser contexts.
  }
  notify();
}

export function patch(next) {
  Object.assign(state, next);
  notify();
}
