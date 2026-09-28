import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, subscribeDashboard } from '../../core/store.js';
import { setSetpoint } from '../../core/api.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';
import { dial, bindDial, updateDial, overrideBanner, updateOverrideBanner, comfortSliderHtml, paintComfortSlider } from '../../core/ui-kit.js';
import { luneMark } from '../../core/lune-mark.generated.js';
import { zoneChart } from '../../core/canvas.js';
import { fmtUp } from '../../utils/format.js';
import { zoneControlStatusLabel } from '../../utils/control-mode.js';
import { zoneLearningProgress } from '../../utils/learning-progress.js';
import { gkey } from '../../utils/keys.js';

const css = `
.zone-detail{height:auto;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none;overflow:visible}
.zone-detail .zd-head{display:none}
.zone-detail .zd-badge.badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}.zone-detail .zd-badge.badge-idle{background:transparent;color:var(--text-muted)}.zone-detail .zd-badge.badge-fault{background:color-mix(in srgb,var(--danger) 12%,transparent);color:var(--state-danger)}
.zone-detail .zd-dial-slot{margin:0}
.zone-detail .zd-chart-kicker{margin:22px 0 0;color:var(--text-muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.zone-detail .zd-chart-note{max-width:62ch;margin:6px 0 8px;color:var(--text-muted);font-size:.82rem;line-height:1.5}
.zone-detail .zd-chart .spark{width:100%;height:128px;margin-top:10px;display:block}
.zone-detail .zd-chart .spark .ref{stroke:color-mix(in srgb,var(--text-muted) 62%,transparent);stroke-width:1;stroke-dasharray:4 3}
.zone-detail .trend-meta{display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:var(--text-faint);font-size:.68rem;font-weight:650;letter-spacing:.04em;text-transform:uppercase}
.zone-detail .facts{display:flex;flex-wrap:wrap;gap:16px 28px;margin:18px 0 0;padding:0}
.zone-detail .facts>div{min-width:0}
.zone-detail .facts dt{color:var(--text-muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.zone-detail .facts dd{margin:4px 0 0;font-family:var(--font-display);font-size:1.15rem;font-weight:650;font-variant-numeric:tabular-nums}
.zone-detail .facts dd.is-warn{color:var(--state-warn)}
.zone-detail .facts dd.is-ok{color:var(--state-ok)}
.zone-detail .zd-learn-bar{display:none;margin-top:14px;padding:10px 12px;border-radius:10px;background:rgba(var(--learn-rgb),.08);border:1px solid rgba(var(--learn-rgb),.22)}
.zone-detail .zd-learn-bar.is-on{display:block}
.zone-detail .zd-learn-track{height:8px;border-radius:999px;background:rgba(var(--learn-rgb),.18);overflow:hidden}
.zone-detail .zd-learn-fill{height:100%;width:0;min-width:4%;border-radius:inherit;background:var(--learn);transition:width .35s ease}
.zone-detail .zd-learn-meta{margin-top:8px;color:var(--learn);font-size:.76rem;font-weight:650}
`;

injectStyle('zone-detail', css);

const template = (ctx) => `
  <div class="zone-detail" data-zone="${ctx.zone}">
    ${overrideBanner({ remaining: '', hint: t('zone.override.hint') })}
    <div class="zd-head">
      <div class="zd-title" data-i18n="zone.detail.title">Control</div>
      <span class="zd-badge">---</span>
    </div>
    <div class="zd-dial-slot"></div>
    <div class="zd-slider-slot"></div>
    <p class="zd-chart-kicker" data-i18n="zone.chart.kicker">Temperature · last 24h</p>
    <p class="zd-chart-note" data-i18n="zone.chart.note">Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.</p>
    <div class="zd-chart"></div>
    <dl class="facts">
      <div><dt data-i18n="zone.detail.setpoint">Setpoint</dt><dd class="zd-setpoint">—</dd></div>
      <div><dt data-i18n="zone.detail.currentTemp">Current</dt><dd class="zd-temp">—</dd></div>
      <div><dt data-i18n="zone.demand">Demand</dt><dd class="zd-demand">—</dd></div>
      <div><dt data-i18n="zone.learning.status">Learning</dt><dd class="zd-learning">—</dd></div>
    </dl>
    <div class="zd-learn-bar" hidden>
      <div class="zd-learn-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="zd-learn-fill"></div></div>
      <div class="zd-learn-meta">—</div>
    </div>
  </div>
`;

