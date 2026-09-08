import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { es, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneSelect } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `.zone-coordination-card { height: 100%; }`;
injectStyle('zone-coordination-card', css);

const template = () => `
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="zone.sensor.mergeWith">Merge With Zone</span> <span class="ui-sublabel" data-i18n="zone.sensor.mergeHelp">merge into one room - mean temperature, valves open equally</span></span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;

function buildSyncOptions(selectEl, zone) {
  const current = selectEl.value;
  let html = '<option value="None" data-i18n="common.none">' + t('common.none') + '</option>';
  for (let z = 1; z <= 6; z++) {
    if (z === zone) continue;
    html += '<option value="Zone ' + z + '">' + t('common.zone') + ' ' + z + '</option>';
  }
  selectEl.innerHTML = html;
  selectEl.value = current || 'None';
}

export default component({
  tag: 'zone-coordination-card',
  render: template,
  onMount(ctx, el) {
    const syncEl = el.querySelector('.zc-sync');
    let syncZone = 0;

    function selectedZone() {
      return getDashboardValue('selectedZone');
    }

    const form = cardForm(el);
    form.select(syncEl, {
      read: () => es(key.syncTo(selectedZone())) || 'None',
      commit: (v) => setZoneSelect(selectedZone(), 'zone_sync_to', v),
    });

    function update() {
      const zone = selectedZone();
      if (syncZone !== zone) {
        buildSyncOptions(syncEl, zone);
        syncZone = zone;
        form.discard();
      } else {
        form.refresh();
      }
    }

    function updateIfSelectedZone(id) {
      const zone = selectedZone();
      if (id === key.syncTo(zone) || /^select-zone_\d+_sync_to$/.test(id)) {
        form.refresh();
      }
    }

    subscribeDashboard('selectedZone', update);
    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.syncTo(zone), updateIfSelectedZone);
    }
    subscribeLanguage(() => {
      const syncValue = syncEl.value || 'None';
      buildSyncOptions(syncEl, selectedZone());
      syncEl.value = syncValue;
      localize(el);
    });
    localize(el);
    update();
  },
});
