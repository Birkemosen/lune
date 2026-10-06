/**
 * Old deep links (Lune Touch ≤ LDS 2.0 linked #s-z3 / #s-sys) → sheet links
 * (#z3 / #manifold, DESIGN.md 15.9). Imported first in main.js so it runs
 * before lune-forms.js reads the hash.
 */
function legacyHash() {
  const h = /^#s-(z[1-6]|sys)$/.exec(location.hash);
  if (!h) return '';
  if (h[1] !== 'sys') return `#${h[1]}`;
  const sheet = document.getElementById('sheet-manifold');
  return `#${(sheet && sheet.dataset.hash) || 'manifold'}`;
}

const initial = legacyHash();
if (initial) history.replaceState(null, '', location.pathname + location.search + initial);
window.addEventListener('hashchange', () => {
  const next = legacyHash();
  if (next) location.replace(next);
});
