#!/usr/bin/env node
/**
 * Unit tests for the damped linear Fremskrivning algorithm.
 * Run: node lune-v6/web/binder-src/projection.test.js
 */
import {
  projectTemperature,
  contiguousTail,
  bandHalfWidth,
  PROJ_HORIZON,
  PROJ_CLIP_ABOVE,
  PROJ_CLIP_BELOW,
} from './projection.js';

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL:', msg);
  } else {
    console.log('ok:', msg);
  }
}
function approx(a, b, tol, msg) {
  assert(Math.abs(a - b) <= tol, `${msg} (got ${a}, want ≈ ${b} ± ${tol})`);
}

// --- < 6 valid points: no projection ---
{
  const r = projectTemperature({
    temp: [20, 20.1, 20.2, 20.3, 20.4], // 5 points
    fallbackSp: 21,
    enabled: true,
  });
  assert(r === null, '< 6 points → null');
}

{
  // Contiguous valid run from the end is only 4 points (hole at index 3).
  const r = projectTemperature({
    temp: [20, 20.1, 20.2, null, 20.4, 20.5, 20.6, 20.7],
    fallbackSp: 21,
  });
  assert(r === null, 'hole in last 8 → null when contiguous tail < 6');
}

{
  assert(contiguousTail([1, 2, 3, 4, 5], 8, 6) === null, 'contiguousTail rejects short series');
  assert(contiguousTail([1, 2, 3, 4, 5, 6], 8, 6).length === 6, 'contiguousTail accepts 6');
}

// --- zone off ---
{
  const rising = [];
  for (let i = 0; i < 8; i++) rising.push(20 + i * 0.15);
  assert(
    projectTemperature({ temp: rising, fallbackSp: 22, enabled: false }) === null,
    'zone off → null',
  );
}

// --- Rising: flattens under mål + 1.5 ---
{
  // Strong positive slope toward a lower clip ceiling.
  const temp = [];
  for (let i = 0; i < 8; i++) temp.push(20.0 + i * 0.4); // ends ~22.8, b ≈ 0.4
  const sp = 22.0;
  const r = projectTemperature({
    temp,
    spPlan: Array(PROJ_HORIZON).fill(sp),
    fallbackSp: sp,
  });
  assert(r !== null, 'rising: has projection');
  assert(r.mid.length === PROJ_HORIZON, 'rising: 12 steps');
  const ceiling = sp + PROJ_CLIP_ABOVE; // 23.5
  assert(r.mid.every((t) => t <= ceiling + 1e-9), 'rising: clipped to mål + 1.5');
  // Damping + clip → later points approach ceiling from below / sit on it
  assert(r.mid[PROJ_HORIZON - 1] <= ceiling + 1e-9, 'rising: final ≤ mål + 1.5');
  assert(r.mid[PROJ_HORIZON - 1] >= r.mid[0] - 0.05, 'rising: does not fall overall');
  // Should actually hit or get very close to the ceiling given strong slope
  assert(
    r.mid[PROJ_HORIZON - 1] > sp,
    'rising: ends above the plan (overshoot capped)',
  );
  approx(r.mid[PROJ_HORIZON - 1], ceiling, 0.15, 'rising: flattens near mål + 1.5');
}

// --- Falling: clipped at mål − 3 ---
{
  const temp = [];
  for (let i = 0; i < 8; i++) temp.push(22.0 - i * 0.35); // ends ~19.55, b ≈ −0.35
  const sp = 21.0;
  const r = projectTemperature({
    temp,
    spPlan: Array(PROJ_HORIZON).fill(sp),
    fallbackSp: sp,
  });
  assert(r !== null, 'falling: has projection');
  const floor = sp - PROJ_CLIP_BELOW; // 18.0
  assert(r.mid.every((t) => t >= floor - 1e-9), 'falling: clipped to mål − 3');
  approx(r.mid[PROJ_HORIZON - 1], floor, 0.15, 'falling: sits on mål − 3');
}

// --- Flat: band ≈ ±0.1 °C ---
{
  const temp = Array(8).fill(21.0);
  const r = projectTemperature({
    temp,
    spPlan: Array(PROJ_HORIZON).fill(21.0),
    fallbackSp: 21.0,
  });
  assert(r !== null, 'flat: has projection');
  approx(r.b, 0, 1e-9, 'flat: slope ≈ 0');
  approx(r.sigma, 0, 1e-9, 'flat: σ ≈ 0');
  // At k=1: max(σ,0.05)*√1 + 0.05 = 0.10
  approx(bandHalfWidth(0, 1), 0.1, 1e-9, 'flat: band half-width at k=1 is 0.10');
  approx(r.hi[0] - r.mid[0], 0.1, 1e-9, 'flat: +band ≈ 0.1 at k=1');
  approx(r.mid[0] - r.lo[0], 0.1, 1e-9, 'flat: −band ≈ 0.1 at k=1');
  // Entire mid stays at T_nu
  assert(r.mid.every((t) => Math.abs(t - 21.0) < 1e-9), 'flat: mid stays at T_nu');
}

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log('\nAll projection tests passed.');
