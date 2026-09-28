// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const MANIFOLD_ROW_CSS = `
.lds-manifold,
.manifold {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) minmax(150px, 210px);
  gap: 12px 18px;
  align-items: center;
  margin: 0;
  padding: 16px 0;
  border-bottom: 1px solid var(--separator);
}
.lds-manifold.is-offline,
.manifold.is-offline {
  opacity: .72;
}
.lds-manifold-mark,
.manifold-mark {
  display: grid;
  place-items: center;
  width: 110px;
  height: 84px;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  overflow: visible;
}
.lds-manifold-mark .lune-mark,
.manifold-mark .lune-mark {
  width: var(--brand-manifold-w, 108px);
  height: var(--brand-manifold-h, 80px);
}
.lds-loops,
.loops {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}
.lds-loop,
.loop {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  min-width: 0;
  min-height: 0;
  padding: 8px 8px 8px 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  align-items: stretch;
  justify-items: stretch;
  cursor: pointer;
  font: inherit;
}
.lds-loop.has-demand,
.loop.has-demand {
  grid-template-columns: auto minmax(0, 1fr);
}
.lds-loop:hover,
.loop:hover {
  background: var(--inset);
}
.lds-loop.is-selected,
.loop.is-selected {
  background: var(--fill-forest);
}
.lds-loop.is-calling .lds-loop-id,
.lds-loop.is-calling .loop-id,
.loop.is-calling .lds-loop-id,
.loop.is-calling .loop-id {
  color: var(--accent);
}
.lds-loop.is-unused,
.loop.is-unused {
  opacity: .4;
}
.lds-loop-body,
.loop-body {
  display: grid;
  gap: 2px;
  min-width: 0;
  align-content: center;
  justify-items: start;
}
.lds-loop-id,
.loop-id {
  color: var(--text-faint);
  font-size: .78rem;
  font-weight: 750;
  letter-spacing: .06em;
}
.lds-loop-name,
.loop-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--text-muted, var(--muted));
  font-size: .8rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lds-loop-demand-bar,
