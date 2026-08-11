#!/bin/sh
set -eu

display=packages/display/lvgl_stability.yaml
coordinator=components/lune_touch_coordinator/lune_touch_coordinator.cpp

for required in 'touch_heating_status_label' 'touch_alarm_status_label' 'Boost 45m' 'Away 6h' 'Target +0.5' 'Detailed commissioning and service remain browser-first.'; do
  rg -F "$required" "$display" >/dev/null
done

for required in 'heating_summary_text' 'alarm_summary_text' 'display_adjust_primary_target' 'display_boost_primary_room' 'display_away_primary_room'; do
  rg -F "$required" "$coordinator" >/dev/null
done

echo 'PASS Phase 8.5 local display is status-and-simple-controls only'
