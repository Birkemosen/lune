import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, setSection, setSelectedZone, subscribeDashboard, zoneLabel, zoneTag } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { key } from '../../utils/keys.js';
import { subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.zone-card {
  width:100%; min-width:0; min-height:72px; margin:0; padding:12px 16px; border:0; border-radius:0;
  display:grid; grid-template-columns:minmax(170px,1.4fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(100px,.7fr) 28px;
  align-items:center; gap:16px; background:transparent; color:var(--text-main); font:inherit; text-align:left; cursor:pointer;
}
.zone-card + .zone-card{border-top:1px solid var(--separator)}
.zone-card:hover{background:rgba(255,255,255,.025)}
.zone-card:active{background:rgba(var(--accent-rgb),.08)}
.zone-card.active{background:rgba(var(--accent-rgb),.10)}
.zone-card.disabled{color:var(--text-muted)}
.zone-card .zc-zone-name,.zone-card .zc-friendly,.zone-card .zc-reading,.zone-card .zc-valve,.zone-card .zc-state-row{min-width:0}
.zone-card .zc-zone-name{grid-column:1;grid-row:1;color:var(--text-strong);font-size:.94rem;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zone-card .zc-friendly{grid-column:1;grid-row:1;margin-top:25px;color:var(--text-faint);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zone-card .zc-reading{grid-column:2;grid-row:1}.zone-card .zc-valve{grid-column:3;grid-row:1}
.zone-card .zc-reading strong,.zone-card .zc-valve strong{display:block;color:var(--text-strong);font-size:.94rem;font-weight:650;font-variant-numeric:tabular-nums}
.zone-card .zc-reading small,.zone-card .zc-valve small{display:block;margin-top:3px;color:var(--text-muted);font-size:.72rem}
.zone-card .zc-state-row{grid-column:4;grid-row:1;display:flex;align-items:center;gap:6px}
.zone-card .zc-dot{width:7px;height:7px;flex:0 0 auto;border-radius:50%;background:var(--state-disabled)}
.zone-card .zc-state-label{overflow:hidden;color:var(--text-muted);font-size:.78rem;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.zone-card.zs-heating .zc-dot{background:var(--accent)}.zone-card.zs-heating .zc-state-label{color:var(--accent)}
.zone-card.zs-idle .zc-dot,.zone-card.zs-off .zc-dot{background:var(--state-disabled)}.zone-card.zs-idle .zc-state-label,.zone-card.zs-off .zc-state-label{color:var(--text-muted)}
.zone-card.zs-fault .zc-dot{background:var(--state-danger)}.zone-card.zs-fault .zc-state-label{color:var(--state-danger)}
.zone-card::after{content:'›';grid-column:5;grid-row:1;color:var(--text-muted);font-size:1.35rem;text-align:right}
`;
injectStyle('zone-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => `
	<button type="button" class="zone-card" data-zone="${ctx.zone}" aria-label="Open zone ${ctx.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${zoneLabel(ctx.zone)}</div>
		<div class="zc-friendly">${zoneTag(ctx.zone) || '---'}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
	tag: 'zone-card',
	state: (props) => ({
		zone: props.zone,
		selection: props.selection !== false,
		navigate: props.navigate !== false,
	}),
	render: template,
		onMount(ctx, el) {
			const zone = ctx.zone;
			const tempKey = key.temp(zone);
			const stateKey = key.state(zone);
			const enabledKey = key.enabled(zone);
			const stateEl = el.querySelector('.zc-state-label');
			const nameEl = el.querySelector('.zc-zone-name');
			const friendlyEl = el.querySelector('.zc-friendly');
			const tempEl = el.querySelector('.zc-temp');
			const targetEl = el.querySelector('.zc-target');
			const valveEl = el.querySelector('.zc-valve-value');

			function update() {
				const enabled = isEntityOn(enabledKey);
				const rawState = String(es(stateKey) || '').toUpperCase() || 'OFF';
				// A persisted motor fault (cleared via the Faults & Relearn card)
				// promotes the card to FAULT even if the FSM has moved on.
				const lastFault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
				const hasFault = lastFault && lastFault !== 'NONE' && lastFault !== 'OK';
				const state = (enabled && (rawState === 'FAULT' || hasFault)) ? 'FAULT' : rawState;
				const active = ctx.selection && getDashboardValue('selectedZone') === zone;
				const friendlyTag = zoneTag(zone);

				nameEl.textContent = friendlyTag || 'Zone ' + zone;
				friendlyEl.textContent = 'Zone ' + zone + ' · physical loop';
				tempEl.textContent = fmtT(ev(tempKey));
				targetEl.textContent = t('zone.card.setpoint', {
					value: fmtT(ev(key.effectiveSetpoint(zone)) ?? ev(key.setpoint(zone))),
				});
				valveEl.textContent = fmtV(ev(key.valve(zone)));
				const displayState = enabled ? state : 'OFF';
				stateEl.textContent =
					displayState === 'HEATING' ? t('state.heating') :
					displayState === 'IDLE' ? t('state.idle') :
					displayState === 'FAULT' ? t('common.fault') :
					displayState === 'MANUAL' ? t('state.manual') :
					displayState === 'OVERHEATED' ? t('state.overheated') :
					displayState === 'CALIBRATING' ? t('state.calibrating') :
					t('state.off');
				el.title = hasFault ? t('zone.card.fault', { fault: lastFault }) : '';

				el.classList.toggle('active', active);
				if (active) el.setAttribute('aria-current', 'location'); else el.removeAttribute('aria-current');
				el.setAttribute('aria-label', `${nameEl.textContent}, ${tempEl.textContent}, ${targetEl.textContent}, ${stateEl.textContent}. Open details.`);
				el.classList.toggle('disabled', !enabled);
				el.classList.toggle('zs-heating', enabled && displayState === 'HEATING');
				el.classList.toggle('zs-fault', enabled && displayState === 'FAULT');
				el.classList.toggle('zs-idle', enabled && displayState === 'IDLE');
				el.classList.toggle('zs-off', !enabled || displayState === 'OFF');
			}

			function select() {
				setSelectedZone(zone);
				if (ctx.navigate) setSection('zones');
				el.dispatchEvent(new CustomEvent('zone-open', { bubbles: true, detail: { zone } }));
			}
			el.addEventListener('click', select);

			subscribe(tempKey, update);
			subscribe(key.setpoint(zone), update);
			subscribe(key.effectiveSetpoint(zone), update);
			subscribe(key.valve(zone), update);
			subscribe(stateKey, update);
			subscribe(enabledKey, update);
			subscribe(key.motorLastFault(zone), update);
			subscribeDashboard('selectedZone', update);
			subscribeDashboard('zoneNames', update);
			subscribeLanguage(update);
			update();
		}
});
