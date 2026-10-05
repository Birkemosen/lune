# Lune Stable Domain Identity Contract

## Scope

This contract defines identifiers used by Lune Touch, Lune V6, persisted state,
commands, authority leases, APIs, events, and history. It replaces any use of a mutable
array position, dashboard row, host name, or uptime timestamp as authoritative identity.
Display names and array indexes remain useful implementation details but are never a
record's identity.

Identifiers are lower-case ASCII and use `a-z`, `0-9`, `_`, `-`, and `:` only. They are
immutable after creation. A user may rename a room or node display name without changing
its ID. APIs reject an empty, duplicate, or malformed ID rather than silently assigning a
different target.

## Required IDs

| Identifier | Owner and format | Lifetime and purpose |
| --- | --- | --- |
| `installation_id` | Touch commissioning creates an opaque UUID, for example `01j5n8r5fppv6x7bfzp53h2w6v`. | Persistent for the physical installation. It scopes every authority lease, command, and exported record. Restoring a backup into another installation requires an explicit re-commissioning migration. |
| `node_id` | Commissioning assigns an opaque, immutable ID such as `v6-ground-a4d9`; the stored V6 pairing fingerprint verifies the physical board. | Persistent for a controller. Hostname, IP, firmware, friendly name, and array position may change; node ID does not. A replacement board receives a new node ID. |
| `room_id` | Touch creates an opaque logical-room ID, for example `room-living-7e2c`. | Persistent for one logical room and all of its comfort, schedule, learning, and history. It is not a V6 zone name and must not be regenerated when loops are remapped. |
| `loop_id` | V6 provisioning assigns one immutable ID per physical manifold loop, for example `loop-v6-ground-a4d9-03`. | Persistent for the physical actuator/pipe loop. It is independent of its current `zone_index`/hardware slot and may belong to one logical room. |
| `command_id` | The command origin creates an opaque UUID/ULID, for example `cmd-01j5n9dbk61mxswgpy0f4qgqje`. | Persistent and idempotent command identity. Retries reuse it; a replacement user action creates a new one. It is not derived from milliseconds, source text, or an array index. |
| `boot_id` | Each process creates a cryptographically random opaque ID at boot, for example `boot-01j5n9h77r4fw2jn1fe0jc6j8k`. | Runtime-only and never restored. It distinguishes leases, observations, and event sequences from an earlier boot. |

The terms `node_id`, `room_id`, and `loop_id` identify different things. In particular,
a room name is neither a node name nor a loop name, and one `room_id` may bind to one or
more `loop_id` values, including loops on different V6 nodes where the hydraulic design
permits it.

## Canonical Records

### Logical room

```json
{
  "installation_id": "01j5n8r5fppv6x7bfzp53h2w6v",
  "room_id": "room-living-7e2c",
  "name": "Living room",
  "loop_ids": [
    "loop-v6-ground-a4d9-03",
    "loop-v6-ground-a4d9-04"
  ],
  "area_m2": 48.0
}
```

The two loops contribute one room measurement and one room area to house aggregation.
Their individual actuator state remains available for diagnostics and control. Removing
or reordering an array element cannot change this room's identity.

### Command and command result

```json
{
  "installation_id": "01j5n8r5fppv6x7bfzp53h2w6v",
  "command_id": "cmd-01j5n9dbk61mxswgpy0f4qgqje",
  "issuer_node_id": "touch-main-91aa",
  "issuer_boot_id": "boot-01j5n9h77r4fw2jn1fe0jc6j8k",
  "room_id": "room-living-7e2c",
  "loop_ids": ["loop-v6-ground-a4d9-03", "loop-v6-ground-a4d9-04"],
  "kind": "setpoint_offset",
  "requested_offset_c": 0.4,
  "created_at_unix_ms": 1764242100000,
  "expires_at_unix_ms": 1764245700000,
  "result": "accepted"
}
```

An ID-based record retains the original room and loops even if a future room mapping
changes. The target must not be resolved by matching a new array position at read time.
Expiry uses a wall-clock epoch with explicit time-quality handling; it is never computed
by comparing an uptime from a previous boot. The reboot-safe expiry behavior is specified
and implemented in P1.4.

