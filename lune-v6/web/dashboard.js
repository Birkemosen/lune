(()=>{var la={},jt={};function O(t){return la[t.tag]=t,t}function oe(t,e){let o=la[t];if(!o)throw new Error("Component not found: "+t);let a=e||{};if(o.state){let s=o.state(e||{});for(let c in s)a[c]=s[c]}if(o.methods)for(let s in o.methods)a[s]=o.methods[s];let r=document.createElement("div");r.innerHTML=o.render(a);let n=r.firstElementChild;return o.onMount&&o.onMount(a,n),n}function k(t,e){(jt[t]||(jt[t]=[])).push(e)}function we(t){let e=jt[t];if(e)for(let o=0;o<e.length;o++)e[o](t)}var b={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",sensorId:t=>"text-zone_"+t+"_sensor_id",sensorName:t=>"text-zone_"+t+"_sensor_name",externalAge:t=>"sensor-zone_"+t+"_external_temp_age_ms",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var ye=6,or=28,pt=Object.create(null),ar=sr(),Q={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:rr(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:ar,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},nr=300;function rr(){let t=Object.create(null);for(let e=1;e<=ye;e++)t[e]=[];return t}function sr(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<ye;)t.push("");return t.slice(0,ye)}function ir(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(Q.zoneNames))}catch(t){}}function Se(t){return"$dashboard:"+t}function Qe(t){return Math.max(1,Math.min(ye,Number(t)||1))}function ca(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let o=t.match(/-?\d+(?:[\.,]\d+)?/);if(o){let a=Number(String(o[0]).replace(",","."));return Number.isNaN(a)?null:a}}return null}function _(t){let e=pt[t];return e?e.v!=null?e.v:e.value!=null?e.value:ca(e.s!=null?e.s:e.state):null}function S(t){let e=pt[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function lr(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function de(t){return lr(S(t))}function Vt(){return de(i.authorityProposalPending)}function Co(){let t=0;for(let e=1;e<=ye;e++){let o=String(S(b.state(e))||"").toLowerCase(),a=String(S(b.motorLastFault(e))||"").toLowerCase();(o==="fault"||a&&a!=="none"&&a!=="ok")&&(t+=1)}return t}function Lo(){if(Vt())return{kind:"touch",section:"settings",focus:"touch"};let t=Co();return t>0?{kind:"faults",section:"zones",count:t}:null}function x(t,e){let o=pt[t];o||(o=pt[t]={v:null,s:null}),"v"in e&&(o.v=e.v,o.value=e.v),"value"in e&&(o.v=e.value,o.value=e.value),"s"in e&&(o.s=e.s,o.state=e.s),"state"in e&&(o.s=e.state,o.state=e.state);for(let a in e)a==="v"||a==="value"||a==="s"||a==="state"||(o[a]=e[a]);if(we(t),t==="text_sensor-firmware_version"&&Ne("firmwareVersion",S(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let a=parseInt(t.slice(10,-5),10);if(a>=1&&a<=ye){let r=S(t)||"";Q.zoneNames[a-1]!==r&&(Q.zoneNames[a-1]=r,ir(),we(Se("zoneNames")))}}}function U(t,e){k(Se(t),e)}function R(t){return Q[t]}function Ne(t,e){Q[t]=e,we(Se(t))}function Oe(t){let e=t==="logs"?"diagnostics":t;Q.section!==e&&(Q.section=e,we(Se("section")))}function Ut(t){let e=Qe(t);Q.selectedZone!==e&&(Q.selectedZone=e,we(Se("selectedZone")))}function je(t){let e=!!t;Q.live!==e&&(Q.live=e,we(Se("live")))}function Ao(){Q.pendingWrites+=1,we(Se("pendingWrites"))}function Zt(){Q.pendingWrites=Math.max(0,Q.pendingWrites-1),Q.lastWriteAt=Date.now(),we(Se("pendingWrites"))}function da(){return Q.pendingWrites>0?!0:Date.now()-Q.lastWriteAt<2e3}function zt(t){return Q.zoneNames[Qe(t)-1]||""}function ut(t){return String(zt(t)||"").trim()}function Mo(t){return"Z"+Qe(t)}function _o(t){return"Zone "+Qe(t)}function _e(t){let e=Qe(t),o=ut(e);return o?_o(e)+" - "+o:_o(e)}function cr(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function dr(t){let e=Qe(t);return'<span class="zone-id-short">'+Mo(e)+'</span><span class="zone-id-long">'+_o(e)+"</span>"}function Ie(t){let e=Qe(t),o=ut(e),a=dr(e);return o?'<span class="zone-title-id">'+a+'</span><span class="zone-title-name"> - '+cr(o)+"</span>":'<span class="zone-title-id">'+a+"</span>"}function mt(t){Q.i2cResult=t||"No scan has been run yet.",we(Se("i2cResult"))}function B(t,e){let o={time:pr(),msg:String(t||"")};for(Q.activityLog.push(o);Q.activityLog.length>60;)Q.activityLog.shift();if(e>=1&&e<=ye){let a=Q.zoneLog[e];for(a.push(o);a.length>8;)a.shift();we(Se("zoneLog:"+e))}we(Se("activityLog"))}function So(t,e){let o=Q[t];if(!Array.isArray(o))return;let a=ca(e);if(a!=null){for(o.push(a);o.length>or;)o.shift();we(Se(t))}}function St(t){let e=Date.now();if(!t&&e-Q.lastHistoryAt<3200)return;Q.lastHistoryAt=e;let o=0,a=0;for(let r=1;r<=ye;r++){let n=_("sensor-zone_"+r+"_valve_pct");n!=null&&(o+=n,a+=1)}So("historyFlow",_("sensor-manifold_flow_temperature")),So("historyReturn",_("sensor-manifold_return_temperature")),So("historyDemand",a?o/a:0)}function pr(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function Wt(t){Q.zoneStateHistory=t||null,we(Se("zoneStateHistory"))}function pa(){return Q.deviceLogSeq}function Kt(t,e){if(Array.isArray(t)&&t.length){for(let o of t)Q.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>Q.deviceLogSeq&&(Q.deviceLogSeq=o[0]);for(;Q.deviceLog.length>nr;)Q.deviceLog.shift();we(Se("deviceLog"))}typeof e=="number"&&e>Q.deviceLogSeq&&(Q.deviceLogSeq=e-1)}function Gt(){return Q.deviceLog}function ua(){Q.deviceLog=[],we(Se("deviceLog"))}var be=6,ur=8,ma=null,et=0,Xt=1,ga=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],ha=18*3600+720,va=Date.now(),_t=4200,Z={temp:new Float32Array(be),setpoint:new Float32Array(be),valve:new Float32Array(be),enabled:new Uint8Array(be),driversEnabled:1,fault:0,manualMode:0},Le={busy:!1,direction:"open",zone:1,startedAt:0};function mr(){Z.manualMode=0,va=Date.now(),Ne("manualMode",!1);for(let n=0;n<be;n++){Z.temp[n]=20.5+n*.4,Z.setpoint[n]=21+n%3*.5,Z.valve[n]=12+n*8,Z.enabled[n]=n===4?0:1;let s=n+1;x(b.temp(s),{value:Z.temp[n]}),x(b.setpoint(s),{value:Z.setpoint[n]}),x(b.baseSetpoint(s),{value:Z.setpoint[n]}),x(b.effectiveSetpoint(s),{value:Z.setpoint[n]}),x(b.coordinatorOffset(s),{value:0}),x(b.coordinatorRemaining(s),{value:0}),x(b.valve(s),{value:Z.valve[n]}),x(b.state(s),{state:Z.valve[n]>5?"heating":"idle"}),x(b.enabled(s),{value:!!Z.enabled[n],state:Z.enabled[n]?"on":"off"}),x(b.probe(s),{state:"Probe "+s}),x(b.tempSource(s),{state:s%2?"Local Probe":"BLE"}),x(b.syncTo(s),{state:"None"}),x(b.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),x(b.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][n]||""}),x(b.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=ur;n++){let s=n<=be?n:be,c=Z.temp[s-1]+(n>be?1:.1*n);x(b.probeTemp(n),{value:c})}x(i.flow,{value:34.1}),x(i.ret,{value:30.4}),x(i.uptime,{value:ha}),x(i.wifi,{value:-57}),x(i.drivers,{value:!0,state:"on"}),x(i.fault,{value:!1,state:"off"}),x(i.ip,{state:"192.168.1.86"}),x(i.ssid,{state:"MockLab"}),x(i.mac,{state:"D8:3B:DA:12:34:56"}),x(i.firmware,{state:"v1.0.0-1"}),x(i.resetReason,{state:"Software reset (esp_restart)"}),x(i.manifoldFlowProbe,{state:"Probe 7"}),x(i.manifoldReturnProbe,{state:"Probe 8"}),x(i.manifoldType,{state:"NC (Normally Closed)"}),x(i.motorProfileDefault,{state:"HmIP VdMot"}),x(i.closeThresholdMultiplier,{value:1.7}),x(i.closeSlopeThreshold,{value:1}),x(i.closeSlopeCurrentFactor,{value:1.4}),x(i.openThresholdMultiplier,{value:1.7}),x(i.openSlopeThreshold,{value:.8}),x(i.openSlopeCurrentFactor,{value:1.3}),x(i.openRippleLimitFactor,{value:1}),x(i.genericRuntimeLimitSeconds,{value:45}),x(i.hmipRuntimeLimitSeconds,{value:40}),x(i.relearnAfterMovements,{value:2e3}),x(i.relearnAfterHours,{value:168}),x(i.learnedFactorMinSamples,{value:3}),x(i.learnedFactorMaxDeviationPct,{value:12}),x(i.simplePreheatEnabled,{state:"on"}),x(i.minZoneFlowPct,{value:15}),x(i.minimumFlowAlways,{state:"off"}),x(i.bleClockSyncEnabled,{state:"on"}),x(i.bleClockSyncIntervalMin,{value:60}),x(i.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),x(i.bleClockSyncLastError,{state:""}),x(i.bleClockSyncAdvertising,{state:"off"}),x(i.authorityInstallationId,{state:"house-main"}),x(i.authorityCoordinatorId,{state:"lune-touch"}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),x(i.authorityState,{state:"touch_normal"}),x(i.authorityReason,{state:"lease_renewed"}),x(i.authorityLeaseRemainingS,{value:72}),x(i.cpuLoadCore0,{value:18.5}),x(i.cpuLoadCore1,{value:7.2}),x(i.freeInternalKb,{value:142}),x(i.freeDmaKb,{value:118}),x(i.largestInternalKb,{value:64}),x(i.minInternalKb,{value:96}),x(i.freePsramKb,{value:7800}),x(i.largestPsramKb,{value:4096}),x(i.bleHubEnabled,{state:"on"}),x(i.bleScanning,{state:"on"}),x(i.bleDemanded,{state:"on"}),x(i.bleAdsPerSec,{value:2.4}),x(i.bleLastAdvAgeMs,{value:850}),St(!0);let t=300,e=Number(Date.now()/1e3)|0,o=288,a=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],r=[];for(let n=0;n<o;n++){let s=(o-1-n)*t,c=e-s,u=Math.floor(n/12)%24,m=a.map(v=>v[u%v.length]),l=s/3600,g=l>2.5&&l<3.5||l>8.5&&l<9.5?1:0,p=m.filter(v=>v===5).length,f=Math.round(Math.min(100,p*15+Math.abs(Math.sin(n/8))*6)),h=Number((30+p*1.4+Math.sin(n/11)*1.5).toFixed(1)),z=Number((h-(1.4+p*.35)).toFixed(1));r.push([c,...m,g,h,z,f])}Wt({interval_s:t,uptime_s:e,count:o,entries:r}),xa(6)}function xa(t){let e=[];for(let o=0;o<t;o++){let a=ga[Xt%ga.length];e.push([Xt,a[0],a[1],a[2]]),Xt++}Kt(e,Xt)}function gr(){et+=1,x(i.uptime,{value:ha+Math.floor((Date.now()-va)/1e3)}),x(i.wifi,{value:-55-Math.round((1+Math.sin(et/4))*6)});let t=0,e=0,o=0;for(let s=0;s<be;s++){let c=s+1,u=!!Z.enabled[s],m=Z.temp[s],l=Z.setpoint[s],g=u&&Z.driversEnabled&&!Z.manualMode&&m<l-.25;Z.manualMode?Z.valve[s]=Math.max(0,Z.valve[s]):!u||!Z.driversEnabled?Z.valve[s]=Math.max(0,Z.valve[s]-6):g?Z.valve[s]=Math.min(100,Z.valve[s]+7+c%3):Z.valve[s]=Math.max(0,Z.valve[s]-5);let p=g?.05+Z.valve[s]/2200:-.03+Z.valve[s]/3200;Z.temp[s]=m+p+Math.sin((et+c)/5)*.04,u&&Z.valve[s]>0&&(t+=Z.valve[s],e+=1,o=Math.max(o,Z.valve[s])),x(b.temp(c),{value:Z.temp[s]}),x(b.valve(c),{value:Math.round(Z.valve[s])});let f=Math.max(0,(Z.setpoint[s]-Z.temp[s]-.15)*.22);x(b.preheatAdvance(c),{value:Number(f.toFixed(2))}),x(b.state(c),{state:u?g?"heating":"idle":"off"}),x(b.enabled(c),{value:u,state:u?"on":"off"}),x(b.probeTemp(c),{value:Z.temp[s]+Math.sin((et+c)/6)*.1})}let a=29.5+o*.075+e*.18+Math.sin(et/6)*.25,r=a-(e?2.1+t/Math.max(1,e*50):1.1);x(i.flow,{value:Number(a.toFixed(1))}),x(i.ret,{value:Number(r.toFixed(1))}),x(b.probeTemp(7),{value:Number((r-.4).toFixed(1))}),x(b.probeTemp(8),{value:Number((a+.2).toFixed(1))}),St(!0);let n=R("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0),et%3===0&&xa(1)}function ba(t,e){Le.busy=!0,Le.direction=e,Le.zone=t,Le.startedAt=Date.now()}function br(){return Le.startedAt?Date.now()-Le.startedAt:0}function fr(t,e,o){if(!o)return .4;let a=e==="open";return t<180?a?22:28:t<500?a?15.2:19.4:t<2200?a?14.6:19.1:!a&&t<2800?24.2:!a&&t<3400?20.4:t<_t-300?a?18.5:26.8:a?25.4:41.2}function hr(t,e,o){return o?e==="open"?t>_t-300?3:0:t<2200?0:t<3e3?1:t<_t-300?2:3:0}function fa(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function ya(){let t=br(),e=Le.busy&&t<_t;Le.busy&&!e&&(Le.busy=!1);let o=fr(t,Le.direction,e||t<_t+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:_(i.freeInternalKb)||142,dma_kb:_(i.freeDmaKb)||118,largest_internal_kb:_(i.largestInternalKb)||64,min_internal_kb:_(i.minInternalKb)||96,psram_kb:_(i.freePsramKb)||7800,largest_psram_kb:_(i.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:S(i.bleHubEnabled)==="on",scanning:S(i.bleScanning)==="on",demanded:S(i.bleDemanded)==="on",ads_per_sec:_(i.bleAdsPerSec)||0,last_adv_age_ms:_(i.bleLastAdvAgeMs)||0},drivers_enabled:!!Z.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(o.toFixed(1)),stroke_phase:hr(t,Le.direction,e),armed:!!Z.driversEnabled,tacho_period_us:fa(t,e),tacho_cadence_us:fa(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:et}}}}function vr(t,e){let o=e==="open";if(t<180)return o?22-t*.03:28-t*.04;if(t<650)return o?14.8:19.2;if(t<2200)return(o?14.5:19)+Math.sin(t/90)*.35;if(!o&&t<2600)return 19+(t-2200)*.012;if(!o&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return o?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let a=o?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(o?26.4:44.5,a)}function wa(t){let e=t||Le.direction||"open",o=e==="open",a=o?3900:4200,r=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],n=0;for(let s=0;s<=a;s+=10){let c=vr(s,e);s>180&&s<a-80&&(n+=s%20===0?1:0);let u=0;o?u=s>a-400?3:0:s>=2200&&s<3e3?u=1:s>=3e3&&s<3600?u=2:s>=3600&&(u=3);let m=s<200?3200:s<a-400?1800+Math.round(Math.sin(s/140)*80):4200;r.push([s,n,c.toFixed(1),1200,1,o?1:0,1,u,m,40,0,0,0,0,0,1,0].join(","))}return r.join(`
`)+`
`}function ka(){ma||(mr(),je(!0),ma=setInterval(gr,1200))}function Yt(t){let e=t.key||"",o=t.value,a=t.zone||0;if(e==="zone_setpoint"&&a>=1&&a<=be){let n=Number(o);Number.isNaN(n)||(Z.setpoint[a-1]=n,x(b.setpoint(a),{value:n}),x(b.baseSetpoint(a),{value:n}),x(b.effectiveSetpoint(a),{value:n}),B("Zone "+a+" setpoint set to "+n.toFixed(1)+"\xB0C",a));return}if(e==="zone_enabled"&&a>=1&&a<=be){let n=o>.5;Z.enabled[a-1]=n?1:0,x(b.enabled(a),{value:n,state:n?"on":"off"}),B("Zone "+a+(n?" enabled":" disabled"),a);return}if(e==="drivers_enabled"){let n=o>.5;Z.driversEnabled=n?1:0,n||(Le.busy=!1),x(i.drivers,{value:n,state:n?"on":"off"}),B(n?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let n=o>.5;Z.manualMode=n?1:0,Ne("manualMode",n);return}if(e==="motor_target"&&a>=1&&a<=be){let n=Number(o||0);x(b.motorTarget(a),{value:Math.max(0,Math.min(100,Math.round(n)))}),B("Motor "+a+" target set to "+n+"%",a);return}if(e==="command"){let n=String(o);if(n==="i2c_scan"){mt(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),B("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){B("Command executed: "+n);return}if(n==="firmware_check"||n==="firmware_prepare"){B("Command executed: "+n);return}if(n==="firmware_install"){B("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(n==="open_motor_timed"&&a>=1&&a<=be){ba(a,"open"),B("Motor "+a+" open timed",a);return}if(n==="close_motor_timed"&&a>=1&&a<=be){ba(a,"close"),B("Motor "+a+" close timed",a);return}if(n==="stop_motor"&&a>=1&&a<=be){Le.busy=!1,B("Motor "+a+" stopped",a);return}if(n==="motor_reset_fault"&&a>=1&&a<=be){B("Motor "+a+" fault reset",a);return}if(n==="motor_reset_learned_factors"&&a>=1&&a<=be){B("Motor "+a+" learned factors reset",a);return}if(n==="motor_reset_and_relearn"&&a>=1&&a<=be){B("Motor "+a+" reset and relearn started",a);return}if(n==="ble_clock_sync_now"){x(i.bleClockSyncAdvertising,{state:"on"}),x(i.bleClockSyncLastError,{state:""}),setTimeout(()=>{x(i.bleClockSyncAdvertising,{state:"off"}),x(i.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),B("Room clock broadcast started");return}if(n==="dump_task_stats"){B("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&a>=1){x(b.probe(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="zone_temp_source"&&a>=1){x(b.tempSource(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="zone_sync_to"&&a>=1){x(b.syncTo(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="manifold_type"){x(i.manifoldType,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="manifold_flow_probe"){x(i.manifoldFlowProbe,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="manifold_return_probe"){x(i.manifoldReturnProbe,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="motor_profile_default"){x(i.motorProfileDefault,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="simple_preheat_enabled"){x(i.simplePreheatEnabled,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="minimum_flow_always"){x(i.minimumFlowAlways,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="ble_clock_sync_enabled"){x(i.bleClockSyncEnabled,{state:String(o)}),B("Setting updated: "+e+" = "+o);return}if(e==="zone_name"&&a>=1){x(b.name(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="zone_ble_mac"&&a>=1){x(b.ble(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="zone_sensor_id"&&a>=1){x(b.sensorId(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="zone_sensor_name"&&a>=1){x(b.sensorName(a),{state:String(o)}),B("Setting updated: "+e+" = "+o,a);return}if(e==="authority_approve_proposal"){x(i.authorityInstallationId,{state:S(i.authorityProposalInstallationId)||"lune-mock"}),x(i.authorityCoordinatorId,{state:S(i.authorityProposalCoordinatorId)||"touch-mock"}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),B("Discovered Lune Touch approved");return}if(e==="authority_revoke"){x(i.authorityInstallationId,{state:""}),x(i.authorityCoordinatorId,{state:""}),x(i.authorityConfigured,{state:"off",value:!1}),x(i.authorityState,{state:"unconfigured"}),B("Lune Touch disconnected");return}let r={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};if(r[e]){let n=Number(o);Number.isNaN(n)||(x(r[e],{value:n}),B("Setting updated: "+e+" = "+o));return}}var Eo="v1.1.0";function za(){return{tag_name:Eo,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+Eo+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+Eo+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function Sa(t){let e=[];for(let o=1;o<=be;o++)e.push({zone:o,name:S(b.name(o)),enabled:S(b.enabled(o))==="on",setpoint_c:_(b.setpoint(o)),probe:S(b.probe(o)),temp_source:S(b.tempSource(o)),ble_mac:S(b.ble(o)),sensor_id:S(b.sensorId(o)),sensor_name:S(b.sensorName(o)),sync_to:S(b.syncTo(o))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:S(i.firmware),device:{mac:S(i.mac)},settings:{manifold_type:S(i.manifoldType),manifold_flow_probe:S(i.manifoldFlowProbe),manifold_return_probe:S(i.manifoldReturnProbe),motor_profile_default:S(i.motorProfileDefault),min_zone_flow_pct:_(i.minZoneFlowPct),minimum_flow_always:S(i.minimumFlowAlways)==="on",simple_preheat_enabled:S(i.simplePreheatEnabled)==="on",ble_clock_sync_enabled:S(i.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:_(i.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(o=>({zone:o.zone,open_ripples:400+o.zone,close_ripples:390+o.zone}))}:null}}function _a(t,e){let o=Object.keys(t&&t.settings||{}).length,a=Array.isArray(t&&t.zones)?t.zones.length:0,r=e&&t&&t.learned?be:0;return B("Settings restored from backup (mock)"),{applied:o+a+r,skipped:e?0:be,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Yt({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!Z.enabled[t-1];Yt({key:"zone_enabled",value:e?1:0,zone:t})}};function To(t,e){let o=URL.createObjectURL(e),a=document.createElement("a");a.href=o,a.download=t,a.rel="noopener",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function Fo(t,e,o){To(t,new Blob([String(e)],{type:(o||"text/plain")+";charset=utf-8"}))}function No(t,e){let o=new Date,a=n=>String(n).padStart(2,"0"),r=o.getFullYear()+a(o.getMonth()+1)+a(o.getDate())+"-"+a(o.getHours())+a(o.getMinutes());return t+"-"+r+"."+e}var tt="/api/v1",xr="https://api.github.com/repos/birkemosen/lune/releases/latest",yr="https://github.com/birkemosen/lune/releases/latest/download/",wr="/update",kr="lune-v6-settings";function qe(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function Do(t,e){let o=new URLSearchParams;for(let[r,n]of Object.entries(e||{}))n!=null&&o.append(r,n);let a=o.toString();return tt+t+(a?"?"+a:"")}function ke(t,e,o){if(Ao(),qe())try{return Yt(o),Promise.resolve({ok:!0})}finally{Zt()}let a=sessionStorage.getItem("hv6_local_access_key")||"",r=new URLSearchParams;for(let[s,c]of Object.entries(e||{}))c!=null&&r.append(s,String(c));let n=s=>fetch(tt+t,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","X-Lune-Local-Key":s,"X-Lune-CSRF":s,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:r.toString()});return n(a).then(async s=>{if(s.status===403&&!a){let c=window.prompt("Enter the Lune commissioning key to change local settings")||"";c&&(sessionStorage.setItem("hv6_local_access_key",c),a=c,s=await n(a))}return!s.ok&&[400,404,415].includes(s.status)?fetch(Do(t,e),{method:"POST"}):(s.ok||console.warn(`API call failed: POST ${t} status=${s.status}`),s)}).catch(s=>{throw console.error(`API call error: POST ${t}:`,s),s}).finally(()=>{Zt()})}function Ro(){return sessionStorage.getItem("hv6_local_access_key")||""}function zr(t,e,o){Ao();let a=Ro();return fetch(Do(t,o),{method:"POST",headers:{"Content-Type":"application/json","X-Lune-Local-Key":a,"X-Lune-CSRF":a,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:JSON.stringify(e)}).finally(()=>{Zt()})}function Qt(t,e){let o=Number(e);x(b.setpoint(t),{value:o}),x(b.baseSetpoint(t),{value:o});let a=Number(_(b.coordinatorOffset(t))),r=Number.isFinite(a)?o+a:o;return x(b.effectiveSetpoint(t),{value:r}),ke(`/zones/${t}/setpoint`,{setpoint_c:o},{key:"zone_setpoint",value:o,zone:t})}function La(t,e){return x(b.enabled(t),{state:e?"on":"off",value:e}),ke(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function Ct(t){return x(i.drivers,{state:t?"on":"off",value:t}),ke("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}function Ae(t,e){return ke("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function Aa(){return mt("Scanning I2C bus..."),B("I2C scan started"),Ae("i2c_scan")}var Sr={zone_probe:t=>b.probe(t),zone_temp_source:t=>b.tempSource(t),zone_sync_to:t=>b.syncTo(t)},_r={zone_ble_mac:t=>b.ble(t),zone_sensor_id:t=>b.sensorId(t),zone_sensor_name:t=>b.sensorName(t),zone_name:t=>b.name(t)},Cr={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,ble_clock_sync_enabled:i.bleClockSyncEnabled},Lr={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};function Ue(t,e,o){let a=Sr[e];return a&&x(a(t),{state:o}),ke("/settings/select",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function gt(t,e,o){let a=_r[e];return a&&x(a(t),{state:o}),ke("/settings/text",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function Ee(t,e){let o=Cr[t];return o&&x(o,{state:e}),ke("/settings/select",{key:t,value:e},{key:t,value:e})}function Me(t,e){let o=Number(e),a=Lr[t];return a&&!Number.isNaN(o)&&x(a,{value:o}),ke("/settings/number",{key:t,value:o},{key:t,value:o})}function Ma(){return ke("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:S(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:S(i.authorityProposalCoordinatorId)||"touch-mock",local_access_key:"mock-local-access-key"}},o=(e==null?void 0:e.data)||{};return o.local_access_key&&sessionStorage.setItem("hv6_local_access_key",o.local_access_key),o.installation_id&&x(i.authorityInstallationId,{state:o.installation_id}),o.coordinator_id&&x(i.authorityCoordinatorId,{state:o.coordinator_id}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),e})}function Ea(){return ke("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return sessionStorage.removeItem("hv6_local_access_key"),x(i.authorityInstallationId,{state:""}),x(i.authorityCoordinatorId,{state:""}),x(i.authorityConfigured,{state:"off",value:!1}),t})}function Ta(t,e){let o=String(e||"").trim();return B("Zone "+t+" renamed to "+(o||"(blank)"),t),gt(t,"zone_name",o)}function Fa(t,e){let o=Number(e),a=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return x(b.motorTarget(t),{value:a}),B("Motor "+t+" target set to "+a+"%",t),ke(`/motors/${t}/target`,{value:a},{key:"motor_target",value:a,zone:t})}function eo(t,e=1e4){return B("Motor "+t+" open for "+e+"ms",t),ke(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function to(t,e=1e4){return B("Motor "+t+" close for "+e+"ms",t),ke(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function Po(t){return B("Motor "+t+" stopped",t),ke(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function Na(){B("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(ke(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>Ct(!1).then(()=>e))}async function Da(){if(qe())return ya();let t=await fetch(tt+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function Ra(){if(qe())return wa();let t=await fetch(tt+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function Lt(t){return Ne("manualMode",!!t),B(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),ke("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function Pa(t){return B("Motor "+t+" fault reset",t),Ae("motor_reset_fault",t)}function Oa(t){return B("Motor "+t+" learned factors reset",t),Ae("motor_reset_learned_factors",t)}function Ia(t){return B("Motor "+t+" reset and relearn started",t),Ae("motor_reset_and_relearn",t)}function qa(){return B("Task/heap stats dumped to device log"),Ae("dump_task_stats")}function Oo(){qe()||fetch(tt+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Wt(t)}).catch(()=>{})}function Ha(){return Ae("firmware_check")}function Ba(){return B("Firmware install requested"),Ae("firmware_install")}function $a(){return Ae("firmware_prepare")}function Io(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:yr+e}}function Ca(t,e){let o=Array.isArray(t)?t:[],a=n=>o.find(s=>n.test(String(s&&s.name||""))),r=a(/^lune-v6.*\.ota\.bin$/i)||a(/\.ota\.bin$/i)||a(/\.bin$/i);return r&&r.browser_download_url?{name:String(r.name),url:String(r.browser_download_url)}:Io(e)}var Ve=class extends Error{constructor(e,o,a){super(a||e),this.name="ReleaseCheckError",this.code=e,this.status=o||0}};async function ja(){if(qe()){let a=za(),r=String(a&&a.tag_name||"");return{tag:r,notes:String(a&&a.body||""),publishedAt:String(a&&a.published_at||""),asset:Ca(a&&a.assets,r)}}let t;try{t=await fetch(xr,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(a){throw new Ve("network",0,a&&a.message?a.message:"network")}if(t.status===404)throw new Ve("no_releases",404,"No published GitHub release");if(!t.ok)throw new Ve("http",t.status,"Release check failed: "+t.status);let e=await t.json(),o=String(e&&e.tag_name||"");if(!o)throw new Ve("no_releases",404,"No published GitHub release");return{tag:o,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Ca(e&&e.assets,o)}}function Va(t,e){return qe()?new Promise(o=>{let a=0,r=setInterval(()=>{a=Math.min(100,a+20),e&&e(a),a>=100&&(clearInterval(r),B("Firmware image uploaded (mock)"),o("Update Successful!"))},220)}):new Promise((o,a)=>{let r=new FormData;r.append("update",t,t.name);let n=new XMLHttpRequest;n.open("POST",wr);let s=Ro();s&&(n.setRequestHeader("X-Lune-Local-Key",s),n.setRequestHeader("X-Lune-CSRF",s)),n.upload.onprogress=c=>{e&&c.lengthComputable&&e(Math.min(100,Math.round(c.loaded/c.total*100)))},n.onload=()=>{let c=String(n.responseText||"");if(n.status>=200&&n.status<300&&!/fail/i.test(c)){o(c);return}a(new Error("OTA upload rejected: "+n.status+" "+c))},n.onerror=()=>a(new Error("OTA upload connection lost")),n.send(r)})}function Jt(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function Ua(t=!0){if(qe())return Jt(Sa(t));let e=await fetch(Do("/settings/export",{include_learned:t?1:0}),{cache:"no-store",headers:{"X-Lune-Local-Key":Ro()}});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Jt(await e.json())}function oo(t){let e=Jt(t);return!!(e&&e._type===kr)}async function Za(t,e=!0){let o=typeof t=="string"?JSON.parse(t):t,a=Jt(o);if(!oo(a))throw new Error("not_a_lune_backup");if(qe())return _a(a,e);let r=await zr("/settings/import",Object.assign({},a,{restore_learned:!!e}),{restore_learned:e?1:0});if(!r.ok)throw new Error("Settings restore failed: "+r.status);let n=await r.json().catch(()=>({})),s=n&&n.data?n.data:n||{};return B("Settings restored from backup"),{applied:Number(s.applied||0),skipped:Number(s.skipped||0),ignored:Number(s.ignored||0)}}function Wa(t){let e=No("lune-v6-settings","json");return Fo(e,JSON.stringify(t,null,2),"application/json"),e}function Ar(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Gt().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function Ka(){let t=No("lune-v6-logs","txt");if(qe())return Fo(t,Ar()||"No log lines buffered."),t;let e=await fetch(tt+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return To(t,await e.blob()),t}function qo(){if(qe())return;let t=pa();fetch(tt+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Kt(e.lines,e.next_seq)}).catch(()=>{})}var ao=null,Ga=null,Xa=null,Ya=null,Ho=null;async function Mr(){ao&&ao.abort(),ao=new AbortController;let t=await fetch("/api/v1/state",{cache:"no-store",signal:ao.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function Ja(t){if(!(!t||typeof t!="object")&&!da()){for(let e in t)x(e,t[e]);St(!1)}}function Er(t){if(t){if(!t.type){Ja(t);return}if(t.type==="state"){Ja(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;B(e),String(e).indexOf("I2C_SCAN:")!==-1&&mt(String(e))}}}function Tr(){Oo(),Ga||(Ga=setInterval(Oo,300*1e3)),qo(),Xa||(Xa=setInterval(qo,3e3))}function Qa(){Mr().then(t=>{je(!0),Er(t),Tr()}).catch(()=>{je(!1)})}async function Fr(){try{let t=await fetch("/api/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),o=e&&e.data,a=o&&o.data_revision;o&&o.uptime_s!=null&&x(i.uptime,{value:Number(o.uptime_s)}),(Ho===null||a!==Ho)&&(Ho=a,Qa()),je(!0)}catch(t){je(!1)}}function en(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){ka();return}Qa(),Ya||(Ya=setInterval(Fr,3e3))}var tn=Object.create(null);function I(t,e){if(tn[t])return;tn[t]=1;let o=document.createElement("style");o.textContent=e,document.head.appendChild(o)}var no={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.scrollBottom":"Scroll to bottom","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.sensor.externalSource":"External (Wi\u2011Fi)","zone.sensor.externalTitle":"External (Wi\u2011Fi)","zone.sensor.externalNote":"Bind a stable sensor_id. Hubs POST temperatures; zone mapping stays on V6. See Help \u2192 External room temperature.","zone.sensor.sensorIdPh":"sensor_id (MAC or entity id)","zone.sensor.sensorNamePh":"Friendly name (optional)","zone.sensor.noIngestYet":"No external temperature received yet.","zone.sensor.lastIngestAge":"Last ingest {sec}s ago (stale after 15 min).","help.external.title":"External room temperature","help.external.intro":"V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.","help.external.keyWarn":"Scripts include your browser session key if set \u2014 treat it as a secret.","help.external.copy":"Copy","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.returnTemp.title":"Return temperature","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Optional return probes for legacy return-temp balancing \u2014 not required for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Accent colour is stored in this browser only. It does not change how the controller runs.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The trace replaces this after the stroke.","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 ~250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.scrollBottom":"Til bunden","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.sensor.externalSource":"Ekstern (Wi\u2011Fi)","zone.sensor.externalTitle":"Ekstern (Wi\u2011Fi)","zone.sensor.externalNote":"Bind et stabilt sensor_id. Hubs poster temperaturer; zone-mapping sker kun p\xE5 V6. Se Hj\xE6lp \u2192 Ekstern rumtemperatur.","zone.sensor.sensorIdPh":"sensor_id (MAC eller entity-id)","zone.sensor.sensorNamePh":"Venligt navn (valgfrit)","zone.sensor.noIngestYet":"Ingen ekstern temperatur modtaget endnu.","zone.sensor.lastIngestAge":"Seneste ingest for {sec}s siden (stale efter 15 min).","help.external.title":"Ekstern rumtemperatur","help.external.intro":"V6 accepterer HTTP POST med sensor_id. Zone-mapping sker kun p\xE5 V6. Touch ingerer ikke temperaturer.","help.external.keyWarn":"Scripts inkluderer din browser-session-n\xF8gle hvis sat \u2014 behandl den som hemmelighed.","help.external.copy":"Kopi\xE9r","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Valgfrie returprober til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendige for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Accentfarven gemmes kun i denne browser. Den \xE6ndrer ikke, hvordan styringen k\xF8rer.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Tracen erstatter visningen efter slaget.","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 ca. 250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},on="en".toLowerCase(),Bo=no[on]?on:"en";function d(t,e){let o=no[Bo]&&no[Bo][t]||no.en[t]||t;return e?String(o).replace(/\{(\w+)\}/g,(a,r)=>e[r]==null?"":String(e[r])):o}function M(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=d(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",d(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",d(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",d(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Bo);var Nr=`
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

/* ---- Controls (iOS HIG default touch target: 44\xD744 pt) ---- */
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

@media (max-width: 520px) {
  .ui-row { align-items: stretch; flex-direction: column; gap: 4px; padding: 8px 0; }
  .ui-field { align-self: stretch; width: 100%; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-btn { width: 100%; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;I("ui-kit",Nr);function he(t){let e=d(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function Dr(t,e){let o=Math.abs(Number(t));return!Number.isFinite(o)||o<1e3?e:Math.pow(10,Math.floor(Math.log10(o))-1)}function Rr(t){let e=String(t),o=e.indexOf(".");return o<0?0:e.length-o-1}function ve(t,e={}){let o=t.querySelector(e.title||".ui-card-title"),a=document.createElement("div");a.className="ui-form-banner",a.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",a):t.insertAdjacentElement("afterbegin",a);let r=[],n=()=>a.classList.toggle("show",r.some(v=>v.dirty)),s=(v,y)=>{v.dirty=y,n()};function c(v){return v.markDirty=()=>s(v,!0),r.push(v),v}function u(v,y){let T={dirty:!1,input:v},w=y.baseStep!=null?y.baseStep:parseFloat(v.step)||1,A=Rr(w),E=y.min!=null?y.min:v.min!==""?parseFloat(v.min):-1/0,D=y.max!=null?y.max:v.max!==""?parseFloat(v.max):1/0,q=H=>A>0?Number(H).toFixed(A):String(Math.round(Number(H)));if(!y.nostep){let H=document.createElement("div");H.className="ui-stepper",v.parentNode.insertBefore(H,v);let P=document.createElement("button");P.type="button",P.className="ui-step-btn",P.textContent="\u2212",P.setAttribute("aria-label",d("common.decrease"));let X=document.createElement("button");X.type="button",X.className="ui-step-btn",X.textContent="+",X.setAttribute("aria-label",d("common.increase")),H.appendChild(P),H.appendChild(v),H.appendChild(X);let se=j=>{if(v.disabled)return;let L=parseFloat(v.value);Number.isFinite(L)||(L=parseFloat(v.placeholder)),Number.isFinite(L)||(L=0);let ee=Math.min(D,Math.max(E,L+j*Dr(L,w)));v.value=q(ee),s(T,!0)};P.addEventListener("click",()=>se(-1)),X.addEventListener("click",()=>se(1)),v.addEventListener("keydown",j=>{j.key==="Enter"&&v.blur()})}return v.addEventListener("input",()=>s(T,!0)),T.sync=()=>{let H=y.read();v.value=H!=null&&Number.isFinite(Number(H))?q(H):""},T.commit=()=>{let H=parseFloat(v.value);Number.isFinite(H)&&y.commit(Math.min(D,Math.max(E,H)))},c(T)}function m(v,y){let T={dirty:!1,input:v};return v.addEventListener("input",()=>s(T,!0)),T.sync=()=>{let w=y.read();v.value=w!=null?w:""},T.commit=()=>y.commit(v.value.trim()),c(T)}function l(v,y){let T={dirty:!1,input:v};return v.addEventListener("change",()=>s(T,!0)),T.sync=()=>{let w=y.read();w!=null&&(v.value=w)},T.commit=()=>y.commit(v.value),c(T)}function g(v,y){let T={dirty:!1,input:v,staged:!1},w=v.closest(".ui-row"),A=()=>{v.classList.toggle("on",T.staged),w&&w.classList.toggle("is-on",T.staged),v.setAttribute("aria-checked",T.staged?"true":"false"),y.onChange&&y.onChange(T.staged)};return v.addEventListener("click",()=>{T.staged=!T.staged,s(T,!0),A()}),T.sync=()=>{T.staged=!!y.read(),A()},T.commit=()=>y.commit(T.staged),c(T)}function p(v){let y={dirty:!1,sync:v.sync,commit:v.commit};return c(y)}let f=()=>r.forEach(v=>{!v.dirty&&v.sync&&v.sync()}),h=()=>{r.forEach(v=>{v.dirty&&(v.commit&&v.commit(),v.dirty=!1)}),n(),e.onApply&&e.onApply()},z=()=>{r.forEach(v=>{v.dirty=!1,v.sync&&v.sync()}),n(),e.onDiscard&&e.onDiscard()};return a.querySelector(".ui-form-apply").addEventListener("click",h),a.querySelector(".ui-form-discard").addEventListener("click",z),M(a),{num:u,text:m,select:l,toggle:g,custom:p,refresh:f,apply:h,discard:z,isDirty:()=>r.some(v=>v.dirty)}}var Pr=`
.v6-toolbar { display:flex; align-items:center; justify-content:space-between; gap:24px; min-height:48px; }
.v6-toolbar-leading { display:flex; align-items:center; gap:14px; min-width:0; }
.v6-toolbar-icon { width:40px; height:40px; display:grid; place-items:center; border:0; border-radius:8px; color:var(--text-muted); background:transparent; font-size:18px; }
.v6-toolbar h1 { margin:0; color:var(--text-strong); font-size:1.16rem; line-height:1.2; font-weight:700; letter-spacing:-.018em; }
.v6-toolbar p { margin:1px 0 0; color:var(--text-muted); font-size:.74rem; }
.v6-toolbar-trailing { display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
.v6-live { display:inline-flex; align-items:center; gap:7px; color:var(--text-muted); font-size:.78rem; font-weight:650; }
.v6-live::before { content:''; width:7px; height:7px; border-radius:50%; background:var(--state-disabled); }
.v6-live.is-live { color:var(--state-ok); }
.v6-live.is-live::before { background:var(--state-ok); }
.v6-update-badge,.v6-attention-badge { display:inline-flex; align-items:center; gap:7px; min-height:36px; padding:0 12px; border-radius:999px; font:inherit; font-size:.78rem; font-weight:700; cursor:pointer; }
.v6-update-badge { border:1px solid var(--accent-border); background:var(--accent-bg-soft); color:var(--accent); }
.v6-update-badge[hidden],.v6-attention-badge[hidden] { display:none; }
.v6-update-badge:hover { border-color:var(--accent-border-hover); background:rgba(var(--accent-rgb),.18); }
.v6-update-badge::before,.v6-attention-badge::before { content:''; width:7px; height:7px; border-radius:50%; background:currentColor; }
.v6-attention-badge { border:1px solid rgba(245,158,11,.45); background:rgba(245,158,11,.12); color:var(--state-warn, #f59e0b); }
.v6-attention-badge:hover { border-color:rgba(245,158,11,.7); background:rgba(245,158,11,.18); }
.side-nav-slot hv6-sidebar { display:flex; flex:1; min-height:0; }
.v6-side-nav { display:flex; flex:1; flex-direction:column; gap:3px; }
.v6-nav-group { margin:0 0 20px; }
.v6-nav-heading { margin:0 12px 8px; color:var(--text-faint); font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.v6-side-link { position:relative; display:flex; align-items:center; gap:10px; min-height:var(--control-height,44px); padding:0 12px; border:1px solid transparent; border-radius:10px; color:var(--text-muted); background:transparent; text-decoration:none; font-size:.9rem; font-weight:600; }
.v6-side-link:hover { color:var(--text-strong); background:var(--surface-raised); }
.v6-side-link.active { color:var(--accent); border-color:transparent; background:rgba(var(--accent-rgb),.10); }
.v6-nav-dot { margin-left:auto; width:8px; height:8px; border-radius:50%; background:var(--accent); flex:0 0 auto; }
.v6-nav-dot[hidden] { display:none !important; }
.v6-nav-dot.is-warn { background:var(--state-warn, #f59e0b); }
.menu-icon { width:20px; height:20px; flex:0 0 auto; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.v6-side-utility { margin-top:auto; padding-top:16px; border-top:1px solid var(--separator); }
.v6-more-toggle { display:none; }
.v6-nav-zones { display:flex; flex-direction:column; gap:2px; }
@media (max-width:900px) {
  .v6-toolbar { min-height:48px; }
  .v6-toolbar-trailing { gap:8px; }
  .v6-side-nav { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
  .v6-nav-group { display:contents; }
  .v6-nav-heading, .v6-side-utility { display:none !important; }
  .v6-nav-zones { display:contents; }
  .v6-side-link { justify-content:center; flex-direction:column; gap:2px; min-height:52px; padding:4px; font-size:.68rem; }
  .v6-side-link[data-section="settings"],
  .v6-side-link[data-section="motorlab"] { display:none; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"],
  .v6-side-nav.more-open .v6-side-link[data-section="motorlab"]:not([hidden]) { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { display:contents; border:0; padding:0; margin:0; }
  .v6-side-nav.more-open .v6-side-utility .v6-side-link { display:flex; }
  .v6-nav-dot { position:absolute; top:6px; right:10px; margin-left:0; width:7px; height:7px; }
}
`;I("hv6-header",Pr);var Or=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button><span class="v6-live" id="hdr-live">Offline</span></div>
  </header>`,ot=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,ro=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,Ir=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${ot('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <div class="v6-nav-zones">
        <a href="#" class="v6-side-link" data-section="zones">${ot('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span>${ro("warn")}</a>
      </div>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${ot('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span>${ro("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${ot('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span>Motor lab</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${ot('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span>${ro()}</a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${ot('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span>${ro()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${ot('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`,an={overview:["Overview","Local heating status and current exceptions"],zones:["Zones","Physical loops, applied targets and valve state"],diagnostics:["Diagnostics","Health, evidence and recovery"],motorlab:["Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Device configuration and safety"],help:["Help","Guidance for operating Lune V6"]};function rn(t){t&&(Oe(t.section),t.focus==="touch"&&requestAnimationFrame(()=>{let e=document.querySelector(".touch-settings");e&&(e.open=!0);let o=document.querySelector(".settings-touch-card");o&&o.scrollIntoView({behavior:"smooth",block:"center"})}))}function nn(t){return t?t.kind==="touch"?d("status.attention.approveTouch"):t.kind==="faults"?t.count===1?d("status.attention.zoneFaultOne"):d("status.attention.zoneFaultMany",{count:t.count}):"":""}O({tag:"hv6-header",render:Or,onMount(t,e){let o=e.querySelector("#hdr-live"),a=e.querySelector("#v6-view-title"),r=e.querySelector("#v6-view-subtitle"),n=e.querySelector("#hdr-update"),s=e.querySelector("#hdr-attention");function c(){let l=R("firmwareUpdateAvailable");n.hidden=!l,l&&(n.textContent=d("status.updateAvailable",{version:l.latest}),n.title=d("settings.firmware.badgeTitle"))}function u(){let l=Lo(),g=R("section")||"overview",p=!!(l&&l.section!==g);s.hidden=!p,p?(s.textContent=nn(l),s.title=nn(l),s.dataset.kind=l.kind):delete s.dataset.kind}n.addEventListener("click",()=>{Oe("settings");let l=document.querySelector(".settings-firmware-card");if(!l)return;let g=l.closest("details");g&&(g.open=!0),l.scrollIntoView({behavior:"smooth",block:"center"})}),s.addEventListener("click",()=>{rn(Lo())});function m(){let l=R("section")||"overview",g=an[l]||an.overview;a.textContent=g[0],r.textContent=g[1],o.textContent=R("live")?d("status.live"):d("status.offline"),o.classList.toggle("is-live",!!R("live")),u()}U("section",m),U("live",m),U("firmwareUpdateAvailable",c),k(i.authorityProposalPending,u);for(let l=1;l<=6;l++)k(b.state(l),u),k(b.motorLastFault(l),u);M(e),m(),c(),u()}});O({tag:"hv6-sidebar",render:Ir,onMount(t,e){let o=e,a=e.querySelectorAll("[data-section]"),r=e.querySelector(".v6-more-toggle"),n=e.querySelector('[data-section="settings"]'),s=e.querySelector('[data-section="zones"]'),c=e.querySelector('[data-section="diagnostics"]');function u(g,p,f,h){if(!g)return;let z=g.querySelector("[data-nav-dot]");z&&(z.hidden=!p,p?(g.setAttribute("aria-label",`${f}, ${h}`),g.title=h):(g.removeAttribute("aria-label"),g.removeAttribute("title")))}function m(){let g=Vt(),p=Co(),f=p===1?d("status.attention.zoneFaultOne"):d("status.attention.zoneFaultMany",{count:p});if(u(n,g,d("nav.settings"),d("status.attention.approveTouch")),u(s,p>0,d("nav.zones"),f),u(c,p>0,d("nav.diagnostics"),f),r){let h=r.querySelector("[data-nav-dot]");h&&(h.hidden=!g,h.classList.toggle("is-warn",!1)),g?(r.setAttribute("aria-label",d("status.attention.moreHasSettings")),r.title=d("status.attention.approveTouch")):(r.removeAttribute("aria-label"),r.removeAttribute("title"))}}function l(){let g=R("section");a.forEach(p=>{p.dataset.section&&(p.dataset.section===g?p.classList.add("active"):p.classList.remove("active"),p.setAttribute("aria-current",p.dataset.section===g?"page":"false"))}),m()}a.forEach(g=>g.addEventListener("click",p=>{p.preventDefault();let f=g.dataset.section;f==="settings"&&Vt()?rn({kind:"touch",section:"settings",focus:"touch"}):Oe(f),o.classList.contains("more-open")&&(o.classList.remove("more-open"),r&&r.setAttribute("aria-expanded","false"))})),r&&r.addEventListener("click",()=>{let g=o.classList.toggle("more-open");r.setAttribute("aria-expanded",String(g))}),U("section",l),k(i.authorityProposalPending,m);for(let g=1;g<=6;g++)k(b.state(g),m),k(b.motorLastFault(g),m);M(e),l()}});function me(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function bt(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function sn(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,o=t%86400/3600|0,a=t%3600/60|0;return e>0?e+"d "+o+"h "+a+"m":o>0?o+"h "+a+"m":a+"m"}var qr=`
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
`;I("connectivity-card",qr);var Hr=()=>`
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
`,Dl=O({tag:"connectivity-card",render:Hr,onMount(t,e){let o=e.querySelector(".cc-ip"),a=e.querySelector(".cc-ssid"),r=e.querySelector(".cc-mac"),n=e.querySelector(".cc-up"),s=e.querySelector(".cc-ver"),c=0,u=Date.now(),m=!1;function l(){if(!m){n.textContent="---";return}let f=Math.max(0,Math.floor((Date.now()-u)/1e3)),h=sn(c+f);n.textContent!==h&&(n.textContent=h)}function g(){o.textContent=S(i.ip)||"---",a.textContent=S(i.ssid)||"---",r.textContent=S(i.mac)||"---",s.textContent=S(i.firmware)||"---";let f=_(i.uptime);if(f!=null&&!isNaN(f)&&f>=0){let h=f|0;(!m||h!==c)&&(c=h,u=Date.now(),m=!0)}l()}k(i.ip,g),k(i.ssid,g),k(i.mac,g),k(i.firmware,g),k(i.uptime,g);let p=setInterval(l,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(p),{once:!0}),M(e),g()}});var Br="http://www.w3.org/2000/svg",$r=`
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
`;I("chart-kit",$r);function Y(t,e,o){let a=document.createElementNS(Br,t);if(e)for(let r in e)a.setAttribute(r,e[r]);return o!=null&&(a.textContent=o),a}function ft(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(a=>`${a.x.toFixed(2)} ${a.y.toFixed(2)}`).join(" L ");let e=.16,o=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let a=0;a<t.length-1;a++){let r=t[a-1]||t[a],n=t[a],s=t[a+1],c=t[a+2]||s,u=n.x+(s.x-r.x)*e,m=n.y+(s.y-r.y)*e,l=s.x-(c.x-n.x)*e,g=s.y-(c.y-n.y)*e;o+=` C ${u.toFixed(2)} ${m.toFixed(2)}, ${l.toFixed(2)} ${g.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return o}function so(t,e,o){let a=t.filter(c=>Number.isFinite(c));if(!a.length)return{min:e,max:o};let r=Math.min(...a),n=Math.max(...a);r===n&&(r-=1,n+=1);let s=(n-r)*.12;return{min:r-s,max:n+s}}function ht(t,e,o){let a=document.createElement("div");a.className="chart-tooltip",e.appendChild(a);let r=Y("g",{class:"chart-cursor",style:"display:none"}),n=Y("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});r.appendChild(n);let s=[];t.appendChild(r);function c(g){let p=0,f=1/0;for(let h=0;h<o.count;h++){let z=Math.abs(g-o.xAt(h));z<f&&(f=z,p=h)}return p}function u(g){let p=t.getScreenCTM();if(!p)return null;let f=t.createSVGPoint();return f.x=g.clientX,f.y=g.clientY,f.matrixTransform(p.inverse())}function m(g){if(!o.count)return;let p=u(g);if(!p)return;let f=c(p.x),h=o.xAt(f);n.setAttribute("x1",h),n.setAttribute("x2",h);let z=o.dots(f);for(;s.length<z.length;){let w=Y("circle",{class:"chart-cursor-dot",r:3.4});r.appendChild(w),s.push(w)}s.forEach((w,A)=>{A<z.length?(w.setAttribute("cx",h),w.setAttribute("cy",z[A].y),w.setAttribute("fill",z[A].color),w.style.display=""):w.style.display="none"}),r.style.display="";let v=o.rows(f).map(w=>`<div class="tt-row"><span class="tt-swatch" style="background:${w.color}"></span>${w.label}<span class="tt-val">${w.value}</span></div>`).join("");a.innerHTML=`<div class="tt-time">${o.label(f)}</div>${v}`,a.classList.add("show");let y=e.getBoundingClientRect(),T=g.clientX-y.left+14;T+a.offsetWidth>y.width-6&&(T=g.clientX-y.left-a.offsetWidth-14),a.style.left=Math.max(6,T)+"px",a.style.top=Math.max(6,g.clientY-y.top+12)+"px"}function l(){a.classList.remove("show"),r.style.display="none"}return t.addEventListener("pointermove",m),t.addEventListener("pointerleave",l),()=>{t.removeEventListener("pointermove",m),t.removeEventListener("pointerleave",l),a.remove()}}var At=1e3,$o=180,De=14,jr=42,Vr=44,We=42,co=At-We-jr,Ze=$o-De-Vr,at=De+Ze,jo=24*3600,ln=ye+2,cn=ye+3,io=ye+4,Ur="var(--series-warm)",Zr="var(--series-cool)",dn="var(--series-solar)",Wr=`
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
`;I("graph-widgets",Wr);var pn=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',un=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Kr=t=>t.variant==="flow-return"?`<div class="graph-widgets">${pn()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${un()}</div>`:`<div class="graph-widgets">${pn()}${un()}</div>`;function mn(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function Gr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function Vo(t,e,o){let a=[];for(let r=0;r<t.length;r++){let n=t[r];if(!n||n[0]<o)continue;let s=n[e];s==null||!Number.isFinite(s)||a.push({t:n[0],v:s})}return a}var po=(t,e)=>We+Math.max(0,Math.min(1,(t-e)/jo))*co;function Xr(t,e,o){let a=Number(Date.now()/1e3)|0,r=3600,n=Math.ceil((a-jo)/r)*r,s=Math.floor(a/r)*r,c=Math.floor(a/r)*r;for(let m=n;m<=s;m+=r){let l=o-(a-m),g=po(l,e),p=new Date(m*1e3),f=m===c,h=at+16;t.appendChild(Y("text",{x:g,y:h,"text-anchor":"end",transform:`rotate(-45 ${g.toFixed(1)} ${h})`,class:"chart-hour"+(f?" now":"")},String(p.getHours()).padStart(2,"0")))}let u=po(o,e);t.appendChild(Y("line",{x1:u,y1:De,x2:u,y2:at,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Yr(t){let e=[];if(t.forEach(n=>n.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let o=Math.min(...e),a=Math.max(...e);o===a&&(o-=.5,a+=.5);let r=(a-o)*.1;return o-=r,a+=r,{min:o,max:a}}function Jr(t,e,o){let a=t.filter(r=>r.unit==="C").map(r=>Vo(e,r.index,o));return Yr(a)}function gn(t,e,o,a,r,n){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${At} ${$o}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=o.map(h=>Vo(a,h.index,r));if(!s.some(h=>h.length))return t.appendChild(Y("text",{x:At/2,y:$o/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let c=Jr(o,a,r),u=Math.max(.001,c.max-c.min),m=h=>De+(1-(h-c.min)/u)*Ze,l=h=>De+(1-Math.max(0,Math.min(100,h))/100)*Ze,g=(h,z)=>h.unit==="%"?l(z):m(z);for(let h=0;h<3;h++){let z=h/2,v=De+z*Ze;t.appendChild(Y("line",{x1:We,y1:v,x2:We+co,y2:v,class:"chart-grid"})),o.some(y=>y.unit==="C")&&t.appendChild(Y("text",{x:We-6,y:v+4,"text-anchor":"end",class:"chart-tick"},mn(c.max-u*z,"C")+"\xB0")),o.some(y=>y.unit==="%")&&t.appendChild(Y("text",{x:We+co+6,y:v+4,"text-anchor":"start",class:"chart-tick"},mn(100-100*z,"%")))}t.appendChild(Y("line",{x1:We,y1:at,x2:We+co,y2:at,class:"chart-axis"})),o.some(h=>h.unit==="C")&&t.appendChild(Y("text",{x:9,y:De+Ze/2,transform:`rotate(-90 9 ${(De+Ze/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.temp"))),o.some(h=>h.unit==="%")&&t.appendChild(Y("text",{x:At-9,y:De+Ze/2,transform:`rotate(90 ${At-9} ${(De+Ze/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.demand"))),Xr(t,r,n),o.forEach((h,z)=>{let v=s[z].map(T=>({x:po(T.t,r),y:g(h,T.v)}));if(!v.length)return;let y=ft(v);h.fill&&t.appendChild(Y("path",{d:y+` L ${v[v.length-1].x.toFixed(1)} ${at} L ${v[0].x.toFixed(1)} ${at} Z`,fill:h.fill,stroke:"none"})),t.appendChild(Y("path",{d:y,fill:"none",stroke:h.color,"stroke-width":String(h.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let p=[];for(let h=0;h<a.length;h++){let z=a[h];if(!z||z[0]<r)continue;let v=o.map(y=>z[y.index]);v.every(y=>y==null||!Number.isFinite(y))||p.push({t:z[0],vals:v})}if(!p.length)return null;let f=Date.now();return ht(t,e,{count:p.length,plotTop:De,plotBottom:at,xAt:h=>po(p[h].t,r),label:h=>new Date(f-(n-p[h].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:h=>o.map((z,v)=>({y:g(z,p[h].vals[v]),color:z.color})).filter((z,v)=>Number.isFinite(p[h].vals[v])),rows:h=>o.map((z,v)=>({color:z.color,label:z.label,value:Gr(p[h].vals[v],z.unit)})).filter((z,v)=>Number.isFinite(p[h].vals[v]))})}function lo(t,e,o){let a=Vo(t,e,o);return a.length?a[a.length-1].v:null}var jl=O({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:Kr,onMount(t,e){let o=e.querySelector(".gw-dt"),a=e.querySelector(".gw-demand-text"),r=e.querySelector(".gw-flow"),n=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),c={flow:!0,return:!0,demand:!0},u=null,m=null;function l(){s.forEach(f=>{let h=f.dataset.layer;f.classList.toggle("is-off",!c[h]),f.setAttribute("aria-pressed",c[h]?"true":"false")})}function g(){let f=[];return c.flow&&f.push({index:ln,color:Ur,label:d("overview.graph.layers.flow"),unit:"C",width:2.4}),c.return&&f.push({index:cn,color:Zr,label:d("overview.graph.layers.return"),unit:"C",width:2}),c.demand&&f.push({index:io,color:dn,label:d("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function p(){let f=R("zoneStateHistory"),h=f&&Array.isArray(f.entries)?f.entries:[],z=f&&f.uptime_s||Number(Date.now()/1e3)|0,v=z-jo;if(r){u&&u();let y=lo(h,ln,v),T=lo(h,cn,v),w=lo(h,io,v),A=[];y!=null&&T!=null&&A.push("\u0394 "+(y-T).toFixed(1)+"\xB0"),w!=null&&A.push(Math.round(w)+"%"),o.textContent=A.length?A.join(" \xB7 "):"\u2014",u=gn(r,r.closest(".chart-card"),g(),h,v,z)}if(n){m&&m();let y=lo(h,io,v);a.textContent=y!=null?Math.round(y)+"%":"\u2014",m=gn(n,n.closest(".chart-card"),[{index:io,color:dn,label:d("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],h,v,z)}}s.forEach(f=>{f.addEventListener("click",()=>{let h=f.dataset.layer;c[h]=!c[h],!c.flow&&!c.return&&!c.demand&&(c[h]=!0),l(),p()})}),U("zoneStateHistory",p),M(e),l(),p()}});var Ke={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Mt=24*3600,Qr=Mt,Et=18,Wo=4,nt=54,mo=32,vt=4,go=10,hn=6,vn="#ffc14d",Uo=9,bn=ye+1,xn=vt+ye*(Et+Wo)-Wo,Zo=xn+hn,uo=xn+hn+go+mo,es=`
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
`;I("zone-state-timeline",es);var ts=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function os(t,e){if(!t||!t.entries||t.entries.length===0)return null;let o=t.entries,a=t.uptime_s||e||0,r=Number(Date.now()/1e3)|0,n=1e3,s=n-nt;function c(w){let A=(w+Mt)/Qr;return nt+Math.max(0,Math.min(1,A))*s}function u(w){return w-a}let m="http://www.w3.org/2000/svg",l=document.createElementNS(m,"svg");l.setAttribute("viewBox","0 0 "+n+" "+uo),l.classList.add("timeline-svg");let g=document.createElementNS(m,"rect");g.setAttribute("x",nt),g.setAttribute("y",vt),g.setAttribute("width",s),g.setAttribute("height",uo-vt-mo),g.setAttribute("fill","rgba(0,32,46,0.55)"),g.setAttribute("rx","4"),l.appendChild(g);let p=c(0),f=[-24,-18,-12,-6,0].map(w=>w*3600);for(let w of f){let A=c(w),E=document.createElementNS(m,"line");E.setAttribute("x1",A),E.setAttribute("y1",vt),E.setAttribute("x2",A),E.setAttribute("y2",uo-mo),E.setAttribute("stroke",w===0?"var(--series-solar)":"rgba(120,146,200,.16)"),E.setAttribute("stroke-width","1"),w===0&&(E.setAttribute("stroke-dasharray","2 3"),E.setAttribute("opacity",".55"),E.setAttribute("vector-effect","non-scaling-stroke")),l.appendChild(E)}l.appendChild(as(m,"text",{x:p+4,y:vt+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let w=0;w<ye;w++){let A=vt+w*(Et+Wo),E=document.createElementNS(m,"rect");E.setAttribute("x",nt),E.setAttribute("y",A),E.setAttribute("width",s),E.setAttribute("height",Et),E.setAttribute("fill",w%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),l.appendChild(E);let D=document.createElementNS(m,"text");D.setAttribute("x",nt-4),D.setAttribute("y",A+Et/2+1),D.setAttribute("text-anchor","end"),D.setAttribute("dominant-baseline","middle"),D.setAttribute("fill","rgba(233,222,210,.62)"),D.setAttribute("font-size","9.5"),D.setAttribute("font-family","Montserrat, sans-serif"),D.setAttribute("font-weight","600"),D.textContent="Z"+(w+1),l.appendChild(D);let q=o.map(P=>({rel:u(P[0]),state:P[w+1]})).filter(P=>P.rel>=-Mt&&P.rel<=0),H=(P,X,se)=>{if(se===255)return;let j=Ke[se]||Ke[255];if(j.color==="transparent")return;let L=c(P),ee=c(X),C=Math.max(1,ee-L),F=document.createElementNS(m,"rect");F.setAttribute("x",L),F.setAttribute("y",A+(Et-Uo)/2),F.setAttribute("width",C),F.setAttribute("height",Uo),F.setAttribute("fill",j.color),F.setAttribute("rx",String(Uo/2)),F.setAttribute("opacity","0.9"),l.appendChild(F)};if(q.length){let P=q[0].rel,X=q[0].state;for(let se=1;se<q.length;se++){let j=q[se];j.state!==X&&(H(P,j.rel,X),P=j.rel,X=j.state)}H(P,0,X)}}{let w=document.createElementNS(m,"rect");w.setAttribute("x",nt),w.setAttribute("y",Zo),w.setAttribute("width",s),w.setAttribute("height",go),w.setAttribute("fill","rgba(188,80,144,0.10)"),w.setAttribute("rx","2"),l.appendChild(w);let A=document.createElementNS(m,"text");A.setAttribute("x",nt-4),A.setAttribute("y",Zo+go/2+1),A.setAttribute("text-anchor","end"),A.setAttribute("dominant-baseline","middle"),A.setAttribute("fill","rgba(233,222,210,.62)"),A.setAttribute("font-size","8.5"),A.setAttribute("font-family","Montserrat, sans-serif"),A.setAttribute("font-weight","600"),A.textContent=d("overview.timeline.absorb"),l.appendChild(A);let E=o.map(D=>({rel:u(D[0]),on:D.length>bn?D[bn]:0})).filter(D=>D.rel>=-Mt&&D.rel<=0);if(E.length){let D=(P,X)=>{let se=c(P),j=Math.max(1,c(X)-se),L=document.createElementNS(m,"rect");L.setAttribute("x",se),L.setAttribute("y",Zo),L.setAttribute("width",j),L.setAttribute("height",go),L.setAttribute("fill",vn),L.setAttribute("rx","2"),L.setAttribute("opacity","0.9"),l.appendChild(L)},q=E[0].rel,H=E[0].on;for(let P=1;P<E.length;P++)E[P].on!==H&&(H&&D(q,E[P].rel),q=E[P].rel,H=E[P].on);H&&D(q,0)}}let h=uo-mo+15,z=3600,v=Math.ceil((r-Mt)/z)*z,y=Math.floor(r/z)*z,T=Math.floor(r/z)*z;for(let w=v;w<=y;w+=z){let A=w-r,E=c(A),D=new Date(w*1e3),q=String(D.getHours()).padStart(2,"0"),H=w===T,P=document.createElementNS(m,"text");P.setAttribute("x",E),P.setAttribute("y",h),P.setAttribute("text-anchor","end"),P.setAttribute("fill",H?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),P.setAttribute("font-size","9"),P.setAttribute("font-family",'"Montserrat", sans-serif'),P.setAttribute("font-weight","500"),P.setAttribute("font-variant-numeric","tabular-nums lining-nums"),P.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),P.setAttribute("letter-spacing","0"),P.setAttribute("transform",`rotate(-45 ${E.toFixed(1)} ${h})`),P.textContent=q,l.appendChild(P)}return l}function as(t,e,o,a){let r=document.createElementNS(t,e);for(let n in o)r.setAttribute(n,o[n]);return a!=null&&(r.textContent=a),r}function fn(t){t.innerHTML="";let e=[{code:5,...Ke[5]},{code:6,...Ke[6]},{code:0,...Ke[0]},{code:1,...Ke[1]},{code:7,...Ke[7]},{code:2,...Ke[2]}];for(let a of e){let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot" style="background:'+a.color+'"></span>'+(a.labelKey?d(a.labelKey):""),t.appendChild(r)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+vn+'"></span>'+d("overview.timeline.preheatAbsorption"),t.appendChild(o)}var Xl=O({tag:"zone-state-timeline",render:ts,onMount(t,e){let o=e.querySelector(".tl-body"),a=e.querySelector(".timeline-legend");fn(a);function r(){let n=R("zoneStateHistory"),s=(()=>{let u=R&&R("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!n||!n.entries||n.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent=d("overview.timeline.noHistory"),o.appendChild(u);return}let c=os(n,s);c&&o.appendChild(c)}U("zoneStateHistory",r),U("zoneNames",r),k(i.drivers,r);for(let n=1;n<=ye;n++)k(b.enabled(n),r),k(b.state(n),r),k(b.temp(n),r),k(b.setpoint(n),r),k(b.preheatAdvance(n),r);M(e),r()}});var ns=`
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
`;I("zone-grid",ns);var rs=()=>'<div class="zone-grid" aria-label="Zones"></div>',ec=O({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:rs,onMount(t,e){for(let o=1;o<=6;o++)e.appendChild(oe("zone-card",{zone:o,selection:t.selection,navigate:t.navigate}))}});var ss=`
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
`;I("zone-card",ss);var is=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${_e(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${Ie(t.zone)}</div>
		<div class="zc-friendly"${ut(t.zone)?" hidden":""}>${ut(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,lc=O({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:is,onMount(t,e){let o=t.zone,a=b.temp(o),r=b.state(o),n=b.enabled(o),s=e.querySelector(".zc-state-label"),c=e.querySelector(".zc-zone-name"),u=e.querySelector(".zc-friendly"),m=e.querySelector(".zc-temp"),l=e.querySelector(".zc-target"),g=e.querySelector(".zc-valve-value");function p(){var D;let h=de(n),z=String(S(r)||"").toUpperCase()||"OFF",v=String(S(b.motorLastFault(o))||"").toUpperCase(),y=v&&v!=="NONE"&&v!=="OK",T=h&&(z==="FAULT"||y)?"FAULT":z,w=t.selection&&R("selectedZone")===o,A=ut(o);c.innerHTML=Ie(o),u.textContent=A?"":"---",u.hidden=!!A,e.setAttribute("aria-label",_e(o)),m.textContent=me(_(a)),l.textContent=d("zone.card.setpoint",{value:me((D=_(b.effectiveSetpoint(o)))!=null?D:_(b.setpoint(o)))}),g.textContent=bt(_(b.valve(o)));let E=h?T:"OFF";s.textContent=E==="HEATING"?d("state.heating"):E==="IDLE"?d("state.idle"):E==="FAULT"?d("common.fault"):E==="MANUAL"?d("state.manual"):E==="OVERHEATED"?d("state.overheated"):E==="CALIBRATING"?d("state.calibrating"):d("state.off"),e.title=y?d("zone.card.fault",{fault:v}):"",e.classList.toggle("active",w),w?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${c.textContent}, ${m.textContent}, ${l.textContent}, ${s.textContent}. Open details.`),e.classList.toggle("disabled",!h),e.classList.toggle("zs-heating",h&&E==="HEATING"),e.classList.toggle("zs-fault",h&&E==="FAULT"),e.classList.toggle("zs-idle",h&&E==="IDLE"),e.classList.toggle("zs-off",!h||E==="OFF")}function f(){Ut(o),t.navigate&&Oe("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:o}}))}e.addEventListener("click",f),k(a,p),k(b.setpoint(o),p),k(b.effectiveSetpoint(o),p),k(b.valve(o),p),k(r,p),k(n,p),k(b.motorLastFault(o),p),U("selectedZone",p),U("zoneNames",p),p()}});var ls=`
.zone-detail{height:auto;padding:0;background:transparent;border:1px solid var(--separator);border-radius:10px;box-shadow:none;overflow:hidden}
.zone-detail .zd-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:var(--control-height,44px);margin:0;padding:8px 16px;border-bottom:1px solid var(--separator)}
.zone-detail .zd-title{color:var(--text-strong);font-size:1rem;font-weight:650}
.zone-detail .zd-head-ctrl{display:flex;align-items:center;gap:10px}
.zone-detail .zd-badge{padding:4px 9px;border:0;border-radius:999px;background:rgba(139,148,163,.12);color:var(--state-disabled);font-size:.72rem;font-weight:650}
.zone-detail .zd-badge.badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}.zone-detail .zd-badge.badge-idle{background:rgba(139,148,163,.12);color:var(--text-muted)}.zone-detail .zd-badge.badge-fault{background:rgba(239,68,68,.12);color:var(--state-danger)}
.zone-detail .zd-body>div:first-child{padding:14px 16px 12px}
.zone-detail .zd-kicker{margin:0 0 7px;color:var(--text-muted);font-size:.76rem;font-weight:600}
.zone-detail .zd-target-row{display:inline-flex;align-items:center;gap:12px;width:max-content}
.zone-detail .zd-setpoint-field{display:flex;align-items:baseline;justify-content:center;gap:2px;min-width:5.75rem;padding:0 2px}
.zone-detail .zd-setpoint{box-sizing:border-box;width:4.5ch;margin:0;padding:0;border:0;border-radius:0;background:transparent;color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;text-align:center;caret-color:var(--accent);outline:none;-moz-appearance:textfield}
.zone-detail .zd-setpoint::-webkit-outer-spin-button,.zone-detail .zd-setpoint::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.zone-detail .zd-setpoint:focus{box-shadow:inset 0 -2px 0 var(--accent)}
.zone-detail .zd-setpoint-unit{color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;line-height:1;pointer-events:none;user-select:none}
.zone-detail .spb{display:grid;width:var(--control-height,44px);height:var(--control-height,44px);place-items:center;border:1px solid var(--separator);border-radius:8px;background:var(--control-bg);color:var(--text-strong);font-size:1.1rem;cursor:pointer;flex:none;box-shadow:none}.zone-detail .spb:hover,.zone-detail .spb:active{background:rgba(var(--accent-rgb),.12);color:var(--accent)}
.zone-detail .zd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:0;padding:0 16px 14px}.zone-detail .zd-stat{min-width:0;padding:0 12px;border-left:1px solid var(--separator)}.zone-detail .zd-stat:first-child{padding-left:0;border-left:0}.zone-detail .zd-stat-label{color:var(--text-faint);font-size:.7rem;font-weight:600}.zone-detail .zd-stat-value{margin-top:4px;color:var(--text-strong);font-family:var(--font-display);font-size:1.08rem;font-weight:650;font-variant-numeric:tabular-nums}
@media(max-width:560px){.zone-detail .zd-stats{grid-template-columns:1fr 1fr;gap:16px 0}.zone-detail .zd-stat:nth-child(odd){padding-left:0;border-left:0}}
`;I("zone-detail",ls);var cs=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    <div class="zd-head">
      <div class="zd-title" data-i18n="zone.detail.title">Control</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" data-i18n-label="zone.detail.enabled" data-i18n-title="zone.detail.enabled" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker" data-i18n="zone.detail.setpoint">Setpoint</div>
        <div class="zd-target-row">
          <button type="button" class="spb btn-dec" data-i18n-label="common.decrease" aria-label="decrease">\u2212</button>
          <label class="zd-setpoint-field">
            <input class="zd-setpoint" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" spellcheck="false" size="4" data-i18n-label="zone.detail.setpoint" aria-label="Setpoint" />
            <span class="zd-setpoint-unit" aria-hidden="true">\xB0C</span>
          </label>
          <button type="button" class="spb btn-inc" data-i18n-label="common.increase" aria-label="increase">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.currentTemp">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Local fallback</div><div class="zd-stat-value zd-base">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Touch offset</div><div class="zd-stat-value zd-offset">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.returnTemp">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.flowPct">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
    </div>
  </div>
`,yn=5,wn=35,fo=.5;function xt(t){return t==null||Number.isNaN(Number(t))?"":(Math.round(Number(t)*10)/10).toFixed(1)}function ds(t){if(t==null)return null;let e=String(t).trim().replace(",",".").replace(/[^\d.+-]/g,"");if(!e)return null;let o=Number(e);if(!Number.isFinite(o))return null;let a=Math.round(o/fo)*fo;return Math.min(wn,Math.max(yn,Number(a.toFixed(1))))}function ps(t){let e=Number(_(b.setpoint(t)));return Number.isFinite(e)?e:null}function bo(t){let e=Number(_(b.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function Ge(t){let e=Number(_(b.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let o=ps(t);return o==null?null:Number((o+bo(t)).toFixed(1))}function Tt(t){return Math.min(wn,Math.max(yn,Number(Number(t).toFixed(1))))}function us(t,e){if(!e)return d("common.disabled");let o=String(t||"IDLE").toUpperCase();return o==="HEATING"?d("state.heating"):o==="IDLE"?d("state.idle"):o==="OFF"?d("state.off"):o==="FAULT"?d("common.fault"):o==="MANUAL"?d("state.manual"):o==="OVERHEATED"?d("state.overheated"):o==="CALIBRATING"?d("state.calibrating"):o}var hc=O({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:cs,methods:{update(t,e){var u;let o=R("selectedZone"),a=String(S(b.state(o))||"").toUpperCase(),r=de(b.enabled(o));this.zone=o,t.dataset.zone=String(o),document.activeElement!==e.setpoint&&(e.setpoint.value=xt(Ge(o))),e.base.textContent=me((u=_(b.baseSetpoint(o)))!=null?u:_(b.setpoint(o)));let n=_(b.coordinatorOffset(o));e.offset.textContent=n==null?"---":(n>0?"+":"")+Number(n).toFixed(1)+"\xB0C",e.temp.textContent=me(_(b.temp(o))),e.ret.textContent=me(_("sensor-manifold_return_temperature")),e.valve.textContent=bt(_(b.valve(o)));let s=e.badge;s.textContent=us(a,r);let c=r?a==="HEATING"?"badge-heating":a==="IDLE"?"badge-idle":a==="FAULT"?"badge-fault":"":"badge-disabled";s.className="zd-badge"+(c?" "+c:""),e.toggle.classList.toggle("on",r)},commitSetpoint(t){let e=this.zone,o=ds(t);if(o==null)return null;let a=Tt(o-bo(e));return Qt(e,a),Ge(e)},incSetpoint(){let t=this.zone,e=Ge(t),o=Tt((e==null?20:e)+fo);Qt(t,Tt(o-bo(t)))},decSetpoint(){let t=this.zone,e=Ge(t),o=Tt((e==null?20:e)-fo);Qt(t,Tt(o-bo(t)))},toggleEnabled(){let t=this.zone,e=de(b.enabled(t));La(t,!e)}},onMount(t,e){let o={setpoint:e.querySelector(".zd-setpoint"),temp:e.querySelector(".zd-temp"),base:e.querySelector(".zd-base"),offset:e.querySelector(".zd-offset"),ret:e.querySelector(".zd-ret"),valve:e.querySelector(".zd-valve"),badge:e.querySelector(".zd-badge"),toggle:e.querySelector(".btn-toggle"),inc:e.querySelector(".btn-inc"),dec:e.querySelector(".btn-dec")};o.inc.onclick=()=>t.incSetpoint(),o.dec.onclick=()=>t.decSetpoint(),o.toggle.onclick=()=>t.toggleEnabled();let a=()=>{let s=t.commitSetpoint(o.setpoint.value);o.setpoint.value=s!=null?xt(s):xt(Ge(t.zone))};o.setpoint.addEventListener("keydown",s=>{s.key==="Enter"?(s.preventDefault(),o.setpoint.blur()):s.key==="Escape"?(s.preventDefault(),o.setpoint.value=xt(Ge(t.zone)),o.setpoint.blur()):s.key==="ArrowUp"?(s.preventDefault(),t.incSetpoint(),o.setpoint.value=xt(Ge(t.zone))):s.key==="ArrowDown"&&(s.preventDefault(),t.decSetpoint(),o.setpoint.value=xt(Ge(t.zone)))}),o.setpoint.addEventListener("blur",a),o.setpoint.addEventListener("focus",()=>{requestAnimationFrame(()=>o.setpoint.select())});let r=()=>t.update(e,o),n=s=>{let c=R("selectedZone");(s===b.temp(c)||s===b.setpoint(c)||s===b.baseSetpoint(c)||s===b.effectiveSetpoint(c)||s===b.coordinatorOffset(c)||s===b.valve(c)||s===b.state(c)||s===b.enabled(c))&&r()};for(let s=1;s<=6;s++)k(b.temp(s),n),k(b.setpoint(s),n),k(b.baseSetpoint(s),n),k(b.effectiveSetpoint(s),n),k(b.coordinatorOffset(s),n),k(b.valve(s),n),k(b.state(s),n),k(b.enabled(s),n);k("sensor-manifold_return_temperature",r),U("selectedZone",r),M(e),r()}});var ms=`
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input,
.zone-sensor-card .ext-input {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
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
  transition: border-color .15s ease;
}
.zone-sensor-card .ext-input { font-family: inherit; margin-top: 8px; width: 100%; }
.zone-sensor-card .ble-row .ble-input:focus,
.zone-sensor-card .ext-input:focus {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-color: var(--accent);
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  box-sizing: border-box;
  height: var(--control-height, 44px);
  min-height: var(--control-height, 44px);
  padding: 0 13px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: .82rem;
  font-weight: 700;
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
`;I("zone-sensor-card",ms);var gs=()=>`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature</div>
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
      <div class="zs-row-ext" style="display:none">
        <div class="ui-section" data-i18n="zone.sensor.externalTitle">External (Wi\u2011Fi)</div>
        <div class="ui-note" data-i18n="zone.sensor.externalNote">Bind a stable sensor_id. Producers POST temperatures; zone mapping stays on V6.</div>
        <input class="ext-input zs-sid" maxlength="47" placeholder="AA:BB:CC:DD:EE:FF or entity id" data-i18n-placeholder="zone.sensor.sensorIdPh">
        <input class="ext-input zs-sname" maxlength="23" placeholder="Friendly name (optional)" data-i18n-placeholder="zone.sensor.sensorNamePh">
        <div class="ext-age zs-age"></div>
      </div>
    </div>
  `;function bs(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":t==="External"||t==="EXTERNAL"?"External":"Local Probe"}function fs(t){return t==="BLE Sensor"?"BLE":t==="External"?"External":"Local Probe"}function kn(t,e){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+d("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+d("zone.sensor.bleSource")+'</option><option value="External" data-i18n="zone.sensor.externalSource">'+d("zone.sensor.externalSource")+"</option>";t.innerHTML!==o&&(t.innerHTML=o),t.value=e}var Cc=O({tag:"zone-sensor-card",render:gs,onMount(t,e){let o=e.querySelector(".zs-source"),a=e.querySelector(".zs-ble"),r=e.querySelector(".zs-row-ble"),n=e.querySelector(".zs-row-ext"),s=e.querySelector(".zs-sid"),c=e.querySelector(".zs-sname"),u=e.querySelector(".zs-age"),m=e.querySelector(".zs-scan"),l=e.querySelector(".zs-scan-list"),g=0;function p(){return R("selectedZone")}function f(){let y=o.value;r.style.display=y==="BLE Sensor"?"":"none",n.style.display=y==="External"?"":"none"}let h=ve(e);kn(o,"Local Probe"),h.select(o,{read:()=>bs(String(S(b.tempSource(p()))||"")),commit:y=>Ue(p(),"zone_temp_source",fs(y))}),h.text(a,{read:()=>S(b.ble(p()))||"",commit:y=>gt(p(),"zone_ble_mac",y)}),h.text(s,{read:()=>S(b.sensorId(p()))||"",commit:y=>gt(p(),"zone_sensor_id",y)}),h.text(c,{read:()=>S(b.sensorName(p()))||"",commit:y=>gt(p(),"zone_sensor_name",y)}),o.addEventListener("change",f);function z(){let y=p(),T=Number(_(b.externalAge(y)));if(!Number.isFinite(T)||T<0){u.textContent=d("zone.sensor.noIngestYet");return}let w=Math.round(T/1e3);u.textContent=d("zone.sensor.lastIngestAge",{sec:w})}function v(){let y=p();g!==y?(g=y,l.style.display="none",h.discard()):h.refresh(),f(),z()}return m.addEventListener("click",()=>{m.disabled=!0,m.textContent=d("zone.sensor.scanning"),l.style.display="",l.innerHTML='<div class="scan-msg">'+d("zone.sensor.scanning")+"</div>";let y=new AbortController,T=setTimeout(()=>y.abort(),8e3);fetch("/api/v1/ble-scan",{signal:y.signal}).then(w=>w.json()).then(w=>{clearTimeout(T),m.disabled=!1,m.textContent=d("zone.sensor.scan");let A=w&&w.data&&w.data.sensors||w.sensors||[];if(!A.length){l.innerHTML='<div class="scan-msg">'+d("zone.sensor.noSensors")+"</div>";return}let E=(S(b.ble(p()))||"").toUpperCase();l.innerHTML=A.map(D=>{let q=String(D.mac||"").toUpperCase(),H="";q===E?H='<span class="ble-badge">'+d("zone.sensor.assignedThisZone")+"</span>":D.zone>0&&(H='<span class="ble-badge">'+d("zone.sensor.zoneBadge",{zone:D.zone})+"</span>");let P=Number.isFinite(Number(D.temp_c))?Number(D.temp_c).toFixed(1)+"\xB0C":"\u2014",X=D.name?String(D.name):"";return`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${q}</div>
                <div class="ble-meta">${X?X+" \xB7 ":""}${P} \xB7 ${D.rssi||"?"} dBm ${H}</div>
              </div>
              <button class="btn-assign" data-mac="${q}">${d("zone.sensor.assign")}</button>
            </div>`}).join(""),l.querySelectorAll(".btn-assign").forEach(D=>{D.addEventListener("click",()=>{let q=D.getAttribute("data-mac")||"";a.value=q,a.dispatchEvent(new Event("change",{bubbles:!0})),gt(p(),"zone_ble_mac",q)})})}).catch(w=>{clearTimeout(T),m.disabled=!1,m.textContent=d("zone.sensor.scan");let A=w&&w.name==="AbortError"?d("zone.sensor.scanTimeout"):d("zone.sensor.scanFailed");l.innerHTML='<div class="scan-msg">'+A+"</div>"})}),v(),U(v),k(()=>{})}});var hs=".zone-coordination-card { height: 100%; }";I("zone-coordination-card",hs);var vs=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="zone.sensor.mergeWith">Merge With Zone</span> <span class="ui-sublabel" data-i18n="zone.sensor.mergeHelp">merge into one room - mean temperature, valves open equally</span></span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function zn(t,e){let o=t.value,a='<option value="None" data-i18n="common.none">'+d("common.none")+"</option>";for(let r=1;r<=6;r++)r!==e&&(a+='<option value="Zone '+r+'">'+d("common.zone")+" "+r+"</option>");t.innerHTML=a,t.value=o||"None"}var Rc=O({tag:"zone-coordination-card",render:vs,onMount(t,e){let o=e.querySelector(".zc-sync"),a=0;function r(){return R("selectedZone")}let n=ve(e);n.select(o,{read:()=>S(b.syncTo(r()))||"None",commit:u=>Ue(r(),"zone_sync_to",u)});function s(){let u=r();a!==u?(zn(o,u),a=u,n.discard()):n.refresh()}function c(u){let m=r();(u===b.syncTo(m)||/^select-zone_\d+_sync_to$/.test(u))&&n.refresh()}U("selectedZone",s);for(let u=1;u<=6;u++)k(b.syncTo(u),c);M(e),s()}});var xs=".zone-room-card { height: 100%; }";I("zone-room-card",xs);var ys=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,jc=O({tag:"zone-room-card",render:ys,onMount(t,e){let o=e.querySelector(".zr-friendly");function a(){return R("selectedZone")}let r=ve(e);r.text(o,{read:()=>zt(a())||"",commit:n=>Ta(a(),n)}),U("selectedZone",r.discard),U("zoneNames",r.refresh),M(e),r.refresh()}});var ws=`
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
`;I("zone-actuator-card",ws);function Sn(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function _n(t){return t!=null?Number(t).toFixed(0):"---"}function ks(t){return t!=null?Number(t).toFixed(2)+"C":"---"}var zs=()=>`
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
`,Yc=O({tag:"zone-actuator-card",render:zs,onMount(t,e){var u,m,l;let o=Number(R("selectedZone")||1),a={orip:e.querySelector(".za-orip"),crip:e.querySelector(".za-crip"),ofac:e.querySelector(".za-ofac"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function r(){o=Number(R("selectedZone")||1),a.orip.textContent=_n(_(b.motorOpenRipples(o))),a.crip.textContent=_n(_(b.motorCloseRipples(o))),a.ofac.textContent=Sn(_(b.motorOpenFactor(o))),a.cfac.textContent=Sn(_(b.motorCloseFactor(o))),a.ph.textContent=ks(_(b.preheatAdvance(o)));let g=String(S(b.motorLastFault(o))||"").toUpperCase(),p=g&&g!=="NONE"&&g!=="OK";a.fault.hidden=!p,p&&(a.faultVal.textContent=g)}let n=null;function s(g,p){a.status.textContent=g,a.status.className="za-status show "+(p?"ok":"err"),clearTimeout(n),n=setTimeout(()=>{a.status.classList.remove("show")},4e3)}function c(g,p){let f=g(o);s(p,!0),f&&typeof f.then=="function"&&f.then(h=>{h&&h.ok===!1&&s(d("diagnostics.recovery.rejected"),!1)}).catch(()=>s(d("diagnostics.recovery.unreachable"),!1))}(u=a.faultBtn)==null||u.addEventListener("click",()=>{c(Pa,"\u2713 "+d("diagnostics.recovery.faultSent",{zone:_e(o)}))}),(m=a.factorsBtn)==null||m.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmFactors",{zone:_e(o)}))&&c(Oa,"\u2713 "+d("diagnostics.recovery.factorsReset",{zone:_e(o)}))}),(l=a.relearnBtn)==null||l.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmRelearn",{zone:_e(o)}))&&c(Ia,"\u2713 "+d("diagnostics.recovery.relearnStarted",{zone:_e(o)}))}),U("selectedZone",r);for(let g=1;g<=6;g++)k(b.motorOpenRipples(g),r),k(b.motorCloseRipples(g),r),k(b.motorOpenFactor(g),r),k(b.motorCloseFactor(g),r),k(b.preheatAdvance(g),r),k(b.motorLastFault(g),r);M(e),r()}});var Re=6,Ss="var(--flow-disabled)",Ln="var(--flow-unknown)",An="var(--accent)",Ft="var(--flow-return)",Go="var(--text-strong)",_s="var(--flow-disabled)",rt="var(--flow-label)",ho="var(--flow-disabled)",Ko="var(--flow-label)",Mn="var(--flow-label)",Cn="var(--flow-return)",Cs="#66BB6A",Ls="#FF6361",ae={w:1160,h:372,boxX:440,boxY:26,boxW:280,boxH:90,srcY:116,fanY:168,zoneY:262,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},$={w:760,h:424,boxX:26,boxY:148,boxW:168,boxH:92,srcX:196,endX:386,nameX:446,midY:190,zoneYs:[56,120,184,248,312,376],spread:10,bgDstHW:15,srcHW:4},As=`
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
`;I("flow-diagram",As);function Ms(t,e){let o=String(zt(t)||"").trim();if(!o)return"";let a=o.toUpperCase();return a.length>e?a.slice(0,Math.max(1,e-1))+"\u2026":a}function Es(t){if(!t)return null;let e=String(t).match(/(\d+)/);if(!e)return null;let o=Number(e[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Ts(t,e){return e?t==null||Number.isNaN(t)?Ln:t>0?An:rt:Ss}function En(t){let e=t==="desktop"?"0 1":"1 0",o=[];o.push("<defs>");for(let a=1;a<=Re;a++)o.push('<linearGradient id="'+t+"-rg"+a+'" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'">'),o.push('<stop id="'+t+"-rgs"+a+'" offset="0%" stop-color="var(--accent)" stop-opacity=".96"/>'),o.push('<stop id="'+t+"-rga"+a+'" offset="100%" stop-color="var(--accent)" stop-opacity=".7"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function Fs(t){let e=ae.boxX+ae.boxW/2+(t-2.5)*ae.srcSpread,o=ae.zoneXs[t];return"M"+e.toFixed(1)+" "+ae.srcY+" C"+e.toFixed(1)+" "+ae.fanY+" "+o.toFixed(1)+" "+(ae.fanY+34)+" "+o.toFixed(1)+" "+(ae.zoneY-20)}function Ns(t){let e=$.midY+(t-2.5)*$.spread,o=$.zoneYs[t],a=$.endX-$.srcX;return"M"+$.srcX+" "+e.toFixed(1)+" C"+($.srcX+a*.34)+" "+e.toFixed(1)+" "+($.srcX+a*.7)+" "+o.toFixed(1)+" "+$.endX+" "+o.toFixed(1)}function Tn(t,e,o){let a=ae.boxX+ae.boxW/2+(t-2.5)*ae.srcSpread,r=ae.srcY,n=ae.zoneXs[t],s=ae.zoneY-20,c=ae.fanY,u=ae.fanY+34;return"M"+(a-e).toFixed(1)+" "+r+" C"+(a-e).toFixed(1)+" "+c+" "+(n-o).toFixed(1)+" "+u+" "+(n-o).toFixed(1)+" "+s+" L"+(n+o).toFixed(1)+" "+s+" C"+(n+o).toFixed(1)+" "+u+" "+(a+e).toFixed(1)+" "+c+" "+(a+e).toFixed(1)+" "+r+"Z"}function Fn(t,e,o){let a=$.midY+(t-2.5)*$.spread,r=$.zoneYs[t],n=$.endX-$.srcX,s=$.srcX+n*.34,c=$.srcX+n*.7;return"M"+$.srcX+" "+(a-e).toFixed(1)+" C"+s+" "+(a-e).toFixed(1)+" "+c+" "+(r-o).toFixed(1)+" "+$.endX+" "+(r-o).toFixed(1)+" L"+$.endX+" "+(r+o).toFixed(1)+" C"+c+" "+(r+o).toFixed(1)+" "+s+" "+(a+e).toFixed(1)+" "+$.srcX+" "+(a+e).toFixed(1)+"Z"}function Nn(t,e,o){return'<rect width="'+t+'" height="'+e+'" rx="10" fill="var(--surface-raised)"/>'}function Dn(t){let e=t==="desktop"?ae:$,o=t==="desktop"?e.boxY+34:e.boxY+36,a=t==="desktop"?e.boxY+74:e.boxY+76;return'<rect x="'+e.boxX+'" y="'+e.boxY+'" width="'+e.boxW+'" height="'+e.boxH+'" rx="7" fill="var(--flow-source-bg)" stroke="var(--accent)" stroke-width="2"/><text id="'+t+'-fd-flow-label" x="'+(e.boxX+e.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(t==="desktop"?28:27)+'" font-weight="800" fill="var(--accent)" letter-spacing="2">'+d("overview.flowDiagram.flow")+'</text><text id="'+t+'-fd-flow-temp" class="flow-metric" x="'+(e.boxX+e.boxW/2)+'" y="'+a+'" text-anchor="middle" font-size="'+(t==="desktop"?40:37)+'" fill="var(--text-strong)">---</text>'}function Ds(){let t=[],e=ae.w,o=ae.h,a=ae.zoneY-20;t.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+e+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(En("desktop")),t.push(Nn(e,o,"desktop")),t.push(Dn("desktop")),t.push('<text id="desktop-fd-ret-temp" x="'+(ae.boxX+ae.boxW+24)+'" y="'+(ae.boxY+28)+'" font-size="24" font-weight="800" fill="'+Ft+'" font-family="var(--mono)">'+d("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="desktop-fd-dt-label" x="'+(ae.boxX+ae.boxW+24)+'" y="'+(ae.boxY+54)+'" font-size="19" font-weight="800" fill="'+Mn+'" letter-spacing="1.4">'+d("overview.flowDiagram.dt")+"</text>"),t.push('<text id="desktop-fd-dt" x="'+(ae.boxX+ae.boxW+24)+'" y="'+(ae.boxY+86)+'" class="flow-metric" font-size="34" fill="var(--accent)">---</text>');for(let r=1;r<=Re;r++)t.push('<path id="desktop-fd-track-'+r+'" class="flow-track" d="'+Fs(r-1)+'" opacity=".7"/>');for(let r=1;r<=Re;r++)t.push('<path id="desktop-fd-path-'+r+'" class="flow-ribbon" d="'+Tn(r-1,ae.srcHW,ae.bgDstHW)+'" fill="url(#desktop-rg'+r+')" opacity="1"/>');t.push('<line x1="54" y1="'+a+'" x2="'+(e-54)+'" y2="'+a+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');for(let r=1;r<=Re;r++){let n=ae.zoneXs[r-1];t.push('<g class="flow-zone-hit">'),t.push('<line id="desktop-fd-tick-'+r+'" x1="'+n+'" y1="'+(a-10)+'" x2="'+n+'" y2="'+(a+10)+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="desktop-fd-zn'+r+'" x="'+n+'" y="'+(a-18)+'" text-anchor="middle" font-size="22" fill="'+Go+'" font-weight="800" letter-spacing="1.5">Z'+r+"</text>"),t.push('<text id="desktop-fd-zf'+r+'" x="'+n+'" y="'+(a+30)+'" text-anchor="middle" font-size="17.5" fill="'+rt+'" font-weight="700" letter-spacing=".35">---</text>'),t.push('<text id="desktop-fd-zsp'+r+'" x="'+n+'" y="'+(a+30)+'" text-anchor="middle" font-size="15.5" fill="'+ho+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="desktop-fd-zt'+r+'" x="'+n+'" y="'+(a+60)+'" text-anchor="middle" class="flow-metric" font-size="24" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="desktop-fd-zv'+r+'" x="'+(n-40)+'" y="'+(a+90)+'" text-anchor="middle" class="flow-metric" font-size="20" fill="'+rt+'">---%</text>'),t.push('<text id="desktop-fd-zr'+r+'" x="'+(n+40)+'" y="'+(a+90)+'" text-anchor="middle" class="flow-metric" font-size="20" fill="'+Ft+'">---</text>'),t.push("</g>")}return t.push("</svg>"),t.join("")}function Rs(){let t=[],e=$.w,o=$.h;t.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+e+" "+o+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(En("mobile")),t.push(Nn(e,o,"mobile")),t.push(Dn("mobile"));for(let a=1;a<=Re;a++)t.push('<path id="mobile-fd-track-'+a+'" class="flow-track" d="'+Ns(a-1)+'" opacity=".7"/>');for(let a=1;a<=Re;a++)t.push('<path id="mobile-fd-path-'+a+'" class="flow-ribbon" d="'+Fn(a-1,$.srcHW,$.bgDstHW)+'" fill="url(#mobile-rg'+a+')" opacity="1"/>');t.push('<rect x="'+($.boxX+6)+'" y="'+($.boxY+$.boxH+10)+'" width="'+($.boxW-12)+'" height="84" rx="8" fill="var(--flow-source-bg)" stroke="var(--flow-return)" stroke-opacity=".7"/>'),t.push('<text id="mobile-fd-ret-temp" x="'+($.boxX+$.boxW/2)+'" y="'+($.boxY+$.boxH+36)+'" text-anchor="middle" font-size="21" font-weight="800" fill="'+Ft+'" font-family="var(--mono)">'+d("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="mobile-fd-dt-label" x="'+($.boxX+$.boxW/2)+'" y="'+($.boxY+$.boxH+56)+'" text-anchor="middle" font-size="15.5" font-weight="800" fill="'+Mn+'" letter-spacing=".7">'+d("overview.flowDiagram.dt")+"</text>"),t.push('<text id="mobile-fd-dt" x="'+($.boxX+$.boxW/2)+'" y="'+($.boxY+$.boxH+82)+'" text-anchor="middle" class="flow-metric" font-size="27" fill="var(--accent)">---</text>'),t.push('<line x1="'+$.endX+'" y1="38" x2="'+$.endX+'" y2="'+(o-28)+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>'),t.push('<text id="mobile-fd-temp-head" x="506" y="34" font-size="17" fill="'+Ko+'" font-weight="700" letter-spacing="1">'+d("overview.graph.layers.temp").toUpperCase()+"</text>"),t.push('<text id="mobile-fd-flow-head" x="592" y="34" font-size="17" fill="'+Ko+'" font-weight="700" letter-spacing="1">'+d("overview.flowDiagram.flow")+"</text>"),t.push('<text id="mobile-fd-ret-head" x="678" y="34" font-size="17" fill="'+Ko+'" font-weight="700" letter-spacing="1">'+d("overview.flowDiagram.returnShort")+"</text>");for(let a=1;a<=Re;a++){let r=$.zoneYs[a-1];t.push('<line id="mobile-fd-tick-'+a+'" x1="'+($.endX-10)+'" y1="'+r+'" x2="'+($.endX+10)+'" y2="'+r+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="mobile-fd-zn'+a+'" x="'+($.endX-14)+'" y="'+(r+7)+'" text-anchor="end" font-size="21" fill="'+Go+'" font-weight="800" letter-spacing="1.1">Z'+a+"</text>"),t.push('<text id="mobile-fd-zf'+a+'" x="'+$.nameX+'" y="'+(r-12)+'" text-anchor="middle" font-size="17" fill="'+rt+'" font-weight="700" letter-spacing=".3">---</text>'),t.push('<text id="mobile-fd-zsp'+a+'" x="'+$.nameX+'" y="'+(r+12)+'" text-anchor="middle" font-size="15.5" fill="'+ho+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="mobile-fd-zt'+a+'" x="506" y="'+(r+7)+'" class="flow-metric" font-size="22" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="mobile-fd-zv'+a+'" x="592" y="'+(r+7)+'" class="flow-metric" font-size="22" fill="'+rt+'">---%</text>'),t.push('<text id="mobile-fd-zr'+a+'" x="678" y="'+(r+7)+'" class="flow-metric" font-size="22" fill="'+Ft+'">---</text>')}return t.push("</svg>"),t.join("")}var Ps=()=>'<div class="flow-wrap" role="img" aria-label="'+d("overview.flowDiagram.flow")+'">'+Ds()+Rs()+"</div>";O({tag:"flow-diagram",render:Ps,onMount(t,e){let o=["desktop","mobile"],a={};o.forEach(m=>{a[m]={flowEl:e.querySelector("#"+m+"-fd-flow-temp"),flowLabelEl:e.querySelector("#"+m+"-fd-flow-label"),retEl:e.querySelector("#"+m+"-fd-ret-temp"),dtLabelEl:e.querySelector("#"+m+"-fd-dt-label"),dtEl:e.querySelector("#"+m+"-fd-dt"),zones:new Array(Re+1)};for(let l=1;l<=Re;l++)a[m].zones[l]={textTemp:e.querySelector("#"+m+"-fd-zt"+l),textSetpoint:e.querySelector("#"+m+"-fd-zsp"+l),textFlow:e.querySelector("#"+m+"-fd-zv"+l),textRet:e.querySelector("#"+m+"-fd-zr"+l),label:e.querySelector("#"+m+"-fd-zn"+l),friendly:e.querySelector("#"+m+"-fd-zf"+l),track:e.querySelector("#"+m+"-fd-track-"+l),tick:e.querySelector("#"+m+"-fd-tick-"+l),path:e.querySelector("#"+m+"-fd-path-"+l)}});function r(m,l){m&&(m.textContent=l)}function n(m,l,g,p,f){let h=a[m];r(h.flowLabelEl,d("overview.flowDiagram.flow")),r(h.flowEl,me(l)),r(h.retEl,d("overview.flowDiagram.returnShort")+" "+me(g)),r(h.dtLabelEl,d("overview.flowDiagram.dt")),r(h.dtEl,p==null?"---":p.toFixed(1)+"\xB0C"),h.dtEl&&h.dtEl.setAttribute("fill",f)}function s(){r(e.querySelector("#mobile-fd-temp-head"),d("overview.graph.layers.temp").toUpperCase()),r(e.querySelector("#mobile-fd-flow-head"),d("overview.flowDiagram.flow")),r(e.querySelector("#mobile-fd-ret-head"),d("overview.flowDiagram.returnShort"))}function c(m,l,g){let p=a[m].zones[l];if(!p)return;let{enabled:f,pct:h,temp:z,setpoint:v,valve:y,returnTemp:T,hasReturn:w}=g,A=Ms(l,m==="desktop"?12:11),E=me(z),D=v!=null?me(v):"";r(p.label,"Z"+l),r(p.friendly,m==="desktop"?(A||"---")+(D?" ("+D+")":""):A||"---"),r(p.textTemp,E),r(p.textSetpoint,m==="desktop"?"":D?"("+D+")":""),r(p.textFlow,bt(y)),r(p.textRet,w?me(T):"---"),p.label.setAttribute("fill",f?Go:_s),p.friendly.setAttribute("fill",f?rt:ho),p.textSetpoint.setAttribute("fill",f?rt:ho),p.textFlow.setAttribute("fill",Ts(h,f)),p.textRet.setAttribute("fill",w&&f?Ft:Ln);let q=f&&h!=null&&h>0;p.track.setAttribute("opacity",f?".78":".38"),p.track.setAttribute("stroke-dasharray",f?"none":"5 7"),p.tick.setAttribute("stroke",q?An:"var(--flow-track)"),p.tick.setAttribute("stroke-width",q?"3":"2");let H=p.path;if(!q)H.setAttribute("opacity","0");else{let P=m==="desktop"?ae:$,X=Math.max(2.5,h*P.bgDstHW),se=Math.max(1.3,h*P.srcHW);H.setAttribute("d",m==="desktop"?Tn(l-1,se,X):Fn(l-1,se,X)),H.setAttribute("fill","url(#"+m+"-rg"+l+")"),H.setAttribute("opacity",".96")}}function u(){let m=_(i.flow),l=_(i.ret),g=m!=null&&l!=null?Number(m)-Number(l):null,p=g==null||g<3?Cn:g>8?Ls:Cs;o.forEach(f=>n(f,m,l,g,p));for(let f=1;f<=Re;f++){let h=_(b.temp(f)),z=_(b.setpoint(f)),v=_(b.valve(f)),y=de(b.enabled(f)),T=String(S(b.tempSource(f))||"Local Probe"),w=Es(S(b.probe(f))||""),A=w?_(b.probeTemp(w)):null,E=T!=="Local Probe"&&A!=null&&!Number.isNaN(Number(A)),D=v!=null?Math.max(0,Math.min(100,Number(v)))/100:null,q={enabled:y,pct:D,temp:h,setpoint:z,valve:v,returnTemp:A,hasReturn:E};o.forEach(H=>c(H,f,q))}}k(i.flow,u),k(i.ret,u),U("zoneNames",u);for(let m=1;m<=Re;m++)k(b.temp(m),u),k(b.setpoint(m),u),k(b.valve(m),u),k(b.enabled(m),u),k(b.probe(m),u),k(b.tempSource(m),u);for(let m=1;m<=8;m++)k(b.probeTemp(m),u);s(),u()}});var Os={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},Is=`
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(16px) saturate(1.18);
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
`;I("logs-view",Is);var qs=()=>`
  <div class="logs-view">
    <div class="logs-stream"></div>
    <div class="actions">
      <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
      <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      <button class="btn bottom-btn" type="button" data-i18n="logs.scrollBottom">Scroll to bottom</button>
    </div>
  </div>
`;function Hs(t){let e=Os[t.level]||{label:"?",color:"var(--text-secondary)"},o=Rn(t.tag||""),a=Rn(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+o+'</span><span class="msg">'+a+"</span></div>"}function Rn(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var dd=O({tag:"logs-view",render:qs,onMount(t,e){let o=e.querySelector(".logs-stream"),a=e.querySelector(".pause-btn"),r=e.querySelector(".clear-btn"),n=e.querySelector(".download-btn"),s=e.querySelector(".bottom-btn"),c=!1;function u(){o.scrollTop=o.scrollHeight}function m(){if(c)return;let l=Gt();if(!l||!l.length){o.innerHTML='<div class="logs-empty">'+d("logs.waiting")+"</div>";return}let g=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=l.map(Hs).join(""),g&&u()}a.addEventListener("click",()=>{c=!c,a.textContent=c?d("logs.resume"):d("logs.pause"),a.classList.toggle("on",c),c||m()}),r.addEventListener("click",()=>{ua()}),n.addEventListener("click",()=>{n.disabled=!0,Ka().catch(l=>{console.error("[Logs] download failed:",l),window.alert(d("logs.downloadFailed"))}).finally(()=>{n.disabled=!1})}),s.addEventListener("click",()=>{u()}),U("deviceLog",m),M(e),m()}});var Bs=`
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
.diag-i2c .btn { height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border-radius:8px;border:1px solid var(--control-border);background:var(--control-bg);color:var(--text-strong);font-weight:650;line-height:1.2;cursor:pointer; }
.diag-i2c .btn:hover { background:var(--control-bg-hover);border-color:var(--control-border-hover); }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;I("diag-i2c",Bs);var $s=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,hd=O({tag:"diag-i2c",render:$s,onMount(t,e){let o=e.querySelector("#i2c-result");function a(){o.textContent=R("i2cResult")||d("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Aa()}),U("i2cResult",a),M(e),a()}});var js=`
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
`;I("diag-manual-badge",js);var Vs=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,zd=O({tag:"diag-manual-badge",render:Vs,onMount(t,e){let o=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function a(){let r=!!R("manualMode");o&&o.classList.toggle("on",r)}U("manualMode",a),M(e),a()}});var Us=`
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
`;I("diag-zone-motor",Us);var Zs=t=>{let e=t.zone||R("selectedZone")||1,o="";for(let a=1;a<=6;a++)o+='<option value="'+a+'"'+(a===e?" selected":"")+">"+d("common.zone")+" "+a+"</option>";return`
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
  `},Td=O({tag:"diag-zone-motor-card",render:Zs,onMount(t,e){let o=Number(t.zone||R("selectedZone")||1),a=!!R("manualMode"),r=e.querySelector(".manual-mode-toggle"),n=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),c=e.querySelector(".motor-target-input"),u=e.querySelector(".motor-open-btn"),m=e.querySelector(".motor-close-btn"),l=e.querySelector(".motor-stop-btn"),g=()=>{let z=s.value||String(o),v="";for(let y=1;y<=6;y++)v+='<option value="'+y+'">'+d("common.zone")+" "+y+"</option>";s.innerHTML=v,s.value=z};function p(z){a=!!z,r&&(r.classList.toggle("on",a),r.setAttribute("aria-checked",a?"true":"false")),n&&n.classList.toggle("locked",!a),[s,c,u,m,l].forEach(v=>{v&&(v.disabled=!a)})}function f(){let z=!a;if(p(z),z){Lt(!0);for(let v=1;v<=6;v++)Po(v)}else Lt(!1)}function h(){let z=_(b.motorTarget(o));c&&z!=null?c.value=Number(z).toFixed(0):c&&(c.value="0")}s==null||s.addEventListener("change",()=>{o=Number(s.value||1),h()}),r==null||r.addEventListener("click",f),r==null||r.addEventListener("keydown",z=>{z.key!==" "&&z.key!=="Enter"||(z.preventDefault(),f())});for(let z=1;z<=6;z++)k(b.motorTarget(z),h);h(),p(a),U("manualMode",()=>{p(!!R("manualMode"))}),M(e),c==null||c.addEventListener("change",z=>{if(!a)return;let v=z.target.value;Fa(o,v)}),u==null||u.addEventListener("click",()=>{a&&eo(o,1e4)}),m==null||m.addEventListener("click",()=>{a&&to(o,1e4)}),l==null||l.addEventListener("click",()=>{a&&Po(o)})}});var Nt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function Dt(t){switch(Number(t)){case Nt.CONTACT:return"contact";case Nt.UNDER_LOAD:return"load";case Nt.STOPPING:return"stopping";default:return"free"}}function Yo(t){let e=t||[];for(let o=0;o<e.length;o++){let a=Number(e[o].stroke_phase)||0;if(a===Nt.CONTACT||a===Nt.UNDER_LOAD)return e[o]}return null}function Xe(t,e,o){if(e[o]==null)return null;let a=Number(t[e[o]]);return Number.isFinite(a)?a:null}function Pn(t){let e=String(t||"").split(/\r?\n/).filter(n=>n.trim());if(e.length<2)return[];let o=e[0].split(",").map(n=>n.trim()),a={};for(let n=0;n<o.length;n++)a[o[n]]=n;let r=[];for(let n=1;n<e.length;n++){let s=e[n].split(",");if(s.length<6)continue;let c=u=>Number(s[a[u]]);r.push({t_ms:c("t_ms")||0,motion_count:c("motion_count")||0,current_ma:c("current_ma"),adc_current_raw:Xe(s,a,"adc_current_raw"),drive_on:c("drive_on")===1,direction_open:c("direction_open")===1,armed:c("armed")===1,stroke_phase:c("stroke_phase")||0,tacho_period_us:Xe(s,a,"tacho_period_us"),tacho_amp_raw:Xe(s,a,"tacho_amp_raw"),bemf_raw_a:Xe(s,a,"bemf_raw_a"),bemf_raw_b:Xe(s,a,"bemf_raw_b"),bemf_differential_raw:Xe(s,a,"bemf_differential_raw"),bemf_separation_us:Xe(s,a,"bemf_separation_us"),bemf_valid:a.bemf_valid!=null?c("bemf_valid")===1:null,bemf_moving:a.bemf_moving!=null?c("bemf_moving")===1:null,invalid_bemf_samples:Xe(s,a,"invalid_bemf_samples")})}return r}function Ws(t){let e=0,o=0;for(let a=0;a<t.length;a++)t[a].drive_on&&(t[a].direction_open?e+=1:o+=1);return e>=o?"open":"close"}function Ks(t,e){if(!t.length)return null;let o=t.slice().sort((r,n)=>r-n),a=Math.min(o.length-1,Math.max(0,Math.round((o.length-1)*e)));return o[a]}function Te(t){return Math.round(t*10)/10}function Xo(t,e,o){return Math.min(o,Math.max(e,t))}function Gs(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function On(t){let e=[];if(!t.length)return e;let o=t[0].t_ms,a=t[t.length-1].t_ms;for(let r=o;r+500<=a;r+=500){let n=t.reduce((u,m)=>Math.abs(m.t_ms-r)<Math.abs(u.t_ms-r)?m:u,t[0]),s=t.reduce((u,m)=>Math.abs(m.t_ms-(r+500))<Math.abs(u.t_ms-(r+500))?m:u,t[0]),c=(s.t_ms-n.t_ms)/1e3;c>.2&&e.push({t_ms:r+500,slope:(s.current_ma-n.current_ma)/c})}return e}function Rt(t){let e=t||[],o=[];for(let s=0;s<e.length;s++){let c=e[s],u=c.tacho_period_us!=null?c.tacho_period_us:c.tacho_cadence_us!=null?c.tacho_cadence_us:null;o.push({t_ms:c.t_ms,period_us:u,rate_hz:Gs(u)})}let a=e.filter(s=>s.drive_on&&Number.isFinite(s.current_ma)),r=a.length>=2?a:e.filter(s=>Number.isFinite(s.current_ma)),n=On(r);return{cadence:o,slopes:n,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function In(t,e){let o=e||Ws(t),a=t.filter(L=>L.drive_on&&Number.isFinite(L.current_ma)&&(o==="open"?L.direction_open:!L.direction_open));if(a.length<8)return{direction:o,ok:!1,reason:"too_few_samples"};let r=a[0].t_ms,n=a[a.length-1].t_ms,s=a.filter(L=>L.t_ms>=r+650),c=s.length>12?s:a,u=Math.max(1,n-(c[0]?c[0].t_ms:r)),m=c.filter(L=>L.t_ms<c[0].t_ms+u*.7),l=c.filter(L=>L.t_ms>=c[0].t_ms+u*.8),g=(m.length?m:c).map(L=>L.current_ma),p=(l.length?l:c.slice(-Math.max(4,c.length/8|0))).map(L=>L.current_ma),f=g.reduce((L,ee)=>L+ee,0)/g.length,h=Math.max(...a.map(L=>L.current_ma)),z=Math.max(...p),v=Math.max(0,a[a.length-1].motion_count-a[0].motion_count),y=On(c),T=y.filter(L=>L.t_ms<c[0].t_ms+u*.7).map(L=>L.slope),w=y.filter(L=>L.t_ms>=c[0].t_ms+u*.75).map(L=>L.slope),A=w.length?Math.max(...w):0,E=Ks(T.map(Math.abs),.9)||0,D=o==="close"?.55:.68,q=f>.5?z/f:0,H=Te(Xo(1+D*Math.max(0,q-1),1.25,2.4)),P=Te(Xo(Math.max(E*2.2,A*.42,.4),.4,8)),X=Te(Xo(1+.35*Math.max(0,q-1),1.15,1.8)),se=o==="open"?1.15:null,j=Yo(a);return{direction:o,ok:!0,start_ms:r,end_ms:n,runtime_ms:n-r,mean_ma:Te(f),peak_ma:Te(h),stall_peak_ma:Te(z),ripples:v,max_stall_slope_ma_s:Te(A),travel_slope_ma_s:Te(E),measured_factor:Te(q),suggested_factor:H,suggested_slope:P,suggested_slope_floor:X,suggested_ripple_limit:se,pin_seen:!!j,pin_t_ms:j?j.t_ms:null,pin_motion_count:j?j.motion_count:null,pin_current_ma:j?Te(j.current_ma):null,samples:a}}function qn(t,e){if(!t||!t.ok)return[];let o=t.mean_ma,a=Number(e&&e.factor)||t.suggested_factor;return[{id:"mean",value:o},{id:"threshold",value:Te(o*a)},{id:"suggested",value:Te(o*t.suggested_factor)},{id:"cap",value:100}]}var Pt=920,Ot=200,Hn=56,ne={t:16,r:18,b:32,l:52},Pe=Pt-ne.l-ne.r,wt=Ot-ne.t-ne.b,Jo="var(--accent)",ta="var(--series-cool)",Xs="var(--state-warn)",Ys="var(--state-ok)",Js="var(--state-danger)",vo="var(--state-warn)",Qo="var(--series-cool)",ea="var(--accent)",Qs="var(--state-ok)",Bn={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},$n={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},ei=`
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
`;I("motor-lab-charts",ei);function yt(t,e,o=wt){let a=e.max-e.min||1;return ne.t+o-(t-e.min)/a*o}function xo(t,e,o,a=Ot){t.appendChild(Y("text",{class:"chart-axis-label",x:ne.l,y:a-8},"0 s")),t.appendChild(Y("text",{class:"chart-axis-label",x:ne.l+Pe-48,y:a-8},(o/1e3).toFixed(1)+" s"))}function oa(t,e,o=wt){for(let a=0;a<=4;a++){let r=ne.t+o*a/4;t.appendChild(Y("line",{class:"chart-grid",x1:ne.l,x2:ne.l+Pe,y1:r,y2:r}));let n=e.max-(e.max-e.min)*a/4;t.appendChild(Y("text",{class:"chart-tick",x:8,y:r+4},n.toFixed(0)))}}function ti(t){if(!t.length)return[];let e=[],o=0,a=Number(t[0].stroke_phase)||0;for(let r=1;r<t.length;r++){let n=Number(t[r].stroke_phase)||0;n!==a&&(e.push({phase:a,start:o,end:r-1}),o=r,a=n)}return e.push({phase:a,start:o,end:t.length-1}),e}function oi(t){let e=t.querySelector("defs");return e||(e=Y("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([a,r,n])=>{let s=Y("pattern",{id:a,width:4,height:4,patternUnits:"userSpaceOnUse"});s.appendChild(Y("path",{d:r,stroke:n,"stroke-width":"1",fill:"none"})),e.appendChild(s)}),t.appendChild(e),e)}function It(t,e,o){let a=document.createElement("div");a.className="chart-card",a.setAttribute("role","img"),a.setAttribute("aria-label",d(o||t));let r=document.createElement("div");return r.className="chart-head",r.innerHTML='<span class="chart-title">'+d(t)+'</span><span class="chart-sub">'+e+"</span>",a.appendChild(r),a}function ai(t,e,o){let a=It(e,d(o||"diagnostics.lab.empty"),e),r=document.createElement("div");r.className="lab-empty",r.textContent=d("diagnostics.lab.empty"),a.appendChild(r),t.appendChild(a)}function yo(t,e,o){return t?d("diagnostics.lab.res.live"):o&&o.truncated?d("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?d("diagnostics.lab.res.trace",{direction:d("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):d("diagnostics.lab.res.traceReady")}function ni(t,e,o,a,r,n){if(!n.current&&!n.overlays)return;let s=Rt(e),c=It("diagnostics.lab.chart.current",yo(r,o,s),"diagnostics.lab.chart.currentAria");if(s.truncated){let y=document.createElement("div");y.className="lab-chart-warn",y.textContent=d("diagnostics.lab.res.ringWarn",{n:2e3,s:s.window_ms/1e3}),c.appendChild(y)}if(!e.length){let y=document.createElement("div");y.className="lab-empty",y.textContent=d("diagnostics.lab.empty"),c.appendChild(y),t.appendChild(c);return}let u=e.map(y=>y.current_ma).filter(Number.isFinite),m=(a||[]).map(y=>y.value).filter(Number.isFinite),l=so(u.concat([0,40],m),0,50);l.min=0;let g=e[0].t_ms,p=Math.max(1,e[e.length-1].t_ms-g),f=y=>ne.l+(e[y].t_ms-g)/p*Pe,h=e.map((y,T)=>({x:f(T),y:yt(y.current_ma,l)})),z=Y("svg",{viewBox:"0 0 "+Pt+" "+Ot,role:"img"});if(oa(z,l),xo(z,g,p),n.overlays){let y={mean:ta,threshold:Xs,suggested:Ys,cap:Js};(a||[]).forEach(T=>{let w=yt(T.value,l);z.appendChild(Y("line",{x1:ne.l,x2:ne.l+Pe,y1:w,y2:w,stroke:y[T.id],"stroke-dasharray":T.id==="mean"?"0":"5 4","stroke-width":T.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:T.id==="cap"?".45":".9"}))})}let v=o&&o.ok&&o.pin_seen?{t_ms:o.pin_t_ms,current_ma:o.pin_current_ma,motion_count:o.pin_motion_count,stroke_phase:1}:Yo(e);if(v&&Number.isFinite(v.t_ms)){let y=ne.l+(v.t_ms-g)/p*Pe;z.appendChild(Y("line",{x1:y,x2:y,y1:ne.t,y2:ne.t+wt,stroke:vo,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),z.appendChild(Y("circle",{cx:y,cy:yt(Number(v.current_ma)||0,l),r:4.2,fill:vo,stroke:"var(--bg)","stroke-width":"1.5"})),z.appendChild(Y("text",{class:"chart-tick",x:Math.min(y+6,ne.l+Pe-64),y:ne.t+12,fill:vo},d("diagnostics.lab.pinMark")))}n.current&&z.appendChild(Y("path",{d:ft(h),fill:"none",stroke:Jo,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),c.appendChild(z),t.appendChild(c),ht(z,c,{count:e.length,plotTop:ne.t,plotBottom:ne.t+wt,xAt:f,label:y=>((e[y].t_ms-g)/1e3).toFixed(2)+" s",dots:y=>n.current?[{y:h[y].y,color:Jo}]:[],rows:y=>[{color:Jo,label:d("diagnostics.lab.currentMa"),value:Number(e[y].current_ma).toFixed(1)+" mA"},{color:ta,label:d("diagnostics.lab.motion"),value:String(e[y].motion_count)},{color:vo,label:d("diagnostics.lab.stroke"),value:d("diagnostics.lab.stroke."+Dt(e[y].stroke_phase))}]})}function ri(t,e,o,a){if(!a.phase)return;let r=Rt(e),n=It("diagnostics.lab.chart.phase",yo(o,null,r),"diagnostics.lab.chart.phaseAria");if(!e.length){let p=document.createElement("div");p.className="lab-empty",p.textContent=d("diagnostics.lab.empty"),n.appendChild(p),t.appendChild(n);return}let s=e[0].t_ms,c=Math.max(1,e[e.length-1].t_ms-s),u=Hn+ne.b,m=Y("svg",{viewBox:"0 0 "+Pt+" "+u,class:"lab-phase-strip",role:"img"});oi(m);let l=10,g=Hn-18;ti(e).forEach(p=>{let f=ne.l+(e[p.start].t_ms-s)/c*Pe,h=ne.l+(e[p.end].t_ms-s)/c*Pe,z=Dt(p.phase),v=Math.max(2,h-f);m.appendChild(Y("rect",{x:f,y:l,width:v,height:g,fill:Bn[z]||Bn.free,stroke:"var(--separator)","stroke-width":"1"})),$n[z]&&m.appendChild(Y("rect",{x:f,y:l,width:v,height:g,fill:"url(#"+$n[z]+")",opacity:".55"})),v>54&&m.appendChild(Y("text",{x:f+6,y:l+g/2+3},d("diagnostics.lab.stroke."+z))),m.appendChild(Y("line",{x1:h,x2:h,y1:l,y2:l+g,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),xo(m,s,c,u),n.appendChild(m),t.appendChild(n)}function si(t,e,o,a){if(!a.cadence)return;let r=Rt(e),n=It("diagnostics.lab.chart.cadence",yo(o,null,r),"diagnostics.lab.chart.cadenceAria"),s=r.cadence.map(f=>f.rate_hz).filter(f=>f!=null&&Number.isFinite(f));if(!s.length){let f=document.createElement("div");f.className="lab-empty",f.textContent=d("diagnostics.lab.chart.cadenceEmpty"),n.appendChild(f),t.appendChild(n);return}let c=so(s.concat([0]),0,Math.max(10,...s));c.min=0;let u=e[0].t_ms,m=Math.max(1,e[e.length-1].t_ms-u),l=[],g=[];r.cadence.forEach((f,h)=>{f.rate_hz==null||!Number.isFinite(f.rate_hz)||(l.push({x:ne.l+(f.t_ms-u)/m*Pe,y:yt(f.rate_hz,c)}),g.push(h))});let p=Y("svg",{viewBox:"0 0 "+Pt+" "+Ot,role:"img"});oa(p,c),xo(p,u,m),p.appendChild(Y("path",{d:ft(l),fill:"none",stroke:Qo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),n.appendChild(p),t.appendChild(n),ht(p,n,{count:l.length,plotTop:ne.t,plotBottom:ne.t+wt,xAt:f=>l[f].x,label:f=>((r.cadence[g[f]].t_ms-u)/1e3).toFixed(2)+" s",dots:f=>[{y:l[f].y,color:Qo}],rows:f=>{let h=r.cadence[g[f]];return[{color:Qo,label:d("diagnostics.lab.cadence"),value:h.rate_hz.toFixed(1)+" /s"},{color:ta,label:d("diagnostics.lab.tachoPeriod"),value:Math.round(h.period_us)+" \xB5s"}]}})}function ii(t,e,o,a,r){if(!r.slope)return;let n=Rt(e),s=It("diagnostics.lab.chart.slope",yo(a,o,n),"diagnostics.lab.chart.slopeAria");if(!n.slopes.length){let h=document.createElement("div");h.className="lab-empty",h.textContent=d("diagnostics.lab.chart.slopeEmpty"),s.appendChild(h),t.appendChild(s);return}let c=n.slopes.map(h=>h.slope),u=o&&o.ok?o.suggested_slope:null,m=so(c.concat(u!=null?[u,0]:[0]),-2,8),l=e[0].t_ms,g=Math.max(1,e[e.length-1].t_ms-l),p=n.slopes.map(h=>({x:ne.l+(h.t_ms-l)/g*Pe,y:yt(h.slope,m)})),f=Y("svg",{viewBox:"0 0 "+Pt+" "+Ot,role:"img"});if(oa(f,m),xo(f,l,g),u!=null){let h=yt(u,m);f.appendChild(Y("line",{x1:ne.l,x2:ne.l+Pe,y1:h,y2:h,stroke:Qs,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}f.appendChild(Y("path",{d:ft(p),fill:"none",stroke:ea,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),s.appendChild(f),t.appendChild(s),ht(f,s,{count:p.length,plotTop:ne.t,plotBottom:ne.t+wt,xAt:h=>p[h].x,label:h=>((n.slopes[h].t_ms-l)/1e3).toFixed(2)+" s",dots:h=>[{y:p[h].y,color:ea}],rows:h=>[{color:ea,label:d("diagnostics.lab.slope"),value:n.slopes[h].slope.toFixed(2)+" mA/s"}]})}function Vn(t,e){let o=e&&e.samples||[],a=e&&e.analysis,r=!!(e&&e.live),n=e&&e.overlays,s=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let c=document.createElement("div");c.className="motor-lab-charts";let u=document.createElement("div");return u.className="gw-controls",u.setAttribute("role","toolbar"),u.setAttribute("aria-label",d("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([l,g])=>{let p=document.createElement("button");p.type="button",p.className="gw-toggle"+(s[l]?"":" is-off"),p.dataset.layer=l,p.setAttribute("aria-pressed",s[l]?"true":"false"),p.textContent=d(g),u.appendChild(p)}),c.appendChild(u),o.length?(ni(c,o,a,n,r,s),ri(c,o,r,s),si(c,o,r,s),ii(c,o,a,r,s)):ai(c,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(c),u}var li=250,Un=2e4,qt=["setup","arm","seat","open","close","review"],ci=`
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
`;I("diag-motor-lab",ci);var di=()=>`
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
`;function Zn(t){return t==="open"?{factor:_(i.openThresholdMultiplier),slope:_(i.openSlopeThreshold),floor:_(i.openSlopeCurrentFactor),ripple:_(i.openRippleLimitFactor)}:{factor:_(i.closeThresholdMultiplier),slope:_(i.closeSlopeThreshold),floor:_(i.closeSlopeCurrentFactor)}}function Ht(t){let e=Zn(t.direction),o=t.direction==="open"?"open":"close",a=[{key:o+"_threshold_multiplier",labelKey:t.direction==="open"?"settings.motor.openThreshold":"settings.motor.closeThreshold",current:e.factor,suggested:t.suggested_factor,unit:"x"},{key:o+"_slope_threshold",labelKey:t.direction==="open"?"settings.motor.openSlope":"settings.motor.closeSlope",current:e.slope,suggested:t.suggested_slope,unit:"mA/s"},{key:o+"_slope_current_factor",labelKey:t.direction==="open"?"settings.motor.openSlopeFloor":"settings.motor.closeSlopeFloor",current:e.floor,suggested:t.suggested_slope_floor,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&a.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:e.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),a}function aa(t){return d(t?"common.on":"common.off")}function na(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",invalidSamples:0,tachoRejected:0}}var Wd=O({tag:"diag-motor-lab",render:di,onMount(t,e){let o=Number(R("selectedZone")||1),a="setup",r="idle",n={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},s={open:null,close:null,seat:null},c={samples:[],analysis:null,live:!1},u={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},m=[],l=na(),g=e.querySelector(".lab-step-chip"),p=e.querySelector(".lab-zone-chip"),f=e.querySelector(".lab-banner"),h=e.querySelector(".lab-guide"),z=e.querySelector(".lab-kicker"),v=e.querySelector(".lab-stage h3"),y=e.querySelector(".lab-stage p"),T=e.querySelector(".lab-setup"),w=e.querySelector(".lab-zone"),A=e.querySelector(".lab-phase-label"),E=e.querySelector(".lab-log"),D=e.querySelector(".lab-chart"),q=e.querySelector(".lab-metrics"),H=e.querySelector(".lab-suggest"),P=e.querySelector(".lab-primary"),X=e.querySelector(".lab-secondary"),se=e.querySelector(".lab-estop"),j={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function L(N){return qt.indexOf(N)}function ee(){return _e(o)}function C(){let N=String(o);w.innerHTML=Array.from({length:6},(J,te)=>'<option value="'+(te+1)+'">'+_e(te+1).replace(/</g,"&lt;")+"</option>").join(""),w.value=N,w.setAttribute("aria-label",d("diagnostics.lab.motor")),p.textContent=ee(),p.setAttribute("aria-label",d("diagnostics.lab.motor"))}function F(N,J){let te=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});m.push(te+"  "+d(N,J)),m.length>8&&m.shift(),E.innerHTML=m.map(re=>"<div>"+re+"</div>").join(""),E.scrollTop=E.scrollHeight}function K(N){f.textContent=N||"",f.classList.toggle("show",!!N)}function W(N,J){r=N,A.dataset.kind=J||"",A.textContent=d("diagnostics.lab.phase."+N)}function xe(){let N=Dt(l.stroke);j.current.textContent=l.current==null?"\u2014":l.current.toFixed(1)+" mA",j.mean.textContent=l.mean==null?"\u2014":l.mean.toFixed(1)+" mA",j.peak.textContent=l.peak==null?"\u2014":l.peak.toFixed(1)+" mA",j.slope.textContent=l.slope==null?"\u2014":l.slope.toFixed(1)+" mA/s",j.runtime.textContent=l.runtime?(l.runtime/1e3).toFixed(1)+" s":"\u2014",j.motion.textContent=l.motion?String(l.motion):"\u2014",j.cadence.textContent=l.cadenceHz==null?"\u2014":l.cadenceHz.toFixed(1)+" /s",j.direction.textContent=l.direction,j.drivers.textContent=aa(de(i.drivers)),j.busy.textContent=aa(l.busy),j.armed.textContent=aa(l.armed),j.backend.textContent=l.backend||"\u2014",j.fault.textContent=l.faultCode?String(l.faultCode):d("common.ok"),j.invalid.textContent=String(l.invalidSamples||0),j.tachoRejected.textContent=String(l.tachoRejected||0),j.stroke.textContent=d("diagnostics.lab.stroke."+N),j.stroke.dataset.phase=N,l.pinSeen?(j.pin.textContent=d("diagnostics.lab.pinSeen",{count:l.pinAt}),j.pin.dataset.seen="true"):(j.pin.textContent=d("diagnostics.lab.pinWaiting"),j.pin.dataset.seen="false")}function V(){let N=c.analysis?qn(c.analysis,Zn(c.analysis.direction)):[],J=Vn(D,{samples:c.samples,analysis:c.analysis,live:c.live,overlays:N,visible:u});J&&J.addEventListener("click",te=>{let re=te.target.closest(".gw-toggle");if(!re)return;let G=re.dataset.layer;u[G]=!u[G],Object.keys(u).some(fe=>u[fe])||(u[G]=!0),V()})}function le(N,J,te){c={analysis:N&&N.ok?N:null,samples:J||[],live:!!te},c.analysis&&(l.mean=c.analysis.mean_ma,l.peak=c.analysis.peak_ma,l.slope=c.analysis.max_stall_slope_ma_s),V();let re=[];if(a==="review"?(s.open&&re.push(...Ht(s.open)),s.close&&re.push(...Ht(s.close))):c.analysis&&re.push(...Ht(c.analysis)),!c.analysis&&a!=="review"){q.innerHTML="",H.hidden=!0;return}let G=a==="review"?s.close||s.open:c.analysis;if(!G){q.innerHTML="",H.hidden=!0;return}let ue=G.pin_seen?d("diagnostics.lab.pinMetric",{ms:G.pin_t_ms,count:G.pin_motion_count}):d("diagnostics.lab.pinWaiting"),fe=[[d("diagnostics.lab.mean"),G.mean_ma.toFixed(1)+" mA"],[d("diagnostics.lab.peak"),G.peak_ma.toFixed(1)+" mA"],[d("diagnostics.lab.runtime"),(G.runtime_ms/1e3).toFixed(1)+" s"],[d("diagnostics.lab.ripples"),String(G.ripples)],[d("diagnostics.lab.pin"),ue]];if(a==="review"&&s.open&&s.close){fe[0]=[d("diagnostics.lab.mean"),s.open.mean_ma.toFixed(1)+" / "+s.close.mean_ma.toFixed(1)+" mA"],fe[1]=[d("diagnostics.lab.peak"),s.open.peak_ma.toFixed(1)+" / "+s.close.peak_ma.toFixed(1)+" mA"];let pe=s.close.pin_seen?d("diagnostics.lab.pinMetric",{ms:s.close.pin_t_ms,count:s.close.pin_motion_count}):d("diagnostics.lab.pinWaiting");fe[4]=[d("diagnostics.lab.pin"),pe]}q.innerHTML=fe.map(pe=>'<div class="lab-metric"><span>'+pe[0]+"</span><strong>"+pe[1]+"</strong></div>").join(""),H.querySelector("tbody").innerHTML=re.map(pe=>"<tr><td>"+d(pe.labelKey)+"</td><td>"+Number(pe.current).toFixed(1)+" "+pe.unit+'</td><td class="better">'+Number(pe.suggested).toFixed(1)+" "+pe.unit+"</td></tr>").join(""),H.hidden=!re.length}function ce(){let N=a==="halted",J=N?"setup":a,te=L(J),re=N?"halted":"active";g.dataset.state=re,g.textContent=N?d("diagnostics.lab.halted"):d("diagnostics.lab.stepChip",{step:te+1,total:qt.length,name:d("diagnostics.lab.steps."+J)}),z.textContent=N?d("diagnostics.lab.halted"):d("diagnostics.lab.stepOf",{step:te+1,total:qt.length}),v.textContent=d("diagnostics.lab."+(N?"halt":J)+".title");let G=a==="seat"&&s.seat||a==="open"&&s.open||a==="close"&&s.close,ue=N?"diagnostics.lab.halt.copy":G?"diagnostics.lab."+J+".done":"diagnostics.lab."+J+".copy";y.textContent=d(ue);let fe=a==="setup";h.dataset.setup=fe?"true":"false",T.hidden=!fe,w.disabled=!fe||n.active,p.hidden=fe,p.textContent=ee(),se.dataset.armed=n.active?"true":"false",xe();let pe=n.active,Ce={key:"diagnostics.lab.next",disabled:pe,action:"next"},$e=null;a==="setup"?Ce={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:a==="arm"?Ce={key:"diagnostics.lab.arm.action",disabled:pe,action:"arm"}:a==="seat"?Ce={key:s.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:pe,action:s.seat?"next":"seat"}:a==="open"?Ce={key:s.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:pe,action:s.open?"next":"open"}:a==="close"?Ce={key:s.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:pe,action:s.close?"next":"close"}:a==="review"?(Ce={key:"diagnostics.lab.apply",disabled:!(s.open||s.close),action:"apply"},$e={key:"diagnostics.lab.restart",action:"restart"}):N&&(Ce={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),pe&&(Ce={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!pe&&(a==="seat"||a==="open"||a==="close")&&!s[a==="seat"?"seat":a]&&r==="failed"&&(Ce={key:"diagnostics.lab.retry",disabled:!1,action:a}),!pe&&G&&(a==="seat"||a==="open"||a==="close")&&($e={key:"diagnostics.lab.restart",action:"restart"}),P.dataset.action=Ce.action,P.disabled=!!Ce.disabled,P.textContent=d(Ce.key),$e?(X.hidden=!1,X.dataset.action=$e.action,X.textContent=d($e.key)):(X.hidden=!0,X.dataset.action="")}function ge(){n.timer&&clearInterval(n.timer),n.timer=null}function Fe(N){if(a=N,(N==="arm"||N==="setup")&&K(""),N==="review"){let J=s.close||s.open;le(J,J?J.samples:[],!1),W("done","ok")}else N==="setup"&&le(null,[],!1);ce()}async function ze(){if(!n.active){n.active=!0,W("arming","run"),ce(),F("diagnostics.lab.log.arming",{zone:o});try{if(R("manualMode")||(Ne("manualMode",!0),await Lt(!0),F("diagnostics.lab.log.manual")),n.aborted||(de(i.drivers)||(await Ct(!0),F("diagnostics.lab.log.drivers")),n.aborted))return;l.busy=!1,l.armed=!0,W("armed","ok"),F("diagnostics.lab.log.armed"),n.active=!1,Fe("seat")}catch(N){n.active=!1,W("failed","halt"),F("diagnostics.lab.log.armFailed"),ce()}}}async function Ye(N,J,te){W("analyzing","run"),ce();let re=Pn(N),G=In(re,J),ue=G.ok?G.samples:re;if(te&&(s[te]=G.ok?G:null),le(G,ue,!1),!G.ok)W("failed","halt"),F(te==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),te==="seat"&&(s.seat={short:!0},F("diagnostics.lab.log.seatContinue"));else if(W("done","ok"),F("diagnostics.lab.log.captured",{direction:d("diagnostics.lab.dir."+G.direction),peak:G.peak_ma.toFixed(1)}),G.pin_seen){let fe=l.pinSeen;l.pinSeen=!0,l.pinAt=G.pin_motion_count,l.pinMa=G.pin_current_ma,l.stroke=1,fe||F("diagnostics.lab.log.pinTrace",{count:G.pin_motion_count,ma:G.pin_current_ma.toFixed(1),ms:G.pin_t_ms})}else(te==="close"||te==="seat")&&F("diagnostics.lab.log.pinMissing")}async function lt(N,J){for(let te=0;te<6;te++){if(n.aborted)return;try{W("fetching","run"),ce();let re=await Ra();F("diagnostics.lab.log.trace"),await Ye(re,N,J);return}catch(re){if(re&&re.code==="motor_busy"){await new Promise(G=>setTimeout(G,250));continue}W("failed","halt"),F("diagnostics.lab.log.traceFailed"),le(null,n.live,!0);return}}W("failed","halt")}function He(N){let J=N.map(re=>re.current_ma).filter(Number.isFinite);if(!J.length)return;let te=J.reduce((re,G)=>re+G,0);if(l.mean=Math.round(te/J.length*10)/10,l.peak=Math.round(Math.max(...J)*10)/10,N.length>=2){let re=N[Math.max(0,N.length-3)],G=N[N.length-1],ue=(G.t_ms-re.t_ms)/1e3;ue>.05&&(l.slope=Math.round((G.current_ma-re.current_ma)/ue*10)/10)}}async function Be(N,J){if(!n.active){n={active:!0,aborted:!1,direction:N,timer:null,live:[],started:Date.now()},l=na(),l.direction=d("diagnostics.lab.dir."+N),W("starting","run"),ce(),le(null,[],!0),F("diagnostics.lab.log.starting",{direction:d("diagnostics.lab.dir."+N),zone:o});try{if(N==="open"?await eo(o,1e4):await to(o,1e4),n.aborted)return;W("waiting","run"),ce();let te=!1,re=async()=>{if(!n.aborted)try{let G=await Da(),ue=G&&G.data&&G.data.motor_safety?G.data.motor_safety:{},fe=Number(ue.current_ma),pe=!!ue.motor_busy,Ce=ue.drive_on!=null?!!ue.drive_on:pe;pe&&!te&&(te=!0,W("running","run"),F("diagnostics.lab.log.busy")),l.busy=pe,l.runtime=Date.now()-n.started,l.motion=Number(ue.motion_evidence_count)||l.motion,l.stroke=Number(ue.stroke_phase)||0,l.tachoPeriodUs=Number(ue.tacho_period_us)||l.tachoPeriodUs,l.tachoCadenceUs=Number(ue.tacho_cadence_us)||l.tachoCadenceUs;let $e=l.tachoPeriodUs||l.tachoCadenceUs;l.cadenceHz=$e>0?1e6/$e:null,l.faultCode=Number(ue.fault_code)||0,l.armed=!!ue.armed,l.backend=ue.backend||l.backend,l.invalidSamples=Number(ue.invalid_samples)||0,l.tachoRejected=Number(ue.tacho_rejected)||0,!l.pinSeen&&(l.stroke===1||l.stroke===2)&&(l.pinSeen=!0,l.pinAt=l.motion,l.pinMa=Number.isFinite(fe)?fe:l.current,F("diagnostics.lab.log.pin",{count:l.pinAt,ma:Number(l.pinMa||0).toFixed(1)})),Number.isFinite(fe)&&(l.current=fe,n.live.push({t_ms:Date.now()-n.started,current_ma:fe,motion_count:l.motion,drive_on:Ce,direction_open:N==="open",stroke_phase:l.stroke,tacho_period_us:l.tachoPeriodUs,tacho_cadence_us:l.tachoCadenceUs,armed:l.armed,fault_code:l.faultCode,backend:l.backend}),He(n.live),le(null,n.live,!0)),xe(),(te&&!pe||Date.now()-n.started>Un)&&(ge(),l.busy=!1,te&&F("diagnostics.lab.log.stopped"),n.active=!1,await lt(N,J),ce())}catch(G){Date.now()-n.started>Un&&(ge(),n.active=!1,W("failed","halt"),F("diagnostics.lab.log.traceFailed"),ce())}};n.timer=setInterval(re,li),re()}catch(te){n.active=!1,W("failed","halt"),F("diagnostics.lab.log.startFailed"),ce()}}}function Je(){ge(),n={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},s={open:null,close:null,seat:null},l=na(),m.length=0,E.innerHTML="",K(""),W("idle"),Fe("setup")}async function ct(){n.aborted=!0,n.active=!1,ge(),l.busy=!1,K(d("diagnostics.lab.estopDone")),W("halted","halt"),F("diagnostics.lab.log.estop"),a="halted",ce();try{await Na()}catch(N){}xe()}function zo(){let N=L(a);N<0||N>=qt.length-1||Fe(qt[N+1])}function $t(N){if(N==="start"){F("diagnostics.lab.log.selected",{zone:o}),Fe("arm");return}if(N==="arm")return ze();if(N==="seat")return Be("close","seat");if(N==="open")return Be("open","open");if(N==="close")return Be("close","close");if(N==="next")return zo();if(N==="restart")return Je();if(N==="apply"){let J=[];s.open&&J.push(...Ht(s.open)),s.close&&J.push(...Ht(s.close)),J.forEach(te=>Me(te.key,te.suggested)),W("applied","ok"),F("diagnostics.lab.log.applied"),ce()}}P.addEventListener("click",()=>$t(P.dataset.action)),X.addEventListener("click",()=>$t(X.dataset.action)),se.addEventListener("click",ct),w.addEventListener("change",()=>{o=Number(w.value||1),p.textContent=ee()});function dt(N){N.key==="Escape"&&R("section")==="motorlab"&&(N.preventDefault(),ct())}window.addEventListener("keydown",dt),C(),W("idle"),le(null,[],!1),ce(),k(i.drivers,xe),U("manualMode",xe),U("selectedZone",()=>{a==="setup"&&(o=Number(R("selectedZone")||o),w.value=String(o))}),M(e)}});var pi=`
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
`;I("diag-system-card",pi);var ui=()=>`
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
`,tp=O({tag:"diag-system-card",render:ui,onMount(t,e){let o=e.querySelector('[data-k="cpu0"]'),a=e.querySelector('[data-k="cpu1"]'),r=e.querySelector('[data-k="heap"]'),n=e.querySelector('[data-k="dma"]'),s=e.querySelector('[data-k="largestInternal"]'),c=e.querySelector('[data-k="minInternal"]'),u=e.querySelector('[data-k="psram"]'),m=e.querySelector('[data-k="largestPsram"]'),l=e.querySelector('[data-k="bleAds"]'),g=e.querySelector('[data-k="bleLastAdv"]'),p=e.querySelector('[data-k="bleState"]'),f=e.querySelector('[data-bar="cpu0"]'),h=e.querySelector('[data-bar="cpu1"]'),z=e.querySelector('[data-k="reset"]'),v=(A,E,D)=>{if(D==null||!Number.isFinite(Number(D))){A.textContent="\u2014",A.classList.remove("warn"),E.style.width="0%";return}let q=Math.max(0,Math.min(100,Number(D)));A.textContent=q.toFixed(0)+"%",A.classList.toggle("warn",q>=90),E.style.width=q+"%"},y=(A,E,D)=>{if(E==null||!Number.isFinite(Number(E))){A.textContent="\u2014";return}let q=Number(E);A.textContent=q+" KB",A.classList.toggle("warn",D!=null&&q<D)},T=A=>{if(A==null||!Number.isFinite(Number(A))||Number(A)<=0)return"\u2014";let E=Number(A);return E<1e3?Math.round(E)+" ms":E<6e4?(E/1e3).toFixed(1)+" s":Math.round(E/6e4)+" min"},w=()=>{v(o,f,_(i.cpuLoadCore0)),v(a,h,_(i.cpuLoadCore1)),y(r,_(i.freeInternalKb),48),y(n,_(i.freeDmaKb),32),y(s,_(i.largestInternalKb),24),y(c,_(i.minInternalKb),48),y(u,_(i.freePsramKb),null),y(m,_(i.largestPsramKb),null);let A=_(i.bleAdsPerSec);A==null||!Number.isFinite(Number(A))?l.textContent="\u2014":l.textContent=Number(A).toFixed(1)+"/s",g.textContent=T(_(i.bleLastAdvAgeMs));let E=S(i.bleDemanded)==="on",D=S(i.bleHubEnabled)==="on",q=S(i.bleScanning)==="on",H=[];H.push(E?"demanded":"idle"),D?H.push(q?"scanning":"on"):H.push("off"),p.textContent=H.join(" \xB7 ");let P=String(S(i.resetReason)||R("resetReason")||"").trim();z.textContent=P||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{qa().catch(A=>console.error("[System] dump failed:",A))}),k(i.cpuLoadCore0,w),k(i.cpuLoadCore1,w),k(i.freeInternalKb,w),k(i.freeDmaKb,w),k(i.largestInternalKb,w),k(i.minInternalKb,w),k(i.freePsramKb,w),k(i.largestPsramKb,w),k(i.bleAdsPerSec,w),k(i.bleLastAdvAgeMs,w),k(i.bleHubEnabled,w),k(i.bleScanning,w),k(i.bleDemanded,w),k(i.resetReason,w),U("resetReason",w),M(e),w()}});var mi=`
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
`;I("settings-manifold-card",mi);var gi=()=>{let t="";for(let o=1;o<=8;o++)t+="<option>Probe "+o+"</option>";let e="";for(let o=1;o<=8;o++)e+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${he("settings.manifold.help")}</span></div>
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
  `},pp=O({tag:"settings-manifold-card",render:gi,onMount(t,e){let o=e.querySelector(".sm-type"),a=e.querySelector(".sm-flow"),r=e.querySelector(".sm-ret"),n=ve(e);n.select(o,{read:()=>S(i.manifoldType)||"NO (Normally Open)",commit:c=>Ee("manifold_type",c)}),n.select(a,{read:()=>S(i.manifoldFlowProbe)||"Probe 7",commit:c=>Ee("manifold_flow_probe",c)}),n.select(r,{read:()=>S(i.manifoldReturnProbe)||"Probe 8",commit:c=>Ee("manifold_return_probe",c)});function s(){for(let c=1;c<=8;c++){let u=e.querySelector('[data-probe="'+c+'"]');u&&(u.textContent=me(_(b.probeTemp(c))))}}k(i.manifoldType,n.refresh),k(i.manifoldFlowProbe,n.refresh),k(i.manifoldReturnProbe,n.refresh);for(let c=1;c<=8;c++)k(b.probeTemp(c),s);M(e),n.refresh(),s()}});var bi=`
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
`;I("settings-touch-card",bi);var fi=()=>`
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
  </div>`,vp=O({tag:"settings-touch-card",render:fi,onMount(t,e){let o=e.querySelector(".touch-status"),a=e.querySelector(".touch-status-copy"),r=e.querySelector(".touch-identity"),n=e.querySelector(".touch-note"),s=e.querySelector(".touch-error"),c=e.querySelector(".touch-approve"),u=e.querySelector(".touch-disconnect");function m(){let l=de(i.authorityConfigured),g=de(i.authorityProposalPending),p=S(i.authorityState)||"unconfigured",f=g?S(i.authorityProposalInstallationId):S(i.authorityInstallationId),h=g?S(i.authorityProposalCoordinatorId):S(i.authorityCoordinatorId),z=S(i.authorityProposalName)||"Lune Touch",v=S(i.authorityProposalSite)||"House";o.classList.toggle("connected",l&&!g),o.classList.toggle("pending",g),a.innerHTML=g?`<strong>${z} is ready to connect</strong>${l?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:l?`<strong>Control approved</strong>${p.replace(/_/g," ")}${Number(_(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(_(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",r.hidden=!l&&!g,e.querySelector(".touch-name").textContent=g?z:"Lune Touch",e.querySelector(".touch-site").textContent=g?v:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=f||"\u2014",e.querySelector(".touch-coordinator-value").textContent=h||"\u2014",n.textContent=g?"Approval is local to this manifold. Discovery alone never grants control.":l?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",c.hidden=!g,u.hidden=!l||g}c.addEventListener("click",async()=>{s.textContent="",c.disabled=!0,c.textContent="Approving\u2026";try{await Ma()}catch(l){s.textContent=(l==null?void 0:l.message)||"Unable to approve Lune Touch."}finally{c.disabled=!1,c.textContent="Approve Lune Touch"}}),u.addEventListener("click",async()=>{if(s.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){u.disabled=!0;try{await Ea()}catch(l){s.textContent=(l==null?void 0:l.message)||"Unable to disconnect Lune Touch."}finally{u.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(l=>k(l,m)),m()}});var hi=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${he("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`,Cp=O({tag:"settings-minimum-flow-card",render:hi,onMount(t,e){let o=e.querySelector(".smf-always"),a=e.querySelector(".smf-pct"),r=e.querySelector(".smf-pct-row"),n=ve(e),s=c=>{r.hidden=!c,r.setAttribute("aria-hidden",c?"false":"true"),a.disabled=!c};n.toggle(o,{read:()=>de(i.minimumFlowAlways),onChange:s,commit:c=>{let u=c?"on":"off";x(i.minimumFlowAlways,{state:u}),Ee("minimum_flow_always",u).catch(()=>x(i.minimumFlowAlways,{state:c?"off":"on"}))}}),n.num(a,{read:()=>_(i.minZoneFlowPct),commit:c=>{x(i.minZoneFlowPct,{value:c}),Me("min_zone_flow_pct",c)}}),k(i.minimumFlowAlways,n.refresh),k(i.minZoneFlowPct,n.refresh),M(e),n.refresh()}});var vi=`
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
`;I("settings-return-temp-card",vi);function st(t){return!!(t&&t!=="None")}function xi(t){return"Probe "+t}function yi(){for(let t=1;t<=6;t++)if(st(S(b.probe(t))))return!0;return!1}function wi(){let t="";for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return t}var ki=()=>{let t=wi(),e="";for(let o=1;o<=6;o++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${o}">
        <span class="ui-label srt-zone-label" data-zone-label="${o}">${Ie(o)}</span>
        <span class="ui-field"><select class="ui-select srt-probe" data-zone="${o}">${t}</select></span>
      </div>`;return`
    <div class="ui-card settings-return-temp-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.returnTemp.title">Return temperature</span>${he("settings.returnTemp.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.returnTemp.enabledSub">Optional return probes for legacy return-temp balancing \u2014 not required for adaptive balancing.</span></span>
        <span class="ui-field"><div class="ui-toggle srt-enabled" role="switch" data-i18n-label="settings.returnTemp.title" aria-label="Enable return temperature probes"></div></span>
      </div>
      <div class="srt-zones">${e}</div>
    </div>
  `},Rp=O({tag:"settings-return-temp-card",render:ki,onMount(t,e){let o=e.querySelector(".srt-enabled"),a=e.querySelector(".srt-zones"),r=Array.from(e.querySelectorAll(".srt-probe")),n=Object.create(null);function s(g){return n[g]||xi(g)}function c(g){a.hidden=!g,a.setAttribute("aria-hidden",g?"false":"true");for(let p of r)p.disabled=!g}function u(){for(let g=1;g<=6;g++){let p=e.querySelector('[data-zone-label="'+g+'"]');p&&(p.innerHTML=Ie(g))}}let m=ve(e),l;for(let g of r){let p=Number(g.dataset.zone);m.select(g,{read:()=>{let f=S(b.probe(p));return st(f)?(n[p]=f,f):s(p)},commit:f=>{!l||!l.staged||(n[p]=f,Ue(p,"zone_probe",f))}})}l=m.toggle(o,{read:()=>yi(),onChange:g=>{if(g)for(let p of r){let f=Number(p.dataset.zone);st(p.value)||(p.value=s(f)),st(p.value)&&(n[f]=p.value)}else for(let p of r){let f=Number(p.dataset.zone);st(p.value)&&(n[f]=p.value)}c(g)},commit:g=>{if(!g){for(let p of r){let f=Number(p.dataset.zone);st(p.value)&&(n[f]=p.value),Ue(f,"zone_probe","None")}return}for(let p of r){let f=Number(p.dataset.zone),h=st(p.value)?p.value:s(f);n[f]=h,Ue(f,"zone_probe",h)}}});for(let g=1;g<=6;g++)k(b.probe(g),m.refresh),k(b.name(g),u);M(e),u(),m.refresh()}});var zi=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function Si(){if(String(S(i.bleClockSyncAdvertising)||"").toLowerCase()==="on")return d("common.clockSyncing");let t=String(S(i.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return d("settings.bleClock.waitingClock");if(t==="ble_busy")return d("settings.bleClock.busy");if(t)return t;let e=Number(_(i.bleClockSyncLastOkS)||0);if(!e)return d("settings.bleClock.never");let o=Math.max(0,Math.round(Date.now()/1e3)-e);if(o<60)return d("common.secondsAgo",{value:o});if(o<3600)return d("common.minutesAgo",{value:Math.round(o/60)});let a=Math.round(o/3600);return d("settings.bleClock.hoursAgo",{value:a})}var _i=()=>`
  <div class="ui-card settings-ble-clock-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.bleClock.title">Room clocks</span>${he("settings.bleClock.help")}</span></div>
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
`,jp=O({tag:"settings-ble-clock-card",render:_i,onMount(t,e){let o=e.querySelector(".sbc-enabled"),a=e.querySelector(".sbc-interval"),r=e.querySelector(".sbc-status"),n=e.querySelector(".sbc-now"),s=ve(e),c=()=>{let m=a.value;a.innerHTML=zi.map(l=>`<option value="${l.value}">${d(l.labelKey)}</option>`).join(""),m&&(a.value=m)},u=()=>{r.textContent=Si()};c(),s.toggle(o,{read:()=>de(i.bleClockSyncEnabled),commit:m=>{let l=m?"on":"off";x(i.bleClockSyncEnabled,{state:l}),Ee("ble_clock_sync_enabled",l).catch(()=>x(i.bleClockSyncEnabled,{state:m?"off":"on"}))}}),s.select(a,{read:()=>String(Math.round(Number(_(i.bleClockSyncIntervalMin))||60)),commit:m=>{let l=Number(m);x(i.bleClockSyncIntervalMin,{value:l}),Me("ble_clock_sync_interval_min",l)}}),n.addEventListener("click",()=>{x(i.bleClockSyncAdvertising,{state:"on"}),u(),Ae("ble_clock_sync_now")}),k(i.bleClockSyncEnabled,s.refresh),k(i.bleClockSyncIntervalMin,s.refresh),k(i.bleClockSyncLastOkS,u),k(i.bleClockSyncLastError,u),k(i.bleClockSyncAdvertising,u),M(e),s.refresh(),u()}});var Ci=`
.settings-card{background:var(--surface-raised);border:1px solid var(--separator);border-radius:10px;padding:18px;box-shadow:none}
.settings-card .card-title{margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--separator);color:var(--text-strong);font-size:.92rem;font-weight:650}
.settings-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;I("settings-control-card",Ci);var Li=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Recovery actions</div>
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,Gp=O({tag:"settings-control-card",render:Li,onMount(t,e){M(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&Ae("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{Ae("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&Ae("restart")})}});var Ai=`
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
`;I("settings-motor-calibration-card",Ai);var wo=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],Mi=()=>{let t="";for(let e=0;e<wo.length;e++){let o=wo[e];if(o.key==="generic_runtime_limit_seconds")continue;let a=Ei(o.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+d(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+a+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${he("settings.motor.help")}</span></div>
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
  `};function Ei(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var nu=O({tag:"settings-motor-calibration-card",render:Mi,onMount(t,e){let o=e.querySelector(".smc-profile"),a=e.querySelector(".smc-safe-runtime"),r=e.querySelector(".mc-drivers-toggle"),n=ve(e);function s(u){if(u==="HmIP VdMot"&&Me("hmip_runtime_limit_seconds",40),u==="Generic"){let m=Number(_(i.genericRuntimeLimitSeconds));(!Number.isFinite(m)||m<=0)&&Me("generic_runtime_limit_seconds",45)}}n.toggle(r,{read:()=>de(i.drivers),commit:u=>Ct(u)}),n.select(o,{read:()=>S(i.motorProfileDefault)||"HmIP VdMot",commit:u=>{Ee("motor_profile_default",u),s(u)}});function c(){let u=S(i.motorProfileDefault)||"HmIP VdMot";a.disabled=u==="HmIP VdMot"}n.num(a,{read:()=>(S(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:_(i.genericRuntimeLimitSeconds),commit:u=>{o.value==="Generic"&&Me("generic_runtime_limit_seconds",u)}});for(let u=0;u<wo.length;u++){let m=wo[u];if(m.key==="generic_runtime_limit_seconds")continue;let l=e.querySelector(".smc-"+m.cls);l&&(n.num(l,{read:()=>_(m.id),commit:g=>Me(m.key,g)}),k(m.id,n.refresh))}k(i.drivers,n.refresh),k(i.motorProfileDefault,()=>{n.refresh(),c()}),k(i.genericRuntimeLimitSeconds,n.refresh),k(i.hmipRuntimeLimitSeconds,n.refresh),M(e),s(S(i.motorProfileDefault)||"HmIP VdMot"),n.refresh(),c()}});var Ti=600*1e3,Wn=600,Fi=`
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
`;I("settings-firmware-card",Fi);var Ni=()=>`
  <div class="ui-card settings-firmware-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.firmware.title">Firmware</span>${he("settings.firmware.help")}</span></div>
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
`;function Kn(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function Bt(t,e){let o=Kn(t);if(!o)return!1;let a=Kn(e);if(!a)return!0;for(let r=0;r<3;r++)if(o[r]!==a[r])return o[r]>a[r];return!1}function Gn(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function Di(t){let e=String(t||"").trim();return e.length<=Wn?e:e.slice(0,Wn).replace(/\s+\S*$/,"")+"\u2026"}function Ri(){let t=document.querySelector(".settings-backup-card");if(!t)return;let e=t.closest("details");e&&(e.open=!0),t.scrollIntoView({behavior:"smooth",block:"center"});let o=t.querySelector(".sbk-save");o&&o.focus({preventScroll:!0})}var mu=O({tag:"settings-firmware-card",render:Ni,onMount(t,e){let o=e.querySelector(".sfw-version"),a=e.querySelector(".sfw-status"),r=e.querySelector(".sfw-check"),n=e.querySelector(".sfw-banner"),s=e.querySelector(".sfw-hop"),c=e.querySelector(".sfw-notes"),u=e.querySelector(".sfw-install"),m=e.querySelector(".sfw-asset"),l=e.querySelector(".sfw-jump"),g=e.querySelector(".sfw-file"),p=e.querySelector(".sfw-choose"),f=e.querySelector(".sfw-upload"),h=e.querySelector(".sfw-filename"),z=e.querySelector(".sfw-progress"),v=z.querySelector("i"),y=e.querySelector(".sfw-upload-status"),T=null,w=!1,A=0,E=!1,D=()=>S(i.firmware)||R("firmwareVersion")||"",q=(L,ee)=>{a.textContent=L||"",a.className="ui-sublabel sfw-status"+(ee?" "+ee:"")},H=()=>{let L=pt.firmware_update;if(!L||L.available!==!0)return null;let ee=String(L.latest||"").trim();return ee?{tag:ee,notes:d("settings.firmware.deviceReported"),asset:Io(ee)}:null},P=()=>{let L=H();return T?L&&Bt(L.tag,T.tag)?L:T:L},X=()=>{o.textContent=D()||d("settings.firmware.unknownVersion")},se=()=>{let L=P(),ee=!!L&&Bt(L.tag,D());if(n.hidden=!ee,!ee){Ne("firmwareUpdateAvailable",null);return}s.innerHTML=Gn(D()||d("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+Gn(L.tag),c.textContent=Di(L.notes)||d("common.noData"),m.href=L.asset.url,m.setAttribute("download",L.asset.name),m.title=L.asset.name,Ne("firmwareUpdateAvailable",{current:D(),latest:L.tag,url:L.asset.url})},j=L=>{w||!L&&A&&Date.now()-A<Ti||(w=!0,A=Date.now(),r.disabled=!0,q(d("settings.firmware.checking")),Promise.resolve(Ha()).catch(()=>{}),ja().then(ee=>{T=ee,se();let C=Bt(ee.tag,D());q(C?d("settings.firmware.availableStatus",{version:ee.tag}):d("settings.firmware.upToDate"),C?null:"ok")}).catch(ee=>{T=null,se();let C=H();if(C){q(Bt(C.tag,D())?d("settings.firmware.availableStatus",{version:C.tag}):d("settings.firmware.upToDate"),Bt(C.tag,D())?null:"ok");return}if((ee instanceof Ve?ee.code:"network")==="no_releases"){q(d("settings.firmware.noReleases"),"ok");return}q(d("settings.firmware.checkFailed"),"err")}).finally(()=>{w=!1,r.disabled=!1}))};r.addEventListener("click",()=>j(!0)),l.addEventListener("click",Ri),u.addEventListener("click",()=>{let L=P();L&&window.confirm(d("settings.firmware.confirmInstall",{version:L.tag}))&&(u.disabled=!0,u.textContent=d("settings.firmware.installing"),Promise.resolve(Ba()).then(()=>q(d("settings.firmware.installStarted"))).catch(()=>{q(d("settings.firmware.installFailed"),"err"),u.disabled=!1,u.textContent=d("settings.firmware.install")}))}),p.addEventListener("click",()=>g.click()),g.addEventListener("change",()=>{let L=g.files&&g.files[0];h.textContent=L?L.name:d("settings.firmware.noFile"),f.disabled=!L||E,y.textContent="",y.className="ui-note sfw-upload-status"}),f.addEventListener("click",()=>{let L=g.files&&g.files[0];!L||E||window.confirm(d("settings.firmware.confirmUpload",{file:L.name}))&&(E=!0,f.disabled=!0,p.disabled=!0,z.hidden=!1,v.style.width="0%",y.className="ui-note sfw-upload-status",y.textContent=d("settings.firmware.uploading",{value:0}),Promise.resolve($a()).catch(ee=>console.warn("[Firmware] prepare rejected, continuing with upload:",ee)).then(()=>Va(L,ee=>{v.style.width=ee+"%",y.textContent=d("settings.firmware.uploading",{value:ee})})).then(()=>{v.style.width="100%",y.className="ui-note sfw-upload-status",y.textContent=d("settings.firmware.uploadDone")}).catch(ee=>{console.error("[Firmware] upload failed:",ee),z.hidden=!0,y.textContent=d("settings.firmware.uploadFailed")}).finally(()=>{E=!1,p.disabled=!1,f.disabled=!1}))}),U("section",()=>{R("section")==="settings"&&j(!1)}),k(i.firmware,()=>{X(),se()}),k("firmware_update",se),M(e),X(),R("section")==="settings"&&j(!1)}});var Pi=`
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
`;I("settings-backup-card",Pi);var Oi=()=>`
  <div class="ui-card settings-backup-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.backup.title">Backup and restore</span>${he("settings.backup.help")}</span></div>
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
`,yu=O({tag:"settings-backup-card",render:Oi,onMount(t,e){let o=e.querySelector(".sbk-save"),a=e.querySelector(".sbk-learned"),r=e.querySelector(".sbk-file"),n=e.querySelector(".sbk-choose"),s=e.querySelector(".sbk-restore"),c=e.querySelector(".sbk-filename"),u=e.querySelector(".sbk-status"),m=e.querySelector(".sbk-result"),l=!0,g=!1,p=(f,h)=>{u.textContent=f||"",u.className="sbk-status"+(h?" "+h:"")};a.addEventListener("click",()=>{l=!l,a.classList.toggle("on",l),a.setAttribute("aria-checked",l?"true":"false")}),o.addEventListener("click",()=>{g||(g=!0,o.disabled=!0,m.textContent="",p(d("settings.backup.saving")),Ua(!0).then(f=>{if(!oo(f))throw new Error("unexpected_export_payload");p(d("settings.backup.saved",{file:Wa(f)}),"ok")}).catch(f=>{console.error("[Backup] export failed:",f),p(d("settings.backup.saveFailed"),"err")}).finally(()=>{g=!1,o.disabled=!1}))}),n.addEventListener("click",()=>r.click()),r.addEventListener("change",()=>{let f=r.files&&r.files[0];c.textContent=f?f.name:d("settings.backup.noFile"),s.disabled=!f||g,m.textContent="",p("")}),s.addEventListener("click",async()=>{let f=r.files&&r.files[0];if(!f||g)return;let h="";try{h=await f.text()}catch(v){p(d("settings.backup.readFailed"),"err");return}let z=null;try{z=JSON.parse(h)}catch(v){p(d("settings.backup.invalidFile"),"err");return}if(!oo(z)){p(d("settings.backup.invalidFile"),"err");return}window.confirm(d("settings.backup.confirmRestore",{file:f.name}))&&(g=!0,s.disabled=!0,m.textContent="",p(d("settings.backup.restoring")),Za(z,l).then(v=>{p(d("settings.backup.restored"),"ok"),m.textContent=d("settings.backup.result",{applied:v.applied,skipped:v.skipped,ignored:v.ignored})}).catch(v=>{console.error("[Backup] restore failed:",v),p(d("settings.backup.restoreFailed"),"err")}).finally(()=>{g=!1,s.disabled=!1}))}),M(e)}});var it=Object.freeze({refinedEmber:"refined-ember",deepForest:"deep-forest"}),Yn="lune-dashboard-theme",Jn="(prefers-color-scheme: dark)",kt=null,Xn=!1;function Qn(t){return Object.values(it).includes(t)?t:it.refinedEmber}function ko(){try{return Qn(localStorage.getItem(Yn))}catch(t){return it.refinedEmber}}function Ii(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(Jn).matches?"dark":"light"}function qi(){let t=Ii();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,!Xn&&typeof window!="undefined"&&typeof window.matchMedia=="function"){kt=window.matchMedia(Jn);let o=()=>{let a=kt.matches?"dark":"light";e.dataset.colorScheme=a,e.style.colorScheme=a,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:a}))};typeof kt.addEventListener=="function"?kt.addEventListener("change",o):typeof kt.addListener=="function"&&kt.addListener(o),Xn=!0}return t}function ra(t=ko()){let e=Qn(t);if(typeof document=="undefined")return e;qi();let o=document.documentElement;return Object.values(it).forEach(a=>o.classList.remove(`theme-${a}`)),o.classList.add(`theme-${e}`),o.dataset.theme=e,e}function er(t){let e=ra(t);try{localStorage.setItem(Yn,e)}catch(o){}return typeof window!="undefined"&&window.dispatchEvent(new CustomEvent("lune-theme-change",{detail:e})),e}var Hi=[{value:it.refinedEmber,labelKey:"settings.appearance.refinedEmber"},{value:it.deepForest,labelKey:"settings.appearance.deepForest"}],Bi=()=>`
  <div class="ui-card settings-appearance-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.appearance.title">Appearance</span>${he("settings.appearance.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.appearance.accent">Accent</span> <span class="ui-sublabel" data-i18n="settings.appearance.accentSub">Colour used for highlights and selected controls in this browser.</span></span>
      <span class="ui-field"><select class="ui-select sap-theme" data-i18n-label="settings.appearance.accent" aria-label="Accent theme"></select></span>
    </div>
  </div>
`,Lu=O({tag:"settings-appearance-card",render:Bi,onMount(t,e){let o=e.querySelector(".sap-theme"),a=()=>{let r=o.value||ko();o.innerHTML=Hi.map(n=>`<option value="${n.value}">${d(n.labelKey)}</option>`).join(""),o.value=r};a(),o.value=ko(),o.addEventListener("change",()=>er(o.value)),window.addEventListener("lune-theme-change",r=>{r.detail&&(o.value=r.detail)}),M(e)}});var $i=`
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
`;I("smart-preheat-card",$i);var ji=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${he("settings.preheat.help")}</span></div>
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
`,Pu=O({tag:"smart-preheat-card",render:ji,onMount(t,e){let o=e.querySelector(".absorb-toggle"),a=e.querySelector(".absorb-badge"),r=e.querySelector(".absorb-band"),n=e.querySelector(".absorb-delta"),s=e.querySelector(".absorb-body"),c=ve(e),u=l=>{s&&s.classList.toggle("is-disabled",!l)};c.toggle(o,{read:()=>de(i.preheatAbsorbEnabled),onChange:u,commit:l=>{let g=l?"on":"off";x(i.preheatAbsorbEnabled,{state:g}),Ee("preheat_absorb_enabled",g)}}),c.num(r,{read:()=>_(i.preheatAbsorbBandC),commit:l=>{x(i.preheatAbsorbBandC,{value:l}),Me("preheat_absorb_band_c",l)}}),c.num(n,{read:()=>_(i.preheatDetectDeltaC),commit:l=>{x(i.preheatDetectDeltaC,{value:l}),Me("preheat_detect_delta_c",l)}});function m(){let l=String(S(i.preheatAbsorbing)||"").toLowerCase()==="active";a.textContent=l?d("common.active"):d("common.idle"),a.classList.toggle("active",l)}k(i.preheatAbsorbEnabled,c.refresh),k(i.preheatAbsorbing,m),k(i.preheatAbsorbBandC,c.refresh),k(i.preheatDetectDeltaC,c.refresh),M(e),c.refresh(),m()}});var Vi=`
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
`;I("help-external-ingest",Vi);function sa(){return window.location.origin||"http://lune-v6.local"}function ia(){return sessionStorage.getItem("hv6_local_access_key")||"YOUR_LOCAL_ACCESS_KEY"}function Ui(){let t=sa(),e=ia();return`// Shelly script \u2014 POST BTHome temps to Lune V6 (no zone number).
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
`}function Zi(){let t=sa(),e=ia();return`# Home Assistant \u2014 rest_command + automation (no zone in payload).
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
`}function Wi(){let t=sa(),e=ia();return`// HomeyScript \u2014 forward a Homey temperature capability to Lune V6.
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
`}var Ki={shelly:Ui,ha:Zi,homey:Wi},ju=O({tag:"help-external-ingest",render:()=>`
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
  `,onMount(t,e){let o="shelly",a=e.querySelector(".hei-code"),r=e.querySelectorAll(".hei-tab");function n(){r.forEach(s=>s.setAttribute("aria-selected",s.dataset.tab===o?"true":"false")),a.textContent=Ki[o]()}return r.forEach(s=>s.addEventListener("click",()=>{o=s.dataset.tab,n()})),e.querySelector(".hei-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a.textContent||"")}catch(s){}}),n(),M(e),void 0}});function tr(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}ra();var Gi=`
:root { --control-height:44px; --control-width:180px; --bg:#0b0e14; --surface:#131620; --surface-raised:rgba(255,255,255,.035); --text-main:#f2f5f8; --text-strong:#f8fafc; --text-muted:rgba(226,231,240,.62); --text-faint:rgba(207,215,228,.45); --separator:rgba(199,211,232,.105); --separator-soft:rgba(199,211,232,.06); --control-border:rgba(199,211,232,.15); --control-bg:rgba(255,255,255,.045); --accent:#F59E0B; --accent-rgb:245,158,11; --state-ok:#34D399; --state-warn:#F59E0B; --state-danger:#EF4444; --state-disabled:#8b94a3; --focus-ring:rgba(245,158,11,.92); --font-ui:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif; --font-display:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif; --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
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
.content-group{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.content-group + .content-group{margin-top:24px}.group-title{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:58px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--separator)}.group-title-main{min-width:0}.group-title h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.group-title span{display:block;margin-top:2px;color:var(--text-muted);font-size:.78rem}.group-navigation{min-height:var(--control-height);padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.group-navigation:hover{background:rgba(var(--accent-rgb),.10)}.zone-grid{display:grid;grid-template-columns:1fr;gap:0;margin:0}
.zone-id-short{display:inline}.zone-id-long{display:none}@media(min-width:901px){.zone-id-short{display:none}.zone-id-long{display:inline}}.zone-label-compact .zone-id-short{display:inline!important}.zone-label-compact .zone-id-long{display:none!important}.zone-title-id{min-width:0}.zone-title-name{font-weight:500;color:var(--text-faint)}@media(max-width:900px){.zone-label-compact .zone-title-name,.mobile-zone-dock .zone-title-name{display:none}}
.zone-overview{margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-overview-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.zone-overview-card{position:relative;min-width:0;min-height:64px;padding:10px 12px;border:1px solid var(--separator);border-radius:10px;background:var(--surface-raised);color:var(--text-muted);display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:2px;text-align:left;overflow:hidden;font:inherit}.zone-overview-card.is-merged{border-color:color-mix(in srgb,var(--accent) 32%,var(--separator));background:color-mix(in srgb,var(--accent) 5%,var(--surface-raised))}.zone-overview-card.zo-pair-start{border-top-right-radius:4px;border-bottom-right-radius:4px}.zone-overview-card.zo-pair-cont{border-top-left-radius:4px;border-bottom-left-radius:4px;margin-left:-4px;padding-left:14px;border-left-color:color-mix(in srgb,var(--accent) 22%,var(--separator))}.zone-overview-card .zo-status{position:absolute;top:10px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--state-disabled)}.zone-overview-card.zs-heating .zo-status{background:var(--accent)}.zone-overview-card.zs-idle .zo-status,.zone-overview-card.zs-off .zo-status{background:var(--state-disabled)}.zone-overview-card.zs-fault .zo-status{background:var(--state-danger)}.zone-overview-card .zo-title{min-width:0;padding-right:14px;color:var(--text-strong);font-size:.78rem;font-weight:750;letter-spacing:.02em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-title .zone-title-name{font-size:.72rem;font-weight:560;letter-spacing:0;color:var(--text-faint)}.zone-overview-card .zo-temps{min-width:0;padding-right:4px;color:var(--text-muted);font-size:.8125rem;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zone-overview-card .zo-merge{min-width:0;padding-right:4px;color:var(--text-faint);font-size:.68rem;font-weight:600;letter-spacing:.01em;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(min-width:901px){.zone-overview-card{cursor:pointer}.zone-overview-card:hover{color:var(--text-strong);background:color-mix(in srgb,var(--surface-raised) 70%,rgba(255,255,255,.06));border-color:color-mix(in srgb,var(--separator) 60%,rgba(199,211,232,.28))}.zone-overview-card[aria-current="true"]{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 42%,var(--separator));background:rgba(var(--accent-rgb),.12)}.zone-overview-card[aria-current="true"] .zo-title,.zone-overview-card[aria-current="true"] .zo-temps{color:inherit}.zone-overview-card[aria-current="true"] .zo-title .zone-title-name{color:inherit;opacity:.72}.zone-overview-card[aria-current="true"].is-merged{border-color:color-mix(in srgb,var(--accent) 48%,var(--separator));background:rgba(var(--accent-rgb),.14)}.zone-overview-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}}.zone-detail-heading{margin:0 0 14px;padding:2px 0 16px;border-bottom:1px solid var(--separator)}.zone-detail-heading h2{margin:3px 0 0;color:var(--text-strong);font-size:1.35rem;font-weight:700;letter-spacing:-.02em}.zone-detail-heading p{margin:4px 0 0;color:var(--text-muted);font-size:.84rem}.zones-detail-pane{min-width:0}.zone-detail-layout{display:grid;grid-template-columns:1fr;gap:10px}.zone-detail-layout>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}.zone-detail-layout .ui-card,.zone-detail-layout .zone-detail{border:1px solid var(--separator)!important;border-radius:10px!important;background:var(--surface-raised)!important;box-shadow:none!important}
.mobile-zone-dock{display:none}
.mobile-zone-dock .zone-chipstrip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;flex:1;min-width:0;padding:3px;border-radius:11px;background:rgba(255,255,255,.04)}
.mobile-zone-dock .zone-chip{min-width:0;min-height:var(--control-height,44px);padding:0 6px;border:0;border-radius:8px;background:transparent;color:var(--text-muted);font:inherit;font-size:.72rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.mobile-zone-dock .zone-chip:hover{color:var(--text-strong);background:var(--control-bg-hover)}
.mobile-zone-dock .zone-chip[aria-selected="true"]{background:rgba(var(--accent-rgb),.15);color:var(--accent)}
.zone-picker-field{display:none}
.disclosure{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.disclosure + .disclosure{margin-top:8px}.disclosure summary{display:flex;align-items:center;justify-content:space-between;min-height:var(--control-height);padding:10px 18px;color:var(--text-strong);cursor:pointer;list-style:none;font-size:.92rem;font-weight:650}.disclosure summary::-webkit-details-marker{display:none}.disclosure summary::after{content:'\u203A';color:var(--text-muted);font-size:1.35rem;transition:transform .16s ease}.disclosure[open] summary::after{transform:rotate(90deg)}.disclosure summary:focus-visible{outline:3px solid var(--focus-ring);outline-offset:-3px}.disclosure summary small{margin-left:auto;margin-right:18px;color:var(--text-muted);font-size:.78rem;font-weight:400}.disclosure-body{padding:18px;border-top:1px solid var(--separator)}
.overview-details,.settings-layout,.diagnostics-layout{display:grid;gap:8px}.overview-attention,.diagnostics-attention{width:100%;border:0;border-left:3px solid var(--state-warn);border-radius:0;text-align:left;color:inherit;cursor:pointer}.overview-attention:hover,.diagnostics-attention:hover{background:rgba(var(--accent-rgb),.09)}.settings-disclosure>.disclosure-body,.diagnostics-disclosure>.disclosure-body{padding:0 18px 18px}.settings-disclosure .ui-card,.diagnostics-disclosure .ui-card,.diagnostics-disclosure .settings-card,.diagnostics-disclosure .logs-view,.diagnostics-disclosure .diag-zone-motor,.diagnostics-disclosure .connectivity-card,.diagnostics-disclosure .diag-i2c{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}.settings-disclosure .ui-card-title{display:none}.settings-disclosure .ui-row{min-height:var(--control-height)}.settings-disclosure .ui-input,.settings-disclosure .ui-select,.settings-disclosure .ui-btn,.settings-disclosure button,.diagnostics-disclosure button,.diagnostics-disclosure select,.diagnostics-disclosure input{min-height:var(--control-height)}.settings-disclosure .touch-approve{border-color:var(--accent)!important;background:var(--accent)!important;color:var(--text-on-accent)!important}.settings-disclosure .touch-disconnect{background:transparent!important}.diagnostics-disclosure .card-title,.diagnostics-disclosure .ui-card-title{color:var(--text-strong)!important;font-size:.92rem!important;font-weight:650!important;letter-spacing:0!important;text-transform:none!important}.diagnostics-disclosure .logs-stream{height:min(420px,50vh);background:rgba(0,0,0,.14);box-shadow:none}.diagnostics-disclosure.danger-zone{margin-top:20px;border-color:var(--danger-border-soft)}.diagnostics-disclosure.danger-zone>summary{color:var(--danger-text)}
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
.zone-configuration-groups{display:grid;gap:10px;width:100%}.zone-configuration-groups .ui-card{height:auto!important}.zone-configuration-groups .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot{width:100%}.zone-actuator-slot .ui-section{margin-top:16px;color:var(--text-muted);font-size:.78rem;letter-spacing:0;text-transform:none}.zone-actuator-slot .disclosure-body>.ui-section:first-child{margin-top:0}
@media(min-width:901px){.zone-configuration-groups{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"sensor room" "sensor coordination";align-items:stretch}.zone-room-slot{grid-area:room;min-width:0}.zone-sensor-slot{grid-area:sensor;min-width:0;display:flex;flex-direction:column}.zone-coordination-slot{grid-area:coordination;min-width:0}.zone-sensor-slot>.ui-card{flex:1 1 auto;align-self:stretch;height:100%!important}}
@media(max-width:900px){.shell{display:block;padding-bottom:78px}.shell.has-zone-dock{padding-bottom:132px}.main-panel{min-width:0}.side-panel{position:fixed;z-index:40;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:auto;padding:7px;border:1px solid var(--separator);border-radius:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);box-shadow:0 10px 32px rgba(0,0,0,.32);backdrop-filter:blur(22px) saturate(1.3);overflow:visible}.side-brand,.side-subtitle{display:none}.side-nav-slot,.side-nav-slot hv6-sidebar{flex:0 0 auto;min-height:auto}.mobile-zone-dock{display:flex;align-items:center;gap:4px;margin:0 0 6px;padding:0 0 6px;border-bottom:1px solid var(--separator)}.mobile-zone-dock[hidden]{display:none!important}.zone-overview{margin-bottom:16px}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.zone-overview-card{min-height:58px;padding:9px 12px;pointer-events:none;cursor:default}.zone-overview-card.zo-pair-start,.zone-overview-card.zo-pair-cont{border-radius:10px;margin-left:0;padding-left:12px}.zone-overview-card .zo-title{font-size:.78rem}.zone-overview-card .zo-temps{font-size:.78rem}.hdr{padding:9px 14px}.view-panel{width:100%;padding:24px 16px 48px}.status-summary{grid-template-columns:1fr 1fr;gap:16px}.status-summary-main{grid-column:1/-1;padding:0 0 12px;border-bottom:1px solid var(--separator)}.status-fact{padding:0;border:0}.zone-card{grid-template-columns:minmax(120px,1fr) 90px 90px 28px;gap:10px}.zone-card .zc-valve{display:none}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:3}.zone-card::after{grid-column:4}.zone-detail-secondary,.help-list{grid-template-columns:1fr}}
@media(max-width:900px){.overview-dashboard{grid-template-columns:1fr}.dashboard-hydraulic,.dashboard-activity,.dashboard-connection{grid-column:1}.dashboard-connection{padding-left:0;border-left:0}}
@media(max-width:520px){.v6-toolbar h1{font-size:1.15rem}.v6-toolbar p{font-size:.78rem}.v6-toolbar-icon{display:none}.v6-live{font-size:0}.v6-live::before{width:8px;height:8px}.status-summary h2{font-size:1.35rem}.group-title{align-items:center}.group-title span{margin-top:4px}.zone-card{min-height:88px;grid-template-columns:minmax(0,1fr) 82px 28px}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:1;margin-top:51px}.zone-card::after{grid-column:3}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.zone-overview-card{min-height:56px;padding:8px 10px}.zone-overview-card.zo-pair-cont{padding-left:10px}.mobile-zone-dock .zone-chip{font-size:.68rem}}
`;I("hv6-app-root",Gi);var Xi=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand">Lune V6</div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Hydraulic overview</h3><p>Current temperatures, valve demand and active loops.</p></div><span class="hydraulic-summary"></span></div><div class="flow-diagram-slot"></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section><section class="dashboard-section dashboard-connection" aria-labelledby="connection-heading"><div class="dashboard-section-head"><div><h3 id="connection-heading">Connection</h3><p>Touch, network and firmware.</p></div></div><div class="connectivity-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><div class="zone-overview"><div class="zone-overview-strip" role="group" aria-label="Select zone"></div></div><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-layout"><div class="zone-detail-slot"></div><div class="zone-actuator-slot"></div><section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section></div></section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout"><details class="disclosure settings-disclosure touch-settings" open><summary>Touch connection<small>Approval and coordinator identity</small></summary><div class="disclosure-body touch-slot"></div></details><details class="disclosure settings-disclosure"><summary>Manifold and probes<small>Valve type and temperature inputs</small></summary><div class="disclosure-body manifold-slot"></div></details><details class="disclosure settings-disclosure"><summary>Return temperature<small>Optional zone return probes</small></summary><div class="disclosure-body return-temp-slot"></div></details><details class="disclosure settings-disclosure"><summary>Hydraulic safety<small>Minimum active-loop opening</small></summary><div class="disclosure-body minimum-flow-slot"></div></details><details class="disclosure settings-disclosure"><summary>Room clocks<small>Shelly BLU display time</small></summary><div class="disclosure-body ble-clock-slot"></div></details><details class="disclosure settings-disclosure"><summary>Preheat absorption<small>Local handling of external preload</small></summary><div class="disclosure-body preheat-slot"></div></details><details class="disclosure settings-disclosure"><summary>Motor configuration<small>Drivers, profile and learning limits</small></summary><div class="disclosure-body motor-slot"></div></details><details class="disclosure settings-disclosure"><summary>Firmware<small>Version, updates and manual upload</small></summary><div class="disclosure-body firmware-slot"></div></details><details class="disclosure settings-disclosure"><summary>Backup and restore<small>Save or reapply local configuration</small></summary><div class="disclosure-body backup-slot"></div></details><details class="disclosure settings-disclosure"><summary>Appearance<small>Accent colour in this browser</small></summary><div class="disclosure-body appearance-slot"></div></details></div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-external-slot"></div><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;O({tag:"app-root",render:Xi,onMount(t,e){e.querySelector(".hdr").appendChild(oe("hv6-header")),e.querySelector(".side-nav-slot").appendChild(oe("hv6-sidebar")),e.querySelector(".flow-diagram-slot").appendChild(oe("flow-diagram")),e.querySelector(".hydraulic-history-slot").appendChild(oe("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(oe("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(oe("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(oe("zone-detail",{zone:R("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(oe("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(oe("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(oe("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(oe("zone-room-card")),e.querySelector(".touch-slot").appendChild(oe("settings-touch-card")),e.querySelector(".manifold-slot").appendChild(oe("settings-manifold-card")),e.querySelector(".return-temp-slot").appendChild(oe("settings-return-temp-card")),e.querySelector(".minimum-flow-slot").appendChild(oe("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(oe("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(oe("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(oe("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(oe("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(oe("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(oe("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(oe("settings-control-card")),e.querySelector(".manual-control-col").appendChild(oe("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(oe("diag-zone-motor-card",{zone:R("selectedZone")||1}));let o=e.querySelector(".motor-lab-slot"),a=e.querySelector('.sec[data-section="motorlab"]');function r(){let C=tr(S(i.firmware)||R("firmwareVersion")),F=e.querySelector('.v6-side-link[data-section="motorlab"]');F&&(F.hidden=!C),a&&(a.hidden=!C),C&&o&&!o.firstChild&&o.appendChild(oe("diag-motor-lab")),!C&&R("section")==="motorlab"&&Oe("diagnostics")}k(i.firmware,r),U("firmwareVersion",r),U("section",r),r(),e.querySelector(".logs-main-col").appendChild(oe("logs-view")),e.querySelector(".system-health-slot").appendChild(oe("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(oe("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(oe("diag-i2c"));let n=e.querySelector(".help-external-slot");n&&n.appendChild(oe("help-external-ingest"));let s=e.querySelectorAll(".sec"),c=e.querySelector(".shell"),u=e.querySelector(".zone-detail-view"),m=e.querySelector(".selected-zone-title"),l=e.querySelector(".zone-overview-strip"),g=e.querySelector(".mobile-zone-dock"),p=e.querySelector(".mobile-zone-dock .zone-chipstrip");function f(C){let F=de(b.enabled(C)),K=String(S(b.state(C))||"").toUpperCase()||"OFF",W=String(S(b.motorLastFault(C))||"").toUpperCase();return F?F&&(K==="FAULT"||W&&W!=="NONE"&&W!=="OK")?"FAULT":K:"OFF"}function h(C){return C==="HEATING"?d("state.heating"):C==="IDLE"?d("state.idle"):C==="FAULT"?d("common.fault"):C==="MANUAL"?d("state.manual"):C==="OVERHEATED"?d("state.overheated"):C==="CALIBRATING"?d("state.calibrating"):d("state.off")}function z(C){return C==="HEATING"||C==="CALLING"?"zs-heating":C==="FAULT"?"zs-fault":C==="IDLE"?"zs-idle":"zs-off"}function v(C){let F=String(C||"").trim();if(!F||/^none$/i.test(F)||F==="0"||F==="-1")return 0;let K=F.match(/(\d+)/),W=K?Number(K[1]):0;return W>=1&&W<=6?W:0}function y(){var xe;let C=[0,0,0,0,0,0,0];for(let V=1;V<=6;V++)C[V]=v(S(b.syncTo(V)));let F=[0,0,0,0,0,0,0];for(let V=1;V<=6;V++){let le=V;for(let ce=0;ce<6;ce++){let ge=C[le];if(!ge||ge<1||ge>6)break;if(ge===V){le=V;break}le=ge}F[V]=le}let K={};for(let V=1;V<=6;V++)(K[xe=F[V]]||(K[xe]=[])).push(V);let W=[[],[],[],[],[],[],[]];for(let V=1;V<=6;V++){let le=K[F[V]]||[V],ce=le.length>1&&le.some(ge=>C[ge]>0);W[V]=ce?le.filter(ge=>ge!==V):[]}return{roots:F,partners:W}}function T(){return window.matchMedia("(min-width: 901px)").matches}function w(){let C=y(),F=R("selectedZone")||1,K=T();l.setAttribute("role",K?"group":"list"),l.setAttribute("aria-label",K?"Select zone":"Zone status overview"),l.innerHTML=Array.from({length:6},(W,xe)=>{var te;let V=xe+1,le=V===F,ce=_e(V),ge=Ie(V),Fe=me(_(b.temp(V))),ze=me((te=_(b.effectiveSetpoint(V)))!=null?te:_(b.setpoint(V))),Ye=f(V),lt=h(Ye),He=z(Ye),Be=C.partners[V],Je=Be.length>0,ct=Je?d("overview.zone.mergedWith",{zones:Be.map(Mo).join(", ")}):"",zo=Je&&Be.includes(V+1)&&C.roots[V]===C.roots[V+1],$t=Je&&Be.includes(V-1)&&C.roots[V]===C.roots[V-1],dt=[Je?"is-merged":"",zo?"zo-pair-start":"",$t?"zo-pair-cont":""].filter(Boolean).join(" "),N=`${ce}, ${Fe} / ${ze}, ${lt}${ct?", "+ct:""}`.replace(/"/g,"&quot;"),J=Je?`<span class="zo-merge">${ct}</span>`:"";return K?`<button type="button" class="zone-overview-card ${He}${dt?" "+dt:""}" data-zone-select="${V}" aria-current="${le?"true":"false"}" aria-label="${N}" title="${N}" tabindex="${le?"0":"-1"}"><span class="zo-status" aria-hidden="true"></span><span class="zo-title zone-label-compact">${ge}</span><span class="zo-temps">${Fe} / ${ze}</span>${J}</button>`:`<div class="zone-overview-card ${He}${dt?" "+dt:""}" role="listitem" aria-label="${N}" title="${N}"><span class="zo-status" aria-hidden="true"></span><span class="zo-title zone-label-compact">${ge}</span><span class="zo-temps">${Fe} / ${ze}</span>${J}</div>`}).join("")}function A(){let C=R("selectedZone")||1;p.innerHTML=Array.from({length:6},(F,K)=>{let W=K+1,xe=W===C,V=_e(W),le=Ie(W),ce=V.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${xe}" aria-label="${ce}" title="${ce}" tabindex="${xe?"0":"-1"}" data-zone-select="${W}">${le}</button>`}).join("")}function E(){w(),A()}function D(){let C=R("section")==="zones";g.hidden=!C,g.setAttribute("aria-hidden",C?"false":"true"),c.classList.toggle("has-zone-dock",C)}function q(C){Ut(C)}function H(){let C=R("section")||"overview";s.forEach(F=>F.classList.toggle("active",F.dataset.section===C)),X()}function P(){let C=[],F=0,K=0;for(let ze=1;ze<=6;ze++){let Ye=String(S(b.enabled(ze))).toLowerCase()==="on",lt=String(S(b.state(ze))).toLowerCase(),He=String(S(b.motorLastFault(ze))).toLowerCase();Ye&&C.push(ze),Ye&&["heating","calling"].includes(lt)&&F++,(lt==="fault"||He!==""&&He!=="none"&&He!=="ok")&&K++}let W=_(i.flow),xe=_(i.ret),V=String(S(i.authorityState)||"").replace(/_/g," "),le=K===0&&R("live"),ce=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${le?"status-ok":R("live")?"status-warn":"status-danger"}">${le?"Operating normally":R("live")?"Needs attention":"Device offline"}</h2><p>${K?K+" zone fault"+(K===1?"":"s")+" require attention.":R("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${F} zones</strong><small>${C.length} enabled</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${me(W)}</strong><small>Return ${me(xe)}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${V||"not connected"}</strong><small>${_(i.authorityLeaseRemainingS)?Math.round(_(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,ge=de(i.authorityConfigured),Fe=String(S(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=ce,e.querySelector(".hydraulic-summary").textContent=`${F} heating \xB7 Flow ${me(W)} \xB7 Return ${me(xe)}`,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${R("live")?"status-ok":"status-danger"}">${R("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${R("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ge?"Approved":"Not approved"}</strong><small>${ge?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Fe}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${K?"status-danger":le?"status-ok":"status-warn"}">${K?K+" issue"+(K===1?"":"s"):le?"Healthy":"Awaiting data"}</h2><p>${K?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${K}</strong><small>${K?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Fe}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${V||"not connected"}</strong><small>${ge?"approved":"local control"}</small></div>`,[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(ze=>{ze.hidden=!K,ze.innerHTML=K?`<strong>Review ${K} zone fault${K===1?"":"s"}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:""})}function X(){let C=R("selectedZone")||1,F=R("section")==="zones";m.innerHTML=Ie(C),E(),D(),u.hidden=!F}function se(C){let F=C.target.closest("[data-zone-select]");F&&q(Number(F.dataset.zoneSelect))}function j(C){T()&&se(C)}function L(C){if(!T()||!["ArrowLeft","ArrowRight","Home","End"].includes(C.key))return;C.preventDefault();let F=R("selectedZone")||1,K=C.key==="Home"?1:C.key==="End"?6:C.key==="ArrowLeft"?F===1?6:F-1:F===6?1:F+1;q(K),requestAnimationFrame(()=>{var W;return(W=l.querySelector(`[data-zone-select="${K}"]`))==null?void 0:W.focus()})}function ee(C){if(!["ArrowLeft","ArrowRight","Home","End"].includes(C.key))return;C.preventDefault();let F=R("selectedZone")||1,K=C.key==="Home"?1:C.key==="End"?6:C.key==="ArrowLeft"?F===1?6:F-1:F===6?1:F+1;q(K),requestAnimationFrame(()=>{var W;return(W=p.querySelector(`[data-zone-select="${K}"]`))==null?void 0:W.focus()})}l.addEventListener("click",j),l.addEventListener("keydown",L),window.matchMedia("(min-width: 901px)").addEventListener("change",w),p.addEventListener("click",se),p.addEventListener("keydown",ee),e.querySelectorAll("[data-open-zones]").forEach(C=>C.addEventListener("click",()=>Oe("zones"))),e.querySelectorAll("[data-help-section]").forEach(C=>C.addEventListener("click",F=>{F.preventDefault(),Oe(C.dataset.helpSection)})),U("section",H),U("selectedZone",X),U("live",P),U("zoneNames",()=>{E(),P()});for(let C=1;C<=6;C++)[b.temp(C),b.setpoint(C),b.effectiveSetpoint(C),b.valve(C),b.state(C),b.enabled(C),b.motorLastFault(C),b.syncTo(C)].forEach(F=>k(F,()=>{P(),E()}));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(C=>k(C,P)),M(e),H(),X(),P()}});function Yi(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(oe("app-root")),en()}Yi();})();
