#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
compatible="$root/fixtures/lune_api_v1_compatible.json"
incompatible="$root/fixtures/lune_api_v2_incompatible.json"

rg -q '"api_version": "lune.api/v1"' "$compatible"
rg -q '"id": "v6-ground"' "$compatible"
rg -q '"boot_id":' "$compatible"
rg -q '"firmware_version":' "$compatible"
rg -q '"data_revision":' "$compatible"
rg -q '"freshness":' "$compatible"
rg -q '"api_version": "lune.api/v2"' "$incompatible"
! rg -q '"api_version": "lune.api/v1"' "$incompatible"
echo "Lune API compatible/incompatible schema fixtures passed."
