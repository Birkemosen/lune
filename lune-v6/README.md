# Lune V6

ESPHome firmware for **Lune V6**, a 6-zone hydronic underfloor-heating
manifold controller.

Lune V6 is the local manifold node in the Lune product line. It owns valve motion,
endstop detection, local temperature inputs, minimum-flow protection, motor fault
handling, and conservative fail-safe heating.

Some firmware entrypoint filenames, including `lune.yaml`, remain for configuration
compatibility; the Lune V6 component directories and internal names use the `lv6` prefix.

This folder is ESPHome-only. The legacy PlatformIO and ESP-IDF source tree has been
removed.

## Hardware Revisions

| Revision | Status | Motor drive |
|----------|--------|-------------|
| [`rev3.0`](hardware/lune-v6-rev3.0/) | superseded | — |
| [`rev3.1-lean`](hardware/lune-v6-rev3.1-lean/) | superseded | 6× DRV8215 over I2C |
| [**`rev3.3`**](hardware/lune-v6-rev3.3/) | **current** — `lune.yaml` → `lune-v6-rev33.yaml` / `rev33_gpio` | 3× DRV8411 + hardware one-hot; firmware-held `DRIVER_N_SLEEP` |

The firmware entrypoint (`configurations/lune-v6.yaml` → `lune.yaml`) includes
`packages/board/lune-v6-rev33.yaml`. See
[`hardware/lune-v6-rev3.3/firmware-integration.md`](hardware/lune-v6-rev3.3/firmware-integration.md).
The image is for Rev 3.3 only: at boot the controller checks for the Rev 3.3 fault-net
pull-ups and refuses to drive any motor on a board that does not have them.

## Rev3.3 Board

Authoritative hardware docs live under
[`hardware/lune-v6-rev3.3/`](hardware/lune-v6-rev3.3/) (design contract ECO
`rev3.3-P`, EasyEDA project). Two-layer board, target outline **90 × 72 mm**,
ESP32-S3-WROOM-1-N8R8 (8 MB flash, 8 MB octal PSRAM), USB-C powered, six RJ9 valve
channels.

> **The 85 °C ambient rating is conditional.** R8 modules are rated −40 ~ 65 °C unless
> PSRAM ECC is enabled, which needs `CONFIG_SPIRAM_ECC_ENABLE=y` **and**
> `CONFIG_SPIRAM_MODE_OCT=y`. Neither is set today. The **Free PSRAM** sensor is the
> proof: ~7680 kB means ECC is on and the 85 °C applies; ~8192 kB means it is not.
> See `module_temperature_rating` in
> [`hardware/lune-v6-rev3.3/design-contract.json`](hardware/lune-v6-rev3.3/design-contract.json).

### Motor drive

Six 3.3 V H-bridge channels from **three `DRV8411PWPR` dual drivers**. Channel selection
is a **hardware one-hot** `74HC4514` 4-to-16 decoder, so only one bridge can ever be
active — the address is latched while driving, and firmware cannot select two motors at
once. `DRV8410PWPR` is the nominated second source - pin-compatible including the NC
pins 11/14, so no extra capacitors - but it is not stocked at LCSC.

The actuators are Homematic IP VdMot on Danfoss RA-N adapters, wired over 4P4C/RJ9.

### Current sense and position

All six channels share one high-side sense chain: a 0.5 Ω shunt and an `INA180A1` at
×20, giving **10 V/A** on `CURRENT_RAW`.

That single node serves three functions:

- **ADC current** — filtered by 1 kΩ/100 nF into `ADC_CURRENT`.
- **Commutation tacho** — the AC ripple is tapped *before* the ADC filter, AC-coupled
  around a 1.055 V reference, band-pass amplified by a `TLV9001`, and squared up by the
  spare `LMV393` channel into `COMM_TACHO_N`. The commutation band is 20–40 Hz at
  0.7–3.0 mA of ripple. Measured full-stroke counts on the qualified actuator: **659
  closing, 1048 opening**. This replaces the rev3.1 BEMF frontend, which was removed.
- **Rail overcurrent backstop** — a comparator on the unfiltered node trips at 1.5 V,
  i.e. **150 mA** nominal (142–158 mA worst case, ECO `rev3.3-P`), on its own
  `RAIL_OVERCURRENT` net.

Per-bridge current regulation uses 1 Ω xISEN resistors against the DRV8411's 200 mV
reference, giving a 178–232 mA ceiling. Both limits are **board-protection backstops**:
the actuator draws 14–19 mA running and peaks at 47–60 mA on the closing stop. Neither
can engage in normal operation.

### Safety chain

```text
driver nFAULT (FAULT_N_RAW) ─┐
rail overcurrent            ─┼─> three active-LOW GPIOs -> firmware drops DRIVER_N_SLEEP
TPS2553 fault (FAULT_USB_RAW)┘
```

