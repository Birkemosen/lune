# Rev 3.2 remediation — running the motors without the fault latch

The fault latch `U2` never arms on either assembled board. This document is the
bench procedure for making those boards usable anyway, and the reasoning behind
each option. It is a field modification to existing hardware, not a design
change: Rev 3.3 removes the latch entirely (see `../lune-v6-rev3.3/design-review.md`
§ 6, R3.3-3 and the hazard decision recorded with it).

Read § 4 before picking an option. One of these modifications removes the
hardware fault cutoff *and* the firmware's only view of a fault.

---

## 1. The circuit as built

```
GPIO17 ─ R4 ─ ARM_EDGE_IN ─ C4 ─ ARM_CLK ─ U2.1 (CP)
                                    ├── R5 100k ── GND
                                    └── Q1 2N7002 drain
                                        gate = MOTOR_ENABLE
```

`U2` is a 74LVC1G74DP,125 (`C458768`) in TSSOP-8:

| Pin | Function | Net |
|---|---|---|
| 1 | CP | `ARM_CLK` |
| 2 | D | `3V3_LOGIC` — tied high |
| 3 | Q̄ | `LATCH_STATE` → GPIO16 |
| 4 | GND | `GND` |
| 5 | Q | `DRIVER_N_SLEEP` → `U9.1`, `U10.1`, `U11.1`, `U7.2` |
| 6 | R̄D | `FAULT_N_RAW` — async reset, active low |
| 7 | S̄D | `3V3_LOGIC` — **direct, no resistor** |
| 8 | VCC | `3V3_LOGIC` |

Supporting parts: `R4` 1 kΩ (originally 10 kΩ), `R5` 100 kΩ, `C4` 10 nF,
`Q1` 2N7002, `R31` 100 kΩ from `DRIVER_N_SLEEP` to GND, `R3` 10 kΩ pull-up and
`C3` 100 nF on `FAULT_N_RAW`.

`R31` pulls the drive permit **down**, so the safe state is asleep and nothing
except `U2.5` can wake the drivers. **There is no firmware-only fix.** No GPIO
reaches `DRIVER_N_SLEEP`.

### What is already verified good

Both boards, measured during bring-up:

- GPIO17 pulses correctly — confirmed at the pad with a DMM and by firmware pad
  readback.
- `C4` 10.26 nF, `R5` 100 kΩ, `R4` 1 kΩ (swapped from 10 kΩ on board 2).
- `Q1` off when `MOTOR_ENABLE` is low; ~0.99 V AC measured across the coupling
  while clocking.
- `U2` VCC, GND, D, S̄D and R̄D all at the correct levels; package marking `V74`.
- `ARM_CLK` sits above V_IH for roughly 450 µs per pulse — far longer than the
  2.7 ns minimum pulse width.

### What is still unknown

Arming fails in both couplings: **0 arms in 37 500 edges at 1 kΩ**, and 2 arms in
roughly 30 000 edges at 10 kΩ. A single clean rising edge after a 5 s settle also
fails. Review item **B7** attributed this to the arm-clock slew rate; the bench
has refuted that — the 1 kΩ part is verified fitted and made the behaviour worse,
not better. B7's recorded fix should not be treated as settled.

Two hypotheses remain and option 1 distinguishes them.

---

## 2. Option 1 — bridge `C4` (try this first)

Short across `C4`'s two pads. The coupling becomes DC:

```
GPIO17 ─ R4 1k ─ ARM_CLK ─ U2.1 (CP)
```

With `R5` as a 100 kΩ pull-down, a high GPIO17 puts `ARM_CLK` at
3.3 × 100/101 = **3.27 V**, well above the 74LVC1G74's 2.0 V V_IH. A DC rising
edge clocks D — tied high — into Q, so `DRIVER_N_SLEEP` goes high and the drivers
wake.

**Effort:** one solder bridge on an 0603. Fully reversible.

**Firmware:** none. `pulse_arm()` already drives GPIO17 and samples `LATCH_STATE`
1 ms after the edge.

**Conditions:**

- `MOTOR_ENABLE` must be low while arming, or `Q1` clamps `ARM_CLK` to ground.
  The existing arm path coasts first, so this is already satisfied.
