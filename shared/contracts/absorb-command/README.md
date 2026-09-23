# Absorb-window command contract

`POST /api/v1/absorb-window` on Lune V6.

Requires `X-Lune-Authority-Key`, `auth_timestamp_s`, and single-use `auth_nonce`
(same as setpoint-command). TTL is clamped to 60–7200 s.

## Fixtures

| File | Phase |
|------|-------|
| `request.json` | Request envelope (Touch → V6) |
| `response-501.json` | **Current (P3)** — auth/TTL/ledger parsed, no runtime effect |
| `response-armed.json` | Future (P5) — arm accepted, absorb window active |

Mirror this directory in `lune-coordinator` when wiring B7. Keep JSON keys
identical across repos.
