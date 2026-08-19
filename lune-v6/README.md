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

Two-layer board, target outline 90 × 75 mm, ESP32-S3-WROOM-1-N8R8 (8 MB flash, 8 MB
PSRAM), USB-C powered.

### Motor drive

Six 3.3 V H-bridge channels from **three `DRV8411PWPR` dual drivers**. Channel selection
is a **hardware one-hot** `74HC4514` 4-to-16 decoder, so only one bridge can ever be
active — the address is latched while driving, and firmware cannot select two motors at
once. `DRV8833PWPR` is kept as a footprint-compatible shortage substitute on DNP pads.

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
driver faults + overcurrent + timeout -> async fault latch -> persistent shutdown
```

- **Fault latch** — `74LVC1G74`. Powers up disarmed. **Firmware cannot clear a fault.**
- **Hardware runtime cutoff** — `74HC4060` timer, nominal 71.4 s, characterized window
  50–90 s. It references the latch so it bounds the whole armed window rather than a
  single move, and firmware chopping cannot reset it.
- **USB input limiter** — `TPS2553-1`, 1.0–1.172 A, **latch-off**. An input fault
  removes power from the ESP32 too, so the failure is silent and needs a physical
  replug.

### Rev3.2 GPIO map

Authoritative source: [`hardware/lune-v6-rev3.2/design-contract.json`](hardware/lune-v6-rev3.2/design-contract.json).

| GPIO | Signal | Function |
|------|--------|----------|
| 4 | `ADC_CURRENT` | shared current sense, filtered |
| 5 | `ADC_TACHO` | amplified commutation ripple |
| 8 | `I2C_SDA` | I2C data (display pads) |
| 9 | `I2C_SCL` | I2C clock (display pads) |
| 10 | `MOTOR_ADDR0` | decoder address bit 0 |
| 11 | `MOTOR_ADDR1` | decoder address bit 1 |
| 12 | `MOTOR_ADDR2` | decoder address bit 2 |
| 13 | `MOTOR_ENABLE` | drive enable (safe level = 0) |
| 14 | `MOTOR_TERM_DIR` | direction / decoder half select |
| 15 | `COMM_TACHO_N` | commutation pulses, open-drain |
| 16 | `LATCH_ARM` | edge-coupled arm clock |
| 17 | `LATCH_STATE` | armed / not armed readback |
| 19 / 20 | `USB_DM` / `USB_DP` | native USB |
| 42 | `ONEWIRE_MCU` | DS18B20 bus |
| 43 / 44 | `UART_TX_DBG` / `UART_RX_DBG` | debug UART |
| 48 | `STATUS_LED_N` | status LED, **active low** |

GPIO 0, 3, 19, 20, 45 and 46 are contractually forbidden for motor control.

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

| Firmware substitution | GPIO | Rev3.2 signal | |
|---|---|---|---|
| `pin_motor_addr0/1/2` | 10/11/12 | `MOTOR_ADDR0/1/2` | ✅ |
| `pin_motor_direction` | 14 | `MOTOR_TERM_DIR` | ✅ |
| `pin_latch_arm` | 16 | `LATCH_ARM` | ✅ |
| `pin_i2c_sda` / `pin_i2c_scl` | 8 / 9 | `I2C_SDA` / `I2C_SCL` | ✅ |
| `pin_onewire` | 12 | `MOTOR_ADDR2` | ❌ **collides with `pin_motor_addr2`** |
| `pin_nfault` | 4 | `ADC_CURRENT` | ❌ rev3.2 exposes no raw-fault GPIO |
| `pin_adc_current` | 7 | — | ❌ should be GPIO 4 |
| `pin_nsleep` | 6 | — | ❌ replaced by `MOTOR_ENABLE` on GPIO 13 |
| `pin_adc_bemf` | 5 | `ADC_TACHO` | ⚠️ right pin, BEMF frontend removed |
| `pin_rgb_status_led` | 48 | `STATUS_LED_N` | ⚠️ right pin, not an RGB part |

Not yet declared in firmware: `MOTOR_ENABLE` (13), `COMM_TACHO_N` (15), `LATCH_STATE`
(17), `ONEWIRE_MCU` (42).

**GPIO 12 is assigned twice** in `lune.yaml` — to both `pin_onewire` and
`pin_motor_addr2`. On rev3.2 that pin is `MOTOR_ADDR2` and 1-Wire moves to GPIO 42.

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
