# Lune Heating Control Implementation Plan

This document is the executable implementation plan for the Lune heating stack:

- Two Lune V6 controllers, each controlling one six-loop underfloor-heating manifold
- Lune Touch as the normal whole-house coordinator and primary web interface
- Asgard as the Mitsubishi Ecodan interface and Auto Adaptive controller
- ODIN as the heat-pump timing, electricity-price, weather/solar, and DHW optimizer
- A four-way 100 L buffer separating the Ecodan primary circuit from the UFH circuit
- A Grundfos ALPHA2 GO as the central secondary circulation pump
- Shelly H&T Display BLE room sensors

This plan supersedes conflicting design statements in
[`docs/lune_touch_build_plan.md`](lune_touch_build_plan.md), especially:

- Priority-weighted physical house temperature
- One logical room being limited to one physical loop
- Ambiguous simultaneous V6 and Touch ownership of the Asgard temperature feed
- Persisting command identity and expiry with array indexes and uptime timestamps

## How To Use This Plan

- Work from top to bottom.
- Implement only tasks whose prerequisites are complete.
- Keep each checklist item small enough to review and verify independently.
- Do not mark a task complete until its tests and acceptance checks pass.
- Update this file in the same implementation change:
  - Change `- [ ]` to `- [x]` only after completion.
  - Add a short entry to **Progress Log** with date, task ID, files changed, and checks run.
  - If blocked, leave the checkbox open and record the blocker in **Blocked Items**.
- If a task reveals that the plan is wrong:
  - Do not silently diverge.
  - Update the relevant plan text and explain the decision in **Progress Log**.
- Run the narrowest relevant test after each task and `make test` at the end of each phase.
- Never read, print, create, or modify `secrets.yaml`.
- Preserve the safety boundary: Lune V6 must continue safe basic heating without Touch.
- When changing persisted structs, increment the applicable persistence version and add
  migration or safe invalidation tests.

## Checklist Legend

- `[ ]` Not complete
- `[x]` Implemented, tested, and acceptance criteria met

## Target Control Ownership

- **Lune V6 owns:**
  - BLE sensor freshness and local temperature selection
  - Valve movement, endstops, motor faults, and local clamps
  - Conservative local room control
  - Last-safe persistent fallback targets
  - Expiry and reporting of every external command
  - Safe operation when Touch is unavailable

- **Lune Touch owns:**
  - Logical rooms and room-to-loop mappings
  - Comfort targets, schedules, priorities, and temporary overrides
  - Room-level wind and solar distribution
  - Whole-house physical-temperature aggregation
  - Whole-house target aggregation
  - Normal Asgard publishing
  - Authority leases, command ledger, diagnostics, and primary web UX

- **Asgard owns:**
  - Ecodan interface
  - Virtual thermostat and Auto Adaptive behavior
  - Heat-pump telemetry exposed to the integration

- **ODIN owns:**
  - Heat-pump timing
  - Electricity-price optimization
  - Whole-house weather and solar optimization
  - Compressor-cycle optimization
  - DHW and legionella planning

- **Touch must not:**
  - Become a second heat-pump timing or price optimizer
  - Fabricate a colder room temperature to create demand
  - Control DHW
  - Depend on an undocumented ALPHA2 GO BLE protocol

## Global Acceptance Criteria

These are release gates, not ordered implementation tasks. Check them only when the
underlying numbered tasks are complete and the statement has been verified end to end.

- [ ] Only one device can publish the normal house signal to Asgard at a time.
- [ ] Touch publishes a real physical temperature, independent of comfort priority.
- [ ] A logical room can control one or more physical V6 loops.
- [ ] The 48 m² multi-loop room is counted once in the Touch house model.
- [ ] Temporary Touch behavior expires locally on V6.
- [ ] Both V6 controllers continue safe basic heating when Touch is offline.
- [ ] V6 fallback cannot race or fight Touch for Asgard ownership.
- [ ] Commands and history use stable IDs rather than mutable array indexes.
- [ ] Persisted expiry does not rely on uptime from an earlier boot.
- [ ] Forecast decisions use actual forecast timestamps.
- [ ] DHW and defrost do not pollute room-heating learning or diagnostics.
- [ ] The web UX clearly shows data freshness, active authority, and degraded operation.
- [ ] All write APIs are authenticated before production deployment.
- [ ] Existing host tests and all new tests pass.

---

# Phase 0 — Baseline, Contracts, And Safety Invariants

## P0.1 Capture The Baseline

- [x] Run and record the current baseline checks.

Implementation:

- Run `git status --short` and do not overwrite unrelated user changes.
- Run:
  - `make test`
  - `make config-v6`
  - `make config-touch`
- If configuration checks require unavailable local secrets, record that clearly rather
  than inspecting or changing `secrets.yaml`.
- Add the results to **Progress Log**.

Acceptance:

- Current failures are recorded before implementation begins.
- No repository files are changed except this plan's progress entry.

## P0.2 Document The Authority State Machine

- [x] Add a repository design document defining normal, degraded, fallback, and recovery
  authority states.

Required states:

- `NORMAL_TOUCH`
- `TOUCH_DEGRADED`
- `V6_FALLBACK_PENDING`
- `V6_FALLBACK_ACTIVE`
- `TOUCH_RECOVERY_PENDING`
- `NO_PUBLISHER`
- `AUTHORITY_CONFLICT`

Required rules:

- Touch is the only normal Asgard writer.
- V6-A is the fixed initial fallback leader.
- V6-B never writes to Asgard in the first implementation.
- A single lost request must not trigger fallback.
- Touch recovery must be stable before handover.
- Every state change must be observable and logged.

Acceptance:

- The document includes transition triggers, timeouts, writer permissions, and failure
  behavior.
- It explicitly prevents two active writers.
- It describes behavior when V6-B, Asgard, or the network is unavailable.

## P0.3 Define Stable Domain Identities

- [x] Document stable IDs for installations, nodes, logical rooms, physical loops,
  commands, and boots.

Required identifiers:

- `installation_id`
- `node_id`
- `room_id`
- `loop_id`
- `command_id`
- `boot_id`

Rules:

- Array indexes may be used internally for lookup performance but never as persisted or
  externally authoritative identity.
- Removing a node must not change another node's identity.
- A logical room may contain multiple loop IDs.

Acceptance:

- API examples and persisted records use stable IDs.
- The migration strategy for existing index-based records is documented.

## P0.4 Define The House-Signal Contract

- [x] Document exactly what Touch sends to Asgard.

Required signals:

- Physical house temperature:
  - Area-weighted real temperature
  - One measurement per logical room
  - Independent of priority and demand
- House comfort target:
  - Area-weighted effective room target
  - Separate from physical temperature
- Quality:
  - Contributing room count
  - Contributing area
  - Missing area
  - Oldest contributing sensor age
  - Degraded/healthy status

Rules:

- Never encode demand by falsifying temperature.
- Priority affects distribution only.
- Excluded rooms contribute to neither numerator nor denominator.
- Insufficient coverage must be explicit.

Acceptance:

- Examples cover one sensor serving two loops and one excluded room.
- Examples demonstrate that changing priority does not change physical temperature.

---

# Phase 1 — Correct Immediate Data And API Defects

## P1.1 Correct The Asgard Temperature Endpoint

- [x] Replace the deprecated Asgard object-ID URL in both Touch and V6 fallback paths.

Current upstream endpoint:

- Read:
  - `GET /number/Virtual%20Thermostat%20Input%20z1`
- Write:
  - `POST /number/Virtual%20Thermostat%20Input%20z1/set?value=<temperature>`

Likely files:

- `devices/lune-v6/components/hv6_asgard_bridge/`
- `devices/lune-touch/components/lune_touch_coordinator/`
- Touch and V6 dashboard configuration views
- `devices/lune-v6/docs/ecodan_integration.md`

Implementation requirements:

- URL-encode entity names correctly.
- Do not assume an ESPHome object ID.
- Preserve `Content-Length: 0` behavior required by the ESP-IDF HTTP server.
- Use one shared URL-encoding behavior per product, without introducing cross-product
  runtime coupling.
- Update field validation so encoded/display names are allowed.

Tests:

- Entity name containing spaces.
- Existing already-encoded input is not double encoded.
- Invalid host, invalid port, timeout, 404, and non-2xx response.
- Exact expected request path.

Acceptance:

- Both normal Touch and fallback V6 use the current Asgard path.
- The UI no longer defaults to `virtual_thermostat_input_z1`.
- Documentation matches actual behavior.

## P1.2 Add Asgard Write Readback

- [x] Confirm writes instead of treating HTTP acceptance as applied state.

Implementation requirements:

- After a successful write, read the Asgard number.
- Record:
  - Requested value
  - HTTP result
  - Confirmed value
  - Confirmation age
  - Mismatch/clamp status
- Use a bounded retry policy with backoff.
- Do not block the main control task for an unbounded duration.

Acceptance:

- Diagnostics distinguish `sent`, `confirmed`, `mismatch`, and `unreachable`.
- A single success does not erase useful cumulative failure history.

## P1.3 Fix Forecast Timestamp Alignment

- [x] Parse, store, and use Open-Meteo timestamps.

Likely files:

- `devices/lune-touch/components/lune_touch_coordinator/`
- Touch forecast persistence structs
- `devices/lune-touch/tests/forecast/`
- Touch forecast API and web view

Implementation requirements:

- Include the hourly `time` array in the JSON filter and parser.
- Store a timestamp with every forecast hour.
- Start the decision window at the first entry at or after current time.
- Persist fetch epoch, provider timezone, and hourly timestamps.
- Reject stale or unalignable cache data after reboot.
- Increment forecast persistence version.

Tests:

- Fetch at 00:05.
- Fetch at 12:30.
- Day rollover.
- DST forward and backward.
- Reboot with fresh cache.
- Reboot with expired cache.
- Missing or mismatched time array.

Acceptance:

- `peak_in_h=0` means the current or next forecast hour, not midnight.
- The API exposes each hour's timestamp.

## P1.4 Replace Persisted Uptime Expiry

- [x] Make command expiry reboot-safe.

Implementation requirements:

- Add `boot_id`.
- Use UTC epoch timestamps when system time is valid.
- Treat transient commands from a previous boot as expired by default.
- Preserve historical records without allowing them to become active.
- Increment ledger persistence version and add safe migration/invalidation.

Tests:

- Command active within one boot.
- Reboot before expiry.
- Reboot with invalid wall clock.
- Millisecond wraparound.
- Old ledger version.

