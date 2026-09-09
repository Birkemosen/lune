import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.help-external-ingest { display: grid; gap: 12px; }
.help-external-ingest .hei-tabs {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.help-external-ingest .hei-tab {
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
}
.help-external-ingest .hei-tab[aria-selected="true"] {
  border-color: var(--accent);
  color: var(--accent);
}
.help-external-ingest pre {
  margin: 0;
  padding: 12px;
  border: 1px solid var(--separator);
  border-radius: 8px;
  background: var(--surface-raised);
  overflow: auto;
  font-size: .72rem;
  line-height: 1.45;
  white-space: pre-wrap;
  font-family: var(--mono);
}
.help-external-ingest .hei-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.help-external-ingest .hei-copy {
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-weight: 700;
  cursor: pointer;
}
.help-external-ingest .hei-note {
  margin: 0;
  color: var(--text-muted);
  font-size: .84rem;
}
.help-external-ingest .hei-warn {
  margin: 0;
  color: var(--state-warn);
  font-size: .8rem;
}
`;

injectStyle('help-external-ingest', css);

function hostBase() {
  return window.location.origin || 'http://lune-v6.local';
}

function accessKeyHint() {
  return sessionStorage.getItem('hv6_local_access_key') || 'YOUR_LOCAL_ACCESS_KEY';
}

function shellyScript() {
  const base = hostBase();
  const key = accessKeyHint();
  return `// Shelly script — POST BTHome temps to Lune V6 (no zone number).
// 1) On V6: zone → External, set sensor_id to the BLU MAC.
// 2) Paste this on Mini PM / BLU Gateway (Gen3+). Adjust SENSOR_ID if needed.

let CONFIG = {
  v6_url: "${base}/api/v1/room-temperatures",
  access_key: "${key}",
  // Leave empty to use the BLU address from the event when available:
  sensor_id: "",
};

function postTemp(sensorId, tempC) {
  Shelly.call("HTTP.Request", {
    method: "POST",
    url: CONFIG.v6_url,
    headers: {
      "Content-Type": "application/json",
      "X-Lune-Local-Key": CONFIG.access_key,
      "X-Lune-CSRF": CONFIG.access_key,
    },
    body: JSON.stringify({
      sensor_id: sensorId,
      temp_c: tempC,
      observed_at_ms: Date.now(),
      producer_id: "shelly",
    }),
  });
}

// Example: call from a BTHome component status handler / timer with your sensor id + temp.
// postTemp("AA:BB:CC:DD:EE:FF", 21.5);
`;
}

function haYaml() {
  const base = hostBase();
  const key = accessKeyHint();
  return `# Home Assistant — rest_command + automation (no zone in payload).
# On V6: External source + sensor_id matching the entity you map below.

rest_command:
  lune_v6_room_temp:
    url: "${base}/api/v1/room-temperatures"
    method: POST
    headers:
      Content-Type: application/json
      X-Lune-Local-Key: "${key}"
      X-Lune-CSRF: "${key}"
    payload: >
      {"sensor_id":"{{ sensor_id }}","temp_c":{{ temp_c }},"observed_at_ms":{{ now().timestamp() * 1000 }},"producer_id":"homeassistant"}

automation:
  - alias: Lune V6 room temp forward
    trigger:
      - platform: state
        entity_id: sensor.living_room_temperature
    action:
      - service: rest_command.lune_v6_room_temp
        data:
          sensor_id: "sensor.living_room_temperature"
          temp_c: "{{ states('sensor.living_room_temperature') }}"
`;
}

function homeyScript() {
  const base = hostBase();
  const key = accessKeyHint();
  return `// HomeyScript — forward a Homey temperature capability to Lune V6.
// On V6: External + sensor_id (use Homey device id or a stable string you choose).

const V6_URL = "${base}/api/v1/room-temperatures";
const ACCESS_KEY = "${key}";
const SENSOR_ID = "homey-living-room"; // must match V6 bind
const TEMP_C = 21.5; // replace with capability value

await fetch(V6_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Lune-Local-Key": ACCESS_KEY,
    "X-Lune-CSRF": ACCESS_KEY,
  },
  body: JSON.stringify({
    sensor_id: SENSOR_ID,
    temp_c: TEMP_C,
    observed_at_ms: Date.now(),
    producer_id: "homey",
  }),
});
`;
}

const SCRIPTS = {
  shelly: shellyScript,
  ha: haYaml,
  homey: homeyScript,
};

export default component({
  tag: 'help-external-ingest',
  render: () => `
    <div class="ui-card help-external-ingest">
      <div class="ui-card-title" data-i18n="help.external.title">External room temperature</div>
      <p class="hei-note" data-i18n="help.external.intro">V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.</p>
      <p class="hei-warn" data-i18n="help.external.keyWarn">Scripts include your browser session key if set — treat it as a secret.</p>
      <div class="hei-tabs" role="tablist">
        <button type="button" class="hei-tab" data-tab="shelly" aria-selected="true">Shelly</button>
        <button type="button" class="hei-tab" data-tab="ha" aria-selected="false">Home Assistant</button>
        <button type="button" class="hei-tab" data-tab="homey" aria-selected="false">Homey</button>
      </div>
      <pre class="hei-code"></pre>
      <div class="hei-actions">
        <button type="button" class="hei-copy" data-i18n="help.external.copy">Copy</button>
      </div>
    </div>
  `,
  onMount(ctx, el) {
    let tab = 'shelly';
    const codeEl = el.querySelector('.hei-code');
    const tabs = el.querySelectorAll('.hei-tab');

    function paint() {
      tabs.forEach((btn) => btn.setAttribute('aria-selected', btn.dataset.tab === tab ? 'true' : 'false'));
      codeEl.textContent = SCRIPTS[tab]();
    }

    tabs.forEach((btn) => btn.addEventListener('click', () => {
      tab = btn.dataset.tab;
      paint();
    }));

    el.querySelector('.hei-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.textContent || '');
      } catch (_) {
        /* ignore */
      }
    });

    paint();
    localize(el);
    return subscribeLanguage(() => {
      localize(el);
      paint();
    });
  },
});
