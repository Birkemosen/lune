// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const TAB_BAR_CSS = `
.lds-tab-item.nav-compact-only,
.menu-link.nav-compact-only {
  display: none !important;
}
.lds-tab-more,
.nav-more {
  display: none;
}
@media (max-width: 900px) {
  .lds-tab-bar,
  .top-menu.lds-tab-bar {
    display: grid;
    flex: none;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
  }
  .lds-tab-group,
  .lds-tab-bar .nav-primary {
    display: contents;
  }
  .lds-tab-item.nav-compact-only,
  .menu-link.nav-compact-only {
    display: flex !important;
  }
  .lds-tab-bar .lds-tab-item,
  .lds-tab-bar .menu-link.nav-btn {
    min-height: 52px;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    padding: 5px 3px;
    font-size: .75rem;
    text-align: center;
  }
  .lds-tab-bar .menu-icon {
    width: 19px;
    height: 19px;
  }
  .lds-tab-bar .menu-label,
  .lds-tab-bar .sidebar.collapsed .menu-label {
    display: inline;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lds-tab-more,
  .nav-more {
    position: relative;
    display: block;
  }
  .lds-tab-more > summary,
  .nav-more > summary {
    display: flex;
    height: 52px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    border-radius: 8px;
    color: var(--muted);
    font-size: .75rem;
    cursor: pointer;
    list-style: none;
  }
  .lds-tab-more > summary::-webkit-details-marker,
  .nav-more > summary::-webkit-details-marker {
    display: none;
  }
  .lds-tab-more.contains-current > summary,
  .lds-tab-more[open] > summary,
  .nav-more.contains-current > summary,
  .nav-more[open] > summary {
    background: var(--fill-selected, color-mix(in srgb, var(--series-cool) 22%, transparent));
    color: var(--series-cool, var(--accent));
  }
  .lds-tab-more-menu,
  .nav-more-menu {
    position: absolute;
    right: 0;
    bottom: 60px;
    width: 190px;
    padding: 7px;
    border: 1px solid var(--separator);
    border-radius: 12px;
    background: color-mix(in srgb, var(--bg) 92%, transparent);
    box-shadow: 0 14px 38px rgba(0, 0, 0, .44);
    backdrop-filter: blur(22px) saturate(1.2);
  }
  .lds-tab-more-menu .menu-link,
  .nav-more-menu .menu-link {
    flex-direction: row;
    justify-content: flex-start;
    gap: 9px;
    min-height: 44px;
    padding: 8px 10px;
    font-size: .82rem;
  }
  .lds-tab-more-menu .menu-icon,
  .nav-more-menu .menu-icon {
    width: 18px;
    height: 18px;
  }
  .lds-tab-bar .nav-dot,
  .lds-tab-more > summary .nav-dot {
    position: absolute;
    top: 6px;
    right: 8px;
    margin-left: 0;
    width: 7px;
    height: 7px;
  }
}
`;

function _esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * One compact / sidebar nav destination.
 *
 * @param {id: string, label: string, iconSvg?: string, current?: boolean, attention?: boolean, attentionWarn?: boolean, compactOnly?: boolean, attrs?: string, className?: string, title?: string, ariaLabel?: string} opts
 */
export function tabItemHtml({
  id,
  label,
  iconSvg = "",
  current = false,
  attention = false,
  attentionWarn = false,
  compactOnly = false,
  attrs = "",
  className = "",
  title = "",
  ariaLabel = "",
} = {}) {
  const classes = [
    "lds-tab-item",
    "menu-link",
    "nav-btn",
    compactOnly ? "nav-compact-only" : "",
    current ? "active is-active" : "",
    className,
  ].filter(Boolean).join(" ");
  const tip = title || label;
  const aria = ariaLabel || tip || label;
  const icon = iconSvg
    ? `<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${iconSvg}</svg>`
    : "";
  const dot = attention
    ? `<span class="nav-dot${attentionWarn ? " is-warn" : ""}" data-nav-dot aria-hidden="true"></span>`
    : `<span class="nav-dot" data-nav-dot hidden aria-hidden="true"></span>`;
  return `<button type="button" class="${classes}" data-section="${_esc(id)}" title="${_esc(tip)}" aria-label="${_esc(aria)}"${current ? ' aria-current="page"' : ""} ${attrs}>${icon}<span class="menu-label">${_esc(label)}</span>${dot}</button>`;
}

/**
 * More overflow control. `menuHtml` is product-owned list markup.
 *
 * @param {label?: string, menuHtml?: string, containsCurrent?: boolean, open?: boolean, attention?: boolean, attentionWarn?: boolean, ariaLabel?: string, title?: string, iconSvg?: string} opts
 */
export function tabMoreHtml({
  label = "More",
  menuHtml = "",
  containsCurrent = false,
  open = false,
  attention = false,
  attentionWarn = false,
  ariaLabel = "",
  title = "",
  iconSvg = '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
} = {}) {
  const classes = [
    "lds-tab-more",
    "nav-more",
    containsCurrent ? "contains-current" : "",
  ].filter(Boolean).join(" ");
  const tip = title || label;
  const aria = ariaLabel || tip || label;
  const dot = attention
    ? `<span class="nav-dot${attentionWarn ? " is-warn" : ""}" data-nav-dot aria-hidden="true"></span>`
    : `<span class="nav-dot" data-nav-dot hidden aria-hidden="true"></span>`;
  const openAttr = open ? " open" : "";
  return `<details class="${classes}"${openAttr} data-lds-tab-more>
  <summary aria-label="${_esc(aria)}" title="${_esc(tip)}"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${iconSvg}</svg><span class="menu-label">${_esc(label)}</span>${dot}</summary>
  <div class="lds-tab-more-menu nav-more-menu">${menuHtml}</div>
</details>`;
}

/**
 * Compact tab bar shell. Pass pre-rendered tab + more HTML from the product.
 *
 * @param {tabsHtml?: string, moreHtml?: string, label?: string, attrs?: string, className?: string} opts
 */
export function tabBarHtml({
  tabsHtml = "",
  moreHtml = "",
  label = "Primary navigation",
  attrs = "",
  className = "",
} = {}) {
  const classes = ["lds-tab-bar", "top-menu", className].filter(Boolean).join(" ");
  return `<nav class="${classes}" aria-label="${_esc(label)}" data-lds-tab-bar ${attrs}>${tabsHtml}${moreHtml}</nav>`;
}
