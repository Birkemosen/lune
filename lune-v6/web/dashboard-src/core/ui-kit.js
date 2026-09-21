// core/ui-kit.js
// Shared design language for editable config cards (Settings + Zones).
// One canonical set of classes so every card renders identical section
// headers, inline label-left / control-right rows, dividers and controls.
// Read-only Monitor/Logs cards intentionally do NOT use this kit.

import { injectStyle } from './style.js';
import { localize, subscribeLanguage, t } from './i18n.js';
import {
  COMFORT_CONTROL_CSS,
  dial,
  updateDial,
  bindDial,
  overrideBanner,
  updateOverrideBanner,
  comfortSliderHtml,
  paintComfortSlider,
} from './lds-comfort-control.generated.js';
import {
  NAV_SWITCH_CSS,
  navSwitchHtml,
  paintNavSwitch,
} from './lds-nav-switch.generated.js';
import {
  SETTINGS_CARD_CSS,
  settingsCardHtml,
} from './lds-settings-card.generated.js';

injectStyle('lds-comfort-control', COMFORT_CONTROL_CSS);
injectStyle('lds-nav-switch', NAV_SWITCH_CSS);
injectStyle('lds-settings-card', SETTINGS_CARD_CSS);

export {
  dial,
  updateDial,
  bindDial,
  overrideBanner,
  updateOverrideBanner,
  comfortSliderHtml,
  paintComfortSlider,
  navSwitchHtml,
  paintNavSwitch,
  settingsCardHtml,
};

