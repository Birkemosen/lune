(()=>{var D=new Set,c={section:"overview",loading:!1,error:"",overview:null,nodes:[],zones:[],strategy:null,forecast:null,commands:[],diagnostics:null,scanResult:null};function B(e){return D.add(e),()=>D.delete(e)}function H(){for(let e of D)e(c)}function O(e){c.section=e,H()}function F(e){Object.assign(c,e),H()}var ie=[["overview","House"],["zones","Zones"],["manifolds","Manifolds"],["forecast","Weather"],["commands","Commands"],["settings","Settings"],["diagnostics","Diagnostics"]];function U(){var e,t,s,a,o,r;return`
    <header class="topbar">
      <div class="brand">
        <div class="brand-title">Lune Touch</div>
        <div class="brand-sub">House coordinator</div>
      </div>
      <nav class="top-menu">
        ${ie.map(([n,u])=>`<button class="menu-link ${c.section===n?"active":""}" data-section="${n}">${u}</button>`).join("")}
      </nav>
      <div class="top-meta">
        <span class="meta-chip ${c.error?"warn":"ok"}">${c.error?"Attention":"Live"}</span>
        <span class="meta-chip">${(s=(t=(e=c.overview)==null?void 0:e.summary)==null?void 0:t.zones)!=null?s:0} zones</span>
        <span class="meta-chip">${(r=(o=(a=c.overview)==null?void 0:a.summary)==null?void 0:o.nodes)!=null?r:0} V6</span>
      </div>
    </header>`}function Z(e){e.querySelectorAll("[data-section]").forEach(t=>{t.addEventListener("click",()=>O(t.dataset.section))})}var T="/api/lune-touch/v1";function de(e){if(e==="/overview")return{summary:{zones:18,nodes:3,calling:5,stale_nodes:1,comfort_avg_c:21.1,forecast_status:"stale",latest_command:"accepted"}};if(e==="/nodes")return{nodes:[{id:"v6-a",hostname:"lune-v6-a.local",ip:"192.168.1.51",firmware:"mock",pairing_fingerprint:"hv6-mock-a",reachable:!0,trust:2,trust_label:"trusted",last_success_host:"lune-v6-a.local",last_failure:"",health:{mapped_zones:6,fresh_zones:6,stale_zones:0,calling_zones:2,avg_temp_c:20.9,avg_setpoint_c:21},runtime:{active_zones:6,avg_valve_pct:28.5,flow_c:33.8,return_c:30.6,drivers_enabled:!0,motor_fault:!1,motor_current_ma:18.2}},{id:"v6-b",hostname:"lune-v6-b.local",ip:"192.168.1.52",firmware:"mock",pairing_fingerprint:"hv6-mock-b",reachable:!0,trust:2,trust_label:"trusted",last_success_host:"192.168.1.52",last_failure:"",health:{mapped_zones:6,fresh_zones:6,stale_zones:0,calling_zones:2,avg_temp_c:18.9,avg_setpoint_c:18.9},runtime:{active_zones:4,avg_valve_pct:19.7,flow_c:31.2,return_c:28.9,drivers_enabled:!0,motor_fault:!1,motor_current_ma:12.4}},{id:"v6-c",hostname:"lune-v6-c.local",ip:"192.168.1.53",firmware:"mock",pairing_fingerprint:"hv6-mock-c",reachable:!1,trust:1,trust_label:"paired",last_success_host:"",last_failure:"overview failed status=0",health:{mapped_zones:6,fresh_zones:5,stale_zones:1,calling_zones:1,avg_temp_c:19.3,avg_setpoint_c:18.6},runtime:{active_zones:0,avg_valve_pct:null,flow_c:null,return_c:null,drivers_enabled:!1,motor_fault:!1,motor_current_ma:null}}]};if(e==="/zones"){let t=["Living","Kitchen","Bath","Hall","Office","Bedroom","Guest","Utility","Laundry","Workshop","Pantry","Landing","Kids west","Kids east","Ensuite","Basement","Garage","Spare"],s=["heat","idle","call","hold","idle","preheat","idle","heat","idle","call","idle","hold","idle","heat","call","stale","idle","unused"],a=[21.5,21,22.5,20,21,19.5,20,19,18.5,18,18,20,20.5,20.5,22,18,12,18],o=[.2,0,.1,0,-.2,0,0,.3,0,.4,0,0,0,.2,0,0,0,0];return{count:18,zones:t.map((r,n)=>({room_id:`room-${String(n+1).padStart(2,"0")}`,name:r,node_index:Math.floor(n/6),zone_index:n%6,temperature_c:[21.3,20.9,22.2,20.1,20.8,19.4,19.8,18.9,18.7,17.6,18.1,20.3,20.5,20,21.8,null,12.4,null][n],setpoint_c:[21,21,22.5,20,21,19.5,20,19,18.5,18,18,20,20.5,20.5,22,18,12,null][n],valve_pct:[45,18,28,15,15,35,10,42,15,58,12,15,16,38,30,null,15,null][n],status:s[n],fresh:s[n]!=="stale",comfort:{setpoint_c:a[n],bias_c:o[n],effective_setpoint_c:a[n]+o[n],priority:n<3?3:1},schedule:{enabled:n<8,day_mask:n<8?31:127,start_min:360,end_min:1320,setpoint_c:a[n]},history:{samples:s[n]==="unused"||s[n]==="stale"?0:36+n,calling_samples:[18,6,9,2,3,12,1,8,2,16,1,3,2,10,7,0,1,0][n],avg_temp_c:[21.1,20.8,22,20,20.7,19.6,19.7,18.8,18.6,17.9,18.1,20.2,20.4,20.1,21.7,null,12.3,null][n],min_temp_c:[20.6,20.4,21.6,19.8,20.2,19.1,19.5,18.3,18.1,17.2,17.8,19.9,20,19.7,21.1,null,11.8,null][n],max_temp_c:[21.5,21.2,22.4,20.3,21,19.9,20.1,19,18.9,18.2,18.3,20.5,20.8,20.3,22,null,12.6,null][n],last_delta_c_per_h:s[n]==="unused"||s[n]==="stale"?null:[.4,-.1,.2,0,-.2,.3,.1,.5,-.1,.6,0,-.1,.2,.4,.3,null,.1,null][n]}}))}}if(e==="/forecast"){let t=Array.from({length:72},(s,a)=>{let r=3.5+Math.sin((a-8)/24*Math.PI*2)*3.4-Math.max(0,a-36)*.04,n=4.5+Math.sin(a/8)*2.2+(a>18&&a<34?3.2:0),u=Math.max(0,Math.sin((a%24-6)/12*Math.PI))*420;return{h:a,temp_c:r,wind_ms:n,wind_dir_deg:235+Math.sin(a/9)*55,solar_wm2:u}});return{status:"ok",location:{mode:"manual",latitude:55.6761,longitude:12.5683},last_fetch_age_s:420,cache:{hours:72,min_temp_c:-2.1,max_wind_ms:13.4,peak_wind_dir_deg:275,max_solar_wm2:180},last_error:"",commands:{active:2,sent:1,skipped:1,failed:0,blocked_stale:1,blocked_unreachable:0,blocked_untrusted:0},hours:t,decisions:[{room_id:"room-01",name:"Living",node_index:0,zone_index:0,comfort_setpoint_c:21.5,priority:3,offset_c:.4,peak_load:1.8,peak_in_h:3,active:!0},{room_id:"room-06",name:"Bedroom",node_index:0,zone_index:5,comfort_setpoint_c:19.5,priority:1,offset_c:.2,peak_load:1.4,peak_in_h:4,active:!0}]}}return e==="/strategy"?{physical:{has_temperature:!0,temperature_c:20.8,contributing_zones:14},comfort:{average_c:20.7,demand_c:.6,demand_zones:5},driver:{room_id:"room-03",name:"Bath",deficit_c:1.3,priority:3},schedule:{time_valid:!0,active_zones:8,driver_room_id:"room-03",driver_name:"Bath",driver_setpoint_c:22,driver_priority:3},asgard_odin:{physical_signal:"priority_weighted_house_temp",comfort_signal:"separate_weighted_demand",mode:"advisory"}}:e==="/commands"?{commands:[{request_id:"mock-forecast-1",source:"forecast",reason:"wind preload",node_index:0,zone_index:0,requested_offset_c:.4,accepted_offset_c:.4,created_at_ms:Date.now()-6e5,expires_at_ms:Date.now()+21e5,result:"accepted",clamp_applied:!1},{request_id:"mock-dashboard-1",source:"dashboard",reason:"quick boost",node_index:1,zone_index:3,requested_offset_c:1.1,accepted_offset_c:.8,created_at_ms:Date.now()-42e4,expires_at_ms:Date.now()+9e5,result:"accepted",clamp_applied:!0},{request_id:"mock-forecast-2",source:"forecast",reason:"wind preload",node_index:2,zone_index:1,requested_offset_c:.3,accepted_offset_c:0,created_at_ms:Date.now()-24e4,expires_at_ms:Date.now()+18e5,result:"blocked_unreachable",clamp_applied:!1}]}:e==="/diagnostics"?{heap:"watching",nodes:3,zones:18,ledger:3,screen:"overview-only",api:T,polling:{last_poll_ms:Date.now()%9e5,success:42,fail:1,last_error:"mock stale node"},commissioning:{paired_nodes:1,trusted_nodes:2,reachable_nodes:2,stale_nodes:1,bound_zones:18,fresh_zones:17,stale_zones:1,ready_for_commands:!0,ready_for_forecast:!0,next_action:"ready"},ota:{running_label:"app0",running_subtype:16,running_slot_size:6553600,configured_slot_size:6553600,state:"valid",pending_verify:!1},learning:{zones_with_history:16,total_samples:692,total_calling_samples:101,calling_ratio:.146,zones_with_delta:14,warming_zones:5,cooling_zones:3,average_delta_c_per_h:.12},forecast_commands:{active:2,sent:1,skipped:1,failed:0,blocked_stale:1,blocked_unreachable:0,blocked_untrusted:0}}:{}}async function ce(e){var a,o;if((a=window.LUNE_TOUCH_DASHBOARD_CONFIG)!=null&&a.mock)return de(e);let t=await fetch(T+e,{cache:"no-store"});if(!t.ok)throw new Error(`${e} failed: ${t.status}`);let s=await t.json();if(s&&s.ok===!1)throw new Error(((o=s.error)==null?void 0:o.message)||"API error");return s.data||s}async function A(e,{loading:t=!1}={}){t&&F({loading:!0,error:""});try{let s=await Promise.all(e.map(ce)),a={error:""};e.forEach((o,r)=>{let n=s[r];o==="/overview"&&(a.overview=n),o==="/nodes"&&(a.nodes=n.nodes||[]),o==="/zones"&&(a.zones=n.zones||[]),o==="/strategy"&&(a.strategy=n),o==="/forecast"&&(a.forecast=n),o==="/commands"&&(a.commands=n.commands||[]),o==="/diagnostics"&&(a.diagnostics=n)}),t&&(a.loading=!1),F(a)}catch(s){F({loading:!1,error:s.message||String(s)})}}async function $(e={}){var t;return A(["/overview","/nodes","/zones","/strategy","/forecast","/commands","/diagnostics"],{loading:(t=e.loading)!=null?t:!0})}async function L(e){return e==="overview"?A(["/overview","/zones","/forecast","/diagnostics"]):e==="manifolds"?A(["/overview","/nodes"]):e==="forecast"?A(["/forecast","/diagnostics"]):e==="commands"?A(["/commands"]):e==="settings"?A(["/overview","/nodes","/strategy","/diagnostics"]):e==="diagnostics"?A(["/strategy","/forecast","/commands","/diagnostics"]):Promise.resolve()}async function N(e,t={}){var n,u,x,m;if((n=window.LUNE_TOUCH_DASHBOARD_CONFIG)!=null&&n.mock)return e==="/nodes/scan"?{scan:t.hostname||t.ip?"probe":"known_nodes",discovery:t.hostname||t.ip?"manual_probe":"manual_or_known_nodes",found:[{id:"v6-a",hostname:t.hostname||"lune-v6-a.local",ip:t.ip||"192.168.1.51",model:"lune-v6",firmware:"mock",pairing_fingerprint:"hv6-mock-a",reachable:!0,stale:!1,source:t.hostname||t.ip?"manual_probe":"known_node"}]}:e.includes("/motor-action")?{result:"accepted",action:t.action||"reset_fault",target_node:"v6-a",zone_index:0}:{result:"mock"};let s=new URLSearchParams;Object.entries(t).forEach(([_,h])=>{h!=null&&s.set(_,String(h))});let a=`${T}${e}${s.toString()?`?${s}`:""}`,o=await fetch(a,{method:"POST",body:""});if(!o.ok){let _=`${e} failed: ${o.status}`;try{let h=await o.json();_=((u=h==null?void 0:h.error)==null?void 0:u.message)||((x=h==null?void 0:h.error)==null?void 0:x.code)||_}catch(h){}throw new Error(_)}let r=await o.json();if(r&&r.ok===!1)throw new Error(((m=r.error)==null?void 0:m.message)||"API error");return r.data||r}var y={scanNodes:(e={})=>N("/nodes/scan",e),addNode:e=>N("/nodes",e),trustNode:(e,t)=>N(`/nodes/${encodeURIComponent(e)}/trust`,{trust:t}),removeNode:e=>N(`/nodes/${encodeURIComponent(e)}/remove`),resetRegistry:()=>N("/recovery/reset-registry",{confirm:"reset-registry"}),saveZone:(e,t)=>N(`/zones/${encodeURIComponent(e)}`,t),saveComfort:(e,t)=>N(`/zones/${encodeURIComponent(e)}/comfort`,t),saveSchedule:(e,t)=>N(`/zones/${encodeURIComponent(e)}/schedule`,t),setpointCommand:(e,t)=>N(`/zones/${encodeURIComponent(e)}/setpoint-command`,t),motorAction:(e,t)=>N(`/zones/${encodeURIComponent(e)}/motor-action`,t),saveForecast:e=>N("/forecast/settings",e),fetchForecast:()=>N("/forecast/fetch")};var w=e=>{F({error:""}),Promise.resolve().then(e).catch(t=>F({error:t.message||String(t)}))},k=e=>e==null||Number.isNaN(e)?"--.- C":`${Number(e).toFixed(1)} C`,g=e=>String(e!=null?e:"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),R=e=>`V6-${String.fromCharCode(65+Number(e||0))}`,le=e=>{if(!(e!=null&&e.expires_at_ms))return"-";if(e.result==="expired")return"expired";if(e.result!=="pending")return"done";let t=Math.max(0,Number(e.expires_at_ms)-Date.now()),s=Math.ceil(t/6e4);return s>0?`${s} min`:"now"},pe=e=>{let t=Math.floor(Number(e||0)/1e3);if(!t)return"never";let s=Math.floor(t/60),a=t%60;return s?`${s}m ${a}s`:`${a}s`},me=e=>{let t=Math.floor(Number(e||0));if(!t)return"never";let s=Math.floor(t/3600),a=Math.floor(t%3600/60);return s?`${s}h ${a}m`:`${a}m`},z=(e,t="")=>e==null||Number.isNaN(Number(e))?"-":`${Number(e).toFixed(1)}${t}`,ue=(e={})=>{let t=Number(e.samples||0);return t?`${t} / ${z(e.last_delta_c_per_h," C/h")}`:"0 / -"},fe=(e={},t)=>{var r,n,u;let s=(n=(r=e.effective_setpoint_c)!=null?r:e.setpoint_c)!=null?n:t,a=Number(e.bias_c||0),o=Math.abs(a)>.05?` (${a>0?"+":""}${a.toFixed(1)})`:"";return`${k(s)}${o} / P${(u=e.priority)!=null?u:1}`},V=(e={})=>e.trust_label||(Number(e.trust)===2?"trusted":Number(e.trust)===1?"paired":"unpaired"),W=e=>{let t=Math.max(0,Math.min(1440,Number(e||0))),s=Math.floor(t/60),a=t%60;return`${String(s).padStart(2,"0")}:${String(a).padStart(2,"0")}`},K=(e,t)=>{let[s,a]=String(e||"").split(":").map(Number);return!Number.isFinite(s)||!Number.isFinite(a)?t:Math.max(0,Math.min(1440,s*60+a))},ge=(e={})=>e.enabled?`${W(e.start_min)}-${W(e.end_min)} / ${k(e.setpoint_c)}`:"off",he=(e,t,s)=>Math.max(t,Math.min(s,e));function G(e,t,s){let a=e.filter(u=>Number.isFinite(u));if(!a.length)return{min:t,max:s};let o=Math.min(...a),r=Math.max(...a);o===r&&(o-=1,r+=1);let n=(r-o)*.12;return{min:o-n,max:r+n}}function P(e){if(!e.length)return"";if(e.length<3)return`M ${e.map(a=>`${a.x.toFixed(1)} ${a.y.toFixed(1)}`).join(" L ")}`;let t=`M ${e[0].x.toFixed(1)} ${e[0].y.toFixed(1)}`,s=.16;for(let a=0;a<e.length-1;a++){let o=e[a-1]||e[a],r=e[a],n=e[a+1],u=e[a+2]||n,x=r.x+(n.x-o.x)*s,m=r.y+(n.y-o.y)*s,_=n.x-(u.x-r.x)*s,h=n.y-(u.y-r.y)*s;t+=` C ${x.toFixed(1)} ${m.toFixed(1)}, ${_.toFixed(1)} ${h.toFixed(1)}, ${n.x.toFixed(1)} ${n.y.toFixed(1)}`}return t}function X(e={}){let t=Array.isArray(e.hours)?e.hours.slice(0,72):[],s=1e3,a=220,o=46,r=44,n=18,u=44,x=s-o-r,m=a-n-u,_=n+m;if(!t.length)return`<div class="chart-card"><div class="chart-head"><span class="chart-title">Weather load</span><span class="chart-sub">no cache</span></div><svg class="forecast-chart" viewBox="0 0 ${s} ${a}"><text x="${s/2}" y="${a/2}" text-anchor="middle" class="chart-empty">Fetch weather to populate forecast graph</text></svg></div>`;let h=p=>o+(t.length<=1?0:p/(t.length-1))*x,i=G(t.map(p=>Number(p.temp_c)),-5,15),d=G(t.map(p=>Number(p.wind_ms)),0,14);d.min=Math.min(0,d.min);let f=p=>n+(1-(p-i.min)/Math.max(.001,i.max-i.min))*m,v=p=>n+(1-(p-d.min)/Math.max(.001,d.max-d.min))*m,S=p=>n+(1-he(p,0,900)/900)*m,l={temp:t.map((p,b)=>({x:h(b),y:f(Number(p.temp_c))})).filter(p=>Number.isFinite(p.y)),wind:t.map((p,b)=>({x:h(b),y:v(Number(p.wind_ms))})).filter(p=>Number.isFinite(p.y)),solar:t.map((p,b)=>({x:h(b),y:S(Number(p.solar_wm2))})).filter(p=>Number.isFinite(p.y))},C=l.solar.length?`${P(l.solar)} L ${l.solar[l.solar.length-1].x.toFixed(1)} ${_} L ${l.solar[0].x.toFixed(1)} ${_} Z`:"",M=[0,.5,1].map(p=>{let b=n+p*m,I=i.max-(i.max-i.min)*p,E=d.max-(d.max-d.min)*p;return`<line x1="${o}" y1="${b}" x2="${o+x}" y2="${b}" class="chart-grid"></line><text x="${o-8}" y="${b+4}" text-anchor="end" class="chart-tick">${I.toFixed(0)}C</text><text x="${o+x+8}" y="${b+4}" class="chart-tick">${E.toFixed(0)}m/s</text>`}).join(""),q=t.map((p,b)=>{var E;return b%6!==0&&b!==t.length-1?"":`<text x="${h(b)}" y="${_+18}" text-anchor="middle" class="chart-hour">+${(E=p.h)!=null?E:b}h</text>`}).join("");return`<div class="chart-card">
    <div class="chart-head"><span class="chart-title">Weather load</span><span class="chart-sub">${t.length} h cache</span></div>
    <div class="chart-legend">
      <span class="legend-item" style="color:var(--series-cool)"><span class="legend-dot"></span>Temp</span>
      <span class="legend-item" style="color:var(--series-warm)"><span class="legend-dot"></span>Wind</span>
      <span class="legend-item" style="color:var(--series-solar)"><span class="legend-dot"></span>Solar</span>
    </div>
    <svg class="forecast-chart" viewBox="0 0 ${s} ${a}" preserveAspectRatio="xMidYMid meet">
      ${M}<line x1="${o}" y1="${_}" x2="${o+x}" y2="${_}" class="chart-axis"></line>${q}
      ${C?`<path d="${C}" fill="rgba(255,193,77,.10)" stroke="none"></path>`:""}
      <path d="${P(l.solar)}" fill="none" stroke="var(--series-solar)" stroke-width="1.8" stroke-linecap="round"></path>
      <path d="${P(l.temp)}" fill="none" stroke="var(--series-cool)" stroke-width="2.4" stroke-linecap="round"></path>
      <path d="${P(l.wind)}" fill="none" stroke="var(--series-warm)" stroke-width="2.2" stroke-linecap="round"></path>
    </svg>
  </div>`}function ve(){var t;let e=((t=c.diagnostics)==null?void 0:t.commissioning)||{};return`<div class="readiness-strip">
    <div class="readiness-chip"><span>Next</span><strong class="${e.next_action==="ready"?"ok":"warn"}">${g(e.next_action||"unknown")}</strong></div>
    <div class="readiness-chip"><span>Nodes</span><strong>${e.trusted_nodes||0} trusted / ${e.reachable_nodes||0} reachable</strong></div>
    <div class="readiness-chip"><span>Zones</span><strong>${e.fresh_zones||0} fresh / ${e.bound_zones||0} mapped</strong></div>
    <div class="readiness-chip"><span>Commands</span><strong class="${e.ready_for_commands?"ok":"warn"}">${e.ready_for_commands?"ready":"blocked"}</strong></div>
  </div>`}function j(e){return e==="heat"||e==="call"||e==="preheat"?"ok":e==="stale"||e==="rejected"||e==="expired"||e==="blocked_stale"||e==="blocked_unreachable"||e==="blocked_untrusted"?"warn":e==="unused"?"muted":""}function _e(e=[]){let t=new Set(["rejected","failed","blocked_stale","blocked_unreachable","blocked_untrusted"]);return e.reduce((s,a)=>(a.result==="pending"&&(s.pending+=1),a.result==="accepted"&&(s.accepted+=1),a.clamp_applied&&(s.clamped+=1),t.has(a.result)&&(s.blocked+=1),s),{pending:0,accepted:0,clamped:0,blocked:0})}function be(e={}){return e.clamp_applied||["rejected","failed","blocked_stale","blocked_unreachable","blocked_untrusted"].includes(e.result)}function xe(e){return`<article class="zone-card ${j(e.status)}">
    <div class="zone-top"><strong>${e.name}</strong><span>${k(e.temperature_c)}</span></div>
    <div class="zone-bottom"><span>Set ${k(e.setpoint_c)}</span><span>${z(e.valve_pct,"%")}</span><span>${e.status}</span><span>${R(e.node_index)}</span></div>
  </article>`}function Y(){var t;let e=((t=c.overview)==null?void 0:t.summary)||{};return`<section class="panel">
    <div class="section-head"><h2>House</h2><button class="btn" data-action="refresh">Refresh</button></div>
    <div class="stat-grid">
      <div class="stat"><span>Comfort</span><strong>${k(e.comfort_avg_c)}</strong></div>
      <div class="stat"><span>Zones</span><strong>${e.zones||0}</strong><em>${e.calling||0} calling</em></div>
      <div class="stat"><span>Manifolds</span><strong>${e.nodes||0}</strong><em>${e.stale_nodes||0} stale</em></div>
      <div class="stat"><span>Weather</span><strong>${e.forecast_status||"unknown"}</strong><em>${e.latest_command||"no command"}</em></div>
    </div>
    ${ve()}
    <div class="split-main">
      <div>
        <div class="section-head"><h2>Zones</h2><span class="note">Heat demand and source freshness</span></div>
        <div class="zone-matrix">${c.zones.map(xe).join("")}</div>
      </div>
      ${X(c.forecast||{})}
    </div>
  </section>`}function Q(){return`<section class="panel">
    <div class="section-head"><h2>Zone control</h2><span class="note">Expiring commands only. V6 clamps locally.</span></div>
    <div class="inline-form">
      <input class="input mini-input" id="map-room-id" placeholder="room-id">
      <input class="input mini-input" id="map-room-name" placeholder="Room name">
      <select class="input mini-input" id="map-node">${c.nodes.map((t,s)=>`<option value="${s}">${t.id||R(s)}</option>`).join("")||'<option value="0">V6-0</option>'}</select>
      <input class="input mini-input" id="map-zone" type="number" min="1" max="6" value="1">
      <button class="btn" data-action="save-room-map">Map room</button>
    </div>
    <div class="inline-form">
      <input class="input mini-input" id="comfort-room-id" placeholder="room-id">
      <input class="input mini-input" id="comfort-setpoint" type="number" step="0.1" min="5" max="35" value="21.0">
      <input class="input mini-input" id="comfort-bias" type="number" step="0.1" min="-3" max="3" value="0.0">
      <select class="input mini-input" id="comfort-priority"><option value="1">Normal</option><option value="2">High</option><option value="3">Critical</option><option value="0">Low</option></select>
      <button class="btn" data-action="save-comfort">Save comfort</button>
    </div>
    <div class="inline-form">
      <input class="input mini-input" id="schedule-room-id" placeholder="room-id">
      <input class="input mini-input" id="schedule-start" type="time" value="06:00">
      <input class="input mini-input" id="schedule-end" type="time" value="22:00">
      <input class="input mini-input" id="schedule-setpoint" type="number" step="0.1" min="5" max="35" value="21.0">
      <input class="input mini-input" id="schedule-day-mask" type="number" min="1" max="127" value="127">
      <label class="check"><input id="schedule-enabled" type="checkbox" checked> On</label>
      <button class="btn" data-action="save-schedule">Save schedule</button>
    </div>
    <div class="data-table">
      <div class="tr head zones"><span>Room</span><span>Current</span><span>Comfort</span><span>Schedule</span><span>Status</span><span>Source</span><span>Valve</span><span>Learning</span><span>Command</span></div>
      ${c.zones.map(t=>`<div class="tr">
        <span>${t.name}</span><span>${k(t.temperature_c)}</span><span>${fe(t.comfort,t.setpoint_c)}</span><span>${ge(t.schedule)}</span><span class="${j(t.status)}">${t.status}</span><span>${R(t.node_index)} / Z${Number(t.zone_index)+1}</span>
        <span>${z(t.valve_pct,"%")}</span>
        <span>${ue(t.history)}</span>
        <span><button class="btn slim" data-command-room="${t.room_id}">+0.5 C / 45m</button></span>
      </div>`).join("")}
    </div>
  </section>`}function J(){return`<section class="panel">
    <div class="section-head"><h2>Manifolds</h2><button class="btn" data-action="scan">Scan</button></div>
    <div class="card-grid">${c.nodes.map(e=>{var a,o,r,n,u;let t=e.health||{},s=e.runtime||{};return`<article class="card">
      <h3>${e.id}</h3><p>${e.hostname||e.ip||"no address"}</p>
      <div class="health-grid">
        <div class="health-cell"><span>Zones</span><strong>${(a=t.mapped_zones)!=null?a:0}</strong></div>
        <div class="health-cell"><span>Fresh</span><strong class="${t.stale_zones?"warn":"ok"}">${(o=t.fresh_zones)!=null?o:0}/${(r=t.mapped_zones)!=null?r:0}</strong></div>
        <div class="health-cell"><span>Calling</span><strong>${(n=t.calling_zones)!=null?n:0}</strong></div>
        <div class="health-cell"><span>Temp</span><strong>${k(t.avg_temp_c)}</strong></div>
        <div class="health-cell"><span>Setpoint</span><strong>${k(t.avg_setpoint_c)}</strong></div>
        <div class="health-cell"><span>Trust</span><strong class="${V(e)==="trusted"?"ok":"warn"}">${V(e)}</strong></div>
        <div class="health-cell"><span>Flow</span><strong>${k(s.flow_c)}</strong></div>
        <div class="health-cell"><span>Return</span><strong>${k(s.return_c)}</strong></div>
        <div class="health-cell"><span>Valve</span><strong>${z(s.avg_valve_pct,"%")}</strong></div>
        <div class="health-cell"><span>Active</span><strong>${(u=s.active_zones)!=null?u:0}</strong></div>
        <div class="health-cell"><span>Drivers</span><strong class="${s.drivers_enabled?"ok":"warn"}">${s.drivers_enabled?"on":"off"}</strong></div>
        <div class="health-cell"><span>Fault</span><strong class="${s.motor_fault?"warn":"ok"}">${s.motor_fault?"yes":"none"}</strong></div>
      </div>
      <dl><dt>Firmware</dt><dd>${e.firmware||"-"}</dd><dt>Status</dt><dd class="${e.reachable?"ok":"warn"}">${e.reachable?"reachable":"stale"}</dd><dt>Identity</dt><dd>${g(e.pairing_fingerprint||"-")}</dd><dt>Last host</dt><dd>${g(e.last_success_host||"-")}</dd><dt>Last error</dt><dd class="${e.last_failure?"warn":"muted"}">${g(e.last_failure||"-")}</dd></dl>
      <div class="inline-form">
        <button class="btn slim" data-trust-node="${e.id}" data-trust-value="trusted">Trust</button>
        <button class="btn slim" data-trust-node="${e.id}" data-trust-value="paired">Pair only</button>
        <button class="btn slim danger" data-remove-node="${e.id}">Remove</button>
      </div>
    </article>`}).join("")}</div>
  </section>`}function ee(){let e=c.forecast||{},t=e.cache||{},s=e.location||{},a=e.commands||{},o=(e.decisions||[]).filter(r=>r.active);return`<section class="panel">
    <div class="split-main">
    <div class="stack">
      <div class="section-head"><h2>Weather</h2><button class="btn" data-action="forecast-fetch">Fetch now</button></div>
      ${X(e)}
      <div class="card"><h3>Status</h3><p class="${e.status==="ok"?"ok":"warn"}">${e.status||"unknown"}</p><p>Last fetch: ${me(e.last_fetch_age_s)}</p><p class="${e.last_error?"warn":"muted"}">${e.last_error||"no current forecast error"}</p></div>
      <div class="card"><h3>Location</h3><p>${s.mode||"manual"} (${Number(s.latitude||0).toFixed(5)}, ${Number(s.longitude||0).toFixed(5)})</p>
        <div class="inline-form forecast-location">
          <input class="input mini-input" id="forecast-lat" type="number" step="0.000001" placeholder="Latitude" value="${s.latitude||""}">
          <input class="input mini-input" id="forecast-lon" type="number" step="0.000001" placeholder="Longitude" value="${s.longitude||""}">
          <button class="btn" data-action="save-forecast-location">Save</button>
          <button class="btn" data-action="geo">Use browser</button>
        </div>
      </div>
    </div>
    <div class="stack">
      <div class="card"><h3>Cache</h3><dl><dt>Hours</dt><dd>${t.hours||0}</dd><dt>Min temp</dt><dd>${z(t.min_temp_c," C")}</dd><dt>Max wind</dt><dd>${z(t.max_wind_ms," m/s")} from ${Math.round(t.peak_wind_dir_deg||0)} deg</dd><dt>Max solar</dt><dd>${z(t.max_solar_wm2," W/m2")}</dd></dl></div>
      <div class="card"><h3>Commands</h3><dl><dt>Active</dt><dd>${a.active||0}</dd><dt>Sent</dt><dd>${a.sent||0}</dd><dt>Skipped</dt><dd>${a.skipped||0}</dd><dt>Failed</dt><dd class="${a.failed?"warn":"ok"}">${a.failed||0}</dd><dt>Blocked</dt><dd class="${a.blocked_stale||a.blocked_unreachable||a.blocked_untrusted?"warn":"ok"}">${a.blocked_stale||0} stale / ${a.blocked_unreachable||0} offline / ${a.blocked_untrusted||0} trust</dd></dl></div>
      <div class="card"><h3>Decisions</h3>${o.map(r=>{var n;return`<p>${r.room_id}: +${z(r.offset_c," C")}, P${(n=r.priority)!=null?n:1}, comfort ${k(r.comfort_setpoint_c)}, peak ${z(r.peak_load)} in ${r.peak_in_h}h</p>`}).join("")||"<p>No active decisions</p>"}</div>
    </div>
    </div>
  </section>`}function te(){return`<section class="panel">
    <div class="section-head"><h2>Command ledger</h2><span class="note">Requested vs accepted/clamped values</span></div>
    <div class="data-table">
      <div class="tr head commands"><span>ID</span><span>Source</span><span>Reason</span><span>Target</span><span>Request</span><span>Accept</span><span>Clamp</span><span>Expiry</span></div>
      ${c.commands.map(e=>`<div class="tr commands"><span>${e.request_id}</span><span>${e.source}</span><span>${e.reason}</span><span>${R(e.node_index)} / Z${Number(e.zone_index)+1}</span><span>${e.requested_offset_c}</span><span>${e.accepted_offset_c}</span><span class="${e.clamp_applied?"warn":"ok"}">${e.clamp_applied?"yes":"no"}</span><span class="${j(e.result==="accepted"?"heat":e.result)}">${e.result} / ${le(e)}</span></div>`).join("")}
    </div>
  </section>`}function ae(){var u,x;let e=c.scanResult,t=(e==null?void 0:e.found)||[],s=c.strategy||{},a=s.physical||{},o=s.comfort||{},r=s.driver||{},n=((u=c.diagnostics)==null?void 0:u.commissioning)||{};return`<section class="panel two-col">
    <div class="card"><h3>Register V6</h3><label>Hostname/IP<input class="input" id="node-host" placeholder="lune-v6-a.local"></label><div class="inline-form"><button class="btn" data-action="probe-node">Probe</button><button class="btn" data-action="add-node">Add node</button></div></div>
    <div class="card"><h3>Last scan</h3><p>${(e==null?void 0:e.discovery)||"not run"}</p>${t.map(m=>`<p><strong>${g(m.id)}</strong> ${g(m.hostname||m.ip||"")} <span class="${m.reachable?"ok":"warn"}">${m.reachable?"reachable":"unreachable"}</span> ${m.firmware?`<span>${g(m.firmware)}</span>`:""} ${m.pairing_fingerprint?`<span>${g(m.pairing_fingerprint)}</span>`:""} <button class="btn slim" data-add-probed-host="${g(m.hostname||"")}" data-add-probed-ip="${g(m.ip||"")}" data-add-probed-fingerprint="${g(m.pairing_fingerprint||"")}">Add</button></p>`).join("")||"<p>No candidates</p>"}</div>
    <div class="card"><h3>Asgard / Odin</h3><p>Physical ${a.has_temperature?k(a.temperature_c):"missing"} from ${a.contributing_zones||0} zones</p><p>Comfort demand ${z(o.demand_c," C")} across ${o.demand_zones||0} zones</p><p>Driver ${g(r.name||r.room_id||"-")} ${r.priority!=null?`/ P${r.priority}`:""}</p><p class="note">${g(((x=s.asgard_odin)==null?void 0:x.mode)||"advisory")}</p></div>
    <div class="card"><h3>Commissioning</h3><p class="${n.next_action==="ready"?"ok":"warn"}">${g(n.next_action||"unknown")}</p><p>${n.trusted_nodes||0} trusted / ${n.paired_nodes||0} paired / ${n.reachable_nodes||0} reachable</p><p>${n.fresh_zones||0} fresh of ${n.bound_zones||0} mapped zones</p></div>
    <div class="card"><h3>Dashboard access</h3><p>Canonical URL is the device root: <strong>http://&lt;touch-ip&gt;/</strong>. The embedded dashboard does not depend on ESPHome's default dashboard UI.</p></div>
    <div class="card"><h3>Recovery</h3><p>${c.nodes.length} paired nodes, ${c.commands.length} command records</p><button class="btn danger" data-action="reset-registry">Reset registry</button></div>
  </section>`}function se(){var f,v,S;let e=c.diagnostics||{},t=e.polling||{},s=e.commissioning||{},a=e.ota||{},o=e.learning||{},r=e.forecast_commands||((f=c.forecast)==null?void 0:f.commands)||{},n=_e(c.commands),u=c.commands.filter(be).slice(-5).reverse(),x=c.zones.filter(l=>l.room_id&&l.status!=="unused").map(l=>`<option value="${g(l.room_id)}">${g(l.name||l.room_id)} (${R(l.node_index)} / Z${Number(l.zone_index)+1})</option>`).join(""),m=c.strategy||e.strategy||{},_=m.physical||{},h=m.comfort||{},i=m.driver||{},d=m.schedule||{};return`<section class="panel">
    <div class="section-head"><h2>Diagnostics</h2><button class="btn" data-action="refresh">Refresh</button></div>
    <div class="metric-strip">
      <div class="metric"><span>API</span><strong>${e.api||"/api/lune-touch/v1"}</strong></div>
      <div class="metric"><span>Coordinator</span><strong>${e.nodes||0} nodes / ${e.zones||0} zones</strong></div>
      <div class="metric"><span>Ledger</span><strong>${e.ledger||0} records</strong></div>
      <div class="metric"><span>Heap</span><strong>${e.heap||"watching"}</strong></div>
    </div>
    <div class="diagnostics-layout">
      <div class="ops-panel wide">
        <h3>Command attention</h3>
        <div class="metric-strip compact">
          <div class="metric"><span>Accepted</span><strong class="ok">${n.accepted}</strong></div>
          <div class="metric"><span>Pending</span><strong>${n.pending}</strong></div>
          <div class="metric"><span>Clamped</span><strong class="${n.clamped?"warn":"ok"}">${n.clamped}</strong></div>
          <div class="metric"><span>Blocked</span><strong class="${n.blocked?"warn":"ok"}">${n.blocked}</strong></div>
        </div>
        <div class="data-table diagnostics-table">
          <div class="tr head diagnostics"><span>Source</span><span>Target</span><span>Request</span><span>Result</span><span>Reason</span></div>
          ${u.map(l=>`<div class="tr diagnostics"><span>${g(l.source)}</span><span>${R(l.node_index)} / Z${Number(l.zone_index)+1}</span><span>${z(l.requested_offset_c," C")}</span><span class="${j(l.result)}">${g(l.result)}${l.clamp_applied?" / clamp":""}</span><span>${g(l.reason||l.request_id||"-")}</span></div>`).join("")||'<div class="empty-row">No failed, blocked, or clamped commands</div>'}
        </div>
        <button class="btn slim" data-section="commands">Open ledger</button>
      </div>
      <div class="ops-panel">
        <h3>V6 polling</h3>
        <p>Last poll at ${pe(t.last_poll_ms)} uptime</p>
        <p><span class="ok">${t.success||0} ok</span> / <span class="${t.fail?"warn":"ok"}">${t.fail||0} failed</span></p>
        <p class="${t.last_error?"warn":"muted"}">${g(t.last_error||"no current error")}</p>
      </div>
      <div class="ops-panel">
        <h3>Commissioning</h3>
        <p class="${s.next_action==="ready"?"ok":"warn"}">${g(s.next_action||"unknown")}</p>
        <p>${s.trusted_nodes||0} trusted / ${s.paired_nodes||0} paired / ${s.reachable_nodes||0} reachable</p>
        <p>${s.fresh_zones||0} fresh of ${s.bound_zones||0} bound zones</p>
        <p class="${s.ready_for_commands?"ok":"warn"}">Commands ${s.ready_for_commands?"ready":"blocked"} / forecast ${s.ready_for_forecast?"ready":"blocked"}</p>
      </div>
      <div class="ops-panel">
        <h3>Forecast dispatch</h3>
        <p>${r.active||0} active / ${r.sent||0} sent / ${r.skipped||0} skipped</p>
        <p class="${r.failed?"warn":"ok"}">${r.failed||0} failed</p>
        <p class="${r.blocked_stale||r.blocked_unreachable||r.blocked_untrusted?"warn":"muted"}">${r.blocked_stale||0} stale / ${r.blocked_unreachable||0} offline / ${r.blocked_untrusted||0} trust</p>
        <button class="btn slim" data-action="forecast-fetch">Fetch now</button>
      </div>
      <div class="ops-panel">
        <h3>OTA</h3>
        <p>${g(a.running_label||"unknown")} / subtype ${(v=a.running_subtype)!=null?v:"-"}</p>
        <p class="${a.pending_verify?"warn":"ok"}">${g(a.state||"undefined")}</p>
        <p>${Math.round(Number(a.running_slot_size||0)/1024)} KB slot</p>
        <p class="${a.running_slot_size&&a.configured_slot_size&&a.running_slot_size!==a.configured_slot_size?"warn":"muted"}">Configured ${Math.round(Number(a.configured_slot_size||0)/1024)} KB</p>
      </div>
      <div class="ops-panel">
        <h3>Asgard / Odin</h3>
        <p>Physical ${_.has_temperature?k(_.temperature_c):"missing"} from ${_.contributing_zones||0} zones</p>
        <p>Comfort demand ${z(h.demand_c," C")} across ${h.demand_zones||0} zones</p>
        <p>Driver ${g(i.name||i.room_id||((S=e.strategy)==null?void 0:S.driver_room)||"-")} ${i.priority!=null?`/ P${i.priority}`:""}</p>
      </div>
      <div class="ops-panel">
        <h3>Schedule</h3>
        <p class="${d.time_valid?"ok":"warn"}">${d.time_valid?`${d.active_zones||0} active`:"time missing"}</p>
        <p>${g(d.driver_name||d.driver_room_id||"-")} ${d.driver_priority?`/ P${d.driver_priority}`:""}</p>
        <p>${d.driver_setpoint_c?k(d.driver_setpoint_c):"-"}</p>
      </div>
      <div class="ops-panel">
        <h3>Learning</h3>
        <p>${o.zones_with_history||0} zones, ${o.total_samples||0} samples</p>
        <p>Calling ${Math.round(Number(o.calling_ratio||0)*100)}%</p>
        <p>${o.warming_zones||0} warming / ${o.cooling_zones||0} cooling, avg ${z(o.average_delta_c_per_h," C/h")}</p>
      </div>
      <div class="ops-panel">
        <h3>Recovery actions</h3>
        <select class="input mini-input" id="recovery-room">${x||'<option value="">No mapped zones</option>'}</select>
        <div class="action-row">
          <button class="btn slim" data-motor-action="reset_fault">Reset fault</button>
          <button class="btn slim" data-motor-action="reset_learned">Reset learned</button>
          <button class="btn slim danger" data-motor-action="relearn">Relearn</button>
        </div>
      </div>
      <div class="ops-panel">
        <h3>Screen</h3>
        <p>${e.screen||"overview-only"}</p>
      </div>
    </div>
  </section>`}function ne(e){var t,s,a,o,r,n,u,x,m,_,h;(t=e.querySelector('[data-action="refresh"]'))==null||t.addEventListener("click",()=>w($)),(s=e.querySelector('[data-action="scan"]'))==null||s.addEventListener("click",()=>w(()=>y.scanNodes().then(i=>(F({scanResult:i}),$())))),(a=e.querySelector('[data-action="forecast-fetch"]'))==null||a.addEventListener("click",()=>w(()=>y.fetchForecast().then(()=>{L("forecast"),setTimeout(()=>L("forecast"),6e3),setTimeout(()=>L("forecast"),18e3)}))),(o=e.querySelector('[data-action="save-forecast-location"]'))==null||o.addEventListener("click",()=>{var f,v;let i=Number((f=e.querySelector("#forecast-lat"))==null?void 0:f.value),d=Number((v=e.querySelector("#forecast-lon"))==null?void 0:v.value);Number.isFinite(i)&&Number.isFinite(d)&&w(()=>y.saveForecast({latitude:i,longitude:d,source:"manual"}).then($))}),(r=e.querySelector('[data-action="geo"]'))==null||r.addEventListener("click",()=>{navigator.geolocation&&navigator.geolocation.getCurrentPosition(i=>{w(()=>y.saveForecast({latitude:i.coords.latitude,longitude:i.coords.longitude,source:"browser"}).then($))},i=>F({error:i.message||"Browser location failed"}))}),(n=e.querySelector('[data-action="add-node"]'))==null||n.addEventListener("click",()=>{var d,f;let i=(f=(d=e.querySelector("#node-host"))==null?void 0:d.value)==null?void 0:f.trim();i&&w(()=>y.addNode({hostname:i}).then($))}),(u=e.querySelector('[data-action="probe-node"]'))==null||u.addEventListener("click",()=>{var d,f;let i=(f=(d=e.querySelector("#node-host"))==null?void 0:d.value)==null?void 0:f.trim();i&&w(()=>y.scanNodes({hostname:i}).then(v=>F({scanResult:v})))}),(x=e.querySelector('[data-action="save-room-map"]'))==null||x.addEventListener("click",()=>{var S,l,C,M,q,p;let i=(l=(S=e.querySelector("#map-room-id"))==null?void 0:S.value)==null?void 0:l.trim(),d=((M=(C=e.querySelector("#map-room-name"))==null?void 0:C.value)==null?void 0:M.trim())||i,f=Number(((q=e.querySelector("#map-node"))==null?void 0:q.value)||0),v=Math.max(0,Number(((p=e.querySelector("#map-zone"))==null?void 0:p.value)||1)-1);i&&w(()=>y.saveZone(i,{name:d,node_index:f,zone_index:v}).then($))}),(m=e.querySelector('[data-action="save-comfort"]'))==null||m.addEventListener("click",()=>{var S,l,C,M,q;let i=(l=(S=e.querySelector("#comfort-room-id"))==null?void 0:S.value)==null?void 0:l.trim(),d=Number((C=e.querySelector("#comfort-setpoint"))==null?void 0:C.value),f=Number(((M=e.querySelector("#comfort-bias"))==null?void 0:M.value)||0),v=Number(((q=e.querySelector("#comfort-priority"))==null?void 0:q.value)||1);i&&Number.isFinite(d)&&Number.isFinite(f)&&w(()=>y.saveComfort(i,{comfort_setpoint_c:d,comfort_bias_c:f,priority:v}).then($))}),(_=e.querySelector('[data-action="save-schedule"]'))==null||_.addEventListener("click",()=>{var C,M,q,p,b,I,E;let i=(M=(C=e.querySelector("#schedule-room-id"))==null?void 0:C.value)==null?void 0:M.trim(),d=K((q=e.querySelector("#schedule-start"))==null?void 0:q.value,360),f=K((p=e.querySelector("#schedule-end"))==null?void 0:p.value,1320),v=Number((b=e.querySelector("#schedule-setpoint"))==null?void 0:b.value),S=Number(((I=e.querySelector("#schedule-day-mask"))==null?void 0:I.value)||127),l=(E=e.querySelector("#schedule-enabled"))!=null&&E.checked?1:0;i&&Number.isFinite(v)&&w(()=>y.saveSchedule(i,{enabled:l,day_mask:S,start_min:d,end_min:f,setpoint_c:v}).then($))}),e.querySelectorAll("[data-remove-node]").forEach(i=>{i.addEventListener("click",()=>{confirm(`Remove ${i.dataset.removeNode}?`)&&w(()=>y.removeNode(i.dataset.removeNode).then($))})}),e.querySelectorAll("[data-trust-node]").forEach(i=>{i.addEventListener("click",()=>w(()=>y.trustNode(i.dataset.trustNode,i.dataset.trustValue).then($)))}),e.querySelectorAll("[data-add-probed-host]").forEach(i=>{i.addEventListener("click",()=>{let d=i.dataset.addProbedHost||"",f=i.dataset.addProbedIp||"",v=i.dataset.addProbedFingerprint||"";(d||f)&&w(()=>y.addNode({hostname:d,ip:f,pairing_fingerprint:v}).then($))})}),e.querySelectorAll("[data-command-room]").forEach(i=>{i.addEventListener("click",()=>w(()=>y.setpointCommand(i.dataset.commandRoom,{offset_c:.5,ttl_s:2700,reason:"dashboard quick boost"}).then($)))}),e.querySelectorAll("[data-motor-action]").forEach(i=>{i.addEventListener("click",()=>{var v;let d=(v=e.querySelector("#recovery-room"))==null?void 0:v.value;if(!d)return;let f=i.dataset.motorAction;confirm(`${i.textContent.trim()} for ${d}?`)&&w(()=>y.motorAction(d,{action:f}).then($))})}),(h=e.querySelector('[data-action="reset-registry"]'))==null||h.addEventListener("click",()=>{confirm("Reset Lune Touch registry and command ledger?")&&w(()=>y.resetRegistry().then($))})}var $e=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");
:root {
  --accent:#ff8531; --blue:#7aa7ce; --series-warm:#ff8531; --series-cool:#7aa7ce; --series-solar:#ffc14d;
  --bg:#00131d; --surface:#002f45; --card:#021d2b;
  --border:rgba(120,146,200,.28); --border-soft:rgba(120,146,200,.18);
  --text:#fff; --text-strong:#fff4e6; --muted:rgba(247,233,221,.74); --text-faint:rgba(229,216,222,.56);
  --ok:#79d17e; --warn:#ffa600; --danger:#ff6361; --disabled:#6e7e96; --axis:rgba(233,222,210,.82);
  --panel-bg:rgba(0,47,69,.34); --control-bg:rgba(124,155,208,.10); --control-border:rgba(120,146,200,.30);
  --panel-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 12px 30px rgba(0,0,0,.32);
  --font-ui:"Source Sans 3",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --font-display:"Montserrat",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
*{box-sizing:border-box} html{font-size:13px} body{margin:0;font-family:var(--font-ui);background:radial-gradient(1400px 760px at 92% -14%,rgba(255,133,49,.12),transparent 56%),radial-gradient(1200px 820px at 18% -8%,rgba(122,167,206,.10),transparent 64%),var(--bg);color:var(--text);line-height:1.45;-webkit-font-smoothing:antialiased}
button,input,select{font:inherit}.shell{width:min(1400px,100%);min-height:100vh;margin:0 auto;padding:18px;display:grid;grid-template-columns:238px minmax(0,1fr);gap:18px}.main{min-width:0;padding-bottom:18px}.topbar{position:sticky;top:18px;align-self:start;min-height:calc(100vh - 36px);display:flex;flex-direction:column;gap:18px;padding:16px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(180deg,rgba(0,47,69,.48),rgba(0,31,46,.34));box-shadow:var(--panel-shadow)}
.top-menu{display:grid;gap:8px}.menu-link,.btn{border:1px solid var(--control-border);background:var(--control-bg);color:var(--text);border-radius:11px;padding:9px 11px;cursor:pointer;font-weight:800;letter-spacing:.4px}.menu-link{width:100%;text-align:left;text-transform:uppercase;font-size:.78rem}.menu-link.active,.btn:hover{background:var(--accent);border-color:var(--accent);color:#00202e}.btn:disabled{opacity:.45;cursor:wait}.brand{text-align:left;padding-bottom:4px;border-bottom:1px solid var(--border-soft)}.brand-title{font-family:var(--font-display);font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:var(--accent)}.brand-sub{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.8px}.top-meta{margin-top:auto;display:grid;gap:8px}.meta-chip{display:inline-flex;align-items:center;min-height:34px;border:1px solid var(--border);background:var(--control-bg);border-radius:14px;padding:6px 10px;font-weight:800}.meta-chip.ok,.ok{color:var(--ok)}.meta-chip.warn,.warn{color:var(--warn)}.muted{color:var(--disabled)}
.panel{padding:0}.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}h2,h3{font-family:var(--font-display);margin:0;color:var(--text-strong)}h2{font-size:1.24rem}h3{font-size:.84rem;text-transform:uppercase;letter-spacing:1.1px;color:var(--accent);margin-bottom:8px}.note{color:var(--muted)}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}.stat,.card,.zone-card,.chart-card{border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,rgba(2,29,43,.96),rgba(2,23,35,.92));box-shadow:var(--panel-shadow);padding:14px}.stat span{display:block;color:var(--muted);text-transform:uppercase;font-size:.7rem;font-weight:800;letter-spacing:.8px}.stat strong{display:block;font-size:1.8rem;font-family:var(--font-display);margin-top:3px}.stat em{font-style:normal;color:var(--muted)}
.zone-matrix{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.zone-card{padding:9px 10px;border-radius:12px;min-height:74px}.zone-card.ok{border-color:rgba(121,209,126,.42)}.zone-card.warn{border-color:rgba(255,166,0,.5)}.zone-top,.zone-bottom{display:flex;justify-content:space-between;gap:8px}.zone-top strong{font-size:1rem}.zone-top span{font-family:var(--font-display);font-weight:800}.zone-bottom{margin-top:6px;color:var(--muted);font-size:.82rem}.data-table{display:grid;gap:1px;overflow:auto;border:1px solid var(--border);border-radius:14px}.tr{display:grid;grid-template-columns:1.05fr .65fr .8fr .95fr .65fr .85fr .55fr .75fr 1fr;gap:10px;align-items:center;background:rgba(2,29,43,.84);padding:9px 11px;min-width:1180px}.tr.head{background:rgba(255,133,49,.14);color:var(--text-strong);font-weight:800;text-transform:uppercase;font-size:.75rem}.card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.split-main{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:14px}.stack{display:grid;gap:12px}.health-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.health-cell{border:1px solid var(--border-soft);background:var(--control-bg);border-radius:10px;padding:8px}.health-cell span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.7px;font-weight:800}.health-cell strong{display:block;margin-top:2px;font-family:var(--font-display);font-size:1.05rem;color:var(--text-strong)}.slim{padding:5px 8px;font-size:.82rem}.danger{border-color:rgba(255,99,97,.42);color:#ffd9d9}.input{display:block;margin:8px 0 12px;width:100%;border:1px solid var(--border);background:var(--control-bg);color:var(--text);border-radius:10px;padding:9px 10px}.inline-form{display:grid;grid-template-columns:1fr 1fr .7fr .7fr auto;gap:8px;align-items:end;margin:0 0 14px}.mini-input{margin:0}.check{display:flex;gap:6px;align-items:center;border:1px solid var(--border);border-radius:10px;padding:8px 10px;color:var(--muted)}.error{margin-top:14px;border:1px solid rgba(255,99,97,.5);background:rgba(255,99,97,.12);border-radius:12px;padding:10px;color:#ffd9d9}
.forecast-location{grid-template-columns:1fr 1fr auto auto;margin-top:12px}.tr.commands{grid-template-columns:.9fr .7fr 1fr .75fr .7fr .7fr .65fr .7fr;min-width:1020px}
.chart-card{position:relative;display:flex;flex-direction:column;gap:6px}.chart-head{display:flex;align-items:center;gap:9px}.chart-head::before{content:'';width:4px;height:13px;border-radius:2px;background:var(--accent)}.chart-title{color:var(--accent);font-size:.74rem;font-weight:800;letter-spacing:1.4px;text-transform:uppercase}.chart-sub{margin-left:auto;color:var(--text-faint);font-size:.7rem;font-weight:700}.chart-legend{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin:2px 0 6px}.legend-item{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:.7rem;font-weight:700}.legend-dot{width:10px;height:10px;border-radius:999px;border:2px solid currentColor;background:color-mix(in srgb,currentColor 30%,transparent)}.forecast-chart{width:100%;height:auto;display:block;border-radius:10px;background:rgba(0,32,46,.34);overflow:visible}.chart-grid{stroke:rgba(150,168,205,.14);stroke-width:1}.chart-axis{stroke:rgba(150,168,205,.34);stroke-width:1}.chart-tick{fill:var(--axis);font-size:11px}.chart-hour{fill:rgba(202,219,248,.78);font-family:Montserrat,sans-serif;font-size:9px;font-weight:600}.chart-empty{fill:var(--text-faint);font-size:13px}.readiness-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.readiness-chip{border:1px solid var(--border-soft);background:var(--control-bg);border-radius:14px;padding:10px}.readiness-chip span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.8px;font-weight:800}.readiness-chip strong{font-family:var(--font-display);font-size:1.05rem;color:var(--text-strong)}
.metric-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.metric-strip.compact{margin:8px 0 12px}.metric{min-width:0;border-top:1px solid var(--border);background:linear-gradient(180deg,rgba(124,155,208,.10),rgba(0,32,46,.10));padding:10px 0}.metric span{display:block;color:var(--muted);font-size:.68rem;text-transform:uppercase;letter-spacing:.75px;font-weight:800}.metric strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-display);font-size:1rem;color:var(--text-strong)}.diagnostics-layout{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.ops-panel{border-top:1px solid var(--border);background:linear-gradient(180deg,rgba(2,29,43,.62),rgba(2,23,35,.36));padding:13px 0 0}.ops-panel.wide{grid-column:span 2}.ops-panel p{margin:5px 0;color:var(--muted)}.ops-panel .btn{margin-top:10px}.diagnostics-table{margin-top:8px;border-radius:10px}.tr.diagnostics{grid-template-columns:.7fr .7fr .7fr .8fr 1.2fr;min-width:760px}.empty-row{background:rgba(2,29,43,.84);padding:11px;color:var(--muted)}
.action-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
@media(max-width:1100px){.shell{grid-template-columns:200px minmax(0,1fr)}.zone-matrix{grid-template-columns:repeat(3,minmax(0,1fr))}.split-main{grid-template-columns:1fr}.readiness-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.shell{display:block;padding:12px}.topbar{position:static;min-height:0;margin-bottom:14px}.top-menu{grid-template-columns:repeat(3,minmax(0,1fr))}.top-meta{grid-template-columns:repeat(3,minmax(0,1fr))}.stat-grid,.card-grid,.two-col,.zone-matrix,.inline-form,.readiness-strip,.health-grid,.metric-strip,.diagnostics-layout{grid-template-columns:1fr}.ops-panel.wide{grid-column:auto}}
@media(max-width:520px){.top-menu,.top-meta{grid-template-columns:1fr}.menu-link{text-align:center}}
`;function ye(){return c.section==="zones"?Q():c.section==="manifolds"?J():c.section==="forecast"?ee():c.section==="commands"?te():c.section==="settings"?ae():c.section==="diagnostics"?se():Y()}function we(e){let t=document.activeElement;return!!t&&e.contains(t)&&["INPUT","SELECT","TEXTAREA"].includes(t.tagName)}function ke(e){return we(e)?!1:["overview","manifolds","commands","diagnostics"].includes(c.section)}function re(e){if(!document.getElementById("lt-style")){let s=document.createElement("style");s.id="lt-style",s.textContent=$e,document.head.appendChild(s)}function t(){e.innerHTML=`<div class="shell">${U()}<main class="main">${c.error?`<div class="error">${c.error}</div>`:""}${ye()}</main></div>`,Z(e),ne(e)}B(t),t(),$({loading:!0}),setInterval(()=>{ke(e)&&L(c.section)},2e4)}var oe=document.getElementById("app");if(!oe)throw new Error("Dashboard root #app not found");re(oe);})();
