import { es, ev, isEntityOn } from '../core/store.js';
import { t } from '../core/i18n.js';
import { gkey, key } from './keys.js';
import { fmtUp } from './format.js';

/** Effective heating mode currently driving valves. */
export function effectiveHeatingMode() {
  const raw = String(es(gkey.effectiveHeatingMode) || es(gkey.heatingMode) || 'heat_pump').toLowerCase();
  return raw === 'normal' || raw === 'boiler' ? 'normal' : 'heat_pump';
}

/**
 * Richer zone status for Normal / Heat-pump control modes.
 * Falls back to the raw display-state label when mode-specific copy does not apply.
 */
export function zoneControlStatusLabel(zone, displayState) {
  const state = String(displayState || '').toUpperCase();
  if (!isEntityOn(key.enabled(zone)) || state === 'OFF') return t('state.off');
  if (state === 'FAULT') return t('common.fault');
  if (state === 'MANUAL') return t('state.manual');
  if (state === 'CALIBRATING') return t('state.calibrating');
  if (state === 'HEATING' || state === 'CALLING') return t('state.heating');
  if (state === 'OVERHEATED') return t('state.overheated');

  // IDLE / SATISFIED-class states — mode-specific wording.
  const mode = effectiveHeatingMode();
  const valve = Number(ev(key.valve(zone)));
  const base = Number(ev(gkey.hpBasePct));
  const floor = Number(ev(gkey.hpTrimFloorPct));
  const basePct = Number.isFinite(base) && base > 0 ? base : 60;
  const floorPct = Number.isFinite(floor) ? floor : 15;

  if (mode === 'normal') {
    if (!Number.isFinite(valve) || valve <= 2) return t('state.closedSetpoint');
    return t('state.idle');
  }

  // Heat pump
  if (!Number.isFinite(valve) || valve <= 2) return t('state.closedSetpoint');
  if (valve >= basePct - 5) return t('state.holdingFlow');
  if (valve > floorPct) return t('state.trimming');
  return t('state.holdingFlow');
}

/** Overview heat-demand line from published recommendation sensors. */
export function heatDemandSummaryLine() {
  const rec = String(es(gkey.heatDemandRecommendation) || 'hold').toLowerCase();
  const zone = Number(ev(gkey.heatDemandCriticalZone));
  const saturatedS = Number(ev(gkey.heatDemandSaturatedS)) || 0;
  if (rec === 'raise') {
    const zoneLabel = Number.isFinite(zone) && zone >= 1 ? `Z${zone | 0}` : 'zone';
    return t('overview.heatDemand.raise', {
      zone: zoneLabel,
      duration: fmtUp(saturatedS),
    });
  }
  if (rec === 'lower') return t('overview.heatDemand.lower');
  return t('overview.heatDemand.hold');
}

export function heatingModeSummary() {
  const mode = effectiveHeatingMode();
  const source = String(es(gkey.heatingModeSource) || 'local').toLowerCase() === 'touch'
    ? t('overview.mode.sourceTouch')
    : t('overview.mode.sourceLocal');
  const modeLabel = mode === 'normal' ? t('overview.mode.normal') : t('overview.mode.heatPump');
  return { modeLabel, source };
}
