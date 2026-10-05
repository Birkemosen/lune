# Lune V6

Local 6-zone hydronic manifold controller (ESP32-S3 / ESPHome). Safe without a
coordinator: motors, endstops, temperature freshness, and command clamps run on
the device.

> **Status (October 2026): pre-release, in field validation.**
>
> | Area | State |
> |---|---|
> | Firmware | `v1.0.0` development builds; no public release yet |
> | Hardware | Rev 3.3 is the only supported board |
> | Valve control | Endstop detection, working-range learning and motor fault handling in place |
> | Dashboard | Local web UI (EN/DA) with zones, settings, Motor Lab, firmware update and backup |
> | Integration | `/api/v1` with Touch authority lease, Asgard heat-pump coordination and external room temperatures |
> | Implementation plan | Phases 0–8 complete; phase 9 (staged field rollout and outcome measurement) in progress |
>
> Expect breaking changes to the API and persisted settings until `v1.0.0` is tagged.

![Lune V6 dashboard — light and dark](docs/shots/lune-v6-dashboard-split.png)

## Layout

```text
lune-v6/                 Firmware, local dashboard, hardware, tests
  configurations/        Device YAML entrypoints
  packages/              Board / hardware / network / zones
  components/            Custom C++ (lv6_*)
  web/                   Design System 2 UI (see below)
  docs/                  Manual, API, architecture
shared/contracts/        Cross-product contracts (e.g. room physics)
docs/                    Cross-device notes
```

Related repositories:

- [`Birkemosen/lune-coordinator`](https://github.com/Birkemosen/lune-coordinator) —
  Lune Touch / Mini, the whole-house coordinator.
- [`Birkemosen/lune-design-system`](https://github.com/Birkemosen/lune-design-system) —
  shared UI tokens and CSS. The dashboard build expects it as a sibling checkout at
  `../lune-design-system`.

## Dashboard (Design System 2)

Static HTML/CSS with radio navigation; a thin binder paints live `/api/v1` data.
No ESPHome entity REST from the UI.

```text
lune-v6/web/
  build_ui.py       i18n shell → ui/{en,da}/
  i18n/             en / da catalogues
  binder-src/       esbuild → ui/binder.js (+ dashboard.js alias)
  ui/               Built CSS, HTML, binder (embedded in firmware)
  preview.html      Local mock preview
```

```bash
make design-tokens     # → lune-v6/web/ui/lune-ui.css
make dashboard-build   # HTML + binder + preview.html
```

Preview without a device:

```bash
python3 -m http.server 8765 -d lune-v6/web
# → http://127.0.0.1:8765/preview.html
```

Installer help: [`lune-v6/docs/Manual.md`](lune-v6/docs/Manual.md) (linked from in-UI `?`).

## Hardware (rev 3.3)

Current board package: `lune-v6/packages/board/lune-v6-rev33.yaml` (`rev33_gpio`).
Two-layer USB-C ESP32-S3-WROOM-1-N8R8 controller, six 3.3 V valve channels
(3× DRV8411 + hardware one-hot decoder), shared high-side sense for ADC /
ripple / overcurrent. Hostname: `lune-v6-<mac>` (revision is not part of the
name).

See [`lune-v6/README.md`](lune-v6/README.md) and
[`lune-v6/hardware/lune-v6-rev3.3/`](lune-v6/hardware/lune-v6-rev3.3/) for the
revision table, ECO level, and firmware integration. The firmware is for Rev 3.3
only and refuses to drive motors on an older board — pin maps collide.

Validate the schematic:

```bash
python3 lune-v6/hardware/lune-v6-rev3.3/check_design.py
```

## Setup and commands

```bash
python3.13 -m venv .venv313
./.venv313/bin/python -m pip install -r requirements.txt
```

From the repository root (defaults to Lune V6):

```bash
make config
make dashboard-build
make build
make test
make deploy HOST=192.168.x.x
```

Device-local:

```bash
make -C lune-v6 help
make -C lune-v6 test
```

Release firmware (no WiFi secrets) → gitignored `lune-v6/dist/`:

```bash
make release-firmware VERSION=v1.1.0
```

`secrets.yaml` stays at the repo root and is gitignored.

## Boundaries

- V6 validates and clamps every command locally.
- Touch sends setpoints / weather preload — not zone choice for room temperatures.
- External hubs POST `/api/v1/room-temperatures` with `sensor_id`; V6 maps to zones.
- Shared physics contract: [`shared/contracts/lune_room_physics_contract_v1.md`](shared/contracts/lune_room_physics_contract_v1.md).

## License

| Part | License |
|---|---|
| Firmware, web UI, scripts and documentation — everything not listed below | [GPL-3.0-or-later](LICENSE) |
| Hardware design in [`lune-v6/hardware/`](lune-v6/hardware/) — EasyEDA project, schematics, design contract, layout and review documents | [CC BY-NC-SA 4.0](lune-v6/hardware/LICENSE) |

Third-party files keep their own licenses — notably the ESPHome agent skill in
[`.agents/skills/esphome/`](.agents/skills/esphome/) (MIT).

You may build, modify and share the firmware under the GPL; derived firmware must stay
open under the same terms. The firmware is built on ESPHome, whose runtime is GPLv3.

The hardware design is **non-commercial**. As the licensor I read that as follows:

- **Allowed:** private individuals may have boards made — by a PCB fab or assembly
  service ordering on their behalf — and use them in their own home. Fabs sell in
  minimum batches, so passing surplus boards from your own order to other private
  individuals is fine **at cost or for free**, as long as nobody makes money on it.
- **Not allowed without a commercial license:** selling boards, kits or installed systems
  for profit, offering them as part of a paid service or installation, or any other use
  aimed at earning money from the design.

Modified designs must be shared under the same license. If you want to use the design
commercially, ask through [GitHub](https://github.com/Birkemosen).

## Name

"Lune" and "Lune V6" identify this project. Forks are welcome under the licenses above,
but please give them a different name and do not present them, or products built on
them, as Lune or as endorsed by this project.

## Support the project

Lune is developed in spare time and paid for out of pocket. If it heats your floors and
you want to give something back, you can sponsor it through
[GitHub Sponsors](https://github.com/sponsors/Birkemosen).
