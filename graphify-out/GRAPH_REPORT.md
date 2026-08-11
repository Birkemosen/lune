# Graph Report - devices/lune-v6/hardware  (2026-08-07)

## Corpus Check
- Corpus is ~31,971 words - fits in a single context window. You may not need a graph.

## Summary
- 181 nodes · 310 edges · 12 communities
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.91)
- Token cost: 4,971 input · 8,916 output

## Community Hubs (Navigation)
- Rev3.0 Architecture and Sourcing
- Rev3.1 Lean Safety Architecture
- Rev2 Endpoint Architecture
- Rev3 Schematic Generator
- Rev3 PCB Generator
- Rev2 PCB Generator
- Rev3 Contract Checks
- Rev3.1 Contract Checks
- Rev2 Schematic Generator
- Rev2 Board Interfaces
- Rev3 Placement Preview
- Connectivity Audit

## God Nodes (most connected - your core abstractions)
1. `passive()` - 11 edges
2. `generate()` - 11 edges
3. `Lune V6 Rev 3.1 Lean` - 11 edges
4. `add()` - 10 edges
5. `Lune V6 Rev 3.0 hardware` - 10 edges
6. `Rev 3.1 Lean electrical architecture` - 10 edges
7. `generate()` - 9 edges
8. `generate()` - 9 edges
9. `main()` - 9 edges
10. `net()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Differential BEMF and qualified tacho sensing` --semantically_similar_to--> `Address-coupled differential BEMF and tacho path`  [INFERRED] [semantically similar]
  heatvalve-6-rev2.1/design-review.md → lune-v6-rev3.0/architecture.md
- `Current-and-motion endpoint and fault classifier` --semantically_similar_to--> `Endpoint state machine contract`  [INFERRED] [semantically similar]
  heatvalve-6-rev2.1/measurement-and-position.md → lune-v6-rev3.0/architecture.md
- `Six independent DRV8837 motor outputs` --conceptually_related_to--> `Shared DRV8837 driver and motor mux architecture`  [AMBIGUOUS]
  heatvalve-6-rev2.1/heatvalve-6-rev2.1-schematic.pdf → heatvalve-6-rev2.1/README.md
- `Retained force-plus-motion principle` --semantically_similar_to--> `Bidirectional endpoint classifier`  [INFERRED] [semantically similar]
  lune-v6-rev3.1-lean/rev2-review-addendum.md → lune-v6-rev3.1-lean/architecture.md
- `DRV8833 selected over DRV8214 for cost and availability` --semantically_similar_to--> `DRV8833 sourcing decision`  [INFERRED] [semantically similar]
  lune-v6-rev3.0/README.md → lune-v6-rev3.0/jlcpcb-sourcing.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Force plus motion endpoint classification** — devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_shared_current_measurement, devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_buffered_differential_bemf, devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_bidirectional_endpoint_classifier, devices_lune_v6_hardware_lune_v6_rev3_1_lean_validation_plan_bidirectional_actuator_endpoint_matrix [EXTRACTED 1.00]
- **Nested motor shutdown chain** — devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_drv8411_current_ceiling, devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_shared_current_measurement, devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_74hc4514_one_hot_control, devices_lune_v6_hardware_lune_v6_rev3_1_lean_architecture_independent_runtime_cutoff [EXTRACTED 1.00]
- **Production release evidence** — devices_lune_v6_hardware_lune_v6_rev3_1_lean_validation_plan_electrical_design_gates, devices_lune_v6_hardware_lune_v6_rev3_1_lean_validation_plan_analog_fixture_characterization, devices_lune_v6_hardware_lune_v6_rev3_1_lean_validation_plan_bidirectional_actuator_endpoint_matrix, devices_lune_v6_hardware_lune_v6_rev3_1_lean_validation_plan_timeout_and_fault_latch_tests, devices_lune_v6_hardware_lune_v6_rev3_1_lean_validation_plan_emc_thermal_and_production_tests [EXTRACTED 1.00]

## Communities (12 total, 0 thin omitted)

### Community 0 - "Rev3.0 Architecture and Sourcing"
Cohesion: 0.07
Nodes (35): Shared calibrated high-side motor-rail current measurement, Four DRV8833 dual H-bridges with one bridge per actuator, Rev 3.0 electrical architecture, 74HC238 hardware one-hot motor selection, Persistent hardware fault latch and drive shutdown, Separate 3V3 logic and motor regulators, Rev 3.0 ERC exceptions, Generator-only multi-unit symbol warnings (+27 more)

