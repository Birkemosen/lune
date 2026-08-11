#!/bin/sh
set -eu

dashboard=web/dashboard-src/components/views.js

for required in 'House physical' 'House target' 'Rooms outside target' 'Heat source physical signal' 'ODIN / DHW' 'V6 nodes / sensor coverage' 'roomsOutsideTarget'; do
  rg -F "$required" "$dashboard" >/dev/null
done

for required in 'logicalRooms' 'logical-room-card' 'bound loop' 'sensorBattery'; do
  rg -F "$required" "$dashboard" >/dev/null
done
rg -F "area_m2: 48" web/dashboard-src/core/api.js >/dev/null

for required in 'Advanced room model' 'forecast-wind-level' 'Boost +0.5 C / 45m' 'Away −2 C / 6h' 'Destructive service' 'reset-registry'; do
  rg -F "$required" "$dashboard" >/dev/null
done

rg -F 'AbortController' web/dashboard-src/core/api.js >/dev/null
rg -F 'restoreDrafts' web/dashboard-src/app/app-root.js >/dev/null
rg -F 'lune-touch-write-success' web/dashboard-src/app/app-root.js >/dev/null
! rg -F 'fonts.googleapis.com' web/dashboard-src

echo 'PASS Phase 8 dashboard overview and logical-room UI source contracts'
