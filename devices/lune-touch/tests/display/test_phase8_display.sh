#!/bin/sh
set -eu

display=packages/display/lvgl_stability.yaml
manifold=packages/display/lvgl/manifold_card.yaml
zone_cell=packages/display/lvgl/manifold_zone_cell.yaml
coordinator=components/lune_touch_coordinator/lune_touch_coordinator.cpp
header=web/dashboard-src/app/header.js
dashboard_cpp=components/lune_touch_dashboard/lune_touch_dashboard.cpp

for required in \
  'id: dashboard_system_status_label' \
  'id: dashboard_heat_source_status_label' \
  'id: dashboard_weather_status_label' \
  'id: dashboard_bottom_status_bar' \
  'id: dashboard_problem_card' \
  'id: dashboard_activity_label' \
  'id: dashboard_startup_overlay' \
  'id: dashboard_startup_spinner' \
  'id: zone_control_modal' \
  'id: zone_modal_room_label' \
  'id: touch_display_refresh_token' \
  'id: dashboard_manifold_page_previous_button' \
  'id: dashboard_manifold_page_label' \
  'id: dashboard_manifold_page_next_button' \
  'Boost 45 min' \
  'Away 6 hours' \
  'pclk_frequency: 20MHz' \
  'buffer_size: 12%' \
  'full_refresh: false' \
  'update_interval: 50ms' \
  'update_interval: 5s' \
  'y: 542' \
  'height: 50'; do
  rg -F "$required" "$display" >/dev/null
done

for node in 0 1 2 3; do
  rg -F "vars: {node: $node" "$display" >/dev/null
done

for zone in 0 1 2 3 4 5; do
  rg -F "zone: $zone" "$manifold" >/dev/null
done

rg -F 'display_select_zone(${node}, ${zone})' "$zone_cell" >/dev/null
rg -F 'width: 134' "$zone_cell" >/dev/null
rg -F 'width: 984' "$manifold" >/dev/null
rg -F 'height: 108' "$zone_cell" >/dev/null
rg -F 'height: 108' "$manifold" >/dev/null
rg -F 'id: dashboard_m${node}_z${zone}_bar' "$zone_cell" >/dev/null
rg -F 'id: dashboard_m${node}_z${zone}_temperature_label' "$zone_cell" >/dev/null
rg -F 'text_font: montserrat_22' "$zone_cell" >/dev/null
rg -F 'text_font: montserrat_16' "$zone_cell" >/dev/null

for required in \
  'heating_summary_text' \
  'alarm_summary_text' \
  'display_refresh_token' \
  'display_header_text' \
  'display_zone_mask' \
  'display_manifold_page' \
  'display_manifold_page_count' \
  'display_set_manifold_page' \
  'display_manifold_text' \
  'display_zone_cell_text' \
  'display_zone_name_text' \
  'display_zone_temperature_text' \
  'display_zone_setpoint_text' \
  'display_zone_valve_pct' \
  'display_zone_status_color' \
  'display_heat_source_text' \
  'display_forecast_text' \
  'display_problem_visible' \
  'display_problem_text' \
  'display_selected_room_text' \
  'display_select_zone' \
  'display_adjust_primary_target' \
  'display_boost_primary_room' \
  'display_away_primary_room'; do
  rg -F "$required" "$coordinator" >/dev/null
done

for heading in Manifold 'Zones (Z1-Z6)'; do
  rg -F "text: \"$heading\"" "$display" >/dev/null
done

rg -F 'max_value: 5' "$zone_cell" >/dev/null
rg -F 'lv_bar_get_value' "$display" >/dev/null
rg -F 'lv_obj_add_flag(id(dashboard_bottom_status_bar), LV_OBJ_FLAG_HIDDEN)' "$display" >/dev/null
rg -F 'lv_obj_clear_flag(id(dashboard_bottom_status_bar), LV_OBJ_FLAG_HIDDEN)' "$display" >/dev/null
rg -F 'DISPLAY_ICON_OK[] = "\xEF\x80\x8C"' "$coordinator" >/dev/null
rg -F 'DISPLAY_ICON_RIGHT[] = "\xEF\x81\x94"' "$coordinator" >/dev/null
rg -F 'DISPLAY_ICON_WARNING[] = "\xEF\x81\xB1"' "$coordinator" >/dev/null
rg -F 'DISPLAY_ICON_WIND[] = "\xEF\x81\xB4"' "$coordinator" >/dev/null
rg -F '%s %s | sent %s | confirmed %s' "$coordinator" >/dev/null
rg -F '%s %.1f C | %s %.1f m/s | %s' "$coordinator" >/dev/null
rg -F 'text: "\uF00C  Live"' "$display" >/dev/null
rg -F 'text: "\uF054 --.- C"' "$zone_cell" >/dev/null
display_text=$(sed -n '/display_header_text() const/,/display_selected_room_text() const/p' "$coordinator")
if printf '%s' "$display_text" | rg '[●→↑↓↗·−]' >/dev/null || rg '[●→↑↓↗·−]' "$display" "$zone_cell" >/dev/null; then
  echo 'FAIL local display strings contain glyphs absent from LVGL Montserrat' >&2
  exit 1
