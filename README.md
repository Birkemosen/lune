# Birkemosen Product Workspace

This repository is a monorepo for the Lune hardware family. Each hardware product owns its
firmware, dashboard, tests, hardware files, and device-specific documentation in its own
folder.

## Layout

```text
devices/
  lune-v6/       Local 6-zone hydronic manifold controller
docs/            Product-level brand and architecture notes
shared/          Shared contracts and design notes, not shared runtime code
```

The Lune Touch / Lune Mini coordinator lives in the private repository
[`Birkemosen/lune-coordinator`](https://github.com/Birkemosen/lune-coordinator).

The root `Makefile` keeps the common commands available from the repository root and
delegates to the relevant hardware folder. By default, firmware commands target Lune V6:

Create the repository tool environment from the pinned dependencies before
building firmware:

```bash
python3.13 -m venv .venv313
./.venv313/bin/python -m pip install -r requirements.txt
```

```bash
make config
make dashboard-build
make build
make test
```

Run device-local commands directly when needed:

```bash
make -C devices/lune-v6 help
```

## Boundaries

Lune V6 remains a safe local manifold node. Lune Touch / Mini owns whole-house
coordination, forecast preload, learned house behavior, and command strategy in its
separate private repository. Shared dashboard patterns can be documented under
`shared/dashboard/`, but runtime implementations remain product-specific.
