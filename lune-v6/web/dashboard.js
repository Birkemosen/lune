(()=>{var Pt={},$e={};function N(t){return Pt[t.tag]=t,t}function j(t,e){let o=Pt[t];if(!o)throw new Error("Component not found: "+t);let r=e||{};if(o.state){let i=o.state(e||{});for(let l in i)r[l]=i[l]}if(o.methods)for(let i in o.methods)r[i]=o.methods[i];let a=document.createElement("div");a.innerHTML=o.render(r);let n=a.firstElementChild;return o.onMount&&o.onMount(r,n),n}function w(t,e){($e[t]||($e[t]=[])).push(e)}function Q(t){let e=$e[t];if(e)for(let o=0;o<e.length;o++)e[o](t)}var ee=6,mr=28,Le=Object.create(null),gr=vr(),$={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:br(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:gr,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},fr=300;function br(){let t=Object.create(null);for(let e=1;e<=ee;e++)t[e]=[];return t}function vr(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<ee;)t.push("");return t.slice(0,ee)}function hr(){try{localStorage.setItem("hv6_zone_names",JSON.stringify($.zoneNames))}catch(t){}}function oe(t){return"$dashboard:"+t}function pt(t){return Math.max(1,Math.min(ee,Number(t)||1))}function It(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let o=t.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function L(t){let e=Le[t];return e?e.v!=null?e.v:e.value!=null?e.value:It(e.s!=null?e.s:e.state):null}function S(t){let e=Le[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function xr(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function Y(t){return xr(S(t))}function v(t,e){let o=Le[t];o||(o=Le[t]={v:null,s:null}),"v"in e&&(o.v=e.v,o.value=e.v),"value"in e&&(o.v=e.value,o.value=e.value),"s"in e&&(o.s=e.s,o.state=e.s),"state"in e&&(o.s=e.state,o.state=e.state);for(let r in e)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=e[r]);if(Q(t),t==="text_sensor-firmware_version"&&ge("firmwareVersion",S(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let r=parseInt(t.slice(10,-5),10);if(r>=1&&r<=ee){let a=S(t)||"";$.zoneNames[r-1]!==a&&($.zoneNames[r-1]=a,hr(),Q(oe("zoneNames")))}}}function B(t,e){w(oe(t),e)}function M(t){return $[t]}function ge(t,e){$[t]=e,Q(oe(t))}function fe(t){let e=t==="logs"?"diagnostics":t;$.section!==e&&($.section=e,Q(oe("section")))}function De(t){let e=pt(t);$.selectedZone!==e&&($.selectedZone=e,Q(oe("selectedZone")))}function be(t){let e=!!t;$.live!==e&&($.live=e,Q(oe("live")))}function ut(){$.pendingWrites+=1,Q(oe("pendingWrites"))}function Ve(){$.pendingWrites=Math.max(0,$.pendingWrites-1),$.lastWriteAt=Date.now(),Q(oe("pendingWrites"))}function qt(){return $.pendingWrites>0?!0:Date.now()-$.lastWriteAt<2e3}function ve(t){return $.zoneNames[pt(t)-1]||""}function ae(t){let e=pt(t),o=ve(e);return o?"Zone "+e+" \xB7 "+o:"Zone "+e}function Ae(t){$.i2cResult=t||"No scan has been run yet.",Q(oe("i2cResult"))}function O(t,e){let o={time:yr(),msg:String(t||"")};for($.activityLog.push(o);$.activityLog.length>60;)$.activityLog.shift();if(e>=1&&e<=ee){let r=$.zoneLog[e];for(r.push(o);r.length>8;)r.shift();Q(oe("zoneLog:"+e))}Q(oe("activityLog"))}function dt(t,e){let o=$[t];if(!Array.isArray(o))return;let r=It(e);if(r!=null){for(o.push(r);o.length>mr;)o.shift();Q(oe(t))}}function Re(t){let e=Date.now();if(!t&&e-$.lastHistoryAt<3200)return;$.lastHistoryAt=e;let o=0,r=0;for(let a=1;a<=ee;a++){let n=L("sensor-zone_"+a+"_valve_pct");n!=null&&(o+=n,r+=1)}dt("historyFlow",L("sensor-manifold_flow_temperature")),dt("historyReturn",L("sensor-manifold_return_temperature")),dt("historyDemand",r?o/r:0)}function yr(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function je(t){$.zoneStateHistory=t||null,Q(oe("zoneStateHistory"))}function Ht(){return $.deviceLogSeq}function Ze(t,e){if(Array.isArray(t)&&t.length){for(let o of t)$.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>$.deviceLogSeq&&($.deviceLogSeq=o[0]);for(;$.deviceLog.length>fr;)$.deviceLog.shift();Q(oe("deviceLog"))}typeof e=="number"&&e>$.deviceLogSeq&&($.deviceLogSeq=e-1)}function Ue(){return $.deviceLog}function Bt(){$.deviceLog=[],Q(oe("deviceLog"))}var d={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},s={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var K=6,wr=8,$t=null,Me=0,We=1,Vt=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],jt=18*3600+720,Zt=Date.now(),H={temp:new Float32Array(K),setpoint:new Float32Array(K),valve:new Float32Array(K),enabled:new Uint8Array(K),driversEnabled:1,fault:0,manualMode:0};function zr(){H.manualMode=0,Zt=Date.now(),ge("manualMode",!1);for(let n=0;n<K;n++){H.temp[n]=20.5+n*.4,H.setpoint[n]=21+n%3*.5,H.valve[n]=12+n*8,H.enabled[n]=n===4?0:1;let i=n+1;v(d.temp(i),{value:H.temp[n]}),v(d.setpoint(i),{value:H.setpoint[n]}),v(d.baseSetpoint(i),{value:H.setpoint[n]}),v(d.effectiveSetpoint(i),{value:H.setpoint[n]}),v(d.coordinatorOffset(i),{value:0}),v(d.coordinatorRemaining(i),{value:0}),v(d.valve(i),{value:H.valve[n]}),v(d.state(i),{state:H.valve[n]>5?"heating":"idle"}),v(d.enabled(i),{value:!!H.enabled[n],state:H.enabled[n]?"on":"off"}),v(d.probe(i),{state:"Probe "+i}),v(d.tempSource(i),{state:i%2?"Local Probe":"BLE"}),v(d.syncTo(i),{state:"None"}),v(d.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),v(d.name(i),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),v(d.preheatAdvance(i),{value:.08+n*.03})}for(let n=1;n<=wr;n++){let i=n<=K?n:K,l=H.temp[i-1]+(n>K?1:.1*n);v(d.probeTemp(n),{value:l})}v(s.flow,{value:34.1}),v(s.ret,{value:30.4}),v(s.uptime,{value:jt}),v(s.wifi,{value:-57}),v(s.drivers,{value:!0,state:"on"}),v(s.fault,{value:!1,state:"off"}),v(s.ip,{state:"192.168.1.86"}),v(s.ssid,{state:"MockLab"}),v(s.mac,{state:"D8:3B:DA:12:34:56"}),v(s.firmware,{state:"v1.0.0-1"}),v(s.resetReason,{state:"Software reset (esp_restart)"}),v(s.manifoldFlowProbe,{state:"Probe 7"}),v(s.manifoldReturnProbe,{state:"Probe 8"}),v(s.manifoldType,{state:"NC (Normally Closed)"}),v(s.motorProfileDefault,{state:"HmIP VdMot"}),v(s.closeThresholdMultiplier,{value:1.7}),v(s.closeSlopeThreshold,{value:1}),v(s.closeSlopeCurrentFactor,{value:1.4}),v(s.openThresholdMultiplier,{value:1.7}),v(s.openSlopeThreshold,{value:.8}),v(s.openSlopeCurrentFactor,{value:1.3}),v(s.openRippleLimitFactor,{value:1}),v(s.genericRuntimeLimitSeconds,{value:45}),v(s.hmipRuntimeLimitSeconds,{value:40}),v(s.relearnAfterMovements,{value:2e3}),v(s.relearnAfterHours,{value:168}),v(s.learnedFactorMinSamples,{value:3}),v(s.learnedFactorMaxDeviationPct,{value:12}),v(s.simplePreheatEnabled,{state:"on"}),v(s.minZoneFlowPct,{value:15}),v(s.minimumFlowAlways,{state:"off"}),v(s.bleClockSyncEnabled,{state:"on"}),v(s.bleClockSyncIntervalMin,{value:60}),v(s.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),v(s.bleClockSyncLastError,{state:""}),v(s.bleClockSyncAdvertising,{state:"off"}),v(s.authorityInstallationId,{state:"house-main"}),v(s.authorityCoordinatorId,{state:"lune-touch"}),v(s.authorityConfigured,{state:"on",value:!0}),v(s.authorityProposalPending,{state:"off",value:!1}),v(s.authorityState,{state:"touch_normal"}),v(s.authorityReason,{state:"lease_renewed"}),v(s.authorityLeaseRemainingS,{value:72}),v(s.cpuLoadCore0,{value:18.5}),v(s.cpuLoadCore1,{value:7.2}),v(s.freeInternalKb,{value:142}),v(s.freePsramKb,{value:7800}),Re(!0);let t=300,e=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let n=0;n<o;n++){let i=(o-1-n)*t,l=e-i,b=Math.floor(n/12)%24,u=r.map(c=>c[b%c.length]),m=i/3600,x=m>2.5&&m<3.5||m>8.5&&m<9.5?1:0,p=u.filter(c=>c===5).length,h=Math.round(Math.min(100,p*15+Math.abs(Math.sin(n/8))*6)),g=Number((30+p*1.4+Math.sin(n/11)*1.5).toFixed(1)),y=Number((g-(1.4+p*.35)).toFixed(1));a.push([l,...u,x,g,y,h])}je({interval_s:t,uptime_s:e,count:o,entries:a}),Ut(6)}function Ut(t){let e=[];for(let o=0;o<t;o++){let r=Vt[We%Vt.length];e.push([We,r[0],r[1],r[2]]),We++}Ze(e,We)}function kr(){Me+=1,v(s.uptime,{value:jt+Math.floor((Date.now()-Zt)/1e3)}),v(s.wifi,{value:-55-Math.round((1+Math.sin(Me/4))*6)});let t=0,e=0,o=0;for(let i=0;i<K;i++){let l=i+1,b=!!H.enabled[i],u=H.temp[i],m=H.setpoint[i],x=b&&H.driversEnabled&&!H.manualMode&&u<m-.25;H.manualMode?H.valve[i]=Math.max(0,H.valve[i]):!b||!H.driversEnabled?H.valve[i]=Math.max(0,H.valve[i]-6):x?H.valve[i]=Math.min(100,H.valve[i]+7+l%3):H.valve[i]=Math.max(0,H.valve[i]-5);let p=x?.05+H.valve[i]/2200:-.03+H.valve[i]/3200;H.temp[i]=u+p+Math.sin((Me+l)/5)*.04,b&&H.valve[i]>0&&(t+=H.valve[i],e+=1,o=Math.max(o,H.valve[i])),v(d.temp(l),{value:H.temp[i]}),v(d.valve(l),{value:Math.round(H.valve[i])});let h=Math.max(0,(H.setpoint[i]-H.temp[i]-.15)*.22);v(d.preheatAdvance(l),{value:Number(h.toFixed(2))}),v(d.state(l),{state:b?x?"heating":"idle":"off"}),v(d.enabled(l),{value:b,state:b?"on":"off"}),v(d.probeTemp(l),{value:H.temp[i]+Math.sin((Me+l)/6)*.1})}let r=29.5+o*.075+e*.18+Math.sin(Me/6)*.25,a=r-(e?2.1+t/Math.max(1,e*50):1.1);v(s.flow,{value:Number(r.toFixed(1))}),v(s.ret,{value:Number(a.toFixed(1))}),v(d.probeTemp(7),{value:Number((a-.4).toFixed(1))}),v(d.probeTemp(8),{value:Number((r+.2).toFixed(1))}),Re(!0);let n=M("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),Me%3===0&&Ut(1)}function Wt(){$t||(zr(),be(!0),$t=setInterval(kr,1200))}function Ge(t){let e=t.key||"",o=t.value,r=t.zone||0;if(e==="zone_setpoint"&&r>=1&&r<=K){let n=Number(o);Number.isNaN(n)||(H.setpoint[r-1]=n,v(d.setpoint(r),{value:n}),v(d.baseSetpoint(r),{value:n}),v(d.effectiveSetpoint(r),{value:n}),O("Zone "+r+" setpoint set to "+n.toFixed(1)+"\xB0C",r));return}if(e==="zone_enabled"&&r>=1&&r<=K){let n=o>.5;H.enabled[r-1]=n?1:0,v(d.enabled(r),{value:n,state:n?"on":"off"}),O("Zone "+r+(n?" enabled":" disabled"),r);return}if(e==="drivers_enabled"){let n=o>.5;H.driversEnabled=n?1:0,v(s.drivers,{value:n,state:n?"on":"off"}),O(n?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let n=o>.5;H.manualMode=n?1:0,ge("manualMode",n);return}if(e==="motor_target"&&r>=1&&r<=K){let n=Number(o||0);v(d.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(n)))}),O("Motor "+r+" target set to "+n+"%",r);return}if(e==="command"){let n=String(o);if(n==="i2c_scan"){Ae(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),O("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){O("Command executed: "+n);return}if(n==="firmware_check"||n==="firmware_prepare"){O("Command executed: "+n);return}if(n==="firmware_install"){O("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(n==="open_motor_timed"&&r>=1&&r<=K){O("Motor "+r+" open timed",r);return}if(n==="close_motor_timed"&&r>=1&&r<=K){O("Motor "+r+" close timed",r);return}if(n==="stop_motor"&&r>=1&&r<=K){O("Motor "+r+" stopped",r);return}if(n==="motor_reset_fault"&&r>=1&&r<=K){O("Motor "+r+" fault reset",r);return}if(n==="motor_reset_learned_factors"&&r>=1&&r<=K){O("Motor "+r+" learned factors reset",r);return}if(n==="motor_reset_and_relearn"&&r>=1&&r<=K){O("Motor "+r+" reset and relearn started",r);return}if(n==="ble_clock_sync_now"){v(s.bleClockSyncAdvertising,{state:"on"}),v(s.bleClockSyncLastError,{state:""}),setTimeout(()=>{v(s.bleClockSyncAdvertising,{state:"off"}),v(s.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),O("Room clock broadcast started");return}if(n==="dump_task_stats"){O("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&r>=1){v(d.probe(r),{state:String(o)}),O("Setting updated: "+e+" = "+o,r);return}if(e==="zone_temp_source"&&r>=1){v(d.tempSource(r),{state:String(o)}),O("Setting updated: "+e+" = "+o,r);return}if(e==="zone_sync_to"&&r>=1){v(d.syncTo(r),{state:String(o)}),O("Setting updated: "+e+" = "+o,r);return}if(e==="manifold_type"){v(s.manifoldType,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="manifold_flow_probe"){v(s.manifoldFlowProbe,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="manifold_return_probe"){v(s.manifoldReturnProbe,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="motor_profile_default"){v(s.motorProfileDefault,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="simple_preheat_enabled"){v(s.simplePreheatEnabled,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="minimum_flow_always"){v(s.minimumFlowAlways,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="ble_clock_sync_enabled"){v(s.bleClockSyncEnabled,{state:String(o)}),O("Setting updated: "+e+" = "+o);return}if(e==="zone_name"&&r>=1){v(d.name(r),{state:String(o)}),O("Setting updated: "+e+" = "+o,r);return}if(e==="zone_ble_mac"&&r>=1){v(d.ble(r),{state:String(o)}),O("Setting updated: "+e+" = "+o,r);return}if(e==="authority_approve_proposal"){v(s.authorityInstallationId,{state:S(s.authorityProposalInstallationId)||"lune-mock"}),v(s.authorityCoordinatorId,{state:S(s.authorityProposalCoordinatorId)||"touch-mock"}),v(s.authorityConfigured,{state:"on",value:!0}),v(s.authorityProposalPending,{state:"off",value:!1}),O("Discovered Lune Touch approved");return}if(e==="authority_revoke"){v(s.authorityInstallationId,{state:""}),v(s.authorityCoordinatorId,{state:""}),v(s.authorityConfigured,{state:"off",value:!1}),v(s.authorityState,{state:"unconfigured"}),O("Lune Touch disconnected");return}let a={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct,min_zone_flow_pct:s.minZoneFlowPct,ble_clock_sync_interval_min:s.bleClockSyncIntervalMin};if(a[e]){let n=Number(o);Number.isNaN(n)||(v(a[e],{value:n}),O("Setting updated: "+e+" = "+o));return}}var mt="v1.1.0";function Gt(){return{tag_name:mt,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+mt+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+mt+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function Kt(t){let e=[];for(let o=1;o<=K;o++)e.push({zone:o,name:S(d.name(o)),enabled:S(d.enabled(o))==="on",setpoint_c:L(d.setpoint(o)),probe:S(d.probe(o)),temp_source:S(d.tempSource(o)),ble_mac:S(d.ble(o)),sync_to:S(d.syncTo(o))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:S(s.firmware),device:{mac:S(s.mac)},settings:{manifold_type:S(s.manifoldType),manifold_flow_probe:S(s.manifoldFlowProbe),manifold_return_probe:S(s.manifoldReturnProbe),motor_profile_default:S(s.motorProfileDefault),min_zone_flow_pct:L(s.minZoneFlowPct),minimum_flow_always:S(s.minimumFlowAlways)==="on",simple_preheat_enabled:S(s.simplePreheatEnabled)==="on",ble_clock_sync_enabled:S(s.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:L(s.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(o=>({zone:o.zone,open_ripples:400+o.zone,close_ripples:390+o.zone}))}:null}}function Xt(t,e){let o=Object.keys(t&&t.settings||{}).length,r=Array.isArray(t&&t.zones)?t.zones.length:0,a=e&&t&&t.learned?K:0;return O("Settings restored from backup (mock)"),{applied:o+r+a,skipped:e?0:K,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Ge({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!H.enabled[t-1];Ge({key:"zone_enabled",value:e?1:0,zone:t})}};function gt(t,e){let o=URL.createObjectURL(e),r=document.createElement("a");r.href=o,r.download=t,r.rel="noopener",document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function ft(t,e,o){gt(t,new Blob([String(e)],{type:(o||"text/plain")+";charset=utf-8"}))}function bt(t,e){let o=new Date,r=n=>String(n).padStart(2,"0"),a=o.getFullYear()+r(o.getMonth()+1)+r(o.getDate())+"-"+r(o.getHours())+r(o.getMinutes());return t+"-"+a+"."+e}var Oe="/api/hv6/v1",Sr="https://api.github.com/repos/birkemosen/lune/releases/latest",_r="https://github.com/birkemosen/lune/releases/latest/download/",Cr="/update",Lr="lune-v6-settings";function xe(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function vt(t,e){let o=new URLSearchParams;for(let[a,n]of Object.entries(e||{}))n!=null&&o.append(a,n);let r=o.toString();return Oe+t+(r?"?"+r:"")}function re(t,e,o){if(ut(),xe())try{return Ge(o),Promise.resolve({ok:!0})}finally{Ve()}let r=sessionStorage.getItem("hv6_local_access_key")||"",a=new URLSearchParams;for(let[i,l]of Object.entries(e||{}))l!=null&&a.append(i,String(l));let n=i=>fetch(Oe+t,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","X-Lune-Local-Key":i,"X-Lune-CSRF":i,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:a.toString()});return n(r).then(async i=>{if(i.status===403&&!r){let l=window.prompt("Enter the Lune commissioning key to change local settings")||"";l&&(sessionStorage.setItem("hv6_local_access_key",l),r=l,i=await n(r))}return!i.ok&&[400,404,415].includes(i.status)?fetch(vt(t,e),{method:"POST"}):(i.ok||console.warn(`API call failed: POST ${t} status=${i.status}`),i)}).catch(i=>{throw console.error(`API call error: POST ${t}:`,i),i}).finally(()=>{Ve()})}function ht(){return sessionStorage.getItem("hv6_local_access_key")||""}function Ar(t,e,o){ut();let r=ht();return fetch(vt(t,o),{method:"POST",headers:{"Content-Type":"application/json","X-Lune-Local-Key":r,"X-Lune-CSRF":r,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:JSON.stringify(e)}).finally(()=>{Ve()})}function xt(t,e){let o=Number(e);v(d.setpoint(t),{value:o}),v(d.baseSetpoint(t),{value:o});let r=Number(L(d.coordinatorOffset(t))),a=Number.isFinite(r)?o+r:o;return v(d.effectiveSetpoint(t),{value:a}),re(`/zones/${t}/setpoint`,{setpoint_c:o},{key:"zone_setpoint",value:o,zone:t})}function Jt(t,e){return v(d.enabled(t),{state:e?"on":"off",value:e}),re(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function Qt(t){return v(s.drivers,{state:t?"on":"off",value:t}),re("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}function se(t,e){return re("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function eo(){return Ae("Scanning I2C bus..."),O("I2C scan started"),se("i2c_scan")}var Mr={zone_probe:t=>d.probe(t),zone_temp_source:t=>d.tempSource(t),zone_sync_to:t=>d.syncTo(t)},Er={zone_ble_mac:t=>d.ble(t),zone_name:t=>d.name(t)},Fr={manifold_type:s.manifoldType,manifold_flow_probe:s.manifoldFlowProbe,manifold_return_probe:s.manifoldReturnProbe,motor_profile_default:s.motorProfileDefault,simple_preheat_enabled:s.simplePreheatEnabled,ble_clock_sync_enabled:s.bleClockSyncEnabled},Tr={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:s.bleClockSyncIntervalMin};function Xe(t,e,o){let r=Mr[e];return r&&v(r(t),{state:o}),re("/settings/select",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function yt(t,e,o){let r=Er[e];return r&&v(r(t),{state:o}),re("/settings/text",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function le(t,e){let o=Fr[t];return o&&v(o,{state:e}),re("/settings/select",{key:t,value:e},{key:t,value:e})}function ce(t,e){let o=Number(e),r=Tr[t];return r&&!Number.isNaN(o)&&v(r,{value:o}),re("/settings/number",{key:t,value:o},{key:t,value:o})}function to(){return re("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:S(s.authorityProposalInstallationId)||"lune-mock",coordinator_id:S(s.authorityProposalCoordinatorId)||"touch-mock",local_access_key:"mock-local-access-key"}},o=(e==null?void 0:e.data)||{};return o.local_access_key&&sessionStorage.setItem("hv6_local_access_key",o.local_access_key),o.installation_id&&v(s.authorityInstallationId,{state:o.installation_id}),o.coordinator_id&&v(s.authorityCoordinatorId,{state:o.coordinator_id}),v(s.authorityConfigured,{state:"on",value:!0}),v(s.authorityProposalPending,{state:"off",value:!1}),e})}function oo(){return re("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return sessionStorage.removeItem("hv6_local_access_key"),v(s.authorityInstallationId,{state:""}),v(s.authorityCoordinatorId,{state:""}),v(s.authorityConfigured,{state:"off",value:!1}),t})}function ro(t,e){let o=String(e||"").trim();return O("Zone "+t+" renamed to "+(o||"(blank)"),t),yt(t,"zone_name",o)}function no(t,e){let o=Number(e),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return v(d.motorTarget(t),{value:r}),O("Motor "+t+" target set to "+r+"%",t),re(`/motors/${t}/target`,{value:r},{key:"motor_target",value:r,zone:t})}function ao(t,e=1e4){return O("Motor "+t+" open for "+e+"ms",t),re(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function so(t,e=1e4){return O("Motor "+t+" close for "+e+"ms",t),re(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function wt(t){return O("Motor "+t+" stopped",t),re(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function zt(t){return ge("manualMode",!!t),O(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),re("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function io(t){return O("Motor "+t+" fault reset",t),se("motor_reset_fault",t)}function lo(t){return O("Motor "+t+" learned factors reset",t),se("motor_reset_learned_factors",t)}function co(t){return O("Motor "+t+" reset and relearn started",t),se("motor_reset_and_relearn",t)}function po(){return O("Task stats dumped to device log"),se("dump_task_stats")}function kt(){xe()||fetch(Oe+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&je(t)}).catch(()=>{})}function uo(){return se("firmware_check")}function mo(){return O("Firmware install requested"),se("firmware_install")}function go(){return se("firmware_prepare")}function St(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:_r+e}}function Yt(t,e){let o=Array.isArray(t)?t:[],r=n=>o.find(i=>n.test(String(i&&i.name||""))),a=r(/^lune-v6.*\.ota\.bin$/i)||r(/\.ota\.bin$/i)||r(/\.bin$/i);return a&&a.browser_download_url?{name:String(a.name),url:String(a.browser_download_url)}:St(e)}var he=class extends Error{constructor(e,o,r){super(r||e),this.name="ReleaseCheckError",this.code=e,this.status=o||0}};async function fo(){if(xe()){let r=Gt(),a=String(r&&r.tag_name||"");return{tag:a,notes:String(r&&r.body||""),publishedAt:String(r&&r.published_at||""),asset:Yt(r&&r.assets,a)}}let t;try{t=await fetch(Sr,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(r){throw new he("network",0,r&&r.message?r.message:"network")}if(t.status===404)throw new he("no_releases",404,"No published GitHub release");if(!t.ok)throw new he("http",t.status,"Release check failed: "+t.status);let e=await t.json(),o=String(e&&e.tag_name||"");if(!o)throw new he("no_releases",404,"No published GitHub release");return{tag:o,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Yt(e&&e.assets,o)}}function bo(t,e){return xe()?new Promise(o=>{let r=0,a=setInterval(()=>{r=Math.min(100,r+20),e&&e(r),r>=100&&(clearInterval(a),O("Firmware image uploaded (mock)"),o("Update Successful!"))},220)}):new Promise((o,r)=>{let a=new FormData;a.append("update",t,t.name);let n=new XMLHttpRequest;n.open("POST",Cr);let i=ht();i&&(n.setRequestHeader("X-Lune-Local-Key",i),n.setRequestHeader("X-Lune-CSRF",i)),n.upload.onprogress=l=>{e&&l.lengthComputable&&e(Math.min(100,Math.round(l.loaded/l.total*100)))},n.onload=()=>{let l=String(n.responseText||"");if(n.status>=200&&n.status<300&&!/fail/i.test(l)){o(l);return}r(new Error("OTA upload rejected: "+n.status+" "+l))},n.onerror=()=>r(new Error("OTA upload connection lost")),n.send(a)})}function Ke(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function vo(t=!0){if(xe())return Ke(Kt(t));let e=await fetch(vt("/settings/export",{include_learned:t?1:0}),{cache:"no-store",headers:{"X-Lune-Local-Key":ht()}});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Ke(await e.json())}function Ye(t){let e=Ke(t);return!!(e&&e._type===Lr)}async function ho(t,e=!0){let o=typeof t=="string"?JSON.parse(t):t,r=Ke(o);if(!Ye(r))throw new Error("not_a_lune_backup");if(xe())return Xt(r,e);let a=await Ar("/settings/import",Object.assign({},r,{restore_learned:!!e}),{restore_learned:e?1:0});if(!a.ok)throw new Error("Settings restore failed: "+a.status);let n=await a.json().catch(()=>({})),i=n&&n.data?n.data:n||{};return O("Settings restored from backup"),{applied:Number(i.applied||0),skipped:Number(i.skipped||0),ignored:Number(i.ignored||0)}}function xo(t){let e=bt("lune-v6-settings","json");return ft(e,JSON.stringify(t,null,2),"application/json"),e}function Nr(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Ue().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function yo(){let t=bt("lune-v6-logs","txt");if(xe())return ft(t,Nr()||"No log lines buffered."),t;let e=await fetch(Oe+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return gt(t,await e.blob()),t}function _t(){if(xe())return;let t=Ht();fetch(Oe+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Ze(e.lines,e.next_seq)}).catch(()=>{})}var Je=null,wo=null,zo=null,ko=null,Ct=null;async function Dr(){Je&&Je.abort(),Je=new AbortController;let t=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Je.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function So(t){if(!(!t||typeof t!="object")&&!qt()){for(let e in t)v(e,t[e]);Re(!1)}}function Rr(t){if(t){if(!t.type){So(t);return}if(t.type==="state"){So(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;O(e),String(e).indexOf("I2C_SCAN:")!==-1&&Ae(String(e))}}}function Or(){kt(),wo||(wo=setInterval(kt,300*1e3)),_t(),zo||(zo=setInterval(_t,3e3))}function _o(){Dr().then(t=>{be(!0),Rr(t),Or()}).catch(()=>{be(!1)})}async function Pr(){try{let t=await fetch("/api/hv6/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),o=e&&e.data,r=o&&o.data_revision;o&&o.uptime_s!=null&&v(s.uptime,{value:Number(o.uptime_s)}),(Ct===null||r!==Ct)&&(Ct=r,_o()),be(!0)}catch(t){be(!1)}}function Co(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){Wt();return}_o(),ko||(ko=setInterval(Pr,3e3))}var Lo=Object.create(null);function R(t,e){if(Lo[t])return;Lo[t]=1;let o=document.createElement("style");o.textContent=e,document.head.appendChild(o)}var Qe={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature and coordination","zone.sensor.returnSensor":"Return temperature sensor","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.room.title":"Zone identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.bleClock.title":"Room clocks","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Accent colour is stored in this browser only. It does not change how the controller runs.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatur og koordinering","zone.sensor.returnSensor":"Returtemperatursensor","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.room.title":"Zoneidentitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.bleClock.title":"Rumure","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Accentfarven gemmes kun i denne browser. Den \xE6ndrer ikke, hvordan styringen k\xF8rer.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?"}},Ao="en".toLowerCase(),Lt=Qe[Ao]?Ao:"en";function f(t,e){let o=Qe[Lt]&&Qe[Lt][t]||Qe.en[t]||t;return e?String(o).replace(/\{(\w+)\}/g,(r,a)=>e[a]==null?"":String(e[a])):o}function _(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=f(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",f(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",f(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",f(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Lt);var Ir=`
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
`;R("ui-kit",Ir);function te(t){let e=f(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function qr(t,e){let o=Math.abs(Number(t));return!Number.isFinite(o)||o<1e3?e:Math.pow(10,Math.floor(Math.log10(o))-1)}function Hr(t){let e=String(t),o=e.indexOf(".");return o<0?0:e.length-o-1}function ie(t,e={}){let o=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r);let a=[],n=()=>r.classList.toggle("show",a.some(c=>c.dirty)),i=(c,z)=>{c.dirty=z,n()};function l(c){return c.markDirty=()=>i(c,!0),a.push(c),c}function b(c,z){let C={dirty:!1,input:c},k=z.baseStep!=null?z.baseStep:parseFloat(c.step)||1,T=Hr(k),A=z.min!=null?z.min:c.min!==""?parseFloat(c.min):-1/0,E=z.max!=null?z.max:c.max!==""?parseFloat(c.max):1/0,I=q=>T>0?Number(q).toFixed(T):String(Math.round(Number(q)));if(!z.nostep){let q=document.createElement("div");q.className="ui-stepper",c.parentNode.insertBefore(q,c);let D=document.createElement("button");D.type="button",D.className="ui-step-btn",D.textContent="\u2212",D.setAttribute("aria-label",f("common.decrease"));let U=document.createElement("button");U.type="button",U.className="ui-step-btn",U.textContent="+",U.setAttribute("aria-label",f("common.increase")),q.appendChild(D),q.appendChild(c),q.appendChild(U);let G=J=>{if(c.disabled)return;let F=parseFloat(c.value);Number.isFinite(F)||(F=parseFloat(c.placeholder)),Number.isFinite(F)||(F=0);let Z=Math.min(E,Math.max(A,F+J*qr(F,k)));c.value=I(Z),i(C,!0)};D.addEventListener("click",()=>G(-1)),U.addEventListener("click",()=>G(1)),c.addEventListener("keydown",J=>{J.key==="Enter"&&c.blur()})}return c.addEventListener("input",()=>i(C,!0)),C.sync=()=>{let q=z.read();c.value=q!=null&&Number.isFinite(Number(q))?I(q):""},C.commit=()=>{let q=parseFloat(c.value);Number.isFinite(q)&&z.commit(Math.min(E,Math.max(A,q)))},l(C)}function u(c,z){let C={dirty:!1,input:c};return c.addEventListener("input",()=>i(C,!0)),C.sync=()=>{let k=z.read();c.value=k!=null?k:""},C.commit=()=>z.commit(c.value.trim()),l(C)}function m(c,z){let C={dirty:!1,input:c};return c.addEventListener("change",()=>i(C,!0)),C.sync=()=>{let k=z.read();k!=null&&(c.value=k)},C.commit=()=>z.commit(c.value),l(C)}function x(c,z){let C={dirty:!1,input:c,staged:!1},k=c.closest(".ui-row"),T=()=>{c.classList.toggle("on",C.staged),k&&k.classList.toggle("is-on",C.staged),c.setAttribute("aria-checked",C.staged?"true":"false"),z.onChange&&z.onChange(C.staged)};return c.addEventListener("click",()=>{C.staged=!C.staged,i(C,!0),T()}),C.sync=()=>{C.staged=!!z.read(),T()},C.commit=()=>z.commit(C.staged),l(C)}function p(c){let z={dirty:!1,sync:c.sync,commit:c.commit};return l(z)}let h=()=>a.forEach(c=>{!c.dirty&&c.sync&&c.sync()}),g=()=>{a.forEach(c=>{c.dirty&&(c.commit&&c.commit(),c.dirty=!1)}),n(),e.onApply&&e.onApply()},y=()=>{a.forEach(c=>{c.dirty=!1,c.sync&&c.sync()}),n(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",g),r.querySelector(".ui-form-discard").addEventListener("click",y),_(r),{num:b,text:u,select:m,toggle:x,custom:p,refresh:h,apply:g,discard:y,isDirty:()=>a.some(c=>c.dirty)}}var Br=`
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
.v6-update-badge { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 12px; border:1px solid var(--accent-border); border-radius:999px; background:var(--accent-bg-soft); color:var(--accent); font:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }
.v6-update-badge[hidden] { display:none; }
.v6-update-badge:hover { border-color:var(--accent-border-hover); background:rgba(var(--accent-rgb),.18); }
.v6-update-badge::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--accent); }
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
`;R("hv6-header",Br);var $r=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-update-badge" id="hdr-update" hidden></button><span class="v6-live" id="hdr-live">Offline</span></div>
  </header>`,Ee=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,Vr=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Ee('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <a href="#" class="v6-side-link" data-section="zones">${Ee('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span></a>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Ee('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${Ee('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Ee('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span></button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Ee('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`,Mo={overview:["Overview","Local heating status and current exceptions"],zones:["Zones","Physical loops, applied targets and valve state"],diagnostics:["Diagnostics","Health, evidence and recovery"],settings:["Settings","Device configuration and safety"],help:["Help","Guidance for operating Lune V6"]};N({tag:"hv6-header",render:$r,onMount(t,e){let o=e.querySelector("#hdr-live"),r=e.querySelector("#v6-view-title"),a=e.querySelector("#v6-view-subtitle"),n=e.querySelector("#hdr-update");function i(){let b=M("firmwareUpdateAvailable");n.hidden=!b,b&&(n.textContent=f("status.updateAvailable",{version:b.latest}),n.title=f("settings.firmware.badgeTitle"))}n.addEventListener("click",()=>{fe("settings");let b=document.querySelector(".settings-firmware-card");if(!b)return;let u=b.closest("details");u&&(u.open=!0),b.scrollIntoView({behavior:"smooth",block:"center"})});function l(){let b=M("section")||"overview",u=Mo[b]||Mo.overview;r.textContent=u[0],a.textContent=u[1],o.textContent=M("live")?f("status.live"):f("status.offline"),o.classList.toggle("is-live",!!M("live"))}B("section",l),B("live",l),B("firmwareUpdateAvailable",i),_(e),l(),i()}});N({tag:"hv6-sidebar",render:Vr,onMount(t,e){let o=e.querySelector(".v6-side-nav"),r=e.querySelectorAll("[data-section]"),a=e.querySelector(".v6-more-toggle");function n(){let i=M("section");r.forEach(l=>{l.dataset.section&&(l.dataset.section===i?l.classList.add("active"):l.classList.remove("active"),l.setAttribute("aria-current",l.dataset.section===i?"page":"false"))})}r.forEach(i=>i.addEventListener("click",l=>{l.preventDefault(),fe(i.dataset.section),o&&o.classList.contains("more-open")&&(o.classList.remove("more-open"),a&&a.setAttribute("aria-expanded","false"))})),a&&o&&a.addEventListener("click",()=>{let i=o.classList.toggle("more-open");a.setAttribute("aria-expanded",String(i))}),B("section",n),_(e),n()}});function X(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function Fe(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function Eo(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,o=t%86400/3600|0,r=t%3600/60|0;return e>0?e+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}var jr=`
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
`;R("connectivity-card",jr);var Zr=()=>`
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
      <tr><td data-i18n="overview.connectivity.version">Version</td><td class="cc-ver">---</td></tr>
    </table>
  </div>
`,ss=N({tag:"connectivity-card",render:Zr,onMount(t,e){let o=e.querySelector(".cc-ip"),r=e.querySelector(".cc-ssid"),a=e.querySelector(".cc-mac"),n=e.querySelector(".cc-up"),i=e.querySelector(".cc-ver"),l=0,b=Date.now(),u=!1;function m(){if(!u){n.textContent="---";return}let h=Math.max(0,Math.floor((Date.now()-b)/1e3)),g=Eo(l+h);n.textContent!==g&&(n.textContent=g)}function x(){o.textContent=S(s.ip)||"---",r.textContent=S(s.ssid)||"---",a.textContent=S(s.mac)||"---",i.textContent=S(s.firmware)||"---";let h=L(s.uptime);if(h!=null&&!isNaN(h)&&h>=0){let g=h|0;(!u||g!==l)&&(l=g,b=Date.now(),u=!0)}m()}w(s.ip,x),w(s.ssid,x),w(s.mac,x),w(s.firmware,x),w(s.uptime,x);let p=setInterval(m,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(p),{once:!0}),_(e),x()}});var Ur="http://www.w3.org/2000/svg",Wr=`
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
`;R("chart-kit",Wr);function ne(t,e,o){let r=document.createElementNS(Ur,t);if(e)for(let a in e)r.setAttribute(a,e[a]);return o!=null&&(r.textContent=o),r}function Fo(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let e=.16,o=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let r=0;r<t.length-1;r++){let a=t[r-1]||t[r],n=t[r],i=t[r+1],l=t[r+2]||i,b=n.x+(i.x-a.x)*e,u=n.y+(i.y-a.y)*e,m=i.x-(l.x-n.x)*e,x=i.y-(l.y-n.y)*e;o+=` C ${b.toFixed(2)} ${u.toFixed(2)}, ${m.toFixed(2)} ${x.toFixed(2)}, ${i.x.toFixed(2)} ${i.y.toFixed(2)}`}return o}function To(t,e,o){let r=document.createElement("div");r.className="chart-tooltip",e.appendChild(r);let a=ne("g",{class:"chart-cursor",style:"display:none"}),n=ne("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});a.appendChild(n);let i=[];t.appendChild(a);function l(x){let p=0,h=1/0;for(let g=0;g<o.count;g++){let y=Math.abs(x-o.xAt(g));y<h&&(h=y,p=g)}return p}function b(x){let p=t.getScreenCTM();if(!p)return null;let h=t.createSVGPoint();return h.x=x.clientX,h.y=x.clientY,h.matrixTransform(p.inverse())}function u(x){if(!o.count)return;let p=b(x);if(!p)return;let h=l(p.x),g=o.xAt(h);n.setAttribute("x1",g),n.setAttribute("x2",g);let y=o.dots(h);for(;i.length<y.length;){let k=ne("circle",{class:"chart-cursor-dot",r:3.4});a.appendChild(k),i.push(k)}i.forEach((k,T)=>{T<y.length?(k.setAttribute("cx",g),k.setAttribute("cy",y[T].y),k.setAttribute("fill",y[T].color),k.style.display=""):k.style.display="none"}),a.style.display="";let c=o.rows(h).map(k=>`<div class="tt-row"><span class="tt-swatch" style="background:${k.color}"></span>${k.label}<span class="tt-val">${k.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(h)}</div>${c}`,r.classList.add("show");let z=e.getBoundingClientRect(),C=x.clientX-z.left+14;C+r.offsetWidth>z.width-6&&(C=x.clientX-z.left-r.offsetWidth-14),r.style.left=Math.max(6,C)+"px",r.style.top=Math.max(6,x.clientY-z.top+12)+"px"}function m(){r.classList.remove("show"),a.style.display="none"}return t.addEventListener("pointermove",u),t.addEventListener("pointerleave",m),()=>{t.removeEventListener("pointermove",u),t.removeEventListener("pointerleave",m),r.remove()}}var Pe=1e3,At=180,de=14,Gr=42,Kr=44,we=42,ot=Pe-we-Gr,ye=At-de-Kr,ke=de+ye,Mt=24*3600,No=ee+2,Do=ee+3,et=ee+4,Xr="var(--series-warm)",Yr="var(--series-cool)",Ro="var(--series-solar)",Jr=`
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
`;R("graph-widgets",Jr);var Oo=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',Po=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Qr=t=>t.variant==="flow-return"?`<div class="graph-widgets">${Oo()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${Po()}</div>`:`<div class="graph-widgets">${Oo()}${Po()}</div>`;function Io(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function en(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function Et(t,e,o){let r=[];for(let a=0;a<t.length;a++){let n=t[a];if(!n||n[0]<o)continue;let i=n[e];i==null||!Number.isFinite(i)||r.push({t:n[0],v:i})}return r}var rt=(t,e)=>we+Math.max(0,Math.min(1,(t-e)/Mt))*ot;function tn(t,e,o){let r=Number(Date.now()/1e3)|0,a=3600,n=Math.ceil((r-Mt)/a)*a,i=Math.floor(r/a)*a,l=Math.floor(r/a)*a;for(let u=n;u<=i;u+=a){let m=o-(r-u),x=rt(m,e),p=new Date(u*1e3),h=u===l,g=ke+16;t.appendChild(ne("text",{x,y:g,"text-anchor":"end",transform:`rotate(-45 ${x.toFixed(1)} ${g})`,class:"chart-hour"+(h?" now":"")},String(p.getHours()).padStart(2,"0")))}let b=rt(o,e);t.appendChild(ne("line",{x1:b,y1:de,x2:b,y2:ke,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function on(t){let e=[];if(t.forEach(n=>n.forEach(i=>e.push(i.v))),!e.length)return{min:0,max:10};let o=Math.min(...e),r=Math.max(...e);o===r&&(o-=.5,r+=.5);let a=(r-o)*.1;return o-=a,r+=a,{min:o,max:r}}function rn(t,e,o){let r=t.filter(a=>a.unit==="C").map(a=>Et(e,a.index,o));return on(r)}function qo(t,e,o,r,a,n){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${Pe} ${At}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let i=o.map(g=>Et(r,g.index,a));if(!i.some(g=>g.length))return t.appendChild(ne("text",{x:Pe/2,y:At/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let l=rn(o,r,a),b=Math.max(.001,l.max-l.min),u=g=>de+(1-(g-l.min)/b)*ye,m=g=>de+(1-Math.max(0,Math.min(100,g))/100)*ye,x=(g,y)=>g.unit==="%"?m(y):u(y);for(let g=0;g<3;g++){let y=g/2,c=de+y*ye;t.appendChild(ne("line",{x1:we,y1:c,x2:we+ot,y2:c,class:"chart-grid"})),o.some(z=>z.unit==="C")&&t.appendChild(ne("text",{x:we-6,y:c+4,"text-anchor":"end",class:"chart-tick"},Io(l.max-b*y,"C")+"\xB0")),o.some(z=>z.unit==="%")&&t.appendChild(ne("text",{x:we+ot+6,y:c+4,"text-anchor":"start",class:"chart-tick"},Io(100-100*y,"%")))}t.appendChild(ne("line",{x1:we,y1:ke,x2:we+ot,y2:ke,class:"chart-axis"})),o.some(g=>g.unit==="C")&&t.appendChild(ne("text",{x:9,y:de+ye/2,transform:`rotate(-90 9 ${(de+ye/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},f("overview.graph.axis.temp"))),o.some(g=>g.unit==="%")&&t.appendChild(ne("text",{x:Pe-9,y:de+ye/2,transform:`rotate(90 ${Pe-9} ${(de+ye/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},f("overview.graph.axis.demand"))),tn(t,a,n),o.forEach((g,y)=>{let c=i[y].map(C=>({x:rt(C.t,a),y:x(g,C.v)}));if(!c.length)return;let z=Fo(c);g.fill&&t.appendChild(ne("path",{d:z+` L ${c[c.length-1].x.toFixed(1)} ${ke} L ${c[0].x.toFixed(1)} ${ke} Z`,fill:g.fill,stroke:"none"})),t.appendChild(ne("path",{d:z,fill:"none",stroke:g.color,"stroke-width":String(g.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let p=[];for(let g=0;g<r.length;g++){let y=r[g];if(!y||y[0]<a)continue;let c=o.map(z=>y[z.index]);c.every(z=>z==null||!Number.isFinite(z))||p.push({t:y[0],vals:c})}if(!p.length)return null;let h=Date.now();return To(t,e,{count:p.length,plotTop:de,plotBottom:ke,xAt:g=>rt(p[g].t,a),label:g=>new Date(h-(n-p[g].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:g=>o.map((y,c)=>({y:x(y,p[g].vals[c]),color:y.color})).filter((y,c)=>Number.isFinite(p[g].vals[c])),rows:g=>o.map((y,c)=>({color:y.color,label:y.label,value:en(p[g].vals[c],y.unit)})).filter((y,c)=>Number.isFinite(p[g].vals[c]))})}function tt(t,e,o){let r=Et(t,e,o);return r.length?r[r.length-1].v:null}var fs=N({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:Qr,onMount(t,e){let o=e.querySelector(".gw-dt"),r=e.querySelector(".gw-demand-text"),a=e.querySelector(".gw-flow"),n=e.querySelector(".gw-demand"),i=Array.from(e.querySelectorAll(".gw-toggle")),l={flow:!0,return:!0,demand:!0},b=null,u=null;function m(){i.forEach(h=>{let g=h.dataset.layer;h.classList.toggle("is-off",!l[g]),h.setAttribute("aria-pressed",l[g]?"true":"false")})}function x(){let h=[];return l.flow&&h.push({index:No,color:Xr,label:f("overview.graph.layers.flow"),unit:"C",width:2.4}),l.return&&h.push({index:Do,color:Yr,label:f("overview.graph.layers.return"),unit:"C",width:2}),l.demand&&h.push({index:et,color:Ro,label:f("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),h}function p(){let h=M("zoneStateHistory"),g=h&&Array.isArray(h.entries)?h.entries:[],y=h&&h.uptime_s||Number(Date.now()/1e3)|0,c=y-Mt;if(a){b&&b();let z=tt(g,No,c),C=tt(g,Do,c),k=tt(g,et,c),T=[];z!=null&&C!=null&&T.push("\u0394 "+(z-C).toFixed(1)+"\xB0"),k!=null&&T.push(Math.round(k)+"%"),o.textContent=T.length?T.join(" \xB7 "):"\u2014",b=qo(a,a.closest(".chart-card"),x(),g,c,y)}if(n){u&&u();let z=tt(g,et,c);r.textContent=z!=null?Math.round(z)+"%":"\u2014",u=qo(n,n.closest(".chart-card"),[{index:et,color:Ro,label:f("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],g,c,y)}}i.forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.layer;l[g]=!l[g],!l.flow&&!l.return&&!l.demand&&(l[g]=!0),m(),p()})}),B("zoneStateHistory",p),_(e),m(),p()}});var ze={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Ie=24*3600,nn=Ie,qe=18,Nt=4,Se=54,at=32,Te=4,st=10,$o=6,Vo="#ffc14d",Ft=9,Ho=ee+1,jo=Te+ee*(qe+Nt)-Nt,Tt=jo+$o,nt=jo+$o+st+at,an=`
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
`;R("zone-state-timeline",an);var sn=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function ln(t,e){if(!t||!t.entries||t.entries.length===0)return null;let o=t.entries,r=t.uptime_s||e||0,a=Number(Date.now()/1e3)|0,n=1e3,i=n-Se;function l(k){let T=(k+Ie)/nn;return Se+Math.max(0,Math.min(1,T))*i}function b(k){return k-r}let u="http://www.w3.org/2000/svg",m=document.createElementNS(u,"svg");m.setAttribute("viewBox","0 0 "+n+" "+nt),m.classList.add("timeline-svg");let x=document.createElementNS(u,"rect");x.setAttribute("x",Se),x.setAttribute("y",Te),x.setAttribute("width",i),x.setAttribute("height",nt-Te-at),x.setAttribute("fill","rgba(0,32,46,0.55)"),x.setAttribute("rx","4"),m.appendChild(x);let p=l(0),h=[-24,-18,-12,-6,0].map(k=>k*3600);for(let k of h){let T=l(k),A=document.createElementNS(u,"line");A.setAttribute("x1",T),A.setAttribute("y1",Te),A.setAttribute("x2",T),A.setAttribute("y2",nt-at),A.setAttribute("stroke",k===0?"var(--series-solar)":"rgba(120,146,200,.16)"),A.setAttribute("stroke-width","1"),k===0&&(A.setAttribute("stroke-dasharray","2 3"),A.setAttribute("opacity",".55"),A.setAttribute("vector-effect","non-scaling-stroke")),m.appendChild(A)}m.appendChild(cn(u,"text",{x:p+4,y:Te+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let k=0;k<ee;k++){let T=Te+k*(qe+Nt),A=document.createElementNS(u,"rect");A.setAttribute("x",Se),A.setAttribute("y",T),A.setAttribute("width",i),A.setAttribute("height",qe),A.setAttribute("fill",k%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),m.appendChild(A);let E=document.createElementNS(u,"text");E.setAttribute("x",Se-4),E.setAttribute("y",T+qe/2+1),E.setAttribute("text-anchor","end"),E.setAttribute("dominant-baseline","middle"),E.setAttribute("fill","rgba(233,222,210,.62)"),E.setAttribute("font-size","9.5"),E.setAttribute("font-family","Montserrat, sans-serif"),E.setAttribute("font-weight","600"),E.textContent="Z"+(k+1),m.appendChild(E);let I=o.map(D=>({rel:b(D[0]),state:D[k+1]})).filter(D=>D.rel>=-Ie&&D.rel<=0),q=(D,U,G)=>{if(G===255)return;let J=ze[G]||ze[255];if(J.color==="transparent")return;let F=l(D),Z=l(U),ue=Math.max(1,Z-F),me=document.createElementNS(u,"rect");me.setAttribute("x",F),me.setAttribute("y",T+(qe-Ft)/2),me.setAttribute("width",ue),me.setAttribute("height",Ft),me.setAttribute("fill",J.color),me.setAttribute("rx",String(Ft/2)),me.setAttribute("opacity","0.9"),m.appendChild(me)};if(I.length){let D=I[0].rel,U=I[0].state;for(let G=1;G<I.length;G++){let J=I[G];J.state!==U&&(q(D,J.rel,U),D=J.rel,U=J.state)}q(D,0,U)}}{let k=document.createElementNS(u,"rect");k.setAttribute("x",Se),k.setAttribute("y",Tt),k.setAttribute("width",i),k.setAttribute("height",st),k.setAttribute("fill","rgba(188,80,144,0.10)"),k.setAttribute("rx","2"),m.appendChild(k);let T=document.createElementNS(u,"text");T.setAttribute("x",Se-4),T.setAttribute("y",Tt+st/2+1),T.setAttribute("text-anchor","end"),T.setAttribute("dominant-baseline","middle"),T.setAttribute("fill","rgba(233,222,210,.62)"),T.setAttribute("font-size","8.5"),T.setAttribute("font-family","Montserrat, sans-serif"),T.setAttribute("font-weight","600"),T.textContent=f("overview.timeline.absorb"),m.appendChild(T);let A=o.map(E=>({rel:b(E[0]),on:E.length>Ho?E[Ho]:0})).filter(E=>E.rel>=-Ie&&E.rel<=0);if(A.length){let E=(D,U)=>{let G=l(D),J=Math.max(1,l(U)-G),F=document.createElementNS(u,"rect");F.setAttribute("x",G),F.setAttribute("y",Tt),F.setAttribute("width",J),F.setAttribute("height",st),F.setAttribute("fill",Vo),F.setAttribute("rx","2"),F.setAttribute("opacity","0.9"),m.appendChild(F)},I=A[0].rel,q=A[0].on;for(let D=1;D<A.length;D++)A[D].on!==q&&(q&&E(I,A[D].rel),I=A[D].rel,q=A[D].on);q&&E(I,0)}}let g=nt-at+15,y=3600,c=Math.ceil((a-Ie)/y)*y,z=Math.floor(a/y)*y,C=Math.floor(a/y)*y;for(let k=c;k<=z;k+=y){let T=k-a,A=l(T),E=new Date(k*1e3),I=String(E.getHours()).padStart(2,"0"),q=k===C,D=document.createElementNS(u,"text");D.setAttribute("x",A),D.setAttribute("y",g),D.setAttribute("text-anchor","end"),D.setAttribute("fill",q?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),D.setAttribute("font-size","9"),D.setAttribute("font-family",'"Montserrat", sans-serif'),D.setAttribute("font-weight","500"),D.setAttribute("font-variant-numeric","tabular-nums lining-nums"),D.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),D.setAttribute("letter-spacing","0"),D.setAttribute("transform",`rotate(-45 ${A.toFixed(1)} ${g})`),D.textContent=I,m.appendChild(D)}return m}function cn(t,e,o,r){let a=document.createElementNS(t,e);for(let n in o)a.setAttribute(n,o[n]);return r!=null&&(a.textContent=r),a}function Bo(t){t.innerHTML="";let e=[{code:5,...ze[5]},{code:6,...ze[6]},{code:0,...ze[0]},{code:1,...ze[1]},{code:7,...ze[7]},{code:2,...ze[2]}];for(let r of e){let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?f(r.labelKey):""),t.appendChild(a)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Vo+'"></span>'+f("overview.timeline.preheatAbsorption"),t.appendChild(o)}var zs=N({tag:"zone-state-timeline",render:sn,onMount(t,e){let o=e.querySelector(".tl-body"),r=e.querySelector(".timeline-legend");Bo(r);function a(){let n=M("zoneStateHistory"),i=(()=>{let b=M&&M("zoneStateHistory");return b&&b.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!n||!n.entries||n.entries.length===0){let b=document.createElement("div");b.className="timeline-empty",b.textContent=f("overview.timeline.noHistory"),o.appendChild(b);return}let l=ln(n,i);l&&o.appendChild(l)}B("zoneStateHistory",a),B("zoneNames",a),w(s.drivers,a);for(let n=1;n<=ee;n++)w(d.enabled(n),a),w(d.state(n),a),w(d.temp(n),a),w(d.setpoint(n),a),w(d.preheatAdvance(n),a);_(e),a()}});var dn=`
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
`;R("zone-grid",dn);var pn=()=>'<div class="zone-grid" aria-label="Zones"></div>',Cs=N({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:pn,onMount(t,e){for(let o=1;o<=6;o++)e.appendChild(j("zone-card",{zone:o,selection:t.selection,navigate:t.navigate}))}});var un=`
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
`;R("zone-card",un);var mn=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="Open zone ${t.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${ae(t.zone)}</div>
		<div class="zc-friendly">${ve(t.zone)||"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,Ds=N({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:mn,onMount(t,e){let o=t.zone,r=d.temp(o),a=d.state(o),n=d.enabled(o),i=e.querySelector(".zc-state-label"),l=e.querySelector(".zc-zone-name"),b=e.querySelector(".zc-friendly"),u=e.querySelector(".zc-temp"),m=e.querySelector(".zc-target"),x=e.querySelector(".zc-valve-value");function p(){var E;let g=Y(n),y=String(S(a)||"").toUpperCase()||"OFF",c=String(S(d.motorLastFault(o))||"").toUpperCase(),z=c&&c!=="NONE"&&c!=="OK",C=g&&(y==="FAULT"||z)?"FAULT":y,k=t.selection&&M("selectedZone")===o,T=ve(o);l.textContent=T||"Zone "+o,b.textContent="Zone "+o+" \xB7 physical loop",u.textContent=X(L(r)),m.textContent="Applied "+X((E=L(d.effectiveSetpoint(o)))!=null?E:L(d.setpoint(o))),x.textContent=Fe(L(d.valve(o)));let A=g?C:"OFF";i.textContent=A==="HEATING"?f("state.heating"):A==="IDLE"?f("state.idle"):A==="FAULT"?f("common.fault"):A==="MANUAL"?f("state.manual"):A==="OVERHEATED"?f("state.overheated"):A==="CALIBRATING"?f("state.calibrating"):f("state.off"),e.title=z?f("zone.card.fault",{fault:c}):"",e.classList.toggle("active",k),k?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${l.textContent}, ${u.textContent}, ${m.textContent}, ${i.textContent}. Open details.`),e.classList.toggle("disabled",!g),e.classList.toggle("zs-heating",g&&A==="HEATING"),e.classList.toggle("zs-fault",g&&A==="FAULT"),e.classList.toggle("zs-idle",g&&A==="IDLE"),e.classList.toggle("zs-off",!g||A==="OFF")}function h(){De(o),t.navigate&&fe("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:o}}))}e.addEventListener("click",h),w(r,p),w(d.setpoint(o),p),w(d.effectiveSetpoint(o),p),w(d.valve(o),p),w(a,p),w(n,p),w(d.motorLastFault(o),p),B("selectedZone",p),B("zoneNames",p),p()}});var gn=`
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
`;R("zone-detail",gn);var fn=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    <div class="zd-head">
      <div class="zd-title">${ae(t.zone)}</div>
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
`;function Zo(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function Uo(t){return t!=null?Number(t).toFixed(0):"---"}function bn(t){return t!=null?Number(t).toFixed(2)+"C":"---"}function vn(t,e){if(!e)return f("common.disabled");let o=String(t||"IDLE").toUpperCase();return o==="HEATING"?f("state.heating"):o==="IDLE"?f("state.idle"):o==="OFF"?f("state.off"):o==="FAULT"?f("common.fault"):o==="MANUAL"?f("state.manual"):o==="OVERHEATED"?f("state.overheated"):o==="CALIBRATING"?f("state.calibrating"):o}var Vs=N({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:fn,methods:{update(t,e){var m,x;let o=M("selectedZone"),r=String(S(d.state(o))||"").toUpperCase(),a=Y(d.enabled(o));this.zone=o,t.dataset.zone=String(o),e.title.textContent=ae(o),e.setpoint.textContent=X((m=L(d.effectiveSetpoint(o)))!=null?m:L(d.setpoint(o))),e.base.textContent=X((x=L(d.baseSetpoint(o)))!=null?x:L(d.setpoint(o)));let n=L(d.coordinatorOffset(o));e.offset.textContent=n==null?"---":(n>0?"+":"")+Number(n).toFixed(1)+"\xB0C",e.temp.textContent=X(L(d.temp(o))),e.ret.textContent=X(L("sensor-manifold_return_temperature")),e.valve.textContent=Fe(L(d.valve(o)));let i=e.badge;i.textContent=vn(r,a);let l=a?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";i.className="zd-badge"+(l?" "+l:""),e.toggle.classList.toggle("on",a),e.orip.textContent=Uo(L(d.motorOpenRipples(o))),e.crip.textContent=Uo(L(d.motorCloseRipples(o))),e.ofac.textContent=Zo(L(d.motorOpenFactor(o))),e.cfac.textContent=Zo(L(d.motorCloseFactor(o))),e.ph.textContent=bn(L(d.preheatAdvance(o)));let b=String(S(d.motorLastFault(o))||"").toUpperCase(),u=b&&b!=="NONE"&&b!=="OK";e.fault.hidden=!u,u&&(e.faultVal.textContent=b)},incSetpoint(){let t=this.zone,e=L(d.setpoint(t))||20;xt(t,Number((e+.5).toFixed(1)))},decSetpoint(){let t=this.zone,e=L(d.setpoint(t))||20;xt(t,Number((e-.5).toFixed(1)))},toggleEnabled(){let t=this.zone,e=Y(d.enabled(t));Jt(t,!e)}},onMount(t,e){let o={title:e.querySelector(".zd-title"),setpoint:e.querySelector(".zd-setpoint"),temp:e.querySelector(".zd-temp"),base:e.querySelector(".zd-base"),offset:e.querySelector(".zd-offset"),ret:e.querySelector(".zd-ret"),valve:e.querySelector(".zd-valve"),badge:e.querySelector(".zd-badge"),toggle:e.querySelector(".btn-toggle"),inc:e.querySelector(".btn-inc"),dec:e.querySelector(".btn-dec"),orip:e.querySelector(".zd-orip"),crip:e.querySelector(".zd-crip"),ofac:e.querySelector(".zd-ofac"),cfac:e.querySelector(".zd-cfac"),ph:e.querySelector(".zd-ph"),fault:e.querySelector(".zd-fault"),faultVal:e.querySelector(".zd-fault-val")};o.inc.onclick=()=>t.incSetpoint(),o.dec.onclick=()=>t.decSetpoint(),o.toggle.onclick=()=>t.toggleEnabled();let r=()=>t.update(e,o),a=n=>{let i=M("selectedZone");(n===d.temp(i)||n===d.setpoint(i)||n===d.baseSetpoint(i)||n===d.effectiveSetpoint(i)||n===d.coordinatorOffset(i)||n===d.valve(i)||n===d.state(i)||n===d.enabled(i))&&r()};for(let n=1;n<=6;n++)w(d.temp(n),a),w(d.setpoint(n),a),w(d.baseSetpoint(n),a),w(d.effectiveSetpoint(n),a),w(d.coordinatorOffset(n),a),w(d.valve(n),a),w(d.state(n),a),w(d.enabled(n),a),w(d.motorOpenRipples(n),r),w(d.motorCloseRipples(n),r),w(d.motorOpenFactor(n),r),w(d.motorCloseFactor(n),r),w(d.preheatAdvance(n),r),w(d.motorLastFault(n),r);w("sensor-manifold_return_temperature",r),B("selectedZone",r),_(e),r()}});var hn=`
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
`;R("zone-sensor-card",hn);var xn=()=>{let t='<option value="None" data-i18n="common.none">None</option>';for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return`
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
  `};function Wo(t,e){let o=t.value,r='<option value="None" data-i18n="common.none">'+f("common.none")+"</option>";for(let a=1;a<=6;a++)a!==e&&(r+='<option value="Zone '+a+'">'+f("common.zone")+" "+a+"</option>");t.innerHTML=r,t.value=o||"None"}function yn(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":"Local Probe"}function wn(t){return t==="BLE Sensor"?"BLE":"Local Probe"}function Go(t,e){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+f("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+f("zone.sensor.bleSource")+"</option>";t.innerHTML!==o&&(t.innerHTML=o),t.value=e}var Js=N({tag:"zone-sensor-card",render:xn,onMount(t,e){let o=e.querySelector(".zs-probe"),r=e.querySelector(".zs-source"),a=e.querySelector(".zs-ble"),n=e.querySelector(".zs-sync"),i=e.querySelector(".zs-row-ble"),l=e.querySelector(".zs-scan"),b=e.querySelector(".zs-scan-list"),u=0;function m(){return M("selectedZone")}function x(){i.style.display=r.value==="BLE Sensor"?"":"none"}let p=ie(e);Go(r,"Local Probe"),p.select(o,{read:()=>S(d.probe(m()))||void 0,commit:c=>Xe(m(),"zone_probe",c)}),p.select(r,{read:()=>yn(String(S(d.tempSource(m()))||"")),commit:c=>Xe(m(),"zone_temp_source",wn(c))}),p.select(n,{read:()=>S(d.syncTo(m()))||"None",commit:c=>Xe(m(),"zone_sync_to",c)});let h=p.text(a,{read:()=>S(d.ble(m()))||"",commit:c=>yt(m(),"zone_ble_mac",c)});r.addEventListener("change",x);function g(){let c=m();u!==c?(Wo(n,c),u=c,b.style.display="none",p.discard()):p.refresh(),x()}function y(c){let z=m();(c===d.probe(z)||c===d.tempSource(z)||c===d.syncTo(z)||c===d.ble(z)||/^select-zone_\d+_sync_to$/.test(c))&&(p.refresh(),x())}l.addEventListener("click",()=>{if(l.disabled)return;l.disabled=!0,l.textContent="\u2026",b.style.display="",b.innerHTML='<div class="scan-msg">'+f("zone.sensor.scanning")+"</div>";let c=new AbortController,z=setTimeout(()=>c.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:c.signal}).then(C=>{if(!C.ok)throw new Error("HTTP "+C.status);return C.json()}).then(C=>{if(clearTimeout(z),l.disabled=!1,l.textContent=f("zone.sensor.scan"),!C.ok||!C.sensors||C.sensors.length===0){b.innerHTML='<div class="scan-msg">'+f("zone.sensor.noSensors")+"</div>";return}let k=m(),T=(S(d.ble(k))||"").toUpperCase(),A=I=>String(I).replace(/[&<>"']/g,q=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[q]),E="";for(let I of C.sensors){let q=I.mac.toUpperCase(),D=I.name?A(I.name):"",U=I.temp_c!=null?I.temp_c.toFixed(1)+"\xB0C":"\u2014",G=I.rssi!=null?I.rssi+" dBm":"",J=I.age_s<60?f("common.secondsAgo",{value:I.age_s}):f("common.minutesAgo",{value:Math.round(I.age_s/60)}),F="";q===T?F='<span class="ble-badge">'+f("zone.sensor.assignedThisZone")+"</span>":I.zone>0&&(F='<span class="ble-badge">'+f("zone.sensor.zoneBadge",{zone:I.zone})+"</span>");let Z=D?`<div class="ble-mac">${D}</div><div class="ble-meta">${q}</div>`:`<div class="ble-mac">${q}</div>`;E+=`<div class="ble-scan-item">
              <div>
                ${Z}
                <div class="ble-meta">${U} &nbsp;${G} &nbsp;${J}</div>
                ${F}
              </div>
              <button class="btn-assign" data-mac="${q}">${f("zone.sensor.assign")}</button>
            </div>`}b.innerHTML=E,b.querySelectorAll(".btn-assign").forEach(I=>{I.addEventListener("click",()=>{a.value=I.dataset.mac,h.markDirty(),b.style.display="none"})})}).catch(C=>{clearTimeout(z),l.disabled=!1,l.textContent=f("zone.sensor.scan");let k=C&&C.name==="AbortError"?f("zone.sensor.scanTimeout"):f("zone.sensor.scanFailed");b.innerHTML='<div class="scan-msg">'+k+"</div>"})}),B("selectedZone",g);for(let c=1;c<=6;c++)w(d.probe(c),y),w(d.tempSource(c),y),w(d.syncTo(c),y),w(d.ble(c),y);_(e),g()}});var zn=".zone-room-card { height: 100%; }";R("zone-room-card",zn);var kn=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,si=N({tag:"zone-room-card",render:kn,onMount(t,e){let o=e.querySelector(".zr-friendly");function r(){return M("selectedZone")}let a=ie(e);a.text(o,{read:()=>ve(r())||"",commit:n=>ro(r(),n)}),B("selectedZone",a.discard),B("zoneNames",a.refresh),_(e),a.refresh()}});var pe=6,Sn="var(--flow-disabled)",Xo="var(--flow-unknown)",Yo="var(--accent)",He="var(--flow-return)",Rt="var(--text-strong)",_n="var(--flow-disabled)",_e="var(--flow-label)",it="var(--flow-disabled)",Dt="var(--flow-label)",Jo="var(--flow-label)",Ko="var(--flow-return)",Cn="#66BB6A",Ln="#FF6361",V={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},P={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},An=`
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
`;R("flow-diagram",An);function Mn(t,e){let o=String(ve(t)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>e?r.slice(0,Math.max(1,e-1))+"\u2026":r}function En(t){if(!t)return null;let e=String(t).match(/(\d+)/);if(!e)return null;let o=Number(e[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Fn(t,e){return e?t==null||Number.isNaN(t)?Xo:t>0?Yo:_e:Sn}function Qo(t){let e=t==="desktop"?"0 1":"1 0",o=[];o.push("<defs>");for(let r=1;r<=pe;r++)o.push('<linearGradient id="'+t+"-rg"+r+'" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'">'),o.push('<stop id="'+t+"-rgs"+r+'" offset="0%" stop-color="var(--accent)" stop-opacity=".96"/>'),o.push('<stop id="'+t+"-rga"+r+'" offset="100%" stop-color="var(--accent)" stop-opacity=".7"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function Tn(t){let e=V.boxX+V.boxW/2+(t-2.5)*V.srcSpread,o=V.zoneXs[t];return"M"+e.toFixed(1)+" "+V.srcY+" C"+e.toFixed(1)+" "+V.fanY+" "+o.toFixed(1)+" "+(V.fanY+34)+" "+o.toFixed(1)+" "+(V.zoneY-20)}function Nn(t){let e=P.midY+(t-2.5)*P.spread,o=P.zoneYs[t],r=P.endX-P.srcX;return"M"+P.srcX+" "+e.toFixed(1)+" C"+(P.srcX+r*.34)+" "+e.toFixed(1)+" "+(P.srcX+r*.7)+" "+o.toFixed(1)+" "+P.endX+" "+o.toFixed(1)}function er(t,e,o){let r=V.boxX+V.boxW/2+(t-2.5)*V.srcSpread,a=V.srcY,n=V.zoneXs[t],i=V.zoneY-20,l=V.fanY,b=V.fanY+34;return"M"+(r-e).toFixed(1)+" "+a+" C"+(r-e).toFixed(1)+" "+l+" "+(n-o).toFixed(1)+" "+b+" "+(n-o).toFixed(1)+" "+i+" L"+(n+o).toFixed(1)+" "+i+" C"+(n+o).toFixed(1)+" "+b+" "+(r+e).toFixed(1)+" "+l+" "+(r+e).toFixed(1)+" "+a+"Z"}function tr(t,e,o){let r=P.midY+(t-2.5)*P.spread,a=P.zoneYs[t],n=P.endX-P.srcX,i=P.srcX+n*.34,l=P.srcX+n*.7;return"M"+P.srcX+" "+(r-e).toFixed(1)+" C"+i+" "+(r-e).toFixed(1)+" "+l+" "+(a-o).toFixed(1)+" "+P.endX+" "+(a-o).toFixed(1)+" L"+P.endX+" "+(a+o).toFixed(1)+" C"+l+" "+(a+o).toFixed(1)+" "+i+" "+(r+e).toFixed(1)+" "+P.srcX+" "+(r+e).toFixed(1)+"Z"}function or(t,e,o){return'<rect width="'+t+'" height="'+e+'" rx="10" fill="var(--surface-raised)"/>'}function rr(t){let e=t==="desktop"?V:P,o=t==="desktop"?e.boxY+27:e.boxY+29,r=t==="desktop"?e.boxY+56:e.boxY+58;return'<rect x="'+e.boxX+'" y="'+e.boxY+'" width="'+e.boxW+'" height="'+e.boxH+'" rx="7" fill="var(--flow-source-bg)" stroke="var(--accent)" stroke-width="2"/><text id="'+t+'-fd-flow-label" x="'+(e.boxX+e.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(t==="desktop"?20:19)+'" font-weight="800" fill="var(--accent)" letter-spacing="2">'+f("overview.flowDiagram.flow")+'</text><text id="'+t+'-fd-flow-temp" class="flow-metric" x="'+(e.boxX+e.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(t==="desktop"?29:27)+'" fill="var(--text-strong)">---</text>'}function Dn(){let t=[],e=V.w,o=V.h,r=V.zoneY-20;t.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+e+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(Qo("desktop")),t.push(or(e,o,"desktop")),t.push(rr("desktop")),t.push('<text id="desktop-fd-ret-temp" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+20)+'" font-size="17" font-weight="800" fill="'+He+'" font-family="var(--mono)">'+f("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="desktop-fd-dt-label" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+42)+'" font-size="13" font-weight="800" fill="'+Jo+'" letter-spacing="2">'+f("overview.flowDiagram.dt")+"</text>"),t.push('<text id="desktop-fd-dt" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+66)+'" class="flow-metric" font-size="24" fill="var(--accent)">---</text>');for(let a=1;a<=pe;a++)t.push('<path id="desktop-fd-track-'+a+'" class="flow-track" d="'+Tn(a-1)+'" opacity=".7"/>');for(let a=1;a<=pe;a++)t.push('<path id="desktop-fd-path-'+a+'" class="flow-ribbon" d="'+er(a-1,V.srcHW,V.bgDstHW)+'" fill="url(#desktop-rg'+a+')" opacity="1"/>');t.push('<line x1="54" y1="'+r+'" x2="'+(e-54)+'" y2="'+r+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');for(let a=1;a<=pe;a++){let n=V.zoneXs[a-1];t.push('<g class="flow-zone-hit">'),t.push('<line id="desktop-fd-tick-'+a+'" x1="'+n+'" y1="'+(r-8)+'" x2="'+n+'" y2="'+(r+8)+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="desktop-fd-zn'+a+'" x="'+n+'" y="'+(r-13)+'" text-anchor="middle" font-size="15" fill="'+Rt+'" font-weight="800" letter-spacing="1.5">Z'+a+"</text>"),t.push('<text id="desktop-fd-zf'+a+'" x="'+n+'" y="'+(r+21)+'" text-anchor="middle" font-size="11.5" fill="'+_e+'" font-weight="700" letter-spacing=".55">---</text>'),t.push('<text id="desktop-fd-zsp'+a+'" x="'+n+'" y="'+(r+21)+'" text-anchor="middle" font-size="10.5" fill="'+it+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="desktop-fd-zt'+a+'" x="'+n+'" y="'+(r+44)+'" text-anchor="middle" class="flow-metric" font-size="17" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="desktop-fd-zv'+a+'" x="'+(n-30)+'" y="'+(r+64)+'" text-anchor="middle" class="flow-metric" font-size="14" fill="'+_e+'">---%</text>'),t.push('<text id="desktop-fd-zr'+a+'" x="'+(n+30)+'" y="'+(r+64)+'" text-anchor="middle" class="flow-metric" font-size="14" fill="'+He+'">---</text>'),t.push("</g>")}return t.push("</svg>"),t.join("")}function Rn(){let t=[],e=P.w,o=P.h;t.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+e+" "+o+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(Qo("mobile")),t.push(or(e,o,"mobile")),t.push(rr("mobile"));for(let r=1;r<=pe;r++)t.push('<path id="mobile-fd-track-'+r+'" class="flow-track" d="'+Nn(r-1)+'" opacity=".7"/>');for(let r=1;r<=pe;r++)t.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+tr(r-1,P.srcHW,P.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');t.push('<rect x="'+(P.boxX+9)+'" y="'+(P.boxY+P.boxH+9)+'" width="'+(P.boxW-18)+'" height="60" rx="8" fill="var(--flow-source-bg)" stroke="var(--flow-return)" stroke-opacity=".7"/>'),t.push('<text id="mobile-fd-ret-temp" x="'+(P.boxX+P.boxW/2)+'" y="'+(P.boxY+P.boxH+27)+'" text-anchor="middle" font-size="14" font-weight="800" fill="'+He+'" font-family="var(--mono)">'+f("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="mobile-fd-dt-label" x="'+(P.boxX+P.boxW/2)+'" y="'+(P.boxY+P.boxH+43)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="'+Jo+'" letter-spacing="1.1">'+f("overview.flowDiagram.dt")+"</text>"),t.push('<text id="mobile-fd-dt" x="'+(P.boxX+P.boxW/2)+'" y="'+(P.boxY+P.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="var(--accent)">---</text>'),t.push('<line x1="'+P.endX+'" y1="34" x2="'+P.endX+'" y2="'+(o-34)+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>'),t.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="12" fill="'+Dt+'" font-weight="700" letter-spacing="1.2">'+f("overview.graph.layers.temp").toUpperCase()+"</text>"),t.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="12" fill="'+Dt+'" font-weight="700" letter-spacing="1.2">'+f("overview.flowDiagram.flow")+"</text>"),t.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="12" fill="'+Dt+'" font-weight="700" letter-spacing="1.2">'+f("overview.flowDiagram.returnShort")+"</text>");for(let r=1;r<=pe;r++){let a=P.zoneYs[r-1];t.push('<line id="mobile-fd-tick-'+r+'" x1="'+(P.endX-8)+'" y1="'+a+'" x2="'+(P.endX+8)+'" y2="'+a+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="mobile-fd-zn'+r+'" x="'+(P.endX-14)+'" y="'+(a+5)+'" text-anchor="end" font-size="14" fill="'+Rt+'" font-weight="800" letter-spacing="1.2">Z'+r+"</text>"),t.push('<text id="mobile-fd-zf'+r+'" x="'+P.nameX+'" y="'+(a-8)+'" text-anchor="middle" font-size="10.5" fill="'+_e+'" font-weight="700" letter-spacing=".5">---</text>'),t.push('<text id="mobile-fd-zsp'+r+'" x="'+P.nameX+'" y="'+(a+8)+'" text-anchor="middle" font-size="10" fill="'+it+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(a+5)+'" class="flow-metric" font-size="15" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(a+5)+'" class="flow-metric" font-size="15" fill="'+_e+'">---%</text>'),t.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(a+5)+'" class="flow-metric" font-size="15" fill="'+He+'">---</text>')}return t.push("</svg>"),t.join("")}var On=()=>'<div class="flow-wrap" role="img" aria-label="'+f("overview.flowDiagram.flow")+'">'+Dn()+Rn()+"</div>";N({tag:"flow-diagram",render:On,onMount(t,e){let o=["desktop","mobile"],r={};o.forEach(u=>{r[u]={flowEl:e.querySelector("#"+u+"-fd-flow-temp"),flowLabelEl:e.querySelector("#"+u+"-fd-flow-label"),retEl:e.querySelector("#"+u+"-fd-ret-temp"),dtLabelEl:e.querySelector("#"+u+"-fd-dt-label"),dtEl:e.querySelector("#"+u+"-fd-dt"),zones:new Array(pe+1)};for(let m=1;m<=pe;m++)r[u].zones[m]={textTemp:e.querySelector("#"+u+"-fd-zt"+m),textSetpoint:e.querySelector("#"+u+"-fd-zsp"+m),textFlow:e.querySelector("#"+u+"-fd-zv"+m),textRet:e.querySelector("#"+u+"-fd-zr"+m),label:e.querySelector("#"+u+"-fd-zn"+m),friendly:e.querySelector("#"+u+"-fd-zf"+m),track:e.querySelector("#"+u+"-fd-track-"+m),tick:e.querySelector("#"+u+"-fd-tick-"+m),path:e.querySelector("#"+u+"-fd-path-"+m)}});function a(u,m){u&&(u.textContent=m)}function n(u,m,x,p,h){let g=r[u];a(g.flowLabelEl,f("overview.flowDiagram.flow")),a(g.flowEl,X(m)),a(g.retEl,f("overview.flowDiagram.returnShort")+" "+X(x)),a(g.dtLabelEl,f("overview.flowDiagram.dt")),a(g.dtEl,p==null?"---":p.toFixed(1)+"\xB0C"),g.dtEl&&g.dtEl.setAttribute("fill",h)}function i(){a(e.querySelector("#mobile-fd-temp-head"),f("overview.graph.layers.temp").toUpperCase()),a(e.querySelector("#mobile-fd-flow-head"),f("overview.flowDiagram.flow")),a(e.querySelector("#mobile-fd-ret-head"),f("overview.flowDiagram.returnShort"))}function l(u,m,x){let p=r[u].zones[m];if(!p)return;let{enabled:h,pct:g,temp:y,setpoint:c,valve:z,returnTemp:C,hasReturn:k}=x,T=Mn(m,u==="desktop"?11:12),A=X(y),E=c!=null?X(c):"";a(p.label,"Z"+m),a(p.friendly,u==="desktop"?(T||"---")+(E?" ("+E+")":""):T||"---"),a(p.textTemp,A),a(p.textSetpoint,u==="desktop"?"":E?"("+E+")":""),a(p.textFlow,Fe(z)),a(p.textRet,k?X(C):"---"),p.label.setAttribute("fill",h?Rt:_n),p.friendly.setAttribute("fill",h?_e:it),p.textSetpoint.setAttribute("fill",h?_e:it),p.textFlow.setAttribute("fill",Fn(g,h)),p.textRet.setAttribute("fill",k&&h?He:Xo);let I=h&&g!=null&&g>0;p.track.setAttribute("opacity",h?".78":".38"),p.track.setAttribute("stroke-dasharray",h?"none":"5 7"),p.tick.setAttribute("stroke",I?Yo:"var(--flow-track)"),p.tick.setAttribute("stroke-width",I?"3":"2");let q=p.path;if(!I)q.setAttribute("opacity","0");else{let D=u==="desktop"?V:P,U=Math.max(2.5,g*D.bgDstHW),G=Math.max(1.3,g*D.srcHW);q.setAttribute("d",u==="desktop"?er(m-1,G,U):tr(m-1,G,U)),q.setAttribute("fill","url(#"+u+"-rg"+m+")"),q.setAttribute("opacity",".96")}}function b(){let u=L(s.flow),m=L(s.ret),x=u!=null&&m!=null?Number(u)-Number(m):null,p=x==null||x<3?Ko:x>8?Ln:Cn;o.forEach(h=>n(h,u,m,x,p));for(let h=1;h<=pe;h++){let g=L(d.temp(h)),y=L(d.setpoint(h)),c=L(d.valve(h)),z=Y(d.enabled(h)),C=String(S(d.tempSource(h))||"Local Probe"),k=En(S(d.probe(h))||""),T=k?L(d.probeTemp(k)):null,A=C!=="Local Probe"&&T!=null&&!Number.isNaN(Number(T)),E=c!=null?Math.max(0,Math.min(100,Number(c)))/100:null,I={enabled:z,pct:E,temp:g,setpoint:y,valve:c,returnTemp:T,hasReturn:A};o.forEach(q=>l(q,h,I))}}w(s.flow,b),w(s.ret,b),B("zoneNames",b);for(let u=1;u<=pe;u++)w(d.temp(u),b),w(d.setpoint(u),b),w(d.valve(u),b),w(d.enabled(u),b),w(d.probe(u),b),w(d.tempSource(u),b);for(let u=1;u<=8;u++)w(d.probeTemp(u),b);i(),b()}});var Pn={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},In=`
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
`;R("logs-view",In);var qn=()=>`
  <div class="logs-view">
    <div class="card-title">
      <span data-i18n="logs.deviceLogs">Device Logs</span>
      <div class="actions">
        <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
        <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
        <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      </div>
    </div>
    <div class="logs-stream"></div>
  </div>
`;function Hn(t){let e=Pn[t.level]||{label:"?",color:"var(--text-secondary)"},o=nr(t.tag||""),r=nr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function nr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var xi=N({tag:"logs-view",render:qn,onMount(t,e){let o=e.querySelector(".logs-stream"),r=e.querySelector(".pause-btn"),a=e.querySelector(".clear-btn"),n=e.querySelector(".download-btn"),i=!1;function l(){if(i)return;let b=Ue();if(!b||!b.length){o.innerHTML='<div class="logs-empty">'+f("logs.waiting")+"</div>";return}let u=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=b.map(Hn).join(""),u&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{i=!i,r.textContent=i?f("logs.resume"):f("logs.pause"),r.classList.toggle("on",i),i||l()}),a.addEventListener("click",()=>{Bt()}),n.addEventListener("click",()=>{n.disabled=!0,yo().catch(b=>{console.error("[Logs] download failed:",b),window.alert(f("logs.downloadFailed"))}).finally(()=>{n.disabled=!1})}),B("deviceLog",l),_(e),l()}});var Bn=`
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
}`;R("diag-i2c",Bn);var $n=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,Ci=N({tag:"diag-i2c",render:$n,onMount(t,e){let o=e.querySelector("#i2c-result");function r(){o.textContent=M("i2cResult")||f("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{eo()}),B("i2cResult",r),_(e),r()}});var Vn=`
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
`;R("diag-manual-badge",Vn);var jn=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Ti=N({tag:"diag-manual-badge",render:jn,onMount(t,e){let o=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function r(){let a=!!M("manualMode");o&&o.classList.toggle("on",a)}B("manualMode",r),_(e),r()}});var Zn=`
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
`;R("diag-zone-motor",Zn);var Un=t=>{let e=t.zone||M("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===e?" selected":"")+">"+f("common.zone")+" "+r+"</option>";return`
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
  `},Hi=N({tag:"diag-zone-motor-card",render:Un,onMount(t,e){let o=Number(t.zone||M("selectedZone")||1),r=!!M("manualMode"),a=e.querySelector(".manual-mode-toggle"),n=e.querySelector(".motor-gated"),i=e.querySelector(".motor-zone-select"),l=e.querySelector(".motor-target-input"),b=e.querySelector(".motor-open-btn"),u=e.querySelector(".motor-close-btn"),m=e.querySelector(".motor-stop-btn"),x=()=>{let y=i.value||String(o),c="";for(let z=1;z<=6;z++)c+='<option value="'+z+'">'+f("common.zone")+" "+z+"</option>";i.innerHTML=c,i.value=y};function p(y){r=!!y,a&&(a.classList.toggle("on",r),a.setAttribute("aria-checked",r?"true":"false")),n&&n.classList.toggle("locked",!r),[i,l,b,u,m].forEach(c=>{c&&(c.disabled=!r)})}function h(){let y=!r;if(p(y),y){zt(!0);for(let c=1;c<=6;c++)wt(c)}else zt(!1)}function g(){let y=L(d.motorTarget(o));l&&y!=null?l.value=Number(y).toFixed(0):l&&(l.value="0")}i==null||i.addEventListener("change",()=>{o=Number(i.value||1),g()}),a==null||a.addEventListener("click",h),a==null||a.addEventListener("keydown",y=>{y.key!==" "&&y.key!=="Enter"||(y.preventDefault(),h())});for(let y=1;y<=6;y++)w(d.motorTarget(y),g);g(),p(r),B("manualMode",()=>{p(!!M("manualMode"))}),_(e),l==null||l.addEventListener("change",y=>{if(!r)return;let c=y.target.value;no(o,c)}),b==null||b.addEventListener("click",()=>{r&&ao(o,1e4)}),u==null||u.addEventListener("click",()=>{r&&so(o,1e4)}),m==null||m.addEventListener("click",()=>{r&&wt(o)})}});var Wn=`
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
`;R("diag-zone-recovery",Wn);var Gn=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title" data-i18n="diagnostics.recovery.title">Motor recovery</div>
      <div class="recovery-note" data-i18n="diagnostics.recovery.note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="recovery-actions"><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.clearFaultTitle">Clear current fault</strong><span data-i18n="diagnostics.recovery.clearFaultHelp">Acknowledge the current motor fault without changing learned values.</span></div><button class="btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Clear fault</button></div><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.resetFactorsTitle">Reset learned factors</strong><span data-i18n="diagnostics.recovery.resetFactorsHelp">Remove calibration values while leaving the valve stopped.</span></div><button class="btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset factors\u2026</button></div><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.relearnTitle">Reset and relearn</strong><span data-i18n="diagnostics.recovery.relearnHelp">Reset calibration and start a complete motor learning cycle.</span></div><button class="btn warn recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset and relearn\u2026</button></div></div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,Wi=N({tag:"diag-zone-recovery-card",render:Gn,onMount(t,e){let o=Number(M("selectedZone")||1),r=e.querySelector(".recovery-fault-btn"),a=e.querySelector(".recovery-factors-btn"),n=e.querySelector(".recovery-relearn-btn"),i=e.querySelector(".recovery-status");B("selectedZone",()=>{o=Number(M("selectedZone")||1)});let l=null;function b(m,x){i.textContent=m,i.className="recovery-status show "+(x?"ok":"err"),clearTimeout(l),l=setTimeout(()=>{i.classList.remove("show")},4e3)}function u(m,x){let p=m(o);b(x,!0),p&&typeof p.then=="function"&&p.then(h=>{h&&h.ok===!1&&b(f("diagnostics.recovery.rejected"),!1)}).catch(()=>b(f("diagnostics.recovery.unreachable"),!1))}r==null||r.addEventListener("click",()=>{u(io,"\u2713 "+f("diagnostics.recovery.faultSent",{zone:ae(o)}))}),a==null||a.addEventListener("click",()=>{confirm(f("diagnostics.recovery.confirmFactors",{zone:ae(o)}))&&u(lo,"\u2713 "+f("diagnostics.recovery.factorsReset",{zone:ae(o)}))}),n==null||n.addEventListener("click",()=>{confirm(f("diagnostics.recovery.confirmRelearn",{zone:ae(o)}))&&u(co,"\u2713 "+f("diagnostics.recovery.relearnStarted",{zone:ae(o)}))}),_(e)}});var Kn=`
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
.diag-system-card .sys-cell-wide { grid-column: 1 / -1; }
.diag-system-card .sys-value-text { font-size: .95rem; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;R("diag-system-card",Kn);var Xn=()=>`
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
      <div class="sys-cell sys-cell-wide">
        <div class="sys-label" data-i18n="diagnostics.system.resetReason">Last reset reason</div>
        <div class="sys-value sys-value-text" data-k="reset">\u2014</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button" data-i18n="diagnostics.system.dump">Dump task stats to log</button>
    <div class="ui-note" data-i18n="diagnostics.system.note">Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.</div>
  </div>
`,tl=N({tag:"diag-system-card",render:Xn,onMount(t,e){let o=e.querySelector('[data-k="cpu0"]'),r=e.querySelector('[data-k="cpu1"]'),a=e.querySelector('[data-k="heap"]'),n=e.querySelector('[data-k="psram"]'),i=e.querySelector('[data-bar="cpu0"]'),l=e.querySelector('[data-bar="cpu1"]'),b=e.querySelector('[data-k="reset"]'),u=(p,h,g)=>{if(g==null||!Number.isFinite(Number(g))){p.textContent="\u2014",p.classList.remove("warn"),h.style.width="0%";return}let y=Math.max(0,Math.min(100,Number(g)));p.textContent=y.toFixed(0)+"%",p.classList.toggle("warn",y>=90),h.style.width=y+"%"},m=(p,h,g)=>{if(h==null||!Number.isFinite(Number(h))){p.textContent="\u2014";return}let y=Number(h);p.textContent=y+" KB",p.classList.toggle("warn",g!=null&&y<g)},x=()=>{u(o,i,L(s.cpuLoadCore0)),u(r,l,L(s.cpuLoadCore1)),m(a,L(s.freeInternalKb),48),m(n,L(s.freePsramKb),null);let p=String(S(s.resetReason)||M("resetReason")||"").trim();b.textContent=p||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{po().catch(p=>console.error("[System] dump failed:",p))}),w(s.cpuLoadCore0,x),w(s.cpuLoadCore1,x),w(s.freeInternalKb,x),w(s.freePsramKb,x),w(s.resetReason,x),B("resetReason",x),_(e),x()}});var Yn=`
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
`;R("settings-manifold-card",Yn);var Jn=()=>{let t="";for(let o=1;o<=8;o++)t+="<option>Probe "+o+"</option>";let e="";for(let o=1;o<=8;o++)e+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${te("settings.manifold.help")}</span></div>
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
  `},pl=N({tag:"settings-manifold-card",render:Jn,onMount(t,e){let o=e.querySelector(".sm-type"),r=e.querySelector(".sm-flow"),a=e.querySelector(".sm-ret"),n=ie(e);n.select(o,{read:()=>S(s.manifoldType)||"NO (Normally Open)",commit:l=>le("manifold_type",l)}),n.select(r,{read:()=>S(s.manifoldFlowProbe)||"Probe 7",commit:l=>le("manifold_flow_probe",l)}),n.select(a,{read:()=>S(s.manifoldReturnProbe)||"Probe 8",commit:l=>le("manifold_return_probe",l)});function i(){for(let l=1;l<=8;l++){let b=e.querySelector('[data-probe="'+l+'"]');b&&(b.textContent=X(L(d.probeTemp(l))))}}w(s.manifoldType,n.refresh),w(s.manifoldFlowProbe,n.refresh),w(s.manifoldReturnProbe,n.refresh);for(let l=1;l<=8;l++)w(d.probeTemp(l),i);_(e),n.refresh(),i()}});var Qn=`
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
`;R("settings-touch-card",Qn);var ea=()=>`
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
  </div>`,hl=N({tag:"settings-touch-card",render:ea,onMount(t,e){let o=e.querySelector(".touch-status"),r=e.querySelector(".touch-status-copy"),a=e.querySelector(".touch-identity"),n=e.querySelector(".touch-note"),i=e.querySelector(".touch-error"),l=e.querySelector(".touch-approve"),b=e.querySelector(".touch-disconnect");function u(){let m=Y(s.authorityConfigured),x=Y(s.authorityProposalPending),p=S(s.authorityState)||"unconfigured",h=x?S(s.authorityProposalInstallationId):S(s.authorityInstallationId),g=x?S(s.authorityProposalCoordinatorId):S(s.authorityCoordinatorId),y=S(s.authorityProposalName)||"Lune Touch",c=S(s.authorityProposalSite)||"House";o.classList.toggle("connected",m&&!x),o.classList.toggle("pending",x),r.innerHTML=x?`<strong>${y} is ready to connect</strong>${m?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:m?`<strong>Control approved</strong>${p.replace(/_/g," ")}${Number(L(s.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(L(s.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",a.hidden=!m&&!x,e.querySelector(".touch-name").textContent=x?y:"Lune Touch",e.querySelector(".touch-site").textContent=x?c:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=h||"\u2014",e.querySelector(".touch-coordinator-value").textContent=g||"\u2014",n.textContent=x?"Approval is local to this manifold. Discovery alone never grants control.":m?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",l.hidden=!x,b.hidden=!m||x}l.addEventListener("click",async()=>{i.textContent="",l.disabled=!0,l.textContent="Approving\u2026";try{await to()}catch(m){i.textContent=(m==null?void 0:m.message)||"Unable to approve Lune Touch."}finally{l.disabled=!1,l.textContent="Approve Lune Touch"}}),b.addEventListener("click",async()=>{if(i.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){b.disabled=!0;try{await oo()}catch(m){i.textContent=(m==null?void 0:m.message)||"Unable to disconnect Lune Touch."}finally{b.disabled=!1}}}),[s.authorityConfigured,s.authorityInstallationId,s.authorityCoordinatorId,s.authorityState,s.authorityLeaseRemainingS,s.authorityProposalPending,s.authorityProposalInstallationId,s.authorityProposalCoordinatorId,s.authorityProposalName,s.authorityProposalSite].forEach(m=>w(m,u)),u()}});var ta=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${te("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`,Cl=N({tag:"settings-minimum-flow-card",render:ta,onMount(t,e){let o=e.querySelector(".smf-always"),r=e.querySelector(".smf-pct"),a=e.querySelector(".smf-pct-row"),n=ie(e),i=l=>{a.hidden=!l,a.setAttribute("aria-hidden",l?"false":"true"),r.disabled=!l};n.toggle(o,{read:()=>Y(s.minimumFlowAlways),onChange:i,commit:l=>{let b=l?"on":"off";v(s.minimumFlowAlways,{state:b}),le("minimum_flow_always",b).catch(()=>v(s.minimumFlowAlways,{state:l?"off":"on"}))}}),n.num(r,{read:()=>L(s.minZoneFlowPct),commit:l=>{v(s.minZoneFlowPct,{value:l}),ce("min_zone_flow_pct",l)}}),w(s.minimumFlowAlways,n.refresh),w(s.minZoneFlowPct,n.refresh),_(e),n.refresh()}});var oa=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function ra(){if(String(S(s.bleClockSyncAdvertising)||"").toLowerCase()==="on")return f("common.clockSyncing");let t=String(S(s.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return f("settings.bleClock.waitingClock");if(t==="ble_busy")return f("settings.bleClock.busy");if(t)return t;let e=Number(L(s.bleClockSyncLastOkS)||0);if(!e)return f("settings.bleClock.never");let o=Math.max(0,Math.round(Date.now()/1e3)-e);if(o<60)return f("common.secondsAgo",{value:o});if(o<3600)return f("common.minutesAgo",{value:Math.round(o/60)});let r=Math.round(o/3600);return f("settings.bleClock.hoursAgo",{value:r})}var na=()=>`
  <div class="ui-card settings-ble-clock-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.bleClock.title">Room clocks</span>${te("settings.bleClock.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.bleClock.enabledSub">Broadcast time so nearby Shelly BLU displays can correct drift.</span></span>
      <span class="ui-field"><div class="ui-toggle sbc-enabled" role="switch" data-i18n-label="settings.bleClock.title" aria-label="Enable room clock sync"></div></span>
    </div>
    <div class="ui-row sbc-interval-row">
      <span class="ui-label"><span data-i18n="settings.bleClock.interval">Broadcast interval</span> <span class="ui-sublabel" data-i18n="settings.bleClock.intervalSub">Short bursts. Displays usually apply time about once a day.</span></span>
      <span class="ui-field"><select class="ui-select sbc-interval"></select></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.bleClock.lastSync">Last broadcast</span> <span class="sbc-status ui-sublabel">\u2014</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbc-now" data-i18n="settings.bleClock.syncNow">Sync now</button></span>
    </div>
  </div>
`,Dl=N({tag:"settings-ble-clock-card",render:na,onMount(t,e){let o=e.querySelector(".sbc-enabled"),r=e.querySelector(".sbc-interval"),a=e.querySelector(".sbc-status"),n=e.querySelector(".sbc-now"),i=ie(e),l=()=>{let u=r.value;r.innerHTML=oa.map(m=>`<option value="${m.value}">${f(m.labelKey)}</option>`).join(""),u&&(r.value=u)},b=()=>{a.textContent=ra()};l(),i.toggle(o,{read:()=>Y(s.bleClockSyncEnabled),commit:u=>{let m=u?"on":"off";v(s.bleClockSyncEnabled,{state:m}),le("ble_clock_sync_enabled",m).catch(()=>v(s.bleClockSyncEnabled,{state:u?"off":"on"}))}}),i.select(r,{read:()=>String(Math.round(Number(L(s.bleClockSyncIntervalMin))||60)),commit:u=>{let m=Number(u);v(s.bleClockSyncIntervalMin,{value:m}),ce("ble_clock_sync_interval_min",m)}}),n.addEventListener("click",()=>{v(s.bleClockSyncAdvertising,{state:"on"}),b(),se("ble_clock_sync_now")}),w(s.bleClockSyncEnabled,i.refresh),w(s.bleClockSyncIntervalMin,i.refresh),w(s.bleClockSyncLastOkS,b),w(s.bleClockSyncLastError,b),w(s.bleClockSyncAdvertising,b),_(e),i.refresh(),b()}});var aa=`
.settings-card{background:var(--surface-raised);border:1px solid var(--separator);border-radius:10px;padding:18px;box-shadow:none}
.settings-card .card-title{margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--separator);color:var(--text-strong);font-size:.92rem;font-weight:650}
.settings-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-card .btn{width:100%;min-width:0;min-height:44px;padding:9px 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;cursor:pointer}
.settings-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;R("settings-control-card",aa);var sa=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Recovery actions</div>
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,Hl=N({tag:"settings-control-card",render:sa,onMount(t,e){_(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&se("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{se("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&se("restart")})}});var ia=`
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
`;R("settings-motor-calibration-card",ia);var lt=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:s.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:s.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:s.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:s.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:s.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:s.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:s.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:s.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:s.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:s.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:s.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:s.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],la=()=>{let t="";for(let e=0;e<lt.length;e++){let o=lt[e];if(o.key==="generic_runtime_limit_seconds")continue;let r=ca(o.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+f(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${te("settings.motor.help")}</span></div>
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
  `};function ca(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var Kl=N({tag:"settings-motor-calibration-card",render:la,onMount(t,e){let o=e.querySelector(".smc-profile"),r=e.querySelector(".smc-safe-runtime"),a=e.querySelector(".mc-drivers-toggle"),n=ie(e);function i(b){if(b==="HmIP VdMot"&&ce("hmip_runtime_limit_seconds",40),b==="Generic"){let u=Number(L(s.genericRuntimeLimitSeconds));(!Number.isFinite(u)||u<=0)&&ce("generic_runtime_limit_seconds",45)}}n.toggle(a,{read:()=>Y(s.drivers),commit:b=>Qt(b)}),n.select(o,{read:()=>S(s.motorProfileDefault)||"HmIP VdMot",commit:b=>{le("motor_profile_default",b),i(b)}});function l(){let b=S(s.motorProfileDefault)||"HmIP VdMot";r.disabled=b==="HmIP VdMot"}n.num(r,{read:()=>(S(s.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:L(s.genericRuntimeLimitSeconds),commit:b=>{o.value==="Generic"&&ce("generic_runtime_limit_seconds",b)}});for(let b=0;b<lt.length;b++){let u=lt[b];if(u.key==="generic_runtime_limit_seconds")continue;let m=e.querySelector(".smc-"+u.cls);m&&(n.num(m,{read:()=>L(u.id),commit:x=>ce(u.key,x)}),w(u.id,n.refresh))}w(s.drivers,n.refresh),w(s.motorProfileDefault,()=>{n.refresh(),l()}),w(s.genericRuntimeLimitSeconds,n.refresh),w(s.hmipRuntimeLimitSeconds,n.refresh),_(e),i(S(s.motorProfileDefault)||"HmIP VdMot"),n.refresh(),l()}});var da=600*1e3,ar=600,pa=`
.settings-firmware-card .sfw-version { font-family: var(--mono); font-size: .95rem; font-weight: 700; color: var(--text-strong); }
.settings-firmware-card .sfw-status { min-height: 1.1em; color: var(--text-muted); font-size: .82rem; font-weight: 600; }
.settings-firmware-card .sfw-status.ok { color: var(--state-ok); }
.settings-firmware-card .sfw-status.err { color: var(--state-danger); }
.settings-firmware-card .sfw-banner { margin: 12px 0 2px; padding: 14px 16px; border: 1px solid var(--accent-border); border-radius: 10px; background: var(--accent-bg-soft); }
.settings-firmware-card .sfw-banner[hidden] { display: none; }
.settings-firmware-card .sfw-banner-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.settings-firmware-card .sfw-banner-head strong { color: var(--text-strong); font-size: .92rem; font-weight: 650; }
.settings-firmware-card .sfw-jump { border: 0; padding: 0; background: none; color: var(--accent); font: inherit; font-size: .82rem; font-weight: 650; text-decoration: underline; cursor: pointer; }
.settings-firmware-card .sfw-hop { margin-top: 6px; font-family: var(--mono); font-size: 1.02rem; font-weight: 700; color: var(--text-strong); }
.settings-firmware-card .sfw-hop span { color: var(--text-faint); font-weight: 600; }
.settings-firmware-card .sfw-notes { margin-top: 10px; max-height: 190px; overflow-y: auto; color: var(--text-muted); font-size: .84rem; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.settings-firmware-card .sfw-notes-label { margin-top: 12px; color: var(--text-faint); font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.settings-firmware-card .sfw-banner-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.settings-firmware-card .sfw-asset { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; min-width: 150px; padding: 9px 14px; border: 1px solid var(--control-border); border-radius: 8px; color: var(--text-strong); font-size: .875rem; font-weight: 700; text-decoration: none; }
.settings-firmware-card .sfw-asset:hover { border-color: var(--control-border-hover); background: var(--control-bg-hover); }
.settings-firmware-card .sfw-install { min-width: 150px; border-color: var(--accent); background: var(--accent); color: var(--text-on-accent); }
.settings-firmware-card .sfw-upload-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.settings-firmware-card .sfw-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.settings-firmware-card .sfw-filename { color: var(--text-muted); font-size: .82rem; font-family: var(--mono); overflow-wrap: anywhere; }
.settings-firmware-card .sfw-progress { height: 4px; margin-top: 10px; border-radius: 3px; background: var(--control-bg-hover); overflow: hidden; }
.settings-firmware-card .sfw-progress[hidden] { display: none; }
.settings-firmware-card .sfw-progress > i { display: block; height: 100%; width: 0%; background: var(--accent); transition: width .25s ease; }
@media (max-width: 520px) {
  .settings-firmware-card .sfw-install, .settings-firmware-card .sfw-asset { flex: 1; }
}
`;R("settings-firmware-card",pa);var ua=()=>`
  <div class="ui-card settings-firmware-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.firmware.title">Firmware</span>${te("settings.firmware.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.firmware.installed">Installed version</span> <span class="ui-sublabel sfw-status" role="status">\u2014</span></span>
      <span class="ui-field"><span class="sfw-version">\u2014</span><button type="button" class="ui-btn sfw-check" data-i18n="settings.firmware.check">Check for update</button></span>
    </div>
    <div class="sfw-banner" hidden>
      <div class="sfw-banner-head">
        <strong data-i18n="settings.firmware.available">Update available</strong>
        <button type="button" class="sfw-jump" data-i18n="settings.firmware.backupFirst">Save a settings backup first</button>
      </div>
      <div class="sfw-hop"></div>
      <div class="sfw-notes-label" data-i18n="settings.firmware.releaseNotes">Release notes</div>
      <div class="sfw-notes"></div>
      <div class="sfw-banner-btns">
        <button type="button" class="ui-btn sfw-install" data-i18n="settings.firmware.install">Install now</button>
        <a class="sfw-asset" href="#" download data-i18n="settings.firmware.download">Download .ota.bin</a>
      </div>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.firmware.manual">Manual upload</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.firmware.manualLabel">Firmware image</span> <span class="ui-sublabel" data-i18n="settings.firmware.manualSub">Push a .bin you built locally. The controller reboots when flashing finishes.</span></span>
      <span class="ui-field sfw-upload-row">
        <input type="file" class="sfw-file" accept=".bin" data-i18n-label="settings.firmware.choose" aria-label="Choose firmware image">
        <button type="button" class="ui-btn sfw-choose" data-i18n="settings.firmware.choose">Choose .bin\u2026</button>
        <button type="button" class="ui-btn sfw-upload" data-i18n="settings.firmware.upload" disabled>Upload and install</button>
      </span>
    </div>
    <div class="sfw-filename" data-i18n="settings.firmware.noFile">No file selected</div>
    <div class="sfw-progress" hidden><i></i></div>
    <div class="ui-note sfw-upload-status" role="status"></div>
  </div>
`;function sr(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function Be(t,e){let o=sr(t);if(!o)return!1;let r=sr(e);if(!r)return!0;for(let a=0;a<3;a++)if(o[a]!==r[a])return o[a]>r[a];return!1}function ir(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function ma(t){let e=String(t||"").trim();return e.length<=ar?e:e.slice(0,ar).replace(/\s+\S*$/,"")+"\u2026"}function ga(){let t=document.querySelector(".settings-backup-card");if(!t)return;let e=t.closest("details");e&&(e.open=!0),t.scrollIntoView({behavior:"smooth",block:"center"});let o=t.querySelector(".sbk-save");o&&o.focus({preventScroll:!0})}var nc=N({tag:"settings-firmware-card",render:ua,onMount(t,e){let o=e.querySelector(".sfw-version"),r=e.querySelector(".sfw-status"),a=e.querySelector(".sfw-check"),n=e.querySelector(".sfw-banner"),i=e.querySelector(".sfw-hop"),l=e.querySelector(".sfw-notes"),b=e.querySelector(".sfw-install"),u=e.querySelector(".sfw-asset"),m=e.querySelector(".sfw-jump"),x=e.querySelector(".sfw-file"),p=e.querySelector(".sfw-choose"),h=e.querySelector(".sfw-upload"),g=e.querySelector(".sfw-filename"),y=e.querySelector(".sfw-progress"),c=y.querySelector("i"),z=e.querySelector(".sfw-upload-status"),C=null,k=!1,T=0,A=!1,E=()=>S(s.firmware)||M("firmwareVersion")||"",I=(F,Z)=>{r.textContent=F||"",r.className="ui-sublabel sfw-status"+(Z?" "+Z:"")},q=()=>{let F=Le.firmware_update;if(!F||F.available!==!0)return null;let Z=String(F.latest||"").trim();return Z?{tag:Z,notes:f("settings.firmware.deviceReported"),asset:St(Z)}:null},D=()=>{let F=q();return C?F&&Be(F.tag,C.tag)?F:C:F},U=()=>{o.textContent=E()||f("settings.firmware.unknownVersion")},G=()=>{let F=D(),Z=!!F&&Be(F.tag,E());if(n.hidden=!Z,!Z){ge("firmwareUpdateAvailable",null);return}i.innerHTML=ir(E()||f("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+ir(F.tag),l.textContent=ma(F.notes)||f("common.noData"),u.href=F.asset.url,u.setAttribute("download",F.asset.name),u.title=F.asset.name,ge("firmwareUpdateAvailable",{current:E(),latest:F.tag,url:F.asset.url})},J=F=>{k||!F&&T&&Date.now()-T<da||(k=!0,T=Date.now(),a.disabled=!0,I(f("settings.firmware.checking")),Promise.resolve(uo()).catch(()=>{}),fo().then(Z=>{C=Z,G();let ue=Be(Z.tag,E());I(ue?f("settings.firmware.availableStatus",{version:Z.tag}):f("settings.firmware.upToDate"),ue?null:"ok")}).catch(Z=>{C=null,G();let ue=q();if(ue){I(Be(ue.tag,E())?f("settings.firmware.availableStatus",{version:ue.tag}):f("settings.firmware.upToDate"),Be(ue.tag,E())?null:"ok");return}if((Z instanceof he?Z.code:"network")==="no_releases"){I(f("settings.firmware.noReleases"),"ok");return}I(f("settings.firmware.checkFailed"),"err")}).finally(()=>{k=!1,a.disabled=!1}))};a.addEventListener("click",()=>J(!0)),m.addEventListener("click",ga),b.addEventListener("click",()=>{let F=D();F&&window.confirm(f("settings.firmware.confirmInstall",{version:F.tag}))&&(b.disabled=!0,b.textContent=f("settings.firmware.installing"),Promise.resolve(mo()).then(()=>I(f("settings.firmware.installStarted"))).catch(()=>{I(f("settings.firmware.installFailed"),"err"),b.disabled=!1,b.textContent=f("settings.firmware.install")}))}),p.addEventListener("click",()=>x.click()),x.addEventListener("change",()=>{let F=x.files&&x.files[0];g.textContent=F?F.name:f("settings.firmware.noFile"),h.disabled=!F||A,z.textContent="",z.className="ui-note sfw-upload-status"}),h.addEventListener("click",()=>{let F=x.files&&x.files[0];!F||A||window.confirm(f("settings.firmware.confirmUpload",{file:F.name}))&&(A=!0,h.disabled=!0,p.disabled=!0,y.hidden=!1,c.style.width="0%",z.className="ui-note sfw-upload-status",z.textContent=f("settings.firmware.uploading",{value:0}),Promise.resolve(go()).catch(Z=>console.warn("[Firmware] prepare rejected, continuing with upload:",Z)).then(()=>bo(F,Z=>{c.style.width=Z+"%",z.textContent=f("settings.firmware.uploading",{value:Z})})).then(()=>{c.style.width="100%",z.className="ui-note sfw-upload-status",z.textContent=f("settings.firmware.uploadDone")}).catch(Z=>{console.error("[Firmware] upload failed:",Z),y.hidden=!0,z.textContent=f("settings.firmware.uploadFailed")}).finally(()=>{A=!1,p.disabled=!1,h.disabled=!1}))}),B("section",()=>{M("section")==="settings"&&J(!1)}),w(s.firmware,()=>{U(),G()}),w("firmware_update",G),_(e),U(),M("section")==="settings"&&J(!1)}});var fa=`
.settings-backup-card .sbk-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.settings-backup-card .sbk-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.settings-backup-card .sbk-filename { color: var(--text-muted); font-size: .82rem; font-family: var(--mono); overflow-wrap: anywhere; }
.settings-backup-card .sbk-status { min-height: 1.1em; margin-top: 10px; font-size: .84rem; font-weight: 600; color: var(--text-muted); }
.settings-backup-card .sbk-status.ok { color: var(--state-ok); }
.settings-backup-card .sbk-status.err { color: var(--state-danger); }
.settings-backup-card .sbk-result { margin-top: 4px; color: var(--text-muted); font-family: var(--mono); font-size: .82rem; }
.settings-backup-card .sbk-restore { border-color: var(--danger-border); background: var(--danger-bg-soft); color: var(--danger-text); }
.settings-backup-card .sbk-restore:hover { border-color: var(--danger-border-strong); background: var(--danger-bg); color: var(--danger-text); }
@media (max-width: 520px) {
  .settings-backup-card .sbk-actions > * { flex: 1; }
}
`;R("settings-backup-card",fa);var ba=()=>`
  <div class="ui-card settings-backup-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.backup.title">Backup and restore</span>${te("settings.backup.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field"><div class="ui-toggle on sbk-learned" role="switch" aria-checked="true" data-i18n-label="settings.backup.restoreLearned" aria-label="Restore learned motor values"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreFile">Backup file</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreSub">Overwrites the local configuration on this controller.</span></span>
      <span class="ui-field sbk-actions">
        <input type="file" class="sbk-file" accept=".json,application/json" data-i18n-label="settings.backup.choose" aria-label="Choose backup file">
        <button type="button" class="ui-btn sbk-choose" data-i18n="settings.backup.choose">Choose file\u2026</button>
        <button type="button" class="ui-btn sbk-restore" data-i18n="settings.backup.restoreBtn" disabled>Restore</button>
      </span>
    </div>
    <div class="sbk-filename" data-i18n="settings.backup.noFile">No file selected</div>
    <div class="sbk-status" role="status"></div>
    <div class="sbk-result"></div>
  </div>
`,pc=N({tag:"settings-backup-card",render:ba,onMount(t,e){let o=e.querySelector(".sbk-save"),r=e.querySelector(".sbk-learned"),a=e.querySelector(".sbk-file"),n=e.querySelector(".sbk-choose"),i=e.querySelector(".sbk-restore"),l=e.querySelector(".sbk-filename"),b=e.querySelector(".sbk-status"),u=e.querySelector(".sbk-result"),m=!0,x=!1,p=(h,g)=>{b.textContent=h||"",b.className="sbk-status"+(g?" "+g:"")};r.addEventListener("click",()=>{m=!m,r.classList.toggle("on",m),r.setAttribute("aria-checked",m?"true":"false")}),o.addEventListener("click",()=>{x||(x=!0,o.disabled=!0,u.textContent="",p(f("settings.backup.saving")),vo(!0).then(h=>{if(!Ye(h))throw new Error("unexpected_export_payload");p(f("settings.backup.saved",{file:xo(h)}),"ok")}).catch(h=>{console.error("[Backup] export failed:",h),p(f("settings.backup.saveFailed"),"err")}).finally(()=>{x=!1,o.disabled=!1}))}),n.addEventListener("click",()=>a.click()),a.addEventListener("change",()=>{let h=a.files&&a.files[0];l.textContent=h?h.name:f("settings.backup.noFile"),i.disabled=!h||x,u.textContent="",p("")}),i.addEventListener("click",async()=>{let h=a.files&&a.files[0];if(!h||x)return;let g="";try{g=await h.text()}catch(c){p(f("settings.backup.readFailed"),"err");return}let y=null;try{y=JSON.parse(g)}catch(c){p(f("settings.backup.invalidFile"),"err");return}if(!Ye(y)){p(f("settings.backup.invalidFile"),"err");return}window.confirm(f("settings.backup.confirmRestore",{file:h.name}))&&(x=!0,i.disabled=!0,u.textContent="",p(f("settings.backup.restoring")),ho(y,m).then(c=>{p(f("settings.backup.restored"),"ok"),u.textContent=f("settings.backup.result",{applied:c.applied,skipped:c.skipped,ignored:c.ignored})}).catch(c=>{console.error("[Backup] restore failed:",c),p(f("settings.backup.restoreFailed"),"err")}).finally(()=>{x=!1,i.disabled=!1}))}),_(e)}});var Ce=Object.freeze({refinedEmber:"refined-ember",deepForest:"deep-forest"}),cr="lune-dashboard-theme",dr="(prefers-color-scheme: dark)",Ne=null,lr=!1;function pr(t){return Object.values(Ce).includes(t)?t:Ce.refinedEmber}function ct(){try{return pr(localStorage.getItem(cr))}catch(t){return Ce.refinedEmber}}function va(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(dr).matches?"dark":"light"}function ha(){let t=va();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,!lr&&typeof window!="undefined"&&typeof window.matchMedia=="function"){Ne=window.matchMedia(dr);let o=()=>{let r=Ne.matches?"dark":"light";e.dataset.colorScheme=r,e.style.colorScheme=r,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:r}))};typeof Ne.addEventListener=="function"?Ne.addEventListener("change",o):typeof Ne.addListener=="function"&&Ne.addListener(o),lr=!0}return t}function Ot(t=ct()){let e=pr(t);if(typeof document=="undefined")return e;ha();let o=document.documentElement;return Object.values(Ce).forEach(r=>o.classList.remove(`theme-${r}`)),o.classList.add(`theme-${e}`),o.dataset.theme=e,e}function ur(t){let e=Ot(t);try{localStorage.setItem(cr,e)}catch(o){}return typeof window!="undefined"&&window.dispatchEvent(new CustomEvent("lune-theme-change",{detail:e})),e}var xa=[{value:Ce.refinedEmber,labelKey:"settings.appearance.refinedEmber"},{value:Ce.deepForest,labelKey:"settings.appearance.deepForest"}],ya=()=>`
  <div class="ui-card settings-appearance-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.appearance.title">Appearance</span>${te("settings.appearance.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.appearance.accent">Accent</span> <span class="ui-sublabel" data-i18n="settings.appearance.accentSub">Colour used for highlights and selected controls in this browser.</span></span>
      <span class="ui-field"><select class="ui-select sap-theme" data-i18n-label="settings.appearance.accent" aria-label="Accent theme"></select></span>
    </div>
  </div>
`,hc=N({tag:"settings-appearance-card",render:ya,onMount(t,e){let o=e.querySelector(".sap-theme"),r=()=>{let a=o.value||ct();o.innerHTML=xa.map(n=>`<option value="${n.value}">${f(n.labelKey)}</option>`).join(""),o.value=a};r(),o.value=ct(),o.addEventListener("change",()=>ur(o.value)),window.addEventListener("lune-theme-change",a=>{a.detail&&(o.value=a.detail)}),_(e)}});var wa=`
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
`;R("smart-preheat-card",wa);var za=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${te("settings.preheat.help")}</span></div>
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
`,Lc=N({tag:"smart-preheat-card",render:za,onMount(t,e){let o=e.querySelector(".absorb-toggle"),r=e.querySelector(".absorb-badge"),a=e.querySelector(".absorb-band"),n=e.querySelector(".absorb-delta"),i=e.querySelector(".absorb-body"),l=ie(e),b=m=>{i&&i.classList.toggle("is-disabled",!m)};l.toggle(o,{read:()=>Y(s.preheatAbsorbEnabled),onChange:b,commit:m=>{let x=m?"on":"off";v(s.preheatAbsorbEnabled,{state:x}),le("preheat_absorb_enabled",x)}}),l.num(a,{read:()=>L(s.preheatAbsorbBandC),commit:m=>{v(s.preheatAbsorbBandC,{value:m}),ce("preheat_absorb_band_c",m)}}),l.num(n,{read:()=>L(s.preheatDetectDeltaC),commit:m=>{v(s.preheatDetectDeltaC,{value:m}),ce("preheat_detect_delta_c",m)}});function u(){let m=String(S(s.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=m?f("common.active"):f("common.idle"),r.classList.toggle("active",m)}w(s.preheatAbsorbEnabled,l.refresh),w(s.preheatAbsorbing,u),w(s.preheatAbsorbBandC,l.refresh),w(s.preheatDetectDeltaC,l.refresh),_(e),l.refresh(),u()}});Ot();var ka=`
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
`;R("hv6-app-root",ka);var Sa=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand">Lune V6</div><p class="side-subtitle">Local manifold controller</p><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Hydraulic overview</h3><p>Current temperatures, valve demand and active loops.</p></div><span class="hydraulic-summary"></span></div><div class="flow-diagram-slot"></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section><section class="dashboard-section dashboard-connection" aria-labelledby="connection-heading"><div class="dashboard-section-head"><div><h3 id="connection-heading">Connection</h3><p>Touch, network and firmware.</p></div></div><div class="connectivity-slot"></div></section></div></section>
<section class="sec" data-section="zones"><div class="zones-index"><div class="zones-index-head"><h2>Zones</h2><p class="zones-count">6 physical loops</p></div><section class="zones-summary" role="status" aria-live="polite"></section><div class="content-group"><div class="group-title"><div class="group-title-main"><h3>Local zones</h3><span>Temperature, applied target, valve and state</span></div></div><div class="zones-list"></div></div></div><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title" hidden><div class="zone-detail-toolbar"><button type="button" class="zone-back" data-zone-back>\u2039 All zones</button><div class="zone-tabstrip" role="tablist" aria-label="Select zone"></div></div><div class="zone-detail-heading" id="selected-zone-panel" role="tabpanel" aria-labelledby="selected-zone-tab"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-layout"><div class="zone-detail-slot"></div><section class="zone-configuration-group" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div></section><details class="disclosure zone-recovery-disclosure"><summary>Service and recovery<small>Only when this zone needs attention</small></summary><div class="disclosure-body zone-recovery-slot"></div></details></div></section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout"><details class="disclosure settings-disclosure touch-settings" open><summary>Touch connection<small>Approval and coordinator identity</small></summary><div class="disclosure-body touch-slot"></div></details><details class="disclosure settings-disclosure"><summary>Manifold and probes<small>Valve type and temperature inputs</small></summary><div class="disclosure-body manifold-slot"></div></details><details class="disclosure settings-disclosure"><summary>Hydraulic safety<small>Minimum active-loop opening</small></summary><div class="disclosure-body minimum-flow-slot"></div></details><details class="disclosure settings-disclosure"><summary>Room clocks<small>Shelly BLU display time</small></summary><div class="disclosure-body ble-clock-slot"></div></details><details class="disclosure settings-disclosure"><summary>Preheat absorption<small>Local handling of external preload</small></summary><div class="disclosure-body preheat-slot"></div></details><details class="disclosure settings-disclosure"><summary>Motor configuration<small>Drivers, profile and learning limits</small></summary><div class="disclosure-body motor-slot"></div></details><details class="disclosure settings-disclosure"><summary>Firmware<small>Version, updates and manual upload</small></summary><div class="disclosure-body firmware-slot"></div></details><details class="disclosure settings-disclosure"><summary>Backup and restore<small>Save or reapply local configuration</small></summary><div class="disclosure-body backup-slot"></div></details><details class="disclosure settings-disclosure"><summary>Appearance<small>Accent colour in this browser</small></summary><div class="disclosure-body appearance-slot"></div></details></div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="help"><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;N({tag:"app-root",render:Sa,onMount(t,e){e.querySelector(".hdr").appendChild(j("hv6-header")),e.querySelector(".side-nav-slot").appendChild(j("hv6-sidebar")),e.querySelector(".zones-list").appendChild(j("zone-grid",{selection:!0,navigate:!0})),e.querySelector(".flow-diagram-slot").appendChild(j("flow-diagram")),e.querySelector(".hydraulic-history-slot").appendChild(j("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(j("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(j("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(j("zone-detail",{zone:M("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(j("zone-sensor-card")),e.querySelector(".zone-recovery-slot").appendChild(j("diag-zone-recovery-card")),e.querySelector(".zone-room-slot").appendChild(j("zone-room-card")),e.querySelector(".touch-slot").appendChild(j("settings-touch-card")),e.querySelector(".manifold-slot").appendChild(j("settings-manifold-card")),e.querySelector(".minimum-flow-slot").appendChild(j("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(j("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(j("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(j("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(j("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(j("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(j("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(j("settings-control-card")),e.querySelector(".manual-control-col").appendChild(j("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(j("diag-zone-motor-card",{zone:M("selectedZone")||1})),e.querySelector(".logs-main-col").appendChild(j("logs-view")),e.querySelector(".system-health-slot").appendChild(j("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(j("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(j("diag-i2c"));let o=e.querySelectorAll(".sec"),r=e.querySelector(".zones-index"),a=e.querySelector(".zone-detail-view"),n=e.querySelector(".selected-zone-title"),i=e.querySelector(".zone-tabstrip"),l=!1;function b(){let p=M("selectedZone")||1;i.innerHTML=Array.from({length:6},(h,g)=>{let y=g+1,c=y===p;return`<button type="button" class="zone-tab" id="${c?"selected-zone-tab":"zone-tab-"+y}" role="tab" aria-controls="selected-zone-panel" aria-selected="${c}" tabindex="${c?"0":"-1"}" data-zone-select="${y}">${ae(y)}</button>`}).join("")}function u(){let p=M("section")||"overview";o.forEach(h=>h.classList.toggle("active",h.dataset.section===p)),x()}function m(){let p=[],h=0,g=0;for(let E=1;E<=6;E++){let I=String(S(d.enabled(E))).toLowerCase()==="on",q=String(S(d.state(E))).toLowerCase(),D=String(S(d.motorLastFault(E))).toLowerCase();I&&p.push(E),I&&["heating","calling"].includes(q)&&h++,(q==="fault"||D!==""&&D!=="none"&&D!=="ok")&&g++}let y=L(s.flow),c=L(s.ret),z=String(S(s.authorityState)||"").replace(/_/g," "),C=g===0&&M("live"),k=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${C?"status-ok":M("live")?"status-warn":"status-danger"}">${C?"Operating normally":M("live")?"Needs attention":"Device offline"}</h2><p>${g?g+" zone fault"+(g===1?"":"s")+" require attention.":M("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${h} zones</strong><small>${p.length} enabled</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${X(y)}</strong><small>Return ${X(c)}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${z||"not connected"}</strong><small>${L(s.authorityLeaseRemainingS)?Math.round(L(s.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,T=Y(s.authorityConfigured),A=String(S(s.drivers)||"off");e.querySelector(".overview-status").innerHTML=k,e.querySelector(".hydraulic-summary").textContent=`${h} heating \xB7 Flow ${X(y)} \xB7 Return ${X(c)}`,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${M("live")?"status-ok":"status-danger"}">${M("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${M("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${T?"Approved":"Not approved"}</strong><small>${T?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${A}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${g?"status-danger":C?"status-ok":"status-warn"}">${g?g+" issue"+(g===1?"":"s"):C?"Healthy":"Awaiting data"}</h2><p>${g?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${g}</strong><small>${g?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${A}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${z||"not connected"}</strong><small>${T?"approved":"local control"}</small></div>`,e.querySelector(".zones-count").textContent=`6 physical loops \xB7 ${p.length} enabled \xB7 ${h} heating`,e.querySelector(".zones-summary").innerHTML=`<span class="eyebrow">Zone status</span><h2>${g?g+" zone"+(g===1?"":"s")+" need attention":p.length?h?h+" zone"+(h===1?" is":"s are")+" heating":"All enabled zones are idle":"No zones enabled"}</h2><p>${g?"Open an affected zone to review its valve, sensor and recovery state.":p.length?"Select a zone to review its applied target, sensor coverage and local fallback.":"Enable zones after their valve and temperature source are configured."}</p>`,[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(E=>{E.hidden=!g,E.innerHTML=g?`<strong>Review ${g} zone fault${g===1?"":"s"}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:""})}function x(){let p=M("selectedZone")||1,h=M("section")==="zones";n.textContent=ae(p),b(),r.hidden=!h||l,a.hidden=!h||!l}e.addEventListener("zone-open",()=>{l=!0,x()}),e.querySelector("[data-zone-back]").addEventListener("click",()=>{l=!1,x();let p=e.querySelector(`.zones-list .zone-card[data-zone="${M("selectedZone")||1}"]`);p&&p.focus()}),i.addEventListener("click",p=>{let h=p.target.closest("[data-zone-select]");h&&De(Number(h.dataset.zoneSelect))}),i.addEventListener("keydown",p=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(p.key))return;p.preventDefault();let h=M("selectedZone")||1,g=p.key==="Home"?1:p.key==="End"?6:p.key==="ArrowLeft"?h===1?6:h-1:h===6?1:h+1;De(g),requestAnimationFrame(()=>{var y;return(y=i.querySelector(`[data-zone-select="${g}"]`))==null?void 0:y.focus()})}),e.querySelectorAll("[data-open-zones]").forEach(p=>p.addEventListener("click",()=>{l=!1,fe("zones")})),e.querySelectorAll("[data-help-section]").forEach(p=>p.addEventListener("click",h=>{h.preventDefault(),fe(p.dataset.helpSection)})),B("section",u),B("selectedZone",x),B("live",m),B("zoneNames",()=>{b(),m()});for(let p=1;p<=6;p++)[d.temp(p),d.setpoint(p),d.valve(p),d.state(p),d.enabled(p),d.motorLastFault(p)].forEach(h=>w(h,m));[s.flow,s.ret,s.authorityConfigured,s.authorityState,s.authorityLeaseRemainingS,s.drivers].forEach(p=>w(p,m)),_(e),u(),x(),m()}});function _a(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(j("app-root")),Co()}_a();})();