Acceptance:

- No command from a previous boot can accidentally become active.

## P1.5 Replace Index-Based Command Identity

- [x] Store stable node, loop, and room IDs in command records.

Implementation requirements:

- Resolve current indexes only at execution time.
- Do not retarget history when a node is removed.
- Migrate or invalidate the existing ledger safely.

Tests:

- Remove the first of two nodes.
- Reorder nodes.
- Rebind a room.
- Remove a loop while a command exists.

Acceptance:

- Old records continue referring to their original stable target or are explicitly marked
  orphaned.

---

# Phase 2 — Logical Rooms And Correct House Aggregation

## P2.1 Introduce Logical Room To Multiple Loop Mapping

- [x] Change the Touch domain model from one room/one loop to one room/many loops.

Implementation requirements:

- A room has:
  - Stable room ID
  - Name
  - One primary room sensor
  - Total heated area
  - Comfort configuration
  - Aggregation inclusion and optional physical weight
  - One or more stable loop bindings
- A loop has:
  - Stable loop ID
  - V6 node ID
  - V6 physical zone number
  - Served area
  - Enabled/commissioned state
- Preserve a safe migration path for existing one-to-one bindings.
- Increment the Touch registry persistence version.

Tests:

- One room with one loop.
- One 48 m² room with two loops.
- Two loops on different V6 nodes.
- Remove one loop without deleting the room.
- Reject duplicate physical-loop assignment.

Acceptance:

- The 48 m² room appears once in house-level room lists.
- Commands for that room reach all bound loops.
- Partial failure is reported per loop.

## P2.2 Implement Physical House Temperature

- [x] Replace priority weighting with physical area weighting.

Formula:

- `sum(room_temperature * room_physical_weight) / sum(room_physical_weight)`

Implementation requirements:

- Use one temperature sample per logical room.
- Use total room area as the initial default weight.
- Ignore comfort priority in this calculation.
- Support `include_in_house_temperature=false`.
- Require fresh and finite room temperature.
- Report contributing and missing area.

Tests:

- Equal-area rooms.
- 20 m² room plus 48 m² room.
- Priority change leaves result unchanged.
- Multi-loop room counted once.
- Excluded room.
- Stale room.
- No valid rooms.

Acceptance:

- Existing priority-weighted tests are replaced with physical-weight tests.
- Strategy and heat-source APIs identify the result as physical.

## P2.3 Implement House Target Aggregation

- [x] Calculate a house target separately from physical temperature.

Implementation requirements:

- Use the same included rooms and physical weights as the temperature calculation.
- Use each room's current effective comfort target.
- Do not include temporary forecast offsets unless the architecture document explicitly
  classifies them as comfort intent.
- Expose target source and contributing area.
- Apply deadband and minimum update interval before Asgard synchronization.

Acceptance:

- Schedule changes can alter the house target without altering physical temperature.
- Temporary loop-distribution decisions cannot silently alter the ODIN learning signal.

## P2.4 Add Aggregation Quality Gates

- [x] Prevent low-coverage averages from appearing healthy.

Implementation requirements:

- Make minimum contributing-area coverage configurable.
- Initial recommended commissioning value: 75%.
- Require both manifolds when both are expected, unless explicitly degraded.
- Hold the last confirmed value only for a bounded grace period.
- After the grace period, enter degraded/fallback behavior.

Tests:

- One stale room.
- Entire V6 stale.
- Coverage just below and above threshold.
- Recovery without a step change.

Acceptance:

- The UI and API never label a local-only half-house average as healthy whole-house data.

---

# Phase 3 — Explicit Authority And V6 Fallback

## P3.1 Add Touch Authority Lease To The V6 API

- [x] Add an authenticated, expiring coordinator authority lease.

Lease fields:

- Installation ID
- Coordinator ID
- Lease ID
- Issued time
- Expiry time
- Sequence/revision
- Authentication/replay-protection data

Implementation requirements:

- V6 persists coordinator identity but not an active lease across reboot.
- V6 exposes lease state in diagnostics.
- Invalid, expired, replayed, or conflicting leases are rejected.
- Do not enable production authority without authentication.

Acceptance:

- Touch can acquire and renew a lease.
- V6 rejects stale and conflicting leases.
- V6 reboot starts without assuming Touch is active.

## P3.2 Gate V6 Asgard Publishing With The Lease

- [x] Ensure V6 cannot publish while a valid Touch lease exists.

Implementation requirements:

- V6-A is the configured fallback leader.
- V6-B has no Asgard write permission.
- Lease state is checked immediately before every Asgard write.
- Authority state and last transition reason are exposed.

Tests:

- Valid Touch lease.
- Lease expires.
- Lease renews near expiry.
- V6-A reboot.
- V6-B attempts to publish.

Acceptance:

- No tested path allows simultaneous Touch and V6 publishing.

## P3.3 Implement Fallback Entry

- [x] Implement conservative V6-A fallback after sustained Touch loss.

Initial timing values to validate:

- Touch heartbeat: 30 seconds
- Acknowledged lease: 90 seconds
- V6-A fallback guard: 30 seconds after expiry (120 seconds total Touch-loss fence)
- Renewal cadence: 30 seconds; the 90-second lease spans three renewal opportunities.

Timing decision: the authority state-machine contract's acknowledged 90-second lease plus a
30-second V6-A-only guard replaces a separate failed-check counter. This retains the planned
120-second fence, prevents short-reboot oscillation, and gives recovery a deterministic state.

Fallback behavior:

- Expire Touch temporary commands.
- Continue last-safe local base targets.
- Poll V6-B's compact peer snapshot.
- Calculate real area-weighted temperature from fresh loop/room data.
- Mark local-only operation degraded if V6-B is stale.
- Publish through the corrected Asgard endpoint.

Acceptance:

- A short Touch reboot does not cause writer oscillation.
- Sustained Touch loss produces a clear, logged fallback transition.
- Local heating remains functional throughout.

## P3.4 Implement Touch Recovery Handover

- [x] Return authority to Touch without two writers or a temperature step.

Implementation requirements:

- Require stable Touch health for a recovery period.
- Synchronize V6 state, room coverage, current Asgard value, and last fallback value.
- Acquire lease before Touch resumes writes.
- V6-A must stop before Touch's first normal write.
- Rate-limit and smooth the first normal value if necessary.

Acceptance:

- Recovery is deterministic and visible.
- Tests show no overlap and no large artificial signal jump.

## P3.5 Add Authority UX And Diagnostics

- [x] Show the active authority everywhere it matters.

Required labels:

- Touch normal
- Touch degraded
- V6-A fallback pending
- V6-A fallback active
- Recovery pending
- No publisher
- Conflict

Acceptance:

- Touch web overview, Touch local display, V6 dashboard, and diagnostics agree.

---

# Phase 4 — Configuration And Command Ownership

## P4.1 Make Touch Authoritative For Room Intent

- [x] Remove silent two-way comfort target overwrite.

Implementation requirements:

- Touch owns room comfort, schedules, priorities, and mappings.
- V6 reports applied values and local overrides.
- A V6-local change becomes a clearly sourced override or proposed change.
- Polling V6 must not silently replace Touch configuration.

Acceptance:

- Repeated polling cannot oscillate or overwrite targets.

## P4.2 Define The Target Resolver

- [x] Implement and document one deterministic target-resolution order.

Required layers:

1. Persistent fallback/base target
2. Current Touch comfort or schedule target
3. Explicit temporary manual override
4. Bounded room-distribution modifier
5. Optional learned modifier with confidence
6. V6 absolute safety clamp

Rules:

- Every temporary layer expires.
- Forecast and manual modifiers must not stack unexpectedly.
- The API reports every input and the final applied target.

Acceptance:

- Resolver unit tests cover conflicts, expiry, clamp, stale Touch, and reboot.

## P4.3 Add Atomic Room Updates

- [x] Replace multi-request room saving with one atomic operation.

Implementation requirements:

- Validate mapping, comfort, schedule, weather profile, and inclusion together.
- Use expected revision to reject stale edits.
- Store all fields or none.
- Return the full saved room and new revision.

Acceptance:

- A failed field cannot leave a partially updated room.
- The dashboard shows validation errors without losing unsaved input.

## P4.4 Make Multi-Loop Commands Atomic At The Logical Level

- [x] Report per-loop results for a room command.

Implementation requirements:

- Use one command ID with child application results.
- Do not report room success when one required loop failed.
- Define rollback or degraded partial-application behavior.

Acceptance:

- Multi-loop room behavior is deterministic during one-node failure.

---

# Phase 5 — Heat-Source And ODIN Coordination

## P5.1 Add A Dedicated Asgard Adapter Boundary

- [x] Isolate Asgard-specific paths and response parsing behind a connector.

Capabilities:

- Read/write virtual thermostat physical temperature.
- Confirm the written value.
- Discover or validate the installed entity name.
- Read relevant heat-pump operating state where supported.
- Synchronize virtual-thermostat target through a separately validated endpoint.

Rules:

- Do not spread hard-coded Asgard paths through coordinator logic or dashboards.
- Do not guess an undocumented target endpoint.
- If target synchronization is not safely validated, keep it disabled and show a
  commissioning blocker.

Acceptance:

- Coordinator tests can use a fake adapter.
- Asgard compatibility is reported explicitly.

## P5.2 Keep The House Target Local

- [x] Retire external house-target synchronization.

Implementation requirements:

- Keep the separately aggregated house target in Touch for schedules, room distribution,
  diagnostics, and UI only.
- Publish only the physical house temperature to Asgard.
- Remove generic target-entity configuration and target-read helpers so an undocumented
  external target path cannot be enabled accidentally.
- Report target synchronization as intentionally unsupported, separately from physical
  temperature transport health.

Acceptance:

- A schedule change updates the local target without fabricating a physical-temperature
  change or issuing an Asgard target write.
- The API and dashboard explicitly report target synchronization as unsupported.

## P5.3 Keep External Operating State Out Of Control

- [x] Retire external operating-state ingestion.

Implementation requirements:

- Keep Asgard/ODIN operating-state ingestion unsupported. Do not infer state from
  dashboard paths, schedules, prices, energy buckets, or raw operation-mode values.
- Treat the approved Asgard ODIN plan as diagnostic-only. It must not create room-preheat,
  learning, schedule, physical-temperature, or valve-command behavior.
- Report the external operating-state boundary explicitly in the API and dashboard.

Acceptance:

- DHW and defrost cannot create false room-preheat or learning events because Touch has no
  external operating-state control input.
