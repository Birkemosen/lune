(()=>{var xt={},Fe={};function N(e){return xt[e.tag]=e,e}function j(e,t){let o=xt[e];if(!o)throw new Error("Component not found: "+e);let r=t||{};if(o.state){let s=o.state(t||{});for(let i in s)r[i]=s[i]}if(o.methods)for(let s in o.methods)r[s]=o.methods[s];let a=document.createElement("div");a.innerHTML=o.render(r);let n=a.firstElementChild;return o.onMount&&o.onMount(r,n),n}function w(e,t){(Fe[e]||(Fe[e]=[])).push(t)}function Y(e){let t=Fe[e];if(t)for(let o=0;o<t.length;o++)t[o](e)}var J=6,Co=28,Ee=Object.create(null),Ao=Eo(),q={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Fo(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Ao,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},Mo=300;function Fo(){let e=Object.create(null);for(let t=1;t<=J;t++)e[t]=[];return e}function Eo(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<J;)e.push("");return e.slice(0,J)}function To(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(q.zoneNames))}catch(e){}}function Q(e){return"$dashboard:"+e}function tt(e){return Math.max(1,Math.min(J,Number(e)||1))}function yt(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let o=e.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function M(e){let t=Ee[e];return t?t.v!=null?t.v:t.value!=null?t.value:yt(t.s!=null?t.s:t.state):null}function O(e){let t=Ee[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function No(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function re(e){return No(O(e))}function v(e,t){let o=Ee[e];o||(o=Ee[e]={v:null,s:null}),"v"in t&&(o.v=t.v,o.value=t.v),"value"in t&&(o.v=t.value,o.value=t.value),"s"in t&&(o.s=t.s,o.state=t.s),"state"in t&&(o.s=t.state,o.state=t.state);for(let r in t)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=t[r]);if(Y(e),e==="text_sensor-firmware_version"&&xe("firmwareVersion",O(e)||""),e.startsWith("text-zone_")&&e.endsWith("_name")){let r=parseInt(e.slice(10,-5),10);if(r>=1&&r<=J){let a=O(e)||"";q.zoneNames[r-1]!==a&&(q.zoneNames[r-1]=a,To(),Y(Q("zoneNames")))}}}function B(e,t){w(Q(e),t)}function P(e){return q[e]}function xe(e,t){q[e]=t,Y(Q(e))}function wt(e){let t=e==="logs"?"diagnostics":e;q.section!==t&&(q.section=t,Y(Q("section")))}function zt(e){let t=tt(e);q.selectedZone!==t&&(q.selectedZone=t,Y(Q("selectedZone")))}function pe(e){let t=!!e;q.live!==t&&(q.live=t,Y(Q("live")))}function kt(){q.pendingWrites+=1,Y(Q("pendingWrites"))}function ot(){q.pendingWrites=Math.max(0,q.pendingWrites-1),q.lastWriteAt=Date.now(),Y(Q("pendingWrites"))}function St(){return q.pendingWrites>0?!0:Date.now()-q.lastWriteAt<2e3}function me(e){return q.zoneNames[tt(e)-1]||""}function $(e){let t=tt(e),o=me(t);return o?"Zone "+t+" \xB7 "+o:"Zone "+t}function ye(e){q.i2cResult=e||"No scan has been run yet.",Y(Q("i2cResult"))}function D(e,t){let o={time:Do(),msg:String(e||"")};for(q.activityLog.push(o);q.activityLog.length>60;)q.activityLog.shift();if(t>=1&&t<=J){let r=q.zoneLog[t];for(r.push(o);r.length>8;)r.shift();Y(Q("zoneLog:"+t))}Y(Q("activityLog"))}function et(e,t){let o=q[e];if(!Array.isArray(o))return;let r=yt(t);if(r!=null){for(o.push(r);o.length>Co;)o.shift();Y(Q(e))}}function _e(e){let t=Date.now();if(!e&&t-q.lastHistoryAt<3200)return;q.lastHistoryAt=t;let o=0,r=0;for(let a=1;a<=J;a++){let n=M("sensor-zone_"+a+"_valve_pct");n!=null&&(o+=n,r+=1)}et("historyFlow",M("sensor-manifold_flow_temperature")),et("historyReturn",M("sensor-manifold_return_temperature")),et("historyDemand",r?o/r:0)}function Do(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Te(e){q.zoneStateHistory=e||null,Y(Q("zoneStateHistory"))}function _t(){return q.deviceLogSeq}function Ne(e,t){if(Array.isArray(e)&&e.length){for(let o of e)q.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>q.deviceLogSeq&&(q.deviceLogSeq=o[0]);for(;q.deviceLog.length>Mo;)q.deviceLog.shift();Y(Q("deviceLog"))}typeof t=="number"&&t>q.deviceLogSeq&&(q.deviceLogSeq=t-1)}function Lt(){return q.deviceLog}function Ct(){q.deviceLog=[],Y(Q("deviceLog"))}var c={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",name:e=>"text-zone_"+e+"_name",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},l={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var K=6,Ro=8,At=null,we=0,De=1,Mt=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],R={temp:new Float32Array(K),setpoint:new Float32Array(K),valve:new Float32Array(K),enabled:new Uint8Array(K),driversEnabled:1,fault:0,manualMode:0};function Oo(){R.manualMode=0,xe("manualMode",!1);for(let n=0;n<K;n++){R.temp[n]=20.5+n*.4,R.setpoint[n]=21+n%3*.5,R.valve[n]=12+n*8,R.enabled[n]=n===4?0:1;let s=n+1;v(c.temp(s),{value:R.temp[n]}),v(c.setpoint(s),{value:R.setpoint[n]}),v(c.valve(s),{value:R.valve[n]}),v(c.state(s),{state:R.valve[n]>5?"heating":"idle"}),v(c.enabled(s),{value:!!R.enabled[n],state:R.enabled[n]?"on":"off"}),v(c.probe(s),{state:"Probe "+s}),v(c.tempSource(s),{state:s%2?"Local Probe":"BLE"}),v(c.syncTo(s),{state:"None"}),v(c.pipeType(s),{state:"PEX 16mm"}),v(c.area(s),{value:8+s*3.5}),v(c.spacing(s),{value:[150,200,150,100,200,150][n]}),v(c.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),v(c.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),v(c.exteriorWalls(s),{state:["N","E","S","W","N,E","S,W"][n]}),v(c.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=Ro;n++){let s=n<=K?n:K,i=R.temp[s-1]+(n>K?1:.1*n);v(c.probeTemp(n),{value:i})}v(l.flow,{value:34.1}),v(l.ret,{value:30.4}),v(l.uptime,{value:18*3600+720}),v(l.wifi,{value:-57}),v(l.drivers,{value:!0,state:"on"}),v(l.fault,{value:!1,state:"off"}),v(l.ip,{state:"192.168.1.86"}),v(l.ssid,{state:"MockLab"}),v(l.mac,{state:"D8:3B:DA:12:34:56"}),v(l.firmware,{state:"0.5.x-mock"}),v(l.manifoldFlowProbe,{state:"Probe 7"}),v(l.manifoldReturnProbe,{state:"Probe 8"}),v(l.manifoldType,{state:"NC (Normally Closed)"}),v(l.motorProfileDefault,{state:"HmIP VdMot"}),v(l.closeThresholdMultiplier,{value:1.7}),v(l.closeSlopeThreshold,{value:1}),v(l.closeSlopeCurrentFactor,{value:1.4}),v(l.openThresholdMultiplier,{value:1.7}),v(l.openSlopeThreshold,{value:.8}),v(l.openSlopeCurrentFactor,{value:1.3}),v(l.openRippleLimitFactor,{value:1}),v(l.genericRuntimeLimitSeconds,{value:45}),v(l.hmipRuntimeLimitSeconds,{value:40}),v(l.relearnAfterMovements,{value:2e3}),v(l.relearnAfterHours,{value:168}),v(l.learnedFactorMinSamples,{value:3}),v(l.learnedFactorMaxDeviationPct,{value:12}),v(l.simplePreheatEnabled,{state:"on"}),v(l.minZoneFlowPct,{value:15}),v(l.minimumFlowAlways,{state:"off"}),v(l.cpuLoadCore0,{value:18.5}),v(l.cpuLoadCore1,{value:7.2}),v(l.freeInternalKb,{value:142}),v(l.freePsramKb,{value:7800}),_e(!0);let e=300,t=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let n=0;n<o;n++){let s=(o-1-n)*e,i=t-s,g=Math.floor(n/12)%24,m=r.map(d=>d[g%d.length]),f=s/3600,z=f>2.5&&f<3.5||f>8.5&&f<9.5?1:0,x=m.filter(d=>d===5).length,p=Math.round(Math.min(100,x*15+Math.abs(Math.sin(n/8))*6)),u=Number((30+x*1.4+Math.sin(n/11)*1.5).toFixed(1)),y=Number((u-(1.4+x*.35)).toFixed(1));a.push([i,...m,z,u,y,p])}Te({interval_s:e,uptime_s:t,count:o,entries:a}),Ft(6)}function Ft(e){let t=[];for(let o=0;o<e;o++){let r=Mt[De%Mt.length];t.push([De,r[0],r[1],r[2]]),De++}Ne(t,De)}function Po(){we+=1,v(l.uptime,{value:Number(Date.now()/1e3)|0}),v(l.wifi,{value:-55-Math.round((1+Math.sin(we/4))*6)});let e=0,t=0,o=0;for(let s=0;s<K;s++){let i=s+1,g=!!R.enabled[s],m=R.temp[s],f=R.setpoint[s],z=g&&R.driversEnabled&&!R.manualMode&&m<f-.25;R.manualMode?R.valve[s]=Math.max(0,R.valve[s]):!g||!R.driversEnabled?R.valve[s]=Math.max(0,R.valve[s]-6):z?R.valve[s]=Math.min(100,R.valve[s]+7+i%3):R.valve[s]=Math.max(0,R.valve[s]-5);let x=z?.05+R.valve[s]/2200:-.03+R.valve[s]/3200;R.temp[s]=m+x+Math.sin((we+i)/5)*.04,g&&R.valve[s]>0&&(e+=R.valve[s],t+=1,o=Math.max(o,R.valve[s])),v(c.temp(i),{value:R.temp[s]}),v(c.valve(i),{value:Math.round(R.valve[s])});let p=Math.max(0,(R.setpoint[s]-R.temp[s]-.15)*.22);v(c.preheatAdvance(i),{value:Number(p.toFixed(2))}),v(c.state(i),{state:g?z?"heating":"idle":"off"}),v(c.enabled(i),{value:g,state:g?"on":"off"}),v(c.probeTemp(i),{value:R.temp[s]+Math.sin((we+i)/6)*.1})}let r=29.5+o*.075+t*.18+Math.sin(we/6)*.25,a=r-(t?2.1+e/Math.max(1,t*50):1.1);v(l.flow,{value:Number(r.toFixed(1))}),v(l.ret,{value:Number(a.toFixed(1))}),v(c.probeTemp(7),{value:Number((a-.4).toFixed(1))}),v(c.probeTemp(8),{value:Number((r+.2).toFixed(1))}),_e(!0);let n=P("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),we%3===0&&Ft(1)}function Et(){At||(Oo(),pe(!0),At=setInterval(Po,1200))}function Re(e){let t=e.key||"",o=e.value,r=e.zone||0;if(t==="zone_setpoint"&&r>=1&&r<=K){let n=Number(o);Number.isNaN(n)||(R.setpoint[r-1]=n,v(c.setpoint(r),{value:n}),D("Zone "+r+" setpoint set to "+n.toFixed(1)+"\xB0C",r));return}if(t==="zone_enabled"&&r>=1&&r<=K){let n=o>.5;R.enabled[r-1]=n?1:0,v(c.enabled(r),{value:n,state:n?"on":"off"}),D("Zone "+r+(n?" enabled":" disabled"),r);return}if(t==="drivers_enabled"){let n=o>.5;R.driversEnabled=n?1:0,v(l.drivers,{value:n,state:n?"on":"off"}),D(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=o>.5;R.manualMode=n?1:0,xe("manualMode",n);return}if(t==="motor_target"&&r>=1&&r<=K){let n=Number(o||0);v(c.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(n)))}),D("Motor "+r+" target set to "+n+"%",r);return}if(t==="command"){let n=String(o);if(n==="i2c_scan"){ye(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),D("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){D("Command executed: "+n);return}if(n==="open_motor_timed"&&r>=1&&r<=K){D("Motor "+r+" open timed",r);return}if(n==="close_motor_timed"&&r>=1&&r<=K){D("Motor "+r+" close timed",r);return}if(n==="stop_motor"&&r>=1&&r<=K){D("Motor "+r+" stopped",r);return}if(n==="motor_reset_fault"&&r>=1&&r<=K){D("Motor "+r+" fault reset",r);return}if(n==="motor_reset_learned_factors"&&r>=1&&r<=K){D("Motor "+r+" learned factors reset",r);return}if(n==="motor_reset_and_relearn"&&r>=1&&r<=K){D("Motor "+r+" reset and relearn started",r);return}if(n==="dump_task_stats"){D("Task stats dumped to device log (mock)");return}return}if(t==="zone_probe"&&r>=1){v(c.probe(r),{state:String(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_temp_source"&&r>=1){v(c.tempSource(r),{state:String(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_sync_to"&&r>=1){v(c.syncTo(r),{state:String(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_type"&&r>=1){v(c.pipeType(r),{state:String(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="manifold_type"){v(l.manifoldType,{state:String(o)}),D("Setting updated: "+t+" = "+o);return}if(t==="manifold_flow_probe"){v(l.manifoldFlowProbe,{state:String(o)}),D("Setting updated: "+t+" = "+o);return}if(t==="manifold_return_probe"){v(l.manifoldReturnProbe,{state:String(o)}),D("Setting updated: "+t+" = "+o);return}if(t==="motor_profile_default"){v(l.motorProfileDefault,{state:String(o)}),D("Setting updated: "+t+" = "+o);return}if(t==="simple_preheat_enabled"){v(l.simplePreheatEnabled,{state:String(o)}),D("Setting updated: "+t+" = "+o);return}if(t==="minimum_flow_always"){v(l.minimumFlowAlways,{state:String(o)}),D("Setting updated: "+t+" = "+o);return}if(t==="zone_name"&&r>=1){v(c.name(r),{state:String(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_ble_mac"&&r>=1){v(c.ble(r),{state:String(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_exterior_walls"&&r>=1){let n=String(o)||"None";v(c.exteriorWalls(r),{state:n}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_area_m2"&&r>=1){v(c.area(r),{value:Number(o)}),D("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_spacing_mm"&&r>=1){v(c.spacing(r),{value:Number(o)}),D("Setting updated: "+t+" = "+o,r);return}let a={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,relearn_after_movements:l.relearnAfterMovements,relearn_after_hours:l.relearnAfterHours,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct,min_zone_flow_pct:l.minZoneFlowPct};if(a[t]){let n=Number(o);Number.isNaN(n)||(v(a[t],{value:n}),D("Setting updated: "+t+" = "+o));return}}window.__hv6_mock={setSetpoint(e,t){Re({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!R.enabled[e-1];Re({key:"zone_enabled",value:t?1:0,zone:e})}};var Oe="/api/hv6/v1";function rt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function Ho(e,t){let o=new URLSearchParams;for(let[a,n]of Object.entries(t||{}))n!=null&&o.append(a,n);let r=o.toString();return Oe+e+(r?"?"+r:"")}function te(e,t,o){if(kt(),rt())try{return Re(o),Promise.resolve({ok:!0})}finally{ot()}let r=sessionStorage.getItem("hv6_local_access_key")||"",a=JSON.stringify(t||{}),n=s=>fetch(Oe+e,{method:"POST",headers:{"Content-Type":"application/json","X-Lune-Local-Key":s,"X-Lune-CSRF":s,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:a});return n(r).then(async s=>{if(s.status===403&&!r){let i=window.prompt("Enter the Lune commissioning key to change local settings")||"";i&&(sessionStorage.setItem("hv6_local_access_key",i),r=i,s=await n(r))}return!s.ok&&[400,404,415].includes(s.status)?fetch(Ho(e,t),{method:"POST"}):(s.ok||console.warn(`API call failed: POST ${e} status=${s.status}`),s)}).catch(s=>{throw console.error(`API call error: POST ${e}:`,s),s}).finally(()=>{ot()})}function nt(e,t){return v(c.setpoint(e),{value:t}),te(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function Tt(e,t){return v(c.enabled(e),{state:t?"on":"off",value:t}),te(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function Nt(e){return v(l.drivers,{state:e?"on":"off",value:e}),te("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function ce(e,t){return te("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function Dt(){return ye("Scanning I2C bus..."),D("I2C scan started"),ce("i2c_scan")}var qo={zone_probe:e=>c.probe(e),zone_temp_source:e=>c.tempSource(e),zone_sync_to:e=>c.syncTo(e),zone_pipe_type:e=>c.pipeType(e)},Io={zone_ble_mac:e=>c.ble(e),zone_exterior_walls:e=>c.exteriorWalls(e),zone_name:e=>c.name(e)},Bo={zone_area_m2:e=>c.area(e),zone_pipe_spacing_mm:e=>c.spacing(e)},Wo={manifold_type:l.manifoldType,manifold_flow_probe:l.manifoldFlowProbe,manifold_return_probe:l.manifoldReturnProbe,motor_profile_default:l.motorProfileDefault,simple_preheat_enabled:l.simplePreheatEnabled},Zo={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,relearn_after_movements:l.relearnAfterMovements,relearn_after_hours:l.relearnAfterHours,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct};function ze(e,t,o){let r=qo[t];return r&&v(r(e),{state:o}),te("/settings/select",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function Le(e,t,o){let r=Io[t];return r&&v(r(e),{state:o}),te("/settings/text",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function at(e,t,o){let r=Number(o),a=Bo[t];return a&&!Number.isNaN(r)&&v(a(e),{value:r}),te("/settings/number",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function le(e,t){let o=Wo[e];return o&&v(o,{state:t}),te("/settings/select",{key:e,value:t},{key:e,value:t})}function de(e,t){let o=Number(t),r=Zo[e];return r&&!Number.isNaN(o)&&v(r,{value:o}),te("/settings/number",{key:e,value:o},{key:e,value:o})}function Rt(e,t){let o=String(t||"").trim();return D("Zone "+e+" renamed to "+(o||"(blank)"),e),Le(e,"zone_name",o)}function Ot(e,t){let o=Number(t),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return v(c.motorTarget(e),{value:r}),D("Motor "+e+" target set to "+r+"%",e),te(`/motors/${e}/target`,{value:r},{key:"motor_target",value:r,zone:e})}function Pt(e,t=1e4){return D("Motor "+e+" open for "+t+"ms",e),te(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function Ht(e,t=1e4){return D("Motor "+e+" close for "+t+"ms",e),te(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function st(e){return D("Motor "+e+" stopped",e),te(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function it(e){return xe("manualMode",!!e),D(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),te("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function qt(e){return D("Motor "+e+" fault reset",e),ce("motor_reset_fault",e)}function It(e){return D("Motor "+e+" learned factors reset",e),ce("motor_reset_learned_factors",e)}function Bt(e){return D("Motor "+e+" reset and relearn started",e),ce("motor_reset_and_relearn",e)}function Wt(){return D("Task stats dumped to device log"),ce("dump_task_stats")}function lt(){rt()||fetch(Oe+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Te(e)}).catch(()=>{})}function dt(){if(rt())return;let e=_t();fetch(Oe+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Ne(t.lines,t.next_seq)}).catch(()=>{})}var Pe=null,Zt=null,Vt=null,jt=null,ct=null;async function Vo(){Pe&&Pe.abort(),Pe=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Pe.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function $t(e){if(!(!e||typeof e!="object")&&!St()){for(let t in e)v(t,e[t]);_e(!1)}}function jo(e){if(e){if(!e.type){$t(e);return}if(e.type==="state"){$t(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;D(t),String(t).indexOf("I2C_SCAN:")!==-1&&ye(String(t))}}}function $o(){lt(),Zt||(Zt=setInterval(lt,300*1e3)),dt(),Vt||(Vt=setInterval(dt,3e3))}function Ut(){Vo().then(e=>{pe(!0),jo(e),$o()}).catch(()=>{pe(!1)})}async function Uo(){try{let e=await fetch("/api/hv6/v1/revision",{cache:"no-store"});if(!e.ok)throw new Error("Revision fetch failed");let t=await e.json(),o=t&&t.data&&t.data.data_revision;(ct===null||o!==ct)&&(ct=o,Ut()),pe(!0)}catch(e){pe(!1)}}function Gt(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Et();return}Ut(),jt||(jt=setInterval(Uo,3e3))}var Xt=Object.create(null);function E(e,t){if(Xt[e])return;Xt[e]=1;let o=document.createElement("style");o.textContent=t,document.head.appendChild(o)}var He={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature Sensors / Connectivity","zone.sensor.returnSensor":"Zone Return Temperature Sensor","zone.sensor.tempSource":"Temperature Source","zone.sensor.bleSensor":"BLE Sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.room.title":"Zone Settings","zone.room.friendlyName":"Friendly Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.room.area":"Zone Area (m\xB2)","zone.room.spacing":"Pipe Spacing C-C (mm)","zone.room.pipeType":"Pipe Type","zone.room.exteriorWalls":"Exterior Walls","zone.room.selectAll":"Select all that apply","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Faults & Relearn","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Reset Fault","diagnostics.recovery.resetFactors":"Reset Factors","diagnostics.recovery.resetRelearn":"Reset + Relearn","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatursensorer / Forbindelse","zone.sensor.returnSensor":"Zone returtemperatursensor","zone.sensor.tempSource":"Temperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.room.title":"Zoneindstillinger","zone.room.friendlyName":"Venligt navn","zone.room.friendlyPlaceholder":"fx Stue","zone.room.area":"Zoneareal (m\xB2)","zone.room.spacing":"R\xF8rafstand C-C (mm)","zone.room.pipeType":"R\xF8rtype","zone.room.exteriorWalls":"Yderv\xE6gge","zone.room.selectAll":"V\xE6lg alle relevante","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Fejl & genl\xE6ring","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Nulstil fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer","diagnostics.recovery.resetRelearn":"Nulstil + genl\xE6r","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?"}},Kt="en".toLowerCase(),pt=He[Kt]?Kt:"en";function b(e,t){let o=He[pt]&&He[pt][e]||He.en[e]||e;return t?String(o).replace(/\{(\w+)\}/g,(r,a)=>t[a]==null?"":String(t[a])):o}function L(e){e&&(e.querySelectorAll("[data-i18n]").forEach(t=>{t.textContent=b(t.getAttribute("data-i18n"))}),e.querySelectorAll("[data-i18n-title]").forEach(t=>{t.setAttribute("title",b(t.getAttribute("data-i18n-title")))}),e.querySelectorAll("[data-i18n-label]").forEach(t=>{t.setAttribute("aria-label",b(t.getAttribute("data-i18n-label")))}),e.querySelectorAll("[data-i18n-placeholder]").forEach(t=>{t.setAttribute("placeholder",b(t.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",pt);var Go=`
/* ---- Card panel ---- */
.ui-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px 20px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
  box-sizing: border-box;
}

/* ---- Titles & section headers ---- */
.ui-card-title {
  font-family: var(--font-display);
  font-size: .875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin: 0 0 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow: visible;
}
.ui-title-text { display: inline-flex; align-items: center; }

/* ---- Help badge: a "?" chip with a hover/focus explanation tooltip ---- */
.help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 7px;
  border-radius: 8px;
  border: 1.5px solid var(--control-border-strong);
  color: var(--text-secondary);
  font-size: .7rem;
  font-weight: 700;
  font-family: inherit;
  text-transform: none;
  letter-spacing: 0;
  cursor: help;
  position: relative;
  flex-shrink: 0;
  vertical-align: middle;
}
.help-badge:hover, .help-badge:focus-visible { color: var(--accent); border-color: var(--accent); outline: none; }
.help-badge .help-tip {
  position: absolute;
  top: calc(100% + 8px);
  /* Keep explanations inside the card instead of letting a badge near the
     right edge spill underneath the next settings column. */
  right: 0;
  left: auto;
  width: max-content;
  max-width: min(280px, calc(100vw - 32px));
  background: var(--overlay-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .84rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: .2px;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  box-shadow: var(--panel-shadow);
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease;
  z-index: 60;
}
.help-badge:hover .help-tip, .help-badge:focus-visible .help-tip { opacity: 1; }

.ui-section {
  font-family: var(--font-display);
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin: 16px 0 2px;
}

/* ---- Row: label left, control right, divider below ---- */
.ui-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid var(--divider);
}
.ui-row[hidden] { display: none; }
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .96rem;
  font-weight: 600;
  line-height: 1.22;
  min-width: 0;
}
.ui-sublabel {
  display: block;
  color: var(--text-faint);
  font-size: .84rem;
  font-weight: 500;
  font-style: italic;
  margin-top: 2px;
}

.ui-field {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---- Controls ---- */
.ui-input {
  width: 96px;
  box-sizing: border-box;
  text-align: right;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  color: var(--text);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .92rem;
  font-family: var(--mono);
  box-shadow: inset 0 2px 8px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.08);
  transition: border-color .15s ease;
}
.ui-input.wide { width: 180px; text-align: left; font-family: inherit; }

.ui-select {
  min-width: 160px;
  max-width: 240px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  color: var(--text);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .92rem;
  box-shadow: inset 0 2px 8px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.08);
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}

.ui-unit { color: var(--text-faint); font-size: .84rem; font-weight: 600; }

/* ---- Numeric stepper (\u2212 value +) ----
   The value reads as plain text (flat, no input chrome) between the buttons;
   double-clicking it reveals the editable input. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 54px;
  text-align: center;
  border-color: transparent;
  background: transparent;
  color: var(--accent);
  font-size: 1.04rem;
  font-weight: 700;
  cursor: default;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input.editing {
  border-color: var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: text;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: 32px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055));
  color: var(--text);
  border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 10px 22px rgba(0,0,0,.18);
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.ui-step-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--control-bg-hover); }
.ui-step-btn:active { transform: translateY(1px); }

/* ---- Unsaved-changes banner (sits under the card title) ---- */
.ui-form-banner {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--warn-bg-soft);
  border: 1px solid var(--warn-border);
}
.ui-form-banner.show { display: flex; }
.ui-form-banner-msg { color: var(--state-warn); font-size: .84rem; font-weight: 700; }
.ui-form-banner-btns { display: flex; gap: 8px; flex-shrink: 0; }
.ui-form-discard,
.ui-form-apply {
  border-radius: 8px;
  padding: 5px 14px;
  font-size: .84rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: .15s ease;
}
.ui-form-discard { background: transparent; color: var(--text-secondary); }
.ui-form-discard:hover { color: var(--text); border-color: var(--text-secondary); }
.ui-form-apply { background: var(--accent); color: var(--text-on-accent); border-color: var(--accent); }
.ui-form-apply:hover { filter: brightness(1.08); }

/* ---- Green pill toggle (canonical) ---- */
.ui-toggle {
  width: 48px;
  height: 26px;
  border-radius: 8px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}
.ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: var(--control-knob);
  border-radius: 6px;
  transition: transform .2s ease;
}
.ui-toggle.on { background: var(--success-bg-soft); border-color: var(--success-border); }
.ui-toggle.on::after { transform: translateX(22px); background: var(--text-on-accent); }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .875rem;
  line-height: 1.4;
  margin-top: 8px;
}
.ui-divider {
  border: 0;
  border-top: 1px dashed var(--panel-border);
  margin: 14px 0 2px;
}

/* ---- Buttons (device actions / recovery) ---- */
.ui-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ui-btn {
  flex: 1;
  min-width: 120px;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055));
  color: var(--text-strong);
  border-radius: 8px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: .875rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 10px 22px rgba(0,0,0,.18);
  transition: .18s ease;
}
.ui-btn:hover { background: linear-gradient(135deg, rgba(255,138,61,.90), rgba(255,189,74,.84)); border-color: rgba(255,218,166,.58); color: var(--text-on-accent); }
.ui-btn.warn { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-text); }
.ui-btn.warn:hover { background: var(--danger-bg-strong); border-color: var(--danger-border-strong); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;E("ui-kit",Go);function ue(e){let t=b(e);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(t).replace(/"/g,"&quot;")}" data-i18n-label="${e}">?<span class="help-tip" data-i18n="${e}">${t}</span></span>`}function Xo(e,t){let o=Math.abs(Number(e));return!Number.isFinite(o)||o<1e3?t:Math.pow(10,Math.floor(Math.log10(o))-1)}function Ko(e){let t=String(e),o=t.indexOf(".");return o<0?0:t.length-o-1}function ne(e,t={}){let o=e.querySelector(t.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):e.insertAdjacentElement("afterbegin",r);let a=[],n=()=>r.classList.toggle("show",a.some(d=>d.dirty)),s=(d,S)=>{d.dirty=S,n()};function i(d){return d.markDirty=()=>s(d,!0),a.push(d),d}function g(d,S){let F={dirty:!1,input:d},k=S.baseStep!=null?S.baseStep:parseFloat(d.step)||1,h=Ko(k),_=S.min!=null?S.min:d.min!==""?parseFloat(d.min):-1/0,C=S.max!=null?S.max:d.max!==""?parseFloat(d.max):1/0,W=H=>h>0?Number(H).toFixed(h):String(Math.round(Number(H)));if(!S.nostep){let H=document.createElement("div");H.className="ui-stepper",d.parentNode.insertBefore(H,d);let A=document.createElement("button");A.type="button",A.className="ui-step-btn",A.textContent="\u2212",A.tabIndex=-1,A.setAttribute("aria-label",b("common.decrease"));let Z=document.createElement("button");Z.type="button",Z.className="ui-step-btn",Z.textContent="+",Z.tabIndex=-1,Z.setAttribute("aria-label",b("common.increase")),H.appendChild(A),H.appendChild(d),H.appendChild(Z),d.readOnly=!0;let I=G=>{if(d.disabled)return;let U=parseFloat(d.value);Number.isFinite(U)||(U=parseFloat(d.placeholder)),Number.isFinite(U)||(U=0);let Se=Math.min(C,Math.max(_,U+G*Xo(U,k)));d.value=W(Se),s(F,!0)};A.addEventListener("click",()=>I(-1)),Z.addEventListener("click",()=>I(1)),d.addEventListener("dblclick",()=>{d.disabled||(d.readOnly=!1,d.classList.add("editing"),d.focus(),d.select())}),d.addEventListener("blur",()=>{d.readOnly=!0,d.classList.remove("editing")}),d.addEventListener("keydown",G=>{G.key==="Enter"&&d.blur()})}return d.addEventListener("input",()=>s(F,!0)),F.sync=()=>{let H=S.read();d.value=H!=null&&Number.isFinite(Number(H))?W(H):""},F.commit=()=>{let H=parseFloat(d.value);Number.isFinite(H)&&S.commit(Math.min(C,Math.max(_,H)))},i(F)}function m(d,S){let F={dirty:!1,input:d};return d.addEventListener("input",()=>s(F,!0)),F.sync=()=>{let k=S.read();d.value=k!=null?k:""},F.commit=()=>S.commit(d.value.trim()),i(F)}function f(d,S){let F={dirty:!1,input:d};return d.addEventListener("change",()=>s(F,!0)),F.sync=()=>{let k=S.read();k!=null&&(d.value=k)},F.commit=()=>S.commit(d.value),i(F)}function z(d,S){let F={dirty:!1,input:d,staged:!1},k=d.closest(".ui-row"),h=()=>{d.classList.toggle("on",F.staged),k&&k.classList.toggle("is-on",F.staged),d.setAttribute("aria-checked",F.staged?"true":"false"),S.onChange&&S.onChange(F.staged)};return d.addEventListener("click",()=>{F.staged=!F.staged,s(F,!0),h()}),F.sync=()=>{F.staged=!!S.read(),h()},F.commit=()=>S.commit(F.staged),i(F)}function x(d){let S={dirty:!1,sync:d.sync,commit:d.commit};return i(S)}let p=()=>a.forEach(d=>{!d.dirty&&d.sync&&d.sync()}),u=()=>{a.forEach(d=>{d.dirty&&(d.commit&&d.commit(),d.dirty=!1)}),n(),t.onApply&&t.onApply()},y=()=>{a.forEach(d=>{d.dirty=!1,d.sync&&d.sync()}),n(),t.onDiscard&&t.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",u),r.querySelector(".ui-form-discard").addEventListener("click",y),L(r),{num:g,text:m,select:f,toggle:z,custom:x,refresh:p,apply:u,discard:y,isDirty:()=>a.some(d=>d.dirty)}}function oe(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function qe(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Ie(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,o=e%86400/3600|0,r=e%3600/60|0;return t>0?t+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function Yt(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var Yo=`
.topbar {
  position: static;
  margin-bottom: 14px;
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg-vibrant);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(18px) saturate(1.25);
}

.topbar-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.top-brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  min-width: 0;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-brand {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 0 22px rgba(255,138,61,.32);
}

.side-nav {
  display: grid;
  gap: 6px;
}

.side-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid transparent;
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: .875rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .55px;
  box-shadow: none;
  transition: .2s ease;
}

.side-link:hover {
  color: var(--text-strong);
  background: rgba(255,255,255,.045);
}

.side-link.active {
  color: var(--text-strong);
  border-color: rgba(255,138,61,.54);
  background: linear-gradient(135deg, rgba(255,138,61,.25), rgba(255,255,255,.075));
  box-shadow: 0 0 0 1px rgba(255,138,61,.08), inset 0 1px 0 rgba(255,255,255,.18), 0 14px 26px rgba(255,138,61,.10);
}

.top-meta {
  display: grid;
  justify-items: end;
  row-gap: 4px;
  color: var(--muted);
  font-size: .82rem;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.meta-chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 34px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.10);
}

.meta-chip-label {
  text-transform: uppercase;
  letter-spacing: .6px;
  font-size: .7rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-secondary);
}

.meta-chip-value {
  font-size: .875rem;
  font-weight: 800;
  line-height: 1;
  color: var(--text-strong);
}

.meta-chip-values {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meta-chip-state.synced {
  color: var(--state-ok);
  border-color: var(--success-border-soft);
  background: var(--success-bg);
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: var(--accent-border);
  background: var(--warn-bg-soft);
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: var(--panel-border-soft);
  background: var(--control-bg);
}

.brand-fw {
  min-height: 12px;
  font-size: .72rem;
  letter-spacing: .7px;
  color: var(--text-secondary);
  font-family: var(--mono);
  text-transform: uppercase;
}

.top-dot {
  width: 10px;
  height: 10px;
  border-radius: 6px;
  background: var(--state-disabled);
  transition: .2s ease;
}

.top-dot.on {
  background: var(--state-ok);
  box-shadow: 0 0 12px var(--success-border);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  .top-meta { justify-items: center; }
  .top-brand { justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .side-nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  .side-link {
    min-width: 0;
    padding: 9px 6px;
    text-align: center;
    font-size: .78rem;
    letter-spacing: .5px;
  }
}
`;E("hv6-header",Yo);var Jo=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">Lune V6</div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label" data-i18n="meta.uptime">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label" data-i18n="meta.wifi">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,oa=N({tag:"hv6-header",render:Jo,onMount(e,t){let o=t.querySelector("#hdr-dot"),r=t.querySelector("#hdr-sync"),a=t.querySelector("#hdr-up"),n=t.querySelector("#hdr-wifi"),s=t.querySelector("#hdr-fw");function i(){let g=P("live"),m=P("pendingWrites"),f=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);o.classList.toggle("on",!!g);let z,x;m>0?(z=b("status.saving"),x="saving"):f?(z=window.HV6_DASHBOARD_CONFIG.mockLabel||b("status.mock"),x="synced"):g?(z=b("status.live"),x="synced"):(z=b("status.offline"),x="offline"),r.textContent=z,r.className="meta-chip meta-chip-state "+x,a.textContent=Ie(M(l.uptime)),n.textContent=Yt(M(l.wifi));let p=P("firmwareVersion")||O(l.firmware);s.textContent=p?"FW "+p:""}B("live",i),B("pendingWrites",i),B("firmwareVersion",i),w(l.uptime,i),w(l.wifi,i),w(l.firmware,i),L(t),i()}}),Qo=()=>`
  <nav class="side-nav">
    <a href="#" class="side-link active" data-section="overview" data-i18n="nav.monitor">Monitor</a>
    <a href="#" class="side-link" data-section="zones" data-i18n="nav.zones">Zones</a>
    <a href="#" class="side-link" data-section="settings" data-i18n="nav.settings">Settings</a>
    <a href="#" class="side-link" data-section="diagnostics" data-i18n="nav.diagnostics">Diagnostics</a>
  </nav>
`;N({tag:"hv6-sidebar",render:Qo,onMount(e,t){let o=t.querySelectorAll(".side-link");function r(){let a=P("section");o.forEach(n=>{n.classList.toggle("active",n.getAttribute("data-section")===a)})}o.forEach(a=>{a.addEventListener("click",n=>{n.preventDefault(),wt(a.getAttribute("data-section"))})}),B("section",r),L(t),r()}});var er=`
.connectivity-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
  height: 100%;
  box-sizing: border-box;
}

.connectivity-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.connectivity-card .st { width: 100%; border-collapse: collapse; }
.connectivity-card .st td { padding: 7px 0; font-size: .92rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 42%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); font-family: var(--mono); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;E("connectivity-card",er);var tr=()=>`
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,ca=N({tag:"connectivity-card",render:tr,onMount(e,t){let o=t.querySelector(".cc-ip"),r=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function s(){o.textContent=O(l.ip)||"---",r.textContent=O(l.ssid)||"---",a.textContent=O(l.mac)||"---",n.textContent=Ie(M(l.uptime))}w(l.ip,s),w(l.ssid,s),w(l.mac,s),w(l.uptime,s),L(t),s()}});var or="http://www.w3.org/2000/svg",rr=`
.chart-card {
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;        /* tooltip anchor */
}

.chart-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
}
.chart-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--accent), var(--state-warn));
  box-shadow: 0 0 18px rgba(255,138,61,.34);
  flex-shrink: 0;
}
.chart-title {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.chart-head .chart-sub {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .4px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .3px;
}
.chart-legend-marker {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 32%, transparent);
  box-shadow: 0 0 14px currentColor;
  flex-shrink: 0;
}

.chart-card svg { width: 100%; height: auto; display: block; overflow: visible; }
.chart-grid { stroke: rgba(218,231,238,.16); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-axis { stroke: rgba(218,231,238,.36); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-tick { fill: var(--chart-axis); font-size: 11px; opacity: .85; }
.chart-axis-label {
  fill: var(--chart-axis); font-size: 9px; letter-spacing: .8px;
  text-transform: uppercase; opacity: .75;
}
/* Time labels use tabular Montserrat digits: equal width, no slashed zero. */
.chart-hour {
  fill: rgba(202,219,248,.78);
  font-family: "Montserrat", sans-serif;
  font-size: 9px;
  font-weight: 500;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  letter-spacing: 0;
}
.chart-hour.now { fill: var(--series-solar); }
.chart-hour.day2 { fill: rgba(202,219,248,.5); }
.chart-empty { fill: var(--text-faint); font-size: 12px; letter-spacing: .3px; }

/* hover cursor + tooltip */
.chart-cursor-line { stroke: rgba(233,222,210,.45); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.chart-cursor-dot { stroke: var(--card); stroke-width: 1.5; }
.chart-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  background: var(--overlay-bg);
  backdrop-filter: blur(12px) saturate(1.15);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 7px 9px;
  font-size: .7rem;
  color: var(--text-strong);
  box-shadow: 0 16px 34px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.12);
  white-space: nowrap;
  opacity: 0;
  transition: opacity .1s ease;
}
.chart-tooltip.show { opacity: 1; }
.chart-tooltip .tt-time { font-weight: 800; letter-spacing: .4px; margin-bottom: 4px; color: var(--text-strong); }
.chart-tooltip .tt-row { display: flex; align-items: center; gap: 6px; line-height: 1.5; }
.chart-tooltip .tt-swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.chart-tooltip .tt-val { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 700; }
`;E("chart-kit",rr);function ee(e,t,o){let r=document.createElementNS(or,e);if(t)for(let a in t)r.setAttribute(a,t[a]);return o!=null&&(r.textContent=o),r}function Jt(e){if(!e.length)return"";if(e.length<3)return"M "+e.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let t=.16,o=`M ${e[0].x.toFixed(2)} ${e[0].y.toFixed(2)}`;for(let r=0;r<e.length-1;r++){let a=e[r-1]||e[r],n=e[r],s=e[r+1],i=e[r+2]||s,g=n.x+(s.x-a.x)*t,m=n.y+(s.y-a.y)*t,f=s.x-(i.x-n.x)*t,z=s.y-(i.y-n.y)*t;o+=` C ${g.toFixed(2)} ${m.toFixed(2)}, ${f.toFixed(2)} ${z.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return o}function Qt(e,t,o){let r=document.createElement("div");r.className="chart-tooltip",t.appendChild(r);let a=ee("g",{class:"chart-cursor",style:"display:none"}),n=ee("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});a.appendChild(n);let s=[];e.appendChild(a);function i(z){let x=0,p=1/0;for(let u=0;u<o.count;u++){let y=Math.abs(z-o.xAt(u));y<p&&(p=y,x=u)}return x}function g(z){let x=e.getScreenCTM();if(!x)return null;let p=e.createSVGPoint();return p.x=z.clientX,p.y=z.clientY,p.matrixTransform(x.inverse())}function m(z){if(!o.count)return;let x=g(z);if(!x)return;let p=i(x.x),u=o.xAt(p);n.setAttribute("x1",u),n.setAttribute("x2",u);let y=o.dots(p);for(;s.length<y.length;){let k=ee("circle",{class:"chart-cursor-dot",r:3.4});a.appendChild(k),s.push(k)}s.forEach((k,h)=>{h<y.length?(k.setAttribute("cx",u),k.setAttribute("cy",y[h].y),k.setAttribute("fill",y[h].color),k.style.display=""):k.style.display="none"}),a.style.display="";let d=o.rows(p).map(k=>`<div class="tt-row"><span class="tt-swatch" style="background:${k.color}"></span>${k.label}<span class="tt-val">${k.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(p)}</div>${d}`,r.classList.add("show");let S=t.getBoundingClientRect(),F=z.clientX-S.left+14;F+r.offsetWidth>S.width-6&&(F=z.clientX-S.left-r.offsetWidth-14),r.style.left=Math.max(6,F)+"px",r.style.top=Math.max(6,z.clientY-S.top+12)+"px"}function f(){r.classList.remove("show"),a.style.display="none"}return e.addEventListener("pointermove",m),e.addEventListener("pointerleave",f),()=>{e.removeEventListener("pointermove",m),e.removeEventListener("pointerleave",f),r.remove()}}var Ce=1e3,mt=180,ae=14,nr=42,ar=44,be=42,Ze=Ce-be-nr,ge=mt-ae-ar,ve=ae+ge,ut=24*3600,eo=J+2,to=J+3,Be=J+4,sr="var(--series-warm)",ir="var(--series-cool)",oo="var(--series-solar)",lr=`
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(0,18,26,.34));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}
.graph-widgets .gw-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.graph-widgets .gw-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025));
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease, opacity .14s ease;
}
.graph-widgets .gw-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 4px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.graph-widgets .gw-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.graph-widgets .gw-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.graph-widgets .gw-toggle[data-layer="flow"] { color: var(--series-warm); }
.graph-widgets .gw-toggle[data-layer="return"] { color: var(--series-cool); }
.graph-widgets .gw-toggle[data-layer="demand"] { color: var(--series-solar); }
`;E("graph-widgets",lr);var ro=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',no=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',dr=e=>e.variant==="flow-return"?`<div class="graph-widgets">${ro()}</div>`:e.variant==="demand"?`<div class="graph-widgets">${no()}</div>`:`<div class="graph-widgets">${ro()}${no()}</div>`;function ao(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1):"\u2014"}function cr(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"\xB0":"\u2014"}function gt(e,t,o){let r=[];for(let a=0;a<e.length;a++){let n=e[a];if(!n||n[0]<o)continue;let s=n[t];s==null||!Number.isFinite(s)||r.push({t:n[0],v:s})}return r}var Ve=(e,t)=>be+Math.max(0,Math.min(1,(e-t)/ut))*Ze;function pr(e,t,o){let r=Number(Date.now()/1e3)|0,a=3600,n=Math.ceil((r-ut)/a)*a,s=Math.floor(r/a)*a,i=Math.floor(r/a)*a;for(let m=n;m<=s;m+=a){let f=o-(r-m),z=Ve(f,t),x=new Date(m*1e3),p=m===i,u=ve+16;e.appendChild(ee("text",{x:z,y:u,"text-anchor":"end",transform:`rotate(-45 ${z.toFixed(1)} ${u})`,class:"chart-hour"+(p?" now":"")},String(x.getHours()).padStart(2,"0")))}let g=Ve(o,t);e.appendChild(ee("line",{x1:g,y1:ae,x2:g,y2:ve,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function mr(e){let t=[];if(e.forEach(n=>n.forEach(s=>t.push(s.v))),!t.length)return{min:0,max:10};let o=Math.min(...t),r=Math.max(...t);o===r&&(o-=.5,r+=.5);let a=(r-o)*.1;return o-=a,r+=a,{min:o,max:r}}function ur(e,t,o){let r=e.filter(a=>a.unit==="C").map(a=>gt(t,a.index,o));return mr(r)}function so(e,t,o,r,a,n){e.innerHTML="",e.setAttribute("viewBox",`0 0 ${Ce} ${mt}`),e.setAttribute("preserveAspectRatio","xMidYMid meet");let s=o.map(u=>gt(r,u.index,a));if(!s.some(u=>u.length))return e.appendChild(ee("text",{x:Ce/2,y:mt/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let i=ur(o,r,a),g=Math.max(.001,i.max-i.min),m=u=>ae+(1-(u-i.min)/g)*ge,f=u=>ae+(1-Math.max(0,Math.min(100,u))/100)*ge,z=(u,y)=>u.unit==="%"?f(y):m(y);for(let u=0;u<3;u++){let y=u/2,d=ae+y*ge;e.appendChild(ee("line",{x1:be,y1:d,x2:be+Ze,y2:d,class:"chart-grid"})),o.some(S=>S.unit==="C")&&e.appendChild(ee("text",{x:be-6,y:d+4,"text-anchor":"end",class:"chart-tick"},ao(i.max-g*y,"C")+"\xB0")),o.some(S=>S.unit==="%")&&e.appendChild(ee("text",{x:be+Ze+6,y:d+4,"text-anchor":"start",class:"chart-tick"},ao(100-100*y,"%")))}e.appendChild(ee("line",{x1:be,y1:ve,x2:be+Ze,y2:ve,class:"chart-axis"})),o.some(u=>u.unit==="C")&&e.appendChild(ee("text",{x:9,y:ae+ge/2,transform:`rotate(-90 9 ${(ae+ge/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},b("overview.graph.axis.temp"))),o.some(u=>u.unit==="%")&&e.appendChild(ee("text",{x:Ce-9,y:ae+ge/2,transform:`rotate(90 ${Ce-9} ${(ae+ge/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},b("overview.graph.axis.demand"))),pr(e,a,n),o.forEach((u,y)=>{let d=s[y].map(F=>({x:Ve(F.t,a),y:z(u,F.v)}));if(!d.length)return;let S=Jt(d);u.fill&&e.appendChild(ee("path",{d:S+` L ${d[d.length-1].x.toFixed(1)} ${ve} L ${d[0].x.toFixed(1)} ${ve} Z`,fill:u.fill,stroke:"none"})),e.appendChild(ee("path",{d:S,fill:"none",stroke:u.color,"stroke-width":String(u.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let x=[];for(let u=0;u<r.length;u++){let y=r[u];if(!y||y[0]<a)continue;let d=o.map(S=>y[S.index]);d.every(S=>S==null||!Number.isFinite(S))||x.push({t:y[0],vals:d})}if(!x.length)return null;let p=Date.now();return Qt(e,t,{count:x.length,plotTop:ae,plotBottom:ve,xAt:u=>Ve(x[u].t,a),label:u=>new Date(p-(n-x[u].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:u=>o.map((y,d)=>({y:z(y,x[u].vals[d]),color:y.color})).filter((y,d)=>Number.isFinite(x[u].vals[d])),rows:u=>o.map((y,d)=>({color:y.color,label:y.label,value:cr(x[u].vals[d],y.unit)})).filter((y,d)=>Number.isFinite(x[u].vals[d]))})}function We(e,t,o){let r=gt(e,t,o);return r.length?r[r.length-1].v:null}var xa=N({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:dr,onMount(e,t){let o=t.querySelector(".gw-dt"),r=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand"),s=Array.from(t.querySelectorAll(".gw-toggle")),i={flow:!0,return:!0,demand:!0},g=null,m=null;function f(){s.forEach(p=>{let u=p.dataset.layer;p.classList.toggle("is-off",!i[u]),p.setAttribute("aria-pressed",i[u]?"true":"false")})}function z(){let p=[];return i.flow&&p.push({index:eo,color:sr,label:b("overview.graph.layers.flow"),unit:"C",width:2.4}),i.return&&p.push({index:to,color:ir,label:b("overview.graph.layers.return"),unit:"C",width:2}),i.demand&&p.push({index:Be,color:oo,label:b("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),p}function x(){let p=P("zoneStateHistory"),u=p&&Array.isArray(p.entries)?p.entries:[],y=p&&p.uptime_s||Number(Date.now()/1e3)|0,d=y-ut;if(a){g&&g();let S=We(u,eo,d),F=We(u,to,d),k=We(u,Be,d),h=[];S!=null&&F!=null&&h.push("\u0394 "+(S-F).toFixed(1)+"\xB0"),k!=null&&h.push(Math.round(k)+"%"),o.textContent=h.length?h.join(" \xB7 "):"\u2014",g=so(a,a.closest(".chart-card"),z(),u,d,y)}if(n){m&&m();let S=We(u,Be,d);r.textContent=S!=null?Math.round(S)+"%":"\u2014",m=so(n,n.closest(".chart-card"),[{index:Be,color:oo,label:b("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],u,d,y)}}s.forEach(p=>{p.addEventListener("click",()=>{let u=p.dataset.layer;i[u]=!i[u],!i.flow&&!i.return&&!i.demand&&(i[u]=!0),f(),x()})}),B("zoneStateHistory",x),L(t),f(),x()}});var fe={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"#ff8531"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Ae=24*3600,gr=Ae,Me=18,vt=4,he=54,$e=32,ke=4,Ue=10,co=6,po="#ffc14d",bt=9,io=J+1,mo=ke+J*(Me+vt)-vt,ft=mo+co,je=mo+co+Ue+$e,br=`
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}

.timeline-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}
.timeline-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--accent), var(--state-warn));
  box-shadow: 0 0 18px rgba(255,138,61,.34);
  flex-shrink: 0;
}
.timeline-head span {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.timeline-head strong {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .70rem;
  font-weight: 600;
  letter-spacing: .4px;
  text-transform: none;
}

.timeline-svg {
  width: 100%;
  display: block;
  border-radius: 8px;
  overflow: visible;
}

.timeline-empty {
  color: var(--text-faint);
  font-size: .78rem;
  padding: 12px 0;
  text-align: center;
  letter-spacing: .3px;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .67rem;
  color: var(--text-secondary);
  letter-spacing: .3px;
}

.tl-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tl-legend-dot.expected {
  width: 14px;
  height: 4px;
  opacity: .55;
  border-radius: 999px;
}
`;E("zone-state-timeline",br);var fr=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function vr(e,t){if(!e||!e.entries||e.entries.length===0)return null;let o=e.entries,r=e.uptime_s||t||0,a=Number(Date.now()/1e3)|0,n=1e3,s=n-he;function i(k){let h=(k+Ae)/gr;return he+Math.max(0,Math.min(1,h))*s}function g(k){return k-r}let m="http://www.w3.org/2000/svg",f=document.createElementNS(m,"svg");f.setAttribute("viewBox","0 0 "+n+" "+je),f.classList.add("timeline-svg");let z=document.createElementNS(m,"rect");z.setAttribute("x",he),z.setAttribute("y",ke),z.setAttribute("width",s),z.setAttribute("height",je-ke-$e),z.setAttribute("fill","rgba(0,32,46,0.55)"),z.setAttribute("rx","4"),f.appendChild(z);let x=i(0),p=[-24,-18,-12,-6,0].map(k=>k*3600);for(let k of p){let h=i(k),_=document.createElementNS(m,"line");_.setAttribute("x1",h),_.setAttribute("y1",ke),_.setAttribute("x2",h),_.setAttribute("y2",je-$e),_.setAttribute("stroke",k===0?"var(--series-solar)":"rgba(120,146,200,.16)"),_.setAttribute("stroke-width","1"),k===0&&(_.setAttribute("stroke-dasharray","2 3"),_.setAttribute("opacity",".55"),_.setAttribute("vector-effect","non-scaling-stroke")),f.appendChild(_)}f.appendChild(hr(m,"text",{x:x+4,y:ke+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let k=0;k<J;k++){let h=ke+k*(Me+vt),_=document.createElementNS(m,"rect");_.setAttribute("x",he),_.setAttribute("y",h),_.setAttribute("width",s),_.setAttribute("height",Me),_.setAttribute("fill",k%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),f.appendChild(_);let C=document.createElementNS(m,"text");C.setAttribute("x",he-4),C.setAttribute("y",h+Me/2+1),C.setAttribute("text-anchor","end"),C.setAttribute("dominant-baseline","middle"),C.setAttribute("fill","rgba(233,222,210,.62)"),C.setAttribute("font-size","9.5"),C.setAttribute("font-family","Montserrat, sans-serif"),C.setAttribute("font-weight","600"),C.textContent="Z"+(k+1),f.appendChild(C);let W=o.map(A=>({rel:g(A[0]),state:A[k+1]})).filter(A=>A.rel>=-Ae&&A.rel<=0),H=(A,Z,I)=>{if(I===255)return;let G=fe[I]||fe[255];if(G.color==="transparent")return;let U=i(A),Se=i(Z),Je=Math.max(1,Se-U),ie=document.createElementNS(m,"rect");ie.setAttribute("x",U),ie.setAttribute("y",h+(Me-bt)/2),ie.setAttribute("width",Je),ie.setAttribute("height",bt),ie.setAttribute("fill",G.color),ie.setAttribute("rx",String(bt/2)),ie.setAttribute("opacity","0.9"),f.appendChild(ie)};if(W.length){let A=W[0].rel,Z=W[0].state;for(let I=1;I<W.length;I++){let G=W[I];G.state!==Z&&(H(A,G.rel,Z),A=G.rel,Z=G.state)}H(A,0,Z)}}{let k=document.createElementNS(m,"rect");k.setAttribute("x",he),k.setAttribute("y",ft),k.setAttribute("width",s),k.setAttribute("height",Ue),k.setAttribute("fill","rgba(188,80,144,0.10)"),k.setAttribute("rx","2"),f.appendChild(k);let h=document.createElementNS(m,"text");h.setAttribute("x",he-4),h.setAttribute("y",ft+Ue/2+1),h.setAttribute("text-anchor","end"),h.setAttribute("dominant-baseline","middle"),h.setAttribute("fill","rgba(233,222,210,.62)"),h.setAttribute("font-size","8.5"),h.setAttribute("font-family","Montserrat, sans-serif"),h.setAttribute("font-weight","600"),h.textContent=b("overview.timeline.absorb"),f.appendChild(h);let _=o.map(C=>({rel:g(C[0]),on:C.length>io?C[io]:0})).filter(C=>C.rel>=-Ae&&C.rel<=0);if(_.length){let C=(A,Z)=>{let I=i(A),G=Math.max(1,i(Z)-I),U=document.createElementNS(m,"rect");U.setAttribute("x",I),U.setAttribute("y",ft),U.setAttribute("width",G),U.setAttribute("height",Ue),U.setAttribute("fill",po),U.setAttribute("rx","2"),U.setAttribute("opacity","0.9"),f.appendChild(U)},W=_[0].rel,H=_[0].on;for(let A=1;A<_.length;A++)_[A].on!==H&&(H&&C(W,_[A].rel),W=_[A].rel,H=_[A].on);H&&C(W,0)}}let u=je-$e+15,y=3600,d=Math.ceil((a-Ae)/y)*y,S=Math.floor(a/y)*y,F=Math.floor(a/y)*y;for(let k=d;k<=S;k+=y){let h=k-a,_=i(h),C=new Date(k*1e3),W=String(C.getHours()).padStart(2,"0"),H=k===F,A=document.createElementNS(m,"text");A.setAttribute("x",_),A.setAttribute("y",u),A.setAttribute("text-anchor","end"),A.setAttribute("fill",H?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),A.setAttribute("font-size","9"),A.setAttribute("font-family",'"Montserrat", sans-serif'),A.setAttribute("font-weight","500"),A.setAttribute("font-variant-numeric","tabular-nums lining-nums"),A.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),A.setAttribute("letter-spacing","0"),A.setAttribute("transform",`rotate(-45 ${_.toFixed(1)} ${u})`),A.textContent=W,f.appendChild(A)}return f}function hr(e,t,o,r){let a=document.createElementNS(e,t);for(let n in o)a.setAttribute(n,o[n]);return r!=null&&(a.textContent=r),a}function lo(e){e.innerHTML="";let t=[{code:5,...fe[5]},{code:6,...fe[6]},{code:0,...fe[0]},{code:1,...fe[1]},{code:7,...fe[7]},{code:2,...fe[2]}];for(let r of t){let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?b(r.labelKey):""),e.appendChild(a)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+po+'"></span>'+b("overview.timeline.preheatAbsorption"),e.appendChild(o)}var La=N({tag:"zone-state-timeline",render:fr,onMount(e,t){let o=t.querySelector(".tl-body"),r=t.querySelector(".timeline-legend");lo(r);function a(){let n=P("zoneStateHistory"),s=(()=>{let g=P&&P("zoneStateHistory");return g&&g.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!n||!n.entries||n.entries.length===0){let g=document.createElement("div");g.className="timeline-empty",g.textContent=b("overview.timeline.noHistory"),o.appendChild(g);return}let i=vr(n,s);i&&o.appendChild(i)}B("zoneStateHistory",a),B("zoneNames",a),w(l.drivers,a);for(let n=1;n<=J;n++)w(c.enabled(n),a),w(c.state(n),a),w(c.temp(n),a),w(c.setpoint(n),a),w(c.preheatAdvance(n),a);L(t),a()}});var xr=`
.zone-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 14px;
}

@media (max-width: 720px) {
    .zone-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 560px) {
    .zone-grid { grid-template-columns: repeat(2, 1fr); }
}
`;E("zone-grid",xr);var yr=()=>'<div class="zone-grid"></div>',Fa=N({tag:"zone-grid",render:yr,onMount(e,t){for(let o=1;o<=6;o++)t.appendChild(j("zone-card",{zone:o}))}});var wr=`
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 8px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,146,200,.45);
	background: linear-gradient(145deg, rgba(255,255,255,.085), rgba(0,0,0,.045));
	box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 10px 22px rgba(0,0,0,.14);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(235,245,248,.30);
	border-left-color: rgba(126,182,216,.82);
	background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.045));
}
.zone-card.active {
	border-color: rgba(255,138,61,.54);
	border-left-color: rgba(255,138,61,.92);
	background: linear-gradient(135deg, rgba(255,138,61,.20), rgba(255,255,255,.075));
	box-shadow: 0 0 0 1px rgba(255,138,61,.08), inset 0 1px 0 rgba(255,255,255,.16), 0 14px 26px rgba(255,138,61,.10);
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,146,200,.35);
}

.zone-card.zs-heating { border-left-color: var(--accent); }
.zone-card.zs-idle { border-left-color: var(--blue); }
.zone-card.zs-fault { border-left-color: var(--state-danger); }
.zone-card.zs-off { border-left-color: rgba(120,146,200,.4); }

.zone-card .zc-state-row {
	display: flex;
	align-items: center;
	gap: 5px;
	line-height: 1;
	min-width: 0;
}

.zone-card .zc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(120,146,200,.4);
}

