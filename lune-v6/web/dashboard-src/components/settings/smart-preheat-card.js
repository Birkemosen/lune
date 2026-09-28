import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n, settingsCardHtml, navSwitchHtml } from '../../core/ui-kit.js';
import { setGlobalSelect, setGlobalNumber } from '../../core/api.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// CSS - reuses the compact settings card language
// ========================================
const css = `
.smart-preheat-card .absorb-badge {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--disabled) 28%, transparent);
  color: var(--text-muted);
  border: 1px solid var(--separator);
}

.smart-preheat-card .absorb-badge.active {
  background: color-mix(in srgb, var(--ok) 22%, transparent);
  color: var(--ok);
  border-color: color-mix(in srgb, var(--ok) 42%, transparent);
}

.smart-preheat-card .absorb-badge[data-mode="armed"] {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

.smart-preheat-card .absorb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 4px 0 8px;
  font-size: .78rem;
  color: var(--text-muted);
}

.smart-preheat-card .absorb-meta[hidden] {
  display: none;
}

.smart-preheat-card .absorb-meta b {
  font-weight: 700;
  color: var(--text);
}
`;

injectStyle('smart-preheat-card', css);

function reasonLabel(code) {
  const key = 'settings.preheat.reason.' + code;
  const translated = t(key);
  return translated === key ? code : translated;
}

function endReasonLabel(code) {
  if (code === 'disarm') return t('settings.preheat.end.disarm');
  if (code === 'expired') return t('settings.preheat.end.expired');
  return code;
}

// ========================================
// TEMPLATE
// ========================================
const template = () => settingsCardHtml({
  className: 'smart-preheat-card',
  titleHtml: `<span data-i18n="settings.preheat.title">Preheat</span>${helpBadgeI18n('settings.preheat.help')}`,
  bodyHtml: `
    ${navSwitchHtml({ on: false, label: 'Toggle preheat absorption', className: 'absorb-toggle', attrs: 'data-i18n-label="settings.preheat.toggle"' })}
    <div class="absorb-body">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.preheat.absorption">Preheat Absorption</span> <span class="absorb-badge">idle</span></span>
      </div>
      <div class="absorb-meta" hidden>
        <span class="absorb-reason-row"><span data-i18n="settings.preheat.reason">Reason</span>: <b class="absorb-reason">—</b></span>
        <span class="absorb-end-row" hidden><span data-i18n="settings.preheat.endReason">Ended by</span>: <b class="absorb-end">—</b></span>
      </div>
      <div class="ui-note" data-i18n="settings.preheat.note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.absorbBand">Absorb band (°C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.detectDelta">Detect delta (°C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  `,
});

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'smart-preheat-card',
  render: template,
  onMount(ctx, el) {
    const block = el.closest('[data-collapse-block="preheat"]');
    const host = block?.querySelector('[data-toggle-host="preheat"]');
    const absorbToggle = el.querySelector('.absorb-toggle');
    if (host && absorbToggle) host.appendChild(absorbToggle);

    const absorbBadge = el.querySelector('.absorb-badge');
    const absorbBandEl = el.querySelector('.absorb-band');
    const absorbDeltaEl = el.querySelector('.absorb-delta');
    const absorbBody = el.querySelector('.absorb-body');
    const absorbMeta = el.querySelector('.absorb-meta');
    const absorbReasonEl = el.querySelector('.absorb-reason');
    const absorbEndRow = el.querySelector('.absorb-end-row');
    const absorbEndEl = el.querySelector('.absorb-end');

    const form = cardForm(el, { immediate: true });

    // --- preheat absorption (external pre-buffering coordinated by Lune Touch) ---
    const gate = (on) => {
      block?.classList.toggle('is-collapsed', !on);
      if (absorbBody) {
        absorbBody.hidden = !on;
        absorbBody.setAttribute('aria-hidden', on ? 'false' : 'true');
      }
      absorbBandEl.disabled = !on;
      absorbDeltaEl.disabled = !on;
    };
    form.toggle(absorbToggle, {
      read: () => isEntityOn(gkey.preheatAbsorbEnabled),
      onChange: gate,
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.preheatAbsorbEnabled, { state: next });
        setGlobalSelect('preheat_absorb_enabled', next);
      }
    });
    form.num(absorbBandEl, {
      read: () => ev(gkey.preheatAbsorbBandC),
      commit: (v) => { setEntity(gkey.preheatAbsorbBandC, { value: v }); setGlobalNumber('preheat_absorb_band_c', v); }
    });
    form.num(absorbDeltaEl, {
      read: () => ev(gkey.preheatDetectDeltaC),
      commit: (v) => { setEntity(gkey.preheatDetectDeltaC, { value: v }); setGlobalNumber('preheat_detect_delta_c', v); }
    });

    // Live absorb badge: idle | reactive | armed — plus reason / end-reason meta
    function updateBadge() {
      const raw = String(es(gkey.preheatAbsorbing) || 'idle').toLowerCase();
      const mode = (raw === 'armed' || raw === 'reactive' || raw === 'active') ? (raw === 'active' ? 'reactive' : raw) : 'idle';
      const labelKey = mode === 'armed' ? 'settings.preheat.armed'
        : mode === 'reactive' ? 'settings.preheat.reactive'
        : 'common.idle';
      absorbBadge.textContent = t(labelKey);
      absorbBadge.classList.toggle('active', mode !== 'idle');
      absorbBadge.dataset.mode = mode;

      const reason = String(es(gkey.preheatAbsorbReason) || '').trim();
      const endReason = String(es(gkey.preheatAbsorbEndReason) || '').trim();
      const showMeta = !!(reason || (endReason && mode === 'idle'));
      if (absorbMeta) absorbMeta.hidden = !showMeta;
      if (absorbReasonEl) absorbReasonEl.textContent = reason ? reasonLabel(reason) : '—';
      if (absorbEndRow) absorbEndRow.hidden = !endReason;
      if (absorbEndEl) absorbEndEl.textContent = endReason ? endReasonLabel(endReason) : '—';
    }

    subscribe(gkey.preheatAbsorbEnabled, form.refresh);
    subscribe(gkey.preheatAbsorbing,     updateBadge);
    subscribe(gkey.preheatAbsorbReason,  updateBadge);
    subscribe(gkey.preheatAbsorbEndReason, updateBadge);
    subscribe(gkey.preheatAbsorbBandC,   form.refresh);
    subscribe(gkey.preheatDetectDeltaC,  form.refresh);
    subscribeLanguage(() => { localize(el); updateBadge(); });
    localize(el);
    form.refresh();
    updateBadge();
  }
});
