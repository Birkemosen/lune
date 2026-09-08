import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n } from '../../core/ui-kit.js';
import { es, zoneTitleMarkup } from '../../core/store.js';
import { setZoneSelect } from '../../core/api.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// Global return-temperature probe assignment. Firmware stores per-zone
// zone_return_probe[] (None = PROBE_UNASSIGNED). There is no separate enable
// bit — disabled means every zone is unassigned.

const css = `
.settings-return-temp-card .srt-zone-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-return-temp-card .srt-zone-label .zone-title-name {
  font-weight: 500;
  color: var(--text-faint);
}
`;

injectStyle('settings-return-temp-card', css);

function probeAssigned(state) {
  return !!(state && state !== 'None');
}

function defaultProbe(zone) {
  return 'Probe ' + zone;
}

function anyProbeAssigned() {
  for (let zone = 1; zone <= 6; zone++) {
    if (probeAssigned(es(key.probe(zone)))) return true;
  }
  return false;
}

function probeOptionsHtml() {
  let html = '';
  for (let probe = 1; probe <= 8; probe++) {
    html += '<option value="Probe ' + probe + '">Probe ' + probe + '</option>';
  }
  return html;
}

const template = () => {
  const options = probeOptionsHtml();
  let zoneRows = '';
  for (let zone = 1; zone <= 6; zone++) {
    zoneRows += `
      <div class="ui-row srt-zone-row" data-zone="${zone}">
        <span class="ui-label srt-zone-label" data-zone-label="${zone}">${zoneTitleMarkup(zone)}</span>
        <span class="ui-field"><select class="ui-select srt-probe" data-zone="${zone}">${options}</select></span>
      </div>`;
  }

  return `
    <div class="ui-card settings-return-temp-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.returnTemp.title">Return temperature</span>${helpBadgeI18n('settings.returnTemp.help')}</span></div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.returnTemp.enabledSub">Optional return probes for legacy return-temp balancing — not required for adaptive balancing.</span></span>
        <span class="ui-field"><div class="ui-toggle srt-enabled" role="switch" data-i18n-label="settings.returnTemp.title" aria-label="Enable return temperature probes"></div></span>
      </div>
      <div class="srt-zones">${zoneRows}</div>
    </div>
  `;
};

export default component({
  tag: 'settings-return-temp-card',
  render: template,
  onMount(ctx, el) {
    const enableEl = el.querySelector('.srt-enabled');
    const zonesWrap = el.querySelector('.srt-zones');
    const probeEls = Array.from(el.querySelectorAll('.srt-probe'));
    // Remember last assigned probe per zone while the master toggle is off so
    // re-enable restores Probe N instead of inventing unsaved UI-only state.
    const lastProbeByZone = Object.create(null);

    function rememberedProbe(zone) {
      return lastProbeByZone[zone] || defaultProbe(zone);
    }

    function showZones(enabled) {
      zonesWrap.hidden = !enabled;
      zonesWrap.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      for (const sel of probeEls) sel.disabled = !enabled;
    }

    function paintZoneLabels() {
      for (let zone = 1; zone <= 6; zone++) {
        const label = el.querySelector('[data-zone-label="' + zone + '"]');
        if (label) label.innerHTML = zoneTitleMarkup(zone);
      }
    }

    const form = cardForm(el);
    let enableField;

    // Register selects before toggle so Apply order is: probe values, then
    // enable/disable. Disabling always wins with a final all-None write.
    for (const probeEl of probeEls) {
      const zone = Number(probeEl.dataset.zone);
      form.select(probeEl, {
        read: () => {
          const v = es(key.probe(zone));
          if (probeAssigned(v)) {
            lastProbeByZone[zone] = v;
            return v;
          }
          return rememberedProbe(zone);
        },
        commit: (v) => {
          if (!enableField || !enableField.staged) return;
          lastProbeByZone[zone] = v;
          setZoneSelect(zone, 'zone_probe', v);
        }
      });
    }

    enableField = form.toggle(enableEl, {
      read: () => anyProbeAssigned(),
      onChange: (on) => {
        if (!on) {
          for (const probeEl of probeEls) {
            const zone = Number(probeEl.dataset.zone);
            if (probeAssigned(probeEl.value)) lastProbeByZone[zone] = probeEl.value;
          }
        } else {
          for (const probeEl of probeEls) {
            const zone = Number(probeEl.dataset.zone);
            if (!probeAssigned(probeEl.value)) {
              probeEl.value = rememberedProbe(zone);
            }
            if (probeAssigned(probeEl.value)) lastProbeByZone[zone] = probeEl.value;
          }
        }
        showZones(on);
      },
      commit: (on) => {
        if (!on) {
          for (const probeEl of probeEls) {
            const zone = Number(probeEl.dataset.zone);
            if (probeAssigned(probeEl.value)) lastProbeByZone[zone] = probeEl.value;
            setZoneSelect(zone, 'zone_probe', 'None');
          }
          return;
        }
        for (const probeEl of probeEls) {
          const zone = Number(probeEl.dataset.zone);
          const v = probeAssigned(probeEl.value) ? probeEl.value : rememberedProbe(zone);
          lastProbeByZone[zone] = v;
          setZoneSelect(zone, 'zone_probe', v);
        }
      }
    });

    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.probe(zone), form.refresh);
      subscribe(key.name(zone), paintZoneLabels);
    }
    subscribeLanguage(() => {
      localize(el);
      paintZoneLabels();
      // Re-apply aria label after localize may rewrite data-i18n-label targets.
      enableEl.setAttribute('aria-label', t('settings.returnTemp.title'));
    });
    localize(el);
    paintZoneLabels();
    form.refresh();
  }
});
