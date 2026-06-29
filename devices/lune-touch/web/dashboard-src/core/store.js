const listeners = new Set();

export const state = {
  section: 'overview',
  loading: false,
  error: '',
  overview: null,
  nodes: [],
  zones: [],
  forecast: null,
  commands: [],
  diagnostics: null,
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

export function patch(next) {
  Object.assign(state, next);
  notify();
}

