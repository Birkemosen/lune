# Rev 2.1 review addendum for the Lean target

> **Historical record**, written against the Rev 3.1/KiCad designator scheme. See
> `design-contract.json` -> `designator_history` for the as-built names.

This addendum supersedes the channel-count and driver recommendation in
`../lune-v6-rev3.0/rev2-review.md`. The electrical findings in that review
remain valid; the product constraints are now explicitly six channels, two
layers, compact size, minimum practical component count and a five-board landed
target near 1500 DKK.

## Rev 2.1 disposition

**Do not fabricate Rev 2.1.** Its force-plus-motion concept is sound, but its
implementation cannot provide production-grade endpoint confidence:

1. Six `TBD_LOW_RON_SPST` motor switches have no qualified MPN or proven
   bidirectional/unpowered behavior.
2. Six independent selection GPIOs make one-motor-at-a-time a firmware promise.
   Selecting two motors invalidates both shared current and BEMF attribution.
3. The overcurrent latch can be re-armed into an extant fault.
4. The 3.3 V LM339 tacho stage uses an input common-mode point outside the
   guaranteed full-temperature range.
5. Motor and ESP32 share the final regulator, so stall/commutation noise corrupts
   the ADC reference and can reset the controller during classification.
6. There is no fixed per-motor force/current ceiling and no independent maximum
   continuous-drive timer.
7. The OneWire TVS polarity is reversed.
8. The PCB is an unrouted placement artifact with no passing DRC and a 120 mm
   dimension outside the preferred low-cost outline.

## What is retained

Rev 2 correctly identifies that endpoint handling needs two different physical
observations:

- current measures force, load, engagement, jam and connection state;
- BEMF/commutation measures rotor motion independently of force.

Rev 3.1 Lean preserves those observations but makes selection one-hot in
hardware, buffers the high-impedance BEMF path, separates motor and logic power,
adds fixed current ceilings and latches an independent runtime cutoff.

## Why six, not eight

The earlier Rev 3.0 review selected eight because repeated electrical parts were
cheap and fitted 100 x 100 mm. Under the updated compactness and component-count
requirements, that is no longer optimal. The two unused channels cost one
driver group, two RJ9 connectors and approximately 15 mm of board edge. Six
channels meet the real installation and improve 2-layer routing margin. Eight
should be a later SKU, not paid-for unused capacity on this prototype.

## Why not discrete Homematic-style bridges

Discrete transistor bridges can be excellent at high production volume when
their switching, dead-time, short-circuit, thermal and EMC behavior has already
been characterized. For five prototypes, three protected dual H-bridge ICs use
far fewer placements and transfer less safety risk into this design. DRV8214 is
also rejected: one expensive package per motor and the supplied stock of only
three devices cannot support this prototype run.