const css = `
/* ---- Titles & section headers (card chrome lives in LDS settings-card) ---- */
.ui-title-text { display: inline-flex; align-items: center; }

/* ---- Help badge: a "?" chip with a hover/focus explanation tooltip ---- */
.help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-left: 7px;
  border-radius: 999px;
  border: 1.5px solid var(--control-border-strong);
  color: var(--text-secondary);
  font-size: .7rem;
  font-weight: 700;
  font-family: inherit;
  text-transform: none;
  letter-spacing: 0;
  cursor: help;
  position: relative;
  flex-shrink: 0;
  vertical-align: middle;
}
.help-badge:hover, .help-badge:focus-visible { color: var(--accent); border-color: var(--accent); outline: none; }
.help-badge .help-tip {
  position: absolute;
  top: calc(100% + 8px);
  /* Keep explanations inside the card instead of letting a badge near the
     right edge spill underneath the next settings column. */
  right: 0;
  left: auto;
  width: max-content;
  max-width: min(280px, calc(100vw - 32px));
  background: var(--overlay-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .84rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: .2px;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  box-shadow: var(--panel-shadow);
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease;
  z-index: 60;
}
.help-badge:hover .help-tip, .help-badge:focus-visible .help-tip { opacity: 1; }

.ui-section {
  font-family: var(--font-display);
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin: 16px 0 2px;
}

/* ---- Row: label left, control right, divider below ---- */
.ui-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: var(--control-height, 44px);
  padding: 6px 0;
  border-bottom: 1px solid var(--divider);
}
.ui-row[hidden] { display: none; }
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .92rem;
  font-weight: 600;
  line-height: 1.22;
  min-width: 0;
}
.ui-sublabel {
  display: block;
  color: var(--text-faint);
  font-size: .84rem;
  font-weight: 500;
  font-style: italic;
  margin-top: 2px;
}

.ui-field {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---- Controls (LDS control.height = 44px) ---- */
.ui-input {
  width: 96px;
  box-sizing: border-box;
  text-align: right;
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
  box-shadow: none;
  transition: border-color .15s ease;
}
/* Text fields and selects in label+control rows share one control width. */
.ui-input.wide {
  width: var(--control-width, 180px);
  max-width: 100%;
  text-align: left;
  font-family: inherit;
}

.ui-select {
  width: var(--control-width, 180px);
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 10px;
  font-size: .875rem;
  line-height: 1.2;
  box-shadow: none;
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}

.ui-unit { color: var(--text-faint); font-size: .84rem; font-weight: 600; }

/* ---- Numeric stepper (− value +) ----
   The adjacent field remains directly editable; no hidden double-click mode. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 54px;
  text-align: center;
  border-color: var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
  cursor: text;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: var(--control-height, 44px);
  height: var(--control-height, 44px);
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  box-shadow: none;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.ui-step-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--control-bg-hover); }
.ui-step-btn:active { transform: translateY(1px); }

/* ---- Unsaved-changes banner (sits under the card title) ---- */
.ui-form-banner {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--warn-bg-soft);
  border: 1px solid var(--warn-border);
}
.ui-form-banner.show { display: flex; }
.ui-form-banner-msg { color: var(--state-warn); font-size: .84rem; font-weight: 700; }
.ui-form-banner-btns { display: flex; gap: 8px; flex-shrink: 0; }
.ui-form-discard,
.ui-form-apply {
  border-radius: 8px;
  padding: 5px 14px;
  font-size: .84rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: .15s ease;
}
.ui-form-discard { background: transparent; color: var(--text-secondary); }
.ui-form-discard:hover { color: var(--text); border-color: var(--text-secondary); }
.ui-form-apply { background: var(--accent); color: var(--text-on-accent); border-color: var(--accent); }
.ui-form-apply:hover { filter: brightness(1.08); }

/* ---- Green pill toggle (canonical; 44pt hit area, compact track) ---- */
.ui-toggle {
  width: 51px;
  height: var(--control-height, 44px);
  border-radius: 999px;
  background: transparent;
  position: relative;
  cursor: pointer;
  border: 0;
  flex-shrink: 0;
}
.ui-toggle::before {
  content: '';
  position: absolute;
  inset: 10px 2px;
  border: 1px solid var(--control-border);
  border-radius: 999px;
  background: var(--control-bg-hover);
  transition: background .2s ease, border-color .2s ease;
}
.ui-toggle::after {
  content: '';
  position: absolute;
  top: 13px;
  left: 6px;
  width: 18px;
  height: 18px;
  background: var(--control-knob);
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on::before { background: var(--accent); border-color: var(--accent); }
.ui-toggle.on::after { transform: translateX(21px); background: var(--text-on-accent); }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .875rem;
  line-height: 1.4;
  margin-top: 8px;
}
.ui-divider {
  border: 0;
  border-top: 1px dashed var(--panel-border);
  margin: 14px 0 2px;
}

/* ---- Buttons (device actions / recovery) ---- */
.ui-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ui-btn {
  flex: 1;
  min-width: 120px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 14px;
  cursor: pointer;
  font-weight: 650;
  font-size: .875rem;
  line-height: 1.2;
  box-shadow: none;
  transition: .15s ease;
}
.ui-btn:hover { background: var(--control-bg-hover); border-color: var(--accent); color: var(--accent); }
.ui-btn.warn { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-text); }
.ui-btn.warn:hover { background: var(--danger-bg-strong); border-color: var(--danger-border-strong); }

@media (max-width: 900px) {
  .ui-row { align-items: stretch; flex-direction: column; gap: 4px; padding: 8px 0; }
  .ui-field { align-self: stretch; width: 100%; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-btn { width: 100%; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}

/* ---- LDS primitives: zone row, planner, segmented, info list ---- */
.lds-zone-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(72px, .7fr) minmax(72px, .7fr) minmax(90px, .9fr) 44px;
  gap: var(--space-3, 12px);
  align-items: center;
  width: 100%;
  min-height: 72px;
  padding: 12px 8px 12px 16px;
  border: 0;
  border-top: 2px solid var(--accent);
  background: var(--surface-raised);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.lds-zone-row + .lds-zone-row { border-top: 1px solid var(--separator); }
.lds-zone-row:hover { background: color-mix(in srgb, var(--surface-raised) 70%, rgba(255,255,255,.04)); }
.lds-zone-row:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: -3px; }
.lds-zone-row-name, .lds-zone-row-meta, .lds-zone-row-value strong, .lds-zone-row-value small { display: block; }
.lds-zone-row-name { color: var(--text-strong); font-size: .94rem; font-weight: 650; }
.lds-zone-row-meta { margin-top: 2px; color: var(--text-faint); font-size: .75rem; }
.lds-zone-row-value strong { color: var(--text-strong); font-family: var(--font-display); font-size: 1rem; font-weight: 650; font-variant-numeric: tabular-nums; }
.lds-zone-row-value small { margin-top: 2px; color: var(--text-faint); font-size: .75rem; }
.lds-zone-row-status { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: .8rem; font-weight: 600; }
.lds-zone-row-status i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.lds-zone-row.ok .lds-zone-row-status { color: var(--ok); }
.lds-zone-row.warn .lds-zone-row-status, .lds-zone-row.fault .lds-zone-row-status { color: var(--danger); }
.lds-zone-row.is-selected { background: var(--fill-forest); }
.lds-zone-row.active .lds-zone-row-status { color: var(--accent); }
.lds-zone-row-chevron { display: grid; width: 44px; height: 44px; place-items: center; color: var(--muted); font-size: 1.35rem; }
@media (max-width: 900px) {
  .lds-zone-row { grid-template-columns: minmax(0, 1fr) minmax(70px, .6fr) 44px; }
  .lds-zone-row-value:nth-of-type(2), .lds-zone-row .lds-zone-row-status { display: none; }
}

.lds-planner { display: grid; gap: var(--space-3, 12px); }
.lds-planner-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.lds-planner-day {
  min-height: var(--control-height, 44px);
  border: 1px solid var(--control-border);
  border-radius: var(--radius-control, 10px);
  background: var(--control-bg);
  color: var(--text);
  font-size: .78rem;
  font-weight: 650;
  cursor: pointer;
}
.lds-planner-day[aria-pressed="true"] { border-color: rgba(var(--forest-rgb), .45); background: var(--fill-forest); color: var(--text-strong); }
.lds-planner-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.lds-planner-fields label { display: grid; gap: 4px; color: var(--text-muted); font-size: .78rem; font-weight: 600; }
.lds-planner-fields input { height: var(--control-height, 44px); border: 1px solid var(--control-border); border-radius: var(--radius-control, 10px); background: var(--control-bg); color: var(--text); padding: 0 10px; }
.lds-planner-timeline { display: grid; gap: 6px; }
.lds-planner-bar {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: var(--control-bg);
  border: 1px solid var(--separator);
  overflow: hidden;
}
.lds-planner-bar > span {
  position: absolute;
  top: 0; bottom: 0;
  background: var(--accent);
  opacity: .85;
}
.lds-planner-scale { display: flex; justify-content: space-between; color: var(--text-faint); font-size: 12px; }

.lds-segmented { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 6px; width: 100%; }
.lds-segmented label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--control-height, 44px);
  padding: 0 10px;
  border: 1px solid var(--control-border);
  border-radius: var(--radius-control, 10px);
  background: var(--control-bg);
  color: var(--text);
  font-size: .84rem;
  font-weight: 650;
  cursor: pointer;
}
.lds-segmented input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
.lds-segmented label:has(input:checked) { border-color: var(--accent); background: var(--fill-selected); color: var(--accent); }
.lds-segmented label:focus-within { outline: 2px solid var(--focus-ring); outline-offset: 1px; }

.lds-info-list { display: grid; gap: var(--space-4, 16px); }
.lds-info-group { border-top: 1px solid var(--separator); padding-top: var(--space-3, 12px); }
.lds-info-group h3 { margin: 0 0 8px; color: var(--text-strong); font-size: .9rem; font-weight: 650; }
.lds-info-group dl { margin: 0; display: grid; gap: 0; }
.lds-info-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: baseline;
  min-height: 44px;
  padding: 8px 0;
  border-bottom: 1px solid var(--separator-soft);
}
.lds-info-row:last-child { border-bottom: 0; }
.lds-info-row dt { color: var(--text-muted); font-size: .84rem; }
.lds-info-row dd { margin: 0; color: var(--text-strong); font-size: .92rem; font-weight: 650; font-variant-numeric: tabular-nums; text-align: right; }
`;

