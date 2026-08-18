import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { command } from '../../core/api.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.settings-card{background:var(--surface-raised);border:1px solid var(--separator);border-radius:10px;padding:18px;box-shadow:none}
.settings-card .card-title{margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--separator);color:var(--text-strong);font-size:.92rem;font-weight:650}
.settings-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-card .btn{width:100%;min-width:0;min-height:44px;padding:9px 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;cursor:pointer}
.settings-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;

injectStyle('settings-control-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="settings-card settings-action-card">
    <div class="card-title">Recovery actions</div>
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-control-card',
  render: template,
  onMount(ctx, el) {
    subscribeLanguage(() => localize(el));
    localize(el);

    el.querySelector('.sc-reset-probe-map').addEventListener('click', () => {
      if (!window.confirm('Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.')) return;
      command('reset_1wire_probe_map_reboot');
    });

    el.querySelector('.sc-dump-1wire').addEventListener('click', () => {
      command('dump_1wire_probe_diagnostics');
    });

    el.querySelector('.sc-restart').addEventListener('click', () => {
      if (!window.confirm('Restart Lune V6 now? Heating continues after the controller has started again.')) return;
      command('restart');
    });
  }
});
