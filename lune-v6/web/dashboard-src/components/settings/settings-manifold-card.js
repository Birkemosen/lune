import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n, settingsCardHtml } from '../../core/ui-kit.js';
import { intSplitHtml } from '../../core/lds-int-split.generated.js';
import { es, ev } from '../../core/store.js';
import { setGlobalSelect } from '../../core/api.js';
import { gkey, key } from '../../utils/keys.js';
import {
  clampProbeState,
  collectProbeRoles,
  getAvailableProbes,
  parseProbeIndex,
  probeSelectOptionsHtml,
  probeWouldConflict,
  subscribeAvailableProbes,
} from '../../utils/available-probes.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.settings-manifold-card .lds-int-split,
.settings-manifold-card .int-split {
  padding-top: 0;
  gap: 28px;
}
.settings-manifold-card .sm-probe-warn {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--state-warn);
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  color: var(--text-muted);
  font-size: .78rem;
  line-height: 1.35;
}
.settings-manifold-card .sm-probe-warn[hidden] { display: none; }
.settings-manifold-card .sm-probe-err {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--state-danger);
  background: color-mix(in srgb, var(--state-danger) 8%, transparent);
  color: var(--state-danger);
  font-size: .78rem;
  font-weight: 650;
}
.settings-manifold-card .sm-probe-err[hidden] { display: none; }
.settings-manifold-card .sm-probe-live {
  min-width: 0;
}
.settings-manifold-card .sm-strip-label {
  margin: 0 0 10px;
  color: var(--text-faint);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.settings-manifold-card .sm-probe-list {
  display: grid;
  gap: 0;
  max-width: 18rem;
}
.settings-manifold-card .sm-probe-row {
  display: grid;
  grid-template-columns: 2rem minmax(3.6rem, auto) minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  min-height: 28px;
  padding: 5px 0;
  border-bottom: 1px solid var(--separator);
}
.settings-manifold-card .sm-probe-row:last-child { border-bottom: 0; }
.settings-manifold-card .sm-probe-row.is-hidden { display: none; }
.settings-manifold-card .sm-probe-row.is-empty .sm-probe-temp {
  color: var(--text-faint);
  font-weight: 560;
}
.settings-manifold-card .sm-probe-row.is-role .sm-probe-id {
  color: var(--accent);
}
.settings-manifold-card .sm-probe-id {
  color: var(--text-muted);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .02em;
}
.settings-manifold-card .sm-probe-temp {
  color: var(--text-strong);
  font-family: var(--font-display, var(--mono));
  font-size: 1.02rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.settings-manifold-card .sm-probe-role {
  overflow: hidden;
  color: var(--accent);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-manifold-card .sm-probe-settings {
  min-width: 0;
  padding-left: 24px;
  border-left: 1px solid var(--separator);
}
.settings-disclosure .settings-manifold-card .sm-probe-settings .ui-row {
  display: grid;
  grid-template-columns: minmax(5.5rem, .95fr) minmax(0, 1.15fr);
  gap: 10px;
  align-items: center;
  padding: 0 0 10px;
}
.settings-disclosure .settings-manifold-card .sm-probe-settings .ui-label {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-disclosure .settings-manifold-card .sm-probe-settings .ui-field {
  width: auto;
  min-width: 0;
}
.settings-manifold-card .sm-probe-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
@media (max-width: 900px) {
  .settings-manifold-card .sm-probe-settings {
    padding-left: 0;
    border-left: 0;
    padding-top: 16px;
    border-top: 1px solid var(--separator);
  }
}
.settings-manifold-card .sm-live {
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
.settings-manifold-card .sm-live.is-empty { color: var(--text-faint); font-weight: 560; }
.settings-manifold-card .sm-return-slot {
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--separator);
}
.settings-disclosure .settings-manifold-card .sm-return-slot {
  margin-top: 4px;
  padding-top: 12px;
}
`;

injectStyle('settings-manifold-card', css);

function fmtProbeTemp(value) {
  return value != null && !Number.isNaN(Number(value))
    ? (Math.round(Number(value) * 10) / 10).toFixed(1) + '°'
    : '—';
}

function parseProbeIndexLocal(state) {
  return parseProbeIndex(state);
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

const template = () => {
  const count = getAvailableProbes();
  const probeOptions = probeSelectOptionsHtml({ count });

  let rows = '';
  for (let probe = 1; probe <= 8; probe++) {
    rows += `<div class="sm-probe-row${probe > count ? ' is-hidden' : ''}" data-probe-row="${probe}">
      <span class="sm-probe-id">P${probe}</span>
      <span class="sm-probe-temp" data-probe="${probe}">—</span>
      <span class="sm-probe-role" data-probe-role="${probe}"></span>
    </div>`;
  }

  return settingsCardHtml({
    className: 'settings-manifold-card',
    titleHtml: `<span data-i18n="settings.manifold.title">Manifold Configuration</span>${helpBadgeI18n('settings.manifold.help')}`,
    bodyHtml: intSplitHtml({
      liveHtml: `<div class="sm-probe-live">
        <div class="sm-strip-label" data-i18n="settings.manifold.probeTemps">Probe temperatures</div>
        <div class="sm-probe-list" data-count="${count}">${rows}</div>
      </div>`,
      provisionHtml: `<div class="sm-probe-settings">
        <div class="sm-probe-err" hidden data-probe-err></div>
        <div class="sm-probe-warn" hidden data-probe-warn></div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="settings.manifold.type">Manifold Type</span>
          <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)" data-i18n="settings.manifold.normallyOpen">Normally Open (NO)</option><option value="NC (Normally Closed)" data-i18n="settings.manifold.normallyClosed">Normally Closed (NC)</option></select></span>
        </div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="settings.manifold.flowProbe">Flow Probe</span>
          <span class="ui-field"><div class="sm-probe-pair"><select class="ui-select sm-flow">${probeOptions}</select><span class="sm-live sm-flow-live">—</span></div></span>
        </div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="settings.manifold.returnProbe">Return Probe</span>
          <span class="ui-field"><div class="sm-probe-pair"><select class="ui-select sm-ret">${probeOptions}</select><span class="sm-live sm-ret-live">—</span></div></span>
        </div>
        <div class="sm-return-slot return-temp-slot" data-collapse-body="return-temp"></div>
      </div>`,
    }),
  });
};

export default component({
  tag: 'settings-manifold-card',
  render: template,
  onMount(ctx, el) {
    const typeEl = el.querySelector('.sm-type');
    const flowEl = el.querySelector('.sm-flow');
    const retEl = el.querySelector('.sm-ret');
    const flowLive = el.querySelector('.sm-flow-live');
    const retLive = el.querySelector('.sm-ret-live');
    const listEl = el.querySelector('.sm-probe-list');
    const errEl = el.querySelector('[data-probe-err]');
    const warnEl = el.querySelector('[data-probe-warn]');

    const form = cardForm(el, { immediate: true });
    form.select(typeEl, { read: () => es(gkey.manifoldType) || 'NO (Normally Open)', commit: (v) => setGlobalSelect('manifold_type', v) });

    function currentRoles(exclude) {
      const roles = collectProbeRoles({
        flow: exclude === 'flow' ? null : (flowEl.value || es(gkey.manifoldFlowProbe)),
        return: exclude === 'return' ? null : (retEl.value || es(gkey.manifoldReturnProbe)),
        zoneProbes: zoneProbeMap(),
      });
      return roles;
    }

    function showErr(msg) {
      if (!errEl) return;
      errEl.hidden = !msg;
      errEl.textContent = msg || '';
    }

    form.select(flowEl, {
      read: () => clampProbeState(es(gkey.manifoldFlowProbe) || 'Probe 1', getAvailableProbes(), 'Probe 1'),
      commit: async (v) => {
        if (probeWouldConflict(v, currentRoles('flow'), 'flow')) {
          showErr(t('settings.manifold.probeConflict'));
          form.refresh();
          return;
        }
        showErr('');
        try {
          await setGlobalSelect('manifold_flow_probe', v);
        } catch {
          showErr(t('settings.manifold.probeConflict'));
          form.refresh();
        }
      },
    });
    form.select(retEl, {
      read: () => clampProbeState(es(gkey.manifoldReturnProbe) || 'Probe 2', getAvailableProbes(), 'Probe 2'),
      commit: async (v) => {
        if (probeWouldConflict(v, currentRoles('return'), 'return')) {
          showErr(t('settings.manifold.probeConflict'));
          form.refresh();
          return;
        }
        showErr('');
        try {
          await setGlobalSelect('manifold_return_probe', v);
        } catch {
          showErr(t('settings.manifold.probeConflict'));
          form.refresh();
        }
      },
    });

    function roleFor(probe, flowIdx, retIdx) {
      if (probe === flowIdx && probe === retIdx) return t('settings.manifold.roleBoth');
      if (probe === flowIdx) return t('settings.manifold.roleFlow');
      if (probe === retIdx) return t('settings.manifold.roleReturn');
      return '';
    }

    function paintLive(node, value) {
      const text = fmtProbeTemp(value);
      node.textContent = text;
      node.classList.toggle('is-empty', text === '—');
    }

    function refillProbeSelects(count) {
      const options = probeSelectOptionsHtml({ count, temps: probeTempsMap() });
      for (const sel of [flowEl, retEl]) {
        const prev = sel.value;
        const fallback = sel === flowEl ? 'Probe 1' : 'Probe 2';
        sel.innerHTML = options;
        sel.value = clampProbeState(prev, count, fallback);
      }
      if (count >= 2 && flowEl.value === retEl.value) {
        retEl.value = flowEl.value === 'Probe 1' ? 'Probe 2' : 'Probe 1';
      }
    }

    function paintUnusedWarn() {
      if (!warnEl) return;
      let assigned = 0;
      let enabled = 0;
      for (let z = 1; z <= 6; z++) {
        const on = String(es(key.enabled(z)) || '').toLowerCase() === 'on';
        if (on) enabled++;
        const p = parseProbeIndexLocal(es(key.probe(z)));
        if (on && p >= 3) assigned++;
      }
      const show = assigned > 0 && enabled > assigned;
      warnEl.hidden = !show;
      if (show) warnEl.textContent = t('settings.manifold.unusedProbeWarn', { enabled, assigned });
    }

    function applyCount(count, { commitClamp = false } = {}) {
      if (listEl) listEl.dataset.count = String(count);
      refillProbeSelects(count);
      for (let probe = 1; probe <= 8; probe++) {
        const row = el.querySelector('[data-probe-row="' + probe + '"]');
        if (row) row.classList.toggle('is-hidden', probe > count);
      }
      if (commitClamp) {
        const flowNext = clampProbeState(flowEl.value || es(gkey.manifoldFlowProbe) || 'Probe 1', count, 'Probe 1');
        let retNext = clampProbeState(retEl.value || es(gkey.manifoldReturnProbe) || 'Probe 2', count, 'Probe 2');
        if (count >= 2 && flowNext === retNext) {
          retNext = flowNext === 'Probe 1' ? 'Probe 2' : 'Probe 1';
        }
        if (flowNext !== es(gkey.manifoldFlowProbe)) setGlobalSelect('manifold_flow_probe', flowNext);
        if (retNext !== es(gkey.manifoldReturnProbe)) setGlobalSelect('manifold_return_probe', retNext);
        flowEl.value = flowNext;
        retEl.value = retNext;
      }
      updateProbes();
    }

    function updateProbes() {
      const flowIdx = parseProbeIndexLocal(flowEl.value || es(gkey.manifoldFlowProbe));
      const retIdx = parseProbeIndexLocal(retEl.value || es(gkey.manifoldReturnProbe));
      paintLive(flowLive, flowIdx ? ev(key.probeTemp(flowIdx)) : null);
      paintLive(retLive, retIdx ? ev(key.probeTemp(retIdx)) : null);

      const count = getAvailableProbes();
      if (listEl) listEl.dataset.count = String(count);
      for (let probe = 1; probe <= 8; probe++) {
        const row = el.querySelector('[data-probe-row="' + probe + '"]');
        const tempEl = el.querySelector('[data-probe="' + probe + '"]');
        const roleEl = el.querySelector('[data-probe-role="' + probe + '"]');
        const value = ev(key.probeTemp(probe));
        const text = fmtProbeTemp(value);
        const role = roleFor(probe, flowIdx, retIdx);
        if (tempEl) tempEl.textContent = text;
        if (roleEl) roleEl.textContent = role;
        if (row) {
          row.classList.toggle('is-empty', text === '—');
          row.classList.toggle('is-role', !!role);
          row.classList.toggle('is-hidden', probe > count);
        }
      }
      paintUnusedWarn();
    }

    flowEl.addEventListener('change', updateProbes);
    retEl.addEventListener('change', updateProbes);
    subscribe(gkey.manifoldType, form.refresh);
    subscribe(gkey.manifoldFlowProbe, () => { form.refresh(); updateProbes(); });
    subscribe(gkey.manifoldReturnProbe, () => { form.refresh(); updateProbes(); });
    for (let probe = 1; probe <= 8; probe++) {
      subscribe(key.probeTemp(probe), () => {
        refillProbeSelects(getAvailableProbes());
        updateProbes();
      });
    }
    for (let z = 1; z <= 6; z++) {
      subscribe(key.probe(z), paintUnusedWarn);
      subscribe(key.enabled(z), paintUnusedWarn);
    }
    subscribeAvailableProbes((count) => {
      applyCount(count, { commitClamp: false });
      form.refresh();
    });
    subscribeLanguage(() => { localize(el); updateProbes(); });
    localize(el);
    applyCount(getAvailableProbes());
    form.refresh();
    updateProbes();
  }
});
