import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { getDashboardValue, subscribeDashboard, zoneTag } from '../../core/store.js';
import { applyZoneName } from '../../core/api.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const css = `.zone-room-card { height: auto; }`;

injectStyle('zone-room-card', css);

// ZoneConfig.name is char[16] on the device — leave room for the NUL.
const NAME_MAX = 15;

const template = () => `
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Zone friendly name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="${NAME_MAX}" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`;

export default component({
  tag: 'zone-room-card',
  render: template,
  onMount(ctx, el) {
    const nameEl = el.querySelector('.zr-friendly');

    function zone() {
      return getDashboardValue('selectedZone');
    }

    // immediate: provision panel hides the Apply banner, so blur must write.
    const form = cardForm(el, { immediate: true });
    form.text(nameEl, {
      read: () => zoneTag(zone()) || '',
      commit: (v) => applyZoneName(zone(), v),
    });

    function refreshFromDevice(id) {
      const z = zone();
      if (id === key.name(z) || /^text-zone_\d+_name$/.test(id)) form.refresh();
    }

    subscribeDashboard('selectedZone', () => { form.discard(); });
    subscribeDashboard('zoneNames', form.refresh);
    for (let z = 1; z <= 6; z++) subscribe(key.name(z), refreshFromDevice);
    subscribeLanguage(() => localize(el));
    localize(el);
    form.refresh();
  }
});