- The API and dashboard explicitly report operating-state ingestion as unsupported.

## P5.4 Remove Duplicate Whole-House Optimization

- [x] Ensure ODIN remains the only whole-house timing/price optimizer.

Implementation requirements:

- Disable V6 advanced preheat while Touch authority is valid.
- Preserve only conservative V6 fallback preheat.
- Reframe Touch weather logic as room distribution rather than independent heat-pump
  scheduling.
- Electricity prices are initially read-only in Touch.

Acceptance:

- Exactly one component owns each optimization decision.
- The ownership is documented in diagnostics and user help.

## P5.5 Prepare Optional ODIN Plan Ingestion

- [x] Document and prototype a read-only ODIN plan capability if upstream provides a
  stable API.

Rules:

- Do not scrape ODIN's dashboard.
- Do not block core control on ODIN plan availability.
- Do not reverse-engineer private endpoints without an explicit project decision.

Acceptance:

- Touch remains correct without plan ingestion.

---

# Phase 6 — Hydraulic Policy And Commissioning

## P6.1 Make Minimum-Flow Policy Topology-Aware

- [x] Separate Ecodan primary minimum flow from UFH secondary loop policy.

Implementation requirements:

- Model the installation as a four-way-buffer topology.
- Do not claim V6 valve opening guarantees Ecodan's 14 L/min primary flow.
- Avoid forcing every satisfied room to a minimum opening by default.
- Preserve configurable total secondary opening only when commissioning requires it.

Acceptance:

- UI help and documentation explain primary versus secondary flow.
- The default policy cannot silently overheat every room to protect an unrelated primary
  flow constraint.

## P6.2 Add Hydraulic Commissioning Data

- [x] Store commissioning metadata for every physical loop.

Fields:

- Manifold and port
- Room ID
- Served area
- Pipe length if known
- Design flow
- Measured flow
- Flooring type
- Actuator calibration
- Expected thermal delay

Acceptance:

- Both manifolds and all twelve loops can be documented.

## P6.3 Add ALPHA2 GO Commissioning Workflow

- [x] Add documentation and UX for recording pump commissioning.

Record:

- Pump model
- Selected control mode
- Setpoint
- Estimated flow and pressure
- Pump energy
- Commissioning date

Rules:

- Do not control the pump through undocumented BLE.
- If continuous secondary-flow telemetry is later required, use a documented measurable
  interface.

Acceptance:

- Pump commissioning is visible but does not create an unsupported runtime dependency.

## P6.4 Add Hydraulic Diagnostics

- [x] Add warnings for:
  - Pump running with all valves closed
  - Heat available with no accepting room
  - Persistent high valve demand without temperature rise
  - Excessive manifold supply/return delta
  - One manifold persistently starved
  - Ecodan primary flow below 14 L/min when trustworthy telemetry is available

Acceptance:

- Every alarm includes freshness, evidence, and a suggested action.

---

# Phase 7 — API Reliability And Security

## P7.1 Publish Versioned API Schemas

- [x] Define schemas for V6 and Touch resources and commands.

Required metadata:

- API version
- Stable device ID
- Boot ID
- Firmware version
- UTC timestamp when valid
- Data revision
- Freshness/quality

Acceptance:

- Contract fixtures exist for compatible and incompatible versions.

## P7.2 Add Idempotency And Revision Checks

- [x] Protect commands and configuration writes from retries and stale clients.

Acceptance:

- Repeating an idempotency key does not repeat physical action.
- Stale expected revisions are rejected with a structured error.

## P7.3 Implement Real Event Streaming Or Honest Polling

- [x] Replace the current one-shot pseudo-SSE behavior.

Preferred behavior:

- Real SSE with event IDs, heartbeat, reconnect, and snapshot recovery.

Fallback:

- Documented revision-based polling if SSE is unsafe on the target.

Acceptance:

- The browser does not poll the full V6 state every second merely to emulate live data.

## P7.4 Authenticate Controller Traffic

- [x] Add per-installation authentication for Touch-to-V6 writes.

Requirements:

- Unique device/install keys
- Timestamp/nonce
- Replay protection
- Key rotation/re-pairing procedure
- Read-only degraded behavior on auth failure

Acceptance:

- A MAC-derived fingerprint alone cannot authorize commands.

## P7.5 Secure The Web UX

- [x] Add local authentication and browser-write protection.

Requirements:

- Remove wildcard CORS.
- Add CSRF protection.
- Rate-limit writes and motor actions.
- Protect fallback APs.
- Keep advanced motor/recovery actions behind deliberate confirmation.

Acceptance:

- Security tests cover unauthenticated write, replay, CSRF, and excessive retries.

---

# Phase 8 — Web UX And Touch Display

## P8.1 Rebuild The Web Overview Around System State

- [x] Show:
  - House temperature and target
  - Comfort summary
  - Active authority and fallback state
  - Asgard/ODIN heating, DHW, and fault state
  - Both V6 nodes and sensor coverage
  - Degraded house-signal quality
  - Rooms outside target

Acceptance:

- A resident can identify the active problem and next action without opening diagnostics.

## P8.2 Present Logical Rooms

- [x] Replace raw zone-first interaction with logical room cards.

Each room shows:

- Temperature, target, and trend
- Sensor freshness and battery
- Active target resolver layers
- Bound loops and per-loop valve status
- Schedule and temporary override
- Estimated recovery/confidence when available

Acceptance:

- The 48 m² room appears once with multiple expandable loops.

## P8.3 Add Everyday, Advanced, And Service Sections

- [x] Organize controls by risk and frequency.

Everyday:

- Target
- Schedule
- Boost
- Away

Advanced:

- Wind/solar exposure
- Aggregation inclusion/weight
- Thermal model
- Loop mapping
- Heat-source diagnostics

Service:

- Motor actions
- Endstop calibration
- Driver reset
- Registry reset
- Firmware/recovery

Acceptance:

- Advanced settings remain available but destructive service actions are clearly gated.

## P8.4 Fix Refresh And Edit Reliability

- [x] Stop full-page rerenders from overwriting active edits.

Requirements:

- Preserve focus and unsaved state.
- Cancel or reject stale responses.
- Roll back optimistic updates after rejection.
- Show stored/clamped values.
- Use atomic room save.
- Bundle fonts/assets locally.

Acceptance:

- A background refresh cannot erase an in-progress edit.

## P8.5 Limit The Physical Touch Display

- [x] Keep the local screen focused on:
  - House status
  - Room comfort summary
  - Heating/DHW state
  - Active authority
  - Alarms
  - Simple away/boost/target actions

Acceptance:

- Commissioning and detailed service remain browser-first.

---

# Phase 9 — Test Coverage And Field Rollout

## P9.1 Add Contract And Failure Tests

- [x] Cover:
  - Asgard path encoding and readback
  - Forecast timestamps and cache
  - Multi-loop rooms
  - Stable identity after node removal
  - Reboot-safe command expiry
  - Authority lease and split-brain prevention
  - Partial sensor and manifold loss
  - DHW/defrost
  - Atomic room updates
  - Authentication and replay

Acceptance:

- Tests fail against the old defective behavior and pass against the new behavior.

## P9.2 Add End-To-End Simulation

- [x] Simulate two six-loop V6 nodes, Touch, Asgard, and ODIN operating states.

Scenarios:

- Touch reboot
- V6-A reboot
- V6-B disconnect
- Asgard unavailable
- Internet/weather unavailable
- DHW and defrost
- Cold wind event
- Solar gain
- All rooms satisfied
- Multi-loop room partial failure
- Conflicting authority

Acceptance:

- Each scenario has an expected authority state, room-control result, and diagnostic output.

## P9.3 Complete Staged Field Validation

- [ ] Stage 1: V6 local control only.
- [ ] Stage 2: Touch read-only comparison.
- [ ] Stage 3: Shadow Asgard publishing.
- [ ] Stage 4: Touch becomes normal Asgard writer; learning and forecast modifiers off.
- [ ] Stage 5: Intentionally test V6 fallback and Touch recovery.
- [ ] Stage 6: Enable room-distribution learning in shadow mode.
- [ ] Stage 7: Enable bounded optimization room by room.

Acceptance:

- Each stage has recorded evidence and an explicit go/no-go decision.

## P9.4 Measure Outcomes

- [ ] Track:
  - Time within ±0.3°C and ±0.5°C by room
  - Overshoot and recovery time
  - Sensor stale time
  - Compressor starts and average runtime
  - COP where available
  - Pump energy
  - Valve movements
  - Time in degraded/fallback states
  - Touch requested versus V6 applied targets
  - Touch published versus Asgard confirmed house signal

Acceptance:

- Optimization changes can be evaluated against a baseline rather than subjective memory.

---

# Blocked Items

Add blockers here without marking their task complete.

- 2026-07-30 — P9.3 — BLOCKED: Lune Touch was successfully flashed over USB, but Stage 1 requires retained Lune V6 local-control/sensor/valve evidence and an explicit go/no-go decision; none has been captured. PlatformIO serial monitoring could not attach in this non-interactive session (`termios` error 19), so the Touch post-boot log was not observed here. Stages 2–7 also require real V6/Asgard evidence. P9.4 depends on completing this rollout and must not start.

# Progress Log

Add newest entries at the top using this format:

```text
YYYY-MM-DD — TASK-ID — STATUS
- Summary:
- Files:
- Checks:
- Notes/follow-up:
```

- 2026-07-30 — P9.3 Stage 1 — BLOCKED
  - Summary: Built and flashed the current Lune Touch firmware to the serial-connected ESP32-S3 at `/dev/cu.usbmodem214401`. The upload erased/wrote the expected bootloader, partition, OTA-data, and application regions; every written region was hash-verified, then the device was hard-reset. This is a deployment event only, not completion of the V6-local-control validation stage.
  - Files: `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make deploy-touch PORT=/dev/cu.usbmodem214401` → PASS (firmware 1,486,064 / 6,553,600 bytes, 22.7%; serial write hash verification passed); `make monitor-touch PORT=/dev/cu.usbmodem214401` → BLOCKED by PlatformIO interactive-terminal `termios` error 19 in this session; `git diff --check` → PASS. No V6, Asgard, or ODIN endpoint was contacted.
  - Notes/follow-up: Keep every P9.3 stage unchecked until the field record contains V6 local-control, sensor/valve, and room-temperature evidence with an explicit go/no-go decision. P9.4 remains blocked by P9.3.

