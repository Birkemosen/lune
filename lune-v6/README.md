# Lune V6

ESPHome firmware for **Lune V6**, the Birkemosen 6-zone hydronic
underfloor-heating manifold controller, built on ESP32-S3 with 6 DRV8215 I2C
motor drivers.

The repository is now hosted as [`Birkemosen/lune`](https://github.com/Birkemosen/lune).
Some firmware entrypoint filenames, including `lune.yaml`, remain for
configuration compatibility; the Lune V6 component directories and internal
names use the `lv6` prefix.

Lune V6 is the local manifold node in the Lune product line. It owns valve
motion, endstop detection, local temperature inputs, minimum-flow protection,
motor fault handling, and conservative fail-safe heating. Whole-house learning
and optimization belongs in the future Lune Touch / Lune Mini coordinator.

This hardware folder is ESPHome-only. The legacy PlatformIO and ESP-IDF source tree has
been removed.

## Repository Layout

```text
devices/lune-v6/
├── lune.yaml   # Main ESPHome firmware config for Lune V6
├── components/        # Custom ESPHome external components
│   ├── lv6_config_store/
│   ├── lv6_valve_controller/
│   └── lv6_zone_controller/
├── docs/
├── README.md
└── changelog.md
```

## What Is In The Firmware

- ESPHome on ESP-IDF
- 6-zone valve control with DRV8215 over I2C
- Custom C++ external components for config storage, valve control, and zone control
- Native ESPHome WiFi, API, OTA, web server, display, and climate entities
- DS18B20 1-Wire temperature sensors
- SSD1306 OLED support
- WS2812 status LED

## Hardware Mapping

| GPIO | Function |
|------|----------|
| GPIO1 | Motor current sense ADC |
| GPIO2 | DRV8215 nSLEEP |
| GPIO7 | DRV8215 nFAULT |
| GPIO8 | I2C SDA |
| GPIO9 | I2C SCL |
| GPIO12 | 1-Wire bus |
| GPIO48 | WS2812 status LED |

### DRV8215 Addresses

| Zone | Address |
|------|---------|
| 1 | 0x30 |
| 2 | 0x31 |
| 3 | 0x32 |
| 4 | 0x35 |
| 5 | 0x33 |
| 6 | 0x34 |

Only one motor should run at a time because current sensing is shared.

## Quick Start

1. Edit the repo-root `secrets.yaml` with your WiFi, API, OTA, and optional MQTT values.
   The V6 Makefile creates an ignored `configurations/secrets.yaml` symlink automatically
   when the root secrets file exists.
2. Replace the placeholder DS18B20 addresses in `lune.yaml` after first discovery.
3. Build or deploy from the repo root.

Preferred workflow:

```bash
make build
make deploy
make logs
```

If you want USB flashing explicitly:

```bash
make deploy PORT=/dev/cu.usbmodemXXXX
```

If you want OTA to a specific host/IP:

```bash
make ota HOST=192.168.1.50
```

The root and device `Makefile`s automatically use `.venv313/` or `.venv/` from the repo
root when present.

Direct ESPHome commands still work:

```bash
esphome run devices/lune-v6/configurations/lune-ble.yaml
```

For config validation only:

```bash
esphome config devices/lune-v6/configurations/lune-ble.yaml
```

## Notes

- `secrets.yaml` is kept at the repository root as a local template and remains gitignored.
- Device-local commands can be run with `make -C devices/lune-v6 <target>`.

## Documentation

- [../docs/lune_brand_architecture.md](../docs/lune_brand_architecture.md)
- [../docs/lune_touch_build_plan.md](../docs/lune_touch_build_plan.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/esp32-s3_ufh_pcb_solution.md](docs/esp32-s3_ufh_pcb_solution.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed motor control and current-based endstop detection for Homematic HmIP-VDMOT valve actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by Yi Yao — back-EMF tachometer circuit design

## License

See [../../LICENSE](../../LICENSE).