.zone-card .zc-state-label {
	font-size: .84rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: .55px;
	color: var(--text-secondary);
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-link {
	margin-left: auto;
	padding: 1px 6px 2px;
	border-radius: 8px;
	border: 1px solid rgba(255,138,61,.44);
	background: rgba(255,138,61,.14);
	color: var(--accent);
	font-size: .72rem;
	font-weight: 800;
	line-height: 1.2;
	letter-spacing: .55px;
	white-space: nowrap;
}
.zone-card .zc-link[hidden] { display: none; }

.zone-card .zc-zone-name {
	font-size: 14px;
	font-weight: 800;
	line-height: 1;
	color: var(--text-strong);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-friendly {
	font-size: .84rem;
	font-weight: 600;
	line-height: 1.1;
	color: var(--text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
`;E("zone-card",wr);var zr=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span><span class="zc-link" hidden>LINK</span></div>
		<div class="zc-zone-name">${$(e.zone)}</div>
		<div class="zc-friendly">${me(e.zone)||"---"}</div>
	</div>
`,Ha=N({tag:"zone-card",state:e=>({zone:e.zone}),render:zr,onMount(e,t){let o=e.zone,r=c.temp(o),a=c.state(o),n=c.enabled(o),s=t.querySelector(".zc-state-label"),i=t.querySelector(".zc-dot"),g=t.querySelector(".zc-link"),m=t.querySelector(".zc-zone-name"),f=t.querySelector(".zc-friendly");function z(p){let u=String(p||"").match(/\d+/);return u?Number(u[0]):0}function x(){let p=re(n),u=String(O(a)||"").toUpperCase()||"OFF",y=String(O(c.motorLastFault(o))||"").toUpperCase(),d=y&&y!=="NONE"&&y!=="OK",S=p&&(u==="FAULT"||d)?"FAULT":u,F=P("selectedZone")===o,k=me(o);m.textContent=$(o),f.textContent=k||oe(M(r));let h=p?S:"OFF";s.textContent=h==="HEATING"?b("state.heating"):h==="IDLE"?b("state.idle"):h==="FAULT"?b("common.fault"):h==="MANUAL"?b("state.manual"):h==="OVERHEATED"?b("state.overheated"):h==="CALIBRATING"?b("state.calibrating"):b("state.off");let _=z(O(c.syncTo(o))),C=[];for(let I=1;I<=6;I++)I!==o&&z(O(c.syncTo(I)))===o&&C.push(I);let W=_>0&&_!==o||C.length>0;g.hidden=!W,g.textContent=_>0&&_!==o?b("zone.card.linkZone",{zone:_}):C.length>1?b("zone.card.groupCount",{count:C.length}):b("zone.card.linkZone",{zone:C[0]});let H=_>0&&_!==o?b("zone.card.groupedWith",{zones:$(_)}):C.length>0?b("zone.card.groupedWith",{zones:C.map($).join(", ")}):"";t.title=d?b("zone.card.fault",{fault:y}):H;let A=h==="HEATING"?"#ffd380":h==="IDLE"?"#7aa7ce":h==="FAULT"?"#ff6361":"#6E7E96",Z=h==="HEATING"?"#ff8531":h==="IDLE"?"#7aa7ce":h==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";s.style.color=A,i.style.background=Z,i.style.boxShadow=h==="HEATING"?"0 0 5px rgba(255,133,49,.6)":h==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",F),t.classList.toggle("disabled",!p),t.classList.toggle("zs-heating",p&&h==="HEATING"),t.classList.toggle("zs-fault",p&&h==="FAULT"),t.classList.toggle("zs-idle",p&&h!=="HEATING"&&h!=="FAULT"),t.classList.toggle("zs-off",!p)}t.addEventListener("click",()=>{zt(o)}),w(r,x),w(a,x),w(n,x),w(c.motorLastFault(o),x);for(let p=1;p<=6;p++)w(c.syncTo(p),x);B("selectedZone",x),B("zoneNames",x),x()}});var kr=`
.zone-detail {
  background: var(--panel-bg-flat);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 16px 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
  height: 100%;
  box-sizing: border-box;
}

.zone-detail .zd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-detail .zd-title {
  font-size: .95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-strong);
}

/* Header-right cluster: enable toggle sits next to the state pill. */
.zone-detail .zd-head-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zone-detail .zd-badge {
  border-radius: 8px;
  padding: 3px 9px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .7px;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
  border: 1px solid rgba(125,139,167,.22);
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(255,133,49,.15);
  color: var(--state-warn);
  border-color: rgba(255,133,49,.3);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(122,167,206,.13);
  color: var(--series-cool);
  border-color: rgba(122,167,206,.28);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

/* Body layout \u2014 the header's border-bottom is the only divider (no second
   border-top here, which previously read as a doubled horizontal line). */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-kicker {
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 4px;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.zone-detail .zd-target-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-detail .zd-btns {
  display: flex;
  gap: 6px;
}

.zone-detail .spb {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.15rem;
  transition: .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-detail .spb:hover {
  border-color: rgba(255,133,49,.55);
  color: var(--accent);
  background: rgba(255,133,49,.1);
}

/* Toggle uses the canonical .ui-toggle from the shared ui-kit. */

/* Temperatures on a single row: small uppercase label above a large value. */
.zone-detail .zd-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.zone-detail .zd-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zone-detail .zd-stat-label {
  font-size: .64rem;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}

.zone-detail .zd-motor {
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
  margin-top: 2px;
}
.zone-detail .zd-motor-title {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.zone-detail .zd-motor .zd-stats { margin-top: 2px; }
.zone-detail .zd-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
}
/* The [hidden] attribute must beat the display:flex above, or the row shows
   "Last fault NONE" even when there is no fault. */
.zone-detail .zd-fault[hidden] { display: none; }
.zone-detail .zd-fault-label { color: var(--text-secondary); }
.zone-detail .zd-fault-val { color: var(--state-danger); font-weight: 700; font-family: var(--mono); }
`;E("zone-detail",kr);var Sr=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${$(e.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" data-i18n-label="zone.detail.enabled" data-i18n-title="zone.detail.enabled" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker" data-i18n="zone.detail.targetTemperature">Target Temperature</div>
        <div class="zd-target-row">
          <button class="spb btn-dec" data-i18n-label="common.decrease" aria-label="decrease">\u2212</button>
          <div class="zd-setpoint">---</div>
          <button class="spb btn-inc" data-i18n-label="common.increase" aria-label="increase">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.currentTemp">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.returnTemp">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.flowPct">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <div class="zd-motor">
        <div class="zd-motor-title" data-i18n="zone.detail.motorLearned">Motor learned parameters</div>
        <div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openRipples">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeRipples">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openFactor">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeFactor">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.preheatAdv">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div>
        <div class="zd-fault" hidden><span class="zd-fault-label" data-i18n="zone.detail.lastFault">Last fault</span><span class="zd-fault-val">NONE</span></div>
      </div>
    </div>
  </div>
`;function uo(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function go(e){return e!=null?Number(e).toFixed(0):"---"}function _r(e){return e!=null?Number(e).toFixed(2)+"C":"---"}function Lr(e,t){if(!t)return b("common.disabled");let o=String(e||"IDLE").toUpperCase();return o==="HEATING"?b("state.heating"):o==="IDLE"?b("state.idle"):o==="OFF"?b("state.off"):o==="FAULT"?b("common.fault"):o==="MANUAL"?b("state.manual"):o==="OVERHEATED"?b("state.overheated"):o==="CALIBRATING"?b("state.calibrating"):o}var Ua=N({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Sr,methods:{update(e,t){let o=P("selectedZone"),r=String(O(c.state(o))||"").toUpperCase(),a=re(c.enabled(o));this.zone=o,e.dataset.zone=String(o),t.title.textContent=$(o),t.setpoint.textContent=oe(M(c.setpoint(o))),t.temp.textContent=oe(M(c.temp(o))),t.ret.textContent=oe(M("sensor-manifold_return_temperature")),t.valve.textContent=qe(M(c.valve(o)));let n=t.badge;n.textContent=Lr(r,a);let s=a?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(s?" "+s:""),t.toggle.classList.toggle("on",a),t.orip.textContent=go(M(c.motorOpenRipples(o))),t.crip.textContent=go(M(c.motorCloseRipples(o))),t.ofac.textContent=uo(M(c.motorOpenFactor(o))),t.cfac.textContent=uo(M(c.motorCloseFactor(o))),t.ph.textContent=_r(M(c.preheatAdvance(o)));let i=String(O(c.motorLastFault(o))||"").toUpperCase(),g=i&&i!=="NONE"&&i!=="OK";t.fault.hidden=!g,g&&(t.faultVal.textContent=i)},incSetpoint(){let e=this.zone,t=M(c.setpoint(e))||20;nt(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=M(c.setpoint(e))||20;nt(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=re(c.enabled(e));Tt(e,!t)}},onMount(e,t){let o={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};o.inc.onclick=()=>e.incSetpoint(),o.dec.onclick=()=>e.decSetpoint(),o.toggle.onclick=()=>e.toggleEnabled();let r=()=>e.update(t,o),a=n=>{let s=P("selectedZone");(n===c.temp(s)||n===c.setpoint(s)||n===c.valve(s)||n===c.state(s)||n===c.enabled(s))&&r()};for(let n=1;n<=6;n++)w(c.temp(n),a),w(c.setpoint(n),a),w(c.valve(n),a),w(c.state(n),a),w(c.enabled(n),a),w(c.motorOpenRipples(n),r),w(c.motorCloseRipples(n),r),w(c.motorOpenFactor(n),r),w(c.motorCloseFactor(n),r),w(c.preheatAdvance(n),r),w(c.motorLastFault(n),r);w("sensor-manifold_return_temperature",r),B("selectedZone",r),L(t),r()}});var Cr=`
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025));
  color: var(--text);
  border-radius: 8px;
  padding: 9px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.zone-sensor-card .ble-row .ble-input:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  padding: 9px 13px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.025));
  color: var(--accent);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-scan:disabled {
  opacity: .5;
  cursor: default;
}
.zone-sensor-card .ble-scan-list {
  margin-top: 6px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,.025);
}
.zone-sensor-card .ble-scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: .82rem;
  gap: 8px;
  border-bottom: 1px solid var(--panel-border);
}
.zone-sensor-card .ble-scan-item:last-child { border-bottom: none; }
.zone-sensor-card .ble-scan-item .ble-mac {
  font-family: monospace;
  color: var(--text);
  font-size: .8rem;
}
.zone-sensor-card .ble-scan-item .ble-meta {
  color: var(--text-secondary);
  font-size: .75rem;
}
.zone-sensor-card .ble-scan-item .ble-badge {
  color: var(--text-faint);
  font-size: .72rem;
  font-style: italic;
}
.zone-sensor-card .btn-assign {
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-assign:hover {
  background: rgba(124,155,208,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
.zone-sensor-card .merge-visual {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(255,133,49,.24);
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(255,133,49,.12), rgba(255,255,255,.025));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
.zone-sensor-card .merge-visual.is-solo {
  border-color: var(--panel-border);
  background: rgba(124,155,208,.07);
}
.zone-sensor-card .merge-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.zone-sensor-card .merge-pill {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 8px;
  color: var(--text-strong);
  font-size: .82rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(0,19,29,.42);
}
.zone-sensor-card .merge-pill.secondary {
  border-color: rgba(122,167,206,.42);
}
.zone-sensor-card .merge-pill.primary {
  border-color: rgba(255,133,49,.52);
  color: var(--accent);
}
.zone-sensor-card .merge-link {
  width: 22px;
  height: 2px;
  flex: 0 0 22px;
  background: var(--accent);
  border-radius: 999px;
  position: relative;
  opacity: .9;
}
.zone-sensor-card .merge-link::before,
.zone-sensor-card .merge-link::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(255,133,49,.5);
}
.zone-sensor-card .merge-link::before { left: -1px; }
.zone-sensor-card .merge-link::after { right: -1px; }
.zone-sensor-card .merge-visual.is-solo .merge-link {
  background: rgba(120,146,200,.36);
}
.zone-sensor-card .merge-visual.is-solo .merge-link::before,
.zone-sensor-card .merge-visual.is-solo .merge-link::after {
  background: rgba(120,146,200,.42);
  box-shadow: none;
}
.zone-sensor-card .merge-caption {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: .74rem;
  line-height: 1.35;
}
`;E("zone-sensor-card",Cr);var Ar=()=>{let e='<option value="None" data-i18n="common.none">None</option>';for(let t=1;t<=8;t++)e+='<option value="Probe '+t+'">Probe '+t+"</option>";return`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature Sensors / Connectivity</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.returnSensor">Zone Return Temperature Sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.tempSource">Temperature Source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section" data-i18n="zone.sensor.bleSensor">BLE Sensor</div>
        <div class="ui-note" data-i18n="zone.sensor.bleNote">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</div>
        <div class="ble-row">
          <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan" data-i18n="zone.sensor.scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="ui-divider"></div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="zone.sensor.mergeWith">Merge With Zone</span> <span class="ui-sublabel" data-i18n="zone.sensor.mergeHelp">merge into one room - mean temperature, valves open equally</span></span>
        <span class="ui-field"><select class="ui-select zs-sync"></select></span>
      </div>
      <div class="merge-visual is-solo" aria-live="polite">
        <div class="merge-rail"></div>
        <div class="merge-caption"></div>
      </div>
    </div>
  `};function bo(e,t){let o=e.value,r='<option value="None" data-i18n="common.none">'+b("common.none")+"</option>";for(let a=1;a<=6;a++)a!==t&&(r+='<option value="Zone '+a+'">'+b("common.zone")+" "+a+"</option>");e.innerHTML=r,e.value=o||"None"}function Mr(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Fr(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function fo(e,t){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+b("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+b("zone.sensor.bleSource")+"</option>";e.innerHTML!==o&&(e.innerHTML=o),e.value=t}function vo(e){let t=String(e||"").match(/\d+/);return t?Number(t[0]):0}var os=N({tag:"zone-sensor-card",render:Ar,onMount(e,t){let o=t.querySelector(".zs-probe"),r=t.querySelector(".zs-source"),a=t.querySelector(".zs-ble"),n=t.querySelector(".zs-sync"),s=t.querySelector(".zs-row-ble"),i=t.querySelector(".zs-scan"),g=t.querySelector(".zs-scan-list"),m=t.querySelector(".merge-visual"),f=t.querySelector(".merge-rail"),z=t.querySelector(".merge-caption"),x=0;function p(){return P("selectedZone")}function u(){s.style.display=r.value==="BLE Sensor"?"":"none"}function y(){let h=p(),_=vo(n.value),C=[];for(let Z=1;Z<=6;Z++)Z!==h&&vo(O(c.syncTo(Z)))===h&&C.push(Z);let W=_>0&&_!==h,H=W||C.length>0;if(m.classList.toggle("is-solo",!H),!H){f.innerHTML='<span class="merge-pill primary">'+$(h)+'</span><span class="merge-link"></span><span class="merge-pill">'+b("zone.sensor.noMerge")+"</span>",z.textContent=b("zone.sensor.soloCaption");return}if(W){f.innerHTML='<span class="merge-pill secondary">'+$(h)+'</span><span class="merge-link"></span><span class="merge-pill primary">'+$(_)+"</span>",z.textContent=b("zone.sensor.followsCaption",{zone:$(h),target:$(_)});return}let A='<span class="merge-pill primary">'+$(h)+"</span>";for(let Z of C)A+='<span class="merge-link"></span><span class="merge-pill secondary">'+$(Z)+"</span>";f.innerHTML=A,z.textContent=b("zone.sensor.primaryCaption",{zone:$(h),zones:C.map($).join(", ")})}let d=ne(t);fo(r,"Local Probe"),d.select(o,{read:()=>O(c.probe(p()))||void 0,commit:h=>ze(p(),"zone_probe",h)}),d.select(r,{read:()=>Mr(String(O(c.tempSource(p()))||"")),commit:h=>ze(p(),"zone_temp_source",Fr(h))}),d.select(n,{read:()=>O(c.syncTo(p()))||"None",commit:h=>ze(p(),"zone_sync_to",h)});let S=d.text(a,{read:()=>O(c.ble(p()))||"",commit:h=>Le(p(),"zone_ble_mac",h)});r.addEventListener("change",u),n.addEventListener("change",y);function F(){let h=p();x!==h?(bo(n,h),x=h,g.style.display="none",d.discard()):d.refresh(),u(),y()}function k(h){let _=p();(h===c.probe(_)||h===c.tempSource(_)||h===c.syncTo(_)||h===c.ble(_)||/^select-zone_\d+_sync_to$/.test(h))&&(d.refresh(),u(),y())}i.addEventListener("click",()=>{if(i.disabled)return;i.disabled=!0,i.textContent="\u2026",g.style.display="",g.innerHTML='<div class="scan-msg">'+b("zone.sensor.scanning")+"</div>";let h=new AbortController,_=setTimeout(()=>h.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:h.signal}).then(C=>{if(!C.ok)throw new Error("HTTP "+C.status);return C.json()}).then(C=>{if(clearTimeout(_),i.disabled=!1,i.textContent=b("zone.sensor.scan"),!C.ok||!C.sensors||C.sensors.length===0){g.innerHTML='<div class="scan-msg">'+b("zone.sensor.noSensors")+"</div>";return}let W=p(),H=(O(c.ble(W))||"").toUpperCase(),A=I=>String(I).replace(/[&<>"']/g,G=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[G]),Z="";for(let I of C.sensors){let G=I.mac.toUpperCase(),U=I.name?A(I.name):"",Se=I.temp_c!=null?I.temp_c.toFixed(1)+"\xB0C":"\u2014",Je=I.rssi!=null?I.rssi+" dBm":"",ie=I.age_s<60?b("common.secondsAgo",{value:I.age_s}):b("common.minutesAgo",{value:Math.round(I.age_s/60)}),Qe="";G===H?Qe='<span class="ble-badge">'+b("zone.sensor.assignedThisZone")+"</span>":I.zone>0&&(Qe='<span class="ble-badge">'+b("zone.sensor.zoneBadge",{zone:I.zone})+"</span>");let Lo=U?`<div class="ble-mac">${U}</div><div class="ble-meta">${G}</div>`:`<div class="ble-mac">${G}</div>`;Z+=`<div class="ble-scan-item">
              <div>
                ${Lo}
                <div class="ble-meta">${Se} &nbsp;${Je} &nbsp;${ie}</div>
                ${Qe}
              </div>
              <button class="btn-assign" data-mac="${G}">${b("zone.sensor.assign")}</button>
            </div>`}g.innerHTML=Z,g.querySelectorAll(".btn-assign").forEach(I=>{I.addEventListener("click",()=>{a.value=I.dataset.mac,S.markDirty(),g.style.display="none"})})}).catch(C=>{clearTimeout(_),i.disabled=!1,i.textContent=b("zone.sensor.scan");let W=C&&C.name==="AbortError"?b("zone.sensor.scanTimeout"):b("zone.sensor.scanFailed");g.innerHTML='<div class="scan-msg">'+W+"</div>"})}),B("selectedZone",F);for(let h=1;h<=6;h++)w(c.probe(h),k),w(c.tempSource(h),k),w(c.syncTo(h),k),w(c.ble(h),k);L(t),F()}});var Er=`
.zone-room-card { height: 100%; }

.zone-room-card .wall-lbl-hint {
  font-size: .72rem;
  color: var(--text-faint);
  font-style: italic;
  margin: 2px 0 8px;
}

.zone-room-card .wall-btn-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.zone-room-card .wall-btn {
  padding: 8px 4px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: .79rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.zone-room-card .wall-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(124,155,208,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;E("zone-room-card",Er);var Tr=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone Settings</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Friendly Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.area">Zone Area (m\xB2)</span>
      <span class="ui-field"><input class="ui-input zr-area" type="number" min="1" step="0.1" placeholder="m2"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.spacing">Pipe Spacing C-C (mm)</span>
      <span class="ui-field"><input class="ui-input zr-spacing" type="number" min="50" step="5" placeholder="200"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.pipeType">Pipe Type</span>
      <span class="ui-field"><select class="ui-select zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select></span>
    </div>

    <div class="ui-section" data-i18n="zone.room.exteriorWalls">Exterior Walls</div>
    <div class="wall-lbl-hint" data-i18n="zone.room.selectAll">Select all that apply</div>
    <div class="wall-btn-group">
      <button class="wall-btn" data-wall="None" data-i18n="common.none">None</button>
      <button class="wall-btn" data-wall="N">N</button>
      <button class="wall-btn" data-wall="S">S</button>
      <button class="wall-btn" data-wall="E">E</button>
      <button class="wall-btn" data-wall="W">W</button>
    </div>
  </div>
`,ps=N({tag:"zone-room-card",render:Tr,onMount(e,t){let o=t.querySelector(".zr-friendly"),r=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),s=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn");function i(){return P("selectedZone")}let g=ne(t);g.text(o,{read:()=>me(i())||"",commit:p=>Rt(i(),p)}),g.num(r,{read:()=>M(c.area(i())),commit:p=>at(i(),"zone_area_m2",p)}),g.num(a,{read:()=>M(c.spacing(i())),commit:p=>at(i(),"zone_pipe_spacing_mm",p||200)}),g.select(n,{read:()=>O(c.pipeType(i()))||"Unknown",commit:p=>ze(i(),"zone_pipe_type",p)});let m=[];function f(){s.forEach(p=>{let u=p.dataset.wall;p.classList.toggle("active",u==="None"?m.length===0:m.includes(u))})}let z=g.custom({sync:()=>{let p=O(c.exteriorWalls(i()))||"None";m=p==="None"?[]:p.split(",").filter(Boolean),f()},commit:()=>Le(i(),"zone_exterior_walls",m.length?m.join(","):"None")});s.forEach(p=>{p.addEventListener("click",()=>{let u=p.dataset.wall,y=m.slice();if(u==="None")y=[];else{let d=y.indexOf(u);d>=0?y.splice(d,1):y.push(u)}m=["N","S","E","W"].filter(d=>y.includes(d)),f(),z.markDirty()})});function x(p){let u=i();(p===c.area(u)||p===c.spacing(u)||p===c.pipeType(u)||p===c.exteriorWalls(u))&&g.refresh()}B("selectedZone",g.discard),B("zoneNames",g.refresh);for(let p=1;p<=6;p++)w(c.area(p),x),w(c.spacing(p),x),w(c.pipeType(p),x),w(c.exteriorWalls(p),x);L(t),g.refresh()}});var se=6,Nr="#6E7E96",yo="#5C6B85",Dr="#7aa7ce",Rr="#9DBC78",Or="#FF8531",Pr="#FFA600",Hr="#7aa7ce",qr="#FFEAD2",Ir="#6E7E96",ho="#B9CBD8",Ge="#5C6B85",ht="#A6B9C7",wo="#A6B9C7",xo="#7aa7ce",Br="#66BB6A",Wr="#FF6361",V={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,topBarY:0,topBarH:24,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},T={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},Zr=`
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

.flow-metric {
  font-family: var(--mono);
  font-weight: 800;
}

@media (max-width: 760px) {
  .flow-svg-desktop { display: none; }
  .flow-svg-mobile { display: block; }
}
`;E("flow-diagram",Zr);function Vr(e,t){let o=String(me(e)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>t?r.slice(0,Math.max(1,t-1))+"\u2026":r}function jr(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let o=Number(t[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function $r(e,t){return t?e==null||Number.isNaN(e)?yo:e<.15?Dr:e<.4?Rr:e<.7?Or:Pr:Nr}function zo(e){let t=e==="desktop"?"0 1":"1 0",o=[];o.push("<defs>"),o.push('<pattern id="'+e+'-fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="'+e+'-fglow" cx="32%" cy="18%" r="78%"><stop offset="0%" stop-color="rgba(122,167,206,0.18)"/><stop offset="52%" stop-color="rgba(240,121,91,0.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="'+e+'-boxgrad" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(let r=1;r<=se;r++)o.push('<linearGradient id="'+e+"-rg"+r+'" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'">'),o.push('<stop id="'+e+"-rgs"+r+'" offset="0%" stop-color="#ff8531"/>'),o.push('<stop id="'+e+"-rga"+r+'" offset="100%" stop-color="#7aa7ce"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function Xe(e,t,o){let r=V.boxX+V.boxW/2+(e-2.5)*V.srcSpread,a=V.srcY,n=V.zoneXs[e],s=V.zoneY-20,i=V.fanY,g=V.fanY+34;return"M"+(r-t).toFixed(1)+" "+a+" C"+(r-t).toFixed(1)+" "+i+" "+(n-o).toFixed(1)+" "+g+" "+(n-o).toFixed(1)+" "+s+" L"+(n+o).toFixed(1)+" "+s+" C"+(n+o).toFixed(1)+" "+g+" "+(r+t).toFixed(1)+" "+i+" "+(r+t).toFixed(1)+" "+a+"Z"}function Ke(e,t,o){let r=T.midY+(e-2.5)*T.spread,a=T.zoneYs[e],n=T.endX-T.srcX,s=T.srcX+n*.34,i=T.srcX+n*.7;return"M"+T.srcX+" "+(r-t).toFixed(1)+" C"+s+" "+(r-t).toFixed(1)+" "+i+" "+(a-o).toFixed(1)+" "+T.endX+" "+(a-o).toFixed(1)+" L"+T.endX+" "+(a+o).toFixed(1)+" C"+i+" "+(a+o).toFixed(1)+" "+s+" "+(r+t).toFixed(1)+" "+T.srcX+" "+(r+t).toFixed(1)+"Z"}function ko(e,t,o){return'<rect width="'+e+'" height="'+t+'" rx="22" fill="var(--card)"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fdots)" opacity="0.48"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fglow)"/>'}function So(e){let t=e==="desktop"?V:T,o=e==="desktop"?t.boxY+27:t.boxY+29,r=e==="desktop"?t.boxY+56:t.boxY+58;return'<rect x="'+t.boxX+'" y="'+t.boxY+'" width="'+t.boxW+'" height="'+t.boxH+'" rx="7" fill="#ff8531"/><text id="'+e+'-fd-flow-label" x="'+(t.boxX+t.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(e==="desktop"?18:17)+'" font-weight="800" fill="var(--text-on-accent)" letter-spacing="2">'+b("overview.flowDiagram.flow")+'</text><text id="'+e+'-fd-flow-temp" class="flow-metric" x="'+(t.boxX+t.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(e==="desktop"?26:24)+'" fill="var(--text-on-accent)">---</text>'}function Ur(){let e=[],t=V.w,o=V.h,r=V.zoneY-20;e.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+t+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet">'),e.push(zo("desktop")),e.push(ko(t,o,"desktop")),e.push('<rect x="'+V.boxX+'" y="'+V.topBarY+'" width="'+V.boxW+'" height="'+V.topBarH+'" fill="url(#desktop-boxgrad)" rx="5"/>'),e.push(So("desktop")),e.push('<text id="desktop-fd-ret-temp" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+20)+'" font-size="15" font-weight="800" fill="#7aa7ce" font-family="var(--mono)">'+b("overview.flowDiagram.returnShort")+" ---</text>"),e.push('<text id="desktop-fd-dt-label" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+42)+'" font-size="12" font-weight="800" fill="'+wo+'" letter-spacing="2">'+b("overview.flowDiagram.dt")+"</text>"),e.push('<text id="desktop-fd-dt" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+65)+'" class="flow-metric" font-size="22" fill="#ff8531">---</text>');for(let a=1;a<=se;a++)e.push('<path d="'+Xe(a-1,V.srcHW,V.bgDstHW)+'" fill="#021824" opacity="0.9"/>');for(let a=1;a<=se;a++)e.push('<path id="desktop-fd-path-'+a+'" class="flow-ribbon" d="'+Xe(a-1,V.srcHW,V.bgDstHW)+'" fill="url(#desktop-rg'+a+')" opacity="1"/>');e.push('<line x1="54" y1="'+r+'" x2="'+(t-54)+'" y2="'+r+'" stroke="#ff8531" stroke-width="2" opacity=".42"/>');for(let a=1;a<=se;a++){let n=V.zoneXs[a-1];e.push('<g class="flow-zone-hit">'),e.push('<line x1="'+n+'" y1="'+(r-8)+'" x2="'+n+'" y2="'+(r+8)+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="desktop-fd-zn'+a+'" x="'+n+'" y="'+(r-13)+'" text-anchor="middle" font-size="13" fill="#FFEAD2" font-weight="800" letter-spacing="1.8">Z'+a+"</text>"),e.push('<text id="desktop-fd-zf'+a+'" x="'+n+'" y="'+(r+20)+'" text-anchor="middle" font-size="9.5" fill="#AFC1CD" font-weight="700" letter-spacing=".8">---</text>'),e.push('<text id="desktop-fd-zsp'+a+'" x="'+n+'" y="'+(r+20)+'" text-anchor="middle" font-size="9" fill="'+Ge+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="desktop-fd-zt'+a+'" x="'+n+'" y="'+(r+42)+'" text-anchor="middle" class="flow-metric" font-size="15" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="desktop-fd-zv'+a+'" x="'+(n-28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C3D0D9">---%</text>'),e.push('<text id="desktop-fd-zr'+a+'" x="'+(n+28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C3D0D9">---</text>'),e.push("</g>")}return e.push("</svg>"),e.join("")}function Gr(){let e=[],t=T.w,o=T.h;e.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+t+" "+o+'" preserveAspectRatio="xMidYMid meet">'),e.push(zo("mobile")),e.push(ko(t,o,"mobile")),e.push('<rect x="0" y="'+T.boxY+'" width="'+(T.boxX-6)+'" height="'+T.boxH+'" fill="url(#mobile-boxgrad)" rx="4"/>'),e.push(So("mobile"));for(let r=1;r<=se;r++)e.push('<path d="'+Ke(r-1,T.srcHW,T.bgDstHW)+'" fill="#021824" opacity="0.9"/>');for(let r=1;r<=se;r++)e.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+Ke(r-1,T.srcHW,T.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');e.push('<rect x="'+(T.boxX+9)+'" y="'+(T.boxY+T.boxH+9)+'" width="'+(T.boxW-18)+'" height="60" rx="8" fill="rgba(2,29,43,.74)"/>'),e.push('<text id="mobile-fd-ret-temp" x="'+(T.boxX+T.boxW/2)+'" y="'+(T.boxY+T.boxH+27)+'" text-anchor="middle" font-size="12.5" font-weight="800" fill="#7aa7ce" font-family="var(--mono)">'+b("overview.flowDiagram.returnShort")+" ---</text>"),e.push('<text id="mobile-fd-dt-label" x="'+(T.boxX+T.boxW/2)+'" y="'+(T.boxY+T.boxH+43)+'" text-anchor="middle" font-size="9.5" font-weight="800" fill="'+wo+'" letter-spacing="1.1">'+b("overview.flowDiagram.dt")+"</text>"),e.push('<text id="mobile-fd-dt" x="'+(T.boxX+T.boxW/2)+'" y="'+(T.boxY+T.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="#ff8531">---</text>'),e.push('<line x1="'+T.endX+'" y1="34" x2="'+T.endX+'" y2="'+(o-34)+'" stroke="#ff8531" stroke-width="2" opacity=".48"/>'),e.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="10" fill="'+ht+'" font-weight="700" letter-spacing="1.5">'+b("overview.graph.layers.temp").toUpperCase()+"</text>"),e.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="10" fill="'+ht+'" font-weight="700" letter-spacing="1.5">'+b("overview.flowDiagram.flow")+"</text>"),e.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="10" fill="'+ht+'" font-weight="700" letter-spacing="1.5">'+b("overview.flowDiagram.returnShort")+"</text>");for(let r=1;r<=se;r++){let a=T.zoneYs[r-1];e.push('<line x1="'+(T.endX-8)+'" y1="'+a+'" x2="'+(T.endX+8)+'" y2="'+a+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="mobile-fd-zn'+r+'" x="'+(T.endX-14)+'" y="'+(a+4)+'" text-anchor="end" font-size="12" fill="#FFEAD2" font-weight="800" letter-spacing="1.4">Z'+r+"</text>"),e.push('<text id="mobile-fd-zf'+r+'" x="'+T.nameX+'" y="'+(a-8)+'" text-anchor="middle" font-size="9" fill="#AFC1CD" font-weight="700" letter-spacing=".7">---</text>'),e.push('<text id="mobile-fd-zsp'+r+'" x="'+T.nameX+'" y="'+(a+7)+'" text-anchor="middle" font-size="8.5" fill="'+Ge+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#C3D0D9">---%</text>'),e.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#C3D0D9">---</text>')}return e.push("</svg>"),e.join("")}var Xr=()=>'<div class="flow-wrap">'+Ur()+Gr()+"</div>";N({tag:"flow-diagram",render:Xr,onMount(e,t){let o=["desktop","mobile"],r={};o.forEach(m=>{r[m]={flowEl:t.querySelector("#"+m+"-fd-flow-temp"),flowLabelEl:t.querySelector("#"+m+"-fd-flow-label"),retEl:t.querySelector("#"+m+"-fd-ret-temp"),dtLabelEl:t.querySelector("#"+m+"-fd-dt-label"),dtEl:t.querySelector("#"+m+"-fd-dt"),zones:new Array(se+1)};for(let f=1;f<=se;f++)r[m].zones[f]={textTemp:t.querySelector("#"+m+"-fd-zt"+f),textSetpoint:t.querySelector("#"+m+"-fd-zsp"+f),textFlow:t.querySelector("#"+m+"-fd-zv"+f),textRet:t.querySelector("#"+m+"-fd-zr"+f),label:t.querySelector("#"+m+"-fd-zn"+f),friendly:t.querySelector("#"+m+"-fd-zf"+f),path:t.querySelector("#"+m+"-fd-path-"+f)}});function a(m,f){m&&(m.textContent=f)}function n(m,f,z,x,p){let u=r[m];a(u.flowLabelEl,b("overview.flowDiagram.flow")),a(u.flowEl,oe(f)),a(u.retEl,b("overview.flowDiagram.returnShort")+" "+oe(z)),a(u.dtLabelEl,b("overview.flowDiagram.dt")),a(u.dtEl,x==null?"---":x.toFixed(1)+"\xB0C"),u.dtEl&&u.dtEl.setAttribute("fill",p)}function s(){a(t.querySelector("#mobile-fd-temp-head"),b("overview.graph.layers.temp").toUpperCase()),a(t.querySelector("#mobile-fd-flow-head"),b("overview.flowDiagram.flow")),a(t.querySelector("#mobile-fd-ret-head"),b("overview.flowDiagram.returnShort"))}function i(m,f,z){let x=r[m].zones[f];if(!x)return;let{enabled:p,pct:u,temp:y,setpoint:d,valve:S,returnTemp:F,hasReturn:k}=z,h=Vr(f,m==="desktop"?11:12),_=oe(y),C=d!=null?oe(d):"";a(x.label,"Z"+f),a(x.friendly,m==="desktop"?(h||"---")+(C?" ("+C+")":""):h||"---"),a(x.textTemp,_),a(x.textSetpoint,m==="desktop"?"":C?"("+C+")":""),a(x.textFlow,qe(S)),a(x.textRet,k?oe(F):"---"),x.label.setAttribute("fill",p?qr:Ir),x.friendly.setAttribute("fill",p?ho:Ge),x.textSetpoint.setAttribute("fill",p?ho:Ge),x.textFlow.setAttribute("fill",$r(u,p)),x.textRet.setAttribute("fill",k&&p?Hr:yo);let W=x.path;if(!p)W.setAttribute("d",m==="desktop"?Xe(f-1,1,2):Ke(f-1,1,2)),W.setAttribute("fill","#021824"),W.setAttribute("opacity","0.38");else{let H=m==="desktop"?V:T,A=Math.max(2.5,u*H.bgDstHW),Z=Math.max(1.3,u*H.srcHW);W.setAttribute("d",m==="desktop"?Xe(f-1,Z,A):Ke(f-1,Z,A)),W.setAttribute("fill","url(#"+m+"-rg"+f+")"),W.setAttribute("opacity","1")}}function g(){let m=M(l.flow),f=M(l.ret),z=m!=null&&f!=null?Number(m)-Number(f):null,x=z==null||z<3?xo:z>8?Wr:Br;o.forEach(p=>n(p,m,f,z,x));for(let p=1;p<=se;p++){let u=M(c.temp(p)),y=M(c.setpoint(p)),d=M(c.valve(p)),S=re(c.enabled(p)),F=String(O(c.tempSource(p))||"Local Probe"),k=jr(O(c.probe(p))||""),h=k?M(c.probeTemp(k)):null,_=F!=="Local Probe"&&h!=null&&!Number.isNaN(Number(h)),C=d!=null?Math.max(0,Math.min(100,Number(d)))/100:0,W={enabled:S,pct:C,temp:u,setpoint:y,valve:d,returnTemp:h,hasReturn:_};o.forEach(H=>i(H,p,W))}}w(l.flow,g),w(l.ret,g),B("zoneNames",g);for(let m=1;m<=se;m++)w(c.temp(m),g),w(c.setpoint(m),g),w(c.valve(m),g),w(c.enabled(m),g),w(c.probe(m),g),w(c.tempSource(m),g);for(let m=1;m<=8;m++)w(c.probeTemp(m),g);s(),g()}});var Kr={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},Yr=`
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}

.logs-view .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.logs-view .actions { display: flex; gap: 6px; }
.logs-view .btn {
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055));
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  cursor: pointer;
}
.logs-view .btn:hover { color: var(--text-strong); background: var(--control-bg-hover); }
.logs-view .btn.on { color: var(--text-on-accent); border-color: var(--accent); background: var(--accent); }

.logs-stream {
  margin-top: 4px;
  height: 420px;
  overflow-y: auto;
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(0,0,0,.18), rgba(255,255,255,.035));
  border: 1px solid var(--control-border);
  padding: 6px 0;
  font-family: var(--mono);
  scrollbar-width: thin;
  scrollbar-color: rgba(124,155,208,.25) transparent;
}
.logs-stream::-webkit-scrollbar { width: 6px; }
.logs-stream::-webkit-scrollbar-thumb { background: rgba(124,155,208,.25); border-radius: 999px; }

