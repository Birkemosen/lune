const SETTLE_MS = 650;
const WINDOW_MS = 500;
export const TRACE_MAX_SAMPLES = 2000;
export const TRACE_SAMPLE_PERIOD_MS = 2;

export const STROKE_PHASE = {
  FREE_TRAVEL: 0,
  CONTACT: 1,
  UNDER_LOAD: 2,
  STOPPING: 3,
};

export function strokePhaseKey(value) {
  switch (Number(value)) {
    case STROKE_PHASE.CONTACT: return 'contact';
    case STROKE_PHASE.UNDER_LOAD: return 'load';
    case STROKE_PHASE.STOPPING: return 'stopping';
    default: return 'free';
  }
}

export function pinContactSample(samples) {
  const rows = samples || [];
  for (let i = 0; i < rows.length; i++) {
    const phase = Number(rows[i].stroke_phase) || 0;
    if (phase === STROKE_PHASE.CONTACT || phase === STROKE_PHASE.UNDER_LOAD) return rows[i];
  }
  return null;
}

function optionalNum(cols, index, name) {
  if (index[name] == null) return null;
  const value = Number(cols[index[name]]);
  return Number.isFinite(value) ? value : null;
}

export function parseMotorTraceCsv(text) {
  const lines = String(text || '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((cell) => cell.trim());
  const index = {};
  for (let i = 0; i < header.length; i++) index[header[i]] = i;
  const samples = [];
  for (let row = 1; row < lines.length; row++) {
    const cols = lines[row].split(',');
    if (cols.length < 6) continue;
    const num = (name) => Number(cols[index[name]]);
    samples.push({
      t_ms: num('t_ms') || 0,
      motion_count: num('motion_count') || 0,
      current_ma: num('current_ma'),
      adc_current_raw: optionalNum(cols, index, 'adc_current_raw'),
      drive_on: num('drive_on') === 1,
      direction_open: num('direction_open') === 1,
      armed: num('armed') === 1,
      stroke_phase: num('stroke_phase') || 0,
      tacho_period_us: optionalNum(cols, index, 'tacho_period_us'),
      tacho_amp_raw: optionalNum(cols, index, 'tacho_amp_raw'),
      bemf_raw_a: optionalNum(cols, index, 'bemf_raw_a'),
      bemf_raw_b: optionalNum(cols, index, 'bemf_raw_b'),
      bemf_differential_raw: optionalNum(cols, index, 'bemf_differential_raw'),
      bemf_separation_us: optionalNum(cols, index, 'bemf_separation_us'),
      bemf_valid: index.bemf_valid != null ? num('bemf_valid') === 1 : null,
      bemf_moving: index.bemf_moving != null ? num('bemf_moving') === 1 : null,
      invalid_bemf_samples: optionalNum(cols, index, 'invalid_bemf_samples'),
    });
  }
  return samples;
}

function directionOf(samples) {
  let open = 0;
  let close = 0;
  for (let i = 0; i < samples.length; i++) {
    if (!samples[i].drive_on) continue;
    if (samples[i].direction_open) open += 1;
    else close += 1;
  }
  return open >= close ? 'open' : 'close';
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[i];
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cadenceHz(periodUs) {
  const period = Number(periodUs);
  if (!Number.isFinite(period) || period <= 0) return null;
  return 1e6 / period;
}

function windowSlopes(driven) {
  const slopes = [];
  if (!driven.length) return slopes;
  const t0 = driven[0].t_ms;
  const t1 = driven[driven.length - 1].t_ms;
  for (let start = t0; start + WINDOW_MS <= t1; start += WINDOW_MS) {
    const a = driven.reduce((best, sample) =>
      Math.abs(sample.t_ms - start) < Math.abs(best.t_ms - start) ? sample : best, driven[0]);
    const b = driven.reduce((best, sample) =>
      Math.abs(sample.t_ms - (start + WINDOW_MS)) < Math.abs(best.t_ms - (start + WINDOW_MS)) ? sample : best, driven[0]);
    const dt = (b.t_ms - a.t_ms) / 1000;
    if (dt > 0.2) slopes.push({ t_ms: start + WINDOW_MS, slope: (b.current_ma - a.current_ma) / dt });
  }
  return slopes;
}

/** Shared series for live polls and full-resolution traces. */
export function motorTraceSeries(samples) {
  const rows = samples || [];
  const cadence = [];
  for (let i = 0; i < rows.length; i++) {
    const sample = rows[i];
    const period = sample.tacho_period_us != null
      ? sample.tacho_period_us
      : (sample.tacho_cadence_us != null ? sample.tacho_cadence_us : null);
    cadence.push({
      t_ms: sample.t_ms,
      period_us: period,
      rate_hz: cadenceHz(period),
    });
  }
  const driven = rows.filter((sample) =>
    sample.drive_on && Number.isFinite(sample.current_ma));
  const slopeSource = driven.length >= 2 ? driven : rows.filter((sample) => Number.isFinite(sample.current_ma));
  const slopes = windowSlopes(slopeSource);
  return {
    cadence,
    slopes,
    count: rows.length,
    truncated: rows.length >= TRACE_MAX_SAMPLES,
    window_ms: TRACE_MAX_SAMPLES * TRACE_SAMPLE_PERIOD_MS,
  };
}

export function analyzeMotorTrace(samples, preferredDirection) {
  const direction = preferredDirection || directionOf(samples);
  const driven = samples.filter((sample) =>
    sample.drive_on && Number.isFinite(sample.current_ma) &&
    (direction === 'open' ? sample.direction_open : !sample.direction_open));
  if (driven.length < 8) {
    return { direction, ok: false, reason: 'too_few_samples' };
  }

  const startMs = driven[0].t_ms;
  const endMs = driven[driven.length - 1].t_ms;
  const settled = driven.filter((sample) => sample.t_ms >= startMs + SETTLE_MS);
  const body = settled.length > 12 ? settled : driven;
  const span = Math.max(1, endMs - (body[0] ? body[0].t_ms : startMs));
  const running = body.filter((sample) => sample.t_ms < (body[0].t_ms + span * 0.7));
  const stall = body.filter((sample) => sample.t_ms >= (body[0].t_ms + span * 0.8));
  const runningCurrents = (running.length ? running : body).map((sample) => sample.current_ma);
  const stallCurrents = (stall.length ? stall : body.slice(-Math.max(4, (body.length / 8) | 0))).map((sample) => sample.current_ma);
  const mean = runningCurrents.reduce((sum, value) => sum + value, 0) / runningCurrents.length;
  const peak = Math.max(...driven.map((sample) => sample.current_ma));
  const stallPeak = Math.max(...stallCurrents);
  const ripples = Math.max(0, driven[driven.length - 1].motion_count - driven[0].motion_count);
  const slopes = windowSlopes(body);
  const freeSlopes = slopes.filter((item) => item.t_ms < body[0].t_ms + span * 0.7).map((item) => item.slope);
  const stallSlopes = slopes.filter((item) => item.t_ms >= body[0].t_ms + span * 0.75).map((item) => item.slope);
  const maxStallSlope = stallSlopes.length ? Math.max(...stallSlopes) : 0;
  const travelSlope = percentile(freeSlopes.map(Math.abs), 0.9) || 0;
  const towardPeak = direction === 'close' ? 0.55 : 0.68;
  const ratio = mean > 0.5 ? stallPeak / mean : 0;
  const suggestedFactor = round1(clamp(1 + towardPeak * Math.max(0, ratio - 1), 1.25, 2.4));
  const suggestedSlope = round1(clamp(Math.max(travelSlope * 2.2, maxStallSlope * 0.42, 0.4), 0.4, 8));
  const suggestedSlopeFloor = round1(clamp(1 + 0.35 * Math.max(0, ratio - 1), 1.15, 1.8));
  const suggestedRippleLimit = direction === 'open' ? 1.15 : null;
  const pin = pinContactSample(driven);

  return {
    direction,
    ok: true,
    start_ms: startMs,
    end_ms: endMs,
    runtime_ms: endMs - startMs,
    mean_ma: round1(mean),
    peak_ma: round1(peak),
    stall_peak_ma: round1(stallPeak),
    ripples,
    max_stall_slope_ma_s: round1(maxStallSlope),
    travel_slope_ma_s: round1(travelSlope),
    measured_factor: round1(ratio),
    suggested_factor: suggestedFactor,
    suggested_slope: suggestedSlope,
    suggested_slope_floor: suggestedSlopeFloor,
    suggested_ripple_limit: suggestedRippleLimit,
    pin_seen: !!pin,
    pin_t_ms: pin ? pin.t_ms : null,
    pin_motion_count: pin ? pin.motion_count : null,
    pin_current_ma: pin ? round1(pin.current_ma) : null,
    samples: driven,
  };
}

export function overlayLevels(analysis, configured) {
  if (!analysis || !analysis.ok) return [];
  const mean = analysis.mean_ma;
  const factor = Number(configured && configured.factor) || analysis.suggested_factor;
  return [
    { id: 'mean', value: mean },
    { id: 'threshold', value: round1(mean * factor) },
    { id: 'suggested', value: round1(mean * analysis.suggested_factor) },
    { id: 'cap', value: 100 },
  ];
}
