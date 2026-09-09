# CLAUDE.md

This repository now uses the same hardware-per-folder structure described in
[AGENTS.md](AGENTS.md). Use that file as the authoritative agent guide.

Quick map:

```text
lune-v6/       Lune V6 ESPHome firmware and local dashboard
Lune Touch / Mini       Private repository: Birkemosen/lune-coordinator
docs/                  Cross-device notes; brand architecture → lune-coordinator
shared/                Shared contracts/design notes only
```

Common root commands:

```bash
make config
make dashboard-build
make build
make test
make test-lune-v6
```
