// core/sse.js

import { startMock } from './mock.js';
import {
  setEntity, setLive, sampleHistory, addActivity, setI2cResult,
  shouldSuppressStateUpdate, getDashboardValue, subscribeDashboard,
} from './store.js';
import { fetchHistory, fetchLogs } from './api.js';
import { gkey } from '../utils/keys.js';

let pollAbortController = null;
let historyRefreshTimer = null;
let logsRefreshTimer = null;
let revisionTimer = null;
let lastRevision = null;
let backgroundSuspended = false;

function labOwnsHttp() {
  return !!getDashboardValue('motorLabBusy') || backgroundSuspended;
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

function applyStateMap(payload) {
  if (!payload || typeof payload !== 'object') return;
  if (shouldSuppressStateUpdate()) return;
  for (const id in payload) setEntity(id, payload[id]);
  sampleHistory(false);
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
    // Uptime is not a config revision. Ship it on this cheap poll so the
    // connectivity card can keep ticking without refetching the full snapshot.
    if (data && data.uptime_s != null) {
      setEntity(gkey.uptime, { value: Number(data.uptime_s) });
    }
    if (lastRevision === null || revision !== lastRevision) {
      lastRevision = revision;
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

  pollStateCycle();
  if (!revisionTimer) revisionTimer = setInterval(pollRevision, 3000);
}
