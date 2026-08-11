# Lune V6 Rev 2.1 hardware review

Review date: 2026-08-07. The reviewed source was the generated Rev 2.1
schematic, PCB generator, design review, and measurement model in
`../heatvalve-6-rev2.1/`. This is an electrical design review; it is not a
physical test report.

> That folder has since been removed — Rev 2.1 was dispositioned "do not
> fabricate" below and is two revisions superseded. This review is the surviving
> record of it. To read the reviewed source again:
> `git restore --source=refs/snapshots/pre-hardware-cleanup -- devices/lune-v6/hardware/heatvalve-6-rev2.1`
> (it is also in branch history at commit `6214211`).

## Disposition

**Do not fabricate Rev 2.1.** Its current-plus-BEMF measurement concept is worth
retaining, but the motor selection, fault latch, tacho comparator, power
partitioning, protection, and PCB state are not production-ready. Rev 3.0 keeps
the useful sensing model and replaces the unsafe shared motor-current mux with
dedicated bridges plus hardware one-hot logic.

## Findings

| Severity | Finding | Evidence in Rev 2.1 | Consequence | Rev 3.0 disposition |
|---|---|---|---|---|
| Critical | The six motor switches are schematic placeholders. | `U31`-`U36` are `TBD_LOW_RON_SPST`; no MPN or verified pinout exists. The required part must be bidirectional, rail-to-rail, low-Ron, high-isolation and safe while unpowered. | The schematic cannot be assembled or electrically signed off. A unidirectional load switch can conduct through a body diode in the wrong state. | Removed. Every actuator is wired directly to one DRV8833 bridge. |
| Critical | One-motor-at-a-time is only a firmware promise. | Six independent `MUX_ENn` GPIOs can be asserted together; there is no decoder or interlock. | Two motors can share the single bridge, invalidating current/BEMF attribution and changing the protection threshold per motor. | Two 74HC238 decoders make at most one bridge input active for every valid static control state. |
| Critical | A persistent overcurrent can be re-armed. | The comparator clocks D=0 into the 74HC74; `LATCH_ARM_N` uses asynchronous preset. Firmware can preset Q high while the comparator remains in its overcurrent state, and no new clock edge is then guaranteed. | A software fault or repeated recovery attempt can restore drive into a still-stalled actuator. | Driver faults and hard overcurrent directly hold the 74HC74 asynchronous clear low. Arming is ineffective while the fault remains. |
| Critical | The LM339B tacho comparison is outside its guaranteed common-mode range at 3.3V. | Both tacho inputs sit around 1.65V while the LM339B is powered from 3.3V. TI guarantees the upper input common-mode limit only to approximately `VCC - 2V` over temperature. | `TACHO_EDGE` can be missing, phase-shifted, or stuck, so it cannot be release evidence for either endpoint direction. | A 5V-powered LMV393 compares 0-3.3V analog signals; all operating points remain below `VCC - 0.7V`. |
| High | Motor and logic loads share the final 3.3V regulator. | The ESP32, analog circuitry and DRV8837 motor rail all use `+3V3_SYS`. | Stall, commutation and cable transients directly disturb ESP supply and ADC reference; a reset can occur during the event that must be classified safely. | Separate SY8089 logic buck and AP2112 motor regulator, with a common continuous ground plane. |
| High | There is no immutable destructive-current limit. | The only comparator reference is derived from ESP32 PWM and its nominal range ends near 174mA. The DRV8837 has internal protection but no external per-actuator current-program pin or fault output. | A firmware/configuration defect can set an inappropriate force threshold; driver thermal/OCP behavior is not a calibrated endpoint or latch source. | Fixed approximately 280mA rail trip plus approximately 200mA nominal DRV8833 bridge regulation. Firmware cannot raise either hardware limit. |
| High | The OneWire TVS polarity is reversed. | KiCad `Device:D` pin 1 is cathode and pin 2 is anode; Rev 2.1 connects pin 1 to GND and pin 2 to `OW_BUS`. | The bus is forward-clamped near a diode drop and is unlikely to operate reliably. | Cathode is on `ONEWIRE_BUS`, anode on GND, with an exact unidirectional TVS MPN. |
| High | The PCB is an unrouted placement artifact with no passing DRC. | The Rev 2.1 README explicitly says routing and current DRC are absent. | Signal integrity, Kelvin sensing, power integrity, thermal performance and manufacturability are unverified. | Rev 3.0 has a 100x100mm placement proof and remains explicitly blocked from fabrication until routing and zero-error DRC. |
| Medium | The 120x75mm outline misses the 100x100mm low-cost dimension band despite having less area. | One board dimension is 120mm. | Prototype PCB/assembly pricing can increase even though total area is below 100cm2. | Eight outputs fit a 100x100mm outline. |
| Medium | Motor-terminal ESD/EFT behavior is not closed. | No qualified output transient network or injection calculation exists. | Long actuator cables can couple transients into the H-bridge and motor rail. | Still an explicit Rev 3.0 release blocker; add or validate output protection before fabrication release. |
| Medium | The mechanical definition is incomplete. | Only two mounting holes and no proven enclosure/DIN interface are present. | Connector strain can flex the PCB and the installation cannot be signed off. | Four mounting holes and a DIN-enclosure fit gate are required. |

