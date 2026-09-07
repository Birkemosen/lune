import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { setEnabled, setSetpoint } from '../../core/api.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// CSS (scoped by class)
// ========================================
const css = `
.zone-detail {
  background: var(--panel-bg-flat);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 16px 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
  height: 100%;
  box-sizing: border-box;
}

.zone-detail .zd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-detail .zd-title {
  font-size: .95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-strong);
}

/* Header-right cluster: enable toggle sits next to the state pill. */
.zone-detail .zd-head-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zone-detail .zd-badge {
  border-radius: 8px;
  padding: 3px 9px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .7px;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
  border: 1px solid rgba(125,139,167,.22);
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(255,133,49,.15);
  color: var(--state-warn);
  border-color: rgba(255,133,49,.3);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(122,167,206,.13);
  color: var(--series-cool);
  border-color: rgba(122,167,206,.28);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

/* Body layout — the header's border-bottom is the only divider (no second
   border-top here, which previously read as a doubled horizontal line). */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-kicker {
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 4px;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.zone-detail .zd-target-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-detail .zd-btns {
  display: flex;
  gap: 6px;
}

.zone-detail .spb {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.15rem;
  transition: .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-detail .spb:hover {
  border-color: rgba(255,133,49,.55);
  color: var(--accent);
  background: rgba(255,133,49,.1);
}

/* Toggle uses the canonical .ui-toggle from the shared ui-kit. */

/* Temperatures on a single row: small uppercase label above a large value. */
.zone-detail .zd-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.zone-detail .zd-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zone-detail .zd-stat-label {
  font-size: .64rem;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}

.zone-detail .zd-motor {
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
  margin-top: 2px;
}
.zone-detail .zd-motor-title {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.zone-detail .zd-motor .zd-stats { margin-top: 2px; }
.zone-detail .zd-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
}
/* The [hidden] attribute must beat the display:flex above, or the row shows
   "Last fault NONE" even when there is no fault. */
.zone-detail .zd-fault[hidden] { display: none; }
.zone-detail .zd-fault-label { color: var(--text-secondary); }
.zone-detail .zd-fault-val { color: var(--state-danger); font-weight: 700; font-family: var(--mono); }

/* HIG list-detail treatment: one calm status surface with advanced data disclosed. */
.zone-detail{height:auto;padding:0;background:transparent;box-shadow:none;backdrop-filter:none;overflow:hidden}
.zone-detail .zd-head{min-height:58px;margin:0;padding:10px 16px;border-bottom:1px solid var(--separator)}
.zone-detail .zd-title{font-size:1rem;font-weight:650;text-transform:none;letter-spacing:0}
.zone-detail .zd-badge{padding:4px 9px;border:0;border-radius:999px;font-size:.72rem;font-weight:650;text-transform:none;letter-spacing:0}
.zone-detail .zd-body{gap:0}
.zone-detail .zd-body>div:first-child{padding:18px 16px}
.zone-detail .zd-kicker{margin:0 0 7px;color:var(--text-muted);font-size:.76rem;font-weight:600;text-transform:none;letter-spacing:0}
.zone-detail .zd-setpoint{font-family:var(--font-display);font-size:1.75rem;font-weight:700;color:var(--text-strong);font-variant-numeric:tabular-nums}
.zone-detail .zd-target-row{gap:10px}
.zone-detail .spb{width:44px;height:44px;border-color:var(--separator);border-radius:8px;background:var(--control-bg);box-shadow:none}
.zone-detail .spb:active{background:rgba(var(--accent-rgb),.14)}
.zone-detail .zd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:0;padding:0 16px 18px}
.zone-detail .zd-stat{min-width:0;padding:0 12px;border-left:1px solid var(--separator)}
.zone-detail .zd-stat:first-child{padding-left:0;border-left:0}
.zone-detail .zd-stat-label{color:var(--text-faint);font-size:.7rem;font-weight:600;text-transform:none;letter-spacing:0}
.zone-detail .zd-stat-value{font-family:var(--font-display);font-size:1.08rem;font-weight:650}
.zone-detail .zd-motor{margin:0;padding:0;border-top:1px solid var(--separator)}
.zone-detail .zd-motor>summary{display:flex;align-items:center;min-height:52px;padding:0 16px;color:var(--text-strong);font-size:.86rem;font-weight:650;cursor:pointer;list-style:none}
.zone-detail .zd-motor>summary::-webkit-details-marker{display:none}
.zone-detail .zd-motor>summary::after{content:'›';margin-left:auto;color:var(--text-muted);font-size:1.2rem;transition:transform .16s ease}
.zone-detail .zd-motor[open]>summary::after{transform:rotate(90deg)}
.zone-detail .zd-motor>summary small{margin-left:auto;margin-right:14px;color:var(--text-muted);font-size:.74rem;font-weight:400}
.zone-detail .zd-motor-body{padding:16px;border-top:1px solid var(--separator)}
.zone-detail .zd-motor-body .zd-stats{padding:0}
.zone-detail .zd-fault{margin:14px 0 0;padding:9px 10px;border:0;border-left:3px solid var(--state-danger);border-radius:0}
@media(max-width:560px){.zone-detail .zd-stats{grid-template-columns:1fr 1fr;gap:16px 0}.zone-detail .zd-stat:nth-child(odd){padding-left:0;border-left:0}.zone-detail .zd-motor>summary small{display:none}}
`;

