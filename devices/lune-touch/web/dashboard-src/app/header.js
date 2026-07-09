import { setSection, state } from '../core/store.js';

const sections = [
  ['overview', 'House'],
  ['zones', 'Zones'],
  ['manifolds', 'Manifolds'],
  ['forecast', 'Weather'],
  ['commands', 'Commands'],
  ['settings', 'Settings'],
  ['diagnostics', 'Diagnostics'],
];

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
    <header class="sidebar">
      <nav class="top-menu">
        ${sections.map(([id, label]) => `<button class="menu-link ${state.section === id ? 'active' : ''}" data-section="${id}">${label}</button>`).join('')}
      </nav>
    </header>`;
}

export function bindHeader(root) {
  root.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => setSection(button.dataset.section));
  });
}
