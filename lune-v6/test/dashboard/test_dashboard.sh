#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
app="$root/web/dashboard-src/app/app-root.js"
header="$root/web/dashboard-src/app/header.js"
card="$root/web/dashboard-src/components/zone/zone-card.js"
keys="$root/web/dashboard-src/utils/keys.js"
flow="$root/web/dashboard-src/components/overview/flow-diagram.js"
touch="$root/web/dashboard-src/components/settings/settings-touch-card.js"
dashboard_cpp="$root/components/lv6_dashboard/lv6_dashboard.cpp"
api="$root/web/dashboard-src/core/api.js"
theme="$root/web/dashboard-src/core/theme.js"

rg -F '<div class="main-panel"><div class="hdr"></div><main class="view-panel">' "$app" >/dev/null
rg -F 'overview-status status-summary' "$app" >/dev/null
rg -F 'Local heating status and current exceptions' "$header" >/dev/null
rg -F 'position:sticky;top:0;z-index:20' "$app" >/dev/null
rg -F 'Hydraulic overview' "$app" >/dev/null
rg -F '24-hour activity' "$app" >/dev/null
rg -F 'dashboard-connection' "$app" >/dev/null
rg -F 'flow-diagram-slot' "$app" >/dev/null
rg -F 'hydraulic-history-slot' "$app" >/dev/null
rg -F 'Needs attention' "$app" >/dev/null
rg -F 'aria-current' "$header" >/dev/null
rg -F 'v6-more-toggle' "$header" >/dev/null
rg -F '<button type="button" class="zone-card"' "$card" >/dev/null
rg -F 'subscribeDashboard, zoneLabel, zoneTag' "$card" >/dev/null
rg -F "setSection('zones')" "$card" >/dev/null
rg -F '.zone-card.zs-heating .zc-dot{background:var(--accent)}' "$card" >/dev/null
rg -F '.zone-card.zs-idle .zc-dot,.zone-card.zs-off .zc-dot{background:var(--state-disabled)}' "$card" >/dev/null
! rg -F '.zone-card.zs-idle .zc-dot{background:var(--state-ok)}' "$card" >/dev/null
rg -F 'data-open-zones' "$app" >/dev/null
for removed in 'overview-zones' 'zones-master-detail' 'settings-group-head' 'diagnostics-group-head'; do
  if rg -F "$removed" "$app" >/dev/null; then
    echo "Unexpected legacy dashboard pattern: $removed" >&2
    exit 1
  fi
