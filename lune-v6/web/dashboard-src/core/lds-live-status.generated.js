// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const LIVE_STATUS_CSS = `
.lds-live-status {
  margin-top: 12px;
  padding: 12px 10px 0;
  border-top: 1px solid var(--separator);
}
.lds-live-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.lds-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ok);
  font-size: .75rem;
  font-weight: 650;
}
.lds-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 10px var(--ok);
}
.lds-live.is-off {
  color: var(--text-muted);
}
.lds-live.is-off i {
  background: var(--state-disabled);
  box-shadow: none;
}
.lds-live-uptime {
  color: var(--text-muted);
  font-size: .72rem;
  font-weight: 600;
  font-family: var(--mono);
  white-space: nowrap;
}
.lds-live-ip {
  margin-top: 6px;
  color: var(--text-faint);
  font-size: .72rem;
  font-family: var(--mono);
}
.lds-live-uptime[hidden],
.lds-live-ip[hidden] {
  display: none !important;
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
 * Sidebar live footer: Live (with optional uptime) and optional IP beneath.
 * Place at the bottom of the wide-browser nav. Compact layouts hide it.
 *
 * @param {live?: boolean, label?: string, uptime?: string, ip?: string, showUptime?: boolean, showIp?: boolean} opts
 */
export function liveStatusHtml({
  live = false,
  label = "Offline",
  uptime = "---",
  ip = "---",
  showUptime = true,
  showIp = true,
} = {}) {
  const off = live ? "" : " is-off";
  const upHidden = showUptime ? "" : " hidden";
  const ipHidden = showIp ? "" : " hidden";
  return `<div class="lds-live-status" data-lds-live-status>
  <div class="lds-live-row">
    <span class="lds-live${off}" data-lds-live><i aria-hidden="true"></i><span data-lds-live-label>${_esc(label)}</span></span>
    <span class="lds-live-uptime" data-lds-uptime${upHidden}>${_esc(uptime)}</span>
  </div>
  <div class="lds-live-ip" data-lds-ip${ipHidden}>${_esc(ip)}</div>
</div>`;
}

/**
 * Update an existing live-status root from `liveStatusHtml()`.
 *
 * @param {ParentNode|null|undefined} root
 * @param {live?: boolean, label?: string, uptime?: string, ip?: string} state
 */
export function paintLiveStatus(root, { live, label, uptime, ip } = {}) {
  if (!root) return;
  const node = root.matches?.("[data-lds-live-status]")
    ? root
    : root.querySelector?.("[data-lds-live-status]");
  if (!node) return;
  const liveEl = node.querySelector("[data-lds-live]");
  const labelEl = node.querySelector("[data-lds-live-label]");
  const upEl = node.querySelector("[data-lds-uptime]");
  const ipEl = node.querySelector("[data-lds-ip]");
  if (liveEl && live !== undefined) liveEl.classList.toggle("is-off", !live);
  if (labelEl && label !== undefined && labelEl.textContent !== label) {
    labelEl.textContent = label;
  }
  if (upEl && uptime !== undefined && upEl.textContent !== uptime) {
    upEl.textContent = uptime;
  }
  if (ipEl && ip !== undefined && ipEl.textContent !== ip) {
    ipEl.textContent = ip;
  }
}
