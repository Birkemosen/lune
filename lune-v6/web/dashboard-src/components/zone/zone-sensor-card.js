import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { es, ev, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneSelect, setZoneText } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input,
.zone-sensor-card .ext-input {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 10px;
  font-size: .875rem;
  font-family: var(--mono);
  line-height: 1.2;
  transition: border-color .15s ease;
}
.zone-sensor-card .ext-input { font-family: inherit; margin-top: 8px; width: 100%; }
.zone-sensor-card .ble-row .ble-input:focus,
.zone-sensor-card .ext-input:focus {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-color: var(--accent);
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  box-sizing: border-box;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 13px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: .82rem;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-scan:disabled { opacity: .5; cursor: default; }
.zone-sensor-card .ble-scan-list {
  margin-top: 6px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,.025);
}
.zone-sensor-card .ble-scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: .82rem;
  gap: 8px;
  border-bottom: 1px solid var(--panel-border);
}
.zone-sensor-card .ble-scan-item:last-child { border-bottom: none; }
.zone-sensor-card .ble-scan-item .ble-mac {
  font-family: monospace;
  color: var(--text);
  font-size: .8rem;
}
.zone-sensor-card .ble-scan-item .ble-meta { color: var(--text-secondary); font-size: .75rem; }
.zone-sensor-card .ble-scan-item .ble-badge {
  color: var(--text-faint);
  font-size: .72rem;
  font-style: italic;
}
.zone-sensor-card .btn-assign {
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-assign:hover { background: rgba(var(--accent-rgb),.10); }
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
.zone-sensor-card .ext-age {
  margin-top: 8px;
  font-size: .78rem;
  color: var(--text-muted);
}
`;

injectStyle('zone-sensor-card', css);

const template = () => `
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.tempSource">Room temperature source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section" data-i18n="zone.sensor.bleSensor">BLE sensor</div>
        <div class="ui-note" data-i18n="zone.sensor.bleNote">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</div>
        <div class="ble-row">
          <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan" data-i18n="zone.sensor.scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="zs-row-ext" style="display:none">
        <div class="ui-section" data-i18n="zone.sensor.externalTitle">External (Wi‑Fi)</div>
        <div class="ui-note" data-i18n="zone.sensor.externalNote">Bind a stable sensor_id. Producers POST temperatures; zone mapping stays on V6.</div>
        <input class="ext-input zs-sid" maxlength="47" placeholder="AA:BB:CC:DD:EE:FF or entity id" data-i18n-placeholder="zone.sensor.sensorIdPh">
        <input class="ext-input zs-sname" maxlength="23" placeholder="Friendly name (optional)" data-i18n-placeholder="zone.sensor.sensorNamePh">
        <div class="ext-age zs-age"></div>
      </div>
    </div>
  `;

function sourceToUiValue(source) {
  if (source === 'BLE' || source === 'BLE Sensor') return 'BLE Sensor';
  if (source === 'External' || source === 'EXTERNAL') return 'External';
  return 'Local Probe';
}

function uiValueToApiValue(value) {
  if (value === 'BLE Sensor') return 'BLE';
  if (value === 'External') return 'External';
  return 'Local Probe';
}

function setSourceOptions(selectEl, value) {
  const html =
    '<option value="Local Probe" data-i18n="zone.sensor.localProbe">' + t('zone.sensor.localProbe') + '</option>' +
    '<option value="BLE Sensor" data-i18n="zone.sensor.bleSource">' + t('zone.sensor.bleSource') + '</option>' +
    '<option value="External" data-i18n="zone.sensor.externalSource">' + t('zone.sensor.externalSource') + '</option>';
  if (selectEl.innerHTML !== html) {
    selectEl.innerHTML = html;
  }
  selectEl.value = value;
}

export default component({
  tag: 'zone-sensor-card',
  render: template,
  onMount(ctx, el) {
    const sourceEl = el.querySelector('.zs-source');
    const bleEl = el.querySelector('.zs-ble');
    const rowBle = el.querySelector('.zs-row-ble');
    const rowExt = el.querySelector('.zs-row-ext');
    const sidEl = el.querySelector('.zs-sid');
    const snameEl = el.querySelector('.zs-sname');
    const ageEl = el.querySelector('.zs-age');
    const scanBtn = el.querySelector('.zs-scan');
    const scanList = el.querySelector('.zs-scan-list');
    let paintedZone = 0;

    function selectedZone() {
      return getDashboardValue('selectedZone');
    }

    function paintSourceRows() {
      const v = sourceEl.value;
      rowBle.style.display = v === 'BLE Sensor' ? '' : 'none';
      rowExt.style.display = v === 'External' ? '' : 'none';
    }

    const form = cardForm(el);
    setSourceOptions(sourceEl, 'Local Probe');
    form.select(sourceEl, { read: () => sourceToUiValue(String(es(key.tempSource(selectedZone())) || '')), commit: (v) => setZoneSelect(selectedZone(), 'zone_temp_source', uiValueToApiValue(v)) });
    form.text(bleEl, { read: () => es(key.ble(selectedZone())) || '', commit: (v) => setZoneText(selectedZone(), 'zone_ble_mac', v) });
    form.text(sidEl, { read: () => es(key.sensorId(selectedZone())) || '', commit: (v) => setZoneText(selectedZone(), 'zone_sensor_id', v) });
    form.text(snameEl, { read: () => es(key.sensorName(selectedZone())) || '', commit: (v) => setZoneText(selectedZone(), 'zone_sensor_name', v) });
    sourceEl.addEventListener('change', paintSourceRows);

    function paintAge() {
      const z = selectedZone();
      const age = Number(ev(key.externalAge(z)));
      if (!Number.isFinite(age) || age < 0) {
        ageEl.textContent = t('zone.sensor.noIngestYet');
        return;
      }
      const sec = Math.round(age / 1000);
      ageEl.textContent = t('zone.sensor.lastIngestAge', { sec });
    }

    function update() {
      const zone = selectedZone();
      if (paintedZone !== zone) {
        paintedZone = zone;
        scanList.style.display = 'none';
        form.discard();
      } else {
        form.refresh();
      }
      paintSourceRows();
      paintAge();
    }

    scanBtn.addEventListener('click', () => {
      scanBtn.disabled = true;
      scanBtn.textContent = t('zone.sensor.scanning');
      scanList.style.display = '';
      scanList.innerHTML = '<div class="scan-msg">' + t('zone.sensor.scanning') + '</div>';
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8000);
      fetch('/api/v1/ble-scan', { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = t('zone.sensor.scan');
          const sensors = (data && data.data && data.data.sensors) || data.sensors || [];
          if (!sensors.length) {
            scanList.innerHTML = '<div class="scan-msg">' + t('zone.sensor.noSensors') + '</div>';
            return;
          }
          const currentMac = (es(key.ble(selectedZone())) || '').toUpperCase();
          scanList.innerHTML = sensors.map((s) => {
            const mac = String(s.mac || '').toUpperCase();
            let badge = '';
            if (mac === currentMac) badge = '<span class="ble-badge">' + t('zone.sensor.assignedThisZone') + '</span>';
            else if (s.zone > 0) badge = '<span class="ble-badge">' + t('zone.sensor.zoneBadge', { zone: s.zone }) + '</span>';
            const temp = Number.isFinite(Number(s.temp_c)) ? Number(s.temp_c).toFixed(1) + '°C' : '—';
            const name = s.name ? String(s.name) : '';
            return `<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${mac}</div>
                <div class="ble-meta">${name ? name + ' · ' : ''}${temp} · ${s.rssi || '?'} dBm ${badge}</div>
              </div>
              <button class="btn-assign" data-mac="${mac}">${t('zone.sensor.assign')}</button>
            </div>`;
          }).join('');
          scanList.querySelectorAll('.btn-assign').forEach((btn) => {
            btn.addEventListener('click', () => {
              const mac = btn.getAttribute('data-mac') || '';
              bleEl.value = mac;
              bleEl.dispatchEvent(new Event('change', { bubbles: true }));
              setZoneText(selectedZone(), 'zone_ble_mac', mac);
            });
          });
        })
        .catch((err) => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = t('zone.sensor.scan');
          const msg = err && err.name === 'AbortError'
            ? t('zone.sensor.scanTimeout')
            : t('zone.sensor.scanFailed');
          scanList.innerHTML = '<div class="scan-msg">' + msg + '</div>';
        });
    });

    update();
    subscribeDashboard(update);
    subscribeLanguage(() => {
      localize(el);
      setSourceOptions(sourceEl, sourceEl.value);
      scanBtn.textContent = scanBtn.disabled ? scanBtn.textContent : t('zone.sensor.scan');
      paintAge();
    });
    return subscribe(() => {});
  },
});
