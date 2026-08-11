import { setSection, state, toggleNavigation } from '../core/store.js';

const sections = [
  ['dashboard', 'Dashboard', '<path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"/>'],
  ['setup', 'Setup', '<path d="m14.7 6.3 3 3M5 19l3.6-.7L19 7.9a2.1 2.1 0 0 0-3-3L5.7 15.3 5 19Z"/><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7"/>'],
  ['rooms', 'Rooms', '<path d="M4 20v-1.5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4V20"/><circle cx="12" cy="7" r="3.5"/>'],
  ['manifolds', 'Manifolds', '<path d="M5 4v5m0 6v5M12 4v9m0 6v1m7-16v2m0 6v8"/><path d="M2 9h6v6H2V9Zm7 4h6v6H9v-6Zm7-7h6v6h-6V6Z"/>'],
  ['heat-source', 'Heat Source', '<path d="M13.5 2.5c.5 3-1.5 4.2-2.4 6.1-.8 1.7-.2 3.1 1.2 3.8-.1-2 1.5-3.1 2.6-4.3 1.8 2 3.1 4.1 3.1 6.7A6 6 0 1 1 6.4 13c.6 1.1 1.4 1.8 2.4 2.2-.8-5.7 4.9-7.1 4.7-12.7Z"/>'],
  ['weather', 'Weather', '<path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 8.4 4.8 4.8 0 0 0 7 18Z"/><path d="M12 2v2M3.5 5.5 5 7m14-1.5L17.5 7"/>'],
  ['commands', 'Commands', '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>'],
  ['system', 'Service', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>'],
];

function icon(svg) {
  return `<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>`;
}

export function renderHeader() {
  return renderSidebar();
}

export function renderTopbar() {
  return `
    <header class="topbar">
      <div class="topbar-head">
        <div class="brand top-brand">
          <div class="brand-title">Lune Touch</div>
          <div class="brand-sub">House coordinator</div>
        </div>
        <div class="top-meta">
          <span class="meta-chip ${state.error ? 'warn' : 'ok'}">${state.error ? 'Attention' : 'Live'}</span>
          <span class="meta-chip">${state.overview?.summary?.zones ?? 0} zones</span>
          <span class="meta-chip">${state.overview?.summary?.nodes ?? 0} V6</span>
        </div>
      </div>
    </header>`;
}

export function renderSidebar() {
  return `
    <header class="sidebar ${state.navCollapsed ? 'collapsed' : ''}">
      <nav class="top-menu">
        ${sections.map(([id, label, svg]) => `<button class="menu-link ${state.section === id ? 'active' : ''}" data-section="${id}" title="${label}" aria-label="${label}" ${state.section === id ? 'aria-current="page"' : ''}>${icon(svg)}<span class="menu-label">${label}</span></button>`).join('')}
      </nav>
      <button class="nav-collapse" data-nav-collapse title="${state.navCollapsed ? 'Expand menu' : 'Collapse menu'}" aria-label="${state.navCollapsed ? 'Expand menu' : 'Collapse menu'}">
        ${icon('<path d="m14 7-5 5 5 5"/>')}
        <span class="menu-label">Collapse</span>
      </button>
    </header>`;
}

export function bindHeader(root) {
  root.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => setSection(button.dataset.section));
  });
  root.querySelector('[data-nav-collapse]')?.addEventListener('click', toggleNavigation);
}