.logs-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 24px; }

.log-line {
  display: grid;
  grid-template-columns: 20px 104px 1fr;
  gap: 8px;
  padding: 3px 12px;
  font-size: .84rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.log-line .lv { font-weight: 800; text-align: center; }
.log-line .tag { color: var(--accent); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-line .msg { color: var(--text-strong); opacity: .92; }
`;E("logs-view",Yr);var Jr=()=>`
  <div class="logs-view">
    <div class="card-title">
      <span data-i18n="logs.deviceLogs">Device Logs</span>
      <div class="actions">
        <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
        <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      </div>
    </div>
    <div class="logs-stream"></div>
  </div>
`;function Qr(e){let t=Kr[e.level]||{label:"?",color:"var(--text-secondary)"},o=_o(e.tag||""),r=_o(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function _o(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var ks=N({tag:"logs-view",render:Jr,onMount(e,t){let o=t.querySelector(".logs-stream"),r=t.querySelector(".pause-btn"),a=t.querySelector(".clear-btn"),n=!1;function s(){if(n)return;let i=Lt();if(!i||!i.length){o.innerHTML='<div class="logs-empty">'+b("logs.waiting")+"</div>";return}let g=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=i.map(Qr).join(""),g&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{n=!n,r.textContent=n?b("logs.resume"):b("logs.pause"),r.classList.toggle("on",n),n||s()}),a.addEventListener("click",()=>{Ct()}),B("deviceLog",s),L(t),s()}});var en=`
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}
.diag-i2c .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-i2c pre {
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.btn-row { margin-top: 12px; }
.btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--control-border); background: linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.055)); color: var(--text-strong); font-weight: 700; cursor: pointer; }
.btn:hover { background: linear-gradient(135deg, rgba(255,138,61,.90), rgba(255,189,74,.84)); border-color: rgba(255,138,61,.5); color: var(--text-on-accent); }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;E("diag-i2c",en);var tn=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,Fs=N({tag:"diag-i2c",render:tn,onMount(e,t){let o=t.querySelector("#i2c-result");function r(){o.textContent=P("i2cResult")||b("diagnostics.i2c.empty")}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Dt()}),B("i2cResult",r),L(t),r()}});var on=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--danger-border-soft);
  background: var(--danger-bg);
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}