- Call `pulse_arm()` with `leave_high = false`. If GPIO17 stays high, then every
  time `MOTOR_ENABLE` later goes high `Q1` sinks 3.3 mA through `R4`
  continuously. Harmless, but pointless.

**This is also the decisive diagnostic.** If the latch arms with DC coupling, the
AC path was the fault. If it still will not arm with a clean 3.27 V DC edge
sitting on CP, `U2` is dead and no coupling change will help — go to option 2.

### Verify

1. Power up, arm from the Motor Lab.
2. `LATCH_STATE` (GPIO16) must read **0**. Firmware reports armed.
3. Measure `U2.5` with a DMM: it must be at `3V3_LOGIC`, not near 0 V.
4. Drive one zone and confirm motion.

---

## 3. Option 2 — remove `U2` and bridge the empty footprint

Only if option 1 fails. Desolder the TSSOP-8, then bridge pads on the bare
footprint. In an 8-pin dual-row package pin 3 sits directly opposite pin 6, and
pins 4 and 5 are adjacent at the same end, so all of these are short hops.

| Bridge | Effect |
|---|---|
| **pad 5 → pad 8** | `DRIVER_N_SLEEP` to `3V3_LOGIC` — drivers permanently awake |
| **pad 3 → pad 6** | `LATCH_STATE` follows `FAULT_N_RAW` — keeps fault visibility |

`R31` is overridden by the hard bridge to the rail.

Motion is then controlled entirely by `MOTOR_ENABLE` and the decoder, which is
the Rev 3.3 topology.

### Firmware change for the 3 → 6 bridge

GPIO16 now reads `FAULT_N_RAW` directly through `R3`'s pull-up, so it is active
low and the sense inverts:

```cpp
bool Rev32MotorBackend::fault_latched() const {
  // Latch removed in the field: GPIO16 reads FAULT_N_RAW directly, active low.
  return gpio_get_level(pins_.latch_state) == 0;
}
```

That is exactly what `Rev33GpioBackend::fault_latched()` already does.

### Simpler variant, and why not to use it

Bridging **pad 3 → pad 4** instead grounds `LATCH_STATE`, so `fault_latched()`
returns false with no firmware change at all. It is one easier solder joint.

It also makes firmware **completely blind to faults**. On Rev 3.2 `FAULT_N_RAW`
has no GPIO of its own — it was only ever visible through Q̄, which this bridge
ties to ground. Prefer 3 → 6 and the one-line firmware change.

---

## 4. Safety

Option 2 removes the hardware-independent drive cutoff. That is the same trade
the Rev 3.3 hazard decision already makes and argues for: the DRV8411s carry
their own overcurrent protection, thermal shutdown and UVLO; `MOTOR_ENABLE`'s
100 kΩ pull-down drives `DECODER_INHIBIT` high whenever the GPIOs go high-Z, and
the 4514's inhibit turns every output off regardless of the permit; and the
firmware runtime limit bounds a stall.

The difference on Rev 3.2 is that the three fault sources share one wired-OR net
with no GPIO. Take the 3 → 6 bridge so you give up the cutoff only, not the
reporting as well.

Option 1 changes nothing about the safety topology. The latch still arms, still
resets on `FAULT_N_RAW`, and still requires an explicit re-arm.

---

## 5. Do not do this

**Do not pull `U2` pin 7 (S̄D) to ground.** It is the asynchronous set and would
indeed force Q high without any clock — but it is wired *directly* to
`3V3_LOGIC` with no series resistor, so shorting it to GND shorts the logic rail.
It would need a trace cut first, which is more invasive and riskier than either
option above, on a 0.65 mm pitch package, next to VCC on pin 8.

---

## 6. Status

These boards are prototypes for characterisation. The modification is a bridge to
keep them useful until Rev 3.3 arrives, not a repair to carry forward — Rev 3.3
deletes `U2`, `Q1`, `R4`, `R5` and `C4` and gives the three fault sources their
own GPIOs.

Record which option was applied to which board before modifying, and note it on
the board itself. A modified board that looks unmodified will eventually be used
as a reference for a measurement it can no longer support.
