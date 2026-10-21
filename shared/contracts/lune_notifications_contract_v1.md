# Lune notifications contract v1

How Lune V6 and Lune Touch report problems to Home Assistant, which sends them to
phones. Devices report; Home Assistant decides who gets what (one place to opt in or
out: the Lune notifications blueprint in `lune-coordinator/homeassistant/`).

## Transport

Each device fires a Home Assistant event over the ESPHome native API:

- Event type: `esphome.lune_problem`
- Sent when a problem is **raised** and when it is **cleared**.
- Requires "Allow the device to perform Home Assistant actions" on the device in
  Home Assistant's ESPHome integration. Without it the event is dropped; the device
  keeps working and still shows its problems locally.

Each device also exposes two entities:

- `sensor` **Active problems** (count, state class measurement).
- `text_sensor` **Problems**: titles of the active problems, `; `-separated, cut to
  255 characters.

## Event data

All values are strings (HA event data from ESPHome are strings).

| Key | Example | Notes |
|---|---|---|
| `device` | `lune-touch-a1b2c3` | ESPHome node name |
| `device_name` | `Teknikrum` | Friendly/own name |
| `id` | `room.not_reached:stue` | Stable per problem instance; used as notification tag |
| `category` | `room_comfort` | One of the categories below |
| `severity` | `warning` | `warning` (attention soon) or `error` (fault now) |
| `state` | `raised` | `raised` or `cleared` |
| `title` | `Stue når ikke sin temperatur` | Short, from the device's i18n catalogue, device language |
| `message` | `Stue har ikke nået 21,5 °C i 24 timer (højst 20,8 °C).` | One or two sentences; numbers with the language's decimal sign; never raw firmware text |
| `room` | `Stue` | Optional; empty when not about a room |

## Categories

| Category | Reported by | Problems |
|---|---|---|
| `heat_pump` | Touch | Delivered heat over/under Odin's plan (hp_diagnostics) |
| `hydraulics` | Touch | Secondary flow above primary (mixing) |
| `connectivity` | Touch | A V6 not answering (10 min), Asgard not answering (10 min), Odin not answering (30 min) |
| `room_comfort` | Touch | A room has not reached its target (temp ≥ target − 0.3 °C) at any time in the last 24 h, with ≥ 24 h observed and heating active |
| `humidity` | Device that receives the sensor | Relative humidity > 60 % or < 40 % for 1 h (clears at ≤ 58 % / ≥ 42 %) |
| `sensor_battery` | Device that receives the sensor | Battery ≤ 15 % = warning, ≤ 5 % = error; clears at ≥ 25 % |
| `sensor` | Device that owns the sensor | Room or manifold temperature missing for 30 min, probe fault |
| `valve` | V6 | Motor fault, stall, calibration failed |

"Device that receives the sensor": BTHome sensors bound to V6 zones are V6's; sensors
Touch reads itself are Touch's. Touch never re-reports what a V6 reports.

## Rules

- Raise only after the condition has held for the time given above (default 10 min
  where none is given), so blips don't notify.
- The same `id` is raised at most once per hour; a `cleared` event is sent only for a
  raise that was sent.
- Problems are runtime state: after a reboot a still-present problem is raised again
  (once its hold time has passed).
- Missing data never raises a problem by itself, except the explicit "missing for 30 min"
  sensor problems.
