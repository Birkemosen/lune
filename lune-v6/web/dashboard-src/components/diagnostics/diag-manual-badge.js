import { component } from '../../core/component.js';
import { subscribeDashboard, getDashboardValue } from '../../core/store.js';
import { injectStyle } from '../../core/style.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const css = `
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--danger-border-soft);
  background: var(--danger-bg);
  border-radius: 8px;
  padding: 10px 12px;
}

.diag-manual-badge.on {
  display: flex;
}

.diag-manual-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--state-danger);
}

.diag-manual-text {
  color: var(--danger-text);
  font-size: .8rem;
  font-weight:650;
}
`;

injectStyle('diag-manual-badge', css);

const template = () => `
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`;

export default component({
  tag: 'diag-manual-badge',
  render: template,
  onMount(ctx, el) {
    const badgeEl = el.classList.contains('diag-manual-badge') ? el : el.querySelector('.diag-manual-badge');

    function update() {
      const enabled = !!getDashboardValue('manualMode');
      if (badgeEl) badgeEl.classList.toggle('on', enabled);
    }

    subscribeDashboard('manualMode', update);
    subscribeLanguage(() => localize(el));
    localize(el);
    update();
  }
});
