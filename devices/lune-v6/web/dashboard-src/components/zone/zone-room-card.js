import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { getDashboardValue, subscribeDashboard, zoneTag } from '../../core/store.js';
import { applyZoneName } from '../../core/api.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `.zone-room-card { height: 100%; }`;

injectStyle('zone-room-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-room-card',
  render: template,
  onMount(ctx, el) {
    const nameEl = el.querySelector('.zr-friendly');

    function zone() {
      return getDashboardValue('selectedZone');
    }

    const form = cardForm(el);

    form.text(nameEl, { read: () => zoneTag(zone()) || '', commit: (v) => applyZoneName(zone(), v) });

    // Switching zones abandons any pending edits and loads the new zone.
    subscribeDashboard('selectedZone', form.discard);
    subscribeDashboard('zoneNames', form.refresh);
    subscribeLanguage(() => localize(el));
    localize(el);
    form.refresh();
  }
});