injectStyle('ui-kit', css);

// Render a "?" help chip whose tooltip shows `text` on hover/focus. Drop it
// inside a `.ui-title-text` span next to a card title.
export function helpBadge(text) {
  const safe = String(text).replace(/"/g, '&quot;');
  return `<span class="help-badge" tabindex="0" role="img" aria-label="${safe}">?` +
    `<span class="help-tip">${text}</span></span>`;
}

export function helpBadgeI18n(key) {
  const text = t(key);
  const safe = String(text).replace(/"/g, '&quot;');
  return `<span class="help-badge" tabindex="0" role="img" aria-label="${safe}" data-i18n-label="${key}">?` +
    `<span class="help-tip" data-i18n="${key}">${text}</span></span>`;
}

// Magnitude-aware step: the increment follows the size of the number so big
// values move in big jumps and small values stay fine-grained. Below 1000 the
// field keeps its declared precision (e.g. 168 → ±1, 1.70 → ±0.10); from 1000
// up it scales to one order of magnitude below the value (2000 → ±100).
export function dynamicStep(value, baseStep) {
  const a = Math.abs(Number(value));
  if (!Number.isFinite(a) || a < 1000) return baseStep;
  return Math.pow(10, Math.floor(Math.log10(a)) - 1);
}

function decimalsOf(step) {
  const s = String(step);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

// cardForm — per-card staged-save controller.
//
// Edits to registered controls are staged locally (nothing is written to the
// device) and an "Unsaved changes" banner appears under the card title with
// Apply / Discard. Only on Apply are the staged values committed via each
// field's commit() callback. Incoming device state refreshes a control only
// while it is NOT dirty, so a pending edit is never clobbered.
//
// Field types: num (with − / + stepper + double-click-to-edit), text, select,
// toggle (green pill), and custom (caller-managed control, e.g. wall buttons).
export function cardForm(el, opts = {}) {
  const titleEl = el.querySelector(opts.title || '.ui-card-title');
  const banner = document.createElement('div');
  banner.className = 'ui-form-banner';
  banner.innerHTML =
    '<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span>' +
    '<span class="ui-form-banner-btns">' +
      '<button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button>' +
      '<button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button>' +
    '</span>';
  if (titleEl) titleEl.insertAdjacentElement('afterend', banner);
  else el.insertAdjacentElement('afterbegin', banner);

  const fields = [];
  const refreshBanner = () => banner.classList.toggle('show', fields.some(f => f.dirty));
  const mark = (field, v) => { field.dirty = v; refreshBanner(); };

  function attach(field) {
    field.markDirty = () => mark(field, true);
    fields.push(field);
    return field;
  }

  function num(input, cfg) {
    const field = { dirty: false, input };
    const baseStep = cfg.baseStep != null ? cfg.baseStep : (parseFloat(input.step) || 1);
    const decimals = decimalsOf(baseStep);
    const lo = cfg.min != null ? cfg.min : (input.min !== '' ? parseFloat(input.min) : -Infinity);
    const hi = cfg.max != null ? cfg.max : (input.max !== '' ? parseFloat(input.max) : Infinity);
    const fmt = (v) => decimals > 0 ? Number(v).toFixed(decimals) : String(Math.round(Number(v)));

    if (!cfg.nostep) {
      const stepper = document.createElement('div');
      stepper.className = 'ui-stepper';
      input.parentNode.insertBefore(stepper, input);
      const dec = document.createElement('button');
      dec.type = 'button'; dec.className = 'ui-step-btn'; dec.textContent = '−'; dec.setAttribute('aria-label', t('common.decrease'));
      const inc = document.createElement('button');
      inc.type = 'button'; inc.className = 'ui-step-btn'; inc.textContent = '+'; inc.setAttribute('aria-label', t('common.increase'));
      stepper.appendChild(dec); stepper.appendChild(input); stepper.appendChild(inc);

      const nudge = (dir) => {
        if (input.disabled) return;
        let b = parseFloat(input.value);
        if (!Number.isFinite(b)) b = parseFloat(input.placeholder);
        if (!Number.isFinite(b)) b = 0;
        const next = Math.min(hi, Math.max(lo, b + dir * dynamicStep(b, baseStep)));
        input.value = fmt(next);
        mark(field, true);
      };
      dec.addEventListener('click', () => nudge(-1));
      inc.addEventListener('click', () => nudge(1));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    }
    input.addEventListener('input', () => mark(field, true));

    field.sync = () => {
      const v = cfg.read();
      input.value = (v != null && Number.isFinite(Number(v))) ? fmt(v) : '';
    };
    field.commit = () => {
      const v = parseFloat(input.value);
      if (!Number.isFinite(v)) return;
      cfg.commit(Math.min(hi, Math.max(lo, v)));
    };
    return attach(field);
  }

  function text(input, cfg) {
    const field = { dirty: false, input };
    input.addEventListener('input', () => mark(field, true));
    field.sync = () => { const v = cfg.read(); input.value = v != null ? v : ''; };
    field.commit = () => cfg.commit(input.value.trim());
    return attach(field);
  }

  function select(sel, cfg) {
    const field = { dirty: false, input: sel };
    sel.addEventListener('change', () => mark(field, true));
    field.sync = () => { const v = cfg.read(); if (v != null) sel.value = v; };
    field.commit = () => cfg.commit(sel.value);
    return attach(field);
  }

  function toggle(btn, cfg) {
    const field = { dirty: false, input: btn, staged: false };
    const row = btn.closest('.ui-row');
    const paint = () => {
      paintNavSwitch(btn, { on: field.staged });
      if (row) row.classList.toggle('is-on', field.staged);
      // onChange lets the card react to the *staged* value (e.g. un-gate a body
      // section the instant the toggle flips, before Apply).
      if (cfg.onChange) cfg.onChange(field.staged);
    };
    btn.addEventListener('click', () => { field.staged = !field.staged; mark(field, true); paint(); });
    field.sync = () => { field.staged = !!cfg.read(); paint(); };
    field.commit = () => cfg.commit(field.staged);
    return attach(field);
  }

  // Caller-managed control. Provide sync()/commit(); call .markDirty() on edit.
  function custom(cfg) {
    const field = { dirty: false, sync: cfg.sync, commit: cfg.commit };
    return attach(field);
  }

  const refresh = () => fields.forEach(f => { if (!f.dirty && f.sync) f.sync(); });
  const apply = () => {
    // commit() reaches postV1, which now rejects on a refused write instead of
    // resolving silently. The failure is already logged and pushed to the
    // activity list there, so absorb it here rather than leave one unhandled
    // rejection per dirty field.
    fields.forEach(f => {
      if (!f.dirty) return;
      if (f.commit) Promise.resolve(f.commit()).catch(() => {});
      f.dirty = false;
    });
    refreshBanner();
    if (opts.onApply) opts.onApply();
  };
  const discard = () => {
    fields.forEach(f => { f.dirty = false; if (f.sync) f.sync(); });
    refreshBanner();
    if (opts.onDiscard) opts.onDiscard();
  };

  banner.querySelector('.ui-form-apply').addEventListener('click', apply);
  banner.querySelector('.ui-form-discard').addEventListener('click', discard);
  subscribeLanguage(() => {
    localize(banner);
    el.querySelectorAll('.ui-step-btn').forEach((btn) => {
      btn.setAttribute('aria-label', btn.textContent === '+' ? t('common.increase') : t('common.decrease'));
    });
  });
  localize(banner);

  return { num, text, select, toggle, custom, refresh, apply, discard, isDirty: () => fields.some(f => f.dirty) };
}


function escAttr(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escText(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');
}

/** Full-row zone summary navigation target. */
export function zoneRow(zone = {}) {
  const id = escAttr(zone.id || zone.room_id || zone.zone_id || '');
  const name = escText(zone.name || zone.label || id || 'Zone');
  const meta = escText(zone.meta || zone.subtitle || '');
  const target = zone.target != null && Number.isFinite(Number(zone.target))
    ? Number(zone.target).toFixed(1) + '°C' : '—';
  const current = zone.current != null && Number.isFinite(Number(zone.current))
    ? Number(zone.current).toFixed(1) + '°C' : '—';
  const status = escAttr(zone.status || zone.state || '');
  const statusLabel = escText(zone.statusLabel || zone.stateLabel || status || '—');
  const statusClass = escAttr(zone.statusClass || status || '');
  const aria = escAttr(zone.ariaLabel || `Open ${zone.name || id}`);
  return `<button type="button" class="lds-zone-row ${statusClass}" data-zone-id="${id}" ${zone.openSection ? `data-open-section="${escAttr(zone.openSection)}"` : ''} aria-label="${aria}">
  <span class="lds-zone-row-identity"><span class="lds-zone-row-name">${name}</span>${meta ? `<span class="lds-zone-row-meta">${meta}</span>` : ''}</span>
  <span class="lds-zone-row-value"><strong>${target}</strong><small>Target</small></span>
  <span class="lds-zone-row-value"><strong>${current}</strong><small>Current</small></span>
  <span class="lds-zone-row-status"><i aria-hidden="true"></i>${statusLabel}</span>
  <span class="lds-zone-row-chevron" aria-hidden="true">›</span>
</button>`;
}

const PLANNER_DAYS = [
  { bit: 1, key: 'planner.day.mon', label: 'Mon' },
  { bit: 2, key: 'planner.day.tue', label: 'Tue' },
  { bit: 4, key: 'planner.day.wed', label: 'Wed' },
  { bit: 8, key: 'planner.day.thu', label: 'Thu' },
  { bit: 16, key: 'planner.day.fri', label: 'Fri' },
  { bit: 32, key: 'planner.day.sat', label: 'Sat' },
  { bit: 64, key: 'planner.day.sun', label: 'Sun' },
];

function minsToInput(mins) {
  const m = Math.max(0, Math.min(24 * 60, Number(mins) || 0));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function inputToMins(value) {
  const parts = String(value || '').split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return Math.max(0, Math.min(24 * 60, h * 60 + m));
}

/** Weekly comfort window planner (one period). */
export function planner({
  enabled = true,
  dayMask = 127,
  startMin = 6 * 60,
  endMin = 22 * 60,
  setpointC = 21,
} = {}) {
  const mask = Number(dayMask) || 0;
  const days = PLANNER_DAYS.map((d) => {
    const on = (mask & d.bit) !== 0;
    return `<button type="button" class="lds-planner-day" data-day-bit="${d.bit}" aria-pressed="${on ? 'true' : 'false'}" data-i18n="${d.key}">${d.label}</button>`;
  }).join('');
  const left = Math.max(0, Math.min(100, (Number(startMin) / (24 * 60)) * 100));
  const right = Math.max(0, Math.min(100, (Number(endMin) / (24 * 60)) * 100));
  const width = Math.max(0, right - left);
  return `<div class="lds-planner" data-planner>
  <div class="lds-planner-days">${days}</div>
  <div class="lds-planner-fields">
    <label>Enabled <input type="checkbox" data-planner-enabled ${enabled ? 'checked' : ''}></label>
    <label>Start <input type="time" data-planner-start value="${minsToInput(startMin)}"></label>
    <label>End <input type="time" data-planner-end value="${minsToInput(endMin)}"></label>
    <label>Target (°C) <input type="number" data-planner-setpoint step="0.5" min="5" max="35" value="${Number(setpointC).toFixed(1)}"></label>
  </div>
  <div class="lds-planner-timeline">
    <div class="lds-planner-bar" aria-hidden="true"><span data-planner-bar style="left:${left}%;width:${width}%"></span></div>
    <div class="lds-planner-scale"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
  </div>
</div>`;
}

export function readPlanner(root) {
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return null;
  let dayMask = 0;
  el.querySelectorAll('[data-day-bit][aria-pressed="true"]').forEach((btn) => {
    dayMask |= parseInt(btn.getAttribute('data-day-bit'), 10) || 0;
  });
  const startMin = inputToMins(el.querySelector('[data-planner-start]')?.value);
  const endMin = inputToMins(el.querySelector('[data-planner-end]')?.value);
  const setpointC = parseFloat(el.querySelector('[data-planner-setpoint]')?.value);
  const enabled = !!el.querySelector('[data-planner-enabled]')?.checked;
  return {
    enabled,
    day_mask: dayMask,
    start_min: startMin,
    end_min: endMin,
    setpoint_c: Number.isFinite(setpointC) ? setpointC : 21,
  };
}

export function bindPlanner(root, { onChange } = {}) {
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return () => {};
  const paintBar = () => {
    const startMin = inputToMins(el.querySelector('[data-planner-start]')?.value);
    const endMin = inputToMins(el.querySelector('[data-planner-end]')?.value);
    const left = Math.max(0, Math.min(100, (startMin / (24 * 60)) * 100));
    const right = Math.max(0, Math.min(100, (endMin / (24 * 60)) * 100));
    const bar = el.querySelector('[data-planner-bar]');
    if (bar) {
      bar.style.left = `${left}%`;
      bar.style.width = `${Math.max(0, right - left)}%`;
    }
  };
  const emit = () => { if (onChange) onChange(readPlanner(el)); };
  const onClick = (event) => {
    const day = event.target.closest('[data-day-bit]');
    if (!day || !el.contains(day)) return;
    const on = day.getAttribute('aria-pressed') !== 'true';
    day.setAttribute('aria-pressed', on ? 'true' : 'false');
    emit();
  };
  const onInput = () => { paintBar(); emit(); };
  el.addEventListener('click', onClick);
  el.addEventListener('input', onInput);
  el.addEventListener('change', onInput);
  paintBar();
  return () => {
    el.removeEventListener('click', onClick);
    el.removeEventListener('input', onInput);
    el.removeEventListener('change', onInput);
  };
}

/** Segmented control (radio group). */
export function segmented({ name, options = [], value } = {}) {
  const group = escAttr(name || 'segment');
  const items = options.map((opt) => {
    const v = typeof opt === 'object' ? opt.value : opt;
    const label = typeof opt === 'object' ? (opt.label || opt.value) : opt;
    const checked = String(v) === String(value) ? 'checked' : '';
    return `<label><input type="radio" name="${group}" value="${escAttr(v)}" ${checked}><span>${escText(label)}</span></label>`;
  }).join('');
  return `<div class="lds-segmented" role="radiogroup" data-segmented="${group}">${items}</div>`;
}

export function bindSegmented(root, { onChange } = {}) {
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return () => {};
  const handler = () => {
    const selected = el.querySelector('input[type="radio"]:checked');
    if (selected && onChange) onChange(selected.value);
  };
  el.addEventListener('change', handler);
  return () => el.removeEventListener('change', handler);
}

/** Grouped fact list for Status / Diagnostics. */
export function infoList(groups = []) {
  const sections = (groups || []).map((group) => {
    const title = escText(group.title || group.label || '');
    const rows = (group.rows || group.items || []).map((row) => {
      const label = escText(row.label || row.key || '');
      const value = escText(row.value != null ? row.value : '—');
      return `<div class="lds-info-row"><dt>${label}</dt><dd>${value}</dd></div>`;
    }).join('');
    return `<section class="lds-info-group">${title ? `<h3>${title}</h3>` : ''}<dl>${rows}</dl></section>`;
  }).join('');
  return `<div class="lds-info-list">${sections}</div>`;
}