- 2026-07-29 — P9.3 — BLOCKED
  - Summary: Added the operator-facing seven-stage rollout record with permitted behavior, required evidence, and explicit go/no-go conditions. It prevents shadow work, normal Touch ownership, fallback recovery, learning, and room-by-room optimization from being mistaken for host-test completion.
  - Files: `devices/lune-touch/docs/field_validation.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: Documentation reviewed against `docs/lune_asgard_authority_state_machine.md`, `devices/lune-touch/docs/odin_plan_ingestion.md`, and the P9.2 simulator output; `make build-v6` → PASS; `make build-touch` → PASS; `make test` → PASS; `git diff --check` → PASS. No device was deployed or contacted.
  - Notes/follow-up: Remains unchecked pending authorized field execution and retained evidence for Stages 1–7. P9.4 remains blocked by the P9.3 prerequisite.

- 2026-07-29 — P9.2 — COMPLETE
  - Summary: Added a deterministic, network-free end-to-end host simulation that constructs two trusted six-loop V6 manifolds and exercises the actual Touch house model, V6-A authority lease, forecast preload model, and ODIN safety boundary. It emits and asserts an authority state, room-control result, and diagnostic for Touch reboot, V6-A reboot, V6-B loss, Asgard loss, weather loss, DHW/unknown defrost, cold wind, solar relief, all rooms satisfied, multi-loop partial failure, and conflicting authority. V6-B loss deliberately makes physical aggregation degraded rather than publishing a plausible partial temperature; DHW and unknown defrost cannot create a room command.
  - Files: `devices/lune-touch/Makefile`, `devices/lune-touch/tests/simulation/test_end_to_end_simulation.cpp`, `devices/lune-touch/tests/simulation/README.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-simulation` → PASS (11 scenarios); `make -C devices/lune-touch test` → PASS; `make -C devices/lune-touch config` → PASS; `git diff --check` → PASS. No network endpoint or device was contacted.
  - Notes/follow-up: This is a deterministic pre-field safety gate, not evidence from an installed system. Proceed to P9.3 staged field validation; it requires explicit authorization to interact with physical V6/Touch devices and live Asgard/ODIN services.

- 2026-07-29 — P9.1 — COMPLETE
  - Summary: Completed the cross-device contract/failure suite. Existing focused tests cover encoded Asgard write/readback, forecast time/cache validation, multi-loop logical rooms, stable physical-loop identities after removal, reboot-safe command expiry, atomic room updates, partial sensor/manifold coverage, and V6-A-only authority recovery. Added an explicit ODIN operation-mode boundary: only the documented raw values are labelled, and DHW/heat/cool/unavailable or unknown values can never create Touch room control or infer defrost. Extracted V6 Touch-command authentication into a pure policy covered for an empty or incorrect key, invalid clock, stale/future/non-finite timestamp, missing nonce, valid request, and the existing replay guard.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/odin_plan.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/odin_plan/test_odin_plan.cpp`, `devices/lune-v6/components/hv6_dashboard/touch_auth.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`, `devices/lune-v6/test/request_guard/test_request_guard.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-asgard-url test-asgard-adapter test-forecast test-coordinator test-odin-plan` → PASS; `make -C devices/lune-v6 test-request-guard test-authority-lease` → PASS; `make -C devices/lune-touch test` → PASS; `make -C devices/lune-v6 test` → PASS; `make -C devices/lune-touch config` → PASS; `make -C devices/lune-v6 config` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: The new operation-mode and authentication assertions fail against the prior absence of an explicit ODIN control boundary and testable Touch-auth policy; the existing named failure assertions remain regression tests for the other P9.1 cases. Proceed to P9.2 end-to-end simulation.

- 2026-07-29 — P8.5 — COMPLETE
  - Summary: Limited the normal physical Touch navigation to dashboard, room comfort, quick controls, and refresh. The local dashboard now displays heating/DHW-plan state, authority through the existing house summary, active alarms, and room comfort; its Quick controls operate only the active comfort-driver room with ±0.5 °C target, a 45-minute boost, or a bounded six-hour away command. Detailed commissioning, weather, manifolds, diagnostics, endstops, and service remain browser-first. Each temporary local command still passes through Touch’s command ledger and V6 validation/clamp/expiry path.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/packages/display/lvgl_stability.yaml`, `devices/lune-touch/Makefile`, `devices/lune-touch/tests/display/test_phase8_display.sh`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/tests/dashboard/test_phase8_overview.sh`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-dashboard test-display` → PASS; `make -C devices/lune-touch config` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3, final OTA 1,486,016 / 6,553,600 bytes, 22.7%); `make test` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: The first build exposed an ESPHome LVGL label-lambda type mismatch; returning `std::string` fixed it and the rebuild passed. The quick controls resolve the active scheduled comfort driver before acting. Phase 8 is complete; proceed to P9.1 contract and failure tests.

- 2026-07-29 — P8.4 — COMPLETE
  - Summary: Replaced remote Google font loading with local platform font stacks, made read refreshes abortable and generation-fenced, and added form-draft capture/restore around the existing dashboard render cycle. Background refreshes now restore unsaved field values, checkbox state, focus, and cursor selection; a failed write keeps the draft visible, while a successful write clears it and re-renders the freshly stored coordinator state. All room writes continue to use the existing atomic room endpoint, and command ledger/API refreshes display V6 accepted/clamped outcomes.
  - Files: `devices/lune-touch/web/dashboard-src/app/app-root.js`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/tests/dashboard/test_phase8_overview.sh`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-dashboard` → PASS; `make -C devices/lune-touch dashboard-build` → PASS (114.3 kB bundle); `git diff --check` → PASS. The dashboard source check verifies abortable refreshes, draft restoration, successful-write reconciliation, and absence of Google Fonts network imports.
  - Notes/follow-up: The Touch dashboard has no remote font or asset dependency after this change. Continue with P8.5, retaining the device display as a concise status-and-simple-actions surface.

- 2026-07-29 — P8.3 — COMPLETE
  - Summary: Made everyday room actions explicit (target/schedule editor, 45-minute boost, and confirmed 6-hour room-away command), moved wind/solar exposure, physical aggregation area/weight/inclusion, thermal estimate, loop mapping, and heat-source diagnostics behind advanced/browser sections, and renamed System to Service. Service makes destructive registry reset and motor recovery confirmation-gated and deliberately leaves undocumented endstop/driver/firmware operations in the V6 service browser.
  - Files: `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/app/header.js`, `devices/lune-touch/web/dashboard-src/app/app-root.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/tests/dashboard/test_phase8_overview.sh`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-dashboard` → PASS; `make -C devices/lune-touch dashboard-build` → PASS (113.2 kB bundle); `git diff --check` → PASS.
  - Notes/follow-up: Room-away is a bounded temporary command and remains subject to V6 validation/clamping/expiry. Endstop calibration, driver reset, and firmware recovery have no documented Touch-to-V6 service contract, so no speculative action was added. Continue with P8.4 refresh/edit reliability.

- 2026-07-29 — P8.2 — COMPLETE
  - Summary: Added a dedicated Rooms navigation section that groups physical loop records by stable logical room ID. Each room card now shows a representative physical temperature, resolved target and trend, sensor freshness and an explicit battery-not-reported state when V6 supplies no battery data, target resolver layers, schedule/temporary override, thermal confidence, and expandable bound-loop valve/status detail. The mock fixture includes one 48 m² room with three loops to exercise the grouping path; room boost and editing remain room-scoped.
  - Files: `devices/lune-touch/web/dashboard-src/core/store.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/app/header.js`, `devices/lune-touch/web/dashboard-src/app/app-root.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/tests/dashboard/test_phase8_overview.sh`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-dashboard` → PASS; `make -C devices/lune-touch dashboard-build` → PASS (100.7 kB bundle); `git diff --check` → PASS. The dashboard source test requires logical-room grouping, expandable bound-loop output, sensor-battery handling, and the 48 m² multi-loop fixture.
  - Notes/follow-up: Battery percentage is not part of the V6 zone API, so the UI names that limitation rather than presenting invented telemetry. Continue with P8.3 risk/frequency sections.

- 2026-07-29 — P8.1 — COMPLETE
  - Summary: Rebuilt the Touch browser overview around the resident-facing system state: separately reported physical house temperature and house target, comfort and room deficits, authority/fallback status, Asgard physical-signal health, advisory ODIN/DHW status, V6 reachability/fresh-sensor coverage, degraded quality, and the current commissioning next action. ODIN/DHW remain observational because Touch must not control their timing or behavior.
  - Files: `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/Makefile`, `devices/lune-touch/tests/dashboard/test_phase8_overview.sh`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-dashboard` → PASS; `make -C devices/lune-touch dashboard-build` → PASS (95.1 kB bundle); `git diff --check` → PASS. Inspected the resulting overview data paths to confirm the visible next-action and fault/degradation states require no diagnostics view.
  - Notes/follow-up: The ODIN endpoint reports planning mode and heat only; it does not provide a DHW/fault contract, so the overview states that limitation instead of inventing state. Continue with P8.2 logical-room cards.

- 2026-07-29 — P7.5 — COMPLETE
  - Summary: Removed V6 wildcard CORS, require a locally provisioned access key plus matching
    CSRF header for browser writes, generate per-write idempotency keys in the browser, and cap
    writes at 30 per minute. The dashboard keeps its key only in session storage and prompts on
    first write; V6 remains read-only when no local key is provisioned. Existing advanced actions
    continue to require their deliberate UI confirmations.
  - Files: `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`,
    `devices/lune-v6/web/dashboard-src/core/api.js`, `devices/lune-v6/web/dashboard.js`,
    `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 dashboard-build` → PASS;
    `make -C devices/lune-v6 test-request-guard` → PASS (replay/idempotency boundary);
    source check confirms no V6 `Access-Control-Allow-Origin: *`; `make -C devices/lune-v6 build`
    → PASS (ESP32-S3, flash 91.6%); `make test` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: Provision the local browser key only through the authenticated physical
    commissioning process. Browser security is intentionally V6-local; Touch retains its own
    dashboard runtime and should receive an equivalent hardening pass before external exposure.

