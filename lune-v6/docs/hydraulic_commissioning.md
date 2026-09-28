# Hydraulic commissioning

Lune V6 controls the six loops on one UFH secondary manifold. Install one V6
configuration per manifold. The zone index (1–6) is the manifold port; there is
no separate `manifold_id` / `room_id` on V6. Logical rooms spanning nodes are
owned by Lune Touch — see
[`docs/lune_whole_house_flow_temperature.md`](../../docs/lune_whole_house_flow_temperature.md).

## Four-way-buffer boundary

The installation is treated as a four-way-buffer topology. Primary heat-source flow
(including its 14 L/min requirement) is a primary-side hydraulic concern. V6
valves are on the UFH secondary side and their opening percentage cannot
guarantee primary flow. In **Normal** mode, satisfied rooms close at setpoint.
In **Heat pump** mode, satisfied rooms hold a high base opening so the source
can settle on a low constant feed. The optional secondary total-opening floor is
a temporary commissioning tool: it only distributes opening among loops already
accepting heat and is off by default.

## Per-loop record

Zone geometry that V6 still uses (`area_m2`, pipe type/spacing, floor cover,
`max_opening_pct`, sync groups) is edited via `POST /api/v1/settings/...` and
returned from `GET /api/v1/zones`. Room identity and weather exposure live on
Touch; V6 exposes `node_id`, `group_primary`, and `group_members` so Touch can
map rooms to groups.

## ALPHA2 GO / pump record

The Settings page records pump model, selected control mode, setpoint, estimated
secondary flow and pressure, pump energy, and commissioning date. This is a
record only. Lune V6 does not scan, pair with, or control ALPHA2 GO over BLE.
Any future continuous flow telemetry must use a documented, measurable
interface and must be clearly labelled with its source and freshness.

## Diagnostics

Use the diagnostics section and motor-lab (dev builds) when commissioning
actuators. Export a settings backup before any OTA that re-versions NVS
sections, then import after flash.
