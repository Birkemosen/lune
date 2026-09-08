import { component, subscribe } from '../../core/component.js';
import { ev, es, isEntityOn, subscribeDashboard, zoneTag } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { injectStyle } from '../../core/style.js';
import { key, gkey } from '../../utils/keys.js';
import { subscribeLanguage, t } from '../../core/i18n.js';

const ZONES = 6;

const COLOR_DISABLED = 'var(--flow-disabled)';
const COLOR_EMPTY = 'var(--flow-unknown)';
const COLOR_FLOW_ACTIVE = 'var(--accent)';
const COLOR_RETURN = 'var(--flow-return)';
const COLOR_ZONE_ON = 'var(--text-strong)';
const COLOR_ZONE_OFF = 'var(--flow-disabled)';
const COLOR_FRIENDLY_ON = 'var(--flow-label)';
const COLOR_FRIENDLY_OFF = 'var(--flow-disabled)';
const COLOR_COL_HEAD = 'var(--flow-label)';
const COLOR_DT_LABEL = 'var(--flow-label)';
const COLOR_DT_LOW = 'var(--flow-return)';
const COLOR_DT_OK = '#66BB6A';
const COLOR_DT_HIGH = '#FF6361';

const DESKTOP = {
  w: 1160, h: 372,
  boxX: 440, boxY: 26, boxW: 280, boxH: 90,
  srcY: 116, fanY: 168, zoneY: 262,
  zoneXs: [92, 286, 480, 674, 868, 1062],
  srcSpread: 15, bgDstHW: 28, srcHW: 7,
};

const MOBILE = {
  w: 760, h: 424,
  boxX: 26, boxY: 148, boxW: 168, boxH: 92,
  srcX: 196, endX: 386, nameX: 446, midY: 190,
  zoneYs: [56, 120, 184, 248, 312, 376],
  spread: 10, bgDstHW: 15, srcHW: 4,
};

const css = `
.flow-wrap {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  background: var(--panel-bg-vibrant);
  backdrop-filter: blur(16px) saturate(1.18);
}

.flow-svg {
  width: 100%;
  height: auto;
  display: block;
}

.flow-svg-mobile { display: none; }

.flow-zone-hit {
  transition: opacity .2s ease;
}

.flow-ribbon {
  transition: d .6s ease, opacity .35s ease;
}

.flow-track {
  fill: none;
  stroke: var(--flow-track);
  stroke-width: 2.25;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  transition: opacity .25s ease, stroke-dasharray .25s ease;
}

.flow-metric {
  font-family: var(--mono);
  font-weight: 800;
}

@media (max-width: 760px) {
  .flow-svg-desktop { display: none; }
  .flow-svg-mobile { display: block; }
}
`;

injectStyle('flow-diagram', css);

function compactFriendlyName(zone, limit) {
  const text = String(zoneTag(zone) || '').trim();
  if (!text) return '';
  const upper = text.toUpperCase();
  return upper.length > limit ? upper.slice(0, Math.max(1, limit - 1)) + '…' : upper;
}

function parseProbeIndex(label) {
  if (!label) return null;
  const match = String(label).match(/(\d+)/);
  if (!match) return null;
  const probe = Number(match[1]);
  return Number.isFinite(probe) && probe >= 1 && probe <= 8 ? probe : null;
}

function flowColorByPercent(pct, enabled) {
  if (!enabled) return COLOR_DISABLED;
  if (pct == null || Number.isNaN(pct)) return COLOR_EMPTY;
  return pct > 0 ? COLOR_FLOW_ACTIVE : COLOR_FRIENDLY_ON;
}

function bgDefs(layout) {
  const dir = layout === 'desktop' ? '0 1' : '1 0';
  const p = [];
  p.push('<defs>');
  for (let z = 1; z <= ZONES; z++) {
    p.push('<linearGradient id="' + layout + '-rg' + z + '" x1="0" y1="0" x2="' + dir.split(' ')[0] + '" y2="' + dir.split(' ')[1] + '">');
    p.push('<stop id="' + layout + '-rgs' + z + '" offset="0%" stop-color="var(--accent)" stop-opacity=".96"/>');
    p.push('<stop id="' + layout + '-rga' + z + '" offset="100%" stop-color="var(--accent)" stop-opacity=".7"/>');
    p.push('</linearGradient>');
  }
  p.push('</defs>');
  return p.join('');
}

