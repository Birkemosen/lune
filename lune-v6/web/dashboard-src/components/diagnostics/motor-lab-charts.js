import { injectStyle } from '../../core/style.js';
import { svgEl, smoothPath, attachTooltip, niceRange } from '../../core/chart-kit.js';
import { t } from '../../core/i18n.js';
import {
  motorTraceSeries, pinContactSample, strokePhaseKey, TRACE_MAX_SAMPLES,
} from '../../utils/motor-trace.js';

const CHART_W = 920;
const CHART_H = 200;
const PHASE_H = 56;
const PAD = { t: 16, r: 18, b: 32, l: 52 };
const PLOT_W = CHART_W - PAD.l - PAD.r;
const PLOT_H = CHART_H - PAD.t - PAD.b;

const COLOR_CURRENT = 'var(--accent)';
const COLOR_MEAN = 'var(--series-cool)';
const COLOR_THRESHOLD = 'var(--state-warn)';
const COLOR_SUGGESTED = 'var(--state-ok)';
const COLOR_CAP = 'var(--state-danger)';
const COLOR_PIN = 'var(--state-warn)';
const COLOR_CADENCE = 'var(--series-cool)';
const COLOR_SLOPE = 'var(--accent)';
const COLOR_SLOPE_REF = 'var(--state-ok)';

const PHASE_FILL = {
  free: 'rgba(var(--accent-rgb),.10)',
  contact: 'rgba(245,158,11,.22)',
  load: 'rgba(52,211,153,.20)',
  stopping: 'rgba(239,68,68,.18)',
};
const PHASE_HATCH = {
  free: '',
  contact: 'lab-hatch-contact',
  load: 'lab-hatch-load',
  stopping: 'lab-hatch-stop',
};

const css = `
.motor-lab-charts { display:grid; gap:12px; margin:0 0 14px; }
.motor-lab-charts .chart-card { padding:12px 12px 8px; }
.motor-lab-charts .lab-empty {
  min-height:120px; display:grid; place-items:center;
  color:var(--text-faint); font-size:.84rem; text-align:center;
}
.motor-lab-charts .lab-chart-warn {
  margin:0 0 8px; padding:8px 10px; border-left:3px solid var(--state-warn);
  background:var(--warn-bg-soft); color:var(--state-warn); font-size:.78rem; font-weight:650;
}
.motor-lab-charts .gw-controls {
  display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin:2px 0 6px;
}
.motor-lab-charts .gw-toggle {
  display:inline-flex; align-items:center; gap:6px; min-height:44px; padding:4px 12px;
  border:1px solid var(--control-border); border-radius:8px;
  background:linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025));
  color:var(--text-secondary); font-size:.68rem; font-weight:700; letter-spacing:.3px; cursor:pointer;
}
.motor-lab-charts .gw-toggle::before {
  content:''; width:9px; height:9px; border-radius:4px; border:2px solid currentColor;
  background:color-mix(in srgb, currentColor 30%, transparent); flex-shrink:0;
}
.motor-lab-charts .gw-toggle.is-off { opacity:.48; background:transparent; }
.motor-lab-charts .gw-toggle[data-layer="current"] { color:var(--accent); }
.motor-lab-charts .gw-toggle[data-layer="overlays"] { color:var(--series-cool); }
.motor-lab-charts .gw-toggle[data-layer="phase"] { color:var(--state-warn); }
.motor-lab-charts .gw-toggle[data-layer="cadence"] { color:var(--series-cool); }
.motor-lab-charts .gw-toggle[data-layer="slope"] { color:var(--accent); }
.motor-lab-charts .lab-phase-strip text { font-size:10px; font-weight:700; fill:var(--chart-axis); }
`;

injectStyle('motor-lab-charts', css);

function yAt(value, range, plotH = PLOT_H) {
  const span = range.max - range.min || 1;
  return PAD.t + plotH - ((value - range.min) / span) * plotH;
}

function timeAxis(svg, t0, tSpan, height = CHART_H) {
  svg.appendChild(svgEl('text', { class: 'chart-axis-label', x: PAD.l, y: height - 8 }, '0 s'));
  svg.appendChild(svgEl('text', {
    class: 'chart-axis-label', x: PAD.l + PLOT_W - 48, y: height - 8,
  }, (tSpan / 1000).toFixed(1) + ' s'));
}

