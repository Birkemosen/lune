import { component, subscribe } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import {
  countZoneFaults,
  getDashboardValue,
  isEntityOn,
  primaryAttentionAction,
  setSection,
  setSettingsPanel,
  setSelectedZone,
  subscribeDashboard,
  touchNeedsAttention,
  zoneFriendly,
  zoneIdShort,
  zoneLabel,
  es,
  ev,
} from '../core/store.js';
import { gkey, key } from '../utils/keys.js';
import { fmtUp } from '../utils/format.js';
import { localize, subscribeLanguage, t } from '../core/i18n.js';
import { LIVE_STATUS_CSS, liveStatusHtml, paintLiveStatus } from '../core/lds-live-status.generated.js';
import { NAV_SWITCH_CSS, navSwitchHtml } from '../core/lds-nav-switch.generated.js';
import { setEnabled } from '../core/api.js';

const css = `
.v6-toolbar { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; min-height:0; }
.v6-toolbar-leading { display:flex; align-items:flex-start; gap:14px; min-width:0; }
.v6-toolbar-icon { width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; color:var(--text-muted); background:transparent; font-size:18px; cursor:pointer; }
.v6-toolbar-icon:hover { color:var(--text-strong); background:var(--inset); }
.v6-toolbar h1 { margin:4px 0 0; color:var(--text-strong); font-size:1.45rem; line-height:1.15; font-weight:650; letter-spacing:-.02em; }
.v6-toolbar p { margin:4px 0 0; color:var(--text-muted); font-size:.8rem; }
.v6-toolbar-kicker { margin:0; color:var(--text-muted); font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.v6-toolbar-trailing { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; padding-top:6px; }
.v6-live { display:inline-flex; align-items:center; gap:7px; color:var(--text-muted); font-size:.78rem; font-weight:650; }
.v6-live::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--state-disabled); }
.v6-live.is-live { color:var(--state-ok); }
.v6-live.is-live::before { background:var(--state-ok); }
.v6-update-badge,.v6-attention-badge { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 12px; border-radius:999px; font:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }
.v6-update-badge { border:1px solid var(--accent-border); background:var(--accent-bg-soft); color:var(--accent); }
.v6-update-badge[hidden],.v6-attention-badge[hidden] { display:none; }
.v6-update-badge:hover { border-color:var(--accent-border-hover); background:rgba(var(--accent-rgb),.18); }
.v6-update-badge::before,.v6-attention-badge::before { content:''; width:7px; height:7px; border-radius:50%; background:currentColor; }
.v6-attention-badge { border:1px solid color-mix(in srgb,var(--warn) 45%,transparent); background:color-mix(in srgb,var(--warn) 12%,transparent); color:var(--state-warn); }
.v6-attention-badge:hover { border-color:color-mix(in srgb,var(--warn) 70%,transparent); background:color-mix(in srgb,var(--warn) 18%,transparent); }
.side-nav-slot hv6-sidebar { display:flex; flex:1; min-height:0; width:100%; }
.v6-side-nav { display:flex; flex:1; flex-direction:column; gap:0; min-height:0; }
.v6-nav-group { margin:0 0 18px; }
.v6-nav-heading { display:block; padding:14px 10px 6px; color:var(--text-faint); font-size:.62rem; font-weight:750; letter-spacing:.1em; text-transform:uppercase; pointer-events:none; }
.v6-side-link {
  position:relative; display:flex; align-items:center; gap:8px; width:100%; min-height:var(--nav-item-height,36px);
  padding:0 10px; border:0; border-radius:8px; color:var(--text-muted); background:transparent;
  text-decoration:none; font-size:.8rem; font-weight:600; text-align:left; cursor:pointer;
}
.v6-side-link:hover { color:var(--text-strong); background:var(--inset); }
.v6-side-link.active { color:var(--text-strong); background:var(--fill-forest); }
.v6-side-link .dot {
  width:8px; height:8px; border-radius:50%; background:var(--ok); flex:0 0 auto;
  box-shadow:0 0 8px var(--ok);
}
.v6-side-link .dot.is-online { background:var(--ok); box-shadow:0 0 8px var(--ok); }
.v6-side-link .dot.is-heating { background:var(--accent); box-shadow:0 0 8px var(--accent); }
.v6-side-link .dot.is-idle { background:var(--ok); opacity:.55; box-shadow:none; }
.v6-side-link .dot.is-off { background:var(--text-faint); box-shadow:none; opacity:.45; }
.v6-side-link .dot.is-overheated {
  background:var(--state-warn); box-shadow:0 0 8px color-mix(in srgb,var(--state-warn) 55%,transparent);
}
/* The glyph sits on --danger, and --text-on-accent flips in the same direction
   --danger does: near-black against the bright dark-theme red, white against
   the deeper light-theme red. That picks the better contrast in both (5.0:1
   and 5.3:1). Hardcoded white scored only 3.76:1 in dark mode - below the
   4.5:1 this 9px glyph needs - so this is an accessibility fix, not just a
   lint one. The coupling is to --accent by name rather than --danger, so if
   either is retuned independently it wants revisiting; a dedicated
   --text-on-danger token in LDS is the durable answer. */
.v6-side-link .dot.is-fault {
  width:12px; height:12px; border-radius:4px; background:var(--danger); box-shadow:none;
  color:var(--text-on-accent); font-size:9px; font-weight:800; line-height:12px; text-align:center;
  display:inline-grid; place-items:center;
}
.v6-nav-dot { margin-left:auto; width:8px; height:8px; border-radius:50%; background:var(--accent); flex:0 0 auto; }
.v6-nav-dot[hidden] { display:none !important; }
.v6-nav-dot.is-warn { background:var(--state-warn); }
.menu-icon { width:14px; height:14px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; color:var(--text-faint); }
.v6-nav-zones { display:flex; flex-direction:column; gap:2px; }
.v6-nav-row { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:4px; }
.v6-nav-row .v6-side-link { min-width:0; }
.v6-side-utility { margin-top:auto; padding-top:12px; border-top:1px solid var(--separator); }
.v6-more-toggle { display:none; }
.v6-tab-zones { display:none !important; }
@media (min-width:901px) {
  .v6-side-link .menu-icon { display:none; }
}
@media (max-width:900px) {
  .v6-toolbar { min-height:48px; }
  .v6-toolbar-trailing { gap:8px; }
  .v6-side-nav { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
  .v6-nav-group { display:contents; }
  .v6-nav-heading, .v6-side-utility, .lds-live-status, .v6-nav-zones { display:none !important; }
  .v6-side-link { justify-content:center; flex-direction:column; gap:2px; min-height:var(--nav-row-height,52px); padding:4px; font-size:.68rem; width:auto; }
  .v6-side-link .dot { display:none; }
  .v6-side-link[data-section="settings"],
  .v6-side-link[data-section="motorlab"],
  .v6-side-link[data-panel] { display:none; }
  .v6-tab-zones { display:flex !important; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"],
  .v6-side-nav.more-open .v6-side-link[data-section="motorlab"]:not([hidden]),
  .v6-side-nav.more-open .v6-side-link[data-panel] { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { display:contents; border:0; padding:0; margin:0; }
  .v6-side-nav.more-open .v6-side-utility .v6-side-link { display:flex; }
  .v6-nav-dot { position:absolute; top:6px; right:10px; margin-left:0; width:7px; height:7px; }
}
`;
injectStyle('hv6-header', css);
injectStyle('lds-live-status', LIVE_STATUS_CSS);
injectStyle('lds-nav-switch', NAV_SWITCH_CSS);