function desktopRoute(zIdx) {
  const x0 = DESKTOP.boxX + DESKTOP.boxW / 2 + (zIdx - 2.5) * DESKTOP.srcSpread;
  const x1 = DESKTOP.zoneXs[zIdx];
  return 'M' + x0.toFixed(1) + ' ' + DESKTOP.srcY +
    ' C' + x0.toFixed(1) + ' ' + DESKTOP.fanY + ' ' + x1.toFixed(1) + ' ' + (DESKTOP.fanY + 34) + ' ' + x1.toFixed(1) + ' ' + (DESKTOP.zoneY - 20);
}

function mobileRoute(zIdx) {
  const y0 = MOBILE.midY + (zIdx - 2.5) * MOBILE.spread;
  const y1 = MOBILE.zoneYs[zIdx];
  const dx = MOBILE.endX - MOBILE.srcX;
  return 'M' + MOBILE.srcX + ' ' + y0.toFixed(1) +
    ' C' + (MOBILE.srcX + dx * 0.34) + ' ' + y0.toFixed(1) + ' ' + (MOBILE.srcX + dx * 0.70) + ' ' + y1.toFixed(1) + ' ' + MOBILE.endX + ' ' + y1.toFixed(1);
}

function desktopRibbon(zIdx, hwSrc, hwDst) {
  const x0 = DESKTOP.boxX + DESKTOP.boxW / 2 + (zIdx - 2.5) * DESKTOP.srcSpread;
  const y0 = DESKTOP.srcY;
  const x1 = DESKTOP.zoneXs[zIdx];
  const y1 = DESKTOP.zoneY - 20;
  const c1y = DESKTOP.fanY;
  const c2y = DESKTOP.fanY + 34;
  return 'M' + (x0 - hwSrc).toFixed(1) + ' ' + y0 +
    ' C' + (x0 - hwSrc).toFixed(1) + ' ' + c1y + ' ' + (x1 - hwDst).toFixed(1) + ' ' + c2y + ' ' + (x1 - hwDst).toFixed(1) + ' ' + y1 +
    ' L' + (x1 + hwDst).toFixed(1) + ' ' + y1 +
    ' C' + (x1 + hwDst).toFixed(1) + ' ' + c2y + ' ' + (x0 + hwSrc).toFixed(1) + ' ' + c1y + ' ' + (x0 + hwSrc).toFixed(1) + ' ' + y0 +
    'Z';
}

function mobileRibbon(zIdx, hwSrc, hwDst) {
  const y0 = MOBILE.midY + (zIdx - 2.5) * MOBILE.spread;
  const y1 = MOBILE.zoneYs[zIdx];
  const dx = MOBILE.endX - MOBILE.srcX;
  const c1 = MOBILE.srcX + dx * 0.34;
  const c2 = MOBILE.srcX + dx * 0.70;
  return 'M' + MOBILE.srcX + ' ' + (y0 - hwSrc).toFixed(1) +
    ' C' + c1 + ' ' + (y0 - hwSrc).toFixed(1) + ' ' + c2 + ' ' + (y1 - hwDst).toFixed(1) + ' ' + MOBILE.endX + ' ' + (y1 - hwDst).toFixed(1) +
    ' L' + MOBILE.endX + ' ' + (y1 + hwDst).toFixed(1) +
    ' C' + c2 + ' ' + (y1 + hwDst).toFixed(1) + ' ' + c1 + ' ' + (y0 + hwSrc).toFixed(1) + ' ' + MOBILE.srcX + ' ' + (y0 + hwSrc).toFixed(1) +
    'Z';
}

function background(w, h, layout) {
  return '<rect width="' + w + '" height="' + h + '" rx="10" fill="var(--surface-raised)"/>';
}