function gridY(svg, range, plotH = PLOT_H) {
  for (let g = 0; g <= 4; g++) {
    const y = PAD.t + (plotH * g) / 4;
    svg.appendChild(svgEl('line', { class: 'chart-grid', x1: PAD.l, x2: PAD.l + PLOT_W, y1: y, y2: y }));
    const value = range.max - ((range.max - range.min) * g) / 4;
    svg.appendChild(svgEl('text', { class: 'chart-tick', x: 8, y: y + 4 }, value.toFixed(0)));
  }
}

function phaseSegments(samples) {
  if (!samples.length) return [];
  const segments = [];
  let start = 0;
  let phase = Number(samples[0].stroke_phase) || 0;
  for (let i = 1; i < samples.length; i++) {
    const next = Number(samples[i].stroke_phase) || 0;
    if (next !== phase) {
      segments.push({ phase, start, end: i - 1 });
      start = i;
      phase = next;
    }
  }
  segments.push({ phase, start, end: samples.length - 1 });
  return segments;
}

function ensureDefs(svg) {
  let defs = svg.querySelector('defs');
  if (defs) return defs;
  defs = svgEl('defs');
  const patterns = [
    ['lab-hatch-contact', 'M0 4 L4 0', 'var(--state-warn)'],
    ['lab-hatch-load', 'M0 0 L4 4', 'var(--state-ok)'],
    ['lab-hatch-stop', 'M0 2 L4 2', 'var(--state-danger)'],
  ];
  patterns.forEach(([id, d, stroke]) => {
    const pattern = svgEl('pattern', {
      id, width: 4, height: 4, patternUnits: 'userSpaceOnUse',
    });
    pattern.appendChild(svgEl('path', { d, stroke, 'stroke-width': '1', fill: 'none' }));
    defs.appendChild(pattern);
  });
  svg.appendChild(defs);
  return defs;
}

function cardShell(titleKey, subText, labelKey) {
  const card = document.createElement('div');
  card.className = 'chart-card';
  card.setAttribute('role', 'img');
  card.setAttribute('aria-label', t(labelKey || titleKey));
  const head = document.createElement('div');
  head.className = 'chart-head';
  head.innerHTML = '<span class="chart-title">' + t(titleKey) + '</span><span class="chart-sub">' +
    subText + '</span>';
  card.appendChild(head);
  return card;
}

function emptyCard(host, titleKey, subKey) {
  const card = cardShell(titleKey, t(subKey || 'diagnostics.lab.empty'), titleKey);
  const empty = document.createElement('div');
  empty.className = 'lab-empty';
  empty.textContent = t('diagnostics.lab.empty');
  card.appendChild(empty);
  host.appendChild(card);
}

function resolutionSub(live, analysis, series) {
  if (live) return t('diagnostics.lab.res.live');
  if (series && series.truncated) return t('diagnostics.lab.res.traceTruncated', { n: TRACE_MAX_SAMPLES });
  if (analysis && analysis.ok) {
    return t('diagnostics.lab.res.trace', {
      direction: t('diagnostics.lab.dir.' + analysis.direction),
      ms: analysis.runtime_ms,
    });
  }
  return t('diagnostics.lab.res.traceReady');
}

