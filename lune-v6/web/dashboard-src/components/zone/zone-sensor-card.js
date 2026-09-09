import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { es, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneSelect, setZoneText } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input {
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
.zone-sensor-card .ble-row .ble-input:focus {
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
.zone-sensor-card .btn-scan:disabled {
  opacity: .5;
  cursor: default;
}
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
.zone-sensor-card .ble-scan-item .ble-meta {
  color: var(--text-secondary);
  font-size: .75rem;
}
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
.zone-sensor-card .btn-assign:hover {
  background: rgba(var(--accent-rgb),.10);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
`;

injectStyle('zone-sensor-card', css);

// ========================================
// TEMPLATE
// ========================================
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
    </div>
  `;

function sourceToUiValue(source) {
  if (source === 'BLE' || source === 'BLE Sensor') return 'BLE Sensor';
  return 'Local Probe';
}

function uiValueToApiValue(value) {
  if (value === 'BLE Sensor') return 'BLE';
  return 'Local Probe';
}

function setSourceOptions(selectEl, value) {
  const html =
    '<option value="Local Probe" data-i18n="zone.sensor.localProbe">' + t('zone.sensor.localProbe') + '</option>' +
    '<option value="BLE Sensor" data-i18n="zone.sensor.bleSource">' + t('zone.sensor.bleSource') + '</option>';
  if (selectEl.innerHTML !== html) {
    selectEl.innerHTML = html;
  }
  selectEl.value = value;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-sensor-card',
  render: template,
  onMount(ctx, el) {
    const sourceEl = el.querySelector('.zs-source');
    const bleEl = el.querySelector('.zs-ble');
    const rowBle = el.querySelector('.zs-row-ble');
    const scanBtn = el.querySelector('.zs-scan');
    const scanList = el.querySelector('.zs-scan-list');
    let paintedZone = 0;

    function selectedZone() {
      return getDashboardValue('selectedZone');
    }

    // BLE row visibility follows the *staged* source so picking "BLE Sensor"
    // reveals the field immediately, before Apply.
    function paintBleRow() {
      rowBle.style.display = sourceEl.value === 'BLE Sensor' ? '' : 'none';
    }

    const form = cardForm(el);
    setSourceOptions(sourceEl, 'Local Probe');
    form.select(sourceEl, { read: () => sourceToUiValue(String(es(key.tempSource(selectedZone())) || '')), commit: (v) => setZoneSelect(selectedZone(), 'zone_temp_source', uiValueToApiValue(v)) });
    const bleField = form.text(bleEl, { read: () => es(key.ble(selectedZone())) || '', commit: (v) => setZoneText(selectedZone(), 'zone_ble_mac', v) });
    sourceEl.addEventListener('change', paintBleRow);

    function update() {
      const zone = selectedZone();
      if (paintedZone !== zone) {
        paintedZone = zone;
        scanList.style.display = 'none';
        form.discard();   // drop staged edits from the previous zone
      } else {
        form.refresh();
      }
      paintBleRow();
    }

    function updateIfSelectedZone(id) {
      const zone = selectedZone();
      if (id === key.tempSource(zone) || id === key.ble(zone)) {
        form.refresh();
        paintBleRow();
      }
    }

    // BLE scan logic
    scanBtn.addEventListener('click', () => {
      if (scanBtn.disabled) return;
      scanBtn.disabled = true;
      scanBtn.textContent = '…';
      scanList.style.display = '';
      scanList.innerHTML = '<div class="scan-msg">' + t('zone.sensor.scanning') + '</div>';

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8000);

      fetch('/api/lv6/v1/ble-scan', { cache: 'no-store', signal: ctrl.signal })
        .then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(data => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = t('zone.sensor.scan');
          if (!data.ok || !data.sensors || data.sensors.length === 0) {
            scanList.innerHTML = '<div class="scan-msg">' + t('zone.sensor.noSensors') + '</div>';
            return;
          }
          const zone = selectedZone();
          const currentMac = (es(key.ble(zone)) || '').toUpperCase();
          const esc = (str) => String(str).replace(/[&<>"']/g, (c) =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
          let html = '';
          for (const s of data.sensors) {
            const mac = s.mac.toUpperCase();
            const name = s.name ? esc(s.name) : '';
            const temp = s.temp_c != null ? s.temp_c.toFixed(1) + '°C' : '—';
            const rssi = s.rssi != null ? s.rssi + ' dBm' : '';
            const age = s.age_s < 60
              ? t('common.secondsAgo', { value: s.age_s })
              : t('common.minutesAgo', { value: Math.round(s.age_s / 60) });
            let badge = '';
            if (mac === currentMac) badge = '<span class="ble-badge">' + t('zone.sensor.assignedThisZone') + '</span>';
            else if (s.zone > 0) badge = '<span class="ble-badge">' + t('zone.sensor.zoneBadge', { zone: s.zone }) + '</span>';
            // Name as primary line when known, MAC as secondary; MAC alone otherwise.
            const title = name
              ? `<div class="ble-mac">${name}</div><div class="ble-meta">${mac}</div>`
              : `<div class="ble-mac">${mac}</div>`;
            html += `<div class="ble-scan-item">
              <div>
                ${title}
                <div class="ble-meta">${temp} &nbsp;${rssi} &nbsp;${age}</div>
                ${badge}
              </div>
              <button class="btn-assign" data-mac="${mac}">${t('zone.sensor.assign')}</button>
            </div>`;
          }
          scanList.innerHTML = html;

          scanList.querySelectorAll('.btn-assign').forEach(btn => {
            btn.addEventListener('click', () => {
              bleEl.value = btn.dataset.mac;
              bleField.markDirty();   // staged — committed on Apply
              scanList.style.display = 'none';
            });
          });
        })
        .catch((err) => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = t('zone.sensor.scan');
          const msg = (err && err.name === 'AbortError')
            ? t('zone.sensor.scanTimeout')
            : t('zone.sensor.scanFailed');
          scanList.innerHTML = '<div class="scan-msg">' + msg + '</div>';
        });
    });

    subscribeDashboard('selectedZone', update);
    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.tempSource(zone), updateIfSelectedZone);
      subscribe(key.ble(zone), updateIfSelectedZone);
    }
    subscribeLanguage(() => {
      const sourceValue = sourceEl.value || 'Local Probe';
      setSourceOptions(sourceEl, sourceValue);
      scanBtn.textContent = scanBtn.disabled ? scanBtn.textContent : t('zone.sensor.scan');
      localize(el);
      paintBleRow();
    });
    localize(el);
    update();
  }
});