### Authority lease and event

```json
{
  "installation_id": "01j5n8r5fppv6x7bfzp53h2w6v",
  "writer_node_id": "touch-main-91aa",
  "writer_boot_id": "boot-01j5n9h77r4fw2jn1fe0jc6j8k",
  "arbiter_node_id": "v6-ground-a4d9",
  "lease_generation": 42,
  "state": "NORMAL_TOUCH"
}
```

Lease generation is a monotonically increasing fenced value held by V6-A. A boot ID
makes a retained message from an earlier process unambiguously stale without treating a
mutable index as the writer identity.

## API Rules

- Public resources use `installation_id`, `node_id`, `room_id`, `loop_id`, and
  `command_id` fields and identify resources by those values. A numeric `zone_index` or
  `node_index` may be emitted only as non-authoritative, current hardware-location
  metadata.
- A V6 endpoint may retain `/zones/{zone}` for local compatibility, but its responses
  and commands must expose the corresponding `loop_id`. Touch resolves a loop ID to the
  current local index immediately before it sends a V6 command.
- `GET /commands`, history, events, and diagnostics preserve the command's stable target
  IDs even after a room, node, or loop is removed. A UI may add the current display name
  as presentation data only.
- Requests containing both a stable ID and a current index must reject any mismatch.
  Stable IDs win; the index is never used as a fallback target.
- Internally, indexes may be used as bounded lookup caches. Any cache invalidation,
  node deletion, or sorted display operation must be able to rebuild from stable IDs.

## Persistence and Migration

The current Touch persisted state stores `PairedNode.node_id` and `ZoneBinding.room_id`,
but `ZoneBinding` and `CommandRecord` refer to their physical target through
`node_index`/`zone_index`; V6 `ZoneConfig` is likewise a six-element positional array.
Those records are legacy input, not a safe target representation.

The implementation migration must do all of the following in one versioned change:

1. Bump each changed persisted-structure version: Touch's state and ledger versions and
   V6's zone/config version as applicable. Add an explicit migration reader for the
   immediately preceding version; never reinterpret raw bytes under a new layout.
2. Create immutable loop IDs once for each existing V6 slot, persist them with the node's
   identity, and build a migration map from `(legacy node_id, legacy zone_index)` to
   `loop_id`. The generated ID is saved before subsequent use; a future reorder or node
   deletion cannot regenerate it differently.
3. Convert a legacy room binding only when its legacy node index resolves to exactly one
   persisted `node_id` and its zone index resolves to exactly one migrated `loop_id`.
   Preserve its `room_id` and all room-owned settings. If either side is absent,
   duplicated, malformed, or out of range, disable and archive the binding with a
   migration diagnostic; never retarget it to the item now occupying an index.
4. Convert a legacy command only when the same unambiguous node/loop map exists. Retain
   its original `request_id` as a `legacy_command_id` for audit, create a new stable
   `command_id`, and store stable target IDs. Any command whose expiry depends on an old
   uptime, or whose target cannot be resolved, imports as terminal
   `expired_on_migration`/`unresolved_target`; it is never re-applied.
5. Authority leases and other boot-bound runtime state are safely invalidated at boot.
   No active lease, pending temporary command, or expiry deadline is restored merely
   because an array index or an uptime value happens to match.
6. Add migration tests covering removal of a middle node, reordered in-memory arrays,
   missing loop map, duplicate legacy node ID, command replay after reboot, and a room
   that controls multiple loops. Each failure must show safe invalidation rather than a
   changed target.

Historical exports must state their schema version. Imports either complete the explicit
migration or fail closed with actionable diagnostics; they must never perform a best-effort
index substitution.

## Current Compatibility Boundary

Until the migration tasks are implemented, the existing index-bearing Touch and V6 APIs
are compatibility-only. New authority, multi-loop room, command-ledger, and persistence
work must use this contract and must not add new persisted or externally authoritative
index-based records.
