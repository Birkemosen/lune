import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n, navSwitchHtml, settingsCardHtml } from '../../core/ui-kit.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalNumber, setGlobalSelect } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const css = `
.settings-heating-mode-card .shm-options {
  display: grid;
  gap: 8px;
  margin: 0 0 12px;
}
.settings-heating-mode-card .shm-option {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid var(--separator);
  border-radius: 12px;
  background: var(--surface-1, transparent);
  cursor: pointer;
}
.settings-heating-mode-card .shm-option.is-selected {
  border-color: var(--forest);
  background: var(--fill-forest);
}
.settings-heating-mode-card .shm-option input {
  margin-top: 3px;
}
.settings-heating-mode-card .shm-option strong {
  display: block;
  font-size: .86rem;
  font-weight: 650;
}
.settings-heating-mode-card .shm-option span {
  display: block;
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: .74rem;
  line-height: 1.35;
}
.settings-heating-mode-card .shm-hp-fields[hidden],
.settings-heating-mode-card .shm-normal-fields[hidden],
.settings-heating-mode-card .shm-floor-row[hidden] { display: none !important; }
.settings-heating-mode-card .shm-note {
  margin: 0 0 12px;
  padding: 8px 10px;
  border-left: 3px solid var(--forest);
  background: color-mix(in srgb, var(--forest) 8%, transparent);
  color: var(--text-secondary);
  font-size: .76rem;
  line-height: 1.4;
}
.settings-heating-mode-card .shm-note[hidden] { display: none !important; }
`;
injectStyle('settings-heating-mode-card', css);

function modeValue() {
  const raw = String(es(gkey.heatingMode) || 'heat_pump').toLowerCase();
  return raw === 'normal' || raw === 'boiler' ? 'normal' : 'heat_pump';
}

const template = () => settingsCardHtml({
  className: 'settings-heating-mode-card',
  titleHtml: `<span data-i18n="settings.heatingMode.title">Heating mode</span>${helpBadgeI18n('settings.heatingMode.help')}`,
  bodyHtml: `
    <p class="shm-note shm-touch-note" hidden data-i18n="settings.heatingMode.touchNote">
      Lune Touch is coordinating. This mode applies when Touch is offline.
    </p>
    <div class="shm-options" role="radiogroup" aria-label="Heating mode">
      <label class="shm-option shm-opt-normal">
        <input type="radio" name="shm-mode" value="normal" />
        <span>
          <strong data-i18n="settings.heatingMode.normal">Normal (boiler, gas, district)</strong>
          <span data-i18n="settings.heatingMode.normalSub">Zones open proportionally below setpoint and close when the room reaches target.</span>
        </span>
      </label>
      <label class="shm-option shm-opt-heatpump">
        <input type="radio" name="shm-mode" value="heat_pump" />
        <span>
          <strong data-i18n="settings.heatingMode.heatPump">Heat pump</strong>
          <span data-i18n="settings.heatingMode.heatPumpSub">Satisfied zones keep a high base opening; valves trim gently and close only when overheated.</span>
        </span>
      </label>
    </div>
    <div class="shm-normal-fields">
      ${navSwitchHtml({ on: false, label: 'Minimum total opening', className: 'shm-floor-on', attrs: 'data-i18n-label="settings.minFlow.title"' })}
      <p class="ui-note" data-i18n="settings.minFlow.help">Optional. Opens loops that are already calling a little further so the pump never runs against almost-closed valves. Satisfied rooms are never opened.</p>
      <div class="ui-row shm-floor-row">
        <span class="ui-label"><span data-i18n="settings.minFlow.opening">Minimum total opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">Sum across loops already accepting heat.</span></span>
        <span class="ui-field"><input class="ui-input shm-floor-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
      </div>
    </div>
    <div class="shm-hp-fields">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.heatingMode.base">Base opening (%)</span></span>
        <span class="ui-field"><input class="ui-input shm-base" type="number" min="30" max="100" step="1" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.heatingMode.margin">Overheat margin (°C)</span></span>
        <span class="ui-field"><input class="ui-input shm-margin" type="number" min="0.3" max="3" step="0.1" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.heatingMode.trimFloor">Trim floor (%)</span></span>
        <span class="ui-field"><input class="ui-input shm-trim" type="number" min="0" max="100" step="1" /></span>
      </div>
    </div>
  `,
});

export default component({
  tag: 'settings-heating-mode-card',
  render: template,
  onMount(ctx, el) {
    const form = cardForm(el, { immediate: true });
    const normalOpt = el.querySelector('.shm-opt-normal');
    const heatOpt = el.querySelector('.shm-opt-heatpump');
    const normalInput = normalOpt.querySelector('input');
    const heatInput = heatOpt.querySelector('input');
    const hpFields = el.querySelector('.shm-hp-fields');
    const touchNote = el.querySelector('.shm-touch-note');
    const baseEl = el.querySelector('.shm-base');
    const marginEl = el.querySelector('.shm-margin');
    const trimEl = el.querySelector('.shm-trim');
    const normalFields = el.querySelector('.shm-normal-fields');
    const floorToggle = el.querySelector('.shm-floor-on');
    const floorRow = el.querySelector('.shm-floor-row');
    const floorPctEl = el.querySelector('.shm-floor-pct');

    const refreshModeUi = () => {
      const mode = modeValue();
      normalInput.checked = mode === 'normal';
      heatInput.checked = mode === 'heat_pump';
      normalOpt.classList.toggle('is-selected', mode === 'normal');
      heatOpt.classList.toggle('is-selected', mode === 'heat_pump');
      hpFields.hidden = mode !== 'heat_pump';
      normalFields.hidden = mode !== 'normal';
      const fromTouch = String(es(gkey.heatingModeSource) || 'local') === 'touch';
      touchNote.hidden = !fromTouch;
      if (fromTouch) {
        const effective = String(es(gkey.effectiveHeatingMode) || mode);
        touchNote.textContent =
          `Lune Touch is coordinating (mode: ${effective}). This mode applies when Touch is offline.`;
      }
    };

    const commitMode = (mode) => {
      setEntity(gkey.heatingMode, { state: mode });
      setGlobalSelect('heating_mode', mode).catch(() => refreshModeUi());
      refreshModeUi();
    };

    normalInput.addEventListener('change', () => { if (normalInput.checked) commitMode('normal'); });
    heatInput.addEventListener('change', () => { if (heatInput.checked) commitMode('heat_pump'); });

    form.num(baseEl, {
      read: () => ev(gkey.hpBasePct),
      commit: (v) => {
        setEntity(gkey.hpBasePct, { value: v });
        setGlobalNumber('hp_base_pct', v);
      }
    });
    form.num(marginEl, {
      read: () => ev(gkey.hpOverheatMarginC),
      commit: (v) => {
        setEntity(gkey.hpOverheatMarginC, { value: v });
        setGlobalNumber('hp_overheat_margin_c', v);
      }
    });
    form.num(trimEl, {
      read: () => ev(gkey.hpTrimFloorPct),
      commit: (v) => {
        setEntity(gkey.hpTrimFloorPct, { value: v });
        setGlobalNumber('hp_trim_floor_pct', v);
      }
    });

    const showFloorPct = (on) => {
      floorRow.hidden = !on;
      floorPctEl.disabled = !on;
    };
    form.toggle(floorToggle, {
      read: () => isEntityOn(gkey.minimumFlowAlways),
      onChange: showFloorPct,
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.minimumFlowAlways, { state: next });
        setGlobalSelect('minimum_flow_always', next)
          .catch(() => setEntity(gkey.minimumFlowAlways, { state: on ? 'off' : 'on' }));
      }
    });
    form.num(floorPctEl, {
      read: () => ev(gkey.minZoneFlowPct),
      commit: (v) => {
        setEntity(gkey.minZoneFlowPct, { value: v });
        setGlobalNumber('min_zone_flow_pct', v);
      }
    });

    const refresh = () => {
      refreshModeUi();
      form.refresh();
    };
    subscribe(gkey.heatingMode, refresh);
    subscribe(gkey.effectiveHeatingMode, refresh);
    subscribe(gkey.heatingModeSource, refresh);
    subscribe(gkey.hpBasePct, form.refresh);
    subscribe(gkey.hpOverheatMarginC, form.refresh);
    subscribe(gkey.hpTrimFloorPct, form.refresh);
    subscribe(gkey.minimumFlowAlways, form.refresh);
    subscribe(gkey.minZoneFlowPct, form.refresh);
    subscribeLanguage(() => localize(el));
    localize(el);
    refresh();
  }
});