function sourceBox(layout) {
  const g = layout === 'desktop' ? DESKTOP : MOBILE;
  const labelY = layout === 'desktop' ? g.boxY + 34 : g.boxY + 36;
  const valueY = layout === 'desktop' ? g.boxY + 74 : g.boxY + 76;
  return '<rect x="' + g.boxX + '" y="' + g.boxY + '" width="' + g.boxW + '" height="' + g.boxH + '" rx="7" fill="var(--flow-source-bg)" stroke="var(--accent)" stroke-width="2"/>' +
    '<text id="' + layout + '-fd-flow-label" x="' + (g.boxX + g.boxW / 2) + '" y="' + labelY + '" text-anchor="middle" font-size="' + (layout === 'desktop' ? 28 : 27) + '" font-weight="800" fill="var(--accent)" letter-spacing="2">' + t('overview.flowDiagram.flow') + '</text>' +
    '<text id="' + layout + '-fd-flow-temp" class="flow-metric" x="' + (g.boxX + g.boxW / 2) + '" y="' + valueY + '" text-anchor="middle" font-size="' + (layout === 'desktop' ? 40 : 37) + '" fill="var(--text-strong)">---</text>';
}

function desktopSvg() {
  const p = [];
  const W = DESKTOP.w, H = DESKTOP.h;
  const lineY = DESKTOP.zoneY - 20;
  p.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 ' + W + ' ' + (H - 5) + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">');
  p.push(bgDefs('desktop'));
  p.push(background(W, H, 'desktop'));
  p.push(sourceBox('desktop'));
  p.push('<text id="desktop-fd-ret-temp" x="' + (DESKTOP.boxX + DESKTOP.boxW + 24) + '" y="' + (DESKTOP.boxY + 28) + '" font-size="24" font-weight="800" fill="' + COLOR_RETURN + '" font-family="var(--mono)">' + t('overview.flowDiagram.returnShort') + ' ---</text>');
  p.push('<text id="desktop-fd-dt-label" x="' + (DESKTOP.boxX + DESKTOP.boxW + 24) + '" y="' + (DESKTOP.boxY + 54) + '" font-size="19" font-weight="800" fill="' + COLOR_DT_LABEL + '" letter-spacing="1.4">' + t('overview.flowDiagram.dt') + '</text>');
  p.push('<text id="desktop-fd-dt" x="' + (DESKTOP.boxX + DESKTOP.boxW + 24) + '" y="' + (DESKTOP.boxY + 86) + '" class="flow-metric" font-size="34" fill="var(--accent)">---</text>');

  for (let z = 1; z <= ZONES; z++) p.push('<path id="desktop-fd-track-' + z + '" class="flow-track" d="' + desktopRoute(z - 1) + '" opacity=".7"/>');
  for (let z = 1; z <= ZONES; z++) p.push('<path id="desktop-fd-path-' + z + '" class="flow-ribbon" d="' + desktopRibbon(z - 1, DESKTOP.srcHW, DESKTOP.bgDstHW) + '" fill="url(#desktop-rg' + z + ')" opacity="1"/>');

  p.push('<line x1="54" y1="' + lineY + '" x2="' + (W - 54) + '" y2="' + lineY + '" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');
  for (let z = 1; z <= ZONES; z++) {
    const x = DESKTOP.zoneXs[z - 1];
    p.push('<g class="flow-zone-hit">');
    p.push('<line id="desktop-fd-tick-' + z + '" x1="' + x + '" y1="' + (lineY - 10) + '" x2="' + x + '" y2="' + (lineY + 10) + '" stroke="var(--flow-track)" stroke-width="2"/>');
    p.push('<text id="desktop-fd-zn' + z + '" x="' + x + '" y="' + (lineY - 18) + '" text-anchor="middle" font-size="22" fill="' + COLOR_ZONE_ON + '" font-weight="800" letter-spacing="1.5">Z' + z + '</text>');
    p.push('<text id="desktop-fd-zf' + z + '" x="' + x + '" y="' + (lineY + 30) + '" text-anchor="middle" font-size="17.5" fill="' + COLOR_FRIENDLY_ON + '" font-weight="700" letter-spacing=".35">---</text>');
    p.push('<text id="desktop-fd-zsp' + z + '" x="' + x + '" y="' + (lineY + 30) + '" text-anchor="middle" font-size="15.5" fill="' + COLOR_FRIENDLY_OFF + '" font-weight="600" font-family="var(--mono)"></text>');
    p.push('<text id="desktop-fd-zt' + z + '" x="' + x + '" y="' + (lineY + 60) + '" text-anchor="middle" class="flow-metric" font-size="24" fill="var(--text-strong)">---°C</text>');
    p.push('<text id="desktop-fd-zv' + z + '" x="' + (x - 40) + '" y="' + (lineY + 90) + '" text-anchor="middle" class="flow-metric" font-size="20" fill="' + COLOR_FRIENDLY_ON + '">---%</text>');
    p.push('<text id="desktop-fd-zr' + z + '" x="' + (x + 40) + '" y="' + (lineY + 90) + '" text-anchor="middle" class="flow-metric" font-size="20" fill="' + COLOR_RETURN + '">---</text>');
    p.push('</g>');
  }
  p.push('</svg>');
  return p.join('');
}

