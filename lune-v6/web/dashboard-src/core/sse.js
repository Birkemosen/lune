// core/sse.js
//
// Transport: cheap GET /api/v1/revision on a slow cadence; full GET /api/v1/state
// only when data_revision or runtime_revision moves (or the user comes back to
// the tab). Temperatures typically change every few minutes — there is no need
// to hammer either endpoint at 1 Hz while idle.

import { startMock } from './mock.js';
import {
  setEntity, setLive, sampleHistory, addActivity, setI2cResult,
  shouldSuppressStateUpdate, msUntilStateUnsuppressed, getDashboardValue, subscribeDashboard,
  setDashboardValue, ev,
} from './store.js';
import { fetchHistory, fetchLogs, fetchPhysicsAlerts } from './api.js';
import { gkey } from '../utils/keys.js';
import { zoneLearningProgress } from '../utils/learning-progress.js';

let pollAbortController = null;
let historyRefreshTimer = null;
let physicsAlertTimer = null;
let logsRefreshTimer = null;
let revisionTimer = null;
let lastRevision = null;
let lastRuntimeRevision = null;
let learningPollTimer = null;
let postWriteRefreshTimer = null;
let backgroundSuspended = false;
/** True while a /state request is in flight. */
let stateFetchInFlight = false;
/** Coalesce: one more /state after the in-flight one finishes. */
let stateFetchQueued = false;

/** Idle revision probe. Learning uses its own 1 s /state poll while active. */
const REVISION_IDLE_MS = 10 * 1000;
/** Logs can lag a bit; still feels live without competing with /state. */
const LOGS_IDLE_MS = 10 * 1000;

function labOwnsHttp() {
  return !!getDashboardValue('motorLabBusy') || backgroundSuspended;
}

/**
 * Writes suppress /state application for ~2 s so optimistic UI is not clobbered.
 * The revision poll that lands inside that window is discarded entirely — so after
 * the window we must fetch once, or the UI stays on stale optimistic values
 * (empty BLE MAC, cleared fault, etc.) until the next unrelated revision bump.
 */
function schedulePostWriteRefresh() {
  if (postWriteRefreshTimer) clearTimeout(postWriteRefreshTimer);
  const delay = Math.max(50, msUntilStateUnsuppressed() + 50);
  postWriteRefreshTimer = setTimeout(() => {
    postWriteRefreshTimer = null;
    if (labOwnsHttp()) return;
    if (shouldSuppressStateUpdate()) {
      schedulePostWriteRefresh();
      return;
    }
    pollStateCycle();
  }, delay);
}

async function fetchStateOnce() {
  pollAbortController = new AbortController();

  const response = await fetch('/api/v1/state', {
    cache: 'no-store',
    signal: pollAbortController.signal,
  });

  if (response.status === 503) {
    throw new Error('State fetch busy');
  }

  if (!response.ok) {
    throw new Error('State fetch failed: ' + response.status);
  }

  return response.json();
}

function anyZoneLearning() {
  for (let zone = 1; zone <= 6; zone++) {
    if (zoneLearningProgress(zone).active) return true;
  }
  return false;
}

function syncLearningPoller() {
  const need = anyZoneLearning() && !labOwnsHttp();
  if (need && !learningPollTimer) {
    learningPollTimer = setInterval(() => {
      if (labOwnsHttp() || !anyZoneLearning()) {
        clearInterval(learningPollTimer);
        learningPollTimer = null;
        return;
      }
      pollStateCycle();
    }, 1000);
  } else if (!need && learningPollTimer) {
    clearInterval(learningPollTimer);
    learningPollTimer = null;
  }
}

/**
 * Apply a /state entity map. Skip null/undefined numeric overwrites so a
 * transient missing sensor reading cannot wipe the last good value (and paint
 * it as 0.00 via Number(null)).
 */
function applyStateMap(payload) {
  if (!payload || typeof payload !== 'object') return;
  if (shouldSuppressStateUpdate()) {
    schedulePostWriteRefresh();
    return;
  }
  for (const id in payload) {
    const patch = payload[id];
    if (!patch || typeof patch !== 'object') continue;
    const next = patch.value !== undefined ? patch.value
      : (patch.v !== undefined ? patch.v : undefined);
    if (next === null || next === undefined) {
      const prev = ev(id);
      // Keep last finite reading; still allow state/string updates below.
      if (prev != null && Number.isFinite(Number(prev))) {
        const rest = { ...patch };
        delete rest.value;
        delete rest.v;
        if (Object.keys(rest).length) setEntity(id, rest);
        continue;
      }
    }
    setEntity(id, patch);
  }
  sampleHistory(false);
  syncLearningPoller();
  setDashboardValue('stateTick', Date.now());
}

