# Lune API v1 envelope contract

This is a contract document only; V6 and Touch retain separate runtime and dashboard
implementations.

Every resource and command response uses this envelope:

```json
{
  "ok": true,
  "api_version": "lune.api/v1",
  "device": {
    "id": "stable-device-id",
    "boot_id": "per-boot-random-id",
    "firmware_version": "firmware-version"
  },
  "timestamp": { "utc_ms": 1735689600000, "valid": true },
  "data_revision": 42,
  "freshness": { "state": "fresh", "age_ms": 0, "quality": "healthy" },
  "data": {}
}
```

`api_version` is a compatibility contract, not a product name. A client must reject a
different major version, missing stable `device.id`, or a response that lacks the metadata
needed for its operation. `timestamp.utc_ms` is `null` and `valid` is false when a device
clock is unavailable; clients must not treat uptime as UTC. `data_revision` is monotonic for
one boot and is used for conditional writes and revision polling. Freshness is resource
specific; `unavailable` is an honest quality state.

Commands add `command_id`, `idempotency_key`, and `expected_revision`. A replayed key returns
the original accepted result without scheduling another physical action. A stale revision is a
structured `409 stale_revision` error containing `current_revision`.

V6's Touch-to-V6 command authentication adds a timestamp, nonce, and HMAC over the canonical
request. Browser writes use a distinct authenticated local session plus CSRF token; neither a
MAC-derived pairing fingerprint nor a read endpoint authorizes a write.

V6 heating-mode / heat-demand fields (`control.mode`, `heat_demand`, lease
`control_mode`, zone `group_primary` / `node_id`) are part of the product surface
documented in `lune-v6/docs/lv6_api_v1.md` and
`docs/lune_whole_house_flow_temperature.md`. This envelope contract does not
re-list those resource schemas.

