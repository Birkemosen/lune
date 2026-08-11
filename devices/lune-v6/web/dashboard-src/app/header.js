import { component } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { getDashboardValue, subscribeDashboard, setSection } from '../core/store.js';
import { ev, es, isEntityOn } from '../core/store.js';
import { fmtUp, fmtWifi, fmtTimeFromAge } from '../utils/format.js';
import { gkey } from '../utils/keys.js';
import { subscribe } from '../core/component.js';
import { localize, t } from '../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.topbar {
  position: static;
  margin-bottom: 14px;
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg-vibrant);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(18px) saturate(1.25);
}

.topbar-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.top-brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  min-width: 0;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-brand {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 0 22px rgba(255,138,61,.32);
}

.side-nav {
  display: grid;
  gap: 6px;
}

.side-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid transparent;
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: .875rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .55px;
  box-shadow: none;
  transition: .2s ease;
}

.side-link:hover {
  color: var(--text-strong);
  background: rgba(255,255,255,.045);
}

.side-link.active {
  color: var(--text-strong);
  border-color: rgba(255,138,61,.54);
  background: linear-gradient(135deg, rgba(255,138,61,.25), rgba(255,255,255,.075));
  box-shadow: 0 0 0 1px rgba(255,138,61,.08), inset 0 1px 0 rgba(255,255,255,.18), 0 14px 26px rgba(255,138,61,.10);
}

.top-meta {
  display: grid;
  justify-items: end;
  row-gap: 4px;
  color: var(--muted);
  font-size: .82rem;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.meta-chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 34px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10);
}

.meta-chip-label {
  text-transform: uppercase;
  letter-spacing: .6px;
  font-size: .7rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-secondary);
}

.meta-chip-value {
  font-size: .875rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-strong);
}

.meta-chip-values {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meta-chip-state.synced {
  color: var(--state-ok);
  border-color: var(--success-border-soft);
  background: var(--success-bg);
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: var(--accent-border);
  background: var(--warn-bg-soft);
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: var(--panel-border-soft);
  background: var(--control-bg);
}

.brand-fw {
  min-height: 12px;
  font-size: .72rem;
  letter-spacing: .7px;
  color: var(--text-secondary);
  font-family: var(--mono);
  text-transform: uppercase;
}

.top-dot {
  width: 10px;
  height: 10px;
  border-radius: 6px;
  background: var(--state-disabled);
  transition: .2s ease;
}

.top-dot.on {
  background: var(--state-ok);
  box-shadow: 0 0 12px var(--success-border);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  .top-meta { justify-items: center; }
  .top-brand { justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .side-nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  .side-link {
    min-width: 0;
    padding: 9px 6px;
    text-align: center;
    font-size: .78rem;
    letter-spacing: .5px;
  }
}
`;

injectStyle('hv6-header', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <header class="topbar">
    <div class="topbar-head">
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">Lune V6</div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label" data-i18n="meta.uptime">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label" data-i18n="meta.wifi">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
        </div>
      </div>
    </div>
  </header>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'hv6-header',
  render: template,
  onMount(ctx, el) {
    const dotEl = el.querySelector('#hdr-dot');
    const syncEl = el.querySelector('#hdr-sync');
    const upEl = el.querySelector('#hdr-up');
    const wifiEl = el.querySelector('#hdr-wifi');
    const fwEl = el.querySelector('#hdr-fw');

    function updateMeta() {
      const live = getDashboardValue('live');
      const pendingWrites = getDashboardValue('pendingWrites');
      const mock = !!(window.HV6_DASHBOARD_CONFIG && window.HV6_DASHBOARD_CONFIG.mock);

      dotEl.classList.toggle('on', !!live);
      // Connection status — not a save indicator (per-card Apply owns saving).
      let connLabel, connState;
      if (pendingWrites > 0) { connLabel = t('status.saving'); connState = 'saving'; }
      else if (mock) { connLabel = (window.HV6_DASHBOARD_CONFIG.mockLabel || t('status.mock')); connState = 'synced'; }
      else if (live) { connLabel = t('status.live'); connState = 'synced'; }
      else { connLabel = t('status.offline'); connState = 'offline'; }
      syncEl.textContent = connLabel;
      syncEl.className = 'meta-chip meta-chip-state ' + connState;
      upEl.textContent = fmtUp(ev(gkey.uptime));
      wifiEl.textContent = fmtWifi(ev(gkey.wifi));
      const fw = getDashboardValue('firmwareVersion') || es(gkey.firmware);
      fwEl.textContent = fw ? 'FW ' + fw : '';
    }

    subscribeDashboard('live', updateMeta);
    subscribeDashboard('pendingWrites', updateMeta);
    subscribeDashboard('firmwareVersion', updateMeta);
    subscribe(gkey.uptime, updateMeta);
    subscribe(gkey.wifi, updateMeta);
    subscribe(gkey.firmware, updateMeta);
    localize(el);
    updateMeta();
  }
});

const navTemplate = () => `
  <nav class="side-nav">
    <a href="#" class="side-link active" data-section="overview" data-i18n="nav.monitor">Monitor</a>
    <a href="#" class="side-link" data-section="zones" data-i18n="nav.zones">Zones</a>
    <a href="#" class="side-link" data-section="settings" data-i18n="nav.settings">Settings</a>
    <a href="#" class="side-link" data-section="diagnostics" data-i18n="nav.diagnostics">Diagnostics</a>
  </nav>
`;

component({
  tag: 'hv6-sidebar',
  render: navTemplate,
  onMount(ctx, el) {
    const links = el.querySelectorAll('.side-link');
    function updateSection() {
      const section = getDashboardValue('section');
      links.forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-section') === section);
      });
    }
    links.forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        setSection(node.getAttribute('data-section'));
      });
    });
    subscribeDashboard('section', updateSection);
    localize(el);
    updateSection();
  }
});