fi
rg -F 'const size_t visible_node_count = std::min<size_t>(4, model_.node_count());' "$coordinator" >/dev/null
rg -F 'valve_level' "$coordinator" >/dev/null
rg -F 'layout_signature != previous_layout_signature' "$display" >/dev/null
rg -F 'constexpr uint8_t manifolds_per_page = 2' "$display" >/dev/null
rg -F 'constexpr int manifold_gap = 12' "$display" >/dev/null
rg -F 'constexpr int zone_gap = 10' "$display" >/dev/null
rg -F 'const int manifold_height = visible_manifolds == 0 ? 219' "$display" >/dev/null
rg -F 'const int zone_width = (zone_grid_width - 2 * zone_gap) / 3' "$display" >/dev/null
rg -F 'const int zone_height = (manifold_height - zone_gap) / 2' "$display" >/dev/null
rg -F 'const int zone_column = zone % 3' "$display" >/dev/null
rg -F 'const int zone_row = zone / 3' "$display" >/dev/null
rg -F 'lv_obj_set_size(zone_buttons[node][zone], zone_width, zone_height)' "$display" >/dev/null
rg -F 'lv_obj_set_style_text_font(zone_temperature_labels[node][zone], temperature_font' "$display" >/dev/null
rg -F 'const uint8_t mask = node == nullptr ? 0 : 0x3F' "$coordinator" >/dev/null
rg -F 'std::min<uint8_t>(display_manifold_page_, display_page_count - 1)' "$coordinator" >/dev/null
token_body=$(sed -n '/display_refresh_token() const/,/display_header_text() const/p' "$coordinator")
! printf '%s' "$token_body" | rg -F 'poll_generation_'
! printf '%s' "$token_body" | rg -F 'last_seen_ms'
! printf '%s' "$token_body" | rg -F 'last_write_ms'
rg -F 'return display_refresh_token_cache_' "$coordinator" >/dev/null
! rg -F 'Not mapped' "$zone_cell"

primary_start=$(rg -n 'const primarySections' "$header" | cut -d: -f1)
heat_source_web_line=$(rg -n "\['heat-source', 'Heat Source'" "$header" | cut -d: -f1)
system_start=$(rg -n 'const systemSections' "$header" | cut -d: -f1)
test "$primary_start" -lt "$heat_source_web_line"
test "$heat_source_web_line" -lt "$system_start"
rg -F 'zone-save-polish-20260815' "$dashboard_cpp" >/dev/null
rg -F 'public, max-age=31536000, immutable' "$dashboard_cpp" >/dev/null
rg -F 'STATIC_CHUNK_SIZE = 1024' "$dashboard_cpp" >/dev/null
rg -F 'memcpy(chunk, data + offset, to_send)' "$dashboard_cpp" >/dev/null

if rg 'id: view_|nav_indicator' "$display" >/dev/null; then
  echo 'FAIL the local display must remain one dashboard, not local navigation' >&2
  exit 1
fi

if rg -F 'full_refresh: true' "$display" >/dev/null; then
  echo 'FAIL full-screen redraw reintroduces RGB flicker and tearing' >&2
  exit 1
fi

if rg -F 'id: dashboard_startup_progress' "$display" >/dev/null; then
  echo 'FAIL startup duration is unknown; do not show invented determinate progress' >&2
  exit 1
fi

if rg -F 'dashboard_zone_row_' "$display" >/dev/null; then
  echo 'FAIL the local display must address physical manifold/zone cells' >&2
  exit 1
fi

if rg -F 'Quick controls' "$display" >/dev/null; then
  echo 'FAIL simple controls must remain in their zone context' >&2
  exit 1
fi

echo 'PASS local Touch display pages manifolds into 3x2 zone matrices with coalesced partial refresh'