const higCss = `
.zone-detail{height:auto;padding:0;background:transparent;border:1px solid var(--separator);border-radius:10px;box-shadow:none;overflow:hidden}
.zone-detail .zd-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:58px;margin:0;padding:10px 16px;border-bottom:1px solid var(--separator)}
.zone-detail .zd-title{color:var(--text-strong);font-size:1rem;font-weight:650}
.zone-detail .zd-head-ctrl{display:flex;align-items:center;gap:10px}
.zone-detail .zd-badge{padding:4px 9px;border:0;border-radius:999px;background:rgba(139,148,163,.12);color:var(--state-disabled);font-size:.72rem;font-weight:650}
.zone-detail .zd-badge.badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}.zone-detail .zd-badge.badge-idle{background:rgba(139,148,163,.12);color:var(--text-muted)}.zone-detail .zd-badge.badge-fault{background:rgba(239,68,68,.12);color:var(--state-danger)}
.zone-detail .zd-body>div:first-child{padding:18px 16px}
.zone-detail .zd-kicker{margin:0 0 7px;color:var(--text-muted);font-size:.76rem;font-weight:600}
.zone-detail .zd-target-row{display:grid;grid-template-columns:44px 7.5rem 44px;align-items:center;gap:10px;width:max-content}
.zone-detail .zd-setpoint-field{display:flex;align-items:baseline;justify-content:center;gap:2px;min-width:0}
.zone-detail .zd-setpoint{box-sizing:border-box;width:5.2ch;margin:0;padding:0;border:0;border-radius:0;background:transparent;color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;text-align:right;caret-color:var(--accent);outline:none;-moz-appearance:textfield}
.zone-detail .zd-setpoint::-webkit-outer-spin-button,.zone-detail .zd-setpoint::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.zone-detail .zd-setpoint:focus{box-shadow:inset 0 -2px 0 var(--accent)}
.zone-detail .zd-setpoint-unit{color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;line-height:1;pointer-events:none;user-select:none}
.zone-detail .spb{display:grid;width:44px;height:44px;place-items:center;border:1px solid var(--separator);border-radius:8px;background:var(--control-bg);color:var(--text-strong);font-size:1.15rem;cursor:pointer;flex:none}.zone-detail .spb:hover,.zone-detail .spb:active{background:rgba(var(--accent-rgb),.12);color:var(--accent)}
.zone-detail .zd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:0;padding:0 16px 18px}.zone-detail .zd-stat{min-width:0;padding:0 12px;border-left:1px solid var(--separator)}.zone-detail .zd-stat:first-child{padding-left:0;border-left:0}.zone-detail .zd-stat-label{color:var(--text-faint);font-size:.7rem;font-weight:600}.zone-detail .zd-stat-value{margin-top:4px;color:var(--text-strong);font-family:var(--font-display);font-size:1.08rem;font-weight:650;font-variant-numeric:tabular-nums}
.zone-detail .zd-motor{margin:0;border-top:1px solid var(--separator)}.zone-detail .zd-motor>summary{display:flex;align-items:center;min-height:52px;padding:0 16px;color:var(--text-strong);font-size:.86rem;font-weight:650;cursor:pointer;list-style:none}.zone-detail .zd-motor>summary::-webkit-details-marker{display:none}.zone-detail .zd-motor>summary::after{content:'›';margin-left:auto;color:var(--text-muted);font-size:1.2rem;transition:transform .16s ease}.zone-detail .zd-motor[open]>summary::after{transform:rotate(90deg)}.zone-detail .zd-motor>summary small{margin-left:auto;margin-right:14px;color:var(--text-muted);font-size:.74rem;font-weight:400}.zone-detail .zd-motor-body{padding:16px;border-top:1px solid var(--separator)}.zone-detail .zd-motor-body .zd-stats{padding:0}
.zone-detail .zd-fault{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:14px 0 0;padding:9px 10px;border-left:3px solid var(--state-danger);background:rgba(239,68,68,.06);font-size:.76rem}.zone-detail .zd-fault[hidden]{display:none}.zone-detail .zd-fault-label{color:var(--text-muted)}.zone-detail .zd-fault-val{color:var(--state-danger);font-weight:650}
@media(max-width:560px){.zone-detail .zd-stats{grid-template-columns:1fr 1fr;gap:16px 0}.zone-detail .zd-stat:nth-child(odd){padding-left:0;border-left:0}.zone-detail .zd-motor>summary small{display:none}}
`;

