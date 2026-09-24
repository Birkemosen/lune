(()=>{var Pn={},Ea={};function H(t){return Pn[t.tag]=t,t}function ce(t,e){let a=Pn[t];if(!a)throw new Error("Component not found: "+t);let o=e||{};if(a.state){let s=a.state(e||{});for(let c in s)o[c]=s[c]}if(a.methods)for(let s in a.methods)o[s]=a.methods[s];let r=document.createElement("div");r.innerHTML=a.render(o);let n=r.firstElementChild;return a.onMount&&queueMicrotask(()=>a.onMount(o,n)),n}function L(t,e){(Ea[t]||(Ea[t]=[])).push(e)}function Ee(t){let e=Ea[t];if(e)for(let a=0;a<e.length;a++)e[a](t)}var y={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",sensorId:t=>"text-zone_"+t+"_sensor_id",sensorName:t=>"text-zone_"+t+"_sensor_name",externalAge:t=>"sensor-zone_"+t+"_external_temp_age_ms",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",openEndstopCurrentFactor:"number-open_endstop_current_factor",openEndstopStallFraction:"number-open_endstop_stall_fraction",closeTrailingStepMa:"number-close_trailing_step_ma",closeTrailingSustainMs:"number-close_trailing_sustain_ms",closeTrailingRefMs:"number-close_trailing_ref_ms",capCloseSeatMa:"number-cap_close_seat_ma",capCloseSeatFrames:"number-cap_close_seat_frames",capClosePopoffMa:"number-cap_close_popoff_ma",capStallMa:"number-cap_stall_ma",capOpenStopMa:"number-cap_open_stop_ma",capCircuitFaultMa:"number-cap_circuit_fault_ma",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var Te=6,oi=28,$t=Object.create(null),ni=ii(),ie={section:"overview",settingsPanel:"touch",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:si(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:ni,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},ri=300;function si(){let t=Object.create(null);for(let e=1;e<=Te;e++)t[e]=[];return t}function ii(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<Te;)t.push("");return t.slice(0,Te)}function li(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(ie.zoneNames))}catch(t){}}function Re(t){return"$dashboard:"+t}function zt(t){return Math.max(1,Math.min(Te,Number(t)||1))}function Dn(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let a=t.match(/-?\d+(?:[\.,]\d+)?/);if(a){let o=Number(String(a[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function E(t){let e=$t[t];return e?e.v!=null?e.v:e.value!=null?e.value:Dn(e.s!=null?e.s:e.state):null}function A(t){let e=$t[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function ci(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function be(t){return ci(A(t))}function Ta(){return be(i.authorityProposalPending)}function wo(){let t=0;for(let e=1;e<=Te;e++){let a=String(A(y.state(e))||"").toLowerCase(),o=String(A(y.motorLastFault(e))||"").toLowerCase();(a==="fault"||o&&o!=="none"&&o!=="ok")&&(t+=1)}return t}function ko(){if(Ta())return{kind:"touch",section:"settings",focus:"touch"};let t=wo();return t>0?{kind:"faults",section:"zones",count:t}:null}function k(t,e){let a=$t[t];a||(a=$t[t]={v:null,s:null}),"v"in e&&(a.v=e.v,a.value=e.v),"value"in e&&(a.v=e.value,a.value=e.value),"s"in e&&(a.s=e.s,a.state=e.s),"state"in e&&(a.s=e.state,a.state=e.state);for(let o in e)o==="v"||o==="value"||o==="s"||o==="state"||(a[o]=e[o]);if(Ee(t),t==="text_sensor-firmware_version"&&We("firmwareVersion",A(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let o=parseInt(t.slice(10,-5),10);if(o>=1&&o<=Te){let r=A(t)||"";ie.zoneNames[o-1]!==r&&(ie.zoneNames[o-1]=r,li(),Ee(Re("zoneNames")))}}}function W(t,e){L(Re(t),e)}function D(t){return ie[t]}function We(t,e){ie[t]=e,Ee(Re(t))}function Ve(t){let e=t==="logs"?"diagnostics":t;ie.section!==e&&(ie.section=e,Ee(Re("section")))}function Fa(t){let e=String(t||"touch");ie.settingsPanel!==e&&(ie.settingsPanel=e,Ee(Re("settingsPanel")))}function Ct(t){let e=zt(t);ie.selectedZone!==e&&(ie.selectedZone=e,Ee(Re("selectedZone")))}function ht(t){let e=!!t;ie.live!==e&&(ie.live=e,Ee(Re("live")))}function _o(){ie.pendingWrites+=1,Ee(Re("pendingWrites"))}function Na(){ie.pendingWrites=Math.max(0,ie.pendingWrites-1),ie.lastWriteAt=Date.now(),Ee(Re("pendingWrites"))}function $n(){return ie.pendingWrites>0?!0:Date.now()-ie.lastWriteAt<2e3}function So(t){return ie.zoneNames[zt(t)-1]||""}function He(t){return String(So(t)||"").trim()}function Ke(t){return"Z"+zt(t)}function yo(t){return"Zone "+zt(t)}function Me(t){let e=zt(t),a=He(e);return a?yo(e)+" - "+a:yo(e)}function di(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function pi(t){let e=zt(t);return'<span class="zone-id-short">'+Ke(e)+'</span><span class="zone-id-long">'+yo(e)+"</span>"}function it(t){let e=zt(t),a=He(e),o=pi(e);return a?'<span class="zone-title-id">'+o+'</span><span class="zone-title-name"> - '+di(a)+"</span>":'<span class="zone-title-id">'+o+"</span>"}function It(t){ie.i2cResult=t||"No scan has been run yet.",Ee(Re("i2cResult"))}function G(t,e){let a={time:ui(),msg:String(t||"")};for(ie.activityLog.push(a);ie.activityLog.length>60;)ie.activityLog.shift();if(e>=1&&e<=Te){let o=ie.zoneLog[e];for(o.push(a);o.length>8;)o.shift();Ee(Re("zoneLog:"+e))}Ee(Re("activityLog"))}function xo(t,e){let a=ie[t];if(!Array.isArray(a))return;let o=Dn(e);if(o!=null){for(a.push(o);a.length>oi;)a.shift();Ee(Re(t))}}function sa(t){let e=Date.now();if(!t&&e-ie.lastHistoryAt<3200)return;ie.lastHistoryAt=e;let a=0,o=0;for(let r=1;r<=Te;r++){let n=E("sensor-zone_"+r+"_valve_pct");n!=null&&(a+=n,o+=1)}xo("historyFlow",E("sensor-manifold_flow_temperature")),xo("historyReturn",E("sensor-manifold_return_temperature")),xo("historyDemand",o?a/o:0)}function ui(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function Ra(t){ie.zoneStateHistory=t||null,Ee(Re("zoneStateHistory"))}function In(){return ie.deviceLogSeq}function Pa(t,e){if(Array.isArray(t)&&t.length){for(let a of t)ie.deviceLog.push({seq:a[0],level:a[1],tag:a[2],msg:a[3]}),a[0]>ie.deviceLogSeq&&(ie.deviceLogSeq=a[0]);for(;ie.deviceLog.length>ri;)ie.deviceLog.shift();Ee(Re("deviceLog"))}typeof e=="number"&&e>ie.deviceLogSeq&&(ie.deviceLogSeq=e-1)}function Da(){return ie.deviceLog}function On(){ie.deviceLog=[],Ee(Re("deviceLog"))}var ke=6,mi=8,Hn=null,Mt=0,$a=1,qn=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],Vn=18*3600+720,Un=Date.now(),ia=4200,J={temp:new Float32Array(ke),setpoint:new Float32Array(ke),valve:new Float32Array(ke),enabled:new Uint8Array(ke),driversEnabled:1,fault:0,manualMode:0},qe={busy:!1,direction:"open",zone:1,startedAt:0};function gi(){J.manualMode=0,Un=Date.now(),We("manualMode",!1);for(let n=0;n<ke;n++){J.temp[n]=20.5+n*.4,J.setpoint[n]=21+n%3*.5,J.valve[n]=12+n*8,J.enabled[n]=n===4?0:1;let s=n+1;k(y.temp(s),{value:J.temp[n]}),k(y.setpoint(s),{value:J.setpoint[n]}),k(y.baseSetpoint(s),{value:J.setpoint[n]}),k(y.effectiveSetpoint(s),{value:J.setpoint[n]}),k(y.coordinatorOffset(s),{value:s===1?1.5:0}),k(y.coordinatorRemaining(s),{value:s===1?2400:0}),s===1&&k(y.effectiveSetpoint(1),{value:J.setpoint[0]+1.5}),k(y.valve(s),{value:J.valve[n]}),k(y.state(s),{state:J.valve[n]>5?"heating":"idle"}),k(y.enabled(s),{value:!!J.enabled[n],state:J.enabled[n]?"on":"off"}),k(y.probe(s),{state:"None"}),k(y.tempSource(s),{state:s%2?"Local Probe":"BLE"}),k(y.syncTo(s),{state:"None"}),k(y.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),k(y.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),k(y.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=mi;n++){let s=n<=ke?n:ke,c=J.temp[s-1]+(n>ke?1:.1*n);k(y.probeTemp(n),{value:c})}k(i.flow,{value:34.1}),k(i.ret,{value:30.4}),k(i.uptime,{value:Vn}),k(i.wifi,{value:-57}),k(i.drivers,{value:!0,state:"on"}),k(i.fault,{value:!1,state:"off"}),k(i.ip,{state:"192.168.1.86"}),k(i.ssid,{state:"MockLab"}),k(i.mac,{state:"D8:3B:DA:12:34:56"}),k(i.firmware,{state:"v1.0.0-1"}),k(i.resetReason,{state:"Software reset (esp_restart)"}),k(i.manifoldFlowProbe,{state:"Probe 1"}),k(i.manifoldReturnProbe,{state:"Probe 2"}),k(i.manifoldType,{state:"NC (Normally Closed)"}),k(i.motorProfileDefault,{state:"HmIP VdMot"}),k(i.closeThresholdMultiplier,{value:1.45}),k(i.closeSlopeThreshold,{value:1}),k(i.closeSlopeCurrentFactor,{value:1.4}),k(i.openThresholdMultiplier,{value:1.7}),k(i.openSlopeThreshold,{value:.8}),k(i.openSlopeCurrentFactor,{value:1.3}),k(i.openRippleLimitFactor,{value:1.1}),k(i.openEndstopCurrentFactor,{value:1.25}),k(i.openEndstopStallFraction,{value:.3}),k(i.closeTrailingStepMa,{value:2.5}),k(i.closeTrailingSustainMs,{value:1e3}),k(i.closeTrailingRefMs,{value:2e3}),k(i.capCloseSeatMa,{value:34}),k(i.capCloseSeatFrames,{value:4}),k(i.capClosePopoffMa,{value:36}),k(i.capStallMa,{value:65}),k(i.capOpenStopMa,{value:40}),k(i.capCircuitFaultMa,{value:85}),k(i.genericRuntimeLimitSeconds,{value:45}),k(i.hmipRuntimeLimitSeconds,{value:34}),k(i.relearnAfterMovements,{value:2e3}),k(i.relearnAfterHours,{value:168}),k(i.learnedFactorMinSamples,{value:3}),k(i.learnedFactorMaxDeviationPct,{value:12}),k(i.simplePreheatEnabled,{state:"on"}),k(i.minZoneFlowPct,{value:15}),k(i.minimumFlowAlways,{state:"off"}),k(i.bleClockSyncEnabled,{state:"on"}),k(i.bleClockSyncIntervalMin,{value:60}),k(i.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),k(i.bleClockSyncLastError,{state:""}),k(i.bleClockSyncAdvertising,{state:"off"}),k(i.authorityInstallationId,{state:"house-main"}),k(i.authorityCoordinatorId,{state:"lune-touch"}),k(i.authorityConfigured,{state:"on",value:!0}),k(i.authorityProposalPending,{state:"off",value:!1}),k(i.authorityState,{state:"touch_normal"}),k(i.authorityReason,{state:"lease_renewed"}),k(i.authorityLeaseRemainingS,{value:72}),k(i.cpuLoadCore0,{value:18.5}),k(i.cpuLoadCore1,{value:7.2}),k(i.freeInternalKb,{value:142}),k(i.freeDmaKb,{value:118}),k(i.largestInternalKb,{value:64}),k(i.minInternalKb,{value:96}),k(i.freePsramKb,{value:7800}),k(i.largestPsramKb,{value:4096}),k(i.bleHubEnabled,{state:"on"}),k(i.bleScanning,{state:"on"}),k(i.bleDemanded,{state:"on"}),k(i.bleAdsPerSec,{value:2.4}),k(i.bleLastAdvAgeMs,{value:850}),sa(!0);let t=300,e=Number(Date.now()/1e3)|0,a=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],r=[];for(let n=0;n<a;n++){let s=(a-1-n)*t,c=e-s,u=Math.floor(n/12)%24,m=o.map(z=>z[u%z.length]),x=s/3600,l=x>2.5&&x<3.5||x>8.5&&x<9.5?1:0,f=m.filter(z=>z===5).length,v=Math.round(Math.min(100,f*15+Math.abs(Math.sin(n/8))*6)),w=Number((30+f*1.4+Math.sin(n/11)*1.5).toFixed(1)),C=Number((w-(1.4+f*.35)).toFixed(1));r.push([c,...m,l,w,C,v])}Ra({interval_s:t,uptime_s:e,count:a,entries:r}),Wn(6)}function Wn(t){let e=[];for(let a=0;a<t;a++){let o=qn[$a%qn.length];e.push([$a,o[0],o[1],o[2]]),$a++}Pa(e,$a)}function bi(){Mt+=1,k(i.uptime,{value:Vn+Math.floor((Date.now()-Un)/1e3)}),k(i.wifi,{value:-55-Math.round((1+Math.sin(Mt/4))*6)});let t=0,e=0,a=0;for(let s=0;s<ke;s++){let c=s+1,u=!!J.enabled[s],m=J.temp[s],x=J.setpoint[s],l=u&&J.driversEnabled&&!J.manualMode&&m<x-.25;J.manualMode?J.valve[s]=Math.max(0,J.valve[s]):!u||!J.driversEnabled?J.valve[s]=Math.max(0,J.valve[s]-6):l?J.valve[s]=Math.min(100,J.valve[s]+7+c%3):J.valve[s]=Math.max(0,J.valve[s]-5);let f=l?.05+J.valve[s]/2200:-.03+J.valve[s]/3200;J.temp[s]=m+f+Math.sin((Mt+c)/5)*.04,u&&J.valve[s]>0&&(t+=J.valve[s],e+=1,a=Math.max(a,J.valve[s])),k(y.temp(c),{value:J.temp[s]}),k(y.valve(c),{value:Math.round(J.valve[s])});let v=Math.max(0,(J.setpoint[s]-J.temp[s]-.15)*.22);k(y.preheatAdvance(c),{value:Number(v.toFixed(2))}),k(y.state(c),{state:u?l?"heating":"idle":"off"}),k(y.enabled(c),{value:u,state:u?"on":"off"}),k(y.probeTemp(c),{value:J.temp[s]+Math.sin((Mt+c)/6)*.1})}let o=29.5+a*.075+e*.18+Math.sin(Mt/6)*.25,r=o-(e?2.1+t/Math.max(1,e*50):1.1);k(i.flow,{value:Number(o.toFixed(1))}),k(i.ret,{value:Number(r.toFixed(1))}),k(y.probeTemp(1),{value:Number((o+.2).toFixed(1))}),k(y.probeTemp(2),{value:Number((r-.4).toFixed(1))}),sa(!0);let n=D("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),Mt%3===0&&Wn(1)}function Bn(t,e){qe.busy=!0,qe.direction=e,qe.zone=t,qe.startedAt=Date.now()}function fi(){return qe.startedAt?Date.now()-qe.startedAt:0}function hi(t,e,a){if(!a)return .4;let o=e==="open";return t<180?o?22:28:t<500?o?15.2:19.4:t<2200?o?14.6:19.1:!o&&t<2800?24.2:!o&&t<3400?20.4:t<ia-300?o?18.5:26.8:o?25.4:41.2}function vi(t,e,a){return a?e==="open"?t>ia-300?3:0:t<2200?0:t<3e3?1:t<ia-300?2:3:0}function jn(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function Kn(){let t=fi(),e=qe.busy&&t<ia;qe.busy&&!e&&(qe.busy=!1);let a=hi(t,qe.direction,e||t<ia+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:E(i.freeInternalKb)||142,dma_kb:E(i.freeDmaKb)||118,largest_internal_kb:E(i.largestInternalKb)||64,min_internal_kb:E(i.minInternalKb)||96,psram_kb:E(i.freePsramKb)||7800,largest_psram_kb:E(i.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:A(i.bleHubEnabled)==="on",scanning:A(i.bleScanning)==="on",demanded:A(i.bleDemanded)==="on",ads_per_sec:E(i.bleAdsPerSec)||0,last_adv_age_ms:E(i.bleLastAdvAgeMs)||0},drivers_enabled:!!J.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(a.toFixed(1)),stroke_phase:vi(t,qe.direction,e),armed:!!J.driversEnabled,latch_arm_level:1,latch_state_level:0,motor_enable_level:0,tacho_period_us:jn(t,e),tacho_cadence_us:jn(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:Mt}}}}function xi(t,e){let a=e==="open";if(t<180)return a?22-t*.03:28-t*.04;if(t<650)return a?14.8:19.2;if(t<2200)return(a?14.5:19)+Math.sin(t/90)*.35;if(!a&&t<2600)return 19+(t-2200)*.012;if(!a&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return a?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let o=a?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(a?26.4:44.5,o)}function Zn(t){let e=t||qe.direction||"open",a=e==="open",o=a?3900:4200,r=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],n=0;for(let s=0;s<=o;s+=10){let c=xi(s,e);s>180&&s<o-80&&(n+=s%20===0?1:0);let u=0;a?u=s>o-400?3:0:s>=2200&&s<3e3?u=1:s>=3e3&&s<3600?u=2:s>=3600&&(u=3);let m=s<200?3200:s<o-400?1800+Math.round(Math.sin(s/140)*80):4200;r.push([s,n,c.toFixed(1),1200,1,a?1:0,1,u,m,40,0,0,0,0,0,1,0].join(","))}return r.join(`
`)+`
`}function Gn(){Hn||(gi(),ht(!0),Hn=setInterval(bi,1200))}function Ia(t){let e=t.key||"",a=t.value,o=t.zone||0;if(e==="zone_setpoint"&&o>=1&&o<=ke){let n=Number(a);Number.isNaN(n)||(J.setpoint[o-1]=n,k(y.setpoint(o),{value:n}),k(y.baseSetpoint(o),{value:n}),k(y.effectiveSetpoint(o),{value:n}),G("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(e==="zone_enabled"&&o>=1&&o<=ke){let n=a>.5;J.enabled[o-1]=n?1:0,k(y.enabled(o),{value:n,state:n?"on":"off"}),G("Zone "+o+(n?" enabled":" disabled"),o);return}if(e==="drivers_enabled"){let n=a>.5;J.driversEnabled=n?1:0,n||(qe.busy=!1),k(i.drivers,{value:n,state:n?"on":"off"}),G(n?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let n=a>.5;J.manualMode=n?1:0,We("manualMode",n);return}if(e==="motor_target"&&o>=1&&o<=ke){let n=Number(a||0);k(y.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),G("Motor "+o+" target set to "+n+"%",o);return}if(e==="command"){let n=String(a);if(n==="i2c_scan"){It(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),G("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){G("Command executed: "+n);return}if(n==="firmware_check"||n==="firmware_prepare"){G("Command executed: "+n);return}if(n==="firmware_install"){G("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(n==="open_motor_timed"&&o>=1&&o<=ke){Bn(o,"open"),G("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=ke){Bn(o,"close"),G("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=ke){qe.busy=!1,G("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=ke){G("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=ke){G("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=ke){G("Motor "+o+" reset and relearn started",o);return}if(n==="ble_clock_sync_now"){k(i.bleClockSyncAdvertising,{state:"on"}),k(i.bleClockSyncLastError,{state:""}),setTimeout(()=>{k(i.bleClockSyncAdvertising,{state:"off"}),k(i.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),G("Room clock broadcast started");return}if(n==="dump_task_stats"){G("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&o>=1){k(y.probe(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="zone_temp_source"&&o>=1){k(y.tempSource(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sync_to"&&o>=1){k(y.syncTo(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="manifold_type"){k(i.manifoldType,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="manifold_flow_probe"){k(i.manifoldFlowProbe,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="manifold_return_probe"){k(i.manifoldReturnProbe,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="motor_profile_default"){k(i.motorProfileDefault,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="simple_preheat_enabled"){k(i.simplePreheatEnabled,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="minimum_flow_always"){k(i.minimumFlowAlways,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="ble_clock_sync_enabled"){k(i.bleClockSyncEnabled,{state:String(a)}),G("Setting updated: "+e+" = "+a);return}if(e==="zone_name"&&o>=1){k(y.name(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="zone_ble_mac"&&o>=1){k(y.ble(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_id"&&o>=1){k(y.sensorId(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_name"&&o>=1){k(y.sensorName(o),{state:String(a)}),G("Setting updated: "+e+" = "+a,o);return}if(e==="authority_approve_proposal"){k(i.authorityInstallationId,{state:A(i.authorityProposalInstallationId)||"lune-mock"}),k(i.authorityCoordinatorId,{state:A(i.authorityProposalCoordinatorId)||"touch-mock"}),k(i.authorityConfigured,{state:"on",value:!0}),k(i.authorityProposalPending,{state:"off",value:!1}),G("Discovered Lune Touch approved");return}if(e==="authority_revoke"){k(i.authorityInstallationId,{state:""}),k(i.authorityCoordinatorId,{state:""}),k(i.authorityConfigured,{state:"off",value:!1}),k(i.authorityState,{state:"unconfigured"}),G("Lune Touch disconnected");return}let r={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,open_endstop_current_factor:i.openEndstopCurrentFactor,open_endstop_stall_fraction:i.openEndstopStallFraction,close_trailing_step_ma:i.closeTrailingStepMa,close_trailing_sustain_ms:i.closeTrailingSustainMs,close_trailing_ref_ms:i.closeTrailingRefMs,cap_close_seat_ma:i.capCloseSeatMa,cap_close_seat_frames:i.capCloseSeatFrames,cap_close_popoff_ma:i.capClosePopoffMa,cap_stall_ma:i.capStallMa,cap_open_stop_ma:i.capOpenStopMa,cap_circuit_fault_ma:i.capCircuitFaultMa,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};if(r[e]){let n=Number(a);Number.isNaN(n)||(k(r[e],{value:n}),G("Setting updated: "+e+" = "+a));return}}var zo="v1.1.0";function Xn(){return{tag_name:zo,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+zo+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+zo+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function Yn(t){let e=[];for(let a=1;a<=ke;a++)e.push({zone:a,name:A(y.name(a)),enabled:A(y.enabled(a))==="on",setpoint_c:E(y.setpoint(a)),probe:A(y.probe(a)),temp_source:A(y.tempSource(a)),ble_mac:A(y.ble(a)),sensor_id:A(y.sensorId(a)),sensor_name:A(y.sensorName(a)),sync_to:A(y.syncTo(a))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:A(i.firmware),device:{mac:A(i.mac)},settings:{manifold_type:A(i.manifoldType),manifold_flow_probe:A(i.manifoldFlowProbe),manifold_return_probe:A(i.manifoldReturnProbe),motor_profile_default:A(i.motorProfileDefault),min_zone_flow_pct:E(i.minZoneFlowPct),minimum_flow_always:A(i.minimumFlowAlways)==="on",simple_preheat_enabled:A(i.simplePreheatEnabled)==="on",ble_clock_sync_enabled:A(i.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:E(i.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(a=>({zone:a.zone,open_ripples:400+a.zone,close_ripples:390+a.zone}))}:null}}function Jn(t,e){let a=Object.keys(t&&t.settings||{}).length,o=Array.isArray(t&&t.zones)?t.zones.length:0,r=e&&t&&t.learned?ke:0;return G("Settings restored from backup (mock)"),{applied:a+o+r,skipped:e?0:ke,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Ia({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!J.enabled[t-1];Ia({key:"zone_enabled",value:e?1:0,zone:t})}};function Co(t,e){let a=URL.createObjectURL(e),o=document.createElement("a");o.href=a,o.download=t,o.rel="noopener",document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function Mo(t,e,a){Co(t,new Blob([String(e)],{type:(a||"text/plain")+";charset=utf-8"}))}function Lo(t,e){let a=new Date,o=n=>String(n).padStart(2,"0"),r=a.getFullYear()+o(a.getMonth()+1)+o(a.getDate())+"-"+o(a.getHours())+o(a.getMinutes());return t+"-"+r+"."+e}var Lt="/api/v1",yi="https://api.github.com/repos/birkemosen/lune/releases/latest",wi="https://github.com/birkemosen/lune/releases/latest/download/",ki="/update",_i="lune-v6-settings",er="1";function Xe(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function Ao(t){return Object.assign({"X-Lune-CSRF":er,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},t||{})}function Eo(t,e){let a=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&a.append(r,n);let o=a.toString();return Lt+t+(o?"?"+o:"")}function Fe(t,e,a){if(_o(),Xe())try{return Ia(a),Promise.resolve({ok:!0})}finally{Na()}let o=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&o.append(r,String(n));return fetch(Lt+t,{method:"POST",headers:Ao({"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"}),body:o.toString()}).then(async r=>{if(!r.ok&&[400,404,415].includes(r.status)&&(r=await fetch(Eo(t,e),{method:"POST",headers:Ao()})),!r.ok){let n=`POST ${t} failed (HTTP ${r.status})`;throw console.warn("API call failed: "+n),G(n),new Error(n)}return r}).catch(r=>{throw console.error(`API call error: POST ${t}:`,r),r}).finally(()=>{Na()})}function Si(t,e,a){return _o(),fetch(Eo(t,a),{method:"POST",headers:Ao({"Content-Type":"application/json"}),body:JSON.stringify(e)}).finally(()=>{Na()})}function To(t,e){let a=Number(e);k(y.setpoint(t),{value:a}),k(y.baseSetpoint(t),{value:a});let o=Number(E(y.coordinatorOffset(t))),r=Number.isFinite(o)?a+o:a;return k(y.effectiveSetpoint(t),{value:r}),Fe(`/zones/${t}/setpoint`,{setpoint_c:a},{key:"zone_setpoint",value:a,zone:t})}function tr(t,e){return k(y.enabled(t),{state:e?"on":"off",value:e}),Fe(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function la(t){return k(i.drivers,{state:t?"on":"off",value:t}),Fe("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}async function ar({hz:t=100,durationMs:e=4e3,clamp:a=!1}={}){return Xe()?{ok:!0,data:{cycles:Math.max(1,Math.floor(e/10)),hz:t,clamp:!!a,armed:!0,armed_at_cycle:1,latch_state_start:1,latch_state_end:0}}:(await Fe("/motors/arm-clock-probe",{hz:t,duration_ms:e,clamp:a?1:0})).json()}function Be(t,e){return Fe("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function or(){return It("Scanning I2C bus..."),G("I2C scan started"),Be("i2c_scan")}var zi={zone_probe:t=>y.probe(t),zone_temp_source:t=>y.tempSource(t),zone_sync_to:t=>y.syncTo(t)},Ci={zone_ble_mac:t=>y.ble(t),zone_sensor_id:t=>y.sensorId(t),zone_sensor_name:t=>y.sensorName(t),zone_name:t=>y.name(t)},Mi={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,ble_clock_sync_enabled:i.bleClockSyncEnabled},Li={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,open_endstop_current_factor:i.openEndstopCurrentFactor,open_endstop_stall_fraction:i.openEndstopStallFraction,close_trailing_step_ma:i.closeTrailingStepMa,close_trailing_sustain_ms:i.closeTrailingSustainMs,close_trailing_ref_ms:i.closeTrailingRefMs,cap_close_seat_ma:i.capCloseSeatMa,cap_close_seat_frames:i.capCloseSeatFrames,cap_close_popoff_ma:i.capClosePopoffMa,cap_stall_ma:i.capStallMa,cap_open_stop_ma:i.capOpenStopMa,cap_circuit_fault_ma:i.capCircuitFaultMa,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};function lt(t,e,a){let o=zi[e];return o&&k(o(t),{state:a}),Fe("/settings/select",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function Ot(t,e,a){let o=Ci[e];return o&&k(o(t),{state:a}),Fe("/settings/text",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function Ne(t,e){let a=Mi[t];return a&&k(a,{state:e}),Fe("/settings/select",{key:t,value:e},{key:t,value:e})}function De(t,e){let a=Number(e),o=Li[t];return o&&!Number.isNaN(a)&&k(o,{value:a}),Fe("/settings/number",{key:t,value:a},{key:t,value:a})}function nr(){return Fe("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:A(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:A(i.authorityProposalCoordinatorId)||"touch-mock"}},a=(e==null?void 0:e.data)||{};return a.installation_id&&k(i.authorityInstallationId,{state:a.installation_id}),a.coordinator_id&&k(i.authorityCoordinatorId,{state:a.coordinator_id}),k(i.authorityConfigured,{state:"on",value:!0}),k(i.authorityProposalPending,{state:"off",value:!1}),e})}function rr(){return Fe("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return k(i.authorityInstallationId,{state:""}),k(i.authorityCoordinatorId,{state:""}),k(i.authorityConfigured,{state:"off",value:!1}),t})}function sr(t,e){let a=String(e||"").trim();return G("Zone "+t+" renamed to "+(a||"(blank)"),t),Ot(t,"zone_name",a)}function ir(t,e){let a=Number(e),o=Number.isNaN(a)?0:Math.max(0,Math.min(100,Math.round(a)));return k(y.motorTarget(t),{value:o}),G("Motor "+t+" target set to "+o+"%",t),Fe(`/motors/${t}/target`,{value:o},{key:"motor_target",value:o,zone:t})}function lr(t){let e=Math.round(Number(t));return!Number.isFinite(e)||e<=0?1e4:Math.max(100,Math.min(45e3,e))}function Ha(t,e=1e4){let a=lr(e);return G("Motor "+t+" open for "+a+"ms",t),Fe(`/motors/${t}/open_timed`,{duration_ms:a},{key:"command",value:"open_motor_timed",zone:t,duration_ms:a})}function qa(t,e=1e4){let a=lr(e);return G("Motor "+t+" close for "+a+"ms",t),Fe(`/motors/${t}/close_timed`,{duration_ms:a},{key:"command",value:"close_motor_timed",zone:t,duration_ms:a})}function Fo(t){return G("Motor "+t+" stopped",t),Fe(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function cr(){G("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(Fe(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>la(!1).then(()=>e))}async function ca(){if(Xe())return Kn();let t=await fetch(Lt+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function No(){if(Xe())return Zn();let t=await fetch(Lt+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function da(t){return We("manualMode",!!t),G(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),Fe("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function dr(t){return G("Motor "+t+" fault reset",t),Be("motor_reset_fault",t)}function Ba(t){return G("Motor "+t+" learned factors reset",t),Be("motor_reset_learned_factors",t)}function pr(t){return G("Motor "+t+" reset and relearn started",t),Be("motor_reset_and_relearn",t)}function ur(){return G("Task/heap stats dumped to device log"),Be("dump_task_stats")}function Ro(){Xe()||fetch(Lt+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Ra(t)}).catch(()=>{})}function mr(){return Be("firmware_check")}function gr(){return G("Firmware install requested"),Be("firmware_install")}function br(){return Be("firmware_prepare")}function Po(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:wi+e}}function Qn(t,e){let a=Array.isArray(t)?t:[],o=n=>a.find(s=>n.test(String(s&&s.name||""))),r=o(/^lune-v6.*\.ota\.bin$/i)||o(/\.ota\.bin$/i)||o(/\.bin$/i);return r&&r.browser_download_url?{name:String(r.name),url:String(r.browser_download_url)}:Po(e)}var vt=class extends Error{constructor(e,a,o){super(o||e),this.name="ReleaseCheckError",this.code=e,this.status=a||0}};async function fr(){if(Xe()){let o=Xn(),r=String(o&&o.tag_name||"");return{tag:r,notes:String(o&&o.body||""),publishedAt:String(o&&o.published_at||""),asset:Qn(o&&o.assets,r)}}let t;try{t=await fetch(yi,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(o){throw new vt("network",0,o&&o.message?o.message:"network")}if(t.status===404)throw new vt("no_releases",404,"No published GitHub release");if(!t.ok)throw new vt("http",t.status,"Release check failed: "+t.status);let e=await t.json(),a=String(e&&e.tag_name||"");if(!a)throw new vt("no_releases",404,"No published GitHub release");return{tag:a,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Qn(e&&e.assets,a)}}function hr(t,e){return Xe()?new Promise(a=>{let o=0,r=setInterval(()=>{o=Math.min(100,o+20),e&&e(o),o>=100&&(clearInterval(r),G("Firmware image uploaded (mock)"),a("Update Successful!"))},220)}):new Promise((a,o)=>{let r=new FormData;r.append("update",t,t.name);let n=new XMLHttpRequest;n.open("POST",ki),n.setRequestHeader("X-Lune-CSRF",er),n.upload.onprogress=s=>{e&&s.lengthComputable&&e(Math.min(100,Math.round(s.loaded/s.total*100)))},n.onload=()=>{let s=String(n.responseText||"");if(n.status>=200&&n.status<300&&!/fail/i.test(s)){a(s);return}o(new Error("OTA upload rejected: "+n.status+" "+s))},n.onerror=()=>o(new Error("OTA upload connection lost")),n.send(r)})}function Oa(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function vr(t=!0){if(Xe())return Oa(Yn(t));let e=await fetch(Eo("/settings/export",{include_learned:t?1:0}),{cache:"no-store"});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Oa(await e.json())}function ja(t){let e=Oa(t);return!!(e&&e._type===_i)}async function xr(t,e=!0){let a=typeof t=="string"?JSON.parse(t):t,o=Oa(a);if(!ja(o))throw new Error("not_a_lune_backup");if(Xe())return Jn(o,e);let r=await Si("/settings/import",Object.assign({},o,{restore_learned:!!e}),{restore_learned:e?1:0});if(!r.ok)throw new Error("Settings restore failed: "+r.status);let n=await r.json().catch(()=>({})),s=n&&n.data?n.data:n||{};return G("Settings restored from backup"),{applied:Number(s.applied||0),skipped:Number(s.skipped||0),ignored:Number(s.ignored||0)}}function yr(t){let e=Lo("lune-v6-settings","json");return Mo(e,JSON.stringify(t,null,2),"application/json"),e}function Ai(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Da().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function wr(){let t=Lo("lune-v6-logs","txt");if(Xe())return Mo(t,Ai()||"No log lines buffered."),t;let e=await fetch(Lt+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return Co(t,await e.blob()),t}function Do(){if(Xe())return;let t=In();fetch(Lt+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Pa(e.lines,e.next_seq)}).catch(()=>{})}var At=null,kr=null,_r=null,Sr=null,$o=null,Io=!1;function ct(){return!!D("motorLabBusy")||Io}async function Ei(){At&&At.abort(),At=new AbortController;let t=await fetch("/api/v1/state",{cache:"no-store",signal:At.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function zr(t){if(!(!t||typeof t!="object")&&!$n()){for(let e in t)k(e,t[e]);sa(!1)}}function Ti(t){if(t){if(!t.type){zr(t);return}if(t.type==="state"){zr(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;G(e),String(e).indexOf("I2C_SCAN:")!==-1&&It(String(e))}}}function Fi(){ct()||Ro(),kr||(kr=setInterval(()=>{ct()||Ro()},300*1e3)),ct()||Do(),_r||(_r=setInterval(()=>{ct()||Do()},3e3))}function Oo(){ct()||Ei().then(t=>{ct()||(ht(!0),Ti(t),Fi())}).catch(()=>{ct()||ht(!1)})}async function Ni(){try{if(ct())return;let t=await fetch("/api/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),a=e&&e.data,o=a&&a.data_revision;a&&a.uptime_s!=null&&k(i.uptime,{value:Number(a.uptime_s)}),($o===null||o!==$o)&&($o=o,Oo()),ht(!0)}catch(t){ct()||ht(!1)}}function Ri(){Io=!0,At&&(At.abort(),At=null)}function Pi(){Io=!1,Oo()}function Cr(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){Gn();return}W("motorLabBusy",()=>{D("motorLabBusy")?Ri():Pi()}),Oo(),Sr||(Sr=setInterval(Ni,3e3))}var Mr=Object.create(null);function $(t,e){if(Mr[t])return;Mr[t]=1;let a=document.createElement("style");a.textContent=e,document.head.appendChild(a)}var Lr=`/* Generated from LDS tokens.json by generate_tokens.py. Do not edit. */
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
`;$("lds-tokens",Lr);var Va={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","nav.overview":"Overview","nav.help":"Help","nav.more":"More","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.scrollBottom":"Scroll to bottom","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.noData":"No data","overview.graph.collecting":"Collecting history\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 open Zones to clear or relearn.","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armed)","overview.timeline.absorbReactive":"Absorb (reactive)","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Valve","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.override.remaining":"Touch offset {offset} \xB7 {remaining} remaining","zone.override.hint":"Temporary command from Lune Touch","zone.chart.kicker":"Temperature \xB7 last 24h","zone.chart.note":"Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.","zone.demand":"Demand","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.sensor.externalSource":"External (Wi\u2011Fi)","zone.sensor.externalTitle":"External (Wi\u2011Fi)","zone.sensor.externalNote":"Bind a stable sensor_id. Hubs POST temperatures; zone mapping stays on V6. See Help \u2192 External room temperature.","zone.sensor.sensorIdPh":"sensor_id (MAC or entity id)","zone.sensor.sensorNamePh":"Friendly name (optional)","zone.sensor.noIngestYet":"No external temperature received yet.","zone.sensor.lastIngestAge":"Last ingest {sec}s ago (stale after 15 min).","help.external.title":"External room temperature","help.external.intro":"V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.","help.external.keyWarn":"Scripts include your browser session key if set \u2014 treat it as a secret.","help.external.copy":"Copy","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","settings.manifold.title":"Manifold Configuration","settings.manifold.panelTitle":"Manifold and probes","settings.manifold.panelSub":"Valve polarity and live 1-Wire readings","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe temperatures","settings.manifold.availableProbes":"Available probes","settings.manifold.availableProbesSub":"How many 1-Wire sensors are fitted on this manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Return","settings.manifold.roleBoth":"Flow \xB7 Return","settings.manifold.probeConflict":"That probe is already assigned to another role.","settings.manifold.unusedProbeWarn":"{enabled} active zones but only {assigned} zone return probes assigned.","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.panelSub":"Minimum opening on active loops","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"Local V6 hydraulic safeguard; heat-source and pump stay external.","settings.minFlow.opening":"Minimum total opening (%)","settings.minFlow.openingSub":"Only across loops already accepting heat.","settings.minFlow.failsafe":"Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.","settings.returnTemp.title":"Return temperature","settings.returnTemp.panelSub":"Optional per-zone return probes","settings.returnTemp.modeOff":"2 probes \xB7 flow/return only","settings.returnTemp.modeOn":"8 probes \xB7 per-zone returns","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Legacy return-temp balancing only \u2014 not needed for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.panelSub":"Shelly BLU display time","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: the close stroke is capped at 34s and 2600 commutations \u2014 40s is where the plunger leaves its housing. Opening is capped separately at 45s.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.openEndstopCurrentFactor":"Open Endstop Factor (Rev 3.2+)","settings.motor.openEndstopStallFraction":"Open Stall Fraction","settings.motor.closeTrailingStepMa":"Close Trailing Step","settings.motor.closeTrailingSustainMs":"Close Trailing Sustain","settings.motor.closeTrailingRefMs":"Close Trailing Window","settings.motor.capCloseSeatMa":"Close Seat Cap","settings.motor.capCloseSeatFrames":"Close Seat Cap Frames","settings.motor.capClosePopoffMa":"Close Pop-off Cap","settings.motor.capStallMa":"Stall Cap","settings.motor.capOpenStopMa":"Open Stop Cap","settings.motor.capCircuitFaultMa":"Circuit Fault Cap","diagnostics.lab.tune.close":"Close","diagnostics.lab.tune.open":"Open","diagnostics.lab.tune.caps":"Absolute current caps","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Product colour is amber for heat and forest for healthy state. Light and dark follow the system appearance.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.product":"Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Local handling of external preload","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. A new DEMAND redistributes flow instead of releasing the window.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armed","settings.preheat.reactive":"Reactive","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.enable.title":"Enable the drivers","diagnostics.lab.enable.copy":"Rev 3.3 has no fault latch. This pauses automatic zone control and raises DRIVER_N_SLEEP so the bridges can run.","diagnostics.lab.enable.action":"Enable drivers","diagnostics.lab.log.enableWait":"Raising DRIVER_N_SLEEP \u2014 no LATCH_ARM on this board","diagnostics.lab.enableBanner":"The drivers did not enable. FAULT_N_RAW, rail overcurrent or the USB switch may be asserted.","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The browser keeps the live chart for the full stroke.","diagnostics.lab.tune.title":"Endstop thresholds","diagnostics.lab.tune.copy":"Close is detected by the trailing step, open by the endstop factor and stall fraction; the caps are absolute per-frame limits. Slope is telemetry only. Changes apply immediately to this controller.","diagnostics.lab.log.tune":"Threshold {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Cleared learned motor factors for a clean stroke","diagnostics.lab.log.resetLearnedFailed":"Could not clear learned factors \u2014 continuing","diagnostics.lab.log.duration":"Timed move arm set to {seconds}s","diagnostics.lab.log.browserLog":"Chart kept from browser log ({seconds}s)","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.thr.title":"Thresholds on the {dir} stroke","diagnostics.lab.thr.source.capture":"Your latest capture","diagnostics.lab.thr.source.reference":"Reference trace \xB7 Rev 3.3 (broken unit)","diagnostics.lab.thr.intro":"Each threshold drawn as the current it trips at, replayed tick by tick through the firmware logic. Diamonds mark where each path would stop the motor; the larger one stops first. Typing in a field previews it here before you commit. The trace is already averaged, so real frame noise trips caps a little earlier.","diagnostics.lab.thr.chartAria":"Motor current on the {dir} stroke with each endstop threshold","diagnostics.lab.thr.riseAria":"Trailing current rise against the trailing-step threshold","diagnostics.lab.thr.riseTitle":"Trailing rise \xB7 I(t) \u2212 I(t \u2212 {window} s)","diagnostics.lab.thr.closeThreshold":"Close factor","diagnostics.lab.thr.openThreshold":"Open trip","diagnostics.lab.thr.baseline":"Free-travel baseline","diagnostics.lab.thr.trailing":"Trailing step","diagnostics.lab.thr.seat":"Seat cap","diagnostics.lab.thr.popoff":"Pop-off cap","diagnostics.lab.thr.openStop":"Open stop cap","diagnostics.lab.thr.stall":"Stall cap","diagnostics.lab.thr.circuit":"Circuit fault","diagnostics.lab.thr.ceiling":"Ceiling","diagnostics.lab.thr.wall":"40 s wall","diagnostics.lab.thr.trailingDetail":"rise > {step} mA over {window} s, held {sustain} s","diagnostics.lab.thr.factorDetail":"{base} mA \xD7 {f} = {ma} mA","diagnostics.lab.thr.fractionDetail":"{base} + {k} \xD7 ({stall} \u2212 {base}) mA","diagnostics.lab.thr.noBaseline":"baseline never settled on this trace","diagnostics.lab.thr.capDetail":"> {ma} mA for {frames} frames","diagnostics.lab.thr.seatGate":"only under load","diagnostics.lab.thr.openGate":"armed after breakaway","diagnostics.lab.thr.ceilingDetail":"{s} s or {counts} counts","diagnostics.lab.thr.wallDetail":"{s} s / {counts} counts \xB7 plunger leaves the housing","diagnostics.lab.thr.verdictNone":"No path trips on this trace.","diagnostics.lab.thr.verdictCeiling":"The ceiling cuts the drive first ({t}, {counts} counts) - nothing detected the stop before it.","diagnostics.lab.thr.verdictLate":"{name} stops first, at {t} - after the 40 s wall.","diagnostics.lab.thr.verdictFirst":"{name} stops first, at {t} ({ma}).","diagnostics.lab.thr.offScale":"Above the chart: {list}","diagnostics.lab.thr.rise":"Trailing rise","diagnostics.lab.thr.afterWall":"after the wall","diagnostics.lab.thr.notReached":"not on this trace","diagnostics.lab.thr.col.path":"Path","diagnostics.lab.thr.col.threshold":"Threshold","diagnostics.lab.thr.col.fires":"Fires at","diagnostics.lab.thr.col.counts":"Counts","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armPulseWait":"Waiting for latch arm pulse \u2014 pad 10 should read 3.3 V for ~5 s","diagnostics.lab.log.armProbeWait":"Square-waving LATCH_ARM at 100 Hz \u2014 U2 pin 1 should show ~0.5 V AC","diagnostics.lab.log.armProbe":"Clock probe {hz} Hz \xD7 {cycles} cycles \u2014 armed {armed} (first at {at})","diagnostics.lab.log.armHigh":"Firmware readback: pad 10 HIGH (GPIO17 is driven)","diagnostics.lab.log.armGpio":"GPIO17 never went high \u2014 pad 10 stayed LOW in firmware readback","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.latchFaulted":"Fault latch did not arm \u2014 LATCH_STATE stayed high after the pulse","diagnostics.lab.log.enableFailed":"Drivers did not enable \u2014 a fault net may be asserted","diagnostics.lab.log.neverStarted":"Motor never started (busy stayed off)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"The fault latch did not arm: LATCH_STATE stayed high after the arm pulse. Firmware cannot read FAULT_N_RAW, so the cause cannot be narrowed from here. Either a driver fault is latched (check driver nFAULT, the overcurrent comparator, 3V3_MOTOR) or the arm clock never reached the flip-flop (check R4, C4, Q1 and U2).","diagnostics.lab.armGpioBanner":"GPIO17 never went high. Watch pad 10 while Arming: it must read 3.3 V. If the gauge stays LOW, firmware is not driving the pin.","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.noEndstop":"No {direction} endstop in {seconds}s \u2014 still free-travel; try again after a full seat, or raise safe runtime","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.spurious":"Tacho count is rising while current rises \u2014 the edges are brush arcing, not commutations. Cadence and motion count are unreliable for the rest of this stroke.","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relative Kv (orifice model)","diagnostics.lab.kvHint":"Used by the flow allocator","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.railOc":"Rail OC","diagnostics.lab.usbFault":"USB fault","diagnostics.lab.baseline":"Baseline","diagnostics.lab.ceiling":"Ceiling","diagnostics.lab.openTrip":"Open trip","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 Motor Lab holds background polls","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","nav.overview":"Overblik","nav.help":"Hj\xE6lp","nav.more":"Mere","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.scrollBottom":"Til bunden","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.noData":"Ingen data","overview.graph.collecting":"Indsamler historik\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 \xE5bn Zoner for at kvittere eller genl\xE6re.","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armeret)","overview.timeline.absorbReactive":"Absorb (reaktiv)","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Ventil","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.override.remaining":"Touch-offset {offset} \xB7 {remaining} tilbage","zone.override.hint":"Midlertidig kommando fra Lune Touch","zone.chart.kicker":"Temperatur \xB7 seneste 24t","zone.chart.note":"Den stiplede linje er det langsigtede setpunkt. Gulvvarme bev\xE6ger sig langsomt, s\xE5 kurven er det nyttige signal.","zone.demand":"Behov","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.sensor.externalSource":"Ekstern (Wi\u2011Fi)","zone.sensor.externalTitle":"Ekstern (Wi\u2011Fi)","zone.sensor.externalNote":"Bind et stabilt sensor_id. Hubs poster temperaturer; zone-mapping sker kun p\xE5 V6. Se Hj\xE6lp \u2192 Ekstern rumtemperatur.","zone.sensor.sensorIdPh":"sensor_id (MAC eller entity-id)","zone.sensor.sensorNamePh":"Venligt navn (valgfrit)","zone.sensor.noIngestYet":"Ingen ekstern temperatur modtaget endnu.","zone.sensor.lastIngestAge":"Seneste ingest for {sec}s siden (stale efter 15 min).","help.external.title":"Ekstern rumtemperatur","help.external.intro":"V6 accepterer HTTP POST med sensor_id. Zone-mapping sker kun p\xE5 V6. Touch ingerer ikke temperaturer.","help.external.keyWarn":"Scripts inkluderer din browser-session-n\xF8gle hvis sat \u2014 behandl den som hemmelighed.","help.external.copy":"Kopi\xE9r","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","settings.manifold.title":"Manifold-konfiguration","settings.manifold.panelTitle":"Manifold og prober","settings.manifold.panelSub":"Ventilpolaritet og live 1-Wire-m\xE5linger","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.availableProbes":"Tilg\xE6ngelige prober","settings.manifold.availableProbesSub":"Hvor mange 1-Wire-sensorer der er monteret p\xE5 denne manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Retur","settings.manifold.roleBoth":"Flow \xB7 Retur","settings.manifold.probeConflict":"Den probe er allerede tildelt en anden rolle.","settings.manifold.unusedProbeWarn":"{enabled} aktive zoner, men kun {assigned} zone-returprober tildelt.","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.panelSub":"Minimum \xE5bning p\xE5 aktive sl\xF8jfer","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"Lokal V6-hydrauliksikring; varmekilde og pumpe forbliver eksterne.","settings.minFlow.opening":"Minimum total \xE5bning (%)","settings.minFlow.openingSub":"Kun p\xE5 sl\xF8jfer, der allerede tager varme.","settings.minFlow.failsafe":"Manifoldventilerne er Normally Open: ved str\xF8msvigt \xE5bner alle ventiler. Hvis cirkulationspumpen stadig har str\xF8m (eller kommer f\xF8rst online), kan sekund\xE6rsiden f\xE5 ubegr\xE6nset flow indtil V6 genstarter og genoptager styring.","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.panelSub":"Valgfrie returprober pr. zone","settings.returnTemp.modeOff":"2 prober \xB7 kun flow/retur","settings.returnTemp.modeOn":"8 prober \xB7 retur pr. zone","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Kun til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendig for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.panelSub":"Tid p\xE5 Shelly BLU-displays","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: luk-slaget er begr\xE6nset til 34s og 2600 kommutationer \u2014 ved 40s forlader stemplet motorhuset. \xC5bning har sin egen gr\xE6nse p\xE5 45s.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.openEndstopCurrentFactor":"\xC5bne endstop-faktor (Rev 3.2+)","settings.motor.openEndstopStallFraction":"\xC5bne stall-andel","settings.motor.closeTrailingStepMa":"Lukke trailing-step","settings.motor.closeTrailingSustainMs":"Lukke trailing-varighed","settings.motor.closeTrailingRefMs":"Lukke trailing-vindue","settings.motor.capCloseSeatMa":"Lukke seat-gr\xE6nse","settings.motor.capCloseSeatFrames":"Lukke seat-frames","settings.motor.capClosePopoffMa":"Lukke pop-off-gr\xE6nse","settings.motor.capStallMa":"Stall-gr\xE6nse","settings.motor.capOpenStopMa":"\xC5bne stop-gr\xE6nse","settings.motor.capCircuitFaultMa":"Kredsl\xF8bsfejl-gr\xE6nse","diagnostics.lab.tune.close":"Luk","diagnostics.lab.tune.open":"\xC5bn","diagnostics.lab.tune.caps":"Absolutte str\xF8mgr\xE6nser","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Produktfarven er amber til varme og skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.product":"Amber til handling og varme, skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Lokal h\xE5ndtering af ekstern forvarmning","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Nyt DEMAND omfordeler flow i stedet for at slippe vinduet.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armeret","settings.preheat.reactive":"Reaktiv","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.enable.title":"T\xE6nd driverne","diagnostics.lab.enable.copy":"Rev 3.3 har ingen fejl-latch. Det s\xE6tter automatisk zonestyring p\xE5 pause og s\xE6tter DRIVER_N_SLEEP h\xF8j, s\xE5 broerne kan k\xF8re.","diagnostics.lab.enable.action":"T\xE6nd drivere","diagnostics.lab.log.enableWait":"S\xE6tter DRIVER_N_SLEEP \u2014 ingen LATCH_ARM p\xE5 dette board","diagnostics.lab.enableBanner":"Driverne t\xE6ndte ikke. FAULT_N_RAW, skinne-overstr\xF8m eller USB-kontakten kan v\xE6re aktiv.","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Browseren beholder live-grafen for hele slaget.","diagnostics.lab.tune.title":"Endstop-t\xE6rskler","diagnostics.lab.tune.copy":"Luk detekteres af trailing-step, \xE5bn af endstop-faktoren og stall-andelen; gr\xE6nserne er absolutte pr. frame. Slope er kun telemetri. \xC6ndringer g\xE6lder med det samme p\xE5 denne controller.","diagnostics.lab.log.tune":"T\xE6rskel {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Nulstillede l\xE6rte motorfaktorer for et rent slag","diagnostics.lab.log.resetLearnedFailed":"Kunne ikke nulstille l\xE6rte faktorer \u2014 forts\xE6tter","diagnostics.lab.log.duration":"Timed move sat til {seconds}s","diagnostics.lab.log.browserLog":"Graf beholdt fra browser-log ({seconds}s)","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.thr.title":"T\xE6rskler p\xE5 {dir}","diagnostics.lab.thr.source.capture":"Din seneste capture","diagnostics.lab.thr.source.reference":"Referencetrace \xB7 Rev 3.3 (\xF8delagt enhed)","diagnostics.lab.thr.intro":"Hver t\xE6rskel vist som den str\xF8m, den udl\xF8ser ved, afspillet tick for tick gennem firmwarens logik. Ruderne viser, hvor hver sti ville stoppe motoren; den st\xF8rste stopper f\xF8rst. N\xE5r du skriver i et felt, vises effekten her, f\xF8r du gemmer. Tracet er allerede midlet, s\xE5 rigtig frame-st\xF8j udl\xF8ser gr\xE6nserne lidt tidligere.","diagnostics.lab.thr.chartAria":"Motorstr\xF8m under {dir} med hver endstop-t\xE6rskel","diagnostics.lab.thr.riseAria":"Trailing-stigning mod trailing-step-t\xE6rsklen","diagnostics.lab.thr.riseTitle":"Trailing-stigning \xB7 I(t) \u2212 I(t \u2212 {window} s)","diagnostics.lab.thr.closeThreshold":"Lukke-faktor","diagnostics.lab.thr.openThreshold":"\xC5bne-trip","diagnostics.lab.thr.baseline":"Free-travel-baseline","diagnostics.lab.thr.trailing":"Trailing-step","diagnostics.lab.thr.seat":"Seat-gr\xE6nse","diagnostics.lab.thr.popoff":"Pop-off-gr\xE6nse","diagnostics.lab.thr.openStop":"\xC5bne stop-gr\xE6nse","diagnostics.lab.thr.stall":"Stall-gr\xE6nse","diagnostics.lab.thr.circuit":"Kredsl\xF8bsfejl","diagnostics.lab.thr.ceiling":"Loft","diagnostics.lab.thr.wall":"40 s-v\xE6g","diagnostics.lab.thr.trailingDetail":"stigning > {step} mA over {window} s, holdt {sustain} s","diagnostics.lab.thr.factorDetail":"{base} mA \xD7 {f} = {ma} mA","diagnostics.lab.thr.fractionDetail":"{base} + {k} \xD7 ({stall} \u2212 {base}) mA","diagnostics.lab.thr.noBaseline":"baseline faldt aldrig til ro p\xE5 dette trace","diagnostics.lab.thr.capDetail":"> {ma} mA i {frames} frames","diagnostics.lab.thr.seatGate":"kun under belastning","diagnostics.lab.thr.openGate":"aktiv efter opstartsstr\xF8m","diagnostics.lab.thr.ceilingDetail":"{s} s eller {counts} counts","diagnostics.lab.thr.wallDetail":"{s} s / {counts} counts \xB7 stemplet forlader huset","diagnostics.lab.thr.verdictNone":"Ingen sti udl\xF8ser p\xE5 dette trace.","diagnostics.lab.thr.verdictCeiling":"Loftet stopper motoren f\xF8rst ({t}, {counts} counts) - intet detekterede stoppet f\xF8r.","diagnostics.lab.thr.verdictLate":"{name} stopper f\xF8rst, ved {t} - efter 40 s-v\xE6ggen.","diagnostics.lab.thr.verdictFirst":"{name} stopper f\xF8rst, ved {t} ({ma}).","diagnostics.lab.thr.offScale":"Over grafen: {list}","diagnostics.lab.thr.rise":"Trailing-stigning","diagnostics.lab.thr.afterWall":"efter v\xE6ggen","diagnostics.lab.thr.notReached":"ikke p\xE5 dette trace","diagnostics.lab.thr.col.path":"Sti","diagnostics.lab.thr.col.threshold":"T\xE6rskel","diagnostics.lab.thr.col.fires":"Udl\xF8ser ved","diagnostics.lab.thr.col.counts":"Counts","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armPulseWait":"Venter p\xE5 latch-puls \u2014 pad 10 skal vise 3,3 V i ca. 5 s","diagnostics.lab.log.armProbeWait":"Firkant p\xE5 LATCH_ARM ved 100 Hz \u2014 U2 pin 1 skal vise ca. 0,5 V AC","diagnostics.lab.log.armProbe":"Clock-probe {hz} Hz \xD7 {cycles} cyklusser \u2014 armeret {armed} (f\xF8rst ved {at})","diagnostics.lab.log.armHigh":"Firmware-readback: pad 10 HIGH (GPIO17 drives)","diagnostics.lab.log.armGpio":"GPIO17 gik aldrig h\xF8j \u2014 pad 10 forblev LOW i firmware-readback","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.latchFaulted":"Fejl-latch armerede ikke \u2014 LATCH_STATE forblev h\xF8j efter pulsen","diagnostics.lab.log.enableFailed":"Driverne t\xE6ndte ikke \u2014 et fejlnet kan v\xE6re aktivt","diagnostics.lab.log.neverStarted":"Motoren startede aldrig (busy blev ved med at v\xE6re slukket)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"Fejl-latch armerede ikke: LATCH_STATE forblev h\xF8j efter arm-pulsen. Firmware kan ikke l\xE6se FAULT_N_RAW, s\xE5 \xE5rsagen kan ikke indkredses herfra. Enten er en driverfejl l\xE5st (tjek driver nFAULT, overstr\xF8mskomparatoren og 3V3_MOTOR), eller arm-clocken n\xE5ede aldrig flip-floppen (tjek R4, C4, Q1 og U2).","diagnostics.lab.armGpioBanner":"GPIO17 gik aldrig h\xF8j. Pad 10 skal vise 3,3 V mens der armeres. Hvis m\xE5leren bliver p\xE5 LOW, driver firmware ikke pinnen.","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.noEndstop":"Ingen {direction}-endstop i {seconds}s \u2014 stadig fri l\xF8b; pr\xF8v efter fuld seat, eller h\xE6v safe runtime","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.spurious":"Tacho-t\xE6llingen stiger mens str\xF8mmen stiger \u2014 kanterne er b\xF8rste-gnister, ikke kommutationer. Kadence og t\xE6lling er ikke trov\xE6rdige i resten af dette slag.","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relativ Kv (\xE5bningsmodel)","diagnostics.lab.kvHint":"Bruges af flowallokatoren","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.railOc":"Rail OC","diagnostics.lab.usbFault":"USB fault","diagnostics.lab.baseline":"Baseline","diagnostics.lab.ceiling":"Ceiling","diagnostics.lab.openTrip":"Open trip","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 Motor Lab holder baggrundspoll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},Ar="en".toLowerCase(),Ho=Va[Ar]?Ar:"en";function p(t,e){let a=Va[Ho]&&Va[Ho][t]||Va.en[t]||t;return e?String(a).replace(/\{(\w+)\}/g,(o,r)=>e[r]==null?"":String(e[r])):a}function R(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=p(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",p(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",p(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",p(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Ho);var Er=`
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
`;function Et(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Tr(t,e,a){let o=Number(e),r=Number(a),n=Number(t),s=r-o;return!Number.isFinite(o)||!Number.isFinite(r)||!Number.isFinite(n)||s===0?0:Math.min(100,Math.max(0,(n-o)/s*100))}function qo({id:t,markHtml:e="",target:a,current:o,min:r=5,max:n=35,step:s=.5,unit:c="C",label:u,disabled:m=!1}={}){let x=t||"lds-dial",l=Et(u||"Temperature target"),f=Number(a),v=Number(o),w=Number.isFinite(f)?f.toFixed(1):"\u2014",C=Number.isFinite(v)?v.toFixed(1):"\u2014",z=c==="C"||c==="\xB0C"||c==="\xB0"?"\xB0":Et(c),_=m?' aria-disabled="true"':"";return`<div class="lds-dial" id="${Et(x)}" role="group" aria-label="${l}" data-dial-min="${r}" data-dial-max="${n}" data-dial-unit="${Et(z)}"${_}>
  <div class="lds-dial-arc">
    ${e}
    <div class="lds-dial-readout">
      <div class="lds-dial-target"><span data-dial-target>${w}</span><span class="lds-dial-unit">${z}</span></div>
      <div class="lds-dial-current" data-dial-current>Current ${C}${z}</div>
    </div>
    <span class="lds-dial-live" data-dial-live aria-live="polite">${w}${z}</span>
  </div>
  <div class="lds-dial-steps">
    <button type="button" class="lds-dial-step" data-dial-step="${s}" aria-label="Increase" ${m?"disabled":""}>+</button>
    <button type="button" class="lds-dial-step" data-dial-step="-${s}" aria-label="Decrease" ${m?"disabled":""}>\u2212</button>
  </div>
</div>`}function Bo(t,{target:e,current:a,disabled:o,states:r,selected:n}={}){let s=typeof t=="string"?document.querySelector(t):t;if(!s)return;let c=s.dataset.dialUnit||"\xB0",u=Number(e),m=Number(a),x=Number.isFinite(u)?u.toFixed(1):"\u2014",l=Number.isFinite(m)?m.toFixed(1):"\u2014",f=s.querySelector("[data-dial-target]"),v=s.querySelector("[data-dial-current]"),w=s.querySelector("[data-dial-live]");f&&(f.textContent=x),v&&(v.textContent=`Current ${l}${c}`),w&&(w.textContent=`${x}${c}`),r&&s.querySelectorAll(".pipe").forEach((C,z)=>{let _=r[z]||"idle";C.setAttribute("class",`pipe is-${_}${z===n?" is-focus":""}`)}),o!=null&&(s.setAttribute("aria-disabled",o?"true":"false"),s.querySelectorAll(".lds-dial-step").forEach(C=>{C.disabled=!!o}))}function jo(t,e={}){let a=typeof t=="string"?document.querySelector(t):t;if(!a)return()=>{};let o=r=>{var c;let n=r.target.closest("button.lds-dial-step[data-dial-step]");if(!n||!a.contains(n)||n.disabled)return;let s=parseFloat(n.getAttribute("data-dial-step"));if(Number.isFinite(s)){if(e.onStep)e.onStep(s);else if(e.onChange){let u=parseFloat(a.dataset.dialMin),m=parseFloat(a.dataset.dialMax),x=parseFloat((c=a.querySelector("[data-dial-target]"))==null?void 0:c.textContent),l=Number.isFinite(x)?x:20,f=Math.min(m,Math.max(u,Math.round((l+s)*10)/10));e.onChange(f)}}};return a.addEventListener("click",o),()=>a.removeEventListener("click",o)}function Vo({remaining:t="",hint:e="Temporary command from Lune Touch"}={}){return`<div class="lds-override-banner ui-override-banner" data-override-banner ${!String(t||"").trim()?"hidden":""}>
  <div class="lds-override-main ui-override-main">
    <strong data-override-remaining>${Et(t)}</strong>
    <small data-override-hint>${Et(e)}</small>
  </div>
</div>`}function Uo(t,{remaining:e="",hint:a}={}){var u;let o=typeof t=="string"?document.querySelector(t):t;if(!o)return;let r=(u=o.matches)!=null&&u.call(o,"[data-override-banner]")?o:o.querySelector("[data-override-banner]");if(!r)return;let n=r.querySelector("[data-override-remaining]"),s=r.querySelector("[data-override-hint]"),c=String(e||"").trim();r.hidden=!c,n&&(n.textContent=c),s&&a!==void 0&&(s.textContent=a)}function Wo({min:t=5,max:e=35,step:a=.5,value:o=21,label:r="Comfort setpoint",disabled:n=!1}={}){let s=Number(o),c=Number.isFinite(s)?s.toFixed(1):"\u2014",u=Tr(s,t,e),m=n?" disabled":"";return`<div class="lds-slider-row slider-row" data-lds-slider-row>
  <input data-comfort-slider type="range" min="${t}" max="${e}" step="${a}" value="${Number.isFinite(s)?s:t}" aria-label="${Et(r)}" style="--slider-fill:${u}%"${m}>
  <strong data-slider-value>${c}\xB0</strong>
</div>`}function Ua(t){if(!t)return;let e=t.min,a=t.max,o=t.value,r=Tr(o,e,a);t.style.setProperty("--slider-fill",`${r}%`)}var Wa=`
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
`;function Fr(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function $e({on:t=!1,disabled:e=!1,label:a="",title:o="",attrs:r="",className:n=""}={}){let s=["lds-nav-switch","nav-switch",t?"is-on":"",e?"is-disabled":"",n].filter(Boolean).join(" "),c=Fr(a||o||"Toggle"),u=o||a?` title="${Fr(o||a)}"`:"";return`<button type="button" class="${s}" role="switch" aria-checked="${t?"true":"false"}" aria-label="${c}"${u}${e?" disabled":""} data-lds-nav-switch ${r}></button>`}function Ka(t,{on:e,disabled:a}={}){var r,n;if(!t)return;let o=(r=t.matches)!=null&&r.call(t,"[data-lds-nav-switch]")?t:(n=t.querySelector)==null?void 0:n.call(t,"[data-lds-nav-switch]");o&&(e!==void 0&&(o.classList.toggle("is-on",!!e),o.setAttribute("aria-checked",e?"true":"false")),a!==void 0&&(o.classList.toggle("is-disabled",!!a),o.disabled=!!a))}var Nr=`
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
</div>`}$("lds-comfort-control",Er);$("lds-nav-switch",Wa);$("lds-settings-card",Nr);var $i=`
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
`;$("ui-kit",$i);function Le(t){let e=p(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function Ii(t,e){let a=Math.abs(Number(t));return!Number.isFinite(a)||a<1e3?e:Math.pow(10,Math.floor(Math.log10(a))-1)}function Oi(t){let e=String(t),a=e.indexOf(".");return a<0?0:e.length-a-1}function Ae(t,e={}){let a=!!e.immediate,o=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r),a&&(r.hidden=!0);let n=[],s=()=>{a||r.classList.toggle("show",n.some(b=>b.dirty))},c=b=>{b.dirty&&(b.commit&&Promise.resolve(b.commit()).catch(()=>{}),b.dirty=!1,s())},u=(b,d)=>{b.dirty=d,a&&d?c(b):s()};function m(b){return b.markDirty=()=>u(b,!0),n.push(b),b}function x(b,d){let g={dirty:!1,input:b},h=d.baseStep!=null?d.baseStep:parseFloat(b.step)||1,S=Oi(h),F=d.min!=null?d.min:b.min!==""?parseFloat(b.min):-1/0,j=d.max!=null?d.max:b.max!==""?parseFloat(b.max):1/0,I=Q=>S>0?Number(Q).toFixed(S):String(Math.round(Number(Q)));if(!d.nostep){let Q=document.createElement("div");Q.className="ui-stepper",b.parentNode.insertBefore(Q,b);let ne=document.createElement("button");ne.type="button",ne.className="ui-step-btn",ne.textContent="\u2212",ne.setAttribute("aria-label",p("common.decrease"));let se=document.createElement("button");se.type="button",se.className="ui-step-btn",se.textContent="+",se.setAttribute("aria-label",p("common.increase")),Q.appendChild(ne),Q.appendChild(b),Q.appendChild(se);let V=K=>{if(b.disabled)return;let pe=parseFloat(b.value);Number.isFinite(pe)||(pe=parseFloat(b.placeholder)),Number.isFinite(pe)||(pe=0);let X=Math.min(j,Math.max(F,pe+K*Ii(pe,h)));b.value=I(X),u(g,!0)};ne.addEventListener("click",()=>V(-1)),se.addEventListener("click",()=>V(1)),b.addEventListener("keydown",K=>{K.key==="Enter"&&b.blur()})}return b.addEventListener("input",()=>u(g,!0)),g.sync=()=>{let Q=d.read();b.value=Q!=null&&Number.isFinite(Number(Q))?I(Q):""},g.commit=()=>{let Q=parseFloat(b.value);Number.isFinite(Q)&&d.commit(Math.min(j,Math.max(F,Q)))},m(g)}function l(b,d){let g={dirty:!1,input:b};b.addEventListener("input",()=>{g.dirty=!0,s()});let h=()=>{g.dirty&&a&&c(g)};return b.addEventListener("blur",h),b.addEventListener("keydown",S=>{S.key==="Enter"&&(S.preventDefault(),b.blur())}),g.sync=()=>{let S=d.read();b.value=S!=null?S:""},g.commit=()=>d.commit(b.value.trim()),m(g)}function f(b,d){let g={dirty:!1,input:b};return b.addEventListener("change",()=>u(g,!0)),g.sync=()=>{let h=d.read();h!=null&&(b.value=h)},g.commit=()=>d.commit(b.value),m(g)}function v(b,d){let g={dirty:!1,input:b,staged:!1},h=b.closest(".ui-row"),S=()=>{Ka(b,{on:g.staged}),h&&h.classList.toggle("is-on",g.staged),d.onChange&&d.onChange(g.staged)};return b.addEventListener("click",()=>{g.staged=!g.staged,u(g,!0),S()}),g.sync=()=>{g.staged=!!d.read(),S()},g.commit=()=>d.commit(g.staged),m(g)}function w(b){let d={dirty:!1,sync:b.sync,commit:b.commit};return m(d)}let C=()=>n.forEach(b=>{!b.dirty&&b.sync&&b.sync()}),z=()=>{n.forEach(b=>{b.dirty&&(b.commit&&Promise.resolve(b.commit()).catch(()=>{}),b.dirty=!1)}),s(),e.onApply&&e.onApply()},_=()=>{n.forEach(b=>{b.dirty=!1,b.sync&&b.sync()}),s(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",z),r.querySelector(".ui-form-discard").addEventListener("click",_),R(r),{num:x,text:l,select:f,toggle:v,custom:w,refresh:C,apply:z,discard:_,isDirty:()=>n.some(b=>b.dirty)}}function Ht(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function Za(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function qt(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,a=t%86400/3600|0,o=t%3600/60|0;return e>0?e+"d "+a+"h "+o+"m":a>0?a+"h "+o+"m":o+"m"}var Rr=`
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
`;function Ko(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pr({live:t=!1,label:e="Offline",uptime:a="---",ip:o="---",showUptime:r=!0,showIp:n=!0}={}){let s=t?"":" is-off",c=r?"":" hidden",u=n?"":" hidden";return`<div class="lds-live-status" data-lds-live-status>
  <div class="lds-live-row">
    <span class="lds-live${s}" data-lds-live><i aria-hidden="true"></i><span data-lds-live-label>${Ko(e)}</span></span>
    <span class="lds-live-uptime" data-lds-uptime${c}>${Ko(a)}</span>
  </div>
  <div class="lds-live-ip" data-lds-ip${u}>${Ko(o)}</div>
</div>`}function Ga(t,{live:e,label:a,uptime:o,ip:r}={}){var x,l;if(!t)return;let n=(x=t.matches)!=null&&x.call(t,"[data-lds-live-status]")?t:(l=t.querySelector)==null?void 0:l.call(t,"[data-lds-live-status]");if(!n)return;let s=n.querySelector("[data-lds-live]"),c=n.querySelector("[data-lds-live-label]"),u=n.querySelector("[data-lds-uptime]"),m=n.querySelector("[data-lds-ip]");s&&e!==void 0&&s.classList.toggle("is-off",!e),c&&a!==void 0&&c.textContent!==a&&(c.textContent=a),u&&o!==void 0&&u.textContent!==o&&(u.textContent=o),m&&r!==void 0&&m.textContent!==r&&(m.textContent=r)}var Hi=`
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
/* The glyph sits on --danger, and --text-on-accent flips in the same direction
   --danger does: near-black against the bright dark-theme red, white against
   the deeper light-theme red. That picks the better contrast in both (5.0:1
   and 5.3:1). Hardcoded white scored only 3.76:1 in dark mode - below the
   4.5:1 this 9px glyph needs - so this is an accessibility fix, not just a
   lint one. The coupling is to --accent by name rather than --danger, so if
   either is retuned independently it wants revisiting; a dedicated
   --text-on-danger token in LDS is the durable answer. */
.v6-side-link .dot.is-fault {
  width:12px; height:12px; border-radius:4px; background:var(--danger); box-shadow:none;
  color:var(--text-on-accent); font-size:9px; font-weight:800; line-height:12px; text-align:center;
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
`;$("hv6-header",Hi);$("lds-live-status",Rr);$("lds-nav-switch",Wa);var qi=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><button type="button" class="v6-toolbar-icon" aria-label="Collapse navigation" aria-pressed="false"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14"/></svg></button><div><p class="v6-toolbar-kicker" id="v6-view-kicker">Home</p><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button></div>
  </header>`,Ye=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,Xa=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,Bi=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Ye('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span class="menu-label">Overview</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Zones</div>
      <div class="v6-nav-zones" data-zone-nav></div>
      <a href="#" class="v6-side-link v6-tab-zones" data-section="zones" hidden>${Ye('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span class="menu-label">Zones</span>${Xa("warn")}</a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Ye('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span class="menu-label">Diagnostics</span>${Xa("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${Ye('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span class="menu-label">Motor lab</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Settings</div>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="touch">${Ye('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/>')}<span class="menu-label">Touch</span>${Xa()}</a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="hydraulics">${Ye('<path d="M4 18h16M7 18V9m5 9V5m5 13v-6"/>')}<span class="menu-label">Hydraulics</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="comfort">${Ye('<path d="M12 4v3M8 8l-2-2M16 8l2-2M6 13h12M9 13c0 4 3 7 3 7s3-3 3-7"/>')}<span class="menu-label">Comfort</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="motors">${Ye('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')}<span class="menu-label">Motors</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="device">${Ye('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>')}<span class="menu-label">Device</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Ye('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span>${Xa()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Ye('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span class="menu-label">Help</span></a></div>
    ${Pr({live:!1,label:"Offline",uptime:"---",ip:"---"})}
  </nav>`,Dr={overview:["Overview / House status","System health & energy flow","Local heating status and current exceptions"],zones:["Controller details","Zones","Physical loops, applied targets and valve state"],diagnostics:["System","Diagnostics","Health, evidence and recovery"],motorlab:["System","Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Settings","Device configuration and safety"],help:["Utility","Help","Guidance for operating Lune V6"]},$r={touch:["Settings","Touch","Approval and coordinator identity"],hydraulics:["Settings","Hydraulics","Manifold probes, return temperature and minimum flow"],comfort:["Settings","Comfort","Room clocks and preheat absorption"],motors:["Settings","Motors","Drivers, profile and learning limits"],device:["Settings","Device","Connection, firmware, backup and appearance"]};function Hr(t){t&&(Ve(t.section),t.focus==="touch"&&(Fa("touch"),requestAnimationFrame(()=>{let e=document.querySelector(".settings-touch-card");e&&e.scrollIntoView({behavior:"smooth",block:"center"})})))}function Ir(t){return t?t.kind==="touch"?p("status.attention.approveTouch"):t.kind==="faults"?t.count===1?p("status.attention.zoneFaultOne"):p("status.attention.zoneFaultMany",{count:t.count}):"":""}function ji(t){if(!be(y.enabled(t)))return"OFF";let e=String(A(y.state(t))||"").toUpperCase()||"OFF",a=String(A(y.motorLastFault(t))||"").toUpperCase();return e==="FAULT"||a&&a!=="NONE"&&a!=="OK"?"FAULT":e}function Vi(t){return t==="OFF"?"is-off":t==="FAULT"?"is-fault":t==="OVERHEATED"?"is-overheated":t==="HEATING"||t==="CALLING"?"is-heating":t==="IDLE"?"is-idle":"is-online"}function Ui(t){return t==="HEATING"||t==="CALLING"?p("state.heating"):t==="IDLE"?p("state.idle"):t==="FAULT"?p("common.fault"):t==="MANUAL"?p("state.manual"):t==="OVERHEATED"?p("state.overheated"):t==="CALIBRATING"?p("state.calibrating"):p("state.off")}function Or(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}function Wi(t){let e=He(t);return e?`${Ke(t)} ${e}`:Ke(t)}H({tag:"hv6-header",render:qi,onMount(t,e){let a=e.querySelector("#v6-view-kicker"),o=e.querySelector("#v6-view-title"),r=e.querySelector("#v6-view-subtitle"),n=e.querySelector("#hdr-update"),s=e.querySelector("#hdr-attention"),c=e.querySelector(".v6-toolbar-icon");c&&c.addEventListener("click",()=>{let f=document.querySelector(".shell");if(!f)return;let v=f.classList.toggle("nav-collapsed");c.setAttribute("aria-pressed",String(v))});function u(){let f=D("firmwareUpdateAvailable");n.hidden=!f,f&&(n.textContent=p("status.updateAvailable",{version:f.latest}),n.title=p("settings.firmware.badgeTitle"))}function m(){let f=ko(),v=D("section")||"overview",w=!!(f&&f.section!==v);s.hidden=!w,w?(s.textContent=Ir(f),s.title=Ir(f),s.dataset.kind=f.kind):delete s.dataset.kind}function x(){let f=D("selectedZone")||1,v=He(f);return v?`${Ke(f)} \xB7 ${v}`:Me(f)}n.addEventListener("click",()=>{Fa("device"),Ve("settings");let f=document.querySelector(".settings-firmware-card");f&&f.scrollIntoView({behavior:"smooth",block:"center"})}),s.addEventListener("click",()=>{Hr(ko())});function l(){let f=D("section")||"overview",v=D("settingsPanel")||"touch",w=f==="settings"?$r[v]||$r.touch:Dr[f]||Dr.overview;a&&(a.textContent=w[0]),f==="zones"?(o.textContent=x(),r.textContent="Applied target, sensor coverage and local safety."):(o.textContent=w[1],r.textContent=w[2]),m()}W("section",l),W("settingsPanel",l),W("selectedZone",l),W("zoneNames",l),W("live",m),W("firmwareUpdateAvailable",u),L(i.authorityProposalPending,m);for(let f=1;f<=6;f++)L(y.state(f),m),L(y.motorLastFault(f),m);R(e),l(),u(),m()}});H({tag:"hv6-sidebar",render:Bi,onMount(t,e){let a=e,o=e.querySelector(".v6-more-toggle"),r=e.querySelector('[data-section="settings"][data-panel="touch"]'),n=e.querySelector(".v6-tab-zones"),s=e.querySelector('[data-section="diagnostics"]'),c=e.querySelector("[data-zone-nav]"),u=0,m=Date.now(),x=!1;function l(b,d,g,h){if(!b)return;let S=b.querySelector("[data-nav-dot]");S&&(S.hidden=!d,d?(b.setAttribute("aria-label",`${g}, ${h}`),b.title=h):(b.removeAttribute("aria-label"),b.removeAttribute("title")))}function f(){let b=Ta(),d=wo(),g=d===1?p("status.attention.zoneFaultOne"):p("status.attention.zoneFaultMany",{count:d});if(l(r,b,p("nav.settings"),p("status.attention.approveTouch")),l(n,d>0,p("nav.zones"),g),l(s,d>0,p("nav.diagnostics"),g),o){let h=o.querySelector("[data-nav-dot]");h&&(h.hidden=!b,h.classList.toggle("is-warn",!1)),b?(o.setAttribute("aria-label",p("status.attention.moreHasSettings")),o.title=p("status.attention.approveTouch")):(o.removeAttribute("aria-label"),o.removeAttribute("title"))}}function v(){if(!c)return;let b=D("selectedZone")||1,d=D("section")==="zones";c.innerHTML=Array.from({length:6},(g,h)=>{let S=h+1,F=d&&b===S,j=Wi(S),I=ji(S),Q=Ui(I),ne=`${j}: ${Q}`,se=Or(j),V=Or(ne),K=Vi(I),pe=I==="FAULT"?"!":"",X=be(y.enabled(S)),Ue=X?p("common.enabled"):p("common.disabled"),tt=$e({on:X,title:Ue,label:`${j}: ${Ue}`,attrs:`data-toggle-zone="${S}"`});return`<div class="v6-nav-row"><button type="button" class="v6-side-link${F?" active":""}" data-section="zones" data-select-zone="${S}" ${F?'aria-current="page"':""} title="${V}" aria-label="${V}"><span class="dot ${K}" aria-hidden="true">${pe}</span><span class="menu-label">${se}</span></button>${tt}</div>`}).join("")}function w(){if(!x){Ga(e,{uptime:"---"});return}let b=Math.max(0,Math.floor((Date.now()-m)/1e3));Ga(e,{uptime:qt(u+b)})}function C(){let b=!!D("live");Ga(e,{live:b,label:b?p("status.live"):p("status.offline"),ip:A(i.ip)||"---"});let d=E(i.uptime);if(d!=null&&!isNaN(d)&&d>=0){let g=d|0;(!x||g!==u)&&(u=g,m=Date.now(),x=!0)}w()}function z(){let b=D("section"),d=D("settingsPanel")||"touch";if(e.querySelectorAll("[data-section]").forEach(g=>{if(g.hasAttribute("data-select-zone"))return;let h=g.dataset.section===b&&b!=="zones";h&&g.dataset.panel&&(h=g.dataset.panel===d),h&&!g.dataset.panel&&b==="settings"&&(h=!1),g.classList.toggle("active",h),g.setAttribute("aria-current",h?"page":"false")}),n){let g=b==="zones";n.classList.toggle("active",g),n.setAttribute("aria-current",g?"page":"false")}v(),f(),C()}e.addEventListener("click",b=>{let d=b.target.closest("[data-toggle-zone]");if(d&&e.contains(d)){b.preventDefault(),b.stopPropagation();let F=Number(d.dataset.toggleZone);F>=1&&F<=6&&tr(F,!be(y.enabled(F)));return}let g=b.target.closest("[data-select-zone]");if(g){b.preventDefault(),Ct(Number(g.dataset.selectZone)),Ve("zones"),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"));return}let h=b.target.closest("[data-section]");if(!h||!e.contains(h)||h.classList.contains("v6-more-toggle"))return;b.preventDefault();let S=h.dataset.section;h.dataset.panel&&Fa(h.dataset.panel),S==="settings"&&Ta()&&(!h.dataset.panel||h.dataset.panel==="touch")?Hr({kind:"touch",section:"settings",focus:"touch"}):Ve(S),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"))}),o&&o.addEventListener("click",()=>{let b=a.classList.toggle("more-open");o.setAttribute("aria-expanded",String(b))}),W("section",z),W("settingsPanel",z),W("selectedZone",z),W("zoneNames",z),W("live",z),L(i.ip,C),L(i.uptime,C);let _=setInterval(w,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(_),{once:!0}),L(i.authorityProposalPending,f);for(let b=1;b<=6;b++)L(y.state(b),z),L(y.enabled(b),z),L(y.motorLastFault(b),z),L(y.temp(b),()=>{});R(e),z()}});var Ki=`
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
`;$("connectivity-card",Ki);var Zi=()=>`
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
`,Ap=H({tag:"connectivity-card",render:Zi,onMount(t,e){let a=e.querySelector(".cc-ip"),o=e.querySelector(".cc-ssid"),r=e.querySelector(".cc-mac"),n=e.querySelector(".cc-up"),s=e.querySelector(".cc-ver"),c=0,u=Date.now(),m=!1;function x(){if(!m){n.textContent="---";return}let v=Math.max(0,Math.floor((Date.now()-u)/1e3)),w=qt(c+v);n.textContent!==w&&(n.textContent=w)}function l(){a.textContent=A(i.ip)||"---",o.textContent=A(i.ssid)||"---",r.textContent=A(i.mac)||"---",s.textContent=A(i.firmware)||"---";let v=E(i.uptime);if(v!=null&&!isNaN(v)&&v>=0){let w=v|0;(!m||w!==c)&&(c=w,u=Date.now(),m=!0)}x()}L(i.ip,l),L(i.ssid,l),L(i.mac,l),L(i.firmware,l),L(i.uptime,l);let f=setInterval(x,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(f),{once:!0}),R(e),l()}});var Gi="http://www.w3.org/2000/svg",Xi=`
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
`;$("chart-kit",Xi);function O(t,e,a){let o=document.createElementNS(Gi,t);if(e)for(let r in e)o.setAttribute(r,e[r]);return a!=null&&(o.textContent=a),o}function Bt(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(o=>`${o.x.toFixed(2)} ${o.y.toFixed(2)}`).join(" L ");let e=.16,a=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let o=0;o<t.length-1;o++){let r=t[o-1]||t[o],n=t[o],s=t[o+1],c=t[o+2]||s,u=n.x+(s.x-r.x)*e,m=n.y+(s.y-r.y)*e,x=s.x-(c.x-n.x)*e,l=s.y-(c.y-n.y)*e;a+=` C ${u.toFixed(2)} ${m.toFixed(2)}, ${x.toFixed(2)} ${l.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return a}function Ya(t,e,a){let o=t.filter(c=>Number.isFinite(c));if(!o.length)return{min:e,max:a};let r=Math.min(...o),n=Math.max(...o);r===n&&(r-=1,n+=1);let s=(n-r)*.12;return{min:r-s,max:n+s}}function dt(t,e,a){let o=document.createElement("div");o.className="chart-tooltip",e.appendChild(o);let r=O("g",{class:"chart-cursor",style:"display:none"}),n=O("line",{class:"chart-cursor-line",y1:a.plotTop,y2:a.plotBottom});r.appendChild(n);let s=[];t.appendChild(r);function c(l){let f=0,v=1/0;for(let w=0;w<a.count;w++){let C=Math.abs(l-a.xAt(w));C<v&&(v=C,f=w)}return f}function u(l){let f=t.getScreenCTM();if(!f)return null;let v=t.createSVGPoint();return v.x=l.clientX,v.y=l.clientY,v.matrixTransform(f.inverse())}function m(l){if(!a.count)return;let f=u(l);if(!f)return;let v=c(f.x),w=a.xAt(v);n.setAttribute("x1",w),n.setAttribute("x2",w);let C=a.dots(v);for(;s.length<C.length;){let d=O("circle",{class:"chart-cursor-dot",r:3.4});r.appendChild(d),s.push(d)}s.forEach((d,g)=>{g<C.length?(d.setAttribute("cx",w),d.setAttribute("cy",C[g].y),d.setAttribute("fill",C[g].color),d.style.display=""):d.style.display="none"}),r.style.display="";let z=a.rows(v).map(d=>`<div class="tt-row"><span class="tt-swatch" style="background:${d.color}"></span>${d.label}<span class="tt-val">${d.value}</span></div>`).join("");o.innerHTML=`<div class="tt-time">${a.label(v)}</div>${z}`,o.classList.add("show");let _=e.getBoundingClientRect(),b=l.clientX-_.left+14;b+o.offsetWidth>_.width-6&&(b=l.clientX-_.left-o.offsetWidth-14),o.style.left=Math.max(6,b)+"px",o.style.top=Math.max(6,l.clientY-_.top+12)+"px"}function x(){o.classList.remove("show"),r.style.display="none"}return t.addEventListener("pointermove",m),t.addEventListener("pointerleave",x),()=>{t.removeEventListener("pointermove",m),t.removeEventListener("pointerleave",x),o.remove()}}var pa=1e3,Zo=180,Je=14,Yi=42,Ji=44,yt=42,eo=pa-yt-Yi,xt=Zo-Je-Ji,Tt=Je+xt,Go=24*3600,qr=Te+2,Br=Te+3,Ja=Te+4,Qi="var(--series-warm)",el="var(--series-cool)",jr="var(--series-solar)",tl=`
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
`;$("graph-widgets",tl);var Vr=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',Ur=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',al=t=>t.variant==="flow-return"?`<div class="graph-widgets">${Vr()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${Ur()}</div>`:`<div class="graph-widgets">${Vr()}${Ur()}</div>`;function Wr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function ol(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function ua(t,e,a){let o=[];for(let r=0;r<t.length;r++){let n=t[r];if(!n||n[0]<a)continue;let s=n[e];s==null||!Number.isFinite(s)||o.push({t:n[0],v:s})}return o}var to=(t,e)=>yt+Math.max(0,Math.min(1,(t-e)/Go))*eo;function nl(t,e,a){let o=Number(Date.now()/1e3)|0,r=3600,n=Math.ceil((o-Go)/r)*r,s=Math.floor(o/r)*r,c=Math.floor(o/r)*r;for(let m=n;m<=s;m+=r){let x=a-(o-m),l=to(x,e),f=new Date(m*1e3),v=m===c,w=Tt+16;t.appendChild(O("text",{x:l,y:w,"text-anchor":"end",transform:`rotate(-45 ${l.toFixed(1)} ${w})`,class:"chart-hour"+(v?" now":"")},String(f.getHours()).padStart(2,"0")))}let u=to(a,e);t.appendChild(O("line",{x1:u,y1:Je,x2:u,y2:Tt,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function rl(t){let e=[];if(t.forEach(n=>n.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let a=Math.min(...e),o=Math.max(...e);a===o&&(a-=.5,o+=.5);let r=(o-a)*.1;return a-=r,o+=r,{min:a,max:o}}function sl(t,e,a){let o=t.filter(r=>r.unit==="C").map(r=>ua(e,r.index,a));return rl(o)}function Kr(t,e,a,o,r,n){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${pa} ${Zo}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=a.map(_=>ua(o,_.index,r)),c=a.filter(_=>_.unit==="C"),u=c.some(_=>ua(o,_.index,r).length>0);if(!s.some(_=>_.length)||c.length&&!u&&!a.some(_=>_.unit==="%"&&ua(o,_.index,r).some(b=>b.v>0))){let _=c.length&&!u?p("overview.graph.noData"):p("overview.graph.collecting");return t.appendChild(O("text",{x:pa/2,y:Zo/2,"text-anchor":"middle",class:"chart-empty"},_)),null}let x=sl(a,o,r),l=Math.max(.001,x.max-x.min),f=_=>Je+(1-(_-x.min)/l)*xt,v=_=>Je+(1-Math.max(0,Math.min(100,_))/100)*xt,w=(_,b)=>_.unit==="%"?v(b):f(b);for(let _=0;_<3;_++){let b=_/2,d=Je+b*xt;t.appendChild(O("line",{x1:yt,y1:d,x2:yt+eo,y2:d,class:"chart-grid"})),a.some(g=>g.unit==="C")&&t.appendChild(O("text",{x:yt-6,y:d+4,"text-anchor":"end",class:"chart-tick"},Wr(x.max-l*b,"C")+"\xB0")),a.some(g=>g.unit==="%")&&t.appendChild(O("text",{x:yt+eo+6,y:d+4,"text-anchor":"start",class:"chart-tick"},Wr(100-100*b,"%")))}t.appendChild(O("line",{x1:yt,y1:Tt,x2:yt+eo,y2:Tt,class:"chart-axis"})),a.some(_=>_.unit==="C")&&t.appendChild(O("text",{x:9,y:Je+xt/2,transform:`rotate(-90 9 ${(Je+xt/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},p("overview.graph.axis.temp"))),a.some(_=>_.unit==="%")&&t.appendChild(O("text",{x:pa-9,y:Je+xt/2,transform:`rotate(90 ${pa-9} ${(Je+xt/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},p("overview.graph.axis.demand"))),nl(t,r,n),a.forEach((_,b)=>{let d=s[b].map(h=>({x:to(h.t,r),y:w(_,h.v)}));if(!d.length)return;let g=Bt(d);_.fill&&t.appendChild(O("path",{d:g+` L ${d[d.length-1].x.toFixed(1)} ${Tt} L ${d[0].x.toFixed(1)} ${Tt} Z`,fill:_.fill,stroke:"none"})),t.appendChild(O("path",{d:g,fill:"none",stroke:_.color,"stroke-width":String(_.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let C=[];for(let _=0;_<o.length;_++){let b=o[_];if(!b||b[0]<r)continue;let d=a.map(g=>b[g.index]);d.every(g=>g==null||!Number.isFinite(g))||C.push({t:b[0],vals:d})}if(!C.length)return null;let z=Date.now();return dt(t,e,{count:C.length,plotTop:Je,plotBottom:Tt,xAt:_=>to(C[_].t,r),label:_=>new Date(z-(n-C[_].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:_=>a.map((b,d)=>({y:w(b,C[_].vals[d]),color:b.color})).filter((b,d)=>Number.isFinite(C[_].vals[d])),rows:_=>a.map((b,d)=>({color:b.color,label:b.label,value:ol(C[_].vals[d],b.unit)})).filter((b,d)=>Number.isFinite(C[_].vals[d]))})}function Qa(t,e,a){let o=ua(t,e,a);return o.length?o[o.length-1].v:null}var Ip=H({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:al,onMount(t,e){let a=e.querySelector(".gw-dt"),o=e.querySelector(".gw-demand-text"),r=e.querySelector(".gw-flow"),n=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),c={flow:!0,return:!0,demand:!0},u=null,m=null;function x(){s.forEach(v=>{let w=v.dataset.layer;v.classList.toggle("is-off",!c[w]),v.setAttribute("aria-pressed",c[w]?"true":"false")})}function l(){let v=[];return c.flow&&v.push({index:qr,color:Qi,label:p("overview.graph.layers.flow"),unit:"C",width:2.4}),c.return&&v.push({index:Br,color:el,label:p("overview.graph.layers.return"),unit:"C",width:2}),c.demand&&v.push({index:Ja,color:jr,label:p("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),v}function f(){let v=D("zoneStateHistory"),w=v&&Array.isArray(v.entries)?v.entries:[],C=v&&v.uptime_s||Number(Date.now()/1e3)|0,z=C-Go;if(r){u&&u();let _=Qa(w,qr,z),b=Qa(w,Br,z),d=Qa(w,Ja,z),g=[];_!=null&&b!=null&&g.push("\u0394 "+(_-b).toFixed(1)+"\xB0"),d!=null&&g.push(Math.round(d)+"%"),a.textContent=g.length?g.join(" \xB7 "):"\u2014",u=Kr(r,r.closest(".chart-card"),l(),w,z,C)}if(n){m&&m();let _=Qa(w,Ja,z);o.textContent=_!=null?Math.round(_)+"%":"\u2014",m=Kr(n,n.closest(".chart-card"),[{index:Ja,color:jr,label:p("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],w,z,C)}}s.forEach(v=>{v.addEventListener("click",()=>{let w=v.dataset.layer;c[w]=!c[w],!c.flow&&!c.return&&!c.demand&&(c[w]=!0),x(),f()})}),W("zoneStateHistory",f),R(e),x(),f()}});var wt={0:{labelKey:"state.off",color:"var(--disabled)"},1:{labelKey:"state.manual",color:"var(--info)"},2:{labelKey:"state.calibrating",color:"var(--warn)"},3:{labelKey:"state.waitCal",color:"var(--text-faint)"},4:{labelKey:"state.waitTemp",color:"var(--text-faint)"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"var(--forest)"},7:{labelKey:"state.overheated",color:"var(--danger)"},255:{labelKey:"",color:"transparent"}},ma=24*3600,il=ma,ga=28,Jo=8,Ft=72,oo=48,jt=8,no=16,Xr=10,Yr="var(--series-solar)",Jr="var(--accent)",Xo=14,Zr=Te+1,Qr=jt+Te*(ga+Jo)-Jo,Yo=Qr+Xr,ao=Qr+Xr+no+oo,ll=`
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
`;$("zone-state-timeline",ll);var cl=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function dl(t,e){if(!t||!t.entries||t.entries.length===0)return null;let a=t.entries,o=t.uptime_s||e||0,r=Number(Date.now()/1e3)|0,n=1e3,s=n-Ft;function c(d){let g=(d+ma)/il;return Ft+Math.max(0,Math.min(1,g))*s}function u(d){return d-o}let m="http://www.w3.org/2000/svg",x=document.createElementNS(m,"svg");x.setAttribute("viewBox","0 0 "+n+" "+ao),x.classList.add("timeline-svg");let l=document.createElementNS(m,"rect");l.setAttribute("x",Ft),l.setAttribute("y",jt),l.setAttribute("width",s),l.setAttribute("height",ao-jt-oo),l.setAttribute("fill","transparent"),l.setAttribute("rx","0"),x.appendChild(l);let f=c(0),v=[-24,-18,-12,-6,0].map(d=>d*3600);for(let d of v){let g=c(d),h=document.createElementNS(m,"line");h.setAttribute("x1",g),h.setAttribute("y1",jt),h.setAttribute("x2",g),h.setAttribute("y2",ao-oo),h.setAttribute("stroke",d===0?"var(--series-solar)":"var(--separator)"),h.setAttribute("stroke-width","1"),d===0&&(h.setAttribute("stroke-dasharray","3 4"),h.setAttribute("opacity",".7"),h.setAttribute("vector-effect","non-scaling-stroke")),x.appendChild(h)}x.appendChild(pl(m,"text",{x:f+6,y:jt+14,"text-anchor":"start",fill:"var(--accent)","font-size":"12","font-family":"var(--font-ui)","font-weight":"650"},"now"));for(let d=0;d<Te;d++){let g=jt+d*(ga+Jo),h=document.createElementNS(m,"rect");h.setAttribute("x",Ft),h.setAttribute("y",g),h.setAttribute("width",s),h.setAttribute("height",ga),h.setAttribute("fill",d%2===0?"var(--inset)":"transparent"),x.appendChild(h);let S=document.createElementNS(m,"text");S.setAttribute("x",Ft-8),S.setAttribute("y",g+ga/2+1),S.setAttribute("text-anchor","end"),S.setAttribute("dominant-baseline","middle"),S.setAttribute("fill","var(--text-muted)"),S.setAttribute("font-size","13"),S.setAttribute("font-family","var(--font-ui)"),S.setAttribute("font-weight","650"),S.textContent="Z"+(d+1),x.appendChild(S);let F=a.map(I=>({rel:u(I[0]),state:I[d+1]})).filter(I=>I.rel>=-ma&&I.rel<=0),j=(I,Q,ne)=>{if(ne===255)return;let se=wt[ne]||wt[255];if(se.color==="transparent")return;let V=c(I),K=c(Q),pe=Math.max(1,K-V),X=document.createElementNS(m,"rect");X.setAttribute("x",V),X.setAttribute("y",g+(ga-Xo)/2),X.setAttribute("width",pe),X.setAttribute("height",Xo),X.setAttribute("fill",se.color),X.setAttribute("rx",String(Xo/2)),X.setAttribute("opacity","0.9"),x.appendChild(X)};if(F.length){let I=F[0].rel,Q=F[0].state;for(let ne=1;ne<F.length;ne++){let se=F[ne];se.state!==Q&&(j(I,se.rel,Q),I=se.rel,Q=se.state)}j(I,0,Q)}}{let d=document.createElementNS(m,"rect");d.setAttribute("x",Ft),d.setAttribute("y",Yo),d.setAttribute("width",s),d.setAttribute("height",no),d.setAttribute("fill","color-mix(in srgb, var(--series-solar) 12%, transparent)"),d.setAttribute("rx","2"),x.appendChild(d);let g=document.createElementNS(m,"text");g.setAttribute("x",Ft-8),g.setAttribute("y",Yo+no/2+1),g.setAttribute("text-anchor","end"),g.setAttribute("dominant-baseline","middle"),g.setAttribute("fill","var(--text-muted)"),g.setAttribute("font-size","12"),g.setAttribute("font-family","var(--font-ui)"),g.setAttribute("font-weight","650"),g.textContent=p("overview.timeline.absorb"),x.appendChild(g);let h=a.map(S=>({rel:u(S[0]),on:S.length>Zr?Number(S[Zr]||0):0})).filter(S=>S.rel>=-ma&&S.rel<=0);if(h.length){let S=(I,Q,ne)=>{if(!ne)return;let se=c(I),V=Math.max(1,c(Q)-se),K=document.createElementNS(m,"rect");K.setAttribute("x",se),K.setAttribute("y",Yo),K.setAttribute("width",V),K.setAttribute("height",no),K.setAttribute("fill",ne===2?Jr:Yr),K.setAttribute("rx","2"),K.setAttribute("opacity",ne===2?"0.95":"0.85"),x.appendChild(K)},F=h[0].rel,j=h[0].on;for(let I=1;I<h.length;I++)h[I].on!==j&&(S(F,h[I].rel,j),F=h[I].rel,j=h[I].on);S(F,0,j)}}let w=ao-oo+22,C=3600,z=Math.ceil((r-ma)/C)*C,_=Math.floor(r/C)*C,b=Math.floor(r/C)*C;for(let d=z;d<=_;d+=C){let h=new Date(d*1e3).getHours(),S=d===b;if(!S&&h%2!==0)continue;let F=d-r,j=c(F),I=document.createElementNS(m,"text");I.setAttribute("x",j),I.setAttribute("y",w),I.setAttribute("text-anchor","middle"),I.setAttribute("fill",S?"var(--accent)":"var(--text-muted)"),I.setAttribute("font-size","12"),I.setAttribute("font-family","var(--font-ui)"),I.setAttribute("font-weight",S?"700":"600"),I.setAttribute("font-variant-numeric","tabular-nums lining-nums"),I.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),I.textContent=String(h).padStart(2,"0"),x.appendChild(I)}return x}function pl(t,e,a,o){let r=document.createElementNS(t,e);for(let n in a)r.setAttribute(n,a[n]);return o!=null&&(r.textContent=o),r}function Gr(t){t.innerHTML="";let e=[{code:5,...wt[5]},{code:6,...wt[6]},{code:0,...wt[0]},{code:1,...wt[1]},{code:7,...wt[7]},{code:2,...wt[2]}];for(let r of e){let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?p(r.labelKey):""),t.appendChild(n)}let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+Yr+'"></span>'+p("overview.timeline.absorbReactive"),t.appendChild(a);let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Jr+'"></span>'+p("overview.timeline.absorbArmed"),t.appendChild(o)}var Up=H({tag:"zone-state-timeline",render:cl,onMount(t,e){let a=e.querySelector(".tl-body"),o=e.querySelector(".timeline-legend");Gr(o);function r(){let n=D("zoneStateHistory"),s=(()=>{let u=D&&D("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(a.innerHTML="",!n||!n.entries||n.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent=p("overview.timeline.noHistory"),a.appendChild(u);return}let c=dl(n,s);c&&a.appendChild(c)}W("zoneStateHistory",r),W("zoneNames",r),L(i.drivers,r);for(let n=1;n<=Te;n++)L(y.enabled(n),r),L(y.state(n),r),L(y.temp(n),r),L(y.setpoint(n),r),L(y.preheatAdvance(n),r);R(e),r()}});var ul=`
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
`;$("zone-grid",ul);var ml=()=>'<div class="zone-grid" aria-label="Zones"></div>',Gp=H({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:ml,onMount(t,e){for(let a=1;a<=6;a++)e.appendChild(ce("zone-card",{zone:a,selection:t.selection,navigate:t.navigate}))}});var gl=`
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
`;$("zone-card",gl);var bl=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${Me(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${it(t.zone)}</div>
		<div class="zc-friendly"${He(t.zone)?" hidden":""}>${He(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,ou=H({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:bl,onMount(t,e){let a=t.zone,o=y.temp(a),r=y.state(a),n=y.enabled(a),s=e.querySelector(".zc-state-label"),c=e.querySelector(".zc-zone-name"),u=e.querySelector(".zc-friendly"),m=e.querySelector(".zc-temp"),x=e.querySelector(".zc-target"),l=e.querySelector(".zc-valve-value");function f(){var S;let w=be(n),C=String(A(r)||"").toUpperCase()||"OFF",z=String(A(y.motorLastFault(a))||"").toUpperCase(),_=z&&z!=="NONE"&&z!=="OK",b=w&&(C==="FAULT"||_)?"FAULT":C,d=t.selection&&D("selectedZone")===a,g=He(a);c.innerHTML=it(a),u.textContent=g?"":"---",u.hidden=!!g,e.setAttribute("aria-label",Me(a)),m.textContent=Ht(E(o)),x.textContent=p("zone.card.setpoint",{value:Ht((S=E(y.effectiveSetpoint(a)))!=null?S:E(y.setpoint(a)))}),l.textContent=Za(E(y.valve(a)));let h=w?b:"OFF";s.textContent=h==="HEATING"?p("state.heating"):h==="IDLE"?p("state.idle"):h==="FAULT"?p("common.fault"):h==="MANUAL"?p("state.manual"):h==="OVERHEATED"?p("state.overheated"):h==="CALIBRATING"?p("state.calibrating"):p("state.off"),e.title=_?p("zone.card.fault",{fault:z}):"",e.classList.toggle("active",d),d?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${c.textContent}, ${m.textContent}, ${x.textContent}, ${s.textContent}. Open details.`),e.classList.toggle("disabled",!w),e.classList.toggle("zs-heating",w&&(h==="HEATING"||h==="CALLING")),e.classList.toggle("zs-overheated",w&&h==="OVERHEATED"),e.classList.toggle("zs-fault",w&&h==="FAULT"),e.classList.toggle("zs-idle",w&&h==="IDLE"),e.classList.toggle("zs-off",!w||h==="OFF")}function v(){Ct(a),t.navigate&&Ve("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:a}}))}e.addEventListener("click",v),L(o,f),L(y.setpoint(a),f),L(y.effectiveSetpoint(a),f),L(y.valve(a),f),L(r,f),L(n,f),L(y.motorLastFault(a),f),W("selectedZone",f),W("zoneNames",f),f()}});var oe={cx:200,cy:175,haloR:72,cutR:72,discR:56,stroke:6.5,pipeXs:[138,162.8,187.6,212.4,237.2,262],pipeFrom:175,pipeTo:278,lockupScale:.8,lockupCutR:58,lockupDiscR:50,luneSize:24,luneTracking:2.8,luneY:183,v6Size:40,v6Tracking:.4,v6Y:188,viewBoxPortrait:"110 90 180 210",viewBoxLandscape:"118 100 202 150",viewBoxLockup:"142 118 154 114",lockupWidth:80,lockupHeight:59,manifoldWidth:108,manifoldHeight:80,thermal:{supply:"#FCD34D",heat:"#F59E0B",ret:"#10B981",heatStop:28},pipe:{calling:"#F59E0B",idle:"#10B981",unused:"rgba(232,214,188,.20)"},metallic:{top:"#1c1915",bottom:"#0c0b09",rim:"#25221E",word:"#FAF6EF"}},fl=0;function hl(t){let{cx:e,cy:a}=oe,o=[`translate(${e} ${a})`,"rotate(-90)"];return t&&t!==1&&o.push(`scale(${t})`),o.push(`translate(${-e} ${-a})`),o.join(" ")}function vl(t,e=!1){let a=oe.thermal,o=oe.metallic,r=e?`x1="${oe.cx}" y1="${oe.cy+oe.haloR}" x2="${oe.cx}" y2="${oe.cy-oe.haloR}"`:'x1="120" y1="175" x2="280" y2="175"';return`<defs>
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
  </defs>`}function ba({states:t=[],selected:e=-1,sku:a="",landscape:o=!1,lockup:r=!1,prefix:n=""}={}){let s=n||`lm${++fl}`,c=r?oe.lockupScale:null,u=r?oe.lockupCutR:oe.cutR,m=r?oe.lockupDiscR:oe.discR,x=o||r?` transform="${hl(c)}"`:"",l=r?oe.viewBoxLockup:o?oe.viewBoxLandscape:oe.viewBoxPortrait,f=oe.pipeXs.map((w,C)=>`<line class="pipe is-${t[C]||"idle"}${C===e?" is-focus":""}" x1="${w}" y1="${oe.pipeFrom}" x2="${w}" y2="${oe.pipeTo}"/>`).join(""),v="";if(a){let w=a.toUpperCase()==="V6",C=w?oe.v6Size:oe.luneSize,z=w?oe.v6Tracking:oe.luneTracking,_=w?oe.v6Y:oe.luneY;v=`<text class="sku" x="${oe.cx}" y="${_}" text-anchor="middle" fill="${oe.metallic.word}" font-size="${C}" font-weight="700" letter-spacing="${z}" font-family="system-ui,-apple-system,sans-serif">${a}</text>`}return`<svg class="lune-mark${o||r?" is-landscape":""}" viewBox="${l}" fill="none" aria-hidden="true">
    ${vl(s,o||r)}
    <g class="pipes"${x} stroke="url(#${s}-thermal)" stroke-width="${oe.stroke}" stroke-linecap="round" fill="none">${f}</g>
    <circle class="disc-cut" cx="${oe.cx}" cy="${oe.cy}" r="${u}"></circle>
    <path class="halo-arc"${x} d="M${oe.cx-oe.haloR} ${oe.cy}A${oe.haloR} ${oe.haloR} 0 0 1 ${oe.cx+oe.haloR} ${oe.cy}" fill="none" stroke="url(#${s}-thermal)" stroke-width="${oe.stroke}" stroke-linecap="round" filter="url(#${s}-glow)"></path>
    <circle class="disc" cx="${oe.cx}" cy="${oe.cy}" r="${m}"></circle>
    ${v}
  </svg>`}function es(){return ba({sku:"LUNE",lockup:!0,prefix:"lt-lockup"})}var ts=`
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
`;function Vt(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function as(t,e="idle"){if(e==="unused")return 0;let a=Number(t);return!Number.isFinite(a)||a<=0?0:Math.min(5,Math.max(1,Math.ceil(a/20)))}function xl(t=0){return`<span class="lds-loop-demand-bar loop-demand-bar" data-level="${Math.min(5,Math.max(0,Number(t)||0))}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`}function os({id:t,name:e="\u2014",temp:a="\u2014",level:o=0,kind:r="idle",selected:n=!1,attrs:s="",tag:c="button",showDemand:u=!0,className:m=""}={}){let x=["lds-loop","loop",n?"is-selected":"",r==="calling"?"is-calling":"",r==="unused"?"is-unused":"",m].filter(Boolean).join(" "),l=c==="button"?' type="button"':"",f=u?`<span class="lds-loop-demand loop-demand">${xl(o)}<span class="lds-loop-temp loop-temp">${Vt(a)}</span></span>`:`<span class="lds-loop-temp loop-temp">${Vt(a)}</span>`;return`<${c} class="${x}"${l} ${s}><span class="lds-loop-id loop-id">${Vt(t)}</span><span class="lds-loop-name loop-name">${Vt(e)}</span>${f}</${c}>`}function ns({title:t="",lines:e=[],offline:a=!1}={}){let o=(e||[]).map((r,n)=>`<small${a&&n===e.length-1||n===e.length-1?' class="status"':""}>${Vt(r)}</small>`).join("");return`<strong>${Vt(t)}</strong>${o}`}function kt(t){if(!be(y.enabled(t)))return"unused";let e=String(A(y.state(t))||"").toUpperCase(),a=Number(E(y.valve(t)));return e==="HEATING"||e==="CALLING"||Number.isFinite(a)&&a>20||e==="FAULT"||e==="OVERHEATED"?"calling":"idle"}function rs(){return[1,2,3,4,5,6].map(kt)}function yl(){return rs().filter(t=>t==="calling").length}function wl(){let t=yl();return t?`${t}/6 heat call`:"Idle"}function Ut(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function ss(t,{states:e,selected:a=-1,sku:o="V6",landscape:r=!0,prefix:n}={}){if(!t)return;let s=n||t.getAttribute("data-live-mark")||"mark";t.innerHTML=ba({states:e||rs(),selected:a,sku:r?o:"",landscape:r,prefix:s})}function is(){let t=Ut(E(i.flow)),e=Ut(E(i.ret)),a=Number(E(i.flow)),o=Number(E(i.ret)),r=Number.isFinite(a)&&Number.isFinite(o)?`${(a-o).toFixed(1)}\xB0`:"\u2014";return ns({title:"Lune V6",lines:[`Flow ${t} \xB7 Ret ${e}`,`\u0394T ${r} \xB7 ${wl()}`]})}function kl(t,e,a={}){if(!t||t.length<2)return"";let o=a.w||360,r=a.h||128,n=[a.ref].filter(v=>v!=null&&!Number.isNaN(Number(v))),s=Math.min(...t,...n),c=Math.max(...t,...n),u=4,m=c-s||1,x=v=>r-(v-s)/m*(r-u*2)-u,l=t.map((v,w)=>`${w/(t.length-1)*o},${x(v)}`).join(" "),f=n.length?`<line class="ref" x1="0" y1="${x(n[0])}" x2="${o}" y2="${x(n[0])}" />`:"";return`<svg class="${a.className||"spark spark-lg"}" viewBox="0 0 ${o} ${r}" preserveAspectRatio="none" aria-hidden="true">${f}<polyline fill="none" stroke="${e}" stroke-width="${a.stroke||1.8}" points="${l}"/></svg>`}function _l(t){var x;let e=Number(E(y.temp(t))),a=Number((x=E(y.effectiveSetpoint(t)))!=null?x:E(y.setpoint(t))),o=Number.isFinite(e)?e:a;if(!Number.isFinite(o)||!Number.isFinite(a))return[];let r=kt(t)==="calling",n=t*17,s=o-.4,c=o+.4,u=o-.35-n%6*.07,m=[];for(let l=0;l<24;l+=1){let f=Math.max(0,Math.sin((l-6)/12*Math.PI))*.22,v=l<7||l>21?-.12:0,w=r||u<a-.2?.16:.05;u+=(a-u)*w+f+v+Math.sin((l+n)*.55)*.05,u=Math.min(c+.15,Math.max(s-.15,u)),m.push(+u.toFixed(2))}return m[23]=+Number(o).toFixed(2),m}function ls(t){var m;let e=_l(t);if(!e.length)return"";let a=kt(t)==="calling"?"var(--accent)":"var(--forest)",o=e[0],r=e[e.length-1],n=Math.min(...e),s=Math.max(...e),c=r-o,u=Number((m=E(y.effectiveSetpoint(t)))!=null?m:E(y.setpoint(t)));return`${kl(e,a,{className:"spark spark-lg",w:360,h:128,stroke:1.8,ref:u})}
    <div class="trend-meta">
      <span>24h</span>
      <span>${n.toFixed(1)}\u2013${s.toFixed(1)}\xB0</span>
      <span>${c>.05?"+":""}${c.toFixed(1)}\xB0</span>
    </div>`}var Sl=`
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
`;$("zone-detail",Sl);var zl=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    ${Vo({remaining:"",hint:p("zone.override.hint")})}
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
`,tn=5,an=35,cs=.5;function Cl(t){let e=Number(E(y.setpoint(t)));return Number.isFinite(e)?e:null}function on(t){let e=Number(E(y.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function ds(t){let e=Number(E(y.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let a=Cl(t);return a==null?null:Number((a+on(t)).toFixed(1))}function Qo(t){return Math.min(an,Math.max(tn,Number(Number(t).toFixed(1))))}function en(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Ml(t,e){if(!e)return p("common.disabled");let a=String(t||"IDLE").toUpperCase();return a==="HEATING"?p("state.heating"):a==="IDLE"?p("state.idle"):a==="OFF"?p("state.off"):a==="FAULT"?p("common.fault"):a==="MANUAL"?p("state.manual"):a==="OVERHEATED"?p("state.overheated"):a==="CALIBRATING"?p("state.calibrating"):a}function Ll(t,e){return e?kt(t)==="calling"?p("state.heating"):p("state.idle"):p("state.off")}var ku=H({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:zl,methods:{update(t,e){let a=D("selectedZone"),o=String(A(y.state(a))||"").toUpperCase(),r=be(y.enabled(a)),n=ds(a),s=E(y.temp(a));this.zone=a,t.dataset.zone=String(a),e.dial&&Bo(e.dial,{target:n,current:s,disabled:!r,states:["idle","idle","idle","idle","idle","idle"],selected:-1});let c=Number(E(y.coordinatorRemaining(a))),u=E(y.coordinatorOffset(a)),m=Number.isFinite(c)&&c>0||Number.isFinite(u)&&Math.abs(u)>.05,x=u==null?"\u2014":(u>0?"+":"")+Number(u).toFixed(1)+"\xB0";Uo(t,{remaining:m?p("zone.override.remaining",{offset:x,remaining:qt(Math.max(0,c||0))}):"",hint:p("zone.override.hint")});let l=en(n);if(e.setpoint.textContent=l,e.temp.textContent=en(s),e.demand.textContent=Ll(a,r),e.slider&&(Number.isFinite(n)&&(e.slider.value=String(n)),e.slider.disabled=!r,Ua(e.slider)),e.sliderValue&&(e.sliderValue.textContent=l),e.chart&&(e.chart.innerHTML=ls(a)),e.badge){let f=e.badge;f.textContent=Ml(o,r);let v=r?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";f.className="zd-badge"+(v?" "+v:"")}},stepSetpoint(t){let e=this.zone,a=ds(e),o=Qo((a==null?20:a)+t);To(e,Qo(o-on(e)))},setApplied(t){let e=this.zone;To(e,Qo(t-on(e)))}},onMount(t,e){let a=e.querySelector(".zd-dial-slot");a.innerHTML=qo({id:"zone-detail-dial",markHtml:ba({states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:"zone-detail-halo"}),target:20,current:null,min:tn,max:an,step:cs,unit:"C",label:"Zone setpoint"});let o=e.querySelector(".zd-slider-slot");o.innerHTML=Wo({min:tn,max:an,step:cs,value:21,label:"Comfort setpoint"});let r={dial:a.querySelector(".lds-dial"),temp:e.querySelector(".zd-temp"),setpoint:e.querySelector(".zd-setpoint"),demand:e.querySelector(".zd-demand"),badge:e.querySelector(".zd-badge"),slider:e.querySelector("[data-comfort-slider]"),sliderValue:e.querySelector("[data-slider-value]"),chart:e.querySelector(".zd-chart")};jo(r.dial,{onStep:c=>t.stepSetpoint(c)}),r.slider.addEventListener("input",()=>{let c=parseFloat(r.slider.value);Number.isFinite(c)&&(Ua(r.slider),r.sliderValue.textContent=en(c),t.setApplied(c))});let n=()=>t.update(e,r),s=c=>{let u=D("selectedZone");(/(?:text_sensor-zone_\d+_state|switch-zone_\d+_enabled|sensor-zone_\d+_valve_pct)$/.test(c)||c===y.temp(u)||c===y.setpoint(u)||c===y.baseSetpoint(u)||c===y.effectiveSetpoint(u)||c===y.coordinatorOffset(u)||c===y.coordinatorRemaining(u))&&n()};for(let c=1;c<=6;c++)L(y.temp(c),s),L(y.setpoint(c),s),L(y.baseSetpoint(c),s),L(y.effectiveSetpoint(c),s),L(y.coordinatorOffset(c),s),L(y.coordinatorRemaining(c),s),L(y.valve(c),s),L(y.state(c),s),L(y.enabled(c),s);L("sensor-manifold_return_temperature",n),W("selectedZone",n),R(e),n()}});var Al=`
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
`;$("zone-sensor-card",Al);var El=()=>`
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
  `;function Tl(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":t==="External"||t==="EXTERNAL"?"External":"Local Probe"}function Fl(t){return t==="BLE Sensor"?"BLE":t==="External"?"External":"Local Probe"}function ps(t,e){let a='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+p("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+p("zone.sensor.bleSource")+'</option><option value="External" data-i18n="zone.sensor.externalSource">'+p("zone.sensor.externalSource")+"</option>";t.innerHTML!==a&&(t.innerHTML=a),t.value=e}var Tu=H({tag:"zone-sensor-card",render:El,onMount(t,e){let a=e.querySelector(".zs-source"),o=e.querySelector(".zs-ble"),r=e.querySelector(".zs-row-ble"),n=e.querySelector(".zs-row-ext"),s=e.querySelector(".zs-sid"),c=e.querySelector(".zs-sname"),u=e.querySelector(".zs-age"),m=e.querySelector(".zs-scan"),x=e.querySelector(".zs-scan-list"),l=0;function f(){return D("selectedZone")}function v(){let b=a.value;r.style.display=b==="BLE Sensor"?"":"none",n.style.display=b==="External"?"":"none"}let w=Ae(e,{immediate:!0});ps(a,"Local Probe"),w.select(a,{read:()=>Tl(String(A(y.tempSource(f()))||"")),commit:b=>lt(f(),"zone_temp_source",Fl(b))}),w.text(o,{read:()=>A(y.ble(f()))||"",commit:b=>Ot(f(),"zone_ble_mac",b)}),w.text(s,{read:()=>A(y.sensorId(f()))||"",commit:b=>Ot(f(),"zone_sensor_id",b)}),w.text(c,{read:()=>A(y.sensorName(f()))||"",commit:b=>Ot(f(),"zone_sensor_name",b)}),a.addEventListener("change",v);function C(){let b=f(),d=Number(E(y.externalAge(b)));if(!Number.isFinite(d)||d<0){u.textContent=p("zone.sensor.noIngestYet");return}let g=Math.round(d/1e3);u.textContent=p("zone.sensor.lastIngestAge",{sec:g})}function z(){let b=f();l!==b?(l=b,x.style.display="none",w.discard()):w.refresh(),v(),C()}m.addEventListener("click",()=>{m.disabled=!0,m.textContent=p("zone.sensor.scanning"),x.style.display="",x.innerHTML='<div class="scan-msg">'+p("zone.sensor.scanning")+"</div>";let b=new AbortController,d=setTimeout(()=>b.abort(),8e3);fetch("/api/v1/ble-scan",{signal:b.signal}).then(g=>g.json()).then(g=>{clearTimeout(d),m.disabled=!1,m.textContent=p("zone.sensor.scan");let h=g&&g.data&&g.data.sensors||g.sensors||[];if(!h.length){x.innerHTML='<div class="scan-msg">'+p("zone.sensor.noSensors")+"</div>";return}let S=(A(y.ble(f()))||"").toUpperCase();x.innerHTML=h.map(F=>{let j=String(F.mac||"").toUpperCase(),I="";j===S?I='<span class="ble-badge">'+p("zone.sensor.assignedThisZone")+"</span>":F.zone>0&&(I='<span class="ble-badge">'+p("zone.sensor.zoneBadge",{zone:F.zone})+"</span>");let Q=Number.isFinite(Number(F.temp_c))?Number(F.temp_c).toFixed(1)+"\xB0C":"\u2014",ne=F.name?String(F.name):"";return`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${j}</div>
                <div class="ble-meta">${ne?ne+" \xB7 ":""}${Q} \xB7 ${F.rssi||"?"} dBm ${I}</div>
              </div>
              <button class="btn-assign" data-mac="${j}">${p("zone.sensor.assign")}</button>
            </div>`}).join(""),x.querySelectorAll(".btn-assign").forEach(F=>{F.addEventListener("click",()=>{let j=F.getAttribute("data-mac")||"",I=f();o.value=j,a.value="BLE Sensor",v(),Ot(I,"zone_ble_mac",j),lt(I,"zone_temp_source","BLE"),w.refresh()})})}).catch(g=>{clearTimeout(d),m.disabled=!1,m.textContent=p("zone.sensor.scan");let h=g&&g.name==="AbortError"?p("zone.sensor.scanTimeout"):p("zone.sensor.scanFailed");x.innerHTML='<div class="scan-msg">'+h+"</div>"})});function _(b){let d=f();([y.tempSource(d),y.ble(d),y.sensorId(d),y.sensorName(d),y.externalAge(d)].indexOf(b)>=0||/^select-zone_\d+_temp_source$/.test(b)||/^text-zone_\d+_(ble_mac|sensor_id|sensor_name)$/.test(b)||/^sensor-zone_\d+_external_temp_age_ms$/.test(b))&&(w.refresh(),v(),C())}z(),W("selectedZone",z);for(let b=1;b<=6;b++)L(y.tempSource(b),_),L(y.ble(b),_),L(y.sensorId(b),_),L(y.sensorName(b),_),L(y.externalAge(b),_);}});var Nl=".zone-coordination-card { height: 100%; }";$("zone-coordination-card",Nl);var Rl=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.sensor.mergeWith">Merge with zone</span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function us(t,e){let a=t.value,o='<option value="None" data-i18n="common.none">'+p("common.none")+"</option>";for(let r=1;r<=6;r++)r!==e&&(o+='<option value="Zone '+r+'">'+p("common.zone")+" "+r+"</option>");t.innerHTML=o,t.value=a||"None"}var Hu=H({tag:"zone-coordination-card",render:Rl,onMount(t,e){let a=e.querySelector(".zc-sync"),o=0;function r(){return D("selectedZone")}let n=Ae(e,{immediate:!0});n.select(a,{read:()=>A(y.syncTo(r()))||"None",commit:u=>lt(r(),"zone_sync_to",u)});function s(){let u=r();o!==u?(us(a,u),o=u,n.discard()):n.refresh()}function c(u){let m=r();(u===y.syncTo(m)||/^select-zone_\d+_sync_to$/.test(u))&&n.refresh()}W("selectedZone",s);for(let u=1;u<=6;u++)L(y.syncTo(u),c);R(e),s()}});var Pl=".zone-room-card { height: auto; }";$("zone-room-card",Pl);var Dl=15,$l=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Zone friendly name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="${Dl}" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,Gu=H({tag:"zone-room-card",render:$l,onMount(t,e){let a=e.querySelector(".zr-friendly");function o(){return D("selectedZone")}let r=Ae(e,{immediate:!0});r.text(a,{read:()=>So(o())||"",commit:s=>sr(o(),s)});function n(s){let c=o();(s===y.name(c)||/^text-zone_\d+_name$/.test(s))&&r.refresh()}W("selectedZone",()=>{r.discard()}),W("zoneNames",r.refresh);for(let s=1;s<=6;s++)L(y.name(s),n);R(e),r.refresh()}});var Il=`
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
`;$("zone-actuator-card",Il);function ms(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function gs(t){return t!=null?Number(t).toFixed(0):"---"}function Ol(t){return t!=null?Number(t).toFixed(2)+"C":"---"}var Hl=()=>`
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
`,om=H({tag:"zone-actuator-card",render:Hl,onMount(t,e){var u,m,x;let a=Number(D("selectedZone")||1),o={orip:e.querySelector(".za-orip"),crip:e.querySelector(".za-crip"),ofac:e.querySelector(".za-ofac"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function r(){a=Number(D("selectedZone")||1),o.orip.textContent=gs(E(y.motorOpenRipples(a))),o.crip.textContent=gs(E(y.motorCloseRipples(a))),o.ofac.textContent=ms(E(y.motorOpenFactor(a))),o.cfac.textContent=ms(E(y.motorCloseFactor(a))),o.ph.textContent=Ol(E(y.preheatAdvance(a)));let l=String(A(y.motorLastFault(a))||"").toUpperCase(),f=l&&l!=="NONE"&&l!=="OK";o.fault.hidden=!f,f&&(o.faultVal.textContent=l)}let n=null;function s(l,f){o.status.textContent=l,o.status.className="za-status show "+(f?"ok":"err"),clearTimeout(n),n=setTimeout(()=>{o.status.classList.remove("show")},4e3)}function c(l,f){let v=l(a);s(f,!0),v&&typeof v.then=="function"&&v.then(w=>{w&&w.ok===!1&&s(p("diagnostics.recovery.rejected"),!1)}).catch(()=>s(p("diagnostics.recovery.unreachable"),!1))}(u=o.faultBtn)==null||u.addEventListener("click",()=>{c(dr,"\u2713 "+p("diagnostics.recovery.faultSent",{zone:Me(a)}))}),(m=o.factorsBtn)==null||m.addEventListener("click",()=>{confirm(p("diagnostics.recovery.confirmFactors",{zone:Me(a)}))&&c(Ba,"\u2713 "+p("diagnostics.recovery.factorsReset",{zone:Me(a)}))}),(x=o.relearnBtn)==null||x.addEventListener("click",()=>{confirm(p("diagnostics.recovery.confirmRelearn",{zone:Me(a)}))&&c(pr,"\u2713 "+p("diagnostics.recovery.relearnStarted",{zone:Me(a)}))}),W("selectedZone",r);for(let l=1;l<=6;l++)L(y.motorOpenRipples(l),r),L(y.motorCloseRipples(l),r),L(y.motorOpenFactor(l),r),L(y.motorCloseFactor(l),r),L(y.preheatAdvance(l),r),L(y.motorLastFault(l),r);R(e),r()}});var ql={1:{label:"E",color:"var(--danger)"},2:{label:"W",color:"var(--warn)"},3:{label:"I",color:"var(--ok)"},4:{label:"C",color:"var(--info)"},5:{label:"D",color:"var(--text-muted)"},6:{label:"V",color:"var(--text-faint)"},7:{label:"VV",color:"var(--text-faint)"}},Bl=`
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
`;$("logs-view",Bl);var jl=()=>`
  <div class="logs-view">
    <div class="logs-stream"></div>
    <div class="actions">
      <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
      <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      <button class="btn bottom-btn" type="button" data-i18n="logs.scrollBottom">Scroll to bottom</button>
    </div>
  </div>
`;function Vl(t){let e=ql[t.level]||{label:"?",color:"var(--text-secondary)"},a=bs(t.tag||""),o=bs(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+a+'</span><span class="msg">'+o+"</span></div>"}function bs(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var dm=H({tag:"logs-view",render:jl,onMount(t,e){let a=e.querySelector(".logs-stream"),o=e.querySelector(".pause-btn"),r=e.querySelector(".clear-btn"),n=e.querySelector(".download-btn"),s=e.querySelector(".bottom-btn"),c=!1;function u(){a.scrollTop=a.scrollHeight}function m(){if(c)return;let x=Da();if(!x||!x.length){a.innerHTML='<div class="logs-empty">'+p("logs.waiting")+"</div>";return}let l=a.scrollHeight-a.scrollTop-a.clientHeight<40;a.innerHTML=x.map(Vl).join(""),l&&u()}o.addEventListener("click",()=>{c=!c,o.textContent=c?p("logs.resume"):p("logs.pause"),o.classList.toggle("on",c),c||m()}),r.addEventListener("click",()=>{On()}),n.addEventListener("click",()=>{n.disabled=!0,wr().catch(x=>{console.error("[Logs] download failed:",x),window.alert(p("logs.downloadFailed"))}).finally(()=>{n.disabled=!1})}),s.addEventListener("click",()=>{u()}),W("deviceLog",m),R(e),m()}});var Ul=`
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
}`;$("diag-i2c",Ul);var Wl=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,hm=H({tag:"diag-i2c",render:Wl,onMount(t,e){let a=e.querySelector("#i2c-result");function o(){a.textContent=D("i2cResult")||p("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{or()}),W("i2cResult",o),R(e),o()}});var Kl=`
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
`;$("diag-manual-badge",Kl);var Zl=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,_m=H({tag:"diag-manual-badge",render:Zl,onMount(t,e){let a=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function o(){let r=!!D("manualMode");a&&a.classList.toggle("on",r)}W("manualMode",o),R(e),o()}});var Gl=`
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
`;$("diag-zone-motor",Gl);var Xl=t=>{let e=t.zone||D("selectedZone")||1,a="";for(let o=1;o<=6;o++)a+='<option value="'+o+'"'+(o===e?" selected":"")+">"+p("common.zone")+" "+o+"</option>";return`
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
  `},Tm=H({tag:"diag-zone-motor-card",render:Xl,onMount(t,e){let a=Number(t.zone||D("selectedZone")||1),o=!!D("manualMode"),r=e.querySelector(".manual-mode-toggle"),n=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),c=e.querySelector(".motor-target-input"),u=e.querySelector(".motor-open-btn"),m=e.querySelector(".motor-close-btn"),x=e.querySelector(".motor-stop-btn"),l=()=>{let C=s.value||String(a),z="";for(let _=1;_<=6;_++)z+='<option value="'+_+'">'+p("common.zone")+" "+_+"</option>";s.innerHTML=z,s.value=C};function f(C){o=!!C,r&&(r.classList.toggle("on",o),r.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[s,c,u,m,x].forEach(z=>{z&&(z.disabled=!o)})}function v(){let C=!o;f(C);let z=()=>{};if(C){da(!0).catch(z);for(let _=1;_<=6;_++)Fo(_).catch(z)}else da(!1).catch(z)}function w(){let C=E(y.motorTarget(a));c&&C!=null?c.value=Number(C).toFixed(0):c&&(c.value="0")}s==null||s.addEventListener("change",()=>{a=Number(s.value||1),w()}),r==null||r.addEventListener("click",v),r==null||r.addEventListener("keydown",C=>{C.key!==" "&&C.key!=="Enter"||(C.preventDefault(),v())});for(let C=1;C<=6;C++)L(y.motorTarget(C),w);w(),f(o),W("manualMode",()=>{f(!!D("manualMode"))}),R(e),c==null||c.addEventListener("change",C=>{if(!o)return;let z=C.target.value;ir(a,z)}),u==null||u.addEventListener("click",()=>{o&&Ha(a,1e4)}),m==null||m.addEventListener("click",()=>{o&&qa(a,1e4)}),x==null||x.addEventListener("click",()=>{o&&Fo(a)})}});var Nt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function fa(t){switch(Number(t)){case Nt.CONTACT:return"contact";case Nt.UNDER_LOAD:return"load";case Nt.STOPPING:return"stopping";default:return"free"}}function ln(t){let e=t||[];for(let a=0;a<e.length;a++){let o=Number(e[a].stroke_phase)||0;if(o===Nt.CONTACT||o===Nt.UNDER_LOAD)return e[a]}return null}function nn(t,e,a){if(e[a]==null)return null;let o=Number(t[e[a]]);return Number.isFinite(o)?o:null}function cn(t){let e=String(t||"").split(/\r?\n/).filter(n=>n.trim());if(e.length<2)return[];let a=e[0].split(",").map(n=>n.trim()),o={};for(let n=0;n<a.length;n++)o[a[n]]=n;let r=[];for(let n=1;n<e.length;n++){let s=e[n].split(",");if(s.length<6)continue;let c=u=>Number(s[o[u]]);r.push({t_ms:c("t_ms")||0,motion_count:c("motion_count")||0,current_ma:c("current_ma"),adc_current_raw:nn(s,o,"adc_current_raw"),drive_on:c("drive_on")===1,direction_open:c("direction_open")===1,armed:c("armed")===1,stroke_phase:c("stroke_phase")||0,tacho_period_us:nn(s,o,"tacho_period_us"),tacho_amp_raw:nn(s,o,"tacho_amp_raw")})}return r}function ro(t){let e=t.filter(a=>Number.isFinite(a));return e.length?e.reduce((a,o)=>a+o,0)/e.length:null}function rn(t){let e=0,a=0;for(let o of t)o===!0?e+=1:o===!1&&(a+=1);return!e&&!a?null:e>=a}function dn(t,e=2){let a=(t||[]).filter(s=>s&&Number.isFinite(s.t_ms)).slice().sort((s,c)=>s.t_ms-c.t_ms);if(!a.length)return[];let o=Math.max(1,Math.round(1e3/Math.max(.1,e))),r=[],n=0;for(;n<a.length;){let s=Math.floor(a[n].t_ms/o)*o,c=s+o,u=n;for(;u<a.length&&a[u].t_ms<c;)u+=1;let m=a.slice(n,u),x=m[m.length-1];r.push({t_ms:s+Math.floor(o/2),motion_count:Math.max(...m.map(l=>Number(l.motion_count)||0)),current_ma:ro(m.map(l=>l.current_ma)),adc_current_raw:ro(m.map(l=>l.adc_current_raw)),drive_on:rn(m.map(l=>!!l.drive_on))===!0,direction_open:rn(m.map(l=>!!l.direction_open))===!0,armed:rn(m.map(l=>!!l.armed))===!0,stroke_phase:Math.max(...m.map(l=>Number(l.stroke_phase)||0)),tacho_period_us:ro(m.map(l=>l.tacho_period_us)),tacho_amp_raw:ro(m.map(l=>l.tacho_amp_raw)),_bucket_n:m.length}),n=u}return r}function pn(t,e,a=6e4,o=2){let r=new Map;for(let m of t||[])m&&Number.isFinite(m.t_ms)&&r.set(m.t_ms,m);for(let m of dn(e||[],o))m&&Number.isFinite(m.t_ms)&&r.set(m.t_ms,m);let n=Array.from(r.values()).sort((m,x)=>m.t_ms-x.t_ms);if(!n.length||!(a>0))return n;let c=n[n.length-1].t_ms-a,u=0;for(;u<n.length&&n[u].t_ms<c;)u+=1;return u?n.slice(u):n}var Yl="t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw";function Wt(t){return t==null||t===""?"":typeof t=="boolean"?t?"1":"0":typeof t=="number"?Number.isFinite(t)?String(t):"":String(t)}function Jl(t){let e=[Yl];for(let a of t||[])e.push([Wt(a.t_ms),Wt(a.motion_count),Number.isFinite(a.current_ma)?a.current_ma.toFixed(1):"",Wt(a.adc_current_raw),a.drive_on?"1":"0",a.direction_open?"1":"0",a.armed?"1":"0",Wt(a.stroke_phase||0),Wt(a.tacho_period_us),Wt(a.tacho_amp_raw)].join(","));return e.join(`
`)+`
`}function fs(t,e){let a=new Blob([Jl(t)],{type:"text/csv;charset=utf-8"}),o=URL.createObjectURL(a),r=document.createElement("a");r.href=o,r.download=e||"lune-v6-motor-trace.csv",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function Ql(t){let e=0,a=0;for(let o=0;o<t.length;o++)t[o].drive_on&&(t[o].direction_open?e+=1:a+=1);return e>=a?"open":"close"}function ec(t,e){if(!t.length)return null;let a=t.slice().sort((r,n)=>r-n),o=Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*e)));return a[o]}function Ie(t){return Math.round(t*10)/10}function sn(t,e,a){return Math.min(a,Math.max(e,t))}function tc(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function hs(t){let e=[];if(!t.length)return e;let a=t[0].t_ms,o=t[t.length-1].t_ms;for(let r=a;r+500<=o;r+=500){let n=t.reduce((u,m)=>Math.abs(m.t_ms-r)<Math.abs(u.t_ms-r)?m:u,t[0]),s=t.reduce((u,m)=>Math.abs(m.t_ms-(r+500))<Math.abs(u.t_ms-(r+500))?m:u,t[0]),c=(s.t_ms-n.t_ms)/1e3;c>.2&&e.push({t_ms:r+500,slope:(s.current_ma-n.current_ma)/c})}return e}function ha(t){let e=t||[],a=[];for(let s=0;s<e.length;s++){let c=e[s],u=c.tacho_period_us!=null?c.tacho_period_us:c.tacho_cadence_us!=null?c.tacho_cadence_us:null;a.push({t_ms:c.t_ms,period_us:u,rate_hz:tc(u)})}let o=e.filter(s=>s.drive_on&&Number.isFinite(s.current_ma)),r=o.length>=2?o:e.filter(s=>Number.isFinite(s.current_ma)),n=hs(r);return{cadence:a,slopes:n,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function vs(t,e){let a=e||Ql(t),o=t.filter(X=>X.drive_on&&Number.isFinite(X.current_ma)&&(a==="open"?X.direction_open:!X.direction_open));if(o.length<8)return{direction:a,ok:!1,reason:"too_few_samples"};let r=o[0].t_ms,n=o[o.length-1].t_ms,s=o.filter(X=>X.t_ms>=r+650),c=s.length>12?s:o,u=Math.max(1,n-(c[0]?c[0].t_ms:r)),m=c.filter(X=>X.t_ms<c[0].t_ms+u*.7),x=c.filter(X=>X.t_ms>=c[0].t_ms+u*.8),l=(m.length?m:c).map(X=>X.current_ma),f=(x.length?x:c.slice(-Math.max(4,c.length/8|0))).map(X=>X.current_ma),v=l.reduce((X,Ue)=>X+Ue,0)/l.length,w=Math.max(...o.map(X=>X.current_ma)),C=Math.max(...f),z=Math.max(0,o[o.length-1].motion_count-o[0].motion_count),_=hs(c),b=_.filter(X=>X.t_ms<c[0].t_ms+u*.7).map(X=>X.slope),d=_.filter(X=>X.t_ms>=c[0].t_ms+u*.75).map(X=>X.slope),g=d.length?Math.max(...d):0,h=ec(b.map(Math.abs),.9)||0,S=a==="close"?.55:.68,F=v>.5?C/v:0,j=Math.max(...o.map(X=>Number(X.stroke_phase)||0)),I=nc(c,ac),Q=a==="open"?F>=1.35||j>=Nt.STOPPING:I>=oc||j>=Nt.UNDER_LOAD,ne=Ie(sn(1+S*Math.max(0,F-1),1.25,2.4)),se=Ie(sn(Math.max(h*2.2,g*.42,a==="open"?.15:.4),.15,8)),V=Ie(sn(1+.35*Math.max(0,F-1),1.15,1.8)),K=a==="open"?1.15:null,pe=ln(o);return{direction:a,ok:Q,reason:Q?null:"no_endstop",start_ms:r,end_ms:n,runtime_ms:n-r,mean_ma:Ie(v),peak_ma:Ie(w),stall_peak_ma:Ie(C),ripples:z,max_stall_slope_ma_s:Ie(g),travel_slope_ma_s:Ie(h),measured_factor:Ie(F),max_trailing_step_ma:Ie(I),endstop_seen:Q,suggested_factor:ne,suggested_slope:se,suggested_slope_floor:V,suggested_ripple_limit:K,pin_seen:!!pe,pin_t_ms:pe?pe.t_ms:null,pin_motion_count:pe?pe.motion_count:null,pin_current_ma:pe?Ie(pe.current_ma):null,samples:o}}var ac=2e3,oc=2.5;function nc(t,e){let a=0,o=0;for(let r=0;r<t.length;r+=1){for(;o<r&&t[r].t_ms-t[o].t_ms>e;)o+=1;if(o>0||t[r].t_ms-t[0].t_ms>=e){let n=t[r].current_ma-t[o].current_ma;n>a&&(a=n)}}return a}function xs(t,e){if(!t||!t.ok)return[];let a=t.mean_ma,o=Number(e&&e.factor)||t.suggested_factor,r=[{id:"mean",value:a},{id:"threshold",value:Ie(a*o)},{id:"suggested",value:Ie(a*t.suggested_factor)}],n=e&&e.caps||{},s=Number(t.direction==="open"?n.open:n.seat),c=Number(n.stall);return Number.isFinite(s)&&s>0&&r.push({id:"cap",value:Ie(s)}),Number.isFinite(c)&&c>0&&r.push({id:"stall",value:Ie(c)}),r}var va=920,xa=200,ys=56,ue={t:16,r:18,b:32,l:52},Qe=va-ue.l-ue.r,Zt=xa-ue.t-ue.b,un="var(--accent)",bn="var(--series-cool)",rc="var(--state-warn)",sc="var(--state-ok)",ic="var(--state-danger)",lc="var(--text-faint)",so="var(--state-warn)",mn="var(--series-cool)",gn="var(--accent)",cc="var(--state-ok)",ws={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},ks={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},dc=`
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
`;$("motor-lab-charts",dc);function Kt(t,e,a=Zt){let o=e.max-e.min||1;return ue.t+a-(t-e.min)/o*a}function io(t,e,a,o=xa){t.appendChild(O("text",{class:"chart-axis-label",x:ue.l,y:o-8},"0 s")),t.appendChild(O("text",{class:"chart-axis-label",x:ue.l+Qe-48,y:o-8},(a/1e3).toFixed(1)+" s"))}function fn(t,e,a=Zt){for(let o=0;o<=4;o++){let r=ue.t+a*o/4;t.appendChild(O("line",{class:"chart-grid",x1:ue.l,x2:ue.l+Qe,y1:r,y2:r}));let n=e.max-(e.max-e.min)*o/4;t.appendChild(O("text",{class:"chart-tick",x:8,y:r+4},n.toFixed(0)))}}function pc(t){if(!t.length)return[];let e=[],a=0,o=Number(t[0].stroke_phase)||0;for(let r=1;r<t.length;r++){let n=Number(t[r].stroke_phase)||0;n!==o&&(e.push({phase:o,start:a,end:r-1}),a=r,o=n)}return e.push({phase:o,start:a,end:t.length-1}),e}function uc(t){let e=t.querySelector("defs");return e||(e=O("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([o,r,n])=>{let s=O("pattern",{id:o,width:4,height:4,patternUnits:"userSpaceOnUse"});s.appendChild(O("path",{d:r,stroke:n,"stroke-width":"1",fill:"none"})),e.appendChild(s)}),t.appendChild(e),e)}function ya(t,e,a){let o=document.createElement("div");o.className="chart-card",o.setAttribute("role","img"),o.setAttribute("aria-label",p(a||t));let r=document.createElement("div");return r.className="chart-head",r.innerHTML='<span class="chart-title">'+p(t)+'</span><span class="chart-sub">'+e+"</span>",o.appendChild(r),o}function mc(t,e,a){let o=ya(e,p(a||"diagnostics.lab.empty"),e),r=document.createElement("div");r.className="lab-empty",r.textContent=p("diagnostics.lab.empty"),o.appendChild(r),t.appendChild(o)}function lo(t,e,a){return t?p("diagnostics.lab.res.live"):a&&a.truncated?p("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?p("diagnostics.lab.res.trace",{direction:p("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):p("diagnostics.lab.res.traceReady")}function gc(t,e,a,o,r,n){if(!n.current&&!n.overlays)return;let s=ha(e),c=ya("diagnostics.lab.chart.current",lo(r,a,s),"diagnostics.lab.chart.currentAria");if(s.truncated){let _=document.createElement("div");_.className="lab-chart-warn",_.textContent=p("diagnostics.lab.res.ringWarn",{n:2e3,s:s.window_ms/1e3}),c.appendChild(_)}if(!e.length){let _=document.createElement("div");_.className="lab-empty",_.textContent=p("diagnostics.lab.empty"),c.appendChild(_),t.appendChild(c);return}let u=e.map(_=>_.current_ma).filter(Number.isFinite),m=(o||[]).map(_=>_.value).filter(Number.isFinite),x=Ya(u.concat([0,40],m),0,50);x.min=0;let l=e[0].t_ms,f=Math.max(1,e[e.length-1].t_ms-l),v=_=>ue.l+(e[_].t_ms-l)/f*Qe,w=e.map((_,b)=>({x:v(b),y:Kt(_.current_ma,x)})),C=O("svg",{viewBox:"0 0 "+va+" "+xa,role:"img"});if(fn(C,x),io(C,l,f),n.overlays){let _={mean:bn,threshold:rc,suggested:sc,cap:ic,stall:lc};(o||[]).forEach(b=>{let d=Kt(b.value,x);C.appendChild(O("line",{x1:ue.l,x2:ue.l+Qe,y1:d,y2:d,stroke:_[b.id],"stroke-dasharray":b.id==="mean"?"0":"5 4","stroke-width":b.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:b.id==="cap"||b.id==="stall"?".45":".9"}))})}let z=a&&a.ok&&a.pin_seen?{t_ms:a.pin_t_ms,current_ma:a.pin_current_ma,motion_count:a.pin_motion_count,stroke_phase:1}:ln(e);if(z&&Number.isFinite(z.t_ms)){let _=ue.l+(z.t_ms-l)/f*Qe;C.appendChild(O("line",{x1:_,x2:_,y1:ue.t,y2:ue.t+Zt,stroke:so,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),C.appendChild(O("circle",{cx:_,cy:Kt(Number(z.current_ma)||0,x),r:4.2,fill:so,stroke:"var(--bg)","stroke-width":"1.5"})),C.appendChild(O("text",{class:"chart-tick",x:Math.min(_+6,ue.l+Qe-64),y:ue.t+12,fill:so},p("diagnostics.lab.pinMark")))}n.current&&C.appendChild(O("path",{d:Bt(w),fill:"none",stroke:un,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),c.appendChild(C),t.appendChild(c),dt(C,c,{count:e.length,plotTop:ue.t,plotBottom:ue.t+Zt,xAt:v,label:_=>((e[_].t_ms-l)/1e3).toFixed(2)+" s",dots:_=>n.current?[{y:w[_].y,color:un}]:[],rows:_=>[{color:un,label:p("diagnostics.lab.currentMa"),value:Number(e[_].current_ma).toFixed(1)+" mA"},{color:bn,label:p("diagnostics.lab.motion"),value:String(e[_].motion_count)},{color:so,label:p("diagnostics.lab.stroke"),value:p("diagnostics.lab.stroke."+fa(e[_].stroke_phase))}]})}function bc(t,e,a,o){if(!o.phase)return;let r=ha(e),n=ya("diagnostics.lab.chart.phase",lo(a,null,r),"diagnostics.lab.chart.phaseAria");if(!e.length){let f=document.createElement("div");f.className="lab-empty",f.textContent=p("diagnostics.lab.empty"),n.appendChild(f),t.appendChild(n);return}let s=e[0].t_ms,c=Math.max(1,e[e.length-1].t_ms-s),u=ys+ue.b,m=O("svg",{viewBox:"0 0 "+va+" "+u,class:"lab-phase-strip",role:"img"});uc(m);let x=10,l=ys-18;pc(e).forEach(f=>{let v=ue.l+(e[f.start].t_ms-s)/c*Qe,w=ue.l+(e[f.end].t_ms-s)/c*Qe,C=fa(f.phase),z=Math.max(2,w-v);m.appendChild(O("rect",{x:v,y:x,width:z,height:l,fill:ws[C]||ws.free,stroke:"var(--separator)","stroke-width":"1"})),ks[C]&&m.appendChild(O("rect",{x:v,y:x,width:z,height:l,fill:"url(#"+ks[C]+")",opacity:".55"})),z>54&&m.appendChild(O("text",{x:v+6,y:x+l/2+3},p("diagnostics.lab.stroke."+C))),m.appendChild(O("line",{x1:w,x2:w,y1:x,y2:x+l,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),io(m,s,c,u),n.appendChild(m),t.appendChild(n)}function fc(t,e,a,o){if(!o.cadence)return;let r=ha(e),n=ya("diagnostics.lab.chart.cadence",lo(a,null,r),"diagnostics.lab.chart.cadenceAria"),s=r.cadence.map(v=>v.rate_hz).filter(v=>v!=null&&Number.isFinite(v));if(!s.length){let v=document.createElement("div");v.className="lab-empty",v.textContent=p("diagnostics.lab.chart.cadenceEmpty"),n.appendChild(v),t.appendChild(n);return}let c=Ya(s.concat([0]),0,Math.max(10,...s));c.min=0;let u=e[0].t_ms,m=Math.max(1,e[e.length-1].t_ms-u),x=[],l=[];r.cadence.forEach((v,w)=>{v.rate_hz==null||!Number.isFinite(v.rate_hz)||(x.push({x:ue.l+(v.t_ms-u)/m*Qe,y:Kt(v.rate_hz,c)}),l.push(w))});let f=O("svg",{viewBox:"0 0 "+va+" "+xa,role:"img"});fn(f,c),io(f,u,m),f.appendChild(O("path",{d:Bt(x),fill:"none",stroke:mn,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),n.appendChild(f),t.appendChild(n),dt(f,n,{count:x.length,plotTop:ue.t,plotBottom:ue.t+Zt,xAt:v=>x[v].x,label:v=>((r.cadence[l[v]].t_ms-u)/1e3).toFixed(2)+" s",dots:v=>[{y:x[v].y,color:mn}],rows:v=>{let w=r.cadence[l[v]];return[{color:mn,label:p("diagnostics.lab.cadence"),value:w.rate_hz.toFixed(1)+" /s"},{color:bn,label:p("diagnostics.lab.tachoPeriod"),value:Math.round(w.period_us)+" \xB5s"}]}})}function hc(t,e,a,o,r){if(!r.slope)return;let n=ha(e),s=ya("diagnostics.lab.chart.slope",lo(o,a,n),"diagnostics.lab.chart.slopeAria");if(!n.slopes.length){let w=document.createElement("div");w.className="lab-empty",w.textContent=p("diagnostics.lab.chart.slopeEmpty"),s.appendChild(w),t.appendChild(s);return}let c=n.slopes.map(w=>w.slope),u=a&&a.ok?a.suggested_slope:null,m=Ya(c.concat(u!=null?[u,0]:[0]),-2,8),x=e[0].t_ms,l=Math.max(1,e[e.length-1].t_ms-x),f=n.slopes.map(w=>({x:ue.l+(w.t_ms-x)/l*Qe,y:Kt(w.slope,m)})),v=O("svg",{viewBox:"0 0 "+va+" "+xa,role:"img"});if(fn(v,m),io(v,x,l),u!=null){let w=Kt(u,m);v.appendChild(O("line",{x1:ue.l,x2:ue.l+Qe,y1:w,y2:w,stroke:cc,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}v.appendChild(O("path",{d:Bt(f),fill:"none",stroke:gn,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),s.appendChild(v),t.appendChild(s),dt(v,s,{count:f.length,plotTop:ue.t,plotBottom:ue.t+Zt,xAt:w=>f[w].x,label:w=>((n.slopes[w].t_ms-x)/1e3).toFixed(2)+" s",dots:w=>[{y:f[w].y,color:gn}],rows:w=>[{color:gn,label:p("diagnostics.lab.slope"),value:n.slopes[w].slope.toFixed(2)+" mA/s"}]})}function Ss(t,e){let a=e&&e.samples||[],o=e&&e.analysis,r=!!(e&&e.live),n=e&&e.overlays,s=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let c=document.createElement("div");c.className="motor-lab-charts";let u=document.createElement("div");return u.className="gw-controls",u.setAttribute("role","toolbar"),u.setAttribute("aria-label",p("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([x,l])=>{let f=document.createElement("button");f.type="button",f.className="gw-toggle"+(s[x]?"":" is-off"),f.dataset.layer=x,f.setAttribute("aria-pressed",s[x]?"true":"false"),f.textContent=p(l),u.appendChild(f)}),c.appendChild(u),a.length?(gc(c,a,o,n,r,s),bc(c,a,r,s),fc(c,a,r,s),hc(c,a,o,r,s)):mc(c,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(c),u}var Xt={ms:4e4,counts:3120},vc=2600,xc=3600,yc=Object.freeze({closeFactor:1.45,openFactor:1.25,stallFraction:.3,learnedStallMa:null,trailingStepMa:2.5,trailingSustainMs:1e3,trailingWindowMs:2e3,seatMa:34,seatFrames:4,popoffMa:36,popoffFrames:2,stallMa:65,stallFrames:3,openStopMa:40,openFrames:3,circuitMa:85,circuitFrames:2,closeCeilingS:34,openCeilingS:45});function zs(t,e,a){return Math.min(a,Math.max(e,t))}function wc(t){let e=(t||[]).filter(n=>n&&Number.isFinite(n.t_ms)&&Number.isFinite(n.current_ma));if(e.length<2)return[];let a=[],o=0,r=Math.ceil(e[0].t_ms/10)*10;for(let n=r;n<=e[e.length-1].t_ms;n+=10){for(;o+1<e.length&&e[o+1].t_ms<=n;)o+=1;let s=e[o],c=e[Math.min(o+1,e.length-1)],u=c.t_ms-s.t_ms,m=u>0?(n-s.t_ms)/u:0;a.push({t_ms:n,current_ma:s.current_ma+(c.current_ma-s.current_ma)*m,motion_count:(Number(s.motion_count)||0)+((Number(c.motion_count)||0)-(Number(s.motion_count)||0))*m,stroke_phase:Number(s.stroke_phase)||0})}return a}function kc(t){let e=Math.max(1,Math.floor(t.window/24)),a=[],o=0,r=0,n=0,s=!1;return{observe(c,u){let m=null;for(let f=a.length-1;f>=0;f-=1)if(c-a[f].t>=t.window){m=a[f].v;break}let x=o===0?0:c-o;o=c;let l=m==null?null:u-m;return l!=null&&l>t.step?(n+=x,n>=t.sustain&&(s=!0)):n=0,(!a.length||c-r>=e)&&(r=c,a.push({t:c,v:u}),a.length>48&&a.shift()),{rise:l,qualifying:l!=null&&l>t.step,tripped:s}}}}function Gt(t){let e=0;return a=>(e=a?e+10:0,a&&e>=t)}function Cs(t,e,a){let o=Object.assign({},yc,a||{}),r=e==="open",n=wc(t),s=n.some(b=>b.stroke_phase===0),c=null,u=0,m=kc({window:o.trailingWindowMs,step:o.trailingStepMa,sustain:o.trailingSustainMs}),x={threshold:Gt(60),seat:Gt(o.seatFrames*6.4),popoff:Gt(o.popoffFrames*6.4),stall:Gt(o.stallFrames*6.4),open:Gt(o.openFrames*6.4),circuit:Gt(o.circuitFrames*6.4)},l=r&&Number.isFinite(o.learnedStallMa),f=[],v={},w=(b,d)=>{v[b]==null&&(v[b]={t_ms:d.t_ms,motion_count:Math.round(d.motion_count),current_ma:d.current_ma})};for(let b of n){let d=b.t_ms,g=b.current_ma,h=s?b.stroke_phase===0:!0;d>=400&&h&&(c==null||g<c-.5)&&(c=zs(g,8,32),u=d);let S=c!=null&&d-u>=300,F=null;S&&(l&&o.learnedStallMa>c+5?F=zs(c+o.stallFraction*(o.learnedStallMa-c),o.openStopMa*.75,o.stallMa):F=c*(r?o.openFactor:o.closeFactor));let j=d>=650,I=d>=250,Q=!r&&j?m.observe(d,g):{rise:null,qualifying:!1,tripped:!1};if(j&&x.threshold(F!=null&&g>F)&&w("threshold",b),Q.tripped&&w("trailing",b),I)if(x.stall(g>o.stallMa)&&w("stall",b),x.circuit(g>o.circuitMa)&&w("circuit",b),!r)x.popoff(g>o.popoffMa)&&w("popoff",b),x.seat(b.stroke_phase>=2&&g>o.seatMa)&&w("seat",b);else{let V=S||d>=8e3;x.open(V&&g>o.openStopMa)&&w("openStop",b)}let ne=r?xc:vc,se=(r?o.openCeilingS:o.closeCeilingS)*1e3;(d>=se||b.motion_count>=ne)&&w("ceiling",b),!r&&(d>=Xt.ms||b.motion_count>=Xt.counts)&&w("wall",b),f.push({t_ms:d,current_ma:g,motion_count:b.motion_count,baseline_ma:c,threshold_ma:F,rise_ma:Q.rise,qualifying:Q.qualifying})}let C=r?["threshold","openStop","stall","circuit"]:["trailing","threshold","seat","popoff","stall","circuit"],z=null;for(let b of C)v[b]&&(!z||v[b].t_ms<v[z].t_ms)&&(z=b);let _=v.ceiling&&(!z||v.ceiling.t_ms<=v[z].t_ms);return{direction:r?"open":"close",params:o,series:f,trips:v,first:_?"ceiling":z,beforeWall:r||!v.wall||z!=null&&v[z].t_ms<v.wall.t_ms||!!_,usesFraction:l,baselineMa:c}}function Ms(t){let e=t.params,a=[...t.series].reverse().find(r=>r.threshold_ma!=null),o=[];return t.baselineMa!=null&&o.push({id:"baseline",ma:t.baselineMa}),a&&o.push({id:"threshold",ma:a.threshold_ma}),t.direction==="close"?o.push({id:"seat",ma:e.seatMa},{id:"popoff",ma:e.popoffMa}):o.push({id:"openStop",ma:e.openStopMa}),o.push({id:"stall",ma:e.stallMa},{id:"circuit",ma:e.circuitMa}),o}var Ls=[[250,23,24.8,2],[750,66,24.4,2],[1250,109,24.3,2],[1750,144,24.3,2],[2250,179,24.2,2],[2750,221,24.2,2],[3250,262,24.3,2],[3750,296,24.3,2],[4250,337,24.3,2],[4750,377,24.2,2],[5250,410,24.3,2],[5750,448,24.2,2],[6250,486,24.2,2],[6750,524,24.3,2],[7250,564,24.2,2],[7750,606,24.2,2],[8250,646,24.9,2],[8750,688,24.2,2],[9250,725,24.2,2],[9750,768,24.3,2],[10250,807,24.2,2],[10750,843,24.2,2],[11250,883,24.1,2],[11750,922,24,2],[12250,961,24.2,2],[12750,1e3,25.2,2],[13250,1040,25.8,2],[13750,1083,26.2,2],[14250,1117,26.2,2],[14750,1154,26.4,2],[15250,1196,26.7,2],[15750,1236,26.7,2],[16250,1271,26.8,2],[16750,1309,27.4,2],[17250,1344,28.3,2],[17750,1381,28.9,2],[18250,1425,29,2],[18750,1460,29.6,2],[19250,1484,30.3,2],[19750,1523,30.9,2],[20250,1564,32.5,2],[20750,1602,31.9,2],[21250,1645,32.1,2],[21750,1687,32.2,2],[22250,1729,33,2],[22750,1768,33.6,2],[23250,1808,31.9,2],[23750,1850,31.2,2],[24250,1897,31,2],[24750,1939,31.3,2],[25250,1982,31.2,2],[25750,2023,31.5,2],[26250,2062,31.4,2],[26750,2101,31.2,2],[27250,2136,31.3,2],[27750,2172,31.3,2],[28250,2207,31.6,2],[28750,2244,31.2,2],[29250,2288,31.3,2],[29750,2328,31.1,2],[30250,2367,31.8,2],[30750,2401,31.5,2],[31250,2439,31.2,2],[31750,2477,31.6,2],[32250,2516,31.2,2],[32750,2556,31.9,2],[33250,2588,31.5,2],[33750,2622,31.5,2],[34250,2660,31.6,2],[34750,2699,31.6,2],[35250,2739,32.1,2],[35750,2771,31.5,2],[36250,2809,31.4,2],[36750,2847,31.6,2],[37250,2888,31.9,2],[37750,2929,32.3,2],[38250,2966,32.5,2],[38750,3004,33.6,2],[39250,3037,34.5,2],[39750,3077,35.9,2],[40250,3110,36.5,2],[40750,3139,38.2,2],[41250,3171,39,2],[41750,3196,40,2],[42250,3223,40.8,2],[42750,3243,42,2],[43250,3262,43,2],[43750,3289,44.4,2],[44250,3306,44.7,2],[44750,3334,45.9,2],[45250,3351,46.2,2],[45750,3380,48.5,2],[46250,3408,47.9,2],[46750,3440,50,2],[47250,3477,49.4,2],[47750,3515,51.1,2],[48250,3546,51.2,2],[48750,3590,52.4,2],[49250,3635,53.8,2],[49750,3672,53.3,2],[50250,3715,55.3,2],[50750,3754,54.5,2],[51250,3794,56.7,2],[51750,3835,57,2],[52250,3881,57.3,2],[52750,3922,61.1,2],[53250,3966,59.5,2],[53750,3966,40,3]],As=[[3250,218,57.2,2],[3750,232,58.8,2],[4250,348,28.3,0],[4750,392,28.2,0],[5250,436,27.7,0],[5750,480,27,0],[6250,525,27.1,0],[6750,568,26.7,0],[7250,613,26.5,0],[7750,656,26.2,0],[8250,702,26.3,0],[8750,745,26.2,0],[9250,789,26.3,0],[9750,831,26.5,0],[10250,875,26.2,0],[10750,921,26.2,0],[11250,962,26.3,0],[11750,1001,26.1,0],[12250,1043,26,0],[12750,1087,26.2,0],[13250,1130,26.1,0],[13750,1170,26.2,0],[14250,1206,26.1,0],[14750,1241,26,0],[15250,1282,25.9,0],[15750,1323,26,0],[16250,1365,26,0],[16750,1408,25.9,0],[17250,1449,25.9,0],[17750,1489,25.7,0],[18250,1519,25.9,0],[18750,1551,25.8,0],[19250,1586,25.8,0],[19750,1621,25.9,0],[20250,1661,25.8,0],[20750,1702,25.9,0],[21250,1744,26,0],[21750,1783,26,0],[22250,1817,26,0],[22750,1852,25.9,0],[23250,1888,26,0],[23750,1931,25.8,0],[24250,1973,25.7,0],[24750,2012,25.5,0],[25250,2051,25.5,0],[25750,2091,25.2,0],[26250,2131,25.1,0],[26750,2165,25.2,0],[27250,2195,25,0],[27750,2235,25,0],[28250,2275,24.7,0],[28750,2315,24.7,0],[29250,2353,24.5,0],[29750,2397,24.6,0],[30250,2435,24.6,0],[30750,2467,25,0],[31250,2500,24.4,0],[31750,2542,24.5,0],[32250,2581,24.4,0],[32750,2618,24.4,0],[33250,2661,24.4,0],[33750,2699,24.4,0],[34250,2742,24.4,0],[34750,2783,24.4,0],[35250,2813,24.3,0],[35750,2843,24.4,0],[36250,2882,24.4,0],[36750,2920,24.4,0],[37250,2959,24.5,0],[37750,3e3,24.4,0],[38250,3042,24.3,0],[38750,3083,24.4,0],[39250,3115,24.4,0],[39750,3141,24.4,0],[40250,3177,24.4,0],[40750,3219,24.4,0],[41250,3257,24.4,0],[41750,3295,24.4,0],[42250,3335,24.4,0],[42750,3381,24.4,0],[43250,3417,24.5,0]];function Es(t){return t.map(([e,a,o,r])=>({t_ms:e,motion_count:a,current_ma:o,stroke_phase:r}))}var yn=920,hn=230,vn=130,ge={t:22,r:200,b:28,l:44},st=yn-ge.l-ge.r,Qt="var(--series-measured)",Ts="var(--series-cool)",pt="var(--accent)",Yt="var(--text-muted)",Fs="var(--state-warn)",wn="var(--state-danger)",Ns={baseline:{stroke:Ts,dash:"0",width:1.4},threshold:{stroke:pt,dash:"6 4",width:1.6},seat:{stroke:Yt,dash:"2 4",width:1.2},popoff:{stroke:Yt,dash:"8 3 2 3",width:1.2},openStop:{stroke:Yt,dash:"2 4",width:1.2},stall:{stroke:Yt,dash:"8 3",width:1.2},circuit:{stroke:Yt,dash:"1 3",width:1.2}},_c=`
.lab-thresholds { display:grid; gap:18px; margin:14px 0 0; }
.lab-thresholds .chart-card { padding:0; }
.lab-thresholds .lt-intro { margin:0; color:var(--text-muted); font-size:.78rem; line-height:1.45; }
.lab-thresholds .lt-verdict {
  display:flex; align-items:center; gap:8px; margin:0 0 6px;
  color:var(--text-secondary); font-size:.78rem; font-weight:650;
}
.lab-thresholds .lt-verdict[data-state="late"] { color:var(--danger-text); }
.lab-thresholds .lt-verdict[data-state="ceiling"] { color:var(--state-warn); }
.lab-thresholds .lt-verdict .lt-icon { font-weight:800; }
.lab-thresholds .lt-offscale { margin:2px 0 12px; color:var(--text-faint); font-size:.7rem; }
.lab-thresholds .lt-label { font-size:11px; fill:var(--text-secondary); font-variant-numeric:tabular-nums; }
.lab-thresholds .lt-vlabel { font-size:10px; font-weight:700; letter-spacing:.3px; }
.lab-thresholds table { width:100%; border-collapse:collapse; margin-top:8px; font-size:.74rem; }
.lab-thresholds th, .lab-thresholds td {
  padding:6px 8px; border-bottom:1px solid var(--separator); text-align:left;
  font-variant-numeric:tabular-nums;
}
.lab-thresholds th { color:var(--text-faint); font-size:.64rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.lab-thresholds td { color:var(--text-secondary); }
.lab-thresholds td:first-child { color:var(--text-strong); font-weight:650; white-space:nowrap; }
.lab-thresholds tr[data-first="true"] td { background:var(--accent-bg-soft); }
.lab-thresholds td[data-late="true"] { color:var(--danger-text); font-weight:650; }
.lab-thresholds .lt-swatch {
  display:inline-block; width:16px; height:0; margin-right:6px; vertical-align:middle;
  border-top:2px solid currentColor;
}
@media (max-width: 720px) {
  .lab-thresholds th:nth-child(4), .lab-thresholds td:nth-child(4) { display:none; }
}
`;$("motor-lab-thresholds",_c);var ea=t=>(t/1e3).toFixed(2)+" s",Jt=t=>Number(t).toFixed(1)+" mA";function Rs(t,e,a,o){let r=e-t||1;return n=>a+o-(n-t)/r*o}function xn(t){let e="",a=!1;for(let o of t){if(o==null){a=!1;continue}e+=(a?" L ":" M ")+o.x.toFixed(1)+" "+o.y.toFixed(1),a=!0}return e.trim()}function Sc(t,e,a,o){let r=t.slice().sort((s,c)=>s.y-c.y);for(let s=1;s<r.length;s++)r[s].y-r[s-1].y<e&&(r[s].y=r[s-1].y+e);let n=r.length?r[r.length-1].y-o:0;if(n>0&&r.forEach(s=>{s.y-=n}),r.length&&r[0].y<a){let s=a-r[0].y;r.forEach(c=>{c.y+=s})}return r}function Ps(t,e,a,o,r){for(let n=Math.ceil(e/1e4)*1e4;n<=a;n+=1e4)n!==0&&t.appendChild(O("text",{class:"chart-axis-label",x:o(n)-8,y:r-8},n/1e3+" s"))}function _t(t,e){return t==="threshold"?p(e==="open"?"diagnostics.lab.thr.openThreshold":"diagnostics.lab.thr.closeThreshold"):p("diagnostics.lab.thr."+t)}function zc(t,e){let a=e.params,o=e.baselineMa;switch(t){case"trailing":return p("diagnostics.lab.thr.trailingDetail",{step:a.trailingStepMa.toFixed(1),window:(a.trailingWindowMs/1e3).toFixed(1),sustain:(a.trailingSustainMs/1e3).toFixed(2)});case"threshold":return o==null?p("diagnostics.lab.thr.noBaseline"):e.direction==="open"&&e.usesFraction?p("diagnostics.lab.thr.fractionDetail",{base:o.toFixed(1),k:a.stallFraction.toFixed(2),stall:a.learnedStallMa.toFixed(1)}):p("diagnostics.lab.thr.factorDetail",{base:o.toFixed(1),f:(e.direction==="open"?a.openFactor:a.closeFactor).toFixed(2),ma:(o*(e.direction==="open"?a.openFactor:a.closeFactor)).toFixed(1)});case"seat":return p("diagnostics.lab.thr.capDetail",{ma:a.seatMa.toFixed(1),frames:a.seatFrames})+" \xB7 "+p("diagnostics.lab.thr.seatGate");case"popoff":return p("diagnostics.lab.thr.capDetail",{ma:a.popoffMa.toFixed(1),frames:a.popoffFrames});case"openStop":return p("diagnostics.lab.thr.capDetail",{ma:a.openStopMa.toFixed(1),frames:a.openFrames})+" \xB7 "+p("diagnostics.lab.thr.openGate");case"stall":return p("diagnostics.lab.thr.capDetail",{ma:a.stallMa.toFixed(1),frames:a.stallFrames});case"circuit":return p("diagnostics.lab.thr.capDetail",{ma:a.circuitMa.toFixed(1),frames:a.circuitFrames});case"ceiling":return e.direction==="open"?p("diagnostics.lab.thr.ceilingDetail",{s:a.openCeilingS,counts:3600}):p("diagnostics.lab.thr.ceilingDetail",{s:a.closeCeilingS,counts:2600});case"wall":return p("diagnostics.lab.thr.wallDetail",{s:Xt.ms/1e3,counts:Xt.counts});default:return""}}function Ds(t){return t==="open"?["threshold","openStop","stall","circuit","ceiling"]:["trailing","threshold","seat","popoff","stall","circuit","ceiling","wall"]}function Cc(t){let e=t.trips.wall;if(!t.first)return{state:"none",text:p("diagnostics.lab.thr.verdictNone")};let a=t.trips[t.first];return t.first==="ceiling"?{state:"ceiling",icon:"!",text:p("diagnostics.lab.thr.verdictCeiling",{t:ea(a.t_ms),counts:a.motion_count})}:e&&a.t_ms>=e.t_ms?{state:"late",icon:"\u26A0",text:p("diagnostics.lab.thr.verdictLate",{name:_t(t.first==="trailing"?"trailing":t.first,t.direction),t:ea(a.t_ms)})}:{state:"ok",text:p("diagnostics.lab.thr.verdictFirst",{name:_t(t.first,t.direction),t:ea(a.t_ms),ma:Jt(a.current_ma)})}}function Mc(t,e){let a=e.series,o=a[0].t_ms,r=a[a.length-1].t_ms,n=d=>ge.l+(d-o)/Math.max(1,r-o)*st,s=Math.max(...a.map(d=>d.current_ma)),c=Ms(e),u=Math.max(s,...c.filter(d=>d.ma<=s+12).map(d=>d.ma))+4,m=u>40?20:10,x=Math.ceil(u/m)*m,l=0,f=hn-ge.t-ge.b,v=Rs(l,x,ge.t,f),w=c.filter(d=>d.ma<=x),C=c.filter(d=>d.ma>x),z=O("svg",{viewBox:`0 0 ${yn} ${hn}`,role:"img"});z.setAttribute("aria-label",p("diagnostics.lab.thr.chartAria",{dir:p("diagnostics.lab.dir."+e.direction)}));for(let d=l;d<=x;d+=m){let g=v(d);z.appendChild(O("line",{class:"chart-grid",x1:ge.l,x2:ge.l+st,y1:g,y2:g})),z.appendChild(O("text",{class:"chart-tick",x:6,y:g+4},d.toFixed(0)))}z.appendChild(O("text",{class:"chart-axis-label",x:6,y:ge.t-8},"mA")),Ps(z,o,r,n,hn);let _=[];if(e.trips.ceiling&&_.push({id:"ceiling",t:e.trips.ceiling.t_ms,color:Fs,dash:"3 3"}),e.direction==="close"){let d=e.trips.wall?e.trips.wall.t_ms:Xt.ms;d<=r&&_.push({id:"wall",t:d,color:wn,dash:"0"})}_.forEach((d,g)=>{let h=n(d.t);z.appendChild(O("line",{x1:h,x2:h,y1:ge.t,y2:ge.t+f,stroke:d.color,"stroke-width":1.4,"stroke-dasharray":d.dash,"vector-effect":"non-scaling-stroke"})),z.appendChild(O("text",{class:"lt-vlabel",x:h+4,y:ge.t+10+g*12,fill:d.color},_t(d.id,e.direction)))});let b=[];if(w.forEach(d=>{let g=Ns[d.id];if(d.id==="baseline"||d.id==="threshold"){let h=d.id==="baseline"?"baseline_ma":"threshold_ma";z.appendChild(O("path",{d:xn(a.map(S=>S[h]==null?null:{x:n(S.t_ms),y:v(S[h])})),fill:"none",stroke:g.stroke,"stroke-width":g.width,"stroke-dasharray":g.dash,"vector-effect":"non-scaling-stroke"}))}else{let h=v(d.ma);z.appendChild(O("line",{x1:ge.l,x2:ge.l+st,y1:h,y2:h,stroke:g.stroke,"stroke-width":g.width,"stroke-dasharray":g.dash,"vector-effect":"non-scaling-stroke"}))}b.push({id:d.id,y:v(d.ma),text:_t(d.id,e.direction)+"  "+Jt(d.ma),st:g})}),z.appendChild(O("path",{d:xn(a.map(d=>({x:n(d.t_ms),y:v(d.current_ma)}))),fill:"none",stroke:Qt,"stroke-width":2,"stroke-linejoin":"round","vector-effect":"non-scaling-stroke"})),Sc(b,13,ge.t+4,ge.t+f).forEach(d=>{let g=ge.l+st+8;z.appendChild(O("line",{x1:g,x2:g+14,y1:d.y,y2:d.y,stroke:d.st.stroke,"stroke-width":2,"stroke-dasharray":d.st.dash==="0"?"0":"4 2"})),z.appendChild(O("text",{class:"lt-label",x:g+19,y:d.y+4},d.text))}),Ds(e.direction).filter(d=>d!=="ceiling"&&d!=="wall").forEach(d=>{let g=e.trips[d];if(!g)return;let h=n(g.t_ms),S=v(Math.min(g.current_ma,x)),j=d===e.first?6:4;z.appendChild(O("path",{d:`M ${h} ${S-j} L ${h+j} ${S} L ${h} ${S+j} L ${h-j} ${S} Z`,fill:d==="trailing"||d==="threshold"?pt:"var(--text-strong)",stroke:"var(--bg)","stroke-width":2}))}),t.appendChild(z),C.length){let d=document.createElement("p");d.className="lt-offscale",d.textContent=p("diagnostics.lab.thr.offScale",{list:C.map(g=>_t(g.id,e.direction)+" "+Jt(g.ma)).join(" \xB7 ")}),t.appendChild(d)}dt(z,t,{count:a.length,plotTop:ge.t,plotBottom:ge.t+f,xAt:d=>n(a[d].t_ms),label:d=>ea(a[d].t_ms)+" \xB7 "+Math.round(a[d].motion_count)+" counts",dots:d=>[{y:v(a[d].current_ma),color:Qt}],rows:d=>{let g=a[d],h=[{color:Qt,label:p("diagnostics.lab.currentMa"),value:Jt(g.current_ma)}];return g.baseline_ma!=null&&h.push({color:Ts,label:_t("baseline",e.direction),value:Jt(g.baseline_ma)}),g.threshold_ma!=null&&h.push({color:pt,label:_t("threshold",e.direction),value:Jt(g.threshold_ma)}),g.rise_ma!=null&&h.push({color:pt,label:p("diagnostics.lab.thr.rise"),value:g.rise_ma.toFixed(2)+" mA"}),h}})}function Lc(t,e){let a=e.series.filter(d=>d.rise_ma!=null);if(!a.length)return;let o=e.series,r=o[0].t_ms,n=o[o.length-1].t_ms,s=d=>ge.l+(d-r)/Math.max(1,n-r)*st,c=e.params,u=a.map(d=>d.rise_ma),m=Math.ceil(Math.max(c.trailingStepMa+1.5,...u)+.5),x=Math.max(-4,Math.floor(Math.min(-1,...u))),l=d=>Math.max(x,Math.min(m,d)),f=vn-14-ge.b,v=Rs(x,m,14,f),w=document.createElement("div");w.className="chart-head",w.innerHTML='<span class="chart-title">'+p("diagnostics.lab.thr.riseTitle",{window:(c.trailingWindowMs/1e3).toFixed(1)})+"</span>",t.appendChild(w);let C=O("svg",{viewBox:`0 0 ${yn} ${vn}`,role:"img"});C.setAttribute("aria-label",p("diagnostics.lab.thr.riseAria")),Ps(C,r,n,s,vn),[x,0,m].forEach(d=>{let g=v(d);C.appendChild(O("line",{class:"chart-grid",x1:ge.l,x2:ge.l+st,y1:g,y2:g})),C.appendChild(O("text",{class:"chart-tick",x:6,y:g+4},d.toFixed(0)))});let z=null,_=d=>{z!=null&&(C.appendChild(O("rect",{x:s(z),y:14,width:Math.max(1.5,s(d)-s(z)),height:f,fill:pt,opacity:d-z>=c.trailingSustainMs?.28:.12})),z=null)};a.forEach((d,g)=>{d.qualifying&&z==null&&(z=d.t_ms),(!d.qualifying||g===a.length-1)&&_(d.t_ms)});let b=v(c.trailingStepMa);if(C.appendChild(O("line",{x1:ge.l,x2:ge.l+st,y1:b,y2:b,stroke:pt,"stroke-width":1.6,"stroke-dasharray":"6 4","vector-effect":"non-scaling-stroke"})),C.appendChild(O("text",{class:"lt-label",x:ge.l+st+27,y:b+4},p("diagnostics.lab.thr.trailing")+"  "+c.trailingStepMa.toFixed(1)+" mA")),C.appendChild(O("line",{x1:ge.l+st+8,x2:ge.l+st+22,y1:b,y2:b,stroke:pt,"stroke-width":2,"stroke-dasharray":"4 2"})),C.appendChild(O("path",{d:xn(a.map(d=>({x:s(d.t_ms),y:v(l(d.rise_ma))}))),fill:"none",stroke:Qt,"stroke-width":1.8,"vector-effect":"non-scaling-stroke"})),e.trips.wall){let d=s(e.trips.wall.t_ms);C.appendChild(O("line",{x1:d,x2:d,y1:14,y2:14+f,stroke:wn,"stroke-width":1.4,"vector-effect":"non-scaling-stroke"}))}t.appendChild(C),dt(C,t,{count:a.length,plotTop:14,plotBottom:14+f,xAt:d=>s(a[d].t_ms),label:d=>ea(a[d].t_ms),dots:d=>[{y:v(l(a[d].rise_ma)),color:Qt}],rows:d=>[{color:Qt,label:p("diagnostics.lab.thr.rise"),value:a[d].rise_ma.toFixed(2)+" mA"},{color:pt,label:p("diagnostics.lab.thr.trailing"),value:c.trailingStepMa.toFixed(1)+" mA"}]})}function Ac(t,e){let a=document.createElement("table"),o=e.trips.wall,r=["path","threshold","fires","counts"].map(s=>"<th>"+p("diagnostics.lab.thr.col."+s)+"</th>").join(""),n=Ds(e.direction).map(s=>{let c=e.trips[s],u=!!(c&&o&&s!=="wall"&&s!=="ceiling"&&c.t_ms>=o.t_ms),m=Ns[s],x=s==="trailing"?pt:s==="ceiling"?Fs:s==="wall"?wn:m?m.stroke:Yt,l=c?ea(c.t_ms)+(u?" \xB7 \u26A0 "+p("diagnostics.lab.thr.afterWall"):""):p("diagnostics.lab.thr.notReached");return'<tr data-first="'+(s===e.first)+'"><td><span class="lt-swatch" style="color:'+x+'"></span>'+_t(s,e.direction)+"</td><td>"+zc(s,e)+'</td><td data-late="'+u+'">'+l+"</td><td>"+(c?c.motion_count:"\u2014")+"</td></tr>"}).join("");a.innerHTML="<thead><tr>"+r+"</tr></thead><tbody>"+n+"</tbody>",t.appendChild(a)}function Ec(t,e,a,o,r){let n=Cs(o,e,r),s=document.createElement("div");s.className="chart-card";let c=document.createElement("div");if(c.className="chart-head",c.innerHTML='<span class="chart-title">'+p("diagnostics.lab.thr.title",{dir:p("diagnostics.lab.dir."+e)})+'</span><span class="chart-sub">'+p("diagnostics.lab.thr.source."+a)+"</span>",s.appendChild(c),n.series.length<2){t.appendChild(s);return}let u=Cc(n),m=document.createElement("div");m.className="lt-verdict",m.dataset.state=u.state,m.innerHTML=(u.icon?'<span class="lt-icon" aria-hidden="true">'+u.icon+"</span>":"")+"<span>"+u.text+"</span>",s.appendChild(m),Mc(s,n),e==="close"&&Lc(s,n),Ac(s,n),t.appendChild(s)}function $s(t,e){let a=e&&e.params||{},o=e&&e.captures||{};t.innerHTML="";let r=document.createElement("div");r.className="lab-thresholds";let n=document.createElement("p");n.className="lt-intro",n.textContent=p("diagnostics.lab.thr.intro"),r.appendChild(n),[["close",Ls],["open",As]].forEach(([s,c])=>{let u=o[s],m=u&&u.length>1?u:Es(c);Ec(r,s,u&&u.length>1?"capture":"reference",m,a)}),t.appendChild(r)}var Hs=400,Fc=500;var Nc=2e3,wa=["setup","arm","seat","open","close","review"],qs=["none","open_circuit","blocked","timeout","overcurrent","thermal","stall","unknown","mechanical_overrun"],Rc=8;var Pc=["","close_seat","open_stop","close_popoff","stall_cap","circuit_fault"];function Dc(t){let e=Number(t)||0;return e?qs[e]?`${qs[e]} (${e})`:String(e):null}var zn=[{group:"close",cls:"close-factor",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x",step:"0.05"},{group:"close",cls:"close-trailing-step-ma",key:"close_trailing_step_ma",id:i.closeTrailingStepMa,labelKey:"settings.motor.closeTrailingStepMa",unit:"mA",step:"0.1"},{group:"close",cls:"close-trailing-sustain-ms",key:"close_trailing_sustain_ms",id:i.closeTrailingSustainMs,labelKey:"settings.motor.closeTrailingSustainMs",unit:"ms",step:"50"},{group:"close",cls:"close-trailing-ref-ms",key:"close_trailing_ref_ms",id:i.closeTrailingRefMs,labelKey:"settings.motor.closeTrailingRefMs",unit:"ms",step:"100"},{group:"open",cls:"open-endstop-current-factor",key:"open_endstop_current_factor",id:i.openEndstopCurrentFactor,labelKey:"settings.motor.openEndstopCurrentFactor",unit:"x",step:"0.05"},{group:"open",cls:"open-endstop-stall-fraction",key:"open_endstop_stall_fraction",id:i.openEndstopStallFraction,labelKey:"settings.motor.openEndstopStallFraction",unit:"k",step:"0.05"},{group:"open",cls:"open-ripple",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x",step:"0.05"},{group:"caps",cls:"cap-close-seat-ma",key:"cap_close_seat_ma",id:i.capCloseSeatMa,labelKey:"settings.motor.capCloseSeatMa",unit:"mA",step:"0.5"},{group:"caps",cls:"cap-close-seat-frames",key:"cap_close_seat_frames",id:i.capCloseSeatFrames,labelKey:"settings.motor.capCloseSeatFrames",unit:"frames",step:"1"},{group:"caps",cls:"cap-close-popoff-ma",key:"cap_close_popoff_ma",id:i.capClosePopoffMa,labelKey:"settings.motor.capClosePopoffMa",unit:"mA",step:"0.5"},{group:"caps",cls:"cap-open-stop-ma",key:"cap_open_stop_ma",id:i.capOpenStopMa,labelKey:"settings.motor.capOpenStopMa",unit:"mA",step:"0.5"},{group:"caps",cls:"cap-stall-ma",key:"cap_stall_ma",id:i.capStallMa,labelKey:"settings.motor.capStallMa",unit:"mA",step:"1"},{group:"caps",cls:"cap-circuit-fault-ma",key:"cap_circuit_fault_ma",id:i.capCircuitFaultMa,labelKey:"settings.motor.capCircuitFaultMa",unit:"mA",step:"1"}],$c=["close","open","caps"],Ic=`
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
.diag-motor-lab .lab-tune-group {
  grid-column: 1 / -1; margin-top: 4px; padding-top: 8px;
  border-top: 1px solid var(--separator);
  color: var(--text-faint); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}
.diag-motor-lab .lab-tune-group:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
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
`;$("diag-motor-lab",Ic);var Oc=()=>`
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
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.railOc">Rail OC</span><b data-k="railOc">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.usbFault">USB fault</span><b data-k="usbFault">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.baseline">Baseline</span><b data-k="baseline">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.ceiling">Ceiling</span><b data-k="ceiling">\u2014</b></div>
            <div class="lab-gauge"><span data-i18n="diagnostics.lab.openTrip">Open trip</span><b data-k="openTrip">\u2014</b></div>
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
        ${$c.map(t=>`
          <div class="lab-tune-group" data-i18n="diagnostics.lab.tune.${t}">${t}</div>
          ${zn.filter(e=>e.group===t).map(e=>`
          <div class="lab-tune-row">
            <label><span data-i18n="${e.labelKey}">${e.labelKey}</span> (${e.unit})</label>
            <input type="number" class="lab-tune-input" data-tune-key="${e.key}" data-tune-id="${e.id}" step="${e.step}" inputmode="decimal" />
          </div>`).join("")}`).join("")}
      </div>
      <div class="lab-thr-host"></div>
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
`;function Cn(t){return t==="rev32_gpio"||t==="rev33_gpio"}function Bs(t,e,a){return t==="open"?{factor:E(Cn(a)?i.openEndstopCurrentFactor:i.openThresholdMultiplier),slope:E(i.openSlopeThreshold),floor:E(i.openSlopeCurrentFactor),ripple:E(i.openRippleLimitFactor),caps:e}:{factor:E(i.closeThresholdMultiplier),slope:E(i.closeSlopeThreshold),floor:E(i.closeSlopeCurrentFactor),caps:e}}function ka(t,e){let a=Bs(t.direction,void 0,e),o=t.direction==="open",r=Cn(e)?"open_endstop_current_factor":"open_threshold_multiplier",n=Cn(e)?"settings.motor.openEndstopCurrentFactor":"settings.motor.openThreshold",s=Number(a.factor),c=!o&&Number.isFinite(s)?Math.min(t.suggested_factor,s):t.suggested_factor,u=[{key:o?r:"close_threshold_multiplier",labelKey:o?n:"settings.motor.closeThreshold",current:a.factor,suggested:c,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&u.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:a.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),u}function kn(t){return p(t?"common.on":"common.off")}function _n(t){return t===1?"HIGH":t===0?"LOW":"\u2014"}function _a(t){return t==="rev32_gpio"||t==="rev31_gpio"}function Sn(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",latchFaulted:!1,driversEnabled:null,latchArmLevel:null,latchStateLevel:null,motorEnableLevel:null,invalidSamples:0,tachoRejected:0,railOvercurrentLevel:null,faultUsbLevel:null,caps:null,baselineMa:null,baselineSettled:!1,countsSpurious:!1,lastFastTrip:0,endpointDecision:0,ceilingMs:0,ceilingCounts:0,ceilingSource:0,requiresCalibration:!1,positionConfident:!1,learnedStallMa:null}}var ag=H({tag:"diag-motor-lab",render:Oc,onMount(t,e){let a=Number(D("selectedZone")||1),o="setup",r="idle",n={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1},s={open:null,close:null,seat:null},c={samples:[],analysis:null,live:!1},u=[],m={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},x=[],l=Sn(),f=!1,v=e.querySelector(".lab-step-chip"),w=e.querySelector(".lab-zone-chip"),C=e.querySelector(".lab-banner"),z=e.querySelector(".lab-guide"),_=e.querySelector(".lab-kicker"),b=e.querySelector(".lab-stage h3"),d=e.querySelector(".lab-stage p"),g=e.querySelector(".lab-setup"),h=e.querySelector(".lab-zone"),S=e.querySelector(".lab-phase-label"),F=e.querySelector(".lab-log"),j=e.querySelector(".lab-chart"),I=e.querySelector(".lab-download"),Q=e.querySelector(".lab-capture-meta"),ne=e.querySelector(".lab-metrics"),se=e.querySelector(".lab-suggest"),V=e.querySelector(".lab-primary"),K=e.querySelector(".lab-secondary"),pe=e.querySelector(".lab-estop"),X=Array.from(e.querySelectorAll(".lab-tune-input")),Ue=e.querySelector(".lab-thr-host"),tt=e.querySelector(".lab-kv-body"),te={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),pad10:e.querySelector('[data-k="pad10"]'),pad9:e.querySelector('[data-k="pad9"]'),pad11:e.querySelector('[data-k="pad11"]'),railOc:e.querySelector('[data-k="railOc"]'),usbFault:e.querySelector('[data-k="usbFault"]'),baseline:e.querySelector('[data-k="baseline"]'),ceiling:e.querySelector('[data-k="ceiling"]'),openTrip:e.querySelector('[data-k="openTrip"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function Rt(M){u=M&&M.length?M:[];let N=u.length;if(I.hidden=N<2,Q.hidden=N<2,N<2)return;let B=Number(u[0].t_ms)||0,Y=Number(u[N-1].t_ms)||0,U=Math.max(0,(Y-B)/1e3);Q.textContent=p("diagnostics.lab.captureMeta",{n:N,hz:2,seconds:U.toFixed(1)})}function go(M){let N=Math.max(0,Math.min(100,Number(M)||0))/100;return N<.3?.3*Math.pow(Math.max(N/.3,0),1.5):Math.pow(N,1.5)}function bo(){if(!tt)return;let M=[10,20,30,40,50,60,70,80,90,100],N="";for(let B=0;B<M.length;B+=3){let Y=[];for(let U=0;U<3;U++){let re=M[B+U];if(re==null){Y.push("<td></td><td></td>");continue}Y.push(`<td>${re}</td><td>${go(re).toFixed(3)}</td>`)}N+=`<tr>${Y.join("")}</tr>`}tt.innerHTML=N}bo();function Ma(M){return wa.indexOf(M)}function Pt(){return Me(a)}function oa(){let M=String(a);h.innerHTML=Array.from({length:6},(N,B)=>'<option value="'+(B+1)+'">'+Me(B+1).replace(/</g,"&lt;")+"</option>").join(""),h.value=M,h.setAttribute("aria-label",p("diagnostics.lab.motor")),w.textContent=Pt(),w.setAttribute("aria-label",p("diagnostics.lab.motor"))}function le(M,N){let B=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});x.push(B+"  "+p(M,N)),x.length>8&&x.shift(),F.innerHTML=x.map(Y=>"<div>"+Y+"</div>").join(""),F.scrollTop=F.scrollHeight}function T(M){C.textContent=M||"",C.classList.toggle("show",!!M)}function P(M,N){r=M,S.dataset.kind=N||"",S.textContent=p("diagnostics.lab.phase."+M)}let ae={close_threshold_multiplier:"closeFactor",open_endstop_current_factor:"openFactor",open_endstop_stall_fraction:"stallFraction",close_trailing_step_ma:"trailingStepMa",close_trailing_sustain_ms:"trailingSustainMs",close_trailing_ref_ms:"trailingWindowMs",cap_close_seat_ma:"seatMa",cap_close_seat_frames:"seatFrames",cap_close_popoff_ma:"popoffMa",cap_stall_ma:"stallMa",cap_open_stop_ma:"openStopMa",cap_circuit_fault_ma:"circuitMa"};function ee(){let M={};for(let B of X){let Y=ae[B.dataset.tuneKey];if(!Y)continue;let U=B.value===""?NaN:Number(B.value),re=Number(E(B.dataset.tuneId)),de=Number.isFinite(U)?U:re;Number.isFinite(de)&&(M[Y]=de)}let N=Number(E(i.hmipRuntimeLimitSeconds));return Number.isFinite(N)&&N>0&&(M.closeCeilingS=N),Number.isFinite(l.learnedStallMa)&&l.learnedStallMa>0&&(M.learnedStallMa=l.learnedStallMa),M}let we=0;function Z(){clearTimeout(we),we=setTimeout(()=>{let M=s.close||s.seat;$s(Ue,{params:ee(),captures:{close:M&&M.samples,open:s.open&&s.open.samples}})},120)}function ve(){for(let M of X){let N=E(M.dataset.tuneId);N==null||Number.isNaN(Number(N))||document.activeElement!==M&&(M.value=String(Number(N)))}Z()}function _e(){for(let M of X){let N=()=>{var Y;let B=Number(M.value);if(!Number.isFinite(B)){ve();return}De(M.dataset.tuneKey,B),le("diagnostics.lab.log.tune",{key:p(((Y=zn.find(U=>U.key===M.dataset.tuneKey))==null?void 0:Y.labelKey)||M.dataset.tuneKey),value:B}),c.analysis&&je()};M.addEventListener("change",N),M.addEventListener("input",Z),M.addEventListener("keydown",B=>{B.key==="Enter"&&(B.preventDefault(),M.blur(),N())})}}function Se(){let M=A(i.motorProfileDefault)||"HmIP VdMot",N;if(M==="HmIP VdMot"){let B=Number(l.ceilingMs);if(Number.isFinite(B)&&B>0)return Math.min(6e4,Math.round(B));N=Number(E(i.hmipRuntimeLimitSeconds)),(!Number.isFinite(N)||N<=0)&&(N=34),N=Math.min(34,N)}else N=Number(E(i.genericRuntimeLimitSeconds)),(!Number.isFinite(N)||N<=0)&&(N=45);return Math.min(6e4,Math.round(N*1e3))}async function Ze(){if(!n.active||n.aborted||n.pullInFlight)return;let M=Date.now();if(!(M-(n.pullAt||0)<5e3)){n.pullAt=M,n.pullInFlight=!0;try{let N=await No(),B=cn(N);B.length&&(n.hiRes=pn(n.hiRes||[],B),Rt(n.hiRes))}catch(N){}finally{n.pullInFlight=!1}}}function Oe(){let M=fa(l.stroke);te.current.textContent=l.current==null?"\u2014":l.current.toFixed(1)+" mA",te.mean.textContent=l.mean==null?"\u2014":l.mean.toFixed(1)+" mA",te.peak.textContent=l.peak==null?"\u2014":l.peak.toFixed(1)+" mA",te.slope.textContent=l.slope==null?"\u2014":l.slope.toFixed(1)+" mA/s",te.runtime.textContent=l.runtime?(l.runtime/1e3).toFixed(1)+" s":"\u2014",te.motion.textContent=l.motion?String(l.motion):"\u2014",te.cadence.textContent=l.cadenceHz==null?"\u2014":l.cadenceHz.toFixed(1)+" /s",te.direction.textContent=l.direction,te.drivers.textContent=kn(l.driversEnabled!=null?l.driversEnabled:be(i.drivers)),te.busy.textContent=kn(l.busy),te.armed.textContent=kn(l.armed);let N=_a(l.backend),B=te.pad10&&te.pad10.parentElement.querySelector("span"),Y=te.pad9&&te.pad9.parentElement.querySelector("span");B&&(B.textContent=p(N?"diagnostics.lab.pad10":"diagnostics.lab.pad10nsleep")),Y&&(Y.textContent=p(N?"diagnostics.lab.pad9":"diagnostics.lab.pad9fault")),te.pad10&&(te.pad10.textContent=_n(l.latchArmLevel)),te.pad9&&(te.pad9.textContent=_n(l.latchStateLevel)),te.pad11&&(te.pad11.textContent=_n(l.motorEnableLevel)),te.backend.textContent=l.backend||"\u2014";let U=()=>{let de=Dc(l.faultCode);if(de){if(l.faultCode===Rc&&l.ceilingCounts>0){let fe=l.motion>=l.ceilingCounts;return`${de} \xB7 ${fe?"count ceiling":"time ceiling"}`}return de}return l.endpointDecision===7?"stopped, unconfirmed":l.lastFastTrip?`stopped \xB7 ${Pc[l.lastFastTrip]||l.lastFastTrip}`:p("common.ok")};te.fault.textContent=l.latchFaulted?p("diagnostics.lab.faultLatch"):U();let re=de=>de==null||de<0?"\u2014":de===0?"ASSERTED":"ok";te.railOc&&(te.railOc.textContent=re(l.railOvercurrentLevel)),te.usbFault&&(te.usbFault.textContent=re(l.faultUsbLevel)),te.baseline&&(te.baseline.textContent=l.baselineMa==null?"\u2014":`${l.baselineMa.toFixed(1)} mA${l.baselineSettled?"":" (settling)"}`),te.ceiling&&(te.ceiling.textContent=l.ceilingMs?`${(l.ceilingMs/1e3).toFixed(1)} s / ${l.ceilingCounts||"\u2014"} cnt`:"\u2014"),te.openTrip&&(te.openTrip.textContent=l.learnedStallMa?`${l.learnedStallMa.toFixed(1)} mA stall`:"ratio fallback"),te.invalid.textContent=String(l.invalidSamples||0),te.tachoRejected.textContent=String(l.tachoRejected||0),te.stroke.textContent=p("diagnostics.lab.stroke."+M),te.stroke.dataset.phase=M,l.pinSeen?(te.pin.textContent=p("diagnostics.lab.pinSeen",{count:l.pinAt}),te.pin.dataset.seen="true"):(te.pin.textContent=p("diagnostics.lab.pinWaiting"),te.pin.dataset.seen="false")}function je(){let M=c.analysis?xs(c.analysis,Bs(c.analysis.direction,l.caps,l.backend)):[],N=Ss(j,{samples:c.samples,analysis:c.analysis,live:c.live,overlays:M,visible:m});N&&N.addEventListener("click",B=>{let Y=B.target.closest(".gw-toggle");if(!Y)return;let U=Y.dataset.layer;m[U]=!m[U],Object.keys(m).some(de=>m[de])||(m[U]=!0),je()})}function Pe(M,N,B){c={analysis:M&&M.ok?M:null,samples:N||[],live:!!B},Rt(c.samples),c.analysis&&(l.mean=c.analysis.mean_ma,l.peak=c.analysis.peak_ma,l.slope=c.analysis.max_stall_slope_ma_s),je(),Z();let Y=[];if(o==="review"?(s.open&&Y.push(...ka(s.open,l.backend)),s.close&&Y.push(...ka(s.close,l.backend))):c.analysis&&Y.push(...ka(c.analysis,l.backend)),!c.analysis&&o!=="review"){ne.innerHTML="",se.hidden=!0;return}let U=o==="review"?s.close||s.open:c.analysis;if(!U){ne.innerHTML="",se.hidden=!0;return}let re=U.pin_seen?p("diagnostics.lab.pinMetric",{ms:U.pin_t_ms,count:U.pin_motion_count}):p("diagnostics.lab.pinWaiting"),de=[[p("diagnostics.lab.mean"),U.mean_ma.toFixed(1)+" mA"],[p("diagnostics.lab.peak"),U.peak_ma.toFixed(1)+" mA"],[p("diagnostics.lab.runtime"),(U.runtime_ms/1e3).toFixed(1)+" s"],[p("diagnostics.lab.ripples"),String(U.ripples)],[p("diagnostics.lab.pin"),re]];if(o==="review"&&s.open&&s.close){de[0]=[p("diagnostics.lab.mean"),s.open.mean_ma.toFixed(1)+" / "+s.close.mean_ma.toFixed(1)+" mA"],de[1]=[p("diagnostics.lab.peak"),s.open.peak_ma.toFixed(1)+" / "+s.close.peak_ma.toFixed(1)+" mA"];let fe=s.close.pin_seen?p("diagnostics.lab.pinMetric",{ms:s.close.pin_t_ms,count:s.close.pin_motion_count}):p("diagnostics.lab.pinWaiting");de[4]=[p("diagnostics.lab.pin"),fe]}ne.innerHTML=de.map(fe=>'<div class="lab-metric"><span>'+fe[0]+"</span><strong>"+fe[1]+"</strong></div>").join(""),se.querySelector("tbody").innerHTML=Y.map(fe=>"<tr><td>"+p(fe.labelKey)+"</td><td>"+Number(fe.current).toFixed(1)+" "+fe.unit+'</td><td class="better">'+Number(fe.suggested).toFixed(1)+" "+fe.unit+"</td></tr>").join(""),se.hidden=!Y.length}function ye(){let M=o==="halted",N=M?"setup":o,B=Ma(N),Y=M?"halted":"active";v.dataset.state=Y,v.textContent=M?p("diagnostics.lab.halted"):p("diagnostics.lab.stepChip",{step:B+1,total:wa.length,name:p("diagnostics.lab.steps."+N)}),_.textContent=M?p("diagnostics.lab.halted"):p("diagnostics.lab.stepOf",{step:B+1,total:wa.length});let U=!M&&N==="arm"&&!_a(l.backend)?"enable":M?"halt":N;b.textContent=p("diagnostics.lab."+U+".title");let re=o==="seat"&&s.seat||o==="open"&&s.open||o==="close"&&s.close,de=M?"diagnostics.lab.halt.copy":re?"diagnostics.lab."+N+".done":"diagnostics.lab."+U+".copy";d.textContent=p(de);let fe=o==="setup";z.dataset.setup=fe?"true":"false",g.hidden=!fe,h.disabled=!fe||n.active,w.hidden=fe,w.textContent=Pt(),pe.dataset.armed=n.active?"true":"false",Oe();let ze=n.active,Ce={key:"diagnostics.lab.next",disabled:ze,action:"next"},q=null;o==="setup"?Ce={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:o==="arm"?Ce={key:_a(l.backend)?"diagnostics.lab.arm.action":"diagnostics.lab.enable.action",disabled:ze,action:"arm"}:o==="seat"?Ce={key:s.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:ze,action:s.seat?"next":"seat"}:o==="open"?Ce={key:s.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:ze,action:s.open?"next":"open"}:o==="close"?Ce={key:s.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:ze,action:s.close?"next":"close"}:o==="review"?(Ce={key:"diagnostics.lab.apply",disabled:!(s.open||s.close),action:"apply"},q={key:"diagnostics.lab.restart",action:"restart"}):M&&(Ce={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),ze&&(Ce={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!ze&&(o==="seat"||o==="open"||o==="close")&&!s[o==="seat"?"seat":o]&&r==="failed"&&(Ce={key:"diagnostics.lab.retry",disabled:!1,action:o}),!ze&&re&&(o==="seat"||o==="open"||o==="close")&&(q={key:"diagnostics.lab.restart",action:"restart"}),V.dataset.action=Ce.action,V.disabled=!!Ce.disabled,V.textContent=p(Ce.key),q?(K.hidden=!1,K.dataset.action=q.action,K.textContent=p(q.key)):(K.hidden=!0,K.dataset.action="")}function he(M){We("motorLabBusy",!!M)}function at(){n.timer&&clearTimeout(n.timer),n.timer=null}function ot(M){if(o=M,(M==="arm"||M==="setup")&&T(""),M==="review"){he(!1);let N=s.close||s.open;Pe(N,N?N.samples:[],!1),P("done","ok")}else M==="setup"&&(he(!1),Pe(null,[],!1));ye()}async function Ge(){if(!n.active){he(!0),n.active=!0,P("arming","run"),ye(),le("diagnostics.lab.log.arming",{zone:a});try{if(D("manualMode")||(We("manualMode",!0),await da(!0),le("diagnostics.lab.log.manual")),n.aborted)return;let M=await ca(),N=M&&M.data&&M.data.motor_safety?M.data.motor_safety:{};if(l.backend=N.backend||l.backend,Oe(),_a(l.backend)){le("diagnostics.lab.log.armProbeWait");let U=await ar({hz:100,durationMs:4e3});if(n.aborted)return;let re=U&&U.data?U.data:{};if(le("diagnostics.lab.log.armProbe",{hz:re.hz||100,cycles:re.cycles||0,armed:re.armed?p("common.on"):p("common.off"),at:re.armed_at_cycle||0}),l.armed=!!re.armed,l.latchFaulted=!re.armed,Oe(),!re.armed)throw T(p("diagnostics.lab.latchBanner")),new Error("latch")}else le("diagnostics.lab.log.enableWait");await la(!0),le("diagnostics.lab.log.drivers");let B=Date.now()+4e3,Y=!1;for(;Date.now()<B;){if(n.aborted)return;let U=await ca(),re=U&&U.data?U.data:{},de=re.motor_safety||{};if(l.driversEnabled=re.drivers_enabled!=null?!!re.drivers_enabled:l.driversEnabled,l.armed=!!de.armed,l.latchFaulted=!!de.latch_faulted,l.backend=de.backend||l.backend,l.latchArmLevel=de.latch_arm_level,l.latchStateLevel=de.latch_state_level,l.motorEnableLevel=de.motor_enable_level,Oe(),re.drivers_enabled&&!de.latch_faulted){Y=!0;break}await new Promise(fe=>setTimeout(fe,Hs))}if(!Y){let U=_a(l.backend);throw T(p(U?"diagnostics.lab.latchBanner":"diagnostics.lab.enableBanner")),new Error(U?"latch":"enable")}P("armed","ok"),le("diagnostics.lab.log.armed"),n.active=!1,ot("seat")}catch(M){n.active=!1,he(!1),P("failed","halt"),le(M&&M.message==="arm_gpio"?"diagnostics.lab.log.armGpio":M&&M.message==="latch"?"diagnostics.lab.log.latchFaulted":M&&M.message==="enable"?"diagnostics.lab.log.enableFailed":"diagnostics.lab.log.armFailed"),ye()}}}async function ft(M,N){let B=n.live.slice(),Y=[];for(let nt=0;nt<6;nt++){if(n.aborted)return;try{P("fetching","run"),ye();let rt=await No();le("diagnostics.lab.log.trace"),Y=cn(rt);break}catch(rt){if(rt&&rt.code==="motor_busy"){await new Promise(ho=>setTimeout(ho,250));continue}le("diagnostics.lab.log.traceFailed");break}}Y.length&&(n.hiRes=pn(n.hiRes||[],Y));let U=n.hiRes||[],re=B.length&&Number(B[B.length-1].t_ms)||0,de=Y.length&&Number(Y[Y.length-1].t_ms)||0,fe=U.length&&Number(U[U.length-1].t_ms)||0,ze=U.length?U:B.length?B:Y,Ce=Y.length>=8&&de>=Math.max(400,Math.max(re,fe)*.45)?Y:ze;if(!ze.length){P("failed","halt"),le("diagnostics.lab.log.traceFailed"),Pe(null,[],!1);return}let q=vs(Ce,M);if(N&&(s[N]=q.ok?q:null),Pe(q,ze,!1),!q.ok)P("failed","halt"),q.reason==="no_endstop"?le("diagnostics.lab.log.noEndstop",{direction:p("diagnostics.lab.dir."+M),seconds:((q.runtime_ms||0)/1e3).toFixed(0)}):le(N==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),N==="seat"&&(s.seat={short:!0},le("diagnostics.lab.log.seatContinue"));else{if(P("done","ok"),le("diagnostics.lab.log.captured",{direction:p("diagnostics.lab.dir."+q.direction),peak:q.peak_ma.toFixed(1)}),q.pin_seen){let nt=l.pinSeen;l.pinSeen=!0,l.pinAt=q.pin_motion_count,l.pinMa=q.pin_current_ma,l.stroke=1,nt||le("diagnostics.lab.log.pinTrace",{count:q.pin_motion_count,ma:q.pin_current_ma.toFixed(1),ms:q.pin_t_ms})}else(N==="close"||N==="seat")&&le("diagnostics.lab.log.pinMissing");(fe>de+250||re>de+250)&&le("diagnostics.lab.log.browserLog",{seconds:(Math.max(fe,re)/1e3).toFixed(1)})}}function na(M){let N=M.map(Y=>Y.current_ma).filter(Number.isFinite);if(!N.length)return;let B=N.reduce((Y,U)=>Y+U,0);if(l.mean=Math.round(B/N.length*10)/10,l.peak=Math.round(Math.max(...N)*10)/10,M.length>=2){let Y=M[Math.max(0,M.length-3)],U=M[M.length-1],re=(U.t_ms-Y.t_ms)/1e3;re>.05&&(l.slope=Math.round((U.current_ma-Y.current_ma)/re*10)/10)}}async function ra(M,N){if(!n.active){n={active:!0,aborted:!1,direction:M,timer:null,live:[],hiRes:[],started:Date.now(),pullAt:0,pullInFlight:!1,chartAt:0},he(!0),l=Sn(),f=!1,l.direction=p("diagnostics.lab.dir."+M),P("starting","run"),ye(),Pe(null,[],!0),Rt([]),le("diagnostics.lab.log.starting",{direction:p("diagnostics.lab.dir."+M),zone:a});try{try{await Ba(a),le("diagnostics.lab.log.resetLearned")}catch(ze){le("diagnostics.lab.log.resetLearnedFailed")}if(n.aborted)return;let B=Se(),Y=B+8e3;if(le("diagnostics.lab.log.duration",{seconds:(B/1e3).toFixed(0)}),M==="open"?await Ha(a,B):await qa(a,B),n.aborted)return;P("waiting","run"),ye();let U=!1,re=!1,de=()=>{re||n.aborted||!n.active||(n.timer=setTimeout(fe,Hs))},fe=async()=>{if(!(re||n.aborted||!n.active)){try{let ze=await ca();if(re||n.aborted||!n.active)return;let Ce=ze&&ze.data?ze.data:{},q=Ce.motor_safety||{},nt=Number(q.current_ma),rt=!!q.motor_busy,ho=q.drive_on!=null?!!q.drive_on:rt;rt&&!U&&(U=!0,P("running","run"),le("diagnostics.lab.log.busy")),l.busy=rt,l.runtime=Date.now()-n.started,l.motion=Number(q.motion_evidence_count)||l.motion,l.stroke=Number(q.stroke_phase)||0,l.tachoPeriodUs=Number(q.tacho_period_us)||l.tachoPeriodUs,l.tachoCadenceUs=Number(q.tacho_cadence_us)||l.tachoCadenceUs;let Nn=l.tachoPeriodUs||l.tachoCadenceUs;l.cadenceHz=Nn>0?1e6/Nn:null,l.faultCode=Number(q.fault_code)||0,l.armed=!!q.armed,l.latchFaulted=!!q.latch_faulted,l.latchArmLevel=q.latch_arm_level,l.latchStateLevel=q.latch_state_level,l.motorEnableLevel=q.motor_enable_level,l.railOvercurrentLevel=q.rail_overcurrent_level,l.faultUsbLevel=q.fault_usb_level,l.driversEnabled=Ce.drivers_enabled!=null?!!Ce.drivers_enabled:l.driversEnabled,l.backend=q.backend||l.backend,l.invalidSamples=Number(q.invalid_samples)||0,l.tachoRejected=Number(q.tacho_rejected)||0,q.cap_seat_ma!=null&&(l.caps={seat:Number(q.cap_seat_ma),popoff:Number(q.cap_popoff_ma),open:Number(q.cap_open_ma),stall:Number(q.cap_stall_ma),circuit:Number(q.cap_circuit_ma)}),q.baseline_ma!=null&&(l.baselineMa=Number(q.baseline_ma)),l.baselineSettled=!!q.baseline_settled,l.countsSpurious=!!q.counts_spurious,l.lastFastTrip=Number(q.last_fast_trip)||0,l.endpointDecision=Number(q.endpoint_decision)||0,l.ceilingMs=Number(q.ceiling_ms)||0,l.ceilingCounts=Number(q.ceiling_counts)||0,l.ceilingSource=Number(q.ceiling_source)||0,l.requiresCalibration=!!q.requires_calibration,l.positionConfident=!!q.position_confident,q.learned_stall_ma!=null&&(l.learnedStallMa=Number(q.learned_stall_ma)),l.countsSpurious&&!f&&(f=!0,le("diagnostics.lab.log.spurious",{})),!l.pinSeen&&(l.stroke===1||l.stroke===2)&&(l.pinSeen=!0,l.pinAt=l.motion,l.pinMa=Number.isFinite(nt)?nt:l.current,le("diagnostics.lab.log.pin",{count:l.pinAt,ma:Number(l.pinMa||0).toFixed(1)})),Number.isFinite(nt)&&(l.current=nt,n.live.push({t_ms:Date.now()-n.started,current_ma:nt,motion_count:l.motion,drive_on:ho,direction_open:M==="open",stroke_phase:l.stroke,tacho_period_us:l.tachoPeriodUs,tacho_cadence_us:l.tachoCadenceUs,armed:l.armed,fault_code:l.faultCode,backend:l.backend}),na(n.live)),rt&&Ze(),Oe();let vo=Date.now();if(vo-(n.chartAt||0)>=Fc){n.chartAt=vo;let ai=n.hiRes.length?n.hiRes:dn(n.live,2);Pe(null,ai,!0)}let Rn=vo-n.started;if(!U&&Rn>Nc){re=!0,at(),n.active=!1,P("failed","halt"),q.latch_faulted?(T(p("diagnostics.lab.latchBanner")),le("diagnostics.lab.log.latchFaulted")):le("diagnostics.lab.log.neverStarted"),ye();return}if(U&&!rt||Rn>Y){re=!0,at(),l.busy=!1,U&&le("diagnostics.lab.log.stopped"),n.active=!1,await ft(M,N),ye();return}}catch(ze){if(Date.now()-n.started>Y){re=!0,at(),n.active=!1,P("failed","halt"),le("diagnostics.lab.log.traceFailed"),ye();return}}de()}};fe()}catch(B){n.active=!1,P("failed","halt"),le("diagnostics.lab.log.startFailed"),ye()}}}function fo(){at(),he(!1),n={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1,chartAt:0},s={open:null,close:null,seat:null},l=Sn(),f=!1,x.length=0,F.innerHTML="",T(""),Rt([]),P("idle"),ot("setup")}async function St(){n.aborted=!0,n.active=!1,at(),he(!1),l.busy=!1,T(p("diagnostics.lab.estopDone")),P("halted","halt"),le("diagnostics.lab.log.estop"),o="halted",ye();try{await cr()}catch(M){}Oe()}function Dt(){let M=Ma(o);M<0||M>=wa.length-1||ot(wa[M+1])}function La(M){if(M==="start"){he(!0),le("diagnostics.lab.log.selected",{zone:a}),ot("arm");return}if(M==="arm")return Ge();if(M==="seat")return ra("close","seat");if(M==="open")return ra("open","open");if(M==="close")return ra("close","close");if(M==="next")return Dt();if(M==="restart")return fo();if(M==="apply"){let N=[];s.open&&N.push(...ka(s.open,l.backend)),s.close&&N.push(...ka(s.close,l.backend)),N.forEach(B=>De(B.key,B.suggested)),P("applied","ok"),le("diagnostics.lab.log.applied"),ye()}}V.addEventListener("click",()=>La(V.dataset.action)),K.addEventListener("click",()=>La(K.dataset.action)),pe.addEventListener("click",St),I.addEventListener("click",()=>{if(!u.length)return;let M=n.direction||"trace";fs(u,"motor-lab-z"+a+"-"+M+".csv")}),h.addEventListener("change",()=>{a=Number(h.value||1),w.textContent=Pt()});function Aa(M){M.key==="Escape"&&D("section")==="motorlab"&&(M.preventDefault(),St())}window.addEventListener("keydown",Aa),oa(),_e(),ve(),P("idle"),Pe(null,[],!1),ye(),ca().then(M=>{let N=M&&M.data&&M.data.motor_safety?M.data.motor_safety:{};l.backend=N.backend||l.backend,l.armed=!!N.armed,l.latchFaulted=!!N.latch_faulted,l.latchArmLevel=N.latch_arm_level,l.latchStateLevel=N.latch_state_level,l.motorEnableLevel=N.motor_enable_level,M&&M.data&&M.data.drivers_enabled!=null&&(l.driversEnabled=!!M.data.drivers_enabled),ye()}).catch(()=>{}),L(i.drivers,Oe);for(let M of zn)L(M.id,()=>{ve(),c.analysis&&je()});W("manualMode",Oe),W("selectedZone",()=>{o==="setup"&&(a=Number(D("selectedZone")||a),h.value=String(a))}),R(e)}});var Hc=`
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
`;$("diag-system-card",Hc);var qc=()=>`
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
`,dg=H({tag:"diag-system-card",render:qc,onMount(t,e){let a=e.querySelector('[data-k="cpu0"]'),o=e.querySelector('[data-k="cpu1"]'),r=e.querySelector('[data-k="heap"]'),n=e.querySelector('[data-k="dma"]'),s=e.querySelector('[data-k="largestInternal"]'),c=e.querySelector('[data-k="minInternal"]'),u=e.querySelector('[data-k="psram"]'),m=e.querySelector('[data-k="largestPsram"]'),x=e.querySelector('[data-k="bleAds"]'),l=e.querySelector('[data-k="bleLastAdv"]'),f=e.querySelector('[data-k="bleState"]'),v=e.querySelector('[data-bar="cpu0"]'),w=e.querySelector('[data-bar="cpu1"]'),C=e.querySelector('[data-k="reset"]'),z=(g,h,S)=>{if(S==null||!Number.isFinite(Number(S))){g.textContent="\u2014",g.classList.remove("warn"),h.style.width="0%";return}let F=Math.max(0,Math.min(100,Number(S)));g.textContent=F.toFixed(0)+"%",g.classList.toggle("warn",F>=90),h.style.width=F+"%"},_=(g,h,S)=>{if(h==null||!Number.isFinite(Number(h))){g.textContent="\u2014";return}let F=Number(h);g.textContent=F+" KB",g.classList.toggle("warn",S!=null&&F<S)},b=g=>{if(g==null||!Number.isFinite(Number(g))||Number(g)<=0)return"\u2014";let h=Number(g);return h<1e3?Math.round(h)+" ms":h<6e4?(h/1e3).toFixed(1)+" s":Math.round(h/6e4)+" min"},d=()=>{z(a,v,E(i.cpuLoadCore0)),z(o,w,E(i.cpuLoadCore1)),_(r,E(i.freeInternalKb),48),_(n,E(i.freeDmaKb),32),_(s,E(i.largestInternalKb),24),_(c,E(i.minInternalKb),48),_(u,E(i.freePsramKb),null),_(m,E(i.largestPsramKb),null);let g=E(i.bleAdsPerSec);g==null||!Number.isFinite(Number(g))?x.textContent="\u2014":x.textContent=Number(g).toFixed(1)+"/s",l.textContent=b(E(i.bleLastAdvAgeMs));let h=A(i.bleDemanded)==="on",S=A(i.bleHubEnabled)==="on",F=A(i.bleScanning)==="on",j=[];j.push(h?"demanded":"idle"),S?j.push(F?"scanning":"on"):j.push("off"),f.textContent=j.join(" \xB7 ");let I=String(A(i.resetReason)||D("resetReason")||"").trim();C.textContent=I||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{ur().catch(g=>console.error("[System] dump failed:",g))}),L(i.cpuLoadCore0,d),L(i.cpuLoadCore1,d),L(i.freeInternalKb,d),L(i.freeDmaKb,d),L(i.largestInternalKb,d),L(i.minInternalKb,d),L(i.freePsramKb,d),L(i.largestPsramKb,d),L(i.bleAdsPerSec,d),L(i.bleLastAdvAgeMs,d),L(i.bleHubEnabled,d),L(i.bleScanning,d),L(i.bleDemanded,d),L(i.resetReason,d),W("resetReason",d),R(e),d()}});var js=`
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
`;function co({liveHtml:t="",provisionHtml:e="",attrs:a=""}={}){return`<div class="lds-int-split int-split" data-lds-int-split ${a}>${t}${e}</div>`}var Mn="hv6_available_probes",Ln=new Set,et=2,An=8;function Sa(t){let e=Number(t);return Number.isFinite(e)&&e>=An?An:et}function Bc(t){return t?An:et}function mt(){try{return Sa(localStorage.getItem(Mn)||et)}catch(t){return et}}function jc(t){let e=Sa(t),a=et;try{a=Sa(localStorage.getItem(Mn)||et)}catch(o){a=et}if(e===a)return e;try{localStorage.setItem(Mn,String(e))}catch(o){}for(let o of Ln)o(e);return e}function Vs(t){return jc(Bc(t))}function po(t){return Ln.add(t),()=>Ln.delete(t)}function ut(t){let e=String(t||"").match(/(\d+)/);return e?Number(e[1]):0}function Vc(t,e){let a=`Probe ${t}`;return e==null||Number.isNaN(Number(e))?a:`${a} \xB7 ${(Math.round(Number(e)*10)/10).toFixed(1)}\xB0`}function ta({includeNone:t=!1,count:e=mt(),temps:a=null}={}){let o=Sa(e),r=t?'<option value="None" data-i18n="common.none">None</option>':"";for(let n=1;n<=o;n++){let s=a?a[n]:null,c=Vc(n,s);r+=`<option value="Probe ${n}">${c}</option>`}return r}function gt(t,e=mt(),a=null){let o=Sa(e),r=String(t||"").match(/(\d+)/);if(!r)return a||t;let n=Number(r[1]);return n>=1&&n<=o?`Probe ${n}`:a||`Probe ${o}`}function uo({flow:t,return:e,zoneProbes:a}){let o=Object.create(null),r=ut(t),n=ut(e);r&&(o[r]="flow"),n&&(o[n]=o[n]?"flow+return":"return");for(let s=1;s<=6;s++){let c=ut(a&&a[s]);c&&(o[c]=o[c]?`${o[c]}+Z${s}`:`Z${s}`)}return o}function za(t,e,a){let o=ut(t);if(!o)return!1;let r=e[o];return r?a?r!==a&&!String(r).split("+").includes(a):!0:!1}var Uc=`
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
`;$("settings-manifold-card",Uc);function Us(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}function En(t){return ut(t)}function Wc(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=E(y.probeTemp(e));return t}function Kc(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=A(y.probe(e));return t}var Zc=()=>{let t=mt(),e=ta({count:t}),a="";for(let o=1;o<=8;o++)a+=`<div class="sm-probe-row${o>t?" is-hidden":""}" data-probe-row="${o}">
      <span class="sm-probe-id">P${o}</span>
      <span class="sm-probe-temp" data-probe="${o}">\u2014</span>
      <span class="sm-probe-role" data-probe-role="${o}"></span>
    </div>`;return xe({className:"settings-manifold-card",titleHtml:`<span data-i18n="settings.manifold.title">Manifold Configuration</span>${Le("settings.manifold.help")}`,bodyHtml:co({liveHtml:`<div class="sm-probe-live">
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
      </div>`})})},_g=H({tag:"settings-manifold-card",render:Zc,onMount(t,e){let a=e.querySelector(".sm-type"),o=e.querySelector(".sm-flow"),r=e.querySelector(".sm-ret"),n=e.querySelector(".sm-flow-live"),s=e.querySelector(".sm-ret-live"),c=e.querySelector(".sm-probe-list"),u=e.querySelector("[data-probe-err]"),m=e.querySelector("[data-probe-warn]"),x=Ae(e,{immediate:!0});x.select(a,{read:()=>A(i.manifoldType)||"NO (Normally Open)",commit:d=>Ne("manifold_type",d)});function l(d){return uo({flow:d==="flow"?null:o.value||A(i.manifoldFlowProbe),return:d==="return"?null:r.value||A(i.manifoldReturnProbe),zoneProbes:Kc()})}function f(d){u&&(u.hidden=!d,u.textContent=d||"")}x.select(o,{read:()=>gt(A(i.manifoldFlowProbe)||"Probe 1",mt(),"Probe 1"),commit:async d=>{if(za(d,l("flow"),"flow")){f(p("settings.manifold.probeConflict")),x.refresh();return}f("");try{await Ne("manifold_flow_probe",d)}catch(g){f(p("settings.manifold.probeConflict")),x.refresh()}}}),x.select(r,{read:()=>gt(A(i.manifoldReturnProbe)||"Probe 2",mt(),"Probe 2"),commit:async d=>{if(za(d,l("return"),"return")){f(p("settings.manifold.probeConflict")),x.refresh();return}f("");try{await Ne("manifold_return_probe",d)}catch(g){f(p("settings.manifold.probeConflict")),x.refresh()}}});function v(d,g,h){return d===g&&d===h?p("settings.manifold.roleBoth"):d===g?p("settings.manifold.roleFlow"):d===h?p("settings.manifold.roleReturn"):""}function w(d,g){let h=Us(g);d.textContent=h,d.classList.toggle("is-empty",h==="\u2014")}function C(d){let g=ta({count:d,temps:Wc()});for(let h of[o,r]){let S=h.value,F=h===o?"Probe 1":"Probe 2";h.innerHTML=g,h.value=gt(S,d,F)}d>=2&&o.value===r.value&&(r.value=o.value==="Probe 1"?"Probe 2":"Probe 1")}function z(){if(!m)return;let d=0,g=0;for(let S=1;S<=6;S++){let F=String(A(y.enabled(S))||"").toLowerCase()==="on";F&&g++;let j=En(A(y.probe(S)));F&&j>=3&&d++}let h=d>0&&g>d;m.hidden=!h,h&&(m.textContent=p("settings.manifold.unusedProbeWarn",{enabled:g,assigned:d}))}function _(d,{commitClamp:g=!1}={}){c&&(c.dataset.count=String(d)),C(d);for(let h=1;h<=8;h++){let S=e.querySelector('[data-probe-row="'+h+'"]');S&&S.classList.toggle("is-hidden",h>d)}if(g){let h=gt(o.value||A(i.manifoldFlowProbe)||"Probe 1",d,"Probe 1"),S=gt(r.value||A(i.manifoldReturnProbe)||"Probe 2",d,"Probe 2");d>=2&&h===S&&(S=h==="Probe 1"?"Probe 2":"Probe 1"),h!==A(i.manifoldFlowProbe)&&Ne("manifold_flow_probe",h),S!==A(i.manifoldReturnProbe)&&Ne("manifold_return_probe",S),o.value=h,r.value=S}b()}function b(){let d=En(o.value||A(i.manifoldFlowProbe)),g=En(r.value||A(i.manifoldReturnProbe));w(n,d?E(y.probeTemp(d)):null),w(s,g?E(y.probeTemp(g)):null);let h=mt();c&&(c.dataset.count=String(h));for(let S=1;S<=8;S++){let F=e.querySelector('[data-probe-row="'+S+'"]'),j=e.querySelector('[data-probe="'+S+'"]'),I=e.querySelector('[data-probe-role="'+S+'"]'),Q=E(y.probeTemp(S)),ne=Us(Q),se=v(S,d,g);j&&(j.textContent=ne),I&&(I.textContent=se),F&&(F.classList.toggle("is-empty",ne==="\u2014"),F.classList.toggle("is-role",!!se),F.classList.toggle("is-hidden",S>h))}z()}o.addEventListener("change",b),r.addEventListener("change",b),L(i.manifoldType,x.refresh),L(i.manifoldFlowProbe,()=>{x.refresh(),b()}),L(i.manifoldReturnProbe,()=>{x.refresh(),b()});for(let d=1;d<=8;d++)L(y.probeTemp(d),()=>{C(mt()),b()});for(let d=1;d<=6;d++)L(y.probe(d),z),L(y.enabled(d),z);po(d=>{_(d,{commitClamp:!1}),x.refresh()}),R(e),_(mt()),x.refresh(),b()}});var Gc=`
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
`;$("settings-touch-card",Gc);var Xc=()=>xe({className:"settings-touch-card",titleHtml:"Lune Touch connection",bodyHtml:`
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
  `}),Tg=H({tag:"settings-touch-card",render:Xc,onMount(t,e){let a=e.querySelector(".touch-status"),o=e.querySelector(".touch-status-copy"),r=e.querySelector(".touch-identity"),n=e.querySelector(".touch-note"),s=e.querySelector(".touch-error"),c=e.querySelector(".touch-approve"),u=e.querySelector(".touch-disconnect");function m(){let x=be(i.authorityConfigured),l=be(i.authorityProposalPending),f=A(i.authorityState)||"unconfigured",v=l?A(i.authorityProposalInstallationId):A(i.authorityInstallationId),w=l?A(i.authorityProposalCoordinatorId):A(i.authorityCoordinatorId),C=A(i.authorityProposalName)||"Lune Touch",z=A(i.authorityProposalSite)||"House";a.classList.toggle("connected",x&&!l),a.classList.toggle("pending",l),o.innerHTML=l?`<strong>${C} is ready to connect</strong>${x?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:x?`<strong>Control approved</strong>${f.replace(/_/g," ")}${Number(E(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(E(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",r.hidden=!x&&!l,e.querySelector(".touch-name").textContent=l?C:"Lune Touch",e.querySelector(".touch-site").textContent=l?z:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=v||"\u2014",e.querySelector(".touch-coordinator-value").textContent=w||"\u2014",n.textContent=l?"Approval is local to this manifold. Discovery alone never grants control.":x?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",c.hidden=!l,u.hidden=!x||l}c.addEventListener("click",async()=>{s.textContent="",c.disabled=!0,c.textContent="Approving\u2026";try{await nr()}catch(x){s.textContent=(x==null?void 0:x.message)||"Unable to approve Lune Touch."}finally{c.disabled=!1,c.textContent="Approve Lune Touch"}}),u.addEventListener("click",async()=>{if(s.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){u.disabled=!0;try{await rr()}catch(x){s.textContent=(x==null?void 0:x.message)||"Unable to disconnect Lune Touch."}finally{u.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(x=>L(x,m)),m()}});var Yc=()=>xe({className:"settings-minimum-flow-card",titleHtml:`<span data-i18n="settings.minFlow.title">Minimum zone flow</span>${Le("settings.minFlow.help")}`,bodyHtml:`
    ${$e({on:!1,label:"Enable minimum zone flow",className:"smf-always",attrs:'data-i18n-label="settings.minFlow.title"'})}
    <div class="ui-row smf-pct-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Minimum total opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">Only across loops already accepting heat.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
    <p class="ui-note smf-failsafe" data-i18n="settings.minFlow.failsafe">
      Manifold valves are Normally Open: on power loss every valve opens. If the circulation pump is still powered (or recovers first), the secondary side can receive full unrestricted flow until V6 reboots and re-applies control.
    </p>
  `}),Og=H({tag:"settings-minimum-flow-card",render:Yc,onMount(t,e){let a=e.closest('[data-collapse-block="min-flow"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="min-flow"]'),r=e.querySelector(".smf-always");o&&r&&o.appendChild(r);let n=e.querySelector(".smf-pct"),s=e.querySelector(".smf-pct-row"),c=Ae(e,{immediate:!0}),u=m=>{a==null||a.classList.toggle("is-collapsed",!m),s.hidden=!m,s.setAttribute("aria-hidden",m?"false":"true"),n.disabled=!m};c.toggle(r,{read:()=>be(i.minimumFlowAlways),onChange:u,commit:m=>{let x=m?"on":"off";k(i.minimumFlowAlways,{state:x}),Ne("minimum_flow_always",x).catch(()=>k(i.minimumFlowAlways,{state:m?"off":"on"}))}}),c.num(n,{read:()=>E(i.minZoneFlowPct),commit:m=>{k(i.minZoneFlowPct,{value:m}),De("min_zone_flow_pct",m)}}),L(i.minimumFlowAlways,c.refresh),L(i.minZoneFlowPct,c.refresh),R(e),c.refresh()}});var Jc=`
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
`;$("settings-return-temp-card",Jc);function bt(t){return!!(t&&t!=="None")}function Ws(t){return"Probe "+(t+2)}function Qc(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=E(y.probeTemp(e));return t}function ed(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=A(y.probe(e));return t}function td(){for(let t=1;t<=6;t++)if(bt(A(y.probe(t))))return!0;return!1}function ad(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}var od=()=>{let t=ta({includeNone:!0}),e="";for(let a=1;a<=6;a++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${a}">
        <span class="ui-label srt-zone-label" data-zone-label="${a}">${it(a)}</span>
        <span class="ui-field"><div class="srt-probe-pair"><select class="ui-select srt-probe" data-zone="${a}">${t}</select><span class="srt-live" data-zone-live="${a}">\u2014</span></div></span>
      </div>`;return xe({className:"settings-return-temp-card",titleHtml:`<span data-i18n="settings.returnTemp.title">Return temperature</span>${Le("settings.returnTemp.help")}`,bodyHtml:`
      ${$e({on:!1,label:"Enable return temperature probes",className:"srt-enabled",attrs:'data-i18n-label="settings.returnTemp.title"'})}
      <div class="srt-err" hidden data-srt-err></div>
      <div class="srt-zones">${e}</div>
    `})},Gg=H({tag:"settings-return-temp-card",render:od,onMount(t,e){let a=e.closest('[data-collapse-block="return-temp"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="return-temp"]'),r=e.querySelector(".srt-enabled");o&&r&&o.appendChild(r);let n=e.querySelector(".srt-zones"),s=Array.from(e.querySelectorAll(".srt-probe")),c=e.querySelector("[data-srt-err]"),u=Object.create(null);function m(g){c&&(c.hidden=!g,c.textContent=g||"")}function x(g){let h=u[g]||Ws(g),S=ut(h);return S>=3&&S<=8?h:Ws(g)}function l(g){let h=a==null?void 0:a.querySelector("[data-probe-mode-hint]");if(!h)return;let S=g?"settings.returnTemp.modeOn":"settings.returnTemp.modeOff";h.setAttribute("data-i18n",S),h.textContent=p(S)}function f(g){Vs(g),a==null||a.classList.toggle("is-collapsed",!g),l(g),n.hidden=!g,n.setAttribute("aria-hidden",g?"false":"true");for(let h of s)h.disabled=!g}async function v(){let g=A(i.manifoldFlowProbe)||"Probe 1",h=A(i.manifoldReturnProbe)||"Probe 2",S=gt(g,et,"Probe 1"),F=gt(h,et,"Probe 2");S===F&&(F=S==="Probe 1"?"Probe 2":"Probe 1"),S!==g&&await Ne("manifold_flow_probe",S),F!==h&&await Ne("manifold_return_probe",F)}function w(){let g=ta({includeNone:!0,temps:Qc()});for(let h of s){let S=h.value;h.innerHTML=g,[...h.options].some(F=>F.value===S)?h.value=S:bt(S)?h.value=x(Number(h.dataset.zone)):h.value="None"}}function C(){for(let g=1;g<=6;g++){let h=e.querySelector('[data-zone-label="'+g+'"]');h&&(h.innerHTML=it(g))}}function z(){for(let g of s){let h=Number(g.dataset.zone),S=e.querySelector('[data-zone-live="'+h+'"]');if(!S)continue;let F=ut(g.value),j=F?ad(E(y.probeTemp(F))):"\u2014";S.textContent=j,S.classList.toggle("is-empty",j==="\u2014")}}function _(g){let h=ed();return delete h[g],uo({flow:A(i.manifoldFlowProbe),return:A(i.manifoldReturnProbe),zoneProbes:h})}let b=Ae(e,{immediate:!0}),d;for(let g of s){let h=Number(g.dataset.zone);b.select(g,{read:()=>{let S=A(y.probe(h));return bt(S)?(u[h]=S,S):x(h)},commit:async S=>{if(!(!d||!d.staged)){if(bt(S)&&za(S,_(h),`Z${h}`)){m(p("settings.manifold.probeConflict")),b.refresh();return}m(""),u[h]=S;try{await lt(h,"zone_probe",S)}catch(F){m(p("settings.manifold.probeConflict")),b.refresh()}}}}),g.addEventListener("change",z)}d=b.toggle(r,{read:()=>td(),onChange:g=>{if(g)for(let h of s){let S=Number(h.dataset.zone);bt(h.value)||(h.value=x(S)),bt(h.value)&&(u[S]=h.value)}else for(let h of s){let S=Number(h.dataset.zone);bt(h.value)&&(u[S]=h.value)}f(g),z()},commit:async g=>{if(!g){await v();for(let h of s){let S=Number(h.dataset.zone);bt(h.value)&&(u[S]=h.value),await lt(S,"zone_probe","None")}return}for(let h of s){let S=Number(h.dataset.zone),F=bt(h.value)?h.value:x(S);u[S]=F,await lt(S,"zone_probe",F)}}});for(let g=1;g<=6;g++)L(y.probe(g),()=>{b.refresh(),z()}),L(y.name(g),C);for(let g=1;g<=8;g++)L(y.probeTemp(g),z);po(()=>{w(),z()}),R(e),C(),b.refresh(),z()}});var nd=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function rd(){if(String(A(i.bleClockSyncAdvertising)||"").toLowerCase()==="on")return p("common.clockSyncing");let t=String(A(i.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return p("settings.bleClock.waitingClock");if(t==="ble_busy")return p("settings.bleClock.busy");if(t)return t;let e=Number(E(i.bleClockSyncLastOkS)||0);if(!e)return p("settings.bleClock.never");let a=Math.max(0,Math.round(Date.now()/1e3)-e);if(a<60)return p("common.secondsAgo",{value:a});if(a<3600)return p("common.minutesAgo",{value:Math.round(a/60)});let o=Math.round(a/3600);return p("settings.bleClock.hoursAgo",{value:o})}var sd=()=>xe({className:"settings-ble-clock-card",titleHtml:`<span data-i18n="settings.bleClock.title">Room clocks</span>${Le("settings.bleClock.help")}`,bodyHtml:`
    ${$e({on:!1,label:"Enable room clock sync",className:"sbc-enabled",attrs:'data-i18n-label="settings.bleClock.title"'})}
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
  `}),ob=H({tag:"settings-ble-clock-card",render:sd,onMount(t,e){let a=e.closest('[data-collapse-block="ble-clock"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="ble-clock"]'),r=e.querySelector(".sbc-enabled");o&&r&&o.appendChild(r);let n=e.querySelector(".sbc-body"),s=e.querySelector(".sbc-interval"),c=e.querySelector(".sbc-status"),u=e.querySelector(".sbc-now"),m=Ae(e,{immediate:!0}),x=()=>{let v=s.value;s.innerHTML=nd.map(w=>`<option value="${w.value}">${p(w.labelKey)}</option>`).join(""),v&&(s.value=v)},l=()=>{c.textContent=rd()},f=v=>{a==null||a.classList.toggle("is-collapsed",!v),n&&(n.hidden=!v,n.setAttribute("aria-hidden",v?"false":"true")),s.disabled=!v,u.disabled=!v};x(),m.toggle(r,{read:()=>be(i.bleClockSyncEnabled),onChange:f,commit:v=>{let w=v?"on":"off";k(i.bleClockSyncEnabled,{state:w}),Ne("ble_clock_sync_enabled",w).catch(()=>k(i.bleClockSyncEnabled,{state:v?"off":"on"}))}}),m.select(s,{read:()=>String(Math.round(Number(E(i.bleClockSyncIntervalMin))||60)),commit:v=>{let w=Number(v);k(i.bleClockSyncIntervalMin,{value:w}),De("ble_clock_sync_interval_min",w)}}),u.addEventListener("click",()=>{k(i.bleClockSyncAdvertising,{state:"on"}),l(),Be("ble_clock_sync_now")}),L(i.bleClockSyncEnabled,m.refresh),L(i.bleClockSyncIntervalMin,m.refresh),L(i.bleClockSyncLastOkS,l),L(i.bleClockSyncLastError,l),L(i.bleClockSyncAdvertising,l),R(e),m.refresh(),l()}});var id=`
.settings-action-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-action-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-action-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-action-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-action-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;$("settings-control-card",id);var ld=()=>xe({className:"settings-action-card",titleHtml:"Recovery actions",bodyHtml:`
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  `}),db=H({tag:"settings-control-card",render:ld,onMount(t,e){R(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&Be("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{Be("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&Be("restart")})}});var cd=`
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
`;$("settings-motor-calibration-card",cd);var mo=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"open-endstop-current-factor",key:"open_endstop_current_factor",id:i.openEndstopCurrentFactor,labelKey:"settings.motor.openEndstopCurrentFactor",unit:"x"},{cls:"open-endstop-stall-fraction",key:"open_endstop_stall_fraction",id:i.openEndstopStallFraction,labelKey:"settings.motor.openEndstopStallFraction",unit:"k"},{cls:"close-trailing-step-ma",key:"close_trailing_step_ma",id:i.closeTrailingStepMa,labelKey:"settings.motor.closeTrailingStepMa",unit:"mA"},{cls:"close-trailing-sustain-ms",key:"close_trailing_sustain_ms",id:i.closeTrailingSustainMs,labelKey:"settings.motor.closeTrailingSustainMs",unit:"ms"},{cls:"close-trailing-ref-ms",key:"close_trailing_ref_ms",id:i.closeTrailingRefMs,labelKey:"settings.motor.closeTrailingRefMs",unit:"ms"},{cls:"cap-close-seat-ma",key:"cap_close_seat_ma",id:i.capCloseSeatMa,labelKey:"settings.motor.capCloseSeatMa",unit:"mA"},{cls:"cap-close-seat-frames",key:"cap_close_seat_frames",id:i.capCloseSeatFrames,labelKey:"settings.motor.capCloseSeatFrames",unit:"frames"},{cls:"cap-close-popoff-ma",key:"cap_close_popoff_ma",id:i.capClosePopoffMa,labelKey:"settings.motor.capClosePopoffMa",unit:"mA"},{cls:"cap-stall-ma",key:"cap_stall_ma",id:i.capStallMa,labelKey:"settings.motor.capStallMa",unit:"mA"},{cls:"cap-open-stop-ma",key:"cap_open_stop_ma",id:i.capOpenStopMa,labelKey:"settings.motor.capOpenStopMa",unit:"mA"},{cls:"cap-circuit-fault-ma",key:"cap_circuit_fault_ma",id:i.capCircuitFaultMa,labelKey:"settings.motor.capCircuitFaultMa",unit:"mA"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],dd=()=>{let t="";for(let e=0;e<mo.length;e++){let a=mo[e];if(a.key==="generic_runtime_limit_seconds")continue;let o=pd(a.key)?"1":"any";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+a.labelKey+'">'+p(a.labelKey)+"</span> ("+a.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+a.cls+'" value="0" step="'+o+'"></span></div>'}return xe({className:"settings-motor-cal-card",titleHtml:`<span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${Le("settings.motor.help")}`,bodyHtml:`
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field">${$e({on:!1,label:"Toggle motor drivers",className:"mc-drivers-toggle",attrs:'data-i18n-label="settings.motor.toggleDrivers"'})}</span>
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
    `})};function pd(t){return t==="learned_factor_min_samples"||t==="close_trailing_sustain_ms"||t==="close_trailing_ref_ms"||t==="cap_close_seat_frames"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var xb=H({tag:"settings-motor-calibration-card",render:dd,onMount(t,e){let a=e.querySelector(".smc-profile"),o=e.querySelector(".smc-safe-runtime"),r=e.querySelector(".mc-drivers-toggle"),n=Ae(e);function s(u){if(u==="HmIP VdMot"&&De("hmip_runtime_limit_seconds",34),u==="Generic"){let m=Number(E(i.genericRuntimeLimitSeconds));(!Number.isFinite(m)||m<=0)&&De("generic_runtime_limit_seconds",45)}}n.toggle(r,{read:()=>be(i.drivers),commit:u=>la(u)}),n.select(a,{read:()=>A(i.motorProfileDefault)||"HmIP VdMot",commit:u=>{Ne("motor_profile_default",u),s(u)}});function c(){let u=A(i.motorProfileDefault)||"HmIP VdMot";o.disabled=u==="HmIP VdMot"}n.num(o,{read:()=>(A(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?E(i.hmipRuntimeLimitSeconds):E(i.genericRuntimeLimitSeconds),commit:u=>{a.value==="Generic"&&De("generic_runtime_limit_seconds",u)}});for(let u=0;u<mo.length;u++){let m=mo[u];if(m.key==="generic_runtime_limit_seconds")continue;let x=e.querySelector(".smc-"+m.cls);x&&(n.num(x,{read:()=>E(m.id),commit:l=>De(m.key,l)}),L(m.id,n.refresh))}L(i.drivers,n.refresh),L(i.motorProfileDefault,()=>{n.refresh(),c()}),L(i.genericRuntimeLimitSeconds,n.refresh),L(i.hmipRuntimeLimitSeconds,n.refresh),R(e),s(A(i.motorProfileDefault)||"HmIP VdMot"),n.refresh(),c()}});var ud=600*1e3,Ks=600,md=`
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
`;$("settings-firmware-card",md);var gd=()=>xe({className:"settings-firmware-card",titleHtml:`<span data-i18n="settings.firmware.title">Firmware</span>${Le("settings.firmware.help")}`,bodyHtml:`
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
  `});function Zs(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function Ca(t,e){let a=Zs(t);if(!a)return!1;let o=Zs(e);if(!o)return!0;for(let r=0;r<3;r++)if(a[r]!==o[r])return a[r]>o[r];return!1}function Gs(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function bd(t){let e=String(t||"").trim();return e.length<=Ks?e:e.slice(0,Ks).replace(/\s+\S*$/,"")+"\u2026"}function fd(){let t=document.querySelector(".settings-backup-card");if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});let e=t.querySelector(".sbk-save");e&&e.focus({preventScroll:!0})}var Lb=H({tag:"settings-firmware-card",render:gd,onMount(t,e){let a=e.querySelector(".sfw-version"),o=e.querySelector(".sfw-status"),r=e.querySelector(".sfw-check"),n=e.querySelector(".sfw-banner"),s=e.querySelector(".sfw-hop"),c=e.querySelector(".sfw-notes"),u=e.querySelector(".sfw-install"),m=e.querySelector(".sfw-asset"),x=e.querySelector(".sfw-jump"),l=e.querySelector(".sfw-file"),f=e.querySelector(".sfw-choose"),v=e.querySelector(".sfw-upload"),w=e.querySelector(".sfw-filename"),C=e.querySelector(".sfw-progress"),z=C.querySelector("i"),_=e.querySelector(".sfw-upload-status"),b=null,d=!1,g=0,h=!1,S=()=>A(i.firmware)||D("firmwareVersion")||"",F=(V,K)=>{o.textContent=V||"",o.className="ui-sublabel sfw-status"+(K?" "+K:"")},j=()=>{let V=$t.firmware_update;if(!V||V.available!==!0)return null;let K=String(V.latest||"").trim();return K?{tag:K,notes:p("settings.firmware.deviceReported"),asset:Po(K)}:null},I=()=>{let V=j();return b?V&&Ca(V.tag,b.tag)?V:b:V},Q=()=>{a.textContent=S()||p("settings.firmware.unknownVersion")},ne=()=>{let V=I(),K=!!V&&Ca(V.tag,S());if(n.hidden=!K,!K){We("firmwareUpdateAvailable",null);return}s.innerHTML=Gs(S()||p("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+Gs(V.tag),c.textContent=bd(V.notes)||p("common.noData"),m.href=V.asset.url,m.setAttribute("download",V.asset.name),m.title=V.asset.name,We("firmwareUpdateAvailable",{current:S(),latest:V.tag,url:V.asset.url})},se=V=>{d||!V&&g&&Date.now()-g<ud||(d=!0,g=Date.now(),r.disabled=!0,F(p("settings.firmware.checking")),Promise.resolve(mr()).catch(()=>{}),fr().then(K=>{b=K,ne();let pe=Ca(K.tag,S());F(pe?p("settings.firmware.availableStatus",{version:K.tag}):p("settings.firmware.upToDate"),pe?null:"ok")}).catch(K=>{b=null,ne();let pe=j();if(pe){F(Ca(pe.tag,S())?p("settings.firmware.availableStatus",{version:pe.tag}):p("settings.firmware.upToDate"),Ca(pe.tag,S())?null:"ok");return}if((K instanceof vt?K.code:"network")==="no_releases"){F(p("settings.firmware.noReleases"),"ok");return}F(p("settings.firmware.checkFailed"),"err")}).finally(()=>{d=!1,r.disabled=!1}))};r.addEventListener("click",()=>se(!0)),x.addEventListener("click",fd),u.addEventListener("click",()=>{let V=I();V&&window.confirm(p("settings.firmware.confirmInstall",{version:V.tag}))&&(u.disabled=!0,u.textContent=p("settings.firmware.installing"),Promise.resolve(gr()).then(()=>F(p("settings.firmware.installStarted"))).catch(()=>{F(p("settings.firmware.installFailed"),"err"),u.disabled=!1,u.textContent=p("settings.firmware.install")}))}),f.addEventListener("click",()=>l.click()),l.addEventListener("change",()=>{let V=l.files&&l.files[0];w.textContent=V?V.name:p("settings.firmware.noFile"),v.disabled=!V||h,_.textContent="",_.className="ui-note sfw-upload-status"}),v.addEventListener("click",()=>{let V=l.files&&l.files[0];!V||h||window.confirm(p("settings.firmware.confirmUpload",{file:V.name}))&&(h=!0,v.disabled=!0,f.disabled=!0,C.hidden=!1,z.style.width="0%",_.className="ui-note sfw-upload-status",_.textContent=p("settings.firmware.uploading",{value:0}),Promise.resolve(br()).catch(K=>console.warn("[Firmware] prepare rejected, continuing with upload:",K)).then(()=>hr(V,K=>{z.style.width=K+"%",_.textContent=p("settings.firmware.uploading",{value:K})})).then(()=>{z.style.width="100%",_.className="ui-note sfw-upload-status",_.textContent=p("settings.firmware.uploadDone")}).catch(K=>{console.error("[Firmware] upload failed:",K),C.hidden=!0,_.textContent=p("settings.firmware.uploadFailed")}).finally(()=>{h=!1,f.disabled=!1,v.disabled=!1}))}),W("section",()=>{D("section")==="settings"&&se(!1)}),L(i.firmware,()=>{Q(),ne()}),L("firmware_update",ne),R(e),Q(),D("section")==="settings"&&se(!1)}});var hd=`
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
`;$("settings-backup-card",hd);var vd=()=>xe({className:"settings-backup-card",titleHtml:`<span data-i18n="settings.backup.title">Backup and restore</span>${Le("settings.backup.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field">${$e({on:!0,label:"Restore learned motor values",className:"sbk-learned",attrs:'data-i18n-label="settings.backup.restoreLearned"'})}</span>
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
  `}),Pb=H({tag:"settings-backup-card",render:vd,onMount(t,e){let a=e.querySelector(".sbk-save"),o=e.querySelector(".sbk-learned"),r=e.querySelector(".sbk-file"),n=e.querySelector(".sbk-choose"),s=e.querySelector(".sbk-restore"),c=e.querySelector(".sbk-filename"),u=e.querySelector(".sbk-status"),m=e.querySelector(".sbk-result"),x=!0,l=!1,f=(v,w)=>{u.textContent=v||"",u.className="sbk-status"+(w?" "+w:"")};o.addEventListener("click",()=>{x=!x,Ka(o,{on:x})}),a.addEventListener("click",()=>{l||(l=!0,a.disabled=!0,m.textContent="",f(p("settings.backup.saving")),vr(!0).then(v=>{if(!ja(v))throw new Error("unexpected_export_payload");f(p("settings.backup.saved",{file:yr(v)}),"ok")}).catch(v=>{console.error("[Backup] export failed:",v),f(p("settings.backup.saveFailed"),"err")}).finally(()=>{l=!1,a.disabled=!1}))}),n.addEventListener("click",()=>r.click()),r.addEventListener("change",()=>{let v=r.files&&r.files[0];c.textContent=v?v.name:p("settings.backup.noFile"),s.disabled=!v||l,m.textContent="",f("")}),s.addEventListener("click",async()=>{let v=r.files&&r.files[0];if(!v||l)return;let w="";try{w=await v.text()}catch(z){f(p("settings.backup.readFailed"),"err");return}let C=null;try{C=JSON.parse(w)}catch(z){f(p("settings.backup.invalidFile"),"err");return}if(!ja(C)){f(p("settings.backup.invalidFile"),"err");return}window.confirm(p("settings.backup.confirmRestore",{file:v.name}))&&(l=!0,s.disabled=!0,m.textContent="",f(p("settings.backup.restoring")),xr(C,x).then(z=>{f(p("settings.backup.restored"),"ok"),m.textContent=p("settings.backup.result",{applied:z.applied,skipped:z.skipped,ignored:z.ignored})}).catch(z=>{console.error("[Backup] restore failed:",z),f(p("settings.backup.restoreFailed"),"err")}).finally(()=>{l=!1,s.disabled=!1}))}),R(e)}});var xd=()=>xe({className:"settings-appearance-card",titleHtml:`<span data-i18n="settings.appearance.title">Appearance</span>${Le("settings.appearance.help")}`,bodyHtml:'<p class="ui-copy" data-i18n="settings.appearance.product">Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.</p>'}),Hb=H({tag:"settings-appearance-card",render:xd,onMount(t,e){R(e)}});var yd=`
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
`;$("smart-preheat-card",yd);var wd=()=>xe({className:"smart-preheat-card",titleHtml:`<span data-i18n="settings.preheat.title">Preheat</span>${Le("settings.preheat.help")}`,bodyHtml:`
    ${$e({on:!1,label:"Toggle preheat absorption",className:"absorb-toggle",attrs:'data-i18n-label="settings.preheat.toggle"'})}
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
  `}),Gb=H({tag:"smart-preheat-card",render:wd,onMount(t,e){let a=e.closest('[data-collapse-block="preheat"]'),o=a==null?void 0:a.querySelector('[data-toggle-host="preheat"]'),r=e.querySelector(".absorb-toggle");o&&r&&o.appendChild(r);let n=e.querySelector(".absorb-badge"),s=e.querySelector(".absorb-band"),c=e.querySelector(".absorb-delta"),u=e.querySelector(".absorb-body"),m=Ae(e,{immediate:!0}),x=f=>{a==null||a.classList.toggle("is-collapsed",!f),u&&(u.hidden=!f,u.setAttribute("aria-hidden",f?"false":"true")),s.disabled=!f,c.disabled=!f};m.toggle(r,{read:()=>be(i.preheatAbsorbEnabled),onChange:x,commit:f=>{let v=f?"on":"off";k(i.preheatAbsorbEnabled,{state:v}),Ne("preheat_absorb_enabled",v)}}),m.num(s,{read:()=>E(i.preheatAbsorbBandC),commit:f=>{k(i.preheatAbsorbBandC,{value:f}),De("preheat_absorb_band_c",f)}}),m.num(c,{read:()=>E(i.preheatDetectDeltaC),commit:f=>{k(i.preheatDetectDeltaC,{value:f}),De("preheat_detect_delta_c",f)}});function l(){let f=String(A(i.preheatAbsorbing)||"idle").toLowerCase(),v=f==="armed"||f==="reactive"||f==="active"?f==="active"?"reactive":f:"idle",w=v==="armed"?"settings.preheat.armed":v==="reactive"?"settings.preheat.reactive":"common.idle";n.textContent=p(w),n.classList.toggle("active",v!=="idle"),n.dataset.mode=v}L(i.preheatAbsorbEnabled,m.refresh),L(i.preheatAbsorbing,l),L(i.preheatAbsorbBandC,m.refresh),L(i.preheatDetectDeltaC,m.refresh),R(e),m.refresh(),l()}});var kd=`
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
`;$("help-external-ingest",kd);function Tn(){return window.location.origin||"http://lune-v6.local"}function _d(){return`// Shelly script \u2014 POST BTHome temps to Lune V6 (no zone number).
// 1) On V6: zone \u2192 External, set sensor_id to the BLU MAC.
// 2) Paste this on Mini PM / BLU Gateway (Gen3+). Adjust SENSOR_ID if needed.
// X-Lune-CSRF is required (any value); it is not a secret \u2014 LAN trust model.

let CONFIG = {
  v6_url: "${Tn()}/api/v1/room-temperatures",
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
`}function Sd(){return`# Home Assistant \u2014 rest_command + automation (no zone in payload).
# On V6: External source + sensor_id matching the entity you map below.
# X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

rest_command:
  lune_v6_room_temp:
    url: "${Tn()}/api/v1/room-temperatures"
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
`}function zd(){return`// HomeyScript \u2014 forward a Homey temperature capability to Lune V6.
// On V6: External + sensor_id (use Homey device id or a stable string you choose).
// X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

const V6_URL = "${Tn()}/api/v1/room-temperatures";
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
`}var Cd={shelly:_d,ha:Sd,homey:zd},af=H({tag:"help-external-ingest",render:()=>`
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
  `,onMount(t,e){let a="shelly",o=e.querySelector(".hei-code"),r=e.querySelectorAll(".hei-tab");function n(){r.forEach(s=>s.setAttribute("aria-selected",s.dataset.tab===a?"true":"false")),o.textContent=Cd[a]()}return r.forEach(s=>s.addEventListener("click",()=>{a=s.dataset.tab,n()})),e.querySelector(".hei-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.textContent||"")}catch(s){}}),n(),R(e),void 0}});var Ys="(prefers-color-scheme: dark)",aa=null,Xs=!1;function Md(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(Ys).matches?"dark":"light"}function Ld(){let t=Md();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,e.classList.remove("theme-refined-ember","theme-deep-forest"),delete e.dataset.theme,!Xs&&typeof window!="undefined"&&typeof window.matchMedia=="function"){aa=window.matchMedia(Ys);let a=()=>{let o=aa.matches?"dark":"light";e.dataset.colorScheme=o,e.style.colorScheme=o,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:o}))};typeof aa.addEventListener=="function"?aa.addEventListener("change",a):typeof aa.addListener=="function"&&aa.addListener(a),Xs=!0}return t}function Js(){return Ld()}function Qs(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}var ei=`
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
`;function Fn(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ti({title:t="",stack:e="",kicker:a="Hardware provisioning",save:o="",saveLabel:r="Save configuration",extra:n="",remove:s="",removeLabel:c="Remove"}={}){let u=o?`<button type="button" class="lds-btn-save btn-save" ${o}>${Fn(r)}</button>`:"",m=s?`<button type="button" class="lds-btn-danger btn-danger" ${s}>${Fn(c)}</button>`:"",x=n||m?`<div class="lds-form-extra form-extra">${n}${m}</div>`:"";return`<aside class="lds-provision provision" data-lds-provision>
  <div class="lds-form form" data-lds-form>
    <div class="lds-form-head form-head">
      <h3>${Fn(a)}</h3>
      <h2>${t}</h2>
    </div>
    <div class="lds-form-stack form-stack">${e}</div>
    <div class="lds-form-actions form-actions">
      ${u}
      ${x}
    </div>
  </div>
</aside>`}Js();var Ad=`
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
`;$("hv6-app-root",Ad);$("lds-manifold-row",ts);$("lds-form",ei);$("lds-int-split",js);var Ed=co({liveHtml:'<div class="zone-live"><p class="zone-kicker">Comfort control</p><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-slot"></div></div>',provisionHtml:ti({title:'<span class="provision-zone-title">Zone</span>',stack:'<section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section><div class="zone-actuator-slot"></div>'})}),Td=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand lune-lockup" aria-label="Lune V6"><span data-live-mark="sidebar"></span><span class="product">V6</span></div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><article class="manifold" data-overview-manifold><div class="manifold-mark" data-live-mark="overview"></div><div class="loops" data-overview-loops></div><div class="manifold-meta" data-overview-meta></div></article><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Flow history</h3><p>24-hour flow, return and demand.</p></div></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><article class="manifold zone-overview"><div class="manifold-mark" data-live-mark="zones"></div><div class="zone-overview-strip loops" role="group" aria-label="Select zone"></div><div class="manifold-meta" data-zone-meta></div></article>${Ed}</section></section>
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
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;H({tag:"app-root",render:Td,onMount(t,e){e.querySelector(".hdr").appendChild(ce("hv6-header")),e.querySelector(".side-nav-slot").appendChild(ce("hv6-sidebar")),e.querySelector(".hydraulic-history-slot").appendChild(ce("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(ce("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(ce("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(ce("zone-detail",{zone:D("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(ce("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(ce("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(ce("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(ce("zone-room-card")),e.querySelector(".touch-slot").appendChild(ce("settings-touch-card"));let a=ce("settings-manifold-card");e.querySelector(".manifold-slot").appendChild(a),a.querySelector(".return-temp-slot").appendChild(ce("settings-return-temp-card")),e.querySelector(".minimum-flow-slot").appendChild(ce("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(ce("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(ce("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(ce("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(ce("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(ce("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(ce("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(ce("settings-control-card")),e.querySelector(".manual-control-col").appendChild(ce("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(ce("diag-zone-motor-card",{zone:D("selectedZone")||1}));let o=e.querySelector(".motor-lab-slot"),r=e.querySelector('.sec[data-section="motorlab"]');function n(){let T=Qs(A(i.firmware)||D("firmwareVersion")),P=e.querySelector('.v6-side-link[data-section="motorlab"]');P&&(P.hidden=!T),r&&(r.hidden=!T),T&&o&&!o.firstChild&&o.appendChild(ce("diag-motor-lab")),!T&&D("section")==="motorlab"&&Ve("diagnostics")}L(i.firmware,n),W("firmwareVersion",n),W("section",n),n(),e.querySelector(".logs-main-col").appendChild(ce("logs-view")),e.querySelector(".system-health-slot").appendChild(ce("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(ce("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(ce("diag-i2c"));let s=e.querySelector(".help-external-slot");s&&s.appendChild(ce("help-external-ingest"));let c=e.querySelectorAll(".sec"),u=e.querySelector(".shell"),m=e.querySelector(".zone-detail-view"),x=e.querySelector(".selected-zone-title"),l=e.querySelector(".provision-zone-title"),f=e.querySelector(".zone-overview-strip"),v=e.querySelector("[data-overview-loops]"),w=e.querySelector("[data-overview-meta]"),C=e.querySelector("[data-zone-meta]"),z=e.querySelector(".mobile-zone-dock"),_=e.querySelector(".mobile-zone-dock .zone-chipstrip");function b(){e.querySelectorAll("[data-live-mark]").forEach(P=>{let ae=P.getAttribute("data-live-mark");if(ae==="sidebar"){if(P.dataset.staticLockup==="1")return;P.innerHTML=es(),P.dataset.staticLockup="1";return}P.dataset.staticMark!=="1"&&(ss(P,{states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:ae,landscape:!0,sku:"V6"}),P.dataset.staticMark="1")});let T=is();w&&(w.innerHTML=T),C&&(C.innerHTML=T)}function d(T){let P=be(y.enabled(T)),ae=String(A(y.state(T))||"").toUpperCase()||"OFF",ee=String(A(y.motorLastFault(T))||"").toUpperCase();return P?P&&(ae==="FAULT"||ee&&ee!=="NONE"&&ee!=="OK")?"FAULT":ae:"OFF"}function g(T){return T==="HEATING"?p("state.heating"):T==="IDLE"?p("state.idle"):T==="FAULT"?p("common.fault"):T==="MANUAL"?p("state.manual"):T==="OVERHEATED"?p("state.overheated"):T==="CALIBRATING"?p("state.calibrating"):p("state.off")}function h(T){return T==="HEATING"||T==="CALLING"?"zs-heating":T==="OVERHEATED"?"zs-overheated":T==="FAULT"?"zs-fault":T==="IDLE"?"zs-idle":"zs-off"}function S(T){let P=String(T||"").trim();if(!P||/^none$/i.test(P)||P==="0"||P==="-1")return 0;let ae=P.match(/(\d+)/),ee=ae?Number(ae[1]):0;return ee>=1&&ee<=6?ee:0}function F(){var we;let T=[0,0,0,0,0,0,0];for(let Z=1;Z<=6;Z++)T[Z]=S(A(y.syncTo(Z)));let P=[0,0,0,0,0,0,0];for(let Z=1;Z<=6;Z++){let ve=Z;for(let _e=0;_e<6;_e++){let Se=T[ve];if(!Se||Se<1||Se>6)break;if(Se===Z){ve=Z;break}ve=Se}P[Z]=ve}let ae={};for(let Z=1;Z<=6;Z++)(ae[we=P[Z]]||(ae[we]=[])).push(Z);let ee=[[],[],[],[],[],[],[]];for(let Z=1;Z<=6;Z++){let ve=ae[P[Z]]||[Z],_e=ve.length>1&&ve.some(Se=>T[Se]>0);ee[Z]=_e?ve.filter(Se=>Se!==Z):[]}return{roots:P,partners:ee}}function j(){return window.matchMedia("(min-width: 901px)").matches}function I(){let T=F(),P=D("selectedZone")||1,ae=j();f.setAttribute("role",ae?"group":"list"),f.setAttribute("aria-label",ae?"Select zone":"Zone status overview"),f.innerHTML=Array.from({length:6},(ee,we)=>{var M;let Z=we+1,ve=Z===P,_e=Me(Z),Se=it(Z),Ze=kt(Z),Oe=Ke(Z),je=Ze==="unused"?"\u2014":Ut(E(y.temp(Z))),Pe=Ze==="unused"?"\u2014":Ut((M=E(y.effectiveSetpoint(Z)))!=null?M:E(y.setpoint(Z))),ye=Ze==="unused"?"\u2014":He(Z)||"\u2014",he=d(Z),at=g(he),ot=h(he),Ge=T.partners[Z],ft=Ge.length>0,na=ft?p("overview.zone.mergedWith",{zones:Ge.map(Ke).join(", ")}):"",ra=ft&&Ge.includes(Z+1)&&T.roots[Z]===T.roots[Z+1],fo=ft&&Ge.includes(Z-1)&&T.roots[Z]===T.roots[Z-1],St=[ft?"is-merged":"",ra?"zo-pair-start":"",fo?"zo-pair-cont":"",Ze==="calling"?"is-calling":"",Ze==="unused"?"is-unused":""].filter(Boolean).join(" "),Dt=`${_e}, ${je} / ${Pe}, ${at}${na?", "+na:""}`.replace(/"/g,"&quot;"),La=ft?`<span class="zo-merge">${na}</span>`:"",Aa=`<span class="zo-status" aria-hidden="true"></span><span class="loop-id">${Oe}</span><span class="loop-name">${ye.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span><span class="zo-title zone-label-compact">${Se}</span><span class="zo-temps loop-temp">${je}</span>${La}`;return ae?`<button type="button" class="zone-overview-card ${ot}${St?" "+St:""}" data-zone-select="${Z}" aria-current="${ve?"true":"false"}" aria-label="${Dt}" title="${Dt}" tabindex="${ve?"0":"-1"}">${Aa}</button>`:`<div class="zone-overview-card ${ot}${St?" "+St:""}" role="listitem" aria-label="${Dt}" title="${Dt}">${Aa}</div>`}).join("")}function Q(){let T=D("selectedZone")||1;_.innerHTML=Array.from({length:6},(P,ae)=>{let ee=ae+1,we=ee===T,Z=Me(ee),ve=it(ee),_e=Z.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${we}" aria-label="${_e}" title="${_e}" tabindex="${we?"0":"-1"}" data-zone-select="${ee}">${ve}</button>`}).join("")}function ne(){v&&(v.innerHTML=Array.from({length:6},(T,P)=>{let ae=P+1,ee=Me(ae),we=kt(ae),Z=Ke(ae),ve=E(y.valve(ae)),_e=we==="unused"?"\u2014":Ut(E(y.temp(ae))),Se=we==="unused"?"\u2014":Za(ve),Ze=as(ve,we),Oe=we==="unused"?"\u2014":He(ae)||"\u2014",je=d(ae),Pe=g(je),ye=`${ee}, ${_e}, valve ${Se}, ${Pe}`.replace(/"/g,"&quot;");return os({id:Z,name:Oe,temp:_e,level:Ze,kind:we,attrs:`data-open-zone="${ae}" aria-label="${ye}" title="${ye}"`})}).join(""))}function se(){I(),Q(),ne(),b()}function V(){let T=D("section")==="zones";z.hidden=!T,z.setAttribute("aria-hidden",T?"false":"true"),u.classList.toggle("has-zone-dock",T)}function K(T){Ct(T)}function pe(){let T=D("section")||"overview";c.forEach(P=>P.classList.toggle("active",P.dataset.section===T)),tt(),X()}function X(){let T=D("settingsPanel")||"touch";e.querySelectorAll(".settings-panel[data-panel]").forEach(P=>{P.classList.toggle("is-active",P.dataset.panel===T)})}function Ue(){let T=[],P=0,ae=[];for(let he=1;he<=6;he++){let at=String(A(y.enabled(he))).toLowerCase()==="on",ot=String(A(y.state(he))).toLowerCase(),Ge=String(A(y.motorLastFault(he))||"").toUpperCase();at&&T.push(he),at&&["heating","calling"].includes(ot)&&P++,(ot==="fault"||Ge!==""&&Ge!=="NONE"&&Ge!=="OK")&&ae.push({zone:he,fault:Ge||"FAULT"})}let ee=ae.length,we=E(i.flow),Z=E(i.ret),ve=String(A(i.authorityState)||"").replace(/_/g," "),_e=ee===0&&D("live"),Se=we!=null&&Z!=null?Number(we)-Number(Z):null,Ze=Se==null?"\u2014":`${Se.toFixed(1)}\xB0C`,Oe=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${_e?"status-ok":D("live")?"status-warn":"status-danger"}">${_e?"Operating normally":D("live")?"Needs attention":"Device offline"}</h2><p>${ee?ee+" zone fault"+(ee===1?"":"s")+" require attention.":D("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${P} zones</strong><small>${T.length} enabled \xB7 ${P}/${T.length||0} calling</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${Ht(we)}</strong><small>Return ${Ht(Z)}</small></div><div class="status-fact"><span class="eyebrow">\u0394T</span><strong>${Ze}</strong><small>Flow \u2212 return</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ve||"not connected"}</strong><small>${E(i.authorityLeaseRemainingS)?Math.round(E(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,je=be(i.authorityConfigured),Pe=String(A(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=Oe,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${D("live")?"status-ok":"status-danger"}">${D("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${D("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${je?"Approved":"Not approved"}</strong><small>${je?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Pe}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${ee?"status-danger":_e?"status-ok":"status-warn"}">${ee?ee+" issue"+(ee===1?"":"s"):_e?"Healthy":"Awaiting data"}</h2><p>${ee?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${ee}</strong><small>${ee?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Pe}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ve||"not connected"}</strong><small>${je?"approved":"local control"}</small></div>`;let ye=ae.map(he=>p("overview.attention.faultDetail",{zone:he.zone,fault:he.fault})).join(" ");[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(he=>{he.hidden=!ee,he.innerHTML=ee?`<strong>${ee===1?p("status.attention.zoneFaultOne"):p("status.attention.zoneFaultMany",{count:ee})}</strong><span>${ye}</span>`:""})}function tt(){let T=D("selectedZone")||1,P=D("section")==="zones",ae=He(T),ee=ae?`${Ke(T)} \xB7 ${ae}`:Ke(T);x.textContent=ee,l&&(l.textContent=ee),se(),V(),m.hidden=!P}function te(T){let P=T.target.closest("[data-zone-select]");P&&K(Number(P.dataset.zoneSelect))}function Rt(T){j()&&te(T)}function go(T){if(!j()||!["ArrowLeft","ArrowRight","Home","End"].includes(T.key))return;T.preventDefault();let P=D("selectedZone")||1,ae=T.key==="Home"?1:T.key==="End"?6:T.key==="ArrowLeft"?P===1?6:P-1:P===6?1:P+1;K(ae),requestAnimationFrame(()=>{var ee;return(ee=f.querySelector(`[data-zone-select="${ae}"]`))==null?void 0:ee.focus()})}function bo(T){if(!["ArrowLeft","ArrowRight","Home","End"].includes(T.key))return;T.preventDefault();let P=D("selectedZone")||1,ae=T.key==="Home"?1:T.key==="End"?6:T.key==="ArrowLeft"?P===1?6:P-1:P===6?1:P+1;K(ae),requestAnimationFrame(()=>{var ee;return(ee=_.querySelector(`[data-zone-select="${ae}"]`))==null?void 0:ee.focus()})}function Ma(T){let P=T.target.closest("[data-open-zone]");P&&(K(Number(P.dataset.openZone)),Ve("zones"))}f.addEventListener("click",Rt),f.addEventListener("keydown",go),v&&v.addEventListener("click",Ma),window.matchMedia("(min-width: 901px)").addEventListener("change",I),_.addEventListener("click",te),_.addEventListener("keydown",bo),e.querySelectorAll("[data-open-zones]").forEach(T=>T.addEventListener("click",()=>Ve("zones"))),e.querySelectorAll("[data-help-section]").forEach(T=>T.addEventListener("click",P=>{P.preventDefault(),Ve(T.dataset.helpSection)})),W("section",pe),W("settingsPanel",X),W("selectedZone",tt),W("live",Ue),W("zoneNames",()=>{tt(),Ue()});for(let T=1;T<=6;T++)[y.temp(T),y.setpoint(T),y.effectiveSetpoint(T),y.valve(T),y.state(T),y.enabled(T),y.motorLastFault(T),y.syncTo(T)].forEach(P=>L(P,()=>{Ue(),se()}));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(T=>L(T,Ue)),R(e),pe(),tt(),Ue();let Pt=new URLSearchParams(location.search),oa=Pt.get("section"),le=Number(Pt.get("zone"));oa&&Ve(oa),le>=1&&le<=6&&Ct(le)}});function Fd(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(ce("app-root")),Cr()}Fd();})();
