// =============================================================================
// motor-lab-thresholds — "what does each threshold do on this stroke?"
// =============================================================================
// Replays a close and an open trace through utils/endstop-explorer.js and draws
// each threshold as the current it corresponds to, where each trip path would
// fire, and the close stroke's 40 s wall. Uses the operator's latest capture per
// direction when there is one, otherwise the Rev 3.3 reference fixtures.
//
// Encoding: the trace is neutral ink (it is the subject), the free-travel
// baseline and the detection threshold carry the two hues, the absolute caps are
// neutral dashed lines. Every line is direct-labelled with its mA value and the
// table under each chart repeats everything, so no identity rests on colour.
// =============================================================================

import { injectStyle } from '../../core/style.js';
import { svgEl, attachTooltip } from '../../core/chart-kit.js';
import { t } from '../../core/i18n.js';
import { explainEndstop, thresholdLevels, CLOSE_WALL } from '../../utils/endstop-explorer.js';
import { REFERENCE_CLOSE, REFERENCE_OPEN, referenceSamples } from '../../utils/motor-reference-traces.js';

const W = 920;
const H = 230;
const RISE_H = 130;
const PAD = { t: 22, r: 200, b: 28, l: 44 };
const PLOT_W = W - PAD.l - PAD.r;

const C_TRACE = 'var(--series-measured)';
const C_BASELINE = 'var(--series-cool)';
const C_DETECT = 'var(--accent)';
const C_CAP = 'var(--text-muted)';
const C_CEILING = 'var(--state-warn)';
const C_WALL = 'var(--state-danger)';

const LEVEL_STYLE = {
  baseline: { stroke: C_BASELINE, dash: '0', width: 1.4 },
  threshold: { stroke: C_DETECT, dash: '6 4', width: 1.6 },
  seat: { stroke: C_CAP, dash: '2 4', width: 1.2 },
  popoff: { stroke: C_CAP, dash: '8 3 2 3', width: 1.2 },
  openStop: { stroke: C_CAP, dash: '2 4', width: 1.2 },
  stall: { stroke: C_CAP, dash: '8 3', width: 1.2 },
  circuit: { stroke: C_CAP, dash: '1 3', width: 1.2 },
};

const css = `
.lab-thresholds { display:grid; gap:18px; margin:14px 0 0; }
.lab-thresholds .chart-card { padding:0; }
.lab-thresholds .lt-intro { margin:0; color:var(--text-muted); font-size:.78rem; line-height:1.45; }
.lab-thresholds .lt-verdict {
  display:flex; align-items:center; gap:8px; margin:0 0 6px;
  color:var(--text-secondary); font-size:.78rem; font-weight:650;
}
.lab-thresholds .lt-verdict[data-state="late"] { color:var(--danger-text); }
.lab-thresholds .lt-verdict[data-state="ceiling"] { color:var(--state-warn); }
.lab-thresholds .lt-verdict .lt-icon { font-weight:800; }
.lab-thresholds .lt-offscale { margin:2px 0 12px; color:var(--text-faint); font-size:.7rem; }
.lab-thresholds .lt-label { font-size:11px; fill:var(--text-secondary); font-variant-numeric:tabular-nums; }
.lab-thresholds .lt-vlabel { font-size:10px; font-weight:700; letter-spacing:.3px; }
.lab-thresholds table { width:100%; border-collapse:collapse; margin-top:8px; font-size:.74rem; }
.lab-thresholds th, .lab-thresholds td {
  padding:6px 8px; border-bottom:1px solid var(--separator); text-align:left;
  font-variant-numeric:tabular-nums;
}
.lab-thresholds th { color:var(--text-faint); font-size:.64rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.lab-thresholds td { color:var(--text-secondary); }
.lab-thresholds td:first-child { color:var(--text-strong); font-weight:650; white-space:nowrap; }
.lab-thresholds tr[data-first="true"] td { background:var(--accent-bg-soft); }
.lab-thresholds td[data-late="true"] { color:var(--danger-text); font-weight:650; }
.lab-thresholds .lt-swatch {
  display:inline-block; width:16px; height:0; margin-right:6px; vertical-align:middle;
  border-top:2px solid currentColor;
}
@media (max-width: 720px) {
  .lab-thresholds th:nth-child(4), .lab-thresholds td:nth-child(4) { display:none; }
}
`;