.diag-manual-badge.on {
  display: flex;
}

.diag-manual-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--state-danger);
  box-shadow: 0 0 10px var(--danger-border);
}

.diag-manual-text {
  color: var(--danger-text);
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .35px;
  text-transform: uppercase;
}
`;E("diag-manual-badge",on);var rn=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Os=N({tag:"diag-manual-badge",render:rn,onMount(e,t){let o=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function r(){let a=!!P("manualMode");o&&o.classList.toggle("on",a)}B("manualMode",r),L(t),r()}});var nn=`
.diag-zone-motor {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}
.diag-zone-motor .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-motor .cfg-row {
  display: grid;
  grid-template-columns: minmax(104px, 140px) minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
  min-width: 0;
}
.diag-zone-motor .cfg-row.manual-row {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 8px 0 12px;
  border-bottom: 1px solid var(--panel-border);
  margin-bottom: 14px;
}
.diag-zone-motor .manual-note {
  color: var(--text-secondary);
  font-size: .82rem;
  font-weight: 600;
  min-width: 0;
}
.diag-zone-motor .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 0;
}
.diag-zone-motor .mn-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.diag-zone-motor .sel {
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  width: 100%;
  min-width: 0;
  transition: border-color .15s ease;
}
.diag-zone-motor .sel:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}
.diag-zone-motor .mn-inp {
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  width: 80px;
  font-size: .95rem;
  transition: border-color .15s ease;
}
.diag-zone-motor .mn-inp:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}
.diag-zone-motor .mn-unit {
  color: var(--muted);
  font-size: .9rem;
  font-weight: 500;
}
.diag-zone-motor .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.diag-zone-motor .btn {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-motor .btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--accent-border-hover);
  color: var(--accent-text-soft);
}
.diag-zone-motor .btn.warn {
  background: var(--danger-bg);
  border-color: var(--danger-border-soft);
  color: var(--danger-text);
}
.diag-zone-motor .btn.warn:hover {
  background: linear-gradient(135deg, var(--danger-bg-strong), var(--danger-bg-soft));
  border-color: var(--danger-border);
}
.diag-zone-motor .sw {
  width: 50px;
  height: 28px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  border: 1px solid var(--control-border);
  position: relative;
  cursor: pointer;
  transition: .2s ease;
  flex-shrink: 0;
}
.diag-zone-motor .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--control-knob);
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: var(--control-border-strong);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: var(--text-on-accent);
}
.diag-zone-motor .gated {
  transition: opacity .18s ease;
}
.diag-zone-motor .gated.locked {
  opacity: .48;
}
.diag-zone-motor .gated.locked .btn,
.diag-zone-motor .gated.locked .mn-inp,
.diag-zone-motor .gated.locked .sel {
  cursor: not-allowed;
}
`;E("diag-zone-motor",nn);var an=e=>{let t=e.zone||P("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">"+b("common.zone")+" "+r+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title" data-i18n="diagnostics.motor.title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note" data-i18n="diagnostics.motor.manualNote">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" data-i18n-label="diagnostics.motor.manualNote" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl" data-i18n="diagnostics.motor.motor">Motor</span>
          <select class="sel motor-zone-select">${o}</select>
        </div>
        <div class="cfg-row">
          <span class="lbl" data-i18n="diagnostics.motor.target">Motor Target</span>
          <div class="mn-wrap">
            <input type="number" class="mn-inp motor-target-input" min="0" max="100" step="1" value="0">
            <span class="mn-unit">%</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn motor-open-btn" data-i18n="diagnostics.motor.open10">Open 10s</button>
          <button class="btn motor-close-btn" data-i18n="diagnostics.motor.close10">Close 10s</button>
          <button class="btn warn motor-stop-btn" data-i18n="diagnostics.motor.stop">Stop</button>
        </div>
      </div>
    </div>
  `},Vs=N({tag:"diag-zone-motor-card",render:an,onMount(e,t){let o=Number(e.zone||P("selectedZone")||1),r=!!P("manualMode"),a=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),s=t.querySelector(".motor-zone-select"),i=t.querySelector(".motor-target-input"),g=t.querySelector(".motor-open-btn"),m=t.querySelector(".motor-close-btn"),f=t.querySelector(".motor-stop-btn"),z=()=>{let y=s.value||String(o),d="";for(let S=1;S<=6;S++)d+='<option value="'+S+'">'+b("common.zone")+" "+S+"</option>";s.innerHTML=d,s.value=y};function x(y){r=!!y,a&&(a.classList.toggle("on",r),a.setAttribute("aria-checked",r?"true":"false")),n&&n.classList.toggle("locked",!r),[s,i,g,m,f].forEach(d=>{d&&(d.disabled=!r)})}function p(){let y=!r;if(x(y),y){it(!0);for(let d=1;d<=6;d++)st(d)}else it(!1)}function u(){let y=M(c.motorTarget(o));i&&y!=null?i.value=Number(y).toFixed(0):i&&(i.value="0")}s==null||s.addEventListener("change",()=>{o=Number(s.value||1),u()}),a==null||a.addEventListener("click",p),a==null||a.addEventListener("keydown",y=>{y.key!==" "&&y.key!=="Enter"||(y.preventDefault(),p())});for(let y=1;y<=6;y++)w(c.motorTarget(y),u);u(),x(r),B("manualMode",()=>{x(!!P("manualMode"))}),L(t),i==null||i.addEventListener("change",y=>{if(!r)return;let d=y.target.value;Ot(o,d)}),g==null||g.addEventListener("click",()=>{r&&Pt(o,1e4)}),m==null||m.addEventListener("click",()=>{r&&Ht(o,1e4)}),f==null||f.addEventListener("click",()=>{r&&st(o)})}});var sn=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}
