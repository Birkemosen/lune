(()=>{var bn={},xa={};function O(t){return bn[t.tag]=t,t}function ce(t,e){let a=bn[t];if(!a)throw new Error("Component not found: "+t);let o=e||{};if(a.state){let s=a.state(e||{});for(let d in s)o[d]=s[d]}if(a.methods)for(let s in a.methods)o[s]=a.methods[s];let r=document.createElement("div");r.innerHTML=a.render(o);let n=r.firstElementChild;return a.onMount&&queueMicrotask(()=>a.onMount(o,n)),n}function C(t,e){(xa[t]||(xa[t]=[])).push(e)}function Ae(t){let e=xa[t];if(e)for(let a=0;a<e.length;a++)e[a](t)}var h={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",sensorId:t=>"text-zone_"+t+"_sensor_id",sensorName:t=>"text-zone_"+t+"_sensor_name",externalAge:t=>"sensor-zone_"+t+"_external_temp_age_ms",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var Ee=6,ys=28,Rt=Object.create(null),ws=zs(),se={section:"overview",settingsPanel:"touch",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:_s(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:ws,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},ks=300;function _s(){let t=Object.create(null);for(let e=1;e<=Ee;e++)t[e]=[];return t}function zs(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<Ee;)t.push("");return t.slice(0,Ee)}function Ss(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(se.zoneNames))}catch(t){}}function Ne(t){return"$dashboard:"+t}function kt(t){return Math.max(1,Math.min(Ee,Number(t)||1))}function fn(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let a=t.match(/-?\d+(?:[\.,]\d+)?/);if(a){let o=Number(String(a[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function A(t){let e=Rt[t];return e?e.v!=null?e.v:e.value!=null?e.value:fn(e.s!=null?e.s:e.state):null}function M(t){let e=Rt[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function Cs(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function fe(t){return Cs(M(t))}function ya(){return fe(i.authorityProposalPending)}function so(){let t=0;for(let e=1;e<=Ee;e++){let a=String(M(h.state(e))||"").toLowerCase(),o=String(M(h.motorLastFault(e))||"").toLowerCase();(a==="fault"||o&&o!=="none"&&o!=="ok")&&(t+=1)}return t}function io(){if(ya())return{kind:"touch",section:"settings",focus:"touch"};let t=so();return t>0?{kind:"faults",section:"zones",count:t}:null}function k(t,e){let a=Rt[t];a||(a=Rt[t]={v:null,s:null}),"v"in e&&(a.v=e.v,a.value=e.v),"value"in e&&(a.v=e.value,a.value=e.value),"s"in e&&(a.s=e.s,a.state=e.s),"state"in e&&(a.s=e.state,a.state=e.state);for(let o in e)o==="v"||o==="value"||o==="s"||o==="state"||(a[o]=e[o]);if(Ae(t),t==="text_sensor-firmware_version"&&Oe("firmwareVersion",M(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let o=parseInt(t.slice(10,-5),10);if(o>=1&&o<=Ee){let r=M(t)||"";se.zoneNames[o-1]!==r&&(se.zoneNames[o-1]=r,Ss(),Ae(Ne("zoneNames")))}}}function U(t,e){C(Ne(t),e)}function P(t){return se[t]}function Oe(t,e){se[t]=e,Ae(Ne(t))}function qe(t){let e=t==="logs"?"diagnostics":t;se.section!==e&&(se.section=e,Ae(Ne("section")))}function wa(t){let e=String(t||"touch");se.settingsPanel!==e&&(se.settingsPanel=e,Ae(Ne("settingsPanel")))}function _t(t){let e=kt(t);se.selectedZone!==e&&(se.selectedZone=e,Ae(Ne("selectedZone")))}function gt(t){let e=!!t;se.live!==e&&(se.live=e,Ae(Ne("live")))}function lo(){se.pendingWrites+=1,Ae(Ne("pendingWrites"))}function ka(){se.pendingWrites=Math.max(0,se.pendingWrites-1),se.lastWriteAt=Date.now(),Ae(Ne("pendingWrites"))}function hn(){return se.pendingWrites>0?!0:Date.now()-se.lastWriteAt<2e3}function co(t){return se.zoneNames[kt(t)-1]||""}function $e(t){return String(co(t)||"").trim()}function je(t){return"Z"+kt(t)}function ro(t){return"Zone "+kt(t)}function Ce(t){let e=kt(t),a=$e(e);return a?ro(e)+" - "+a:ro(e)}function Ls(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ms(t){let e=kt(t);return'<span class="zone-id-short">'+je(e)+'</span><span class="zone-id-long">'+ro(e)+"</span>"}function nt(t){let e=kt(t),a=$e(e),o=Ms(e);return a?'<span class="zone-title-id">'+o+'</span><span class="zone-title-name"> - '+Ls(a)+"</span>":'<span class="zone-title-id">'+o+"</span>"}function Pt(t){se.i2cResult=t||"No scan has been run yet.",Ae(Ne("i2cResult"))}function W(t,e){let a={time:As(),msg:String(t||"")};for(se.activityLog.push(a);se.activityLog.length>60;)se.activityLog.shift();if(e>=1&&e<=Ee){let o=se.zoneLog[e];for(o.push(a);o.length>8;)o.shift();Ae(Ne("zoneLog:"+e))}Ae(Ne("activityLog"))}function no(t,e){let a=se[t];if(!Array.isArray(a))return;let o=fn(e);if(o!=null){for(a.push(o);a.length>ys;)a.shift();Ae(Ne(t))}}function Jt(t){let e=Date.now();if(!t&&e-se.lastHistoryAt<3200)return;se.lastHistoryAt=e;let a=0,o=0;for(let r=1;r<=Ee;r++){let n=A("sensor-zone_"+r+"_valve_pct");n!=null&&(a+=n,o+=1)}no("historyFlow",A("sensor-manifold_flow_temperature")),no("historyReturn",A("sensor-manifold_return_temperature")),no("historyDemand",o?a/o:0)}function As(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function _a(t){se.zoneStateHistory=t||null,Ae(Ne("zoneStateHistory"))}function vn(){return se.deviceLogSeq}function za(t,e){if(Array.isArray(t)&&t.length){for(let a of t)se.deviceLog.push({seq:a[0],level:a[1],tag:a[2],msg:a[3]}),a[0]>se.deviceLogSeq&&(se.deviceLogSeq=a[0]);for(;se.deviceLog.length>ks;)se.deviceLog.shift();Ae(Ne("deviceLog"))}typeof e=="number"&&e>se.deviceLogSeq&&(se.deviceLogSeq=e-1)}function Sa(){return se.deviceLog}function xn(){se.deviceLog=[],Ae(Ne("deviceLog"))}var ke=6,Es=8,yn=null,zt=0,Ca=1,wn=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],zn=18*3600+720,Sn=Date.now(),Qt=4200,Y={temp:new Float32Array(ke),setpoint:new Float32Array(ke),valve:new Float32Array(ke),enabled:new Uint8Array(ke),driversEnabled:1,fault:0,manualMode:0},Ie={busy:!1,direction:"open",zone:1,startedAt:0};function Ts(){Y.manualMode=0,Sn=Date.now(),Oe("manualMode",!1);for(let n=0;n<ke;n++){Y.temp[n]=20.5+n*.4,Y.setpoint[n]=21+n%3*.5,Y.valve[n]=12+n*8,Y.enabled[n]=n===4?0:1;let s=n+1;k(h.temp(s),{value:Y.temp[n]}),k(h.setpoint(s),{value:Y.setpoint[n]}),k(h.baseSetpoint(s),{value:Y.setpoint[n]}),k(h.effectiveSetpoint(s),{value:Y.setpoint[n]}),k(h.coordinatorOffset(s),{value:s===1?1.5:0}),k(h.coordinatorRemaining(s),{value:s===1?2400:0}),s===1&&k(h.effectiveSetpoint(1),{value:Y.setpoint[0]+1.5}),k(h.valve(s),{value:Y.valve[n]}),k(h.state(s),{state:Y.valve[n]>5?"heating":"idle"}),k(h.enabled(s),{value:!!Y.enabled[n],state:Y.enabled[n]?"on":"off"}),k(h.probe(s),{state:"None"}),k(h.tempSource(s),{state:s%2?"Local Probe":"BLE"}),k(h.syncTo(s),{state:"None"}),k(h.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),k(h.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),k(h.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=Es;n++){let s=n<=ke?n:ke,d=Y.temp[s-1]+(n>ke?1:.1*n);k(h.probeTemp(n),{value:d})}k(i.flow,{value:34.1}),k(i.ret,{value:30.4}),k(i.uptime,{value:zn}),k(i.wifi,{value:-57}),k(i.drivers,{value:!0,state:"on"}),k(i.fault,{value:!1,state:"off"}),k(i.ip,{state:"192.168.1.86"}),k(i.ssid,{state:"MockLab"}),k(i.mac,{state:"D8:3B:DA:12:34:56"}),k(i.firmware,{state:"v1.0.0-1"}),k(i.resetReason,{state:"Software reset (esp_restart)"}),k(i.manifoldFlowProbe,{state:"Probe 1"}),k(i.manifoldReturnProbe,{state:"Probe 2"}),k(i.manifoldType,{state:"NC (Normally Closed)"}),k(i.motorProfileDefault,{state:"HmIP VdMot"}),k(i.closeThresholdMultiplier,{value:1.7}),k(i.closeSlopeThreshold,{value:1}),k(i.closeSlopeCurrentFactor,{value:1.4}),k(i.openThresholdMultiplier,{value:1.7}),k(i.openSlopeThreshold,{value:.8}),k(i.openSlopeCurrentFactor,{value:1.3}),k(i.openRippleLimitFactor,{value:1}),k(i.genericRuntimeLimitSeconds,{value:45}),k(i.hmipRuntimeLimitSeconds,{value:34}),k(i.relearnAfterMovements,{value:2e3}),k(i.relearnAfterHours,{value:168}),k(i.learnedFactorMinSamples,{value:3}),k(i.learnedFactorMaxDeviationPct,{value:12}),k(i.simplePreheatEnabled,{state:"on"}),k(i.minZoneFlowPct,{value:15}),k(i.minimumFlowAlways,{state:"off"}),k(i.bleClockSyncEnabled,{state:"on"}),k(i.bleClockSyncIntervalMin,{value:60}),k(i.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),k(i.bleClockSyncLastError,{state:""}),k(i.bleClockSyncAdvertising,{state:"off"}),k(i.authorityInstallationId,{state:"house-main"}),k(i.authorityCoordinatorId,{state:"lune-touch"}),k(i.authorityConfigured,{state:"on",value:!0}),k(i.authorityProposalPending,{state:"off",value:!1}),k(i.authorityState,{state:"touch_normal"}),k(i.authorityReason,{state:"lease_renewed"}),k(i.authorityLeaseRemainingS,{value:72}),k(i.cpuLoadCore0,{value:18.5}),k(i.cpuLoadCore1,{value:7.2}),k(i.freeInternalKb,{value:142}),k(i.freeDmaKb,{value:118}),k(i.largestInternalKb,{value:64}),k(i.minInternalKb,{value:96}),k(i.freePsramKb,{value:7800}),k(i.largestPsramKb,{value:4096}),k(i.bleHubEnabled,{state:"on"}),k(i.bleScanning,{state:"on"}),k(i.bleDemanded,{state:"on"}),k(i.bleAdsPerSec,{value:2.4}),k(i.bleLastAdvAgeMs,{value:850}),Jt(!0);let t=300,e=Number(Date.now()/1e3)|0,a=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],r=[];for(let n=0;n<a;n++){let s=(a-1-n)*t,d=e-s,p=Math.floor(n/12)%24,u=o.map(E=>E[p%E.length]),v=s/3600,l=v>2.5&&v<3.5||v>8.5&&v<9.5?1:0,f=u.filter(E=>E===5).length,x=Math.round(Math.min(100,f*15+Math.abs(Math.sin(n/8))*6)),w=Number((30+f*1.4+Math.sin(n/11)*1.5).toFixed(1)),L=Number((w-(1.4+f*.35)).toFixed(1));r.push([d,...u,l,w,L,x])}_a({interval_s:t,uptime_s:e,count:a,entries:r}),Cn(6)}function Cn(t){let e=[];for(let a=0;a<t;a++){let o=wn[Ca%wn.length];e.push([Ca,o[0],o[1],o[2]]),Ca++}za(e,Ca)}function Fs(){zt+=1,k(i.uptime,{value:zn+Math.floor((Date.now()-Sn)/1e3)}),k(i.wifi,{value:-55-Math.round((1+Math.sin(zt/4))*6)});let t=0,e=0,a=0;for(let s=0;s<ke;s++){let d=s+1,p=!!Y.enabled[s],u=Y.temp[s],v=Y.setpoint[s],l=p&&Y.driversEnabled&&!Y.manualMode&&u<v-.25;Y.manualMode?Y.valve[s]=Math.max(0,Y.valve[s]):!p||!Y.driversEnabled?Y.valve[s]=Math.max(0,Y.valve[s]-6):l?Y.valve[s]=Math.min(100,Y.valve[s]+7+d%3):Y.valve[s]=Math.max(0,Y.valve[s]-5);let f=l?.05+Y.valve[s]/2200:-.03+Y.valve[s]/3200;Y.temp[s]=u+f+Math.sin((zt+d)/5)*.04,p&&Y.valve[s]>0&&(t+=Y.valve[s],e+=1,a=Math.max(a,Y.valve[s])),k(h.temp(d),{value:Y.temp[s]}),k(h.valve(d),{value:Math.round(Y.valve[s])});let x=Math.max(0,(Y.setpoint[s]-Y.temp[s]-.15)*.22);k(h.preheatAdvance(d),{value:Number(x.toFixed(2))}),k(h.state(d),{state:p?l?"heating":"idle":"off"}),k(h.enabled(d),{value:p,state:p?"on":"off"}),k(h.probeTemp(d),{value:Y.temp[s]+Math.sin((zt+d)/6)*.1})}let o=29.5+a*.075+e*.18+Math.sin(zt/6)*.25,r=o-(e?2.1+t/Math.max(1,e*50):1.1);k(i.flow,{value:Number(o.toFixed(1))}),k(i.ret,{value:Number(r.toFixed(1))}),k(h.probeTemp(1),{value:Number((o+.2).toFixed(1))}),k(h.probeTemp(2),{value:Number((r-.4).toFixed(1))}),Jt(!0);let n=P("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),zt%3===0&&Cn(1)}function kn(t,e){Ie.busy=!0,Ie.direction=e,Ie.zone=t,Ie.startedAt=Date.now()}function Ns(){return Ie.startedAt?Date.now()-Ie.startedAt:0}function Rs(t,e,a){if(!a)return .4;let o=e==="open";return t<180?o?22:28:t<500?o?15.2:19.4:t<2200?o?14.6:19.1:!o&&t<2800?24.2:!o&&t<3400?20.4:t<Qt-300?o?18.5:26.8:o?25.4:41.2}function Ps(t,e,a){return a?e==="open"?t>Qt-300?3:0:t<2200?0:t<3e3?1:t<Qt-300?2:3:0}function _n(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function Ln(){let t=Ns(),e=Ie.busy&&t<Qt;Ie.busy&&!e&&(Ie.busy=!1);let a=Rs(t,Ie.direction,e||t<Qt+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:A(i.freeInternalKb)||142,dma_kb:A(i.freeDmaKb)||118,largest_internal_kb:A(i.largestInternalKb)||64,min_internal_kb:A(i.minInternalKb)||96,psram_kb:A(i.freePsramKb)||7800,largest_psram_kb:A(i.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:M(i.bleHubEnabled)==="on",scanning:M(i.bleScanning)==="on",demanded:M(i.bleDemanded)==="on",ads_per_sec:A(i.bleAdsPerSec)||0,last_adv_age_ms:A(i.bleLastAdvAgeMs)||0},drivers_enabled:!!Y.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(a.toFixed(1)),stroke_phase:Ps(t,Ie.direction,e),armed:!!Y.driversEnabled,latch_arm_level:1,latch_state_level:0,motor_enable_level:0,tacho_period_us:_n(t,e),tacho_cadence_us:_n(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:zt}}}}function Ds(t,e){let a=e==="open";if(t<180)return a?22-t*.03:28-t*.04;if(t<650)return a?14.8:19.2;if(t<2200)return(a?14.5:19)+Math.sin(t/90)*.35;if(!a&&t<2600)return 19+(t-2200)*.012;if(!a&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return a?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let o=a?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(a?26.4:44.5,o)}function Mn(t){let e=t||Ie.direction||"open",a=e==="open",o=a?3900:4200,r=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],n=0;for(let s=0;s<=o;s+=10){let d=Ds(s,e);s>180&&s<o-80&&(n+=s%20===0?1:0);let p=0;a?p=s>o-400?3:0:s>=2200&&s<3e3?p=1:s>=3e3&&s<3600?p=2:s>=3600&&(p=3);let u=s<200?3200:s<o-400?1800+Math.round(Math.sin(s/140)*80):4200;r.push([s,n,d.toFixed(1),1200,1,a?1:0,1,p,u,40,0,0,0,0,0,1,0].join(","))}return r.join(`
`)+`
`}function An(){yn||(Ts(),gt(!0),yn=setInterval(Fs,1200))}function La(t){let e=t.key||"",a=t.value,o=t.zone||0;if(e==="zone_setpoint"&&o>=1&&o<=ke){let n=Number(a);Number.isNaN(n)||(Y.setpoint[o-1]=n,k(h.setpoint(o),{value:n}),k(h.baseSetpoint(o),{value:n}),k(h.effectiveSetpoint(o),{value:n}),W("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(e==="zone_enabled"&&o>=1&&o<=ke){let n=a>.5;Y.enabled[o-1]=n?1:0,k(h.enabled(o),{value:n,state:n?"on":"off"}),W("Zone "+o+(n?" enabled":" disabled"),o);return}if(e==="drivers_enabled"){let n=a>.5;Y.driversEnabled=n?1:0,n||(Ie.busy=!1),k(i.drivers,{value:n,state:n?"on":"off"}),W(n?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let n=a>.5;Y.manualMode=n?1:0,Oe("manualMode",n);return}if(e==="motor_target"&&o>=1&&o<=ke){let n=Number(a||0);k(h.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),W("Motor "+o+" target set to "+n+"%",o);return}if(e==="command"){let n=String(a);if(n==="i2c_scan"){Pt(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),W("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){W("Command executed: "+n);return}if(n==="firmware_check"||n==="firmware_prepare"){W("Command executed: "+n);return}if(n==="firmware_install"){W("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(n==="open_motor_timed"&&o>=1&&o<=ke){kn(o,"open"),W("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=ke){kn(o,"close"),W("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=ke){Ie.busy=!1,W("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=ke){W("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=ke){W("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=ke){W("Motor "+o+" reset and relearn started",o);return}if(n==="ble_clock_sync_now"){k(i.bleClockSyncAdvertising,{state:"on"}),k(i.bleClockSyncLastError,{state:""}),setTimeout(()=>{k(i.bleClockSyncAdvertising,{state:"off"}),k(i.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),W("Room clock broadcast started");return}if(n==="dump_task_stats"){W("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&o>=1){k(h.probe(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="zone_temp_source"&&o>=1){k(h.tempSource(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sync_to"&&o>=1){k(h.syncTo(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="manifold_type"){k(i.manifoldType,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="manifold_flow_probe"){k(i.manifoldFlowProbe,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="manifold_return_probe"){k(i.manifoldReturnProbe,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="motor_profile_default"){k(i.motorProfileDefault,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="simple_preheat_enabled"){k(i.simplePreheatEnabled,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="minimum_flow_always"){k(i.minimumFlowAlways,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="ble_clock_sync_enabled"){k(i.bleClockSyncEnabled,{state:String(a)}),W("Setting updated: "+e+" = "+a);return}if(e==="zone_name"&&o>=1){k(h.name(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="zone_ble_mac"&&o>=1){k(h.ble(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_id"&&o>=1){k(h.sensorId(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_name"&&o>=1){k(h.sensorName(o),{state:String(a)}),W("Setting updated: "+e+" = "+a,o);return}if(e==="authority_approve_proposal"){k(i.authorityInstallationId,{state:M(i.authorityProposalInstallationId)||"lune-mock"}),k(i.authorityCoordinatorId,{state:M(i.authorityProposalCoordinatorId)||"touch-mock"}),k(i.authorityConfigured,{state:"on",value:!0}),k(i.authorityProposalPending,{state:"off",value:!1}),W("Discovered Lune Touch approved");return}if(e==="authority_revoke"){k(i.authorityInstallationId,{state:""}),k(i.authorityCoordinatorId,{state:""}),k(i.authorityConfigured,{state:"off",value:!1}),k(i.authorityState,{state:"unconfigured"}),W("Lune Touch disconnected");return}let r={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};if(r[e]){let n=Number(a);Number.isNaN(n)||(k(r[e],{value:n}),W("Setting updated: "+e+" = "+a));return}}var po="v1.1.0";function En(){return{tag_name:po,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+po+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+po+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function Tn(t){let e=[];for(let a=1;a<=ke;a++)e.push({zone:a,name:M(h.name(a)),enabled:M(h.enabled(a))==="on",setpoint_c:A(h.setpoint(a)),probe:M(h.probe(a)),temp_source:M(h.tempSource(a)),ble_mac:M(h.ble(a)),sensor_id:M(h.sensorId(a)),sensor_name:M(h.sensorName(a)),sync_to:M(h.syncTo(a))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:M(i.firmware),device:{mac:M(i.mac)},settings:{manifold_type:M(i.manifoldType),manifold_flow_probe:M(i.manifoldFlowProbe),manifold_return_probe:M(i.manifoldReturnProbe),motor_profile_default:M(i.motorProfileDefault),min_zone_flow_pct:A(i.minZoneFlowPct),minimum_flow_always:M(i.minimumFlowAlways)==="on",simple_preheat_enabled:M(i.simplePreheatEnabled)==="on",ble_clock_sync_enabled:M(i.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:A(i.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(a=>({zone:a.zone,open_ripples:400+a.zone,close_ripples:390+a.zone}))}:null}}function Fn(t,e){let a=Object.keys(t&&t.settings||{}).length,o=Array.isArray(t&&t.zones)?t.zones.length:0,r=e&&t&&t.learned?ke:0;return W("Settings restored from backup (mock)"),{applied:a+o+r,skipped:e?0:ke,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){La({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!Y.enabled[t-1];La({key:"zone_enabled",value:e?1:0,zone:t})}};function uo(t,e){let a=URL.createObjectURL(e),o=document.createElement("a");o.href=a,o.download=t,o.rel="noopener",document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function mo(t,e,a){uo(t,new Blob([String(e)],{type:(a||"text/plain")+";charset=utf-8"}))}function go(t,e){let a=new Date,o=n=>String(n).padStart(2,"0"),r=a.getFullYear()+o(a.getMonth()+1)+o(a.getDate())+"-"+o(a.getHours())+o(a.getMinutes());return t+"-"+r+"."+e}var St="/api/v1",$s="https://api.github.com/repos/birkemosen/lune/releases/latest",Is="https://github.com/birkemosen/lune/releases/latest/download/",Hs="/update",Os="lune-v6-settings",Rn="1";function Ge(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function bo(t){return Object.assign({"X-Lune-CSRF":Rn,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},t||{})}function fo(t,e){let a=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&a.append(r,n);let o=a.toString();return St+t+(o?"?"+o:"")}function Te(t,e,a){if(lo(),Ge())try{return La(a),Promise.resolve({ok:!0})}finally{ka()}let o=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&o.append(r,String(n));return fetch(St+t,{method:"POST",headers:bo({"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"}),body:o.toString()}).then(async r=>{if(!r.ok&&[400,404,415].includes(r.status)&&(r=await fetch(fo(t,e),{method:"POST",headers:bo()})),!r.ok){let n=`POST ${t} failed (HTTP ${r.status})`;throw console.warn("API call failed: "+n),W(n),new Error(n)}return r}).catch(r=>{throw console.error(`API call error: POST ${t}:`,r),r}).finally(()=>{ka()})}function qs(t,e,a){return lo(),fetch(fo(t,a),{method:"POST",headers:bo({"Content-Type":"application/json"}),body:JSON.stringify(e)}).finally(()=>{ka()})}function ho(t,e){let a=Number(e);k(h.setpoint(t),{value:a}),k(h.baseSetpoint(t),{value:a});let o=Number(A(h.coordinatorOffset(t))),r=Number.isFinite(o)?a+o:a;return k(h.effectiveSetpoint(t),{value:r}),Te(`/zones/${t}/setpoint`,{setpoint_c:a},{key:"zone_setpoint",value:a,zone:t})}function Pn(t,e){return k(h.enabled(t),{state:e?"on":"off",value:e}),Te(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function Dt(t){return k(i.drivers,{state:t?"on":"off",value:t}),Te("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}async function vo({hz:t=100,durationMs:e=4e3,clamp:a=!1}={}){return Ge()?{ok:!0,data:{cycles:Math.max(1,Math.floor(e/10)),hz:t,clamp:!!a,armed:!0,armed_at_cycle:1,latch_state_start:1,latch_state_end:0}}:(await Te("/motors/arm-clock-probe",{hz:t,duration_ms:e,clamp:a?1:0})).json()}function He(t,e){return Te("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function Dn(){return Pt("Scanning I2C bus..."),W("I2C scan started"),He("i2c_scan")}var Bs={zone_probe:t=>h.probe(t),zone_temp_source:t=>h.tempSource(t),zone_sync_to:t=>h.syncTo(t)},js={zone_ble_mac:t=>h.ble(t),zone_sensor_id:t=>h.sensorId(t),zone_sensor_name:t=>h.sensorName(t),zone_name:t=>h.name(t)},Vs={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,ble_clock_sync_enabled:i.bleClockSyncEnabled},Us={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};function rt(t,e,a){let o=Bs[e];return o&&k(o(t),{state:a}),Te("/settings/select",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function $t(t,e,a){let o=js[e];return o&&k(o(t),{state:a}),Te("/settings/text",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function Fe(t,e){let a=Vs[t];return a&&k(a,{state:e}),Te("/settings/select",{key:t,value:e},{key:t,value:e})}function Pe(t,e){let a=Number(e),o=Us[t];return o&&!Number.isNaN(a)&&k(o,{value:a}),Te("/settings/number",{key:t,value:a},{key:t,value:a})}function $n(){return Te("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:M(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:M(i.authorityProposalCoordinatorId)||"touch-mock"}},a=(e==null?void 0:e.data)||{};return a.installation_id&&k(i.authorityInstallationId,{state:a.installation_id}),a.coordinator_id&&k(i.authorityCoordinatorId,{state:a.coordinator_id}),k(i.authorityConfigured,{state:"on",value:!0}),k(i.authorityProposalPending,{state:"off",value:!1}),e})}function In(){return Te("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return k(i.authorityInstallationId,{state:""}),k(i.authorityCoordinatorId,{state:""}),k(i.authorityConfigured,{state:"off",value:!1}),t})}function Hn(t,e){let a=String(e||"").trim();return W("Zone "+t+" renamed to "+(a||"(blank)"),t),$t(t,"zone_name",a)}function On(t,e){let a=Number(e),o=Number.isNaN(a)?0:Math.max(0,Math.min(100,Math.round(a)));return k(h.motorTarget(t),{value:o}),W("Motor "+t+" target set to "+o+"%",t),Te(`/motors/${t}/target`,{value:o},{key:"motor_target",value:o,zone:t})}function qn(t){let e=Math.round(Number(t));return!Number.isFinite(e)||e<=0?1e4:Math.max(100,Math.min(45e3,e))}function Aa(t,e=1e4){let a=qn(e);return W("Motor "+t+" open for "+a+"ms",t),Te(`/motors/${t}/open_timed`,{duration_ms:a},{key:"command",value:"open_motor_timed",zone:t,duration_ms:a})}function Ea(t,e=1e4){let a=qn(e);return W("Motor "+t+" close for "+a+"ms",t),Te(`/motors/${t}/close_timed`,{duration_ms:a},{key:"command",value:"close_motor_timed",zone:t,duration_ms:a})}function xo(t){return W("Motor "+t+" stopped",t),Te(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function Bn(){W("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(Te(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>Dt(!1).then(()=>e))}async function Ct(){if(Ge())return Ln();let t=await fetch(St+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function yo(){if(Ge())return Mn();let t=await fetch(St+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function It(t){return Oe("manualMode",!!t),W(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),Te("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function jn(t){return W("Motor "+t+" fault reset",t),He("motor_reset_fault",t)}function Ta(t){return W("Motor "+t+" learned factors reset",t),He("motor_reset_learned_factors",t)}function Vn(t){return W("Motor "+t+" reset and relearn started",t),He("motor_reset_and_relearn",t)}function Un(){return W("Task/heap stats dumped to device log"),He("dump_task_stats")}function wo(){Ge()||fetch(St+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&_a(t)}).catch(()=>{})}function Zn(){return He("firmware_check")}function Wn(){return W("Firmware install requested"),He("firmware_install")}function Kn(){return He("firmware_prepare")}function ko(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:Is+e}}function Nn(t,e){let a=Array.isArray(t)?t:[],o=n=>a.find(s=>n.test(String(s&&s.name||""))),r=o(/^lune-v6.*\.ota\.bin$/i)||o(/\.ota\.bin$/i)||o(/\.bin$/i);return r&&r.browser_download_url?{name:String(r.name),url:String(r.browser_download_url)}:ko(e)}var bt=class extends Error{constructor(e,a,o){super(o||e),this.name="ReleaseCheckError",this.code=e,this.status=a||0}};async function Gn(){if(Ge()){let o=En(),r=String(o&&o.tag_name||"");return{tag:r,notes:String(o&&o.body||""),publishedAt:String(o&&o.published_at||""),asset:Nn(o&&o.assets,r)}}let t;try{t=await fetch($s,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(o){throw new bt("network",0,o&&o.message?o.message:"network")}if(t.status===404)throw new bt("no_releases",404,"No published GitHub release");if(!t.ok)throw new bt("http",t.status,"Release check failed: "+t.status);let e=await t.json(),a=String(e&&e.tag_name||"");if(!a)throw new bt("no_releases",404,"No published GitHub release");return{tag:a,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Nn(e&&e.assets,a)}}function Xn(t,e){return Ge()?new Promise(a=>{let o=0,r=setInterval(()=>{o=Math.min(100,o+20),e&&e(o),o>=100&&(clearInterval(r),W("Firmware image uploaded (mock)"),a("Update Successful!"))},220)}):new Promise((a,o)=>{let r=new FormData;r.append("update",t,t.name);let n=new XMLHttpRequest;n.open("POST",Hs),n.setRequestHeader("X-Lune-CSRF",Rn),n.upload.onprogress=s=>{e&&s.lengthComputable&&e(Math.min(100,Math.round(s.loaded/s.total*100)))},n.onload=()=>{let s=String(n.responseText||"");if(n.status>=200&&n.status<300&&!/fail/i.test(s)){a(s);return}o(new Error("OTA upload rejected: "+n.status+" "+s))},n.onerror=()=>o(new Error("OTA upload connection lost")),n.send(r)})}function Ma(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function Yn(t=!0){if(Ge())return Ma(Tn(t));let e=await fetch(fo("/settings/export",{include_learned:t?1:0}),{cache:"no-store"});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Ma(await e.json())}function Fa(t){let e=Ma(t);return!!(e&&e._type===Os)}async function Jn(t,e=!0){let a=typeof t=="string"?JSON.parse(t):t,o=Ma(a);if(!Fa(o))throw new Error("not_a_lune_backup");if(Ge())return Fn(o,e);let r=await qs("/settings/import",Object.assign({},o,{restore_learned:!!e}),{restore_learned:e?1:0});if(!r.ok)throw new Error("Settings restore failed: "+r.status);let n=await r.json().catch(()=>({})),s=n&&n.data?n.data:n||{};return W("Settings restored from backup"),{applied:Number(s.applied||0),skipped:Number(s.skipped||0),ignored:Number(s.ignored||0)}}function Qn(t){let e=go("lune-v6-settings","json");return mo(e,JSON.stringify(t,null,2),"application/json"),e}function Zs(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Sa().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function er(){let t=go("lune-v6-logs","txt");if(Ge())return mo(t,Zs()||"No log lines buffered."),t;let e=await fetch(St+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return uo(t,await e.blob()),t}function _o(){if(Ge())return;let t=vn();fetch(St+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&za(e.lines,e.next_seq)}).catch(()=>{})}var Lt=null,tr=null,ar=null,or=null,zo=null,So=!1;function st(){return!!P("motorLabBusy")||So}async function Ws(){Lt&&Lt.abort(),Lt=new AbortController;let t=await fetch("/api/v1/state",{cache:"no-store",signal:Lt.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function nr(t){if(!(!t||typeof t!="object")&&!hn()){for(let e in t)k(e,t[e]);Jt(!1)}}function Ks(t){if(t){if(!t.type){nr(t);return}if(t.type==="state"){nr(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;W(e),String(e).indexOf("I2C_SCAN:")!==-1&&Pt(String(e))}}}function Gs(){st()||wo(),tr||(tr=setInterval(()=>{st()||wo()},300*1e3)),st()||_o(),ar||(ar=setInterval(()=>{st()||_o()},3e3))}function Co(){st()||Ws().then(t=>{st()||(gt(!0),Ks(t),Gs())}).catch(()=>{st()||gt(!1)})}async function Xs(){try{if(st())return;let t=await fetch("/api/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),a=e&&e.data,o=a&&a.data_revision;a&&a.uptime_s!=null&&k(i.uptime,{value:Number(a.uptime_s)}),(zo===null||o!==zo)&&(zo=o,Co()),gt(!0)}catch(t){st()||gt(!1)}}function Ys(){So=!0,Lt&&(Lt.abort(),Lt=null)}function Js(){So=!1,Co()}function rr(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){An();return}U("motorLabBusy",()=>{P("motorLabBusy")?Ys():Js()}),Co(),or||(or=setInterval(Xs,3e3))}var sr=Object.create(null);function D(t,e){if(sr[t])return;sr[t]=1;let a=document.createElement("style");a.textContent=e,document.head.appendChild(a)}var ir=`/* Generated from LDS tokens.json by generate_tokens.py. Do not edit. */
:root {
  color-scheme: dark;
  --bg: #000000;
  --surface: #0c0b09;
  --surface-base: #000000;
  --surface-raised: rgba(255,236,210,.05);
  --text: #f4efe6;
  --text-main: #f4efe6;
  --text-strong: #faf6ef;
  --text-muted: rgba(232,220,200,.62);
  --muted: rgba(232,220,200,.62);
  --text-faint: rgba(210,196,176,.45);
  --border: rgba(232,214,188,.12);
  --border-soft: rgba(232,214,188,.06);
  --separator: rgba(232,214,188,.10);
  --separator-soft: rgba(232,214,188,.06);
  --control-bg: #14110e;
  --control-border: rgba(232,214,188,.16);
  --control-bg-hover: rgba(255,236,210,.07);
  --ok: #10B981;
  --state-ok: #10B981;
  --warn: #F59E0B;
  --state-warn: #F59E0B;
  --danger: #EF4444;
  --state-danger: #EF4444;
  --info: #C9A36A;
  --disabled: #7a7268;
  --series-measured: #E8D4B0;
  --series-target: #10B981;
  --series-warm: #F59E0B;
  --series-heat: #F59E0B;
  --series-solar: #fcd34d;
  --series-cool: #5F8F73;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --radius-group: 12px;
  --radius-control: 8px;
  --radius-pill: 999px;
  --font-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
  --font-mono: 'ui-monospace', 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace;
  --control-height: 44px;
  --control-compact: 32px;
  --control-min-target: 44px;
  --nav-row-height: 52px;
  --nav-item-height: 36px;
  --duration-fast: 160ms;
  --duration-standard: 180ms;
  --ease-standard: cubic-bezier(.2,.8,.2,1);
  --sidebar-width: 220px;
  --sidebar-collapsed: 72px;
  --content-max: 1120px;
  --content-pad: 22px 36px 48px;
  --breakpoint-compact: 900px;
  --accent: #F59E0B;
  --accent-rgb: 245,158,11;
  --accent-soft-rgb: 252,211,77;
  --text-on-accent: #101114;
  --focus-ring: rgba(245,158,11,.80);
  --fill-selected: rgba(245,158,11,.08);
  --fill-forest: rgba(16,185,129,.16);
  --vbar-gradient: linear-gradient(90deg, #fcd34d, #F59E0B);
  --forest: #10B981;
  --forest-rgb: 16,185,129;
  --bg-glow: radial-gradient(ellipse 72% 54% at 0% 0%, rgba(16,185,129,.16) 0%, rgba(245,158,11,.07) 42%, transparent 70%);
  --inset: rgba(255,236,210,.035);
  --label: rgba(232,220,200,.62);
  --thermal-supply: #FCD34D;
  --thermal-heat: #F59E0B;
  --thermal-return: #10B981;
  --pipe-calling: #F59E0B;
  --pipe-idle: #10B981;
  --pipe-unused: rgba(232,214,188,.20);
  --brand-word: #FAF6EF;
  --brand-rim: #25221E;
  --brand-lockup-w: 80px;
  --brand-lockup-h: 59px;
  --brand-manifold-w: 108px;
  --brand-manifold-h: 80px;
}

:root[data-color-scheme="light"] {
  color-scheme: light;
  --bg: #f4f0ea;
  --surface: #fffaf4;
  --surface-base: #f4f0ea;
  --surface-raised: rgba(255,255,255,.88);
  --text: #2a241c;
  --text-main: #2a241c;
  --text-strong: #16130f;
  --text-muted: rgba(42,36,28,.68);
  --muted: rgba(42,36,28,.68);
  --text-faint: rgba(52,44,34,.50);
  --border: rgba(42,36,28,.16);
  --border-soft: rgba(42,36,28,.08);
  --separator: rgba(42,36,28,.10);
  --separator-soft: rgba(42,36,28,.08);
  --control-bg: rgba(255,250,244,.94);
  --control-border: rgba(42,36,28,.20);
  --control-bg-hover: rgba(42,36,28,.05);
  --ok: #047857;
  --state-ok: #047857;
  --warn: #9a5b00;
  --state-warn: #9a5b00;
  --danger: #c73535;
  --state-danger: #c73535;
  --info: #8a5a12;
  --disabled: #6b6358;
  --accent: #b45309;
  --accent-rgb: 180,83,9;
  --accent-soft-rgb: 180,83,9;
  --text-on-accent: #ffffff;
  --focus-ring: rgba(180,83,9,.78);
  --fill-selected: rgba(180,83,9,.08);
  --fill-forest: rgba(4,120,87,.14);
  --vbar-gradient: linear-gradient(90deg, #d97706, #b45309);
  --forest: #047857;
  --forest-rgb: 4,120,87;
  --bg-glow: radial-gradient(ellipse 68% 48% at 0% 0%, rgba(4,120,87,.11) 0%, rgba(180,83,9,.05) 44%, transparent 68%);
  --inset: rgba(42,36,28,.04);
  --label: rgba(42,36,28,.68);
}

.lune-lockup { display: flex; align-items: center; gap: 8px; }
.lune-lockup svg { display: block; width: var(--brand-lockup-w); height: var(--brand-lockup-h); flex: 0 0 auto; overflow: visible; }
.lune-lockup .product { color: var(--text-strong); font-size: .72rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
.lune-mark.is-landscape { width: var(--brand-manifold-w); height: var(--brand-manifold-h); }
.lune-mark .halo-arc { fill: none; stroke-linecap: round; }
.lune-mark .disc-cut { fill: var(--bg); }
.lune-mark .disc { fill: #0c0b09; stroke: var(--brand-rim, #25221E); stroke-width: 1.5; }
.lune-mark .pipe { fill: none; stroke-linecap: round; }
.lune-mark .pipe.is-calling { stroke: var(--pipe-calling); filter: drop-shadow(0 0 4px var(--pipe-calling)); stroke-dasharray: 7 9; animation: lune-pipe-run 1.05s linear infinite; }
.lune-mark .pipe.is-idle { stroke: var(--pipe-idle); opacity: .42; }
.lune-mark .pipe.is-unused { stroke: var(--pipe-unused); }
.lune-mark .pipe.is-focus { stroke-width: 8.5; }
.lune-mark .sku, .lune-mark .word { fill: var(--brand-word, #FAF6EF); font-family: var(--font-ui); font-weight: 700; }
@keyframes lune-pipe-run { to { stroke-dashoffset: -16; } }
@media (prefers-reduced-motion: reduce) {
  .lune-mark .pipe.is-calling { animation: none; stroke-dasharray: none; }
}
`;D("lds-tokens",ir);var Na={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","nav.overview":"Overview","nav.help":"Help","nav.more":"More","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.scrollBottom":"Scroll to bottom","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.noData":"No data","overview.graph.collecting":"Collecting history\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 open Zones to clear or relearn.","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armed)","overview.timeline.absorbReactive":"Absorb (reactive)","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Valve","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.override.remaining":"Touch offset {offset} \xB7 {remaining} remaining","zone.override.hint":"Temporary command from Lune Touch","zone.chart.kicker":"Temperature \xB7 last 24h","zone.chart.note":"Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.","zone.demand":"Demand","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.sensor.externalSource":"External (Wi\u2011Fi)","zone.sensor.externalTitle":"External (Wi\u2011Fi)","zone.sensor.externalNote":"Bind a stable sensor_id. Hubs POST temperatures; zone mapping stays on V6. See Help \u2192 External room temperature.","zone.sensor.sensorIdPh":"sensor_id (MAC or entity id)","zone.sensor.sensorNamePh":"Friendly name (optional)","zone.sensor.noIngestYet":"No external temperature received yet.","zone.sensor.lastIngestAge":"Last ingest {sec}s ago (stale after 15 min).","help.external.title":"External room temperature","help.external.intro":"V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.","help.external.keyWarn":"Scripts include your browser session key if set \u2014 treat it as a secret.","help.external.copy":"Copy","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","settings.manifold.title":"Manifold Configuration","settings.manifold.panelTitle":"Manifold and probes","settings.manifold.panelSub":"Valve polarity and live 1-Wire readings","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe temperatures","settings.manifold.availableProbes":"Available probes","settings.manifold.availableProbesSub":"How many 1-Wire sensors are fitted on this manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Return","settings.manifold.roleBoth":"Flow \xB7 Return","settings.manifold.probeConflict":"That probe is already assigned to another role.","settings.manifold.unusedProbeWarn":"{enabled} active zones but only {assigned} zone return probes assigned.","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.panelSub":"Minimum opening on active loops","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"Local V6 hydraulic safeguard; heat-source and pump stay external.","settings.minFlow.opening":"Minimum total opening (%)","settings.minFlow.openingSub":"Only across loops already accepting heat.","settings.minFlow.failsafe":"Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.","settings.returnTemp.title":"Return temperature","settings.returnTemp.panelSub":"Optional per-zone return probes","settings.returnTemp.modeOff":"2 probes \xB7 flow/return only","settings.returnTemp.modeOn":"8 probes \xB7 per-zone returns","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Legacy return-temp balancing only \u2014 not needed for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.panelSub":"Shelly BLU display time","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: the close stroke is capped at 34s and 2600 commutations \u2014 40s is where the plunger leaves its housing. Opening is capped separately at 45s.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Product colour is amber for heat and forest for healthy state. Light and dark follow the system appearance.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.product":"Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Local handling of external preload","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. A new DEMAND redistributes flow instead of releasing the window.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armed","settings.preheat.reactive":"Reactive","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.enable.title":"Enable the drivers","diagnostics.lab.enable.copy":"Rev 3.3 has no fault latch. This pauses automatic zone control and raises DRIVER_N_SLEEP so the bridges can run.","diagnostics.lab.enable.action":"Enable drivers","diagnostics.lab.log.enableWait":"Raising DRIVER_N_SLEEP \u2014 no LATCH_ARM on this board","diagnostics.lab.enableBanner":"The drivers did not enable. FAULT_N_RAW, rail overcurrent or the USB switch may be asserted.","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The browser keeps the live chart for the full stroke.","diagnostics.lab.tune.title":"Endstop thresholds","diagnostics.lab.tune.copy":"Raise multipliers or slopes if the stroke stops too early. Changes apply immediately to this controller.","diagnostics.lab.log.tune":"Threshold {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Cleared learned motor factors for a clean stroke","diagnostics.lab.log.resetLearnedFailed":"Could not clear learned factors \u2014 continuing","diagnostics.lab.log.duration":"Timed move arm set to {seconds}s","diagnostics.lab.log.browserLog":"Chart kept from browser log ({seconds}s)","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armPulseWait":"Waiting for latch arm pulse \u2014 pad 10 should read 3.3 V for ~5 s","diagnostics.lab.log.armProbeWait":"Square-waving LATCH_ARM at 100 Hz \u2014 U2 pin 1 should show ~0.5 V AC","diagnostics.lab.log.armProbe":"Clock probe {hz} Hz \xD7 {cycles} cycles \u2014 armed {armed} (first at {at})","diagnostics.lab.log.armHigh":"Firmware readback: pad 10 HIGH (GPIO17 is driven)","diagnostics.lab.log.armGpio":"GPIO17 never went high \u2014 pad 10 stayed LOW in firmware readback","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.latchFaulted":"Fault latch did not arm \u2014 LATCH_STATE stayed high after the pulse","diagnostics.lab.log.enableFailed":"Drivers did not enable \u2014 a fault net may be asserted","diagnostics.lab.log.neverStarted":"Motor never started (busy stayed off)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"The fault latch did not arm: LATCH_STATE stayed high after the arm pulse. Firmware cannot read FAULT_N_RAW, so the cause cannot be narrowed from here. Either a driver fault is latched (check driver nFAULT, the overcurrent comparator, 3V3_MOTOR) or the arm clock never reached the flip-flop (check R4, C4, Q1 and U2).","diagnostics.lab.armGpioBanner":"GPIO17 never went high. Watch pad 10 while Arming: it must read 3.3 V. If the gauge stays LOW, firmware is not driving the pin.","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.noEndstop":"No {direction} endstop in {seconds}s \u2014 still free-travel; try again after a full seat, or raise safe runtime","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relative Kv (orifice model)","diagnostics.lab.kvHint":"Used by the flow allocator","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 Motor Lab holds background polls","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","nav.overview":"Overblik","nav.help":"Hj\xE6lp","nav.more":"Mere","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.scrollBottom":"Til bunden","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.noData":"Ingen data","overview.graph.collecting":"Indsamler historik\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 \xE5bn Zoner for at kvittere eller genl\xE6re.","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armeret)","overview.timeline.absorbReactive":"Absorb (reaktiv)","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Ventil","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.override.remaining":"Touch-offset {offset} \xB7 {remaining} tilbage","zone.override.hint":"Midlertidig kommando fra Lune Touch","zone.chart.kicker":"Temperatur \xB7 seneste 24t","zone.chart.note":"Den stiplede linje er det langsigtede setpunkt. Gulvvarme bev\xE6ger sig langsomt, s\xE5 kurven er det nyttige signal.","zone.demand":"Behov","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.sensor.externalSource":"Ekstern (Wi\u2011Fi)","zone.sensor.externalTitle":"Ekstern (Wi\u2011Fi)","zone.sensor.externalNote":"Bind et stabilt sensor_id. Hubs poster temperaturer; zone-mapping sker kun p\xE5 V6. Se Hj\xE6lp \u2192 Ekstern rumtemperatur.","zone.sensor.sensorIdPh":"sensor_id (MAC eller entity-id)","zone.sensor.sensorNamePh":"Venligt navn (valgfrit)","zone.sensor.noIngestYet":"Ingen ekstern temperatur modtaget endnu.","zone.sensor.lastIngestAge":"Seneste ingest for {sec}s siden (stale efter 15 min).","help.external.title":"Ekstern rumtemperatur","help.external.intro":"V6 accepterer HTTP POST med sensor_id. Zone-mapping sker kun p\xE5 V6. Touch ingerer ikke temperaturer.","help.external.keyWarn":"Scripts inkluderer din browser-session-n\xF8gle hvis sat \u2014 behandl den som hemmelighed.","help.external.copy":"Kopi\xE9r","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","settings.manifold.title":"Manifold-konfiguration","settings.manifold.panelTitle":"Manifold og prober","settings.manifold.panelSub":"Ventilpolaritet og live 1-Wire-m\xE5linger","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.availableProbes":"Tilg\xE6ngelige prober","settings.manifold.availableProbesSub":"Hvor mange 1-Wire-sensorer der er monteret p\xE5 denne manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Retur","settings.manifold.roleBoth":"Flow \xB7 Retur","settings.manifold.probeConflict":"Den probe er allerede tildelt en anden rolle.","settings.manifold.unusedProbeWarn":"{enabled} aktive zoner, men kun {assigned} zone-returprober tildelt.","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.panelSub":"Minimum \xE5bning p\xE5 aktive sl\xF8jfer","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"Lokal V6-hydrauliksikring; varmekilde og pumpe forbliver eksterne.","settings.minFlow.opening":"Minimum total \xE5bning (%)","settings.minFlow.openingSub":"Kun p\xE5 sl\xF8jfer, der allerede tager varme.","settings.minFlow.failsafe":"Manifoldventilerne er Normally Open: ved str\xF8msvigt \xE5bner alle ventiler. Hvis cirkulationspumpen stadig har str\xF8m (eller kommer f\xF8rst online), kan sekund\xE6rsiden f\xE5 ubegr\xE6nset flow indtil V6 genstarter og genoptager styring.","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.panelSub":"Valgfrie returprober pr. zone","settings.returnTemp.modeOff":"2 prober \xB7 kun flow/retur","settings.returnTemp.modeOn":"8 prober \xB7 retur pr. zone","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Kun til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendig for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.panelSub":"Tid p\xE5 Shelly BLU-displays","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: luk-slaget er begr\xE6nset til 34s og 2600 kommutationer \u2014 ved 40s forlader stemplet motorhuset. \xC5bning har sin egen gr\xE6nse p\xE5 45s.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Produktfarven er amber til varme og skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.product":"Amber til handling og varme, skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Lokal h\xE5ndtering af ekstern forvarmning","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Nyt DEMAND omfordeler flow i stedet for at slippe vinduet.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armeret","settings.preheat.reactive":"Reaktiv","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.enable.title":"T\xE6nd driverne","diagnostics.lab.enable.copy":"Rev 3.3 har ingen fejl-latch. Det s\xE6tter automatisk zonestyring p\xE5 pause og s\xE6tter DRIVER_N_SLEEP h\xF8j, s\xE5 broerne kan k\xF8re.","diagnostics.lab.enable.action":"T\xE6nd drivere","diagnostics.lab.log.enableWait":"S\xE6tter DRIVER_N_SLEEP \u2014 ingen LATCH_ARM p\xE5 dette board","diagnostics.lab.enableBanner":"Driverne t\xE6ndte ikke. FAULT_N_RAW, skinne-overstr\xF8m eller USB-kontakten kan v\xE6re aktiv.","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Browseren beholder live-grafen for hele slaget.","diagnostics.lab.tune.title":"Endstop-t\xE6rskler","diagnostics.lab.tune.copy":"H\xE6v multiplikatorer eller slopes, hvis slaget stopper for tidligt. \xC6ndringer g\xE6lder med det samme p\xE5 denne controller.","diagnostics.lab.log.tune":"T\xE6rskel {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Nulstillede l\xE6rte motorfaktorer for et rent slag","diagnostics.lab.log.resetLearnedFailed":"Kunne ikke nulstille l\xE6rte faktorer \u2014 forts\xE6tter","diagnostics.lab.log.duration":"Timed move sat til {seconds}s","diagnostics.lab.log.browserLog":"Graf beholdt fra browser-log ({seconds}s)","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armPulseWait":"Venter p\xE5 latch-puls \u2014 pad 10 skal vise 3,3 V i ca. 5 s","diagnostics.lab.log.armProbeWait":"Firkant p\xE5 LATCH_ARM ved 100 Hz \u2014 U2 pin 1 skal vise ca. 0,5 V AC","diagnostics.lab.log.armProbe":"Clock-probe {hz} Hz \xD7 {cycles} cyklusser \u2014 armeret {armed} (f\xF8rst ved {at})","diagnostics.lab.log.armHigh":"Firmware-readback: pad 10 HIGH (GPIO17 drives)","diagnostics.lab.log.armGpio":"GPIO17 gik aldrig h\xF8j \u2014 pad 10 forblev LOW i firmware-readback","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.latchFaulted":"Fejl-latch armerede ikke \u2014 LATCH_STATE forblev h\xF8j efter pulsen","diagnostics.lab.log.enableFailed":"Driverne t\xE6ndte ikke \u2014 et fejlnet kan v\xE6re aktivt","diagnostics.lab.log.neverStarted":"Motoren startede aldrig (busy blev ved med at v\xE6re slukket)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"Fejl-latch armerede ikke: LATCH_STATE forblev h\xF8j efter arm-pulsen. Firmware kan ikke l\xE6se FAULT_N_RAW, s\xE5 \xE5rsagen kan ikke indkredses herfra. Enten er en driverfejl l\xE5st (tjek driver nFAULT, overstr\xF8mskomparatoren og 3V3_MOTOR), eller arm-clocken n\xE5ede aldrig flip-floppen (tjek R4, C4, Q1 og U2).","diagnostics.lab.armGpioBanner":"GPIO17 gik aldrig h\xF8j. Pad 10 skal vise 3,3 V mens der armeres. Hvis m\xE5leren bliver p\xE5 LOW, driver firmware ikke pinnen.","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.noEndstop":"Ingen {direction}-endstop i {seconds}s \u2014 stadig fri l\xF8b; pr\xF8v efter fuld seat, eller h\xE6v safe runtime","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relativ Kv (\xE5bningsmodel)","diagnostics.lab.kvHint":"Bruges af flowallokatoren","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 Motor Lab holder baggrundspoll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},lr="en".toLowerCase(),Lo=Na[lr]?lr:"en";function c(t,e){let a=Na[Lo]&&Na[Lo][t]||Na.en[t]||t;return e?String(a).replace(/\{(\w+)\}/g,(o,r)=>e[r]==null?"":String(e[r])):a}function R(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=c(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",c(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",c(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",c(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Lo);var dr=`
.lds-dial {
  display: grid;
  grid-template-columns: 260px var(--control-height, 44px);
  align-items: center;
  gap: 18px;
  width: max-content;
  margin: 0;
}
.lds-dial[aria-disabled="true"] { opacity: .55; pointer-events: none; }
.lds-dial-arc {
  position: relative;
  width: 248px;
  height: 290px;
}
.lds-dial-arc .lune-mark { display: block; width: 248px; height: 290px; }
.lds-dial-readout {
  position: absolute;
  left: 50%;
  top: 38%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  pointer-events: none;
  text-align: center;
}
.lds-dial-target {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -.04em;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
}
.lds-dial-unit { margin-left: 1px; font-size: 1.15rem; font-weight: 700; color: var(--text-strong); }
.lds-dial-current {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .04em;
  font-variant-numeric: tabular-nums;
}
.lds-dial-live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.lds-dial-steps { display: grid; gap: 12px; }
.lds-dial-step {
  width: var(--control-height, 44px);
  height: var(--control-height, 44px);
  border: 1px solid var(--control-border);
  border-radius: 50%;
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}
.lds-dial-step:hover {
  border-color: rgba(var(--forest-rgb), .5);
  color: var(--forest);
  background: var(--fill-forest);
}
.lds-dial-step:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }

.lds-override-banner,
.ui-override-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 18px;
  padding: 12px 14px;
  border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  color: var(--text-main);
}
.lds-override-banner[hidden],
.ui-override-banner[hidden] { display: none !important; }
.lds-override-main,
.ui-override-main {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  padding: 0;
}
.lds-override-main strong,
.ui-override-main strong,
.lds-override-main small,
.ui-override-main small { display: block; }
.lds-override-main strong,
.ui-override-main strong { color: var(--text-strong); font-size: .9rem; }
.lds-override-main small,
.ui-override-main small { margin-top: 2px; color: var(--text-muted); font-size: .78rem; }

.lds-slider-row,
.slider-row {
  display: grid;
  grid-template-columns: minmax(160px, 280px) auto;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
}
.lds-slider-row strong,
.slider-row strong {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
  color: var(--text-strong);
}
.lds-slider-row input[type=range],
.slider-row input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 16px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.lds-slider-row input[type=range]::-webkit-slider-runnable-track,
.slider-row input[type=range]::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background:
    linear-gradient(to right, transparent var(--slider-fill, 50%), color-mix(in srgb, var(--text-faint) 22%, transparent) var(--slider-fill, 50%)),
    linear-gradient(to right, var(--forest), var(--accent));
}
.lds-slider-row input[type=range]::-webkit-slider-thumb,
.slider-row input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -5px;
  border-radius: 50%;
  border: 2px solid var(--bg);
  background: var(--accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 45%, transparent);
  cursor: pointer;
}
.lds-slider-row input[type=range]::-moz-range-track,
.slider-row input[type=range]::-moz-range-track {
  height: 6px;
  border: 0;
  border-radius: 999px;
  background:
    linear-gradient(to right, transparent var(--slider-fill, 50%), color-mix(in srgb, var(--text-faint) 22%, transparent) var(--slider-fill, 50%)),
    linear-gradient(to right, var(--forest), var(--accent));
}
.lds-slider-row input[type=range]::-moz-range-thumb,
.slider-row input[type=range]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid var(--bg);
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 45%, transparent);
  cursor: pointer;
}
.lds-slider-row input[type=range]:focus-visible,
.slider-row input[type=range]:focus-visible { outline: none; }
.lds-slider-row input[type=range]:focus-visible::-webkit-slider-thumb,
.slider-row input[type=range]:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--focus-ring);
}
.lds-slider-row input[type=range]:focus-visible::-moz-range-thumb,
.slider-row input[type=range]:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px var(--focus-ring);
}
.lds-slider-row input[type=range]:disabled,
.slider-row input[type=range]:disabled {
  opacity: .55;
  cursor: default;
}
@media (max-width: 900px) {
  .lds-dial {
    grid-template-columns: minmax(0, 248px) var(--control-height, 44px);
    width: 100%;
  }
  .lds-dial-arc,
  .lds-dial-arc .lune-mark {
    width: min(248px, 100%);
    height: auto;
    max-height: 290px;
  }
  .lds-slider-row,
  .slider-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }
}
`;function Mt(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function cr(t,e,a){let o=Number(e),r=Number(a),n=Number(t),s=r-o;return!Number.isFinite(o)||!Number.isFinite(r)||!Number.isFinite(n)||s===0?0:Math.min(100,Math.max(0,(n-o)/s*100))}function Mo({id:t,markHtml:e="",target:a,current:o,min:r=5,max:n=35,step:s=.5,unit:d="C",label:p,disabled:u=!1}={}){let v=t||"lds-dial",l=Mt(p||"Temperature target"),f=Number(a),x=Number(o),w=Number.isFinite(f)?f.toFixed(1):"\u2014",L=Number.isFinite(x)?x.toFixed(1):"\u2014",E=d==="C"||d==="\xB0C"||d==="\xB0"?"\xB0":Mt(d),_=u?' aria-disabled="true"':"";return`<div class="lds-dial" id="${Mt(v)}" role="group" aria-label="${l}" data-dial-min="${r}" data-dial-max="${n}" data-dial-unit="${Mt(E)}"${_}>
  <div class="lds-dial-arc">
    ${e}
    <div class="lds-dial-readout">
      <div class="lds-dial-target"><span data-dial-target>${w}</span><span class="lds-dial-unit">${E}</span></div>
      <div class="lds-dial-current" data-dial-current>Current ${L}${E}</div>
    </div>
    <span class="lds-dial-live" data-dial-live aria-live="polite">${w}${E}</span>
  </div>
  <div class="lds-dial-steps">
    <button type="button" class="lds-dial-step" data-dial-step="${s}" aria-label="Increase" ${u?"disabled":""}>+</button>
    <button type="button" class="lds-dial-step" data-dial-step="-${s}" aria-label="Decrease" ${u?"disabled":""}>\u2212</button>
  </div>
</div>`}function Ao(t,{target:e,current:a,disabled:o,states:r,selected:n}={}){let s=typeof t=="string"?document.querySelector(t):t;if(!s)return;let d=s.dataset.dialUnit||"\xB0",p=Number(e),u=Number(a),v=Number.isFinite(p)?p.toFixed(1):"\u2014",l=Number.isFinite(u)?u.toFixed(1):"\u2014",f=s.querySelector("[data-dial-target]"),x=s.querySelector("[data-dial-current]"),w=s.querySelector("[data-dial-live]");f&&(f.textContent=v),x&&(x.textContent=`Current ${l}${d}`),w&&(w.textContent=`${v}${d}`),r&&s.querySelectorAll(".pipe").forEach((L,E)=>{let _=r[E]||"idle";L.setAttribute("class",`pipe is-${_}${E===n?" is-focus":""}`)}),o!=null&&(s.setAttribute("aria-disabled",o?"true":"false"),s.querySelectorAll(".lds-dial-step").forEach(L=>{L.disabled=!!o}))}function Eo(t,e={}){let a=typeof t=="string"?document.querySelector(t):t;if(!a)return()=>{};let o=r=>{var d;let n=r.target.closest("button.lds-dial-step[data-dial-step]");if(!n||!a.contains(n)||n.disabled)return;let s=parseFloat(n.getAttribute("data-dial-step"));if(Number.isFinite(s)){if(e.onStep)e.onStep(s);else if(e.onChange){let p=parseFloat(a.dataset.dialMin),u=parseFloat(a.dataset.dialMax),v=parseFloat((d=a.querySelector("[data-dial-target]"))==null?void 0:d.textContent),l=Number.isFinite(v)?v:20,f=Math.min(u,Math.max(p,Math.round((l+s)*10)/10));e.onChange(f)}}};return a.addEventListener("click",o),()=>a.removeEventListener("click",o)}function To({remaining:t="",hint:e="Temporary command from Lune Touch"}={}){return`<div class="lds-override-banner ui-override-banner" data-override-banner ${!String(t||"").trim()?"hidden":""}>
  <div class="lds-override-main ui-override-main">
    <strong data-override-remaining>${Mt(t)}</strong>
    <small data-override-hint>${Mt(e)}</small>
  </div>
</div>`}function Fo(t,{remaining:e="",hint:a}={}){var p;let o=typeof t=="string"?document.querySelector(t):t;if(!o)return;let r=(p=o.matches)!=null&&p.call(o,"[data-override-banner]")?o:o.querySelector("[data-override-banner]");if(!r)return;let n=r.querySelector("[data-override-remaining]"),s=r.querySelector("[data-override-hint]"),d=String(e||"").trim();r.hidden=!d,n&&(n.textContent=d),s&&a!==void 0&&(s.textContent=a)}function No({min:t=5,max:e=35,step:a=.5,value:o=21,label:r="Comfort setpoint",disabled:n=!1}={}){let s=Number(o),d=Number.isFinite(s)?s.toFixed(1):"\u2014",p=cr(s,t,e),u=n?" disabled":"";return`<div class="lds-slider-row slider-row" data-lds-slider-row>
  <input data-comfort-slider type="range" min="${t}" max="${e}" step="${a}" value="${Number.isFinite(s)?s:t}" aria-label="${Mt(r)}" style="--slider-fill:${p}%"${u}>
  <strong data-slider-value>${d}\xB0</strong>
</div>`}function Ra(t){if(!t)return;let e=t.min,a=t.max,o=t.value,r=cr(o,e,a);t.style.setProperty("--slider-fill",`${r}%`)}var Pa=`
.lds-nav-switch,
.nav-switch {
  position: relative;
  width: 34px;
  height: 20px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, .1);
  cursor: pointer;
  padding: 0;
  vertical-align: middle;
}
.lds-nav-switch::after,
.nav-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text-faint);
  transition: left .15s ease, background .15s ease;
}
.lds-nav-switch.is-on,
.nav-switch.is-on {
  background: rgba(var(--forest-rgb), .35);
}
.lds-nav-switch.is-on::after,
.nav-switch.is-on::after {
  left: 17px;
  background: var(--ok);
}
.lds-nav-switch:disabled,
.lds-nav-switch.is-disabled,
.nav-switch:disabled,
.nav-switch.is-disabled {
  opacity: .42;
  cursor: default;
}
.lds-nav-switch:focus-visible,
.nav-switch:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
@media (max-width: 900px) {
  .sidebar.collapsed .lds-nav-switch,
  .sidebar.collapsed .nav-switch {
    display: none;
  }
}
`;function pr(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function De({on:t=!1,disabled:e=!1,label:a="",title:o="",attrs:r="",className:n=""}={}){let s=["lds-nav-switch","nav-switch",t?"is-on":"",e?"is-disabled":"",n].filter(Boolean).join(" "),d=pr(a||o||"Toggle"),p=o||a?` title="${pr(o||a)}"`:"";return`<button type="button" class="${s}" role="switch" aria-checked="${t?"true":"false"}" aria-label="${d}"${p}${e?" disabled":""} data-lds-nav-switch ${r}></button>`}function Da(t,{on:e,disabled:a}={}){var r,n;if(!t)return;let o=(r=t.matches)!=null&&r.call(t,"[data-lds-nav-switch]")?t:(n=t.querySelector)==null?void 0:n.call(t,"[data-lds-nav-switch]");o&&(e!==void 0&&(o.classList.toggle("is-on",!!e),o.setAttribute("aria-checked",e?"true":"false")),a!==void 0&&(o.classList.toggle("is-disabled",!!a),o.disabled=!!a))}var ur=`
.lds-settings-card,
.ui-card {
  background: var(--surface-raised);
  border: 1px solid var(--panel-border, var(--separator));
  border-radius: 8px;
  padding: 18px 20px;
  box-shadow: none;
  box-sizing: border-box;
}
.lds-settings-card-title,
.ui-card-title {
  font-family: var(--font-display);
  font-size: .875rem;
  font-weight: 650;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-strong);
  margin: 0 0 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border, var(--separator));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow: visible;
}
.lds-settings-card .ui-title-text,
.ui-card .ui-title-text {
  display: inline-flex;
  align-items: center;
}
.lds-settings-card-body {
  display: grid;
  gap: 0;
  min-width: 0;
}
`;function ye({titleHtml:t="",bodyHtml:e="",className:a="",attrs:o=""}={}){return`<div class="${["lds-settings-card","ui-card",a].filter(Boolean).join(" ")}" data-lds-settings-card ${o}>
  <div class="lds-settings-card-title ui-card-title"><span class="ui-title-text">${t}</span></div>
  <div class="lds-settings-card-body">${e}</div>
</div>`}D("lds-comfort-control",dr);D("lds-nav-switch",Pa);D("lds-settings-card",ur);var ei=`
/* ---- Titles & section headers (card chrome lives in LDS settings-card) ---- */
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
  gap: 12px;
  min-height: var(--control-height, 44px);
  padding: 6px 0;
  border-bottom: 1px solid var(--divider);
}
.ui-row[hidden] { display: none; }
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .92rem;
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

/* ---- Controls (LDS control.height = 44px) ---- */
.ui-input {
  width: 96px;
  box-sizing: border-box;
  text-align: right;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 10px;
  font-size: .875rem;
  font-family: var(--mono);
  line-height: 1.2;
  box-shadow: none;
  transition: border-color .15s ease;
}
/* Text fields and selects in label+control rows share one control width. */
.ui-input.wide {
  width: var(--control-width, 180px);
  max-width: 100%;
  text-align: left;
  font-family: inherit;
}

.ui-select {
  width: var(--control-width, 180px);
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 10px;
  font-size: .875rem;
  line-height: 1.2;
  box-shadow: none;
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
  font-size: 1rem;
  font-weight: 700;
  cursor: text;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: var(--control-height, 44px);
  height: var(--control-height, 44px);
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  box-shadow: none;
  cursor: pointer;
  font-size: 1.1rem;
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

/* ---- Green pill toggle (canonical; 44pt hit area, compact track) ---- */
.ui-toggle {
  width: 51px;
  height: var(--control-height, 44px);
  border-radius: 999px;
  background: transparent;
  position: relative;
  cursor: pointer;
  border: 0;
  flex-shrink: 0;
}
.ui-toggle::before {
  content: '';
  position: absolute;
  inset: 10px 2px;
  border: 1px solid var(--control-border);
  border-radius: 999px;
  background: var(--control-bg-hover);
  transition: background .2s ease, border-color .2s ease;
}
.ui-toggle::after {
  content: '';
  position: absolute;
  top: 13px;
  left: 6px;
  width: 18px;
  height: 18px;
  background: var(--control-knob);
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on::before { background: var(--accent); border-color: var(--accent); }
.ui-toggle.on::after { transform: translateX(21px); background: var(--text-on-accent); }

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
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 14px;
  cursor: pointer;
  font-weight: 650;
  font-size: .875rem;
  line-height: 1.2;
  box-shadow: none;
  transition: .15s ease;
}
.ui-btn:hover { background: var(--control-bg-hover); border-color: var(--accent); color: var(--accent); }
.ui-btn.warn { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-text); }
.ui-btn.warn:hover { background: var(--danger-bg-strong); border-color: var(--danger-border-strong); }

@media (max-width: 900px) {
  .ui-row { align-items: stretch; flex-direction: column; gap: 4px; padding: 8px 0; }
  .ui-field { align-self: stretch; width: 100%; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-btn { width: 100%; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}

/* ---- LDS primitives: zone row, planner, segmented, info list ---- */
.lds-zone-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(72px, .7fr) minmax(72px, .7fr) minmax(90px, .9fr) 44px;
  gap: var(--space-3, 12px);
  align-items: center;
  width: 100%;
  min-height: 72px;
  padding: 12px 8px 12px 16px;
  border: 0;
  border-top: 2px solid var(--accent);
  background: var(--surface-raised);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.lds-zone-row + .lds-zone-row { border-top: 1px solid var(--separator); }
.lds-zone-row:hover { background: color-mix(in srgb, var(--surface-raised) 70%, rgba(255,255,255,.04)); }
.lds-zone-row:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: -3px; }
.lds-zone-row-name, .lds-zone-row-meta, .lds-zone-row-value strong, .lds-zone-row-value small { display: block; }
.lds-zone-row-name { color: var(--text-strong); font-size: .94rem; font-weight: 650; }
.lds-zone-row-meta { margin-top: 2px; color: var(--text-faint); font-size: .75rem; }
.lds-zone-row-value strong { color: var(--text-strong); font-family: var(--font-display); font-size: 1rem; font-weight: 650; font-variant-numeric: tabular-nums; }
.lds-zone-row-value small { margin-top: 2px; color: var(--text-faint); font-size: .75rem; }
.lds-zone-row-status { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: .8rem; font-weight: 600; }
.lds-zone-row-status i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.lds-zone-row.ok .lds-zone-row-status { color: var(--ok); }
.lds-zone-row.warn .lds-zone-row-status, .lds-zone-row.fault .lds-zone-row-status { color: var(--danger); }
.lds-zone-row.is-selected { background: var(--fill-forest); }
.lds-zone-row.active .lds-zone-row-status { color: var(--accent); }
.lds-zone-row-chevron { display: grid; width: 44px; height: 44px; place-items: center; color: var(--muted); font-size: 1.35rem; }
@media (max-width: 900px) {
  .lds-zone-row { grid-template-columns: minmax(0, 1fr) minmax(70px, .6fr) 44px; }
  .lds-zone-row-value:nth-of-type(2), .lds-zone-row .lds-zone-row-status { display: none; }
}

.lds-planner { display: grid; gap: var(--space-3, 12px); }
.lds-planner-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.lds-planner-day {
  min-height: var(--control-height, 44px);
  border: 1px solid var(--control-border);
  border-radius: var(--radius-control, 10px);
  background: var(--control-bg);
  color: var(--text);
  font-size: .78rem;
  font-weight: 650;
  cursor: pointer;
}
.lds-planner-day[aria-pressed="true"] { border-color: rgba(var(--forest-rgb), .45); background: var(--fill-forest); color: var(--text-strong); }
.lds-planner-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.lds-planner-fields label { display: grid; gap: 4px; color: var(--text-muted); font-size: .78rem; font-weight: 600; }
.lds-planner-fields input { height: var(--control-height, 44px); border: 1px solid var(--control-border); border-radius: var(--radius-control, 10px); background: var(--control-bg); color: var(--text); padding: 0 10px; }
.lds-planner-timeline { display: grid; gap: 6px; }
.lds-planner-bar {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: var(--control-bg);
  border: 1px solid var(--separator);
  overflow: hidden;
}
.lds-planner-bar > span {
  position: absolute;
  top: 0; bottom: 0;
  background: var(--accent);
  opacity: .85;
}
.lds-planner-scale { display: flex; justify-content: space-between; color: var(--text-faint); font-size: 12px; }

.lds-segmented { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 6px; width: 100%; }
.lds-segmented label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--control-height, 44px);
  padding: 0 10px;
  border: 1px solid var(--control-border);
  border-radius: var(--radius-control, 10px);
  background: var(--control-bg);
  color: var(--text);
  font-size: .84rem;
  font-weight: 650;
  cursor: pointer;
}
.lds-segmented input { position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer; }
.lds-segmented label:has(input:checked) { border-color: var(--accent); background: var(--fill-selected); color: var(--accent); }
.lds-segmented label:focus-within { outline: 2px solid var(--focus-ring); outline-offset: 1px; }

.lds-info-list { display: grid; gap: var(--space-4, 16px); }
.lds-info-group { border-top: 1px solid var(--separator); padding-top: var(--space-3, 12px); }
.lds-info-group h3 { margin: 0 0 8px; color: var(--text-strong); font-size: .9rem; font-weight: 650; }
.lds-info-group dl { margin: 0; display: grid; gap: 0; }
.lds-info-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 12px;
  align-items: baseline;
  min-height: 44px;
  padding: 8px 0;
  border-bottom: 1px solid var(--separator-soft);
}
.lds-info-row:last-child { border-bottom: 0; }
.lds-info-row dt { color: var(--text-muted); font-size: .84rem; }
.lds-info-row dd { margin: 0; color: var(--text-strong); font-size: .92rem; font-weight: 650; font-variant-numeric: tabular-nums; text-align: right; }
`;D("ui-kit",ei);function Le(t){let e=c(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function ti(t,e){let a=Math.abs(Number(t));return!Number.isFinite(a)||a<1e3?e:Math.pow(10,Math.floor(Math.log10(a))-1)}function ai(t){let e=String(t),a=e.indexOf(".");return a<0?0:e.length-a-1}function Me(t,e={}){let a=!!e.immediate,o=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r),a&&(r.hidden=!0);let n=[],s=()=>{a||r.classList.toggle("show",n.some(g=>g.dirty))},d=g=>{g.dirty&&(g.commit&&Promise.resolve(g.commit()).catch(()=>{}),g.dirty=!1,s())},p=(g,m)=>{g.dirty=m,a&&m?d(g):s()};function u(g){return g.markDirty=()=>p(g,!0),n.push(g),g}function v(g,m){let b={dirty:!1,input:g},y=m.baseStep!=null?m.baseStep:parseFloat(g.step)||1,z=ai(y),N=m.min!=null?m.min:g.min!==""?parseFloat(g.min):-1/0,X=m.max!=null?m.max:g.max!==""?parseFloat(g.max):1/0,$=te=>z>0?Number(te).toFixed(z):String(Math.round(Number(te)));if(!m.nostep){let te=document.createElement("div");te.className="ui-stepper",g.parentNode.insertBefore(te,g);let oe=document.createElement("button");oe.type="button",oe.className="ui-step-btn",oe.textContent="\u2212",oe.setAttribute("aria-label",c("common.decrease"));let le=document.createElement("button");le.type="button",le.className="ui-step-btn",le.textContent="+",le.setAttribute("aria-label",c("common.increase")),te.appendChild(oe),te.appendChild(g),te.appendChild(le);let q=B=>{if(g.disabled)return;let K=parseFloat(g.value);Number.isFinite(K)||(K=parseFloat(g.placeholder)),Number.isFinite(K)||(K=0);let we=Math.min(X,Math.max(N,K+B*ti(K,y)));g.value=$(we),p(b,!0)};oe.addEventListener("click",()=>q(-1)),le.addEventListener("click",()=>q(1)),g.addEventListener("keydown",B=>{B.key==="Enter"&&g.blur()})}return g.addEventListener("input",()=>p(b,!0)),b.sync=()=>{let te=m.read();g.value=te!=null&&Number.isFinite(Number(te))?$(te):""},b.commit=()=>{let te=parseFloat(g.value);Number.isFinite(te)&&m.commit(Math.min(X,Math.max(N,te)))},u(b)}function l(g,m){let b={dirty:!1,input:g};g.addEventListener("input",()=>{b.dirty=!0,s()});let y=()=>{b.dirty&&a&&d(b)};return g.addEventListener("blur",y),g.addEventListener("keydown",z=>{z.key==="Enter"&&(z.preventDefault(),g.blur())}),b.sync=()=>{let z=m.read();g.value=z!=null?z:""},b.commit=()=>m.commit(g.value.trim()),u(b)}function f(g,m){let b={dirty:!1,input:g};return g.addEventListener("change",()=>p(b,!0)),b.sync=()=>{let y=m.read();y!=null&&(g.value=y)},b.commit=()=>m.commit(g.value),u(b)}function x(g,m){let b={dirty:!1,input:g,staged:!1},y=g.closest(".ui-row"),z=()=>{Da(g,{on:b.staged}),y&&y.classList.toggle("is-on",b.staged),m.onChange&&m.onChange(b.staged)};return g.addEventListener("click",()=>{b.staged=!b.staged,p(b,!0),z()}),b.sync=()=>{b.staged=!!m.read(),z()},b.commit=()=>m.commit(b.staged),u(b)}function w(g){let m={dirty:!1,sync:g.sync,commit:g.commit};return u(m)}let L=()=>n.forEach(g=>{!g.dirty&&g.sync&&g.sync()}),E=()=>{n.forEach(g=>{g.dirty&&(g.commit&&Promise.resolve(g.commit()).catch(()=>{}),g.dirty=!1)}),s(),e.onApply&&e.onApply()},_=()=>{n.forEach(g=>{g.dirty=!1,g.sync&&g.sync()}),s(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",E),r.querySelector(".ui-form-discard").addEventListener("click",_),R(r),{num:v,text:l,select:f,toggle:x,custom:w,refresh:L,apply:E,discard:_,isDirty:()=>n.some(g=>g.dirty)}}function Ht(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function $a(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function Ot(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,a=t%86400/3600|0,o=t%3600/60|0;return e>0?e+"d "+a+"h "+o+"m":a>0?a+"h "+o+"m":o+"m"}var mr=`
.lds-live-status {
  margin-top: 12px;
  padding: 12px 10px 0;
  border-top: 1px solid var(--separator);
}
.lds-live-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.lds-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ok);
  font-size: .75rem;
  font-weight: 650;
}
.lds-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 10px var(--ok);
}
.lds-live.is-off {
  color: var(--text-muted);
}
.lds-live.is-off i {
  background: var(--state-disabled);
  box-shadow: none;
}
.lds-live-uptime {
  color: var(--text-muted);
  font-size: .72rem;
  font-weight: 600;
  font-family: var(--mono);
  white-space: nowrap;
}
.lds-live-ip {
  margin-top: 6px;
  color: var(--text-faint);
  font-size: .72rem;
  font-family: var(--mono);
}
.lds-live-uptime[hidden],
.lds-live-ip[hidden] {
  display: none !important;
}
`;function Ro(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function gr({live:t=!1,label:e="Offline",uptime:a="---",ip:o="---",showUptime:r=!0,showIp:n=!0}={}){let s=t?"":" is-off",d=r?"":" hidden",p=n?"":" hidden";return`<div class="lds-live-status" data-lds-live-status>
  <div class="lds-live-row">
    <span class="lds-live${s}" data-lds-live><i aria-hidden="true"></i><span data-lds-live-label>${Ro(e)}</span></span>
    <span class="lds-live-uptime" data-lds-uptime${d}>${Ro(a)}</span>
  </div>
  <div class="lds-live-ip" data-lds-ip${p}>${Ro(o)}</div>
</div>`}function Ia(t,{live:e,label:a,uptime:o,ip:r}={}){var v,l;if(!t)return;let n=(v=t.matches)!=null&&v.call(t,"[data-lds-live-status]")?t:(l=t.querySelector)==null?void 0:l.call(t,"[data-lds-live-status]");if(!n)return;let s=n.querySelector("[data-lds-live]"),d=n.querySelector("[data-lds-live-label]"),p=n.querySelector("[data-lds-uptime]"),u=n.querySelector("[data-lds-ip]");s&&e!==void 0&&s.classList.toggle("is-off",!e),d&&a!==void 0&&d.textContent!==a&&(d.textContent=a),p&&o!==void 0&&p.textContent!==o&&(p.textContent=o),u&&r!==void 0&&u.textContent!==r&&(u.textContent=r)}var oi=`
.v6-toolbar { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; min-height:0; }
.v6-toolbar-leading { display:flex; align-items:flex-start; gap:14px; min-width:0; }
.v6-toolbar-icon { width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; color:var(--text-muted); background:transparent; font-size:18px; cursor:pointer; }
.v6-toolbar-icon:hover { color:var(--text-strong); background:var(--inset); }
.v6-toolbar h1 { margin:4px 0 0; color:var(--text-strong); font-size:1.45rem; line-height:1.15; font-weight:650; letter-spacing:-.02em; }
.v6-toolbar p { margin:4px 0 0; color:var(--text-muted); font-size:.8rem; }
.v6-toolbar-kicker { margin:0; color:var(--text-muted); font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.v6-toolbar-trailing { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; padding-top:6px; }
.v6-live { display:inline-flex; align-items:center; gap:7px; color:var(--text-muted); font-size:.78rem; font-weight:650; }
.v6-live::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--state-disabled); }
.v6-live.is-live { color:var(--state-ok); }
.v6-live.is-live::before { background:var(--state-ok); }
.v6-update-badge,.v6-attention-badge { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 12px; border-radius:999px; font:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }
.v6-update-badge { border:1px solid var(--accent-border); background:var(--accent-bg-soft); color:var(--accent); }
.v6-update-badge[hidden],.v6-attention-badge[hidden] { display:none; }
.v6-update-badge:hover { border-color:var(--accent-border-hover); background:rgba(var(--accent-rgb),.18); }
.v6-update-badge::before,.v6-attention-badge::before { content:''; width:7px; height:7px; border-radius:50%; background:currentColor; }
.v6-attention-badge { border:1px solid color-mix(in srgb,var(--warn) 45%,transparent); background:color-mix(in srgb,var(--warn) 12%,transparent); color:var(--state-warn); }
.v6-attention-badge:hover { border-color:color-mix(in srgb,var(--warn) 70%,transparent); background:color-mix(in srgb,var(--warn) 18%,transparent); }
.side-nav-slot hv6-sidebar { display:flex; flex:1; min-height:0; width:100%; }
.v6-side-nav { display:flex; flex:1; flex-direction:column; gap:0; min-height:0; }
.v6-nav-group { margin:0 0 18px; }
.v6-nav-heading { display:block; padding:14px 10px 6px; color:var(--text-faint); font-size:.62rem; font-weight:750; letter-spacing:.1em; text-transform:uppercase; pointer-events:none; }
.v6-side-link {
  position:relative; display:flex; align-items:center; gap:8px; width:100%; min-height:var(--nav-item-height,36px);
  padding:0 10px; border:0; border-radius:8px; color:var(--text-muted); background:transparent;
  text-decoration:none; font-size:.8rem; font-weight:600; text-align:left; cursor:pointer;
}
.v6-side-link:hover { color:var(--text-strong); background:var(--inset); }
.v6-side-link.active { color:var(--text-strong); background:var(--fill-forest); }
.v6-side-link .dot {
  width:8px; height:8px; border-radius:50%; background:var(--ok); flex:0 0 auto;
  box-shadow:0 0 8px var(--ok);
}
.v6-side-link .dot.is-online { background:var(--ok); box-shadow:0 0 8px var(--ok); }
.v6-side-link .dot.is-heating { background:var(--accent); box-shadow:0 0 8px var(--accent); }
.v6-side-link .dot.is-idle { background:var(--ok); opacity:.55; box-shadow:none; }
.v6-side-link .dot.is-off { background:var(--text-faint); box-shadow:none; opacity:.45; }
.v6-side-link .dot.is-overheated {
  background:var(--state-warn); box-shadow:0 0 8px color-mix(in srgb,var(--state-warn) 55%,transparent);
}
.v6-side-link .dot.is-fault {
  width:12px; height:12px; border-radius:4px; background:var(--danger); box-shadow:none;
  color:#fff; font-size:9px; font-weight:800; line-height:12px; text-align:center;
  display:inline-grid; place-items:center;
}
.v6-nav-dot { margin-left:auto; width:8px; height:8px; border-radius:50%; background:var(--accent); flex:0 0 auto; }
.v6-nav-dot[hidden] { display:none !important; }
.v6-nav-dot.is-warn { background:var(--state-warn); }
.menu-icon { width:14px; height:14px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; color:var(--text-faint); }
.v6-nav-zones { display:flex; flex-direction:column; gap:2px; }
.v6-nav-row { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:4px; }
.v6-nav-row .v6-side-link { min-width:0; }
.v6-side-utility { margin-top:auto; padding-top:12px; border-top:1px solid var(--separator); }
.v6-more-toggle { display:none; }
.v6-tab-zones { display:none !important; }
@media (min-width:901px) {
  .v6-side-link .menu-icon { display:none; }
}
@media (max-width:900px) {
  .v6-toolbar { min-height:48px; }
  .v6-toolbar-trailing { gap:8px; }
  .v6-side-nav { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
  .v6-nav-group { display:contents; }
  .v6-nav-heading, .v6-side-utility, .lds-live-status, .v6-nav-zones { display:none !important; }
  .v6-side-link { justify-content:center; flex-direction:column; gap:2px; min-height:var(--nav-row-height,52px); padding:4px; font-size:.68rem; width:auto; }
  .v6-side-link .dot { display:none; }
  .v6-side-link[data-section="settings"],
  .v6-side-link[data-section="motorlab"],
  .v6-side-link[data-panel] { display:none; }
  .v6-tab-zones { display:flex !important; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"],
  .v6-side-nav.more-open .v6-side-link[data-section="motorlab"]:not([hidden]),
  .v6-side-nav.more-open .v6-side-link[data-panel] { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { display:contents; border:0; padding:0; margin:0; }
  .v6-side-nav.more-open .v6-side-utility .v6-side-link { display:flex; }
  .v6-nav-dot { position:absolute; top:6px; right:10px; margin-left:0; width:7px; height:7px; }
}
`;D("hv6-header",oi);D("lds-live-status",mr);D("lds-nav-switch",Pa);var ni=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><button type="button" class="v6-toolbar-icon" aria-label="Collapse navigation" aria-pressed="false"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14"/></svg></button><div><p class="v6-toolbar-kicker" id="v6-view-kicker">Home</p><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button></div>
  </header>`,Xe=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,Ha=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,ri=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Xe('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span class="menu-label">Overview</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Zones</div>
      <div class="v6-nav-zones" data-zone-nav></div>
      <a href="#" class="v6-side-link v6-tab-zones" data-section="zones" hidden>${Xe('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span class="menu-label">Zones</span>${Ha("warn")}</a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Xe('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span class="menu-label">Diagnostics</span>${Ha("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${Xe('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span class="menu-label">Motor lab</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Settings</div>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="touch">${Xe('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/>')}<span class="menu-label">Touch</span>${Ha()}</a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="hydraulics">${Xe('<path d="M4 18h16M7 18V9m5 9V5m5 13v-6"/>')}<span class="menu-label">Hydraulics</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="comfort">${Xe('<path d="M12 4v3M8 8l-2-2M16 8l2-2M6 13h12M9 13c0 4 3 7 3 7s3-3 3-7"/>')}<span class="menu-label">Comfort</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="motors">${Xe('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')}<span class="menu-label">Motors</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="device">${Xe('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>')}<span class="menu-label">Device</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Xe('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span>${Ha()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Xe('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span class="menu-label">Help</span></a></div>
    ${gr({live:!1,label:"Offline",uptime:"---",ip:"---"})}
  </nav>`,br={overview:["Overview / House status","System health & energy flow","Local heating status and current exceptions"],zones:["Controller details","Zones","Physical loops, applied targets and valve state"],diagnostics:["System","Diagnostics","Health, evidence and recovery"],motorlab:["System","Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Settings","Device configuration and safety"],help:["Utility","Help","Guidance for operating Lune V6"]},fr={touch:["Settings","Touch","Approval and coordinator identity"],hydraulics:["Settings","Hydraulics","Manifold probes, return temperature and minimum flow"],comfort:["Settings","Comfort","Room clocks and preheat absorption"],motors:["Settings","Motors","Drivers, profile and learning limits"],device:["Settings","Device","Connection, firmware, backup and appearance"]};function xr(t){t&&(qe(t.section),t.focus==="touch"&&(wa("touch"),requestAnimationFrame(()=>{let e=document.querySelector(".settings-touch-card");e&&e.scrollIntoView({behavior:"smooth",block:"center"})})))}function hr(t){return t?t.kind==="touch"?c("status.attention.approveTouch"):t.kind==="faults"?t.count===1?c("status.attention.zoneFaultOne"):c("status.attention.zoneFaultMany",{count:t.count}):"":""}function si(t){if(!fe(h.enabled(t)))return"OFF";let e=String(M(h.state(t))||"").toUpperCase()||"OFF",a=String(M(h.motorLastFault(t))||"").toUpperCase();return e==="FAULT"||a&&a!=="NONE"&&a!=="OK"?"FAULT":e}function ii(t){return t==="OFF"?"is-off":t==="FAULT"?"is-fault":t==="OVERHEATED"?"is-overheated":t==="HEATING"||t==="CALLING"?"is-heating":t==="IDLE"?"is-idle":"is-online"}function li(t){return t==="HEATING"||t==="CALLING"?c("state.heating"):t==="IDLE"?c("state.idle"):t==="FAULT"?c("common.fault"):t==="MANUAL"?c("state.manual"):t==="OVERHEATED"?c("state.overheated"):t==="CALIBRATING"?c("state.calibrating"):c("state.off")}function vr(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}function di(t){let e=$e(t);return e?`${je(t)} ${e}`:je(t)}O({tag:"hv6-header",render:ni,onMount(t,e){let a=e.querySelector("#v6-view-kicker"),o=e.querySelector("#v6-view-title"),r=e.querySelector("#v6-view-subtitle"),n=e.querySelector("#hdr-update"),s=e.querySelector("#hdr-attention"),d=e.querySelector(".v6-toolbar-icon");d&&d.addEventListener("click",()=>{let f=document.querySelector(".shell");if(!f)return;let x=f.classList.toggle("nav-collapsed");d.setAttribute("aria-pressed",String(x))});function p(){let f=P("firmwareUpdateAvailable");n.hidden=!f,f&&(n.textContent=c("status.updateAvailable",{version:f.latest}),n.title=c("settings.firmware.badgeTitle"))}function u(){let f=io(),x=P("section")||"overview",w=!!(f&&f.section!==x);s.hidden=!w,w?(s.textContent=hr(f),s.title=hr(f),s.dataset.kind=f.kind):delete s.dataset.kind}function v(){let f=P("selectedZone")||1,x=$e(f);return x?`${je(f)} \xB7 ${x}`:Ce(f)}n.addEventListener("click",()=>{wa("device"),qe("settings");let f=document.querySelector(".settings-firmware-card");f&&f.scrollIntoView({behavior:"smooth",block:"center"})}),s.addEventListener("click",()=>{xr(io())});function l(){let f=P("section")||"overview",x=P("settingsPanel")||"touch",w=f==="settings"?fr[x]||fr.touch:br[f]||br.overview;a&&(a.textContent=w[0]),f==="zones"?(o.textContent=v(),r.textContent="Applied target, sensor coverage and local safety."):(o.textContent=w[1],r.textContent=w[2]),u()}U("section",l),U("settingsPanel",l),U("selectedZone",l),U("zoneNames",l),U("live",u),U("firmwareUpdateAvailable",p),C(i.authorityProposalPending,u);for(let f=1;f<=6;f++)C(h.state(f),u),C(h.motorLastFault(f),u);R(e),l(),p(),u()}});O({tag:"hv6-sidebar",render:ri,onMount(t,e){let a=e,o=e.querySelector(".v6-more-toggle"),r=e.querySelector('[data-section="settings"][data-panel="touch"]'),n=e.querySelector(".v6-tab-zones"),s=e.querySelector('[data-section="diagnostics"]'),d=e.querySelector("[data-zone-nav]"),p=0,u=Date.now(),v=!1;function l(g,m,b,y){if(!g)return;let z=g.querySelector("[data-nav-dot]");z&&(z.hidden=!m,m?(g.setAttribute("aria-label",`${b}, ${y}`),g.title=y):(g.removeAttribute("aria-label"),g.removeAttribute("title")))}function f(){let g=ya(),m=so(),b=m===1?c("status.attention.zoneFaultOne"):c("status.attention.zoneFaultMany",{count:m});if(l(r,g,c("nav.settings"),c("status.attention.approveTouch")),l(n,m>0,c("nav.zones"),b),l(s,m>0,c("nav.diagnostics"),b),o){let y=o.querySelector("[data-nav-dot]");y&&(y.hidden=!g,y.classList.toggle("is-warn",!1)),g?(o.setAttribute("aria-label",c("status.attention.moreHasSettings")),o.title=c("status.attention.approveTouch")):(o.removeAttribute("aria-label"),o.removeAttribute("title"))}}function x(){if(!d)return;let g=P("selectedZone")||1,m=P("section")==="zones";d.innerHTML=Array.from({length:6},(b,y)=>{let z=y+1,N=m&&g===z,X=di(z),$=si(z),te=li($),oe=`${X}: ${te}`,le=vr(X),q=vr(oe),B=ii($),K=$==="FAULT"?"!":"",we=fe(h.enabled(z)),ne=we?c("common.enabled"):c("common.disabled"),Be=De({on:we,title:ne,label:`${X}: ${ne}`,attrs:`data-toggle-zone="${z}"`});return`<div class="v6-nav-row"><button type="button" class="v6-side-link${N?" active":""}" data-section="zones" data-select-zone="${z}" ${N?'aria-current="page"':""} title="${q}" aria-label="${q}"><span class="dot ${B}" aria-hidden="true">${K}</span><span class="menu-label">${le}</span></button>${Be}</div>`}).join("")}function w(){if(!v){Ia(e,{uptime:"---"});return}let g=Math.max(0,Math.floor((Date.now()-u)/1e3));Ia(e,{uptime:Ot(p+g)})}function L(){let g=!!P("live");Ia(e,{live:g,label:g?c("status.live"):c("status.offline"),ip:M(i.ip)||"---"});let m=A(i.uptime);if(m!=null&&!isNaN(m)&&m>=0){let b=m|0;(!v||b!==p)&&(p=b,u=Date.now(),v=!0)}w()}function E(){let g=P("section"),m=P("settingsPanel")||"touch";if(e.querySelectorAll("[data-section]").forEach(b=>{if(b.hasAttribute("data-select-zone"))return;let y=b.dataset.section===g&&g!=="zones";y&&b.dataset.panel&&(y=b.dataset.panel===m),y&&!b.dataset.panel&&g==="settings"&&(y=!1),b.classList.toggle("active",y),b.setAttribute("aria-current",y?"page":"false")}),n){let b=g==="zones";n.classList.toggle("active",b),n.setAttribute("aria-current",b?"page":"false")}x(),f(),L()}e.addEventListener("click",g=>{let m=g.target.closest("[data-toggle-zone]");if(m&&e.contains(m)){g.preventDefault(),g.stopPropagation();let N=Number(m.dataset.toggleZone);N>=1&&N<=6&&Pn(N,!fe(h.enabled(N)));return}let b=g.target.closest("[data-select-zone]");if(b){g.preventDefault(),_t(Number(b.dataset.selectZone)),qe("zones"),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"));return}let y=g.target.closest("[data-section]");if(!y||!e.contains(y)||y.classList.contains("v6-more-toggle"))return;g.preventDefault();let z=y.dataset.section;y.dataset.panel&&wa(y.dataset.panel),z==="settings"&&ya()&&(!y.dataset.panel||y.dataset.panel==="touch")?xr({kind:"touch",section:"settings",focus:"touch"}):qe(z),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"))}),o&&o.addEventListener("click",()=>{let g=a.classList.toggle("more-open");o.setAttribute("aria-expanded",String(g))}),U("section",E),U("settingsPanel",E),U("selectedZone",E),U("zoneNames",E),U("live",E),C(i.ip,L),C(i.uptime,L);let _=setInterval(w,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(_),{once:!0}),C(i.authorityProposalPending,f);for(let g=1;g<=6;g++)C(h.state(g),E),C(h.enabled(g),E),C(h.motorLastFault(g),E),C(h.temp(g),()=>{});R(e),E()}});var ci=`
.connectivity-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
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
`;D("connectivity-card",ci);var pi=()=>`
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
`,Cc=O({tag:"connectivity-card",render:pi,onMount(t,e){let a=e.querySelector(".cc-ip"),o=e.querySelector(".cc-ssid"),r=e.querySelector(".cc-mac"),n=e.querySelector(".cc-up"),s=e.querySelector(".cc-ver"),d=0,p=Date.now(),u=!1;function v(){if(!u){n.textContent="---";return}let x=Math.max(0,Math.floor((Date.now()-p)/1e3)),w=Ot(d+x);n.textContent!==w&&(n.textContent=w)}function l(){a.textContent=M(i.ip)||"---",o.textContent=M(i.ssid)||"---",r.textContent=M(i.mac)||"---",s.textContent=M(i.firmware)||"---";let x=A(i.uptime);if(x!=null&&!isNaN(x)&&x>=0){let w=x|0;(!u||w!==d)&&(d=w,p=Date.now(),u=!0)}v()}C(i.ip,l),C(i.ssid,l),C(i.mac,l),C(i.firmware,l),C(i.uptime,l);let f=setInterval(v,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(f),{once:!0}),R(e),l()}});var ui="http://www.w3.org/2000/svg",mi=`
.chart-card {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chart-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
}
.chart-head::before {
  display: none;
}
.chart-title {
  color: var(--text-muted);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .08em;
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
.chart-grid { stroke: var(--separator); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-axis { stroke: var(--separator); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-tick { fill: var(--chart-axis); font-size: 11px; opacity: .85; }
.chart-axis-label {
  fill: var(--chart-axis); font-size: 9px; letter-spacing: .8px;
  text-transform: uppercase; opacity: .75;
}
/* Time labels use tabular UI digits. */
.chart-hour {
  fill: var(--text-muted);
  font-family: var(--font-ui);
  font-size: 9px;
  font-weight: 500;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  letter-spacing: 0;
}
.chart-hour.now { fill: var(--series-solar); }
.chart-hour.day2 { fill: var(--text-faint); }
.chart-empty { fill: var(--text-faint); font-size: 12px; letter-spacing: .3px; }

/* hover cursor + tooltip */
.chart-cursor-line { stroke: var(--text-faint); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
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
`;D("chart-kit",mi);function ie(t,e,a){let o=document.createElementNS(ui,t);if(e)for(let r in e)o.setAttribute(r,e[r]);return a!=null&&(o.textContent=a),o}function qt(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(o=>`${o.x.toFixed(2)} ${o.y.toFixed(2)}`).join(" L ");let e=.16,a=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let o=0;o<t.length-1;o++){let r=t[o-1]||t[o],n=t[o],s=t[o+1],d=t[o+2]||s,p=n.x+(s.x-r.x)*e,u=n.y+(s.y-r.y)*e,v=s.x-(d.x-n.x)*e,l=s.y-(d.y-n.y)*e;a+=` C ${p.toFixed(2)} ${u.toFixed(2)}, ${v.toFixed(2)} ${l.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return a}function Oa(t,e,a){let o=t.filter(d=>Number.isFinite(d));if(!o.length)return{min:e,max:a};let r=Math.min(...o),n=Math.max(...o);r===n&&(r-=1,n+=1);let s=(n-r)*.12;return{min:r-s,max:n+s}}function Bt(t,e,a){let o=document.createElement("div");o.className="chart-tooltip",e.appendChild(o);let r=ie("g",{class:"chart-cursor",style:"display:none"}),n=ie("line",{class:"chart-cursor-line",y1:a.plotTop,y2:a.plotBottom});r.appendChild(n);let s=[];t.appendChild(r);function d(l){let f=0,x=1/0;for(let w=0;w<a.count;w++){let L=Math.abs(l-a.xAt(w));L<x&&(x=L,f=w)}return f}function p(l){let f=t.getScreenCTM();if(!f)return null;let x=t.createSVGPoint();return x.x=l.clientX,x.y=l.clientY,x.matrixTransform(f.inverse())}function u(l){if(!a.count)return;let f=p(l);if(!f)return;let x=d(f.x),w=a.xAt(x);n.setAttribute("x1",w),n.setAttribute("x2",w);let L=a.dots(x);for(;s.length<L.length;){let m=ie("circle",{class:"chart-cursor-dot",r:3.4});r.appendChild(m),s.push(m)}s.forEach((m,b)=>{b<L.length?(m.setAttribute("cx",w),m.setAttribute("cy",L[b].y),m.setAttribute("fill",L[b].color),m.style.display=""):m.style.display="none"}),r.style.display="";let E=a.rows(x).map(m=>`<div class="tt-row"><span class="tt-swatch" style="background:${m.color}"></span>${m.label}<span class="tt-val">${m.value}</span></div>`).join("");o.innerHTML=`<div class="tt-time">${a.label(x)}</div>${E}`,o.classList.add("show");let _=e.getBoundingClientRect(),g=l.clientX-_.left+14;g+o.offsetWidth>_.width-6&&(g=l.clientX-_.left-o.offsetWidth-14),o.style.left=Math.max(6,g)+"px",o.style.top=Math.max(6,l.clientY-_.top+12)+"px"}function v(){o.classList.remove("show"),r.style.display="none"}return t.addEventListener("pointermove",u),t.addEventListener("pointerleave",v),()=>{t.removeEventListener("pointermove",u),t.removeEventListener("pointerleave",v),o.remove()}}var ea=1e3,Po=180,Ye=14,gi=42,bi=44,ht=42,ja=ea-ht-gi,ft=Po-Ye-bi,At=Ye+ft,Do=24*3600,yr=Ee+2,wr=Ee+3,qa=Ee+4,fi="var(--series-warm)",hi="var(--series-cool)",kr="var(--series-solar)",vi=`
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.graph-widgets .gw-controls {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 10px;
}
.graph-widgets .gw-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  border-radius: 0;
  padding: 0 2px;
  font-size: .72rem;
  font-weight: 650;
  letter-spacing: .02em;
  cursor: pointer;
}
.graph-widgets .gw-toggle::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 0;
  background: currentColor;
  flex-shrink: 0;
}
.graph-widgets .gw-toggle:hover {
  color: var(--text-strong);
}
.graph-widgets .gw-toggle.is-off {
  opacity: .4;
}
.graph-widgets .gw-toggle[data-layer="flow"] { color: var(--series-warm); }
.graph-widgets .gw-toggle[data-layer="return"] { color: var(--series-cool); }
.graph-widgets .gw-toggle[data-layer="demand"] { color: var(--series-solar); }
`;D("graph-widgets",vi);var _r=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',zr=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',xi=t=>t.variant==="flow-return"?`<div class="graph-widgets">${_r()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${zr()}</div>`:`<div class="graph-widgets">${_r()}${zr()}</div>`;function Sr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function yi(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function ta(t,e,a){let o=[];for(let r=0;r<t.length;r++){let n=t[r];if(!n||n[0]<a)continue;let s=n[e];s==null||!Number.isFinite(s)||o.push({t:n[0],v:s})}return o}var Va=(t,e)=>ht+Math.max(0,Math.min(1,(t-e)/Do))*ja;function wi(t,e,a){let o=Number(Date.now()/1e3)|0,r=3600,n=Math.ceil((o-Do)/r)*r,s=Math.floor(o/r)*r,d=Math.floor(o/r)*r;for(let u=n;u<=s;u+=r){let v=a-(o-u),l=Va(v,e),f=new Date(u*1e3),x=u===d,w=At+16;t.appendChild(ie("text",{x:l,y:w,"text-anchor":"end",transform:`rotate(-45 ${l.toFixed(1)} ${w})`,class:"chart-hour"+(x?" now":"")},String(f.getHours()).padStart(2,"0")))}let p=Va(a,e);t.appendChild(ie("line",{x1:p,y1:Ye,x2:p,y2:At,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function ki(t){let e=[];if(t.forEach(n=>n.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let a=Math.min(...e),o=Math.max(...e);a===o&&(a-=.5,o+=.5);let r=(o-a)*.1;return a-=r,o+=r,{min:a,max:o}}function _i(t,e,a){let o=t.filter(r=>r.unit==="C").map(r=>ta(e,r.index,a));return ki(o)}function Cr(t,e,a,o,r,n){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${ea} ${Po}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=a.map(_=>ta(o,_.index,r)),d=a.filter(_=>_.unit==="C"),p=d.some(_=>ta(o,_.index,r).length>0);if(!s.some(_=>_.length)||d.length&&!p&&!a.some(_=>_.unit==="%"&&ta(o,_.index,r).some(g=>g.v>0))){let _=d.length&&!p?c("overview.graph.noData"):c("overview.graph.collecting");return t.appendChild(ie("text",{x:ea/2,y:Po/2,"text-anchor":"middle",class:"chart-empty"},_)),null}let v=_i(a,o,r),l=Math.max(.001,v.max-v.min),f=_=>Ye+(1-(_-v.min)/l)*ft,x=_=>Ye+(1-Math.max(0,Math.min(100,_))/100)*ft,w=(_,g)=>_.unit==="%"?x(g):f(g);for(let _=0;_<3;_++){let g=_/2,m=Ye+g*ft;t.appendChild(ie("line",{x1:ht,y1:m,x2:ht+ja,y2:m,class:"chart-grid"})),a.some(b=>b.unit==="C")&&t.appendChild(ie("text",{x:ht-6,y:m+4,"text-anchor":"end",class:"chart-tick"},Sr(v.max-l*g,"C")+"\xB0")),a.some(b=>b.unit==="%")&&t.appendChild(ie("text",{x:ht+ja+6,y:m+4,"text-anchor":"start",class:"chart-tick"},Sr(100-100*g,"%")))}t.appendChild(ie("line",{x1:ht,y1:At,x2:ht+ja,y2:At,class:"chart-axis"})),a.some(_=>_.unit==="C")&&t.appendChild(ie("text",{x:9,y:Ye+ft/2,transform:`rotate(-90 9 ${(Ye+ft/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},c("overview.graph.axis.temp"))),a.some(_=>_.unit==="%")&&t.appendChild(ie("text",{x:ea-9,y:Ye+ft/2,transform:`rotate(90 ${ea-9} ${(Ye+ft/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},c("overview.graph.axis.demand"))),wi(t,r,n),a.forEach((_,g)=>{let m=s[g].map(y=>({x:Va(y.t,r),y:w(_,y.v)}));if(!m.length)return;let b=qt(m);_.fill&&t.appendChild(ie("path",{d:b+` L ${m[m.length-1].x.toFixed(1)} ${At} L ${m[0].x.toFixed(1)} ${At} Z`,fill:_.fill,stroke:"none"})),t.appendChild(ie("path",{d:b,fill:"none",stroke:_.color,"stroke-width":String(_.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let L=[];for(let _=0;_<o.length;_++){let g=o[_];if(!g||g[0]<r)continue;let m=a.map(b=>g[b.index]);m.every(b=>b==null||!Number.isFinite(b))||L.push({t:g[0],vals:m})}if(!L.length)return null;let E=Date.now();return Bt(t,e,{count:L.length,plotTop:Ye,plotBottom:At,xAt:_=>Va(L[_].t,r),label:_=>new Date(E-(n-L[_].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:_=>a.map((g,m)=>({y:w(g,L[_].vals[m]),color:g.color})).filter((g,m)=>Number.isFinite(L[_].vals[m])),rows:_=>a.map((g,m)=>({color:g.color,label:g.label,value:yi(L[_].vals[m],g.unit)})).filter((g,m)=>Number.isFinite(L[_].vals[m]))})}function Ba(t,e,a){let o=ta(t,e,a);return o.length?o[o.length-1].v:null}var Pc=O({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:xi,onMount(t,e){let a=e.querySelector(".gw-dt"),o=e.querySelector(".gw-demand-text"),r=e.querySelector(".gw-flow"),n=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),d={flow:!0,return:!0,demand:!0},p=null,u=null;function v(){s.forEach(x=>{let w=x.dataset.layer;x.classList.toggle("is-off",!d[w]),x.setAttribute("aria-pressed",d[w]?"true":"false")})}function l(){let x=[];return d.flow&&x.push({index:yr,color:fi,label:c("overview.graph.layers.flow"),unit:"C",width:2.4}),d.return&&x.push({index:wr,color:hi,label:c("overview.graph.layers.return"),unit:"C",width:2}),d.demand&&x.push({index:qa,color:kr,label:c("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),x}function f(){let x=P("zoneStateHistory"),w=x&&Array.isArray(x.entries)?x.entries:[],L=x&&x.uptime_s||Number(Date.now()/1e3)|0,E=L-Do;if(r){p&&p();let _=Ba(w,yr,E),g=Ba(w,wr,E),m=Ba(w,qa,E),b=[];_!=null&&g!=null&&b.push("\u0394 "+(_-g).toFixed(1)+"\xB0"),m!=null&&b.push(Math.round(m)+"%"),a.textContent=b.length?b.join(" \xB7 "):"\u2014",p=Cr(r,r.closest(".chart-card"),l(),w,E,L)}if(n){u&&u();let _=Ba(w,qa,E);o.textContent=_!=null?Math.round(_)+"%":"\u2014",u=Cr(n,n.closest(".chart-card"),[{index:qa,color:kr,label:c("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],w,E,L)}}s.forEach(x=>{x.addEventListener("click",()=>{let w=x.dataset.layer;d[w]=!d[w],!d.flow&&!d.return&&!d.demand&&(d[w]=!0),v(),f()})}),U("zoneStateHistory",f),R(e),v(),f()}});var vt={0:{labelKey:"state.off",color:"var(--disabled)"},1:{labelKey:"state.manual",color:"var(--info)"},2:{labelKey:"state.calibrating",color:"var(--warn)"},3:{labelKey:"state.waitCal",color:"var(--text-faint)"},4:{labelKey:"state.waitTemp",color:"var(--text-faint)"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"var(--forest)"},7:{labelKey:"state.overheated",color:"var(--danger)"},255:{labelKey:"",color:"transparent"}},aa=24*3600,zi=aa,oa=28,Ho=8,Et=72,Za=48,jt=8,Wa=16,Ar=10,Er="var(--series-solar)",Tr="var(--accent)",$o=14,Lr=Ee+1,Fr=jt+Ee*(oa+Ho)-Ho,Io=Fr+Ar,Ua=Fr+Ar+Wa+Za,Si=`
.timeline-card {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.timeline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.timeline-head::before { display:none; }
.timeline-head span {
  color: var(--text-faint);
  font-size: .72rem;
  font-weight: 750;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.timeline-head strong {
  margin-left: auto;
  color: var(--text-muted);
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.timeline-svg {
  width: 100%;
  display: block;
  border-radius: 0;
  overflow: visible;
  min-height: 280px;
}

.timeline-empty {
  color: var(--text-muted);
  font-size: .9rem;
  padding: 24px 0;
  text-align: left;
  letter-spacing: 0;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 14px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .8rem;
  color: var(--text-muted);
  letter-spacing: 0;
}

.tl-legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tl-legend-dot.expected {
  width: 16px;
  height: 5px;
  opacity: .55;
  border-radius: 999px;
}
`;D("zone-state-timeline",Si);var Ci=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Li(t,e){if(!t||!t.entries||t.entries.length===0)return null;let a=t.entries,o=t.uptime_s||e||0,r=Number(Date.now()/1e3)|0,n=1e3,s=n-Et;function d(m){let b=(m+aa)/zi;return Et+Math.max(0,Math.min(1,b))*s}function p(m){return m-o}let u="http://www.w3.org/2000/svg",v=document.createElementNS(u,"svg");v.setAttribute("viewBox","0 0 "+n+" "+Ua),v.classList.add("timeline-svg");let l=document.createElementNS(u,"rect");l.setAttribute("x",Et),l.setAttribute("y",jt),l.setAttribute("width",s),l.setAttribute("height",Ua-jt-Za),l.setAttribute("fill","transparent"),l.setAttribute("rx","0"),v.appendChild(l);let f=d(0),x=[-24,-18,-12,-6,0].map(m=>m*3600);for(let m of x){let b=d(m),y=document.createElementNS(u,"line");y.setAttribute("x1",b),y.setAttribute("y1",jt),y.setAttribute("x2",b),y.setAttribute("y2",Ua-Za),y.setAttribute("stroke",m===0?"var(--series-solar)":"var(--separator)"),y.setAttribute("stroke-width","1"),m===0&&(y.setAttribute("stroke-dasharray","3 4"),y.setAttribute("opacity",".7"),y.setAttribute("vector-effect","non-scaling-stroke")),v.appendChild(y)}v.appendChild(Mi(u,"text",{x:f+6,y:jt+14,"text-anchor":"start",fill:"var(--accent)","font-size":"12","font-family":"var(--font-ui)","font-weight":"650"},"now"));for(let m=0;m<Ee;m++){let b=jt+m*(oa+Ho),y=document.createElementNS(u,"rect");y.setAttribute("x",Et),y.setAttribute("y",b),y.setAttribute("width",s),y.setAttribute("height",oa),y.setAttribute("fill",m%2===0?"var(--inset)":"transparent"),v.appendChild(y);let z=document.createElementNS(u,"text");z.setAttribute("x",Et-8),z.setAttribute("y",b+oa/2+1),z.setAttribute("text-anchor","end"),z.setAttribute("dominant-baseline","middle"),z.setAttribute("fill","var(--text-muted)"),z.setAttribute("font-size","13"),z.setAttribute("font-family","var(--font-ui)"),z.setAttribute("font-weight","650"),z.textContent="Z"+(m+1),v.appendChild(z);let N=a.map($=>({rel:p($[0]),state:$[m+1]})).filter($=>$.rel>=-aa&&$.rel<=0),X=($,te,oe)=>{if(oe===255)return;let le=vt[oe]||vt[255];if(le.color==="transparent")return;let q=d($),B=d(te),K=Math.max(1,B-q),we=document.createElementNS(u,"rect");we.setAttribute("x",q),we.setAttribute("y",b+(oa-$o)/2),we.setAttribute("width",K),we.setAttribute("height",$o),we.setAttribute("fill",le.color),we.setAttribute("rx",String($o/2)),we.setAttribute("opacity","0.9"),v.appendChild(we)};if(N.length){let $=N[0].rel,te=N[0].state;for(let oe=1;oe<N.length;oe++){let le=N[oe];le.state!==te&&(X($,le.rel,te),$=le.rel,te=le.state)}X($,0,te)}}{let m=document.createElementNS(u,"rect");m.setAttribute("x",Et),m.setAttribute("y",Io),m.setAttribute("width",s),m.setAttribute("height",Wa),m.setAttribute("fill","color-mix(in srgb, var(--series-solar) 12%, transparent)"),m.setAttribute("rx","2"),v.appendChild(m);let b=document.createElementNS(u,"text");b.setAttribute("x",Et-8),b.setAttribute("y",Io+Wa/2+1),b.setAttribute("text-anchor","end"),b.setAttribute("dominant-baseline","middle"),b.setAttribute("fill","var(--text-muted)"),b.setAttribute("font-size","12"),b.setAttribute("font-family","var(--font-ui)"),b.setAttribute("font-weight","650"),b.textContent=c("overview.timeline.absorb"),v.appendChild(b);let y=a.map(z=>({rel:p(z[0]),on:z.length>Lr?Number(z[Lr]||0):0})).filter(z=>z.rel>=-aa&&z.rel<=0);if(y.length){let z=($,te,oe)=>{if(!oe)return;let le=d($),q=Math.max(1,d(te)-le),B=document.createElementNS(u,"rect");B.setAttribute("x",le),B.setAttribute("y",Io),B.setAttribute("width",q),B.setAttribute("height",Wa),B.setAttribute("fill",oe===2?Tr:Er),B.setAttribute("rx","2"),B.setAttribute("opacity",oe===2?"0.95":"0.85"),v.appendChild(B)},N=y[0].rel,X=y[0].on;for(let $=1;$<y.length;$++)y[$].on!==X&&(z(N,y[$].rel,X),N=y[$].rel,X=y[$].on);z(N,0,X)}}let w=Ua-Za+22,L=3600,E=Math.ceil((r-aa)/L)*L,_=Math.floor(r/L)*L,g=Math.floor(r/L)*L;for(let m=E;m<=_;m+=L){let y=new Date(m*1e3).getHours(),z=m===g;if(!z&&y%2!==0)continue;let N=m-r,X=d(N),$=document.createElementNS(u,"text");$.setAttribute("x",X),$.setAttribute("y",w),$.setAttribute("text-anchor","middle"),$.setAttribute("fill",z?"var(--accent)":"var(--text-muted)"),$.setAttribute("font-size","12"),$.setAttribute("font-family","var(--font-ui)"),$.setAttribute("font-weight",z?"700":"600"),$.setAttribute("font-variant-numeric","tabular-nums lining-nums"),$.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),$.textContent=String(y).padStart(2,"0"),v.appendChild($)}return v}function Mi(t,e,a,o){let r=document.createElementNS(t,e);for(let n in a)r.setAttribute(n,a[n]);return o!=null&&(r.textContent=o),r}function Mr(t){t.innerHTML="";let e=[{code:5,...vt[5]},{code:6,...vt[6]},{code:0,...vt[0]},{code:1,...vt[1]},{code:7,...vt[7]},{code:2,...vt[2]}];for(let r of e){let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?c(r.labelKey):""),t.appendChild(n)}let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+Er+'"></span>'+c("overview.timeline.absorbReactive"),t.appendChild(a);let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Tr+'"></span>'+c("overview.timeline.absorbArmed"),t.appendChild(o)}var Bc=O({tag:"zone-state-timeline",render:Ci,onMount(t,e){let a=e.querySelector(".tl-body"),o=e.querySelector(".timeline-legend");Mr(o);function r(){let n=P("zoneStateHistory"),s=(()=>{let p=P&&P("zoneStateHistory");return p&&p.uptime_s||Number(Date.now()/1e3)|0})();if(a.innerHTML="",!n||!n.entries||n.entries.length===0){let p=document.createElement("div");p.className="timeline-empty",p.textContent=c("overview.timeline.noHistory"),a.appendChild(p);return}let d=Li(n,s);d&&a.appendChild(d)}U("zoneStateHistory",r),U("zoneNames",r),C(i.drivers,r);for(let n=1;n<=Ee;n++)C(h.enabled(n),r),C(h.state(n),r),C(h.temp(n),r),C(h.setpoint(n),r),C(h.preheatAdvance(n),r);R(e),r()}});var Ai=`
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
`;D("zone-grid",Ai);var Ei=()=>'<div class="zone-grid" aria-label="Zones"></div>',Zc=O({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Ei,onMount(t,e){for(let a=1;a<=6;a++)e.appendChild(ce("zone-card",{zone:a,selection:t.selection,navigate:t.navigate}))}});var Ti=`
.zone-card {
  width:100%; min-width:0; min-height:72px; margin:0; padding:12px 16px; border:0; border-radius:0;
  display:grid; grid-template-columns:minmax(170px,1.4fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(100px,.7fr) 28px;
  align-items:center; gap:16px; background:transparent; color:var(--text-main); font:inherit; text-align:left; cursor:pointer;
}
.zone-card + .zone-card{border-top:1px solid var(--separator)}
.zone-card:hover{background:rgba(255,255,255,.025)}
.zone-card:active{background:rgba(var(--accent-rgb),.08)}
.zone-card.active{background:var(--fill-forest)}
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
.zone-card.zs-overheated .zc-dot{background:var(--state-warn)}.zone-card.zs-overheated .zc-state-label{color:var(--state-warn)}
.zone-card.zs-fault .zc-dot{background:var(--state-danger)}.zone-card.zs-fault .zc-state-label{color:var(--state-danger)}
.zone-card::after{content:'\u203A';grid-column:5;grid-row:1;color:var(--text-muted);font-size:1.35rem;text-align:right}
`;D("zone-card",Ti);var Fi=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${Ce(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${nt(t.zone)}</div>
		<div class="zc-friendly"${$e(t.zone)?" hidden":""}>${$e(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,ep=O({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Fi,onMount(t,e){let a=t.zone,o=h.temp(a),r=h.state(a),n=h.enabled(a),s=e.querySelector(".zc-state-label"),d=e.querySelector(".zc-zone-name"),p=e.querySelector(".zc-friendly"),u=e.querySelector(".zc-temp"),v=e.querySelector(".zc-target"),l=e.querySelector(".zc-valve-value");function f(){var z;let w=fe(n),L=String(M(r)||"").toUpperCase()||"OFF",E=String(M(h.motorLastFault(a))||"").toUpperCase(),_=E&&E!=="NONE"&&E!=="OK",g=w&&(L==="FAULT"||_)?"FAULT":L,m=t.selection&&P("selectedZone")===a,b=$e(a);d.innerHTML=nt(a),p.textContent=b?"":"---",p.hidden=!!b,e.setAttribute("aria-label",Ce(a)),u.textContent=Ht(A(o)),v.textContent=c("zone.card.setpoint",{value:Ht((z=A(h.effectiveSetpoint(a)))!=null?z:A(h.setpoint(a)))}),l.textContent=$a(A(h.valve(a)));let y=w?g:"OFF";s.textContent=y==="HEATING"?c("state.heating"):y==="IDLE"?c("state.idle"):y==="FAULT"?c("common.fault"):y==="MANUAL"?c("state.manual"):y==="OVERHEATED"?c("state.overheated"):y==="CALIBRATING"?c("state.calibrating"):c("state.off"),e.title=_?c("zone.card.fault",{fault:E}):"",e.classList.toggle("active",m),m?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${d.textContent}, ${u.textContent}, ${v.textContent}, ${s.textContent}. Open details.`),e.classList.toggle("disabled",!w),e.classList.toggle("zs-heating",w&&(y==="HEATING"||y==="CALLING")),e.classList.toggle("zs-overheated",w&&y==="OVERHEATED"),e.classList.toggle("zs-fault",w&&y==="FAULT"),e.classList.toggle("zs-idle",w&&y==="IDLE"),e.classList.toggle("zs-off",!w||y==="OFF")}function x(){_t(a),t.navigate&&qe("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:a}}))}e.addEventListener("click",x),C(o,f),C(h.setpoint(a),f),C(h.effectiveSetpoint(a),f),C(h.valve(a),f),C(r,f),C(n,f),C(h.motorLastFault(a),f),U("selectedZone",f),U("zoneNames",f),f()}});var ae={cx:200,cy:175,haloR:72,cutR:72,discR:56,stroke:6.5,pipeXs:[138,162.8,187.6,212.4,237.2,262],pipeFrom:175,pipeTo:278,lockupScale:.8,lockupCutR:58,lockupDiscR:50,luneSize:24,luneTracking:2.8,luneY:183,v6Size:40,v6Tracking:.4,v6Y:188,viewBoxPortrait:"110 90 180 210",viewBoxLandscape:"118 100 202 150",viewBoxLockup:"142 118 154 114",lockupWidth:80,lockupHeight:59,manifoldWidth:108,manifoldHeight:80,thermal:{supply:"#FCD34D",heat:"#F59E0B",ret:"#10B981",heatStop:28},pipe:{calling:"#F59E0B",idle:"#10B981",unused:"rgba(232,214,188,.20)"},metallic:{top:"#1c1915",bottom:"#0c0b09",rim:"#25221E",word:"#FAF6EF"}},Ni=0;function Ri(t){let{cx:e,cy:a}=ae,o=[`translate(${e} ${a})`,"rotate(-90)"];return t&&t!==1&&o.push(`scale(${t})`),o.push(`translate(${-e} ${-a})`),o.join(" ")}function Pi(t,e=!1){let a=ae.thermal,o=ae.metallic,r=e?`x1="${ae.cx}" y1="${ae.cy+ae.haloR}" x2="${ae.cx}" y2="${ae.cy-ae.haloR}"`:'x1="120" y1="175" x2="280" y2="175"';return`<defs>
    <filter id="${t}-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="${t}-thermal" gradientUnits="userSpaceOnUse" ${r}>
      <stop offset="0%" stop-color="${a.supply}"/>
      <stop offset="${a.heatStop}%" stop-color="${a.heat}"/>
      <stop offset="100%" stop-color="${a.ret}"/>
    </linearGradient>
    <linearGradient id="${t}-metallic" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${o.top}"/>
      <stop offset="100%" stop-color="${o.bottom}"/>
    </linearGradient>
  </defs>`}function na({states:t=[],selected:e=-1,sku:a="",landscape:o=!1,lockup:r=!1,prefix:n=""}={}){let s=n||`lm${++Ni}`,d=r?ae.lockupScale:null,p=r?ae.lockupCutR:ae.cutR,u=r?ae.lockupDiscR:ae.discR,v=o||r?` transform="${Ri(d)}"`:"",l=r?ae.viewBoxLockup:o?ae.viewBoxLandscape:ae.viewBoxPortrait,f=ae.pipeXs.map((w,L)=>`<line class="pipe is-${t[L]||"idle"}${L===e?" is-focus":""}" x1="${w}" y1="${ae.pipeFrom}" x2="${w}" y2="${ae.pipeTo}"/>`).join(""),x="";if(a){let w=a.toUpperCase()==="V6",L=w?ae.v6Size:ae.luneSize,E=w?ae.v6Tracking:ae.luneTracking,_=w?ae.v6Y:ae.luneY;x=`<text class="sku" x="${ae.cx}" y="${_}" text-anchor="middle" fill="${ae.metallic.word}" font-size="${L}" font-weight="700" letter-spacing="${E}" font-family="system-ui,-apple-system,sans-serif">${a}</text>`}return`<svg class="lune-mark${o||r?" is-landscape":""}" viewBox="${l}" fill="none" aria-hidden="true">
    ${Pi(s,o||r)}
    <g class="pipes"${v} stroke="url(#${s}-thermal)" stroke-width="${ae.stroke}" stroke-linecap="round" fill="none">${f}</g>
    <circle class="disc-cut" cx="${ae.cx}" cy="${ae.cy}" r="${p}"></circle>
    <path class="halo-arc"${v} d="M${ae.cx-ae.haloR} ${ae.cy}A${ae.haloR} ${ae.haloR} 0 0 1 ${ae.cx+ae.haloR} ${ae.cy}" fill="none" stroke="url(#${s}-thermal)" stroke-width="${ae.stroke}" stroke-linecap="round" filter="url(#${s}-glow)"></path>
    <circle class="disc" cx="${ae.cx}" cy="${ae.cy}" r="${u}"></circle>
    ${x}
  </svg>`}function Nr(){return na({sku:"LUNE",lockup:!0,prefix:"lt-lockup"})}var Rr=`
.lds-manifold,
.manifold {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) minmax(150px, 210px);
  gap: 12px 18px;
  align-items: center;
  margin: 0;
  padding: 16px 0;
  border-bottom: 1px solid var(--separator);
}
.lds-manifold.is-offline,
.manifold.is-offline {
  opacity: .72;
}
.lds-manifold-mark,
.manifold-mark {
  display: grid;
  place-items: center;
  width: 110px;
  height: 84px;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  overflow: visible;
}
.lds-manifold-mark .lune-mark,
.manifold-mark .lune-mark {
  width: var(--brand-manifold-w, 108px);
  height: var(--brand-manifold-h, 80px);
}
.lds-loops,
.loops {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}
.lds-loop,
.loop {
  display: grid;
  gap: 4px;
  min-width: 0;
  min-height: 0;
  padding: 8px 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: center;
  align-items: center;
  justify-items: center;
  cursor: pointer;
  font: inherit;
}
.lds-loop:hover,
.loop:hover {
  background: var(--inset);
}
.lds-loop.is-selected,
.loop.is-selected {
  background: var(--fill-forest);
}
.lds-loop.is-calling .lds-loop-id,
.lds-loop.is-calling .loop-id,
.loop.is-calling .lds-loop-id,
.loop.is-calling .loop-id {
  color: var(--accent);
}
.lds-loop.is-unused,
.loop.is-unused {
  opacity: .4;
}
.lds-loop-id,
.loop-id {
  color: var(--text-faint);
  font-size: .68rem;
  font-weight: 750;
  letter-spacing: .06em;
}
.lds-loop-name,
.loop-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--text-muted, var(--muted));
  font-size: .7rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lds-loop-demand,
.loop-demand {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
}
.lds-loop-demand-bar,
.loop-demand-bar {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  width: 10px;
  height: 40px;
  flex: 0 0 10px;
}
.lds-loop-demand-bar i,
.loop-demand-bar i {
  flex: 1 1 0;
  min-height: 5px;
  border-radius: 1px;
  background: color-mix(in srgb, var(--text-faint) 28%, transparent);
}
.lds-loop-demand-bar[data-level="1"] i:nth-child(-n+1),
.lds-loop-demand-bar[data-level="2"] i:nth-child(-n+2),
.lds-loop-demand-bar[data-level="3"] i:nth-child(-n+3),
.lds-loop-demand-bar[data-level="4"] i:nth-child(-n+4),
.lds-loop-demand-bar[data-level="5"] i:nth-child(-n+5),
.loop-demand-bar[data-level="1"] i:nth-child(-n+1),
.loop-demand-bar[data-level="2"] i:nth-child(-n+2),
.loop-demand-bar[data-level="3"] i:nth-child(-n+3),
.loop-demand-bar[data-level="4"] i:nth-child(-n+4),
.loop-demand-bar[data-level="5"] i:nth-child(-n+5) {
  background: var(--accent);
  box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 45%, transparent);
}
.lds-loop.is-unused .lds-loop-demand-bar i,
.lds-loop.is-unused .loop-demand-bar i,
.loop.is-unused .lds-loop-demand-bar i,
.loop.is-unused .loop-demand-bar i {
  background: color-mix(in srgb, var(--text-faint) 16%, transparent);
  box-shadow: none;
}
.lds-loop-temp,
.loop-temp {
  padding: 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--text-strong);
}
.lds-manifold-meta,
.manifold-meta {
  display: grid;
  gap: 4px;
  text-align: right;
}
.lds-manifold-meta strong,
.manifold-meta strong {
  color: var(--text-strong);
  font-size: .88rem;
}
.lds-manifold-meta small,
.manifold-meta small {
  color: var(--text-muted, var(--muted));
  font-size: .72rem;
}
.lds-manifold.is-offline .lds-manifold-meta small.status,
.manifold.is-offline .manifold-meta small.status {
  color: var(--danger);
}
@media (max-width: 900px) {
  .lds-manifold,
  .manifold {
    grid-template-columns: 1fr;
  }
  .lds-manifold-mark,
  .manifold-mark {
    margin: 0 auto;
  }
  .lds-loops,
  .loops {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .lds-manifold-meta,
  .manifold-meta {
    text-align: left;
  }
}
`;function Vt(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pr(t,e="idle"){if(e==="unused")return 0;let a=Number(t);return!Number.isFinite(a)||a<=0?0:Math.min(5,Math.max(1,Math.ceil(a/20)))}function Di(t=0){return`<span class="lds-loop-demand-bar loop-demand-bar" data-level="${Math.min(5,Math.max(0,Number(t)||0))}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`}function Dr({id:t,name:e="\u2014",temp:a="\u2014",level:o=0,kind:r="idle",selected:n=!1,attrs:s="",tag:d="button",showDemand:p=!0,className:u=""}={}){let v=["lds-loop","loop",n?"is-selected":"",r==="calling"?"is-calling":"",r==="unused"?"is-unused":"",u].filter(Boolean).join(" "),l=d==="button"?' type="button"':"",f=p?`<span class="lds-loop-demand loop-demand">${Di(o)}<span class="lds-loop-temp loop-temp">${Vt(a)}</span></span>`:`<span class="lds-loop-temp loop-temp">${Vt(a)}</span>`;return`<${d} class="${v}"${l} ${s}><span class="lds-loop-id loop-id">${Vt(t)}</span><span class="lds-loop-name loop-name">${Vt(e)}</span>${f}</${d}>`}function $r({title:t="",lines:e=[],offline:a=!1}={}){let o=(e||[]).map((r,n)=>`<small${a&&n===e.length-1||n===e.length-1?' class="status"':""}>${Vt(r)}</small>`).join("");return`<strong>${Vt(t)}</strong>${o}`}function xt(t){if(!fe(h.enabled(t)))return"unused";let e=String(M(h.state(t))||"").toUpperCase(),a=Number(A(h.valve(t)));return e==="HEATING"||e==="CALLING"||Number.isFinite(a)&&a>20||e==="FAULT"||e==="OVERHEATED"?"calling":"idle"}function Ir(){return[1,2,3,4,5,6].map(xt)}function $i(){return Ir().filter(t=>t==="calling").length}function Ii(){let t=$i();return t?`${t}/6 heat call`:"Idle"}function Ut(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Hr(t,{states:e,selected:a=-1,sku:o="V6",landscape:r=!0,prefix:n}={}){if(!t)return;let s=n||t.getAttribute("data-live-mark")||"mark";t.innerHTML=na({states:e||Ir(),selected:a,sku:r?o:"",landscape:r,prefix:s})}function Or(){let t=Ut(A(i.flow)),e=Ut(A(i.ret)),a=Number(A(i.flow)),o=Number(A(i.ret)),r=Number.isFinite(a)&&Number.isFinite(o)?`${(a-o).toFixed(1)}\xB0`:"\u2014";return $r({title:"Lune V6",lines:[`Flow ${t} \xB7 Ret ${e}`,`\u0394T ${r} \xB7 ${Ii()}`]})}function Hi(t,e,a={}){if(!t||t.length<2)return"";let o=a.w||360,r=a.h||128,n=[a.ref].filter(x=>x!=null&&!Number.isNaN(Number(x))),s=Math.min(...t,...n),d=Math.max(...t,...n),p=4,u=d-s||1,v=x=>r-(x-s)/u*(r-p*2)-p,l=t.map((x,w)=>`${w/(t.length-1)*o},${v(x)}`).join(" "),f=n.length?`<line class="ref" x1="0" y1="${v(n[0])}" x2="${o}" y2="${v(n[0])}" />`:"";return`<svg class="${a.className||"spark spark-lg"}" viewBox="0 0 ${o} ${r}" preserveAspectRatio="none" aria-hidden="true">${f}<polyline fill="none" stroke="${e}" stroke-width="${a.stroke||1.8}" points="${l}"/></svg>`}function Oi(t){var v;let e=Number(A(h.temp(t))),a=Number((v=A(h.effectiveSetpoint(t)))!=null?v:A(h.setpoint(t))),o=Number.isFinite(e)?e:a;if(!Number.isFinite(o)||!Number.isFinite(a))return[];let r=xt(t)==="calling",n=t*17,s=o-.4,d=o+.4,p=o-.35-n%6*.07,u=[];for(let l=0;l<24;l+=1){let f=Math.max(0,Math.sin((l-6)/12*Math.PI))*.22,x=l<7||l>21?-.12:0,w=r||p<a-.2?.16:.05;p+=(a-p)*w+f+x+Math.sin((l+n)*.55)*.05,p=Math.min(d+.15,Math.max(s-.15,p)),u.push(+p.toFixed(2))}return u[23]=+Number(o).toFixed(2),u}function qr(t){var u;let e=Oi(t);if(!e.length)return"";let a=xt(t)==="calling"?"var(--accent)":"var(--forest)",o=e[0],r=e[e.length-1],n=Math.min(...e),s=Math.max(...e),d=r-o,p=Number((u=A(h.effectiveSetpoint(t)))!=null?u:A(h.setpoint(t)));return`${Hi(e,a,{className:"spark spark-lg",w:360,h:128,stroke:1.8,ref:p})}
    <div class="trend-meta">
      <span>24h</span>
      <span>${n.toFixed(1)}\u2013${s.toFixed(1)}\xB0</span>
      <span>${d>.05?"+":""}${d.toFixed(1)}\xB0</span>
    </div>`}var qi=`
.zone-detail{height:auto;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none;overflow:visible}
.zone-detail .zd-head{display:none}
.zone-detail .zd-badge.badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}.zone-detail .zd-badge.badge-idle{background:transparent;color:var(--text-muted)}.zone-detail .zd-badge.badge-fault{background:color-mix(in srgb,var(--danger) 12%,transparent);color:var(--state-danger)}
.zone-detail .zd-dial-slot{margin:0}
.zone-detail .zd-chart-kicker{margin:22px 0 0;color:var(--text-muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.zone-detail .zd-chart-note{max-width:62ch;margin:6px 0 8px;color:var(--text-muted);font-size:.82rem;line-height:1.5}
.zone-detail .zd-chart .spark{width:100%;height:128px;margin-top:10px;display:block}
.zone-detail .zd-chart .spark .ref{stroke:color-mix(in srgb,var(--text-muted) 62%,transparent);stroke-width:1;stroke-dasharray:4 3}
.zone-detail .trend-meta{display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:var(--text-faint);font-size:.68rem;font-weight:650;letter-spacing:.04em;text-transform:uppercase}
.zone-detail .facts{display:flex;flex-wrap:wrap;gap:16px 28px;margin:18px 0 0;padding:0}
.zone-detail .facts>div{min-width:0}
.zone-detail .facts dt{color:var(--text-muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.zone-detail .facts dd{margin:4px 0 0;font-family:var(--font-display);font-size:1.15rem;font-weight:650;font-variant-numeric:tabular-nums}
`;D("zone-detail",qi);var Bi=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    ${To({remaining:"",hint:c("zone.override.hint")})}
    <div class="zd-head">
      <div class="zd-title" data-i18n="zone.detail.title">Control</div>
      <span class="zd-badge">---</span>
    </div>
    <div class="zd-dial-slot"></div>
    <div class="zd-slider-slot"></div>
    <p class="zd-chart-kicker" data-i18n="zone.chart.kicker">Temperature \xB7 last 24h</p>
    <p class="zd-chart-note" data-i18n="zone.chart.note">Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.</p>
    <div class="zd-chart"></div>
    <dl class="facts">
      <div><dt data-i18n="zone.detail.setpoint">Setpoint</dt><dd class="zd-setpoint">\u2014</dd></div>
      <div><dt data-i18n="zone.detail.currentTemp">Current</dt><dd class="zd-temp">\u2014</dd></div>
      <div><dt data-i18n="zone.demand">Demand</dt><dd class="zd-demand">\u2014</dd></div>
    </dl>
  </div>
`,Bo=5,jo=35,Br=.5;function ji(t){let e=Number(A(h.setpoint(t)));return Number.isFinite(e)?e:null}function Vo(t){let e=Number(A(h.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function jr(t){let e=Number(A(h.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let a=ji(t);return a==null?null:Number((a+Vo(t)).toFixed(1))}function Oo(t){return Math.min(jo,Math.max(Bo,Number(Number(t).toFixed(1))))}function qo(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Vi(t,e){if(!e)return c("common.disabled");let a=String(t||"IDLE").toUpperCase();return a==="HEATING"?c("state.heating"):a==="IDLE"?c("state.idle"):a==="OFF"?c("state.off"):a==="FAULT"?c("common.fault"):a==="MANUAL"?c("state.manual"):a==="OVERHEATED"?c("state.overheated"):a==="CALIBRATING"?c("state.calibrating"):a}function Ui(t,e){return e?xt(t)==="calling"?c("state.heating"):c("state.idle"):c("state.off")}var xp=O({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Bi,methods:{update(t,e){let a=P("selectedZone"),o=String(M(h.state(a))||"").toUpperCase(),r=fe(h.enabled(a)),n=jr(a),s=A(h.temp(a));this.zone=a,t.dataset.zone=String(a),e.dial&&Ao(e.dial,{target:n,current:s,disabled:!r,states:["idle","idle","idle","idle","idle","idle"],selected:-1});let d=Number(A(h.coordinatorRemaining(a))),p=A(h.coordinatorOffset(a)),u=Number.isFinite(d)&&d>0||Number.isFinite(p)&&Math.abs(p)>.05,v=p==null?"\u2014":(p>0?"+":"")+Number(p).toFixed(1)+"\xB0";Fo(t,{remaining:u?c("zone.override.remaining",{offset:v,remaining:Ot(Math.max(0,d||0))}):"",hint:c("zone.override.hint")});let l=qo(n);if(e.setpoint.textContent=l,e.temp.textContent=qo(s),e.demand.textContent=Ui(a,r),e.slider&&(Number.isFinite(n)&&(e.slider.value=String(n)),e.slider.disabled=!r,Ra(e.slider)),e.sliderValue&&(e.sliderValue.textContent=l),e.chart&&(e.chart.innerHTML=qr(a)),e.badge){let f=e.badge;f.textContent=Vi(o,r);let x=r?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";f.className="zd-badge"+(x?" "+x:"")}},stepSetpoint(t){let e=this.zone,a=jr(e),o=Oo((a==null?20:a)+t);ho(e,Oo(o-Vo(e)))},setApplied(t){let e=this.zone;ho(e,Oo(t-Vo(e)))}},onMount(t,e){let a=e.querySelector(".zd-dial-slot");a.innerHTML=Mo({id:"zone-detail-dial",markHtml:na({states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:"zone-detail-halo"}),target:20,current:null,min:Bo,max:jo,step:Br,unit:"C",label:"Zone setpoint"});let o=e.querySelector(".zd-slider-slot");o.innerHTML=No({min:Bo,max:jo,step:Br,value:21,label:"Comfort setpoint"});let r={dial:a.querySelector(".lds-dial"),temp:e.querySelector(".zd-temp"),setpoint:e.querySelector(".zd-setpoint"),demand:e.querySelector(".zd-demand"),badge:e.querySelector(".zd-badge"),slider:e.querySelector("[data-comfort-slider]"),sliderValue:e.querySelector("[data-slider-value]"),chart:e.querySelector(".zd-chart")};Eo(r.dial,{onStep:d=>t.stepSetpoint(d)}),r.slider.addEventListener("input",()=>{let d=parseFloat(r.slider.value);Number.isFinite(d)&&(Ra(r.slider),r.sliderValue.textContent=qo(d),t.setApplied(d))});let n=()=>t.update(e,r),s=d=>{let p=P("selectedZone");(/(?:text_sensor-zone_\d+_state|switch-zone_\d+_enabled|sensor-zone_\d+_valve_pct)$/.test(d)||d===h.temp(p)||d===h.setpoint(p)||d===h.baseSetpoint(p)||d===h.effectiveSetpoint(p)||d===h.coordinatorOffset(p)||d===h.coordinatorRemaining(p))&&n()};for(let d=1;d<=6;d++)C(h.temp(d),s),C(h.setpoint(d),s),C(h.baseSetpoint(d),s),C(h.effectiveSetpoint(d),s),C(h.coordinatorOffset(d),s),C(h.coordinatorRemaining(d),s),C(h.valve(d),s),C(h.state(d),s),C(h.enabled(d),s);C("sensor-manifold_return_temperature",n),U("selectedZone",n),R(e),n()}});var Zi=`
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ui-row {
  display: grid;
  gap: 6px;
  align-items: stretch;
  min-height: 0;
  padding: 0;
  border: 0;
}
.zone-sensor-card .ui-label { color: var(--text-muted); font-size: .72rem; font-weight: 650; }
.zone-sensor-card .ui-field { width: 100%; display: block; }
.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input,
.zone-sensor-card .ext-input,
.zone-sensor-card .ui-select {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 8px;
  height: var(--control-compact, 32px);
  min-height: var(--control-compact, 32px);
  padding: 0 9px;
  font-size: .82rem;
  line-height: 1.2;
}
.zone-sensor-card .ext-input { font-family: inherit; margin-top: 8px; width: 100%; }
.zone-sensor-card .ble-row .ble-input:focus,
.zone-sensor-card .ext-input:focus,
.zone-sensor-card .ui-select:focus {
  outline: 1px solid rgba(var(--accent-rgb), .45);
  border-color: rgba(var(--accent-rgb), .45);
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  box-sizing: border-box;
  height: var(--control-compact, 32px);
  min-height: var(--control-compact, 32px);
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: .78rem;
  font-weight: 650;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-scan:disabled { opacity: .5; cursor: default; }
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
.zone-sensor-card .ble-scan-item .ble-meta { color: var(--text-secondary); font-size: .75rem; }
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
.zone-sensor-card .btn-assign:hover { background: rgba(var(--accent-rgb),.10); }
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
.zone-sensor-card .ext-age {
  margin-top: 8px;
  font-size: .78rem;
  color: var(--text-muted);
}
`;D("zone-sensor-card",Zi);var Wi=()=>`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.tempSource">Room temperature source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-row">
          <span class="ui-label" data-i18n="zone.sensor.bleSensor">BLE sensor</span>
          <span class="ui-field">
            <div class="ble-row">
              <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
              <button class="btn-scan zs-scan" data-i18n="zone.sensor.scan">Scan</button>
            </div>
          </span>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="zs-row-ext" style="display:none">
        <div class="ui-row">
          <span class="ui-label" data-i18n="zone.sensor.sensorId">Sensor id</span>
          <span class="ui-field"><input class="ext-input zs-sid" maxlength="47" placeholder="AA:BB:CC:DD:EE:FF or entity id" data-i18n-placeholder="zone.sensor.sensorIdPh"></span>
        </div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="zone.sensor.sensorName">Sensor name</span>
          <span class="ui-field"><input class="ext-input zs-sname" maxlength="23" placeholder="Friendly name (optional)" data-i18n-placeholder="zone.sensor.sensorNamePh"></span>
        </div>
        <div class="ext-age zs-age"></div>
      </div>
    </div>
  `;function Ki(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":t==="External"||t==="EXTERNAL"?"External":"Local Probe"}function Gi(t){return t==="BLE Sensor"?"BLE":t==="External"?"External":"Local Probe"}function Vr(t,e){let a='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+c("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+c("zone.sensor.bleSource")+'</option><option value="External" data-i18n="zone.sensor.externalSource">'+c("zone.sensor.externalSource")+"</option>";t.innerHTML!==a&&(t.innerHTML=a),t.value=e}var Mp=O({tag:"zone-sensor-card",render:Wi,onMount(t,e){let a=e.querySelector(".zs-source"),o=e.querySelector(".zs-ble"),r=e.querySelector(".zs-row-ble"),n=e.querySelector(".zs-row-ext"),s=e.querySelector(".zs-sid"),d=e.querySelector(".zs-sname"),p=e.querySelector(".zs-age"),u=e.querySelector(".zs-scan"),v=e.querySelector(".zs-scan-list"),l=0;function f(){return P("selectedZone")}function x(){let g=a.value;r.style.display=g==="BLE Sensor"?"":"none",n.style.display=g==="External"?"":"none"}let w=Me(e,{immediate:!0});Vr(a,"Local Probe"),w.select(a,{read:()=>Ki(String(M(h.tempSource(f()))||"")),commit:g=>rt(f(),"zone_temp_source",Gi(g))}),w.text(o,{read:()=>M(h.ble(f()))||"",commit:g=>$t(f(),"zone_ble_mac",g)}),w.text(s,{read:()=>M(h.sensorId(f()))||"",commit:g=>$t(f(),"zone_sensor_id",g)}),w.text(d,{read:()=>M(h.sensorName(f()))||"",commit:g=>$t(f(),"zone_sensor_name",g)}),a.addEventListener("change",x);function L(){let g=f(),m=Number(A(h.externalAge(g)));if(!Number.isFinite(m)||m<0){p.textContent=c("zone.sensor.noIngestYet");return}let b=Math.round(m/1e3);p.textContent=c("zone.sensor.lastIngestAge",{sec:b})}function E(){let g=f();l!==g?(l=g,v.style.display="none",w.discard()):w.refresh(),x(),L()}u.addEventListener("click",()=>{u.disabled=!0,u.textContent=c("zone.sensor.scanning"),v.style.display="",v.innerHTML='<div class="scan-msg">'+c("zone.sensor.scanning")+"</div>";let g=new AbortController,m=setTimeout(()=>g.abort(),8e3);fetch("/api/v1/ble-scan",{signal:g.signal}).then(b=>b.json()).then(b=>{clearTimeout(m),u.disabled=!1,u.textContent=c("zone.sensor.scan");let y=b&&b.data&&b.data.sensors||b.sensors||[];if(!y.length){v.innerHTML='<div class="scan-msg">'+c("zone.sensor.noSensors")+"</div>";return}let z=(M(h.ble(f()))||"").toUpperCase();v.innerHTML=y.map(N=>{let X=String(N.mac||"").toUpperCase(),$="";X===z?$='<span class="ble-badge">'+c("zone.sensor.assignedThisZone")+"</span>":N.zone>0&&($='<span class="ble-badge">'+c("zone.sensor.zoneBadge",{zone:N.zone})+"</span>");let te=Number.isFinite(Number(N.temp_c))?Number(N.temp_c).toFixed(1)+"\xB0C":"\u2014",oe=N.name?String(N.name):"";return`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${X}</div>
                <div class="ble-meta">${oe?oe+" \xB7 ":""}${te} \xB7 ${N.rssi||"?"} dBm ${$}</div>
              </div>
              <button class="btn-assign" data-mac="${X}">${c("zone.sensor.assign")}</button>
            </div>`}).join(""),v.querySelectorAll(".btn-assign").forEach(N=>{N.addEventListener("click",()=>{let X=N.getAttribute("data-mac")||"",$=f();o.value=X,a.value="BLE Sensor",x(),$t($,"zone_ble_mac",X),rt($,"zone_temp_source","BLE"),w.refresh()})})}).catch(b=>{clearTimeout(m),u.disabled=!1,u.textContent=c("zone.sensor.scan");let y=b&&b.name==="AbortError"?c("zone.sensor.scanTimeout"):c("zone.sensor.scanFailed");v.innerHTML='<div class="scan-msg">'+y+"</div>"})});function _(g){let m=f();([h.tempSource(m),h.ble(m),h.sensorId(m),h.sensorName(m),h.externalAge(m)].indexOf(g)>=0||/^select-zone_\d+_temp_source$/.test(g)||/^text-zone_\d+_(ble_mac|sensor_id|sensor_name)$/.test(g)||/^sensor-zone_\d+_external_temp_age_ms$/.test(g))&&(w.refresh(),x(),L())}E(),U("selectedZone",E);for(let g=1;g<=6;g++)C(h.tempSource(g),_),C(h.ble(g),_),C(h.sensorId(g),_),C(h.sensorName(g),_),C(h.externalAge(g),_);}});var Xi=".zone-coordination-card { height: 100%; }";D("zone-coordination-card",Xi);var Yi=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.sensor.mergeWith">Merge with zone</span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function Ur(t,e){let a=t.value,o='<option value="None" data-i18n="common.none">'+c("common.none")+"</option>";for(let r=1;r<=6;r++)r!==e&&(o+='<option value="Zone '+r+'">'+c("common.zone")+" "+r+"</option>");t.innerHTML=o,t.value=a||"None"}var $p=O({tag:"zone-coordination-card",render:Yi,onMount(t,e){let a=e.querySelector(".zc-sync"),o=0;function r(){return P("selectedZone")}let n=Me(e,{immediate:!0});n.select(a,{read:()=>M(h.syncTo(r()))||"None",commit:p=>rt(r(),"zone_sync_to",p)});function s(){let p=r();o!==p?(Ur(a,p),o=p,n.discard()):n.refresh()}function d(p){let u=r();(p===h.syncTo(u)||/^select-zone_\d+_sync_to$/.test(p))&&n.refresh()}U("selectedZone",s);for(let p=1;p<=6;p++)C(h.syncTo(p),d);R(e),s()}});var Ji=".zone-room-card { height: auto; }";D("zone-room-card",Ji);var Qi=15,el=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Zone friendly name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="${Qi}" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,Zp=O({tag:"zone-room-card",render:el,onMount(t,e){let a=e.querySelector(".zr-friendly");function o(){return P("selectedZone")}let r=Me(e,{immediate:!0});r.text(a,{read:()=>co(o())||"",commit:s=>Hn(o(),s)});function n(s){let d=o();(s===h.name(d)||/^text-zone_\d+_name$/.test(s))&&r.refresh()}U("selectedZone",()=>{r.discard()}),U("zoneNames",r.refresh);for(let s=1;s<=6;s++)C(h.name(s),n);R(e),r.refresh()}});var tl=`
.zone-actuator-disclosure { height: auto; }
.zone-actuator-disclosure .za-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 0;
  padding: 4px 0 8px;
}
.zone-actuator-disclosure .za-stat {
  min-width: 0;
  padding: 0 12px;
  border-left: 1px solid var(--separator);
}
.zone-actuator-disclosure .za-stat:first-child { padding-left: 0; border-left: 0; }
.zone-actuator-disclosure .za-stat-label {
  color: var(--text-faint);
  font-size: .7rem;
  font-weight: 600;
}
.zone-actuator-disclosure .za-stat-value {
  margin-top: 4px;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.zone-actuator-disclosure .za-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 0 4px;
  padding: 9px 10px;
  border-left: 3px solid var(--state-danger);
  background: rgba(239, 68, 68, .06);
  font-size: .76rem;
}
.zone-actuator-disclosure .za-fault[hidden] { display: none; }
.zone-actuator-disclosure .za-fault-label { color: var(--text-muted); }
.zone-actuator-disclosure .za-fault-val { color: var(--state-danger); font-weight: 650; }
.zone-actuator-disclosure .za-actions {
  border-top: 1px solid var(--separator);
  margin-top: 4px;
}
.zone-actuator-disclosure .za-action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: var(--control-height, 44px);
  padding: 8px 0;
  border-bottom: 1px solid var(--separator);
}
.zone-actuator-disclosure .za-action:last-child { border-bottom: 0; }
.zone-actuator-disclosure .za-copy strong {
  display: block;
  color: var(--text-strong);
  font-size: .88rem;
  font-weight: 600;
}
.zone-actuator-disclosure .za-copy span {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: .76rem;
}
.zone-actuator-disclosure .za-status {
  margin-top: 10px;
  font-size: .78rem;
  font-weight: 600;
  min-height: 1.1em;
  opacity: 0;
  transition: opacity .15s ease;
}
.zone-actuator-disclosure .za-status.show { opacity: 1; }
.zone-actuator-disclosure .za-status.ok { color: var(--state-ok); }
.zone-actuator-disclosure .za-status.err { color: var(--state-danger); }
.zone-actuator-disclosure .za-btn {
  min-width: 150px;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: .875rem;
  line-height: 1.2;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
}
.zone-actuator-disclosure .za-btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--accent-border-hover);
  color: var(--accent-text-soft);
}
.zone-actuator-disclosure .za-btn.warn {
  background: var(--danger-bg);
  border-color: var(--danger-border-soft);
  color: var(--danger-text);
}
.zone-actuator-disclosure .za-btn.warn:hover {
  background: linear-gradient(135deg, var(--danger-bg-strong), var(--danger-bg-soft));
  border-color: var(--danger-border);
}
@media (max-width: 620px) {
  .zone-actuator-disclosure .za-action { grid-template-columns: 1fr; }
  .zone-actuator-disclosure .za-btn { width: 100%; }
  .zone-actuator-disclosure .za-stats { grid-template-columns: 1fr 1fr; gap: 16px 0; }
  .zone-actuator-disclosure .za-stat:nth-child(odd) { padding-left: 0; border-left: 0; }
}
`;D("zone-actuator-card",tl);function Zr(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function Wr(t){return t!=null?Number(t).toFixed(0):"---"}function al(t){return t!=null?Number(t).toFixed(2)+"C":"---"}var ol=()=>`
  <details class="disclosure zone-actuator-disclosure">
    <summary data-i18n="zone.actuator.title">Actuator</summary>
    <div class="disclosure-body">
      <div class="ui-section" data-i18n="zone.actuator.calibration">Calibration and preheat</div>
      <div class="za-stats">
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.openRipples">Open Ripples</div><div class="za-stat-value za-orip">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.closeRipples">Close Ripples</div><div class="za-stat-value za-crip">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.openFactor">Open Factor</div><div class="za-stat-value za-ofac">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.closeFactor">Close Factor</div><div class="za-stat-value za-cfac">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.detail.preheatAdv">Preheat Adv.</div><div class="za-stat-value za-ph">---</div></div>
      </div>
      <div class="za-fault" hidden><span class="za-fault-label" data-i18n="zone.detail.lastFault">Last fault</span><span class="za-fault-val">NONE</span></div>
      <div class="ui-section" data-i18n="zone.actuator.recovery">Service and recovery</div>
      <div class="za-actions">
        <div class="za-action">
          <div class="za-copy">
            <strong data-i18n="diagnostics.recovery.clearFaultTitle">Clear current fault</strong>
            <span data-i18n="diagnostics.recovery.clearFaultHelp">Acknowledge the current motor fault without changing learned values.</span>
          </div>
          <button type="button" class="za-btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Clear fault</button>
        </div>
        <div class="za-action">
          <div class="za-copy">
            <strong data-i18n="diagnostics.recovery.resetFactorsTitle">Reset learned factors</strong>
            <span data-i18n="diagnostics.recovery.resetFactorsHelp">Remove calibration values while leaving the valve stopped.</span>
          </div>
          <button type="button" class="za-btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset factors\u2026</button>
        </div>
        <div class="za-action">
          <div class="za-copy">
            <strong data-i18n="diagnostics.recovery.relearnTitle">Reset and relearn</strong>
            <span data-i18n="diagnostics.recovery.relearnHelp">Reset calibration and start a complete motor learning cycle.</span>
          </div>
          <button type="button" class="za-btn warn recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset and relearn\u2026</button>
        </div>
      </div>
      <div class="za-status" role="status"></div>
    </div>
  </details>
`,eu=O({tag:"zone-actuator-card",render:ol,onMount(t,e){var p,u,v;let a=Number(P("selectedZone")||1),o={orip:e.querySelector(".za-orip"),crip:e.querySelector(".za-crip"),ofac:e.querySelector(".za-ofac"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function r(){a=Number(P("selectedZone")||1),o.orip.textContent=Wr(A(h.motorOpenRipples(a))),o.crip.textContent=Wr(A(h.motorCloseRipples(a))),o.ofac.textContent=Zr(A(h.motorOpenFactor(a))),o.cfac.textContent=Zr(A(h.motorCloseFactor(a))),o.ph.textContent=al(A(h.preheatAdvance(a)));let l=String(M(h.motorLastFault(a))||"").toUpperCase(),f=l&&l!=="NONE"&&l!=="OK";o.fault.hidden=!f,f&&(o.faultVal.textContent=l)}let n=null;function s(l,f){o.status.textContent=l,o.status.className="za-status show "+(f?"ok":"err"),clearTimeout(n),n=setTimeout(()=>{o.status.classList.remove("show")},4e3)}function d(l,f){let x=l(a);s(f,!0),x&&typeof x.then=="function"&&x.then(w=>{w&&w.ok===!1&&s(c("diagnostics.recovery.rejected"),!1)}).catch(()=>s(c("diagnostics.recovery.unreachable"),!1))}(p=o.faultBtn)==null||p.addEventListener("click",()=>{d(jn,"\u2713 "+c("diagnostics.recovery.faultSent",{zone:Ce(a)}))}),(u=o.factorsBtn)==null||u.addEventListener("click",()=>{confirm(c("diagnostics.recovery.confirmFactors",{zone:Ce(a)}))&&d(Ta,"\u2713 "+c("diagnostics.recovery.factorsReset",{zone:Ce(a)}))}),(v=o.relearnBtn)==null||v.addEventListener("click",()=>{confirm(c("diagnostics.recovery.confirmRelearn",{zone:Ce(a)}))&&d(Vn,"\u2713 "+c("diagnostics.recovery.relearnStarted",{zone:Ce(a)}))}),U("selectedZone",r);for(let l=1;l<=6;l++)C(h.motorOpenRipples(l),r),C(h.motorCloseRipples(l),r),C(h.motorOpenFactor(l),r),C(h.motorCloseFactor(l),r),C(h.preheatAdvance(l),r),C(h.motorLastFault(l),r);R(e),r()}});var nl={1:{label:"E",color:"var(--danger)"},2:{label:"W",color:"var(--warn)"},3:{label:"I",color:"var(--ok)"},4:{label:"C",color:"var(--info)"},5:{label:"D",color:"var(--text-muted)"},6:{label:"V",color:"var(--text-faint)"},7:{label:"VV",color:"var(--text-faint)"}},rl=`
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  
}

.logs-view .actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.logs-view .btn {
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  min-height: var(--control-height, 44px);
  padding: 0 12px;
  font-size: .72rem;
  font-weight: 700;
  cursor: pointer;
}
.logs-view .btn:hover { color: var(--text-strong); background: var(--control-bg-hover); }
.logs-view .btn.on { color: var(--text-on-accent); border-color: var(--accent); background: var(--accent); }

.logs-stream {
  height: 420px;
  overflow-y: auto;
  border-radius: 8px;
  background: rgba(0,0,0,.14);
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
`;D("logs-view",rl);var sl=()=>`
  <div class="logs-view">
    <div class="logs-stream"></div>
    <div class="actions">
      <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
      <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      <button class="btn bottom-btn" type="button" data-i18n="logs.scrollBottom">Scroll to bottom</button>
    </div>
  </div>
`;function il(t){let e=nl[t.level]||{label:"?",color:"var(--text-secondary)"},a=Kr(t.tag||""),o=Kr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+a+'</span><span class="msg">'+o+"</span></div>"}function Kr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var iu=O({tag:"logs-view",render:sl,onMount(t,e){let a=e.querySelector(".logs-stream"),o=e.querySelector(".pause-btn"),r=e.querySelector(".clear-btn"),n=e.querySelector(".download-btn"),s=e.querySelector(".bottom-btn"),d=!1;function p(){a.scrollTop=a.scrollHeight}function u(){if(d)return;let v=Sa();if(!v||!v.length){a.innerHTML='<div class="logs-empty">'+c("logs.waiting")+"</div>";return}let l=a.scrollHeight-a.scrollTop-a.clientHeight<40;a.innerHTML=v.map(il).join(""),l&&p()}o.addEventListener("click",()=>{d=!d,o.textContent=d?c("logs.resume"):c("logs.pause"),o.classList.toggle("on",d),d||u()}),r.addEventListener("click",()=>{xn()}),n.addEventListener("click",()=>{n.disabled=!0,er().catch(v=>{console.error("[Logs] download failed:",v),window.alert(c("logs.downloadFailed"))}).finally(()=>{n.disabled=!1})}),s.addEventListener("click",()=>{p()}),U("deviceLog",u),R(e),u()}});var ll=`
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
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
.diag-i2c .btn { height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border-radius:8px;border:1px solid var(--control-border);background:var(--control-bg);color:var(--text-strong);font-weight:650;line-height:1.2;cursor:pointer; }
.diag-i2c .btn:hover { background:var(--control-bg-hover);border-color:var(--control-border-hover); }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;D("diag-i2c",ll);var dl=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,gu=O({tag:"diag-i2c",render:dl,onMount(t,e){let a=e.querySelector("#i2c-result");function o(){a.textContent=P("i2cResult")||c("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Dn()}),U("i2cResult",o),R(e),o()}});var cl=`
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
`;D("diag-manual-badge",cl);var pl=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,yu=O({tag:"diag-manual-badge",render:pl,onMount(t,e){let a=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function o(){let r=!!P("manualMode");a&&a.classList.toggle("on",r)}U("manualMode",o),R(e),o()}});var ul=`
.diag-zone-motor {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
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
`;D("diag-zone-motor",ul);var ml=t=>{let e=t.zone||P("selectedZone")||1,a="";for(let o=1;o<=6;o++)a+='<option value="'+o+'"'+(o===e?" selected":"")+">"+c("common.zone")+" "+o+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title" data-i18n="diagnostics.motor.title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note" data-i18n="diagnostics.motor.manualNote">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" data-i18n-label="diagnostics.motor.manualNote" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl" data-i18n="diagnostics.motor.motor">Motor</span>
          <select class="sel motor-zone-select">${a}</select>
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
  `},Mu=O({tag:"diag-zone-motor-card",render:ml,onMount(t,e){let a=Number(t.zone||P("selectedZone")||1),o=!!P("manualMode"),r=e.querySelector(".manual-mode-toggle"),n=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),d=e.querySelector(".motor-target-input"),p=e.querySelector(".motor-open-btn"),u=e.querySelector(".motor-close-btn"),v=e.querySelector(".motor-stop-btn"),l=()=>{let L=s.value||String(a),E="";for(let _=1;_<=6;_++)E+='<option value="'+_+'">'+c("common.zone")+" "+_+"</option>";s.innerHTML=E,s.value=L};function f(L){o=!!L,r&&(r.classList.toggle("on",o),r.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[s,d,p,u,v].forEach(E=>{E&&(E.disabled=!o)})}function x(){let L=!o;f(L);let E=()=>{};if(L){It(!0).catch(E);for(let _=1;_<=6;_++)xo(_).catch(E)}else It(!1).catch(E)}function w(){let L=A(h.motorTarget(a));d&&L!=null?d.value=Number(L).toFixed(0):d&&(d.value="0")}s==null||s.addEventListener("change",()=>{a=Number(s.value||1),w()}),r==null||r.addEventListener("click",x),r==null||r.addEventListener("keydown",L=>{L.key!==" "&&L.key!=="Enter"||(L.preventDefault(),x())});for(let L=1;L<=6;L++)C(h.motorTarget(L),w);w(),f(o),U("manualMode",()=>{f(!!P("manualMode"))}),R(e),d==null||d.addEventListener("change",L=>{if(!o)return;let E=L.target.value;On(a,E)}),p==null||p.addEventListener("click",()=>{o&&Aa(a,1e4)}),u==null||u.addEventListener("click",()=>{o&&Ea(a,1e4)}),v==null||v.addEventListener("click",()=>{o&&xo(a)})}});var Tt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function sa(t){switch(Number(t)){case Tt.CONTACT:return"contact";case Tt.UNDER_LOAD:return"load";case Tt.STOPPING:return"stopping";default:return"free"}}function Zo(t){let e=t||[];for(let a=0;a<e.length;a++){let o=Number(e[a].stroke_phase)||0;if(o===Tt.CONTACT||o===Tt.UNDER_LOAD)return e[a]}return null}function yt(t,e,a){if(e[a]==null)return null;let o=Number(t[e[a]]);return Number.isFinite(o)?o:null}function Wo(t){let e=String(t||"").split(/\r?\n/).filter(n=>n.trim());if(e.length<2)return[];let a=e[0].split(",").map(n=>n.trim()),o={};for(let n=0;n<a.length;n++)o[a[n]]=n;let r=[];for(let n=1;n<e.length;n++){let s=e[n].split(",");if(s.length<6)continue;let d=p=>Number(s[o[p]]);r.push({t_ms:d("t_ms")||0,motion_count:d("motion_count")||0,current_ma:d("current_ma"),adc_current_raw:yt(s,o,"adc_current_raw"),drive_on:d("drive_on")===1,direction_open:d("direction_open")===1,armed:d("armed")===1,stroke_phase:d("stroke_phase")||0,tacho_period_us:yt(s,o,"tacho_period_us"),tacho_amp_raw:yt(s,o,"tacho_amp_raw"),bemf_raw_a:yt(s,o,"bemf_raw_a"),bemf_raw_b:yt(s,o,"bemf_raw_b"),bemf_differential_raw:yt(s,o,"bemf_differential_raw"),bemf_separation_us:yt(s,o,"bemf_separation_us"),bemf_valid:o.bemf_valid!=null?d("bemf_valid")===1:null,bemf_moving:o.bemf_moving!=null?d("bemf_moving")===1:null,invalid_bemf_samples:yt(s,o,"invalid_bemf_samples")})}return r}function wt(t){let e=t.filter(a=>Number.isFinite(a));return e.length?e.reduce((a,o)=>a+o,0)/e.length:null}function ra(t){let e=0,a=0;for(let o of t)o===!0?e+=1:o===!1&&(a+=1);return!e&&!a?null:e>=a}function Ko(t,e=2){let a=(t||[]).filter(s=>s&&Number.isFinite(s.t_ms)).slice().sort((s,d)=>s.t_ms-d.t_ms);if(!a.length)return[];let o=Math.max(1,Math.round(1e3/Math.max(.1,e))),r=[],n=0;for(;n<a.length;){let s=Math.floor(a[n].t_ms/o)*o,d=s+o,p=n;for(;p<a.length&&a[p].t_ms<d;)p+=1;let u=a.slice(n,p),v=u[u.length-1];r.push({t_ms:s+Math.floor(o/2),motion_count:Math.max(...u.map(l=>Number(l.motion_count)||0)),current_ma:wt(u.map(l=>l.current_ma)),adc_current_raw:wt(u.map(l=>l.adc_current_raw)),drive_on:ra(u.map(l=>!!l.drive_on))===!0,direction_open:ra(u.map(l=>!!l.direction_open))===!0,armed:ra(u.map(l=>!!l.armed))===!0,stroke_phase:Math.max(...u.map(l=>Number(l.stroke_phase)||0)),tacho_period_us:wt(u.map(l=>l.tacho_period_us)),tacho_amp_raw:wt(u.map(l=>l.tacho_amp_raw)),bemf_raw_a:wt(u.map(l=>l.bemf_raw_a)),bemf_raw_b:wt(u.map(l=>l.bemf_raw_b)),bemf_differential_raw:wt(u.map(l=>l.bemf_differential_raw)),bemf_separation_us:wt(u.map(l=>l.bemf_separation_us)),bemf_valid:ra(u.map(l=>l.bemf_valid)),bemf_moving:ra(u.map(l=>l.bemf_moving)),invalid_bemf_samples:Math.max(...u.map(l=>Number(l.invalid_bemf_samples)||0),Number(v.invalid_bemf_samples)||0),_bucket_n:u.length}),n=p}return r}function Go(t,e,a=6e4,o=2){let r=new Map;for(let u of t||[])u&&Number.isFinite(u.t_ms)&&r.set(u.t_ms,u);for(let u of Ko(e||[],o))u&&Number.isFinite(u.t_ms)&&r.set(u.t_ms,u);let n=Array.from(r.values()).sort((u,v)=>u.t_ms-v.t_ms);if(!n.length||!(a>0))return n;let d=n[n.length-1].t_ms-a,p=0;for(;p<n.length&&n[p].t_ms<d;)p+=1;return p?n.slice(p):n}var gl="t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples";function Je(t){return t==null||t===""?"":typeof t=="boolean"?t?"1":"0":typeof t=="number"?Number.isFinite(t)?String(t):"":String(t)}function bl(t){let e=[gl];for(let a of t||[])e.push([Je(a.t_ms),Je(a.motion_count),Number.isFinite(a.current_ma)?a.current_ma.toFixed(1):"",Je(a.adc_current_raw),a.drive_on?"1":"0",a.direction_open?"1":"0",a.armed?"1":"0",Je(a.stroke_phase||0),Je(a.tacho_period_us),Je(a.tacho_amp_raw),Je(a.bemf_raw_a),Je(a.bemf_raw_b),Je(a.bemf_differential_raw),Je(a.bemf_separation_us),a.bemf_valid==null?"":a.bemf_valid?"1":"0",a.bemf_moving==null?"":a.bemf_moving?"1":"0",Je(a.invalid_bemf_samples)].join(","));return e.join(`
`)+`
`}function Gr(t,e){let a=new Blob([bl(t)],{type:"text/csv;charset=utf-8"}),o=URL.createObjectURL(a),r=document.createElement("a");r.href=o,r.download=e||"lune-v6-motor-trace.csv",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function fl(t){let e=0,a=0;for(let o=0;o<t.length;o++)t[o].drive_on&&(t[o].direction_open?e+=1:a+=1);return e>=a?"open":"close"}function hl(t,e){if(!t.length)return null;let a=t.slice().sort((r,n)=>r-n),o=Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*e)));return a[o]}function Ve(t){return Math.round(t*10)/10}function Uo(t,e,a){return Math.min(a,Math.max(e,t))}function vl(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function Xr(t){let e=[];if(!t.length)return e;let a=t[0].t_ms,o=t[t.length-1].t_ms;for(let r=a;r+500<=o;r+=500){let n=t.reduce((p,u)=>Math.abs(u.t_ms-r)<Math.abs(p.t_ms-r)?u:p,t[0]),s=t.reduce((p,u)=>Math.abs(u.t_ms-(r+500))<Math.abs(p.t_ms-(r+500))?u:p,t[0]),d=(s.t_ms-n.t_ms)/1e3;d>.2&&e.push({t_ms:r+500,slope:(s.current_ma-n.current_ma)/d})}return e}function ia(t){let e=t||[],a=[];for(let s=0;s<e.length;s++){let d=e[s],p=d.tacho_period_us!=null?d.tacho_period_us:d.tacho_cadence_us!=null?d.tacho_cadence_us:null;a.push({t_ms:d.t_ms,period_us:p,rate_hz:vl(p)})}let o=e.filter(s=>s.drive_on&&Number.isFinite(s.current_ma)),r=o.length>=2?o:e.filter(s=>Number.isFinite(s.current_ma)),n=Xr(r);return{cadence:a,slopes:n,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function Yr(t,e){let a=e||fl(t),o=t.filter(K=>K.drive_on&&Number.isFinite(K.current_ma)&&(a==="open"?K.direction_open:!K.direction_open));if(o.length<8)return{direction:a,ok:!1,reason:"too_few_samples"};let r=o[0].t_ms,n=o[o.length-1].t_ms,s=o.filter(K=>K.t_ms>=r+650),d=s.length>12?s:o,p=Math.max(1,n-(d[0]?d[0].t_ms:r)),u=d.filter(K=>K.t_ms<d[0].t_ms+p*.7),v=d.filter(K=>K.t_ms>=d[0].t_ms+p*.8),l=(u.length?u:d).map(K=>K.current_ma),f=(v.length?v:d.slice(-Math.max(4,d.length/8|0))).map(K=>K.current_ma),x=l.reduce((K,we)=>K+we,0)/l.length,w=Math.max(...o.map(K=>K.current_ma)),L=Math.max(...f),E=Math.max(0,o[o.length-1].motion_count-o[0].motion_count),_=Xr(d),g=_.filter(K=>K.t_ms<d[0].t_ms+p*.7).map(K=>K.slope),m=_.filter(K=>K.t_ms>=d[0].t_ms+p*.75).map(K=>K.slope),b=m.length?Math.max(...m):0,y=hl(g.map(Math.abs),.9)||0,z=a==="close"?.55:.68,N=x>.5?L/x:0,X=Math.max(...o.map(K=>Number(K.stroke_phase)||0)),$=a==="open"?N>=1.12||X>=Tt.STOPPING||b>=.2:N>=1.15||X>=Tt.UNDER_LOAD||b>=.4,te=Ve(Uo(1+z*Math.max(0,N-1),1.25,2.4)),oe=Ve(Uo(Math.max(y*2.2,b*.42,a==="open"?.15:.4),.15,8)),le=Ve(Uo(1+.35*Math.max(0,N-1),1.15,1.8)),q=a==="open"?1.15:null,B=Zo(o);return{direction:a,ok:$,reason:$?null:"no_endstop",start_ms:r,end_ms:n,runtime_ms:n-r,mean_ma:Ve(x),peak_ma:Ve(w),stall_peak_ma:Ve(L),ripples:E,max_stall_slope_ma_s:Ve(b),travel_slope_ma_s:Ve(y),measured_factor:Ve(N),endstop_seen:$,suggested_factor:te,suggested_slope:oe,suggested_slope_floor:le,suggested_ripple_limit:q,pin_seen:!!B,pin_t_ms:B?B.t_ms:null,pin_motion_count:B?B.motion_count:null,pin_current_ma:B?Ve(B.current_ma):null,samples:o}}function Jr(t,e){if(!t||!t.ok)return[];let a=t.mean_ma,o=Number(e&&e.factor)||t.suggested_factor;return[{id:"mean",value:a},{id:"threshold",value:Ve(a*o)},{id:"suggested",value:Ve(a*t.suggested_factor)},{id:"cap",value:100}]}var la=920,da=200,Qr=56,ue={t:16,r:18,b:32,l:52},Qe=la-ue.l-ue.r,Wt=da-ue.t-ue.b,Xo="var(--accent)",Qo="var(--series-cool)",xl="var(--state-warn)",yl="var(--state-ok)",wl="var(--state-danger)",Ka="var(--state-warn)",Yo="var(--series-cool)",Jo="var(--accent)",kl="var(--state-ok)",es={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},ts={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},_l=`
.motor-lab-charts { display:grid; gap:12px; margin:0 0 14px; }
.motor-lab-charts .chart-card { padding:12px 12px 8px; }
.motor-lab-charts .lab-empty {
  min-height:120px; display:grid; place-items:center;
  color:var(--text-faint); font-size:.84rem; text-align:center;
}
.motor-lab-charts .lab-chart-warn {
  margin:0 0 8px; padding:8px 10px; border-left:3px solid var(--state-warn);
  background:var(--warn-bg-soft); color:var(--state-warn); font-size:.78rem; font-weight:650;
}
.motor-lab-charts .gw-controls {
  display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin:2px 0 6px;
}
.motor-lab-charts .gw-toggle {
  display:inline-flex; align-items:center; gap:6px; min-height:44px; padding:4px 12px;
  border:1px solid var(--control-border); border-radius:8px;
  background:linear-gradient(145deg, rgba(255,255,255,.075), rgba(255,255,255,.025));
  color:var(--text-secondary); font-size:.68rem; font-weight:700; letter-spacing:.3px; cursor:pointer;
}
.motor-lab-charts .gw-toggle::before {
  content:''; width:9px; height:9px; border-radius:4px; border:2px solid currentColor;
  background:color-mix(in srgb, currentColor 30%, transparent); flex-shrink:0;
}
.motor-lab-charts .gw-toggle.is-off { opacity:.48; background:transparent; }
.motor-lab-charts .gw-toggle[data-layer="current"] { color:var(--accent); }
.motor-lab-charts .gw-toggle[data-layer="overlays"] { color:var(--series-cool); }
.motor-lab-charts .gw-toggle[data-layer="phase"] { color:var(--state-warn); }
.motor-lab-charts .gw-toggle[data-layer="cadence"] { color:var(--series-cool); }
.motor-lab-charts .gw-toggle[data-layer="slope"] { color:var(--accent); }
.motor-lab-charts .lab-phase-strip text { font-size:10px; font-weight:700; fill:var(--chart-axis); }
`;D("motor-lab-charts",_l);function Zt(t,e,a=Wt){let o=e.max-e.min||1;return ue.t+a-(t-e.min)/o*a}function Ga(t,e,a,o=da){t.appendChild(ie("text",{class:"chart-axis-label",x:ue.l,y:o-8},"0 s")),t.appendChild(ie("text",{class:"chart-axis-label",x:ue.l+Qe-48,y:o-8},(a/1e3).toFixed(1)+" s"))}function en(t,e,a=Wt){for(let o=0;o<=4;o++){let r=ue.t+a*o/4;t.appendChild(ie("line",{class:"chart-grid",x1:ue.l,x2:ue.l+Qe,y1:r,y2:r}));let n=e.max-(e.max-e.min)*o/4;t.appendChild(ie("text",{class:"chart-tick",x:8,y:r+4},n.toFixed(0)))}}function zl(t){if(!t.length)return[];let e=[],a=0,o=Number(t[0].stroke_phase)||0;for(let r=1;r<t.length;r++){let n=Number(t[r].stroke_phase)||0;n!==o&&(e.push({phase:o,start:a,end:r-1}),a=r,o=n)}return e.push({phase:o,start:a,end:t.length-1}),e}function Sl(t){let e=t.querySelector("defs");return e||(e=ie("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([o,r,n])=>{let s=ie("pattern",{id:o,width:4,height:4,patternUnits:"userSpaceOnUse"});s.appendChild(ie("path",{d:r,stroke:n,"stroke-width":"1",fill:"none"})),e.appendChild(s)}),t.appendChild(e),e)}function ca(t,e,a){let o=document.createElement("div");o.className="chart-card",o.setAttribute("role","img"),o.setAttribute("aria-label",c(a||t));let r=document.createElement("div");return r.className="chart-head",r.innerHTML='<span class="chart-title">'+c(t)+'</span><span class="chart-sub">'+e+"</span>",o.appendChild(r),o}function Cl(t,e,a){let o=ca(e,c(a||"diagnostics.lab.empty"),e),r=document.createElement("div");r.className="lab-empty",r.textContent=c("diagnostics.lab.empty"),o.appendChild(r),t.appendChild(o)}function Xa(t,e,a){return t?c("diagnostics.lab.res.live"):a&&a.truncated?c("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?c("diagnostics.lab.res.trace",{direction:c("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):c("diagnostics.lab.res.traceReady")}function Ll(t,e,a,o,r,n){if(!n.current&&!n.overlays)return;let s=ia(e),d=ca("diagnostics.lab.chart.current",Xa(r,a,s),"diagnostics.lab.chart.currentAria");if(s.truncated){let _=document.createElement("div");_.className="lab-chart-warn",_.textContent=c("diagnostics.lab.res.ringWarn",{n:2e3,s:s.window_ms/1e3}),d.appendChild(_)}if(!e.length){let _=document.createElement("div");_.className="lab-empty",_.textContent=c("diagnostics.lab.empty"),d.appendChild(_),t.appendChild(d);return}let p=e.map(_=>_.current_ma).filter(Number.isFinite),u=(o||[]).map(_=>_.value).filter(Number.isFinite),v=Oa(p.concat([0,40],u),0,50);v.min=0;let l=e[0].t_ms,f=Math.max(1,e[e.length-1].t_ms-l),x=_=>ue.l+(e[_].t_ms-l)/f*Qe,w=e.map((_,g)=>({x:x(g),y:Zt(_.current_ma,v)})),L=ie("svg",{viewBox:"0 0 "+la+" "+da,role:"img"});if(en(L,v),Ga(L,l,f),n.overlays){let _={mean:Qo,threshold:xl,suggested:yl,cap:wl};(o||[]).forEach(g=>{let m=Zt(g.value,v);L.appendChild(ie("line",{x1:ue.l,x2:ue.l+Qe,y1:m,y2:m,stroke:_[g.id],"stroke-dasharray":g.id==="mean"?"0":"5 4","stroke-width":g.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:g.id==="cap"?".45":".9"}))})}let E=a&&a.ok&&a.pin_seen?{t_ms:a.pin_t_ms,current_ma:a.pin_current_ma,motion_count:a.pin_motion_count,stroke_phase:1}:Zo(e);if(E&&Number.isFinite(E.t_ms)){let _=ue.l+(E.t_ms-l)/f*Qe;L.appendChild(ie("line",{x1:_,x2:_,y1:ue.t,y2:ue.t+Wt,stroke:Ka,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),L.appendChild(ie("circle",{cx:_,cy:Zt(Number(E.current_ma)||0,v),r:4.2,fill:Ka,stroke:"var(--bg)","stroke-width":"1.5"})),L.appendChild(ie("text",{class:"chart-tick",x:Math.min(_+6,ue.l+Qe-64),y:ue.t+12,fill:Ka},c("diagnostics.lab.pinMark")))}n.current&&L.appendChild(ie("path",{d:qt(w),fill:"none",stroke:Xo,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),d.appendChild(L),t.appendChild(d),Bt(L,d,{count:e.length,plotTop:ue.t,plotBottom:ue.t+Wt,xAt:x,label:_=>((e[_].t_ms-l)/1e3).toFixed(2)+" s",dots:_=>n.current?[{y:w[_].y,color:Xo}]:[],rows:_=>[{color:Xo,label:c("diagnostics.lab.currentMa"),value:Number(e[_].current_ma).toFixed(1)+" mA"},{color:Qo,label:c("diagnostics.lab.motion"),value:String(e[_].motion_count)},{color:Ka,label:c("diagnostics.lab.stroke"),value:c("diagnostics.lab.stroke."+sa(e[_].stroke_phase))}]})}function Ml(t,e,a,o){if(!o.phase)return;let r=ia(e),n=ca("diagnostics.lab.chart.phase",Xa(a,null,r),"diagnostics.lab.chart.phaseAria");if(!e.length){let f=document.createElement("div");f.className="lab-empty",f.textContent=c("diagnostics.lab.empty"),n.appendChild(f),t.appendChild(n);return}let s=e[0].t_ms,d=Math.max(1,e[e.length-1].t_ms-s),p=Qr+ue.b,u=ie("svg",{viewBox:"0 0 "+la+" "+p,class:"lab-phase-strip",role:"img"});Sl(u);let v=10,l=Qr-18;zl(e).forEach(f=>{let x=ue.l+(e[f.start].t_ms-s)/d*Qe,w=ue.l+(e[f.end].t_ms-s)/d*Qe,L=sa(f.phase),E=Math.max(2,w-x);u.appendChild(ie("rect",{x,y:v,width:E,height:l,fill:es[L]||es.free,stroke:"var(--separator)","stroke-width":"1"})),ts[L]&&u.appendChild(ie("rect",{x,y:v,width:E,height:l,fill:"url(#"+ts[L]+")",opacity:".55"})),E>54&&u.appendChild(ie("text",{x:x+6,y:v+l/2+3},c("diagnostics.lab.stroke."+L))),u.appendChild(ie("line",{x1:w,x2:w,y1:v,y2:v+l,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),Ga(u,s,d,p),n.appendChild(u),t.appendChild(n)}function Al(t,e,a,o){if(!o.cadence)return;let r=ia(e),n=ca("diagnostics.lab.chart.cadence",Xa(a,null,r),"diagnostics.lab.chart.cadenceAria"),s=r.cadence.map(x=>x.rate_hz).filter(x=>x!=null&&Number.isFinite(x));if(!s.length){let x=document.createElement("div");x.className="lab-empty",x.textContent=c("diagnostics.lab.chart.cadenceEmpty"),n.appendChild(x),t.appendChild(n);return}let d=Oa(s.concat([0]),0,Math.max(10,...s));d.min=0;let p=e[0].t_ms,u=Math.max(1,e[e.length-1].t_ms-p),v=[],l=[];r.cadence.forEach((x,w)=>{x.rate_hz==null||!Number.isFinite(x.rate_hz)||(v.push({x:ue.l+(x.t_ms-p)/u*Qe,y:Zt(x.rate_hz,d)}),l.push(w))});let f=ie("svg",{viewBox:"0 0 "+la+" "+da,role:"img"});en(f,d),Ga(f,p,u),f.appendChild(ie("path",{d:qt(v),fill:"none",stroke:Yo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),n.appendChild(f),t.appendChild(n),Bt(f,n,{count:v.length,plotTop:ue.t,plotBottom:ue.t+Wt,xAt:x=>v[x].x,label:x=>((r.cadence[l[x]].t_ms-p)/1e3).toFixed(2)+" s",dots:x=>[{y:v[x].y,color:Yo}],rows:x=>{let w=r.cadence[l[x]];return[{color:Yo,label:c("diagnostics.lab.cadence"),value:w.rate_hz.toFixed(1)+" /s"},{color:Qo,label:c("diagnostics.lab.tachoPeriod"),value:Math.round(w.period_us)+" \xB5s"}]}})}function El(t,e,a,o,r){if(!r.slope)return;let n=ia(e),s=ca("diagnostics.lab.chart.slope",Xa(o,a,n),"diagnostics.lab.chart.slopeAria");if(!n.slopes.length){let w=document.createElement("div");w.className="lab-empty",w.textContent=c("diagnostics.lab.chart.slopeEmpty"),s.appendChild(w),t.appendChild(s);return}let d=n.slopes.map(w=>w.slope),p=a&&a.ok?a.suggested_slope:null,u=Oa(d.concat(p!=null?[p,0]:[0]),-2,8),v=e[0].t_ms,l=Math.max(1,e[e.length-1].t_ms-v),f=n.slopes.map(w=>({x:ue.l+(w.t_ms-v)/l*Qe,y:Zt(w.slope,u)})),x=ie("svg",{viewBox:"0 0 "+la+" "+da,role:"img"});if(en(x,u),Ga(x,v,l),p!=null){let w=Zt(p,u);x.appendChild(ie("line",{x1:ue.l,x2:ue.l+Qe,y1:w,y2:w,stroke:kl,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}x.appendChild(ie("path",{d:qt(f),fill:"none",stroke:Jo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),s.appendChild(x),t.appendChild(s),Bt(x,s,{count:f.length,plotTop:ue.t,plotBottom:ue.t+Wt,xAt:w=>f[w].x,label:w=>((n.slopes[w].t_ms-v)/1e3).toFixed(2)+" s",dots:w=>[{y:f[w].y,color:Jo}],rows:w=>[{color:Jo,label:c("diagnostics.lab.slope"),value:n.slopes[w].slope.toFixed(2)+" mA/s"}]})}function os(t,e){let a=e&&e.samples||[],o=e&&e.analysis,r=!!(e&&e.live),n=e&&e.overlays,s=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let d=document.createElement("div");d.className="motor-lab-charts";let p=document.createElement("div");return p.className="gw-controls",p.setAttribute("role","toolbar"),p.setAttribute("aria-label",c("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([v,l])=>{let f=document.createElement("button");f.type="button",f.className="gw-toggle"+(s[v]?"":" is-off"),f.dataset.layer=v,f.setAttribute("aria-pressed",s[v]?"true":"false"),f.textContent=c(l),p.appendChild(f)}),d.appendChild(p),a.length?(Ll(d,a,o,n,r,s),Ml(d,a,r,s),Al(d,a,r,s),El(d,a,o,r,s)):Cl(d,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(d),p}var tn=400,Nl=500;var Rl=2e3,pa=["setup","arm","seat","open","close","review"],rn=[{cls:"close-factor",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x",step:"0.1"},{cls:"close-slope",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s",step:"0.1"},{cls:"close-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x",step:"0.05"},{cls:"open-factor",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x",step:"0.1"},{cls:"open-slope",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s",step:"0.05"},{cls:"open-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x",step:"0.05"},{cls:"open-ripple",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x",step:"0.05"}],Pl=`
.diag-motor-lab { color: var(--text-main); }
.diag-motor-lab .lab-toolbar {
  position: sticky; top: 0; z-index: 3;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  margin: 0 0 14px; padding: 10px 0 12px;
  border-bottom: 1px solid var(--separator);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
}
.diag-motor-lab .lab-toolbar-lead {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0;
}
.diag-motor-lab .lab-dev {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--text-muted); font-size: .78rem; font-weight: 650;
}
.diag-motor-lab .lab-dev strong {
  display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px;
  border-radius: 999px; background: var(--warn-bg-soft); border: 1px solid var(--warn-border);
  color: var(--state-warn); font-size: .66rem; letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-select {
  height: var(--control-height, 44px); min-height: var(--control-height, 44px); min-width: 148px; max-width: 220px; padding: 0 12px;
  border: 1px solid var(--control-border); border-radius: 8px;
  background: var(--control-bg); color: var(--text-strong); font-weight: 650;
}
.diag-motor-lab .lab-zone-chip {
  display: inline-flex; align-items: center; min-height: 32px; padding: 0 12px;
  border: 1px solid var(--separator); border-radius: 999px;
  color: var(--text-strong); font-size: .76rem; font-weight: 650; white-space: nowrap;
  background: color-mix(in srgb, var(--surface-raised) 70%, transparent);
}
.diag-motor-lab .lab-zone-chip[hidden] { display: none; }
.diag-motor-lab .lab-step-chip {
  display: inline-flex; align-items: center; min-height: 32px; padding: 0 12px;
  border: 1px solid var(--separator); border-radius: 999px;
  color: var(--text-muted); font-size: .76rem; font-weight: 650; white-space: nowrap;
}
.diag-motor-lab .lab-step-chip[data-state="active"] {
  color: var(--accent); border-color: var(--accent-border); background: var(--accent-bg-soft);
}
.diag-motor-lab .lab-step-chip[data-state="halted"] {
  color: var(--danger-text); border-color: var(--danger-border);
}
.diag-motor-lab .lab-estop {
  min-width: 148px; height: var(--control-height, 44px); min-height: var(--control-height, 44px); padding: 0 18px;
  border: 1px solid var(--danger-border-strong); border-radius: 10px;
  background: var(--danger-bg-strong); color: var(--danger-text);
  font-weight: 800; letter-spacing: .04em; text-transform: uppercase; cursor: pointer;
  box-shadow: 0 0 0 4px var(--danger-bg);
}
.diag-motor-lab .lab-estop:hover { filter: brightness(1.08); }
.diag-motor-lab .lab-estop:focus-visible { outline: 3px solid var(--state-danger); outline-offset: 3px; }
.diag-motor-lab .lab-estop[data-armed="true"] { animation: lab-estop-pulse 1.1s ease-in-out infinite; }
@keyframes lab-estop-pulse { 50% { box-shadow: 0 0 0 7px var(--danger-bg); } }
.diag-motor-lab .lab-banner {
  display: none; margin: 0 0 14px; padding: 10px 12px; border-left: 3px solid var(--state-danger);
  background: var(--danger-bg-soft); color: var(--danger-text); font-size: .84rem; font-weight: 650;
}
.diag-motor-lab .lab-banner.show { display: block; }
.diag-motor-lab .lab-guide {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px 28px;
  align-items: end;
  margin: 0 0 18px; padding: 0 0 16px;
  border-bottom: 1px solid var(--separator);
}
.diag-motor-lab .lab-guide[data-setup="true"] {
  grid-template-columns: minmax(0, 1.35fr) auto auto;
}
.diag-motor-lab .lab-stage { margin: 0; min-width: 0; }
.diag-motor-lab .lab-kicker {
  color: var(--text-faint); font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-stage h3 { margin: 4px 0 6px; color: var(--text-strong); font-size: 1.15rem; font-weight: 700; }
.diag-motor-lab .lab-stage p { margin: 0; color: var(--text-muted); font-size: .88rem; line-height: 1.45; max-width: 46rem; }
.diag-motor-lab .lab-setup {
  display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch;
  gap: 8px; margin: 0; min-width: 148px;
}
.diag-motor-lab .lab-setup[hidden] { display: none; }
.diag-motor-lab .lab-label {
  color: var(--text-faint); font-size: .72rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-actions {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end;
  gap: 8px; margin: 0;
}
.diag-motor-lab .lab-actions .ui-btn {
  flex: 0 0 auto; width: auto; min-width: 148px; height: var(--control-height, 44px); min-height: var(--control-height, 44px);
}
.diag-motor-lab .lab-actions .ui-btn.primary {
  background: var(--accent); border-color: var(--accent); color: var(--text-on-accent);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.16), 0 8px 18px rgba(0,0,0,.16);
}
.diag-motor-lab .lab-actions .ui-btn.primary:hover { filter: brightness(1.06); color: var(--text-on-accent); }
.diag-motor-lab .lab-actions .ui-btn:disabled { opacity: .45; cursor: not-allowed; }
.diag-motor-lab .lab-board {
  margin: 0 0 16px; border: 1px solid var(--separator); border-radius: 12px;
  background: var(--surface-raised); overflow: hidden;
}
.diag-motor-lab .lab-phase-row {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  margin: 0; padding: 12px 16px;
  border-bottom: 1px solid var(--separator);
}
.diag-motor-lab .lab-phase-row small {
  color: var(--text-faint); font-size: .68rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-phase-label {
  color: var(--text-strong); font-size: 1.05rem; font-weight: 750; letter-spacing: -.02em;
}
.diag-motor-lab .lab-phase-label[data-kind="run"] { color: var(--state-warn); }
.diag-motor-lab .lab-phase-label[data-kind="ok"] { color: var(--state-ok); }
.diag-motor-lab .lab-phase-label[data-kind="halt"] { color: var(--state-danger); }
.diag-motor-lab .lab-instruments {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0;
  margin: 0; border: 0; border-radius: 0; background: transparent; overflow: visible;
}
.diag-motor-lab .lab-cluster {
  padding: 14px 16px; border-right: 1px solid var(--separator);
}
.diag-motor-lab .lab-cluster:last-child { border-right: 0; }
.diag-motor-lab .lab-cluster h4 {
  margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--separator);
  color: var(--text-faint); font-size: .68rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-gauges {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px 14px;
}
.diag-motor-lab .lab-gauge span {
  display: block; color: var(--text-faint); font-size: .64rem; font-weight: 700;
  letter-spacing: .07em; text-transform: uppercase;
}
.diag-motor-lab .lab-gauge b {
  display: block; margin-top: 3px; color: var(--text-strong);
  font-family: var(--mono); font-size: 1.05rem; font-variant-numeric: tabular-nums;
}
.diag-motor-lab .lab-gauge b[data-phase="contact"],
.diag-motor-lab .lab-gauge b[data-seen="true"] { color: var(--state-warn); }
.diag-motor-lab .lab-gauge b[data-phase="load"] { color: var(--state-ok); }
.diag-motor-lab .lab-gauge b[data-phase="stopping"] { color: var(--state-danger); }
.diag-motor-lab .lab-log {
  margin: 0 0 16px; padding: 10px 12px;
  border: 1px solid var(--separator); border-radius: 10px;
  color: var(--text-muted); font-family: var(--mono); font-size: .74rem; line-height: 1.55;
  max-height: 7.4em; overflow: auto;
}
.diag-motor-lab .lab-log div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.diag-motor-lab .lab-chart { margin: 0 0 14px; }
.diag-motor-lab .lab-capture-bar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0 0 14px;
}
.diag-motor-lab .lab-capture-meta {
  color: var(--text-faint); font-size: .74rem; font-variant-numeric: tabular-nums;
}
.diag-motor-lab .lab-metrics {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 0 0 14px;
}
.diag-motor-lab .lab-metric {
  padding: 10px 12px; border: 1px solid var(--separator); border-radius: 10px; background: var(--surface-raised);
}
.diag-motor-lab .lab-metric span { display: block; color: var(--text-faint); font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.diag-motor-lab .lab-metric strong { display: block; margin-top: 4px; color: var(--text-strong); font-size: 1.05rem; font-variant-numeric: tabular-nums; }
.diag-motor-lab .lab-suggest { width: 100%; border-collapse: collapse; margin: 0 0 12px; }
.diag-motor-lab .lab-suggest th, .diag-motor-lab .lab-suggest td {
  padding: 8px 6px; text-align: left; font-size: .82rem; border-bottom: 1px solid var(--separator);
}
.diag-motor-lab .lab-suggest th { color: var(--text-faint); font-size: .68rem; letter-spacing: .06em; text-transform: uppercase; }
.diag-motor-lab .lab-suggest td { color: var(--text-strong); font-variant-numeric: tabular-nums; }
.diag-motor-lab .lab-suggest .better { color: var(--state-ok); font-weight: 700; }
.diag-motor-lab .lab-tune {
  margin: 0 0 14px; padding: 12px 14px;
  border: 1px solid var(--separator); border-radius: 12px;
  background: var(--surface-raised);
}
.diag-motor-lab .lab-tune > summary {
  list-style: none; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  color: var(--text-strong); font-size: .88rem; font-weight: 700;
}
.diag-motor-lab .lab-tune > summary::-webkit-details-marker { display: none; }
.diag-motor-lab .lab-tune > summary::after {
  content: '+'; display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 8px; border: 1px solid var(--control-border);
  background: var(--control-bg); color: var(--accent); font-size: 1rem; line-height: 1;
}
.diag-motor-lab .lab-tune[open] > summary::after { content: '\u2212'; }
.diag-motor-lab .lab-tune-copy {
  margin: 8px 0 12px; color: var(--text-muted); font-size: .8rem; line-height: 1.4;
}
.diag-motor-lab .lab-tune-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px;
}
.diag-motor-lab .lab-tune-row {
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(5.5rem, .8fr);
  gap: 8px; align-items: center;
}
.diag-motor-lab .lab-tune-row label {
  color: var(--text-muted); font-size: .72rem; font-weight: 650;
}
.diag-motor-lab .lab-tune-row input {
  width: 100%; height: var(--control-compact, 32px); min-height: var(--control-compact, 32px);
  padding: 0 8px; border: 1px solid var(--control-border); border-radius: 8px;
  background: var(--control-bg); color: var(--text-strong); font-variant-numeric: tabular-nums;
}
@media (max-width: 720px) {
  .diag-motor-lab .lab-tune-grid { grid-template-columns: 1fr; }
}
@media (max-width: 980px) {
  .diag-motor-lab .lab-instruments { grid-template-columns: 1fr; }
  .diag-motor-lab .lab-cluster { border-right: 0; border-bottom: 1px solid var(--separator); }
  .diag-motor-lab .lab-cluster:last-child { border-bottom: 0; }
}
@media (max-width: 860px) {
  .diag-motor-lab .lab-guide,
  .diag-motor-lab .lab-guide[data-setup="true"] {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 14px;
  }
  .diag-motor-lab .lab-actions { justify-content: flex-start; }
}
@media (max-width: 720px) {
  .diag-motor-lab .lab-metrics { grid-template-columns: 1fr 1fr; }
  .diag-motor-lab .lab-toolbar { align-items: stretch; }
  .diag-motor-lab .lab-estop { width: 100%; }
  .diag-motor-lab .lab-select { max-width: none; width: 100%; }
  .diag-motor-lab .lab-gauges { grid-template-columns: 1fr 1fr; }
}
`;D("diag-motor-lab",Pl);var Dl=()=>`
  <div class="diag-motor-lab">
    <div class="lab-toolbar">
      <div class="lab-toolbar-lead">
        <div class="lab-dev"><strong>Dev</strong><span data-i18n="diagnostics.lab.hint">Guided stroke capture for endstop thresholds.</span></div>
        <span class="lab-zone-chip" hidden></span>
        <span class="lab-step-chip" data-state="active"></span>
      </div>
      <button type="button" class="lab-estop" data-i18n="diagnostics.lab.estop" data-i18n-label="diagnostics.lab.estopHint">Emergency stop</button>
    </div>
    <div class="lab-banner" role="status" aria-live="assertive"></div>
    <section class="lab-guide" data-setup="true">
      <section class="lab-stage">
        <div class="lab-kicker"></div>
        <h3></h3>
        <p></p>
      </section>
      <div class="lab-setup" hidden>
        <label class="lab-label" for="lab-zone-select" data-i18n="diagnostics.lab.motor">Motor</label>
        <select id="lab-zone-select" class="lab-select lab-zone" aria-label="Motor"></select>
      </div>
      <div class="lab-actions">
        <button type="button" class="ui-btn primary lab-primary"></button>
        <button type="button" class="ui-btn lab-secondary" hidden></button>
      </div>
    </section>
    <section class="lab-board" aria-label="Status">
      <div class="lab-phase-row" aria-live="polite">
        <small data-i18n="diagnostics.lab.status">Status</small>
        <strong class="lab-phase-label">Idle</strong>
      </div>
      <div class="lab-instruments">
        <section class="lab-cluster" aria-labelledby="lab-cluster-motion">
          <h4 id="lab-cluster-motion" data-i18n="diagnostics.lab.cluster.motion">Motion</h4>
          <div class="lab-gauges">
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.currentMa">Current</span><b data-k="current">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.mean">Running mean</span><b data-k="mean">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.peak">Peak</span><b data-k="peak">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.slope">Slope</span><b data-k="slope">\u2014</b></div>
          </div>
        </section>
        <section class="lab-cluster" aria-labelledby="lab-cluster-position">
          <h4 id="lab-cluster-position" data-i18n="diagnostics.lab.cluster.position">Position</h4>
          <div class="lab-gauges">
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.runtime">Runtime</span><b data-k="runtime">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.motion">Motion count</span><b data-k="motion">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.cadence">Cadence</span><b data-k="cadence">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.stroke">Stroke</span><b data-k="stroke">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pin">Pin</span><b data-k="pin">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.direction">Direction</span><b data-k="direction">\u2014</b></div>
          </div>
        </section>
        <section class="lab-cluster" aria-labelledby="lab-cluster-hardware">
          <h4 id="lab-cluster-hardware" data-i18n="diagnostics.lab.cluster.hardware">Hardware</h4>
          <div class="lab-gauges">
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.drivers">Drivers</span><b data-k="drivers">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.busyFlag">Motor busy</span><b data-k="busy">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.armed">Armed</span><b data-k="armed">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pad10">Pad 10 ARM</span><b data-k="pad10">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pad9">Pad 9 STATE</span><b data-k="pad9">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.pad11">Pad 11 EN</span><b data-k="pad11">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.backend">Backend</span><b data-k="backend">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.fault">Fault</span><b data-k="fault">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.invalidSamples">Invalid samples</span><b data-k="invalid">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.tachoRejected">Tacho rejected</span><b data-k="tachoRejected">\u2014</b></div>
          </div>
        </section>
      </div>
    </section>
    <section class="lab-board" aria-label="Kv curve">
      <div class="lab-phase-row">
        <small data-i18n="diagnostics.lab.kvCurve">Relative Kv (orifice model)</small>
        <strong class="lab-kv-hint" data-i18n="diagnostics.lab.kvHint">Used by the flow allocator</strong>
      </div>
      <table class="lab-suggest lab-kv-table">
        <thead><tr><th>%</th><th>Kv</th><th>%</th><th>Kv</th><th>%</th><th>Kv</th></tr></thead>
        <tbody class="lab-kv-body"></tbody>
      </table>
    </section>
    <details class="lab-tune" open>
      <summary data-i18n="diagnostics.lab.tune.title">Endstop thresholds</summary>
      <p class="lab-tune-copy" data-i18n="diagnostics.lab.tune.copy">Raise multipliers or slopes if the stroke stops too early. Changes apply immediately to this controller.</p>
      <div class="lab-tune-grid">
        ${rn.map(t=>`
          <div class="lab-tune-row">
            <label data-i18n="${t.labelKey}">${t.labelKey}</label>
            <input type="number" class="lab-tune-input" data-tune-key="${t.key}" data-tune-id="${t.id}" step="${t.step}" inputmode="decimal" />
          </div>`).join("")}
      </div>
    </details>
    <div class="lab-chart"></div>
    <div class="lab-capture-bar">
      <button type="button" class="ui-btn lab-download" hidden data-i18n="diagnostics.lab.downloadCsv">Download CSV</button>
      <span class="lab-capture-meta" hidden></span>
    </div>
    <div class="lab-metrics"></div>
    <table class="lab-suggest" hidden>
      <thead>
        <tr>
          <th data-i18n="diagnostics.lab.param">Parameter</th>
          <th data-i18n="diagnostics.lab.current">Current</th>
          <th data-i18n="diagnostics.lab.suggested">Suggested</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <div class="lab-log" aria-label="Event log"></div>
  </div>
`;function rs(t){return t==="open"?{factor:A(i.openThresholdMultiplier),slope:A(i.openSlopeThreshold),floor:A(i.openSlopeCurrentFactor),ripple:A(i.openRippleLimitFactor)}:{factor:A(i.closeThresholdMultiplier),slope:A(i.closeSlopeThreshold),floor:A(i.closeSlopeCurrentFactor)}}function ua(t){let e=rs(t.direction),a=t.direction==="open"?"open":"close",o=[{key:a+"_threshold_multiplier",labelKey:t.direction==="open"?"settings.motor.openThreshold":"settings.motor.closeThreshold",current:e.factor,suggested:t.suggested_factor,unit:"x"},{key:a+"_slope_threshold",labelKey:t.direction==="open"?"settings.motor.openSlope":"settings.motor.closeSlope",current:e.slope,suggested:t.suggested_slope,unit:"mA/s"},{key:a+"_slope_current_factor",labelKey:t.direction==="open"?"settings.motor.openSlopeFloor":"settings.motor.closeSlopeFloor",current:e.floor,suggested:t.suggested_slope_floor,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&o.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:e.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),o}function an(t){return c(t?"common.on":"common.off")}function on(t){return t===1?"HIGH":t===0?"LOW":"\u2014"}function Ft(t){return t==="rev32_gpio"||t==="rev31_gpio"}function nn(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",latchFaulted:!1,driversEnabled:null,latchArmLevel:null,latchStateLevel:null,motorEnableLevel:null,invalidSamples:0,tachoRejected:0}}var Vu=O({tag:"diag-motor-lab",render:Dl,onMount(t,e){let a=Number(P("selectedZone")||1),o="setup",r="idle",n={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1},s={open:null,close:null,seat:null},d={samples:[],analysis:null,live:!1},p=[],u={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},v=[],l=nn(),f=e.querySelector(".lab-step-chip"),x=e.querySelector(".lab-zone-chip"),w=e.querySelector(".lab-banner"),L=e.querySelector(".lab-guide"),E=e.querySelector(".lab-kicker"),_=e.querySelector(".lab-stage h3"),g=e.querySelector(".lab-stage p"),m=e.querySelector(".lab-setup"),b=e.querySelector(".lab-zone"),y=e.querySelector(".lab-phase-label"),z=e.querySelector(".lab-log"),N=e.querySelector(".lab-chart"),X=e.querySelector(".lab-download"),$=e.querySelector(".lab-capture-meta"),te=e.querySelector(".lab-metrics"),oe=e.querySelector(".lab-suggest"),le=e.querySelector(".lab-primary"),q=e.querySelector(".lab-secondary"),B=e.querySelector(".lab-estop"),K=Array.from(e.querySelectorAll(".lab-tune-input")),we=e.querySelector(".lab-kv-body"),ne={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),pad10:e.querySelector('[data-k="pad10"]'),pad9:e.querySelector('[data-k="pad9"]'),pad11:e.querySelector('[data-k="pad11"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function Be(S){p=S&&S.length?S:[];let F=p.length;if(X.hidden=F<2,$.hidden=F<2,F<2)return;let V=Number(p[0].t_ms)||0,Z=Number(p[F-1].t_ms)||0,I=Math.max(0,(Z-V)/1e3);$.textContent=c("diagnostics.lab.captureMeta",{n:F,hz:2,seconds:I.toFixed(1)})}function fa(S){let F=Math.max(0,Math.min(100,Number(S)||0))/100;return F<.3?.3*Math.pow(Math.max(F/.3,0),1.5):Math.pow(F,1.5)}function to(){if(!we)return;let S=[10,20,30,40,50,60,70,80,90,100],F="";for(let V=0;V<S.length;V+=3){let Z=[];for(let I=0;I<3;I++){let G=S[V+I];if(G==null){Z.push("<td></td><td></td>");continue}Z.push(`<td>${G}</td><td>${fa(G).toFixed(3)}</td>`)}F+=`<tr>${Z.join("")}</tr>`}we.innerHTML=F}to();function ha(S){return pa.indexOf(S)}function Xt(){return Ce(a)}function va(){let S=String(a);b.innerHTML=Array.from({length:6},(F,V)=>'<option value="'+(V+1)+'">'+Ce(V+1).replace(/</g,"&lt;")+"</option>").join(""),b.value=S,b.setAttribute("aria-label",c("diagnostics.lab.motor")),x.textContent=Xt(),x.setAttribute("aria-label",c("diagnostics.lab.motor"))}function Q(S,F){let V=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});v.push(V+"  "+c(S,F)),v.length>8&&v.shift(),z.innerHTML=v.map(Z=>"<div>"+Z+"</div>").join(""),z.scrollTop=z.scrollHeight}function Ue(S){w.textContent=S||"",w.classList.toggle("show",!!S)}function ve(S,F){r=S,y.dataset.kind=F||"",y.textContent=c("diagnostics.lab.phase."+S)}function T(){for(let S of K){let F=A(S.dataset.tuneId);F==null||Number.isNaN(Number(F))||document.activeElement!==S&&(S.value=String(Number(F)))}}function H(){for(let S of K){let F=()=>{var Z;let V=Number(S.value);if(!Number.isFinite(V)){T();return}Pe(S.dataset.tuneKey,V),Q("diagnostics.lab.log.tune",{key:c(((Z=rn.find(I=>I.key===S.dataset.tuneKey))==null?void 0:Z.labelKey)||S.dataset.tuneKey),value:V}),d.analysis&&j()};S.addEventListener("change",F),S.addEventListener("keydown",V=>{V.key==="Enter"&&(V.preventDefault(),S.blur(),F())})}}function ee(){let S=M(i.motorProfileDefault)||"HmIP VdMot",F;return S==="HmIP VdMot"?(F=Number(A(i.hmipRuntimeLimitSeconds)),(!Number.isFinite(F)||F<=0)&&(F=40),F=Math.min(40,F)):(F=Number(A(i.genericRuntimeLimitSeconds)),(!Number.isFinite(F)||F<=0)&&(F=45)),Math.min(6e4,Math.round(F*1e3))}async function J(){if(!n.active||n.aborted||n.pullInFlight)return;let S=Date.now();if(!(S-(n.pullAt||0)<5e3)){n.pullAt=S,n.pullInFlight=!0;try{let F=await yo(),V=Wo(F);V.length&&(n.hiRes=Go(n.hiRes||[],V),Be(n.hiRes))}catch(F){}finally{n.pullInFlight=!1}}}function me(){let S=sa(l.stroke);ne.current.textContent=l.current==null?"\u2014":l.current.toFixed(1)+" mA",ne.mean.textContent=l.mean==null?"\u2014":l.mean.toFixed(1)+" mA",ne.peak.textContent=l.peak==null?"\u2014":l.peak.toFixed(1)+" mA",ne.slope.textContent=l.slope==null?"\u2014":l.slope.toFixed(1)+" mA/s",ne.runtime.textContent=l.runtime?(l.runtime/1e3).toFixed(1)+" s":"\u2014",ne.motion.textContent=l.motion?String(l.motion):"\u2014",ne.cadence.textContent=l.cadenceHz==null?"\u2014":l.cadenceHz.toFixed(1)+" /s",ne.direction.textContent=l.direction,ne.drivers.textContent=an(l.driversEnabled!=null?l.driversEnabled:fe(i.drivers)),ne.busy.textContent=an(l.busy),ne.armed.textContent=an(l.armed);let F=Ft(l.backend),V=ne.pad10&&ne.pad10.parentElement.querySelector("span"),Z=ne.pad9&&ne.pad9.parentElement.querySelector("span");V&&(V.textContent=c(F?"diagnostics.lab.pad10":"diagnostics.lab.pad10nsleep")),Z&&(Z.textContent=c(F?"diagnostics.lab.pad9":"diagnostics.lab.pad9fault")),ne.pad10&&(ne.pad10.textContent=on(l.latchArmLevel)),ne.pad9&&(ne.pad9.textContent=on(l.latchStateLevel)),ne.pad11&&(ne.pad11.textContent=on(l.motorEnableLevel)),ne.backend.textContent=l.backend||"\u2014",ne.fault.textContent=l.latchFaulted?c("diagnostics.lab.faultLatch"):l.faultCode?String(l.faultCode):c("common.ok"),ne.invalid.textContent=String(l.invalidSamples||0),ne.tachoRejected.textContent=String(l.tachoRejected||0),ne.stroke.textContent=c("diagnostics.lab.stroke."+S),ne.stroke.dataset.phase=S,l.pinSeen?(ne.pin.textContent=c("diagnostics.lab.pinSeen",{count:l.pinAt}),ne.pin.dataset.seen="true"):(ne.pin.textContent=c("diagnostics.lab.pinWaiting"),ne.pin.dataset.seen="false")}function j(){let S=d.analysis?Jr(d.analysis,rs(d.analysis.direction)):[],F=os(N,{samples:d.samples,analysis:d.analysis,live:d.live,overlays:S,visible:u});F&&F.addEventListener("click",V=>{let Z=V.target.closest(".gw-toggle");if(!Z)return;let I=Z.dataset.layer;u[I]=!u[I],Object.keys(u).some(pe=>u[pe])||(u[I]=!0),j()})}function ge(S,F,V){d={analysis:S&&S.ok?S:null,samples:F||[],live:!!V},Be(d.samples),d.analysis&&(l.mean=d.analysis.mean_ma,l.peak=d.analysis.peak_ma,l.slope=d.analysis.max_stall_slope_ma_s),j();let Z=[];if(o==="review"?(s.open&&Z.push(...ua(s.open)),s.close&&Z.push(...ua(s.close))):d.analysis&&Z.push(...ua(d.analysis)),!d.analysis&&o!=="review"){te.innerHTML="",oe.hidden=!0;return}let I=o==="review"?s.close||s.open:d.analysis;if(!I){te.innerHTML="",oe.hidden=!0;return}let G=I.pin_seen?c("diagnostics.lab.pinMetric",{ms:I.pin_t_ms,count:I.pin_motion_count}):c("diagnostics.lab.pinWaiting"),pe=[[c("diagnostics.lab.mean"),I.mean_ma.toFixed(1)+" mA"],[c("diagnostics.lab.peak"),I.peak_ma.toFixed(1)+" mA"],[c("diagnostics.lab.runtime"),(I.runtime_ms/1e3).toFixed(1)+" s"],[c("diagnostics.lab.ripples"),String(I.ripples)],[c("diagnostics.lab.pin"),G]];if(o==="review"&&s.open&&s.close){pe[0]=[c("diagnostics.lab.mean"),s.open.mean_ma.toFixed(1)+" / "+s.close.mean_ma.toFixed(1)+" mA"],pe[1]=[c("diagnostics.lab.peak"),s.open.peak_ma.toFixed(1)+" / "+s.close.peak_ma.toFixed(1)+" mA"];let he=s.close.pin_seen?c("diagnostics.lab.pinMetric",{ms:s.close.pin_t_ms,count:s.close.pin_motion_count}):c("diagnostics.lab.pinWaiting");pe[4]=[c("diagnostics.lab.pin"),he]}te.innerHTML=pe.map(he=>'<div class="lab-metric"><span>'+he[0]+"</span><strong>"+he[1]+"</strong></div>").join(""),oe.querySelector("tbody").innerHTML=Z.map(he=>"<tr><td>"+c(he.labelKey)+"</td><td>"+Number(he.current).toFixed(1)+" "+he.unit+'</td><td class="better">'+Number(he.suggested).toFixed(1)+" "+he.unit+"</td></tr>").join(""),oe.hidden=!Z.length}function de(){let S=o==="halted",F=S?"setup":o,V=ha(F),Z=S?"halted":"active";f.dataset.state=Z,f.textContent=S?c("diagnostics.lab.halted"):c("diagnostics.lab.stepChip",{step:V+1,total:pa.length,name:c("diagnostics.lab.steps."+F)}),E.textContent=S?c("diagnostics.lab.halted"):c("diagnostics.lab.stepOf",{step:V+1,total:pa.length});let I=!S&&F==="arm"&&!Ft(l.backend)?"enable":S?"halt":F;_.textContent=c("diagnostics.lab."+I+".title");let G=o==="seat"&&s.seat||o==="open"&&s.open||o==="close"&&s.close,pe=S?"diagnostics.lab.halt.copy":G?"diagnostics.lab."+F+".done":"diagnostics.lab."+I+".copy";g.textContent=c(pe);let he=o==="setup";L.dataset.setup=he?"true":"false",m.hidden=!he,b.disabled=!he||n.active,x.hidden=he,x.textContent=Xt(),B.dataset.armed=n.active?"true":"false",me();let ze=n.active,Se={key:"diagnostics.lab.next",disabled:ze,action:"next"},re=null;o==="setup"?Se={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:o==="arm"?Se={key:Ft(l.backend)?"diagnostics.lab.arm.action":"diagnostics.lab.enable.action",disabled:ze,action:"arm"}:o==="seat"?Se={key:s.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:ze,action:s.seat?"next":"seat"}:o==="open"?Se={key:s.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:ze,action:s.open?"next":"open"}:o==="close"?Se={key:s.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:ze,action:s.close?"next":"close"}:o==="review"?(Se={key:"diagnostics.lab.apply",disabled:!(s.open||s.close),action:"apply"},re={key:"diagnostics.lab.restart",action:"restart"}):S&&(Se={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),ze&&(Se={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!ze&&(o==="seat"||o==="open"||o==="close")&&!s[o==="seat"?"seat":o]&&r==="failed"&&(Se={key:"diagnostics.lab.retry",disabled:!1,action:o}),!ze&&G&&(o==="seat"||o==="open"||o==="close")&&(re={key:"diagnostics.lab.restart",action:"restart"}),le.dataset.action=Se.action,le.disabled=!!Se.disabled,le.textContent=c(Se.key),re?(q.hidden=!1,q.dataset.action=re.action,q.textContent=c(re.key)):(q.hidden=!0,q.dataset.action="")}function xe(S){Oe("motorLabBusy",!!S)}function Re(){n.timer&&clearTimeout(n.timer),n.timer=null}function Ze(S){if(o=S,(S==="arm"||S==="setup")&&Ue(""),S==="review"){xe(!1);let F=s.close||s.open;ge(F,F?F.samples:[],!1),ve("done","ok")}else S==="setup"&&(xe(!1),ge(null,[],!1));de()}async function We(){if(!n.active){xe(!0),n.active=!0,ve("arming","run"),de(),Q("diagnostics.lab.log.arming",{zone:a});try{if(P("manualMode")||(Oe("manualMode",!0),await It(!0),Q("diagnostics.lab.log.manual")),n.aborted)return;let S=await Ct(),F=S&&S.data&&S.data.motor_safety?S.data.motor_safety:{};if(l.backend=F.backend||l.backend,me(),Ft(l.backend)){Q("diagnostics.lab.log.armProbeWait");let I=await vo({hz:100,durationMs:4e3});if(n.aborted)return;let G=I&&I.data?I.data:{};if(Q("diagnostics.lab.log.armProbe",{hz:G.hz||100,cycles:G.cycles||0,armed:G.armed?c("common.on"):c("common.off"),at:G.armed_at_cycle||0}),l.armed=!!G.armed,l.latchFaulted=!G.armed,me(),!G.armed)throw Ue(c("diagnostics.lab.latchBanner")),new Error("latch")}else Q("diagnostics.lab.log.enableWait");await Dt(!0),Q("diagnostics.lab.log.drivers");let V=Date.now()+4e3,Z=!1;for(;Date.now()<V;){if(n.aborted)return;let I=await Ct(),G=I&&I.data?I.data:{},pe=G.motor_safety||{};if(l.driversEnabled=G.drivers_enabled!=null?!!G.drivers_enabled:l.driversEnabled,l.armed=!!pe.armed,l.latchFaulted=!!pe.latch_faulted,l.backend=pe.backend||l.backend,l.latchArmLevel=pe.latch_arm_level,l.latchStateLevel=pe.latch_state_level,l.motorEnableLevel=pe.motor_enable_level,me(),G.drivers_enabled&&!pe.latch_faulted){Z=!0;break}await new Promise(he=>setTimeout(he,tn))}if(!Z){let I=Ft(l.backend);throw Ue(c(I?"diagnostics.lab.latchBanner":"diagnostics.lab.enableBanner")),new Error(I?"latch":"enable")}ve("armed","ok"),Q("diagnostics.lab.log.armed"),n.active=!1,Ze("seat")}catch(S){n.active=!1,xe(!1),ve("failed","halt"),Q(S&&S.message==="arm_gpio"?"diagnostics.lab.log.armGpio":S&&S.message==="latch"?"diagnostics.lab.log.latchFaulted":S&&S.message==="enable"?"diagnostics.lab.log.enableFailed":"diagnostics.lab.log.armFailed"),de()}}}async function pt(S,F){let V=n.live.slice(),Z=[];for(let tt=0;tt<6;tt++){if(n.aborted)return;try{ve("fetching","run"),de();let at=await yo();Q("diagnostics.lab.log.trace"),Z=Wo(at);break}catch(at){if(at&&at.code==="motor_busy"){await new Promise(ao=>setTimeout(ao,250));continue}Q("diagnostics.lab.log.traceFailed");break}}Z.length&&(n.hiRes=Go(n.hiRes||[],Z));let I=n.hiRes||[],G=V.length&&Number(V[V.length-1].t_ms)||0,pe=Z.length&&Number(Z[Z.length-1].t_ms)||0,he=I.length&&Number(I[I.length-1].t_ms)||0,ze=I.length?I:V.length?V:Z,Se=Z.length>=8&&pe>=Math.max(400,Math.max(G,he)*.45)?Z:ze;if(!ze.length){ve("failed","halt"),Q("diagnostics.lab.log.traceFailed"),ge(null,[],!1);return}let re=Yr(Se,S);if(F&&(s[F]=re.ok?re:null),ge(re,ze,!1),!re.ok)ve("failed","halt"),re.reason==="no_endstop"?Q("diagnostics.lab.log.noEndstop",{direction:c("diagnostics.lab.dir."+S),seconds:((re.runtime_ms||0)/1e3).toFixed(0)}):Q(F==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),F==="seat"&&(s.seat={short:!0},Q("diagnostics.lab.log.seatContinue"));else{if(ve("done","ok"),Q("diagnostics.lab.log.captured",{direction:c("diagnostics.lab.dir."+re.direction),peak:re.peak_ma.toFixed(1)}),re.pin_seen){let tt=l.pinSeen;l.pinSeen=!0,l.pinAt=re.pin_motion_count,l.pinMa=re.pin_current_ma,l.stroke=1,tt||Q("diagnostics.lab.log.pinTrace",{count:re.pin_motion_count,ma:re.pin_current_ma.toFixed(1),ms:re.pin_t_ms})}else(F==="close"||F==="seat")&&Q("diagnostics.lab.log.pinMissing");(he>pe+250||G>pe+250)&&Q("diagnostics.lab.log.browserLog",{seconds:(Math.max(he,G)/1e3).toFixed(1)})}}function ut(S){let F=S.map(Z=>Z.current_ma).filter(Number.isFinite);if(!F.length)return;let V=F.reduce((Z,I)=>Z+I,0);if(l.mean=Math.round(V/F.length*10)/10,l.peak=Math.round(Math.max(...F)*10)/10,S.length>=2){let Z=S[Math.max(0,S.length-3)],I=S[S.length-1],G=(I.t_ms-Z.t_ms)/1e3;G>.05&&(l.slope=Math.round((I.current_ma-Z.current_ma)/G*10)/10)}}async function _e(S,F){if(!n.active){n={active:!0,aborted:!1,direction:S,timer:null,live:[],hiRes:[],started:Date.now(),pullAt:0,pullInFlight:!1,chartAt:0},xe(!0),l=nn(),l.direction=c("diagnostics.lab.dir."+S),ve("starting","run"),de(),ge(null,[],!0),Be([]),Q("diagnostics.lab.log.starting",{direction:c("diagnostics.lab.dir."+S),zone:a});try{try{await Ta(a),Q("diagnostics.lab.log.resetLearned")}catch(ze){Q("diagnostics.lab.log.resetLearnedFailed")}if(n.aborted)return;let V=ee(),Z=V+8e3;if(Q("diagnostics.lab.log.duration",{seconds:(V/1e3).toFixed(0)}),S==="open"?await Aa(a,V):await Ea(a,V),n.aborted)return;ve("waiting","run"),de();let I=!1,G=!1,pe=()=>{G||n.aborted||!n.active||(n.timer=setTimeout(he,tn))},he=async()=>{if(!(G||n.aborted||!n.active)){try{let ze=await Ct();if(G||n.aborted||!n.active)return;let Se=ze&&ze.data?ze.data:{},re=Se.motor_safety||{},tt=Number(re.current_ma),at=!!re.motor_busy,ao=re.drive_on!=null?!!re.drive_on:at;at&&!I&&(I=!0,ve("running","run"),Q("diagnostics.lab.log.busy")),l.busy=at,l.runtime=Date.now()-n.started,l.motion=Number(re.motion_evidence_count)||l.motion,l.stroke=Number(re.stroke_phase)||0,l.tachoPeriodUs=Number(re.tacho_period_us)||l.tachoPeriodUs,l.tachoCadenceUs=Number(re.tacho_cadence_us)||l.tachoCadenceUs;let mn=l.tachoPeriodUs||l.tachoCadenceUs;l.cadenceHz=mn>0?1e6/mn:null,l.faultCode=Number(re.fault_code)||0,l.armed=!!re.armed,l.latchFaulted=!!re.latch_faulted,l.latchArmLevel=re.latch_arm_level,l.latchStateLevel=re.latch_state_level,l.motorEnableLevel=re.motor_enable_level,l.driversEnabled=Se.drivers_enabled!=null?!!Se.drivers_enabled:l.driversEnabled,l.backend=re.backend||l.backend,l.invalidSamples=Number(re.invalid_samples)||0,l.tachoRejected=Number(re.tacho_rejected)||0,!l.pinSeen&&(l.stroke===1||l.stroke===2)&&(l.pinSeen=!0,l.pinAt=l.motion,l.pinMa=Number.isFinite(tt)?tt:l.current,Q("diagnostics.lab.log.pin",{count:l.pinAt,ma:Number(l.pinMa||0).toFixed(1)})),Number.isFinite(tt)&&(l.current=tt,n.live.push({t_ms:Date.now()-n.started,current_ma:tt,motion_count:l.motion,drive_on:ao,direction_open:S==="open",stroke_phase:l.stroke,tacho_period_us:l.tachoPeriodUs,tacho_cadence_us:l.tachoCadenceUs,armed:l.armed,fault_code:l.faultCode,backend:l.backend}),ut(n.live)),at&&J(),me();let oo=Date.now();if(oo-(n.chartAt||0)>=Nl){n.chartAt=oo;let xs=n.hiRes.length?n.hiRes:Ko(n.live,2);ge(null,xs,!0)}let gn=oo-n.started;if(!I&&gn>Rl){G=!0,Re(),n.active=!1,ve("failed","halt"),re.latch_faulted?(Ue(c("diagnostics.lab.latchBanner")),Q("diagnostics.lab.log.latchFaulted")):Q("diagnostics.lab.log.neverStarted"),de();return}if(I&&!at||gn>Z){G=!0,Re(),l.busy=!1,I&&Q("diagnostics.lab.log.stopped"),n.active=!1,await pt(S,F),de();return}}catch(ze){if(Date.now()-n.started>Z){G=!0,Re(),n.active=!1,ve("failed","halt"),Q("diagnostics.lab.log.traceFailed"),de();return}}pe()}};he()}catch(V){n.active=!1,ve("failed","halt"),Q("diagnostics.lab.log.startFailed"),de()}}}function Nt(){Re(),xe(!1),n={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1,chartAt:0},s={open:null,close:null,seat:null},l=nn(),v.length=0,z.innerHTML="",Ue(""),Be([]),ve("idle"),Ze("setup")}async function mt(){n.aborted=!0,n.active=!1,Re(),xe(!1),l.busy=!1,Ue(c("diagnostics.lab.estopDone")),ve("halted","halt"),Q("diagnostics.lab.log.estop"),o="halted",de();try{await Bn()}catch(S){}me()}function Ke(){let S=ha(o);S<0||S>=pa.length-1||Ze(pa[S+1])}function ot(S){if(S==="start"){xe(!0),Q("diagnostics.lab.log.selected",{zone:a}),Ze("arm");return}if(S==="arm")return We();if(S==="seat")return _e("close","seat");if(S==="open")return _e("open","open");if(S==="close")return _e("close","close");if(S==="next")return Ke();if(S==="restart")return Nt();if(S==="apply"){let F=[];s.open&&F.push(...ua(s.open)),s.close&&F.push(...ua(s.close)),F.forEach(V=>Pe(V.key,V.suggested)),ve("applied","ok"),Q("diagnostics.lab.log.applied"),de()}}le.addEventListener("click",()=>ot(le.dataset.action)),q.addEventListener("click",()=>ot(q.dataset.action)),B.addEventListener("click",mt),X.addEventListener("click",()=>{if(!p.length)return;let S=n.direction||"trace";Gr(p,"motor-lab-z"+a+"-"+S+".csv")}),b.addEventListener("change",()=>{a=Number(b.value||1),x.textContent=Xt()});function Yt(S){S.key==="Escape"&&P("section")==="motorlab"&&(S.preventDefault(),mt())}window.addEventListener("keydown",Yt),va(),H(),T(),ve("idle"),ge(null,[],!1),de(),Ct().then(S=>{let F=S&&S.data&&S.data.motor_safety?S.data.motor_safety:{};l.backend=F.backend||l.backend,l.armed=!!F.armed,l.latchFaulted=!!F.latch_faulted,l.latchArmLevel=F.latch_arm_level,l.latchStateLevel=F.latch_state_level,l.motorEnableLevel=F.motor_enable_level,S&&S.data&&S.data.drivers_enabled!=null&&(l.driversEnabled=!!S.data.drivers_enabled),de()}).catch(()=>{}),C(i.drivers,me);for(let S of rn)C(S.id,()=>{T(),d.analysis&&j()});U("manualMode",me),U("selectedZone",()=>{o==="setup"&&(a=Number(P("selectedZone")||a),b.value=String(a))}),R(e)}});var $l=`
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
`;D("diag-system-card",$l);var Il=()=>`
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
        <div class="sys-label" data-i18n="diagnostics.system.dma">Free DMA</div>
        <div class="sys-value" data-k="dma">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.largestInternal">Largest free (int)</div>
        <div class="sys-value" data-k="largestInternal">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.minInternal">Min free (int)</div>
        <div class="sys-value" data-k="minInternal">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.psram">Free PSRAM</div>
        <div class="sys-value" data-k="psram">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.largestPsram">Largest free PSRAM</div>
        <div class="sys-value" data-k="largestPsram">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.bleAds">BLE ads/s</div>
        <div class="sys-value" data-k="bleAds">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.bleLastAdv">BLE last adv</div>
        <div class="sys-value" data-k="bleLastAdv">\u2014</div>
      </div>
      <div class="sys-cell sys-cell-wide">
        <div class="sys-label" data-i18n="diagnostics.system.bleState">BLE radio</div>
        <div class="sys-value sys-value-text" data-k="bleState">\u2014</div>
      </div>
      <div class="sys-cell sys-cell-wide">
        <div class="sys-label" data-i18n="diagnostics.system.resetReason">Last reset reason</div>
        <div class="sys-value sys-value-text" data-k="reset">\u2014</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button" data-i18n="diagnostics.system.dump">Dump task stats to log</button>
    <div class="ui-note" data-i18n="diagnostics.system.note">Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.</div>
  </div>
`,Ju=O({tag:"diag-system-card",render:Il,onMount(t,e){let a=e.querySelector('[data-k="cpu0"]'),o=e.querySelector('[data-k="cpu1"]'),r=e.querySelector('[data-k="heap"]'),n=e.querySelector('[data-k="dma"]'),s=e.querySelector('[data-k="largestInternal"]'),d=e.querySelector('[data-k="minInternal"]'),p=e.querySelector('[data-k="psram"]'),u=e.querySelector('[data-k="largestPsram"]'),v=e.querySelector('[data-k="bleAds"]'),l=e.querySelector('[data-k="bleLastAdv"]'),f=e.querySelector('[data-k="bleState"]'),x=e.querySelector('[data-bar="cpu0"]'),w=e.querySelector('[data-bar="cpu1"]'),L=e.querySelector('[data-k="reset"]'),E=(b,y,z)=>{if(z==null||!Number.isFinite(Number(z))){b.textContent="\u2014",b.classList.remove("warn"),y.style.width="0%";return}let N=Math.max(0,Math.min(100,Number(z)));b.textContent=N.toFixed(0)+"%",b.classList.toggle("warn",N>=90),y.style.width=N+"%"},_=(b,y,z)=>{if(y==null||!Number.isFinite(Number(y))){b.textContent="\u2014";return}let N=Number(y);b.textContent=N+" KB",b.classList.toggle("warn",z!=null&&N<z)},g=b=>{if(b==null||!Number.isFinite(Number(b))||Number(b)<=0)return"\u2014";let y=Number(b);return y<1e3?Math.round(y)+" ms":y<6e4?(y/1e3).toFixed(1)+" s":Math.round(y/6e4)+" min"},m=()=>{E(a,x,A(i.cpuLoadCore0)),E(o,w,A(i.cpuLoadCore1)),_(r,A(i.freeInternalKb),48),_(n,A(i.freeDmaKb),32),_(s,A(i.largestInternalKb),24),_(d,A(i.minInternalKb),48),_(p,A(i.freePsramKb),null),_(u,A(i.largestPsramKb),null);let b=A(i.bleAdsPerSec);b==null||!Number.isFinite(Number(b))?v.textContent="\u2014":v.textContent=Number(b).toFixed(1)+"/s",l.textContent=g(A(i.bleLastAdvAgeMs));let y=M(i.bleDemanded)==="on",z=M(i.bleHubEnabled)==="on",N=M(i.bleScanning)==="on",X=[];X.push(y?"demanded":"idle"),z?X.push(N?"scanning":"on"):X.push("off"),f.textContent=X.join(" \xB7 ");let $=String(M(i.resetReason)||P("resetReason")||"").trim();L.textContent=$||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{Un().catch(b=>console.error("[System] dump failed:",b))}),C(i.cpuLoadCore0,m),C(i.cpuLoadCore1,m),C(i.freeInternalKb,m),C(i.freeDmaKb,m),C(i.largestInternalKb,m),C(i.minInternalKb,m),C(i.freePsramKb,m),C(i.largestPsramKb,m),C(i.bleAdsPerSec,m),C(i.bleLastAdvAgeMs,m),C(i.bleHubEnabled,m),C(i.bleScanning,m),C(i.bleDemanded,m),C(i.resetReason,m),U("resetReason",m),R(e),m()}});var ss=`
.lds-int-split,
.int-split {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 22rem);
  gap: 32px;
  padding-top: 22px;
  align-items: start;
}
@media (max-width: 900px) {
  .lds-int-split,
  .int-split {
    grid-template-columns: 1fr;
  }
}
`;function Ya({liveHtml:t="",provisionHtml:e="",attrs:a=""}={}){return`<div class="lds-int-split int-split" data-lds-int-split ${a}>${t}${e}</div>`}var sn="hv6_available_probes",ln=new Set,et=2,dn=8;function ma(t){let e=Number(t);return Number.isFinite(e)&&e>=dn?dn:et}function Hl(t){return t?dn:et}function lt(){try{return ma(localStorage.getItem(sn)||et)}catch(t){return et}}function Ol(t){let e=ma(t),a=et;try{a=ma(localStorage.getItem(sn)||et)}catch(o){a=et}if(e===a)return e;try{localStorage.setItem(sn,String(e))}catch(o){}for(let o of ln)o(e);return e}function is(t){return Ol(Hl(t))}function Ja(t){return ln.add(t),()=>ln.delete(t)}function it(t){let e=String(t||"").match(/(\d+)/);return e?Number(e[1]):0}function ql(t,e){let a=`Probe ${t}`;return e==null||Number.isNaN(Number(e))?a:`${a} \xB7 ${(Math.round(Number(e)*10)/10).toFixed(1)}\xB0`}function Kt({includeNone:t=!1,count:e=lt(),temps:a=null}={}){let o=ma(e),r=t?'<option value="None" data-i18n="common.none">None</option>':"";for(let n=1;n<=o;n++){let s=a?a[n]:null,d=ql(n,s);r+=`<option value="Probe ${n}">${d}</option>`}return r}function dt(t,e=lt(),a=null){let o=ma(e),r=String(t||"").match(/(\d+)/);if(!r)return a||t;let n=Number(r[1]);return n>=1&&n<=o?`Probe ${n}`:a||`Probe ${o}`}function Qa({flow:t,return:e,zoneProbes:a}){let o=Object.create(null),r=it(t),n=it(e);r&&(o[r]="flow"),n&&(o[n]=o[n]?"flow+return":"return");for(let s=1;s<=6;s++){let d=it(a&&a[s]);d&&(o[d]=o[d]?`${o[d]}+Z${s}`:`Z${s}`)}return o}function ga(t,e,a){let o=it(t);if(!o)return!1;let r=e[o];return r?a?r!==a&&!String(r).split("+").includes(a):!0:!1}var Bl=`
.settings-manifold-card .lds-int-split,
.settings-manifold-card .int-split {
  padding-top: 0;
  gap: 28px;
}
.settings-manifold-card .sm-probe-warn {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--state-warn);
  background: color-mix(in srgb, var(--warn) 10%, transparent);
  color: var(--text-muted);
  font-size: .78rem;
  line-height: 1.35;
}
.settings-manifold-card .sm-probe-warn[hidden] { display: none; }
.settings-manifold-card .sm-probe-err {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--state-danger);
  background: color-mix(in srgb, var(--state-danger) 8%, transparent);
  color: var(--state-danger);
  font-size: .78rem;
  font-weight: 650;
}
.settings-manifold-card .sm-probe-err[hidden] { display: none; }
.settings-manifold-card .sm-probe-live {
  min-width: 0;
}
.settings-manifold-card .sm-strip-label {
  margin: 0 0 10px;
  color: var(--text-faint);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.settings-manifold-card .sm-probe-list {
  display: grid;
  gap: 0;
  max-width: 18rem;
}
.settings-manifold-card .sm-probe-row {
  display: grid;
  grid-template-columns: 2rem minmax(3.6rem, auto) minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  min-height: 28px;
  padding: 5px 0;
  border-bottom: 1px solid var(--separator);
}
.settings-manifold-card .sm-probe-row:last-child { border-bottom: 0; }
.settings-manifold-card .sm-probe-row.is-hidden { display: none; }
.settings-manifold-card .sm-probe-row.is-empty .sm-probe-temp {
  color: var(--text-faint);
  font-weight: 560;
}
.settings-manifold-card .sm-probe-row.is-role .sm-probe-id {
  color: var(--accent);
}
.settings-manifold-card .sm-probe-id {
  color: var(--text-muted);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .02em;
}
.settings-manifold-card .sm-probe-temp {
  color: var(--text-strong);
  font-family: var(--font-display, var(--mono));
  font-size: 1.02rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.settings-manifold-card .sm-probe-role {
  overflow: hidden;
  color: var(--accent);
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-manifold-card .sm-probe-settings {
  min-width: 0;
  padding-left: 24px;
  border-left: 1px solid var(--separator);
}
.settings-disclosure .settings-manifold-card .sm-probe-settings .ui-row {
  display: grid;
  grid-template-columns: minmax(5.5rem, .95fr) minmax(0, 1.15fr);
  gap: 10px;
  align-items: center;
  padding: 0 0 10px;
}
.settings-disclosure .settings-manifold-card .sm-probe-settings .ui-label {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-disclosure .settings-manifold-card .sm-probe-settings .ui-field {
  width: auto;
  min-width: 0;
}
.settings-manifold-card .sm-probe-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
@media (max-width: 900px) {
  .settings-manifold-card .sm-probe-settings {
    padding-left: 0;
    border-left: 0;
    padding-top: 16px;
    border-top: 1px solid var(--separator);
  }
}
.settings-manifold-card .sm-live {
  min-width: 4.5rem;
  padding: 0 2px 0 0;
  color: var(--text-strong);
  font-family: var(--font-display, var(--mono));
  font-size: 1.05rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: var(--control-compact, 32px);
  text-align: right;
}
.settings-manifold-card .sm-live.is-empty { color: var(--text-faint); font-weight: 560; }
.settings-manifold-card .sm-return-slot {
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--separator);
}
.settings-disclosure .settings-manifold-card .sm-return-slot {
  margin-top: 4px;
  padding-top: 12px;
}
`;D("settings-manifold-card",Bl);function ls(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}function cn(t){return it(t)}function jl(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=A(h.probeTemp(e));return t}function Vl(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=M(h.probe(e));return t}var Ul=()=>{let t=lt(),e=Kt({count:t}),a="";for(let o=1;o<=8;o++)a+=`<div class="sm-probe-row${o>t?" is-hidden":""}" data-probe-row="${o}">
      <span class="sm-probe-id">P${o}</span>
      <span class="sm-probe-temp" data-probe="${o}">\u2014</span>
      <span class="sm-probe-role" data-probe-role="${o}"></span>
    </div>`;return ye({className:"settings-manifold-card",titleHtml:`<span data-i18n="settings.manifold.title">Manifold Configuration</span>${Le("settings.manifold.help")}`,bodyHtml:Ya({liveHtml:`<div class="sm-probe-live">
        <div class="sm-strip-label" data-i18n="settings.manifold.probeTemps">Probe temperatures</div>
        <div class="sm-probe-list" data-count="${t}">${a}</div>
      </div>`,provisionHtml:`<div class="sm-probe-settings">
        <div class="sm-probe-err" hidden data-probe-err></div>
        <div class="sm-probe-warn" hidden data-probe-warn></div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="settings.manifold.type">Manifold Type</span>
          <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)" data-i18n="settings.manifold.normallyOpen">Normally Open (NO)</option><option value="NC (Normally Closed)" data-i18n="settings.manifold.normallyClosed">Normally Closed (NC)</option></select></span>
        </div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="settings.manifold.flowProbe">Flow Probe</span>
          <span class="ui-field"><div class="sm-probe-pair"><select class="ui-select sm-flow">${e}</select><span class="sm-live sm-flow-live">\u2014</span></div></span>
        </div>
        <div class="ui-row">
          <span class="ui-label" data-i18n="settings.manifold.returnProbe">Return Probe</span>
          <span class="ui-field"><div class="sm-probe-pair"><select class="ui-select sm-ret">${e}</select><span class="sm-live sm-ret-live">\u2014</span></div></span>
        </div>
        <div class="sm-return-slot return-temp-slot" data-collapse-body="return-temp"></div>
      </div>`})})},pm=O({tag:"settings-manifold-card",render:Ul,onMount(t,e){let a=e.querySelector(".sm-type"),o=e.querySelector(".sm-flow"),r=e.querySelector(".sm-ret"),n=e.querySelector(".sm-flow-live"),s=e.querySelector(".sm-ret-live"),d=e.querySelector(".sm-probe-list"),p=e.querySelector("[data-probe-err]"),u=e.querySelector("[data-probe-warn]"),v=Me(e,{immediate:!0});v.select(a,{read:()=>M(i.manifoldType)||"NO (Normally Open)",commit:m=>Fe("manifold_type",m)});function l(m){return Qa({flow:m==="flow"?null:o.value||M(i.manifoldFlowProbe),return:m==="return"?null:r.value||M(i.manifoldReturnProbe),zoneProbes:Vl()})}function f(m){p&&(p.hidden=!m,p.textContent=m||"")}v.select(o,{read:()=>dt(M(i.manifoldFlowProbe)||"Probe 1",lt(),"Probe 1"),commit:async m=>{if(ga(m,l("flow"),"flow")){f(c("settings.manifold.probeConflict")),v.refresh();return}f("");try{await Fe("manifold_flow_probe",m)}catch(b){f(c("settings.manifold.probeConflict")),v.refresh()}}}),v.select(r,{read:()=>dt(M(i.manifoldReturnProbe)||"Probe 2",lt(),"Probe 2"),commit:async m=>{if(ga(m,l("return"),"return")){f(c("settings.manifold.probeConflict")),v.refresh();return}f("");try{await Fe("manifold_return_probe",m)}catch(b){f(c("settings.manifold.probeConflict")),v.refresh()}}});function x(m,b,y){return m===b&&m===y?c("settings.manifold.roleBoth"):m===b?c("settings.manifold.roleFlow"):m===y?c("settings.manifold.roleReturn"):""}function w(m,b){let y=ls(b);m.textContent=y,m.classList.toggle("is-empty",y==="\u2014")}function L(m){let b=Kt({count:m,temps:jl()});for(let y of[o,r]){let z=y.value,N=y===o?"Probe 1":"Probe 2";y.innerHTML=b,y.value=dt(z,m,N)}m>=2&&o.value===r.value&&(r.value=o.value==="Probe 1"?"Probe 2":"Probe 1")}function E(){if(!u)return;let m=0,b=0;for(let z=1;z<=6;z++){let N=String(M(h.enabled(z))||"").toLowerCase()==="on";N&&b++;let X=cn(M(h.probe(z)));N&&X>=3&&m++}let y=m>0&&b>m;u.hidden=!y,y&&(u.textContent=c("settings.manifold.unusedProbeWarn",{enabled:b,assigned:m}))}function _(m,{commitClamp:b=!1}={}){d&&(d.dataset.count=String(m)),L(m);for(let y=1;y<=8;y++){let z=e.querySelector('[data-probe-row="'+y+'"]');z&&z.classList.toggle("is-hidden",y>m)}if(b){let y=dt(o.value||M(i.manifoldFlowProbe)||"Probe 1",m,"Probe 1"),z=dt(r.value||M(i.manifoldReturnProbe)||"Probe 2",m,"Probe 2");m>=2&&y===z&&(z=y==="Probe 1"?"Probe 2":"Probe 1"),y!==M(i.manifoldFlowProbe)&&Fe("manifold_flow_probe",y),z!==M(i.manifoldReturnProbe)&&Fe("manifold_return_probe",z),o.value=y,r.value=z}g()}function g(){let m=cn(o.value||M(i.manifoldFlowProbe)),b=cn(r.value||M(i.manifoldReturnProbe));w(n,m?A(h.probeTemp(m)):null),w(s,b?A(h.probeTemp(b)):null);let y=lt();d&&(d.dataset.count=String(y));for(let z=1;z<=8;z++){let N=e.querySelector('[data-probe-row="'+z+'"]'),X=e.querySelector('[data-probe="'+z+'"]'),$=e.querySelector('[data-probe-role="'+z+'"]'),te=A(h.probeTemp(z)),oe=ls(te),le=x(z,m,b);X&&(X.textContent=oe),$&&($.textContent=le),N&&(N.classList.toggle("is-empty",oe==="\u2014"),N.classList.toggle("is-role",!!le),N.classList.toggle("is-hidden",z>y))}E()}o.addEventListener("change",g),r.addEventListener("change",g),C(i.manifoldType,v.refresh),C(i.manifoldFlowProbe,()=>{v.refresh(),g()}),C(i.manifoldReturnProbe,()=>{v.refresh(),g()});for(let m=1;m<=8;m++)C(h.probeTemp(m),()=>{L(lt()),g()});for(let m=1;m<=6;m++)C(h.probe(m),E),C(h.enabled(m),E);Ja(m=>{_(m,{commitClamp:!1}),v.refresh()}),R(e),_(lt()),v.refresh(),g()}});var Zl=`
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
`;D("settings-touch-card",Zl);var Wl=()=>ye({className:"settings-touch-card",titleHtml:"Lune Touch connection",bodyHtml:`
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
  `}),xm=O({tag:"settings-touch-card",render:Wl,onMount(t,e){let a=e.querySelector(".touch-status"),o=e.querySelector(".touch-status-copy"),r=e.querySelector(".touch-identity"),n=e.querySelector(".touch-note"),s=e.querySelector(".touch-error"),d=e.querySelector(".touch-approve"),p=e.querySelector(".touch-disconnect");function u(){let v=fe(i.authorityConfigured),l=fe(i.authorityProposalPending),f=M(i.authorityState)||"unconfigured",x=l?M(i.authorityProposalInstallationId):M(i.authorityInstallationId),w=l?M(i.authorityProposalCoordinatorId):M(i.authorityCoordinatorId),L=M(i.authorityProposalName)||"Lune Touch",E=M(i.authorityProposalSite)||"House";a.classList.toggle("connected",v&&!l),a.classList.toggle("pending",l),o.innerHTML=l?`<strong>${L} is ready to connect</strong>${v?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:v?`<strong>Control approved</strong>${f.replace(/_/g," ")}${Number(A(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(A(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",r.hidden=!v&&!l,e.querySelector(".touch-name").textContent=l?L:"Lune Touch",e.querySelector(".touch-site").textContent=l?E:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=x||"\u2014",e.querySelector(".touch-coordinator-value").textContent=w||"\u2014",n.textContent=l?"Approval is local to this manifold. Discovery alone never grants control.":v?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",d.hidden=!l,p.hidden=!v||l}d.addEventListener("click",async()=>{s.textContent="",d.disabled=!0,d.textContent="Approving\u2026";try{await $n()}catch(v){s.textContent=(v==null?void 0:v.message)||"Unable to approve Lune Touch."}finally{d.disabled=!1,d.textContent="Approve Lune Touch"}}),p.addEventListener("click",async()=>{if(s.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){p.disabled=!0;try{await In()}catch(v){s.textContent=(v==null?void 0:v.message)||"Unable to disconnect Lune Touch."}finally{p.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(v=>C(v,u)),u()}});var Kl=()=>ye({className:"settings-minimum-flow-card",titleHtml:`<span data-i18n="settings.minFlow.title">Minimum zone flow</span>${Le("settings.minFlow.help")}`,bodyHtml:`
    ${De({on:!1,label:"Enable minimum zone flow",className:"smf-always",attrs:'data-i18n-label="settings.minFlow.title"'})}
    <div class="ui-row smf-pct-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Minimum total opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">Only across loops already accepting heat.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
    <p class="ui-note smf-failsafe" data-i18n="settings.minFlow.failsafe">
      Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.
    </p>
  `}),Lm=O({tag:"settings-minimum-flow-card",render:Kl,onMount(t,e){let a=e.closest('[data-collapse-block="min-flow"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="min-flow"]'),r=e.querySelector(".smf-always");o&&r&&o.appendChild(r);let n=e.querySelector(".smf-pct"),s=e.querySelector(".smf-pct-row"),d=Me(e,{immediate:!0}),p=u=>{a==null||a.classList.toggle("is-collapsed",!u),s.hidden=!u,s.setAttribute("aria-hidden",u?"false":"true"),n.disabled=!u};d.toggle(r,{read:()=>fe(i.minimumFlowAlways),onChange:p,commit:u=>{let v=u?"on":"off";k(i.minimumFlowAlways,{state:v}),Fe("minimum_flow_always",v).catch(()=>k(i.minimumFlowAlways,{state:u?"off":"on"}))}}),d.num(n,{read:()=>A(i.minZoneFlowPct),commit:u=>{k(i.minZoneFlowPct,{value:u}),Pe("min_zone_flow_pct",u)}}),C(i.minimumFlowAlways,d.refresh),C(i.minZoneFlowPct,d.refresh),R(e),d.refresh()}});var Gl=`
.settings-return-temp-card .srt-zones {
  display: grid;
  gap: 0;
  margin-top: 0;
}
.settings-return-temp-card .srt-err {
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--state-danger);
  background: color-mix(in srgb, var(--state-danger) 8%, transparent);
  color: var(--state-danger);
  font-size: .78rem;
  font-weight: 650;
}
.settings-return-temp-card .srt-err[hidden] { display: none; }
.settings-disclosure .settings-return-temp-card .srt-zone-row {
  display: grid;
  grid-template-columns: minmax(5.5rem, .95fr) minmax(0, 1.15fr);
  gap: 10px;
  align-items: center;
  padding: 0 0 10px;
}
.settings-disclosure .settings-return-temp-card .srt-zone-row .ui-label {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-disclosure .settings-return-temp-card .srt-zone-row .ui-field {
  width: auto;
  min-width: 0;
}
.settings-return-temp-card .srt-probe-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
.settings-return-temp-card .srt-zone-label .zone-title-name {
  font-weight: 500;
  color: var(--text-faint);
}
.settings-return-temp-card .srt-live {
  min-width: 4.5rem;
  padding: 0 2px 0 0;
  color: var(--text-strong);
  font-family: var(--font-display, var(--mono));
  font-size: 1.05rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: var(--control-compact, 32px);
  text-align: right;
}
.settings-return-temp-card .srt-live.is-empty { color: var(--text-faint); font-weight: 560; }
`;D("settings-return-temp-card",Gl);function ct(t){return!!(t&&t!=="None")}function ds(t){return"Probe "+(t+2)}function Xl(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=A(h.probeTemp(e));return t}function Yl(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=M(h.probe(e));return t}function Jl(){for(let t=1;t<=6;t++)if(ct(M(h.probe(t))))return!0;return!1}function Ql(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}var ed=()=>{let t=Kt({includeNone:!0}),e="";for(let a=1;a<=6;a++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${a}">
        <span class="ui-label srt-zone-label" data-zone-label="${a}">${nt(a)}</span>
        <span class="ui-field"><div class="srt-probe-pair"><select class="ui-select srt-probe" data-zone="${a}">${t}</select><span class="srt-live" data-zone-live="${a}">\u2014</span></div></span>
      </div>`;return ye({className:"settings-return-temp-card",titleHtml:`<span data-i18n="settings.returnTemp.title">Return temperature</span>${Le("settings.returnTemp.help")}`,bodyHtml:`
      ${De({on:!1,label:"Enable return temperature probes",className:"srt-enabled",attrs:'data-i18n-label="settings.returnTemp.title"'})}
      <div class="srt-err" hidden data-srt-err></div>
      <div class="srt-zones">${e}</div>
    `})},$m=O({tag:"settings-return-temp-card",render:ed,onMount(t,e){let a=e.closest('[data-collapse-block="return-temp"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="return-temp"]'),r=e.querySelector(".srt-enabled");o&&r&&o.appendChild(r);let n=e.querySelector(".srt-zones"),s=Array.from(e.querySelectorAll(".srt-probe")),d=e.querySelector("[data-srt-err]"),p=Object.create(null);function u(b){d&&(d.hidden=!b,d.textContent=b||"")}function v(b){let y=p[b]||ds(b),z=it(y);return z>=3&&z<=8?y:ds(b)}function l(b){let y=a==null?void 0:a.querySelector("[data-probe-mode-hint]");if(!y)return;let z=b?"settings.returnTemp.modeOn":"settings.returnTemp.modeOff";y.setAttribute("data-i18n",z),y.textContent=c(z)}function f(b){is(b),a==null||a.classList.toggle("is-collapsed",!b),l(b),n.hidden=!b,n.setAttribute("aria-hidden",b?"false":"true");for(let y of s)y.disabled=!b}async function x(){let b=M(i.manifoldFlowProbe)||"Probe 1",y=M(i.manifoldReturnProbe)||"Probe 2",z=dt(b,et,"Probe 1"),N=dt(y,et,"Probe 2");z===N&&(N=z==="Probe 1"?"Probe 2":"Probe 1"),z!==b&&await Fe("manifold_flow_probe",z),N!==y&&await Fe("manifold_return_probe",N)}function w(){let b=Kt({includeNone:!0,temps:Xl()});for(let y of s){let z=y.value;y.innerHTML=b,[...y.options].some(N=>N.value===z)?y.value=z:ct(z)?y.value=v(Number(y.dataset.zone)):y.value="None"}}function L(){for(let b=1;b<=6;b++){let y=e.querySelector('[data-zone-label="'+b+'"]');y&&(y.innerHTML=nt(b))}}function E(){for(let b of s){let y=Number(b.dataset.zone),z=e.querySelector('[data-zone-live="'+y+'"]');if(!z)continue;let N=it(b.value),X=N?Ql(A(h.probeTemp(N))):"\u2014";z.textContent=X,z.classList.toggle("is-empty",X==="\u2014")}}function _(b){let y=Yl();return delete y[b],Qa({flow:M(i.manifoldFlowProbe),return:M(i.manifoldReturnProbe),zoneProbes:y})}let g=Me(e,{immediate:!0}),m;for(let b of s){let y=Number(b.dataset.zone);g.select(b,{read:()=>{let z=M(h.probe(y));return ct(z)?(p[y]=z,z):v(y)},commit:async z=>{if(!(!m||!m.staged)){if(ct(z)&&ga(z,_(y),`Z${y}`)){u(c("settings.manifold.probeConflict")),g.refresh();return}u(""),p[y]=z;try{await rt(y,"zone_probe",z)}catch(N){u(c("settings.manifold.probeConflict")),g.refresh()}}}}),b.addEventListener("change",E)}m=g.toggle(r,{read:()=>Jl(),onChange:b=>{if(b)for(let y of s){let z=Number(y.dataset.zone);ct(y.value)||(y.value=v(z)),ct(y.value)&&(p[z]=y.value)}else for(let y of s){let z=Number(y.dataset.zone);ct(y.value)&&(p[z]=y.value)}f(b),E()},commit:async b=>{if(!b){await x();for(let y of s){let z=Number(y.dataset.zone);ct(y.value)&&(p[z]=y.value),await rt(z,"zone_probe","None")}return}for(let y of s){let z=Number(y.dataset.zone),N=ct(y.value)?y.value:v(z);p[z]=N,await rt(z,"zone_probe",N)}}});for(let b=1;b<=6;b++)C(h.probe(b),()=>{g.refresh(),E()}),C(h.name(b),L);for(let b=1;b<=8;b++)C(h.probeTemp(b),E);Ja(()=>{w(),E()}),R(e),L(),g.refresh(),E()}});var td=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function ad(){if(String(M(i.bleClockSyncAdvertising)||"").toLowerCase()==="on")return c("common.clockSyncing");let t=String(M(i.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return c("settings.bleClock.waitingClock");if(t==="ble_busy")return c("settings.bleClock.busy");if(t)return t;let e=Number(A(i.bleClockSyncLastOkS)||0);if(!e)return c("settings.bleClock.never");let a=Math.max(0,Math.round(Date.now()/1e3)-e);if(a<60)return c("common.secondsAgo",{value:a});if(a<3600)return c("common.minutesAgo",{value:Math.round(a/60)});let o=Math.round(a/3600);return c("settings.bleClock.hoursAgo",{value:o})}var od=()=>ye({className:"settings-ble-clock-card",titleHtml:`<span data-i18n="settings.bleClock.title">Room clocks</span>${Le("settings.bleClock.help")}`,bodyHtml:`
    ${De({on:!1,label:"Enable room clock sync",className:"sbc-enabled",attrs:'data-i18n-label="settings.bleClock.title"'})}
    <div class="sbc-body">
      <div class="ui-row sbc-interval-row">
        <span class="ui-label"><span data-i18n="settings.bleClock.interval">Broadcast interval</span> <span class="ui-sublabel" data-i18n="settings.bleClock.intervalSub">Short bursts. Displays usually apply time about once a day.</span></span>
        <span class="ui-field"><select class="ui-select sbc-interval"></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.bleClock.lastSync">Last broadcast</span> <span class="sbc-status ui-sublabel">\u2014</span></span>
        <span class="ui-field"><button type="button" class="ui-btn sbc-now" data-i18n="settings.bleClock.syncNow">Sync now</button></span>
      </div>
    </div>
  `}),Um=O({tag:"settings-ble-clock-card",render:od,onMount(t,e){let a=e.closest('[data-collapse-block="ble-clock"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="ble-clock"]'),r=e.querySelector(".sbc-enabled");o&&r&&o.appendChild(r);let n=e.querySelector(".sbc-body"),s=e.querySelector(".sbc-interval"),d=e.querySelector(".sbc-status"),p=e.querySelector(".sbc-now"),u=Me(e,{immediate:!0}),v=()=>{let x=s.value;s.innerHTML=td.map(w=>`<option value="${w.value}">${c(w.labelKey)}</option>`).join(""),x&&(s.value=x)},l=()=>{d.textContent=ad()},f=x=>{a==null||a.classList.toggle("is-collapsed",!x),n&&(n.hidden=!x,n.setAttribute("aria-hidden",x?"false":"true")),s.disabled=!x,p.disabled=!x};v(),u.toggle(r,{read:()=>fe(i.bleClockSyncEnabled),onChange:f,commit:x=>{let w=x?"on":"off";k(i.bleClockSyncEnabled,{state:w}),Fe("ble_clock_sync_enabled",w).catch(()=>k(i.bleClockSyncEnabled,{state:x?"off":"on"}))}}),u.select(s,{read:()=>String(Math.round(Number(A(i.bleClockSyncIntervalMin))||60)),commit:x=>{let w=Number(x);k(i.bleClockSyncIntervalMin,{value:w}),Pe("ble_clock_sync_interval_min",w)}}),p.addEventListener("click",()=>{k(i.bleClockSyncAdvertising,{state:"on"}),l(),He("ble_clock_sync_now")}),C(i.bleClockSyncEnabled,u.refresh),C(i.bleClockSyncIntervalMin,u.refresh),C(i.bleClockSyncLastOkS,l),C(i.bleClockSyncLastError,l),C(i.bleClockSyncAdvertising,l),R(e),u.refresh(),l()}});var nd=`
.settings-action-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-action-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-action-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-action-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-action-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;D("settings-control-card",nd);var rd=()=>ye({className:"settings-action-card",titleHtml:"Recovery actions",bodyHtml:`
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  `}),Jm=O({tag:"settings-control-card",render:rd,onMount(t,e){R(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&He("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{He("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&He("restart")})}});var sd=`
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
`;D("settings-motor-calibration-card",sd);var eo=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],id=()=>{let t="";for(let e=0;e<eo.length;e++){let a=eo[e];if(a.key==="generic_runtime_limit_seconds")continue;let o=ld(a.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+a.labelKey+'">'+c(a.labelKey)+"</span> ("+a.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+a.cls+'" value="0" step="'+o+'"></span></div>'}return ye({className:"settings-motor-cal-card",titleHtml:`<span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${Le("settings.motor.help")}`,bodyHtml:`
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field">${De({on:!1,label:"Toggle motor drivers",className:"mc-drivers-toggle",attrs:'data-i18n-label="settings.motor.toggleDrivers"'})}</span>
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
      <div class="runtime-note" data-i18n="settings.motor.runtimeNote">HmIP-VDMot safety: the close stroke is capped at 34s and 2600 commutations \u2014 40s is where the plunger leaves its housing. Opening is capped separately at 45s.</div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.motor.maxSafeRuntime">Max Safe Runtime</span> (s)</span>
        <span class="ui-field"><input type="number" class="ui-input smc-safe-runtime" value="0" step="1"></span>
      </div>

      <details class="mc-advanced">
        <summary data-i18n="settings.motor.advanced">Advanced motor learning</summary>
        <div class="mc-advanced-body">${t}</div>
      </details>
    `})};function ld(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var ig=O({tag:"settings-motor-calibration-card",render:id,onMount(t,e){let a=e.querySelector(".smc-profile"),o=e.querySelector(".smc-safe-runtime"),r=e.querySelector(".mc-drivers-toggle"),n=Me(e);function s(p){if(p==="HmIP VdMot"&&Pe("hmip_runtime_limit_seconds",34),p==="Generic"){let u=Number(A(i.genericRuntimeLimitSeconds));(!Number.isFinite(u)||u<=0)&&Pe("generic_runtime_limit_seconds",45)}}n.toggle(r,{read:()=>fe(i.drivers),commit:p=>Dt(p)}),n.select(a,{read:()=>M(i.motorProfileDefault)||"HmIP VdMot",commit:p=>{Fe("motor_profile_default",p),s(p)}});function d(){let p=M(i.motorProfileDefault)||"HmIP VdMot";o.disabled=p==="HmIP VdMot"}n.num(o,{read:()=>(M(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?A(i.hmipRuntimeLimitSeconds):A(i.genericRuntimeLimitSeconds),commit:p=>{a.value==="Generic"&&Pe("generic_runtime_limit_seconds",p)}});for(let p=0;p<eo.length;p++){let u=eo[p];if(u.key==="generic_runtime_limit_seconds")continue;let v=e.querySelector(".smc-"+u.cls);v&&(n.num(v,{read:()=>A(u.id),commit:l=>Pe(u.key,l)}),C(u.id,n.refresh))}C(i.drivers,n.refresh),C(i.motorProfileDefault,()=>{n.refresh(),d()}),C(i.genericRuntimeLimitSeconds,n.refresh),C(i.hmipRuntimeLimitSeconds,n.refresh),R(e),s(M(i.motorProfileDefault)||"HmIP VdMot"),n.refresh(),d()}});var dd=600*1e3,cs=600,cd=`
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
.settings-firmware-card .sfw-asset { display: inline-flex; align-items: center; justify-content: center; height: var(--control-height, 44px); min-height: var(--control-height, 44px); min-width: 150px; padding: 0 14px; border: 1px solid var(--control-border); border-radius: 8px; color: var(--text-strong); font-size: .875rem; font-weight: 700; text-decoration: none; }
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
`;D("settings-firmware-card",cd);var pd=()=>ye({className:"settings-firmware-card",titleHtml:`<span data-i18n="settings.firmware.title">Firmware</span>${Le("settings.firmware.help")}`,bodyHtml:`
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
  `});function ps(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function ba(t,e){let a=ps(t);if(!a)return!1;let o=ps(e);if(!o)return!0;for(let r=0;r<3;r++)if(a[r]!==o[r])return a[r]>o[r];return!1}function us(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function ud(t){let e=String(t||"").trim();return e.length<=cs?e:e.slice(0,cs).replace(/\s+\S*$/,"")+"\u2026"}function md(){let t=document.querySelector(".settings-backup-card");if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});let e=t.querySelector(".sbk-save");e&&e.focus({preventScroll:!0})}var fg=O({tag:"settings-firmware-card",render:pd,onMount(t,e){let a=e.querySelector(".sfw-version"),o=e.querySelector(".sfw-status"),r=e.querySelector(".sfw-check"),n=e.querySelector(".sfw-banner"),s=e.querySelector(".sfw-hop"),d=e.querySelector(".sfw-notes"),p=e.querySelector(".sfw-install"),u=e.querySelector(".sfw-asset"),v=e.querySelector(".sfw-jump"),l=e.querySelector(".sfw-file"),f=e.querySelector(".sfw-choose"),x=e.querySelector(".sfw-upload"),w=e.querySelector(".sfw-filename"),L=e.querySelector(".sfw-progress"),E=L.querySelector("i"),_=e.querySelector(".sfw-upload-status"),g=null,m=!1,b=0,y=!1,z=()=>M(i.firmware)||P("firmwareVersion")||"",N=(q,B)=>{o.textContent=q||"",o.className="ui-sublabel sfw-status"+(B?" "+B:"")},X=()=>{let q=Rt.firmware_update;if(!q||q.available!==!0)return null;let B=String(q.latest||"").trim();return B?{tag:B,notes:c("settings.firmware.deviceReported"),asset:ko(B)}:null},$=()=>{let q=X();return g?q&&ba(q.tag,g.tag)?q:g:q},te=()=>{a.textContent=z()||c("settings.firmware.unknownVersion")},oe=()=>{let q=$(),B=!!q&&ba(q.tag,z());if(n.hidden=!B,!B){Oe("firmwareUpdateAvailable",null);return}s.innerHTML=us(z()||c("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+us(q.tag),d.textContent=ud(q.notes)||c("common.noData"),u.href=q.asset.url,u.setAttribute("download",q.asset.name),u.title=q.asset.name,Oe("firmwareUpdateAvailable",{current:z(),latest:q.tag,url:q.asset.url})},le=q=>{m||!q&&b&&Date.now()-b<dd||(m=!0,b=Date.now(),r.disabled=!0,N(c("settings.firmware.checking")),Promise.resolve(Zn()).catch(()=>{}),Gn().then(B=>{g=B,oe();let K=ba(B.tag,z());N(K?c("settings.firmware.availableStatus",{version:B.tag}):c("settings.firmware.upToDate"),K?null:"ok")}).catch(B=>{g=null,oe();let K=X();if(K){N(ba(K.tag,z())?c("settings.firmware.availableStatus",{version:K.tag}):c("settings.firmware.upToDate"),ba(K.tag,z())?null:"ok");return}if((B instanceof bt?B.code:"network")==="no_releases"){N(c("settings.firmware.noReleases"),"ok");return}N(c("settings.firmware.checkFailed"),"err")}).finally(()=>{m=!1,r.disabled=!1}))};r.addEventListener("click",()=>le(!0)),v.addEventListener("click",md),p.addEventListener("click",()=>{let q=$();q&&window.confirm(c("settings.firmware.confirmInstall",{version:q.tag}))&&(p.disabled=!0,p.textContent=c("settings.firmware.installing"),Promise.resolve(Wn()).then(()=>N(c("settings.firmware.installStarted"))).catch(()=>{N(c("settings.firmware.installFailed"),"err"),p.disabled=!1,p.textContent=c("settings.firmware.install")}))}),f.addEventListener("click",()=>l.click()),l.addEventListener("change",()=>{let q=l.files&&l.files[0];w.textContent=q?q.name:c("settings.firmware.noFile"),x.disabled=!q||y,_.textContent="",_.className="ui-note sfw-upload-status"}),x.addEventListener("click",()=>{let q=l.files&&l.files[0];!q||y||window.confirm(c("settings.firmware.confirmUpload",{file:q.name}))&&(y=!0,x.disabled=!0,f.disabled=!0,L.hidden=!1,E.style.width="0%",_.className="ui-note sfw-upload-status",_.textContent=c("settings.firmware.uploading",{value:0}),Promise.resolve(Kn()).catch(B=>console.warn("[Firmware] prepare rejected, continuing with upload:",B)).then(()=>Xn(q,B=>{E.style.width=B+"%",_.textContent=c("settings.firmware.uploading",{value:B})})).then(()=>{E.style.width="100%",_.className="ui-note sfw-upload-status",_.textContent=c("settings.firmware.uploadDone")}).catch(B=>{console.error("[Firmware] upload failed:",B),L.hidden=!0,_.textContent=c("settings.firmware.uploadFailed")}).finally(()=>{y=!1,f.disabled=!1,x.disabled=!1}))}),U("section",()=>{P("section")==="settings"&&le(!1)}),C(i.firmware,()=>{te(),oe()}),C("firmware_update",oe),R(e),te(),P("section")==="settings"&&le(!1)}});var gd=`
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
`;D("settings-backup-card",gd);var bd=()=>ye({className:"settings-backup-card",titleHtml:`<span data-i18n="settings.backup.title">Backup and restore</span>${Le("settings.backup.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field">${De({on:!0,label:"Restore learned motor values",className:"sbk-learned",attrs:'data-i18n-label="settings.backup.restoreLearned"'})}</span>
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
  `}),_g=O({tag:"settings-backup-card",render:bd,onMount(t,e){let a=e.querySelector(".sbk-save"),o=e.querySelector(".sbk-learned"),r=e.querySelector(".sbk-file"),n=e.querySelector(".sbk-choose"),s=e.querySelector(".sbk-restore"),d=e.querySelector(".sbk-filename"),p=e.querySelector(".sbk-status"),u=e.querySelector(".sbk-result"),v=!0,l=!1,f=(x,w)=>{p.textContent=x||"",p.className="sbk-status"+(w?" "+w:"")};o.addEventListener("click",()=>{v=!v,Da(o,{on:v})}),a.addEventListener("click",()=>{l||(l=!0,a.disabled=!0,u.textContent="",f(c("settings.backup.saving")),Yn(!0).then(x=>{if(!Fa(x))throw new Error("unexpected_export_payload");f(c("settings.backup.saved",{file:Qn(x)}),"ok")}).catch(x=>{console.error("[Backup] export failed:",x),f(c("settings.backup.saveFailed"),"err")}).finally(()=>{l=!1,a.disabled=!1}))}),n.addEventListener("click",()=>r.click()),r.addEventListener("change",()=>{let x=r.files&&r.files[0];d.textContent=x?x.name:c("settings.backup.noFile"),s.disabled=!x||l,u.textContent="",f("")}),s.addEventListener("click",async()=>{let x=r.files&&r.files[0];if(!x||l)return;let w="";try{w=await x.text()}catch(E){f(c("settings.backup.readFailed"),"err");return}let L=null;try{L=JSON.parse(w)}catch(E){f(c("settings.backup.invalidFile"),"err");return}if(!Fa(L)){f(c("settings.backup.invalidFile"),"err");return}window.confirm(c("settings.backup.confirmRestore",{file:x.name}))&&(l=!0,s.disabled=!0,u.textContent="",f(c("settings.backup.restoring")),Jn(L,v).then(E=>{f(c("settings.backup.restored"),"ok"),u.textContent=c("settings.backup.result",{applied:E.applied,skipped:E.skipped,ignored:E.ignored})}).catch(E=>{console.error("[Backup] restore failed:",E),f(c("settings.backup.restoreFailed"),"err")}).finally(()=>{l=!1,s.disabled=!1}))}),R(e)}});var fd=()=>ye({className:"settings-appearance-card",titleHtml:`<span data-i18n="settings.appearance.title">Appearance</span>${Le("settings.appearance.help")}`,bodyHtml:'<p class="ui-copy" data-i18n="settings.appearance.product">Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.</p>'}),Mg=O({tag:"settings-appearance-card",render:fd,onMount(t,e){R(e)}});var hd=`
.smart-preheat-card .absorb-badge {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--disabled) 28%, transparent);
  color: var(--text-muted);
  border: 1px solid var(--separator);
}

.smart-preheat-card .absorb-badge.active {
  background: color-mix(in srgb, var(--ok) 22%, transparent);
  color: var(--ok);
  border-color: color-mix(in srgb, var(--ok) 42%, transparent);
}
`;D("smart-preheat-card",hd);var vd=()=>ye({className:"smart-preheat-card",titleHtml:`<span data-i18n="settings.preheat.title">Preheat</span>${Le("settings.preheat.help")}`,bodyHtml:`
    ${De({on:!1,label:"Toggle preheat absorption",className:"absorb-toggle",attrs:'data-i18n-label="settings.preheat.toggle"'})}
    <div class="absorb-body">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.preheat.absorption">Preheat Absorption</span> <span class="absorb-badge">idle</span></span>
      </div>
      <div class="ui-note" data-i18n="settings.preheat.note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.absorbBand">Absorb band (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.detectDelta">Detect delta (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  `}),$g=O({tag:"smart-preheat-card",render:vd,onMount(t,e){let a=e.closest('[data-collapse-block="preheat"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="preheat"]'),r=e.querySelector(".absorb-toggle");o&&r&&o.appendChild(r);let n=e.querySelector(".absorb-badge"),s=e.querySelector(".absorb-band"),d=e.querySelector(".absorb-delta"),p=e.querySelector(".absorb-body"),u=Me(e,{immediate:!0}),v=f=>{a==null||a.classList.toggle("is-collapsed",!f),p&&(p.hidden=!f,p.setAttribute("aria-hidden",f?"false":"true")),s.disabled=!f,d.disabled=!f};u.toggle(r,{read:()=>fe(i.preheatAbsorbEnabled),onChange:v,commit:f=>{let x=f?"on":"off";k(i.preheatAbsorbEnabled,{state:x}),Fe("preheat_absorb_enabled",x)}}),u.num(s,{read:()=>A(i.preheatAbsorbBandC),commit:f=>{k(i.preheatAbsorbBandC,{value:f}),Pe("preheat_absorb_band_c",f)}}),u.num(d,{read:()=>A(i.preheatDetectDeltaC),commit:f=>{k(i.preheatDetectDeltaC,{value:f}),Pe("preheat_detect_delta_c",f)}});function l(){let f=String(M(i.preheatAbsorbing)||"idle").toLowerCase(),x=f==="armed"||f==="reactive"||f==="active"?f==="active"?"reactive":f:"idle",w=x==="armed"?"settings.preheat.armed":x==="reactive"?"settings.preheat.reactive":"common.idle";n.textContent=c(w),n.classList.toggle("active",x!=="idle"),n.dataset.mode=x}C(i.preheatAbsorbEnabled,u.refresh),C(i.preheatAbsorbing,l),C(i.preheatAbsorbBandC,u.refresh),C(i.preheatDetectDeltaC,u.refresh),R(e),u.refresh(),l()}});var xd=`
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
`;D("help-external-ingest",xd);function pn(){return window.location.origin||"http://lune-v6.local"}function yd(){return`// Shelly script \u2014 POST BTHome temps to Lune V6 (no zone number).
// 1) On V6: zone \u2192 External, set sensor_id to the BLU MAC.
// 2) Paste this on Mini PM / BLU Gateway (Gen3+). Adjust SENSOR_ID if needed.
// X-Lune-CSRF is required (any value); it is not a secret \u2014 LAN trust model.

let CONFIG = {
  v6_url: "${pn()}/api/v1/room-temperatures",
  // Leave empty to use the BLU address from the event when available:
  sensor_id: "",
};

function postTemp(sensorId, tempC) {
  Shelly.call("HTTP.Request", {
    method: "POST",
    url: CONFIG.v6_url,
    headers: {
      "Content-Type": "application/json",
      "X-Lune-CSRF": "1",
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
`}function wd(){return`# Home Assistant \u2014 rest_command + automation (no zone in payload).
# On V6: External source + sensor_id matching the entity you map below.
# X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

rest_command:
  lune_v6_room_temp:
    url: "${pn()}/api/v1/room-temperatures"
    method: POST
    headers:
      Content-Type: application/json
      X-Lune-CSRF: "1"
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
`}function kd(){return`// HomeyScript \u2014 forward a Homey temperature capability to Lune V6.
// On V6: External + sensor_id (use Homey device id or a stable string you choose).
// X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

const V6_URL = "${pn()}/api/v1/room-temperatures";
const SENSOR_ID = "homey-living-room"; // must match V6 bind
const TEMP_C = 21.5; // replace with capability value

await fetch(V6_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Lune-CSRF": "1",
  },
  body: JSON.stringify({
    sensor_id: SENSOR_ID,
    temp_c: TEMP_C,
    observed_at_ms: Date.now(),
    producer_id: "homey",
  }),
});
`}var _d={shelly:yd,ha:wd,homey:kd},Vg=O({tag:"help-external-ingest",render:()=>`
    <div class="ui-card help-external-ingest">
      <div class="ui-card-title" data-i18n="help.external.title">External room temperature</div>
      <p class="hei-note" data-i18n="help.external.intro">V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.</p>
      <p class="hei-warn" data-i18n="help.external.keyWarn">Scripts include your browser session key if set \u2014 treat it as a secret.</p>
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
  `,onMount(t,e){let a="shelly",o=e.querySelector(".hei-code"),r=e.querySelectorAll(".hei-tab");function n(){r.forEach(s=>s.setAttribute("aria-selected",s.dataset.tab===a?"true":"false")),o.textContent=_d[a]()}return r.forEach(s=>s.addEventListener("click",()=>{a=s.dataset.tab,n()})),e.querySelector(".hei-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.textContent||"")}catch(s){}}),n(),R(e),void 0}});var gs="(prefers-color-scheme: dark)",Gt=null,ms=!1;function zd(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(gs).matches?"dark":"light"}function Sd(){let t=zd();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,e.classList.remove("theme-refined-ember","theme-deep-forest"),delete e.dataset.theme,!ms&&typeof window!="undefined"&&typeof window.matchMedia=="function"){Gt=window.matchMedia(gs);let a=()=>{let o=Gt.matches?"dark":"light";e.dataset.colorScheme=o,e.style.colorScheme=o,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:o}))};typeof Gt.addEventListener=="function"?Gt.addEventListener("change",a):typeof Gt.addListener=="function"&&Gt.addListener(a),ms=!0}return t}function bs(){return Sd()}function fs(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}var hs=`
.lds-provision,
.provision {
  padding-left: 24px;
  border-left: 1px solid var(--separator);
}
.lds-form,
.form {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 28rem;
}
.lds-form-head h3,
.form-head h3 {
  margin: 0;
  color: var(--text-faint);
  font-size: .68rem;
  font-weight: 750;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.lds-form-head h2,
.form-head h2 {
  margin: 4px 0 0;
  color: var(--text-strong);
  font-size: 1.05rem;
  font-weight: 650;
}
.lds-form-stack,
.form-stack {
  display: grid;
  gap: 14px;
}
.lds-form-pair,
.form-pair {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}
.lds-form-pair.is-even,
.form-pair.is-even {
  grid-template-columns: 1fr 1fr;
}
.lds-form .lds-form-actions,
.form .form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--separator);
  margin-top: 0;
}
.lds-form .lds-form-extra,
.form .form-extra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.lds-field,
.field {
  display: grid;
  gap: 6px;
  color: var(--text-muted, var(--muted));
  font-size: .72rem;
  font-weight: 650;
}
.lds-field input,
.lds-field select,
.field input,
.field select,
.canvas-view .field .input {
  width: 100%;
  height: var(--control-compact, 32px);
  min-height: var(--control-compact, 32px);
  padding: 0 9px;
  border: 1px solid var(--control-border);
  border-radius: 8px;
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: .82rem;
  margin: 0;
  box-shadow: none;
}
.lds-field input:focus,
.lds-field select:focus,
.field input:focus,
.field select:focus {
  outline: 1px solid rgba(var(--accent-rgb), .45);
  border-color: rgba(var(--accent-rgb), .45);
}
.lds-btn-save,
.btn-save {
  min-height: var(--control-compact, 32px);
  padding: 0 12px;
  border: 1px solid var(--control-border);
  border-radius: 8px;
  background: var(--control-bg);
  color: var(--text-strong);
  font-size: .8rem;
  font-weight: 650;
  cursor: pointer;
}
.lds-btn-save:hover,
.btn-save:hover {
  background: var(--inset, rgba(255, 236, 210, .035));
}
.lds-btn-danger,
.btn-danger {
  border: 0;
  background: transparent;
  color: var(--danger);
  font-size: .8rem;
  font-weight: 650;
  cursor: pointer;
}
@media (max-width: 900px) {
  .lds-provision,
  .provision {
    padding-left: 0;
    border-left: 0;
    padding-top: 18px;
    border-top: 1px solid var(--separator);
  }
}
`;function un(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function vs({title:t="",stack:e="",kicker:a="Hardware provisioning",save:o="",saveLabel:r="Save configuration",extra:n="",remove:s="",removeLabel:d="Remove"}={}){let p=o?`<button type="button" class="lds-btn-save btn-save" ${o}>${un(r)}</button>`:"",u=s?`<button type="button" class="lds-btn-danger btn-danger" ${s}>${un(d)}</button>`:"",v=n||u?`<div class="lds-form-extra form-extra">${n}${u}</div>`:"";return`<aside class="lds-provision provision" data-lds-provision>
  <div class="lds-form form" data-lds-form>
    <div class="lds-form-head form-head">
      <h3>${un(a)}</h3>
      <h2>${t}</h2>
    </div>
    <div class="lds-form-stack form-stack">${e}</div>
    <div class="lds-form-actions form-actions">
      ${p}
      ${v}
    </div>
  </div>
</aside>`}bs();var Cd=`
:root {
  --control-width:180px;
  --state-disabled:var(--disabled);
  --mono:var(--font-mono);
  --text:var(--text-main);
  --text-secondary:var(--text-muted);
  --muted:var(--text-muted);
  --border:var(--separator);
  --panel-border:var(--separator);
  --divider:var(--separator-soft);
  --card:var(--surface);
  --panel-bg-flat:var(--surface-raised);
  --panel-bg-vibrant:var(--surface-raised);
  --panel-shadow:none;
  --overlay-bg:color-mix(in srgb,var(--bg) 96%,transparent);
  --control-border-strong:color-mix(in srgb,var(--control-border) 100%,transparent);
  --control-border-hover:rgba(var(--accent-rgb),.5);
  --control-knob:var(--text-strong);
  --focus-ring-soft:var(--focus-ring);
  --focus-border:var(--accent);
  --accent-bg-soft:rgba(var(--accent-rgb),.12);
  --accent-border:rgba(var(--accent-rgb),.36);
  --accent-border-hover:rgba(var(--accent-rgb),.52);
  --accent-text-soft:var(--accent);
  --success-bg:color-mix(in srgb,var(--ok) 16%,transparent);
  --success-bg-soft:color-mix(in srgb,var(--ok) 10%,transparent);
  --success-border:color-mix(in srgb,var(--ok) 38%,transparent);
  --danger-bg:color-mix(in srgb,var(--danger) 16%,transparent);
  --danger-bg-soft:color-mix(in srgb,var(--danger) 10%,transparent);
  --danger-bg-strong:color-mix(in srgb,var(--danger) 22%,transparent);
  --danger-border:color-mix(in srgb,var(--danger) 42%,transparent);
  --danger-border-soft:color-mix(in srgb,var(--danger) 30%,transparent);
  --danger-border-strong:color-mix(in srgb,var(--danger) 56%,transparent);
  --danger-text:var(--danger);
  --warn-bg-soft:color-mix(in srgb,var(--warn) 10%,transparent);
  --warn-border:color-mix(in srgb,var(--warn) 38%,transparent);
  --blue:var(--info);
  --red:var(--danger);
  --series-cool-fill:color-mix(in srgb,var(--series-cool) 14%,transparent);
  --chart-axis:var(--text-muted);
  --flow-track:color-mix(in srgb,var(--text-muted) 70%,var(--bg));
  --flow-disabled:var(--disabled);
  --flow-unknown:var(--text-faint);
  --flow-return:var(--series-cool);
  --flow-label:var(--text-main);
  --flow-source-bg:var(--control-bg);
}
*,*::before,*::after{box-sizing:border-box} html{font-size:100%;scroll-behavior:smooth} body{margin:0;background:var(--bg);color:var(--text-main);font-family:var(--font-ui);line-height:1.45;-webkit-font-smoothing:antialiased} button,input,select{font:inherit} button,a,select,input{ -webkit-tap-highlight-color:transparent }
app-root{display:block}.app{min-height:100vh;position:relative}.shell{position:relative;z-index:1;display:grid;grid-template-columns:var(--sidebar-width) minmax(0,1fr);min-height:100vh}.side-panel{grid-column:1;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:18px 12px 14px;border-right:1px solid var(--separator);background:transparent;overflow:visible}.side-brand{display:flex;align-items:center;gap:8px;min-height:0;padding:6px 8px 16px;color:inherit;font:inherit;letter-spacing:0}.side-brand .lune-mark{width:var(--brand-lockup-w,80px);height:var(--brand-lockup-h,59px)}.side-subtitle{display:none}
.lune-mark .pipe.is-calling{animation:none!important;stroke-dasharray:none!important;filter:none}.side-nav-slot{display:flex;flex:1;min-height:0}.main-panel{grid-column:2;min-width:0}.hdr{position:sticky;top:0;z-index:20;padding:22px 36px 16px;border-bottom:1px solid var(--separator);background:var(--bg)}.view-panel{min-width:0;width:100%;margin:0;padding:var(--content-pad)}.ftr{margin-top:48px;color:var(--text-faint);font-size:.75rem}.sec{display:none}.sec.active{display:block}
.view-lead{max-width:720px;margin:0 0 28px;padding-bottom:24px;border-bottom:1px solid var(--separator)}.view-lead h2{margin:0;color:var(--text-strong);font-size:1.1rem;font-weight:650}.view-lead p{margin:6px 0 0;color:var(--text-muted);font-size:.92rem}
.status-summary{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(4,minmax(100px,1fr));gap:0;margin:0 0 24px;padding:20px 0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}.settings-readiness,.diagnostics-readiness{grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr))}.status-summary-main{padding-right:24px}.eyebrow{display:block;color:var(--text-faint);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.status-summary h2{margin:5px 0 4px;color:var(--text-strong);font-size:1.65rem;letter-spacing:-.025em}.status-summary p{margin:0;color:var(--text-muted);font-size:.9rem}.status-fact{padding:0 16px;border-left:1px solid var(--separator)}.status-fact strong{display:block;margin-top:5px;color:var(--text-strong);font-size:1.15rem;font-variant-numeric:tabular-nums}.status-fact small{display:block;margin-top:3px;color:var(--text-muted);font-size:.78rem}.status-ok{color:var(--state-ok)!important}.status-summary h2.status-ok{color:var(--text-strong)!important}.status-warn{color:var(--state-warn)!important}.status-danger{color:var(--state-danger)!important}
.attention{margin:0 0 24px;border-left:3px solid var(--state-warn);padding:13px 16px;background:rgba(245,158,11,.055)}.attention[hidden]{display:none}.attention strong{display:block;color:var(--text-strong);font-size:.9rem}.attention span{display:block;margin-top:3px;color:var(--text-muted);font-size:.85rem}
.content-group{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.content-group + .content-group{margin-top:24px}.group-title{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:58px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--separator)}.group-title-main{min-width:0}.group-title h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.group-title span{display:block;margin-top:2px;color:var(--text-muted);font-size:.78rem}.group-navigation{min-height:var(--control-height);padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.group-navigation:hover{background:rgba(var(--accent-rgb),.10)}.zone-grid{display:grid;grid-template-columns:1fr;gap:0;margin:0}
.zone-id-short{display:inline}.zone-id-long{display:none}@media(min-width:901px){.zone-id-short{display:none}.zone-id-long{display:inline}}.zone-label-compact .zone-id-short{display:inline!important}.zone-label-compact .zone-id-long{display:none!important}.zone-title-id{min-width:0}.zone-title-name{font-weight:500;color:var(--text-faint)}@media(max-width:900px){.zone-label-compact .zone-title-name,.mobile-zone-dock .zone-title-name{display:none}}
.zone-overview{margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-overview-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.zone-overview-card{position:relative;min-width:0;min-height:64px;padding:10px 12px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-muted);display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:2px;text-align:left;overflow:hidden;font:inherit}.zone-overview-card.is-merged{border-color:color-mix(in srgb,var(--accent) 32%,var(--separator));background:color-mix(in srgb,var(--accent) 5%,var(--surface-raised))}.zone-overview-card.zo-pair-start{border-top-right-radius:4px;border-bottom-right-radius:4px}.zone-overview-card.zo-pair-cont{border-top-left-radius:4px;border-bottom-left-radius:4px;margin-left:-4px;padding-left:14px;border-left-color:color-mix(in srgb,var(--accent) 22%,var(--separator))}.zone-overview-card .zo-status{position:absolute;top:10px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--state-disabled)}.zone-overview-card.zs-heating .zo-status{background:var(--accent)}.zone-overview-card.zs-idle .zo-status,.zone-overview-card.zs-off .zo-status{background:var(--state-disabled)}.zone-overview-card.zs-overheated .zo-status{background:var(--state-warn)}.zone-overview-card.zs-fault .zo-status{background:var(--state-danger)}.zone-overview-card .zo-title{min-width:0;padding-right:14px;color:var(--text-strong);font-size:.78rem;font-weight:750;letter-spacing:.02em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-title .zone-title-name{font-size:.72rem;font-weight:560;letter-spacing:0;color:var(--text-faint)}.zone-overview-card .zo-temps{min-width:0;padding-right:4px;color:var(--text-muted);font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-merge{min-width:0;padding-right:4px;color:var(--text-faint);font-size:.68rem;font-weight:600;letter-spacing:.01em;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(min-width:901px){.zone-overview-card{cursor:pointer}.zone-overview-card:hover{color:var(--text-strong);background:color-mix(in srgb,var(--surface-raised) 70%,rgba(255,255,255,.06));border-color:color-mix(in srgb,var(--separator) 60%,rgba(199,211,232,.28))}.zone-overview-card[aria-current="true"]{color:var(--text-strong);border-color:transparent;background:var(--fill-forest)}.zone-overview-card[aria-current="true"] .zo-title,.zone-overview-card[aria-current="true"] .zo-temps{color:inherit}.zone-overview-card[aria-current="true"] .zo-title .zone-title-name{color:inherit;opacity:.72}.zone-overview-card[aria-current="true"].is-merged{border-color:transparent;background:var(--fill-forest)}.zone-overview-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}}.zone-detail-heading{margin:0 0 12px;padding:0;border:0}.zone-detail-heading .eyebrow,.zone-detail-heading p{display:none}.zone-detail-heading h2{margin:4px 0 0;color:var(--text-strong);font-size:1.2rem;font-weight:650;letter-spacing:-.02em}.zones-detail-pane{min-width:0}.int-split>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mobile-zone-dock{display:none}
.manifold .zone-overview-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:0;padding:0;border:0}
.manifold .zone-overview-card{display:grid;gap:4px;min-width:0;min-height:0;padding:8px 6px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;text-align:center;align-items:center;justify-items:center;overflow:visible}
.manifold .zone-overview-card .zo-status,.manifold .zone-overview-card .zo-title{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.manifold .zone-overview-card .loop-id{color:var(--text-faint);font-size:.68rem;font-weight:750;letter-spacing:.06em}
.manifold .zone-overview-card .loop-name{max-width:100%;overflow:hidden;color:var(--text-muted);font-size:.7rem;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.manifold .zone-overview-card .zo-temps,.manifold .zone-overview-card .loop-temp{padding:0;font-family:var(--font-display);font-size:1.05rem;font-weight:650;font-variant-numeric:tabular-nums;color:var(--text-strong)}
.manifold .zone-overview-card .zo-merge{max-width:100%;padding:0;color:var(--text-faint);font-size:.62rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.manifold .zone-overview-card.is-calling .loop-id,.manifold .zone-overview-card.zs-heating .loop-id{color:var(--accent)}
.manifold .zone-overview-card.is-unused,.manifold .zone-overview-card.zs-off{opacity:.4}
.manifold .zone-overview-card:hover{background:var(--inset)}
.manifold .zone-overview-card[aria-current="true"],.manifold .zone-overview-card.is-selected{background:var(--fill-forest);border-color:transparent}
.manifold .zone-overview-card.is-merged,.manifold .zone-overview-card.zo-pair-start,.manifold .zone-overview-card.zo-pair-cont{border-color:transparent;border-radius:8px;margin-left:0;padding-left:6px;background:transparent}
.manifold .zone-overview-card.is-selected.is-merged,.manifold .zone-overview-card[aria-current="true"].is-merged{background:var(--fill-forest)}
.zone-live{min-width:0}
.provision .form-actions:not(:has(button)){display:none}
.provision .zone-actuator-slot{margin-top:4px;padding-top:16px;border-top:1px solid var(--separator)}
.provision .ui-card,.provision .lds-settings-card{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;height:auto!important}
.provision .ui-card-title,.provision .lds-settings-card-title,.provision .ui-section,.provision .ui-form-banner,.provision .help-badge{display:none!important}
.provision .ui-row{display:grid;gap:6px;min-height:0;padding:0;margin:0 0 14px;border:0;align-items:stretch;color:var(--text-muted);font-size:.72rem;font-weight:650}
.provision .ui-label{color:var(--text-muted);font-size:.72rem;font-weight:650}
.provision .ui-sublabel{display:none}
.provision .ui-field{width:100%;display:block}
.provision .ui-input,.provision .ui-select,.provision .ble-input,.provision .ext-input{width:100%;max-width:none;height:var(--control-compact,32px)!important;min-height:var(--control-compact,32px)!important;text-align:left;margin:0;box-shadow:none}
.provision .btn-scan{width:auto;max-width:none;flex:0 0 auto;height:var(--control-compact,32px)!important;min-height:var(--control-compact,32px)!important;margin:0;box-shadow:none}
.provision .zone-sensor-card .ble-row{display:flex;gap:6px;align-items:center;margin-top:0}
.provision .zone-sensor-card .ble-row .ble-input{flex:1 1 auto;width:auto;min-width:0;font-family:var(--font-mono,ui-monospace,monospace);font-size:.78rem;letter-spacing:.02em}
.provision .zone-sensor-card .ui-note,.provision .zone-sensor-card .ext-age{margin:4px 0 0;color:var(--text-muted);font-size:.78rem;font-style:normal}
.provision .zone-actuator-slot .disclosure{border:0;border-radius:0;background:transparent;overflow:visible}
.provision .zone-actuator-slot .disclosure summary{min-height:var(--control-compact,32px);padding:0;color:var(--text-muted);font-size:.78rem;font-weight:650;text-transform:none;letter-spacing:0}
.provision .zone-actuator-slot .disclosure summary::after{content:'\u203A';font-size:1.1rem}
.provision .zone-actuator-slot .disclosure[open] summary::after{transform:rotate(90deg)}
.provision .zone-actuator-slot .disclosure-body{padding:12px 0 0;border:0}
.provision .zone-actuator-slot .za-stats{display:flex;flex-wrap:wrap;gap:12px 20px;padding:0 0 12px}
.provision .zone-actuator-slot .za-stat{padding:0;border:0}
.provision .zone-actuator-slot .za-action{grid-template-columns:minmax(0,1fr) auto;min-height:var(--control-compact,32px);padding:6px 0}
.provision .zone-actuator-slot .za-btn{min-width:0;height:var(--control-compact,32px);min-height:var(--control-compact,32px);padding:0 10px;font-size:.78rem}
.zone-kicker{margin:0;color:var(--text-muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
@media(min-width:901px){
  .shell.nav-collapsed{grid-template-columns:var(--sidebar-collapsed) minmax(0,1fr)}
  .shell.nav-collapsed .side-subtitle,.shell.nav-collapsed .v6-nav-heading,.shell.nav-collapsed .menu-label,.shell.nav-collapsed .side-brand .product,.shell.nav-collapsed .lds-live-status,.shell.nav-collapsed .lds-nav-switch,.shell.nav-collapsed .nav-switch{display:none}
  .shell.nav-collapsed .v6-side-link{justify-content:center;padding:0 8px}
  .shell.nav-collapsed .side-brand{justify-content:center;padding-left:0;padding-right:0;gap:0}
  .shell.nav-collapsed .side-brand .lune-mark{width:48px;height:36px}
  .shell.nav-collapsed .v6-side-link .dot{margin:0 auto}
}
.mobile-zone-dock .zone-chipstrip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;flex:1;min-width:0;padding:3px;border-radius:11px;background:rgba(255,255,255,.04)}
.mobile-zone-dock .zone-chip{min-width:0;min-height:var(--control-height,44px);padding:0 6px;border:0;border-radius:8px;background:transparent;color:var(--text-muted);font:inherit;font-size:.72rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.mobile-zone-dock .zone-chip:hover{color:var(--text-strong);background:var(--control-bg-hover)}
.mobile-zone-dock .zone-chip[aria-selected="true"]{background:var(--fill-forest);color:var(--text-strong)}
.zone-picker-field{display:none}
.disclosure{border:0;border-radius:0;background:transparent;overflow:visible}.disclosure + .disclosure{margin-top:0;border-top:1px solid var(--separator)}.disclosure summary{display:flex;align-items:center;justify-content:space-between;min-height:var(--control-height);padding:14px 0;color:var(--text-strong);cursor:pointer;list-style:none;font-size:.95rem;font-weight:650}.disclosure summary::-webkit-details-marker{display:none}.disclosure summary::after{content:'\u203A';color:var(--text-muted);font-size:1.2rem;transition:transform .16s ease}.disclosure[open] summary::after{transform:rotate(90deg)}.disclosure summary:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}.disclosure summary small{margin-left:auto;margin-right:14px;color:var(--text-muted);font-size:.78rem;font-weight:400}.disclosure-body{padding:0 0 18px;border:0}
.overview-details,.settings-layout,.diagnostics-layout{display:grid;gap:0;padding-top:8px;border-top:1px solid var(--separator)}.overview-attention,.diagnostics-attention{width:100%;border:0;border-left:3px solid var(--state-warn);border-radius:0;text-align:left;color:inherit;cursor:pointer}.overview-attention:hover,.diagnostics-attention:hover{background:rgba(var(--accent-rgb),.09)}.settings-panel{display:none;gap:22px}.settings-panel.is-active{display:grid}.settings-panel-block + .settings-panel-block{margin-top:8px;padding-top:18px;border-top:1px solid var(--separator)}.settings-panel-block h3{margin:0 0 4px;color:var(--text-strong);font-size:.95rem;font-weight:650}.settings-panel-block p{margin:0 0 12px;color:var(--text-muted);font-size:.82rem}.settings-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin:0 0 12px}.settings-panel-head .settings-panel-copy{min-width:0;flex:1 1 auto}.settings-panel-head .settings-panel-copy h3{margin:0 0 4px}.settings-panel-head .settings-panel-copy p{margin:0;color:var(--text-muted);font-size:.82rem}.settings-panel-toggle{flex:0 0 auto;padding-top:2px;display:flex;align-items:center}.settings-panel-head--pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(12rem,1fr);gap:16px 28px;align-items:start}.settings-panel-pair{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;min-width:0}.settings-panel-pair .settings-panel-copy{flex:1 1 auto}.settings-panel-block--toggle.is-collapsed .settings-panel-body{display:none}.settings-panel-block--probes.is-collapsed .return-temp-slot{display:none}.settings-panel-block--probes.is-collapsed .settings-panel-head{margin-bottom:12px}.settings-panel-block--toggle.is-collapsed .settings-panel-head{margin-bottom:0}@media(max-width:720px){.settings-panel-head--pair{grid-template-columns:1fr}}.settings-disclosure>.disclosure-body,.diagnostics-disclosure>.disclosure-body{padding:0 0 18px}.settings-disclosure .ui-card,.settings-disclosure .connectivity-card,.diagnostics-disclosure .ui-card,.diagnostics-disclosure .settings-card,.diagnostics-disclosure .logs-view,.diagnostics-disclosure .diag-zone-motor,.diagnostics-disclosure .connectivity-card,.diagnostics-disclosure .diag-i2c{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.settings-disclosure .ui-card-title,.settings-disclosure .help-badge,.settings-disclosure .connectivity-card .card-title{display:none}.settings-disclosure .ui-row{display:grid;gap:6px;min-height:0;padding:0 0 12px;border:0;align-items:stretch}.settings-disclosure .ui-label{color:var(--text-muted);font-size:.72rem;font-weight:650}.settings-disclosure .ui-field{width:100%;display:block}.settings-disclosure .ui-input,.settings-disclosure .ui-select,.settings-disclosure .ui-btn,.settings-disclosure button:not(.lds-nav-switch):not(.nav-switch),.diagnostics-disclosure button:not(.lds-nav-switch):not(.nav-switch),.diagnostics-disclosure select,.diagnostics-disclosure input{min-height:var(--control-compact,32px);height:var(--control-compact,32px)}.settings-disclosure .lds-nav-switch,.settings-disclosure .nav-switch,.diagnostics-disclosure .lds-nav-switch,.diagnostics-disclosure .nav-switch{width:34px;height:20px;min-height:20px;min-width:34px;padding:0;flex:0 0 auto}.settings-disclosure .ui-input,.settings-disclosure .ui-select{width:100%;max-width:28rem;text-align:left}.settings-disclosure .touch-approve{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--text-on-accent)!important}.settings-disclosure .touch-disconnect{background:transparent!important}.diagnostics-disclosure .card-title,.diagnostics-disclosure .ui-card-title{color:var(--text-faint)!important;font-size:.68rem!important;font-weight:750!important;letter-spacing:.1em!important;text-transform:uppercase!important;border:0!important;padding:0 0 10px!important;margin:0 0 8px!important}.diagnostics-disclosure .logs-stream{height:min(420px,50vh);background:transparent;border:1px solid var(--separator);box-shadow:none}.diagnostics-disclosure.danger-zone{margin-top:12px;border-top:1px solid color-mix(in srgb,var(--danger) 35%,var(--separator))}.diagnostics-disclosure.danger-zone>summary{color:var(--danger-text)}
.settings-readiness,.diagnostics-readiness{display:none}
.help-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.help-item{display:block;padding:18px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-main);text-decoration:none}.help-item:hover{border-color:rgba(var(--accent-rgb),.45)}.help-item strong{display:block;color:var(--text-strong);font-size:.95rem}.help-item p{margin:5px 0 0;color:var(--text-muted);font-size:.83rem}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,.zone-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}@media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}@media (prefers-contrast:more){:root{--separator:rgba(230,238,250,.28);--text-muted:rgba(239,244,252,.82);--text-faint:rgba(231,239,250,.68)}}
:root[data-color-scheme="light"] .side-panel{background:rgba(17,24,39,.018)}
:root[data-color-scheme="light"] .attention{background:rgba(154,91,0,.07)}
:root[data-color-scheme="light"] .diagnostics-disclosure .logs-stream,
:root[data-color-scheme="light"] .diag-i2c,
:root[data-color-scheme="light"] .logs-stream{background:rgba(17,24,39,.045)}
:root[data-color-scheme="light"] .zone-card:hover{background:rgba(17,24,39,.035)}
@media (prefers-contrast:more){:root[data-color-scheme="light"]{--separator:rgba(31,41,55,.32);--text-muted:rgba(24,30,39,.86);--text-faint:rgba(35,42,52,.72)}}
.overview-dashboard{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);column-gap:28px;border-top:1px solid var(--separator)}.dashboard-section{min-width:0;padding:24px 0;border-bottom:1px solid var(--separator)}.dashboard-hydraulic{grid-column:1/-1}.dashboard-activity{grid-column:1/-1}.dashboard-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:0 0 18px}.dashboard-section-head h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.dashboard-section-head p{margin:3px 0 0;color:var(--text-muted);font-size:.82rem}.overview-dashboard .graph-card,.overview-dashboard .timeline-card{margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.overview-dashboard .graph-card{margin-top:18px!important;padding-top:18px!important;border-top:1px solid var(--separator)!important}
.zone-configuration-groups{display:grid;gap:10px;width:100%}.zone-configuration-groups .ui-card{height:auto!important}.zone-configuration-groups .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot{width:100%}.zone-actuator-slot .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot .disclosure-body>.ui-section:first-child{margin-top:0}
@media(min-width:901px){.zone-configuration-groups{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"sensor room" "sensor coordination";align-items:stretch}.provision .zone-configuration-groups{grid-template-columns:1fr!important;grid-template-areas:none!important;align-items:start;gap:14px}.zone-room-slot{grid-area:room;min-width:0}.zone-sensor-slot{grid-area:sensor;min-width:0;display:flex;flex-direction:column}.zone-coordination-slot{grid-area:coordination;min-width:0}.provision .zone-room-slot,.provision .zone-sensor-slot,.provision .zone-coordination-slot{grid-area:auto!important;display:block}.zone-sensor-slot>.ui-card{flex:1 1 auto;align-self:stretch;height:auto!important}.provision .zone-sensor-slot>.ui-card{height:auto!important}}
@media(max-width:900px){.shell{display:block;padding-bottom:78px}.shell.has-zone-dock{padding-bottom:132px}.main-panel{min-width:0}.side-panel{position:fixed;z-index:40;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:auto;padding:7px;border:1px solid var(--separator);border-radius:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);box-shadow:0 10px 32px rgba(0,0,0,.32);overflow:visible}.side-brand,.side-subtitle{display:none}.side-nav-slot,.side-nav-slot hv6-sidebar{flex:0 0 auto;min-height:auto}.mobile-zone-dock{display:flex;align-items:center;gap:4px;margin:0 0 6px;padding:0 0 6px;border-bottom:1px solid var(--separator)}.mobile-zone-dock[hidden]{display:none!important}.zone-overview{margin-bottom:16px}.manifold{grid-template-columns:1fr!important}.manifold-mark{margin:0 auto}.manifold .zone-overview-strip,.manifold .loops,.zone-overview-strip{grid-template-columns:repeat(3,minmax(0,1fr))!important}.manifold-meta{text-align:left}.zone-overview-card{min-height:58px;padding:9px 12px;pointer-events:none;cursor:default}.zone-overview-card.zo-pair-start,.zone-overview-card.zo-pair-cont{border-radius:10px;margin-left:0;padding-left:12px}.zone-overview-card .zo-title{font-size:.78rem}.zone-overview-card .zo-temps{font-size:.78rem}.hdr{padding:9px 14px}.view-panel{width:100%;padding:24px 16px 48px}.status-summary{grid-template-columns:1fr 1fr;gap:16px}.status-summary-main{grid-column:1/-1;padding:0 0 12px;border-bottom:1px solid var(--separator)}.status-fact{padding:0;border:0}.zone-card{grid-template-columns:minmax(120px,1fr) 90px 90px 28px;gap:10px}.zone-card .zc-valve{display:none}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:3}.zone-card::after{grid-column:4}.zone-detail-secondary,.help-list{grid-template-columns:1fr}}
@media(max-width:900px){.overview-dashboard{grid-template-columns:1fr}.dashboard-hydraulic,.dashboard-activity{grid-column:1}}
@media(max-width:900px){.v6-toolbar h1{font-size:1.15rem}.v6-toolbar p{font-size:.78rem}.v6-toolbar-icon{display:none}.v6-live{font-size:0}.v6-live::before{width:8px;height:8px}.status-summary h2{font-size:1.35rem}.group-title{align-items:center}.group-title span{margin-top:4px}.zone-card{min-height:88px;grid-template-columns:minmax(0,1fr) 82px 28px}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:1;margin-top:51px}.zone-card::after{grid-column:3}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.zone-overview-card{min-height:56px;padding:8px 10px}.zone-overview-card.zo-pair-cont{padding-left:10px}.mobile-zone-dock .zone-chip{font-size:.68rem}}
`;D("hv6-app-root",Cd);D("lds-manifold-row",Rr);D("lds-form",hs);D("lds-int-split",ss);var Ld=Ya({liveHtml:'<div class="zone-live"><p class="zone-kicker">Comfort control</p><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-slot"></div></div>',provisionHtml:vs({title:'<span class="provision-zone-title">Zone</span>',stack:'<section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section><div class="zone-actuator-slot"></div>'})}),Md=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand lune-lockup" aria-label="Lune V6"><span data-live-mark="sidebar"></span><span class="product">V6</span></div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><article class="manifold" data-overview-manifold><div class="manifold-mark" data-live-mark="overview"></div><div class="loops" data-overview-loops></div><div class="manifold-meta" data-overview-meta></div></article><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Flow history</h3><p>24-hour flow, return and demand.</p></div></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><article class="manifold zone-overview"><div class="manifold-mark" data-live-mark="zones"></div><div class="zone-overview-strip loops" role="group" aria-label="Select zone"></div><div class="manifold-meta" data-zone-meta></div></article>${Ld}</section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout">
<div class="settings-panel settings-disclosure touch-settings is-active" data-panel="touch"><div class="disclosure-body touch-slot"></div></div>
<div class="settings-panel settings-disclosure" data-panel="hydraulics"><div class="settings-panel-block settings-panel-block--probes" data-collapse-block="return-temp"><div class="settings-panel-head settings-panel-head--pair"><div class="settings-panel-copy"><h3 data-i18n="settings.manifold.panelTitle">Manifold and probes</h3><p data-i18n="settings.manifold.panelSub">Valve polarity and live 1-Wire readings</p></div><div class="settings-panel-pair"><div class="settings-panel-copy"><h3 data-i18n="settings.returnTemp.title">Return temperature</h3><p class="settings-probe-mode" data-probe-mode-hint data-i18n="settings.returnTemp.modeOff">2 probes \xB7 flow/return only</p></div><div class="settings-panel-toggle" data-toggle-host="return-temp"></div></div></div><div class="manifold-slot"></div></div><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="min-flow"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.minFlow.title">Hydraulic safety</h3><p data-i18n="settings.minFlow.panelSub">Minimum opening on active loops</p></div><div class="settings-panel-toggle" data-toggle-host="min-flow"></div></div><div class="settings-panel-body minimum-flow-slot" data-collapse-body="min-flow"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="comfort"><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="ble-clock"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.bleClock.title">Room clocks</h3><p data-i18n="settings.bleClock.panelSub">Shelly BLU display time</p></div><div class="settings-panel-toggle" data-toggle-host="ble-clock"></div></div><div class="settings-panel-body ble-clock-slot" data-collapse-body="ble-clock"></div></div><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="preheat"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.preheat.title">Preheat absorption</h3><p data-i18n="settings.preheat.panelSub">Local handling of external preload</p></div><div class="settings-panel-toggle" data-toggle-host="preheat"></div></div><div class="settings-panel-body preheat-slot" data-collapse-body="preheat"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="motors"><div class="settings-panel-block"><h3>Motor configuration</h3><p>Drivers, profile and learning limits</p><div class="motor-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="device"><div class="settings-panel-block"><h3>Connection</h3><p>Network and firmware identity</p><div class="connectivity-slot"></div></div><div class="settings-panel-block"><h3>Firmware</h3><p>Version, updates and manual upload</p><div class="firmware-slot"></div></div><div class="settings-panel-block"><h3>Backup and restore</h3><p>Save or reapply local configuration</p><div class="backup-slot"></div></div><div class="settings-panel-block"><h3>Appearance</h3><p>Product colour</p><div class="appearance-slot"></div></div></div>
</div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-external-slot"></div><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;O({tag:"app-root",render:Md,onMount(t,e){e.querySelector(".hdr").appendChild(ce("hv6-header")),e.querySelector(".side-nav-slot").appendChild(ce("hv6-sidebar")),e.querySelector(".hydraulic-history-slot").appendChild(ce("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(ce("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(ce("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(ce("zone-detail",{zone:P("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(ce("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(ce("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(ce("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(ce("zone-room-card")),e.querySelector(".touch-slot").appendChild(ce("settings-touch-card"));let a=ce("settings-manifold-card");e.querySelector(".manifold-slot").appendChild(a),a.querySelector(".return-temp-slot").appendChild(ce("settings-return-temp-card")),e.querySelector(".minimum-flow-slot").appendChild(ce("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(ce("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(ce("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(ce("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(ce("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(ce("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(ce("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(ce("settings-control-card")),e.querySelector(".manual-control-col").appendChild(ce("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(ce("diag-zone-motor-card",{zone:P("selectedZone")||1}));let o=e.querySelector(".motor-lab-slot"),r=e.querySelector('.sec[data-section="motorlab"]');function n(){let T=fs(M(i.firmware)||P("firmwareVersion")),H=e.querySelector('.v6-side-link[data-section="motorlab"]');H&&(H.hidden=!T),r&&(r.hidden=!T),T&&o&&!o.firstChild&&o.appendChild(ce("diag-motor-lab")),!T&&P("section")==="motorlab"&&qe("diagnostics")}C(i.firmware,n),U("firmwareVersion",n),U("section",n),n(),e.querySelector(".logs-main-col").appendChild(ce("logs-view")),e.querySelector(".system-health-slot").appendChild(ce("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(ce("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(ce("diag-i2c"));let s=e.querySelector(".help-external-slot");s&&s.appendChild(ce("help-external-ingest"));let d=e.querySelectorAll(".sec"),p=e.querySelector(".shell"),u=e.querySelector(".zone-detail-view"),v=e.querySelector(".selected-zone-title"),l=e.querySelector(".provision-zone-title"),f=e.querySelector(".zone-overview-strip"),x=e.querySelector("[data-overview-loops]"),w=e.querySelector("[data-overview-meta]"),L=e.querySelector("[data-zone-meta]"),E=e.querySelector(".mobile-zone-dock"),_=e.querySelector(".mobile-zone-dock .zone-chipstrip");function g(){e.querySelectorAll("[data-live-mark]").forEach(H=>{let ee=H.getAttribute("data-live-mark");if(ee==="sidebar"){if(H.dataset.staticLockup==="1")return;H.innerHTML=Nr(),H.dataset.staticLockup="1";return}H.dataset.staticMark!=="1"&&(Hr(H,{states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:ee,landscape:!0,sku:"V6"}),H.dataset.staticMark="1")});let T=Or();w&&(w.innerHTML=T),L&&(L.innerHTML=T)}function m(T){let H=fe(h.enabled(T)),ee=String(M(h.state(T))||"").toUpperCase()||"OFF",J=String(M(h.motorLastFault(T))||"").toUpperCase();return H?H&&(ee==="FAULT"||J&&J!=="NONE"&&J!=="OK")?"FAULT":ee:"OFF"}function b(T){return T==="HEATING"?c("state.heating"):T==="IDLE"?c("state.idle"):T==="FAULT"?c("common.fault"):T==="MANUAL"?c("state.manual"):T==="OVERHEATED"?c("state.overheated"):T==="CALIBRATING"?c("state.calibrating"):c("state.off")}function y(T){return T==="HEATING"||T==="CALLING"?"zs-heating":T==="OVERHEATED"?"zs-overheated":T==="FAULT"?"zs-fault":T==="IDLE"?"zs-idle":"zs-off"}function z(T){let H=String(T||"").trim();if(!H||/^none$/i.test(H)||H==="0"||H==="-1")return 0;let ee=H.match(/(\d+)/),J=ee?Number(ee[1]):0;return J>=1&&J<=6?J:0}function N(){var me;let T=[0,0,0,0,0,0,0];for(let j=1;j<=6;j++)T[j]=z(M(h.syncTo(j)));let H=[0,0,0,0,0,0,0];for(let j=1;j<=6;j++){let ge=j;for(let de=0;de<6;de++){let xe=T[ge];if(!xe||xe<1||xe>6)break;if(xe===j){ge=j;break}ge=xe}H[j]=ge}let ee={};for(let j=1;j<=6;j++)(ee[me=H[j]]||(ee[me]=[])).push(j);let J=[[],[],[],[],[],[],[]];for(let j=1;j<=6;j++){let ge=ee[H[j]]||[j],de=ge.length>1&&ge.some(xe=>T[xe]>0);J[j]=de?ge.filter(xe=>xe!==j):[]}return{roots:H,partners:J}}function X(){return window.matchMedia("(min-width: 901px)").matches}function $(){let T=N(),H=P("selectedZone")||1,ee=X();f.setAttribute("role",ee?"group":"list"),f.setAttribute("aria-label",ee?"Select zone":"Zone status overview"),f.innerHTML=Array.from({length:6},(J,me)=>{var pe;let j=me+1,ge=j===H,de=Ce(j),xe=nt(j),Re=xt(j),Ze=je(j),We=Re==="unused"?"\u2014":Ut(A(h.temp(j))),pt=Re==="unused"?"\u2014":Ut((pe=A(h.effectiveSetpoint(j)))!=null?pe:A(h.setpoint(j))),ut=Re==="unused"?"\u2014":$e(j)||"\u2014",_e=m(j),Nt=b(_e),mt=y(_e),Ke=T.partners[j],ot=Ke.length>0,Yt=ot?c("overview.zone.mergedWith",{zones:Ke.map(je).join(", ")}):"",S=ot&&Ke.includes(j+1)&&T.roots[j]===T.roots[j+1],F=ot&&Ke.includes(j-1)&&T.roots[j]===T.roots[j-1],V=[ot?"is-merged":"",S?"zo-pair-start":"",F?"zo-pair-cont":"",Re==="calling"?"is-calling":"",Re==="unused"?"is-unused":""].filter(Boolean).join(" "),Z=`${de}, ${We} / ${pt}, ${Nt}${Yt?", "+Yt:""}`.replace(/"/g,"&quot;"),I=ot?`<span class="zo-merge">${Yt}</span>`:"",G=`<span class="zo-status" aria-hidden="true"></span><span class="loop-id">${Ze}</span><span class="loop-name">${ut.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span><span class="zo-title zone-label-compact">${xe}</span><span class="zo-temps loop-temp">${We}</span>${I}`;return ee?`<button type="button" class="zone-overview-card ${mt}${V?" "+V:""}" data-zone-select="${j}" aria-current="${ge?"true":"false"}" aria-label="${Z}" title="${Z}" tabindex="${ge?"0":"-1"}">${G}</button>`:`<div class="zone-overview-card ${mt}${V?" "+V:""}" role="listitem" aria-label="${Z}" title="${Z}">${G}</div>`}).join("")}function te(){let T=P("selectedZone")||1;_.innerHTML=Array.from({length:6},(H,ee)=>{let J=ee+1,me=J===T,j=Ce(J),ge=nt(J),de=j.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${me}" aria-label="${de}" title="${de}" tabindex="${me?"0":"-1"}" data-zone-select="${J}">${ge}</button>`}).join("")}function oe(){x&&(x.innerHTML=Array.from({length:6},(T,H)=>{let ee=H+1,J=Ce(ee),me=xt(ee),j=je(ee),ge=A(h.valve(ee)),de=me==="unused"?"\u2014":Ut(A(h.temp(ee))),xe=me==="unused"?"\u2014":$a(ge),Re=Pr(ge,me),Ze=me==="unused"?"\u2014":$e(ee)||"\u2014",We=m(ee),pt=b(We),ut=`${J}, ${de}, valve ${xe}, ${pt}`.replace(/"/g,"&quot;");return Dr({id:j,name:Ze,temp:de,level:Re,kind:me,attrs:`data-open-zone="${ee}" aria-label="${ut}" title="${ut}"`})}).join(""))}function le(){$(),te(),oe(),g()}function q(){let T=P("section")==="zones";E.hidden=!T,E.setAttribute("aria-hidden",T?"false":"true"),p.classList.toggle("has-zone-dock",T)}function B(T){_t(T)}function K(){let T=P("section")||"overview";d.forEach(H=>H.classList.toggle("active",H.dataset.section===T)),Be(),we()}function we(){let T=P("settingsPanel")||"touch";e.querySelectorAll(".settings-panel[data-panel]").forEach(H=>{H.classList.toggle("is-active",H.dataset.panel===T)})}function ne(){let T=[],H=0,ee=[];for(let _e=1;_e<=6;_e++){let Nt=String(M(h.enabled(_e))).toLowerCase()==="on",mt=String(M(h.state(_e))).toLowerCase(),Ke=String(M(h.motorLastFault(_e))||"").toUpperCase();Nt&&T.push(_e),Nt&&["heating","calling"].includes(mt)&&H++,(mt==="fault"||Ke!==""&&Ke!=="NONE"&&Ke!=="OK")&&ee.push({zone:_e,fault:Ke||"FAULT"})}let J=ee.length,me=A(i.flow),j=A(i.ret),ge=String(M(i.authorityState)||"").replace(/_/g," "),de=J===0&&P("live"),xe=me!=null&&j!=null?Number(me)-Number(j):null,Re=xe==null?"\u2014":`${xe.toFixed(1)}\xB0C`,Ze=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${de?"status-ok":P("live")?"status-warn":"status-danger"}">${de?"Operating normally":P("live")?"Needs attention":"Device offline"}</h2><p>${J?J+" zone fault"+(J===1?"":"s")+" require attention.":P("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${H} zones</strong><small>${T.length} enabled \xB7 ${H}/${T.length||0} calling</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${Ht(me)}</strong><small>Return ${Ht(j)}</small></div><div class="status-fact"><span class="eyebrow">\u0394T</span><strong>${Re}</strong><small>Flow \u2212 return</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ge||"not connected"}</strong><small>${A(i.authorityLeaseRemainingS)?Math.round(A(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,We=fe(i.authorityConfigured),pt=String(M(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=Ze,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${P("live")?"status-ok":"status-danger"}">${P("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${P("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${We?"Approved":"Not approved"}</strong><small>${We?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${pt}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${J?"status-danger":de?"status-ok":"status-warn"}">${J?J+" issue"+(J===1?"":"s"):de?"Healthy":"Awaiting data"}</h2><p>${J?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${J}</strong><small>${J?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${pt}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ge||"not connected"}</strong><small>${We?"approved":"local control"}</small></div>`;let ut=ee.map(_e=>c("overview.attention.faultDetail",{zone:_e.zone,fault:_e.fault})).join(" ");[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(_e=>{_e.hidden=!J,_e.innerHTML=J?`<strong>${J===1?c("status.attention.zoneFaultOne"):c("status.attention.zoneFaultMany",{count:J})}</strong><span>${ut}</span>`:""})}function Be(){let T=P("selectedZone")||1,H=P("section")==="zones",ee=$e(T),J=ee?`${je(T)} \xB7 ${ee}`:je(T);v.textContent=J,l&&(l.textContent=J),le(),q(),u.hidden=!H}function fa(T){let H=T.target.closest("[data-zone-select]");H&&B(Number(H.dataset.zoneSelect))}function to(T){X()&&fa(T)}function ha(T){if(!X()||!["ArrowLeft","ArrowRight","Home","End"].includes(T.key))return;T.preventDefault();let H=P("selectedZone")||1,ee=T.key==="Home"?1:T.key==="End"?6:T.key==="ArrowLeft"?H===1?6:H-1:H===6?1:H+1;B(ee),requestAnimationFrame(()=>{var J;return(J=f.querySelector(`[data-zone-select="${ee}"]`))==null?void 0:J.focus()})}function Xt(T){if(!["ArrowLeft","ArrowRight","Home","End"].includes(T.key))return;T.preventDefault();let H=P("selectedZone")||1,ee=T.key==="Home"?1:T.key==="End"?6:T.key==="ArrowLeft"?H===1?6:H-1:H===6?1:H+1;B(ee),requestAnimationFrame(()=>{var J;return(J=_.querySelector(`[data-zone-select="${ee}"]`))==null?void 0:J.focus()})}function va(T){let H=T.target.closest("[data-open-zone]");H&&(B(Number(H.dataset.openZone)),qe("zones"))}f.addEventListener("click",to),f.addEventListener("keydown",ha),x&&x.addEventListener("click",va),window.matchMedia("(min-width: 901px)").addEventListener("change",$),_.addEventListener("click",fa),_.addEventListener("keydown",Xt),e.querySelectorAll("[data-open-zones]").forEach(T=>T.addEventListener("click",()=>qe("zones"))),e.querySelectorAll("[data-help-section]").forEach(T=>T.addEventListener("click",H=>{H.preventDefault(),qe(T.dataset.helpSection)})),U("section",K),U("settingsPanel",we),U("selectedZone",Be),U("live",ne),U("zoneNames",()=>{Be(),ne()});for(let T=1;T<=6;T++)[h.temp(T),h.setpoint(T),h.effectiveSetpoint(T),h.valve(T),h.state(T),h.enabled(T),h.motorLastFault(T),h.syncTo(T)].forEach(H=>C(H,()=>{ne(),le()}));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(T=>C(T,ne)),R(e),K(),Be(),ne();let Q=new URLSearchParams(location.search),Ue=Q.get("section"),ve=Number(Q.get("zone"));Ue&&qe(Ue),ve>=1&&ve<=6&&_t(ve)}});function Ad(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(ce("app-root")),rr()}Ad();})();
