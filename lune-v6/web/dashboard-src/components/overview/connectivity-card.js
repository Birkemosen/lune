import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es } from '../../core/store.js';
import { fmtUp } from '../../utils/format.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.connectivity-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
  height: 100%;
  box-sizing: border-box;
}

.connectivity-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.connectivity-card .st { width: 100%; border-collapse: collapse; }
.connectivity-card .st td { padding: 7px 0; font-size: .92rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 42%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); font-family: var(--mono); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;

injectStyle('connectivity-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
      <tr><td data-i18n="overview.connectivity.version">Version</td><td class="cc-ver">---</td></tr>
    </table>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'connectivity-card',
  render: template,
  onMount(ctx, el) {
    const ipEl = el.querySelector('.cc-ip');
    const ssidEl = el.querySelector('.cc-ssid');
    const macEl = el.querySelector('.cc-mac');
    const upEl = el.querySelector('.cc-up');
    const verEl = el.querySelector('.cc-ver');
    let uptimeBaseS = 0;
    let uptimeBaseAt = Date.now();
    let haveUptime = false;

    function paintUptime() {
      if (!haveUptime) {
        upEl.textContent = '---';
        return;
      }
      const elapsed = Math.max(0, Math.floor((Date.now() - uptimeBaseAt) / 1000));
      const text = fmtUp(uptimeBaseS + elapsed);
      if (upEl.textContent !== text) upEl.textContent = text;
    }

    function update() {
      ipEl.textContent = es(gkey.ip) || '---';
      ssidEl.textContent = es(gkey.ssid) || '---';
      macEl.textContent = es(gkey.mac) || '---';
      verEl.textContent = es(gkey.firmware) || '---';
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

    subscribe(gkey.ip, update);
    subscribe(gkey.ssid, update);
    subscribe(gkey.mac, update);
    subscribe(gkey.firmware, update);
    subscribe(gkey.uptime, update);
    const uptimeTick = setInterval(paintUptime, 1000);
    el.addEventListener('hv6-unmount', () => clearInterval(uptimeTick), { once: true });
    subscribeLanguage(() => localize(el));
    localize(el);
    update();
  }
});