function mobileSvg() {
  const p = [];
  const W = MOBILE.w, H = MOBILE.h;
  p.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">');
  p.push(bgDefs('mobile'));
  p.push(background(W, H, 'mobile'));
  p.push(sourceBox('mobile'));

  for (let z = 1; z <= ZONES; z++) p.push('<path id="mobile-fd-track-' + z + '" class="flow-track" d="' + mobileRoute(z - 1) + '" opacity=".7"/>');
  for (let z = 1; z <= ZONES; z++) p.push('<path id="mobile-fd-path-' + z + '" class="flow-ribbon" d="' + mobileRibbon(z - 1, MOBILE.srcHW, MOBILE.bgDstHW) + '" fill="url(#mobile-rg' + z + ')" opacity="1"/>');
  p.push('<rect x="' + (MOBILE.boxX + 6) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 10) + '" width="' + (MOBILE.boxW - 12) + '" height="84" rx="8" fill="var(--flow-source-bg)" stroke="var(--flow-return)" stroke-opacity=".7"/>');
  p.push('<text id="mobile-fd-ret-temp" x="' + (MOBILE.boxX + MOBILE.boxW / 2) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 36) + '" text-anchor="middle" font-size="21" font-weight="800" fill="' + COLOR_RETURN + '" font-family="var(--mono)">' + t('overview.flowDiagram.returnShort') + ' ---</text>');
  p.push('<text id="mobile-fd-dt-label" x="' + (MOBILE.boxX + MOBILE.boxW / 2) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 56) + '" text-anchor="middle" font-size="15.5" font-weight="800" fill="' + COLOR_DT_LABEL + '" letter-spacing=".7">' + t('overview.flowDiagram.dt') + '</text>');
  p.push('<text id="mobile-fd-dt" x="' + (MOBILE.boxX + MOBILE.boxW / 2) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 82) + '" text-anchor="middle" class="flow-metric" font-size="27" fill="var(--accent)">---</text>');
  p.push('<line x1="' + MOBILE.endX + '" y1="38" x2="' + MOBILE.endX + '" y2="' + (H - 28) + '" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');

  p.push('<text id="mobile-fd-temp-head" x="506" y="34" font-size="17" fill="' + COLOR_COL_HEAD + '" font-weight="700" letter-spacing="1">' + t('overview.graph.layers.temp').toUpperCase() + '</text>');
  p.push('<text id="mobile-fd-flow-head" x="592" y="34" font-size="17" fill="' + COLOR_COL_HEAD + '" font-weight="700" letter-spacing="1">' + t('overview.flowDiagram.flow') + '</text>');
  p.push('<text id="mobile-fd-ret-head" x="678" y="34" font-size="17" fill="' + COLOR_COL_HEAD + '" font-weight="700" letter-spacing="1">' + t('overview.flowDiagram.returnShort') + '</text>');
  for (let z = 1; z <= ZONES; z++) {
    const y = MOBILE.zoneYs[z - 1];
    p.push('<line id="mobile-fd-tick-' + z + '" x1="' + (MOBILE.endX - 10) + '" y1="' + y + '" x2="' + (MOBILE.endX + 10) + '" y2="' + y + '" stroke="var(--flow-track)" stroke-width="2"/>');
    p.push('<text id="mobile-fd-zn' + z + '" x="' + (MOBILE.endX - 14) + '" y="' + (y + 7) + '" text-anchor="end" font-size="21" fill="' + COLOR_ZONE_ON + '" font-weight="800" letter-spacing="1.1">Z' + z + '</text>');
    p.push('<text id="mobile-fd-zf' + z + '" x="' + MOBILE.nameX + '" y="' + (y - 12) + '" text-anchor="middle" font-size="17" fill="' + COLOR_FRIENDLY_ON + '" font-weight="700" letter-spacing=".3">---</text>');
    p.push('<text id="mobile-fd-zsp' + z + '" x="' + MOBILE.nameX + '" y="' + (y + 12) + '" text-anchor="middle" font-size="15.5" fill="' + COLOR_FRIENDLY_OFF + '" font-weight="600" font-family="var(--mono)"></text>');
    p.push('<text id="mobile-fd-zt' + z + '" x="506" y="' + (y + 7) + '" class="flow-metric" font-size="22" fill="var(--text-strong)">---°C</text>');
    p.push('<text id="mobile-fd-zv' + z + '" x="592" y="' + (y + 7) + '" class="flow-metric" font-size="22" fill="' + COLOR_FRIENDLY_ON + '">---%</text>');
    p.push('<text id="mobile-fd-zr' + z + '" x="678" y="' + (y + 7) + '" class="flow-metric" font-size="22" fill="' + COLOR_RETURN + '">---</text>');
  }
  p.push('</svg>');
  return p.join('');
}

