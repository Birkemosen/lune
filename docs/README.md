# Lune V6 — documentation

Everything about Lune V6, the local 6-zone manifold controller: use, firmware, API, contracts and hardware.
The chip is the file name; the link says what the document is for.

**Lune documentation:** **Lune V6** (this page) · [Lune Touch](https://github.com/Birkemosen/lune-coordinator/blob/main/docs/README.md) · [Design system](https://github.com/Birkemosen/lune-design-system/blob/main/docs/README.md)

---

**Start here**

- `README` [What Lune V6 is, safety model and quick start](../README.md)
- `lune-v6/README` [Firmware overview, build and flash](../lune-v6/README.md)
- `devices/lune-v6/README` [ESPHome device configuration](../devices/lune-v6/README.md)
- `changelog` [Firmware changes](../lune-v6/changelog.md)

**Use and setup**

- `Manual` [Installer and operator manual for the local dashboard](../lune-v6/docs/Manual.md) — the `?` help in the UI links here
- `hydraulic_commissioning` [Hydraulic commissioning of a manifold](../lune-v6/docs/hydraulic_commissioning.md)
- `external_room_temperature` [External room temperatures (BYO sensors, large homes)](../lune-v6/docs/external_room_temperature.md)

**Firmware and control**

- `ARCHITECTURE` [Engineering overview of the firmware](../lune-v6/docs/ARCHITECTURE.md)
- `adaptive_balancing` [Adaptive hydraulic balancing from room temperatures](../lune-v6/docs/adaptive_balancing.md)
- `endstop_detection` [Endstop detection: how valve closing is recognised](../lune-v6/docs/endstop_detection.md)
- `esp32_ripple_spec_strict` [Ripple counting module specification](../lune-v6/docs/esp32_ripple_spec_strict.md)

**API and contracts**

- `lv6_api_v1` [Lune V6 API v1 — the dashboard and integration API](../lune-v6/docs/lv6_api_v1.md)
- `lune_api_v1` [Shared v1 envelope for V6 and Touch](../shared/contracts/lune_api_v1.md)
- `lune_room_physics_contract_v1` [Room physics contract (normative for V6 and Touch)](../shared/contracts/lune_room_physics_contract_v1.md)
- `absorb-command` [Absorb-window command](../shared/contracts/absorb-command/README.md)
- `lune_domain_identity_contract` [Stable identifiers across V6, Touch, APIs and history](lune_domain_identity_contract.md)
- `lune_house_signal_contract` [House signal: physical temperature and comfort target to Asgard](lune_house_signal_contract.md)
- `lune_asgard_authority_state_machine` [Who may write the house temperature to Asgard](lune_asgard_authority_state_machine.md)

**The whole house (V6 + Touch + Asgard/Odin)**

- `lune_whole_house_flow_temperature` [Keeping the heat pump's flow temperature low and steady](lune_whole_house_flow_temperature.md)
- `lune_heating_control_implementation_plan` [Implementation plan for the heating stack](lune_heating_control_implementation_plan.md)
- `lune_touch_build_plan` [Lune Touch build plan](lune_touch_build_plan.md)

**Web UI**

- `web/README` [The V6 web UI on the Lune design system](../lune-v6/web/README.md)
- `web/MAPPING` [Where every field from the old Dashboard/Configuration moved](../lune-v6/web/MAPPING.md)

**Hardware — current board (Rev 3.3)**

- `rev3.3/README` [Board overview and status](../lune-v6/hardware/lune-v6-rev3.3/README.md)
- `architecture` [Electrical architecture](../lune-v6/hardware/lune-v6-rev3.3/architecture.md)
- `design-review` [Design review](../lune-v6/hardware/lune-v6-rev3.3/design-review.md)
- `firmware-integration` [Firmware integration](../lune-v6/hardware/lune-v6-rev3.3/firmware-integration.md)
- `validation-plan` [Validation and release plan](../lune-v6/hardware/lune-v6-rev3.3/validation-plan.md)
- `layout-audit` [Quantitative layout audit](../lune-v6/hardware/lune-v6-rev3.3/layout-audit.md)
- `rev2-review-addendum` [Rev 2.1 review addendum](../lune-v6/hardware/lune-v6-rev3.3/rev2-review-addendum.md)

**Hardware — earlier boards and schematics**

- `hardware_rev2` [Rev 2 board design (shared driver, motor mux)](../lune-v6/docs/hardware_rev2.md)
- `esp32-s3_ufh_pcb_solution` [ESP32-S3 UFH PCB concept](../lune-v6/docs/esp32-s3_ufh_pcb_solution.md)
- `schematics/controller` [Controller schematic](../lune-v6/docs/schematics/controller.md)
- `schematics/motor` [Motor driver schematic](../lune-v6/docs/schematics/motor.md)
- `schematics/power` [Power supply schematic](../lune-v6/docs/schematics/power.md)
- `rev3_wroom1` [ESP32-S3-WROOM-1 controller schematic (Rev 3)](../lune-v6/docs/schematics/rev3_wroom1/esp32_s3_wroom1_n16r8_controller.md)
- `rev3.0` [Rev 3.0 retained documents](../lune-v6/hardware/lune-v6-rev3.0/README.md) · [pinout audit](../lune-v6/hardware/lune-v6-rev3.0/pinout-audit.md) · [requirements](../lune-v6/hardware/lune-v6-rev3.0/requirements.md) · [Rev 2.1 review](../lune-v6/hardware/lune-v6-rev3.0/rev2-review.md)
- `rev3.1-lean` [Rev 3.1 Lean retained audit scripts](../lune-v6/hardware/lune-v6-rev3.1-lean/README.md)

**Product family**

- `lune_brand_architecture` [Birkemosen product architecture](https://github.com/Birkemosen/lune-coordinator/blob/main/docs/lune_brand_architecture.md) (kept in the Touch repository)