- **No hardware fault latch.** The hazard decision is design-review R3.3-3. The drive
  permit is `DRIVER_N_SLEEP`, held by firmware; `R31` pulls it low, so a GPIO in high-Z
  puts the drivers to sleep and `U7`'s NAND inhibits the decoder.
- **Attributable faults.** A bridge fault, a rail overcurrent and a USB-switch fault each
  have their own net and pull-up. Firmware refuses the permit while any of them is
  asserted and withdraws it if one asserts mid-move.
- **No hardware runtime cutoff.** It was removed by hazard assessment
  (`actuator_overrun_hazard`). An over-driven actuator strips its own gears in the
  opening direction only, a parted head releases the pin to full flow with the seal
  still in the manifold, and the loop cannot exceed the mixing-valve supply temperature
  — so worst case is one actuator, self-announcing. Actuator travel is bounded by the
  **firmware runtime limit** and tacho stall evidence.
- **USB input limiter** — `TPS2553`, constant-current **auto-retry** (ECO `rev3.3-M`).
  An input fault no longer removes power; the switch regulates, asserts
  `FAULT_USB_RAW` on GPIO15 and recovers when the overload clears.

### Rev3.3 GPIO map

Authoritative source: [`hardware/lune-v6-rev3.3/design-contract.json`](hardware/lune-v6-rev3.3/design-contract.json).

| GPIO | Signal | Function |
|------|--------|----------|
| 1 | `ADC_TACHO` | amplified commutation ripple (ADC1_CH0), 6 dB |
| 2 | `ADC_CURRENT` | shared current sense, filtered (ADC1_CH1), 6 dB |
| 21 | `I2C_SDA` | I2C data, `J21` display pads, 4k7 pull-up `R16` |
| 47 | `I2C_SCL` | I2C clock, `J21`, 4k7 pull-up `R17` |
| 18 | `MOTOR_ENABLE` | per-move decoder gate (safe level = 0) |
| 12 | `MOTOR_ADDR0` | decoder address bit 0 |
| 11 | `MOTOR_ADDR1` | decoder address bit 1 |
| 14 | `MOTOR_ADDR2` | decoder address bit 2 |
| 13 | `MOTOR_ADDR3` | decoder address bit 3 (was `MOTOR_TERM_DIR`) |
| 17 | `DRIVER_N_SLEEP` | drive permit, high = awake (safe level = 0) |
| 16 | `FAULT_N_RAW` | DRV8411 nFAULT wired-AND, **active low** |
| 48 | `RAIL_OVERCURRENT` | rail overcurrent comparator, **active low** |
| 15 | `FAULT_USB_RAW` | TPS2553 fault, **active low** |
| 19 / 20 | `USB_DM` / `USB_DP` | native USB |
| 38 | `COMM_TACHO_N` | commutation pulses, open-drain |
| 8 | `ONEWIRE_MCU` | DS18B20 bus; declared ADC1 exception |
| 43 / 44 | `UART_TX` / `UART_RX` | ROM console; 1 k `R53`/`R54` in series to `J22` |
| 4 | `STATUS_LED_N` | status LED, **active low**; declared ADC1 exception |

GPIO 0, 3, 19, 20, 45 and 46 are contractually forbidden for motor control. Module pads
28–30 (`IO35`–`IO37`) are consumed by the octal PSRAM and unavailable on an N8R8.

The two ADCs sit on the module's **east** side because ADC1 is `GPIO1`–`GPIO10` and ADC2
is unusable while WiFi runs. `GPIO5`, `GPIO6`, `GPIO7`, `GPIO9` and `GPIO10` are the
spare ADC1 channels. Two ADC1 channels are deliberately spent on digital: `GPIO4` on
`STATUS_LED_N` and `GPIO8` on `ONEWIRE_MCU`. Both are declared in
`adc1_digital_exceptions` and printed by `check_design.py` on every run.

### External connections

- **6 × RJ9/4P4C** motor outputs on the bottom edge, 12.25 mm pitch.
- **1-Wire daisy chain** on terminal block `J20` (`+3V3_EXT`, `ONEWIRE_BUS`, `GND`) for
  manifold supply and return temperature, with a 33 Ω series resistor and 4.7 kΩ pull-up.
  Sensor addresses must be bound and freshness-checked; temperature data may not bypass
  motor safety.
- **Display** — unpopulated I2C pads, no on-board bus pull-ups. Not populated by default.
- **Status LED** — a single green LED, active low. It is *not* an RGB/WS2812 part.

## Firmware entrypoints

The firmware identity is `lune-v6` (WiFi/DHCP/OTA hostname `lune-v6-<mac>`).
The hardware revision is the board package, not part of the device name.

