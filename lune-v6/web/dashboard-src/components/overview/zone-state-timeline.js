import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard, NZ } from '../../core/store.js';
import { key, gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// State palette
// Code → { label, color }
// Matches ZoneDisplayState enum in hv6_types.h
// 0xFF (255) = unknown/empty slot → transparent
// ========================================
const STATE_PALETTE = {
  0:   { labelKey: 'state.off',         color: 'var(--disabled)' },
  1:   { labelKey: 'state.manual',      color: 'var(--info)' },
  2:   { labelKey: 'state.calibrating', color: 'var(--warn)' },
  3:   { labelKey: 'state.waitCal',     color: 'var(--text-faint)' },
  4:   { labelKey: 'state.waitTemp',    color: 'var(--text-faint)' },
  5:   { labelKey: 'state.heating',     color: 'var(--accent)' },
  6:   { labelKey: 'state.idle',        color: 'var(--forest)' },
  7:   { labelKey: 'state.overheated',  color: 'var(--danger)' },
  255: { labelKey: '',                  color: 'transparent' },
};

const PAST_WINDOW_S   = 24 * 3600;  // measured history window
const TOTAL_WINDOW_S  = PAST_WINDOW_S;
const ROW_H      = 28;
const ROW_GAP    = 8;
const LABEL_W    = 72;
const AXIS_H     = 48;
const PAD_TOP    = 8;
const BAND_H     = 16;          // preheat-absorption band height
const BAND_GAP   = 10;          // gap between zone rows and the absorption band
const ABSORB_COLOR = 'var(--series-solar)';
const OBSERVED_BAR_H = 14;
const ABSORB_INDEX = NZ + 1;    // entry shape: [uptime_s, z0..z5, absorbing]
const ZONES_BOTTOM = PAD_TOP + NZ * (ROW_H + ROW_GAP) - ROW_GAP;
const BAND_Y       = ZONES_BOTTOM + BAND_GAP;
const CHART_H    = ZONES_BOTTOM + BAND_GAP + BAND_H + AXIS_H;

// ========================================
// CSS
// ========================================
const css = `
.timeline-card {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.timeline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.timeline-head::before { display:none; }
.timeline-head span {
  color: var(--text-faint);
  font-size: .72rem;
  font-weight: 750;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.timeline-head strong {
  margin-left: auto;
  color: var(--text-muted);
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.timeline-svg {
  width: 100%;
  display: block;
  border-radius: 0;
  overflow: visible;
  min-height: 280px;
}

.timeline-empty {
  color: var(--text-muted);
  font-size: .9rem;
  padding: 24px 0;
  text-align: left;
  letter-spacing: 0;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 14px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .8rem;
  color: var(--text-muted);
  letter-spacing: 0;
}

.tl-legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tl-legend-dot.expected {
  width: 16px;
  height: 5px;
  opacity: .55;
  border-radius: 999px;
}
`;

injectStyle('zone-state-timeline', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;

// ========================================
// SVG RENDERER
// ========================================

function renderTimeline(histData, currentUptimeS) {
  if (!histData || !histData.entries || histData.entries.length === 0) {
    return null;   // caller will show empty state
  }

  const entries = histData.entries;
  const uptime  = histData.uptime_s || currentUptimeS || 0;
  const nowEpoch = Number(Date.now() / 1000) | 0;

  // SVG viewBox: width is 1000 units (scalable), height fixed.
  const SVG_W    = 1000;
  const chartW   = SVG_W - LABEL_W;

  function relToX(rel_s) {
    const r = (rel_s + PAST_WINDOW_S) / TOTAL_WINDOW_S;
    return LABEL_W + Math.max(0, Math.min(1, r)) * chartW;
  }

  function tToRel(t_s) {
    return t_s - uptime;
  }

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + SVG_W + ' ' + CHART_H);
  svg.classList.add('timeline-svg');

  // ── Background strip ──────────────────────────────────────────
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', LABEL_W);
  bg.setAttribute('y', PAD_TOP);
  bg.setAttribute('width', chartW);
  bg.setAttribute('height', CHART_H - PAD_TOP - AXIS_H);
  bg.setAttribute('fill', 'transparent');
  bg.setAttribute('rx', '0');
  svg.appendChild(bg);

  const nowX = relToX(0);
  // ── Grid lines at 6 h intervals ───────────────────────────────
  const TICK_REL_S = [-24, -18, -12, -6, 0].map((h) => h * 3600);
  for (const rel of TICK_REL_S) {
    const x = relToX(rel);
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', PAD_TOP);
    line.setAttribute('x2', x);
    line.setAttribute('y2', CHART_H - AXIS_H);
    line.setAttribute('stroke', rel === 0 ? 'var(--series-solar)' : 'var(--separator)');
    line.setAttribute('stroke-width', '1');
    if (rel === 0) {
      line.setAttribute('stroke-dasharray', '3 4');
      line.setAttribute('opacity', '.7');
      line.setAttribute('vector-effect', 'non-scaling-stroke');
    }
    svg.appendChild(line);
  }

  svg.appendChild(svgElLike(ns, 'text', {
    x: nowX + 6,
    y: PAD_TOP + 14,
    'text-anchor': 'start',
    fill: 'var(--accent)',
    'font-size': '12',
    'font-family': 'var(--font-ui)',
    'font-weight': '650',
  }, 'now'));

  // ── Zone rows ─────────────────────────────────────────────────
  for (let zi = 0; zi < NZ; zi++) {
    const y = PAD_TOP + zi * (ROW_H + ROW_GAP);

    // Row background (subtle)
    const rowBg = document.createElementNS(ns, 'rect');
    rowBg.setAttribute('x', LABEL_W);
    rowBg.setAttribute('y', y);
    rowBg.setAttribute('width', chartW);
    rowBg.setAttribute('height', ROW_H);
    rowBg.setAttribute('fill', zi % 2 === 0
      ? 'var(--inset)'
      : 'transparent');
    svg.appendChild(rowBg);

    // Zone label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', LABEL_W - 8);
    label.setAttribute('y', y + ROW_H / 2 + 1);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', 'var(--text-muted)');
    label.setAttribute('font-size', '13');
    label.setAttribute('font-family', 'var(--font-ui)');
    label.setAttribute('font-weight', '650');
    label.textContent = 'Z' + (zi + 1);
    svg.appendChild(label);

    // Collect entries for this zone, filtered to the visible history window.
    // Each entry: [uptime_s, z0..z5], so zone zi is at index zi+1.
    const zEntries = entries
      .map((e) => ({ rel: tToRel(e[0]), state: e[zi + 1] }))
      .filter((e) => e.rel >= -PAST_WINDOW_S && e.rel <= 0);

    const drawSeg = (rel0, rel1, stateCode) => {
      if (stateCode === 255) return;  // unknown → skip
      const palette = STATE_PALETTE[stateCode] || STATE_PALETTE[255];
      if (palette.color === 'transparent') return;
      const x0 = relToX(rel0);
      const x1 = relToX(rel1);
      const w  = Math.max(1, x1 - x0);
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x0);
      rect.setAttribute('y', y + (ROW_H - OBSERVED_BAR_H) / 2);
      rect.setAttribute('width', w);
      rect.setAttribute('height', OBSERVED_BAR_H);
      rect.setAttribute('fill', palette.color);
      rect.setAttribute('rx', String(OBSERVED_BAR_H / 2));
      rect.setAttribute('opacity', '0.9');
      svg.appendChild(rect);
    };

    if (zEntries.length) {
      // Run-length encode and draw measured segments.
      let segStart = zEntries[0].rel;
      let segState = zEntries[0].state;

      for (let i = 1; i < zEntries.length; i++) {
        const cur = zEntries[i];
        if (cur.state !== segState) {
          drawSeg(segStart, cur.rel, segState);
          segStart = cur.rel;
          segState = cur.state;
        }
      }
      // Final measured segment extends to "now".
      drawSeg(segStart, 0, segState);
    }

  }

  // ── Preheat-absorption band ───────────────────────────────────
  // Spans the full time axis; filled where absorption was active so the user
  // can correlate episodes with zone activity above.
  {
    const bandBg = document.createElementNS(ns, 'rect');
    bandBg.setAttribute('x', LABEL_W);
    bandBg.setAttribute('y', BAND_Y);
    bandBg.setAttribute('width', chartW);
    bandBg.setAttribute('height', BAND_H);
    bandBg.setAttribute('fill', 'color-mix(in srgb, var(--series-solar) 12%, transparent)');
    bandBg.setAttribute('rx', '2');
    svg.appendChild(bandBg);

    const bandLabel = document.createElementNS(ns, 'text');
    bandLabel.setAttribute('x', LABEL_W - 8);
    bandLabel.setAttribute('y', BAND_Y + BAND_H / 2 + 1);
    bandLabel.setAttribute('text-anchor', 'end');
    bandLabel.setAttribute('dominant-baseline', 'middle');
    bandLabel.setAttribute('fill', 'var(--text-muted)');
    bandLabel.setAttribute('font-size', '12');
    bandLabel.setAttribute('font-family', 'var(--font-ui)');
    bandLabel.setAttribute('font-weight', '650');
    bandLabel.textContent = t('overview.timeline.absorb');
    svg.appendChild(bandLabel);

    const aEntries = entries
      .map((e) => ({ rel: tToRel(e[0]), on: e.length > ABSORB_INDEX ? e[ABSORB_INDEX] : 0 }))
      .filter((e) => e.rel >= -PAST_WINDOW_S && e.rel <= 0);

    if (aEntries.length) {
      const drawBand = (rel0, rel1) => {
        const x0 = relToX(rel0);
        const w = Math.max(1, relToX(rel1) - x0);
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', x0);
        rect.setAttribute('y', BAND_Y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', BAND_H);
        rect.setAttribute('fill', ABSORB_COLOR);
        rect.setAttribute('rx', '2');
        rect.setAttribute('opacity', '0.9');
        svg.appendChild(rect);
      };
      let segStart = aEntries[0].rel;
      let segOn = aEntries[0].on;
      for (let i = 1; i < aEntries.length; i++) {
        if (aEntries[i].on !== segOn) {
          if (segOn) drawBand(segStart, aEntries[i].rel);
          segStart = aEntries[i].rel;
          segOn = aEntries[i].on;
        }
      }
      if (segOn) drawBand(segStart, 0);
    }
  }

  // ── Time axis: every 2 hours, upright (readable at overview width) ──
  const AXIS_Y = CHART_H - AXIS_H + 22;
  const HOUR_S = 3600;
  const firstHourEpoch = Math.ceil((nowEpoch - PAST_WINDOW_S) / HOUR_S) * HOUR_S;
  const lastHourEpoch = Math.floor(nowEpoch / HOUR_S) * HOUR_S;
  const currentHourEpoch = Math.floor(nowEpoch / HOUR_S) * HOUR_S;
  for (let epoch = firstHourEpoch; epoch <= lastHourEpoch; epoch += HOUR_S) {
    const d = new Date(epoch * 1000);
    const hour = d.getHours();
    const isCurrent = epoch === currentHourEpoch;
    if (!isCurrent && hour % 2 !== 0) continue;
    const rel = epoch - nowEpoch;
    const x = relToX(rel);
    const lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('x', x);
    lbl.setAttribute('y', AXIS_Y);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('fill', isCurrent ? 'var(--accent)' : 'var(--text-muted)');
    lbl.setAttribute('font-size', '12');
    lbl.setAttribute('font-family', 'var(--font-ui)');
    lbl.setAttribute('font-weight', isCurrent ? '700' : '600');
    lbl.setAttribute('font-variant-numeric', 'tabular-nums lining-nums');
    lbl.setAttribute('font-feature-settings', '"tnum" 1, "lnum" 1');
    lbl.textContent = String(hour).padStart(2, '0');
    svg.appendChild(lbl);
  }

  return svg;
}

function svgElLike(ns, tag, attrs, text) {
  const node = document.createElementNS(ns, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (text != null) node.textContent = text;
  return node;
}

// ========================================
// LEGEND
// ========================================
function renderLegend(el) {
  el.innerHTML = '';
  const shown = [
    { code: 5, ...STATE_PALETTE[5] },
    { code: 6, ...STATE_PALETTE[6] },
    { code: 0, ...STATE_PALETTE[0] },
    { code: 1, ...STATE_PALETTE[1] },
    { code: 7, ...STATE_PALETTE[7] },
    { code: 2, ...STATE_PALETTE[2] },
  ];
  for (const item of shown) {
    const div = document.createElement('div');
    div.className = 'tl-legend-item';
    div.innerHTML =
      '<span class="tl-legend-dot" style="background:' + item.color + '"></span>' +
      (item.labelKey ? t(item.labelKey) : '');
    el.appendChild(div);
  }
  const absorb = document.createElement('div');
  absorb.className = 'tl-legend-item';
  absorb.innerHTML =
    '<span class="tl-legend-dot" style="background:' + ABSORB_COLOR + '"></span>' + t('overview.timeline.preheatAbsorption');
  el.appendChild(absorb);

}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-state-timeline',
  render: template,
  onMount(ctx, el) {
    const body   = el.querySelector('.tl-body');
    const legend = el.querySelector('.timeline-legend');

    renderLegend(legend);

    function update() {
      const hist = getDashboardValue('zoneStateHistory');
      const uptimeS = (() => {
        // Use wall-clock time if uptime not available from entity store.
        const raw = getDashboardValue && getDashboardValue('zoneStateHistory');
        return (raw && raw.uptime_s) || (Number(Date.now() / 1000) | 0);
      })();

      body.innerHTML = '';

      if (!hist || !hist.entries || hist.entries.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'timeline-empty';
        empty.textContent = t('overview.timeline.noHistory');
        body.appendChild(empty);
        return;
      }

      const svgEl = renderTimeline(hist, uptimeS);
      if (svgEl) {
        body.appendChild(svgEl);
      }
    }

    subscribeDashboard('zoneStateHistory', update);
    subscribeDashboard('zoneNames', update);
    subscribeLanguage(() => { localize(el); renderLegend(legend); update(); });
    subscribe(gkey.drivers, update);
    for (let zone = 1; zone <= NZ; zone++) {
      subscribe(key.enabled(zone), update);
      subscribe(key.state(zone), update);
      subscribe(key.temp(zone), update);
      subscribe(key.setpoint(zone), update);
      subscribe(key.preheatAdvance(zone), update);
    }
    localize(el);
    update();
  }
});
