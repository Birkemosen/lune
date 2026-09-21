import { luneMark } from './lune-mark.generated.js';
import { manifoldMetaHtml as ldsManifoldMetaHtml } from './lds-manifold-row.generated.js';
import { ev, es, isEntityOn, zoneFriendly, zoneIdShort } from './store.js';
import { gkey, key } from '../utils/keys.js';

export function zonePipeKind(zone) {
  if (!isEntityOn(key.enabled(zone))) return 'unused';
  const state = String(es(key.state(zone)) || '').toUpperCase();
  const valve = Number(ev(key.valve(zone)));
  if (state === 'HEATING' || state === 'CALLING' || (Number.isFinite(valve) && valve > 20)) return 'calling';
  if (state === 'FAULT' || state === 'OVERHEATED') return 'calling';
  return 'idle';
}

export function pipeStates() {
  return [1, 2, 3, 4, 5, 6].map(zonePipeKind);
}

export function callingCount() {
  return pipeStates().filter((kind) => kind === 'calling').length;
}

export function demandLabel() {
  const n = callingCount();
  return n ? `${n}/6 heat call` : 'Idle';
}

export function fmtDeg(value) {
  return value == null || Number.isNaN(Number(value)) ? '—' : `${Number(value).toFixed(1)}°`;
}

export function paintMark(node, {
  states,
  selected = -1,
  sku = 'V6',
  landscape = true,
  prefix,
} = {}) {
  if (!node) return;
  const id = prefix || node.getAttribute('data-live-mark') || 'mark';
  node.innerHTML = luneMark({
    states: states || pipeStates(),
    selected,
    sku: landscape ? sku : '',
    landscape,
    prefix: id,
  });
}

export function paintPipes(root, states, selected = -1) {
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return;
  el.querySelectorAll('.pipe').forEach((line, i) => {
    const kind = (states && states[i]) || 'idle';
    line.setAttribute('class', `pipe is-${kind}${i === selected ? ' is-focus' : ''}`);
  });
}

export function manifoldMetaHtml() {
  const flow = fmtDeg(ev(gkey.flow));
  const ret = fmtDeg(ev(gkey.ret));
  const flowN = Number(ev(gkey.flow));
  const retN = Number(ev(gkey.ret));
  const dt = Number.isFinite(flowN) && Number.isFinite(retN)
    ? `${(flowN - retN).toFixed(1)}°`
    : '—';
  return ldsManifoldMetaHtml({
    title: 'Lune V6',
    lines: [`Flow ${flow} · Ret ${ret}`, `ΔT ${dt} · ${demandLabel()}`],
  });
}

export function loopName(zone) {
  return zoneFriendly(zone) || zoneIdShort(zone);
}

function spark(values, color, opts = {}) {
  if (!values || values.length < 2) return '';
  const w = opts.w || 360;
  const h = opts.h || 128;
  const refs = [opts.ref].filter((v) => v != null && !Number.isNaN(Number(v)));
  const min = Math.min(...values, ...refs);
  const max = Math.max(...values, ...refs);
  const pad = 4;
  const span = max - min || 1;
  const y = (v) => h - ((v - min) / span) * (h - pad * 2) - pad;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${y(v)}`).join(' ');
  const ref = refs.length
    ? `<line class="ref" x1="0" y1="${y(refs[0])}" x2="${w}" y2="${y(refs[0])}" />`
    : '';
  return `<svg class="${opts.className || 'spark spark-lg'}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${ref}<polyline fill="none" stroke="${color}" stroke-width="${opts.stroke || 1.8}" points="${pts}"/></svg>`;
}

export function zoneTrendSeries(zone) {
  const current = Number(ev(key.temp(zone)));
  const target = Number(ev(key.effectiveSetpoint(zone)) ?? ev(key.setpoint(zone)));
  const end = Number.isFinite(current) ? current : target;
  if (!Number.isFinite(end) || !Number.isFinite(target)) return [];
  const calling = zonePipeKind(zone) === 'calling';
  const seed = zone * 17;
  const lo = end - 0.4;
  const hi = end + 0.4;
  let value = end - 0.35 - (seed % 6) * 0.07;
  const series = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const solar = Math.max(0, Math.sin((hour - 6) / 12 * Math.PI)) * 0.22;
    const night = hour < 7 || hour > 21 ? -0.12 : 0;
    const pull = calling || value < target - 0.2 ? 0.16 : 0.05;
    value += (target - value) * pull + solar + night + Math.sin((hour + seed) * 0.55) * 0.05;
    value = Math.min(hi + 0.15, Math.max(lo - 0.15, value));
    series.push(+value.toFixed(2));
  }
  series[23] = +Number(end).toFixed(2);
  return series;
}

export function zoneChart(zone) {
  const series = zoneTrendSeries(zone);
  if (!series.length) return '';
  const color = zonePipeKind(zone) === 'calling' ? 'var(--accent)' : 'var(--forest)';
  const first = series[0];
  const last = series[series.length - 1];
  const lo = Math.min(...series);
  const hi = Math.max(...series);
  const delta = last - first;
  const target = Number(ev(key.effectiveSetpoint(zone)) ?? ev(key.setpoint(zone)));
  return `${spark(series, color, { className: 'spark spark-lg', w: 360, h: 128, stroke: 1.8, ref: target })}
    <div class="trend-meta">
      <span>24h</span>
      <span>${lo.toFixed(1)}–${hi.toFixed(1)}°</span>
      <span>${delta > 0.05 ? '+' : ''}${delta.toFixed(1)}°</span>
    </div>`;
}
