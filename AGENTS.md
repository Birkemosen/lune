# AGENTS.md

Guidance for agents working in this repository.

## Project Shape

This is a Birkemosen monorepo. Each hardware product owns its code in a
dedicated subfolder:

```text
devices/
  lune-v6/       ESPHome firmware, local dashboard, hardware files, V6 tests/docs
  lune-touch/    Coordinator workspace for Lune Touch / Lune Mini
docs/            Product-level brand and cross-device architecture notes
shared/          Shared contracts/design notes; no shared runtime dashboard code yet
```

Keep hardware code separate unless a deliberate shared package is introduced. In
particular, Lune V6 must remain a safe local manifold node and must not depend on Lune
Touch / Mini for baseline heating safety.

## Common Commands

Run these from the repository root:

```bash
make config
make dashboard-build
make build
make deploy
make logs
make test
make test-lune-v6
make test-lune-touch
make test-forecast
```

Device-local commands also work:

```bash
make -C devices/lune-v6 config
make -C devices/lune-v6 dashboard-build
make -C devices/lune-v6 test
make -C devices/lune-touch test
```

The Makefiles resolve `esphome`, `platformio`, and `python3` from the repo-root
`.venv313/` -> `.venv/` -> PATH. The active Lune V6 ESPHome entrypoint is:

```text
devices/lune-v6/configurations/heatvalve-6-ble.yaml
```

`secrets.yaml` stays at the repository root and remains gitignored.

## Lune V6

Lune V6 is the local 6-zone hydronic manifold controller. Its code lives under
`devices/lune-v6/`:

```text
heatvalve-6.yaml
configurations/
packages/
components/
web/
test/
hardware/
docs/
```

Dashboard source is `devices/lune-v6/web/dashboard-src/` and the committed bundle is
`devices/lune-v6/web/dashboard.js`. The dashboard must use `/api/hv6/v1`, not ESPHome
entity REST routes.

Important local ownership:

- Motor movement and endstop safety
- Local temperature source freshness
- Conservative zone control without coordinator
- Minimum flow protection
- Command validation, clamp, expiry, and reporting
- Snapshot / diagnostics API for local state

When changing persisted config structs, increment the relevant version in
`devices/lune-v6/components/hv6_config_store/hv6_types.h`.

## Lune Touch / Mini

Coordinator-owned code lives under `devices/lune-touch/`. The first extracted module is
the wind-aware forecast preload model:

```text
devices/lune-touch/components/hv6_forecast/
devices/lune-touch/tests/forecast/
devices/lune-touch/docs/forecast_preload.md
```

Coordinator ownership includes forecast fetch/cache, wind/solar/thermal-lead decisions,
whole-house learning, zone prioritization, and command ledgers. Lune V6 still validates
and clamps every command locally.

## Dashboard Sharing

`shared/dashboard/` is for contracts and design notes only. Keep Lune V6 and future Lune
Touch dashboard implementations separate until shared runtime components are deliberately
introduced.
