#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
types="$repo_root/components/lv6_config_store/lv6_types.h"
store="$repo_root/components/lv6_config_store/lv6_config_store.cpp"

# Layout changes must reject old blobs instead of assigning an invented physical
# manifold identity or pump value to an existing installation.
grep -qE 'ZONE_CONFIG_VERSION = 4' "$types"
grep -qE 'SYSTEM_CONFIG_VERSION = 3' "$types"
grep -qE 'zone_config_blob_is_current\(uint32_t version, size_t bytes\)' "$types"
grep -qE 'if \(!zone_config_blob_is_current\(version, read_size\)\)' "$store"

echo "Commissioning persistence schema invalidation checks passed."