- 2026-07-29 — P7.4 — COMPLETE
  - Summary: Touch now authenticates its coordinator command path with the provisioned per-installation
    key and supplies a UTC timestamp plus unique command nonce. V6 validates the key in constant
    time, rejects an unavailable/invalid clock and stale timestamp, and rejects replayed nonces
    before it can apply a temporary command. Auth failure is read-only and does not affect local
    V6 heating safety.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`,
    `devices/lune-v6/components/hv6_dashboard/request_guard.h`,
    `devices/lune-v6/docs/hv6_api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-request-guard` → PASS (duplicate nonce is rejected);
    `make -C devices/lune-touch test-coordinator` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: Key rotation is an authenticated physical commissioning operation on Touch
    and V6-A; V6-B is never a fallback writer. P7.5 secures browser writes separately.

- 2026-07-29 — P7.3 — COMPLETE
  - Summary: Replaced the one-shot pseudo-SSE reconnect loop with documented revision-based
    polling. The browser performs one initial state read, then polls a small `/revision` resource
    every three seconds and reads the full state only after a revision change.
  - Files: `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`,
    `devices/lune-v6/web/dashboard-src/core/sse.js`, `devices/lune-v6/web/dashboard.js`,
    `devices/lune-v6/docs/hv6_api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 dashboard-build` → PASS; source inspection confirms full
    `/state` reads occur only in the initial/change path; `git diff --check` → PASS.
  - Notes/follow-up: Real SSE remains deliberately deferred until it can offer bounded lifetime,
    heartbeats, event IDs, reconnect and snapshot recovery on ESP-IDF.

- 2026-07-29 — P7.2 — COMPLETE
  - Summary: Added a bounded, wrap-safe V6 idempotency ledger before action enqueueing and
    a monotonic runtime data revision. Replayed keys return the accepted result without adding a
    second physical action; an explicitly stale `expected_revision` returns structured HTTP 409
    with the current revision.
  - Files: `devices/lune-v6/components/hv6_dashboard/request_guard.h`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`,
    `devices/lune-v6/test/request_guard/test_request_guard.cpp`, `devices/lune-v6/Makefile`,
    `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-request-guard` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: Legacy clients may omit both conditional fields during the compatibility
    period. New clients send `Idempotency-Key` and `expected_revision` as defined by P7.1.

- 2026-07-29 — P7.1 — COMPLETE
  - Summary: Published a product-neutral v1 envelope contract with stable device/boot identity,
    firmware, valid-UTC indication, revision, freshness/quality, conditional-write, and command
    idempotency semantics. V6 and Touch retain separate implementations; the shared location is
    contract documentation and fixtures only.
  - Files: `shared/contracts/lune_api_v1.md`,
    `shared/contracts/fixtures/lune_api_v1_compatible.json`,
    `shared/contracts/fixtures/lune_api_v2_incompatible.json`,
    `shared/contracts/test_api_fixtures.sh`, `devices/lune-v6/docs/hv6_api_v1.md`,
    `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `sh shared/contracts/test_api_fixtures.sh` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: P7.2 applies the conditional-write and idempotency behavior to V6 writes.

- 2026-07-29 — P6.1/P6.2/P6.3/P6.4 — COMPLETE
  - Summary: Replaced the unsafe per-satisfied-room minimum-flow floor with an opt-in,
    commissioning-only UFH-secondary total-opening policy that uses only already accepting
    loops. Added versioned physical-loop records (stable manifold/room IDs, port, pipe,
    design/measured flow, flooring via the existing zone field, actuator result and thermal
    delay), passive ALPHA2 GO/pump commissioning UX, and evidence-limited hydraulic
    diagnostics. The diagnostics explicitly report missing documented pump, peer-manifold,
    and Ecodan-primary telemetry as unavailable rather than inferring it from valve position.
  - Files: `devices/lune-v6/Makefile`,
    `devices/lune-v6/components/hv6_config_store/hv6_types.h`,
    `devices/lune-v6/components/hv6_config_store/hv6_config_store.h`,
    `devices/lune-v6/components/hv6_config_store/hv6_config_store.cpp`,
    `devices/lune-v6/components/hv6_zone_controller/hv6_zone_controller.h`,
    `devices/lune-v6/components/hv6_zone_controller/hv6_zone_controller.cpp`,
    `devices/lune-v6/components/hv6_zone_controller/hydraulic_policy.h`,
    `devices/lune-v6/components/hv6_zone_controller/hydraulic_diagnostics.h`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`,
    `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`,
    `devices/lune-v6/test/hydraulic_policy/test_hydraulic_policy.cpp`,
    `devices/lune-v6/test/hydraulic_diagnostics/test_hydraulic_diagnostics.cpp`,
    `devices/lune-v6/test/commissioning/test_persistence_schema.sh`,
    `devices/lune-v6/docs/hydraulic_commissioning.md`, `devices/lune-v6/docs/hv6_api_v1.md`,
    `devices/lune-v6/web/dashboard-src/app/app-root.js`,
    `devices/lune-v6/web/dashboard-src/main.js`,
    `devices/lune-v6/web/dashboard-src/core/api.js`,
    `devices/lune-v6/web/dashboard-src/utils/keys.js`,
    `devices/lune-v6/web/dashboard-src/components/settings/settings-minimum-flow-card.js`,
    `devices/lune-v6/web/dashboard-src/components/settings/settings-pump-commissioning-card.js`,
    `devices/lune-v6/web/dashboard.js`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-hydraulic-policy` → PASS;
    `make -C devices/lune-v6 test-hydraulic-diagnostics` → PASS;
    `make -C devices/lune-v6 test-commissioning-schema` → PASS (v3 zone and v1 system
    persistence schemas are rejected); `make -C devices/lune-v6 dashboard-build` → PASS;
    `make -C devices/lune-v6 build` → PASS (ESP32-S3; generated firmware image);
    `make test` → PASS;
    `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: Zone configuration schema v4 and system schema v2 safely invalidate
    old blobs because their physical commissioning values cannot be guessed. Continuous
    secondary, peer-manifold, and Ecodan-primary flow alarms need documented telemetry
    before they can become asserted runtime warnings. Continue with P7.1.

- 2026-07-28 — P5.3 — COMPLETE
  - Summary: The product owner chose the no-external-contract policy. Replacing external
    operating-state normalization with an explicit diagnostic-only boundary so raw ODIN
    plan values cannot enter room learning, preheat, schedules, physical aggregation, or
    valve commands.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/asgard_adapter.h`,
    `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`,
    `devices/lune-touch/tests/asgard_adapter/test_asgard_adapter.cpp`,
    `devices/lune-touch/web/dashboard-src/components/views.js`,
    `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-asgard-adapter` → PASS;
    `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS;
    `make -C devices/lune-touch build` → PASS (ESP32-S3, RAM 40.3%, OTA 22.5%);
    `git diff --check` and untracked-file whitespace checks → PASS. No device was
    deployed.
  - Notes/follow-up: ODIN remains the heat-pump/DHW optimizer. P5.5's JSON plan remains
    advisory-only; no external state endpoint is polled.

- 2026-07-28 — P5.2 — COMPLETE
  - Summary: The product owner chose the no-external-contract policy. Replacing the
    blocked target-write task with an explicit local-target-only boundary and removing
    the dormant generic target endpoint capability.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/asgard_adapter.h`,
    `devices/lune-touch/tests/asgard_adapter/test_asgard_adapter.cpp`,
    `devices/lune-touch/web/dashboard-src/components/views.js`,
    `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-asgard-adapter` → PASS;
    `make -C devices/lune-touch dashboard-build` → PASS;
    `make -C devices/lune-touch test-coordinator` → PASS (schedule target changes without
    changing physical temperature). No device was deployed.
  - Notes/follow-up: Physical temperature remains the only normal Asgard write. P5.3 is
    next and will retain external operating state as intentionally unsupported.

- 2026-07-28 — P5.5 — COMPLETE
  - Summary: The product owner explicitly approved the direct JSON response at Asgard's
    `/dashboard/odin` route as the plan source. A read-only probe returned HTTP 200,
    `application/json`, `success`, 72-point schedule/forecast arrays, `current_hour`,
    and `today_start_index`; it is not HTML scraping. Replacing the ODIN debug-wrapper
    prototype with strict validation of this direct response.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/odin_plan.h`,
    `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`,
    `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`,
    `devices/lune-touch/tests/odin_plan/test_odin_plan.cpp`,
    `devices/lune-touch/docs/odin_plan_ingestion.md`, `devices/lune-touch/docs/api_v1.md`,
    `docs/lune_heating_control_implementation_plan.md`.
  - Checks: Read-only `GET http://192.168.20.54/dashboard/odin` → PASS (HTTP 200,
    direct JSON); `make -C devices/lune-touch test-odin-plan` → PASS;
    `make -C devices/lune-touch test-coordinator` → PASS; `make test` → PASS;
    `make -C devices/lune-touch build` → PASS (ESP32-S3, RAM 40.3%, OTA 22.5%);
    `git diff --check` and untracked-file whitespace checks → PASS. No device was
    deployed.
  - Notes/follow-up: The route still lacks defrost/fault/active-legionella context, so
    P5.3 remains blocked and this integration stays advisory-only.

- 2026-07-28 — P5.3 — BLOCKER REFINED
  - Summary: Reviewed the supplied optimizer class and state definitions. They confirm
    that defrost is a separate upstream `status_defrost` binary sensor, rather than an
    `operation_mode` value. The existing authorized ODIN debug snapshot exposes neither
    that sensor nor a fault state; enum values for frost protection and legionella exist,
    but the published mapper leaves both disabled.
  - Files: `devices/lune-touch/docs/odin_plan_ingestion.md`,
    `docs/lune_heating_control_implementation_plan.md`.
  - Checks: Attached-source review → PASS; documentation whitespace check → PASS. No
    device was deployed.
  - Notes/follow-up: P5.3 requires an approved endpoint carrying `status_defrost`,
    legionella state, and a distinct fault/availability contract. Do not derive them from
    solver schedules or valve behavior.

- 2026-07-28 — P5.3 — BLOCKED
  - Summary: Reviewed the supplied `Optimizer::to_operation_mode` source contract. It
    establishes raw `1` as DHW, `2` as heat, `3` as cooling, `255` as unavailable, and
    off for every other value. The source does not expose defrost or fault and leaves
    frost-protect/legionella mapping disabled, so it cannot meet P5.3's complete
    normalized-context acceptance criteria without guessing.
  - Files: `devices/lune-touch/docs/odin_plan_ingestion.md`,
    `docs/lune_heating_control_implementation_plan.md`.
  - Checks: Source review of `components/optimizer/optimizer.h` and
    `components/optimizer/optimizer_state.h` → PASS; `git diff --check` → PASS;
    untracked-document whitespace checks → PASS. No device was deployed.
  - Notes/follow-up: Keep ODIN plan output advisory-only. Supply an explicit current
    defrost, fault, and legionella state source (or add those fields to ODIN) before
    implementing P5.3 normalization.

