# Birkemosen Product Workspace

This repository is a monorepo for the Lune hardware family. Each hardware product owns its
firmware, dashboard, tests, hardware files, and device-specific documentation in its own
folder.

## Layout

```text
lune-v6/         Local 6-zone hydronic manifold controller
  hardware/      KiCad schematics and design contracts, per revision
docs/            Product-level brand and architecture notes
shared/          Shared contracts and design notes, not shared runtime code
```

The Lune Touch / Lune Mini coordinator lives in the private repository
[`Birkemosen/lune-coordinator`](https://github.com/Birkemosen/lune-coordinator).

## Lune V6

The current board is **`lune-v6-rev3.2`**: a two-layer, 90 × 75 mm, USB-C powered
ESP32-S3-WROOM-1-N8R8 controller driving six 3.3 V valve channels from three `DRV8411`
dual H-bridges, with channel selection by a hardware one-hot `74HC4514` decoder.

All six channels share one high-side current sense — a 0.5 Ω shunt into an `INA180A1` at
×20 — which serves the ADC reading, a commutation-ripple tacho for position learning, and
a rail-overcurrent backstop. An independent hardware chain (fault latch plus a `74HC4060`
runtime cutoff) can shut the board down without firmware, and firmware cannot clear a
latched fault.

Rev3.2 status: schematic and design contract complete and checked; **PCB not yet routed**.

> The firmware still targets the rev3.1 `DRV8215` I2C backend. See
> [`lune-v6/README.md`](lune-v6/README.md) for the migration status and the known GPIO
> collision before flashing a rev3.2 board.

## Commands

Create the repository tool environment from the pinned dependencies before building
firmware:

```bash
python3.13 -m venv .venv313
./.venv313/bin/python -m pip install -r requirements.txt
```

The root `Makefile` keeps the common commands available from the repository root and
delegates to the relevant hardware folder. By default, firmware commands target Lune V6:

```bash
make config
make dashboard-build
make build
make test
```

Run device-local commands directly when needed:

```bash
make -C lune-v6 help
```

Validate the rev3.2 schematic against its design contract:

```bash
python3 lune-v6/hardware/lune-v6-rev3.2/check_design.py
```

## Boundaries

Lune V6 remains a safe local manifold node. Lune Touch / Mini owns whole-house
coordination, forecast preload, learned house behavior, and command strategy in its
separate private repository. Shared dashboard patterns can be documented under
`shared/dashboard/`, but runtime implementations remain product-specific.
