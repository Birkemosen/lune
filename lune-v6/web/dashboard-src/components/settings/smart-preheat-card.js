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
`;

injectStyle('smart-preheat-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => settingsCardHtml({
  className: 'smart-preheat-card',
  titleHtml: `<span data-i18n="settings.preheat.title">Preheat</span>${helpBadgeI18n('settings.preheat.help')}`,
  bodyHtml: `
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.preheat.absorption">Preheat Absorption</span> <span class="absorb-badge">idle</span></span>
      <span class="ui-field">${navSwitchHtml({ on: false, label: 'Toggle preheat absorption', className: 'absorb-toggle', attrs: 'data-i18n-label="settings.preheat.toggle"' })}</span>
    </div>
    <div class="ui-note" data-i18n="settings.preheat.note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
    <div class="gated-body absorb-body">
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
    const absorbToggle = el.querySelector('.absorb-toggle');
    const absorbBadge = el.querySelector('.absorb-badge');
    const absorbBandEl = el.querySelector('.absorb-band');
    const absorbDeltaEl = el.querySelector('.absorb-delta');
    const absorbBody = el.querySelector('.absorb-body');

    const form = cardForm(el);

    // --- preheat absorption (external pre-buffering coordinated by Lune Touch) ---
    const gate = (on) => { if (absorbBody) absorbBody.classList.toggle('is-disabled', !on); };
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

    // Live "absorbing" badge reflects the running device state.
    function updateBadge() {
      const absorbing = String(es(gkey.preheatAbsorbing) || '').toLowerCase() === 'active';
      absorbBadge.textContent = absorbing ? t('common.active') : t('common.idle');
      absorbBadge.classList.toggle('active', absorbing);
    }

    subscribe(gkey.preheatAbsorbEnabled, form.refresh);
    subscribe(gkey.preheatAbsorbing,     updateBadge);
    subscribe(gkey.preheatAbsorbBandC,   form.refresh);
    subscribe(gkey.preheatDetectDeltaC,  form.refresh);
    subscribeLanguage(() => { localize(el); updateBadge(); });
    localize(el);
    form.refresh();
    updateBadge();
  }
});