## Endpoint-detection review

The Rev 2.1 decision to separate **force** from **motion** is correct:

- calibrated motor current is useful for startup, pin engagement, load, jam and
  destructive-force detection;
- differential BEMF/commutation is useful for proving that the rotor is moving
  and for maintaining a relative position count;
- neither signal alone reliably distinguishes a normal endpoint from a
  mid-stroke obstruction, a disconnected motor, switching ripple, or a reset.

The endpoint classifier must be direction-specific. In both opening and closing
directions it shall require loss of qualified motion plus elevated load in a
plausible learned position window. Elevated load while motion continues is pin
engagement, not an endpoint. The same stopped-motion/high-load signature away
from the learned end is a jam. No-motion/low-current is a wiring fault. A hard
runtime limit remains mandatory even when both sensors appear valid.

Rev 2.1 cannot deliver that classifier reliably because its tacho comparator is
not guaranteed, and multiple selected motors make both measurements ambiguous.
Rev 3.0 fixes the observation path but still requires the actuator-population
and endurance tests in `validation-plan.md`; no numerical endpoint threshold is
production-ready from schematic analysis alone.

## Six or eight outputs

Use one eight-output PCB. Outputs 7-8 add one already-used dual driver, two
connectors and repeated passives—about USD 1 per populated board at the reviewed
prototype pricing—and the placement remains inside 100x100mm. Maintaining a
separate six-output PCB would cost more in layout, firmware variants, test
coverage and inventory than it saves in components. A commercial six-channel
variant can omit the channel-7/8 population group if that saving later matters.

## Driver conclusion

Four dual DRV8833 devices are the best fit for this revision:

- one dedicated bridge per actuator without a motor-current mux;
- hardware current regulation and shared open-drain fault reporting;
- 2.7-10.8V motor supply range, compatible with the 3.3V actuator rail;
- only four placed ICs for eight outputs;
- materially lower cost and better availability than eight DRV8214 devices.

The DRV8214 remains attractive where its integrated current mirror and richer
diagnostics justify cost. With the supplied LCSC snapshot, however, eight cost
USD 45.79 for a single board; the quoted tiers are USD 5.1613 at 10, USD 4.8013
at 30 and USD 4.4527 at 100 pieces. Forty for five boards cost USD 192.05 total
at the 30-piece tier, and only three parts are in stock. A Homematic-like
discrete bridge is also possible, but at eight channels it transfers
shoot-through, dead-time, gate-bias and protection validation into this project
without a BOM-cost advantage over the approximately USD 0.51 dual DRV8833.

## References

- TI LM339B: <https://www.ti.com/lit/ds/symlink/lm339.pdf>
- TI DRV8833: <https://www.ti.com/lit/ds/symlink/drv8833.pdf>
- TI DRV8214: <https://www.ti.com/lit/ds/symlink/drv8214.pdf>
- VdMot hardware notes: <https://github.com/Lenti84/VdMot_Controller/blob/master/hardware/hardware.md>
- nliaudat eight-channel controller: <https://github.com/nliaudat/esp32_8ch_motor_shield>
- nliaudat floor-heating firmware: <https://github.com/nliaudat/floor-heating-controller>