- 2026-07-28 — P5.5 — COMPLETE
  - Summary: Implemented a bounded read-only Touch prototype for the explicitly approved
    ODIN solver endpoint (`/api/debug`). It accepts only a successful complete 48-hour plan
    with valid schedule bounds, prices, planned heat, and raw operation-mode array;
    malformed/unreachable data is advisory-only and cannot block core control or issue valve
    commands. Provenance, freshness, and the current plan point are exposed through
    `GET /forecast`.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/odin_plan.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/odin_plan/test_odin_plan.cpp`, `devices/lune-touch/Makefile`, `devices/lune-touch/docs/odin_plan_ingestion.md`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-odin-plan` → PASS; `make -C devices/lune-touch test-coordinator` → PASS; read-only `GET http://192.168.20.6/api/debug` → PASS (48-hour plan observed); `make test` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3, OTA 22.5%); `make -C devices/lune-touch ota-size-check` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: The debug response has no documented raw operation-mode mapping, so no
    mode inference or active valve distribution is implemented. P5.3 remains blocked on that
    contract; P5.2 remains blocked on an Asgard target endpoint.

- 2026-07-28 — P5.3/P5.5 — REOPENED
  - Summary: The product owner clarified that ODIN exposes a solver endpoint which accepts
    an optimization request and returns up to 48 hours of planning. The previous
    unsupported-ODIN assumption is superseded. Touch may consume a documented plan only as
    read-only advisory input for expiring room/valve distribution commands; ODIN retains
    heat-pump timing, price, compressor, and DHW ownership.
  - Files: `docs/lune_heating_control_implementation_plan.md`.
  - Checks: Public ODIN root inspection → reachable, but no versioned solver contract
    advertised; `git diff --check` → PASS.
  - Notes/follow-up: Await the solver URL/method, exact request and response JSON examples,
    response timestamp/timezone/expiry semantics, and authentication requirements. Do not
    inspect private dashboard endpoints or issue any optimization request until that contract
    is supplied.

- 2026-07-28 — P5.2/P5.3 — DECISION RECORDED
  - Summary: The external Asgard and ODIN installations are not under project control and
    are not expected to provide stable target or operating-state APIs. The product therefore
    retains physical-temperature-only Asgard integration, keeps target synchronization and
    operating-state ingestion disabled, and forbids dashboard scraping/private-endpoint
    reverse engineering. This preserves safe core control without an external runtime
    dependency.
  - Files: `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `git diff --check` → PASS.
  - Notes/follow-up: P5.2 and P5.3 remain unchecked by design. Reopen only with an explicit
    project decision and vendor-documented stable APIs; do not deploy a workaround.

- 2026-07-28 — P5.5 — COMPLETE
  - Summary: Documented the disabled-by-default, read-only ODIN-plan capability and its
    required future version/freshness/provenance contract. No upstream stable API is
    currently documented, so no runtime connector is enabled. The prototype explicitly
    ignores unavailable/stale/unsupported plans and cannot block Touch core control,
    fabricate demand, alter physical aggregation, or scrape/reverse-engineer ODIN.
  - Files: `devices/lune-touch/docs/odin_plan_ingestion.md`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make test` → PASS (Touch remains correct without plan ingestion); documentation policy search for unavailable/read-only/no-scrape/private-endpoint rules → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: A live connector requires an explicit decision and a documented stable
    ODIN API. P5.2 and P5.3 remain blocked by absent documented Asgard endpoints.

- 2026-07-28 — P5.4 — COMPLETE
  - Summary: A live authenticated Touch lease now disables V6’s response-preheat and
    preheat-absorption behavior. On lease expiry, V6 resumes only conservative local
    fallback behavior; it does not obtain any ODIN heat-pump timing, price, compressor, or
    DHW control. Touch diagnostics and help now name the ODIN/Touch/V6 ownership boundary,
    and describe weather preload as room distribution rather than heat-pump scheduling.
  - Files: `devices/lune-v6/components/hv6_zone_controller/preheat_policy.h`, `devices/lune-v6/components/hv6_zone_controller/hv6_zone_controller.h`, `devices/lune-v6/components/hv6_zone_controller/hv6_zone_controller.cpp`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.cpp`, `devices/lune-v6/test/preheat_policy/test_preheat_policy.cpp`, `devices/lune-v6/Makefile`, `devices/lune-v6/docs/ecodan_integration.md`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-preheat-policy` → PASS; `make -C devices/lune-v6 test-authority-lease` → PASS; `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS; `make -C devices/lune-v6 build` → PASS (ESP32-S3, flash 91.1%); `make -C devices/lune-touch build` → PASS (ESP32-S3, OTA 22.5%); `make -C devices/lune-touch ota-size-check` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: Electricity prices remain read-only in Touch. P5.2 and P5.3 remain blocked by absent documented endpoints; proceed with optional P5.5 documentation.

- 2026-07-28 — P5.1 — COMPLETE
  - Summary: Added a Touch-local Asgard adapter boundary that owns documented display-entity
    URL construction, numeric response parsing, capability validation, and a fakeable
    transport seam. The coordinator now calls that boundary for physical-temperature writes
    and readback, while retaining signal quality and authority decisions. `GET /heat-source`
    and the dashboard explicitly report physical compatibility, unsupported operating-state
    support, and the target-sync commissioning blocker; no undocumented target is guessed.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/asgard_adapter.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/asgard_adapter/test_asgard_adapter.cpp`, `devices/lune-touch/Makefile`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-asgard-adapter` → PASS; `make -C devices/lune-touch test-asgard-url` → PASS; `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3, OTA 22.5%); `make -C devices/lune-touch ota-size-check` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: P5.2 and P5.3 are explicitly blocked by the absent documented
    endpoints. Continue with the independent P5.4 ownership work.

- 2026-07-28 — P4.4 — COMPLETE
  - Summary: Room setpoint commands now have one `command_id` shared by all child loop applications. The response and ledger retain each loop's stable ID, node ID, result, and accepted offset. A room is `accepted` only when every required loop accepts; an outage/rejection produces explicit `partial` application and is returned as a room-level failure. No unsafe cross-node rollback is attempted because V6 commands are independently validated, clamped, and expiring.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS (all-loop success and one-node partial outcome); `make test` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3, OTA 22.5%); `git diff --check` → PASS.
  - Notes/follow-up: Partial application is the deliberate degraded behavior for independent V6 nodes; it is visible and never labelled room success. No device was deployed.

- 2026-07-28 — P4.3 — COMPLETE
  - Summary: Added `POST /api/lune-touch/v1/zones/{room_id}/room`, a complete atomic Touch-owned room update with optimistic `expected_revision`. It validates an existing mapping plus geometry/inclusion, comfort, schedule, and weather profile before changing any field, returns the full saved room/new revision, and rejects stale or invalid edits without partial state. The room editor now sends one atomic save and leaves unsaved inputs in place on validation errors. Revisions are runtime-only optimistic-concurrency values; persisted room fields were unchanged, so no schema migration was needed.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/components/lune_touch_dashboard/lune_touch_dashboard.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS (all fields propagate, invalid field leaves state unchanged, stale revision rejected); `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS; `make -C devices/lune-touch build` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: The atomic operation owns coordinator configuration only; V6 retains its independently safe local configuration and reports applied state rather than accepting silent configuration write-back. No device was deployed.

- 2026-07-28 — P4.2 — COMPLETE
  - Summary: Consolidated target calculation into a pure, documented resolver: persistent fallback base; current Touch comfort/schedule when available; manual override taking precedence over forecast distribution; confidence-gated learned modifier; Touch dispatch envelope; and final independent V6 safety clamp. The API reports every resolver input, pre-V6 target, dispatch target, and V6-applied telemetry.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS (manual/forecast conflict, expiry/reboot boundary, stale Touch fallback, learned bound, dispatch clamp); `make test` → PASS; `make -C devices/lune-touch build` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: Temporary command precedence is mutually exclusive, so forecast and manual modifiers cannot stack. No device was deployed.

- 2026-07-28 — P4.1 — COMPLETE
  - Summary: Removed the polling path that copied a V6-reported setpoint into Touch's persisted logical-room comfort intent. V6 now remains the reporter of its live applied setpoint/local state, while Touch remains authoritative for room comfort, schedules, priority, and mappings; repeated polling cannot change that intent.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: V6's live `setpoint_c` remains visible as applied-state telemetry; it is not a configuration write-back. Continue with P4.2.

- 2026-07-28 — P3.5 — COMPLETE
  - Summary: Added the required human-readable authority labels (Touch normal/degraded, V6-A fallback pending/active, Recovery pending, No publisher, Conflict) to the Touch web overview and settings, Touch local display summary, V6 dashboard card, state API, and diagnostics. Touch now sends its independently derived coverage-health state in each authenticated renewal so V6 and Touch expose the same normal/degraded authority state without changing the physical temperature aggregation.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/authority_lease.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`, `devices/lune-v6/web/dashboard-src/components/diagnostics/asgard-bridge-status-card.js`, `devices/lune-v6/web/dashboard.js`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-v6/test/authority_lease/test_authority_lease.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-authority-lease` → PASS; `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS; `git diff --check` → PASS.
  - Notes/follow-up: The API retains machine-readable state names; all user-facing surfaces map them to the required labels. No device was deployed.

- 2026-07-28 — P3.4 — COMPLETE
  - Summary: Implemented deterministic recovery handover. V6 returns authority state, current and last fallback Asgard values, local/peer coverage, and peer freshness with lease responses. Touch keeps a reachable `recovery_pending` response visible during the 120-second stable-health period, acquires a new lease before publishing, and clamps its first confirmed physical signal to within 0.5 C of V6-A's last fallback value. V6-A transitions out of fallback on grant before Touch can issue that write.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/authority_lease.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`, `devices/lune-v6/test/authority_lease/test_authority_lease.cpp`, `devices/lune-v6/docs/hv6_api_v1.md`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-authority-lease` → PASS (recovery pending has no writer; stable recovery grants); `make -C devices/lune-v6 build` → PASS (ESP32-S3, flash 91.1%); `make -C devices/lune-touch build` → PASS (ESP32-S3, OTA 22.4%); `make test` → PASS.
  - Notes/follow-up: A 409 recovery-pending lease response is deliberately parsed as reachable state, not misreported as a V6 outage. No device was deployed.