.diag-zone-recovery .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-recovery .recovery-note {
  color: var(--text-secondary);
  font-size: .76rem;
  line-height: 1.4;
  margin-bottom: 12px;
}
.diag-zone-recovery .recovery-status {
  margin-top: 10px;
  font-size: .78rem;
  font-weight: 600;
  min-height: 1.1em;
  opacity: 0;
  transition: opacity .15s ease;
}
.diag-zone-recovery .recovery-status.show { opacity: 1; }
.diag-zone-recovery .recovery-status.ok { color: var(--state-ok); }
.diag-zone-recovery .recovery-status.err { color: var(--state-danger); }
.diag-zone-recovery .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.diag-zone-recovery .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-recovery .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-recovery .sel {
  background: linear-gradient(145deg, rgba(0,0,0,.16), rgba(255,255,255,.05));
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  min-width: 140px;
  transition: border-color .15s ease;
}
.diag-zone-recovery .sel:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}
.diag-zone-recovery .btn {
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-recovery .btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--accent-border-hover);
  color: var(--accent-text-soft);
}
.diag-zone-recovery .btn.warn {
  background: var(--danger-bg);
  border-color: var(--danger-border-soft);
  color: var(--danger-text);
}
.diag-zone-recovery .btn.warn:hover {
  background: linear-gradient(135deg, var(--danger-bg-strong), var(--danger-bg-soft));
  border-color: var(--danger-border);
}
`;E("diag-zone-recovery",sn);var ln=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title" data-i18n="diagnostics.recovery.title">Faults &amp; Relearn</div>
      <div class="recovery-note" data-i18n="diagnostics.recovery.note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Reset Fault</button>
        <button class="btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset + Relearn</button>
      </div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,Ys=N({tag:"diag-zone-recovery-card",render:ln,onMount(e,t){let o=Number(P("selectedZone")||1),r=t.querySelector(".recovery-fault-btn"),a=t.querySelector(".recovery-factors-btn"),n=t.querySelector(".recovery-relearn-btn"),s=t.querySelector(".recovery-status");B("selectedZone",()=>{o=Number(P("selectedZone")||1)});let i=null;function g(f,z){s.textContent=f,s.className="recovery-status show "+(z?"ok":"err"),clearTimeout(i),i=setTimeout(()=>{s.classList.remove("show")},4e3)}function m(f,z){let x=f(o);g(z,!0),x&&typeof x.then=="function"&&x.then(p=>{p&&p.ok===!1&&g(b("diagnostics.recovery.rejected"),!1)}).catch(()=>g(b("diagnostics.recovery.unreachable"),!1))}r==null||r.addEventListener("click",()=>{m(qt,"\u2713 "+b("diagnostics.recovery.faultSent",{zone:$(o)}))}),a==null||a.addEventListener("click",()=>{confirm(b("diagnostics.recovery.confirmFactors",{zone:$(o)}))&&m(It,"\u2713 "+b("diagnostics.recovery.factorsReset",{zone:$(o)}))}),n==null||n.addEventListener("click",()=>{confirm(b("diagnostics.recovery.confirmRelearn",{zone:$(o)}))&&m(Bt,"\u2713 "+b("diagnostics.recovery.relearnStarted",{zone:$(o)}))}),L(t)}});var dn=`
