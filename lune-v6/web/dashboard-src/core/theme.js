export const THEMES = Object.freeze({
  refinedEmber: 'refined-ember',
  deepForest: 'deep-forest',
});

const STORAGE_KEY = 'lune-dashboard-theme';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
let colorSchemeMedia = null;
let colorSchemeListenerBound = false;

function normalize(theme) {
  return Object.values(THEMES).includes(theme) ? theme : THEMES.refinedEmber;
}

export function getTheme() {
  try {
    return normalize(localStorage.getItem(STORAGE_KEY));
  } catch {
    return THEMES.refinedEmber;
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

export function applyTheme(theme = getTheme()) {
  const selected = normalize(theme);
  if (typeof document === 'undefined') return selected;
  applySystemAppearance();
  const root = document.documentElement;
  Object.values(THEMES).forEach((name) => root.classList.remove(`theme-${name}`));
  root.classList.add(`theme-${selected}`);
  root.dataset.theme = selected;
  return selected;
}

export function setTheme(theme) {
  const selected = applyTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, selected);
  } catch {
    // Storage may be unavailable in private or embedded browser contexts.
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lune-theme-change', { detail: selected }));
  }
  return selected;
}
