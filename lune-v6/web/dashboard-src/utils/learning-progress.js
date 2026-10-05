import { ev, es } from '../core/store.js';
import { key } from './keys.js';
import { t } from '../core/i18n.js';

const PHASE_KEYS = {
  home: 'zone.learning.phase.home',
  open: 'zone.learning.phase.open',
  close: 'zone.learning.phase.close',
  done: 'zone.learning.phase.done',
  failed: 'zone.learning.phase.failed',
};

/** Phases that mean a learn cycle is in flight (incl. home at 0%). */
const LIVE_PHASES = new Set(['home', 'open', 'close', 'failed']);

/** Live motor-learning progress for a zone (0-based firmware → 1-based UI zone). */
export function zoneLearningProgress(zone) {
  const state = String(es(key.state(zone)) || '').toUpperCase();
  const pct = Math.max(0, Math.min(100, Number(ev(key.motorLearnPct(zone))) || 0));
  const phase = String(es(key.motorLearnPhase(zone)) || '');
  const sample = Number(ev(key.motorLearnSample(zone))) || 0;
  const need = Number(ev(key.motorLearnSamplesNeeded(zone))) || 0;
  // Relearn keeps prior stroke values, so zone state often stays IDLE/HEATING.
  // Trust learn_phase / in-progress pct, not only CALIBRATING.
  const active =
    state === 'CALIBRATING' ||
    LIVE_PHASES.has(phase) ||
    (pct > 0 && pct < 100);
  let label = t('zone.learning.calibrating');
  if (phase && PHASE_KEYS[phase]) {
    label = t(PHASE_KEYS[phase]);
    if ((phase === 'open' || phase === 'close') && need > 0) {
      label = t('zone.learning.phase.pass', {
        phase: label,
        sample: Math.min(sample + 1, need) || 1,
        need,
      });
    }
  }
  if (phase === 'done') label = t('zone.learning.phase.done');
  if (phase === 'failed') label = t('zone.learning.phase.failed');
  return { active, pct, phase, sample, need, label };
}
