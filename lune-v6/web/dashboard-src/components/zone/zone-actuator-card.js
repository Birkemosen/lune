import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { resetMotorFault, resetMotorLearnedFactors, resetMotorAndRelearn } from '../../core/api.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.zone-actuator-disclosure { height: auto; }
.zone-actuator-disclosure .za-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 0;
  padding: 4px 0 8px;
}
.zone-actuator-disclosure .za-stat {
  min-width: 0;
  padding: 0 12px;
  border-left: 1px solid var(--separator);
}
.zone-actuator-disclosure .za-stat:first-child { padding-left: 0; border-left: 0; }
.zone-actuator-disclosure .za-stat-label {
  color: var(--text-faint);
  font-size: .7rem;
  font-weight: 600;
}
.zone-actuator-disclosure .za-stat-value {
  margin-top: 4px;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.zone-actuator-disclosure .za-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 0 4px;
  padding: 9px 10px;
  border-left: 3px solid var(--state-danger);
  background: rgba(239, 68, 68, .06);
  font-size: .76rem;
}
.zone-actuator-disclosure .za-fault[hidden] { display: none; }
.zone-actuator-disclosure .za-fault-label { color: var(--text-muted); }
.zone-actuator-disclosure .za-fault-val { color: var(--state-danger); font-weight: 650; }
.zone-actuator-disclosure .za-actions {
  border-top: 1px solid var(--separator);
  margin-top: 4px;
}
.zone-actuator-disclosure .za-action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: var(--control-height, 44px);
  padding: 8px 0;
  border-bottom: 1px solid var(--separator);
}
.zone-actuator-disclosure .za-action:last-child { border-bottom: 0; }
.zone-actuator-disclosure .za-copy strong {
  display: block;
  color: var(--text-strong);
  font-size: .88rem;
  font-weight: 600;
}
.zone-actuator-disclosure .za-copy span {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: .76rem;
}
.zone-actuator-disclosure .za-status {
  margin-top: 10px;
  font-size: .78rem;
  font-weight: 600;
  min-height: 1.1em;
  opacity: 0;
  transition: opacity .15s ease;
}
.zone-actuator-disclosure .za-status.show { opacity: 1; }
.zone-actuator-disclosure .za-status.ok { color: var(--state-ok); }
.zone-actuator-disclosure .za-status.err { color: var(--state-danger); }
.zone-actuator-disclosure .za-btn {
  min-width: 150px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: .875rem;
  line-height: 1.2;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
}
.zone-actuator-disclosure .za-btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--accent-border-hover);
  color: var(--accent-text-soft);
}
.zone-actuator-disclosure .za-btn.warn {
  background: var(--danger-bg);
  border-color: var(--danger-border-soft);
  color: var(--danger-text);
}
.zone-actuator-disclosure .za-btn.warn:hover {
  background: linear-gradient(135deg, var(--danger-bg-strong), var(--danger-bg-soft));
  border-color: var(--danger-border);
}
@media (max-width: 620px) {
  .zone-actuator-disclosure .za-action { grid-template-columns: 1fr; }
  .zone-actuator-disclosure .za-btn { width: 100%; }
  .zone-actuator-disclosure .za-stats { grid-template-columns: 1fr 1fr; gap: 16px 0; }
  .zone-actuator-disclosure .za-stat:nth-child(odd) { padding-left: 0; border-left: 0; }
}
`;

injectStyle('zone-actuator-card', css);

function fmtFactor(v) { return v != null ? Number(v).toFixed(2) + 'x' : '---'; }
function fmtRipples(v) { return v != null ? Number(v).toFixed(0) : '---'; }
function fmtPreheat(v) { return v != null ? Number(v).toFixed(2) + 'C' : '---'; }

const template = () => `
  <details class="disclosure zone-actuator-disclosure">
    <summary data-i18n="zone.actuator.title">Actuator</summary>
    <div class="disclosure-body">
      <div class="ui-section" data-i18n="zone.actuator.calibration">Calibration and preheat</div>
      <div class="za-stats">
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.openRipples">Open Ripples</div><div class="za-stat-value za-orip">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.closeRipples">Close Ripples</div><div class="za-stat-value za-crip">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.openFactor">Open Factor</div><div class="za-stat-value za-ofac">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.closeFactor">Close Factor</div><div class="za-stat-value za-cfac">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.preheatAdv">Preheat Adv.</div><div class="za-stat-value za-ph">---</div></div>
      </div>
      <div class="za-fault" hidden><span class="za-fault-label" data-i18n="zone.detail.lastFault">Last fault</span><span class="za-fault-val">NONE</span></div>
      <div class="ui-section" data-i18n="zone.actuator.recovery">Service and recovery</div>
      <div class="za-actions">
        <div class="za-action">
          <div class="za-copy">
            <strong data-i18n="diagnostics.recovery.clearFaultTitle">Clear current fault</strong>
            <span data-i18n="diagnostics.recovery.clearFaultHelp">Acknowledge the current motor fault without changing learned values.</span>
          </div>
          <button type="button" class="za-btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Clear fault</button>
        </div>
        <div class="za-action">
          <div class="za-copy">
            <strong data-i18n="diagnostics.recovery.resetFactorsTitle">Reset learned factors</strong>
            <span data-i18n="diagnostics.recovery.resetFactorsHelp">Remove calibration values while leaving the valve stopped.</span>
          </div>
          <button type="button" class="za-btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset factors…</button>
        </div>
        <div class="za-action">
          <div class="za-copy">
            <strong data-i18n="diagnostics.recovery.relearnTitle">Reset and relearn</strong>
            <span data-i18n="diagnostics.recovery.relearnHelp">Reset calibration and start a complete motor learning cycle.</span>
          </div>
          <button type="button" class="za-btn warn recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset and relearn…</button>
        </div>
      </div>
      <div class="za-status" role="status"></div>
    </div>
  </details>