- 2026-07-28 — P3.3 — COMPLETE
  - Summary: Added the conservative V6-A fallback transition: active Touch lease expiry enters a pending state, then only the configured V6-A may publish after the 30-second guard. Existing V6 peer polling and real area-weighted local/peer measurements remain the fallback signal; stale/unreachable peer state is exposed, so local-only operation is not labelled healthy whole-house data. Temporary external commands are cleared on fallback entry while V6 local base targets remain active.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/authority_lease.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.cpp`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.h`, `devices/lune-v6/test/authority_lease/test_authority_lease.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-authority-lease` → PASS (expiry, pending state, V6-B denial, V6-A guard); `make test` → PASS; `make -C devices/lune-v6 build` → PASS.
  - Notes/follow-up: Updated the timing text to the authoritative 90-second acknowledged lease plus 30-second V6-A guard; this is the explicit 120-second no-writer fence and replaces the plan's ambiguous separate failed-check counter. No device was deployed.

- 2026-07-28 — P3.2 — COMPLETE
  - Summary: Fenced every V6 Asgard write immediately before the HTTP request. Only configured V6-A may enter fallback; V6-B cannot publish in any authority state. Touch normal publishing is conditional on a live authenticated lease, and V6 exposes state, reason, remaining lease time, generation, and write permission in diagnostics.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/authority_lease.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.cpp`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`, `devices/lune-v6/test/authority_lease/test_authority_lease.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-authority-lease` → PASS (valid lease blocks V6-A; renewal, expiry, reboot, and V6-B cases); `make test` → PASS; `make -C devices/lune-v6 build` → PASS; `make -C devices/lune-touch build` → PASS.
  - Notes/follow-up: The tested state machine has no state in which Touch has a live lease and V6 can write. No device was deployed.

- 2026-07-28 — P3.1 — COMPLETE
  - Summary: Added a V6-A runtime-only authenticated authority lease with stable installation/coordinator IDs, lease ID, issued time, expiry, monotonic sequence, replay rejection, conflict fencing, and diagnostics. V6 stores only the provisioned identities/key in the versioned Asgard configuration; active leases are deliberately invalidated on reboot. Touch renews the lease every 30 seconds and does not publish its normal Asgard signal without a live grant.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/authority_lease.h`, `devices/lune-v6/test/authority_lease/test_authority_lease.cpp`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.cpp`, `devices/lune-v6/components/hv6_config_store/hv6_types.h`, `devices/lune-v6/components/hv6_config_store/hv6_config_store.cpp`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`, `devices/lune-v6/Makefile`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/components/lune_touch_dashboard/lune_touch_dashboard.cpp`, `devices/lune-v6/docs/hv6_api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-authority-lease` → PASS; `make -C devices/lune-touch test-coordinator` → PASS; `make -C devices/lune-v6 build` → PASS (ESP32-S3); `make -C devices/lune-touch build` → PASS (ESP32-S3, OTA 22.4%). No device was deployed.
  - Notes/follow-up: The Asgard configuration schema was safely invalidated from v1 to v2 for the new persisted identity/key fields; no active lease is persisted. Continue with P3.2 write gating.

- 2026-07-28 — P2.4 — COMPLETE
  - Summary: Added configurable 75% minimum contributing-area coverage, expected/contributing manifold tracking, and explicit degraded-manifold commissioning mode (disabled by default). Physical temperature is now available only when both coverage and manifold gates are healthy; the API and dashboard expose that quality decision, coverage percentage, and manifold contribution. The Asgard physical-temperature writer retains only the readback-confirmed healthy value for a fixed five-minute grace period, which cannot be renewed by degraded retries; after expiry it sends no partial-house signal and reports degraded coverage.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS; `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3 Touch, OTA 22.3%); `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: Phase 2 is complete. Continue with P3.1, the authenticated expiring Touch authority lease on the V6 API.

- 2026-07-28 — P2.3 — COMPLETE
  - Summary: Added a separate area-weighted `house_target` from effective room comfort/schedule intent using the same fresh included-room coverage as physical aggregation. Forecast and manual loop offsets are excluded. The strategy API reports target value, source, and contributing area. The existing Asgard endpoint remains physical-temperature-only; the plan’s target synchronization clause was narrowed because writing target to that endpoint would falsify the physical signal. A future explicit target endpoint must apply its own deadband/minimum interval.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS; `make test` → PASS; `make -C devices/lune-touch build` → PASS (OTA 22.3%); `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: This decision preserves the non-falsified ODIN learning signal. Continue with P2.4 coverage quality gates.

- 2026-07-28 — P2.2 — COMPLETE
  - Summary: Replaced priority-weighted per-loop physical temperature with a fresh, finite primary-sensor sample per included logical room, weighted by explicit physical weight or its total area. Multi-loop rooms contribute once; excluded, stale, and invalid rooms are omitted with missing-area diagnostics. Comfort priority remains available for comfort demand but cannot alter physical aggregation. Strategy and heat-source APIs identify the signal as `physical_area_weighted` / `area_weighted_house_temp`.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS; `make test` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3 Touch, OTA 22.3%); `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: P2.3 adds the separate house target aggregation and synchronization policy.

- 2026-07-27 — P2.1 — COMPLETE
  - Summary: Split Touch’s persisted logical-room state from physical loop bindings. A room now has stable identity, name, primary loop, area/physical-weight and aggregation settings, plus its comfort/schedule configuration; each loop retains its stable loop and node IDs, physical slot, served area, commissioned state, and runtime data. Binding a second loop adds it to the same room and rejects a physical loop already assigned elsewhere. Registry v11 migrates v10 bindings into rooms and rewrites the result. Room commands fan out to every commissioned loop and return a per-loop result, so partial failure is explicit. `GET /zones` now exposes a deduplicated `rooms` list alongside the existing physical-loop diagnostics.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS (one loop, a 48 m² room with three loops including two V6 nodes, duplicate physical-loop rejection, served areas, and loop removal preserving its room); `make test` → PASS; `make -C devices/lune-touch build` → PASS (ESP32-S3 Touch, OTA 22.3%); `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: P2.2 moves physical-temperature aggregation from per-loop to once per logical room using the persisted room area/weight fields.

- 2026-07-27 — P1.5 — COMPLETE
  - Summary: Replaced command-target identity based on mutable node/zone indexes with immutable room, node, and loop IDs. Touch now assigns a stable `loop-<node-id>-<slot>` ID when binding a physical loop, changes it only when the room is rebound to a different physical loop, and captures all three stable IDs in each command. Forecast deduplication now compares stable node/loop IDs, while indexes remain execution-location metadata only. Registry schema v10 persists loop IDs; all older registry layouts generate them from the persisted node ID and physical slot, disable an unidentifiable legacy loop fail-closed, and immediately rewrite the migrated registry. Ledger schema v3 safely invalidates v2 index-only records.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS (stable loop persistence, node removal/index shift, reordered-index deduplication, room rebind, removed-loop history, and v2 ledger invalidation); `make -C devices/lune-touch build` → PASS (ESP32-S3 Touch, OTA 22.0%); `make test` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: The legacy registry’s loop ID is deterministically derived and saved once before further use. A legacy binding without a valid persisted node ID is disabled rather than guessed; its index-only ledger commands are invalidated. Continue with P2.1 logical room-to-multiple-loop mapping.

- 2026-07-27 — P1.4 — COMPLETE
  - Summary: Replaced the uptime-only transient-command boundary with ledger schema v2. Each command now carries a boot ID plus UTC creation/expiry epochs when the clock is valid. Touch generates a fresh random boot ID before loading the ledger; pending or accepted commands from a prior boot are retained for history but converted to `expired` before any command resolution. Same-boot expiry uses UTC where available and a signed wrap-safe millisecond comparison otherwise. The command API exposes the epoch and boot audit fields.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.h`, `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/coordinator/test_coordinator_model.cpp`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-coordinator` → PASS (same-boot active command, reboot before expiry, invalid-clock reboot, millisecond wraparound, and old-ledger invalidation); `make test` → PASS; `make -C devices/lune-touch build` → PASS (OTA 21.8%); `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: Ledger v1 is safely invalidated because its uptime-only records cannot be trusted after reboot. Continue with P1.5 stable command target identity.

- 2026-07-27 — P1.3 — COMPLETE
  - Summary: Open-Meteo hourly Unix timestamps and provider timezone are parsed and retained with every forecast hour. Decisioning now starts at the first provider hour at or after the real wall clock, so `peak_in_h=0` means the current or next hour rather than the midnight array entry. Forecast-cache schema v2 persists the fetch epoch, timezone, and timestamped hours; pre-v2, expired (>2 h), clock-unavailable, or unalignable caches are safely discarded. The API exposes each `timestamp_s`, cache provenance, and decision start index; the Touch graph uses the aligned index for preload markers and timestamp labels.
  - Files: `devices/lune-touch/components/lune_touch_coordinator/forecast_timeline.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/forecast/test_forecast_timeline.cpp`, `devices/lune-touch/Makefile`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `devices/lune-touch/docs/forecast_preload.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-touch test-forecast` → PASS (existing preload model plus timeline coverage for 00:05, 12:30, day rollover, DST forward/back, fresh/expired reboot cache, prior-schema invalidation, and missing/mismatched arrays); `make -C devices/lune-touch dashboard-build` → PASS; `make -C devices/lune-touch config` → PASS; `make -C devices/lune-touch build` → PASS (OTA 21.8%); `make test` → PASS; `git diff --check` → PASS. No device was deployed.
  - Notes/follow-up: The old uptime-only v1 forecast cache is intentionally invalidated because it cannot be aligned safely across reboot. Continue with P1.4 reboot-safe command expiry.

