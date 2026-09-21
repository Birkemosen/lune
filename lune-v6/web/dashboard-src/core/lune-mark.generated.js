// Generated from LDS tokens.json by generate_tokens.py. Do not edit.
export const brand = {
  cx: 200,
  cy: 175,
  haloR: 72,
  cutR: 72,
  discR: 56,
  stroke: 6.5,
  pipeXs: [138, 162.8, 187.6, 212.4, 237.2, 262],
  pipeFrom: 175,
  pipeTo: 278,
  lockupScale: 0.8,
  lockupCutR: 58,
  lockupDiscR: 50,
  luneSize: 24,
  luneTracking: 2.8,
  luneY: 183,
  v6Size: 40,
  v6Tracking: 0.4,
  v6Y: 188,
  viewBoxPortrait: '110 90 180 210',
  viewBoxLandscape: '118 100 202 150',
  viewBoxLockup: '142 118 154 114',
  lockupWidth: 80,
  lockupHeight: 59,
  manifoldWidth: 108,
  manifoldHeight: 80,
  thermal: { supply: '#FCD34D', heat: '#F59E0B', ret: '#10B981', heatStop: 28 },
  pipe: { calling: '#F59E0B', idle: '#10B981', unused: 'rgba(232,214,188,.20)' },
  metallic: { top: '#1c1915', bottom: '#0c0b09', rim: '#25221E', word: '#FAF6EF' },
};

let _markSeq = 0;

function _turn(scale) {
  const { cx, cy } = brand;
  const bits = [`translate(${cx} ${cy})`, "rotate(-90)"];
  if (scale && scale !== 1) bits.push(`scale(${scale})`);
  bits.push(`translate(${-cx} ${-cy})`);
  return bits.join(" ");
}

function _defs(prefix, landscape = false) {
  const t = brand.thermal;
  const m = brand.metallic;
  const g = landscape
    ? `x1="${brand.cx}" y1="${brand.cy + brand.haloR}" x2="${brand.cx}" y2="${brand.cy - brand.haloR}"`
    : `x1="120" y1="175" x2="280" y2="175"`;
  return `<defs>
    <filter id="${prefix}-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="${prefix}-thermal" gradientUnits="userSpaceOnUse" ${g}>
      <stop offset="0%" stop-color="${t.supply}"/>
      <stop offset="${t.heatStop}%" stop-color="${t.heat}"/>
      <stop offset="100%" stop-color="${t.ret}"/>
    </linearGradient>
    <linearGradient id="${prefix}-metallic" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${m.top}"/>
      <stop offset="100%" stop-color="${m.bottom}"/>
    </linearGradient>
  </defs>`;
}

/** Live 6-pipe mark. `states[i]` is "calling" | "idle" | "unused". */
export function luneMark({
  states = [],
  selected = -1,
  sku = "",
  landscape = false,
  lockup = false,
  prefix = "",
} = {}) {
  const id = prefix || `lm${++_markSeq}`;
  const scale = lockup ? brand.lockupScale : null;
  const cutR = lockup ? brand.lockupCutR : brand.cutR;
  const discR = lockup ? brand.lockupDiscR : brand.discR;
  const turn = landscape || lockup ? ` transform="${_turn(scale)}"` : "";
  const viewBox = lockup
    ? brand.viewBoxLockup
    : landscape
      ? brand.viewBoxLandscape
      : brand.viewBoxPortrait;
  const pipes = brand.pipeXs.map((x, i) => {
    const kind = states[i] || "idle";
    const focus = i === selected ? " is-focus" : "";
    return `<line class="pipe is-${kind}${focus}" x1="${x}" y1="${brand.pipeFrom}" x2="${x}" y2="${brand.pipeTo}"/>`;
  }).join("");
  let word = "";
  if (sku) {
    const isV6 = sku.toUpperCase() === "V6";
    const size = isV6 ? brand.v6Size : brand.luneSize;
    const tracking = isV6 ? brand.v6Tracking : brand.luneTracking;
    const y = isV6 ? brand.v6Y : brand.luneY;
    word = `<text class="sku" x="${brand.cx}" y="${y}" text-anchor="middle" fill="${brand.metallic.word}" font-size="${size}" font-weight="700" letter-spacing="${tracking}" font-family="system-ui,-apple-system,sans-serif">${sku}</text>`;
  }
  return `<svg class="lune-mark${landscape || lockup ? " is-landscape" : ""}" viewBox="${viewBox}" fill="none" aria-hidden="true">
    ${_defs(id, landscape || lockup)}
    <g class="pipes"${turn} stroke="url(#${id}-thermal)" stroke-width="${brand.stroke}" stroke-linecap="round" fill="none">${pipes}</g>
    <circle class="disc-cut" cx="${brand.cx}" cy="${brand.cy}" r="${cutR}"></circle>
    <path class="halo-arc"${turn} d="M${brand.cx - brand.haloR} ${brand.cy}A${brand.haloR} ${brand.haloR} 0 0 1 ${brand.cx + brand.haloR} ${brand.cy}" fill="none" stroke="url(#${id}-thermal)" stroke-width="${brand.stroke}" stroke-linecap="round" filter="url(#${id}-glow)"></path>
    <circle class="disc" cx="${brand.cx}" cy="${brand.cy}" r="${discR}"></circle>
    ${word}
  </svg>`;
}

export function luneTouchLockup() {
  return luneMark({ sku: "LUNE", lockup: true, prefix: "lt-lockup" });
}

export function luneV6Mark() {
  return luneMark({ sku: "V6", landscape: true, prefix: "v6-mark" });
}
