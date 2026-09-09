import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { dumpTaskStats } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS — mirrors the manifold card's stat-grid language
// ========================================
const css = `
.diag-system-card .sys-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 4px;
}
.diag-system-card .sys-cell { display: flex; flex-direction: column; gap: 4px; }
.diag-system-card .sys-label {
  color: var(--text-secondary); font-size: .64rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
}
.diag-system-card .sys-value {
  font-family: var(--mono); font-size: 1.5rem; font-weight: 800;
  color: var(--text-strong); line-height: 1;
}
.diag-system-card .sys-value.warn { color:var(--state-danger); }
.diag-system-card .sys-bar {
  height: 4px; border-radius: 3px; margin-top: 6px;
  background: var(--control-bg-hover); overflow: hidden;
}
.diag-system-card .sys-bar > i {
  display: block; height: 100%; width: 0%;
  background:var(--accent);
  transition: width .4s ease;
}
.diag-system-card .sys-cell-wide { grid-column: 1 / -1; }
.diag-system-card .sys-value-text { font-size: .95rem; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;

injectStyle('diag-system-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card diag-system-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.system.title">System</span></div>
    <div class="sys-grid">
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.cpu0">CPU Core 0</div>
        <div class="sys-value" data-k="cpu0">—</div>
        <div class="sys-bar"><i data-bar="cpu0"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.cpu1">CPU Core 1</div>
        <div class="sys-value" data-k="cpu1">—</div>
        <div class="sys-bar"><i data-bar="cpu1"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.heap">Free Heap (int)</div>
        <div class="sys-value" data-k="heap">—</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.dma">Free DMA</div>
        <div class="sys-value" data-k="dma">—</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.largestInternal">Largest free (int)</div>
        <div class="sys-value" data-k="largestInternal">—</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.minInternal">Min free (int)</div>
        <div class="sys-value" data-k="minInternal">—</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.psram">Free PSRAM</div>
        <div class="sys-value" data-k="psram">—</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.largestPsram">Largest free PSRAM</div>
        <div class="sys-value" data-k="largestPsram">—</div>
      </div>
      <div class="sys-cell sys-cell-wide">
        <div class="sys-label" data-i18n="diagnostics.system.resetReason">Last reset reason</div>
        <div class="sys-value sys-value-text" data-k="reset">—</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button" data-i18n="diagnostics.system.dump">Dump task stats to log</button>
    <div class="ui-note" data-i18n="diagnostics.system.note">Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.</div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-system-card',
  render: template,
  onMount(ctx, el) {
    const cpu0El = el.querySelector('[data-k="cpu0"]');
    const cpu1El = el.querySelector('[data-k="cpu1"]');
    const heapEl = el.querySelector('[data-k="heap"]');
    const dmaEl = el.querySelector('[data-k="dma"]');
    const largestInternalEl = el.querySelector('[data-k="largestInternal"]');
    const minInternalEl = el.querySelector('[data-k="minInternal"]');
    const psramEl = el.querySelector('[data-k="psram"]');
    const largestPsramEl = el.querySelector('[data-k="largestPsram"]');
    const bar0 = el.querySelector('[data-bar="cpu0"]');
    const bar1 = el.querySelector('[data-bar="cpu1"]');
    const resetEl = el.querySelector('[data-k="reset"]');

    const setCpu = (valEl, barEl, v) => {
      if (v == null || !Number.isFinite(Number(v))) {
        valEl.textContent = '—';
        valEl.classList.remove('warn');
        barEl.style.width = '0%';
        return;
      }
      const pct = Math.max(0, Math.min(100, Number(v)));
      valEl.textContent = pct.toFixed(0) + '%';
      valEl.classList.toggle('warn', pct >= 90);
      barEl.style.width = pct + '%';
    };
    const setKb = (valEl, v, warnBelow) => {
      if (v == null || !Number.isFinite(Number(v))) { valEl.textContent = '—'; return; }
      const kb = Number(v);
      valEl.textContent = kb + ' KB';
      valEl.classList.toggle('warn', warnBelow != null && kb < warnBelow);
    };

    const update = () => {
      setCpu(cpu0El, bar0, ev(gkey.cpuLoadCore0));
      setCpu(cpu1El, bar1, ev(gkey.cpuLoadCore1));
      setKb(heapEl, ev(gkey.freeInternalKb), 48);   // < 48 KB internal = tight for HTTPS/TLS tasks
      setKb(dmaEl, ev(gkey.freeDmaKb), 32);
      setKb(largestInternalEl, ev(gkey.largestInternalKb), 24);
      setKb(minInternalEl, ev(gkey.minInternalKb), 48);
      setKb(psramEl, ev(gkey.freePsramKb), null);
      setKb(largestPsramEl, ev(gkey.largestPsramKb), null);
      // Firmware publishes the boot cause as a text sensor in /state; a
      // diagnostics fetch may fill the dashboard value instead.
      const reason = String(es(gkey.resetReason) || getDashboardValue('resetReason') || '').trim();
      resetEl.textContent = reason || '—';
    };

    el.querySelector('.sys-dump').addEventListener('click', () => {
      dumpTaskStats().catch((err) => console.error('[System] dump failed:', err));
    });

    subscribe(gkey.cpuLoadCore0, update);
    subscribe(gkey.cpuLoadCore1, update);
    subscribe(gkey.freeInternalKb, update);
    subscribe(gkey.freeDmaKb, update);
    subscribe(gkey.largestInternalKb, update);
    subscribe(gkey.minInternalKb, update);
    subscribe(gkey.freePsramKb, update);
    subscribe(gkey.largestPsramKb, update);
    subscribe(gkey.resetReason, update);
    subscribeDashboard('resetReason', update);
    subscribeLanguage(() => localize(el));
    localize(el);
    update();
  }
});
