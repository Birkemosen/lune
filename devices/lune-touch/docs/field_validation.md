# Lune Touch Field Validation

This checklist captures the remaining work that cannot be honestly completed
without real hardware, network conditions, or a paired Lune V6. It is the bridge
from implemented plan to field debugging.

## Repository Gate

Run these from the repository root before flashing a candidate build:

```bash
make test-lune-touch
make build-lune-touch
make -C devices/lune-touch build-mini
```

The Touch build must pass the OTA slot-size check. Do not increase LVGL buffers,
dashboard bundle size, or HTTPS memory use after this point without re-running
the build and a display/WiFi soak.

## Flash And Boot

1. Flash `devices/lune-touch/configurations/lune-touch-7.yaml`.
2. Confirm the local display reaches the operating console and does not drift,
   smear, or redraw in a loop.
3. Confirm `/`, `/dashboard`, `/dashboard.js`, and `/api/lune-touch/v1/diagnostics`
   are reachable from a browser on the local LAN.
4. Confirm `GET /api/lune-touch/v1/diagnostics` reports `ota.slot_size` and does
   not show `pending_verify` unexpectedly after a normal boot.

## Commissioning Flow

1. Open the web dashboard and check the Diagnostics view.
2. Follow `diagnostics.commissioning.next_action` rather than guessing the next
   step.
3. Add or scan a V6 candidate with hostname and optional fallback IP.
4. Confirm the candidate exposes a stable `pairing_fingerprint`.
5. Promote the node to `trusted` using the exact displayed confirmation token.
6. Map at least one room to a V6 zone.
7. Wait for fresh zone telemetry.
8. Confirm `ready_for_commands` becomes true before sending any command.

Expected blockers:

- `add_node` when no node is configured.
- `fix_node_poll` when the V6 cannot be reached.
- `verify_node_identity` when a node lacks a stored fingerprint.
- `trust_node` when a node is only paired.
- `map_zones` when no room is bound.
- `wait_for_fresh_zone_poll` when telemetry is stale.
- `set_forecast_location` when forecast location is missing.
- `ready` when commands and forecast are ready.

## Command Safety Flow

1. Send a small dashboard offset to a fresh, trusted mapped room.
2. Confirm `GET /commands` records source, reason, requested offset, accepted
   offset, expiry, result, and clamp state.
3. Disconnect or block the V6 and confirm a new command is recorded as
   `blocked_unreachable` or `blocked_stale` rather than sent.
4. Demote a node to `paired` and confirm commands are `blocked_untrusted`.
5. Confirm V6 still clamps any accepted command locally.

## Forecast Flow

1. Save a non-zero forecast location through Settings or `POST /forecast/settings`.
2. Confirm `GET /forecast` changes to a queued/pending state and old cache is not
   presented as current for the new location.
3. Trigger `POST /forecast/fetch`.
4. Confirm `GET /forecast` exposes hourly weather, preload decisions, dispatch
   counts, and any fetch error.
5. Confirm stale, unreachable, and untrusted V6 nodes are skipped before send and
   recorded in the command ledger.

## UI Soak

Keep WiFi, dashboard polling, Touch display, and forecast fetch enabled together.
During the soak:

- Header and content must remain fixed on the display.
- The web dashboard must remain reachable.
- Diagnostics must keep updating without API crashes.
- Free heap and PSRAM must not trend downward after repeated dashboard refreshes.
- Forecast fetch failures must show as status/errors, not reboot loops.

## Production Decisions After Field Validation

Do not finalize these until the checklist above has been run on real hardware:

- stronger Touch-to-V6 authentication beyond identity fingerprint plus trust
  confirmation
- production display stack, enclosure, power, and service connector
- whether any richer UI runtime is worth the memory and OTA budget
- long-term weather/history storage beyond the current compact cache and learned
  coefficients
