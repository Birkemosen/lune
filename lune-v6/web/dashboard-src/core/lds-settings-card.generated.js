// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const SETTINGS_CARD_CSS = `
.lds-settings-card,
.ui-card {
  background: var(--surface-raised);
  border: 1px solid var(--panel-border, var(--separator));
  border-radius: 8px;
  padding: 18px 20px;
  box-shadow: none;
  box-sizing: border-box;
}
.lds-settings-card-title,
.ui-card-title {
  font-family: var(--font-display);
  font-size: .875rem;
  font-weight: 650;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-strong);
  margin: 0 0 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border, var(--separator));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow: visible;
}
.lds-settings-card .ui-title-text,
.ui-card .ui-title-text {
  display: inline-flex;
  align-items: center;
}
.lds-settings-card-body {
  display: grid;
  gap: 0;
  min-width: 0;
}
`;

/**
 * Settings panel shell. Title and body HTML are product-owned (unescaped).
 *
 * @param {titleHtml?: string, bodyHtml?: string, className?: string, attrs?: string} opts
 */
export function settingsCardHtml({
  titleHtml = "",
  bodyHtml = "",
  className = "",
  attrs = "",
} = {}) {
  const classes = ["lds-settings-card", "ui-card", className].filter(Boolean).join(" ");
  return `<div class="${classes}" data-lds-settings-card ${attrs}>
  <div class="lds-settings-card-title ui-card-title"><span class="ui-title-text">${titleHtml}</span></div>
  <div class="lds-settings-card-body">${bodyHtml}</div>
</div>`;
}
