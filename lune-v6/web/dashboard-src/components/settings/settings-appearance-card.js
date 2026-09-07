import { component } from '../../core/component.js';
import { helpBadgeI18n } from '../../core/ui-kit.js';
import { getTheme, setTheme, THEMES } from '../../core/theme.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const OPTIONS = [
  { value: THEMES.refinedEmber, labelKey: 'settings.appearance.refinedEmber' },
  { value: THEMES.deepForest, labelKey: 'settings.appearance.deepForest' },
];

const template = () => `
  <div class="ui-card settings-appearance-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.appearance.title">Appearance</span>${helpBadgeI18n('settings.appearance.help')}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.appearance.accent">Accent</span> <span class="ui-sublabel" data-i18n="settings.appearance.accentSub">Colour used for highlights and selected controls in this browser.</span></span>
      <span class="ui-field"><select class="ui-select sap-theme" data-i18n-label="settings.appearance.accent" aria-label="Accent theme"></select></span>
    </div>
  </div>
`;

export default component({
  tag: 'settings-appearance-card',
  render: template,
  onMount(ctx, el) {
    const select = el.querySelector('.sap-theme');

    const fill = () => {
      const current = select.value || getTheme();
      select.innerHTML = OPTIONS.map((opt) =>
        `<option value="${opt.value}">${t(opt.labelKey)}</option>`
      ).join('');
      select.value = current;
    };

    fill();
    select.value = getTheme();
    select.addEventListener('change', () => setTheme(select.value));
    window.addEventListener('lune-theme-change', (event) => {
      if (event.detail) select.value = event.detail;
    });
    subscribeLanguage(() => {
      localize(el);
      fill();
    });
    localize(el);
  }
});
