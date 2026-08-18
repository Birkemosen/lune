# Forecast Preload (wind-aware, coordinator-owned)

`hv6_forecast` is the extracted weather-forecast-driven per-zone preheating producer for
the Lune Touch / Mini coordinator. It exists because a Mitsubishi Ecodan + Odin optimizer
plans the *whole house's* heat as a single signal, but a real house loses heat unevenly:
depending on wind direction and speed, only one or two rooms may lag during a winter
storm. Odin cannot route heat to a specific facade; the Lune coordinator can, while each
Lune V6 keeps validating and clamping the resulting commands locally.

## How it works

1. **Fetch.** A coordinator task pulls a
   48 h Open-Meteo forecast over HTTPS every `fetch_interval_s` (default 1 h): hourly
   temperature, wind speed, wind direction, shortwave radiation, and the provider's hourly
   Unix timestamps. The parsed forecast, fetch epoch, and provider timezone are cached in
   coordinator-owned storage so a reboot does not lose a fresh, clock-alignable forecast.
   Decisioning starts at the first provider hour at or after the current wall-clock time;
   this keeps `peak_in_h = 0` anchored to the current/next hour across midday fetches,
   date rollovers, and DST changes rather than to the midnight array entry. An expired or
   unalignable cache is discarded safely after reboot.

2. **Per-zone weather load.** Each forecast hour is reduced to a dimensionless load per zone
   ([forecast_model.h](../components/hv6_forecast/forecast_model.h)):

   ```
   wind_alignment = max over the zone's exterior walls of cos(wind_dir − wall_normal), ≥ 0
   load = wind_exposure × wind_alignment × (wind_speed / 10 m/s)
            × max(0, indoor_ref − outdoor) / 10 K
            − solar_gain × (shortwave / 800 W/m²),  floored at 0
   ```

   A zone with no exterior walls (interior room) always scores 0. Wind from a sheltered
   side scores 0. The per-zone `exterior_walls` bitmask is configured and persisted by
   Lune Touch; it is not mirrored to the local V6 manifold.

3. **Preload decision.** For each zone the model scans the next active lead window and
   takes the peak load. The active lead is the larger of the configured
   `thermal_lead_h` and a learned lead derived from the observed heat gain rate once
   enough fresh samples exist. Learning can therefore extend a slow slab's preload
   window, but it never shortens the configured/manual safety profile. Above
   `load_threshold` it issues a setpoint offset
   `min(max_offset_c, (peak − threshold) × gain_c_per_load)`, so charging starts before
   the storm — longer for high-mass floors (concrete ground floor ≈ 8–12 h), shorter
   for the light first floor (≈ 2–3 h).

4. **Apply.** Touch sends each active offset through the V6 expiring
   `setpoint-command` path, so every per-zone firmware safety clamp applies unchanged:
   `[min_offset_c, max_offset_c]`, `abs_min_c/abs_max_c`. A fetch skips a zone when a
   recent, still-active forecast command with nearly the same offset is already in the
   Touch ledger, and stale zone snapshots are never dispatched.

The forecast and Lune V6's local preheat-absorption logic are complementary: forecast
preload biases exposed zones *before* the weather, while V6's local absorption behavior
keeps satisfied zones from fighting a hot-water buffer that arrives from an external
optimizer.

## Multi-node coordination

The coordinator should run this logic once per house, across one or more Lune V6 nodes.
Each fresh, reachable V6 receives only validated, expiring setpoint-offset commands
through the existing local command path. Touch skips stale or unreachable nodes before
send and reports those blocked counts separately from actual send failures.

## Configuration

Legacy V6 NVS schema retained for migration (`ForecastConfig` + per-zone exposure fields):

| Field | Default | Meaning |
|---|---|---|
| `enabled` | false | Master on/off |
| `latitude` / `longitude` | 0 | Site location (required; 0,0 disables) |
| `fetch_interval_s` | 3600 | Open-Meteo refresh cadence |
| `recompute_interval_s` | 300 | Preload re-evaluation cadence |
| `load_threshold` | 1.0 | Load units before preload kicks in |
| `gain_c_per_load` | 0.5 | °C offset per load unit above threshold |
| `max_offset_c` | 1.5 | Model cap (per-zone clamps still apply) |
| `indoor_ref_c` | 21.0 | Reference indoor temp for the cold term |
| per-zone `wind_exposure` | 0.5 | 0–1 facade exposure (shelter/terrain) |
| per-zone `solar_gain_factor` | 0.3 | 0–1 passive solar relief through glazing |
| per-zone `thermal_lead_h` | 4 | Hours of slab charging before a load peak |

Coordinator UI should show status, per-zone active offset, fetch dispatch counts, command
expiry, and the local clamp result returned by each V6.

## Testing

The load/preload math is pure C++ with no ESP dependencies and is covered by
[devices/lune-touch/tests/forecast/test_forecast_model.cpp](../tests/forecast/test_forecast_model.cpp):

```bash
make test-forecast   # or: make test from the repo root
```
