# Rev 3.0 pinout and electrical-limit audit

Audit date: 2026-08-07. This is a schematic-release checklist, not substitute
evidence for prototype measurements or PCB DRC.

## Verified interfaces

| Part / circuit | Datasheet result | Schematic result |
|---|---|---|
| ESP32-S3-WROOM-1-N8R8 | Module pins 4/5 are GPIO4/5 ADC1; 8-10 are GPIO15-17; 12 is GPIO8; 13/14 are native USB D-/D+; 17-22 are GPIO9-14; 24/25 are GPIO47/48; 35-37 are GPIO42/44/43. | Physical module pins and `design-contract.json` GPIO numbers agree. GPIO0 is boot-only and GPIO3/45/46 do not control motors. |
| ESP32 `CHIP_PU` | Espressif recommends 10k pull-up and 1uF delay; minimum stable-rail and reset-low time is 50us. | R8=10k and C12=1uF. Reset switch pulls the node low. |
| TPS2553DBVR-1 | DBV pins: 1 IN, 2 GND, 3 EN, 4 nFAULT, 5 ILIM, 6 OUT. TPS2553 EN is active high; `-1` means latch-off. 23.7k gives 1.000A minimum and about 1.172A maximum current limit. | Pin mapping and always-on EN are correct. Upstream overload remains latched until input power is cycled. |
| SY8089AAAC | Pins: 1 EN, 2 GND, 3 LX, 4 IN, 5 FB; nominal FB reference 0.6V. | Pin mapping is correct. 453k/100k gives approximately 3.32V nominal. |
| AP2112K-3.3 | SOT-25 pins: 1 VIN, 2 GND, 3 EN, 4 NC, 5 VOUT. | Pin mapping is correct. EN is pulled to protected VBUS and output has 10uF plus bulk capacitance. Thermal performance remains a prototype gate. |
| DRV8833PWP | Pins 1-17 match TI PWP pinout. xISEN trip is 160/200/240mV and wake time is at most 1ms. nFAULT is open-drain and nSLEEP has an internal pulldown. | All four drivers map correctly. 1R 1% gives 200mA nominal and at most about 242.5mA. Firmware must wait 2ms after arming before drive. |
| INA180A1 | Pins: 1 OUT, 2 GND, 3 IN+, 4 IN-, 5 VS; A1 gain is 20. | IN+ is on regulator side and IN- on motor-load side of RSH1. Positive motor current produces a positive output. |
| LMV393 | Input common-mode is guaranteed only through `VCC - 0.7V`; outputs are open-drain. | U34 is powered from protected 5V, so its 2.8V current threshold remains valid. Both outputs are pulled up only to 3.3V. |
| TLV9004 | Quad SOIC pinout matches MCP6004; inputs and outputs are rail-to-rail at 3.3V. | All four units and supply pins match. The fourth channel is a unity-gain biased spare. |
| 74HC238 | Pins 4/5 are active-low enables and pin 6 is active-high; outputs are mutually exclusive. | `MOTOR_ENABLE_N`, direction gate, and `DRIVE_PERMIT` implement the intended truth table. |
| 74HC4051 | Channel pins are 13,14,15,12,1,5,2,4 for channels 0-7; address pins are 11,10,9. | Motor channel ordering matches both decoders. Motor nodes reach the mux only through 47k series resistors. |
| SN74HC74 | Pins 1-6 are active-low clear, D, clock, active-low preset, Q and inverted Q. | Q is `DRIVE_PERMIT`; inverted Q is `LATCH_STATE`. Therefore `LATCH_STATE=1` means disarmed/faulted. |
| 2N7002 | SOT-23 pins are gate, source, drain. | Gate senses `MOTOR_ENABLE`, source is GND, and drain clamps `ARM_CLK`; arming while enabled is blocked. |
| BAT54S ADC clamps | Pins are 1 anode, 2 cathode and 3 series common. | Pin 1 is GND, pin 2 is 3.3V analog and pin 3 is the ADC node: both clamp directions are correct. |
| OneWire TVS | KiCad `Device:D` and SOD-323 use pin 1 as cathode and pin 2 as anode. | D5 pin 1 is `ONEWIRE_BUS` and pin 2 is GND. Part is frozen as Nexperia PESD3V3U1UA,115 / C403915. |
| Status LED | KiCad LED pin 1 is cathode and pin 2 is anode. | GPIO48 sinks the cathode; 3.3V feeds the anode through 1k. Reset/high-Z state is off. |
| USBLC6-4 motor ESD | Pins 1/3/4/6 are I/O1-4, pin 2 is GND and pin 5 is VBUS/reference. The part provides four rail-steering cells and an internal TVS. | U40-U43 each clamp one DRV8833's four outputs to GND and `+3V3_MOTOR`; no normal motor current is routed through the array. |

## Limit stack-up

- DRV8833 maximum regulated bridge current: `240mV / (1R * 0.99)` =
  approximately 242.5mA.
- Rail comparator nominal: `2.8V / (20 * 0.5R)` = 280mA.
- First-order resistor, shunt, gain, supply and comparator-offset stack-up:
  approximately 267-293mA. The lower rail-trip bound is more than 10% above
  the maximum bridge regulation current.
- TPS2553 input-current window with 23.7k ILIM: approximately 1.00-1.172A.
- BEMF differential gain including each 47k motor-tap resistor:
  `47k / (47k + 53.6k)` = 0.4672. Nominal full-scale output is
  0.108-3.192V; independent 1% resistor corners are approximately
  0.060-3.240V before amplifier errors.

These calculations define prototype acceptance windows, not production
calibration constants.

## Open before routed release

- Replace generator-only multi-unit symbols or save through KiCad so ERC has
  zero warnings as well as zero errors.
- Freeze exact LCSC numbers for remaining small passives, OneWire terminal
  blocks, and mechanical hardware.
- Confirm AP2112 junction temperature at worst valid duty and fault clearing.
- Measure input inrush into the 220uF motor bulk capacitor against TPS2553
  latch-off behaviour.
- Prove the populated USBLC6-4 motor-terminal ESD/EFT path and the 10uC
  logic/analog injection limit with representative cables.
- Validate BEMF polarity, approximately 33mV tacho hysteresis, and current/BEMF
  endpoint separation on the actuator population before freezing thresholds.

## Primary references

- ESP32-S3-WROOM-1/-1U datasheet: <https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf>
- Espressif hardware guideline: <https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html>
- DRV8833: <https://www.ti.com/lit/ds/symlink/drv8833.pdf>
- INA180: <https://www.ti.com/lit/ds/symlink/ina180.pdf>
- LMV393: <https://www.ti.com/lit/ds/symlink/lmv393.pdf>
- TLV9004: <https://www.ti.com/lit/ds/symlink/tlv9004.pdf>
- TPS2552/TPS2553 family: <https://www.ti.com/lit/ds/symlink/tps2553.pdf>
- SN74HC74: <https://www.ti.com/lit/ds/symlink/sn74hc74.pdf>
- AP2112: <https://www.diodes.com/datasheet/download/AP2112.pdf>
- SY8089AAAC: <https://datasheet.lcsc.com/lcsc/Silergy-Corp-SY8089AAAC_C78988.pdf>
- ST USBLC6-4: <https://www.st.com/resource/en/datasheet/usblc6-4.pdf>
