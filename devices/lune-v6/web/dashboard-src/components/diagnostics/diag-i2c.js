import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { runI2cScan } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}
.diag-i2c .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-i2c pre {
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.btn-row { margin-top: 12px; }
.btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--control-border); background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055)); color: var(--text-strong); font-weight: 700; cursor: pointer; }
.btn:hover { background: linear-gradient(135deg, rgba(255,138,61,.90), rgba(255,189,74,.84)); border-color: rgba(255,138,61,.5); color: var(--text-on-accent); }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;

injectStyle('diag-i2c', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-i2c',
  render: template,
  onMount(ctx, el) {
    const resultEl = el.querySelector('#i2c-result');

    function update() {
      resultEl.textContent = getDashboardValue('i2cResult') || t('diagnostics.i2c.empty');
    }

    el.querySelector('#btn-i2c-scan').addEventListener('click', () => {
      runI2cScan();
    });

    subscribeDashboard('i2cResult', update);
    subscribeLanguage(() => { localize(el); update(); });
    localize(el);
    update();
  }
});