| File | Role |
|---|---|
| `configurations/lune-v6.yaml` | Firmware entrypoint (`device_name: lune-v6`) |
| `configurations/lune-v6-release.yaml` | Public release entrypoint — same firmware, no WiFi credentials |
| `packages/board/lune-v6-rev33.yaml` | Rev 3.3 PCB pins, `rev33_gpio` motor backend, status LED |
| `packages/board/esp32-s3.yaml` | ESP32-S3-WROOM-1-N8R8 (8 MB flash, octal PSRAM) |

```sh
make config
make build
```

`make build` and `make deploy` auto-increment a development build suffix (`v1.0.0-1`,
`v1.0.0-2`, …). A release binary drops that suffix:

```sh
make release
make release VERSION=v1.1.0
make release-deploy HOST=192.168.x.x
```

`make release-firmware VERSION=v1.1.0` builds the publishable bundle instead —
see [Flashing and updates](#flashing-and-updates).

### `rev33_gpio` backend

There is no I2C motor driver on rev3.3 — channel select is the hardware one-hot
decoder — so `motor_addresses` is inert under `rev33_gpio`. The component rejects the
Rev 3.1 options (`adc_bemf_pin`, `direction_pin`, `bemf_threshold_raw`,
`latch_arm_pin`), requires `driver_nsleep_pin`, `rail_overcurrent_pin` and
`fault_usb_pin`, rejects duplicate or contractually forbidden motor GPIO, and requires
`ipropi_pin` and `adc_tacho_pin` to be on ADC1.

### Endstop detection on rev3.3

Closing is four mechanical phases and two of them — pin contact and the hard stop — look
nearly identical in the current domain. Rev 3.3 separates them on **whether the rotor
recovers**, which is magnitude-independent and therefore works just as well on the gentle
opening stop where the current barely moves. Opening's endstop is the motor's own gear
train bottoming out: a smaller resistance than pop-off, and the direction the contract
names as the damaging one.

- One ADC1 DMA stream carries `ADC_CURRENT` and `ADC_TACHO`, both at 6 dB, at 10 kHz
  each.
- The absolute current cap is evaluated on a DMA frame peak and acted on at 1 ms rather
  than 20 ms — that margin is force into a rigid stop.
- The stall verdict scales with the observed commutation cadence: ~150 ms instead of a
  fixed 750 ms, inside E-08's 250 ms bound.
- `ADC_TACHO` gets an independent `RippleCounter`, so PCNT's missed/false-edge rate is
  computable on-device — § 2 of the validation plan's release gate.

See [`docs/endstop_detection.md`](docs/endstop_detection.md) and
[`hardware/lune-v6-rev3.3/firmware-integration.md`](hardware/lune-v6-rev3.3/firmware-integration.md).

### Still open on rev3.3

- Automatic startup calibration is **off**. Every current threshold, stroke time and
  commutation count is a bring-up value.
- PCNT's glitch filter tops out near 12 µs, so the contract's 200 µs minimum-width
  rejection is not implemented. The 10 kHz `ADC_TACHO` stream makes it measurable
  whether that matters.
- Soft-approach does not exist — there is no duty control to reduce. Detection speed is
  the pop-off protection.

## Repository Layout

```text
lune-v6/
├── lune.yaml            # Main ESPHome firmware config
├── components/          # Custom ESPHome external components
│   ├── lv6_config_store/
│   ├── lv6_dashboard/
│   ├── lv6_valve_controller/
│   └── lv6_zone_controller/
├── configurations/      # Firmware and release entrypoints
├── hardware/            # EasyEDA project, design contract, review docs
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

1. Copy the repo-root [`secrets.yaml.example`](../secrets.yaml.example) to
   `secrets.yaml` and fill in your WiFi, API, OTA and optional MQTT values.
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
esphome run lune-v6/configurations/lune-v6.yaml
esphome config lune-v6/configurations/lune-v6.yaml
```

## Flashing And Updates

Published binaries are attached to [GitHub Releases](https://github.com/birkemosen/lune/releases).
Each release carries three assets:

| Asset | Use |
|---|---|
| `lune-v6-<version>.factory.bin` | **First flash only**, over USB. Full image: bootloader, partition table and application. |
| `lune-v6-<version>.ota.bin` | Every update after the first flash. Application image only. |
| `manifest-lune-v6.json` | ESP-Web-Tools install manifest and the source for the device's own **Firmware Update** entity. |

### First flash — USB

A blank board needs the factory image, because the OTA image contains no
bootloader or partition table:

```bash
esptool --port /dev/cu.usbmodemXXXX write_flash 0x0 lune-v6-<version>.factory.bin
```

Then join the **Lune V6 Setup** access point and enter WiFi credentials in the
captive portal. Release images deliberately ship without WiFi credentials (see
[Release builds](#release-builds)), so the device always starts in setup mode
and never overwrites credentials you have already provisioned.

### After the first flash — OTA

Never re-flash the factory image over USB to update: it rewrites the whole
flash and takes the stored WiFi credentials and NVS configuration with it. Use
one of the OTA paths instead:

- **Managed update (recommended).** The device polls
  `releases/latest/download/manifest-lune-v6.json` and exposes a **Firmware
  Update** entity; installing pulls the `.ota.bin` itself. The dashboard drives
  the same flow through the `firmware_check` / `firmware_prepare` /
  `firmware_install` commands.
- **Manual upload.** `POST` the `.ota.bin` to `http://<device>/update` (the
  `web_server` OTA platform on `web_server_base`; the stock ESPHome web UI is
  not in the firmware).
- **From this repository.** `make ota HOST=<device>` builds and uploads your own
  firmware over the ESPHome native OTA transport.

> Back up your settings before every update. Download
> `http://<device>/api/v1/settings/export` and keep the file; it restores
> through `POST /api/v1/settings/import` if a configuration migration goes
> wrong. `http://<device>/api/v1/logs/download` captures the device log ring
> for a bug report — it is RAM-only and lost on reboot.

An OTA boot is only marked good after a 60 s settle window (`safe_mode`), so a
firmware that crashes during startup rolls back to the previous image instead of
leaving the manifold unattended. Check the **Reset Reason** diagnostic sensor
afterwards to tell a clean OTA restart from a panic or brownout.

### Release builds

```bash
make release-firmware VERSION=v1.2.3
```

This stamps `version.yaml`, compiles `configurations/lune-v6-release.yaml`, and
writes the renamed images plus `manifest-lune-v6.json` to the gitignored
`lune-v6/dist/`. `.github/workflows/build-release-firmware.yml` runs the same
target when a GitHub release is created and uploads the three assets to it.

The release entrypoint differs from `configurations/lune-v6.yaml` in one way: it
uses `packages/network/wifi-release.yaml` and `!remove`s the `!secret`-backed
station block, leaving the setup AP and captive portal. A public image therefore
carries no build-host credentials and cannot overwrite a user's provisioned WiFi.

Everything else still resolves from `secrets.yaml` at build time, and CI supplies
placeholders. Consequently the published images carry a placeholder native-API
encryption key and ESPHome OTA password: Home Assistant native-API pairing and
`esphome upload` against a released binary require building the firmware
yourself from this repository.

## Notes

- `secrets.yaml` lives at the repository root and is gitignored;
  `secrets.yaml.example` is the committed template.
- Device-local commands can be run with `make -C lune-v6 <target>`.
- Only one motor may run at a time. On rev3.3 this is enforced in hardware by the one-hot
  decoder, not by firmware convention.

## Documentation

- Brand architecture (private): `Birkemosen/lune-coordinator` → `docs/lune_brand_architecture.md`
  (stub: [../docs/lune_brand_architecture.md](../docs/lune_brand_architecture.md))
- [../docs/lune_touch_build_plan.md](../docs/lune_touch_build_plan.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/lv6_api_v1.md](docs/lv6_api_v1.md) — local dashboard API
- [docs/external_room_temperature.md](docs/external_room_temperature.md) — HTTP EXTERNAL ingest
- [docs/endstop_detection.md](docs/endstop_detection.md)
- [docs/esp32_ripple_spec_strict.md](docs/esp32_ripple_spec_strict.md) — commutation
  ripple capture requirements
- [docs/hydraulic_commissioning.md](docs/hydraulic_commissioning.md)
- [docs/esp32-s3_ufh_pcb_solution.md](docs/esp32-s3_ufh_pcb_solution.md)
- [hardware/lune-v6-rev3.3/design-review.md](hardware/lune-v6-rev3.3/design-review.md)
- [hardware/lune-v6-rev3.3/validation-plan.md](hardware/lune-v6-rev3.3/validation-plan.md)
- [hardware/lune-v6-rev3.3/firmware-integration.md](hardware/lune-v6-rev3.3/firmware-integration.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed
  motor control and current-based endstop detection for Homematic HmIP-VDMOT valve
  actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by
  nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by
  Yi Yao — back-EMF tachometer circuit design

Rev 3.3 derives position from commutation ripple on the shared current sense rather than
from BEMF, but these designs shaped the approach.

## License

Firmware: [GPL-3.0-or-later](../LICENSE). Hardware design in
[`hardware/`](hardware/): [CC BY-NC-SA 4.0](hardware/LICENSE), non-commercial. See the
[root README](../README.md#license).
