#!/bin/sh
set -eu

dashboard=web/dashboard-src/components/views.js
coordinator=components/lune_touch_coordinator/lune_touch_coordinator.cpp
api=web/dashboard-src/core/api.js
app=web/dashboard-src/app/app-root.js
header=web/dashboard-src/app/header.js
store=web/dashboard-src/core/store.js
dashboard_cpp=components/lune_touch_dashboard/lune_touch_dashboard.cpp

for required in 'House status' 'overview-status' 'overview-dashboard' 'overview-zone-list' 'Forecast and preload' 'System coordination' 'Heat source signal' 'Heat Source / DHW' 'roomsOutsideTarget'; do
  rg -F "$required" "$dashboard" >/dev/null
done
! rg -F '<summary>Operational details</summary>' "$dashboard"

for required in 'logicalRooms' 'logical-room-card' 'room-list' 'Zone status' 'Zone details' 'need sensor data' 'manifold loop' 'sensorBattery' 'Back to zones' 'data-zone-picker'; do
  rg -F "$required" "$dashboard" >/dev/null
done

for required in 'manifold-summary' 'manifold-list' 'manifold-disclosure' 'Connection status' 'Add a manifold' 'weather-summary' '72-hour outlook' 'Preload decisions' 'Forecast details'; do
  rg -F "$required" "$dashboard" >/dev/null
done

for required in 'manifold-overview' 'manifold-zone-row' 'Device settings and telemetry' 'Sensor coverage' 'Names and valve outputs are imported from this V6 manifold'; do
  rg -F "$required" "$dashboard" >/dev/null
done
rg -F 'Name and valve output are imported automatically from V6.' "$dashboard" >/dev/null
rg -F 'Configure and name zones on the V6 manifold. Touch imports them automatically.' "$dashboard" >/dev/null
rg -F "review_v6_zones: 'Check V6 zones'" "$dashboard" >/dev/null
! rg -F 'data-save-zone-mapping' "$dashboard"
! rg -F 'data-save-zone-row' "$dashboard"
! rg -F 'data-zone-field="node"' "$dashboard"
! rg -F 'data-zone-field="zone"' "$dashboard"
! rg -F 'map_zones' "$dashboard"
! rg -F 'saveZone:' "$api"
rg -F 'zone_managed_on_v6' "$dashboard_cpp" >/dev/null
rg -F 'Physical zones are imported automatically and configured on their V6 manifold' "$dashboard_cpp" >/dev/null
! rg -F '<details class="device-details' "$dashboard"
rg -F '<section class="device-details"' "$dashboard" >/dev/null
rg -F "area_m2: 48" web/dashboard-src/core/api.js >/dev/null

for required in 'Advanced zone model' 'forecast-wind-level' 'Boost 0.5 C for 45 min' 'Set away for 6 hours' 'Recovery and reset' 'reset-registry'; do
  rg -F "$required" "$dashboard" >/dev/null
done

for required in 'help-view' 'Comfort coordination without giving up local safety' 'Who controls what?' 'heat-source-summary' 'Publishing status' 'Publishing details' 'service-summary' 'Touch identity' 'generated automatically' 'Settings' 'Diagnostics'; do
  rg -F "$required" "$dashboard" >/dev/null
done

for required in 'diagnostics-view' 'System diagnostics' 'Needs attention' 'Commands and events' 'Connections and installation' 'Coordination details' 'Firmware and recovery' 'Approve control on V6'; do
  rg -F "$required" "$dashboard" >/dev/null
done
! rg -F 'Authorize manifold commands' "$dashboard"
! rg -F 'Allow Touch control' "$dashboard"
! rg -F 'settings-authority-key' "$dashboard"
! rg -F 'settings-install-id' "$dashboard"
rg -F 'ensure_automatic_identity_();' "$coordinator" >/dev/null
rg -F '/api/hv6/v1/authority/proposal' "$coordinator" >/dev/null
rg -F 'Generated and persisted Touch installation identity' "$coordinator" >/dev/null
rg -F 'IDENTITY_NAMESPACE = "touch_identity"' "$coordinator" >/dev/null
rg -F 'Loaded OTA-stable Touch installation identity' "$coordinator" >/dev/null
rg -F 'Removed migrated Touch registry from default NVS' "$coordinator" >/dev/null
rg -F 'identity_persistence_needs_sync_' components/lune_touch_coordinator/lune_touch_coordinator.h >/dev/null
rg -F 'esp_http_client_open(client, static_cast<int>(post_length))' "$coordinator" >/dev/null
rg -F 'esp_http_client_write(client, post_body + written' "$coordinator" >/dev/null
rg -F 'json_object_to_form_' "$coordinator" >/dev/null
rg -F 'application/x-www-form-urlencoded' "$coordinator" >/dev/null
! rg -F 'esp_http_client_set_header(client, "Content-Type", "application/json")' "$coordinator" >/dev/null
! rg -F '"zone_exterior_walls"' "$coordinator" >/dev/null
rg -F 'false /* exterior walls are Touch-owned */' "$coordinator" >/dev/null
rg -F "Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'" "$api" >/dev/null
! rg -F "Content-Type': 'application/json'" "$api" >/dev/null
! rg -F 'ODIN' "$dashboard"
rg -F 'const target = selectedRoomTarget(representative);' "$dashboard" >/dev/null
rg -F 'api.saveComfort(zone.room_id' "$dashboard" >/dev/null
rg -F 'const positiveOr = (value, fallback = 1)' "$dashboard" >/dev/null
rg -F 'scheduleEnabledField ? (scheduleEnabledField.checked ? 1 : 0)' "$dashboard" >/dev/null
rg -F "code === 'invalid_room_update'" "$api" >/dev/null
! rg -F 'api.saveRoomAtomic(zone.room_id, atomicRoomPayload(zone, panel, setpoint))' "$dashboard"

rg -F "['help', 'Help'" web/dashboard-src/app/header.js >/dev/null
rg -F "['overview', 'Overview'" web/dashboard-src/app/header.js >/dev/null
rg -F "overview: ['Overview', 'House status and current exceptions']" web/dashboard-src/app/header.js >/dev/null
rg -F "section: 'overview'" web/dashboard-src/core/store.js >/dev/null
! rg -F "['dashboard', 'Dashboard'" web/dashboard-src/app/header.js
rg -F "['diagnostics', 'Diagnostics'" web/dashboard-src/app/header.js >/dev/null
rg -F "['system', 'Settings'" web/dashboard-src/app/header.js >/dev/null
! rg -F "['setup', 'Setup'" web/dashboard-src/app/header.js
rg -F "section === 'help' || section === 'setup'" web/dashboard-src/core/api.js >/dev/null

rg -F 'AbortController' web/dashboard-src/core/api.js >/dev/null
rg -F 'restoreDrafts' web/dashboard-src/app/app-root.js >/dev/null
rg -F 'lune-touch-write-success' web/dashboard-src/app/app-root.js >/dev/null
! rg -F 'fonts.googleapis.com' web/dashboard-src
rg -F "const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'" "$store" >/dev/null
rg -F 'root.dataset.colorScheme = scheme' "$store" >/dev/null
rg -F "colorSchemeMedia.addEventListener('change', update)" "$store" >/dev/null
rg -F ':root[data-color-scheme="light"]' "$app" >/dev/null
rg -F 'Accent theme' "$header" >/dev/null
! rg -F '>Appearance<' "$header" >/dev/null
rg -F 'color-scheme\" content=\"light dark' "$dashboard_cpp" >/dev/null

echo 'PASS Phase 8 dashboard overview and logical-room UI source contracts'