injectStyle('motor-lab-thresholds', css);

const s1 = (ms) => (ms / 1000).toFixed(2) + ' s';
const ma = (v) => Number(v).toFixed(1) + ' mA';

function yScale(min, max, top, h) {
  const span = max - min || 1;
  return (v) => top + h - ((v - min) / span) * h;
}

function pathOf(points) {
  let d = '';
  let pen = false;
  for (const pt of points) {
    if (pt == null) { pen = false; continue; }
    d += (pen ? ' L ' : ' M ') + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1);
    pen = true;
  }
  return d.trim();
}

/// Push direct labels apart so near-equal thresholds (seat 34 / factor 34.8 /
/// pop-off 36) stay readable. Lines stay at their true height.
function spreadLabels(items, minGap, top, bottom) {
  const sorted = items.slice().sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y - sorted[i - 1].y < minGap) sorted[i].y = sorted[i - 1].y + minGap;
  }
  const overflow = sorted.length ? sorted[sorted.length - 1].y - bottom : 0;
  if (overflow > 0) sorted.forEach((it) => { it.y -= overflow; });
  if (sorted.length && sorted[0].y < top) {
    const shift = top - sorted[0].y;
    sorted.forEach((it) => { it.y += shift; });
  }
  return sorted;
}

function timeLabels(svg, t0, tEnd, xAt, height) {
  for (let tm = Math.ceil(t0 / 10000) * 10000; tm <= tEnd; tm += 10000) {
    if (tm === 0) continue;
    svg.appendChild(svgEl('text', { class: 'chart-axis-label', x: xAt(tm) - 8, y: height - 8 }, (tm / 1000) + ' s'));
  }
}

function levelName(id, direction) {
  if (id === 'threshold') return t(direction === 'open' ? 'diagnostics.lab.thr.openThreshold' : 'diagnostics.lab.thr.closeThreshold');
  return t('diagnostics.lab.thr.' + id);
}

function thresholdDetail(id, result) {
  const p = result.params;
  const base = result.baselineMa;
  switch (id) {
    case 'trailing':
      return t('diagnostics.lab.thr.trailingDetail', {
        step: p.trailingStepMa.toFixed(1), window: (p.trailingWindowMs / 1000).toFixed(1), sustain: (p.trailingSustainMs / 1000).toFixed(2),
      });
    case 'threshold':
      if (base == null) return t('diagnostics.lab.thr.noBaseline');
      if (result.direction === 'open' && result.usesFraction) {
        return t('diagnostics.lab.thr.fractionDetail', { base: base.toFixed(1), k: p.stallFraction.toFixed(2), stall: p.learnedStallMa.toFixed(1) });
      }
      return t('diagnostics.lab.thr.factorDetail', {
        base: base.toFixed(1), f: (result.direction === 'open' ? p.openFactor : p.closeFactor).toFixed(2),
        ma: (base * (result.direction === 'open' ? p.openFactor : p.closeFactor)).toFixed(1),
      });
    case 'seat': return t('diagnostics.lab.thr.capDetail', { ma: p.seatMa.toFixed(1), frames: p.seatFrames }) + ' · ' + t('diagnostics.lab.thr.seatGate');
    case 'popoff': return t('diagnostics.lab.thr.capDetail', { ma: p.popoffMa.toFixed(1), frames: p.popoffFrames });
    case 'openStop': return t('diagnostics.lab.thr.capDetail', { ma: p.openStopMa.toFixed(1), frames: p.openFrames }) + ' · ' + t('diagnostics.lab.thr.openGate');
    case 'stall': return t('diagnostics.lab.thr.capDetail', { ma: p.stallMa.toFixed(1), frames: p.stallFrames });
    case 'circuit': return t('diagnostics.lab.thr.capDetail', { ma: p.circuitMa.toFixed(1), frames: p.circuitFrames });
    case 'ceiling':
      return result.direction === 'open'
        ? t('diagnostics.lab.thr.ceilingDetail', { s: p.openCeilingS, counts: 3600 })
        : t('diagnostics.lab.thr.ceilingDetail', { s: p.closeCeilingS, counts: 2600 });
    case 'wall': return t('diagnostics.lab.thr.wallDetail', { s: CLOSE_WALL.ms / 1000, counts: CLOSE_WALL.counts });
    default: return '';
  }
}