- 2026-07-27 — P1.2 — COMPLETE
  - Summary: Added product-local bounded Asgard readback after every accepted virtual-thermostat write. Touch and V6 now record the requested value, HTTP result, confirmed value, confirmation age, and `sent`/`confirmed`/`mismatch`/`unreachable` status; a POST alone is never treated as confirmation. Both use three read attempts with 250 ms then 500 ms backoff on their existing background tasks, and cumulative failure history no longer resets on a single success.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/asgard_url.h`, `devices/lune-v6/components/hv6_asgard_bridge/asgard_confirmation.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.cpp`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.h`, `devices/lune-v6/components/hv6_dashboard/hv6_dashboard.cpp`, `devices/lune-v6/test/asgard_url/test_asgard_url.cpp`, `devices/lune-v6/web/dashboard-src/utils/keys.js`, `devices/lune-v6/web/dashboard-src/components/diagnostics/asgard-bridge-status-card.js`, `devices/lune-v6/web/dashboard.js`, `devices/lune-v6/docs/ecodan_integration.md`, `devices/lune-v6/docs/hv6_api_v1.md`, `devices/lune-touch/components/lune_touch_coordinator/asgard_url.h`, `devices/lune-touch/components/lune_touch_coordinator/asgard_confirmation.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/tests/asgard_url/test_asgard_url.cpp`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-asgard-url` → PASS; `make -C devices/lune-touch test-asgard-url` → PASS; `make -C devices/lune-v6 dashboard-build` → PASS; `make -C devices/lune-touch dashboard-build` → PASS; `make config-touch` → PASS; `make config-v6` → PASS; `make -C devices/lune-v6 build` → PASS (V6 flash 90.8%); `make -C devices/lune-touch build` → PASS (Touch OTA slot 21.7%); `make -B test` → PASS; `git diff --check` → PASS. Host tests cover exact encoded read/write paths, confirmation-state labels, the ±0.05 °C match tolerance, and the bounded retry/backoff policy.
  - Notes/follow-up: Runtime confirmation accepts either `value` or `state` from the Asgard number response. Continue with P1.3 timestamp alignment; no persisted structures changed in this task.

- 2026-07-27 — P1.1 — COMPLETE
  - Summary: Replaced the deprecated object-ID endpoint with the current Asgard display-entity path in both product-specific writers. Each product now URL-encodes entity names exactly once, retains `Content-Length: 0`, validates display/encoded names, and defaults UI/configuration to `Virtual Thermostat Input z1`.
  - Files: `devices/lune-v6/components/hv6_asgard_bridge/asgard_url.h`, `devices/lune-v6/components/hv6_asgard_bridge/hv6_asgard_bridge.cpp`, `devices/lune-v6/components/hv6_config_store/hv6_types.h`, `devices/lune-v6/components/hv6_config_store/hv6_config_store.cpp`, `devices/lune-v6/test/asgard_url/test_asgard_url.cpp`, `devices/lune-v6/Makefile`, `devices/lune-v6/web/dashboard-src/components/settings/settings-asgard-card.js`, `devices/lune-v6/web/dashboard.js`, `devices/lune-v6/docs/ecodan_integration.md`, `devices/lune-v6/docs/hv6_api_v1.md`, `devices/lune-touch/components/lune_touch_coordinator/asgard_url.h`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.h`, `devices/lune-touch/tests/asgard_url/test_asgard_url.cpp`, `devices/lune-touch/Makefile`, `devices/lune-touch/web/dashboard-src/components/views.js`, `devices/lune-touch/web/dashboard-src/core/api.js`, `devices/lune-touch/web/dashboard.js`, `devices/lune-touch/docs/api_v1.md`, `docs/lune_heating_control_implementation_plan.md`.
  - Checks: `make -C devices/lune-v6 test-asgard-url` → PASS; `make -C devices/lune-touch test-asgard-url` → PASS; `make -C devices/lune-v6 dashboard-build` → PASS; `make -C devices/lune-touch dashboard-build` → PASS; `make test` → PASS. URL tests cover spaces, already-encoded input, invalid host/port, timeout transport failure, 404, non-2xx, and exact path.
  - Notes/follow-up: Continue with P1.2 readback confirmation. Existing saved legacy entity names remain accepted; operators can update them through the dashboard without double encoding.

- 2026-07-27 — P0.4 — COMPLETE
  - Summary: Defined the Touch-to-Asgard physical-temperature, separate comfort-target, and quality contract. It requires one fresh physical sample per logical room, area weighting independent of priority, explicit coverage, and no fabricated demand signal.
  - Files: `docs/lune_house_signal_contract.md`, `docs/lune_heating_control_implementation_plan.md`
  - Checks: Reviewed the current priority-weighted implementation and API output in `devices/lune-touch/components/lune_touch_coordinator/coordinator_model.cpp`, `devices/lune-touch/components/lune_touch_coordinator/lune_touch_coordinator.cpp`, and `devices/lune-touch/docs/api_v1.md`; documentation whitespace check → PASS.
  - Notes/follow-up: P2.2–P2.4 replace the current strategy calculation and API labels with this contract; P5 synchronizes the separate target through the Asgard adapter.

- 2026-07-27 — P0.3 — COMPLETE
  - Summary: Defined immutable installation, node, room, loop, command, and boot identities, canonical API/persistence records, and a fail-safe migration policy for the existing index-based Touch and V6 records.
  - Files: `docs/lune_domain_identity_contract.md`, `docs/lune_heating_control_implementation_plan.md`
  - Checks: Reviewed current persisted structs and index usage in `devices/lune-v6/components/hv6_config_store/hv6_types.h`, `devices/lune-touch/components/lune_touch_coordinator/`, `devices/lune-touch/docs/api_v1.md`, and `devices/lune-v6/docs/hv6_api_v1.md`; `git diff --check` → PASS.
  - Notes/follow-up: P1.4 and P1.5 implement the version bumps, migration/invalidation code, and tests. P2.1 implements multi-loop room mappings.

- 2026-07-27 — P0.2 — COMPLETE
  - Summary: Added the Asgard single-writer authority state machine. It establishes V6-A as lease arbiter and sole initial fallback writer, preserves Touch as the normal writer, and fail-closes on partitions or conflicts; V6-B is explicitly never a writer.
  - Files: `docs/lune_asgard_authority_state_machine.md`, `docs/lune_heating_control_implementation_plan.md`
  - Checks: Reviewed the existing V6 bridge and integration contract (`devices/lune-v6/components/hv6_asgard_bridge/`, `devices/lune-v6/docs/ecodan_integration.md`) and Touch coordinator sources; `git diff --check` → PASS.
  - Notes/follow-up: The current direct V6 coordinator toggle does not implement this protocol. Implement stable identities next (P0.3), then apply the runtime authority contract in the later authority tasks.

- 2026-07-27 — P0.1 — COMPLETE
  - Summary: Captured the pre-implementation working-tree and validation baseline. The existing host test suites pass. Touch configuration is valid. V6 configuration is blocked in this environment by DNS resolution for the declared Google Fonts Roboto resource; no secrets were inspected or changed.
  - Files: `docs/lune_heating_control_implementation_plan.md`
  - Checks: `git status --short` → the plan was the only pre-existing untracked file; `make test` → PASS (Lune V6 ripple-counter and adaptive-balance tests; Lune Touch forecast and coordinator tests); `make config-v6` → FAIL (unable to resolve `fonts.googleapis.com` while downloading `gfonts://Roboto`); `make config-touch` → PASS (`INFO Configuration is valid!`).
  - Notes/follow-up: Proceed with P0.2. Re-run `make config-v6` when DNS/network access to Google Fonts is available; this is an environment dependency, not a source validation failure.

- 2026-07-27 — PLAN — COMPLETE
  - Summary: Created corrective implementation plan from the architecture/API/UX review.
  - Files: `docs/lune_heating_control_implementation_plan.md`
  - Checks: Documentation review only; no firmware or dashboard code changed.
  - Notes/follow-up: Start with P0.1 and update this checklist after every verified task.

---

# Copy-Ready Implementation Prompt

```text
You are implementing the Lune heating control plan in this repository.

Repository root:
/Users/birkemose/workspace/github.com/birkemosen/lune

Primary plan:
docs/lune_heating_control_implementation_plan.md

Read these files before changing anything:
1. AGENTS.md
2. docs/lune_heating_control_implementation_plan.md
3. docs/lune_brand_architecture.md
4. The device-local docs and source files named by the next unchecked task

Your job:
- Work through the implementation plan in order.
- Start with the first unchecked numbered task (`P0.1`, `P0.2`, and so on) whose
  prerequisites are complete. The Global Acceptance Criteria are release gates, not the
  task queue.
- Implement one checklist task at a time.
- Continue to the next task only after the current task's tests and acceptance criteria pass.
- Do not skip tasks, silently change architecture, or mark partial work complete.

Mandatory plan maintenance:
- At the start, identify the task ID you are implementing.
- Leave its checkbox unchecked while work is in progress.
- After implementation, run the task's required tests and inspect the result.
- Only when all acceptance criteria pass, change that task from `- [ ]` to `- [x]`.
- In the same change, add a dated entry at the top of the plan's Progress Log containing:
  - Task ID and status
  - What changed
  - Exact files changed
  - Exact commands/checks run and their results
  - Any follow-up work
- If blocked, do not mark the task complete. Add the blocker under Blocked Items and stop
  only when no safe in-scope work remains.
- If implementation proves part of the plan wrong, update the plan explicitly and explain
  why in the Progress Log.

Safety and architecture rules:
- Lune V6 must remain independently capable of safe basic heating.
- Touch is the only normal Asgard writer.
- V6-A may write only in explicit fallback; V6-B must not write in the initial design.
- ODIN owns heat-pump timing, electricity-price optimization, whole-house weather/solar
  optimization, compressor behavior, and DHW.
- Touch owns logical rooms, room distribution, schedules, house temperature/target
  aggregation, and normal Asgard integration.
- Never fabricate a colder physical temperature to create demand.
- Comfort priority must never affect physical house-temperature aggregation.
- One logical room may control multiple physical loops.
- Use stable IDs in persisted/API data; do not persist mutable array indexes as identity.
- Temporary commands must expire safely across reboot.
- Do not use undocumented ALPHA2 GO BLE control.
- Never read, print, create, or modify secrets.yaml.
- Preserve unrelated user changes.
- When persisted structs change, increment the relevant version and add migration or safe
  invalidation tests.
- Keep V6 and Touch runtime/dashboard implementations separate unless the repository
  deliberately introduces a shared package.

Working method:
- Inspect existing behavior before editing.
- Prefer the smallest change that completely satisfies the active task.
- Add or update tests that fail on the old defect and pass on the new behavior.
- Run narrow tests first, then `make test` at the end of each phase.
- For ESPHome configuration or build work, confirm the existing repository hardware
  profile and use the repository Makefiles.
- Do not deploy to physical devices unless explicitly authorized.
- Do not continue past a failed verification as if it succeeded.

At the end of each response, report:
- Completed task IDs
- Current task/checklist status
- Files changed
- Tests/checks and outcomes
- Next unchecked task
- Any blockers or decisions needed

Begin by reading the required files, checking `git status --short`, and executing P0.1.
```
