import { component } from '../../core/component.js';
import { helpBadgeI18n, settingsCardHtml } from '../../core/ui-kit.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const template = () => settingsCardHtml({
  className: 'settings-appearance-card',
  titleHtml: `<span data-i18n="settings.appearance.title">Appearance</span>${helpBadgeI18n('settings.appearance.help')}`,
  bodyHtml: `<p class="ui-copy" data-i18n="settings.appearance.product">Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.</p>`,
});

export default component({
  tag: 'settings-appearance-card',
  render: template,
  onMount(ctx, el) {
    subscribeLanguage(() => localize(el));
    localize(el);
  }
});
