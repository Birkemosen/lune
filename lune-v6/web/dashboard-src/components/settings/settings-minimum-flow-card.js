import { component, subscribe } from '../../core/component.js';
import { cardForm, helpBadgeI18n, settingsCardHtml, navSwitchHtml } from '../../core/ui-kit.js';
import { ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalNumber, setGlobalSelect } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const template = () => settingsCardHtml({
  className: 'settings-minimum-flow-card',
  titleHtml: `<span data-i18n="settings.minFlow.title">Minimum zone flow</span>${helpBadgeI18n('settings.minFlow.help')}`,
  bodyHtml: `
    ${navSwitchHtml({ on: false, label: 'Enable minimum zone flow', className: 'smf-always', attrs: 'data-i18n-label="settings.minFlow.title"' })}
    <div class="ui-row smf-pct-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Minimum total opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">Only across loops already accepting heat.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
    <p class="ui-note smf-failsafe" data-i18n="settings.minFlow.failsafe">
      Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.
    </p>
  `,
});

export default component({
  tag: 'settings-minimum-flow-card',
  render: template,
  onMount(ctx, el) {
    const block = el.closest('[data-collapse-block="min-flow"]');
    const host = block?.querySelector('[data-toggle-host="min-flow"]');
    const toggleEl = el.querySelector('.smf-always');
    if (host && toggleEl) host.appendChild(toggleEl);

    const pctEl = el.querySelector('.smf-pct');
    const pctRow = el.querySelector('.smf-pct-row');
    const form = cardForm(el, { immediate: true });

    const showOpening = (enabled) => {
      block?.classList.toggle('is-collapsed', !enabled);
      pctRow.hidden = !enabled;
      pctRow.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      pctEl.disabled = !enabled;
    };

    form.toggle(toggleEl, {
      read: () => isEntityOn(gkey.minimumFlowAlways),
      onChange: showOpening,
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.minimumFlowAlways, { state: next });
        setGlobalSelect('minimum_flow_always', next)
          .catch(() => setEntity(gkey.minimumFlowAlways, { state: on ? 'off' : 'on' }));
      }
    });
    form.num(pctEl, {
      read: () => ev(gkey.minZoneFlowPct),
      commit: (v) => {
        setEntity(gkey.minZoneFlowPct, { value: v });
        setGlobalNumber('min_zone_flow_pct', v);
      }
    });

    subscribe(gkey.minimumFlowAlways, form.refresh);
    subscribe(gkey.minZoneFlowPct, form.refresh);
    subscribeLanguage(() => localize(el));
    localize(el);
    form.refresh();
  }
});