function renderCurrentChart(host, samples, analysis, overlays, live, visible) {
  if (!visible.current && !visible.overlays) return;
  const series = motorTraceSeries(samples);
  const card = cardShell('diagnostics.lab.chart.current', resolutionSub(live, analysis, series), 'diagnostics.lab.chart.currentAria');
  if (series.truncated) {
    const warn = document.createElement('div');
    warn.className = 'lab-chart-warn';
    warn.textContent = t('diagnostics.lab.res.ringWarn', { n: TRACE_MAX_SAMPLES, s: series.window_ms / 1000 });
    card.appendChild(warn);
  }
  if (!samples.length) {
    const empty = document.createElement('div');
    empty.className = 'lab-empty';
    empty.textContent = t('diagnostics.lab.empty');
    card.appendChild(empty);
    host.appendChild(card);
    return;
  }

  const currents = samples.map((sample) => sample.current_ma).filter(Number.isFinite);
  const overlayValues = (overlays || []).map((line) => line.value).filter(Number.isFinite);
  const range = niceRange(currents.concat([0, 40], overlayValues), 0, 50);
  range.min = 0;
  const t0 = samples[0].t_ms;
  const tSpan = Math.max(1, samples[samples.length - 1].t_ms - t0);
  const xAt = (i) => PAD.l + ((samples[i].t_ms - t0) / tSpan) * PLOT_W;
  const pts = samples.map((sample, i) => ({ x: xAt(i), y: yAt(sample.current_ma, range) }));
  const svg = svgEl('svg', { viewBox: '0 0 ' + CHART_W + ' ' + CHART_H, role: 'img' });
  gridY(svg, range);
  timeAxis(svg, t0, tSpan);

  if (visible.overlays) {
    const overlayColor = { mean: COLOR_MEAN, threshold: COLOR_THRESHOLD, suggested: COLOR_SUGGESTED, cap: COLOR_CAP };
    (overlays || []).forEach((line) => {
      const y = yAt(line.value, range);
      svg.appendChild(svgEl('line', {
        x1: PAD.l, x2: PAD.l + PLOT_W, y1: y, y2: y,
        stroke: overlayColor[line.id], 'stroke-dasharray': line.id === 'mean' ? '0' : '5 4',
        'stroke-width': line.id === 'mean' ? '1.4' : '1.2', 'vector-effect': 'non-scaling-stroke',
        opacity: line.id === 'cap' ? '.45' : '.9',
      }));
    });
  }

  const pin = (analysis && analysis.ok && analysis.pin_seen)
    ? { t_ms: analysis.pin_t_ms, current_ma: analysis.pin_current_ma, motion_count: analysis.pin_motion_count, stroke_phase: 1 }
    : pinContactSample(samples);
  if (pin && Number.isFinite(pin.t_ms)) {
    const x = PAD.l + ((pin.t_ms - t0) / tSpan) * PLOT_W;
    svg.appendChild(svgEl('line', {
      x1: x, x2: x, y1: PAD.t, y2: PAD.t + PLOT_H,
      stroke: COLOR_PIN, 'stroke-dasharray': '3 4', 'stroke-width': '1.4',
      'vector-effect': 'non-scaling-stroke', opacity: '.95',
    }));
    svg.appendChild(svgEl('circle', {
      cx: x, cy: yAt(Number(pin.current_ma) || 0, range), r: 4.2,
      fill: COLOR_PIN, stroke: 'var(--bg)', 'stroke-width': '1.5',
    }));
    svg.appendChild(svgEl('text', {
      class: 'chart-tick', x: Math.min(x + 6, PAD.l + PLOT_W - 64), y: PAD.t + 12,
      fill: COLOR_PIN,
    }, t('diagnostics.lab.pinMark')));
  }

  if (visible.current) {
    svg.appendChild(svgEl('path', {
      d: smoothPath(pts), fill: 'none', stroke: COLOR_CURRENT, 'stroke-width': '2.2',
      'vector-effect': 'non-scaling-stroke',
    }));
  }
  card.appendChild(svg);
  host.appendChild(card);
  attachTooltip(svg, card, {
    count: samples.length,
    plotTop: PAD.t,
    plotBottom: PAD.t + PLOT_H,
    xAt,
    label: (i) => ((samples[i].t_ms - t0) / 1000).toFixed(2) + ' s',
    dots: (i) => visible.current ? [{ y: pts[i].y, color: COLOR_CURRENT }] : [],
    rows: (i) => [
      { color: COLOR_CURRENT, label: t('diagnostics.lab.currentMa'), value: Number(samples[i].current_ma).toFixed(1) + ' mA' },
      { color: COLOR_MEAN, label: t('diagnostics.lab.motion'), value: String(samples[i].motion_count) },
      { color: COLOR_PIN, label: t('diagnostics.lab.stroke'), value: t('diagnostics.lab.stroke.' + strokePhaseKey(samples[i].stroke_phase)) },
    ],
  });
}

