# Rev 3.0 requirements

Keywords **shall**, **must**, and **release blocker** are normative.

## Functional requirements

| ID | Requirement | Release evidence |
|---|---|---|
| F-01 | The board shall contain an embedded ESP32 module, not a plug-in development board. | BOM and assembled PCB inspection |
| F-02 | The production module shall be ESP32-S3-WROOM-1-N8R8 with 8 MB flash and 8 MB PSRAM. | Firmware image report and module marking |
| F-03 | The PCB shall provide eight independent two-wire motor connectors. | Schematic, netlist, continuity test |
| F-04 | A six-channel SKU may omit connectors 7-8, but firmware and PCB routing shall remain eight-channel capable. | Variant BOM and configuration test |
| F-05 | The hardware shall make simultaneous drive of two motors impossible from valid static logic levels. | Decoder truth-table test |
| F-06 | Direction reversal shall pass through a disabled/coast interval of at least 1 ms. | Logic-analyser capture |
| F-07 | After raising `DRIVE_PERMIT`, firmware shall wait at least 2 ms before asserting `MOTOR_ENABLE`, covering the DRV8833 1 ms maximum wake time. | Logic-analyser capture over reset, fault recovery, and normal start |
| F-08 | `MOTOR_ADDR[2:0]` and `MOTOR_DIR` shall change only while `MOTOR_ENABLE=0`; a channel change shall have at least 1 ms disabled before and after the address transition. | Logic-analyser capture across all adjacent and multi-bit address changes |

## Endpoint and motion requirements

| ID | Requirement | Release evidence |
|---|---|---|
| E-01 | Endpoint classification shall use both load evidence and motion evidence. | Firmware test and captured waveforms |
| E-02 | Load evidence shall come from calibrated motor-rail current independent of ESP32 ADC gain assumptions. | Five-point calibration per prototype |
| E-03 | Motion evidence shall come from qualified differential BEMF/commutation events, not PWM edges or current magnitude alone. | Simultaneous BEMF, tacho, and drive capture |
| E-04 | A normal endpoint shall require stopped motion, elevated current, and a plausible learned endpoint window. | Open/close endpoint matrix |
| E-05 | The same signature outside the endpoint window shall be reported as a jam and shall not relearn position. | Mid-stroke obstruction test |
| E-06 | Low current with no motion shall be reported as disconnected/open circuit. | Disconnected-actuator test |
| E-07 | Pin engagement shall not be classified as an endpoint while qualified motion continues. | Closing engagement captures |
| E-08 | Both open and closed endpoints shall be detected within 250 ms of qualified motion cessation under the validated actuator population. | Timestamped cycle dataset |
| E-09 | No accepted position counts may be generated while the rotor is physically stalled. | Forced-stall scope and counter log |
| E-10 | Every movement shall have a direction-specific hard runtime limit independent of endpoint detection. | Fault-injection test |

## Electrical safety and stability

| ID | Requirement | Release evidence |
|---|---|---|
| S-01 | All motor-drive inputs shall default low during power-up, reset, bootloader, and ESP32 brownout. | Reset/brownout capture |
| S-02 | A hardware latch shall remove `DRIVE_PERMIT` on destructive current without firmware execution. A fault that remains active shall make re-arming electrically ineffective. | Stalled-firmware current injection and arm-during-fault test |
| S-03 | The hardware current threshold shall remain active in both directions and shall exceed measured startup and pin-engagement peaks with production margin. | Threshold sweep and population data |
| S-04 | A driver `nFAULT` event shall remove drive permission and remain visible until explicitly acknowledged. | Short-to-GND, short-to-VM, and thermal simulation |
| S-05 | Logic and motor loads shall not share the final 3.3 V regulator. | Schematic and rail transient capture |
| S-06 | ESP32 resets are not permitted during any normal move, endstop, jam, connector hot-plug, or Wi-Fi transmit test. | 10,000-cycle and RF-stress logs |
| S-07 | USB-C input shall tolerate 4.75-5.25 V and shall include ESD, controlled inrush, and an approximately 1 A input limit. | Supply sweep and inrush capture |
| S-08 | Motor terminals shall use external rail-steering ESD protection into the separate motor rail/GND, and no more than 10 uC may be injected into an ESP32 or analog rail by a motor-terminal transient. | USBLC6-4 population inspection, protection calculation and transient test |

## Reliability and production targets

| ID | Requirement | Release evidence |
|---|---|---|
| R-01 | Zero destructive overdrive events are allowed in 10,000 alternating endpoint cycles across the validation set. | Automated endurance report |
| R-02 | False normal-endpoint classification shall be below 1 per 1,000 commanded moves in the validation set. | Classified event log |
| R-03 | Missed endpoint detection shall be zero in the release dataset; any miss is a release blocker pending root cause. | Classified event log and waveform |
| R-04 | The design shall pass at 0 C, 23 C, and 50 C ambient and over the specified USB input range. | Environmental matrix |
| R-05 | The board shall have four mechanical mounting points and a defined DIN-rail enclosure interface. | Mechanical drawing and fit check |
| R-06 | PCB DRC shall have zero errors and zero unconnected items; schematic ERC exceptions shall be individually justified. | KiCad reports |
| R-07 | Five functional prototype PCBs shall be ordered for no more than 1,500 DKK landed in the EU, including PCB, assembled BOM, freight, VAT, and unavoidable import/handling charges. | Saved JLCPCB checkout quote dated no more than seven days before order |
| R-08 | The PCB shall fit JLCPCB's low-cost maximum 100 x 100 mm price band, use one SMT assembly side, and minimize unique feeder-loaded values without weakening protection or sensing. | Gerber dimensions, CPL side count, and BOM type count |
| R-09 | Every critical IC and connector shall have a valid LCSC/JLCPCB part number and sufficient stock for five boards plus rework spares at design freeze. | JLCPCB BOM match report and dated stock snapshot |
| R-10 | A full-assembly quote and an economic-assembly/DNP-module quote shall be compared before ordering. Manual module placement is acceptable only for prototypes and only with inspected ground-pad reflow. | Two saved quotes and X-ray or inspected reflow record |

## Validation population

The minimum release population is:

- 12 actuators from at least three production lots;
- at least two actuator cable lengths, including the maximum supported length;
- new, room-temperature, cold, and deliberately friction-loaded samples;
- both directions and at least 20 complete characterization cycles per actuator;
- at least two assembled controller PCBs before the 10,000-cycle endurance run.

Thresholds found on one actuator or one PCB are characterization values only and
must not be promoted to production defaults.