done
rg -F 'settings-disclosure touch-settings' "$app" >/dev/null
rg -F 'Waiting for Lune Touch' "$touch" >/dev/null
rg -F 'Approve Lune Touch' "$touch" >/dev/null
! rg -F 'Manual recovery' "$touch" >/dev/null
! rg -F 'Connection key' "$touch" >/dev/null
! rg -F 'touch-installation"' "$touch" >/dev/null
rg -F 'authorityProposalPending' "$keys" >/dev/null
rg -F 'handle_authority_proposal_' "$dashboard_cpp" >/dev/null
rg -F 'awaiting_local_approval' "$dashboard_cpp" >/dev/null
rg -F 'approve-proposal' "$dashboard_cpp" >/dev/null
rg -F 'authority_pairing_required' "$dashboard_cpp" >/dev/null
rg -F 'handle_authority_revoke_' "$dashboard_cpp" >/dev/null
! rg -F 'strcmp(key, "authority_shared_key")' "$dashboard_cpp" >/dev/null
rg -F "Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'" "$api" >/dev/null
! rg -F "Content-Type': 'application/json'" "$api" >/dev/null
rg -F 'Preheat absorption' "$app" >/dev/null
rg -F 'diagnostics-attention attention' "$app" >/dev/null
rg -F 'Runtime health' "$app" >/dev/null
rg -F 'Hardware and connectivity' "$app" >/dev/null
rg -F 'Manual motor control' "$app" >/dev/null
rg -F 'Recovery and restart' "$app" >/dev/null
rg -F "window.confirm('Restart Lune V6 now?" "$root/web/dashboard-src/components/settings/settings-control-card.js" >/dev/null
rg -F "window.confirm('Reset the 1-Wire probe map" "$root/web/dashboard-src/components/settings/settings-control-card.js" >/dev/null
rg -F 'zones-index' "$app" >/dev/null
rg -F 'zones-summary' "$app" >/dev/null
rg -F 'zone-detail-toolbar' "$app" >/dev/null
rg -F 'zone-configuration-group' "$app" >/dev/null
rg -F 'Service and recovery' "$app" >/dev/null
rg -F 'class="zone-tabstrip" role="tablist"' "$app" >/dev/null
rg -F 'role="tab"' "$app" >/dev/null
rg -F 'data-zone-back' "$app" >/dev/null
rg -F "zoneTabstrip.addEventListener('click'" "$app" >/dev/null
rg -F "['ArrowLeft','ArrowRight','Home','End']" "$app" >/dev/null
! rg -F 'class="zone-picker"' "$app" >/dev/null
! rg -F 'zone_exterior_walls' "$root/web/dashboard-src" >/dev/null
! rg -F 'exterior_walls' "$dashboard_cpp" >/dev/null
! rg -F 'zone_area_m2' "$root/web/dashboard-src" >/dev/null
! rg -F 'zone_pipe_spacing_mm' "$root/web/dashboard-src" >/dev/null
! rg -F 'zone_pipe_type' "$root/web/dashboard-src" >/dev/null
! rg -F 'Zone Area' "$root/web/dashboard-src" >/dev/null
! rg -F 'Pipe Spacing' "$root/web/dashboard-src" >/dev/null
! rg -F 'Pipe Type' "$root/web/dashboard-src" >/dev/null
rg -F 'Zone identity' "$root/web/dashboard-src/components/zone/zone-room-card.js" >/dev/null
! rg -F "input.addEventListener('dblclick'" "$root/web/dashboard-src/core/ui-kit.js" >/dev/null
rg -F "new CustomEvent('zone-open'" "$card" >/dev/null
rg -F 'Advanced motor properties' "$root/web/dashboard-src/components/zone/zone-detail.js" >/dev/null
rg -F 'badge-heating{background:rgba(var(--accent-rgb),.12);color:var(--accent)}' "$root/web/dashboard-src/components/zone/zone-detail.js" >/dev/null
rg -F '.status-summary h2.status-ok{color:var(--text-strong)!important}' "$app" >/dev/null
rg -F 'effectiveSetpoint' "$keys" >/dev/null
rg -F 'baseSetpoint' "$keys" >/dev/null
rg -F 'coordinatorOffset' "$keys" >/dev/null
rg -F 'coordinatorRemaining' "$keys" >/dev/null
rg -F -- '--flow-track:#596779' "$app" >/dev/null
rg -F 'class="flow-track"' "$flow" >/dev/null
rg -F "zoneRefs.track.setAttribute('stroke-dasharray', enabled ? 'none' : '5 7')" "$flow" >/dev/null
rg -F 'const flowing = enabled && pct != null && pct > 0' "$flow" >/dev/null
! rg -F 'desktop-boxgrad' "$flow" >/dev/null
rg -F 'fill="var(--flow-source-bg)" stroke="var(--accent)"' "$flow" >/dev/null
rg -F 'return pct > 0 ? COLOR_FLOW_ACTIVE : COLOR_FRIENDLY_ON' "$flow" >/dev/null
! rg -F '#021824' "$flow" >/dev/null
! rg -F 'stop-color="#7aa7ce"' "$flow" >/dev/null
! rg -F 'fonts.googleapis.com' "$root/web/dashboard-src" >/dev/null
! rg -F 'grid-template-columns: repeat(3' "$app" >/dev/null
! rg -F 'Target Temperature' "$root/web/dashboard-src/components/zone/zone-detail.js" >/dev/null
rg -F "const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'" "$theme" >/dev/null
rg -F 'root.dataset.colorScheme = scheme' "$theme" >/dev/null
rg -F "colorSchemeMedia.addEventListener('change', update)" "$theme" >/dev/null
rg -F ':root[data-color-scheme="light"]' "$app" >/dev/null
rg -F 'Accent theme' "$header" >/dev/null
! rg -F '>Appearance<' "$header" >/dev/null
rg -F 'color-scheme\" content=\"light dark' "$dashboard_cpp" >/dev/null
rg -F 'reserved_touch_weather_v4' "$root/components/lv6_config_store/lv6_types.h" >/dev/null

echo 'PASS V6 dashboard HIG source contracts'
