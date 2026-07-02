# Waveshare ESP32-S3-Touch-LCD-7B Notes

Hardware reference for the first Lune Touch prototype.

Sources:

- Product documentation: https://docs.waveshare.com/ESP32-S3-Touch-LCD-7B
- Waveshare wiki mirror: https://www.waveshare.com/wiki/ESP32-S3-Touch-LCD-7B

## Board

- Module: ESP32-S3-WROOM-1-N16R8 class target
- Flash: 16 MB
- PSRAM: 8 MB
- LCD: 7-inch IPS RGB panel, 1024 x 600
- Touch: GT911 capacitive touch, I2C, up to 5 points
- I2C bus: GPIO8 SDA, GPIO9 SCL
- IO expander: CH422G on the shared I2C bus

## RGB LCD Wiring

| RGB signal | ESP32-S3 GPIO |
|---|---:|
| B3 / DATA0 | 14 |
| B4 / DATA1 | 38 |
| B5 / DATA2 | 18 |
| B6 / DATA3 | 17 |
| B7 / DATA4 | 10 |
| G2 / DATA5 | 39 |
| G3 / DATA6 | 0 |
| G4 / DATA7 | 45 |
| G5 / DATA8 | 48 |
| G6 / DATA9 | 47 |
| G7 / DATA10 | 21 |
| R3 / DATA11 | 1 |
| R4 / DATA12 | 2 |
| R5 / DATA13 | 42 |
| R6 / DATA14 | 41 |
| R7 / DATA15 | 40 |
| HSYNC | 46 |
| VSYNC | 3 |
| DE | 5 |
| PCLK | 7 |

Panel profile:

- Resolution: 1024 x 600
- RGB data width: 16 bit
- Pixel format: RGB565
- Waveshare demo pixel clock: 30 MHz
- Active ESPHome stability pixel clock: 30 MHz
- PCLK active edge: falling edge
- 7B demo timing:
  - HSYNC pulse/back/front: 162 / 152 / 48
  - VSYNC pulse/back/front: 45 / 13 / 3

## Touch And Expander Lines

| Signal | Pin |
|---|---|
| GT911 SDA | GPIO8 |
| GT911 SCL | GPIO9 |
| GT911 interrupt | GPIO4 |
| GT911 reset | CH422G EXIO1 |
| LCD backlight enable | CH422G EXIO2 |
| LCD VDD / VCOM enable | CH422G EXIO6 |

The older non-`B` 7-inch profile is 800 x 480. Do not reuse its dimensions for
this board; it leaves the right side of the 1024 x 600 panel outside the drawn
area.

Waveshare's 7B demo uses an IO-extension command protocol at I2C address `0x24`
(`0x02` mode, `0x03` output, `0x04` input, `0x05` PWM). This is different from
the register-address CH422G style used by the older 4.3-inch reference code.

The 7B LCD demo sets all IO-extension pins to output mode, initializes the RGB
panel with no reset GPIO and no RGB `disp_gpio_num`, then turns on backlight by
setting EXIO2 high. In the ESPHome profile, EXIO6 (`LCD_VDD_EN`) is kept high by
the IO-extension output shadow and EXIO2 (`DISP`) is the display `enable_pin`.
EXIO5 is kept low in the output shadow so USB mode remains selected instead of
CAN mode.

For the native ESP-IDF display/coordinator stack, prefer these managed
components:

```yaml
dependencies:
  lvgl/lvgl: ">=9.5.0"
  espressif/esp_lcd_touch_gt911: ">=1.1.3"
  espressif/esp_websocket_client: ">=1.1.0"
```

The current ESPHome bringup still uses ESPHome's built-in `lvgl:` integration,
which generates a PlatformIO `lvgl/lvgl@8.4.0` dependency. Do not force
`lvgl/lvgl >=9.5.0` into this ESPHome profile without migrating the UI layer
away from ESPHome's LVGL bindings, because LVGL 8 and LVGL 9 APIs are not
compatible.
