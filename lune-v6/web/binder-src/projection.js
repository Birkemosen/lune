/**
 * Damped linear room-temperature projection (LDS DESIGN.md §5.9).
 *
 * Pure functions — shared contract for the V6 binder and Touch (C port).
 * Half-hour steps. φ = 0.85 damping per step.
 */

export const PROJ_PHI = 0.85;
export const PROJ_LOOKBACK = 8;   // half-hours (~4 h)
export const PROJ_MIN_POINTS = 6;
export const PROJ_HORIZON = 12;   // half-hours (~6 h)
export const PROJ_CLIP_BELOW = 3.0;
export const PROJ_CLIP_ABOVE = 1.5;
export const PROJ_SIGMA_FLOOR = 0.05;
export const PROJ_BAND_FLOOR = 0.05;

/**
 * Contiguous valid tail of `series` (finite numbers), length ≥ minLen.
 * Returns null if fewer than minLen contiguous valid points at the end.
 * @param {(number|null|undefined)[]} series
 * @param {number} maxLen
 * @param {number} minLen
 * @returns {number[]|null}
 */
export function contiguousTail(series, maxLen = PROJ_LOOKBACK, minLen = PROJ_MIN_POINTS) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const out = [];
  for (let i = series.length - 1; i >= 0 && out.length < maxLen; i--) {
    const v = series[i];
    if (v == null || !Number.isFinite(Number(v))) {
      if (out.length) break; // hole ends the contiguous run
      continue; // trailing nulls before first valid are skipped
    }
    out.push(Number(v));
  }
  out.reverse();
  return out.length >= minLen ? out : null;
}

/**
 * Ordinary least squares slope (°C per half-hour) and residual σ.
 * x = 0..n-1 relative to the window.
 * @param {number[]} ys
 * @returns {{ b: number, sigma: number, tNow: number }}
 */
export function olsSlopeSigma(ys) {
  const n = ys.length;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += i;
    sy += ys[i];
    sxx += i * i;
    sxy += i * ys[i];
  }
  const denom = n * sxx - sx * sx;
  const b = denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
  const a = (sy - b * sx) / n;
  let ss = 0;
  for (let i = 0; i < n; i++) {
    const r = ys[i] - (a + b * i);
    ss += r * r;
  }
  const sigma = n > 2 ? Math.sqrt(ss / (n - 2)) : Math.sqrt(ss / Math.max(n, 1));
  return { b, sigma, tNow: ys[n - 1] };
}

/**
 * Geometric partial sum φ + φ² + … + φ^k.
 * @param {number} phi
 * @param {number} k
 */
export function dampedSum(phi, k) {
  if (k <= 0) return 0;
  if (phi === 1) return k;
  return phi * (1 - Math.pow(phi, k)) / (1 - phi);
}

/**
 * Uncertainty half-width at step k.
 * @param {number} sigma
 * @param {number} k
 */
export function bandHalfWidth(sigma, k) {
  const s = Math.max(sigma, PROJ_SIGMA_FLOOR);
  return s * Math.sqrt(k) + PROJ_BAND_FLOOR;
}

/**
 * Compute a 6-hour (12× half-hour) damped projection.
 *
 * @param {object} opts
 * @param {(number|null|undefined)[]} opts.temp  Past half-hour temperatures (oldest→newest).
 * @param {(number|null|undefined)[]} [opts.spPlan] Planned targets for k=1…12 (mål_plan).
 *        Missing entries fall back to the last known past setpoint / `fallbackSp`.
 * @param {number} [opts.fallbackSp] Flat plan when spPlan is short/missing.
 * @param {boolean} [opts.enabled=true] No projection when the zone is off.
 * @returns {null|{
 *   mid: number[], lo: number[], hi: number[],
 *   b: number, sigma: number, tNow: number
 * }}
 */
export function projectTemperature(opts) {
  const enabled = opts.enabled !== false;
  if (!enabled) return null;

  const window = contiguousTail(opts.temp, PROJ_LOOKBACK, PROJ_MIN_POINTS);
  if (!window) return null;

  const { b, sigma, tNow } = olsSlopeSigma(window);
  const plan = Array.isArray(opts.spPlan) ? opts.spPlan : [];
  const fallback = Number.isFinite(Number(opts.fallbackSp))
    ? Number(opts.fallbackSp)
    : tNow;

  const mid = [];
  const lo = [];
  const hi = [];
  for (let k = 1; k <= PROJ_HORIZON; k++) {
    let tk = tNow + b * dampedSum(PROJ_PHI, k);
    const sp = Number.isFinite(Number(plan[k - 1])) ? Number(plan[k - 1]) : fallback;
    const loClip = sp - PROJ_CLIP_BELOW;
    const hiClip = sp + PROJ_CLIP_ABOVE;
    if (tk < loClip) tk = loClip;
    if (tk > hiClip) tk = hiClip;
    const w = bandHalfWidth(sigma, k);
    mid.push(tk);
    lo.push(tk - w);
    hi.push(tk + w);
  }
  return { mid, lo, hi, b, sigma, tNow };
}
