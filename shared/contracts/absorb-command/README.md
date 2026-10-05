# Absorb-window command contract

`POST /api/v1/absorb-window` on Lune V6.

Requires `X-Lune-Authority-Key`, `auth_timestamp_s`, and single-use `auth_nonce`
(same as setpoint-command). TTL is clamped to 60–7200 s (`clamp_applied` in the
response and ledger when the accepted TTL differs).

Optional `action`: `arm` (default) or `disarm`. Disarm is idempotent and ends
forced absorption immediately so local auto-detection resumes.

Optional `reason` is ledger/display only (`thermal_buffer`, `energy_cost`).
Unknown values are stored as `other` — never rejected. V6 never changes control
behaviour from `reason`.

## Fixtures

| File | Phase |
|------|-------|
| `request.json` | Arm envelope (Touch → V6) |
| `request-disarm.json` | Explicit disarm |
| `response-armed.json` | Arm accepted |
| `response-armed-clamped.json` | Arm with TTL above V6 ceiling |
| `response-disarmed.json` | Disarm accepted |
| `response-501.json` | Historical P3 stub (no longer returned) |

Mirror this directory in `lune-coordinator` when wiring B7 / Odin soft_stop.
Keep JSON keys identical across repos.
