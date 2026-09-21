// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const COMFORT_CONTROL_CSS = `
.lds-dial {
  display: grid;
  grid-template-columns: 260px var(--control-height, 44px);
  align-items: center;
  gap: 18px;
  width: max-content;
  margin: 0;
}
.lds-dial[aria-disabled="true"] { opacity: .55; pointer-events: none; }
.lds-dial-arc {
  position: relative;
  width: 248px;
  height: 290px;
}
.lds-dial-arc .lune-mark { display: block; width: 248px; height: 290px; }
.lds-dial-readout {
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  pointer-events: none;
  text-align: center;
}
.lds-dial-target {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -.04em;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
}
.lds-dial-unit { margin-left: 1px; font-size: 1.15rem; font-weight: 700; color: var(--text-strong); }
.lds-dial-current {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .04em;
  font-variant-numeric: tabular-nums;
}
.lds-dial-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.lds-dial-steps { display: grid; gap: 12px; }
.lds-dial-step {
  width: var(--control-height, 44px);
  height: var(--control-height, 44px);
  border: 1px solid var(--control-border);
  border-radius: 50%;
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}
.lds-dial-step:hover {
  border-color: rgba(var(--forest-rgb), .5);
  color: var(--forest);
  background: var(--fill-forest);
}
.lds-dial-step:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }

.lds-override-banner,
.ui-override-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 18px;
  padding: 12px 14px;
  border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text-main);
}
.lds-override-banner[hidden],
.ui-override-banner[hidden] { display: none !important; }
.lds-override-main,
.ui-override-main {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  padding: 0;
}
.lds-override-main strong,
.ui-override-main strong,
.lds-override-main small,
.ui-override-main small { display: block; }
.lds-override-main strong,
.ui-override-main strong { color: var(--text-strong); font-size: .9rem; }
.lds-override-main small,
.ui-override-main small { margin-top: 2px; color: var(--text-muted); font-size: .78rem; }

.lds-slider-row,
.slider-row {
  display: grid;
  grid-template-columns: minmax(160px, 280px) auto;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
}
.lds-slider-row strong,
.slider-row strong {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
  color: var(--text-strong);
}
.lds-slider-row input[type=range],
.slider-row input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 16px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.lds-slider-row input[type=range]::-webkit-slider-runnable-track,
.slider-row input[type=range]::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background:
    linear-gradient(to right, transparent var(--slider-fill, 50%), color-mix(in srgb, var(--text-faint) 22%, transparent) var(--slider-fill, 50%)),
    linear-gradient(to right, var(--forest), var(--accent));
}
.lds-slider-row input[type=range]::-webkit-slider-thumb,
.slider-row input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -5px;
  border-radius: 50%;
  border: 2px solid var(--bg);
  background: var(--accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 45%, transparent);
  cursor: pointer;
}
.lds-slider-row input[type=range]::-moz-range-track,
.slider-row input[type=range]::-moz-range-track {
  height: 6px;
  border: 0;
  border-radius: 999px;
  background:
    linear-gradient(to right, transparent var(--slider-fill, 50%), color-mix(in srgb, var(--text-faint) 22%, transparent) var(--slider-fill, 50%)),
    linear-gradient(to right, var(--forest), var(--accent));
}
.lds-slider-row input[type=range]::-moz-range-thumb,
.slider-row input[type=range]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid var(--bg);
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 45%, transparent);
  cursor: pointer;
}
.lds-slider-row input[type=range]:focus-visible,
.slider-row input[type=range]:focus-visible { outline: none; }
.lds-slider-row input[type=range]:focus-visible::-webkit-slider-thumb,
.slider-row input[type=range]:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--focus-ring);
}
.lds-slider-row input[type=range]:focus-visible::-moz-range-thumb,
.slider-row input[type=range]:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px var(--focus-ring);
}
.lds-slider-row input[type=range]:disabled,
.slider-row input[type=range]:disabled {
  opacity: .55;
  cursor: default;
}
@media (max-width: 900px) {
  .lds-dial {
    grid-template-columns: minmax(0, 248px) var(--control-height, 44px);
    width: 100%;
  }
  .lds-dial-arc,
  .lds-dial-arc .lune-mark {
    width: min(248px, 100%);
    height: auto;
    max-height: 290px;
  }
  .lds-slider-row,
  .slider-row {
    grid-template-columns: minmax(0, 1fr) auto;
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

function _sliderFillPct(value, min, max) {
  const lo = Number(min);
  const hi = Number(max);
  const val = Number(value);
  const span = hi - lo;
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || !Number.isFinite(val) || span === 0) return 0;
  return Math.min(100, Math.max(0, ((val - lo) / span) * 100));
}

/**
 * Halo dial. Pass mark HTML from `luneMark()` (brand-js).
 *
 * @param {id?: string, markHtml?: string, target?: number, current?: number, min?: number, max?: number, step?: number, unit?: string, label?: string, disabled?: boolean} opts
 */
export function dial({
  id,
  markHtml = "",
  target,
  current,
  min = 5,
  max = 35,
  step = 0.5,
  unit = "C",
  label,
  disabled = false,
} = {}) {
  const dialId = id || "lds-dial";
  const aria = _esc(label || "Temperature target");
  const tVal = Number(target);
  const cVal = Number(current);
  const targetText = Number.isFinite(tVal) ? tVal.toFixed(1) : "—";
  const currentText = Number.isFinite(cVal) ? cVal.toFixed(1) : "—";
  const unitText = unit === "C" || unit === "°C" || unit === "°" ? "°" : _esc(unit);
  const disabledAttr = disabled ? ' aria-disabled="true"' : "";
  return `<div class="lds-dial" id="${_esc(dialId)}" role="group" aria-label="${aria}" data-dial-min="${min}" data-dial-max="${max}" data-dial-unit="${_esc(unitText)}"${disabledAttr}>
  <div class="lds-dial-arc">
    ${markHtml}
    <div class="lds-dial-readout">
      <div class="lds-dial-target"><span data-dial-target>${targetText}</span><span class="lds-dial-unit">${unitText}</span></div>
      <div class="lds-dial-current" data-dial-current>Current ${currentText}${unitText}</div>
    </div>
    <span class="lds-dial-live" data-dial-live aria-live="polite">${targetText}${unitText}</span>
  </div>
  <div class="lds-dial-steps">
    <button type="button" class="lds-dial-step" data-dial-step="${step}" aria-label="Increase" ${disabled ? "disabled" : ""}>+</button>
    <button type="button" class="lds-dial-step" data-dial-step="-${step}" aria-label="Decrease" ${disabled ? "disabled" : ""}>−</button>
  </div>
</div>`;
}

export function updateDial(root, { target, current, disabled, states, selected } = {}) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const unit = el.dataset.dialUnit || "°";
  const tVal = Number(target);
  const cVal = Number(current);
  const targetText = Number.isFinite(tVal) ? tVal.toFixed(1) : "—";
  const currentText = Number.isFinite(cVal) ? cVal.toFixed(1) : "—";
  const targetNode = el.querySelector("[data-dial-target]");
  const currentNode = el.querySelector("[data-dial-current]");
  const live = el.querySelector("[data-dial-live]");
  if (targetNode) targetNode.textContent = targetText;
  if (currentNode) currentNode.textContent = `Current ${currentText}${unit}`;
  if (live) live.textContent = `${targetText}${unit}`;
  if (states) {
    el.querySelectorAll(".pipe").forEach((line, i) => {
      const kind = states[i] || "idle";
      line.setAttribute("class", `pipe is-${kind}${i === selected ? " is-focus" : ""}`);
    });
  }
  if (disabled != null) {
    el.setAttribute("aria-disabled", disabled ? "true" : "false");
    el.querySelectorAll(".lds-dial-step").forEach((btn) => { btn.disabled = !!disabled; });
  }
}

