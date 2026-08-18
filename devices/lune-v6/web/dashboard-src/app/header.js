import { component } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { getDashboardValue, setSection, subscribeDashboard } from '../core/store.js';
import { ev, es, subscribe } from '../core/store.js';
import { fmtUp, fmtWifi } from '../utils/format.js';
import { gkey } from '../utils/keys.js';
import { localize, t } from '../core/i18n.js';
import { getTheme, setTheme } from '../core/theme.js';

const css = `
.v6-toolbar { display:flex; align-items:center; justify-content:space-between; gap:24px; min-height:48px; }
.v6-toolbar-leading { display:flex; align-items:center; gap:14px; min-width:0; }
.v6-toolbar-icon { width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; color:var(--text-muted); background:transparent; font-size:18px; }
.v6-toolbar h1 { margin:0; color:var(--text-strong); font-size:1.16rem; line-height:1.2; font-weight:700; letter-spacing:-.018em; }
.v6-toolbar p { margin:1px 0 0; color:var(--text-muted); font-size:.74rem; }
.v6-toolbar-trailing { display:flex; align-items:center; gap:14px; }
.v6-live { display:inline-flex; align-items:center; gap:7px; color:var(--text-muted); font-size:.78rem; font-weight:650; }
.v6-live::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--state-disabled); }
.v6-live.is-live { color:var(--state-ok); }
.v6-live.is-live::before { background:var(--state-ok); }
.v6-appearance-label { color:var(--text-faint); font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.v6-theme-picker { min-height:44px; border:1px solid var(--control-border); border-radius:9px; background:var(--control-bg); color:var(--text-strong); padding:0 12px; font:inherit; font-size:.8rem; font-weight:650; }
.v6-theme-picker:focus-visible { outline:3px solid var(--focus-ring); outline-offset:2px; }
.side-nav-slot hv6-sidebar { display:flex; flex:1; min-height:0; }
.v6-side-nav { display:flex; flex:1; flex-direction:column; gap:3px; }
.v6-nav-group { margin:0 0 20px; }
.v6-nav-heading { margin:0 12px 8px; color:var(--text-faint); font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.v6-side-link { display:flex; align-items:center; gap:10px; min-height:44px; padding:0 12px; border:1px solid transparent; border-radius:10px; color:var(--text-muted); background:transparent; text-decoration:none; font-size:.9rem; font-weight:600; }
.v6-side-link:hover { color:var(--text-strong); background:var(--surface-raised); }
.v6-side-link.active { color:var(--accent); border-color:transparent; background:rgba(var(--accent-rgb),.10); }
.menu-icon { width:20px; height:20px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.v6-side-utility { margin-top:auto; padding-top:16px; border-top:1px solid var(--separator); }
.v6-more-toggle { display:none; }
@media (max-width:900px) {
  .v6-toolbar { min-height:48px; }
  .v6-toolbar-trailing { gap:8px; }
  .v6-appearance-label { display:none; }
  .v6-side-nav { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
  .v6-nav-group { display:contents; }
  .v6-nav-heading, .v6-side-utility { display:none; }
  .v6-side-link { justify-content:center; flex-direction:column; gap:2px; min-height:52px; padding:4px; font-size:.68rem; }
  .v6-side-link[data-section="settings"] { display:none; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,1fr); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"], .v6-side-nav.more-open .v6-side-utility { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { grid-column:1/-1; border:0; padding:0; margin:0; display:contents; }
}
`;
injectStyle('hv6-header', css);

const toolbarTemplate = () => `
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><span class="v6-live" id="hdr-live">Offline</span><span class="v6-appearance-label">Accent</span><select id="hdr-theme" class="v6-theme-picker" aria-label="Accent theme"><option value="refined-ember">Refined Ember</option><option value="deep-forest">Deep Forest</option></select></div>
  </header>`;

const icon = (content) => `<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${content}</svg>`;

const navTemplate = () => `
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${icon('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <a href="#" class="v6-side-link" data-section="zones">${icon('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span></a>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${icon('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${icon('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span></button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${icon('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`;

const titleMap = { overview:['Overview','Local heating status and current exceptions'], zones:['Zones','Physical loops, applied targets and valve state'], diagnostics:['Diagnostics','Health, evidence and recovery'], settings:['Settings','Device configuration and safety'], help:['Help','Guidance for operating Lune V6'] };

component({ tag:'hv6-header', render:toolbarTemplate, onMount(ctx, el) {
  const theme = el.querySelector('#hdr-theme'); const live = el.querySelector('#hdr-live'); const title = el.querySelector('#v6-view-title'); const subtitle = el.querySelector('#v6-view-subtitle');
  theme.value = getTheme(); theme.addEventListener('change', () => setTheme(theme.value));
  window.addEventListener('lune-theme-change', (event) => { if (event.detail) theme.value = event.detail; });
  function update() { const section=getDashboardValue('section')||'overview'; const copy=titleMap[section]||titleMap.overview; title.textContent=copy[0]; subtitle.textContent=copy[1]; live.textContent=getDashboardValue('live') ? t('status.live') : t('status.offline'); live.classList.toggle('is-live',!!getDashboardValue('live')); }
  subscribeDashboard('section', update); subscribeDashboard('live', update); localize(el); update();
}});

component({ tag:'hv6-sidebar', render:navTemplate, onMount(ctx, el) {
  const nav=el.querySelector('.v6-side-nav'); const links=el.querySelectorAll('[data-section]'); const more=el.querySelector('.v6-more-toggle');
  function update(){ const section=getDashboardValue('section'); links.forEach((link)=>{ if (!link.dataset.section) return; if (link.dataset.section===section) link.classList.add('active'); else link.classList.remove('active'); link.setAttribute('aria-current',link.dataset.section===section?'page':'false'); }); }
  links.forEach((link)=>link.addEventListener('click',(event)=>{event.preventDefault(); setSection(link.dataset.section); if (nav.classList.contains('more-open')) { nav.classList.remove('more-open'); more.setAttribute('aria-expanded','false'); } }));
  more.addEventListener('click',()=>{ const open=nav.classList.toggle('more-open'); more.setAttribute('aria-expanded',String(open)); }); subscribeDashboard('section',update); localize(el); update();
}});