.diag-system-card .sys-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 4px;
}
.diag-system-card .sys-cell { display: flex; flex-direction: column; gap: 4px; }
.diag-system-card .sys-label {
  color: var(--text-secondary); font-size: .64rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
}
.diag-system-card .sys-value {
  font-family: var(--mono); font-size: 1.5rem; font-weight: 800;
  color: var(--text-strong); line-height: 1;
}
.diag-system-card .sys-value.warn { color: #FFB4B4; }
.diag-system-card .sys-bar {
  height: 4px; border-radius: 3px; margin-top: 6px;
  background: var(--control-bg-hover); overflow: hidden;
}
.diag-system-card .sys-bar > i {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, #6FCF97, #F2C94C, #EB5757);
  background-size: 300% 100%; background-position: 0% 0;
  transition: width .4s ease;
}
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;E("diag-system-card",dn);var cn=()=>`
  <div class="ui-card diag-system-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.system.title">System</span></div>
    <div class="sys-grid">
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.cpu0">CPU Core 0</div>
        <div class="sys-value" data-k="cpu0">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu0"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.cpu1">CPU Core 1</div>
        <div class="sys-value" data-k="cpu1">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu1"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.heap">Free Heap (int)</div>
        <div class="sys-value" data-k="heap">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.psram">Free PSRAM</div>
        <div class="sys-value" data-k="psram">\u2014</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button" data-i18n="diagnostics.system.dump">Dump task stats to log</button>
    <div class="ui-note" data-i18n="diagnostics.system.note">Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.</div>
  </div>
`,ai=N({tag:"diag-system-card",render:cn,onMount(e,t){let o=t.querySelector('[data-k="cpu0"]'),r=t.querySelector('[data-k="cpu1"]'),a=t.querySelector('[data-k="heap"]'),n=t.querySelector('[data-k="psram"]'),s=t.querySelector('[data-bar="cpu0"]'),i=t.querySelector('[data-bar="cpu1"]'),g=(z,x,p)=>{if(p==null||!Number.isFinite(Number(p))){z.textContent="\u2014",z.classList.remove("warn"),x.style.width="0%";return}let u=Math.max(0,Math.min(100,Number(p)));z.textContent=u.toFixed(0)+"%",z.classList.toggle("warn",u>=90),x.style.width=u+"%",x.style.backgroundPosition=u+"% 0"},m=(z,x,p)=>{if(x==null||!Number.isFinite(Number(x))){z.textContent="\u2014";return}let u=Number(x);z.textContent=u+" KB",z.classList.toggle("warn",p!=null&&u<p)},f=()=>{g(o,s,M(l.cpuLoadCore0)),g(r,i,M(l.cpuLoadCore1)),m(a,M(l.freeInternalKb),48),m(n,M(l.freePsramKb),null)};t.querySelector(".sys-dump").addEventListener("click",()=>{Wt().catch(z=>console.error("[System] dump failed:",z))}),w(l.cpuLoadCore0,f),w(l.cpuLoadCore1,f),w(l.freeInternalKb,f),w(l.freePsramKb,f),L(t),f()}});var pn=`
/* Probe readouts mirror the zone-detail stat style: small uppercase label
   above a large mono value, no cell chrome. */
.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-manifold-card .probe-temp {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}
`;E("settings-manifold-card",pn);var mn=()=>{let e="";for(let o=1;o<=8;o++)e+="<option>Probe "+o+"</option>";let t="";for(let o=1;o<=8;o++)t+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${ue("settings.manifold.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.type">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)" data-i18n="settings.manifold.normallyOpen">Normally Open (NO)</option><option value="NC (Normally Closed)" data-i18n="settings.manifold.normallyClosed">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.flowProbe">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.returnProbe">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${e}</select></span>
      </div>
      <div class="ui-section" data-i18n="settings.manifold.probeTemps">Probe Temperatures</div>
      <div class="probe-grid">${t}</div>
    </div>
  `},bi=N({tag:"settings-manifold-card",render:mn,onMount(e,t){let o=t.querySelector(".sm-type"),r=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret"),n=ne(t);n.select(o,{read:()=>O(l.manifoldType)||"NO (Normally Open)",commit:i=>le("manifold_type",i)}),n.select(r,{read:()=>O(l.manifoldFlowProbe)||"Probe 7",commit:i=>le("manifold_flow_probe",i)}),n.select(a,{read:()=>O(l.manifoldReturnProbe)||"Probe 8",commit:i=>le("manifold_return_probe",i)});function s(){for(let i=1;i<=8;i++){let g=t.querySelector('[data-probe="'+i+'"]');g&&(g.textContent=oe(M(c.probeTemp(i))))}}w(l.manifoldType,n.refresh),w(l.manifoldFlowProbe,n.refresh),w(l.manifoldReturnProbe,n.refresh);for(let i=1;i<=8;i++)w(c.probeTemp(i),s);L(t),n.refresh(),s()}});var un=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${ue("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`,ki=N({tag:"settings-minimum-flow-card",render:un,onMount(e,t){let o=t.querySelector(".smf-always"),r=t.querySelector(".smf-pct"),a=t.querySelector(".smf-pct-row"),n=ne(t),s=i=>{a.hidden=!i,a.setAttribute("aria-hidden",i?"false":"true"),r.disabled=!i};n.toggle(o,{read:()=>re(l.minimumFlowAlways),onChange:s,commit:i=>{let g=i?"on":"off";v(l.minimumFlowAlways,{state:g}),le("minimum_flow_always",g).catch(()=>v(l.minimumFlowAlways,{state:i?"off":"on"}))}}),n.num(r,{read:()=>M(l.minZoneFlowPct),commit:i=>{v(l.minZoneFlowPct,{value:i}),de("min_zone_flow_pct",i)}}),w(l.minimumFlowAlways,n.refresh),w(l.minZoneFlowPct,n.refresh),L(t),n.refresh()}});var gn=`
.settings-control-stack {
  display: grid;
  gap: 14px;
}

.settings-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}

.settings-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-card .toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

.settings-card .toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-card .toggle-row.is-on {
  border-color: var(--success-border);
  background: var(--success-bg);
}

/* Shared toggle styling for consistency across settings cards */
.settings-card .ui-toggle {
  width: 48px;
  height: 26px;
  border-radius: 8px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  box-shadow: inset 0 1px 2px rgba(0,0,0,.28);
  transition: background .2s ease, border-color .2s ease, box-shadow .2s ease;
  flex-shrink: 0;
}

.settings-card .ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: var(--control-knob);
  border-radius: 6px;
  transition: transform .2s ease;
  box-shadow: 0 3px 10px rgba(0,0,0,.32);
}

.settings-card .ui-toggle.on {
  background: var(--success-bg-soft);
  border-color: var(--success-border);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: var(--text-on-accent);
}

.settings-card .btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.settings-card .btn {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: linear-gradient(145deg, rgba(255,255,255,.085), rgba(255,255,255,.025));
  color: var(--text-strong);
  border-radius: 8px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.08);
  transition: .18s ease;
}

.settings-card .btn:hover {
  background: linear-gradient(145deg, rgba(255,138,61,.2), rgba(255,255,255,.055));
  border-color: var(--control-border-hover);
  color: var(--text-strong);
}

.settings-card .btn.warn {
  grid-column: 1 / -1;
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-text);
}

.settings-card .btn.warn:hover {
  background: var(--danger-bg-strong);
  border-color: var(--danger-border-strong);
}

@media (max-width: 640px) {
  .settings-card .btn-row {
    grid-template-columns: 1fr;
  }

  .settings-card .btn.warn {
    grid-column: 1;
  }
}
`;E("settings-control-card",gn);var bn=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title" data-i18n="settings.control.title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,Mi=N({tag:"settings-control-card",render:bn,onMount(e,t){L(t),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ce("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ce("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ce("restart")})}});var fn=`
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border: 1px solid rgba(255,133,49,.35);
  background: rgba(255,133,49,.12);
  border-radius: 8px;
  padding: 8px 10px;
  margin: 10px 0 2px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

.settings-motor-cal-card .mc-advanced {
  margin-top: 14px;
  border-top: 1px dashed var(--panel-border);
  padding-top: 12px;
}

.settings-motor-cal-card .mc-advanced > summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.settings-motor-cal-card .mc-advanced > summary::-webkit-details-marker {
  display: none;
}

.settings-motor-cal-card .mc-advanced > summary::after {
  content: '+';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: 1rem;
  line-height: 1;
}

.settings-motor-cal-card .mc-advanced[open] > summary::after {
  content: '-';
}

.settings-motor-cal-card .mc-advanced-body {
  margin-top: 8px;
}
`;E("settings-motor-calibration-card",fn);var Ye=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:l.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:l.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:l.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:l.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:l.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:l.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:l.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:l.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:l.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:l.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:l.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:l.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],vn=()=>{let e="";for(let t=0;t<Ye.length;t++){let o=Ye[t];if(o.key==="generic_runtime_limit_seconds")continue;let r=hn(o.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+b(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${ue("settings.motor.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field"><div class="ui-toggle mc-drivers-toggle" role="switch" data-i18n-label="settings.motor.toggleDrivers" aria-label="Toggle motor drivers"></div></span>
      </div>
      <div class="ui-note" data-i18n="settings.motor.note">Default starting thresholds and learning bounds used by the motor controller.</div>

      <div class="ui-section" data-i18n="settings.motor.profile">Profile</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.motorType">Motor Type (Default Profile)</span>
        <span class="ui-field"><select class="ui-select smc-profile">
          <option value="Generic">Generic</option>
          <option value="HmIP VdMot">HmIP VdMot</option>
        </select></span>
      </div>
      <div class="runtime-note" data-i18n="settings.motor.runtimeNote">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.motor.maxSafeRuntime">Max Safe Runtime</span> (s)</span>
        <span class="ui-field"><input type="number" class="ui-input smc-safe-runtime" value="0" step="1"></span>
      </div>

      <details class="mc-advanced">
        <summary data-i18n="settings.motor.advanced">Advanced motor learning</summary>
        <div class="mc-advanced-body">${e}</div>
      </details>
    </div>
  `};function hn(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var Hi=N({tag:"settings-motor-calibration-card",render:vn,onMount(e,t){let o=t.querySelector(".smc-profile"),r=t.querySelector(".smc-safe-runtime"),a=t.querySelector(".mc-drivers-toggle"),n=ne(t);function s(g){if(g==="HmIP VdMot"&&de("hmip_runtime_limit_seconds",40),g==="Generic"){let m=Number(M(l.genericRuntimeLimitSeconds));(!Number.isFinite(m)||m<=0)&&de("generic_runtime_limit_seconds",45)}}n.toggle(a,{read:()=>re(l.drivers),commit:g=>Nt(g)}),n.select(o,{read:()=>O(l.motorProfileDefault)||"HmIP VdMot",commit:g=>{le("motor_profile_default",g),s(g)}});function i(){let g=O(l.motorProfileDefault)||"HmIP VdMot";r.disabled=g==="HmIP VdMot"}n.num(r,{read:()=>(O(l.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:M(l.genericRuntimeLimitSeconds),commit:g=>{o.value==="Generic"&&de("generic_runtime_limit_seconds",g)}});for(let g=0;g<Ye.length;g++){let m=Ye[g];if(m.key==="generic_runtime_limit_seconds")continue;let f=t.querySelector(".smc-"+m.cls);f&&(n.num(f,{read:()=>M(m.id),commit:z=>de(m.key,z)}),w(m.id,n.refresh))}w(l.drivers,n.refresh),w(l.motorProfileDefault,()=>{n.refresh(),i()}),w(l.genericRuntimeLimitSeconds,n.refresh),w(l.hmipRuntimeLimitSeconds,n.refresh),L(t),s(O(l.motorProfileDefault)||"HmIP VdMot"),n.refresh(),i()}});var xn=`
.smart-preheat-card .absorb-badge {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.smart-preheat-card .absorb-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}
`;E("smart-preheat-card",xn);var yn=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${ue("settings.preheat.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.preheat.absorption">Preheat Absorption</span> <span class="absorb-badge">idle</span></span>
      <span class="ui-field"><div class="ui-toggle absorb-toggle" role="switch" data-i18n-label="settings.preheat.toggle" aria-label="Toggle preheat absorption"></div></span>
    </div>
    <div class="ui-note" data-i18n="settings.preheat.note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
    <div class="gated-body absorb-body">
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.absorbBand">Absorb band (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.detectDelta">Detect delta (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  </div>
`,Ui=N({tag:"smart-preheat-card",render:yn,onMount(e,t){let o=t.querySelector(".absorb-toggle"),r=t.querySelector(".absorb-badge"),a=t.querySelector(".absorb-band"),n=t.querySelector(".absorb-delta"),s=t.querySelector(".absorb-body"),i=ne(t),g=f=>{s&&s.classList.toggle("is-disabled",!f)};i.toggle(o,{read:()=>re(l.preheatAbsorbEnabled),onChange:g,commit:f=>{let z=f?"on":"off";v(l.preheatAbsorbEnabled,{state:z}),le("preheat_absorb_enabled",z)}}),i.num(a,{read:()=>M(l.preheatAbsorbBandC),commit:f=>{v(l.preheatAbsorbBandC,{value:f}),de("preheat_absorb_band_c",f)}}),i.num(n,{read:()=>M(l.preheatDetectDeltaC),commit:f=>{v(l.preheatDetectDeltaC,{value:f}),de("preheat_detect_delta_c",f)}});function m(){let f=String(O(l.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=f?b("common.active"):b("common.idle"),r.classList.toggle("active",f)}w(l.preheatAbsorbEnabled,i.refresh),w(l.preheatAbsorbing,m),w(l.preheatAbsorbBandC,i.refresh),w(l.preheatDetectDeltaC,i.refresh),L(t),i.refresh(),m()}});var wn=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");

:root {
  /* ===========================================================
     Palette (thermal utility):
       #00131d #002f45 #2c4875 #7aa7ce #9dbc78
       #ff6361 #ff8531 #ffa600 #ffd380
     Dark cool tones \u2192 surfaces/borders; orange \u2192 primary accent,
     muted steel blue \u2192 secondary/cool return/weather data; warm members
     \u2192 data series + states. Greens for "OK" status are kept for status
     legibility.
     =========================================================== */
  --accent: #ff8a3d;          /* orange \u2014 primary accent */
  --blue: #7eb6d8;            /* muted cool blue \u2014 secondary / return / wind accent */
  /* Chart data series \u2014 orange (warm) + muted blue (cool). */
  --series-warm: #ff8a3d;
  --series-cool: #7eb6d8;
  --series-cool-fill: rgba(126,182,216,.14);
  --series-solar: #ffd36a;    /* gold \u2014 solar irradiance / current-hour highlight */
  /* Axis/tick label color \u2014 warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(238,230,218,.82);
  --bg: #091217;
  --surface: rgba(18,30,36,.58);
  --card: rgba(18,30,36,.74);
  --border: rgba(229,240,244,.20);
  --text: #f8f2e9;
  --text-strong: #fff8ea;
  --text-secondary: rgba(232,226,216,.78);
  --muted: rgba(232,226,216,.72);
  --text-faint: rgba(216,226,232,.50);
  --text-on-accent: #071015;
  --overlay-bg: rgba(7,16,21,.90);
  --overlay-bg-soft: rgba(7,16,21,.66);
  --soft: rgba(255,255,255,.08);
  --panel-border: rgba(229,240,244,.20);
  --panel-border-soft: rgba(229,240,244,.12);
  --divider: rgba(255,255,255,.08);
  --divider-dashed: rgba(229,240,244,.18);
  --panel-bg: rgba(255,255,255,.075);
  --panel-bg-vibrant: linear-gradient(145deg, rgba(255,255,255,.11), rgba(255,255,255,.04));
  --panel-bg-flat: linear-gradient(145deg, rgba(255,255,255,.085), rgba(255,255,255,.035));
  --panel-shadow: 16px 18px 38px rgba(0,0,0,.34), -10px -10px 28px rgba(255,255,255,.035), inset 0 1px 0 rgba(255,255,255,.16);
  --panel-shadow-soft: var(--panel-shadow);
  --state-ok: #8fe08e;
  --state-warn: #ffbd4a;
  --state-danger: #ff7572;
  --state-disabled: #7e8b95;
  --control-bg: rgba(255,255,255,.085);
  --control-bg-hover: rgba(255,255,255,.14);
  --control-border: rgba(235,245,248,.22);
  --control-border-strong: rgba(235,245,248,.36);
  --control-border-hover: rgba(235,245,248,.48);
  --control-knob: #efe6dd;
  --focus-ring: rgba(124,155,208,.72);
  --focus-ring-soft: rgba(124,155,208,.60);
  --focus-border: rgba(124,155,208,.55);
  --accent-bg-soft: rgba(255,138,61,.14);
  --accent-border: rgba(255,138,61,.38);
  --accent-border-hover: rgba(255,138,61,.54);
  --accent-text-soft: #ffe8ba;
  --success-bg: rgba(45,110,45,.28);
  --success-bg-soft: rgba(121,209,126,.25);
  --success-border: rgba(121,209,126,.50);
  --success-border-soft: rgba(121,209,126,.25);
  --success-text-soft: #CBFFD0;
  --warn-bg-soft: rgba(255,166,0,.12);
  --warn-border: rgba(255,166,0,.42);
  --danger-bg: rgba(255,118,118,.20);
  --danger-bg-strong: rgba(255,100,100,.30);
  --danger-bg-soft: rgba(255,100,100,.15);
  --danger-border: rgba(255,118,118,.50);
  --danger-border-soft: rgba(255,118,118,.40);
  --danger-border-strong: rgba(255,100,100,.60);
  --danger-text: #FFD9D9;
  --status-muted-bg: rgba(70,70,70,.28);
  --status-muted-border: rgba(150,150,150,.25);
  --status-muted-text: #ADADAD;
  --viz-flow-low: #7aa7ce;
  --viz-flow-mid: #9dbc78;
  --viz-flow-high: #ff8531;
  --viz-flow-hot: #ffa600;
  --viz-delta-low: #7aa7ce;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #ff6361;
  --green: #8fe08e;
  --red: #ff7572;
  --font-ui: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 100%; scroll-behavior: smooth; }
body {
  font-family: var(--font-ui);
  background: linear-gradient(135deg, #071015 0%, #0c2026 38%, #171612 70%, #081015 100%);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    linear-gradient(115deg, rgba(255,255,255,.08), transparent 28%, rgba(126,182,216,.07) 50%, transparent 72%, rgba(255,138,61,.08)),
    repeating-linear-gradient(90deg, rgba(255,255,255,.028) 0 1px, transparent 1px 84px),
    repeating-linear-gradient(0deg, rgba(255,255,255,.018) 0 1px, transparent 1px 84px);
  mask-image: linear-gradient(180deg, rgba(0,0,0,.92), rgba(0,0,0,.36));
}

.app {
  display: block;
  min-height: 100vh;
}

.shell {
  padding: 18px;
  width: min(1320px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 0 18px;
  align-items: start;
}

.hdr {
  grid-column: 1 / -1;
}

.side-panel {
  position: sticky;
  top: 14px;
  min-width: 0;
  min-height: calc(100vh - 112px);
  padding: 12px 14px 12px 0;
  border-right: 1px solid var(--panel-border-soft);
}

.view-panel {
  min-width: 0;
}

.sec {
  display: none;
  margin-bottom: 22px;
}

.sec.active {
  display: block;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > * {
  flex: 1;
}

.zone-layout,
.logs-layout {
  display: grid;
  gap: 14px;
}

/* Logs: main log stream (2/3) + stacked diagnostics column (1/3). */
.logs-layout {
  grid-template-columns: 2fr 1fr;
  align-items: start;
}

.logs-main-col,
.logs-side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot,
.zone-recovery-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > *,
.zone-recovery-slot > * {
  flex: 1;
}

/* Middle column stacks the sensor (connectivity) and fault/relearn cards,
   stretching to match the Zone and Zone Settings columns' height. */
.zone-mid-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
/* Slots grow to share the column's full height so the stack matches the Zone
   and Zone Settings columns (no gap left below the last card). */
.zone-mid-col > * { width: 100%; flex: 1 1 auto; }

.zone-layout .ui-card,
.zone-layout .zone-detail,
.zone-layout .diag-zone-recovery {
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
}

.settings-layout,
.diagnostics-layout {
  display: grid;
  gap: 18px;
}

.settings-layout {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.settings-group {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
  backdrop-filter: blur(16px) saturate(1.18);
}

.diagnostics-group {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
  backdrop-filter: blur(16px) saturate(1.18);
}

.diagnostics-group {
  padding-top: 14px;
}

.settings-group-head,
.diagnostics-group-head {
  display: flex;
  align-items: center;
  min-height: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-group-title,
.diagnostics-group-title {
  font-family: var(--font-display);
  color: var(--accent);
  font-size: .875rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.settings-group-grid,
.diagnostics-group-grid {
  display: grid;
  gap: 12px;
  align-items: start;
  align-content: start;
}

.settings-installation-grid {
  grid-template-columns: 1fr;
}

.settings-hydraulic-grid {
  grid-template-columns: 1fr;
}

.settings-motor-grid {
  grid-template-columns: 1fr;
}

.settings-hydraulic-stack,
.manual-control-col {
  display: grid;
  gap: 12px;
}

.settings-group .ui-card,
.settings-group .settings-card {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 !important;
}

.settings-group-grid > * + *,
.settings-group .ui-card + .ui-card,
.settings-group .settings-card + .settings-card,
.settings-hydraulic-stack > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.settings-group .ui-card-title,
.settings-group .settings-card .card-title {
  color: var(--muted);
  font-size: .74rem;
  letter-spacing: .78px;
  margin-bottom: 2px;
  padding-bottom: 4px;
  border-bottom: 0;
}

.settings-group .settings-card .toggle-row {
  padding: 8px 0 10px !important;
  border: 0 !important;
  border-bottom: 1px solid var(--panel-border-soft) !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.settings-group .gated-body,
.settings-group .settings-motor-cal-card .mc-advanced-body {
  background: transparent !important;
  box-shadow: none !important;
}

.settings-group .settings-motor-cal-card .runtime-note {
  box-shadow: none !important;
}

.diagnostics-layout {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
}

.diagnostics-logs-group,
.diagnostics-health-group {
  grid-column: span 2;
}

.logs-main-col,
.manual-control-col {
  min-width: 0;
}

.diag-health-grid,
.diag-actions-grid {
  grid-template-columns: 1fr;
}

.diagnostics-group .ui-card,
.diagnostics-group .settings-card,
.diagnostics-group .logs-view,
.diagnostics-group .diag-zone-motor,
.diagnostics-group .connectivity-card,
.diagnostics-group .diag-i2c {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.diagnostics-group-grid > * + *,
.manual-control-col > * + *,
.logs-main-col > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.diagnostics-group .ui-card-title,
.diagnostics-group .settings-card .card-title,
.diagnostics-group .logs-view .card-title,
.diagnostics-group .diag-zone-motor .card-title,
.diagnostics-group .connectivity-card .card-title,
.diagnostics-group .diag-i2c .card-title {
  color: var(--text-secondary);
  font-size: .76rem;
  letter-spacing: .9px;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom-color: var(--panel-border-soft);
}

.diagnostics-group .authority-card .setpoint-box {
  padding: 10px 0 12px;
  border: 0;
  border-top: 1px solid var(--panel-border-soft);
  border-bottom: 1px solid var(--panel-border-soft);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.diagnostics-group .logs-stream,
.diagnostics-group .diag-i2c pre {
  background: rgba(0,0,0,.10);
  border-color: var(--panel-border-soft);
  box-shadow: none;
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .78rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}

.placeholder-card h3 {
  font-size: .875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
}

.placeholder-card p {
  color: var(--muted);
  font-size: .86rem;
}

@media (max-width: 1200px) {
  .diagnostics-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .shell {
    display: block;
    padding: 12px 12px 78px;
  }

  .side-panel {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: 10px;
    top: auto;
    z-index: 40;
    min-height: 0;
    padding: 8px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: rgba(9,18,23,.82);
    box-shadow: var(--panel-shadow);
    backdrop-filter: blur(18px) saturate(1.25);
  }

  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .logs-layout,
  .diagnostics-layout { grid-template-columns: 1fr; }

  .diagnostics-logs-group,
  .diagnostics-health-group {
    grid-column: auto;
  }

  .zone-detail-slot {
    grid-column: 1;
  }
}

/* ============================
   GLOBAL INTERACTIVE STATES
   ============================ */

/* Consistent focus ring for all interactive elements */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Disabled state for all buttons/inputs */
button:disabled,
input:disabled,
select:disabled {
  opacity: .40;
  cursor: not-allowed;
  pointer-events: none;
}

/* Gated card body: faded + non-interactive when its feature is disabled.
   The enable toggle stays outside this wrapper so it remains clickable. */
.gated-body {
  transition: opacity .2s ease;
}
.gated-body.is-disabled {
  opacity: .42;
  pointer-events: none;
  user-select: none;
}
`;E("app-root",wn);var zn=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <aside class="side-panel"></aside>
      <div class="view-panel">
        <section class="sec active" data-section="overview">
          <div class="overview-flow"></div>
          <div class="overview-timeline" style="margin-top:14px"></div>
          <div class="dashboard-grid">
            <div class="overview-flow-return"></div>
          </div>
        </section>
        <section class="sec" data-section="zones">
          <div class="zone-selector"></div>
          <div class="zone-layout">
            <div class="zone-detail-slot"></div>
            <div class="zone-mid-col">
              <div class="zone-sensor-slot"></div>
              <div class="zone-recovery-slot"></div>
            </div>
            <div class="zone-room-slot"></div>
          </div>
        </section>
        <section class="sec" data-section="settings">
          <div class="settings-layout">
            <div class="settings-group settings-installation-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.installation">Installation</span></div>
              <div class="settings-group-grid settings-installation-grid">
                <div class="settings-manifold-slot"></div>
              </div>
            </div>
            <div class="settings-group settings-hydraulic-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.hydraulic">Hydraulic Safety</span></div>
              <div class="settings-group-grid settings-hydraulic-grid">
                <div class="settings-hydraulic-stack">
                  <div class="settings-min-flow-slot"></div>
                  <div class="settings-preheat-slot"></div>
                </div>
              </div>
            </div>
            <div class="settings-group settings-motor-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.motorAdvanced">Motor Advanced</span></div>
              <div class="settings-group-grid settings-motor-grid">
                <div class="settings-motor-cal-slot"></div>
              </div>
            </div>
          </div>
        </section>
        <section class="sec" data-section="diagnostics">
          <div class="diagnostics-layout">
            <div class="diagnostics-group diagnostics-logs-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.logs">Logs</span></div>
              <div class="logs-main-col"></div>
            </div>
            <div class="diagnostics-group diagnostics-manual-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.manual">Manual Motor Control</span></div>
              <div class="manual-control-col"></div>
            </div>
            <div class="diagnostics-group diagnostics-actions-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.actions">Service Actions</span></div>
              <div class="diagnostics-group-grid diag-actions-grid"></div>
            </div>
            <div class="diagnostics-group diagnostics-health-group">
              <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.health">Device Health</span></div>
              <div class="diagnostics-group-grid diag-health-grid"></div>
            </div>
          </div>
        </section>
        <div class="ftr" data-i18n="footer.product">LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER</div>
      </div>
    </main>
  </div>
`;N({tag:"app-root",render:zn,onMount(e,t){t.querySelector(".hdr").appendChild(j("hv6-header")),t.querySelector(".side-panel").appendChild(j("hv6-sidebar")),t.querySelector(".overview-flow").appendChild(j("flow-diagram")),t.querySelector(".overview-timeline").appendChild(j("zone-state-timeline")),t.querySelector(".overview-flow-return").appendChild(j("graph-widgets",{variant:"flow-return"})),t.querySelector(".zone-selector").appendChild(j("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(j("zone-detail",{zone:P("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(j("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(j("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(j("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(j("settings-manifold-card")),t.querySelector(".settings-min-flow-slot").appendChild(j("settings-minimum-flow-card")),t.querySelector(".settings-preheat-slot").appendChild(j("smart-preheat-card")),t.querySelector(".settings-motor-cal-slot").appendChild(j("settings-motor-calibration-card")),t.querySelector(".logs-main-col").appendChild(j("logs-view"));let r=t.querySelector(".manual-control-col");r.appendChild(j("diag-manual-badge")),r.appendChild(j("diag-zone-motor-card",{zone:P("selectedZone")||1}));let a=t.querySelector(".diag-health-grid");a.appendChild(j("connectivity-card")),a.appendChild(j("diag-system-card")),a.appendChild(j("diag-i2c")),t.querySelector(".diag-actions-grid").appendChild(j("settings-control-card"));let s=t.querySelectorAll(".sec");function i(){let g=P("section");s.forEach(m=>{m.classList.toggle("active",m.getAttribute("data-section")===g)})}B("section",i),L(t),i()}});function kn(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(j("app-root")),Gt()}kn();})();