function tripIds(direction) {
  return direction === 'open'
    ? ['threshold', 'openStop', 'stall', 'circuit', 'ceiling']
    : ['trailing', 'threshold', 'seat', 'popoff', 'stall', 'circuit', 'ceiling', 'wall'];
}

function verdict(result) {
  const wall = result.trips.wall;
  if (!result.first) {
    return { state: 'none', text: t('diagnostics.lab.thr.verdictNone') };
  }
  const trip = result.trips[result.first];
  if (result.first === 'ceiling') {
    return { state: 'ceiling', icon: '!', text: t('diagnostics.lab.thr.verdictCeiling', { t: s1(trip.t_ms), counts: trip.motion_count }) };
  }
  if (wall && trip.t_ms >= wall.t_ms) {
    return { state: 'late', icon: '⚠', text: t('diagnostics.lab.thr.verdictLate', { name: levelName(result.first === 'trailing' ? 'trailing' : result.first, result.direction), t: s1(trip.t_ms) }) };
  }
  return { state: 'ok', text: t('diagnostics.lab.thr.verdictFirst', { name: levelName(result.first, result.direction), t: s1(trip.t_ms), ma: ma(trip.current_ma) }) };
}

function renderCurrent(card, result) {
  const rows = result.series;
  const t0 = rows[0].t_ms;
  const tEnd = rows[rows.length - 1].t_ms;
  const xAt = (tm) => PAD.l + ((tm - t0) / Math.max(1, tEnd - t0)) * PLOT_W;

  const peak = Math.max(...rows.map((r) => r.current_ma));
  const levels = thresholdLevels(result);
  // Keep resolution where the decisions are: caps far above the trace are
  // listed under the chart instead of squashing 24-40 mA into a sliver.
  const yMaxWanted = Math.max(peak, ...levels.filter((l) => l.ma <= peak + 12).map((l) => l.ma)) + 4;
  const yStep = yMaxWanted > 40 ? 20 : 10;
  const yMax = Math.ceil(yMaxWanted / yStep) * yStep;
  const yMin = 0;
  const plotH = H - PAD.t - PAD.b;
  const yAt = yScale(yMin, yMax, PAD.t, plotH);
  const onScale = levels.filter((l) => l.ma <= yMax);
  const offScale = levels.filter((l) => l.ma > yMax);

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img' });
  svg.setAttribute('aria-label', t('diagnostics.lab.thr.chartAria', { dir: t('diagnostics.lab.dir.' + result.direction) }));

  for (let v = yMin; v <= yMax; v += yStep) {
    const y = yAt(v);
    svg.appendChild(svgEl('line', { class: 'chart-grid', x1: PAD.l, x2: PAD.l + PLOT_W, y1: y, y2: y }));
    svg.appendChild(svgEl('text', { class: 'chart-tick', x: 6, y: y + 4 }, v.toFixed(0)));
  }
  svg.appendChild(svgEl('text', { class: 'chart-axis-label', x: 6, y: PAD.t - 8 }, 'mA'));
  timeLabels(svg, t0, tEnd, xAt, H);

  // Vertical boundaries: count ceiling and (close) the 40 s wall.
  const verticals = [];
  if (result.trips.ceiling) verticals.push({ id: 'ceiling', t: result.trips.ceiling.t_ms, color: C_CEILING, dash: '3 3' });
  if (result.direction === 'close') {
    const wallT = result.trips.wall ? result.trips.wall.t_ms : CLOSE_WALL.ms;
    if (wallT <= tEnd) verticals.push({ id: 'wall', t: wallT, color: C_WALL, dash: '0' });
  }
  verticals.forEach((v, i) => {
    const x = xAt(v.t);
    svg.appendChild(svgEl('line', { x1: x, x2: x, y1: PAD.t, y2: PAD.t + plotH, stroke: v.color, 'stroke-width': 1.4, 'stroke-dasharray': v.dash, 'vector-effect': 'non-scaling-stroke' }));
    svg.appendChild(svgEl('text', { class: 'lt-vlabel', x: x + 4, y: PAD.t + 10 + i * 12, fill: v.color }, levelName(v.id, result.direction)));
  });

  // Horizontal caps; baseline and detection threshold follow the trace in time.
  const labelItems = [];
  onScale.forEach((l) => {
    const st = LEVEL_STYLE[l.id];
    if (l.id === 'baseline' || l.id === 'threshold') {
      const key = l.id === 'baseline' ? 'baseline_ma' : 'threshold_ma';
      svg.appendChild(svgEl('path', {
        d: pathOf(rows.map((r) => (r[key] == null ? null : { x: xAt(r.t_ms), y: yAt(r[key]) }))),
        fill: 'none', stroke: st.stroke, 'stroke-width': st.width, 'stroke-dasharray': st.dash, 'vector-effect': 'non-scaling-stroke',
      }));
    } else {
      const y = yAt(l.ma);
      svg.appendChild(svgEl('line', { x1: PAD.l, x2: PAD.l + PLOT_W, y1: y, y2: y, stroke: st.stroke, 'stroke-width': st.width, 'stroke-dasharray': st.dash, 'vector-effect': 'non-scaling-stroke' }));
    }
    labelItems.push({ id: l.id, y: yAt(l.ma), text: levelName(l.id, result.direction) + '  ' + ma(l.ma), st });
  });

  svg.appendChild(svgEl('path', {
    d: pathOf(rows.map((r) => ({ x: xAt(r.t_ms), y: yAt(r.current_ma) }))),
    fill: 'none', stroke: C_TRACE, 'stroke-width': 2, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke',
  }));

  spreadLabels(labelItems, 13, PAD.t + 4, PAD.t + plotH).forEach((it) => {
    const x = PAD.l + PLOT_W + 8;
    svg.appendChild(svgEl('line', { x1: x, x2: x + 14, y1: it.y, y2: it.y, stroke: it.st.stroke, 'stroke-width': 2, 'stroke-dasharray': it.st.dash === '0' ? '0' : '4 2' }));
    svg.appendChild(svgEl('text', { class: 'lt-label', x: x + 19, y: it.y + 4 }, it.text));
  });

  // Trip markers on the trace: small diamonds, the first stop larger + labelled.
  tripIds(result.direction).filter((id) => id !== 'ceiling' && id !== 'wall').forEach((id) => {
    const trip = result.trips[id];
    if (!trip) return;
    const x = xAt(trip.t_ms);
    const y = yAt(Math.min(trip.current_ma, yMax));
    const first = id === result.first;
    const r = first ? 6 : 4;
    svg.appendChild(svgEl('path', {
      d: `M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`,
      fill: id === 'trailing' || id === 'threshold' ? C_DETECT : 'var(--text-strong)',
      stroke: 'var(--bg)', 'stroke-width': 2,
    }));
  });

  card.appendChild(svg);
  if (offScale.length) {
    const note = document.createElement('p');
    note.className = 'lt-offscale';
    note.textContent = t('diagnostics.lab.thr.offScale', { list: offScale.map((l) => levelName(l.id, result.direction) + ' ' + ma(l.ma)).join(' · ') });
    card.appendChild(note);
  }

  attachTooltip(svg, card, {
    count: rows.length,
    plotTop: PAD.t,
    plotBottom: PAD.t + plotH,
    xAt: (i) => xAt(rows[i].t_ms),
    label: (i) => s1(rows[i].t_ms) + ' · ' + Math.round(rows[i].motion_count) + ' counts',
    dots: (i) => [{ y: yAt(rows[i].current_ma), color: C_TRACE }],
    rows: (i) => {
      const r = rows[i];
      const out = [{ color: C_TRACE, label: t('diagnostics.lab.currentMa'), value: ma(r.current_ma) }];
      if (r.baseline_ma != null) out.push({ color: C_BASELINE, label: levelName('baseline', result.direction), value: ma(r.baseline_ma) });
      if (r.threshold_ma != null) out.push({ color: C_DETECT, label: levelName('threshold', result.direction), value: ma(r.threshold_ma) });
      if (r.rise_ma != null) out.push({ color: C_DETECT, label: t('diagnostics.lab.thr.rise'), value: r.rise_ma.toFixed(2) + ' mA' });
      return out;
    },
  });
}