function renderPhaseChart(host, samples, live, visible) {
  if (!visible.phase) return;
  const series = motorTraceSeries(samples);
  const card = cardShell('diagnostics.lab.chart.phase', resolutionSub(live, null, series), 'diagnostics.lab.chart.phaseAria');
  if (!samples.length) {
    const empty = document.createElement('div');
    empty.className = 'lab-empty';
    empty.textContent = t('diagnostics.lab.empty');
    card.appendChild(empty);
    host.appendChild(card);
    return;
  }
  const t0 = samples[0].t_ms;
  const tSpan = Math.max(1, samples[samples.length - 1].t_ms - t0);
  const height = PHASE_H + PAD.b;
  const svg = svgEl('svg', { viewBox: '0 0 ' + CHART_W + ' ' + height, class: 'lab-phase-strip', role: 'img' });
  ensureDefs(svg);
  const bandTop = 10;
  const bandH = PHASE_H - 18;
  phaseSegments(samples).forEach((seg) => {
    const x1 = PAD.l + ((samples[seg.start].t_ms - t0) / tSpan) * PLOT_W;
    const x2 = PAD.l + ((samples[seg.end].t_ms - t0) / tSpan) * PLOT_W;
    const key = strokePhaseKey(seg.phase);
    const width = Math.max(2, x2 - x1);
    svg.appendChild(svgEl('rect', {
      x: x1, y: bandTop, width, height: bandH,
      fill: PHASE_FILL[key] || PHASE_FILL.free,
      stroke: 'var(--separator)', 'stroke-width': '1',
    }));
    if (PHASE_HATCH[key]) {
      svg.appendChild(svgEl('rect', {
        x: x1, y: bandTop, width, height: bandH,
        fill: 'url(#' + PHASE_HATCH[key] + ')', opacity: '.55',
      }));
    }
    if (width > 54) {
      svg.appendChild(svgEl('text', {
        x: x1 + 6, y: bandTop + bandH / 2 + 3,
      }, t('diagnostics.lab.stroke.' + key)));
    }
    svg.appendChild(svgEl('line', {
      x1: x2, x2, y1: bandTop, y2: bandTop + bandH,
      stroke: 'var(--text-muted)', 'stroke-width': '1', opacity: '.55',
    }));
  });
  timeAxis(svg, t0, tSpan, height);
  card.appendChild(svg);
  host.appendChild(card);
}

function renderCadenceChart(host, samples, live, visible) {
  if (!visible.cadence) return;
  const series = motorTraceSeries(samples);
  const card = cardShell('diagnostics.lab.chart.cadence', resolutionSub(live, null, series), 'diagnostics.lab.chart.cadenceAria');
  const rates = series.cadence.map((row) => row.rate_hz).filter((value) => value != null && Number.isFinite(value));
  if (!rates.length) {
    const empty = document.createElement('div');
    empty.className = 'lab-empty';
    empty.textContent = t('diagnostics.lab.chart.cadenceEmpty');
    card.appendChild(empty);
    host.appendChild(card);
    return;
  }
  const range = niceRange(rates.concat([0]), 0, Math.max(10, ...rates));
  range.min = 0;
  const t0 = samples[0].t_ms;
  const tSpan = Math.max(1, samples[samples.length - 1].t_ms - t0);
  const pts = [];
  const indexMap = [];
  series.cadence.forEach((row, i) => {
    if (row.rate_hz == null || !Number.isFinite(row.rate_hz)) return;
    pts.push({ x: PAD.l + ((row.t_ms - t0) / tSpan) * PLOT_W, y: yAt(row.rate_hz, range) });
    indexMap.push(i);
  });
  const svg = svgEl('svg', { viewBox: '0 0 ' + CHART_W + ' ' + CHART_H, role: 'img' });
  gridY(svg, range);
  timeAxis(svg, t0, tSpan);
  svg.appendChild(svgEl('path', {
    d: smoothPath(pts), fill: 'none', stroke: COLOR_CADENCE, 'stroke-width': '2',
    'vector-effect': 'non-scaling-stroke',
  }));
  card.appendChild(svg);
  host.appendChild(card);
  attachTooltip(svg, card, {
    count: pts.length,
    plotTop: PAD.t,
    plotBottom: PAD.t + PLOT_H,
    xAt: (i) => pts[i].x,
    label: (i) => ((series.cadence[indexMap[i]].t_ms - t0) / 1000).toFixed(2) + ' s',
    dots: (i) => [{ y: pts[i].y, color: COLOR_CADENCE }],
    rows: (i) => {
      const row = series.cadence[indexMap[i]];
      return [
        { color: COLOR_CADENCE, label: t('diagnostics.lab.cadence'), value: row.rate_hz.toFixed(1) + ' /s' },
        { color: COLOR_MEAN, label: t('diagnostics.lab.tachoPeriod'), value: Math.round(row.period_us) + ' µs' },
      ];
    },
  });
}

