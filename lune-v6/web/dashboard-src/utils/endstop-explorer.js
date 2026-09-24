// =============================================================================
// endstop-explorer — replay a motor trace through the endstop trip paths.
// =============================================================================
// Pure (no DOM). Mirrors, tick for tick, what detect_endstop_() and the DMA cap
// ladder would do with the configured thresholds, so the Motor Lab can show
// what each threshold means in mA and when it would stop the motor.
//
// It is an approximation and says so: the firmware runs its current paths on a
// ~200 ms EMA and the caps on 6.4 ms raw frames, while a trace is already an
// averaged series. It is exact about the logic, not about the noise.
//
// Firmware sources mirrored here (keep in step):
//   lv6_valve_controller.cpp  process_tick_() running-minimum baseline,
//                             detect_endstop_() threshold + trailing step
//   safety_limits.h           TrailingStepDetector, evaluate_cap_ladder(),
//                             current_trip_ma()
//   lv6_valve_controller.h    BASELINE_* / ENDSTOP_HIGH_TICKS / OPEN_ARM_FALLBACK_MS
// =============================================================================

export const TICK_MS = 10;
const BLANKING_MS = 250;              // Rev32TachoQualifier::BLANKING_MS
const DETECT_START_MS = 650;          // motion_decision_ms_(): 250 + 2 x 200
const BASELINE_SEARCH_START_MS = 400;
const BASELINE_STABLE_MS = 300;
const BASELINE_EPSILON_MA = 0.5;
const BASELINE_FLOOR_MA = 8;
const BASELINE_CEILING_MA = 32;
const ENDSTOP_HIGH_MS = 6 * TICK_MS;  // ENDSTOP_HIGH_TICKS
const OPEN_ARM_FALLBACK_MS = 8000;
const FRAME_MS = 6.4;                 // REV32_DMA_FRAME_BYTES at 10 kHz/channel
const TRAILING_HISTORY = 48;          // TrailingStepDetector::HISTORY

// The close stroke's mechanical boundary: 40 s / 3120 counts puts the plunger
// at the housing exit (design contract actuator_overrun_hazard).
export const CLOSE_WALL = { ms: 40000, counts: 3120 };
// Firmware defaults for the count ceilings; the WebUI does not expose them.
const CLOSE_CEILING_COUNTS = 2600;
const OPEN_CEILING_COUNTS = 3600;

export const DEFAULT_PARAMS = Object.freeze({
  closeFactor: 1.45,
  openFactor: 1.25,
  stallFraction: 0.30,
  learnedStallMa: null,
  trailingStepMa: 2.5,
  trailingSustainMs: 1000,
  trailingWindowMs: 2000,
  seatMa: 34, seatFrames: 4,
  popoffMa: 36, popoffFrames: 2,
  stallMa: 65, stallFrames: 3,
  openStopMa: 40, openFrames: 3,
  circuitMa: 85, circuitFrames: 2,
  closeCeilingS: 34,
  openCeilingS: 45,
});

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

/** Interpolate the trace onto the FSM's 10 ms tick. */
export function resampleToTicks(samples) {
  const rows = (samples || []).filter((s) => s && Number.isFinite(s.t_ms) && Number.isFinite(s.current_ma));
  if (rows.length < 2) return [];
  const ticks = [];
  let i = 0;
  const t0 = Math.ceil(rows[0].t_ms / TICK_MS) * TICK_MS;
  for (let t = t0; t <= rows[rows.length - 1].t_ms; t += TICK_MS) {
    while (i + 1 < rows.length && rows[i + 1].t_ms <= t) i += 1;
    const a = rows[i];
    const b = rows[Math.min(i + 1, rows.length - 1)];
    const span = b.t_ms - a.t_ms;
    const f = span > 0 ? (t - a.t_ms) / span : 0;
    ticks.push({
      t_ms: t,
      current_ma: a.current_ma + (b.current_ma - a.current_ma) * f,
      motion_count: (Number(a.motion_count) || 0) + ((Number(b.motion_count) || 0) - (Number(a.motion_count) || 0)) * f,
      stroke_phase: Number(a.stroke_phase) || 0,
    });
  }
  return ticks;
}

/** Port of safety_limits.h TrailingStepDetector (decimated history). */
function trailingStep(cfg) {
  const storeEvery = Math.max(1, Math.floor(cfg.window / (TRAILING_HISTORY / 2)));
  const hist = [];
  let lastMs = 0;
  let lastStore = 0;
  let run = 0;
  let tripped = false;
  return {
    observe(now, v) {
      let ref = null;
      for (let k = hist.length - 1; k >= 0; k -= 1) {
        if (now - hist[k].t >= cfg.window) { ref = hist[k].v; break; }
      }
      const dt = lastMs === 0 ? 0 : now - lastMs;
      lastMs = now;
      const rise = ref == null ? null : v - ref;
      if (rise != null && rise > cfg.step) {
        run += dt;
        if (run >= cfg.sustain) tripped = true;
      } else {
        run = 0;
      }
      if (!hist.length || now - lastStore >= storeEvery) {
        lastStore = now;
        hist.push({ t: now, v });
        if (hist.length > TRAILING_HISTORY) hist.shift();
      }
      return { rise, qualifying: rise != null && rise > cfg.step, tripped };
    },
  };
}

/** Sustained-condition debounce in milliseconds, fed once per tick. */
function sustained(needMs) {
  let run = 0;
  return (hit) => {
    run = hit ? run + TICK_MS : 0;
    return hit && run >= needMs;
  };
}