function renderRise(card, result) {
  const rows = result.series.filter((r) => r.rise_ma != null);
  if (!rows.length) return;
  const all = result.series;
  const t0 = all[0].t_ms;
  const tEnd = all[all.length - 1].t_ms;
  const xAt = (tm) => PAD.l + ((tm - t0) / Math.max(1, tEnd - t0)) * PLOT_W;
  const p = result.params;
  const rises = rows.map((r) => r.rise_ma);
  const yMax = Math.ceil(Math.max(p.trailingStepMa + 1.5, ...rises) + 0.5);
  // The drive-off drop at the end of a trace is a huge negative "rise" that
  // would flatten everything that matters; a fall never trips, so clip it.
  const yMin = Math.max(-4, Math.floor(Math.min(-1, ...rises)));
  const clipRise = (v) => Math.max(yMin, Math.min(yMax, v));
  const plotH = RISE_H - 14 - PAD.b;
  const yAt = yScale(yMin, yMax, 14, plotH);

  const head = document.createElement('div');
  head.className = 'chart-head';
  head.innerHTML = '<span class="chart-title">' + t('diagnostics.lab.thr.riseTitle', { window: (p.trailingWindowMs / 1000).toFixed(1) }) + '</span>';
  card.appendChild(head);

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${RISE_H}`, role: 'img' });
  svg.setAttribute('aria-label', t('diagnostics.lab.thr.riseAria'));
  timeLabels(svg, t0, tEnd, xAt, RISE_H);
  [yMin, 0, yMax].forEach((v) => {
    const y = yAt(v);
    svg.appendChild(svgEl('line', { class: 'chart-grid', x1: PAD.l, x2: PAD.l + PLOT_W, y1: y, y2: y }));
    svg.appendChild(svgEl('text', { class: 'chart-tick', x: 6, y: y + 4 }, v.toFixed(0)));
  });

  // Shade every qualifying run; the run that reaches `sustain` is the trip.
  let runStart = null;
  const flush = (endT) => {
    if (runStart == null) return;
    svg.appendChild(svgEl('rect', {
      x: xAt(runStart), y: 14, width: Math.max(1.5, xAt(endT) - xAt(runStart)), height: plotH,
      fill: C_DETECT, opacity: endT - runStart >= p.trailingSustainMs ? 0.28 : 0.12,
    }));
    runStart = null;
  };
  rows.forEach((r, i) => {
    if (r.qualifying && runStart == null) runStart = r.t_ms;
    if (!r.qualifying || i === rows.length - 1) flush(r.t_ms);
  });

  const yStep = yAt(p.trailingStepMa);
  svg.appendChild(svgEl('line', { x1: PAD.l, x2: PAD.l + PLOT_W, y1: yStep, y2: yStep, stroke: C_DETECT, 'stroke-width': 1.6, 'stroke-dasharray': '6 4', 'vector-effect': 'non-scaling-stroke' }));
  svg.appendChild(svgEl('text', { class: 'lt-label', x: PAD.l + PLOT_W + 27, y: yStep + 4 }, t('diagnostics.lab.thr.trailing') + '  ' + p.trailingStepMa.toFixed(1) + ' mA'));
  svg.appendChild(svgEl('line', { x1: PAD.l + PLOT_W + 8, x2: PAD.l + PLOT_W + 22, y1: yStep, y2: yStep, stroke: C_DETECT, 'stroke-width': 2, 'stroke-dasharray': '4 2' }));

  svg.appendChild(svgEl('path', {
    d: pathOf(rows.map((r) => ({ x: xAt(r.t_ms), y: yAt(clipRise(r.rise_ma)) }))),
    fill: 'none', stroke: C_TRACE, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke',
  }));
  if (result.trips.wall) {
    const x = xAt(result.trips.wall.t_ms);
    svg.appendChild(svgEl('line', { x1: x, x2: x, y1: 14, y2: 14 + plotH, stroke: C_WALL, 'stroke-width': 1.4, 'vector-effect': 'non-scaling-stroke' }));
  }
  card.appendChild(svg);

  attachTooltip(svg, card, {
    count: rows.length,
    plotTop: 14,
    plotBottom: 14 + plotH,
    xAt: (i) => xAt(rows[i].t_ms),
    label: (i) => s1(rows[i].t_ms),
    dots: (i) => [{ y: yAt(clipRise(rows[i].rise_ma)), color: C_TRACE }],
    rows: (i) => [
      { color: C_TRACE, label: t('diagnostics.lab.thr.rise'), value: rows[i].rise_ma.toFixed(2) + ' mA' },
      { color: C_DETECT, label: t('diagnostics.lab.thr.trailing'), value: p.trailingStepMa.toFixed(1) + ' mA' },
    ],
  });
}

function renderTable(card, result) {
  const table = document.createElement('table');
  const wall = result.trips.wall;
  const head = ['path', 'threshold', 'fires', 'counts'].map((k) => '<th>' + t('diagnostics.lab.thr.col.' + k) + '</th>').join('');
  const body = tripIds(result.direction).map((id) => {
    const trip = result.trips[id];
    const late = !!(trip && wall && id !== 'wall' && id !== 'ceiling' && trip.t_ms >= wall.t_ms);
    const st = LEVEL_STYLE[id];
    const color = id === 'trailing' ? C_DETECT : id === 'ceiling' ? C_CEILING : id === 'wall' ? C_WALL : (st ? st.stroke : C_CAP);
    const fires = trip ? s1(trip.t_ms) + (late ? ' · ⚠ ' + t('diagnostics.lab.thr.afterWall') : '') : t('diagnostics.lab.thr.notReached');
    return '<tr data-first="' + (id === result.first) + '">' +
      '<td><span class="lt-swatch" style="color:' + color + '"></span>' + levelName(id, result.direction) + '</td>' +
      '<td>' + thresholdDetail(id, result) + '</td>' +
      '<td data-late="' + late + '">' + fires + '</td>' +
      '<td>' + (trip ? trip.motion_count : '—') + '</td></tr>';
  }).join('');
  table.innerHTML = '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody>';
  card.appendChild(table);
}

function renderDirection(host, direction, source, samples, params) {
  const result = explainEndstop(samples, direction, params);
  const card = document.createElement('div');
  card.className = 'chart-card';
  const head = document.createElement('div');
  head.className = 'chart-head';
  head.innerHTML = '<span class="chart-title">' + t('diagnostics.lab.thr.title', { dir: t('diagnostics.lab.dir.' + direction) }) +
    '</span><span class="chart-sub">' + t('diagnostics.lab.thr.source.' + source) + '</span>';
  card.appendChild(head);
  if (result.series.length < 2) {
    host.appendChild(card);
    return;
  }
  const v = verdict(result);
  const line = document.createElement('div');
  line.className = 'lt-verdict';
  line.dataset.state = v.state;
  line.innerHTML = (v.icon ? '<span class="lt-icon" aria-hidden="true">' + v.icon + '</span>' : '') + '<span>' + v.text + '</span>';
  card.appendChild(line);
  renderCurrent(card, result);
  if (direction === 'close') renderRise(card, result);
  renderTable(card, result);
  host.appendChild(card);
}

/**
 * Render the explorer into `host`.
 * opts = { params, captures: { close?: samples[], open?: samples[] } }
 */
export function renderThresholdExplorer(host, opts) {
  const params = (opts && opts.params) || {};
  const captures = (opts && opts.captures) || {};
  host.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'lab-thresholds';
  const intro = document.createElement('p');
  intro.className = 'lt-intro';
  intro.textContent = t('diagnostics.lab.thr.intro');
  wrap.appendChild(intro);
  [['close', REFERENCE_CLOSE], ['open', REFERENCE_OPEN]].forEach(([direction, ref]) => {
    const own = captures[direction];
    const samples = own && own.length > 1 ? own : referenceSamples(ref);
    renderDirection(wrap, direction, own && own.length > 1 ? 'capture' : 'reference', samples, params);
  });
  host.appendChild(wrap);
}