injectStyle('zone-detail', higCss);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => `
  <div class="zone-detail" data-zone="${ctx.zone}">
    <div class="zd-head">
      <div class="zd-title">${zoneLabel(ctx.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" data-i18n-label="zone.detail.enabled" data-i18n-title="zone.detail.enabled" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker" data-i18n="zone.detail.setpoint">Setpoint</div>
        <div class="zd-target-row">
          <button type="button" class="spb btn-dec" data-i18n-label="common.decrease" aria-label="decrease">−</button>
          <label class="zd-setpoint-field">
            <input class="zd-setpoint" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" spellcheck="false" data-i18n-label="zone.detail.setpoint" aria-label="Setpoint" />
            <span class="zd-setpoint-unit" aria-hidden="true">°C</span>
          </label>
          <button type="button" class="spb btn-inc" data-i18n-label="common.increase" aria-label="increase">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.currentTemp">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Local fallback</div><div class="zd-stat-value zd-base">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Touch offset</div><div class="zd-stat-value zd-offset">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.returnTemp">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.flowPct">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <details class="zd-motor">
        <summary>Advanced motor properties <small>Calibration and preheat</small></summary>
        <div class="zd-motor-body"><div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openRipples">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeRipples">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openFactor">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeFactor">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.preheatAdv">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div><div class="zd-fault" hidden><span class="zd-fault-label" data-i18n="zone.detail.lastFault">Last fault</span><span class="zd-fault-val">NONE</span></div></div>
      </details>
    </div>
  </div>
`;

const SETPOINT_MIN_C = 5;
const SETPOINT_MAX_C = 35;
const SETPOINT_STEP_C = 0.5;

