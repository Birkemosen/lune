import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n, settingsCardHtml, navSwitchHtml } from '../../core/ui-kit.js';
import { es, ev, zoneTitleMarkup } from '../../core/store.js';
import { setGlobalSelect, setZoneSelect } from '../../core/api.js';
import { gkey, key } from '../../utils/keys.js';
import {
  clampProbeState,
  collectProbeRoles,
  parseProbeIndex,
  probeSelectOptionsHtml,
  probeWouldConflict,
  PROBES_FLOW_RETURN,
  setReturnTempProbes,
  subscribeAvailableProbes,
} from '../../utils/available-probes.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// Global return-temperature probe assignment. Firmware stores per-zone
// zone_return_probe[] (None = PROBE_UNASSIGNED). There is no separate enable
// bit — disabled means every zone is unassigned.

const css = `
.settings-return-temp-card .srt-zones {
  display: grid;
  gap: 0;
  margin-top: 0;
}
.settings-return-temp-card .srt-err {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--state-danger);
  background: color-mix(in srgb, var(--state-danger) 8%, transparent);
  color: var(--state-danger);
  font-size: .78rem;
  font-weight: 650;
}
.settings-return-temp-card .srt-err[hidden] { display: none; }
.settings-disclosure .settings-return-temp-card .srt-zone-row {
  display: grid;
  grid-template-columns: minmax(5.5rem, .95fr) minmax(0, 1.15fr);
  gap: 10px;
  align-items: center;
  padding: 0 0 10px;
}
.settings-disclosure .settings-return-temp-card .srt-zone-row .ui-label {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-disclosure .settings-return-temp-card .srt-zone-row .ui-field {
  width: auto;
  min-width: 0;
}
.settings-return-temp-card .srt-probe-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
.settings-return-temp-card .srt-zone-label .zone-title-name {
  font-weight: 500;
  color: var(--text-faint);
}
.settings-return-temp-card .srt-live {
  min-width: 4.5rem;
  padding: 0 2px 0 0;
  color: var(--text-strong);
  font-family: var(--font-display, var(--mono));
  font-size: 1.05rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: var(--control-compact, 32px);
  text-align: right;
}
.settings-return-temp-card .srt-live.is-empty { color: var(--text-faint); font-weight: 560; }
`;

injectStyle('settings-return-temp-card', css);

function probeAssigned(state) {
  return !!(state && state !== 'None');
}

function defaultProbe(zone) {
  // Zone 1..6 → Probe 3..8 (P1/P2 reserved for manifold flow/return).
  return 'Probe ' + (zone + 2);
}

function probeTempsMap() {
  const temps = Object.create(null);
  for (let p = 1; p <= 8; p++) temps[p] = ev(key.probeTemp(p));
  return temps;
}

function zoneProbeMap() {
  const map = Object.create(null);
  for (let z = 1; z <= 6; z++) map[z] = es(key.probe(z));
  return map;
}

function anyProbeAssigned() {
  for (let zone = 1; zone <= 6; zone++) {
    if (probeAssigned(es(key.probe(zone)))) return true;
  }
  return false;
}

function fmtProbeTemp(value) {
  return value != null && !Number.isNaN(Number(value))
    ? (Math.round(Number(value) * 10) / 10).toFixed(1) + '°'
    : '—';
}

const template = () => {
  const options = probeSelectOptionsHtml({ includeNone: true });
  let zoneRows = '';
  for (let zone = 1; zone <= 6; zone++) {
    zoneRows += `
      <div class="ui-row srt-zone-row" data-zone="${zone}">
        <span class="ui-label srt-zone-label" data-zone-label="${zone}">${zoneTitleMarkup(zone)}</span>
        <span class="ui-field"><div class="srt-probe-pair"><select class="ui-select srt-probe" data-zone="${zone}">${options}</select><span class="srt-live" data-zone-live="${zone}">—</span></div></span>
      </div>`;
  }

  return settingsCardHtml({
    className: 'settings-return-temp-card',
    titleHtml: `<span data-i18n="settings.returnTemp.title">Return temperature</span>${helpBadgeI18n('settings.returnTemp.help')}`,
    bodyHtml: `
      ${navSwitchHtml({ on: false, label: 'Enable return temperature probes', className: 'srt-enabled', attrs: 'data-i18n-label="settings.returnTemp.title"' })}
      <div class="srt-err" hidden data-srt-err></div>
      <div class="srt-zones">${zoneRows}</div>
    `,
  });
};

