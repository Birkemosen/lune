const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
let colorSchemeMedia = null;
let colorSchemeListenerBound = false;

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
  root.classList.remove('theme-refined-ember', 'theme-deep-forest');
  delete root.dataset.theme;

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

export function applyTheme() {
  return applySystemAppearance();
}

export function getTheme() {
  return 'product';
}

export function setTheme() {
  return applyTheme();
}
