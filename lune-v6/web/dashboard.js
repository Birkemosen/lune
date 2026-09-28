(()=>{var Wo={},Da={};function H(t){return Wo[t.tag]=t,t}function de(t,e){let a=Wo[t];if(!a)throw new Error("Component not found: "+t);let n=e||{};if(a.state){let i=a.state(e||{});for(let l in i)n[l]=i[l]}if(a.methods)for(let i in a.methods)n[i]=a.methods[i];let r=document.createElement("div");r.innerHTML=a.render(n);let o=r.firstElementChild;return a.onMount&&queueMicrotask(()=>a.onMount(n,o)),o}function M(t,e){(Da[t]||(Da[t]=[])).push(e)}function Fe(t){let e=Da[t];if(e)for(let a=0;a<e.length;a++)e[a](t)}var g={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",sensorId:t=>"text-zone_"+t+"_sensor_id",sensorName:t=>"text-zone_"+t+"_sensor_name",externalAge:t=>"sensor-zone_"+t+"_external_temp_age_ms",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorWorkingRipples:t=>"sensor-motor_"+t+"_working_ripples",motorPinFreeRipples:t=>"sensor-motor_"+t+"_pin_free_ripples",motorStrokeModel:t=>"text_sensor-motor_"+t+"_stroke_model",motorLearnPct:t=>"sensor-motor_"+t+"_learn_pct",motorLearnPhase:t=>"text_sensor-motor_"+t+"_learn_phase",motorLearnSample:t=>"sensor-motor_"+t+"_learn_sample",motorLearnSamplesNeeded:t=>"sensor-motor_"+t+"_learn_samples_needed",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},s={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",openEndstopCurrentFactor:"number-open_endstop_current_factor",openEndstopStallFraction:"number-open_endstop_stall_fraction",closeTrailingStepMa:"number-close_trailing_step_ma",closeTrailingSustainMs:"number-close_trailing_sustain_ms",closeTrailingRefMs:"number-close_trailing_ref_ms",capCloseSeatMa:"number-cap_close_seat_ma",capCloseSeatFrames:"number-cap_close_seat_frames",capClosePopoffMa:"number-cap_close_popoff_ma",capStallMa:"number-cap_stall_ma",capOpenStopMa:"number-cap_open_stop_ma",capCircuitFaultMa:"number-cap_circuit_fault_ma",closeRuntimeLimitCounts:"number-close_runtime_limit_counts",workingRangeLearning:"number-working_range_learning",learnOpenStartRipples:"number-learn_open_start_ripples",learnOpenStepRipples:"number-learn_open_step_ripples",learnOpenMaxRipples:"number-learn_open_max_ripples",learnMinFreeRipples:"number-learn_min_free_ripples",learnSamples:"number-learn_samples",learnMaxSpreadPct:"number-learn_max_spread_pct",pinEngageStepMa:"number-pin_engage_step_ma",pinEngageMarginRipples:"number-pin_engage_margin_ripples",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",heatingMode:"select-heating_mode",effectiveHeatingMode:"text-effective_heating_mode",heatingModeSource:"text-heating_mode_source",hpOverheatMarginC:"number-hp_overheat_margin_c",hpBasePct:"number-hp_base_pct",hpTrimFloorPct:"number-hp_trim_floor_pct",heatDemandRecommendation:"text-heat_demand_recommendation",heatDemandCriticalZone:"sensor-heat_demand_critical_zone",heatDemandSaturatedS:"sensor-heat_demand_saturated_s",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var Te=6,Ci=28,It=Object.create(null),Li=Ti(),oe={section:"overview",settingsPanel:"touch",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Fi(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Li,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},Ai=300;function Fi(){let t=Object.create(null);for(let e=1;e<=Te;e++)t[e]=[];return t}function Ti(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<Te;)t.push("");return t.slice(0,Te)}function Ei(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(oe.zoneNames))}catch(t){}}function Ne(t){return"$dashboard:"+t}function Ct(t){return Math.max(1,Math.min(Te,Number(t)||1))}function Zo(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let a=t.match(/-?\d+(?:[\.,]\d+)?/);if(a){let n=Number(String(a[0]).replace(",","."));return Number.isNaN(n)?null:n}}return null}function F(t){let e=It[t];return e?e.v!=null?e.v:e.value!=null?e.value:Zo(e.s!=null?e.s:e.state):null}function A(t){let e=It[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function Ni(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function me(t){return Ni(A(t))}function Oa(){return me(s.authorityProposalPending)}function Mn(){let t=0;for(let e=1;e<=Te;e++){let a=String(A(g.state(e))||"").toLowerCase(),n=String(A(g.motorLastFault(e))||"").toLowerCase();(a==="fault"||n&&n!=="none"&&n!=="ok")&&(t+=1)}return t}function Cn(){if(Oa())return{kind:"touch",section:"settings",focus:"touch"};let t=Mn();return t>0?{kind:"faults",section:"zones",count:t}:null}function y(t,e){let a=It[t];a||(a=It[t]={v:null,s:null}),"v"in e&&(a.v=e.v,a.value=e.v),"value"in e&&(a.v=e.value,a.value=e.value),"s"in e&&(a.s=e.s,a.state=e.s),"state"in e&&(a.s=e.state,a.state=e.state);for(let n in e)n==="v"||n==="value"||n==="s"||n==="state"||(a[n]=e[n]);if(Fe(t),t==="text_sensor-firmware_version"&&Ke("firmwareVersion",A(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let n=parseInt(t.slice(10,-5),10);if(n>=1&&n<=Te){let r=A(t)||"";oe.zoneNames[n-1]!==r&&(oe.zoneNames[n-1]=r,Ei(),Fe(Ne("zoneNames")))}}}function K(t,e){M(Ne(t),e)}function R(t){return oe[t]}function Ke(t,e){oe[t]=e,Fe(Ne(t))}function Ve(t){let e=t==="logs"?"diagnostics":t;oe.section!==e&&(oe.section=e,Fe(Ne("section")))}function $a(t){let e=String(t||"touch");oe.settingsPanel!==e&&(oe.settingsPanel=e,Fe(Ne("settingsPanel")))}function Lt(t){let e=Ct(t);oe.selectedZone!==e&&(oe.selectedZone=e,Fe(Ne("selectedZone")))}function gt(t){let e=!!t;oe.live!==e&&(oe.live=e,Fe(Ne("live")))}function Ln(){oe.pendingWrites+=1,Fe(Ne("pendingWrites"))}function Ia(){oe.pendingWrites=Math.max(0,oe.pendingWrites-1),oe.lastWriteAt=Date.now(),Fe(Ne("pendingWrites"))}var Sn=2e3;function An(){return oe.pendingWrites>0?!0:Date.now()-oe.lastWriteAt<Sn}function Go(){if(oe.pendingWrites>0)return Sn;let t=Sn-(Date.now()-oe.lastWriteAt);return t>0?t:0}function Fn(t){return oe.zoneNames[Ct(t)-1]||""}function $e(t){return String(Fn(t)||"").trim()}function Ge(t){return"Z"+Ct(t)}function zn(t){return"Zone "+Ct(t)}function _e(t){let e=Ct(t),a=$e(e);return a?zn(e)+" - "+a:zn(e)}function Ri(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pi(t){let e=Ct(t);return'<span class="zone-id-short">'+Ge(e)+'</span><span class="zone-id-long">'+zn(e)+"</span>"}function bt(t){let e=Ct(t),a=$e(e),n=Pi(e);return a?'<span class="zone-title-id">'+n+'</span><span class="zone-title-name"> - '+Ri(a)+"</span>":'<span class="zone-title-id">'+n+"</span>"}function Ht(t){oe.i2cResult=t||"No scan has been run yet.",Fe(Ne("i2cResult"))}function X(t,e){let a={time:Di(),msg:String(t||"")};for(oe.activityLog.push(a);oe.activityLog.length>60;)oe.activityLog.shift();if(e>=1&&e<=Te){let n=oe.zoneLog[e];for(n.push(a);n.length>8;)n.shift();Fe(Ne("zoneLog:"+e))}Fe(Ne("activityLog"))}function _n(t,e){let a=oe[t];if(!Array.isArray(a))return;let n=Zo(e);if(n!=null){for(a.push(n);a.length>Ci;)a.shift();Fe(Ne(t))}}function ia(t){let e=Date.now();if(!t&&e-oe.lastHistoryAt<3200)return;oe.lastHistoryAt=e;let a=0,n=0;for(let r=1;r<=Te;r++){let o=F("sensor-zone_"+r+"_valve_pct");o!=null&&(a+=o,n+=1)}_n("historyFlow",F("sensor-manifold_flow_temperature")),_n("historyReturn",F("sensor-manifold_return_temperature")),_n("historyDemand",n?a/n:0)}function Di(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function Ha(t){oe.zoneStateHistory=t||null,Fe(Ne("zoneStateHistory"))}function Xo(){return oe.deviceLogSeq}function qa(t,e){if(Array.isArray(t)&&t.length){for(let a of t)oe.deviceLog.push({seq:a[0],level:a[1],tag:a[2],msg:a[3]}),a[0]>oe.deviceLogSeq&&(oe.deviceLogSeq=a[0]);for(;oe.deviceLog.length>Ai;)oe.deviceLog.shift();Fe(Ne("deviceLog"))}typeof e=="number"&&e>oe.deviceLogSeq&&(oe.deviceLogSeq=e-1)}function Ba(){return oe.deviceLog}function Yo(){oe.deviceLog=[],Fe(Ne("deviceLog"))}var ye=6,Oi=8,Jo=null,At=0,ja=1,Qo=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],ar=18*3600+720,nr=Date.now(),la=4200,Q={temp:new Float32Array(ye),setpoint:new Float32Array(ye),valve:new Float32Array(ye),enabled:new Uint8Array(ye),driversEnabled:1,fault:0,manualMode:0},Ie={busy:!1,direction:"open",zone:1,startedAt:0};function $i(){Q.manualMode=0,nr=Date.now(),Ke("manualMode",!1);for(let o=0;o<ye;o++){Q.temp[o]=20.5+o*.4,Q.setpoint[o]=21+o%3*.5,Q.valve[o]=12+o*8,Q.enabled[o]=o===4?0:1;let i=o+1;y(g.temp(i),{value:Q.temp[o]}),y(g.setpoint(i),{value:Q.setpoint[o]}),y(g.baseSetpoint(i),{value:Q.setpoint[o]}),y(g.effectiveSetpoint(i),{value:Q.setpoint[o]}),y(g.coordinatorOffset(i),{value:i===1?1.5:0}),y(g.coordinatorRemaining(i),{value:i===1?2400:0}),i===1&&y(g.effectiveSetpoint(1),{value:Q.setpoint[0]+1.5}),y(g.valve(i),{value:Q.valve[o]}),y(g.state(i),{state:Q.valve[o]>5?"heating":"idle"}),y(g.enabled(i),{value:!!Q.enabled[o],state:Q.enabled[o]?"on":"off"}),y(g.probe(i),{state:"None"}),y(g.tempSource(i),{state:i%2?"Local Probe":"BLE"}),y(g.syncTo(i),{state:"None"}),y(g.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),y(g.name(i),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][o]||""}),y(g.preheatAdvance(i),{value:.08+o*.03});let l=i===1?1847:0,u=i===1?1897:0;y(g.motorOpenRipples(i),{value:u}),y(g.motorCloseRipples(i),{value:u}),y(g.motorWorkingRipples(i),{value:l}),y(g.motorPinFreeRipples(i),{value:i===1?1013:0}),y(g.motorStrokeModel(i),{state:i===1?"working_range":"full_stroke"}),y(g.motorOpenFactor(i),{value:0}),y(g.motorCloseFactor(i),{value:i===1?1.51:0}),y(g.motorLastFault(i),{state:"NONE"}),y(g.motorLearnPct(i),{value:0}),y(g.motorLearnPhase(i),{state:""}),y(g.motorLearnSample(i),{value:0}),y(g.motorLearnSamplesNeeded(i),{value:0})}for(let o=1;o<=Oi;o++){let i=o<=ye?o:ye,l=Q.temp[i-1]+(o>ye?1:.1*o);y(g.probeTemp(o),{value:l})}y(s.flow,{value:34.1}),y(s.ret,{value:30.4}),y(s.uptime,{value:ar}),y(s.wifi,{value:-57}),y(s.drivers,{value:!0,state:"on"}),y(s.fault,{value:!1,state:"off"}),y(s.ip,{state:"192.168.1.86"}),y(s.ssid,{state:"MockLab"}),y(s.mac,{state:"D8:3B:DA:12:34:56"}),y(s.firmware,{state:"v1.0.0-1"}),y(s.resetReason,{state:"Software reset (esp_restart)"}),y(s.manifoldFlowProbe,{state:"Probe 1"}),y(s.manifoldReturnProbe,{state:"Probe 2"}),y(s.manifoldType,{state:"NC (Normally Closed)"}),y(s.motorProfileDefault,{state:"HmIP VdMot"}),y(s.closeThresholdMultiplier,{value:1.45}),y(s.closeSlopeThreshold,{value:1}),y(s.closeSlopeCurrentFactor,{value:1.4}),y(s.openThresholdMultiplier,{value:1.7}),y(s.openSlopeThreshold,{value:.8}),y(s.openSlopeCurrentFactor,{value:1.3}),y(s.openRippleLimitFactor,{value:1.1}),y(s.openEndstopCurrentFactor,{value:1.25}),y(s.openEndstopStallFraction,{value:.3}),y(s.closeTrailingStepMa,{value:2.5}),y(s.closeTrailingSustainMs,{value:1e3}),y(s.closeTrailingRefMs,{value:2e3}),y(s.capCloseSeatMa,{value:34}),y(s.capCloseSeatFrames,{value:4}),y(s.capClosePopoffMa,{value:36}),y(s.capStallMa,{value:65}),y(s.capOpenStopMa,{value:40}),y(s.capCircuitFaultMa,{value:85}),y(s.closeRuntimeLimitCounts,{value:2600}),y(s.workingRangeLearning,{value:1}),y(s.learnOpenStartRipples,{value:2200}),y(s.learnOpenStepRipples,{value:125}),y(s.learnOpenMaxRipples,{value:2450}),y(s.learnMinFreeRipples,{value:100}),y(s.learnSamples,{value:3}),y(s.learnMaxSpreadPct,{value:10}),y(s.pinEngageStepMa,{value:2}),y(s.pinEngageMarginRipples,{value:50}),y(s.genericRuntimeLimitSeconds,{value:45}),y(s.hmipRuntimeLimitSeconds,{value:38}),y(s.relearnAfterMovements,{value:2e3}),y(s.relearnAfterHours,{value:168}),y(s.learnedFactorMinSamples,{value:3}),y(s.learnedFactorMaxDeviationPct,{value:12}),y(s.simplePreheatEnabled,{state:"on"}),y(s.minZoneFlowPct,{value:15}),y(s.minimumFlowAlways,{state:"off"}),y(s.heatingMode,{state:"heat_pump"}),y(s.effectiveHeatingMode,{state:"heat_pump"}),y(s.heatingModeSource,{state:"local"}),y(s.hpOverheatMarginC,{value:1}),y(s.hpBasePct,{value:60}),y(s.hpTrimFloorPct,{value:15}),y(s.heatDemandRecommendation,{state:"hold"}),y(s.heatDemandCriticalZone,{value:1}),y(s.heatDemandSaturatedS,{value:0}),y(s.bleClockSyncEnabled,{state:"on"}),y(s.bleClockSyncIntervalMin,{value:60}),y(s.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),y(s.bleClockSyncLastError,{state:""}),y(s.bleClockSyncAdvertising,{state:"off"}),y(s.authorityInstallationId,{state:"house-main"}),y(s.authorityCoordinatorId,{state:"lune-touch"}),y(s.authorityConfigured,{state:"on",value:!0}),y(s.authorityProposalPending,{state:"off",value:!1}),y(s.authorityState,{state:"touch_normal"}),y(s.authorityReason,{state:"lease_renewed"}),y(s.authorityLeaseRemainingS,{value:72}),y(s.cpuLoadCore0,{value:18.5}),y(s.cpuLoadCore1,{value:7.2}),y(s.freeInternalKb,{value:142}),y(s.freeDmaKb,{value:118}),y(s.largestInternalKb,{value:64}),y(s.minInternalKb,{value:96}),y(s.freePsramKb,{value:7800}),y(s.largestPsramKb,{value:4096}),y(s.bleHubEnabled,{state:"on"}),y(s.bleScanning,{state:"on"}),y(s.bleDemanded,{state:"on"}),y(s.bleAdsPerSec,{value:2.4}),y(s.bleLastAdvAgeMs,{value:850}),ia(!0);let t=300,e=Number(Date.now()/1e3)|0,a=288,n=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],r=[];for(let o=0;o<a;o++){let i=(a-1-o)*t,l=e-i,u=Math.floor(o/12)%24,f=n.map(_=>_[u%_.length]),w=i/3600,c=w>2.5&&w<3.5||w>8.5&&w<9.5?1:0,b=f.filter(_=>_===5).length,x=Math.round(Math.min(100,b*15+Math.abs(Math.sin(o/8))*6)),k=Number((30+b*1.4+Math.sin(o/11)*1.5).toFixed(1)),L=Number((k-(1.4+b*.35)).toFixed(1));r.push([l,...f,c,k,L,x])}Ha({interval_s:t,uptime_s:e,count:a,entries:r}),or(6)}function or(t){let e=[];for(let a=0;a<t;a++){let n=Qo[ja%Qo.length];e.push([ja,n[0],n[1],n[2]]),ja++}qa(e,ja)}function Ii(){At+=1,y(s.uptime,{value:ar+Math.floor((Date.now()-nr)/1e3)}),y(s.wifi,{value:-55-Math.round((1+Math.sin(At/4))*6)});let t=0,e=0,a=0;for(let i=0;i<ye;i++){let l=i+1,u=!!Q.enabled[i],f=Q.temp[i],w=Q.setpoint[i],c=u&&Q.driversEnabled&&!Q.manualMode&&f<w-.25;Q.manualMode?Q.valve[i]=Math.max(0,Q.valve[i]):!u||!Q.driversEnabled?Q.valve[i]=Math.max(0,Q.valve[i]-6):c?Q.valve[i]=Math.min(100,Q.valve[i]+7+l%3):Q.valve[i]=Math.max(0,Q.valve[i]-5);let b=c?.05+Q.valve[i]/2200:-.03+Q.valve[i]/3200;Q.temp[i]=f+b+Math.sin((At+l)/5)*.04,u&&Q.valve[i]>0&&(t+=Q.valve[i],e+=1,a=Math.max(a,Q.valve[i])),y(g.temp(l),{value:Q.temp[i]}),y(g.valve(l),{value:Math.round(Q.valve[i])});let x=Math.max(0,(Q.setpoint[i]-Q.temp[i]-.15)*.22);y(g.preheatAdvance(l),{value:Number(x.toFixed(2))}),y(g.state(l),{state:u?c?"heating":"idle":"off"}),y(g.enabled(l),{value:u,state:u?"on":"off"}),y(g.probeTemp(l),{value:Q.temp[i]+Math.sin((At+l)/6)*.1})}let n=29.5+a*.075+e*.18+Math.sin(At/6)*.25,r=n-(e?2.1+t/Math.max(1,e*50):1.1);y(s.flow,{value:Number(n.toFixed(1))}),y(s.ret,{value:Number(r.toFixed(1))}),y(g.probeTemp(1),{value:Number((n+.2).toFixed(1))}),y(g.probeTemp(2),{value:Number((r-.4).toFixed(1))}),ia(!0);let o=R("zoneStateHistory");o&&(o.uptime_s=Number(Date.now()/1e3)|0),At%3===0&&or(1)}function er(t,e){Ie.busy=!0,Ie.direction=e,Ie.zone=t,Ie.startedAt=Date.now()}function Hi(){return Ie.startedAt?Date.now()-Ie.startedAt:0}function qi(t,e,a){if(!a)return .4;let n=e==="open";return t<180?n?22:28:t<500?n?15.2:19.4:t<2200?n?14.6:19.1:!n&&t<2800?24.2:!n&&t<3400?20.4:t<la-300?n?18.5:26.8:n?25.4:41.2}function Bi(t,e,a){return a?e==="open"?t>la-300?3:0:t<2200?0:t<3e3?1:t<la-300?2:3:0}function tr(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function rr(){let t=Hi(),e=Ie.busy&&t<la;Ie.busy&&!e&&(Ie.busy=!1);let a=qi(t,Ie.direction,e||t<la+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:F(s.freeInternalKb)||142,dma_kb:F(s.freeDmaKb)||118,largest_internal_kb:F(s.largestInternalKb)||64,min_internal_kb:F(s.minInternalKb)||96,psram_kb:F(s.freePsramKb)||7800,largest_psram_kb:F(s.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:A(s.bleHubEnabled)==="on",scanning:A(s.bleScanning)==="on",demanded:A(s.bleDemanded)==="on",ads_per_sec:F(s.bleAdsPerSec)||0,last_adv_age_ms:F(s.bleLastAdvAgeMs)||0},drivers_enabled:!!Q.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(a.toFixed(1)),stroke_phase:Bi(t,Ie.direction,e),armed:!!Q.driversEnabled,latch_arm_level:1,latch_state_level:0,motor_enable_level:0,tacho_period_us:tr(t,e),tacho_cadence_us:tr(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:At}}}}function ji(t,e){let a=e==="open";if(t<180)return a?22-t*.03:28-t*.04;if(t<650)return a?14.8:19.2;if(t<2200)return(a?14.5:19)+Math.sin(t/90)*.35;if(!a&&t<2600)return 19+(t-2200)*.012;if(!a&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return a?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let n=a?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(a?26.4:44.5,n)}function sr(t){let e=t||Ie.direction||"open",a=e==="open",n=a?3900:4200,r=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],o=0;for(let i=0;i<=n;i+=10){let l=ji(i,e);i>180&&i<n-80&&(o+=i%20===0?1:0);let u=0;a?u=i>n-400?3:0:i>=2200&&i<3e3?u=1:i>=3e3&&i<3600?u=2:i>=3600&&(u=3);let f=i<200?3200:i<n-400?1800+Math.round(Math.sin(i/140)*80):4200;r.push([i,o,l.toFixed(1),1200,1,a?1:0,1,u,f,40,0,0,0,0,0,1,0].join(","))}return r.join(`
`)+`
`}function ir(){Jo||($i(),gt(!0),Jo=setInterval(Ii,1200))}function Va(t){let e=t.key||"",a=t.value,n=t.zone||0;if(e==="zone_setpoint"&&n>=1&&n<=ye){let o=Number(a);Number.isNaN(o)||(Q.setpoint[n-1]=o,y(g.setpoint(n),{value:o}),y(g.baseSetpoint(n),{value:o}),y(g.effectiveSetpoint(n),{value:o}),X("Zone "+n+" setpoint set to "+o.toFixed(1)+"\xB0C",n));return}if(e==="zone_enabled"&&n>=1&&n<=ye){let o=a>.5;Q.enabled[n-1]=o?1:0,y(g.enabled(n),{value:o,state:o?"on":"off"}),X("Zone "+n+(o?" enabled":" disabled"),n);return}if(e==="drivers_enabled"){let o=a>.5;Q.driversEnabled=o?1:0,o||(Ie.busy=!1),y(s.drivers,{value:o,state:o?"on":"off"}),X(o?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let o=a>.5;Q.manualMode=o?1:0,Ke("manualMode",o);return}if(e==="motor_target"&&n>=1&&n<=ye){let o=Number(a||0);y(g.motorTarget(n),{value:Math.max(0,Math.min(100,Math.round(o)))}),X("Motor "+n+" target set to "+o+"%",n);return}if(e==="command"){let o=String(a);if(o==="i2c_scan"){Ht(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),X("I2C scan complete");return}if(o==="calibrate_all_motors"||o==="restart"){X("Command executed: "+o);return}if(o==="firmware_check"||o==="firmware_prepare"){X("Command executed: "+o);return}if(o==="firmware_install"){X("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(o==="open_motor_timed"&&n>=1&&n<=ye){er(n,"open"),X("Motor "+n+" open timed",n);return}if(o==="close_motor_timed"&&n>=1&&n<=ye){er(n,"close"),X("Motor "+n+" close timed",n);return}if(o==="stop_motor"&&n>=1&&n<=ye){Ie.busy=!1,X("Motor "+n+" stopped",n);return}if(o==="motor_reset_fault"&&n>=1&&n<=ye){y(g.motorLastFault(n),{state:"NONE"}),X("Motor "+n+" fault reset",n);return}if(o==="motor_reset_learned_factors"&&n>=1&&n<=ye){X("Motor "+n+" learned factors reset",n);return}if(o==="motor_reset_and_relearn"&&n>=1&&n<=ye){X("Motor "+n+" reset and relearn started",n),y(g.state(n),{state:"calibrating"});let i=3;y(g.motorLearnPct(n),{value:0}),y(g.motorLearnPhase(n),{state:"home"}),y(g.motorLearnSample(n),{value:0}),y(g.motorLearnSamplesNeeded(n),{value:i}),[{pct:5,phase:"home",sample:0},{pct:20,phase:"open",sample:0},{pct:35,phase:"close",sample:1},{pct:50,phase:"open",sample:1},{pct:65,phase:"close",sample:2},{pct:80,phase:"open",sample:2},{pct:95,phase:"close",sample:3},{pct:100,phase:"done",sample:3}].forEach((u,f)=>{setTimeout(()=>{y(g.motorLearnPct(n),{value:u.pct}),y(g.motorLearnPhase(n),{state:u.phase}),y(g.motorLearnSample(n),{value:u.sample}),y(g.motorLearnSamplesNeeded(n),{value:i}),u.phase==="done"&&(y(g.state(n),{state:"idle"}),y(g.motorLearnPhase(n),{state:""}),y(g.motorOpenRipples(n),{value:1897}),y(g.motorCloseRipples(n),{value:1897}),y(g.motorWorkingRipples(n),{value:1847}),y(g.motorPinFreeRipples(n),{value:1013}),y(g.motorStrokeModel(n),{state:"working_range"}))},700*(f+1))});return}if(o==="ble_clock_sync_now"){y(s.bleClockSyncAdvertising,{state:"on"}),y(s.bleClockSyncLastError,{state:""}),setTimeout(()=>{y(s.bleClockSyncAdvertising,{state:"off"}),y(s.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),X("Room clock broadcast started");return}if(o==="dump_task_stats"){X("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&n>=1){y(g.probe(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="zone_temp_source"&&n>=1){y(g.tempSource(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="zone_sync_to"&&n>=1){y(g.syncTo(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="manifold_type"){y(s.manifoldType,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="manifold_flow_probe"){y(s.manifoldFlowProbe,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="manifold_return_probe"){y(s.manifoldReturnProbe,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="motor_profile_default"){y(s.motorProfileDefault,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="simple_preheat_enabled"){y(s.simplePreheatEnabled,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="minimum_flow_always"){y(s.minimumFlowAlways,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="heating_mode"){let o=String(a)==="normal"?"normal":"heat_pump";y(s.heatingMode,{state:o}),y(s.effectiveHeatingMode,{state:o}),y(s.heatingModeSource,{state:"local"}),X("Setting updated: "+e+" = "+o);return}if(e==="ble_clock_sync_enabled"){y(s.bleClockSyncEnabled,{state:String(a)}),X("Setting updated: "+e+" = "+a);return}if(e==="zone_name"&&n>=1){y(g.name(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="zone_ble_mac"&&n>=1){y(g.ble(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="zone_sensor_id"&&n>=1){y(g.sensorId(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="zone_sensor_name"&&n>=1){y(g.sensorName(n),{state:String(a)}),X("Setting updated: "+e+" = "+a,n);return}if(e==="authority_approve_proposal"){y(s.authorityInstallationId,{state:A(s.authorityProposalInstallationId)||"lune-mock"}),y(s.authorityCoordinatorId,{state:A(s.authorityProposalCoordinatorId)||"touch-mock"}),y(s.authorityConfigured,{state:"on",value:!0}),y(s.authorityProposalPending,{state:"off",value:!1}),X("Discovered Lune Touch approved");return}if(e==="authority_revoke"){y(s.authorityInstallationId,{state:""}),y(s.authorityCoordinatorId,{state:""}),y(s.authorityConfigured,{state:"off",value:!1}),y(s.authorityState,{state:"unconfigured"}),X("Lune Touch disconnected");return}let r={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,open_endstop_current_factor:s.openEndstopCurrentFactor,open_endstop_stall_fraction:s.openEndstopStallFraction,close_trailing_step_ma:s.closeTrailingStepMa,close_trailing_sustain_ms:s.closeTrailingSustainMs,close_trailing_ref_ms:s.closeTrailingRefMs,cap_close_seat_ma:s.capCloseSeatMa,cap_close_seat_frames:s.capCloseSeatFrames,cap_close_popoff_ma:s.capClosePopoffMa,cap_stall_ma:s.capStallMa,cap_open_stop_ma:s.capOpenStopMa,cap_circuit_fault_ma:s.capCircuitFaultMa,close_runtime_limit_counts:s.closeRuntimeLimitCounts,working_range_learning:s.workingRangeLearning,learn_open_start_ripples:s.learnOpenStartRipples,learn_open_step_ripples:s.learnOpenStepRipples,learn_open_max_ripples:s.learnOpenMaxRipples,learn_min_free_ripples:s.learnMinFreeRipples,learn_samples:s.learnSamples,learn_max_spread_pct:s.learnMaxSpreadPct,pin_engage_step_ma:s.pinEngageStepMa,pin_engage_margin_ripples:s.pinEngageMarginRipples,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct,min_zone_flow_pct:s.minZoneFlowPct,hp_overheat_margin_c:s.hpOverheatMarginC,hp_base_pct:s.hpBasePct,hp_trim_floor_pct:s.hpTrimFloorPct,ble_clock_sync_interval_min:s.bleClockSyncIntervalMin};if(r[e]){let o=Number(a);Number.isNaN(o)||(y(r[e],{value:o}),X("Setting updated: "+e+" = "+a));return}}var Tn="v1.1.0";function lr(){return{tag_name:Tn,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+Tn+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+Tn+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function cr(t){let e=[];for(let a=1;a<=ye;a++)e.push({zone:a,name:A(g.name(a)),enabled:A(g.enabled(a))==="on",setpoint_c:F(g.setpoint(a)),probe:A(g.probe(a)),temp_source:A(g.tempSource(a)),ble_mac:A(g.ble(a)),sensor_id:A(g.sensorId(a)),sensor_name:A(g.sensorName(a)),sync_to:A(g.syncTo(a))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:A(s.firmware),device:{mac:A(s.mac)},settings:{manifold_type:A(s.manifoldType),manifold_flow_probe:A(s.manifoldFlowProbe),manifold_return_probe:A(s.manifoldReturnProbe),motor_profile_default:A(s.motorProfileDefault),min_zone_flow_pct:F(s.minZoneFlowPct),minimum_flow_always:A(s.minimumFlowAlways)==="on",heating_mode:A(s.heatingMode)||"heat_pump",hp_overheat_margin_c:F(s.hpOverheatMarginC),hp_base_pct:F(s.hpBasePct),hp_trim_floor_pct:F(s.hpTrimFloorPct),simple_preheat_enabled:A(s.simplePreheatEnabled)==="on",ble_clock_sync_enabled:A(s.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:F(s.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(a=>({zone:a.zone,open_ripples:400+a.zone,close_ripples:390+a.zone}))}:null}}function dr(t,e){let a=Object.keys(t&&t.settings||{}).length,n=Array.isArray(t&&t.zones)?t.zones.length:0,r=e&&t&&t.learned?ye:0;return X("Settings restored from backup (mock)"),{applied:a+n+r,skipped:e?0:ye,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Va({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!Q.enabled[t-1];Va({key:"zone_enabled",value:e?1:0,zone:t})}};function En(t,e){let a=URL.createObjectURL(e),n=document.createElement("a");n.href=a,n.download=t,n.rel="noopener",document.body.appendChild(n),n.click(),document.body.removeChild(n),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function Nn(t,e,a){En(t,new Blob([String(e)],{type:(a||"text/plain")+";charset=utf-8"}))}function Rn(t,e){let a=new Date,n=o=>String(o).padStart(2,"0"),r=a.getFullYear()+n(a.getMonth()+1)+n(a.getDate())+"-"+n(a.getHours())+n(a.getMinutes());return t+"-"+r+"."+e}var Ft="/api/v1",Vi="https://api.github.com/repos/birkemosen/lune/releases/latest",Ui="https://github.com/birkemosen/lune/releases/latest/download/",Ki="/update",Wi="lune-v6-settings",ur="1";function Xe(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function Pn(t){return Object.assign({"X-Lune-CSRF":ur,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},t||{})}function Dn(t,e){let a=new URLSearchParams;for(let[r,o]of Object.entries(e||{}))o!=null&&a.append(r,o);let n=a.toString();return Ft+t+(n?"?"+n:"")}function Ee(t,e,a){if(Ln(),Xe())try{return Va(a),Promise.resolve({ok:!0})}finally{Ia()}let n=new URLSearchParams;for(let[r,o]of Object.entries(e||{}))o!=null&&n.append(r,String(o));return fetch(Ft+t,{method:"POST",headers:Pn({"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"}),body:n.toString()}).then(async r=>{if(!r.ok&&[400,404,415].includes(r.status)&&(r=await fetch(Dn(t,e),{method:"POST",headers:Pn()})),!r.ok){let o=`POST ${t} failed (HTTP ${r.status})`;throw console.warn("API call failed: "+o),X(o),new Error(o)}return r}).catch(r=>{throw console.error(`API call error: POST ${t}:`,r),r}).finally(()=>{Ia()})}function Zi(t,e,a){return Ln(),fetch(Dn(t,a),{method:"POST",headers:Pn({"Content-Type":"application/json"}),body:JSON.stringify(e)}).finally(()=>{Ia()})}function On(t,e){let a=Number(e);y(g.setpoint(t),{value:a}),y(g.baseSetpoint(t),{value:a});let n=Number(F(g.coordinatorOffset(t))),r=Number.isFinite(n)?a+n:a;return y(g.effectiveSetpoint(t),{value:r}),Ee(`/zones/${t}/setpoint`,{setpoint_c:a},{key:"zone_setpoint",value:a,zone:t})}function mr(t,e){return y(g.enabled(t),{state:e?"on":"off",value:e}),Ee(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function ca(t){return y(s.drivers,{state:t?"on":"off",value:t}),Ee("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}async function gr({hz:t=100,durationMs:e=4e3,clamp:a=!1}={}){return Xe()?{ok:!0,data:{cycles:Math.max(1,Math.floor(e/10)),hz:t,clamp:!!a,armed:!0,armed_at_cycle:1,latch_state_start:1,latch_state_end:0}}:(await Ee("/motors/arm-clock-probe",{hz:t,duration_ms:e,clamp:a?1:0})).json()}function He(t,e){return Ee("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function br(){return Ht("Scanning I2C bus..."),X("I2C scan started"),He("i2c_scan")}var Gi={zone_probe:t=>g.probe(t),zone_temp_source:t=>g.tempSource(t),zone_sync_to:t=>g.syncTo(t)},Xi={zone_ble_mac:t=>g.ble(t),zone_sensor_id:t=>g.sensorId(t),zone_sensor_name:t=>g.sensorName(t),zone_name:t=>g.name(t)},Yi={manifold_type:s.manifoldType,manifold_flow_probe:s.manifoldFlowProbe,manifold_return_probe:s.manifoldReturnProbe,motor_profile_default:s.motorProfileDefault,simple_preheat_enabled:s.simplePreheatEnabled,ble_clock_sync_enabled:s.bleClockSyncEnabled},Ji={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,open_endstop_current_factor:s.openEndstopCurrentFactor,open_endstop_stall_fraction:s.openEndstopStallFraction,close_trailing_step_ma:s.closeTrailingStepMa,close_trailing_sustain_ms:s.closeTrailingSustainMs,close_trailing_ref_ms:s.closeTrailingRefMs,cap_close_seat_ma:s.capCloseSeatMa,cap_close_seat_frames:s.capCloseSeatFrames,cap_close_popoff_ma:s.capClosePopoffMa,cap_stall_ma:s.capStallMa,cap_open_stop_ma:s.capOpenStopMa,cap_circuit_fault_ma:s.capCircuitFaultMa,close_runtime_limit_counts:s.closeRuntimeLimitCounts,working_range_learning:s.workingRangeLearning,learn_open_start_ripples:s.learnOpenStartRipples,learn_open_step_ripples:s.learnOpenStepRipples,learn_open_max_ripples:s.learnOpenMaxRipples,learn_min_free_ripples:s.learnMinFreeRipples,learn_samples:s.learnSamples,learn_max_spread_pct:s.learnMaxSpreadPct,pin_engage_step_ma:s.pinEngageStepMa,pin_engage_margin_ripples:s.pinEngageMarginRipples,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:s.bleClockSyncIntervalMin};function st(t,e,a){let n=Gi[e];return n&&y(n(t),{state:a}),Ee("/settings/select",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function qt(t,e,a){let n=Xi[e];return n&&y(n(t),{state:a}),Ee("/settings/text",{key:e,value:a,zone:t},{key:e,value:a,zone:t})}function ze(t,e){let a=Yi[t];return a&&y(a,{state:e}),Ee("/settings/select",{key:t,value:e},{key:t,value:e})}function Me(t,e){let a=Number(e),n=Ji[t];return n&&!Number.isNaN(a)&&y(n,{value:a}),Ee("/settings/number",{key:t,value:a},{key:t,value:a})}function fr(){return Ee("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:A(s.authorityProposalInstallationId)||"lune-mock",coordinator_id:A(s.authorityProposalCoordinatorId)||"touch-mock"}},a=(e==null?void 0:e.data)||{};return a.installation_id&&y(s.authorityInstallationId,{state:a.installation_id}),a.coordinator_id&&y(s.authorityCoordinatorId,{state:a.coordinator_id}),y(s.authorityConfigured,{state:"on",value:!0}),y(s.authorityProposalPending,{state:"off",value:!1}),e})}function hr(){return Ee("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return y(s.authorityInstallationId,{state:""}),y(s.authorityCoordinatorId,{state:""}),y(s.authorityConfigured,{state:"off",value:!1}),t})}function vr(t,e){let a=String(e||"").trim();return X("Zone "+t+" renamed to "+(a||"(blank)"),t),qt(t,"zone_name",a)}function xr(t,e){let a=Number(e),n=Number.isNaN(a)?0:Math.max(0,Math.min(100,Math.round(a)));return y(g.motorTarget(t),{value:n}),X("Motor "+t+" target set to "+n+"%",t),Ee(`/motors/${t}/target`,{value:n},{key:"motor_target",value:n,zone:t})}function yr(t){let e=Math.round(Number(t));return!Number.isFinite(e)||e<=0?1e4:Math.max(100,Math.min(45e3,e))}function Ka(t,e=1e4){let a=yr(e);return X("Motor "+t+" open for "+a+"ms",t),Ee(`/motors/${t}/open_timed`,{duration_ms:a},{key:"command",value:"open_motor_timed",zone:t,duration_ms:a})}function Wa(t,e=1e4){let a=yr(e);return X("Motor "+t+" close for "+a+"ms",t),Ee(`/motors/${t}/close_timed`,{duration_ms:a},{key:"command",value:"close_motor_timed",zone:t,duration_ms:a})}function da(t){return X("Motor "+t+" stopped",t),Ee(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function wr(){X("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(Ee(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>ca(!1).then(()=>e))}async function Bt(){if(Xe())return rr();let t=await fetch(Ft+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function $n(){if(Xe())return sr();let t=await fetch(Ft+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function jt(t){return Ke("manualMode",!!t),X(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),Ee("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function Za(t){return X("Motor "+t+" fault reset",t),t>=1&&t<=6&&y(g.motorLastFault(t),{state:"NONE"}),He("motor_reset_fault",t)}function Ga(t){return X("Motor "+t+" learned factors reset",t),He("motor_reset_learned_factors",t)}function kr(t){return X("Motor "+t+" reset and relearn started",t),He("motor_reset_and_relearn",t)}function _r(){return X("Task/heap stats dumped to device log"),He("dump_task_stats")}function In(){Xe()||fetch(Ft+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Ha(t)}).catch(()=>{})}function Sr(){return He("firmware_check")}function zr(){return X("Firmware install requested"),He("firmware_install")}function Mr(){return He("firmware_prepare")}function Hn(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:Ui+e}}function pr(t,e){let a=Array.isArray(t)?t:[],n=o=>a.find(i=>o.test(String(i&&i.name||""))),r=n(/^lune-v6.*\.ota\.bin$/i)||n(/\.ota\.bin$/i)||n(/\.bin$/i);return r&&r.browser_download_url?{name:String(r.name),url:String(r.browser_download_url)}:Hn(e)}var ft=class extends Error{constructor(e,a,n){super(n||e),this.name="ReleaseCheckError",this.code=e,this.status=a||0}};async function Cr(){if(Xe()){let n=lr(),r=String(n&&n.tag_name||"");return{tag:r,notes:String(n&&n.body||""),publishedAt:String(n&&n.published_at||""),asset:pr(n&&n.assets,r)}}let t;try{t=await fetch(Vi,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(n){throw new ft("network",0,n&&n.message?n.message:"network")}if(t.status===404)throw new ft("no_releases",404,"No published GitHub release");if(!t.ok)throw new ft("http",t.status,"Release check failed: "+t.status);let e=await t.json(),a=String(e&&e.tag_name||"");if(!a)throw new ft("no_releases",404,"No published GitHub release");return{tag:a,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:pr(e&&e.assets,a)}}function Lr(t,e){return Xe()?new Promise(a=>{let n=0,r=setInterval(()=>{n=Math.min(100,n+20),e&&e(n),n>=100&&(clearInterval(r),X("Firmware image uploaded (mock)"),a("Update Successful!"))},220)}):new Promise((a,n)=>{let r=new FormData;r.append("update",t,t.name);let o=new XMLHttpRequest;o.open("POST",Ki),o.setRequestHeader("X-Lune-CSRF",ur),o.upload.onprogress=i=>{e&&i.lengthComputable&&e(Math.min(100,Math.round(i.loaded/i.total*100)))},o.onload=()=>{let i=String(o.responseText||"");if(o.status>=200&&o.status<300&&!/fail/i.test(i)){a(i);return}n(new Error("OTA upload rejected: "+o.status+" "+i))},o.onerror=()=>n(new Error("OTA upload connection lost")),o.send(r)})}function Ua(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function Ar(t=!0){if(Xe())return Ua(cr(t));let e=await fetch(Dn("/settings/export",{include_learned:t?1:0}),{cache:"no-store"});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Ua(await e.json())}function Xa(t){let e=Ua(t);return!!(e&&e._type===Wi)}async function Fr(t,e=!0){let a=typeof t=="string"?JSON.parse(t):t,n=Ua(a);if(!Xa(n))throw new Error("not_a_lune_backup");if(Xe())return dr(n,e);let r=await Zi("/settings/import",Object.assign({},n,{restore_learned:!!e}),{restore_learned:e?1:0});if(!r.ok)throw new Error("Settings restore failed: "+r.status);let o=await r.json().catch(()=>({})),i=o&&o.data?o.data:o||{};return X("Settings restored from backup"),{applied:Number(i.applied||0),skipped:Number(i.skipped||0),ignored:Number(i.ignored||0)}}function Tr(t){let e=Rn("lune-v6-settings","json");return Nn(e,JSON.stringify(t,null,2),"application/json"),e}function Qi(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Ba().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function Er(){let t=Rn("lune-v6-logs","txt");if(Xe())return Nn(t,Qi()||"No log lines buffered."),t;let e=await fetch(Ft+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return En(t,await e.blob()),t}function qn(){if(Xe())return;let t=Xo();fetch(Ft+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&qa(e.lines,e.next_seq)}).catch(()=>{})}var Ya={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","nav.overview":"Overview","nav.help":"Help","nav.more":"More","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.scrollBottom":"Scroll to bottom","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.noData":"No data","overview.graph.collecting":"Collecting history\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 open Zones to clear or relearn.","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armed)","overview.timeline.absorbReactive":"Absorb (reactive)","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Valve","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.override.remaining":"Touch offset {offset} \xB7 {remaining} remaining","zone.override.hint":"Temporary command from Lune Touch","zone.chart.kicker":"Temperature \xB7 last 24h","zone.chart.note":"Dashed line is the long-term setpoint. UFH moves slowly, so the curve is the useful signal.","zone.demand":"Demand","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.sensor.externalSource":"External (Wi\u2011Fi)","zone.sensor.externalTitle":"External (Wi\u2011Fi)","zone.sensor.externalNote":"Bind a stable sensor_id. Hubs POST temperatures; zone mapping stays on V6. See Help \u2192 External room temperature.","zone.sensor.sensorIdPh":"sensor_id (MAC or entity id)","zone.sensor.sensorNamePh":"Friendly name (optional)","zone.sensor.noIngestYet":"No external temperature received yet.","zone.sensor.lastIngestAge":"Last ingest {sec}s ago (stale after 15 min).","help.external.title":"External room temperature","help.external.intro":"V6 accepts HTTP POSTs keyed by sensor_id. Zone mapping is only on V6. Touch does not ingest temperatures.","help.external.keyWarn":"Scripts include your browser session key if set \u2014 treat it as a secret.","help.external.copy":"Copy","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","zone.learning.status":"Learning","zone.learning.calibrating":"Calibrating\u2026","zone.learning.workingRange":"Working range","zone.learning.fullStroke":"Full stroke","zone.learning.learned":"Learned","zone.learning.needed":"Needs learning","zone.learning.workingSpan":"Working range","zone.learning.pinToSeat":"Pin \u2192 seat","zone.learning.freeTravel":"Free to pin","zone.learning.workingRangeDetail":"{working} pin\u2192seat \xB7 {span} span","zone.learning.fullStrokeDetail":"{span} full stroke","zone.learning.finished":"Learning finished for {zone}","zone.learning.phase.home":"Homing to seat","zone.learning.phase.open":"Opening","zone.learning.phase.close":"Closing","zone.learning.phase.done":"Learning done","zone.learning.phase.failed":"Learning failed","zone.learning.phase.pass":"{phase} \xB7 sample {sample}/{need}","settings.manifold.title":"Manifold Configuration","settings.manifold.panelTitle":"Manifold and probes","settings.manifold.panelSub":"Valve polarity and live 1-Wire readings","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe temperatures","settings.manifold.availableProbes":"Available probes","settings.manifold.availableProbesSub":"How many 1-Wire sensors are fitted on this manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Return","settings.manifold.roleBoth":"Flow \xB7 Return","settings.manifold.probeConflict":"That probe is already assigned to another role.","settings.manifold.unusedProbeWarn":"{enabled} active zones but only {assigned} zone return probes assigned.","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum total opening","settings.minFlow.help":"Optional. Opens loops that are already calling a little further so the pump never runs against almost-closed valves. Satisfied rooms are never opened.","settings.minFlow.opening":"Minimum total opening (%)","settings.minFlow.openingSub":"Sum across loops already accepting heat.","settings.heatingMode.panelTitle":"Heating mode","settings.heatingMode.panelSub":"How valves behave when rooms reach setpoint","settings.heatingMode.title":"Heating mode","settings.heatingMode.help":"Normal closes valves at setpoint (boiler / gas / district). Heat pump keeps a high base opening so the heat source can run a low constant feed temperature; valves trim gently and close only when overheated. Lune Touch may override the mode while its lease is active.","settings.heatingMode.normal":"Normal (boiler, gas, district)","settings.heatingMode.normalSub":"Zones open proportionally below setpoint and close when the room reaches target.","settings.heatingMode.heatPump":"Heat pump","settings.heatingMode.heatPumpSub":"Satisfied zones keep a high base opening; valves trim gently and close only when overheated.","settings.heatingMode.base":"Base opening (%)","settings.heatingMode.margin":"Overheat margin (\xB0C)","settings.heatingMode.trimFloor":"Trim floor (%)","settings.heatingMode.touchNote":"Lune Touch is coordinating. This mode applies when Touch is offline.","overview.heatDemand.raise":"Feed temperature: too low for {zone}, {duration}","overview.heatDemand.hold":"Feed temperature: OK","overview.heatDemand.lower":"Feed temperature: can go lower","overview.mode.normal":"Normal","overview.mode.heatPump":"Heat pump","overview.mode.sourceLocal":"local setting","overview.mode.sourceTouch":"Touch lease","state.closedSetpoint":"Closed, setpoint reached","state.holdingFlow":"Holding flow","state.trimming":"Trimming","settings.returnTemp.title":"Return temperature","settings.returnTemp.panelSub":"Optional per-zone return probes","settings.returnTemp.modeOff":"2 probes \xB7 flow/return only","settings.returnTemp.modeOn":"8 probes \xB7 per-zone returns","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Legacy return-temp balancing only \u2014 not needed for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.panelSub":"Shelly BLU display time","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: the close stroke is capped at 38s and 2600 commutations by default (at most 40s / 3000) \u2014 40s is where the plunger leaves its housing. Opening is capped separately at 45s.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.openEndstopCurrentFactor":"Open Endstop Factor (Rev 3.2+)","settings.motor.openEndstopStallFraction":"Open Stall Fraction","settings.motor.closeTrailingStepMa":"Close Trailing Step","settings.motor.closeTrailingSustainMs":"Close Trailing Sustain","settings.motor.closeTrailingRefMs":"Close Trailing Window","settings.motor.capCloseSeatMa":"Close Seat Cap","settings.motor.capCloseSeatFrames":"Close Seat Cap Frames","settings.motor.capClosePopoffMa":"Close Pop-off Cap","settings.motor.capStallMa":"Stall Cap","settings.motor.capOpenStopMa":"Open Stop Cap","settings.motor.capCircuitFaultMa":"Circuit Fault Cap","settings.motor.closeCeilingS":"Close Ceiling Time","settings.motor.closeCeilingCounts":"Close Ceiling Counts","settings.motor.workingRangeLearning":"Working-Range Learning","settings.motor.learnOpenStartRipples":"First Open Leg","settings.motor.learnOpenStepRipples":"Open Leg Step","settings.motor.learnOpenMaxRipples":"Open Leg Max","settings.motor.learnMinFreeRipples":"Free Travel Proof","settings.motor.learnSamples":"Agreeing Samples","settings.motor.learnMaxSpreadPct":"Max Sample Spread","settings.motor.pinEngageStepMa":"Pin Detect Step","settings.motor.pinEngageMarginRipples":"Open Margin Past Pin","diagnostics.lab.tune.learn":"Working-range learning","diagnostics.lab.tune.close":"Close","diagnostics.lab.tune.open":"Open","diagnostics.lab.tune.caps":"Absolute current caps","diagnostics.lab.tune.ceiling":"Close travel ceiling","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Product colour is amber for heat and forest for healthy state. Light and dark follow the system appearance.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.product":"Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Local handling of external preload","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. A new DEMAND redistributes flow instead of releasing the window.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armed","settings.preheat.reactive":"Reactive","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.manual.title":"Manual control","diagnostics.lab.manual.hint":"Timed move with endstop detection armed. Traced like a capture, but not used for suggestions.","diagnostics.lab.manual.duration":"Run time","diagnostics.lab.manual.open":"Open","diagnostics.lab.manual.close":"Close","diagnostics.lab.manual.stop":"Stop","diagnostics.lab.manual.resetFault":"Clear fault","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.enable.title":"Enable the drivers","diagnostics.lab.enable.copy":"Rev 3.3 has no fault latch. This pauses automatic zone control and raises DRIVER_N_SLEEP so the bridges can run.","diagnostics.lab.enable.action":"Enable drivers","diagnostics.lab.log.enableWait":"Raising DRIVER_N_SLEEP \u2014 no LATCH_ARM on this board","diagnostics.lab.enableBanner":"The drivers did not enable. FAULT_N_RAW, rail overcurrent or the USB switch may be asserted.","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The browser keeps the live chart for the full stroke.","diagnostics.lab.tune.title":"Endstop thresholds","diagnostics.lab.tune.copy":"Close is detected by the trailing step, open by the endstop factor and stall fraction; the caps are absolute per-frame limits. Working-range learning takes effect on the next calibration: legs longer than the close ceiling minus its budget are pulled back. Slope is telemetry only. Changes apply immediately to this controller.","diagnostics.lab.log.tune":"Threshold {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Cleared learned motor factors for a clean stroke","diagnostics.lab.log.resetLearnedFailed":"Could not clear learned factors \u2014 continuing","diagnostics.lab.log.duration":"Timed move arm set to {seconds}s","diagnostics.lab.log.browserLog":"Chart kept from browser log ({seconds}s)","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.thr.title":"Thresholds on the {dir} stroke","diagnostics.lab.thr.source.capture":"Your latest capture","diagnostics.lab.thr.source.reference":"Reference trace \xB7 Rev 3.3 (broken unit)","diagnostics.lab.thr.intro":"Each threshold drawn as the current it trips at, replayed tick by tick through the firmware logic. Diamonds mark where each path would stop the motor; the larger one stops first. Typing in a field previews it here before you commit. The trace is already averaged, so real frame noise trips caps a little earlier.","diagnostics.lab.thr.chartAria":"Motor current on the {dir} stroke with each endstop threshold","diagnostics.lab.thr.riseAria":"Trailing current rise against the trailing-step threshold","diagnostics.lab.thr.riseTitle":"Trailing rise \xB7 I(t) \u2212 I(t \u2212 {window} s)","diagnostics.lab.thr.closeThreshold":"Close factor","diagnostics.lab.thr.openThreshold":"Open trip","diagnostics.lab.thr.baseline":"Free-travel baseline","diagnostics.lab.thr.trailing":"Trailing step","diagnostics.lab.thr.seat":"Seat cap","diagnostics.lab.thr.popoff":"Pop-off cap","diagnostics.lab.thr.openStop":"Open stop cap","diagnostics.lab.thr.stall":"Stall cap","diagnostics.lab.thr.circuit":"Circuit fault","diagnostics.lab.thr.ceiling":"Ceiling","diagnostics.lab.thr.wall":"40 s wall","diagnostics.lab.thr.trailingDetail":"rise > {step} mA over {window} s, held {sustain} s","diagnostics.lab.thr.factorDetail":"{base} mA \xD7 {f} = {ma} mA","diagnostics.lab.thr.fractionDetail":"{base} + {k} \xD7 ({stall} \u2212 {base}) mA","diagnostics.lab.thr.noBaseline":"baseline never settled on this trace","diagnostics.lab.thr.capDetail":"> {ma} mA for {frames} frames","diagnostics.lab.thr.seatGate":"only under load","diagnostics.lab.thr.pinAnchored":"referenced to pin contact","diagnostics.lab.thr.trailingPinGate":"off past the pin until the seat depth is learned","diagnostics.lab.thr.openGate":"armed after breakaway","diagnostics.lab.thr.ceilingDetail":"{s} s or {counts} counts","diagnostics.lab.thr.wallDetail":"{s} s / {counts} counts \xB7 plunger leaves the housing","diagnostics.lab.thr.verdictNone":"No path trips on this trace.","diagnostics.lab.thr.verdictCeiling":"The ceiling cuts the drive first ({t}, {counts} counts) - nothing detected the stop before it.","diagnostics.lab.thr.verdictLate":"{name} stops first, at {t} - after the 40 s wall.","diagnostics.lab.thr.verdictFirst":"{name} stops first, at {t} ({ma}).","diagnostics.lab.thr.offScale":"Above the chart: {list}","diagnostics.lab.thr.rise":"Trailing rise","diagnostics.lab.thr.afterWall":"after the wall","diagnostics.lab.thr.notReached":"not on this trace","diagnostics.lab.thr.col.path":"Path","diagnostics.lab.thr.col.threshold":"Threshold","diagnostics.lab.thr.col.fires":"Fires at","diagnostics.lab.thr.col.counts":"Counts","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armPulseWait":"Waiting for latch arm pulse \u2014 pad 10 should read 3.3 V for ~5 s","diagnostics.lab.log.armProbeWait":"Square-waving LATCH_ARM at 100 Hz \u2014 U2 pin 1 should show ~0.5 V AC","diagnostics.lab.log.armProbe":"Clock probe {hz} Hz \xD7 {cycles} cycles \u2014 armed {armed} (first at {at})","diagnostics.lab.log.armHigh":"Firmware readback: pad 10 HIGH (GPIO17 is driven)","diagnostics.lab.log.armGpio":"GPIO17 never went high \u2014 pad 10 stayed LOW in firmware readback","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.latchFaulted":"Fault latch did not arm \u2014 LATCH_STATE stayed high after the pulse","diagnostics.lab.log.enableFailed":"Drivers did not enable \u2014 a fault net may be asserted","diagnostics.lab.log.neverStarted":"Motor never started (busy stayed off)","diagnostics.lab.log.neverStartedFault":"Motor refused to start \u2014 zone is blocked by fault {fault}; press Reset fault first","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"The fault latch did not arm: LATCH_STATE stayed high after the arm pulse. Firmware cannot read FAULT_N_RAW, so the cause cannot be narrowed from here. Either a driver fault is latched (check driver nFAULT, the overcurrent comparator, 3V3_MOTOR) or the arm clock never reached the flip-flop (check R4, C4, Q1 and U2).","diagnostics.lab.armGpioBanner":"GPIO17 never went high. Watch pad 10 while Arming: it must read 3.3 V. If the gauge stays LOW, firmware is not driving the pin.","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.stopReason":"Stop reason: {reason}","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.noEndstop":"No {direction} endstop in {seconds}s \u2014 still free-travel; try again after a full seat, or raise safe runtime","diagnostics.lab.log.falseEndpoint":"Firmware accepted a {direction} endpoint after {seconds}s that the trace does not show \u2014 a false trip; check the stop reason","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.manualMove":"Manual {direction} on zone {zone} for {seconds}s","diagnostics.lab.log.manualStop":"Motor stop sent to zone {zone}","diagnostics.lab.log.faultReset":"Fault cleared on zone {zone}","diagnostics.lab.log.faultResetFailed":"Fault reset refused on zone {zone} (motor busy or hardware fault still active)","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.spurious":"Tacho count is rising while current rises \u2014 the edges are brush arcing, not commutations. Cadence and motion count are unreliable for the rest of this stroke.","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relative Kv (orifice model)","diagnostics.lab.kvHint":"Used by the flow allocator","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.railOc":"Rail OC","diagnostics.lab.usbFault":"USB fault","diagnostics.lab.baseline":"Baseline","diagnostics.lab.ceiling":"Ceiling","diagnostics.lab.openTrip":"Open trip","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 Motor Lab holds background polls","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","nav.overview":"Overblik","nav.help":"Hj\xE6lp","nav.more":"Mere","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.scrollBottom":"Til bunden","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.noData":"Ingen data","overview.graph.collecting":"Indsamler historik\u2026","overview.attention.faultDetail":"Z{zone}: {fault} \u2014 \xE5bn Zoner for at kvittere eller genl\xE6re.","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.absorbArmed":"Absorb (armeret)","overview.timeline.absorbReactive":"Absorb (reaktiv)","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Ventil","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.override.remaining":"Touch-offset {offset} \xB7 {remaining} tilbage","zone.override.hint":"Midlertidig kommando fra Lune Touch","zone.chart.kicker":"Temperatur \xB7 seneste 24t","zone.chart.note":"Den stiplede linje er det langsigtede setpunkt. Gulvvarme bev\xE6ger sig langsomt, s\xE5 kurven er det nyttige signal.","zone.demand":"Behov","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.sensor.externalSource":"Ekstern (Wi\u2011Fi)","zone.sensor.externalTitle":"Ekstern (Wi\u2011Fi)","zone.sensor.externalNote":"Bind et stabilt sensor_id. Hubs poster temperaturer; zone-mapping sker kun p\xE5 V6. Se Hj\xE6lp \u2192 Ekstern rumtemperatur.","zone.sensor.sensorIdPh":"sensor_id (MAC eller entity-id)","zone.sensor.sensorNamePh":"Venligt navn (valgfrit)","zone.sensor.noIngestYet":"Ingen ekstern temperatur modtaget endnu.","zone.sensor.lastIngestAge":"Seneste ingest for {sec}s siden (stale efter 15 min).","help.external.title":"Ekstern rumtemperatur","help.external.intro":"V6 accepterer HTTP POST med sensor_id. Zone-mapping sker kun p\xE5 V6. Touch ingerer ikke temperaturer.","help.external.keyWarn":"Scripts inkluderer din browser-session-n\xF8gle hvis sat \u2014 behandl den som hemmelighed.","help.external.copy":"Kopi\xE9r","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","zone.learning.status":"L\xE6ring","zone.learning.calibrating":"Kalibrerer\u2026","zone.learning.workingRange":"Arbejdsomr\xE5de","zone.learning.fullStroke":"Fuldt slag","zone.learning.learned":"L\xE6rt","zone.learning.needed":"Mangler l\xE6ring","zone.learning.workingSpan":"Arbejdsomr\xE5de","zone.learning.pinToSeat":"Pin \u2192 s\xE6de","zone.learning.freeTravel":"Fri til pin","zone.learning.workingRangeDetail":"{working} pin\u2192s\xE6de \xB7 {span} span","zone.learning.fullStrokeDetail":"{span} fuldt slag","zone.learning.finished":"L\xE6ring f\xE6rdig for {zone}","zone.learning.phase.home":"Homer til s\xE6de","zone.learning.phase.open":"\xC5bner","zone.learning.phase.close":"Lukker","zone.learning.phase.done":"L\xE6ring f\xE6rdig","zone.learning.phase.failed":"L\xE6ring fejlede","zone.learning.phase.pass":"{phase} \xB7 pr\xF8ve {sample}/{need}","settings.manifold.title":"Manifold-konfiguration","settings.manifold.panelTitle":"Manifold og prober","settings.manifold.panelSub":"Ventilpolaritet og live 1-Wire-m\xE5linger","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.availableProbes":"Tilg\xE6ngelige prober","settings.manifold.availableProbesSub":"Hvor mange 1-Wire-sensorer der er monteret p\xE5 denne manifold.","settings.manifold.roleFlow":"Flow","settings.manifold.roleReturn":"Retur","settings.manifold.roleBoth":"Flow \xB7 Retur","settings.manifold.probeConflict":"Den probe er allerede tildelt en anden rolle.","settings.manifold.unusedProbeWarn":"{enabled} aktive zoner, men kun {assigned} zone-returprober tildelt.","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum total \xE5bning","settings.minFlow.help":"Valgfri. \xC5bner sl\xF8jfer, der allerede kalder p\xE5 varme, lidt mere, s\xE5 pumpen aldrig k\xF8rer mod n\xE6sten lukkede ventiler. Tilfredse rum \xE5bnes aldrig.","settings.minFlow.opening":"Minimum total \xE5bning (%)","settings.minFlow.openingSub":"Summen p\xE5 sl\xF8jfer, der allerede tager varme.","settings.heatingMode.panelTitle":"Varmekilde-tilstand","settings.heatingMode.panelSub":"Hvordan ventiler opf\xF8rer sig ved setpunkt","settings.heatingMode.title":"Varmekilde-tilstand","settings.heatingMode.help":"Normal lukker ventiler ved setpunkt (kedel / gas / fjernvarme). Varmepumpe holder en h\xF8j basis\xE5bning, s\xE5 varmekilden kan k\xF8re lav konstant freml\xF8bstemperatur; ventiler trimmer bl\xF8dt og lukker f\xF8rst ved overophedning. Lune Touch kan overstyre tilstanden mens leasen er aktiv.","settings.heatingMode.normal":"Normal (kedel, gas, fjernvarme)","settings.heatingMode.normalSub":"Zoner \xE5bner proportionelt under setpunkt og lukker, n\xE5r rummet n\xE5r m\xE5let.","settings.heatingMode.heatPump":"Varmepumpe","settings.heatingMode.heatPumpSub":"Tilfredse zoner holder en h\xF8j basis\xE5bning; ventiler trimmer bl\xF8dt og lukker f\xF8rst ved overophedning.","settings.heatingMode.base":"Basis\xE5bning (%)","settings.heatingMode.margin":"Overhedningsmargen (\xB0C)","settings.heatingMode.trimFloor":"Trim-gulv (%)","settings.heatingMode.touchNote":"Lune Touch koordinerer. Denne tilstand g\xE6lder, n\xE5r Touch er offline.","overview.heatDemand.raise":"Freml\xF8bstemperatur: for lav til {zone}, {duration}","overview.heatDemand.hold":"Freml\xF8bstemperatur: OK","overview.heatDemand.lower":"Freml\xF8bstemperatur: kan s\xE6nkes","overview.mode.normal":"Normal","overview.mode.heatPump":"Varmepumpe","overview.mode.sourceLocal":"lokal indstilling","overview.mode.sourceTouch":"Touch-lease","state.closedSetpoint":"Lukket, setpunkt n\xE5et","state.holdingFlow":"Holder flow","state.trimming":"Trimmer","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.panelSub":"Valgfrie returprober pr. zone","settings.returnTemp.modeOff":"2 prober \xB7 kun flow/retur","settings.returnTemp.modeOn":"8 prober \xB7 retur pr. zone","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Kun til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendig for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.panelSub":"Tid p\xE5 Shelly BLU-displays","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: luk-slaget er som standard begr\xE6nset til 38s og 2600 kommutationer (h\xF8jst 40s / 3000) \u2014 ved 40s forlader stemplet motorhuset. \xC5bning har sin egen gr\xE6nse p\xE5 45s.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.openEndstopCurrentFactor":"\xC5bne endstop-faktor (Rev 3.2+)","settings.motor.openEndstopStallFraction":"\xC5bne stall-andel","settings.motor.closeTrailingStepMa":"Lukke trailing-step","settings.motor.closeTrailingSustainMs":"Lukke trailing-varighed","settings.motor.closeTrailingRefMs":"Lukke trailing-vindue","settings.motor.capCloseSeatMa":"Lukke seat-gr\xE6nse","settings.motor.capCloseSeatFrames":"Lukke seat-frames","settings.motor.capClosePopoffMa":"Lukke pop-off-gr\xE6nse","settings.motor.capStallMa":"Stall-gr\xE6nse","settings.motor.capOpenStopMa":"\xC5bne stop-gr\xE6nse","settings.motor.capCircuitFaultMa":"Kredsl\xF8bsfejl-gr\xE6nse","settings.motor.closeCeilingS":"Luk-loft tid","settings.motor.closeCeilingCounts":"Luk-loft t\xE6llinger","settings.motor.workingRangeLearning":"Arbejdsomr\xE5de-l\xE6ring","settings.motor.learnOpenStartRipples":"F\xF8rste \xE5bne-ben","settings.motor.learnOpenStepRipples":"\xC5bne-ben trin","settings.motor.learnOpenMaxRipples":"\xC5bne-ben maks","settings.motor.learnMinFreeRipples":"Bevis for fri vandring","settings.motor.learnSamples":"Enige m\xE5linger","settings.motor.learnMaxSpreadPct":"Maks spredning","settings.motor.pinEngageStepMa":"Pin-detektions-step","settings.motor.pinEngageMarginRipples":"\xC5bne-margin efter pin","diagnostics.lab.tune.learn":"L\xE6ring af arbejdsomr\xE5de","diagnostics.lab.tune.close":"Luk","diagnostics.lab.tune.open":"\xC5bn","diagnostics.lab.tune.caps":"Absolutte str\xF8mgr\xE6nser","diagnostics.lab.tune.ceiling":"Loft for lukkevandring","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Produktfarven er amber til varme og skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.product":"Amber til handling og varme, skovgr\xF8n til sund tilstand. Lys og m\xF8rk f\xF8lger systemudseendet.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.panelSub":"Lokal h\xE5ndtering af ekstern forvarmning","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Nyt DEMAND omfordeler flow i stedet for at slippe vinduet.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.armed":"Armeret","settings.preheat.reactive":"Reaktiv","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.downloadCsv":"Download CSV","diagnostics.lab.captureMeta":"{n} samples \xB7 {hz} Hz mean \xB7 {seconds}s","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.manual.title":"Manuel kontrol","diagnostics.lab.manual.hint":"Tidsstyret k\xF8rsel med endstop-detektion aktiv. Trace optages som ved en fangst, men bruges ikke til forslag.","diagnostics.lab.manual.duration":"K\xF8retid","diagnostics.lab.manual.open":"\xC5bn","diagnostics.lab.manual.close":"Luk","diagnostics.lab.manual.stop":"Stop","diagnostics.lab.manual.resetFault":"Nulstil fejl","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.enable.title":"T\xE6nd driverne","diagnostics.lab.enable.copy":"Rev 3.3 har ingen fejl-latch. Det s\xE6tter automatisk zonestyring p\xE5 pause og s\xE6tter DRIVER_N_SLEEP h\xF8j, s\xE5 broerne kan k\xF8re.","diagnostics.lab.enable.action":"T\xE6nd drivere","diagnostics.lab.log.enableWait":"S\xE6tter DRIVER_N_SLEEP \u2014 ingen LATCH_ARM p\xE5 dette board","diagnostics.lab.enableBanner":"Driverne t\xE6ndte ikke. FAULT_N_RAW, skinne-overstr\xF8m eller USB-kontakten kan v\xE6re aktiv.","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Browseren beholder live-grafen for hele slaget.","diagnostics.lab.tune.title":"Endstop-t\xE6rskler","diagnostics.lab.tune.copy":"Luk detekteres af trailing-step, \xE5bn af endstop-faktoren og stall-andelen; gr\xE6nserne er absolutte pr. frame. L\xE6ring af arbejdsomr\xE5det g\xE6lder fra n\xE6ste kalibrering: ben l\xE6ngere end close-loftet minus budget tr\xE6kkes tilbage. Slope er kun telemetri. \xC6ndringer g\xE6lder med det samme p\xE5 denne controller.","diagnostics.lab.log.tune":"T\xE6rskel {key} \u2192 {value}","diagnostics.lab.log.resetLearned":"Nulstillede l\xE6rte motorfaktorer for et rent slag","diagnostics.lab.log.resetLearnedFailed":"Kunne ikke nulstille l\xE6rte faktorer \u2014 forts\xE6tter","diagnostics.lab.log.duration":"Timed move sat til {seconds}s","diagnostics.lab.log.browserLog":"Graf beholdt fra browser-log ({seconds}s)","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.thr.title":"T\xE6rskler p\xE5 {dir}","diagnostics.lab.thr.source.capture":"Din seneste capture","diagnostics.lab.thr.source.reference":"Referencetrace \xB7 Rev 3.3 (\xF8delagt enhed)","diagnostics.lab.thr.intro":"Hver t\xE6rskel vist som den str\xF8m, den udl\xF8ser ved, afspillet tick for tick gennem firmwarens logik. Ruderne viser, hvor hver sti ville stoppe motoren; den st\xF8rste stopper f\xF8rst. N\xE5r du skriver i et felt, vises effekten her, f\xF8r du gemmer. Tracet er allerede midlet, s\xE5 rigtig frame-st\xF8j udl\xF8ser gr\xE6nserne lidt tidligere.","diagnostics.lab.thr.chartAria":"Motorstr\xF8m under {dir} med hver endstop-t\xE6rskel","diagnostics.lab.thr.riseAria":"Trailing-stigning mod trailing-step-t\xE6rsklen","diagnostics.lab.thr.riseTitle":"Trailing-stigning \xB7 I(t) \u2212 I(t \u2212 {window} s)","diagnostics.lab.thr.closeThreshold":"Lukke-faktor","diagnostics.lab.thr.openThreshold":"\xC5bne-trip","diagnostics.lab.thr.baseline":"Free-travel-baseline","diagnostics.lab.thr.trailing":"Trailing-step","diagnostics.lab.thr.seat":"Seat-gr\xE6nse","diagnostics.lab.thr.popoff":"Pop-off-gr\xE6nse","diagnostics.lab.thr.openStop":"\xC5bne stop-gr\xE6nse","diagnostics.lab.thr.stall":"Stall-gr\xE6nse","diagnostics.lab.thr.circuit":"Kredsl\xF8bsfejl","diagnostics.lab.thr.ceiling":"Loft","diagnostics.lab.thr.wall":"40 s-v\xE6g","diagnostics.lab.thr.trailingDetail":"stigning > {step} mA over {window} s, holdt {sustain} s","diagnostics.lab.thr.factorDetail":"{base} mA \xD7 {f} = {ma} mA","diagnostics.lab.thr.fractionDetail":"{base} + {k} \xD7 ({stall} \u2212 {base}) mA","diagnostics.lab.thr.noBaseline":"baseline faldt aldrig til ro p\xE5 dette trace","diagnostics.lab.thr.capDetail":"> {ma} mA i {frames} frames","diagnostics.lab.thr.seatGate":"kun under belastning","diagnostics.lab.thr.pinAnchored":"refereret til pin-kontakt","diagnostics.lab.thr.trailingPinGate":"sl\xE5et fra efter pinnen, indtil s\xE6dedybden er l\xE6rt","diagnostics.lab.thr.openGate":"aktiv efter opstartsstr\xF8m","diagnostics.lab.thr.ceilingDetail":"{s} s eller {counts} counts","diagnostics.lab.thr.wallDetail":"{s} s / {counts} counts \xB7 stemplet forlader huset","diagnostics.lab.thr.verdictNone":"Ingen sti udl\xF8ser p\xE5 dette trace.","diagnostics.lab.thr.verdictCeiling":"Loftet stopper motoren f\xF8rst ({t}, {counts} counts) - intet detekterede stoppet f\xF8r.","diagnostics.lab.thr.verdictLate":"{name} stopper f\xF8rst, ved {t} - efter 40 s-v\xE6ggen.","diagnostics.lab.thr.verdictFirst":"{name} stopper f\xF8rst, ved {t} ({ma}).","diagnostics.lab.thr.offScale":"Over grafen: {list}","diagnostics.lab.thr.rise":"Trailing-stigning","diagnostics.lab.thr.afterWall":"efter v\xE6ggen","diagnostics.lab.thr.notReached":"ikke p\xE5 dette trace","diagnostics.lab.thr.col.path":"Sti","diagnostics.lab.thr.col.threshold":"T\xE6rskel","diagnostics.lab.thr.col.fires":"Udl\xF8ser ved","diagnostics.lab.thr.col.counts":"Counts","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armPulseWait":"Venter p\xE5 latch-puls \u2014 pad 10 skal vise 3,3 V i ca. 5 s","diagnostics.lab.log.armProbeWait":"Firkant p\xE5 LATCH_ARM ved 100 Hz \u2014 U2 pin 1 skal vise ca. 0,5 V AC","diagnostics.lab.log.armProbe":"Clock-probe {hz} Hz \xD7 {cycles} cyklusser \u2014 armeret {armed} (f\xF8rst ved {at})","diagnostics.lab.log.armHigh":"Firmware-readback: pad 10 HIGH (GPIO17 drives)","diagnostics.lab.log.armGpio":"GPIO17 gik aldrig h\xF8j \u2014 pad 10 forblev LOW i firmware-readback","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.latchFaulted":"Fejl-latch armerede ikke \u2014 LATCH_STATE forblev h\xF8j efter pulsen","diagnostics.lab.log.enableFailed":"Driverne t\xE6ndte ikke \u2014 et fejlnet kan v\xE6re aktivt","diagnostics.lab.log.neverStarted":"Motoren startede aldrig (busy blev ved med at v\xE6re slukket)","diagnostics.lab.log.neverStartedFault":"Motoren n\xE6gtede at starte \u2014 zonen er blokeret af fejlen {fault}; tryk Nulstil fejl f\xF8rst","diagnostics.lab.faultLatch":"Latch","diagnostics.lab.latchBanner":"Fejl-latch armerede ikke: LATCH_STATE forblev h\xF8j efter arm-pulsen. Firmware kan ikke l\xE6se FAULT_N_RAW, s\xE5 \xE5rsagen kan ikke indkredses herfra. Enten er en driverfejl l\xE5st (tjek driver nFAULT, overstr\xF8mskomparatoren og 3V3_MOTOR), eller arm-clocken n\xE5ede aldrig flip-floppen (tjek R4, C4, Q1 og U2).","diagnostics.lab.armGpioBanner":"GPIO17 gik aldrig h\xF8j. Pad 10 skal vise 3,3 V mens der armeres. Hvis m\xE5leren bliver p\xE5 LOW, driver firmware ikke pinnen.","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.stopReason":"Stop\xE5rsag: {reason}","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.noEndstop":"Ingen {direction}-endstop i {seconds}s \u2014 stadig fri l\xF8b; pr\xF8v efter fuld seat, eller h\xE6v safe runtime","diagnostics.lab.log.falseEndpoint":"Firmwaren accepterede et {direction}-endpoint efter {seconds}s, som tracen ikke viser \u2014 en falsk udl\xF8sning; se stop\xE5rsagen","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.manualMove":"Manuel {direction} p\xE5 zone {zone} i {seconds}s","diagnostics.lab.log.manualStop":"Motorstop sendt til zone {zone}","diagnostics.lab.log.faultReset":"Fejl nulstillet p\xE5 zone {zone}","diagnostics.lab.log.faultResetFailed":"Nulstilling afvist p\xE5 zone {zone} (motoren k\xF8rer eller hardwarefejl er stadig aktiv)","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.spurious":"Tacho-t\xE6llingen stiger mens str\xF8mmen stiger \u2014 kanterne er b\xF8rste-gnister, ikke kommutationer. Kadence og t\xE6lling er ikke trov\xE6rdige i resten af dette slag.","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.kvCurve":"Relativ Kv (\xE5bningsmodel)","diagnostics.lab.kvHint":"Bruges af flowallokatoren","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.pad10":"Pad 10 ARM","diagnostics.lab.pad10nsleep":"Pad 10 nSLEEP","diagnostics.lab.pad9":"Pad 9 STATE","diagnostics.lab.pad9fault":"Pad 9 FAULT_N","diagnostics.lab.pad11":"Pad 11 EN","diagnostics.lab.railOc":"Rail OC","diagnostics.lab.usbFault":"USB fault","diagnostics.lab.baseline":"Baseline","diagnostics.lab.ceiling":"Ceiling","diagnostics.lab.openTrip":"Open trip","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 Motor Lab holder baggrundspoll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},Nr="en".toLowerCase(),Bn=Ya[Nr]?Nr:"en";function p(t,e){let a=Ya[Bn]&&Ya[Bn][t]||Ya.en[t]||t;return e?String(a).replace(/\{(\w+)\}/g,(n,r)=>e[r]==null?"":String(e[r])):a}function N(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=p(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",p(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",p(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",p(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Bn);var Rr={home:"zone.learning.phase.home",open:"zone.learning.phase.open",close:"zone.learning.phase.close",done:"zone.learning.phase.done",failed:"zone.learning.phase.failed"},el=new Set(["home","open","close","failed"]);function ht(t){let e=String(A(g.state(t))||"").toUpperCase(),a=Math.max(0,Math.min(100,Number(F(g.motorLearnPct(t)))||0)),n=String(A(g.motorLearnPhase(t))||""),r=Number(F(g.motorLearnSample(t)))||0,o=Number(F(g.motorLearnSamplesNeeded(t)))||0,i=e==="CALIBRATING"||el.has(n)||a>0&&a<100,l=p("zone.learning.calibrating");return n&&Rr[n]&&(l=p(Rr[n]),(n==="open"||n==="close")&&o>0&&(l=p("zone.learning.phase.pass",{phase:l,sample:Math.min(r+1,o)||1,need:o}))),n==="done"&&(l=p("zone.learning.phase.done")),n==="failed"&&(l=p("zone.learning.phase.failed")),{active:i,pct:a,phase:n,sample:r,need:o,label:l}}var Tt=null,Pr=null,Dr=null,Or=null,jn=null,Vn=null,nt=null,Ja=null,Un=!1;function We(){return!!R("motorLabBusy")||Un}function Kn(){Ja&&clearTimeout(Ja);let t=Math.max(50,Go()+50);Ja=setTimeout(()=>{if(Ja=null,!We()){if(An()){Kn();return}pa()}},t)}async function tl(){Tt&&Tt.abort(),Tt=new AbortController;let t=await fetch("/api/v1/state",{cache:"no-store",signal:Tt.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function $r(){for(let t=1;t<=6;t++)if(ht(t).active)return!0;return!1}function al(){let t=$r()&&!We();t&&!nt?nt=setInterval(()=>{if(We()||!$r()){clearInterval(nt),nt=null;return}pa()},1e3):!t&&nt&&(clearInterval(nt),nt=null)}function Ir(t){if(!(!t||typeof t!="object")){if(An()){Kn();return}for(let e in t)y(e,t[e]);ia(!1),al()}}function nl(t){if(t){if(!t.type){Ir(t);return}if(t.type==="state"){Ir(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;X(e),String(e).indexOf("I2C_SCAN:")!==-1&&Ht(String(e))}}}function ol(){We()||In(),Pr||(Pr=setInterval(()=>{We()||In()},300*1e3)),We()||qn(),Dr||(Dr=setInterval(()=>{We()||qn()},3e3))}function pa(){We()||tl().then(t=>{We()||(gt(!0),nl(t),ol())}).catch(()=>{We()||gt(!1)})}async function rl(){try{if(We())return;let t=await fetch("/api/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),a=e&&e.data,n=a&&a.data_revision,r=a&&a.runtime_revision;a&&a.uptime_s!=null&&y(s.uptime,{value:Number(a.uptime_s)});let o=jn===null||n!==jn,i=r!=null&&(Vn===null||r!==Vn);(o||i)&&(jn=n,r!=null&&(Vn=r),pa()),gt(!0)}catch(t){We()||gt(!1)}}function sl(){Un=!0,Tt&&(Tt.abort(),Tt=null),nt&&(clearInterval(nt),nt=null)}function il(){Un=!1,pa()}function Hr(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){ir();return}K("motorLabBusy",()=>{R("motorLabBusy")?sl():il()}),K("pendingWrites",()=>{R("pendingWrites")===0&&Kn()}),pa(),Or||(Or=setInterval(rl,1e3))}var qr=Object.create(null);function O(t,e){if(qr[t])return;qr[t]=1;let a=document.createElement("style");a.textContent=e,document.head.appendChild(a)}var Br=`/* Generated from LDS tokens.json by generate_tokens.py. Do not edit. */
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
.lune-mark .pipe.is-calling { stroke: var(--pipe-calling); }
.lune-mark .pipe.is-idle { stroke: var(--pipe-idle); opacity: .42; }
.lune-mark .pipe.is-unused { stroke: var(--pipe-unused); }
.lune-mark .pipe.is-focus { stroke-width: 8.5; }
.lune-mark .sku, .lune-mark .word { fill: var(--brand-word, #FAF6EF); font-family: var(--font-ui); font-weight: 700; }
`;O("lds-tokens",Br);var jr=`
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
`;function Et(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Vr(t,e,a){let n=Number(e),r=Number(a),o=Number(t),i=r-n;return!Number.isFinite(n)||!Number.isFinite(r)||!Number.isFinite(o)||i===0?0:Math.min(100,Math.max(0,(o-n)/i*100))}function Wn({id:t,markHtml:e="",target:a,current:n,min:r=5,max:o=35,step:i=.5,unit:l="C",label:u,disabled:f=!1}={}){let w=t||"lds-dial",c=Et(u||"Temperature target"),b=Number(a),x=Number(n),k=Number.isFinite(b)?b.toFixed(1):"\u2014",L=Number.isFinite(x)?x.toFixed(1):"\u2014",_=l==="C"||l==="\xB0C"||l==="\xB0"?"\xB0":Et(l),S=f?' aria-disabled="true"':"";return`<div class="lds-dial" id="${Et(w)}" role="group" aria-label="${c}" data-dial-min="${r}" data-dial-max="${o}" data-dial-unit="${Et(_)}"${S}>
  <div class="lds-dial-arc">
    ${e}
    <div class="lds-dial-readout">
      <div class="lds-dial-target"><span data-dial-target>${k}</span><span class="lds-dial-unit">${_}</span></div>
      <div class="lds-dial-current" data-dial-current>Current ${L}${_}</div>
    </div>
    <span class="lds-dial-live" data-dial-live aria-live="polite">${k}${_}</span>
  </div>
  <div class="lds-dial-steps">
    <button type="button" class="lds-dial-step" data-dial-step="${i}" aria-label="Increase" ${f?"disabled":""}>+</button>
    <button type="button" class="lds-dial-step" data-dial-step="-${i}" aria-label="Decrease" ${f?"disabled":""}>\u2212</button>
  </div>
</div>`}function Zn(t,{target:e,current:a,disabled:n,states:r,selected:o}={}){let i=typeof t=="string"?document.querySelector(t):t;if(!i)return;let l=i.dataset.dialUnit||"\xB0",u=Number(e),f=Number(a),w=Number.isFinite(u)?u.toFixed(1):"\u2014",c=Number.isFinite(f)?f.toFixed(1):"\u2014",b=i.querySelector("[data-dial-target]"),x=i.querySelector("[data-dial-current]"),k=i.querySelector("[data-dial-live]");b&&(b.textContent=w),x&&(x.textContent=`Current ${c}${l}`),k&&(k.textContent=`${w}${l}`),r&&i.querySelectorAll(".pipe").forEach((L,_)=>{let S=r[_]||"idle";L.setAttribute("class",`pipe is-${S}${_===o?" is-focus":""}`)}),n!=null&&(i.setAttribute("aria-disabled",n?"true":"false"),i.querySelectorAll(".lds-dial-step").forEach(L=>{L.disabled=!!n}))}function Gn(t,e={}){let a=typeof t=="string"?document.querySelector(t):t;if(!a)return()=>{};let n=r=>{var l;let o=r.target.closest("button.lds-dial-step[data-dial-step]");if(!o||!a.contains(o)||o.disabled)return;let i=parseFloat(o.getAttribute("data-dial-step"));if(Number.isFinite(i)){if(e.onStep)e.onStep(i);else if(e.onChange){let u=parseFloat(a.dataset.dialMin),f=parseFloat(a.dataset.dialMax),w=parseFloat((l=a.querySelector("[data-dial-target]"))==null?void 0:l.textContent),c=Number.isFinite(w)?w:20,b=Math.min(f,Math.max(u,Math.round((c+i)*10)/10));e.onChange(b)}}};return a.addEventListener("click",n),()=>a.removeEventListener("click",n)}function Xn({remaining:t="",hint:e="Temporary command from Lune Touch"}={}){return`<div class="lds-override-banner ui-override-banner" data-override-banner ${!String(t||"").trim()?"hidden":""}>
  <div class="lds-override-main ui-override-main">
    <strong data-override-remaining>${Et(t)}</strong>
    <small data-override-hint>${Et(e)}</small>
  </div>
</div>`}function Yn(t,{remaining:e="",hint:a}={}){var u;let n=typeof t=="string"?document.querySelector(t):t;if(!n)return;let r=(u=n.matches)!=null&&u.call(n,"[data-override-banner]")?n:n.querySelector("[data-override-banner]");if(!r)return;let o=r.querySelector("[data-override-remaining]"),i=r.querySelector("[data-override-hint]"),l=String(e||"").trim();r.hidden=!l,o&&(o.textContent=l),i&&a!==void 0&&(i.textContent=a)}function Jn({min:t=5,max:e=35,step:a=.5,value:n=21,label:r="Comfort setpoint",disabled:o=!1}={}){let i=Number(n),l=Number.isFinite(i)?i.toFixed(1):"\u2014",u=Vr(i,t,e),f=o?" disabled":"";return`<div class="lds-slider-row slider-row" data-lds-slider-row>
  <input data-comfort-slider type="range" min="${t}" max="${e}" step="${a}" value="${Number.isFinite(i)?i:t}" aria-label="${Et(r)}" style="--slider-fill:${u}%"${f}>
  <strong data-slider-value>${l}\xB0</strong>
</div>`}function Qa(t){if(!t)return;let e=t.min,a=t.max,n=t.value,r=Vr(n,e,a);t.style.setProperty("--slider-fill",`${r}%`)}var en=`
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
`;function Ur(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Re({on:t=!1,disabled:e=!1,label:a="",title:n="",attrs:r="",className:o=""}={}){let i=["lds-nav-switch","nav-switch",t?"is-on":"",e?"is-disabled":"",o].filter(Boolean).join(" "),l=Ur(a||n||"Toggle"),u=n||a?` title="${Ur(n||a)}"`:"";return`<button type="button" class="${i}" role="switch" aria-checked="${t?"true":"false"}" aria-label="${l}"${u}${e?" disabled":""} data-lds-nav-switch ${r}></button>`}function tn(t,{on:e,disabled:a}={}){var r,o;if(!t)return;let n=(r=t.matches)!=null&&r.call(t,"[data-lds-nav-switch]")?t:(o=t.querySelector)==null?void 0:o.call(t,"[data-lds-nav-switch]");n&&(e!==void 0&&(n.classList.toggle("is-on",!!e),n.setAttribute("aria-checked",e?"true":"false")),a!==void 0&&(n.classList.toggle("is-disabled",!!a),n.disabled=!!a))}var Kr=`
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
`;function xe({titleHtml:t="",bodyHtml:e="",className:a="",attrs:n=""}={}){return`<div class="${["lds-settings-card","ui-card",a].filter(Boolean).join(" ")}" data-lds-settings-card ${n}>
  <div class="lds-settings-card-title ui-card-title"><span class="ui-title-text">${t}</span></div>
  <div class="lds-settings-card-body">${e}</div>
</div>`}O("lds-comfort-control",jr);O("lds-nav-switch",en);O("lds-settings-card",Kr);var cl=`
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
`;O("ui-kit",cl);function Ce(t){let e=p(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function dl(t,e){let a=Math.abs(Number(t));return!Number.isFinite(a)||a<1e3?e:Math.pow(10,Math.floor(Math.log10(a))-1)}function pl(t){let e=String(t),a=e.indexOf(".");return a<0?0:e.length-a-1}function Le(t,e={}){let a=!!e.immediate,n=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',n?n.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r),a&&(r.hidden=!0);let o=[],i=()=>{a||r.classList.toggle("show",o.some(v=>v.dirty))},l=v=>{v.dirty&&(v.commit&&Promise.resolve(v.commit()).catch(()=>{}),v.dirty=!1,i())},u=(v,d)=>{v.dirty=d,a&&d?l(v):i()};function f(v){return v.markDirty=()=>u(v,!0),o.push(v),v}function w(v,d){let m={dirty:!1,input:v},h=d.baseStep!=null?d.baseStep:parseFloat(v.step)||1,z=pl(h),T=d.min!=null?d.min:v.min!==""?parseFloat(v.min):-1/0,W=d.max!=null?d.max:v.max!==""?parseFloat(v.max):1/0,D=j=>z>0?Number(j).toFixed(z):String(Math.round(Number(j)));if(!d.nostep){let j=document.createElement("div");j.className="ui-stepper",v.parentNode.insertBefore(j,v);let J=document.createElement("button");J.type="button",J.className="ui-step-btn",J.textContent="\u2212",J.setAttribute("aria-label",p("common.decrease"));let ae=document.createElement("button");ae.type="button",ae.className="ui-step-btn",ae.textContent="+",ae.setAttribute("aria-label",p("common.increase")),j.appendChild(J),j.appendChild(v),j.appendChild(ae);let B=V=>{if(v.disabled)return;let ie=parseFloat(v.value);Number.isFinite(ie)||(ie=parseFloat(v.placeholder)),Number.isFinite(ie)||(ie=0);let Z=Math.min(W,Math.max(T,ie+V*dl(ie,h)));v.value=D(Z),u(m,!0)};J.addEventListener("click",()=>B(-1)),ae.addEventListener("click",()=>B(1)),v.addEventListener("keydown",V=>{V.key==="Enter"&&v.blur()})}return v.addEventListener("input",()=>u(m,!0)),m.sync=()=>{let j=d.read();v.value=j!=null&&Number.isFinite(Number(j))?D(j):""},m.commit=()=>{let j=parseFloat(v.value);Number.isFinite(j)&&d.commit(Math.min(W,Math.max(T,j)))},f(m)}function c(v,d){let m={dirty:!1,input:v};v.addEventListener("input",()=>{m.dirty=!0,i()});let h=()=>{m.dirty&&a&&l(m)};return v.addEventListener("blur",h),v.addEventListener("keydown",z=>{z.key==="Enter"&&(z.preventDefault(),v.blur())}),m.sync=()=>{let z=d.read();v.value=z!=null?z:""},m.commit=()=>d.commit(v.value.trim()),f(m)}function b(v,d){let m={dirty:!1,input:v};return v.addEventListener("change",()=>u(m,!0)),m.sync=()=>{let h=d.read();h!=null&&(v.value=h)},m.commit=()=>d.commit(v.value),f(m)}function x(v,d){let m={dirty:!1,input:v,staged:!1},h=v.closest(".ui-row"),z=()=>{tn(v,{on:m.staged}),h&&h.classList.toggle("is-on",m.staged),d.onChange&&d.onChange(m.staged)};return v.addEventListener("click",()=>{m.staged=!m.staged,u(m,!0),z()}),m.sync=()=>{m.staged=!!d.read(),z()},m.commit=()=>d.commit(m.staged),f(m)}function k(v){let d={dirty:!1,sync:v.sync,commit:v.commit};return f(d)}let L=()=>o.forEach(v=>{!v.dirty&&v.sync&&v.sync()}),_=()=>{o.forEach(v=>{v.dirty&&(v.commit&&Promise.resolve(v.commit()).catch(()=>{}),v.dirty=!1)}),i(),e.onApply&&e.onApply()},S=()=>{o.forEach(v=>{v.dirty=!1,v.sync&&v.sync()}),i(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",_),r.querySelector(".ui-form-discard").addEventListener("click",S),N(r),{num:w,text:c,select:b,toggle:x,custom:k,refresh:L,apply:_,discard:S,isDirty:()=>o.some(v=>v.dirty)}}function Vt(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function ua(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function vt(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,a=t%86400/3600|0,n=t%3600/60|0;return e>0?e+"d "+a+"h "+n+"m":a>0?a+"h "+n+"m":n+"m"}var Wr=`
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
`;function Qn(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Zr({live:t=!1,label:e="Offline",uptime:a="---",ip:n="---",showUptime:r=!0,showIp:o=!0}={}){let i=t?"":" is-off",l=r?"":" hidden",u=o?"":" hidden";return`<div class="lds-live-status" data-lds-live-status>
  <div class="lds-live-row">
    <span class="lds-live${i}" data-lds-live><i aria-hidden="true"></i><span data-lds-live-label>${Qn(e)}</span></span>
    <span class="lds-live-uptime" data-lds-uptime${l}>${Qn(a)}</span>
  </div>
  <div class="lds-live-ip" data-lds-ip${u}>${Qn(n)}</div>
</div>`}function an(t,{live:e,label:a,uptime:n,ip:r}={}){var w,c;if(!t)return;let o=(w=t.matches)!=null&&w.call(t,"[data-lds-live-status]")?t:(c=t.querySelector)==null?void 0:c.call(t,"[data-lds-live-status]");if(!o)return;let i=o.querySelector("[data-lds-live]"),l=o.querySelector("[data-lds-live-label]"),u=o.querySelector("[data-lds-uptime]"),f=o.querySelector("[data-lds-ip]");i&&e!==void 0&&i.classList.toggle("is-off",!e),l&&a!==void 0&&l.textContent!==a&&(l.textContent=a),u&&n!==void 0&&u.textContent!==n&&(u.textContent=n),f&&r!==void 0&&f.textContent!==r&&(f.textContent=r)}var ul=`
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
`;O("hv6-header",ul);O("lds-live-status",Wr);O("lds-nav-switch",en);var ml=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><button type="button" class="v6-toolbar-icon" aria-label="Collapse navigation" aria-pressed="false"><svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM9 5v14"/></svg></button><div><p class="v6-toolbar-kicker" id="v6-view-kicker">Home</p><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button></div>
  </header>`,Ye=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,nn=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,gl=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${Ye('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span class="menu-label">Overview</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Zones</div>
      <div class="v6-nav-zones" data-zone-nav></div>
      <a href="#" class="v6-side-link v6-tab-zones" data-section="zones" hidden>${Ye('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span class="menu-label">Zones</span>${nn("warn")}</a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${Ye('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span class="menu-label">Diagnostics</span>${nn("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${Ye('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span class="menu-label">Motor lab</span></a>
    </div>
    <div class="v6-nav-group">
      <div class="v6-nav-heading">Settings</div>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="touch">${Ye('<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.5"/>')}<span class="menu-label">Touch</span>${nn()}</a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="hydraulics">${Ye('<path d="M4 18h16M7 18V9m5 9V5m5 13v-6"/>')}<span class="menu-label">Hydraulics</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="comfort">${Ye('<path d="M12 4v3M8 8l-2-2M16 8l2-2M6 13h12M9 13c0 4 3 7 3 7s3-3 3-7"/>')}<span class="menu-label">Comfort</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="motors">${Ye('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>')}<span class="menu-label">Motors</span></a>
      <a href="#" class="v6-side-link" data-section="settings" data-panel="device">${Ye('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>')}<span class="menu-label">Device</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${Ye('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span class="menu-label">More</span>${nn()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${Ye('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span class="menu-label">Help</span></a></div>
    ${Zr({live:!1,label:"Offline",uptime:"---",ip:"---"})}
  </nav>`,Gr={overview:["Overview / House status","System health & energy flow","Local heating status and current exceptions"],zones:["Controller details","Zones","Physical loops, applied targets and valve state"],diagnostics:["System","Diagnostics","Health, evidence and recovery"],motorlab:["System","Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Settings","Device configuration and safety"],help:["Utility","Help","Guidance for operating Lune V6"]},Xr={touch:["Settings","Touch","Approval and coordinator identity"],hydraulics:["Settings","Hydraulics","Heating mode, manifold probes and minimum flow"],comfort:["Settings","Comfort","Room clocks and preheat absorption"],motors:["Settings","Motors","Drivers, profile and learning limits"],device:["Settings","Device","Connection, firmware, backup and appearance"]};function Qr(t){t&&(Ve(t.section),t.focus==="touch"&&($a("touch"),requestAnimationFrame(()=>{let e=document.querySelector(".settings-touch-card");e&&e.scrollIntoView({behavior:"smooth",block:"center"})})))}function Yr(t){return t?t.kind==="touch"?p("status.attention.approveTouch"):t.kind==="faults"?t.count===1?p("status.attention.zoneFaultOne"):p("status.attention.zoneFaultMany",{count:t.count}):"":""}function bl(t){if(!me(g.enabled(t)))return"OFF";let e=String(A(g.state(t))||"").toUpperCase()||"OFF",a=String(A(g.motorLastFault(t))||"").toUpperCase();return e==="FAULT"||a&&a!=="NONE"&&a!=="OK"?"FAULT":e}function fl(t){return t==="OFF"?"is-off":t==="FAULT"?"is-fault":t==="OVERHEATED"?"is-overheated":t==="HEATING"||t==="CALLING"?"is-heating":t==="IDLE"?"is-idle":"is-online"}function hl(t){return t==="HEATING"||t==="CALLING"?p("state.heating"):t==="IDLE"?p("state.idle"):t==="FAULT"?p("common.fault"):t==="MANUAL"?p("state.manual"):t==="OVERHEATED"?p("state.overheated"):t==="CALIBRATING"?p("state.calibrating"):p("state.off")}function Jr(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}function vl(t){let e=$e(t);return e?`${Ge(t)} ${e}`:Ge(t)}H({tag:"hv6-header",render:ml,onMount(t,e){let a=e.querySelector("#v6-view-kicker"),n=e.querySelector("#v6-view-title"),r=e.querySelector("#v6-view-subtitle"),o=e.querySelector("#hdr-update"),i=e.querySelector("#hdr-attention"),l=e.querySelector(".v6-toolbar-icon");l&&l.addEventListener("click",()=>{let b=document.querySelector(".shell");if(!b)return;let x=b.classList.toggle("nav-collapsed");l.setAttribute("aria-pressed",String(x))});function u(){let b=R("firmwareUpdateAvailable");o.hidden=!b,b&&(o.textContent=p("status.updateAvailable",{version:b.latest}),o.title=p("settings.firmware.badgeTitle"))}function f(){let b=Cn(),x=R("section")||"overview",k=!!(b&&b.section!==x);i.hidden=!k,k?(i.textContent=Yr(b),i.title=Yr(b),i.dataset.kind=b.kind):delete i.dataset.kind}function w(){let b=R("selectedZone")||1,x=$e(b);return x?`${Ge(b)} \xB7 ${x}`:_e(b)}o.addEventListener("click",()=>{$a("device"),Ve("settings");let b=document.querySelector(".settings-firmware-card");b&&b.scrollIntoView({behavior:"smooth",block:"center"})}),i.addEventListener("click",()=>{Qr(Cn())});function c(){let b=R("section")||"overview",x=R("settingsPanel")||"touch",k=b==="settings"?Xr[x]||Xr.touch:Gr[b]||Gr.overview;a&&(a.textContent=k[0]),b==="zones"?(n.textContent=w(),r.textContent="Applied target, sensor coverage and local safety."):(n.textContent=k[1],r.textContent=k[2]),f()}K("section",c),K("settingsPanel",c),K("selectedZone",c),K("zoneNames",c),K("live",f),K("firmwareUpdateAvailable",u),M(s.authorityProposalPending,f);for(let b=1;b<=6;b++)M(g.state(b),f),M(g.motorLastFault(b),f);N(e),c(),u(),f()}});H({tag:"hv6-sidebar",render:gl,onMount(t,e){let a=e,n=e.querySelector(".v6-more-toggle"),r=e.querySelector('[data-section="settings"][data-panel="touch"]'),o=e.querySelector(".v6-tab-zones"),i=e.querySelector('[data-section="diagnostics"]'),l=e.querySelector("[data-zone-nav]"),u=0,f=Date.now(),w=!1;function c(v,d,m,h){if(!v)return;let z=v.querySelector("[data-nav-dot]");z&&(z.hidden=!d,d?(v.setAttribute("aria-label",`${m}, ${h}`),v.title=h):(v.removeAttribute("aria-label"),v.removeAttribute("title")))}function b(){let v=Oa(),d=Mn(),m=d===1?p("status.attention.zoneFaultOne"):p("status.attention.zoneFaultMany",{count:d});if(c(r,v,p("nav.settings"),p("status.attention.approveTouch")),c(o,d>0,p("nav.zones"),m),c(i,d>0,p("nav.diagnostics"),m),n){let h=n.querySelector("[data-nav-dot]");h&&(h.hidden=!v,h.classList.toggle("is-warn",!1)),v?(n.setAttribute("aria-label",p("status.attention.moreHasSettings")),n.title=p("status.attention.approveTouch")):(n.removeAttribute("aria-label"),n.removeAttribute("title"))}}function x(){if(!l)return;let v=R("selectedZone")||1,d=R("section")==="zones";l.innerHTML=Array.from({length:6},(m,h)=>{let z=h+1,T=d&&v===z,W=vl(z),D=bl(z),j=hl(D),J=`${W}: ${j}`,ae=Jr(W),B=Jr(J),V=fl(D),ie=D==="FAULT"?"!":"",Z=me(g.enabled(z)),Ue=Z?p("common.enabled"):p("common.disabled"),_t=Re({on:Z,title:Ue,label:`${W}: ${Ue}`,attrs:`data-toggle-zone="${z}"`});return`<div class="v6-nav-row"><button type="button" class="v6-side-link${T?" active":""}" data-section="zones" data-select-zone="${z}" ${T?'aria-current="page"':""} title="${B}" aria-label="${B}"><span class="dot ${V}" aria-hidden="true">${ie}</span><span class="menu-label">${ae}</span></button>${_t}</div>`}).join("")}function k(){if(!w){an(e,{uptime:"---"});return}let v=Math.max(0,Math.floor((Date.now()-f)/1e3));an(e,{uptime:vt(u+v)})}function L(){let v=!!R("live");an(e,{live:v,label:v?p("status.live"):p("status.offline"),ip:A(s.ip)||"---"});let d=F(s.uptime);if(d!=null&&!isNaN(d)&&d>=0){let m=d|0;(!w||m!==u)&&(u=m,f=Date.now(),w=!0)}k()}function _(){let v=R("section"),d=R("settingsPanel")||"touch";if(e.querySelectorAll("[data-section]").forEach(m=>{if(m.hasAttribute("data-select-zone"))return;let h=m.dataset.section===v&&v!=="zones";h&&m.dataset.panel&&(h=m.dataset.panel===d),h&&!m.dataset.panel&&v==="settings"&&(h=!1),m.classList.toggle("active",h),m.setAttribute("aria-current",h?"page":"false")}),o){let m=v==="zones";o.classList.toggle("active",m),o.setAttribute("aria-current",m?"page":"false")}x(),b(),L()}e.addEventListener("click",v=>{let d=v.target.closest("[data-toggle-zone]");if(d&&e.contains(d)){v.preventDefault(),v.stopPropagation();let T=Number(d.dataset.toggleZone);T>=1&&T<=6&&mr(T,!me(g.enabled(T)));return}let m=v.target.closest("[data-select-zone]");if(m){v.preventDefault(),Lt(Number(m.dataset.selectZone)),Ve("zones"),a.classList.contains("more-open")&&(a.classList.remove("more-open"),n&&n.setAttribute("aria-expanded","false"));return}let h=v.target.closest("[data-section]");if(!h||!e.contains(h)||h.classList.contains("v6-more-toggle"))return;v.preventDefault();let z=h.dataset.section;h.dataset.panel&&$a(h.dataset.panel),z==="settings"&&Oa()&&(!h.dataset.panel||h.dataset.panel==="touch")?Qr({kind:"touch",section:"settings",focus:"touch"}):Ve(z),a.classList.contains("more-open")&&(a.classList.remove("more-open"),n&&n.setAttribute("aria-expanded","false"))}),n&&n.addEventListener("click",()=>{let v=a.classList.toggle("more-open");n.setAttribute("aria-expanded",String(v))}),K("section",_),K("settingsPanel",_),K("selectedZone",_),K("zoneNames",_),K("live",_),M(s.ip,L),M(s.uptime,L);let S=setInterval(k,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(S),{once:!0}),M(s.authorityProposalPending,b);for(let v=1;v<=6;v++)M(g.state(v),_),M(g.enabled(v),_),M(g.motorLastFault(v),_),M(g.temp(v),()=>{});N(e),_()}});var xl=`
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
`;O("connectivity-card",xl);var yl=()=>`
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
`,pu=H({tag:"connectivity-card",render:yl,onMount(t,e){let a=e.querySelector(".cc-ip"),n=e.querySelector(".cc-ssid"),r=e.querySelector(".cc-mac"),o=e.querySelector(".cc-up"),i=e.querySelector(".cc-ver"),l=0,u=Date.now(),f=!1;function w(){if(!f){o.textContent="---";return}let x=Math.max(0,Math.floor((Date.now()-u)/1e3)),k=vt(l+x);o.textContent!==k&&(o.textContent=k)}function c(){a.textContent=A(s.ip)||"---",n.textContent=A(s.ssid)||"---",r.textContent=A(s.mac)||"---",i.textContent=A(s.firmware)||"---";let x=F(s.uptime);if(x!=null&&!isNaN(x)&&x>=0){let k=x|0;(!f||k!==l)&&(l=k,u=Date.now(),f=!0)}w()}M(s.ip,c),M(s.ssid,c),M(s.mac,c),M(s.firmware,c),M(s.uptime,c);let b=setInterval(w,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(b),{once:!0}),N(e),c()}});var wl="http://www.w3.org/2000/svg",kl=`
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
`;O("chart-kit",kl);function I(t,e,a){let n=document.createElementNS(wl,t);if(e)for(let r in e)n.setAttribute(r,e[r]);return a!=null&&(n.textContent=a),n}function Ut(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(n=>`${n.x.toFixed(2)} ${n.y.toFixed(2)}`).join(" L ");let e=.16,a=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let n=0;n<t.length-1;n++){let r=t[n-1]||t[n],o=t[n],i=t[n+1],l=t[n+2]||i,u=o.x+(i.x-r.x)*e,f=o.y+(i.y-r.y)*e,w=i.x-(l.x-o.x)*e,c=i.y-(l.y-o.y)*e;a+=` C ${u.toFixed(2)} ${f.toFixed(2)}, ${w.toFixed(2)} ${c.toFixed(2)}, ${i.x.toFixed(2)} ${i.y.toFixed(2)}`}return a}function on(t,e,a){let n=t.filter(l=>Number.isFinite(l));if(!n.length)return{min:e,max:a};let r=Math.min(...n),o=Math.max(...n);r===o&&(r-=1,o+=1);let i=(o-r)*.12;return{min:r-i,max:o+i}}function it(t,e,a){let n=document.createElement("div");n.className="chart-tooltip",e.appendChild(n);let r=I("g",{class:"chart-cursor",style:"display:none"}),o=I("line",{class:"chart-cursor-line",y1:a.plotTop,y2:a.plotBottom});r.appendChild(o);let i=[];t.appendChild(r);function l(c){let b=0,x=1/0;for(let k=0;k<a.count;k++){let L=Math.abs(c-a.xAt(k));L<x&&(x=L,b=k)}return b}function u(c){let b=t.getScreenCTM();if(!b)return null;let x=t.createSVGPoint();return x.x=c.clientX,x.y=c.clientY,x.matrixTransform(b.inverse())}function f(c){if(!a.count)return;let b=u(c);if(!b)return;let x=l(b.x),k=a.xAt(x);o.setAttribute("x1",k),o.setAttribute("x2",k);let L=a.dots(x);for(;i.length<L.length;){let d=I("circle",{class:"chart-cursor-dot",r:3.4});r.appendChild(d),i.push(d)}i.forEach((d,m)=>{m<L.length?(d.setAttribute("cx",k),d.setAttribute("cy",L[m].y),d.setAttribute("fill",L[m].color),d.style.display=""):d.style.display="none"}),r.style.display="";let _=a.rows(x).map(d=>`<div class="tt-row"><span class="tt-swatch" style="background:${d.color}"></span>${d.label}<span class="tt-val">${d.value}</span></div>`).join("");n.innerHTML=`<div class="tt-time">${a.label(x)}</div>${_}`,n.classList.add("show");let S=e.getBoundingClientRect(),v=c.clientX-S.left+14;v+n.offsetWidth>S.width-6&&(v=c.clientX-S.left-n.offsetWidth-14),n.style.left=Math.max(6,v)+"px",n.style.top=Math.max(6,c.clientY-S.top+12)+"px"}function w(){n.classList.remove("show"),r.style.display="none"}return t.addEventListener("pointermove",f),t.addEventListener("pointerleave",w),()=>{t.removeEventListener("pointermove",f),t.removeEventListener("pointerleave",w),n.remove()}}var ma=1e3,eo=180,Je=14,_l=42,Sl=44,yt=42,ln=ma-yt-_l,xt=eo-Je-Sl,Nt=Je+xt,to=24*3600,es=Te+2,ts=Te+3,rn=Te+4,zl="var(--series-warm)",Ml="var(--series-cool)",as="var(--series-solar)",Cl=`
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
`;O("graph-widgets",Cl);var ns=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',os=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Ll=t=>t.variant==="flow-return"?`<div class="graph-widgets">${ns()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${os()}</div>`:`<div class="graph-widgets">${ns()}${os()}</div>`;function rs(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function Al(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function ga(t,e,a){let n=[];for(let r=0;r<t.length;r++){let o=t[r];if(!o||o[0]<a)continue;let i=o[e];i==null||!Number.isFinite(i)||n.push({t:o[0],v:i})}return n}var cn=(t,e)=>yt+Math.max(0,Math.min(1,(t-e)/to))*ln;function Fl(t,e,a){let n=Number(Date.now()/1e3)|0,r=3600,o=Math.ceil((n-to)/r)*r,i=Math.floor(n/r)*r,l=Math.floor(n/r)*r;for(let f=o;f<=i;f+=r){let w=a-(n-f),c=cn(w,e),b=new Date(f*1e3),x=f===l,k=Nt+16;t.appendChild(I("text",{x:c,y:k,"text-anchor":"end",transform:`rotate(-45 ${c.toFixed(1)} ${k})`,class:"chart-hour"+(x?" now":"")},String(b.getHours()).padStart(2,"0")))}let u=cn(a,e);t.appendChild(I("line",{x1:u,y1:Je,x2:u,y2:Nt,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Tl(t){let e=[];if(t.forEach(o=>o.forEach(i=>e.push(i.v))),!e.length)return{min:0,max:10};let a=Math.min(...e),n=Math.max(...e);a===n&&(a-=.5,n+=.5);let r=(n-a)*.1;return a-=r,n+=r,{min:a,max:n}}function El(t,e,a){let n=t.filter(r=>r.unit==="C").map(r=>ga(e,r.index,a));return Tl(n)}function ss(t,e,a,n,r,o){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${ma} ${eo}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let i=a.map(S=>ga(n,S.index,r)),l=a.filter(S=>S.unit==="C"),u=l.some(S=>ga(n,S.index,r).length>0);if(!i.some(S=>S.length)||l.length&&!u&&!a.some(S=>S.unit==="%"&&ga(n,S.index,r).some(v=>v.v>0))){let S=l.length&&!u?p("overview.graph.noData"):p("overview.graph.collecting");return t.appendChild(I("text",{x:ma/2,y:eo/2,"text-anchor":"middle",class:"chart-empty"},S)),null}let w=El(a,n,r),c=Math.max(.001,w.max-w.min),b=S=>Je+(1-(S-w.min)/c)*xt,x=S=>Je+(1-Math.max(0,Math.min(100,S))/100)*xt,k=(S,v)=>S.unit==="%"?x(v):b(v);for(let S=0;S<3;S++){let v=S/2,d=Je+v*xt;t.appendChild(I("line",{x1:yt,y1:d,x2:yt+ln,y2:d,class:"chart-grid"})),a.some(m=>m.unit==="C")&&t.appendChild(I("text",{x:yt-6,y:d+4,"text-anchor":"end",class:"chart-tick"},rs(w.max-c*v,"C")+"\xB0")),a.some(m=>m.unit==="%")&&t.appendChild(I("text",{x:yt+ln+6,y:d+4,"text-anchor":"start",class:"chart-tick"},rs(100-100*v,"%")))}t.appendChild(I("line",{x1:yt,y1:Nt,x2:yt+ln,y2:Nt,class:"chart-axis"})),a.some(S=>S.unit==="C")&&t.appendChild(I("text",{x:9,y:Je+xt/2,transform:`rotate(-90 9 ${(Je+xt/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},p("overview.graph.axis.temp"))),a.some(S=>S.unit==="%")&&t.appendChild(I("text",{x:ma-9,y:Je+xt/2,transform:`rotate(90 ${ma-9} ${(Je+xt/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},p("overview.graph.axis.demand"))),Fl(t,r,o),a.forEach((S,v)=>{let d=i[v].map(h=>({x:cn(h.t,r),y:k(S,h.v)}));if(!d.length)return;let m=Ut(d);S.fill&&t.appendChild(I("path",{d:m+` L ${d[d.length-1].x.toFixed(1)} ${Nt} L ${d[0].x.toFixed(1)} ${Nt} Z`,fill:S.fill,stroke:"none"})),t.appendChild(I("path",{d:m,fill:"none",stroke:S.color,"stroke-width":String(S.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let L=[];for(let S=0;S<n.length;S++){let v=n[S];if(!v||v[0]<r)continue;let d=a.map(m=>v[m.index]);d.every(m=>m==null||!Number.isFinite(m))||L.push({t:v[0],vals:d})}if(!L.length)return null;let _=Date.now();return it(t,e,{count:L.length,plotTop:Je,plotBottom:Nt,xAt:S=>cn(L[S].t,r),label:S=>new Date(_-(o-L[S].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:S=>a.map((v,d)=>({y:k(v,L[S].vals[d]),color:v.color})).filter((v,d)=>Number.isFinite(L[S].vals[d])),rows:S=>a.map((v,d)=>({color:v.color,label:v.label,value:Al(L[S].vals[d],v.unit)})).filter((v,d)=>Number.isFinite(L[S].vals[d]))})}function sn(t,e,a){let n=ga(t,e,a);return n.length?n[n.length-1].v:null}var yu=H({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:Ll,onMount(t,e){let a=e.querySelector(".gw-dt"),n=e.querySelector(".gw-demand-text"),r=e.querySelector(".gw-flow"),o=e.querySelector(".gw-demand"),i=Array.from(e.querySelectorAll(".gw-toggle")),l={flow:!0,return:!0,demand:!0},u=null,f=null;function w(){i.forEach(x=>{let k=x.dataset.layer;x.classList.toggle("is-off",!l[k]),x.setAttribute("aria-pressed",l[k]?"true":"false")})}function c(){let x=[];return l.flow&&x.push({index:es,color:zl,label:p("overview.graph.layers.flow"),unit:"C",width:2.4}),l.return&&x.push({index:ts,color:Ml,label:p("overview.graph.layers.return"),unit:"C",width:2}),l.demand&&x.push({index:rn,color:as,label:p("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),x}function b(){let x=R("zoneStateHistory"),k=x&&Array.isArray(x.entries)?x.entries:[],L=x&&x.uptime_s||Number(Date.now()/1e3)|0,_=L-to;if(r){u&&u();let S=sn(k,es,_),v=sn(k,ts,_),d=sn(k,rn,_),m=[];S!=null&&v!=null&&m.push("\u0394 "+(S-v).toFixed(1)+"\xB0"),d!=null&&m.push(Math.round(d)+"%"),a.textContent=m.length?m.join(" \xB7 "):"\u2014",u=ss(r,r.closest(".chart-card"),c(),k,_,L)}if(o){f&&f();let S=sn(k,rn,_);n.textContent=S!=null?Math.round(S)+"%":"\u2014",f=ss(o,o.closest(".chart-card"),[{index:rn,color:as,label:p("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],k,_,L)}}i.forEach(x=>{x.addEventListener("click",()=>{let k=x.dataset.layer;l[k]=!l[k],!l.flow&&!l.return&&!l.demand&&(l[k]=!0),w(),b()})}),K("zoneStateHistory",b),N(e),w(),b()}});var wt={0:{labelKey:"state.off",color:"var(--tl-off)"},1:{labelKey:"state.manual",color:"var(--tl-manual)"},2:{labelKey:"state.calibrating",color:"var(--tl-calibrating)"},3:{labelKey:"state.waitCal",color:"var(--text-faint)"},4:{labelKey:"state.waitTemp",color:"var(--text-faint)"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"var(--tl-idle)"},7:{labelKey:"state.overheated",color:"var(--tl-overheated)"},255:{labelKey:"",color:"transparent"}},ba=24*3600,Nl=ba,fa=28,oo=8,Rt=72,pn=48,Kt=8,un=16,cs=10,ds="var(--tl-absorb)",ps="var(--tl-absorb-armed)",ao=14,is=Te+1,us=Kt+Te*(fa+oo)-oo,no=us+cs,dn=us+cs+un+pn,Rl=`
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
`;O("zone-state-timeline",Rl);var Pl=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Dl(t,e){if(!t||!t.entries||t.entries.length===0)return null;let a=t.entries,n=t.uptime_s||e||0,r=Number(Date.now()/1e3)|0,o=1e3,i=o-Rt;function l(d){let m=(d+ba)/Nl;return Rt+Math.max(0,Math.min(1,m))*i}function u(d){return d-n}let f="http://www.w3.org/2000/svg",w=document.createElementNS(f,"svg");w.setAttribute("viewBox","0 0 "+o+" "+dn),w.classList.add("timeline-svg");let c=document.createElementNS(f,"rect");c.setAttribute("x",Rt),c.setAttribute("y",Kt),c.setAttribute("width",i),c.setAttribute("height",dn-Kt-pn),c.setAttribute("fill","transparent"),c.setAttribute("rx","0"),w.appendChild(c);let b=l(0),x=[-24,-18,-12,-6,0].map(d=>d*3600);for(let d of x){let m=l(d),h=document.createElementNS(f,"line");h.setAttribute("x1",m),h.setAttribute("y1",Kt),h.setAttribute("x2",m),h.setAttribute("y2",dn-pn),h.setAttribute("stroke",d===0?"var(--series-solar)":"var(--separator)"),h.setAttribute("stroke-width","1"),d===0&&(h.setAttribute("stroke-dasharray","3 4"),h.setAttribute("opacity",".7"),h.setAttribute("vector-effect","non-scaling-stroke")),w.appendChild(h)}w.appendChild(Ol(f,"text",{x:b+6,y:Kt+14,"text-anchor":"start",fill:"var(--accent)","font-size":"12","font-family":"var(--font-ui)","font-weight":"650"},"now"));for(let d=0;d<Te;d++){let m=Kt+d*(fa+oo),h=document.createElementNS(f,"rect");h.setAttribute("x",Rt),h.setAttribute("y",m),h.setAttribute("width",i),h.setAttribute("height",fa),h.setAttribute("fill",d%2===0?"var(--inset)":"transparent"),w.appendChild(h);let z=document.createElementNS(f,"text");z.setAttribute("x",Rt-8),z.setAttribute("y",m+fa/2+1),z.setAttribute("text-anchor","end"),z.setAttribute("dominant-baseline","middle"),z.setAttribute("fill","var(--text-muted)"),z.setAttribute("font-size","13"),z.setAttribute("font-family","var(--font-ui)"),z.setAttribute("font-weight","650"),z.textContent="Z"+(d+1),w.appendChild(z);let T=a.map(D=>({rel:u(D[0]),state:D[d+1]})).filter(D=>D.rel>=-ba&&D.rel<=0),W=(D,j,J)=>{if(J===255)return;let ae=wt[J]||wt[255];if(ae.color==="transparent")return;let B=l(D),V=l(j),ie=Math.max(1,V-B),Z=document.createElementNS(f,"rect");Z.setAttribute("x",B),Z.setAttribute("y",m+(fa-ao)/2),Z.setAttribute("width",ie),Z.setAttribute("height",ao),Z.setAttribute("fill",ae.color),Z.setAttribute("rx",String(ao/2)),Z.setAttribute("opacity","0.9"),w.appendChild(Z)};if(T.length){let D=T[0].rel,j=T[0].state;for(let J=1;J<T.length;J++){let ae=T[J];ae.state!==j&&(W(D,ae.rel,j),D=ae.rel,j=ae.state)}W(D,0,j)}}{let d=document.createElementNS(f,"rect");d.setAttribute("x",Rt),d.setAttribute("y",no),d.setAttribute("width",i),d.setAttribute("height",un),d.setAttribute("fill","color-mix(in srgb, var(--series-solar) 12%, transparent)"),d.setAttribute("rx","2"),w.appendChild(d);let m=document.createElementNS(f,"text");m.setAttribute("x",Rt-8),m.setAttribute("y",no+un/2+1),m.setAttribute("text-anchor","end"),m.setAttribute("dominant-baseline","middle"),m.setAttribute("fill","var(--text-muted)"),m.setAttribute("font-size","12"),m.setAttribute("font-family","var(--font-ui)"),m.setAttribute("font-weight","650"),m.textContent=p("overview.timeline.absorb"),w.appendChild(m);let h=a.map(z=>({rel:u(z[0]),on:z.length>is?Number(z[is]||0):0})).filter(z=>z.rel>=-ba&&z.rel<=0);if(h.length){let z=(D,j,J)=>{if(!J)return;let ae=l(D),B=Math.max(1,l(j)-ae),V=document.createElementNS(f,"rect");V.setAttribute("x",ae),V.setAttribute("y",no),V.setAttribute("width",B),V.setAttribute("height",un),V.setAttribute("fill",J===2?ps:ds),V.setAttribute("rx","2"),V.setAttribute("opacity",J===2?"0.95":"0.85"),w.appendChild(V)},T=h[0].rel,W=h[0].on;for(let D=1;D<h.length;D++)h[D].on!==W&&(z(T,h[D].rel,W),T=h[D].rel,W=h[D].on);z(T,0,W)}}let k=dn-pn+22,L=3600,_=Math.ceil((r-ba)/L)*L,S=Math.floor(r/L)*L,v=Math.floor(r/L)*L;for(let d=_;d<=S;d+=L){let h=new Date(d*1e3).getHours(),z=d===v;if(!z&&h%2!==0)continue;let T=d-r,W=l(T),D=document.createElementNS(f,"text");D.setAttribute("x",W),D.setAttribute("y",k),D.setAttribute("text-anchor","middle"),D.setAttribute("fill",z?"var(--accent)":"var(--text-muted)"),D.setAttribute("font-size","12"),D.setAttribute("font-family","var(--font-ui)"),D.setAttribute("font-weight",z?"700":"600"),D.setAttribute("font-variant-numeric","tabular-nums lining-nums"),D.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),D.textContent=String(h).padStart(2,"0"),w.appendChild(D)}return w}function Ol(t,e,a,n){let r=document.createElementNS(t,e);for(let o in a)r.setAttribute(o,a[o]);return n!=null&&(r.textContent=n),r}function ls(t){t.innerHTML="";let e=[{code:5,...wt[5]},{code:6,...wt[6]},{code:0,...wt[0]},{code:1,...wt[1]},{code:7,...wt[7]},{code:2,...wt[2]}];for(let r of e){let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+(r.labelKey?p(r.labelKey):""),t.appendChild(o)}let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+ds+'"></span>'+p("overview.timeline.absorbReactive"),t.appendChild(a);let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+ps+'"></span>'+p("overview.timeline.absorbArmed"),t.appendChild(n)}var Cu=H({tag:"zone-state-timeline",render:Pl,onMount(t,e){let a=e.querySelector(".tl-body"),n=e.querySelector(".timeline-legend");ls(n);function r(){let o=R("zoneStateHistory"),i=(()=>{let u=R&&R("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(a.innerHTML="",!o||!o.entries||o.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent=p("overview.timeline.noHistory"),a.appendChild(u);return}let l=Dl(o,i);l&&a.appendChild(l)}K("zoneStateHistory",r),K("zoneNames",r),M(s.drivers,r);for(let o=1;o<=Te;o++)M(g.enabled(o),r),M(g.state(o),r),M(g.temp(o),r),M(g.setpoint(o),r),M(g.preheatAdvance(o),r);N(e),r()}});var $l=`
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
`;O("zone-grid",$l);var Il=()=>'<div class="zone-grid" aria-label="Zones"></div>',Tu=H({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Il,onMount(t,e){for(let a=1;a<=6;a++)e.appendChild(de("zone-card",{zone:a,selection:t.selection,navigate:t.navigate}))}});function ms(){let t=String(A(s.effectiveHeatingMode)||A(s.heatingMode)||"heat_pump").toLowerCase();return t==="normal"||t==="boiler"?"normal":"heat_pump"}function Pt(t,e){let a=String(e||"").toUpperCase();if(!me(g.enabled(t))||a==="OFF")return p("state.off");if(a==="FAULT")return p("common.fault");if(a==="MANUAL")return p("state.manual");if(a==="CALIBRATING")return p("state.calibrating");if(a==="HEATING"||a==="CALLING")return p("state.heating");if(a==="OVERHEATED")return p("state.overheated");let n=ms(),r=Number(F(g.valve(t))),o=Number(F(s.hpBasePct)),i=Number(F(s.hpTrimFloorPct)),l=Number.isFinite(o)&&o>0?o:60,u=Number.isFinite(i)?i:15;return n==="normal"?!Number.isFinite(r)||r<=2?p("state.closedSetpoint"):p("state.idle"):!Number.isFinite(r)||r<=2?p("state.closedSetpoint"):r>=l-5?p("state.holdingFlow"):r>u?p("state.trimming"):p("state.holdingFlow")}function gs(){let t=String(A(s.heatDemandRecommendation)||"hold").toLowerCase(),e=Number(F(s.heatDemandCriticalZone)),a=Number(F(s.heatDemandSaturatedS))||0;if(t==="raise"){let n=Number.isFinite(e)&&e>=1?`Z${e|0}`:"zone";return p("overview.heatDemand.raise",{zone:n,duration:vt(a)})}return t==="lower"?p("overview.heatDemand.lower"):p("overview.heatDemand.hold")}function bs(){let t=ms(),e=String(A(s.heatingModeSource)||"local").toLowerCase()==="touch"?p("overview.mode.sourceTouch"):p("overview.mode.sourceLocal");return{modeLabel:t==="normal"?p("overview.mode.normal"):p("overview.mode.heatPump"),source:e}}var Hl=`
.zone-card {
  width:100%; min-width:0; min-height:72px; margin:0; padding:12px 16px; border:0; border-radius:0;
  display:grid; grid-template-columns:minmax(170px,1.4fr) minmax(100px,.8fr) minmax(90px,.7fr) minmax(100px,.7fr) 28px;
  grid-template-rows:auto auto; align-items:center; gap:8px 16px; background:transparent; color:var(--text-main); font:inherit; text-align:left; cursor:pointer;
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
.zone-card.zs-overheated .zc-dot{background:var(--tl-overheated)}.zone-card.zs-overheated .zc-state-label{color:var(--tl-overheated)}
.zone-card.zs-calibrating .zc-dot{background:var(--learn)}.zone-card.zs-calibrating .zc-state-label{color:var(--learn)}
.zone-card.zs-fault .zc-dot{background:var(--state-danger)}.zone-card.zs-fault .zc-state-label{color:var(--state-danger)}
.zone-card::after{content:'\u203A';grid-column:5;grid-row:1;color:var(--text-muted);font-size:1.35rem;text-align:right}
.zone-card .zc-learn{grid-column:1 / -1;grid-row:2;display:none;gap:8px;align-items:center;padding-top:2px}
.zone-card.zs-calibrating .zc-learn,.zone-card.zs-learning .zc-learn{display:grid;grid-template-columns:minmax(0,1fr) auto}
.zone-card .zc-learn-track{height:6px;border-radius:999px;background:rgba(var(--learn-rgb),.18);overflow:hidden}
.zone-card .zc-learn-fill{height:100%;width:0;min-width:4%;border-radius:inherit;background:var(--learn);transition:width .35s ease}
.zone-card .zc-learn-meta{color:var(--learn);font-size:.68rem;font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}
`;O("zone-card",Hl);var ql=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${_e(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${bt(t.zone)}</div>
		<div class="zc-friendly"${$e(t.zone)?" hidden":""}>${$e(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
		<div class="zc-learn" hidden>
			<div class="zc-learn-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="zc-learn-fill"></div></div>
			<span class="zc-learn-meta">\u2014</span>
		</div>
	</button>
`,Ku=H({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:ql,onMount(t,e){let a=t.zone,n=g.temp(a),r=g.state(a),o=g.enabled(a),i=e.querySelector(".zc-state-label"),l=e.querySelector(".zc-zone-name"),u=e.querySelector(".zc-friendly"),f=e.querySelector(".zc-temp"),w=e.querySelector(".zc-target"),c=e.querySelector(".zc-valve-value"),b=e.querySelector(".zc-learn"),x=e.querySelector(".zc-learn-fill"),k=e.querySelector(".zc-learn-track"),L=e.querySelector(".zc-learn-meta");function _(){var J;let v=me(o),d=String(A(r)||"").toUpperCase()||"OFF",m=String(A(g.motorLastFault(a))||"").toUpperCase(),h=m&&m!=="NONE"&&m!=="OK",z=v&&(d==="FAULT"||h)?"FAULT":d,T=t.selection&&R("selectedZone")===a,W=$e(a),D=ht(a);l.innerHTML=bt(a),u.textContent=W?"":"---",u.hidden=!!W,e.setAttribute("aria-label",_e(a)),f.textContent=Vt(F(n)),w.textContent=p("zone.card.setpoint",{value:Vt((J=F(g.effectiveSetpoint(a)))!=null?J:F(g.setpoint(a)))}),c.textContent=ua(F(g.valve(a)));let j=v?z:"OFF";if(i.textContent=D.active?D.label:Pt(a,j),e.title=h?p("zone.card.fault",{fault:m}):"",b){let ae=D.active;b.hidden=!ae,b.style.display=ae?"":"none",x.style.width=Math.max(D.pct,ae?4:0)+"%",k.setAttribute("aria-valuenow",String(D.pct)),k.setAttribute("aria-label",D.label),L.textContent=D.pct+"%"}e.classList.toggle("active",T),T?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${l.textContent}, ${f.textContent}, ${w.textContent}, ${i.textContent}. Open details.`),e.classList.toggle("disabled",!v),e.classList.toggle("zs-heating",v&&(j==="HEATING"||j==="CALLING")),e.classList.toggle("zs-overheated",v&&j==="OVERHEATED"),e.classList.toggle("zs-calibrating",v&&(j==="CALIBRATING"||D.active)),e.classList.toggle("zs-learning",v&&D.active),e.classList.toggle("zs-fault",v&&j==="FAULT"),e.classList.toggle("zs-idle",v&&j==="IDLE"),e.classList.toggle("zs-off",!v||j==="OFF")}function S(){Lt(a),t.navigate&&Ve("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:a}}))}e.addEventListener("click",S),M(n,_),M(g.setpoint(a),_),M(g.effectiveSetpoint(a),_),M(g.valve(a),_),M(r,_),M(o,_),M(g.motorLastFault(a),_),M(g.motorLearnPct(a),_),M(g.motorLearnPhase(a),_),M(g.motorLearnSample(a),_),M(g.motorLearnSamplesNeeded(a),_),M(s.effectiveHeatingMode,_),M(s.heatingMode,_),M(s.hpBasePct,_),M(s.hpTrimFloorPct,_),K("selectedZone",_),K("zoneNames",_),_()}});var ne={cx:200,cy:175,haloR:72,cutR:72,discR:56,stroke:6.5,pipeXs:[138,162.8,187.6,212.4,237.2,262],pipeFrom:175,pipeTo:278,lockupScale:.8,lockupCutR:58,lockupDiscR:50,luneSize:24,luneTracking:2.8,luneY:183,v6Size:40,v6Tracking:.4,v6Y:188,viewBoxPortrait:"110 90 180 210",viewBoxLandscape:"118 100 202 150",viewBoxLockup:"142 118 154 114",lockupWidth:80,lockupHeight:59,manifoldWidth:108,manifoldHeight:80,thermal:{supply:"#FCD34D",heat:"#F59E0B",ret:"#10B981",heatStop:28},pipe:{calling:"#F59E0B",idle:"#10B981",unused:"rgba(232,214,188,.20)"},metallic:{top:"#1c1915",bottom:"#0c0b09",rim:"#25221E",word:"#FAF6EF"}},Bl=0;function jl(t){let{cx:e,cy:a}=ne,n=[`translate(${e} ${a})`,"rotate(-90)"];return t&&t!==1&&n.push(`scale(${t})`),n.push(`translate(${-e} ${-a})`),n.join(" ")}function Vl(t,e=!1){let a=ne.thermal,n=ne.metallic,r=e?`x1="${ne.cx}" y1="${ne.cy+ne.haloR}" x2="${ne.cx}" y2="${ne.cy-ne.haloR}"`:'x1="120" y1="175" x2="280" y2="175"';return`<defs>
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
      <stop offset="0%" stop-color="${n.top}"/>
      <stop offset="100%" stop-color="${n.bottom}"/>
    </linearGradient>
  </defs>`}function ha({states:t=[],selected:e=-1,sku:a="",landscape:n=!1,lockup:r=!1,prefix:o=""}={}){let i=o||`lm${++Bl}`,l=r?ne.lockupScale:null,u=r?ne.lockupCutR:ne.cutR,f=r?ne.lockupDiscR:ne.discR,w=n||r?` transform="${jl(l)}"`:"",c=r?ne.viewBoxLockup:n?ne.viewBoxLandscape:ne.viewBoxPortrait,b=ne.pipeXs.map((k,L)=>`<line class="pipe is-${t[L]||"idle"}${L===e?" is-focus":""}" x1="${k}" y1="${ne.pipeFrom}" x2="${k}" y2="${ne.pipeTo}"/>`).join(""),x="";if(a){let k=a.toUpperCase()==="V6",L=k?ne.v6Size:ne.luneSize,_=k?ne.v6Tracking:ne.luneTracking,S=k?ne.v6Y:ne.luneY;x=`<text class="sku" x="${ne.cx}" y="${S}" text-anchor="middle" fill="${ne.metallic.word}" font-size="${L}" font-weight="700" letter-spacing="${_}" font-family="system-ui,-apple-system,sans-serif">${a}</text>`}return`<svg class="lune-mark${n||r?" is-landscape":""}" viewBox="${c}" fill="none" aria-hidden="true">
    ${Vl(i,n||r)}
    <g class="pipes"${w} stroke="url(#${i}-thermal)" stroke-width="${ne.stroke}" stroke-linecap="round" fill="none">${b}</g>
    <circle class="disc-cut" cx="${ne.cx}" cy="${ne.cy}" r="${u}"></circle>
    <path class="halo-arc"${w} d="M${ne.cx-ne.haloR} ${ne.cy}A${ne.haloR} ${ne.haloR} 0 0 1 ${ne.cx+ne.haloR} ${ne.cy}" fill="none" stroke="url(#${i}-thermal)" stroke-width="${ne.stroke}" stroke-linecap="round" filter="url(#${i}-glow)"></path>
    <circle class="disc" cx="${ne.cx}" cy="${ne.cy}" r="${f}"></circle>
    ${x}
  </svg>`}function fs(){return ha({sku:"LUNE",lockup:!0,prefix:"lt-lockup"})}var hs=`
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
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  min-width: 0;
  min-height: 0;
  padding: 8px 8px 8px 6px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  align-items: stretch;
  justify-items: stretch;
  cursor: pointer;
  font: inherit;
}
.lds-loop.has-demand,
.loop.has-demand {
  grid-template-columns: auto minmax(0, 1fr);
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
.lds-loop-body,
.loop-body {
  display: grid;
  gap: 2px;
  min-width: 0;
  align-content: center;
  justify-items: start;
}
.lds-loop-id,
.loop-id {
  color: var(--text-faint);
  font-size: .78rem;
  font-weight: 750;
  letter-spacing: .06em;
}
.lds-loop-name,
.loop-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--text-muted, var(--muted));
  font-size: .8rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lds-loop-demand-bar,
.loop-demand-bar {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  width: 10px;
  align-self: stretch;
  min-height: 52px;
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
  font-size: 1.1rem;
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
`;function va(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ro(t,e="idle"){if(e==="unused")return 0;let a=Number(t);return!Number.isFinite(a)||a<=0?0:Math.min(5,Math.max(1,Math.ceil(a/20)))}function Ul(t=0){return`<span class="lds-loop-demand-bar loop-demand-bar" data-level="${Math.min(5,Math.max(0,Number(t)||0))}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`}function so({id:t,name:e="\u2014",temp:a="\u2014",level:n=0,kind:r="idle",selected:o=!1,attrs:i="",tag:l="button",showDemand:u=!0,className:f=""}={}){let w=["lds-loop","loop",u?"has-demand":"",o?"is-selected":"",r==="calling"?"is-calling":"",r==="unused"?"is-unused":"",f].filter(Boolean).join(" "),c=l==="button"?' type="button"':"",b=u?Ul(n):"",x=`<span class="lds-loop-body loop-body"><span class="lds-loop-id loop-id">${va(t)}</span><span class="lds-loop-name loop-name">${va(e)}</span><span class="lds-loop-temp loop-temp">${va(a)}</span></span>`;return`<${l} class="${w}"${c} ${i}>${b}${x}</${l}>`}function vs({title:t="",lines:e=[],offline:a=!1}={}){let n=(e||[]).map((r,o)=>`<small${a&&o===e.length-1||o===e.length-1?' class="status"':""}>${va(r)}</small>`).join("");return`<strong>${va(t)}</strong>${n}`}function Wt(t){if(!me(g.enabled(t)))return"unused";let e=String(A(g.state(t))||"").toUpperCase(),a=Number(F(g.valve(t)));return e==="HEATING"||e==="CALLING"||Number.isFinite(a)&&a>20||e==="FAULT"||e==="OVERHEATED"?"calling":"idle"}function xs(){return[1,2,3,4,5,6].map(Wt)}function Kl(){return xs().filter(t=>t==="calling").length}function Wl(){let t=Kl();return t?`${t}/6 heat call`:"Idle"}function xa(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function ys(t,{states:e,selected:a=-1,sku:n="V6",landscape:r=!0,prefix:o}={}){if(!t)return;let i=o||t.getAttribute("data-live-mark")||"mark";t.innerHTML=ha({states:e||xs(),selected:a,sku:r?n:"",landscape:r,prefix:i})}function ws(){let t=xa(F(s.flow)),e=xa(F(s.ret)),a=Number(F(s.flow)),n=Number(F(s.ret)),r=Number.isFinite(a)&&Number.isFinite(n)?`${(a-n).toFixed(1)}\xB0`:"\u2014";return vs({title:"Lune V6",lines:[`Flow ${t} \xB7 Ret ${e}`,`\u0394T ${r} \xB7 ${Wl()}`]})}function Zl(t,e,a={}){if(!t||t.length<2)return"";let n=a.w||360,r=a.h||128,o=[a.ref].filter(x=>x!=null&&!Number.isNaN(Number(x))),i=Math.min(...t,...o),l=Math.max(...t,...o),u=4,f=l-i||1,w=x=>r-(x-i)/f*(r-u*2)-u,c=t.map((x,k)=>`${k/(t.length-1)*n},${w(x)}`).join(" "),b=o.length?`<line class="ref" x1="0" y1="${w(o[0])}" x2="${n}" y2="${w(o[0])}" />`:"";return`<svg class="${a.className||"spark spark-lg"}" viewBox="0 0 ${n} ${r}" preserveAspectRatio="none" aria-hidden="true">${b}<polyline fill="none" stroke="${e}" stroke-width="${a.stroke||1.8}" points="${c}"/></svg>`}function Gl(t){var w;let e=Number(F(g.temp(t))),a=Number((w=F(g.effectiveSetpoint(t)))!=null?w:F(g.setpoint(t))),n=Number.isFinite(e)?e:a;if(!Number.isFinite(n)||!Number.isFinite(a))return[];let r=Wt(t)==="calling",o=t*17,i=n-.4,l=n+.4,u=n-.35-o%6*.07,f=[];for(let c=0;c<24;c+=1){let b=Math.max(0,Math.sin((c-6)/12*Math.PI))*.22,x=c<7||c>21?-.12:0,k=r||u<a-.2?.16:.05;u+=(a-u)*k+b+x+Math.sin((c+o)*.55)*.05,u=Math.min(l+.15,Math.max(i-.15,u)),f.push(+u.toFixed(2))}return f[23]=+Number(n).toFixed(2),f}function ks(t){var f;let e=Gl(t);if(!e.length)return"";let a=Wt(t)==="calling"?"var(--accent)":"var(--forest)",n=e[0],r=e[e.length-1],o=Math.min(...e),i=Math.max(...e),l=r-n,u=Number((f=F(g.effectiveSetpoint(t)))!=null?f:F(g.setpoint(t)));return`${Zl(e,a,{className:"spark spark-lg",w:360,h:128,stroke:1.8,ref:u})}
    <div class="trend-meta">
      <span>24h</span>
      <span>${o.toFixed(1)}\u2013${i.toFixed(1)}\xB0</span>
      <span>${l>.05?"+":""}${l.toFixed(1)}\xB0</span>
    </div>`}var Xl=`
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
.zone-detail .facts dd.is-warn{color:var(--state-warn)}
.zone-detail .facts dd.is-ok{color:var(--state-ok)}
.zone-detail .zd-learn-bar{display:none;margin-top:14px;padding:10px 12px;border-radius:10px;background:rgba(var(--learn-rgb),.08);border:1px solid rgba(var(--learn-rgb),.22)}
.zone-detail .zd-learn-bar.is-on{display:block}
.zone-detail .zd-learn-track{height:8px;border-radius:999px;background:rgba(var(--learn-rgb),.18);overflow:hidden}
.zone-detail .zd-learn-fill{height:100%;width:0;min-width:4%;border-radius:inherit;background:var(--learn);transition:width .35s ease}
.zone-detail .zd-learn-meta{margin-top:8px;color:var(--learn);font-size:.76rem;font-weight:650}
`;O("zone-detail",Xl);var Yl=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    ${Xn({remaining:"",hint:p("zone.override.hint")})}
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
      <div><dt data-i18n="zone.learning.status">Learning</dt><dd class="zd-learning">\u2014</dd></div>
    </dl>
    <div class="zd-learn-bar" hidden>
      <div class="zd-learn-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="zd-learn-fill"></div></div>
      <div class="zd-learn-meta">\u2014</div>
    </div>
  </div>
`,co=5,po=35,_s=.5;function Jl(t){let e=Number(F(g.setpoint(t)));return Number.isFinite(e)?e:null}function uo(t){let e=Number(F(g.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function Ss(t){let e=Number(F(g.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let a=Jl(t);return a==null?null:Number((a+uo(t)).toFixed(1))}function io(t){return Math.min(po,Math.max(co,Number(Number(t).toFixed(1))))}function lo(t){return t==null||Number.isNaN(Number(t))?"\u2014":`${Number(t).toFixed(1)}\xB0`}function Ql(t,e,a){return Pt(t,a?e:"OFF")}function ec(t,e){if(!e)return p("state.off");let a=String(A(g.state(t))||"").toUpperCase()||"IDLE";return Pt(t,a)}function tc(t,e){let a=ht(t);if(e&&a.active)return{text:`${a.label} \xB7 ${a.pct}%`,cls:"is-warn",progress:a};let n=String(A(g.motorStrokeModel(t))||""),r=Number(F(g.motorWorkingRipples(t))),o=Number(F(g.motorOpenRipples(t)));return n==="working_range"&&r>0?{text:p("zone.learning.workingRangeDetail",{working:Math.round(r),span:Math.round(o||r)}),cls:"is-ok",progress:null}:o>0?{text:p("zone.learning.fullStrokeDetail",{span:Math.round(o)}),cls:"is-ok",progress:null}:{text:p("zone.learning.needed"),cls:"is-warn",progress:null}}var gm=H({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Yl,methods:{update(t,e){let a=R("selectedZone"),n=String(A(g.state(a))||"").toUpperCase(),r=me(g.enabled(a)),o=Ss(a),i=F(g.temp(a));this.zone=a,t.dataset.zone=String(a),e.dial&&Zn(e.dial,{target:o,current:i,disabled:!r,states:["idle","idle","idle","idle","idle","idle"],selected:-1});let l=Number(F(g.coordinatorRemaining(a))),u=F(g.coordinatorOffset(a)),f=Number.isFinite(l)&&l>0||Number.isFinite(u)&&Math.abs(u)>.05,w=u==null?"\u2014":(u>0?"+":"")+Number(u).toFixed(1)+"\xB0";Yn(t,{remaining:f?p("zone.override.remaining",{offset:w,remaining:vt(Math.max(0,l||0))}):"",hint:p("zone.override.hint")});let c=lo(o);e.setpoint.textContent=c,e.temp.textContent=lo(i),e.demand.textContent=ec(a,r);let b=tc(a,r);if(e.learning.textContent=b.text,e.learning.className="zd-learning"+(b.cls?" "+b.cls:""),e.learnBar){let x=!!(b.progress&&b.progress.active);e.learnBar.hidden=!x,e.learnBar.classList.toggle("is-on",x),x&&(e.learnFill.style.width=Math.max(b.progress.pct,4)+"%",e.learnTrack.setAttribute("aria-valuenow",String(b.progress.pct)),e.learnMeta.textContent=b.progress.label+" \xB7 "+b.progress.pct+"%")}if(e.slider&&(Number.isFinite(o)&&(e.slider.value=String(o)),e.slider.disabled=!r,Qa(e.slider)),e.sliderValue&&(e.sliderValue.textContent=c),e.chart&&(e.chart.innerHTML=ks(a)),e.badge){let x=e.badge;x.textContent=Ql(a,n,r);let k=r?n==="HEATING"?"badge-heating":n==="IDLE"?"badge-idle":n==="FAULT"?"badge-fault":"":"badge-disabled";x.className="zd-badge"+(k?" "+k:"")}},stepSetpoint(t){let e=this.zone,a=Ss(e),n=io((a==null?20:a)+t);On(e,io(n-uo(e)))},setApplied(t){let e=this.zone;On(e,io(t-uo(e)))}},onMount(t,e){let a=e.querySelector(".zd-dial-slot");a.innerHTML=Wn({id:"zone-detail-dial",markHtml:ha({states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:"zone-detail-halo"}),target:20,current:null,min:co,max:po,step:_s,unit:"C",label:"Zone setpoint"});let n=e.querySelector(".zd-slider-slot");n.innerHTML=Jn({min:co,max:po,step:_s,value:21,label:"Comfort setpoint"});let r={dial:a.querySelector(".lds-dial"),temp:e.querySelector(".zd-temp"),setpoint:e.querySelector(".zd-setpoint"),demand:e.querySelector(".zd-demand"),learning:e.querySelector(".zd-learning"),learnBar:e.querySelector(".zd-learn-bar"),learnFill:e.querySelector(".zd-learn-fill"),learnTrack:e.querySelector(".zd-learn-track"),learnMeta:e.querySelector(".zd-learn-meta"),badge:e.querySelector(".zd-badge"),slider:e.querySelector("[data-comfort-slider]"),sliderValue:e.querySelector("[data-slider-value]"),chart:e.querySelector(".zd-chart")};Gn(r.dial,{onStep:l=>t.stepSetpoint(l)}),r.slider.addEventListener("input",()=>{let l=parseFloat(r.slider.value);Number.isFinite(l)&&(Qa(r.slider),r.sliderValue.textContent=lo(l),t.setApplied(l))});let o=()=>t.update(e,r),i=l=>{let u=R("selectedZone");(/(?:text_sensor-zone_\d+_state|switch-zone_\d+_enabled|sensor-zone_\d+_valve_pct|sensor-motor_\d+_(?:learned_open_ripples|working_ripples|pin_free_ripples|learn_pct|learn_sample|learn_samples_needed)|text_sensor-motor_\d+_(?:stroke_model|learn_phase))$/.test(l)||l===g.temp(u)||l===g.setpoint(u)||l===g.baseSetpoint(u)||l===g.effectiveSetpoint(u)||l===g.coordinatorOffset(u)||l===g.coordinatorRemaining(u))&&o()};for(let l=1;l<=6;l++)M(g.temp(l),i),M(g.setpoint(l),i),M(g.baseSetpoint(l),i),M(g.effectiveSetpoint(l),i),M(g.coordinatorOffset(l),i),M(g.coordinatorRemaining(l),i),M(g.valve(l),i),M(g.state(l),i),M(g.enabled(l),i),M(g.motorOpenRipples(l),i),M(g.motorWorkingRipples(l),i),M(g.motorPinFreeRipples(l),i),M(g.motorStrokeModel(l),i),M(g.motorLearnPct(l),i),M(g.motorLearnPhase(l),i),M(g.motorLearnSample(l),i),M(g.motorLearnSamplesNeeded(l),i);M("sensor-manifold_return_temperature",o),M(s.effectiveHeatingMode,o),M(s.heatingMode,o),M(s.hpBasePct,o),M(s.hpTrimFloorPct,o),K("selectedZone",o),N(e),o()}});var ac=`
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
`;O("zone-sensor-card",ac);var nc=()=>`
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
  `;function oc(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":t==="External"||t==="EXTERNAL"?"External":"Local Probe"}function rc(t){return t==="BLE Sensor"?"BLE":t==="External"?"External":"Local Probe"}function zs(t,e){let a='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+p("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+p("zone.sensor.bleSource")+'</option><option value="External" data-i18n="zone.sensor.externalSource">'+p("zone.sensor.externalSource")+"</option>";t.innerHTML!==a&&(t.innerHTML=a),t.value=e}var _m=H({tag:"zone-sensor-card",render:nc,onMount(t,e){let a=e.querySelector(".zs-source"),n=e.querySelector(".zs-ble"),r=e.querySelector(".zs-row-ble"),o=e.querySelector(".zs-row-ext"),i=e.querySelector(".zs-sid"),l=e.querySelector(".zs-sname"),u=e.querySelector(".zs-age"),f=e.querySelector(".zs-scan"),w=e.querySelector(".zs-scan-list"),c=0;function b(){return R("selectedZone")}function x(){let v=a.value;r.style.display=v==="BLE Sensor"?"":"none",o.style.display=v==="External"?"":"none"}let k=Le(e,{immediate:!0});zs(a,"Local Probe"),k.select(a,{read:()=>oc(String(A(g.tempSource(b()))||"")),commit:v=>st(b(),"zone_temp_source",rc(v))}),k.text(n,{read:()=>A(g.ble(b()))||"",commit:v=>{let d=String(v||"").trim();d&&qt(b(),"zone_ble_mac",d)}}),k.text(i,{read:()=>A(g.sensorId(b()))||"",commit:v=>qt(b(),"zone_sensor_id",v)}),k.text(l,{read:()=>A(g.sensorName(b()))||"",commit:v=>qt(b(),"zone_sensor_name",v)}),a.addEventListener("change",x);function L(){let v=b(),d=Number(F(g.externalAge(v)));if(!Number.isFinite(d)||d<0){u.textContent=p("zone.sensor.noIngestYet");return}let m=Math.round(d/1e3);u.textContent=p("zone.sensor.lastIngestAge",{sec:m})}function _(){let v=Number(b())||1;c!==v?(c=v,w.style.display="none",k.discard()):k.refresh(),x(),L()}f.addEventListener("click",()=>{f.disabled=!0,f.textContent=p("zone.sensor.scanning"),w.style.display="",w.innerHTML='<div class="scan-msg">'+p("zone.sensor.scanning")+"</div>";let v=new AbortController,d=setTimeout(()=>v.abort(),8e3);fetch("/api/v1/ble-scan",{signal:v.signal}).then(m=>m.json()).then(m=>{clearTimeout(d),f.disabled=!1,f.textContent=p("zone.sensor.scan");let h=m&&m.data&&m.data.sensors||m.sensors||[];if(!h.length){w.innerHTML='<div class="scan-msg">'+p("zone.sensor.noSensors")+"</div>";return}let z=(A(g.ble(b()))||"").toUpperCase();w.innerHTML=h.map(T=>{let W=String(T.mac||"").toUpperCase(),D="";W===z?D='<span class="ble-badge">'+p("zone.sensor.assignedThisZone")+"</span>":T.zone>0&&(D='<span class="ble-badge">'+p("zone.sensor.zoneBadge",{zone:T.zone})+"</span>");let j=Number.isFinite(Number(T.temp_c))?Number(T.temp_c).toFixed(1)+"\xB0C":"\u2014",J=T.name?String(T.name):"";return`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${W}</div>
                <div class="ble-meta">${J?J+" \xB7 ":""}${j} \xB7 ${T.rssi||"?"} dBm ${D}</div>
              </div>
              <button class="btn-assign" data-mac="${W}">${p("zone.sensor.assign")}</button>
            </div>`}).join(""),w.querySelectorAll(".btn-assign").forEach(T=>{T.addEventListener("click",()=>{let W=T.getAttribute("data-mac")||"",D=b();n.value=W,a.value="BLE Sensor",x(),qt(D,"zone_ble_mac",W),st(D,"zone_temp_source","BLE"),k.discard()})})}).catch(m=>{clearTimeout(d),f.disabled=!1,f.textContent=p("zone.sensor.scan");let h=m&&m.name==="AbortError"?p("zone.sensor.scanTimeout"):p("zone.sensor.scanFailed");w.innerHTML='<div class="scan-msg">'+h+"</div>"})});function S(v){let d=b();([g.tempSource(d),g.ble(d),g.sensorId(d),g.sensorName(d),g.externalAge(d)].indexOf(v)>=0||/^select-zone_\d+_temp_source$/.test(v)||/^text-zone_\d+_(ble_mac|sensor_id|sensor_name)$/.test(v)||/^sensor-zone_\d+_external_temp_age_ms$/.test(v))&&(k.refresh(),x(),L())}_(),K("selectedZone",_);for(let v=1;v<=6;v++)M(g.tempSource(v),S),M(g.ble(v),S),M(g.sensorId(v),S),M(g.sensorName(v),S),M(g.externalAge(v),S);}});var sc=".zone-coordination-card { height: 100%; }";O("zone-coordination-card",sc);var ic=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.sensor.mergeWith">Merge with zone</span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function Ms(t,e){let a=t.value,n='<option value="None" data-i18n="common.none">'+p("common.none")+"</option>";for(let r=1;r<=6;r++)r!==e&&(n+='<option value="Zone '+r+'">'+p("common.zone")+" "+r+"</option>");t.innerHTML=n,t.value=a||"None"}var Em=H({tag:"zone-coordination-card",render:ic,onMount(t,e){let a=e.querySelector(".zc-sync"),n=0;function r(){return R("selectedZone")}let o=Le(e,{immediate:!0});o.select(a,{read:()=>A(g.syncTo(r()))||"None",commit:u=>st(r(),"zone_sync_to",u)});function i(){let u=r();n!==u?(Ms(a,u),n=u,o.discard()):o.refresh()}function l(u){let f=r();(u===g.syncTo(f)||/^select-zone_\d+_sync_to$/.test(u))&&o.refresh()}K("selectedZone",i);for(let u=1;u<=6;u++)M(g.syncTo(u),l);N(e),i()}});var lc=".zone-room-card { height: auto; }";O("zone-room-card",lc);var cc=15,dc=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Zone friendly name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="${cc}" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,qm=H({tag:"zone-room-card",render:dc,onMount(t,e){let a=e.querySelector(".zr-friendly");function n(){return R("selectedZone")}let r=Le(e,{immediate:!0});r.text(a,{read:()=>Fn(n())||"",commit:i=>vr(n(),i)});function o(i){let l=n();(i===g.name(l)||/^text-zone_\d+_name$/.test(i))&&r.refresh()}K("selectedZone",()=>{r.discard()}),K("zoneNames",r.refresh);for(let i=1;i<=6;i++)M(g.name(i),o);N(e),r.refresh()}});var pc=`
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
.zone-actuator-disclosure .za-stat-value.is-warn { color: var(--learn); }
.zone-actuator-disclosure .za-stat-value.is-ok { color: var(--state-ok); }
.zone-actuator-disclosure .za-learn-bar {
  display: none;
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(var(--learn-rgb), .08);
  border: 1px solid rgba(var(--learn-rgb), .22);
}
.zone-actuator-disclosure .za-learn-bar.is-on { display: block; }
.zone-actuator-disclosure .za-learn-track {
  height: 8px;
  border-radius: 999px;
  background: rgba(var(--learn-rgb), .18);
  overflow: hidden;
}
.zone-actuator-disclosure .za-learn-fill {
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: var(--learn);
  transition: width .35s ease;
}
.zone-actuator-disclosure .za-learn-meta {
  margin-top: 8px;
  color: var(--learn);
  font-size: .78rem;
  font-weight: 650;
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
`;O("zone-actuator-card",pc);function uc(t){return t!=null&&Number(t)>0?Number(t).toFixed(2)+"x":"---"}function mo(t){let e=Number(t);return Number.isFinite(e)&&e>0?String(Math.round(e)):"---"}function mc(t){return t!=null?Number(t).toFixed(2)+"C":"---"}function gc(t){let e=ht(t);if(e.active)return{text:`${e.label} \xB7 ${e.pct}%`,cls:"is-warn",progress:e};let a=String(A(g.motorStrokeModel(t))||""),n=Number(F(g.motorWorkingRipples(t))),r=Number(F(g.motorOpenRipples(t)));return a==="working_range"&&n>0?{text:p("zone.learning.workingRange"),cls:"is-ok",progress:null}:a==="full_stroke"&&r>0?{text:p("zone.learning.fullStroke"),cls:"is-ok",progress:null}:r>0||n>0?{text:p("zone.learning.learned"),cls:"is-ok",progress:null}:{text:p("zone.learning.needed"),cls:"is-warn",progress:null}}var bc=()=>`
  <details class="disclosure zone-actuator-disclosure">
    <summary data-i18n="zone.actuator.title">Actuator</summary>
    <div class="disclosure-body">
      <div class="ui-section" data-i18n="zone.actuator.calibration">Calibration and preheat</div>
      <div class="za-learn-bar" hidden>
        <div class="za-learn-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="za-learn-fill"></div></div>
        <div class="za-learn-meta">\u2014</div>
      </div>
      <div class="za-stats">
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.learning.status">Learning</div><div class="za-stat-value za-learn">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.learning.workingSpan">Working range</div><div class="za-stat-value za-span">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.learning.pinToSeat">Pin \u2192 seat</div><div class="za-stat-value za-work">---</div></div>
        <div class="za-stat"><div class="za-stat-label" data-i18n="zone.learning.freeTravel">Free to pin</div><div class="za-stat-value za-free">---</div></div>
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
`,Xm=H({tag:"zone-actuator-card",render:bc,onMount(t,e){var f,w,c;let a=Number(R("selectedZone")||1),n=!1,r={learn:e.querySelector(".za-learn"),learnBar:e.querySelector(".za-learn-bar"),learnFill:e.querySelector(".za-learn-fill"),learnTrack:e.querySelector(".za-learn-track"),learnMeta:e.querySelector(".za-learn-meta"),span:e.querySelector(".za-span"),work:e.querySelector(".za-work"),free:e.querySelector(".za-free"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function o(){a=Number(R("selectedZone")||1);let b=gc(a),x=b.progress;if(n&&!(x&&x.active)&&l("\u2713 "+p("zone.learning.finished",{zone:_e(a)}),!0),n=!!(x&&x.active),r.learn.textContent=b.text,r.learn.className="za-stat-value"+(b.cls?" "+b.cls:""),r.learnBar){let _=!!(x&&x.active);r.learnBar.hidden=!_,r.learnBar.classList.toggle("is-on",_),_&&(r.learnFill.style.width=Math.max(x.pct,4)+"%",r.learnTrack.setAttribute("aria-valuenow",String(x.pct)),r.learnTrack.setAttribute("aria-label",x.label),r.learnMeta.textContent=x.label+" \xB7 "+x.pct+"%")}r.span.textContent=mo(F(g.motorOpenRipples(a))),r.work.textContent=mo(F(g.motorWorkingRipples(a))),r.free.textContent=mo(F(g.motorPinFreeRipples(a))),r.cfac.textContent=uc(F(g.motorCloseFactor(a))),r.ph.textContent=mc(F(g.preheatAdvance(a)));let k=String(A(g.motorLastFault(a))||"").toUpperCase(),L=k&&k!=="NONE"&&k!=="OK";r.fault.hidden=!L,L&&(r.faultVal.textContent=k)}let i=null;function l(b,x){r.status.textContent=b,r.status.className="za-status show "+(x?"ok":"err"),clearTimeout(i),i=setTimeout(()=>{r.status.classList.remove("show")},4e3)}function u(b,x){let k=Number(R("selectedZone")||a||1);a=k;let L=b(k);l(x,!0),L&&typeof L.then=="function"?L.then(_=>{_&&_.ok===!1?l(p("diagnostics.recovery.rejected"),!1):o()}).catch(()=>l(p("diagnostics.recovery.unreachable"),!1)):o()}(f=r.faultBtn)==null||f.addEventListener("click",()=>{let b=Number(R("selectedZone")||a||1);u(Za,"\u2713 "+p("diagnostics.recovery.faultSent",{zone:_e(b)}))}),(w=r.factorsBtn)==null||w.addEventListener("click",()=>{let b=Number(R("selectedZone")||a||1);confirm(p("diagnostics.recovery.confirmFactors",{zone:_e(b)}))&&u(Ga,"\u2713 "+p("diagnostics.recovery.factorsReset",{zone:_e(b)}))}),(c=r.relearnBtn)==null||c.addEventListener("click",()=>{let b=Number(R("selectedZone")||a||1);confirm(p("diagnostics.recovery.confirmRelearn",{zone:_e(b)}))&&(n=!0,u(kr,"\u2713 "+p("diagnostics.recovery.relearnStarted",{zone:_e(b)})))}),K("selectedZone",o);for(let b=1;b<=6;b++)M(g.state(b),o),M(g.motorOpenRipples(b),o),M(g.motorWorkingRipples(b),o),M(g.motorPinFreeRipples(b),o),M(g.motorStrokeModel(b),o),M(g.motorCloseFactor(b),o),M(g.preheatAdvance(b),o),M(g.motorLastFault(b),o),M(g.motorLearnPct(b),o),M(g.motorLearnPhase(b),o),M(g.motorLearnSample(b),o),M(g.motorLearnSamplesNeeded(b),o);N(e),o()}});var fc={1:{label:"E",color:"var(--danger)"},2:{label:"W",color:"var(--warn)"},3:{label:"I",color:"var(--ok)"},4:{label:"C",color:"var(--info)"},5:{label:"D",color:"var(--text-muted)"},6:{label:"V",color:"var(--text-faint)"},7:{label:"VV",color:"var(--text-faint)"}},hc=`
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
`;O("logs-view",hc);var vc=()=>`
  <div class="logs-view">
    <div class="logs-stream"></div>
    <div class="actions">
      <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
      <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      <button class="btn download-btn" type="button" data-i18n="logs.download">Download</button>
      <button class="btn bottom-btn" type="button" data-i18n="logs.scrollBottom">Scroll to bottom</button>
    </div>
  </div>
`;function xc(t){let e=fc[t.level]||{label:"?",color:"var(--text-secondary)"},a=Cs(t.tag||""),n=Cs(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+a+'</span><span class="msg">'+n+"</span></div>"}function Cs(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var ng=H({tag:"logs-view",render:vc,onMount(t,e){let a=e.querySelector(".logs-stream"),n=e.querySelector(".pause-btn"),r=e.querySelector(".clear-btn"),o=e.querySelector(".download-btn"),i=e.querySelector(".bottom-btn"),l=!1;function u(){a.scrollTop=a.scrollHeight}function f(){if(l)return;let w=Ba();if(!w||!w.length){a.innerHTML='<div class="logs-empty">'+p("logs.waiting")+"</div>";return}let c=a.scrollHeight-a.scrollTop-a.clientHeight<40;a.innerHTML=w.map(xc).join(""),c&&u()}n.addEventListener("click",()=>{l=!l,n.textContent=l?p("logs.resume"):p("logs.pause"),n.classList.toggle("on",l),l||f()}),r.addEventListener("click",()=>{Yo()}),o.addEventListener("click",()=>{o.disabled=!0,Er().catch(w=>{console.error("[Logs] download failed:",w),window.alert(p("logs.downloadFailed"))}).finally(()=>{o.disabled=!1})}),i.addEventListener("click",()=>{u()}),K("deviceLog",f),N(e),f()}});var yc=`
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
}`;O("diag-i2c",yc);var wc=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,dg=H({tag:"diag-i2c",render:wc,onMount(t,e){let a=e.querySelector("#i2c-result");function n(){a.textContent=R("i2cResult")||p("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{br()}),K("i2cResult",n),N(e),n()}});var kc=`
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
`;O("diag-manual-badge",kc);var _c=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,fg=H({tag:"diag-manual-badge",render:_c,onMount(t,e){let a=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function n(){let r=!!R("manualMode");a&&a.classList.toggle("on",r)}K("manualMode",n),N(e),n()}});var Sc=`
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
`;O("diag-zone-motor",Sc);var zc=t=>{let e=t.zone||R("selectedZone")||1,a="";for(let n=1;n<=6;n++)a+='<option value="'+n+'"'+(n===e?" selected":"")+">"+p("common.zone")+" "+n+"</option>";return`
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
  `},Sg=H({tag:"diag-zone-motor-card",render:zc,onMount(t,e){let a=Number(t.zone||R("selectedZone")||1),n=!!R("manualMode"),r=e.querySelector(".manual-mode-toggle"),o=e.querySelector(".motor-gated"),i=e.querySelector(".motor-zone-select"),l=e.querySelector(".motor-target-input"),u=e.querySelector(".motor-open-btn"),f=e.querySelector(".motor-close-btn"),w=e.querySelector(".motor-stop-btn"),c=()=>{let L=i.value||String(a),_="";for(let S=1;S<=6;S++)_+='<option value="'+S+'">'+p("common.zone")+" "+S+"</option>";i.innerHTML=_,i.value=L};function b(L){n=!!L,r&&(r.classList.toggle("on",n),r.setAttribute("aria-checked",n?"true":"false")),o&&o.classList.toggle("locked",!n),[i,l,u,f,w].forEach(_=>{_&&(_.disabled=!n)})}function x(){let L=!n;b(L);let _=()=>{};if(L){jt(!0).catch(_);for(let S=1;S<=6;S++)da(S).catch(_)}else jt(!1).catch(_)}function k(){let L=F(g.motorTarget(a));l&&L!=null?l.value=Number(L).toFixed(0):l&&(l.value="0")}i==null||i.addEventListener("change",()=>{a=Number(i.value||1),k()}),r==null||r.addEventListener("click",x),r==null||r.addEventListener("keydown",L=>{L.key!==" "&&L.key!=="Enter"||(L.preventDefault(),x())});for(let L=1;L<=6;L++)M(g.motorTarget(L),k);k(),b(n),K("manualMode",()=>{b(!!R("manualMode"))}),N(e),l==null||l.addEventListener("change",L=>{if(!n)return;let _=L.target.value;xr(a,_)}),u==null||u.addEventListener("click",()=>{n&&Ka(a,1e4)}),f==null||f.addEventListener("click",()=>{n&&Wa(a,1e4)}),w==null||w.addEventListener("click",()=>{n&&da(a)})}});var Dt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function ya(t){switch(Number(t)){case Dt.CONTACT:return"contact";case Dt.UNDER_LOAD:return"load";case Dt.STOPPING:return"stopping";default:return"free"}}function ho(t){let e=t||[];for(let a=0;a<e.length;a++){let n=Number(e[a].stroke_phase)||0;if(n===Dt.CONTACT||n===Dt.UNDER_LOAD)return e[a]}return null}function go(t,e,a){if(e[a]==null)return null;let n=Number(t[e[a]]);return Number.isFinite(n)?n:null}function vo(t){let e=String(t||"").split(/\r?\n/).filter(o=>o.trim());if(e.length<2)return[];let a=e[0].split(",").map(o=>o.trim()),n={};for(let o=0;o<a.length;o++)n[a[o]]=o;let r=[];for(let o=1;o<e.length;o++){let i=e[o].split(",");if(i.length<6)continue;let l=u=>Number(i[n[u]]);r.push({t_ms:l("t_ms")||0,motion_count:l("motion_count")||0,current_ma:l("current_ma"),adc_current_raw:go(i,n,"adc_current_raw"),drive_on:l("drive_on")===1,direction_open:l("direction_open")===1,armed:l("armed")===1,stroke_phase:l("stroke_phase")||0,tacho_period_us:go(i,n,"tacho_period_us"),tacho_amp_raw:go(i,n,"tacho_amp_raw")})}return r}function mn(t){let e=t.filter(a=>Number.isFinite(a));return e.length?e.reduce((a,n)=>a+n,0)/e.length:null}function bo(t){let e=0,a=0;for(let n of t)n===!0?e+=1:n===!1&&(a+=1);return!e&&!a?null:e>=a}function xo(t,e=2){let a=(t||[]).filter(i=>i&&Number.isFinite(i.t_ms)).slice().sort((i,l)=>i.t_ms-l.t_ms);if(!a.length)return[];let n=Math.max(1,Math.round(1e3/Math.max(.1,e))),r=[],o=0;for(;o<a.length;){let i=Math.floor(a[o].t_ms/n)*n,l=i+n,u=o;for(;u<a.length&&a[u].t_ms<l;)u+=1;let f=a.slice(o,u),w=f[f.length-1];r.push({t_ms:i+Math.floor(n/2),motion_count:Math.max(...f.map(c=>Number(c.motion_count)||0)),current_ma:mn(f.map(c=>c.current_ma)),adc_current_raw:mn(f.map(c=>c.adc_current_raw)),drive_on:bo(f.map(c=>!!c.drive_on))===!0,direction_open:bo(f.map(c=>!!c.direction_open))===!0,armed:bo(f.map(c=>!!c.armed))===!0,stroke_phase:Math.max(...f.map(c=>Number(c.stroke_phase)||0)),tacho_period_us:mn(f.map(c=>c.tacho_period_us)),tacho_amp_raw:mn(f.map(c=>c.tacho_amp_raw)),_bucket_n:f.length}),o=u}return r}function yo(t,e,a=6e4,n=2){let r=new Map;for(let f of t||[])f&&Number.isFinite(f.t_ms)&&r.set(f.t_ms,f);for(let f of xo(e||[],n))f&&Number.isFinite(f.t_ms)&&r.set(f.t_ms,f);let o=Array.from(r.values()).sort((f,w)=>f.t_ms-w.t_ms);if(!o.length||!(a>0))return o;let l=o[o.length-1].t_ms-a,u=0;for(;u<o.length&&o[u].t_ms<l;)u+=1;return u?o.slice(u):o}var Mc="t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw";function Zt(t){return t==null||t===""?"":typeof t=="boolean"?t?"1":"0":typeof t=="number"?Number.isFinite(t)?String(t):"":String(t)}function Cc(t){let e=[Mc];for(let a of t||[])e.push([Zt(a.t_ms),Zt(a.motion_count),Number.isFinite(a.current_ma)?a.current_ma.toFixed(1):"",Zt(a.adc_current_raw),a.drive_on?"1":"0",a.direction_open?"1":"0",a.armed?"1":"0",Zt(a.stroke_phase||0),Zt(a.tacho_period_us),Zt(a.tacho_amp_raw)].join(","));return e.join(`
`)+`
`}function Ls(t,e){let a=new Blob([Cc(t)],{type:"text/csv;charset=utf-8"}),n=URL.createObjectURL(a),r=document.createElement("a");r.href=n,r.download=e||"lune-v6-motor-trace.csv",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function Lc(t){let e=0,a=0;for(let n=0;n<t.length;n++)t[n].drive_on&&(t[n].direction_open?e+=1:a+=1);return e>=a?"open":"close"}function Ac(t,e){if(!t.length)return null;let a=t.slice().sort((r,o)=>r-o),n=Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*e)));return a[n]}function Pe(t){return Math.round(t*10)/10}function fo(t,e,a){return Math.min(a,Math.max(e,t))}function Fc(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function As(t){let e=[];if(!t.length)return e;let a=t[0].t_ms,n=t[t.length-1].t_ms;for(let r=a;r+500<=n;r+=500){let o=t.reduce((u,f)=>Math.abs(f.t_ms-r)<Math.abs(u.t_ms-r)?f:u,t[0]),i=t.reduce((u,f)=>Math.abs(f.t_ms-(r+500))<Math.abs(u.t_ms-(r+500))?f:u,t[0]),l=(i.t_ms-o.t_ms)/1e3;l>.2&&e.push({t_ms:r+500,slope:(i.current_ma-o.current_ma)/l})}return e}function wa(t){let e=t||[],a=[];for(let i=0;i<e.length;i++){let l=e[i],u=l.tacho_period_us!=null?l.tacho_period_us:l.tacho_cadence_us!=null?l.tacho_cadence_us:null;a.push({t_ms:l.t_ms,period_us:u,rate_hz:Fc(u)})}let n=e.filter(i=>i.drive_on&&Number.isFinite(i.current_ma)),r=n.length>=2?n:e.filter(i=>Number.isFinite(i.current_ma)),o=As(r);return{cadence:a,slopes:o,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function Fs(t,e){let a=e||Lc(t),n=t.filter(Z=>Z.drive_on&&Number.isFinite(Z.current_ma)&&(a==="open"?Z.direction_open:!Z.direction_open));if(n.length<8)return{direction:a,ok:!1,reason:"too_few_samples"};let r=n[0].t_ms,o=n[n.length-1].t_ms,i=n.filter(Z=>Z.t_ms>=r+650),l=i.length>12?i:n,u=Math.max(1,o-(l[0]?l[0].t_ms:r)),f=l.filter(Z=>Z.t_ms<l[0].t_ms+u*.7),w=l.filter(Z=>Z.t_ms>=l[0].t_ms+u*.8),c=(f.length?f:l).map(Z=>Z.current_ma),b=(w.length?w:l.slice(-Math.max(4,l.length/8|0))).map(Z=>Z.current_ma),x=c.reduce((Z,Ue)=>Z+Ue,0)/c.length,k=Math.max(...n.map(Z=>Z.current_ma)),L=Math.max(...b),_=Math.max(0,n[n.length-1].motion_count-n[0].motion_count),S=As(l),v=S.filter(Z=>Z.t_ms<l[0].t_ms+u*.7).map(Z=>Z.slope),d=S.filter(Z=>Z.t_ms>=l[0].t_ms+u*.75).map(Z=>Z.slope),m=d.length?Math.max(...d):0,h=Ac(v.map(Math.abs),.9)||0,z=a==="close"?.55:.68,T=x>.5?L/x:0,W=Math.max(...n.map(Z=>Number(Z.stroke_phase)||0)),D=Nc(l,Tc),j=a==="open"?T>=1.35||W>=Dt.STOPPING:D>=Ec||W>=Dt.UNDER_LOAD,J=Pe(fo(1+z*Math.max(0,T-1),1.25,2.4)),ae=Pe(fo(Math.max(h*2.2,m*.42,a==="open"?.15:.4),.15,8)),B=Pe(fo(1+.35*Math.max(0,T-1),1.15,1.8)),V=a==="open"?1.15:null,ie=ho(n);return{direction:a,ok:j,reason:j?null:"no_endstop",start_ms:r,end_ms:o,runtime_ms:o-r,mean_ma:Pe(x),peak_ma:Pe(k),stall_peak_ma:Pe(L),ripples:_,max_stall_slope_ma_s:Pe(m),travel_slope_ma_s:Pe(h),measured_factor:Pe(T),max_trailing_step_ma:Pe(D),endstop_seen:j,suggested_factor:J,suggested_slope:ae,suggested_slope_floor:B,suggested_ripple_limit:V,pin_seen:!!ie,pin_t_ms:ie?ie.t_ms:null,pin_motion_count:ie?ie.motion_count:null,pin_current_ma:ie?Pe(ie.current_ma):null,samples:n}}var Tc=2e3,Ec=2.5;function Nc(t,e){let a=0,n=0;for(let r=0;r<t.length;r+=1){for(;n<r&&t[r].t_ms-t[n].t_ms>e;)n+=1;if(n>0||t[r].t_ms-t[0].t_ms>=e){let o=t[r].current_ma-t[n].current_ma;o>a&&(a=o)}}return a}function Ts(t,e){if(!t||!t.ok)return[];let a=t.mean_ma,n=Number(e&&e.factor)||t.suggested_factor,r=[{id:"mean",value:a},{id:"threshold",value:Pe(a*n)},{id:"suggested",value:Pe(a*t.suggested_factor)}],o=e&&e.caps||{},i=Number(t.direction==="open"?o.open:o.seat),l=Number(o.stall);return Number.isFinite(i)&&i>0&&r.push({id:"cap",value:Pe(i)}),Number.isFinite(l)&&l>0&&r.push({id:"stall",value:Pe(l)}),r}var ka=920,_a=200,Es=56,pe={t:16,r:18,b:32,l:52},Qe=ka-pe.l-pe.r,Xt=_a-pe.t-pe.b,wo="var(--accent)",So="var(--series-cool)",Rc="var(--state-warn)",Pc="var(--state-ok)",Dc="var(--state-danger)",Oc="var(--text-faint)",gn="var(--state-warn)",ko="var(--series-cool)",_o="var(--accent)",$c="var(--state-ok)",Ns={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},Rs={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},Ic=`
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
`;O("motor-lab-charts",Ic);function Gt(t,e,a=Xt){let n=e.max-e.min||1;return pe.t+a-(t-e.min)/n*a}function bn(t,e,a,n=_a){t.appendChild(I("text",{class:"chart-axis-label",x:pe.l,y:n-8},"0 s")),t.appendChild(I("text",{class:"chart-axis-label",x:pe.l+Qe-48,y:n-8},(a/1e3).toFixed(1)+" s"))}function zo(t,e,a=Xt){for(let n=0;n<=4;n++){let r=pe.t+a*n/4;t.appendChild(I("line",{class:"chart-grid",x1:pe.l,x2:pe.l+Qe,y1:r,y2:r}));let o=e.max-(e.max-e.min)*n/4;t.appendChild(I("text",{class:"chart-tick",x:8,y:r+4},o.toFixed(0)))}}function Hc(t){if(!t.length)return[];let e=[],a=0,n=Number(t[0].stroke_phase)||0;for(let r=1;r<t.length;r++){let o=Number(t[r].stroke_phase)||0;o!==n&&(e.push({phase:n,start:a,end:r-1}),a=r,n=o)}return e.push({phase:n,start:a,end:t.length-1}),e}function qc(t){let e=t.querySelector("defs");return e||(e=I("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([n,r,o])=>{let i=I("pattern",{id:n,width:4,height:4,patternUnits:"userSpaceOnUse"});i.appendChild(I("path",{d:r,stroke:o,"stroke-width":"1",fill:"none"})),e.appendChild(i)}),t.appendChild(e),e)}function Sa(t,e,a){let n=document.createElement("div");n.className="chart-card",n.setAttribute("role","img"),n.setAttribute("aria-label",p(a||t));let r=document.createElement("div");return r.className="chart-head",r.innerHTML='<span class="chart-title">'+p(t)+'</span><span class="chart-sub">'+e+"</span>",n.appendChild(r),n}function Bc(t,e,a){let n=Sa(e,p(a||"diagnostics.lab.empty"),e),r=document.createElement("div");r.className="lab-empty",r.textContent=p("diagnostics.lab.empty"),n.appendChild(r),t.appendChild(n)}function fn(t,e,a){return t?p("diagnostics.lab.res.live"):a&&a.truncated?p("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?p("diagnostics.lab.res.trace",{direction:p("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):p("diagnostics.lab.res.traceReady")}function jc(t,e,a,n,r,o){if(!o.current&&!o.overlays)return;let i=wa(e),l=Sa("diagnostics.lab.chart.current",fn(r,a,i),"diagnostics.lab.chart.currentAria");if(i.truncated){let S=document.createElement("div");S.className="lab-chart-warn",S.textContent=p("diagnostics.lab.res.ringWarn",{n:2e3,s:i.window_ms/1e3}),l.appendChild(S)}if(!e.length){let S=document.createElement("div");S.className="lab-empty",S.textContent=p("diagnostics.lab.empty"),l.appendChild(S),t.appendChild(l);return}let u=e.map(S=>S.current_ma).filter(Number.isFinite),f=(n||[]).map(S=>S.value).filter(Number.isFinite),w=on(u.concat([0,40],f),0,50);w.min=0;let c=e[0].t_ms,b=Math.max(1,e[e.length-1].t_ms-c),x=S=>pe.l+(e[S].t_ms-c)/b*Qe,k=e.map((S,v)=>({x:x(v),y:Gt(S.current_ma,w)})),L=I("svg",{viewBox:"0 0 "+ka+" "+_a,role:"img"});if(zo(L,w),bn(L,c,b),o.overlays){let S={mean:So,threshold:Rc,suggested:Pc,cap:Dc,stall:Oc};(n||[]).forEach(v=>{let d=Gt(v.value,w);L.appendChild(I("line",{x1:pe.l,x2:pe.l+Qe,y1:d,y2:d,stroke:S[v.id],"stroke-dasharray":v.id==="mean"?"0":"5 4","stroke-width":v.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:v.id==="cap"||v.id==="stall"?".45":".9"}))})}let _=a&&a.ok&&a.pin_seen?{t_ms:a.pin_t_ms,current_ma:a.pin_current_ma,motion_count:a.pin_motion_count,stroke_phase:1}:ho(e);if(_&&Number.isFinite(_.t_ms)){let S=pe.l+(_.t_ms-c)/b*Qe;L.appendChild(I("line",{x1:S,x2:S,y1:pe.t,y2:pe.t+Xt,stroke:gn,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),L.appendChild(I("circle",{cx:S,cy:Gt(Number(_.current_ma)||0,w),r:4.2,fill:gn,stroke:"var(--bg)","stroke-width":"1.5"})),L.appendChild(I("text",{class:"chart-tick",x:Math.min(S+6,pe.l+Qe-64),y:pe.t+12,fill:gn},p("diagnostics.lab.pinMark")))}o.current&&L.appendChild(I("path",{d:Ut(k),fill:"none",stroke:wo,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),l.appendChild(L),t.appendChild(l),it(L,l,{count:e.length,plotTop:pe.t,plotBottom:pe.t+Xt,xAt:x,label:S=>((e[S].t_ms-c)/1e3).toFixed(2)+" s",dots:S=>o.current?[{y:k[S].y,color:wo}]:[],rows:S=>[{color:wo,label:p("diagnostics.lab.currentMa"),value:Number(e[S].current_ma).toFixed(1)+" mA"},{color:So,label:p("diagnostics.lab.motion"),value:String(e[S].motion_count)},{color:gn,label:p("diagnostics.lab.stroke"),value:p("diagnostics.lab.stroke."+ya(e[S].stroke_phase))}]})}function Vc(t,e,a,n){if(!n.phase)return;let r=wa(e),o=Sa("diagnostics.lab.chart.phase",fn(a,null,r),"diagnostics.lab.chart.phaseAria");if(!e.length){let b=document.createElement("div");b.className="lab-empty",b.textContent=p("diagnostics.lab.empty"),o.appendChild(b),t.appendChild(o);return}let i=e[0].t_ms,l=Math.max(1,e[e.length-1].t_ms-i),u=Es+pe.b,f=I("svg",{viewBox:"0 0 "+ka+" "+u,class:"lab-phase-strip",role:"img"});qc(f);let w=10,c=Es-18;Hc(e).forEach(b=>{let x=pe.l+(e[b.start].t_ms-i)/l*Qe,k=pe.l+(e[b.end].t_ms-i)/l*Qe,L=ya(b.phase),_=Math.max(2,k-x);f.appendChild(I("rect",{x,y:w,width:_,height:c,fill:Ns[L]||Ns.free,stroke:"var(--separator)","stroke-width":"1"})),Rs[L]&&f.appendChild(I("rect",{x,y:w,width:_,height:c,fill:"url(#"+Rs[L]+")",opacity:".55"})),_>54&&f.appendChild(I("text",{x:x+6,y:w+c/2+3},p("diagnostics.lab.stroke."+L))),f.appendChild(I("line",{x1:k,x2:k,y1:w,y2:w+c,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),bn(f,i,l,u),o.appendChild(f),t.appendChild(o)}function Uc(t,e,a,n){if(!n.cadence)return;let r=wa(e),o=Sa("diagnostics.lab.chart.cadence",fn(a,null,r),"diagnostics.lab.chart.cadenceAria"),i=r.cadence.map(x=>x.rate_hz).filter(x=>x!=null&&Number.isFinite(x));if(!i.length){let x=document.createElement("div");x.className="lab-empty",x.textContent=p("diagnostics.lab.chart.cadenceEmpty"),o.appendChild(x),t.appendChild(o);return}let l=on(i.concat([0]),0,Math.max(10,...i));l.min=0;let u=e[0].t_ms,f=Math.max(1,e[e.length-1].t_ms-u),w=[],c=[];r.cadence.forEach((x,k)=>{x.rate_hz==null||!Number.isFinite(x.rate_hz)||(w.push({x:pe.l+(x.t_ms-u)/f*Qe,y:Gt(x.rate_hz,l)}),c.push(k))});let b=I("svg",{viewBox:"0 0 "+ka+" "+_a,role:"img"});zo(b,l),bn(b,u,f),b.appendChild(I("path",{d:Ut(w),fill:"none",stroke:ko,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),o.appendChild(b),t.appendChild(o),it(b,o,{count:w.length,plotTop:pe.t,plotBottom:pe.t+Xt,xAt:x=>w[x].x,label:x=>((r.cadence[c[x]].t_ms-u)/1e3).toFixed(2)+" s",dots:x=>[{y:w[x].y,color:ko}],rows:x=>{let k=r.cadence[c[x]];return[{color:ko,label:p("diagnostics.lab.cadence"),value:k.rate_hz.toFixed(1)+" /s"},{color:So,label:p("diagnostics.lab.tachoPeriod"),value:Math.round(k.period_us)+" \xB5s"}]}})}function Kc(t,e,a,n,r){if(!r.slope)return;let o=wa(e),i=Sa("diagnostics.lab.chart.slope",fn(n,a,o),"diagnostics.lab.chart.slopeAria");if(!o.slopes.length){let k=document.createElement("div");k.className="lab-empty",k.textContent=p("diagnostics.lab.chart.slopeEmpty"),i.appendChild(k),t.appendChild(i);return}let l=o.slopes.map(k=>k.slope),u=a&&a.ok?a.suggested_slope:null,f=on(l.concat(u!=null?[u,0]:[0]),-2,8),w=e[0].t_ms,c=Math.max(1,e[e.length-1].t_ms-w),b=o.slopes.map(k=>({x:pe.l+(k.t_ms-w)/c*Qe,y:Gt(k.slope,f)})),x=I("svg",{viewBox:"0 0 "+ka+" "+_a,role:"img"});if(zo(x,f),bn(x,w,c),u!=null){let k=Gt(u,f);x.appendChild(I("line",{x1:pe.l,x2:pe.l+Qe,y1:k,y2:k,stroke:$c,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}x.appendChild(I("path",{d:Ut(b),fill:"none",stroke:_o,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),i.appendChild(x),t.appendChild(i),it(x,i,{count:b.length,plotTop:pe.t,plotBottom:pe.t+Xt,xAt:k=>b[k].x,label:k=>((o.slopes[k].t_ms-w)/1e3).toFixed(2)+" s",dots:k=>[{y:b[k].y,color:_o}],rows:k=>[{color:_o,label:p("diagnostics.lab.slope"),value:o.slopes[k].slope.toFixed(2)+" mA/s"}]})}function Ds(t,e){let a=e&&e.samples||[],n=e&&e.analysis,r=!!(e&&e.live),o=e&&e.overlays,i=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let l=document.createElement("div");l.className="motor-lab-charts";let u=document.createElement("div");return u.className="gw-controls",u.setAttribute("role","toolbar"),u.setAttribute("aria-label",p("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([w,c])=>{let b=document.createElement("button");b.type="button",b.className="gw-toggle"+(i[w]?"":" is-off"),b.dataset.layer=w,b.setAttribute("aria-pressed",i[w]?"true":"false"),b.textContent=p(c),u.appendChild(b)}),l.appendChild(u),a.length?(jc(l,a,n,o,r,i),Vc(l,a,r,i),Uc(l,a,r,i),Kc(l,a,n,r,i)):Bc(l,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(l),u}var Jt={ms:4e4,counts:3120},Wc=3600,Zc=Object.freeze({closeFactor:1.45,openFactor:1.25,stallFraction:.3,learnedStallMa:null,trailingStepMa:2.5,trailingSustainMs:1e3,trailingWindowMs:2e3,seatMa:34,seatFrames:4,popoffMa:36,popoffFrames:2,stallMa:65,stallFrames:3,openStopMa:40,openFrames:3,circuitMa:85,circuitFrames:2,closeCeilingS:38,closeCeilingCounts:2600,openCeilingS:45,seatingLearned:!1}),Gc=200;function Os(t,e,a){return Math.min(a,Math.max(e,t))}function Xc(t){let e=(t||[]).filter(o=>o&&Number.isFinite(o.t_ms)&&Number.isFinite(o.current_ma));if(e.length<2)return[];let a=[],n=0,r=Math.ceil(e[0].t_ms/10)*10;for(let o=r;o<=e[e.length-1].t_ms;o+=10){for(;n+1<e.length&&e[n+1].t_ms<=o;)n+=1;let i=e[n],l=e[Math.min(n+1,e.length-1)],u=l.t_ms-i.t_ms,f=u>0?(o-i.t_ms)/u:0;a.push({t_ms:o,current_ma:i.current_ma+(l.current_ma-i.current_ma)*f,motion_count:(Number(i.motion_count)||0)+((Number(l.motion_count)||0)-(Number(i.motion_count)||0))*f,stroke_phase:Number(i.stroke_phase)||0})}return a}function $s(t){let e=Math.max(1,Math.floor(t.window/24)),a=[],n=0,r=0,o=0,i=!1;return{observe(l,u){let f=null;for(let b=a.length-1;b>=0;b-=1)if(l-a[b].t>=t.window){f=a[b].v;break}let w=n===0?0:l-n;n=l;let c=f==null?null:u-f;return c!=null&&c>t.step?(o+=w,o>=t.sustain&&(i=!0)):o=0,(!a.length||l-r>=e)&&(r=l,a.push({t:l,v:u}),a.length>48&&a.shift()),{rise:c,qualifying:c!=null&&c>t.step,tripped:i}}}}function Yt(t){let e=0;return a=>(e=a?e+10:0,a&&e>=t)}function Is(t,e,a){let n=Object.assign({},Zc,a||{}),r=e==="open",o=Xc(t),i=o.some(h=>h.stroke_phase===0),l=null,u=0,f={window:n.trailingWindowMs,step:n.trailingStepMa,sustain:n.trailingSustainMs},w=$s(f),c=!1,b=null,x={threshold:Yt(60),seat:Yt(n.seatFrames*6.4),popoff:Yt(n.popoffFrames*6.4),stall:Yt(n.stallFrames*6.4),open:Yt(n.openFrames*6.4),circuit:Yt(n.circuitFrames*6.4)},k=r&&Number.isFinite(n.learnedStallMa),L=[],_={},S=(h,z)=>{_[h]==null&&(_[h]={t_ms:z.t_ms,motion_count:Math.round(z.motion_count),current_ma:z.current_ma})};for(let h of o){let z=h.t_ms,T=h.current_ma,W=i?h.stroke_phase===0:!0;z>=400&&W&&(l==null||T<l-.5)&&(l=Os(T,8,32),u=z);let D=l!=null&&z-u>=300;h.stroke_phase===0&&(c=!0),!r&&i&&c&&!b&&h.stroke_phase>=1&&(b={ma:T,count:h.motion_count},w=$s(f));let j=null;D&&(k&&n.learnedStallMa>l+5?j=Os(l+n.stallFraction*(n.learnedStallMa-l),n.openStopMa*.75,n.stallMa):j=(b?Math.max(l,b.ma):l)*(r?n.openFactor:n.closeFactor));let J=z>=650,ae=z>=250,B=!r&&J?w.observe(z,T):{rise:null,qualifying:!1,tripped:!1},V=!b||n.seatingLearned||h.motion_count>=b.count+Gc;if(J&&x.threshold(j!=null&&T>j)&&S("threshold",h),B.tripped&&(!b||n.seatingLearned)&&S("trailing",h),ae)if(x.stall(T>n.stallMa)&&S("stall",h),x.circuit(T>n.circuitMa)&&S("circuit",h),!r)x.popoff(T>n.popoffMa)&&S("popoff",h),x.seat(h.stroke_phase>=2&&V&&T>n.seatMa)&&S("seat",h);else{let Ue=D||z>=8e3;x.open(Ue&&T>n.openStopMa)&&S("openStop",h)}let ie=r?Wc:n.closeCeilingCounts,Z=(r?n.openCeilingS:n.closeCeilingS)*1e3;(z>=Z||h.motion_count>=ie)&&S("ceiling",h),!r&&(z>=Jt.ms||h.motion_count>=Jt.counts)&&S("wall",h),L.push({t_ms:z,current_ma:T,motion_count:h.motion_count,baseline_ma:l,threshold_ma:j,rise_ma:B.rise,qualifying:B.qualifying})}let v=r?["threshold","openStop","stall","circuit"]:["trailing","threshold","seat","popoff","stall","circuit"],d=null;for(let h of v)_[h]&&(!d||_[h].t_ms<_[d].t_ms)&&(d=h);let m=_.ceiling&&(!d||_.ceiling.t_ms<=_[d].t_ms);return{direction:r?"open":"close",params:n,series:L,trips:_,first:m?"ceiling":d,beforeWall:r||!_.wall||d!=null&&_[d].t_ms<_.wall.t_ms||!!m,usesFraction:k,baselineMa:l,pinAnchorMa:b?b.ma:null}}function Hs(t){let e=t.params,a=[...t.series].reverse().find(r=>r.threshold_ma!=null),n=[];return t.baselineMa!=null&&n.push({id:"baseline",ma:t.baselineMa}),a&&n.push({id:"threshold",ma:a.threshold_ma}),t.direction==="close"?n.push({id:"seat",ma:e.seatMa},{id:"popoff",ma:e.popoffMa}):n.push({id:"openStop",ma:e.openStopMa}),n.push({id:"stall",ma:e.stallMa},{id:"circuit",ma:e.circuitMa}),n}var qs=[[250,23,24.8,2],[750,66,24.4,2],[1250,109,24.3,2],[1750,144,24.3,2],[2250,179,24.2,2],[2750,221,24.2,2],[3250,262,24.3,2],[3750,296,24.3,2],[4250,337,24.3,2],[4750,377,24.2,2],[5250,410,24.3,2],[5750,448,24.2,2],[6250,486,24.2,2],[6750,524,24.3,2],[7250,564,24.2,2],[7750,606,24.2,2],[8250,646,24.9,2],[8750,688,24.2,2],[9250,725,24.2,2],[9750,768,24.3,2],[10250,807,24.2,2],[10750,843,24.2,2],[11250,883,24.1,2],[11750,922,24,2],[12250,961,24.2,2],[12750,1e3,25.2,2],[13250,1040,25.8,2],[13750,1083,26.2,2],[14250,1117,26.2,2],[14750,1154,26.4,2],[15250,1196,26.7,2],[15750,1236,26.7,2],[16250,1271,26.8,2],[16750,1309,27.4,2],[17250,1344,28.3,2],[17750,1381,28.9,2],[18250,1425,29,2],[18750,1460,29.6,2],[19250,1484,30.3,2],[19750,1523,30.9,2],[20250,1564,32.5,2],[20750,1602,31.9,2],[21250,1645,32.1,2],[21750,1687,32.2,2],[22250,1729,33,2],[22750,1768,33.6,2],[23250,1808,31.9,2],[23750,1850,31.2,2],[24250,1897,31,2],[24750,1939,31.3,2],[25250,1982,31.2,2],[25750,2023,31.5,2],[26250,2062,31.4,2],[26750,2101,31.2,2],[27250,2136,31.3,2],[27750,2172,31.3,2],[28250,2207,31.6,2],[28750,2244,31.2,2],[29250,2288,31.3,2],[29750,2328,31.1,2],[30250,2367,31.8,2],[30750,2401,31.5,2],[31250,2439,31.2,2],[31750,2477,31.6,2],[32250,2516,31.2,2],[32750,2556,31.9,2],[33250,2588,31.5,2],[33750,2622,31.5,2],[34250,2660,31.6,2],[34750,2699,31.6,2],[35250,2739,32.1,2],[35750,2771,31.5,2],[36250,2809,31.4,2],[36750,2847,31.6,2],[37250,2888,31.9,2],[37750,2929,32.3,2],[38250,2966,32.5,2],[38750,3004,33.6,2],[39250,3037,34.5,2],[39750,3077,35.9,2],[40250,3110,36.5,2],[40750,3139,38.2,2],[41250,3171,39,2],[41750,3196,40,2],[42250,3223,40.8,2],[42750,3243,42,2],[43250,3262,43,2],[43750,3289,44.4,2],[44250,3306,44.7,2],[44750,3334,45.9,2],[45250,3351,46.2,2],[45750,3380,48.5,2],[46250,3408,47.9,2],[46750,3440,50,2],[47250,3477,49.4,2],[47750,3515,51.1,2],[48250,3546,51.2,2],[48750,3590,52.4,2],[49250,3635,53.8,2],[49750,3672,53.3,2],[50250,3715,55.3,2],[50750,3754,54.5,2],[51250,3794,56.7,2],[51750,3835,57,2],[52250,3881,57.3,2],[52750,3922,61.1,2],[53250,3966,59.5,2],[53750,3966,40,3]],Bs=[[3250,218,57.2,2],[3750,232,58.8,2],[4250,348,28.3,0],[4750,392,28.2,0],[5250,436,27.7,0],[5750,480,27,0],[6250,525,27.1,0],[6750,568,26.7,0],[7250,613,26.5,0],[7750,656,26.2,0],[8250,702,26.3,0],[8750,745,26.2,0],[9250,789,26.3,0],[9750,831,26.5,0],[10250,875,26.2,0],[10750,921,26.2,0],[11250,962,26.3,0],[11750,1001,26.1,0],[12250,1043,26,0],[12750,1087,26.2,0],[13250,1130,26.1,0],[13750,1170,26.2,0],[14250,1206,26.1,0],[14750,1241,26,0],[15250,1282,25.9,0],[15750,1323,26,0],[16250,1365,26,0],[16750,1408,25.9,0],[17250,1449,25.9,0],[17750,1489,25.7,0],[18250,1519,25.9,0],[18750,1551,25.8,0],[19250,1586,25.8,0],[19750,1621,25.9,0],[20250,1661,25.8,0],[20750,1702,25.9,0],[21250,1744,26,0],[21750,1783,26,0],[22250,1817,26,0],[22750,1852,25.9,0],[23250,1888,26,0],[23750,1931,25.8,0],[24250,1973,25.7,0],[24750,2012,25.5,0],[25250,2051,25.5,0],[25750,2091,25.2,0],[26250,2131,25.1,0],[26750,2165,25.2,0],[27250,2195,25,0],[27750,2235,25,0],[28250,2275,24.7,0],[28750,2315,24.7,0],[29250,2353,24.5,0],[29750,2397,24.6,0],[30250,2435,24.6,0],[30750,2467,25,0],[31250,2500,24.4,0],[31750,2542,24.5,0],[32250,2581,24.4,0],[32750,2618,24.4,0],[33250,2661,24.4,0],[33750,2699,24.4,0],[34250,2742,24.4,0],[34750,2783,24.4,0],[35250,2813,24.3,0],[35750,2843,24.4,0],[36250,2882,24.4,0],[36750,2920,24.4,0],[37250,2959,24.5,0],[37750,3e3,24.4,0],[38250,3042,24.3,0],[38750,3083,24.4,0],[39250,3115,24.4,0],[39750,3141,24.4,0],[40250,3177,24.4,0],[40750,3219,24.4,0],[41250,3257,24.4,0],[41750,3295,24.4,0],[42250,3335,24.4,0],[42750,3381,24.4,0],[43250,3417,24.5,0]];function js(t){return t.map(([e,a,n,r])=>({t_ms:e,motion_count:a,current_ma:n,stroke_phase:r}))}var Ao=920,Mo=230,Co=130,fe={t:22,r:200,b:28,l:44},ot=Ao-fe.l-fe.r,ta="var(--series-measured)",Vs="var(--series-cool)",lt="var(--accent)",Qt="var(--text-muted)",Us="var(--state-warn)",Fo="var(--state-danger)",Ks={baseline:{stroke:Vs,dash:"0",width:1.4},threshold:{stroke:lt,dash:"6 4",width:1.6},seat:{stroke:Qt,dash:"2 4",width:1.2},popoff:{stroke:Qt,dash:"8 3 2 3",width:1.2},openStop:{stroke:Qt,dash:"2 4",width:1.2},stall:{stroke:Qt,dash:"8 3",width:1.2},circuit:{stroke:Qt,dash:"1 3",width:1.2}},Yc=`
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
`;O("motor-lab-thresholds",Yc);var aa=t=>(t/1e3).toFixed(2)+" s",ea=t=>Number(t).toFixed(1)+" mA";function Ws(t,e,a,n){let r=e-t||1;return o=>a+n-(o-t)/r*n}function Lo(t){let e="",a=!1;for(let n of t){if(n==null){a=!1;continue}e+=(a?" L ":" M ")+n.x.toFixed(1)+" "+n.y.toFixed(1),a=!0}return e.trim()}function Jc(t,e,a,n){let r=t.slice().sort((i,l)=>i.y-l.y);for(let i=1;i<r.length;i++)r[i].y-r[i-1].y<e&&(r[i].y=r[i-1].y+e);let o=r.length?r[r.length-1].y-n:0;if(o>0&&r.forEach(i=>{i.y-=o}),r.length&&r[0].y<a){let i=a-r[0].y;r.forEach(l=>{l.y+=i})}return r}function Zs(t,e,a,n,r){for(let o=Math.ceil(e/1e4)*1e4;o<=a;o+=1e4)o!==0&&t.appendChild(I("text",{class:"chart-axis-label",x:n(o)-8,y:r-8},o/1e3+" s"))}function kt(t,e){return t==="threshold"?p(e==="open"?"diagnostics.lab.thr.openThreshold":"diagnostics.lab.thr.closeThreshold"):p("diagnostics.lab.thr."+t)}function Qc(t,e){let a=e.params,n=e.direction==="close"&&e.pinAnchorMa!=null,r=n&&e.baselineMa!=null?Math.max(e.baselineMa,e.pinAnchorMa):e.baselineMa;switch(t){case"trailing":{let o=p("diagnostics.lab.thr.trailingDetail",{step:a.trailingStepMa.toFixed(1),window:(a.trailingWindowMs/1e3).toFixed(1),sustain:(a.trailingSustainMs/1e3).toFixed(2)});return n&&!a.seatingLearned?o+" \xB7 "+p("diagnostics.lab.thr.trailingPinGate"):o}case"threshold":return r==null?p("diagnostics.lab.thr.noBaseline"):e.direction==="open"&&e.usesFraction?p("diagnostics.lab.thr.fractionDetail",{base:r.toFixed(1),k:a.stallFraction.toFixed(2),stall:a.learnedStallMa.toFixed(1)}):p("diagnostics.lab.thr.factorDetail",{base:r.toFixed(1),f:(e.direction==="open"?a.openFactor:a.closeFactor).toFixed(2),ma:(r*(e.direction==="open"?a.openFactor:a.closeFactor)).toFixed(1)})+(n?" \xB7 "+p("diagnostics.lab.thr.pinAnchored"):"");case"seat":return p("diagnostics.lab.thr.capDetail",{ma:a.seatMa.toFixed(1),frames:a.seatFrames})+" \xB7 "+p("diagnostics.lab.thr.seatGate");case"popoff":return p("diagnostics.lab.thr.capDetail",{ma:a.popoffMa.toFixed(1),frames:a.popoffFrames});case"openStop":return p("diagnostics.lab.thr.capDetail",{ma:a.openStopMa.toFixed(1),frames:a.openFrames})+" \xB7 "+p("diagnostics.lab.thr.openGate");case"stall":return p("diagnostics.lab.thr.capDetail",{ma:a.stallMa.toFixed(1),frames:a.stallFrames});case"circuit":return p("diagnostics.lab.thr.capDetail",{ma:a.circuitMa.toFixed(1),frames:a.circuitFrames});case"ceiling":return e.direction==="open"?p("diagnostics.lab.thr.ceilingDetail",{s:a.openCeilingS,counts:3600}):p("diagnostics.lab.thr.ceilingDetail",{s:a.closeCeilingS,counts:a.closeCeilingCounts});case"wall":return p("diagnostics.lab.thr.wallDetail",{s:Jt.ms/1e3,counts:Jt.counts});default:return""}}function Gs(t){return t==="open"?["threshold","openStop","stall","circuit","ceiling"]:["trailing","threshold","seat","popoff","stall","circuit","ceiling","wall"]}function ed(t){let e=t.trips.wall;if(!t.first)return{state:"none",text:p("diagnostics.lab.thr.verdictNone")};let a=t.trips[t.first];return t.first==="ceiling"?{state:"ceiling",icon:"!",text:p("diagnostics.lab.thr.verdictCeiling",{t:aa(a.t_ms),counts:a.motion_count})}:e&&a.t_ms>=e.t_ms?{state:"late",icon:"\u26A0",text:p("diagnostics.lab.thr.verdictLate",{name:kt(t.first==="trailing"?"trailing":t.first,t.direction),t:aa(a.t_ms)})}:{state:"ok",text:p("diagnostics.lab.thr.verdictFirst",{name:kt(t.first,t.direction),t:aa(a.t_ms),ma:ea(a.current_ma)})}}function td(t,e){let a=e.series,n=a[0].t_ms,r=a[a.length-1].t_ms,o=d=>fe.l+(d-n)/Math.max(1,r-n)*ot,i=Math.max(...a.map(d=>d.current_ma)),l=Hs(e),u=Math.max(i,...l.filter(d=>d.ma<=i+12).map(d=>d.ma))+4,f=u>40?20:10,w=Math.ceil(u/f)*f,c=0,b=Mo-fe.t-fe.b,x=Ws(c,w,fe.t,b),k=l.filter(d=>d.ma<=w),L=l.filter(d=>d.ma>w),_=I("svg",{viewBox:`0 0 ${Ao} ${Mo}`,role:"img"});_.setAttribute("aria-label",p("diagnostics.lab.thr.chartAria",{dir:p("diagnostics.lab.dir."+e.direction)}));for(let d=c;d<=w;d+=f){let m=x(d);_.appendChild(I("line",{class:"chart-grid",x1:fe.l,x2:fe.l+ot,y1:m,y2:m})),_.appendChild(I("text",{class:"chart-tick",x:6,y:m+4},d.toFixed(0)))}_.appendChild(I("text",{class:"chart-axis-label",x:6,y:fe.t-8},"mA")),Zs(_,n,r,o,Mo);let S=[];if(e.trips.ceiling&&S.push({id:"ceiling",t:e.trips.ceiling.t_ms,color:Us,dash:"3 3"}),e.direction==="close"){let d=e.trips.wall?e.trips.wall.t_ms:Jt.ms;d<=r&&S.push({id:"wall",t:d,color:Fo,dash:"0"})}S.forEach((d,m)=>{let h=o(d.t);_.appendChild(I("line",{x1:h,x2:h,y1:fe.t,y2:fe.t+b,stroke:d.color,"stroke-width":1.4,"stroke-dasharray":d.dash,"vector-effect":"non-scaling-stroke"})),_.appendChild(I("text",{class:"lt-vlabel",x:h+4,y:fe.t+10+m*12,fill:d.color},kt(d.id,e.direction)))});let v=[];if(k.forEach(d=>{let m=Ks[d.id];if(d.id==="baseline"||d.id==="threshold"){let h=d.id==="baseline"?"baseline_ma":"threshold_ma";_.appendChild(I("path",{d:Lo(a.map(z=>z[h]==null?null:{x:o(z.t_ms),y:x(z[h])})),fill:"none",stroke:m.stroke,"stroke-width":m.width,"stroke-dasharray":m.dash,"vector-effect":"non-scaling-stroke"}))}else{let h=x(d.ma);_.appendChild(I("line",{x1:fe.l,x2:fe.l+ot,y1:h,y2:h,stroke:m.stroke,"stroke-width":m.width,"stroke-dasharray":m.dash,"vector-effect":"non-scaling-stroke"}))}v.push({id:d.id,y:x(d.ma),text:kt(d.id,e.direction)+"  "+ea(d.ma),st:m})}),_.appendChild(I("path",{d:Lo(a.map(d=>({x:o(d.t_ms),y:x(d.current_ma)}))),fill:"none",stroke:ta,"stroke-width":2,"stroke-linejoin":"round","vector-effect":"non-scaling-stroke"})),Jc(v,13,fe.t+4,fe.t+b).forEach(d=>{let m=fe.l+ot+8;_.appendChild(I("line",{x1:m,x2:m+14,y1:d.y,y2:d.y,stroke:d.st.stroke,"stroke-width":2,"stroke-dasharray":d.st.dash==="0"?"0":"4 2"})),_.appendChild(I("text",{class:"lt-label",x:m+19,y:d.y+4},d.text))}),Gs(e.direction).filter(d=>d!=="ceiling"&&d!=="wall").forEach(d=>{let m=e.trips[d];if(!m)return;let h=o(m.t_ms),z=x(Math.min(m.current_ma,w)),W=d===e.first?6:4;_.appendChild(I("path",{d:`M ${h} ${z-W} L ${h+W} ${z} L ${h} ${z+W} L ${h-W} ${z} Z`,fill:d==="trailing"||d==="threshold"?lt:"var(--text-strong)",stroke:"var(--bg)","stroke-width":2}))}),t.appendChild(_),L.length){let d=document.createElement("p");d.className="lt-offscale",d.textContent=p("diagnostics.lab.thr.offScale",{list:L.map(m=>kt(m.id,e.direction)+" "+ea(m.ma)).join(" \xB7 ")}),t.appendChild(d)}it(_,t,{count:a.length,plotTop:fe.t,plotBottom:fe.t+b,xAt:d=>o(a[d].t_ms),label:d=>aa(a[d].t_ms)+" \xB7 "+Math.round(a[d].motion_count)+" counts",dots:d=>[{y:x(a[d].current_ma),color:ta}],rows:d=>{let m=a[d],h=[{color:ta,label:p("diagnostics.lab.currentMa"),value:ea(m.current_ma)}];return m.baseline_ma!=null&&h.push({color:Vs,label:kt("baseline",e.direction),value:ea(m.baseline_ma)}),m.threshold_ma!=null&&h.push({color:lt,label:kt("threshold",e.direction),value:ea(m.threshold_ma)}),m.rise_ma!=null&&h.push({color:lt,label:p("diagnostics.lab.thr.rise"),value:m.rise_ma.toFixed(2)+" mA"}),h}})}function ad(t,e){let a=e.series.filter(d=>d.rise_ma!=null);if(!a.length)return;let n=e.series,r=n[0].t_ms,o=n[n.length-1].t_ms,i=d=>fe.l+(d-r)/Math.max(1,o-r)*ot,l=e.params,u=a.map(d=>d.rise_ma),f=Math.ceil(Math.max(l.trailingStepMa+1.5,...u)+.5),w=Math.max(-4,Math.floor(Math.min(-1,...u))),c=d=>Math.max(w,Math.min(f,d)),b=Co-14-fe.b,x=Ws(w,f,14,b),k=document.createElement("div");k.className="chart-head",k.innerHTML='<span class="chart-title">'+p("diagnostics.lab.thr.riseTitle",{window:(l.trailingWindowMs/1e3).toFixed(1)})+"</span>",t.appendChild(k);let L=I("svg",{viewBox:`0 0 ${Ao} ${Co}`,role:"img"});L.setAttribute("aria-label",p("diagnostics.lab.thr.riseAria")),Zs(L,r,o,i,Co),[w,0,f].forEach(d=>{let m=x(d);L.appendChild(I("line",{class:"chart-grid",x1:fe.l,x2:fe.l+ot,y1:m,y2:m})),L.appendChild(I("text",{class:"chart-tick",x:6,y:m+4},d.toFixed(0)))});let _=null,S=d=>{_!=null&&(L.appendChild(I("rect",{x:i(_),y:14,width:Math.max(1.5,i(d)-i(_)),height:b,fill:lt,opacity:d-_>=l.trailingSustainMs?.28:.12})),_=null)};a.forEach((d,m)=>{d.qualifying&&_==null&&(_=d.t_ms),(!d.qualifying||m===a.length-1)&&S(d.t_ms)});let v=x(l.trailingStepMa);if(L.appendChild(I("line",{x1:fe.l,x2:fe.l+ot,y1:v,y2:v,stroke:lt,"stroke-width":1.6,"stroke-dasharray":"6 4","vector-effect":"non-scaling-stroke"})),L.appendChild(I("text",{class:"lt-label",x:fe.l+ot+27,y:v+4},p("diagnostics.lab.thr.trailing")+"  "+l.trailingStepMa.toFixed(1)+" mA")),L.appendChild(I("line",{x1:fe.l+ot+8,x2:fe.l+ot+22,y1:v,y2:v,stroke:lt,"stroke-width":2,"stroke-dasharray":"4 2"})),L.appendChild(I("path",{d:Lo(a.map(d=>({x:i(d.t_ms),y:x(c(d.rise_ma))}))),fill:"none",stroke:ta,"stroke-width":1.8,"vector-effect":"non-scaling-stroke"})),e.trips.wall){let d=i(e.trips.wall.t_ms);L.appendChild(I("line",{x1:d,x2:d,y1:14,y2:14+b,stroke:Fo,"stroke-width":1.4,"vector-effect":"non-scaling-stroke"}))}t.appendChild(L),it(L,t,{count:a.length,plotTop:14,plotBottom:14+b,xAt:d=>i(a[d].t_ms),label:d=>aa(a[d].t_ms),dots:d=>[{y:x(c(a[d].rise_ma)),color:ta}],rows:d=>[{color:ta,label:p("diagnostics.lab.thr.rise"),value:a[d].rise_ma.toFixed(2)+" mA"},{color:lt,label:p("diagnostics.lab.thr.trailing"),value:l.trailingStepMa.toFixed(1)+" mA"}]})}function nd(t,e){let a=document.createElement("table"),n=e.trips.wall,r=["path","threshold","fires","counts"].map(i=>"<th>"+p("diagnostics.lab.thr.col."+i)+"</th>").join(""),o=Gs(e.direction).map(i=>{let l=e.trips[i],u=!!(l&&n&&i!=="wall"&&i!=="ceiling"&&l.t_ms>=n.t_ms),f=Ks[i],w=i==="trailing"?lt:i==="ceiling"?Us:i==="wall"?Fo:f?f.stroke:Qt,c=l?aa(l.t_ms)+(u?" \xB7 \u26A0 "+p("diagnostics.lab.thr.afterWall"):""):p("diagnostics.lab.thr.notReached");return'<tr data-first="'+(i===e.first)+'"><td><span class="lt-swatch" style="color:'+w+'"></span>'+kt(i,e.direction)+"</td><td>"+Qc(i,e)+'</td><td data-late="'+u+'">'+c+"</td><td>"+(l?l.motion_count:"\u2014")+"</td></tr>"}).join("");a.innerHTML="<thead><tr>"+r+"</tr></thead><tbody>"+o+"</tbody>",t.appendChild(a)}function od(t,e,a,n,r){let o=Is(n,e,r),i=document.createElement("div");i.className="chart-card";let l=document.createElement("div");if(l.className="chart-head",l.innerHTML='<span class="chart-title">'+p("diagnostics.lab.thr.title",{dir:p("diagnostics.lab.dir."+e)})+'</span><span class="chart-sub">'+p("diagnostics.lab.thr.source."+a)+"</span>",i.appendChild(l),o.series.length<2){t.appendChild(i);return}let u=ed(o),f=document.createElement("div");f.className="lt-verdict",f.dataset.state=u.state,f.innerHTML=(u.icon?'<span class="lt-icon" aria-hidden="true">'+u.icon+"</span>":"")+"<span>"+u.text+"</span>",i.appendChild(f),td(i,o),e==="close"&&ad(i,o),nd(i,o),t.appendChild(i)}function Xs(t,e){let a=e&&e.params||{},n=e&&e.captures||{};t.innerHTML="";let r=document.createElement("div");r.className="lab-thresholds";let o=document.createElement("p");o.className="lt-intro",o.textContent=p("diagnostics.lab.thr.intro"),r.appendChild(o),[["close",qs],["open",Bs]].forEach(([i,l])=>{let u=n[i],f=u&&u.length>1?u:js(l);od(r,i,u&&u.length>1?"capture":"reference",f,a)}),t.appendChild(r)}var Qs=400,sd=500;var id=2e3,za=["setup","arm","seat","open","close","review"],Ro=["none","open_circuit","blocked","timeout","overcurrent","thermal","stall","unknown","mechanical_overrun"],ld=8,cd=["continue","endpoint","jam","overcurrent","disconnected","tacho_fault","blocked_or_unknown","stopped_unconfirmed"],ei=["","close_seat","open_stop","close_popoff","stall_cap","circuit_fault"];function dd(t){let e=Number(t)||0;return cd[e]||String(e)}function pd(t){let e=[],a=ti(t.faultCode);return a&&e.push("fault "+a),t.lastFastTrip&&e.push("fast trip "+(ei[t.lastFastTrip]||t.lastFastTrip)),e.push("decision "+dd(t.endpointDecision)),e.join(" \xB7 ")}function ti(t){let e=Number(t)||0;return e?Ro[e]?`${Ro[e]} (${e})`:String(e):null}var Po=[{group:"close",cls:"close-factor",key:"close_threshold_multiplier",id:s.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x",step:"0.05"},{group:"close",cls:"close-trailing-step-ma",key:"close_trailing_step_ma",id:s.closeTrailingStepMa,labelKey:"settings.motor.closeTrailingStepMa",unit:"mA",step:"0.1"},{group:"close",cls:"close-trailing-sustain-ms",key:"close_trailing_sustain_ms",id:s.closeTrailingSustainMs,labelKey:"settings.motor.closeTrailingSustainMs",unit:"ms",step:"50"},{group:"close",cls:"close-trailing-ref-ms",key:"close_trailing_ref_ms",id:s.closeTrailingRefMs,labelKey:"settings.motor.closeTrailingRefMs",unit:"ms",step:"100"},{group:"open",cls:"open-endstop-current-factor",key:"open_endstop_current_factor",id:s.openEndstopCurrentFactor,labelKey:"settings.motor.openEndstopCurrentFactor",unit:"x",step:"0.05"},{group:"open",cls:"open-endstop-stall-fraction",key:"open_endstop_stall_fraction",id:s.openEndstopStallFraction,labelKey:"settings.motor.openEndstopStallFraction",unit:"k",step:"0.05"},{group:"open",cls:"open-ripple",key:"open_ripple_limit_factor",id:s.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x",step:"0.05"},{group:"caps",cls:"cap-close-seat-ma",key:"cap_close_seat_ma",id:s.capCloseSeatMa,labelKey:"settings.motor.capCloseSeatMa",unit:"mA",step:"0.5"},{group:"caps",cls:"cap-close-seat-frames",key:"cap_close_seat_frames",id:s.capCloseSeatFrames,labelKey:"settings.motor.capCloseSeatFrames",unit:"frames",step:"1"},{group:"caps",cls:"cap-close-popoff-ma",key:"cap_close_popoff_ma",id:s.capClosePopoffMa,labelKey:"settings.motor.capClosePopoffMa",unit:"mA",step:"0.5"},{group:"caps",cls:"cap-open-stop-ma",key:"cap_open_stop_ma",id:s.capOpenStopMa,labelKey:"settings.motor.capOpenStopMa",unit:"mA",step:"0.5"},{group:"caps",cls:"cap-stall-ma",key:"cap_stall_ma",id:s.capStallMa,labelKey:"settings.motor.capStallMa",unit:"mA",step:"1"},{group:"caps",cls:"cap-circuit-fault-ma",key:"cap_circuit_fault_ma",id:s.capCircuitFaultMa,labelKey:"settings.motor.capCircuitFaultMa",unit:"mA",step:"1"},{group:"ceiling",cls:"close-ceiling-s",key:"hmip_runtime_limit_seconds",id:s.hmipRuntimeLimitSeconds,labelKey:"settings.motor.closeCeilingS",unit:"s, max 40",step:"1"},{group:"ceiling",cls:"close-ceiling-counts",key:"close_runtime_limit_counts",id:s.closeRuntimeLimitCounts,labelKey:"settings.motor.closeCeilingCounts",unit:"counts, max 3000",step:"50"},{group:"learn",cls:"working-range-learning",key:"working_range_learning",id:s.workingRangeLearning,labelKey:"settings.motor.workingRangeLearning",unit:"0/1",step:"1"},{group:"learn",cls:"learn-open-start-ripples",key:"learn_open_start_ripples",id:s.learnOpenStartRipples,labelKey:"settings.motor.learnOpenStartRipples",unit:"counts",step:"25"},{group:"learn",cls:"learn-open-step-ripples",key:"learn_open_step_ripples",id:s.learnOpenStepRipples,labelKey:"settings.motor.learnOpenStepRipples",unit:"counts",step:"25"},{group:"learn",cls:"learn-open-max-ripples",key:"learn_open_max_ripples",id:s.learnOpenMaxRipples,labelKey:"settings.motor.learnOpenMaxRipples",unit:"counts",step:"25"},{group:"learn",cls:"learn-min-free-ripples",key:"learn_min_free_ripples",id:s.learnMinFreeRipples,labelKey:"settings.motor.learnMinFreeRipples",unit:"counts",step:"10"},{group:"learn",cls:"learn-samples",key:"learn_samples",id:s.learnSamples,labelKey:"settings.motor.learnSamples",unit:"count",step:"1"},{group:"learn",cls:"learn-max-spread-pct",key:"learn_max_spread_pct",id:s.learnMaxSpreadPct,labelKey:"settings.motor.learnMaxSpreadPct",unit:"%",step:"1"},{group:"learn",cls:"pin-engage-step-ma",key:"pin_engage_step_ma",id:s.pinEngageStepMa,labelKey:"settings.motor.pinEngageStepMa",unit:"mA",step:"0.1"},{group:"learn",cls:"pin-engage-margin-ripples",key:"pin_engage_margin_ripples",id:s.pinEngageMarginRipples,labelKey:"settings.motor.pinEngageMarginRipples",unit:"counts",step:"5"}],ud=["close","open","caps","ceiling","learn"],md=`
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
.diag-motor-lab .lab-manual-hint {
  color: var(--text-muted); font-size: .78rem; text-align: right;
}
.diag-motor-lab .lab-manual-row {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 12px 18px; flex-wrap: wrap;
  padding: 14px 16px;
}
.diag-motor-lab .lab-manual-duration { display: flex; flex-direction: column; gap: 6px; }
.diag-motor-lab .lab-manual-input {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--text-muted); font-size: .84rem; font-weight: 650;
}
.diag-motor-lab .lab-manual-seconds {
  width: 6.5rem; height: var(--control-height, 44px); min-height: var(--control-height, 44px);
  padding: 0 10px; border: 1px solid var(--control-border); border-radius: 8px;
  background: var(--control-bg); color: var(--text-strong); font-variant-numeric: tabular-nums;
}
.diag-motor-lab .lab-manual .lab-actions .ui-btn { min-width: 112px; }
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
`;O("diag-motor-lab",md);var gd=()=>`
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
    <section class="lab-board lab-manual" aria-labelledby="lab-manual-title">
      <div class="lab-phase-row">
        <small id="lab-manual-title" data-i18n="diagnostics.lab.manual.title">Manual control</small>
        <span class="lab-manual-hint" data-i18n="diagnostics.lab.manual.hint">Timed move with endstop detection armed.</span>
      </div>
      <div class="lab-manual-row">
        <label class="lab-manual-duration">
          <span class="lab-label" data-i18n="diagnostics.lab.manual.duration">Run time</span>
          <span class="lab-manual-input">
            <input type="number" class="lab-manual-seconds" min="0.1" max="45" step="0.5" value="10" inputmode="decimal" />
            <span>s</span>
          </span>
        </label>
        <div class="lab-actions">
          <button type="button" class="ui-btn lab-manual-btn" data-manual="open" data-i18n="diagnostics.lab.manual.open">Open</button>
          <button type="button" class="ui-btn lab-manual-btn" data-manual="close" data-i18n="diagnostics.lab.manual.close">Close</button>
          <button type="button" class="ui-btn lab-manual-btn" data-manual="stop" data-i18n="diagnostics.lab.manual.stop">Stop</button>
          <button type="button" class="ui-btn lab-manual-btn" data-manual="reset" data-i18n="diagnostics.lab.manual.resetFault">Clear fault</button>
        </div>
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
        ${ud.map(t=>`
          <div class="lab-tune-group" data-i18n="diagnostics.lab.tune.${t}">${t}</div>
          ${Po.filter(e=>e.group===t).map(e=>`
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
`;function Do(t){return t==="rev32_gpio"||t==="rev33_gpio"}function ai(t,e,a){return t==="open"?{factor:F(Do(a)?s.openEndstopCurrentFactor:s.openThresholdMultiplier),slope:F(s.openSlopeThreshold),floor:F(s.openSlopeCurrentFactor),ripple:F(s.openRippleLimitFactor),caps:e}:{factor:F(s.closeThresholdMultiplier),slope:F(s.closeSlopeThreshold),floor:F(s.closeSlopeCurrentFactor),caps:e}}function Ma(t,e){let a=ai(t.direction,void 0,e),n=t.direction==="open",r=Do(e)?"open_endstop_current_factor":"open_threshold_multiplier",o=Do(e)?"settings.motor.openEndstopCurrentFactor":"settings.motor.openThreshold",i=Number(a.factor),l=!n&&Number.isFinite(i)?Math.min(t.suggested_factor,i):t.suggested_factor,u=[{key:n?r:"close_threshold_multiplier",labelKey:n?o:"settings.motor.closeThreshold",current:a.factor,suggested:l,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&u.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:a.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),u}function To(t){return p(t?"common.on":"common.off")}function Eo(t){return t===1?"HIGH":t===0?"LOW":"\u2014"}function Ca(t){return t==="rev32_gpio"||t==="rev31_gpio"}function No(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",latchFaulted:!1,driversEnabled:null,latchArmLevel:null,latchStateLevel:null,motorEnableLevel:null,invalidSamples:0,tachoRejected:0,railOvercurrentLevel:null,faultUsbLevel:null,caps:null,baselineMa:null,baselineSettled:!1,countsSpurious:!1,lastFastTrip:0,endpointDecision:0,ceilingMs:0,ceilingCounts:0,ceilingSource:0,requiresCalibration:!1,positionConfident:!1,learnedStallMa:null}}var Gg=H({tag:"diag-motor-lab",render:gd,onMount(t,e){let a=Number(R("selectedZone")||1),n="setup",r="idle",o={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1},i={open:null,close:null,seat:null},l={samples:[],analysis:null,live:!1},u=[],f={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},w=[],c=No(),b=!1,x=e.querySelector(".lab-step-chip"),k=e.querySelector(".lab-zone-chip"),L=e.querySelector(".lab-banner"),_=e.querySelector(".lab-guide"),S=e.querySelector(".lab-kicker"),v=e.querySelector(".lab-stage h3"),d=e.querySelector(".lab-stage p"),m=e.querySelector(".lab-setup"),h=e.querySelector(".lab-zone"),z=e.querySelector(".lab-phase-label"),T=e.querySelector(".lab-log"),W=e.querySelector(".lab-chart"),D=e.querySelector(".lab-download"),j=e.querySelector(".lab-capture-meta"),J=e.querySelector(".lab-metrics"),ae=e.querySelector(".lab-suggest"),B=e.querySelector(".lab-primary"),V=e.querySelector(".lab-secondary"),ie=e.querySelector(".lab-estop"),Z=e.querySelector(".lab-manual-seconds"),Ue=Array.from(e.querySelectorAll(".lab-manual-btn")),_t=Array.from(e.querySelectorAll(".lab-tune-input")),wn=e.querySelector(".lab-thr-host"),Ta=e.querySelector(".lab-kv-body"),te={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),pad10:e.querySelector('[data-k="pad10"]'),pad9:e.querySelector('[data-k="pad9"]'),pad11:e.querySelector('[data-k="pad11"]'),railOc:e.querySelector('[data-k="railOc"]'),usbFault:e.querySelector('[data-k="usbFault"]'),baseline:e.querySelector('[data-k="baseline"]'),ceiling:e.querySelector('[data-k="ceiling"]'),openTrip:e.querySelector('[data-k="openTrip"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function St(C){u=C&&C.length?C:[];let E=u.length;if(D.hidden=E<2,j.hidden=E<2,E<2)return;let U=Number(u[0].t_ms)||0,Y=Number(u[E-1].t_ms)||0,G=Math.max(0,(Y-U)/1e3);j.textContent=p("diagnostics.lab.captureMeta",{n:E,hz:2,seconds:G.toFixed(1)})}function ra(C){let E=Math.max(0,Math.min(100,Number(C)||0))/100;return E<.3?.3*Math.pow(Math.max(E/.3,0),1.5):Math.pow(E,1.5)}function P(){if(!Ta)return;let C=[10,20,30,40,50,60,70,80,90,100],E="";for(let U=0;U<C.length;U+=3){let Y=[];for(let G=0;G<3;G++){let se=C[U+G];if(se==null){Y.push("<td></td><td></td>");continue}Y.push(`<td>${se}</td><td>${ra(se).toFixed(3)}</td>`)}E+=`<tr>${Y.join("")}</tr>`}Ta.innerHTML=E}P();function q(C){return za.indexOf(C)}function le(){return _e(a)}function re(){let C=String(a);h.innerHTML=Array.from({length:6},(E,U)=>'<option value="'+(U+1)+'">'+_e(U+1).replace(/</g,"&lt;")+"</option>").join(""),h.value=C,h.setAttribute("aria-label",p("diagnostics.lab.motor")),k.textContent=le(),k.setAttribute("aria-label",p("diagnostics.lab.motor"))}function $(C,E){let U=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});w.push(U+"  "+p(C,E)),w.length>8&&w.shift(),T.innerHTML=w.map(Y=>"<div>"+Y+"</div>").join(""),T.scrollTop=T.scrollHeight}function we(C){L.textContent=C||"",L.classList.toggle("show",!!C)}function ge(C,E){r=C,z.dataset.kind=E||"",z.textContent=p("diagnostics.lab.phase."+C)}let Se={close_threshold_multiplier:"closeFactor",open_endstop_current_factor:"openFactor",open_endstop_stall_fraction:"stallFraction",close_trailing_step_ma:"trailingStepMa",close_trailing_sustain_ms:"trailingSustainMs",close_trailing_ref_ms:"trailingWindowMs",cap_close_seat_ma:"seatMa",cap_close_seat_frames:"seatFrames",cap_close_popoff_ma:"popoffMa",cap_stall_ma:"stallMa",cap_open_stop_ma:"openStopMa",cap_circuit_fault_ma:"circuitMa",hmip_runtime_limit_seconds:"closeCeilingS",close_runtime_limit_counts:"closeCeilingCounts"};function mt(){let C={};for(let E of _t){let U=Se[E.dataset.tuneKey];if(!U)continue;let Y=E.value===""?NaN:Number(E.value),G=Number(F(E.dataset.tuneId)),se=Number.isFinite(Y)?Y:G;Number.isFinite(se)&&(C[U]=se)}return Number.isFinite(c.learnedStallMa)&&c.learnedStallMa>0&&(C.learnedStallMa=c.learnedStallMa),C}let rt=0;function Ze(){clearTimeout(rt),rt=setTimeout(()=>{let C=i.close||i.seat;Xs(wn,{params:mt(),captures:{close:C&&C.samples,open:i.open&&i.open.samples}})},120)}function tt(){for(let C of _t){let E=F(C.dataset.tuneId);E==null||Number.isNaN(Number(E))||document.activeElement!==C&&(C.value=String(Number(E)))}Ze()}function zt(){for(let C of _t){let E=()=>{var Y;let U=Number(C.value);if(!Number.isFinite(U)){tt();return}Me(C.dataset.tuneKey,U),$("diagnostics.lab.log.tune",{key:p(((Y=Po.find(G=>G.key===C.dataset.tuneKey))==null?void 0:Y.labelKey)||C.dataset.tuneKey),value:U}),l.analysis&&ve()};C.addEventListener("change",E),C.addEventListener("input",Ze),C.addEventListener("keydown",U=>{U.key==="Enter"&&(U.preventDefault(),C.blur(),E())})}}function at(){let C=A(s.motorProfileDefault)||"HmIP VdMot",E;if(C==="HmIP VdMot"){let U=Number(c.ceilingMs);if(Number.isFinite(U)&&U>0)return Math.min(6e4,Math.round(U));E=Number(F(s.hmipRuntimeLimitSeconds)),(!Number.isFinite(E)||E<=0)&&(E=38),E=Math.min(40,E)}else E=Number(F(s.genericRuntimeLimitSeconds)),(!Number.isFinite(E)||E<=0)&&(E=45);return Math.min(6e4,Math.round(E*1e3))}async function Ot(){if(!o.active||o.aborted||o.pullInFlight)return;let C=Date.now();if(!(C-(o.pullAt||0)<5e3)){o.pullAt=C,o.pullInFlight=!0;try{let E=await $n(),U=vo(E);U.length&&(o.hiRes=yo(o.hiRes||[],U),St(o.hiRes))}catch(E){}finally{o.pullInFlight=!1}}}function qe(){let C=ya(c.stroke);te.current.textContent=c.current==null?"\u2014":c.current.toFixed(1)+" mA",te.mean.textContent=c.mean==null?"\u2014":c.mean.toFixed(1)+" mA",te.peak.textContent=c.peak==null?"\u2014":c.peak.toFixed(1)+" mA",te.slope.textContent=c.slope==null?"\u2014":c.slope.toFixed(1)+" mA/s",te.runtime.textContent=c.runtime?(c.runtime/1e3).toFixed(1)+" s":"\u2014",te.motion.textContent=c.motion?String(c.motion):"\u2014",te.cadence.textContent=c.cadenceHz==null?"\u2014":c.cadenceHz.toFixed(1)+" /s",te.direction.textContent=c.direction,te.drivers.textContent=To(c.driversEnabled!=null?c.driversEnabled:me(s.drivers)),te.busy.textContent=To(c.busy),te.armed.textContent=To(c.armed);let E=Ca(c.backend),U=te.pad10&&te.pad10.parentElement.querySelector("span"),Y=te.pad9&&te.pad9.parentElement.querySelector("span");U&&(U.textContent=p(E?"diagnostics.lab.pad10":"diagnostics.lab.pad10nsleep")),Y&&(Y.textContent=p(E?"diagnostics.lab.pad9":"diagnostics.lab.pad9fault")),te.pad10&&(te.pad10.textContent=Eo(c.latchArmLevel)),te.pad9&&(te.pad9.textContent=Eo(c.latchStateLevel)),te.pad11&&(te.pad11.textContent=Eo(c.motorEnableLevel)),te.backend.textContent=c.backend||"\u2014";let G=()=>{let ce=ti(c.faultCode);if(ce){if(c.faultCode===ld&&c.ceilingCounts>0){let ue=c.motion>=c.ceilingCounts;return`${ce} \xB7 ${ue?"count ceiling":"time ceiling"}`}return ce}return c.endpointDecision===7?"stopped, unconfirmed":c.lastFastTrip?`stopped \xB7 ${ei[c.lastFastTrip]||c.lastFastTrip}`:p("common.ok")};te.fault.textContent=c.latchFaulted?p("diagnostics.lab.faultLatch"):G();let se=ce=>ce==null||ce<0?"\u2014":ce===0?"ASSERTED":"ok";te.railOc&&(te.railOc.textContent=se(c.railOvercurrentLevel)),te.usbFault&&(te.usbFault.textContent=se(c.faultUsbLevel)),te.baseline&&(te.baseline.textContent=c.baselineMa==null?"\u2014":`${c.baselineMa.toFixed(1)} mA${c.baselineSettled?"":" (settling)"}`),te.ceiling&&(te.ceiling.textContent=c.ceilingMs?`${(c.ceilingMs/1e3).toFixed(1)} s / ${c.ceilingCounts||"\u2014"} cnt`:"\u2014"),te.openTrip&&(te.openTrip.textContent=c.learnedStallMa?`${c.learnedStallMa.toFixed(1)} mA stall`:"ratio fallback"),te.invalid.textContent=String(c.invalidSamples||0),te.tachoRejected.textContent=String(c.tachoRejected||0),te.stroke.textContent=p("diagnostics.lab.stroke."+C),te.stroke.dataset.phase=C,c.pinSeen?(te.pin.textContent=p("diagnostics.lab.pinSeen",{count:c.pinAt}),te.pin.dataset.seen="true"):(te.pin.textContent=p("diagnostics.lab.pinWaiting"),te.pin.dataset.seen="false")}function ve(){let C=l.analysis?Ts(l.analysis,ai(l.analysis.direction,c.caps,c.backend)):[],E=Ds(W,{samples:l.samples,analysis:l.analysis,live:l.live,overlays:C,visible:f});E&&E.addEventListener("click",U=>{let Y=U.target.closest(".gw-toggle");if(!Y)return;let G=Y.dataset.layer;f[G]=!f[G],Object.keys(f).some(ce=>f[ce])||(f[G]=!0),ve()})}function Be(C,E,U){l={analysis:C&&C.ok?C:null,samples:E||[],live:!!U},St(l.samples),l.analysis&&(c.mean=l.analysis.mean_ma,c.peak=l.analysis.peak_ma,c.slope=l.analysis.max_stall_slope_ma_s),ve(),Ze();let Y=[];if(n==="review"?(i.open&&Y.push(...Ma(i.open,c.backend)),i.close&&Y.push(...Ma(i.close,c.backend))):l.analysis&&Y.push(...Ma(l.analysis,c.backend)),!l.analysis&&n!=="review"){J.innerHTML="",ae.hidden=!0;return}let G=n==="review"?i.close||i.open:l.analysis;if(!G){J.innerHTML="",ae.hidden=!0;return}let se=G.pin_seen?p("diagnostics.lab.pinMetric",{ms:G.pin_t_ms,count:G.pin_motion_count}):p("diagnostics.lab.pinWaiting"),ce=[[p("diagnostics.lab.mean"),G.mean_ma.toFixed(1)+" mA"],[p("diagnostics.lab.peak"),G.peak_ma.toFixed(1)+" mA"],[p("diagnostics.lab.runtime"),(G.runtime_ms/1e3).toFixed(1)+" s"],[p("diagnostics.lab.ripples"),String(G.ripples)],[p("diagnostics.lab.pin"),se]];if(n==="review"&&i.open&&i.close){ce[0]=[p("diagnostics.lab.mean"),i.open.mean_ma.toFixed(1)+" / "+i.close.mean_ma.toFixed(1)+" mA"],ce[1]=[p("diagnostics.lab.peak"),i.open.peak_ma.toFixed(1)+" / "+i.close.peak_ma.toFixed(1)+" mA"];let ue=i.close.pin_seen?p("diagnostics.lab.pinMetric",{ms:i.close.pin_t_ms,count:i.close.pin_motion_count}):p("diagnostics.lab.pinWaiting");ce[4]=[p("diagnostics.lab.pin"),ue]}J.innerHTML=ce.map(ue=>'<div class="lab-metric"><span>'+ue[0]+"</span><strong>"+ue[1]+"</strong></div>").join(""),ae.querySelector("tbody").innerHTML=Y.map(ue=>"<tr><td>"+p(ue.labelKey)+"</td><td>"+Number(ue.current).toFixed(1)+" "+ue.unit+'</td><td class="better">'+Number(ue.suggested).toFixed(1)+" "+ue.unit+"</td></tr>").join(""),ae.hidden=!Y.length}function ke(){let C=n==="halted",E=C?"setup":n,U=q(E),Y=C?"halted":"active";x.dataset.state=Y,x.textContent=C?p("diagnostics.lab.halted"):p("diagnostics.lab.stepChip",{step:U+1,total:za.length,name:p("diagnostics.lab.steps."+E)}),S.textContent=C?p("diagnostics.lab.halted"):p("diagnostics.lab.stepOf",{step:U+1,total:za.length});let G=!C&&E==="arm"&&!Ca(c.backend)?"enable":C?"halt":E;v.textContent=p("diagnostics.lab."+G+".title");let se=n==="seat"&&i.seat||n==="open"&&i.open||n==="close"&&i.close,ce=C?"diagnostics.lab.halt.copy":se?"diagnostics.lab."+E+".done":"diagnostics.lab."+G+".copy";d.textContent=p(ce);let ue=n==="setup";_.dataset.setup=ue?"true":"false",m.hidden=!ue,h.disabled=!ue||o.active,k.hidden=ue,k.textContent=le(),ie.dataset.armed=o.active?"true":"false";for(let je of Ue)je.disabled=o.active&&je.dataset.manual!=="stop";Z&&(Z.disabled=o.active),qe();let Oe=o.active,Ae={key:"diagnostics.lab.next",disabled:Oe,action:"next"},he=null;n==="setup"?Ae={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:n==="arm"?Ae={key:Ca(c.backend)?"diagnostics.lab.arm.action":"diagnostics.lab.enable.action",disabled:Oe,action:"arm"}:n==="seat"?Ae={key:i.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:Oe,action:i.seat?"next":"seat"}:n==="open"?Ae={key:i.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:Oe,action:i.open?"next":"open"}:n==="close"?Ae={key:i.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:Oe,action:i.close?"next":"close"}:n==="review"?(Ae={key:"diagnostics.lab.apply",disabled:!(i.open||i.close),action:"apply"},he={key:"diagnostics.lab.restart",action:"restart"}):C&&(Ae={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),Oe&&(Ae={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!Oe&&(n==="seat"||n==="open"||n==="close")&&!i[n==="seat"?"seat":n]&&r==="failed"&&(Ae={key:"diagnostics.lab.retry",disabled:!1,action:n}),!Oe&&se&&(n==="seat"||n==="open"||n==="close")&&(he={key:"diagnostics.lab.restart",action:"restart"}),B.dataset.action=Ae.action,B.disabled=!!Ae.disabled,B.textContent=p(Ae.key),he?(V.hidden=!1,V.dataset.action=he.action,V.textContent=p(he.key)):(V.hidden=!0,V.dataset.action="")}function De(C){Ke("motorLabBusy",!!C)}function $t(){o.timer&&clearTimeout(o.timer),o.timer=null}function Ea(C){if(n=C,(C==="arm"||C==="setup")&&we(""),C==="review"){De(!1);let E=i.close||i.open;Be(E,E?E.samples:[],!1),ge("done","ok")}else C==="setup"&&(De(!1),Be(null,[],!1));ke()}async function fi(){if(!o.active){De(!0),o.active=!0,ge("arming","run"),ke(),$("diagnostics.lab.log.arming",{zone:a});try{if(R("manualMode")||(Ke("manualMode",!0),await jt(!0),$("diagnostics.lab.log.manual")),o.aborted)return;let C=await Bt(),E=C&&C.data&&C.data.motor_safety?C.data.motor_safety:{};if(c.backend=E.backend||c.backend,qe(),Ca(c.backend)){$("diagnostics.lab.log.armProbeWait");let G=await gr({hz:100,durationMs:4e3});if(o.aborted)return;let se=G&&G.data?G.data:{};if($("diagnostics.lab.log.armProbe",{hz:se.hz||100,cycles:se.cycles||0,armed:se.armed?p("common.on"):p("common.off"),at:se.armed_at_cycle||0}),c.armed=!!se.armed,c.latchFaulted=!se.armed,qe(),!se.armed)throw we(p("diagnostics.lab.latchBanner")),new Error("latch")}else $("diagnostics.lab.log.enableWait");await ca(!0),$("diagnostics.lab.log.drivers");let U=Date.now()+4e3,Y=!1;for(;Date.now()<U;){if(o.aborted)return;let G=await Bt(),se=G&&G.data?G.data:{},ce=se.motor_safety||{};if(c.driversEnabled=se.drivers_enabled!=null?!!se.drivers_enabled:c.driversEnabled,c.armed=!!ce.armed,c.latchFaulted=!!ce.latch_faulted,c.backend=ce.backend||c.backend,c.latchArmLevel=ce.latch_arm_level,c.latchStateLevel=ce.latch_state_level,c.motorEnableLevel=ce.motor_enable_level,qe(),se.drivers_enabled&&!ce.latch_faulted){Y=!0;break}await new Promise(ue=>setTimeout(ue,Qs))}if(!Y){let G=Ca(c.backend);throw we(p(G?"diagnostics.lab.latchBanner":"diagnostics.lab.enableBanner")),new Error(G?"latch":"enable")}ge("armed","ok"),$("diagnostics.lab.log.armed"),o.active=!1,Ea("seat")}catch(C){o.active=!1,De(!1),ge("failed","halt"),$(C&&C.message==="arm_gpio"?"diagnostics.lab.log.armGpio":C&&C.message==="latch"?"diagnostics.lab.log.latchFaulted":C&&C.message==="enable"?"diagnostics.lab.log.enableFailed":"diagnostics.lab.log.armFailed"),ke()}}}async function hi(C,E){let U=o.live.slice(),Y=[];for(let je=0;je<6;je++){if(o.aborted)return;try{ge("fetching","run"),ke();let ee=await $n();$("diagnostics.lab.log.trace"),Y=vo(ee);break}catch(ee){if(ee&&ee.code==="motor_busy"){await new Promise(Mt=>setTimeout(Mt,250));continue}$("diagnostics.lab.log.traceFailed");break}}Y.length&&(o.hiRes=yo(o.hiRes||[],Y));let G=o.hiRes||[],se=U.length&&Number(U[U.length-1].t_ms)||0,ce=Y.length&&Number(Y[Y.length-1].t_ms)||0,ue=G.length&&Number(G[G.length-1].t_ms)||0,Oe=G.length?G:U.length?U:Y,Ae=Y.length>=8&&ce>=Math.max(400,Math.max(se,ue)*.45)?Y:Oe;if(!Oe.length){ge("failed","halt"),$("diagnostics.lab.log.traceFailed"),Be(null,[],!1);return}let he=Fs(Ae,C);if(E&&(i[E]=he.ok?he:null),Be(he,Oe,!1),he.ok){if(ge("done","ok"),$("diagnostics.lab.log.captured",{direction:p("diagnostics.lab.dir."+he.direction),peak:he.peak_ma.toFixed(1)}),he.pin_seen){let je=c.pinSeen;c.pinSeen=!0,c.pinAt=he.pin_motion_count,c.pinMa=he.pin_current_ma,c.stroke=1,je||$("diagnostics.lab.log.pinTrace",{count:he.pin_motion_count,ma:he.pin_current_ma.toFixed(1),ms:he.pin_t_ms})}else(E==="close"||E==="seat")&&$("diagnostics.lab.log.pinMissing");(ue>ce+250||se>ce+250)&&$("diagnostics.lab.log.browserLog",{seconds:(Math.max(ue,se)/1e3).toFixed(1)})}else{if(ge("failed","halt"),he.reason==="no_endstop"){let je=Number(c.endpointDecision)===1;$(je?"diagnostics.lab.log.falseEndpoint":"diagnostics.lab.log.noEndstop",{direction:p("diagnostics.lab.dir."+C),seconds:((he.runtime_ms||0)/1e3).toFixed(0)})}else $(E==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak");E==="seat"&&(i.seat={short:!0},$("diagnostics.lab.log.seatContinue"))}}function vi(C){let E=C.map(Y=>Y.current_ma).filter(Number.isFinite);if(!E.length)return;let U=E.reduce((Y,G)=>Y+G,0);if(c.mean=Math.round(U/E.length*10)/10,c.peak=Math.round(Math.max(...E)*10)/10,C.length>=2){let Y=C[Math.max(0,C.length-3)],G=C[C.length-1],se=(G.t_ms-Y.t_ms)/1e3;se>.05&&(c.slope=Math.round((G.current_ma-Y.current_ma)/se*10)/10)}}function xi(){return pd(c)}function Na(){o.manual&&(n==="setup"||n==="halted")&&De(!1)}async function Ra(C,E,U){if(o.active)return;let Y=Number.isFinite(U)&&U>0;o={active:!0,aborted:!1,direction:C,manual:Y,timer:null,live:[],hiRes:[],started:Date.now(),pullAt:0,pullInFlight:!1,chartAt:0},De(!0),c=No(),b=!1,c.direction=p("diagnostics.lab.dir."+C),ge("starting","run"),ke(),Be(null,[],!0),St([]),Y?$("diagnostics.lab.log.manualMove",{direction:p("diagnostics.lab.dir."+C),zone:a,seconds:(U/1e3).toFixed(1)}):$("diagnostics.lab.log.starting",{direction:p("diagnostics.lab.dir."+C),zone:a});try{if(Y)R("manualMode")||(await jt(!0),$("diagnostics.lab.log.manual"));else try{await Ga(a),$("diagnostics.lab.log.resetLearned")}catch(he){$("diagnostics.lab.log.resetLearnedFailed")}if(o.aborted)return;let G=Y?U:at(),se=G+8e3;if(Y||$("diagnostics.lab.log.duration",{seconds:(G/1e3).toFixed(0)}),C==="open"?await Ka(a,G):await Wa(a,G),o.aborted)return;ge("waiting","run"),ke();let ce=!1,ue=!1,Oe=()=>{ue||o.aborted||!o.active||(o.timer=setTimeout(Ae,Qs))},Ae=async()=>{if(!(ue||o.aborted||!o.active)){try{let he=await Bt();if(ue||o.aborted||!o.active)return;let je=he&&he.data?he.data:{},ee=je.motor_safety||{},Mt=Number(ee.current_ma),sa=!!ee.motor_busy,Mi=ee.drive_on!=null?!!ee.drive_on:sa;sa&&!ce&&(ce=!0,ge("running","run"),$("diagnostics.lab.log.busy")),c.busy=sa,c.runtime=Date.now()-o.started,c.motion=Number(ee.motion_evidence_count)||c.motion,c.stroke=Number(ee.stroke_phase)||0,c.tachoPeriodUs=Number(ee.tacho_period_us)||c.tachoPeriodUs,c.tachoCadenceUs=Number(ee.tacho_cadence_us)||c.tachoCadenceUs;let Uo=c.tachoPeriodUs||c.tachoCadenceUs;c.cadenceHz=Uo>0?1e6/Uo:null,c.faultCode=Number(ee.fault_code)||0,c.armed=!!ee.armed,c.latchFaulted=!!ee.latch_faulted,c.latchArmLevel=ee.latch_arm_level,c.latchStateLevel=ee.latch_state_level,c.motorEnableLevel=ee.motor_enable_level,c.railOvercurrentLevel=ee.rail_overcurrent_level,c.faultUsbLevel=ee.fault_usb_level,c.driversEnabled=je.drivers_enabled!=null?!!je.drivers_enabled:c.driversEnabled,c.backend=ee.backend||c.backend,c.invalidSamples=Number(ee.invalid_samples)||0,c.tachoRejected=Number(ee.tacho_rejected)||0,ee.cap_seat_ma!=null&&(c.caps={seat:Number(ee.cap_seat_ma),popoff:Number(ee.cap_popoff_ma),open:Number(ee.cap_open_ma),stall:Number(ee.cap_stall_ma),circuit:Number(ee.cap_circuit_ma)}),ee.baseline_ma!=null&&(c.baselineMa=Number(ee.baseline_ma)),c.baselineSettled=!!ee.baseline_settled,c.countsSpurious=!!ee.counts_spurious,c.lastFastTrip=Number(ee.last_fast_trip)||0,c.endpointDecision=Number(ee.endpoint_decision)||0,c.ceilingMs=Number(ee.ceiling_ms)||0,c.ceilingCounts=Number(ee.ceiling_counts)||0,c.ceilingSource=Number(ee.ceiling_source)||0,c.requiresCalibration=!!ee.requires_calibration,c.positionConfident=!!ee.position_confident,ee.learned_stall_ma!=null&&(c.learnedStallMa=Number(ee.learned_stall_ma)),c.countsSpurious&&!b&&(b=!0,$("diagnostics.lab.log.spurious",{})),C==="close"&&!c.pinSeen&&(c.stroke===1||c.stroke===2)&&(c.pinSeen=!0,c.pinAt=c.motion,c.pinMa=Number.isFinite(Mt)?Mt:c.current,$("diagnostics.lab.log.pin",{count:c.pinAt,ma:Number(c.pinMa||0).toFixed(1)})),Number.isFinite(Mt)&&(c.current=Mt,o.live.push({t_ms:Date.now()-o.started,current_ma:Mt,motion_count:c.motion,drive_on:Mi,direction_open:C==="open",stroke_phase:c.stroke,tacho_period_us:c.tachoPeriodUs,tacho_cadence_us:c.tachoCadenceUs,armed:c.armed,fault_code:c.faultCode,backend:c.backend}),vi(o.live)),sa&&Ot(),qe();let kn=Date.now();if(kn-(o.chartAt||0)>=sd){o.chartAt=kn;let Pa=o.hiRes.length?o.hiRes:xo(o.live,2);Be(null,Pa,!0)}let Ko=kn-o.started;if(!ce&&Ko>id){if(ue=!0,$t(),o.active=!1,ge("failed","halt"),ee.latch_faulted)we(p("diagnostics.lab.latchBanner")),$("diagnostics.lab.log.latchFaulted");else if(Number(ee.fault_code)>0){let Pa=Number(ee.fault_code);$("diagnostics.lab.log.neverStartedFault",{fault:Ro[Pa]||String(Pa)})}else $("diagnostics.lab.log.neverStarted");Na(),ke();return}if(ce&&!sa||Ko>se){ue=!0,$t(),c.busy=!1,ce&&($("diagnostics.lab.log.stopped"),$("diagnostics.lab.log.stopReason",{reason:xi()})),o.active=!1,await hi(C,E),Na(),ke();return}}catch(he){if(Date.now()-o.started>se){ue=!0,$t(),o.active=!1,ge("failed","halt"),$("diagnostics.lab.log.traceFailed"),Na(),ke();return}}Oe()}};Ae()}catch(G){o.active=!1,ge("failed","halt"),$("diagnostics.lab.log.startFailed"),Na(),ke()}}function yi(){let C=Number(Z&&Z.value),E=Number.isFinite(C)?Math.max(.1,Math.min(45,C)):10;return Z&&(Z.value=String(E)),Math.round(E*1e3)}async function wi(){try{let C=await Bt(),E=C&&C.data&&C.data.motor_safety?C.data.motor_safety:{};c.faultCode=Number(E.fault_code)||0,c.latchFaulted=!!E.latch_faulted,c.lastFastTrip=Number(E.last_fast_trip)||0,c.endpointDecision=Number(E.endpoint_decision)||0,c.backend=E.backend||c.backend,qe()}catch(C){}}async function ki(C){if(C==="stop"){$("diagnostics.lab.log.manualStop",{zone:a});try{await da(a)}catch(E){}return}if(!o.active){if(C==="open"||C==="close")return Ra(C,null,yi());if(C==="reset"){let E=!0;try{await Za(a)}catch(Y){E=!1}await wi();let U=E&&!c.faultCode&&!c.latchFaulted;$(U?"diagnostics.lab.log.faultReset":"diagnostics.lab.log.faultResetFailed",{zone:a}),U&&we(""),ke()}}}function _i(){$t(),De(!1),o={active:!1,aborted:!1,direction:null,timer:null,live:[],hiRes:[],started:0,pullAt:0,pullInFlight:!1,chartAt:0},i={open:null,close:null,seat:null},c=No(),b=!1,w.length=0,T.innerHTML="",we(""),St([]),ge("idle"),Ea("setup")}async function jo(){o.aborted=!0,o.active=!1,$t(),De(!1),c.busy=!1,we(p("diagnostics.lab.estopDone")),ge("halted","halt"),$("diagnostics.lab.log.estop"),n="halted",ke();try{await wr()}catch(C){}qe()}function Si(){let C=q(n);C<0||C>=za.length-1||Ea(za[C+1])}function Vo(C){if(C==="start"){De(!0),$("diagnostics.lab.log.selected",{zone:a}),Ea("arm");return}if(C==="arm")return fi();if(C==="seat")return Ra("close","seat");if(C==="open")return Ra("open","open");if(C==="close")return Ra("close","close");if(C==="next")return Si();if(C==="restart")return _i();if(C==="apply"){let E=[];i.open&&E.push(...Ma(i.open,c.backend)),i.close&&E.push(...Ma(i.close,c.backend)),E.forEach(U=>Me(U.key,U.suggested)),ge("applied","ok"),$("diagnostics.lab.log.applied"),ke()}}B.addEventListener("click",()=>Vo(B.dataset.action)),V.addEventListener("click",()=>Vo(V.dataset.action)),ie.addEventListener("click",jo);for(let C of Ue)C.addEventListener("click",()=>ki(C.dataset.manual));D.addEventListener("click",()=>{if(!u.length)return;let C=o.direction||"trace";Ls(u,"motor-lab-z"+a+"-"+C+".csv")}),h.addEventListener("change",()=>{a=Number(h.value||1),k.textContent=le()});function zi(C){C.key==="Escape"&&R("section")==="motorlab"&&(C.preventDefault(),jo())}window.addEventListener("keydown",zi),re(),zt(),tt(),ge("idle"),Be(null,[],!1),ke(),Bt().then(C=>{let E=C&&C.data&&C.data.motor_safety?C.data.motor_safety:{};c.backend=E.backend||c.backend,c.armed=!!E.armed,c.latchFaulted=!!E.latch_faulted,c.latchArmLevel=E.latch_arm_level,c.latchStateLevel=E.latch_state_level,c.motorEnableLevel=E.motor_enable_level,C&&C.data&&C.data.drivers_enabled!=null&&(c.driversEnabled=!!C.data.drivers_enabled),ke()}).catch(()=>{}),M(s.drivers,qe);for(let C of Po)M(C.id,()=>{tt(),l.analysis&&ve()});K("manualMode",qe),K("selectedZone",()=>{n==="setup"&&(a=Number(R("selectedZone")||a),h.value=String(a))}),N(e)}});var bd=`
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
`;O("diag-system-card",bd);var fd=()=>`
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
`,nb=H({tag:"diag-system-card",render:fd,onMount(t,e){let a=e.querySelector('[data-k="cpu0"]'),n=e.querySelector('[data-k="cpu1"]'),r=e.querySelector('[data-k="heap"]'),o=e.querySelector('[data-k="dma"]'),i=e.querySelector('[data-k="largestInternal"]'),l=e.querySelector('[data-k="minInternal"]'),u=e.querySelector('[data-k="psram"]'),f=e.querySelector('[data-k="largestPsram"]'),w=e.querySelector('[data-k="bleAds"]'),c=e.querySelector('[data-k="bleLastAdv"]'),b=e.querySelector('[data-k="bleState"]'),x=e.querySelector('[data-bar="cpu0"]'),k=e.querySelector('[data-bar="cpu1"]'),L=e.querySelector('[data-k="reset"]'),_=(m,h,z)=>{if(z==null||!Number.isFinite(Number(z))){m.textContent="\u2014",m.classList.remove("warn"),h.style.width="0%";return}let T=Math.max(0,Math.min(100,Number(z)));m.textContent=T.toFixed(0)+"%",m.classList.toggle("warn",T>=90),h.style.width=T+"%"},S=(m,h,z)=>{if(h==null||!Number.isFinite(Number(h))){m.textContent="\u2014";return}let T=Number(h);m.textContent=T+" KB",m.classList.toggle("warn",z!=null&&T<z)},v=m=>{if(m==null||!Number.isFinite(Number(m))||Number(m)<=0)return"\u2014";let h=Number(m);return h<1e3?Math.round(h)+" ms":h<6e4?(h/1e3).toFixed(1)+" s":Math.round(h/6e4)+" min"},d=()=>{_(a,x,F(s.cpuLoadCore0)),_(n,k,F(s.cpuLoadCore1)),S(r,F(s.freeInternalKb),48),S(o,F(s.freeDmaKb),32),S(i,F(s.largestInternalKb),24),S(l,F(s.minInternalKb),48),S(u,F(s.freePsramKb),null),S(f,F(s.largestPsramKb),null);let m=F(s.bleAdsPerSec);m==null||!Number.isFinite(Number(m))?w.textContent="\u2014":w.textContent=Number(m).toFixed(1)+"/s",c.textContent=v(F(s.bleLastAdvAgeMs));let h=A(s.bleDemanded)==="on",z=A(s.bleHubEnabled)==="on",T=A(s.bleScanning)==="on",W=[];W.push(h?"demanded":"idle"),z?W.push(T?"scanning":"on"):W.push("off"),b.textContent=W.join(" \xB7 ");let D=String(A(s.resetReason)||R("resetReason")||"").trim();L.textContent=D||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{_r().catch(m=>console.error("[System] dump failed:",m))}),M(s.cpuLoadCore0,d),M(s.cpuLoadCore1,d),M(s.freeInternalKb,d),M(s.freeDmaKb,d),M(s.largestInternalKb,d),M(s.minInternalKb,d),M(s.freePsramKb,d),M(s.largestPsramKb,d),M(s.bleAdsPerSec,d),M(s.bleLastAdvAgeMs,d),M(s.bleHubEnabled,d),M(s.bleScanning,d),M(s.bleDemanded,d),M(s.resetReason,d),K("resetReason",d),N(e),d()}});var ni=`
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
`;function hn({liveHtml:t="",provisionHtml:e="",attrs:a=""}={}){return`<div class="lds-int-split int-split" data-lds-int-split ${a}>${t}${e}</div>`}var Oo="hv6_available_probes",$o=new Set,et=2,Io=8;function La(t){let e=Number(t);return Number.isFinite(e)&&e>=Io?Io:et}function hd(t){return t?Io:et}function dt(){try{return La(localStorage.getItem(Oo)||et)}catch(t){return et}}function vd(t){let e=La(t),a=et;try{a=La(localStorage.getItem(Oo)||et)}catch(n){a=et}if(e===a)return e;try{localStorage.setItem(Oo,String(e))}catch(n){}for(let n of $o)n(e);return e}function oi(t){return vd(hd(t))}function vn(t){return $o.add(t),()=>$o.delete(t)}function ct(t){let e=String(t||"").match(/(\d+)/);return e?Number(e[1]):0}function xd(t,e){let a=`Probe ${t}`;return e==null||Number.isNaN(Number(e))?a:`${a} \xB7 ${(Math.round(Number(e)*10)/10).toFixed(1)}\xB0`}function na({includeNone:t=!1,count:e=dt(),temps:a=null}={}){let n=La(e),r=t?'<option value="None" data-i18n="common.none">None</option>':"";for(let o=1;o<=n;o++){let i=a?a[o]:null,l=xd(o,i);r+=`<option value="Probe ${o}">${l}</option>`}return r}function pt(t,e=dt(),a=null){let n=La(e),r=String(t||"").match(/(\d+)/);if(!r)return a||t;let o=Number(r[1]);return o>=1&&o<=n?`Probe ${o}`:a||`Probe ${n}`}function xn({flow:t,return:e,zoneProbes:a}){let n=Object.create(null),r=ct(t),o=ct(e);r&&(n[r]="flow"),o&&(n[o]=n[o]?"flow+return":"return");for(let i=1;i<=6;i++){let l=ct(a&&a[i]);l&&(n[l]=n[l]?`${n[l]}+Z${i}`:`Z${i}`)}return n}function Aa(t,e,a){let n=ct(t);if(!n)return!1;let r=e[n];return r?a?r!==a&&!String(r).split("+").includes(a):!0:!1}var yd=`
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
`;O("settings-manifold-card",yd);function ri(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}function Ho(t){return ct(t)}function wd(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=F(g.probeTemp(e));return t}function kd(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=A(g.probe(e));return t}var _d=()=>{let t=dt(),e=na({count:t}),a="";for(let n=1;n<=8;n++)a+=`<div class="sm-probe-row${n>t?" is-hidden":""}" data-probe-row="${n}">
      <span class="sm-probe-id">P${n}</span>
      <span class="sm-probe-temp" data-probe="${n}">\u2014</span>
      <span class="sm-probe-role" data-probe-role="${n}"></span>
    </div>`;return xe({className:"settings-manifold-card",titleHtml:`<span data-i18n="settings.manifold.title">Manifold Configuration</span>${Ce("settings.manifold.help")}`,bodyHtml:hn({liveHtml:`<div class="sm-probe-live">
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
      </div>`})})},fb=H({tag:"settings-manifold-card",render:_d,onMount(t,e){let a=e.querySelector(".sm-type"),n=e.querySelector(".sm-flow"),r=e.querySelector(".sm-ret"),o=e.querySelector(".sm-flow-live"),i=e.querySelector(".sm-ret-live"),l=e.querySelector(".sm-probe-list"),u=e.querySelector("[data-probe-err]"),f=e.querySelector("[data-probe-warn]"),w=Le(e,{immediate:!0});w.select(a,{read:()=>A(s.manifoldType)||"NO (Normally Open)",commit:d=>ze("manifold_type",d)});function c(d){return xn({flow:d==="flow"?null:n.value||A(s.manifoldFlowProbe),return:d==="return"?null:r.value||A(s.manifoldReturnProbe),zoneProbes:kd()})}function b(d){u&&(u.hidden=!d,u.textContent=d||"")}w.select(n,{read:()=>pt(A(s.manifoldFlowProbe)||"Probe 1",dt(),"Probe 1"),commit:async d=>{if(Aa(d,c("flow"),"flow")){b(p("settings.manifold.probeConflict")),w.refresh();return}b("");try{await ze("manifold_flow_probe",d)}catch(m){b(p("settings.manifold.probeConflict")),w.refresh()}}}),w.select(r,{read:()=>pt(A(s.manifoldReturnProbe)||"Probe 2",dt(),"Probe 2"),commit:async d=>{if(Aa(d,c("return"),"return")){b(p("settings.manifold.probeConflict")),w.refresh();return}b("");try{await ze("manifold_return_probe",d)}catch(m){b(p("settings.manifold.probeConflict")),w.refresh()}}});function x(d,m,h){return d===m&&d===h?p("settings.manifold.roleBoth"):d===m?p("settings.manifold.roleFlow"):d===h?p("settings.manifold.roleReturn"):""}function k(d,m){let h=ri(m);d.textContent=h,d.classList.toggle("is-empty",h==="\u2014")}function L(d){let m=na({count:d,temps:wd()});for(let h of[n,r]){let z=h.value,T=h===n?"Probe 1":"Probe 2";h.innerHTML=m,h.value=pt(z,d,T)}d>=2&&n.value===r.value&&(r.value=n.value==="Probe 1"?"Probe 2":"Probe 1")}function _(){if(!f)return;let d=0,m=0;for(let z=1;z<=6;z++){let T=String(A(g.enabled(z))||"").toLowerCase()==="on";T&&m++;let W=Ho(A(g.probe(z)));T&&W>=3&&d++}let h=d>0&&m>d;f.hidden=!h,h&&(f.textContent=p("settings.manifold.unusedProbeWarn",{enabled:m,assigned:d}))}function S(d,{commitClamp:m=!1}={}){l&&(l.dataset.count=String(d)),L(d);for(let h=1;h<=8;h++){let z=e.querySelector('[data-probe-row="'+h+'"]');z&&z.classList.toggle("is-hidden",h>d)}if(m){let h=pt(n.value||A(s.manifoldFlowProbe)||"Probe 1",d,"Probe 1"),z=pt(r.value||A(s.manifoldReturnProbe)||"Probe 2",d,"Probe 2");d>=2&&h===z&&(z=h==="Probe 1"?"Probe 2":"Probe 1"),h!==A(s.manifoldFlowProbe)&&ze("manifold_flow_probe",h),z!==A(s.manifoldReturnProbe)&&ze("manifold_return_probe",z),n.value=h,r.value=z}v()}function v(){let d=Ho(n.value||A(s.manifoldFlowProbe)),m=Ho(r.value||A(s.manifoldReturnProbe));k(o,d?F(g.probeTemp(d)):null),k(i,m?F(g.probeTemp(m)):null);let h=dt();l&&(l.dataset.count=String(h));for(let z=1;z<=8;z++){let T=e.querySelector('[data-probe-row="'+z+'"]'),W=e.querySelector('[data-probe="'+z+'"]'),D=e.querySelector('[data-probe-role="'+z+'"]'),j=F(g.probeTemp(z)),J=ri(j),ae=x(z,d,m);W&&(W.textContent=J),D&&(D.textContent=ae),T&&(T.classList.toggle("is-empty",J==="\u2014"),T.classList.toggle("is-role",!!ae),T.classList.toggle("is-hidden",z>h))}_()}n.addEventListener("change",v),r.addEventListener("change",v),M(s.manifoldType,w.refresh),M(s.manifoldFlowProbe,()=>{w.refresh(),v()}),M(s.manifoldReturnProbe,()=>{w.refresh(),v()});for(let d=1;d<=8;d++)M(g.probeTemp(d),()=>{L(dt()),v()});for(let d=1;d<=6;d++)M(g.probe(d),_),M(g.enabled(d),_);vn(d=>{S(d,{commitClamp:!1}),w.refresh()}),N(e),S(dt()),w.refresh(),v()}});var Sd=`
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
`;O("settings-touch-card",Sd);var zd=()=>xe({className:"settings-touch-card",titleHtml:"Lune Touch connection",bodyHtml:`
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
  `}),Sb=H({tag:"settings-touch-card",render:zd,onMount(t,e){let a=e.querySelector(".touch-status"),n=e.querySelector(".touch-status-copy"),r=e.querySelector(".touch-identity"),o=e.querySelector(".touch-note"),i=e.querySelector(".touch-error"),l=e.querySelector(".touch-approve"),u=e.querySelector(".touch-disconnect");function f(){let w=me(s.authorityConfigured),c=me(s.authorityProposalPending),b=A(s.authorityState)||"unconfigured",x=c?A(s.authorityProposalInstallationId):A(s.authorityInstallationId),k=c?A(s.authorityProposalCoordinatorId):A(s.authorityCoordinatorId),L=A(s.authorityProposalName)||"Lune Touch",_=A(s.authorityProposalSite)||"House";a.classList.toggle("connected",w&&!c),a.classList.toggle("pending",c),n.innerHTML=c?`<strong>${L} is ready to connect</strong>${w?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:w?`<strong>Control approved</strong>${b.replace(/_/g," ")}${Number(F(s.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(F(s.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",r.hidden=!w&&!c,e.querySelector(".touch-name").textContent=c?L:"Lune Touch",e.querySelector(".touch-site").textContent=c?_:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=x||"\u2014",e.querySelector(".touch-coordinator-value").textContent=k||"\u2014",o.textContent=c?"Approval is local to this manifold. Discovery alone never grants control.":w?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",l.hidden=!c,u.hidden=!w||c}l.addEventListener("click",async()=>{i.textContent="",l.disabled=!0,l.textContent="Approving\u2026";try{await fr()}catch(w){i.textContent=(w==null?void 0:w.message)||"Unable to approve Lune Touch."}finally{l.disabled=!1,l.textContent="Approve Lune Touch"}}),u.addEventListener("click",async()=>{if(i.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){u.disabled=!0;try{await hr()}catch(w){i.textContent=(w==null?void 0:w.message)||"Unable to disconnect Lune Touch."}finally{u.disabled=!1}}}),[s.authorityConfigured,s.authorityInstallationId,s.authorityCoordinatorId,s.authorityState,s.authorityLeaseRemainingS,s.authorityProposalPending,s.authorityProposalInstallationId,s.authorityProposalCoordinatorId,s.authorityProposalName,s.authorityProposalSite].forEach(w=>M(w,f)),f()}});var Md=`
.settings-heating-mode-card .shm-options {
  display: grid;
  gap: 8px;
  margin: 0 0 12px;
}
.settings-heating-mode-card .shm-option {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid var(--separator);
  border-radius: 12px;
  background: var(--surface-1, transparent);
  cursor: pointer;
}
.settings-heating-mode-card .shm-option.is-selected {
  border-color: var(--forest);
  background: var(--fill-forest);
}
.settings-heating-mode-card .shm-option input {
  margin-top: 3px;
}
.settings-heating-mode-card .shm-option strong {
  display: block;
  font-size: .86rem;
  font-weight: 650;
}
.settings-heating-mode-card .shm-option span {
  display: block;
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: .74rem;
  line-height: 1.35;
}
.settings-heating-mode-card .shm-hp-fields[hidden],
.settings-heating-mode-card .shm-normal-fields[hidden],
.settings-heating-mode-card .shm-floor-row[hidden] { display: none !important; }
.settings-heating-mode-card .shm-note {
  margin: 0 0 12px;
  padding: 8px 10px;
  border-left: 3px solid var(--forest);
  background: color-mix(in srgb, var(--forest) 8%, transparent);
  color: var(--text-secondary);
  font-size: .76rem;
  line-height: 1.4;
}
.settings-heating-mode-card .shm-note[hidden] { display: none !important; }
`;O("settings-heating-mode-card",Md);function Cd(){let t=String(A(s.heatingMode)||"heat_pump").toLowerCase();return t==="normal"||t==="boiler"?"normal":"heat_pump"}var Ld=()=>xe({className:"settings-heating-mode-card",titleHtml:`<span data-i18n="settings.heatingMode.title">Heating mode</span>${Ce("settings.heatingMode.help")}`,bodyHtml:`
    <p class="shm-note shm-touch-note" hidden data-i18n="settings.heatingMode.touchNote">
      Lune Touch is coordinating. This mode applies when Touch is offline.
    </p>
    <div class="shm-options" role="radiogroup" aria-label="Heating mode">
      <label class="shm-option shm-opt-normal">
        <input type="radio" name="shm-mode" value="normal" />
        <span>
          <strong data-i18n="settings.heatingMode.normal">Normal (boiler, gas, district)</strong>
          <span data-i18n="settings.heatingMode.normalSub">Zones open proportionally below setpoint and close when the room reaches target.</span>
        </span>
      </label>
      <label class="shm-option shm-opt-heatpump">
        <input type="radio" name="shm-mode" value="heat_pump" />
        <span>
          <strong data-i18n="settings.heatingMode.heatPump">Heat pump</strong>
          <span data-i18n="settings.heatingMode.heatPumpSub">Satisfied zones keep a high base opening; valves trim gently and close only when overheated.</span>
        </span>
      </label>
    </div>
    <div class="shm-normal-fields">
      ${Re({on:!1,label:"Minimum total opening",className:"shm-floor-on",attrs:'data-i18n-label="settings.minFlow.title"'})}
      <p class="ui-note" data-i18n="settings.minFlow.help">Optional. Opens loops that are already calling a little further so the pump never runs against almost-closed valves. Satisfied rooms are never opened.</p>
      <div class="ui-row shm-floor-row">
        <span class="ui-label"><span data-i18n="settings.minFlow.opening">Minimum total opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">Sum across loops already accepting heat.</span></span>
        <span class="ui-field"><input class="ui-input shm-floor-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
      </div>
    </div>
    <div class="shm-hp-fields">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.heatingMode.base">Base opening (%)</span></span>
        <span class="ui-field"><input class="ui-input shm-base" type="number" min="30" max="100" step="1" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.heatingMode.margin">Overheat margin (\xB0C)</span></span>
        <span class="ui-field"><input class="ui-input shm-margin" type="number" min="0.3" max="3" step="0.1" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.heatingMode.trimFloor">Trim floor (%)</span></span>
        <span class="ui-field"><input class="ui-input shm-trim" type="number" min="0" max="100" step="1" /></span>
      </div>
    </div>
  `}),Nb=H({tag:"settings-heating-mode-card",render:Ld,onMount(t,e){let a=Le(e,{immediate:!0}),n=e.querySelector(".shm-opt-normal"),r=e.querySelector(".shm-opt-heatpump"),o=n.querySelector("input"),i=r.querySelector("input"),l=e.querySelector(".shm-hp-fields"),u=e.querySelector(".shm-touch-note"),f=e.querySelector(".shm-base"),w=e.querySelector(".shm-margin"),c=e.querySelector(".shm-trim"),b=e.querySelector(".shm-normal-fields"),x=e.querySelector(".shm-floor-on"),k=e.querySelector(".shm-floor-row"),L=e.querySelector(".shm-floor-pct"),_=()=>{let m=Cd();o.checked=m==="normal",i.checked=m==="heat_pump",n.classList.toggle("is-selected",m==="normal"),r.classList.toggle("is-selected",m==="heat_pump"),l.hidden=m!=="heat_pump",b.hidden=m!=="normal";let h=String(A(s.heatingModeSource)||"local")==="touch";if(u.hidden=!h,h){let z=String(A(s.effectiveHeatingMode)||m);u.textContent=`Lune Touch is coordinating (mode: ${z}). This mode applies when Touch is offline.`}},S=m=>{y(s.heatingMode,{state:m}),ze("heating_mode",m).catch(()=>_()),_()};o.addEventListener("change",()=>{o.checked&&S("normal")}),i.addEventListener("change",()=>{i.checked&&S("heat_pump")}),a.num(f,{read:()=>F(s.hpBasePct),commit:m=>{y(s.hpBasePct,{value:m}),Me("hp_base_pct",m)}}),a.num(w,{read:()=>F(s.hpOverheatMarginC),commit:m=>{y(s.hpOverheatMarginC,{value:m}),Me("hp_overheat_margin_c",m)}}),a.num(c,{read:()=>F(s.hpTrimFloorPct),commit:m=>{y(s.hpTrimFloorPct,{value:m}),Me("hp_trim_floor_pct",m)}});let v=m=>{k.hidden=!m,L.disabled=!m};a.toggle(x,{read:()=>me(s.minimumFlowAlways),onChange:v,commit:m=>{let h=m?"on":"off";y(s.minimumFlowAlways,{state:h}),ze("minimum_flow_always",h).catch(()=>y(s.minimumFlowAlways,{state:m?"off":"on"}))}}),a.num(L,{read:()=>F(s.minZoneFlowPct),commit:m=>{y(s.minZoneFlowPct,{value:m}),Me("min_zone_flow_pct",m)}});let d=()=>{_(),a.refresh()};M(s.heatingMode,d),M(s.effectiveHeatingMode,d),M(s.heatingModeSource,d),M(s.hpBasePct,a.refresh),M(s.hpOverheatMarginC,a.refresh),M(s.hpTrimFloorPct,a.refresh),M(s.minimumFlowAlways,a.refresh),M(s.minZoneFlowPct,a.refresh),N(e),d()}});var Ad=`
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
`;O("settings-return-temp-card",Ad);function ut(t){return!!(t&&t!=="None")}function si(t){return"Probe "+(t+2)}function Fd(){let t=Object.create(null);for(let e=1;e<=8;e++)t[e]=F(g.probeTemp(e));return t}function Td(){let t=Object.create(null);for(let e=1;e<=6;e++)t[e]=A(g.probe(e));return t}function Ed(){for(let t=1;t<=6;t++)if(ut(A(g.probe(t))))return!0;return!1}function Nd(t){return t!=null&&!Number.isNaN(Number(t))?(Math.round(Number(t)*10)/10).toFixed(1)+"\xB0":"\u2014"}var Rd=()=>{let t=na({includeNone:!0}),e="";for(let a=1;a<=6;a++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${a}">
        <span class="ui-label srt-zone-label" data-zone-label="${a}">${bt(a)}</span>
        <span class="ui-field"><div class="srt-probe-pair"><select class="ui-select srt-probe" data-zone="${a}">${t}</select><span class="srt-live" data-zone-live="${a}">\u2014</span></div></span>
      </div>`;return xe({className:"settings-return-temp-card",titleHtml:`<span data-i18n="settings.returnTemp.title">Return temperature</span>${Ce("settings.returnTemp.help")}`,bodyHtml:`
      ${Re({on:!1,label:"Enable return temperature probes",className:"srt-enabled",attrs:'data-i18n-label="settings.returnTemp.title"'})}
      <div class="srt-err" hidden data-srt-err></div>
      <div class="srt-zones">${e}</div>
    `})},jb=H({tag:"settings-return-temp-card",render:Rd,onMount(t,e){let a=e.closest('[data-collapse-block="return-temp"]'),n=a==null?void 0:a.querySelector('[data-toggle-host="return-temp"]'),r=e.querySelector(".srt-enabled");n&&r&&n.appendChild(r);let o=e.querySelector(".srt-zones"),i=Array.from(e.querySelectorAll(".srt-probe")),l=e.querySelector("[data-srt-err]"),u=Object.create(null);function f(m){l&&(l.hidden=!m,l.textContent=m||"")}function w(m){let h=u[m]||si(m),z=ct(h);return z>=3&&z<=8?h:si(m)}function c(m){let h=a==null?void 0:a.querySelector("[data-probe-mode-hint]");if(!h)return;let z=m?"settings.returnTemp.modeOn":"settings.returnTemp.modeOff";h.setAttribute("data-i18n",z),h.textContent=p(z)}function b(m){oi(m),a==null||a.classList.toggle("is-collapsed",!m),c(m),o.hidden=!m,o.setAttribute("aria-hidden",m?"false":"true");for(let h of i)h.disabled=!m}async function x(){let m=A(s.manifoldFlowProbe)||"Probe 1",h=A(s.manifoldReturnProbe)||"Probe 2",z=pt(m,et,"Probe 1"),T=pt(h,et,"Probe 2");z===T&&(T=z==="Probe 1"?"Probe 2":"Probe 1"),z!==m&&await ze("manifold_flow_probe",z),T!==h&&await ze("manifold_return_probe",T)}function k(){let m=na({includeNone:!0,temps:Fd()});for(let h of i){let z=h.value;h.innerHTML=m,[...h.options].some(T=>T.value===z)?h.value=z:ut(z)?h.value=w(Number(h.dataset.zone)):h.value="None"}}function L(){for(let m=1;m<=6;m++){let h=e.querySelector('[data-zone-label="'+m+'"]');h&&(h.innerHTML=bt(m))}}function _(){for(let m of i){let h=Number(m.dataset.zone),z=e.querySelector('[data-zone-live="'+h+'"]');if(!z)continue;let T=ct(m.value),W=T?Nd(F(g.probeTemp(T))):"\u2014";z.textContent=W,z.classList.toggle("is-empty",W==="\u2014")}}function S(m){let h=Td();return delete h[m],xn({flow:A(s.manifoldFlowProbe),return:A(s.manifoldReturnProbe),zoneProbes:h})}let v=Le(e,{immediate:!0}),d;for(let m of i){let h=Number(m.dataset.zone);v.select(m,{read:()=>{let z=A(g.probe(h));return ut(z)?(u[h]=z,z):w(h)},commit:async z=>{if(!(!d||!d.staged)){if(ut(z)&&Aa(z,S(h),`Z${h}`)){f(p("settings.manifold.probeConflict")),v.refresh();return}f(""),u[h]=z;try{await st(h,"zone_probe",z)}catch(T){f(p("settings.manifold.probeConflict")),v.refresh()}}}}),m.addEventListener("change",_)}d=v.toggle(r,{read:()=>Ed(),onChange:m=>{if(m)for(let h of i){let z=Number(h.dataset.zone);ut(h.value)||(h.value=w(z)),ut(h.value)&&(u[z]=h.value)}else for(let h of i){let z=Number(h.dataset.zone);ut(h.value)&&(u[z]=h.value)}b(m),_()},commit:async m=>{if(!m){await x();for(let h of i){let z=Number(h.dataset.zone);ut(h.value)&&(u[z]=h.value),await st(z,"zone_probe","None")}return}for(let h of i){let z=Number(h.dataset.zone),T=ut(h.value)?h.value:w(z);u[z]=T,await st(z,"zone_probe",T)}}});for(let m=1;m<=6;m++)M(g.probe(m),()=>{v.refresh(),_()}),M(g.name(m),L);for(let m=1;m<=8;m++)M(g.probeTemp(m),_);vn(()=>{k(),_()}),N(e),L(),v.refresh(),_()}});var Pd=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function Dd(){if(String(A(s.bleClockSyncAdvertising)||"").toLowerCase()==="on")return p("common.clockSyncing");let t=String(A(s.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return p("settings.bleClock.waitingClock");if(t==="ble_busy")return p("settings.bleClock.busy");if(t)return t;let e=Number(F(s.bleClockSyncLastOkS)||0);if(!e)return p("settings.bleClock.never");let a=Math.max(0,Math.round(Date.now()/1e3)-e);if(a<60)return p("common.secondsAgo",{value:a});if(a<3600)return p("common.minutesAgo",{value:Math.round(a/60)});let n=Math.round(a/3600);return p("settings.bleClock.hoursAgo",{value:n})}var Od=()=>xe({className:"settings-ble-clock-card",titleHtml:`<span data-i18n="settings.bleClock.title">Room clocks</span>${Ce("settings.bleClock.help")}`,bodyHtml:`
    ${Re({on:!1,label:"Enable room clock sync",className:"sbc-enabled",attrs:'data-i18n-label="settings.bleClock.title"'})}
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
  `}),Yb=H({tag:"settings-ble-clock-card",render:Od,onMount(t,e){let a=e.closest('[data-collapse-block="ble-clock"]'),n=a==null?void 0:a.querySelector('[data-toggle-host="ble-clock"]'),r=e.querySelector(".sbc-enabled");n&&r&&n.appendChild(r);let o=e.querySelector(".sbc-body"),i=e.querySelector(".sbc-interval"),l=e.querySelector(".sbc-status"),u=e.querySelector(".sbc-now"),f=Le(e,{immediate:!0}),w=()=>{let x=i.value;i.innerHTML=Pd.map(k=>`<option value="${k.value}">${p(k.labelKey)}</option>`).join(""),x&&(i.value=x)},c=()=>{l.textContent=Dd()},b=x=>{a==null||a.classList.toggle("is-collapsed",!x),o&&(o.hidden=!x,o.setAttribute("aria-hidden",x?"false":"true")),i.disabled=!x,u.disabled=!x};w(),f.toggle(r,{read:()=>me(s.bleClockSyncEnabled),onChange:b,commit:x=>{let k=x?"on":"off";y(s.bleClockSyncEnabled,{state:k}),ze("ble_clock_sync_enabled",k).catch(()=>y(s.bleClockSyncEnabled,{state:x?"off":"on"}))}}),f.select(i,{read:()=>String(Math.round(Number(F(s.bleClockSyncIntervalMin))||60)),commit:x=>{let k=Number(x);y(s.bleClockSyncIntervalMin,{value:k}),Me("ble_clock_sync_interval_min",k)}}),u.addEventListener("click",()=>{y(s.bleClockSyncAdvertising,{state:"on"}),c(),He("ble_clock_sync_now")}),M(s.bleClockSyncEnabled,f.refresh),M(s.bleClockSyncIntervalMin,f.refresh),M(s.bleClockSyncLastOkS,c),M(s.bleClockSyncLastError,c),M(s.bleClockSyncAdvertising,c),N(e),f.refresh(),c()}});var $d=`
.settings-action-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-action-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-action-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-action-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-action-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;O("settings-control-card",$d);var Id=()=>xe({className:"settings-action-card",titleHtml:"Recovery actions",bodyHtml:`
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  `}),of=H({tag:"settings-control-card",render:Id,onMount(t,e){N(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&He("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{He("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&He("restart")})}});var Hd=`
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
`;O("settings-motor-calibration-card",Hd);var yn=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:s.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:s.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:s.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:s.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:s.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:s.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:s.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:s.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"open-endstop-current-factor",key:"open_endstop_current_factor",id:s.openEndstopCurrentFactor,labelKey:"settings.motor.openEndstopCurrentFactor",unit:"x"},{cls:"open-endstop-stall-fraction",key:"open_endstop_stall_fraction",id:s.openEndstopStallFraction,labelKey:"settings.motor.openEndstopStallFraction",unit:"k"},{cls:"close-trailing-step-ma",key:"close_trailing_step_ma",id:s.closeTrailingStepMa,labelKey:"settings.motor.closeTrailingStepMa",unit:"mA"},{cls:"close-trailing-sustain-ms",key:"close_trailing_sustain_ms",id:s.closeTrailingSustainMs,labelKey:"settings.motor.closeTrailingSustainMs",unit:"ms"},{cls:"close-trailing-ref-ms",key:"close_trailing_ref_ms",id:s.closeTrailingRefMs,labelKey:"settings.motor.closeTrailingRefMs",unit:"ms"},{cls:"cap-close-seat-ma",key:"cap_close_seat_ma",id:s.capCloseSeatMa,labelKey:"settings.motor.capCloseSeatMa",unit:"mA"},{cls:"cap-close-seat-frames",key:"cap_close_seat_frames",id:s.capCloseSeatFrames,labelKey:"settings.motor.capCloseSeatFrames",unit:"frames"},{cls:"cap-close-popoff-ma",key:"cap_close_popoff_ma",id:s.capClosePopoffMa,labelKey:"settings.motor.capClosePopoffMa",unit:"mA"},{cls:"cap-stall-ma",key:"cap_stall_ma",id:s.capStallMa,labelKey:"settings.motor.capStallMa",unit:"mA"},{cls:"cap-open-stop-ma",key:"cap_open_stop_ma",id:s.capOpenStopMa,labelKey:"settings.motor.capOpenStopMa",unit:"mA"},{cls:"cap-circuit-fault-ma",key:"cap_circuit_fault_ma",id:s.capCircuitFaultMa,labelKey:"settings.motor.capCircuitFaultMa",unit:"mA"},{cls:"working-range-learning",key:"working_range_learning",id:s.workingRangeLearning,labelKey:"settings.motor.workingRangeLearning",unit:"0/1"},{cls:"learn-open-start-ripples",key:"learn_open_start_ripples",id:s.learnOpenStartRipples,labelKey:"settings.motor.learnOpenStartRipples",unit:"counts"},{cls:"learn-open-step-ripples",key:"learn_open_step_ripples",id:s.learnOpenStepRipples,labelKey:"settings.motor.learnOpenStepRipples",unit:"counts"},{cls:"learn-open-max-ripples",key:"learn_open_max_ripples",id:s.learnOpenMaxRipples,labelKey:"settings.motor.learnOpenMaxRipples",unit:"counts"},{cls:"learn-min-free-ripples",key:"learn_min_free_ripples",id:s.learnMinFreeRipples,labelKey:"settings.motor.learnMinFreeRipples",unit:"counts"},{cls:"learn-samples",key:"learn_samples",id:s.learnSamples,labelKey:"settings.motor.learnSamples",unit:"count"},{cls:"learn-max-spread-pct",key:"learn_max_spread_pct",id:s.learnMaxSpreadPct,labelKey:"settings.motor.learnMaxSpreadPct",unit:"%"},{cls:"pin-engage-step-ma",key:"pin_engage_step_ma",id:s.pinEngageStepMa,labelKey:"settings.motor.pinEngageStepMa",unit:"mA"},{cls:"pin-engage-margin-ripples",key:"pin_engage_margin_ripples",id:s.pinEngageMarginRipples,labelKey:"settings.motor.pinEngageMarginRipples",unit:"counts"},{cls:"relearn-movements",key:"relearn_after_movements",id:s.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:s.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:s.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:s.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],qd=()=>{let t="";for(let e=0;e<yn.length;e++){let a=yn[e];if(a.key==="generic_runtime_limit_seconds")continue;let n=Bd(a.key)?"1":"any";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+a.labelKey+'">'+p(a.labelKey)+"</span> ("+a.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+a.cls+'" value="0" step="'+n+'"></span></div>'}return xe({className:"settings-motor-cal-card",titleHtml:`<span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${Ce("settings.motor.help")}`,bodyHtml:`
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field">${Re({on:!1,label:"Toggle motor drivers",className:"mc-drivers-toggle",attrs:'data-i18n-label="settings.motor.toggleDrivers"'})}</span>
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
      <div class="runtime-note" data-i18n="settings.motor.runtimeNote">HmIP-VDMot safety: the close stroke is capped at 38s and 2600 commutations \u2014 40s is where the plunger leaves its housing. Opening is capped separately at 45s.</div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.motor.maxSafeRuntime">Max Safe Runtime</span> (s)</span>
        <span class="ui-field"><input type="number" class="ui-input smc-safe-runtime" value="0" step="1"></span>
      </div>

      <details class="mc-advanced">
        <summary data-i18n="settings.motor.advanced">Advanced motor learning</summary>
        <div class="mc-advanced-body">${t}</div>
      </details>
    `})};function Bd(t){return t==="learned_factor_min_samples"||t==="close_trailing_sustain_ms"||t==="close_trailing_ref_ms"||t==="cap_close_seat_frames"||t==="working_range_learning"||t==="learn_open_start_ripples"||t==="learn_open_step_ripples"||t==="learn_open_max_ripples"||t==="learn_min_free_ripples"||t==="learn_samples"||t==="learn_max_spread_pct"||t==="pin_engage_margin_ripples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var gf=H({tag:"settings-motor-calibration-card",render:qd,onMount(t,e){let a=e.querySelector(".smc-profile"),n=e.querySelector(".smc-safe-runtime"),r=e.querySelector(".mc-drivers-toggle"),o=Le(e);function i(u){if(u==="HmIP VdMot"&&Me("hmip_runtime_limit_seconds",38),u==="Generic"){let f=Number(F(s.genericRuntimeLimitSeconds));(!Number.isFinite(f)||f<=0)&&Me("generic_runtime_limit_seconds",45)}}o.toggle(r,{read:()=>me(s.drivers),commit:u=>ca(u)}),o.select(a,{read:()=>A(s.motorProfileDefault)||"HmIP VdMot",commit:u=>{ze("motor_profile_default",u),i(u)}});function l(){let u=A(s.motorProfileDefault)||"HmIP VdMot";n.disabled=u==="HmIP VdMot"}o.num(n,{read:()=>(A(s.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?F(s.hmipRuntimeLimitSeconds):F(s.genericRuntimeLimitSeconds),commit:u=>{a.value==="Generic"&&Me("generic_runtime_limit_seconds",u)}});for(let u=0;u<yn.length;u++){let f=yn[u];if(f.key==="generic_runtime_limit_seconds")continue;let w=e.querySelector(".smc-"+f.cls);w&&(o.num(w,{read:()=>F(f.id),commit:c=>Me(f.key,c)}),M(f.id,o.refresh))}M(s.drivers,o.refresh),M(s.motorProfileDefault,()=>{o.refresh(),l()}),M(s.genericRuntimeLimitSeconds,o.refresh),M(s.hmipRuntimeLimitSeconds,o.refresh),N(e),i(A(s.motorProfileDefault)||"HmIP VdMot"),o.refresh(),l()}});var jd=600*1e3,ii=600,Vd=`
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
`;O("settings-firmware-card",Vd);var Ud=()=>xe({className:"settings-firmware-card",titleHtml:`<span data-i18n="settings.firmware.title">Firmware</span>${Ce("settings.firmware.help")}`,bodyHtml:`
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
  `});function li(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function Fa(t,e){let a=li(t);if(!a)return!1;let n=li(e);if(!n)return!0;for(let r=0;r<3;r++)if(a[r]!==n[r])return a[r]>n[r];return!1}function ci(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function Kd(t){let e=String(t||"").trim();return e.length<=ii?e:e.slice(0,ii).replace(/\s+\S*$/,"")+"\u2026"}function Wd(){let t=document.querySelector(".settings-backup-card");if(!t)return;t.scrollIntoView({behavior:"smooth",block:"center"});let e=t.querySelector(".sbk-save");e&&e.focus({preventScroll:!0})}var _f=H({tag:"settings-firmware-card",render:Ud,onMount(t,e){let a=e.querySelector(".sfw-version"),n=e.querySelector(".sfw-status"),r=e.querySelector(".sfw-check"),o=e.querySelector(".sfw-banner"),i=e.querySelector(".sfw-hop"),l=e.querySelector(".sfw-notes"),u=e.querySelector(".sfw-install"),f=e.querySelector(".sfw-asset"),w=e.querySelector(".sfw-jump"),c=e.querySelector(".sfw-file"),b=e.querySelector(".sfw-choose"),x=e.querySelector(".sfw-upload"),k=e.querySelector(".sfw-filename"),L=e.querySelector(".sfw-progress"),_=L.querySelector("i"),S=e.querySelector(".sfw-upload-status"),v=null,d=!1,m=0,h=!1,z=()=>A(s.firmware)||R("firmwareVersion")||"",T=(B,V)=>{n.textContent=B||"",n.className="ui-sublabel sfw-status"+(V?" "+V:"")},W=()=>{let B=It.firmware_update;if(!B||B.available!==!0)return null;let V=String(B.latest||"").trim();return V?{tag:V,notes:p("settings.firmware.deviceReported"),asset:Hn(V)}:null},D=()=>{let B=W();return v?B&&Fa(B.tag,v.tag)?B:v:B},j=()=>{a.textContent=z()||p("settings.firmware.unknownVersion")},J=()=>{let B=D(),V=!!B&&Fa(B.tag,z());if(o.hidden=!V,!V){Ke("firmwareUpdateAvailable",null);return}i.innerHTML=ci(z()||p("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+ci(B.tag),l.textContent=Kd(B.notes)||p("common.noData"),f.href=B.asset.url,f.setAttribute("download",B.asset.name),f.title=B.asset.name,Ke("firmwareUpdateAvailable",{current:z(),latest:B.tag,url:B.asset.url})},ae=B=>{d||!B&&m&&Date.now()-m<jd||(d=!0,m=Date.now(),r.disabled=!0,T(p("settings.firmware.checking")),Promise.resolve(Sr()).catch(()=>{}),Cr().then(V=>{v=V,J();let ie=Fa(V.tag,z());T(ie?p("settings.firmware.availableStatus",{version:V.tag}):p("settings.firmware.upToDate"),ie?null:"ok")}).catch(V=>{v=null,J();let ie=W();if(ie){T(Fa(ie.tag,z())?p("settings.firmware.availableStatus",{version:ie.tag}):p("settings.firmware.upToDate"),Fa(ie.tag,z())?null:"ok");return}if((V instanceof ft?V.code:"network")==="no_releases"){T(p("settings.firmware.noReleases"),"ok");return}T(p("settings.firmware.checkFailed"),"err")}).finally(()=>{d=!1,r.disabled=!1}))};r.addEventListener("click",()=>ae(!0)),w.addEventListener("click",Wd),u.addEventListener("click",()=>{let B=D();B&&window.confirm(p("settings.firmware.confirmInstall",{version:B.tag}))&&(u.disabled=!0,u.textContent=p("settings.firmware.installing"),Promise.resolve(zr()).then(()=>T(p("settings.firmware.installStarted"))).catch(()=>{T(p("settings.firmware.installFailed"),"err"),u.disabled=!1,u.textContent=p("settings.firmware.install")}))}),b.addEventListener("click",()=>c.click()),c.addEventListener("change",()=>{let B=c.files&&c.files[0];k.textContent=B?B.name:p("settings.firmware.noFile"),x.disabled=!B||h,S.textContent="",S.className="ui-note sfw-upload-status"}),x.addEventListener("click",()=>{let B=c.files&&c.files[0];!B||h||window.confirm(p("settings.firmware.confirmUpload",{file:B.name}))&&(h=!0,x.disabled=!0,b.disabled=!0,L.hidden=!1,_.style.width="0%",S.className="ui-note sfw-upload-status",S.textContent=p("settings.firmware.uploading",{value:0}),Promise.resolve(Mr()).catch(V=>console.warn("[Firmware] prepare rejected, continuing with upload:",V)).then(()=>Lr(B,V=>{_.style.width=V+"%",S.textContent=p("settings.firmware.uploading",{value:V})})).then(()=>{_.style.width="100%",S.className="ui-note sfw-upload-status",S.textContent=p("settings.firmware.uploadDone")}).catch(V=>{console.error("[Firmware] upload failed:",V),L.hidden=!0,S.textContent=p("settings.firmware.uploadFailed")}).finally(()=>{h=!1,b.disabled=!1,x.disabled=!1}))}),K("section",()=>{R("section")==="settings"&&ae(!1)}),M(s.firmware,()=>{j(),J()}),M("firmware_update",J),N(e),j(),R("section")==="settings"&&ae(!1)}});var Zd=`
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
`;O("settings-backup-card",Zd);var Gd=()=>xe({className:"settings-backup-card",titleHtml:`<span data-i18n="settings.backup.title">Backup and restore</span>${Ce("settings.backup.help")}`,bodyHtml:`
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.save">Settings backup</span> <span class="ui-sublabel" data-i18n="settings.backup.saveSub">Downloads zones, manifold, motor and learned values as a JSON file.</span></span>
      <span class="ui-field"><button type="button" class="ui-btn sbk-save" data-i18n="settings.backup.saveBtn">Save backup</button></span>
    </div>
    <hr class="ui-divider">
    <div class="ui-section" data-i18n="settings.backup.restore">Restore from file</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.backup.restoreLearned">Restore learned motor values</span> <span class="ui-sublabel" data-i18n="settings.backup.restoreLearnedSub">Keeps endstop calibration from the backup instead of relearning every valve.</span></span>
      <span class="ui-field">${Re({on:!0,label:"Restore learned motor values",className:"sbk-learned",attrs:'data-i18n-label="settings.backup.restoreLearned"'})}</span>
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
  `}),Ff=H({tag:"settings-backup-card",render:Gd,onMount(t,e){let a=e.querySelector(".sbk-save"),n=e.querySelector(".sbk-learned"),r=e.querySelector(".sbk-file"),o=e.querySelector(".sbk-choose"),i=e.querySelector(".sbk-restore"),l=e.querySelector(".sbk-filename"),u=e.querySelector(".sbk-status"),f=e.querySelector(".sbk-result"),w=!0,c=!1,b=(x,k)=>{u.textContent=x||"",u.className="sbk-status"+(k?" "+k:"")};n.addEventListener("click",()=>{w=!w,tn(n,{on:w})}),a.addEventListener("click",()=>{c||(c=!0,a.disabled=!0,f.textContent="",b(p("settings.backup.saving")),Ar(!0).then(x=>{if(!Xa(x))throw new Error("unexpected_export_payload");b(p("settings.backup.saved",{file:Tr(x)}),"ok")}).catch(x=>{console.error("[Backup] export failed:",x),b(p("settings.backup.saveFailed"),"err")}).finally(()=>{c=!1,a.disabled=!1}))}),o.addEventListener("click",()=>r.click()),r.addEventListener("change",()=>{let x=r.files&&r.files[0];l.textContent=x?x.name:p("settings.backup.noFile"),i.disabled=!x||c,f.textContent="",b("")}),i.addEventListener("click",async()=>{let x=r.files&&r.files[0];if(!x||c)return;let k="";try{k=await x.text()}catch(_){b(p("settings.backup.readFailed"),"err");return}let L=null;try{L=JSON.parse(k)}catch(_){b(p("settings.backup.invalidFile"),"err");return}if(!Xa(L)){b(p("settings.backup.invalidFile"),"err");return}window.confirm(p("settings.backup.confirmRestore",{file:x.name}))&&(c=!0,i.disabled=!0,f.textContent="",b(p("settings.backup.restoring")),Fr(L,w).then(_=>{b(p("settings.backup.restored"),"ok"),f.textContent=p("settings.backup.result",{applied:_.applied,skipped:_.skipped,ignored:_.ignored})}).catch(_=>{console.error("[Backup] restore failed:",_),b(p("settings.backup.restoreFailed"),"err")}).finally(()=>{c=!1,i.disabled=!1}))}),N(e)}});var Xd=()=>xe({className:"settings-appearance-card",titleHtml:`<span data-i18n="settings.appearance.title">Appearance</span>${Ce("settings.appearance.help")}`,bodyHtml:'<p class="ui-copy" data-i18n="settings.appearance.product">Amber for action and heat, forest green for healthy state. Light and dark follow the system appearance.</p>'}),Pf=H({tag:"settings-appearance-card",render:Xd,onMount(t,e){N(e)}});var Yd=`
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
`;O("smart-preheat-card",Yd);var Jd=()=>xe({className:"smart-preheat-card",titleHtml:`<span data-i18n="settings.preheat.title">Preheat</span>${Ce("settings.preheat.help")}`,bodyHtml:`
    ${Re({on:!1,label:"Toggle preheat absorption",className:"absorb-toggle",attrs:'data-i18n-label="settings.preheat.toggle"'})}
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
  `}),Vf=H({tag:"smart-preheat-card",render:Jd,onMount(t,e){let a=e.closest('[data-collapse-block="preheat"]'),n=a==null?void 0:a.querySelector('[data-toggle-host="preheat"]'),r=e.querySelector(".absorb-toggle");n&&r&&n.appendChild(r);let o=e.querySelector(".absorb-badge"),i=e.querySelector(".absorb-band"),l=e.querySelector(".absorb-delta"),u=e.querySelector(".absorb-body"),f=Le(e,{immediate:!0}),w=b=>{a==null||a.classList.toggle("is-collapsed",!b),u&&(u.hidden=!b,u.setAttribute("aria-hidden",b?"false":"true")),i.disabled=!b,l.disabled=!b};f.toggle(r,{read:()=>me(s.preheatAbsorbEnabled),onChange:w,commit:b=>{let x=b?"on":"off";y(s.preheatAbsorbEnabled,{state:x}),ze("preheat_absorb_enabled",x)}}),f.num(i,{read:()=>F(s.preheatAbsorbBandC),commit:b=>{y(s.preheatAbsorbBandC,{value:b}),Me("preheat_absorb_band_c",b)}}),f.num(l,{read:()=>F(s.preheatDetectDeltaC),commit:b=>{y(s.preheatDetectDeltaC,{value:b}),Me("preheat_detect_delta_c",b)}});function c(){let b=String(A(s.preheatAbsorbing)||"idle").toLowerCase(),x=b==="armed"||b==="reactive"||b==="active"?b==="active"?"reactive":b:"idle",k=x==="armed"?"settings.preheat.armed":x==="reactive"?"settings.preheat.reactive":"common.idle";o.textContent=p(k),o.classList.toggle("active",x!=="idle"),o.dataset.mode=x}M(s.preheatAbsorbEnabled,f.refresh),M(s.preheatAbsorbing,c),M(s.preheatAbsorbBandC,f.refresh),M(s.preheatDetectDeltaC,f.refresh),N(e),f.refresh(),c()}});var Qd=`
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
`;O("help-external-ingest",Qd);function qo(){return window.location.origin||"http://lune-v6.local"}function ep(){return`// Shelly script \u2014 POST BTHome temps to Lune V6 (no zone number).
// 1) On V6: zone \u2192 External, set sensor_id to the BLU MAC.
// 2) Paste this on Mini PM / BLU Gateway (Gen3+). Adjust SENSOR_ID if needed.
// X-Lune-CSRF is required (any value); it is not a secret \u2014 LAN trust model.

let CONFIG = {
  v6_url: "${qo()}/api/v1/room-temperatures",
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
`}function tp(){return`# Home Assistant \u2014 rest_command + automation (no zone in payload).
# On V6: External source + sensor_id matching the entity you map below.
# X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

rest_command:
  lune_v6_room_temp:
    url: "${qo()}/api/v1/room-temperatures"
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
`}function ap(){return`// HomeyScript \u2014 forward a Homey temperature capability to Lune V6.
// On V6: External + sensor_id (use Homey device id or a stable string you choose).
// X-Lune-CSRF is required (any value); LAN trust \u2014 not a shared secret.

const V6_URL = "${qo()}/api/v1/room-temperatures";
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
`}var np={shelly:ep,ha:tp,homey:ap},Yf=H({tag:"help-external-ingest",render:()=>`
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
  `,onMount(t,e){let a="shelly",n=e.querySelector(".hei-code"),r=e.querySelectorAll(".hei-tab");function o(){r.forEach(i=>i.setAttribute("aria-selected",i.dataset.tab===a?"true":"false")),n.textContent=np[a]()}return r.forEach(i=>i.addEventListener("click",()=>{a=i.dataset.tab,o()})),e.querySelector(".hei-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(n.textContent||"")}catch(i){}}),o(),N(e),void 0}});var pi="(prefers-color-scheme: dark)",oa=null,di=!1;function op(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(pi).matches?"dark":"light"}function rp(){let t=op();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,e.classList.remove("theme-refined-ember","theme-deep-forest"),delete e.dataset.theme,!di&&typeof window!="undefined"&&typeof window.matchMedia=="function"){oa=window.matchMedia(pi);let a=()=>{let n=oa.matches?"dark":"light";e.dataset.colorScheme=n,e.style.colorScheme=n,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:n}))};typeof oa.addEventListener=="function"?oa.addEventListener("change",a):typeof oa.addListener=="function"&&oa.addListener(a),di=!0}return t}function ui(){return rp()}function mi(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}var gi=`
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
`;function Bo(t){return String(t!=null?t:"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function bi({title:t="",stack:e="",kicker:a="Hardware provisioning",save:n="",saveLabel:r="Save configuration",extra:o="",remove:i="",removeLabel:l="Remove"}={}){let u=n?`<button type="button" class="lds-btn-save btn-save" ${n}>${Bo(r)}</button>`:"",f=i?`<button type="button" class="lds-btn-danger btn-danger" ${i}>${Bo(l)}</button>`:"",w=o||f?`<div class="lds-form-extra form-extra">${o}${f}</div>`:"";return`<aside class="lds-provision provision" data-lds-provision>
  <div class="lds-form form" data-lds-form>
    <div class="lds-form-head form-head">
      <h3>${Bo(a)}</h3>
      <h2>${t}</h2>
    </div>
    <div class="lds-form-stack form-stack">${e}</div>
    <div class="lds-form-actions form-actions">
      ${u}
      ${w}
    </div>
  </div>
</aside>`}ui();var sp=`
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
.manifold-mark .lune-mark .pipe{stroke:var(--pipe-idle)!important;opacity:.42;animation:none!important;stroke-dasharray:none!important;filter:none!important}.side-nav-slot{display:flex;flex:1;min-height:0}.main-panel{grid-column:2;min-width:0}.hdr{position:sticky;top:0;z-index:20;padding:22px 36px 16px;border-bottom:1px solid var(--separator);background:var(--bg)}.view-panel{min-width:0;width:100%;margin:0;padding:var(--content-pad)}.ftr{margin-top:48px;color:var(--text-faint);font-size:.75rem}.sec{display:none}.sec.active{display:block}
.view-lead{max-width:720px;margin:0 0 28px;padding-bottom:24px;border-bottom:1px solid var(--separator)}.view-lead h2{margin:0;color:var(--text-strong);font-size:1.1rem;font-weight:650}.view-lead p{margin:6px 0 0;color:var(--text-muted);font-size:.92rem}
.status-summary{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(4,minmax(100px,1fr));gap:0;margin:0 0 24px;padding:20px 0;border-top:1px solid var(--separator);border-bottom:1px solid var(--separator)}.settings-readiness,.diagnostics-readiness{grid-template-columns:minmax(0,1.5fr) repeat(3,minmax(120px,1fr))}.status-summary-main{padding-right:24px}.eyebrow{display:block;color:var(--text-faint);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.status-summary h2{margin:5px 0 4px;color:var(--text-strong);font-size:1.65rem;letter-spacing:-.025em}.status-summary p{margin:0;color:var(--text-muted);font-size:.9rem}.status-fact{padding:0 16px;border-left:1px solid var(--separator)}.status-fact strong{display:block;margin-top:5px;color:var(--text-strong);font-size:1.15rem;font-variant-numeric:tabular-nums}.status-fact small{display:block;margin-top:3px;color:var(--text-muted);font-size:.78rem}.status-ok{color:var(--state-ok)!important}.status-summary h2.status-ok{color:var(--text-strong)!important}.status-warn{color:var(--state-warn)!important}.status-danger{color:var(--state-danger)!important}
.attention{margin:0 0 24px;border-left:3px solid var(--state-warn);padding:13px 16px;background:rgba(245,158,11,.055)}.attention[hidden]{display:none}.attention strong{display:block;color:var(--text-strong);font-size:.9rem}.attention span{display:block;margin-top:3px;color:var(--text-muted);font-size:.85rem}
.content-group{border:1px solid var(--separator);border-radius:12px;background:var(--surface-raised);overflow:hidden}.content-group + .content-group{margin-top:24px}.group-title{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:58px;padding:10px 12px 10px 18px;border-bottom:1px solid var(--separator)}.group-title-main{min-width:0}.group-title h3{margin:0;color:var(--text-strong);font-size:1rem;font-weight:650}.group-title span{display:block;margin-top:2px;color:var(--text-muted);font-size:.78rem}.group-navigation{min-height:var(--control-height);padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--accent);font-weight:650;cursor:pointer}.group-navigation:hover{background:rgba(var(--accent-rgb),.10)}.zone-grid{display:grid;grid-template-columns:1fr;gap:0;margin:0}
.zone-id-short{display:inline}.zone-id-long{display:none}@media(min-width:901px){.zone-id-short{display:none}.zone-id-long{display:inline}}.zone-label-compact .zone-id-short{display:inline!important}.zone-label-compact .zone-id-long{display:none!important}.zone-title-id{min-width:0}.zone-title-name{font-weight:500;color:var(--text-faint)}@media(max-width:900px){.zone-label-compact .zone-title-name,.mobile-zone-dock .zone-title-name{display:none}}
.zone-overview{margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid var(--separator)}.zone-detail-heading{margin:0 0 12px;padding:0;border:0}.zone-detail-heading .eyebrow,.zone-detail-heading p{display:none}.zone-detail-heading h2{margin:4px 0 0;color:var(--text-strong);font-size:1.2rem;font-weight:650;letter-spacing:-.02em}.zones-detail-pane{min-width:0}.int-split>*{min-width:0}.zone-detail-secondary{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mobile-zone-dock{display:none}
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
@media(max-width:900px){.shell{display:block;padding-bottom:78px}.shell.has-zone-dock{padding-bottom:132px}.main-panel{min-width:0}.side-panel{position:fixed;z-index:40;left:10px;right:10px;bottom:10px;top:auto;width:auto;height:auto;padding:7px;border:1px solid var(--separator);border-radius:14px;background:color-mix(in srgb,var(--bg) 92%,transparent);box-shadow:0 10px 32px rgba(0,0,0,.32);overflow:visible}.side-brand,.side-subtitle{display:none}.side-nav-slot,.side-nav-slot hv6-sidebar{flex:0 0 auto;min-height:auto}.mobile-zone-dock{display:flex;align-items:center;gap:4px;margin:0 0 6px;padding:0 0 6px;border-bottom:1px solid var(--separator)}.mobile-zone-dock[hidden]{display:none!important}.zone-overview{margin-bottom:16px}.manifold{grid-template-columns:1fr!important}.manifold-mark{margin:0 auto}.manifold .zone-overview-strip,.manifold .loops,.zone-overview-strip{grid-template-columns:repeat(3,minmax(0,1fr))!important}.manifold-meta{text-align:left}.zone-overview-strip .loop{pointer-events:none;cursor:default}.hdr{padding:9px 14px}.view-panel{width:100%;padding:24px 16px 48px}.status-summary{grid-template-columns:1fr 1fr;gap:16px}.status-summary-main{grid-column:1/-1;padding:0 0 12px;border-bottom:1px solid var(--separator)}.status-fact{padding:0;border:0}.zone-card{grid-template-columns:minmax(120px,1fr) 90px 90px 28px;gap:10px}.zone-card .zc-valve{display:none}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:3}.zone-card::after{grid-column:4}.zone-detail-secondary,.help-list{grid-template-columns:1fr}}
@media(max-width:900px){.overview-dashboard{grid-template-columns:1fr}.dashboard-hydraulic,.dashboard-activity{grid-column:1}}
@media(max-width:900px){.v6-toolbar h1{font-size:1.15rem}.v6-toolbar p{font-size:.78rem}.v6-toolbar-icon{display:none}.v6-live{font-size:0}.v6-live::before{width:8px;height:8px}.status-summary h2{font-size:1.35rem}.group-title{align-items:center}.group-title span{margin-top:4px}.zone-card{min-height:88px;grid-template-columns:minmax(0,1fr) 82px 28px}.zone-card .zc-reading{grid-column:2}.zone-card .zc-state-row{grid-column:1;margin-top:51px}.zone-card::after{grid-column:3}.zone-overview-strip{grid-template-columns:repeat(3,1fr)}.mobile-zone-dock .zone-chip{font-size:.68rem}}
`;O("hv6-app-root",sp);O("lds-manifold-row",hs);O("lds-form",gi);O("lds-int-split",ni);var ip=hn({liveHtml:'<div class="zone-live"><p class="zone-kicker">Comfort control</p><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-slot"></div></div>',provisionHtml:bi({title:'<span class="provision-zone-title">Zone</span>',stack:'<section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section><div class="zone-actuator-slot"></div>'})}),lp=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand lune-lockup" aria-label="Lune V6"><span data-live-mark="sidebar"></span><span class="product">V6</span></div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><article class="manifold" data-overview-manifold><div class="manifold-mark" data-live-mark="overview"></div><div class="loops" data-overview-loops></div><div class="manifold-meta" data-overview-meta></div></article><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Flow history</h3><p>24-hour flow, return and demand.</p></div></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><article class="manifold zone-overview"><div class="manifold-mark" data-live-mark="zones"></div><div class="zone-overview-strip loops" role="group" aria-label="Select zone"></div><div class="manifold-meta" data-zone-meta></div></article>${ip}</section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout">
<div class="settings-panel settings-disclosure touch-settings is-active" data-panel="touch"><div class="disclosure-body touch-slot"></div></div>
<div class="settings-panel settings-disclosure" data-panel="hydraulics"><div class="settings-panel-block"><h3 data-i18n="settings.heatingMode.panelTitle">Heating mode</h3><p data-i18n="settings.heatingMode.panelSub">How valves behave when rooms reach setpoint</p><div class="heating-mode-slot"></div></div><div class="settings-panel-block settings-panel-block--probes" data-collapse-block="return-temp"><div class="settings-panel-head settings-panel-head--pair"><div class="settings-panel-copy"><h3 data-i18n="settings.manifold.panelTitle">Manifold and probes</h3><p data-i18n="settings.manifold.panelSub">Valve polarity and live 1-Wire readings</p></div><div class="settings-panel-pair"><div class="settings-panel-copy"><h3 data-i18n="settings.returnTemp.title">Return temperature</h3><p class="settings-probe-mode" data-probe-mode-hint data-i18n="settings.returnTemp.modeOff">2 probes \xB7 flow/return only</p></div><div class="settings-panel-toggle" data-toggle-host="return-temp"></div></div></div><div class="manifold-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="comfort"><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="ble-clock"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.bleClock.title">Room clocks</h3><p data-i18n="settings.bleClock.panelSub">Shelly BLU display time</p></div><div class="settings-panel-toggle" data-toggle-host="ble-clock"></div></div><div class="settings-panel-body ble-clock-slot" data-collapse-body="ble-clock"></div></div><div class="settings-panel-block settings-panel-block--toggle" data-collapse-block="preheat"><div class="settings-panel-head"><div class="settings-panel-copy"><h3 data-i18n="settings.preheat.title">Preheat absorption</h3><p data-i18n="settings.preheat.panelSub">Local handling of external preload</p></div><div class="settings-panel-toggle" data-toggle-host="preheat"></div></div><div class="settings-panel-body preheat-slot" data-collapse-body="preheat"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="motors"><div class="settings-panel-block"><h3>Motor configuration</h3><p>Drivers, profile and learning limits</p><div class="motor-slot"></div></div></div>
<div class="settings-panel settings-disclosure" data-panel="device"><div class="settings-panel-block"><h3>Connection</h3><p>Network and firmware identity</p><div class="connectivity-slot"></div></div><div class="settings-panel-block"><h3>Firmware</h3><p>Version, updates and manual upload</p><div class="firmware-slot"></div></div><div class="settings-panel-block"><h3>Backup and restore</h3><p>Save or reapply local configuration</p><div class="backup-slot"></div></div><div class="settings-panel-block"><h3>Appearance</h3><p>Product colour</p><div class="appearance-slot"></div></div></div>
</div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-external-slot"></div><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Heating modes, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;H({tag:"app-root",render:lp,onMount(t,e){e.querySelector(".hdr").appendChild(de("hv6-header")),e.querySelector(".side-nav-slot").appendChild(de("hv6-sidebar")),e.querySelector(".hydraulic-history-slot").appendChild(de("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(de("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(de("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(de("zone-detail",{zone:R("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(de("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(de("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(de("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(de("zone-room-card")),e.querySelector(".touch-slot").appendChild(de("settings-touch-card"));let a=de("settings-manifold-card");e.querySelector(".manifold-slot").appendChild(a),a.querySelector(".return-temp-slot").appendChild(de("settings-return-temp-card")),e.querySelector(".heating-mode-slot").appendChild(de("settings-heating-mode-card")),e.querySelector(".ble-clock-slot").appendChild(de("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(de("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(de("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(de("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(de("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(de("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(de("settings-control-card")),e.querySelector(".manual-control-col").appendChild(de("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(de("diag-zone-motor-card",{zone:R("selectedZone")||1}));let n=e.querySelector(".motor-lab-slot"),r=e.querySelector('.sec[data-section="motorlab"]');function o(){let P=mi(A(s.firmware)||R("firmwareVersion")),q=e.querySelector('.v6-side-link[data-section="motorlab"]');q&&(q.hidden=!P),r&&(r.hidden=!P),P&&n&&!n.firstChild&&n.appendChild(de("diag-motor-lab")),!P&&R("section")==="motorlab"&&Ve("diagnostics")}M(s.firmware,o),K("firmwareVersion",o),K("section",o),o(),e.querySelector(".logs-main-col").appendChild(de("logs-view")),e.querySelector(".system-health-slot").appendChild(de("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(de("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(de("diag-i2c"));let i=e.querySelector(".help-external-slot");i&&i.appendChild(de("help-external-ingest"));let l=e.querySelectorAll(".sec"),u=e.querySelector(".shell"),f=e.querySelector(".zone-detail-view"),w=e.querySelector(".selected-zone-title"),c=e.querySelector(".provision-zone-title"),b=e.querySelector(".zone-overview-strip"),x=e.querySelector("[data-overview-loops]"),k=e.querySelector("[data-overview-meta]"),L=e.querySelector("[data-zone-meta]"),_=e.querySelector(".mobile-zone-dock"),S=e.querySelector(".mobile-zone-dock .zone-chipstrip");function v(){e.querySelectorAll("[data-live-mark]").forEach(q=>{let le=q.getAttribute("data-live-mark");if(le==="sidebar"){if(q.dataset.staticLockup==="1")return;q.innerHTML=fs(),q.dataset.staticLockup="1";return}q.dataset.staticMark!=="1"&&(ys(q,{states:["idle","idle","idle","idle","idle","idle"],selected:-1,prefix:le,landscape:!0,sku:"V6"}),q.dataset.staticMark="1")});let P=ws();k&&(k.innerHTML=P),L&&(L.innerHTML=P)}function d(P){let q=me(g.enabled(P)),le=String(A(g.state(P))||"").toUpperCase()||"OFF",re=String(A(g.motorLastFault(P))||"").toUpperCase();return q?q&&(le==="FAULT"||re&&re!=="NONE"&&re!=="OK")?"FAULT":le:"OFF"}function m(P,q){return q!=null?Pt(q,P):P==="HEATING"?p("state.heating"):P==="IDLE"?p("state.idle"):P==="FAULT"?p("common.fault"):P==="MANUAL"?p("state.manual"):P==="OVERHEATED"?p("state.overheated"):P==="CALIBRATING"?p("state.calibrating"):p("state.off")}function h(){return window.matchMedia("(min-width: 901px)").matches}function z(){let P=R("selectedZone")||1,q=h();b.setAttribute("role",q?"group":"list"),b.setAttribute("aria-label",q?"Select zone":"Zone status overview"),b.innerHTML=Array.from({length:6},(le,re)=>{let $=re+1,we=$===P,ge=_e($),Se=Wt($),mt=Ge($),rt=F(g.valve($)),Ze=Se==="unused"?"\u2014":xa(F(g.temp($))),tt=Se==="unused"?"\u2014":ua(rt),zt=ro(rt,Se),at=Se==="unused"?"\u2014":$e($)||"\u2014",Ot=d($),qe=m(Ot,$),ve=`${ge}, ${Ze}, valve ${tt}, ${qe}`.replace(/"/g,"&quot;"),Be=q?`data-zone-select="${$}" aria-current="${we?"true":"false"}" aria-label="${ve}" title="${ve}" tabindex="${we?"0":"-1"}"`:`role="listitem" aria-label="${ve}" title="${ve}"`;return so({id:mt,name:at,temp:Ze,level:zt,kind:Se,selected:q&&we,tag:q?"button":"div",attrs:Be})}).join("")}function T(){let P=R("selectedZone")||1;S.innerHTML=Array.from({length:6},(q,le)=>{let re=le+1,$=re===P,we=_e(re),ge=bt(re),Se=we.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${$}" aria-label="${Se}" title="${Se}" tabindex="${$?"0":"-1"}" data-zone-select="${re}">${ge}</button>`}).join("")}function W(){x&&(x.innerHTML=Array.from({length:6},(P,q)=>{let le=q+1,re=_e(le),$=Wt(le),we=Ge(le),ge=F(g.valve(le)),Se=$==="unused"?"\u2014":xa(F(g.temp(le))),mt=$==="unused"?"\u2014":ua(ge),rt=ro(ge,$),Ze=$==="unused"?"\u2014":$e(le)||"\u2014",tt=d(le),zt=m(tt,le),at=`${re}, ${Se}, valve ${mt}, ${zt}`.replace(/"/g,"&quot;");return so({id:we,name:Ze,temp:Se,level:rt,kind:$,attrs:`data-open-zone="${le}" aria-label="${at}" title="${at}"`})}).join(""))}function D(){z(),T(),W(),v()}function j(){let P=R("section")==="zones";_.hidden=!P,_.setAttribute("aria-hidden",P?"false":"true"),u.classList.toggle("has-zone-dock",P)}function J(P){Lt(P)}function ae(){let P=R("section")||"overview";l.forEach(q=>q.classList.toggle("active",q.dataset.section===P)),ie(),B()}function B(){let P=R("settingsPanel")||"touch";e.querySelectorAll(".settings-panel[data-panel]").forEach(q=>{q.classList.toggle("is-active",q.dataset.panel===P)})}function V(){let P=[],q=0,le=[];for(let ve=1;ve<=6;ve++){let Be=String(A(g.enabled(ve))).toLowerCase()==="on",ke=String(A(g.state(ve))).toLowerCase(),De=String(A(g.motorLastFault(ve))||"").toUpperCase();Be&&P.push(ve),Be&&["heating","calling"].includes(ke)&&q++,(ke==="fault"||De!==""&&De!=="NONE"&&De!=="OK")&&le.push({zone:ve,fault:De||"FAULT"})}let re=le.length,$=F(s.flow),we=F(s.ret),ge=String(A(s.authorityState)||"").replace(/_/g," "),Se=re===0&&R("live"),mt=$!=null&&we!=null?Number($)-Number(we):null,rt=mt==null?"\u2014":`${mt.toFixed(1)}\xB0C`,Ze=bs(),tt=gs(),zt=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${Se?"status-ok":R("live")?"status-warn":"status-danger"}">${Se?"Operating normally":R("live")?"Needs attention":"Device offline"}</h2><p>${re?re+" zone fault"+(re===1?"":"s")+" require attention.":R("live")?tt:"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Mode</span><strong>${Ze.modeLabel}</strong><small>${Ze.source}</small></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${q} zones</strong><small>${P.length} enabled \xB7 ${q}/${P.length||0} calling</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${Vt($)}</strong><small>Return ${Vt(we)} \xB7 \u0394T ${rt}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ge||"not connected"}</strong><small>${F(s.authorityLeaseRemainingS)?Math.round(F(s.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,at=me(s.authorityConfigured),Ot=String(A(s.drivers)||"off");e.querySelector(".overview-status").innerHTML=zt,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${R("live")?"status-ok":"status-danger"}">${R("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${R("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${at?"Approved":"Not approved"}</strong><small>${at?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Ot}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${re?"status-danger":Se?"status-ok":"status-warn"}">${re?re+" issue"+(re===1?"":"s"):Se?"Healthy":"Awaiting data"}</h2><p>${re?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${re}</strong><small>${re?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Ot}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${ge||"not connected"}</strong><small>${at?"approved":"local control"}</small></div>`;let qe=le.map(ve=>p("overview.attention.faultDetail",{zone:ve.zone,fault:ve.fault})).join(" ");[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(ve=>{ve.hidden=!re,ve.innerHTML=re?`<strong>${re===1?p("status.attention.zoneFaultOne"):p("status.attention.zoneFaultMany",{count:re})}</strong><span>${qe}</span>`:""})}function ie(){let P=R("selectedZone")||1,q=R("section")==="zones",le=$e(P),re=le?`${Ge(P)} \xB7 ${le}`:Ge(P);w.textContent=re,c&&(c.textContent=re),D(),j(),f.hidden=!q}function Z(P){let q=P.target.closest("[data-zone-select]");q&&J(Number(q.dataset.zoneSelect))}function Ue(P){h()&&Z(P)}function _t(P){if(!h()||!["ArrowLeft","ArrowRight","Home","End"].includes(P.key))return;P.preventDefault();let q=R("selectedZone")||1,le=P.key==="Home"?1:P.key==="End"?6:P.key==="ArrowLeft"?q===1?6:q-1:q===6?1:q+1;J(le),requestAnimationFrame(()=>{var re;return(re=b.querySelector(`[data-zone-select="${le}"]`))==null?void 0:re.focus()})}function wn(P){if(!["ArrowLeft","ArrowRight","Home","End"].includes(P.key))return;P.preventDefault();let q=R("selectedZone")||1,le=P.key==="Home"?1:P.key==="End"?6:P.key==="ArrowLeft"?q===1?6:q-1:q===6?1:q+1;J(le),requestAnimationFrame(()=>{var re;return(re=S.querySelector(`[data-zone-select="${le}"]`))==null?void 0:re.focus()})}function Ta(P){let q=P.target.closest("[data-open-zone]");q&&(J(Number(q.dataset.openZone)),Ve("zones"))}b.addEventListener("click",Ue),b.addEventListener("keydown",_t),x&&x.addEventListener("click",Ta),window.matchMedia("(min-width: 901px)").addEventListener("change",z),S.addEventListener("click",Z),S.addEventListener("keydown",wn),e.querySelectorAll("[data-open-zones]").forEach(P=>P.addEventListener("click",()=>Ve("zones"))),e.querySelectorAll("[data-help-section]").forEach(P=>P.addEventListener("click",q=>{q.preventDefault(),Ve(P.dataset.helpSection)})),K("section",ae),K("settingsPanel",B),K("selectedZone",ie),K("live",V),K("zoneNames",()=>{ie(),V()});for(let P=1;P<=6;P++)[g.temp(P),g.setpoint(P),g.effectiveSetpoint(P),g.valve(P),g.state(P),g.enabled(P),g.motorLastFault(P),g.syncTo(P)].forEach(q=>M(q,()=>{V(),D()}));[s.flow,s.ret,s.authorityConfigured,s.authorityState,s.authorityLeaseRemainingS,s.drivers,s.heatingMode,s.effectiveHeatingMode,s.heatingModeSource,s.heatDemandRecommendation,s.heatDemandCriticalZone,s.heatDemandSaturatedS,s.hpBasePct,s.hpTrimFloorPct].forEach(P=>M(P,()=>{V(),D()})),N(e),ae(),ie(),V();let te=new URLSearchParams(location.search),St=te.get("section"),ra=Number(te.get("zone"));St&&Ve(St),ra>=1&&ra<=6&&Lt(ra)}});function cp(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(de("app-root")),Hr()}cp();})();
