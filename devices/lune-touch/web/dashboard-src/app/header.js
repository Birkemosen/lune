import { setSection, setTheme, state, toggleNavigation } from '../core/store.js';

const primarySections = [
  ['overview', 'Overview', '<path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"/>'],
  ['heat-source', 'Heat Source', '<path d="M13.5 2.5c.5 3-1.5 4.2-2.4 6.1-.8 1.7-.2 3.1 1.2 3.8-.1-2 1.5-3.1 2.6-4.3 1.8 2 3.1 4.1 3.1 6.7A6 6 0 1 1 6.4 13c.6 1.1 1.4 1.8 2.4 2.2-.8-5.7 4.9-7.1 4.7-12.7Z"/>'],
  ['rooms', 'Zones', '<path d="M4 20v-1.5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4V20"/><circle cx="12" cy="7" r="3.5"/>'],
  ['manifolds', 'Manifolds', '<path d="M5 4v5m0 6v5M12 4v9m0 6v1m7-16v2m0 6v8"/><path d="M2 9h6v6H2V9Zm7 4h6v6H9v-6Zm7-7h6v6h-6V6Z"/>'],
  ['weather', 'Weather', '<path d="M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6.2 8.4 4.8 4.8 0 0 0 7 18Z"/><path d="M12 2v2M3.5 5.5 5 7m14-1.5L17.5 7"/>'],
];

const systemSections = [
  ['commands', 'Commands', '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>'],
  ['diagnostics', 'Diagnostics', '<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>'],
  ['system', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>'],
];

const utilitySections = [
  ['help', 'Help', '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>'],
];

const moreSections = [...systemSections, ...utilitySections];

const sectionMeta = {
  overview: ['Overview', 'House status and current exceptions'],
  dashboard: ['Overview', 'House status and current exceptions'],
  help: ['Help', 'Guidance and system ownership'],
  setup: ['Help', 'Guidance and system ownership'],
  rooms: ['Zones', 'Comfort, targets, and schedules'],
  zones: ['Zones', 'Comfort, targets, and schedules'],
  manifolds: ['Manifolds', 'V6 connections and zones'],
  'heat-source': ['Heat Source', 'Physical signal and publishing'],
  weather: ['Weather', 'Forecast and preload'],
  commands: ['Commands', 'Requested and accepted changes'],
  diagnostics: ['Diagnostics', 'Runtime details'],
  system: ['Settings', 'Coordinator preferences and identity'],
  settings: ['Settings', 'Coordinator preferences and identity'],
};

function icon(svg) {
  return `<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>`;
}

function navItem([id, label, svg]) {
  const current = state.section === id
    || (id === 'overview' && state.section === 'dashboard')
    || (id === 'rooms' && state.section === 'zones')
    || (id === 'system' && state.section === 'settings');
  return `<button class="menu-link ${current ? 'active' : ''}" data-section="${id}" title="${label}" aria-label="${label}" ${current ? 'aria-current="page"' : ''}>${icon(svg)}<span class="menu-label">${label}</span></button>`;
}

export function renderHeader() {
  return renderSidebar();
}

export function renderTopbar() {
  const [title, subtitle] = sectionMeta[state.section] || sectionMeta.dashboard;
  const showRefresh = state.section === 'overview' || state.section === 'dashboard';
  return `
    <header class="topbar" aria-label="View toolbar">
      <div class="topbar-head">
        <div class="toolbar-leading">
          <button class="toolbar-sidebar-toggle" data-nav-collapse title="${state.navCollapsed ? 'Show sidebar' : 'Hide sidebar'}" aria-label="${state.navCollapsed ? 'Show sidebar' : 'Hide sidebar'}">${icon('<path d="M4 5h16v14H4zM9 5v14"/>')}</button>
          <div class="toolbar-title">
            <h1>${title}</h1>
            <span>${subtitle}</span>
          </div>
        </div>
        <div class="toolbar-actions">
          ${showRefresh ? '<button type="button" class="toolbar-action" data-action="refresh">Refresh</button>' : ''}
          <span class="meta-chip ${state.error ? 'warn' : 'ok'}" role="status" aria-live="polite">${state.error ? 'Attention required' : 'Live'}</span>
          <label class="theme-picker-label" aria-label="Accent theme">
            <span class="theme-picker-caption">Accent</span>
            <select class="theme-picker" data-theme-picker>
              <option value="refined-ember" ${state.theme === 'refined-ember' ? 'selected' : ''}>Refined Ember</option>
              <option value="deep-forest" ${state.theme === 'deep-forest' ? 'selected' : ''}>Deep Forest</option>
            </select>
          </label>
        </div>
      </div>
    </header>`;
}

export function renderSidebar() {
  return `
    <aside class="sidebar ${state.navCollapsed ? 'collapsed' : ''}">
      <div class="sidebar-brand" aria-label="Lune Touch, House coordinator">
        <div class="brand-title">Lune Touch</div>
        <div class="brand-sub">House coordinator</div>
      </div>
      <nav class="top-menu" aria-label="Primary navigation">
        <div class="nav-group nav-primary">
          <span class="nav-group-label">Home</span>
          ${primarySections.map(navItem).join('')}
        </div>
        <div class="nav-group nav-secondary">
          <span class="nav-group-label">System</span>
          ${systemSections.map(navItem).join('')}
        </div>
        <div class="nav-group nav-utility">
          ${utilitySections.map(navItem).join('')}
        </div>
        <details class="nav-more ${moreSections.some(([id]) => state.section === id || (id === 'system' && state.section === 'settings')) ? 'contains-current' : ''}">
          <summary aria-label="More sections">${icon('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span></summary>
          <div class="nav-more-menu">${moreSections.map(navItem).join('')}</div>
        </details>
      </nav>
    </aside>`;
}

export function bindHeader(root) {
  root.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => setSection(button.dataset.section));
  });
  root.querySelector('[data-nav-collapse]')?.addEventListener('click', toggleNavigation);
  root.querySelector('[data-theme-picker]')?.addEventListener('change', (event) => setTheme(event.target.value));
}
