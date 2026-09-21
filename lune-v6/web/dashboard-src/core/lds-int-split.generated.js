// Generated from LDS tokens.json by generate_tokens.py. Do not edit.

export const INT_SPLIT_CSS = `
.lds-int-split,
.int-split {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 22rem);
  gap: 32px;
  padding-top: 22px;
  align-items: start;
}
@media (max-width: 900px) {
  .lds-int-split,
  .int-split {
    grid-template-columns: 1fr;
  }
}
`;

/**
 * Live | provision canvas split.
 *
 * @param {liveHtml?: string, provisionHtml?: string, attrs?: string} opts
 */
export function intSplitHtml({ liveHtml = "", provisionHtml = "", attrs = "" } = {}) {
  return `<div class="lds-int-split int-split" data-lds-int-split ${attrs}>${liveHtml}${provisionHtml}</div>`;
}
