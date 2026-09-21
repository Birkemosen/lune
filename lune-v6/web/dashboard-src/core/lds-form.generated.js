// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const FORM_CSS = `
.lds-provision,
.provision {
  padding-left: 24px;
  border-left: 1px solid var(--separator);
}
.lds-form,
.form {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 28rem;
}
.lds-form-head h3,
.form-head h3 {
  margin: 0;
  color: var(--text-faint);
  font-size: .68rem;
  font-weight: 750;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.lds-form-head h2,
.form-head h2 {
  margin: 4px 0 0;
  color: var(--text-strong);
  font-size: 1.05rem;
  font-weight: 650;
}
.lds-form-stack,
.form-stack {
  display: grid;
  gap: 14px;
}
.lds-form-pair,
.form-pair {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
.lds-form-pair.is-even,
.form-pair.is-even {
  grid-template-columns: 1fr 1fr;
}
.lds-form .lds-form-actions,
.form .form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--separator);
  margin-top: 0;
}
.lds-form .lds-form-extra,
.form .form-extra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.lds-field,
.field {
  display: grid;
  gap: 6px;
  color: var(--text-muted, var(--muted));
  font-size: .72rem;
  font-weight: 650;
}
.lds-field input,
.lds-field select,
.field input,
.field select,
.canvas-view .field .input {
  width: 100%;
  height: var(--control-compact, 32px);
  min-height: var(--control-compact, 32px);
  padding: 0 9px;
  border: 1px solid var(--control-border);
  border-radius: 8px;
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: .82rem;
  margin: 0;
  box-shadow: none;
}
.lds-field input:focus,
.lds-field select:focus,
.field input:focus,
.field select:focus {
  outline: 1px solid rgba(var(--accent-rgb), .45);
  border-color: rgba(var(--accent-rgb), .45);
}
.lds-btn-save,
.btn-save {
  min-height: var(--control-compact, 32px);
  padding: 0 12px;
  border: 1px solid var(--control-border);
  border-radius: 8px;
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: .8rem;
  font-weight: 650;
  cursor: pointer;
}
.lds-btn-save:hover,
.btn-save:hover {
  background: var(--inset, rgba(255, 236, 210, .035));
}
.lds-btn-danger,
.btn-danger {
  border: 0;
  background: transparent;
  color: var(--danger);
  font-size: .8rem;
  font-weight: 650;
  cursor: pointer;
}
@media (max-width: 900px) {
  .lds-provision,
  .provision {
    padding-left: 0;
    border-left: 0;
    padding-top: 18px;
    border-top: 1px solid var(--separator);
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

export function fieldHtml(label, control) {
  return `<label class="lds-field field">${_esc(label)}${control}</label>`;
}

export function formPairHtml(a, b, { even = false } = {}) {
  return `<div class="lds-form-pair form-pair${even ? " is-even" : ""}">${a}${b}</div>`;
}

/**
 * Provision form shell. `save` / `remove` are raw attribute strings for the
 * action buttons (e.g. `data-save-room="0"`).
 *
 * @param {title: string, stack: string, kicker?: string, save?: string, saveLabel?: string, extra?: string, remove?: string, removeLabel?: string} opts
 */
export function formShellHtml({
  title = "",
  stack = "",
  kicker = "Hardware provisioning",
  save = "",
  saveLabel = "Save configuration",
  extra = "",
  remove = "",
  removeLabel = "Remove",
} = {}) {
  const saveBtn = save
    ? `<button type="button" class="lds-btn-save btn-save" ${save}>${_esc(saveLabel)}</button>`
    : "";
  const removeBtn = remove
    ? `<button type="button" class="lds-btn-danger btn-danger" ${remove}>${_esc(removeLabel)}</button>`
    : "";
  const extraBlock = extra || removeBtn
    ? `<div class="lds-form-extra form-extra">${extra}${removeBtn}</div>`
    : "";
  return `<aside class="lds-provision provision" data-lds-provision>
  <div class="lds-form form" data-lds-form>
    <div class="lds-form-head form-head">
      <h3>${_esc(kicker)}</h3>
      <h2>${title}</h2>
    </div>
    <div class="lds-form-stack form-stack">${stack}</div>
    <div class="lds-form-actions form-actions">
      ${saveBtn}
      ${extraBlock}
    </div>
  </div>
</aside>`;
}