function onMessage(message) {
  if (!message) return;

  if (!message.type) {
    applyStateMap(message);
    return;
  }

  if (message.type === 'state') {
    applyStateMap(message.data);
    return;
  }

  if (message.type === 'log') {
    const text = message.data && (message.data.message || message.data.msg || message.data.text || '');
    if (!text) return;
    addActivity(text);
    if (String(text).indexOf('I2C_SCAN:') !== -1) setI2cResult(String(text));
  }
}

function ensureAuxiliaryPollers() {
  if (!labOwnsHttp()) fetchHistory();
  if (!historyRefreshTimer) {
    historyRefreshTimer = setInterval(() => {
      if (labOwnsHttp()) return;
      fetchHistory();
    }, 5 * 60 * 1000);
  }
  if (!labOwnsHttp()) fetchPhysicsAlerts();
  if (!physicsAlertTimer) {
    physicsAlertTimer = setInterval(() => {
      if (labOwnsHttp()) return;
      fetchPhysicsAlerts();
    }, 5 * 60 * 1000);
  }
  if (!labOwnsHttp()) fetchLogs();
  if (!logsRefreshTimer) {
    logsRefreshTimer = setInterval(() => {
      if (labOwnsHttp()) return;
      fetchLogs();
    }, LOGS_IDLE_MS);
  }
}

function pollStateCycle() {
  if (labOwnsHttp()) return;
  // Coalesce: never abort an in-flight /state — that was wiping the UI when
  // /revision (or learning) re-entered while a large snapshot was still loading.
  if (stateFetchInFlight) {
    stateFetchQueued = true;
    return;
  }
  stateFetchInFlight = true;
  stateFetchQueued = false;
  fetchStateOnce()
    .then((message) => {
      if (labOwnsHttp()) return;
      setLive(true);
      onMessage(message);
      ensureAuxiliaryPollers();
    })
    .catch((err) => {
      // AbortError only if we explicitly suspended (Motor Lab); ignore.
      if (err && err.name === 'AbortError') return;
      if (!labOwnsHttp()) setLive(false);
    })
    .finally(() => {
      stateFetchInFlight = false;
      pollAbortController = null;
      if (stateFetchQueued && !labOwnsHttp()) {
        stateFetchQueued = false;
        pollStateCycle();
      }
    });
}

async function pollRevision() {
  try {
    if (labOwnsHttp()) return;
    const response = await fetch('/api/v1/revision', { cache: 'no-store' });
    if (!response.ok) throw new Error('Revision fetch failed');
    const payload = await response.json();
    const data = payload && payload.data;
    const revision = data && data.data_revision;
    const runtimeRevision = data && data.runtime_revision;
    // Uptime only — do NOT raise stateTick here. A full repaint on every
    // revision poll was resetting climate/forms against incomplete store state.
    if (data && data.uptime_s != null) {
      const next = Number(data.uptime_s);
      const prev = Number(ev(gkey.uptime));
      if (!Number.isFinite(prev) || prev !== next) {
        setEntity(gkey.uptime, { value: next });
        setDashboardValue('uptimeTick', Date.now());
      }
    }
    const dataChanged = lastRevision === null || revision !== lastRevision;
    const runtimeChanged =
      runtimeRevision != null &&
      (lastRuntimeRevision === null || runtimeRevision !== lastRuntimeRevision);
    if (dataChanged || runtimeChanged) {
      lastRevision = revision;
      if (runtimeRevision != null) lastRuntimeRevision = runtimeRevision;
      pollStateCycle();
    }
    setLive(true);
  } catch {
    if (!labOwnsHttp()) setLive(false);
  }
}

function suspendBackgroundPolling_() {
  backgroundSuspended = true;
  if (pollAbortController) {
    pollAbortController.abort();
    pollAbortController = null;
  }
  stateFetchInFlight = false;
  stateFetchQueued = false;
  if (learningPollTimer) {
    clearInterval(learningPollTimer);
    learningPollTimer = null;
  }
}

function resumeBackgroundPolling_() {
  backgroundSuspended = false;
  pollStateCycle();
}

/** Immediate revision check (user focus / visibility / post-interaction). */
export function refreshDashboard() {
  if (labOwnsHttp()) return;
  pollRevision();
}

function onUserPresence() {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
  refreshDashboard();
}

export function connect() {
  const cfg = window.LV6_DASHBOARD_CONFIG;

  if (cfg && cfg.mock) {
    startMock();
    return;
  }

  subscribeDashboard('motorLabBusy', () => {
    if (getDashboardValue('motorLabBusy')) suspendBackgroundPolling_();
    else resumeBackgroundPolling_();
  });

  subscribeDashboard('pendingWrites', () => {
    if (getDashboardValue('pendingWrites') === 0) schedulePostWriteRefresh();
  });

  pollStateCycle();
  if (!revisionTimer) revisionTimer = setInterval(pollRevision, REVISION_IDLE_MS);

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onUserPresence();
    });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', onUserPresence);
    window.addEventListener('pageshow', onUserPresence);
  }
}
