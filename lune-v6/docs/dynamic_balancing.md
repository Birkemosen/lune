# Dynamic balancing (heat-pump mode)

Heat-pump mode in Lune V6 behaves like a statically balanced underfloor installation
whose balancing valves are re-set continuously from the rooms' load. Every loop has flow
all the time, the total flow changes slowly with the rooms' load instead of jumping with
loops opening and closing, and the amount of heat is set by the supply temperature.

Normal mode (boilers, on/off sources) is unchanged.

## Why

A heat pump wants:

- **steady flow**, so a parallel buffer neither short-circuits (secondary below primary)
  nor mixes heavily (secondary far above primary), and
- **the lowest possible supply temperature**, which needs the largest possible heated
  floor area at any moment.

The earlier heat-pump law was a stack of layers: a demand opening, a satisfied base
opening, a trim floor, «close fully above target», closing when overheated, a
minimum-total guarantee and a flow floor. Each layer corrected another. Loops opened and
closed, and the total flow swung with the number of open loops. *Den gode installation
af varmepumper* (Energistyrelsen, 2017) §4.3 advises against exactly that: zone control
that pulses loops to make up for missing balancing.

## The model: a balanced manifold without actuators

In a statically balanced installation without actuators:

- every loop is always open;
- the loop with the greatest need relative to its resistance (the index loop) is fully
  open, and the others are throttled to their share;
- the total flow is constant;
- the room with the greatest need decides the heating curve.

Dynamic balancing copies that, and lets the shares follow the rooms' actual load. One
difference: the two manifolds are not balanced against each other (no differential
pressure control or balancing valves between them), so each manifold's total follows its
own most demanding room.

## The law

Per control cycle, for each enabled loop *i*:

1. **Design share** `P_i` = static prior × learned correction. The static prior is the
   existing resistance-aware model (area × heat loss, floor, pipe, loop length),
   normalised so the most demanding loop is 1.0. A zone without an area (a new zone; 0 = not set) counts
   with the mean area of the board's other zones until it is set, and V6 raises «area not set».
   `/api/v1/zones` reports `balance_basis: "model"`.
   The learned correction is the adaptive
   balancing multiplier (slow, hourly, relative to the other loops). Touch's house
   balance `H_i` (≤ 1) multiplies it.
2. **Load factor** `g_i` from the room's error `e_i = setpoint − temperature`:
   - `g = 1` when the room is at least one comfort band below target;
   - `g` falls linearly to `G_MIN` (0.25) at target + overheat margin;
   - a room above target + band + margin (+ the absorb band while Touch pre-buffers) is
     **closed** (latched, reopens 0.3 °C below that limit). This is the only reason a
     loop closes.
   - **moving heat:** a closed loop reopens while the manifold's supply is at least
     `hp_heat_move_k` (default 0.5 K, 0–3) colder than its room (until less than 0.3 K
     closer than that), and only while an open room on
     the manifold is at or below target. The water then gathers the room's surplus
     (sun, a stove, a warm slab) and carries it through the buffer to the rooms that
     want it. It gets its design share `min(1, P_i · H_i)`, on top of the others' flows,
     so the open loops keep theirs. When the heat source runs the supply is warmer than
     the room and the loop closes again by itself. Without a supply probe nothing moves.
   - no temperature: `g = 1` (the loop behaves as statically balanced).
3. **Total follows the most demanding room.** The reference flow is what the balanced
   manifold would pass with every room at its design share:
   `Q_ref = Σ min(1, P_i · H_i)`. The manifold load `L` is the largest load factor of an
   open loop: 1 as long as one room is a band below target. The relative flows
   `q_i = min(1, s · P_i · H_i · g_i)` are scaled with one common factor `s` so that
   `Σ q_i = Q_ref · L` (water-filling: loops that reach 1.0 stay there and the rest
   share what is left). Inside the manifold warm rooms give up flow and cold rooms take
   it. A room above its target gets at most `P_i · H_i · g_i` (its own share × load,
   `s ≤ 1` for it): once the cold rooms are at full flow, what they cannot take is not
   handed to warm rooms, and the sum falls short of `Q_ref · L`. A manifold whose rooms
   are all warm passes less in total.
   That matters while the manifolds are not balanced against each other: a warm floor
   must not keep its full flow because the other floor needs heat. A closed loop's flow
   goes to the others only while an open room is at or below target; when every open
   room is warm, `Q_ref` counts only the open loops, so the last open room on a warm
   floor keeps its own share × load instead of the whole floor's flow.
