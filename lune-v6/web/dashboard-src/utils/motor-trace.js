const SETTLE_MS = 650;
const WINDOW_MS = 500;
export const TRACE_MAX_SAMPLES = 2000;
export const TRACE_SAMPLE_PERIOD_MS = 2;
/** Browser-side capture window when merging successive device ring dumps. */
export const BROWSER_TRACE_MAX_MS = 60000;
/** Mean-bucket rate kept in the browser (avoids multi-MB high-rate dumps). */
export const BROWSER_TRACE_HZ = 2;
/** How often Motor Lab pulls the device ring while the motor is moving. */
export const TRACE_PULL_MS = 5000;

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
    });
  }
  return samples;
}

function meanFinite(values) {
  const nums = values.filter((v) => Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function majorityBool(values) {
  let yes = 0;
  let no = 0;
  for (const value of values) {
    if (value === true) yes += 1;
    else if (value === false) no += 1;
  }
  if (!yes && !no) return null;
  return yes >= no;
}

/** Bucket high-rate samples into mean rows at ~hz (default 2/s). */
export function downsampleMotorTraceMean(samples, hz = BROWSER_TRACE_HZ) {
  const rows = (samples || []).filter((sample) => sample && Number.isFinite(sample.t_ms))
    .slice()
    .sort((a, b) => a.t_ms - b.t_ms);
  if (!rows.length) return [];
  const bucketMs = Math.max(1, Math.round(1000 / Math.max(0.1, hz)));
  const out = [];
  let i = 0;
  while (i < rows.length) {
    const bucketStart = Math.floor(rows[i].t_ms / bucketMs) * bucketMs;
    const bucketEnd = bucketStart + bucketMs;
    let j = i;
    while (j < rows.length && rows[j].t_ms < bucketEnd) j += 1;
    const bucket = rows.slice(i, j);
    const last = bucket[bucket.length - 1];
    out.push({
      t_ms: bucketStart + Math.floor(bucketMs / 2),
      motion_count: Math.max(...bucket.map((s) => Number(s.motion_count) || 0)),
      current_ma: meanFinite(bucket.map((s) => s.current_ma)),
      adc_current_raw: meanFinite(bucket.map((s) => s.adc_current_raw)),
      drive_on: majorityBool(bucket.map((s) => !!s.drive_on)) === true,
      direction_open: majorityBool(bucket.map((s) => !!s.direction_open)) === true,
      armed: majorityBool(bucket.map((s) => !!s.armed)) === true,
      stroke_phase: Math.max(...bucket.map((s) => Number(s.stroke_phase) || 0)),
      tacho_period_us: meanFinite(bucket.map((s) => s.tacho_period_us)),
      tacho_amp_raw: meanFinite(bucket.map((s) => s.tacho_amp_raw)),

      _bucket_n: bucket.length,
    });
    i = j;
  }
  return out;
}

/**
 * Merge successive device-ring dumps, mean-bucket to ~hz, keep last maxMs.
 * Keeps browser memory small (~80 rows for 40 s at 2 Hz) instead of multi-MB CSV.
 */
export function mergeMotorTraceSamples(
  existing, incoming, maxMs = BROWSER_TRACE_MAX_MS, hz = BROWSER_TRACE_HZ) {
  const byTime = new Map();
  for (const sample of existing || []) {
    if (sample && Number.isFinite(sample.t_ms)) byTime.set(sample.t_ms, sample);
  }
  // Incoming high-rate rows are mean-bucketed before merge so we never retain
  // the full device ring in the browser log.
  for (const sample of downsampleMotorTraceMean(incoming || [], hz)) {
    if (sample && Number.isFinite(sample.t_ms)) byTime.set(sample.t_ms, sample);
  }
  const merged = Array.from(byTime.values()).sort((a, b) => a.t_ms - b.t_ms);
  if (!merged.length || !(maxMs > 0)) return merged;
  const tEnd = merged[merged.length - 1].t_ms;
  const tCut = tEnd - maxMs;
  let start = 0;
  while (start < merged.length && merged[start].t_ms < tCut) start += 1;
  return start ? merged.slice(start) : merged;
}

// Must match the device header in lv6_dashboard.cpp. The six bemf_* columns
// were dropped: only the Rev 3.1 BEMF backend populated them and no board
// package selects it, so they were a constant sentinel block making up a
// quarter of every row. parseMotorTraceCsv() is header-keyed, so captures
// taken before the change still load.
const TRACE_CSV_HEADER =
  't_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,' +
  'stroke_phase,tacho_period_us,tacho_amp_raw';

function csvCell(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  return String(value);
}

export function motorTraceToCsv(samples) {
  const rows = [TRACE_CSV_HEADER];
  for (const sample of samples || []) {
    rows.push([
      csvCell(sample.t_ms),
      csvCell(sample.motion_count),
      Number.isFinite(sample.current_ma) ? sample.current_ma.toFixed(1) : '',
      csvCell(sample.adc_current_raw),
      sample.drive_on ? '1' : '0',
      sample.direction_open ? '1' : '0',
      sample.armed ? '1' : '0',
      csvCell(sample.stroke_phase || 0),
      csvCell(sample.tacho_period_us),
      csvCell(sample.tacho_amp_raw),
    ].join(','));
  }
  return rows.join('\n') + '\n';
}

export function downloadMotorTraceCsv(samples, filename) {
  const blob = new Blob([motorTraceToCsv(samples)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || 'lune-v6-motor-trace.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const phaseMax = Math.max(...driven.map((sample) => Number(sample.stroke_phase) || 0));
  const trailingStep = maxTrailingStep(body, TRAILING_WINDOW_MS);
  // Directions are NOT mirror images, and an earlier version had them backwards.
  //
  // Opening runs at a flat free-travel current and steps ~5x at the stop, so a
  // stall/running ratio is the right test and the bar can be high.
  //
  // Closing has no flat baseline to take a ratio against: the valve spring
  // drives the current up continuously across the whole stroke and the endstop
  // adds only ~10% on top. The firmware therefore stopped using a free-travel
  // reference for closing entirely - it looks at the rise over a trailing
  // window - and so does this. Sustain is what separates the pin-contact ramp
  // (one isolated qualifying sample) from the endstop ramp (seconds of them).
  const endstopSeen = direction === 'open'
    ? (ratio >= 1.35 || phaseMax >= STROKE_PHASE.STOPPING)
    : (trailingStep >= CLOSE_STEP_MA || phaseMax >= STROKE_PHASE.UNDER_LOAD);
  const suggestedFactor = round1(clamp(1 + towardPeak * Math.max(0, ratio - 1), 1.25, 2.4));
  const suggestedSlope = round1(clamp(Math.max(travelSlope * 2.2, maxStallSlope * 0.42, direction === 'open' ? 0.15 : 0.4), 0.15, 8));
  const suggestedSlopeFloor = round1(clamp(1 + 0.35 * Math.max(0, ratio - 1), 1.15, 1.8));
  const suggestedRippleLimit = direction === 'open' ? 1.15 : null;
  const pin = pinContactSample(driven);

  return {
    direction,
    ok: endstopSeen,
    reason: endstopSeen ? null : 'no_endstop',
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
    max_trailing_step_ma: round1(trailingStep),
    endstop_seen: endstopSeen,
    suggested_factor: suggestedFactor,
    // Retained for the telemetry chart's reference line only. Slope is no
    // longer a trip path in firmware, so these must not be offered as tunables.
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

// Trailing-window rise, mirroring safety_limits.h TrailingStepDetector. A fixed
// sense offset differences away, so this is comparable across boards.
const TRAILING_WINDOW_MS = 2000;
const CLOSE_STEP_MA = 2.5;

function maxTrailingStep(samples, windowMs) {
  let best = 0;
  let ref = 0;
  for (let i = 0; i < samples.length; i += 1) {
    while (ref < i && samples[i].t_ms - samples[ref].t_ms > windowMs) ref += 1;
    if (ref > 0 || samples[i].t_ms - samples[0].t_ms >= windowMs) {
      const rise = samples[i].current_ma - samples[ref].current_ma;
      if (rise > best) best = rise;
    }
  }
  return best;
}

export function overlayLevels(analysis, configured) {
  if (!analysis || !analysis.ok) return [];
  const mean = analysis.mean_ma;
  const factor = Number(configured && configured.factor) || analysis.suggested_factor;
  const levels = [
    { id: 'mean', value: mean },
    { id: 'threshold', value: round1(mean * factor) },
    { id: 'suggested', value: round1(mean * analysis.suggested_factor) },
  ];
  // The absolute caps that actually fire, reported live by the firmware. This
  // used to be a hardcoded 100 mA line - a threshold that no longer exists and
  // sits roughly 3x above the seat cap, so the chart implied enormous headroom
  // that was not there.
  const caps = (configured && configured.caps) || {};
  const seat = Number(analysis.direction === 'open' ? caps.open : caps.seat);
  const stall = Number(caps.stall);
  if (Number.isFinite(seat) && seat > 0) levels.push({ id: 'cap', value: round1(seat) });
  if (Number.isFinite(stall) && stall > 0) levels.push({ id: 'stall', value: round1(stall) });
  return levels;
}