`;

export default component({
  tag: 'zone-actuator-card',
  render: template,
  onMount(ctx, el) {
    let zone = Number(getDashboardValue('selectedZone') || 1);
    const refs = {
      orip: el.querySelector('.za-orip'),
      crip: el.querySelector('.za-crip'),
      ofac: el.querySelector('.za-ofac'),
      cfac: el.querySelector('.za-cfac'),
      ph: el.querySelector('.za-ph'),
      fault: el.querySelector('.za-fault'),
      faultVal: el.querySelector('.za-fault-val'),
      faultBtn: el.querySelector('.recovery-fault-btn'),
      factorsBtn: el.querySelector('.recovery-factors-btn'),
      relearnBtn: el.querySelector('.recovery-relearn-btn'),
      status: el.querySelector('.za-status'),
    };

    function updateMetrics() {
      zone = Number(getDashboardValue('selectedZone') || 1);
      refs.orip.textContent = fmtRipples(ev(key.motorOpenRipples(zone)));
      refs.crip.textContent = fmtRipples(ev(key.motorCloseRipples(zone)));
      refs.ofac.textContent = fmtFactor(ev(key.motorOpenFactor(zone)));
      refs.cfac.textContent = fmtFactor(ev(key.motorCloseFactor(zone)));
      refs.ph.textContent = fmtPreheat(ev(key.preheatAdvance(zone)));
      const fault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
      const hasFault = fault && fault !== 'NONE' && fault !== 'OK';
      refs.fault.hidden = !hasFault;
      if (hasFault) refs.faultVal.textContent = fault;
    }

    let statusTimer = null;
    function showStatus(msg, ok) {
      refs.status.textContent = msg;
      refs.status.className = 'za-status show ' + (ok ? 'ok' : 'err');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { refs.status.classList.remove('show'); }, 4000);
    }

    function run(action, sentMsg) {
      const p = action(zone);
      showStatus(sentMsg, true);
      if (p && typeof p.then === 'function') {
        p.then((resp) => {
          if (resp && resp.ok === false) showStatus(t('diagnostics.recovery.rejected'), false);
        }).catch(() => showStatus(t('diagnostics.recovery.unreachable'), false));
      }
    }

    refs.faultBtn?.addEventListener('click', () => {
      run(resetMotorFault, '✓ ' + t('diagnostics.recovery.faultSent', { zone: zoneLabel(zone) }));
    });
    refs.factorsBtn?.addEventListener('click', () => {
      if (confirm(t('diagnostics.recovery.confirmFactors', { zone: zoneLabel(zone) }))) {
        run(resetMotorLearnedFactors, '✓ ' + t('diagnostics.recovery.factorsReset', { zone: zoneLabel(zone) }));
      }
    });
    refs.relearnBtn?.addEventListener('click', () => {
      if (confirm(t('diagnostics.recovery.confirmRelearn', { zone: zoneLabel(zone) }))) {
        run(resetMotorAndRelearn, '✓ ' + t('diagnostics.recovery.relearnStarted', { zone: zoneLabel(zone) }));
      }
    });

    subscribeDashboard('selectedZone', updateMetrics);
    for (let z = 1; z <= 6; z++) {
      subscribe(key.motorOpenRipples(z), updateMetrics);
      subscribe(key.motorCloseRipples(z), updateMetrics);
      subscribe(key.motorOpenFactor(z), updateMetrics);
      subscribe(key.motorCloseFactor(z), updateMetrics);
      subscribe(key.preheatAdvance(z), updateMetrics);
      subscribe(key.motorLastFault(z), updateMetrics);
    }
    subscribeLanguage(() => { localize(el); updateMetrics(); });
    localize(el);
    updateMetrics();
  },
});
