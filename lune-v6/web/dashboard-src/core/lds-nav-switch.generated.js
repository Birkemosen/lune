// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const NAV_SWITCH_CSS = `
.lds-nav-switch,
.nav-switch {
  position: relative;
  width: 34px;
  height: 20px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, .1);
  cursor: pointer;
  padding: 0;
  vertical-align: middle;
}
.lds-nav-switch::after,
.nav-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-faint);
  transition: left .15s ease, background .15s ease;
}
.lds-nav-switch.is-on,
.nav-switch.is-on {
  background: rgba(var(--forest-rgb), .35);
}
.lds-nav-switch.is-on::after,
.nav-switch.is-on::after {
  left: 17px;
  background: var(--ok);
}
.lds-nav-switch:disabled,
.lds-nav-switch.is-disabled,
.nav-switch:disabled,
.nav-switch.is-disabled {
  opacity: .42;
  cursor: default;
}
.lds-nav-switch:focus-visible,
.nav-switch:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
@media (max-width: 900px) {
  .sidebar.collapsed .lds-nav-switch,
  .sidebar.collapsed .nav-switch {
    display: none;
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
 * Compact enable switch. Use for sidebar integrations and zone enable/disable.
 *
 * @param {on?: boolean, disabled?: boolean, label?: string, title?: string, attrs?: string, className?: string} opts
 */
export function navSwitchHtml({
  on = false,
  disabled = false,
  label = "",
  title = "",
  attrs = "",
  className = "",
} = {}) {
  const classes = [
    "lds-nav-switch",
    "nav-switch",
    on ? "is-on" : "",
    disabled ? "is-disabled" : "",
    className,
  ].filter(Boolean).join(" ");
  const aria = _esc(label || title || "Toggle");
  const titleAttr = title || label ? ` title="${_esc(title || label)}"` : "";
  const disabledAttr = disabled ? " disabled" : "";
  return `<button type="button" class="${classes}" role="switch" aria-checked="${on ? "true" : "false"}" aria-label="${aria}"${titleAttr}${disabledAttr} data-lds-nav-switch ${attrs}></button>`;
}

/** Update an existing switch from `navSwitchHtml()`. */
export function paintNavSwitch(root, { on, disabled } = {}) {
  if (!root) return;
  const node = root.matches?.("[data-lds-nav-switch]")
    ? root
    : root.querySelector?.("[data-lds-nav-switch]");
  if (!node) return;
  if (on !== undefined) {
    node.classList.toggle("is-on", !!on);
    node.setAttribute("aria-checked", on ? "true" : "false");
  }
  if (disabled !== undefined) {
    node.classList.toggle("is-disabled", !!disabled);
    node.disabled = !!disabled;
  }
}
