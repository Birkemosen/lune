(()=>{var g=new Set,n={section:"overview",loading:!1,error:"",overview:null,nodes:[],zones:[],forecast:null,commands:[],diagnostics:null};function w(e){return g.add(e),()=>g.delete(e)}function $(){for(let e of g)e(n)}function y(e){n.section=e,$()}function f(e){Object.assign(n,e),$()}var H=[["overview","Overview"],["zones","Zones"],["manifolds","Manifolds"],["forecast","Forecast"],["commands","Commands"],["settings","Settings"],["diagnostics","Diagnostics"]];function k(){var e,a,t,s,o,d;return`
    <header class="topbar">
      <nav class="top-menu">
        ${H.map(([r,u])=>`<button class="menu-link ${n.section===r?"active":""}" data-section="${r}">${u}</button>`).join("")}
      </nav>
      <div class="brand">
        <div class="brand-title">Lune Touch</div>
        <div class="brand-sub">House coordinator</div>
      </div>
      <div class="top-meta">
        <span class="meta-chip ${n.error?"warn":"ok"}">${n.error?"Attention":"Live"}</span>
        <span class="meta-chip">${(t=(a=(e=n.overview)==null?void 0:e.summary)==null?void 0:a.zones)!=null?t:0} zones</span>
        <span class="meta-chip">${(d=(o=(s=n.overview)==null?void 0:s.summary)==null?void 0:o.nodes)!=null?d:0} V6</span>
      </div>
    </header>`}function _(e){e.querySelectorAll("[data-section]").forEach(a=>{a.addEventListener("click",()=>y(a.dataset.section))})}var v="/api/lune-touch/v1";function I(e){if(e==="/overview")return{summary:{zones:18,nodes:3,calling:5,stale_nodes:1,comfort_avg_c:21.1,forecast_status:"stale",latest_command:"accepted"}};if(e==="/nodes")return{nodes:[{id:"v6-a",hostname:"lune-v6-a.local",ip:"192.168.1.51",firmware:"mock",reachable:!0,trust:2},{id:"v6-b",hostname:"lune-v6-b.local",ip:"192.168.1.52",firmware:"mock",reachable:!0,trust:2},{id:"v6-c",hostname:"lune-v6-c.local",ip:"192.168.1.53",firmware:"mock",reachable:!1,trust:1}]};if(e==="/zones"){let a=["Living","Kitchen","Bath","Hall","Office","Bedroom","Guest","Utility","Laundry","Workshop","Pantry","Landing","Kids west","Kids east","Ensuite","Basement","Garage","Spare"],t=["heat","idle","call","hold","idle","preheat","idle","heat","idle","call","idle","hold","idle","heat","call","stale","idle","unused"];return{count:18,zones:a.map((s,o)=>({room_id:`room-${String(o+1).padStart(2,"0")}`,name:s,node_index:Math.floor(o/6),zone_index:o%6,temperature_c:[21.3,20.9,22.2,20.1,20.8,19.4,19.8,18.9,18.7,17.6,18.1,20.3,20.5,20,21.8,null,12.4,null][o],setpoint_c:[21,21,22.5,20,21,19.5,20,19,18.5,18,18,20,20.5,20.5,22,18,12,null][o],status:t[o],fresh:t[o]!=="stale"}))}}return e==="/forecast"?{status:"stale",location:{mode:"manual",latitude:0,longitude:0},last_fetch_age_s:0,decisions:[{room_id:"room-01",offset_c:.4,peak_in_h:10,reason:"mock wind preload"}]}:e==="/commands"?{commands:[{request_id:"mock-forecast-1",source:"forecast",reason:"wind preload",node_index:0,zone_index:0,requested_offset_c:.4,accepted_offset_c:.4,result:"accepted",clamp_applied:!1}]}:e==="/diagnostics"?{heap:"watching",nodes:3,zones:18,ledger:1,screen:"overview-only",api:v}:{}}async function l(e){var s,o;if((s=window.LUNE_TOUCH_DASHBOARD_CONFIG)!=null&&s.mock)return I(e);let a=await fetch(v+e,{cache:"no-store"});if(!a.ok)throw new Error(`${e} failed: ${a.status}`);let t=await a.json();if(t&&t.ok===!1)throw new Error(((o=t.error)==null?void 0:o.message)||"API error");return t.data||t}async function i(){f({loading:!0,error:""});try{let[e,a,t,s,o,d]=await Promise.all([l("/overview"),l("/nodes"),l("/zones"),l("/forecast"),l("/commands"),l("/diagnostics")]);f({overview:e,nodes:a.nodes||[],zones:t.zones||[],forecast:s,commands:o.commands||[],diagnostics:d,loading:!1})}catch(e){f({loading:!1,error:e.message||String(e)})}}async function c(e,a={}){var s;if((s=window.LUNE_TOUCH_DASHBOARD_CONFIG)!=null&&s.mock)return{ok:!0};let t=await fetch(v+e,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(a)});if(!t.ok)throw new Error(`${e} failed: ${t.status}`);return t.json()}var p={scanNodes:()=>c("/nodes/scan"),addNode:e=>c("/nodes",e),removeNode:e=>c(`/nodes/${encodeURIComponent(e)}/remove`),saveZone:(e,a)=>c(`/zones/${encodeURIComponent(e)}`,a),setpointCommand:(e,a)=>c(`/zones/${encodeURIComponent(e)}/setpoint-command`,a),saveForecast:e=>c("/forecast/settings",e),fetchForecast:()=>c("/forecast/fetch")};var m=e=>e==null||Number.isNaN(e)?"--.- C":`${Number(e).toFixed(1)} C`,b=e=>`V6-${String.fromCharCode(65+Number(e||0))}`;function h(e){return e==="heat"||e==="call"||e==="preheat"?"ok":e==="stale"?"warn":e==="unused"?"muted":""}function R(e){return`<article class="zone-card ${h(e.status)}">
    <div class="zone-top"><strong>${e.name}</strong><span>${m(e.temperature_c)}</span></div>
    <div class="zone-bottom"><span>Set ${m(e.setpoint_c)}</span><span>${e.status}</span><span>${b(e.node_index)}</span></div>
  </article>`}function S(){var a;let e=((a=n.overview)==null?void 0:a.summary)||{};return`<section class="panel">
    <div class="stat-grid">
      <div class="stat"><span>Comfort</span><strong>${m(e.comfort_avg_c)}</strong></div>
      <div class="stat"><span>Zones</span><strong>${e.zones||0}</strong><em>${e.calling||0} calling</em></div>
      <div class="stat"><span>Manifolds</span><strong>${e.nodes||0}</strong><em>${e.stale_nodes||0} stale</em></div>
      <div class="stat"><span>Forecast</span><strong>${e.forecast_status||"unknown"}</strong><em>${e.latest_command||"no command"}</em></div>
    </div>
    <div class="section-head"><h2>House zones</h2><button class="btn" data-action="refresh">Refresh</button></div>
    <div class="zone-matrix">${n.zones.map(R).join("")}</div>
  </section>`}function z(){return`<section class="panel">
    <div class="section-head"><h2>Zone control</h2><span class="note">Expiring commands only. V6 clamps locally.</span></div>
    <div class="data-table">
      <div class="tr head"><span>Room</span><span>Current</span><span>Setpoint</span><span>Status</span><span>Source</span><span>Command</span></div>
      ${n.zones.map(e=>`<div class="tr">
        <span>${e.name}</span><span>${m(e.temperature_c)}</span><span>${m(e.setpoint_c)}</span><span class="${h(e.status)}">${e.status}</span><span>${b(e.node_index)} / Z${Number(e.zone_index)+1}</span>
        <span><button class="btn slim" data-command-room="${e.room_id}">+0.5 C / 45m</button></span>
      </div>`).join("")}
    </div>
  </section>`}function C(){return`<section class="panel">
    <div class="section-head"><h2>Manifolds</h2><button class="btn" data-action="scan">Scan</button></div>
    <div class="card-grid">${n.nodes.map(e=>`<article class="card">
      <h3>${e.id}</h3><p>${e.hostname||e.ip||"no address"}</p>
      <dl><dt>Firmware</dt><dd>${e.firmware||"-"}</dd><dt>Status</dt><dd class="${e.reachable?"ok":"warn"}">${e.reachable?"reachable":"stale"}</dd><dt>Trust</dt><dd>${e.trust}</dd></dl>
    </article>`).join("")}</div>
  </section>`}function E(){var a,t,s;let e=n.forecast||{};return`<section class="panel two-col">
    <div>
      <div class="section-head"><h2>Forecast</h2><button class="btn" data-action="forecast-fetch">Fetch now</button></div>
      <div class="card"><h3>Status</h3><p class="${e.status==="ok"?"ok":"warn"}">${e.status||"unknown"}</p><p>Location: ${((a=e.location)==null?void 0:a.mode)||"manual"} (${((t=e.location)==null?void 0:t.latitude)||0}, ${((s=e.location)==null?void 0:s.longitude)||0})</p></div>
      <div class="card"><h3>Location fallback</h3><p>Browser geolocation may seed these values; manual latitude/longitude remains durable fallback in Touch NVS.</p><button class="btn" data-action="geo">Use browser location</button></div>
    </div>
    <div class="card"><h3>Decisions</h3>${(e.decisions||[]).map(o=>`<p>${o.room_id}: +${o.offset_c} C, peak in ${o.peak_in_h}h</p>`).join("")||"<p>No active decisions</p>"}</div>
  </section>`}function N(){return`<section class="panel">
    <div class="section-head"><h2>Command ledger</h2><span class="note">Requested vs accepted/clamped values</span></div>
    <div class="data-table">
      <div class="tr head"><span>ID</span><span>Source</span><span>Reason</span><span>Target</span><span>Requested</span><span>Accepted</span><span>Result</span></div>
      ${n.commands.map(e=>`<div class="tr"><span>${e.request_id}</span><span>${e.source}</span><span>${e.reason}</span><span>${b(e.node_index)} / Z${Number(e.zone_index)+1}</span><span>${e.requested_offset_c}</span><span>${e.accepted_offset_c}</span><span class="${h(e.result==="accepted"?"heat":e.result)}">${e.result}</span></div>`).join("")}
    </div>
  </section>`}function A(){return`<section class="panel two-col">
    <div class="card"><h3>Register V6</h3><label>Hostname/IP<input class="input" id="node-host" placeholder="lune-v6-a.local"></label><button class="btn" data-action="add-node">Add node</button></div>
    <div class="card"><h3>Dashboard access</h3><p>Canonical URL is the device root: <strong>http://&lt;touch-ip&gt;/</strong>. The embedded dashboard does not depend on ESPHome's default dashboard UI.</p></div>
  </section>`}function L(){let e=n.diagnostics||{};return`<section class="panel">
    <div class="section-head"><h2>Diagnostics</h2><span class="note">${e.api||"/api/lune-touch/v1"}</span></div>
    <div class="card-grid">
      <div class="card"><h3>Coordinator</h3><p>${e.nodes||0} nodes, ${e.zones||0} zones, ${e.ledger||0} ledger records</p></div>
      <div class="card"><h3>Screen</h3><p>${e.screen||"overview-only"}</p></div>
      <div class="card"><h3>Heap</h3><p>${e.heap||"watching"}</p></div>
    </div>
  </section>`}function j(e){var a,t,s,o,d;(a=e.querySelector('[data-action="refresh"]'))==null||a.addEventListener("click",i),(t=e.querySelector('[data-action="scan"]'))==null||t.addEventListener("click",()=>p.scanNodes().then(i)),(s=e.querySelector('[data-action="forecast-fetch"]'))==null||s.addEventListener("click",()=>p.fetchForecast().then(i)),(o=e.querySelector('[data-action="geo"]'))==null||o.addEventListener("click",()=>{navigator.geolocation&&navigator.geolocation.getCurrentPosition(r=>{p.saveForecast({latitude:r.coords.latitude,longitude:r.coords.longitude,source:"browser"}).then(i)})}),(d=e.querySelector('[data-action="add-node"]'))==null||d.addEventListener("click",()=>{var u,x;let r=(x=(u=e.querySelector("#node-host"))==null?void 0:u.value)==null?void 0:x.trim();r&&p.addNode({hostname:r}).then(i)}),e.querySelectorAll("[data-command-room]").forEach(r=>{r.addEventListener("click",()=>p.setpointCommand(r.dataset.commandRoom,{offset_c:.5,ttl_s:2700,reason:"dashboard quick boost"}).then(i))})}var D=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");
:root {
  --accent:#ff8531; --blue:#7aa7ce; --bg:#00131d; --surface:#002f45; --card:#021d2b;
  --border:rgba(120,146,200,.24); --text:#fff; --text-strong:#fff4e6; --muted:rgba(247,233,221,.74);
  --ok:#79d17e; --warn:#ffa600; --danger:#ff6361; --disabled:#6e7e96;
  --font-ui:"Source Sans 3",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --font-display:"Montserrat",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
*{box-sizing:border-box} html{font-size:13px} body{margin:0;font-family:var(--font-ui);background:radial-gradient(1200px 720px at 92% -10%,rgba(255,133,49,.13),transparent 58%),radial-gradient(1100px 760px at 12% -8%,rgba(122,167,206,.11),transparent 62%),var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
button,input{font:inherit}.shell{width:min(1320px,100%);margin:0 auto;padding:18px}.topbar{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:18px;background:rgba(0,47,69,.34);box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 18px 38px rgba(0,0,0,.28)}
.top-menu{display:flex;flex-wrap:wrap;gap:7px}.menu-link,.btn{border:1px solid rgba(120,146,200,.30);background:rgba(124,155,208,.10);color:var(--text);border-radius:11px;padding:9px 11px;cursor:pointer;font-weight:700}.menu-link.active,.btn:hover{background:var(--accent);border-color:var(--accent);color:#00202e}.brand{text-align:center}.brand-title{font-family:var(--font-display);font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:var(--accent)}.brand-sub{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.8px}.top-meta{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.meta-chip{border:1px solid var(--border);background:rgba(124,155,208,.10);border-radius:14px;padding:7px 10px;font-weight:800}.meta-chip.ok,.ok{color:var(--ok)}.meta-chip.warn,.warn{color:var(--warn)}.muted{color:var(--disabled)}
.panel{margin-top:14px;border:1px solid var(--border);border-radius:18px;background:rgba(0,47,69,.26);box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 20px 48px rgba(0,0,0,.28);padding:18px}.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}h2,h3{font-family:var(--font-display);margin:0;color:var(--text-strong)}h2{font-size:1.24rem}h3{font-size:.84rem;text-transform:uppercase;letter-spacing:1.1px;color:var(--accent);margin-bottom:8px}.note{color:var(--muted)}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.stat,.card,.zone-card{border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,rgba(2,29,43,.96),rgba(2,23,35,.92));padding:14px}.stat span{display:block;color:var(--muted);text-transform:uppercase;font-size:.7rem;font-weight:800;letter-spacing:.8px}.stat strong{display:block;font-size:1.8rem;font-family:var(--font-display);margin-top:3px}.stat em{font-style:normal;color:var(--muted)}
.zone-matrix{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.zone-card{padding:9px 10px;border-radius:12px}.zone-card.ok{border-color:rgba(121,209,126,.42)}.zone-card.warn{border-color:rgba(255,166,0,.5)}.zone-top,.zone-bottom{display:flex;justify-content:space-between;gap:8px}.zone-top strong{font-size:1rem}.zone-top span{font-family:var(--font-display);font-weight:800}.zone-bottom{margin-top:6px;color:var(--muted);font-size:.82rem}.data-table{display:grid;gap:1px;overflow:auto;border:1px solid var(--border);border-radius:14px}.tr{display:grid;grid-template-columns:1.1fr .7fr .7fr .7fr .9fr 1fr;gap:10px;align-items:center;background:rgba(2,29,43,.84);padding:9px 11px;min-width:820px}.tr.head{background:rgba(255,133,49,.14);color:var(--text-strong);font-weight:800;text-transform:uppercase;font-size:.75rem}.card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.slim{padding:5px 8px;font-size:.82rem}.input{display:block;margin:8px 0 12px;width:100%;border:1px solid var(--border);background:rgba(124,155,208,.10);color:var(--text);border-radius:10px;padding:9px 10px}.error{margin-top:14px;border:1px solid rgba(255,99,97,.5);background:rgba(255,99,97,.12);border-radius:12px;padding:10px;color:#ffd9d9}
@media(max-width:900px){.topbar{grid-template-columns:1fr}.top-meta{justify-content:center}.top-menu{justify-content:center}.stat-grid,.card-grid,.two-col,.zone-matrix{grid-template-columns:1fr}}
`;function O(){return n.section==="zones"?z():n.section==="manifolds"?C():n.section==="forecast"?E():n.section==="commands"?N():n.section==="settings"?A():n.section==="diagnostics"?L():S()}function F(e){if(!document.getElementById("lt-style")){let t=document.createElement("style");t.id="lt-style",t.textContent=D,document.head.appendChild(t)}function a(){e.innerHTML=`<div class="shell">${k()}${n.error?`<div class="error">${n.error}</div>`:""}${O()}</div>`,_(e),j(e)}w(a),a(),i(),setInterval(i,5e3)}var q=document.getElementById("app");if(!q)throw new Error("Dashboard root #app not found");F(q);})();