4. **Opening** through the loop's valve curve (below), clamped to the zone's maximum
   opening. A loop asked for all it can carry (`q_i` at its cap) opens to 110 % on its
   curve (10 % of the span past the full point): the full point moves with the seat and
   the other loops' pressure, and full flow must be full. Not to 100 % stroke, which only
   adds travel and drift. An open loop gets at least `Q_MIN` (10 %) of full flow. A maximum opening
   below the curve's full-flow point caps the loop's flow; Q_ref uses the same cap.
5. **Never all closed.** If every loop would be closed (and none is moving heat), the one
   nearest its limit stays open at `G_MIN`.
6. **Heat source idle: static balance.** While Touch says the heat source is not running
   (`hp_phase` idle, Touch's «valves follow the heat pump»), every open loop at or below
   target gets its design share (load factor 1) and a loop above target its share × its
   load factor (what the warm loops no longer take goes to the rooms that want it),
   closed loops hand nothing on, and an overheated loop
   moves heat whenever the supply is `hp_heat_move_k` colder than its room, cold room or not. Flow is
   the default: the buffer's rest and the rooms' surplus spread by themselves, every
   floor keeps water, and the valves mostly move when the heat source starts and stops.
   Only a room over its limit stays closed, while the water would heat it. Running,
   prestart or no phase from Touch: the load law above.

The valve deadband (`min_movement_pct`) keeps small changes from moving the motors.

### Valve opening

The opening is the pin's position in % of its learned travel: 0 % in the seat, 100 % the
pin free. A loop that is to give heat opens at least 10 % (past the seat's dead zone,
about 0.2 mm), and above that flow is taken as linear in opening (`valve_curve.h`). The
room loop closes on temperature, so the valve's quick-opening characteristic is absorbed
by the control rather than modelled. `/api/v1/zones` reports `opening_mm`: the opening ×
the learned travel in motor counts × 0.0011 mm per count (Laura, 1. sal, 2026-11-13: 900
counts from the seat measured 1.0 mm with a caliper).

Until 2026-11 each loop had a curve measured by Touch from the circulation pump's flow
(`start_pct`, `full_pct`, `full_lmin`). The pump computes its flow from power and speed,
far from the manifold, and could not tell 1 mm of lift from 2 mm: every measured curve put
full flow at about 1 mm of a 2–3 mm stroke, the control never opened past it, and rooms
with long or high-loss loops fell behind (Laura at 51 % = 1.0 mm, 19.8 °C against 22 °C).
The curves, their NVS key, `POST /api/v1/zones/{n}/valve-curve` and the measured design
shares are gone. `POST /api/v1/valve-test` stays: Touch uses it to flush air from a loop.

### Heat demand for Touch

Touch uses the manifold's summary to set the heating curve:

- **raise** when a room has been in demand (at least one comfort band below target,
  load factor 1) for 20 minutes: it already has its full share, so the supply
  temperature is too low. The warmer rooms then throttle themselves and the cold room
  gets more of the constant flow;
- **lower** when no room is below its target for 30 minutes;
- otherwise **hold**.

The critical zone is the room with the greatest deficit.

## What it replaces (heat-pump mode)

| Removed | Why |
|---|---|
| Demand opening, base opening, trim floor | One continuous load factor |
| «Close fully above target» and its flow guarantee | Loops close only when overheated |
| Flow floor while the heat pump runs | Every loop always has flow |
| Trim floor while the heat pump is idle | Flow all the time |
| Flow allocator (energy debt) | Load factor + learned correction |
| Group split by area | Each loop has its own design share |
| Anticipated reopening | Loops rarely close |

The stored settings keep their NVS layout; heat-pump mode ignores them.

## Settings

- **Overheat margin** (`hp_overheat_margin_c`, default 1.0 °C): where the load factor
  reaches its minimum, and with the comfort band where a loop closes.
- **Comfort band** (`comfort_band_c`): where the load factor reaches 1.
- **Max. opening per zone**: caps the loop. Default for new zones is 100 %.

## Commissioning

With all loops open, the total flow is set by the circulation pump. Set the pump once so
the secondary flow is about 105–125 % of the heat pump's flow (Touch shows the buffer
balance). Until the manifolds have differential-pressure control or balancing valves,
Touch's house balance can damp the manifold that takes too much.
