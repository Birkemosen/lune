(()=>{var sa={},$t={};function O(t){return sa[t.tag]=t,t}function Q(t,e){let o=sa[t];if(!o)throw new Error("Component not found: "+t);let a=e||{};if(o.state){let s=o.state(e||{});for(let c in s)a[c]=s[c]}if(o.methods)for(let s in o.methods)a[s]=o.methods[s];let n=document.createElement("div");n.innerHTML=o.render(a);let r=n.firstElementChild;return o.onMount&&o.onMount(a,r),r}function k(t,e){($t[t]||($t[t]=[])).push(e)}function we(t){let e=$t[t];if(e)for(let o=0;o<e.length;o++)e[o](t)}var h={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freeDmaKb:"sensor-free_dma_kb",largestInternalKb:"sensor-largest_internal_kb",minInternalKb:"sensor-min_internal_kb",freePsramKb:"sensor-free_psram_kb",largestPsramKb:"sensor-largest_psram_kb",bleHubEnabled:"binary_sensor-ble_hub_enabled",bleScanning:"binary_sensor-ble_scanning",bleDemanded:"binary_sensor-ble_demanded",bleAdsPerSec:"sensor-ble_ads_per_sec",bleLastAdvAgeMs:"sensor-ble_last_adv_age_ms"};var ye=6,Qr=28,dt=Object.create(null),en=an(),J={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:on(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:en,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},tn=300;function on(){let t=Object.create(null);for(let e=1;e<=ye;e++)t[e]=[];return t}function an(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<ye;)t.push("");return t.slice(0,ye)}function rn(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(J.zoneNames))}catch(t){}}function ze(t){return"$dashboard:"+t}function Je(t){return Math.max(1,Math.min(ye,Number(t)||1))}function ia(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let o=t.match(/-?\d+(?:[\.,]\d+)?/);if(o){let a=Number(String(o[0]).replace(",","."));return Number.isNaN(a)?null:a}}return null}function C(t){let e=dt[t];return e?e.v!=null?e.v:e.value!=null?e.value:ia(e.s!=null?e.s:e.state):null}function L(t){let e=dt[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function nn(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function ce(t){return nn(L(t))}function jt(){return ce(i.authorityProposalPending)}function _o(){let t=0;for(let e=1;e<=ye;e++){let o=String(L(h.state(e))||"").toLowerCase(),a=String(L(h.motorLastFault(e))||"").toLowerCase();(o==="fault"||a&&a!=="none"&&a!=="ok")&&(t+=1)}return t}function Co(){if(jt())return{kind:"touch",section:"settings",focus:"touch"};let t=_o();return t>0?{kind:"faults",section:"zones",count:t}:null}function x(t,e){let o=dt[t];o||(o=dt[t]={v:null,s:null}),"v"in e&&(o.v=e.v,o.value=e.v),"value"in e&&(o.v=e.value,o.value=e.value),"s"in e&&(o.s=e.s,o.state=e.s),"state"in e&&(o.s=e.state,o.state=e.state);for(let a in e)a==="v"||a==="value"||a==="s"||a==="state"||(o[a]=e[a]);if(we(t),t==="text_sensor-firmware_version"&&Te("firmwareVersion",L(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let a=parseInt(t.slice(10,-5),10);if(a>=1&&a<=ye){let n=L(t)||"";J.zoneNames[a-1]!==n&&(J.zoneNames[a-1]=n,rn(),we(ze("zoneNames")))}}}function U(t,e){k(ze(t),e)}function D(t){return J[t]}function Te(t,e){J[t]=e,we(ze(t))}function Pe(t){let e=t==="logs"?"diagnostics":t;J.section!==e&&(J.section=e,we(ze("section")))}function Vt(t){let e=Je(t);J.selectedZone!==e&&(J.selectedZone=e,we(ze("selectedZone")))}function $e(t){let e=!!t;J.live!==e&&(J.live=e,we(ze("live")))}function Lo(){J.pendingWrites+=1,we(ze("pendingWrites"))}function Zt(){J.pendingWrites=Math.max(0,J.pendingWrites-1),J.lastWriteAt=Date.now(),we(ze("pendingWrites"))}function la(){return J.pendingWrites>0?!0:Date.now()-J.lastWriteAt<2e3}function kt(t){return J.zoneNames[Je(t)-1]||""}function pt(t){return String(kt(t)||"").trim()}function Mo(t){return"Z"+Je(t)}function So(t){return"Zone "+Je(t)}function Se(t){let e=Je(t),o=pt(e);return o?So(e)+" - "+o:So(e)}function sn(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ln(t){let e=Je(t);return'<span class="zone-id-short">'+Mo(e)+'</span><span class="zone-id-long">'+So(e)+"</span>"}function Oe(t){let e=Je(t),o=pt(e),a=ln(e);return o?'<span class="zone-title-id">'+a+'</span><span class="zone-title-name"> - '+sn(o)+"</span>":'<span class="zone-title-id">'+a+"</span>"}function ut(t){J.i2cResult=t||"No scan has been run yet.",we(ze("i2cResult"))}function V(t,e){let o={time:cn(),msg:String(t||"")};for(J.activityLog.push(o);J.activityLog.length>60;)J.activityLog.shift();if(e>=1&&e<=ye){let a=J.zoneLog[e];for(a.push(o);a.length>8;)a.shift();we(ze("zoneLog:"+e))}we(ze("activityLog"))}function zo(t,e){let o=J[t];if(!Array.isArray(o))return;let a=ia(e);if(a!=null){for(o.push(a);o.length>Qr;)o.shift();we(ze(t))}}function zt(t){let e=Date.now();if(!t&&e-J.lastHistoryAt<3200)return;J.lastHistoryAt=e;let o=0,a=0;for(let n=1;n<=ye;n++){let r=C("sensor-zone_"+n+"_valve_pct");r!=null&&(o+=r,a+=1)}zo("historyFlow",C("sensor-manifold_flow_temperature")),zo("historyReturn",C("sensor-manifold_return_temperature")),zo("historyDemand",a?o/a:0)}function cn(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function Ut(t){J.zoneStateHistory=t||null,we(ze("zoneStateHistory"))}function ca(){return J.deviceLogSeq}function Wt(t,e){if(Array.isArray(t)&&t.length){for(let o of t)J.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>J.deviceLogSeq&&(J.deviceLogSeq=o[0]);for(;J.deviceLog.length>tn;)J.deviceLog.shift();we(ze("deviceLog"))}typeof e=="number"&&e>J.deviceLogSeq&&(J.deviceLogSeq=e-1)}function Kt(){return J.deviceLog}function da(){J.deviceLog=[],we(ze("deviceLog"))}var ge=6,dn=8,pa=null,Qe=0,Gt=1,ua=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],ba=18*3600+720,fa=Date.now(),St=4200,W={temp:new Float32Array(ge),setpoint:new Float32Array(ge),valve:new Float32Array(ge),enabled:new Uint8Array(ge),driversEnabled:1,fault:0,manualMode:0},Ce={busy:!1,direction:"open",zone:1,startedAt:0};function pn(){W.manualMode=0,fa=Date.now(),Te("manualMode",!1);for(let r=0;r<ge;r++){W.temp[r]=20.5+r*.4,W.setpoint[r]=21+r%3*.5,W.valve[r]=12+r*8,W.enabled[r]=r===4?0:1;let s=r+1;x(h.temp(s),{value:W.temp[r]}),x(h.setpoint(s),{value:W.setpoint[r]}),x(h.baseSetpoint(s),{value:W.setpoint[r]}),x(h.effectiveSetpoint(s),{value:W.setpoint[r]}),x(h.coordinatorOffset(s),{value:0}),x(h.coordinatorRemaining(s),{value:0}),x(h.valve(s),{value:W.valve[r]}),x(h.state(s),{state:W.valve[r]>5?"heating":"idle"}),x(h.enabled(s),{value:!!W.enabled[r],state:W.enabled[r]?"on":"off"}),x(h.probe(s),{state:"Probe "+s}),x(h.tempSource(s),{state:s%2?"Local Probe":"BLE"}),x(h.syncTo(s),{state:"None"}),x(h.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),x(h.name(s),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][r]||""}),x(h.preheatAdvance(s),{value:.08+r*.03})}for(let r=1;r<=dn;r++){let s=r<=ge?r:ge,c=W.temp[s-1]+(r>ge?1:.1*r);x(h.probeTemp(r),{value:c})}x(i.flow,{value:34.1}),x(i.ret,{value:30.4}),x(i.uptime,{value:ba}),x(i.wifi,{value:-57}),x(i.drivers,{value:!0,state:"on"}),x(i.fault,{value:!1,state:"off"}),x(i.ip,{state:"192.168.1.86"}),x(i.ssid,{state:"MockLab"}),x(i.mac,{state:"D8:3B:DA:12:34:56"}),x(i.firmware,{state:"v1.0.0-1"}),x(i.resetReason,{state:"Software reset (esp_restart)"}),x(i.manifoldFlowProbe,{state:"Probe 7"}),x(i.manifoldReturnProbe,{state:"Probe 8"}),x(i.manifoldType,{state:"NC (Normally Closed)"}),x(i.motorProfileDefault,{state:"HmIP VdMot"}),x(i.closeThresholdMultiplier,{value:1.7}),x(i.closeSlopeThreshold,{value:1}),x(i.closeSlopeCurrentFactor,{value:1.4}),x(i.openThresholdMultiplier,{value:1.7}),x(i.openSlopeThreshold,{value:.8}),x(i.openSlopeCurrentFactor,{value:1.3}),x(i.openRippleLimitFactor,{value:1}),x(i.genericRuntimeLimitSeconds,{value:45}),x(i.hmipRuntimeLimitSeconds,{value:40}),x(i.relearnAfterMovements,{value:2e3}),x(i.relearnAfterHours,{value:168}),x(i.learnedFactorMinSamples,{value:3}),x(i.learnedFactorMaxDeviationPct,{value:12}),x(i.simplePreheatEnabled,{state:"on"}),x(i.minZoneFlowPct,{value:15}),x(i.minimumFlowAlways,{state:"off"}),x(i.bleClockSyncEnabled,{state:"on"}),x(i.bleClockSyncIntervalMin,{value:60}),x(i.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),x(i.bleClockSyncLastError,{state:""}),x(i.bleClockSyncAdvertising,{state:"off"}),x(i.authorityInstallationId,{state:"house-main"}),x(i.authorityCoordinatorId,{state:"lune-touch"}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),x(i.authorityState,{state:"touch_normal"}),x(i.authorityReason,{state:"lease_renewed"}),x(i.authorityLeaseRemainingS,{value:72}),x(i.cpuLoadCore0,{value:18.5}),x(i.cpuLoadCore1,{value:7.2}),x(i.freeInternalKb,{value:142}),x(i.freeDmaKb,{value:118}),x(i.largestInternalKb,{value:64}),x(i.minInternalKb,{value:96}),x(i.freePsramKb,{value:7800}),x(i.largestPsramKb,{value:4096}),x(i.bleHubEnabled,{state:"on"}),x(i.bleScanning,{state:"on"}),x(i.bleDemanded,{state:"on"}),x(i.bleAdsPerSec,{value:2.4}),x(i.bleLastAdvAgeMs,{value:850}),zt(!0);let t=300,e=Number(Date.now()/1e3)|0,o=288,a=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],n=[];for(let r=0;r<o;r++){let s=(o-1-r)*t,c=e-s,p=Math.floor(r/12)%24,u=a.map(v=>v[p%v.length]),l=s/3600,m=l>2.5&&l<3.5||l>8.5&&l<9.5?1:0,g=u.filter(v=>v===5).length,f=Math.round(Math.min(100,g*15+Math.abs(Math.sin(r/8))*6)),b=Number((30+g*1.4+Math.sin(r/11)*1.5).toFixed(1)),w=Number((b-(1.4+g*.35)).toFixed(1));n.push([c,...u,m,b,w,f])}Ut({interval_s:t,uptime_s:e,count:o,entries:n}),ha(6)}function ha(t){let e=[];for(let o=0;o<t;o++){let a=ua[Gt%ua.length];e.push([Gt,a[0],a[1],a[2]]),Gt++}Wt(e,Gt)}function un(){Qe+=1,x(i.uptime,{value:ba+Math.floor((Date.now()-fa)/1e3)}),x(i.wifi,{value:-55-Math.round((1+Math.sin(Qe/4))*6)});let t=0,e=0,o=0;for(let s=0;s<ge;s++){let c=s+1,p=!!W.enabled[s],u=W.temp[s],l=W.setpoint[s],m=p&&W.driversEnabled&&!W.manualMode&&u<l-.25;W.manualMode?W.valve[s]=Math.max(0,W.valve[s]):!p||!W.driversEnabled?W.valve[s]=Math.max(0,W.valve[s]-6):m?W.valve[s]=Math.min(100,W.valve[s]+7+c%3):W.valve[s]=Math.max(0,W.valve[s]-5);let g=m?.05+W.valve[s]/2200:-.03+W.valve[s]/3200;W.temp[s]=u+g+Math.sin((Qe+c)/5)*.04,p&&W.valve[s]>0&&(t+=W.valve[s],e+=1,o=Math.max(o,W.valve[s])),x(h.temp(c),{value:W.temp[s]}),x(h.valve(c),{value:Math.round(W.valve[s])});let f=Math.max(0,(W.setpoint[s]-W.temp[s]-.15)*.22);x(h.preheatAdvance(c),{value:Number(f.toFixed(2))}),x(h.state(c),{state:p?m?"heating":"idle":"off"}),x(h.enabled(c),{value:p,state:p?"on":"off"}),x(h.probeTemp(c),{value:W.temp[s]+Math.sin((Qe+c)/6)*.1})}let a=29.5+o*.075+e*.18+Math.sin(Qe/6)*.25,n=a-(e?2.1+t/Math.max(1,e*50):1.1);x(i.flow,{value:Number(a.toFixed(1))}),x(i.ret,{value:Number(n.toFixed(1))}),x(h.probeTemp(7),{value:Number((n-.4).toFixed(1))}),x(h.probeTemp(8),{value:Number((a+.2).toFixed(1))}),zt(!0);let r=D("zoneStateHistory");r&&(r.uptime_s=Number(Date.now()/1e3)|0),Qe%3===0&&ha(1)}function ma(t,e){Ce.busy=!0,Ce.direction=e,Ce.zone=t,Ce.startedAt=Date.now()}function mn(){return Ce.startedAt?Date.now()-Ce.startedAt:0}function gn(t,e,o){if(!o)return .4;let a=e==="open";return t<180?a?22:28:t<500?a?15.2:19.4:t<2200?a?14.6:19.1:!a&&t<2800?24.2:!a&&t<3400?20.4:t<St-300?a?18.5:26.8:a?25.4:41.2}function bn(t,e,o){return o?e==="open"?t>St-300?3:0:t<2200?0:t<3e3?1:t<St-300?2:3:0}function ga(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function va(){let t=mn(),e=Ce.busy&&t<St;Ce.busy&&!e&&(Ce.busy=!1);let o=gn(t,Ce.direction,e||t<St+80);return{ok:!0,version:"v1",data:{heap:{internal_kb:C(i.freeInternalKb)||142,dma_kb:C(i.freeDmaKb)||118,largest_internal_kb:C(i.largestInternalKb)||64,min_internal_kb:C(i.minInternalKb)||96,psram_kb:C(i.freePsramKb)||7800,largest_psram_kb:C(i.largestPsramKb)||4096,internal_allocated_kb:280,internal_free_blocks:12,internal_alloc_blocks:180},ble:{enabled:L(i.bleHubEnabled)==="on",scanning:L(i.bleScanning)==="on",demanded:L(i.bleDemanded)==="on",ads_per_sec:C(i.bleAdsPerSec)||0,last_adv_age_ms:C(i.bleLastAdvAgeMs)||0},drivers_enabled:!!W.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(o.toFixed(1)),stroke_phase:bn(t,Ce.direction,e),armed:!!W.driversEnabled,tacho_period_us:ga(t,e),tacho_cadence_us:ga(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:Qe}}}}function fn(t,e){let o=e==="open";if(t<180)return o?22-t*.03:28-t*.04;if(t<650)return o?14.8:19.2;if(t<2200)return(o?14.5:19)+Math.sin(t/90)*.35;if(!o&&t<2600)return 19+(t-2200)*.012;if(!o&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return o?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let a=o?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(o?26.4:44.5,a)}function xa(t){let e=t||Ce.direction||"open",o=e==="open",a=o?3900:4200,n=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],r=0;for(let s=0;s<=a;s+=10){let c=fn(s,e);s>180&&s<a-80&&(r+=s%20===0?1:0);let p=0;o?p=s>a-400?3:0:s>=2200&&s<3e3?p=1:s>=3e3&&s<3600?p=2:s>=3600&&(p=3);let u=s<200?3200:s<a-400?1800+Math.round(Math.sin(s/140)*80):4200;n.push([s,r,c.toFixed(1),1200,1,o?1:0,1,p,u,40,0,0,0,0,0,1,0].join(","))}return n.join(`
`)+`
`}function ya(){pa||(pn(),$e(!0),pa=setInterval(un,1200))}function Xt(t){let e=t.key||"",o=t.value,a=t.zone||0;if(e==="zone_setpoint"&&a>=1&&a<=ge){let r=Number(o);Number.isNaN(r)||(W.setpoint[a-1]=r,x(h.setpoint(a),{value:r}),x(h.baseSetpoint(a),{value:r}),x(h.effectiveSetpoint(a),{value:r}),V("Zone "+a+" setpoint set to "+r.toFixed(1)+"\xB0C",a));return}if(e==="zone_enabled"&&a>=1&&a<=ge){let r=o>.5;W.enabled[a-1]=r?1:0,x(h.enabled(a),{value:r,state:r?"on":"off"}),V("Zone "+a+(r?" enabled":" disabled"),a);return}if(e==="drivers_enabled"){let r=o>.5;W.driversEnabled=r?1:0,r||(Ce.busy=!1),x(i.drivers,{value:r,state:r?"on":"off"}),V(r?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let r=o>.5;W.manualMode=r?1:0,Te("manualMode",r);return}if(e==="motor_target"&&a>=1&&a<=ge){let r=Number(o||0);x(h.motorTarget(a),{value:Math.max(0,Math.min(100,Math.round(r)))}),V("Motor "+a+" target set to "+r+"%",a);return}if(e==="command"){let r=String(o);if(r==="i2c_scan"){ut(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),V("I2C scan complete");return}if(r==="calibrate_all_motors"||r==="restart"){V("Command executed: "+r);return}if(r==="firmware_check"||r==="firmware_prepare"){V("Command executed: "+r);return}if(r==="firmware_install"){V("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(r==="open_motor_timed"&&a>=1&&a<=ge){ma(a,"open"),V("Motor "+a+" open timed",a);return}if(r==="close_motor_timed"&&a>=1&&a<=ge){ma(a,"close"),V("Motor "+a+" close timed",a);return}if(r==="stop_motor"&&a>=1&&a<=ge){Ce.busy=!1,V("Motor "+a+" stopped",a);return}if(r==="motor_reset_fault"&&a>=1&&a<=ge){V("Motor "+a+" fault reset",a);return}if(r==="motor_reset_learned_factors"&&a>=1&&a<=ge){V("Motor "+a+" learned factors reset",a);return}if(r==="motor_reset_and_relearn"&&a>=1&&a<=ge){V("Motor "+a+" reset and relearn started",a);return}if(r==="ble_clock_sync_now"){x(i.bleClockSyncAdvertising,{state:"on"}),x(i.bleClockSyncLastError,{state:""}),setTimeout(()=>{x(i.bleClockSyncAdvertising,{state:"off"}),x(i.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),V("Room clock broadcast started");return}if(r==="dump_task_stats"){V("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&a>=1){x(h.probe(a),{state:String(o)}),V("Setting updated: "+e+" = "+o,a);return}if(e==="zone_temp_source"&&a>=1){x(h.tempSource(a),{state:String(o)}),V("Setting updated: "+e+" = "+o,a);return}if(e==="zone_sync_to"&&a>=1){x(h.syncTo(a),{state:String(o)}),V("Setting updated: "+e+" = "+o,a);return}if(e==="manifold_type"){x(i.manifoldType,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="manifold_flow_probe"){x(i.manifoldFlowProbe,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="manifold_return_probe"){x(i.manifoldReturnProbe,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="motor_profile_default"){x(i.motorProfileDefault,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="simple_preheat_enabled"){x(i.simplePreheatEnabled,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="minimum_flow_always"){x(i.minimumFlowAlways,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="ble_clock_sync_enabled"){x(i.bleClockSyncEnabled,{state:String(o)}),V("Setting updated: "+e+" = "+o);return}if(e==="zone_name"&&a>=1){x(h.name(a),{state:String(o)}),V("Setting updated: "+e+" = "+o,a);return}if(e==="zone_ble_mac"&&a>=1){x(h.ble(a),{state:String(o)}),V("Setting updated: "+e+" = "+o,a);return}if(e==="authority_approve_proposal"){x(i.authorityInstallationId,{state:L(i.authorityProposalInstallationId)||"lune-mock"}),x(i.authorityCoordinatorId,{state:L(i.authorityProposalCoordinatorId)||"touch-mock"}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),V("Discovered Lune Touch approved");return}if(e==="authority_revoke"){x(i.authorityInstallationId,{state:""}),x(i.authorityCoordinatorId,{state:""}),x(i.authorityConfigured,{state:"off",value:!1}),x(i.authorityState,{state:"unconfigured"}),V("Lune Touch disconnected");return}let n={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};if(n[e]){let r=Number(o);Number.isNaN(r)||(x(n[e],{value:r}),V("Setting updated: "+e+" = "+o));return}}var Ao="v1.1.0";function wa(){return{tag_name:Ao,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+Ao+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+Ao+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function ka(t){let e=[];for(let o=1;o<=ge;o++)e.push({zone:o,name:L(h.name(o)),enabled:L(h.enabled(o))==="on",setpoint_c:C(h.setpoint(o)),probe:L(h.probe(o)),temp_source:L(h.tempSource(o)),ble_mac:L(h.ble(o)),sync_to:L(h.syncTo(o))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:L(i.firmware),device:{mac:L(i.mac)},settings:{manifold_type:L(i.manifoldType),manifold_flow_probe:L(i.manifoldFlowProbe),manifold_return_probe:L(i.manifoldReturnProbe),motor_profile_default:L(i.motorProfileDefault),min_zone_flow_pct:C(i.minZoneFlowPct),minimum_flow_always:L(i.minimumFlowAlways)==="on",simple_preheat_enabled:L(i.simplePreheatEnabled)==="on",ble_clock_sync_enabled:L(i.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:C(i.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(o=>({zone:o.zone,open_ripples:400+o.zone,close_ripples:390+o.zone}))}:null}}function za(t,e){let o=Object.keys(t&&t.settings||{}).length,a=Array.isArray(t&&t.zones)?t.zones.length:0,n=e&&t&&t.learned?ge:0;return V("Settings restored from backup (mock)"),{applied:o+a+n,skipped:e?0:ge,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Xt({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!W.enabled[t-1];Xt({key:"zone_enabled",value:e?1:0,zone:t})}};function Eo(t,e){let o=URL.createObjectURL(e),a=document.createElement("a");a.href=o,a.download=t,a.rel="noopener",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function Fo(t,e,o){Eo(t,new Blob([String(e)],{type:(o||"text/plain")+";charset=utf-8"}))}function To(t,e){let o=new Date,a=r=>String(r).padStart(2,"0"),n=o.getFullYear()+a(o.getMonth()+1)+a(o.getDate())+"-"+a(o.getHours())+a(o.getMinutes());return t+"-"+n+"."+e}var et="/api/hv6/v1",hn="https://api.github.com/repos/birkemosen/lune/releases/latest",vn="https://github.com/birkemosen/lune/releases/latest/download/",xn="/update",yn="lune-v6-settings";function Ie(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function No(t,e){let o=new URLSearchParams;for(let[n,r]of Object.entries(e||{}))r!=null&&o.append(n,r);let a=o.toString();return et+t+(a?"?"+a:"")}function ke(t,e,o){if(Lo(),Ie())try{return Xt(o),Promise.resolve({ok:!0})}finally{Zt()}let a=sessionStorage.getItem("hv6_local_access_key")||"",n=new URLSearchParams;for(let[s,c]of Object.entries(e||{}))c!=null&&n.append(s,String(c));let r=s=>fetch(et+t,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","X-Lune-Local-Key":s,"X-Lune-CSRF":s,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:n.toString()});return r(a).then(async s=>{if(s.status===403&&!a){let c=window.prompt("Enter the Lune commissioning key to change local settings")||"";c&&(sessionStorage.setItem("hv6_local_access_key",c),a=c,s=await r(a))}return!s.ok&&[400,404,415].includes(s.status)?fetch(No(t,e),{method:"POST"}):(s.ok||console.warn(`API call failed: POST ${t} status=${s.status}`),s)}).catch(s=>{throw console.error(`API call error: POST ${t}:`,s),s}).finally(()=>{Zt()})}function Do(){return sessionStorage.getItem("hv6_local_access_key")||""}function wn(t,e,o){Lo();let a=Do();return fetch(No(t,o),{method:"POST",headers:{"Content-Type":"application/json","X-Lune-Local-Key":a,"X-Lune-CSRF":a,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:JSON.stringify(e)}).finally(()=>{Zt()})}function Jt(t,e){let o=Number(e);x(h.setpoint(t),{value:o}),x(h.baseSetpoint(t),{value:o});let a=Number(C(h.coordinatorOffset(t))),n=Number.isFinite(a)?o+a:o;return x(h.effectiveSetpoint(t),{value:n}),ke(`/zones/${t}/setpoint`,{setpoint_c:o},{key:"zone_setpoint",value:o,zone:t})}function _a(t,e){return x(h.enabled(t),{state:e?"on":"off",value:e}),ke(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function _t(t){return x(i.drivers,{state:t?"on":"off",value:t}),ke("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}function Le(t,e){return ke("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function Ca(){return ut("Scanning I2C bus..."),V("I2C scan started"),Le("i2c_scan")}var kn={zone_probe:t=>h.probe(t),zone_temp_source:t=>h.tempSource(t),zone_sync_to:t=>h.syncTo(t)},zn={zone_ble_mac:t=>h.ble(t),zone_name:t=>h.name(t)},Sn={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,ble_clock_sync_enabled:i.bleClockSyncEnabled},_n={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};function Ve(t,e,o){let a=kn[e];return a&&x(a(t),{state:o}),ke("/settings/select",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function Ro(t,e,o){let a=zn[e];return a&&x(a(t),{state:o}),ke("/settings/text",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function Ae(t,e){let o=Sn[t];return o&&x(o,{state:e}),ke("/settings/select",{key:t,value:e},{key:t,value:e})}function Me(t,e){let o=Number(e),a=_n[t];return a&&!Number.isNaN(o)&&x(a,{value:o}),ke("/settings/number",{key:t,value:o},{key:t,value:o})}function La(){return ke("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:L(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:L(i.authorityProposalCoordinatorId)||"touch-mock",local_access_key:"mock-local-access-key"}},o=(e==null?void 0:e.data)||{};return o.local_access_key&&sessionStorage.setItem("hv6_local_access_key",o.local_access_key),o.installation_id&&x(i.authorityInstallationId,{state:o.installation_id}),o.coordinator_id&&x(i.authorityCoordinatorId,{state:o.coordinator_id}),x(i.authorityConfigured,{state:"on",value:!0}),x(i.authorityProposalPending,{state:"off",value:!1}),e})}function Ma(){return ke("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return sessionStorage.removeItem("hv6_local_access_key"),x(i.authorityInstallationId,{state:""}),x(i.authorityCoordinatorId,{state:""}),x(i.authorityConfigured,{state:"off",value:!1}),t})}function Aa(t,e){let o=String(e||"").trim();return V("Zone "+t+" renamed to "+(o||"(blank)"),t),Ro(t,"zone_name",o)}function Ea(t,e){let o=Number(e),a=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return x(h.motorTarget(t),{value:a}),V("Motor "+t+" target set to "+a+"%",t),ke(`/motors/${t}/target`,{value:a},{key:"motor_target",value:a,zone:t})}function Qt(t,e=1e4){return V("Motor "+t+" open for "+e+"ms",t),ke(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function eo(t,e=1e4){return V("Motor "+t+" close for "+e+"ms",t),ke(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function Po(t){return V("Motor "+t+" stopped",t),ke(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function Fa(){V("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(ke(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>_t(!1).then(()=>e))}async function Ta(){if(Ie())return va();let t=await fetch(et+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function Na(){if(Ie())return xa();let t=await fetch(et+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function Ct(t){return Te("manualMode",!!t),V(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),ke("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function Da(t){return V("Motor "+t+" fault reset",t),Le("motor_reset_fault",t)}function Ra(t){return V("Motor "+t+" learned factors reset",t),Le("motor_reset_learned_factors",t)}function Pa(t){return V("Motor "+t+" reset and relearn started",t),Le("motor_reset_and_relearn",t)}function Oa(){return V("Task/heap stats dumped to device log"),Le("dump_task_stats")}function Oo(){Ie()||fetch(et+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Ut(t)}).catch(()=>{})}function Ia(){return Le("firmware_check")}function qa(){return V("Firmware install requested"),Le("firmware_install")}function Ha(){return Le("firmware_prepare")}function Io(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:vn+e}}function Sa(t,e){let o=Array.isArray(t)?t:[],a=r=>o.find(s=>r.test(String(s&&s.name||""))),n=a(/^lune-v6.*\.ota\.bin$/i)||a(/\.ota\.bin$/i)||a(/\.bin$/i);return n&&n.browser_download_url?{name:String(n.name),url:String(n.browser_download_url)}:Io(e)}var je=class extends Error{constructor(e,o,a){super(a||e),this.name="ReleaseCheckError",this.code=e,this.status=o||0}};async function Ba(){if(Ie()){let a=wa(),n=String(a&&a.tag_name||"");return{tag:n,notes:String(a&&a.body||""),publishedAt:String(a&&a.published_at||""),asset:Sa(a&&a.assets,n)}}let t;try{t=await fetch(hn,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(a){throw new je("network",0,a&&a.message?a.message:"network")}if(t.status===404)throw new je("no_releases",404,"No published GitHub release");if(!t.ok)throw new je("http",t.status,"Release check failed: "+t.status);let e=await t.json(),o=String(e&&e.tag_name||"");if(!o)throw new je("no_releases",404,"No published GitHub release");return{tag:o,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:Sa(e&&e.assets,o)}}function $a(t,e){return Ie()?new Promise(o=>{let a=0,n=setInterval(()=>{a=Math.min(100,a+20),e&&e(a),a>=100&&(clearInterval(n),V("Firmware image uploaded (mock)"),o("Update Successful!"))},220)}):new Promise((o,a)=>{let n=new FormData;n.append("update",t,t.name);let r=new XMLHttpRequest;r.open("POST",xn);let s=Do();s&&(r.setRequestHeader("X-Lune-Local-Key",s),r.setRequestHeader("X-Lune-CSRF",s)),r.upload.onprogress=c=>{e&&c.lengthComputable&&e(Math.min(100,Math.round(c.loaded/c.total*100)))},r.onload=()=>{let c=String(r.responseText||"");if(r.status>=200&&r.status<300&&!/fail/i.test(c)){o(c);return}a(new Error("OTA upload rejected: "+r.status+" "+c))},r.onerror=()=>a(new Error("OTA upload connection lost")),r.send(n)})}function Yt(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function ja(t=!0){if(Ie())return Yt(ka(t));let e=await fetch(No("/settings/export",{include_learned:t?1:0}),{cache:"no-store",headers:{"X-Lune-Local-Key":Do()}});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Yt(await e.json())}function to(t){let e=Yt(t);return!!(e&&e._type===yn)}async function Va(t,e=!0){let o=typeof t=="string"?JSON.parse(t):t,a=Yt(o);if(!to(a))throw new Error("not_a_lune_backup");if(Ie())return za(a,e);let n=await wn("/settings/import",Object.assign({},a,{restore_learned:!!e}),{restore_learned:e?1:0});if(!n.ok)throw new Error("Settings restore failed: "+n.status);let r=await n.json().catch(()=>({})),s=r&&r.data?r.data:r||{};return V("Settings restored from backup"),{applied:Number(s.applied||0),skipped:Number(s.skipped||0),ignored:Number(s.ignored||0)}}function Za(t){let e=To("lune-v6-settings","json");return Fo(e,JSON.stringify(t,null,2),"application/json"),e}function Cn(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Kt().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function Ua(){let t=To("lune-v6-logs","txt");if(Ie())return Fo(t,Cn()||"No log lines buffered."),t;let e=await fetch(et+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return Eo(t,await e.blob()),t}function qo(){if(Ie())return;let t=ca();fetch(et+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Wt(e.lines,e.next_seq)}).catch(()=>{})}var oo=null,Wa=null,Ka=null,Ga=null,Ho=null;async function Ln(){oo&&oo.abort(),oo=new AbortController;let t=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:oo.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function Xa(t){if(!(!t||typeof t!="object")&&!la()){for(let e in t)x(e,t[e]);zt(!1)}}function Mn(t){if(t){if(!t.type){Xa(t);return}if(t.type==="state"){Xa(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;V(e),String(e).indexOf("I2C_SCAN:")!==-1&&ut(String(e))}}}function An(){Oo(),Wa||(Wa=setInterval(Oo,300*1e3)),qo(),Ka||(Ka=setInterval(qo,3e3))}function Ya(){Ln().then(t=>{$e(!0),Mn(t),An()}).catch(()=>{$e(!1)})}async function En(){try{let t=await fetch("/api/hv6/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),o=e&&e.data,a=o&&o.data_revision;o&&o.uptime_s!=null&&x(i.uptime,{value:Number(o.uptime_s)}),(Ho===null||a!==Ho)&&(Ho=a,Ya()),$e(!0)}catch(t){$e(!1)}}function Ja(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){ya();return}Ya(),Ga||(Ga=setInterval(En,3e3))}var Qa=Object.create(null);function I(t,e){if(Qa[t])return;Qa[t]=1;let o=document.createElement("style");o.textContent=e,document.head.appendChild(o)}var ao={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","status.attention.approveTouch":"Approve Touch","status.attention.zoneFaultOne":"1 zone fault","status.attention.zoneFaultMany":"{count} zone faults","status.attention.moreHasSettings":"More, action needed in Settings","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Merged with {zones}","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.title":"Control","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.coordination.title":"Coordination","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.actuator.title":"Actuator","zone.actuator.calibration":"Calibration and preheat","zone.actuator.recovery":"Service and recovery","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.returnTemp.title":"Return temperature","settings.returnTemp.help":"Assign 1-Wire return probes per zone for legacy return-temperature balancing. Adaptive balancing does not need these probes. Disable to unassign all zone return probes.","settings.returnTemp.enabledSub":"Optional return probes for legacy return-temp balancing \u2014 not required for adaptive balancing.","settings.bleClock.title":"Room clocks","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Accent colour is stored in this browser only. It does not change how the controller runs.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.dma":"Free DMA","diagnostics.system.largestInternal":"Largest free (int)","diagnostics.system.minInternal":"Min free (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.largestPsram":"Largest free PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE last adv","diagnostics.system.bleState":"BLE radio","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. Heap figures show free internal/DMA/PSRAM and fragmentation (largest block + min since boot). BLE ads/s and last-adv age show NimBLE scan liveness. "Dump task stats" logs every task's CPU% and stack headroom, then INTERNAL/DMA/SPIRAM heap_caps summaries, to the device log \u2014 use it to find what saturates a core or how the internal heap is partitioned.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The trace replaces this after the stroke.","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 ~250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","status.attention.approveTouch":"Godkend Touch","status.attention.zoneFaultOne":"1 zonefejl","status.attention.zoneFaultMany":"{count} zonefejl","status.attention.moreHasSettings":"Mere, handling n\xF8dvendig under Indstillinger","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.zone.mergedWith":"Flettet med {zones}","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.title":"Styring","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatur","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.coordination.title":"Koordinering","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Identitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","zone.actuator.title":"Aktuator","zone.actuator.calibration":"Kalibrering og preheat","zone.actuator.recovery":"Service og gendannelse","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.returnTemp.title":"Returtemperatur","settings.returnTemp.help":"Tildel 1-Wire returprober pr. zone til \xE6ldre returtemperaturbalancering. Adaptiv balancering beh\xF8ver ikke disse prober. Deaktiver for at fjerne alle zone-returprober.","settings.returnTemp.enabledSub":"Valgfrie returprober til \xE6ldre returtemp-balancering \u2014 ikke n\xF8dvendige for adaptiv balancering.","settings.bleClock.title":"Rumure","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Accentfarven gemmes kun i denne browser. Den \xE6ndrer ikke, hvordan styringen k\xF8rer.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.dma":"Fri DMA","diagnostics.system.largestInternal":"St\xF8rste fri (int)","diagnostics.system.minInternal":"Min fri (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.largestPsram":"St\xF8rste fri PSRAM","diagnostics.system.bleAds":"BLE ads/s","diagnostics.system.bleLastAdv":"BLE seneste adv","diagnostics.system.bleState":"BLE-radio","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. Heap-tal viser fri intern/DMA/PSRAM og fragmentering (st\xF8rste blok + minimum siden boot). BLE ads/s og seneste-adv viser NimBLE scan-liveness. "Dump task stats" logger alle tasks CPU% og stack-headroom samt INTERNAL/DMA/SPIRAM heap_caps-opsummeringer til enhedsloggen \u2014 brug det til at finde hvad der m\xE6tter en core, eller hvordan intern heap er fordelt.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Tracen erstatter visningen efter slaget.","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 ca. 250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},er="en".toLowerCase(),Bo=ao[er]?er:"en";function d(t,e){let o=ao[Bo]&&ao[Bo][t]||ao.en[t]||t;return e?String(o).replace(/\{(\w+)\}/g,(a,n)=>e[n]==null?"":String(e[n])):o}function E(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=d(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",d(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",d(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",d(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Bo);var Fn=`
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
`;I("ui-kit",Fn);function ve(t){let e=d(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function Tn(t,e){let o=Math.abs(Number(t));return!Number.isFinite(o)||o<1e3?e:Math.pow(10,Math.floor(Math.log10(o))-1)}function Nn(t){let e=String(t),o=e.indexOf(".");return o<0?0:e.length-o-1}function xe(t,e={}){let o=t.querySelector(e.title||".ui-card-title"),a=document.createElement("div");a.className="ui-form-banner",a.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",a):t.insertAdjacentElement("afterbegin",a);let n=[],r=()=>a.classList.toggle("show",n.some(v=>v.dirty)),s=(v,y)=>{v.dirty=y,r()};function c(v){return v.markDirty=()=>s(v,!0),n.push(v),v}function p(v,y){let T={dirty:!1,input:v},S=y.baseStep!=null?y.baseStep:parseFloat(v.step)||1,M=Nn(S),_=y.min!=null?y.min:v.min!==""?parseFloat(v.min):-1/0,R=y.max!=null?y.max:v.max!==""?parseFloat(v.max):1/0,B=H=>M>0?Number(H).toFixed(M):String(Math.round(Number(H)));if(!y.nostep){let H=document.createElement("div");H.className="ui-stepper",v.parentNode.insertBefore(H,v);let P=document.createElement("button");P.type="button",P.className="ui-step-btn",P.textContent="\u2212",P.setAttribute("aria-label",d("common.decrease"));let X=document.createElement("button");X.type="button",X.className="ui-step-btn",X.textContent="+",X.setAttribute("aria-label",d("common.increase")),H.appendChild(P),H.appendChild(v),H.appendChild(X);let te=$=>{if(v.disabled)return;let A=parseFloat(v.value);Number.isFinite(A)||(A=parseFloat(v.placeholder)),Number.isFinite(A)||(A=0);let z=Math.min(R,Math.max(_,A+$*Tn(A,S)));v.value=B(z),s(T,!0)};P.addEventListener("click",()=>te(-1)),X.addEventListener("click",()=>te(1)),v.addEventListener("keydown",$=>{$.key==="Enter"&&v.blur()})}return v.addEventListener("input",()=>s(T,!0)),T.sync=()=>{let H=y.read();v.value=H!=null&&Number.isFinite(Number(H))?B(H):""},T.commit=()=>{let H=parseFloat(v.value);Number.isFinite(H)&&y.commit(Math.min(R,Math.max(_,H)))},c(T)}function u(v,y){let T={dirty:!1,input:v};return v.addEventListener("input",()=>s(T,!0)),T.sync=()=>{let S=y.read();v.value=S!=null?S:""},T.commit=()=>y.commit(v.value.trim()),c(T)}function l(v,y){let T={dirty:!1,input:v};return v.addEventListener("change",()=>s(T,!0)),T.sync=()=>{let S=y.read();S!=null&&(v.value=S)},T.commit=()=>y.commit(v.value),c(T)}function m(v,y){let T={dirty:!1,input:v,staged:!1},S=v.closest(".ui-row"),M=()=>{v.classList.toggle("on",T.staged),S&&S.classList.toggle("is-on",T.staged),v.setAttribute("aria-checked",T.staged?"true":"false"),y.onChange&&y.onChange(T.staged)};return v.addEventListener("click",()=>{T.staged=!T.staged,s(T,!0),M()}),T.sync=()=>{T.staged=!!y.read(),M()},T.commit=()=>y.commit(T.staged),c(T)}function g(v){let y={dirty:!1,sync:v.sync,commit:v.commit};return c(y)}let f=()=>n.forEach(v=>{!v.dirty&&v.sync&&v.sync()}),b=()=>{n.forEach(v=>{v.dirty&&(v.commit&&v.commit(),v.dirty=!1)}),r(),e.onApply&&e.onApply()},w=()=>{n.forEach(v=>{v.dirty=!1,v.sync&&v.sync()}),r(),e.onDiscard&&e.onDiscard()};return a.querySelector(".ui-form-apply").addEventListener("click",b),a.querySelector(".ui-form-discard").addEventListener("click",w),E(a),{num:p,text:u,select:l,toggle:m,custom:g,refresh:f,apply:b,discard:w,isDirty:()=>n.some(v=>v.dirty)}}var Dn=`
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
`;I("hv6-header",Dn);var Rn=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-attention-badge" id="hdr-attention" hidden></button><button type="button" class="v6-update-badge" id="hdr-update" hidden></button><span class="v6-live" id="hdr-live">Offline</span></div>
  </header>`,tt=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,ro=t=>`<span class="v6-nav-dot${t==="warn"?" is-warn":""}" data-nav-dot hidden aria-hidden="true"></span>`,Pn=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${tt('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <div class="v6-nav-zones">
        <a href="#" class="v6-side-link" data-section="zones">${tt('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span>${ro("warn")}</a>
      </div>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${tt('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span>${ro("warn")}</a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${tt('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span>Motor lab</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${tt('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span>${ro()}</a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${tt('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span>${ro()}</button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${tt('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`,tr={overview:["Overview","Local heating status and current exceptions"],zones:["Zones","Physical loops, applied targets and valve state"],diagnostics:["Diagnostics","Health, evidence and recovery"],motorlab:["Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Device configuration and safety"],help:["Help","Guidance for operating Lune V6"]};function ar(t){t&&(Pe(t.section),t.focus==="touch"&&requestAnimationFrame(()=>{let e=document.querySelector(".touch-settings");e&&(e.open=!0);let o=document.querySelector(".settings-touch-card");o&&o.scrollIntoView({behavior:"smooth",block:"center"})}))}function or(t){return t?t.kind==="touch"?d("status.attention.approveTouch"):t.kind==="faults"?t.count===1?d("status.attention.zoneFaultOne"):d("status.attention.zoneFaultMany",{count:t.count}):"":""}O({tag:"hv6-header",render:Rn,onMount(t,e){let o=e.querySelector("#hdr-live"),a=e.querySelector("#v6-view-title"),n=e.querySelector("#v6-view-subtitle"),r=e.querySelector("#hdr-update"),s=e.querySelector("#hdr-attention");function c(){let l=D("firmwareUpdateAvailable");r.hidden=!l,l&&(r.textContent=d("status.updateAvailable",{version:l.latest}),r.title=d("settings.firmware.badgeTitle"))}function p(){let l=Co(),m=D("section")||"overview",g=!!(l&&l.section!==m);s.hidden=!g,g?(s.textContent=or(l),s.title=or(l),s.dataset.kind=l.kind):delete s.dataset.kind}r.addEventListener("click",()=>{Pe("settings");let l=document.querySelector(".settings-firmware-card");if(!l)return;let m=l.closest("details");m&&(m.open=!0),l.scrollIntoView({behavior:"smooth",block:"center"})}),s.addEventListener("click",()=>{ar(Co())});function u(){let l=D("section")||"overview",m=tr[l]||tr.overview;a.textContent=m[0],n.textContent=m[1],o.textContent=D("live")?d("status.live"):d("status.offline"),o.classList.toggle("is-live",!!D("live")),p()}U("section",u),U("live",u),U("firmwareUpdateAvailable",c),k(i.authorityProposalPending,p);for(let l=1;l<=6;l++)k(h.state(l),p),k(h.motorLastFault(l),p);E(e),u(),c(),p()}});O({tag:"hv6-sidebar",render:Pn,onMount(t,e){let o=e,a=e.querySelectorAll("[data-section]"),n=e.querySelector(".v6-more-toggle"),r=e.querySelector('[data-section="settings"]'),s=e.querySelector('[data-section="zones"]'),c=e.querySelector('[data-section="diagnostics"]');function p(m,g,f,b){if(!m)return;let w=m.querySelector("[data-nav-dot]");w&&(w.hidden=!g,g?(m.setAttribute("aria-label",`${f}, ${b}`),m.title=b):(m.removeAttribute("aria-label"),m.removeAttribute("title")))}function u(){let m=jt(),g=_o(),f=g===1?d("status.attention.zoneFaultOne"):d("status.attention.zoneFaultMany",{count:g});if(p(r,m,d("nav.settings"),d("status.attention.approveTouch")),p(s,g>0,d("nav.zones"),f),p(c,g>0,d("nav.diagnostics"),f),n){let b=n.querySelector("[data-nav-dot]");b&&(b.hidden=!m,b.classList.toggle("is-warn",!1)),m?(n.setAttribute("aria-label",d("status.attention.moreHasSettings")),n.title=d("status.attention.approveTouch")):(n.removeAttribute("aria-label"),n.removeAttribute("title"))}}function l(){let m=D("section");a.forEach(g=>{g.dataset.section&&(g.dataset.section===m?g.classList.add("active"):g.classList.remove("active"),g.setAttribute("aria-current",g.dataset.section===m?"page":"false"))}),u()}a.forEach(m=>m.addEventListener("click",g=>{g.preventDefault();let f=m.dataset.section;f==="settings"&&jt()?ar({kind:"touch",section:"settings",focus:"touch"}):Pe(f),o.classList.contains("more-open")&&(o.classList.remove("more-open"),n&&n.setAttribute("aria-expanded","false"))})),n&&n.addEventListener("click",()=>{let m=o.classList.toggle("more-open");n.setAttribute("aria-expanded",String(m))}),U("section",l),k(i.authorityProposalPending,u);for(let m=1;m<=6;m++)k(h.state(m),u),k(h.motorLastFault(m),u);E(e),l()}});function ue(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function mt(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function rr(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,o=t%86400/3600|0,a=t%3600/60|0;return e>0?e+"d "+o+"h "+a+"m":o>0?o+"h "+a+"m":a+"m"}var On=`
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
`;I("connectivity-card",On);var In=()=>`
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
`,Ll=O({tag:"connectivity-card",render:In,onMount(t,e){let o=e.querySelector(".cc-ip"),a=e.querySelector(".cc-ssid"),n=e.querySelector(".cc-mac"),r=e.querySelector(".cc-up"),s=e.querySelector(".cc-ver"),c=0,p=Date.now(),u=!1;function l(){if(!u){r.textContent="---";return}let f=Math.max(0,Math.floor((Date.now()-p)/1e3)),b=rr(c+f);r.textContent!==b&&(r.textContent=b)}function m(){o.textContent=L(i.ip)||"---",a.textContent=L(i.ssid)||"---",n.textContent=L(i.mac)||"---",s.textContent=L(i.firmware)||"---";let f=C(i.uptime);if(f!=null&&!isNaN(f)&&f>=0){let b=f|0;(!u||b!==c)&&(c=b,p=Date.now(),u=!0)}l()}k(i.ip,m),k(i.ssid,m),k(i.mac,m),k(i.firmware,m),k(i.uptime,m);let g=setInterval(l,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(g),{once:!0}),E(e),m()}});var qn="http://www.w3.org/2000/svg",Hn=`
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
`;I("chart-kit",Hn);function G(t,e,o){let a=document.createElementNS(qn,t);if(e)for(let n in e)a.setAttribute(n,e[n]);return o!=null&&(a.textContent=o),a}function gt(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(a=>`${a.x.toFixed(2)} ${a.y.toFixed(2)}`).join(" L ");let e=.16,o=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let a=0;a<t.length-1;a++){let n=t[a-1]||t[a],r=t[a],s=t[a+1],c=t[a+2]||s,p=r.x+(s.x-n.x)*e,u=r.y+(s.y-n.y)*e,l=s.x-(c.x-r.x)*e,m=s.y-(c.y-r.y)*e;o+=` C ${p.toFixed(2)} ${u.toFixed(2)}, ${l.toFixed(2)} ${m.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return o}function no(t,e,o){let a=t.filter(c=>Number.isFinite(c));if(!a.length)return{min:e,max:o};let n=Math.min(...a),r=Math.max(...a);n===r&&(n-=1,r+=1);let s=(r-n)*.12;return{min:n-s,max:r+s}}function bt(t,e,o){let a=document.createElement("div");a.className="chart-tooltip",e.appendChild(a);let n=G("g",{class:"chart-cursor",style:"display:none"}),r=G("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});n.appendChild(r);let s=[];t.appendChild(n);function c(m){let g=0,f=1/0;for(let b=0;b<o.count;b++){let w=Math.abs(m-o.xAt(b));w<f&&(f=w,g=b)}return g}function p(m){let g=t.getScreenCTM();if(!g)return null;let f=t.createSVGPoint();return f.x=m.clientX,f.y=m.clientY,f.matrixTransform(g.inverse())}function u(m){if(!o.count)return;let g=p(m);if(!g)return;let f=c(g.x),b=o.xAt(f);r.setAttribute("x1",b),r.setAttribute("x2",b);let w=o.dots(f);for(;s.length<w.length;){let S=G("circle",{class:"chart-cursor-dot",r:3.4});n.appendChild(S),s.push(S)}s.forEach((S,M)=>{M<w.length?(S.setAttribute("cx",b),S.setAttribute("cy",w[M].y),S.setAttribute("fill",w[M].color),S.style.display=""):S.style.display="none"}),n.style.display="";let v=o.rows(f).map(S=>`<div class="tt-row"><span class="tt-swatch" style="background:${S.color}"></span>${S.label}<span class="tt-val">${S.value}</span></div>`).join("");a.innerHTML=`<div class="tt-time">${o.label(f)}</div>${v}`,a.classList.add("show");let y=e.getBoundingClientRect(),T=m.clientX-y.left+14;T+a.offsetWidth>y.width-6&&(T=m.clientX-y.left-a.offsetWidth-14),a.style.left=Math.max(6,T)+"px",a.style.top=Math.max(6,m.clientY-y.top+12)+"px"}function l(){a.classList.remove("show"),n.style.display="none"}return t.addEventListener("pointermove",u),t.addEventListener("pointerleave",l),()=>{t.removeEventListener("pointermove",u),t.removeEventListener("pointerleave",l),a.remove()}}var Lt=1e3,$o=180,Ne=14,Bn=42,$n=44,Ue=42,lo=Lt-Ue-Bn,Ze=$o-Ne-$n,ot=Ne+Ze,jo=24*3600,nr=ye+2,sr=ye+3,so=ye+4,jn="var(--series-warm)",Vn="var(--series-cool)",ir="var(--series-solar)",Zn=`
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
`;I("graph-widgets",Zn);var lr=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',cr=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Un=t=>t.variant==="flow-return"?`<div class="graph-widgets">${lr()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${cr()}</div>`:`<div class="graph-widgets">${lr()}${cr()}</div>`;function dr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function Wn(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function Vo(t,e,o){let a=[];for(let n=0;n<t.length;n++){let r=t[n];if(!r||r[0]<o)continue;let s=r[e];s==null||!Number.isFinite(s)||a.push({t:r[0],v:s})}return a}var co=(t,e)=>Ue+Math.max(0,Math.min(1,(t-e)/jo))*lo;function Kn(t,e,o){let a=Number(Date.now()/1e3)|0,n=3600,r=Math.ceil((a-jo)/n)*n,s=Math.floor(a/n)*n,c=Math.floor(a/n)*n;for(let u=r;u<=s;u+=n){let l=o-(a-u),m=co(l,e),g=new Date(u*1e3),f=u===c,b=ot+16;t.appendChild(G("text",{x:m,y:b,"text-anchor":"end",transform:`rotate(-45 ${m.toFixed(1)} ${b})`,class:"chart-hour"+(f?" now":"")},String(g.getHours()).padStart(2,"0")))}let p=co(o,e);t.appendChild(G("line",{x1:p,y1:Ne,x2:p,y2:ot,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Gn(t){let e=[];if(t.forEach(r=>r.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let o=Math.min(...e),a=Math.max(...e);o===a&&(o-=.5,a+=.5);let n=(a-o)*.1;return o-=n,a+=n,{min:o,max:a}}function Xn(t,e,o){let a=t.filter(n=>n.unit==="C").map(n=>Vo(e,n.index,o));return Gn(a)}function pr(t,e,o,a,n,r){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${Lt} ${$o}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=o.map(b=>Vo(a,b.index,n));if(!s.some(b=>b.length))return t.appendChild(G("text",{x:Lt/2,y:$o/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let c=Xn(o,a,n),p=Math.max(.001,c.max-c.min),u=b=>Ne+(1-(b-c.min)/p)*Ze,l=b=>Ne+(1-Math.max(0,Math.min(100,b))/100)*Ze,m=(b,w)=>b.unit==="%"?l(w):u(w);for(let b=0;b<3;b++){let w=b/2,v=Ne+w*Ze;t.appendChild(G("line",{x1:Ue,y1:v,x2:Ue+lo,y2:v,class:"chart-grid"})),o.some(y=>y.unit==="C")&&t.appendChild(G("text",{x:Ue-6,y:v+4,"text-anchor":"end",class:"chart-tick"},dr(c.max-p*w,"C")+"\xB0")),o.some(y=>y.unit==="%")&&t.appendChild(G("text",{x:Ue+lo+6,y:v+4,"text-anchor":"start",class:"chart-tick"},dr(100-100*w,"%")))}t.appendChild(G("line",{x1:Ue,y1:ot,x2:Ue+lo,y2:ot,class:"chart-axis"})),o.some(b=>b.unit==="C")&&t.appendChild(G("text",{x:9,y:Ne+Ze/2,transform:`rotate(-90 9 ${(Ne+Ze/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.temp"))),o.some(b=>b.unit==="%")&&t.appendChild(G("text",{x:Lt-9,y:Ne+Ze/2,transform:`rotate(90 ${Lt-9} ${(Ne+Ze/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.demand"))),Kn(t,n,r),o.forEach((b,w)=>{let v=s[w].map(T=>({x:co(T.t,n),y:m(b,T.v)}));if(!v.length)return;let y=gt(v);b.fill&&t.appendChild(G("path",{d:y+` L ${v[v.length-1].x.toFixed(1)} ${ot} L ${v[0].x.toFixed(1)} ${ot} Z`,fill:b.fill,stroke:"none"})),t.appendChild(G("path",{d:y,fill:"none",stroke:b.color,"stroke-width":String(b.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let g=[];for(let b=0;b<a.length;b++){let w=a[b];if(!w||w[0]<n)continue;let v=o.map(y=>w[y.index]);v.every(y=>y==null||!Number.isFinite(y))||g.push({t:w[0],vals:v})}if(!g.length)return null;let f=Date.now();return bt(t,e,{count:g.length,plotTop:Ne,plotBottom:ot,xAt:b=>co(g[b].t,n),label:b=>new Date(f-(r-g[b].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:b=>o.map((w,v)=>({y:m(w,g[b].vals[v]),color:w.color})).filter((w,v)=>Number.isFinite(g[b].vals[v])),rows:b=>o.map((w,v)=>({color:w.color,label:w.label,value:Wn(g[b].vals[v],w.unit)})).filter((w,v)=>Number.isFinite(g[b].vals[v]))})}function io(t,e,o){let a=Vo(t,e,o);return a.length?a[a.length-1].v:null}var Pl=O({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:Un,onMount(t,e){let o=e.querySelector(".gw-dt"),a=e.querySelector(".gw-demand-text"),n=e.querySelector(".gw-flow"),r=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),c={flow:!0,return:!0,demand:!0},p=null,u=null;function l(){s.forEach(f=>{let b=f.dataset.layer;f.classList.toggle("is-off",!c[b]),f.setAttribute("aria-pressed",c[b]?"true":"false")})}function m(){let f=[];return c.flow&&f.push({index:nr,color:jn,label:d("overview.graph.layers.flow"),unit:"C",width:2.4}),c.return&&f.push({index:sr,color:Vn,label:d("overview.graph.layers.return"),unit:"C",width:2}),c.demand&&f.push({index:so,color:ir,label:d("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function g(){let f=D("zoneStateHistory"),b=f&&Array.isArray(f.entries)?f.entries:[],w=f&&f.uptime_s||Number(Date.now()/1e3)|0,v=w-jo;if(n){p&&p();let y=io(b,nr,v),T=io(b,sr,v),S=io(b,so,v),M=[];y!=null&&T!=null&&M.push("\u0394 "+(y-T).toFixed(1)+"\xB0"),S!=null&&M.push(Math.round(S)+"%"),o.textContent=M.length?M.join(" \xB7 "):"\u2014",p=pr(n,n.closest(".chart-card"),m(),b,v,w)}if(r){u&&u();let y=io(b,so,v);a.textContent=y!=null?Math.round(y)+"%":"\u2014",u=pr(r,r.closest(".chart-card"),[{index:so,color:ir,label:d("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],b,v,w)}}s.forEach(f=>{f.addEventListener("click",()=>{let b=f.dataset.layer;c[b]=!c[b],!c.flow&&!c.return&&!c.demand&&(c[b]=!0),l(),g()})}),U("zoneStateHistory",g),E(e),l(),g()}});var We={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Mt=24*3600,Yn=Mt,At=18,Wo=4,at=54,uo=32,ft=4,mo=10,gr=6,br="#ffc14d",Zo=9,ur=ye+1,fr=ft+ye*(At+Wo)-Wo,Uo=fr+gr,po=fr+gr+mo+uo,Jn=`
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
`;I("zone-state-timeline",Jn);var Qn=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function es(t,e){if(!t||!t.entries||t.entries.length===0)return null;let o=t.entries,a=t.uptime_s||e||0,n=Number(Date.now()/1e3)|0,r=1e3,s=r-at;function c(S){let M=(S+Mt)/Yn;return at+Math.max(0,Math.min(1,M))*s}function p(S){return S-a}let u="http://www.w3.org/2000/svg",l=document.createElementNS(u,"svg");l.setAttribute("viewBox","0 0 "+r+" "+po),l.classList.add("timeline-svg");let m=document.createElementNS(u,"rect");m.setAttribute("x",at),m.setAttribute("y",ft),m.setAttribute("width",s),m.setAttribute("height",po-ft-uo),m.setAttribute("fill","rgba(0,32,46,0.55)"),m.setAttribute("rx","4"),l.appendChild(m);let g=c(0),f=[-24,-18,-12,-6,0].map(S=>S*3600);for(let S of f){let M=c(S),_=document.createElementNS(u,"line");_.setAttribute("x1",M),_.setAttribute("y1",ft),_.setAttribute("x2",M),_.setAttribute("y2",po-uo),_.setAttribute("stroke",S===0?"var(--series-solar)":"rgba(120,146,200,.16)"),_.setAttribute("stroke-width","1"),S===0&&(_.setAttribute("stroke-dasharray","2 3"),_.setAttribute("opacity",".55"),_.setAttribute("vector-effect","non-scaling-stroke")),l.appendChild(_)}l.appendChild(ts(u,"text",{x:g+4,y:ft+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let S=0;S<ye;S++){let M=ft+S*(At+Wo),_=document.createElementNS(u,"rect");_.setAttribute("x",at),_.setAttribute("y",M),_.setAttribute("width",s),_.setAttribute("height",At),_.setAttribute("fill",S%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),l.appendChild(_);let R=document.createElementNS(u,"text");R.setAttribute("x",at-4),R.setAttribute("y",M+At/2+1),R.setAttribute("text-anchor","end"),R.setAttribute("dominant-baseline","middle"),R.setAttribute("fill","rgba(233,222,210,.62)"),R.setAttribute("font-size","9.5"),R.setAttribute("font-family","Montserrat, sans-serif"),R.setAttribute("font-weight","600"),R.textContent="Z"+(S+1),l.appendChild(R);let B=o.map(P=>({rel:p(P[0]),state:P[S+1]})).filter(P=>P.rel>=-Mt&&P.rel<=0),H=(P,X,te)=>{if(te===255)return;let $=We[te]||We[255];if($.color==="transparent")return;let A=c(P),z=c(X),q=Math.max(1,z-A),N=document.createElementNS(u,"rect");N.setAttribute("x",A),N.setAttribute("y",M+(At-Zo)/2),N.setAttribute("width",q),N.setAttribute("height",Zo),N.setAttribute("fill",$.color),N.setAttribute("rx",String(Zo/2)),N.setAttribute("opacity","0.9"),l.appendChild(N)};if(B.length){let P=B[0].rel,X=B[0].state;for(let te=1;te<B.length;te++){let $=B[te];$.state!==X&&(H(P,$.rel,X),P=$.rel,X=$.state)}H(P,0,X)}}{let S=document.createElementNS(u,"rect");S.setAttribute("x",at),S.setAttribute("y",Uo),S.setAttribute("width",s),S.setAttribute("height",mo),S.setAttribute("fill","rgba(188,80,144,0.10)"),S.setAttribute("rx","2"),l.appendChild(S);let M=document.createElementNS(u,"text");M.setAttribute("x",at-4),M.setAttribute("y",Uo+mo/2+1),M.setAttribute("text-anchor","end"),M.setAttribute("dominant-baseline","middle"),M.setAttribute("fill","rgba(233,222,210,.62)"),M.setAttribute("font-size","8.5"),M.setAttribute("font-family","Montserrat, sans-serif"),M.setAttribute("font-weight","600"),M.textContent=d("overview.timeline.absorb"),l.appendChild(M);let _=o.map(R=>({rel:p(R[0]),on:R.length>ur?R[ur]:0})).filter(R=>R.rel>=-Mt&&R.rel<=0);if(_.length){let R=(P,X)=>{let te=c(P),$=Math.max(1,c(X)-te),A=document.createElementNS(u,"rect");A.setAttribute("x",te),A.setAttribute("y",Uo),A.setAttribute("width",$),A.setAttribute("height",mo),A.setAttribute("fill",br),A.setAttribute("rx","2"),A.setAttribute("opacity","0.9"),l.appendChild(A)},B=_[0].rel,H=_[0].on;for(let P=1;P<_.length;P++)_[P].on!==H&&(H&&R(B,_[P].rel),B=_[P].rel,H=_[P].on);H&&R(B,0)}}let b=po-uo+15,w=3600,v=Math.ceil((n-Mt)/w)*w,y=Math.floor(n/w)*w,T=Math.floor(n/w)*w;for(let S=v;S<=y;S+=w){let M=S-n,_=c(M),R=new Date(S*1e3),B=String(R.getHours()).padStart(2,"0"),H=S===T,P=document.createElementNS(u,"text");P.setAttribute("x",_),P.setAttribute("y",b),P.setAttribute("text-anchor","end"),P.setAttribute("fill",H?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),P.setAttribute("font-size","9"),P.setAttribute("font-family",'"Montserrat", sans-serif'),P.setAttribute("font-weight","500"),P.setAttribute("font-variant-numeric","tabular-nums lining-nums"),P.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),P.setAttribute("letter-spacing","0"),P.setAttribute("transform",`rotate(-45 ${_.toFixed(1)} ${b})`),P.textContent=B,l.appendChild(P)}return l}function ts(t,e,o,a){let n=document.createElementNS(t,e);for(let r in o)n.setAttribute(r,o[r]);return a!=null&&(n.textContent=a),n}function mr(t){t.innerHTML="";let e=[{code:5,...We[5]},{code:6,...We[6]},{code:0,...We[0]},{code:1,...We[1]},{code:7,...We[7]},{code:2,...We[2]}];for(let a of e){let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+a.color+'"></span>'+(a.labelKey?d(a.labelKey):""),t.appendChild(n)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+br+'"></span>'+d("overview.timeline.preheatAbsorption"),t.appendChild(o)}var jl=O({tag:"zone-state-timeline",render:Qn,onMount(t,e){let o=e.querySelector(".tl-body"),a=e.querySelector(".timeline-legend");mr(a);function n(){let r=D("zoneStateHistory"),s=(()=>{let p=D&&D("zoneStateHistory");return p&&p.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!r||!r.entries||r.entries.length===0){let p=document.createElement("div");p.className="timeline-empty",p.textContent=d("overview.timeline.noHistory"),o.appendChild(p);return}let c=es(r,s);c&&o.appendChild(c)}U("zoneStateHistory",n),U("zoneNames",n),k(i.drivers,n);for(let r=1;r<=ye;r++)k(h.enabled(r),n),k(h.state(r),n),k(h.temp(r),n),k(h.setpoint(r),n),k(h.preheatAdvance(r),n);E(e),n()}});var os=`
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
`;I("zone-grid",os);var as=()=>'<div class="zone-grid" aria-label="Zones"></div>',Wl=O({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:as,onMount(t,e){for(let o=1;o<=6;o++)e.appendChild(Q("zone-card",{zone:o,selection:t.selection,navigate:t.navigate}))}});var rs=`
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
`;I("zone-card",rs);var ns=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="${Se(t.zone).replace(/"/g,"&quot;")}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${Oe(t.zone)}</div>
		<div class="zc-friendly"${pt(t.zone)?" hidden":""}>${pt(t.zone)?"":"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,tc=O({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:ns,onMount(t,e){let o=t.zone,a=h.temp(o),n=h.state(o),r=h.enabled(o),s=e.querySelector(".zc-state-label"),c=e.querySelector(".zc-zone-name"),p=e.querySelector(".zc-friendly"),u=e.querySelector(".zc-temp"),l=e.querySelector(".zc-target"),m=e.querySelector(".zc-valve-value");function g(){var R;let b=ce(r),w=String(L(n)||"").toUpperCase()||"OFF",v=String(L(h.motorLastFault(o))||"").toUpperCase(),y=v&&v!=="NONE"&&v!=="OK",T=b&&(w==="FAULT"||y)?"FAULT":w,S=t.selection&&D("selectedZone")===o,M=pt(o);c.innerHTML=Oe(o),p.textContent=M?"":"---",p.hidden=!!M,e.setAttribute("aria-label",Se(o)),u.textContent=ue(C(a)),l.textContent=d("zone.card.setpoint",{value:ue((R=C(h.effectiveSetpoint(o)))!=null?R:C(h.setpoint(o)))}),m.textContent=mt(C(h.valve(o)));let _=b?T:"OFF";s.textContent=_==="HEATING"?d("state.heating"):_==="IDLE"?d("state.idle"):_==="FAULT"?d("common.fault"):_==="MANUAL"?d("state.manual"):_==="OVERHEATED"?d("state.overheated"):_==="CALIBRATING"?d("state.calibrating"):d("state.off"),e.title=y?d("zone.card.fault",{fault:v}):"",e.classList.toggle("active",S),S?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${c.textContent}, ${u.textContent}, ${l.textContent}, ${s.textContent}. Open details.`),e.classList.toggle("disabled",!b),e.classList.toggle("zs-heating",b&&_==="HEATING"),e.classList.toggle("zs-fault",b&&_==="FAULT"),e.classList.toggle("zs-idle",b&&_==="IDLE"),e.classList.toggle("zs-off",!b||_==="OFF")}function f(){Vt(o),t.navigate&&Pe("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:o}}))}e.addEventListener("click",f),k(a,g),k(h.setpoint(o),g),k(h.effectiveSetpoint(o),g),k(h.valve(o),g),k(n,g),k(r,g),k(h.motorLastFault(o),g),U("selectedZone",g),U("zoneNames",g),g()}});var ss=`
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
`;I("zone-detail",ss);var is=t=>`
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
`,hr=5,vr=35,bo=.5;function ht(t){return t==null||Number.isNaN(Number(t))?"":(Math.round(Number(t)*10)/10).toFixed(1)}function ls(t){if(t==null)return null;let e=String(t).trim().replace(",",".").replace(/[^\d.+-]/g,"");if(!e)return null;let o=Number(e);if(!Number.isFinite(o))return null;let a=Math.round(o/bo)*bo;return Math.min(vr,Math.max(hr,Number(a.toFixed(1))))}function cs(t){let e=Number(C(h.setpoint(t)));return Number.isFinite(e)?e:null}function go(t){let e=Number(C(h.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function Ke(t){let e=Number(C(h.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let o=cs(t);return o==null?null:Number((o+go(t)).toFixed(1))}function Et(t){return Math.min(vr,Math.max(hr,Number(Number(t).toFixed(1))))}function ds(t,e){if(!e)return d("common.disabled");let o=String(t||"IDLE").toUpperCase();return o==="HEATING"?d("state.heating"):o==="IDLE"?d("state.idle"):o==="OFF"?d("state.off"):o==="FAULT"?d("common.fault"):o==="MANUAL"?d("state.manual"):o==="OVERHEATED"?d("state.overheated"):o==="CALIBRATING"?d("state.calibrating"):o}var dc=O({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:is,methods:{update(t,e){var p;let o=D("selectedZone"),a=String(L(h.state(o))||"").toUpperCase(),n=ce(h.enabled(o));this.zone=o,t.dataset.zone=String(o),document.activeElement!==e.setpoint&&(e.setpoint.value=ht(Ke(o))),e.base.textContent=ue((p=C(h.baseSetpoint(o)))!=null?p:C(h.setpoint(o)));let r=C(h.coordinatorOffset(o));e.offset.textContent=r==null?"---":(r>0?"+":"")+Number(r).toFixed(1)+"\xB0C",e.temp.textContent=ue(C(h.temp(o))),e.ret.textContent=ue(C("sensor-manifold_return_temperature")),e.valve.textContent=mt(C(h.valve(o)));let s=e.badge;s.textContent=ds(a,n);let c=n?a==="HEATING"?"badge-heating":a==="IDLE"?"badge-idle":a==="FAULT"?"badge-fault":"":"badge-disabled";s.className="zd-badge"+(c?" "+c:""),e.toggle.classList.toggle("on",n)},commitSetpoint(t){let e=this.zone,o=ls(t);if(o==null)return null;let a=Et(o-go(e));return Jt(e,a),Ke(e)},incSetpoint(){let t=this.zone,e=Ke(t),o=Et((e==null?20:e)+bo);Jt(t,Et(o-go(t)))},decSetpoint(){let t=this.zone,e=Ke(t),o=Et((e==null?20:e)-bo);Jt(t,Et(o-go(t)))},toggleEnabled(){let t=this.zone,e=ce(h.enabled(t));_a(t,!e)}},onMount(t,e){let o={setpoint:e.querySelector(".zd-setpoint"),temp:e.querySelector(".zd-temp"),base:e.querySelector(".zd-base"),offset:e.querySelector(".zd-offset"),ret:e.querySelector(".zd-ret"),valve:e.querySelector(".zd-valve"),badge:e.querySelector(".zd-badge"),toggle:e.querySelector(".btn-toggle"),inc:e.querySelector(".btn-inc"),dec:e.querySelector(".btn-dec")};o.inc.onclick=()=>t.incSetpoint(),o.dec.onclick=()=>t.decSetpoint(),o.toggle.onclick=()=>t.toggleEnabled();let a=()=>{let s=t.commitSetpoint(o.setpoint.value);o.setpoint.value=s!=null?ht(s):ht(Ke(t.zone))};o.setpoint.addEventListener("keydown",s=>{s.key==="Enter"?(s.preventDefault(),o.setpoint.blur()):s.key==="Escape"?(s.preventDefault(),o.setpoint.value=ht(Ke(t.zone)),o.setpoint.blur()):s.key==="ArrowUp"?(s.preventDefault(),t.incSetpoint(),o.setpoint.value=ht(Ke(t.zone))):s.key==="ArrowDown"&&(s.preventDefault(),t.decSetpoint(),o.setpoint.value=ht(Ke(t.zone)))}),o.setpoint.addEventListener("blur",a),o.setpoint.addEventListener("focus",()=>{requestAnimationFrame(()=>o.setpoint.select())});let n=()=>t.update(e,o),r=s=>{let c=D("selectedZone");(s===h.temp(c)||s===h.setpoint(c)||s===h.baseSetpoint(c)||s===h.effectiveSetpoint(c)||s===h.coordinatorOffset(c)||s===h.valve(c)||s===h.state(c)||s===h.enabled(c))&&n()};for(let s=1;s<=6;s++)k(h.temp(s),r),k(h.setpoint(s),r),k(h.baseSetpoint(s),r),k(h.effectiveSetpoint(s),r),k(h.coordinatorOffset(s),r),k(h.valve(s),r),k(h.state(s),r),k(h.enabled(s),r);k("sensor-manifold_return_temperature",n),U("selectedZone",n),E(e),n()}});var ps=`
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
.zone-sensor-card .ble-row .ble-input:focus {
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
`;I("zone-sensor-card",ps);var us=()=>`
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
    </div>
  `;function ms(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":"Local Probe"}function gs(t){return t==="BLE Sensor"?"BLE":"Local Probe"}function xr(t,e){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+d("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+d("zone.sensor.bleSource")+"</option>";t.innerHTML!==o&&(t.innerHTML=o),t.value=e}var xc=O({tag:"zone-sensor-card",render:us,onMount(t,e){let o=e.querySelector(".zs-source"),a=e.querySelector(".zs-ble"),n=e.querySelector(".zs-row-ble"),r=e.querySelector(".zs-scan"),s=e.querySelector(".zs-scan-list"),c=0;function p(){return D("selectedZone")}function u(){n.style.display=o.value==="BLE Sensor"?"":"none"}let l=xe(e);xr(o,"Local Probe"),l.select(o,{read:()=>ms(String(L(h.tempSource(p()))||"")),commit:b=>Ve(p(),"zone_temp_source",gs(b))});let m=l.text(a,{read:()=>L(h.ble(p()))||"",commit:b=>Ro(p(),"zone_ble_mac",b)});o.addEventListener("change",u);function g(){let b=p();c!==b?(c=b,s.style.display="none",l.discard()):l.refresh(),u()}function f(b){let w=p();(b===h.tempSource(w)||b===h.ble(w))&&(l.refresh(),u())}r.addEventListener("click",()=>{if(r.disabled)return;r.disabled=!0,r.textContent="\u2026",s.style.display="",s.innerHTML='<div class="scan-msg">'+d("zone.sensor.scanning")+"</div>";let b=new AbortController,w=setTimeout(()=>b.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:b.signal}).then(v=>{if(!v.ok)throw new Error("HTTP "+v.status);return v.json()}).then(v=>{if(clearTimeout(w),r.disabled=!1,r.textContent=d("zone.sensor.scan"),!v.ok||!v.sensors||v.sensors.length===0){s.innerHTML='<div class="scan-msg">'+d("zone.sensor.noSensors")+"</div>";return}let y=p(),T=(L(h.ble(y))||"").toUpperCase(),S=_=>String(_).replace(/[&<>"']/g,R=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[R]),M="";for(let _ of v.sensors){let R=_.mac.toUpperCase(),B=_.name?S(_.name):"",H=_.temp_c!=null?_.temp_c.toFixed(1)+"\xB0C":"\u2014",P=_.rssi!=null?_.rssi+" dBm":"",X=_.age_s<60?d("common.secondsAgo",{value:_.age_s}):d("common.minutesAgo",{value:Math.round(_.age_s/60)}),te="";R===T?te='<span class="ble-badge">'+d("zone.sensor.assignedThisZone")+"</span>":_.zone>0&&(te='<span class="ble-badge">'+d("zone.sensor.zoneBadge",{zone:_.zone})+"</span>");let $=B?`<div class="ble-mac">${B}</div><div class="ble-meta">${R}</div>`:`<div class="ble-mac">${R}</div>`;M+=`<div class="ble-scan-item">
              <div>
                ${$}
                <div class="ble-meta">${H} &nbsp;${P} &nbsp;${X}</div>
                ${te}
              </div>
              <button class="btn-assign" data-mac="${R}">${d("zone.sensor.assign")}</button>
            </div>`}s.innerHTML=M,s.querySelectorAll(".btn-assign").forEach(_=>{_.addEventListener("click",()=>{a.value=_.dataset.mac,m.markDirty(),s.style.display="none"})})}).catch(v=>{clearTimeout(w),r.disabled=!1,r.textContent=d("zone.sensor.scan");let y=v&&v.name==="AbortError"?d("zone.sensor.scanTimeout"):d("zone.sensor.scanFailed");s.innerHTML='<div class="scan-msg">'+y+"</div>"})}),U("selectedZone",g);for(let b=1;b<=6;b++)k(h.tempSource(b),f),k(h.ble(b),f);E(e),g()}});var bs=".zone-coordination-card { height: 100%; }";I("zone-coordination-card",bs);var fs=()=>`
  <div class="ui-card zone-coordination-card">
    <div class="ui-card-title" data-i18n="zone.coordination.title">Coordination</div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="zone.sensor.mergeWith">Merge With Zone</span> <span class="ui-sublabel" data-i18n="zone.sensor.mergeHelp">merge into one room - mean temperature, valves open equally</span></span>
      <span class="ui-field"><select class="ui-select zc-sync"></select></span>
    </div>
  </div>
`;function yr(t,e){let o=t.value,a='<option value="None" data-i18n="common.none">'+d("common.none")+"</option>";for(let n=1;n<=6;n++)n!==e&&(a+='<option value="Zone '+n+'">'+d("common.zone")+" "+n+"</option>");t.innerHTML=a,t.value=o||"None"}var Mc=O({tag:"zone-coordination-card",render:fs,onMount(t,e){let o=e.querySelector(".zc-sync"),a=0;function n(){return D("selectedZone")}let r=xe(e);r.select(o,{read:()=>L(h.syncTo(n()))||"None",commit:p=>Ve(n(),"zone_sync_to",p)});function s(){let p=n();a!==p?(yr(o,p),a=p,r.discard()):r.refresh()}function c(p){let u=n();(p===h.syncTo(u)||/^select-zone_\d+_sync_to$/.test(p))&&r.refresh()}U("selectedZone",s);for(let p=1;p<=6;p++)k(h.syncTo(p),c);E(e),s()}});var hs=".zone-room-card { height: 100%; }";I("zone-room-card",hs);var vs=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,Pc=O({tag:"zone-room-card",render:vs,onMount(t,e){let o=e.querySelector(".zr-friendly");function a(){return D("selectedZone")}let n=xe(e);n.text(o,{read:()=>kt(a())||"",commit:r=>Aa(a(),r)}),U("selectedZone",n.discard),U("zoneNames",n.refresh),E(e),n.refresh()}});var xs=`
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
`;I("zone-actuator-card",xs);function wr(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function kr(t){return t!=null?Number(t).toFixed(0):"---"}function ys(t){return t!=null?Number(t).toFixed(2)+"C":"---"}var ws=()=>`
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
`,Vc=O({tag:"zone-actuator-card",render:ws,onMount(t,e){var p,u,l;let o=Number(D("selectedZone")||1),a={orip:e.querySelector(".za-orip"),crip:e.querySelector(".za-crip"),ofac:e.querySelector(".za-ofac"),cfac:e.querySelector(".za-cfac"),ph:e.querySelector(".za-ph"),fault:e.querySelector(".za-fault"),faultVal:e.querySelector(".za-fault-val"),faultBtn:e.querySelector(".recovery-fault-btn"),factorsBtn:e.querySelector(".recovery-factors-btn"),relearnBtn:e.querySelector(".recovery-relearn-btn"),status:e.querySelector(".za-status")};function n(){o=Number(D("selectedZone")||1),a.orip.textContent=kr(C(h.motorOpenRipples(o))),a.crip.textContent=kr(C(h.motorCloseRipples(o))),a.ofac.textContent=wr(C(h.motorOpenFactor(o))),a.cfac.textContent=wr(C(h.motorCloseFactor(o))),a.ph.textContent=ys(C(h.preheatAdvance(o)));let m=String(L(h.motorLastFault(o))||"").toUpperCase(),g=m&&m!=="NONE"&&m!=="OK";a.fault.hidden=!g,g&&(a.faultVal.textContent=m)}let r=null;function s(m,g){a.status.textContent=m,a.status.className="za-status show "+(g?"ok":"err"),clearTimeout(r),r=setTimeout(()=>{a.status.classList.remove("show")},4e3)}function c(m,g){let f=m(o);s(g,!0),f&&typeof f.then=="function"&&f.then(b=>{b&&b.ok===!1&&s(d("diagnostics.recovery.rejected"),!1)}).catch(()=>s(d("diagnostics.recovery.unreachable"),!1))}(p=a.faultBtn)==null||p.addEventListener("click",()=>{c(Da,"\u2713 "+d("diagnostics.recovery.faultSent",{zone:Se(o)}))}),(u=a.factorsBtn)==null||u.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmFactors",{zone:Se(o)}))&&c(Ra,"\u2713 "+d("diagnostics.recovery.factorsReset",{zone:Se(o)}))}),(l=a.relearnBtn)==null||l.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmRelearn",{zone:Se(o)}))&&c(Pa,"\u2713 "+d("diagnostics.recovery.relearnStarted",{zone:Se(o)}))}),U("selectedZone",n);for(let m=1;m<=6;m++)k(h.motorOpenRipples(m),n),k(h.motorCloseRipples(m),n),k(h.motorOpenFactor(m),n),k(h.motorCloseFactor(m),n),k(h.preheatAdvance(m),n),k(h.motorLastFault(m),n);E(e),n()}});var De=6,ks="var(--flow-disabled)",Sr="var(--flow-unknown)",_r="var(--accent)",Ft="var(--flow-return)",Go="var(--text-strong)",zs="var(--flow-disabled)",rt="var(--flow-label)",fo="var(--flow-disabled)",Ko="var(--flow-label)",Cr="var(--flow-label)",zr="var(--flow-return)",Ss="#66BB6A",_s="#FF6361",ee={w:1160,h:372,boxX:440,boxY:26,boxW:280,boxH:90,srcY:116,fanY:168,zoneY:262,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},Z={w:760,h:424,boxX:26,boxY:148,boxW:168,boxH:92,srcX:196,endX:386,nameX:446,midY:190,zoneYs:[56,120,184,248,312,376],spread:10,bgDstHW:15,srcHW:4},Cs=`
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
`;I("flow-diagram",Cs);function Ls(t,e){let o=String(kt(t)||"").trim();if(!o)return"";let a=o.toUpperCase();return a.length>e?a.slice(0,Math.max(1,e-1))+"\u2026":a}function Ms(t){if(!t)return null;let e=String(t).match(/(\d+)/);if(!e)return null;let o=Number(e[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function As(t,e){return e?t==null||Number.isNaN(t)?Sr:t>0?_r:rt:ks}function Lr(t){let e=t==="desktop"?"0 1":"1 0",o=[];o.push("<defs>");for(let a=1;a<=De;a++)o.push('<linearGradient id="'+t+"-rg"+a+'" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'">'),o.push('<stop id="'+t+"-rgs"+a+'" offset="0%" stop-color="var(--accent)" stop-opacity=".96"/>'),o.push('<stop id="'+t+"-rga"+a+'" offset="100%" stop-color="var(--accent)" stop-opacity=".7"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function Es(t){let e=ee.boxX+ee.boxW/2+(t-2.5)*ee.srcSpread,o=ee.zoneXs[t];return"M"+e.toFixed(1)+" "+ee.srcY+" C"+e.toFixed(1)+" "+ee.fanY+" "+o.toFixed(1)+" "+(ee.fanY+34)+" "+o.toFixed(1)+" "+(ee.zoneY-20)}function Fs(t){let e=Z.midY+(t-2.5)*Z.spread,o=Z.zoneYs[t],a=Z.endX-Z.srcX;return"M"+Z.srcX+" "+e.toFixed(1)+" C"+(Z.srcX+a*.34)+" "+e.toFixed(1)+" "+(Z.srcX+a*.7)+" "+o.toFixed(1)+" "+Z.endX+" "+o.toFixed(1)}function Mr(t,e,o){let a=ee.boxX+ee.boxW/2+(t-2.5)*ee.srcSpread,n=ee.srcY,r=ee.zoneXs[t],s=ee.zoneY-20,c=ee.fanY,p=ee.fanY+34;return"M"+(a-e).toFixed(1)+" "+n+" C"+(a-e).toFixed(1)+" "+c+" "+(r-o).toFixed(1)+" "+p+" "+(r-o).toFixed(1)+" "+s+" L"+(r+o).toFixed(1)+" "+s+" C"+(r+o).toFixed(1)+" "+p+" "+(a+e).toFixed(1)+" "+c+" "+(a+e).toFixed(1)+" "+n+"Z"}function Ar(t,e,o){let a=Z.midY+(t-2.5)*Z.spread,n=Z.zoneYs[t],r=Z.endX-Z.srcX,s=Z.srcX+r*.34,c=Z.srcX+r*.7;return"M"+Z.srcX+" "+(a-e).toFixed(1)+" C"+s+" "+(a-e).toFixed(1)+" "+c+" "+(n-o).toFixed(1)+" "+Z.endX+" "+(n-o).toFixed(1)+" L"+Z.endX+" "+(n+o).toFixed(1)+" C"+c+" "+(n+o).toFixed(1)+" "+s+" "+(a+e).toFixed(1)+" "+Z.srcX+" "+(a+e).toFixed(1)+"Z"}function Er(t,e,o){return'<rect width="'+t+'" height="'+e+'" rx="10" fill="var(--surface-raised)"/>'}function Fr(t){let e=t==="desktop"?ee:Z,o=t==="desktop"?e.boxY+34:e.boxY+36,a=t==="desktop"?e.boxY+74:e.boxY+76;return'<rect x="'+e.boxX+'" y="'+e.boxY+'" width="'+e.boxW+'" height="'+e.boxH+'" rx="7" fill="var(--flow-source-bg)" stroke="var(--accent)" stroke-width="2"/><text id="'+t+'-fd-flow-label" x="'+(e.boxX+e.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(t==="desktop"?28:27)+'" font-weight="800" fill="var(--accent)" letter-spacing="2">'+d("overview.flowDiagram.flow")+'</text><text id="'+t+'-fd-flow-temp" class="flow-metric" x="'+(e.boxX+e.boxW/2)+'" y="'+a+'" text-anchor="middle" font-size="'+(t==="desktop"?40:37)+'" fill="var(--text-strong)">---</text>'}function Ts(){let t=[],e=ee.w,o=ee.h,a=ee.zoneY-20;t.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+e+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(Lr("desktop")),t.push(Er(e,o,"desktop")),t.push(Fr("desktop")),t.push('<text id="desktop-fd-ret-temp" x="'+(ee.boxX+ee.boxW+24)+'" y="'+(ee.boxY+28)+'" font-size="24" font-weight="800" fill="'+Ft+'" font-family="var(--mono)">'+d("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="desktop-fd-dt-label" x="'+(ee.boxX+ee.boxW+24)+'" y="'+(ee.boxY+54)+'" font-size="19" font-weight="800" fill="'+Cr+'" letter-spacing="1.4">'+d("overview.flowDiagram.dt")+"</text>"),t.push('<text id="desktop-fd-dt" x="'+(ee.boxX+ee.boxW+24)+'" y="'+(ee.boxY+86)+'" class="flow-metric" font-size="34" fill="var(--accent)">---</text>');for(let n=1;n<=De;n++)t.push('<path id="desktop-fd-track-'+n+'" class="flow-track" d="'+Es(n-1)+'" opacity=".7"/>');for(let n=1;n<=De;n++)t.push('<path id="desktop-fd-path-'+n+'" class="flow-ribbon" d="'+Mr(n-1,ee.srcHW,ee.bgDstHW)+'" fill="url(#desktop-rg'+n+')" opacity="1"/>');t.push('<line x1="54" y1="'+a+'" x2="'+(e-54)+'" y2="'+a+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');for(let n=1;n<=De;n++){let r=ee.zoneXs[n-1];t.push('<g class="flow-zone-hit">'),t.push('<line id="desktop-fd-tick-'+n+'" x1="'+r+'" y1="'+(a-10)+'" x2="'+r+'" y2="'+(a+10)+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="desktop-fd-zn'+n+'" x="'+r+'" y="'+(a-18)+'" text-anchor="middle" font-size="22" fill="'+Go+'" font-weight="800" letter-spacing="1.5">Z'+n+"</text>"),t.push('<text id="desktop-fd-zf'+n+'" x="'+r+'" y="'+(a+30)+'" text-anchor="middle" font-size="17.5" fill="'+rt+'" font-weight="700" letter-spacing=".35">---</text>'),t.push('<text id="desktop-fd-zsp'+n+'" x="'+r+'" y="'+(a+30)+'" text-anchor="middle" font-size="15.5" fill="'+fo+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="desktop-fd-zt'+n+'" x="'+r+'" y="'+(a+60)+'" text-anchor="middle" class="flow-metric" font-size="24" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="desktop-fd-zv'+n+'" x="'+(r-40)+'" y="'+(a+90)+'" text-anchor="middle" class="flow-metric" font-size="20" fill="'+rt+'">---%</text>'),t.push('<text id="desktop-fd-zr'+n+'" x="'+(r+40)+'" y="'+(a+90)+'" text-anchor="middle" class="flow-metric" font-size="20" fill="'+Ft+'">---</text>'),t.push("</g>")}return t.push("</svg>"),t.join("")}function Ns(){let t=[],e=Z.w,o=Z.h;t.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+e+" "+o+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(Lr("mobile")),t.push(Er(e,o,"mobile")),t.push(Fr("mobile"));for(let a=1;a<=De;a++)t.push('<path id="mobile-fd-track-'+a+'" class="flow-track" d="'+Fs(a-1)+'" opacity=".7"/>');for(let a=1;a<=De;a++)t.push('<path id="mobile-fd-path-'+a+'" class="flow-ribbon" d="'+Ar(a-1,Z.srcHW,Z.bgDstHW)+'" fill="url(#mobile-rg'+a+')" opacity="1"/>');t.push('<rect x="'+(Z.boxX+6)+'" y="'+(Z.boxY+Z.boxH+10)+'" width="'+(Z.boxW-12)+'" height="84" rx="8" fill="var(--flow-source-bg)" stroke="var(--flow-return)" stroke-opacity=".7"/>'),t.push('<text id="mobile-fd-ret-temp" x="'+(Z.boxX+Z.boxW/2)+'" y="'+(Z.boxY+Z.boxH+36)+'" text-anchor="middle" font-size="21" font-weight="800" fill="'+Ft+'" font-family="var(--mono)">'+d("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="mobile-fd-dt-label" x="'+(Z.boxX+Z.boxW/2)+'" y="'+(Z.boxY+Z.boxH+56)+'" text-anchor="middle" font-size="15.5" font-weight="800" fill="'+Cr+'" letter-spacing=".7">'+d("overview.flowDiagram.dt")+"</text>"),t.push('<text id="mobile-fd-dt" x="'+(Z.boxX+Z.boxW/2)+'" y="'+(Z.boxY+Z.boxH+82)+'" text-anchor="middle" class="flow-metric" font-size="27" fill="var(--accent)">---</text>'),t.push('<line x1="'+Z.endX+'" y1="38" x2="'+Z.endX+'" y2="'+(o-28)+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>'),t.push('<text id="mobile-fd-temp-head" x="506" y="34" font-size="17" fill="'+Ko+'" font-weight="700" letter-spacing="1">'+d("overview.graph.layers.temp").toUpperCase()+"</text>"),t.push('<text id="mobile-fd-flow-head" x="592" y="34" font-size="17" fill="'+Ko+'" font-weight="700" letter-spacing="1">'+d("overview.flowDiagram.flow")+"</text>"),t.push('<text id="mobile-fd-ret-head" x="678" y="34" font-size="17" fill="'+Ko+'" font-weight="700" letter-spacing="1">'+d("overview.flowDiagram.returnShort")+"</text>");for(let a=1;a<=De;a++){let n=Z.zoneYs[a-1];t.push('<line id="mobile-fd-tick-'+a+'" x1="'+(Z.endX-10)+'" y1="'+n+'" x2="'+(Z.endX+10)+'" y2="'+n+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="mobile-fd-zn'+a+'" x="'+(Z.endX-14)+'" y="'+(n+7)+'" text-anchor="end" font-size="21" fill="'+Go+'" font-weight="800" letter-spacing="1.1">Z'+a+"</text>"),t.push('<text id="mobile-fd-zf'+a+'" x="'+Z.nameX+'" y="'+(n-12)+'" text-anchor="middle" font-size="17" fill="'+rt+'" font-weight="700" letter-spacing=".3">---</text>'),t.push('<text id="mobile-fd-zsp'+a+'" x="'+Z.nameX+'" y="'+(n+12)+'" text-anchor="middle" font-size="15.5" fill="'+fo+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="mobile-fd-zt'+a+'" x="506" y="'+(n+7)+'" class="flow-metric" font-size="22" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="mobile-fd-zv'+a+'" x="592" y="'+(n+7)+'" class="flow-metric" font-size="22" fill="'+rt+'">---%</text>'),t.push('<text id="mobile-fd-zr'+a+'" x="678" y="'+(n+7)+'" class="flow-metric" font-size="22" fill="'+Ft+'">---</text>')}return t.push("</svg>"),t.join("")}var Ds=()=>'<div class="flow-wrap" role="img" aria-label="'+d("overview.flowDiagram.flow")+'">'+Ts()+Ns()+"</div>";O({tag:"flow-diagram",render:Ds,onMount(t,e){let o=["desktop","mobile"],a={};o.forEach(u=>{a[u]={flowEl:e.querySelector("#"+u+"-fd-flow-temp"),flowLabelEl:e.querySelector("#"+u+"-fd-flow-label"),retEl:e.querySelector("#"+u+"-fd-ret-temp"),dtLabelEl:e.querySelector("#"+u+"-fd-dt-label"),dtEl:e.querySelector("#"+u+"-fd-dt"),zones:new Array(De+1)};for(let l=1;l<=De;l++)a[u].zones[l]={textTemp:e.querySelector("#"+u+"-fd-zt"+l),textSetpoint:e.querySelector("#"+u+"-fd-zsp"+l),textFlow:e.querySelector("#"+u+"-fd-zv"+l),textRet:e.querySelector("#"+u+"-fd-zr"+l),label:e.querySelector("#"+u+"-fd-zn"+l),friendly:e.querySelector("#"+u+"-fd-zf"+l),track:e.querySelector("#"+u+"-fd-track-"+l),tick:e.querySelector("#"+u+"-fd-tick-"+l),path:e.querySelector("#"+u+"-fd-path-"+l)}});function n(u,l){u&&(u.textContent=l)}function r(u,l,m,g,f){let b=a[u];n(b.flowLabelEl,d("overview.flowDiagram.flow")),n(b.flowEl,ue(l)),n(b.retEl,d("overview.flowDiagram.returnShort")+" "+ue(m)),n(b.dtLabelEl,d("overview.flowDiagram.dt")),n(b.dtEl,g==null?"---":g.toFixed(1)+"\xB0C"),b.dtEl&&b.dtEl.setAttribute("fill",f)}function s(){n(e.querySelector("#mobile-fd-temp-head"),d("overview.graph.layers.temp").toUpperCase()),n(e.querySelector("#mobile-fd-flow-head"),d("overview.flowDiagram.flow")),n(e.querySelector("#mobile-fd-ret-head"),d("overview.flowDiagram.returnShort"))}function c(u,l,m){let g=a[u].zones[l];if(!g)return;let{enabled:f,pct:b,temp:w,setpoint:v,valve:y,returnTemp:T,hasReturn:S}=m,M=Ls(l,u==="desktop"?12:11),_=ue(w),R=v!=null?ue(v):"";n(g.label,"Z"+l),n(g.friendly,u==="desktop"?(M||"---")+(R?" ("+R+")":""):M||"---"),n(g.textTemp,_),n(g.textSetpoint,u==="desktop"?"":R?"("+R+")":""),n(g.textFlow,mt(y)),n(g.textRet,S?ue(T):"---"),g.label.setAttribute("fill",f?Go:zs),g.friendly.setAttribute("fill",f?rt:fo),g.textSetpoint.setAttribute("fill",f?rt:fo),g.textFlow.setAttribute("fill",As(b,f)),g.textRet.setAttribute("fill",S&&f?Ft:Sr);let B=f&&b!=null&&b>0;g.track.setAttribute("opacity",f?".78":".38"),g.track.setAttribute("stroke-dasharray",f?"none":"5 7"),g.tick.setAttribute("stroke",B?_r:"var(--flow-track)"),g.tick.setAttribute("stroke-width",B?"3":"2");let H=g.path;if(!B)H.setAttribute("opacity","0");else{let P=u==="desktop"?ee:Z,X=Math.max(2.5,b*P.bgDstHW),te=Math.max(1.3,b*P.srcHW);H.setAttribute("d",u==="desktop"?Mr(l-1,te,X):Ar(l-1,te,X)),H.setAttribute("fill","url(#"+u+"-rg"+l+")"),H.setAttribute("opacity",".96")}}function p(){let u=C(i.flow),l=C(i.ret),m=u!=null&&l!=null?Number(u)-Number(l):null,g=m==null||m<3?zr:m>8?_s:Ss;o.forEach(f=>r(f,u,l,m,g));for(let f=1;f<=De;f++){let b=C(h.temp(f)),w=C(h.setpoint(f)),v=C(h.valve(f)),y=ce(h.enabled(f)),T=String(L(h.tempSource(f))||"Local Probe"),S=Ms(L(h.probe(f))||""),M=S?C(h.probeTemp(S)):null,_=T!=="Local Probe"&&M!=null&&!Number.isNaN(Number(M)),R=v!=null?Math.max(0,Math.min(100,Number(v)))/100:null,B={enabled:y,pct:R,temp:b,setpoint:w,valve:v,returnTemp:M,hasReturn:_};o.forEach(H=>c(H,f,B))}}k(i.flow,p),k(i.ret,p),U("zoneNames",p);for(let u=1;u<=De;u++)k(h.temp(u),p),k(h.setpoint(u),p),k(h.valve(u),p),k(h.enabled(u),p),k(h.probe(u),p),k(h.tempSource(u),p);for(let u=1;u<=8;u++)k(h.probeTemp(u),p);s(),p()}});var Rs={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},Ps=`
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
`;I("logs-view",Ps);var Os=()=>`
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
`;function Is(t){let e=Rs[t.level]||{label:"?",color:"var(--text-secondary)"},o=Tr(t.tag||""),a=Tr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+o+'</span><span class="msg">'+a+"</span></div>"}function Tr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var ad=O({tag:"logs-view",render:Os,onMount(t,e){let o=e.querySelector(".logs-stream"),a=e.querySelector(".pause-btn"),n=e.querySelector(".clear-btn"),r=e.querySelector(".download-btn"),s=!1;function c(){if(s)return;let p=Kt();if(!p||!p.length){o.innerHTML='<div class="logs-empty">'+d("logs.waiting")+"</div>";return}let u=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=p.map(Is).join(""),u&&(o.scrollTop=o.scrollHeight)}a.addEventListener("click",()=>{s=!s,a.textContent=s?d("logs.resume"):d("logs.pause"),a.classList.toggle("on",s),s||c()}),n.addEventListener("click",()=>{da()}),r.addEventListener("click",()=>{r.disabled=!0,Ua().catch(p=>{console.error("[Logs] download failed:",p),window.alert(d("logs.downloadFailed"))}).finally(()=>{r.disabled=!1})}),U("deviceLog",c),E(e),c()}});var qs=`
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
}`;I("diag-i2c",qs);var Hs=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,dd=O({tag:"diag-i2c",render:Hs,onMount(t,e){let o=e.querySelector("#i2c-result");function a(){o.textContent=D("i2cResult")||d("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Ca()}),U("i2cResult",a),E(e),a()}});var Bs=`
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
`;I("diag-manual-badge",Bs);var $s=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,fd=O({tag:"diag-manual-badge",render:$s,onMount(t,e){let o=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function a(){let n=!!D("manualMode");o&&o.classList.toggle("on",n)}U("manualMode",a),E(e),a()}});var js=`
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
`;I("diag-zone-motor",js);var Vs=t=>{let e=t.zone||D("selectedZone")||1,o="";for(let a=1;a<=6;a++)o+='<option value="'+a+'"'+(a===e?" selected":"")+">"+d("common.zone")+" "+a+"</option>";return`
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
  `},Sd=O({tag:"diag-zone-motor-card",render:Vs,onMount(t,e){let o=Number(t.zone||D("selectedZone")||1),a=!!D("manualMode"),n=e.querySelector(".manual-mode-toggle"),r=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),c=e.querySelector(".motor-target-input"),p=e.querySelector(".motor-open-btn"),u=e.querySelector(".motor-close-btn"),l=e.querySelector(".motor-stop-btn"),m=()=>{let w=s.value||String(o),v="";for(let y=1;y<=6;y++)v+='<option value="'+y+'">'+d("common.zone")+" "+y+"</option>";s.innerHTML=v,s.value=w};function g(w){a=!!w,n&&(n.classList.toggle("on",a),n.setAttribute("aria-checked",a?"true":"false")),r&&r.classList.toggle("locked",!a),[s,c,p,u,l].forEach(v=>{v&&(v.disabled=!a)})}function f(){let w=!a;if(g(w),w){Ct(!0);for(let v=1;v<=6;v++)Po(v)}else Ct(!1)}function b(){let w=C(h.motorTarget(o));c&&w!=null?c.value=Number(w).toFixed(0):c&&(c.value="0")}s==null||s.addEventListener("change",()=>{o=Number(s.value||1),b()}),n==null||n.addEventListener("click",f),n==null||n.addEventListener("keydown",w=>{w.key!==" "&&w.key!=="Enter"||(w.preventDefault(),f())});for(let w=1;w<=6;w++)k(h.motorTarget(w),b);b(),g(a),U("manualMode",()=>{g(!!D("manualMode"))}),E(e),c==null||c.addEventListener("change",w=>{if(!a)return;let v=w.target.value;Ea(o,v)}),p==null||p.addEventListener("click",()=>{a&&Qt(o,1e4)}),u==null||u.addEventListener("click",()=>{a&&eo(o,1e4)}),l==null||l.addEventListener("click",()=>{a&&Po(o)})}});var Tt={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function Nt(t){switch(Number(t)){case Tt.CONTACT:return"contact";case Tt.UNDER_LOAD:return"load";case Tt.STOPPING:return"stopping";default:return"free"}}function Yo(t){let e=t||[];for(let o=0;o<e.length;o++){let a=Number(e[o].stroke_phase)||0;if(a===Tt.CONTACT||a===Tt.UNDER_LOAD)return e[o]}return null}function Ge(t,e,o){if(e[o]==null)return null;let a=Number(t[e[o]]);return Number.isFinite(a)?a:null}function Nr(t){let e=String(t||"").split(/\r?\n/).filter(r=>r.trim());if(e.length<2)return[];let o=e[0].split(",").map(r=>r.trim()),a={};for(let r=0;r<o.length;r++)a[o[r]]=r;let n=[];for(let r=1;r<e.length;r++){let s=e[r].split(",");if(s.length<6)continue;let c=p=>Number(s[a[p]]);n.push({t_ms:c("t_ms")||0,motion_count:c("motion_count")||0,current_ma:c("current_ma"),adc_current_raw:Ge(s,a,"adc_current_raw"),drive_on:c("drive_on")===1,direction_open:c("direction_open")===1,armed:c("armed")===1,stroke_phase:c("stroke_phase")||0,tacho_period_us:Ge(s,a,"tacho_period_us"),tacho_amp_raw:Ge(s,a,"tacho_amp_raw"),bemf_raw_a:Ge(s,a,"bemf_raw_a"),bemf_raw_b:Ge(s,a,"bemf_raw_b"),bemf_differential_raw:Ge(s,a,"bemf_differential_raw"),bemf_separation_us:Ge(s,a,"bemf_separation_us"),bemf_valid:a.bemf_valid!=null?c("bemf_valid")===1:null,bemf_moving:a.bemf_moving!=null?c("bemf_moving")===1:null,invalid_bemf_samples:Ge(s,a,"invalid_bemf_samples")})}return n}function Zs(t){let e=0,o=0;for(let a=0;a<t.length;a++)t[a].drive_on&&(t[a].direction_open?e+=1:o+=1);return e>=o?"open":"close"}function Us(t,e){if(!t.length)return null;let o=t.slice().sort((n,r)=>n-r),a=Math.min(o.length-1,Math.max(0,Math.round((o.length-1)*e)));return o[a]}function Ee(t){return Math.round(t*10)/10}function Xo(t,e,o){return Math.min(o,Math.max(e,t))}function Ws(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function Dr(t){let e=[];if(!t.length)return e;let o=t[0].t_ms,a=t[t.length-1].t_ms;for(let n=o;n+500<=a;n+=500){let r=t.reduce((p,u)=>Math.abs(u.t_ms-n)<Math.abs(p.t_ms-n)?u:p,t[0]),s=t.reduce((p,u)=>Math.abs(u.t_ms-(n+500))<Math.abs(p.t_ms-(n+500))?u:p,t[0]),c=(s.t_ms-r.t_ms)/1e3;c>.2&&e.push({t_ms:n+500,slope:(s.current_ma-r.current_ma)/c})}return e}function Dt(t){let e=t||[],o=[];for(let s=0;s<e.length;s++){let c=e[s],p=c.tacho_period_us!=null?c.tacho_period_us:c.tacho_cadence_us!=null?c.tacho_cadence_us:null;o.push({t_ms:c.t_ms,period_us:p,rate_hz:Ws(p)})}let a=e.filter(s=>s.drive_on&&Number.isFinite(s.current_ma)),n=a.length>=2?a:e.filter(s=>Number.isFinite(s.current_ma)),r=Dr(n);return{cadence:o,slopes:r,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function Rr(t,e){let o=e||Zs(t),a=t.filter(A=>A.drive_on&&Number.isFinite(A.current_ma)&&(o==="open"?A.direction_open:!A.direction_open));if(a.length<8)return{direction:o,ok:!1,reason:"too_few_samples"};let n=a[0].t_ms,r=a[a.length-1].t_ms,s=a.filter(A=>A.t_ms>=n+650),c=s.length>12?s:a,p=Math.max(1,r-(c[0]?c[0].t_ms:n)),u=c.filter(A=>A.t_ms<c[0].t_ms+p*.7),l=c.filter(A=>A.t_ms>=c[0].t_ms+p*.8),m=(u.length?u:c).map(A=>A.current_ma),g=(l.length?l:c.slice(-Math.max(4,c.length/8|0))).map(A=>A.current_ma),f=m.reduce((A,z)=>A+z,0)/m.length,b=Math.max(...a.map(A=>A.current_ma)),w=Math.max(...g),v=Math.max(0,a[a.length-1].motion_count-a[0].motion_count),y=Dr(c),T=y.filter(A=>A.t_ms<c[0].t_ms+p*.7).map(A=>A.slope),S=y.filter(A=>A.t_ms>=c[0].t_ms+p*.75).map(A=>A.slope),M=S.length?Math.max(...S):0,_=Us(T.map(Math.abs),.9)||0,R=o==="close"?.55:.68,B=f>.5?w/f:0,H=Ee(Xo(1+R*Math.max(0,B-1),1.25,2.4)),P=Ee(Xo(Math.max(_*2.2,M*.42,.4),.4,8)),X=Ee(Xo(1+.35*Math.max(0,B-1),1.15,1.8)),te=o==="open"?1.15:null,$=Yo(a);return{direction:o,ok:!0,start_ms:n,end_ms:r,runtime_ms:r-n,mean_ma:Ee(f),peak_ma:Ee(b),stall_peak_ma:Ee(w),ripples:v,max_stall_slope_ma_s:Ee(M),travel_slope_ma_s:Ee(_),measured_factor:Ee(B),suggested_factor:H,suggested_slope:P,suggested_slope_floor:X,suggested_ripple_limit:te,pin_seen:!!$,pin_t_ms:$?$.t_ms:null,pin_motion_count:$?$.motion_count:null,pin_current_ma:$?Ee($.current_ma):null,samples:a}}function Pr(t,e){if(!t||!t.ok)return[];let o=t.mean_ma,a=Number(e&&e.factor)||t.suggested_factor;return[{id:"mean",value:o},{id:"threshold",value:Ee(o*a)},{id:"suggested",value:Ee(o*t.suggested_factor)},{id:"cap",value:100}]}var Rt=920,Pt=200,Or=56,ne={t:16,r:18,b:32,l:52},Re=Rt-ne.l-ne.r,xt=Pt-ne.t-ne.b,Jo="var(--accent)",ta="var(--series-cool)",Ks="var(--state-warn)",Gs="var(--state-ok)",Xs="var(--state-danger)",ho="var(--state-warn)",Qo="var(--series-cool)",ea="var(--accent)",Ys="var(--state-ok)",Ir={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},qr={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},Js=`
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
`;I("motor-lab-charts",Js);function vt(t,e,o=xt){let a=e.max-e.min||1;return ne.t+o-(t-e.min)/a*o}function vo(t,e,o,a=Pt){t.appendChild(G("text",{class:"chart-axis-label",x:ne.l,y:a-8},"0 s")),t.appendChild(G("text",{class:"chart-axis-label",x:ne.l+Re-48,y:a-8},(o/1e3).toFixed(1)+" s"))}function oa(t,e,o=xt){for(let a=0;a<=4;a++){let n=ne.t+o*a/4;t.appendChild(G("line",{class:"chart-grid",x1:ne.l,x2:ne.l+Re,y1:n,y2:n}));let r=e.max-(e.max-e.min)*a/4;t.appendChild(G("text",{class:"chart-tick",x:8,y:n+4},r.toFixed(0)))}}function Qs(t){if(!t.length)return[];let e=[],o=0,a=Number(t[0].stroke_phase)||0;for(let n=1;n<t.length;n++){let r=Number(t[n].stroke_phase)||0;r!==a&&(e.push({phase:a,start:o,end:n-1}),o=n,a=r)}return e.push({phase:a,start:o,end:t.length-1}),e}function ei(t){let e=t.querySelector("defs");return e||(e=G("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([a,n,r])=>{let s=G("pattern",{id:a,width:4,height:4,patternUnits:"userSpaceOnUse"});s.appendChild(G("path",{d:n,stroke:r,"stroke-width":"1",fill:"none"})),e.appendChild(s)}),t.appendChild(e),e)}function Ot(t,e,o){let a=document.createElement("div");a.className="chart-card",a.setAttribute("role","img"),a.setAttribute("aria-label",d(o||t));let n=document.createElement("div");return n.className="chart-head",n.innerHTML='<span class="chart-title">'+d(t)+'</span><span class="chart-sub">'+e+"</span>",a.appendChild(n),a}function ti(t,e,o){let a=Ot(e,d(o||"diagnostics.lab.empty"),e),n=document.createElement("div");n.className="lab-empty",n.textContent=d("diagnostics.lab.empty"),a.appendChild(n),t.appendChild(a)}function xo(t,e,o){return t?d("diagnostics.lab.res.live"):o&&o.truncated?d("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?d("diagnostics.lab.res.trace",{direction:d("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):d("diagnostics.lab.res.traceReady")}function oi(t,e,o,a,n,r){if(!r.current&&!r.overlays)return;let s=Dt(e),c=Ot("diagnostics.lab.chart.current",xo(n,o,s),"diagnostics.lab.chart.currentAria");if(s.truncated){let y=document.createElement("div");y.className="lab-chart-warn",y.textContent=d("diagnostics.lab.res.ringWarn",{n:2e3,s:s.window_ms/1e3}),c.appendChild(y)}if(!e.length){let y=document.createElement("div");y.className="lab-empty",y.textContent=d("diagnostics.lab.empty"),c.appendChild(y),t.appendChild(c);return}let p=e.map(y=>y.current_ma).filter(Number.isFinite),u=(a||[]).map(y=>y.value).filter(Number.isFinite),l=no(p.concat([0,40],u),0,50);l.min=0;let m=e[0].t_ms,g=Math.max(1,e[e.length-1].t_ms-m),f=y=>ne.l+(e[y].t_ms-m)/g*Re,b=e.map((y,T)=>({x:f(T),y:vt(y.current_ma,l)})),w=G("svg",{viewBox:"0 0 "+Rt+" "+Pt,role:"img"});if(oa(w,l),vo(w,m,g),r.overlays){let y={mean:ta,threshold:Ks,suggested:Gs,cap:Xs};(a||[]).forEach(T=>{let S=vt(T.value,l);w.appendChild(G("line",{x1:ne.l,x2:ne.l+Re,y1:S,y2:S,stroke:y[T.id],"stroke-dasharray":T.id==="mean"?"0":"5 4","stroke-width":T.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:T.id==="cap"?".45":".9"}))})}let v=o&&o.ok&&o.pin_seen?{t_ms:o.pin_t_ms,current_ma:o.pin_current_ma,motion_count:o.pin_motion_count,stroke_phase:1}:Yo(e);if(v&&Number.isFinite(v.t_ms)){let y=ne.l+(v.t_ms-m)/g*Re;w.appendChild(G("line",{x1:y,x2:y,y1:ne.t,y2:ne.t+xt,stroke:ho,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),w.appendChild(G("circle",{cx:y,cy:vt(Number(v.current_ma)||0,l),r:4.2,fill:ho,stroke:"var(--bg)","stroke-width":"1.5"})),w.appendChild(G("text",{class:"chart-tick",x:Math.min(y+6,ne.l+Re-64),y:ne.t+12,fill:ho},d("diagnostics.lab.pinMark")))}r.current&&w.appendChild(G("path",{d:gt(b),fill:"none",stroke:Jo,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),c.appendChild(w),t.appendChild(c),bt(w,c,{count:e.length,plotTop:ne.t,plotBottom:ne.t+xt,xAt:f,label:y=>((e[y].t_ms-m)/1e3).toFixed(2)+" s",dots:y=>r.current?[{y:b[y].y,color:Jo}]:[],rows:y=>[{color:Jo,label:d("diagnostics.lab.currentMa"),value:Number(e[y].current_ma).toFixed(1)+" mA"},{color:ta,label:d("diagnostics.lab.motion"),value:String(e[y].motion_count)},{color:ho,label:d("diagnostics.lab.stroke"),value:d("diagnostics.lab.stroke."+Nt(e[y].stroke_phase))}]})}function ai(t,e,o,a){if(!a.phase)return;let n=Dt(e),r=Ot("diagnostics.lab.chart.phase",xo(o,null,n),"diagnostics.lab.chart.phaseAria");if(!e.length){let g=document.createElement("div");g.className="lab-empty",g.textContent=d("diagnostics.lab.empty"),r.appendChild(g),t.appendChild(r);return}let s=e[0].t_ms,c=Math.max(1,e[e.length-1].t_ms-s),p=Or+ne.b,u=G("svg",{viewBox:"0 0 "+Rt+" "+p,class:"lab-phase-strip",role:"img"});ei(u);let l=10,m=Or-18;Qs(e).forEach(g=>{let f=ne.l+(e[g.start].t_ms-s)/c*Re,b=ne.l+(e[g.end].t_ms-s)/c*Re,w=Nt(g.phase),v=Math.max(2,b-f);u.appendChild(G("rect",{x:f,y:l,width:v,height:m,fill:Ir[w]||Ir.free,stroke:"var(--separator)","stroke-width":"1"})),qr[w]&&u.appendChild(G("rect",{x:f,y:l,width:v,height:m,fill:"url(#"+qr[w]+")",opacity:".55"})),v>54&&u.appendChild(G("text",{x:f+6,y:l+m/2+3},d("diagnostics.lab.stroke."+w))),u.appendChild(G("line",{x1:b,x2:b,y1:l,y2:l+m,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),vo(u,s,c,p),r.appendChild(u),t.appendChild(r)}function ri(t,e,o,a){if(!a.cadence)return;let n=Dt(e),r=Ot("diagnostics.lab.chart.cadence",xo(o,null,n),"diagnostics.lab.chart.cadenceAria"),s=n.cadence.map(f=>f.rate_hz).filter(f=>f!=null&&Number.isFinite(f));if(!s.length){let f=document.createElement("div");f.className="lab-empty",f.textContent=d("diagnostics.lab.chart.cadenceEmpty"),r.appendChild(f),t.appendChild(r);return}let c=no(s.concat([0]),0,Math.max(10,...s));c.min=0;let p=e[0].t_ms,u=Math.max(1,e[e.length-1].t_ms-p),l=[],m=[];n.cadence.forEach((f,b)=>{f.rate_hz==null||!Number.isFinite(f.rate_hz)||(l.push({x:ne.l+(f.t_ms-p)/u*Re,y:vt(f.rate_hz,c)}),m.push(b))});let g=G("svg",{viewBox:"0 0 "+Rt+" "+Pt,role:"img"});oa(g,c),vo(g,p,u),g.appendChild(G("path",{d:gt(l),fill:"none",stroke:Qo,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),r.appendChild(g),t.appendChild(r),bt(g,r,{count:l.length,plotTop:ne.t,plotBottom:ne.t+xt,xAt:f=>l[f].x,label:f=>((n.cadence[m[f]].t_ms-p)/1e3).toFixed(2)+" s",dots:f=>[{y:l[f].y,color:Qo}],rows:f=>{let b=n.cadence[m[f]];return[{color:Qo,label:d("diagnostics.lab.cadence"),value:b.rate_hz.toFixed(1)+" /s"},{color:ta,label:d("diagnostics.lab.tachoPeriod"),value:Math.round(b.period_us)+" \xB5s"}]}})}function ni(t,e,o,a,n){if(!n.slope)return;let r=Dt(e),s=Ot("diagnostics.lab.chart.slope",xo(a,o,r),"diagnostics.lab.chart.slopeAria");if(!r.slopes.length){let b=document.createElement("div");b.className="lab-empty",b.textContent=d("diagnostics.lab.chart.slopeEmpty"),s.appendChild(b),t.appendChild(s);return}let c=r.slopes.map(b=>b.slope),p=o&&o.ok?o.suggested_slope:null,u=no(c.concat(p!=null?[p,0]:[0]),-2,8),l=e[0].t_ms,m=Math.max(1,e[e.length-1].t_ms-l),g=r.slopes.map(b=>({x:ne.l+(b.t_ms-l)/m*Re,y:vt(b.slope,u)})),f=G("svg",{viewBox:"0 0 "+Rt+" "+Pt,role:"img"});if(oa(f,u),vo(f,l,m),p!=null){let b=vt(p,u);f.appendChild(G("line",{x1:ne.l,x2:ne.l+Re,y1:b,y2:b,stroke:Ys,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}f.appendChild(G("path",{d:gt(g),fill:"none",stroke:ea,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),s.appendChild(f),t.appendChild(s),bt(f,s,{count:g.length,plotTop:ne.t,plotBottom:ne.t+xt,xAt:b=>g[b].x,label:b=>((r.slopes[b].t_ms-l)/1e3).toFixed(2)+" s",dots:b=>[{y:g[b].y,color:ea}],rows:b=>[{color:ea,label:d("diagnostics.lab.slope"),value:r.slopes[b].slope.toFixed(2)+" mA/s"}]})}function Br(t,e){let o=e&&e.samples||[],a=e&&e.analysis,n=!!(e&&e.live),r=e&&e.overlays,s=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let c=document.createElement("div");c.className="motor-lab-charts";let p=document.createElement("div");return p.className="gw-controls",p.setAttribute("role","toolbar"),p.setAttribute("aria-label",d("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([l,m])=>{let g=document.createElement("button");g.type="button",g.className="gw-toggle"+(s[l]?"":" is-off"),g.dataset.layer=l,g.setAttribute("aria-pressed",s[l]?"true":"false"),g.textContent=d(m),p.appendChild(g)}),c.appendChild(p),o.length?(oi(c,o,a,r,n,s),ai(c,o,n,s),ri(c,o,n,s),ni(c,o,a,n,s)):ti(c,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(c),p}var si=250,$r=2e4,It=["setup","arm","seat","open","close","review"],ii=`
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
`;I("diag-motor-lab",ii);var li=()=>`
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
`;function jr(t){return t==="open"?{factor:C(i.openThresholdMultiplier),slope:C(i.openSlopeThreshold),floor:C(i.openSlopeCurrentFactor),ripple:C(i.openRippleLimitFactor)}:{factor:C(i.closeThresholdMultiplier),slope:C(i.closeSlopeThreshold),floor:C(i.closeSlopeCurrentFactor)}}function qt(t){let e=jr(t.direction),o=t.direction==="open"?"open":"close",a=[{key:o+"_threshold_multiplier",labelKey:t.direction==="open"?"settings.motor.openThreshold":"settings.motor.closeThreshold",current:e.factor,suggested:t.suggested_factor,unit:"x"},{key:o+"_slope_threshold",labelKey:t.direction==="open"?"settings.motor.openSlope":"settings.motor.closeSlope",current:e.slope,suggested:t.suggested_slope,unit:"mA/s"},{key:o+"_slope_current_factor",labelKey:t.direction==="open"?"settings.motor.openSlopeFloor":"settings.motor.closeSlopeFloor",current:e.floor,suggested:t.suggested_slope_floor,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&a.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:e.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),a}function aa(t){return d(t?"common.on":"common.off")}function ra(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",invalidSamples:0,tachoRejected:0}}var Hd=O({tag:"diag-motor-lab",render:li,onMount(t,e){let o=Number(D("selectedZone")||1),a="setup",n="idle",r={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},s={open:null,close:null,seat:null},c={samples:[],analysis:null,live:!1},p={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},u=[],l=ra(),m=e.querySelector(".lab-step-chip"),g=e.querySelector(".lab-zone-chip"),f=e.querySelector(".lab-banner"),b=e.querySelector(".lab-guide"),w=e.querySelector(".lab-kicker"),v=e.querySelector(".lab-stage h3"),y=e.querySelector(".lab-stage p"),T=e.querySelector(".lab-setup"),S=e.querySelector(".lab-zone"),M=e.querySelector(".lab-phase-label"),_=e.querySelector(".lab-log"),R=e.querySelector(".lab-chart"),B=e.querySelector(".lab-metrics"),H=e.querySelector(".lab-suggest"),P=e.querySelector(".lab-primary"),X=e.querySelector(".lab-secondary"),te=e.querySelector(".lab-estop"),$={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function A(F){return It.indexOf(F)}function z(){return Se(o)}function q(){let F=String(o);S.innerHTML=Array.from({length:6},(Y,oe)=>'<option value="'+(oe+1)+'">'+Se(oe+1).replace(/</g,"&lt;")+"</option>").join(""),S.value=F,S.setAttribute("aria-label",d("diagnostics.lab.motor")),g.textContent=z(),g.setAttribute("aria-label",d("diagnostics.lab.motor"))}function N(F,Y){let oe=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});u.push(oe+"  "+d(F,Y)),u.length>8&&u.shift(),_.innerHTML=u.map(se=>"<div>"+se+"</div>").join(""),_.scrollTop=_.scrollHeight}function ie(F){f.textContent=F||"",f.classList.toggle("show",!!F)}function ae(F,Y){n=F,M.dataset.kind=Y||"",M.textContent=d("diagnostics.lab.phase."+F)}function j(){let F=Nt(l.stroke);$.current.textContent=l.current==null?"\u2014":l.current.toFixed(1)+" mA",$.mean.textContent=l.mean==null?"\u2014":l.mean.toFixed(1)+" mA",$.peak.textContent=l.peak==null?"\u2014":l.peak.toFixed(1)+" mA",$.slope.textContent=l.slope==null?"\u2014":l.slope.toFixed(1)+" mA/s",$.runtime.textContent=l.runtime?(l.runtime/1e3).toFixed(1)+" s":"\u2014",$.motion.textContent=l.motion?String(l.motion):"\u2014",$.cadence.textContent=l.cadenceHz==null?"\u2014":l.cadenceHz.toFixed(1)+" /s",$.direction.textContent=l.direction,$.drivers.textContent=aa(ce(i.drivers)),$.busy.textContent=aa(l.busy),$.armed.textContent=aa(l.armed),$.backend.textContent=l.backend||"\u2014",$.fault.textContent=l.faultCode?String(l.faultCode):d("common.ok"),$.invalid.textContent=String(l.invalidSamples||0),$.tachoRejected.textContent=String(l.tachoRejected||0),$.stroke.textContent=d("diagnostics.lab.stroke."+F),$.stroke.dataset.phase=F,l.pinSeen?($.pin.textContent=d("diagnostics.lab.pinSeen",{count:l.pinAt}),$.pin.dataset.seen="true"):($.pin.textContent=d("diagnostics.lab.pinWaiting"),$.pin.dataset.seen="false")}function me(){let F=c.analysis?Pr(c.analysis,jr(c.analysis.direction)):[],Y=Br(R,{samples:c.samples,analysis:c.analysis,live:c.live,overlays:F,visible:p});Y&&Y.addEventListener("click",oe=>{let se=oe.target.closest(".gw-toggle");if(!se)return;let K=se.dataset.layer;p[K]=!p[K],Object.keys(p).some(fe=>p[fe])||(p[K]=!0),me()})}function be(F,Y,oe){c={analysis:F&&F.ok?F:null,samples:Y||[],live:!!oe},c.analysis&&(l.mean=c.analysis.mean_ma,l.peak=c.analysis.peak_ma,l.slope=c.analysis.max_stall_slope_ma_s),me();let se=[];if(a==="review"?(s.open&&se.push(...qt(s.open)),s.close&&se.push(...qt(s.close))):c.analysis&&se.push(...qt(c.analysis)),!c.analysis&&a!=="review"){B.innerHTML="",H.hidden=!0;return}let K=a==="review"?s.close||s.open:c.analysis;if(!K){B.innerHTML="",H.hidden=!0;return}let pe=K.pin_seen?d("diagnostics.lab.pinMetric",{ms:K.pin_t_ms,count:K.pin_motion_count}):d("diagnostics.lab.pinWaiting"),fe=[[d("diagnostics.lab.mean"),K.mean_ma.toFixed(1)+" mA"],[d("diagnostics.lab.peak"),K.peak_ma.toFixed(1)+" mA"],[d("diagnostics.lab.runtime"),(K.runtime_ms/1e3).toFixed(1)+" s"],[d("diagnostics.lab.ripples"),String(K.ripples)],[d("diagnostics.lab.pin"),pe]];if(a==="review"&&s.open&&s.close){fe[0]=[d("diagnostics.lab.mean"),s.open.mean_ma.toFixed(1)+" / "+s.close.mean_ma.toFixed(1)+" mA"],fe[1]=[d("diagnostics.lab.peak"),s.open.peak_ma.toFixed(1)+" / "+s.close.peak_ma.toFixed(1)+" mA"];let de=s.close.pin_seen?d("diagnostics.lab.pinMetric",{ms:s.close.pin_t_ms,count:s.close.pin_motion_count}):d("diagnostics.lab.pinWaiting");fe[4]=[d("diagnostics.lab.pin"),de]}B.innerHTML=fe.map(de=>'<div class="lab-metric"><span>'+de[0]+"</span><strong>"+de[1]+"</strong></div>").join(""),H.querySelector("tbody").innerHTML=se.map(de=>"<tr><td>"+d(de.labelKey)+"</td><td>"+Number(de.current).toFixed(1)+" "+de.unit+'</td><td class="better">'+Number(de.suggested).toFixed(1)+" "+de.unit+"</td></tr>").join(""),H.hidden=!se.length}function re(){let F=a==="halted",Y=F?"setup":a,oe=A(Y),se=F?"halted":"active";m.dataset.state=se,m.textContent=F?d("diagnostics.lab.halted"):d("diagnostics.lab.stepChip",{step:oe+1,total:It.length,name:d("diagnostics.lab.steps."+Y)}),w.textContent=F?d("diagnostics.lab.halted"):d("diagnostics.lab.stepOf",{step:oe+1,total:It.length}),v.textContent=d("diagnostics.lab."+(F?"halt":Y)+".title");let K=a==="seat"&&s.seat||a==="open"&&s.open||a==="close"&&s.close,pe=F?"diagnostics.lab.halt.copy":K?"diagnostics.lab."+Y+".done":"diagnostics.lab."+Y+".copy";y.textContent=d(pe);let fe=a==="setup";b.dataset.setup=fe?"true":"false",T.hidden=!fe,S.disabled=!fe||r.active,g.hidden=fe,g.textContent=z(),te.dataset.armed=r.active?"true":"false",j();let de=r.active,_e={key:"diagnostics.lab.next",disabled:de,action:"next"},Be=null;a==="setup"?_e={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:a==="arm"?_e={key:"diagnostics.lab.arm.action",disabled:de,action:"arm"}:a==="seat"?_e={key:s.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:de,action:s.seat?"next":"seat"}:a==="open"?_e={key:s.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:de,action:s.open?"next":"open"}:a==="close"?_e={key:s.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:de,action:s.close?"next":"close"}:a==="review"?(_e={key:"diagnostics.lab.apply",disabled:!(s.open||s.close),action:"apply"},Be={key:"diagnostics.lab.restart",action:"restart"}):F&&(_e={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),de&&(_e={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!de&&(a==="seat"||a==="open"||a==="close")&&!s[a==="seat"?"seat":a]&&n==="failed"&&(_e={key:"diagnostics.lab.retry",disabled:!1,action:a}),!de&&K&&(a==="seat"||a==="open"||a==="close")&&(Be={key:"diagnostics.lab.restart",action:"restart"}),P.dataset.action=_e.action,P.disabled=!!_e.disabled,P.textContent=d(_e.key),Be?(X.hidden=!1,X.dataset.action=Be.action,X.textContent=d(Be.key)):(X.hidden=!0,X.dataset.action="")}function Fe(){r.timer&&clearInterval(r.timer),r.timer=null}function he(F){if(a=F,(F==="arm"||F==="setup")&&ie(""),F==="review"){let Y=s.close||s.open;be(Y,Y?Y.samples:[],!1),ae("done","ok")}else F==="setup"&&be(null,[],!1);re()}async function Xe(){if(!r.active){r.active=!0,ae("arming","run"),re(),N("diagnostics.lab.log.arming",{zone:o});try{if(D("manualMode")||(Te("manualMode",!0),await Ct(!0),N("diagnostics.lab.log.manual")),r.aborted||(ce(i.drivers)||(await _t(!0),N("diagnostics.lab.log.drivers")),r.aborted))return;l.busy=!1,l.armed=!0,ae("armed","ok"),N("diagnostics.lab.log.armed"),r.active=!1,he("seat")}catch(F){r.active=!1,ae("failed","halt"),N("diagnostics.lab.log.armFailed"),re()}}}async function it(F,Y,oe){ae("analyzing","run"),re();let se=Nr(F),K=Rr(se,Y),pe=K.ok?K.samples:se;if(oe&&(s[oe]=K.ok?K:null),be(K,pe,!1),!K.ok)ae("failed","halt"),N(oe==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),oe==="seat"&&(s.seat={short:!0},N("diagnostics.lab.log.seatContinue"));else if(ae("done","ok"),N("diagnostics.lab.log.captured",{direction:d("diagnostics.lab.dir."+K.direction),peak:K.peak_ma.toFixed(1)}),K.pin_seen){let fe=l.pinSeen;l.pinSeen=!0,l.pinAt=K.pin_motion_count,l.pinMa=K.pin_current_ma,l.stroke=1,fe||N("diagnostics.lab.log.pinTrace",{count:K.pin_motion_count,ma:K.pin_current_ma.toFixed(1),ms:K.pin_t_ms})}else(oe==="close"||oe==="seat")&&N("diagnostics.lab.log.pinMissing")}async function He(F,Y){for(let oe=0;oe<6;oe++){if(r.aborted)return;try{ae("fetching","run"),re();let se=await Na();N("diagnostics.lab.log.trace"),await it(se,F,Y);return}catch(se){if(se&&se.code==="motor_busy"){await new Promise(K=>setTimeout(K,250));continue}ae("failed","halt"),N("diagnostics.lab.log.traceFailed"),be(null,r.live,!0);return}}ae("failed","halt")}function lt(F){let Y=F.map(se=>se.current_ma).filter(Number.isFinite);if(!Y.length)return;let oe=Y.reduce((se,K)=>se+K,0);if(l.mean=Math.round(oe/Y.length*10)/10,l.peak=Math.round(Math.max(...Y)*10)/10,F.length>=2){let se=F[Math.max(0,F.length-3)],K=F[F.length-1],pe=(K.t_ms-se.t_ms)/1e3;pe>.05&&(l.slope=Math.round((K.current_ma-se.current_ma)/pe*10)/10)}}async function qe(F,Y){if(!r.active){r={active:!0,aborted:!1,direction:F,timer:null,live:[],started:Date.now()},l=ra(),l.direction=d("diagnostics.lab.dir."+F),ae("starting","run"),re(),be(null,[],!0),N("diagnostics.lab.log.starting",{direction:d("diagnostics.lab.dir."+F),zone:o});try{if(F==="open"?await Qt(o,1e4):await eo(o,1e4),r.aborted)return;ae("waiting","run"),re();let oe=!1,se=async()=>{if(!r.aborted)try{let K=await Ta(),pe=K&&K.data&&K.data.motor_safety?K.data.motor_safety:{},fe=Number(pe.current_ma),de=!!pe.motor_busy,_e=pe.drive_on!=null?!!pe.drive_on:de;de&&!oe&&(oe=!0,ae("running","run"),N("diagnostics.lab.log.busy")),l.busy=de,l.runtime=Date.now()-r.started,l.motion=Number(pe.motion_evidence_count)||l.motion,l.stroke=Number(pe.stroke_phase)||0,l.tachoPeriodUs=Number(pe.tacho_period_us)||l.tachoPeriodUs,l.tachoCadenceUs=Number(pe.tacho_cadence_us)||l.tachoCadenceUs;let Be=l.tachoPeriodUs||l.tachoCadenceUs;l.cadenceHz=Be>0?1e6/Be:null,l.faultCode=Number(pe.fault_code)||0,l.armed=!!pe.armed,l.backend=pe.backend||l.backend,l.invalidSamples=Number(pe.invalid_samples)||0,l.tachoRejected=Number(pe.tacho_rejected)||0,!l.pinSeen&&(l.stroke===1||l.stroke===2)&&(l.pinSeen=!0,l.pinAt=l.motion,l.pinMa=Number.isFinite(fe)?fe:l.current,N("diagnostics.lab.log.pin",{count:l.pinAt,ma:Number(l.pinMa||0).toFixed(1)})),Number.isFinite(fe)&&(l.current=fe,r.live.push({t_ms:Date.now()-r.started,current_ma:fe,motion_count:l.motion,drive_on:_e,direction_open:F==="open",stroke_phase:l.stroke,tacho_period_us:l.tachoPeriodUs,tacho_cadence_us:l.tachoCadenceUs,armed:l.armed,fault_code:l.faultCode,backend:l.backend}),lt(r.live),be(null,r.live,!0)),j(),(oe&&!de||Date.now()-r.started>$r)&&(Fe(),l.busy=!1,oe&&N("diagnostics.lab.log.stopped"),r.active=!1,await He(F,Y),re())}catch(K){Date.now()-r.started>$r&&(Fe(),r.active=!1,ae("failed","halt"),N("diagnostics.lab.log.traceFailed"),re())}};r.timer=setInterval(se,si),se()}catch(oe){r.active=!1,ae("failed","halt"),N("diagnostics.lab.log.startFailed"),re()}}}function wt(){Fe(),r={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},s={open:null,close:null,seat:null},l=ra(),u.length=0,_.innerHTML="",ie(""),ae("idle"),he("setup")}async function Bt(){r.aborted=!0,r.active=!1,Fe(),l.busy=!1,ie(d("diagnostics.lab.estopDone")),ae("halted","halt"),N("diagnostics.lab.log.estop"),a="halted",re();try{await Fa()}catch(F){}j()}function ko(){let F=A(a);F<0||F>=It.length-1||he(It[F+1])}function Ye(F){if(F==="start"){N("diagnostics.lab.log.selected",{zone:o}),he("arm");return}if(F==="arm")return Xe();if(F==="seat")return qe("close","seat");if(F==="open")return qe("open","open");if(F==="close")return qe("close","close");if(F==="next")return ko();if(F==="restart")return wt();if(F==="apply"){let Y=[];s.open&&Y.push(...qt(s.open)),s.close&&Y.push(...qt(s.close)),Y.forEach(oe=>Me(oe.key,oe.suggested)),ae("applied","ok"),N("diagnostics.lab.log.applied"),re()}}P.addEventListener("click",()=>Ye(P.dataset.action)),X.addEventListener("click",()=>Ye(X.dataset.action)),te.addEventListener("click",Bt),S.addEventListener("change",()=>{o=Number(S.value||1),g.textContent=z()});function ct(F){F.key==="Escape"&&D("section")==="motorlab"&&(F.preventDefault(),Bt())}window.addEventListener("keydown",ct),q(),ae("idle"),be(null,[],!1),re(),k(i.drivers,j),U("manualMode",j),U("selectedZone",()=>{a==="setup"&&(o=Number(D("selectedZone")||o),S.value=String(o))}),E(e)}});var ci=`
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
`;I("diag-system-card",ci);var di=()=>`
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
`,Kd=O({tag:"diag-system-card",render:di,onMount(t,e){let o=e.querySelector('[data-k="cpu0"]'),a=e.querySelector('[data-k="cpu1"]'),n=e.querySelector('[data-k="heap"]'),r=e.querySelector('[data-k="dma"]'),s=e.querySelector('[data-k="largestInternal"]'),c=e.querySelector('[data-k="minInternal"]'),p=e.querySelector('[data-k="psram"]'),u=e.querySelector('[data-k="largestPsram"]'),l=e.querySelector('[data-k="bleAds"]'),m=e.querySelector('[data-k="bleLastAdv"]'),g=e.querySelector('[data-k="bleState"]'),f=e.querySelector('[data-bar="cpu0"]'),b=e.querySelector('[data-bar="cpu1"]'),w=e.querySelector('[data-k="reset"]'),v=(M,_,R)=>{if(R==null||!Number.isFinite(Number(R))){M.textContent="\u2014",M.classList.remove("warn"),_.style.width="0%";return}let B=Math.max(0,Math.min(100,Number(R)));M.textContent=B.toFixed(0)+"%",M.classList.toggle("warn",B>=90),_.style.width=B+"%"},y=(M,_,R)=>{if(_==null||!Number.isFinite(Number(_))){M.textContent="\u2014";return}let B=Number(_);M.textContent=B+" KB",M.classList.toggle("warn",R!=null&&B<R)},T=M=>{if(M==null||!Number.isFinite(Number(M))||Number(M)<=0)return"\u2014";let _=Number(M);return _<1e3?Math.round(_)+" ms":_<6e4?(_/1e3).toFixed(1)+" s":Math.round(_/6e4)+" min"},S=()=>{v(o,f,C(i.cpuLoadCore0)),v(a,b,C(i.cpuLoadCore1)),y(n,C(i.freeInternalKb),48),y(r,C(i.freeDmaKb),32),y(s,C(i.largestInternalKb),24),y(c,C(i.minInternalKb),48),y(p,C(i.freePsramKb),null),y(u,C(i.largestPsramKb),null);let M=C(i.bleAdsPerSec);M==null||!Number.isFinite(Number(M))?l.textContent="\u2014":l.textContent=Number(M).toFixed(1)+"/s",m.textContent=T(C(i.bleLastAdvAgeMs));let _=L(i.bleDemanded)==="on",R=L(i.bleHubEnabled)==="on",B=L(i.bleScanning)==="on",H=[];H.push(_?"demanded":"idle"),R?H.push(B?"scanning":"on"):H.push("off"),g.textContent=H.join(" \xB7 ");let P=String(L(i.resetReason)||D("resetReason")||"").trim();w.textContent=P||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{Oa().catch(M=>console.error("[System] dump failed:",M))}),k(i.cpuLoadCore0,S),k(i.cpuLoadCore1,S),k(i.freeInternalKb,S),k(i.freeDmaKb,S),k(i.largestInternalKb,S),k(i.minInternalKb,S),k(i.freePsramKb,S),k(i.largestPsramKb,S),k(i.bleAdsPerSec,S),k(i.bleLastAdvAgeMs,S),k(i.bleHubEnabled,S),k(i.bleScanning,S),k(i.bleDemanded,S),k(i.resetReason,S),U("resetReason",S),E(e),S()}});var pi=`
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
`;I("settings-manifold-card",pi);var ui=()=>{let t="";for(let o=1;o<=8;o++)t+="<option>Probe "+o+"</option>";let e="";for(let o=1;o<=8;o++)e+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${ve("settings.manifold.help")}</span></div>
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
  `},rp=O({tag:"settings-manifold-card",render:ui,onMount(t,e){let o=e.querySelector(".sm-type"),a=e.querySelector(".sm-flow"),n=e.querySelector(".sm-ret"),r=xe(e);r.select(o,{read:()=>L(i.manifoldType)||"NO (Normally Open)",commit:c=>Ae("manifold_type",c)}),r.select(a,{read:()=>L(i.manifoldFlowProbe)||"Probe 7",commit:c=>Ae("manifold_flow_probe",c)}),r.select(n,{read:()=>L(i.manifoldReturnProbe)||"Probe 8",commit:c=>Ae("manifold_return_probe",c)});function s(){for(let c=1;c<=8;c++){let p=e.querySelector('[data-probe="'+c+'"]');p&&(p.textContent=ue(C(h.probeTemp(c))))}}k(i.manifoldType,r.refresh),k(i.manifoldFlowProbe,r.refresh),k(i.manifoldReturnProbe,r.refresh);for(let c=1;c<=8;c++)k(h.probeTemp(c),s);E(e),r.refresh(),s()}});var mi=`
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
`;I("settings-touch-card",mi);var gi=()=>`
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
  </div>`,pp=O({tag:"settings-touch-card",render:gi,onMount(t,e){let o=e.querySelector(".touch-status"),a=e.querySelector(".touch-status-copy"),n=e.querySelector(".touch-identity"),r=e.querySelector(".touch-note"),s=e.querySelector(".touch-error"),c=e.querySelector(".touch-approve"),p=e.querySelector(".touch-disconnect");function u(){let l=ce(i.authorityConfigured),m=ce(i.authorityProposalPending),g=L(i.authorityState)||"unconfigured",f=m?L(i.authorityProposalInstallationId):L(i.authorityInstallationId),b=m?L(i.authorityProposalCoordinatorId):L(i.authorityCoordinatorId),w=L(i.authorityProposalName)||"Lune Touch",v=L(i.authorityProposalSite)||"House";o.classList.toggle("connected",l&&!m),o.classList.toggle("pending",m),a.innerHTML=m?`<strong>${w} is ready to connect</strong>${l?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:l?`<strong>Control approved</strong>${g.replace(/_/g," ")}${Number(C(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(C(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",n.hidden=!l&&!m,e.querySelector(".touch-name").textContent=m?w:"Lune Touch",e.querySelector(".touch-site").textContent=m?v:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=f||"\u2014",e.querySelector(".touch-coordinator-value").textContent=b||"\u2014",r.textContent=m?"Approval is local to this manifold. Discovery alone never grants control.":l?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",c.hidden=!m,p.hidden=!l||m}c.addEventListener("click",async()=>{s.textContent="",c.disabled=!0,c.textContent="Approving\u2026";try{await La()}catch(l){s.textContent=(l==null?void 0:l.message)||"Unable to approve Lune Touch."}finally{c.disabled=!1,c.textContent="Approve Lune Touch"}}),p.addEventListener("click",async()=>{if(s.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){p.disabled=!0;try{await Ma()}catch(l){s.textContent=(l==null?void 0:l.message)||"Unable to disconnect Lune Touch."}finally{p.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(l=>k(l,u)),u()}});var bi=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${ve("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`,xp=O({tag:"settings-minimum-flow-card",render:bi,onMount(t,e){let o=e.querySelector(".smf-always"),a=e.querySelector(".smf-pct"),n=e.querySelector(".smf-pct-row"),r=xe(e),s=c=>{n.hidden=!c,n.setAttribute("aria-hidden",c?"false":"true"),a.disabled=!c};r.toggle(o,{read:()=>ce(i.minimumFlowAlways),onChange:s,commit:c=>{let p=c?"on":"off";x(i.minimumFlowAlways,{state:p}),Ae("minimum_flow_always",p).catch(()=>x(i.minimumFlowAlways,{state:c?"off":"on"}))}}),r.num(a,{read:()=>C(i.minZoneFlowPct),commit:c=>{x(i.minZoneFlowPct,{value:c}),Me("min_zone_flow_pct",c)}}),k(i.minimumFlowAlways,r.refresh),k(i.minZoneFlowPct,r.refresh),E(e),r.refresh()}});var fi=`
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
`;I("settings-return-temp-card",fi);function nt(t){return!!(t&&t!=="None")}function hi(t){return"Probe "+t}function vi(){for(let t=1;t<=6;t++)if(nt(L(h.probe(t))))return!0;return!1}function xi(){let t="";for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return t}var yi=()=>{let t=xi(),e="";for(let o=1;o<=6;o++)e+=`
      <div class="ui-row srt-zone-row" data-zone="${o}">
        <span class="ui-label srt-zone-label" data-zone-label="${o}">${Oe(o)}</span>
        <span class="ui-field"><select class="ui-select srt-probe" data-zone="${o}">${t}</select></span>
      </div>`;return`
    <div class="ui-card settings-return-temp-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.returnTemp.title">Return temperature</span>${ve("settings.returnTemp.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.returnTemp.enabledSub">Optional return probes for legacy return-temp balancing \u2014 not required for adaptive balancing.</span></span>
        <span class="ui-field"><div class="ui-toggle srt-enabled" role="switch" data-i18n-label="settings.returnTemp.title" aria-label="Enable return temperature probes"></div></span>
      </div>
      <div class="srt-zones">${e}</div>
    </div>
  `},Mp=O({tag:"settings-return-temp-card",render:yi,onMount(t,e){let o=e.querySelector(".srt-enabled"),a=e.querySelector(".srt-zones"),n=Array.from(e.querySelectorAll(".srt-probe")),r=Object.create(null);function s(m){return r[m]||hi(m)}function c(m){a.hidden=!m,a.setAttribute("aria-hidden",m?"false":"true");for(let g of n)g.disabled=!m}function p(){for(let m=1;m<=6;m++){let g=e.querySelector('[data-zone-label="'+m+'"]');g&&(g.innerHTML=Oe(m))}}let u=xe(e),l;for(let m of n){let g=Number(m.dataset.zone);u.select(m,{read:()=>{let f=L(h.probe(g));return nt(f)?(r[g]=f,f):s(g)},commit:f=>{!l||!l.staged||(r[g]=f,Ve(g,"zone_probe",f))}})}l=u.toggle(o,{read:()=>vi(),onChange:m=>{if(m)for(let g of n){let f=Number(g.dataset.zone);nt(g.value)||(g.value=s(f)),nt(g.value)&&(r[f]=g.value)}else for(let g of n){let f=Number(g.dataset.zone);nt(g.value)&&(r[f]=g.value)}c(m)},commit:m=>{if(!m){for(let g of n){let f=Number(g.dataset.zone);nt(g.value)&&(r[f]=g.value),Ve(f,"zone_probe","None")}return}for(let g of n){let f=Number(g.dataset.zone),b=nt(g.value)?g.value:s(f);r[f]=b,Ve(f,"zone_probe",b)}}});for(let m=1;m<=6;m++)k(h.probe(m),u.refresh),k(h.name(m),p);E(e),p(),u.refresh()}});var wi=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function ki(){if(String(L(i.bleClockSyncAdvertising)||"").toLowerCase()==="on")return d("common.clockSyncing");let t=String(L(i.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return d("settings.bleClock.waitingClock");if(t==="ble_busy")return d("settings.bleClock.busy");if(t)return t;let e=Number(C(i.bleClockSyncLastOkS)||0);if(!e)return d("settings.bleClock.never");let o=Math.max(0,Math.round(Date.now()/1e3)-e);if(o<60)return d("common.secondsAgo",{value:o});if(o<3600)return d("common.minutesAgo",{value:Math.round(o/60)});let a=Math.round(o/3600);return d("settings.bleClock.hoursAgo",{value:a})}var zi=()=>`
  <div class="ui-card settings-ble-clock-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.bleClock.title">Room clocks</span>${ve("settings.bleClock.help")}</span></div>
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
`,Pp=O({tag:"settings-ble-clock-card",render:zi,onMount(t,e){let o=e.querySelector(".sbc-enabled"),a=e.querySelector(".sbc-interval"),n=e.querySelector(".sbc-status"),r=e.querySelector(".sbc-now"),s=xe(e),c=()=>{let u=a.value;a.innerHTML=wi.map(l=>`<option value="${l.value}">${d(l.labelKey)}</option>`).join(""),u&&(a.value=u)},p=()=>{n.textContent=ki()};c(),s.toggle(o,{read:()=>ce(i.bleClockSyncEnabled),commit:u=>{let l=u?"on":"off";x(i.bleClockSyncEnabled,{state:l}),Ae("ble_clock_sync_enabled",l).catch(()=>x(i.bleClockSyncEnabled,{state:u?"off":"on"}))}}),s.select(a,{read:()=>String(Math.round(Number(C(i.bleClockSyncIntervalMin))||60)),commit:u=>{let l=Number(u);x(i.bleClockSyncIntervalMin,{value:l}),Me("ble_clock_sync_interval_min",l)}}),r.addEventListener("click",()=>{x(i.bleClockSyncAdvertising,{state:"on"}),p(),Le("ble_clock_sync_now")}),k(i.bleClockSyncEnabled,s.refresh),k(i.bleClockSyncIntervalMin,s.refresh),k(i.bleClockSyncLastOkS,p),k(i.bleClockSyncLastError,p),k(i.bleClockSyncAdvertising,p),E(e),s.refresh(),p()}});var Si=`
.settings-card{background:var(--surface-raised);border:1px solid var(--separator);border-radius:10px;padding:18px;box-shadow:none}
.settings-card .card-title{margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--separator);color:var(--text-strong);font-size:.92rem;font-weight:650}
.settings-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-card .btn{width:100%;min-width:0;height:var(--control-height,44px);min-height:var(--control-height,44px);padding:0 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;line-height:1.2;cursor:pointer}
.settings-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;I("settings-control-card",Si);var _i=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Recovery actions</div>
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,$p=O({tag:"settings-control-card",render:_i,onMount(t,e){E(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&Le("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{Le("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&Le("restart")})}});var Ci=`
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
`;I("settings-motor-calibration-card",Ci);var yo=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],Li=()=>{let t="";for(let e=0;e<yo.length;e++){let o=yo[e];if(o.key==="generic_runtime_limit_seconds")continue;let a=Mi(o.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+d(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+a+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${ve("settings.motor.help")}</span></div>
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
  `};function Mi(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var Yp=O({tag:"settings-motor-calibration-card",render:Li,onMount(t,e){let o=e.querySelector(".smc-profile"),a=e.querySelector(".smc-safe-runtime"),n=e.querySelector(".mc-drivers-toggle"),r=xe(e);function s(p){if(p==="HmIP VdMot"&&Me("hmip_runtime_limit_seconds",40),p==="Generic"){let u=Number(C(i.genericRuntimeLimitSeconds));(!Number.isFinite(u)||u<=0)&&Me("generic_runtime_limit_seconds",45)}}r.toggle(n,{read:()=>ce(i.drivers),commit:p=>_t(p)}),r.select(o,{read:()=>L(i.motorProfileDefault)||"HmIP VdMot",commit:p=>{Ae("motor_profile_default",p),s(p)}});function c(){let p=L(i.motorProfileDefault)||"HmIP VdMot";a.disabled=p==="HmIP VdMot"}r.num(a,{read:()=>(L(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:C(i.genericRuntimeLimitSeconds),commit:p=>{o.value==="Generic"&&Me("generic_runtime_limit_seconds",p)}});for(let p=0;p<yo.length;p++){let u=yo[p];if(u.key==="generic_runtime_limit_seconds")continue;let l=e.querySelector(".smc-"+u.cls);l&&(r.num(l,{read:()=>C(u.id),commit:m=>Me(u.key,m)}),k(u.id,r.refresh))}k(i.drivers,r.refresh),k(i.motorProfileDefault,()=>{r.refresh(),c()}),k(i.genericRuntimeLimitSeconds,r.refresh),k(i.hmipRuntimeLimitSeconds,r.refresh),E(e),s(L(i.motorProfileDefault)||"HmIP VdMot"),r.refresh(),c()}});var Ai=600*1e3,Vr=600,Ei=`
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
`;I("settings-firmware-card",Ei);var Fi=()=>`
  <div class="ui-card settings-firmware-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.firmware.title">Firmware</span>${ve("settings.firmware.help")}</span></div>
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
`;function Zr(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function Ht(t,e){let o=Zr(t);if(!o)return!1;let a=Zr(e);if(!a)return!0;for(let n=0;n<3;n++)if(o[n]!==a[n])return o[n]>a[n];return!1}function Ur(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function Ti(t){let e=String(t||"").trim();return e.length<=Vr?e:e.slice(0,Vr).replace(/\s+\S*$/,"")+"\u2026"}function Ni(){let t=document.querySelector(".settings-backup-card");if(!t)return;let e=t.closest("details");e&&(e.open=!0),t.scrollIntoView({behavior:"smooth",block:"center"});let o=t.querySelector(".sbk-save");o&&o.focus({preventScroll:!0})}var su=O({tag:"settings-firmware-card",render:Fi,onMount(t,e){let o=e.querySelector(".sfw-version"),a=e.querySelector(".sfw-status"),n=e.querySelector(".sfw-check"),r=e.querySelector(".sfw-banner"),s=e.querySelector(".sfw-hop"),c=e.querySelector(".sfw-notes"),p=e.querySelector(".sfw-install"),u=e.querySelector(".sfw-asset"),l=e.querySelector(".sfw-jump"),m=e.querySelector(".sfw-file"),g=e.querySelector(".sfw-choose"),f=e.querySelector(".sfw-upload"),b=e.querySelector(".sfw-filename"),w=e.querySelector(".sfw-progress"),v=w.querySelector("i"),y=e.querySelector(".sfw-upload-status"),T=null,S=!1,M=0,_=!1,R=()=>L(i.firmware)||D("firmwareVersion")||"",B=(A,z)=>{a.textContent=A||"",a.className="ui-sublabel sfw-status"+(z?" "+z:"")},H=()=>{let A=dt.firmware_update;if(!A||A.available!==!0)return null;let z=String(A.latest||"").trim();return z?{tag:z,notes:d("settings.firmware.deviceReported"),asset:Io(z)}:null},P=()=>{let A=H();return T?A&&Ht(A.tag,T.tag)?A:T:A},X=()=>{o.textContent=R()||d("settings.firmware.unknownVersion")},te=()=>{let A=P(),z=!!A&&Ht(A.tag,R());if(r.hidden=!z,!z){Te("firmwareUpdateAvailable",null);return}s.innerHTML=Ur(R()||d("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+Ur(A.tag),c.textContent=Ti(A.notes)||d("common.noData"),u.href=A.asset.url,u.setAttribute("download",A.asset.name),u.title=A.asset.name,Te("firmwareUpdateAvailable",{current:R(),latest:A.tag,url:A.asset.url})},$=A=>{S||!A&&M&&Date.now()-M<Ai||(S=!0,M=Date.now(),n.disabled=!0,B(d("settings.firmware.checking")),Promise.resolve(Ia()).catch(()=>{}),Ba().then(z=>{T=z,te();let q=Ht(z.tag,R());B(q?d("settings.firmware.availableStatus",{version:z.tag}):d("settings.firmware.upToDate"),q?null:"ok")}).catch(z=>{T=null,te();let q=H();if(q){B(Ht(q.tag,R())?d("settings.firmware.availableStatus",{version:q.tag}):d("settings.firmware.upToDate"),Ht(q.tag,R())?null:"ok");return}if((z instanceof je?z.code:"network")==="no_releases"){B(d("settings.firmware.noReleases"),"ok");return}B(d("settings.firmware.checkFailed"),"err")}).finally(()=>{S=!1,n.disabled=!1}))};n.addEventListener("click",()=>$(!0)),l.addEventListener("click",Ni),p.addEventListener("click",()=>{let A=P();A&&window.confirm(d("settings.firmware.confirmInstall",{version:A.tag}))&&(p.disabled=!0,p.textContent=d("settings.firmware.installing"),Promise.resolve(qa()).then(()=>B(d("settings.firmware.installStarted"))).catch(()=>{B(d("settings.firmware.installFailed"),"err"),p.disabled=!1,p.textContent=d("settings.firmware.install")}))}),g.addEventListener("click",()=>m.click()),m.addEventListener("change",()=>{let A=m.files&&m.files[0];b.textContent=A?A.name:d("settings.firmware.noFile"),f.disabled=!A||_,y.textContent="",y.className="ui-note sfw-upload-status"}),f.addEventListener("click",()=>{let A=m.files&&m.files[0];!A||_||window.confirm(d("settings.firmware.confirmUpload",{file:A.name}))&&(_=!0,f.disabled=!0,g.disabled=!0,w.hidden=!1,v.style.width="0%",y.className="ui-note sfw-upload-status",y.textContent=d("settings.firmware.uploading",{value:0}),Promise.resolve(Ha()).catch(z=>console.warn("[Firmware] prepare rejected, continuing with upload:",z)).then(()=>$a(A,z=>{v.style.width=z+"%",y.textContent=d("settings.firmware.uploading",{value:z})})).then(()=>{v.style.width="100%",y.className="ui-note sfw-upload-status",y.textContent=d("settings.firmware.uploadDone")}).catch(z=>{console.error("[Firmware] upload failed:",z),w.hidden=!0,y.textContent=d("settings.firmware.uploadFailed")}).finally(()=>{_=!1,g.disabled=!1,f.disabled=!1}))}),U("section",()=>{D("section")==="settings"&&$(!1)}),k(i.firmware,()=>{X(),te()}),k("firmware_update",te),E(e),X(),D("section")==="settings"&&$(!1)}});var Di=`
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
`;I("settings-backup-card",Di);var Ri=()=>`
  <div class="ui-card settings-backup-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.backup.title">Backup and restore</span>${ve("settings.backup.help")}</span></div>
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
`,mu=O({tag:"settings-backup-card",render:Ri,onMount(t,e){let o=e.querySelector(".sbk-save"),a=e.querySelector(".sbk-learned"),n=e.querySelector(".sbk-file"),r=e.querySelector(".sbk-choose"),s=e.querySelector(".sbk-restore"),c=e.querySelector(".sbk-filename"),p=e.querySelector(".sbk-status"),u=e.querySelector(".sbk-result"),l=!0,m=!1,g=(f,b)=>{p.textContent=f||"",p.className="sbk-status"+(b?" "+b:"")};a.addEventListener("click",()=>{l=!l,a.classList.toggle("on",l),a.setAttribute("aria-checked",l?"true":"false")}),o.addEventListener("click",()=>{m||(m=!0,o.disabled=!0,u.textContent="",g(d("settings.backup.saving")),ja(!0).then(f=>{if(!to(f))throw new Error("unexpected_export_payload");g(d("settings.backup.saved",{file:Za(f)}),"ok")}).catch(f=>{console.error("[Backup] export failed:",f),g(d("settings.backup.saveFailed"),"err")}).finally(()=>{m=!1,o.disabled=!1}))}),r.addEventListener("click",()=>n.click()),n.addEventListener("change",()=>{let f=n.files&&n.files[0];c.textContent=f?f.name:d("settings.backup.noFile"),s.disabled=!f||m,u.textContent="",g("")}),s.addEventListener("click",async()=>{let f=n.files&&n.files[0];if(!f||m)return;let b="";try{b=await f.text()}catch(v){g(d("settings.backup.readFailed"),"err");return}let w=null;try{w=JSON.parse(b)}catch(v){g(d("settings.backup.invalidFile"),"err");return}if(!to(w)){g(d("settings.backup.invalidFile"),"err");return}window.confirm(d("settings.backup.confirmRestore",{file:f.name}))&&(m=!0,s.disabled=!0,u.textContent="",g(d("settings.backup.restoring")),Va(w,l).then(v=>{g(d("settings.backup.restored"),"ok"),u.textContent=d("settings.backup.result",{applied:v.applied,skipped:v.skipped,ignored:v.ignored})}).catch(v=>{console.error("[Backup] restore failed:",v),g(d("settings.backup.restoreFailed"),"err")}).finally(()=>{m=!1,s.disabled=!1}))}),E(e)}});var st=Object.freeze({refinedEmber:"refined-ember",deepForest:"deep-forest"}),Kr="lune-dashboard-theme",Gr="(prefers-color-scheme: dark)",yt=null,Wr=!1;function Xr(t){return Object.values(st).includes(t)?t:st.refinedEmber}function wo(){try{return Xr(localStorage.getItem(Kr))}catch(t){return st.refinedEmber}}function Pi(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(Gr).matches?"dark":"light"}function Oi(){let t=Pi();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,!Wr&&typeof window!="undefined"&&typeof window.matchMedia=="function"){yt=window.matchMedia(Gr);let o=()=>{let a=yt.matches?"dark":"light";e.dataset.colorScheme=a,e.style.colorScheme=a,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:a}))};typeof yt.addEventListener=="function"?yt.addEventListener("change",o):typeof yt.addListener=="function"&&yt.addListener(o),Wr=!0}return t}function na(t=wo()){let e=Xr(t);if(typeof document=="undefined")return e;Oi();let o=document.documentElement;return Object.values(st).forEach(a=>o.classList.remove(`theme-${a}`)),o.classList.add(`theme-${e}`),o.dataset.theme=e,e}function Yr(t){let e=na(t);try{localStorage.setItem(Kr,e)}catch(o){}return typeof window!="undefined"&&window.dispatchEvent(new CustomEvent("lune-theme-change",{detail:e})),e}var Ii=[{value:st.refinedEmber,labelKey:"settings.appearance.refinedEmber"},{value:st.deepForest,labelKey:"settings.appearance.deepForest"}],qi=()=>`
  <div class="ui-card settings-appearance-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.appearance.title">Appearance</span>${ve("settings.appearance.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.appearance.accent">Accent</span> <span class="ui-sublabel" data-i18n="settings.appearance.accentSub">Colour used for highlights and selected controls in this browser.</span></span>
      <span class="ui-field"><select class="ui-select sap-theme" data-i18n-label="settings.appearance.accent" aria-label="Accent theme"></select></span>
    </div>
  </div>
`,yu=O({tag:"settings-appearance-card",render:qi,onMount(t,e){let o=e.querySelector(".sap-theme"),a=()=>{let n=o.value||wo();o.innerHTML=Ii.map(r=>`<option value="${r.value}">${d(r.labelKey)}</option>`).join(""),o.value=n};a(),o.value=wo(),o.addEventListener("change",()=>Yr(o.value)),window.addEventListener("lune-theme-change",n=>{n.detail&&(o.value=n.detail)}),E(e)}});var Hi=`
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
`;I("smart-preheat-card",Hi);var Bi=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${ve("settings.preheat.help")}</span></div>
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
`,Au=O({tag:"smart-preheat-card",render:Bi,onMount(t,e){let o=e.querySelector(".absorb-toggle"),a=e.querySelector(".absorb-badge"),n=e.querySelector(".absorb-band"),r=e.querySelector(".absorb-delta"),s=e.querySelector(".absorb-body"),c=xe(e),p=l=>{s&&s.classList.toggle("is-disabled",!l)};c.toggle(o,{read:()=>ce(i.preheatAbsorbEnabled),onChange:p,commit:l=>{let m=l?"on":"off";x(i.preheatAbsorbEnabled,{state:m}),Ae("preheat_absorb_enabled",m)}}),c.num(n,{read:()=>C(i.preheatAbsorbBandC),commit:l=>{x(i.preheatAbsorbBandC,{value:l}),Me("preheat_absorb_band_c",l)}}),c.num(r,{read:()=>C(i.preheatDetectDeltaC),commit:l=>{x(i.preheatDetectDeltaC,{value:l}),Me("preheat_detect_delta_c",l)}});function u(){let l=String(L(i.preheatAbsorbing)||"").toLowerCase()==="active";a.textContent=l?d("common.active"):d("common.idle"),a.classList.toggle("active",l)}k(i.preheatAbsorbEnabled,c.refresh),k(i.preheatAbsorbing,u),k(i.preheatAbsorbBandC,c.refresh),k(i.preheatDetectDeltaC,c.refresh),E(e),c.refresh(),u()}});function Jr(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}na();var $i=`
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
`;I("hv6-app-root",$i);var ji=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand">Lune V6</div><p class="side-subtitle">Local manifold controller</p><div class="mobile-zone-dock" hidden><div class="zone-chipstrip" role="tablist" aria-label="Select zone"></div></div><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Hydraulic overview</h3><p>Current temperatures, valve demand and active loops.</p></div><span class="hydraulic-summary"></span></div><div class="flow-diagram-slot"></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section><section class="dashboard-section dashboard-connection" aria-labelledby="connection-heading"><div class="dashboard-section-head"><div><h3 id="connection-heading">Connection</h3><p>Touch, network and firmware.</p></div></div><div class="connectivity-slot"></div></section></div></section>
<section class="sec" data-section="zones"><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title"><div class="zone-overview"><div class="zone-overview-strip" role="group" aria-label="Select zone"></div></div><div class="zone-detail-heading" id="selected-zone-panel" role="region" aria-labelledby="selected-zone-title"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-layout"><div class="zone-detail-slot"></div><div class="zone-actuator-slot"></div><section class="zone-configuration-groups" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div><div class="zone-coordination-slot"></div></section></div></section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout"><details class="disclosure settings-disclosure touch-settings" open><summary>Touch connection<small>Approval and coordinator identity</small></summary><div class="disclosure-body touch-slot"></div></details><details class="disclosure settings-disclosure"><summary>Manifold and probes<small>Valve type and temperature inputs</small></summary><div class="disclosure-body manifold-slot"></div></details><details class="disclosure settings-disclosure"><summary>Return temperature<small>Optional zone return probes</small></summary><div class="disclosure-body return-temp-slot"></div></details><details class="disclosure settings-disclosure"><summary>Hydraulic safety<small>Minimum active-loop opening</small></summary><div class="disclosure-body minimum-flow-slot"></div></details><details class="disclosure settings-disclosure"><summary>Room clocks<small>Shelly BLU display time</small></summary><div class="disclosure-body ble-clock-slot"></div></details><details class="disclosure settings-disclosure"><summary>Preheat absorption<small>Local handling of external preload</small></summary><div class="disclosure-body preheat-slot"></div></details><details class="disclosure settings-disclosure"><summary>Motor configuration<small>Drivers, profile and learning limits</small></summary><div class="disclosure-body motor-slot"></div></details><details class="disclosure settings-disclosure"><summary>Firmware<small>Version, updates and manual upload</small></summary><div class="disclosure-body firmware-slot"></div></details><details class="disclosure settings-disclosure"><summary>Backup and restore<small>Save or reapply local configuration</small></summary><div class="disclosure-body backup-slot"></div></details><details class="disclosure settings-disclosure"><summary>Appearance<small>Accent colour in this browser</small></summary><div class="disclosure-body appearance-slot"></div></details></div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;O({tag:"app-root",render:ji,onMount(t,e){e.querySelector(".hdr").appendChild(Q("hv6-header")),e.querySelector(".side-nav-slot").appendChild(Q("hv6-sidebar")),e.querySelector(".flow-diagram-slot").appendChild(Q("flow-diagram")),e.querySelector(".hydraulic-history-slot").appendChild(Q("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(Q("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(Q("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(Q("zone-detail",{zone:D("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(Q("zone-sensor-card")),e.querySelector(".zone-coordination-slot").appendChild(Q("zone-coordination-card")),e.querySelector(".zone-actuator-slot").appendChild(Q("zone-actuator-card")),e.querySelector(".zone-room-slot").appendChild(Q("zone-room-card")),e.querySelector(".touch-slot").appendChild(Q("settings-touch-card")),e.querySelector(".manifold-slot").appendChild(Q("settings-manifold-card")),e.querySelector(".return-temp-slot").appendChild(Q("settings-return-temp-card")),e.querySelector(".minimum-flow-slot").appendChild(Q("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(Q("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(Q("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(Q("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(Q("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(Q("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(Q("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(Q("settings-control-card")),e.querySelector(".manual-control-col").appendChild(Q("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(Q("diag-zone-motor-card",{zone:D("selectedZone")||1}));let o=e.querySelector(".motor-lab-slot"),a=e.querySelector('.sec[data-section="motorlab"]');function n(){let z=Jr(L(i.firmware)||D("firmwareVersion")),q=e.querySelector('.v6-side-link[data-section="motorlab"]');q&&(q.hidden=!z),a&&(a.hidden=!z),z&&o&&!o.firstChild&&o.appendChild(Q("diag-motor-lab")),!z&&D("section")==="motorlab"&&Pe("diagnostics")}k(i.firmware,n),U("firmwareVersion",n),U("section",n),n(),e.querySelector(".logs-main-col").appendChild(Q("logs-view")),e.querySelector(".system-health-slot").appendChild(Q("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(Q("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(Q("diag-i2c"));let r=e.querySelectorAll(".sec"),s=e.querySelector(".shell"),c=e.querySelector(".zone-detail-view"),p=e.querySelector(".selected-zone-title"),u=e.querySelector(".zone-overview-strip"),l=e.querySelector(".mobile-zone-dock"),m=e.querySelector(".mobile-zone-dock .zone-chipstrip");function g(z){let q=ce(h.enabled(z)),N=String(L(h.state(z))||"").toUpperCase()||"OFF",ie=String(L(h.motorLastFault(z))||"").toUpperCase();return q?q&&(N==="FAULT"||ie&&ie!=="NONE"&&ie!=="OK")?"FAULT":N:"OFF"}function f(z){return z==="HEATING"?d("state.heating"):z==="IDLE"?d("state.idle"):z==="FAULT"?d("common.fault"):z==="MANUAL"?d("state.manual"):z==="OVERHEATED"?d("state.overheated"):z==="CALIBRATING"?d("state.calibrating"):d("state.off")}function b(z){return z==="HEATING"||z==="CALLING"?"zs-heating":z==="FAULT"?"zs-fault":z==="IDLE"?"zs-idle":"zs-off"}function w(z){let q=String(z||"").trim();if(!q||/^none$/i.test(q)||q==="0"||q==="-1")return 0;let N=q.match(/(\d+)/),ie=N?Number(N[1]):0;return ie>=1&&ie<=6?ie:0}function v(){var ae;let z=[0,0,0,0,0,0,0];for(let j=1;j<=6;j++)z[j]=w(L(h.syncTo(j)));let q=[0,0,0,0,0,0,0];for(let j=1;j<=6;j++){let me=j;for(let be=0;be<6;be++){let re=z[me];if(!re||re<1||re>6)break;if(re===j){me=j;break}me=re}q[j]=me}let N={};for(let j=1;j<=6;j++)(N[ae=q[j]]||(N[ae]=[])).push(j);let ie=[[],[],[],[],[],[],[]];for(let j=1;j<=6;j++){let me=N[q[j]]||[j],be=me.length>1&&me.some(re=>z[re]>0);ie[j]=be?me.filter(re=>re!==j):[]}return{roots:q,partners:ie}}function y(){return window.matchMedia("(min-width: 901px)").matches}function T(){let z=v(),q=D("selectedZone")||1,N=y();u.setAttribute("role",N?"group":"list"),u.setAttribute("aria-label",N?"Select zone":"Zone status overview"),u.innerHTML=Array.from({length:6},(ie,ae)=>{var Y;let j=ae+1,me=j===q,be=Se(j),re=Oe(j),Fe=ue(C(h.temp(j))),he=ue((Y=C(h.effectiveSetpoint(j)))!=null?Y:C(h.setpoint(j))),Xe=g(j),it=f(Xe),He=b(Xe),lt=z.partners[j],qe=lt.length>0,wt=qe?d("overview.zone.mergedWith",{zones:lt.map(Mo).join(", ")}):"",Bt=qe&&lt.includes(j+1)&&z.roots[j]===z.roots[j+1],ko=qe&&lt.includes(j-1)&&z.roots[j]===z.roots[j-1],Ye=[qe?"is-merged":"",Bt?"zo-pair-start":"",ko?"zo-pair-cont":""].filter(Boolean).join(" "),ct=`${be}, ${Fe} / ${he}, ${it}${wt?", "+wt:""}`.replace(/"/g,"&quot;"),F=qe?`<span class="zo-merge">${wt}</span>`:"";return N?`<button type="button" class="zone-overview-card ${He}${Ye?" "+Ye:""}" data-zone-select="${j}" aria-current="${me?"true":"false"}" aria-label="${ct}" title="${ct}" tabindex="${me?"0":"-1"}"><span class="zo-status" aria-hidden="true"></span><span class="zo-title zone-label-compact">${re}</span><span class="zo-temps">${Fe} / ${he}</span>${F}</button>`:`<div class="zone-overview-card ${He}${Ye?" "+Ye:""}" role="listitem" aria-label="${ct}" title="${ct}"><span class="zo-status" aria-hidden="true"></span><span class="zo-title zone-label-compact">${re}</span><span class="zo-temps">${Fe} / ${he}</span>${F}</div>`}).join("")}function S(){let z=D("selectedZone")||1;m.innerHTML=Array.from({length:6},(q,N)=>{let ie=N+1,ae=ie===z,j=Se(ie),me=Oe(ie),be=j.replace(/"/g,"&quot;");return`<button type="button" class="zone-chip zone-label-compact" role="tab" aria-selected="${ae}" aria-label="${be}" title="${be}" tabindex="${ae?"0":"-1"}" data-zone-select="${ie}">${me}</button>`}).join("")}function M(){T(),S()}function _(){let z=D("section")==="zones";l.hidden=!z,l.setAttribute("aria-hidden",z?"false":"true"),s.classList.toggle("has-zone-dock",z)}function R(z){Vt(z)}function B(){let z=D("section")||"overview";r.forEach(q=>q.classList.toggle("active",q.dataset.section===z)),P()}function H(){let z=[],q=0,N=0;for(let he=1;he<=6;he++){let Xe=String(L(h.enabled(he))).toLowerCase()==="on",it=String(L(h.state(he))).toLowerCase(),He=String(L(h.motorLastFault(he))).toLowerCase();Xe&&z.push(he),Xe&&["heating","calling"].includes(it)&&q++,(it==="fault"||He!==""&&He!=="none"&&He!=="ok")&&N++}let ie=C(i.flow),ae=C(i.ret),j=String(L(i.authorityState)||"").replace(/_/g," "),me=N===0&&D("live"),be=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${me?"status-ok":D("live")?"status-warn":"status-danger"}">${me?"Operating normally":D("live")?"Needs attention":"Device offline"}</h2><p>${N?N+" zone fault"+(N===1?"":"s")+" require attention.":D("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${q} zones</strong><small>${z.length} enabled</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${ue(ie)}</strong><small>Return ${ue(ae)}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${j||"not connected"}</strong><small>${C(i.authorityLeaseRemainingS)?Math.round(C(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,re=ce(i.authorityConfigured),Fe=String(L(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=be,e.querySelector(".hydraulic-summary").textContent=`${q} heating \xB7 Flow ${ue(ie)} \xB7 Return ${ue(ae)}`,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${D("live")?"status-ok":"status-danger"}">${D("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${D("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${re?"Approved":"Not approved"}</strong><small>${re?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Fe}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${N?"status-danger":me?"status-ok":"status-warn"}">${N?N+" issue"+(N===1?"":"s"):me?"Healthy":"Awaiting data"}</h2><p>${N?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${N}</strong><small>${N?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${Fe}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${j||"not connected"}</strong><small>${re?"approved":"local control"}</small></div>`,[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(he=>{he.hidden=!N,he.innerHTML=N?`<strong>Review ${N} zone fault${N===1?"":"s"}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:""})}function P(){let z=D("selectedZone")||1,q=D("section")==="zones";p.innerHTML=Oe(z),M(),_(),c.hidden=!q}function X(z){let q=z.target.closest("[data-zone-select]");q&&R(Number(q.dataset.zoneSelect))}function te(z){y()&&X(z)}function $(z){if(!y()||!["ArrowLeft","ArrowRight","Home","End"].includes(z.key))return;z.preventDefault();let q=D("selectedZone")||1,N=z.key==="Home"?1:z.key==="End"?6:z.key==="ArrowLeft"?q===1?6:q-1:q===6?1:q+1;R(N),requestAnimationFrame(()=>{var ie;return(ie=u.querySelector(`[data-zone-select="${N}"]`))==null?void 0:ie.focus()})}function A(z){if(!["ArrowLeft","ArrowRight","Home","End"].includes(z.key))return;z.preventDefault();let q=D("selectedZone")||1,N=z.key==="Home"?1:z.key==="End"?6:z.key==="ArrowLeft"?q===1?6:q-1:q===6?1:q+1;R(N),requestAnimationFrame(()=>{var ie;return(ie=m.querySelector(`[data-zone-select="${N}"]`))==null?void 0:ie.focus()})}u.addEventListener("click",te),u.addEventListener("keydown",$),window.matchMedia("(min-width: 901px)").addEventListener("change",T),m.addEventListener("click",X),m.addEventListener("keydown",A),e.querySelectorAll("[data-open-zones]").forEach(z=>z.addEventListener("click",()=>Pe("zones"))),e.querySelectorAll("[data-help-section]").forEach(z=>z.addEventListener("click",q=>{q.preventDefault(),Pe(z.dataset.helpSection)})),U("section",B),U("selectedZone",P),U("live",H),U("zoneNames",()=>{M(),H()});for(let z=1;z<=6;z++)[h.temp(z),h.setpoint(z),h.effectiveSetpoint(z),h.valve(z),h.state(z),h.enabled(z),h.motorLastFault(z),h.syncTo(z)].forEach(q=>k(q,()=>{H(),M()}));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(z=>k(z,H)),E(e),B(),P(),H()}});function Vi(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(Q("app-root")),Ja()}Vi();})();
