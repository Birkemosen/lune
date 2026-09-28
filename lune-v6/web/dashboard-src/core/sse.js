// core/sse.js

import { startMock } from './mock.js';
import {
  setEntity, setLive, sampleHistory, addActivity, setI2cResult,
  shouldSuppressStateUpdate, msUntilStateUnsuppressed, getDashboardValue, subscribeDashboard,
} from './store.js';
import { fetchHistory, fetchLogs } from './api.js';
import { gkey } from '../utils/keys.js';
import { zoneLearningProgress } from '../utils/learning-progress.js';

let pollAbortController = null;
let historyRefreshTimer = null;
let logsRefreshTimer = null;
let revisionTimer = null;
let lastRevision = null;
let lastRuntimeRevision = null;
let learningPollTimer = null;
let postWriteRefreshTimer = null;
let backgroundSuspended = false;

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
  if (pollAbortController) {
    pollAbortController.abort();
  }

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

function applyStateMap(payload) {
  if (!payload || typeof payload !== 'object') return;
  if (shouldSuppressStateUpdate()) {
    // Do not drop the refresh permanently — retry once the echo window ends.
    schedulePostWriteRefresh();
    return;
  }
  for (const id in payload) setEntity(id, payload[id]);
  sampleHistory(false);
  syncLearningPoller();
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
  // Fetch history on initial connection and then every 5 minutes.
  if (!labOwnsHttp()) fetchHistory();
  if (!historyRefreshTimer) {
    historyRefreshTimer = setInterval(() => {
      if (labOwnsHttp()) return;
      fetchHistory();
    }, 5 * 60 * 1000);
  }
  // Live device logs: poll fast (~3 s) so the Logs view feels live.
  if (!labOwnsHttp()) fetchLogs();
  if (!logsRefreshTimer) {
    logsRefreshTimer = setInterval(() => {
      if (labOwnsHttp()) return;
      fetchLogs();
    }, 3000);
  }
}

function pollStateCycle() {
  if (labOwnsHttp()) return;
  fetchStateOnce()
    .then((message) => {
      if (labOwnsHttp()) return;
      setLive(true);
      onMessage(message);
      ensureAuxiliaryPollers();
    })
    .catch(() => {
      if (!labOwnsHttp()) setLive(false);
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
    // Uptime is not a config revision. Ship it on this cheap poll so the
    // connectivity card can keep ticking without refetching the full snapshot.
    if (data && data.uptime_s != null) {
      setEntity(gkey.uptime, { value: Number(data.uptime_s) });
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

/** Abort in-flight background GETs so Motor Lab owns the HTTP worker. */
function suspendBackgroundPolling_() {
  backgroundSuspended = true;
  if (pollAbortController) {
    pollAbortController.abort();
    pollAbortController = null;
  }
  if (learningPollTimer) {
    clearInterval(learningPollTimer);
    learningPollTimer = null;
  }
}

function resumeBackgroundPolling_() {
  backgroundSuspended = false;
  // One immediate refresh so Overview/gauges catch up after a long capture.
  pollStateCycle();
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

  // When the last in-flight write settles, schedule a deferred /state pull so
  // optimistic values converge with the device after the echo-suppress window.
  subscribeDashboard('pendingWrites', () => {
    if (getDashboardValue('pendingWrites') === 0) schedulePostWriteRefresh();
  });

  pollStateCycle();
  // 1 s revision poll so learning progress (runtime_revision) reaches the UI
  // without waiting for a config write to bump data_revision.
  if (!revisionTimer) revisionTimer = setInterval(pollRevision, 1000);
}
