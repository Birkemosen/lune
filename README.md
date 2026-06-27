# Guldborg & Birkemose Product Workspace

This repository is a monorepo for the Lune hardware family. Each hardware product owns its
firmware, dashboard, tests, hardware files, and device-specific documentation in its own
folder.

## Layout

```text
devices/
  lune-v6/       Local 6-zone hydronic manifold controller
  lune-touch/    House coordinator workspace for Lune Touch / Lune Mini
docs/            Product-level brand and architecture notes
shared/          Shared contracts and design notes, not shared runtime code
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
make -C devices/lune-v6 help
make -C devices/lune-touch help
```

## Boundaries

Lune V6 must remain a safe local manifold node. Lune Touch / Mini owns whole-house
coordination, forecast preload, learned house behavior, and command strategy. Shared
dashboard patterns can be documented under `shared/dashboard/`, but each hardware device
keeps its own dashboard implementation until a stable shared package is deliberately
introduced.
