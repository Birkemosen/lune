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
   temperature, wind speed, wind direction and shortwave radiation. The parsed forecast is
   cached in coordinator-owned storage so a reboot does not lose it.

2. **Per-zone weather load.** Each forecast hour is reduced to a dimensionless load per zone
   ([forecast_model.h](../components/hv6_forecast/forecast_model.h)):

   ```
   wind_alignment = max over the zone's exterior walls of cos(wind_dir − wall_normal), ≥ 0
   load = wind_exposure × wind_alignment × (wind_speed / 10 m/s)
            × max(0, indoor_ref − outdoor) / 10 K
            − solar_gain × (shortwave / 800 W/m²),  floored at 0
   ```

   A zone with no exterior walls (interior room) always scores 0. Wind from a sheltered
   side scores 0. The per-zone `exterior_walls` bitmask (set in V6 zone settings and
   eventually mirrored into the coordinator zone registry) is what makes this directional.

3. **Preload decision.** For each zone the model scans the next `thermal_lead_h` hours and
   takes the peak load. Above `load_threshold` it issues a setpoint offset
   `min(max_offset_c, (peak − threshold) × gain_c_per_load)`, so charging starts
   `thermal_lead_h` before the storm — longer for high-mass floors (concrete ground floor
   ≈ 8–12 h), shorter for the light first floor (≈ 2–3 h).

4. **Apply.** The offset is fed through the **internal setpoint-offset command path**
   (`apply_helios_command`), so every per-zone firmware safety clamp applies unchanged:
   `[min_offset_c, max_offset_c]`, `abs_min_c/abs_max_c`. The forecast producer
   should auto-quiesce whenever a higher-priority coordinator strategy owns the same command
   slots.

The forecast and Lune V6's local preheat-absorption logic are complementary: forecast
preload biases exposed zones *before* the weather, while V6's local absorption behavior
keeps satisfied zones from fighting a hot-water buffer that arrives from an external
optimizer.

## Multi-node coordination

The coordinator should run this logic once per house, across one or more Lune V6 nodes.
Each V6 receives only validated, expiring setpoint-offset commands through the existing
local command path.

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

Coordinator UI should show status, per-zone active offset, command expiry, and the local
clamp result returned by each V6.

## Testing

The load/preload math is pure C++ with no ESP dependencies and is covered by
[coordinator/lune-touch/tests/forecast/test_forecast_model.cpp](../tests/forecast/test_forecast_model.cpp):

```bash
make test-forecast   # or: make test   (runs ripple + forecast)
```
