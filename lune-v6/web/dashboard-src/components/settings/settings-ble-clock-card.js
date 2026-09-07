import { component, subscribe } from '../../core/component.js';
import { cardForm, helpBadgeI18n } from '../../core/ui-kit.js';
import { ev, es, isEntityOn, setEntity } from '../../core/store.js';
import { command, setGlobalNumber, setGlobalSelect } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const INTERVALS = [
  { value: '15', labelKey: 'settings.bleClock.interval15' },
  { value: '60', labelKey: 'settings.bleClock.interval60' },
  { value: '360', labelKey: 'settings.bleClock.interval360' },
  { value: '1440', labelKey: 'settings.bleClock.interval1440' }
];

function lastSyncCopy() {
  if (String(es(gkey.bleClockSyncAdvertising) || '').toLowerCase() === 'on') {
    return t('common.clockSyncing');
  }
  const err = String(es(gkey.bleClockSyncLastError) || '').trim();
  if (err === 'clock_invalid') return t('settings.bleClock.waitingClock');
  if (err === 'ble_busy') return t('settings.bleClock.busy');
  if (err) return err;
  const epoch = Number(ev(gkey.bleClockSyncLastOkS) || 0);
  if (!epoch) return t('settings.bleClock.never');
  const ageS = Math.max(0, Math.round(Date.now() / 1000) - epoch);
  if (ageS < 60) return t('common.secondsAgo', { value: ageS });
  if (ageS < 3600) return t('common.minutesAgo', { value: Math.round(ageS / 60) });
  const hours = Math.round(ageS / 3600);
  return t('settings.bleClock.hoursAgo', { value: hours });
}

const template = () => `
  <div class="ui-card settings-ble-clock-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.bleClock.title">Room clocks</span>${helpBadgeI18n('settings.bleClock.help')}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.bleClock.enabledSub">Broadcast time so nearby Shelly BLU displays can correct drift.</span></span>
      <span class="ui-field"><div class="ui-toggle sbc-enabled" role="switch" data-i18n-label="settings.bleClock.title" aria-label="Enable room clock sync"></div></span>
    </div>
    <div class="ui-row sbc-interval-row">
      <span class="ui-label"><span data-i18n="settings.bleClock.interval">Broadcast interval</span> <span class="ui-sublabel" data-i18n="settings.bleClock.intervalSub">Short bursts. Displays usually apply time about once a day.</span></span>
      <span class="ui-field"><select class="ui-select sbc-interval"></select></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.bleClock.lastSync">Last broadcast</span> <span class="sbc-status ui-sublabel">—</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbc-now" data-i18n="settings.bleClock.syncNow">Sync now</button></span>
    </div>
  </div>
`;

export default component({
  tag: 'settings-ble-clock-card',
  render: template,
  onMount(ctx, el) {
    const toggleEl = el.querySelector('.sbc-enabled');
    const intervalEl = el.querySelector('.sbc-interval');
    const statusEl = el.querySelector('.sbc-status');
    const nowBtn = el.querySelector('.sbc-now');
    const form = cardForm(el);

    const fillIntervals = () => {
      const current = intervalEl.value;
      intervalEl.innerHTML = INTERVALS.map((opt) =>
        `<option value="${opt.value}">${t(opt.labelKey)}</option>`
      ).join('');
      if (current) intervalEl.value = current;
    };

    const paintStatus = () => {
      statusEl.textContent = lastSyncCopy();
    };

    fillIntervals();
    form.toggle(toggleEl, {
      read: () => isEntityOn(gkey.bleClockSyncEnabled),
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.bleClockSyncEnabled, { state: next });
        setGlobalSelect('ble_clock_sync_enabled', next)
          .catch(() => setEntity(gkey.bleClockSyncEnabled, { state: on ? 'off' : 'on' }));
      }
    });
    form.select(intervalEl, {
      read: () => String(Math.round(Number(ev(gkey.bleClockSyncIntervalMin)) || 60)),
      commit: (v) => {
        const minutes = Number(v);
        setEntity(gkey.bleClockSyncIntervalMin, { value: minutes });
        setGlobalNumber('ble_clock_sync_interval_min', minutes);
      }
    });

    nowBtn.addEventListener('click', () => {
      setEntity(gkey.bleClockSyncAdvertising, { state: 'on' });
      paintStatus();
      command('ble_clock_sync_now');
    });

    subscribe(gkey.bleClockSyncEnabled, form.refresh);
    subscribe(gkey.bleClockSyncIntervalMin, form.refresh);
    subscribe(gkey.bleClockSyncLastOkS, paintStatus);
    subscribe(gkey.bleClockSyncLastError, paintStatus);
    subscribe(gkey.bleClockSyncAdvertising, paintStatus);
    subscribeLanguage(() => {
      localize(el);
      fillIntervals();
      form.refresh();
      paintStatus();
    });
    localize(el);
    form.refresh();
    paintStatus();
  }
});
