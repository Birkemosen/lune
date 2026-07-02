// core/sse.js

import { startMock } from './mock.js';
import { setEntity, setLive, sampleHistory, addActivity, setI2cResult, shouldSuppressStateUpdate } from './store.js';
import { fetchHistory, fetchLogs } from './api.js';

let reconnectTimer = null;
let pollAbortController = null;
let historyRefreshTimer = null;
let logsRefreshTimer = null;
let eventSource = null;

async function fetchStateOnce() {
  if (pollAbortController) {
    pollAbortController.abort();
  }

  pollAbortController = new AbortController();

  const response = await fetch('/api/hv6/v1/state', {
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

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 1000);
}

function ensureAuxiliaryPollers() {
  // Fetch history on initial connection and then every 5 minutes.
  fetchHistory();
  if (!historyRefreshTimer) {
    historyRefreshTimer = setInterval(fetchHistory, 5 * 60 * 1000);
  }
  // Live device logs: poll fast (~3 s) so the Logs view feels live.
  fetchLogs();
  if (!logsRefreshTimer) {
    logsRefreshTimer = setInterval(fetchLogs, 3000);
  }
}

function pollStateCycle() {
  fetchStateOnce()
    .then((message) => {
      setLive(true);
      onMessage(message);
      ensureAuxiliaryPollers();
      scheduleReconnect();
    })
    .catch(() => {
      setLive(false);
      scheduleReconnect();
    });
}

function connectEventSource() {
  if (!window.EventSource || eventSource) return false;

  let handledHello = false;
  eventSource = new EventSource('/api/hv6/v1/events');
  eventSource.addEventListener('hello', () => {
    handledHello = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    pollStateCycle();
  });
  eventSource.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      // Ignore malformed future events; the polling path remains authoritative.
    }
  };
  eventSource.onerror = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (!handledHello) pollStateCycle();
  };
  return true;
}

export function connect() {
  const cfg = window.HV6_DASHBOARD_CONFIG;

  if (cfg && cfg.mock) {
    startMock();
    return;
  }

  if (!connectEventSource()) pollStateCycle();
}
