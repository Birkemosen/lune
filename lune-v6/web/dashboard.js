(()=>{var Mo={},Xt={};function H(t){return Mo[t.tag]=t,t}function re(t,e){let a=Mo[t];if(!a)throw new Error("Component not found: "+t);let o=e||{};if(a.state){let r=a.state(e||{});for(let l in r)o[l]=r[l]}if(a.methods)for(let r in a.methods)o[r]=a.methods[r];let s=document.createElement("div");s.innerHTML=a.render(o);let n=s.firstElementChild;return a.onMount&&a.onMount(o,n),n}function z(t,e){(Xt[t]||(Xt[t]=[])).push(e)}function _e(t){let e=Xt[t];if(e)for(let a=0;a<e.length;a++)e[a](t)}var b={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",sensorId:t=>"text-zone_"+t+"_sensor_id",sensorName:t=>"text-zone_"+t+"_sensor_name",externalAge:t=>"sensor-zone_"+t+"_external_temp_age_ms",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var Ce=6,Pr=28,gt=Object.create(null),Rr=Ir(),ee={section:"overview",settingsPanel:"touch",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:$r(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Rr,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},Dr=300;function $r(){let t=Object.create(null);for(let e=1;e<=Ce;e++)t[e]=[];return t}function Ir(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<Ce;)t.push("");return t.slice(0,Ce)}function Hr(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(ee.zoneNames))}catch(t){}}function Me(t){return"$dashboard:"+t}function st(t){return Math.max(1,Math.min(Ce,Number(t)||1))}function Ao(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let a=t.match(/-?\d+(?:[\.,]\d+)?/);if(a){let o=Number(String(a[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function L(t){let e=gt[t];return e?e.v!=null?e.v:e.value!=null?e.value:Ao(e.s!=null?e.s:e.state):null}function M(t){let e=gt[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function Or(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function de(t){return Or(M(t))}function Yt(){return de(i.authorityProposalPending)}function Ta(){let t=0;for(let e=1;e<=Ce;e++){let a=String(M(b.state(e))||"").toLowerCase(),o=String(M(b.motorLastFault(e))||"").toLowerCase();(a==="fault"||o&&o!=="none"&&o!=="ok")&&(t+=1)}return t}function Fa(){if(Yt())return{kind:"touch",section:"settings",focus:"touch"};let t=Ta();return t>0?{kind:"faults",section:"zones",count:t}:null}function x(t,e){let a=gt[t];a||(a=gt[t]={v:null,s:null}),"v"in e&&(a.v=e.v,a.value=e.v),"value"in e&&(a.v=e.value,a.value=e.value),"s"in e&&(a.s=e.s,a.state=e.s),"state"in e&&(a.s=e.state,a.state=e.state);for(let o in e)o==="v"||o==="value"||o==="s"||o==="state"||(a[o]=e[o]);if(_e(t),t==="text_sensor-firmware_version"&&qe("firmwareVersion",M(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let o=parseInt(t.slice(10,-5),10);if(o>=1&&o<=Ce){let s=M(t)||"";ee.zoneNames[o-1]!==s&&(ee.zoneNames[o-1]=s,Hr(),_e(Me("zoneNames")))}}}function j(t,e){z(Me(t),e)}function P(t){return ee[t]}function qe(t,e){ee[t]=e,_e(Me(t))}function Re(t){let e=t==="logs"?"diagnostics":t;ee.section!==e&&(ee.section=e,_e(Me("section")))}function Jt(t){let e=String(t||"touch");ee.settingsPanel!==e&&(ee.settingsPanel=e,_e(Me("settingsPanel")))}function it(t){let e=st(t);ee.selectedZone!==e&&(ee.selectedZone=e,_e(Me("selectedZone")))}function Xe(t){let e=!!t;ee.live!==e&&(ee.live=e,_e(Me("live")))}function Na(){ee.pendingWrites+=1,_e(Me("pendingWrites"))}function Qt(){ee.pendingWrites=Math.max(0,ee.pendingWrites-1),ee.lastWriteAt=Date.now(),_e(Me("pendingWrites"))}function Eo(){return ee.pendingWrites>0?!0:Date.now()-ee.lastWriteAt<2e3}function Pa(t){return ee.zoneNames[st(t)-1]||""}function Te(t){return String(Pa(t)||"").trim()}function Ie(t){return"Z"+st(t)}function Ea(t){return"Zone "+st(t)}function we(t){let e=st(t),a=Te(e);return a?Ea(e)+" - "+a:Ea(e)}function qr(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Br(t){let e=st(t);return'<span class="zone-id-short">'+Ie(e)+'</span><span class="zone-id-long">'+Ea(e)+"</span>"}function Ke(t){let e=st(t),a=Te(e),o=Br(e);return a?'<span class="zone-title-id">'+o+'</span><span class="zone-title-name"> - '+qr(a)+"</span>":'<span class="zone-title-id">'+o+"</span>"}function bt(t){ee.i2cResult=t||"No scan has been run yet.",_e(Me("i2cResult"))}function U(t,e){let a={time:Vr(),msg:String(t||"")};for(ee.activityLog.push(a);ee.activityLog.length>60;)ee.activityLog.shift();if(e>=1&&e<=Ce){let o=ee.zoneLog[e];for(o.push(a);o.length>8;)o.shift();_e(Me("zoneLog:"+e))}_e(Me("activityLog"))}function Aa(t,e){let a=ee[t];if(!Array.isArray(a))return;let o=Ao(e);if(o!=null){for(a.push(o);a.length>Pr;)a.shift();_e(Me(t))}}function Lt(t){let e=Date.now();if(!t&&e-ee.lastHistoryAt<3200)return;ee.lastHistoryAt=e;let a=0,o=0;for(let s=1;s<=Ce;s++){let n=L("sensor-zone_"+s+"_valve_pct");n!=null&&(a+=n,o+=1)}Aa("historyFlow",L("sensor-manifold_flow_temperature")),Aa("historyReturn",L("sensor-manifold_return_temperature")),Aa("historyDemand",o?a/o:0)}function Vr(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function ea(t){ee.zoneStateHistory=t||null,_e(Me("zoneStateHistory"))}function To(){return ee.deviceLogSeq}function ta(t,e){if(Array.isArray(t)&&t.length){for(let a of t)ee.deviceLog.push({seq:a[0],level:a[1],tag:a[2],msg:a[3]}),a[0]>ee.deviceLogSeq&&(ee.deviceLogSeq=a[0]);for(;ee.deviceLog.length>Dr;)ee.deviceLog.shift();_e(Me("deviceLog"))}typeof e=="number"&&e>ee.deviceLogSeq&&(ee.deviceLogSeq=e-1)}function aa(){return ee.deviceLog}function Fo(){ee.deviceLog=[],_e(Me("deviceLog"))}var be=6,jr=8,No=null,lt=0,oa=1,Po=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],$o=18*3600+720,Io=Date.now(),Mt=4200,G={temp:new Float32Array(be),setpoint:new Float32Array(be),valve:new Float32Array(be),enabled:new Uint8Array(be),driversEnabled:1,fault:0,manualMode:0},Fe={busy:!1,direction:"open",zone:1,startedAt:0};function Ur(){G.manualMode=0,Io=Date.now(),qe("manualMode",!1);for(let n=0;n<be;n++){G.temp[n]=20.5+n*.4,G.setpoint[n]=21+n%3*.5,G.valve[n]=12+n*8,G.enabled[n]=n===4?0:1;let r=n+1;x(b.temp(r),{value:G.temp[n]}),x(b.setpoint(r),{value:G.setpoint[n]}),x(b.baseSetpoint(r),{value:G.setpoint[n]}),x(b.effectiveSetpoint(r),{value:G.setpoint[n]}),x(b.coordinatorOffset(r),{value:r===1?1.5:0}),x(b.coordinatorRemaining(r),{value:r===1?2400:0}),r===1&&x(b.effectiveSetpoint(1),{value:G.setpoint[0]+1.5}),x(b.valve(r),{value:G.valve[n]}),x(b.state(r),{state:G.valve[n]>5?"heating":"idle"}),x(b.enabled(r),{value:!!G.enabled[n],state:G.enabled[n]?"on":"off"}),x(b.probe(r),{state:"Probe "+r}),x(b.tempSource(r),{state:r%2?"Local Probe":"BLE"}),x(b.syncTo(r),{state:"None"}),x(b.ble(r),{state:"AA:BB:CC:DD:EE:0"+r}),x(b.name(r),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),x(b.preheatAdvance(r),{value:.08+n*.03})}for(let n=1;n<=jr;n++){let r=n<=be?n:be,l=G.temp[r-1]+(n>be?1:.1*n);x(b.probeTemp(n),{value:l})}x(i.flow,{value:34.1}),x(i.ret,{value:30.4}),x(i.uptime,{value:$o}),x(i.wifi,{value:-57}),x(i.drivers,{value:!0,state:"on"}),x(i.fault,{value:!1,state:"off"}),x(i.ip,{state:"192.168.1.86"}),x(i.ssid,{state:"MockLab"}),x(i.mac,{state:"D8:3B:DA:12:34:56"}),x(i.firmware,{state:"v1.0.0-1"}),x(i.resetReason,{state:"Software reset (esp_restart)"}),x(i.manifoldFlowProbe,{state:"Probe 7"}),x(i.manifoldReturnProbe,{state:"Probe 8"}),x(i.manifoldType,{state:"NC (Normally Closed)"}),x(i.motorProfileDefault,{state:"HmIP VdMot"}),x(i.closeThresholdMultiplier,{value:1.7}),x(i.closeSlopeThreshold,{value:1}),x(i.closeSlopeCurrentFactor,{value:1.4}),x(i.openThresholdMultiplier,{value:1.7}),x(i.openSlopeThreshold,{value:.8}),x(i.openSlopeCurrentFactor,{value:1.3}),x(i.openRippleLimitFactor,{value:1}),x(i.genericRuntimeLimitSeconds,{value:45}),x(i.hmipRuntimeLimitSeconds,{value:40}),x(i.relearnAfterMovements,{value:2e3}),x(i.relearnAfterHours,{value:168}),x(i.learnedFactorMinSamples,{value:3}),x(i.learnedFactorMaxDeviationPct,{value:12}),x(i.simplePreheatEnabled,{state:"on"}),x(i.minZoneFlowPct,{value:15}),x(i.minimumFlowAlways,{state:"off"}),x(i.bleClockSyncEnabled,{state:"on"}),x(i.bleClockSyncIntervalMin,{value:60}),x(i.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),x(i.bleClockSyncLastError,{state:""}),x(i.bleClockSyncAdvertising,{state:"off"}),x(i.authorityInstallationId,{state:"house-main"}),x(i.authorityCoordinatorId,{state:"lune-touch"}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),x(i.authorityState,{state:"touch_normal"}),x(i.authorityReason,{state:"lease_renewed"}),x(i.authorityLeaseRemainingS,{value:72}),x(i.cpuLoadCore0,{value:18.5}),x(i.cpuLoadCore1,{value:7.2}),x(i.freeInternalKb,{value:142}),x(i.freeDmaKb,{value:118}),x(i.largestInternalKb,{value:64}),x(i.minInternalKb,{value:96}),x(i.freePsramKb,{value:7800}),x(i.largestPsramKb,{value:4096}),x(i.bleHubEnabled,{state:"on"}),x(i.bleScanning,{state:"on"}),x(i.bleDemanded,{state:"on"}),x(i.bleAdsPerSec,{value:2.4}),x(i.bleLastAdvAgeMs,{value:850}),Lt(!0);let t=300,e=Number(Date.now()/1e3)|0,a=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],s=[];for(let n=0;n<a;n++){let r=(a-1-n)*t,l=e-r,p=Math.floor(n/12)%24,g=o.map(h=>h[p%h.length]),c=r/3600,m=c>2.5&&c<3.5||c>8.5&&c<9.5?1:0,u=g.filter(h=>h===5).length,f=Math.round(Math.min(100,u*15+Math.abs(Math.sin(n/8))*6)),v=Number((30+u*1.4+Math.sin(n/11)*1.5).toFixed(1)),k=Number((v-(1.4+u*.35)).toFixed(1));s.push([l,...g,m,v,k,f])}ea({interval_s:t,uptime_s:e,count:a,entries:s}),Ho(6)}function Ho(t){let e=[];for(let a=0;a<t;a++){let o=Po[oa%Po.length];e.push([oa,o[0],o[1],o[2]]),oa++}ta(e,oa)}function Zr(){lt+=1,x(i.uptime,{value:$o+Math.floor((Date.now()-Io)/1e3)}),x(i.wifi,{value:-55-Math.round((1+Math.sin(lt/4))*6)});let t=0,e=0,a=0;for(let r=0;r<be;r++){let l=r+1,p=!!G.enabled[r],g=G.temp[r],c=G.setpoint[r],m=p&&G.driversEnabled&&!G.manualMode&&g<c-.25;G.manualMode?G.valve[r]=Math.max(0,G.valve[r]):!p||!G.driversEnabled?G.valve[r]=Math.max(0,G.valve[r]-6):m?G.valve[r]=Math.min(100,G.valve[r]+7+l%3):G.valve[r]=Math.max(0,G.valve[r]-5);let u=m?.05+G.valve[r]/2200:-.03+G.valve[r]/3200;G.temp[r]=g+u+Math.sin((lt+l)/5)*.04,p&&G.valve[r]>0&&(t+=G.valve[r],e+=1,a=Math.max(a,G.valve[r])),x(b.temp(l),{value:G.temp[r]}),x(b.valve(l),{value:Math.round(G.valve[r])});let f=Math.max(0,(G.setpoint[r]-G.temp[r]-.15)*.22);x(b.preheatAdvance(l),{value:Number(f.toFixed(2))}),x(b.state(l),{state:p?m?"heating":"idle":"off"}),x(b.enabled(l),{value:p,state:p?"on":"off"}),x(b.probeTemp(l),{value:G.temp[r]+Math.sin((lt+l)/6)*.1})}let o=29.5+a*.075+e*.18+Math.sin(lt/6)*.25,s=o-(e?2.1+t/Math.max(1,e*50):1.1);x(i.flow,{value:Number(o.toFixed(1))}),x(i.ret,{value:Number(s.toFixed(1))}),x(b.probeTemp(7),{value:Number((s-.4).toFixed(1))}),x(b.probeTemp(8),{value:Number((o+.2).toFixed(1))}),Lt(!0);let n=P("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),lt%3===0&&Ho(1)}function Ro(t,e){Fe.busy=!0,Fe.direction=e,Fe.zone=t,Fe.startedAt=Date.now()}function Wr(){return Fe.startedAt?Date.now()-Fe.startedAt:0}function Kr(t,e,a){if(!a)return .4;let o=e==="open";return t<180?o?22:28:t<500?o?15.2:19.4:t<2200?o?14.6:19.1:!o&&t<2800?24.2:!o&&t<3400?20.4:t<Mt-300?o?18.5:26.8:o?25.4:41.2}function Gr(t,e,a){return a?e==="open"?t>Mt-300?3:0:t<2200?0:t<3e3?1:t<Mt-300?2:3:0}function Do(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function Oo(){let t=Wr(),e=Fe.busy&&t<Mt;Fe.busy&&!e&&(Fe.busy=!1);let a=Kr(t,Fe.direction,e||t<Mt+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:L(i.freeInternalKb)||142,dma_kb:L(i.freeDmaKb)||118,largest_internal_kb:L(i.largestInternalKb)||64,min_internal_kb:L(i.minInternalKb)||96,psram_kb:L(i.freePsramKb)||7800,largest_psram_kb:L(i.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:M(i.bleHubEnabled)==="on",scanning:M(i.bleScanning)==="on",demanded:M(i.bleDemanded)==="on",ads_per_sec:L(i.bleAdsPerSec)||0,last_adv_age_ms:L(i.bleLastAdvAgeMs)||0},drivers_enabled:!!G.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(a.toFixed(1)),stroke_phase:Gr(t,Fe.direction,e),armed:!!G.driversEnabled,latch_arm_level:1,latch_state_level:0,motor_enable_level:0,tacho_period_us:Do(t,e),tacho_cadence_us:Do(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:lt}}}}function Xr(t,e){let a=e==="open";if(t<180)return a?22-t*.03:28-t*.04;if(t<650)return a?14.8:19.2;if(t<2200)return(a?14.5:19)+Math.sin(t/90)*.35;if(!a&&t<2600)return 19+(t-2200)*.012;if(!a&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return a?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let o=a?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(a?26.4:44.5,o)}function qo(t){let e=t||Fe.direction||"open",a=e==="open",o=a?3900:4200,s=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],n=0;for(let r=0;r<=o;r+=10){let l=Xr(r,e);r>180&&r<o-80&&(n+=r%20===0?1:0);let p=0;a?p=r>o-400?3:0:r>=2200&&r<3e3?p=1:r>=3e3&&r<3600?p=2:r>=3600&&(p=3);let g=r<200?3200:r<o-400?1800+Math.round(Math.sin(r/140)*80):4200;s.push([r,n,l.toFixed(1),1200,1,a?1:0,1,p,g,40,0,0,0,0,0,1,0].join(","))}return s.join(`
`)+`
`}function Bo(){No||(Ur(),Xe(!0),No=setInterval(Zr,1200))}function na(t){let e=t.key||"",a=t.value,o=t.zone||0;if(e==="zone_setpoint"&&o>=1&&o<=be){let n=Number(a);Number.isNaN(n)||(G.setpoint[o-1]=n,x(b.setpoint(o),{value:n}),x(b.baseSetpoint(o),{value:n}),x(b.effectiveSetpoint(o),{value:n}),U("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(e==="zone_enabled"&&o>=1&&o<=be){let n=a>.5;G.enabled[o-1]=n?1:0,x(b.enabled(o),{value:n,state:n?"on":"off"}),U("Zone "+o+(n?" enabled":" disabled"),o);return}if(e==="drivers_enabled"){let n=a>.5;G.driversEnabled=n?1:0,n||(Fe.busy=!1),x(i.drivers,{value:n,state:n?"on":"off"}),U(n?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let n=a>.5;G.manualMode=n?1:0,qe("manualMode",n);return}if(e==="motor_target"&&o>=1&&o<=be){let n=Number(a||0);x(b.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),U("Motor "+o+" target set to "+n+"%",o);return}if(e==="command"){let n=String(a);if(n==="i2c_scan"){bt(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),U("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){U("Command executed: "+n);return}if(n==="firmware_check"||n==="firmware_prepare"){U("Command executed: "+n);return}if(n==="firmware_install"){U("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(n==="open_motor_timed"&&o>=1&&o<=be){Ro(o,"open"),U("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=be){Ro(o,"close"),U("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=be){Fe.busy=!1,U("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=be){U("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=be){U("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=be){U("Motor "+o+" reset and relearn started",o);return}if(n==="ble_clock_sync_now"){x(i.bleClockSyncAdvertising,{state:"on"}),x(i.bleClockSyncLastError,{state:""}),setTimeout(()=>{x(i.bleClockSyncAdvertising,{state:"off"}),x(i.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),U("Room clock broadcast started");return}if(n==="dump_task_stats"){U("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&o>=1){x(b.probe(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="zone_temp_source"&&o>=1){x(b.tempSource(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sync_to"&&o>=1){x(b.syncTo(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="manifold_type"){x(i.manifoldType,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="manifold_flow_probe"){x(i.manifoldFlowProbe,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="manifold_return_probe"){x(i.manifoldReturnProbe,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="motor_profile_default"){x(i.motorProfileDefault,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="simple_preheat_enabled"){x(i.simplePreheatEnabled,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="minimum_flow_always"){x(i.minimumFlowAlways,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="ble_clock_sync_enabled"){x(i.bleClockSyncEnabled,{state:String(a)}),U("Setting updated: "+e+" = "+a);return}if(e==="zone_name"&&o>=1){x(b.name(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="zone_ble_mac"&&o>=1){x(b.ble(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_id"&&o>=1){x(b.sensorId(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="zone_sensor_name"&&o>=1){x(b.sensorName(o),{state:String(a)}),U("Setting updated: "+e+" = "+a,o);return}if(e==="authority_approve_proposal"){x(i.authorityInstallationId,{state:M(i.authorityProposalInstallationId)||"lune-mock"}),x(i.authorityCoordinatorId,{state:M(i.authorityProposalCoordinatorId)||"touch-mock"}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),U("Discovered Lune Touch approved");return}if(e==="authority_revoke"){x(i.authorityInstallationId,{state:""}),x(i.authorityCoordinatorId,{state:""}),x(i.authorityConfigured,{state:"off",value:!1}),x(i.authorityState,{state:"unconfigured"}),U("Lune Touch disconnected");return}let s={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};if(s[e]){let n=Number(a);Number.isNaN(n)||(x(s[e],{value:n}),U("Setting updated: "+e+" = "+a));return}}var Ra="v1.1.0";function Vo(){return{tag_name:Ra,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+Ra+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+Ra+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function jo(t){let e=[];for(let a=1;a<=be;a++)e.push({zone:a,name:M(b.name(a)),enabled:M(b.enabled(a))==="on",setpoint_c:L(b.setpoint(a)),probe:M(b.probe(a)),temp_source:M(b.tempSource(a)),ble_mac:M(b.ble(a)),sensor_id:M(b.sensorId(a)),sensor_name:M(b.sensorName(a)),sync_to:M(b.syncTo(a))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:M(i.firmware),device:{mac:M(i.mac)},settings:{manifold_type:M(i.manifoldType),manifold_flow_probe:M(i.manifoldFlowProbe),manifold_return_probe:M(i.manifoldReturnProbe),motor_profile_default:M(i.motorProfileDefault),min_zone_flow_pct:L(i.minZoneFlowPct),minimum_flow_always:M(i.minimumFlowAlways)==="on",simple_preheat_enabled:M(i.simplePreheatEnabled)==="on",ble_clock_sync_enabled:M(i.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:L(i.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(a=>({zone:a.zone,open_ripples:400+a.zone,close_ripples:390+a.zone}))}:null}}function Uo(t,e){let a=Object.keys(t&&t.settings||{}).length,o=Array.isArray(t&&t.zones)?t.zones.length:0,s=e&&t&&t.learned?be:0;return U("Settings restored from backup (mock)"),{applied:a+o+s,skipped:e?0:be,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){na({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!G.enabled[t-1];na({key:"zone_enabled",value:e?1:0,zone:t})}};function Da(t,e){let a=URL.createObjectURL(e),o=document.createElement("a");o.href=a,o.download=t,o.rel="noopener",document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function $a(t,e,a){Da(t,new Blob([String(e)],{type:(a||"text/plain")+";charset=utf-8"}))}function Ia(t,e){let a=new Date,o=n=>String(n).padStart(2,"0"),s=a.getFullYear()+o(a.getMonth()+1)+o(a.getDate())+"-"+o(a.getHours())+o(a.getMinutes());return t+"-"+s+"."+e}var ct="/api/v1",Yr="https://api.github.com/repos/birkemosen/lune/releases/latest",Jr="https://github.com/birkemosen/lune/releases/latest/download/",Qr="/update",es="lune-v6-settings";function Be(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function Ha(t,e){let a=new URLSearchParams;for(let[s,n]of Object.entries(e||{}))n!=null&&a.append(s,n);let o=a.toString();return ct+t+(o?"?"+o:"")}function Le(t,e,a){if(Na(),Be())try{return na(a),Promise.resolve({ok:!0})}finally{Qt()}let o=sessionStorage.getItem("hv6_local_access_key")||"",s=new URLSearchParams;for(let[r,l]of Object.entries(e||{}))l!=null&&s.append(r,String(l));let n=r=>fetch(ct+t,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","X-Lune-Local-Key":r,"X-Lune-CSRF":r,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:s.toString()});return n(o).then(async r=>{if(r.status===403){o&&sessionStorage.removeItem("hv6_local_access_key");let l=window.prompt("Enter the Lune commissioning key to change local settings")||"";l&&(sessionStorage.setItem("hv6_local_access_key",l),o=l,r=await n(o))}if(!r.ok&&[400,404,415].includes(r.status)&&(r=await fetch(Ha(t,e),{method:"POST"})),!r.ok){let l=`POST ${t} failed (HTTP ${r.status})`;throw console.warn("API call failed: "+l),U(l),new Error(l)}return r}).catch(r=>{throw console.error(`API call error: POST ${t}:`,r),r}).finally(()=>{Qt()})}function Oa(){return sessionStorage.getItem("hv6_local_access_key")||""}function ts(t,e,a){Na();let o=Oa();return fetch(Ha(t,a),{method:"POST",headers:{"Content-Type":"application/json","X-Lune-Local-Key":o,"X-Lune-CSRF":o,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:JSON.stringify(e)}).finally(()=>{Qt()})}function qa(t,e){let a=Number(e);x(b.setpoint(t),{value:a}),x(b.baseSetpoint(t),{value:a});let o=Number(L(b.coordinatorOffset(t))),s=Number.isFinite(o)?a+o:a;return x(b.effectiveSetpoint(t),{value:s}),Le(`/zones/${t}/setpoint`,{setpoint_c:a},{key:"zone_setpoint",value:a,zone:t})}function Wo(t,e){return x(b.enabled(t),{state:e?"on":"off",value:e}),Le(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function At(t){return x(i.drivers,{state:t?"on":"off",value:t}),Le("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}async function Ko({hz:t=100,durationMs:e=4e3,clamp:a=!1}={}){return Be()?{ok:!0,data:{cycles:Math.max(1,Math.floor(e/10)),hz:t,clamp:!!a,armed:!0,armed_at_cycle:1,latch_state_start:1,latch_state_end:0}}:(await Le("/motors/arm-clock-probe",{hz:t,duration_ms:e,clamp:a?1:0})).json()}function Ne(t,e){return Le("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function Go(){return bt("Scanning I2C bus..."),U("I2C scan started"),Ne("i2c_scan")}var as={zone_probe:t=>b.probe(t),zone_temp_source:t=>b.tempSource(t),zone_sync_to:t=>b.syncTo(t)},os={zone_ble_mac:t=>b.ble(t),zone_sensor_id:t=>b.sensorId(t),zone_sensor_name:t=>b.sensorName(t),zone_name:t=>b.name(t)},ns={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,ble_clock_sync_enabled:i.bleClockSyncEnabled},rs={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};function Je(t,e,a){let o=as[e];return o&&x(o(t),{state:a}),Le("/settings/select",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function ft(t,e,a){let o=os[e];return o&&x(o(t),{state:a}),Le("/settings/text",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function He(t,e){let a=ns[t];return a&&x(a,{state:e}),Le("/settings/select",{key:t,value:e},{key:t,value:e})}function Pe(t,e){let a=Number(e),o=rs[t];return o&&!Number.isNaN(a)&&x(o,{value:a}),Le("/settings/number",{key:t,value:a},{key:t,value:a})}function Xo(){return Le("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:M(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:M(i.authorityProposalCoordinatorId)||"touch-mock",local_access_key:"mock-local-access-key"}},a=(e==null?void 0:e.data)||{};return a.local_access_key&&sessionStorage.setItem("hv6_local_access_key",a.local_access_key),a.installation_id&&x(i.authorityInstallationId,{state:a.installation_id}),a.coordinator_id&&x(i.authorityCoordinatorId,{state:a.coordinator_id}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),e})}function Yo(){return Le("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return sessionStorage.removeItem("hv6_local_access_key"),x(i.authorityInstallationId,{state:""}),x(i.authorityCoordinatorId,{state:""}),x(i.authorityConfigured,{state:"off",value:!1}),t})}function Jo(t,e){let a=String(e||"").trim();return U("Zone "+t+" renamed to "+(a||"(blank)"),t),ft(t,"zone_name",a)}function Qo(t,e){let a=Number(e),o=Number.isNaN(a)?0:Math.max(0,Math.min(100,Math.round(a)));return x(b.motorTarget(t),{value:o}),U("Motor "+t+" target set to "+o+"%",t),Le(`/motors/${t}/target`,{value:o},{key:"motor_target",value:o,zone:t})}function sa(t,e=1e4){return U("Motor "+t+" open for "+e+"ms",t),Le(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function ia(t,e=1e4){return U("Motor "+t+" close for "+e+"ms",t),Le(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function Ba(t){return U("Motor "+t+" stopped",t),Le(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function en(){U("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(Le(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>At(!1).then(()=>e))}async function Et(){if(Be())return Oo();let t=await fetch(ct+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function tn(){if(Be())return qo();let t=await fetch(ct+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function Tt(t){return qe("manualMode",!!t),U(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),Le("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function an(t){return U("Motor "+t+" fault reset",t),Ne("motor_reset_fault",t)}function on(t){return U("Motor "+t+" learned factors reset",t),Ne("motor_reset_learned_factors",t)}function nn(t){return U("Motor "+t+" reset and relearn started",t),Ne("motor_reset_and_relearn",t)}function rn(){return U("Task/heap stats dumped to device log"),Ne("dump_task_stats")}function Va(){Be()||fetch(ct+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&ea(t)}).catch(()=>{})}function sn(){return Ne("firmware_check")}function ln(){return U("Firmware install requested"),Ne("firmware_install")}function cn(){return Ne("firmware_prepare")}function ja(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:Jr+e}}function Zo(t,e){let a=Array.isArray(t)?t:[],o=n=>a.find(r=>n.test(String(r&&r.name||""))),s=o(/^lune-v6.*\.ota\.bin$/i)||o(/\.ota\.bin$/i)||o(/\.bin$/i);return s&&s.browser_download_url?{name:String(s.name),url:String(s.browser_download_url)}:ja(e)}var Ye=class extends Error{constructor(e,a,o){super(o||e),this.name="ReleaseCheckError",this.code=e,this.status=a||0}};async function dn(){if(Be()){let o=Vo(),s=String(o&&o.tag_name||"");return{tag:s,notes:String(o&&o.body||""),publishedAt:String(o&&o.published_at||""),asset:Zo(o&&o.assets,s)}}let t;try{t=await fetch(Yr,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(o){throw new Ye("network",0,o&&o.message?o.message:"network")}if(t.status===404)throw new Ye("no_releases",404,"No published GitHub release");if(!t.ok)throw new Ye("http",t.status,"Release check failed: "+t.status);let e=await t.json(),a=String(e&&e.tag_name||"");if(!a)throw new Ye("no_releases",404,"No published GitHub release");return{tag:a,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Zo(e&&e.assets,a)}}function pn(t,e){return Be()?new Promise(a=>{let o=0,s=setInterval(()=>{o=Math.min(100,o+20),e&&e(o),o>=100&&(clearInterval(s),U("Firmware image uploaded (mock)"),a("Update Successful!"))},220)}):new Promise((a,o)=>{let s=new FormData;s.append("update",t,t.name);let n=new XMLHttpRequest;n.open("POST",Qr);let r=Oa();r&&(n.setRequestHeader("X-Lune-Local-Key",r),n.setRequestHeader("X-Lune-CSRF",r)),n.upload.onprogress=l=>{e&&l.lengthComputable&&e(Math.min(100,Math.round(l.loaded/l.total*100)))},n.onload=()=>{let l=String(n.responseText||"");if(n.status>=200&&n.status<300&&!/fail/i.test(l)){a(l);return}o(new Error("OTA upload rejected: "+n.status+" "+l))},n.onerror=()=>o(new Error("OTA upload connection lost")),n.send(s)})}function ra(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function un(t=!0){if(Be())return ra(jo(t));let e=await fetch(Ha("/settings/export",{include_learned:t?1:0}),{cache:"no-store",headers:{"X-Lune-Local-Key":Oa()}});if(!e.ok)throw new Error("Settings export failed: "+e.status);return ra(await e.json())}function la(t){let e=ra(t);return!!(e&&e._type===es)}async function mn(t,e=!0){let a=typeof t=="string"?JSON.parse(t):t,o=ra(a);if(!la(o))throw new Error("not_a_lune_backup");if(Be())return Uo(o,e);let s=await ts("/settings/import",Object.assign({},o,{restore_learned:!!e}),{restore_learned:e?1:0});if(!s.ok)throw new Error("Settings restore failed: "+s.status);let n=await s.json().catch(()=>({})),r=n&&n.data?n.data:n||{};return U("Settings restored from backup"),{applied:Number(r.applied||0),skipped:Number(r.skipped||0),ignored:Number(r.ignored||0)}}function gn(t){let e=Ia("lune-v6-settings","json");return $a(e,JSON.stringify(t,null,2),"application/json"),e}function ss(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return aa().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function bn(){let t=Ia("lune-v6-logs","txt");if(Be())return $a(t,ss()||"No log lines buffered."),t;let e=await fetch(ct+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return Da(t,await e.blob()),t}function Ua(){if(Be())return;let t=To();fetch(ct+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&ta(e.lines,e.next_seq)}).catch(()=>{})}var ca=null,fn=null,vn=null,hn=null,Za=null;async function is(){ca&&ca.abort(),ca=new AbortController;let t=await fetch("/api/v1/state",{cache:"no-store",signal:ca.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function xn(t){if(!(!t||typeof t!="object")&&!Eo()){for(let e in t)x(e,t[e]);Lt(!1)}}function ls(t){if(t){if(!t.type){xn(t);return}if(t.type==="state"){xn(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;U(e),String(e).indexOf("I2C_SCAN:")!==-1&&bt(String(e))}}}function cs(){Va(),fn||(fn=setInterval(Va,300*1e3)),Ua(),vn||(vn=setInterval(Ua,3e3))}function yn(){is().then(t=>{Xe(!0),ls(t),cs()}).catch(()=>{Xe(!1)})}async function ds(){try{let t=await fetch("/api/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),a=e&&e.data,o=a&&a.data_revision;a&&a.uptime_s!=null&&x(i.uptime,{value:Number(a.uptime_s)}),(Za===null||o!==Za)&&(Za=o,yn()),Xe(!0)}catch(t){Xe(!1)}}function wn(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){Bo();return}yn(),hn||(hn=setInterval(ds,3e3))}var kn=Object.create(null);function R(t,e){if(kn[t])return;kn[t]=1;let a=document.createElement("style");a.textContent=e,document.head.appendChild(a)}var zn=`/* Generated from LDS tokens.json by generate_tokens.py. Do not edit. */
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
`;R("lds-tokens",zn);var da={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","nav.overview":"Overview","nav.help":"Help","nav.more":"More","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.scrollBottom":"Scroll to bottom","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Valve","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.override.remaining":"Touch offset {offset} \xB7 {remaining} remaining","zone.override.hint":"Temporary command from Lune Touch","zone.chart.kicker":"Temperature \xB7 last 24h","zone.chart.note":"Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.","zone.demand":"Demand","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.sensor.externalSource":"External (Wi\u2011Fi)","zone.sensor.externalTitle":"External (Wi\u2011Fi)","zone.sensor.externalNote":"Bind a stable sensor_id. Hubs POST temperatures; zone mapping stays on V6. See Help \u2192 External room temperature.","zone.sensor.sensorIdPh":"sensor_id (MAC or entity id)","zone.sensor.sensorNamePh":"Friendly name (optional)","zone.sensor.noIngestYet":"No external temperature received yet.","zone.sensor.lastIngestAge":"Last ingest {sec}s ago (stale after 15 min).","help.external.title":"External room temperature","help.external.intro":"V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.","help.external.keyWarn":"Scripts include your browser session key if set \u2014 treat it as a secret.","help.external.copy":"Copy","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.returnTemp.title":"Return temperature","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Optional return probes for legacy return-temp balancing \u2014 not required for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Product colour is amber for heat and forest for healthy state. Light and dark follow the system appearance.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.product":"Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.enable.title":"Enable the drivers","diagnostics.lab.enable.copy":"Rev 3.3 has no fault latch. This pauses automatic zone control and raises DRIVER_N_SLEEP so the bridges can run.","diagnostics.lab.enable.action":"Enable drivers","diagnostics.lab.log.enableWait":"Raising DRIVER_N_SLEEP \u2014 no LATCH_ARM on this board","diagnostics.lab.enableBanner":"The drivers did not enable. FAULT_N_RAW, rail overcurrent or the USB switch may be asserted.","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The trace replaces this after the stroke.","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armPulseWait":"Waiting for latch arm pulse \u2014 pad 10 should read 3.3 V for ~5 s","diagnostics.lab.log.armProbeWait":"Square-waving LATCH_ARM at 100 Hz \u2014 U2 pin 1 should show ~0.5 V AC","diagnostics.lab.log.armProbe":"Clock probe {hz} Hz \xD7 {cycles} cycles \u2014 armed {armed} (first at {at})","diagnostics.lab.log.armHigh":"Firmware readback: pad 10 HIGH (GPIO17 is driven)","diagnostics.lab.log.armGpio":"GPIO17 never went high \u2014 pad 10 stayed LOW in firmware readback","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.latchFaulted":"Fault latch did not arm \u2014 LATCH_STATE stayed high after the pulse","diagnostics.lab.log.enableFailed":"Drivers did not enable \u2014 a fault net may be asserted","diagnostics.lab.log.neverStarted":"Motor never started (busy stayed off)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"The fault latch did not arm: LATCH_STATE stayed high after the arm pulse. Firmware cannot read FAULT_N_RAW, so the cause cannot be narrowed from here. Either a driver fault is latched (check driver nFAULT, the overcurrent comparator, 3V3_MOTOR) or the arm clock never reached the flip-flop (check R4, C4, Q1 and U2).","diagnostics.lab.armGpioBanner":"GPIO17 never went high. Watch pad 10 while Arming: it must read 3.3 V. If the gauge stays LOW, firmware is not driving the pin.","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 ~250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","nav.overview":"Overblik","nav.help":"Hj\xE6lp","nav.more":"Mere","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.scrollBottom":"Til bunden","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Ventil","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.override.remaining":"Touch-offset {offset} \xB7 {remaining} tilbage","zone.override.hint":"Midlertidig kommando fra Lune Touch","zone.chart.kicker":"Temperatur \xB7 seneste 24t","zone.chart.note":"Den stiplede linje er det langsigtede setpunkt. Gulvvarme bev\xE6ger sig langsomt, s\xE5 kurven er det nyttige signal.","zone.demand":"Behov","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.sensor.externalSource":"Ekstern (Wi\u2011Fi)","zone.sensor.externalTitle":"Ekstern (Wi\u2011Fi)","zone.sensor.externalNote":"Bind et stabilt sensor_id. Hubs poster temperaturer; zone-mapping sker kun p\xE5 V6. Se Hj\xE6lp \u2192 Ekstern rumtemperatur.","zone.sensor.sensorIdPh":"sensor_id (MAC eller entity-id)","zone.sensor.sensorNamePh":"Venligt navn (valgfrit)","zone.sensor.noIngestYet":"Ingen ekstern temperatur modtaget endnu.","zone.sensor.lastIngestAge":"Seneste ingest for {sec}s siden (stale efter 15 min).","help.external.title":"Ekstern rumtemperatur","help.external.intro":"V6 accepterer HTTP POST med sensor_id. Zone-mapping sker kun p\xE5 V6. Touch ingerer ikke temperaturer.","help.external.keyWarn":"Scripts inkluderer din browser-session-n\xF8gle hvis sat \u2014 behandl den som hemmelighed.","help.external.copy":"Kopi\xE9r","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Valgfrie returprober til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendige for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Produktfarven er amber til varme og skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.product":"Amber til handling og varme, skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.enable.title":"T\xE6nd driverne","diagnostics.lab.enable.copy":"Rev 3.3 har ingen fejl-latch. Det s\xE6tter automatisk zonestyring p\xE5 pause og s\xE6tter DRIVER_N_SLEEP h\xF8j, s\xE5 broerne kan k\xF8re.","diagnostics.lab.enable.action":"T\xE6nd drivere","diagnostics.lab.log.enableWait":"S\xE6tter DRIVER_N_SLEEP \u2014 ingen LATCH_ARM p\xE5 dette board","diagnostics.lab.enableBanner":"Driverne t\xE6ndte ikke. FAULT_N_RAW, skinne-overstr\xF8m eller USB-kontakten kan v\xE6re aktiv.","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Tracen erstatter visningen efter slaget.","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armPulseWait":"Venter p\xE5 latch-puls \u2014 pad 10 skal vise 3,3 V i ca. 5 s","diagnostics.lab.log.armProbeWait":"Firkant p\xE5 LATCH_ARM ved 100 Hz \u2014 U2 pin 1 skal vise ca. 0,5 V AC","diagnostics.lab.log.armProbe":"Clock-probe {hz} Hz \xD7 {cycles} cyklusser \u2014 armeret {armed} (f\xF8rst ved {at})","diagnostics.lab.log.armHigh":"Firmware-readback: pad 10 HIGH (GPIO17 drives)","diagnostics.lab.log.armGpio":"GPIO17 gik aldrig h\xF8j \u2014 pad 10 forblev LOW i firmware-readback","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.latchFaulted":"Fejl-latch armerede ikke \u2014 LATCH_STATE forblev h\xF8j efter pulsen","diagnostics.lab.log.enableFailed":"Driverne t\xE6ndte ikke \u2014 et fejlnet kan v\xE6re aktivt","diagnostics.lab.log.neverStarted":"Motoren startede aldrig (busy blev ved med at v\xE6re slukket)","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"Fejl-latch armerede ikke: LATCH_STATE forblev h\xF8j efter arm-pulsen. Firmware kan ikke l\xE6se FAULT_N_RAW, s\xE5 \xE5rsagen kan ikke indkredses herfra. Enten er en driverfejl l\xE5st (tjek driver nFAULT, overstr\xF8mskomparatoren og 3V3_MOTOR), eller arm-clocken n\xE5ede aldrig flip-floppen (tjek R4, C4, Q1 og U2).","diagnostics.lab.armGpioBanner":"GPIO17 gik aldrig h\xF8j. Pad 10 skal vise 3,3 V mens der armeres. Hvis m\xE5leren bliver p\xE5 LOW, driver firmware ikke pinnen.","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 ca. 250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},Sn="en".toLowerCase(),Wa=da[Sn]?Sn:"en";function d(t,e){let a=da[Wa]&&da[Wa][t]||da.en[t]||t;return e?String(a).replace(/\{(\w+)\}/g,(o,s)=>e[s]==null?"":String(e[s])):a}function F(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=d(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",d(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",d(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",d(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Wa);var _n=`
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
`;function dt(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Cn(t,e,a){let o=Number(e),s=Number(a),n=Number(t),r=s-o;return!Number.isFinite(o)||!Number.isFinite(s)||!Number.isFinite(n)||r===0?0:Math.min(100,Math.max(0,(n-o)/r*100))}function Ka({id:t,markHtml:e="",target:a,current:o,min:s=5,max:n=35,step:r=.5,unit:l="C",label:p,disabled:g=!1}={}){let c=t||"lds-dial",m=dt(p||"Temperature target"),u=Number(a),f=Number(o),v=Number.isFinite(u)?u.toFixed(1):"\u2014",k=Number.isFinite(f)?f.toFixed(1):"\u2014",h=l==="C"||l==="\xB0C"||l==="\xB0"?"\xB0":dt(l),y=g?' aria-disabled="true"':"";return`<div class="lds-dial" id="${dt(c)}" role="group" aria-label="${m}" data-dial-min="${s}" data-dial-max="${n}" data-dial-unit="${dt(h)}"${y}>
  <div class="lds-dial-arc">
    ${e}
    <div class="lds-dial-readout">
      <div class="lds-dial-target"><span data-dial-target>${v}</span><span class="lds-dial-unit">${h}</span></div>
      <div class="lds-dial-current" data-dial-current>Current ${k}${h}</div>
    </div>
    <span class="lds-dial-live" data-dial-live aria-live="polite">${v}${h}</span>
  </div>
  <div class="lds-dial-steps">
    <button type="button" class="lds-dial-step" data-dial-step="${r}" aria-label="Increase" ${g?"disabled":""}>+</button>
    <button type="button" class="lds-dial-step" data-dial-step="-${r}" aria-label="Decrease" ${g?"disabled":""}>\u2212</button>
  </div>
</div>`}function Ga(t,{target:e,current:a,disabled:o,states:s,selected:n}={}){let r=typeof t=="string"?document.querySelector(t):t;if(!r)return;let l=r.dataset.dialUnit||"\xB0",p=Number(e),g=Number(a),c=Number.isFinite(p)?p.toFixed(1):"\u2014",m=Number.isFinite(g)?g.toFixed(1):"\u2014",u=r.querySelector("[data-dial-target]"),f=r.querySelector("[data-dial-current]"),v=r.querySelector("[data-dial-live]");u&&(u.textContent=c),f&&(f.textContent=`Current ${m}${l}`),v&&(v.textContent=`${c}${l}`),s&&r.querySelectorAll(".pipe").forEach((k,h)=>{let y=s[h]||"idle";k.setAttribute("class",`pipe is-${y}${h===n?" is-focus":""}`)}),o!=null&&(r.setAttribute("aria-disabled",o?"true":"false"),r.querySelectorAll(".lds-dial-step").forEach(k=>{k.disabled=!!o}))}function Xa(t,e={}){let a=typeof t=="string"?document.querySelector(t):t;if(!a)return()=>{};let o=s=>{var l;let n=s.target.closest("button.lds-dial-step[data-dial-step]");if(!n||!a.contains(n)||n.disabled)return;let r=parseFloat(n.getAttribute("data-dial-step"));if(Number.isFinite(r)){if(e.onStep)e.onStep(r);else if(e.onChange){let p=parseFloat(a.dataset.dialMin),g=parseFloat(a.dataset.dialMax),c=parseFloat((l=a.querySelector("[data-dial-target]"))==null?void 0:l.textContent),m=Number.isFinite(c)?c:20,u=Math.min(g,Math.max(p,Math.round((m+r)*10)/10));e.onChange(u)}}};return a.addEventListener("click",o),()=>a.removeEventListener("click",o)}function Ya({remaining:t="",hint:e="Temporary command from Lune Touch"}={}){return`<div class="lds-override-banner ui-override-banner" data-override-banner ${!String(t||"").trim()?"hidden":""}>
  <div class="lds-override-main ui-override-main">
    <strong data-override-remaining>${dt(t)}</strong>
    <small data-override-hint>${dt(e)}</small>
  </div>
</div>`}function Ja(t,{remaining:e="",hint:a}={}){var p;let o=typeof t=="string"?document.querySelector(t):t;if(!o)return;let s=(p=o.matches)!=null&&p.call(o,"[data-override-banner]")?o:o.querySelector("[data-override-banner]");if(!s)return;let n=s.querySelector("[data-override-remaining]"),r=s.querySelector("[data-override-hint]"),l=String(e||"").trim();s.hidden=!l,n&&(n.textContent=l),r&&a!==void 0&&(r.textContent=a)}function Qa({min:t=5,max:e=35,step:a=.5,value:o=21,label:s="Comfort setpoint",disabled:n=!1}={}){let r=Number(o),l=Number.isFinite(r)?r.toFixed(1):"\u2014",p=Cn(r,t,e),g=n?" disabled":"";return`<div class="lds-slider-row slider-row" data-lds-slider-row>
  <input data-comfort-slider type="range" min="${t}" max="${e}" step="${a}" value="${Number.isFinite(r)?r:t}" aria-label="${dt(s)}" style="--slider-fill:${p}%"${g}>
  <strong data-slider-value>${l}\xB0</strong>
</div>`}function pa(t){if(!t)return;let e=t.min,a=t.max,o=t.value,s=Cn(o,e,a);t.style.setProperty("--slider-fill",`${s}%`)}var ua=`
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
`;function Ln(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ee({on:t=!1,disabled:e=!1,label:a="",title:o="",attrs:s="",className:n=""}={}){let r=["lds-nav-switch","nav-switch",t?"is-on":"",e?"is-disabled":"",n].filter(Boolean).join(" "),l=Ln(a||o||"Toggle"),p=o||a?` title="${Ln(o||a)}"`:"";return`<button type="button" class="${r}" role="switch" aria-checked="${t?"true":"false"}" aria-label="${l}"${p}${e?" disabled":""} data-lds-nav-switch ${s}></button>`}function ma(t,{on:e,disabled:a}={}){var s,n;if(!t)return;let o=(s=t.matches)!=null&&s.call(t,"[data-lds-nav-switch]")?t:(n=t.querySelector)==null?void 0:n.call(t,"[data-lds-nav-switch]");o&&(e!==void 0&&(o.classList.toggle("is-on",!!e),o.setAttribute("aria-checked",e?"true":"false")),a!==void 0&&(o.classList.toggle("is-disabled",!!a),o.disabled=!!a))}var Mn=`
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
`;function ge({titleHtml:t="",bodyHtml:e="",className:a="",attrs:o=""}={}){return`<div class="${["lds-settings-card","ui-card",a].filter(Boolean).join(" ")}" data-lds-settings-card ${o}>
  <div class="lds-settings-card-title ui-card-title"><span class="ui-title-text">${t}</span></div>
  <div class="lds-settings-card-body">${e}</div>
</div>`}R("lds-comfort-control",_n);R("lds-nav-switch",ua);R("lds-settings-card",Mn);var us=`
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
`;R("ui-kit",us);function ke(t){let e=d(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function ms(t,e){let a=Math.abs(Number(t));return!Number.isFinite(a)||a<1e3?e:Math.pow(10,Math.floor(Math.log10(a))-1)}function gs(t){let e=String(t),a=e.indexOf(".");return a<0?0:e.length-a-1}function ze(t,e={}){let a=t.querySelector(e.title||".ui-card-title"),o=document.createElement("div");o.className="ui-form-banner",o.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',a?a.insertAdjacentElement("afterend",o):t.insertAdjacentElement("afterbegin",o);let s=[],n=()=>o.classList.toggle("show",s.some(h=>h.dirty)),r=(h,y)=>{h.dirty=y,n()};function l(h){return h.markDirty=()=>r(h,!0),s.push(h),h}function p(h,y){let S={dirty:!1,input:h},w=y.baseStep!=null?y.baseStep:parseFloat(h.step)||1,A=gs(w),C=y.min!=null?y.min:h.min!==""?parseFloat(h.min):-1/0,N=y.max!=null?y.max:h.max!==""?parseFloat(h.max):1/0,q=W=>A>0?Number(W).toFixed(A):String(Math.round(Number(W)));if(!y.nostep){let W=document.createElement("div");W.className="ui-stepper",h.parentNode.insertBefore(W,h);let O=document.createElement("button");O.type="button",O.className="ui-step-btn",O.textContent="\u2212",O.setAttribute("aria-label",d("common.decrease"));let ae=document.createElement("button");ae.type="button",ae.className="ui-step-btn",ae.textContent="+",ae.setAttribute("aria-label",d("common.increase")),W.appendChild(O),W.appendChild(h),W.appendChild(ae);let le=$=>{if(h.disabled)return;let T=parseFloat(h.value);Number.isFinite(T)||(T=parseFloat(h.placeholder)),Number.isFinite(T)||(T=0);let oe=Math.min(N,Math.max(C,T+$*ms(T,w)));h.value=q(oe),r(S,!0)};O.addEventListener("click",()=>le(-1)),ae.addEventListener("click",()=>le(1)),h.addEventListener("keydown",$=>{$.key==="Enter"&&h.blur()})}return h.addEventListener("input",()=>r(S,!0)),S.sync=()=>{let W=y.read();h.value=W!=null&&Number.isFinite(Number(W))?q(W):""},S.commit=()=>{let W=parseFloat(h.value);Number.isFinite(W)&&y.commit(Math.min(N,Math.max(C,W)))},l(S)}function g(h,y){let S={dirty:!1,input:h};return h.addEventListener("input",()=>r(S,!0)),S.sync=()=>{let w=y.read();h.value=w!=null?w:""},S.commit=()=>y.commit(h.value.trim()),l(S)}function c(h,y){let S={dirty:!1,input:h};return h.addEventListener("change",()=>r(S,!0)),S.sync=()=>{let w=y.read();w!=null&&(h.value=w)},S.commit=()=>y.commit(h.value),l(S)}function m(h,y){let S={dirty:!1,input:h,staged:!1},w=h.closest(".ui-row"),A=()=>{ma(h,{on:S.staged}),w&&w.classList.toggle("is-on",S.staged),y.onChange&&y.onChange(S.staged)};return h.addEventListener("click",()=>{S.staged=!S.staged,r(S,!0),A()}),S.sync=()=>{S.staged=!!y.read(),A()},S.commit=()=>y.commit(S.staged),l(S)}function u(h){let y={dirty:!1,sync:h.sync,commit:h.commit};return l(y)}let f=()=>s.forEach(h=>{!h.dirty&&h.sync&&h.sync()}),v=()=>{s.forEach(h=>{h.dirty&&(h.commit&&Promise.resolve(h.commit()).catch(()=>{}),h.dirty=!1)}),n(),e.onApply&&e.onApply()},k=()=>{s.forEach(h=>{h.dirty=!1,h.sync&&h.sync()}),n(),e.onDiscard&&e.onDiscard()};return o.querySelector(".ui-form-apply").addEventListener("click",v),o.querySelector(".ui-form-discard").addEventListener("click",k),F(o),{num:p,text:g,select:c,toggle:m,custom:u,refresh:f,apply:v,discard:k,isDirty:()=>s.some(h=>h.dirty)}}function Qe(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function ga(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function vt(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,a=t%86400/3600|0,o=t%3600/60|0;return e>0?e+"d "+a+"h "+o+"m":a>0?a+"h "+o+"m":o+"m"}var An=`
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
`;function eo(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function En({live:t=!1,label:e="Offline",uptime:a="---",ip:o="---",showUptime:s=!0,showIp:n=!0}={}){let r=t?"":" is-off",l=s?"":" hidden",p=n?"":" hidden";return`<div class="lds-live-status" data-lds-live-status>
  <div class="lds-live-row">
    <span class="lds-live${r}" data-lds-live><i aria-hidden="true"></i><span data-lds-live-label>${eo(e)}</span></span>
    <span class="lds-live-uptime" data-lds-uptime${l}>${eo(a)}</span>
  </div>
  <div class="lds-live-ip" data-lds-ip${p}>${eo(o)}</div>
</div>`}function ba(t,{live:e,label:a,uptime:o,ip:s}={}){var c,m;if(!t)return;let n=(c=t.matches)!=null&&c.call(t,"[data-lds-live-status]")?t:(m=t.querySelector)==null?void 0:m.call(t,"[data-lds-live-status]");if(!n)return;let r=n.querySelector("[data-lds-live]"),l=n.querySelector("[data-lds-live-label]"),p=n.querySelector("[data-lds-uptime]"),g=n.querySelector("[data-lds-ip]");r&&e!==void 0&&r.classList.toggle("is-off",!e),l&&a!==void 0&&l.textContent!==a&&(l.textContent=a),p&&o!==void 0&&p.textContent!==o&&(p.textContent=o),g&&s!==void 0&&g.textContent!==s&&(g.textContent=s)}var bs=`
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
  width:8px; height:8px; border-radius:50%; background:var(--danger); flex:0 0 auto;
}
.v6-side-link .dot.is-online { background:var(--ok); box-shadow:0 0 8px var(--ok); }
.v6-side-link .dot.is-heating { background:var(--accent); box-shadow:0 0 8px var(--accent); }
.v6-side-link .dot.is-idle { background:var(--ok); opacity:.55; box-shadow:none; }
.v6-side-link .dot.is-off { background:var(--text-faint); box-shadow:none; opacity:.45; }
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
`;R("hv6-header",bs);R("lds-live-status",An);R("lds-nav-switch",ua);var fs=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><button type="button" class="v6-toolbar-icon" aria-label="Collapse navigation" aria-pressed="false"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14"/></svg></button><div><p class="v6-toolbar-kicker" id="v6-view-kicker">Home</p><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button></div>
  </header>`,Ve=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,fa=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,vs=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Ve('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span class="menu-label">Overview</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Zones</div>
      <div class="v6-nav-zones" data-zone-nav></div>
      <a href="#" class="v6-side-link v6-tab-zones" data-section="zones" hidden>${Ve('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span class="menu-label">Zones</span>${fa("warn")}</a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Ve('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span class="menu-label">Diagnostics</span>${fa("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${Ve('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span class="menu-label">Motor lab</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Settings</div>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="touch">${Ve('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/>')}<span class="menu-label">Touch</span>${fa()}</a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="hydraulics">${Ve('<path d="M4 18h16M7 18V9m5 9V5m5 13v-6"/>')}<span class="menu-label">Hydraulics</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="comfort">${Ve('<path d="M12 4v3M8 8l-2-2M16 8l2-2M6 13h12M9 13c0 4 3 7 3 7s3-3 3-7"/>')}<span class="menu-label">Comfort</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="motors">${Ve('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')}<span class="menu-label">Motors</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="device">${Ve('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>')}<span class="menu-label">Device</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Ve('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span>${fa()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Ve('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span class="menu-label">Help</span></a></div>
    ${En({live:!1,label:"Offline",uptime:"---",ip:"---"})}
  </nav>`,Tn={overview:["Overview / House status","System health & energy flow","Local heating status and current exceptions"],zones:["Controller details","Zones","Physical loops, applied targets and valve state"],diagnostics:["System","Diagnostics","Health, evidence and recovery"],motorlab:["System","Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Settings","Device configuration and safety"],help:["Utility","Help","Guidance for operating Lune V6"]},Fn={touch:["Settings","Touch","Approval and coordinator identity"],hydraulics:["Settings","Hydraulics","Manifold probes, return temperature and minimum flow"],comfort:["Settings","Comfort","Room clocks and preheat absorption"],motors:["Settings","Motors","Drivers, profile and learning limits"],device:["Settings","Device","Connection, firmware, backup and appearance"]};function Pn(t){t&&(Re(t.section),t.focus==="touch"&&(Jt("touch"),requestAnimationFrame(()=>{let e=document.querySelector(".settings-touch-card");e&&e.scrollIntoView({behavior:"smooth",block:"center"})})))}function Nn(t){return t?t.kind==="touch"?d("status.attention.approveTouch"):t.kind==="faults"?t.count===1?d("status.attention.zoneFaultOne"):d("status.attention.zoneFaultMany",{count:t.count}):"":""}function hs(t){if(!de(b.enabled(t)))return"is-off";let e=String(M(b.state(t))||"").toUpperCase(),a=String(M(b.motorLastFault(t))||"").toUpperCase();return e==="FAULT"||a&&a!=="NONE"&&a!=="OK"?"":e==="HEATING"||e==="CALLING"?"is-heating":e==="IDLE"?"is-idle":"is-online"}function xs(t){let e=Te(t);return e?`${Ie(t)} ${e}`:Ie(t)}H({tag:"hv6-header",render:fs,onMount(t,e){let a=e.querySelector("#v6-view-kicker"),o=e.querySelector("#v6-view-title"),s=e.querySelector("#v6-view-subtitle"),n=e.querySelector("#hdr-update"),r=e.querySelector("#hdr-attention"),l=e.querySelector(".v6-toolbar-icon");l&&l.addEventListener("click",()=>{let u=document.querySelector(".shell");if(!u)return;let f=u.classList.toggle("nav-collapsed");l.setAttribute("aria-pressed",String(f))});function p(){let u=P("firmwareUpdateAvailable");n.hidden=!u,u&&(n.textContent=d("status.updateAvailable",{version:u.latest}),n.title=d("settings.firmware.badgeTitle"))}function g(){let u=Fa(),f=P("section")||"overview",v=!!(u&&u.section!==f);r.hidden=!v,v?(r.textContent=Nn(u),r.title=Nn(u),r.dataset.kind=u.kind):delete r.dataset.kind}function c(){let u=P("selectedZone")||1,f=Te(u);return f?`${Ie(u)} \xB7 ${f}`:we(u)}n.addEventListener("click",()=>{Jt("device"),Re("settings");let u=document.querySelector(".settings-firmware-card");u&&u.scrollIntoView({behavior:"smooth",block:"center"})}),r.addEventListener("click",()=>{Pn(Fa())});function m(){let u=P("section")||"overview",f=P("settingsPanel")||"touch",v=u==="settings"?Fn[f]||Fn.touch:Tn[u]||Tn.overview;a&&(a.textContent=v[0]),u==="zones"?(o.textContent=c(),s.textContent="Applied target, sensor coverage and local safety."):(o.textContent=v[1],s.textContent=v[2]),g()}j("section",m),j("settingsPanel",m),j("selectedZone",m),j("zoneNames",m),j("live",g),j("firmwareUpdateAvailable",p),z(i.authorityProposalPending,g);for(let u=1;u<=6;u++)z(b.state(u),g),z(b.motorLastFault(u),g);F(e),m(),p(),g()}});H({tag:"hv6-sidebar",render:vs,onMount(t,e){let a=e,o=e.querySelector(".v6-more-toggle"),s=e.querySelector('[data-section="settings"][data-panel="touch"]'),n=e.querySelector(".v6-tab-zones"),r=e.querySelector('[data-section="diagnostics"]'),l=e.querySelector("[data-zone-nav]"),p=0,g=Date.now(),c=!1;function m(S,w,A,C){if(!S)return;let N=S.querySelector("[data-nav-dot]");N&&(N.hidden=!w,w?(S.setAttribute("aria-label",`${A}, ${C}`),S.title=C):(S.removeAttribute("aria-label"),S.removeAttribute("title")))}function u(){let S=Yt(),w=Ta(),A=w===1?d("status.attention.zoneFaultOne"):d("status.attention.zoneFaultMany",{count:w});if(m(s,S,d("nav.settings"),d("status.attention.approveTouch")),m(n,w>0,d("nav.zones"),A),m(r,w>0,d("nav.diagnostics"),A),o){let C=o.querySelector("[data-nav-dot]");C&&(C.hidden=!S,C.classList.toggle("is-warn",!1)),S?(o.setAttribute("aria-label",d("status.attention.moreHasSettings")),o.title=d("status.attention.approveTouch")):(o.removeAttribute("aria-label"),o.removeAttribute("title"))}}function f(){if(!l)return;let S=P("selectedZone")||1,w=P("section")==="zones";l.innerHTML=Array.from({length:6},(A,C)=>{let N=C+1,q=w&&S===N,W=xs(N),O=W.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"),ae=hs(N),le=de(b.enabled(N)),$=le?d("common.enabled"):d("common.disabled"),T=Ee({on:le,title:$,label:`${W}: ${$}`,attrs:`data-toggle-zone="${N}"`});return`<div class="v6-nav-row"><button type="button" class="v6-side-link${q?" active":""}" data-section="zones" data-select-zone="${N}" ${q?'aria-current="page"':""} title="${O}" aria-label="${O}"><span class="dot ${ae}" aria-hidden="true"></span><span class="menu-label">${O}</span></button>${T}</div>`}).join("")}function v(){if(!c){ba(e,{uptime:"---"});return}let S=Math.max(0,Math.floor((Date.now()-g)/1e3));ba(e,{uptime:vt(p+S)})}function k(){let S=!!P("live");ba(e,{live:S,label:S?d("status.live"):d("status.offline"),ip:M(i.ip)||"---"});let w=L(i.uptime);if(w!=null&&!isNaN(w)&&w>=0){let A=w|0;(!c||A!==p)&&(p=A,g=Date.now(),c=!0)}v()}function h(){let S=P("section"),w=P("settingsPanel")||"touch";if(e.querySelectorAll("[data-section]").forEach(A=>{if(A.hasAttribute("data-select-zone"))return;let C=A.dataset.section===S&&S!=="zones";C&&A.dataset.panel&&(C=A.dataset.panel===w),C&&!A.dataset.panel&&S==="settings"&&(C=!1),A.classList.toggle("active",C),A.setAttribute("aria-current",C?"page":"false")}),n){let A=S==="zones";n.classList.toggle("active",A),n.setAttribute("aria-current",A?"page":"false")}f(),u(),k()}e.addEventListener("click",S=>{let w=S.target.closest("[data-toggle-zone]");if(w&&e.contains(w)){S.preventDefault(),S.stopPropagation();let q=Number(w.dataset.toggleZone);q>=1&&q<=6&&Wo(q,!de(b.enabled(q)));return}let A=S.target.closest("[data-select-zone]");if(A){S.preventDefault(),it(Number(A.dataset.selectZone)),Re("zones"),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"));return}let C=S.target.closest("[data-section]");if(!C||!e.contains(C)||C.classList.contains("v6-more-toggle"))return;S.preventDefault();let N=C.dataset.section;C.dataset.panel&&Jt(C.dataset.panel),N==="settings"&&Yt()&&(!C.dataset.panel||C.dataset.panel==="touch")?Pn({kind:"touch",section:"settings",focus:"touch"}):Re(N),a.classList.contains("more-open")&&(a.classList.remove("more-open"),o&&o.setAttribute("aria-expanded","false"))}),o&&o.addEventListener("click",()=>{let S=a.classList.toggle("more-open");o.setAttribute("aria-expanded",String(S))}),j("section",h),j("settingsPanel",h),j("selectedZone",h),j("zoneNames",h),j("live",h),z(i.ip,k),z(i.uptime,k);let y=setInterval(v,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(y),{once:!0}),z(i.authorityProposalPending,u);for(let S=1;S<=6;S++)z(b.state(S),h),z(b.enabled(S),h),z(b.motorLastFault(S),h),z(b.temp(S),()=>{});F(e),h()}});var ys=`
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
`;R("connectivity-card",ys);var ws=()=>`
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
`,Sc=H({tag:"connectivity-card",render:ws,onMount(t,e){let a=e.querySelector(".cc-ip"),o=e.querySelector(".cc-ssid"),s=e.querySelector(".cc-mac"),n=e.querySelector(".cc-up"),r=e.querySelector(".cc-ver"),l=0,p=Date.now(),g=!1;function c(){if(!g){n.textContent="---";return}let f=Math.max(0,Math.floor((Date.now()-p)/1e3)),v=vt(l+f);n.textContent!==v&&(n.textContent=v)}function m(){a.textContent=M(i.ip)||"---",o.textContent=M(i.ssid)||"---",s.textContent=M(i.mac)||"---",r.textContent=M(i.firmware)||"---";let f=L(i.uptime);if(f!=null&&!isNaN(f)&&f>=0){let v=f|0;(!g||v!==l)&&(l=v,p=Date.now(),g=!0)}c()}z(i.ip,m),z(i.ssid,m),z(i.mac,m),z(i.firmware,m),z(i.uptime,m);let u=setInterval(c,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(u),{once:!0}),F(e),m()}});var ks="http://www.w3.org/2000/svg",zs=`
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
`;R("chart-kit",zs);function te(t,e,a){let o=document.createElementNS(ks,t);if(e)for(let s in e)o.setAttribute(s,e[s]);return a!=null&&(o.textContent=a),o}function ht(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(o=>`${o.x.toFixed(2)} ${o.y.toFixed(2)}`).join(" L ");let e=.16,a=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let o=0;o<t.length-1;o++){let s=t[o-1]||t[o],n=t[o],r=t[o+1],l=t[o+2]||r,p=n.x+(r.x-s.x)*e,g=n.y+(r.y-s.y)*e,c=r.x-(l.x-n.x)*e,m=r.y-(l.y-n.y)*e;a+=` C ${p.toFixed(2)} ${g.toFixed(2)}, ${c.toFixed(2)} ${m.toFixed(2)}, ${r.x.toFixed(2)} ${r.y.toFixed(2)}`}return a}function va(t,e,a){let o=t.filter(l=>Number.isFinite(l));if(!o.length)return{min:e,max:a};let s=Math.min(...o),n=Math.max(...o);s===n&&(s-=1,n+=1);let r=(n-s)*.12;return{min:s-r,max:n+r}}function xt(t,e,a){let o=document.createElement("div");o.className="chart-tooltip",e.appendChild(o);let s=te("g",{class:"chart-cursor",style:"display:none"}),n=te("line",{class:"chart-cursor-line",y1:a.plotTop,y2:a.plotBottom});s.appendChild(n);let r=[];t.appendChild(s);function l(m){let u=0,f=1/0;for(let v=0;v<a.count;v++){let k=Math.abs(m-a.xAt(v));k<f&&(f=k,u=v)}return u}function p(m){let u=t.getScreenCTM();if(!u)return null;let f=t.createSVGPoint();return f.x=m.clientX,f.y=m.clientY,f.matrixTransform(u.inverse())}function g(m){if(!a.count)return;let u=p(m);if(!u)return;let f=l(u.x),v=a.xAt(f);n.setAttribute("x1",v),n.setAttribute("x2",v);let k=a.dots(f);for(;r.length<k.length;){let w=te("circle",{class:"chart-cursor-dot",r:3.4});s.appendChild(w),r.push(w)}r.forEach((w,A)=>{A<k.length?(w.setAttribute("cx",v),w.setAttribute("cy",k[A].y),w.setAttribute("fill",k[A].color),w.style.display=""):w.style.display="none"}),s.style.display="";let h=a.rows(f).map(w=>`<div class="tt-row"><span class="tt-swatch" style="background:${w.color}"></span>${w.label}<span class="tt-val">${w.value}</span></div>`).join("");o.innerHTML=`<div class="tt-time">${a.label(f)}</div>${h}`,o.classList.add("show");let y=e.getBoundingClientRect(),S=m.clientX-y.left+14;S+o.offsetWidth>y.width-6&&(S=m.clientX-y.left-o.offsetWidth-14),o.style.left=Math.max(6,S)+"px",o.style.top=Math.max(6,m.clientY-y.top+12)+"px"}function c(){o.classList.remove("show"),s.style.display="none"}return t.addEventListener("pointermove",g),t.addEventListener("pointerleave",c),()=>{t.removeEventListener("pointermove",g),t.removeEventListener("pointerleave",c),o.remove()}}var Ft=1e3,to=180,je=14,Ss=42,_s=44,tt=42,ya=Ft-tt-Ss,et=to-je-_s,pt=je+et,ao=24*3600,Rn=Ce+2,Dn=Ce+3,ha=Ce+4,Cs="var(--series-warm)",Ls="var(--series-cool)",$n="var(--series-solar)",Ms=`
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
`;R("graph-widgets",Ms);var In=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',Hn=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',As=t=>t.variant==="flow-return"?`<div class="graph-widgets">${In()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${Hn()}</div>`:`<div class="graph-widgets">${In()}${Hn()}</div>`;function On(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function Es(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function oo(t,e,a){let o=[];for(let s=0;s<t.length;s++){let n=t[s];if(!n||n[0]<a)continue;let r=n[e];r==null||!Number.isFinite(r)||o.push({t:n[0],v:r})}return o}var wa=(t,e)=>tt+Math.max(0,Math.min(1,(t-e)/ao))*ya;function Ts(t,e,a){let o=Number(Date.now()/1e3)|0,s=3600,n=Math.ceil((o-ao)/s)*s,r=Math.floor(o/s)*s,l=Math.floor(o/s)*s;for(let g=n;g<=r;g+=s){let c=a-(o-g),m=wa(c,e),u=new Date(g*1e3),f=g===l,v=pt+16;t.appendChild(te("text",{x:m,y:v,"text-anchor":"end",transform:`rotate(-45 ${m.toFixed(1)} ${v})`,class:"chart-hour"+(f?" now":"")},String(u.getHours()).padStart(2,"0")))}let p=wa(a,e);t.appendChild(te("line",{x1:p,y1:je,x2:p,y2:pt,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Fs(t){let e=[];if(t.forEach(n=>n.forEach(r=>e.push(r.v))),!e.length)return{min:0,max:10};let a=Math.min(...e),o=Math.max(...e);a===o&&(a-=.5,o+=.5);let s=(o-a)*.1;return a-=s,o+=s,{min:a,max:o}}function Ns(t,e,a){let o=t.filter(s=>s.unit==="C").map(s=>oo(e,s.index,a));return Fs(o)}function qn(t,e,a,o,s,n){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${Ft} ${to}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let r=a.map(v=>oo(o,v.index,s));if(!r.some(v=>v.length))return t.appendChild(te("text",{x:Ft/2,y:to/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let l=Ns(a,o,s),p=Math.max(.001,l.max-l.min),g=v=>je+(1-(v-l.min)/p)*et,c=v=>je+(1-Math.max(0,Math.min(100,v))/100)*et,m=(v,k)=>v.unit==="%"?c(k):g(k);for(let v=0;v<3;v++){let k=v/2,h=je+k*et;t.appendChild(te("line",{x1:tt,y1:h,x2:tt+ya,y2:h,class:"chart-grid"})),a.some(y=>y.unit==="C")&&t.appendChild(te("text",{x:tt-6,y:h+4,"text-anchor":"end",class:"chart-tick"},On(l.max-p*k,"C")+"\xB0")),a.some(y=>y.unit==="%")&&t.appendChild(te("text",{x:tt+ya+6,y:h+4,"text-anchor":"start",class:"chart-tick"},On(100-100*k,"%")))}t.appendChild(te("line",{x1:tt,y1:pt,x2:tt+ya,y2:pt,class:"chart-axis"})),a.some(v=>v.unit==="C")&&t.appendChild(te("text",{x:9,y:je+et/2,transform:`rotate(-90 9 ${(je+et/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.temp"))),a.some(v=>v.unit==="%")&&t.appendChild(te("text",{x:Ft-9,y:je+et/2,transform:`rotate(90 ${Ft-9} ${(je+et/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.demand"))),Ts(t,s,n),a.forEach((v,k)=>{let h=r[k].map(S=>({x:wa(S.t,s),y:m(v,S.v)}));if(!h.length)return;let y=ht(h);v.fill&&t.appendChild(te("path",{d:y+` L ${h[h.length-1].x.toFixed(1)} ${pt} L ${h[0].x.toFixed(1)} ${pt} Z`,fill:v.fill,stroke:"none"})),t.appendChild(te("path",{d:y,fill:"none",stroke:v.color,"stroke-width":String(v.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let u=[];for(let v=0;v<o.length;v++){let k=o[v];if(!k||k[0]<s)continue;let h=a.map(y=>k[y.index]);h.every(y=>y==null||!Number.isFinite(y))||u.push({t:k[0],vals:h})}if(!u.length)return null;let f=Date.now();return xt(t,e,{count:u.length,plotTop:je,plotBottom:pt,xAt:v=>wa(u[v].t,s),label:v=>new Date(f-(n-u[v].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:v=>a.map((k,h)=>({y:m(k,u[v].vals[h]),color:k.color})).filter((k,h)=>Number.isFinite(u[v].vals[h])),rows:v=>a.map((k,h)=>({color:k.color,label:k.label,value:Es(u[v].vals[h],k.unit)})).filter((k,h)=>Number.isFinite(u[v].vals[h]))})}function xa(t,e,a){let o=oo(t,e,a);return o.length?o[o.length-1].v:null}var Nc=H({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:As,onMount(t,e){let a=e.querySelector(".gw-dt"),o=e.querySelector(".gw-demand-text"),s=e.querySelector(".gw-flow"),n=e.querySelector(".gw-demand"),r=Array.from(e.querySelectorAll(".gw-toggle")),l={flow:!0,return:!0,demand:!0},p=null,g=null;function c(){r.forEach(f=>{let v=f.dataset.layer;f.classList.toggle("is-off",!l[v]),f.setAttribute("aria-pressed",l[v]?"true":"false")})}function m(){let f=[];return l.flow&&f.push({index:Rn,color:Cs,label:d("overview.graph.layers.flow"),unit:"C",width:2.4}),l.return&&f.push({index:Dn,color:Ls,label:d("overview.graph.layers.return"),unit:"C",width:2}),l.demand&&f.push({index:ha,color:$n,label:d("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function u(){let f=P("zoneStateHistory"),v=f&&Array.isArray(f.entries)?f.entries:[],k=f&&f.uptime_s||Number(Date.now()/1e3)|0,h=k-ao;if(s){p&&p();let y=xa(v,Rn,h),S=xa(v,Dn,h),w=xa(v,ha,h),A=[];y!=null&&S!=null&&A.push("\u0394 "+(y-S).toFixed(1)+"\xB0"),w!=null&&A.push(Math.round(w)+"%"),a.textContent=A.length?A.join(" \xB7 "):"\u2014",p=qn(s,s.closest(".chart-card"),m(),v,h,k)}if(n){g&&g();let y=xa(v,ha,h);o.textContent=y!=null?Math.round(y)+"%":"\u2014",g=qn(n,n.closest(".chart-card"),[{index:ha,color:$n,label:d("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],v,h,k)}}r.forEach(f=>{f.addEventListener("click",()=>{let v=f.dataset.layer;l[v]=!l[v],!l.flow&&!l.return&&!l.demand&&(l[v]=!0),c(),u()})}),j("zoneStateHistory",u),F(e),c(),u()}});var at={0:{labelKey:"state.off",color:"var(--disabled)"},1:{labelKey:"state.manual",color:"var(--info)"},2:{labelKey:"state.calibrating",color:"var(--warn)"},3:{labelKey:"state.waitCal",color:"var(--text-faint)"},4:{labelKey:"state.waitTemp",color:"var(--text-faint)"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"var(--forest)"},7:{labelKey:"state.overheated",color:"var(--danger)"},255:{labelKey:"",color:"transparent"}},Nt=24*3600,Ps=Nt,Pt=28,so=8,ut=72,za=48,yt=8,Sa=16,jn=10,Un="var(--series-solar)",no=14,Bn=Ce+1,Zn=yt+Ce*(Pt+so)-so,ro=Zn+jn,ka=Zn+jn+Sa+za,Rs=`
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
`;R("zone-state-timeline",Rs);var Ds=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function $s(t,e){if(!t||!t.entries||t.entries.length===0)return null;let a=t.entries,o=t.uptime_s||e||0,s=Number(Date.now()/1e3)|0,n=1e3,r=n-ut;function l(w){let A=(w+Nt)/Ps;return ut+Math.max(0,Math.min(1,A))*r}function p(w){return w-o}let g="http://www.w3.org/2000/svg",c=document.createElementNS(g,"svg");c.setAttribute("viewBox","0 0 "+n+" "+ka),c.classList.add("timeline-svg");let m=document.createElementNS(g,"rect");m.setAttribute("x",ut),m.setAttribute("y",yt),m.setAttribute("width",r),m.setAttribute("height",ka-yt-za),m.setAttribute("fill","transparent"),m.setAttribute("rx","0"),c.appendChild(m);let u=l(0),f=[-24,-18,-12,-6,0].map(w=>w*3600);for(let w of f){let A=l(w),C=document.createElementNS(g,"line");C.setAttribute("x1",A),C.setAttribute("y1",yt),C.setAttribute("x2",A),C.setAttribute("y2",ka-za),C.setAttribute("stroke",w===0?"var(--series-solar)":"var(--separator)"),C.setAttribute("stroke-width","1"),w===0&&(C.setAttribute("stroke-dasharray","3 4"),C.setAttribute("opacity",".7"),C.setAttribute("vector-effect","non-scaling-stroke")),c.appendChild(C)}c.appendChild(Is(g,"text",{x:u+6,y:yt+14,"text-anchor":"start",fill:"var(--accent)","font-size":"12","font-family":"var(--font-ui)","font-weight":"650"},"now"));for(let w=0;w<Ce;w++){let A=yt+w*(Pt+so),C=document.createElementNS(g,"rect");C.setAttribute("x",ut),C.setAttribute("y",A),C.setAttribute("width",r),C.setAttribute("height",Pt),C.setAttribute("fill",w%2===0?"var(--inset)":"transparent"),c.appendChild(C);let N=document.createElementNS(g,"text");N.setAttribute("x",ut-8),N.setAttribute("y",A+Pt/2+1),N.setAttribute("text-anchor","end"),N.setAttribute("dominant-baseline","middle"),N.setAttribute("fill","var(--text-muted)"),N.setAttribute("font-size","13"),N.setAttribute("font-family","var(--font-ui)"),N.setAttribute("font-weight","650"),N.textContent="Z"+(w+1),c.appendChild(N);let q=a.map(O=>({rel:p(O[0]),state:O[w+1]})).filter(O=>O.rel>=-Nt&&O.rel<=0),W=(O,ae,le)=>{if(le===255)return;let $=at[le]||at[255];if($.color==="transparent")return;let T=l(O),oe=l(ae),Ae=Math.max(1,oe-T),J=document.createElementNS(g,"rect");J.setAttribute("x",T),J.setAttribute("y",A+(Pt-no)/2),J.setAttribute("width",Ae),J.setAttribute("height",no),J.setAttribute("fill",$.color),J.setAttribute("rx",String(no/2)),J.setAttribute("opacity","0.9"),c.appendChild(J)};if(q.length){let O=q[0].rel,ae=q[0].state;for(let le=1;le<q.length;le++){let $=q[le];$.state!==ae&&(W(O,$.rel,ae),O=$.rel,ae=$.state)}W(O,0,ae)}}{let w=document.createElementNS(g,"rect");w.setAttribute("x",ut),w.setAttribute("y",ro),w.setAttribute("width",r),w.setAttribute("height",Sa),w.setAttribute("fill","color-mix(in srgb, var(--series-solar) 12%, transparent)"),w.setAttribute("rx","2"),c.appendChild(w);let A=document.createElementNS(g,"text");A.setAttribute("x",ut-8),A.setAttribute("y",ro+Sa/2+1),A.setAttribute("text-anchor","end"),A.setAttribute("dominant-baseline","middle"),A.setAttribute("fill","var(--text-muted)"),A.setAttribute("font-size","12"),A.setAttribute("font-family","var(--font-ui)"),A.setAttribute("font-weight","650"),A.textContent=d("overview.timeline.absorb"),c.appendChild(A);let C=a.map(N=>({rel:p(N[0]),on:N.length>Bn?N[Bn]:0})).filter(N=>N.rel>=-Nt&&N.rel<=0);if(C.length){let N=(O,ae)=>{let le=l(O),$=Math.max(1,l(ae)-le),T=document.createElementNS(g,"rect");T.setAttribute("x",le),T.setAttribute("y",ro),T.setAttribute("width",$),T.setAttribute("height",Sa),T.setAttribute("fill",Un),T.setAttribute("rx","2"),T.setAttribute("opacity","0.9"),c.appendChild(T)},q=C[0].rel,W=C[0].on;for(let O=1;O<C.length;O++)C[O].on!==W&&(W&&N(q,C[O].rel),q=C[O].rel,W=C[O].on);W&&N(q,0)}}let v=ka-za+22,k=3600,h=Math.ceil((s-Nt)/k)*k,y=Math.floor(s/k)*k,S=Math.floor(s/k)*k;for(let w=h;w<=y;w+=k){let C=new Date(w*1e3).getHours(),N=w===S;if(!N&&C%2!==0)continue;let q=w-s,W=l(q),O=document.createElementNS(g,"text");O.setAttribute("x",W),O.setAttribute("y",v),O.setAttribute("text-anchor","middle"),O.setAttribute("fill",N?"var(--accent)":"var(--text-muted)"),O.setAttribute("font-size","12"),O.setAttribute("font-family","var(--font-ui)"),O.setAttribute("font-weight",N?"700":"600"),O.setAttribute("font-variant-numeric","tabular-nums lining-nums"),O.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),O.textContent=String(C).padStart(2,"0"),c.appendChild(O)}return c}function Is(t,e,a,o){let s=document.createElementNS(t,e);for(let n in a)s.setAttribute(n,a[n]);return o!=null&&(s.textContent=o),s}function Vn(t){t.innerHTML="";let e=[{code:5,...at[5]},{code:6,...at[6]},{code:0,...at[0]},{code:1,...at[1]},{code:7,...at[7]},{code:2,...at[2]}];for(let o of e){let s=document.createElement("div");s.className="tl-legend-item",s.innerHTML='<span class="tl-legend-dot" style="background:'+o.color+'"></span>'+(o.labelKey?d(o.labelKey):""),t.appendChild(s)}let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+Un+'"></span>'+d("overview.timeline.preheatAbsorption"),t.appendChild(a)}var Oc=H({tag:"zone-state-timeline",render:Ds,onMount(t,e){let a=e.querySelector(".tl-body"),o=e.querySelector(".timeline-legend");Vn(o);function s(){let n=P("zoneStateHistory"),r=(()=>{let p=P&&P("zoneStateHistory");return p&&p.uptime_s||Number(Date.now()/1e3)|0})();if(a.innerHTML="",!n||!n.entries||n.entries.length===0){let p=document.createElement("div");p.className="timeline-empty",p.textContent=d("overview.timeline.noHistory"),a.appendChild(p);return}let l=$s(n,r);l&&a.appendChild(l)}j("zoneStateHistory",s),j("zoneNames",s),z(i.drivers,s);for(let n=1;n<=Ce;n++)z(b.enabled(n),s),z(b.state(n),s),z(b.temp(n),s),z(b.setpoint(n),s),z(b.preheatAdvance(n),s);F(e),s()}});var Hs=`
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
`;R("zone-grid",Hs);var Os=()=>'<div class="zone-grid" aria-label="Zones"></div>',jc=H({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Os,onMount(t,e){for(let a=1;a<=6;a++)e.appendChild(re("zone-card",{zone:a,selection:t.selection,navigate:t.navigate}))}});var qs=`
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
.zone-card.zs-fault .zc-dot{background:var(--state-danger)}.zone-card.zs-fault .zc-state-label{color:var(--state-danger)}
.zone-card::after{content:'\u203A';grid-column:5;grid-row:1;color:var(--text-muted);font-size:1.35rem;text-align:right}
`;R("zone-card",qs);var Bs=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${we(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${Ke(t.zone)}</div>
		<div class="zc-friendly"${Te(t.zone)?" hidden":""}>${Te(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,Jc=H({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Bs,onMount(t,e){let a=t.zone,o=b.temp(a),s=b.state(a),n=b.enabled(a),r=e.querySelector(".zc-state-label"),l=e.querySelector(".zc-zone-name"),p=e.querySelector(".zc-friendly"),g=e.querySelector(".zc-temp"),c=e.querySelector(".zc-target"),m=e.querySelector(".zc-valve-value");function u(){var N;let v=de(n),k=String(M(s)||"").toUpperCase()||"OFF",h=String(M(b.motorLastFault(a))||"").toUpperCase(),y=h&&h!=="NONE"&&h!=="OK",S=v&&(k==="FAULT"||y)?"FAULT":k,w=t.selection&&P("selectedZone")===a,A=Te(a);l.innerHTML=Ke(a),p.textContent=A?"":"---",p.hidden=!!A,e.setAttribute("aria-label",we(a)),g.textContent=Qe(L(o)),c.textContent=d("zone.card.setpoint",{value:Qe((N=L(b.effectiveSetpoint(a)))!=null?N:L(b.setpoint(a)))}),m.textContent=ga(L(b.valve(a)));let C=v?S:"OFF";r.textContent=C==="HEATING"?d("state.heating"):C==="IDLE"?d("state.idle"):C==="FAULT"?d("common.fault"):C==="MANUAL"?d("state.manual"):C==="OVERHEATED"?d("state.overheated"):C==="CALIBRATING"?d("state.calibrating"):d("state.off"),e.title=y?d("zone.card.fault",{fault:h}):"",e.classList.toggle("active",w),w?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${l.textContent}, ${g.textContent}, ${c.textContent}, ${r.textContent}. Open details.`),e.classList.toggle("disabled",!v),e.classList.toggle("zs-heating",v&&C==="HEATING"),e.classList.toggle("zs-fault",v&&C==="FAULT"),e.classList.toggle("zs-idle",v&&C==="IDLE"),e.classList.toggle("zs-off",!v||C==="OFF")}function f(){it(a),t.navigate&&Re("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:a}}))}e.addEventListener("click",f),z(o,u),z(b.setpoint(a),u),z(b.effectiveSetpoint(a),u),z(b.valve(a),u),z(s,u),z(n,u),z(b.motorLastFault(a),u),j("selectedZone",u),j("zoneNames",u),u()}});var Q={cx:200,cy:175,haloR:72,cutR:72,discR:56,stroke:6.5,pipeXs:[138,162.8,187.6,212.4,237.2,262],pipeFrom:175,pipeTo:278,lockupScale:.8,lockupCutR:58,lockupDiscR:50,luneSize:24,luneTracking:2.8,luneY:183,v6Size:40,v6Tracking:.4,v6Y:188,viewBoxPortrait:"110 90 180 210",viewBoxLandscape:"118 100 202 150",viewBoxLockup:"142 118 154 114",lockupWidth:80,lockupHeight:59,manifoldWidth:108,manifoldHeight:80,thermal:{supply:"#FCD34D",heat:"#F59E0B",ret:"#10B981",heatStop:28},pipe:{calling:"#F59E0B",idle:"#10B981",unused:"rgba(232,214,188,.20)"},metallic:{top:"#1c1915",bottom:"#0c0b09",rim:"#25221E",word:"#FAF6EF"}},Vs=0;function js(t){let{cx:e,cy:a}=Q,o=[`translate(${e} ${a})`,"rotate(-90)"];return t&&t!==1&&o.push(`scale(${t})`),o.push(`translate(${-e} ${-a})`),o.join(" ")}function Us(t,e=!1){let a=Q.thermal,o=Q.metallic,s=e?`x1="${Q.cx}" y1="${Q.cy+Q.haloR}" x2="${Q.cx}" y2="${Q.cy-Q.haloR}"`:'x1="120" y1="175" x2="280" y2="175"';return`<defs>
    <filter id="${t}-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="${t}-thermal" gradientUnits="userSpaceOnUse" ${s}>
      <stop offset="0%" stop-color="${a.supply}"/>
      <stop offset="${a.heatStop}%" stop-color="${a.heat}"/>
      <stop offset="100%" stop-color="${a.ret}"/>
    </linearGradient>
    <linearGradient id="${t}-metallic" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${o.top}"/>
      <stop offset="100%" stop-color="${o.bottom}"/>
    </linearGradient>
  </defs>`}function Rt({states:t=[],selected:e=-1,sku:a="",landscape:o=!1,lockup:s=!1,prefix:n=""}={}){let r=n||`lm${++Vs}`,l=s?Q.lockupScale:null,p=s?Q.lockupCutR:Q.cutR,g=s?Q.lockupDiscR:Q.discR,c=o||s?` transform="${js(l)}"`:"",m=s?Q.viewBoxLockup:o?Q.viewBoxLandscape:Q.viewBoxPortrait,u=Q.pipeXs.map((v,k)=>`<line class="pipe is-${t[k]||"idle"}${k===e?" is-focus":""}" x1="${v}" y1="${Q.pipeFrom}" x2="${v}" y2="${Q.pipeTo}"/>`).join(""),f="";if(a){let v=a.toUpperCase()==="V6",k=v?Q.v6Size:Q.luneSize,h=v?Q.v6Tracking:Q.luneTracking,y=v?Q.v6Y:Q.luneY;f=`<text class="sku" x="${Q.cx}" y="${y}" text-anchor="middle" fill="${Q.metallic.word}" font-size="${k}" font-weight="700" letter-spacing="${h}" font-family="system-ui,-apple-system,sans-serif">${a}</text>`}return`<svg class="lune-mark${o||s?" is-landscape":""}" viewBox="${m}" fill="none" aria-hidden="true">
    ${Us(r,o||s)}
    <g class="pipes"${c} stroke="url(#${r}-thermal)" stroke-width="${Q.stroke}" stroke-linecap="round" fill="none">${u}</g>
    <circle class="disc-cut" cx="${Q.cx}" cy="${Q.cy}" r="${p}"></circle>
    <path class="halo-arc"${c} d="M${Q.cx-Q.haloR} ${Q.cy}A${Q.haloR} ${Q.haloR} 0 0 1 ${Q.cx+Q.haloR} ${Q.cy}" fill="none" stroke="url(#${r}-thermal)" stroke-width="${Q.stroke}" stroke-linecap="round" filter="url(#${r}-glow)"></path>
    <circle class="disc" cx="${Q.cx}" cy="${Q.cy}" r="${g}"></circle>
    ${f}
  </svg>`}function Wn(){return Rt({sku:"LUNE",lockup:!0,prefix:"lt-lockup"})}var Kn=`
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
`;function wt(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Gn(t,e="idle"){if(e==="unused")return 0;let a=Number(t);return!Number.isFinite(a)||a<=0?0:Math.min(5,Math.max(1,Math.ceil(a/20)))}function Zs(t=0){return`<span class="lds-loop-demand-bar loop-demand-bar" data-level="${Math.min(5,Math.max(0,Number(t)||0))}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`}function Xn({id:t,name:e="\u2014",temp:a="\u2014",level:o=0,kind:s="idle",selected:n=!1,attrs:r="",tag:l="button",showDemand:p=!0,className:g=""}={}){let c=["lds-loop","loop",n?"is-selected":"",s==="calling"?"is-calling":"",s==="unused"?"is-unused":"",g].filter(Boolean).join(" "),m=l==="button"?' type="button"':"",u=p?`<span class="lds-loop-demand loop-demand">${Zs(o)}<span class="lds-loop-temp loop-temp">${wt(a)}</span></span>`:`<span class="lds-loop-temp loop-temp">${wt(a)}</span>`;return`<${l} class="${c}"${m} ${r}><span class="lds-loop-id loop-id">${wt(t)}</span><span class="lds-loop-name loop-name">${wt(e)}</span>${u}</${l}>`}function Yn({title:t="",lines:e=[],offline:a=!1}={}){let o=(e||[]).map((s,n)=>`<small${a&&n===e.length-1||n===e.length-1?' class="status"':""}>${wt(s)}</small>`).join("");return`<strong>${wt(t)}</strong>${o}`}function ot(t){if(!de(b.enabled(t)))return"unused";let e=String(M(b.state(t))||"").toUpperCase(),a=Number(L(b.valve(t)));return e==="HEATING"||e==="CALLING"||Number.isFinite(a)&&a>20||e==="FAULT"||e==="OVERHEATED"?"calling":"idle"}function Jn(){return[1,2,3,4,5,6].map(ot)}function Ws(){return Jn().filter(t=>t==="calling").length}function Ks(){let t=Ws();return t?`${t}/6 heat call`:"Idle"}function kt(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Qn(t,{states:e,selected:a=-1,sku:o="V6",landscape:s=!0,prefix:n}={}){if(!t)return;let r=n||t.getAttribute("data-live-mark")||"mark";t.innerHTML=Rt({states:e||Jn(),selected:a,sku:s?o:"",landscape:s,prefix:r})}function er(){let t=kt(L(i.flow)),e=kt(L(i.ret)),a=Number(L(i.flow)),o=Number(L(i.ret)),s=Number.isFinite(a)&&Number.isFinite(o)?`${(a-o).toFixed(1)}\xB0`:"\u2014";return Yn({title:"Lune V6",lines:[`Flow ${t} \xB7 Ret ${e}`,`\u0394T ${s} \xB7 ${Ks()}`]})}function Gs(t,e,a={}){if(!t||t.length<2)return"";let o=a.w||360,s=a.h||128,n=[a.ref].filter(f=>f!=null&&!Number.isNaN(Number(f))),r=Math.min(...t,...n),l=Math.max(...t,...n),p=4,g=l-r||1,c=f=>s-(f-r)/g*(s-p*2)-p,m=t.map((f,v)=>`${v/(t.length-1)*o},${c(f)}`).join(" "),u=n.length?`<line class="ref" x1="0" y1="${c(n[0])}" x2="${o}" y2="${c(n[0])}" />`:"";return`<svg class="${a.className||"spark spark-lg"}" viewBox="0 0 ${o} ${s}" preserveAspectRatio="none" aria-hidden="true">${u}<polyline fill="none" stroke="${e}" stroke-width="${a.stroke||1.8}" points="${m}"/></svg>`}function Xs(t){var c;let e=Number(L(b.temp(t))),a=Number((c=L(b.effectiveSetpoint(t)))!=null?c:L(b.setpoint(t))),o=Number.isFinite(e)?e:a;if(!Number.isFinite(o)||!Number.isFinite(a))return[];let s=ot(t)==="calling",n=t*17,r=o-.4,l=o+.4,p=o-.35-n%6*.07,g=[];for(let m=0;m<24;m+=1){let u=Math.max(0,Math.sin((m-6)/12*Math.PI))*.22,f=m<7||m>21?-.12:0,v=s||p<a-.2?.16:.05;p+=(a-p)*v+u+f+Math.sin((m+n)*.55)*.05,p=Math.min(l+.15,Math.max(r-.15,p)),g.push(+p.toFixed(2))}return g[23]=+Number(o).toFixed(2),g}function tr(t){var g;let e=Xs(t);if(!e.length)return"";let a=ot(t)==="calling"?"var(--accent)":"var(--forest)",o=e[0],s=e[e.length-1],n=Math.min(...e),r=Math.max(...e),l=s-o,p=Number((g=L(b.effectiveSetpoint(t)))!=null?g:L(b.setpoint(t)));return`${Gs(e,a,{className:"spark spark-lg",w:360,h:128,stroke:1.8,ref:p})}
    <div class="trend-meta">
      <span>24h</span>
      <span>${n.toFixed(1)}\u2013${r.toFixed(1)}\xB0</span>
      <span>${l>.05?"+":""}${l.toFixed(1)}\xB0</span>
    </div>`}var Ys=`
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
`;R("zone-detail",Ys);var Js=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    ${Ya({remaining:"",hint:d("zone.override.hint")})}
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
`,co=5,po=35,ar=.5;function Qs(t){let e=Number(L(b.setpoint(t)));return Number.isFinite(e)?e:null}function uo(t){let e=Number(L(b.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function or(t){let e=Number(L(b.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let a=Qs(t);return a==null?null:Number((a+uo(t)).toFixed(1))}function io(t){return Math.min(po,Math.max(co,Number(Number(t).toFixed(1))))}function lo(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function ei(t,e){if(!e)return d("common.disabled");let a=String(t||"IDLE").toUpperCase();return a==="HEATING"?d("state.heating"):a==="IDLE"?d("state.idle"):a==="OFF"?d("state.off"):a==="FAULT"?d("common.fault"):a==="MANUAL"?d("state.manual"):a==="OVERHEATED"?d("state.overheated"):a==="CALIBRATING"?d("state.calibrating"):a}function ti(t,e){return e?ot(t)==="calling"?d("state.heating"):d("state.idle"):d("state.off")}var vd=H({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Js,methods:{update(t,e){let a=P("selectedZone"),o=String(M(b.state(a))||"").toUpperCase(),s=de(b.enabled(a)),n=or(a),r=L(b.temp(a));this.zone=a,t.dataset.zone=String(a),e.dial&&Ga(e.dial,{target:n,current:r,disabled:!s,states:["idle","idle","idle","idle","idle","idle"],selected:-1});let l=Number(L(b.coordinatorRemaining(a))),p=L(b.coordinatorOffset(a)),g=Number.isFinite(l)&&l>0||Number.isFinite(p)&&Math.abs(p)>.05,c=p==null?"\u2014":(p>0?"+":"")+Number(p).toFixed(1)+"\xB0";Ja(t,{remaining:g?d("zone.override.remaining",{offset:c,remaining:vt(Math.max(0,l||0))}):"",hint:d("zone.override.hint")});let m=lo(n);if(e.setpoint.textContent=m,e.temp.textContent=lo(r),e.demand.textContent=ti(a,s),e.slider&&(Number.isFinite(n)&&(e.slider.value=String(n)),e.slider.disabled=!s,pa(e.slider)),e.sliderValue&&(e.sliderValue.textContent=m),e.chart&&(e.chart.innerHTML=tr(a)),e.badge){let u=e.badge;u.textContent=ei(o,s);let f=s?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";u.className="zd-badge"+(f?" "+f:"")}},stepSetpoint(t){let e=this.zone,a=or(e),o=io((a==null?20:a)+t);qa(e,io(o-uo(e)))},setApplied(t){let e=this.zone;qa(e,io(t-uo(e)))}},onMount(t,e){let a=e.querySelector(".zd-dial-slot");a.innerHTML=Ka({id:"zone-detail-dial",markHtml:Rt({states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:"zone-detail-halo"}),target:20,current:null,min:co,max:po,step:ar,unit:"C",label:"Zone setpoint"});let o=e.querySelector(".zd-slider-slot");o.innerHTML=Qa({min:co,max:po,step:ar,value:21,label:"Comfort setpoint"});let s={dial:a.querySelector(".lds-dial"),temp:e.querySelector(".zd-temp"),setpoint:e.querySelector(".zd-setpoint"),demand:e.querySelector(".zd-demand"),badge:e.querySelector(".zd-badge"),slider:e.querySelector("[data-comfort-slider]"),sliderValue:e.querySelector("[data-slider-value]"),chart:e.querySelector(".zd-chart")};Xa(s.dial,{onStep:l=>t.stepSetpoint(l)}),s.slider.addEventListener("input",()=>{let l=parseFloat(s.slider.value);Number.isFinite(l)&&(pa(s.slider),s.sliderValue.textContent=lo(l),t.setApplied(l))});let n=()=>t.update(e,s),r=l=>{let p=P("selectedZone");(/(?:text_sensor-zone_\d+_state|switch-zone_\d+_enabled|sensor-zone_\d+_valve_pct)$/.test(l)||l===b.temp(p)||l===b.setpoint(p)||l===b.baseSetpoint(p)||l===b.effectiveSetpoint(p)||l===b.coordinatorOffset(p)||l===b.coordinatorRemaining(p))&&n()};for(let l=1;l<=6;l++)z(b.temp(l),r),z(b.setpoint(l),r),z(b.baseSetpoint(l),r),z(b.effectiveSetpoint(l),r),z(b.coordinatorOffset(l),r),z(b.coordinatorRemaining(l),r),z(b.valve(l),r),z(b.state(l),r),z(b.enabled(l),r);z("sensor-manifold_return_temperature",n),j("selectedZone",n),F(e),n()}});var ai=`
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
`;R("zone-sensor-card",ai);var oi=()=>`
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
  `;function ni(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":t==="External"||t==="EXTERNAL"?"External":"Local Probe"}function ri(t){return t==="BLE Sensor"?"BLE":t==="External"?"External":"Local Probe"}function nr(t,e){let a='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+d("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+d("zone.sensor.bleSource")+'</option><option value="External" data-i18n="zone.sensor.externalSource">'+d("zone.sensor.externalSource")+"</option>";t.innerHTML!==a&&(t.innerHTML=a),t.value=e}var Cd=H({tag:"zone-sensor-card",render:oi,onMount(t,e){let a=e.querySelector(".zs-source"),o=e.querySelector(".zs-ble"),s=e.querySelector(".zs-row-ble"),n=e.querySelector(".zs-row-ext"),r=e.querySelector(".zs-sid"),l=e.querySelector(".zs-sname"),p=e.querySelector(".zs-age"),g=e.querySelector(".zs-scan"),c=e.querySelector(".zs-scan-list"),m=0;function u(){return P("selectedZone")}function f(){let y=a.value;s.style.display=y==="BLE Sensor"?"":"none",n.style.display=y==="External"?"":"none"}let v=ze(e);nr(a,"Local Probe"),v.select(a,{read:()=>ni(String(M(b.tempSource(u()))||"")),commit:y=>Je(u(),"zone_temp_source",ri(y))}),v.text(o,{read:()=>M(b.ble(u()))||"",commit:y=>ft(u(),"zone_ble_mac",y)}),v.text(r,{read:()=>M(b.sensorId(u()))||"",commit:y=>ft(u(),"zone_sensor_id",y)}),v.text(l,{read:()=>M(b.sensorName(u()))||"",commit:y=>ft(u(),"zone_sensor_name",y)}),a.addEventListener("change",f);function k(){let y=u(),S=Number(L(b.externalAge(y)));if(!Number.isFinite(S)||S<0){p.textContent=d("zone.sensor.noIngestYet");return}let w=Math.round(S/1e3);p.textContent=d("zone.sensor.lastIngestAge",{sec:w})}function h(){let y=u();m!==y?(m=y,c.style.display="none",v.discard()):v.refresh(),f(),k()}return g.addEventListener("click",()=>{g.disabled=!0,g.textContent=d("zone.sensor.scanning"),c.style.display="",c.innerHTML='<div class="scan-msg">'+d("zone.sensor.scanning")+"</div>";let y=new AbortController,S=setTimeout(()=>y.abort(),8e3);fetch("/api/v1/ble-scan",{signal:y.signal}).then(w=>w.json()).then(w=>{clearTimeout(S),g.disabled=!1,g.textContent=d("zone.sensor.scan");let A=w&&w.data&&w.data.sensors||w.sensors||[];if(!A.length){c.innerHTML='<div class="scan-msg">'+d("zone.sensor.noSensors")+"</div>";return}let C=(M(b.ble(u()))||"").toUpperCase();c.innerHTML=A.map(N=>{let q=String(N.mac||"").toUpperCase(),W="";q===C?W='<span class="ble-badge">'+d("zone.sensor.assignedThisZone")+"</span>":N.zone>0&&(W='<span class="ble-badge">'+d("zone.sensor.zoneBadge",{zone:N.zone})+"</span>");let O=Number.isFinite(Number(N.temp_c))?Number(N.temp_c).toFixed(1)+"\xB0C":"\u2014",ae=N.name?String(N.name):"";return`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${q}</div>
                <div class="ble-meta">${ae?ae+" \xB7 ":""}${O} \xB7 ${N.rssi||"?"} dBm ${W}</div>
              </div>
              <button class="btn-assign" data-mac="${q}">${d("zone.sensor.assign")}</button>
            </div>`}).join(""),c.querySelectorAll(".btn-assign").forEach(N=>{N.addEventListener("click",()=>{let q=N.getAttribute("data-mac")||"";o.value=q,o.dispatchEvent(new Event("change",{bubbles:!0})),ft(u(),"zone_ble_mac",q)})})}).catch(w=>{clearTimeout(S),g.disabled=!1,g.textContent=d("zone.sensor.scan");let A=w&&w.name==="AbortError"?d("zone.sensor.scanTimeout"):d("zone.sensor.scanFailed");c.innerHTML='<div class="scan-msg">'+A+"</div>"})}),h(),j(h),z(()=>{})}});var si=".zone-coordination-card { height: 100%; }";R("zone-coordination-card",si);var ii=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.sensor.mergeWith">Merge with zone</span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function rr(t,e){let a=t.value,o='<option value="None" data-i18n="common.none">'+d("common.none")+"</option>";for(let s=1;s<=6;s++)s!==e&&(o+='<option value="Zone '+s+'">'+d("common.zone")+" "+s+"</option>");t.innerHTML=o,t.value=a||"None"}var Rd=H({tag:"zone-coordination-card",render:ii,onMount(t,e){let a=e.querySelector(".zc-sync"),o=0;function s(){return P("selectedZone")}let n=ze(e);n.select(a,{read:()=>M(b.syncTo(s()))||"None",commit:p=>Je(s(),"zone_sync_to",p)});function r(){let p=s();o!==p?(rr(a,p),o=p,n.discard()):n.refresh()}function l(p){let g=s();(p===b.syncTo(g)||/^select-zone_\d+_sync_to$/.test(p))&&n.refresh()}j("selectedZone",r);for(let p=1;p<=6;p++)z(b.syncTo(p),l);F(e),r()}});var li=".zone-room-card { height: auto; }";R("zone-room-card",li);var ci=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Zone friendly name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,Vd=H({tag:"zone-room-card",render:ci,onMount(t,e){let a=e.querySelector(".zr-friendly");function o(){return P("selectedZone")}let s=ze(e);s.text(a,{read:()=>Pa(o())||"",commit:n=>Jo(o(),n)}),j("selectedZone",()=>{s.discard()}),j("zoneNames",s.refresh),F(e),s.refresh()}});var di=`
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
`;R("zone-actuator-card",di);function sr(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function ir(t){return t!=null?Number(t).toFixed(0):"---"}function pi(t){return t!=null?Number(t).toFixed(2)+"C":"---"}var ui=()=>`
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
`,Yd=H({tag:"zone-actuator-card",render:ui,onMount(t,e){var p,g,c;let a=Number(P("selectedZone")||1),o={orip:e.querySelector(".za-orip"),crip:e.querySelector(".za-crip"),ofac:e.querySelector(".za-ofac"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function s(){a=Number(P("selectedZone")||1),o.orip.textContent=ir(L(b.motorOpenRipples(a))),o.crip.textContent=ir(L(b.motorCloseRipples(a))),o.ofac.textContent=sr(L(b.motorOpenFactor(a))),o.cfac.textContent=sr(L(b.motorCloseFactor(a))),o.ph.textContent=pi(L(b.preheatAdvance(a)));let m=String(M(b.motorLastFault(a))||"").toUpperCase(),u=m&&m!=="NONE"&&m!=="OK";o.fault.hidden=!u,u&&(o.faultVal.textContent=m)}let n=null;function r(m,u){o.status.textContent=m,o.status.className="za-status show "+(u?"ok":"err"),clearTimeout(n),n=setTimeout(()=>{o.status.classList.remove("show")},4e3)}function l(m,u){let f=m(a);r(u,!0),f&&typeof f.then=="function"&&f.then(v=>{v&&v.ok===!1&&r(d("diagnostics.recovery.rejected"),!1)}).catch(()=>r(d("diagnostics.recovery.unreachable"),!1))}(p=o.faultBtn)==null||p.addEventListener("click",()=>{l(an,"\u2713 "+d("diagnostics.recovery.faultSent",{zone:we(a)}))}),(g=o.factorsBtn)==null||g.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmFactors",{zone:we(a)}))&&l(on,"\u2713 "+d("diagnostics.recovery.factorsReset",{zone:we(a)}))}),(c=o.relearnBtn)==null||c.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmRelearn",{zone:we(a)}))&&l(nn,"\u2713 "+d("diagnostics.recovery.relearnStarted",{zone:we(a)}))}),j("selectedZone",s);for(let m=1;m<=6;m++)z(b.motorOpenRipples(m),s),z(b.motorCloseRipples(m),s),z(b.motorOpenFactor(m),s),z(b.motorCloseFactor(m),s),z(b.preheatAdvance(m),s),z(b.motorLastFault(m),s);F(e),s()}});var mi={1:{label:"E",color:"var(--danger)"},2:{label:"W",color:"var(--warn)"},3:{label:"I",color:"var(--ok)"},4:{label:"C",color:"var(--info)"},5:{label:"D",color:"var(--text-muted)"},6:{label:"V",color:"var(--text-faint)"},7:{label:"VV",color:"var(--text-faint)"}},gi=`
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
`;R("logs-view",gi);var bi=()=>`
  <div class="logs-view">
    <div class="logs-stream"></div>
    <div class="actions">
      <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
      <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      <button class="btn bottom-btn" type="button" data-i18n="logs.scrollBottom">Scroll to bottom</button>
    </div>
  </div>
`;function fi(t){let e=mi[t.level]||{label:"?",color:"var(--text-secondary)"},a=lr(t.tag||""),o=lr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+a+'</span><span class="msg">'+o+"</span></div>"}function lr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var np=H({tag:"logs-view",render:bi,onMount(t,e){let a=e.querySelector(".logs-stream"),o=e.querySelector(".pause-btn"),s=e.querySelector(".clear-btn"),n=e.querySelector(".download-btn"),r=e.querySelector(".bottom-btn"),l=!1;function p(){a.scrollTop=a.scrollHeight}function g(){if(l)return;let c=aa();if(!c||!c.length){a.innerHTML='<div class="logs-empty">'+d("logs.waiting")+"</div>";return}let m=a.scrollHeight-a.scrollTop-a.clientHeight<40;a.innerHTML=c.map(fi).join(""),m&&p()}o.addEventListener("click",()=>{l=!l,o.textContent=l?d("logs.resume"):d("logs.pause"),o.classList.toggle("on",l),l||g()}),s.addEventListener("click",()=>{Fo()}),n.addEventListener("click",()=>{n.disabled=!0,bn().catch(c=>{console.error("[Logs] download failed:",c),window.alert(d("logs.downloadFailed"))}).finally(()=>{n.disabled=!1})}),r.addEventListener("click",()=>{p()}),j("deviceLog",g),F(e),g()}});var vi=`
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
}`;R("diag-i2c",vi);var hi=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,pp=H({tag:"diag-i2c",render:hi,onMount(t,e){let a=e.querySelector("#i2c-result");function o(){a.textContent=P("i2cResult")||d("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Go()}),j("i2cResult",o),F(e),o()}});var xi=`
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
`;R("diag-manual-badge",xi);var yi=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,vp=H({tag:"diag-manual-badge",render:yi,onMount(t,e){let a=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function o(){let s=!!P("manualMode");a&&a.classList.toggle("on",s)}j("manualMode",o),F(e),o()}});var wi=`
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
`;R("diag-zone-motor",wi);var ki=t=>{let e=t.zone||P("selectedZone")||1,a="";for(let o=1;o<=6;o++)a+='<option value="'+o+'"'+(o===e?" selected":"")+">"+d("common.zone")+" "+o+"</option>";return`
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
  `},_p=H({tag:"diag-zone-motor-card",render:ki,onMount(t,e){let a=Number(t.zone||P("selectedZone")||1),o=!!P("manualMode"),s=e.querySelector(".manual-mode-toggle"),n=e.querySelector(".motor-gated"),r=e.querySelector(".motor-zone-select"),l=e.querySelector(".motor-target-input"),p=e.querySelector(".motor-open-btn"),g=e.querySelector(".motor-close-btn"),c=e.querySelector(".motor-stop-btn"),m=()=>{let k=r.value||String(a),h="";for(let y=1;y<=6;y++)h+='<option value="'+y+'">'+d("common.zone")+" "+y+"</option>";r.innerHTML=h,r.value=k};function u(k){o=!!k,s&&(s.classList.toggle("on",o),s.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[r,l,p,g,c].forEach(h=>{h&&(h.disabled=!o)})}function f(){let k=!o;u(k);let h=()=>{};if(k){Tt(!0).catch(h);for(let y=1;y<=6;y++)Ba(y).catch(h)}else Tt(!1).catch(h)}function v(){let k=L(b.motorTarget(a));l&&k!=null?l.value=Number(k).toFixed(0):l&&(l.value="0")}r==null||r.addEventListener("change",()=>{a=Number(r.value||1),v()}),s==null||s.addEventListener("click",f),s==null||s.addEventListener("keydown",k=>{k.key!==" "&&k.key!=="Enter"||(k.preventDefault(),f())});for(let k=1;k<=6;k++)z(b.motorTarget(k),v);v(),u(o),j("manualMode",()=>{u(!!P("manualMode"))}),F(e),l==null||l.addEventListener("change",k=>{if(!o)return;let h=k.target.value;Qo(a,h)}),p==null||p.addEventListener("click",()=>{o&&sa(a,1e4)}),g==null||g.addEventListener("click",()=>{o&&ia(a,1e4)}),c==null||c.addEventListener("click",()=>{o&&Ba(a)})}});var Dt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function $t(t){switch(Number(t)){case Dt.CONTACT:return"contact";case Dt.UNDER_LOAD:return"load";case Dt.STOPPING:return"stopping";default:return"free"}}function go(t){let e=t||[];for(let a=0;a<e.length;a++){let o=Number(e[a].stroke_phase)||0;if(o===Dt.CONTACT||o===Dt.UNDER_LOAD)return e[a]}return null}function nt(t,e,a){if(e[a]==null)return null;let o=Number(t[e[a]]);return Number.isFinite(o)?o:null}function cr(t){let e=String(t||"").split(/\r?\n/).filter(n=>n.trim());if(e.length<2)return[];let a=e[0].split(",").map(n=>n.trim()),o={};for(let n=0;n<a.length;n++)o[a[n]]=n;let s=[];for(let n=1;n<e.length;n++){let r=e[n].split(",");if(r.length<6)continue;let l=p=>Number(r[o[p]]);s.push({t_ms:l("t_ms")||0,motion_count:l("motion_count")||0,current_ma:l("current_ma"),adc_current_raw:nt(r,o,"adc_current_raw"),drive_on:l("drive_on")===1,direction_open:l("direction_open")===1,armed:l("armed")===1,stroke_phase:l("stroke_phase")||0,tacho_period_us:nt(r,o,"tacho_period_us"),tacho_amp_raw:nt(r,o,"tacho_amp_raw"),bemf_raw_a:nt(r,o,"bemf_raw_a"),bemf_raw_b:nt(r,o,"bemf_raw_b"),bemf_differential_raw:nt(r,o,"bemf_differential_raw"),bemf_separation_us:nt(r,o,"bemf_separation_us"),bemf_valid:o.bemf_valid!=null?l("bemf_valid")===1:null,bemf_moving:o.bemf_moving!=null?l("bemf_moving")===1:null,invalid_bemf_samples:nt(r,o,"invalid_bemf_samples")})}return s}function zi(t){let e=0,a=0;for(let o=0;o<t.length;o++)t[o].drive_on&&(t[o].direction_open?e+=1:a+=1);return e>=a?"open":"close"}function Si(t,e){if(!t.length)return null;let a=t.slice().sort((s,n)=>s-n),o=Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*e)));return a[o]}function Oe(t){return Math.round(t*10)/10}function mo(t,e,a){return Math.min(a,Math.max(e,t))}function _i(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function dr(t){let e=[];if(!t.length)return e;let a=t[0].t_ms,o=t[t.length-1].t_ms;for(let s=a;s+500<=o;s+=500){let n=t.reduce((p,g)=>Math.abs(g.t_ms-s)<Math.abs(p.t_ms-s)?g:p,t[0]),r=t.reduce((p,g)=>Math.abs(g.t_ms-(s+500))<Math.abs(p.t_ms-(s+500))?g:p,t[0]),l=(r.t_ms-n.t_ms)/1e3;l>.2&&e.push({t_ms:s+500,slope:(r.current_ma-n.current_ma)/l})}return e}function It(t){let e=t||[],a=[];for(let r=0;r<e.length;r++){let l=e[r],p=l.tacho_period_us!=null?l.tacho_period_us:l.tacho_cadence_us!=null?l.tacho_cadence_us:null;a.push({t_ms:l.t_ms,period_us:p,rate_hz:_i(p)})}let o=e.filter(r=>r.drive_on&&Number.isFinite(r.current_ma)),s=o.length>=2?o:e.filter(r=>Number.isFinite(r.current_ma)),n=dr(s);return{cadence:a,slopes:n,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function pr(t,e){let a=e||zi(t),o=t.filter(T=>T.drive_on&&Number.isFinite(T.current_ma)&&(a==="open"?T.direction_open:!T.direction_open));if(o.length<8)return{direction:a,ok:!1,reason:"too_few_samples"};let s=o[0].t_ms,n=o[o.length-1].t_ms,r=o.filter(T=>T.t_ms>=s+650),l=r.length>12?r:o,p=Math.max(1,n-(l[0]?l[0].t_ms:s)),g=l.filter(T=>T.t_ms<l[0].t_ms+p*.7),c=l.filter(T=>T.t_ms>=l[0].t_ms+p*.8),m=(g.length?g:l).map(T=>T.current_ma),u=(c.length?c:l.slice(-Math.max(4,l.length/8|0))).map(T=>T.current_ma),f=m.reduce((T,oe)=>T+oe,0)/m.length,v=Math.max(...o.map(T=>T.current_ma)),k=Math.max(...u),h=Math.max(0,o[o.length-1].motion_count-o[0].motion_count),y=dr(l),S=y.filter(T=>T.t_ms<l[0].t_ms+p*.7).map(T=>T.slope),w=y.filter(T=>T.t_ms>=l[0].t_ms+p*.75).map(T=>T.slope),A=w.length?Math.max(...w):0,C=Si(S.map(Math.abs),.9)||0,N=a==="close"?.55:.68,q=f>.5?k/f:0,W=Oe(mo(1+N*Math.max(0,q-1),1.25,2.4)),O=Oe(mo(Math.max(C*2.2,A*.42,.4),.4,8)),ae=Oe(mo(1+.35*Math.max(0,q-1),1.15,1.8)),le=a==="open"?1.15:null,$=go(o);return{direction:a,ok:!0,start_ms:s,end_ms:n,runtime_ms:n-s,mean_ma:Oe(f),peak_ma:Oe(v),stall_peak_ma:Oe(k),ripples:h,max_stall_slope_ma_s:Oe(A),travel_slope_ma_s:Oe(C),measured_factor:Oe(q),suggested_factor:W,suggested_slope:O,suggested_slope_floor:ae,suggested_ripple_limit:le,pin_seen:!!$,pin_t_ms:$?$.t_ms:null,pin_motion_count:$?$.motion_count:null,pin_current_ma:$?Oe($.current_ma):null,samples:o}}function ur(t,e){if(!t||!t.ok)return[];let a=t.mean_ma,o=Number(e&&e.factor)||t.suggested_factor;return[{id:"mean",value:a},{id:"threshold",value:Oe(a*o)},{id:"suggested",value:Oe(a*t.suggested_factor)},{id:"cap",value:100}]}var Ht=920,Ot=200,mr=56,ie={t:16,r:18,b:32,l:52},Ue=Ht-ie.l-ie.r,St=Ot-ie.t-ie.b,bo="var(--accent)",ho="var(--series-cool)",Ci="var(--state-warn)",Li="var(--state-ok)",Mi="var(--state-danger)",_a="var(--state-warn)",fo="var(--series-cool)",vo="var(--accent)",Ai="var(--state-ok)",gr={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},br={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},Ei=`
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
`;R("motor-lab-charts",Ei);function zt(t,e,a=St){let o=e.max-e.min||1;return ie.t+a-(t-e.min)/o*a}function Ca(t,e,a,o=Ot){t.appendChild(te("text",{class:"chart-axis-label",x:ie.l,y:o-8},"0 s")),t.appendChild(te("text",{class:"chart-axis-label",x:ie.l+Ue-48,y:o-8},(a/1e3).toFixed(1)+" s"))}function xo(t,e,a=St){for(let o=0;o<=4;o++){let s=ie.t+a*o/4;t.appendChild(te("line",{class:"chart-grid",x1:ie.l,x2:ie.l+Ue,y1:s,y2:s}));let n=e.max-(e.max-e.min)*o/4;t.appendChild(te("text",{class:"chart-tick",x:8,y:s+4},n.toFixed(0)))}}function Ti(t){if(!t.length)return[];let e=[],a=0,o=Number(t[0].stroke_phase)||0;for(let s=1;s<t.length;s++){let n=Number(t[s].stroke_phase)||0;n!==o&&(e.push({phase:o,start:a,end:s-1}),a=s,o=n)}return e.push({phase:o,start:a,end:t.length-1}),e}function Fi(t){let e=t.querySelector("defs");return e||(e=te("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([o,s,n])=>{let r=te("pattern",{id:o,width:4,height:4,patternUnits:"userSpaceOnUse"});r.appendChild(te("path",{d:s,stroke:n,"stroke-width":"1",fill:"none"})),e.appendChild(r)}),t.appendChild(e),e)}function qt(t,e,a){let o=document.createElement("div");o.className="chart-card",o.setAttribute("role","img"),o.setAttribute("aria-label",d(a||t));let s=document.createElement("div");return s.className="chart-head",s.innerHTML='<span class="chart-title">'+d(t)+'</span><span class="chart-sub">'+e+"</span>",o.appendChild(s),o}function Ni(t,e,a){let o=qt(e,d(a||"diagnostics.lab.empty"),e),s=document.createElement("div");s.className="lab-empty",s.textContent=d("diagnostics.lab.empty"),o.appendChild(s),t.appendChild(o)}function La(t,e,a){return t?d("diagnostics.lab.res.live"):a&&a.truncated?d("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?d("diagnostics.lab.res.trace",{direction:d("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):d("diagnostics.lab.res.traceReady")}function Pi(t,e,a,o,s,n){if(!n.current&&!n.overlays)return;let r=It(e),l=qt("diagnostics.lab.chart.current",La(s,a,r),"diagnostics.lab.chart.currentAria");if(r.truncated){let y=document.createElement("div");y.className="lab-chart-warn",y.textContent=d("diagnostics.lab.res.ringWarn",{n:2e3,s:r.window_ms/1e3}),l.appendChild(y)}if(!e.length){let y=document.createElement("div");y.className="lab-empty",y.textContent=d("diagnostics.lab.empty"),l.appendChild(y),t.appendChild(l);return}let p=e.map(y=>y.current_ma).filter(Number.isFinite),g=(o||[]).map(y=>y.value).filter(Number.isFinite),c=va(p.concat([0,40],g),0,50);c.min=0;let m=e[0].t_ms,u=Math.max(1,e[e.length-1].t_ms-m),f=y=>ie.l+(e[y].t_ms-m)/u*Ue,v=e.map((y,S)=>({x:f(S),y:zt(y.current_ma,c)})),k=te("svg",{viewBox:"0 0 "+Ht+" "+Ot,role:"img"});if(xo(k,c),Ca(k,m,u),n.overlays){let y={mean:ho,threshold:Ci,suggested:Li,cap:Mi};(o||[]).forEach(S=>{let w=zt(S.value,c);k.appendChild(te("line",{x1:ie.l,x2:ie.l+Ue,y1:w,y2:w,stroke:y[S.id],"stroke-dasharray":S.id==="mean"?"0":"5 4","stroke-width":S.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:S.id==="cap"?".45":".9"}))})}let h=a&&a.ok&&a.pin_seen?{t_ms:a.pin_t_ms,current_ma:a.pin_current_ma,motion_count:a.pin_motion_count,stroke_phase:1}:go(e);if(h&&Number.isFinite(h.t_ms)){let y=ie.l+(h.t_ms-m)/u*Ue;k.appendChild(te("line",{x1:y,x2:y,y1:ie.t,y2:ie.t+St,stroke:_a,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),k.appendChild(te("circle",{cx:y,cy:zt(Number(h.current_ma)||0,c),r:4.2,fill:_a,stroke:"var(--bg)","stroke-width":"1.5"})),k.appendChild(te("text",{class:"chart-tick",x:Math.min(y+6,ie.l+Ue-64),y:ie.t+12,fill:_a},d("diagnostics.lab.pinMark")))}n.current&&k.appendChild(te("path",{d:ht(v),fill:"none",stroke:bo,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),l.appendChild(k),t.appendChild(l),xt(k,l,{count:e.length,plotTop:ie.t,plotBottom:ie.t+St,xAt:f,label:y=>((e[y].t_ms-m)/1e3).toFixed(2)+" s",dots:y=>n.current?[{y:v[y].y,color:bo}]:[],rows:y=>[{color:bo,label:d("diagnostics.lab.currentMa"),value:Number(e[y].current_ma).toFixed(1)+" mA"},{color:ho,label:d("diagnostics.lab.motion"),value:String(e[y].motion_count)},{color:_a,label:d("diagnostics.lab.stroke"),value:d("diagnostics.lab.stroke."+$t(e[y].stroke_phase))}]})}function Ri(t,e,a,o){if(!o.phase)return;let s=It(e),n=qt("diagnostics.lab.chart.phase",La(a,null,s),"diagnostics.lab.chart.phaseAria");if(!e.length){let u=document.createElement("div");u.className="lab-empty",u.textContent=d("diagnostics.lab.empty"),n.appendChild(u),t.appendChild(n);return}let r=e[0].t_ms,l=Math.max(1,e[e.length-1].t_ms-r),p=mr+ie.b,g=te("svg",{viewBox:"0 0 "+Ht+" "+p,class:"lab-phase-strip",role:"img"});Fi(g);let c=10,m=mr-18;Ti(e).forEach(u=>{let f=ie.l+(e[u.start].t_ms-r)/l*Ue,v=ie.l+(e[u.end].t_ms-r)/l*Ue,k=$t(u.phase),h=Math.max(2,v-f);g.appendChild(te("rect",{x:f,y:c,width:h,height:m,fill:gr[k]||gr.free,stroke:"var(--separator)","stroke-width":"1"})),br[k]&&g.appendChild(te("rect",{x:f,y:c,width:h,height:m,fill:"url(#"+br[k]+")",opacity:".55"})),h>54&&g.appendChild(te("text",{x:f+6,y:c+m/2+3},d("diagnostics.lab.stroke."+k))),g.appendChild(te("line",{x1:v,x2:v,y1:c,y2:c+m,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),Ca(g,r,l,p),n.appendChild(g),t.appendChild(n)}function Di(t,e,a,o){if(!o.cadence)return;let s=It(e),n=qt("diagnostics.lab.chart.cadence",La(a,null,s),"diagnostics.lab.chart.cadenceAria"),r=s.cadence.map(f=>f.rate_hz).filter(f=>f!=null&&Number.isFinite(f));if(!r.length){let f=document.createElement("div");f.className="lab-empty",f.textContent=d("diagnostics.lab.chart.cadenceEmpty"),n.appendChild(f),t.appendChild(n);return}let l=va(r.concat([0]),0,Math.max(10,...r));l.min=0;let p=e[0].t_ms,g=Math.max(1,e[e.length-1].t_ms-p),c=[],m=[];s.cadence.forEach((f,v)=>{f.rate_hz==null||!Number.isFinite(f.rate_hz)||(c.push({x:ie.l+(f.t_ms-p)/g*Ue,y:zt(f.rate_hz,l)}),m.push(v))});let u=te("svg",{viewBox:"0 0 "+Ht+" "+Ot,role:"img"});xo(u,l),Ca(u,p,g),u.appendChild(te("path",{d:ht(c),fill:"none",stroke:fo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),n.appendChild(u),t.appendChild(n),xt(u,n,{count:c.length,plotTop:ie.t,plotBottom:ie.t+St,xAt:f=>c[f].x,label:f=>((s.cadence[m[f]].t_ms-p)/1e3).toFixed(2)+" s",dots:f=>[{y:c[f].y,color:fo}],rows:f=>{let v=s.cadence[m[f]];return[{color:fo,label:d("diagnostics.lab.cadence"),value:v.rate_hz.toFixed(1)+" /s"},{color:ho,label:d("diagnostics.lab.tachoPeriod"),value:Math.round(v.period_us)+" \xB5s"}]}})}function $i(t,e,a,o,s){if(!s.slope)return;let n=It(e),r=qt("diagnostics.lab.chart.slope",La(o,a,n),"diagnostics.lab.chart.slopeAria");if(!n.slopes.length){let v=document.createElement("div");v.className="lab-empty",v.textContent=d("diagnostics.lab.chart.slopeEmpty"),r.appendChild(v),t.appendChild(r);return}let l=n.slopes.map(v=>v.slope),p=a&&a.ok?a.suggested_slope:null,g=va(l.concat(p!=null?[p,0]:[0]),-2,8),c=e[0].t_ms,m=Math.max(1,e[e.length-1].t_ms-c),u=n.slopes.map(v=>({x:ie.l+(v.t_ms-c)/m*Ue,y:zt(v.slope,g)})),f=te("svg",{viewBox:"0 0 "+Ht+" "+Ot,role:"img"});if(xo(f,g),Ca(f,c,m),p!=null){let v=zt(p,g);f.appendChild(te("line",{x1:ie.l,x2:ie.l+Ue,y1:v,y2:v,stroke:Ai,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}f.appendChild(te("path",{d:ht(u),fill:"none",stroke:vo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),r.appendChild(f),t.appendChild(r),xt(f,r,{count:u.length,plotTop:ie.t,plotBottom:ie.t+St,xAt:v=>u[v].x,label:v=>((n.slopes[v].t_ms-c)/1e3).toFixed(2)+" s",dots:v=>[{y:u[v].y,color:vo}],rows:v=>[{color:vo,label:d("diagnostics.lab.slope"),value:n.slopes[v].slope.toFixed(2)+" mA/s"}]})}function vr(t,e){let a=e&&e.samples||[],o=e&&e.analysis,s=!!(e&&e.live),n=e&&e.overlays,r=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let l=document.createElement("div");l.className="motor-lab-charts";let p=document.createElement("div");return p.className="gw-controls",p.setAttribute("role","toolbar"),p.setAttribute("aria-label",d("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([c,m])=>{let u=document.createElement("button");u.type="button",u.className="gw-toggle"+(r[c]?"":" is-off"),u.dataset.layer=c,u.setAttribute("aria-pressed",r[c]?"true":"false"),u.textContent=d(m),p.appendChild(u)}),l.appendChild(p),a.length?(Pi(l,a,o,n,s,r),Ri(l,a,s,r),Di(l,a,s,r),$i(l,a,o,s,r)):Ni(l,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(l),p}var hr=250,xr=2e4,Ii=2e3,Bt=["setup","arm","seat","open","close","review"],Hi=`
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
`;R("diag-motor-lab",Hi);var Oi=()=>`
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
    <div class="lab-chart"></div>
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
`;function yr(t){return t==="open"?{factor:L(i.openThresholdMultiplier),slope:L(i.openSlopeThreshold),floor:L(i.openSlopeCurrentFactor),ripple:L(i.openRippleLimitFactor)}:{factor:L(i.closeThresholdMultiplier),slope:L(i.closeSlopeThreshold),floor:L(i.closeSlopeCurrentFactor)}}function Vt(t){let e=yr(t.direction),a=t.direction==="open"?"open":"close",o=[{key:a+"_threshold_multiplier",labelKey:t.direction==="open"?"settings.motor.openThreshold":"settings.motor.closeThreshold",current:e.factor,suggested:t.suggested_factor,unit:"x"},{key:a+"_slope_threshold",labelKey:t.direction==="open"?"settings.motor.openSlope":"settings.motor.closeSlope",current:e.slope,suggested:t.suggested_slope,unit:"mA/s"},{key:a+"_slope_current_factor",labelKey:t.direction==="open"?"settings.motor.openSlopeFloor":"settings.motor.closeSlopeFloor",current:e.floor,suggested:t.suggested_slope_floor,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&o.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:e.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),o}function yo(t){return d(t?"common.on":"common.off")}function wo(t){return t===1?"HIGH":t===0?"LOW":"\u2014"}function jt(t){return t==="rev32_gpio"||t==="rev31_gpio"}function ko(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",latchFaulted:!1,driversEnabled:null,latchArmLevel:null,latchStateLevel:null,motorEnableLevel:null,invalidSamples:0,tachoRejected:0}}var qp=H({tag:"diag-motor-lab",render:Oi,onMount(t,e){let a=Number(P("selectedZone")||1),o="setup",s="idle",n={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},r={open:null,close:null,seat:null},l={samples:[],analysis:null,live:!1},p={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},g=[],c=ko(),m=e.querySelector(".lab-step-chip"),u=e.querySelector(".lab-zone-chip"),f=e.querySelector(".lab-banner"),v=e.querySelector(".lab-guide"),k=e.querySelector(".lab-kicker"),h=e.querySelector(".lab-stage h3"),y=e.querySelector(".lab-stage p"),S=e.querySelector(".lab-setup"),w=e.querySelector(".lab-zone"),A=e.querySelector(".lab-phase-label"),C=e.querySelector(".lab-log"),N=e.querySelector(".lab-chart"),q=e.querySelector(".lab-metrics"),W=e.querySelector(".lab-suggest"),O=e.querySelector(".lab-primary"),ae=e.querySelector(".lab-secondary"),le=e.querySelector(".lab-estop"),$={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),pad10:e.querySelector('[data-k="pad10"]'),pad9:e.querySelector('[data-k="pad9"]'),pad11:e.querySelector('[data-k="pad11"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function T(_){return Bt.indexOf(_)}function oe(){return we(a)}function Ae(){let _=String(a);w.innerHTML=Array.from({length:6},(V,X)=>'<option value="'+(X+1)+'">'+we(X+1).replace(/</g,"&lt;")+"</option>").join(""),w.value=_,w.setAttribute("aria-label",d("diagnostics.lab.motor")),u.textContent=oe(),u.setAttribute("aria-label",d("diagnostics.lab.motor"))}function J(_,V){let X=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});g.push(X+"  "+d(_,V)),g.length>8&&g.shift(),C.innerHTML=g.map(K=>"<div>"+K+"</div>").join(""),C.scrollTop=C.scrollHeight}function De(_){f.textContent=_||"",f.classList.toggle("show",!!_)}function ue(_,V){s=_,A.dataset.kind=V||"",A.textContent=d("diagnostics.lab.phase."+_)}function Ze(){let _=$t(c.stroke);$.current.textContent=c.current==null?"\u2014":c.current.toFixed(1)+" mA",$.mean.textContent=c.mean==null?"\u2014":c.mean.toFixed(1)+" mA",$.peak.textContent=c.peak==null?"\u2014":c.peak.toFixed(1)+" mA",$.slope.textContent=c.slope==null?"\u2014":c.slope.toFixed(1)+" mA/s",$.runtime.textContent=c.runtime?(c.runtime/1e3).toFixed(1)+" s":"\u2014",$.motion.textContent=c.motion?String(c.motion):"\u2014",$.cadence.textContent=c.cadenceHz==null?"\u2014":c.cadenceHz.toFixed(1)+" /s",$.direction.textContent=c.direction,$.drivers.textContent=yo(c.driversEnabled!=null?c.driversEnabled:de(i.drivers)),$.busy.textContent=yo(c.busy),$.armed.textContent=yo(c.armed);let V=jt(c.backend),X=$.pad10&&$.pad10.parentElement.querySelector("span"),K=$.pad9&&$.pad9.parentElement.querySelector("span");X&&(X.textContent=d(V?"diagnostics.lab.pad10":"diagnostics.lab.pad10nsleep")),K&&(K.textContent=d(V?"diagnostics.lab.pad9":"diagnostics.lab.pad9fault")),$.pad10&&($.pad10.textContent=wo(c.latchArmLevel)),$.pad9&&($.pad9.textContent=wo(c.latchStateLevel)),$.pad11&&($.pad11.textContent=wo(c.motorEnableLevel)),$.backend.textContent=c.backend||"\u2014",$.fault.textContent=c.latchFaulted?d("diagnostics.lab.faultLatch"):c.faultCode?String(c.faultCode):d("common.ok"),$.invalid.textContent=String(c.invalidSamples||0),$.tachoRejected.textContent=String(c.tachoRejected||0),$.stroke.textContent=d("diagnostics.lab.stroke."+_),$.stroke.dataset.phase=_,c.pinSeen?($.pin.textContent=d("diagnostics.lab.pinSeen",{count:c.pinAt}),$.pin.dataset.seen="true"):($.pin.textContent=d("diagnostics.lab.pinWaiting"),$.pin.dataset.seen="false")}function Zt(){let _=l.analysis?ur(l.analysis,yr(l.analysis.direction)):[],V=vr(N,{samples:l.samples,analysis:l.analysis,live:l.live,overlays:_,visible:p});V&&V.addEventListener("click",X=>{let K=X.target.closest(".gw-toggle");if(!K)return;let I=K.dataset.layer;p[I]=!p[I],Object.keys(p).some(Y=>p[Y])||(p[I]=!0),Zt()})}function We(_,V,X){l={analysis:_&&_.ok?_:null,samples:V||[],live:!!X},l.analysis&&(c.mean=l.analysis.mean_ma,c.peak=l.analysis.peak_ma,c.slope=l.analysis.max_stall_slope_ma_s),Zt();let K=[];if(o==="review"?(r.open&&K.push(...Vt(r.open)),r.close&&K.push(...Vt(r.close))):l.analysis&&K.push(...Vt(l.analysis)),!l.analysis&&o!=="review"){q.innerHTML="",W.hidden=!0;return}let I=o==="review"?r.close||r.open:l.analysis;if(!I){q.innerHTML="",W.hidden=!0;return}let se=I.pin_seen?d("diagnostics.lab.pinMetric",{ms:I.pin_t_ms,count:I.pin_motion_count}):d("diagnostics.lab.pinWaiting"),Y=[[d("diagnostics.lab.mean"),I.mean_ma.toFixed(1)+" mA"],[d("diagnostics.lab.peak"),I.peak_ma.toFixed(1)+" mA"],[d("diagnostics.lab.runtime"),(I.runtime_ms/1e3).toFixed(1)+" s"],[d("diagnostics.lab.ripples"),String(I.ripples)],[d("diagnostics.lab.pin"),se]];if(o==="review"&&r.open&&r.close){Y[0]=[d("diagnostics.lab.mean"),r.open.mean_ma.toFixed(1)+" / "+r.close.mean_ma.toFixed(1)+" mA"],Y[1]=[d("diagnostics.lab.peak"),r.open.peak_ma.toFixed(1)+" / "+r.close.peak_ma.toFixed(1)+" mA"];let pe=r.close.pin_seen?d("diagnostics.lab.pinMetric",{ms:r.close.pin_t_ms,count:r.close.pin_motion_count}):d("diagnostics.lab.pinWaiting");Y[4]=[d("diagnostics.lab.pin"),pe]}q.innerHTML=Y.map(pe=>'<div class="lab-metric"><span>'+pe[0]+"</span><strong>"+pe[1]+"</strong></div>").join(""),W.querySelector("tbody").innerHTML=K.map(pe=>"<tr><td>"+d(pe.labelKey)+"</td><td>"+Number(pe.current).toFixed(1)+" "+pe.unit+'</td><td class="better">'+Number(pe.suggested).toFixed(1)+" "+pe.unit+"</td></tr>").join(""),W.hidden=!K.length}function he(){let _=o==="halted",V=_?"setup":o,X=T(V),K=_?"halted":"active";m.dataset.state=K,m.textContent=_?d("diagnostics.lab.halted"):d("diagnostics.lab.stepChip",{step:X+1,total:Bt.length,name:d("diagnostics.lab.steps."+V)}),k.textContent=_?d("diagnostics.lab.halted"):d("diagnostics.lab.stepOf",{step:X+1,total:Bt.length});let I=!_&&V==="arm"&&!jt(c.backend)?"enable":_?"halt":V;h.textContent=d("diagnostics.lab."+I+".title");let se=o==="seat"&&r.seat||o==="open"&&r.open||o==="close"&&r.close,Y=_?"diagnostics.lab.halt.copy":se?"diagnostics.lab."+V+".done":"diagnostics.lab."+I+".copy";y.textContent=d(Y);let pe=o==="setup";v.dataset.setup=pe?"true":"false",S.hidden=!pe,w.disabled=!pe||n.active,u.hidden=pe,u.textContent=oe(),le.dataset.armed=n.active?"true":"false",Ze();let ye=n.active,ve={key:"diagnostics.lab.next",disabled:ye,action:"next"},$e=null;o==="setup"?ve={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:o==="arm"?ve={key:jt(c.backend)?"diagnostics.lab.arm.action":"diagnostics.lab.enable.action",disabled:ye,action:"arm"}:o==="seat"?ve={key:r.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:ye,action:r.seat?"next":"seat"}:o==="open"?ve={key:r.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:ye,action:r.open?"next":"open"}:o==="close"?ve={key:r.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:ye,action:r.close?"next":"close"}:o==="review"?(ve={key:"diagnostics.lab.apply",disabled:!(r.open||r.close),action:"apply"},$e={key:"diagnostics.lab.restart",action:"restart"}):_&&(ve={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),ye&&(ve={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!ye&&(o==="seat"||o==="open"||o==="close")&&!r[o==="seat"?"seat":o]&&s==="failed"&&(ve={key:"diagnostics.lab.retry",disabled:!1,action:o}),!ye&&se&&(o==="seat"||o==="open"||o==="close")&&($e={key:"diagnostics.lab.restart",action:"restart"}),O.dataset.action=ve.action,O.disabled=!!ve.disabled,O.textContent=d(ve.key),$e?(ae.hidden=!1,ae.dataset.action=$e.action,ae.textContent=d($e.key)):(ae.hidden=!0,ae.dataset.action="")}function Ge(){n.timer&&clearInterval(n.timer),n.timer=null}function rt(_){if(o=_,(_==="arm"||_==="setup")&&De(""),_==="review"){let V=r.close||r.open;We(V,V?V.samples:[],!1),ue("done","ok")}else _==="setup"&&We(null,[],!1);he()}async function Ct(){if(!n.active){n.active=!0,ue("arming","run"),he(),J("diagnostics.lab.log.arming",{zone:a});try{if(P("manualMode")||(qe("manualMode",!0),await Tt(!0),J("diagnostics.lab.log.manual")),n.aborted)return;let _=await Et(),V=_&&_.data&&_.data.motor_safety?_.data.motor_safety:{};if(c.backend=V.backend||c.backend,Ze(),jt(c.backend)){J("diagnostics.lab.log.armProbeWait");let I=await Ko({hz:100,durationMs:4e3});if(n.aborted)return;let se=I&&I.data?I.data:{};if(J("diagnostics.lab.log.armProbe",{hz:se.hz||100,cycles:se.cycles||0,armed:se.armed?d("common.on"):d("common.off"),at:se.armed_at_cycle||0}),c.armed=!!se.armed,c.latchFaulted=!se.armed,Ze(),!se.armed)throw De(d("diagnostics.lab.latchBanner")),new Error("latch")}else J("diagnostics.lab.log.enableWait");await At(!0),J("diagnostics.lab.log.drivers");let X=Date.now()+4e3,K=!1;for(;Date.now()<X;){if(n.aborted)return;let I=await Et(),se=I&&I.data?I.data:{},Y=se.motor_safety||{};if(c.driversEnabled=se.drivers_enabled!=null?!!se.drivers_enabled:c.driversEnabled,c.armed=!!Y.armed,c.latchFaulted=!!Y.latch_faulted,c.backend=Y.backend||c.backend,c.latchArmLevel=Y.latch_arm_level,c.latchStateLevel=Y.latch_state_level,c.motorEnableLevel=Y.motor_enable_level,Ze(),se.drivers_enabled&&!Y.latch_faulted){K=!0;break}await new Promise(pe=>setTimeout(pe,hr))}if(!K){let I=jt(c.backend);throw De(d(I?"diagnostics.lab.latchBanner":"diagnostics.lab.enableBanner")),new Error(I?"latch":"enable")}ue("armed","ok"),J("diagnostics.lab.log.armed"),n.active=!1,rt("seat")}catch(_){n.active=!1,ue("failed","halt"),J(_&&_.message==="arm_gpio"?"diagnostics.lab.log.armGpio":_&&_.message==="latch"?"diagnostics.lab.log.latchFaulted":_&&_.message==="enable"?"diagnostics.lab.log.enableFailed":"diagnostics.lab.log.armFailed"),he()}}}async function E(_,V,X){ue("analyzing","run"),he();let K=cr(_),I=pr(K,V),se=I.ok?I.samples:K;if(X&&(r[X]=I.ok?I:null),We(I,se,!1),!I.ok)ue("failed","halt"),J(X==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),X==="seat"&&(r.seat={short:!0},J("diagnostics.lab.log.seatContinue"));else if(ue("done","ok"),J("diagnostics.lab.log.captured",{direction:d("diagnostics.lab.dir."+I.direction),peak:I.peak_ma.toFixed(1)}),I.pin_seen){let Y=c.pinSeen;c.pinSeen=!0,c.pinAt=I.pin_motion_count,c.pinMa=I.pin_current_ma,c.stroke=1,Y||J("diagnostics.lab.log.pinTrace",{count:I.pin_motion_count,ma:I.pin_current_ma.toFixed(1),ms:I.pin_t_ms})}else(X==="close"||X==="seat")&&J("diagnostics.lab.log.pinMissing")}async function D(_,V){for(let X=0;X<6;X++){if(n.aborted)return;try{ue("fetching","run"),he();let K=await tn();J("diagnostics.lab.log.trace"),await E(K,_,V);return}catch(K){if(K&&K.code==="motor_busy"){await new Promise(I=>setTimeout(I,250));continue}ue("failed","halt"),J("diagnostics.lab.log.traceFailed"),We(null,n.live,!0);return}}ue("failed","halt")}function B(_){let V=_.map(K=>K.current_ma).filter(Number.isFinite);if(!V.length)return;let X=V.reduce((K,I)=>K+I,0);if(c.mean=Math.round(X/V.length*10)/10,c.peak=Math.round(Math.max(...V)*10)/10,_.length>=2){let K=_[Math.max(0,_.length-3)],I=_[_.length-1],se=(I.t_ms-K.t_ms)/1e3;se>.05&&(c.slope=Math.round((I.current_ma-K.current_ma)/se*10)/10)}}async function ne(_,V){if(!n.active){n={active:!0,aborted:!1,direction:_,timer:null,live:[],started:Date.now()},c=ko(),c.direction=d("diagnostics.lab.dir."+_),ue("starting","run"),he(),We(null,[],!0),J("diagnostics.lab.log.starting",{direction:d("diagnostics.lab.dir."+_),zone:a});try{if(_==="open"?await sa(a,1e4):await ia(a,1e4),n.aborted)return;ue("waiting","run"),he();let X=!1,K=async()=>{if(!n.aborted)try{let I=await Et(),se=I&&I.data?I.data:{},Y=se.motor_safety||{},pe=Number(Y.current_ma),ye=!!Y.motor_busy,ve=Y.drive_on!=null?!!Y.drive_on:ye;ye&&!X&&(X=!0,ue("running","run"),J("diagnostics.lab.log.busy")),c.busy=ye,c.runtime=Date.now()-n.started,c.motion=Number(Y.motion_evidence_count)||c.motion,c.stroke=Number(Y.stroke_phase)||0,c.tachoPeriodUs=Number(Y.tacho_period_us)||c.tachoPeriodUs,c.tachoCadenceUs=Number(Y.tacho_cadence_us)||c.tachoCadenceUs;let $e=c.tachoPeriodUs||c.tachoCadenceUs;c.cadenceHz=$e>0?1e6/$e:null,c.faultCode=Number(Y.fault_code)||0,c.armed=!!Y.armed,c.latchFaulted=!!Y.latch_faulted,c.latchArmLevel=Y.latch_arm_level,c.latchStateLevel=Y.latch_state_level,c.motorEnableLevel=Y.motor_enable_level,c.driversEnabled=se.drivers_enabled!=null?!!se.drivers_enabled:c.driversEnabled,c.backend=Y.backend||c.backend,c.invalidSamples=Number(Y.invalid_samples)||0,c.tachoRejected=Number(Y.tacho_rejected)||0,!c.pinSeen&&(c.stroke===1||c.stroke===2)&&(c.pinSeen=!0,c.pinAt=c.motion,c.pinMa=Number.isFinite(pe)?pe:c.current,J("diagnostics.lab.log.pin",{count:c.pinAt,ma:Number(c.pinMa||0).toFixed(1)})),Number.isFinite(pe)&&(c.current=pe,n.live.push({t_ms:Date.now()-n.started,current_ma:pe,motion_count:c.motion,drive_on:ve,direction_open:_==="open",stroke_phase:c.stroke,tacho_period_us:c.tachoPeriodUs,tacho_cadence_us:c.tachoCadenceUs,armed:c.armed,fault_code:c.faultCode,backend:c.backend}),B(n.live),We(null,n.live,!0)),Ze();let Wt=Date.now()-n.started;if(!X&&Wt>Ii){Ge(),n.active=!1,ue("failed","halt"),Y.latch_faulted?(De(d("diagnostics.lab.latchBanner")),J("diagnostics.lab.log.latchFaulted")):J("diagnostics.lab.log.neverStarted"),he();return}(X&&!ye||Wt>xr)&&(Ge(),c.busy=!1,X&&J("diagnostics.lab.log.stopped"),n.active=!1,await D(_,V),he())}catch(I){Date.now()-n.started>xr&&(Ge(),n.active=!1,ue("failed","halt"),J("diagnostics.lab.log.traceFailed"),he())}};n.timer=setInterval(K,hr),K()}catch(X){n.active=!1,ue("failed","halt"),J("diagnostics.lab.log.startFailed"),he()}}}function fe(){Ge(),n={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},r={open:null,close:null,seat:null},c=ko(),g.length=0,C.innerHTML="",De(""),ue("idle"),rt("setup")}async function Z(){n.aborted=!0,n.active=!1,Ge(),c.busy=!1,De(d("diagnostics.lab.estopDone")),ue("halted","halt"),J("diagnostics.lab.log.estop"),o="halted",he();try{await en()}catch(_){}Ze()}function me(){let _=T(o);_<0||_>=Bt.length-1||rt(Bt[_+1])}function xe(_){if(_==="start"){J("diagnostics.lab.log.selected",{zone:a}),rt("arm");return}if(_==="arm")return Ct();if(_==="seat")return ne("close","seat");if(_==="open")return ne("open","open");if(_==="close")return ne("close","close");if(_==="next")return me();if(_==="restart")return fe();if(_==="apply"){let V=[];r.open&&V.push(...Vt(r.open)),r.close&&V.push(...Vt(r.close)),V.forEach(X=>Pe(X.key,X.suggested)),ue("applied","ok"),J("diagnostics.lab.log.applied"),he()}}O.addEventListener("click",()=>xe(O.dataset.action)),ae.addEventListener("click",()=>xe(ae.dataset.action)),le.addEventListener("click",Z),w.addEventListener("change",()=>{a=Number(w.value||1),u.textContent=oe()});function Se(_){_.key==="Escape"&&P("section")==="motorlab"&&(_.preventDefault(),Z())}window.addEventListener("keydown",Se),Ae(),ue("idle"),We(null,[],!1),he(),Et().then(_=>{let V=_&&_.data&&_.data.motor_safety?_.data.motor_safety:{};c.backend=V.backend||c.backend,c.armed=!!V.armed,c.latchFaulted=!!V.latch_faulted,c.latchArmLevel=V.latch_arm_level,c.latchStateLevel=V.latch_state_level,c.motorEnableLevel=V.motor_enable_level,_&&_.data&&_.data.drivers_enabled!=null&&(c.driversEnabled=!!_.data.drivers_enabled),he()}).catch(()=>{}),z(i.drivers,Ze),j("manualMode",Ze),j("selectedZone",()=>{o==="setup"&&(a=Number(P("selectedZone")||a),w.value=String(a))}),F(e)}});var qi=`
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
`;R("diag-system-card",qi);var Bi=()=>`
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
`,Gp=H({tag:"diag-system-card",render:Bi,onMount(t,e){let a=e.querySelector('[data-k="cpu0"]'),o=e.querySelector('[data-k="cpu1"]'),s=e.querySelector('[data-k="heap"]'),n=e.querySelector('[data-k="dma"]'),r=e.querySelector('[data-k="largestInternal"]'),l=e.querySelector('[data-k="minInternal"]'),p=e.querySelector('[data-k="psram"]'),g=e.querySelector('[data-k="largestPsram"]'),c=e.querySelector('[data-k="bleAds"]'),m=e.querySelector('[data-k="bleLastAdv"]'),u=e.querySelector('[data-k="bleState"]'),f=e.querySelector('[data-bar="cpu0"]'),v=e.querySelector('[data-bar="cpu1"]'),k=e.querySelector('[data-k="reset"]'),h=(A,C,N)=>{if(N==null||!Number.isFinite(Number(N))){A.textContent="\u2014",A.classList.remove("warn"),C.style.width="0%";return}let q=Math.max(0,Math.min(100,Number(N)));A.textContent=q.toFixed(0)+"%",A.classList.toggle("warn",q>=90),C.style.width=q+"%"},y=(A,C,N)=>{if(C==null||!Number.isFinite(Number(C))){A.textContent="\u2014";return}let q=Number(C);A.textContent=q+" KB",A.classList.toggle("warn",N!=null&&q<N)},S=A=>{if(A==null||!Number.isFinite(Number(A))||Number(A)<=0)return"\u2014";let C=Number(A);return C<1e3?Math.round(C)+" ms":C<6e4?(C/1e3).toFixed(1)+" s":Math.round(C/6e4)+" min"},w=()=>{h(a,f,L(i.cpuLoadCore0)),h(o,v,L(i.cpuLoadCore1)),y(s,L(i.freeInternalKb),48),y(n,L(i.freeDmaKb),32),y(r,L(i.largestInternalKb),24),y(l,L(i.minInternalKb),48),y(p,L(i.freePsramKb),null),y(g,L(i.largestPsramKb),null);let A=L(i.bleAdsPerSec);A==null||!Number.isFinite(Number(A))?c.textContent="\u2014":c.textContent=Number(A).toFixed(1)+"/s",m.textContent=S(L(i.bleLastAdvAgeMs));let C=M(i.bleDemanded)==="on",N=M(i.bleHubEnabled)==="on",q=M(i.bleScanning)==="on",W=[];W.push(C?"demanded":"idle"),N?W.push(q?"scanning":"on"):W.push("off"),u.textContent=W.join(" \xB7 ");let O=String(M(i.resetReason)||P("resetReason")||"").trim();k.textContent=O||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{rn().catch(A=>console.error("[System] dump failed:",A))}),z(i.cpuLoadCore0,w),z(i.cpuLoadCore1,w),z(i.freeInternalKb,w),z(i.freeDmaKb,w),z(i.largestInternalKb,w),z(i.minInternalKb,w),z(i.freePsramKb,w),z(i.largestPsramKb,w),z(i.bleAdsPerSec,w),z(i.bleLastAdvAgeMs,w),z(i.bleHubEnabled,w),z(i.bleScanning,w),z(i.bleDemanded,w),z(i.resetReason,w),j("resetReason",w),F(e),w()}});var Vi=`
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
`;R("settings-manifold-card",Vi);var ji=()=>{let t="";for(let a=1;a<=8;a++)t+="<option>Probe "+a+"</option>";let e="";for(let a=1;a<=8;a++)e+='<div class="probe-cell"><div class="probe-name">Probe '+a+'</div><div class="probe-temp" data-probe="'+a+'">---</div></div>';return ge({className:"settings-manifold-card",titleHtml:`<span data-i18n="settings.manifold.title">Manifold Configuration</span>${ke("settings.manifold.help")}`,bodyHtml:`
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
    `})},ru=H({tag:"settings-manifold-card",render:ji,onMount(t,e){let a=e.querySelector(".sm-type"),o=e.querySelector(".sm-flow"),s=e.querySelector(".sm-ret"),n=ze(e);n.select(a,{read:()=>M(i.manifoldType)||"NO (Normally Open)",commit:l=>He("manifold_type",l)}),n.select(o,{read:()=>M(i.manifoldFlowProbe)||"Probe 7",commit:l=>He("manifold_flow_probe",l)}),n.select(s,{read:()=>M(i.manifoldReturnProbe)||"Probe 8",commit:l=>He("manifold_return_probe",l)});function r(){for(let l=1;l<=8;l++){let p=e.querySelector('[data-probe="'+l+'"]');p&&(p.textContent=Qe(L(b.probeTemp(l))))}}z(i.manifoldType,n.refresh),z(i.manifoldFlowProbe,n.refresh),z(i.manifoldReturnProbe,n.refresh);for(let l=1;l<=8;l++)z(b.probeTemp(l),r);F(e),n.refresh(),r()}});var Ui=`
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
`;R("settings-touch-card",Ui);var Zi=()=>ge({className:"settings-touch-card",titleHtml:"Lune Touch connection",bodyHtml:`
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
  `}),mu=H({tag:"settings-touch-card",render:Zi,onMount(t,e){let a=e.querySelector(".touch-status"),o=e.querySelector(".touch-status-copy"),s=e.querySelector(".touch-identity"),n=e.querySelector(".touch-note"),r=e.querySelector(".touch-error"),l=e.querySelector(".touch-approve"),p=e.querySelector(".touch-disconnect");function g(){let c=de(i.authorityConfigured),m=de(i.authorityProposalPending),u=M(i.authorityState)||"unconfigured",f=m?M(i.authorityProposalInstallationId):M(i.authorityInstallationId),v=m?M(i.authorityProposalCoordinatorId):M(i.authorityCoordinatorId),k=M(i.authorityProposalName)||"Lune Touch",h=M(i.authorityProposalSite)||"House";a.classList.toggle("connected",c&&!m),a.classList.toggle("pending",m),o.innerHTML=m?`<strong>${k} is ready to connect</strong>${c?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:c?`<strong>Control approved</strong>${u.replace(/_/g," ")}${Number(L(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(L(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",s.hidden=!c&&!m,e.querySelector(".touch-name").textContent=m?k:"Lune Touch",e.querySelector(".touch-site").textContent=m?h:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=f||"\u2014",e.querySelector(".touch-coordinator-value").textContent=v||"\u2014",n.textContent=m?"Approval is local to this manifold. Discovery alone never grants control.":c?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",l.hidden=!m,p.hidden=!c||m}l.addEventListener("click",async()=>{r.textContent="",l.disabled=!0,l.textContent="Approving\u2026";try{await Xo()}catch(c){r.textContent=(c==null?void 0:c.message)||"Unable to approve Lune Touch."}finally{l.disabled=!1,l.textContent="Approve Lune Touch"}}),p.addEventListener("click",async()=>{if(r.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){p.disabled=!0;try{await Yo()}catch(c){r.textContent=(c==null?void 0:c.message)||"Unable to disconnect Lune Touch."}finally{p.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(c=>z(c,g)),g()}});var Wi=()=>ge({className:"settings-minimum-flow-card",titleHtml:`Minimum active-loop opening${ke("settings.minFlow.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field">${Ee({on:!1,label:"Enable minimum zone flow",className:"smf-always",attrs:'data-i18n-label="settings.minFlow.title"'})}</span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  `}),wu=H({tag:"settings-minimum-flow-card",render:Wi,onMount(t,e){let a=e.querySelector(".smf-always"),o=e.querySelector(".smf-pct"),s=e.querySelector(".smf-pct-row"),n=ze(e),r=l=>{s.hidden=!l,s.setAttribute("aria-hidden",l?"false":"true"),o.disabled=!l};n.toggle(a,{read:()=>de(i.minimumFlowAlways),onChange:r,commit:l=>{let p=l?"on":"off";x(i.minimumFlowAlways,{state:p}),He("minimum_flow_always",p).catch(()=>x(i.minimumFlowAlways,{state:l?"off":"on"}))}}),n.num(o,{read:()=>L(i.minZoneFlowPct),commit:l=>{x(i.minZoneFlowPct,{value:l}),Pe("min_zone_flow_pct",l)}}),z(i.minimumFlowAlways,n.refresh),z(i.minZoneFlowPct,n.refresh),F(e),n.refresh()}});var Ki=`
.settings-return-temp-card .srt-zone-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-return-temp-card .srt-zone-label .zone-title-name {
  font-weight: 500;
  color: var(--text-faint);
}
`;R("settings-return-temp-card",Ki);function mt(t){return!!(t&&t!=="None")}function Gi(t){return"Probe "+t}function Xi(){for(let t=1;t<=6;t++)if(mt(M(b.probe(t))))return!0;return!1}function Yi(){let t="";for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return t}var Ji=()=>{let t=Yi(),e="";for(let a=1;a<=6;a++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${a}">
        <span class="ui-label srt-zone-label" data-zone-label="${a}">${Ke(a)}</span>
        <span class="ui-field"><select class="ui-select srt-probe" data-zone="${a}">${t}</select></span>
      </div>`;return ge({className:"settings-return-temp-card",titleHtml:`<span data-i18n="settings.returnTemp.title">Return temperature</span>${ke("settings.returnTemp.help")}`,bodyHtml:`
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.returnTemp.enabledSub">Optional return probes for legacy return-temp balancing \u2014 not required for adaptive balancing.</span></span>
        <span class="ui-field">${Ee({on:!1,label:"Enable return temperature probes",className:"srt-enabled",attrs:'data-i18n-label="settings.returnTemp.title"'})}</span>
      </div>
      <div class="srt-zones">${e}</div>
    `})},Eu=H({tag:"settings-return-temp-card",render:Ji,onMount(t,e){let a=e.querySelector(".srt-enabled"),o=e.querySelector(".srt-zones"),s=Array.from(e.querySelectorAll(".srt-probe")),n=Object.create(null);function r(m){return n[m]||Gi(m)}function l(m){o.hidden=!m,o.setAttribute("aria-hidden",m?"false":"true");for(let u of s)u.disabled=!m}function p(){for(let m=1;m<=6;m++){let u=e.querySelector('[data-zone-label="'+m+'"]');u&&(u.innerHTML=Ke(m))}}let g=ze(e),c;for(let m of s){let u=Number(m.dataset.zone);g.select(m,{read:()=>{let f=M(b.probe(u));return mt(f)?(n[u]=f,f):r(u)},commit:f=>{!c||!c.staged||(n[u]=f,Je(u,"zone_probe",f))}})}c=g.toggle(a,{read:()=>Xi(),onChange:m=>{if(m)for(let u of s){let f=Number(u.dataset.zone);mt(u.value)||(u.value=r(f)),mt(u.value)&&(n[f]=u.value)}else for(let u of s){let f=Number(u.dataset.zone);mt(u.value)&&(n[f]=u.value)}l(m)},commit:m=>{if(!m){for(let u of s){let f=Number(u.dataset.zone);mt(u.value)&&(n[f]=u.value),Je(f,"zone_probe","None")}return}for(let u of s){let f=Number(u.dataset.zone),v=mt(u.value)?u.value:r(f);n[f]=v,Je(f,"zone_probe",v)}}});for(let m=1;m<=6;m++)z(b.probe(m),g.refresh),z(b.name(m),p);F(e),p(),g.refresh()}});var Qi=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function el(){if(String(M(i.bleClockSyncAdvertising)||"").toLowerCase()==="on")return d("common.clockSyncing");let t=String(M(i.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return d("settings.bleClock.waitingClock");if(t==="ble_busy")return d("settings.bleClock.busy");if(t)return t;let e=Number(L(i.bleClockSyncLastOkS)||0);if(!e)return d("settings.bleClock.never");let a=Math.max(0,Math.round(Date.now()/1e3)-e);if(a<60)return d("common.secondsAgo",{value:a});if(a<3600)return d("common.minutesAgo",{value:Math.round(a/60)});let o=Math.round(a/3600);return d("settings.bleClock.hoursAgo",{value:o})}var tl=()=>ge({className:"settings-ble-clock-card",titleHtml:`<span data-i18n="settings.bleClock.title">Room clocks</span>${ke("settings.bleClock.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.bleClock.enabledSub">Broadcast time so nearby Shelly BLU displays can correct drift.</span></span>
      <span class="ui-field">${Ee({on:!1,label:"Enable room clock sync",className:"sbc-enabled",attrs:'data-i18n-label="settings.bleClock.title"'})}</span>
    </div>
    <div class="ui-row sbc-interval-row">
      <span class="ui-label"><span data-i18n="settings.bleClock.interval">Broadcast interval</span> <span class="ui-sublabel" data-i18n="settings.bleClock.intervalSub">Short bursts. Displays usually apply time about once a day.</span></span>
      <span class="ui-field"><select class="ui-select sbc-interval"></select></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.bleClock.lastSync">Last broadcast</span> <span class="sbc-status ui-sublabel">\u2014</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbc-now" data-i18n="settings.bleClock.syncNow">Sync now</button></span>
    </div>
  `}),Iu=H({tag:"settings-ble-clock-card",render:tl,onMount(t,e){let a=e.querySelector(".sbc-enabled"),o=e.querySelector(".sbc-interval"),s=e.querySelector(".sbc-status"),n=e.querySelector(".sbc-now"),r=ze(e),l=()=>{let g=o.value;o.innerHTML=Qi.map(c=>`<option value="${c.value}">${d(c.labelKey)}</option>`).join(""),g&&(o.value=g)},p=()=>{s.textContent=el()};l(),r.toggle(a,{read:()=>de(i.bleClockSyncEnabled),commit:g=>{let c=g?"on":"off";x(i.bleClockSyncEnabled,{state:c}),He("ble_clock_sync_enabled",c).catch(()=>x(i.bleClockSyncEnabled,{state:g?"off":"on"}))}}),r.select(o,{read:()=>String(Math.round(Number(L(i.bleClockSyncIntervalMin))||60)),commit:g=>{let c=Number(g);x(i.bleClockSyncIntervalMin,{value:c}),Pe("ble_clock_sync_interval_min",c)}}),n.addEventListener("click",()=>{x(i.bleClockSyncAdvertising,{state:"on"}),p(),Ne("ble_clock_sync_now")}),z(i.bleClockSyncEnabled,r.refresh),z(i.bleClockSyncIntervalMin,r.refresh),z(i.bleClockSyncLastOkS,p),z(i.bleClockSyncLastError,p),z(i.bleClockSyncAdvertising,p),F(e),r.refresh(),p()}});var al=`
.settings-action-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-action-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-action-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-action-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-action-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;R("settings-control-card",al);var ol=()=>ge({className:"settings-action-card",titleHtml:"Recovery actions",bodyHtml:`
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  `}),Uu=H({tag:"settings-control-card",render:ol,onMount(t,e){F(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&Ne("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{Ne("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&Ne("restart")})}});var nl=`
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
`;R("settings-motor-calibration-card",nl);var Ma=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],rl=()=>{let t="";for(let e=0;e<Ma.length;e++){let a=Ma[e];if(a.key==="generic_runtime_limit_seconds")continue;let o=sl(a.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+a.labelKey+'">'+d(a.labelKey)+"</span> ("+a.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+a.cls+'" value="0" step="'+o+'"></span></div>'}return ge({className:"settings-motor-cal-card",titleHtml:`<span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${ke("settings.motor.help")}`,bodyHtml:`
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field">${Ee({on:!1,label:"Toggle motor drivers",className:"mc-drivers-toggle",attrs:'data-i18n-label="settings.motor.toggleDrivers"'})}</span>
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
    `})};function sl(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var em=H({tag:"settings-motor-calibration-card",render:rl,onMount(t,e){let a=e.querySelector(".smc-profile"),o=e.querySelector(".smc-safe-runtime"),s=e.querySelector(".mc-drivers-toggle"),n=ze(e);function r(p){if(p==="HmIP VdMot"&&Pe("hmip_runtime_limit_seconds",40),p==="Generic"){let g=Number(L(i.genericRuntimeLimitSeconds));(!Number.isFinite(g)||g<=0)&&Pe("generic_runtime_limit_seconds",45)}}n.toggle(s,{read:()=>de(i.drivers),commit:p=>At(p)}),n.select(a,{read:()=>M(i.motorProfileDefault)||"HmIP VdMot",commit:p=>{He("motor_profile_default",p),r(p)}});function l(){let p=M(i.motorProfileDefault)||"HmIP VdMot";o.disabled=p==="HmIP VdMot"}n.num(o,{read:()=>(M(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:L(i.genericRuntimeLimitSeconds),commit:p=>{a.value==="Generic"&&Pe("generic_runtime_limit_seconds",p)}});for(let p=0;p<Ma.length;p++){let g=Ma[p];if(g.key==="generic_runtime_limit_seconds")continue;let c=e.querySelector(".smc-"+g.cls);c&&(n.num(c,{read:()=>L(g.id),commit:m=>Pe(g.key,m)}),z(g.id,n.refresh))}z(i.drivers,n.refresh),z(i.motorProfileDefault,()=>{n.refresh(),l()}),z(i.genericRuntimeLimitSeconds,n.refresh),z(i.hmipRuntimeLimitSeconds,n.refresh),F(e),r(M(i.motorProfileDefault)||"HmIP VdMot"),n.refresh(),l()}});var il=600*1e3,wr=600,ll=`
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
`;R("settings-firmware-card",ll);var cl=()=>ge({className:"settings-firmware-card",titleHtml:`<span data-i18n="settings.firmware.title">Firmware</span>${ke("settings.firmware.help")}`,bodyHtml:`
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
  `});function kr(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function Ut(t,e){let a=kr(t);if(!a)return!1;let o=kr(e);if(!o)return!0;for(let s=0;s<3;s++)if(a[s]!==o[s])return a[s]>o[s];return!1}function zr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function dl(t){let e=String(t||"").trim();return e.length<=wr?e:e.slice(0,wr).replace(/\s+\S*$/,"")+"\u2026"}function pl(){let t=document.querySelector(".settings-backup-card");if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});let e=t.querySelector(".sbk-save");e&&e.focus({preventScroll:!0})}var cm=H({tag:"settings-firmware-card",render:cl,onMount(t,e){let a=e.querySelector(".sfw-version"),o=e.querySelector(".sfw-status"),s=e.querySelector(".sfw-check"),n=e.querySelector(".sfw-banner"),r=e.querySelector(".sfw-hop"),l=e.querySelector(".sfw-notes"),p=e.querySelector(".sfw-install"),g=e.querySelector(".sfw-asset"),c=e.querySelector(".sfw-jump"),m=e.querySelector(".sfw-file"),u=e.querySelector(".sfw-choose"),f=e.querySelector(".sfw-upload"),v=e.querySelector(".sfw-filename"),k=e.querySelector(".sfw-progress"),h=k.querySelector("i"),y=e.querySelector(".sfw-upload-status"),S=null,w=!1,A=0,C=!1,N=()=>M(i.firmware)||P("firmwareVersion")||"",q=(T,oe)=>{o.textContent=T||"",o.className="ui-sublabel sfw-status"+(oe?" "+oe:"")},W=()=>{let T=gt.firmware_update;if(!T||T.available!==!0)return null;let oe=String(T.latest||"").trim();return oe?{tag:oe,notes:d("settings.firmware.deviceReported"),asset:ja(oe)}:null},O=()=>{let T=W();return S?T&&Ut(T.tag,S.tag)?T:S:T},ae=()=>{a.textContent=N()||d("settings.firmware.unknownVersion")},le=()=>{let T=O(),oe=!!T&&Ut(T.tag,N());if(n.hidden=!oe,!oe){qe("firmwareUpdateAvailable",null);return}r.innerHTML=zr(N()||d("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+zr(T.tag),l.textContent=dl(T.notes)||d("common.noData"),g.href=T.asset.url,g.setAttribute("download",T.asset.name),g.title=T.asset.name,qe("firmwareUpdateAvailable",{current:N(),latest:T.tag,url:T.asset.url})},$=T=>{w||!T&&A&&Date.now()-A<il||(w=!0,A=Date.now(),s.disabled=!0,q(d("settings.firmware.checking")),Promise.resolve(sn()).catch(()=>{}),dn().then(oe=>{S=oe,le();let Ae=Ut(oe.tag,N());q(Ae?d("settings.firmware.availableStatus",{version:oe.tag}):d("settings.firmware.upToDate"),Ae?null:"ok")}).catch(oe=>{S=null,le();let Ae=W();if(Ae){q(Ut(Ae.tag,N())?d("settings.firmware.availableStatus",{version:Ae.tag}):d("settings.firmware.upToDate"),Ut(Ae.tag,N())?null:"ok");return}if((oe instanceof Ye?oe.code:"network")==="no_releases"){q(d("settings.firmware.noReleases"),"ok");return}q(d("settings.firmware.checkFailed"),"err")}).finally(()=>{w=!1,s.disabled=!1}))};s.addEventListener("click",()=>$(!0)),c.addEventListener("click",pl),p.addEventListener("click",()=>{let T=O();T&&window.confirm(d("settings.firmware.confirmInstall",{version:T.tag}))&&(p.disabled=!0,p.textContent=d("settings.firmware.installing"),Promise.resolve(ln()).then(()=>q(d("settings.firmware.installStarted"))).catch(()=>{q(d("settings.firmware.installFailed"),"err"),p.disabled=!1,p.textContent=d("settings.firmware.install")}))}),u.addEventListener("click",()=>m.click()),m.addEventListener("change",()=>{let T=m.files&&m.files[0];v.textContent=T?T.name:d("settings.firmware.noFile"),f.disabled=!T||C,y.textContent="",y.className="ui-note sfw-upload-status"}),f.addEventListener("click",()=>{let T=m.files&&m.files[0];!T||C||window.confirm(d("settings.firmware.confirmUpload",{file:T.name}))&&(C=!0,f.disabled=!0,u.disabled=!0,k.hidden=!1,h.style.width="0%",y.className="ui-note sfw-upload-status",y.textContent=d("settings.firmware.uploading",{value:0}),Promise.resolve(cn()).catch(oe=>console.warn("[Firmware] prepare rejected, continuing with upload:",oe)).then(()=>pn(T,oe=>{h.style.width=oe+"%",y.textContent=d("settings.firmware.uploading",{value:oe})})).then(()=>{h.style.width="100%",y.className="ui-note sfw-upload-status",y.textContent=d("settings.firmware.uploadDone")}).catch(oe=>{console.error("[Firmware] upload failed:",oe),k.hidden=!0,y.textContent=d("settings.firmware.uploadFailed")}).finally(()=>{C=!1,u.disabled=!1,f.disabled=!1}))}),j("section",()=>{P("section")==="settings"&&$(!1)}),z(i.firmware,()=>{ae(),le()}),z("firmware_update",le),F(e),ae(),P("section")==="settings"&&$(!1)}});var ul=`
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
`;R("settings-backup-card",ul);var ml=()=>ge({className:"settings-backup-card",titleHtml:`<span data-i18n="settings.backup.title">Backup and restore</span>${ke("settings.backup.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field">${Ee({on:!0,label:"Restore learned motor values",className:"sbk-learned",attrs:'data-i18n-label="settings.backup.restoreLearned"'})}</span>
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
  `}),fm=H({tag:"settings-backup-card",render:ml,onMount(t,e){let a=e.querySelector(".sbk-save"),o=e.querySelector(".sbk-learned"),s=e.querySelector(".sbk-file"),n=e.querySelector(".sbk-choose"),r=e.querySelector(".sbk-restore"),l=e.querySelector(".sbk-filename"),p=e.querySelector(".sbk-status"),g=e.querySelector(".sbk-result"),c=!0,m=!1,u=(f,v)=>{p.textContent=f||"",p.className="sbk-status"+(v?" "+v:"")};o.addEventListener("click",()=>{c=!c,ma(o,{on:c})}),a.addEventListener("click",()=>{m||(m=!0,a.disabled=!0,g.textContent="",u(d("settings.backup.saving")),un(!0).then(f=>{if(!la(f))throw new Error("unexpected_export_payload");u(d("settings.backup.saved",{file:gn(f)}),"ok")}).catch(f=>{console.error("[Backup] export failed:",f),u(d("settings.backup.saveFailed"),"err")}).finally(()=>{m=!1,a.disabled=!1}))}),n.addEventListener("click",()=>s.click()),s.addEventListener("change",()=>{let f=s.files&&s.files[0];l.textContent=f?f.name:d("settings.backup.noFile"),r.disabled=!f||m,g.textContent="",u("")}),r.addEventListener("click",async()=>{let f=s.files&&s.files[0];if(!f||m)return;let v="";try{v=await f.text()}catch(h){u(d("settings.backup.readFailed"),"err");return}let k=null;try{k=JSON.parse(v)}catch(h){u(d("settings.backup.invalidFile"),"err");return}if(!la(k)){u(d("settings.backup.invalidFile"),"err");return}window.confirm(d("settings.backup.confirmRestore",{file:f.name}))&&(m=!0,r.disabled=!0,g.textContent="",u(d("settings.backup.restoring")),mn(k,c).then(h=>{u(d("settings.backup.restored"),"ok"),g.textContent=d("settings.backup.result",{applied:h.applied,skipped:h.skipped,ignored:h.ignored})}).catch(h=>{console.error("[Backup] restore failed:",h),u(d("settings.backup.restoreFailed"),"err")}).finally(()=>{m=!1,r.disabled=!1}))}),F(e)}});var gl=()=>ge({className:"settings-appearance-card",titleHtml:`<span data-i18n="settings.appearance.title">Appearance</span>${ke("settings.appearance.help")}`,bodyHtml:'<p class="ui-copy" data-i18n="settings.appearance.product">Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.</p>'}),wm=H({tag:"settings-appearance-card",render:gl,onMount(t,e){F(e)}});var bl=`
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
`;R("smart-preheat-card",bl);var fl=()=>ge({className:"smart-preheat-card",titleHtml:`<span data-i18n="settings.preheat.title">Preheat</span>${ke("settings.preheat.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.preheat.absorption">Preheat Absorption</span> <span class="absorb-badge">idle</span></span>
      <span class="ui-field">${Ee({on:!1,label:"Toggle preheat absorption",className:"absorb-toggle",attrs:'data-i18n-label="settings.preheat.toggle"'})}</span>
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
  `}),Em=H({tag:"smart-preheat-card",render:fl,onMount(t,e){let a=e.querySelector(".absorb-toggle"),o=e.querySelector(".absorb-badge"),s=e.querySelector(".absorb-band"),n=e.querySelector(".absorb-delta"),r=e.querySelector(".absorb-body"),l=ze(e),p=c=>{r&&r.classList.toggle("is-disabled",!c)};l.toggle(a,{read:()=>de(i.preheatAbsorbEnabled),onChange:p,commit:c=>{let m=c?"on":"off";x(i.preheatAbsorbEnabled,{state:m}),He("preheat_absorb_enabled",m)}}),l.num(s,{read:()=>L(i.preheatAbsorbBandC),commit:c=>{x(i.preheatAbsorbBandC,{value:c}),Pe("preheat_absorb_band_c",c)}}),l.num(n,{read:()=>L(i.preheatDetectDeltaC),commit:c=>{x(i.preheatDetectDeltaC,{value:c}),Pe("preheat_detect_delta_c",c)}});function g(){let c=String(M(i.preheatAbsorbing)||"").toLowerCase()==="active";o.textContent=c?d("common.active"):d("common.idle"),o.classList.toggle("active",c)}z(i.preheatAbsorbEnabled,l.refresh),z(i.preheatAbsorbing,g),z(i.preheatAbsorbBandC,l.refresh),z(i.preheatDetectDeltaC,l.refresh),F(e),l.refresh(),g()}});var vl=`
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
`;R("help-external-ingest",vl);function zo(){return window.location.origin||"http://lune-v6.local"}function So(){return sessionStorage.getItem("hv6_local_access_key")||"YOUR_LOCAL_ACCESS_KEY"}function hl(){let t=zo(),e=So();return`// Shelly script \u2014 POST BTHome temps to Lune V6 (no zone number).
// 1) On V6: zone \u2192 External, set sensor_id to the BLU MAC.
// 2) Paste this on Mini PM / BLU Gateway (Gen3+). Adjust SENSOR_ID if needed.

let CONFIG = {
  v6_url: "${t}/api/v1/room-temperatures",
  access_key: "${e}",
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
`}function xl(){let t=zo(),e=So();return`# Home Assistant \u2014 rest_command + automation (no zone in payload).
# On V6: External source + sensor_id matching the entity you map below.

rest_command:
  lune_v6_room_temp:
    url: "${t}/api/v1/room-temperatures"
    method: POST
    headers:
      Content-Type: application/json
      X-Lune-Local-Key: "${e}"
      X-Lune-CSRF: "${e}"
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
`}function yl(){let t=zo(),e=So();return`// HomeyScript \u2014 forward a Homey temperature capability to Lune V6.
// On V6: External + sensor_id (use Homey device id or a stable string you choose).

const V6_URL = "${t}/api/v1/room-temperatures";
const ACCESS_KEY = "${e}";
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
`}var wl={shelly:hl,ha:xl,homey:yl},$m=H({tag:"help-external-ingest",render:()=>`
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
  `,onMount(t,e){let a="shelly",o=e.querySelector(".hei-code"),s=e.querySelectorAll(".hei-tab");function n(){s.forEach(r=>r.setAttribute("aria-selected",r.dataset.tab===a?"true":"false")),o.textContent=wl[a]()}return s.forEach(r=>r.addEventListener("click",()=>{a=r.dataset.tab,n()})),e.querySelector(".hei-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(o.textContent||"")}catch(r){}}),n(),F(e),void 0}});var _r="(prefers-color-scheme: dark)",_t=null,Sr=!1;function kl(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(_r).matches?"dark":"light"}function zl(){let t=kl();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,e.classList.remove("theme-refined-ember","theme-deep-forest"),delete e.dataset.theme,!Sr&&typeof window!="undefined"&&typeof window.matchMedia=="function"){_t=window.matchMedia(_r);let a=()=>{let o=_t.matches?"dark":"light";e.dataset.colorScheme=o,e.style.colorScheme=o,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:o}))};typeof _t.addEventListener=="function"?_t.addEventListener("change",a):typeof _t.addListener=="function"&&_t.addListener(a),Sr=!0}return t}function Cr(){return zl()}function Lr(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}var Mr=`
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
`;function _o(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ar({title:t="",stack:e="",kicker:a="Hardware provisioning",save:o="",saveLabel:s="Save configuration",extra:n="",remove:r="",removeLabel:l="Remove"}={}){let p=o?`<button type="button" class="lds-btn-save btn-save" ${o}>${_o(s)}</button>`:"",g=r?`<button type="button" class="lds-btn-danger btn-danger" ${r}>${_o(l)}</button>`:"",c=n||g?`<div class="lds-form-extra form-extra">${n}${g}</div>`:"";return`<aside class="lds-provision provision" data-lds-provision>
  <div class="lds-form form" data-lds-form>
    <div class="lds-form-head form-head">
      <h3>${_o(a)}</h3>
      <h2>${t}</h2>
    </div>
    <div class="lds-form-stack form-stack">${e}</div>
    <div class="lds-form-actions form-actions">
      ${p}
      ${c}
    </div>
  </div>
</aside>`}var Er=`
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
`;function Tr({liveHtml:t="",provisionHtml:e="",attrs:a=""}={}){return`<div class="lds-int-split int-split" data-lds-int-split ${a}>${t}${e}</div>`}Cr();var Sl=`
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
.zone-overview{margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-overview-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.zone-overview-card{position:relative;min-width:0;min-height:64px;padding:10px 12px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-muted);display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:2px;text-align:left;overflow:hidden;font:inherit}.zone-overview-card.is-merged{border-color:color-mix(in srgb,var(--accent) 32%,var(--separator));background:color-mix(in srgb,var(--accent) 5%,var(--surface-raised))}.zone-overview-card.zo-pair-start{border-top-right-radius:4px;border-bottom-right-radius:4px}.zone-overview-card.zo-pair-cont{border-top-left-radius:4px;border-bottom-left-radius:4px;margin-left:-4px;padding-left:14px;border-left-color:color-mix(in srgb,var(--accent) 22%,var(--separator))}.zone-overview-card .zo-status{position:absolute;top:10px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--state-disabled)}.zone-overview-card.zs-heating .zo-status{background:var(--accent)}.zone-overview-card.zs-idle .zo-status,.zone-overview-card.zs-off .zo-status{background:var(--state-disabled)}.zone-overview-card.zs-fault .zo-status{background:var(--state-danger)}.zone-overview-card .zo-title{min-width:0;padding-right:14px;color:var(--text-strong);font-size:.78rem;font-weight:750;letter-spacing:.02em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-title .zone-title-name{font-size:.72rem;font-weight:560;letter-spacing:0;color:var(--text-faint)}.zone-overview-card .zo-temps{min-width:0;padding-right:4px;color:var(--text-muted);font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-merge{min-width:0;padding-right:4px;color:var(--text-faint);font-size:.68rem;font-weight:600;letter-spacing:.01em;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(min-width:901px){.zone-overview-card{cursor:pointer}.zone-overview-card:hover{color:var(--text-strong);background:color-mix(in srgb,var(--surface-raised) 70%,rgba(255,255,255,.06));border-color:color-mix(in srgb,var(--separator) 60%,rgba(199,211,232,.28))}.zone-overview-card[aria-current="true"]{color:var(--text-strong);border-color:transparent;background:var(--fill-forest)}.zone-overview-card[aria-current="true"] .zo-title,.zone-overview-card[aria-current="true"] .zo-temps{color:inherit}.zone-overview-card[aria-current="true"] .zo-title .zone-title-name{color:inherit;opacity:.72}.zone-overview-card[aria-current="true"].is-merged{border-color:transparent;background:var(--fill-forest)}.zone-overview-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}}.zone-detail-heading{margin:0 0 12px;padding:0;border:0}.zone-detail-heading .eyebrow,.zone-detail-heading p{display:none}.zone-detail-heading h2{margin:4px 0 0;color:var(--text-strong);font-size:1.2rem;font-weight:650;letter-spacing:-.02em}.zones-detail-pane{min-width:0}.int-split>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}
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
.provision .ui-input,.provision .ui-select,.provision .ble-input,.provision .ext-input,.provision .btn-scan{width:100%;max-width:none;height:var(--control-compact,32px)!important;min-height:var(--control-compact,32px)!important;text-align:left;margin:0;box-shadow:none}
.provision .zone-sensor-card .ble-row{margin-top:0}
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
.overview-details,.settings-layout,.diagnostics-layout{display:grid;gap:0;padding-top:8px;border-top:1px solid var(--separator)}.overview-attention,.diagnostics-attention{width:100%;border:0;border-left:3px solid var(--state-warn);border-radius:0;text-align:left;color:inherit;cursor:pointer}.overview-attention:hover,.diagnostics-attention:hover{background:rgba(var(--accent-rgb),.09)}.settings-panel{display:none;gap:22px}.settings-panel.is-active{display:grid}.settings-panel-block + .settings-panel-block{margin-top:8px;padding-top:18px;border-top:1px solid var(--separator)}.settings-panel-block h3{margin:0 0 4px;color:var(--text-strong);font-size:.95rem;font-weight:650}.settings-panel-block p{margin:0 0 12px;color:var(--text-muted);font-size:.82rem}.settings-disclosure>.disclosure-body,.diagnostics-disclosure>.disclosure-body{padding:0 0 18px}.settings-disclosure .ui-card,.settings-disclosure .connectivity-card,.diagnostics-disclosure .ui-card,.diagnostics-disclosure .settings-card,.diagnostics-disclosure .logs-view,.diagnostics-disclosure .diag-zone-motor,.diagnostics-disclosure .connectivity-card,.diagnostics-disclosure .diag-i2c{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.settings-disclosure .ui-card-title,.settings-disclosure .help-badge,.settings-disclosure .connectivity-card .card-title{display:none}.settings-disclosure .ui-row{display:grid;gap:6px;min-height:0;padding:0 0 12px;border:0;align-items:stretch}.settings-disclosure .ui-label{color:var(--text-muted);font-size:.72rem;font-weight:650}.settings-disclosure .ui-field{width:100%;display:block}.settings-disclosure .ui-input,.settings-disclosure .ui-select,.settings-disclosure .ui-btn,.settings-disclosure button,.diagnostics-disclosure button,.diagnostics-disclosure select,.diagnostics-disclosure input{min-height:var(--control-compact,32px);height:var(--control-compact,32px)}.settings-disclosure .ui-input,.settings-disclosure .ui-select{width:100%;max-width:28rem;text-align:left}.settings-disclosure .touch-approve{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--text-on-accent)!important}.settings-disclosure .touch-disconnect{background:transparent!important}.diagnostics-disclosure .card-title,.diagnostics-disclosure .ui-card-title{color:var(--text-faint)!important;font-size:.68rem!important;font-weight:750!important;letter-spacing:.1em!important;text-transform:uppercase!important;border:0!important;padding:0 0 10px!important;margin:0 0 8px!important}.diagnostics-disclosure .logs-stream{height:min(420px,50vh);background:transparent;border:1px solid var(--separator);box-shadow:none}.diagnostics-disclosure.danger-zone{margin-top:12px;border-top:1px solid color-mix(in srgb,var(--danger) 35%,var(--separator))}.diagnostics-disclosure.danger-zone>summary{color:var(--danger-text)}
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
`;R("hv6-app-root",Sl);R("lds-manifold-row",Kn);R("lds-form",Mr);R("lds-int-split",Er);var _l=Tr({liveHtml:'<div class="zone-live"><p class="zone-kicker">Comfort control</p><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-slot"></div></div>',provisionHtml:Ar({title:'<span class="provision-zone-title">Zone</span>',stack:'<section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section><div class="zone-actuator-slot"></div>'})}),Cl=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand lune-lockup" aria-label="Lune V6"><span data-live-mark="sidebar"></span><span class="product">V6</span></div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><article class="manifold" data-overview-manifold><div class="manifold-mark" data-live-mark="overview"></div><div class="loops" data-overview-loops></div><div class="manifold-meta" data-overview-meta></div></article><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Flow history</h3><p>24-hour flow, return and demand.</p></div></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><article class="manifold zone-overview"><div class="manifold-mark" data-live-mark="zones"></div><div class="zone-overview-strip loops" role="group" aria-label="Select zone"></div><div class="manifold-meta" data-zone-meta></div></article>${_l}</section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout">
<div class="settings-panel settings-disclosure touch-settings is-active" data-panel="touch"><div class="disclosure-body touch-slot"></div></div>
<div class="settings-panel settings-disclosure" data-panel="hydraulics"><div class="settings-panel-block"><h3>Manifold and probes</h3><p>Valve type and temperature inputs</p><div class="manifold-slot"></div></div><div class="settings-panel-block"><h3>Return temperature</h3><p>Optional zone return probes</p><div class="return-temp-slot"></div></div><div class="settings-panel-block"><h3>Hydraulic safety</h3><p>Minimum active-loop opening</p><div class="minimum-flow-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="comfort"><div class="settings-panel-block"><h3>Room clocks</h3><p>Shelly BLU display time</p><div class="ble-clock-slot"></div></div><div class="settings-panel-block"><h3>Preheat absorption</h3><p>Local handling of external preload</p><div class="preheat-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="motors"><div class="settings-panel-block"><h3>Motor configuration</h3><p>Drivers, profile and learning limits</p><div class="motor-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="device"><div class="settings-panel-block"><h3>Connection</h3><p>Network and firmware identity</p><div class="connectivity-slot"></div></div><div class="settings-panel-block"><h3>Firmware</h3><p>Version, updates and manual upload</p><div class="firmware-slot"></div></div><div class="settings-panel-block"><h3>Backup and restore</h3><p>Save or reapply local configuration</p><div class="backup-slot"></div></div><div class="settings-panel-block"><h3>Appearance</h3><p>Product colour</p><div class="appearance-slot"></div></div></div>
</div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-external-slot"></div><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;H({tag:"app-root",render:Cl,onMount(t,e){e.querySelector(".hdr").appendChild(re("hv6-header")),e.querySelector(".side-nav-slot").appendChild(re("hv6-sidebar")),e.querySelector(".hydraulic-history-slot").appendChild(re("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(re("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(re("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(re("zone-detail",{zone:P("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(re("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(re("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(re("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(re("zone-room-card")),e.querySelector(".touch-slot").appendChild(re("settings-touch-card")),e.querySelector(".manifold-slot").appendChild(re("settings-manifold-card")),e.querySelector(".return-temp-slot").appendChild(re("settings-return-temp-card")),e.querySelector(".minimum-flow-slot").appendChild(re("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(re("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(re("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(re("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(re("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(re("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(re("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(re("settings-control-card")),e.querySelector(".manual-control-col").appendChild(re("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(re("diag-zone-motor-card",{zone:P("selectedZone")||1}));let a=e.querySelector(".motor-lab-slot"),o=e.querySelector('.sec[data-section="motorlab"]');function s(){let E=Lr(M(i.firmware)||P("firmwareVersion")),D=e.querySelector('.v6-side-link[data-section="motorlab"]');D&&(D.hidden=!E),o&&(o.hidden=!E),E&&a&&!a.firstChild&&a.appendChild(re("diag-motor-lab")),!E&&P("section")==="motorlab"&&Re("diagnostics")}z(i.firmware,s),j("firmwareVersion",s),j("section",s),s(),e.querySelector(".logs-main-col").appendChild(re("logs-view")),e.querySelector(".system-health-slot").appendChild(re("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(re("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(re("diag-i2c"));let n=e.querySelector(".help-external-slot");n&&n.appendChild(re("help-external-ingest"));let r=e.querySelectorAll(".sec"),l=e.querySelector(".shell"),p=e.querySelector(".zone-detail-view"),g=e.querySelector(".selected-zone-title"),c=e.querySelector(".provision-zone-title"),m=e.querySelector(".zone-overview-strip"),u=e.querySelector("[data-overview-loops]"),f=e.querySelector("[data-overview-meta]"),v=e.querySelector("[data-zone-meta]"),k=e.querySelector(".mobile-zone-dock"),h=e.querySelector(".mobile-zone-dock .zone-chipstrip");function y(){e.querySelectorAll("[data-live-mark]").forEach(D=>{let B=D.getAttribute("data-live-mark");if(B==="sidebar"){if(D.dataset.staticLockup==="1")return;D.innerHTML=Wn(),D.dataset.staticLockup="1";return}D.dataset.staticMark!=="1"&&(Qn(D,{states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:B,landscape:!0,sku:"V6"}),D.dataset.staticMark="1")});let E=er();f&&(f.innerHTML=E),v&&(v.innerHTML=E)}function S(E){let D=de(b.enabled(E)),B=String(M(b.state(E))||"").toUpperCase()||"OFF",ne=String(M(b.motorLastFault(E))||"").toUpperCase();return D?D&&(B==="FAULT"||ne&&ne!=="NONE"&&ne!=="OK")?"FAULT":B:"OFF"}function w(E){return E==="HEATING"?d("state.heating"):E==="IDLE"?d("state.idle"):E==="FAULT"?d("common.fault"):E==="MANUAL"?d("state.manual"):E==="OVERHEATED"?d("state.overheated"):E==="CALIBRATING"?d("state.calibrating"):d("state.off")}function A(E){return E==="HEATING"||E==="CALLING"?"zs-heating":E==="FAULT"?"zs-fault":E==="IDLE"?"zs-idle":"zs-off"}function C(E){let D=String(E||"").trim();if(!D||/^none$/i.test(D)||D==="0"||D==="-1")return 0;let B=D.match(/(\d+)/),ne=B?Number(B[1]):0;return ne>=1&&ne<=6?ne:0}function N(){var fe;let E=[0,0,0,0,0,0,0];for(let Z=1;Z<=6;Z++)E[Z]=C(M(b.syncTo(Z)));let D=[0,0,0,0,0,0,0];for(let Z=1;Z<=6;Z++){let me=Z;for(let xe=0;xe<6;xe++){let Se=E[me];if(!Se||Se<1||Se>6)break;if(Se===Z){me=Z;break}me=Se}D[Z]=me}let B={};for(let Z=1;Z<=6;Z++)(B[fe=D[Z]]||(B[fe]=[])).push(Z);let ne=[[],[],[],[],[],[],[]];for(let Z=1;Z<=6;Z++){let me=B[D[Z]]||[Z],xe=me.length>1&&me.some(Se=>E[Se]>0);ne[Z]=xe?me.filter(Se=>Se!==Z):[]}return{roots:D,partners:ne}}function q(){return window.matchMedia("(min-width: 901px)").matches}function W(){let E=N(),D=P("selectedZone")||1,B=q();m.setAttribute("role",B?"group":"list"),m.setAttribute("aria-label",B?"Select zone":"Zone status overview"),m.innerHTML=Array.from({length:6},(ne,fe)=>{var Lo;let Z=fe+1,me=Z===D,xe=we(Z),Se=Ke(Z),_=ot(Z),V=Ie(Z),X=_==="unused"?"\u2014":kt(L(b.temp(Z))),K=_==="unused"?"\u2014":kt((Lo=L(b.effectiveSetpoint(Z)))!=null?Lo:L(b.setpoint(Z))),I=_==="unused"?"\u2014":Te(Z)||"\u2014",se=S(Z),Y=w(se),pe=A(se),ye=E.partners[Z],ve=ye.length>0,$e=ve?d("overview.zone.mergedWith",{zones:ye.map(Ie).join(", ")}):"",Wt=ve&&ye.includes(Z+1)&&E.roots[Z]===E.roots[Z+1],Fr=ve&&ye.includes(Z-1)&&E.roots[Z]===E.roots[Z-1],Kt=[ve?"is-merged":"",Wt?"zo-pair-start":"",Fr?"zo-pair-cont":"",_==="calling"?"is-calling":"",_==="unused"?"is-unused":""].filter(Boolean).join(" "),Gt=`${xe}, ${X} / ${K}, ${Y}${$e?", "+$e:""}`.replace(/"/g,"&quot;"),Nr=ve?`<span class="zo-merge">${$e}</span>`:"",Co=`<span class="zo-status" aria-hidden="true"></span><span class="loop-id">${V}</span><span class="loop-name">${I.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span><span class="zo-title zone-label-compact">${Se}</span><span class="zo-temps loop-temp">${X}</span>${Nr}`;return B?`<button type="button" class="zone-overview-card ${pe}${Kt?" "+Kt:""}" data-zone-select="${Z}" aria-current="${me?"true":"false"}" aria-label="${Gt}" title="${Gt}" tabindex="${me?"0":"-1"}">${Co}</button>`:`<div class="zone-overview-card ${pe}${Kt?" "+Kt:""}" role="listitem" aria-label="${Gt}" title="${Gt}">${Co}</div>`}).join("")}function O(){let E=P("selectedZone")||1;h.innerHTML=Array.from({length:6},(D,B)=>{let ne=B+1,fe=ne===E,Z=we(ne),me=Ke(ne),xe=Z.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${fe}" aria-label="${xe}" title="${xe}" tabindex="${fe?"0":"-1"}" data-zone-select="${ne}">${me}</button>`}).join("")}function ae(){u&&(u.innerHTML=Array.from({length:6},(E,D)=>{let B=D+1,ne=we(B),fe=ot(B),Z=Ie(B),me=L(b.valve(B)),xe=fe==="unused"?"\u2014":kt(L(b.temp(B))),Se=fe==="unused"?"\u2014":ga(me),_=Gn(me,fe),V=fe==="unused"?"\u2014":Te(B)||"\u2014",X=S(B),K=w(X),I=`${ne}, ${xe}, valve ${Se}, ${K}`.replace(/"/g,"&quot;");return Xn({id:Z,name:V,temp:xe,level:_,kind:fe,attrs:`data-open-zone="${B}" aria-label="${I}" title="${I}"`})}).join(""))}function le(){W(),O(),ae(),y()}function $(){let E=P("section")==="zones";k.hidden=!E,k.setAttribute("aria-hidden",E?"false":"true"),l.classList.toggle("has-zone-dock",E)}function T(E){it(E)}function oe(){let E=P("section")||"overview";r.forEach(D=>D.classList.toggle("active",D.dataset.section===E)),De(),Ae()}function Ae(){let E=P("settingsPanel")||"touch";e.querySelectorAll(".settings-panel[data-panel]").forEach(D=>{D.classList.toggle("is-active",D.dataset.panel===E)})}function J(){let E=[],D=0,B=0;for(let K=1;K<=6;K++){let I=String(M(b.enabled(K))).toLowerCase()==="on",se=String(M(b.state(K))).toLowerCase(),Y=String(M(b.motorLastFault(K))).toLowerCase();I&&E.push(K),I&&["heating","calling"].includes(se)&&D++,(se==="fault"||Y!==""&&Y!=="none"&&Y!=="ok")&&B++}let ne=L(i.flow),fe=L(i.ret),Z=String(M(i.authorityState)||"").replace(/_/g," "),me=B===0&&P("live"),xe=ne!=null&&fe!=null?Number(ne)-Number(fe):null,Se=xe==null?"\u2014":`${xe.toFixed(1)}\xB0C`,_=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${me?"status-ok":P("live")?"status-warn":"status-danger"}">${me?"Operating normally":P("live")?"Needs attention":"Device offline"}</h2><p>${B?B+" zone fault"+(B===1?"":"s")+" require attention.":P("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${D} zones</strong><small>${E.length} enabled \xB7 ${D}/${E.length||0} calling</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${Qe(ne)}</strong><small>Return ${Qe(fe)}</small></div><div class="status-fact"><span class="eyebrow">\u0394T</span><strong>${Se}</strong><small>Flow \u2212 return</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${Z||"not connected"}</strong><small>${L(i.authorityLeaseRemainingS)?Math.round(L(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,V=de(i.authorityConfigured),X=String(M(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=_,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${P("live")?"status-ok":"status-danger"}">${P("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${P("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${V?"Approved":"Not approved"}</strong><small>${V?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${X}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${B?"status-danger":me?"status-ok":"status-warn"}">${B?B+" issue"+(B===1?"":"s"):me?"Healthy":"Awaiting data"}</h2><p>${B?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${B}</strong><small>${B?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${X}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${Z||"not connected"}</strong><small>${V?"approved":"local control"}</small></div>`,[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(K=>{K.hidden=!B,K.innerHTML=B?`<strong>Review ${B} zone fault${B===1?"":"s"}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:""})}function De(){let E=P("selectedZone")||1,D=P("section")==="zones",B=Te(E),ne=B?`${Ie(E)} \xB7 ${B}`:Ie(E);g.textContent=ne,c&&(c.textContent=ne),le(),$(),p.hidden=!D}function ue(E){let D=E.target.closest("[data-zone-select]");D&&T(Number(D.dataset.zoneSelect))}function Ze(E){q()&&ue(E)}function Zt(E){if(!q()||!["ArrowLeft","ArrowRight","Home","End"].includes(E.key))return;E.preventDefault();let D=P("selectedZone")||1,B=E.key==="Home"?1:E.key==="End"?6:E.key==="ArrowLeft"?D===1?6:D-1:D===6?1:D+1;T(B),requestAnimationFrame(()=>{var ne;return(ne=m.querySelector(`[data-zone-select="${B}"]`))==null?void 0:ne.focus()})}function We(E){if(!["ArrowLeft","ArrowRight","Home","End"].includes(E.key))return;E.preventDefault();let D=P("selectedZone")||1,B=E.key==="Home"?1:E.key==="End"?6:E.key==="ArrowLeft"?D===1?6:D-1:D===6?1:D+1;T(B),requestAnimationFrame(()=>{var ne;return(ne=h.querySelector(`[data-zone-select="${B}"]`))==null?void 0:ne.focus()})}function he(E){let D=E.target.closest("[data-open-zone]");D&&(T(Number(D.dataset.openZone)),Re("zones"))}m.addEventListener("click",Ze),m.addEventListener("keydown",Zt),u&&u.addEventListener("click",he),window.matchMedia("(min-width: 901px)").addEventListener("change",W),h.addEventListener("click",ue),h.addEventListener("keydown",We),e.querySelectorAll("[data-open-zones]").forEach(E=>E.addEventListener("click",()=>Re("zones"))),e.querySelectorAll("[data-help-section]").forEach(E=>E.addEventListener("click",D=>{D.preventDefault(),Re(E.dataset.helpSection)})),j("section",oe),j("settingsPanel",Ae),j("selectedZone",De),j("live",J),j("zoneNames",()=>{De(),J()});for(let E=1;E<=6;E++)[b.temp(E),b.setpoint(E),b.effectiveSetpoint(E),b.valve(E),b.state(E),b.enabled(E),b.motorLastFault(E),b.syncTo(E)].forEach(D=>z(D,()=>{J(),le()}));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(E=>z(E,J)),F(e),oe(),De(),J();let Ge=new URLSearchParams(location.search),rt=Ge.get("section"),Ct=Number(Ge.get("zone"));rt&&Re(rt),Ct>=1&&Ct<=6&&it(Ct)}});function Ll(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(re("app-root")),wn()}Ll();})();
