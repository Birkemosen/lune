#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
types="$repo_root/components/lv6_config_store/lv6_types.h"
store="$repo_root/components/lv6_config_store/lv6_config_store.cpp"

# Layout changes must reject old blobs instead of assigning invented values to
# an existing installation. Room/manifold identity and weather exposure live on
# Touch; V6 ZoneConfig v5 dropped those fields.
grep -qE 'ZONE_CONFIG_VERSION = 5' "$types"
grep -qE 'SYSTEM_CONFIG_VERSION = 4' "$types"
grep -qE 'CONTROL_CONFIG_VERSION = 2' "$types"
grep -qE 'BALANCING_CONFIG_VERSION = 3' "$types"
grep -qE 'zone_config_blob_is_current\(uint32_t version, size_t bytes\)' "$types"
grep -qE 'if \(!zone_config_blob_is_current\(version, read_size\)\)' "$store"
! grep -qE 'struct ForecastConfig' "$types"
! grep -qE 'struct HeliosConfig' "$types"
! grep -qE 'manifold_id\[' "$types"
! grep -qE 'room_id\[' "$types"

# A stale durable section must reset to defaults, not inherit the main blob's
# copy: with an unchanged layout the main blob still loads at full size, and
# keeping it silently undid MOTOR_CONFIG_VERSION 5.
test "$(grep -cE '^    out = T\{\};$' "$store")" -ge 2

echo "Commissioning persistence schema invalidation checks passed."
