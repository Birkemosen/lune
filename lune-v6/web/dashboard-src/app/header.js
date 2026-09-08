import { component, subscribe } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import {
  countZoneFaults,
  getDashboardValue,
  primaryAttentionAction,
  setSection,
  subscribeDashboard,
  touchNeedsAttention,
} from '../core/store.js';
import { gkey, key } from '../utils/keys.js';
import { localize, t } from '../core/i18n.js';

const css = `
.v6-toolbar { display:flex; align-items:center; justify-content:space-between; gap:24px; min-height:48px; }
.v6-toolbar-leading { display:flex; align-items:center; gap:14px; min-width:0; }
.v6-toolbar-icon { width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; color:var(--text-muted); background:transparent; font-size:18px; }
.v6-toolbar h1 { margin:0; color:var(--text-strong); font-size:1.16rem; line-height:1.2; font-weight:700; letter-spacing:-.018em; }
.v6-toolbar p { margin:1px 0 0; color:var(--text-muted); font-size:.74rem; }
.v6-toolbar-trailing { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
.v6-live { display:inline-flex; align-items:center; gap:7px; color:var(--text-muted); font-size:.78rem; font-weight:650; }
.v6-live::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--state-disabled); }
.v6-live.is-live { color:var(--state-ok); }
.v6-live.is-live::before { background:var(--state-ok); }
.v6-update-badge,.v6-attention-badge { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 12px; border-radius:999px; font:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }
.v6-update-badge { border:1px solid var(--accent-border); background:var(--accent-bg-soft); color:var(--accent); }
.v6-update-badge[hidden],.v6-attention-badge[hidden] { display:none; }
.v6-update-badge:hover { border-color:var(--accent-border-hover); background:rgba(var(--accent-rgb),.18); }
.v6-update-badge::before,.v6-attention-badge::before { content:''; width:7px; height:7px; border-radius:50%; background:currentColor; }
.v6-attention-badge { border:1px solid rgba(245,158,11,.45); background:rgba(245,158,11,.12); color:var(--state-warn, #f59e0b); }
.v6-attention-badge:hover { border-color:rgba(245,158,11,.7); background:rgba(245,158,11,.18); }
.side-nav-slot hv6-sidebar { display:flex; flex:1; min-height:0; }
.v6-side-nav { display:flex; flex:1; flex-direction:column; gap:3px; }
.v6-nav-group { margin:0 0 20px; }
.v6-nav-heading { margin:0 12px 8px; color:var(--text-faint); font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.v6-side-link { position:relative; display:flex; align-items:center; gap:10px; min-height:var(--control-height,44px); padding:0 12px; border:1px solid transparent; border-radius:10px; color:var(--text-muted); background:transparent; text-decoration:none; font-size:.9rem; font-weight:600; }
.v6-side-link:hover { color:var(--text-strong); background:var(--surface-raised); }
.v6-side-link.active { color:var(--accent); border-color:transparent; background:rgba(var(--accent-rgb),.10); }
.v6-nav-dot { margin-left:auto; width:8px; height:8px; border-radius:50%; background:var(--accent); flex:0 0 auto; }
.v6-nav-dot[hidden] { display:none !important; }
.v6-nav-dot.is-warn { background:var(--state-warn, #f59e0b); }
.menu-icon { width:20px; height:20px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.v6-side-utility { margin-top:auto; padding-top:16px; border-top:1px solid var(--separator); }
.v6-more-toggle { display:none; }
.v6-nav-zones { display:flex; flex-direction:column; gap:2px; }
@media (max-width:900px) {
  .v6-toolbar { min-height:48px; }
  .v6-toolbar-trailing { gap:8px; }
  .v6-side-nav { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
  .v6-nav-group { display:contents; }
  .v6-nav-heading, .v6-side-utility { display:none !important; }
  .v6-nav-zones { display:contents; }
  .v6-side-link { justify-content:center; flex-direction:column; gap:2px; min-height:52px; padding:4px; font-size:.68rem; }
  .v6-side-link[data-section="settings"],
  .v6-side-link[data-section="motorlab"] { display:none; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"],
  .v6-side-nav.more-open .v6-side-link[data-section="motorlab"]:not([hidden]) { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { display:contents; border:0; padding:0; margin:0; }
  .v6-side-nav.more-open .v6-side-utility .v6-side-link { display:flex; }
  .v6-nav-dot { position:absolute; top:6px; right:10px; margin-left:0; width:7px; height:7px; }
}
`;
injectStyle('hv6-header', css);

