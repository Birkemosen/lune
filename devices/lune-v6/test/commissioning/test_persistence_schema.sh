#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
types="$repo_root/components/hv6_config_store/hv6_types.h"
store="$repo_root/components/hv6_config_store/hv6_config_store.cpp"

# Layout changes must reject old blobs instead of assigning an invented physical
# manifold identity or pump value to an existing installation.
rg -q 'ZONE_CONFIG_VERSION = 4' "$types"
rg -q 'SYSTEM_CONFIG_VERSION = 3' "$types"
rg -q 'zone_config_blob_is_current\(uint32_t version, size_t bytes\)' "$types"
rg -q 'if \(!zone_config_blob_is_current\(version, read_size\)\)' "$store"

echo "Commissioning persistence schema invalidation checks passed."