const toolbarTemplate = () => `
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><button type="button" class="v6-toolbar-icon" aria-label="Collapse navigation" aria-pressed="false"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14"/></svg></button><div><p class="v6-toolbar-kicker" id="v6-view-kicker">Home</p><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button></div>
  </header>`;

const icon = (content) => `<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${content}</svg>`;
const navDot = (kind) => `<span class="v6-nav-dot${kind === 'warn' ? ' is-warn' : ''}" data-nav-dot hidden aria-hidden="true"></span>`;

const navTemplate = () => `
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${icon('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span class="menu-label">Overview</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Zones</div>
      <div class="v6-nav-zones" data-zone-nav></div>
      <a href="#" class="v6-side-link v6-tab-zones" data-section="zones" hidden>${icon('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span class="menu-label">Zones</span>${navDot('warn')}</a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${icon('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span class="menu-label">Diagnostics</span>${navDot('warn')}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${icon('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span class="menu-label">Motor lab</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Settings</div>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="touch">${icon('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/>')}<span class="menu-label">Touch</span>${navDot()}</a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="hydraulics">${icon('<path d="M4 18h16M7 18V9m5 9V5m5 13v-6"/>')}<span class="menu-label">Hydraulics</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="comfort">${icon('<path d="M12 4v3M8 8l-2-2M16 8l2-2M6 13h12M9 13c0 4 3 7 3 7s3-3 3-7"/>')}<span class="menu-label">Comfort</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="motors">${icon('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')}<span class="menu-label">Motors</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="device">${icon('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>')}<span class="menu-label">Device</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${icon('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span>${navDot()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${icon('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span class="menu-label">Help</span></a></div>
    ${liveStatusHtml({ live: false, label: 'Offline', uptime: '---', ip: '---' })}
  </nav>`;

