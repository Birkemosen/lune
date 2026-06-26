# Lune Coordinator Workspace

This folder holds functionality that belongs in Lune Touch / Lune Mini rather than in
Lune V6's local manifold firmware.

## Current Extraction

The first extracted module is the wind-aware forecast preload producer:

- `lune-touch/components/hv6_forecast/` - legacy ESPHome component and pure forecast model
- `lune-touch/packages/forecast.yaml` - legacy package wiring kept as reference
- `lune-touch/tests/forecast/` - host tests for the pure preload model
- `lune-touch/docs/forecast_preload.md` - coordinator-oriented design note

Lune V6 no longer builds or starts the local `hv6_forecast` HTTPS task. It keeps the local
setpoint-offset command path and firmware clamps, because coordinator commands must still
be validated and bounded by the manifold node.

## Ownership Boundary

Coordinator-owned:

- Weather fetch and caching
- Wind / solar / thermal-lead model
- House-wide preload decisions across one or more V6 nodes
- Adaptive whole-house learning and zone prioritization
- Command ledger: source, reason, requested value, accepted value, expiry, clamp result

Lune V6-owned:

- Motor movement and endstop safety
- Local temperature source freshness
- Conservative zone control without coordinator
- Minimum flow protection
- Command validation, clamp, expiry, and reporting
- Snapshot / diagnostics API for local state
