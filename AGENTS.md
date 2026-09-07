# AGENTS.md

Guidance for agents working in this repository.

## Project Shape

This is a Birkemosen monorepo. Each hardware product owns its code in a
dedicated subfolder:

```text
devices/
  lune-v6/       ESPHome firmware, local dashboard, hardware files, V6 tests/docs
docs/            Product-level brand and cross-device architecture notes
shared/          Shared contracts/design notes; no shared runtime dashboard code yet
```

Lune Touch / Lune Mini coordinator code lives in the private repository
`Birkemosen/lune-coordinator`.

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
make test-v6
make deploy-v6 HOST=192.168.x.x
make release
make release VERSION=v1.1.0
make release-firmware VERSION=v1.1.0
```

`make release-firmware` builds the publishable bundle (renamed `.factory.bin` /
`.ota.bin` plus `manifest-lune-v6.json` in the gitignored `lune-v6/dist/`) from
`lune-v6/configurations/lune-v6-release.yaml`, which carries no WiFi credentials.
`.github/workflows/build-release-firmware.yml` runs the same target on release
creation.

Device-local commands also work:

```bash
make -C lune-v6 config
make -C lune-v6 dashboard-build
make -C lune-v6 test
```

The Makefiles resolve `esphome`, `platformio`, and `python3` from the repo-root
`.venv313/` -> `.venv/` -> PATH. The Lune V6 firmware entrypoint is:

```text
lune-v6/configurations/lune-v6.yaml
```

The hostname is `lune-v6-<mac>`. Hardware revision 3.2 is a board package
(`packages/board/lune-v6-rev32.yaml`), not part of the device name.

`secrets.yaml` stays at the repository root and remains gitignored.

## Lune V6

Lune V6 is the local 6-zone hydronic manifold controller. Its code lives under
`lune-v6/`:

```text
lune.yaml
configurations/
packages/
components/
web/
test/
hardware/
docs/
```

Dashboard source is `lune-v6/web/dashboard-src/` and the committed bundle is
`lune-v6/web/dashboard.js`. The dashboard must use `/api/hv6/v1`, not ESPHome
entity REST routes.

Important local ownership:

- Motor movement and endstop safety
- Local temperature source freshness
- Conservative zone control without coordinator
- Minimum flow protection
- Command validation, clamp, expiry, and reporting
- Snapshot / diagnostics API for local state

When changing persisted config structs, increment the relevant version in
`lune-v6/components/lv6_config_store/lv6_types.h`.

## Lune Touch / Mini

Coordinator-owned code lives in the private `Birkemosen/lune-coordinator` repository.
It owns forecast fetch/cache, wind/solar/thermal-lead decisions, whole-house learning,
zone prioritization, and command ledgers.

Coordinator ownership includes forecast fetch/cache, wind/solar/thermal-lead decisions,
whole-house learning, zone prioritization, and command ledgers. Lune V6 still validates
and clamps every command locally.

## Dashboard Sharing

`shared/dashboard/` is for contracts and design notes only. Keep Lune V6 and future Lune
Touch dashboard implementations separate until shared runtime components are deliberately
introduced.