function renderSlopeChart(host, samples, analysis, live, visible) {
  if (!visible.slope) return;
  const series = motorTraceSeries(samples);
  const card = cardShell('diagnostics.lab.chart.slope', resolutionSub(live, analysis, series), 'diagnostics.lab.chart.slopeAria');
  if (!series.slopes.length) {
    const empty = document.createElement('div');
    empty.className = 'lab-empty';
    empty.textContent = t('diagnostics.lab.chart.slopeEmpty');
    card.appendChild(empty);
    host.appendChild(card);
    return;
  }
  const values = series.slopes.map((row) => row.slope);
  const suggested = analysis && analysis.ok ? analysis.suggested_slope : null;
  const range = niceRange(values.concat(suggested != null ? [suggested, 0] : [0]), -2, 8);
  const t0 = samples[0].t_ms;
  const tSpan = Math.max(1, samples[samples.length - 1].t_ms - t0);
  const pts = series.slopes.map((row) => ({
    x: PAD.l + ((row.t_ms - t0) / tSpan) * PLOT_W,
    y: yAt(row.slope, range),
  }));
  const svg = svgEl('svg', { viewBox: '0 0 ' + CHART_W + ' ' + CHART_H, role: 'img' });
  gridY(svg, range);
  timeAxis(svg, t0, tSpan);
  if (suggested != null) {
    const y = yAt(suggested, range);
    svg.appendChild(svgEl('line', {
      x1: PAD.l, x2: PAD.l + PLOT_W, y1: y, y2: y,
      stroke: COLOR_SLOPE_REF, 'stroke-dasharray': '5 4', 'stroke-width': '1.3',
      'vector-effect': 'non-scaling-stroke',
    }));
  }
  svg.appendChild(svgEl('path', {
    d: smoothPath(pts), fill: 'none', stroke: COLOR_SLOPE, 'stroke-width': '2',
    'vector-effect': 'non-scaling-stroke',
  }));
  card.appendChild(svg);
  host.appendChild(card);
  attachTooltip(svg, card, {
    count: pts.length,
    plotTop: PAD.t,
    plotBottom: PAD.t + PLOT_H,
    xAt: (i) => pts[i].x,
    label: (i) => ((series.slopes[i].t_ms - t0) / 1000).toFixed(2) + ' s',
    dots: (i) => [{ y: pts[i].y, color: COLOR_SLOPE }],
    rows: (i) => [
      { color: COLOR_SLOPE, label: t('diagnostics.lab.slope'), value: series.slopes[i].slope.toFixed(2) + ' mA/s' },
    ],
  });
}

/**
 * Render the motor-lab chart stack into `host`.
 * @returns {HTMLElement} layer-toggle toolbar (for click wiring)
 */
export function renderMotorLabCharts(host, opts) {
  const samples = (opts && opts.samples) || [];
  const analysis = opts && opts.analysis;
  const live = !!(opts && opts.live);
  const overlays = opts && opts.overlays;
  const visible = Object.assign({
    current: true, overlays: true, phase: true, cadence: true, slope: true,
  }, opts && opts.visible);

  host.innerHTML = '';
  const stack = document.createElement('div');
  stack.className = 'motor-lab-charts';

  const controls = document.createElement('div');
  controls.className = 'gw-controls';
  controls.setAttribute('role', 'toolbar');
  controls.setAttribute('aria-label', t('diagnostics.lab.chart.layers'));
  const layers = [
    ['current', 'diagnostics.lab.chart.layer.current'],
    ['overlays', 'diagnostics.lab.chart.layer.overlays'],
    ['phase', 'diagnostics.lab.chart.layer.phase'],
    ['cadence', 'diagnostics.lab.chart.layer.cadence'],
    ['slope', 'diagnostics.lab.chart.layer.slope'],
  ];
  layers.forEach(([id, key]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gw-toggle' + (visible[id] ? '' : ' is-off');
    btn.dataset.layer = id;
    btn.setAttribute('aria-pressed', visible[id] ? 'true' : 'false');
    btn.textContent = t(key);
    controls.appendChild(btn);
  });
  stack.appendChild(controls);

  if (!samples.length) {
    emptyCard(stack, 'diagnostics.lab.chart.current', 'diagnostics.lab.chartLive');
  } else {
    renderCurrentChart(stack, samples, analysis, overlays, live, visible);
    renderPhaseChart(stack, samples, live, visible);
    renderCadenceChart(stack, samples, live, visible);
    renderSlopeChart(stack, samples, analysis, live, visible);
  }

  host.appendChild(stack);
  return controls;
}