export default component({
  tag: 'settings-return-temp-card',
  render: template,
  onMount(ctx, el) {
    const block = el.closest('[data-collapse-block="return-temp"]');
    const host = block?.querySelector('[data-toggle-host="return-temp"]');
    const enableEl = el.querySelector('.srt-enabled');
    if (host && enableEl) host.appendChild(enableEl);

    const zonesWrap = el.querySelector('.srt-zones');
    const probeEls = Array.from(el.querySelectorAll('.srt-probe'));
    const errEl = el.querySelector('[data-srt-err]');
    const lastProbeByZone = Object.create(null);

    function showErr(msg) {
      if (!errEl) return;
      errEl.hidden = !msg;
      errEl.textContent = msg || '';
    }

    function rememberedProbe(zone) {
      const preferred = lastProbeByZone[zone] || defaultProbe(zone);
      const idx = parseProbeIndex(preferred);
      // Prefer remembered mapping when it is a zone-return probe (3..8).
      if (idx >= 3 && idx <= 8) return preferred;
      return defaultProbe(zone);
    }

    function paintModeHint(enabled) {
      const hint = block?.querySelector('[data-probe-mode-hint]');
      if (!hint) return;
      const keyName = enabled ? 'settings.returnTemp.modeOn' : 'settings.returnTemp.modeOff';
      hint.setAttribute('data-i18n', keyName);
      hint.textContent = t(keyName);
    }

    // Inventory sync is browser-only (localStorage + UI listeners). Manifold
    // listens with commitClamp:false so this never POSTs on form.refresh.
    function showZones(enabled) {
      setReturnTempProbes(enabled);
      block?.classList.toggle('is-collapsed', !enabled);
      paintModeHint(enabled);
      zonesWrap.hidden = !enabled;
      zonesWrap.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      for (const sel of probeEls) sel.disabled = !enabled;
    }

    async function clampManifoldProbesToFlowReturn() {
      const flowCur = es(gkey.manifoldFlowProbe) || 'Probe 1';
      const retCur = es(gkey.manifoldReturnProbe) || 'Probe 2';
      const flowNext = clampProbeState(flowCur, PROBES_FLOW_RETURN, 'Probe 1');
      let retNext = clampProbeState(retCur, PROBES_FLOW_RETURN, 'Probe 2');
      if (flowNext === retNext) retNext = flowNext === 'Probe 1' ? 'Probe 2' : 'Probe 1';
      if (flowNext !== flowCur) await setGlobalSelect('manifold_flow_probe', flowNext);
      if (retNext !== retCur) await setGlobalSelect('manifold_return_probe', retNext);
    }

    function refillProbeOptions() {
      const options = probeSelectOptionsHtml({ includeNone: true, temps: probeTempsMap() });
      for (const probeEl of probeEls) {
        const prev = probeEl.value;
        probeEl.innerHTML = options;
        if ([...probeEl.options].some((opt) => opt.value === prev)) probeEl.value = prev;
        else if (probeAssigned(prev)) probeEl.value = rememberedProbe(Number(probeEl.dataset.zone));
        else probeEl.value = 'None';
      }
    }

    function paintZoneLabels() {
      for (let zone = 1; zone <= 6; zone++) {
        const label = el.querySelector('[data-zone-label="' + zone + '"]');
        if (label) label.innerHTML = zoneTitleMarkup(zone);
      }
    }

    function paintLives() {
      for (const probeEl of probeEls) {
        const zone = Number(probeEl.dataset.zone);
        const live = el.querySelector('[data-zone-live="' + zone + '"]');
        if (!live) continue;
        const idx = parseProbeIndex(probeEl.value);
        const text = idx ? fmtProbeTemp(ev(key.probeTemp(idx))) : '—';
        live.textContent = text;
        live.classList.toggle('is-empty', text === '—');
      }
    }

    function rolesExcludingZone(zone) {
      const zoneProbes = zoneProbeMap();
      delete zoneProbes[zone];
      return collectProbeRoles({
        flow: es(gkey.manifoldFlowProbe),
        return: es(gkey.manifoldReturnProbe),
        zoneProbes,
      });
    }

    const form = cardForm(el, { immediate: true });
    let enableField;

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
        commit: async (v) => {
          if (!enableField || !enableField.staged) return;
          if (probeAssigned(v) && probeWouldConflict(v, rolesExcludingZone(zone), `Z${zone}`)) {
            showErr(t('settings.manifold.probeConflict'));
            form.refresh();
            return;
          }
          showErr('');
          lastProbeByZone[zone] = v;
          try {
            await setZoneSelect(zone, 'zone_probe', v);
          } catch {
            showErr(t('settings.manifold.probeConflict'));
            form.refresh();
          }
        }
      });
      probeEl.addEventListener('change', paintLives);
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
            if (!probeAssigned(probeEl.value)) probeEl.value = rememberedProbe(zone);
            if (probeAssigned(probeEl.value)) lastProbeByZone[zone] = probeEl.value;
          }
        }
        showZones(on);
        paintLives();
      },
      commit: async (on) => {
        if (!on) {
          await clampManifoldProbesToFlowReturn();
          for (const probeEl of probeEls) {
            const zone = Number(probeEl.dataset.zone);
            if (probeAssigned(probeEl.value)) lastProbeByZone[zone] = probeEl.value;
            // Serialize writes — firmware used to race on full ProbeConfig RMW.
            await setZoneSelect(zone, 'zone_probe', 'None');
          }
          return;
        }
        for (const probeEl of probeEls) {
          const zone = Number(probeEl.dataset.zone);
          const v = probeAssigned(probeEl.value) ? probeEl.value : rememberedProbe(zone);
          lastProbeByZone[zone] = v;
          await setZoneSelect(zone, 'zone_probe', v);
        }
      }
    });

    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.probe(zone), () => { form.refresh(); paintLives(); });
      subscribe(key.name(zone), paintZoneLabels);
    }
    for (let probe = 1; probe <= 8; probe++) subscribe(key.probeTemp(probe), paintLives);
    subscribeAvailableProbes(() => {
      refillProbeOptions();
      paintLives();
    });
    subscribeLanguage(() => {
      localize(el);
      paintZoneLabels();
      paintModeHint(!!enableField?.staged);
      enableEl.setAttribute('aria-label', t('settings.returnTemp.title'));
      paintLives();
    });
    localize(el);
    paintZoneLabels();
    form.refresh();
    paintLives();
  }
});