/**
 * Replay `samples` for one direction.
 *
 * Returns per-tick series for the chart plus, for every trip path, the first
 * tick it would stop the motor (null = not on this trace).
 */
export function explainEndstop(samples, direction, params) {
  const p = Object.assign({}, DEFAULT_PARAMS, params || {});
  const opening = direction === 'open';
  const ticks = resampleToTicks(samples);
  const phaseKnown = ticks.some((tk) => tk.stroke_phase === 0);

  let baseline = null;
  let lastDrop = 0;
  const trailing = trailingStep({ window: p.trailingWindowMs, step: p.trailingStepMa, sustain: p.trailingSustainMs });
  const deb = {
    threshold: sustained(ENDSTOP_HIGH_MS),
    seat: sustained(p.seatFrames * FRAME_MS),
    popoff: sustained(p.popoffFrames * FRAME_MS),
    stall: sustained(p.stallFrames * FRAME_MS),
    open: sustained(p.openFrames * FRAME_MS),
    circuit: sustained(p.circuitFrames * FRAME_MS),
  };
  const useFraction = opening && Number.isFinite(p.learnedStallMa);

  const series = [];
  const trips = {};
  const mark = (id, tk) => {
    if (trips[id] == null) trips[id] = { t_ms: tk.t_ms, motion_count: Math.round(tk.motion_count), current_ma: tk.current_ma };
  };

  for (const tk of ticks) {
    const t = tk.t_ms;
    const c = tk.current_ma;
    const inFree = phaseKnown ? tk.stroke_phase === 0 : true;

    if (t >= BASELINE_SEARCH_START_MS && inFree && (baseline == null || c < baseline - BASELINE_EPSILON_MA)) {
      baseline = clamp(c, BASELINE_FLOOR_MA, BASELINE_CEILING_MA);
      lastDrop = t;
    }
    const settled = baseline != null && t - lastDrop >= BASELINE_STABLE_MS;

    let threshold = null;
    if (settled) {
      if (useFraction && p.learnedStallMa > baseline + 5) {
        threshold = clamp(baseline + p.stallFraction * (p.learnedStallMa - baseline), p.openStopMa * 0.75, p.stallMa);
      } else {
        threshold = baseline * (opening ? p.openFactor : p.closeFactor);
      }
    }

    const detecting = t >= DETECT_START_MS;
    const pastBlanking = t >= BLANKING_MS;
    const step = !opening && detecting ? trailing.observe(t, c) : { rise: null, qualifying: false, tripped: false };

    if (detecting && deb.threshold(threshold != null && c > threshold)) mark('threshold', tk);
    if (step.tripped) mark('trailing', tk);
    if (pastBlanking) {
      if (deb.stall(c > p.stallMa)) mark('stall', tk);
      if (deb.circuit(c > p.circuitMa)) mark('circuit', tk);
      if (!opening) {
        if (deb.popoff(c > p.popoffMa)) mark('popoff', tk);
        if (deb.seat(tk.stroke_phase >= 2 && c > p.seatMa)) mark('seat', tk);
      } else {
        const armed = settled || t >= OPEN_ARM_FALLBACK_MS;
        if (deb.open(armed && c > p.openStopMa)) mark('openStop', tk);
      }
    }

    const ceilingCounts = opening ? OPEN_CEILING_COUNTS : CLOSE_CEILING_COUNTS;
    const ceilingMs = (opening ? p.openCeilingS : p.closeCeilingS) * 1000;
    if (t >= ceilingMs || tk.motion_count >= ceilingCounts) mark('ceiling', tk);
    if (!opening && (t >= CLOSE_WALL.ms || tk.motion_count >= CLOSE_WALL.counts)) mark('wall', tk);

    series.push({ t_ms: t, current_ma: c, motion_count: tk.motion_count, baseline_ma: baseline, threshold_ma: threshold, rise_ma: step.rise, qualifying: step.qualifying });
  }

  // Which path takes the drive off first. The ceiling is a cut-off, not an
  // endpoint, so it only counts when nothing detected the stop before it.
  const stopIds = opening
    ? ['threshold', 'openStop', 'stall', 'circuit']
    : ['trailing', 'threshold', 'seat', 'popoff', 'stall', 'circuit'];
  let first = null;
  for (const id of stopIds) {
    if (trips[id] && (!first || trips[id].t_ms < trips[first].t_ms)) first = id;
  }
  const ceilingFirst = trips.ceiling && (!first || trips.ceiling.t_ms <= trips[first].t_ms);

  return {
    direction: opening ? 'open' : 'close',
    params: p,
    series,
    trips,
    first: ceilingFirst ? 'ceiling' : first,
    beforeWall: opening || !trips.wall || (first != null && trips[first].t_ms < trips.wall.t_ms) || !!ceilingFirst,
    usesFraction: useFraction,
    baselineMa: baseline,
  };
}

/** The threshold each path compares against, in mA, at the end of the trace. */
export function thresholdLevels(result) {
  const p = result.params;
  const last = [...result.series].reverse().find((row) => row.threshold_ma != null);
  const levels = [];
  if (result.baselineMa != null) levels.push({ id: 'baseline', ma: result.baselineMa });
  if (last) levels.push({ id: 'threshold', ma: last.threshold_ma });
  if (result.direction === 'close') {
    levels.push({ id: 'seat', ma: p.seatMa }, { id: 'popoff', ma: p.popoffMa });
  } else {
    levels.push({ id: 'openStop', ma: p.openStopMa });
  }
  levels.push({ id: 'stall', ma: p.stallMa }, { id: 'circuit', ma: p.circuitMa });
  return levels;
}
