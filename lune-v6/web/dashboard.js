(()=>{var $o={},Lt={};function D(t){return $o[t.tag]=t,t}function X(t,e){let o=$o[t];if(!o)throw new Error("Component not found: "+t);let a=e||{};if(o.state){let n=o.state(e||{});for(let l in n)a[l]=n[l]}if(o.methods)for(let n in o.methods)a[n]=o.methods[n];let s=document.createElement("div");s.innerHTML=o.render(a);let r=s.firstElementChild;return o.onMount&&o.onMount(a,r),r}function k(t,e){(Lt[t]||(Lt[t]=[])).push(e)}function pe(t){let e=Lt[t];if(e)for(let o=0;o<e.length;o++)e[o](t)}var ue=6,jr=28,Ge=Object.create(null),Vr=Zr(),W={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",firmwareUpdateAvailable:null,resetReason:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Ur(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Vr,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0},$r=300;function Ur(){let t=Object.create(null);for(let e=1;e<=ue;e++)t[e]=[];return t}function Zr(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<ue;)t.push("");return t.slice(0,ue)}function Wr(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(W.zoneNames))}catch(t){}}function be(t){return"$dashboard:"+t}function io(t){return Math.max(1,Math.min(ue,Number(t)||1))}function Uo(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let o=t.match(/-?\d+(?:[\.,]\d+)?/);if(o){let a=Number(String(o[0]).replace(",","."));return Number.isNaN(a)?null:a}}return null}function L(t){let e=Ge[t];return e?e.v!=null?e.v:e.value!=null?e.value:Uo(e.s!=null?e.s:e.state):null}function C(t){let e=Ge[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function Kr(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function se(t){return Kr(C(t))}function y(t,e){let o=Ge[t];o||(o=Ge[t]={v:null,s:null}),"v"in e&&(o.v=e.v,o.value=e.v),"value"in e&&(o.v=e.value,o.value=e.value),"s"in e&&(o.s=e.s,o.state=e.s),"state"in e&&(o.s=e.state,o.state=e.state);for(let a in e)a==="v"||a==="value"||a==="s"||a==="state"||(o[a]=e[a]);if(pe(t),t==="text_sensor-firmware_version"&&Ce("firmwareVersion",C(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let a=parseInt(t.slice(10,-5),10);if(a>=1&&a<=ue){let s=C(t)||"";W.zoneNames[a-1]!==s&&(W.zoneNames[a-1]=s,Wr(),pe(be("zoneNames")))}}}function V(t,e){k(be(t),e)}function T(t){return W[t]}function Ce(t,e){W[t]=e,pe(be(t))}function Fe(t){let e=t==="logs"?"diagnostics":t;W.section!==e&&(W.section=e,pe(be("section")))}function st(t){let e=io(t);W.selectedZone!==e&&(W.selectedZone=e,pe(be("selectedZone")))}function Re(t){let e=!!t;W.live!==e&&(W.live=e,pe(be("live")))}function lo(){W.pendingWrites+=1,pe(be("pendingWrites"))}function Mt(){W.pendingWrites=Math.max(0,W.pendingWrites-1),W.lastWriteAt=Date.now(),pe(be("pendingWrites"))}function Zo(){return W.pendingWrites>0?!0:Date.now()-W.lastWriteAt<2e3}function De(t){return W.zoneNames[io(t)-1]||""}function he(t){let e=io(t),o=De(e);return o?"Zone "+e+" \xB7 "+o:"Zone "+e}function Xe(t){W.i2cResult=t||"No scan has been run yet.",pe(be("i2cResult"))}function H(t,e){let o={time:Gr(),msg:String(t||"")};for(W.activityLog.push(o);W.activityLog.length>60;)W.activityLog.shift();if(e>=1&&e<=ue){let a=W.zoneLog[e];for(a.push(o);a.length>8;)a.shift();pe(be("zoneLog:"+e))}pe(be("activityLog"))}function so(t,e){let o=W[t];if(!Array.isArray(o))return;let a=Uo(e);if(a!=null){for(o.push(a);o.length>jr;)o.shift();pe(be(t))}}function it(t){let e=Date.now();if(!t&&e-W.lastHistoryAt<3200)return;W.lastHistoryAt=e;let o=0,a=0;for(let s=1;s<=ue;s++){let r=L("sensor-zone_"+s+"_valve_pct");r!=null&&(o+=r,a+=1)}so("historyFlow",L("sensor-manifold_flow_temperature")),so("historyReturn",L("sensor-manifold_return_temperature")),so("historyDemand",a?o/a:0)}function Gr(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function At(t){W.zoneStateHistory=t||null,pe(be("zoneStateHistory"))}function Wo(){return W.deviceLogSeq}function Et(t,e){if(Array.isArray(t)&&t.length){for(let o of t)W.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>W.deviceLogSeq&&(W.deviceLogSeq=o[0]);for(;W.deviceLog.length>$r;)W.deviceLog.shift();pe(be("deviceLog"))}typeof e=="number"&&e>W.deviceLogSeq&&(W.deviceLogSeq=e-1)}function Ft(){return W.deviceLog}function Ko(){W.deviceLog=[],pe(be("deviceLog"))}var h={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",baseSetpoint:t=>"number-zone_"+t+"_base_setpoint",effectiveSetpoint:t=>"number-zone_"+t+"_effective_setpoint",coordinatorOffset:t=>"number-zone_"+t+"_coordinator_offset",coordinatorRemaining:t=>"sensor-zone_"+t+"_coordinator_remaining_s",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",ble:t=>"text-zone_"+t+"_ble_mac",name:t=>"text-zone_"+t+"_name",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature"},i={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",resetReason:"text_sensor-reset_reason",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",authorityState:"text-authority_state",authorityReason:"text-authority_reason",authorityInstallationId:"text-authority_installation_id",authorityCoordinatorId:"text-authority_coordinator_id",authorityProposalInstallationId:"text-authority_proposal_installation_id",authorityProposalCoordinatorId:"text-authority_proposal_coordinator_id",authorityProposalName:"text-authority_proposal_name",authorityProposalSite:"text-authority_proposal_site",authorityProposalPending:"binary_sensor-authority_proposal_pending",authorityConfigured:"binary_sensor-authority_configured",authorityLeaseRemainingS:"sensor-authority_lease_remaining_s",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",bleClockSyncEnabled:"switch-ble_clock_sync_enabled",bleClockSyncIntervalMin:"number-ble_clock_sync_interval_min",bleClockSyncLastOkS:"sensor-ble_clock_sync_last_ok_s",bleClockSyncLastError:"text-ble_clock_sync_last_error",bleClockSyncAdvertising:"binary_sensor-ble_clock_sync_advertising",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var ie=6,Xr=8,Go=null,je=0,Tt=1,Xo=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"]],Qo=18*3600+720,ea=Date.now(),lt=4200,j={temp:new Float32Array(ie),setpoint:new Float32Array(ie),valve:new Float32Array(ie),enabled:new Uint8Array(ie),driversEnabled:1,fault:0,manualMode:0},xe={busy:!1,direction:"open",zone:1,startedAt:0};function Yr(){j.manualMode=0,ea=Date.now(),Ce("manualMode",!1);for(let r=0;r<ie;r++){j.temp[r]=20.5+r*.4,j.setpoint[r]=21+r%3*.5,j.valve[r]=12+r*8,j.enabled[r]=r===4?0:1;let n=r+1;y(h.temp(n),{value:j.temp[r]}),y(h.setpoint(n),{value:j.setpoint[r]}),y(h.baseSetpoint(n),{value:j.setpoint[r]}),y(h.effectiveSetpoint(n),{value:j.setpoint[r]}),y(h.coordinatorOffset(n),{value:0}),y(h.coordinatorRemaining(n),{value:0}),y(h.valve(n),{value:j.valve[r]}),y(h.state(n),{state:j.valve[r]>5?"heating":"idle"}),y(h.enabled(n),{value:!!j.enabled[r],state:j.enabled[r]?"on":"off"}),y(h.probe(n),{state:"Probe "+n}),y(h.tempSource(n),{state:n%2?"Local Probe":"BLE"}),y(h.syncTo(n),{state:"None"}),y(h.ble(n),{state:"AA:BB:CC:DD:EE:0"+n}),y(h.name(n),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][r]||""}),y(h.preheatAdvance(n),{value:.08+r*.03})}for(let r=1;r<=Xr;r++){let n=r<=ie?r:ie,l=j.temp[n-1]+(r>ie?1:.1*r);y(h.probeTemp(r),{value:l})}y(i.flow,{value:34.1}),y(i.ret,{value:30.4}),y(i.uptime,{value:Qo}),y(i.wifi,{value:-57}),y(i.drivers,{value:!0,state:"on"}),y(i.fault,{value:!1,state:"off"}),y(i.ip,{state:"192.168.1.86"}),y(i.ssid,{state:"MockLab"}),y(i.mac,{state:"D8:3B:DA:12:34:56"}),y(i.firmware,{state:"v1.0.0-1"}),y(i.resetReason,{state:"Software reset (esp_restart)"}),y(i.manifoldFlowProbe,{state:"Probe 7"}),y(i.manifoldReturnProbe,{state:"Probe 8"}),y(i.manifoldType,{state:"NC (Normally Closed)"}),y(i.motorProfileDefault,{state:"HmIP VdMot"}),y(i.closeThresholdMultiplier,{value:1.7}),y(i.closeSlopeThreshold,{value:1}),y(i.closeSlopeCurrentFactor,{value:1.4}),y(i.openThresholdMultiplier,{value:1.7}),y(i.openSlopeThreshold,{value:.8}),y(i.openSlopeCurrentFactor,{value:1.3}),y(i.openRippleLimitFactor,{value:1}),y(i.genericRuntimeLimitSeconds,{value:45}),y(i.hmipRuntimeLimitSeconds,{value:40}),y(i.relearnAfterMovements,{value:2e3}),y(i.relearnAfterHours,{value:168}),y(i.learnedFactorMinSamples,{value:3}),y(i.learnedFactorMaxDeviationPct,{value:12}),y(i.simplePreheatEnabled,{state:"on"}),y(i.minZoneFlowPct,{value:15}),y(i.minimumFlowAlways,{state:"off"}),y(i.bleClockSyncEnabled,{state:"on"}),y(i.bleClockSyncIntervalMin,{value:60}),y(i.bleClockSyncLastOkS,{value:(Number(Date.now()/1e3)|0)-900}),y(i.bleClockSyncLastError,{state:""}),y(i.bleClockSyncAdvertising,{state:"off"}),y(i.authorityInstallationId,{state:"house-main"}),y(i.authorityCoordinatorId,{state:"lune-touch"}),y(i.authorityConfigured,{state:"on",value:!0}),y(i.authorityProposalPending,{state:"off",value:!1}),y(i.authorityState,{state:"touch_normal"}),y(i.authorityReason,{state:"lease_renewed"}),y(i.authorityLeaseRemainingS,{value:72}),y(i.cpuLoadCore0,{value:18.5}),y(i.cpuLoadCore1,{value:7.2}),y(i.freeInternalKb,{value:142}),y(i.freePsramKb,{value:7800}),it(!0);let t=300,e=Number(Date.now()/1e3)|0,o=288,a=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],s=[];for(let r=0;r<o;r++){let n=(o-1-r)*t,l=e-n,u=Math.floor(r/12)%24,m=a.map(p=>p[u%p.length]),c=n/3600,w=c>2.5&&c<3.5||c>8.5&&c<9.5?1:0,v=m.filter(p=>p===5).length,f=Math.round(Math.min(100,v*15+Math.abs(Math.sin(r/8))*6)),g=Number((30+v*1.4+Math.sin(r/11)*1.5).toFixed(1)),b=Number((g-(1.4+v*.35)).toFixed(1));s.push([l,...m,w,g,b,f])}At({interval_s:t,uptime_s:e,count:o,entries:s}),ta(6)}function ta(t){let e=[];for(let o=0;o<t;o++){let a=Xo[Tt%Xo.length];e.push([Tt,a[0],a[1],a[2]]),Tt++}Et(e,Tt)}function Jr(){je+=1,y(i.uptime,{value:Qo+Math.floor((Date.now()-ea)/1e3)}),y(i.wifi,{value:-55-Math.round((1+Math.sin(je/4))*6)});let t=0,e=0,o=0;for(let n=0;n<ie;n++){let l=n+1,u=!!j.enabled[n],m=j.temp[n],c=j.setpoint[n],w=u&&j.driversEnabled&&!j.manualMode&&m<c-.25;j.manualMode?j.valve[n]=Math.max(0,j.valve[n]):!u||!j.driversEnabled?j.valve[n]=Math.max(0,j.valve[n]-6):w?j.valve[n]=Math.min(100,j.valve[n]+7+l%3):j.valve[n]=Math.max(0,j.valve[n]-5);let v=w?.05+j.valve[n]/2200:-.03+j.valve[n]/3200;j.temp[n]=m+v+Math.sin((je+l)/5)*.04,u&&j.valve[n]>0&&(t+=j.valve[n],e+=1,o=Math.max(o,j.valve[n])),y(h.temp(l),{value:j.temp[n]}),y(h.valve(l),{value:Math.round(j.valve[n])});let f=Math.max(0,(j.setpoint[n]-j.temp[n]-.15)*.22);y(h.preheatAdvance(l),{value:Number(f.toFixed(2))}),y(h.state(l),{state:u?w?"heating":"idle":"off"}),y(h.enabled(l),{value:u,state:u?"on":"off"}),y(h.probeTemp(l),{value:j.temp[n]+Math.sin((je+l)/6)*.1})}let a=29.5+o*.075+e*.18+Math.sin(je/6)*.25,s=a-(e?2.1+t/Math.max(1,e*50):1.1);y(i.flow,{value:Number(a.toFixed(1))}),y(i.ret,{value:Number(s.toFixed(1))}),y(h.probeTemp(7),{value:Number((s-.4).toFixed(1))}),y(h.probeTemp(8),{value:Number((a+.2).toFixed(1))}),it(!0);let r=T("zoneStateHistory");r&&(r.uptime_s=Number(Date.now()/1e3)|0),je%3===0&&ta(1)}function Yo(t,e){xe.busy=!0,xe.direction=e,xe.zone=t,xe.startedAt=Date.now()}function Qr(){return xe.startedAt?Date.now()-xe.startedAt:0}function en(t,e,o){if(!o)return .4;let a=e==="open";return t<180?a?22:28:t<500?a?15.2:19.4:t<2200?a?14.6:19.1:!a&&t<2800?24.2:!a&&t<3400?20.4:t<lt-300?a?18.5:26.8:a?25.4:41.2}function tn(t,e,o){return o?e==="open"?t>lt-300?3:0:t<2200?0:t<3e3?1:t<lt-300?2:3:0}function Jo(t,e){return e?t<200?3200:t<2200?1800+Math.round(Math.sin(t/140)*80):4200:0}function oa(){let t=Qr(),e=xe.busy&&t<lt;xe.busy&&!e&&(xe.busy=!1);let o=en(t,xe.direction,e||t<lt+80);return{ok:!0,version:"v1",data:{drivers_enabled:!!j.driversEnabled,motor_safety:{backend:"mock",motor_busy:e,drive_on:e,latch_faulted:!1,fault_code:0,current_ma:Number(o.toFixed(1)),stroke_phase:tn(t,xe.direction,e),armed:!!j.driversEnabled,tacho_period_us:Jo(t,e),tacho_cadence_us:Jo(t,e),tacho_rejected:e?Math.floor(t/900):0,tacho_hardware_count:e?Math.floor(t/8):0,tacho_adc_count:e?Math.floor(t/8):0,tacho_amp_raw:e?40:0,invalid_samples:0,motion_evidence_count:e?Math.floor(t/8):0,motor_runtime_ms:e?t:0,sample_sequence:je}}}}function on(t,e){let o=e==="open";if(t<180)return o?22-t*.03:28-t*.04;if(t<650)return o?14.8:19.2;if(t<2200)return(o?14.5:19)+Math.sin(t/90)*.35;if(!o&&t<2600)return 19+(t-2200)*.012;if(!o&&t<3e3)return 23.8-(t-2600)*.008;if(t<3400)return o?16.2+(t-2200)*.004:22.5+(t-3e3)*.01;let a=o?14.5+(t-3400)*.018:26+(t-3400)*.03;return Math.min(o?26.4:44.5,a)}function aa(t){let e=t||xe.direction||"open",o=e==="open",a=o?3900:4200,s=["t_ms,motion_count,current_ma,adc_current_raw,drive_on,direction_open,armed,stroke_phase,tacho_period_us,tacho_amp_raw,bemf_raw_a,bemf_raw_b,bemf_differential_raw,bemf_separation_us,bemf_valid,bemf_moving,invalid_bemf_samples"],r=0;for(let n=0;n<=a;n+=10){let l=on(n,e);n>180&&n<a-80&&(r+=n%20===0?1:0);let u=0;o?u=n>a-400?3:0:n>=2200&&n<3e3?u=1:n>=3e3&&n<3600?u=2:n>=3600&&(u=3);let m=n<200?3200:n<a-400?1800+Math.round(Math.sin(n/140)*80):4200;s.push([n,r,l.toFixed(1),1200,1,o?1:0,1,u,m,40,0,0,0,0,0,1,0].join(","))}return s.join(`
`)+`
`}function ra(){Go||(Yr(),Re(!0),Go=setInterval(Jr,1200))}function Nt(t){let e=t.key||"",o=t.value,a=t.zone||0;if(e==="zone_setpoint"&&a>=1&&a<=ie){let r=Number(o);Number.isNaN(r)||(j.setpoint[a-1]=r,y(h.setpoint(a),{value:r}),y(h.baseSetpoint(a),{value:r}),y(h.effectiveSetpoint(a),{value:r}),H("Zone "+a+" setpoint set to "+r.toFixed(1)+"\xB0C",a));return}if(e==="zone_enabled"&&a>=1&&a<=ie){let r=o>.5;j.enabled[a-1]=r?1:0,y(h.enabled(a),{value:r,state:r?"on":"off"}),H("Zone "+a+(r?" enabled":" disabled"),a);return}if(e==="drivers_enabled"){let r=o>.5;j.driversEnabled=r?1:0,r||(xe.busy=!1),y(i.drivers,{value:r,state:r?"on":"off"}),H(r?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let r=o>.5;j.manualMode=r?1:0,Ce("manualMode",r);return}if(e==="motor_target"&&a>=1&&a<=ie){let r=Number(o||0);y(h.motorTarget(a),{value:Math.max(0,Math.min(100,Math.round(r)))}),H("Motor "+a+" target set to "+r+"%",a);return}if(e==="command"){let r=String(o);if(r==="i2c_scan"){Xe(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),H("I2C scan complete");return}if(r==="calibrate_all_motors"||r==="restart"){H("Command executed: "+r);return}if(r==="firmware_check"||r==="firmware_prepare"){H("Command executed: "+r);return}if(r==="firmware_install"){H("Firmware install started (mock) \u2014 valves stop, device reboots");return}if(r==="open_motor_timed"&&a>=1&&a<=ie){Yo(a,"open"),H("Motor "+a+" open timed",a);return}if(r==="close_motor_timed"&&a>=1&&a<=ie){Yo(a,"close"),H("Motor "+a+" close timed",a);return}if(r==="stop_motor"&&a>=1&&a<=ie){xe.busy=!1,H("Motor "+a+" stopped",a);return}if(r==="motor_reset_fault"&&a>=1&&a<=ie){H("Motor "+a+" fault reset",a);return}if(r==="motor_reset_learned_factors"&&a>=1&&a<=ie){H("Motor "+a+" learned factors reset",a);return}if(r==="motor_reset_and_relearn"&&a>=1&&a<=ie){H("Motor "+a+" reset and relearn started",a);return}if(r==="ble_clock_sync_now"){y(i.bleClockSyncAdvertising,{state:"on"}),y(i.bleClockSyncLastError,{state:""}),setTimeout(()=>{y(i.bleClockSyncAdvertising,{state:"off"}),y(i.bleClockSyncLastOkS,{value:Number(Date.now()/1e3)|0})},400),H("Room clock broadcast started");return}if(r==="dump_task_stats"){H("Task stats dumped to device log (mock)");return}return}if(e==="zone_probe"&&a>=1){y(h.probe(a),{state:String(o)}),H("Setting updated: "+e+" = "+o,a);return}if(e==="zone_temp_source"&&a>=1){y(h.tempSource(a),{state:String(o)}),H("Setting updated: "+e+" = "+o,a);return}if(e==="zone_sync_to"&&a>=1){y(h.syncTo(a),{state:String(o)}),H("Setting updated: "+e+" = "+o,a);return}if(e==="manifold_type"){y(i.manifoldType,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="manifold_flow_probe"){y(i.manifoldFlowProbe,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="manifold_return_probe"){y(i.manifoldReturnProbe,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="motor_profile_default"){y(i.motorProfileDefault,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="simple_preheat_enabled"){y(i.simplePreheatEnabled,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="minimum_flow_always"){y(i.minimumFlowAlways,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="ble_clock_sync_enabled"){y(i.bleClockSyncEnabled,{state:String(o)}),H("Setting updated: "+e+" = "+o);return}if(e==="zone_name"&&a>=1){y(h.name(a),{state:String(o)}),H("Setting updated: "+e+" = "+o,a);return}if(e==="zone_ble_mac"&&a>=1){y(h.ble(a),{state:String(o)}),H("Setting updated: "+e+" = "+o,a);return}if(e==="authority_approve_proposal"){y(i.authorityInstallationId,{state:C(i.authorityProposalInstallationId)||"lune-mock"}),y(i.authorityCoordinatorId,{state:C(i.authorityProposalCoordinatorId)||"touch-mock"}),y(i.authorityConfigured,{state:"on",value:!0}),y(i.authorityProposalPending,{state:"off",value:!1}),H("Discovered Lune Touch approved");return}if(e==="authority_revoke"){y(i.authorityInstallationId,{state:""}),y(i.authorityCoordinatorId,{state:""}),y(i.authorityConfigured,{state:"off",value:!1}),y(i.authorityState,{state:"unconfigured"}),H("Lune Touch disconnected");return}let s={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,min_zone_flow_pct:i.minZoneFlowPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};if(s[e]){let r=Number(o);Number.isNaN(r)||(y(s[e],{value:r}),H("Setting updated: "+e+" = "+o));return}}var co="v1.1.0";function na(){return{tag_name:co,published_at:new Date(Date.now()-36*3600*1e3).toISOString(),body:`Faster endstop detection on HmIP valves.
Room clock broadcasts now retry after a busy radio.
Dashboard: firmware updates and settings backup.`,assets:[{name:"lune-v6-"+co+".ota.bin",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/lune-v6-"+co+".ota.bin"},{name:"manifest-lune-v6.json",browser_download_url:"https://github.com/birkemosen/lune/releases/latest/download/manifest-lune-v6.json"}]}}function sa(t){let e=[];for(let o=1;o<=ie;o++)e.push({zone:o,name:C(h.name(o)),enabled:C(h.enabled(o))==="on",setpoint_c:L(h.setpoint(o)),probe:C(h.probe(o)),temp_source:C(h.tempSource(o)),ble_mac:C(h.ble(o)),sync_to:C(h.syncTo(o))});return{_type:"lune-v6-settings",_version:1,exported_at:new Date().toISOString(),firmware:C(i.firmware),device:{mac:C(i.mac)},settings:{manifold_type:C(i.manifoldType),manifold_flow_probe:C(i.manifoldFlowProbe),manifold_return_probe:C(i.manifoldReturnProbe),motor_profile_default:C(i.motorProfileDefault),min_zone_flow_pct:L(i.minZoneFlowPct),minimum_flow_always:C(i.minimumFlowAlways)==="on",simple_preheat_enabled:C(i.simplePreheatEnabled)==="on",ble_clock_sync_enabled:C(i.bleClockSyncEnabled)==="on",ble_clock_sync_interval_min:L(i.bleClockSyncIntervalMin)},zones:e,learned:t?{motors:e.map(o=>({zone:o.zone,open_ripples:400+o.zone,close_ripples:390+o.zone}))}:null}}function ia(t,e){let o=Object.keys(t&&t.settings||{}).length,a=Array.isArray(t&&t.zones)?t.zones.length:0,s=e&&t&&t.learned?ie:0;return H("Settings restored from backup (mock)"),{applied:o+a+s,skipped:e?0:ie,ignored:t&&t._version===1?0:1}}window.__hv6_mock={setSetpoint(t,e){Nt({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!j.enabled[t-1];Nt({key:"zone_enabled",value:e?1:0,zone:t})}};function po(t,e){let o=URL.createObjectURL(e),a=document.createElement("a");a.href=o,a.download=t,a.rel="noopener",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function uo(t,e,o){po(t,new Blob([String(e)],{type:(o||"text/plain")+";charset=utf-8"}))}function mo(t,e){let o=new Date,a=r=>String(r).padStart(2,"0"),s=o.getFullYear()+a(o.getMonth()+1)+a(o.getDate())+"-"+a(o.getHours())+a(o.getMinutes());return t+"-"+s+"."+e}var Ve="/api/hv6/v1",an="https://api.github.com/repos/birkemosen/lune/releases/latest",rn="https://github.com/birkemosen/lune/releases/latest/download/",nn="/update",sn="lune-v6-settings";function Ee(){return!!(window.LV6_DASHBOARD_CONFIG&&window.LV6_DASHBOARD_CONFIG.mock)}function go(t,e){let o=new URLSearchParams;for(let[s,r]of Object.entries(e||{}))r!=null&&o.append(s,r);let a=o.toString();return Ve+t+(a?"?"+a:"")}function me(t,e,o){if(lo(),Ee())try{return Nt(o),Promise.resolve({ok:!0})}finally{Mt()}let a=sessionStorage.getItem("hv6_local_access_key")||"",s=new URLSearchParams;for(let[n,l]of Object.entries(e||{}))l!=null&&s.append(n,String(l));let r=n=>fetch(Ve+t,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","X-Lune-Local-Key":n,"X-Lune-CSRF":n,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:s.toString()});return r(a).then(async n=>{if(n.status===403&&!a){let l=window.prompt("Enter the Lune commissioning key to change local settings")||"";l&&(sessionStorage.setItem("hv6_local_access_key",l),a=l,n=await r(a))}return!n.ok&&[400,404,415].includes(n.status)?fetch(go(t,e),{method:"POST"}):(n.ok||console.warn(`API call failed: POST ${t} status=${n.status}`),n)}).catch(n=>{throw console.error(`API call error: POST ${t}:`,n),n}).finally(()=>{Mt()})}function bo(){return sessionStorage.getItem("hv6_local_access_key")||""}function ln(t,e,o){lo();let a=bo();return fetch(go(t,o),{method:"POST",headers:{"Content-Type":"application/json","X-Lune-Local-Key":a,"X-Lune-CSRF":a,"Idempotency-Key":crypto.randomUUID?crypto.randomUUID():String(Date.now())},body:JSON.stringify(e)}).finally(()=>{Mt()})}function Dt(t,e){let o=Number(e);y(h.setpoint(t),{value:o}),y(h.baseSetpoint(t),{value:o});let a=Number(L(h.coordinatorOffset(t))),s=Number.isFinite(a)?o+a:o;return y(h.effectiveSetpoint(t),{value:s}),me(`/zones/${t}/setpoint`,{setpoint_c:o},{key:"zone_setpoint",value:o,zone:t})}function ca(t,e){return y(h.enabled(t),{state:e?"on":"off",value:e}),me(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function ct(t){return y(i.drivers,{state:t?"on":"off",value:t}),me("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}function ye(t,e){return me("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function da(){return Xe("Scanning I2C bus..."),H("I2C scan started"),ye("i2c_scan")}var cn={zone_probe:t=>h.probe(t),zone_temp_source:t=>h.tempSource(t),zone_sync_to:t=>h.syncTo(t)},dn={zone_ble_mac:t=>h.ble(t),zone_name:t=>h.name(t)},pn={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,ble_clock_sync_enabled:i.bleClockSyncEnabled},un={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,ble_clock_sync_interval_min:i.bleClockSyncIntervalMin};function Pt(t,e,o){let a=cn[e];return a&&y(a(t),{state:o}),me("/settings/select",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function fo(t,e,o){let a=dn[e];return a&&y(a(t),{state:o}),me("/settings/text",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function Se(t,e){let o=pn[t];return o&&y(o,{state:e}),me("/settings/select",{key:t,value:e},{key:t,value:e})}function we(t,e){let o=Number(e),a=un[t];return a&&!Number.isNaN(o)&&y(a,{value:o}),me("/settings/number",{key:t,value:o},{key:t,value:o})}function pa(){return me("/authority/approve-proposal",{},{key:"authority_approve_proposal"}).then(async t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not approve the discovered Lune Touch.");let e=typeof t.json=="function"?await t.json():{data:{installation_id:C(i.authorityProposalInstallationId)||"lune-mock",coordinator_id:C(i.authorityProposalCoordinatorId)||"touch-mock",local_access_key:"mock-local-access-key"}},o=(e==null?void 0:e.data)||{};return o.local_access_key&&sessionStorage.setItem("hv6_local_access_key",o.local_access_key),o.installation_id&&y(i.authorityInstallationId,{state:o.installation_id}),o.coordinator_id&&y(i.authorityCoordinatorId,{state:o.coordinator_id}),y(i.authorityConfigured,{state:"on",value:!0}),y(i.authorityProposalPending,{state:"off",value:!1}),e})}function ua(){return me("/authority/revoke",{},{key:"authority_revoke"}).then(t=>{if(!(t!=null&&t.ok))throw new Error("V6 could not disconnect Lune Touch.");return sessionStorage.removeItem("hv6_local_access_key"),y(i.authorityInstallationId,{state:""}),y(i.authorityCoordinatorId,{state:""}),y(i.authorityConfigured,{state:"off",value:!1}),t})}function ma(t,e){let o=String(e||"").trim();return H("Zone "+t+" renamed to "+(o||"(blank)"),t),fo(t,"zone_name",o)}function ga(t,e){let o=Number(e),a=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return y(h.motorTarget(t),{value:a}),H("Motor "+t+" target set to "+a+"%",t),me(`/motors/${t}/target`,{value:a},{key:"motor_target",value:a,zone:t})}function Ot(t,e=1e4){return H("Motor "+t+" open for "+e+"ms",t),me(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function It(t,e=1e4){return H("Motor "+t+" close for "+e+"ms",t),me(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function vo(t){return H("Motor "+t+" stopped",t),me(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function ba(){H("Emergency stop \u2014 all motors halted");let t=[];for(let e=1;e<=6;e++)t.push(me(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e}));return Promise.all(t).then(e=>ct(!1).then(()=>e))}async function fa(){if(Ee())return oa();let t=await fetch(Ve+"/diagnostics",{cache:"no-store"});if(!t.ok)throw new Error("Diagnostics fetch failed: "+t.status);return t.json()}async function va(){if(Ee())return aa();let t=await fetch(Ve+"/motor-trace.csv",{cache:"no-store"});if(t.status===409){let e=new Error("motor_busy");throw e.code="motor_busy",e}if(!t.ok)throw new Error("Motor trace fetch failed: "+t.status);return t.text()}function dt(t){return Ce("manualMode",!!t),H(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),me("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function ha(t){return H("Motor "+t+" fault reset",t),ye("motor_reset_fault",t)}function xa(t){return H("Motor "+t+" learned factors reset",t),ye("motor_reset_learned_factors",t)}function ya(t){return H("Motor "+t+" reset and relearn started",t),ye("motor_reset_and_relearn",t)}function wa(){return H("Task stats dumped to device log"),ye("dump_task_stats")}function ho(){Ee()||fetch(Ve+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&At(t)}).catch(()=>{})}function ka(){return ye("firmware_check")}function za(){return H("Firmware install requested"),ye("firmware_install")}function Sa(){return ye("firmware_prepare")}function xo(t){let e="lune-v6-"+(t||"latest")+".ota.bin";return{name:e,url:rn+e}}function la(t,e){let o=Array.isArray(t)?t:[],a=r=>o.find(n=>r.test(String(n&&n.name||""))),s=a(/^lune-v6.*\.ota\.bin$/i)||a(/\.ota\.bin$/i)||a(/\.bin$/i);return s&&s.browser_download_url?{name:String(s.name),url:String(s.browser_download_url)}:xo(e)}var Pe=class extends Error{constructor(e,o,a){super(a||e),this.name="ReleaseCheckError",this.code=e,this.status=o||0}};async function _a(){if(Ee()){let a=na(),s=String(a&&a.tag_name||"");return{tag:s,notes:String(a&&a.body||""),publishedAt:String(a&&a.published_at||""),asset:la(a&&a.assets,s)}}let t;try{t=await fetch(an,{cache:"no-store",headers:{Accept:"application/vnd.github+json"}})}catch(a){throw new Pe("network",0,a&&a.message?a.message:"network")}if(t.status===404)throw new Pe("no_releases",404,"No published GitHub release");if(!t.ok)throw new Pe("http",t.status,"Release check failed: "+t.status);let e=await t.json(),o=String(e&&e.tag_name||"");if(!o)throw new Pe("no_releases",404,"No published GitHub release");return{tag:o,notes:String(e&&e.body||""),publishedAt:String(e&&e.published_at||""),asset:la(e&&e.assets,o)}}function Ca(t,e){return Ee()?new Promise(o=>{let a=0,s=setInterval(()=>{a=Math.min(100,a+20),e&&e(a),a>=100&&(clearInterval(s),H("Firmware image uploaded (mock)"),o("Update Successful!"))},220)}):new Promise((o,a)=>{let s=new FormData;s.append("update",t,t.name);let r=new XMLHttpRequest;r.open("POST",nn);let n=bo();n&&(r.setRequestHeader("X-Lune-Local-Key",n),r.setRequestHeader("X-Lune-CSRF",n)),r.upload.onprogress=l=>{e&&l.lengthComputable&&e(Math.min(100,Math.round(l.loaded/l.total*100)))},r.onload=()=>{let l=String(r.responseText||"");if(r.status>=200&&r.status<300&&!/fail/i.test(l)){o(l);return}a(new Error("OTA upload rejected: "+r.status+" "+l))},r.onerror=()=>a(new Error("OTA upload connection lost")),r.send(s)})}function Rt(t){return t&&t._type?t:t&&t.data&&t.data._type||t&&t.data?t.data:t}async function La(t=!0){if(Ee())return Rt(sa(t));let e=await fetch(go("/settings/export",{include_learned:t?1:0}),{cache:"no-store",headers:{"X-Lune-Local-Key":bo()}});if(!e.ok)throw new Error("Settings export failed: "+e.status);return Rt(await e.json())}function qt(t){let e=Rt(t);return!!(e&&e._type===sn)}async function Ma(t,e=!0){let o=typeof t=="string"?JSON.parse(t):t,a=Rt(o);if(!qt(a))throw new Error("not_a_lune_backup");if(Ee())return ia(a,e);let s=await ln("/settings/import",Object.assign({},a,{restore_learned:!!e}),{restore_learned:e?1:0});if(!s.ok)throw new Error("Settings restore failed: "+s.status);let r=await s.json().catch(()=>({})),n=r&&r.data?r.data:r||{};return H("Settings restored from backup"),{applied:Number(n.applied||0),skipped:Number(n.skipped||0),ignored:Number(n.ignored||0)}}function Aa(t){let e=mo("lune-v6-settings","json");return uo(e,JSON.stringify(t,null,2),"application/json"),e}function mn(){let t={1:"ERROR",2:"WARN",3:"INFO",4:"CONFIG",5:"DEBUG",6:"VERBOSE",7:"VERY_VERBOSE"};return Ft().map(e=>"["+(t[e.level]||"?")+"] "+(e.tag||"")+": "+(e.msg||"")).join(`
`)}async function Ea(){let t=mo("lune-v6-logs","txt");if(Ee())return uo(t,mn()||"No log lines buffered."),t;let e=await fetch(Ve+"/logs/download",{cache:"no-store"});if(!e.ok)throw new Error("Log download failed: "+e.status);return po(t,await e.blob()),t}function yo(){if(Ee())return;let t=Wo();fetch(Ve+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Et(e.lines,e.next_seq)}).catch(()=>{})}var Ht=null,Fa=null,Ta=null,Na=null,wo=null;async function gn(){Ht&&Ht.abort(),Ht=new AbortController;let t=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Ht.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function Ra(t){if(!(!t||typeof t!="object")&&!Zo()){for(let e in t)y(e,t[e]);it(!1)}}function bn(t){if(t){if(!t.type){Ra(t);return}if(t.type==="state"){Ra(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;H(e),String(e).indexOf("I2C_SCAN:")!==-1&&Xe(String(e))}}}function fn(){ho(),Fa||(Fa=setInterval(ho,300*1e3)),yo(),Ta||(Ta=setInterval(yo,3e3))}function Da(){gn().then(t=>{Re(!0),bn(t),fn()}).catch(()=>{Re(!1)})}async function vn(){try{let t=await fetch("/api/hv6/v1/revision",{cache:"no-store"});if(!t.ok)throw new Error("Revision fetch failed");let e=await t.json(),o=e&&e.data,a=o&&o.data_revision;o&&o.uptime_s!=null&&y(i.uptime,{value:Number(o.uptime_s)}),(wo===null||a!==wo)&&(wo=a,Da()),Re(!0)}catch(t){Re(!1)}}function Pa(){let t=window.LV6_DASHBOARD_CONFIG;if(t&&t.mock){ra();return}Da(),Na||(Na=setInterval(vn,3e3))}var Oa=Object.create(null);function P(t,e){if(Oa[t])return;Oa[t]=1;let o=document.createElement("style");o.textContent=e,document.head.appendChild(o)}var Bt={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Update {version}","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.download":"Download","logs.downloadFailed":"Could not download the device log.","logs.waiting":"Waiting for device logs...","footer.product":"LUNE V6 \xB7 LOCAL MANIFOLD CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulic Safety","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers":"Flow chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.setpoint":"Setpoint","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature and coordination","zone.sensor.returnSensor":"Return temperature sensor","zone.sensor.tempSource":"Room temperature source","zone.sensor.bleSensor":"BLE sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.card.setpoint":"Setpoint {value}","zone.room.title":"Zone identity","zone.room.friendlyName":"Name","zone.room.friendlyPlaceholder":"e.g. Living Room","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a minimum valve opening across enabled loops already calling for heat. This is a local V6 hydraulic safeguard; it does not control the heat source or pump.","settings.minFlow.enabledSub":"manual secondary-loop floor, independent of Touch coordination","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.bleClock.title":"Room clocks","settings.bleClock.help":"Lune V6 briefly broadcasts the current time so nearby Shelly BLU H&T displays can correct clock drift. Press Sync now, then 2\xD7 on a display in setup to force an immediate update.","settings.bleClock.enabledSub":"Broadcast time so nearby Shelly BLU displays can correct drift.","settings.bleClock.interval":"Broadcast interval","settings.bleClock.intervalSub":"Short bursts. Displays usually apply time about once a day.","settings.bleClock.interval15":"Every 15 minutes","settings.bleClock.interval60":"Every hour","settings.bleClock.interval360":"Every 6 hours","settings.bleClock.interval1440":"Once a day","settings.bleClock.lastSync":"Last broadcast","settings.bleClock.syncNow":"Sync now","settings.bleClock.never":"Not yet","settings.bleClock.waitingClock":"Waiting for network time","settings.bleClock.busy":"Radio busy, will retry","settings.bleClock.hoursAgo":"{value}h ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.firmware.title":"Firmware","settings.firmware.help":"Your browser reads the newest published GitHub release when you open Settings or press Check for update. Until a release exists, Check reports that clearly. Installing stops valve movement and reboots the controller; heating resumes automatically afterwards.","settings.firmware.installed":"Installed version","settings.firmware.unknownVersion":"Unknown","settings.firmware.check":"Check for update","settings.firmware.checking":"Checking GitHub...","settings.firmware.upToDate":"Up to date","settings.firmware.checkFailed":"Could not reach GitHub","settings.firmware.noReleases":"No published release yet","settings.firmware.available":"Update available","settings.firmware.availableStatus":"{version} is available","settings.firmware.badgeTitle":"Open firmware settings","settings.firmware.releaseNotes":"Release notes","settings.firmware.deviceReported":"Reported by the controller from the release manifest.","settings.firmware.backupFirst":"Save a settings backup first","settings.firmware.install":"Install now","settings.firmware.installing":"Installing...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Install {version} now? Valves stop moving and the controller reboots. Save a settings backup first if you have not already.","settings.firmware.installStarted":"Install started. V6 downloads the image, stops the valves and reboots.","settings.firmware.installFailed":"Install request failed - could not reach the device.","settings.firmware.manual":"Manual upload","settings.firmware.manualLabel":"Firmware image","settings.firmware.manualSub":"Push a .bin you built locally. The controller reboots when flashing finishes.","settings.firmware.choose":"Choose .bin...","settings.firmware.noFile":"No file selected","settings.firmware.upload":"Upload and install","settings.firmware.uploading":"Uploading {value}%","settings.firmware.confirmUpload":"Upload {file} to this controller? Valves stop moving and the device reboots when flashing finishes.","settings.firmware.uploadDone":"Image flashed. The controller is rebooting.","settings.firmware.uploadFailed":"Upload failed. The controller kept its current firmware.","settings.appearance.title":"Appearance","settings.appearance.help":"Accent colour is stored in this browser only. It does not change how the controller runs.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Colour used for highlights and selected controls in this browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.backup.title":"Backup and restore","settings.backup.help":"A backup file holds this controller's local configuration: zones, manifold, motor settings and learned endstop values. Restoring overwrites the configuration on this device, and after a factory flash Lune Touch must be approved again.","settings.backup.save":"Settings backup","settings.backup.saveSub":"Downloads zones, manifold, motor and learned values as a JSON file.","settings.backup.saveBtn":"Save backup","settings.backup.saving":"Reading settings from device...","settings.backup.saved":"Backup saved as {file}","settings.backup.saveFailed":"Could not read settings from the device.","settings.backup.restore":"Restore from file","settings.backup.restoreFile":"Backup file","settings.backup.restoreSub":"Overwrites the local configuration on this controller.","settings.backup.restoreLearned":"Restore learned motor values","settings.backup.restoreLearnedSub":"Keeps endstop calibration from the backup instead of relearning every valve.","settings.backup.choose":"Choose file...","settings.backup.noFile":"No file selected","settings.backup.restoreBtn":"Restore","settings.backup.restoring":"Applying backup...","settings.backup.confirmRestore":"Restore {file}? This overwrites the local configuration on this controller. After a factory flash Lune Touch must be approved again.","settings.backup.invalidFile":"Not a Lune V6 settings backup.","settings.backup.readFailed":"Could not read the selected file.","settings.backup.restoreFailed":"Restore failed - the device rejected the file.","settings.backup.restored":"Settings restored.","settings.backup.result":"Applied {applied} \xB7 skipped {skipped} \xB7 ignored {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.resetReason":"Last reset reason","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motor recovery","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Clear fault","diagnostics.recovery.resetFactors":"Reset factors\u2026","diagnostics.recovery.resetRelearn":"Reset and relearn\u2026","diagnostics.recovery.clearFaultTitle":"Clear current fault","diagnostics.recovery.clearFaultHelp":"Acknowledge the current motor fault without changing learned values.","diagnostics.recovery.resetFactorsTitle":"Reset learned factors","diagnostics.recovery.resetFactorsHelp":"Remove calibration values while leaving the valve stopped.","diagnostics.recovery.relearnTitle":"Reset and relearn","diagnostics.recovery.relearnHelp":"Reset calibration and start a complete motor learning cycle.","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.lab.hint":"Guided stroke capture for endstop thresholds.","diagnostics.lab.estop":"Emergency stop","diagnostics.lab.estopHint":"Stops every motor immediately and disables drivers.","diagnostics.lab.estopDone":"Emergency stop \u2014 all motors halted, drivers off. Restart the guide to continue.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Apply suggested","diagnostics.lab.next":"Continue","diagnostics.lab.retry":"Retry this step","diagnostics.lab.restart":"Start over","diagnostics.lab.runningAction":"Motor running\u2026","diagnostics.lab.stepOf":"Step {step} of {total}","diagnostics.lab.steps.setup":"Select motor","diagnostics.lab.steps.arm":"Arm","diagnostics.lab.steps.seat":"Seat valve","diagnostics.lab.steps.open":"Open stroke","diagnostics.lab.steps.close":"Close stroke","diagnostics.lab.steps.review":"Review","diagnostics.lab.setup.title":"Select the motor","diagnostics.lab.setup.copy":"Pick the actuator on the bench. Keep hands clear of the pin. The guide will arm the controller, seat the valve, then capture a full open and close stroke.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm the controller","diagnostics.lab.arm.copy":"This suspends automatic zone control and enables the motor drivers so only this guide can move the valve.","diagnostics.lab.arm.action":"Arm now","diagnostics.lab.seat.title":"Seat the valve","diagnostics.lab.seat.copy":"Close until the pin is seated so the next open stroke starts from a known end. Watch current and runtime in the status board. A short move means it was already closed.","diagnostics.lab.seat.action":"Close until seated","diagnostics.lab.seat.done":"Valve seated. Continue to capture a full opening stroke.","diagnostics.lab.open.title":"Capture the opening stroke","diagnostics.lab.open.copy":"Drive fully open until the housing stop. Status shows live current, runtime and motion count. After the motor stops, the trace is analysed for open thresholds.","diagnostics.lab.open.action":"Start opening","diagnostics.lab.open.done":"Opening captured. Continue to close the same valve for the matching close profile.","diagnostics.lab.close.title":"Capture the closing stroke","diagnostics.lab.close.copy":"Drive fully closed. Watch for free travel, the pin-contact bump, then the hard stop. Stroke and Pin in the status board follow the controller pin detector; the chart marks contact when it fires.","diagnostics.lab.close.action":"Start closing","diagnostics.lab.close.done":"Closing captured. Continue to review both directions before writing values.","diagnostics.lab.review.title":"Review suggested thresholds","diagnostics.lab.review.copy":"Compare the measured strokes with the values in use. Apply writes them to this controller. They stay local until you do.","diagnostics.lab.halt.title":"Guide halted","diagnostics.lab.halt.copy":"Emergency stop cut every motor and disabled the drivers. Start over when the bench is safe.","diagnostics.lab.chart":"Motor current","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live capture","diagnostics.lab.empty":"Status updates here when the motor starts. The trace replaces this after the stroke.","diagnostics.lab.currentMa":"Current","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"Running mean","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Current","diagnostics.lab.suggested":"Suggested","diagnostics.lab.direction":"Direction","diagnostics.lab.drivers":"Drivers","diagnostics.lab.busyFlag":"Motor busy","diagnostics.lab.stroke":"Stroke","diagnostics.lab.stroke.free":"Free travel","diagnostics.lab.stroke.contact":"Pin contact","diagnostics.lab.stroke.load":"Under load","diagnostics.lab.stroke.stopping":"Stopping","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Not seen","diagnostics.lab.pinSeen":"Seen @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Halted","diagnostics.lab.dir.open":"open","diagnostics.lab.dir.close":"close","diagnostics.lab.phase.idle":"Idle","diagnostics.lab.phase.arming":"Arming","diagnostics.lab.phase.armed":"Armed","diagnostics.lab.phase.starting":"Starting motor","diagnostics.lab.phase.waiting":"Waiting for motion","diagnostics.lab.phase.running":"Motor running","diagnostics.lab.phase.fetching":"Reading trace","diagnostics.lab.phase.analyzing":"Analysing stroke","diagnostics.lab.phase.done":"Step complete","diagnostics.lab.phase.failed":"Step failed","diagnostics.lab.phase.halted":"Emergency stop","diagnostics.lab.phase.applied":"Values written","diagnostics.lab.log.selected":"Motor {zone} selected","diagnostics.lab.log.arming":"Arming zone {zone}","diagnostics.lab.log.manual":"Manual mode on","diagnostics.lab.log.drivers":"Motor drivers on","diagnostics.lab.log.armed":"Controller armed","diagnostics.lab.log.armFailed":"Arming failed","diagnostics.lab.log.starting":"Starting {direction} on zone {zone}","diagnostics.lab.log.busy":"Motor is moving","diagnostics.lab.log.stopped":"Motor stopped","diagnostics.lab.log.trace":"Trace downloaded","diagnostics.lab.log.captured":"{direction} captured \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace too short for thresholds","diagnostics.lab.log.seatShort":"Short close \u2014 valve was probably already seated","diagnostics.lab.log.seatContinue":"Continue to the opening stroke","diagnostics.lab.log.traceFailed":"Could not read motor trace","diagnostics.lab.log.startFailed":"Could not start the motor","diagnostics.lab.log.applied":"Suggested thresholds written","diagnostics.lab.log.estop":"Emergency stop","diagnostics.lab.log.pin":"Pin contact at {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin contact in trace at {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"No pin contact in this close stroke","diagnostics.lab.stepChip":"Step {step} of {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Motion","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"Slope","diagnostics.lab.cadence":"Cadence","diagnostics.lab.tachoPeriod":"Tacho period","diagnostics.lab.armed":"Armed","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fault","diagnostics.lab.invalidSamples":"Invalid samples","diagnostics.lab.tachoRejected":"Tacho rejected","diagnostics.lab.res.live":"Live \xB7 ~250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 last 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 last {n} samples (ring full)","diagnostics.lab.res.ringWarn":"Trace ring full ({n} samples \u2248 {s} s). Only the last window is shown.","diagnostics.lab.chart.current":"Motor current","diagnostics.lab.chart.currentAria":"Motor current over stroke time","diagnostics.lab.chart.phase":"Stroke phase","diagnostics.lab.chart.phaseAria":"Stroke phase band over time","diagnostics.lab.chart.cadence":"Commutation cadence","diagnostics.lab.chart.cadenceAria":"Commutation rate from tacho period","diagnostics.lab.chart.cadenceEmpty":"No tacho cadence in this capture.","diagnostics.lab.chart.slope":"Current slope","diagnostics.lab.chart.slopeAria":"Current slope in 500 ms windows","diagnostics.lab.chart.slopeEmpty":"Need a longer stroke to compute slope windows.","diagnostics.lab.chart.layers":"Chart layers","diagnostics.lab.chart.layer.current":"Current","diagnostics.lab.chart.layer.overlays":"Thresholds","diagnostics.lab.chart.layer.phase":"Phase","diagnostics.lab.chart.layer.cadence":"Cadence","diagnostics.lab.chart.layer.slope":"Slope"},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","status.updateAvailable":"Opdatering {version}","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.download":"Download","logs.downloadFailed":"Kunne ikke downloade enhedsloggen.","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"LUNE V6 \xB7 LOKAL MANIFOLD-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.hydraulic":"Hydraulisk sikkerhed","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.connectivity.version":"Version","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers":"Flow-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.setpoint":"Setpunkt","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatur og koordinering","zone.sensor.returnSensor":"Returtemperatursensor","zone.sensor.tempSource":"Rumtemperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.card.setpoint":"Setpunkt {value}","zone.room.title":"Zoneidentitet","zone.room.friendlyName":"Navn","zone.room.friendlyPlaceholder":"fx Stue","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en minimumsventil\xE5bning p\xE5 aktive sl\xF8jfer, der allerede kalder p\xE5 varme. Det er en lokal V6-hydrauliksikring; den styrer ikke varmekilde eller pumpe.","settings.minFlow.enabledSub":"manuel minimumsflow i sekund\xE6rkredsen, uafh\xE6ngigt af Touch-koordinering","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.bleClock.title":"Rumure","settings.bleClock.help":"Lune V6 sender kort det aktuelle tidspunkt, s\xE5 n\xE6rliggende Shelly BLU H&T-displays kan rette ur-drift. Tryk Synkroniser nu, og tryk 2\xD7 p\xE5 displayet i setup for en \xF8jeblikkelig opdatering.","settings.bleClock.enabledSub":"Send tid, s\xE5 n\xE6rliggende Shelly BLU-displays kan rette drift.","settings.bleClock.interval":"Udsendelsesinterval","settings.bleClock.intervalSub":"Korte udsendelser. Displayet anvender typisk tiden cirka \xE9n gang i d\xF8gnet.","settings.bleClock.interval15":"Hvert 15. minut","settings.bleClock.interval60":"Hver time","settings.bleClock.interval360":"Hver 6. time","settings.bleClock.interval1440":"En gang i d\xF8gnet","settings.bleClock.lastSync":"Seneste udsendelse","settings.bleClock.syncNow":"Synkroniser nu","settings.bleClock.never":"Endnu ikke","settings.bleClock.waitingClock":"Venter p\xE5 netv\xE6rkstid","settings.bleClock.busy":"Radio optaget, pr\xF8ver igen","settings.bleClock.hoursAgo":"{value}t siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.appearance.title":"Udseende","settings.appearance.help":"Accentfarven gemmes kun i denne browser. Den \xE6ndrer ikke, hvordan styringen k\xF8rer.","settings.appearance.accent":"Accent","settings.appearance.accentSub":"Farve til highlights og valgte kontroller i denne browser.","settings.appearance.refinedEmber":"Refined Ember","settings.appearance.deepForest":"Deep Forest","settings.firmware.title":"Firmware","settings.firmware.help":"Din browser henter den nyeste publicerede GitHub-release, n\xE5r du \xE5bner Indstillinger eller trykker S\xF8g efter opdatering. Indtil der findes en release, siger Check det tydeligt. Installation stopper ventilbev\xE6gelse og genstarter styringen; varmen forts\xE6tter automatisk bagefter.","settings.firmware.installed":"Installeret version","settings.firmware.unknownVersion":"Ukendt","settings.firmware.check":"S\xF8g efter opdatering","settings.firmware.checking":"Kontrollerer GitHub...","settings.firmware.upToDate":"Opdateret","settings.firmware.checkFailed":"Kunne ikke n\xE5 GitHub","settings.firmware.noReleases":"Ingen publiceret release endnu","settings.firmware.available":"Opdatering tilg\xE6ngelig","settings.firmware.availableStatus":"{version} er tilg\xE6ngelig","settings.firmware.badgeTitle":"\xC5bn firmware-indstillinger","settings.firmware.releaseNotes":"Udgivelsesnoter","settings.firmware.deviceReported":"Rapporteret af styringen ud fra release-manifestet.","settings.firmware.backupFirst":"Gem en backup af indstillingerne f\xF8rst","settings.firmware.install":"Installer nu","settings.firmware.installing":"Installerer...","settings.firmware.download":"Download .ota.bin","settings.firmware.confirmInstall":"Installer {version} nu? Ventilerne stopper, og styringen genstarter. Gem en backup af indstillingerne f\xF8rst, hvis du ikke allerede har gjort det.","settings.firmware.installStarted":"Installation startet. V6 henter imaget, stopper ventilerne og genstarter.","settings.firmware.installFailed":"Installationsanmodning fejlede - kunne ikke n\xE5 enheden.","settings.firmware.manual":"Manuel upload","settings.firmware.manualLabel":"Firmware-image","settings.firmware.manualSub":"Send en .bin du selv har bygget. Styringen genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.choose":"V\xE6lg .bin...","settings.firmware.noFile":"Ingen fil valgt","settings.firmware.upload":"Upload og installer","settings.firmware.uploading":"Uploader {value}%","settings.firmware.confirmUpload":"Upload {file} til denne styring? Ventilerne stopper, og enheden genstarter, n\xE5r flashningen er f\xE6rdig.","settings.firmware.uploadDone":"Image flashet. Styringen genstarter.","settings.firmware.uploadFailed":"Upload fejlede. Styringen beholdt sin nuv\xE6rende firmware.","settings.backup.title":"Backup og gendannelse","settings.backup.help":"En backupfil indeholder denne styrings lokale konfiguration: zoner, manifold, motorindstillinger og l\xE6rte endstop-v\xE6rdier. Gendannelse overskriver konfigurationen p\xE5 enheden, og efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.save":"Backup af indstillinger","settings.backup.saveSub":"Downloader zoner, manifold, motor og l\xE6rte v\xE6rdier som en JSON-fil.","settings.backup.saveBtn":"Gem backup","settings.backup.saving":"L\xE6ser indstillinger fra enheden...","settings.backup.saved":"Backup gemt som {file}","settings.backup.saveFailed":"Kunne ikke l\xE6se indstillinger fra enheden.","settings.backup.restore":"Gendan fra fil","settings.backup.restoreFile":"Backupfil","settings.backup.restoreSub":"Overskriver den lokale konfiguration p\xE5 denne styring.","settings.backup.restoreLearned":"Gendan l\xE6rte motorv\xE6rdier","settings.backup.restoreLearnedSub":"Beholder endstop-kalibrering fra backuppen i stedet for at genl\xE6re hver ventil.","settings.backup.choose":"V\xE6lg fil...","settings.backup.noFile":"Ingen fil valgt","settings.backup.restoreBtn":"Gendan","settings.backup.restoring":"Anvender backup...","settings.backup.confirmRestore":"Gendan {file}? Det overskriver den lokale konfiguration p\xE5 denne styring. Efter en fabriksflash skal Lune Touch godkendes igen.","settings.backup.invalidFile":"Ikke en Lune V6-backupfil.","settings.backup.readFailed":"Kunne ikke l\xE6se den valgte fil.","settings.backup.restoreFailed":"Gendannelse fejlede - enheden afviste filen.","settings.backup.restored":"Indstillinger gendannet.","settings.backup.result":"Anvendt {applied} \xB7 sprunget over {skipped} \xB7 ignoreret {ignored}","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.resetReason":"Seneste genstarts\xE5rsag","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Motorgendannelse","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Ryd fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer\u2026","diagnostics.recovery.resetRelearn":"Nulstil og genl\xE6r\u2026","diagnostics.recovery.clearFaultTitle":"Ryd aktuel fejl","diagnostics.recovery.clearFaultHelp":"Kvitter den aktuelle motorfejl uden at \xE6ndre l\xE6rte v\xE6rdier.","diagnostics.recovery.resetFactorsTitle":"Nulstil l\xE6rte faktorer","diagnostics.recovery.resetFactorsHelp":"Fjern kalibreringsv\xE6rdier, mens ventilen forbliver stoppet.","diagnostics.recovery.relearnTitle":"Nulstil og genl\xE6r","diagnostics.recovery.relearnHelp":"Nulstil kalibreringen og start en komplet motorindl\xE6ring.","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.lab.hint":"Guidet slagfangst til endstop-t\xE6rskler.","diagnostics.lab.estop":"N\xF8dstop","diagnostics.lab.estopHint":"Stopper alle motorer med det samme og slukker driverne.","diagnostics.lab.estopDone":"N\xF8dstop \u2014 alle motorer er stoppet, drivere slukket. Start guiden forfra for at forts\xE6tte.","diagnostics.lab.motor":"Motor","diagnostics.lab.status":"Status","diagnostics.lab.apply":"Anvend forslag","diagnostics.lab.next":"Forts\xE6t","diagnostics.lab.retry":"Pr\xF8v trinnet igen","diagnostics.lab.restart":"Start forfra","diagnostics.lab.runningAction":"Motor k\xF8rer\u2026","diagnostics.lab.stepOf":"Trin {step} af {total}","diagnostics.lab.steps.setup":"V\xE6lg motor","diagnostics.lab.steps.arm":"Arm\xE9r","diagnostics.lab.steps.seat":"S\xE6t ventil","diagnostics.lab.steps.open":"\xC5bne-slag","diagnostics.lab.steps.close":"Lukke-slag","diagnostics.lab.steps.review":"Gennemg\xE5","diagnostics.lab.setup.title":"V\xE6lg motoren","diagnostics.lab.setup.copy":"V\xE6lg aktuatoren p\xE5 b\xE6nken. Hold h\xE6nderne v\xE6k fra pinden. Guiden armerer styringen, s\xE6tter ventilen og fanger derefter et fuldt \xE5bne- og lukkeslag.","diagnostics.lab.setup.action":"Start lab","diagnostics.lab.arm.title":"Arm\xE9r styringen","diagnostics.lab.arm.copy":"Det s\xE6tter automatisk zonestyring p\xE5 pause og t\xE6nder motordriverne, s\xE5 kun denne guide kan flytte ventilen.","diagnostics.lab.arm.action":"Arm\xE9r nu","diagnostics.lab.seat.title":"S\xE6t ventilen","diagnostics.lab.seat.copy":"Luk indtil pinden er sat, s\xE5 n\xE6ste \xE5bning starter fra et kendt endepunkt. F\xF8lg str\xF8m og runtime i statusfeltet. Et kort tr\xE6k betyder, at den allerede sad i bund.","diagnostics.lab.seat.action":"Luk til s\xE6de","diagnostics.lab.seat.done":"Ventilen er sat. Forts\xE6t for at fange et fuldt \xE5bneslag.","diagnostics.lab.open.title":"Fang \xE5bneslaget","diagnostics.lab.open.copy":"K\xF8r helt \xE5ben til husets stop. Status viser str\xF8m, runtime og motion count live. N\xE5r motoren stopper, analyseres tracen til \xE5bne-t\xE6rskler.","diagnostics.lab.open.action":"Start \xE5bning","diagnostics.lab.open.done":"\xC5bning fanget. Forts\xE6t og luk den samme ventil for det matchende lukkeprofil.","diagnostics.lab.close.title":"Fang lukkeslaget","diagnostics.lab.close.copy":"K\xF8r helt lukket. Se efter frit l\xF8b, pin-kontakt og hard stop. Slag og Pin i statusfeltet f\xF8lger styringens pin-detektor; kurven markerer kontakten, n\xE5r den udl\xF8ses.","diagnostics.lab.close.action":"Start lukning","diagnostics.lab.close.done":"Lukning fanget. Forts\xE6t og gennemg\xE5 begge retninger, f\xF8r v\xE6rdierne skrives.","diagnostics.lab.review.title":"Gennemg\xE5 foresl\xE5ede t\xE6rskler","diagnostics.lab.review.copy":"Sammenlign de m\xE5lte slag med de v\xE6rdier, der er i brug. Anvend skriver dem til denne styring. De forbliver lokale, indtil du g\xF8r det.","diagnostics.lab.halt.title":"Guiden er stoppet","diagnostics.lab.halt.copy":"N\xF8dstoppet har stoppet alle motorer og slukket driverne. Start forfra, n\xE5r b\xE6nken er sikker.","diagnostics.lab.chart":"Motorstr\xF8m","diagnostics.lab.chartSub":"{direction} \xB7 {ms} ms","diagnostics.lab.chartLive":"Live fangst","diagnostics.lab.empty":"Status opdateres her, n\xE5r motoren starter. Tracen erstatter visningen efter slaget.","diagnostics.lab.currentMa":"Str\xF8m","diagnostics.lab.motion":"Motion count","diagnostics.lab.mean":"K\xF8rende middel","diagnostics.lab.peak":"Peak","diagnostics.lab.runtime":"Runtime","diagnostics.lab.ripples":"Ripples","diagnostics.lab.param":"Parameter","diagnostics.lab.current":"Nuv\xE6rende","diagnostics.lab.suggested":"Foresl\xE5et","diagnostics.lab.direction":"Retning","diagnostics.lab.drivers":"Drivere","diagnostics.lab.busyFlag":"Motor optaget","diagnostics.lab.stroke":"Slag","diagnostics.lab.stroke.free":"Frit l\xF8b","diagnostics.lab.stroke.contact":"Pin-kontakt","diagnostics.lab.stroke.load":"Under last","diagnostics.lab.stroke.stopping":"Stopper","diagnostics.lab.pin":"Pin","diagnostics.lab.pinWaiting":"Ikke set","diagnostics.lab.pinSeen":"Set @ {count}","diagnostics.lab.pinMark":"Pin","diagnostics.lab.pinMetric":"{ms} ms \xB7 {count}","diagnostics.lab.halted":"Stoppet","diagnostics.lab.dir.open":"\xE5bning","diagnostics.lab.dir.close":"lukning","diagnostics.lab.phase.idle":"Klar","diagnostics.lab.phase.arming":"Armerer","diagnostics.lab.phase.armed":"Armeret","diagnostics.lab.phase.starting":"Starter motor","diagnostics.lab.phase.waiting":"Venter p\xE5 bev\xE6gelse","diagnostics.lab.phase.running":"Motor k\xF8rer","diagnostics.lab.phase.fetching":"L\xE6ser trace","diagnostics.lab.phase.analyzing":"Analyserer slag","diagnostics.lab.phase.done":"Trin f\xE6rdigt","diagnostics.lab.phase.failed":"Trin fejlede","diagnostics.lab.phase.halted":"N\xF8dstop","diagnostics.lab.phase.applied":"V\xE6rdier skrevet","diagnostics.lab.log.selected":"Motor {zone} valgt","diagnostics.lab.log.arming":"Armerer zone {zone}","diagnostics.lab.log.manual":"Manuel tilstand til","diagnostics.lab.log.drivers":"Motordrivere til","diagnostics.lab.log.armed":"Styring armeret","diagnostics.lab.log.armFailed":"Armering fejlede","diagnostics.lab.log.starting":"Starter {direction} p\xE5 zone {zone}","diagnostics.lab.log.busy":"Motoren bev\xE6ger sig","diagnostics.lab.log.stopped":"Motor stoppet","diagnostics.lab.log.trace":"Trace hentet","diagnostics.lab.log.captured":"{direction} fanget \xB7 peak {peak} mA","diagnostics.lab.log.weak":"Trace for kort til t\xE6rskler","diagnostics.lab.log.seatShort":"Kort lukning \u2014 ventilen sad sandsynligvis allerede i bund","diagnostics.lab.log.seatContinue":"Forts\xE6t til \xE5bneslaget","diagnostics.lab.log.traceFailed":"Kunne ikke l\xE6se motor-trace","diagnostics.lab.log.startFailed":"Kunne ikke starte motoren","diagnostics.lab.log.applied":"Foresl\xE5ede t\xE6rskler skrevet","diagnostics.lab.log.estop":"N\xF8dstop","diagnostics.lab.log.pin":"Pin-kontakt ved {count} \xB7 {ma} mA","diagnostics.lab.log.pinTrace":"Pin-kontakt i trace ved {count} \xB7 {ma} mA \xB7 {ms} ms","diagnostics.lab.log.pinMissing":"Ingen pin-kontakt i dette lukkeslag","diagnostics.lab.stepChip":"Trin {step} af {total} \xB7 {name}","diagnostics.lab.cluster.motion":"Bev\xE6gelse","diagnostics.lab.cluster.position":"Position","diagnostics.lab.cluster.hardware":"Hardware","diagnostics.lab.slope":"H\xE6ldning","diagnostics.lab.cadence":"Kadence","diagnostics.lab.tachoPeriod":"Tacho-periode","diagnostics.lab.armed":"Armeret","diagnostics.lab.backend":"Backend","diagnostics.lab.fault":"Fejlkode","diagnostics.lab.invalidSamples":"Ugyldige samples","diagnostics.lab.tachoRejected":"Tacho afvist","diagnostics.lab.res.live":"Live \xB7 ca. 250 ms poll","diagnostics.lab.res.trace":"{direction} \xB7 2 ms \xB7 {ms} ms","diagnostics.lab.res.traceReady":"2 ms \xB7 sidste 4 s ring","diagnostics.lab.res.traceTruncated":"2 ms \xB7 sidste {n} samples (ring fuld)","diagnostics.lab.res.ringWarn":"Trace-ringen er fuld ({n} samples \u2248 {s} s). Kun det sidste vindue vises.","diagnostics.lab.chart.current":"Motorstr\xF8m","diagnostics.lab.chart.currentAria":"Motorstr\xF8m over slagets tid","diagnostics.lab.chart.phase":"Slag-fase","diagnostics.lab.chart.phaseAria":"Slag-faseb\xE5nd over tid","diagnostics.lab.chart.cadence":"Kommuteringskadence","diagnostics.lab.chart.cadenceAria":"Kommuteringsrate fra tacho-periode","diagnostics.lab.chart.cadenceEmpty":"Ingen tacho-kadence i denne fangst.","diagnostics.lab.chart.slope":"Str\xF8mh\xE6ldning","diagnostics.lab.chart.slopeAria":"Str\xF8mh\xE6ldning i 500 ms vinduer","diagnostics.lab.chart.slopeEmpty":"Kr\xE6ver et l\xE6ngere slag for h\xE6ldningsvinduer.","diagnostics.lab.chart.layers":"Graflag","diagnostics.lab.chart.layer.current":"Str\xF8m","diagnostics.lab.chart.layer.overlays":"T\xE6rskler","diagnostics.lab.chart.layer.phase":"Fase","diagnostics.lab.chart.layer.cadence":"Kadence","diagnostics.lab.chart.layer.slope":"H\xE6ldning"}},Ia="en".toLowerCase(),ko=Bt[Ia]?Ia:"en";function d(t,e){let o=Bt[ko]&&Bt[ko][t]||Bt.en[t]||t;return e?String(o).replace(/\{(\w+)\}/g,(a,s)=>e[s]==null?"":String(e[s])):o}function M(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=d(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",d(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",d(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",d(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",ko);var hn=`
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
`;P("ui-kit",hn);function ge(t){let e=d(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function xn(t,e){let o=Math.abs(Number(t));return!Number.isFinite(o)||o<1e3?e:Math.pow(10,Math.floor(Math.log10(o))-1)}function yn(t){let e=String(t),o=e.indexOf(".");return o<0?0:e.length-o-1}function ke(t,e={}){let o=t.querySelector(e.title||".ui-card-title"),a=document.createElement("div");a.className="ui-form-banner",a.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",a):t.insertAdjacentElement("afterbegin",a);let s=[],r=()=>a.classList.toggle("show",s.some(p=>p.dirty)),n=(p,x)=>{p.dirty=x,r()};function l(p){return p.markDirty=()=>n(p,!0),s.push(p),p}function u(p,x){let S={dirty:!1,input:p},z=x.baseStep!=null?x.baseStep:parseFloat(p.step)||1,N=yn(z),F=x.min!=null?x.min:p.min!==""?parseFloat(p.min):-1/0,I=x.max!=null?x.max:p.max!==""?parseFloat(p.max):1/0,R=q=>N>0?Number(q).toFixed(N):String(Math.round(Number(q)));if(!x.nostep){let q=document.createElement("div");q.className="ui-stepper",p.parentNode.insertBefore(q,p);let E=document.createElement("button");E.type="button",E.className="ui-step-btn",E.textContent="\u2212",E.setAttribute("aria-label",d("common.decrease"));let Z=document.createElement("button");Z.type="button",Z.className="ui-step-btn",Z.textContent="+",Z.setAttribute("aria-label",d("common.increase")),q.appendChild(E),q.appendChild(p),q.appendChild(Z);let Q=O=>{if(p.disabled)return;let _=parseFloat(p.value);Number.isFinite(_)||(_=parseFloat(p.placeholder)),Number.isFinite(_)||(_=0);let K=Math.min(I,Math.max(F,_+O*xn(_,z)));p.value=R(K),n(S,!0)};E.addEventListener("click",()=>Q(-1)),Z.addEventListener("click",()=>Q(1)),p.addEventListener("keydown",O=>{O.key==="Enter"&&p.blur()})}return p.addEventListener("input",()=>n(S,!0)),S.sync=()=>{let q=x.read();p.value=q!=null&&Number.isFinite(Number(q))?R(q):""},S.commit=()=>{let q=parseFloat(p.value);Number.isFinite(q)&&x.commit(Math.min(I,Math.max(F,q)))},l(S)}function m(p,x){let S={dirty:!1,input:p};return p.addEventListener("input",()=>n(S,!0)),S.sync=()=>{let z=x.read();p.value=z!=null?z:""},S.commit=()=>x.commit(p.value.trim()),l(S)}function c(p,x){let S={dirty:!1,input:p};return p.addEventListener("change",()=>n(S,!0)),S.sync=()=>{let z=x.read();z!=null&&(p.value=z)},S.commit=()=>x.commit(p.value),l(S)}function w(p,x){let S={dirty:!1,input:p,staged:!1},z=p.closest(".ui-row"),N=()=>{p.classList.toggle("on",S.staged),z&&z.classList.toggle("is-on",S.staged),p.setAttribute("aria-checked",S.staged?"true":"false"),x.onChange&&x.onChange(S.staged)};return p.addEventListener("click",()=>{S.staged=!S.staged,n(S,!0),N()}),S.sync=()=>{S.staged=!!x.read(),N()},S.commit=()=>x.commit(S.staged),l(S)}function v(p){let x={dirty:!1,sync:p.sync,commit:p.commit};return l(x)}let f=()=>s.forEach(p=>{!p.dirty&&p.sync&&p.sync()}),g=()=>{s.forEach(p=>{p.dirty&&(p.commit&&p.commit(),p.dirty=!1)}),r(),e.onApply&&e.onApply()},b=()=>{s.forEach(p=>{p.dirty=!1,p.sync&&p.sync()}),r(),e.onDiscard&&e.onDiscard()};return a.querySelector(".ui-form-apply").addEventListener("click",g),a.querySelector(".ui-form-discard").addEventListener("click",b),M(a),{num:u,text:m,select:c,toggle:w,custom:v,refresh:f,apply:g,discard:b,isDirty:()=>s.some(p=>p.dirty)}}var wn=`
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
  .v6-side-link[data-section="settings"],
  .v6-side-link[data-section="motorlab"] { display:none; }
  .v6-more-toggle { display:flex; }
  .v6-side-nav.more-open { grid-template-columns:repeat(3,1fr); }
  .v6-side-nav.more-open .v6-side-link[data-section="settings"],
  .v6-side-nav.more-open .v6-side-link[data-section="motorlab"],
  .v6-side-nav.more-open .v6-side-utility { display:flex; }
  .v6-side-nav.more-open .v6-side-utility { grid-column:1/-1; border:0; padding:0; margin:0; display:contents; }
}
`;P("hv6-header",wn);var kn=()=>`
  <header class="v6-toolbar" aria-label="View toolbar">
    <div class="v6-toolbar-leading"><span class="v6-toolbar-icon" aria-hidden="true"><svg class="menu-icon" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM9 5v14"/></svg></span><div><h1 id="v6-view-title">Overview</h1><p id="v6-view-subtitle">Local heating status and current exceptions</p></div></div>
    <div class="v6-toolbar-trailing"><button type="button" class="v6-update-badge" id="hdr-update" hidden></button><span class="v6-live" id="hdr-live">Offline</span></div>
  </header>`,$e=t=>`<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,zn=()=>`
  <nav class="v6-side-nav" aria-label="Primary navigation">
    <div class="v6-nav-group"><div class="v6-nav-heading">Home</div>
      <a href="#" class="v6-side-link" data-section="overview">${$e('<rect x="4" y="4" width="6" height="9"/><rect x="14" y="4" width="6" height="4"/><rect x="4" y="17" width="6" height="3"/><rect x="14" y="12" width="6" height="8"/>')}<span>Overview</span></a>
      <a href="#" class="v6-side-link" data-section="zones">${$e('<path d="M5 19V9l7-5 7 5v10"/><path d="M9 19v-6h6v6"/>')}<span>Zones</span></a>
    </div>
    <div class="v6-nav-group"><div class="v6-nav-heading">System</div>
      <a href="#" class="v6-side-link" data-section="diagnostics">${$e('<path d="M4 19h16M6 16V8m4 8V4m4 12v-6m4 6V7"/><path d="m5 5 3 2 4-4 4 3 3-2"/>')}<span>Diagnostics</span></a>
      <a href="#" class="v6-side-link" data-section="motorlab" hidden>${$e('<path d="M3 12h3l2-6 3 12 2-8 2 4h6"/><circle cx="19" cy="12" r="1.4"/>')}<span>Motor lab</span></a>
      <a href="#" class="v6-side-link" data-section="settings">${$e('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>')}<span>Settings</span></a>
    </div>
    <button type="button" class="v6-side-link v6-more-toggle" aria-expanded="false">${$e('<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>')}<span>More</span></button>
    <div class="v6-side-utility"><a href="#" class="v6-side-link" data-section="help">${$e('<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.3M12 17h.01"/>')}<span>Help</span></a></div>
  </nav>`,qa={overview:["Overview","Local heating status and current exceptions"],zones:["Zones","Physical loops, applied targets and valve state"],diagnostics:["Diagnostics","Health, evidence and recovery"],motorlab:["Motor lab","Instrumented stroke capture and endstop thresholds"],settings:["Settings","Device configuration and safety"],help:["Help","Guidance for operating Lune V6"]};D({tag:"hv6-header",render:kn,onMount(t,e){let o=e.querySelector("#hdr-live"),a=e.querySelector("#v6-view-title"),s=e.querySelector("#v6-view-subtitle"),r=e.querySelector("#hdr-update");function n(){let u=T("firmwareUpdateAvailable");r.hidden=!u,u&&(r.textContent=d("status.updateAvailable",{version:u.latest}),r.title=d("settings.firmware.badgeTitle"))}r.addEventListener("click",()=>{Fe("settings");let u=document.querySelector(".settings-firmware-card");if(!u)return;let m=u.closest("details");m&&(m.open=!0),u.scrollIntoView({behavior:"smooth",block:"center"})});function l(){let u=T("section")||"overview",m=qa[u]||qa.overview;a.textContent=m[0],s.textContent=m[1],o.textContent=T("live")?d("status.live"):d("status.offline"),o.classList.toggle("is-live",!!T("live"))}V("section",l),V("live",l),V("firmwareUpdateAvailable",n),M(e),l(),n()}});D({tag:"hv6-sidebar",render:zn,onMount(t,e){let o=e.querySelector(".v6-side-nav"),a=e.querySelectorAll("[data-section]"),s=e.querySelector(".v6-more-toggle");function r(){let n=T("section");a.forEach(l=>{l.dataset.section&&(l.dataset.section===n?l.classList.add("active"):l.classList.remove("active"),l.setAttribute("aria-current",l.dataset.section===n?"page":"false"))})}a.forEach(n=>n.addEventListener("click",l=>{l.preventDefault(),Fe(n.dataset.section),o&&o.classList.contains("more-open")&&(o.classList.remove("more-open"),s&&s.setAttribute("aria-expanded","false"))})),s&&o&&s.addEventListener("click",()=>{let n=o.classList.toggle("more-open");s.setAttribute("aria-expanded",String(n))}),V("section",r),M(e),r()}});function le(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function Ye(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function Ha(t){if(t==null||isNaN(t)||t<0)return"---";t=t|0;var e=t/86400|0,o=t%86400/3600|0,a=t%3600/60|0;return e>0?e+"d "+o+"h "+a+"m":o>0?o+"h "+a+"m":a+"m"}var Sn=`
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
`;P("connectivity-card",Sn);var _n=()=>`
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
`,nl=D({tag:"connectivity-card",render:_n,onMount(t,e){let o=e.querySelector(".cc-ip"),a=e.querySelector(".cc-ssid"),s=e.querySelector(".cc-mac"),r=e.querySelector(".cc-up"),n=e.querySelector(".cc-ver"),l=0,u=Date.now(),m=!1;function c(){if(!m){r.textContent="---";return}let f=Math.max(0,Math.floor((Date.now()-u)/1e3)),g=Ha(l+f);r.textContent!==g&&(r.textContent=g)}function w(){o.textContent=C(i.ip)||"---",a.textContent=C(i.ssid)||"---",s.textContent=C(i.mac)||"---",n.textContent=C(i.firmware)||"---";let f=L(i.uptime);if(f!=null&&!isNaN(f)&&f>=0){let g=f|0;(!m||g!==l)&&(l=g,u=Date.now(),m=!0)}c()}k(i.ip,w),k(i.ssid,w),k(i.mac,w),k(i.firmware,w),k(i.uptime,w);let v=setInterval(c,1e3);e.addEventListener("hv6-unmount",()=>clearInterval(v),{once:!0}),M(e),w()}});var Cn="http://www.w3.org/2000/svg",Ln=`
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
`;P("chart-kit",Ln);function U(t,e,o){let a=document.createElementNS(Cn,t);if(e)for(let s in e)a.setAttribute(s,e[s]);return o!=null&&(a.textContent=o),a}function Je(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(a=>`${a.x.toFixed(2)} ${a.y.toFixed(2)}`).join(" L ");let e=.16,o=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let a=0;a<t.length-1;a++){let s=t[a-1]||t[a],r=t[a],n=t[a+1],l=t[a+2]||n,u=r.x+(n.x-s.x)*e,m=r.y+(n.y-s.y)*e,c=n.x-(l.x-r.x)*e,w=n.y-(l.y-r.y)*e;o+=` C ${u.toFixed(2)} ${m.toFixed(2)}, ${c.toFixed(2)} ${w.toFixed(2)}, ${n.x.toFixed(2)} ${n.y.toFixed(2)}`}return o}function jt(t,e,o){let a=t.filter(l=>Number.isFinite(l));if(!a.length)return{min:e,max:o};let s=Math.min(...a),r=Math.max(...a);s===r&&(s-=1,r+=1);let n=(r-s)*.12;return{min:s-n,max:r+n}}function Qe(t,e,o){let a=document.createElement("div");a.className="chart-tooltip",e.appendChild(a);let s=U("g",{class:"chart-cursor",style:"display:none"}),r=U("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});s.appendChild(r);let n=[];t.appendChild(s);function l(w){let v=0,f=1/0;for(let g=0;g<o.count;g++){let b=Math.abs(w-o.xAt(g));b<f&&(f=b,v=g)}return v}function u(w){let v=t.getScreenCTM();if(!v)return null;let f=t.createSVGPoint();return f.x=w.clientX,f.y=w.clientY,f.matrixTransform(v.inverse())}function m(w){if(!o.count)return;let v=u(w);if(!v)return;let f=l(v.x),g=o.xAt(f);r.setAttribute("x1",g),r.setAttribute("x2",g);let b=o.dots(f);for(;n.length<b.length;){let z=U("circle",{class:"chart-cursor-dot",r:3.4});s.appendChild(z),n.push(z)}n.forEach((z,N)=>{N<b.length?(z.setAttribute("cx",g),z.setAttribute("cy",b[N].y),z.setAttribute("fill",b[N].color),z.style.display=""):z.style.display="none"}),s.style.display="";let p=o.rows(f).map(z=>`<div class="tt-row"><span class="tt-swatch" style="background:${z.color}"></span>${z.label}<span class="tt-val">${z.value}</span></div>`).join("");a.innerHTML=`<div class="tt-time">${o.label(f)}</div>${p}`,a.classList.add("show");let x=e.getBoundingClientRect(),S=w.clientX-x.left+14;S+a.offsetWidth>x.width-6&&(S=w.clientX-x.left-a.offsetWidth-14),a.style.left=Math.max(6,S)+"px",a.style.top=Math.max(6,w.clientY-x.top+12)+"px"}function c(){a.classList.remove("show"),s.style.display="none"}return t.addEventListener("pointermove",m),t.addEventListener("pointerleave",c),()=>{t.removeEventListener("pointermove",m),t.removeEventListener("pointerleave",c),a.remove()}}var pt=1e3,zo=180,Le=14,Mn=42,An=44,Ie=42,Ut=pt-Ie-Mn,Oe=zo-Le-An,Ue=Le+Oe,So=24*3600,Ba=ue+2,ja=ue+3,Vt=ue+4,En="var(--series-warm)",Fn="var(--series-cool)",Va="var(--series-solar)",Tn=`
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
`;P("graph-widgets",Tn);var $a=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',Ua=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Nn=t=>t.variant==="flow-return"?`<div class="graph-widgets">${$a()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${Ua()}</div>`:`<div class="graph-widgets">${$a()}${Ua()}</div>`;function Za(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function Rn(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function _o(t,e,o){let a=[];for(let s=0;s<t.length;s++){let r=t[s];if(!r||r[0]<o)continue;let n=r[e];n==null||!Number.isFinite(n)||a.push({t:r[0],v:n})}return a}var Zt=(t,e)=>Ie+Math.max(0,Math.min(1,(t-e)/So))*Ut;function Dn(t,e,o){let a=Number(Date.now()/1e3)|0,s=3600,r=Math.ceil((a-So)/s)*s,n=Math.floor(a/s)*s,l=Math.floor(a/s)*s;for(let m=r;m<=n;m+=s){let c=o-(a-m),w=Zt(c,e),v=new Date(m*1e3),f=m===l,g=Ue+16;t.appendChild(U("text",{x:w,y:g,"text-anchor":"end",transform:`rotate(-45 ${w.toFixed(1)} ${g})`,class:"chart-hour"+(f?" now":"")},String(v.getHours()).padStart(2,"0")))}let u=Zt(o,e);t.appendChild(U("line",{x1:u,y1:Le,x2:u,y2:Ue,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Pn(t){let e=[];if(t.forEach(r=>r.forEach(n=>e.push(n.v))),!e.length)return{min:0,max:10};let o=Math.min(...e),a=Math.max(...e);o===a&&(o-=.5,a+=.5);let s=(a-o)*.1;return o-=s,a+=s,{min:o,max:a}}function On(t,e,o){let a=t.filter(s=>s.unit==="C").map(s=>_o(e,s.index,o));return Pn(a)}function Wa(t,e,o,a,s,r){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${pt} ${zo}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let n=o.map(g=>_o(a,g.index,s));if(!n.some(g=>g.length))return t.appendChild(U("text",{x:pt/2,y:zo/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let l=On(o,a,s),u=Math.max(.001,l.max-l.min),m=g=>Le+(1-(g-l.min)/u)*Oe,c=g=>Le+(1-Math.max(0,Math.min(100,g))/100)*Oe,w=(g,b)=>g.unit==="%"?c(b):m(b);for(let g=0;g<3;g++){let b=g/2,p=Le+b*Oe;t.appendChild(U("line",{x1:Ie,y1:p,x2:Ie+Ut,y2:p,class:"chart-grid"})),o.some(x=>x.unit==="C")&&t.appendChild(U("text",{x:Ie-6,y:p+4,"text-anchor":"end",class:"chart-tick"},Za(l.max-u*b,"C")+"\xB0")),o.some(x=>x.unit==="%")&&t.appendChild(U("text",{x:Ie+Ut+6,y:p+4,"text-anchor":"start",class:"chart-tick"},Za(100-100*b,"%")))}t.appendChild(U("line",{x1:Ie,y1:Ue,x2:Ie+Ut,y2:Ue,class:"chart-axis"})),o.some(g=>g.unit==="C")&&t.appendChild(U("text",{x:9,y:Le+Oe/2,transform:`rotate(-90 9 ${(Le+Oe/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.temp"))),o.some(g=>g.unit==="%")&&t.appendChild(U("text",{x:pt-9,y:Le+Oe/2,transform:`rotate(90 ${pt-9} ${(Le+Oe/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},d("overview.graph.axis.demand"))),Dn(t,s,r),o.forEach((g,b)=>{let p=n[b].map(S=>({x:Zt(S.t,s),y:w(g,S.v)}));if(!p.length)return;let x=Je(p);g.fill&&t.appendChild(U("path",{d:x+` L ${p[p.length-1].x.toFixed(1)} ${Ue} L ${p[0].x.toFixed(1)} ${Ue} Z`,fill:g.fill,stroke:"none"})),t.appendChild(U("path",{d:x,fill:"none",stroke:g.color,"stroke-width":String(g.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let v=[];for(let g=0;g<a.length;g++){let b=a[g];if(!b||b[0]<s)continue;let p=o.map(x=>b[x.index]);p.every(x=>x==null||!Number.isFinite(x))||v.push({t:b[0],vals:p})}if(!v.length)return null;let f=Date.now();return Qe(t,e,{count:v.length,plotTop:Le,plotBottom:Ue,xAt:g=>Zt(v[g].t,s),label:g=>new Date(f-(r-v[g].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:g=>o.map((b,p)=>({y:w(b,v[g].vals[p]),color:b.color})).filter((b,p)=>Number.isFinite(v[g].vals[p])),rows:g=>o.map((b,p)=>({color:b.color,label:b.label,value:Rn(v[g].vals[p],b.unit)})).filter((b,p)=>Number.isFinite(v[g].vals[p]))})}function $t(t,e,o){let a=_o(t,e,o);return a.length?a[a.length-1].v:null}var gl=D({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:Nn,onMount(t,e){let o=e.querySelector(".gw-dt"),a=e.querySelector(".gw-demand-text"),s=e.querySelector(".gw-flow"),r=e.querySelector(".gw-demand"),n=Array.from(e.querySelectorAll(".gw-toggle")),l={flow:!0,return:!0,demand:!0},u=null,m=null;function c(){n.forEach(f=>{let g=f.dataset.layer;f.classList.toggle("is-off",!l[g]),f.setAttribute("aria-pressed",l[g]?"true":"false")})}function w(){let f=[];return l.flow&&f.push({index:Ba,color:En,label:d("overview.graph.layers.flow"),unit:"C",width:2.4}),l.return&&f.push({index:ja,color:Fn,label:d("overview.graph.layers.return"),unit:"C",width:2}),l.demand&&f.push({index:Vt,color:Va,label:d("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function v(){let f=T("zoneStateHistory"),g=f&&Array.isArray(f.entries)?f.entries:[],b=f&&f.uptime_s||Number(Date.now()/1e3)|0,p=b-So;if(s){u&&u();let x=$t(g,Ba,p),S=$t(g,ja,p),z=$t(g,Vt,p),N=[];x!=null&&S!=null&&N.push("\u0394 "+(x-S).toFixed(1)+"\xB0"),z!=null&&N.push(Math.round(z)+"%"),o.textContent=N.length?N.join(" \xB7 "):"\u2014",u=Wa(s,s.closest(".chart-card"),w(),g,p,b)}if(r){m&&m();let x=$t(g,Vt,p);a.textContent=x!=null?Math.round(x)+"%":"\u2014",m=Wa(r,r.closest(".chart-card"),[{index:Vt,color:Va,label:d("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],g,p,b)}}n.forEach(f=>{f.addEventListener("click",()=>{let g=f.dataset.layer;l[g]=!l[g],!l.flow&&!l.return&&!l.demand&&(l[g]=!0),c(),v()})}),V("zoneStateHistory",v),M(e),c(),v()}});var qe={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"var(--accent)"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},ut=24*3600,In=ut,mt=18,Mo=4,Ze=54,Kt=32,et=4,Gt=10,Xa=6,Ya="#ffc14d",Co=9,Ka=ue+1,Ja=et+ue*(mt+Mo)-Mo,Lo=Ja+Xa,Wt=Ja+Xa+Gt+Kt,qn=`
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
`;P("zone-state-timeline",qn);var Hn=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Bn(t,e){if(!t||!t.entries||t.entries.length===0)return null;let o=t.entries,a=t.uptime_s||e||0,s=Number(Date.now()/1e3)|0,r=1e3,n=r-Ze;function l(z){let N=(z+ut)/In;return Ze+Math.max(0,Math.min(1,N))*n}function u(z){return z-a}let m="http://www.w3.org/2000/svg",c=document.createElementNS(m,"svg");c.setAttribute("viewBox","0 0 "+r+" "+Wt),c.classList.add("timeline-svg");let w=document.createElementNS(m,"rect");w.setAttribute("x",Ze),w.setAttribute("y",et),w.setAttribute("width",n),w.setAttribute("height",Wt-et-Kt),w.setAttribute("fill","rgba(0,32,46,0.55)"),w.setAttribute("rx","4"),c.appendChild(w);let v=l(0),f=[-24,-18,-12,-6,0].map(z=>z*3600);for(let z of f){let N=l(z),F=document.createElementNS(m,"line");F.setAttribute("x1",N),F.setAttribute("y1",et),F.setAttribute("x2",N),F.setAttribute("y2",Wt-Kt),F.setAttribute("stroke",z===0?"var(--series-solar)":"rgba(120,146,200,.16)"),F.setAttribute("stroke-width","1"),z===0&&(F.setAttribute("stroke-dasharray","2 3"),F.setAttribute("opacity",".55"),F.setAttribute("vector-effect","non-scaling-stroke")),c.appendChild(F)}c.appendChild(jn(m,"text",{x:v+4,y:et+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));for(let z=0;z<ue;z++){let N=et+z*(mt+Mo),F=document.createElementNS(m,"rect");F.setAttribute("x",Ze),F.setAttribute("y",N),F.setAttribute("width",n),F.setAttribute("height",mt),F.setAttribute("fill",z%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),c.appendChild(F);let I=document.createElementNS(m,"text");I.setAttribute("x",Ze-4),I.setAttribute("y",N+mt/2+1),I.setAttribute("text-anchor","end"),I.setAttribute("dominant-baseline","middle"),I.setAttribute("fill","rgba(233,222,210,.62)"),I.setAttribute("font-size","9.5"),I.setAttribute("font-family","Montserrat, sans-serif"),I.setAttribute("font-weight","600"),I.textContent="Z"+(z+1),c.appendChild(I);let R=o.map(E=>({rel:u(E[0]),state:E[z+1]})).filter(E=>E.rel>=-ut&&E.rel<=0),q=(E,Z,Q)=>{if(Q===255)return;let O=qe[Q]||qe[255];if(O.color==="transparent")return;let _=l(E),K=l(Z),ze=Math.max(1,K-_),ee=document.createElementNS(m,"rect");ee.setAttribute("x",_),ee.setAttribute("y",N+(mt-Co)/2),ee.setAttribute("width",ze),ee.setAttribute("height",Co),ee.setAttribute("fill",O.color),ee.setAttribute("rx",String(Co/2)),ee.setAttribute("opacity","0.9"),c.appendChild(ee)};if(R.length){let E=R[0].rel,Z=R[0].state;for(let Q=1;Q<R.length;Q++){let O=R[Q];O.state!==Z&&(q(E,O.rel,Z),E=O.rel,Z=O.state)}q(E,0,Z)}}{let z=document.createElementNS(m,"rect");z.setAttribute("x",Ze),z.setAttribute("y",Lo),z.setAttribute("width",n),z.setAttribute("height",Gt),z.setAttribute("fill","rgba(188,80,144,0.10)"),z.setAttribute("rx","2"),c.appendChild(z);let N=document.createElementNS(m,"text");N.setAttribute("x",Ze-4),N.setAttribute("y",Lo+Gt/2+1),N.setAttribute("text-anchor","end"),N.setAttribute("dominant-baseline","middle"),N.setAttribute("fill","rgba(233,222,210,.62)"),N.setAttribute("font-size","8.5"),N.setAttribute("font-family","Montserrat, sans-serif"),N.setAttribute("font-weight","600"),N.textContent=d("overview.timeline.absorb"),c.appendChild(N);let F=o.map(I=>({rel:u(I[0]),on:I.length>Ka?I[Ka]:0})).filter(I=>I.rel>=-ut&&I.rel<=0);if(F.length){let I=(E,Z)=>{let Q=l(E),O=Math.max(1,l(Z)-Q),_=document.createElementNS(m,"rect");_.setAttribute("x",Q),_.setAttribute("y",Lo),_.setAttribute("width",O),_.setAttribute("height",Gt),_.setAttribute("fill",Ya),_.setAttribute("rx","2"),_.setAttribute("opacity","0.9"),c.appendChild(_)},R=F[0].rel,q=F[0].on;for(let E=1;E<F.length;E++)F[E].on!==q&&(q&&I(R,F[E].rel),R=F[E].rel,q=F[E].on);q&&I(R,0)}}let g=Wt-Kt+15,b=3600,p=Math.ceil((s-ut)/b)*b,x=Math.floor(s/b)*b,S=Math.floor(s/b)*b;for(let z=p;z<=x;z+=b){let N=z-s,F=l(N),I=new Date(z*1e3),R=String(I.getHours()).padStart(2,"0"),q=z===S,E=document.createElementNS(m,"text");E.setAttribute("x",F),E.setAttribute("y",g),E.setAttribute("text-anchor","end"),E.setAttribute("fill",q?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),E.setAttribute("font-size","9"),E.setAttribute("font-family",'"Montserrat", sans-serif'),E.setAttribute("font-weight","500"),E.setAttribute("font-variant-numeric","tabular-nums lining-nums"),E.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),E.setAttribute("letter-spacing","0"),E.setAttribute("transform",`rotate(-45 ${F.toFixed(1)} ${g})`),E.textContent=R,c.appendChild(E)}return c}function jn(t,e,o,a){let s=document.createElementNS(t,e);for(let r in o)s.setAttribute(r,o[r]);return a!=null&&(s.textContent=a),s}function Ga(t){t.innerHTML="";let e=[{code:5,...qe[5]},{code:6,...qe[6]},{code:0,...qe[0]},{code:1,...qe[1]},{code:7,...qe[7]},{code:2,...qe[2]}];for(let a of e){let s=document.createElement("div");s.className="tl-legend-item",s.innerHTML='<span class="tl-legend-dot" style="background:'+a.color+'"></span>'+(a.labelKey?d(a.labelKey):""),t.appendChild(s)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Ya+'"></span>'+d("overview.timeline.preheatAbsorption"),t.appendChild(o)}var wl=D({tag:"zone-state-timeline",render:Hn,onMount(t,e){let o=e.querySelector(".tl-body"),a=e.querySelector(".timeline-legend");Ga(a);function s(){let r=T("zoneStateHistory"),n=(()=>{let u=T&&T("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!r||!r.entries||r.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent=d("overview.timeline.noHistory"),o.appendChild(u);return}let l=Bn(r,n);l&&o.appendChild(l)}V("zoneStateHistory",s),V("zoneNames",s),k(i.drivers,s);for(let r=1;r<=ue;r++)k(h.enabled(r),s),k(h.state(r),s),k(h.temp(r),s),k(h.setpoint(r),s),k(h.preheatAdvance(r),s);M(e),s()}});var Vn=`
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
`;P("zone-grid",Vn);var $n=()=>'<div class="zone-grid" aria-label="Zones"></div>',_l=D({tag:"zone-grid",state:t=>({selection:t.selection!==!1,navigate:t.navigate!==!1}),render:$n,onMount(t,e){for(let o=1;o<=6;o++)e.appendChild(X("zone-card",{zone:o,selection:t.selection,navigate:t.navigate}))}});var Un=`
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
`;P("zone-card",Un);var Zn=t=>`
	<button type="button" class="zone-card" data-zone="${t.zone}" aria-label="Open zone ${t.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${he(t.zone)}</div>
		<div class="zc-friendly">${De(t.zone)||"---"}</div>
		<div class="zc-reading"><strong class="zc-temp">---</strong><small class="zc-target">Target ---</small></div>
		<div class="zc-valve"><strong class="zc-valve-value">---</strong><small>Valve</small></div>
	</button>
`,Nl=D({tag:"zone-card",state:t=>({zone:t.zone,selection:t.selection!==!1,navigate:t.navigate!==!1}),render:Zn,onMount(t,e){let o=t.zone,a=h.temp(o),s=h.state(o),r=h.enabled(o),n=e.querySelector(".zc-state-label"),l=e.querySelector(".zc-zone-name"),u=e.querySelector(".zc-friendly"),m=e.querySelector(".zc-temp"),c=e.querySelector(".zc-target"),w=e.querySelector(".zc-valve-value");function v(){var I;let g=se(r),b=String(C(s)||"").toUpperCase()||"OFF",p=String(C(h.motorLastFault(o))||"").toUpperCase(),x=p&&p!=="NONE"&&p!=="OK",S=g&&(b==="FAULT"||x)?"FAULT":b,z=t.selection&&T("selectedZone")===o,N=De(o);l.textContent=N||"Zone "+o,u.textContent="Zone "+o+" \xB7 physical loop",m.textContent=le(L(a)),c.textContent=d("zone.card.setpoint",{value:le((I=L(h.effectiveSetpoint(o)))!=null?I:L(h.setpoint(o)))}),w.textContent=Ye(L(h.valve(o)));let F=g?S:"OFF";n.textContent=F==="HEATING"?d("state.heating"):F==="IDLE"?d("state.idle"):F==="FAULT"?d("common.fault"):F==="MANUAL"?d("state.manual"):F==="OVERHEATED"?d("state.overheated"):F==="CALIBRATING"?d("state.calibrating"):d("state.off"),e.title=x?d("zone.card.fault",{fault:p}):"",e.classList.toggle("active",z),z?e.setAttribute("aria-current","location"):e.removeAttribute("aria-current"),e.setAttribute("aria-label",`${l.textContent}, ${m.textContent}, ${c.textContent}, ${n.textContent}. Open details.`),e.classList.toggle("disabled",!g),e.classList.toggle("zs-heating",g&&F==="HEATING"),e.classList.toggle("zs-fault",g&&F==="FAULT"),e.classList.toggle("zs-idle",g&&F==="IDLE"),e.classList.toggle("zs-off",!g||F==="OFF")}function f(){st(o),t.navigate&&Fe("zones"),e.dispatchEvent(new CustomEvent("zone-open",{bubbles:!0,detail:{zone:o}}))}e.addEventListener("click",f),k(a,v),k(h.setpoint(o),v),k(h.effectiveSetpoint(o),v),k(h.valve(o),v),k(s,v),k(r,v),k(h.motorLastFault(o),v),V("selectedZone",v),V("zoneNames",v),v()}});var Wn=`
.zone-detail{height:auto;padding:0;background:transparent;border:1px solid var(--separator);border-radius:10px;box-shadow:none;overflow:hidden}
.zone-detail .zd-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:58px;margin:0;padding:10px 16px;border-bottom:1px solid var(--separator)}
.zone-detail .zd-title{color:var(--text-strong);font-size:1rem;font-weight:650}
.zone-detail .zd-head-ctrl{display:flex;align-items:center;gap:10px}
.zone-detail .zd-badge{padding:4px 9px;border:0;border-radius:999px;background:rgba(139,148,163,.12);color:var(--state-disabled);font-size:.72rem;font-weight:650}
.zone-detail .zd-badge.badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}.zone-detail .zd-badge.badge-idle{background:rgba(139,148,163,.12);color:var(--text-muted)}.zone-detail .zd-badge.badge-fault{background:rgba(239,68,68,.12);color:var(--state-danger)}
.zone-detail .zd-body>div:first-child{padding:18px 16px}
.zone-detail .zd-kicker{margin:0 0 7px;color:var(--text-muted);font-size:.76rem;font-weight:600}
.zone-detail .zd-target-row{display:grid;grid-template-columns:44px 7.5rem 44px;align-items:center;gap:10px;width:max-content}
.zone-detail .zd-setpoint-field{display:flex;align-items:baseline;justify-content:center;gap:2px;min-width:0}
.zone-detail .zd-setpoint{box-sizing:border-box;width:5.2ch;margin:0;padding:0;border:0;border-radius:0;background:transparent;color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;text-align:right;caret-color:var(--accent);outline:none;-moz-appearance:textfield}
.zone-detail .zd-setpoint::-webkit-outer-spin-button,.zone-detail .zd-setpoint::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.zone-detail .zd-setpoint:focus{box-shadow:inset 0 -2px 0 var(--accent)}
.zone-detail .zd-setpoint-unit{color:var(--text-strong);font-family:var(--font-display);font-size:1.75rem;font-weight:700;line-height:1;pointer-events:none;user-select:none}
.zone-detail .spb{display:grid;width:44px;height:44px;place-items:center;border:1px solid var(--separator);border-radius:8px;background:var(--control-bg);color:var(--text-strong);font-size:1.15rem;cursor:pointer;flex:none}.zone-detail .spb:hover,.zone-detail .spb:active{background:rgba(var(--accent-rgb),.12);color:var(--accent)}
.zone-detail .zd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:0;padding:0 16px 18px}.zone-detail .zd-stat{min-width:0;padding:0 12px;border-left:1px solid var(--separator)}.zone-detail .zd-stat:first-child{padding-left:0;border-left:0}.zone-detail .zd-stat-label{color:var(--text-faint);font-size:.7rem;font-weight:600}.zone-detail .zd-stat-value{margin-top:4px;color:var(--text-strong);font-family:var(--font-display);font-size:1.08rem;font-weight:650;font-variant-numeric:tabular-nums}
.zone-detail .zd-motor{margin:0;border-top:1px solid var(--separator)}.zone-detail .zd-motor>summary{display:flex;align-items:center;min-height:52px;padding:0 16px;color:var(--text-strong);font-size:.86rem;font-weight:650;cursor:pointer;list-style:none}.zone-detail .zd-motor>summary::-webkit-details-marker{display:none}.zone-detail .zd-motor>summary::after{content:'\u203A';margin-left:auto;color:var(--text-muted);font-size:1.2rem;transition:transform .16s ease}.zone-detail .zd-motor[open]>summary::after{transform:rotate(90deg)}.zone-detail .zd-motor>summary small{margin-left:auto;margin-right:14px;color:var(--text-muted);font-size:.74rem;font-weight:400}.zone-detail .zd-motor-body{padding:16px;border-top:1px solid var(--separator)}.zone-detail .zd-motor-body .zd-stats{padding:0}
.zone-detail .zd-fault{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:14px 0 0;padding:9px 10px;border-left:3px solid var(--state-danger);background:rgba(239,68,68,.06);font-size:.76rem}.zone-detail .zd-fault[hidden]{display:none}.zone-detail .zd-fault-label{color:var(--text-muted)}.zone-detail .zd-fault-val{color:var(--state-danger);font-weight:650}
@media(max-width:560px){.zone-detail .zd-stats{grid-template-columns:1fr 1fr;gap:16px 0}.zone-detail .zd-stat:nth-child(odd){padding-left:0;border-left:0}.zone-detail .zd-motor>summary small{display:none}}
`;P("zone-detail",Wn);var Kn=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    <div class="zd-head">
      <div class="zd-title">${he(t.zone)}</div>
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
            <input class="zd-setpoint" type="text" inputmode="decimal" enterkeyhint="done" autocomplete="off" spellcheck="false" data-i18n-label="zone.detail.setpoint" aria-label="Setpoint" />
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
`,tr=5,or=35,Yt=.5;function Qa(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function er(t){return t!=null?Number(t).toFixed(0):"---"}function Gn(t){return t!=null?Number(t).toFixed(2)+"C":"---"}function tt(t){return t==null||Number.isNaN(Number(t))?"":(Math.round(Number(t)*10)/10).toFixed(1)}function Xn(t){if(t==null)return null;let e=String(t).trim().replace(",",".").replace(/[^\d.+-]/g,"");if(!e)return null;let o=Number(e);if(!Number.isFinite(o))return null;let a=Math.round(o/Yt)*Yt;return Math.min(or,Math.max(tr,Number(a.toFixed(1))))}function Yn(t){let e=Number(L(h.setpoint(t)));return Number.isFinite(e)?e:null}function Xt(t){let e=Number(L(h.coordinatorOffset(t)));return Number.isFinite(e)?e:0}function He(t){let e=Number(L(h.effectiveSetpoint(t)));if(Number.isFinite(e))return e;let o=Yn(t);return o==null?null:Number((o+Xt(t)).toFixed(1))}function gt(t){return Math.min(or,Math.max(tr,Number(Number(t).toFixed(1))))}function Jn(t,e){if(!e)return d("common.disabled");let o=String(t||"IDLE").toUpperCase();return o==="HEATING"?d("state.heating"):o==="IDLE"?d("state.idle"):o==="OFF"?d("state.off"):o==="FAULT"?d("common.fault"):o==="MANUAL"?d("state.manual"):o==="OVERHEATED"?d("state.overheated"):o==="CALIBRATING"?d("state.calibrating"):o}var jl=D({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Kn,methods:{update(t,e){var c;let o=T("selectedZone"),a=String(C(h.state(o))||"").toUpperCase(),s=se(h.enabled(o));this.zone=o,t.dataset.zone=String(o),e.title.textContent=he(o),document.activeElement!==e.setpoint&&(e.setpoint.value=tt(He(o))),e.base.textContent=le((c=L(h.baseSetpoint(o)))!=null?c:L(h.setpoint(o)));let r=L(h.coordinatorOffset(o));e.offset.textContent=r==null?"---":(r>0?"+":"")+Number(r).toFixed(1)+"\xB0C",e.temp.textContent=le(L(h.temp(o))),e.ret.textContent=le(L("sensor-manifold_return_temperature")),e.valve.textContent=Ye(L(h.valve(o)));let n=e.badge;n.textContent=Jn(a,s);let l=s?a==="HEATING"?"badge-heating":a==="IDLE"?"badge-idle":a==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(l?" "+l:""),e.toggle.classList.toggle("on",s),e.orip.textContent=er(L(h.motorOpenRipples(o))),e.crip.textContent=er(L(h.motorCloseRipples(o))),e.ofac.textContent=Qa(L(h.motorOpenFactor(o))),e.cfac.textContent=Qa(L(h.motorCloseFactor(o))),e.ph.textContent=Gn(L(h.preheatAdvance(o)));let u=String(C(h.motorLastFault(o))||"").toUpperCase(),m=u&&u!=="NONE"&&u!=="OK";e.fault.hidden=!m,m&&(e.faultVal.textContent=u)},commitSetpoint(t){let e=this.zone,o=Xn(t);if(o==null)return null;let a=gt(o-Xt(e));return Dt(e,a),He(e)},incSetpoint(){let t=this.zone,e=He(t),o=gt((e==null?20:e)+Yt);Dt(t,gt(o-Xt(t)))},decSetpoint(){let t=this.zone,e=He(t),o=gt((e==null?20:e)-Yt);Dt(t,gt(o-Xt(t)))},toggleEnabled(){let t=this.zone,e=se(h.enabled(t));ca(t,!e)}},onMount(t,e){let o={title:e.querySelector(".zd-title"),setpoint:e.querySelector(".zd-setpoint"),temp:e.querySelector(".zd-temp"),base:e.querySelector(".zd-base"),offset:e.querySelector(".zd-offset"),ret:e.querySelector(".zd-ret"),valve:e.querySelector(".zd-valve"),badge:e.querySelector(".zd-badge"),toggle:e.querySelector(".btn-toggle"),inc:e.querySelector(".btn-inc"),dec:e.querySelector(".btn-dec"),orip:e.querySelector(".zd-orip"),crip:e.querySelector(".zd-crip"),ofac:e.querySelector(".zd-ofac"),cfac:e.querySelector(".zd-cfac"),ph:e.querySelector(".zd-ph"),fault:e.querySelector(".zd-fault"),faultVal:e.querySelector(".zd-fault-val")};o.inc.onclick=()=>t.incSetpoint(),o.dec.onclick=()=>t.decSetpoint(),o.toggle.onclick=()=>t.toggleEnabled();let a=()=>{let n=t.commitSetpoint(o.setpoint.value);o.setpoint.value=n!=null?tt(n):tt(He(t.zone))};o.setpoint.addEventListener("keydown",n=>{n.key==="Enter"?(n.preventDefault(),o.setpoint.blur()):n.key==="Escape"?(n.preventDefault(),o.setpoint.value=tt(He(t.zone)),o.setpoint.blur()):n.key==="ArrowUp"?(n.preventDefault(),t.incSetpoint(),o.setpoint.value=tt(He(t.zone))):n.key==="ArrowDown"&&(n.preventDefault(),t.decSetpoint(),o.setpoint.value=tt(He(t.zone)))}),o.setpoint.addEventListener("blur",a),o.setpoint.addEventListener("focus",()=>{requestAnimationFrame(()=>o.setpoint.select())});let s=()=>t.update(e,o),r=n=>{let l=T("selectedZone");(n===h.temp(l)||n===h.setpoint(l)||n===h.baseSetpoint(l)||n===h.effectiveSetpoint(l)||n===h.coordinatorOffset(l)||n===h.valve(l)||n===h.state(l)||n===h.enabled(l))&&s()};for(let n=1;n<=6;n++)k(h.temp(n),r),k(h.setpoint(n),r),k(h.baseSetpoint(n),r),k(h.effectiveSetpoint(n),r),k(h.coordinatorOffset(n),r),k(h.valve(n),r),k(h.state(n),r),k(h.enabled(n),r),k(h.motorOpenRipples(n),s),k(h.motorCloseRipples(n),s),k(h.motorOpenFactor(n),s),k(h.motorCloseFactor(n),s),k(h.preheatAdvance(n),s),k(h.motorLastFault(n),s);k("sensor-manifold_return_temperature",s),V("selectedZone",s),M(e),s()}});var Qn=`
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
`;P("zone-sensor-card",Qn);var es=()=>{let t='<option value="None" data-i18n="common.none">None</option>';for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return`
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
  `};function ar(t,e){let o=t.value,a='<option value="None" data-i18n="common.none">'+d("common.none")+"</option>";for(let s=1;s<=6;s++)s!==e&&(a+='<option value="Zone '+s+'">'+d("common.zone")+" "+s+"</option>");t.innerHTML=a,t.value=o||"None"}function ts(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":"Local Probe"}function os(t){return t==="BLE Sensor"?"BLE":"Local Probe"}function rr(t,e){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+d("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+d("zone.sensor.bleSource")+"</option>";t.innerHTML!==o&&(t.innerHTML=o),t.value=e}var Yl=D({tag:"zone-sensor-card",render:es,onMount(t,e){let o=e.querySelector(".zs-probe"),a=e.querySelector(".zs-source"),s=e.querySelector(".zs-ble"),r=e.querySelector(".zs-sync"),n=e.querySelector(".zs-row-ble"),l=e.querySelector(".zs-scan"),u=e.querySelector(".zs-scan-list"),m=0;function c(){return T("selectedZone")}function w(){n.style.display=a.value==="BLE Sensor"?"":"none"}let v=ke(e);rr(a,"Local Probe"),v.select(o,{read:()=>C(h.probe(c()))||void 0,commit:p=>Pt(c(),"zone_probe",p)}),v.select(a,{read:()=>ts(String(C(h.tempSource(c()))||"")),commit:p=>Pt(c(),"zone_temp_source",os(p))}),v.select(r,{read:()=>C(h.syncTo(c()))||"None",commit:p=>Pt(c(),"zone_sync_to",p)});let f=v.text(s,{read:()=>C(h.ble(c()))||"",commit:p=>fo(c(),"zone_ble_mac",p)});a.addEventListener("change",w);function g(){let p=c();m!==p?(ar(r,p),m=p,u.style.display="none",v.discard()):v.refresh(),w()}function b(p){let x=c();(p===h.probe(x)||p===h.tempSource(x)||p===h.syncTo(x)||p===h.ble(x)||/^select-zone_\d+_sync_to$/.test(p))&&(v.refresh(),w())}l.addEventListener("click",()=>{if(l.disabled)return;l.disabled=!0,l.textContent="\u2026",u.style.display="",u.innerHTML='<div class="scan-msg">'+d("zone.sensor.scanning")+"</div>";let p=new AbortController,x=setTimeout(()=>p.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:p.signal}).then(S=>{if(!S.ok)throw new Error("HTTP "+S.status);return S.json()}).then(S=>{if(clearTimeout(x),l.disabled=!1,l.textContent=d("zone.sensor.scan"),!S.ok||!S.sensors||S.sensors.length===0){u.innerHTML='<div class="scan-msg">'+d("zone.sensor.noSensors")+"</div>";return}let z=c(),N=(C(h.ble(z))||"").toUpperCase(),F=R=>String(R).replace(/[&<>"']/g,q=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[q]),I="";for(let R of S.sensors){let q=R.mac.toUpperCase(),E=R.name?F(R.name):"",Z=R.temp_c!=null?R.temp_c.toFixed(1)+"\xB0C":"\u2014",Q=R.rssi!=null?R.rssi+" dBm":"",O=R.age_s<60?d("common.secondsAgo",{value:R.age_s}):d("common.minutesAgo",{value:Math.round(R.age_s/60)}),_="";q===N?_='<span class="ble-badge">'+d("zone.sensor.assignedThisZone")+"</span>":R.zone>0&&(_='<span class="ble-badge">'+d("zone.sensor.zoneBadge",{zone:R.zone})+"</span>");let K=E?`<div class="ble-mac">${E}</div><div class="ble-meta">${q}</div>`:`<div class="ble-mac">${q}</div>`;I+=`<div class="ble-scan-item">
              <div>
                ${K}
                <div class="ble-meta">${Z} &nbsp;${Q} &nbsp;${O}</div>
                ${_}
              </div>
              <button class="btn-assign" data-mac="${q}">${d("zone.sensor.assign")}</button>
            </div>`}u.innerHTML=I,u.querySelectorAll(".btn-assign").forEach(R=>{R.addEventListener("click",()=>{s.value=R.dataset.mac,f.markDirty(),u.style.display="none"})})}).catch(S=>{clearTimeout(x),l.disabled=!1,l.textContent=d("zone.sensor.scan");let z=S&&S.name==="AbortError"?d("zone.sensor.scanTimeout"):d("zone.sensor.scanFailed");u.innerHTML='<div class="scan-msg">'+z+"</div>"})}),V("selectedZone",g);for(let p=1;p<=6;p++)k(h.probe(p),b),k(h.tempSource(p),b),k(h.syncTo(p),b),k(h.ble(p),b);M(e),g()}});var as=".zone-room-card { height: 100%; }";P("zone-room-card",as);var rs=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone identity</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
  </div>
`,nc=D({tag:"zone-room-card",render:rs,onMount(t,e){let o=e.querySelector(".zr-friendly");function a(){return T("selectedZone")}let s=ke(e);s.text(o,{read:()=>De(a())||"",commit:r=>ma(a(),r)}),V("selectedZone",s.discard),V("zoneNames",s.refresh),M(e),s.refresh()}});var Me=6,ns="var(--flow-disabled)",sr="var(--flow-unknown)",ir="var(--accent)",bt="var(--flow-return)",Eo="var(--text-strong)",ss="var(--flow-disabled)",We="var(--flow-label)",Jt="var(--flow-disabled)",Ao="var(--flow-label)",lr="var(--flow-label)",nr="var(--flow-return)",is="#66BB6A",ls="#FF6361",Y={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},B={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},cs=`
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
`;P("flow-diagram",cs);function ds(t,e){let o=String(De(t)||"").trim();if(!o)return"";let a=o.toUpperCase();return a.length>e?a.slice(0,Math.max(1,e-1))+"\u2026":a}function ps(t){if(!t)return null;let e=String(t).match(/(\d+)/);if(!e)return null;let o=Number(e[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function us(t,e){return e?t==null||Number.isNaN(t)?sr:t>0?ir:We:ns}function cr(t){let e=t==="desktop"?"0 1":"1 0",o=[];o.push("<defs>");for(let a=1;a<=Me;a++)o.push('<linearGradient id="'+t+"-rg"+a+'" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'">'),o.push('<stop id="'+t+"-rgs"+a+'" offset="0%" stop-color="var(--accent)" stop-opacity=".96"/>'),o.push('<stop id="'+t+"-rga"+a+'" offset="100%" stop-color="var(--accent)" stop-opacity=".7"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function ms(t){let e=Y.boxX+Y.boxW/2+(t-2.5)*Y.srcSpread,o=Y.zoneXs[t];return"M"+e.toFixed(1)+" "+Y.srcY+" C"+e.toFixed(1)+" "+Y.fanY+" "+o.toFixed(1)+" "+(Y.fanY+34)+" "+o.toFixed(1)+" "+(Y.zoneY-20)}function gs(t){let e=B.midY+(t-2.5)*B.spread,o=B.zoneYs[t],a=B.endX-B.srcX;return"M"+B.srcX+" "+e.toFixed(1)+" C"+(B.srcX+a*.34)+" "+e.toFixed(1)+" "+(B.srcX+a*.7)+" "+o.toFixed(1)+" "+B.endX+" "+o.toFixed(1)}function dr(t,e,o){let a=Y.boxX+Y.boxW/2+(t-2.5)*Y.srcSpread,s=Y.srcY,r=Y.zoneXs[t],n=Y.zoneY-20,l=Y.fanY,u=Y.fanY+34;return"M"+(a-e).toFixed(1)+" "+s+" C"+(a-e).toFixed(1)+" "+l+" "+(r-o).toFixed(1)+" "+u+" "+(r-o).toFixed(1)+" "+n+" L"+(r+o).toFixed(1)+" "+n+" C"+(r+o).toFixed(1)+" "+u+" "+(a+e).toFixed(1)+" "+l+" "+(a+e).toFixed(1)+" "+s+"Z"}function pr(t,e,o){let a=B.midY+(t-2.5)*B.spread,s=B.zoneYs[t],r=B.endX-B.srcX,n=B.srcX+r*.34,l=B.srcX+r*.7;return"M"+B.srcX+" "+(a-e).toFixed(1)+" C"+n+" "+(a-e).toFixed(1)+" "+l+" "+(s-o).toFixed(1)+" "+B.endX+" "+(s-o).toFixed(1)+" L"+B.endX+" "+(s+o).toFixed(1)+" C"+l+" "+(s+o).toFixed(1)+" "+n+" "+(a+e).toFixed(1)+" "+B.srcX+" "+(a+e).toFixed(1)+"Z"}function ur(t,e,o){return'<rect width="'+t+'" height="'+e+'" rx="10" fill="var(--surface-raised)"/>'}function mr(t){let e=t==="desktop"?Y:B,o=t==="desktop"?e.boxY+27:e.boxY+29,a=t==="desktop"?e.boxY+56:e.boxY+58;return'<rect x="'+e.boxX+'" y="'+e.boxY+'" width="'+e.boxW+'" height="'+e.boxH+'" rx="7" fill="var(--flow-source-bg)" stroke="var(--accent)" stroke-width="2"/><text id="'+t+'-fd-flow-label" x="'+(e.boxX+e.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(t==="desktop"?20:19)+'" font-weight="800" fill="var(--accent)" letter-spacing="2">'+d("overview.flowDiagram.flow")+'</text><text id="'+t+'-fd-flow-temp" class="flow-metric" x="'+(e.boxX+e.boxW/2)+'" y="'+a+'" text-anchor="middle" font-size="'+(t==="desktop"?29:27)+'" fill="var(--text-strong)">---</text>'}function bs(){let t=[],e=Y.w,o=Y.h,a=Y.zoneY-20;t.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+e+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(cr("desktop")),t.push(ur(e,o,"desktop")),t.push(mr("desktop")),t.push('<text id="desktop-fd-ret-temp" x="'+(Y.boxX+Y.boxW+24)+'" y="'+(Y.boxY+20)+'" font-size="17" font-weight="800" fill="'+bt+'" font-family="var(--mono)">'+d("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="desktop-fd-dt-label" x="'+(Y.boxX+Y.boxW+24)+'" y="'+(Y.boxY+42)+'" font-size="13" font-weight="800" fill="'+lr+'" letter-spacing="2">'+d("overview.flowDiagram.dt")+"</text>"),t.push('<text id="desktop-fd-dt" x="'+(Y.boxX+Y.boxW+24)+'" y="'+(Y.boxY+66)+'" class="flow-metric" font-size="24" fill="var(--accent)">---</text>');for(let s=1;s<=Me;s++)t.push('<path id="desktop-fd-track-'+s+'" class="flow-track" d="'+ms(s-1)+'" opacity=".7"/>');for(let s=1;s<=Me;s++)t.push('<path id="desktop-fd-path-'+s+'" class="flow-ribbon" d="'+dr(s-1,Y.srcHW,Y.bgDstHW)+'" fill="url(#desktop-rg'+s+')" opacity="1"/>');t.push('<line x1="54" y1="'+a+'" x2="'+(e-54)+'" y2="'+a+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>');for(let s=1;s<=Me;s++){let r=Y.zoneXs[s-1];t.push('<g class="flow-zone-hit">'),t.push('<line id="desktop-fd-tick-'+s+'" x1="'+r+'" y1="'+(a-8)+'" x2="'+r+'" y2="'+(a+8)+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="desktop-fd-zn'+s+'" x="'+r+'" y="'+(a-13)+'" text-anchor="middle" font-size="15" fill="'+Eo+'" font-weight="800" letter-spacing="1.5">Z'+s+"</text>"),t.push('<text id="desktop-fd-zf'+s+'" x="'+r+'" y="'+(a+21)+'" text-anchor="middle" font-size="11.5" fill="'+We+'" font-weight="700" letter-spacing=".55">---</text>'),t.push('<text id="desktop-fd-zsp'+s+'" x="'+r+'" y="'+(a+21)+'" text-anchor="middle" font-size="10.5" fill="'+Jt+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="desktop-fd-zt'+s+'" x="'+r+'" y="'+(a+44)+'" text-anchor="middle" class="flow-metric" font-size="17" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="desktop-fd-zv'+s+'" x="'+(r-30)+'" y="'+(a+64)+'" text-anchor="middle" class="flow-metric" font-size="14" fill="'+We+'">---%</text>'),t.push('<text id="desktop-fd-zr'+s+'" x="'+(r+30)+'" y="'+(a+64)+'" text-anchor="middle" class="flow-metric" font-size="14" fill="'+bt+'">---</text>'),t.push("</g>")}return t.push("</svg>"),t.join("")}function fs(){let t=[],e=B.w,o=B.h;t.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+e+" "+o+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'),t.push(cr("mobile")),t.push(ur(e,o,"mobile")),t.push(mr("mobile"));for(let a=1;a<=Me;a++)t.push('<path id="mobile-fd-track-'+a+'" class="flow-track" d="'+gs(a-1)+'" opacity=".7"/>');for(let a=1;a<=Me;a++)t.push('<path id="mobile-fd-path-'+a+'" class="flow-ribbon" d="'+pr(a-1,B.srcHW,B.bgDstHW)+'" fill="url(#mobile-rg'+a+')" opacity="1"/>');t.push('<rect x="'+(B.boxX+9)+'" y="'+(B.boxY+B.boxH+9)+'" width="'+(B.boxW-18)+'" height="60" rx="8" fill="var(--flow-source-bg)" stroke="var(--flow-return)" stroke-opacity=".7"/>'),t.push('<text id="mobile-fd-ret-temp" x="'+(B.boxX+B.boxW/2)+'" y="'+(B.boxY+B.boxH+27)+'" text-anchor="middle" font-size="14" font-weight="800" fill="'+bt+'" font-family="var(--mono)">'+d("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="mobile-fd-dt-label" x="'+(B.boxX+B.boxW/2)+'" y="'+(B.boxY+B.boxH+43)+'" text-anchor="middle" font-size="11.5" font-weight="800" fill="'+lr+'" letter-spacing="1.1">'+d("overview.flowDiagram.dt")+"</text>"),t.push('<text id="mobile-fd-dt" x="'+(B.boxX+B.boxW/2)+'" y="'+(B.boxY+B.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="var(--accent)">---</text>'),t.push('<line x1="'+B.endX+'" y1="34" x2="'+B.endX+'" y2="'+(o-34)+'" stroke="var(--flow-track)" stroke-width="2" opacity=".72"/>'),t.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="12" fill="'+Ao+'" font-weight="700" letter-spacing="1.2">'+d("overview.graph.layers.temp").toUpperCase()+"</text>"),t.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="12" fill="'+Ao+'" font-weight="700" letter-spacing="1.2">'+d("overview.flowDiagram.flow")+"</text>"),t.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="12" fill="'+Ao+'" font-weight="700" letter-spacing="1.2">'+d("overview.flowDiagram.returnShort")+"</text>");for(let a=1;a<=Me;a++){let s=B.zoneYs[a-1];t.push('<line id="mobile-fd-tick-'+a+'" x1="'+(B.endX-8)+'" y1="'+s+'" x2="'+(B.endX+8)+'" y2="'+s+'" stroke="var(--flow-track)" stroke-width="2"/>'),t.push('<text id="mobile-fd-zn'+a+'" x="'+(B.endX-14)+'" y="'+(s+5)+'" text-anchor="end" font-size="14" fill="'+Eo+'" font-weight="800" letter-spacing="1.2">Z'+a+"</text>"),t.push('<text id="mobile-fd-zf'+a+'" x="'+B.nameX+'" y="'+(s-8)+'" text-anchor="middle" font-size="10.5" fill="'+We+'" font-weight="700" letter-spacing=".5">---</text>'),t.push('<text id="mobile-fd-zsp'+a+'" x="'+B.nameX+'" y="'+(s+8)+'" text-anchor="middle" font-size="10" fill="'+Jt+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="mobile-fd-zt'+a+'" x="506" y="'+(s+5)+'" class="flow-metric" font-size="15" fill="var(--text-strong)">---\xB0C</text>'),t.push('<text id="mobile-fd-zv'+a+'" x="592" y="'+(s+5)+'" class="flow-metric" font-size="15" fill="'+We+'">---%</text>'),t.push('<text id="mobile-fd-zr'+a+'" x="678" y="'+(s+5)+'" class="flow-metric" font-size="15" fill="'+bt+'">---</text>')}return t.push("</svg>"),t.join("")}var vs=()=>'<div class="flow-wrap" role="img" aria-label="'+d("overview.flowDiagram.flow")+'">'+bs()+fs()+"</div>";D({tag:"flow-diagram",render:vs,onMount(t,e){let o=["desktop","mobile"],a={};o.forEach(m=>{a[m]={flowEl:e.querySelector("#"+m+"-fd-flow-temp"),flowLabelEl:e.querySelector("#"+m+"-fd-flow-label"),retEl:e.querySelector("#"+m+"-fd-ret-temp"),dtLabelEl:e.querySelector("#"+m+"-fd-dt-label"),dtEl:e.querySelector("#"+m+"-fd-dt"),zones:new Array(Me+1)};for(let c=1;c<=Me;c++)a[m].zones[c]={textTemp:e.querySelector("#"+m+"-fd-zt"+c),textSetpoint:e.querySelector("#"+m+"-fd-zsp"+c),textFlow:e.querySelector("#"+m+"-fd-zv"+c),textRet:e.querySelector("#"+m+"-fd-zr"+c),label:e.querySelector("#"+m+"-fd-zn"+c),friendly:e.querySelector("#"+m+"-fd-zf"+c),track:e.querySelector("#"+m+"-fd-track-"+c),tick:e.querySelector("#"+m+"-fd-tick-"+c),path:e.querySelector("#"+m+"-fd-path-"+c)}});function s(m,c){m&&(m.textContent=c)}function r(m,c,w,v,f){let g=a[m];s(g.flowLabelEl,d("overview.flowDiagram.flow")),s(g.flowEl,le(c)),s(g.retEl,d("overview.flowDiagram.returnShort")+" "+le(w)),s(g.dtLabelEl,d("overview.flowDiagram.dt")),s(g.dtEl,v==null?"---":v.toFixed(1)+"\xB0C"),g.dtEl&&g.dtEl.setAttribute("fill",f)}function n(){s(e.querySelector("#mobile-fd-temp-head"),d("overview.graph.layers.temp").toUpperCase()),s(e.querySelector("#mobile-fd-flow-head"),d("overview.flowDiagram.flow")),s(e.querySelector("#mobile-fd-ret-head"),d("overview.flowDiagram.returnShort"))}function l(m,c,w){let v=a[m].zones[c];if(!v)return;let{enabled:f,pct:g,temp:b,setpoint:p,valve:x,returnTemp:S,hasReturn:z}=w,N=ds(c,m==="desktop"?11:12),F=le(b),I=p!=null?le(p):"";s(v.label,"Z"+c),s(v.friendly,m==="desktop"?(N||"---")+(I?" ("+I+")":""):N||"---"),s(v.textTemp,F),s(v.textSetpoint,m==="desktop"?"":I?"("+I+")":""),s(v.textFlow,Ye(x)),s(v.textRet,z?le(S):"---"),v.label.setAttribute("fill",f?Eo:ss),v.friendly.setAttribute("fill",f?We:Jt),v.textSetpoint.setAttribute("fill",f?We:Jt),v.textFlow.setAttribute("fill",us(g,f)),v.textRet.setAttribute("fill",z&&f?bt:sr);let R=f&&g!=null&&g>0;v.track.setAttribute("opacity",f?".78":".38"),v.track.setAttribute("stroke-dasharray",f?"none":"5 7"),v.tick.setAttribute("stroke",R?ir:"var(--flow-track)"),v.tick.setAttribute("stroke-width",R?"3":"2");let q=v.path;if(!R)q.setAttribute("opacity","0");else{let E=m==="desktop"?Y:B,Z=Math.max(2.5,g*E.bgDstHW),Q=Math.max(1.3,g*E.srcHW);q.setAttribute("d",m==="desktop"?dr(c-1,Q,Z):pr(c-1,Q,Z)),q.setAttribute("fill","url(#"+m+"-rg"+c+")"),q.setAttribute("opacity",".96")}}function u(){let m=L(i.flow),c=L(i.ret),w=m!=null&&c!=null?Number(m)-Number(c):null,v=w==null||w<3?nr:w>8?ls:is;o.forEach(f=>r(f,m,c,w,v));for(let f=1;f<=Me;f++){let g=L(h.temp(f)),b=L(h.setpoint(f)),p=L(h.valve(f)),x=se(h.enabled(f)),S=String(C(h.tempSource(f))||"Local Probe"),z=ps(C(h.probe(f))||""),N=z?L(h.probeTemp(z)):null,F=S!=="Local Probe"&&N!=null&&!Number.isNaN(Number(N)),I=p!=null?Math.max(0,Math.min(100,Number(p)))/100:null,R={enabled:x,pct:I,temp:g,setpoint:b,valve:p,returnTemp:N,hasReturn:F};o.forEach(q=>l(q,f,R))}}k(i.flow,u),k(i.ret,u),V("zoneNames",u);for(let m=1;m<=Me;m++)k(h.temp(m),u),k(h.setpoint(m),u),k(h.valve(m),u),k(h.enabled(m),u),k(h.probe(m),u),k(h.tempSource(m),u);for(let m=1;m<=8;m++)k(h.probeTemp(m),u);n(),u()}});var hs={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},xs=`
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
`;P("logs-view",xs);var ys=()=>`
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
`;function ws(t){let e=hs[t.level]||{label:"?",color:"var(--text-secondary)"},o=gr(t.tag||""),a=gr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+o+'</span><span class="msg">'+a+"</span></div>"}function gr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var hc=D({tag:"logs-view",render:ys,onMount(t,e){let o=e.querySelector(".logs-stream"),a=e.querySelector(".pause-btn"),s=e.querySelector(".clear-btn"),r=e.querySelector(".download-btn"),n=!1;function l(){if(n)return;let u=Ft();if(!u||!u.length){o.innerHTML='<div class="logs-empty">'+d("logs.waiting")+"</div>";return}let m=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=u.map(ws).join(""),m&&(o.scrollTop=o.scrollHeight)}a.addEventListener("click",()=>{n=!n,a.textContent=n?d("logs.resume"):d("logs.pause"),a.classList.toggle("on",n),n||l()}),s.addEventListener("click",()=>{Ko()}),r.addEventListener("click",()=>{r.disabled=!0,Ea().catch(u=>{console.error("[Logs] download failed:",u),window.alert(d("logs.downloadFailed"))}).finally(()=>{r.disabled=!1})}),V("deviceLog",l),M(e),l()}});var ks=`
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
}`;P("diag-i2c",ks);var zs=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,_c=D({tag:"diag-i2c",render:zs,onMount(t,e){let o=e.querySelector("#i2c-result");function a(){o.textContent=T("i2cResult")||d("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{da()}),V("i2cResult",a),M(e),a()}});var Ss=`
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
`;P("diag-manual-badge",Ss);var _s=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Fc=D({tag:"diag-manual-badge",render:_s,onMount(t,e){let o=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function a(){let s=!!T("manualMode");o&&o.classList.toggle("on",s)}V("manualMode",a),M(e),a()}});var Cs=`
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
`;P("diag-zone-motor",Cs);var Ls=t=>{let e=t.zone||T("selectedZone")||1,o="";for(let a=1;a<=6;a++)o+='<option value="'+a+'"'+(a===e?" selected":"")+">"+d("common.zone")+" "+a+"</option>";return`
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
  `},qc=D({tag:"diag-zone-motor-card",render:Ls,onMount(t,e){let o=Number(t.zone||T("selectedZone")||1),a=!!T("manualMode"),s=e.querySelector(".manual-mode-toggle"),r=e.querySelector(".motor-gated"),n=e.querySelector(".motor-zone-select"),l=e.querySelector(".motor-target-input"),u=e.querySelector(".motor-open-btn"),m=e.querySelector(".motor-close-btn"),c=e.querySelector(".motor-stop-btn"),w=()=>{let b=n.value||String(o),p="";for(let x=1;x<=6;x++)p+='<option value="'+x+'">'+d("common.zone")+" "+x+"</option>";n.innerHTML=p,n.value=b};function v(b){a=!!b,s&&(s.classList.toggle("on",a),s.setAttribute("aria-checked",a?"true":"false")),r&&r.classList.toggle("locked",!a),[n,l,u,m,c].forEach(p=>{p&&(p.disabled=!a)})}function f(){let b=!a;if(v(b),b){dt(!0);for(let p=1;p<=6;p++)vo(p)}else dt(!1)}function g(){let b=L(h.motorTarget(o));l&&b!=null?l.value=Number(b).toFixed(0):l&&(l.value="0")}n==null||n.addEventListener("change",()=>{o=Number(n.value||1),g()}),s==null||s.addEventListener("click",f),s==null||s.addEventListener("keydown",b=>{b.key!==" "&&b.key!=="Enter"||(b.preventDefault(),f())});for(let b=1;b<=6;b++)k(h.motorTarget(b),g);g(),v(a),V("manualMode",()=>{v(!!T("manualMode"))}),M(e),l==null||l.addEventListener("change",b=>{if(!a)return;let p=b.target.value;ga(o,p)}),u==null||u.addEventListener("click",()=>{a&&Ot(o,1e4)}),m==null||m.addEventListener("click",()=>{a&&It(o,1e4)}),c==null||c.addEventListener("click",()=>{a&&vo(o)})}});var ft={FREE_TRAVEL:0,CONTACT:1,UNDER_LOAD:2,STOPPING:3};function vt(t){switch(Number(t)){case ft.CONTACT:return"contact";case ft.UNDER_LOAD:return"load";case ft.STOPPING:return"stopping";default:return"free"}}function To(t){let e=t||[];for(let o=0;o<e.length;o++){let a=Number(e[o].stroke_phase)||0;if(a===ft.CONTACT||a===ft.UNDER_LOAD)return e[o]}return null}function Be(t,e,o){if(e[o]==null)return null;let a=Number(t[e[o]]);return Number.isFinite(a)?a:null}function br(t){let e=String(t||"").split(/\r?\n/).filter(r=>r.trim());if(e.length<2)return[];let o=e[0].split(",").map(r=>r.trim()),a={};for(let r=0;r<o.length;r++)a[o[r]]=r;let s=[];for(let r=1;r<e.length;r++){let n=e[r].split(",");if(n.length<6)continue;let l=u=>Number(n[a[u]]);s.push({t_ms:l("t_ms")||0,motion_count:l("motion_count")||0,current_ma:l("current_ma"),adc_current_raw:Be(n,a,"adc_current_raw"),drive_on:l("drive_on")===1,direction_open:l("direction_open")===1,armed:l("armed")===1,stroke_phase:l("stroke_phase")||0,tacho_period_us:Be(n,a,"tacho_period_us"),tacho_amp_raw:Be(n,a,"tacho_amp_raw"),bemf_raw_a:Be(n,a,"bemf_raw_a"),bemf_raw_b:Be(n,a,"bemf_raw_b"),bemf_differential_raw:Be(n,a,"bemf_differential_raw"),bemf_separation_us:Be(n,a,"bemf_separation_us"),bemf_valid:a.bemf_valid!=null?l("bemf_valid")===1:null,bemf_moving:a.bemf_moving!=null?l("bemf_moving")===1:null,invalid_bemf_samples:Be(n,a,"invalid_bemf_samples")})}return s}function Ms(t){let e=0,o=0;for(let a=0;a<t.length;a++)t[a].drive_on&&(t[a].direction_open?e+=1:o+=1);return e>=o?"open":"close"}function As(t,e){if(!t.length)return null;let o=t.slice().sort((s,r)=>s-r),a=Math.min(o.length-1,Math.max(0,Math.round((o.length-1)*e)));return o[a]}function _e(t){return Math.round(t*10)/10}function Fo(t,e,o){return Math.min(o,Math.max(e,t))}function Es(t){let e=Number(t);return!Number.isFinite(e)||e<=0?null:1e6/e}function fr(t){let e=[];if(!t.length)return e;let o=t[0].t_ms,a=t[t.length-1].t_ms;for(let s=o;s+500<=a;s+=500){let r=t.reduce((u,m)=>Math.abs(m.t_ms-s)<Math.abs(u.t_ms-s)?m:u,t[0]),n=t.reduce((u,m)=>Math.abs(m.t_ms-(s+500))<Math.abs(u.t_ms-(s+500))?m:u,t[0]),l=(n.t_ms-r.t_ms)/1e3;l>.2&&e.push({t_ms:s+500,slope:(n.current_ma-r.current_ma)/l})}return e}function ht(t){let e=t||[],o=[];for(let n=0;n<e.length;n++){let l=e[n],u=l.tacho_period_us!=null?l.tacho_period_us:l.tacho_cadence_us!=null?l.tacho_cadence_us:null;o.push({t_ms:l.t_ms,period_us:u,rate_hz:Es(u)})}let a=e.filter(n=>n.drive_on&&Number.isFinite(n.current_ma)),s=a.length>=2?a:e.filter(n=>Number.isFinite(n.current_ma)),r=fr(s);return{cadence:o,slopes:r,count:e.length,truncated:e.length>=2e3,window_ms:2e3*2}}function vr(t,e){let o=e||Ms(t),a=t.filter(_=>_.drive_on&&Number.isFinite(_.current_ma)&&(o==="open"?_.direction_open:!_.direction_open));if(a.length<8)return{direction:o,ok:!1,reason:"too_few_samples"};let s=a[0].t_ms,r=a[a.length-1].t_ms,n=a.filter(_=>_.t_ms>=s+650),l=n.length>12?n:a,u=Math.max(1,r-(l[0]?l[0].t_ms:s)),m=l.filter(_=>_.t_ms<l[0].t_ms+u*.7),c=l.filter(_=>_.t_ms>=l[0].t_ms+u*.8),w=(m.length?m:l).map(_=>_.current_ma),v=(c.length?c:l.slice(-Math.max(4,l.length/8|0))).map(_=>_.current_ma),f=w.reduce((_,K)=>_+K,0)/w.length,g=Math.max(...a.map(_=>_.current_ma)),b=Math.max(...v),p=Math.max(0,a[a.length-1].motion_count-a[0].motion_count),x=fr(l),S=x.filter(_=>_.t_ms<l[0].t_ms+u*.7).map(_=>_.slope),z=x.filter(_=>_.t_ms>=l[0].t_ms+u*.75).map(_=>_.slope),N=z.length?Math.max(...z):0,F=As(S.map(Math.abs),.9)||0,I=o==="close"?.55:.68,R=f>.5?b/f:0,q=_e(Fo(1+I*Math.max(0,R-1),1.25,2.4)),E=_e(Fo(Math.max(F*2.2,N*.42,.4),.4,8)),Z=_e(Fo(1+.35*Math.max(0,R-1),1.15,1.8)),Q=o==="open"?1.15:null,O=To(a);return{direction:o,ok:!0,start_ms:s,end_ms:r,runtime_ms:r-s,mean_ma:_e(f),peak_ma:_e(g),stall_peak_ma:_e(b),ripples:p,max_stall_slope_ma_s:_e(N),travel_slope_ma_s:_e(F),measured_factor:_e(R),suggested_factor:q,suggested_slope:E,suggested_slope_floor:Z,suggested_ripple_limit:Q,pin_seen:!!O,pin_t_ms:O?O.t_ms:null,pin_motion_count:O?O.motion_count:null,pin_current_ma:O?_e(O.current_ma):null,samples:a}}function hr(t,e){if(!t||!t.ok)return[];let o=t.mean_ma,a=Number(e&&e.factor)||t.suggested_factor;return[{id:"mean",value:o},{id:"threshold",value:_e(o*a)},{id:"suggested",value:_e(o*t.suggested_factor)},{id:"cap",value:100}]}var xt=920,yt=200,xr=56,te={t:16,r:18,b:32,l:52},Ae=xt-te.l-te.r,at=yt-te.t-te.b,No="var(--accent)",Po="var(--series-cool)",Fs="var(--state-warn)",Ts="var(--state-ok)",Ns="var(--state-danger)",Qt="var(--state-warn)",Ro="var(--series-cool)",Do="var(--accent)",Rs="var(--state-ok)",yr={free:"rgba(var(--accent-rgb),.10)",contact:"rgba(245,158,11,.22)",load:"rgba(52,211,153,.20)",stopping:"rgba(239,68,68,.18)"},wr={free:"",contact:"lab-hatch-contact",load:"lab-hatch-load",stopping:"lab-hatch-stop"},Ds=`
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
`;P("motor-lab-charts",Ds);function ot(t,e,o=at){let a=e.max-e.min||1;return te.t+o-(t-e.min)/a*o}function eo(t,e,o,a=yt){t.appendChild(U("text",{class:"chart-axis-label",x:te.l,y:a-8},"0 s")),t.appendChild(U("text",{class:"chart-axis-label",x:te.l+Ae-48,y:a-8},(o/1e3).toFixed(1)+" s"))}function Oo(t,e,o=at){for(let a=0;a<=4;a++){let s=te.t+o*a/4;t.appendChild(U("line",{class:"chart-grid",x1:te.l,x2:te.l+Ae,y1:s,y2:s}));let r=e.max-(e.max-e.min)*a/4;t.appendChild(U("text",{class:"chart-tick",x:8,y:s+4},r.toFixed(0)))}}function Ps(t){if(!t.length)return[];let e=[],o=0,a=Number(t[0].stroke_phase)||0;for(let s=1;s<t.length;s++){let r=Number(t[s].stroke_phase)||0;r!==a&&(e.push({phase:a,start:o,end:s-1}),o=s,a=r)}return e.push({phase:a,start:o,end:t.length-1}),e}function Os(t){let e=t.querySelector("defs");return e||(e=U("defs"),[["lab-hatch-contact","M0 4 L4 0","var(--state-warn)"],["lab-hatch-load","M0 0 L4 4","var(--state-ok)"],["lab-hatch-stop","M0 2 L4 2","var(--state-danger)"]].forEach(([a,s,r])=>{let n=U("pattern",{id:a,width:4,height:4,patternUnits:"userSpaceOnUse"});n.appendChild(U("path",{d:s,stroke:r,"stroke-width":"1",fill:"none"})),e.appendChild(n)}),t.appendChild(e),e)}function wt(t,e,o){let a=document.createElement("div");a.className="chart-card",a.setAttribute("role","img"),a.setAttribute("aria-label",d(o||t));let s=document.createElement("div");return s.className="chart-head",s.innerHTML='<span class="chart-title">'+d(t)+'</span><span class="chart-sub">'+e+"</span>",a.appendChild(s),a}function Is(t,e,o){let a=wt(e,d(o||"diagnostics.lab.empty"),e),s=document.createElement("div");s.className="lab-empty",s.textContent=d("diagnostics.lab.empty"),a.appendChild(s),t.appendChild(a)}function to(t,e,o){return t?d("diagnostics.lab.res.live"):o&&o.truncated?d("diagnostics.lab.res.traceTruncated",{n:2e3}):e&&e.ok?d("diagnostics.lab.res.trace",{direction:d("diagnostics.lab.dir."+e.direction),ms:e.runtime_ms}):d("diagnostics.lab.res.traceReady")}function qs(t,e,o,a,s,r){if(!r.current&&!r.overlays)return;let n=ht(e),l=wt("diagnostics.lab.chart.current",to(s,o,n),"diagnostics.lab.chart.currentAria");if(n.truncated){let x=document.createElement("div");x.className="lab-chart-warn",x.textContent=d("diagnostics.lab.res.ringWarn",{n:2e3,s:n.window_ms/1e3}),l.appendChild(x)}if(!e.length){let x=document.createElement("div");x.className="lab-empty",x.textContent=d("diagnostics.lab.empty"),l.appendChild(x),t.appendChild(l);return}let u=e.map(x=>x.current_ma).filter(Number.isFinite),m=(a||[]).map(x=>x.value).filter(Number.isFinite),c=jt(u.concat([0,40],m),0,50);c.min=0;let w=e[0].t_ms,v=Math.max(1,e[e.length-1].t_ms-w),f=x=>te.l+(e[x].t_ms-w)/v*Ae,g=e.map((x,S)=>({x:f(S),y:ot(x.current_ma,c)})),b=U("svg",{viewBox:"0 0 "+xt+" "+yt,role:"img"});if(Oo(b,c),eo(b,w,v),r.overlays){let x={mean:Po,threshold:Fs,suggested:Ts,cap:Ns};(a||[]).forEach(S=>{let z=ot(S.value,c);b.appendChild(U("line",{x1:te.l,x2:te.l+Ae,y1:z,y2:z,stroke:x[S.id],"stroke-dasharray":S.id==="mean"?"0":"5 4","stroke-width":S.id==="mean"?"1.4":"1.2","vector-effect":"non-scaling-stroke",opacity:S.id==="cap"?".45":".9"}))})}let p=o&&o.ok&&o.pin_seen?{t_ms:o.pin_t_ms,current_ma:o.pin_current_ma,motion_count:o.pin_motion_count,stroke_phase:1}:To(e);if(p&&Number.isFinite(p.t_ms)){let x=te.l+(p.t_ms-w)/v*Ae;b.appendChild(U("line",{x1:x,x2:x,y1:te.t,y2:te.t+at,stroke:Qt,"stroke-dasharray":"3 4","stroke-width":"1.4","vector-effect":"non-scaling-stroke",opacity:".95"})),b.appendChild(U("circle",{cx:x,cy:ot(Number(p.current_ma)||0,c),r:4.2,fill:Qt,stroke:"var(--bg)","stroke-width":"1.5"})),b.appendChild(U("text",{class:"chart-tick",x:Math.min(x+6,te.l+Ae-64),y:te.t+12,fill:Qt},d("diagnostics.lab.pinMark")))}r.current&&b.appendChild(U("path",{d:Je(g),fill:"none",stroke:No,"stroke-width":"2.2","vector-effect":"non-scaling-stroke"})),l.appendChild(b),t.appendChild(l),Qe(b,l,{count:e.length,plotTop:te.t,plotBottom:te.t+at,xAt:f,label:x=>((e[x].t_ms-w)/1e3).toFixed(2)+" s",dots:x=>r.current?[{y:g[x].y,color:No}]:[],rows:x=>[{color:No,label:d("diagnostics.lab.currentMa"),value:Number(e[x].current_ma).toFixed(1)+" mA"},{color:Po,label:d("diagnostics.lab.motion"),value:String(e[x].motion_count)},{color:Qt,label:d("diagnostics.lab.stroke"),value:d("diagnostics.lab.stroke."+vt(e[x].stroke_phase))}]})}function Hs(t,e,o,a){if(!a.phase)return;let s=ht(e),r=wt("diagnostics.lab.chart.phase",to(o,null,s),"diagnostics.lab.chart.phaseAria");if(!e.length){let v=document.createElement("div");v.className="lab-empty",v.textContent=d("diagnostics.lab.empty"),r.appendChild(v),t.appendChild(r);return}let n=e[0].t_ms,l=Math.max(1,e[e.length-1].t_ms-n),u=xr+te.b,m=U("svg",{viewBox:"0 0 "+xt+" "+u,class:"lab-phase-strip",role:"img"});Os(m);let c=10,w=xr-18;Ps(e).forEach(v=>{let f=te.l+(e[v.start].t_ms-n)/l*Ae,g=te.l+(e[v.end].t_ms-n)/l*Ae,b=vt(v.phase),p=Math.max(2,g-f);m.appendChild(U("rect",{x:f,y:c,width:p,height:w,fill:yr[b]||yr.free,stroke:"var(--separator)","stroke-width":"1"})),wr[b]&&m.appendChild(U("rect",{x:f,y:c,width:p,height:w,fill:"url(#"+wr[b]+")",opacity:".55"})),p>54&&m.appendChild(U("text",{x:f+6,y:c+w/2+3},d("diagnostics.lab.stroke."+b))),m.appendChild(U("line",{x1:g,x2:g,y1:c,y2:c+w,stroke:"var(--text-muted)","stroke-width":"1",opacity:".55"}))}),eo(m,n,l,u),r.appendChild(m),t.appendChild(r)}function Bs(t,e,o,a){if(!a.cadence)return;let s=ht(e),r=wt("diagnostics.lab.chart.cadence",to(o,null,s),"diagnostics.lab.chart.cadenceAria"),n=s.cadence.map(f=>f.rate_hz).filter(f=>f!=null&&Number.isFinite(f));if(!n.length){let f=document.createElement("div");f.className="lab-empty",f.textContent=d("diagnostics.lab.chart.cadenceEmpty"),r.appendChild(f),t.appendChild(r);return}let l=jt(n.concat([0]),0,Math.max(10,...n));l.min=0;let u=e[0].t_ms,m=Math.max(1,e[e.length-1].t_ms-u),c=[],w=[];s.cadence.forEach((f,g)=>{f.rate_hz==null||!Number.isFinite(f.rate_hz)||(c.push({x:te.l+(f.t_ms-u)/m*Ae,y:ot(f.rate_hz,l)}),w.push(g))});let v=U("svg",{viewBox:"0 0 "+xt+" "+yt,role:"img"});Oo(v,l),eo(v,u,m),v.appendChild(U("path",{d:Je(c),fill:"none",stroke:Ro,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),r.appendChild(v),t.appendChild(r),Qe(v,r,{count:c.length,plotTop:te.t,plotBottom:te.t+at,xAt:f=>c[f].x,label:f=>((s.cadence[w[f]].t_ms-u)/1e3).toFixed(2)+" s",dots:f=>[{y:c[f].y,color:Ro}],rows:f=>{let g=s.cadence[w[f]];return[{color:Ro,label:d("diagnostics.lab.cadence"),value:g.rate_hz.toFixed(1)+" /s"},{color:Po,label:d("diagnostics.lab.tachoPeriod"),value:Math.round(g.period_us)+" \xB5s"}]}})}function js(t,e,o,a,s){if(!s.slope)return;let r=ht(e),n=wt("diagnostics.lab.chart.slope",to(a,o,r),"diagnostics.lab.chart.slopeAria");if(!r.slopes.length){let g=document.createElement("div");g.className="lab-empty",g.textContent=d("diagnostics.lab.chart.slopeEmpty"),n.appendChild(g),t.appendChild(n);return}let l=r.slopes.map(g=>g.slope),u=o&&o.ok?o.suggested_slope:null,m=jt(l.concat(u!=null?[u,0]:[0]),-2,8),c=e[0].t_ms,w=Math.max(1,e[e.length-1].t_ms-c),v=r.slopes.map(g=>({x:te.l+(g.t_ms-c)/w*Ae,y:ot(g.slope,m)})),f=U("svg",{viewBox:"0 0 "+xt+" "+yt,role:"img"});if(Oo(f,m),eo(f,c,w),u!=null){let g=ot(u,m);f.appendChild(U("line",{x1:te.l,x2:te.l+Ae,y1:g,y2:g,stroke:Rs,"stroke-dasharray":"5 4","stroke-width":"1.3","vector-effect":"non-scaling-stroke"}))}f.appendChild(U("path",{d:Je(v),fill:"none",stroke:Do,"stroke-width":"2","vector-effect":"non-scaling-stroke"})),n.appendChild(f),t.appendChild(n),Qe(f,n,{count:v.length,plotTop:te.t,plotBottom:te.t+at,xAt:g=>v[g].x,label:g=>((r.slopes[g].t_ms-c)/1e3).toFixed(2)+" s",dots:g=>[{y:v[g].y,color:Do}],rows:g=>[{color:Do,label:d("diagnostics.lab.slope"),value:r.slopes[g].slope.toFixed(2)+" mA/s"}]})}function zr(t,e){let o=e&&e.samples||[],a=e&&e.analysis,s=!!(e&&e.live),r=e&&e.overlays,n=Object.assign({current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},e&&e.visible);t.innerHTML="";let l=document.createElement("div");l.className="motor-lab-charts";let u=document.createElement("div");return u.className="gw-controls",u.setAttribute("role","toolbar"),u.setAttribute("aria-label",d("diagnostics.lab.chart.layers")),[["current","diagnostics.lab.chart.layer.current"],["overlays","diagnostics.lab.chart.layer.overlays"],["phase","diagnostics.lab.chart.layer.phase"],["cadence","diagnostics.lab.chart.layer.cadence"],["slope","diagnostics.lab.chart.layer.slope"]].forEach(([c,w])=>{let v=document.createElement("button");v.type="button",v.className="gw-toggle"+(n[c]?"":" is-off"),v.dataset.layer=c,v.setAttribute("aria-pressed",n[c]?"true":"false"),v.textContent=d(w),u.appendChild(v)}),l.appendChild(u),o.length?(qs(l,o,a,r,s,n),Hs(l,o,s,n),Bs(l,o,s,n),js(l,o,a,s,n)):Is(l,"diagnostics.lab.chart.current","diagnostics.lab.chartLive"),t.appendChild(l),u}var Vs=250,Sr=2e4,kt=["setup","arm","seat","open","close","review"],$s=`
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
  min-height: 44px; min-width: 148px; max-width: 220px; padding: 0 12px;
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
  min-width: 148px; min-height: 48px; padding: 0 18px;
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
  flex: 0 0 auto; width: auto; min-width: 148px; min-height: 44px;
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
`;P("diag-motor-lab",$s);var Us=()=>`
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
`;function _r(t){return t==="open"?{factor:L(i.openThresholdMultiplier),slope:L(i.openSlopeThreshold),floor:L(i.openSlopeCurrentFactor),ripple:L(i.openRippleLimitFactor)}:{factor:L(i.closeThresholdMultiplier),slope:L(i.closeSlopeThreshold),floor:L(i.closeSlopeCurrentFactor)}}function zt(t){let e=_r(t.direction),o=t.direction==="open"?"open":"close",a=[{key:o+"_threshold_multiplier",labelKey:t.direction==="open"?"settings.motor.openThreshold":"settings.motor.closeThreshold",current:e.factor,suggested:t.suggested_factor,unit:"x"},{key:o+"_slope_threshold",labelKey:t.direction==="open"?"settings.motor.openSlope":"settings.motor.closeSlope",current:e.slope,suggested:t.suggested_slope,unit:"mA/s"},{key:o+"_slope_current_factor",labelKey:t.direction==="open"?"settings.motor.openSlopeFloor":"settings.motor.closeSlopeFloor",current:e.floor,suggested:t.suggested_slope_floor,unit:"x"}];return t.direction==="open"&&t.suggested_ripple_limit!=null&&a.push({key:"open_ripple_limit_factor",labelKey:"settings.motor.openRippleLimit",current:e.ripple,suggested:t.suggested_ripple_limit,unit:"x"}),a}function Io(t){return d(t?"common.on":"common.off")}function qo(){return{current:null,mean:null,peak:null,slope:null,runtime:0,motion:0,busy:!1,direction:"\u2014",stroke:0,pinSeen:!1,pinAt:null,pinMa:null,tachoPeriodUs:null,tachoCadenceUs:null,cadenceHz:null,faultCode:0,armed:!1,backend:"\u2014",invalidSamples:0,tachoRejected:0}}var td=D({tag:"diag-motor-lab",render:Us,onMount(t,e){let o=Number(T("selectedZone")||1),a="setup",s="idle",r={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},n={open:null,close:null,seat:null},l={samples:[],analysis:null,live:!1},u={current:!0,overlays:!0,phase:!0,cadence:!0,slope:!0},m=[],c=qo(),w=e.querySelector(".lab-step-chip"),v=e.querySelector(".lab-zone-chip"),f=e.querySelector(".lab-banner"),g=e.querySelector(".lab-guide"),b=e.querySelector(".lab-kicker"),p=e.querySelector(".lab-stage h3"),x=e.querySelector(".lab-stage p"),S=e.querySelector(".lab-setup"),z=e.querySelector(".lab-zone"),N=e.querySelector(".lab-phase-label"),F=e.querySelector(".lab-log"),I=e.querySelector(".lab-chart"),R=e.querySelector(".lab-metrics"),q=e.querySelector(".lab-suggest"),E=e.querySelector(".lab-primary"),Z=e.querySelector(".lab-secondary"),Q=e.querySelector(".lab-estop"),O={current:e.querySelector('[data-k="current"]'),mean:e.querySelector('[data-k="mean"]'),peak:e.querySelector('[data-k="peak"]'),slope:e.querySelector('[data-k="slope"]'),runtime:e.querySelector('[data-k="runtime"]'),motion:e.querySelector('[data-k="motion"]'),cadence:e.querySelector('[data-k="cadence"]'),direction:e.querySelector('[data-k="direction"]'),drivers:e.querySelector('[data-k="drivers"]'),busy:e.querySelector('[data-k="busy"]'),stroke:e.querySelector('[data-k="stroke"]'),pin:e.querySelector('[data-k="pin"]'),armed:e.querySelector('[data-k="armed"]'),backend:e.querySelector('[data-k="backend"]'),fault:e.querySelector('[data-k="fault"]'),invalid:e.querySelector('[data-k="invalid"]'),tachoRejected:e.querySelector('[data-k="tachoRejected"]')};function _(A){return kt.indexOf(A)}function K(){return d("common.zone")+" "+o}function ze(){let A=String(o);z.innerHTML=Array.from({length:6},(G,J)=>'<option value="'+(J+1)+'">'+d("common.zone")+" "+(J+1)+"</option>").join(""),z.value=A,z.setAttribute("aria-label",d("diagnostics.lab.motor")),v.textContent=K(),v.setAttribute("aria-label",d("diagnostics.lab.motor"))}function ee(A,G){let J=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});m.push(J+"  "+d(A,G)),m.length>8&&m.shift(),F.innerHTML=m.map(oe=>"<div>"+oe+"</div>").join(""),F.scrollTop=F.scrollHeight}function ro(A){f.textContent=A||"",f.classList.toggle("show",!!A)}function ce(A,G){s=A,N.dataset.kind=G||"",N.textContent=d("diagnostics.lab.phase."+A)}function nt(){let A=vt(c.stroke);O.current.textContent=c.current==null?"\u2014":c.current.toFixed(1)+" mA",O.mean.textContent=c.mean==null?"\u2014":c.mean.toFixed(1)+" mA",O.peak.textContent=c.peak==null?"\u2014":c.peak.toFixed(1)+" mA",O.slope.textContent=c.slope==null?"\u2014":c.slope.toFixed(1)+" mA/s",O.runtime.textContent=c.runtime?(c.runtime/1e3).toFixed(1)+" s":"\u2014",O.motion.textContent=c.motion?String(c.motion):"\u2014",O.cadence.textContent=c.cadenceHz==null?"\u2014":c.cadenceHz.toFixed(1)+" /s",O.direction.textContent=c.direction,O.drivers.textContent=Io(se(i.drivers)),O.busy.textContent=Io(c.busy),O.armed.textContent=Io(c.armed),O.backend.textContent=c.backend||"\u2014",O.fault.textContent=c.faultCode?String(c.faultCode):d("common.ok"),O.invalid.textContent=String(c.invalidSamples||0),O.tachoRejected.textContent=String(c.tachoRejected||0),O.stroke.textContent=d("diagnostics.lab.stroke."+A),O.stroke.dataset.phase=A,c.pinSeen?(O.pin.textContent=d("diagnostics.lab.pinSeen",{count:c.pinAt}),O.pin.dataset.seen="true"):(O.pin.textContent=d("diagnostics.lab.pinWaiting"),O.pin.dataset.seen="false")}function Bo(){let A=l.analysis?hr(l.analysis,_r(l.analysis.direction)):[],G=zr(I,{samples:l.samples,analysis:l.analysis,live:l.live,overlays:A,visible:u});G&&G.addEventListener("click",J=>{let oe=J.target.closest(".gw-toggle");if(!oe)return;let $=oe.dataset.layer;u[$]=!u[$],Object.keys(u).some(de=>u[de])||(u[$]=!0),Bo()})}function Te(A,G,J){l={analysis:A&&A.ok?A:null,samples:G||[],live:!!J},l.analysis&&(c.mean=l.analysis.mean_ma,c.peak=l.analysis.peak_ma,c.slope=l.analysis.max_stall_slope_ma_s),Bo();let oe=[];if(a==="review"?(n.open&&oe.push(...zt(n.open)),n.close&&oe.push(...zt(n.close))):l.analysis&&oe.push(...zt(l.analysis)),!l.analysis&&a!=="review"){R.innerHTML="",q.hidden=!0;return}let $=a==="review"?n.close||n.open:l.analysis;if(!$){R.innerHTML="",q.hidden=!0;return}let ne=$.pin_seen?d("diagnostics.lab.pinMetric",{ms:$.pin_t_ms,count:$.pin_motion_count}):d("diagnostics.lab.pinWaiting"),de=[[d("diagnostics.lab.mean"),$.mean_ma.toFixed(1)+" mA"],[d("diagnostics.lab.peak"),$.peak_ma.toFixed(1)+" mA"],[d("diagnostics.lab.runtime"),($.runtime_ms/1e3).toFixed(1)+" s"],[d("diagnostics.lab.ripples"),String($.ripples)],[d("diagnostics.lab.pin"),ne]];if(a==="review"&&n.open&&n.close){de[0]=[d("diagnostics.lab.mean"),n.open.mean_ma.toFixed(1)+" / "+n.close.mean_ma.toFixed(1)+" mA"],de[1]=[d("diagnostics.lab.peak"),n.open.peak_ma.toFixed(1)+" / "+n.close.peak_ma.toFixed(1)+" mA"];let re=n.close.pin_seen?d("diagnostics.lab.pinMetric",{ms:n.close.pin_t_ms,count:n.close.pin_motion_count}):d("diagnostics.lab.pinWaiting");de[4]=[d("diagnostics.lab.pin"),re]}R.innerHTML=de.map(re=>'<div class="lab-metric"><span>'+re[0]+"</span><strong>"+re[1]+"</strong></div>").join(""),q.querySelector("tbody").innerHTML=oe.map(re=>"<tr><td>"+d(re.labelKey)+"</td><td>"+Number(re.current).toFixed(1)+" "+re.unit+'</td><td class="better">'+Number(re.suggested).toFixed(1)+" "+re.unit+"</td></tr>").join(""),q.hidden=!oe.length}function fe(){let A=a==="halted",G=A?"setup":a,J=_(G),oe=A?"halted":"active";w.dataset.state=oe,w.textContent=A?d("diagnostics.lab.halted"):d("diagnostics.lab.stepChip",{step:J+1,total:kt.length,name:d("diagnostics.lab.steps."+G)}),b.textContent=A?d("diagnostics.lab.halted"):d("diagnostics.lab.stepOf",{step:J+1,total:kt.length}),p.textContent=d("diagnostics.lab."+(A?"halt":G)+".title");let $=a==="seat"&&n.seat||a==="open"&&n.open||a==="close"&&n.close,ne=A?"diagnostics.lab.halt.copy":$?"diagnostics.lab."+G+".done":"diagnostics.lab."+G+".copy";x.textContent=d(ne);let de=a==="setup";g.dataset.setup=de?"true":"false",S.hidden=!de,z.disabled=!de||r.active,v.hidden=de,v.textContent=K(),Q.dataset.armed=r.active?"true":"false",nt();let re=r.active,ve={key:"diagnostics.lab.next",disabled:re,action:"next"},Ne=null;a==="setup"?ve={key:"diagnostics.lab.setup.action",disabled:!1,action:"start"}:a==="arm"?ve={key:"diagnostics.lab.arm.action",disabled:re,action:"arm"}:a==="seat"?ve={key:n.seat?"diagnostics.lab.next":"diagnostics.lab.seat.action",disabled:re,action:n.seat?"next":"seat"}:a==="open"?ve={key:n.open?"diagnostics.lab.next":"diagnostics.lab.open.action",disabled:re,action:n.open?"next":"open"}:a==="close"?ve={key:n.close?"diagnostics.lab.next":"diagnostics.lab.close.action",disabled:re,action:n.close?"next":"close"}:a==="review"?(ve={key:"diagnostics.lab.apply",disabled:!(n.open||n.close),action:"apply"},Ne={key:"diagnostics.lab.restart",action:"restart"}):A&&(ve={key:"diagnostics.lab.restart",disabled:!1,action:"restart"}),re&&(ve={key:"diagnostics.lab.runningAction",disabled:!0,action:"none"}),!re&&(a==="seat"||a==="open"||a==="close")&&!n[a==="seat"?"seat":a]&&s==="failed"&&(ve={key:"diagnostics.lab.retry",disabled:!1,action:a}),!re&&$&&(a==="seat"||a==="open"||a==="close")&&(Ne={key:"diagnostics.lab.restart",action:"restart"}),E.dataset.action=ve.action,E.disabled=!!ve.disabled,E.textContent=d(ve.key),Ne?(Z.hidden=!1,Z.dataset.action=Ne.action,Z.textContent=d(Ne.key)):(Z.hidden=!0,Z.dataset.action="")}function _t(){r.timer&&clearInterval(r.timer),r.timer=null}function Ct(A){if(a=A,(A==="arm"||A==="setup")&&ro(""),A==="review"){let G=n.close||n.open;Te(G,G?G.samples:[],!1),ce("done","ok")}else A==="setup"&&Te(null,[],!1);fe()}async function Dr(){if(!r.active){r.active=!0,ce("arming","run"),fe(),ee("diagnostics.lab.log.arming",{zone:o});try{if(T("manualMode")||(Ce("manualMode",!0),await dt(!0),ee("diagnostics.lab.log.manual")),r.aborted||(se(i.drivers)||(await ct(!0),ee("diagnostics.lab.log.drivers")),r.aborted))return;c.busy=!1,c.armed=!0,ce("armed","ok"),ee("diagnostics.lab.log.armed"),r.active=!1,Ct("seat")}catch(A){r.active=!1,ce("failed","halt"),ee("diagnostics.lab.log.armFailed"),fe()}}}async function Pr(A,G,J){ce("analyzing","run"),fe();let oe=br(A),$=vr(oe,G),ne=$.ok?$.samples:oe;if(J&&(n[J]=$.ok?$:null),Te($,ne,!1),!$.ok)ce("failed","halt"),ee(J==="seat"?"diagnostics.lab.log.seatShort":"diagnostics.lab.log.weak"),J==="seat"&&(n.seat={short:!0},ee("diagnostics.lab.log.seatContinue"));else if(ce("done","ok"),ee("diagnostics.lab.log.captured",{direction:d("diagnostics.lab.dir."+$.direction),peak:$.peak_ma.toFixed(1)}),$.pin_seen){let de=c.pinSeen;c.pinSeen=!0,c.pinAt=$.pin_motion_count,c.pinMa=$.pin_current_ma,c.stroke=1,de||ee("diagnostics.lab.log.pinTrace",{count:$.pin_motion_count,ma:$.pin_current_ma.toFixed(1),ms:$.pin_t_ms})}else(J==="close"||J==="seat")&&ee("diagnostics.lab.log.pinMissing")}async function Or(A,G){for(let J=0;J<6;J++){if(r.aborted)return;try{ce("fetching","run"),fe();let oe=await va();ee("diagnostics.lab.log.trace"),await Pr(oe,A,G);return}catch(oe){if(oe&&oe.code==="motor_busy"){await new Promise($=>setTimeout($,250));continue}ce("failed","halt"),ee("diagnostics.lab.log.traceFailed"),Te(null,r.live,!0);return}}ce("failed","halt")}function Ir(A){let G=A.map(oe=>oe.current_ma).filter(Number.isFinite);if(!G.length)return;let J=G.reduce((oe,$)=>oe+$,0);if(c.mean=Math.round(J/G.length*10)/10,c.peak=Math.round(Math.max(...G)*10)/10,A.length>=2){let oe=A[Math.max(0,A.length-3)],$=A[A.length-1],ne=($.t_ms-oe.t_ms)/1e3;ne>.05&&(c.slope=Math.round(($.current_ma-oe.current_ma)/ne*10)/10)}}async function no(A,G){if(!r.active){r={active:!0,aborted:!1,direction:A,timer:null,live:[],started:Date.now()},c=qo(),c.direction=d("diagnostics.lab.dir."+A),ce("starting","run"),fe(),Te(null,[],!0),ee("diagnostics.lab.log.starting",{direction:d("diagnostics.lab.dir."+A),zone:o});try{if(A==="open"?await Ot(o,1e4):await It(o,1e4),r.aborted)return;ce("waiting","run"),fe();let J=!1,oe=async()=>{if(!r.aborted)try{let $=await fa(),ne=$&&$.data&&$.data.motor_safety?$.data.motor_safety:{},de=Number(ne.current_ma),re=!!ne.motor_busy,ve=ne.drive_on!=null?!!ne.drive_on:re;re&&!J&&(J=!0,ce("running","run"),ee("diagnostics.lab.log.busy")),c.busy=re,c.runtime=Date.now()-r.started,c.motion=Number(ne.motion_evidence_count)||c.motion,c.stroke=Number(ne.stroke_phase)||0,c.tachoPeriodUs=Number(ne.tacho_period_us)||c.tachoPeriodUs,c.tachoCadenceUs=Number(ne.tacho_cadence_us)||c.tachoCadenceUs;let Ne=c.tachoPeriodUs||c.tachoCadenceUs;c.cadenceHz=Ne>0?1e6/Ne:null,c.faultCode=Number(ne.fault_code)||0,c.armed=!!ne.armed,c.backend=ne.backend||c.backend,c.invalidSamples=Number(ne.invalid_samples)||0,c.tachoRejected=Number(ne.tacho_rejected)||0,!c.pinSeen&&(c.stroke===1||c.stroke===2)&&(c.pinSeen=!0,c.pinAt=c.motion,c.pinMa=Number.isFinite(de)?de:c.current,ee("diagnostics.lab.log.pin",{count:c.pinAt,ma:Number(c.pinMa||0).toFixed(1)})),Number.isFinite(de)&&(c.current=de,r.live.push({t_ms:Date.now()-r.started,current_ma:de,motion_count:c.motion,drive_on:ve,direction_open:A==="open",stroke_phase:c.stroke,tacho_period_us:c.tachoPeriodUs,tacho_cadence_us:c.tachoCadenceUs,armed:c.armed,fault_code:c.faultCode,backend:c.backend}),Ir(r.live),Te(null,r.live,!0)),nt(),(J&&!re||Date.now()-r.started>Sr)&&(_t(),c.busy=!1,J&&ee("diagnostics.lab.log.stopped"),r.active=!1,await Or(A,G),fe())}catch($){Date.now()-r.started>Sr&&(_t(),r.active=!1,ce("failed","halt"),ee("diagnostics.lab.log.traceFailed"),fe())}};r.timer=setInterval(oe,Vs),oe()}catch(J){r.active=!1,ce("failed","halt"),ee("diagnostics.lab.log.startFailed"),fe()}}}function qr(){_t(),r={active:!1,aborted:!1,direction:null,timer:null,live:[],started:0},n={open:null,close:null,seat:null},c=qo(),m.length=0,F.innerHTML="",ro(""),ce("idle"),Ct("setup")}async function jo(){r.aborted=!0,r.active=!1,_t(),c.busy=!1,ro(d("diagnostics.lab.estopDone")),ce("halted","halt"),ee("diagnostics.lab.log.estop"),a="halted",fe();try{await ba()}catch(A){}nt()}function Hr(){let A=_(a);A<0||A>=kt.length-1||Ct(kt[A+1])}function Vo(A){if(A==="start"){ee("diagnostics.lab.log.selected",{zone:o}),Ct("arm");return}if(A==="arm")return Dr();if(A==="seat")return no("close","seat");if(A==="open")return no("open","open");if(A==="close")return no("close","close");if(A==="next")return Hr();if(A==="restart")return qr();if(A==="apply"){let G=[];n.open&&G.push(...zt(n.open)),n.close&&G.push(...zt(n.close)),G.forEach(J=>we(J.key,J.suggested)),ce("applied","ok"),ee("diagnostics.lab.log.applied"),fe()}}E.addEventListener("click",()=>Vo(E.dataset.action)),Z.addEventListener("click",()=>Vo(Z.dataset.action)),Q.addEventListener("click",jo),z.addEventListener("change",()=>{o=Number(z.value||1),v.textContent=K()});function Br(A){A.key==="Escape"&&T("section")==="motorlab"&&(A.preventDefault(),jo())}window.addEventListener("keydown",Br),ze(),ce("idle"),Te(null,[],!1),fe(),k(i.drivers,nt),V("manualMode",nt),V("selectedZone",()=>{a==="setup"&&(o=Number(T("selectedZone")||o),z.value=String(o))}),M(e)}});var Zs=`
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
`;P("diag-zone-recovery",Zs);var Ws=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title" data-i18n="diagnostics.recovery.title">Motor recovery</div>
      <div class="recovery-note" data-i18n="diagnostics.recovery.note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="recovery-actions"><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.clearFaultTitle">Clear current fault</strong><span data-i18n="diagnostics.recovery.clearFaultHelp">Acknowledge the current motor fault without changing learned values.</span></div><button class="btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Clear fault</button></div><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.resetFactorsTitle">Reset learned factors</strong><span data-i18n="diagnostics.recovery.resetFactorsHelp">Remove calibration values while leaving the valve stopped.</span></div><button class="btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset factors\u2026</button></div><div class="recovery-action"><div class="recovery-copy"><strong data-i18n="diagnostics.recovery.relearnTitle">Reset and relearn</strong><span data-i18n="diagnostics.recovery.relearnHelp">Reset calibration and start a complete motor learning cycle.</span></div><button class="btn warn recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset and relearn\u2026</button></div></div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,ld=D({tag:"diag-zone-recovery-card",render:Ws,onMount(t,e){let o=Number(T("selectedZone")||1),a=e.querySelector(".recovery-fault-btn"),s=e.querySelector(".recovery-factors-btn"),r=e.querySelector(".recovery-relearn-btn"),n=e.querySelector(".recovery-status");V("selectedZone",()=>{o=Number(T("selectedZone")||1)});let l=null;function u(c,w){n.textContent=c,n.className="recovery-status show "+(w?"ok":"err"),clearTimeout(l),l=setTimeout(()=>{n.classList.remove("show")},4e3)}function m(c,w){let v=c(o);u(w,!0),v&&typeof v.then=="function"&&v.then(f=>{f&&f.ok===!1&&u(d("diagnostics.recovery.rejected"),!1)}).catch(()=>u(d("diagnostics.recovery.unreachable"),!1))}a==null||a.addEventListener("click",()=>{m(ha,"\u2713 "+d("diagnostics.recovery.faultSent",{zone:he(o)}))}),s==null||s.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmFactors",{zone:he(o)}))&&m(xa,"\u2713 "+d("diagnostics.recovery.factorsReset",{zone:he(o)}))}),r==null||r.addEventListener("click",()=>{confirm(d("diagnostics.recovery.confirmRelearn",{zone:he(o)}))&&m(ya,"\u2713 "+d("diagnostics.recovery.relearnStarted",{zone:he(o)}))}),M(e)}});var Ks=`
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
`;P("diag-system-card",Ks);var Gs=()=>`
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
`,fd=D({tag:"diag-system-card",render:Gs,onMount(t,e){let o=e.querySelector('[data-k="cpu0"]'),a=e.querySelector('[data-k="cpu1"]'),s=e.querySelector('[data-k="heap"]'),r=e.querySelector('[data-k="psram"]'),n=e.querySelector('[data-bar="cpu0"]'),l=e.querySelector('[data-bar="cpu1"]'),u=e.querySelector('[data-k="reset"]'),m=(v,f,g)=>{if(g==null||!Number.isFinite(Number(g))){v.textContent="\u2014",v.classList.remove("warn"),f.style.width="0%";return}let b=Math.max(0,Math.min(100,Number(g)));v.textContent=b.toFixed(0)+"%",v.classList.toggle("warn",b>=90),f.style.width=b+"%"},c=(v,f,g)=>{if(f==null||!Number.isFinite(Number(f))){v.textContent="\u2014";return}let b=Number(f);v.textContent=b+" KB",v.classList.toggle("warn",g!=null&&b<g)},w=()=>{m(o,n,L(i.cpuLoadCore0)),m(a,l,L(i.cpuLoadCore1)),c(s,L(i.freeInternalKb),48),c(r,L(i.freePsramKb),null);let v=String(C(i.resetReason)||T("resetReason")||"").trim();u.textContent=v||"\u2014"};e.querySelector(".sys-dump").addEventListener("click",()=>{wa().catch(v=>console.error("[System] dump failed:",v))}),k(i.cpuLoadCore0,w),k(i.cpuLoadCore1,w),k(i.freeInternalKb,w),k(i.freePsramKb,w),k(i.resetReason,w),V("resetReason",w),M(e),w()}});var Xs=`
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
`;P("settings-manifold-card",Xs);var Ys=()=>{let t="";for(let o=1;o<=8;o++)t+="<option>Probe "+o+"</option>";let e="";for(let o=1;o<=8;o++)e+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${ge("settings.manifold.help")}</span></div>
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
  `},Cd=D({tag:"settings-manifold-card",render:Ys,onMount(t,e){let o=e.querySelector(".sm-type"),a=e.querySelector(".sm-flow"),s=e.querySelector(".sm-ret"),r=ke(e);r.select(o,{read:()=>C(i.manifoldType)||"NO (Normally Open)",commit:l=>Se("manifold_type",l)}),r.select(a,{read:()=>C(i.manifoldFlowProbe)||"Probe 7",commit:l=>Se("manifold_flow_probe",l)}),r.select(s,{read:()=>C(i.manifoldReturnProbe)||"Probe 8",commit:l=>Se("manifold_return_probe",l)});function n(){for(let l=1;l<=8;l++){let u=e.querySelector('[data-probe="'+l+'"]');u&&(u.textContent=le(L(h.probeTemp(l))))}}k(i.manifoldType,r.refresh),k(i.manifoldFlowProbe,r.refresh),k(i.manifoldReturnProbe,r.refresh);for(let l=1;l<=8;l++)k(h.probeTemp(l),n);M(e),r.refresh(),n()}});var Js=`
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
`;P("settings-touch-card",Js);var Qs=()=>`
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
  </div>`,Nd=D({tag:"settings-touch-card",render:Qs,onMount(t,e){let o=e.querySelector(".touch-status"),a=e.querySelector(".touch-status-copy"),s=e.querySelector(".touch-identity"),r=e.querySelector(".touch-note"),n=e.querySelector(".touch-error"),l=e.querySelector(".touch-approve"),u=e.querySelector(".touch-disconnect");function m(){let c=se(i.authorityConfigured),w=se(i.authorityProposalPending),v=C(i.authorityState)||"unconfigured",f=w?C(i.authorityProposalInstallationId):C(i.authorityInstallationId),g=w?C(i.authorityProposalCoordinatorId):C(i.authorityCoordinatorId),b=C(i.authorityProposalName)||"Lune Touch",p=C(i.authorityProposalSite)||"House";o.classList.toggle("connected",c&&!w),o.classList.toggle("pending",w),a.innerHTML=w?`<strong>${b} is ready to connect</strong>${c?"Approve it to replace the current Touch connection.":"Review the discovered coordinator, then approve it on this V6."}`:c?`<strong>Control approved</strong>${v.replace(/_/g," ")}${Number(L(i.authorityLeaseRemainingS))>0?` \xB7 ${Math.round(Number(L(i.authorityLeaseRemainingS)))} s lease`:""}`:"<strong>Waiting for Lune Touch</strong>Add this manifold in Lune Touch. Its identity will appear here automatically.",s.hidden=!c&&!w,e.querySelector(".touch-name").textContent=w?b:"Lune Touch",e.querySelector(".touch-site").textContent=w?p:"Approved coordinator",e.querySelector(".touch-installation-value").textContent=f||"\u2014",e.querySelector(".touch-coordinator-value").textContent=g||"\u2014",r.textContent=w?"Approval is local to this manifold. Discovery alone never grants control.":c?"V6 accepts authenticated commands from this Touch while retaining local safety, clamp, and expiry.":"Installation identity and authentication are generated and transferred automatically. There are no connection fields to complete.",l.hidden=!w,u.hidden=!c||w}l.addEventListener("click",async()=>{n.textContent="",l.disabled=!0,l.textContent="Approving\u2026";try{await pa()}catch(c){n.textContent=(c==null?void 0:c.message)||"Unable to approve Lune Touch."}finally{l.disabled=!1,l.textContent="Approve Lune Touch"}}),u.addEventListener("click",async()=>{if(n.textContent="",!!window.confirm("Disconnect Lune Touch? Touch commands will be rejected until it is approved again.")){u.disabled=!0;try{await ua()}catch(c){n.textContent=(c==null?void 0:c.message)||"Unable to disconnect Lune Touch."}finally{u.disabled=!1}}}),[i.authorityConfigured,i.authorityInstallationId,i.authorityCoordinatorId,i.authorityState,i.authorityLeaseRemainingS,i.authorityProposalPending,i.authorityProposalInstallationId,i.authorityProposalCoordinatorId,i.authorityProposalName,i.authorityProposalSite].forEach(c=>k(c,m)),m()}});var ei=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text">Minimum active-loop opening${ge("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel">Local V6 hydraulic safeguard; heat-source and pump coordination stays external.</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row smf-pct-row">
      <span class="ui-label">Minimum total opening (%) <span class="ui-sublabel">Added only across loops already accepting heat; closed satisfied rooms stay closed.</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="100" step="1" placeholder="0" /></span>
    </div>
  </div>
`,Bd=D({tag:"settings-minimum-flow-card",render:ei,onMount(t,e){let o=e.querySelector(".smf-always"),a=e.querySelector(".smf-pct"),s=e.querySelector(".smf-pct-row"),r=ke(e),n=l=>{s.hidden=!l,s.setAttribute("aria-hidden",l?"false":"true"),a.disabled=!l};r.toggle(o,{read:()=>se(i.minimumFlowAlways),onChange:n,commit:l=>{let u=l?"on":"off";y(i.minimumFlowAlways,{state:u}),Se("minimum_flow_always",u).catch(()=>y(i.minimumFlowAlways,{state:l?"off":"on"}))}}),r.num(a,{read:()=>L(i.minZoneFlowPct),commit:l=>{y(i.minZoneFlowPct,{value:l}),we("min_zone_flow_pct",l)}}),k(i.minimumFlowAlways,r.refresh),k(i.minZoneFlowPct,r.refresh),M(e),r.refresh()}});var ti=[{value:"15",labelKey:"settings.bleClock.interval15"},{value:"60",labelKey:"settings.bleClock.interval60"},{value:"360",labelKey:"settings.bleClock.interval360"},{value:"1440",labelKey:"settings.bleClock.interval1440"}];function oi(){if(String(C(i.bleClockSyncAdvertising)||"").toLowerCase()==="on")return d("common.clockSyncing");let t=String(C(i.bleClockSyncLastError)||"").trim();if(t==="clock_invalid")return d("settings.bleClock.waitingClock");if(t==="ble_busy")return d("settings.bleClock.busy");if(t)return t;let e=Number(L(i.bleClockSyncLastOkS)||0);if(!e)return d("settings.bleClock.never");let o=Math.max(0,Math.round(Date.now()/1e3)-e);if(o<60)return d("common.secondsAgo",{value:o});if(o<3600)return d("common.minutesAgo",{value:Math.round(o/60)});let a=Math.round(o/3600);return d("settings.bleClock.hoursAgo",{value:a})}var ai=()=>`
  <div class="ui-card settings-ble-clock-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.bleClock.title">Room clocks</span>${ge("settings.bleClock.help")}</span></div>
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
`,Gd=D({tag:"settings-ble-clock-card",render:ai,onMount(t,e){let o=e.querySelector(".sbc-enabled"),a=e.querySelector(".sbc-interval"),s=e.querySelector(".sbc-status"),r=e.querySelector(".sbc-now"),n=ke(e),l=()=>{let m=a.value;a.innerHTML=ti.map(c=>`<option value="${c.value}">${d(c.labelKey)}</option>`).join(""),m&&(a.value=m)},u=()=>{s.textContent=oi()};l(),n.toggle(o,{read:()=>se(i.bleClockSyncEnabled),commit:m=>{let c=m?"on":"off";y(i.bleClockSyncEnabled,{state:c}),Se("ble_clock_sync_enabled",c).catch(()=>y(i.bleClockSyncEnabled,{state:m?"off":"on"}))}}),n.select(a,{read:()=>String(Math.round(Number(L(i.bleClockSyncIntervalMin))||60)),commit:m=>{let c=Number(m);y(i.bleClockSyncIntervalMin,{value:c}),we("ble_clock_sync_interval_min",c)}}),r.addEventListener("click",()=>{y(i.bleClockSyncAdvertising,{state:"on"}),u(),ye("ble_clock_sync_now")}),k(i.bleClockSyncEnabled,n.refresh),k(i.bleClockSyncIntervalMin,n.refresh),k(i.bleClockSyncLastOkS,u),k(i.bleClockSyncLastError,u),k(i.bleClockSyncAdvertising,u),M(e),n.refresh(),u()}});var ri=`
.settings-card{background:var(--surface-raised);border:1px solid var(--separator);border-radius:10px;padding:18px;box-shadow:none}
.settings-card .card-title{margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--separator);color:var(--text-strong);font-size:.92rem;font-weight:650}
.settings-card .btn-row{display:grid;grid-template-columns:1fr;gap:8px}
.settings-card .btn{width:100%;min-width:0;min-height:44px;padding:9px 14px;border:1px solid var(--control-border);border-radius:8px;background:var(--control-bg);box-shadow:none;color:var(--text-strong);font:inherit;font-weight:650;cursor:pointer}
.settings-card .btn:hover{border-color:var(--control-border-hover);background:var(--control-bg-hover)}
.settings-card .btn.warn{border-color:var(--danger-border);background:transparent;color:var(--danger-text)}
.settings-card .btn.warn:hover{border-color:var(--danger-border-strong);background:var(--danger-bg-soft)}
`;P("settings-control-card",ri);var ni=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Recovery actions</div>
    <div class="btn-row">
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,tp=D({tag:"settings-control-card",render:ni,onMount(t,e){M(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{window.confirm("Reset the 1-Wire probe map and restart V6? Probe assignments must be discovered again.")&&ye("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ye("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{window.confirm("Restart Lune V6 now? Heating continues after the controller has started again.")&&ye("restart")})}});var si=`
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
`;P("settings-motor-calibration-card",si);var oo=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],ii=()=>{let t="";for(let e=0;e<oo.length;e++){let o=oo[e];if(o.key==="generic_runtime_limit_seconds")continue;let a=li(o.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+d(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+a+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${ge("settings.motor.help")}</span></div>
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
  `};function li(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var dp=D({tag:"settings-motor-calibration-card",render:ii,onMount(t,e){let o=e.querySelector(".smc-profile"),a=e.querySelector(".smc-safe-runtime"),s=e.querySelector(".mc-drivers-toggle"),r=ke(e);function n(u){if(u==="HmIP VdMot"&&we("hmip_runtime_limit_seconds",40),u==="Generic"){let m=Number(L(i.genericRuntimeLimitSeconds));(!Number.isFinite(m)||m<=0)&&we("generic_runtime_limit_seconds",45)}}r.toggle(s,{read:()=>se(i.drivers),commit:u=>ct(u)}),r.select(o,{read:()=>C(i.motorProfileDefault)||"HmIP VdMot",commit:u=>{Se("motor_profile_default",u),n(u)}});function l(){let u=C(i.motorProfileDefault)||"HmIP VdMot";a.disabled=u==="HmIP VdMot"}r.num(a,{read:()=>(C(i.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:L(i.genericRuntimeLimitSeconds),commit:u=>{o.value==="Generic"&&we("generic_runtime_limit_seconds",u)}});for(let u=0;u<oo.length;u++){let m=oo[u];if(m.key==="generic_runtime_limit_seconds")continue;let c=e.querySelector(".smc-"+m.cls);c&&(r.num(c,{read:()=>L(m.id),commit:w=>we(m.key,w)}),k(m.id,r.refresh))}k(i.drivers,r.refresh),k(i.motorProfileDefault,()=>{r.refresh(),l()}),k(i.genericRuntimeLimitSeconds,r.refresh),k(i.hmipRuntimeLimitSeconds,r.refresh),M(e),n(C(i.motorProfileDefault)||"HmIP VdMot"),r.refresh(),l()}});var ci=600*1e3,Cr=600,di=`
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
`;P("settings-firmware-card",di);var pi=()=>`
  <div class="ui-card settings-firmware-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.firmware.title">Firmware</span>${ge("settings.firmware.help")}</span></div>
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
`;function Lr(t){let e=String(t||"").trim().replace(/^v/i,"").match(/^(\d+)\.(\d+)\.(\d+)/);return e?[Number(e[1]),Number(e[2]),Number(e[3])]:null}function St(t,e){let o=Lr(t);if(!o)return!1;let a=Lr(e);if(!a)return!0;for(let s=0;s<3;s++)if(o[s]!==a[s])return o[s]>a[s];return!1}function Mr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}function ui(t){let e=String(t||"").trim();return e.length<=Cr?e:e.slice(0,Cr).replace(/\s+\S*$/,"")+"\u2026"}function mi(){let t=document.querySelector(".settings-backup-card");if(!t)return;let e=t.closest("details");e&&(e.open=!0),t.scrollIntoView({behavior:"smooth",block:"center"});let o=t.querySelector(".sbk-save");o&&o.focus({preventScroll:!0})}var xp=D({tag:"settings-firmware-card",render:pi,onMount(t,e){let o=e.querySelector(".sfw-version"),a=e.querySelector(".sfw-status"),s=e.querySelector(".sfw-check"),r=e.querySelector(".sfw-banner"),n=e.querySelector(".sfw-hop"),l=e.querySelector(".sfw-notes"),u=e.querySelector(".sfw-install"),m=e.querySelector(".sfw-asset"),c=e.querySelector(".sfw-jump"),w=e.querySelector(".sfw-file"),v=e.querySelector(".sfw-choose"),f=e.querySelector(".sfw-upload"),g=e.querySelector(".sfw-filename"),b=e.querySelector(".sfw-progress"),p=b.querySelector("i"),x=e.querySelector(".sfw-upload-status"),S=null,z=!1,N=0,F=!1,I=()=>C(i.firmware)||T("firmwareVersion")||"",R=(_,K)=>{a.textContent=_||"",a.className="ui-sublabel sfw-status"+(K?" "+K:"")},q=()=>{let _=Ge.firmware_update;if(!_||_.available!==!0)return null;let K=String(_.latest||"").trim();return K?{tag:K,notes:d("settings.firmware.deviceReported"),asset:xo(K)}:null},E=()=>{let _=q();return S?_&&St(_.tag,S.tag)?_:S:_},Z=()=>{o.textContent=I()||d("settings.firmware.unknownVersion")},Q=()=>{let _=E(),K=!!_&&St(_.tag,I());if(r.hidden=!K,!K){Ce("firmwareUpdateAvailable",null);return}n.innerHTML=Mr(I()||d("settings.firmware.unknownVersion"))+" <span>\u2192</span> "+Mr(_.tag),l.textContent=ui(_.notes)||d("common.noData"),m.href=_.asset.url,m.setAttribute("download",_.asset.name),m.title=_.asset.name,Ce("firmwareUpdateAvailable",{current:I(),latest:_.tag,url:_.asset.url})},O=_=>{z||!_&&N&&Date.now()-N<ci||(z=!0,N=Date.now(),s.disabled=!0,R(d("settings.firmware.checking")),Promise.resolve(ka()).catch(()=>{}),_a().then(K=>{S=K,Q();let ze=St(K.tag,I());R(ze?d("settings.firmware.availableStatus",{version:K.tag}):d("settings.firmware.upToDate"),ze?null:"ok")}).catch(K=>{S=null,Q();let ze=q();if(ze){R(St(ze.tag,I())?d("settings.firmware.availableStatus",{version:ze.tag}):d("settings.firmware.upToDate"),St(ze.tag,I())?null:"ok");return}if((K instanceof Pe?K.code:"network")==="no_releases"){R(d("settings.firmware.noReleases"),"ok");return}R(d("settings.firmware.checkFailed"),"err")}).finally(()=>{z=!1,s.disabled=!1}))};s.addEventListener("click",()=>O(!0)),c.addEventListener("click",mi),u.addEventListener("click",()=>{let _=E();_&&window.confirm(d("settings.firmware.confirmInstall",{version:_.tag}))&&(u.disabled=!0,u.textContent=d("settings.firmware.installing"),Promise.resolve(za()).then(()=>R(d("settings.firmware.installStarted"))).catch(()=>{R(d("settings.firmware.installFailed"),"err"),u.disabled=!1,u.textContent=d("settings.firmware.install")}))}),v.addEventListener("click",()=>w.click()),w.addEventListener("change",()=>{let _=w.files&&w.files[0];g.textContent=_?_.name:d("settings.firmware.noFile"),f.disabled=!_||F,x.textContent="",x.className="ui-note sfw-upload-status"}),f.addEventListener("click",()=>{let _=w.files&&w.files[0];!_||F||window.confirm(d("settings.firmware.confirmUpload",{file:_.name}))&&(F=!0,f.disabled=!0,v.disabled=!0,b.hidden=!1,p.style.width="0%",x.className="ui-note sfw-upload-status",x.textContent=d("settings.firmware.uploading",{value:0}),Promise.resolve(Sa()).catch(K=>console.warn("[Firmware] prepare rejected, continuing with upload:",K)).then(()=>Ca(_,K=>{p.style.width=K+"%",x.textContent=d("settings.firmware.uploading",{value:K})})).then(()=>{p.style.width="100%",x.className="ui-note sfw-upload-status",x.textContent=d("settings.firmware.uploadDone")}).catch(K=>{console.error("[Firmware] upload failed:",K),b.hidden=!0,x.textContent=d("settings.firmware.uploadFailed")}).finally(()=>{F=!1,v.disabled=!1,f.disabled=!1}))}),V("section",()=>{T("section")==="settings"&&O(!1)}),k(i.firmware,()=>{Z(),Q()}),k("firmware_update",Q),M(e),Z(),T("section")==="settings"&&O(!1)}});var gi=`
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
`;P("settings-backup-card",gi);var bi=()=>`
  <div class="ui-card settings-backup-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.backup.title">Backup and restore</span>${ge("settings.backup.help")}</span></div>
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
`,Cp=D({tag:"settings-backup-card",render:bi,onMount(t,e){let o=e.querySelector(".sbk-save"),a=e.querySelector(".sbk-learned"),s=e.querySelector(".sbk-file"),r=e.querySelector(".sbk-choose"),n=e.querySelector(".sbk-restore"),l=e.querySelector(".sbk-filename"),u=e.querySelector(".sbk-status"),m=e.querySelector(".sbk-result"),c=!0,w=!1,v=(f,g)=>{u.textContent=f||"",u.className="sbk-status"+(g?" "+g:"")};a.addEventListener("click",()=>{c=!c,a.classList.toggle("on",c),a.setAttribute("aria-checked",c?"true":"false")}),o.addEventListener("click",()=>{w||(w=!0,o.disabled=!0,m.textContent="",v(d("settings.backup.saving")),La(!0).then(f=>{if(!qt(f))throw new Error("unexpected_export_payload");v(d("settings.backup.saved",{file:Aa(f)}),"ok")}).catch(f=>{console.error("[Backup] export failed:",f),v(d("settings.backup.saveFailed"),"err")}).finally(()=>{w=!1,o.disabled=!1}))}),r.addEventListener("click",()=>s.click()),s.addEventListener("change",()=>{let f=s.files&&s.files[0];l.textContent=f?f.name:d("settings.backup.noFile"),n.disabled=!f||w,m.textContent="",v("")}),n.addEventListener("click",async()=>{let f=s.files&&s.files[0];if(!f||w)return;let g="";try{g=await f.text()}catch(p){v(d("settings.backup.readFailed"),"err");return}let b=null;try{b=JSON.parse(g)}catch(p){v(d("settings.backup.invalidFile"),"err");return}if(!qt(b)){v(d("settings.backup.invalidFile"),"err");return}window.confirm(d("settings.backup.confirmRestore",{file:f.name}))&&(w=!0,n.disabled=!0,m.textContent="",v(d("settings.backup.restoring")),Ma(b,c).then(p=>{v(d("settings.backup.restored"),"ok"),m.textContent=d("settings.backup.result",{applied:p.applied,skipped:p.skipped,ignored:p.ignored})}).catch(p=>{console.error("[Backup] restore failed:",p),v(d("settings.backup.restoreFailed"),"err")}).finally(()=>{w=!1,n.disabled=!1}))}),M(e)}});var Ke=Object.freeze({refinedEmber:"refined-ember",deepForest:"deep-forest"}),Er="lune-dashboard-theme",Fr="(prefers-color-scheme: dark)",rt=null,Ar=!1;function Tr(t){return Object.values(Ke).includes(t)?t:Ke.refinedEmber}function ao(){try{return Tr(localStorage.getItem(Er))}catch(t){return Ke.refinedEmber}}function fi(){return typeof window=="undefined"||typeof window.matchMedia!="function"||window.matchMedia(Fr).matches?"dark":"light"}function vi(){let t=fi();if(typeof document=="undefined")return t;let e=document.documentElement;if(e.dataset.colorScheme=t,e.style.colorScheme=t,!Ar&&typeof window!="undefined"&&typeof window.matchMedia=="function"){rt=window.matchMedia(Fr);let o=()=>{let a=rt.matches?"dark":"light";e.dataset.colorScheme=a,e.style.colorScheme=a,window.dispatchEvent(new CustomEvent("lune-color-scheme-change",{detail:a}))};typeof rt.addEventListener=="function"?rt.addEventListener("change",o):typeof rt.addListener=="function"&&rt.addListener(o),Ar=!0}return t}function Ho(t=ao()){let e=Tr(t);if(typeof document=="undefined")return e;vi();let o=document.documentElement;return Object.values(Ke).forEach(a=>o.classList.remove(`theme-${a}`)),o.classList.add(`theme-${e}`),o.dataset.theme=e,e}function Nr(t){let e=Ho(t);try{localStorage.setItem(Er,e)}catch(o){}return typeof window!="undefined"&&window.dispatchEvent(new CustomEvent("lune-theme-change",{detail:e})),e}var hi=[{value:Ke.refinedEmber,labelKey:"settings.appearance.refinedEmber"},{value:Ke.deepForest,labelKey:"settings.appearance.deepForest"}],xi=()=>`
  <div class="ui-card settings-appearance-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.appearance.title">Appearance</span>${ge("settings.appearance.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.appearance.accent">Accent</span> <span class="ui-sublabel" data-i18n="settings.appearance.accentSub">Colour used for highlights and selected controls in this browser.</span></span>
      <span class="ui-field"><select class="ui-select sap-theme" data-i18n-label="settings.appearance.accent" aria-label="Accent theme"></select></span>
    </div>
  </div>
`,Np=D({tag:"settings-appearance-card",render:xi,onMount(t,e){let o=e.querySelector(".sap-theme"),a=()=>{let s=o.value||ao();o.innerHTML=hi.map(r=>`<option value="${r.value}">${d(r.labelKey)}</option>`).join(""),o.value=s};a(),o.value=ao(),o.addEventListener("change",()=>Nr(o.value)),window.addEventListener("lune-theme-change",s=>{s.detail&&(o.value=s.detail)}),M(e)}});var yi=`
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
`;P("smart-preheat-card",yi);var wi=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${ge("settings.preheat.help")}</span></div>
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
`,jp=D({tag:"smart-preheat-card",render:wi,onMount(t,e){let o=e.querySelector(".absorb-toggle"),a=e.querySelector(".absorb-badge"),s=e.querySelector(".absorb-band"),r=e.querySelector(".absorb-delta"),n=e.querySelector(".absorb-body"),l=ke(e),u=c=>{n&&n.classList.toggle("is-disabled",!c)};l.toggle(o,{read:()=>se(i.preheatAbsorbEnabled),onChange:u,commit:c=>{let w=c?"on":"off";y(i.preheatAbsorbEnabled,{state:w}),Se("preheat_absorb_enabled",w)}}),l.num(s,{read:()=>L(i.preheatAbsorbBandC),commit:c=>{y(i.preheatAbsorbBandC,{value:c}),we("preheat_absorb_band_c",c)}}),l.num(r,{read:()=>L(i.preheatDetectDeltaC),commit:c=>{y(i.preheatDetectDeltaC,{value:c}),we("preheat_detect_delta_c",c)}});function m(){let c=String(C(i.preheatAbsorbing)||"").toLowerCase()==="active";a.textContent=c?d("common.active"):d("common.idle"),a.classList.toggle("active",c)}k(i.preheatAbsorbEnabled,l.refresh),k(i.preheatAbsorbing,m),k(i.preheatAbsorbBandC,l.refresh),k(i.preheatDetectDeltaC,l.refresh),M(e),l.refresh(),m()}});function Rr(t){let e=String(t||"").trim();return/^v?\d+\.\d+\.\d+-.+/.test(e)}Ho();var ki=`
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
`;P("hv6-app-root",ki);var zi=()=>`
<div class="app"><div class="shell"><aside class="side-panel"><div class="side-brand">Lune V6</div><p class="side-subtitle">Local manifold controller</p><div class="side-nav-slot"></div></aside><div class="main-panel"><div class="hdr"></div><main class="view-panel">
<section class="sec active" data-section="overview"><div class="overview-status status-summary"></div><button type="button" class="overview-attention attention" data-open-zones hidden></button><div class="overview-dashboard"><section class="dashboard-section dashboard-hydraulic" aria-labelledby="hydraulic-heading"><div class="dashboard-section-head"><div><h3 id="hydraulic-heading">Hydraulic overview</h3><p>Current temperatures, valve demand and active loops.</p></div><span class="hydraulic-summary"></span></div><div class="flow-diagram-slot"></div><div class="hydraulic-history-slot"></div></section><section class="dashboard-section dashboard-activity" aria-labelledby="activity-heading"><div class="dashboard-section-head"><div><h3 id="activity-heading">24-hour activity</h3><p>Heating and valve state by zone.</p></div></div><div class="timeline-slot"></div></section><section class="dashboard-section dashboard-connection" aria-labelledby="connection-heading"><div class="dashboard-section-head"><div><h3 id="connection-heading">Connection</h3><p>Touch, network and firmware.</p></div></div><div class="connectivity-slot"></div></section></div></section>
<section class="sec" data-section="zones"><div class="zones-index"><div class="zones-index-head"><h2>Zones</h2><p class="zones-count">6 physical loops</p></div><section class="zones-summary" role="status" aria-live="polite"></section><div class="content-group"><div class="group-title"><div class="group-title-main"><h3>Local zones</h3><span>Temperature, applied target, valve and state</span></div></div><div class="zones-list"></div></div></div><section class="zone-detail-view zones-detail-pane" aria-labelledby="selected-zone-title" hidden><div class="zone-detail-toolbar"><button type="button" class="zone-back" data-zone-back>\u2039 All zones</button><div class="zone-tabstrip" role="tablist" aria-label="Select zone"></div></div><div class="zone-detail-heading" id="selected-zone-panel" role="tabpanel" aria-labelledby="selected-zone-tab"><span class="eyebrow">Zone details</span><h2 class="selected-zone-title" id="selected-zone-title">Zone details</h2><p>Applied target, sensor coverage and local safety.</p></div><div class="zone-detail-layout"><div class="zone-detail-slot"></div><section class="zone-configuration-group" aria-label="Zone configuration"><div class="zone-room-slot"></div><div class="zone-sensor-slot"></div></section><details class="disclosure zone-recovery-disclosure"><summary>Service and recovery<small>Only when this zone needs attention</small></summary><div class="disclosure-body zone-recovery-slot"></div></details></div></section></section>
<section class="sec" data-section="settings"><div class="settings-readiness status-summary"></div><div class="settings-layout"><details class="disclosure settings-disclosure touch-settings" open><summary>Touch connection<small>Approval and coordinator identity</small></summary><div class="disclosure-body touch-slot"></div></details><details class="disclosure settings-disclosure"><summary>Manifold and probes<small>Valve type and temperature inputs</small></summary><div class="disclosure-body manifold-slot"></div></details><details class="disclosure settings-disclosure"><summary>Hydraulic safety<small>Minimum active-loop opening</small></summary><div class="disclosure-body minimum-flow-slot"></div></details><details class="disclosure settings-disclosure"><summary>Room clocks<small>Shelly BLU display time</small></summary><div class="disclosure-body ble-clock-slot"></div></details><details class="disclosure settings-disclosure"><summary>Preheat absorption<small>Local handling of external preload</small></summary><div class="disclosure-body preheat-slot"></div></details><details class="disclosure settings-disclosure"><summary>Motor configuration<small>Drivers, profile and learning limits</small></summary><div class="disclosure-body motor-slot"></div></details><details class="disclosure settings-disclosure"><summary>Firmware<small>Version, updates and manual upload</small></summary><div class="disclosure-body firmware-slot"></div></details><details class="disclosure settings-disclosure"><summary>Backup and restore<small>Save or reapply local configuration</small></summary><div class="disclosure-body backup-slot"></div></details><details class="disclosure settings-disclosure"><summary>Appearance<small>Accent colour in this browser</small></summary><div class="disclosure-body appearance-slot"></div></details></div></section>
<section class="sec" data-section="diagnostics"><div class="diagnostics-readiness status-summary"></div><button type="button" class="diagnostics-attention attention" data-open-zones hidden></button><div class="diagnostics-layout"><details class="disclosure diagnostics-disclosure"><summary>Runtime health<small>Processor and memory</small></summary><div class="disclosure-body system-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Hardware and connectivity<small>Network, firmware and I\xB2C</small></summary><div class="disclosure-body diag-health-slot"></div></details><details class="disclosure diagnostics-disclosure"><summary>Device logs<small>Live firmware events</small></summary><div class="disclosure-body logs-main-col"></div></details><details class="disclosure diagnostics-disclosure"><summary>Manual motor control<small>Temporary service operation</small></summary><div class="disclosure-body manual-control-col"></div></details><details class="disclosure diagnostics-disclosure danger-zone"><summary>Recovery and restart<small>Actions that interrupt normal operation</small></summary><div class="disclosure-body diag-actions-slot"></div></details></div></section>
<section class="sec" data-section="motorlab"><div class="motor-lab-slot"></div></section>
<section class="sec" data-section="help"><div class="help-list"><a class="help-item" href="#zones" data-help-section="zones"><strong>Manifolds and zones</strong><p>How physical loops map to rooms and targets.</p></a><a class="help-item" href="#zones"><strong>Sensors</strong><p>Temperature freshness, BLE coverage and fallback behavior.</p></a><a class="help-item" href="#settings"><strong>Touch coordination</strong><p>What Touch controls and what V6 enforces locally.</p></a><a class="help-item" href="#settings"><strong>Hydraulic safety</strong><p>Minimum flow, valve protection and safe local operation.</p></a><a class="help-item" href="#diagnostics"><strong>Diagnostics and recovery</strong><p>Read health evidence before using recovery actions.</p></a></div></section>
<div class="ftr">Lune V6 \xB7 Local manifold controller</div></main></div></div></div>`;D({tag:"app-root",render:zi,onMount(t,e){e.querySelector(".hdr").appendChild(X("hv6-header")),e.querySelector(".side-nav-slot").appendChild(X("hv6-sidebar")),e.querySelector(".zones-list").appendChild(X("zone-grid",{selection:!0,navigate:!0})),e.querySelector(".flow-diagram-slot").appendChild(X("flow-diagram")),e.querySelector(".hydraulic-history-slot").appendChild(X("graph-widgets",{variant:"flow-return"})),e.querySelector(".timeline-slot").appendChild(X("zone-state-timeline")),e.querySelector(".connectivity-slot").appendChild(X("connectivity-card")),e.querySelector(".zone-detail-slot").appendChild(X("zone-detail",{zone:T("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(X("zone-sensor-card")),e.querySelector(".zone-recovery-slot").appendChild(X("diag-zone-recovery-card")),e.querySelector(".zone-room-slot").appendChild(X("zone-room-card")),e.querySelector(".touch-slot").appendChild(X("settings-touch-card")),e.querySelector(".manifold-slot").appendChild(X("settings-manifold-card")),e.querySelector(".minimum-flow-slot").appendChild(X("settings-minimum-flow-card")),e.querySelector(".ble-clock-slot").appendChild(X("settings-ble-clock-card")),e.querySelector(".preheat-slot").appendChild(X("smart-preheat-card")),e.querySelector(".motor-slot").appendChild(X("settings-motor-calibration-card")),e.querySelector(".firmware-slot").appendChild(X("settings-firmware-card")),e.querySelector(".backup-slot").appendChild(X("settings-backup-card")),e.querySelector(".appearance-slot").appendChild(X("settings-appearance-card")),e.querySelector(".diag-actions-slot").appendChild(X("settings-control-card")),e.querySelector(".manual-control-col").appendChild(X("diag-manual-badge")),e.querySelector(".manual-control-col").appendChild(X("diag-zone-motor-card",{zone:T("selectedZone")||1}));let o=e.querySelector(".motor-lab-slot"),a=e.querySelector('.sec[data-section="motorlab"]');function s(){let b=Rr(C(i.firmware)||T("firmwareVersion")),p=e.querySelector('.v6-side-link[data-section="motorlab"]');p&&(p.hidden=!b),a&&(a.hidden=!b),b&&o&&!o.firstChild&&o.appendChild(X("diag-motor-lab")),!b&&T("section")==="motorlab"&&Fe("diagnostics")}k(i.firmware,s),V("firmwareVersion",s),V("section",s),s(),e.querySelector(".logs-main-col").appendChild(X("logs-view")),e.querySelector(".system-health-slot").appendChild(X("diag-system-card")),e.querySelector(".diag-health-slot").appendChild(X("connectivity-card")),e.querySelector(".diag-health-slot").appendChild(X("diag-i2c"));let r=e.querySelectorAll(".sec"),n=e.querySelector(".zones-index"),l=e.querySelector(".zone-detail-view"),u=e.querySelector(".selected-zone-title"),m=e.querySelector(".zone-tabstrip"),c=!1;function w(){let b=T("selectedZone")||1;m.innerHTML=Array.from({length:6},(p,x)=>{let S=x+1,z=S===b;return`<button type="button" class="zone-tab" id="${z?"selected-zone-tab":"zone-tab-"+S}" role="tab" aria-controls="selected-zone-panel" aria-selected="${z}" tabindex="${z?"0":"-1"}" data-zone-select="${S}">${he(S)}</button>`}).join("")}function v(){let b=T("section")||"overview";r.forEach(p=>p.classList.toggle("active",p.dataset.section===b)),g()}function f(){let b=[],p=0,x=0;for(let E=1;E<=6;E++){let Z=String(C(h.enabled(E))).toLowerCase()==="on",Q=String(C(h.state(E))).toLowerCase(),O=String(C(h.motorLastFault(E))).toLowerCase();Z&&b.push(E),Z&&["heating","calling"].includes(Q)&&p++,(Q==="fault"||O!==""&&O!=="none"&&O!=="ok")&&x++}let S=L(i.flow),z=L(i.ret),N=String(C(i.authorityState)||"").replace(/_/g," "),F=x===0&&T("live"),I=`<div class="status-summary-main"><span class="eyebrow">System status</span><h2 class="${F?"status-ok":T("live")?"status-warn":"status-danger"}">${F?"Operating normally":T("live")?"Needs attention":"Device offline"}</h2><p>${x?x+" zone fault"+(x===1?"":"s")+" require attention.":T("live")?"V6 is running local control safely.":"Unable to read current manifold state."}</p></div><div class="status-fact"><span class="eyebrow">Heating</span><strong>${p} zones</strong><small>${b.length} enabled</small></div><div class="status-fact"><span class="eyebrow">Flow</span><strong>${le(S)}</strong><small>Return ${le(z)}</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${N||"not connected"}</strong><small>${L(i.authorityLeaseRemainingS)?Math.round(L(i.authorityLeaseRemainingS))+" s lease":"local control"}</small></div>`,R=se(i.authorityConfigured),q=String(C(i.drivers)||"off");e.querySelector(".overview-status").innerHTML=I,e.querySelector(".hydraulic-summary").textContent=`${p} heating \xB7 Flow ${le(S)} \xB7 Return ${le(z)}`,e.querySelector(".settings-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Configuration</span><h2 class="${T("live")?"status-ok":"status-danger"}">${T("live")?"Ready":"Waiting for device"}</h2><p>V6 validates and saves changes locally.</p></div><div class="status-fact"><span class="eyebrow">Device</span><strong>${T("live")?"Live":"Offline"}</strong><small>local controller</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${R?"Approved":"Not approved"}</strong><small>${R?"authenticated control":"local control only"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${q}</strong><small>motor outputs</small></div>`,e.querySelector(".diagnostics-readiness").innerHTML=`<div class="status-summary-main"><span class="eyebrow">Overall health</span><h2 class="${x?"status-danger":F?"status-ok":"status-warn"}">${x?x+" issue"+(x===1?"":"s"):F?"Healthy":"Awaiting data"}</h2><p>${x?"Resolve current exceptions before using service controls.":"No active motor faults reported."}</p></div><div class="status-fact"><span class="eyebrow">Zone faults</span><strong>${x}</strong><small>${x?"requires review":"none reported"}</small></div><div class="status-fact"><span class="eyebrow">Drivers</span><strong>${q}</strong><small>motor outputs</small></div><div class="status-fact"><span class="eyebrow">Touch</span><strong>${N||"not connected"}</strong><small>${R?"approved":"local control"}</small></div>`,e.querySelector(".zones-count").textContent=`6 physical loops \xB7 ${b.length} enabled \xB7 ${p} heating`,e.querySelector(".zones-summary").innerHTML=`<span class="eyebrow">Zone status</span><h2>${x?x+" zone"+(x===1?"":"s")+" need attention":b.length?p?p+" zone"+(p===1?" is":"s are")+" heating":"All enabled zones are idle":"No zones enabled"}</h2><p>${x?"Open an affected zone to review its valve, sensor and recovery state.":b.length?"Select a zone to review its applied target, sensor coverage and local fallback.":"Enable zones after their valve and temperature source are configured."}</p>`,[e.querySelector(".overview-attention"),e.querySelector(".diagnostics-attention")].forEach(E=>{E.hidden=!x,E.innerHTML=x?`<strong>Review ${x} zone fault${x===1?"":"s"}</strong><span>Open Zones to inspect the affected valve and sensor state.</span>`:""})}function g(){let b=T("selectedZone")||1,p=T("section")==="zones";u.textContent=he(b),w(),n.hidden=!p||c,l.hidden=!p||!c}e.addEventListener("zone-open",()=>{c=!0,g()}),e.querySelector("[data-zone-back]").addEventListener("click",()=>{c=!1,g();let b=e.querySelector(`.zones-list .zone-card[data-zone="${T("selectedZone")||1}"]`);b&&b.focus()}),m.addEventListener("click",b=>{let p=b.target.closest("[data-zone-select]");p&&st(Number(p.dataset.zoneSelect))}),m.addEventListener("keydown",b=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(b.key))return;b.preventDefault();let p=T("selectedZone")||1,x=b.key==="Home"?1:b.key==="End"?6:b.key==="ArrowLeft"?p===1?6:p-1:p===6?1:p+1;st(x),requestAnimationFrame(()=>{var S;return(S=m.querySelector(`[data-zone-select="${x}"]`))==null?void 0:S.focus()})}),e.querySelectorAll("[data-open-zones]").forEach(b=>b.addEventListener("click",()=>{c=!1,Fe("zones")})),e.querySelectorAll("[data-help-section]").forEach(b=>b.addEventListener("click",p=>{p.preventDefault(),Fe(b.dataset.helpSection)})),V("section",v),V("selectedZone",g),V("live",f),V("zoneNames",()=>{w(),f()});for(let b=1;b<=6;b++)[h.temp(b),h.setpoint(b),h.valve(b),h.state(b),h.enabled(b),h.motorLastFault(b)].forEach(p=>k(p,f));[i.flow,i.ret,i.authorityConfigured,i.authorityState,i.authorityLeaseRemainingS,i.drivers].forEach(b=>k(b,f)),M(e),v(),g(),f()}});function Si(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(X("app-root")),Pa()}Si();})();
