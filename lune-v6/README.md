# Lune V6

ESPHome firmware for **Lune V6**, the Birkemosen 6-zone hydronic underfloor-heating
manifold controller.

Lune V6 is the local manifold node in the Lune product line. It owns valve motion,
endstop detection, local temperature inputs, minimum-flow protection, motor fault
handling, and conservative fail-safe heating. Whole-house learning and optimization
belongs in the Lune Touch / Lune Mini coordinator, which lives in the private repository
[`Birkemosen/lune-coordinator`](https://github.com/Birkemosen/lune-coordinator).

Some firmware entrypoint filenames, including `lune.yaml`, remain for configuration
compatibility; the Lune V6 component directories and internal names use the `lv6` prefix.

This folder is ESPHome-only. The legacy PlatformIO and ESP-IDF source tree has been
removed.

## Firmware and hardware are not yet aligned

**The current board is `rev3.2`. The firmware still targets the `rev3.1` DRV8215 I2C
backend.** This is a live migration, not a documentation gap — see
[Migration status](#migration-status) before flashing a rev3.2 board.

## Hardware Revisions

| Revision | Status | Motor drive |
|----------|--------|-------------|
| [`rev3.0`](hardware/lune-v6-rev3.0/) | superseded | — |
| [`rev3.1-lean`](hardware/lune-v6-rev3.1-lean/) | superseded | 6× DRV8215 over I2C |
| [**`rev3.2`**](hardware/lune-v6-rev3.2/) | **current** — schematic complete, PCB not yet routed | 3× DRV8411 + hardware one-hot decoder |

Rev3.2 is at `SCHEMATIC_ECO_PENDING_PCB_PLACEMENT_ROUTING_AND_PHYSICAL_VALIDATION`: the
schematic and design contract are complete and checked, but no `.kicad_pcb` exists yet.

## Rev3.2 Board

Two-layer board, outline **100 × 70 mm** with a 21 × 7 mm antenna cutout in the north
edge, ESP32-S3-WROOM-1-N8R8 (8 MB flash, 8 MB octal PSRAM), USB-C powered. All connectors
except USB-C exit the south edge; USB-C is on the west, beside the module's USB pads.

> **The 85 °C ambient rating is conditional.** R8 modules are rated −40 ~ 65 °C unless
> PSRAM ECC is enabled, which needs `CONFIG_SPIRAM_ECC_ENABLE=y` **and**
> `CONFIG_SPIRAM_MODE_OCT=y`. Neither is set today. The **Free PSRAM** sensor is the
> proof: ~7680 kB means ECC is on and the 85 °C applies; ~8192 kB means it is not.
> See [`hardware/lune-v6-rev3.2/architecture.md`](hardware/lune-v6-rev3.2/architecture.md).

### Motor drive

Six 3.3 V H-bridge channels from **three `DRV8411PWPR` dual drivers**. Channel selection
is a **hardware one-hot** `74HC4514` 4-to-16 decoder, so only one bridge can ever be
active — the address is latched while driving, and firmware cannot select two motors at
once. `DRV8410PWPR` is the nominated second source - pin-compatible including the NC
pins 11/14, so no extra capacitors - but it is not stocked at LCSC. `DRV8833PWPR` was
dropped in rev3.2-E: TI supersedes it with the DRV8411, and it specifies no xISEN trip.

The actuators are Homematic IP VdMot on Danfoss RA-N adapters, wired over 4P4C/RJ9.

### Current sense and position

All six channels share one high-side sense chain: a 0.5 Ω shunt and an `INA180A1` at
×20, giving **10 V/A** on `CURRENT_RAW`.

That single node serves three functions:

- **ADC current** — filtered by 1 kΩ/100 nF into `ADC_CURRENT`.
- **Commutation tacho** — the AC ripple is tapped *before* the ADC filter, AC-coupled
  around a mid-rail reference, band-pass amplified by a `TLV9001`, and squared up by the
  spare `LMV393` channel into `COMM_TACHO_N`. The commutation band is 20–40 Hz at
  0.7–3.0 mA of ripple. Measured full-stroke counts on the qualified actuator: **659
  closing, 1048 opening**. This replaces the rev3.1 BEMF frontend, which was removed.
- **Rail overcurrent backstop** — a comparator on the unfiltered node trips at 2.8 V,
  i.e. 280 mA nominal (267–293 mA worst case).

Per-bridge current regulation uses 1 Ω xISEN resistors against the DRV8411's 200 mV
reference, giving a 178–232 mA ceiling. Both limits are **board-protection backstops**:
the actuator draws 14–19 mA running and peaks at 33–50 mA on the closing stop, and
firmware caps at 100 mA. Neither can engage in normal operation.

### Safety chain

```text
driver faults + rail overcurrent + TPS2553 fault -> async fault latch -> shutdown
```

- **Fault latch** — `74LVC1G74`. Powers up disarmed. **Firmware cannot clear a fault.**
- **No hardware runtime cutoff.** Rev3.2-B carried a `74HC4060` max-on-time timer; it is
  removed by hazard assessment (`actuator_overrun_hazard`). An over-driven actuator strips
  its own gears in the opening direction only, a parted head releases the pin to full flow
  with the seal still in the manifold, and the loop cannot exceed the mixing-valve supply
  temperature — so worst case is one actuator, self-announcing. The timer also collided
  with learning mode, which needs 43–85 s to find both end stops against a 56–86 s cutoff.
  Actuator travel is bounded by the **firmware runtime limit** and tacho stall evidence.
- **USB input limiter** — `TPS2553-1`, 1.0–1.172 A, **latch-off**. An input fault
  removes power from the ESP32 too, so the failure is silent and needs a physical
  replug.

### Rev3.2 GPIO map

Authoritative source: [`hardware/lune-v6-rev3.2/design-contract.json`](hardware/lune-v6-rev3.2/design-contract.json).

| GPIO | Pad | Signal | Function |
|------|-----|--------|----------|
| 1 | 39 | `ADC_TACHO` | amplified commutation ripple (ADC1_CH0) |
| 2 | 38 | `ADC_CURRENT` | shared current sense, filtered (ADC1_CH1) |
| 21 | 23 | `I2C_SDA` | I2C data, `J21` display pads, 4k7 pull-up `R16` |
| 47 | 24 | `I2C_SCL` | I2C clock, `J21`, 4k7 pull-up `R17` |
| 18 | 11 | `MOTOR_ENABLE` | drive enable (safe level = 0) |
| 11 | 19 | `MOTOR_ADDR1` | decoder address bit 1 |
| 12 | 20 | `MOTOR_ADDR0` | decoder address bit 0 |
| 13 | 21 | `MOTOR_ADDR3` | decoder address bit 3 (was `MOTOR_TERM_DIR`) |
| 14 | 22 | `MOTOR_ADDR2` | decoder address bit 2 |
| 16 | 9 | `LATCH_STATE` | armed / not armed readback |
| 17 | 10 | `LATCH_ARM` | edge-coupled arm clock |
| 19 / 20 | 13 / 14 | `USB_DM` / `USB_DP` | native USB |
| 38 | 31 | `COMM_TACHO_N` | commutation pulses, open-drain |
| 8 | 12 | `ONEWIRE_MCU` | DS18B20 bus; declared ADC1 exception |
| 43 / 44 | 37 / 36 | `UART_TX_MCU` / `UART_RX_MCU` | ROM console; 1 k `R53`/`R54` in series to `J22`, where the nets become `UART_TX_DBG` / `UART_RX_DBG` |
| 4 | 4 | `STATUS_LED_N` | status LED, **active low**; declared ADC1 exception |

GPIO 0, 3, 19, 20, 45 and 46 are contractually forbidden for motor control. Module pads
28–30 (`IO35`–`IO37`) are consumed by the octal PSRAM and unavailable on an N8R8.

The two ADCs sit on the module's **east** side because ADC1 is `GPIO1`–`GPIO10` and ADC2
is unusable while WiFi runs — pads 38/39 are the only ADC-capable pins there. That leaves
the west side to the USB pair. `GPIO5`, `GPIO6`, `GPIO7`, `GPIO9` and `GPIO10` are the
spare ADC1 channels, and `GPIO15` (pad 8) is free after rev3.2-H. Two ADC1 channels are
deliberately spent on digital: `GPIO4` on `STATUS_LED_N` (rev3.2-G) and `GPIO8` on
`ONEWIRE_MCU` (rev3.2-H). Both are declared in `adc1_digital_exceptions` and printed by
`check_design.py` on every run.

### External connections

- **6 × RJ9/4P4C** motor outputs on the bottom edge, 12.25 mm pitch.
- **1-Wire daisy chain** on terminal block `J20` (`+3V3_EXT`, `ONEWIRE_BUS`, `GND`) for
  manifold supply and return temperature, with a 33 Ω series resistor and 4.7 kΩ pull-up.
  Sensor addresses must be bound and freshness-checked; temperature data may not bypass
  motor safety.
- **Display** — unpopulated I2C pads, no on-board bus pull-ups. Not populated by default.
- **Status LED** — a single green LED, active low. It is *not* an RGB/WS2812 part.

## Migration status

`lune.yaml` still declares `motor_hardware_backend: drv8215_i2c` with
`motor_addresses: [0x30 … 0x35]`. Rev3.2 has no I2C motor driver at all — channel select
is the one-hot decoder. The pin map is partly migrated:

| `lune.yaml` substitution | Declares | Rev3.2 target | Action |
|---|---|---|---|
| `pin_motor_addr0/1/2` | 10 / 11 / 12 | `MOTOR_ADDR0/1/2` — **12 / 11 / 14** | ❌ **reordered**: addr0 10→12, addr2 12→14 |
| `pin_motor_direction` | 14 | `MOTOR_ADDR3` — **13** | ⚠️ **rename + move + re-encode**: bit 3 is no longer the direction, and no bit is — see `decoder.channel_address_map` for the 12-entry table. |
| `pin_latch_arm` | 16 | `LATCH_ARM` — **17** | ❌ **16 → 17** (swapped with `LATCH_STATE`) |
| `pin_i2c_sda` / `pin_i2c_scl` | 8 / 9 | `I2C_SDA` / `I2C_SCL` — 8 / 9 | ✅ keep |
| `pin_rgb_status_led` | 48 | `STATUS_LED_N` — **4** | ❌ **48 → 4** (rev3.2-G), and **not an RGB part** — active-low single LED. Note GPIO4 is still declared as `pin_nfault`, which this table already marks for deletion; delete it in the same edit or GPIO4 lands twice. |
| `pin_adc_current` | 7 | `ADC_CURRENT` — **2** | ❌ **7 → 2** |
| `pin_adc_bemf` | 5 | `ADC_TACHO` — **1** | ❌ **5 → 1**, and rename: BEMF frontend was removed |
| `pin_onewire` | 12 | `ONEWIRE_MCU` — **8** | ❌ **12 → 8** (rev3.2-H); 12 is now `MOTOR_ADDR0` |
| `pin_nsleep` | 6 | — | ❌ **delete**; replaced by `MOTOR_ENABLE` on **18** |
| `pin_nfault` | 4 | — | ❌ **delete**; rev3.2 exposes no raw-fault GPIO |
| `motor_hardware_backend` | `drv8215_i2c` | one-hot decoder | ❌ **replace** |
| `motor_addresses` | `[0x30 … 0x35]` | — | ❌ **delete**; no I2C motor driver exists |
| — | not declared | `MOTOR_ENABLE` — **18** | ➕ **add** |
| — | not declared | `LATCH_STATE` — **16** | ➕ **add** |
| — | not declared | `COMM_TACHO_N` — **38** | ➕ **add** (PCNT/RMT capture) |

Spare after rev3.2-H: **5**, **6**, **7**, **9**, **10** (all ADC1) and **15**. GPIO **4**
and **8** were freed by the analog move but are now spent on `STATUS_LED_N` and
`ONEWIRE_MCU`, both declared exceptions.

**GPIO 12 is assigned twice** in `lune.yaml` — to both `pin_onewire` and
`pin_motor_addr2`. On rev3.2 GPIO 12 is `MOTOR_ADDR0` and 1-Wire moves to GPIO 8.

**GPIO 8 is also `pin_i2c_sda` today.** The row above marks I2C for a move to 21/47; that
edit and the 1-Wire move must land together or GPIO 8 lands twice.

## Repository Layout

```text
lune-v6/
├── lune.yaml            # Main ESPHome firmware config
├── components/          # Custom ESPHome external components
│   ├── lv6_config_store/
│   ├── lv6_dashboard/
│   ├── lv6_valve_controller/
│   └── lv6_zone_controller/
├── configurations/      # Per-revision and variant configs
├── hardware/            # KiCad schematics, design contract, review docs
├── web/                 # Local dashboard sources
├── docs/
├── README.md
└── changelog.md
```

## What Is In The Firmware

- ESPHome on ESP-IDF
- Custom C++ external components for config storage, valve control, zone control and the
  local dashboard
- Native ESPHome WiFi, API, OTA, web server, display and climate entities
- DS18B20 1-Wire temperature sensors
- SSD1306 OLED support (pads unpopulated by default)

## Quick Start

1. Edit the repo-root `secrets.yaml` with your WiFi, API, OTA and optional MQTT values.
   The V6 Makefile creates an ignored `configurations/secrets.yaml` symlink automatically
   when the root secrets file exists.
2. Replace the placeholder DS18B20 addresses in `lune.yaml` after first discovery.
3. Build or deploy from the repo root.

```bash
make build
make deploy
make logs
```

USB flashing explicitly:

```bash
make deploy PORT=/dev/cu.usbmodemXXXX
```

OTA to a specific host:

```bash
make ota HOST=192.168.1.50
```

The root and device `Makefile`s automatically use `.venv313/` or `.venv/` from the repo
root when present.

Direct ESPHome commands still work:

```bash
esphome run lune-v6/configurations/lune-ble.yaml
esphome config lune-v6/configurations/lune-ble.yaml
```

## Notes

- `secrets.yaml` is kept at the repository root as a local template and remains
  gitignored.
- Device-local commands can be run with `make -C lune-v6 <target>`.
- Only one motor may run at a time. On rev3.2 this is enforced in hardware by the one-hot
  decoder, not by firmware convention.

## Documentation

- [../docs/lune_brand_architecture.md](../docs/lune_brand_architecture.md)
- [../docs/lune_touch_build_plan.md](../docs/lune_touch_build_plan.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/lv6_api_v1.md](docs/lv6_api_v1.md) — local dashboard API
- [docs/endstop_detection.md](docs/endstop_detection.md)
- [docs/esp32_ripple_spec_strict.md](docs/esp32_ripple_spec_strict.md) — commutation
  ripple capture requirements
- [docs/hydraulic_commissioning.md](docs/hydraulic_commissioning.md)
- [docs/esp32-s3_ufh_pcb_solution.md](docs/esp32-s3_ufh_pcb_solution.md)
- [hardware/lune-v6-rev3.2/architecture.md](hardware/lune-v6-rev3.2/architecture.md) —
  rev3.2 design rationale
- [hardware/lune-v6-rev3.2/design-review.md](hardware/lune-v6-rev3.2/design-review.md)
- [hardware/lune-v6-rev3.2/validation-plan.md](hardware/lune-v6-rev3.2/validation-plan.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed
  motor control and current-based endstop detection for Homematic HmIP-VDMOT valve
  actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by
  nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by
  Yi Yao — back-EMF tachometer circuit design

Rev3.2 derives position from commutation ripple on the shared current sense rather than
from BEMF, but these designs shaped the approach.

## License

See [../LICENSE](../LICENSE).
