import { component, subscribe } from '../../core/component.js';
import { cardForm, helpBadgeI18n } from '../../core/ui-kit.js';
import { ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalNumber, setGlobalSelect } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const template = () => `
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${helpBadgeI18n('settings.minFlow.help')}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`;

export default component({
  tag: 'settings-minimum-flow-card',
  render: template,
  onMount(ctx, el) {
    const toggleEl = el.querySelector('.smf-always');
    const pctEl = el.querySelector('.smf-pct');
    const pctRow = el.querySelector('.smf-pct-row');
    const form = cardForm(el);

    const showOpening = (enabled) => {
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
