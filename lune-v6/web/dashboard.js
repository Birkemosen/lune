(()=>{var fn={},va={};function q(t){return fn[t.tag]=t,t}function ce(t,e){let a=fn[t];if(!a)throw new Error("Component not found: "+t);let o=e||{};if(a.state){let s=a.state(e||{});for(let d in s)o[d]=s[d]}if(a.methods)for(let s in a.methods)o[s]=a.methods[s];let r=document.createElement("div");r.innerHTML=a.render(o);let n=r.firstElementChild;return a.onMount&&queueMicrotask(()=>a.onMount(o,n)),n}function C(t,e){(va[t]||(va[t]=[])).push(e)}function Ae(t){let e=va[t];if(e)for(let a=0;a<e.length;a++)e[a](t)}var h={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",sensorId:t=>"text-zone_"+t+"_sensor_id",sensorName:t=>"text-zone_"+t+"_sensor_name",externalAge:t=>"sensor-zone_"+t+"_external_temp_age_ms",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},l={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var Ee=6,_s=28,Pt=Object.create(null),Ss=Ls(),se={section:"overview",settingsPanel:"touch",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Cs(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Ss,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},zs=300;function Cs(){let t=Object.create(null);for(let e=1;e<=Ee;e++)t[e]=[];return t}function Ls(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<Ee;)t.push("");return t.slice(0,Ee)}function Ms(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(se.zoneNames))}catch(t){}}function Fe(t){return"$dashboard:"+t}function _t(t){return Math.max(1,Math.min(Ee,Number(t)||1))}function hn(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let a=t.match(/-?\d+(?:[\.,]\d+)?/);if(a){let o=Number(String(a[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function E(t){let e=Pt[t];return e?e.v!=null?e.v:e.value!=null?e.value:hn(e.s!=null?e.s:e.state):null}function M(t){let e=Pt[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function As(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function be(t){return As(M(t))}function xa(){return be(l.authorityProposalPending)}function io(){let t=0;for(let e=1;e<=Ee;e++){let a=String(M(h.state(e))||"").toLowerCase(),o=String(M(h.motorLastFault(e))||"").toLowerCase();(a==="fault"||o&&o!=="none"&&o!=="ok")&&(t+=1)}return t}function lo(){if(xa())return{kind:"touch",section:"settings",focus:"touch"};let t=io();return t>0?{kind:"faults",section:"zones",count:t}:null}function k(t,e){let a=Pt[t];a||(a=Pt[t]={v:null,s:null}),"v"in e&&(a.v=e.v,a.value=e.v),"value"in e&&(a.v=e.value,a.value=e.value),"s"in e&&(a.s=e.s,a.state=e.s),"state"in e&&(a.s=e.state,a.state=e.state);for(let o in e)o==="v"||o==="value"||o==="s"||o==="state"||(a[o]=e[o]);if(Ae(t),t==="text_sensor-firmware_version"&&Be("firmwareVersion",M(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let o=parseInt(t.slice(10,-5),10);if(o>=1&&o<=Ee){let r=M(t)||"";se.zoneNames[o-1]!==r&&(se.zoneNames[o-1]=r,Ms(),Ae(Fe("zoneNames")))}}}function U(t,e){C(Fe(t),e)}function P(t){return se[t]}function Be(t,e){se[t]=e,Ae(Fe(t))}function je(t){let e=t==="logs"?"diagnostics":t;se.section!==e&&(se.section=e,Ae(Fe("section")))}function ya(t){let e=String(t||"touch");se.settingsPanel!==e&&(se.settingsPanel=e,Ae(Fe("settingsPanel")))}function St(t){let e=_t(t);se.selectedZone!==e&&(se.selectedZone=e,Ae(Fe("selectedZone")))}function mt(t){let e=!!t;se.live!==e&&(se.live=e,Ae(Fe("live")))}function co(){se.pendingWrites+=1,Ae(Fe("pendingWrites"))}function wa(){se.pendingWrites=Math.max(0,se.pendingWrites-1),se.lastWriteAt=Date.now(),Ae(Fe("pendingWrites"))}function vn(){return se.pendingWrites>0?!0:Date.now()-se.lastWriteAt<2e3}function po(t){return se.zoneNames[_t(t)-1]||""}function Ie(t){return String(po(t)||"").trim()}function Ze(t){return"Z"+_t(t)}function so(t){return"Zone "+_t(t)}function Ce(t){let e=_t(t),a=Ie(e);return a?so(e)+" - "+a:so(e)}function Es(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ts(t){let e=_t(t);return'<span class="zone-id-short">'+Ze(e)+'</span><span class="zone-id-long">'+so(e)+"</span>"}function ot(t){let e=_t(t),a=Ie(e),o=Ts(e);return a?'<span class="zone-title-id">'+o+'</span><span class="zone-title-name"> - '+Es(a)+"</span>":'<span class="zone-title-id">'+o+"</span>"}function Dt(t){se.i2cResult=t||"No scan has been run yet.",Ae(Fe("i2cResult"))}function K(t,e){let a={time:Ns(),msg:String(t||"")};for(se.activityLog.push(a);se.activityLog.length>60;)se.activityLog.shift();if(e>=1&&e<=Ee){let o=se.zoneLog[e];for(o.push(a);o.length>8;)o.shift();Ae(Fe("zoneLog:"+e))}Ae(Fe("activityLog"))}function ro(t,e){let a=se[t];if(!Array.isArray(a))return;let o=hn(e);if(o!=null){for(a.push(o);a.length>_s;)a.shift();Ae(Fe(t))}}function Qt(t){let e=Date.now();if(!t&&e-se.lastHistoryAt<3200)return;se.lastHistoryAt=e;let a=0,o=0;for(let r=1;r<=Ee;r++){let n=E("sensor-zone_"+r+"_valve_pct");n!=null&&(a+=n,o+=1)}ro("historyFlow",E("sensor-manifold_flow_temperature")),ro("historyReturn",E("sensor-manifold_return_temperature")),ro("historyDemand",o?a/o:0)}function Ns(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function ka(t){se.zoneStateHistory=t||null,Ae(Fe("zoneStateHistory"))}function xn(){return se.deviceLogSeq}function _a(t,e){if(Array.isArray(t)&&t.length){for(let a of t)se.deviceLog.push({seq:a[0],level:a[1],tag:a[2],msg:a[3]}),a[0]>se.deviceLogSeq&&(se.deviceLogSeq=a[0]);for(;se.deviceLog.length>zs;)se.deviceLog.shift();Ae(Fe("deviceLog"))}typeof e=="number"&&e>se.deviceLogSeq&&(se.deviceLogSeq=e-1)}function Sa(){return se.deviceLog}function yn(){se.deviceLog=[],Ae(Fe("deviceLog"))}var ye=6,Fs=8,wn=null,zt=0,za=1,kn=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],zn=18*3600+720,Cn=Date.now(),ea=4200,J={temp:new Float32Array(ye),setpoint:new Float32Array(ye),valve:new Float32Array(ye),enabled:new Uint8Array(ye),driversEnabled:1,fault:0,manualMode:0},He={busy:!1,direction:"open",zone:1,startedAt:0};function Rs(){J.manualMode=0,Cn=Date.now(),Be("manualMode",!1);for(let n=0;n<ye;n++){J.temp[n]=20.5+n*.4,J.setpoint[n]=21+n%3*.5,J.valve[n]=12+n*8,J.enabled[n]=n===4?0:1;let s=n+1;k(h.temp(s),{value:J.temp[n]}),k(h.setpoint(s),{value:J.setpoint[n]}),k(h.baseSetpoint(s),{value:J.setpoint[n]}),k(h.effectiveSetpoint(s),{value:J.setpoint[n]}),k(h.coordinatorOffset(s),{value:s===1?1.5:0}),k(h.coordinatorRemaining(s),{value:s===1?2400:0}),s===1&&k(h.effectiveSetpoint(1),{value:J.setpoint[0]+1.5}),k(h.valve(s),{value:J.valve[n]}),k(h.state(s),{state:J.valve[n]>5?"heating":"idle"}),k(h.enabled(s),{value:!!J.enabled[n],state:J.enabled[n]?"on":"off"}),k(h.probe(s),{state:"None"}),k(h.tempSource(s),{state:s%2?"Local Probe":"BLE"}),k(h.syncTo(s),{state:"None"}),k(h.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),k(h.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),k(h.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=Fs;n++){let s=n<=ye?n:ye,d=J.temp[s-1]+(n>ye?1:.1*n);k(h.probeTemp(n),{value:d})}k(l.flow,{value:34.1}),k(l.ret,{value:30.4}),k(l.uptime,{value:zn}),k(l.wifi,{value:-57}),k(l.drivers,{value:!0,state:"on"}),k(l.fault,{value:!1,state:"off"}),k(l.ip,{state:"192.168.1.86"}),k(l.ssid,{state:"MockLab"}),k(l.mac,{state:"D8:3B:DA:12:34:56"}),k(l.firmware,{state:"v1.0.0-1"}),k(l.resetReason,{state:"Software reset (esp_restart)"}),k(l.manifoldFlowProbe,{state:"Probe 1"}),k(l.manifoldReturnProbe,{state:"Probe 2"}),k(l.manifoldType,{state:"NC (Normally Closed)"}),k(l.motorProfileDefault,{state:"HmIP VdMot"}),k(l.closeThresholdMultiplier,{value:1.7}),k(l.closeSlopeThreshold,{value:1}),k(l.closeSlopeCurrentFactor,{value:1.4}),k(l.openThresholdMultiplier,{value:1.7}),k(l.openSlopeThreshold,{value:.8}),k(l.openSlopeCurrentFactor,{value:1.3}),k(l.openRippleLimitFactor,{value:1}),k(l.genericRuntimeLimitSeconds,{value:45}),k(l.hmipRuntimeLimitSeconds,{value:34}),k(l.relearnAfterMovements,{value:2e3}),k(l.relearnAfterHours,{value:168}),k(l.learnedFactorMinSamples,{value:3}),k(l.learnedFactorMaxDeviationPct,{value:12}),k(l.simplePreheatEnabled,{state:"on"}),k(l.minZoneFlowPct,{value:15}),k(l.minimumFlowAlways,{state:"off"}),k(l.bleClockSyncEnabled,{state:"on"}),k(l.bleClockSyncIntervalMin,{value:60}),k(l.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),k(l.bleClockSyncLastError,{state:""}),k(l.bleClockSyncAdvertising,{state:"off"}),k(l.authorityInstallationId,{state:"house-main"}),k(l.authorityCoordinatorId,{state:"lune-touch"}),k(l.authorityConfigured,{state:"on",value:!0}),k(l.authorityProposalPending,{state:"off",value:!1}),k(l.authorityState,{state:"touch_normal"}),k(l.authorityReason,{state:"lease_renewed"}),k(l.authorityLeaseRemainingS,{value:72}),k(l.cpuLoadCore0,{value:18.5}),k(l.cpuLoadCore1,{value:7.2}),k(l.freeInternalKb,{value:142}),k(l.freeDmaKb,{value:118}),k(l.largestInternalKb,{value:64}),k(l.minInternalKb,{value:96}),k(l.freePsramKb,{value:7800}),k(l.largestPsramKb,{value:4096}),k(l.bleHubEnabled,{state:"on"}),k(l.bleScanning,{state:"on"}),k(l.bleDemanded,{state:"on"}),k(l.bleAdsPerSec,{value:2.4}),k(l.bleLastAdvAgeMs,{value:850}),Qt(!0);let t=300,e=Number(Date.now()/1e3)|0,a=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],r=[];for(let n=0;n<a;n++){let s=(a-1-n)*t,d=e-s,p=Math.floor(n/12)%24,u=o.map(T=>T[p%T.length]),x=s/3600,i=x>2.5&&x<3.5||x>8.5&&x<9.5?1:0,b=u.filter(T=>T===5).length,y=Math.round(Math.min(100,b*15+Math.abs(Math.sin(n/8))*6)),w=Number((30+b*1.4+Math.sin(n/11)*1.5).toFixed(1)),L=Number((w-(1.4+b*.35)).toFixed(1));r.push([d,...u,i,w,L,y])}ka({interval_s:t,uptime_s:e,count:a,entries:r}),Ln(6)}function Ln(t){let e=[];for(let a=0;a<t;a++){let o=kn[za%kn.length];e.push([za,o[0],o[1],o[2]]),za++}_a(e,za)}function Ps(){zt+=1,k(l.uptime,{value:zn+Math.floor((Date.now()-Cn)/1e3)}),k(l.wifi,{value:-55-Math.round((1+Math.sin(zt/4))*6)});let t=0,e=0,a=0;for(let s=0;s<ye;s++){let d=s+1,p=!!J.enabled[s],u=J.temp[s],x=J.setpoint[s],i=p&&J.driversEnabled&&!J.manualMode&&u<x-.25;J.manualMode?J.valve[s]=Math.max(0,J.valve[s]):!p||!J.driversEnabled?J.valve[s]=Math.max(0,J.valve[s]-6):i?J.valve[s]=Math.min(100,J.valve[s]+7+d%3):J.valve[s]=Math.max(0,J.valve[s]-5);let b=i?.05+J.valve[s]/2200:-.03+J.valve[s]/3200;J.temp[s]=u+b+Math.sin((zt+d)/5)*.04,p&&J.valve[s]>0&&(t+=J.valve[s],e+=1,a=Math.max(a,J.valve[s])),k(h.temp(d),{value:J.temp[s]}),k(h.valve(d),{value:Math.round(J.valve[s])});let y=Math.max(0,(J.setpoint[s]-J.temp[s]-.15)*.22);k(h.preheatAdvance(d),{value:Number(y.toFixed(2))}),k(h.state(d),{state:p?i?"heating":"idle":"off"}),k(h.enabled(d),{value:p,state:p?"on":"off"}),k(h.probeTemp(d),{value:J.temp[s]+Math.sin((zt+d)/6)*.1})}let o=29.5+a*.075+e*.18+Math.sin(zt/6)*.25,r=o-(e?2.1+t/Math.max(1,e*50):1.1);k(l.flow,{value:Number(o.toFixed(1))}),k(l.ret,{value:Number(r.toFixed(1))}),k(h.probeTemp(1),{value:Number((o+.2).toFixed(1))}),k(h.probeTemp(2),{value:Number((r-.4).toFixed(1))}),Qt(!0);let n=P("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),zt%3===0&&Ln(1)}function _n(t,e){He.busy=!0,He.direction=e,He.zone=t,He.startedAt=Date.now()}function Ds(){return He.startedAt?Date.now()-He.startedAt:0}function $s(t,e,a){if(!a)return .4;let o=e==="open";return t<180?o?22:28:t<500?o?15.2:19.4:t<2200?o?14.6:19.1:!o&&t<2800?24.2:!o&&t<3400?20.4:t<ea-300?o?18.5:26.8:o?25.4:41.2}function Is(t,e,a){return a?e==="open"?t>ea-300?3:0:t<2200?0:t<3e3?1:t<ea-300?2:3:0}function Sn(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function Mn(){let t=Ds(),e=He.busy&&t<ea;He.busy&&!e&&(He.busy=!1);let a=$s(t,He.direction,e||t<ea+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:E(l.freeInternalKb)||142,dma_kb:E(l.freeDmaKb)||118,largest_internal_kb:E(l.largestInternalKb)||64,min_internal_kb:E(l.minInternalKb)||96,psram_kb:E(l.freePsramKb)||7800,largest_psram_kb:E(l.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:M(l.bleHubEnabled)==="on",scanning:M(l.bleScanning)==="on",demanded:M(l.bleDemanded)==="on",ads_per_sec:E(l.bleAdsPerSec)||0,last_adv_age_ms:E(l.bleLastAdvAgeMs)||0},drivers_enabled:!!J.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(a.toFixed(1)),stroke_phase:Is(t,He.direction,e),armed:!!J.driversEnabled,latch_arm_level:1,latch_state_level:0,motor_enable_level:0,tacho_period_us:Sn(t,e),tacho_cadence_us:Sn(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:zt}}}}function Hs(t,e){let a=e==="open";if(t<180)return a?22-t*.03:28-t*.04;if(t<650)return a?14.8:19.2;if(t<2200)return(a?14.5:19)+Math.sin(t/90)*.35;if(!a&&t<2600)return 19+(t-2200)*.012;if(!a&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return a?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let o=a?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(a?26.4:44.5,o)}function An(t){let e=t||He.direction||"open",a=e==="open",o=a?3900:4200,r=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],n=0;for(let s=0;s<=o;s+=10){let d=Hs(s,e);s>180&&s<o-80&&(n+=s%20===0?1:0);let p=0;a?p=s>o-400?3:0:s>=2200&&s<3e3?p=1:s>=3e3&&s<3600?p=2:s>=3600&&(p=3);let u=s<200?3200:s<o-400?1800+Math.round(Math.sin(s/140)*80):4200;r.push([s,n,d.toFixed(1),1200,1,a?1:0,1,p,u,40,0,0,0,0,0,1,0].join(","))}return r.join(`
`)+`
`}function En(){wn||(Rs(),mt(!0),wn=setInterval(Ps,1200))}function Ca(t){let e=t.key||"",a=t.value,o=t.zone||0;if(e==="zone_setpoint"&&o>=1&&o<=ye){let n=Number(a);Number.isNaN(n)||(J.setpoint[o-1]=n,k(h.setpoint(o),{value:n}),k(h.baseSetpoint(o),{value:n}),k(h.effectiveSetpoint(o),{value:n}),K("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(e==="zone_enabled"&&o>=1&&o<=ye){let n=a>.5;J.enabled[o-1]=n?1:0,k(h.enabled(o),{value:n,state:n?"on":"off"}),K("Zone "+o+(n?" enabled":" disabled"),o);return}if(e==="drivers_enabled"){let n=a>.5;J.driversEnabled=n?1:0,n||(He.busy=!1),k(l.drivers,{value:n,state:n?"on":"off"}),K(n?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let n=a>.5;J.manualMode=n?1:0,Be("manualMode",n);return}if(e==="motor_target"&&o>=1&&o<=ye){let n=Number(a||0);k(h.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),K("Motor "+o+" target set to "+n+"%",o);return}if(e==="command"){let n=String(a);if(n==="i2c_scan"){Dt(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),K("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){K("Command executed: "+n);return}if(n==="firmware_check"||n==="firmware_prepare"){K("Command executed: "+n);return}if(n==="firmware_install"){K("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(n==="open_motor_timed"&&o>=1&&o<=ye){_n(o,"open"),K("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=ye){_n(o,"close"),K("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=ye){He.busy=!1,K("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=ye){K("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=ye){K("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=ye){K("Motor "+o+" reset and relearn started",o);return}if(n==="ble_clock_sync_now"){k(l.bleClockSyncAdvertising,{state:"on"}),k(l.bleClockSyncLastError,{state:""}),setTimeout(()=>{k(l.bleClockSyncAdvertising,{state:"off"}),k(l.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),K("Room clock broadcast started");return}if(n==="dump_task_stats"){K("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&o>=1){k(h.probe(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="zone_temp_source"&&o>=1){k(h.tempSource(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sync_to"&&o>=1){k(h.syncTo(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="manifold_type"){k(l.manifoldType,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="manifold_flow_probe"){k(l.manifoldFlowProbe,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="manifold_return_probe"){k(l.manifoldReturnProbe,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="motor_profile_default"){k(l.motorProfileDefault,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="simple_preheat_enabled"){k(l.simplePreheatEnabled,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="minimum_flow_always"){k(l.minimumFlowAlways,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="ble_clock_sync_enabled"){k(l.bleClockSyncEnabled,{state:String(a)}),K("Setting updated: "+e+" = "+a);return}if(e==="zone_name"&&o>=1){k(h.name(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="zone_ble_mac"&&o>=1){k(h.ble(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_id"&&o>=1){k(h.sensorId(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_name"&&o>=1){k(h.sensorName(o),{state:String(a)}),K("Setting updated: "+e+" = "+a,o);return}if(e==="authority_approve_proposal"){k(l.authorityInstallationId,{state:M(l.authorityProposalInstallationId)||"lune-mock"}),k(l.authorityCoordinatorId,{state:M(l.authorityProposalCoordinatorId)||"touch-mock"}),k(l.authorityConfigured,{state:"on",value:!0}),k(l.authorityProposalPending,{state:"off",value:!1}),K("Discovered Lune Touch approved");return}if(e==="authority_revoke"){k(l.authorityInstallationId,{state:""}),k(l.authorityCoordinatorId,{state:""}),k(l.authorityConfigured,{state:"off",value:!1}),k(l.authorityState,{state:"unconfigured"}),K("Lune Touch disconnected");return}let r={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,relearn_after_movements:l.relearnAfterMovements,relearn_after_hours:l.relearnAfterHours,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct,min_zone_flow_pct:l.minZoneFlowPct,ble_clock_sync_interval_min:l.bleClockSyncIntervalMin};if(r[e]){let n=Number(a);Number.isNaN(n)||(k(r[e],{value:n}),K("Setting updated: "+e+" = "+a));return}}var uo="v1.1.0";function Tn(){return{tag_name:uo,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+uo+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+uo+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function Nn(t){let e=[];for(let a=1;a<=ye;a++)e.push({zone:a,name:M(h.name(a)),enabled:M(h.enabled(a))==="on",setpoint_c:E(h.setpoint(a)),probe:M(h.probe(a)),temp_source:M(h.tempSource(a)),ble_mac:M(h.ble(a)),sensor_id:M(h.sensorId(a)),sensor_name:M(h.sensorName(a)),sync_to:M(h.syncTo(a))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:M(l.firmware),device:{mac:M(l.mac)},settings:{manifold_type:M(l.manifoldType),manifold_flow_probe:M(l.manifoldFlowProbe),manifold_return_probe:M(l.manifoldReturnProbe),motor_profile_default:M(l.motorProfileDefault),min_zone_flow_pct:E(l.minZoneFlowPct),minimum_flow_always:M(l.minimumFlowAlways)==="on",simple_preheat_enabled:M(l.simplePreheatEnabled)==="on",ble_clock_sync_enabled:M(l.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:E(l.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(a=>({zone:a.zone,open_ripples:400+a.zone,close_ripples:390+a.zone}))}:null}}function Fn(t,e){let a=Object.keys(t&&t.settings||{}).length,o=Array.isArray(t&&t.zones)?t.zones.length:0,r=e&&t&&t.learned?ye:0;return K("Settings restored from backup (mock)"),{applied:a+o+r,skipped:e?0:ye,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Ca({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!J.enabled[t-1];Ca({key:"zone_enabled",value:e?1:0,zone:t})}};function mo(t,e){let a=URL.createObjectURL(e),o=document.createElement("a");o.href=a,o.download=t,o.rel="noopener",document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function go(t,e,a){mo(t,new Blob([String(e)],{type:(a||"text/plain")+";charset=utf-8"}))}function bo(t,e){let a=new Date,o=n=>String(n).padStart(2,"0"),r=a.getFullYear()+o(a.getMonth()+1)+o(a.getDate())+"-"+o(a.getHours())+o(a.getMinutes());return t+"-"+r+"."+e}var Ct="/api/v1",Os="https://api.github.com/repos/birkemosen/lune/releases/latest",qs="https://github.com/birkemosen/lune/releases/latest/download/",Bs="/update",js="lune-v6-settings",Pn="1";function Ke(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function fo(t){return Object.assign({"X-Lune-CSRF":Pn,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},t||{})}function ho(t,e){let a=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&a.append(r,n);let o=a.toString();return Ct+t+(o?"?"+o:"")}function Te(t,e,a){if(co(),Ke())try{return Ca(a),Promise.resolve({ok:!0})}finally{wa()}let o=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&o.append(r,String(n));return fetch(Ct+t,{method:"POST",headers:fo({"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"}),body:o.toString()}).then(async r=>{if(!r.ok&&[400,404,415].includes(r.status)&&(r=await fetch(ho(t,e),{method:"POST",headers:fo()})),!r.ok){let n=`POST ${t} failed (HTTP ${r.status})`;throw console.warn("API call failed: "+n),K(n),new Error(n)}return r}).catch(r=>{throw console.error(`API call error: POST ${t}:`,r),r}).finally(()=>{wa()})}function Vs(t,e,a){return co(),fetch(ho(t,a),{method:"POST",headers:fo({"Content-Type":"application/json"}),body:JSON.stringify(e)}).finally(()=>{wa()})}function vo(t,e){let a=Number(e);k(h.setpoint(t),{value:a}),k(h.baseSetpoint(t),{value:a});let o=Number(E(h.coordinatorOffset(t))),r=Number.isFinite(o)?a+o:a;return k(h.effectiveSetpoint(t),{value:r}),Te(`/zones/${t}/setpoint`,{setpoint_c:a},{key:"zone_setpoint",value:a,zone:t})}function Dn(t,e){return k(h.enabled(t),{state:e?"on":"off",value:e}),Te(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function $t(t){return k(l.drivers,{state:t?"on":"off",value:t}),Te("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}async function xo({hz:t=100,durationMs:e=4e3,clamp:a=!1}={}){return Ke()?{ok:!0,data:{cycles:Math.max(1,Math.floor(e/10)),hz:t,clamp:!!a,armed:!0,armed_at_cycle:1,latch_state_start:1,latch_state_end:0}}:(await Te("/motors/arm-clock-probe",{hz:t,duration_ms:e,clamp:a?1:0})).json()}function Oe(t,e){return Te("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function $n(){return Dt("Scanning I2C bus..."),K("I2C scan started"),Oe("i2c_scan")}var Us={zone_probe:t=>h.probe(t),zone_temp_source:t=>h.tempSource(t),zone_sync_to:t=>h.syncTo(t)},Zs={zone_ble_mac:t=>h.ble(t),zone_sensor_id:t=>h.sensorId(t),zone_sensor_name:t=>h.sensorName(t),zone_name:t=>h.name(t)},Ws={manifold_type:l.manifoldType,manifold_flow_probe:l.manifoldFlowProbe,manifold_return_probe:l.manifoldReturnProbe,motor_profile_default:l.motorProfileDefault,simple_preheat_enabled:l.simplePreheatEnabled,ble_clock_sync_enabled:l.bleClockSyncEnabled},Ks={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,relearn_after_movements:l.relearnAfterMovements,relearn_after_hours:l.relearnAfterHours,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:l.bleClockSyncIntervalMin};function nt(t,e,a){let o=Us[e];return o&&k(o(t),{state:a}),Te("/settings/select",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function It(t,e,a){let o=Zs[e];return o&&k(o(t),{state:a}),Te("/settings/text",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function Ne(t,e){let a=Ws[t];return a&&k(a,{state:e}),Te("/settings/select",{key:t,value:e},{key:t,value:e})}function Re(t,e){let a=Number(e),o=Ks[t];return o&&!Number.isNaN(a)&&k(o,{value:a}),Te("/settings/number",{key:t,value:a},{key:t,value:a})}function In(){return Te("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:M(l.authorityProposalInstallationId)||"lune-mock",coordinator_id:M(l.authorityProposalCoordinatorId)||"touch-mock"}},a=(e==null?void 0:e.data)||{};return a.installation_id&&k(l.authorityInstallationId,{state:a.installation_id}),a.coordinator_id&&k(l.authorityCoordinatorId,{state:a.coordinator_id}),k(l.authorityConfigured,{state:"on",value:!0}),k(l.authorityProposalPending,{state:"off",value:!1}),e})}function Hn(){return Te("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return k(l.authorityInstallationId,{state:""}),k(l.authorityCoordinatorId,{state:""}),k(l.authorityConfigured,{state:"off",value:!1}),t})}function On(t,e){let a=String(e||"").trim();return K("Zone "+t+" renamed to "+(a||"(blank)"),t),It(t,"zone_name",a)}function qn(t,e){let a=Number(e),o=Number.isNaN(a)?0:Math.max(0,Math.min(100,Math.round(a)));return k(h.motorTarget(t),{value:o}),K("Motor "+t+" target set to "+o+"%",t),Te(`/motors/${t}/target`,{value:o},{key:"motor_target",value:o,zone:t})}function Bn(t){let e=Math.round(Number(t));return!Number.isFinite(e)||e<=0?1e4:Math.max(100,Math.min(45e3,e))}function Ma(t,e=1e4){let a=Bn(e);return K("Motor "+t+" open for "+a+"ms",t),Te(`/motors/${t}/open_timed`,{duration_ms:a},{key:"command",value:"open_motor_timed",zone:t,duration_ms:a})}function Aa(t,e=1e4){let a=Bn(e);return K("Motor "+t+" close for "+a+"ms",t),Te(`/motors/${t}/close_timed`,{duration_ms:a},{key:"command",value:"close_motor_timed",zone:t,duration_ms:a})}function yo(t){return K("Motor "+t+" stopped",t),Te(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function jn(){K("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(Te(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>$t(!1).then(()=>e))}async function Lt(){if(Ke())return Mn();let t=await fetch(Ct+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function wo(){if(Ke())return An();let t=await fetch(Ct+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function Ht(t){return Be("manualMode",!!t),K(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),Te("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function Vn(t){return K("Motor "+t+" fault reset",t),Oe("motor_reset_fault",t)}function Ea(t){return K("Motor "+t+" learned factors reset",t),Oe("motor_reset_learned_factors",t)}function Un(t){return K("Motor "+t+" reset and relearn started",t),Oe("motor_reset_and_relearn",t)}function Zn(){return K("Task/heap stats dumped to device log"),Oe("dump_task_stats")}function ko(){Ke()||fetch(Ct+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&ka(t)}).catch(()=>{})}function Wn(){return Oe("firmware_check")}function Kn(){return K("Firmware install requested"),Oe("firmware_install")}function Gn(){return Oe("firmware_prepare")}function _o(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:qs+e}}function Rn(t,e){let a=Array.isArray(t)?t:[],o=n=>a.find(s=>n.test(String(s&&s.name||""))),r=o(/^lune-v6.*\.ota\.bin$/i)||o(/\.ota\.bin$/i)||o(/\.bin$/i);return r&&r.browser_download_url?{name:String(r.name),url:String(r.browser_download_url)}:_o(e)}var gt=class extends Error{constructor(e,a,o){super(o||e),this.name="ReleaseCheckError",this.code=e,this.status=a||0}};async function Xn(){if(Ke()){let o=Tn(),r=String(o&&o.tag_name||"");return{tag:r,notes:String(o&&o.body||""),publishedAt:String(o&&o.published_at||""),asset:Rn(o&&o.assets,r)}}let t;try{t=await fetch(Os,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(o){throw new gt("network",0,o&&o.message?o.message:"network")}if(t.status===404)throw new gt("no_releases",404,"No published GitHub release");if(!t.ok)throw new gt("http",t.status,"Release check failed: "+t.status);let e=await t.json(),a=String(e&&e.tag_name||"");if(!a)throw new gt("no_releases",404,"No published GitHub release");return{tag:a,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Rn(e&&e.assets,a)}}function Yn(t,e){return Ke()?new Promise(a=>{let o=0,r=setInterval(()=>{o=Math.min(100,o+20),e&&e(o),o>=100&&(clearInterval(r),K("Firmware image uploaded (mock)"),a("Update Successful!"))},220)}):new Promise((a,o)=>{let r=new FormData;r.append("update",t,t.name);let n=new XMLHttpRequest;n.open("POST",Bs),n.setRequestHeader("X-Lune-CSRF",Pn),n.upload.onprogress=s=>{e&&s.lengthComputable&&e(Math.min(100,Math.round(s.loaded/s.total*100)))},n.onload=()=>{let s=String(n.responseText||"");if(n.status>=200&&n.status<300&&!/fail/i.test(s)){a(s);return}o(new Error("OTA upload rejected: "+n.status+" "+s))},n.onerror=()=>o(new Error("OTA upload connection lost")),n.send(r)})}function La(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function Jn(t=!0){if(Ke())return La(Nn(t));let e=await fetch(ho("/settings/export",{include_learned:t?1:0}),{cache:"no-store"});if(!e.ok)throw new Error("Settings export failed: "+e.status);return La(await e.json())}function Ta(t){let e=La(t);return!!(e&&e._type===js)}async function Qn(t,e=!0){let a=typeof t=="string"?JSON.parse(t):t,o=La(a);if(!Ta(o))throw new Error("not_a_lune_backup");if(Ke())return Fn(o,e);let r=await Vs("/settings/import",Object.assign({},o,{restore_learned:!!e}),{restore_learned:e?1:0});if(!r.ok)throw new Error("Settings restore failed: "+r.status);let n=await r.json().catch(()=>({})),s=n&&n.data?n.data:n||{};return K("Settings restored from backup"),{applied:Number(s.applied||0),skipped:Number(s.skipped||0),ignored:Number(s.ignored||0)}}function er(t){let e=bo("lune-v6-settings","json");return go(e,JSON.stringify(t,null,2),"application/json"),e}function Gs(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Sa().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function tr(){let t=bo("lune-v6-logs","txt");if(Ke())return go(t,Gs()||"No log lines buffered."),t;let e=await fetch(Ct+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return mo(t,await e.blob()),t}function So(){if(Ke())return;let t=xn();fetch(Ct+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&_a(e.lines,e.next_seq)}).catch(()=>{})}var Mt=null,ar=null,or=null,nr=null,zo=null,Co=!1;function rt(){return!!P("motorLabBusy")||Co}async function Xs(){Mt&&Mt.abort(),Mt=new AbortController;let t=await fetch("/api/v1/state",{cache:"no-store",signal:Mt.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function rr(t){if(!(!t||typeof t!="object")&&!vn()){for(let e in t)k(e,t[e]);Qt(!1)}}function Ys(t){if(t){if(!t.type){rr(t);return}if(t.type==="state"){rr(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;K(e),String(e).indexOf("I2C_SCAN:")!==-1&&Dt(String(e))}}}function Js(){rt()||ko(),ar||(ar=setInterval(()=>{rt()||ko()},300*1e3)),rt()||So(),or||(or=setInterval(()=>{rt()||So()},3e3))}function Lo(){rt()||Xs().then(t=>{rt()||(mt(!0),Ys(t),Js())}).catch(()=>{rt()||mt(!1)})}async function Qs(){try{if(rt())return;let t=await fetch("/api/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),a=e&&e.data,o=a&&a.data_revision;a&&a.uptime_s!=null&&k(l.uptime,{value:Number(a.uptime_s)}),(zo===null||o!==zo)&&(zo=o,Lo()),mt(!0)}catch(t){rt()||mt(!1)}}function ei(){Co=!0,Mt&&(Mt.abort(),Mt=null)}function ti(){Co=!1,Lo()}function sr(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){En();return}U("motorLabBusy",()=>{P("motorLabBusy")?ei():ti()}),Lo(),nr||(nr=setInterval(Qs,3e3))}var ir=Object.create(null);function D(t,e){if(ir[t])return;ir[t]=1;let a=document.createElement("style");a.textContent=e,document.head.appendChild(a)}var lr=`/* Generated from LDS tokens.json by generate_tokens.py. Do not edit. */
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
`;D("lds-tokens",lr);var Na={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","nav.overview":"Overview","nav.help":"Help","nav.more":"More","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.scrollBottom":"Scroll to bottom","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.noData":"No data","overview.graph.collecting":"Collecting history\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 open Zones to clear or relearn.","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armed)","overview.timeline.absorbReactive":"Absorb (reactive)","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Valve","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.override.remaining":"Touch offset {offset} \xB7 {remaining} remaining","zone.override.hint":"Temporary command from Lune Touch","zone.chart.kicker":"Temperature \xB7 last 24h","zone.chart.note":"Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.","zone.demand":"Demand","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.sensor.externalSource":"External (Wi\u2011Fi)","zone.sensor.externalTitle":"External (Wi\u2011Fi)","zone.sensor.externalNote":"Bind a stable sensor_id. Hubs POST temperatures; zone mapping stays on V6. See Help \u2192 External room temperature.","zone.sensor.sensorIdPh":"sensor_id (MAC or entity id)","zone.sensor.sensorNamePh":"Friendly name (optional)","zone.sensor.noIngestYet":"No external temperature received yet.","zone.sensor.lastIngestAge":"Last ingest {sec}s ago (stale after 15 min).","help.external.title":"External room temperature","help.external.intro":"V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.","help.external.keyWarn":"Scripts include your browser session key if set \u2014 treat it as a secret.","help.external.copy":"Copy","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","settings.manifold.title":"Manifold Configuration","settings.manifold.panelTitle":"Manifold and probes","settings.manifold.panelSub":"Valve polarity and live 1-Wire readings","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe temperatures","settings.manifold.availableProbes":"Available probes","settings.manifold.availableProbesSub":"How many 1-Wire sensors are fitted on this manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Return","settings.manifold.roleBoth":"Flow \xB7 Return","settings.manifold.probeConflict":"That probe is already assigned to another role.","settings.manifold.unusedProbeWarn":"{enabled} active zones but only {assigned} zone return probes assigned.","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.panelSub":"Minimum opening on active loops","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"Local V6 hydraulic safeguard; heat-source and pump stay external.","settings.minFlow.opening":"Minimum total opening (%)","settings.minFlow.openingSub":"Only across loops already accepting heat.","settings.minFlow.failsafe":"Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.","settings.returnTemp.title":"Return temperature","settings.returnTemp.panelSub":"Optional per-zone return probes","settings.returnTemp.modeOff":"2 probes \xB7 flow/return only","settings.returnTemp.modeOn":"8 probes \xB7 per-zone returns","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Legacy return-temp balancing only \u2014 not needed for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.panelSub":"Shelly BLU display time","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: the close stroke is capped at 34s and 2600 commutations \u2014 40s is where the plunger leaves its housing. Opening is capped separately at 45s.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Product colour is amber for heat and forest for healthy state. Light and dark follow the system appearance.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.product":"Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Local handling of external preload","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. A new DEMAND redistributes flow instead of releasing the window.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armed","settings.preheat.reactive":"Reactive","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.enable.title":"Enable the drivers","diagnostics.lab.enable.copy":"Rev 3.3 has no fault latch. This pauses automatic zone control and raises DRIVER_N_SLEEP so the bridges can run.","diagnostics.lab.enable.action":"Enable drivers","diagnostics.lab.log.enableWait":"Raising DRIVER_N_SLEEP \u2014 no LATCH_ARM on this board","diagnostics.lab.enableBanner":"The drivers did not enable. FAULT_N_RAW, rail overcurrent or the USB switch may be asserted.","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The browser keeps the live chart for the full stroke.","diagnostics.lab.tune.title":"Endstop thresholds","diagnostics.lab.tune.copy":"Raise the threshold multiplier if the stroke stops too early. Slope no longer stops the drive and is charted as telemetry only. Changes apply immediately to this controller.","diagnostics.lab.log.tune":"Threshold {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Cleared learned motor factors for a clean stroke","diagnostics.lab.log.resetLearnedFailed":"Could not clear learned factors \u2014 continuing","diagnostics.lab.log.duration":"Timed move arm set to {seconds}s","diagnostics.lab.log.browserLog":"Chart kept from browser log ({seconds}s)","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armPulseWait":"Waiting for latch arm pulse \u2014 pad 10 should read 3.3 V for ~5 s","diagnostics.lab.log.armProbeWait":"Square-waving LATCH_ARM at 100 Hz \u2014 U2 pin 1 should show ~0.5 V AC","diagnostics.lab.log.armProbe":"Clock probe {hz} Hz \xD7 {cycles} cycles \u2014 armed {armed} (first at {at})","diagnostics.lab.log.armHigh":"Firmware readback: pad 10 HIGH (GPIO17 is driven)","diagnostics.lab.log.armGpio":"GPIO17 never went high \u2014 pad 10 stayed LOW in firmware readback","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.latchFaulted":"Fault latch did not arm \u2014 LATCH_STATE stayed high after the pulse","diagnostics.lab.log.enableFailed":"Drivers did not enable \u2014 a fault net may be asserted","diagnostics.lab.log.neverStarted":"Motor never started (busy stayed off)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"The fault latch did not arm: LATCH_STATE stayed high after the arm pulse. Firmware cannot read FAULT_N_RAW, so the cause cannot be narrowed from here. Either a driver fault is latched (check driver nFAULT, the overcurrent comparator, 3V3_MOTOR) or the arm clock never reached the flip-flop (check R4, C4, Q1 and U2).","diagnostics.lab.armGpioBanner":"GPIO17 never went high. Watch pad 10 while Arming: it must read 3.3 V. If the gauge stays LOW, firmware is not driving the pin.","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.noEndstop":"No {direction} endstop in {seconds}s \u2014 still free-travel; try again after a full seat, or raise safe runtime","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.spurious":"Tacho count is rising while current rises \u2014 the edges are brush arcing, not commutations. Cadence and motion count are unreliable for the rest of this stroke.","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relative Kv (orifice model)","diagnostics.lab.kvHint":"Used by the flow allocator","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 Motor Lab holds background polls","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","nav.overview":"Overblik","nav.help":"Hj\xE6lp","nav.more":"Mere","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.scrollBottom":"Til bunden","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.noData":"Ingen data","overview.graph.collecting":"Indsamler historik\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 \xE5bn Zoner for at kvittere eller genl\xE6re.","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armeret)","overview.timeline.absorbReactive":"Absorb (reaktiv)","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Ventil","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.override.remaining":"Touch-offset {offset} \xB7 {remaining} tilbage","zone.override.hint":"Midlertidig kommando fra Lune Touch","zone.chart.kicker":"Temperatur \xB7 seneste 24t","zone.chart.note":"Den stiplede linje er det langsigtede setpunkt. Gulvvarme bev\xE6ger sig langsomt, s\xE5 kurven er det nyttige signal.","zone.demand":"Behov","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.sensor.externalSource":"Ekstern (Wi\u2011Fi)","zone.sensor.externalTitle":"Ekstern (Wi\u2011Fi)","zone.sensor.externalNote":"Bind et stabilt sensor_id. Hubs poster temperaturer; zone-mapping sker kun p\xE5 V6. Se Hj\xE6lp \u2192 Ekstern rumtemperatur.","zone.sensor.sensorIdPh":"sensor_id (MAC eller entity-id)","zone.sensor.sensorNamePh":"Venligt navn (valgfrit)","zone.sensor.noIngestYet":"Ingen ekstern temperatur modtaget endnu.","zone.sensor.lastIngestAge":"Seneste ingest for {sec}s siden (stale efter 15 min).","help.external.title":"Ekstern rumtemperatur","help.external.intro":"V6 accepterer HTTP POST med sensor_id. Zone-mapping sker kun p\xE5 V6. Touch ingerer ikke temperaturer.","help.external.keyWarn":"Scripts inkluderer din browser-session-n\xF8gle hvis sat \u2014 behandl den som hemmelighed.","help.external.copy":"Kopi\xE9r","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","settings.manifold.title":"Manifold-konfiguration","settings.manifold.panelTitle":"Manifold og prober","settings.manifold.panelSub":"Ventilpolaritet og live 1-Wire-m\xE5linger","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.availableProbes":"Tilg\xE6ngelige prober","settings.manifold.availableProbesSub":"Hvor mange 1-Wire-sensorer der er monteret p\xE5 denne manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Retur","settings.manifold.roleBoth":"Flow \xB7 Retur","settings.manifold.probeConflict":"Den probe er allerede tildelt en anden rolle.","settings.manifold.unusedProbeWarn":"{enabled} aktive zoner, men kun {assigned} zone-returprober tildelt.","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.panelSub":"Minimum \xE5bning p\xE5 aktive sl\xF8jfer","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"Lokal V6-hydrauliksikring; varmekilde og pumpe forbliver eksterne.","settings.minFlow.opening":"Minimum total \xE5bning (%)","settings.minFlow.openingSub":"Kun p\xE5 sl\xF8jfer, der allerede tager varme.","settings.minFlow.failsafe":"Manifoldventilerne er Normally Open: ved str\xF8msvigt \xE5bner alle ventiler. Hvis cirkulationspumpen stadig har str\xF8m (eller kommer f\xF8rst online), kan sekund\xE6rsiden f\xE5 ubegr\xE6nset flow indtil V6 genstarter og genoptager styring.","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.panelSub":"Valgfrie returprober pr. zone","settings.returnTemp.modeOff":"2 prober \xB7 kun flow/retur","settings.returnTemp.modeOn":"8 prober \xB7 retur pr. zone","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Kun til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendig for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.panelSub":"Tid p\xE5 Shelly BLU-displays","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: luk-slaget er begr\xE6nset til 34s og 2600 kommutationer \u2014 ved 40s forlader stemplet motorhuset. \xC5bning har sin egen gr\xE6nse p\xE5 45s.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Produktfarven er amber til varme og skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.product":"Amber til handling og varme, skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Lokal h\xE5ndtering af ekstern forvarmning","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Nyt DEMAND omfordeler flow i stedet for at slippe vinduet.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armeret","settings.preheat.reactive":"Reaktiv","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.enable.title":"T\xE6nd driverne","diagnostics.lab.enable.copy":"Rev 3.3 har ingen fejl-latch. Det s\xE6tter automatisk zonestyring p\xE5 pause og s\xE6tter DRIVER_N_SLEEP h\xF8j, s\xE5 broerne kan k\xF8re.","diagnostics.lab.enable.action":"T\xE6nd drivere","diagnostics.lab.log.enableWait":"S\xE6tter DRIVER_N_SLEEP \u2014 ingen LATCH_ARM p\xE5 dette board","diagnostics.lab.enableBanner":"Driverne t\xE6ndte ikke. FAULT_N_RAW, skinne-overstr\xF8m eller USB-kontakten kan v\xE6re aktiv.","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Browseren beholder live-grafen for hele slaget.","diagnostics.lab.tune.title":"Endstop-t\xE6rskler","diagnostics.lab.tune.copy":"H\xE6v t\xE6rskel-multiplikatoren, hvis slaget stopper for tidligt. Slope stopper ikke l\xE6ngere motoren og vises kun som telemetri. \xC6ndringer g\xE6lder med det samme p\xE5 denne controller.","diagnostics.lab.log.tune":"T\xE6rskel {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Nulstillede l\xE6rte motorfaktorer for et rent slag","diagnostics.lab.log.resetLearnedFailed":"Kunne ikke nulstille l\xE6rte faktorer \u2014 forts\xE6tter","diagnostics.lab.log.duration":"Timed move sat til {seconds}s","diagnostics.lab.log.browserLog":"Graf beholdt fra browser-log ({seconds}s)","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armPulseWait":"Venter p\xE5 latch-puls \u2014 pad 10 skal vise 3,3 V i ca. 5 s","diagnostics.lab.log.armProbeWait":"Firkant p\xE5 LATCH_ARM ved 100 Hz \u2014 U2 pin 1 skal vise ca. 0,5 V AC","diagnostics.lab.log.armProbe":"Clock-probe {hz} Hz \xD7 {cycles} cyklusser \u2014 armeret {armed} (f\xF8rst ved {at})","diagnostics.lab.log.armHigh":"Firmware-readback: pad 10 HIGH (GPIO17 drives)","diagnostics.lab.log.armGpio":"GPIO17 gik aldrig h\xF8j \u2014 pad 10 forblev LOW i firmware-readback","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.latchFaulted":"Fejl-latch armerede ikke \u2014 LATCH_STATE forblev h\xF8j efter pulsen","diagnostics.lab.log.enableFailed":"Driverne t\xE6ndte ikke \u2014 et fejlnet kan v\xE6re aktivt","diagnostics.lab.log.neverStarted":"Motoren startede aldrig (busy blev ved med at v\xE6re slukket)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"Fejl-latch armerede ikke: LATCH_STATE forblev h\xF8j efter arm-pulsen. Firmware kan ikke l\xE6se FAULT_N_RAW, s\xE5 \xE5rsagen kan ikke indkredses herfra. Enten er en driverfejl l\xE5st (tjek driver nFAULT, overstr\xF8mskomparatoren og 3V3_MOTOR), eller arm-clocken n\xE5ede aldrig flip-floppen (tjek R4, C4, Q1 og U2).","diagnostics.lab.armGpioBanner":"GPIO17 gik aldrig h\xF8j. Pad 10 skal vise 3,3 V mens der armeres. Hvis m\xE5leren bliver p\xE5 LOW, driver firmware ikke pinnen.","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.noEndstop":"Ingen {direction}-endstop i {seconds}s \u2014 stadig fri l\xF8b; pr\xF8v efter fuld seat, eller h\xE6v safe runtime","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.spurious":"Tacho-t\xE6llingen stiger mens str\xF8mmen stiger \u2014 kanterne er b\xF8rste-gnister, ikke kommutationer. Kadence og t\xE6lling er ikke trov\xE6rdige i resten af dette slag.","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relativ Kv (\xE5bningsmodel)","diagnostics.lab.kvHint":"Bruges af flowallokatoren","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 Motor Lab holder baggrundspoll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},dr="en".toLowerCase(),Mo=Na[dr]?dr:"en";function c(t,e){let a=Na[Mo]&&Na[Mo][t]||Na.en[t]||t;return e?String(a).replace(/\{(\w+)\}/g,(o,r)=>e[r]==null?"":String(e[r])):a}function R(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=c(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",c(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",c(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",c(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Mo);var cr=`
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
`;function At(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pr(t,e,a){let o=Number(e),r=Number(a),n=Number(t),s=r-o;return!Number.isFinite(o)||!Number.isFinite(r)||!Number.isFinite(n)||s===0?0:Math.min(100,Math.max(0,(n-o)/s*100))}function Ao({id:t,markHtml:e="",target:a,current:o,min:r=5,max:n=35,step:s=.5,unit:d="C",label:p,disabled:u=!1}={}){let x=t||"lds-dial",i=At(p||"Temperature target"),b=Number(a),y=Number(o),w=Number.isFinite(b)?b.toFixed(1):"\u2014",L=Number.isFinite(y)?y.toFixed(1):"\u2014",T=d==="C"||d==="\xB0C"||d==="\xB0"?"\xB0":At(d),_=u?' aria-disabled="true"':"";return`<div class="lds-dial" id="${At(x)}" role="group" aria-label="${i}" data-dial-min="${r}" data-dial-max="${n}" data-dial-unit="${At(T)}"${_}>
  <div class="lds-dial-arc">
    ${e}
    <div class="lds-dial-readout">
      <div class="lds-dial-target"><span data-dial-target>${w}</span><span class="lds-dial-unit">${T}</span></div>
      <div class="lds-dial-current" data-dial-current>Current ${L}${T}</div>
    </div>
    <span class="lds-dial-live" data-dial-live aria-live="polite">${w}${T}</span>
  </div>
  <div class="lds-dial-steps">
    <button type="button" class="lds-dial-step" data-dial-step="${s}" aria-label="Increase" ${u?"disabled":""}>+</button>
    <button type="button" class="lds-dial-step" data-dial-step="-${s}" aria-label="Decrease" ${u?"disabled":""}>\u2212</button>
  </div>
</div>`}function Eo(t,{target:e,current:a,disabled:o,states:r,selected:n}={}){let s=typeof t=="string"?document.querySelector(t):t;if(!s)return;let d=s.dataset.dialUnit||"\xB0",p=Number(e),u=Number(a),x=Number.isFinite(p)?p.toFixed(1):"\u2014",i=Number.isFinite(u)?u.toFixed(1):"\u2014",b=s.querySelector("[data-dial-target]"),y=s.querySelector("[data-dial-current]"),w=s.querySelector("[data-dial-live]");b&&(b.textContent=x),y&&(y.textContent=`Current ${i}${d}`),w&&(w.textContent=`${x}${d}`),r&&s.querySelectorAll(".pipe").forEach((L,T)=>{let _=r[T]||"idle";L.setAttribute("class",`pipe is-${_}${T===n?" is-focus":""}`)}),o!=null&&(s.setAttribute("aria-disabled",o?"true":"false"),s.querySelectorAll(".lds-dial-step").forEach(L=>{L.disabled=!!o}))}function To(t,e={}){let a=typeof t=="string"?document.querySelector(t):t;if(!a)return()=>{};let o=r=>{var d;let n=r.target.closest("button.lds-dial-step[data-dial-step]");if(!n||!a.contains(n)||n.disabled)return;let s=parseFloat(n.getAttribute("data-dial-step"));if(Number.isFinite(s)){if(e.onStep)e.onStep(s);else if(e.onChange){let p=parseFloat(a.dataset.dialMin),u=parseFloat(a.dataset.dialMax),x=parseFloat((d=a.querySelector("[data-dial-target]"))==null?void 0:d.textContent),i=Number.isFinite(x)?x:20,b=Math.min(u,Math.max(p,Math.round((i+s)*10)/10));e.onChange(b)}}};return a.addEventListener("click",o),()=>a.removeEventListener("click",o)}function No({remaining:t="",hint:e="Temporary command from Lune Touch"}={}){return`<div class="lds-override-banner ui-override-banner" data-override-banner ${!String(t||"").trim()?"hidden":""}>
  <div class="lds-override-main ui-override-main">
    <strong data-override-remaining>${At(t)}</strong>
    <small data-override-hint>${At(e)}</small>
  </div>
</div>`}function Fo(t,{remaining:e="",hint:a}={}){var p;let o=typeof t=="string"?document.querySelector(t):t;if(!o)return;let r=(p=o.matches)!=null&&p.call(o,"[data-override-banner]")?o:o.querySelector("[data-override-banner]");if(!r)return;let n=r.querySelector("[data-override-remaining]"),s=r.querySelector("[data-override-hint]"),d=String(e||"").trim();r.hidden=!d,n&&(n.textContent=d),s&&a!==void 0&&(s.textContent=a)}function Ro({min:t=5,max:e=35,step:a=.5,value:o=21,label:r="Comfort setpoint",disabled:n=!1}={}){let s=Number(o),d=Number.isFinite(s)?s.toFixed(1):"\u2014",p=pr(s,t,e),u=n?" disabled":"";return`<div class="lds-slider-row slider-row" data-lds-slider-row>
  <input data-comfort-slider type="range" min="${t}" max="${e}" step="${a}" value="${Number.isFinite(s)?s:t}" aria-label="${At(r)}" style="--slider-fill:${p}%"${u}>
  <strong data-slider-value>${d}\xB0</strong>
</div>`}function Fa(t){if(!t)return;let e=t.min,a=t.max,o=t.value,r=pr(o,e,a);t.style.setProperty("--slider-fill",`${r}%`)}var Ra=`
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
`;function ur(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pe({on:t=!1,disabled:e=!1,label:a="",title:o="",attrs:r="",className:n=""}={}){let s=["lds-nav-switch","nav-switch",t?"is-on":"",e?"is-disabled":"",n].filter(Boolean).join(" "),d=ur(a||o||"Toggle"),p=o||a?` title="${ur(o||a)}"`:"";return`<button type="button" class="${s}" role="switch" aria-checked="${t?"true":"false"}" aria-label="${d}"${p}${e?" disabled":""} data-lds-nav-switch ${r}></button>`}function Pa(t,{on:e,disabled:a}={}){var r,n;if(!t)return;let o=(r=t.matches)!=null&&r.call(t,"[data-lds-nav-switch]")?t:(n=t.querySelector)==null?void 0:n.call(t,"[data-lds-nav-switch]");o&&(e!==void 0&&(o.classList.toggle("is-on",!!e),o.setAttribute("aria-checked",e?"true":"false")),a!==void 0&&(o.classList.toggle("is-disabled",!!a),o.disabled=!!a))}var mr=`
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
`;function xe({titleHtml:t="",bodyHtml:e="",className:a="",attrs:o=""}={}){return`<div class="${["lds-settings-card","ui-card",a].filter(Boolean).join(" ")}" data-lds-settings-card ${o}>
  <div class="lds-settings-card-title ui-card-title"><span class="ui-title-text">${t}</span></div>
  <div class="lds-settings-card-body">${e}</div>
</div>`}D("lds-comfort-control",cr);D("lds-nav-switch",Ra);D("lds-settings-card",mr);var oi=`
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
`;D("ui-kit",oi);function Le(t){let e=c(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function ni(t,e){let a=Math.abs(Number(t));return!Number.isFinite(a)||a<1e3?e:Math.pow(10,Math.floor(Math.log10(a))-1)}function ri(t){let e=String(t),a=e.indexOf(".");return a<0?0:e.length-a-1}function Me(t,e={}){let a=!!e.immediate,o=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r),a&&(r.hidden=!0);let n=[],s=()=>{a||r.classList.toggle("show",n.some(g=>g.dirty))},d=g=>{g.dirty&&(g.commit&&Promise.resolve(g.commit()).catch(()=>{}),g.dirty=!1,s())},p=(g,m)=>{g.dirty=m,a&&m?d(g):s()};function u(g){return g.markDirty=()=>p(g,!0),n.push(g),g}function x(g,m){let f={dirty:!1,input:g},v=m.baseStep!=null?m.baseStep:parseFloat(g.step)||1,S=ri(v),F=m.min!=null?m.min:g.min!==""?parseFloat(g.min):-1/0,Y=m.max!=null?m.max:g.max!==""?parseFloat(g.max):1/0,H=te=>S>0?Number(te).toFixed(S):String(Math.round(Number(te)));if(!m.nostep){let te=document.createElement("div");te.className="ui-stepper",g.parentNode.insertBefore(te,g);let ne=document.createElement("button");ne.type="button",ne.className="ui-step-btn",ne.textContent="\u2212",ne.setAttribute("aria-label",c("common.decrease"));let le=document.createElement("button");le.type="button",le.className="ui-step-btn",le.textContent="+",le.setAttribute("aria-label",c("common.increase")),te.appendChild(ne),te.appendChild(g),te.appendChild(le);let W=Z=>{if(g.disabled)return;let pe=parseFloat(g.value);Number.isFinite(pe)||(pe=parseFloat(g.placeholder)),Number.isFinite(pe)||(pe=0);let X=Math.min(Y,Math.max(F,pe+Z*ni(pe,v)));g.value=H(X),p(f,!0)};ne.addEventListener("click",()=>W(-1)),le.addEventListener("click",()=>W(1)),g.addEventListener("keydown",Z=>{Z.key==="Enter"&&g.blur()})}return g.addEventListener("input",()=>p(f,!0)),f.sync=()=>{let te=m.read();g.value=te!=null&&Number.isFinite(Number(te))?H(te):""},f.commit=()=>{let te=parseFloat(g.value);Number.isFinite(te)&&m.commit(Math.min(Y,Math.max(F,te)))},u(f)}function i(g,m){let f={dirty:!1,input:g};g.addEventListener("input",()=>{f.dirty=!0,s()});let v=()=>{f.dirty&&a&&d(f)};return g.addEventListener("blur",v),g.addEventListener("keydown",S=>{S.key==="Enter"&&(S.preventDefault(),g.blur())}),f.sync=()=>{let S=m.read();g.value=S!=null?S:""},f.commit=()=>m.commit(g.value.trim()),u(f)}function b(g,m){let f={dirty:!1,input:g};return g.addEventListener("change",()=>p(f,!0)),f.sync=()=>{let v=m.read();v!=null&&(g.value=v)},f.commit=()=>m.commit(g.value),u(f)}function y(g,m){let f={dirty:!1,input:g,staged:!1},v=g.closest(".ui-row"),S=()=>{Pa(g,{on:f.staged}),v&&v.classList.toggle("is-on",f.staged),m.onChange&&m.onChange(f.staged)};return g.addEventListener("click",()=>{f.staged=!f.staged,p(f,!0),S()}),f.sync=()=>{f.staged=!!m.read(),S()},f.commit=()=>m.commit(f.staged),u(f)}function w(g){let m={dirty:!1,sync:g.sync,commit:g.commit};return u(m)}let L=()=>n.forEach(g=>{!g.dirty&&g.sync&&g.sync()}),T=()=>{n.forEach(g=>{g.dirty&&(g.commit&&Promise.resolve(g.commit()).catch(()=>{}),g.dirty=!1)}),s(),e.onApply&&e.onApply()},_=()=>{n.forEach(g=>{g.dirty=!1,g.sync&&g.sync()}),s(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",T),r.querySelector(".ui-form-discard").addEventListener("click",_),R(r),{num:x,text:i,select:b,toggle:y,custom:w,refresh:L,apply:T,discard:_,isDirty:()=>n.some(g=>g.dirty)}}function Ot(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function Da(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function qt(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,a=t%86400/3600|0,o=t%3600/60|0;return e>0?e+"d "+a+"h "+o+"m":a>0?a+"h "+o+"m":o+"m"}var gr=`
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
`;function Po(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function br({live:t=!1,label:e="Offline",uptime:a="---",ip:o="---",showUptime:r=!0,showIp:n=!0}={}){let s=t?"":" is-off",d=r?"":" hidden",p=n?"":" hidden";return`<div class="lds-live-status" data-lds-live-status>
  <div class="lds-live-row">
    <span class="lds-live${s}" data-lds-live><i aria-hidden="true"></i><span data-lds-live-label>${Po(e)}</span></span>
    <span class="lds-live-uptime" data-lds-uptime${d}>${Po(a)}</span>
  </div>
  <div class="lds-live-ip" data-lds-ip${p}>${Po(o)}</div>
</div>`}function $a(t,{live:e,label:a,uptime:o,ip:r}={}){var x,i;if(!t)return;let n=(x=t.matches)!=null&&x.call(t,"[data-lds-live-status]")?t:(i=t.querySelector)==null?void 0:i.call(t,"[data-lds-live-status]");if(!n)return;let s=n.querySelector("[data-lds-live]"),d=n.querySelector("[data-lds-live-label]"),p=n.querySelector("[data-lds-uptime]"),u=n.querySelector("[data-lds-ip]");s&&e!==void 0&&s.classList.toggle("is-off",!e),d&&a!==void 0&&d.textContent!==a&&(d.textContent=a),p&&o!==void 0&&p.textContent!==o&&(p.textContent=o),u&&r!==void 0&&u.textContent!==r&&(u.textContent=r)}var si=`
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
`;D("hv6-header",si);D("lds-live-status",gr);D("lds-nav-switch",Ra);var ii=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><button type="button" class="v6-toolbar-icon" aria-label="Collapse navigation" aria-pressed="false"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14"/></svg></button><div><p class="v6-toolbar-kicker" id="v6-view-kicker">Home</p><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button></div>
  </header>`,Ge=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,Ia=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,li=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Ge('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span class="menu-label">Overview</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Zones</div>
      <div class="v6-nav-zones" data-zone-nav></div>
      <a href="#" class="v6-side-link v6-tab-zones" data-section="zones" hidden>${Ge('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span class="menu-label">Zones</span>${Ia("warn")}</a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Ge('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span class="menu-label">Diagnostics</span>${Ia("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${Ge('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span class="menu-label">Motor lab</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Settings</div>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="touch">${Ge('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/>')}<span class="menu-label">Touch</span>${Ia()}</a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="hydraulics">${Ge('<path d="M4 18h16M7 18V9m5 9V5m5 13v-6"/>')}<span class="menu-label">Hydraulics</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="comfort">${Ge('<path d="M12 4v3M8 8l-2-2M16 8l2-2M6 13h12M9 13c0 4 3 7 3 7s3-3 3-7"/>')}<span class="menu-label">Comfort</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="motors">${Ge('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')}<span class="menu-label">Motors</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="device">${Ge('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>')}<span class="menu-label">Device</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Ge('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span>${Ia()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Ge('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span class="menu-label">Help</span></a></div>
    ${br({live:!1,label:"Offline",uptime:"---",ip:"---"})}
  </nav>`,fr={overview:["Overview / House status","System health & energy flow","Local heating status and current exceptions"],zones:["Controller details","Zones","Physical loops, applied targets and valve state"],diagnostics:["System","Diagnostics","Health, evidence and recovery"],motorlab:["System","Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Settings","Device configuration and safety"],help:["Utility","Help","Guidance for operating Lune V6"]},hr={touch:["Settings","Touch","Approval and coordinator identity"],hydraulics:["Settings","Hydraulics","Manifold probes, return temperature and minimum flow"],comfort:["Settings","Comfort","Room clocks and preheat absorption"],motors:["Settings","Motors","Drivers, profile and learning limits"],device:["Settings","Device","Connection, firmware, backup and appearance"]};function yr(t){t&&(je(t.section),t.focus==="touch"&&(ya("touch"),requestAnimationFrame(()=>{let e=document.querySelector(".settings-touch-card");e&&e.scrollIntoView({behavior:"smooth",block:"center"})})))}function vr(t){return t?t.kind==="touch"?c("status.attention.approveTouch"):t.kind==="faults"?t.count===1?c("status.attention.zoneFaultOne"):c("status.attention.zoneFaultMany",{count:t.count}):"":""}function di(t){if(!be(h.enabled(t)))return"OFF";let e=String(M(h.state(t))||"").toUpperCase()||"OFF",a=String(M(h.motorLastFault(t))||"").toUpperCase();return e==="FAULT"||a&&a!=="NONE"&&a!=="OK"?"FAULT":e}function ci(t){return t==="OFF"?"is-off":t==="FAULT"?"is-fault":t==="OVERHEATED"?"is-overheated":t==="HEATING"||t==="CALLING"?"is-heating":t==="IDLE"?"is-idle":"is-online"}function pi(t){return t==="HEATING"||t==="CALLING"?c("state.heating"):t==="IDLE"?c("state.idle"):t==="FAULT"?c("common.fault"):t==="MANUAL"?c("state.manual"):t==="OVERHEATED"?c("state.overheated"):t==="CALIBRATING"?c("state.calibrating"):c("state.off")}function xr(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}function ui(t){let e=Ie(t);return e?`${Ze(t)} ${e}`:Ze(t)}q({tag:"hv6-header",render:ii,onMount(t,e){let a=e.querySelector("#v6-view-kicker"),o=e.querySelector("#v6-view-title"),r=e.querySelector("#v6-view-subtitle"),n=e.querySelector("#hdr-update"),s=e.querySelector("#hdr-attention"),d=e.querySelector(".v6-toolbar-icon");d&&d.addEventListener("click",()=>{let b=document.querySelector(".shell");if(!b)return;let y=b.classList.toggle("nav-collapsed");d.setAttribute("aria-pressed",String(y))});function p(){let b=P("firmwareUpdateAvailable");n.hidden=!b,b&&(n.textContent=c("status.updateAvailable",{version:b.latest}),n.title=c("settings.firmware.badgeTitle"))}function u(){let b=lo(),y=P("section")||"overview",w=!!(b&&b.section!==y);s.hidden=!w,w?(s.textContent=vr(b),s.title=vr(b),s.dataset.kind=b.kind):delete s.dataset.kind}function x(){let b=P("selectedZone")||1,y=Ie(b);return y?`${Ze(b)} \xB7 ${y}`:Ce(b)}n.addEventListener("click",()=>{ya("device"),je("settings");let b=document.querySelector(".settings-firmware-card");b&&b.scrollIntoView({behavior:"smooth",block:"center"})}),s.addEventListener("click",()=>{yr(lo())});function i(){let b=P("section")||"overview",y=P("settingsPanel")||"touch",w=b==="settings"?hr[y]||hr.touch:fr[b]||fr.overview;a&&(a.textContent=w[0]),b==="zones"?(o.textContent=x(),r.textContent="Applied target, sensor coverage and local safety."):(o.textContent=w[1],r.textContent=w[2]),u()}U("section",i),U("settingsPanel",i),U("selectedZone",i),U("zoneNames",i),U("live",u),U("firmwareUpdateAvailable",p),C(l.authorityProposalPending,u);for(let b=1;b<=6;b++)C(h.state(b),u),C(h.motorLastFault(b),u);R(e),i(),p(),u()}});q({tag:"hv6-sidebar",render:li,onMount(t,e){let a=e,o=e.querySelector(".v6-more-toggle"),r=e.querySelector('[data-section="settings"][data-panel="touch"]'),n=e.querySelector(".v6-tab-zones"),s=e.querySelector('[data-section="diagnostics"]'),d=e.querySelector("[data-zone-nav]"),p=0,u=Date.now(),x=!1;function i(g,m,f,v){if(!g)return;let S=g.querySelector("[data-nav-dot]");S&&(S.hidden=!m,m?(g.setAttribute("aria-label",`${f}, ${v}`),g.title=v):(g.removeAttribute("aria-label"),g.removeAttribute("title")))}function b(){let g=xa(),m=io(),f=m===1?c("status.attention.zoneFaultOne"):c("status.attention.zoneFaultMany",{count:m});if(i(r,g,c("nav.settings"),c("status.attention.approveTouch")),i(n,m>0,c("nav.zones"),f),i(s,m>0,c("nav.diagnostics"),f),o){let v=o.querySelector("[data-nav-dot]");v&&(v.hidden=!g,v.classList.toggle("is-warn",!1)),g?(o.setAttribute("aria-label",c("status.attention.moreHasSettings")),o.title=c("status.attention.approveTouch")):(o.removeAttribute("aria-label"),o.removeAttribute("title"))}}function y(){if(!d)return;let g=P("selectedZone")||1,m=P("section")==="zones";d.innerHTML=Array.from({length:6},(f,v)=>{let S=v+1,F=m&&g===S,Y=ui(S),H=di(S),te=pi(H),ne=`${Y}: ${te}`,le=xr(Y),W=xr(ne),Z=ci(H),pe=H==="FAULT"?"!":"",X=be(h.enabled(S)),qe=X?c("common.enabled"):c("common.disabled"),re=Pe({on:X,title:qe,label:`${Y}: ${qe}`,attrs:`data-toggle-zone="${S}"`});return`<div class="v6-nav-row"><button type="button" class="v6-side-link${F?" active":""}" data-section="zones" data-select-zone="${S}" ${F?'aria-current="page"':""} title="${W}" aria-label="${W}"><span class="dot ${Z}" aria-hidden="true">${pe}</span><span class="menu-label">${le}</span></button>${re}</div>`}).join("")}function w(){if(!x){$a(e,{uptime:"---"});return}let g=Math.max(0,Math.floor((Date.now()-u)/1e3));$a(e,{uptime:qt(p+g)})}function L(){let g=!!P("live");$a(e,{live:g,label:g?c("status.live"):c("status.offline"),ip:M(l.ip)||"---"});let m=E(l.uptime);if(m!=null&&!isNaN(m)&&m>=0){let f=m|0;(!x||f!==p)&&(p=f,u=Date.now(),x=!0)}w()}function T(){let g=P("section"),m=P("settingsPanel")||"touch";if(e.querySelectorAll("[data-section]").forEach(f=>{if(f.hasAttribute("data-select-zone"))return;let v=f.dataset.section===g&&g!=="zones";v&&f.dataset.panel&&(v=f.dataset.panel===m),v&&!f.dataset.panel&&g==="settings"&&(v=!1),f.classList.toggle("active",v),f.setAttribute("aria-current",v?"page":"false")}),n){let f=g==="zones";n.classList.toggle("active",f),n.setAttribute("aria-current",f?"page":"false")}y(),b(),L()}e.addEventListener("click",g=>{let m=g.target.closest("[data-toggle-zone]");if(m&&e.contains(m)){g.preventDefault(),g.stopPropagation();let F=Number(m.dataset.toggleZone);F>=1&&F<=6&&Dn(F,!be(h.enabled(F)));return}let f=g.target.closest("[data-select-zone]");if(f){g.preventDefault(),St(Number(f.dataset.selectZone)),je("zones"),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"));return}let v=g.target.closest("[data-section]");if(!v||!e.contains(v)||v.classList.contains("v6-more-toggle"))return;g.preventDefault();let S=v.dataset.section;v.dataset.panel&&ya(v.dataset.panel),S==="settings"&&xa()&&(!v.dataset.panel||v.dataset.panel==="touch")?yr({kind:"touch",section:"settings",focus:"touch"}):je(S),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"))}),o&&o.addEventListener("click",()=>{let g=a.classList.toggle("more-open");o.setAttribute("aria-expanded",String(g))}),U("section",T),U("settingsPanel",T),U("selectedZone",T),U("zoneNames",T),U("live",T),C(l.ip,L),C(l.uptime,L);let _=setInterval(w,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(_),{once:!0}),C(l.authorityProposalPending,b);for(let g=1;g<=6;g++)C(h.state(g),T),C(h.enabled(g),T),C(h.motorLastFault(g),T),C(h.temp(g),()=>{});R(e),T()}});var mi=`
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
`;D("connectivity-card",mi);var gi=()=>`
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
`,Pc=q({tag:"connectivity-card",render:gi,onMount(t,e){let a=e.querySelector(".cc-ip"),o=e.querySelector(".cc-ssid"),r=e.querySelector(".cc-mac"),n=e.querySelector(".cc-up"),s=e.querySelector(".cc-ver"),d=0,p=Date.now(),u=!1;function x(){if(!u){n.textContent="---";return}let y=Math.max(0,Math.floor((Date.now()-p)/1e3)),w=qt(d+y);n.textContent!==w&&(n.textContent=w)}function i(){a.textContent=M(l.ip)||"---",o.textContent=M(l.ssid)||"---",r.textContent=M(l.mac)||"---",s.textContent=M(l.firmware)||"---";let y=E(l.uptime);if(y!=null&&!isNaN(y)&&y>=0){let w=y|0;(!u||w!==d)&&(d=w,p=Date.now(),u=!0)}x()}C(l.ip,i),C(l.ssid,i),C(l.mac,i),C(l.firmware,i),C(l.uptime,i);let b=setInterval(x,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(b),{once:!0}),R(e),i()}});var bi="http://www.w3.org/2000/svg",fi=`
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
`;D("chart-kit",fi);function ie(t,e,a){let o=document.createElementNS(bi,t);if(e)for(let r in e)o.setAttribute(r,e[r]);return a!=null&&(o.textContent=a),o}function Bt(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(o=>`${o.x.toFixed(2)} ${o.y.toFixed(2)}`).join(" L ");let e=.16,a=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let o=0;o<t.length-1;o++){let r=t[o-1]||t[o],n=t[o],s=t[o+1],d=t[o+2]||s,p=n.x+(s.x-r.x)*e,u=n.y+(s.y-r.y)*e,x=s.x-(d.x-n.x)*e,i=s.y-(d.y-n.y)*e;a+=` C ${p.toFixed(2)} ${u.toFixed(2)}, ${x.toFixed(2)} ${i.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return a}function Ha(t,e,a){let o=t.filter(d=>Number.isFinite(d));if(!o.length)return{min:e,max:a};let r=Math.min(...o),n=Math.max(...o);r===n&&(r-=1,n+=1);let s=(n-r)*.12;return{min:r-s,max:n+s}}function jt(t,e,a){let o=document.createElement("div");o.className="chart-tooltip",e.appendChild(o);let r=ie("g",{class:"chart-cursor",style:"display:none"}),n=ie("line",{class:"chart-cursor-line",y1:a.plotTop,y2:a.plotBottom});r.appendChild(n);let s=[];t.appendChild(r);function d(i){let b=0,y=1/0;for(let w=0;w<a.count;w++){let L=Math.abs(i-a.xAt(w));L<y&&(y=L,b=w)}return b}function p(i){let b=t.getScreenCTM();if(!b)return null;let y=t.createSVGPoint();return y.x=i.clientX,y.y=i.clientY,y.matrixTransform(b.inverse())}function u(i){if(!a.count)return;let b=p(i);if(!b)return;let y=d(b.x),w=a.xAt(y);n.setAttribute("x1",w),n.setAttribute("x2",w);let L=a.dots(y);for(;s.length<L.length;){let m=ie("circle",{class:"chart-cursor-dot",r:3.4});r.appendChild(m),s.push(m)}s.forEach((m,f)=>{f<L.length?(m.setAttribute("cx",w),m.setAttribute("cy",L[f].y),m.setAttribute("fill",L[f].color),m.style.display=""):m.style.display="none"}),r.style.display="";let T=a.rows(y).map(m=>`<div class="tt-row"><span class="tt-swatch" style="background:${m.color}"></span>${m.label}<span class="tt-val">${m.value}</span></div>`).join("");o.innerHTML=`<div class="tt-time">${a.label(y)}</div>${T}`,o.classList.add("show");let _=e.getBoundingClientRect(),g=i.clientX-_.left+14;g+o.offsetWidth>_.width-6&&(g=i.clientX-_.left-o.offsetWidth-14),o.style.left=Math.max(6,g)+"px",o.style.top=Math.max(6,i.clientY-_.top+12)+"px"}function x(){o.classList.remove("show"),r.style.display="none"}return t.addEventListener("pointermove",u),t.addEventListener("pointerleave",x),()=>{t.removeEventListener("pointermove",u),t.removeEventListener("pointerleave",x),o.remove()}}var ta=1e3,Do=180,Xe=14,hi=42,vi=44,ft=42,Ba=ta-ft-hi,bt=Do-Xe-vi,Et=Xe+bt,$o=24*3600,wr=Ee+2,kr=Ee+3,Oa=Ee+4,xi="var(--series-warm)",yi="var(--series-cool)",_r="var(--series-solar)",wi=`
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
`;D("graph-widgets",wi);var Sr=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',zr=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',ki=t=>t.variant==="flow-return"?`<div class="graph-widgets">${Sr()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${zr()}</div>`:`<div class="graph-widgets">${Sr()}${zr()}</div>`;function Cr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function _i(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function aa(t,e,a){let o=[];for(let r=0;r<t.length;r++){let n=t[r];if(!n||n[0]<a)continue;let s=n[e];s==null||!Number.isFinite(s)||o.push({t:n[0],v:s})}return o}var ja=(t,e)=>ft+Math.max(0,Math.min(1,(t-e)/$o))*Ba;function Si(t,e,a){let o=Number(Date.now()/1e3)|0,r=3600,n=Math.ceil((o-$o)/r)*r,s=Math.floor(o/r)*r,d=Math.floor(o/r)*r;for(let u=n;u<=s;u+=r){let x=a-(o-u),i=ja(x,e),b=new Date(u*1e3),y=u===d,w=Et+16;t.appendChild(ie("text",{x:i,y:w,"text-anchor":"end",transform:`rotate(-45 ${i.toFixed(1)} ${w})`,class:"chart-hour"+(y?" now":"")},String(b.getHours()).padStart(2,"0")))}let p=ja(a,e);t.appendChild(ie("line",{x1:p,y1:Xe,x2:p,y2:Et,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function zi(t){let e=[];if(t.forEach(n=>n.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let a=Math.min(...e),o=Math.max(...e);a===o&&(a-=.5,o+=.5);let r=(o-a)*.1;return a-=r,o+=r,{min:a,max:o}}function Ci(t,e,a){let o=t.filter(r=>r.unit==="C").map(r=>aa(e,r.index,a));return zi(o)}function Lr(t,e,a,o,r,n){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${ta} ${Do}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=a.map(_=>aa(o,_.index,r)),d=a.filter(_=>_.unit==="C"),p=d.some(_=>aa(o,_.index,r).length>0);if(!s.some(_=>_.length)||d.length&&!p&&!a.some(_=>_.unit==="%"&&aa(o,_.index,r).some(g=>g.v>0))){let _=d.length&&!p?c("overview.graph.noData"):c("overview.graph.collecting");return t.appendChild(ie("text",{x:ta/2,y:Do/2,"text-anchor":"middle",class:"chart-empty"},_)),null}let x=Ci(a,o,r),i=Math.max(.001,x.max-x.min),b=_=>Xe+(1-(_-x.min)/i)*bt,y=_=>Xe+(1-Math.max(0,Math.min(100,_))/100)*bt,w=(_,g)=>_.unit==="%"?y(g):b(g);for(let _=0;_<3;_++){let g=_/2,m=Xe+g*bt;t.appendChild(ie("line",{x1:ft,y1:m,x2:ft+Ba,y2:m,class:"chart-grid"})),a.some(f=>f.unit==="C")&&t.appendChild(ie("text",{x:ft-6,y:m+4,"text-anchor":"end",class:"chart-tick"},Cr(x.max-i*g,"C")+"\xB0")),a.some(f=>f.unit==="%")&&t.appendChild(ie("text",{x:ft+Ba+6,y:m+4,"text-anchor":"start",class:"chart-tick"},Cr(100-100*g,"%")))}t.appendChild(ie("line",{x1:ft,y1:Et,x2:ft+Ba,y2:Et,class:"chart-axis"})),a.some(_=>_.unit==="C")&&t.appendChild(ie("text",{x:9,y:Xe+bt/2,transform:`rotate(-90 9 ${(Xe+bt/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},c("overview.graph.axis.temp"))),a.some(_=>_.unit==="%")&&t.appendChild(ie("text",{x:ta-9,y:Xe+bt/2,transform:`rotate(90 ${ta-9} ${(Xe+bt/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},c("overview.graph.axis.demand"))),Si(t,r,n),a.forEach((_,g)=>{let m=s[g].map(v=>({x:ja(v.t,r),y:w(_,v.v)}));if(!m.length)return;let f=Bt(m);_.fill&&t.appendChild(ie("path",{d:f+` L ${m[m.length-1].x.toFixed(1)} ${Et} L ${m[0].x.toFixed(1)} ${Et} Z`,fill:_.fill,stroke:"none"})),t.appendChild(ie("path",{d:f,fill:"none",stroke:_.color,"stroke-width":String(_.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let L=[];for(let _=0;_<o.length;_++){let g=o[_];if(!g||g[0]<r)continue;let m=a.map(f=>g[f.index]);m.every(f=>f==null||!Number.isFinite(f))||L.push({t:g[0],vals:m})}if(!L.length)return null;let T=Date.now();return jt(t,e,{count:L.length,plotTop:Xe,plotBottom:Et,xAt:_=>ja(L[_].t,r),label:_=>new Date(T-(n-L[_].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:_=>a.map((g,m)=>({y:w(g,L[_].vals[m]),color:g.color})).filter((g,m)=>Number.isFinite(L[_].vals[m])),rows:_=>a.map((g,m)=>({color:g.color,label:g.label,value:_i(L[_].vals[m],g.unit)})).filter((g,m)=>Number.isFinite(L[_].vals[m]))})}function qa(t,e,a){let o=aa(t,e,a);return o.length?o[o.length-1].v:null}var Vc=q({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:ki,onMount(t,e){let a=e.querySelector(".gw-dt"),o=e.querySelector(".gw-demand-text"),r=e.querySelector(".gw-flow"),n=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),d={flow:!0,return:!0,demand:!0},p=null,u=null;function x(){s.forEach(y=>{let w=y.dataset.layer;y.classList.toggle("is-off",!d[w]),y.setAttribute("aria-pressed",d[w]?"true":"false")})}function i(){let y=[];return d.flow&&y.push({index:wr,color:xi,label:c("overview.graph.layers.flow"),unit:"C",width:2.4}),d.return&&y.push({index:kr,color:yi,label:c("overview.graph.layers.return"),unit:"C",width:2}),d.demand&&y.push({index:Oa,color:_r,label:c("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),y}function b(){let y=P("zoneStateHistory"),w=y&&Array.isArray(y.entries)?y.entries:[],L=y&&y.uptime_s||Number(Date.now()/1e3)|0,T=L-$o;if(r){p&&p();let _=qa(w,wr,T),g=qa(w,kr,T),m=qa(w,Oa,T),f=[];_!=null&&g!=null&&f.push("\u0394 "+(_-g).toFixed(1)+"\xB0"),m!=null&&f.push(Math.round(m)+"%"),a.textContent=f.length?f.join(" \xB7 "):"\u2014",p=Lr(r,r.closest(".chart-card"),i(),w,T,L)}if(n){u&&u();let _=qa(w,Oa,T);o.textContent=_!=null?Math.round(_)+"%":"\u2014",u=Lr(n,n.closest(".chart-card"),[{index:Oa,color:_r,label:c("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],w,T,L)}}s.forEach(y=>{y.addEventListener("click",()=>{let w=y.dataset.layer;d[w]=!d[w],!d.flow&&!d.return&&!d.demand&&(d[w]=!0),x(),b()})}),U("zoneStateHistory",b),R(e),x(),b()}});var ht={0:{labelKey:"state.off",color:"var(--disabled)"},1:{labelKey:"state.manual",color:"var(--info)"},2:{labelKey:"state.calibrating",color:"var(--warn)"},3:{labelKey:"state.waitCal",color:"var(--text-faint)"},4:{labelKey:"state.waitTemp",color:"var(--text-faint)"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"var(--forest)"},7:{labelKey:"state.overheated",color:"var(--danger)"},255:{labelKey:"",color:"transparent"}},oa=24*3600,Li=oa,na=28,Oo=8,Tt=72,Ua=48,Vt=8,Za=16,Er=10,Tr="var(--series-solar)",Nr="var(--accent)",Io=14,Mr=Ee+1,Fr=Vt+Ee*(na+Oo)-Oo,Ho=Fr+Er,Va=Fr+Er+Za+Ua,Mi=`
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
`;D("zone-state-timeline",Mi);var Ai=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Ei(t,e){if(!t||!t.entries||t.entries.length===0)return null;let a=t.entries,o=t.uptime_s||e||0,r=Number(Date.now()/1e3)|0,n=1e3,s=n-Tt;function d(m){let f=(m+oa)/Li;return Tt+Math.max(0,Math.min(1,f))*s}function p(m){return m-o}let u="http://www.w3.org/2000/svg",x=document.createElementNS(u,"svg");x.setAttribute("viewBox","0 0 "+n+" "+Va),x.classList.add("timeline-svg");let i=document.createElementNS(u,"rect");i.setAttribute("x",Tt),i.setAttribute("y",Vt),i.setAttribute("width",s),i.setAttribute("height",Va-Vt-Ua),i.setAttribute("fill","transparent"),i.setAttribute("rx","0"),x.appendChild(i);let b=d(0),y=[-24,-18,-12,-6,0].map(m=>m*3600);for(let m of y){let f=d(m),v=document.createElementNS(u,"line");v.setAttribute("x1",f),v.setAttribute("y1",Vt),v.setAttribute("x2",f),v.setAttribute("y2",Va-Ua),v.setAttribute("stroke",m===0?"var(--series-solar)":"var(--separator)"),v.setAttribute("stroke-width","1"),m===0&&(v.setAttribute("stroke-dasharray","3 4"),v.setAttribute("opacity",".7"),v.setAttribute("vector-effect","non-scaling-stroke")),x.appendChild(v)}x.appendChild(Ti(u,"text",{x:b+6,y:Vt+14,"text-anchor":"start",fill:"var(--accent)","font-size":"12","font-family":"var(--font-ui)","font-weight":"650"},"now"));for(let m=0;m<Ee;m++){let f=Vt+m*(na+Oo),v=document.createElementNS(u,"rect");v.setAttribute("x",Tt),v.setAttribute("y",f),v.setAttribute("width",s),v.setAttribute("height",na),v.setAttribute("fill",m%2===0?"var(--inset)":"transparent"),x.appendChild(v);let S=document.createElementNS(u,"text");S.setAttribute("x",Tt-8),S.setAttribute("y",f+na/2+1),S.setAttribute("text-anchor","end"),S.setAttribute("dominant-baseline","middle"),S.setAttribute("fill","var(--text-muted)"),S.setAttribute("font-size","13"),S.setAttribute("font-family","var(--font-ui)"),S.setAttribute("font-weight","650"),S.textContent="Z"+(m+1),x.appendChild(S);let F=a.map(H=>({rel:p(H[0]),state:H[m+1]})).filter(H=>H.rel>=-oa&&H.rel<=0),Y=(H,te,ne)=>{if(ne===255)return;let le=ht[ne]||ht[255];if(le.color==="transparent")return;let W=d(H),Z=d(te),pe=Math.max(1,Z-W),X=document.createElementNS(u,"rect");X.setAttribute("x",W),X.setAttribute("y",f+(na-Io)/2),X.setAttribute("width",pe),X.setAttribute("height",Io),X.setAttribute("fill",le.color),X.setAttribute("rx",String(Io/2)),X.setAttribute("opacity","0.9"),x.appendChild(X)};if(F.length){let H=F[0].rel,te=F[0].state;for(let ne=1;ne<F.length;ne++){let le=F[ne];le.state!==te&&(Y(H,le.rel,te),H=le.rel,te=le.state)}Y(H,0,te)}}{let m=document.createElementNS(u,"rect");m.setAttribute("x",Tt),m.setAttribute("y",Ho),m.setAttribute("width",s),m.setAttribute("height",Za),m.setAttribute("fill","color-mix(in srgb, var(--series-solar) 12%, transparent)"),m.setAttribute("rx","2"),x.appendChild(m);let f=document.createElementNS(u,"text");f.setAttribute("x",Tt-8),f.setAttribute("y",Ho+Za/2+1),f.setAttribute("text-anchor","end"),f.setAttribute("dominant-baseline","middle"),f.setAttribute("fill","var(--text-muted)"),f.setAttribute("font-size","12"),f.setAttribute("font-family","var(--font-ui)"),f.setAttribute("font-weight","650"),f.textContent=c("overview.timeline.absorb"),x.appendChild(f);let v=a.map(S=>({rel:p(S[0]),on:S.length>Mr?Number(S[Mr]||0):0})).filter(S=>S.rel>=-oa&&S.rel<=0);if(v.length){let S=(H,te,ne)=>{if(!ne)return;let le=d(H),W=Math.max(1,d(te)-le),Z=document.createElementNS(u,"rect");Z.setAttribute("x",le),Z.setAttribute("y",Ho),Z.setAttribute("width",W),Z.setAttribute("height",Za),Z.setAttribute("fill",ne===2?Nr:Tr),Z.setAttribute("rx","2"),Z.setAttribute("opacity",ne===2?"0.95":"0.85"),x.appendChild(Z)},F=v[0].rel,Y=v[0].on;for(let H=1;H<v.length;H++)v[H].on!==Y&&(S(F,v[H].rel,Y),F=v[H].rel,Y=v[H].on);S(F,0,Y)}}let w=Va-Ua+22,L=3600,T=Math.ceil((r-oa)/L)*L,_=Math.floor(r/L)*L,g=Math.floor(r/L)*L;for(let m=T;m<=_;m+=L){let v=new Date(m*1e3).getHours(),S=m===g;if(!S&&v%2!==0)continue;let F=m-r,Y=d(F),H=document.createElementNS(u,"text");H.setAttribute("x",Y),H.setAttribute("y",w),H.setAttribute("text-anchor","middle"),H.setAttribute("fill",S?"var(--accent)":"var(--text-muted)"),H.setAttribute("font-size","12"),H.setAttribute("font-family","var(--font-ui)"),H.setAttribute("font-weight",S?"700":"600"),H.setAttribute("font-variant-numeric","tabular-nums lining-nums"),H.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),H.textContent=String(v).padStart(2,"0"),x.appendChild(H)}return x}function Ti(t,e,a,o){let r=document.createElementNS(t,e);for(let n in a)r.setAttribute(n,a[n]);return o!=null&&(r.textContent=o),r}function Ar(t){t.innerHTML="";let e=[{code:5,...ht[5]},{code:6,...ht[6]},{code:0,...ht[0]},{code:1,...ht[1]},{code:7,...ht[7]},{code:2,...ht[2]}];for(let r of e){let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?c(r.labelKey):""),t.appendChild(n)}let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+Tr+'"></span>'+c("overview.timeline.absorbReactive"),t.appendChild(a);let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Nr+'"></span>'+c("overview.timeline.absorbArmed"),t.appendChild(o)}var Yc=q({tag:"zone-state-timeline",render:Ai,onMount(t,e){let a=e.querySelector(".tl-body"),o=e.querySelector(".timeline-legend");Ar(o);function r(){let n=P("zoneStateHistory"),s=(()=>{let p=P&&P("zoneStateHistory");return p&&p.uptime_s||Number(Date.now()/1e3)|0})();if(a.innerHTML="",!n||!n.entries||n.entries.length===0){let p=document.createElement("div");p.className="timeline-empty",p.textContent=c("overview.timeline.noHistory"),a.appendChild(p);return}let d=Ei(n,s);d&&a.appendChild(d)}U("zoneStateHistory",r),U("zoneNames",r),C(l.drivers,r);for(let n=1;n<=Ee;n++)C(h.enabled(n),r),C(h.state(n),r),C(h.temp(n),r),C(h.setpoint(n),r),C(h.preheatAdvance(n),r);R(e),r()}});var Ni=`
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
`;D("zone-grid",Ni);var Fi=()=>'<div class="zone-grid" aria-label="Zones"></div>',tp=q({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Fi,onMount(t,e){for(let a=1;a<=6;a++)e.appendChild(ce("zone-card",{zone:a,selection:t.selection,navigate:t.navigate}))}});var Ri=`
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
`;D("zone-card",Ri);var Pi=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${Ce(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${ot(t.zone)}</div>
		<div class="zc-friendly"${Ie(t.zone)?" hidden":""}>${Ie(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,dp=q({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Pi,onMount(t,e){let a=t.zone,o=h.temp(a),r=h.state(a),n=h.enabled(a),s=e.querySelector(".zc-state-label"),d=e.querySelector(".zc-zone-name"),p=e.querySelector(".zc-friendly"),u=e.querySelector(".zc-temp"),x=e.querySelector(".zc-target"),i=e.querySelector(".zc-valve-value");function b(){var S;let w=be(n),L=String(M(r)||"").toUpperCase()||"OFF",T=String(M(h.motorLastFault(a))||"").toUpperCase(),_=T&&T!=="NONE"&&T!=="OK",g=w&&(L==="FAULT"||_)?"FAULT":L,m=t.selection&&P("selectedZone")===a,f=Ie(a);d.innerHTML=ot(a),p.textContent=f?"":"---",p.hidden=!!f,e.setAttribute("aria-label",Ce(a)),u.textContent=Ot(E(o)),x.textContent=c("zone.card.setpoint",{value:Ot((S=E(h.effectiveSetpoint(a)))!=null?S:E(h.setpoint(a)))}),i.textContent=Da(E(h.valve(a)));let v=w?g:"OFF";s.textContent=v==="HEATING"?c("state.heating"):v==="IDLE"?c("state.idle"):v==="FAULT"?c("common.fault"):v==="MANUAL"?c("state.manual"):v==="OVERHEATED"?c("state.overheated"):v==="CALIBRATING"?c("state.calibrating"):c("state.off"),e.title=_?c("zone.card.fault",{fault:T}):"",e.classList.toggle("active",m),m?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${d.textContent}, ${u.textContent}, ${x.textContent}, ${s.textContent}. Open details.`),e.classList.toggle("disabled",!w),e.classList.toggle("zs-heating",w&&(v==="HEATING"||v==="CALLING")),e.classList.toggle("zs-overheated",w&&v==="OVERHEATED"),e.classList.toggle("zs-fault",w&&v==="FAULT"),e.classList.toggle("zs-idle",w&&v==="IDLE"),e.classList.toggle("zs-off",!w||v==="OFF")}function y(){St(a),t.navigate&&je("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:a}}))}e.addEventListener("click",y),C(o,b),C(h.setpoint(a),b),C(h.effectiveSetpoint(a),b),C(h.valve(a),b),C(r,b),C(n,b),C(h.motorLastFault(a),b),U("selectedZone",b),U("zoneNames",b),b()}});var oe={cx:200,cy:175,haloR:72,cutR:72,discR:56,stroke:6.5,pipeXs:[138,162.8,187.6,212.4,237.2,262],pipeFrom:175,pipeTo:278,lockupScale:.8,lockupCutR:58,lockupDiscR:50,luneSize:24,luneTracking:2.8,luneY:183,v6Size:40,v6Tracking:.4,v6Y:188,viewBoxPortrait:"110 90 180 210",viewBoxLandscape:"118 100 202 150",viewBoxLockup:"142 118 154 114",lockupWidth:80,lockupHeight:59,manifoldWidth:108,manifoldHeight:80,thermal:{supply:"#FCD34D",heat:"#F59E0B",ret:"#10B981",heatStop:28},pipe:{calling:"#F59E0B",idle:"#10B981",unused:"rgba(232,214,188,.20)"},metallic:{top:"#1c1915",bottom:"#0c0b09",rim:"#25221E",word:"#FAF6EF"}},Di=0;function $i(t){let{cx:e,cy:a}=oe,o=[`translate(${e} ${a})`,"rotate(-90)"];return t&&t!==1&&o.push(`scale(${t})`),o.push(`translate(${-e} ${-a})`),o.join(" ")}function Ii(t,e=!1){let a=oe.thermal,o=oe.metallic,r=e?`x1="${oe.cx}" y1="${oe.cy+oe.haloR}" x2="${oe.cx}" y2="${oe.cy-oe.haloR}"`:'x1="120" y1="175" x2="280" y2="175"';return`<defs>
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
  </defs>`}function ra({states:t=[],selected:e=-1,sku:a="",landscape:o=!1,lockup:r=!1,prefix:n=""}={}){let s=n||`lm${++Di}`,d=r?oe.lockupScale:null,p=r?oe.lockupCutR:oe.cutR,u=r?oe.lockupDiscR:oe.discR,x=o||r?` transform="${$i(d)}"`:"",i=r?oe.viewBoxLockup:o?oe.viewBoxLandscape:oe.viewBoxPortrait,b=oe.pipeXs.map((w,L)=>`<line class="pipe is-${t[L]||"idle"}${L===e?" is-focus":""}" x1="${w}" y1="${oe.pipeFrom}" x2="${w}" y2="${oe.pipeTo}"/>`).join(""),y="";if(a){let w=a.toUpperCase()==="V6",L=w?oe.v6Size:oe.luneSize,T=w?oe.v6Tracking:oe.luneTracking,_=w?oe.v6Y:oe.luneY;y=`<text class="sku" x="${oe.cx}" y="${_}" text-anchor="middle" fill="${oe.metallic.word}" font-size="${L}" font-weight="700" letter-spacing="${T}" font-family="system-ui,-apple-system,sans-serif">${a}</text>`}return`<svg class="lune-mark${o||r?" is-landscape":""}" viewBox="${i}" fill="none" aria-hidden="true">
    ${Ii(s,o||r)}
    <g class="pipes"${x} stroke="url(#${s}-thermal)" stroke-width="${oe.stroke}" stroke-linecap="round" fill="none">${b}</g>
    <circle class="disc-cut" cx="${oe.cx}" cy="${oe.cy}" r="${p}"></circle>
    <path class="halo-arc"${x} d="M${oe.cx-oe.haloR} ${oe.cy}A${oe.haloR} ${oe.haloR} 0 0 1 ${oe.cx+oe.haloR} ${oe.cy}" fill="none" stroke="url(#${s}-thermal)" stroke-width="${oe.stroke}" stroke-linecap="round" filter="url(#${s}-glow)"></path>
    <circle class="disc" cx="${oe.cx}" cy="${oe.cy}" r="${u}"></circle>
    ${y}
  </svg>`}function Rr(){return ra({sku:"LUNE",lockup:!0,prefix:"lt-lockup"})}var Pr=`
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
`;function Ut(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Dr(t,e="idle"){if(e==="unused")return 0;let a=Number(t);return!Number.isFinite(a)||a<=0?0:Math.min(5,Math.max(1,Math.ceil(a/20)))}function Hi(t=0){return`<span class="lds-loop-demand-bar loop-demand-bar" data-level="${Math.min(5,Math.max(0,Number(t)||0))}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`}function $r({id:t,name:e="\u2014",temp:a="\u2014",level:o=0,kind:r="idle",selected:n=!1,attrs:s="",tag:d="button",showDemand:p=!0,className:u=""}={}){let x=["lds-loop","loop",n?"is-selected":"",r==="calling"?"is-calling":"",r==="unused"?"is-unused":"",u].filter(Boolean).join(" "),i=d==="button"?' type="button"':"",b=p?`<span class="lds-loop-demand loop-demand">${Hi(o)}<span class="lds-loop-temp loop-temp">${Ut(a)}</span></span>`:`<span class="lds-loop-temp loop-temp">${Ut(a)}</span>`;return`<${d} class="${x}"${i} ${s}><span class="lds-loop-id loop-id">${Ut(t)}</span><span class="lds-loop-name loop-name">${Ut(e)}</span>${b}</${d}>`}function Ir({title:t="",lines:e=[],offline:a=!1}={}){let o=(e||[]).map((r,n)=>`<small${a&&n===e.length-1||n===e.length-1?' class="status"':""}>${Ut(r)}</small>`).join("");return`<strong>${Ut(t)}</strong>${o}`}function vt(t){if(!be(h.enabled(t)))return"unused";let e=String(M(h.state(t))||"").toUpperCase(),a=Number(E(h.valve(t)));return e==="HEATING"||e==="CALLING"||Number.isFinite(a)&&a>20||e==="FAULT"||e==="OVERHEATED"?"calling":"idle"}function Hr(){return[1,2,3,4,5,6].map(vt)}function Oi(){return Hr().filter(t=>t==="calling").length}function qi(){let t=Oi();return t?`${t}/6 heat call`:"Idle"}function Zt(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Or(t,{states:e,selected:a=-1,sku:o="V6",landscape:r=!0,prefix:n}={}){if(!t)return;let s=n||t.getAttribute("data-live-mark")||"mark";t.innerHTML=ra({states:e||Hr(),selected:a,sku:r?o:"",landscape:r,prefix:s})}function qr(){let t=Zt(E(l.flow)),e=Zt(E(l.ret)),a=Number(E(l.flow)),o=Number(E(l.ret)),r=Number.isFinite(a)&&Number.isFinite(o)?`${(a-o).toFixed(1)}\xB0`:"\u2014";return Ir({title:"Lune V6",lines:[`Flow ${t} \xB7 Ret ${e}`,`\u0394T ${r} \xB7 ${qi()}`]})}function Bi(t,e,a={}){if(!t||t.length<2)return"";let o=a.w||360,r=a.h||128,n=[a.ref].filter(y=>y!=null&&!Number.isNaN(Number(y))),s=Math.min(...t,...n),d=Math.max(...t,...n),p=4,u=d-s||1,x=y=>r-(y-s)/u*(r-p*2)-p,i=t.map((y,w)=>`${w/(t.length-1)*o},${x(y)}`).join(" "),b=n.length?`<line class="ref" x1="0" y1="${x(n[0])}" x2="${o}" y2="${x(n[0])}" />`:"";return`<svg class="${a.className||"spark spark-lg"}" viewBox="0 0 ${o} ${r}" preserveAspectRatio="none" aria-hidden="true">${b}<polyline fill="none" stroke="${e}" stroke-width="${a.stroke||1.8}" points="${i}"/></svg>`}function ji(t){var x;let e=Number(E(h.temp(t))),a=Number((x=E(h.effectiveSetpoint(t)))!=null?x:E(h.setpoint(t))),o=Number.isFinite(e)?e:a;if(!Number.isFinite(o)||!Number.isFinite(a))return[];let r=vt(t)==="calling",n=t*17,s=o-.4,d=o+.4,p=o-.35-n%6*.07,u=[];for(let i=0;i<24;i+=1){let b=Math.max(0,Math.sin((i-6)/12*Math.PI))*.22,y=i<7||i>21?-.12:0,w=r||p<a-.2?.16:.05;p+=(a-p)*w+b+y+Math.sin((i+n)*.55)*.05,p=Math.min(d+.15,Math.max(s-.15,p)),u.push(+p.toFixed(2))}return u[23]=+Number(o).toFixed(2),u}function Br(t){var u;let e=ji(t);if(!e.length)return"";let a=vt(t)==="calling"?"var(--accent)":"var(--forest)",o=e[0],r=e[e.length-1],n=Math.min(...e),s=Math.max(...e),d=r-o,p=Number((u=E(h.effectiveSetpoint(t)))!=null?u:E(h.setpoint(t)));return`${Bi(e,a,{className:"spark spark-lg",w:360,h:128,stroke:1.8,ref:p})}
    <div class="trend-meta">
      <span>24h</span>
      <span>${n.toFixed(1)}\u2013${s.toFixed(1)}\xB0</span>
      <span>${d>.05?"+":""}${d.toFixed(1)}\xB0</span>
    </div>`}var Vi=`
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
`;D("zone-detail",Vi);var Ui=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    ${No({remaining:"",hint:c("zone.override.hint")})}
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
`,jo=5,Vo=35,jr=.5;function Zi(t){let e=Number(E(h.setpoint(t)));return Number.isFinite(e)?e:null}function Uo(t){let e=Number(E(h.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function Vr(t){let e=Number(E(h.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let a=Zi(t);return a==null?null:Number((a+Uo(t)).toFixed(1))}function qo(t){return Math.min(Vo,Math.max(jo,Number(Number(t).toFixed(1))))}function Bo(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Wi(t,e){if(!e)return c("common.disabled");let a=String(t||"IDLE").toUpperCase();return a==="HEATING"?c("state.heating"):a==="IDLE"?c("state.idle"):a==="OFF"?c("state.off"):a==="FAULT"?c("common.fault"):a==="MANUAL"?c("state.manual"):a==="OVERHEATED"?c("state.overheated"):a==="CALIBRATING"?c("state.calibrating"):a}function Ki(t,e){return e?vt(t)==="calling"?c("state.heating"):c("state.idle"):c("state.off")}var Mp=q({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Ui,methods:{update(t,e){let a=P("selectedZone"),o=String(M(h.state(a))||"").toUpperCase(),r=be(h.enabled(a)),n=Vr(a),s=E(h.temp(a));this.zone=a,t.dataset.zone=String(a),e.dial&&Eo(e.dial,{target:n,current:s,disabled:!r,states:["idle","idle","idle","idle","idle","idle"],selected:-1});let d=Number(E(h.coordinatorRemaining(a))),p=E(h.coordinatorOffset(a)),u=Number.isFinite(d)&&d>0||Number.isFinite(p)&&Math.abs(p)>.05,x=p==null?"\u2014":(p>0?"+":"")+Number(p).toFixed(1)+"\xB0";Fo(t,{remaining:u?c("zone.override.remaining",{offset:x,remaining:qt(Math.max(0,d||0))}):"",hint:c("zone.override.hint")});let i=Bo(n);if(e.setpoint.textContent=i,e.temp.textContent=Bo(s),e.demand.textContent=Ki(a,r),e.slider&&(Number.isFinite(n)&&(e.slider.value=String(n)),e.slider.disabled=!r,Fa(e.slider)),e.sliderValue&&(e.sliderValue.textContent=i),e.chart&&(e.chart.innerHTML=Br(a)),e.badge){let b=e.badge;b.textContent=Wi(o,r);let y=r?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";b.className="zd-badge"+(y?" "+y:"")}},stepSetpoint(t){let e=this.zone,a=Vr(e),o=qo((a==null?20:a)+t);vo(e,qo(o-Uo(e)))},setApplied(t){let e=this.zone;vo(e,qo(t-Uo(e)))}},onMount(t,e){let a=e.querySelector(".zd-dial-slot");a.innerHTML=Ao({id:"zone-detail-dial",markHtml:ra({states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:"zone-detail-halo"}),target:20,current:null,min:jo,max:Vo,step:jr,unit:"C",label:"Zone setpoint"});let o=e.querySelector(".zd-slider-slot");o.innerHTML=Ro({min:jo,max:Vo,step:jr,value:21,label:"Comfort setpoint"});let r={dial:a.querySelector(".lds-dial"),temp:e.querySelector(".zd-temp"),setpoint:e.querySelector(".zd-setpoint"),demand:e.querySelector(".zd-demand"),badge:e.querySelector(".zd-badge"),slider:e.querySelector("[data-comfort-slider]"),sliderValue:e.querySelector("[data-slider-value]"),chart:e.querySelector(".zd-chart")};To(r.dial,{onStep:d=>t.stepSetpoint(d)}),r.slider.addEventListener("input",()=>{let d=parseFloat(r.slider.value);Number.isFinite(d)&&(Fa(r.slider),r.sliderValue.textContent=Bo(d),t.setApplied(d))});let n=()=>t.update(e,r),s=d=>{let p=P("selectedZone");(/(?:text_sensor-zone_\d+_state|switch-zone_\d+_enabled|sensor-zone_\d+_valve_pct)$/.test(d)||d===h.temp(p)||d===h.setpoint(p)||d===h.baseSetpoint(p)||d===h.effectiveSetpoint(p)||d===h.coordinatorOffset(p)||d===h.coordinatorRemaining(p))&&n()};for(let d=1;d<=6;d++)C(h.temp(d),s),C(h.setpoint(d),s),C(h.baseSetpoint(d),s),C(h.effectiveSetpoint(d),s),C(h.coordinatorOffset(d),s),C(h.coordinatorRemaining(d),s),C(h.valve(d),s),C(h.state(d),s),C(h.enabled(d),s);C("sensor-manifold_return_temperature",n),U("selectedZone",n),R(e),n()}});var Gi=`
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
`;D("zone-sensor-card",Gi);var Xi=()=>`
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
  `;function Yi(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":t==="External"||t==="EXTERNAL"?"External":"Local Probe"}function Ji(t){return t==="BLE Sensor"?"BLE":t==="External"?"External":"Local Probe"}function Ur(t,e){let a='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+c("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+c("zone.sensor.bleSource")+'</option><option value="External" data-i18n="zone.sensor.externalSource">'+c("zone.sensor.externalSource")+"</option>";t.innerHTML!==a&&(t.innerHTML=a),t.value=e}var $p=q({tag:"zone-sensor-card",render:Xi,onMount(t,e){let a=e.querySelector(".zs-source"),o=e.querySelector(".zs-ble"),r=e.querySelector(".zs-row-ble"),n=e.querySelector(".zs-row-ext"),s=e.querySelector(".zs-sid"),d=e.querySelector(".zs-sname"),p=e.querySelector(".zs-age"),u=e.querySelector(".zs-scan"),x=e.querySelector(".zs-scan-list"),i=0;function b(){return P("selectedZone")}function y(){let g=a.value;r.style.display=g==="BLE Sensor"?"":"none",n.style.display=g==="External"?"":"none"}let w=Me(e,{immediate:!0});Ur(a,"Local Probe"),w.select(a,{read:()=>Yi(String(M(h.tempSource(b()))||"")),commit:g=>nt(b(),"zone_temp_source",Ji(g))}),w.text(o,{read:()=>M(h.ble(b()))||"",commit:g=>It(b(),"zone_ble_mac",g)}),w.text(s,{read:()=>M(h.sensorId(b()))||"",commit:g=>It(b(),"zone_sensor_id",g)}),w.text(d,{read:()=>M(h.sensorName(b()))||"",commit:g=>It(b(),"zone_sensor_name",g)}),a.addEventListener("change",y);function L(){let g=b(),m=Number(E(h.externalAge(g)));if(!Number.isFinite(m)||m<0){p.textContent=c("zone.sensor.noIngestYet");return}let f=Math.round(m/1e3);p.textContent=c("zone.sensor.lastIngestAge",{sec:f})}function T(){let g=b();i!==g?(i=g,x.style.display="none",w.discard()):w.refresh(),y(),L()}u.addEventListener("click",()=>{u.disabled=!0,u.textContent=c("zone.sensor.scanning"),x.style.display="",x.innerHTML='<div class="scan-msg">'+c("zone.sensor.scanning")+"</div>";let g=new AbortController,m=setTimeout(()=>g.abort(),8e3);fetch("/api/v1/ble-scan",{signal:g.signal}).then(f=>f.json()).then(f=>{clearTimeout(m),u.disabled=!1,u.textContent=c("zone.sensor.scan");let v=f&&f.data&&f.data.sensors||f.sensors||[];if(!v.length){x.innerHTML='<div class="scan-msg">'+c("zone.sensor.noSensors")+"</div>";return}let S=(M(h.ble(b()))||"").toUpperCase();x.innerHTML=v.map(F=>{let Y=String(F.mac||"").toUpperCase(),H="";Y===S?H='<span class="ble-badge">'+c("zone.sensor.assignedThisZone")+"</span>":F.zone>0&&(H='<span class="ble-badge">'+c("zone.sensor.zoneBadge",{zone:F.zone})+"</span>");let te=Number.isFinite(Number(F.temp_c))?Number(F.temp_c).toFixed(1)+"\xB0C":"\u2014",ne=F.name?String(F.name):"";return`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${Y}</div>
                <div class="ble-meta">${ne?ne+" \xB7 ":""}${te} \xB7 ${F.rssi||"?"} dBm ${H}</div>
              </div>
              <button class="btn-assign" data-mac="${Y}">${c("zone.sensor.assign")}</button>
            </div>`}).join(""),x.querySelectorAll(".btn-assign").forEach(F=>{F.addEventListener("click",()=>{let Y=F.getAttribute("data-mac")||"",H=b();o.value=Y,a.value="BLE Sensor",y(),It(H,"zone_ble_mac",Y),nt(H,"zone_temp_source","BLE"),w.refresh()})})}).catch(f=>{clearTimeout(m),u.disabled=!1,u.textContent=c("zone.sensor.scan");let v=f&&f.name==="AbortError"?c("zone.sensor.scanTimeout"):c("zone.sensor.scanFailed");x.innerHTML='<div class="scan-msg">'+v+"</div>"})});function _(g){let m=b();([h.tempSource(m),h.ble(m),h.sensorId(m),h.sensorName(m),h.externalAge(m)].indexOf(g)>=0||/^select-zone_\d+_temp_source$/.test(g)||/^text-zone_\d+_(ble_mac|sensor_id|sensor_name)$/.test(g)||/^sensor-zone_\d+_external_temp_age_ms$/.test(g))&&(w.refresh(),y(),L())}T(),U("selectedZone",T);for(let g=1;g<=6;g++)C(h.tempSource(g),_),C(h.ble(g),_),C(h.sensorId(g),_),C(h.sensorName(g),_),C(h.externalAge(g),_);}});var Qi=".zone-coordination-card { height: 100%; }";D("zone-coordination-card",Qi);var el=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.sensor.mergeWith">Merge with zone</span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function Zr(t,e){let a=t.value,o='<option value="None" data-i18n="common.none">'+c("common.none")+"</option>";for(let r=1;r<=6;r++)r!==e&&(o+='<option value="Zone '+r+'">'+c("common.zone")+" "+r+"</option>");t.innerHTML=o,t.value=a||"None"}var Zp=q({tag:"zone-coordination-card",render:el,onMount(t,e){let a=e.querySelector(".zc-sync"),o=0;function r(){return P("selectedZone")}let n=Me(e,{immediate:!0});n.select(a,{read:()=>M(h.syncTo(r()))||"None",commit:p=>nt(r(),"zone_sync_to",p)});function s(){let p=r();o!==p?(Zr(a,p),o=p,n.discard()):n.refresh()}function d(p){let u=r();(p===h.syncTo(u)||/^select-zone_\d+_sync_to$/.test(p))&&n.refresh()}U("selectedZone",s);for(let p=1;p<=6;p++)C(h.syncTo(p),d);R(e),s()}});var tl=".zone-room-card { height: auto; }";D("zone-room-card",tl);var al=15,ol=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Zone friendly name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="${al}" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,tu=q({tag:"zone-room-card",render:ol,onMount(t,e){let a=e.querySelector(".zr-friendly");function o(){return P("selectedZone")}let r=Me(e,{immediate:!0});r.text(a,{read:()=>po(o())||"",commit:s=>On(o(),s)});function n(s){let d=o();(s===h.name(d)||/^text-zone_\d+_name$/.test(s))&&r.refresh()}U("selectedZone",()=>{r.discard()}),U("zoneNames",r.refresh);for(let s=1;s<=6;s++)C(h.name(s),n);R(e),r.refresh()}});var nl=`
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
`;D("zone-actuator-card",nl);function Wr(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function Kr(t){return t!=null?Number(t).toFixed(0):"---"}function rl(t){return t!=null?Number(t).toFixed(2)+"C":"---"}var sl=()=>`
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
`,du=q({tag:"zone-actuator-card",render:sl,onMount(t,e){var p,u,x;let a=Number(P("selectedZone")||1),o={orip:e.querySelector(".za-orip"),crip:e.querySelector(".za-crip"),ofac:e.querySelector(".za-ofac"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function r(){a=Number(P("selectedZone")||1),o.orip.textContent=Kr(E(h.motorOpenRipples(a))),o.crip.textContent=Kr(E(h.motorCloseRipples(a))),o.ofac.textContent=Wr(E(h.motorOpenFactor(a))),o.cfac.textContent=Wr(E(h.motorCloseFactor(a))),o.ph.textContent=rl(E(h.preheatAdvance(a)));let i=String(M(h.motorLastFault(a))||"").toUpperCase(),b=i&&i!=="NONE"&&i!=="OK";o.fault.hidden=!b,b&&(o.faultVal.textContent=i)}let n=null;function s(i,b){o.status.textContent=i,o.status.className="za-status show "+(b?"ok":"err"),clearTimeout(n),n=setTimeout(()=>{o.status.classList.remove("show")},4e3)}function d(i,b){let y=i(a);s(b,!0),y&&typeof y.then=="function"&&y.then(w=>{w&&w.ok===!1&&s(c("diagnostics.recovery.rejected"),!1)}).catch(()=>s(c("diagnostics.recovery.unreachable"),!1))}(p=o.faultBtn)==null||p.addEventListener("click",()=>{d(Vn,"\u2713 "+c("diagnostics.recovery.faultSent",{zone:Ce(a)}))}),(u=o.factorsBtn)==null||u.addEventListener("click",()=>{confirm(c("diagnostics.recovery.confirmFactors",{zone:Ce(a)}))&&d(Ea,"\u2713 "+c("diagnostics.recovery.factorsReset",{zone:Ce(a)}))}),(x=o.relearnBtn)==null||x.addEventListener("click",()=>{confirm(c("diagnostics.recovery.confirmRelearn",{zone:Ce(a)}))&&d(Un,"\u2713 "+c("diagnostics.recovery.relearnStarted",{zone:Ce(a)}))}),U("selectedZone",r);for(let i=1;i<=6;i++)C(h.motorOpenRipples(i),r),C(h.motorCloseRipples(i),r),C(h.motorOpenFactor(i),r),C(h.motorCloseFactor(i),r),C(h.preheatAdvance(i),r),C(h.motorLastFault(i),r);R(e),r()}});var il={1:{label:"E",color:"var(--danger)"},2:{label:"W",color:"var(--warn)"},3:{label:"I",color:"var(--ok)"},4:{label:"C",color:"var(--info)"},5:{label:"D",color:"var(--text-muted)"},6:{label:"V",color:"var(--text-faint)"},7:{label:"VV",color:"var(--text-faint)"}},ll=`
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
`;D("logs-view",ll);var dl=()=>`
  <div class="logs-view">
    <div class="logs-stream"></div>
    <div class="actions">
      <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
      <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      <button class="btn bottom-btn" type="button" data-i18n="logs.scrollBottom">Scroll to bottom</button>
    </div>
  </div>
`;function cl(t){let e=il[t.level]||{label:"?",color:"var(--text-secondary)"},a=Gr(t.tag||""),o=Gr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+a+'</span><span class="msg">'+o+"</span></div>"}function Gr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var fu=q({tag:"logs-view",render:dl,onMount(t,e){let a=e.querySelector(".logs-stream"),o=e.querySelector(".pause-btn"),r=e.querySelector(".clear-btn"),n=e.querySelector(".download-btn"),s=e.querySelector(".bottom-btn"),d=!1;function p(){a.scrollTop=a.scrollHeight}function u(){if(d)return;let x=Sa();if(!x||!x.length){a.innerHTML='<div class="logs-empty">'+c("logs.waiting")+"</div>";return}let i=a.scrollHeight-a.scrollTop-a.clientHeight<40;a.innerHTML=x.map(cl).join(""),i&&p()}o.addEventListener("click",()=>{d=!d,o.textContent=d?c("logs.resume"):c("logs.pause"),o.classList.toggle("on",d),d||u()}),r.addEventListener("click",()=>{yn()}),n.addEventListener("click",()=>{n.disabled=!0,tr().catch(x=>{console.error("[Logs] download failed:",x),window.alert(c("logs.downloadFailed"))}).finally(()=>{n.disabled=!1})}),s.addEventListener("click",()=>{p()}),U("deviceLog",u),R(e),u()}});var pl=`
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
}`;D("diag-i2c",pl);var ul=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,_u=q({tag:"diag-i2c",render:ul,onMount(t,e){let a=e.querySelector("#i2c-result");function o(){a.textContent=P("i2cResult")||c("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{$n()}),U("i2cResult",o),R(e),o()}});var ml=`
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
`;D("diag-manual-badge",ml);var gl=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Au=q({tag:"diag-manual-badge",render:gl,onMount(t,e){let a=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function o(){let r=!!P("manualMode");a&&a.classList.toggle("on",r)}U("manualMode",o),R(e),o()}});var bl=`
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
`;D("diag-zone-motor",bl);var fl=t=>{let e=t.zone||P("selectedZone")||1,a="";for(let o=1;o<=6;o++)a+='<option value="'+o+'"'+(o===e?" selected":"")+">"+c("common.zone")+" "+o+"</option>";return`
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
  `},$u=q({tag:"diag-zone-motor-card",render:fl,onMount(t,e){let a=Number(t.zone||P("selectedZone")||1),o=!!P("manualMode"),r=e.querySelector(".manual-mode-toggle"),n=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),d=e.querySelector(".motor-target-input"),p=e.querySelector(".motor-open-btn"),u=e.querySelector(".motor-close-btn"),x=e.querySelector(".motor-stop-btn"),i=()=>{let L=s.value||String(a),T="";for(let _=1;_<=6;_++)T+='<option value="'+_+'">'+c("common.zone")+" "+_+"</option>";s.innerHTML=T,s.value=L};function b(L){o=!!L,r&&(r.classList.toggle("on",o),r.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[s,d,p,u,x].forEach(T=>{T&&(T.disabled=!o)})}function y(){let L=!o;b(L);let T=()=>{};if(L){Ht(!0).catch(T);for(let _=1;_<=6;_++)yo(_).catch(T)}else Ht(!1).catch(T)}function w(){let L=E(h.motorTarget(a));d&&L!=null?d.value=Number(L).toFixed(0):d&&(d.value="0")}s==null||s.addEventListener("change",()=>{a=Number(s.value||1),w()}),r==null||r.addEventListener("click",y),r==null||r.addEventListener("keydown",L=>{L.key!==" "&&L.key!=="Enter"||(L.preventDefault(),y())});for(let L=1;L<=6;L++)C(h.motorTarget(L),w);w(),b(o),U("manualMode",()=>{b(!!P("manualMode"))}),R(e),d==null||d.addEventListener("change",L=>{if(!o)return;let T=L.target.value;qn(a,T)}),p==null||p.addEventListener("click",()=>{o&&Ma(a,1e4)}),u==null||u.addEventListener("click",()=>{o&&Aa(a,1e4)}),x==null||x.addEventListener("click",()=>{o&&yo(a)})}});var Nt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function ia(t){switch(Number(t)){case Nt.CONTACT:return"contact";case Nt.UNDER_LOAD:return"load";case Nt.STOPPING:return"stopping";default:return"free"}}function Wo(t){let e=t||[];for(let a=0;a<e.length;a++){let o=Number(e[a].stroke_phase)||0;if(o===Nt.CONTACT||o===Nt.UNDER_LOAD)return e[a]}return null}function xt(t,e,a){if(e[a]==null)return null;let o=Number(t[e[a]]);return Number.isFinite(o)?o:null}function Ko(t){let e=String(t||"").split(/\r?\n/).filter(n=>n.trim());if(e.length<2)return[];let a=e[0].split(",").map(n=>n.trim()),o={};for(let n=0;n<a.length;n++)o[a[n]]=n;let r=[];for(let n=1;n<e.length;n++){let s=e[n].split(",");if(s.length<6)continue;let d=p=>Number(s[o[p]]);r.push({t_ms:d("t_ms")||0,motion_count:d("motion_count")||0,current_ma:d("current_ma"),adc_current_raw:xt(s,o,"adc_current_raw"),drive_on:d("drive_on")===1,direction_open:d("direction_open")===1,armed:d("armed")===1,stroke_phase:d("stroke_phase")||0,tacho_period_us:xt(s,o,"tacho_period_us"),tacho_amp_raw:xt(s,o,"tacho_amp_raw"),bemf_raw_a:xt(s,o,"bemf_raw_a"),bemf_raw_b:xt(s,o,"bemf_raw_b"),bemf_differential_raw:xt(s,o,"bemf_differential_raw"),bemf_separation_us:xt(s,o,"bemf_separation_us"),bemf_valid:o.bemf_valid!=null?d("bemf_valid")===1:null,bemf_moving:o.bemf_moving!=null?d("bemf_moving")===1:null,invalid_bemf_samples:xt(s,o,"invalid_bemf_samples")})}return r}function yt(t){let e=t.filter(a=>Number.isFinite(a));return e.length?e.reduce((a,o)=>a+o,0)/e.length:null}function sa(t){let e=0,a=0;for(let o of t)o===!0?e+=1:o===!1&&(a+=1);return!e&&!a?null:e>=a}function Go(t,e=2){let a=(t||[]).filter(s=>s&&Number.isFinite(s.t_ms)).slice().sort((s,d)=>s.t_ms-d.t_ms);if(!a.length)return[];let o=Math.max(1,Math.round(1e3/Math.max(.1,e))),r=[],n=0;for(;n<a.length;){let s=Math.floor(a[n].t_ms/o)*o,d=s+o,p=n;for(;p<a.length&&a[p].t_ms<d;)p+=1;let u=a.slice(n,p),x=u[u.length-1];r.push({t_ms:s+Math.floor(o/2),motion_count:Math.max(...u.map(i=>Number(i.motion_count)||0)),current_ma:yt(u.map(i=>i.current_ma)),adc_current_raw:yt(u.map(i=>i.adc_current_raw)),drive_on:sa(u.map(i=>!!i.drive_on))===!0,direction_open:sa(u.map(i=>!!i.direction_open))===!0,armed:sa(u.map(i=>!!i.armed))===!0,stroke_phase:Math.max(...u.map(i=>Number(i.stroke_phase)||0)),tacho_period_us:yt(u.map(i=>i.tacho_period_us)),tacho_amp_raw:yt(u.map(i=>i.tacho_amp_raw)),bemf_raw_a:yt(u.map(i=>i.bemf_raw_a)),bemf_raw_b:yt(u.map(i=>i.bemf_raw_b)),bemf_differential_raw:yt(u.map(i=>i.bemf_differential_raw)),bemf_separation_us:yt(u.map(i=>i.bemf_separation_us)),bemf_valid:sa(u.map(i=>i.bemf_valid)),bemf_moving:sa(u.map(i=>i.bemf_moving)),invalid_bemf_samples:Math.max(...u.map(i=>Number(i.invalid_bemf_samples)||0),Number(x.invalid_bemf_samples)||0),_bucket_n:u.length}),n=p}return r}function Xo(t,e,a=6e4,o=2){let r=new Map;for(let u of t||[])u&&Number.isFinite(u.t_ms)&&r.set(u.t_ms,u);for(let u of Go(e||[],o))u&&Number.isFinite(u.t_ms)&&r.set(u.t_ms,u);let n=Array.from(r.values()).sort((u,x)=>u.t_ms-x.t_ms);if(!n.length||!(a>0))return n;let d=n[n.length-1].t_ms-a,p=0;for(;p<n.length&&n[p].t_ms<d;)p+=1;return p?n.slice(p):n}var hl="t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples";function Ye(t){return t==null||t===""?"":typeof t=="boolean"?t?"1":"0":typeof t=="number"?Number.isFinite(t)?String(t):"":String(t)}function vl(t){let e=[hl];for(let a of t||[])e.push([Ye(a.t_ms),Ye(a.motion_count),Number.isFinite(a.current_ma)?a.current_ma.toFixed(1):"",Ye(a.adc_current_raw),a.drive_on?"1":"0",a.direction_open?"1":"0",a.armed?"1":"0",Ye(a.stroke_phase||0),Ye(a.tacho_period_us),Ye(a.tacho_amp_raw),Ye(a.bemf_raw_a),Ye(a.bemf_raw_b),Ye(a.bemf_differential_raw),Ye(a.bemf_separation_us),a.bemf_valid==null?"":a.bemf_valid?"1":"0",a.bemf_moving==null?"":a.bemf_moving?"1":"0",Ye(a.invalid_bemf_samples)].join(","));return e.join(`
`)+`
`}function Xr(t,e){let a=new Blob([vl(t)],{type:"text/csv;charset=utf-8"}),o=URL.createObjectURL(a),r=document.createElement("a");r.href=o,r.download=e||"lune-v6-motor-trace.csv",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function xl(t){let e=0,a=0;for(let o=0;o<t.length;o++)t[o].drive_on&&(t[o].direction_open?e+=1:a+=1);return e>=a?"open":"close"}function yl(t,e){if(!t.length)return null;let a=t.slice().sort((r,n)=>r-n),o=Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*e)));return a[o]}function De(t){return Math.round(t*10)/10}function Zo(t,e,a){return Math.min(a,Math.max(e,t))}function wl(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function Yr(t){let e=[];if(!t.length)return e;let a=t[0].t_ms,o=t[t.length-1].t_ms;for(let r=a;r+500<=o;r+=500){let n=t.reduce((p,u)=>Math.abs(u.t_ms-r)<Math.abs(p.t_ms-r)?u:p,t[0]),s=t.reduce((p,u)=>Math.abs(u.t_ms-(r+500))<Math.abs(p.t_ms-(r+500))?u:p,t[0]),d=(s.t_ms-n.t_ms)/1e3;d>.2&&e.push({t_ms:r+500,slope:(s.current_ma-n.current_ma)/d})}return e}function la(t){let e=t||[],a=[];for(let s=0;s<e.length;s++){let d=e[s],p=d.tacho_period_us!=null?d.tacho_period_us:d.tacho_cadence_us!=null?d.tacho_cadence_us:null;a.push({t_ms:d.t_ms,period_us:p,rate_hz:wl(p)})}let o=e.filter(s=>s.drive_on&&Number.isFinite(s.current_ma)),r=o.length>=2?o:e.filter(s=>Number.isFinite(s.current_ma)),n=Yr(r);return{cadence:a,slopes:n,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function Jr(t,e){let a=e||xl(t),o=t.filter(X=>X.drive_on&&Number.isFinite(X.current_ma)&&(a==="open"?X.direction_open:!X.direction_open));if(o.length<8)return{direction:a,ok:!1,reason:"too_few_samples"};let r=o[0].t_ms,n=o[o.length-1].t_ms,s=o.filter(X=>X.t_ms>=r+650),d=s.length>12?s:o,p=Math.max(1,n-(d[0]?d[0].t_ms:r)),u=d.filter(X=>X.t_ms<d[0].t_ms+p*.7),x=d.filter(X=>X.t_ms>=d[0].t_ms+p*.8),i=(u.length?u:d).map(X=>X.current_ma),b=(x.length?x:d.slice(-Math.max(4,d.length/8|0))).map(X=>X.current_ma),y=i.reduce((X,qe)=>X+qe,0)/i.length,w=Math.max(...o.map(X=>X.current_ma)),L=Math.max(...b),T=Math.max(0,o[o.length-1].motion_count-o[0].motion_count),_=Yr(d),g=_.filter(X=>X.t_ms<d[0].t_ms+p*.7).map(X=>X.slope),m=_.filter(X=>X.t_ms>=d[0].t_ms+p*.75).map(X=>X.slope),f=m.length?Math.max(...m):0,v=yl(g.map(Math.abs),.9)||0,S=a==="close"?.55:.68,F=y>.5?L/y:0,Y=Math.max(...o.map(X=>Number(X.stroke_phase)||0)),H=Sl(d,kl),te=a==="open"?F>=1.35||Y>=Nt.STOPPING:H>=_l||Y>=Nt.UNDER_LOAD,ne=De(Zo(1+S*Math.max(0,F-1),1.25,2.4)),le=De(Zo(Math.max(v*2.2,f*.42,a==="open"?.15:.4),.15,8)),W=De(Zo(1+.35*Math.max(0,F-1),1.15,1.8)),Z=a==="open"?1.15:null,pe=Wo(o);return{direction:a,ok:te,reason:te?null:"no_endstop",start_ms:r,end_ms:n,runtime_ms:n-r,mean_ma:De(y),peak_ma:De(w),stall_peak_ma:De(L),ripples:T,max_stall_slope_ma_s:De(f),travel_slope_ma_s:De(v),measured_factor:De(F),max_trailing_step_ma:De(H),endstop_seen:te,suggested_factor:ne,suggested_slope:le,suggested_slope_floor:W,suggested_ripple_limit:Z,pin_seen:!!pe,pin_t_ms:pe?pe.t_ms:null,pin_motion_count:pe?pe.motion_count:null,pin_current_ma:pe?De(pe.current_ma):null,samples:o}}var kl=2e3,_l=2.5;function Sl(t,e){let a=0,o=0;for(let r=0;r<t.length;r+=1){for(;o<r&&t[r].t_ms-t[o].t_ms>e;)o+=1;if(o>0||t[r].t_ms-t[0].t_ms>=e){let n=t[r].current_ma-t[o].current_ma;n>a&&(a=n)}}return a}function Qr(t,e){if(!t||!t.ok)return[];let a=t.mean_ma,o=Number(e&&e.factor)||t.suggested_factor,r=[{id:"mean",value:a},{id:"threshold",value:De(a*o)},{id:"suggested",value:De(a*t.suggested_factor)}],n=e&&e.caps||{},s=Number(t.direction==="open"?n.open:n.seat),d=Number(n.stall);return Number.isFinite(s)&&s>0&&r.push({id:"cap",value:De(s)}),Number.isFinite(d)&&d>0&&r.push({id:"stall",value:De(d)}),r}var da=920,ca=200,es=56,me={t:16,r:18,b:32,l:52},Je=da-me.l-me.r,Kt=ca-me.t-me.b,Yo="var(--accent)",en="var(--series-cool)",zl="var(--state-warn)",Cl="var(--state-ok)",Ll="var(--state-danger)",Ml="var(--text-faint)",Wa="var(--state-warn)",Jo="var(--series-cool)",Qo="var(--accent)",Al="var(--state-ok)",ts={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},as={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},El=`
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
`;D("motor-lab-charts",El);function Wt(t,e,a=Kt){let o=e.max-e.min||1;return me.t+a-(t-e.min)/o*a}function Ka(t,e,a,o=ca){t.appendChild(ie("text",{class:"chart-axis-label",x:me.l,y:o-8},"0 s")),t.appendChild(ie("text",{class:"chart-axis-label",x:me.l+Je-48,y:o-8},(a/1e3).toFixed(1)+" s"))}function tn(t,e,a=Kt){for(let o=0;o<=4;o++){let r=me.t+a*o/4;t.appendChild(ie("line",{class:"chart-grid",x1:me.l,x2:me.l+Je,y1:r,y2:r}));let n=e.max-(e.max-e.min)*o/4;t.appendChild(ie("text",{class:"chart-tick",x:8,y:r+4},n.toFixed(0)))}}function Tl(t){if(!t.length)return[];let e=[],a=0,o=Number(t[0].stroke_phase)||0;for(let r=1;r<t.length;r++){let n=Number(t[r].stroke_phase)||0;n!==o&&(e.push({phase:o,start:a,end:r-1}),a=r,o=n)}return e.push({phase:o,start:a,end:t.length-1}),e}function Nl(t){let e=t.querySelector("defs");return e||(e=ie("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([o,r,n])=>{let s=ie("pattern",{id:o,width:4,height:4,patternUnits:"userSpaceOnUse"});s.appendChild(ie("path",{d:r,stroke:n,"stroke-width":"1",fill:"none"})),e.appendChild(s)}),t.appendChild(e),e)}function pa(t,e,a){let o=document.createElement("div");o.className="chart-card",o.setAttribute("role","img"),o.setAttribute("aria-label",c(a||t));let r=document.createElement("div");return r.className="chart-head",r.innerHTML='<span class="chart-title">'+c(t)+'</span><span class="chart-sub">'+e+"</span>",o.appendChild(r),o}function Fl(t,e,a){let o=pa(e,c(a||"diagnostics.lab.empty"),e),r=document.createElement("div");r.className="lab-empty",r.textContent=c("diagnostics.lab.empty"),o.appendChild(r),t.appendChild(o)}function Ga(t,e,a){return t?c("diagnostics.lab.res.live"):a&&a.truncated?c("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?c("diagnostics.lab.res.trace",{direction:c("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):c("diagnostics.lab.res.traceReady")}function Rl(t,e,a,o,r,n){if(!n.current&&!n.overlays)return;let s=la(e),d=pa("diagnostics.lab.chart.current",Ga(r,a,s),"diagnostics.lab.chart.currentAria");if(s.truncated){let _=document.createElement("div");_.className="lab-chart-warn",_.textContent=c("diagnostics.lab.res.ringWarn",{n:2e3,s:s.window_ms/1e3}),d.appendChild(_)}if(!e.length){let _=document.createElement("div");_.className="lab-empty",_.textContent=c("diagnostics.lab.empty"),d.appendChild(_),t.appendChild(d);return}let p=e.map(_=>_.current_ma).filter(Number.isFinite),u=(o||[]).map(_=>_.value).filter(Number.isFinite),x=Ha(p.concat([0,40],u),0,50);x.min=0;let i=e[0].t_ms,b=Math.max(1,e[e.length-1].t_ms-i),y=_=>me.l+(e[_].t_ms-i)/b*Je,w=e.map((_,g)=>({x:y(g),y:Wt(_.current_ma,x)})),L=ie("svg",{viewBox:"0 0 "+da+" "+ca,role:"img"});if(tn(L,x),Ka(L,i,b),n.overlays){let _={mean:en,threshold:zl,suggested:Cl,cap:Ll,stall:Ml};(o||[]).forEach(g=>{let m=Wt(g.value,x);L.appendChild(ie("line",{x1:me.l,x2:me.l+Je,y1:m,y2:m,stroke:_[g.id],"stroke-dasharray":g.id==="mean"?"0":"5 4","stroke-width":g.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:g.id==="cap"||g.id==="stall"?".45":".9"}))})}let T=a&&a.ok&&a.pin_seen?{t_ms:a.pin_t_ms,current_ma:a.pin_current_ma,motion_count:a.pin_motion_count,stroke_phase:1}:Wo(e);if(T&&Number.isFinite(T.t_ms)){let _=me.l+(T.t_ms-i)/b*Je;L.appendChild(ie("line",{x1:_,x2:_,y1:me.t,y2:me.t+Kt,stroke:Wa,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),L.appendChild(ie("circle",{cx:_,cy:Wt(Number(T.current_ma)||0,x),r:4.2,fill:Wa,stroke:"var(--bg)","stroke-width":"1.5"})),L.appendChild(ie("text",{class:"chart-tick",x:Math.min(_+6,me.l+Je-64),y:me.t+12,fill:Wa},c("diagnostics.lab.pinMark")))}n.current&&L.appendChild(ie("path",{d:Bt(w),fill:"none",stroke:Yo,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),d.appendChild(L),t.appendChild(d),jt(L,d,{count:e.length,plotTop:me.t,plotBottom:me.t+Kt,xAt:y,label:_=>((e[_].t_ms-i)/1e3).toFixed(2)+" s",dots:_=>n.current?[{y:w[_].y,color:Yo}]:[],rows:_=>[{color:Yo,label:c("diagnostics.lab.currentMa"),value:Number(e[_].current_ma).toFixed(1)+" mA"},{color:en,label:c("diagnostics.lab.motion"),value:String(e[_].motion_count)},{color:Wa,label:c("diagnostics.lab.stroke"),value:c("diagnostics.lab.stroke."+ia(e[_].stroke_phase))}]})}function Pl(t,e,a,o){if(!o.phase)return;let r=la(e),n=pa("diagnostics.lab.chart.phase",Ga(a,null,r),"diagnostics.lab.chart.phaseAria");if(!e.length){let b=document.createElement("div");b.className="lab-empty",b.textContent=c("diagnostics.lab.empty"),n.appendChild(b),t.appendChild(n);return}let s=e[0].t_ms,d=Math.max(1,e[e.length-1].t_ms-s),p=es+me.b,u=ie("svg",{viewBox:"0 0 "+da+" "+p,class:"lab-phase-strip",role:"img"});Nl(u);let x=10,i=es-18;Tl(e).forEach(b=>{let y=me.l+(e[b.start].t_ms-s)/d*Je,w=me.l+(e[b.end].t_ms-s)/d*Je,L=ia(b.phase),T=Math.max(2,w-y);u.appendChild(ie("rect",{x:y,y:x,width:T,height:i,fill:ts[L]||ts.free,stroke:"var(--separator)","stroke-width":"1"})),as[L]&&u.appendChild(ie("rect",{x:y,y:x,width:T,height:i,fill:"url(#"+as[L]+")",opacity:".55"})),T>54&&u.appendChild(ie("text",{x:y+6,y:x+i/2+3},c("diagnostics.lab.stroke."+L))),u.appendChild(ie("line",{x1:w,x2:w,y1:x,y2:x+i,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),Ka(u,s,d,p),n.appendChild(u),t.appendChild(n)}function Dl(t,e,a,o){if(!o.cadence)return;let r=la(e),n=pa("diagnostics.lab.chart.cadence",Ga(a,null,r),"diagnostics.lab.chart.cadenceAria"),s=r.cadence.map(y=>y.rate_hz).filter(y=>y!=null&&Number.isFinite(y));if(!s.length){let y=document.createElement("div");y.className="lab-empty",y.textContent=c("diagnostics.lab.chart.cadenceEmpty"),n.appendChild(y),t.appendChild(n);return}let d=Ha(s.concat([0]),0,Math.max(10,...s));d.min=0;let p=e[0].t_ms,u=Math.max(1,e[e.length-1].t_ms-p),x=[],i=[];r.cadence.forEach((y,w)=>{y.rate_hz==null||!Number.isFinite(y.rate_hz)||(x.push({x:me.l+(y.t_ms-p)/u*Je,y:Wt(y.rate_hz,d)}),i.push(w))});let b=ie("svg",{viewBox:"0 0 "+da+" "+ca,role:"img"});tn(b,d),Ka(b,p,u),b.appendChild(ie("path",{d:Bt(x),fill:"none",stroke:Jo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),n.appendChild(b),t.appendChild(n),jt(b,n,{count:x.length,plotTop:me.t,plotBottom:me.t+Kt,xAt:y=>x[y].x,label:y=>((r.cadence[i[y]].t_ms-p)/1e3).toFixed(2)+" s",dots:y=>[{y:x[y].y,color:Jo}],rows:y=>{let w=r.cadence[i[y]];return[{color:Jo,label:c("diagnostics.lab.cadence"),value:w.rate_hz.toFixed(1)+" /s"},{color:en,label:c("diagnostics.lab.tachoPeriod"),value:Math.round(w.period_us)+" \xB5s"}]}})}function $l(t,e,a,o,r){if(!r.slope)return;let n=la(e),s=pa("diagnostics.lab.chart.slope",Ga(o,a,n),"diagnostics.lab.chart.slopeAria");if(!n.slopes.length){let w=document.createElement("div");w.className="lab-empty",w.textContent=c("diagnostics.lab.chart.slopeEmpty"),s.appendChild(w),t.appendChild(s);return}let d=n.slopes.map(w=>w.slope),p=a&&a.ok?a.suggested_slope:null,u=Ha(d.concat(p!=null?[p,0]:[0]),-2,8),x=e[0].t_ms,i=Math.max(1,e[e.length-1].t_ms-x),b=n.slopes.map(w=>({x:me.l+(w.t_ms-x)/i*Je,y:Wt(w.slope,u)})),y=ie("svg",{viewBox:"0 0 "+da+" "+ca,role:"img"});if(tn(y,u),Ka(y,x,i),p!=null){let w=Wt(p,u);y.appendChild(ie("line",{x1:me.l,x2:me.l+Je,y1:w,y2:w,stroke:Al,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}y.appendChild(ie("path",{d:Bt(b),fill:"none",stroke:Qo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),s.appendChild(y),t.appendChild(s),jt(y,s,{count:b.length,plotTop:me.t,plotBottom:me.t+Kt,xAt:w=>b[w].x,label:w=>((n.slopes[w].t_ms-x)/1e3).toFixed(2)+" s",dots:w=>[{y:b[w].y,color:Qo}],rows:w=>[{color:Qo,label:c("diagnostics.lab.slope"),value:n.slopes[w].slope.toFixed(2)+" mA/s"}]})}function ns(t,e){let a=e&&e.samples||[],o=e&&e.analysis,r=!!(e&&e.live),n=e&&e.overlays,s=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let d=document.createElement("div");d.className="motor-lab-charts";let p=document.createElement("div");return p.className="gw-controls",p.setAttribute("role","toolbar"),p.setAttribute("aria-label",c("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([x,i])=>{let b=document.createElement("button");b.type="button",b.className="gw-toggle"+(s[x]?"":" is-off"),b.dataset.layer=x,b.setAttribute("aria-pressed",s[x]?"true":"false"),b.textContent=c(i),p.appendChild(b)}),d.appendChild(p),a.length?(Rl(d,a,o,n,r,s),Pl(d,a,r,s),Dl(d,a,r,s),$l(d,a,o,r,s)):Fl(d,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(d),p}var an=400,Hl=500;var Ol=2e3,ua=["setup","arm","seat","open","close","review"],is=["none","open_circuit","blocked","timeout","overcurrent","thermal","stall","unknown","mechanical_overrun"],ql=8;var Bl=["","close_seat","open_stop","close_popoff","stall_cap","circuit_fault"];function jl(t){let e=Number(t)||0;return e?is[e]?`${is[e]} (${e})`:String(e):null}var sn=[{cls:"close-factor",key:"close_threshold_multiplier",id:l.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x",step:"0.1"},{cls:"open-factor",key:"open_threshold_multiplier",id:l.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x",step:"0.1"},{cls:"open-ripple",key:"open_ripple_limit_factor",id:l.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x",step:"0.05"}],Vl=`
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
`;D("diag-motor-lab",Vl);var Ul=()=>`
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
        ${sn.map(t=>`
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
`;function ls(t,e){return t==="open"?{factor:E(l.openThresholdMultiplier),slope:E(l.openSlopeThreshold),floor:E(l.openSlopeCurrentFactor),ripple:E(l.openRippleLimitFactor),caps:e}:{factor:E(l.closeThresholdMultiplier),slope:E(l.closeSlopeThreshold),floor:E(l.closeSlopeCurrentFactor),caps:e}}function ma(t){let e=ls(t.direction),o=[{key:(t.direction==="open"?"open":"close")+"_threshold_multiplier",labelKey:t.direction==="open"?"settings.motor.openThreshold":"settings.motor.closeThreshold",current:e.factor,suggested:t.suggested_factor,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&o.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:e.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),o}function on(t){return c(t?"common.on":"common.off")}function nn(t){return t===1?"HIGH":t===0?"LOW":"\u2014"}function Ft(t){return t==="rev32_gpio"||t==="rev31_gpio"}function rn(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",latchFaulted:!1,driversEnabled:null,latchArmLevel:null,latchStateLevel:null,motorEnableLevel:null,invalidSamples:0,tachoRejected:0,caps:null,baselineMa:null,baselineSettled:!1,countsSpurious:!1,lastFastTrip:0,endpointDecision:0,ceilingMs:0,ceilingCounts:0,ceilingSource:0,requiresCalibration:!1,positionConfident:!1,learnedStallMa:null}}var Qu=q({tag:"diag-motor-lab",render:Ul,onMount(t,e){let a=Number(P("selectedZone")||1),o="setup",r="idle",n={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1},s={open:null,close:null,seat:null},d={samples:[],analysis:null,live:!1},p=[],u={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},x=[],i=rn(),b=!1,y=e.querySelector(".lab-step-chip"),w=e.querySelector(".lab-zone-chip"),L=e.querySelector(".lab-banner"),T=e.querySelector(".lab-guide"),_=e.querySelector(".lab-kicker"),g=e.querySelector(".lab-stage h3"),m=e.querySelector(".lab-stage p"),f=e.querySelector(".lab-setup"),v=e.querySelector(".lab-zone"),S=e.querySelector(".lab-phase-label"),F=e.querySelector(".lab-log"),Y=e.querySelector(".lab-chart"),H=e.querySelector(".lab-download"),te=e.querySelector(".lab-capture-meta"),ne=e.querySelector(".lab-metrics"),le=e.querySelector(".lab-suggest"),W=e.querySelector(".lab-primary"),Z=e.querySelector(".lab-secondary"),pe=e.querySelector(".lab-estop"),X=Array.from(e.querySelectorAll(".lab-tune-input")),qe=e.querySelector(".lab-kv-body"),re={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),pad10:e.querySelector('[data-k="pad10"]'),pad9:e.querySelector('[data-k="pad9"]'),pad11:e.querySelector('[data-k="pad11"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function wt(z){p=z&&z.length?z:[];let N=p.length;if(H.hidden=N<2,te.hidden=N<2,N<2)return;let B=Number(p[0].t_ms)||0,G=Number(p[N-1].t_ms)||0,$=Math.max(0,(G-B)/1e3);te.textContent=c("diagnostics.lab.captureMeta",{n:N,hz:2,seconds:$.toFixed(1)})}function eo(z){let N=Math.max(0,Math.min(100,Number(z)||0))/100;return N<.3?.3*Math.pow(Math.max(N/.3,0),1.5):Math.pow(N,1.5)}function to(){if(!qe)return;let z=[10,20,30,40,50,60,70,80,90,100],N="";for(let B=0;B<z.length;B+=3){let G=[];for(let $=0;$<3;$++){let V=z[B+$];if(V==null){G.push("<td></td><td></td>");continue}G.push(`<td>${V}</td><td>${eo(V).toFixed(3)}</td>`)}N+=`<tr>${G.join("")}</tr>`}qe.innerHTML=N}to();function ha(z){return ua.indexOf(z)}function Yt(){return Ce(a)}function Jt(){let z=String(a);v.innerHTML=Array.from({length:6},(N,B)=>'<option value="'+(B+1)+'">'+Ce(B+1).replace(/</g,"&lt;")+"</option>").join(""),v.value=z,v.setAttribute("aria-label",c("diagnostics.lab.motor")),w.textContent=Yt(),w.setAttribute("aria-label",c("diagnostics.lab.motor"))}function Q(z,N){let B=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});x.push(B+"  "+c(z,N)),x.length>8&&x.shift(),F.innerHTML=x.map(G=>"<div>"+G+"</div>").join(""),F.scrollTop=F.scrollHeight}function Ve(z){L.textContent=z||"",L.classList.toggle("show",!!z)}function A(z,N){r=z,S.dataset.kind=N||"",S.textContent=c("diagnostics.lab.phase."+z)}function I(){for(let z of X){let N=E(z.dataset.tuneId);N==null||Number.isNaN(Number(N))||document.activeElement!==z&&(z.value=String(Number(N)))}}function ae(){for(let z of X){let N=()=>{var G;let B=Number(z.value);if(!Number.isFinite(B)){I();return}Re(z.dataset.tuneKey,B),Q("diagnostics.lab.log.tune",{key:c(((G=sn.find($=>$.key===z.dataset.tuneKey))==null?void 0:G.labelKey)||z.dataset.tuneKey),value:B}),d.analysis&&ve()};z.addEventListener("change",N),z.addEventListener("keydown",B=>{B.key==="Enter"&&(B.preventDefault(),z.blur(),N())})}}function ee(){let z=M(l.motorProfileDefault)||"HmIP VdMot",N;if(z==="HmIP VdMot"){let B=Number(i.ceilingMs);if(Number.isFinite(B)&&B>0)return Math.min(6e4,Math.round(B));N=Number(E(l.hmipRuntimeLimitSeconds)),(!Number.isFinite(N)||N<=0)&&(N=34),N=Math.min(34,N)}else N=Number(E(l.genericRuntimeLimitSeconds)),(!Number.isFinite(N)||N<=0)&&(N=45);return Math.min(6e4,Math.round(N*1e3))}async function we(){if(!n.active||n.aborted||n.pullInFlight)return;let z=Date.now();if(!(z-(n.pullAt||0)<5e3)){n.pullAt=z,n.pullInFlight=!0;try{let N=await wo(),B=Ko(N);B.length&&(n.hiRes=Xo(n.hiRes||[],B),wt(n.hiRes))}catch(N){}finally{n.pullInFlight=!1}}}function O(){let z=ia(i.stroke);re.current.textContent=i.current==null?"\u2014":i.current.toFixed(1)+" mA",re.mean.textContent=i.mean==null?"\u2014":i.mean.toFixed(1)+" mA",re.peak.textContent=i.peak==null?"\u2014":i.peak.toFixed(1)+" mA",re.slope.textContent=i.slope==null?"\u2014":i.slope.toFixed(1)+" mA/s",re.runtime.textContent=i.runtime?(i.runtime/1e3).toFixed(1)+" s":"\u2014",re.motion.textContent=i.motion?String(i.motion):"\u2014",re.cadence.textContent=i.cadenceHz==null?"\u2014":i.cadenceHz.toFixed(1)+" /s",re.direction.textContent=i.direction,re.drivers.textContent=on(i.driversEnabled!=null?i.driversEnabled:be(l.drivers)),re.busy.textContent=on(i.busy),re.armed.textContent=on(i.armed);let N=Ft(i.backend),B=re.pad10&&re.pad10.parentElement.querySelector("span"),G=re.pad9&&re.pad9.parentElement.querySelector("span");B&&(B.textContent=c(N?"diagnostics.lab.pad10":"diagnostics.lab.pad10nsleep")),G&&(G.textContent=c(N?"diagnostics.lab.pad9":"diagnostics.lab.pad9fault")),re.pad10&&(re.pad10.textContent=nn(i.latchArmLevel)),re.pad9&&(re.pad9.textContent=nn(i.latchStateLevel)),re.pad11&&(re.pad11.textContent=nn(i.motorEnableLevel)),re.backend.textContent=i.backend||"\u2014";let $=()=>{let V=jl(i.faultCode);if(V){if(i.faultCode===ql&&i.ceilingCounts>0){let ue=i.motion>=i.ceilingCounts;return`${V} \xB7 ${ue?"count ceiling":"time ceiling"}`}return V}return i.endpointDecision===7?"stopped, unconfirmed":i.lastFastTrip?`stopped \xB7 ${Bl[i.lastFastTrip]||i.lastFastTrip}`:c("common.ok")};re.fault.textContent=i.latchFaulted?c("diagnostics.lab.faultLatch"):$(),re.invalid.textContent=String(i.invalidSamples||0),re.tachoRejected.textContent=String(i.tachoRejected||0),re.stroke.textContent=c("diagnostics.lab.stroke."+z),re.stroke.dataset.phase=z,i.pinSeen?(re.pin.textContent=c("diagnostics.lab.pinSeen",{count:i.pinAt}),re.pin.dataset.seen="true"):(re.pin.textContent=c("diagnostics.lab.pinWaiting"),re.pin.dataset.seen="false")}function ve(){let z=d.analysis?Qr(d.analysis,ls(d.analysis.direction,i.caps)):[],N=ns(Y,{samples:d.samples,analysis:d.analysis,live:d.live,overlays:z,visible:u});N&&N.addEventListener("click",B=>{let G=B.target.closest(".gw-toggle");if(!G)return;let $=G.dataset.layer;u[$]=!u[$],Object.keys(u).some(ue=>u[ue])||(u[$]=!0),ve()})}function fe(z,N,B){d={analysis:z&&z.ok?z:null,samples:N||[],live:!!B},wt(d.samples),d.analysis&&(i.mean=d.analysis.mean_ma,i.peak=d.analysis.peak_ma,i.slope=d.analysis.max_stall_slope_ma_s),ve();let G=[];if(o==="review"?(s.open&&G.push(...ma(s.open)),s.close&&G.push(...ma(s.close))):d.analysis&&G.push(...ma(d.analysis)),!d.analysis&&o!=="review"){ne.innerHTML="",le.hidden=!0;return}let $=o==="review"?s.close||s.open:d.analysis;if(!$){ne.innerHTML="",le.hidden=!0;return}let V=$.pin_seen?c("diagnostics.lab.pinMetric",{ms:$.pin_t_ms,count:$.pin_motion_count}):c("diagnostics.lab.pinWaiting"),ue=[[c("diagnostics.lab.mean"),$.mean_ma.toFixed(1)+" mA"],[c("diagnostics.lab.peak"),$.peak_ma.toFixed(1)+" mA"],[c("diagnostics.lab.runtime"),($.runtime_ms/1e3).toFixed(1)+" s"],[c("diagnostics.lab.ripples"),String($.ripples)],[c("diagnostics.lab.pin"),V]];if(o==="review"&&s.open&&s.close){ue[0]=[c("diagnostics.lab.mean"),s.open.mean_ma.toFixed(1)+" / "+s.close.mean_ma.toFixed(1)+" mA"],ue[1]=[c("diagnostics.lab.peak"),s.open.peak_ma.toFixed(1)+" / "+s.close.peak_ma.toFixed(1)+" mA"];let he=s.close.pin_seen?c("diagnostics.lab.pinMetric",{ms:s.close.pin_t_ms,count:s.close.pin_motion_count}):c("diagnostics.lab.pinWaiting");ue[4]=[c("diagnostics.lab.pin"),he]}ne.innerHTML=ue.map(he=>'<div class="lab-metric"><span>'+he[0]+"</span><strong>"+he[1]+"</strong></div>").join(""),le.querySelector("tbody").innerHTML=G.map(he=>"<tr><td>"+c(he.labelKey)+"</td><td>"+Number(he.current).toFixed(1)+" "+he.unit+'</td><td class="better">'+Number(he.suggested).toFixed(1)+" "+he.unit+"</td></tr>").join(""),le.hidden=!G.length}function de(){let z=o==="halted",N=z?"setup":o,B=ha(N),G=z?"halted":"active";y.dataset.state=G,y.textContent=z?c("diagnostics.lab.halted"):c("diagnostics.lab.stepChip",{step:B+1,total:ua.length,name:c("diagnostics.lab.steps."+N)}),_.textContent=z?c("diagnostics.lab.halted"):c("diagnostics.lab.stepOf",{step:B+1,total:ua.length});let $=!z&&N==="arm"&&!Ft(i.backend)?"enable":z?"halt":N;g.textContent=c("diagnostics.lab."+$+".title");let V=o==="seat"&&s.seat||o==="open"&&s.open||o==="close"&&s.close,ue=z?"diagnostics.lab.halt.copy":V?"diagnostics.lab."+N+".done":"diagnostics.lab."+$+".copy";m.textContent=c(ue);let he=o==="setup";T.dataset.setup=he?"true":"false",f.hidden=!he,v.disabled=!he||n.active,w.hidden=he,w.textContent=Yt(),pe.dataset.armed=n.active?"true":"false",O();let Se=n.active,ze={key:"diagnostics.lab.next",disabled:Se,action:"next"},j=null;o==="setup"?ze={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:o==="arm"?ze={key:Ft(i.backend)?"diagnostics.lab.arm.action":"diagnostics.lab.enable.action",disabled:Se,action:"arm"}:o==="seat"?ze={key:s.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:Se,action:s.seat?"next":"seat"}:o==="open"?ze={key:s.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:Se,action:s.open?"next":"open"}:o==="close"?ze={key:s.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:Se,action:s.close?"next":"close"}:o==="review"?(ze={key:"diagnostics.lab.apply",disabled:!(s.open||s.close),action:"apply"},j={key:"diagnostics.lab.restart",action:"restart"}):z&&(ze={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),Se&&(ze={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!Se&&(o==="seat"||o==="open"||o==="close")&&!s[o==="seat"?"seat":o]&&r==="failed"&&(ze={key:"diagnostics.lab.retry",disabled:!1,action:o}),!Se&&V&&(o==="seat"||o==="open"||o==="close")&&(j={key:"diagnostics.lab.restart",action:"restart"}),W.dataset.action=ze.action,W.disabled=!!ze.disabled,W.textContent=c(ze.key),j?(Z.hidden=!1,Z.dataset.action=j.action,Z.textContent=c(j.key)):(Z.hidden=!0,Z.dataset.action="")}function ke(z){Be("motorLabBusy",!!z)}function We(){n.timer&&clearTimeout(n.timer),n.timer=null}function $e(z){if(o=z,(z==="arm"||z==="setup")&&Ve(""),z==="review"){ke(!1);let N=s.close||s.open;fe(N,N?N.samples:[],!1),A("done","ok")}else z==="setup"&&(ke(!1),fe(null,[],!1));de()}async function at(){if(!n.active){ke(!0),n.active=!0,A("arming","run"),de(),Q("diagnostics.lab.log.arming",{zone:a});try{if(P("manualMode")||(Be("manualMode",!0),await Ht(!0),Q("diagnostics.lab.log.manual")),n.aborted)return;let z=await Lt(),N=z&&z.data&&z.data.motor_safety?z.data.motor_safety:{};if(i.backend=N.backend||i.backend,O(),Ft(i.backend)){Q("diagnostics.lab.log.armProbeWait");let $=await xo({hz:100,durationMs:4e3});if(n.aborted)return;let V=$&&$.data?$.data:{};if(Q("diagnostics.lab.log.armProbe",{hz:V.hz||100,cycles:V.cycles||0,armed:V.armed?c("common.on"):c("common.off"),at:V.armed_at_cycle||0}),i.armed=!!V.armed,i.latchFaulted=!V.armed,O(),!V.armed)throw Ve(c("diagnostics.lab.latchBanner")),new Error("latch")}else Q("diagnostics.lab.log.enableWait");await $t(!0),Q("diagnostics.lab.log.drivers");let B=Date.now()+4e3,G=!1;for(;Date.now()<B;){if(n.aborted)return;let $=await Lt(),V=$&&$.data?$.data:{},ue=V.motor_safety||{};if(i.driversEnabled=V.drivers_enabled!=null?!!V.drivers_enabled:i.driversEnabled,i.armed=!!ue.armed,i.latchFaulted=!!ue.latch_faulted,i.backend=ue.backend||i.backend,i.latchArmLevel=ue.latch_arm_level,i.latchStateLevel=ue.latch_state_level,i.motorEnableLevel=ue.motor_enable_level,O(),V.drivers_enabled&&!ue.latch_faulted){G=!0;break}await new Promise(he=>setTimeout(he,an))}if(!G){let $=Ft(i.backend);throw Ve(c($?"diagnostics.lab.latchBanner":"diagnostics.lab.enableBanner")),new Error($?"latch":"enable")}A("armed","ok"),Q("diagnostics.lab.log.armed"),n.active=!1,$e("seat")}catch(z){n.active=!1,ke(!1),A("failed","halt"),Q(z&&z.message==="arm_gpio"?"diagnostics.lab.log.armGpio":z&&z.message==="latch"?"diagnostics.lab.log.latchFaulted":z&&z.message==="enable"?"diagnostics.lab.log.enableFailed":"diagnostics.lab.log.armFailed"),de()}}}async function ct(z,N){let B=n.live.slice(),G=[];for(let et=0;et<6;et++){if(n.aborted)return;try{A("fetching","run"),de();let tt=await wo();Q("diagnostics.lab.log.trace"),G=Ko(tt);break}catch(tt){if(tt&&tt.code==="motor_busy"){await new Promise(oo=>setTimeout(oo,250));continue}Q("diagnostics.lab.log.traceFailed");break}}G.length&&(n.hiRes=Xo(n.hiRes||[],G));let $=n.hiRes||[],V=B.length&&Number(B[B.length-1].t_ms)||0,ue=G.length&&Number(G[G.length-1].t_ms)||0,he=$.length&&Number($[$.length-1].t_ms)||0,Se=$.length?$:B.length?B:G,ze=G.length>=8&&ue>=Math.max(400,Math.max(V,he)*.45)?G:Se;if(!Se.length){A("failed","halt"),Q("diagnostics.lab.log.traceFailed"),fe(null,[],!1);return}let j=Jr(ze,z);if(N&&(s[N]=j.ok?j:null),fe(j,Se,!1),!j.ok)A("failed","halt"),j.reason==="no_endstop"?Q("diagnostics.lab.log.noEndstop",{direction:c("diagnostics.lab.dir."+z),seconds:((j.runtime_ms||0)/1e3).toFixed(0)}):Q(N==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),N==="seat"&&(s.seat={short:!0},Q("diagnostics.lab.log.seatContinue"));else{if(A("done","ok"),Q("diagnostics.lab.log.captured",{direction:c("diagnostics.lab.dir."+j.direction),peak:j.peak_ma.toFixed(1)}),j.pin_seen){let et=i.pinSeen;i.pinSeen=!0,i.pinAt=j.pin_motion_count,i.pinMa=j.pin_current_ma,i.stroke=1,et||Q("diagnostics.lab.log.pinTrace",{count:j.pin_motion_count,ma:j.pin_current_ma.toFixed(1),ms:j.pin_t_ms})}else(N==="close"||N==="seat")&&Q("diagnostics.lab.log.pinMissing");(he>ue+250||V>ue+250)&&Q("diagnostics.lab.log.browserLog",{seconds:(Math.max(he,V)/1e3).toFixed(1)})}}function _e(z){let N=z.map(G=>G.current_ma).filter(Number.isFinite);if(!N.length)return;let B=N.reduce((G,$)=>G+$,0);if(i.mean=Math.round(B/N.length*10)/10,i.peak=Math.round(Math.max(...N)*10)/10,z.length>=2){let G=z[Math.max(0,z.length-3)],$=z[z.length-1],V=($.t_ms-G.t_ms)/1e3;V>.05&&(i.slope=Math.round(($.current_ma-G.current_ma)/V*10)/10)}}async function pt(z,N){if(!n.active){n={active:!0,aborted:!1,direction:z,timer:null,live:[],hiRes:[],started:Date.now(),pullAt:0,pullInFlight:!1,chartAt:0},ke(!0),i=rn(),b=!1,i.direction=c("diagnostics.lab.dir."+z),A("starting","run"),de(),fe(null,[],!0),wt([]),Q("diagnostics.lab.log.starting",{direction:c("diagnostics.lab.dir."+z),zone:a});try{try{await Ea(a),Q("diagnostics.lab.log.resetLearned")}catch(Se){Q("diagnostics.lab.log.resetLearnedFailed")}if(n.aborted)return;let B=ee(),G=B+8e3;if(Q("diagnostics.lab.log.duration",{seconds:(B/1e3).toFixed(0)}),z==="open"?await Ma(a,B):await Aa(a,B),n.aborted)return;A("waiting","run"),de();let $=!1,V=!1,ue=()=>{V||n.aborted||!n.active||(n.timer=setTimeout(he,an))},he=async()=>{if(!(V||n.aborted||!n.active)){try{let Se=await Lt();if(V||n.aborted||!n.active)return;let ze=Se&&Se.data?Se.data:{},j=ze.motor_safety||{},et=Number(j.current_ma),tt=!!j.motor_busy,oo=j.drive_on!=null?!!j.drive_on:tt;tt&&!$&&($=!0,A("running","run"),Q("diagnostics.lab.log.busy")),i.busy=tt,i.runtime=Date.now()-n.started,i.motion=Number(j.motion_evidence_count)||i.motion,i.stroke=Number(j.stroke_phase)||0,i.tachoPeriodUs=Number(j.tacho_period_us)||i.tachoPeriodUs,i.tachoCadenceUs=Number(j.tacho_cadence_us)||i.tachoCadenceUs;let gn=i.tachoPeriodUs||i.tachoCadenceUs;i.cadenceHz=gn>0?1e6/gn:null,i.faultCode=Number(j.fault_code)||0,i.armed=!!j.armed,i.latchFaulted=!!j.latch_faulted,i.latchArmLevel=j.latch_arm_level,i.latchStateLevel=j.latch_state_level,i.motorEnableLevel=j.motor_enable_level,i.driversEnabled=ze.drivers_enabled!=null?!!ze.drivers_enabled:i.driversEnabled,i.backend=j.backend||i.backend,i.invalidSamples=Number(j.invalid_samples)||0,i.tachoRejected=Number(j.tacho_rejected)||0,j.cap_seat_ma!=null&&(i.caps={seat:Number(j.cap_seat_ma),popoff:Number(j.cap_popoff_ma),open:Number(j.cap_open_ma),stall:Number(j.cap_stall_ma),circuit:Number(j.cap_circuit_ma)}),j.baseline_ma!=null&&(i.baselineMa=Number(j.baseline_ma)),i.baselineSettled=!!j.baseline_settled,i.countsSpurious=!!j.counts_spurious,i.lastFastTrip=Number(j.last_fast_trip)||0,i.endpointDecision=Number(j.endpoint_decision)||0,i.ceilingMs=Number(j.ceiling_ms)||0,i.ceilingCounts=Number(j.ceiling_counts)||0,i.ceilingSource=Number(j.ceiling_source)||0,i.requiresCalibration=!!j.requires_calibration,i.positionConfident=!!j.position_confident,j.learned_stall_ma!=null&&(i.learnedStallMa=Number(j.learned_stall_ma)),i.countsSpurious&&!b&&(b=!0,Q("diagnostics.lab.log.spurious",{})),!i.pinSeen&&(i.stroke===1||i.stroke===2)&&(i.pinSeen=!0,i.pinAt=i.motion,i.pinMa=Number.isFinite(et)?et:i.current,Q("diagnostics.lab.log.pin",{count:i.pinAt,ma:Number(i.pinMa||0).toFixed(1)})),Number.isFinite(et)&&(i.current=et,n.live.push({t_ms:Date.now()-n.started,current_ma:et,motion_count:i.motion,drive_on:oo,direction_open:z==="open",stroke_phase:i.stroke,tacho_period_us:i.tachoPeriodUs,tacho_cadence_us:i.tachoCadenceUs,armed:i.armed,fault_code:i.faultCode,backend:i.backend}),_e(n.live)),tt&&we(),O();let no=Date.now();if(no-(n.chartAt||0)>=Hl){n.chartAt=no;let ks=n.hiRes.length?n.hiRes:Go(n.live,2);fe(null,ks,!0)}let bn=no-n.started;if(!$&&bn>Ol){V=!0,We(),n.active=!1,A("failed","halt"),j.latch_faulted?(Ve(c("diagnostics.lab.latchBanner")),Q("diagnostics.lab.log.latchFaulted")):Q("diagnostics.lab.log.neverStarted"),de();return}if($&&!tt||bn>G){V=!0,We(),i.busy=!1,$&&Q("diagnostics.lab.log.stopped"),n.active=!1,await ct(z,N),de();return}}catch(Se){if(Date.now()-n.started>G){V=!0,We(),n.active=!1,A("failed","halt"),Q("diagnostics.lab.log.traceFailed"),de();return}}ue()}};he()}catch(B){n.active=!1,A("failed","halt"),Q("diagnostics.lab.log.startFailed"),de()}}}function kt(){We(),ke(!1),n={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1,chartAt:0},s={open:null,close:null,seat:null},i=rn(),b=!1,x.length=0,F.innerHTML="",Ve(""),wt([]),A("idle"),$e("setup")}async function Ue(){n.aborted=!0,n.active=!1,We(),ke(!1),i.busy=!1,Ve(c("diagnostics.lab.estopDone")),A("halted","halt"),Q("diagnostics.lab.log.estop"),o="halted",de();try{await jn()}catch(z){}O()}function ut(){let z=ha(o);z<0||z>=ua.length-1||$e(ua[z+1])}function Rt(z){if(z==="start"){ke(!0),Q("diagnostics.lab.log.selected",{zone:a}),$e("arm");return}if(z==="arm")return at();if(z==="seat")return pt("close","seat");if(z==="open")return pt("open","open");if(z==="close")return pt("close","close");if(z==="next")return ut();if(z==="restart")return kt();if(z==="apply"){let N=[];s.open&&N.push(...ma(s.open)),s.close&&N.push(...ma(s.close)),N.forEach(B=>Re(B.key,B.suggested)),A("applied","ok"),Q("diagnostics.lab.log.applied"),de()}}W.addEventListener("click",()=>Rt(W.dataset.action)),Z.addEventListener("click",()=>Rt(Z.dataset.action)),pe.addEventListener("click",Ue),H.addEventListener("click",()=>{if(!p.length)return;let z=n.direction||"trace";Xr(p,"motor-lab-z"+a+"-"+z+".csv")}),v.addEventListener("change",()=>{a=Number(v.value||1),w.textContent=Yt()});function ao(z){z.key==="Escape"&&P("section")==="motorlab"&&(z.preventDefault(),Ue())}window.addEventListener("keydown",ao),Jt(),ae(),I(),A("idle"),fe(null,[],!1),de(),Lt().then(z=>{let N=z&&z.data&&z.data.motor_safety?z.data.motor_safety:{};i.backend=N.backend||i.backend,i.armed=!!N.armed,i.latchFaulted=!!N.latch_faulted,i.latchArmLevel=N.latch_arm_level,i.latchStateLevel=N.latch_state_level,i.motorEnableLevel=N.motor_enable_level,z&&z.data&&z.data.drivers_enabled!=null&&(i.driversEnabled=!!z.data.drivers_enabled),de()}).catch(()=>{}),C(l.drivers,O);for(let z of sn)C(z.id,()=>{I(),d.analysis&&ve()});U("manualMode",O),U("selectedZone",()=>{o==="setup"&&(a=Number(P("selectedZone")||a),v.value=String(a))}),R(e)}});var Zl=`
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
`;D("diag-system-card",Zl);var Wl=()=>`
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
`,im=q({tag:"diag-system-card",render:Wl,onMount(t,e){let a=e.querySelector('[data-k="cpu0"]'),o=e.querySelector('[data-k="cpu1"]'),r=e.querySelector('[data-k="heap"]'),n=e.querySelector('[data-k="dma"]'),s=e.querySelector('[data-k="largestInternal"]'),d=e.querySelector('[data-k="minInternal"]'),p=e.querySelector('[data-k="psram"]'),u=e.querySelector('[data-k="largestPsram"]'),x=e.querySelector('[data-k="bleAds"]'),i=e.querySelector('[data-k="bleLastAdv"]'),b=e.querySelector('[data-k="bleState"]'),y=e.querySelector('[data-bar="cpu0"]'),w=e.querySelector('[data-bar="cpu1"]'),L=e.querySelector('[data-k="reset"]'),T=(f,v,S)=>{if(S==null||!Number.isFinite(Number(S))){f.textContent="\u2014",f.classList.remove("warn"),v.style.width="0%";return}let F=Math.max(0,Math.min(100,Number(S)));f.textContent=F.toFixed(0)+"%",f.classList.toggle("warn",F>=90),v.style.width=F+"%"},_=(f,v,S)=>{if(v==null||!Number.isFinite(Number(v))){f.textContent="\u2014";return}let F=Number(v);f.textContent=F+" KB",f.classList.toggle("warn",S!=null&&F<S)},g=f=>{if(f==null||!Number.isFinite(Number(f))||Number(f)<=0)return"\u2014";let v=Number(f);return v<1e3?Math.round(v)+" ms":v<6e4?(v/1e3).toFixed(1)+" s":Math.round(v/6e4)+" min"},m=()=>{T(a,y,E(l.cpuLoadCore0)),T(o,w,E(l.cpuLoadCore1)),_(r,E(l.freeInternalKb),48),_(n,E(l.freeDmaKb),32),_(s,E(l.largestInternalKb),24),_(d,E(l.minInternalKb),48),_(p,E(l.freePsramKb),null),_(u,E(l.largestPsramKb),null);let f=E(l.bleAdsPerSec);f==null||!Number.isFinite(Number(f))?x.textContent="\u2014":x.textContent=Number(f).toFixed(1)+"/s",i.textContent=g(E(l.bleLastAdvAgeMs));let v=M(l.bleDemanded)==="on",S=M(l.bleHubEnabled)==="on",F=M(l.bleScanning)==="on",Y=[];Y.push(v?"demanded":"idle"),S?Y.push(F?"scanning":"on"):Y.push("off"),b.textContent=Y.join(" \xB7 ");let H=String(M(l.resetReason)||P("resetReason")||"").trim();L.textContent=H||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{Zn().catch(f=>console.error("[System] dump failed:",f))}),C(l.cpuLoadCore0,m),C(l.cpuLoadCore1,m),C(l.freeInternalKb,m),C(l.freeDmaKb,m),C(l.largestInternalKb,m),C(l.minInternalKb,m),C(l.freePsramKb,m),C(l.largestPsramKb,m),C(l.bleAdsPerSec,m),C(l.bleLastAdvAgeMs,m),C(l.bleHubEnabled,m),C(l.bleScanning,m),C(l.bleDemanded,m),C(l.resetReason,m),U("resetReason",m),R(e),m()}});var ds=`
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
`;function Xa({liveHtml:t="",provisionHtml:e="",attrs:a=""}={}){return`<div class="lds-int-split int-split" data-lds-int-split ${a}>${t}${e}</div>`}var ln="hv6_available_probes",dn=new Set,Qe=2,cn=8;function ga(t){let e=Number(t);return Number.isFinite(e)&&e>=cn?cn:Qe}function Kl(t){return t?cn:Qe}function it(){try{return ga(localStorage.getItem(ln)||Qe)}catch(t){return Qe}}function Gl(t){let e=ga(t),a=Qe;try{a=ga(localStorage.getItem(ln)||Qe)}catch(o){a=Qe}if(e===a)return e;try{localStorage.setItem(ln,String(e))}catch(o){}for(let o of dn)o(e);return e}function cs(t){return Gl(Kl(t))}function Ya(t){return dn.add(t),()=>dn.delete(t)}function st(t){let e=String(t||"").match(/(\d+)/);return e?Number(e[1]):0}function Xl(t,e){let a=`Probe ${t}`;return e==null||Number.isNaN(Number(e))?a:`${a} \xB7 ${(Math.round(Number(e)*10)/10).toFixed(1)}\xB0`}function Gt({includeNone:t=!1,count:e=it(),temps:a=null}={}){let o=ga(e),r=t?'<option value="None" data-i18n="common.none">None</option>':"";for(let n=1;n<=o;n++){let s=a?a[n]:null,d=Xl(n,s);r+=`<option value="Probe ${n}">${d}</option>`}return r}function lt(t,e=it(),a=null){let o=ga(e),r=String(t||"").match(/(\d+)/);if(!r)return a||t;let n=Number(r[1]);return n>=1&&n<=o?`Probe ${n}`:a||`Probe ${o}`}function Ja({flow:t,return:e,zoneProbes:a}){let o=Object.create(null),r=st(t),n=st(e);r&&(o[r]="flow"),n&&(o[n]=o[n]?"flow+return":"return");for(let s=1;s<=6;s++){let d=st(a&&a[s]);d&&(o[d]=o[d]?`${o[d]}+Z${s}`:`Z${s}`)}return o}function ba(t,e,a){let o=st(t);if(!o)return!1;let r=e[o];return r?a?r!==a&&!String(r).split("+").includes(a):!0:!1}var Yl=`
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
`;D("settings-manifold-card",Yl);function ps(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}function pn(t){return st(t)}function Jl(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=E(h.probeTemp(e));return t}function Ql(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=M(h.probe(e));return t}var ed=()=>{let t=it(),e=Gt({count:t}),a="";for(let o=1;o<=8;o++)a+=`<div class="sm-probe-row${o>t?" is-hidden":""}" data-probe-row="${o}">
      <span class="sm-probe-id">P${o}</span>
      <span class="sm-probe-temp" data-probe="${o}">\u2014</span>
      <span class="sm-probe-role" data-probe-role="${o}"></span>
    </div>`;return xe({className:"settings-manifold-card",titleHtml:`<span data-i18n="settings.manifold.title">Manifold Configuration</span>${Le("settings.manifold.help")}`,bodyHtml:Xa({liveHtml:`<div class="sm-probe-live">
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
      </div>`})})},ym=q({tag:"settings-manifold-card",render:ed,onMount(t,e){let a=e.querySelector(".sm-type"),o=e.querySelector(".sm-flow"),r=e.querySelector(".sm-ret"),n=e.querySelector(".sm-flow-live"),s=e.querySelector(".sm-ret-live"),d=e.querySelector(".sm-probe-list"),p=e.querySelector("[data-probe-err]"),u=e.querySelector("[data-probe-warn]"),x=Me(e,{immediate:!0});x.select(a,{read:()=>M(l.manifoldType)||"NO (Normally Open)",commit:m=>Ne("manifold_type",m)});function i(m){return Ja({flow:m==="flow"?null:o.value||M(l.manifoldFlowProbe),return:m==="return"?null:r.value||M(l.manifoldReturnProbe),zoneProbes:Ql()})}function b(m){p&&(p.hidden=!m,p.textContent=m||"")}x.select(o,{read:()=>lt(M(l.manifoldFlowProbe)||"Probe 1",it(),"Probe 1"),commit:async m=>{if(ba(m,i("flow"),"flow")){b(c("settings.manifold.probeConflict")),x.refresh();return}b("");try{await Ne("manifold_flow_probe",m)}catch(f){b(c("settings.manifold.probeConflict")),x.refresh()}}}),x.select(r,{read:()=>lt(M(l.manifoldReturnProbe)||"Probe 2",it(),"Probe 2"),commit:async m=>{if(ba(m,i("return"),"return")){b(c("settings.manifold.probeConflict")),x.refresh();return}b("");try{await Ne("manifold_return_probe",m)}catch(f){b(c("settings.manifold.probeConflict")),x.refresh()}}});function y(m,f,v){return m===f&&m===v?c("settings.manifold.roleBoth"):m===f?c("settings.manifold.roleFlow"):m===v?c("settings.manifold.roleReturn"):""}function w(m,f){let v=ps(f);m.textContent=v,m.classList.toggle("is-empty",v==="\u2014")}function L(m){let f=Gt({count:m,temps:Jl()});for(let v of[o,r]){let S=v.value,F=v===o?"Probe 1":"Probe 2";v.innerHTML=f,v.value=lt(S,m,F)}m>=2&&o.value===r.value&&(r.value=o.value==="Probe 1"?"Probe 2":"Probe 1")}function T(){if(!u)return;let m=0,f=0;for(let S=1;S<=6;S++){let F=String(M(h.enabled(S))||"").toLowerCase()==="on";F&&f++;let Y=pn(M(h.probe(S)));F&&Y>=3&&m++}let v=m>0&&f>m;u.hidden=!v,v&&(u.textContent=c("settings.manifold.unusedProbeWarn",{enabled:f,assigned:m}))}function _(m,{commitClamp:f=!1}={}){d&&(d.dataset.count=String(m)),L(m);for(let v=1;v<=8;v++){let S=e.querySelector('[data-probe-row="'+v+'"]');S&&S.classList.toggle("is-hidden",v>m)}if(f){let v=lt(o.value||M(l.manifoldFlowProbe)||"Probe 1",m,"Probe 1"),S=lt(r.value||M(l.manifoldReturnProbe)||"Probe 2",m,"Probe 2");m>=2&&v===S&&(S=v==="Probe 1"?"Probe 2":"Probe 1"),v!==M(l.manifoldFlowProbe)&&Ne("manifold_flow_probe",v),S!==M(l.manifoldReturnProbe)&&Ne("manifold_return_probe",S),o.value=v,r.value=S}g()}function g(){let m=pn(o.value||M(l.manifoldFlowProbe)),f=pn(r.value||M(l.manifoldReturnProbe));w(n,m?E(h.probeTemp(m)):null),w(s,f?E(h.probeTemp(f)):null);let v=it();d&&(d.dataset.count=String(v));for(let S=1;S<=8;S++){let F=e.querySelector('[data-probe-row="'+S+'"]'),Y=e.querySelector('[data-probe="'+S+'"]'),H=e.querySelector('[data-probe-role="'+S+'"]'),te=E(h.probeTemp(S)),ne=ps(te),le=y(S,m,f);Y&&(Y.textContent=ne),H&&(H.textContent=le),F&&(F.classList.toggle("is-empty",ne==="\u2014"),F.classList.toggle("is-role",!!le),F.classList.toggle("is-hidden",S>v))}T()}o.addEventListener("change",g),r.addEventListener("change",g),C(l.manifoldType,x.refresh),C(l.manifoldFlowProbe,()=>{x.refresh(),g()}),C(l.manifoldReturnProbe,()=>{x.refresh(),g()});for(let m=1;m<=8;m++)C(h.probeTemp(m),()=>{L(it()),g()});for(let m=1;m<=6;m++)C(h.probe(m),T),C(h.enabled(m),T);Ya(m=>{_(m,{commitClamp:!1}),x.refresh()}),R(e),_(it()),x.refresh(),g()}});var td=`
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
`;D("settings-touch-card",td);var ad=()=>xe({className:"settings-touch-card",titleHtml:"Lune Touch connection",bodyHtml:`
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
  `}),Mm=q({tag:"settings-touch-card",render:ad,onMount(t,e){let a=e.querySelector(".touch-status"),o=e.querySelector(".touch-status-copy"),r=e.querySelector(".touch-identity"),n=e.querySelector(".touch-note"),s=e.querySelector(".touch-error"),d=e.querySelector(".touch-approve"),p=e.querySelector(".touch-disconnect");function u(){let x=be(l.authorityConfigured),i=be(l.authorityProposalPending),b=M(l.authorityState)||"unconfigured",y=i?M(l.authorityProposalInstallationId):M(l.authorityInstallationId),w=i?M(l.authorityProposalCoordinatorId):M(l.authorityCoordinatorId),L=M(l.authorityProposalName)||"Lune Touch",T=M(l.authorityProposalSite)||"House";a.classList.toggle("connected",x&&!i),a.classList.toggle("pending",i),o.innerHTML=i?`<strong>${L} is ready to connect</strong>${x?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:x?`<strong>Control approved</strong>${b.replace(/_/g," ")}${Number(E(l.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(E(l.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",r.hidden=!x&&!i,e.querySelector(".touch-name").textContent=i?L:"Lune Touch",e.querySelector(".touch-site").textContent=i?T:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=y||"\u2014",e.querySelector(".touch-coordinator-value").textContent=w||"\u2014",n.textContent=i?"Approval is local to this manifold. Discovery alone never grants control.":x?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",d.hidden=!i,p.hidden=!x||i}d.addEventListener("click",async()=>{s.textContent="",d.disabled=!0,d.textContent="Approving\u2026";try{await In()}catch(x){s.textContent=(x==null?void 0:x.message)||"Unable to approve Lune Touch."}finally{d.disabled=!1,d.textContent="Approve Lune Touch"}}),p.addEventListener("click",async()=>{if(s.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){p.disabled=!0;try{await Hn()}catch(x){s.textContent=(x==null?void 0:x.message)||"Unable to disconnect Lune Touch."}finally{p.disabled=!1}}}),[l.authorityConfigured,l.authorityInstallationId,l.authorityCoordinatorId,l.authorityState,l.authorityLeaseRemainingS,l.authorityProposalPending,l.authorityProposalInstallationId,l.authorityProposalCoordinatorId,l.authorityProposalName,l.authorityProposalSite].forEach(x=>C(x,u)),u()}});var od=()=>xe({className:"settings-minimum-flow-card",titleHtml:`<span data-i18n="settings.minFlow.title">Minimum zone flow</span>${Le("settings.minFlow.help")}`,bodyHtml:`
    ${Pe({on:!1,label:"Enable minimum zone flow",className:"smf-always",attrs:'data-i18n-label="settings.minFlow.title"'})}
    <div class="ui-row smf-pct-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Minimum total opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">Only across loops already accepting heat.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
    <p class="ui-note smf-failsafe" data-i18n="settings.minFlow.failsafe">
      Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.
    </p>
  `}),Dm=q({tag:"settings-minimum-flow-card",render:od,onMount(t,e){let a=e.closest('[data-collapse-block="min-flow"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="min-flow"]'),r=e.querySelector(".smf-always");o&&r&&o.appendChild(r);let n=e.querySelector(".smf-pct"),s=e.querySelector(".smf-pct-row"),d=Me(e,{immediate:!0}),p=u=>{a==null||a.classList.toggle("is-collapsed",!u),s.hidden=!u,s.setAttribute("aria-hidden",u?"false":"true"),n.disabled=!u};d.toggle(r,{read:()=>be(l.minimumFlowAlways),onChange:p,commit:u=>{let x=u?"on":"off";k(l.minimumFlowAlways,{state:x}),Ne("minimum_flow_always",x).catch(()=>k(l.minimumFlowAlways,{state:u?"off":"on"}))}}),d.num(n,{read:()=>E(l.minZoneFlowPct),commit:u=>{k(l.minZoneFlowPct,{value:u}),Re("min_zone_flow_pct",u)}}),C(l.minimumFlowAlways,d.refresh),C(l.minZoneFlowPct,d.refresh),R(e),d.refresh()}});var nd=`
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
`;D("settings-return-temp-card",nd);function dt(t){return!!(t&&t!=="None")}function us(t){return"Probe "+(t+2)}function rd(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=E(h.probeTemp(e));return t}function sd(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=M(h.probe(e));return t}function id(){for(let t=1;t<=6;t++)if(dt(M(h.probe(t))))return!0;return!1}function ld(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}var dd=()=>{let t=Gt({includeNone:!0}),e="";for(let a=1;a<=6;a++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${a}">
        <span class="ui-label srt-zone-label" data-zone-label="${a}">${ot(a)}</span>
        <span class="ui-field"><div class="srt-probe-pair"><select class="ui-select srt-probe" data-zone="${a}">${t}</select><span class="srt-live" data-zone-live="${a}">\u2014</span></div></span>
      </div>`;return xe({className:"settings-return-temp-card",titleHtml:`<span data-i18n="settings.returnTemp.title">Return temperature</span>${Le("settings.returnTemp.help")}`,bodyHtml:`
      ${Pe({on:!1,label:"Enable return temperature probes",className:"srt-enabled",attrs:'data-i18n-label="settings.returnTemp.title"'})}
      <div class="srt-err" hidden data-srt-err></div>
      <div class="srt-zones">${e}</div>
    `})},Zm=q({tag:"settings-return-temp-card",render:dd,onMount(t,e){let a=e.closest('[data-collapse-block="return-temp"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="return-temp"]'),r=e.querySelector(".srt-enabled");o&&r&&o.appendChild(r);let n=e.querySelector(".srt-zones"),s=Array.from(e.querySelectorAll(".srt-probe")),d=e.querySelector("[data-srt-err]"),p=Object.create(null);function u(f){d&&(d.hidden=!f,d.textContent=f||"")}function x(f){let v=p[f]||us(f),S=st(v);return S>=3&&S<=8?v:us(f)}function i(f){let v=a==null?void 0:a.querySelector("[data-probe-mode-hint]");if(!v)return;let S=f?"settings.returnTemp.modeOn":"settings.returnTemp.modeOff";v.setAttribute("data-i18n",S),v.textContent=c(S)}function b(f){cs(f),a==null||a.classList.toggle("is-collapsed",!f),i(f),n.hidden=!f,n.setAttribute("aria-hidden",f?"false":"true");for(let v of s)v.disabled=!f}async function y(){let f=M(l.manifoldFlowProbe)||"Probe 1",v=M(l.manifoldReturnProbe)||"Probe 2",S=lt(f,Qe,"Probe 1"),F=lt(v,Qe,"Probe 2");S===F&&(F=S==="Probe 1"?"Probe 2":"Probe 1"),S!==f&&await Ne("manifold_flow_probe",S),F!==v&&await Ne("manifold_return_probe",F)}function w(){let f=Gt({includeNone:!0,temps:rd()});for(let v of s){let S=v.value;v.innerHTML=f,[...v.options].some(F=>F.value===S)?v.value=S:dt(S)?v.value=x(Number(v.dataset.zone)):v.value="None"}}function L(){for(let f=1;f<=6;f++){let v=e.querySelector('[data-zone-label="'+f+'"]');v&&(v.innerHTML=ot(f))}}function T(){for(let f of s){let v=Number(f.dataset.zone),S=e.querySelector('[data-zone-live="'+v+'"]');if(!S)continue;let F=st(f.value),Y=F?ld(E(h.probeTemp(F))):"\u2014";S.textContent=Y,S.classList.toggle("is-empty",Y==="\u2014")}}function _(f){let v=sd();return delete v[f],Ja({flow:M(l.manifoldFlowProbe),return:M(l.manifoldReturnProbe),zoneProbes:v})}let g=Me(e,{immediate:!0}),m;for(let f of s){let v=Number(f.dataset.zone);g.select(f,{read:()=>{let S=M(h.probe(v));return dt(S)?(p[v]=S,S):x(v)},commit:async S=>{if(!(!m||!m.staged)){if(dt(S)&&ba(S,_(v),`Z${v}`)){u(c("settings.manifold.probeConflict")),g.refresh();return}u(""),p[v]=S;try{await nt(v,"zone_probe",S)}catch(F){u(c("settings.manifold.probeConflict")),g.refresh()}}}}),f.addEventListener("change",T)}m=g.toggle(r,{read:()=>id(),onChange:f=>{if(f)for(let v of s){let S=Number(v.dataset.zone);dt(v.value)||(v.value=x(S)),dt(v.value)&&(p[S]=v.value)}else for(let v of s){let S=Number(v.dataset.zone);dt(v.value)&&(p[S]=v.value)}b(f),T()},commit:async f=>{if(!f){await y();for(let v of s){let S=Number(v.dataset.zone);dt(v.value)&&(p[S]=v.value),await nt(S,"zone_probe","None")}return}for(let v of s){let S=Number(v.dataset.zone),F=dt(v.value)?v.value:x(S);p[S]=F,await nt(S,"zone_probe",F)}}});for(let f=1;f<=6;f++)C(h.probe(f),()=>{g.refresh(),T()}),C(h.name(f),L);for(let f=1;f<=8;f++)C(h.probeTemp(f),T);Ya(()=>{w(),T()}),R(e),L(),g.refresh(),T()}});var cd=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function pd(){if(String(M(l.bleClockSyncAdvertising)||"").toLowerCase()==="on")return c("common.clockSyncing");let t=String(M(l.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return c("settings.bleClock.waitingClock");if(t==="ble_busy")return c("settings.bleClock.busy");if(t)return t;let e=Number(E(l.bleClockSyncLastOkS)||0);if(!e)return c("settings.bleClock.never");let a=Math.max(0,Math.round(Date.now()/1e3)-e);if(a<60)return c("common.secondsAgo",{value:a});if(a<3600)return c("common.minutesAgo",{value:Math.round(a/60)});let o=Math.round(a/3600);return c("settings.bleClock.hoursAgo",{value:o})}var ud=()=>xe({className:"settings-ble-clock-card",titleHtml:`<span data-i18n="settings.bleClock.title">Room clocks</span>${Le("settings.bleClock.help")}`,bodyHtml:`
    ${Pe({on:!1,label:"Enable room clock sync",className:"sbc-enabled",attrs:'data-i18n-label="settings.bleClock.title"'})}
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
  `}),eg=q({tag:"settings-ble-clock-card",render:ud,onMount(t,e){let a=e.closest('[data-collapse-block="ble-clock"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="ble-clock"]'),r=e.querySelector(".sbc-enabled");o&&r&&o.appendChild(r);let n=e.querySelector(".sbc-body"),s=e.querySelector(".sbc-interval"),d=e.querySelector(".sbc-status"),p=e.querySelector(".sbc-now"),u=Me(e,{immediate:!0}),x=()=>{let y=s.value;s.innerHTML=cd.map(w=>`<option value="${w.value}">${c(w.labelKey)}</option>`).join(""),y&&(s.value=y)},i=()=>{d.textContent=pd()},b=y=>{a==null||a.classList.toggle("is-collapsed",!y),n&&(n.hidden=!y,n.setAttribute("aria-hidden",y?"false":"true")),s.disabled=!y,p.disabled=!y};x(),u.toggle(r,{read:()=>be(l.bleClockSyncEnabled),onChange:b,commit:y=>{let w=y?"on":"off";k(l.bleClockSyncEnabled,{state:w}),Ne("ble_clock_sync_enabled",w).catch(()=>k(l.bleClockSyncEnabled,{state:y?"off":"on"}))}}),u.select(s,{read:()=>String(Math.round(Number(E(l.bleClockSyncIntervalMin))||60)),commit:y=>{let w=Number(y);k(l.bleClockSyncIntervalMin,{value:w}),Re("ble_clock_sync_interval_min",w)}}),p.addEventListener("click",()=>{k(l.bleClockSyncAdvertising,{state:"on"}),i(),Oe("ble_clock_sync_now")}),C(l.bleClockSyncEnabled,u.refresh),C(l.bleClockSyncIntervalMin,u.refresh),C(l.bleClockSyncLastOkS,i),C(l.bleClockSyncLastError,i),C(l.bleClockSyncAdvertising,i),R(e),u.refresh(),i()}});var md=`
.settings-action-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-action-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-action-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-action-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-action-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;D("settings-control-card",md);var gd=()=>xe({className:"settings-action-card",titleHtml:"Recovery actions",bodyHtml:`
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  `}),ig=q({tag:"settings-control-card",render:gd,onMount(t,e){R(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&Oe("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{Oe("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&Oe("restart")})}});var bd=`
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
`;D("settings-motor-calibration-card",bd);var Qa=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:l.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:l.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:l.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:l.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:l.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:l.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:l.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:l.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:l.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:l.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:l.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:l.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],fd=()=>{let t="";for(let e=0;e<Qa.length;e++){let a=Qa[e];if(a.key==="generic_runtime_limit_seconds")continue;let o=hd(a.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+a.labelKey+'">'+c(a.labelKey)+"</span> ("+a.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+a.cls+'" value="0" step="'+o+'"></span></div>'}return xe({className:"settings-motor-cal-card",titleHtml:`<span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${Le("settings.motor.help")}`,bodyHtml:`
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field">${Pe({on:!1,label:"Toggle motor drivers",className:"mc-drivers-toggle",attrs:'data-i18n-label="settings.motor.toggleDrivers"'})}</span>
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
    `})};function hd(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var fg=q({tag:"settings-motor-calibration-card",render:fd,onMount(t,e){let a=e.querySelector(".smc-profile"),o=e.querySelector(".smc-safe-runtime"),r=e.querySelector(".mc-drivers-toggle"),n=Me(e);function s(p){if(p==="HmIP VdMot"&&Re("hmip_runtime_limit_seconds",34),p==="Generic"){let u=Number(E(l.genericRuntimeLimitSeconds));(!Number.isFinite(u)||u<=0)&&Re("generic_runtime_limit_seconds",45)}}n.toggle(r,{read:()=>be(l.drivers),commit:p=>$t(p)}),n.select(a,{read:()=>M(l.motorProfileDefault)||"HmIP VdMot",commit:p=>{Ne("motor_profile_default",p),s(p)}});function d(){let p=M(l.motorProfileDefault)||"HmIP VdMot";o.disabled=p==="HmIP VdMot"}n.num(o,{read:()=>(M(l.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?E(l.hmipRuntimeLimitSeconds):E(l.genericRuntimeLimitSeconds),commit:p=>{a.value==="Generic"&&Re("generic_runtime_limit_seconds",p)}});for(let p=0;p<Qa.length;p++){let u=Qa[p];if(u.key==="generic_runtime_limit_seconds")continue;let x=e.querySelector(".smc-"+u.cls);x&&(n.num(x,{read:()=>E(u.id),commit:i=>Re(u.key,i)}),C(u.id,n.refresh))}C(l.drivers,n.refresh),C(l.motorProfileDefault,()=>{n.refresh(),d()}),C(l.genericRuntimeLimitSeconds,n.refresh),C(l.hmipRuntimeLimitSeconds,n.refresh),R(e),s(M(l.motorProfileDefault)||"HmIP VdMot"),n.refresh(),d()}});var vd=600*1e3,ms=600,xd=`
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
`;D("settings-firmware-card",xd);var yd=()=>xe({className:"settings-firmware-card",titleHtml:`<span data-i18n="settings.firmware.title">Firmware</span>${Le("settings.firmware.help")}`,bodyHtml:`
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
  `});function gs(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function fa(t,e){let a=gs(t);if(!a)return!1;let o=gs(e);if(!o)return!0;for(let r=0;r<3;r++)if(a[r]!==o[r])return a[r]>o[r];return!1}function bs(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function wd(t){let e=String(t||"").trim();return e.length<=ms?e:e.slice(0,ms).replace(/\s+\S*$/,"")+"\u2026"}function kd(){let t=document.querySelector(".settings-backup-card");if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});let e=t.querySelector(".sbk-save");e&&e.focus({preventScroll:!0})}var zg=q({tag:"settings-firmware-card",render:yd,onMount(t,e){let a=e.querySelector(".sfw-version"),o=e.querySelector(".sfw-status"),r=e.querySelector(".sfw-check"),n=e.querySelector(".sfw-banner"),s=e.querySelector(".sfw-hop"),d=e.querySelector(".sfw-notes"),p=e.querySelector(".sfw-install"),u=e.querySelector(".sfw-asset"),x=e.querySelector(".sfw-jump"),i=e.querySelector(".sfw-file"),b=e.querySelector(".sfw-choose"),y=e.querySelector(".sfw-upload"),w=e.querySelector(".sfw-filename"),L=e.querySelector(".sfw-progress"),T=L.querySelector("i"),_=e.querySelector(".sfw-upload-status"),g=null,m=!1,f=0,v=!1,S=()=>M(l.firmware)||P("firmwareVersion")||"",F=(W,Z)=>{o.textContent=W||"",o.className="ui-sublabel sfw-status"+(Z?" "+Z:"")},Y=()=>{let W=Pt.firmware_update;if(!W||W.available!==!0)return null;let Z=String(W.latest||"").trim();return Z?{tag:Z,notes:c("settings.firmware.deviceReported"),asset:_o(Z)}:null},H=()=>{let W=Y();return g?W&&fa(W.tag,g.tag)?W:g:W},te=()=>{a.textContent=S()||c("settings.firmware.unknownVersion")},ne=()=>{let W=H(),Z=!!W&&fa(W.tag,S());if(n.hidden=!Z,!Z){Be("firmwareUpdateAvailable",null);return}s.innerHTML=bs(S()||c("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+bs(W.tag),d.textContent=wd(W.notes)||c("common.noData"),u.href=W.asset.url,u.setAttribute("download",W.asset.name),u.title=W.asset.name,Be("firmwareUpdateAvailable",{current:S(),latest:W.tag,url:W.asset.url})},le=W=>{m||!W&&f&&Date.now()-f<vd||(m=!0,f=Date.now(),r.disabled=!0,F(c("settings.firmware.checking")),Promise.resolve(Wn()).catch(()=>{}),Xn().then(Z=>{g=Z,ne();let pe=fa(Z.tag,S());F(pe?c("settings.firmware.availableStatus",{version:Z.tag}):c("settings.firmware.upToDate"),pe?null:"ok")}).catch(Z=>{g=null,ne();let pe=Y();if(pe){F(fa(pe.tag,S())?c("settings.firmware.availableStatus",{version:pe.tag}):c("settings.firmware.upToDate"),fa(pe.tag,S())?null:"ok");return}if((Z instanceof gt?Z.code:"network")==="no_releases"){F(c("settings.firmware.noReleases"),"ok");return}F(c("settings.firmware.checkFailed"),"err")}).finally(()=>{m=!1,r.disabled=!1}))};r.addEventListener("click",()=>le(!0)),x.addEventListener("click",kd),p.addEventListener("click",()=>{let W=H();W&&window.confirm(c("settings.firmware.confirmInstall",{version:W.tag}))&&(p.disabled=!0,p.textContent=c("settings.firmware.installing"),Promise.resolve(Kn()).then(()=>F(c("settings.firmware.installStarted"))).catch(()=>{F(c("settings.firmware.installFailed"),"err"),p.disabled=!1,p.textContent=c("settings.firmware.install")}))}),b.addEventListener("click",()=>i.click()),i.addEventListener("change",()=>{let W=i.files&&i.files[0];w.textContent=W?W.name:c("settings.firmware.noFile"),y.disabled=!W||v,_.textContent="",_.className="ui-note sfw-upload-status"}),y.addEventListener("click",()=>{let W=i.files&&i.files[0];!W||v||window.confirm(c("settings.firmware.confirmUpload",{file:W.name}))&&(v=!0,y.disabled=!0,b.disabled=!0,L.hidden=!1,T.style.width="0%",_.className="ui-note sfw-upload-status",_.textContent=c("settings.firmware.uploading",{value:0}),Promise.resolve(Gn()).catch(Z=>console.warn("[Firmware] prepare rejected, continuing with upload:",Z)).then(()=>Yn(W,Z=>{T.style.width=Z+"%",_.textContent=c("settings.firmware.uploading",{value:Z})})).then(()=>{T.style.width="100%",_.className="ui-note sfw-upload-status",_.textContent=c("settings.firmware.uploadDone")}).catch(Z=>{console.error("[Firmware] upload failed:",Z),L.hidden=!0,_.textContent=c("settings.firmware.uploadFailed")}).finally(()=>{v=!1,b.disabled=!1,y.disabled=!1}))}),U("section",()=>{P("section")==="settings"&&le(!1)}),C(l.firmware,()=>{te(),ne()}),C("firmware_update",ne),R(e),te(),P("section")==="settings"&&le(!1)}});var _d=`
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
`;D("settings-backup-card",_d);var Sd=()=>xe({className:"settings-backup-card",titleHtml:`<span data-i18n="settings.backup.title">Backup and restore</span>${Le("settings.backup.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field">${Pe({on:!0,label:"Restore learned motor values",className:"sbk-learned",attrs:'data-i18n-label="settings.backup.restoreLearned"'})}</span>
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
  `}),Ng=q({tag:"settings-backup-card",render:Sd,onMount(t,e){let a=e.querySelector(".sbk-save"),o=e.querySelector(".sbk-learned"),r=e.querySelector(".sbk-file"),n=e.querySelector(".sbk-choose"),s=e.querySelector(".sbk-restore"),d=e.querySelector(".sbk-filename"),p=e.querySelector(".sbk-status"),u=e.querySelector(".sbk-result"),x=!0,i=!1,b=(y,w)=>{p.textContent=y||"",p.className="sbk-status"+(w?" "+w:"")};o.addEventListener("click",()=>{x=!x,Pa(o,{on:x})}),a.addEventListener("click",()=>{i||(i=!0,a.disabled=!0,u.textContent="",b(c("settings.backup.saving")),Jn(!0).then(y=>{if(!Ta(y))throw new Error("unexpected_export_payload");b(c("settings.backup.saved",{file:er(y)}),"ok")}).catch(y=>{console.error("[Backup] export failed:",y),b(c("settings.backup.saveFailed"),"err")}).finally(()=>{i=!1,a.disabled=!1}))}),n.addEventListener("click",()=>r.click()),r.addEventListener("change",()=>{let y=r.files&&r.files[0];d.textContent=y?y.name:c("settings.backup.noFile"),s.disabled=!y||i,u.textContent="",b("")}),s.addEventListener("click",async()=>{let y=r.files&&r.files[0];if(!y||i)return;let w="";try{w=await y.text()}catch(T){b(c("settings.backup.readFailed"),"err");return}let L=null;try{L=JSON.parse(w)}catch(T){b(c("settings.backup.invalidFile"),"err");return}if(!Ta(L)){b(c("settings.backup.invalidFile"),"err");return}window.confirm(c("settings.backup.confirmRestore",{file:y.name}))&&(i=!0,s.disabled=!0,u.textContent="",b(c("settings.backup.restoring")),Qn(L,x).then(T=>{b(c("settings.backup.restored"),"ok"),u.textContent=c("settings.backup.result",{applied:T.applied,skipped:T.skipped,ignored:T.ignored})}).catch(T=>{console.error("[Backup] restore failed:",T),b(c("settings.backup.restoreFailed"),"err")}).finally(()=>{i=!1,s.disabled=!1}))}),R(e)}});var zd=()=>xe({className:"settings-appearance-card",titleHtml:`<span data-i18n="settings.appearance.title">Appearance</span>${Le("settings.appearance.help")}`,bodyHtml:'<p class="ui-copy" data-i18n="settings.appearance.product">Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.</p>'}),$g=q({tag:"settings-appearance-card",render:zd,onMount(t,e){R(e)}});var Cd=`
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
`;D("smart-preheat-card",Cd);var Ld=()=>xe({className:"smart-preheat-card",titleHtml:`<span data-i18n="settings.preheat.title">Preheat</span>${Le("settings.preheat.help")}`,bodyHtml:`
    ${Pe({on:!1,label:"Toggle preheat absorption",className:"absorb-toggle",attrs:'data-i18n-label="settings.preheat.toggle"'})}
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
  `}),Zg=q({tag:"smart-preheat-card",render:Ld,onMount(t,e){let a=e.closest('[data-collapse-block="preheat"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="preheat"]'),r=e.querySelector(".absorb-toggle");o&&r&&o.appendChild(r);let n=e.querySelector(".absorb-badge"),s=e.querySelector(".absorb-band"),d=e.querySelector(".absorb-delta"),p=e.querySelector(".absorb-body"),u=Me(e,{immediate:!0}),x=b=>{a==null||a.classList.toggle("is-collapsed",!b),p&&(p.hidden=!b,p.setAttribute("aria-hidden",b?"false":"true")),s.disabled=!b,d.disabled=!b};u.toggle(r,{read:()=>be(l.preheatAbsorbEnabled),onChange:x,commit:b=>{let y=b?"on":"off";k(l.preheatAbsorbEnabled,{state:y}),Ne("preheat_absorb_enabled",y)}}),u.num(s,{read:()=>E(l.preheatAbsorbBandC),commit:b=>{k(l.preheatAbsorbBandC,{value:b}),Re("preheat_absorb_band_c",b)}}),u.num(d,{read:()=>E(l.preheatDetectDeltaC),commit:b=>{k(l.preheatDetectDeltaC,{value:b}),Re("preheat_detect_delta_c",b)}});function i(){let b=String(M(l.preheatAbsorbing)||"idle").toLowerCase(),y=b==="armed"||b==="reactive"||b==="active"?b==="active"?"reactive":b:"idle",w=y==="armed"?"settings.preheat.armed":y==="reactive"?"settings.preheat.reactive":"common.idle";n.textContent=c(w),n.classList.toggle("active",y!=="idle"),n.dataset.mode=y}C(l.preheatAbsorbEnabled,u.refresh),C(l.preheatAbsorbing,i),C(l.preheatAbsorbBandC,u.refresh),C(l.preheatDetectDeltaC,u.refresh),R(e),u.refresh(),i()}});var Md=`
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
`;D("help-external-ingest",Md);function un(){return window.location.origin||"http://lune-v6.local"}function Ad(){return`// Shelly script \u2014 POST BTHome temps to Lune V6 (no zone number).
// 1) On V6: zone \u2192 External, set sensor_id to the BLU MAC.
// 2) Paste this on Mini PM / BLU Gateway (Gen3+). Adjust SENSOR_ID if needed.
// X-Lune-CSRF is required (any value); it is not a secret \u2014 LAN trust model.

let CONFIG = {
  v6_url: "${un()}/api/v1/room-temperatures",
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
`}function Ed(){return`# Home Assistant \u2014 rest_command + automation (no zone in payload).
# On V6: External source + sensor_id matching the entity you map below.
# X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

rest_command:
  lune_v6_room_temp:
    url: "${un()}/api/v1/room-temperatures"
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
`}function Td(){return`// HomeyScript \u2014 forward a Homey temperature capability to Lune V6.
// On V6: External + sensor_id (use Homey device id or a stable string you choose).
// X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

const V6_URL = "${un()}/api/v1/room-temperatures";
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
`}var Nd={shelly:Ad,ha:Ed,homey:Td},Qg=q({tag:"help-external-ingest",render:()=>`
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
  `,onMount(t,e){let a="shelly",o=e.querySelector(".hei-code"),r=e.querySelectorAll(".hei-tab");function n(){r.forEach(s=>s.setAttribute("aria-selected",s.dataset.tab===a?"true":"false")),o.textContent=Nd[a]()}return r.forEach(s=>s.addEventListener("click",()=>{a=s.dataset.tab,n()})),e.querySelector(".hei-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.textContent||"")}catch(s){}}),n(),R(e),void 0}});var hs="(prefers-color-scheme: dark)",Xt=null,fs=!1;function Fd(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(hs).matches?"dark":"light"}function Rd(){let t=Fd();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,e.classList.remove("theme-refined-ember","theme-deep-forest"),delete e.dataset.theme,!fs&&typeof window!="undefined"&&typeof window.matchMedia=="function"){Xt=window.matchMedia(hs);let a=()=>{let o=Xt.matches?"dark":"light";e.dataset.colorScheme=o,e.style.colorScheme=o,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:o}))};typeof Xt.addEventListener=="function"?Xt.addEventListener("change",a):typeof Xt.addListener=="function"&&Xt.addListener(a),fs=!0}return t}function vs(){return Rd()}function xs(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}var ys=`
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
`;function mn(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ws({title:t="",stack:e="",kicker:a="Hardware provisioning",save:o="",saveLabel:r="Save configuration",extra:n="",remove:s="",removeLabel:d="Remove"}={}){let p=o?`<button type="button" class="lds-btn-save btn-save" ${o}>${mn(r)}</button>`:"",u=s?`<button type="button" class="lds-btn-danger btn-danger" ${s}>${mn(d)}</button>`:"",x=n||u?`<div class="lds-form-extra form-extra">${n}${u}</div>`:"";return`<aside class="lds-provision provision" data-lds-provision>
  <div class="lds-form form" data-lds-form>
    <div class="lds-form-head form-head">
      <h3>${mn(a)}</h3>
      <h2>${t}</h2>
    </div>
    <div class="lds-form-stack form-stack">${e}</div>
    <div class="lds-form-actions form-actions">
      ${p}
      ${x}
    </div>
  </div>
</aside>`}vs();var Pd=`
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
`;D("hv6-app-root",Pd);D("lds-manifold-row",Pr);D("lds-form",ys);D("lds-int-split",ds);var Dd=Xa({liveHtml:'<div class="zone-live"><p class="zone-kicker">Comfort control</p><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-slot"></div></div>',provisionHtml:ws({title:'<span class="provision-zone-title">Zone</span>',stack:'<section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section><div class="zone-actuator-slot"></div>'})}),$d=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand lune-lockup" aria-label="Lune V6"><span data-live-mark="sidebar"></span><span class="product">V6</span></div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><article class="manifold" data-overview-manifold><div class="manifold-mark" data-live-mark="overview"></div><div class="loops" data-overview-loops></div><div class="manifold-meta" data-overview-meta></div></article><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Flow history</h3><p>24-hour flow, return and demand.</p></div></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><article class="manifold zone-overview"><div class="manifold-mark" data-live-mark="zones"></div><div class="zone-overview-strip loops" role="group" aria-label="Select zone"></div><div class="manifold-meta" data-zone-meta></div></article>${Dd}</section></section>
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
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;q({tag:"app-root",render:$d,onMount(t,e){e.querySelector(".hdr").appendChild(ce("hv6-header")),e.querySelector(".side-nav-slot").appendChild(ce("hv6-sidebar")),e.querySelector(".hydraulic-history-slot").appendChild(ce("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(ce("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(ce("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(ce("zone-detail",{zone:P("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(ce("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(ce("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(ce("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(ce("zone-room-card")),e.querySelector(".touch-slot").appendChild(ce("settings-touch-card"));let a=ce("settings-manifold-card");e.querySelector(".manifold-slot").appendChild(a),a.querySelector(".return-temp-slot").appendChild(ce("settings-return-temp-card")),e.querySelector(".minimum-flow-slot").appendChild(ce("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(ce("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(ce("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(ce("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(ce("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(ce("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(ce("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(ce("settings-control-card")),e.querySelector(".manual-control-col").appendChild(ce("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(ce("diag-zone-motor-card",{zone:P("selectedZone")||1}));let o=e.querySelector(".motor-lab-slot"),r=e.querySelector('.sec[data-section="motorlab"]');function n(){let A=xs(M(l.firmware)||P("firmwareVersion")),I=e.querySelector('.v6-side-link[data-section="motorlab"]');I&&(I.hidden=!A),r&&(r.hidden=!A),A&&o&&!o.firstChild&&o.appendChild(ce("diag-motor-lab")),!A&&P("section")==="motorlab"&&je("diagnostics")}C(l.firmware,n),U("firmwareVersion",n),U("section",n),n(),e.querySelector(".logs-main-col").appendChild(ce("logs-view")),e.querySelector(".system-health-slot").appendChild(ce("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(ce("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(ce("diag-i2c"));let s=e.querySelector(".help-external-slot");s&&s.appendChild(ce("help-external-ingest"));let d=e.querySelectorAll(".sec"),p=e.querySelector(".shell"),u=e.querySelector(".zone-detail-view"),x=e.querySelector(".selected-zone-title"),i=e.querySelector(".provision-zone-title"),b=e.querySelector(".zone-overview-strip"),y=e.querySelector("[data-overview-loops]"),w=e.querySelector("[data-overview-meta]"),L=e.querySelector("[data-zone-meta]"),T=e.querySelector(".mobile-zone-dock"),_=e.querySelector(".mobile-zone-dock .zone-chipstrip");function g(){e.querySelectorAll("[data-live-mark]").forEach(I=>{let ae=I.getAttribute("data-live-mark");if(ae==="sidebar"){if(I.dataset.staticLockup==="1")return;I.innerHTML=Rr(),I.dataset.staticLockup="1";return}I.dataset.staticMark!=="1"&&(Or(I,{states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:ae,landscape:!0,sku:"V6"}),I.dataset.staticMark="1")});let A=qr();w&&(w.innerHTML=A),L&&(L.innerHTML=A)}function m(A){let I=be(h.enabled(A)),ae=String(M(h.state(A))||"").toUpperCase()||"OFF",ee=String(M(h.motorLastFault(A))||"").toUpperCase();return I?I&&(ae==="FAULT"||ee&&ee!=="NONE"&&ee!=="OK")?"FAULT":ae:"OFF"}function f(A){return A==="HEATING"?c("state.heating"):A==="IDLE"?c("state.idle"):A==="FAULT"?c("common.fault"):A==="MANUAL"?c("state.manual"):A==="OVERHEATED"?c("state.overheated"):A==="CALIBRATING"?c("state.calibrating"):c("state.off")}function v(A){return A==="HEATING"||A==="CALLING"?"zs-heating":A==="OVERHEATED"?"zs-overheated":A==="FAULT"?"zs-fault":A==="IDLE"?"zs-idle":"zs-off"}function S(A){let I=String(A||"").trim();if(!I||/^none$/i.test(I)||I==="0"||I==="-1")return 0;let ae=I.match(/(\d+)/),ee=ae?Number(ae[1]):0;return ee>=1&&ee<=6?ee:0}function F(){var we;let A=[0,0,0,0,0,0,0];for(let O=1;O<=6;O++)A[O]=S(M(h.syncTo(O)));let I=[0,0,0,0,0,0,0];for(let O=1;O<=6;O++){let ve=O;for(let fe=0;fe<6;fe++){let de=A[ve];if(!de||de<1||de>6)break;if(de===O){ve=O;break}ve=de}I[O]=ve}let ae={};for(let O=1;O<=6;O++)(ae[we=I[O]]||(ae[we]=[])).push(O);let ee=[[],[],[],[],[],[],[]];for(let O=1;O<=6;O++){let ve=ae[I[O]]||[O],fe=ve.length>1&&ve.some(de=>A[de]>0);ee[O]=fe?ve.filter(de=>de!==O):[]}return{roots:I,partners:ee}}function Y(){return window.matchMedia("(min-width: 901px)").matches}function H(){let A=F(),I=P("selectedZone")||1,ae=Y();b.setAttribute("role",ae?"group":"list"),b.setAttribute("aria-label",ae?"Select zone":"Zone status overview"),b.innerHTML=Array.from({length:6},(ee,we)=>{var V;let O=we+1,ve=O===I,fe=Ce(O),de=ot(O),ke=vt(O),We=Ze(O),$e=ke==="unused"?"\u2014":Zt(E(h.temp(O))),at=ke==="unused"?"\u2014":Zt((V=E(h.effectiveSetpoint(O)))!=null?V:E(h.setpoint(O))),ct=ke==="unused"?"\u2014":Ie(O)||"\u2014",_e=m(O),pt=f(_e),kt=v(_e),Ue=A.partners[O],ut=Ue.length>0,Rt=ut?c("overview.zone.mergedWith",{zones:Ue.map(Ze).join(", ")}):"",ao=ut&&Ue.includes(O+1)&&A.roots[O]===A.roots[O+1],z=ut&&Ue.includes(O-1)&&A.roots[O]===A.roots[O-1],N=[ut?"is-merged":"",ao?"zo-pair-start":"",z?"zo-pair-cont":"",ke==="calling"?"is-calling":"",ke==="unused"?"is-unused":""].filter(Boolean).join(" "),B=`${fe}, ${$e} / ${at}, ${pt}${Rt?", "+Rt:""}`.replace(/"/g,"&quot;"),G=ut?`<span class="zo-merge">${Rt}</span>`:"",$=`<span class="zo-status" aria-hidden="true"></span><span class="loop-id">${We}</span><span class="loop-name">${ct.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span><span class="zo-title zone-label-compact">${de}</span><span class="zo-temps loop-temp">${$e}</span>${G}`;return ae?`<button type="button" class="zone-overview-card ${kt}${N?" "+N:""}" data-zone-select="${O}" aria-current="${ve?"true":"false"}" aria-label="${B}" title="${B}" tabindex="${ve?"0":"-1"}">${$}</button>`:`<div class="zone-overview-card ${kt}${N?" "+N:""}" role="listitem" aria-label="${B}" title="${B}">${$}</div>`}).join("")}function te(){let A=P("selectedZone")||1;_.innerHTML=Array.from({length:6},(I,ae)=>{let ee=ae+1,we=ee===A,O=Ce(ee),ve=ot(ee),fe=O.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${we}" aria-label="${fe}" title="${fe}" tabindex="${we?"0":"-1"}" data-zone-select="${ee}">${ve}</button>`}).join("")}function ne(){y&&(y.innerHTML=Array.from({length:6},(A,I)=>{let ae=I+1,ee=Ce(ae),we=vt(ae),O=Ze(ae),ve=E(h.valve(ae)),fe=we==="unused"?"\u2014":Zt(E(h.temp(ae))),de=we==="unused"?"\u2014":Da(ve),ke=Dr(ve,we),We=we==="unused"?"\u2014":Ie(ae)||"\u2014",$e=m(ae),at=f($e),ct=`${ee}, ${fe}, valve ${de}, ${at}`.replace(/"/g,"&quot;");return $r({id:O,name:We,temp:fe,level:ke,kind:we,attrs:`data-open-zone="${ae}" aria-label="${ct}" title="${ct}"`})}).join(""))}function le(){H(),te(),ne(),g()}function W(){let A=P("section")==="zones";T.hidden=!A,T.setAttribute("aria-hidden",A?"false":"true"),p.classList.toggle("has-zone-dock",A)}function Z(A){St(A)}function pe(){let A=P("section")||"overview";d.forEach(I=>I.classList.toggle("active",I.dataset.section===A)),re(),X()}function X(){let A=P("settingsPanel")||"touch";e.querySelectorAll(".settings-panel[data-panel]").forEach(I=>{I.classList.toggle("is-active",I.dataset.panel===A)})}function qe(){let A=[],I=0,ae=[];for(let _e=1;_e<=6;_e++){let pt=String(M(h.enabled(_e))).toLowerCase()==="on",kt=String(M(h.state(_e))).toLowerCase(),Ue=String(M(h.motorLastFault(_e))||"").toUpperCase();pt&&A.push(_e),pt&&["heating","calling"].includes(kt)&&I++,(kt==="fault"||Ue!==""&&Ue!=="NONE"&&Ue!=="OK")&&ae.push({zone:_e,fault:Ue||"FAULT"})}let ee=ae.length,we=E(l.flow),O=E(l.ret),ve=String(M(l.authorityState)||"").replace(/_/g," "),fe=ee===0&&P("live"),de=we!=null&&O!=null?Number(we)-Number(O):null,ke=de==null?"\u2014":`${de.toFixed(1)}\xB0C`,We=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${fe?"status-ok":P("live")?"status-warn":"status-danger"}">${fe?"Operating normally":P("live")?"Needs attention":"Device offline"}</h2><p>${ee?ee+" zone fault"+(ee===1?"":"s")+" require attention.":P("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${I} zones</strong><small>${A.length} enabled \xB7 ${I}/${A.length||0} calling</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${Ot(we)}</strong><small>Return ${Ot(O)}</small></div><div class="status-fact"><span class="eyebrow">\u0394T</span><strong>${ke}</strong><small>Flow \u2212 return</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ve||"not connected"}</strong><small>${E(l.authorityLeaseRemainingS)?Math.round(E(l.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,$e=be(l.authorityConfigured),at=String(M(l.drivers)||"off");e.querySelector(".overview-status").innerHTML=We,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${P("live")?"status-ok":"status-danger"}">${P("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${P("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${$e?"Approved":"Not approved"}</strong><small>${$e?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${at}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${ee?"status-danger":fe?"status-ok":"status-warn"}">${ee?ee+" issue"+(ee===1?"":"s"):fe?"Healthy":"Awaiting data"}</h2><p>${ee?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${ee}</strong><small>${ee?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${at}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ve||"not connected"}</strong><small>${$e?"approved":"local control"}</small></div>`;let ct=ae.map(_e=>c("overview.attention.faultDetail",{zone:_e.zone,fault:_e.fault})).join(" ");[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(_e=>{_e.hidden=!ee,_e.innerHTML=ee?`<strong>${ee===1?c("status.attention.zoneFaultOne"):c("status.attention.zoneFaultMany",{count:ee})}</strong><span>${ct}</span>`:""})}function re(){let A=P("selectedZone")||1,I=P("section")==="zones",ae=Ie(A),ee=ae?`${Ze(A)} \xB7 ${ae}`:Ze(A);x.textContent=ee,i&&(i.textContent=ee),le(),W(),u.hidden=!I}function wt(A){let I=A.target.closest("[data-zone-select]");I&&Z(Number(I.dataset.zoneSelect))}function eo(A){Y()&&wt(A)}function to(A){if(!Y()||!["ArrowLeft","ArrowRight","Home","End"].includes(A.key))return;A.preventDefault();let I=P("selectedZone")||1,ae=A.key==="Home"?1:A.key==="End"?6:A.key==="ArrowLeft"?I===1?6:I-1:I===6?1:I+1;Z(ae),requestAnimationFrame(()=>{var ee;return(ee=b.querySelector(`[data-zone-select="${ae}"]`))==null?void 0:ee.focus()})}function ha(A){if(!["ArrowLeft","ArrowRight","Home","End"].includes(A.key))return;A.preventDefault();let I=P("selectedZone")||1,ae=A.key==="Home"?1:A.key==="End"?6:A.key==="ArrowLeft"?I===1?6:I-1:I===6?1:I+1;Z(ae),requestAnimationFrame(()=>{var ee;return(ee=_.querySelector(`[data-zone-select="${ae}"]`))==null?void 0:ee.focus()})}function Yt(A){let I=A.target.closest("[data-open-zone]");I&&(Z(Number(I.dataset.openZone)),je("zones"))}b.addEventListener("click",eo),b.addEventListener("keydown",to),y&&y.addEventListener("click",Yt),window.matchMedia("(min-width: 901px)").addEventListener("change",H),_.addEventListener("click",wt),_.addEventListener("keydown",ha),e.querySelectorAll("[data-open-zones]").forEach(A=>A.addEventListener("click",()=>je("zones"))),e.querySelectorAll("[data-help-section]").forEach(A=>A.addEventListener("click",I=>{I.preventDefault(),je(A.dataset.helpSection)})),U("section",pe),U("settingsPanel",X),U("selectedZone",re),U("live",qe),U("zoneNames",()=>{re(),qe()});for(let A=1;A<=6;A++)[h.temp(A),h.setpoint(A),h.effectiveSetpoint(A),h.valve(A),h.state(A),h.enabled(A),h.motorLastFault(A),h.syncTo(A)].forEach(I=>C(I,()=>{qe(),le()}));[l.flow,l.ret,l.authorityConfigured,l.authorityState,l.authorityLeaseRemainingS,l.drivers].forEach(A=>C(A,qe)),R(e),pe(),re(),qe();let Jt=new URLSearchParams(location.search),Q=Jt.get("section"),Ve=Number(Jt.get("zone"));Q&&je(Q),Ve>=1&&Ve<=6&&St(Ve)}});function Id(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(ce("app-root")),sr()}Id();})();