const titleMap = {
  overview: ['Overview / House status', 'System health & energy flow', 'Local heating status and current exceptions'],
  zones: ['Controller details', 'Zones', 'Physical loops, applied targets and valve state'],
  diagnostics: ['System', 'Diagnostics', 'Health, evidence and recovery'],
  motorlab: ['System', 'Motor lab', 'Instrumented stroke capture and endstop thresholds'],
  settings: ['Settings', 'Settings', 'Device configuration and safety'],
  help: ['Utility', 'Help', 'Guidance for operating Lune V6'],
};

const settingsTitleMap = {
  touch: ['Settings', 'Touch', 'Approval and coordinator identity'],
  hydraulics: ['Settings', 'Hydraulics', 'Manifold probes, return temperature and minimum flow'],
  comfort: ['Settings', 'Comfort', 'Room clocks and preheat absorption'],
  motors: ['Settings', 'Motors', 'Drivers, profile and learning limits'],
  device: ['Settings', 'Device', 'Connection, firmware, backup and appearance'],
};

function openAttentionTarget(action) {
  if (!action) return;
  setSection(action.section);
  if (action.focus === 'touch') {
    setSettingsPanel('touch');
    requestAnimationFrame(() => {
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

function zoneNavState(zone) {
  if (!isEntityOn(key.enabled(zone))) return 'OFF';
  const state = String(es(key.state(zone)) || '').toUpperCase() || 'OFF';
  const lastFault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
  const hasFault = lastFault && lastFault !== 'NONE' && lastFault !== 'OK';
  if (state === 'FAULT' || hasFault) return 'FAULT';
  return state;
}

function zoneDotClass(state) {
  if (state === 'OFF') return 'is-off';
  if (state === 'FAULT') return 'is-fault';
  if (state === 'OVERHEATED') return 'is-overheated';
  if (state === 'HEATING' || state === 'CALLING') return 'is-heating';
  if (state === 'IDLE') return 'is-idle';
  return 'is-online';
}

function zoneNavStateLabel(state) {
  if (state === 'HEATING' || state === 'CALLING') return t('state.heating');
  if (state === 'IDLE') return t('state.idle');
  if (state === 'FAULT') return t('common.fault');
  if (state === 'MANUAL') return t('state.manual');
  if (state === 'OVERHEATED') return t('state.overheated');
  if (state === 'CALIBRATING') return t('state.calibrating');
  return t('state.off');
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function zoneNavLabel(zone) {
  const friendly = zoneFriendly(zone);
  return friendly ? `${zoneIdShort(zone)} ${friendly}` : zoneIdShort(zone);
}

component({ tag: 'hv6-header', render: toolbarTemplate, onMount(ctx, el) {
  const kicker = el.querySelector('#v6-view-kicker');
  const title = el.querySelector('#v6-view-title');
  const subtitle = el.querySelector('#v6-view-subtitle');
  const updateBadge = el.querySelector('#hdr-update');
  const attentionBadge = el.querySelector('#hdr-attention');
  const collapse = el.querySelector('.v6-toolbar-icon');

  if (collapse) collapse.addEventListener('click', () => {
    const shell = document.querySelector('.shell');
    if (!shell) return;
    const collapsed = shell.classList.toggle('nav-collapsed');
    collapse.setAttribute('aria-pressed', String(collapsed));
  });

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

  function zonesTitle() {
    const zone = getDashboardValue('selectedZone') || 1;
    const friendly = zoneFriendly(zone);
    return friendly ? `${zoneIdShort(zone)} · ${friendly}` : zoneLabel(zone);
  }

  updateBadge.addEventListener('click', () => {
    setSettingsPanel('device');
    setSection('settings');
    const card = document.querySelector('.settings-firmware-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  attentionBadge.addEventListener('click', () => {
    openAttentionTarget(primaryAttentionAction());
  });

  function update() {
    const section = getDashboardValue('section') || 'overview';
    const panel = getDashboardValue('settingsPanel') || 'touch';
    const copy = section === 'settings'
      ? (settingsTitleMap[panel] || settingsTitleMap.touch)
      : (titleMap[section] || titleMap.overview);
    if (kicker) kicker.textContent = copy[0];
    if (section === 'zones') {
      title.textContent = zonesTitle();
      subtitle.textContent = 'Applied target, sensor coverage and local safety.';
    } else {
      title.textContent = copy[1];
      subtitle.textContent = copy[2];
    }
    paintAttention();
  }

  subscribeDashboard('section', update);
  subscribeDashboard('settingsPanel', update);
  subscribeDashboard('selectedZone', update);
  subscribeDashboard('zoneNames', update);
  subscribeDashboard('live', paintAttention);
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

component({ tag: 'hv6-sidebar', render: navTemplate, onMount(ctx, el) {
  const nav = el;
  const more = el.querySelector('.v6-more-toggle');
  const settingsLink = el.querySelector('[data-section="settings"][data-panel="touch"]');
  const zonesTab = el.querySelector('.v6-tab-zones');
  const diagnosticsLink = el.querySelector('[data-section="diagnostics"]');
  const zoneNav = el.querySelector('[data-zone-nav]');
  let uptimeBaseS = 0;
  let uptimeBaseAt = Date.now();
  let haveUptime = false;

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
    setDot(zonesTab, faults > 0, t('nav.zones'), faultLabel);
    setDot(diagnosticsLink, faults > 0, t('nav.diagnostics'), faultLabel);
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

  function paintZoneNav() {
    if (!zoneNav) return;
    const selected = getDashboardValue('selectedZone') || 1;
    const inZones = getDashboardValue('section') === 'zones';
    zoneNav.innerHTML = Array.from({ length: 6 }, (_, i) => {
      const zone = i + 1;
      const active = inZones && selected === zone;
      const label = zoneNavLabel(zone);
      const state = zoneNavState(zone);
      const stateLabel = zoneNavStateLabel(state);
      const fullLabel = `${label}: ${stateLabel}`;
      const safe = escapeAttr(label);
      const safeFull = escapeAttr(fullLabel);
      const dot = zoneDotClass(state);
      const mark = state === 'FAULT' ? '!' : '';
      const on = isEntityOn(key.enabled(zone));
      const enableTitle = on ? t('common.enabled') : t('common.disabled');
      const switchHtml = navSwitchHtml({
        on,
        title: enableTitle,
        label: `${label}: ${enableTitle}`,
        attrs: `data-toggle-zone="${zone}"`,
      });
      return `<div class="v6-nav-row"><button type="button" class="v6-side-link${active ? ' active' : ''}" data-section="zones" data-select-zone="${zone}" ${active ? 'aria-current="page"' : ''} title="${safeFull}" aria-label="${safeFull}"><span class="dot ${dot}" aria-hidden="true">${mark}</span><span class="menu-label">${safe}</span></button>${switchHtml}</div>`;
    }).join('');
  }

  function paintUptime() {
    if (!haveUptime) {
      paintLiveStatus(el, { uptime: '---' });
      return;
    }
    const elapsed = Math.max(0, Math.floor((Date.now() - uptimeBaseAt) / 1000));
    paintLiveStatus(el, { uptime: fmtUp(uptimeBaseS + elapsed) });
  }

  function paintLive() {
    const live = !!getDashboardValue('live');
    paintLiveStatus(el, {
      live,
      label: live ? t('status.live') : t('status.offline'),
      ip: es(gkey.ip) || '---',
    });
    const raw = ev(gkey.uptime);
    if (raw != null && !isNaN(raw) && raw >= 0) {
      const next = raw | 0;
      if (!haveUptime || next !== uptimeBaseS) {
        uptimeBaseS = next;
        uptimeBaseAt = Date.now();
        haveUptime = true;
      }
    }
    paintUptime();
  }

  function update() {
    const section = getDashboardValue('section');
    const panel = getDashboardValue('settingsPanel') || 'touch';
    el.querySelectorAll('[data-section]').forEach((link) => {
      if (link.hasAttribute('data-select-zone')) return;
      let on = link.dataset.section === section && section !== 'zones';
      if (on && link.dataset.panel) on = link.dataset.panel === panel;
      if (on && !link.dataset.panel && section === 'settings') on = false;
      link.classList.toggle('active', on);
      link.setAttribute('aria-current', on ? 'page' : 'false');
    });
    if (zonesTab) {
      const on = section === 'zones';
      zonesTab.classList.toggle('active', on);
      zonesTab.setAttribute('aria-current', on ? 'page' : 'false');
    }
    paintZoneNav();
    paintNavAttention();
    paintLive();
  }

  el.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle-zone]');
    if (toggle && el.contains(toggle)) {
      event.preventDefault();
      event.stopPropagation();
      const zone = Number(toggle.dataset.toggleZone);
      if (zone >= 1 && zone <= 6) setEnabled(zone, !isEntityOn(key.enabled(zone)));
      return;
    }
    const zoneBtn = event.target.closest('[data-select-zone]');
    if (zoneBtn) {
      event.preventDefault();
      setSelectedZone(Number(zoneBtn.dataset.selectZone));
      setSection('zones');
      if (nav.classList.contains('more-open')) {
        nav.classList.remove('more-open');
        if (more) more.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    const link = event.target.closest('[data-section]');
    if (!link || !el.contains(link) || link.classList.contains('v6-more-toggle')) return;
    event.preventDefault();
    const section = link.dataset.section;
    if (link.dataset.panel) setSettingsPanel(link.dataset.panel);
    if (section === 'settings' && touchNeedsAttention() && (!link.dataset.panel || link.dataset.panel === 'touch')) {
      openAttentionTarget({ kind: 'touch', section: 'settings', focus: 'touch' });
    } else {
      setSection(section);
    }
    if (nav.classList.contains('more-open')) {
      nav.classList.remove('more-open');
      if (more) more.setAttribute('aria-expanded', 'false');
    }
  });

  if (more) more.addEventListener('click', () => {
    const open = nav.classList.toggle('more-open');
    more.setAttribute('aria-expanded', String(open));
  });

  subscribeDashboard('section', update);
  subscribeDashboard('settingsPanel', update);
  subscribeDashboard('selectedZone', update);
  subscribeDashboard('zoneNames', update);
  subscribeDashboard('live', update);
  subscribe(gkey.ip, paintLive);
  subscribe(gkey.uptime, paintLive);
  const uptimeTick = setInterval(paintUptime, 1000);
  el.addEventListener('hv6-unmount', () => clearInterval(uptimeTick), { once: true });
  subscribe(gkey.authorityProposalPending, paintNavAttention);
  for (let zone = 1; zone <= 6; zone++) {
    subscribe(key.state(zone), update);
    subscribe(key.enabled(zone), update);
    subscribe(key.motorLastFault(zone), update);
    subscribe(key.temp(zone), () => {}); // keep pipe/nav reactive via state/enabled
  }
  subscribeLanguage(() => { localize(el); update(); });
  localize(el);
  update();
}});