.loop-demand-bar {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  width: 10px;
  align-self: stretch;
  min-height: 52px;
}
.lds-loop-demand-bar i,
.loop-demand-bar i {
  flex: 1 1 0;
  min-height: 5px;
  border-radius: 1px;
  background: color-mix(in srgb, var(--text-faint) 28%, transparent);
}
.lds-loop-demand-bar[data-level="1"] i:nth-child(-n+1),
.lds-loop-demand-bar[data-level="2"] i:nth-child(-n+2),
.lds-loop-demand-bar[data-level="3"] i:nth-child(-n+3),
.lds-loop-demand-bar[data-level="4"] i:nth-child(-n+4),
.lds-loop-demand-bar[data-level="5"] i:nth-child(-n+5),
.loop-demand-bar[data-level="1"] i:nth-child(-n+1),
.loop-demand-bar[data-level="2"] i:nth-child(-n+2),
.loop-demand-bar[data-level="3"] i:nth-child(-n+3),
.loop-demand-bar[data-level="4"] i:nth-child(-n+4),
.loop-demand-bar[data-level="5"] i:nth-child(-n+5) {
  background: var(--accent);
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 45%, transparent);
}
.lds-loop.is-unused .lds-loop-demand-bar i,
.lds-loop.is-unused .loop-demand-bar i,
.loop.is-unused .lds-loop-demand-bar i,
.loop.is-unused .loop-demand-bar i {
  background: color-mix(in srgb, var(--text-faint) 16%, transparent);
  box-shadow: none;
}
.lds-loop-temp,
.loop-temp {
  padding: 0;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--text-strong);
}
.lds-manifold-meta,
.manifold-meta {
  display: grid;
  gap: 4px;
  text-align: right;
}
.lds-manifold-meta strong,
.manifold-meta strong {
  color: var(--text-strong);
  font-size: .88rem;
}
.lds-manifold-meta small,
.manifold-meta small {
  color: var(--text-muted, var(--muted));
  font-size: .72rem;
}
.lds-manifold.is-offline .lds-manifold-meta small.status,
.manifold.is-offline .manifold-meta small.status {
  color: var(--danger);
}
@media (max-width: 900px) {
  .lds-manifold,
  .manifold {
    grid-template-columns: 1fr;
  }
  .lds-manifold-mark,
  .manifold-mark {
    margin: 0 auto;
  }
  .lds-loops,
  .loops {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .lds-manifold-meta,
  .manifold-meta {
    text-align: left;
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

/** Map valve % to a 1–5 demand bar level (0 when unused / closed). */
export function demandBarLevel(valvePct, kind = "idle") {
  if (kind === "unused") return 0;
  const pct = Number(valvePct);
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  return Math.min(5, Math.max(1, Math.ceil(pct / 20)));
}

export function demandBarHtml(level = 0) {
  const clamped = Math.min(5, Math.max(0, Number(level) || 0));
  return `<span class="lds-loop-demand-bar loop-demand-bar" data-level="${clamped}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`;
}

/**
 * One Z1–Z6 cell: full-height opening bar on the left, then id / name / temp.
 *
 * @param {id: string, name?: string, temp?: string, level?: number, kind?: string, selected?: boolean, attrs?: string, tag?: string, showDemand?: boolean, className?: string} opts
 */
export function loopCellHtml({
  id,
  name = "—",
  temp = "—",
  level = 0,
  kind = "idle",
  selected = false,
  attrs = "",
  tag = "button",
  showDemand = true,
  className = "",
} = {}) {
  const classes = [
    "lds-loop",
    "loop",
    showDemand ? "has-demand" : "",
    selected ? "is-selected" : "",
    kind === "calling" ? "is-calling" : "",
    kind === "unused" ? "is-unused" : "",
    className,
  ].filter(Boolean).join(" ");
  const typeAttr = tag === "button" ? ` type="button"` : "";
  const demand = showDemand ? demandBarHtml(level) : "";
  const body = `<span class="lds-loop-body loop-body"><span class="lds-loop-id loop-id">${_esc(id)}</span><span class="lds-loop-name loop-name">${_esc(name)}</span><span class="lds-loop-temp loop-temp">${_esc(temp)}</span></span>`;
  return `<${tag} class="${classes}"${typeAttr} ${attrs}>${demand}${body}</${tag}>`;
}

/**
 * Trailing identity column: title + one or more small lines.
 *
 * @param {title: string, lines?: string[], offline?: boolean} opts
 */
export function manifoldMetaHtml({ title = "", lines = [], offline = false } = {}) {
  const smalls = (lines || []).map((line, i) => {
    const status = offline && i === lines.length - 1 ? ` class="status"` : (i === lines.length - 1 ? ` class="status"` : "");
    return `<small${status}>${_esc(line)}</small>`;
  }).join("");
  return `<strong>${_esc(title)}</strong>${smalls}`;
}

/**
 * Full row shell. Pass mark HTML from `luneMark()` / brand-js.
 *
 * @param {markHtml?: string, loopsHtml?: string, metaHtml?: string, offline?: boolean, attrs?: string, markAttrs?: string, markTag?: string} opts
 */
export function manifoldRowHtml({
  markHtml = "",
  loopsHtml = "",
  metaHtml = "",
  offline = false,
  attrs = "",
  markAttrs = "",
  markTag = "div",
} = {}) {
  const off = offline ? " is-offline" : "";
  const markType = markTag === "button" ? ` type="button"` : "";
  return `<article class="lds-manifold manifold${off}" data-lds-manifold ${attrs}>
  <${markTag} class="lds-manifold-mark manifold-mark"${markType} ${markAttrs}>${markHtml}</${markTag}>
  <div class="lds-loops loops" data-lds-loops>${loopsHtml}</div>
  <div class="lds-manifold-meta manifold-meta" data-lds-manifold-meta>${metaHtml}</div>
</article>`;
}
