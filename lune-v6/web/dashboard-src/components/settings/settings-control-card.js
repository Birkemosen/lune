import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { settingsCardHtml } from '../../core/ui-kit.js';
import { command } from '../../core/api.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const css = `
.settings-action-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-action-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-action-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-action-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-action-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;

injectStyle('settings-control-card', css);

const template = () => settingsCardHtml({
  className: 'settings-action-card',
  titleHtml: 'Recovery actions',
  bodyHtml: `
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  `,
});

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