const SETPOINT_MIN_C = 5;
const SETPOINT_MAX_C = 35;
const SETPOINT_STEP_C = 0.5;

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
function fmtDeg(value) {
  return value == null || Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(1)}°`;
}
function stateLabel(zone, state, enabled) {
  return zoneControlStatusLabel(zone, enabled ? state : 'OFF');
}
function demandLabel(zone, enabled) {
  if (!enabled) return t('state.off');
  const state = String(es(key.state(zone)) || '').toUpperCase() || 'IDLE';
  return zoneControlStatusLabel(zone, state);
}

function learningFact(zone, enabled) {
  const learning = zoneLearningProgress(zone);
  if (enabled && learning.active) {
    return { text: `${learning.label} · ${learning.pct}%`, cls: 'is-warn', progress: learning };
  }
  const model = String(es(key.motorStrokeModel(zone)) || '');
  const working = Number(ev(key.motorWorkingRipples(zone)));
  const span = Number(ev(key.motorOpenRipples(zone)));
  if (model === 'working_range' && working > 0) {
    return {
      text: t('zone.learning.workingRangeDetail', { working: Math.round(working), span: Math.round(span || working) }),
      cls: 'is-ok',
      progress: null,
    };
  }
  if (span > 0) {
    return { text: t('zone.learning.fullStrokeDetail', { span: Math.round(span) }), cls: 'is-ok', progress: null };
  }
  return { text: t('zone.learning.needed'), cls: 'is-warn', progress: null };
}

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
      const applied = zoneAppliedSetpoint(zone);
      const temp = ev(key.temp(zone));

      this.zone = zone;
      el.dataset.zone = String(zone);
      if (refs.dial) {
        updateDial(refs.dial, {
          target: applied,
          current: temp,
          disabled: !enabled,
          states: ['idle', 'idle', 'idle', 'idle', 'idle', 'idle'],
          selected: -1,
        });
      }
      const remainingS = Number(ev(key.coordinatorRemaining(zone)));
      const offset = ev(key.coordinatorOffset(zone));
      const hasOverride = (Number.isFinite(remainingS) && remainingS > 0) || (Number.isFinite(offset) && Math.abs(offset) > 0.05);
      const offsetText = offset == null ? '—' : (offset > 0 ? '+' : '') + Number(offset).toFixed(1) + '°';
      updateOverrideBanner(el, {
        remaining: hasOverride
          ? t('zone.override.remaining', { offset: offsetText, remaining: fmtUp(Math.max(0, remainingS || 0)) })
          : '',
        hint: t('zone.override.hint'),
      });
      const appliedText = fmtDeg(applied);
      refs.setpoint.textContent = appliedText;
      refs.temp.textContent = fmtDeg(temp);
      refs.demand.textContent = demandLabel(zone, enabled);
      const learning = learningFact(zone, enabled);
      refs.learning.textContent = learning.text;
      refs.learning.className = 'zd-learning' + (learning.cls ? ' ' + learning.cls : '');
      if (refs.learnBar) {
        const on = !!(learning.progress && learning.progress.active);
        refs.learnBar.hidden = !on;
        refs.learnBar.classList.toggle('is-on', on);
        if (on) {
          refs.learnFill.style.width = Math.max(learning.progress.pct, 4) + '%';
          refs.learnTrack.setAttribute('aria-valuenow', String(learning.progress.pct));
          refs.learnMeta.textContent = learning.progress.label + ' · ' + learning.progress.pct + '%';
        }
      }
      if (refs.slider) {
        if (Number.isFinite(applied)) refs.slider.value = String(applied);
        refs.slider.disabled = !enabled;
        paintComfortSlider(refs.slider);
      }
      if (refs.sliderValue) refs.sliderValue.textContent = appliedText;
      if (refs.chart) refs.chart.innerHTML = zoneChart(zone);
      if (refs.badge) {
        const badge = refs.badge;
        badge.textContent = stateLabel(zone, state, enabled);
        const badgeClass = !enabled ? 'badge-disabled' : state === 'HEATING' ? 'badge-heating' : state === 'IDLE' ? 'badge-idle' : state === 'FAULT' ? 'badge-fault' : '';
        badge.className = 'zd-badge' + (badgeClass ? ' ' + badgeClass : '');
      }
    },

    stepSetpoint(delta) {
      const z = this.zone;
      const applied = zoneAppliedSetpoint(z);
      const nextApplied = clampSetpoint((applied == null ? 20 : applied) + delta);
      setSetpoint(z, clampSetpoint(nextApplied - zoneOffsetC(z)));
    },

    setApplied(nextApplied) {
      const z = this.zone;
      setSetpoint(z, clampSetpoint(nextApplied - zoneOffsetC(z)));
    },

  },

  onMount(ctx, el) {
    const dialSlot = el.querySelector('.zd-dial-slot');
    dialSlot.innerHTML = dial({
      id: 'zone-detail-dial',
      markHtml: luneMark({ states: ['idle', 'idle', 'idle', 'idle', 'idle', 'idle'], selected: -1, prefix: 'zone-detail-halo' }),
      target: 20,
      current: null,
      min: SETPOINT_MIN_C,
      max: SETPOINT_MAX_C,
      step: SETPOINT_STEP_C,
      unit: 'C',
      label: 'Zone setpoint',
    });
    const sliderSlot = el.querySelector('.zd-slider-slot');
    sliderSlot.innerHTML = comfortSliderHtml({
      min: SETPOINT_MIN_C,
      max: SETPOINT_MAX_C,
      step: SETPOINT_STEP_C,
      value: 21,
      label: 'Comfort setpoint',
    });
    const refs = {
      dial: dialSlot.querySelector('.lds-dial'),
      temp: el.querySelector('.zd-temp'),
      setpoint: el.querySelector('.zd-setpoint'),
      demand: el.querySelector('.zd-demand'),
      learning: el.querySelector('.zd-learning'),
      learnBar: el.querySelector('.zd-learn-bar'),
      learnFill: el.querySelector('.zd-learn-fill'),
      learnTrack: el.querySelector('.zd-learn-track'),
      learnMeta: el.querySelector('.zd-learn-meta'),
      badge: el.querySelector('.zd-badge'),
      slider: el.querySelector('[data-comfort-slider]'),
      sliderValue: el.querySelector('[data-slider-value]'),
      chart: el.querySelector('.zd-chart'),
    };

    bindDial(refs.dial, {
      onStep: (delta) => ctx.stepSetpoint(delta),
    });
    refs.slider.addEventListener('input', () => {
      const next = parseFloat(refs.slider.value);
      if (!Number.isFinite(next)) return;
      paintComfortSlider(refs.slider);
      refs.sliderValue.textContent = fmtDeg(next);
      ctx.setApplied(next);
    });

    const update = () => ctx.update(el, refs);
    const updateIfSelectedZone = (id) => {
      const zone = getDashboardValue('selectedZone');
      if (
        /(?:text_sensor-zone_\d+_state|switch-zone_\d+_enabled|sensor-zone_\d+_valve_pct|sensor-motor_\d+_(?:learned_open_ripples|working_ripples|pin_free_ripples|learn_pct|learn_sample|learn_samples_needed)|text_sensor-motor_\d+_(?:stroke_model|learn_phase))$/.test(id) ||
        id === key.temp(zone) ||
        id === key.setpoint(zone) ||
        id === key.baseSetpoint(zone) ||
        id === key.effectiveSetpoint(zone) ||
        id === key.coordinatorOffset(zone) ||
        id === key.coordinatorRemaining(zone)
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
      subscribe(key.coordinatorRemaining(zone), updateIfSelectedZone);
      subscribe(key.valve(zone), updateIfSelectedZone);
      subscribe(key.state(zone), updateIfSelectedZone);
      subscribe(key.enabled(zone), updateIfSelectedZone);
      subscribe(key.motorOpenRipples(zone), updateIfSelectedZone);
      subscribe(key.motorWorkingRipples(zone), updateIfSelectedZone);
      subscribe(key.motorPinFreeRipples(zone), updateIfSelectedZone);
      subscribe(key.motorStrokeModel(zone), updateIfSelectedZone);
      subscribe(key.motorLearnPct(zone), updateIfSelectedZone);
      subscribe(key.motorLearnPhase(zone), updateIfSelectedZone);
      subscribe(key.motorLearnSample(zone), updateIfSelectedZone);
      subscribe(key.motorLearnSamplesNeeded(zone), updateIfSelectedZone);
    }
    subscribe('sensor-manifold_return_temperature', update);
    subscribe(gkey.effectiveHeatingMode, update);
    subscribe(gkey.heatingMode, update);
    subscribe(gkey.hpBasePct, update);
    subscribe(gkey.hpTrimFloorPct, update);
    subscribeDashboard('selectedZone', update);
    subscribeLanguage(() => { localize(el); update(); });
    localize(el);
    update();
  }
});