function fmtFactor(v) { return v != null ? Number(v).toFixed(2) + 'x' : '---'; }
function fmtRipples(v) { return v != null ? Number(v).toFixed(0) : '---'; }
function fmtPreheat(v) { return v != null ? Number(v).toFixed(2) + 'C' : '---'; }
function fmtSetpointInput(v) {
  if (v == null || Number.isNaN(Number(v))) return '';
  return (Math.round(Number(v) * 10) / 10).toFixed(1);
}
function parseSetpointInput(raw) {
  if (raw == null) return null;
  const cleaned = String(raw).trim().replace(',', '.').replace(/[^\d.+-]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  const stepped = Math.round(n / SETPOINT_STEP_C) * SETPOINT_STEP_C;
  return Math.min(SETPOINT_MAX_C, Math.max(SETPOINT_MIN_C, Number(stepped.toFixed(1))));
}
function zoneBaseSetpoint(zone) {
  const v = Number(ev(key.setpoint(zone)));
  return Number.isFinite(v) ? v : null;
}
function zoneOffsetC(zone) {
  const v = Number(ev(key.coordinatorOffset(zone)));
  return Number.isFinite(v) ? v : 0;
}
function zoneAppliedSetpoint(zone) {
  const effective = Number(ev(key.effectiveSetpoint(zone)));
  if (Number.isFinite(effective)) return effective;
  const base = zoneBaseSetpoint(zone);
  if (base == null) return null;
  return Number((base + zoneOffsetC(zone)).toFixed(1));
}
function clampSetpoint(v) {
  return Math.min(SETPOINT_MAX_C, Math.max(SETPOINT_MIN_C, Number(Number(v).toFixed(1))));
}
function stateLabel(state, enabled) {
  if (!enabled) return t('common.disabled');
  const s = String(state || 'IDLE').toUpperCase();
  if (s === 'HEATING') return t('state.heating');
  if (s === 'IDLE') return t('state.idle');
  if (s === 'OFF') return t('state.off');
  if (s === 'FAULT') return t('common.fault');
  if (s === 'MANUAL') return t('state.manual');
  if (s === 'OVERHEATED') return t('state.overheated');
  if (s === 'CALIBRATING') return t('state.calibrating');
  return s;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-detail',

  state: (props) => ({
    zone: props.zone,
    temp: '---',
    setpoint: '---',
    valve: '---',
    state: '---'
  }),

  render: template,

  methods: {
    update(el, refs) {
      const zone = getDashboardValue('selectedZone');
      const state = String(es(key.state(zone)) || '').toUpperCase();
      const enabled = isEntityOn(key.enabled(zone));

      this.zone = zone;
      el.dataset.zone = String(zone);
      refs.title.textContent = zoneLabel(zone);
      // Paint Applied target (effective). Skip while typing so focus/caret stay put.
      if (document.activeElement !== refs.setpoint) {
        refs.setpoint.value = fmtSetpointInput(zoneAppliedSetpoint(zone));
      }
      refs.base.textContent = fmtT(ev(key.baseSetpoint(zone)) ?? ev(key.setpoint(zone)));
      const offset = ev(key.coordinatorOffset(zone));
      refs.offset.textContent = offset == null ? '---' : (offset > 0 ? '+' : '') + Number(offset).toFixed(1) + '°C';
      refs.temp.textContent = fmtT(ev(key.temp(zone)));
      refs.ret.textContent = fmtT(ev('sensor-manifold_return_temperature'));
      refs.valve.textContent = fmtV(ev(key.valve(zone)));
      const badge = refs.badge;
      badge.textContent = stateLabel(state, enabled);
      const badgeClass = !enabled ? 'badge-disabled' : state === 'HEATING' ? 'badge-heating' : state === 'IDLE' ? 'badge-idle' : state === 'FAULT' ? 'badge-fault' : '';
      badge.className = 'zd-badge' + (badgeClass ? ' ' + badgeClass : '');
      refs.toggle.classList.toggle('on', enabled);

      // Merged motor-snapshot data
      refs.orip.textContent = fmtRipples(ev(key.motorOpenRipples(zone)));
      refs.crip.textContent = fmtRipples(ev(key.motorCloseRipples(zone)));
      refs.ofac.textContent = fmtFactor(ev(key.motorOpenFactor(zone)));
      refs.cfac.textContent = fmtFactor(ev(key.motorCloseFactor(zone)));
      refs.ph.textContent = fmtPreheat(ev(key.preheatAdvance(zone)));
      const fault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
      const hasFault = fault && fault !== 'NONE' && fault !== 'OK';
      refs.fault.hidden = !hasFault;
      if (hasFault) refs.faultVal.textContent = fault;
    },

    commitSetpoint(raw) {
      const z = this.zone;
      const desiredApplied = parseSetpointInput(raw);
      if (desiredApplied == null) return null;
      // Persist the local base so Applied = base + Touch offset.
      const nextBase = clampSetpoint(desiredApplied - zoneOffsetC(z));
      setSetpoint(z, nextBase);
      return zoneAppliedSetpoint(z);
    },

    incSetpoint() {
      const z = this.zone;
      const applied = zoneAppliedSetpoint(z);
      const nextApplied = clampSetpoint((applied == null ? 20 : applied) + SETPOINT_STEP_C);
      setSetpoint(z, clampSetpoint(nextApplied - zoneOffsetC(z)));
    },

    decSetpoint() {
      const z = this.zone;
      const applied = zoneAppliedSetpoint(z);
      const nextApplied = clampSetpoint((applied == null ? 20 : applied) - SETPOINT_STEP_C);
      setSetpoint(z, clampSetpoint(nextApplied - zoneOffsetC(z)));
    },

    toggleEnabled() {
      const z = this.zone;
      const current = isEntityOn(key.enabled(z));
      setEnabled(z, !current);
    }
  },

  onMount(ctx, el) {
    const refs = {
      title: el.querySelector('.zd-title'),
      setpoint: el.querySelector('.zd-setpoint'),
      temp: el.querySelector('.zd-temp'),
      base: el.querySelector('.zd-base'),
      offset: el.querySelector('.zd-offset'),
      ret: el.querySelector('.zd-ret'),
      valve: el.querySelector('.zd-valve'),
      badge: el.querySelector('.zd-badge'),
      toggle: el.querySelector('.btn-toggle'),
      inc: el.querySelector('.btn-inc'),
      dec: el.querySelector('.btn-dec'),
      orip: el.querySelector('.zd-orip'),
      crip: el.querySelector('.zd-crip'),
      ofac: el.querySelector('.zd-ofac'),
      cfac: el.querySelector('.zd-cfac'),
      ph: el.querySelector('.zd-ph'),
      fault: el.querySelector('.zd-fault'),
      faultVal: el.querySelector('.zd-fault-val')
    };

    refs.inc.onclick = () => ctx.incSetpoint();
    refs.dec.onclick = () => ctx.decSetpoint();
    refs.toggle.onclick = () => ctx.toggleEnabled();

    const finishSetpointEdit = () => {
      const committed = ctx.commitSetpoint(refs.setpoint.value);
      refs.setpoint.value = committed != null
        ? fmtSetpointInput(committed)
        : fmtSetpointInput(zoneAppliedSetpoint(ctx.zone));
    };
    refs.setpoint.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        refs.setpoint.blur();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        refs.setpoint.value = fmtSetpointInput(zoneAppliedSetpoint(ctx.zone));
        refs.setpoint.blur();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        ctx.incSetpoint();
        refs.setpoint.value = fmtSetpointInput(zoneAppliedSetpoint(ctx.zone));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        ctx.decSetpoint();
        refs.setpoint.value = fmtSetpointInput(zoneAppliedSetpoint(ctx.zone));
      }
    });
    refs.setpoint.addEventListener('blur', finishSetpointEdit);
    // Select all on focus so a tap replaces the value quickly on touch devices.
    refs.setpoint.addEventListener('focus', () => {
      requestAnimationFrame(() => refs.setpoint.select());
    });

    const update = () => ctx.update(el, refs);
    // Applied Target prefers effectiveSetpoint over base setpoint. State JSON
    // writes setpoint first, then effective — if we only react to setpoint, the
    // paint runs before effective is updated and the UI sticks on the old value
    // until some unrelated field changes.
    const updateIfSelectedZone = (id) => {
      const zone = getDashboardValue('selectedZone');
      if (
        id === key.temp(zone) ||
        id === key.setpoint(zone) ||
        id === key.baseSetpoint(zone) ||
        id === key.effectiveSetpoint(zone) ||
        id === key.coordinatorOffset(zone) ||
        id === key.valve(zone) ||
        id === key.state(zone) ||
        id === key.enabled(zone)
      ) {
        update();
      }
    };

    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.temp(zone), updateIfSelectedZone);
      subscribe(key.setpoint(zone), updateIfSelectedZone);
      subscribe(key.baseSetpoint(zone), updateIfSelectedZone);
      subscribe(key.effectiveSetpoint(zone), updateIfSelectedZone);
      subscribe(key.coordinatorOffset(zone), updateIfSelectedZone);
      subscribe(key.valve(zone), updateIfSelectedZone);
      subscribe(key.state(zone), updateIfSelectedZone);
      subscribe(key.enabled(zone), updateIfSelectedZone);
      // Merged motor-snapshot fields (update() re-reads the selected zone).
      subscribe(key.motorOpenRipples(zone), update);
      subscribe(key.motorCloseRipples(zone), update);
      subscribe(key.motorOpenFactor(zone), update);
      subscribe(key.motorCloseFactor(zone), update);
      subscribe(key.preheatAdvance(zone), update);
      subscribe(key.motorLastFault(zone), update);
    }
    subscribe('sensor-manifold_return_temperature', update);
    subscribeDashboard('selectedZone', update);
    subscribeLanguage(() => { localize(el); update(); });
    localize(el);
    update();
  }
});
