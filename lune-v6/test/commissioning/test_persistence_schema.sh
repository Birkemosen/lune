#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
types="$repo_root/components/lv6_config_store/lv6_types.h"
store="$repo_root/components/lv6_config_store/lv6_config_store.cpp"

# Layout changes must migrate or reject old blobs. Room physics contract v1 lives
# on V6 (ZoneConfig v6); cross-manifold rooms and weather stay on Touch.
grep -qE 'ZONE_CONFIG_VERSION = 6' "$types"
grep -qE 'ZONE_CONFIG_VERSION_V5 = 5' "$types"
grep -qE 'HOUSE_PHYSICS_CONFIG_VERSION = 1' "$types"
grep -qE 'GROUPS_CONFIG_VERSION = 1' "$types"
grep -qE 'SYSTEM_CONFIG_VERSION = 5' "$types"
grep -qE 'CONTROL_CONFIG_VERSION = 3' "$types"
# v3 added hp_demand_pct; v2 control blobs are migrated, not reset.
grep -qE 'struct ControlConfigV2' "$types"
grep -qE 'load_section\(handle, KEY_CONTROL, 2, v2\)' "$store"
grep -qE 'BALANCING_CONFIG_VERSION = 3' "$types"
grep -qE 'zone_config_blob_is_current\(uint32_t version, size_t bytes\)' "$types"
grep -qE 'zone_config_blob_is_v5\(uint32_t version, size_t bytes\)' "$types"
grep -qE 'zone_config_blob_is_current\(version, read_size\)' "$store"
grep -qE 'zone_config_blob_is_v5\(version, read_size\)' "$store"
! grep -qE 'struct ForecastConfig' "$types"
! grep -qE 'struct HeliosConfig' "$types"
! grep -qE 'manifold_id\[' "$types"
! grep -qE 'room_id\[' "$types"

# A stale durable section must reset to defaults, not inherit the main blob's
# copy: with an unchanged layout the main blob still loads at full size, and
# keeping it silently undid MOTOR_CONFIG_VERSION 5.
test "$(grep -cE '^    out = T\{\};$' "$store")" -ge 2

echo "Commissioning persistence schema invalidation checks passed."