const template = () => '<div class="flow-wrap" role="img" aria-label="' + t('overview.flowDiagram.flow') + '">' + desktopSvg() + mobileSvg() + '</div>';

component({
  tag: 'flow-diagram',
  render: template,
  onMount(ctx, el) {
    const layouts = ['desktop', 'mobile'];
    const refs = {};
    layouts.forEach((layout) => {
      refs[layout] = {
        flowEl: el.querySelector('#' + layout + '-fd-flow-temp'),
        flowLabelEl: el.querySelector('#' + layout + '-fd-flow-label'),
        retEl: el.querySelector('#' + layout + '-fd-ret-temp'),
        dtLabelEl: el.querySelector('#' + layout + '-fd-dt-label'),
        dtEl: el.querySelector('#' + layout + '-fd-dt'),
        zones: new Array(ZONES + 1)
      };
      for (let zone = 1; zone <= ZONES; zone++) {
        refs[layout].zones[zone] = {
          textTemp: el.querySelector('#' + layout + '-fd-zt' + zone),
          textSetpoint: el.querySelector('#' + layout + '-fd-zsp' + zone),
          textFlow: el.querySelector('#' + layout + '-fd-zv' + zone),
          textRet: el.querySelector('#' + layout + '-fd-zr' + zone),
          label: el.querySelector('#' + layout + '-fd-zn' + zone),
          friendly: el.querySelector('#' + layout + '-fd-zf' + zone),
          track: el.querySelector('#' + layout + '-fd-track-' + zone),
          tick: el.querySelector('#' + layout + '-fd-tick-' + zone),
          path: el.querySelector('#' + layout + '-fd-path-' + zone)
        };
      }
    });

    function setText(node, value) {
      if (node) node.textContent = value;
    }

    function updateLayout(layout, flow, ret, dt, dtColor) {
      const r = refs[layout];
      setText(r.flowLabelEl, t('overview.flowDiagram.flow'));
      setText(r.flowEl, fmtT(flow));
      setText(r.retEl, t('overview.flowDiagram.returnShort') + ' ' + fmtT(ret));
      setText(r.dtLabelEl, t('overview.flowDiagram.dt'));
      setText(r.dtEl, dt == null ? '---' : dt.toFixed(1) + '°C');
      if (r.dtEl) r.dtEl.setAttribute('fill', dtColor);
    }

    function updateStaticLabels() {
      setText(el.querySelector('#mobile-fd-temp-head'), t('overview.graph.layers.temp').toUpperCase());
      setText(el.querySelector('#mobile-fd-flow-head'), t('overview.flowDiagram.flow'));
      setText(el.querySelector('#mobile-fd-ret-head'), t('overview.flowDiagram.returnShort'));
    }

    function updateZoneLayout(layout, zone, data) {
      const zoneRefs = refs[layout].zones[zone];
      if (!zoneRefs) return;

      const { enabled, pct, temp, setpoint, valve, returnTemp, hasReturn } = data;
      const tag = compactFriendlyName(zone, layout === 'desktop' ? 12 : 11);
      const tempStr = fmtT(temp);
      const setpointStr = setpoint != null ? fmtT(setpoint) : '';

      setText(zoneRefs.label, 'Z' + zone);
      setText(zoneRefs.friendly, layout === 'desktop'
        ? ((tag || '---') + (setpointStr ? ' (' + setpointStr + ')' : ''))
        : (tag || '---'));
      setText(zoneRefs.textTemp, tempStr);
      setText(zoneRefs.textSetpoint, layout === 'desktop' ? '' : (setpointStr ? '(' + setpointStr + ')' : ''));
      setText(zoneRefs.textFlow, fmtV(valve));
      setText(zoneRefs.textRet, hasReturn ? fmtT(returnTemp) : '---');

      zoneRefs.label.setAttribute('fill', enabled ? COLOR_ZONE_ON : COLOR_ZONE_OFF);
      zoneRefs.friendly.setAttribute('fill', enabled ? COLOR_FRIENDLY_ON : COLOR_FRIENDLY_OFF);
      zoneRefs.textSetpoint.setAttribute('fill', enabled ? COLOR_FRIENDLY_ON : COLOR_FRIENDLY_OFF);
      zoneRefs.textFlow.setAttribute('fill', flowColorByPercent(pct, enabled));
      zoneRefs.textRet.setAttribute('fill', hasReturn && enabled ? COLOR_RETURN : COLOR_EMPTY);

      const flowing = enabled && pct != null && pct > 0;
      zoneRefs.track.setAttribute('opacity', enabled ? '.78' : '.38');
      zoneRefs.track.setAttribute('stroke-dasharray', enabled ? 'none' : '5 7');
      zoneRefs.tick.setAttribute('stroke', flowing ? COLOR_FLOW_ACTIVE : 'var(--flow-track)');
      zoneRefs.tick.setAttribute('stroke-width', flowing ? '3' : '2');

      const path = zoneRefs.path;
      if (!flowing) {
        path.setAttribute('opacity', '0');
      } else {
        const cfg = layout === 'desktop' ? DESKTOP : MOBILE;
        const dstHW = Math.max(2.5, pct * cfg.bgDstHW);
        const srcHW = Math.max(1.3, pct * cfg.srcHW);
        path.setAttribute('d', layout === 'desktop'
          ? desktopRibbon(zone - 1, srcHW, dstHW)
          : mobileRibbon(zone - 1, srcHW, dstHW));
        path.setAttribute('fill', 'url(#' + layout + '-rg' + zone + ')');
        path.setAttribute('opacity', '.96');
      }
    }

    function update() {
      const flow = ev(gkey.flow);
      const ret = ev(gkey.ret);
      const dt = flow != null && ret != null ? Number(flow) - Number(ret) : null;
      const dtColor = dt == null ? COLOR_DT_LOW : (dt < 3 ? COLOR_DT_LOW : dt > 8 ? COLOR_DT_HIGH : COLOR_DT_OK);
      layouts.forEach((layout) => updateLayout(layout, flow, ret, dt, dtColor));

      for (let zone = 1; zone <= ZONES; zone++) {
        const temp = ev(key.temp(zone));
        const setpoint = ev(key.setpoint(zone));
        const valve = ev(key.valve(zone));
        const enabled = isEntityOn(key.enabled(zone));
        const source = String(es(key.tempSource(zone)) || 'Local Probe');
        const probe = parseProbeIndex(es(key.probe(zone)) || '');
        const returnTemp = probe ? ev(key.probeTemp(probe)) : null;
        const hasReturn = source !== 'Local Probe' && returnTemp != null && !Number.isNaN(Number(returnTemp));
        const pct = valve != null ? Math.max(0, Math.min(100, Number(valve))) / 100 : null;
        const data = { enabled, pct, temp, setpoint, valve, returnTemp, hasReturn };
        layouts.forEach((layout) => updateZoneLayout(layout, zone, data));
      }
    }

    subscribe(gkey.flow, update);
    subscribe(gkey.ret, update);
    subscribeDashboard('zoneNames', update);
    for (let zone = 1; zone <= ZONES; zone++) {
      subscribe(key.temp(zone), update);
      subscribe(key.setpoint(zone), update);
      subscribe(key.valve(zone), update);
      subscribe(key.enabled(zone), update);
      subscribe(key.probe(zone), update);
      subscribe(key.tempSource(zone), update);
    }
    for (let probe = 1; probe <= 8; probe++) subscribe(key.probeTemp(probe), update);
    subscribeLanguage(() => { updateStaticLabels(); update(); });
    updateStaticLabels();
    update();
  }
});