/** Wire dial steppers. onStep(delta) or onChange(nextTarget). */
export function bindDial(root, handlers = {}) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return () => {};
  const onClick = (event) => {
    const btn = event.target.closest("button.lds-dial-step[data-dial-step]");
    if (!btn || !el.contains(btn) || btn.disabled) return;
    const delta = parseFloat(btn.getAttribute("data-dial-step"));
    if (!Number.isFinite(delta)) return;
    if (handlers.onStep) handlers.onStep(delta);
    else if (handlers.onChange) {
      const min = parseFloat(el.dataset.dialMin);
      const max = parseFloat(el.dataset.dialMax);
      const cur = parseFloat(el.querySelector("[data-dial-target]")?.textContent);
      const base = Number.isFinite(cur) ? cur : 20;
      const next = Math.min(max, Math.max(min, Math.round((base + delta) * 10) / 10));
      handlers.onChange(next);
    }
  };
  el.addEventListener("click", onClick);
  return () => el.removeEventListener("click", onClick);
}

/** Chip above the dial when a temporary Touch command is active. */
export function overrideBanner({ remaining = "", hint = "Temporary command from Lune Touch" } = {}) {
  const hidden = !String(remaining || "").trim();
  return `<div class="lds-override-banner ui-override-banner" data-override-banner ${hidden ? "hidden" : ""}>
  <div class="lds-override-main ui-override-main">
    <strong data-override-remaining>${_esc(remaining)}</strong>
    <small data-override-hint>${_esc(hint)}</small>
  </div>
</div>`;
}

export function updateOverrideBanner(root, { remaining = "", hint } = {}) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const banner = el.matches?.("[data-override-banner]") ? el : el.querySelector("[data-override-banner]");
  if (!banner) return;
  const label = banner.querySelector("[data-override-remaining]");
  const hintEl = banner.querySelector("[data-override-hint]");
  const text = String(remaining || "").trim();
  banner.hidden = !text;
  if (label) label.textContent = text;
  if (hintEl && hint !== undefined) hintEl.textContent = hint;
}

/**
 * Comfort setpoint slider. Track uses forest → amber gradient; fill mask via --slider-fill.
 *
 * @param {min?: number, max?: number, step?: number, value?: number, label?: string, disabled?: boolean} opts
 */
export function comfortSliderHtml({
  min = 5,
  max = 35,
  step = 0.5,
  value = 21,
  label = "Comfort setpoint",
  disabled = false,
} = {}) {
  const val = Number(value);
  const shown = Number.isFinite(val) ? val.toFixed(1) : "—";
  const fill = _sliderFillPct(val, min, max);
  const disabledAttr = disabled ? " disabled" : "";
  return `<div class="lds-slider-row slider-row" data-lds-slider-row>
  <input data-comfort-slider type="range" min="${min}" max="${max}" step="${step}" value="${Number.isFinite(val) ? val : min}" aria-label="${_esc(label)}" style="--slider-fill:${fill}%"${disabledAttr}>
  <strong data-slider-value>${shown}°</strong>
</div>`;
}

/** Keep --slider-fill in sync with the range input value. */
export function paintComfortSlider(input) {
  if (!input) return;
  const min = input.min;
  const max = input.max;
  const val = input.value;
  const pct = _sliderFillPct(val, min, max);
  input.style.setProperty("--slider-fill", `${pct}%`);
}
