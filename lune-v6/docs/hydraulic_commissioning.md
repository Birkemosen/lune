# Hydraulic commissioning

Lune V6 controls the six loops on one UFH secondary manifold. Install one V6
configuration per manifold; record `manifold_id` and ports 1–6 on each node.
Two V6 nodes therefore document both manifolds and all twelve physical loops.

## Four-way-buffer boundary

The installation is treated as a four-way-buffer topology. Primary heat-source flow
(including its 14 L/min requirement) is a primary-side hydraulic concern. V6
valves are on the UFH secondary side and their opening percentage cannot
guarantee primary flow. The normal policy consequently leaves satisfied rooms
closed. The optional secondary total-opening floor is a temporary commissioning
tool: it only distributes opening among loops already accepting heat and is off
by default.

## Per-loop record

For every port, use `POST /api/lv6/v1/settings/{text|number}` with its stable
zone number to save `zone_manifold_id`, `zone_manifold_port`, `zone_room_id`,
`zone_loop_pipe_length_m`, `zone_design_flow_l_h`, `zone_measured_flow_l_h`,
`zone_actuator_calibration_pct`, and `zone_expected_thermal_delay_min`.
`area_m2` and `floor_type` are already part of the zone record. Unknown numeric
values are stored as `-1`; port `0` means not commissioned. The resource
`GET /api/lv6/v1/zones/{zone}` returns the complete commissioning record.

Room identity is a stable room ID, never an array index. These records are
passive commissioning metadata and do not alter physical temperature,
heat-source demand, or valve safety; those belong to Lune Touch.

## ALPHA2 GO / pump record

The Settings page records pump model, selected control mode, setpoint, estimated
secondary flow and pressure, pump energy, and commissioning date. This is a
record only. Lune V6 does not scan, pair with, or control ALPHA2 GO over BLE.
Any future continuous flow telemetry must use a documented, measurable
interface and must be clearly labelled with its source and freshness.

## Diagnostics

`GET /api/lv6/v1/diagnostics` publishes six hydraulic alarm records. Every
record includes `freshness`, `evidence`, and `suggested_action`. A V6 currently
observes its snapshot but lacks source timestamps, pump-run telemetry, other
manifold telemetry, and trustworthy primary-side flow. Those checks are
therefore reported as `unavailable`, not as inferred values. The local
supply/return delta and a conservative observed-secondary-heat/no-accepting-
room warning are evaluated when the required local sensors are finite.