### Community 1 - "Rev3.1 Lean Safety Architecture"
Cohesion: 0.10
Nodes (31): 74HC4514 one-hot motor control, Bidirectional endpoint classifier, Buffered sequential differential BEMF, Display daughterboard population option, DRV8411 fixed current ceiling, Rev 3.1 Lean electrical architecture, 74HC4060 independent runtime cutoff, Separated logic and motor power (+23 more)

### Community 2 - "Rev2 Endpoint Architecture"
Cohesion: 0.10
Nodes (21): Differential BEMF and qualified tacho sensing, RSH1 and INA180A1 shared current sensing, HeatValve-6 Rev 2.1 electrical design review, Power-on-disarmed overcurrent latch, Rev 2.1 prototype and release gates, 74HC4051 BEMF multiplexers, HeatValve-6 Rev 2.1 schematic, Six independent DRV8837 motor outputs (+13 more)

### Community 3 - "Rev3 Schematic Generator"
Cohesion: 0.54
Nodes (16): add(), add_bemf(), add_current_and_safety(), add_decoder_logic(), add_esp32(), add_external_interfaces_and_flags(), add_motor_drivers(), add_usb_and_power() (+8 more)

### Community 4 - "Rev3 PCB Generator"
Cohesion: 0.32
Nodes (12): add_edge(), add_text(), add_zone(), assert_no_courtyard_overlaps(), assert_pad_edge_clearance(), export_netlist(), generate(), grid() (+4 more)

### Community 5 - "Rev2 PCB Generator"
Cohesion: 0.35
Nodes (11): add_edge(), add_text(), add_track(), add_zone(), export_netlist(), generate(), load_footprint(), mm() (+3 more)

### Community 6 - "Rev3 Contract Checks"
Cohesion: 0.30
Nodes (11): check_budget_contract(), check_cost_model(), check_decoder_truth_table(), check_erc_report(), check_gpio(), check_module(), check_motor_map(), decoder_outputs() (+3 more)

### Community 7 - "Rev3.1 Contract Checks"
Cohesion: 0.33
Nodes (10): active_decoder_output(), check_bemf(), check_count_and_budget(), check_current_stack(), check_decoder(), check_gpio(), check_runtime(), load_contract() (+2 more)

### Community 8 - "Rev2 Schematic Generator"
Cohesion: 0.47
Nodes (9): add(), decoupling(), generate(), load_libraries(), nc(), net(), note(), passive() (+1 more)

### Community 9 - "Rev2 Board Interfaces"
Cohesion: 0.29
Nodes (7): I2C DNP header, Heatvalve-6 Rev 2.1 board preview, Central microcontroller module, Three 1-Wire interfaces, Heatvalve-6 Rev 2.1 PCB, Six valve channels V1–V6, USB, RESET, and BOOT controls

### Community 10 - "Rev3 Placement Preview"
Cohesion: 0.33
Nodes (7): Lune V6 revision 3.0 PCB placement preview, Central castellated controller module, Lune V6 revision 3.0 component placement layout, Placement only, not for fabrication, Right-edge power and I/O connectors, Two PCB push-button controls, Eight valve connectors labeled V1 through V8

### Community 11 - "Connectivity Audit"
Cohesion: 0.60
Nodes (4): main(), pad_key(), pad_label(), PAD

## Ambiguous Edges - Review These
- `Shared DRV8837 driver and motor mux architecture` → `Six independent DRV8837 motor outputs`  [AMBIGUOUS]
  heatvalve-6-rev2.1/heatvalve-6-rev2.1-schematic.pdf · relation: conceptually_related_to

## Knowledge Gaps
- **27 isolated node(s):** `USB-C-only power architecture`, `RSH1 and INA180A1 shared current sensing`, `Power-on-disarmed overcurrent latch`, `Rev 2.1 prototype and release gates`, `Open, engagement, modulation, and closed landmarks` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Shared DRV8837 driver and motor mux architecture` and `Six independent DRV8837 motor outputs`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Rev 3.0 electrical architecture` connect `Rev3.0 Architecture and Sourcing` to `Rev2 Endpoint Architecture`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Endpoint state machine contract` connect `Rev2 Endpoint Architecture` to `Rev3.0 Architecture and Sourcing`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `USB-C-only power architecture`, `RSH1 and INA180A1 shared current sensing`, `Power-on-disarmed overcurrent latch` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Rev3.0 Architecture and Sourcing` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._
- **Should `Rev3.1 Lean Safety Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._
- **Should `Rev2 Endpoint Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._