const toolbarTemplate = () => `
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button><span class="v6-live" id="hdr-live">Offline</span></div>
  </header>`;

const icon = (content) => `<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${content}</svg>`;
const navDot = (kind) => `<span class="v6-nav-dot${kind === 'warn' ? ' is-warn' : ''}" data-nav-dot hidden aria-hidden="true"></span>`;

const navTemplate = () => `
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${icon('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <div class="v6-nav-zones">
        <a href="#" class="v6-side-link" data-section="zones">${icon('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span>${navDot('warn')}</a>
      </div>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${icon('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span>${navDot('warn')}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${icon('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span>Motor lab</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span>${navDot()}</a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${icon('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span>${navDot()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${icon('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`;

const titleMap = { overview:['Overview','Local heating status and current exceptions'], zones:['Zones','Physical loops, applied targets and valve state'], diagnostics:['Diagnostics','Health, evidence and recovery'], motorlab:['Motor lab','Instrumented stroke capture and endstop thresholds'], settings:['Settings','Device configuration and safety'], help:['Help','Guidance for operating Lune V6'] };

function openAttentionTarget(action) {
  if (!action) return;
  setSection(action.section);
  if (action.focus === 'touch') {
    requestAnimationFrame(() => {
      const disclosure = document.querySelector('.touch-settings');
      if (disclosure) disclosure.open = true;
      const card = document.querySelector('.settings-touch-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function attentionLabel(action) {
  if (!action) return '';
  if (action.kind === 'touch') return t('status.attention.approveTouch');
  if (action.kind === 'faults') {
    return action.count === 1
      ? t('status.attention.zoneFaultOne')
      : t('status.attention.zoneFaultMany', { count: action.count });
  }
  return '';
}

component({ tag:'hv6-header', render:toolbarTemplate, onMount(ctx, el) {
  const live = el.querySelector('#hdr-live');
  const title = el.querySelector('#v6-view-title');
  const subtitle = el.querySelector('#v6-view-subtitle');
  const updateBadge = el.querySelector('#hdr-update');
  const attentionBadge = el.querySelector('#hdr-attention');

  function paintUpdate() {
    const info = getDashboardValue('firmwareUpdateAvailable');
    updateBadge.hidden = !info;
    if (info) {
      updateBadge.textContent = t('status.updateAvailable', { version: info.latest });
      updateBadge.title = t('settings.firmware.badgeTitle');
    }
  }

  function paintAttention() {
    const action = primaryAttentionAction();
    const section = getDashboardValue('section') || 'overview';
    // Hide the header chip when the user is already on the target section —
    // the nav dot still marks the destination.
    const show = !!(action && action.section !== section);
    attentionBadge.hidden = !show;
    if (show) {
      attentionBadge.textContent = attentionLabel(action);
      attentionBadge.title = attentionLabel(action);
      attentionBadge.dataset.kind = action.kind;
    } else {
      delete attentionBadge.dataset.kind;
    }
  }

  updateBadge.addEventListener('click', () => {
    setSection('settings');
    const card = document.querySelector('.settings-firmware-card');
    if (!card) return;
    const disclosure = card.closest('details');
    if (disclosure) disclosure.open = true;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  attentionBadge.addEventListener('click', () => {
    openAttentionTarget(primaryAttentionAction());
  });

  function update() {
    const section = getDashboardValue('section') || 'overview';
    const copy = titleMap[section] || titleMap.overview;
    title.textContent = copy[0];
    subtitle.textContent = copy[1];
    live.textContent = getDashboardValue('live') ? t('status.live') : t('status.offline');
    live.classList.toggle('is-live', !!getDashboardValue('live'));
    paintAttention();
  }

  subscribeDashboard('section', update);
  subscribeDashboard('live', update);
  subscribeDashboard('firmwareUpdateAvailable', paintUpdate);
  subscribe(gkey.authorityProposalPending, paintAttention);
  for (let zone = 1; zone <= 6; zone++) {
    subscribe(key.state(zone), paintAttention);
    subscribe(key.motorLastFault(zone), paintAttention);
  }
  localize(el);
  update();
  paintUpdate();
  paintAttention();
}});

component({ tag:'hv6-sidebar', render:navTemplate, onMount(ctx, el) {
  // mountComponent returns the template root, which is already `.v6-side-nav`.
  // Querying for that class inside `el` returns null and silently disables More.
  const nav = el;
  const links = el.querySelectorAll('[data-section]');
  const more = el.querySelector('.v6-more-toggle');
  const settingsLink = el.querySelector('[data-section="settings"]');
  const zonesLink = el.querySelector('[data-section="zones"]');
  const diagnosticsLink = el.querySelector('[data-section="diagnostics"]');

  function setDot(link, on, sectionLabel, attentionLabel) {
    if (!link) return;
    const dot = link.querySelector('[data-nav-dot]');
    if (!dot) return;
    dot.hidden = !on;
    if (on) {
      link.setAttribute('aria-label', `${sectionLabel}, ${attentionLabel}`);
      link.title = attentionLabel;
    } else {
      link.removeAttribute('aria-label');
      link.removeAttribute('title');
    }
  }

  function paintNavAttention() {
    const touch = touchNeedsAttention();
    const faults = countZoneFaults();
    const faultLabel = faults === 1
      ? t('status.attention.zoneFaultOne')
      : t('status.attention.zoneFaultMany', { count: faults });
    setDot(settingsLink, touch, t('nav.settings'), t('status.attention.approveTouch'));
    setDot(zonesLink, faults > 0, t('nav.zones'), faultLabel);
    setDot(diagnosticsLink, faults > 0, t('nav.diagnostics'), faultLabel);
    // Mobile: Settings lives under More — bubble the Settings attention there.
    if (more) {
      const moreDot = more.querySelector('[data-nav-dot]');
      if (moreDot) {
        moreDot.hidden = !touch;
        moreDot.classList.toggle('is-warn', false);
      }
      if (touch) {
        more.setAttribute('aria-label', t('status.attention.moreHasSettings'));
        more.title = t('status.attention.approveTouch');
      } else {
        more.removeAttribute('aria-label');
        more.removeAttribute('title');
      }
    }
  }

  function update() {
    const section = getDashboardValue('section');
    links.forEach((link) => {
      if (!link.dataset.section) return;
      if (link.dataset.section === section) link.classList.add('active');
      else link.classList.remove('active');
      link.setAttribute('aria-current', link.dataset.section === section ? 'page' : 'false');
    });
    paintNavAttention();
  }

  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const section = link.dataset.section;
    if (section === 'settings' && touchNeedsAttention()) {
      openAttentionTarget({ kind: 'touch', section: 'settings', focus: 'touch' });
    } else {
      setSection(section);
    }
    if (nav.classList.contains('more-open')) {
      nav.classList.remove('more-open');
      if (more) more.setAttribute('aria-expanded', 'false');
    }
  }));

  if (more) more.addEventListener('click', () => {
    const open = nav.classList.toggle('more-open');
    more.setAttribute('aria-expanded', String(open));
  });

  subscribeDashboard('section', update);
  subscribe(gkey.authorityProposalPending, paintNavAttention);
  for (let zone = 1; zone <= 6; zone++) {
    subscribe(key.state(zone), paintNavAttention);
    subscribe(key.motorLastFault(zone), paintNavAttention);
  }
  localize(el);
  update();
}});
