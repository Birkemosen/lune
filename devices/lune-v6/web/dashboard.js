(()=>{var kt={},Re={};function R(t){return kt[t.tag]=t,t}function B(t,e){let o=kt[t];if(!o)throw new Error("Component not found: "+t);let r=e||{};if(o.state){let s=o.state(e||{});for(let l in s)r[l]=s[l]}if(o.methods)for(let s in o.methods)r[s]=o.methods[s];let n=document.createElement("div");n.innerHTML=o.render(r);let a=n.firstElementChild;return o.onMount&&o.onMount(r,a),a}function w(t,e){(Re[t]||(Re[t]=[])).push(e)}function Y(t){let e=Re[t];if(e)for(let o=0;o<e.length;o++)e[o](t)}var J=6,Ho=28,Pe=Object.create(null),qo=Zo(),I={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:$o(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:qo,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},Io=300;function $o(){let t=Object.create(null);for(let e=1;e<=J;e++)t[e]=[];return t}function Zo(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<J;)t.push("");return t.slice(0,J)}function Bo(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(I.zoneNames))}catch(t){}}function ee(t){return"$dashboard:"+t}function ot(t){return Math.max(1,Math.min(J,Number(t)||1))}function St(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let o=t.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function L(t){let e=Pe[t];return e?e.v!=null?e.v:e.value!=null?e.value:St(e.s!=null?e.s:e.state):null}function C(t){let e=Pe[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function Vo(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function X(t){return Vo(C(t))}function f(t,e){let o=Pe[t];o||(o=Pe[t]={v:null,s:null}),"v"in e&&(o.v=e.v,o.value=e.v),"value"in e&&(o.v=e.value,o.value=e.value),"s"in e&&(o.s=e.s,o.state=e.s),"state"in e&&(o.s=e.state,o.state=e.state);for(let r in e)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=e[r]);if(Y(t),t==="text_sensor-firmware_version"&&we("firmwareVersion",C(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let r=parseInt(t.slice(10,-5),10);if(r>=1&&r<=J){let n=C(t)||"";I.zoneNames[r-1]!==n&&(I.zoneNames[r-1]=n,Bo(),Y(ee("zoneNames")))}}}function $(t,e){w(ee(t),e)}function F(t){return I[t]}function we(t,e){I[t]=e,Y(ee(t))}function ve(t){let e=t==="logs"?"diagnostics":t;I.section!==e&&(I.section=e,Y(ee("section")))}function Ae(t){let e=ot(t);I.selectedZone!==e&&(I.selectedZone=e,Y(ee("selectedZone")))}function pe(t){let e=!!t;I.live!==e&&(I.live=e,Y(ee("live")))}function _t(){I.pendingWrites+=1,Y(ee("pendingWrites"))}function rt(){I.pendingWrites=Math.max(0,I.pendingWrites-1),I.lastWriteAt=Date.now(),Y(ee("pendingWrites"))}function Lt(){return I.pendingWrites>0?!0:Date.now()-I.lastWriteAt<2e3}function ue(t){return I.zoneNames[ot(t)-1]||""}function re(t){let e=ot(t),o=ue(e);return o?"Zone "+e+" \xB7 "+o:"Zone "+e}function ze(t){I.i2cResult=t||"No scan has been run yet.",Y(ee("i2cResult"))}function H(t,e){let o={time:jo(),msg:String(t||"")};for(I.activityLog.push(o);I.activityLog.length>60;)I.activityLog.shift();if(e>=1&&e<=J){let r=I.zoneLog[e];for(r.push(o);r.length>8;)r.shift();Y(ee("zoneLog:"+e))}Y(ee("activityLog"))}function tt(t,e){let o=I[t];if(!Array.isArray(o))return;let r=St(e);if(r!=null){for(o.push(r);o.length>Ho;)o.shift();Y(ee(t))}}function Te(t){let e=Date.now();if(!t&&e-I.lastHistoryAt<3200)return;I.lastHistoryAt=e;let o=0,r=0;for(let n=1;n<=J;n++){let a=L("sensor-zone_"+n+"_valve_pct");a!=null&&(o+=a,r+=1)}tt("historyFlow",L("sensor-manifold_flow_temperature")),tt("historyReturn",L("sensor-manifold_return_temperature")),tt("historyDemand",r?o/r:0)}function jo(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function Oe(t){I.zoneStateHistory=t||null,Y(ee("zoneStateHistory"))}function Ct(){return I.deviceLogSeq}function He(t,e){if(Array.isArray(t)&&t.length){for(let o of t)I.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>I.deviceLogSeq&&(I.deviceLogSeq=o[0]);for(;I.deviceLog.length>Io;)I.deviceLog.shift();Y(ee("deviceLog"))}typeof e=="number"&&e>I.deviceLogSeq&&(I.deviceLogSeq=e-1)}function Mt(){return I.deviceLog}function At(){I.deviceLog=[],Y(ee("deviceLog"))}var c={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var G=6,Wo=8,Tt=null,ke=0,qe=1,Ft=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],P={temp:new Float32Array(G),setpoint:new Float32Array(G),valve:new Float32Array(G),enabled:new Uint8Array(G),driversEnabled:1,fault:0,manualMode:0};function Uo(){P.manualMode=0,we("manualMode",!1);for(let a=0;a<G;a++){P.temp[a]=20.5+a*.4,P.setpoint[a]=21+a%3*.5,P.valve[a]=12+a*8,P.enabled[a]=a===4?0:1;let s=a+1;f(c.temp(s),{value:P.temp[a]}),f(c.setpoint(s),{value:P.setpoint[a]}),f(c.baseSetpoint(s),{value:P.setpoint[a]}),f(c.effectiveSetpoint(s),{value:P.setpoint[a]}),f(c.coordinatorOffset(s),{value:0}),f(c.coordinatorRemaining(s),{value:0}),f(c.valve(s),{value:P.valve[a]}),f(c.state(s),{state:P.valve[a]>5?"heating":"idle"}),f(c.enabled(s),{value:!!P.enabled[a],state:P.enabled[a]?"on":"off"}),f(c.probe(s),{state:"Probe "+s}),f(c.tempSource(s),{state:s%2?"Local Probe":"BLE"}),f(c.syncTo(s),{state:"None"}),f(c.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),f(c.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][a]||""}),f(c.preheatAdvance(s),{value:.08+a*.03})}for(let a=1;a<=Wo;a++){let s=a<=G?a:G,l=P.temp[s-1]+(a>G?1:.1*a);f(c.probeTemp(a),{value:l})}f(i.flow,{value:34.1}),f(i.ret,{value:30.4}),f(i.uptime,{value:18*3600+720}),f(i.wifi,{value:-57}),f(i.drivers,{value:!0,state:"on"}),f(i.fault,{value:!1,state:"off"}),f(i.ip,{state:"192.168.1.86"}),f(i.ssid,{state:"MockLab"}),f(i.mac,{state:"D8:3B:DA:12:34:56"}),f(i.firmware,{state:"0.5.x-mock"}),f(i.manifoldFlowProbe,{state:"Probe 7"}),f(i.manifoldReturnProbe,{state:"Probe 8"}),f(i.manifoldType,{state:"NC (Normally Closed)"}),f(i.motorProfileDefault,{state:"HmIP VdMot"}),f(i.closeThresholdMultiplier,{value:1.7}),f(i.closeSlopeThreshold,{value:1}),f(i.closeSlopeCurrentFactor,{value:1.4}),f(i.openThresholdMultiplier,{value:1.7}),f(i.openSlopeThreshold,{value:.8}),f(i.openSlopeCurrentFactor,{value:1.3}),f(i.openRippleLimitFactor,{value:1}),f(i.genericRuntimeLimitSeconds,{value:45}),f(i.hmipRuntimeLimitSeconds,{value:40}),f(i.relearnAfterMovements,{value:2e3}),f(i.relearnAfterHours,{value:168}),f(i.learnedFactorMinSamples,{value:3}),f(i.learnedFactorMaxDeviationPct,{value:12}),f(i.simplePreheatEnabled,{state:"on"}),f(i.minZoneFlowPct,{value:15}),f(i.minimumFlowAlways,{state:"off"}),f(i.authorityInstallationId,{state:"house-main"}),f(i.authorityCoordinatorId,{state:"lune-touch"}),f(i.authorityConfigured,{state:"on",value:!0}),f(i.authorityProposalPending,{state:"off",value:!1}),f(i.authorityState,{state:"touch_normal"}),f(i.authorityReason,{state:"lease_renewed"}),f(i.authorityLeaseRemainingS,{value:72}),f(i.cpuLoadCore0,{value:18.5}),f(i.cpuLoadCore1,{value:7.2}),f(i.freeInternalKb,{value:142}),f(i.freePsramKb,{value:7800}),Te(!0);let t=300,e=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],n=[];for(let a=0;a<o;a++){let s=(o-1-a)*t,l=e-s,b=Math.floor(a/12)%24,g=r.map(d=>d[b%d.length]),u=s/3600,x=u>2.5&&u<3.5||u>8.5&&u<9.5?1:0,m=g.filter(d=>d===5).length,v=Math.round(Math.min(100,m*15+Math.abs(Math.sin(a/8))*6)),p=Number((30+m*1.4+Math.sin(a/11)*1.5).toFixed(1)),y=Number((p-(1.4+m*.35)).toFixed(1));n.push([l,...g,x,p,y,v])}Oe({interval_s:t,uptime_s:e,count:o,entries:n}),Et(6)}function Et(t){let e=[];for(let o=0;o<t;o++){let r=Ft[qe%Ft.length];e.push([qe,r[0],r[1],r[2]]),qe++}He(e,qe)}function Xo(){ke+=1,f(i.uptime,{value:Number(Date.now()/1e3)|0}),f(i.wifi,{value:-55-Math.round((1+Math.sin(ke/4))*6)});let t=0,e=0,o=0;for(let s=0;s<G;s++){let l=s+1,b=!!P.enabled[s],g=P.temp[s],u=P.setpoint[s],x=b&&P.driversEnabled&&!P.manualMode&&g<u-.25;P.manualMode?P.valve[s]=Math.max(0,P.valve[s]):!b||!P.driversEnabled?P.valve[s]=Math.max(0,P.valve[s]-6):x?P.valve[s]=Math.min(100,P.valve[s]+7+l%3):P.valve[s]=Math.max(0,P.valve[s]-5);let m=x?.05+P.valve[s]/2200:-.03+P.valve[s]/3200;P.temp[s]=g+m+Math.sin((ke+l)/5)*.04,b&&P.valve[s]>0&&(t+=P.valve[s],e+=1,o=Math.max(o,P.valve[s])),f(c.temp(l),{value:P.temp[s]}),f(c.valve(l),{value:Math.round(P.valve[s])});let v=Math.max(0,(P.setpoint[s]-P.temp[s]-.15)*.22);f(c.preheatAdvance(l),{value:Number(v.toFixed(2))}),f(c.state(l),{state:b?x?"heating":"idle":"off"}),f(c.enabled(l),{value:b,state:b?"on":"off"}),f(c.probeTemp(l),{value:P.temp[s]+Math.sin((ke+l)/6)*.1})}let r=29.5+o*.075+e*.18+Math.sin(ke/6)*.25,n=r-(e?2.1+t/Math.max(1,e*50):1.1);f(i.flow,{value:Number(r.toFixed(1))}),f(i.ret,{value:Number(n.toFixed(1))}),f(c.probeTemp(7),{value:Number((n-.4).toFixed(1))}),f(c.probeTemp(8),{value:Number((r+.2).toFixed(1))}),Te(!0);let a=F("zoneStateHistory");a&&(a.uptime_s=Number(Date.now()/1e3)|0),ke%3===0&&Et(1)}function Nt(){Tt||(Uo(),pe(!0),Tt=setInterval(Xo,1200))}function Ie(t){let e=t.key||"",o=t.value,r=t.zone||0;if(e==="zone_setpoint"&&r>=1&&r<=G){let a=Number(o);Number.isNaN(a)||(P.setpoint[r-1]=a,f(c.setpoint(r),{value:a}),f(c.baseSetpoint(r),{value:a}),f(c.effectiveSetpoint(r),{value:a}),H("Zone "+r+" setpoint set to "+a.toFixed(1)+"\xB0C",r));return}if(e==="zone_enabled"&&r>=1&&r<=G){let a=o>.5;P.enabled[r-1]=a?1:0,f(c.enabled(r),{value:a,state:a?"on":"off"}),H("Zone "+r+(a?" enabled":" disabled"),r);return}if(e==="drivers_enabled"){let a=o>.5;P.driversEnabled=a?1:0,f(i.drivers,{value:a,state:a?"on":"off"}),H(a?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let a=o>.5;P.manualMode=a?1:0,we("manualMode",a);return}if(e==="motor_target"&&r>=1&&r<=G){let a=Number(o||0);f(c.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(a)))}),H("Motor "+r+" target set to "+a+"%",r);return}if(e==="command"){let a=String(o);if(a==="i2c_scan"){ze(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),H("I2C scan complete");return}if(a==="calibrate_all_motors"||a==="restart"){H("Command executed: "+a);return}if(a==="open_motor_timed"&&r>=1&&r<=G){H("Motor "+r+" open timed",r);return}if(a==="close_motor_timed"&&r>=1&&r<=G){H("Motor "+r+" close timed",r);return}if(a==="stop_motor"&&r>=1&&r<=G){H("Motor "+r+" stopped",r);return}if(a==="motor_reset_fault"&&r>=1&&r<=G){H("Motor "+r+" fault reset",r);return}if(a==="motor_reset_learned_factors"&&r>=1&&r<=G){H("Motor "+r+" learned factors reset",r);return}if(a==="motor_reset_and_relearn"&&r>=1&&r<=G){H("Motor "+r+" reset and relearn started",r);return}if(a==="dump_task_stats"){H("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&r>=1){f(c.probe(r),{state:String(o)}),H("Setting updated: "+e+" = "+o,r);return}if(e==="zone_temp_source"&&r>=1){f(c.tempSource(r),{state:String(o)}),H("Setting updated: "+e+" = "+o,r);return}if(e==="zone_sync_to"&&r>=1){f(c.syncTo(r),{state:String(o)}),H("Setting updated: "+e+" = "+o,r);return}if(e==="manifold_type"){f(i.manifoldType,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="manifold_flow_probe"){f(i.manifoldFlowProbe,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="manifold_return_probe"){f(i.manifoldReturnProbe,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="motor_profile_default"){f(i.motorProfileDefault,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="simple_preheat_enabled"){f(i.simplePreheatEnabled,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="minimum_flow_always"){f(i.minimumFlowAlways,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="zone_name"&&r>=1){f(c.name(r),{state:String(o)}),H("Setting updated: "+e+" = "+o,r);return}if(e==="zone_ble_mac"&&r>=1){f(c.ble(r),{state:String(o)}),H("Setting updated: "+e+" = "+o,r);return}if(e==="authority_approve_proposal"){f(i.authorityInstallationId,{state:C(i.authorityProposalInstallationId)||"lune-mock"}),f(i.authorityCoordinatorId,{state:C(i.authorityProposalCoordinatorId)||"touch-mock"}),f(i.authorityConfigured,{state:"on",value:!0}),f(i.authorityProposalPending,{state:"off",value:!1}),H("Discovered Lune Touch approved");return}if(e==="authority_revoke"){f(i.authorityInstallationId,{state:""}),f(i.authorityCoordinatorId,{state:""}),f(i.authorityConfigured,{state:"off",value:!1}),f(i.authorityState,{state:"unconfigured"}),H("Lune Touch disconnected");return}let n={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct};if(n[e]){let a=Number(o);Number.isNaN(a)||(f(n[e],{value:a}),H("Setting updated: "+e+" = "+o));return}}window.__hv6_mock={setSetpoint(t,e){Ie({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!P.enabled[t-1];Ie({key:"zone_enabled",value:e?1:0,zone:t})}};var $e="/api/hv6/v1";function at(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function Go(t,e){let o=new URLSearchParams;for(let[n,a]of Object.entries(e||{}))a!=null&&o.append(n,a);let r=o.toString();return $e+t+(r?"?"+r:"")}function te(t,e,o){if(_t(),at())try{return Ie(o),Promise.resolve({ok:!0})}finally{rt()}let r=sessionStorage.getItem("hv6_local_access_key")||"",n=new URLSearchParams;for(let[s,l]of Object.entries(e||{}))l!=null&&n.append(s,String(l));let a=s=>fetch($e+t,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","X-Lune-Local-Key":s,"X-Lune-CSRF":s,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:n.toString()});return a(r).then(async s=>{if(s.status===403&&!r){let l=window.prompt("Enter the Lune commissioning key to change local settings")||"";l&&(sessionStorage.setItem("hv6_local_access_key",l),r=l,s=await a(r))}return!s.ok&&[400,404,415].includes(s.status)?fetch(Go(t,e),{method:"POST"}):(s.ok||console.warn(`API call failed: POST ${t} status=${s.status}`),s)}).catch(s=>{throw console.error(`API call error: POST ${t}:`,s),s}).finally(()=>{rt()})}function nt(t,e){return f(c.setpoint(t),{value:e}),te(`/zones/${t}/setpoint`,{setpoint_c:e},{key:"zone_setpoint",value:e,zone:t})}function Dt(t,e){return f(c.enabled(t),{state:e?"on":"off",value:e}),te(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function Rt(t){return f(i.drivers,{state:t?"on":"off",value:t}),te("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}function de(t,e){return te("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function Pt(){return ze("Scanning I2C bus..."),H("I2C scan started"),de("i2c_scan")}var Ko={zone_probe:t=>c.probe(t),zone_temp_source:t=>c.tempSource(t),zone_sync_to:t=>c.syncTo(t)},Yo={zone_ble_mac:t=>c.ble(t),zone_name:t=>c.name(t)},Jo={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled},Qo={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct};function Ze(t,e,o){let r=Ko[e];return r&&f(r(t),{state:o}),te("/settings/select",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function it(t,e,o){let r=Yo[e];return r&&f(r(t),{state:o}),te("/settings/text",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function se(t,e){let o=Jo[t];return o&&f(o,{state:e}),te("/settings/select",{key:t,value:e},{key:t,value:e})}function le(t,e){let o=Number(e),r=Qo[t];return r&&!Number.isNaN(o)&&f(r,{value:o}),te("/settings/number",{key:t,value:o},{key:t,value:o})}function Ot(){return te("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:C(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:C(i.authorityProposalCoordinatorId)||"touch-mock",local_access_key:"mock-local-access-key"}},o=(e==null?void 0:e.data)||{};return o.local_access_key&&sessionStorage.setItem("hv6_local_access_key",o.local_access_key),o.installation_id&&f(i.authorityInstallationId,{state:o.installation_id}),o.coordinator_id&&f(i.authorityCoordinatorId,{state:o.coordinator_id}),f(i.authorityConfigured,{state:"on",value:!0}),f(i.authorityProposalPending,{state:"off",value:!1}),e})}function Ht(){return te("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return sessionStorage.removeItem("hv6_local_access_key"),f(i.authorityInstallationId,{state:""}),f(i.authorityCoordinatorId,{state:""}),f(i.authorityConfigured,{state:"off",value:!1}),t})}function qt(t,e){let o=String(e||"").trim();return H("Zone "+t+" renamed to "+(o||"(blank)"),t),it(t,"zone_name",o)}function It(t,e){let o=Number(e),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return f(c.motorTarget(t),{value:r}),H("Motor "+t+" target set to "+r+"%",t),te(`/motors/${t}/target`,{value:r},{key:"motor_target",value:r,zone:t})}function $t(t,e=1e4){return H("Motor "+t+" open for "+e+"ms",t),te(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function Zt(t,e=1e4){return H("Motor "+t+" close for "+e+"ms",t),te(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function st(t){return H("Motor "+t+" stopped",t),te(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function lt(t){return we("manualMode",!!t),H(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),te("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function Bt(t){return H("Motor "+t+" fault reset",t),de("motor_reset_fault",t)}function Vt(t){return H("Motor "+t+" learned factors reset",t),de("motor_reset_learned_factors",t)}function jt(t){return H("Motor "+t+" reset and relearn started",t),de("motor_reset_and_relearn",t)}function Wt(){return H("Task stats dumped to device log"),de("dump_task_stats")}function dt(){at()||fetch($e+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Oe(t)}).catch(()=>{})}function ct(){if(at())return;let t=Ct();fetch($e+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&He(e.lines,e.next_seq)}).catch(()=>{})}var Be=null,Ut=null,Xt=null,Gt=null,pt=null;async function er(){Be&&Be.abort(),Be=new AbortController;let t=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Be.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function Kt(t){if(!(!t||typeof t!="object")&&!Lt()){for(let e in t)f(e,t[e]);Te(!1)}}function tr(t){if(t){if(!t.type){Kt(t);return}if(t.type==="state"){Kt(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;H(e),String(e).indexOf("I2C_SCAN:")!==-1&&ze(String(e))}}}function or(){dt(),Ut||(Ut=setInterval(dt,300*1e3)),ct(),Xt||(Xt=setInterval(ct,3e3))}function Yt(){er().then(t=>{pe(!0),tr(t),or()}).catch(()=>{pe(!1)})}async function rr(){try{let t=await fetch("/api/hv6/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),o=e&&e.data&&e.data.data_revision;(pt===null||o!==pt)&&(pt=o,Yt()),pe(!0)}catch(t){pe(!1)}}function Jt(){let t=window.HV6_DASHBOARD_CONFIG;if(t&&t.mock){Nt();return}Yt(),Gt||(Gt=setInterval(rr,3e3))}var Qt=Object.create(null);function D(t,e){if(Qt[t])return;Qt[t]=1;let o=document.createElement("style");o.textContent=e,document.head.appendChild(o)}var Ve={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature and coordination","zone.sensor.returnSensor":"Return temperature sensor","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.room.title":"Zone identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatur og koordinering","zone.sensor.returnSensor":"Returtemperatursensor","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.room.title":"Zoneidentitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?"}},eo="en".toLowerCase(),ut=Ve[eo]?eo:"en";function h(t,e){let o=Ve[ut]&&Ve[ut][t]||Ve.en[t]||t;return e?String(o).replace(/\{(\w+)\}/g,(r,n)=>e[n]==null?"":String(e[n])):o}function _(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=h(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",h(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",h(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",h(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",ut);var ar=`
/* ---- Card panel ---- */
.ui-card {
  background: var(--surface-raised);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px 20px;
  box-shadow: none;
  box-sizing: border-box;
}

/* ---- Titles & section headers ---- */
.ui-card-title {
  font-family: var(--font-display);
  font-size: .875rem;
  font-weight: 650;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-strong);
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
  width: 28px;
  height: 28px;
  margin-left: 7px;
  border-radius: 999px;
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
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  min-height:44px;
  padding: 8px 10px;
  font-size: .92rem;
  font-family: var(--mono);
  box-shadow:none;
  transition: border-color .15s ease;
}
.ui-input.wide { width: 180px; text-align: left; font-family: inherit; }

.ui-select {
  min-width: 160px;
  max-width: 240px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background:var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  min-height:44px;
  padding: 8px 10px;
  font-size: .92rem;
  box-shadow:none;
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
   The adjacent field remains directly editable; no hidden double-click mode. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 54px;
  text-align: center;
  border-color: var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  font-size: 1.04rem;
  font-weight: 700;
  cursor: text;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: 44px;
  height: 44px;
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
  width: 52px;
  height: 44px;
  border-radius: 999px;
  background: transparent;
  position: relative;
  cursor: pointer;
  border: 0;
  flex-shrink: 0;
}
.ui-toggle::before {
  content:'';
  position:absolute;
  inset:7px 2px;
  border:1px solid var(--control-border);
  border-radius:999px;
  background:var(--control-bg-hover);
  transition:background .2s ease,border-color .2s ease;
}
.ui-toggle::after {
  content: '';
  position: absolute;
  top: 11px;
  left: 6px;
  width: 22px;
  height: 22px;
  background: var(--control-knob);
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on::before { background:var(--accent);border-color:var(--accent); }
.ui-toggle.on::after { transform:translateX(18px);background:var(--text-on-accent); }

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
`;D("ui-kit",ar);function me(t){let e=h(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function nr(t,e){let o=Math.abs(Number(t));return!Number.isFinite(o)||o<1e3?e:Math.pow(10,Math.floor(Math.log10(o))-1)}function ir(t){let e=String(t),o=e.indexOf(".");return o<0?0:e.length-o-1}function ae(t,e={}){let o=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r);let n=[],a=()=>r.classList.toggle("show",n.some(d=>d.dirty)),s=(d,z)=>{d.dirty=z,a()};function l(d){return d.markDirty=()=>s(d,!0),n.push(d),d}function b(d,z){let S={dirty:!1,input:d},k=z.baseStep!=null?z.baseStep:parseFloat(d.step)||1,A=ir(k),M=z.min!=null?z.min:d.min!==""?parseFloat(d.min):-1/0,N=z.max!=null?z.max:d.max!==""?parseFloat(d.max):1/0,q=O=>A>0?Number(O).toFixed(A):String(Math.round(Number(O)));if(!z.nostep){let O=document.createElement("div");O.className="ui-stepper",d.parentNode.insertBefore(O,d);let T=document.createElement("button");T.type="button",T.className="ui-step-btn",T.textContent="\u2212",T.setAttribute("aria-label",h("common.decrease"));let W=document.createElement("button");W.type="button",W.className="ui-step-btn",W.textContent="+",W.setAttribute("aria-label",h("common.increase")),O.appendChild(T),O.appendChild(d),O.appendChild(W);let K=Q=>{if(d.disabled)return;let V=parseFloat(d.value);Number.isFinite(V)||(V=parseFloat(d.placeholder)),Number.isFinite(V)||(V=0);let Me=Math.min(N,Math.max(M,V+Q*nr(V,k)));d.value=q(Me),s(S,!0)};T.addEventListener("click",()=>K(-1)),W.addEventListener("click",()=>K(1)),d.addEventListener("keydown",Q=>{Q.key==="Enter"&&d.blur()})}return d.addEventListener("input",()=>s(S,!0)),S.sync=()=>{let O=z.read();d.value=O!=null&&Number.isFinite(Number(O))?q(O):""},S.commit=()=>{let O=parseFloat(d.value);Number.isFinite(O)&&z.commit(Math.min(N,Math.max(M,O)))},l(S)}function g(d,z){let S={dirty:!1,input:d};return d.addEventListener("input",()=>s(S,!0)),S.sync=()=>{let k=z.read();d.value=k!=null?k:""},S.commit=()=>z.commit(d.value.trim()),l(S)}function u(d,z){let S={dirty:!1,input:d};return d.addEventListener("change",()=>s(S,!0)),S.sync=()=>{let k=z.read();k!=null&&(d.value=k)},S.commit=()=>z.commit(d.value),l(S)}function x(d,z){let S={dirty:!1,input:d,staged:!1},k=d.closest(".ui-row"),A=()=>{d.classList.toggle("on",S.staged),k&&k.classList.toggle("is-on",S.staged),d.setAttribute("aria-checked",S.staged?"true":"false"),z.onChange&&z.onChange(S.staged)};return d.addEventListener("click",()=>{S.staged=!S.staged,s(S,!0),A()}),S.sync=()=>{S.staged=!!z.read(),A()},S.commit=()=>z.commit(S.staged),l(S)}function m(d){let z={dirty:!1,sync:d.sync,commit:d.commit};return l(z)}let v=()=>n.forEach(d=>{!d.dirty&&d.sync&&d.sync()}),p=()=>{n.forEach(d=>{d.dirty&&(d.commit&&d.commit(),d.dirty=!1)}),a(),e.onApply&&e.onApply()},y=()=>{n.forEach(d=>{d.dirty=!1,d.sync&&d.sync()}),a(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",p),r.querySelector(".ui-form-discard").addEventListener("click",y),_(r),{num:b,text:g,select:u,toggle:x,custom:m,refresh:v,apply:p,discard:y,isDirty:()=>n.some(d=>d.dirty)}}function j(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function Se(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function to(t){if(!t||isNaN(t))return"---";t=t|0;var e=t/86400|0,o=t%86400/3600|0,r=t%3600/60|0;return e>0?e+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}var je=Object.freeze({refinedEmber:"refined-ember",deepForest:"deep-forest"}),ro="lune-dashboard-theme",ao="(prefers-color-scheme: dark)",_e=null,oo=!1;function no(t){return Object.values(je).includes(t)?t:je.refinedEmber}function mt(){try{return no(localStorage.getItem(ro))}catch(t){return je.refinedEmber}}function sr(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(ao).matches?"dark":"light"}function lr(){let t=sr();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,!oo&&typeof window!="undefined"&&typeof window.matchMedia=="function"){_e=window.matchMedia(ao);let o=()=>{let r=_e.matches?"dark":"light";e.dataset.colorScheme=r,e.style.colorScheme=r,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:r}))};typeof _e.addEventListener=="function"?_e.addEventListener("change",o):typeof _e.addListener=="function"&&_e.addListener(o),oo=!0}return t}function gt(t=mt()){let e=no(t);if(typeof document=="undefined")return e;lr();let o=document.documentElement;return Object.values(je).forEach(r=>o.classList.remove(`theme-${r}`)),o.classList.add(`theme-${e}`),o.dataset.theme=e,e}function io(t){let e=gt(t);try{localStorage.setItem(ro,e)}catch(o){}return typeof window!="undefined"&&window.dispatchEvent(new CustomEvent("lune-theme-change",{detail:e})),e}var dr=`
.v6-toolbar { display:flex; align-items:center; justify-content:space-between; gap:24px; min-height:48px; }
.v6-toolbar-leading { display:flex; align-items:center; gap:14px; min-width:0; }
.v6-toolbar-icon { width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; color:var(--text-muted); background:transparent; font-size:18px; }
.v6-toolbar h1 { margin:0; color:var(--text-strong); font-size:1.16rem; line-height:1.2; font-weight:700; letter-spacing:-.018em; }
.v6-toolbar p { margin:1px 0 0; color:var(--text-muted); font-size:.74rem; }
.v6-toolbar-trailing { display:flex; align-items:center; gap:14px; }
.v6-live { display:inline-flex; align-items:center; gap:7px; color:var(--text-muted); font-size:.78rem; font-weight:650; }
.v6-live::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--state-disabled); }
.v6-live.is-live { color:var(--state-ok); }
.v6-live.is-live::before { background:var(--state-ok); }
.v6-appearance-label { color:var(--text-faint); font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.v6-theme-picker { min-height:44px; border:1px solid var(--control-border); border-radius:9px; background:var(--control-bg); color:var(--text-strong); padding:0 12px; font:inherit; font-size:.8rem; font-weight:650; }
.v6-theme-picker:focus-visible { outline:3px solid var(--focus-ring); outline-offset:2px; }
.side-nav-slot hv6-sidebar { display:flex; flex:1; min-height:0; }
.v6-side-nav { display:flex; flex:1; flex-direction:column; gap:3px; }
.v6-nav-group { margin:0 0 20px; }
.v6-nav-heading { margin:0 12px 8px; color:var(--text-faint); font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.v6-side-link { display:flex; align-items:center; gap:10px; min-height:44px; padding:0 12px; border:1px solid transparent; border-radius:10px; color:var(--text-muted); background:transparent; text-decoration:none; font-size:.9rem; font-weight:600; }
.v6-side-link:hover { color:var(--text-strong); background:var(--surface-raised); }
.v6-side-link.active { color:var(--accent); border-color:transparent; background:rgba(var(--accent-rgb),.10); }
.menu-icon { width:20px; height:20px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.v6-side-utility { margin-top:auto; padding-top:16px; border-top:1px solid var(--separator); }
.v6-more-toggle { display:none; }
@media (max-width:900px) {
  .v6-toolbar { min-height:48px; }
  .v6-toolbar-trailing { gap:8px; }
  .v6-appearance-label { display:none; }
  .v6-side-nav { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
  .v6-nav-group { display:contents; }
  .v6-nav-heading, .v6-side-utility { display:none; }
  .v6-side-link { justify-content:center; flex-direction:column; gap:2px; min-height:52px; padding:4px; font-size:.68rem; }
  .v6-side-link[data-section="settings"] { display:none; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,1fr); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"], .v6-side-nav.more-open .v6-side-utility { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { grid-column:1/-1; border:0; padding:0; margin:0; display:contents; }
}
`;D("hv6-header",dr);var cr=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><span class="v6-live" id="hdr-live">Offline</span><span class="v6-appearance-label">Accent</span><select id="hdr-theme" class="v6-theme-picker" aria-label="Accent theme"><option value="refined-ember">Refined Ember</option><option value="deep-forest">Deep Forest</option></select></div>
  </header>`,Le=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,pr=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Le('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <a href="#" class="v6-side-link" data-section="zones">${Le('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span></a>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Le('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${Le('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Le('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span></button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Le('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`,so={overview:["Overview","Local heating status and current exceptions"],zones:["Zones","Physical loops, applied targets and valve state"],diagnostics:["Diagnostics","Health, evidence and recovery"],settings:["Settings","Device configuration and safety"],help:["Help","Guidance for operating Lune V6"]};R({tag:"hv6-header",render:cr,onMount(t,e){let o=e.querySelector("#hdr-theme"),r=e.querySelector("#hdr-live"),n=e.querySelector("#v6-view-title"),a=e.querySelector("#v6-view-subtitle");o.value=mt(),o.addEventListener("change",()=>io(o.value)),window.addEventListener("lune-theme-change",l=>{l.detail&&(o.value=l.detail)});function s(){let l=F("section")||"overview",b=so[l]||so.overview;n.textContent=b[0],a.textContent=b[1],r.textContent=F("live")?h("status.live"):h("status.offline"),r.classList.toggle("is-live",!!F("live"))}$("section",s),$("live",s),_(e),s()}});R({tag:"hv6-sidebar",render:pr,onMount(t,e){let o=e.querySelector(".v6-side-nav"),r=e.querySelectorAll("[data-section]"),n=e.querySelector(".v6-more-toggle");function a(){let s=F("section");r.forEach(l=>{l.dataset.section&&(l.dataset.section===s?l.classList.add("active"):l.classList.remove("active"),l.setAttribute("aria-current",l.dataset.section===s?"page":"false"))})}r.forEach(s=>s.addEventListener("click",l=>{l.preventDefault(),ve(s.dataset.section),o.classList.contains("more-open")&&(o.classList.remove("more-open"),n.setAttribute("aria-expanded","false"))})),n.addEventListener("click",()=>{let s=o.classList.toggle("more-open");n.setAttribute("aria-expanded",String(s))}),$("section",a),_(e),a()}});var ur=`
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
`;D("connectivity-card",ur);var mr=()=>`
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,kn=R({tag:"connectivity-card",render:mr,onMount(t,e){let o=e.querySelector(".cc-ip"),r=e.querySelector(".cc-ssid"),n=e.querySelector(".cc-mac"),a=e.querySelector(".cc-up");function s(){o.textContent=C(i.ip)||"---",r.textContent=C(i.ssid)||"---",n.textContent=C(i.mac)||"---",a.textContent=to(L(i.uptime))}w(i.ip,s),w(i.ssid,s),w(i.mac,s),w(i.uptime,s),_(e),s()}});var gr="http://www.w3.org/2000/svg",fr=`
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
`;D("chart-kit",fr);function oe(t,e,o){let r=document.createElementNS(gr,t);if(e)for(let n in e)r.setAttribute(n,e[n]);return o!=null&&(r.textContent=o),r}function lo(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let e=.16,o=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let r=0;r<t.length-1;r++){let n=t[r-1]||t[r],a=t[r],s=t[r+1],l=t[r+2]||s,b=a.x+(s.x-n.x)*e,g=a.y+(s.y-n.y)*e,u=s.x-(l.x-a.x)*e,x=s.y-(l.y-a.y)*e;o+=` C ${b.toFixed(2)} ${g.toFixed(2)}, ${u.toFixed(2)} ${x.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return o}function co(t,e,o){let r=document.createElement("div");r.className="chart-tooltip",e.appendChild(r);let n=oe("g",{class:"chart-cursor",style:"display:none"}),a=oe("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});n.appendChild(a);let s=[];t.appendChild(n);function l(x){let m=0,v=1/0;for(let p=0;p<o.count;p++){let y=Math.abs(x-o.xAt(p));y<v&&(v=y,m=p)}return m}function b(x){let m=t.getScreenCTM();if(!m)return null;let v=t.createSVGPoint();return v.x=x.clientX,v.y=x.clientY,v.matrixTransform(m.inverse())}function g(x){if(!o.count)return;let m=b(x);if(!m)return;let v=l(m.x),p=o.xAt(v);a.setAttribute("x1",p),a.setAttribute("x2",p);let y=o.dots(v);for(;s.length<y.length;){let k=oe("circle",{class:"chart-cursor-dot",r:3.4});n.appendChild(k),s.push(k)}s.forEach((k,A)=>{A<y.length?(k.setAttribute("cx",p),k.setAttribute("cy",y[A].y),k.setAttribute("fill",y[A].color),k.style.display=""):k.style.display="none"}),n.style.display="";let d=o.rows(v).map(k=>`<div class="tt-row"><span class="tt-swatch" style="background:${k.color}"></span>${k.label}<span class="tt-val">${k.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(v)}</div>${d}`,r.classList.add("show");let z=e.getBoundingClientRect(),S=x.clientX-z.left+14;S+r.offsetWidth>z.width-6&&(S=x.clientX-z.left-r.offsetWidth-14),r.style.left=Math.max(6,S)+"px",r.style.top=Math.max(6,x.clientY-z.top+12)+"px"}function u(){r.classList.remove("show"),n.style.display="none"}return t.addEventListener("pointermove",g),t.addEventListener("pointerleave",u),()=>{t.removeEventListener("pointermove",g),t.removeEventListener("pointerleave",u),r.remove()}}var Fe=1e3,ft=180,ne=14,br=42,vr=44,fe=42,Xe=Fe-fe-br,ge=ft-ne-vr,he=ne+ge,bt=24*3600,po=J+2,uo=J+3,We=J+4,hr="var(--series-warm)",xr="var(--series-cool)",mo="var(--series-solar)",yr=`
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
`;D("graph-widgets",yr);var go=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',fo=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',wr=t=>t.variant==="flow-return"?`<div class="graph-widgets">${go()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${fo()}</div>`:`<div class="graph-widgets">${go()}${fo()}</div>`;function bo(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function zr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function vt(t,e,o){let r=[];for(let n=0;n<t.length;n++){let a=t[n];if(!a||a[0]<o)continue;let s=a[e];s==null||!Number.isFinite(s)||r.push({t:a[0],v:s})}return r}var Ge=(t,e)=>fe+Math.max(0,Math.min(1,(t-e)/bt))*Xe;function kr(t,e,o){let r=Number(Date.now()/1e3)|0,n=3600,a=Math.ceil((r-bt)/n)*n,s=Math.floor(r/n)*n,l=Math.floor(r/n)*n;for(let g=a;g<=s;g+=n){let u=o-(r-g),x=Ge(u,e),m=new Date(g*1e3),v=g===l,p=he+16;t.appendChild(oe("text",{x,y:p,"text-anchor":"end",transform:`rotate(-45 ${x.toFixed(1)} ${p})`,class:"chart-hour"+(v?" now":"")},String(m.getHours()).padStart(2,"0")))}let b=Ge(o,e);t.appendChild(oe("line",{x1:b,y1:ne,x2:b,y2:he,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Sr(t){let e=[];if(t.forEach(a=>a.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let o=Math.min(...e),r=Math.max(...e);o===r&&(o-=.5,r+=.5);let n=(r-o)*.1;return o-=n,r+=n,{min:o,max:r}}function _r(t,e,o){let r=t.filter(n=>n.unit==="C").map(n=>vt(e,n.index,o));return Sr(r)}function vo(t,e,o,r,n,a){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${Fe} ${ft}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=o.map(p=>vt(r,p.index,n));if(!s.some(p=>p.length))return t.appendChild(oe("text",{x:Fe/2,y:ft/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let l=_r(o,r,n),b=Math.max(.001,l.max-l.min),g=p=>ne+(1-(p-l.min)/b)*ge,u=p=>ne+(1-Math.max(0,Math.min(100,p))/100)*ge,x=(p,y)=>p.unit==="%"?u(y):g(y);for(let p=0;p<3;p++){let y=p/2,d=ne+y*ge;t.appendChild(oe("line",{x1:fe,y1:d,x2:fe+Xe,y2:d,class:"chart-grid"})),o.some(z=>z.unit==="C")&&t.appendChild(oe("text",{x:fe-6,y:d+4,"text-anchor":"end",class:"chart-tick"},bo(l.max-b*y,"C")+"\xB0")),o.some(z=>z.unit==="%")&&t.appendChild(oe("text",{x:fe+Xe+6,y:d+4,"text-anchor":"start",class:"chart-tick"},bo(100-100*y,"%")))}t.appendChild(oe("line",{x1:fe,y1:he,x2:fe+Xe,y2:he,class:"chart-axis"})),o.some(p=>p.unit==="C")&&t.appendChild(oe("text",{x:9,y:ne+ge/2,transform:`rotate(-90 9 ${(ne+ge/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},h("overview.graph.axis.temp"))),o.some(p=>p.unit==="%")&&t.appendChild(oe("text",{x:Fe-9,y:ne+ge/2,transform:`rotate(90 ${Fe-9} ${(ne+ge/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},h("overview.graph.axis.demand"))),kr(t,n,a),o.forEach((p,y)=>{let d=s[y].map(S=>({x:Ge(S.t,n),y:x(p,S.v)}));if(!d.length)return;let z=lo(d);p.fill&&t.appendChild(oe("path",{d:z+` L ${d[d.length-1].x.toFixed(1)} ${he} L ${d[0].x.toFixed(1)} ${he} Z`,fill:p.fill,stroke:"none"})),t.appendChild(oe("path",{d:z,fill:"none",stroke:p.color,"stroke-width":String(p.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let m=[];for(let p=0;p<r.length;p++){let y=r[p];if(!y||y[0]<n)continue;let d=o.map(z=>y[z.index]);d.every(z=>z==null||!Number.isFinite(z))||m.push({t:y[0],vals:d})}if(!m.length)return null;let v=Date.now();return co(t,e,{count:m.length,plotTop:ne,plotBottom:he,xAt:p=>Ge(m[p].t,n),label:p=>new Date(v-(a-m[p].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:p=>o.map((y,d)=>({y:x(y,m[p].vals[d]),color:y.color})).filter((y,d)=>Number.isFinite(m[p].vals[d])),rows:p=>o.map((y,d)=>({color:y.color,label:y.label,value:zr(m[p].vals[d],y.unit)})).filter((y,d)=>Number.isFinite(m[p].vals[d]))})}function Ue(t,e,o){let r=vt(t,e,o);return r.length?r[r.length-1].v:null}var En=R({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:wr,onMount(t,e){let o=e.querySelector(".gw-dt"),r=e.querySelector(".gw-demand-text"),n=e.querySelector(".gw-flow"),a=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),l={flow:!0,return:!0,demand:!0},b=null,g=null;function u(){s.forEach(v=>{let p=v.dataset.layer;v.classList.toggle("is-off",!l[p]),v.setAttribute("aria-pressed",l[p]?"true":"false")})}function x(){let v=[];return l.flow&&v.push({index:po,color:hr,label:h("overview.graph.layers.flow"),unit:"C",width:2.4}),l.return&&v.push({index:uo,color:xr,label:h("overview.graph.layers.return"),unit:"C",width:2}),l.demand&&v.push({index:We,color:mo,label:h("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),v}function m(){let v=F("zoneStateHistory"),p=v&&Array.isArray(v.entries)?v.entries:[],y=v&&v.uptime_s||Number(Date.now()/1e3)|0,d=y-bt;if(n){b&&b();let z=Ue(p,po,d),S=Ue(p,uo,d),k=Ue(p,We,d),A=[];z!=null&&S!=null&&A.push("\u0394 "+(z-S).toFixed(1)+"\xB0"),k!=null&&A.push(Math.round(k)+"%"),o.textContent=A.length?A.join(" \xB7 "):"\u2014",b=vo(n,n.closest(".chart-card"),x(),p,d,y)}if(a){g&&g();let z=Ue(p,We,d);r.textContent=z!=null?Math.round(z)+"%":"\u2014",g=vo(a,a.closest(".chart-card"),[{index:We,color:mo,label:h("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],p,d,y)}}s.forEach(v=>{v.addEventListener("click",()=>{let p=v.dataset.layer;l[p]=!l[p],!l.flow&&!l.return&&!l.demand&&(l[p]=!0),u(),m()})}),$("zoneStateHistory",m),_(e),u(),m()}});var be={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Ee=24*3600,Lr=Ee,Ne=18,yt=4,xe=54,Ye=32,Ce=4,Je=10,yo=6,wo="#ffc14d",ht=9,ho=J+1,zo=Ce+J*(Ne+yt)-yt,xt=zo+yo,Ke=zo+yo+Je+Ye,Cr=`
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
.timeline-head::before { content:''; width:4px; height:13px; border-radius:4px; background:var(--accent); flex-shrink:0; }
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
`;D("zone-state-timeline",Cr);var Mr=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Ar(t,e){if(!t||!t.entries||t.entries.length===0)return null;let o=t.entries,r=t.uptime_s||e||0,n=Number(Date.now()/1e3)|0,a=1e3,s=a-xe;function l(k){let A=(k+Ee)/Lr;return xe+Math.max(0,Math.min(1,A))*s}function b(k){return k-r}let g="http://www.w3.org/2000/svg",u=document.createElementNS(g,"svg");u.setAttribute("viewBox","0 0 "+a+" "+Ke),u.classList.add("timeline-svg");let x=document.createElementNS(g,"rect");x.setAttribute("x",xe),x.setAttribute("y",Ce),x.setAttribute("width",s),x.setAttribute("height",Ke-Ce-Ye),x.setAttribute("fill","rgba(0,32,46,0.55)"),x.setAttribute("rx","4"),u.appendChild(x);let m=l(0),v=[-24,-18,-12,-6,0].map(k=>k*3600);for(let k of v){let A=l(k),M=document.createElementNS(g,"line");M.setAttribute("x1",A),M.setAttribute("y1",Ce),M.setAttribute("x2",A),M.setAttribute("y2",Ke-Ye),M.setAttribute("stroke",k===0?"var(--series-solar)":"rgba(120,146,200,.16)"),M.setAttribute("stroke-width","1"),k===0&&(M.setAttribute("stroke-dasharray","2 3"),M.setAttribute("opacity",".55"),M.setAttribute("vector-effect","non-scaling-stroke")),u.appendChild(M)}u.appendChild(Tr(g,"text",{x:m+4,y:Ce+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let k=0;k<J;k++){let A=Ce+k*(Ne+yt),M=document.createElementNS(g,"rect");M.setAttribute("x",xe),M.setAttribute("y",A),M.setAttribute("width",s),M.setAttribute("height",Ne),M.setAttribute("fill",k%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),u.appendChild(M);let N=document.createElementNS(g,"text");N.setAttribute("x",xe-4),N.setAttribute("y",A+Ne/2+1),N.setAttribute("text-anchor","end"),N.setAttribute("dominant-baseline","middle"),N.setAttribute("fill","rgba(233,222,210,.62)"),N.setAttribute("font-size","9.5"),N.setAttribute("font-family","Montserrat, sans-serif"),N.setAttribute("font-weight","600"),N.textContent="Z"+(k+1),u.appendChild(N);let q=o.map(T=>({rel:b(T[0]),state:T[k+1]})).filter(T=>T.rel>=-Ee&&T.rel<=0),O=(T,W,K)=>{if(K===255)return;let Q=be[K]||be[255];if(Q.color==="transparent")return;let V=l(T),Me=l(W),Oo=Math.max(1,Me-V),ce=document.createElementNS(g,"rect");ce.setAttribute("x",V),ce.setAttribute("y",A+(Ne-ht)/2),ce.setAttribute("width",Oo),ce.setAttribute("height",ht),ce.setAttribute("fill",Q.color),ce.setAttribute("rx",String(ht/2)),ce.setAttribute("opacity","0.9"),u.appendChild(ce)};if(q.length){let T=q[0].rel,W=q[0].state;for(let K=1;K<q.length;K++){let Q=q[K];Q.state!==W&&(O(T,Q.rel,W),T=Q.rel,W=Q.state)}O(T,0,W)}}{let k=document.createElementNS(g,"rect");k.setAttribute("x",xe),k.setAttribute("y",xt),k.setAttribute("width",s),k.setAttribute("height",Je),k.setAttribute("fill","rgba(188,80,144,0.10)"),k.setAttribute("rx","2"),u.appendChild(k);let A=document.createElementNS(g,"text");A.setAttribute("x",xe-4),A.setAttribute("y",xt+Je/2+1),A.setAttribute("text-anchor","end"),A.setAttribute("dominant-baseline","middle"),A.setAttribute("fill","rgba(233,222,210,.62)"),A.setAttribute("font-size","8.5"),A.setAttribute("font-family","Montserrat, sans-serif"),A.setAttribute("font-weight","600"),A.textContent=h("overview.timeline.absorb"),u.appendChild(A);let M=o.map(N=>({rel:b(N[0]),on:N.length>ho?N[ho]:0})).filter(N=>N.rel>=-Ee&&N.rel<=0);if(M.length){let N=(T,W)=>{let K=l(T),Q=Math.max(1,l(W)-K),V=document.createElementNS(g,"rect");V.setAttribute("x",K),V.setAttribute("y",xt),V.setAttribute("width",Q),V.setAttribute("height",Je),V.setAttribute("fill",wo),V.setAttribute("rx","2"),V.setAttribute("opacity","0.9"),u.appendChild(V)},q=M[0].rel,O=M[0].on;for(let T=1;T<M.length;T++)M[T].on!==O&&(O&&N(q,M[T].rel),q=M[T].rel,O=M[T].on);O&&N(q,0)}}let p=Ke-Ye+15,y=3600,d=Math.ceil((n-Ee)/y)*y,z=Math.floor(n/y)*y,S=Math.floor(n/y)*y;for(let k=d;k<=z;k+=y){let A=k-n,M=l(A),N=new Date(k*1e3),q=String(N.getHours()).padStart(2,"0"),O=k===S,T=document.createElementNS(g,"text");T.setAttribute("x",M),T.setAttribute("y",p),T.setAttribute("text-anchor","end"),T.setAttribute("fill",O?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),T.setAttribute("font-size","9"),T.setAttribute("font-family",'"Montserrat", sans-serif'),T.setAttribute("font-weight","500"),T.setAttribute("font-variant-numeric","tabular-nums lining-nums"),T.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),T.setAttribute("letter-spacing","0"),T.setAttribute("transform",`rotate(-45 ${M.toFixed(1)} ${p})`),T.textContent=q,u.appendChild(T)}return u}function Tr(t,e,o,r){let n=document.createElementNS(t,e);for(let a in o)n.setAttribute(a,o[a]);return r!=null&&(n.textContent=r),n}function xo(t){t.innerHTML="";let e=[{code:5,...be[5]},{code:6,...be[6]},{code:0,...be[0]},{code:1,...be[1]},{code:7,...be[7]},{code:2,...be[2]}];for(let r of e){let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?h(r.labelKey):""),t.appendChild(n)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+wo+'"></span>'+h("overview.timeline.preheatAbsorption"),t.appendChild(o)}var qn=R({tag:"zone-state-timeline",render:Mr,onMount(t,e){let o=e.querySelector(".tl-body"),r=e.querySelector(".timeline-legend");xo(r);function n(){let a=F("zoneStateHistory"),s=(()=>{let b=F&&F("zoneStateHistory");return b&&b.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!a||!a.entries||a.entries.length===0){let b=document.createElement("div");b.className="timeline-empty",b.textContent=h("overview.timeline.noHistory"),o.appendChild(b);return}let l=Ar(a,s);l&&o.appendChild(l)}$("zoneStateHistory",n),$("zoneNames",n),w(i.drivers,n);for(let a=1;a<=J;a++)w(c.enabled(a),n),w(c.state(a),n),w(c.temp(a),n),w(c.setpoint(a),n),w(c.preheatAdvance(a),n);_(e),n()}});var Fr=`
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
`;D("zone-grid",Fr);var Er=()=>'<div class="zone-grid" aria-label="Zones"></div>',Bn=R({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Er,onMount(t,e){for(let o=1;o<=6;o++)e.appendChild(B("zone-card",{zone:o,selection:t.selection,navigate:t.navigate}))}});var Nr=`
.zone-card {
  width:100%; min-width:0; min-height:72px; margin:0; padding:12px 16px; border:0; border-radius:0;
  display:grid; grid-template-columns:minmax(170px,1.4fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(100px,.7fr) 28px;
  align-items:center; gap:16px; background:transparent; color:var(--text-main); font:inherit; text-align:left; cursor:pointer;
}
.zone-card + .zone-card{border-top:1px solid var(--separator)}
.zone-card:hover{background:rgba(255,255,255,.025)}
.zone-card:active{background:rgba(var(--accent-rgb),.08)}
.zone-card.active{background:rgba(var(--accent-rgb),.10)}
.zone-card.disabled{color:var(--text-muted)}
.zone-card .zc-zone-name,.zone-card .zc-friendly,.zone-card .zc-reading,.zone-card .zc-valve,.zone-card .zc-state-row{min-width:0}
.zone-card .zc-zone-name{grid-column:1;grid-row:1;color:var(--text-strong);font-size:.94rem;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zone-card .zc-friendly{grid-column:1;grid-row:1;margin-top:25px;color:var(--text-faint);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zone-card .zc-reading{grid-column:2;grid-row:1}.zone-card .zc-valve{grid-column:3;grid-row:1}
.zone-card .zc-reading strong,.zone-card .zc-valve strong{display:block;color:var(--text-strong);font-size:.94rem;font-weight:650;font-variant-numeric:tabular-nums}
.zone-card .zc-reading small,.zone-card .zc-valve small{display:block;margin-top:3px;color:var(--text-muted);font-size:.72rem}
.zone-card .zc-state-row{grid-column:4;grid-row:1;display:flex;align-items:center;gap:6px}
.zone-card .zc-dot{width:7px;height:7px;flex:0 0 auto;border-radius:50%;background:var(--state-disabled)}
.zone-card .zc-state-label{overflow:hidden;color:var(--text-muted);font-size:.78rem;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.zone-card.zs-heating .zc-dot{background:var(--accent)}.zone-card.zs-heating .zc-state-label{color:var(--accent)}
.zone-card.zs-idle .zc-dot,.zone-card.zs-off .zc-dot{background:var(--state-disabled)}.zone-card.zs-idle .zc-state-label,.zone-card.zs-off .zc-state-label{color:var(--text-muted)}
.zone-card.zs-fault .zc-dot{background:var(--state-danger)}.zone-card.zs-fault .zc-state-label{color:var(--state-danger)}
.zone-card::after{content:'\u203A';grid-column:5;grid-row:1;color:var(--text-muted);font-size:1.35rem;text-align:right}
`;D("zone-card",Nr);var Dr=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="Open zone ${t.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${re(t.zone)}</div>
		<div class="zc-friendly">${ue(t.zone)||"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,Yn=R({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Dr,onMount(t,e){let o=t.zone,r=c.temp(o),n=c.state(o),a=c.enabled(o),s=e.querySelector(".zc-state-label"),l=e.querySelector(".zc-zone-name"),b=e.querySelector(".zc-friendly"),g=e.querySelector(".zc-temp"),u=e.querySelector(".zc-target"),x=e.querySelector(".zc-valve-value");function m(){var N;let p=X(a),y=String(C(n)||"").toUpperCase()||"OFF",d=String(C(c.motorLastFault(o))||"").toUpperCase(),z=d&&d!=="NONE"&&d!=="OK",S=p&&(y==="FAULT"||z)?"FAULT":y,k=t.selection&&F("selectedZone")===o,A=ue(o);l.textContent=A||"Zone "+o,b.textContent="Zone "+o+" \xB7 physical loop",g.textContent=j(L(r)),u.textContent="Applied "+j((N=L(c.effectiveSetpoint(o)))!=null?N:L(c.setpoint(o))),x.textContent=Se(L(c.valve(o)));let M=p?S:"OFF";s.textContent=M==="HEATING"?h("state.heating"):M==="IDLE"?h("state.idle"):M==="FAULT"?h("common.fault"):M==="MANUAL"?h("state.manual"):M==="OVERHEATED"?h("state.overheated"):M==="CALIBRATING"?h("state.calibrating"):h("state.off"),e.title=z?h("zone.card.fault",{fault:d}):"",e.classList.toggle("active",k),k?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${l.textContent}, ${g.textContent}, ${u.textContent}, ${s.textContent}. Open details.`),e.classList.toggle("disabled",!p),e.classList.toggle("zs-heating",p&&M==="HEATING"),e.classList.toggle("zs-fault",p&&M==="FAULT"),e.classList.toggle("zs-idle",p&&M==="IDLE"),e.classList.toggle("zs-off",!p||M==="OFF")}function v(){Ae(o),t.navigate&&ve("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:o}}))}e.addEventListener("click",v),w(r,m),w(c.setpoint(o),m),w(c.effectiveSetpoint(o),m),w(c.valve(o),m),w(n,m),w(a,m),w(c.motorLastFault(o),m),$("selectedZone",m),$("zoneNames",m),m()}});var Rr=`
.zone-detail{height:auto;padding:0;background:transparent;border:1px solid var(--separator);border-radius:10px;box-shadow:none;overflow:hidden}
.zone-detail .zd-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:58px;margin:0;padding:10px 16px;border-bottom:1px solid var(--separator)}
.zone-detail .zd-title{color:var(--text-strong);font-size:1rem;font-weight:650}
.zone-detail .zd-head-ctrl{display:flex;align-items:center;gap:10px}
.zone-detail .zd-badge{padding:4px 9px;border:0;border-radius:999px;background:rgba(139,148,163,.12);color:var(--state-disabled);font-size:.72rem;font-weight:650}
.zone-detail .zd-badge.badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}.zone-detail .zd-badge.badge-idle{background:rgba(139,148,163,.12);color:var(--text-muted)}.zone-detail .zd-badge.badge-fault{background:rgba(239,68,68,.12);color:var(--state-danger)}
.zone-detail .zd-body>div:first-child{padding:18px 16px}
.zone-detail .zd-kicker{margin:0 0 7px;color:var(--text-muted);font-size:.76rem;font-weight:600}
.zone-detail .zd-target-row{display:flex;align-items:center;gap:10px}.zone-detail .zd-setpoint{color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;font-variant-numeric:tabular-nums}
.zone-detail .spb{display:grid;width:44px;height:44px;place-items:center;border:1px solid var(--separator);border-radius:8px;background:var(--control-bg);color:var(--text-strong);font-size:1.15rem;cursor:pointer}.zone-detail .spb:hover,.zone-detail .spb:active{background:rgba(var(--accent-rgb),.12);color:var(--accent)}
.zone-detail .zd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:0;padding:0 16px 18px}.zone-detail .zd-stat{min-width:0;padding:0 12px;border-left:1px solid var(--separator)}.zone-detail .zd-stat:first-child{padding-left:0;border-left:0}.zone-detail .zd-stat-label{color:var(--text-faint);font-size:.7rem;font-weight:600}.zone-detail .zd-stat-value{margin-top:4px;color:var(--text-strong);font-family:var(--font-display);font-size:1.08rem;font-weight:650;font-variant-numeric:tabular-nums}
.zone-detail .zd-motor{margin:0;border-top:1px solid var(--separator)}.zone-detail .zd-motor>summary{display:flex;align-items:center;min-height:52px;padding:0 16px;color:var(--text-strong);font-size:.86rem;font-weight:650;cursor:pointer;list-style:none}.zone-detail .zd-motor>summary::-webkit-details-marker{display:none}.zone-detail .zd-motor>summary::after{content:'\u203A';margin-left:auto;color:var(--text-muted);font-size:1.2rem;transition:transform .16s ease}.zone-detail .zd-motor[open]>summary::after{transform:rotate(90deg)}.zone-detail .zd-motor>summary small{margin-left:auto;margin-right:14px;color:var(--text-muted);font-size:.74rem;font-weight:400}.zone-detail .zd-motor-body{padding:16px;border-top:1px solid var(--separator)}.zone-detail .zd-motor-body .zd-stats{padding:0}
.zone-detail .zd-fault{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:14px 0 0;padding:9px 10px;border-left:3px solid var(--state-danger);background:rgba(239,68,68,.06);font-size:.76rem}.zone-detail .zd-fault[hidden]{display:none}.zone-detail .zd-fault-label{color:var(--text-muted)}.zone-detail .zd-fault-val{color:var(--state-danger);font-weight:650}
@media(max-width:560px){.zone-detail .zd-stats{grid-template-columns:1fr 1fr;gap:16px 0}.zone-detail .zd-stat:nth-child(odd){padding-left:0;border-left:0}.zone-detail .zd-motor>summary small{display:none}}
`;D("zone-detail",Rr);var Pr=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    <div class="zd-head">
      <div class="zd-title">${re(t.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" data-i18n-label="zone.detail.enabled" data-i18n-title="zone.detail.enabled" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker">Applied target</div>
        <div class="zd-target-row">
          <button class="spb btn-dec" data-i18n-label="common.decrease" aria-label="decrease">\u2212</button>
          <div class="zd-setpoint">---</div>
          <button class="spb btn-inc" data-i18n-label="common.increase" aria-label="increase">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.currentTemp">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Local fallback</div><div class="zd-stat-value zd-base">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Touch offset</div><div class="zd-stat-value zd-offset">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.returnTemp">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.flowPct">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <details class="zd-motor">
        <summary>Advanced motor properties <small>Calibration and preheat</small></summary>
        <div class="zd-motor-body"><div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openRipples">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeRipples">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openFactor">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeFactor">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.preheatAdv">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div><div class="zd-fault" hidden><span class="zd-fault-label" data-i18n="zone.detail.lastFault">Last fault</span><span class="zd-fault-val">NONE</span></div></div>
      </details>
    </div>
  </div>
`;function ko(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function So(t){return t!=null?Number(t).toFixed(0):"---"}function Or(t){return t!=null?Number(t).toFixed(2)+"C":"---"}function Hr(t,e){if(!e)return h("common.disabled");let o=String(t||"IDLE").toUpperCase();return o==="HEATING"?h("state.heating"):o==="IDLE"?h("state.idle"):o==="OFF"?h("state.off"):o==="FAULT"?h("common.fault"):o==="MANUAL"?h("state.manual"):o==="OVERHEATED"?h("state.overheated"):o==="CALIBRATING"?h("state.calibrating"):o}var ii=R({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Pr,methods:{update(t,e){var u,x;let o=F("selectedZone"),r=String(C(c.state(o))||"").toUpperCase(),n=X(c.enabled(o));this.zone=o,t.dataset.zone=String(o),e.title.textContent=re(o),e.setpoint.textContent=j((u=L(c.effectiveSetpoint(o)))!=null?u:L(c.setpoint(o))),e.base.textContent=j((x=L(c.baseSetpoint(o)))!=null?x:L(c.setpoint(o)));let a=L(c.coordinatorOffset(o));e.offset.textContent=a==null?"---":(a>0?"+":"")+Number(a).toFixed(1)+"\xB0C",e.temp.textContent=j(L(c.temp(o))),e.ret.textContent=j(L("sensor-manifold_return_temperature")),e.valve.textContent=Se(L(c.valve(o)));let s=e.badge;s.textContent=Hr(r,n);let l=n?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";s.className="zd-badge"+(l?" "+l:""),e.toggle.classList.toggle("on",n),e.orip.textContent=So(L(c.motorOpenRipples(o))),e.crip.textContent=So(L(c.motorCloseRipples(o))),e.ofac.textContent=ko(L(c.motorOpenFactor(o))),e.cfac.textContent=ko(L(c.motorCloseFactor(o))),e.ph.textContent=Or(L(c.preheatAdvance(o)));let b=String(C(c.motorLastFault(o))||"").toUpperCase(),g=b&&b!=="NONE"&&b!=="OK";e.fault.hidden=!g,g&&(e.faultVal.textContent=b)},incSetpoint(){let t=this.zone,e=L(c.setpoint(t))||20;nt(t,Number((e+.5).toFixed(1)))},decSetpoint(){let t=this.zone,e=L(c.setpoint(t))||20;nt(t,Number((e-.5).toFixed(1)))},toggleEnabled(){let t=this.zone,e=X(c.enabled(t));Dt(t,!e)}},onMount(t,e){let o={title:e.querySelector(".zd-title"),setpoint:e.querySelector(".zd-setpoint"),temp:e.querySelector(".zd-temp"),base:e.querySelector(".zd-base"),offset:e.querySelector(".zd-offset"),ret:e.querySelector(".zd-ret"),valve:e.querySelector(".zd-valve"),badge:e.querySelector(".zd-badge"),toggle:e.querySelector(".btn-toggle"),inc:e.querySelector(".btn-inc"),dec:e.querySelector(".btn-dec"),orip:e.querySelector(".zd-orip"),crip:e.querySelector(".zd-crip"),ofac:e.querySelector(".zd-ofac"),cfac:e.querySelector(".zd-cfac"),ph:e.querySelector(".zd-ph"),fault:e.querySelector(".zd-fault"),faultVal:e.querySelector(".zd-fault-val")};o.inc.onclick=()=>t.incSetpoint(),o.dec.onclick=()=>t.decSetpoint(),o.toggle.onclick=()=>t.toggleEnabled();let r=()=>t.update(e,o),n=a=>{let s=F("selectedZone");(a===c.temp(s)||a===c.setpoint(s)||a===c.valve(s)||a===c.state(s)||a===c.enabled(s))&&r()};for(let a=1;a<=6;a++)w(c.temp(a),n),w(c.setpoint(a),n),w(c.baseSetpoint(a),n),w(c.effectiveSetpoint(a),n),w(c.coordinatorOffset(a),n),w(c.valve(a),n),w(c.state(a),n),w(c.enabled(a),n),w(c.motorOpenRipples(a),r),w(c.motorCloseRipples(a),r),w(c.motorOpenFactor(a),r),w(c.motorCloseFactor(a),r),w(c.preheatAdvance(a),r),w(c.motorLastFault(a),r);w("sensor-manifold_return_temperature",r),$("selectedZone",r),_(e),r()}});var qr=`
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
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-color: var(--accent);
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
  background: rgba(var(--accent-rgb),.10);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
`;D("zone-sensor-card",qr);var Ir=()=>{let t='<option value="None" data-i18n="common.none">None</option>';for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature and coordination</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.returnSensor">Return temperature sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${t}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.tempSource">Room temperature source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section" data-i18n="zone.sensor.bleSensor">BLE sensor</div>
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
    </div>
  `};function _o(t,e){let o=t.value,r='<option value="None" data-i18n="common.none">'+h("common.none")+"</option>";for(let n=1;n<=6;n++)n!==e&&(r+='<option value="Zone '+n+'">'+h("common.zone")+" "+n+"</option>");t.innerHTML=r,t.value=o||"None"}function $r(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Zr(t){return t==="BLE Sensor"?"BLE":"Local Probe"}function Lo(t,e){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+h("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+h("zone.sensor.bleSource")+"</option>";t.innerHTML!==o&&(t.innerHTML=o),t.value=e}var fi=R({tag:"zone-sensor-card",render:Ir,onMount(t,e){let o=e.querySelector(".zs-probe"),r=e.querySelector(".zs-source"),n=e.querySelector(".zs-ble"),a=e.querySelector(".zs-sync"),s=e.querySelector(".zs-row-ble"),l=e.querySelector(".zs-scan"),b=e.querySelector(".zs-scan-list"),g=0;function u(){return F("selectedZone")}function x(){s.style.display=r.value==="BLE Sensor"?"":"none"}let m=ae(e);Lo(r,"Local Probe"),m.select(o,{read:()=>C(c.probe(u()))||void 0,commit:d=>Ze(u(),"zone_probe",d)}),m.select(r,{read:()=>$r(String(C(c.tempSource(u()))||"")),commit:d=>Ze(u(),"zone_temp_source",Zr(d))}),m.select(a,{read:()=>C(c.syncTo(u()))||"None",commit:d=>Ze(u(),"zone_sync_to",d)});let v=m.text(n,{read:()=>C(c.ble(u()))||"",commit:d=>it(u(),"zone_ble_mac",d)});r.addEventListener("change",x);function p(){let d=u();g!==d?(_o(a,d),g=d,b.style.display="none",m.discard()):m.refresh(),x()}function y(d){let z=u();(d===c.probe(z)||d===c.tempSource(z)||d===c.syncTo(z)||d===c.ble(z)||/^select-zone_\d+_sync_to$/.test(d))&&(m.refresh(),x())}l.addEventListener("click",()=>{if(l.disabled)return;l.disabled=!0,l.textContent="\u2026",b.style.display="",b.innerHTML='<div class="scan-msg">'+h("zone.sensor.scanning")+"</div>";let d=new AbortController,z=setTimeout(()=>d.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:d.signal}).then(S=>{if(!S.ok)throw new Error("HTTP "+S.status);return S.json()}).then(S=>{if(clearTimeout(z),l.disabled=!1,l.textContent=h("zone.sensor.scan"),!S.ok||!S.sensors||S.sensors.length===0){b.innerHTML='<div class="scan-msg">'+h("zone.sensor.noSensors")+"</div>";return}let k=u(),A=(C(c.ble(k))||"").toUpperCase(),M=q=>String(q).replace(/[&<>"']/g,O=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[O]),N="";for(let q of S.sensors){let O=q.mac.toUpperCase(),T=q.name?M(q.name):"",W=q.temp_c!=null?q.temp_c.toFixed(1)+"\xB0C":"\u2014",K=q.rssi!=null?q.rssi+" dBm":"",Q=q.age_s<60?h("common.secondsAgo",{value:q.age_s}):h("common.minutesAgo",{value:Math.round(q.age_s/60)}),V="";O===A?V='<span class="ble-badge">'+h("zone.sensor.assignedThisZone")+"</span>":q.zone>0&&(V='<span class="ble-badge">'+h("zone.sensor.zoneBadge",{zone:q.zone})+"</span>");let Me=T?`<div class="ble-mac">${T}</div><div class="ble-meta">${O}</div>`:`<div class="ble-mac">${O}</div>`;N+=`<div class="ble-scan-item">
              <div>
                ${Me}
                <div class="ble-meta">${W} &nbsp;${K} &nbsp;${Q}</div>
                ${V}
              </div>
              <button class="btn-assign" data-mac="${O}">${h("zone.sensor.assign")}</button>
            </div>`}b.innerHTML=N,b.querySelectorAll(".btn-assign").forEach(q=>{q.addEventListener("click",()=>{n.value=q.dataset.mac,v.markDirty(),b.style.display="none"})})}).catch(S=>{clearTimeout(z),l.disabled=!1,l.textContent=h("zone.sensor.scan");let k=S&&S.name==="AbortError"?h("zone.sensor.scanTimeout"):h("zone.sensor.scanFailed");b.innerHTML='<div class="scan-msg">'+k+"</div>"})}),$("selectedZone",p);for(let d=1;d<=6;d++)w(c.probe(d),y),w(c.tempSource(d),y),w(c.syncTo(d),y),w(c.ble(d),y);_(e),p()}});var Br=".zone-room-card { height: 100%; }";D("zone-room-card",Br);var Vr=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,ki=R({tag:"zone-room-card",render:Vr,onMount(t,e){let o=e.querySelector(".zr-friendly");function r(){return F("selectedZone")}let n=ae(e);n.text(o,{read:()=>ue(r())||"",commit:a=>qt(r(),a)}),$("selectedZone",n.discard),$("zoneNames",n.refresh),_(e),n.refresh()}});var ie=6,jr="var(--flow-disabled)",Mo="var(--flow-unknown)",Ao="var(--accent)",De="var(--flow-return)",zt="var(--text-strong)",Wr="var(--flow-disabled)",ye="var(--flow-label)",Qe="var(--flow-disabled)",wt="var(--flow-label)",To="var(--flow-label)",Co="var(--flow-return)",Ur="#66BB6A",Xr="#FF6361",Z={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},E={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},Gr=`
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

.flow-track {
  fill: none;
  stroke: var(--flow-track);
  stroke-width: 2.25;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  transition: opacity .25s ease, stroke-dasharray .25s ease;
}

.flow-metric {
  font-family: var(--mono);
  font-weight: 800;
}

@media (max-width: 760px) {
  .flow-svg-desktop { display: none; }
  .flow-svg-mobile { display: block; }
}
`;D("flow-diagram",Gr);function Kr(t,e){let o=String(ue(t)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>e?r.slice(0,Math.max(1,e-1))+"\u2026":r}function Yr(t){if(!t)return null;let e=String(t).match(/(\d+)/);if(!e)return null;let o=Number(e[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Jr(t,e){return e?t==null||Number.isNaN(t)?Mo:t>0?Ao:ye:jr}function Fo(t){let e=t==="desktop"?"0 1":"1 0",o=[];o.push("<defs>");for(let r=1;r<=ie;r++)o.push('<linearGradient id="'+t+"-rg"+r+'" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'">'),o.push('<stop id="'+t+"-rgs"+r+'" offset="0%" stop-color="var(--accent)" stop-opacity=".96"/>'),o.push('<stop id="'+t+"-rga"+r+'" offset="100%" stop-color="var(--accent)" stop-opacity=".7"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function Qr(t){let e=Z.boxX+Z.boxW/2+(t-2.5)*Z.srcSpread,o=Z.zoneXs[t];return"M"+e.toFixed(1)+" "+Z.srcY+" C"+e.toFixed(1)+" "+Z.fanY+" "+o.toFixed(1)+" "+(Z.fanY+34)+" "+o.toFixed(1)+" "+(Z.zoneY-20)}function ea(t){let e=E.midY+(t-2.5)*E.spread,o=E.zoneYs[t],r=E.endX-E.srcX;return"M"+E.srcX+" "+e.toFixed(1)+" C"+(E.srcX+r*.34)+" "+e.toFixed(1)+" "+(E.srcX+r*.7)+" "+o.toFixed(1)+" "+E.endX+" "+o.toFixed(1)}function Eo(t,e,o){let r=Z.boxX+Z.boxW/2+(t-2.5)*Z.srcSpread,n=Z.srcY,a=Z.zoneXs[t],s=Z.zoneY-20,l=Z.fanY,b=Z.fanY+34;return"M"+(r-e).toFixed(1)+" "+n+" C"+(r-e).toFixed(1)+" "+l+" "+(a-o).toFixed(1)+" "+b+" "+(a-o).toFixed(1)+" "+s+" L"+(a+o).toFixed(1)+" "+s+" C"+(a+o).toFixed(1)+" "+b+" "+(r+e).toFixed(1)+" "+l+" "+(r+e).toFixed(1)+" "+n+"Z"}function No(t,e,o){let r=E.midY+(t-2.5)*E.spread,n=E.zoneYs[t],a=E.endX-E.srcX,s=E.srcX+a*.34,l=E.srcX+a*.7;return"M"+E.srcX+" "+(r-e).toFixed(1)+" C"+s+" "+(r-e).toFixed(1)+" "+l+" "+(n-o).toFixed(1)+" "+E.endX+" "+(n-o).toFixed(1)+" L"+E.endX+" "+(n+o).toFixed(1)+" C"+l+" "+(n+o).toFixed(1)+" "+s+" "+(r+e).toFixed(1)+" "+E.srcX+" "+(r+e).toFixed(1)+"Z"}function Do(t,e,o){return'<rect width="'+t+'" height="'+e+'" rx="10" fill="var(--surface-raised)"/>'}function Ro(t){let e=t==="desktop"?Z:E,o=t==="desktop"?e.boxY+27:e.boxY+29,r=t==="desktop"?e.boxY+56:e.boxY+58;return'<rect x="'+e.boxX+'" y="'+e.boxY+'" width="'+e.boxW+'" height="'+e.boxH+'" rx="7" fill="var(--flow-source-bg)" stroke="var(--accent)" stroke-width="2"/><text id="'+t+'-fd-flow-label" x="'+(e.boxX+e.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(t==="desktop"?20:19)+'" font-weight="800" fill="var(--accent)" letter-spacing="2">'+h("overview.flowDiagram.flow")+'</text><text id="'+t+'-fd-flow-temp" class="flow-metric" x="'+(e.boxX+e.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(t==="desktop"?29:27)+'" fill="var(--text-strong)">---</text>'}function ta(){let t=[],e=Z.w,o=Z.h,r=Z.zoneY-20;t.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+e+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(Fo("desktop")),t.push(Do(e,o,"desktop")),t.push(Ro("desktop")),t.push('<text id="desktop-fd-ret-temp" x="'+(Z.boxX+Z.boxW+24)+'" y="'+(Z.boxY+20)+'" font-size="17" font-weight="800" fill="'+De+'" font-family="var(--mono)">'+h("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="desktop-fd-dt-label" x="'+(Z.boxX+Z.boxW+24)+'" y="'+(Z.boxY+42)+'" font-size="13" font-weight="800" fill="'+To+'" letter-spacing="2">'+h("overview.flowDiagram.dt")+"</text>"),t.push('<text id="desktop-fd-dt" x="'+(Z.boxX+Z.boxW+24)+'" y="'+(Z.boxY+66)+'" class="flow-metric" font-size="24" fill="var(--accent)">---</text>');for(let n=1;n<=ie;n++)t.push('<path id="desktop-fd-track-'+n+'" class="flow-track" d="'+Qr(n-1)+'" opacity=".7"/>');for(let n=1;n<=ie;n++)t.push('<path id="desktop-fd-path-'+n+'" class="flow-ribbon" d="'+Eo(n-1,Z.srcHW,Z.bgDstHW)+'" fill="url(#desktop-rg'+n+')" opacity="1"/>');t.push('<line x1="54" y1="'+r+'" x2="'+(e-54)+'" y2="'+r+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');for(let n=1;n<=ie;n++){let a=Z.zoneXs[n-1];t.push('<g class="flow-zone-hit">'),t.push('<line id="desktop-fd-tick-'+n+'" x1="'+a+'" y1="'+(r-8)+'" x2="'+a+'" y2="'+(r+8)+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="desktop-fd-zn'+n+'" x="'+a+'" y="'+(r-13)+'" text-anchor="middle" font-size="15" fill="'+zt+'" font-weight="800" letter-spacing="1.5">Z'+n+"</text>"),t.push('<text id="desktop-fd-zf'+n+'" x="'+a+'" y="'+(r+21)+'" text-anchor="middle" font-size="11.5" fill="'+ye+'" font-weight="700" letter-spacing=".55">---</text>'),t.push('<text id="desktop-fd-zsp'+n+'" x="'+a+'" y="'+(r+21)+'" text-anchor="middle" font-size="10.5" fill="'+Qe+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="desktop-fd-zt'+n+'" x="'+a+'" y="'+(r+44)+'" text-anchor="middle" class="flow-metric" font-size="17" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="desktop-fd-zv'+n+'" x="'+(a-30)+'" y="'+(r+64)+'" text-anchor="middle" class="flow-metric" font-size="14" fill="'+ye+'">---%</text>'),t.push('<text id="desktop-fd-zr'+n+'" x="'+(a+30)+'" y="'+(r+64)+'" text-anchor="middle" class="flow-metric" font-size="14" fill="'+De+'">---</text>'),t.push("</g>")}return t.push("</svg>"),t.join("")}function oa(){let t=[],e=E.w,o=E.h;t.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+e+" "+o+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(Fo("mobile")),t.push(Do(e,o,"mobile")),t.push(Ro("mobile"));for(let r=1;r<=ie;r++)t.push('<path id="mobile-fd-track-'+r+'" class="flow-track" d="'+ea(r-1)+'" opacity=".7"/>');for(let r=1;r<=ie;r++)t.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+No(r-1,E.srcHW,E.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');t.push('<rect x="'+(E.boxX+9)+'" y="'+(E.boxY+E.boxH+9)+'" width="'+(E.boxW-18)+'" height="60" rx="8" fill="var(--flow-source-bg)" stroke="var(--flow-return)" stroke-opacity=".7"/>'),t.push('<text id="mobile-fd-ret-temp" x="'+(E.boxX+E.boxW/2)+'" y="'+(E.boxY+E.boxH+27)+'" text-anchor="middle" font-size="14" font-weight="800" fill="'+De+'" font-family="var(--mono)">'+h("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="mobile-fd-dt-label" x="'+(E.boxX+E.boxW/2)+'" y="'+(E.boxY+E.boxH+43)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="'+To+'" letter-spacing="1.1">'+h("overview.flowDiagram.dt")+"</text>"),t.push('<text id="mobile-fd-dt" x="'+(E.boxX+E.boxW/2)+'" y="'+(E.boxY+E.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="var(--accent)">---</text>'),t.push('<line x1="'+E.endX+'" y1="34" x2="'+E.endX+'" y2="'+(o-34)+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>'),t.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="12" fill="'+wt+'" font-weight="700" letter-spacing="1.2">'+h("overview.graph.layers.temp").toUpperCase()+"</text>"),t.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="12" fill="'+wt+'" font-weight="700" letter-spacing="1.2">'+h("overview.flowDiagram.flow")+"</text>"),t.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="12" fill="'+wt+'" font-weight="700" letter-spacing="1.2">'+h("overview.flowDiagram.returnShort")+"</text>");for(let r=1;r<=ie;r++){let n=E.zoneYs[r-1];t.push('<line id="mobile-fd-tick-'+r+'" x1="'+(E.endX-8)+'" y1="'+n+'" x2="'+(E.endX+8)+'" y2="'+n+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="mobile-fd-zn'+r+'" x="'+(E.endX-14)+'" y="'+(n+5)+'" text-anchor="end" font-size="14" fill="'+zt+'" font-weight="800" letter-spacing="1.2">Z'+r+"</text>"),t.push('<text id="mobile-fd-zf'+r+'" x="'+E.nameX+'" y="'+(n-8)+'" text-anchor="middle" font-size="10.5" fill="'+ye+'" font-weight="700" letter-spacing=".5">---</text>'),t.push('<text id="mobile-fd-zsp'+r+'" x="'+E.nameX+'" y="'+(n+8)+'" text-anchor="middle" font-size="10" fill="'+Qe+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(n+5)+'" class="flow-metric" font-size="15" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(n+5)+'" class="flow-metric" font-size="15" fill="'+ye+'">---%</text>'),t.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(n+5)+'" class="flow-metric" font-size="15" fill="'+De+'">---</text>')}return t.push("</svg>"),t.join("")}var ra=()=>'<div class="flow-wrap" role="img" aria-label="'+h("overview.flowDiagram.flow")+'">'+ta()+oa()+"</div>";R({tag:"flow-diagram",render:ra,onMount(t,e){let o=["desktop","mobile"],r={};o.forEach(g=>{r[g]={flowEl:e.querySelector("#"+g+"-fd-flow-temp"),flowLabelEl:e.querySelector("#"+g+"-fd-flow-label"),retEl:e.querySelector("#"+g+"-fd-ret-temp"),dtLabelEl:e.querySelector("#"+g+"-fd-dt-label"),dtEl:e.querySelector("#"+g+"-fd-dt"),zones:new Array(ie+1)};for(let u=1;u<=ie;u++)r[g].zones[u]={textTemp:e.querySelector("#"+g+"-fd-zt"+u),textSetpoint:e.querySelector("#"+g+"-fd-zsp"+u),textFlow:e.querySelector("#"+g+"-fd-zv"+u),textRet:e.querySelector("#"+g+"-fd-zr"+u),label:e.querySelector("#"+g+"-fd-zn"+u),friendly:e.querySelector("#"+g+"-fd-zf"+u),track:e.querySelector("#"+g+"-fd-track-"+u),tick:e.querySelector("#"+g+"-fd-tick-"+u),path:e.querySelector("#"+g+"-fd-path-"+u)}});function n(g,u){g&&(g.textContent=u)}function a(g,u,x,m,v){let p=r[g];n(p.flowLabelEl,h("overview.flowDiagram.flow")),n(p.flowEl,j(u)),n(p.retEl,h("overview.flowDiagram.returnShort")+" "+j(x)),n(p.dtLabelEl,h("overview.flowDiagram.dt")),n(p.dtEl,m==null?"---":m.toFixed(1)+"\xB0C"),p.dtEl&&p.dtEl.setAttribute("fill",v)}function s(){n(e.querySelector("#mobile-fd-temp-head"),h("overview.graph.layers.temp").toUpperCase()),n(e.querySelector("#mobile-fd-flow-head"),h("overview.flowDiagram.flow")),n(e.querySelector("#mobile-fd-ret-head"),h("overview.flowDiagram.returnShort"))}function l(g,u,x){let m=r[g].zones[u];if(!m)return;let{enabled:v,pct:p,temp:y,setpoint:d,valve:z,returnTemp:S,hasReturn:k}=x,A=Kr(u,g==="desktop"?11:12),M=j(y),N=d!=null?j(d):"";n(m.label,"Z"+u),n(m.friendly,g==="desktop"?(A||"---")+(N?" ("+N+")":""):A||"---"),n(m.textTemp,M),n(m.textSetpoint,g==="desktop"?"":N?"("+N+")":""),n(m.textFlow,Se(z)),n(m.textRet,k?j(S):"---"),m.label.setAttribute("fill",v?zt:Wr),m.friendly.setAttribute("fill",v?ye:Qe),m.textSetpoint.setAttribute("fill",v?ye:Qe),m.textFlow.setAttribute("fill",Jr(p,v)),m.textRet.setAttribute("fill",k&&v?De:Mo);let q=v&&p!=null&&p>0;m.track.setAttribute("opacity",v?".78":".38"),m.track.setAttribute("stroke-dasharray",v?"none":"5 7"),m.tick.setAttribute("stroke",q?Ao:"var(--flow-track)"),m.tick.setAttribute("stroke-width",q?"3":"2");let O=m.path;if(!q)O.setAttribute("opacity","0");else{let T=g==="desktop"?Z:E,W=Math.max(2.5,p*T.bgDstHW),K=Math.max(1.3,p*T.srcHW);O.setAttribute("d",g==="desktop"?Eo(u-1,K,W):No(u-1,K,W)),O.setAttribute("fill","url(#"+g+"-rg"+u+")"),O.setAttribute("opacity",".96")}}function b(){let g=L(i.flow),u=L(i.ret),x=g!=null&&u!=null?Number(g)-Number(u):null,m=x==null||x<3?Co:x>8?Xr:Ur;o.forEach(v=>a(v,g,u,x,m));for(let v=1;v<=ie;v++){let p=L(c.temp(v)),y=L(c.setpoint(v)),d=L(c.valve(v)),z=X(c.enabled(v)),S=String(C(c.tempSource(v))||"Local Probe"),k=Yr(C(c.probe(v))||""),A=k?L(c.probeTemp(k)):null,M=S!=="Local Probe"&&A!=null&&!Number.isNaN(Number(A)),N=d!=null?Math.max(0,Math.min(100,Number(d)))/100:null,q={enabled:z,pct:N,temp:p,setpoint:y,valve:d,returnTemp:A,hasReturn:M};o.forEach(O=>l(O,v,q))}}w(i.flow,b),w(i.ret,b),$("zoneNames",b);for(let g=1;g<=ie;g++)w(c.temp(g),b),w(c.setpoint(g),b),w(c.valve(g),b),w(c.enabled(g),b),w(c.probe(g),b),w(c.tempSource(g),b);for(let g=1;g<=8;g++)w(c.probeTemp(g),b);s(),b()}});var aa={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},na=`
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
  background:var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  cursor: pointer;
}
.logs-view .btn:hover { color: var(--text-strong); background: var(--control-bg-hover); }
.logs-view .btn.on { color: var(--text-on-accent); border-color: var(--accent); background: var(--accent); }

.logs-stream {
  margin-top: 4px;
  height: 420px;
  overflow-y: auto;
  border-radius: 8px;
  background:rgba(0,0,0,.14);
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
`;D("logs-view",na);var ia=()=>`
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
`;function sa(t){let e=aa[t.level]||{label:"?",color:"var(--text-secondary)"},o=Po(t.tag||""),r=Po(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function Po(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var Ri=R({tag:"logs-view",render:ia,onMount(t,e){let o=e.querySelector(".logs-stream"),r=e.querySelector(".pause-btn"),n=e.querySelector(".clear-btn"),a=!1;function s(){if(a)return;let l=Mt();if(!l||!l.length){o.innerHTML='<div class="logs-empty">'+h("logs.waiting")+"</div>";return}let b=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=l.map(sa).join(""),b&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{a=!a,r.textContent=a?h("logs.resume"):h("logs.pause"),r.classList.toggle("on",a),a||s()}),n.addEventListener("click",()=>{At()}),$("deviceLog",s),_(e),s()}});var la=`
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
  background:rgba(0,0,0,.14);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.diag-i2c .btn-row { margin-top: 12px; }
.diag-i2c .btn { min-height:44px;padding:7px 14px;border-radius:8px;border:1px solid var(--control-border);background:var(--control-bg);color:var(--text-strong);font-weight:650;cursor:pointer; }
.diag-i2c .btn:hover { background:var(--control-bg-hover);border-color:var(--control-border-hover); }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;D("diag-i2c",la);var da=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,Zi=R({tag:"diag-i2c",render:da,onMount(t,e){let o=e.querySelector("#i2c-result");function r(){o.textContent=F("i2cResult")||h("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Pt()}),$("i2cResult",r),_(e),r()}});var ca=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--danger-border-soft);
  background: var(--danger-bg);
  border-radius: 8px;
  padding: 10px 12px;
}

.diag-manual-badge.on {
  display: flex;
}

.diag-manual-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--state-danger);
}

.diag-manual-text {
  color: var(--danger-text);
  font-size: .8rem;
  font-weight:650;
}
`;D("diag-manual-badge",ca);var pa=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Xi=R({tag:"diag-manual-badge",render:pa,onMount(t,e){let o=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function r(){let n=!!F("manualMode");o&&o.classList.toggle("on",n)}$("manualMode",r),_(e),r()}});var ua=`
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
`;D("diag-zone-motor",ua);var ma=t=>{let e=t.zone||F("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===e?" selected":"")+">"+h("common.zone")+" "+r+"</option>";return`
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
  `},os=R({tag:"diag-zone-motor-card",render:ma,onMount(t,e){let o=Number(t.zone||F("selectedZone")||1),r=!!F("manualMode"),n=e.querySelector(".manual-mode-toggle"),a=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),l=e.querySelector(".motor-target-input"),b=e.querySelector(".motor-open-btn"),g=e.querySelector(".motor-close-btn"),u=e.querySelector(".motor-stop-btn"),x=()=>{let y=s.value||String(o),d="";for(let z=1;z<=6;z++)d+='<option value="'+z+'">'+h("common.zone")+" "+z+"</option>";s.innerHTML=d,s.value=y};function m(y){r=!!y,n&&(n.classList.toggle("on",r),n.setAttribute("aria-checked",r?"true":"false")),a&&a.classList.toggle("locked",!r),[s,l,b,g,u].forEach(d=>{d&&(d.disabled=!r)})}function v(){let y=!r;if(m(y),y){lt(!0);for(let d=1;d<=6;d++)st(d)}else lt(!1)}function p(){let y=L(c.motorTarget(o));l&&y!=null?l.value=Number(y).toFixed(0):l&&(l.value="0")}s==null||s.addEventListener("change",()=>{o=Number(s.value||1),p()}),n==null||n.addEventListener("click",v),n==null||n.addEventListener("keydown",y=>{y.key!==" "&&y.key!=="Enter"||(y.preventDefault(),v())});for(let y=1;y<=6;y++)w(c.motorTarget(y),p);p(),m(r),$("manualMode",()=>{m(!!F("manualMode"))}),_(e),l==null||l.addEventListener("change",y=>{if(!r)return;let d=y.target.value;It(o,d)}),b==null||b.addEventListener("click",()=>{r&&$t(o,1e4)}),g==null||g.addEventListener("click",()=>{r&&Zt(o,1e4)}),u==null||u.addEventListener("click",()=>{r&&st(o)})}});var ga=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
}
.diag-zone-recovery .card-title {
  font-size: .95rem;
  font-weight: 650;
  color: var(--text-strong);
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
.diag-zone-recovery .recovery-actions{border-top:1px solid var(--separator)}.diag-zone-recovery .recovery-action{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px;min-height:66px;padding:10px 0;border-bottom:1px solid var(--separator)}.diag-zone-recovery .recovery-action:last-child{border-bottom:0}.diag-zone-recovery .recovery-copy strong{display:block;color:var(--text-strong);font-size:.88rem;font-weight:600}.diag-zone-recovery .recovery-copy span{display:block;margin-top:3px;color:var(--text-muted);font-size:.76rem}
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
  min-width: 150px;
  min-height:44px;
  padding: 8px 14px;
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
@media(max-width:620px){.diag-zone-recovery .recovery-action{grid-template-columns:1fr}.diag-zone-recovery .btn{width:100%}}
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
`;D("diag-zone-recovery",ga);var fa=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title" data-i18n="diagnostics.recovery.title">Motor recovery</div>
      <div class="recovery-note" data-i18n="diagnostics.recovery.note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="recovery-actions"><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.clearFaultTitle">Clear current fault</strong><span data-i18n="diagnostics.recovery.clearFaultHelp">Acknowledge the current motor fault without changing learned values.</span></div><button class="btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Clear fault</button></div><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.resetFactorsTitle">Reset learned factors</strong><span data-i18n="diagnostics.recovery.resetFactorsHelp">Remove calibration values while leaving the valve stopped.</span></div><button class="btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset factors\u2026</button></div><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.relearnTitle">Reset and relearn</strong><span data-i18n="diagnostics.recovery.relearnHelp">Reset calibration and start a complete motor learning cycle.</span></div><button class="btn warn recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset and relearn\u2026</button></div></div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,ds=R({tag:"diag-zone-recovery-card",render:fa,onMount(t,e){let o=Number(F("selectedZone")||1),r=e.querySelector(".recovery-fault-btn"),n=e.querySelector(".recovery-factors-btn"),a=e.querySelector(".recovery-relearn-btn"),s=e.querySelector(".recovery-status");$("selectedZone",()=>{o=Number(F("selectedZone")||1)});let l=null;function b(u,x){s.textContent=u,s.className="recovery-status show "+(x?"ok":"err"),clearTimeout(l),l=setTimeout(()=>{s.classList.remove("show")},4e3)}function g(u,x){let m=u(o);b(x,!0),m&&typeof m.then=="function"&&m.then(v=>{v&&v.ok===!1&&b(h("diagnostics.recovery.rejected"),!1)}).catch(()=>b(h("diagnostics.recovery.unreachable"),!1))}r==null||r.addEventListener("click",()=>{g(Bt,"\u2713 "+h("diagnostics.recovery.faultSent",{zone:re(o)}))}),n==null||n.addEventListener("click",()=>{confirm(h("diagnostics.recovery.confirmFactors",{zone:re(o)}))&&g(Vt,"\u2713 "+h("diagnostics.recovery.factorsReset",{zone:re(o)}))}),a==null||a.addEventListener("click",()=>{confirm(h("diagnostics.recovery.confirmRelearn",{zone:re(o)}))&&g(jt,"\u2713 "+h("diagnostics.recovery.relearnStarted",{zone:re(o)}))}),_(e)}});var ba=`
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
.diag-system-card .sys-value.warn { color:var(--state-danger); }
.diag-system-card .sys-bar {
  height: 4px; border-radius: 3px; margin-top: 6px;
  background: var(--control-bg-hover); overflow: hidden;
}
.diag-system-card .sys-bar > i {
  display: block; height: 100%; width: 0%;
  background:var(--accent);
  transition: width .4s ease;
}
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;D("diag-system-card",ba);var va=()=>`
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
`,vs=R({tag:"diag-system-card",render:va,onMount(t,e){let o=e.querySelector('[data-k="cpu0"]'),r=e.querySelector('[data-k="cpu1"]'),n=e.querySelector('[data-k="heap"]'),a=e.querySelector('[data-k="psram"]'),s=e.querySelector('[data-bar="cpu0"]'),l=e.querySelector('[data-bar="cpu1"]'),b=(x,m,v)=>{if(v==null||!Number.isFinite(Number(v))){x.textContent="\u2014",x.classList.remove("warn"),m.style.width="0%";return}let p=Math.max(0,Math.min(100,Number(v)));x.textContent=p.toFixed(0)+"%",x.classList.toggle("warn",p>=90),m.style.width=p+"%"},g=(x,m,v)=>{if(m==null||!Number.isFinite(Number(m))){x.textContent="\u2014";return}let p=Number(m);x.textContent=p+" KB",x.classList.toggle("warn",v!=null&&p<v)},u=()=>{b(o,s,L(i.cpuLoadCore0)),b(r,l,L(i.cpuLoadCore1)),g(n,L(i.freeInternalKb),48),g(a,L(i.freePsramKb),null)};e.querySelector(".sys-dump").addEventListener("click",()=>{Wt().catch(x=>console.error("[System] dump failed:",x))}),w(i.cpuLoadCore0,u),w(i.cpuLoadCore1,u),w(i.freeInternalKb,u),w(i.freePsramKb,u),_(e),u()}});var ha=`
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
`;D("settings-manifold-card",ha);var xa=()=>{let t="";for(let o=1;o<=8;o++)t+="<option>Probe "+o+"</option>";let e="";for(let o=1;o<=8;o++)e+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${me("settings.manifold.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.type">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)" data-i18n="settings.manifold.normallyOpen">Normally Open (NO)</option><option value="NC (Normally Closed)" data-i18n="settings.manifold.normallyClosed">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.flowProbe">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${t}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.returnProbe">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${t}</select></span>
      </div>
      <div class="ui-section" data-i18n="settings.manifold.probeTemps">Probe Temperatures</div>
      <div class="probe-grid">${e}</div>
    </div>
  `},Cs=R({tag:"settings-manifold-card",render:xa,onMount(t,e){let o=e.querySelector(".sm-type"),r=e.querySelector(".sm-flow"),n=e.querySelector(".sm-ret"),a=ae(e);a.select(o,{read:()=>C(i.manifoldType)||"NO (Normally Open)",commit:l=>se("manifold_type",l)}),a.select(r,{read:()=>C(i.manifoldFlowProbe)||"Probe 7",commit:l=>se("manifold_flow_probe",l)}),a.select(n,{read:()=>C(i.manifoldReturnProbe)||"Probe 8",commit:l=>se("manifold_return_probe",l)});function s(){for(let l=1;l<=8;l++){let b=e.querySelector('[data-probe="'+l+'"]');b&&(b.textContent=j(L(c.probeTemp(l))))}}w(i.manifoldType,a.refresh),w(i.manifoldFlowProbe,a.refresh),w(i.manifoldReturnProbe,a.refresh);for(let l=1;l<=8;l++)w(c.probeTemp(l),s);_(e),a.refresh(),s()}});var ya=`
.settings-touch-card .touch-status{display:flex;align-items:flex-start;gap:10px;padding:10px 0 16px;color:var(--text-secondary);font-size:.9rem;line-height:1.45}
.settings-touch-card .touch-status-dot{flex:0 0 auto;width:8px;height:8px;margin-top:6px;border-radius:50%;background:var(--state-disabled)}
.settings-touch-card .touch-status.connected .touch-status-dot{background:var(--state-ok)}
.settings-touch-card .touch-status.pending .touch-status-dot{background:var(--accent)}
.settings-touch-card .touch-status strong{display:block;color:var(--text-strong);font-size:.95rem}
.settings-touch-card .touch-identity{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}
.settings-touch-card .touch-identity[hidden]{display:none!important}
.settings-touch-card .touch-identity>div{min-width:0;padding:14px 0}
.settings-touch-card .touch-identity>div:nth-child(even){padding-left:18px;border-left:1px solid var(--separator)}
.settings-touch-card .touch-identity dt{color:var(--text-faint);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}
.settings-touch-card .touch-identity dd{margin:5px 0 0;color:var(--text-strong);font-weight:650;overflow-wrap:anywhere}
.settings-touch-card .touch-note{margin:14px 0 0;color:var(--text-faint);font-size:.82rem;line-height:1.5}
.settings-touch-card .touch-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.settings-touch-card .touch-approve{border-color:var(--accent);background:var(--accent);color:var(--text-on-accent)}
.settings-touch-card .touch-disconnect{border-color:var(--danger-border);color:var(--danger-text)}
.settings-touch-card .touch-error{min-height:1.1em;margin:10px 0 0;color:var(--state-danger);font-size:.82rem}
@media(max-width:620px){.settings-touch-card .touch-identity{grid-template-columns:1fr}.settings-touch-card .touch-identity>div:nth-child(even){padding-left:0;border-left:0}}
`;D("settings-touch-card",ya);var wa=()=>`
  <div class="ui-card settings-touch-card">
    <div class="ui-card-title"><span class="ui-title-text">Lune Touch connection</span></div>
    <div class="touch-status" role="status" aria-live="polite"><span class="touch-status-dot" aria-hidden="true"></span><span class="touch-status-copy"></span></div>
    <dl class="touch-identity" hidden>
      <div><dt>Touch</dt><dd class="touch-name">Lune Touch</dd></div>
      <div><dt>Site</dt><dd class="touch-site">\u2014</dd></div>
      <div><dt>Installation</dt><dd class="touch-installation-value">\u2014</dd></div>
      <div><dt>Coordinator</dt><dd class="touch-coordinator-value">\u2014</dd></div>
    </dl>
    <p class="touch-note"></p>
    <p class="touch-error" role="alert"></p>
    <div class="touch-actions"><button class="ui-btn touch-disconnect" type="button">Disconnect Touch</button><button class="ui-btn touch-approve" type="button">Approve Lune Touch</button></div>
  </div>`,Ds=R({tag:"settings-touch-card",render:wa,onMount(t,e){let o=e.querySelector(".touch-status"),r=e.querySelector(".touch-status-copy"),n=e.querySelector(".touch-identity"),a=e.querySelector(".touch-note"),s=e.querySelector(".touch-error"),l=e.querySelector(".touch-approve"),b=e.querySelector(".touch-disconnect");function g(){let u=X(i.authorityConfigured),x=X(i.authorityProposalPending),m=C(i.authorityState)||"unconfigured",v=x?C(i.authorityProposalInstallationId):C(i.authorityInstallationId),p=x?C(i.authorityProposalCoordinatorId):C(i.authorityCoordinatorId),y=C(i.authorityProposalName)||"Lune Touch",d=C(i.authorityProposalSite)||"House";o.classList.toggle("connected",u&&!x),o.classList.toggle("pending",x),r.innerHTML=x?`<strong>${y} is ready to connect</strong>${u?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:u?`<strong>Control approved</strong>${m.replace(/_/g," ")}${Number(L(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(L(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",n.hidden=!u&&!x,e.querySelector(".touch-name").textContent=x?y:"Lune Touch",e.querySelector(".touch-site").textContent=x?d:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=v||"\u2014",e.querySelector(".touch-coordinator-value").textContent=p||"\u2014",a.textContent=x?"Approval is local to this manifold. Discovery alone never grants control.":u?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",l.hidden=!x,b.hidden=!u||x}l.addEventListener("click",async()=>{s.textContent="",l.disabled=!0,l.textContent="Approving\u2026";try{await Ot()}catch(u){s.textContent=(u==null?void 0:u.message)||"Unable to approve Lune Touch."}finally{l.disabled=!1,l.textContent="Approve Lune Touch"}}),b.addEventListener("click",async()=>{if(s.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){b.disabled=!0;try{await Ht()}catch(u){s.textContent=(u==null?void 0:u.message)||"Unable to disconnect Lune Touch."}finally{b.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(u=>w(u,g)),g()}});var za=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${me("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`,Zs=R({tag:"settings-minimum-flow-card",render:za,onMount(t,e){let o=e.querySelector(".smf-always"),r=e.querySelector(".smf-pct"),n=e.querySelector(".smf-pct-row"),a=ae(e),s=l=>{n.hidden=!l,n.setAttribute("aria-hidden",l?"false":"true"),r.disabled=!l};a.toggle(o,{read:()=>X(i.minimumFlowAlways),onChange:s,commit:l=>{let b=l?"on":"off";f(i.minimumFlowAlways,{state:b}),se("minimum_flow_always",b).catch(()=>f(i.minimumFlowAlways,{state:l?"off":"on"}))}}),a.num(r,{read:()=>L(i.minZoneFlowPct),commit:l=>{f(i.minZoneFlowPct,{value:l}),le("min_zone_flow_pct",l)}}),w(i.minimumFlowAlways,a.refresh),w(i.minZoneFlowPct,a.refresh),_(e),a.refresh()}});var ka=`
.settings-card{background:var(--surface-raised);border:1px solid var(--separator);border-radius:10px;padding:18px;box-shadow:none}
.settings-card .card-title{margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--separator);color:var(--text-strong);font-size:.92rem;font-weight:650}
.settings-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-card .btn{width:100%;min-width:0;min-height:44px;padding:9px 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;cursor:pointer}
.settings-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;D("settings-control-card",ka);var Sa=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Recovery actions</div>
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,Xs=R({tag:"settings-control-card",render:Sa,onMount(t,e){_(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&de("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{de("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&de("restart")})}});var _a=`
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border:1px solid var(--warn-border);
  background:var(--warn-bg-soft);
  border-radius: 8px;
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
  font-weight:650;
  letter-spacing:0;
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
`;D("settings-motor-calibration-card",_a);var et=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],La=()=>{let t="";for(let e=0;e<et.length;e++){let o=et[e];if(o.key==="generic_runtime_limit_seconds")continue;let r=Ca(o.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+h(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${me("settings.motor.help")}</span></div>
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
        <div class="mc-advanced-body">${t}</div>
      </details>
    </div>
  `};function Ca(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var rl=R({tag:"settings-motor-calibration-card",render:La,onMount(t,e){let o=e.querySelector(".smc-profile"),r=e.querySelector(".smc-safe-runtime"),n=e.querySelector(".mc-drivers-toggle"),a=ae(e);function s(b){if(b==="HmIP VdMot"&&le("hmip_runtime_limit_seconds",40),b==="Generic"){let g=Number(L(i.genericRuntimeLimitSeconds));(!Number.isFinite(g)||g<=0)&&le("generic_runtime_limit_seconds",45)}}a.toggle(n,{read:()=>X(i.drivers),commit:b=>Rt(b)}),a.select(o,{read:()=>C(i.motorProfileDefault)||"HmIP VdMot",commit:b=>{se("motor_profile_default",b),s(b)}});function l(){let b=C(i.motorProfileDefault)||"HmIP VdMot";r.disabled=b==="HmIP VdMot"}a.num(r,{read:()=>(C(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:L(i.genericRuntimeLimitSeconds),commit:b=>{o.value==="Generic"&&le("generic_runtime_limit_seconds",b)}});for(let b=0;b<et.length;b++){let g=et[b];if(g.key==="generic_runtime_limit_seconds")continue;let u=e.querySelector(".smc-"+g.cls);u&&(a.num(u,{read:()=>L(g.id),commit:x=>le(g.key,x)}),w(g.id,a.refresh))}w(i.drivers,a.refresh),w(i.motorProfileDefault,()=>{a.refresh(),l()}),w(i.genericRuntimeLimitSeconds,a.refresh),w(i.hmipRuntimeLimitSeconds,a.refresh),_(e),s(C(i.motorProfileDefault)||"HmIP VdMot"),a.refresh(),l()}});var Ma=`
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
`;D("smart-preheat-card",Ma);var Aa=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${me("settings.preheat.help")}</span></div>
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
`,ul=R({tag:"smart-preheat-card",render:Aa,onMount(t,e){let o=e.querySelector(".absorb-toggle"),r=e.querySelector(".absorb-badge"),n=e.querySelector(".absorb-band"),a=e.querySelector(".absorb-delta"),s=e.querySelector(".absorb-body"),l=ae(e),b=u=>{s&&s.classList.toggle("is-disabled",!u)};l.toggle(o,{read:()=>X(i.preheatAbsorbEnabled),onChange:b,commit:u=>{let x=u?"on":"off";f(i.preheatAbsorbEnabled,{state:x}),se("preheat_absorb_enabled",x)}}),l.num(n,{read:()=>L(i.preheatAbsorbBandC),commit:u=>{f(i.preheatAbsorbBandC,{value:u}),le("preheat_absorb_band_c",u)}}),l.num(a,{read:()=>L(i.preheatDetectDeltaC),commit:u=>{f(i.preheatDetectDeltaC,{value:u}),le("preheat_detect_delta_c",u)}});function g(){let u=String(C(i.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=u?h("common.active"):h("common.idle"),r.classList.toggle("active",u)}w(i.preheatAbsorbEnabled,l.refresh),w(i.preheatAbsorbing,g),w(i.preheatAbsorbBandC,l.refresh),w(i.preheatDetectDeltaC,l.refresh),_(e),l.refresh(),g()}});gt();var Ta=`
:root { --bg:#0b0e14; --surface:#131620; --surface-raised:rgba(255,255,255,.035); --text-main:#f2f5f8; --text-strong:#f8fafc; --text-muted:rgba(226,231,240,.62); --text-faint:rgba(207,215,228,.45); --separator:rgba(199,211,232,.105); --separator-soft:rgba(199,211,232,.06); --control-border:rgba(199,211,232,.15); --control-bg:rgba(255,255,255,.045); --accent:#F59E0B; --accent-rgb:245,158,11; --state-ok:#34D399; --state-warn:#F59E0B; --state-danger:#EF4444; --state-disabled:#8b94a3; --focus-ring:rgba(245,158,11,.92); --font-ui:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif; --font-display:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif; --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  /* Legacy components inherit the same neutral system. Themes replace only accent and focus. */
  --text:var(--text-main); --text-secondary:var(--text-muted); --muted:var(--text-muted); --border:var(--separator); --panel-border:var(--separator); --divider:var(--separator-soft); --card:var(--surface); --panel-bg-flat:var(--surface-raised); --panel-bg-vibrant:var(--surface-raised); --panel-shadow:none; --overlay-bg:rgba(11,14,20,.96); --text-on-accent:var(--bg); --control-bg-hover:rgba(255,255,255,.075); --control-border-strong:rgba(199,211,232,.24); --control-border-hover:rgba(var(--accent-rgb),.5); --control-knob:var(--text-strong); --focus-ring-soft:var(--focus-ring); --focus-border:var(--accent); --accent-bg-soft:rgba(var(--accent-rgb),.12); --accent-border:rgba(var(--accent-rgb),.36); --accent-border-hover:rgba(var(--accent-rgb),.52); --accent-text-soft:var(--accent); --success-bg:rgba(52,211,153,.16); --success-bg-soft:rgba(52,211,153,.10); --success-border:rgba(52,211,153,.38); --danger-bg:rgba(239,68,68,.16); --danger-bg-soft:rgba(239,68,68,.10); --danger-bg-strong:rgba(239,68,68,.22); --danger-border:rgba(239,68,68,.42); --danger-border-soft:rgba(239,68,68,.30); --danger-border-strong:rgba(239,68,68,.56); --danger-text:var(--state-danger); --warn-bg-soft:rgba(245,158,11,.10); --warn-border:rgba(245,158,11,.38); --blue:#7aa7ce; --red:var(--state-danger); --series-warm:var(--accent); --series-cool:#7cc5f3; --series-cool-fill:rgba(124,197,243,.14); --series-solar:#fcd34d; --chart-axis:rgba(226,231,240,.72); --flow-track:#596779; --flow-disabled:#7c8797; --flow-unknown:#9aa6b6; --flow-return:var(--series-cool); --flow-label:#d8e1ec; --flow-source-bg:#202630;
}
.theme-refined-ember { --accent:#F59E0B; --accent-rgb:245,158,11; --focus-ring:rgba(245,158,11,.92); }
.theme-deep-forest { --accent:#10B981; --accent-rgb:16,185,129; --focus-ring:rgba(52,211,153,.92); }
:root[data-color-scheme="light"] {
  --bg:#f5f6f8; --surface:#ffffff; --surface-raised:rgba(255,255,255,.82); --text-main:#262a31; --text-strong:#111318; --text-muted:rgba(35,40,49,.68); --text-faint:rgba(45,51,61,.50); --separator:rgba(31,41,55,.14); --separator-soft:rgba(31,41,55,.08); --control-border:rgba(31,41,55,.19); --control-bg:rgba(255,255,255,.90); --state-ok:#147a52; --state-warn:#9a5b00; --state-danger:#c73535; --state-disabled:#6b7280;
  --overlay-bg:rgba(245,246,248,.96); --text-on-accent:#ffffff; --control-bg-hover:rgba(17,24,39,.07); --control-border-strong:rgba(31,41,55,.29); --success-bg:rgba(20,122,82,.12); --success-bg-soft:rgba(20,122,82,.08); --success-border:rgba(20,122,82,.30); --danger-bg:rgba(199,53,53,.12); --danger-bg-soft:rgba(199,53,53,.08); --danger-bg-strong:rgba(199,53,53,.16); --danger-border:rgba(199,53,53,.34); --danger-border-soft:rgba(199,53,53,.24); --danger-border-strong:rgba(199,53,53,.45); --warn-bg-soft:rgba(154,91,0,.09); --warn-border:rgba(154,91,0,.30); --blue:#276b99; --series-cool:#1f78a8; --series-cool-fill:rgba(31,120,168,.12); --series-solar:#8a6500; --chart-axis:rgba(35,40,49,.70); --flow-track:#738096; --flow-disabled:#8a94a3; --flow-unknown:#667386; --flow-label:#2d3948; --flow-source-bg:#edf0f4;
}
:root[data-color-scheme="light"].theme-refined-ember { --accent:#b45309; --accent-rgb:180,83,9; --focus-ring:rgba(180,83,9,.78); }
:root[data-color-scheme="light"].theme-deep-forest { --accent:#047857; --accent-rgb:4,120,87; --focus-ring:rgba(4,120,87,.78); }
*,*::before,*::after{box-sizing:border-box} html{font-size:100%;scroll-behavior:smooth} body{margin:0;background:var(--bg);color:var(--text-main);font-family:var(--font-ui);line-height:1.45;-webkit-font-smoothing:antialiased} button,input,select{font:inherit} button,a,select,input{ -webkit-tap-highlight-color:transparent }
app-root{display:block}.app{min-height:100vh}.shell{display:grid;grid-template-columns:224px minmax(0,1fr);min-height:100vh}.side-panel{grid-column:1;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:18px 12px 14px;border-right:1px solid var(--separator);background:rgba(255,255,255,.022);overflow-y:auto}.side-brand{min-height:0;padding:7px 10px 0;color:var(--accent);font-size:1rem;font-weight:750;letter-spacing:.12em}.side-subtitle{margin:2px 10px 30px;color:var(--text-faint);font-size:.72rem}.side-nav-slot{display:flex;flex:1;min-height:0}.main-panel{grid-column:2;min-width:0}.hdr{position:sticky;top:0;z-index:20;padding:12px 28px;border-bottom:1px solid var(--separator);background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(20px) saturate(1.25)}.view-panel{min-width:0;width:min(1120px,100%);margin:0 auto;padding:28px 34px 64px}.ftr{margin-top:48px;color:var(--text-faint);font-size:.75rem}.sec{display:none}.sec.active{display:block}
.view-lead{max-width:720px;margin:0 0 28px;padding-bottom:24px;border-bottom:1px solid var(--separator)}.view-lead h2{margin:0;color:var(--text-strong);font-size:1.1rem;font-weight:650}.view-lead p{margin:6px 0 0;color:var(--text-muted);font-size:.92rem}
.status-summary{display:grid;grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr));gap:0;margin:0 0 24px;padding:20px 0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}.settings-readiness,.diagnostics-readiness{grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr))}.status-summary-main{padding-right:24px}.eyebrow{display:block;color:var(--text-faint);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.status-summary h2{margin:5px 0 4px;color:var(--text-strong);font-size:1.65rem;letter-spacing:-.025em}.status-summary p{margin:0;color:var(--text-muted);font-size:.9rem}.status-fact{padding:0 16px;border-left:1px solid var(--separator)}.status-fact strong{display:block;margin-top:5px;color:var(--text-strong);font-size:1.15rem;font-variant-numeric:tabular-nums}.status-fact small{display:block;margin-top:3px;color:var(--text-muted);font-size:.78rem}.status-ok{color:var(--state-ok)!important}.status-summary h2.status-ok{color:var(--text-strong)!important}.status-warn{color:var(--state-warn)!important}.status-danger{color:var(--state-danger)!important}
.attention{margin:0 0 24px;border-left:3px solid var(--state-warn);padding:13px 16px;background:rgba(245,158,11,.055)}.attention[hidden]{display:none}.attention strong{display:block;color:var(--text-strong);font-size:.9rem}.attention span{display:block;margin-top:3px;color:var(--text-muted);font-size:.85rem}
.content-group{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.content-group + .content-group{margin-top:24px}.group-title{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:58px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--separator)}.group-title-main{min-width:0}.group-title h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.group-title span{display:block;margin-top:2px;color:var(--text-muted);font-size:.78rem}.group-navigation{min-height:44px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.group-navigation:hover{background:rgba(var(--accent-rgb),.10)}.zone-grid{display:grid;grid-template-columns:1fr;gap:0;margin:0}
.zones-index-head{display:flex;align-items:baseline;justify-content:space-between;gap:20px;margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zones-index-head h2{margin:0;color:var(--text-strong);font-size:1.55rem;font-weight:700;letter-spacing:-.025em}.zones-index-head p{margin:0;color:var(--text-muted);font-size:.86rem}.zones-summary{max-width:720px;margin:0 0 28px;padding:0 0 24px;border-bottom:1px solid var(--separator)}.zones-summary h2{margin:5px 0 6px;color:var(--text-strong);font-size:clamp(1.45rem,2.5vw,1.9rem);font-weight:680;letter-spacing:-.03em}.zones-summary p{margin:0;color:var(--text-muted);font-size:.92rem}.zones-index .content-group{margin:0}.zones-index .zone-card{min-height:86px;padding:14px 18px}.zone-detail-toolbar{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-back{min-height:44px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.zone-back:hover{background:rgba(var(--accent-rgb),.10)}.zone-picker-field{display:flex;align-items:center;gap:9px;color:var(--text-muted);font-size:.78rem;font-weight:600}.zone-picker{min-width:180px;min-height:44px;padding:0 34px 0 12px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);color:var(--text-strong);font-weight:650;cursor:pointer}.zones-detail-pane{min-width:0}.zone-detail-heading{margin:0 0 14px;padding:2px 0 16px;border-bottom:1px solid var(--separator)}.zone-detail-heading h2{margin:3px 0 0;color:var(--text-strong);font-size:1.35rem;font-weight:700;letter-spacing:-.02em}.zone-detail-heading p{margin:4px 0 0;color:var(--text-muted);font-size:.84rem}.zone-detail-layout{display:grid;grid-template-columns:1fr;gap:10px}.zone-detail-layout>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}.zone-detail-layout .ui-card,.zone-detail-layout .zone-detail,.zone-detail-layout .diag-zone-recovery{border:1px solid var(--separator)!important;border-radius:10px!important;background:var(--surface-raised)!important;box-shadow:none!important}.zone-recovery-disclosure .disclosure-body{padding:0}.zone-recovery-disclosure .diag-zone-recovery{border:0!important;border-radius:0!important;background:transparent!important}
.disclosure{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.disclosure + .disclosure{margin-top:8px}.disclosure summary{display:flex;align-items:center;justify-content:space-between;min-height:58px;padding:0 18px;color:var(--text-strong);cursor:pointer;list-style:none;font-size:.92rem;font-weight:650}.disclosure summary::-webkit-details-marker{display:none}.disclosure summary::after{content:'\u203A';color:var(--text-muted);font-size:1.35rem;transition:transform .16s ease}.disclosure[open] summary::after{transform:rotate(90deg)}.disclosure summary:focus-visible{outline:3px solid var(--focus-ring);outline-offset:-3px}.disclosure summary small{margin-left:auto;margin-right:18px;color:var(--text-muted);font-size:.78rem;font-weight:400}.disclosure-body{padding:18px;border-top:1px solid var(--separator)}
.overview-details,.settings-layout,.diagnostics-layout{display:grid;gap:8px}.overview-attention,.diagnostics-attention{width:100%;border:0;border-left:3px solid var(--state-warn);border-radius:0;text-align:left;color:inherit;cursor:pointer}.overview-attention:hover,.diagnostics-attention:hover{background:rgba(var(--accent-rgb),.09)}.settings-disclosure>.disclosure-body,.diagnostics-disclosure>.disclosure-body{padding:0 18px 18px}.settings-disclosure .ui-card,.diagnostics-disclosure .ui-card,.diagnostics-disclosure .settings-card,.diagnostics-disclosure .logs-view,.diagnostics-disclosure .diag-zone-motor,.diagnostics-disclosure .connectivity-card,.diagnostics-disclosure .diag-i2c{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.settings-disclosure .ui-card-title{display:none}.settings-disclosure .ui-row{min-height:58px}.settings-disclosure .ui-input,.settings-disclosure .ui-select,.settings-disclosure .ui-btn,.settings-disclosure button,.diagnostics-disclosure button,.diagnostics-disclosure select,.diagnostics-disclosure input{min-height:44px}.settings-disclosure .touch-approve{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--text-on-accent)!important}.settings-disclosure .touch-disconnect{background:transparent!important}.diagnostics-disclosure .card-title,.diagnostics-disclosure .ui-card-title{color:var(--text-strong)!important;font-size:.92rem!important;font-weight:650!important;letter-spacing:0!important;text-transform:none!important}.diagnostics-disclosure .logs-stream{height:min(420px,50vh);background:rgba(0,0,0,.14);box-shadow:none}.diagnostics-disclosure.danger-zone{margin-top:20px;border-color:var(--danger-border-soft)}.diagnostics-disclosure.danger-zone>summary{color:var(--danger-text)}
.help-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.help-item{display:block;padding:18px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-main);text-decoration:none}.help-item:hover{border-color:rgba(var(--accent-rgb),.45)}.help-item strong{display:block;color:var(--text-strong);font-size:.95rem}.help-item p{margin:5px 0 0;color:var(--text-muted);font-size:.83rem}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,.zone-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}@media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}@media (prefers-contrast:more){:root{--separator:rgba(230,238,250,.28);--text-muted:rgba(239,244,252,.82);--text-faint:rgba(231,239,250,.68)}}
:root[data-color-scheme="light"] .side-panel{background:rgba(17,24,39,.018)}
:root[data-color-scheme="light"] .attention{background:rgba(154,91,0,.07)}
:root[data-color-scheme="light"] .diagnostics-disclosure .logs-stream,
:root[data-color-scheme="light"] .diag-i2c,
:root[data-color-scheme="light"] .logs-stream{background:rgba(17,24,39,.045)}
:root[data-color-scheme="light"] .zone-card:hover{background:rgba(17,24,39,.035)}
@media (prefers-contrast:more){:root[data-color-scheme="light"]{--separator:rgba(31,41,55,.32);--text-muted:rgba(24,30,39,.86);--text-faint:rgba(35,42,52,.72)}}
.overview-dashboard{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);column-gap:28px;border-top:1px solid var(--separator)}.dashboard-section{min-width:0;padding:24px 0;border-bottom:1px solid var(--separator)}.dashboard-hydraulic{grid-column:1/-1}.dashboard-activity{grid-column:1}.dashboard-connection{grid-column:2;padding-left:28px;border-left:1px solid var(--separator)}.dashboard-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:0 0 18px}.dashboard-section-head h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.dashboard-section-head p{margin:3px 0 0;color:var(--text-muted);font-size:.82rem}.hydraulic-summary{color:var(--text-muted);font-size:.84rem;font-variant-numeric:tabular-nums}.overview-dashboard .flow-wrap,.overview-dashboard .graph-card,.overview-dashboard .timeline-card,.overview-dashboard .connectivity-card{margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.overview-dashboard .connectivity-card{padding:0!important}.overview-dashboard .connectivity-card .card-title{display:none}.overview-dashboard .graph-card{margin-top:18px!important;padding-top:18px!important;border-top:1px solid var(--separator)!important}
.zone-detail-toolbar{display:grid;gap:12px;align-items:initial;justify-content:initial}.zone-back{justify-self:start}.zone-picker-field{display:none}.zone-tabstrip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;padding:3px;border:1px solid var(--control-border);border-radius:11px;background:var(--control-bg);overflow-x:auto}.zone-tab{min-width:0;min-height:44px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--text-muted);font-size:.84rem;font-weight:620;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.zone-tab:hover{color:var(--text-strong);background:var(--control-bg-hover)}.zone-tab[aria-selected="true"]{background:rgba(var(--accent-rgb),.15);color:var(--accent)}
.zone-configuration-group{overflow:hidden;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised)}.zone-configuration-group .zone-room-slot{border-bottom:1px solid var(--separator)}.zone-configuration-group .ui-card{height:auto!important;padding:18px 20px!important;border:0!important;border-radius:0!important;background:transparent!important}.zone-configuration-group .ui-card-title{min-height:34px;margin:0;padding:0 0 12px;font-size:.95rem}.zone-configuration-group .ui-section{margin-top:20px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-configuration-group .ui-divider{border-top:1px solid var(--separator)}.zone-recovery-disclosure{margin-top:10px}.zone-recovery-disclosure>summary{color:var(--text-muted)}
@media(max-width:900px){.shell{display:block;padding-bottom:78px}.main-panel{min-width:0}.side-panel{position:fixed;z-index:40;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:auto;padding:7px;border:1px solid var(--separator);border-radius:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);box-shadow:0 10px 32px rgba(0,0,0,.32);backdrop-filter:blur(22px) saturate(1.3);overflow:visible}.side-brand,.side-subtitle{display:none}.hdr{padding:9px 14px}.view-panel{width:100%;padding:24px 16px 48px}.status-summary{grid-template-columns:1fr 1fr;gap:16px}.status-summary-main{grid-column:1/-1;padding:0 0 12px;border-bottom:1px solid var(--separator)}.status-fact{padding:0;border:0}.zone-card{grid-template-columns:minmax(120px,1fr) 90px 90px 28px;gap:10px}.zone-card .zc-valve{display:none}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:3}.zone-card::after{grid-column:4}.zone-detail-secondary,.help-list{grid-template-columns:1fr}}
@media(max-width:900px){.overview-dashboard{grid-template-columns:1fr}.dashboard-hydraulic,.dashboard-activity,.dashboard-connection{grid-column:1}.dashboard-connection{padding-left:0;border-left:0}.zone-tabstrip{grid-template-columns:repeat(6,minmax(112px,1fr));scroll-snap-type:x proximity}.zone-tab{scroll-snap-align:start}}
@media(max-width:520px){.v6-toolbar h1{font-size:1.15rem}.v6-toolbar p{font-size:.78rem}.v6-toolbar-icon{display:none}.v6-live{font-size:0}.v6-live::before{width:8px;height:8px}.status-summary h2{font-size:1.35rem}.group-title{align-items:center}.group-title span{margin-top:4px}.zone-card{min-height:88px;grid-template-columns:minmax(0,1fr) 82px 28px}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:1;margin-top:51px}.zone-card::after{grid-column:3}.zones-index-head{display:block}.zones-index-head p{margin-top:4px}.zone-detail-toolbar{align-items:stretch;flex-direction:column}.zone-back{align-self:flex-start}.zone-picker-field{justify-content:space-between}.zone-picker{min-width:0;flex:1}}
`;D("hv6-app-root",Ta);var Fa=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand">Lune V6</div><p class="side-subtitle">Local manifold controller</p><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Hydraulic overview</h3><p>Current temperatures, valve demand and active loops.</p></div><span class="hydraulic-summary"></span></div><div class="flow-diagram-slot"></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section><section class="dashboard-section dashboard-connection" aria-labelledby="connection-heading"><div class="dashboard-section-head"><div><h3 id="connection-heading">Connection</h3><p>Touch, network and firmware.</p></div></div><div class="connectivity-slot"></div></section></div></section>
<section class="sec" data-section="zones"><div class="zones-index"><div class="zones-index-head"><h2>Zones</h2><p class="zones-count">6 physical loops</p></div><section class="zones-summary" role="status" aria-live="polite"></section><div class="content-group"><div class="group-title"><div class="group-title-main"><h3>Local zones</h3><span>Temperature, applied target, valve and state</span></div></div><div class="zones-list"></div></div></div><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title" hidden><div class="zone-detail-toolbar"><button type="button" class="zone-back" data-zone-back>\u2039 All zones</button><div class="zone-tabstrip" role="tablist" aria-label="Select zone"></div></div><div class="zone-detail-heading" id="selected-zone-panel" role="tabpanel" aria-labelledby="selected-zone-tab"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-layout"><div class="zone-detail-slot"></div><section class="zone-configuration-group" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div></section><details class="disclosure zone-recovery-disclosure"><summary>Service and recovery<small>Only when this zone needs attention</small></summary><div class="disclosure-body zone-recovery-slot"></div></details></div></section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout"><details class="disclosure settings-disclosure touch-settings" open><summary>Touch connection<small>Approval and coordinator identity</small></summary><div class="disclosure-body touch-slot"></div></details><details class="disclosure settings-disclosure"><summary>Manifold and probes<small>Valve type and temperature inputs</small></summary><div class="disclosure-body manifold-slot"></div></details><details class="disclosure settings-disclosure"><summary>Hydraulic safety<small>Minimum active-loop opening</small></summary><div class="disclosure-body minimum-flow-slot"></div></details><details class="disclosure settings-disclosure"><summary>Preheat absorption<small>Local handling of external preload</small></summary><div class="disclosure-body preheat-slot"></div></details><details class="disclosure settings-disclosure"><summary>Motor configuration<small>Drivers, profile and learning limits</small></summary><div class="disclosure-body motor-slot"></div></details></div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="help"><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;R({tag:"app-root",render:Fa,onMount(t,e){e.querySelector(".hdr").appendChild(B("hv6-header")),e.querySelector(".side-nav-slot").appendChild(B("hv6-sidebar")),e.querySelector(".zones-list").appendChild(B("zone-grid",{selection:!0,navigate:!0})),e.querySelector(".flow-diagram-slot").appendChild(B("flow-diagram")),e.querySelector(".hydraulic-history-slot").appendChild(B("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(B("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(B("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(B("zone-detail",{zone:F("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(B("zone-sensor-card")),e.querySelector(".zone-recovery-slot").appendChild(B("diag-zone-recovery-card")),e.querySelector(".zone-room-slot").appendChild(B("zone-room-card")),e.querySelector(".touch-slot").appendChild(B("settings-touch-card")),e.querySelector(".manifold-slot").appendChild(B("settings-manifold-card")),e.querySelector(".minimum-flow-slot").appendChild(B("settings-minimum-flow-card")),e.querySelector(".preheat-slot").appendChild(B("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(B("settings-motor-calibration-card")),e.querySelector(".diag-actions-slot").appendChild(B("settings-control-card")),e.querySelector(".manual-control-col").appendChild(B("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(B("diag-zone-motor-card",{zone:F("selectedZone")||1})),e.querySelector(".logs-main-col").appendChild(B("logs-view")),e.querySelector(".system-health-slot").appendChild(B("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(B("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(B("diag-i2c"));let o=e.querySelectorAll(".sec"),r=e.querySelector(".zones-index"),n=e.querySelector(".zone-detail-view"),a=e.querySelector(".selected-zone-title"),s=e.querySelector(".zone-tabstrip"),l=!1;function b(){let m=F("selectedZone")||1;s.innerHTML=Array.from({length:6},(v,p)=>{let y=p+1,d=y===m;return`<button type="button" class="zone-tab" id="${d?"selected-zone-tab":"zone-tab-"+y}" role="tab" aria-controls="selected-zone-panel" aria-selected="${d}" tabindex="${d?"0":"-1"}" data-zone-select="${y}">${re(y)}</button>`}).join("")}function g(){let m=F("section")||"overview";o.forEach(v=>v.classList.toggle("active",v.dataset.section===m)),x()}function u(){let m=[],v=0,p=0;for(let N=1;N<=6;N++){let q=String(C(c.enabled(N))).toLowerCase()==="on",O=String(C(c.state(N))).toLowerCase(),T=String(C(c.motorLastFault(N))).toLowerCase();q&&m.push(N),q&&["heating","calling"].includes(O)&&v++,(O==="fault"||T!==""&&T!=="none"&&T!=="ok")&&p++}let y=L(i.flow),d=L(i.ret),z=String(C(i.authorityState)||"").replace(/_/g," "),S=p===0&&F("live"),k=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${S?"status-ok":F("live")?"status-warn":"status-danger"}">${S?"Operating normally":F("live")?"Needs attention":"Device offline"}</h2><p>${p?p+" zone fault"+(p===1?"":"s")+" require attention.":F("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${v} zones</strong><small>${m.length} enabled</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${j(y)}</strong><small>Return ${j(d)}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${z||"not connected"}</strong><small>${L(i.authorityLeaseRemainingS)?Math.round(L(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,A=X(i.authorityConfigured),M=String(C(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=k,e.querySelector(".hydraulic-summary").textContent=`${v} heating \xB7 Flow ${j(y)} \xB7 Return ${j(d)}`,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${F("live")?"status-ok":"status-danger"}">${F("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${F("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${A?"Approved":"Not approved"}</strong><small>${A?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${M}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${p?"status-danger":S?"status-ok":"status-warn"}">${p?p+" issue"+(p===1?"":"s"):S?"Healthy":"Awaiting data"}</h2><p>${p?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${p}</strong><small>${p?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${M}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${z||"not connected"}</strong><small>${A?"approved":"local control"}</small></div>`,e.querySelector(".zones-count").textContent=`6 physical loops \xB7 ${m.length} enabled \xB7 ${v} heating`,e.querySelector(".zones-summary").innerHTML=`<span class="eyebrow">Zone status</span><h2>${p?p+" zone"+(p===1?"":"s")+" need attention":m.length?v?v+" zone"+(v===1?" is":"s are")+" heating":"All enabled zones are idle":"No zones enabled"}</h2><p>${p?"Open an affected zone to review its valve, sensor and recovery state.":m.length?"Select a zone to review its applied target, sensor coverage and local fallback.":"Enable zones after their valve and temperature source are configured."}</p>`,[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(N=>{N.hidden=!p,N.innerHTML=p?`<strong>Review ${p} zone fault${p===1?"":"s"}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:""})}function x(){let m=F("selectedZone")||1,v=F("section")==="zones";a.textContent=re(m),b(),r.hidden=!v||l,n.hidden=!v||!l}e.addEventListener("zone-open",()=>{l=!0,x()}),e.querySelector("[data-zone-back]").addEventListener("click",()=>{l=!1,x();let m=e.querySelector(`.zones-list .zone-card[data-zone="${F("selectedZone")||1}"]`);m&&m.focus()}),s.addEventListener("click",m=>{let v=m.target.closest("[data-zone-select]");v&&Ae(Number(v.dataset.zoneSelect))}),s.addEventListener("keydown",m=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(m.key))return;m.preventDefault();let v=F("selectedZone")||1,p=m.key==="Home"?1:m.key==="End"?6:m.key==="ArrowLeft"?v===1?6:v-1:v===6?1:v+1;Ae(p),requestAnimationFrame(()=>{var y;return(y=s.querySelector(`[data-zone-select="${p}"]`))==null?void 0:y.focus()})}),e.querySelectorAll("[data-open-zones]").forEach(m=>m.addEventListener("click",()=>{l=!1,ve("zones")})),e.querySelectorAll("[data-help-section]").forEach(m=>m.addEventListener("click",v=>{v.preventDefault(),ve(m.dataset.helpSection)})),$("section",g),$("selectedZone",x),$("live",u),$("zoneNames",()=>{b(),u()});for(let m=1;m<=6;m++)[c.temp(m),c.setpoint(m),c.valve(m),c.state(m),c.enabled(m),c.motorLastFault(m)].forEach(v=>w(v,u));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(m=>w(m,u)),_(e),g(),x(),u()}});function Ea(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(B("app-root")),Jt()}Ea();})();
