(()=>{var zt={},Fe={};function T(e){return zt[e.tag]=e,e}function V(e,t){let o=zt[e];if(!o)throw new Error("Component not found: "+e);let r=t||{};if(o.state){let i=o.state(t||{});for(let d in i)r[d]=i[d]}if(o.methods)for(let i in o.methods)r[i]=o.methods[i];let a=document.createElement("div");a.innerHTML=o.render(r);let n=a.firstElementChild;return o.onMount&&o.onMount(r,n),n}function w(e,t){(Fe[e]||(Fe[e]=[])).push(t)}function J(e){let t=Fe[e];if(t)for(let o=0;o<t.length;o++)t[o](e)}var Q=6,Fo=28,Ne=Object.create(null),No=Po(),q={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Do(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:No,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},To=300;function Do(){let e=Object.create(null);for(let t=1;t<=Q;t++)e[t]=[];return e}function Po(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<Q;)e.push("");return e.slice(0,Q)}function Ro(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(q.zoneNames))}catch(e){}}function ee(e){return"$dashboard:"+e}function ot(e){return Math.max(1,Math.min(Q,Number(e)||1))}function St(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let o=e.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function L(e){let t=Ne[e];return t?t.v!=null?t.v:t.value!=null?t.value:St(t.s!=null?t.s:t.state):null}function N(e){let t=Ne[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Oo(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function Y(e){return Oo(N(e))}function v(e,t){let o=Ne[e];o||(o=Ne[e]={v:null,s:null}),"v"in t&&(o.v=t.v,o.value=t.v),"value"in t&&(o.v=t.value,o.value=t.value),"s"in t&&(o.s=t.s,o.state=t.s),"state"in t&&(o.s=t.state,o.state=t.state);for(let r in t)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=t[r]);if(J(e),e==="text_sensor-firmware_version"&&xe("firmwareVersion",N(e)||""),e.startsWith("text-zone_")&&e.endsWith("_name")){let r=parseInt(e.slice(10,-5),10);if(r>=1&&r<=Q){let a=N(e)||"";q.zoneNames[r-1]!==a&&(q.zoneNames[r-1]=a,Ro(),J(ee("zoneNames")))}}}function B(e,t){w(ee(e),t)}function O(e){return q[e]}function xe(e,t){q[e]=t,J(ee(e))}function _t(e){let t=e==="logs"?"diagnostics":e;q.section!==t&&(q.section=t,J(ee("section")))}function kt(e){let t=ot(e);q.selectedZone!==t&&(q.selectedZone=t,J(ee("selectedZone")))}function ye(e){let t=!!e;q.live!==t&&(q.live=t,J(ee("live")))}function Ct(){q.pendingWrites+=1,J(ee("pendingWrites"))}function rt(){q.pendingWrites=Math.max(0,q.pendingWrites-1),q.lastWriteAt=Date.now(),J(ee("pendingWrites"))}function Lt(){return q.pendingWrites>0?!0:Date.now()-q.lastWriteAt<2e3}function me(e){return q.zoneNames[ot(e)-1]||""}function $(e){let t=ot(e),o=me(t);return o?"Zone "+t+" \xB7 "+o:"Zone "+t}function we(e){q.i2cResult=e||"No scan has been run yet.",J(ee("i2cResult"))}function P(e,t){let o={time:Ho(),msg:String(e||"")};for(q.activityLog.push(o);q.activityLog.length>60;)q.activityLog.shift();if(t>=1&&t<=Q){let r=q.zoneLog[t];for(r.push(o);r.length>8;)r.shift();J(ee("zoneLog:"+t))}J(ee("activityLog"))}function tt(e,t){let o=q[e];if(!Array.isArray(o))return;let r=St(t);if(r!=null){for(o.push(r);o.length>Fo;)o.shift();J(ee(e))}}function Ce(e){let t=Date.now();if(!e&&t-q.lastHistoryAt<3200)return;q.lastHistoryAt=t;let o=0,r=0;for(let a=1;a<=Q;a++){let n=L("sensor-zone_"+a+"_valve_pct");n!=null&&(o+=n,r+=1)}tt("historyFlow",L("sensor-manifold_flow_temperature")),tt("historyReturn",L("sensor-manifold_return_temperature")),tt("historyDemand",r?o/r:0)}function Ho(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Te(e){q.zoneStateHistory=e||null,J(ee("zoneStateHistory"))}function At(){return q.deviceLogSeq}function De(e,t){if(Array.isArray(e)&&e.length){for(let o of e)q.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>q.deviceLogSeq&&(q.deviceLogSeq=o[0]);for(;q.deviceLog.length>To;)q.deviceLog.shift();J(ee("deviceLog"))}typeof t=="number"&&t>q.deviceLogSeq&&(q.deviceLogSeq=t-1)}function Mt(){return q.deviceLog}function Et(){q.deviceLog=[],J(ee("deviceLog"))}var p={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",name:e=>"text-zone_"+e+"_name",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},s={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var K=6,qo=8,Ft=null,ze=0,Pe=1,Nt=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],R={temp:new Float32Array(K),setpoint:new Float32Array(K),valve:new Float32Array(K),enabled:new Uint8Array(K),driversEnabled:1,fault:0,manualMode:0};function Io(){R.manualMode=0,xe("manualMode",!1);for(let n=0;n<K;n++){R.temp[n]=20.5+n*.4,R.setpoint[n]=21+n%3*.5,R.valve[n]=12+n*8,R.enabled[n]=n===4?0:1;let i=n+1;v(p.temp(i),{value:R.temp[n]}),v(p.setpoint(i),{value:R.setpoint[n]}),v(p.valve(i),{value:R.valve[n]}),v(p.state(i),{state:R.valve[n]>5?"heating":"idle"}),v(p.enabled(i),{value:!!R.enabled[n],state:R.enabled[n]?"on":"off"}),v(p.probe(i),{state:"Probe "+i}),v(p.tempSource(i),{state:i%2?"Local Probe":"BLE"}),v(p.syncTo(i),{state:"None"}),v(p.pipeType(i),{state:"PEX 16mm"}),v(p.area(i),{value:8+i*3.5}),v(p.spacing(i),{value:[150,200,150,100,200,150][n]}),v(p.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),v(p.name(i),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),v(p.exteriorWalls(i),{state:["N","E","S","W","N,E","S,W"][n]}),v(p.preheatAdvance(i),{value:.08+n*.03})}for(let n=1;n<=qo;n++){let i=n<=K?n:K,d=R.temp[i-1]+(n>K?1:.1*n);v(p.probeTemp(n),{value:d})}v(s.flow,{value:34.1}),v(s.ret,{value:30.4}),v(s.uptime,{value:18*3600+720}),v(s.wifi,{value:-57}),v(s.drivers,{value:!0,state:"on"}),v(s.fault,{value:!1,state:"off"}),v(s.ip,{state:"192.168.1.86"}),v(s.ssid,{state:"MockLab"}),v(s.mac,{state:"D8:3B:DA:12:34:56"}),v(s.firmware,{state:"0.5.x-mock"}),v(s.manifoldFlowProbe,{state:"Probe 7"}),v(s.manifoldReturnProbe,{state:"Probe 8"}),v(s.manifoldType,{state:"NC (Normally Closed)"}),v(s.motorProfileDefault,{state:"HmIP VdMot"}),v(s.closeThresholdMultiplier,{value:1.7}),v(s.closeSlopeThreshold,{value:1}),v(s.closeSlopeCurrentFactor,{value:1.4}),v(s.openThresholdMultiplier,{value:1.7}),v(s.openSlopeThreshold,{value:.8}),v(s.openSlopeCurrentFactor,{value:1.3}),v(s.openRippleLimitFactor,{value:1}),v(s.genericRuntimeLimitSeconds,{value:45}),v(s.hmipRuntimeLimitSeconds,{value:40}),v(s.relearnAfterMovements,{value:2e3}),v(s.relearnAfterHours,{value:168}),v(s.learnedFactorMinSamples,{value:3}),v(s.learnedFactorMaxDeviationPct,{value:12}),v(s.simplePreheatEnabled,{state:"on"}),v(s.minZoneFlowPct,{value:15}),v(s.minimumFlowAlways,{state:"off"}),v(s.cpuLoadCore0,{value:18.5}),v(s.cpuLoadCore1,{value:7.2}),v(s.freeInternalKb,{value:142}),v(s.freePsramKb,{value:7800}),Ce(!0);let e=300,t=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let n=0;n<o;n++){let i=(o-1-n)*e,d=t-i,f=Math.floor(n/12)%24,m=r.map(l=>l[f%l.length]),g=i/3600,z=g>2.5&&g<3.5||g>8.5&&g<9.5?1:0,h=m.filter(l=>l===5).length,c=Math.round(Math.min(100,h*15+Math.abs(Math.sin(n/8))*6)),u=Number((30+h*1.4+Math.sin(n/11)*1.5).toFixed(1)),y=Number((u-(1.4+h*.35)).toFixed(1));a.push([d,...m,z,u,y,c])}Te({interval_s:e,uptime_s:t,count:o,entries:a}),Tt(6)}function Tt(e){let t=[];for(let o=0;o<e;o++){let r=Nt[Pe%Nt.length];t.push([Pe,r[0],r[1],r[2]]),Pe++}De(t,Pe)}function Bo(){ze+=1,v(s.uptime,{value:Number(Date.now()/1e3)|0}),v(s.wifi,{value:-55-Math.round((1+Math.sin(ze/4))*6)});let e=0,t=0,o=0;for(let i=0;i<K;i++){let d=i+1,f=!!R.enabled[i],m=R.temp[i],g=R.setpoint[i],z=f&&R.driversEnabled&&!R.manualMode&&m<g-.25;R.manualMode?R.valve[i]=Math.max(0,R.valve[i]):!f||!R.driversEnabled?R.valve[i]=Math.max(0,R.valve[i]-6):z?R.valve[i]=Math.min(100,R.valve[i]+7+d%3):R.valve[i]=Math.max(0,R.valve[i]-5);let h=z?.05+R.valve[i]/2200:-.03+R.valve[i]/3200;R.temp[i]=m+h+Math.sin((ze+d)/5)*.04,f&&R.valve[i]>0&&(e+=R.valve[i],t+=1,o=Math.max(o,R.valve[i])),v(p.temp(d),{value:R.temp[i]}),v(p.valve(d),{value:Math.round(R.valve[i])});let c=Math.max(0,(R.setpoint[i]-R.temp[i]-.15)*.22);v(p.preheatAdvance(d),{value:Number(c.toFixed(2))}),v(p.state(d),{state:f?z?"heating":"idle":"off"}),v(p.enabled(d),{value:f,state:f?"on":"off"}),v(p.probeTemp(d),{value:R.temp[i]+Math.sin((ze+d)/6)*.1})}let r=29.5+o*.075+t*.18+Math.sin(ze/6)*.25,a=r-(t?2.1+e/Math.max(1,t*50):1.1);v(s.flow,{value:Number(r.toFixed(1))}),v(s.ret,{value:Number(a.toFixed(1))}),v(p.probeTemp(7),{value:Number((a-.4).toFixed(1))}),v(p.probeTemp(8),{value:Number((r+.2).toFixed(1))}),Ce(!0);let n=O("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),ze%3===0&&Tt(1)}function Dt(){Ft||(Io(),ye(!0),Ft=setInterval(Bo,1200))}function Re(e){let t=e.key||"",o=e.value,r=e.zone||0;if(t==="zone_setpoint"&&r>=1&&r<=K){let n=Number(o);Number.isNaN(n)||(R.setpoint[r-1]=n,v(p.setpoint(r),{value:n}),P("Zone "+r+" setpoint set to "+n.toFixed(1)+"\xB0C",r));return}if(t==="zone_enabled"&&r>=1&&r<=K){let n=o>.5;R.enabled[r-1]=n?1:0,v(p.enabled(r),{value:n,state:n?"on":"off"}),P("Zone "+r+(n?" enabled":" disabled"),r);return}if(t==="drivers_enabled"){let n=o>.5;R.driversEnabled=n?1:0,v(s.drivers,{value:n,state:n?"on":"off"}),P(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=o>.5;R.manualMode=n?1:0,xe("manualMode",n);return}if(t==="motor_target"&&r>=1&&r<=K){let n=Number(o||0);v(p.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(n)))}),P("Motor "+r+" target set to "+n+"%",r);return}if(t==="command"){let n=String(o);if(n==="i2c_scan"){we(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),P("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){P("Command executed: "+n);return}if(n==="open_motor_timed"&&r>=1&&r<=K){P("Motor "+r+" open timed",r);return}if(n==="close_motor_timed"&&r>=1&&r<=K){P("Motor "+r+" close timed",r);return}if(n==="stop_motor"&&r>=1&&r<=K){P("Motor "+r+" stopped",r);return}if(n==="motor_reset_fault"&&r>=1&&r<=K){P("Motor "+r+" fault reset",r);return}if(n==="motor_reset_learned_factors"&&r>=1&&r<=K){P("Motor "+r+" learned factors reset",r);return}if(n==="motor_reset_and_relearn"&&r>=1&&r<=K){P("Motor "+r+" reset and relearn started",r);return}if(n==="dump_task_stats"){P("Task stats dumped to device log (mock)");return}return}if(t==="zone_probe"&&r>=1){v(p.probe(r),{state:String(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_temp_source"&&r>=1){v(p.tempSource(r),{state:String(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_sync_to"&&r>=1){v(p.syncTo(r),{state:String(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_type"&&r>=1){v(p.pipeType(r),{state:String(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="manifold_type"){v(s.manifoldType,{state:String(o)}),P("Setting updated: "+t+" = "+o);return}if(t==="manifold_flow_probe"){v(s.manifoldFlowProbe,{state:String(o)}),P("Setting updated: "+t+" = "+o);return}if(t==="manifold_return_probe"){v(s.manifoldReturnProbe,{state:String(o)}),P("Setting updated: "+t+" = "+o);return}if(t==="motor_profile_default"){v(s.motorProfileDefault,{state:String(o)}),P("Setting updated: "+t+" = "+o);return}if(t==="simple_preheat_enabled"){v(s.simplePreheatEnabled,{state:String(o)}),P("Setting updated: "+t+" = "+o);return}if(t==="minimum_flow_always"){v(s.minimumFlowAlways,{state:String(o)}),P("Setting updated: "+t+" = "+o);return}if(t==="zone_name"&&r>=1){v(p.name(r),{state:String(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_ble_mac"&&r>=1){v(p.ble(r),{state:String(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_exterior_walls"&&r>=1){let n=String(o)||"None";v(p.exteriorWalls(r),{state:n}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_area_m2"&&r>=1){v(p.area(r),{value:Number(o)}),P("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_spacing_mm"&&r>=1){v(p.spacing(r),{value:Number(o)}),P("Setting updated: "+t+" = "+o,r);return}let a={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct,min_zone_flow_pct:s.minZoneFlowPct};if(a[t]){let n=Number(o);Number.isNaN(n)||(v(a[t],{value:n}),P("Setting updated: "+t+" = "+o));return}}window.__hv6_mock={setSetpoint(e,t){Re({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!R.enabled[e-1];Re({key:"zone_enabled",value:t?1:0,zone:e})}};var Oe="/api/hv6/v1";function nt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function Wo(e,t){let o=new URLSearchParams;for(let[a,n]of Object.entries(t||{}))n!=null&&o.append(a,n);let r=o.toString();return Oe+e+(r?"?"+r:"")}function te(e,t,o){if(Ct(),nt())try{return Re(o),Promise.resolve({ok:!0})}finally{rt()}let r=JSON.stringify(t||{});return fetch(Oe+e,{method:"POST",headers:{"Content-Type":"application/json"},body:r}).then(a=>!a.ok&&[400,404,415].includes(a.status)?fetch(Wo(e,t),{method:"POST"}):(a.ok||console.warn(`API call failed: POST ${e} status=${a.status}`),a)).catch(a=>{throw console.error(`API call error: POST ${e}:`,a),a}).finally(()=>{rt()})}function at(e,t){return v(p.setpoint(e),{value:t}),te(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function Pt(e,t){return v(p.enabled(e),{state:t?"on":"off",value:t}),te(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function Rt(e){return v(s.drivers,{state:e?"on":"off",value:e}),te("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function ue(e,t){return te("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function Ot(){return we("Scanning I2C bus..."),P("I2C scan started"),ue("i2c_scan")}var Zo={zone_probe:e=>p.probe(e),zone_temp_source:e=>p.tempSource(e),zone_sync_to:e=>p.syncTo(e),zone_pipe_type:e=>p.pipeType(e)},jo={zone_ble_mac:e=>p.ble(e),zone_exterior_walls:e=>p.exteriorWalls(e),zone_name:e=>p.name(e)},Vo={zone_area_m2:e=>p.area(e),zone_pipe_spacing_mm:e=>p.spacing(e)},$o={manifold_type:s.manifoldType,manifold_flow_probe:s.manifoldFlowProbe,manifold_return_probe:s.manifoldReturnProbe,motor_profile_default:s.motorProfileDefault,simple_preheat_enabled:s.simplePreheatEnabled},Go={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct};function Se(e,t,o){let r=Zo[t];return r&&v(r(e),{state:o}),te("/settings/select",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function Le(e,t,o){let r=jo[t];return r&&v(r(e),{state:o}),te("/settings/text",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function st(e,t,o){let r=Number(o),a=Vo[t];return a&&!Number.isNaN(r)&&v(a(e),{value:r}),te("/settings/number",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function ae(e,t){let o=$o[e];return o&&v(o,{state:t}),te("/settings/select",{key:e,value:t},{key:e,value:t})}function se(e,t){let o=Number(t),r=Go[e];return r&&!Number.isNaN(o)&&v(r,{value:o}),te("/settings/number",{key:e,value:o},{key:e,value:o})}function Ht(e,t){return te("/settings/text",{key:e,value:t},{key:e,value:t})}function qt(e,t){let o=String(t||"").trim();return P("Zone "+e+" renamed to "+(o||"(blank)"),e),Le(e,"zone_name",o)}function It(e,t){let o=Number(t),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return v(p.motorTarget(e),{value:r}),P("Motor "+e+" target set to "+r+"%",e),te(`/motors/${e}/target`,{value:r},{key:"motor_target",value:r,zone:e})}function Bt(e,t=1e4){return P("Motor "+e+" open for "+t+"ms",e),te(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function Wt(e,t=1e4){return P("Motor "+e+" close for "+t+"ms",e),te(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function it(e){return P("Motor "+e+" stopped",e),te(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function lt(e){return xe("manualMode",!!e),P(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),te("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function Zt(e){return P("Motor "+e+" fault reset",e),ue("motor_reset_fault",e)}function jt(e){return P("Motor "+e+" learned factors reset",e),ue("motor_reset_learned_factors",e)}function Vt(e){return P("Motor "+e+" reset and relearn started",e),ue("motor_reset_and_relearn",e)}function $t(){return P("Task stats dumped to device log"),ue("dump_task_stats")}function dt(){nt()||fetch(Oe+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Te(e)}).catch(()=>{})}function ct(){if(nt())return;let e=At();fetch(Oe+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&De(t.lines,t.next_seq)}).catch(()=>{})}var pt=null,He=null,Gt=null,Ut=null,ie=null;async function Uo(){He&&He.abort(),He=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:He.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function Xt(e){if(!(!e||typeof e!="object")&&!Lt()){for(let t in e)v(t,e[t]);Ce(!1)}}function Kt(e){if(e){if(!e.type){Xt(e);return}if(e.type==="state"){Xt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;P(t),String(t).indexOf("I2C_SCAN:")!==-1&&we(String(t))}}}function Yt(){pt||(pt=setTimeout(()=>{pt=null,mt()},1e3))}function Xo(){dt(),Gt||(Gt=setInterval(dt,300*1e3)),ct(),Ut||(Ut=setInterval(ct,3e3))}function ut(){Uo().then(e=>{ye(!0),Kt(e),Xo(),Yt()}).catch(()=>{ye(!1),Yt()})}function Yo(){if(!window.EventSource||ie)return!1;let e=!1;return ie=new EventSource("/api/hv6/v1/events"),ie.addEventListener("hello",()=>{e=!0,ie&&(ie.close(),ie=null),ut()}),ie.onmessage=t=>{try{Kt(JSON.parse(t.data))}catch(o){}},ie.onerror=()=>{ie&&(ie.close(),ie=null),e||ut()},!0}function mt(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Dt();return}Yo()||ut()}var Jt=Object.create(null);function F(e,t){if(Jt[e])return;Jt[e]=1;let o=document.createElement("style");o.textContent=t,document.head.appendChild(o)}var qe={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.heatSource":"Heat Source","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature Sensors / Connectivity","zone.sensor.returnSensor":"Zone Return Temperature Sensor","zone.sensor.tempSource":"Temperature Source","zone.sensor.bleSensor":"BLE Sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.room.title":"Zone Settings","zone.room.friendlyName":"Friendly Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.room.area":"Zone Area (m\xB2)","zone.room.spacing":"Pipe Spacing C-C (mm)","zone.room.pipeType":"Pipe Type","zone.room.exteriorWalls":"Exterior Walls","zone.room.selectAll":"Select all that apply","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual floor for a modulating heat source, independent of the bridge","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a manual minimum valve opening on enabled zones while active, giving a modulating heat source a stable flow floor.","settings.minFlow.enabledSub":"manual floor for a modulating heat source, independent of the bridge","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.asgard.title":"Modulating Heat Source","settings.asgard.help":"Pushes the house-weighted room temperature to a modulating heat-source controller. One board is the coordinator and aggregates zones from both boards; the other is a slave.","settings.asgard.bridgeEnabled":"Bridge enabled","settings.asgard.bridgeSub":"send weighted house temperature to the heat-source controller","settings.asgard.coordinator":"Coordinator","settings.asgard.coordinatorSub":"pushes to the heat source","settings.asgard.endpoint":"Heat Source Endpoint","settings.asgard.host":"Host","settings.asgard.port":"Port","settings.asgard.entity":"Number entity","settings.asgard.entitySub":"REST object_id for the weighted house temp","settings.asgard.peerBoard":"Peer board","settings.asgard.peerHost":"Peer host","settings.asgard.peerPlaceholder":"empty = single board","settings.asgard.pushInterval":"Push interval (s)","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.asgard.title":"Bridge Status","diagnostics.asgard.setpointNote":"Recommended virtual thermostat setpoint, derived from enabled zone targets.","diagnostics.asgard.peer":"Peer","diagnostics.asgard.lastPush":"Last push","diagnostics.asgard.zonesWeighted":"Zones weighted","diagnostics.asgard.lastError":"Last error","diagnostics.asgard.ageSeconds":"{value}s ago","diagnostics.asgard.ageMinutes":"{value}m ago","diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Faults & Relearn","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Reset Fault","diagnostics.recovery.resetFactors":"Reset Factors","diagnostics.recovery.resetRelearn":"Reset + Relearn","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.heatSource":"Varmekilde","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatursensorer / Forbindelse","zone.sensor.returnSensor":"Zone returtemperatursensor","zone.sensor.tempSource":"Temperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.room.title":"Zoneindstillinger","zone.room.friendlyName":"Venligt navn","zone.room.friendlyPlaceholder":"fx Stue","zone.room.area":"Zoneareal (m\xB2)","zone.room.spacing":"R\xF8rafstand C-C (mm)","zone.room.pipeType":"R\xF8rtype","zone.room.exteriorWalls":"Yderv\xE6gge","zone.room.selectAll":"V\xE6lg alle relevante","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow for modulerende varmekilde, uafh\xE6ngigt af bridge","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en manuel minimumsventil\xE5bning p\xE5 aktive zoner mens funktionen er aktiv, s\xE5 en modulerende varmekilde har et stabilt flowgulv.","settings.minFlow.enabledSub":"manuel minimumsflow for modulerende varmekilde, uafh\xE6ngigt af bridge","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.asgard.title":"Modulerende varmekilde","settings.asgard.help":"Sender husets v\xE6gtede rumtemperatur til en modulerende varmekilde-controller. \xC9t board er coordinator og samler zoner fra begge boards; det andet er slave.","settings.asgard.bridgeEnabled":"Bridge aktiveret","settings.asgard.bridgeSub":"send v\xE6gtet hustemperatur til varmekilde-controlleren","settings.asgard.coordinator":"Coordinator","settings.asgard.coordinatorSub":"sender til varmekilden","settings.asgard.endpoint":"Varmekilde endpoint","settings.asgard.host":"Host","settings.asgard.port":"Port","settings.asgard.entity":"Number entity","settings.asgard.entitySub":"REST object_id for v\xE6gtet hustemp","settings.asgard.peerBoard":"Peer-board","settings.asgard.peerHost":"Peer-host","settings.asgard.peerPlaceholder":"tom = enkelt board","settings.asgard.pushInterval":"Push-interval (s)","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.asgard.title":"Bridge-status","diagnostics.asgard.setpointNote":"Anbefalet virtuelt termostat-setpunkt, beregnet fra aktive zoners m\xE5l.","diagnostics.asgard.peer":"Peer","diagnostics.asgard.lastPush":"Seneste push","diagnostics.asgard.zonesWeighted":"V\xE6gtede zoner","diagnostics.asgard.lastError":"Seneste fejl","diagnostics.asgard.ageSeconds":"{value}s siden","diagnostics.asgard.ageMinutes":"{value}m siden","diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Fejl & genl\xE6ring","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Nulstil fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer","diagnostics.recovery.resetRelearn":"Nulstil + genl\xE6r","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?"}},Qt="en".toLowerCase(),gt=qe[Qt]?Qt:"en";function b(e,t){let o=qe[gt]&&qe[gt][e]||qe.en[e]||e;return t?String(o).replace(/\{(\w+)\}/g,(r,a)=>t[a]==null?"":String(t[a])):o}function k(e){e&&(e.querySelectorAll("[data-i18n]").forEach(t=>{t.textContent=b(t.getAttribute("data-i18n"))}),e.querySelectorAll("[data-i18n-title]").forEach(t=>{t.setAttribute("title",b(t.getAttribute("data-i18n-title")))}),e.querySelectorAll("[data-i18n-label]").forEach(t=>{t.setAttribute("aria-label",b(t.getAttribute("data-i18n-label")))}),e.querySelectorAll("[data-i18n-placeholder]").forEach(t=>{t.setAttribute("placeholder",b(t.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",gt);var Ko=`
/* ---- Card panel ---- */
.ui-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
}

/* ---- Titles & section headers ---- */
.ui-card-title {
  font-family: var(--font-display);
  font-size: .84rem;
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
  border-radius: 999px;
  border: 1.5px solid var(--control-border-strong);
  color: var(--text-secondary);
  font-size: .65rem;
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
  left: 0;
  width: max-content;
  max-width: 240px;
  background: var(--overlay-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .72rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: .2px;
  text-align: left;
  white-space: normal;
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
  font-size: .7rem;
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
  font-size: .78rem;
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
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .92rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.ui-input.wide { width: 180px; text-align: left; font-family: inherit; }

.ui-select {
  min-width: 160px;
  max-width: 240px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .92rem;
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}

.ui-unit { color: var(--text-faint); font-size: .78rem; font-weight: 600; }

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
  background: var(--control-bg);
  color: var(--text);
  border-radius: 9px;
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
  border-radius: 10px;
  background: var(--warn-bg-soft);
  border: 1px solid var(--warn-border);
}
.ui-form-banner.show { display: flex; }
.ui-form-banner-msg { color: var(--state-warn); font-size: .76rem; font-weight: 700; }
.ui-form-banner-btns { display: flex; gap: 8px; flex-shrink: 0; }
.ui-form-discard,
.ui-form-apply {
  border-radius: 8px;
  padding: 5px 14px;
  font-size: .76rem;
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
  border-radius: 999px;
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
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on { background: var(--success-bg-soft); border-color: var(--success-border); }
.ui-toggle.on::after { transform: translateX(22px); background: var(--text-on-accent); }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .82rem;
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
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: .82rem;
  transition: .18s ease;
}
.ui-btn:hover { background: var(--control-bg-hover); border-color: var(--control-border-hover); }
.ui-btn.warn { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-text); }
.ui-btn.warn:hover { background: var(--danger-bg-strong); border-color: var(--danger-border-strong); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;F("ui-kit",Ko);function pe(e){let t=b(e);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(t).replace(/"/g,"&quot;")}" data-i18n-label="${e}">?<span class="help-tip" data-i18n="${e}">${t}</span></span>`}function Jo(e,t){let o=Math.abs(Number(e));return!Number.isFinite(o)||o<1e3?t:Math.pow(10,Math.floor(Math.log10(o))-1)}function Qo(e){let t=String(e),o=t.indexOf(".");return o<0?0:t.length-o-1}function re(e,t={}){let o=e.querySelector(t.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):e.insertAdjacentElement("afterbegin",r);let a=[],n=()=>r.classList.toggle("show",a.some(l=>l.dirty)),i=(l,S)=>{l.dirty=S,n()};function d(l){return l.markDirty=()=>i(l,!0),a.push(l),l}function f(l,S){let A={dirty:!1,input:l},_=S.baseStep!=null?S.baseStep:parseFloat(l.step)||1,x=Qo(_),C=S.min!=null?S.min:l.min!==""?parseFloat(l.min):-1/0,M=S.max!=null?S.max:l.max!==""?parseFloat(l.max):1/0,W=H=>x>0?Number(H).toFixed(x):String(Math.round(Number(H)));if(!S.nostep){let H=document.createElement("div");H.className="ui-stepper",l.parentNode.insertBefore(H,l);let E=document.createElement("button");E.type="button",E.className="ui-step-btn",E.textContent="\u2212",E.tabIndex=-1,E.setAttribute("aria-label",b("common.decrease"));let Z=document.createElement("button");Z.type="button",Z.className="ui-step-btn",Z.textContent="+",Z.tabIndex=-1,Z.setAttribute("aria-label",b("common.increase")),H.appendChild(E),H.appendChild(l),H.appendChild(Z),l.readOnly=!0;let I=X=>{if(l.disabled)return;let U=parseFloat(l.value);Number.isFinite(U)||(U=parseFloat(l.placeholder)),Number.isFinite(U)||(U=0);let ke=Math.min(M,Math.max(C,U+X*Jo(U,_)));l.value=W(ke),i(A,!0)};E.addEventListener("click",()=>I(-1)),Z.addEventListener("click",()=>I(1)),l.addEventListener("dblclick",()=>{l.disabled||(l.readOnly=!1,l.classList.add("editing"),l.focus(),l.select())}),l.addEventListener("blur",()=>{l.readOnly=!0,l.classList.remove("editing")}),l.addEventListener("keydown",X=>{X.key==="Enter"&&l.blur()})}return l.addEventListener("input",()=>i(A,!0)),A.sync=()=>{let H=S.read();l.value=H!=null&&Number.isFinite(Number(H))?W(H):""},A.commit=()=>{let H=parseFloat(l.value);Number.isFinite(H)&&S.commit(Math.min(M,Math.max(C,H)))},d(A)}function m(l,S){let A={dirty:!1,input:l};return l.addEventListener("input",()=>i(A,!0)),A.sync=()=>{let _=S.read();l.value=_!=null?_:""},A.commit=()=>S.commit(l.value.trim()),d(A)}function g(l,S){let A={dirty:!1,input:l};return l.addEventListener("change",()=>i(A,!0)),A.sync=()=>{let _=S.read();_!=null&&(l.value=_)},A.commit=()=>S.commit(l.value),d(A)}function z(l,S){let A={dirty:!1,input:l,staged:!1},_=l.closest(".ui-row"),x=()=>{l.classList.toggle("on",A.staged),_&&_.classList.toggle("is-on",A.staged),l.setAttribute("aria-checked",A.staged?"true":"false"),S.onChange&&S.onChange(A.staged)};return l.addEventListener("click",()=>{A.staged=!A.staged,i(A,!0),x()}),A.sync=()=>{A.staged=!!S.read(),x()},A.commit=()=>S.commit(A.staged),d(A)}function h(l){let S={dirty:!1,sync:l.sync,commit:l.commit};return d(S)}let c=()=>a.forEach(l=>{!l.dirty&&l.sync&&l.sync()}),u=()=>{a.forEach(l=>{l.dirty&&(l.commit&&l.commit(),l.dirty=!1)}),n(),t.onApply&&t.onApply()},y=()=>{a.forEach(l=>{l.dirty=!1,l.sync&&l.sync()}),n(),t.onDiscard&&t.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",u),r.querySelector(".ui-form-discard").addEventListener("click",y),k(r),{num:f,text:m,select:g,toggle:z,custom:h,refresh:c,apply:u,discard:y,isDirty:()=>a.some(l=>l.dirty)}}function ne(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function Ie(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Be(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,o=e%86400/3600|0,r=e%3600/60|0;return t>0?t+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function eo(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}function to(e){if(e==null||isNaN(e))return"hh:mm";let t=Math.round(Date.now()/1e3-e),o=new Date(t*1e3),r=a=>String(a).padStart(2,"0");return`${r(o.getHours())}:${r(o.getMinutes())}`}var er=`
.topbar {
  position: static;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg-vibrant);
  box-shadow: var(--panel-shadow);
  display: grid;
  gap: 10px;
}

.topbar-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.top-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-self: center;
  gap: 4px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-brand {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  white-space: nowrap;
}

.top-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 7px;
}

.menu-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  border-radius: 11px;
  padding: 10px 12px;
  font-size: .78rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: .8px;
  transition: .2s ease;
}

.menu-link:hover {
  color: var(--text-strong);
  background: var(--control-bg-hover);
  border-color: var(--control-border-hover);
}

.menu-link.active {
  color: var(--text-on-accent);
  border-color: var(--accent);
  background: var(--accent);
}

.top-meta {
  display: grid;
  justify-items: end;
  row-gap: 4px;
  color: var(--muted);
  font-size: .74rem;
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
  border-radius: 14px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
}

.meta-chip-label {
  text-transform: uppercase;
  letter-spacing: .6px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-secondary);
}

.meta-chip-value {
  font-size: 12px;
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
  font-size: .62rem;
  letter-spacing: .7px;
  color: var(--text-secondary);
  font-family: var(--mono);
  text-transform: uppercase;
}

.top-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--state-disabled);
  transition: .2s ease;
}

.top-dot.on {
  background: var(--state-ok);
  box-shadow: 0 0 12px var(--success-border);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  /* Stat pills (uptime / wifi / heat source) ride to the very top, above brand + menu. */
  .top-meta { order: -2; justify-items: center; }
  .top-brand { order: -1; justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;F("hv6-header",er);var tr=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview" data-i18n="nav.monitor">Monitor</a>
        <a href="#" class="menu-link" data-section="zones" data-i18n="nav.zones">Zones</a>
        <a href="#" class="menu-link" data-section="settings" data-i18n="nav.settings">Settings</a>
        <a href="#" class="menu-link" data-section="diagnostics" data-i18n="nav.diagnostics">Diagnostics</a>
      </nav>
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
          <span class="meta-chip" id="hdr-asgard" hidden>
            <span class="meta-chip-label" data-i18n="meta.heatSourceLastPush">Heat Src Last Push</span>
            <span class="meta-chip-values"><span class="meta-chip-value" id="hdr-asgard-val">---</span><span class="meta-chip-value" id="hdr-asgard-time">--:--</span></span>
          </span>
        </div>
      </div>
    </div>
  </header>
`,sa=T({tag:"hv6-header",render:tr,onMount(e,t){let o=t.querySelector("#hdr-dot"),r=t.querySelector("#hdr-sync"),a=t.querySelector("#hdr-up"),n=t.querySelector("#hdr-wifi"),i=t.querySelector("#hdr-asgard"),d=t.querySelector("#hdr-asgard-val"),f=t.querySelector("#hdr-asgard-time"),m=t.querySelector("#hdr-fw"),g=t.querySelectorAll(".menu-link");function z(){let c=O("section");g.forEach(u=>{u.classList.toggle("active",u.getAttribute("data-section")===c)})}function h(){let c=O("live"),u=O("pendingWrites"),y=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);o.classList.toggle("on",!!c);let l,S;u>0?(l=b("status.saving"),S="saving"):y?(l=window.HV6_DASHBOARD_CONFIG.mockLabel||b("status.mock"),S="synced"):c?(l=b("status.live"),S="synced"):(l=b("status.offline"),S="offline"),r.textContent=l,r.className="meta-chip meta-chip-state "+S,a.textContent=Be(L(s.uptime)),n.textContent=eo(L(s.wifi));let A=L(s.asgardLastPushC),_=L(s.asgardLastPushAgeS),x=Y(s.asgardEnabled)&&A!=null&&Number.isFinite(A);i.hidden=!x,x&&(d.textContent=A.toFixed(2)+"\xB0C",f.textContent=to(_));let C=O("firmwareVersion")||N(s.firmware);m.textContent=C?"FW "+C:""}g.forEach(c=>{c.addEventListener("click",u=>{u.preventDefault(),_t(c.getAttribute("data-section"))})}),B("section",z),B("live",h),B("pendingWrites",h),B("firmwareVersion",h),w(s.uptime,h),w(s.wifi,h),w(s.asgardLastPushC,h),w(s.asgardLastPushAgeS,h),w(s.asgardEnabled,h),w(s.firmware,h),z(),k(t),h()}});var or=`
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: var(--panel-shadow);
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
`;F("connectivity-card",or);var rr=()=>`
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,ga=T({tag:"connectivity-card",render:rr,onMount(e,t){let o=t.querySelector(".cc-ip"),r=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function i(){o.textContent=N(s.ip)||"---",r.textContent=N(s.ssid)||"---",a.textContent=N(s.mac)||"---",n.textContent=Be(L(s.uptime))}w(s.ip,i),w(s.ssid,i),w(s.mac,i),w(s.uptime,i),k(t),i()}});var nr="http://www.w3.org/2000/svg",ar=`
.chart-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
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
  border-radius: 2px;
  background: var(--accent);
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
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 32%, transparent);
  flex-shrink: 0;
}

.chart-card svg { width: 100%; height: auto; display: block; overflow: visible; }
.chart-grid { stroke: rgba(150,168,205,.14); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-axis { stroke: rgba(150,168,205,.34); stroke-width: 1; vector-effect: non-scaling-stroke; }
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
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 7px 9px;
  font-size: .7rem;
  color: var(--text-strong);
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  white-space: nowrap;
  opacity: 0;
  transition: opacity .1s ease;
}
.chart-tooltip.show { opacity: 1; }
.chart-tooltip .tt-time { font-weight: 800; letter-spacing: .4px; margin-bottom: 4px; color: var(--text-strong); }
.chart-tooltip .tt-row { display: flex; align-items: center; gap: 6px; line-height: 1.5; }
.chart-tooltip .tt-swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.chart-tooltip .tt-val { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 700; }
`;F("chart-kit",ar);function oe(e,t,o){let r=document.createElementNS(nr,e);if(t)for(let a in t)r.setAttribute(a,t[a]);return o!=null&&(r.textContent=o),r}function oo(e){if(!e.length)return"";if(e.length<3)return"M "+e.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let t=.16,o=`M ${e[0].x.toFixed(2)} ${e[0].y.toFixed(2)}`;for(let r=0;r<e.length-1;r++){let a=e[r-1]||e[r],n=e[r],i=e[r+1],d=e[r+2]||i,f=n.x+(i.x-a.x)*t,m=n.y+(i.y-a.y)*t,g=i.x-(d.x-n.x)*t,z=i.y-(d.y-n.y)*t;o+=` C ${f.toFixed(2)} ${m.toFixed(2)}, ${g.toFixed(2)} ${z.toFixed(2)}, ${i.x.toFixed(2)} ${i.y.toFixed(2)}`}return o}function ro(e,t,o){let r=document.createElement("div");r.className="chart-tooltip",t.appendChild(r);let a=oe("g",{class:"chart-cursor",style:"display:none"}),n=oe("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});a.appendChild(n);let i=[];e.appendChild(a);function d(z){let h=0,c=1/0;for(let u=0;u<o.count;u++){let y=Math.abs(z-o.xAt(u));y<c&&(c=y,h=u)}return h}function f(z){let h=e.getScreenCTM();if(!h)return null;let c=e.createSVGPoint();return c.x=z.clientX,c.y=z.clientY,c.matrixTransform(h.inverse())}function m(z){if(!o.count)return;let h=f(z);if(!h)return;let c=d(h.x),u=o.xAt(c);n.setAttribute("x1",u),n.setAttribute("x2",u);let y=o.dots(c);for(;i.length<y.length;){let _=oe("circle",{class:"chart-cursor-dot",r:3.4});a.appendChild(_),i.push(_)}i.forEach((_,x)=>{x<y.length?(_.setAttribute("cx",u),_.setAttribute("cy",y[x].y),_.setAttribute("fill",y[x].color),_.style.display=""):_.style.display="none"}),a.style.display="";let l=o.rows(c).map(_=>`<div class="tt-row"><span class="tt-swatch" style="background:${_.color}"></span>${_.label}<span class="tt-val">${_.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(c)}</div>${l}`,r.classList.add("show");let S=t.getBoundingClientRect(),A=z.clientX-S.left+14;A+r.offsetWidth>S.width-6&&(A=z.clientX-S.left-r.offsetWidth-14),r.style.left=Math.max(6,A)+"px",r.style.top=Math.max(6,z.clientY-S.top+12)+"px"}function g(){r.classList.remove("show"),a.style.display="none"}return e.addEventListener("pointermove",m),e.addEventListener("pointerleave",g),()=>{e.removeEventListener("pointermove",m),e.removeEventListener("pointerleave",g),r.remove()}}var Ae=1e3,ft=180,le=14,sr=42,ir=44,fe=42,je=Ae-fe-sr,ge=ft-le-ir,ve=le+ge,bt=24*3600,no=Q+2,ao=Q+3,We=Q+4,lr="var(--series-warm)",dr="var(--series-cool)",so="var(--series-solar)",cr=`
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 10px;
  background: rgba(0,32,46,.34);
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
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 999px;
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
  border-radius: 999px;
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
`;F("graph-widgets",cr);var io=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',lo=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',pr=e=>e.variant==="flow-return"?`<div class="graph-widgets">${io()}</div>`:e.variant==="demand"?`<div class="graph-widgets">${lo()}</div>`:`<div class="graph-widgets">${io()}${lo()}</div>`;function co(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1):"\u2014"}function ur(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"\xB0":"\u2014"}function vt(e,t,o){let r=[];for(let a=0;a<e.length;a++){let n=e[a];if(!n||n[0]<o)continue;let i=n[t];i==null||!Number.isFinite(i)||r.push({t:n[0],v:i})}return r}var Ve=(e,t)=>fe+Math.max(0,Math.min(1,(e-t)/bt))*je;function mr(e,t,o){let r=Number(Date.now()/1e3)|0,a=3600,n=Math.ceil((r-bt)/a)*a,i=Math.floor(r/a)*a,d=Math.floor(r/a)*a;for(let m=n;m<=i;m+=a){let g=o-(r-m),z=Ve(g,t),h=new Date(m*1e3),c=m===d,u=ve+16;e.appendChild(oe("text",{x:z,y:u,"text-anchor":"end",transform:`rotate(-45 ${z.toFixed(1)} ${u})`,class:"chart-hour"+(c?" now":"")},String(h.getHours()).padStart(2,"0")))}let f=Ve(o,t);e.appendChild(oe("line",{x1:f,y1:le,x2:f,y2:ve,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function gr(e){let t=[];if(e.forEach(n=>n.forEach(i=>t.push(i.v))),!t.length)return{min:0,max:10};let o=Math.min(...t),r=Math.max(...t);o===r&&(o-=.5,r+=.5);let a=(r-o)*.1;return o-=a,r+=a,{min:o,max:r}}function fr(e,t,o){let r=e.filter(a=>a.unit==="C").map(a=>vt(t,a.index,o));return gr(r)}function po(e,t,o,r,a,n){e.innerHTML="",e.setAttribute("viewBox",`0 0 ${Ae} ${ft}`),e.setAttribute("preserveAspectRatio","xMidYMid meet");let i=o.map(u=>vt(r,u.index,a));if(!i.some(u=>u.length))return e.appendChild(oe("text",{x:Ae/2,y:ft/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let d=fr(o,r,a),f=Math.max(.001,d.max-d.min),m=u=>le+(1-(u-d.min)/f)*ge,g=u=>le+(1-Math.max(0,Math.min(100,u))/100)*ge,z=(u,y)=>u.unit==="%"?g(y):m(y);for(let u=0;u<3;u++){let y=u/2,l=le+y*ge;e.appendChild(oe("line",{x1:fe,y1:l,x2:fe+je,y2:l,class:"chart-grid"})),o.some(S=>S.unit==="C")&&e.appendChild(oe("text",{x:fe-6,y:l+4,"text-anchor":"end",class:"chart-tick"},co(d.max-f*y,"C")+"\xB0")),o.some(S=>S.unit==="%")&&e.appendChild(oe("text",{x:fe+je+6,y:l+4,"text-anchor":"start",class:"chart-tick"},co(100-100*y,"%")))}e.appendChild(oe("line",{x1:fe,y1:ve,x2:fe+je,y2:ve,class:"chart-axis"})),o.some(u=>u.unit==="C")&&e.appendChild(oe("text",{x:9,y:le+ge/2,transform:`rotate(-90 9 ${(le+ge/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},b("overview.graph.axis.temp"))),o.some(u=>u.unit==="%")&&e.appendChild(oe("text",{x:Ae-9,y:le+ge/2,transform:`rotate(90 ${Ae-9} ${(le+ge/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},b("overview.graph.axis.demand"))),mr(e,a,n),o.forEach((u,y)=>{let l=i[y].map(A=>({x:Ve(A.t,a),y:z(u,A.v)}));if(!l.length)return;let S=oo(l);u.fill&&e.appendChild(oe("path",{d:S+` L ${l[l.length-1].x.toFixed(1)} ${ve} L ${l[0].x.toFixed(1)} ${ve} Z`,fill:u.fill,stroke:"none"})),e.appendChild(oe("path",{d:S,fill:"none",stroke:u.color,"stroke-width":String(u.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let h=[];for(let u=0;u<r.length;u++){let y=r[u];if(!y||y[0]<a)continue;let l=o.map(S=>y[S.index]);l.every(S=>S==null||!Number.isFinite(S))||h.push({t:y[0],vals:l})}if(!h.length)return null;let c=Date.now();return ro(e,t,{count:h.length,plotTop:le,plotBottom:ve,xAt:u=>Ve(h[u].t,a),label:u=>new Date(c-(n-h[u].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:u=>o.map((y,l)=>({y:z(y,h[u].vals[l]),color:y.color})).filter((y,l)=>Number.isFinite(h[u].vals[l])),rows:u=>o.map((y,l)=>({color:y.color,label:y.label,value:ur(h[u].vals[l],y.unit)})).filter((y,l)=>Number.isFinite(h[u].vals[l]))})}function Ze(e,t,o){let r=vt(e,t,o);return r.length?r[r.length-1].v:null}var Sa=T({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:pr,onMount(e,t){let o=t.querySelector(".gw-dt"),r=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand"),i=Array.from(t.querySelectorAll(".gw-toggle")),d={flow:!0,return:!0,demand:!0},f=null,m=null;function g(){i.forEach(c=>{let u=c.dataset.layer;c.classList.toggle("is-off",!d[u]),c.setAttribute("aria-pressed",d[u]?"true":"false")})}function z(){let c=[];return d.flow&&c.push({index:no,color:lr,label:b("overview.graph.layers.flow"),unit:"C",width:2.4}),d.return&&c.push({index:ao,color:dr,label:b("overview.graph.layers.return"),unit:"C",width:2}),d.demand&&c.push({index:We,color:so,label:b("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),c}function h(){let c=O("zoneStateHistory"),u=c&&Array.isArray(c.entries)?c.entries:[],y=c&&c.uptime_s||Number(Date.now()/1e3)|0,l=y-bt;if(a){f&&f();let S=Ze(u,no,l),A=Ze(u,ao,l),_=Ze(u,We,l),x=[];S!=null&&A!=null&&x.push("\u0394 "+(S-A).toFixed(1)+"\xB0"),_!=null&&x.push(Math.round(_)+"%"),o.textContent=x.length?x.join(" \xB7 "):"\u2014",f=po(a,a.closest(".chart-card"),z(),u,l,y)}if(n){m&&m();let S=Ze(u,We,l);r.textContent=S!=null?Math.round(S)+"%":"\u2014",m=po(n,n.closest(".chart-card"),[{index:We,color:so,label:b("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],u,l,y)}}i.forEach(c=>{c.addEventListener("click",()=>{let u=c.dataset.layer;d[u]=!d[u],!d.flow&&!d.return&&!d.demand&&(d[u]=!0),g(),h()})}),B("zoneStateHistory",h),k(t),g(),h()}});var be={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"#ff8531"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Me=24*3600,br=Me,Ee=18,yt=4,he=54,Ge=32,_e=4,Ue=10,go=6,fo="#ffc14d",ht=9,uo=Q+1,bo=_e+Q*(Ee+yt)-yt,xt=bo+go,$e=bo+go+Ue+Ge,vr=`
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
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
  border-radius: 2px;
  background: var(--accent);
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
  border-radius: 10px;
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
`;F("zone-state-timeline",vr);var hr=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function xr(e,t){if(!e||!e.entries||e.entries.length===0)return null;let o=e.entries,r=e.uptime_s||t||0,a=Number(Date.now()/1e3)|0,n=1e3,i=n-he;function d(_){let x=(_+Me)/br;return he+Math.max(0,Math.min(1,x))*i}function f(_){return _-r}let m="http://www.w3.org/2000/svg",g=document.createElementNS(m,"svg");g.setAttribute("viewBox","0 0 "+n+" "+$e),g.classList.add("timeline-svg");let z=document.createElementNS(m,"rect");z.setAttribute("x",he),z.setAttribute("y",_e),z.setAttribute("width",i),z.setAttribute("height",$e-_e-Ge),z.setAttribute("fill","rgba(0,32,46,0.55)"),z.setAttribute("rx","4"),g.appendChild(z);let h=d(0),c=[-24,-18,-12,-6,0].map(_=>_*3600);for(let _ of c){let x=d(_),C=document.createElementNS(m,"line");C.setAttribute("x1",x),C.setAttribute("y1",_e),C.setAttribute("x2",x),C.setAttribute("y2",$e-Ge),C.setAttribute("stroke",_===0?"var(--series-solar)":"rgba(120,146,200,.16)"),C.setAttribute("stroke-width","1"),_===0&&(C.setAttribute("stroke-dasharray","2 3"),C.setAttribute("opacity",".55"),C.setAttribute("vector-effect","non-scaling-stroke")),g.appendChild(C)}g.appendChild(yr(m,"text",{x:h+4,y:_e+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let _=0;_<Q;_++){let x=_e+_*(Ee+yt),C=document.createElementNS(m,"rect");C.setAttribute("x",he),C.setAttribute("y",x),C.setAttribute("width",i),C.setAttribute("height",Ee),C.setAttribute("fill",_%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),g.appendChild(C);let M=document.createElementNS(m,"text");M.setAttribute("x",he-4),M.setAttribute("y",x+Ee/2+1),M.setAttribute("text-anchor","end"),M.setAttribute("dominant-baseline","middle"),M.setAttribute("fill","rgba(233,222,210,.62)"),M.setAttribute("font-size","9.5"),M.setAttribute("font-family","Montserrat, sans-serif"),M.setAttribute("font-weight","600"),M.textContent="Z"+(_+1),g.appendChild(M);let W=o.map(E=>({rel:f(E[0]),state:E[_+1]})).filter(E=>E.rel>=-Me&&E.rel<=0),H=(E,Z,I)=>{if(I===255)return;let X=be[I]||be[255];if(X.color==="transparent")return;let U=d(E),ke=d(Z),Qe=Math.max(1,ke-U),ce=document.createElementNS(m,"rect");ce.setAttribute("x",U),ce.setAttribute("y",x+(Ee-ht)/2),ce.setAttribute("width",Qe),ce.setAttribute("height",ht),ce.setAttribute("fill",X.color),ce.setAttribute("rx",String(ht/2)),ce.setAttribute("opacity","0.9"),g.appendChild(ce)};if(W.length){let E=W[0].rel,Z=W[0].state;for(let I=1;I<W.length;I++){let X=W[I];X.state!==Z&&(H(E,X.rel,Z),E=X.rel,Z=X.state)}H(E,0,Z)}}{let _=document.createElementNS(m,"rect");_.setAttribute("x",he),_.setAttribute("y",xt),_.setAttribute("width",i),_.setAttribute("height",Ue),_.setAttribute("fill","rgba(188,80,144,0.10)"),_.setAttribute("rx","2"),g.appendChild(_);let x=document.createElementNS(m,"text");x.setAttribute("x",he-4),x.setAttribute("y",xt+Ue/2+1),x.setAttribute("text-anchor","end"),x.setAttribute("dominant-baseline","middle"),x.setAttribute("fill","rgba(233,222,210,.62)"),x.setAttribute("font-size","8.5"),x.setAttribute("font-family","Montserrat, sans-serif"),x.setAttribute("font-weight","600"),x.textContent=b("overview.timeline.absorb"),g.appendChild(x);let C=o.map(M=>({rel:f(M[0]),on:M.length>uo?M[uo]:0})).filter(M=>M.rel>=-Me&&M.rel<=0);if(C.length){let M=(E,Z)=>{let I=d(E),X=Math.max(1,d(Z)-I),U=document.createElementNS(m,"rect");U.setAttribute("x",I),U.setAttribute("y",xt),U.setAttribute("width",X),U.setAttribute("height",Ue),U.setAttribute("fill",fo),U.setAttribute("rx","2"),U.setAttribute("opacity","0.9"),g.appendChild(U)},W=C[0].rel,H=C[0].on;for(let E=1;E<C.length;E++)C[E].on!==H&&(H&&M(W,C[E].rel),W=C[E].rel,H=C[E].on);H&&M(W,0)}}let u=$e-Ge+15,y=3600,l=Math.ceil((a-Me)/y)*y,S=Math.floor(a/y)*y,A=Math.floor(a/y)*y;for(let _=l;_<=S;_+=y){let x=_-a,C=d(x),M=new Date(_*1e3),W=String(M.getHours()).padStart(2,"0"),H=_===A,E=document.createElementNS(m,"text");E.setAttribute("x",C),E.setAttribute("y",u),E.setAttribute("text-anchor","end"),E.setAttribute("fill",H?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),E.setAttribute("font-size","9"),E.setAttribute("font-family",'"Montserrat", sans-serif'),E.setAttribute("font-weight","500"),E.setAttribute("font-variant-numeric","tabular-nums lining-nums"),E.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),E.setAttribute("letter-spacing","0"),E.setAttribute("transform",`rotate(-45 ${C.toFixed(1)} ${u})`),E.textContent=W,g.appendChild(E)}return g}function yr(e,t,o,r){let a=document.createElementNS(e,t);for(let n in o)a.setAttribute(n,o[n]);return r!=null&&(a.textContent=r),a}function mo(e){e.innerHTML="";let t=[{code:5,...be[5]},{code:6,...be[6]},{code:0,...be[0]},{code:1,...be[1]},{code:7,...be[7]},{code:2,...be[2]}];for(let r of t){let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?b(r.labelKey):""),e.appendChild(a)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+fo+'"></span>'+b("overview.timeline.preheatAbsorption"),e.appendChild(o)}var Ea=T({tag:"zone-state-timeline",render:hr,onMount(e,t){let o=t.querySelector(".tl-body"),r=t.querySelector(".timeline-legend");mo(r);function a(){let n=O("zoneStateHistory"),i=(()=>{let f=O&&O("zoneStateHistory");return f&&f.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!n||!n.entries||n.entries.length===0){let f=document.createElement("div");f.className="timeline-empty",f.textContent=b("overview.timeline.noHistory"),o.appendChild(f);return}let d=xr(n,i);d&&o.appendChild(d)}B("zoneStateHistory",a),B("zoneNames",a),w(s.drivers,a);for(let n=1;n<=Q;n++)w(p.enabled(n),a),w(p.state(n),a),w(p.temp(n),a),w(p.setpoint(n),a),w(p.preheatAdvance(n),a);k(t),a()}});var wr=`
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
`;F("zone-grid",wr);var zr=()=>'<div class="zone-grid"></div>',Da=T({tag:"zone-grid",render:zr,onMount(e,t){for(let o=1;o<=6;o++)t.appendChild(V("zone-card",{zone:o}))}});var Sr=`
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 12px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,146,200,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(124,155,208,.42);
	border-left-color: rgba(124,155,208,.7);
	background: rgba(0,47,69,.56);
}
.zone-card.active {
	border-color: rgba(255,133,49,.44);
	border-left-color: rgba(255,133,49,.84);
	background: rgba(255,133,49,.10);
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,146,200,.35);
}

.zone-card.zs-heating { border-left-color: #ff8531; }
.zone-card.zs-idle { border-left-color: #7aa7ce; }
.zone-card.zs-fault { border-left-color: #ff6361; }
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
	font-size: 12px;
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
	border-radius: 999px;
	border: 1px solid rgba(255,133,49,.44);
	background: rgba(255,133,49,.12);
	color: var(--accent);
	font-size: 9px;
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
	font-size: 12px;
	font-weight: 600;
	line-height: 1.1;
	color: var(--text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
`;F("zone-card",Sr);var _r=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span><span class="zc-link" hidden>LINK</span></div>
		<div class="zc-zone-name">${$(e.zone)}</div>
		<div class="zc-friendly">${me(e.zone)||"---"}</div>
	</div>
`,Wa=T({tag:"zone-card",state:e=>({zone:e.zone}),render:_r,onMount(e,t){let o=e.zone,r=p.temp(o),a=p.state(o),n=p.enabled(o),i=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),f=t.querySelector(".zc-link"),m=t.querySelector(".zc-zone-name"),g=t.querySelector(".zc-friendly");function z(c){let u=String(c||"").match(/\d+/);return u?Number(u[0]):0}function h(){let c=Y(n),u=String(N(a)||"").toUpperCase()||"OFF",y=String(N(p.motorLastFault(o))||"").toUpperCase(),l=y&&y!=="NONE"&&y!=="OK",S=c&&(u==="FAULT"||l)?"FAULT":u,A=O("selectedZone")===o,_=me(o);m.textContent=$(o),g.textContent=_||ne(L(r));let x=c?S:"OFF";i.textContent=x==="HEATING"?b("state.heating"):x==="IDLE"?b("state.idle"):x==="FAULT"?b("common.fault"):x==="MANUAL"?b("state.manual"):x==="OVERHEATED"?b("state.overheated"):x==="CALIBRATING"?b("state.calibrating"):b("state.off");let C=z(N(p.syncTo(o))),M=[];for(let I=1;I<=6;I++)I!==o&&z(N(p.syncTo(I)))===o&&M.push(I);let W=C>0&&C!==o||M.length>0;f.hidden=!W,f.textContent=C>0&&C!==o?b("zone.card.linkZone",{zone:C}):M.length>1?b("zone.card.groupCount",{count:M.length}):b("zone.card.linkZone",{zone:M[0]});let H=C>0&&C!==o?b("zone.card.groupedWith",{zones:$(C)}):M.length>0?b("zone.card.groupedWith",{zones:M.map($).join(", ")}):"";t.title=l?b("zone.card.fault",{fault:y}):H;let E=x==="HEATING"?"#ffd380":x==="IDLE"?"#7aa7ce":x==="FAULT"?"#ff6361":"#6E7E96",Z=x==="HEATING"?"#ff8531":x==="IDLE"?"#7aa7ce":x==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";i.style.color=E,d.style.background=Z,d.style.boxShadow=x==="HEATING"?"0 0 5px rgba(255,133,49,.6)":x==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",A),t.classList.toggle("disabled",!c),t.classList.toggle("zs-heating",c&&x==="HEATING"),t.classList.toggle("zs-fault",c&&x==="FAULT"),t.classList.toggle("zs-idle",c&&x!=="HEATING"&&x!=="FAULT"),t.classList.toggle("zs-off",!c)}t.addEventListener("click",()=>{kt(o)}),w(r,h),w(a,h),w(n,h),w(p.motorLastFault(o),h);for(let c=1;c<=6;c++)w(p.syncTo(c),h);B("selectedZone",h),B("zoneNames",h),h()}});var kr=`
.zone-detail {
  background: var(--panel-bg-flat);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: var(--panel-shadow);
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
  border-radius: 999px;
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
`;F("zone-detail",kr);var Cr=e=>`
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
`;function vo(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function ho(e){return e!=null?Number(e).toFixed(0):"---"}function Lr(e){return e!=null?Number(e).toFixed(2)+"C":"---"}function Ar(e,t){if(!t)return b("common.disabled");let o=String(e||"IDLE").toUpperCase();return o==="HEATING"?b("state.heating"):o==="IDLE"?b("state.idle"):o==="OFF"?b("state.off"):o==="FAULT"?b("common.fault"):o==="MANUAL"?b("state.manual"):o==="OVERHEATED"?b("state.overheated"):o==="CALIBRATING"?b("state.calibrating"):o}var Ka=T({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Cr,methods:{update(e,t){let o=O("selectedZone"),r=String(N(p.state(o))||"").toUpperCase(),a=Y(p.enabled(o));this.zone=o,e.dataset.zone=String(o),t.title.textContent=$(o),t.setpoint.textContent=ne(L(p.setpoint(o))),t.temp.textContent=ne(L(p.temp(o))),t.ret.textContent=ne(L("sensor-manifold_return_temperature")),t.valve.textContent=Ie(L(p.valve(o)));let n=t.badge;n.textContent=Ar(r,a);let i=a?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(i?" "+i:""),t.toggle.classList.toggle("on",a),t.orip.textContent=ho(L(p.motorOpenRipples(o))),t.crip.textContent=ho(L(p.motorCloseRipples(o))),t.ofac.textContent=vo(L(p.motorOpenFactor(o))),t.cfac.textContent=vo(L(p.motorCloseFactor(o))),t.ph.textContent=Lr(L(p.preheatAdvance(o)));let d=String(N(p.motorLastFault(o))||"").toUpperCase(),f=d&&d!=="NONE"&&d!=="OK";t.fault.hidden=!f,f&&(t.faultVal.textContent=d)},incSetpoint(){let e=this.zone,t=L(p.setpoint(e))||20;at(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=L(p.setpoint(e))||20;at(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=Y(p.enabled(e));Pt(e,!t)}},onMount(e,t){let o={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};o.inc.onclick=()=>e.incSetpoint(),o.dec.onclick=()=>e.decSetpoint(),o.toggle.onclick=()=>e.toggleEnabled();let r=()=>e.update(t,o),a=n=>{let i=O("selectedZone");(n===p.temp(i)||n===p.setpoint(i)||n===p.valve(i)||n===p.state(i)||n===p.enabled(i))&&r()};for(let n=1;n<=6;n++)w(p.temp(n),a),w(p.setpoint(n),a),w(p.valve(n),a),w(p.state(n),a),w(p.enabled(n),a),w(p.motorOpenRipples(n),r),w(p.motorCloseRipples(n),r),w(p.motorOpenFactor(n),r),w(p.motorCloseFactor(n),r),w(p.preheatAdvance(n),r),w(p.motorLastFault(n),r);w("sensor-manifold_return_temperature",r),B("selectedZone",r),k(t),r()}});var Mr=`
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
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
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
  border-radius: 10px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
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
  border-radius: 10px;
  overflow: hidden;
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
  border-radius: 12px;
  background: rgba(255,133,49,.08);
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
  border-radius: 10px;
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
`;F("zone-sensor-card",Mr);var Er=()=>{let e='<option value="None" data-i18n="common.none">None</option>';for(let t=1;t<=8;t++)e+='<option value="Probe '+t+'">Probe '+t+"</option>";return`
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
  `};function xo(e,t){let o=e.value,r='<option value="None" data-i18n="common.none">'+b("common.none")+"</option>";for(let a=1;a<=6;a++)a!==t&&(r+='<option value="Zone '+a+'">'+b("common.zone")+" "+a+"</option>");e.innerHTML=r,e.value=o||"None"}function Fr(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Nr(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function yo(e,t){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+b("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+b("zone.sensor.bleSource")+"</option>";e.innerHTML!==o&&(e.innerHTML=o),e.value=t}function wo(e){let t=String(e||"").match(/\d+/);return t?Number(t[0]):0}var ss=T({tag:"zone-sensor-card",render:Er,onMount(e,t){let o=t.querySelector(".zs-probe"),r=t.querySelector(".zs-source"),a=t.querySelector(".zs-ble"),n=t.querySelector(".zs-sync"),i=t.querySelector(".zs-row-ble"),d=t.querySelector(".zs-scan"),f=t.querySelector(".zs-scan-list"),m=t.querySelector(".merge-visual"),g=t.querySelector(".merge-rail"),z=t.querySelector(".merge-caption"),h=0;function c(){return O("selectedZone")}function u(){i.style.display=r.value==="BLE Sensor"?"":"none"}function y(){let x=c(),C=wo(n.value),M=[];for(let Z=1;Z<=6;Z++)Z!==x&&wo(N(p.syncTo(Z)))===x&&M.push(Z);let W=C>0&&C!==x,H=W||M.length>0;if(m.classList.toggle("is-solo",!H),!H){g.innerHTML='<span class="merge-pill primary">'+$(x)+'</span><span class="merge-link"></span><span class="merge-pill">'+b("zone.sensor.noMerge")+"</span>",z.textContent=b("zone.sensor.soloCaption");return}if(W){g.innerHTML='<span class="merge-pill secondary">'+$(x)+'</span><span class="merge-link"></span><span class="merge-pill primary">'+$(C)+"</span>",z.textContent=b("zone.sensor.followsCaption",{zone:$(x),target:$(C)});return}let E='<span class="merge-pill primary">'+$(x)+"</span>";for(let Z of M)E+='<span class="merge-link"></span><span class="merge-pill secondary">'+$(Z)+"</span>";g.innerHTML=E,z.textContent=b("zone.sensor.primaryCaption",{zone:$(x),zones:M.map($).join(", ")})}let l=re(t);yo(r,"Local Probe"),l.select(o,{read:()=>N(p.probe(c()))||void 0,commit:x=>Se(c(),"zone_probe",x)}),l.select(r,{read:()=>Fr(String(N(p.tempSource(c()))||"")),commit:x=>Se(c(),"zone_temp_source",Nr(x))}),l.select(n,{read:()=>N(p.syncTo(c()))||"None",commit:x=>Se(c(),"zone_sync_to",x)});let S=l.text(a,{read:()=>N(p.ble(c()))||"",commit:x=>Le(c(),"zone_ble_mac",x)});r.addEventListener("change",u),n.addEventListener("change",y);function A(){let x=c();h!==x?(xo(n,x),h=x,f.style.display="none",l.discard()):l.refresh(),u(),y()}function _(x){let C=c();(x===p.probe(C)||x===p.tempSource(C)||x===p.syncTo(C)||x===p.ble(C)||/^select-zone_\d+_sync_to$/.test(x))&&(l.refresh(),u(),y())}d.addEventListener("click",()=>{if(d.disabled)return;d.disabled=!0,d.textContent="\u2026",f.style.display="",f.innerHTML='<div class="scan-msg">'+b("zone.sensor.scanning")+"</div>";let x=new AbortController,C=setTimeout(()=>x.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:x.signal}).then(M=>{if(!M.ok)throw new Error("HTTP "+M.status);return M.json()}).then(M=>{if(clearTimeout(C),d.disabled=!1,d.textContent=b("zone.sensor.scan"),!M.ok||!M.sensors||M.sensors.length===0){f.innerHTML='<div class="scan-msg">'+b("zone.sensor.noSensors")+"</div>";return}let W=c(),H=(N(p.ble(W))||"").toUpperCase(),E=I=>String(I).replace(/[&<>"']/g,X=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[X]),Z="";for(let I of M.sensors){let X=I.mac.toUpperCase(),U=I.name?E(I.name):"",ke=I.temp_c!=null?I.temp_c.toFixed(1)+"\xB0C":"\u2014",Qe=I.rssi!=null?I.rssi+" dBm":"",ce=I.age_s<60?b("common.secondsAgo",{value:I.age_s}):b("common.minutesAgo",{value:Math.round(I.age_s/60)}),et="";X===H?et='<span class="ble-badge">'+b("zone.sensor.assignedThisZone")+"</span>":I.zone>0&&(et='<span class="ble-badge">'+b("zone.sensor.zoneBadge",{zone:I.zone})+"</span>");let Eo=U?`<div class="ble-mac">${U}</div><div class="ble-meta">${X}</div>`:`<div class="ble-mac">${X}</div>`;Z+=`<div class="ble-scan-item">
              <div>
                ${Eo}
                <div class="ble-meta">${ke} &nbsp;${Qe} &nbsp;${ce}</div>
                ${et}
              </div>
              <button class="btn-assign" data-mac="${X}">${b("zone.sensor.assign")}</button>
            </div>`}f.innerHTML=Z,f.querySelectorAll(".btn-assign").forEach(I=>{I.addEventListener("click",()=>{a.value=I.dataset.mac,S.markDirty(),f.style.display="none"})})}).catch(M=>{clearTimeout(C),d.disabled=!1,d.textContent=b("zone.sensor.scan");let W=M&&M.name==="AbortError"?b("zone.sensor.scanTimeout"):b("zone.sensor.scanFailed");f.innerHTML='<div class="scan-msg">'+W+"</div>"})}),B("selectedZone",A);for(let x=1;x<=6;x++)w(p.probe(x),_),w(p.tempSource(x),_),w(p.syncTo(x),_),w(p.ble(x),_);k(t),A()}});var Tr=`
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
`;F("zone-room-card",Tr);var Dr=()=>`
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
`,fs=T({tag:"zone-room-card",render:Dr,onMount(e,t){let o=t.querySelector(".zr-friendly"),r=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),i=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn");function d(){return O("selectedZone")}let f=re(t);f.text(o,{read:()=>me(d())||"",commit:c=>qt(d(),c)}),f.num(r,{read:()=>L(p.area(d())),commit:c=>st(d(),"zone_area_m2",c)}),f.num(a,{read:()=>L(p.spacing(d())),commit:c=>st(d(),"zone_pipe_spacing_mm",c||200)}),f.select(n,{read:()=>N(p.pipeType(d()))||"Unknown",commit:c=>Se(d(),"zone_pipe_type",c)});let m=[];function g(){i.forEach(c=>{let u=c.dataset.wall;c.classList.toggle("active",u==="None"?m.length===0:m.includes(u))})}let z=f.custom({sync:()=>{let c=N(p.exteriorWalls(d()))||"None";m=c==="None"?[]:c.split(",").filter(Boolean),g()},commit:()=>Le(d(),"zone_exterior_walls",m.length?m.join(","):"None")});i.forEach(c=>{c.addEventListener("click",()=>{let u=c.dataset.wall,y=m.slice();if(u==="None")y=[];else{let l=y.indexOf(u);l>=0?y.splice(l,1):y.push(u)}m=["N","S","E","W"].filter(l=>y.includes(l)),g(),z.markDirty()})});function h(c){let u=d();(c===p.area(u)||c===p.spacing(u)||c===p.pipeType(u)||c===p.exteriorWalls(u))&&f.refresh()}B("selectedZone",f.discard),B("zoneNames",f.refresh);for(let c=1;c<=6;c++)w(p.area(c),h),w(p.spacing(c),h),w(p.pipeType(c),h),w(p.exteriorWalls(c),h);k(t),f.refresh()}});var de=6,Pr="#6E7E96",_o="#5C6B85",Rr="#7aa7ce",Or="#9DBC78",Hr="#FF8531",qr="#FFA600",Ir="#7aa7ce",Br="#FFEAD2",Wr="#6E7E96",zo="#B9CBD8",Xe="#5C6B85",wt="#A6B9C7",ko="#A6B9C7",So="#7aa7ce",Zr="#66BB6A",jr="#FF6361",j={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,topBarY:0,topBarH:24,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},D={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},Vr=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  background: var(--card);
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
`;F("flow-diagram",Vr);function $r(e,t){let o=String(me(e)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>t?r.slice(0,Math.max(1,t-1))+"\u2026":r}function Gr(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let o=Number(t[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Ur(e,t){return t?e==null||Number.isNaN(e)?_o:e<.15?Rr:e<.4?Or:e<.7?Hr:qr:Pr}function Co(e){let t=e==="desktop"?"0 1":"1 0",o=[];o.push("<defs>"),o.push('<pattern id="'+e+'-fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="'+e+'-fglow" cx="32%" cy="18%" r="78%"><stop offset="0%" stop-color="rgba(122,167,206,0.18)"/><stop offset="52%" stop-color="rgba(240,121,91,0.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="'+e+'-boxgrad" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(let r=1;r<=de;r++)o.push('<linearGradient id="'+e+"-rg"+r+'" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'">'),o.push('<stop id="'+e+"-rgs"+r+'" offset="0%" stop-color="#ff8531"/>'),o.push('<stop id="'+e+"-rga"+r+'" offset="100%" stop-color="#7aa7ce"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function Ye(e,t,o){let r=j.boxX+j.boxW/2+(e-2.5)*j.srcSpread,a=j.srcY,n=j.zoneXs[e],i=j.zoneY-20,d=j.fanY,f=j.fanY+34;return"M"+(r-t).toFixed(1)+" "+a+" C"+(r-t).toFixed(1)+" "+d+" "+(n-o).toFixed(1)+" "+f+" "+(n-o).toFixed(1)+" "+i+" L"+(n+o).toFixed(1)+" "+i+" C"+(n+o).toFixed(1)+" "+f+" "+(r+t).toFixed(1)+" "+d+" "+(r+t).toFixed(1)+" "+a+"Z"}function Ke(e,t,o){let r=D.midY+(e-2.5)*D.spread,a=D.zoneYs[e],n=D.endX-D.srcX,i=D.srcX+n*.34,d=D.srcX+n*.7;return"M"+D.srcX+" "+(r-t).toFixed(1)+" C"+i+" "+(r-t).toFixed(1)+" "+d+" "+(a-o).toFixed(1)+" "+D.endX+" "+(a-o).toFixed(1)+" L"+D.endX+" "+(a+o).toFixed(1)+" C"+d+" "+(a+o).toFixed(1)+" "+i+" "+(r+t).toFixed(1)+" "+D.srcX+" "+(r+t).toFixed(1)+"Z"}function Lo(e,t,o){return'<rect width="'+e+'" height="'+t+'" rx="22" fill="var(--card)"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fdots)" opacity="0.48"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fglow)"/>'}function Ao(e){let t=e==="desktop"?j:D,o=e==="desktop"?t.boxY+27:t.boxY+29,r=e==="desktop"?t.boxY+56:t.boxY+58;return'<rect x="'+t.boxX+'" y="'+t.boxY+'" width="'+t.boxW+'" height="'+t.boxH+'" rx="7" fill="#ff8531"/><text id="'+e+'-fd-flow-label" x="'+(t.boxX+t.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(e==="desktop"?18:17)+'" font-weight="800" fill="var(--text-on-accent)" letter-spacing="2">'+b("overview.flowDiagram.flow")+'</text><text id="'+e+'-fd-flow-temp" class="flow-metric" x="'+(t.boxX+t.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(e==="desktop"?26:24)+'" fill="var(--text-on-accent)">---</text>'}function Xr(){let e=[],t=j.w,o=j.h,r=j.zoneY-20;e.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+t+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet">'),e.push(Co("desktop")),e.push(Lo(t,o,"desktop")),e.push('<rect x="'+j.boxX+'" y="'+j.topBarY+'" width="'+j.boxW+'" height="'+j.topBarH+'" fill="url(#desktop-boxgrad)" rx="5"/>'),e.push(Ao("desktop")),e.push('<text id="desktop-fd-ret-temp" x="'+(j.boxX+j.boxW+24)+'" y="'+(j.boxY+20)+'" font-size="15" font-weight="800" fill="#7aa7ce" font-family="var(--mono)">'+b("overview.flowDiagram.returnShort")+" ---</text>"),e.push('<text id="desktop-fd-dt-label" x="'+(j.boxX+j.boxW+24)+'" y="'+(j.boxY+42)+'" font-size="12" font-weight="800" fill="'+ko+'" letter-spacing="2">'+b("overview.flowDiagram.dt")+"</text>"),e.push('<text id="desktop-fd-dt" x="'+(j.boxX+j.boxW+24)+'" y="'+(j.boxY+65)+'" class="flow-metric" font-size="22" fill="#ff8531">---</text>');for(let a=1;a<=de;a++)e.push('<path d="'+Ye(a-1,j.srcHW,j.bgDstHW)+'" fill="#021824" opacity="0.9"/>');for(let a=1;a<=de;a++)e.push('<path id="desktop-fd-path-'+a+'" class="flow-ribbon" d="'+Ye(a-1,j.srcHW,j.bgDstHW)+'" fill="url(#desktop-rg'+a+')" opacity="1"/>');e.push('<line x1="54" y1="'+r+'" x2="'+(t-54)+'" y2="'+r+'" stroke="#ff8531" stroke-width="2" opacity=".42"/>');for(let a=1;a<=de;a++){let n=j.zoneXs[a-1];e.push('<g class="flow-zone-hit">'),e.push('<line x1="'+n+'" y1="'+(r-8)+'" x2="'+n+'" y2="'+(r+8)+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="desktop-fd-zn'+a+'" x="'+n+'" y="'+(r-13)+'" text-anchor="middle" font-size="13" fill="#FFEAD2" font-weight="800" letter-spacing="1.8">Z'+a+"</text>"),e.push('<text id="desktop-fd-zf'+a+'" x="'+n+'" y="'+(r+20)+'" text-anchor="middle" font-size="9.5" fill="#AFC1CD" font-weight="700" letter-spacing=".8">---</text>'),e.push('<text id="desktop-fd-zsp'+a+'" x="'+n+'" y="'+(r+20)+'" text-anchor="middle" font-size="9" fill="'+Xe+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="desktop-fd-zt'+a+'" x="'+n+'" y="'+(r+42)+'" text-anchor="middle" class="flow-metric" font-size="15" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="desktop-fd-zv'+a+'" x="'+(n-28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C3D0D9">---%</text>'),e.push('<text id="desktop-fd-zr'+a+'" x="'+(n+28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C3D0D9">---</text>'),e.push("</g>")}return e.push("</svg>"),e.join("")}function Yr(){let e=[],t=D.w,o=D.h;e.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+t+" "+o+'" preserveAspectRatio="xMidYMid meet">'),e.push(Co("mobile")),e.push(Lo(t,o,"mobile")),e.push('<rect x="0" y="'+D.boxY+'" width="'+(D.boxX-6)+'" height="'+D.boxH+'" fill="url(#mobile-boxgrad)" rx="4"/>'),e.push(Ao("mobile"));for(let r=1;r<=de;r++)e.push('<path d="'+Ke(r-1,D.srcHW,D.bgDstHW)+'" fill="#021824" opacity="0.9"/>');for(let r=1;r<=de;r++)e.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+Ke(r-1,D.srcHW,D.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');e.push('<rect x="'+(D.boxX+9)+'" y="'+(D.boxY+D.boxH+9)+'" width="'+(D.boxW-18)+'" height="60" rx="8" fill="rgba(2,29,43,.74)"/>'),e.push('<text id="mobile-fd-ret-temp" x="'+(D.boxX+D.boxW/2)+'" y="'+(D.boxY+D.boxH+27)+'" text-anchor="middle" font-size="12.5" font-weight="800" fill="#7aa7ce" font-family="var(--mono)">'+b("overview.flowDiagram.returnShort")+" ---</text>"),e.push('<text id="mobile-fd-dt-label" x="'+(D.boxX+D.boxW/2)+'" y="'+(D.boxY+D.boxH+43)+'" text-anchor="middle" font-size="9.5" font-weight="800" fill="'+ko+'" letter-spacing="1.1">'+b("overview.flowDiagram.dt")+"</text>"),e.push('<text id="mobile-fd-dt" x="'+(D.boxX+D.boxW/2)+'" y="'+(D.boxY+D.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="#ff8531">---</text>'),e.push('<line x1="'+D.endX+'" y1="34" x2="'+D.endX+'" y2="'+(o-34)+'" stroke="#ff8531" stroke-width="2" opacity=".48"/>'),e.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="10" fill="'+wt+'" font-weight="700" letter-spacing="1.5">'+b("overview.graph.layers.temp").toUpperCase()+"</text>"),e.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="10" fill="'+wt+'" font-weight="700" letter-spacing="1.5">'+b("overview.flowDiagram.flow")+"</text>"),e.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="10" fill="'+wt+'" font-weight="700" letter-spacing="1.5">'+b("overview.flowDiagram.returnShort")+"</text>");for(let r=1;r<=de;r++){let a=D.zoneYs[r-1];e.push('<line x1="'+(D.endX-8)+'" y1="'+a+'" x2="'+(D.endX+8)+'" y2="'+a+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="mobile-fd-zn'+r+'" x="'+(D.endX-14)+'" y="'+(a+4)+'" text-anchor="end" font-size="12" fill="#FFEAD2" font-weight="800" letter-spacing="1.4">Z'+r+"</text>"),e.push('<text id="mobile-fd-zf'+r+'" x="'+D.nameX+'" y="'+(a-8)+'" text-anchor="middle" font-size="9" fill="#AFC1CD" font-weight="700" letter-spacing=".7">---</text>'),e.push('<text id="mobile-fd-zsp'+r+'" x="'+D.nameX+'" y="'+(a+7)+'" text-anchor="middle" font-size="8.5" fill="'+Xe+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#C3D0D9">---%</text>'),e.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#C3D0D9">---</text>')}return e.push("</svg>"),e.join("")}var Kr=()=>'<div class="flow-wrap">'+Xr()+Yr()+"</div>";T({tag:"flow-diagram",render:Kr,onMount(e,t){let o=["desktop","mobile"],r={};o.forEach(m=>{r[m]={flowEl:t.querySelector("#"+m+"-fd-flow-temp"),flowLabelEl:t.querySelector("#"+m+"-fd-flow-label"),retEl:t.querySelector("#"+m+"-fd-ret-temp"),dtLabelEl:t.querySelector("#"+m+"-fd-dt-label"),dtEl:t.querySelector("#"+m+"-fd-dt"),zones:new Array(de+1)};for(let g=1;g<=de;g++)r[m].zones[g]={textTemp:t.querySelector("#"+m+"-fd-zt"+g),textSetpoint:t.querySelector("#"+m+"-fd-zsp"+g),textFlow:t.querySelector("#"+m+"-fd-zv"+g),textRet:t.querySelector("#"+m+"-fd-zr"+g),label:t.querySelector("#"+m+"-fd-zn"+g),friendly:t.querySelector("#"+m+"-fd-zf"+g),path:t.querySelector("#"+m+"-fd-path-"+g)}});function a(m,g){m&&(m.textContent=g)}function n(m,g,z,h,c){let u=r[m];a(u.flowLabelEl,b("overview.flowDiagram.flow")),a(u.flowEl,ne(g)),a(u.retEl,b("overview.flowDiagram.returnShort")+" "+ne(z)),a(u.dtLabelEl,b("overview.flowDiagram.dt")),a(u.dtEl,h==null?"---":h.toFixed(1)+"\xB0C"),u.dtEl&&u.dtEl.setAttribute("fill",c)}function i(){a(t.querySelector("#mobile-fd-temp-head"),b("overview.graph.layers.temp").toUpperCase()),a(t.querySelector("#mobile-fd-flow-head"),b("overview.flowDiagram.flow")),a(t.querySelector("#mobile-fd-ret-head"),b("overview.flowDiagram.returnShort"))}function d(m,g,z){let h=r[m].zones[g];if(!h)return;let{enabled:c,pct:u,temp:y,setpoint:l,valve:S,returnTemp:A,hasReturn:_}=z,x=$r(g,m==="desktop"?11:12),C=ne(y),M=l!=null?ne(l):"";a(h.label,"Z"+g),a(h.friendly,m==="desktop"?(x||"---")+(M?" ("+M+")":""):x||"---"),a(h.textTemp,C),a(h.textSetpoint,m==="desktop"?"":M?"("+M+")":""),a(h.textFlow,Ie(S)),a(h.textRet,_?ne(A):"---"),h.label.setAttribute("fill",c?Br:Wr),h.friendly.setAttribute("fill",c?zo:Xe),h.textSetpoint.setAttribute("fill",c?zo:Xe),h.textFlow.setAttribute("fill",Ur(u,c)),h.textRet.setAttribute("fill",_&&c?Ir:_o);let W=h.path;if(!c)W.setAttribute("d",m==="desktop"?Ye(g-1,1,2):Ke(g-1,1,2)),W.setAttribute("fill","#021824"),W.setAttribute("opacity","0.38");else{let H=m==="desktop"?j:D,E=Math.max(2.5,u*H.bgDstHW),Z=Math.max(1.3,u*H.srcHW);W.setAttribute("d",m==="desktop"?Ye(g-1,Z,E):Ke(g-1,Z,E)),W.setAttribute("fill","url(#"+m+"-rg"+g+")"),W.setAttribute("opacity","1")}}function f(){let m=L(s.flow),g=L(s.ret),z=m!=null&&g!=null?Number(m)-Number(g):null,h=z==null||z<3?So:z>8?jr:Zr;o.forEach(c=>n(c,m,g,z,h));for(let c=1;c<=de;c++){let u=L(p.temp(c)),y=L(p.setpoint(c)),l=L(p.valve(c)),S=Y(p.enabled(c)),A=String(N(p.tempSource(c))||"Local Probe"),_=Gr(N(p.probe(c))||""),x=_?L(p.probeTemp(_)):null,C=A!=="Local Probe"&&x!=null&&!Number.isNaN(Number(x)),M=l!=null?Math.max(0,Math.min(100,Number(l)))/100:0,W={enabled:S,pct:M,temp:u,setpoint:y,valve:l,returnTemp:x,hasReturn:C};o.forEach(H=>d(H,c,W))}}w(s.flow,f),w(s.ret,f),B("zoneNames",f);for(let m=1;m<=de;m++)w(p.temp(m),f),w(p.setpoint(m),f),w(p.valve(m),f),w(p.enabled(m),f),w(p.probe(m),f),w(p.tempSource(m),f);for(let m=1;m<=8;m++)w(p.probeTemp(m),f);i(),f()}});var Jr={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},Qr=`
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
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
  background: var(--control-bg);
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
  border-radius: 10px;
  background: rgba(8,18,34,.55);
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
`;F("logs-view",Qr);var en=()=>`
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
`;function tn(e){let t=Jr[e.level]||{label:"?",color:"var(--text-secondary)"},o=Mo(e.tag||""),r=Mo(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function Mo(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var Ls=T({tag:"logs-view",render:en,onMount(e,t){let o=t.querySelector(".logs-stream"),r=t.querySelector(".pause-btn"),a=t.querySelector(".clear-btn"),n=!1;function i(){if(n)return;let d=Mt();if(!d||!d.length){o.innerHTML='<div class="logs-empty">'+b("logs.waiting")+"</div>";return}let f=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=d.map(tn).join(""),f&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{n=!n,r.textContent=n?b("logs.resume"):b("logs.pause"),r.classList.toggle("on",n),n||i()}),a.addEventListener("click",()=>{Et()}),B("deviceLog",i),k(t),i()}});var on=`
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
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
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.btn-row { margin-top: 12px; }
.btn { padding: 7px 14px; border-radius: 10px; border: 1px solid var(--control-border); background: var(--control-bg); color: var(--text-strong); font-weight: 700; cursor: pointer; }
.btn:hover { background: var(--control-bg-hover); border-color: rgba(255,133,49,.5); color: #ffe7b9; }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;F("diag-i2c",on);var rn=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,Ds=T({tag:"diag-i2c",render:rn,onMount(e,t){let o=t.querySelector("#i2c-result");function r(){o.textContent=O("i2cResult")||b("diagnostics.i2c.empty")}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Ot()}),B("i2cResult",r),k(t),r()}});var nn=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--danger-border-soft);
  background: var(--danger-bg);
  border-radius: 12px;
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
`;F("diag-manual-badge",nn);var an=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Is=T({tag:"diag-manual-badge",render:an,onMount(e,t){let o=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function r(){let a=!!O("manualMode");o&&o.classList.toggle("on",a)}B("manualMode",r),k(t),r()}});var sn=`
.diag-zone-motor {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
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
  background: var(--control-bg);
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
  background: var(--control-bg);
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
`;F("diag-zone-motor",sn);var ln=e=>{let t=e.zone||O("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">"+b("common.zone")+" "+r+"</option>";return`
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
  `},Us=T({tag:"diag-zone-motor-card",render:ln,onMount(e,t){let o=Number(e.zone||O("selectedZone")||1),r=!!O("manualMode"),a=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),f=t.querySelector(".motor-open-btn"),m=t.querySelector(".motor-close-btn"),g=t.querySelector(".motor-stop-btn"),z=()=>{let y=i.value||String(o),l="";for(let S=1;S<=6;S++)l+='<option value="'+S+'">'+b("common.zone")+" "+S+"</option>";i.innerHTML=l,i.value=y};function h(y){r=!!y,a&&(a.classList.toggle("on",r),a.setAttribute("aria-checked",r?"true":"false")),n&&n.classList.toggle("locked",!r),[i,d,f,m,g].forEach(l=>{l&&(l.disabled=!r)})}function c(){let y=!r;if(h(y),y){lt(!0);for(let l=1;l<=6;l++)it(l)}else lt(!1)}function u(){let y=L(p.motorTarget(o));d&&y!=null?d.value=Number(y).toFixed(0):d&&(d.value="0")}i==null||i.addEventListener("change",()=>{o=Number(i.value||1),u()}),a==null||a.addEventListener("click",c),a==null||a.addEventListener("keydown",y=>{y.key!==" "&&y.key!=="Enter"||(y.preventDefault(),c())});for(let y=1;y<=6;y++)w(p.motorTarget(y),u);u(),h(r),B("manualMode",()=>{h(!!O("manualMode"))}),k(t),d==null||d.addEventListener("change",y=>{if(!r)return;let l=y.target.value;It(o,l)}),f==null||f.addEventListener("click",()=>{r&&Bt(o,1e4)}),m==null||m.addEventListener("click",()=>{r&&Wt(o,1e4)}),g==null||g.addEventListener("click",()=>{r&&it(o)})}});var dn=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
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
  background: var(--control-bg);
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
`;F("diag-zone-recovery",dn);var cn=()=>`
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
  `,ti=T({tag:"diag-zone-recovery-card",render:cn,onMount(e,t){let o=Number(O("selectedZone")||1),r=t.querySelector(".recovery-fault-btn"),a=t.querySelector(".recovery-factors-btn"),n=t.querySelector(".recovery-relearn-btn"),i=t.querySelector(".recovery-status");B("selectedZone",()=>{o=Number(O("selectedZone")||1)});let d=null;function f(g,z){i.textContent=g,i.className="recovery-status show "+(z?"ok":"err"),clearTimeout(d),d=setTimeout(()=>{i.classList.remove("show")},4e3)}function m(g,z){let h=g(o);f(z,!0),h&&typeof h.then=="function"&&h.then(c=>{c&&c.ok===!1&&f(b("diagnostics.recovery.rejected"),!1)}).catch(()=>f(b("diagnostics.recovery.unreachable"),!1))}r==null||r.addEventListener("click",()=>{m(Zt,"\u2713 "+b("diagnostics.recovery.faultSent",{zone:$(o)}))}),a==null||a.addEventListener("click",()=>{confirm(b("diagnostics.recovery.confirmFactors",{zone:$(o)}))&&m(jt,"\u2713 "+b("diagnostics.recovery.factorsReset",{zone:$(o)}))}),n==null||n.addEventListener("click",()=>{confirm(b("diagnostics.recovery.confirmRelearn",{zone:$(o)}))&&m(Vt,"\u2713 "+b("diagnostics.recovery.relearnStarted",{zone:$(o)}))}),k(t)}});var pn=`
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
`;F("diag-system-card",pn);var un=()=>`
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
`,di=T({tag:"diag-system-card",render:un,onMount(e,t){let o=t.querySelector('[data-k="cpu0"]'),r=t.querySelector('[data-k="cpu1"]'),a=t.querySelector('[data-k="heap"]'),n=t.querySelector('[data-k="psram"]'),i=t.querySelector('[data-bar="cpu0"]'),d=t.querySelector('[data-bar="cpu1"]'),f=(z,h,c)=>{if(c==null||!Number.isFinite(Number(c))){z.textContent="\u2014",z.classList.remove("warn"),h.style.width="0%";return}let u=Math.max(0,Math.min(100,Number(c)));z.textContent=u.toFixed(0)+"%",z.classList.toggle("warn",u>=90),h.style.width=u+"%",h.style.backgroundPosition=u+"% 0"},m=(z,h,c)=>{if(h==null||!Number.isFinite(Number(h))){z.textContent="\u2014";return}let u=Number(h);z.textContent=u+" KB",z.classList.toggle("warn",c!=null&&u<c)},g=()=>{f(o,i,L(s.cpuLoadCore0)),f(r,d,L(s.cpuLoadCore1)),m(a,L(s.freeInternalKb),48),m(n,L(s.freePsramKb),null)};t.querySelector(".sys-dump").addEventListener("click",()=>{$t().catch(z=>console.error("[System] dump failed:",z))}),w(s.cpuLoadCore0,g),w(s.cpuLoadCore1,g),w(s.freeInternalKb,g),w(s.freePsramKb,g),k(t),g()}});var mn=`
.asgard-bridge-status-card .bridge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.asgard-bridge-status-card .role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.asgard-bridge-status-card .role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}
.asgard-bridge-status-card .role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}
.asgard-bridge-status-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
  margin-bottom: 12px;
}
.asgard-bridge-status-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
  font-family: var(--mono);
}
.asgard-bridge-status-card .status-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 6px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
}
.asgard-bridge-status-card .status-grid .val {
  color: var(--text);
  font-weight: 600;
  min-width: 0;
}
.asgard-bridge-status-card .status-grid .val.warn { color: #FFE9A0; }
`;F("asgard-bridge-status-card",mn);var gn=()=>`
  <div class="ui-card asgard-bridge-status-card">
    <div class="bridge-head">
      <div class="ui-card-title" data-i18n="diagnostics.asgard.title">Bridge Status</div>
      <span class="role-badge slave">slave</span>
    </div>
    <div class="setpoint-box">
      <span class="setpoint-val ab-setpoint">\u2014</span>
      <span class="ui-note" data-i18n="diagnostics.asgard.setpointNote">Recommended virtual thermostat setpoint, derived from enabled zone targets.</span>
    </div>
    <div class="status-grid">
      <span data-i18n="diagnostics.asgard.peer">Peer</span><span class="val ab-peer">n/a</span>
      <span data-i18n="diagnostics.asgard.lastPush">Last push</span><span class="val ab-push">\u2014</span>
      <span data-i18n="diagnostics.asgard.zonesWeighted">Zones weighted</span><span class="val ab-zones">\u2014</span>
      <span data-i18n="diagnostics.asgard.lastError">Last error</span><span class="val ab-error">\u2014</span>
    </div>
  </div>
`,bi=T({tag:"asgard-bridge-status-card",render:gn,onMount(e,t){let o=t.querySelector(".role-badge"),r=t.querySelector(".ab-peer"),a=t.querySelector(".ab-push"),n=t.querySelector(".ab-setpoint"),i=t.querySelector(".ab-zones"),d=t.querySelector(".ab-error");function f(){let m=N(s.asgardRole)||"slave";o.textContent=m,o.className="role-badge "+(m==="master"?"master":"slave");let g=N(s.asgardPeerStatus)||b("common.na");r.textContent=g,r.classList.toggle("warn",g==="stale"||g==="unreachable");let z=L(s.asgardLastPushC),h=L(s.asgardLastPushAgeS);if(z!=null&&Number.isFinite(z)&&h!=null){let S=h<120?b("diagnostics.asgard.ageSeconds",{value:Math.round(h)}):b("diagnostics.asgard.ageMinutes",{value:Math.round(h/60)});a.textContent=`${z.toFixed(2)}\xB0C (${S})`}else a.textContent="\u2014";let c=L(s.asgardSetpointC);n.textContent=c!=null&&Number.isFinite(c)?`${c.toFixed(1)}\xB0C`:"\u2014";let u=L(s.asgardLocalZones),y=L(s.asgardPeerZones);i.textContent=u!=null?`${u} ${b("common.local")} + ${y||0} ${b("common.peer")}`:"\u2014";let l=N(s.asgardLastError);d.textContent=l||"\u2014",d.classList.toggle("warn",!!l)}[s.asgardRole,s.asgardPeerStatus,s.asgardLastPushC,s.asgardSetpointC,s.asgardLastPushAgeS,s.asgardLocalZones,s.asgardPeerZones,s.asgardLastError].forEach(m=>w(m,f)),k(t),f()}});var fn=`
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
  font-size: .64rem;
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
`;F("settings-manifold-card",fn);var bn=()=>{let e="";for(let o=1;o<=8;o++)e+="<option>Probe "+o+"</option>";let t="";for(let o=1;o<=8;o++)t+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${pe("settings.manifold.help")}</span></div>
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
  `},Ci=T({tag:"settings-manifold-card",render:bn,onMount(e,t){let o=t.querySelector(".sm-type"),r=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret"),n=re(t);n.select(o,{read:()=>N(s.manifoldType)||"NO (Normally Open)",commit:d=>ae("manifold_type",d)}),n.select(r,{read:()=>N(s.manifoldFlowProbe)||"Probe 7",commit:d=>ae("manifold_flow_probe",d)}),n.select(a,{read:()=>N(s.manifoldReturnProbe)||"Probe 8",commit:d=>ae("manifold_return_probe",d)});function i(){for(let d=1;d<=8;d++){let f=t.querySelector('[data-probe="'+d+'"]');f&&(f.textContent=ne(L(p.probeTemp(d))))}}w(s.manifoldType,n.refresh),w(s.manifoldFlowProbe,n.refresh),w(s.manifoldReturnProbe,n.refresh);for(let d=1;d<=8;d++)w(p.probeTemp(d),i);k(t),n.refresh(),i()}});var vn=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.minFlow.title">Minimum Zone Flow</span>${pe("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.minFlow.enabledSub">manual floor for a modulating heat source, independent of the bridge</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Min valve opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">floor held on every enabled zone while active</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="50" step="1" placeholder="15" /></span>
    </div>
  </div>
`,Di=T({tag:"settings-minimum-flow-card",render:vn,onMount(e,t){let o=t.querySelector(".smf-always"),r=t.querySelector(".smf-pct"),a=re(t);a.toggle(o,{read:()=>Y(s.minimumFlowAlways),commit:n=>{let i=n?"on":"off";v(s.minimumFlowAlways,{state:i}),ae("minimum_flow_always",i).catch(()=>v(s.minimumFlowAlways,{state:n?"off":"on"}))}}),a.num(r,{read:()=>L(s.minZoneFlowPct),commit:n=>{v(s.minZoneFlowPct,{value:n}),se("min_zone_flow_pct",n)}}),w(s.minimumFlowAlways,a.refresh),w(s.minZoneFlowPct,a.refresh),k(t),a.refresh()}});var hn=`
.settings-control-stack {
  display: grid;
  gap: 14px;
}

.settings-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
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
  border-radius: 12px;
  background: var(--control-bg);
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
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
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
  border-radius: 999px;
  transition: transform .2s ease;
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
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: .18s ease;
}

.settings-card .btn:hover {
  background: var(--control-bg-hover);
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
`;F("settings-control-card",hn);var xn=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title" data-i18n="settings.control.title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,Ii=T({tag:"settings-control-card",render:xn,onMount(e,t){k(t),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ue("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ue("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ue("restart")})}});var yn=`
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border: 1px solid rgba(255,133,49,.35);
  background: rgba(255,133,49,.12);
  border-radius: 10px;
  padding: 8px 10px;
  margin: 10px 0 2px;
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
`;F("settings-motor-calibration-card",yn);var Je=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:s.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:s.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:s.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:s.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:s.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:s.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:s.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:s.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:s.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:s.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:s.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:s.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],wn=()=>{let e="";for(let t=0;t<Je.length;t++){let o=Je[t];if(o.key==="generic_runtime_limit_seconds")continue;let r=zn(o.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+b(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${pe("settings.motor.help")}</span></div>
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
  `};function zn(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var Xi=T({tag:"settings-motor-calibration-card",render:wn,onMount(e,t){let o=t.querySelector(".smc-profile"),r=t.querySelector(".smc-safe-runtime"),a=t.querySelector(".mc-drivers-toggle"),n=re(t);function i(f){if(f==="HmIP VdMot"&&se("hmip_runtime_limit_seconds",40),f==="Generic"){let m=Number(L(s.genericRuntimeLimitSeconds));(!Number.isFinite(m)||m<=0)&&se("generic_runtime_limit_seconds",45)}}n.toggle(a,{read:()=>Y(s.drivers),commit:f=>Rt(f)}),n.select(o,{read:()=>N(s.motorProfileDefault)||"HmIP VdMot",commit:f=>{ae("motor_profile_default",f),i(f)}});function d(){let f=N(s.motorProfileDefault)||"HmIP VdMot";r.disabled=f==="HmIP VdMot"}n.num(r,{read:()=>(N(s.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:L(s.genericRuntimeLimitSeconds),commit:f=>{o.value==="Generic"&&se("generic_runtime_limit_seconds",f)}});for(let f=0;f<Je.length;f++){let m=Je[f];if(m.key==="generic_runtime_limit_seconds")continue;let g=t.querySelector(".smc-"+m.cls);g&&(n.num(g,{read:()=>L(m.id),commit:z=>se(m.key,z)}),w(m.id,n.refresh))}w(s.drivers,n.refresh),w(s.motorProfileDefault,()=>{n.refresh(),d()}),w(s.genericRuntimeLimitSeconds,n.refresh),w(s.hmipRuntimeLimitSeconds,n.refresh),k(t),i(N(s.motorProfileDefault)||"HmIP VdMot"),n.refresh(),d()}});var Sn=`
.settings-asgard-card .ui-row:last-child { margin-bottom: 0; }
`;F("settings-asgard-card",Sn);var _n=()=>`
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text"><span data-i18n="settings.asgard.title">Modulating Heat Source</span>${pe("settings.asgard.help")}</span>
    </div>

    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.asgard.bridgeEnabled">Bridge enabled</span> <span class="ui-sublabel" data-i18n="settings.asgard.bridgeSub">send weighted house temperature to the heat-source controller</span></span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" data-i18n-label="settings.asgard.bridgeEnabled" aria-label="Toggle heat-source bridge"></div></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.asgard.coordinator">Coordinator</span> <span class="ui-sublabel" data-i18n="settings.asgard.coordinatorSub">pushes to the heat source</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" data-i18n-label="settings.asgard.coordinator" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.endpoint">Heat Source Endpoint</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.host">Host</span>
        <span class="ui-field"><input class="ui-input wide sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.port">Port</span>
        <span class="ui-field"><input class="ui-input sa-port" type="number" min="1" max="65535" step="1" placeholder="80" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.asgard.entity">Number entity</span> <span class="ui-sublabel" data-i18n="settings.asgard.entitySub">REST object_id for the weighted house temp</span></span>
        <span class="ui-field"><input class="ui-input wide sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" /></span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.peerBoard">Peer board</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.peerHost">Peer host</span>
        <span class="ui-field"><input class="ui-input wide sa-peer" type="text" placeholder="empty = single board" data-i18n-placeholder="settings.asgard.peerPlaceholder" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.pushInterval">Push interval (s)</span>
        <span class="ui-field"><input class="ui-input sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" /></span>
      </div>
    </div>
  </div>
`,nl=T({tag:"settings-asgard-card",render:_n,onMount(e,t){let o=t.querySelector(".sa-enable"),r=t.querySelector(".sa-coord"),a=t.querySelector(".sa-host"),n=t.querySelector(".sa-port"),i=t.querySelector(".sa-entity"),d=t.querySelector(".sa-peer"),f=t.querySelector(".sa-interval"),m=t.querySelector(".sa-body"),g=re(t);function z(y,l,S){return A=>{let _=A?"on":"off";v(y,{state:_}),ae(l,_).catch(x=>{console.error(`[Asgard] Failed to update ${S}:`,x),v(y,{state:A?"off":"on"})})}}let h=y=>m.classList.toggle("is-disabled",!y);g.toggle(o,{read:()=>Y(s.asgardEnabled),commit:z(s.asgardEnabled,"asgard_enabled","enabled"),onChange:h}),g.toggle(r,{read:()=>Y(s.asgardCoordinator),commit:z(s.asgardCoordinator,"asgard_coordinator","coordinator")});function c(y,l){return S=>{v(y,{state:S}),Ht(l,S).catch(A=>console.error(`[Asgard] Failed to update ${l}:`,A))}}g.text(a,{read:()=>N(s.asgardHost),commit:c(s.asgardHost,"asgard_host")}),g.text(i,{read:()=>N(s.asgardEntityName),commit:c(s.asgardEntityName,"asgard_entity_name")}),g.text(d,{read:()=>N(s.asgardPeerHost),commit:c(s.asgardPeerHost,"asgard_peer_host")});function u(y,l){return S=>{v(y,{value:S}),se(l,S).catch(A=>console.error(`[Asgard] Failed to update ${l}:`,A))}}g.num(n,{read:()=>L(s.asgardPort),commit:u(s.asgardPort,"asgard_port")}),g.num(f,{read:()=>L(s.asgardPushIntervalS),commit:u(s.asgardPushIntervalS,"asgard_push_interval_s")}),w(s.asgardEnabled,g.refresh),w(s.asgardCoordinator,g.refresh),w(s.asgardHost,g.refresh),w(s.asgardEntityName,g.refresh),w(s.asgardPeerHost,g.refresh),w(s.asgardPort,g.refresh),w(s.asgardPushIntervalS,g.refresh),k(t),g.refresh()}});var kn=`
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
`;F("smart-preheat-card",kn);var Cn=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${pe("settings.preheat.help")}</span></div>
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
`,ml=T({tag:"smart-preheat-card",render:Cn,onMount(e,t){let o=t.querySelector(".absorb-toggle"),r=t.querySelector(".absorb-badge"),a=t.querySelector(".absorb-band"),n=t.querySelector(".absorb-delta"),i=t.querySelector(".absorb-body"),d=re(t),f=g=>{i&&i.classList.toggle("is-disabled",!g)};d.toggle(o,{read:()=>Y(s.preheatAbsorbEnabled),onChange:f,commit:g=>{let z=g?"on":"off";v(s.preheatAbsorbEnabled,{state:z}),ae("preheat_absorb_enabled",z)}}),d.num(a,{read:()=>L(s.preheatAbsorbBandC),commit:g=>{v(s.preheatAbsorbBandC,{value:g}),se("preheat_absorb_band_c",g)}}),d.num(n,{read:()=>L(s.preheatDetectDeltaC),commit:g=>{v(s.preheatDetectDeltaC,{value:g}),se("preheat_detect_delta_c",g)}});function m(){let g=String(N(s.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=g?b("common.active"):b("common.idle"),r.classList.toggle("active",g)}w(s.preheatAbsorbEnabled,d.refresh),w(s.preheatAbsorbing,m),w(s.preheatAbsorbBandC,d.refresh),w(s.preheatDetectDeltaC,d.refresh),k(t),d.refresh(),m()}});var Ln=`
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
  --accent: #ff8531;          /* orange \u2014 primary accent */
  --blue: #7aa7ce;            /* muted cool blue \u2014 secondary / return / wind accent */
  /* Chart data series \u2014 orange (warm) + muted blue (cool). */
  --series-warm: #ff8531;
  --series-cool: #7aa7ce;
  --series-cool-fill: rgba(122,167,206,.14);
  --series-solar: #ffc14d;    /* gold \u2014 solar irradiance / current-hour highlight */
  /* Axis/tick label color \u2014 warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(233,222,210,.82);
  --bg: #00131d;
  --surface: #002f45;
  --card: #021d2b;
  --border: rgba(120,146,200,.22);
  --text: #FFFFFF;
  --text-strong: #FFF4E6;
  --text-secondary: rgba(255,239,224,.84);
  --muted: rgba(247,233,221,.74);
  --text-faint: rgba(229,216,222,.56);
  --text-on-accent: #00202e;
  --overlay-bg: rgba(0,19,29,.96);
  --overlay-bg-soft: rgba(0,19,29,.72);
  --soft: rgba(124,155,208,.12);
  --panel-border: rgba(120,146,200,.28);
  --panel-border-soft: rgba(120,146,200,.18);
  --divider: rgba(255,255,255,.07);
  --divider-dashed: rgba(120,146,200,.28);
  --panel-bg: rgba(0,47,69,.34);
  --panel-bg-vibrant: var(--panel-bg);
  --panel-bg-flat: var(--panel-bg);
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 12px 30px rgba(0,0,0,.32);
  --panel-shadow-soft: var(--panel-shadow);
  --state-ok: #79d17e;
  --state-warn: #ffa600;
  --state-danger: #ff6361;
  --state-disabled: #6E7E96;
  --control-bg: rgba(124,155,208,.10);
  --control-bg-hover: rgba(124,155,208,.16);
  --control-border: rgba(120,146,200,.30);
  --control-border-strong: rgba(120,146,200,.45);
  --control-border-hover: rgba(120,146,200,.52);
  --control-knob: #efe6dd;
  --focus-ring: rgba(124,155,208,.72);
  --focus-ring-soft: rgba(124,155,208,.60);
  --focus-border: rgba(124,155,208,.55);
  --accent-bg-soft: rgba(255,133,49,.12);
  --accent-border: rgba(255,133,49,.35);
  --accent-border-hover: rgba(255,133,49,.50);
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
  --green: #79d17e;
  --red: #ff6361;
  --font-ui: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 13px; scroll-behavior: smooth; }
body {
  font-family: var(--font-ui);
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(255,133,49,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(122,167,206,.10), transparent 64%),
    var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.app {
  display: block;
  min-height: 100vh;
}

.shell {
  padding: 18px;
  width: min(1320px, 100%);
  margin: 0 auto;
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

.settings-group,
.diagnostics-group {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
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
  font-size: .86rem;
  font-weight: 800;
  letter-spacing: 1.05px;
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

.settings-heat-source-grid {
  grid-template-columns: 1fr;
}

.settings-motor-grid {
  grid-template-columns: 1fr;
}

.settings-heat-source-stack,
.manual-control-col {
  display: grid;
  gap: 12px;
}

.settings-group .ui-card,
.settings-group .settings-card {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.settings-group-grid > * + *,
.settings-group .ui-card + .ui-card,
.settings-group .settings-card + .settings-card,
.settings-heat-source-stack > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.settings-group .ui-card-title,
.settings-group .settings-card .card-title {
  color: var(--muted);
  font-size: .68rem;
  letter-spacing: .82px;
  margin-bottom: 2px;
  padding-bottom: 4px;
  border-bottom: 0;
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
  font-size: .72rem;
  letter-spacing: 1px;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom-color: var(--panel-border-soft);
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.placeholder-card h3 {
  font-size: .84rem;
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
`;F("app-root",Ln);var An=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
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
          <div class="settings-group settings-heat-source-group">
            <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.heatSource">Heat Source</span></div>
            <div class="settings-group-grid settings-heat-source-grid">
              <div class="settings-asgard-slot"></div>
              <div class="settings-heat-source-stack">
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
    </main>
  </div>
`;T({tag:"app-root",render:An,onMount(e,t){t.querySelector(".hdr").appendChild(V("hv6-header")),t.querySelector(".overview-flow").appendChild(V("flow-diagram")),t.querySelector(".overview-timeline").appendChild(V("zone-state-timeline")),t.querySelector(".overview-flow-return").appendChild(V("graph-widgets",{variant:"flow-return"})),t.querySelector(".zone-selector").appendChild(V("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(V("zone-detail",{zone:O("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(V("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(V("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(V("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(V("settings-manifold-card")),t.querySelector(".settings-asgard-slot").appendChild(V("settings-asgard-card")),t.querySelector(".settings-min-flow-slot").appendChild(V("settings-minimum-flow-card")),t.querySelector(".settings-preheat-slot").appendChild(V("smart-preheat-card")),t.querySelector(".settings-motor-cal-slot").appendChild(V("settings-motor-calibration-card")),t.querySelector(".logs-main-col").appendChild(V("logs-view"));let r=t.querySelector(".manual-control-col");r.appendChild(V("diag-manual-badge")),r.appendChild(V("diag-zone-motor-card",{zone:O("selectedZone")||1}));let a=t.querySelector(".diag-health-grid");a.appendChild(V("connectivity-card")),a.appendChild(V("asgard-bridge-status-card")),a.appendChild(V("diag-system-card")),a.appendChild(V("diag-i2c")),t.querySelector(".diag-actions-grid").appendChild(V("settings-control-card"));let i=t.querySelectorAll(".sec");function d(){let f=O("section");i.forEach(m=>{m.classList.toggle("active",m.getAttribute("data-section")===f)})}B("section",d),k(t),d()}});function Mn(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(V("app-root")),mt()}Mn();})();
