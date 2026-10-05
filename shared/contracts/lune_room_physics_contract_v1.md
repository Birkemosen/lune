# Lune Room Physics Contract v1

Foreslået placering: `shared/contracts/lune_room_physics_v1.md`, ved siden af `lune_api_v1.md`. Kontrakten er **normativ for både `lune-v6` og `lune-coordinator`**. "SKAL" er krav, "BØR" er anbefaling. Ved uenighed mellem denne kontrakt og de to repo-prompts vinder kontrakten.

V6 rapporterer `physics_contract: 1` i `/api/v1/overview`. Touch SKAL afvise at skrive fysikfelter til en V6 der ikke rapporterer version 1.

## Ændringer i forhold til det forrige planlægningsdokument

Tre ting er præciseret eller rettet. Agenter der allerede har implementeret efter det forrige dokument, skal justere:

1. **Rummets termiske masse er ikke kun dækket.** Der indføres en strukturmasse `c_struct` (vægge, inventar). τ-prioren bruger dæk + struktur; absorptionsrangen bruger kun dækket.
2. **Absolutte τ-grænser på 8–80 t er for snævre** og erstattes af relative grænser (afsnit 9). Et indvendigt rum har naturligt τ langt over 80 t.
3. **Ukendt belægning beregnes som `parquet_laminate`**, ikke `tile_stone`. Konservativt: det overvurderer ikke absorptionskapaciteten.

---

## 1. Ejerskab

| Felt | Sandhedskilde | Niveau |
| --- | --- | --- |
| `area_m2` | V6 | sløjfe |
| `exterior_walls` | V6 | sløjfe |
| `slab_type`, `active_thickness_cm`, `covering`, `r_override_m2k_per_w` | V6 | sløjfe |
| `ua_weight_override` | V6 | sløjfe |
| Sammenlægning inden for manifold (grupper) | V6 | gruppe |
| `include_in_house_temperature` | V6 | gruppe |
| Lært τ og gain | V6 | sløjfe |
| `ua_learned_*` | Touch lærer, V6 gemmer | sløjfe |
| `u_base`, `u_wall`, `c_struct` | V6 defaults; Touch kalibrerer og skriver | enhed/hus |
| `wind_exposure`, `solar_gain` | Touch | logisk rum |
| Logiske rum på tværs af manifolde | Touch | logisk rum |

Regler:

- Touch SKAL skrive V6-ejede felter via write-through med `expected_revision`, og SKAL behandle sin egen kopi som spejling.
- Touch SKAL IKKE importere `wind_exposure`/`solar_gain` fra V6 efter engangsmigreringen (afsnit 11).
- Ved samtidig ændring af et V6-ejet felt begge steder vinder V6. Touch logger konflikten som event.

## 2. Sammenlægning

### 2.1 V6-grupper (inden for én manifold)

- En gruppe har præcis én `primary_loop` og nul eller flere `member_loops`. En ugrupperet sløjfe er en gruppe af én (`group_role: single`).
- SKAL afvises: kæder, cykler, et medlem der er primær i en anden gruppe, en primær i fejl, en sløjfe i mere end én gruppe. Afvisning SKAL være atomar — ingen delvis ændring.
- Primær ejer føler(e), sætpunkt, skema og komfort. Medlemmer følger.
- Flow inden for gruppen SKAL fordeles efter sløjfeareal (eller lært Kv når den findes), ikke identisk ventilposition: `share_i = area_i / Σ area_group` (før Kv-kalibrering).
- Hver sløjfe beholder sin returprobe. Leveret energi summeres per gruppe.
- `include_in_house_temperature` er et gruppefelt. Gruppens `area_m2`, `ua_effective_w_per_k`, `c_slab_kwh_per_k` og `c_zone_kwh_per_k` er summer over sløjferne.
- En gruppe MÅ have flere følere; rumtemperatur = gennemsnit af friske følere.

### 2.2 Touch logiske rum (på tværs af manifolde)

- Et logisk rum består af én eller flere V6-grupper fra **forskellige** noder. To grupper fra samme node SKAL afvises — det er en V6-sammenlægning.
- En V6-gruppe tilhører højst ét logisk rum.
- Touch SKAL IKKE splitte eller omdefinere en V6-gruppe.
- Hustemperatur SKAL aggregeres over logiske rum (ikke grupper, ikke sløjfer), så et rum på tværs af manifolde tælles én gang.

### 2.3 Standalone for rum på tværs af manifolde

BLE-annonceringer er broadcast. For hvert logisk rum med grupper på flere noder SKAL Touch verificere at alle deltagende V6-grupper rapporterer mindst én fælles føler-MAC, og SKAL vise en advarsel hvis ikke. Touch BØR tilbyde at skrive primærgruppens føler-MAC til de øvrige grupper.

## 3. Gulvmodel

### 3.1 Enums

```
slab_type  : cast_concrete | screed | dry_plates | timber_joists | unset
covering   : tile_stone | vinyl_linoleum | parquet_laminate | carpet | unset
```

Ukendte værdier ved write SKAL afvises med `400 invalid_enum`. `unset` er gyldig og betyder "ikke provisioneret".

### 3.2 Dækkonstruktion

Volumetrisk varmekapacitet for cementbaserede lag: **0,58 kWh/(m³·K)**.

| `slab_type` | Model | Default `active_thickness_cm` | Tilladt interval | `c_slab_per_m2` ved default |
| --- | --- | --- | --- | --- |
| `cast_concrete` | volumetrisk | 8 | 4–15 | 0,0464 kWh/(m²·K) |
| `screed` | volumetrisk | 5 | 3–8 | 0,0290 kWh/(m²·K) |
| `dry_plates` | fast | ikke relevant | — | 0,005 kWh/(m²·K) |
| `timber_joists` | fast | ikke relevant | — | 0,008 kWh/(m²·K) |
| `unset` | beregnes som `cast_concrete` 8 cm |  |  | 0,0464 kWh/(m²·K) |

```
volumetrisk:  c_slab_per_m2 = 0,58 × active_thickness_cm / 100
fast:         c_slab_per_m2 = tabelværdi
c_slab_kwh_per_k = area_m2 × c_slab_per_m2
```

- `active_thickness_cm` udeladt eller `null` → default for typen.
- `active_thickness_cm` uden for intervallet → `400 out_of_range`.
- `active_thickness_cm` angivet for `dry_plates`/`timber_joists` → ignoreres, gemmes ikke, og svaret indeholder `warnings: ["thickness_ignored"]`.
- Belægningens egen masse ignoreres i v1.

### 3.3 Belægning

| `covering` | `r_m2k_per_w` (prior) | `absorb_headroom_k` | Legacy-faktor |
| --- | --- | --- | --- |
| `tile_stone` | 0,015 | 3,0 | 1,0 |
| `vinyl_linoleum` | 0,030 | 2,4 | 0,8 |
| `parquet_laminate` | 0,080 | 1,8 | 0,6 |
| `carpet` | 0,120 | 1,2 | 0,4 |
| `unset` | beregnes som `parquet_laminate` |  |  |

`absorb_headroom_k` = 3,0 K × legacy-faktor. Det bevarer forholdet fra de hårdkodede faktorer, så absorptionsadfærden ikke springer ved migrering.

- `r_override_m2k_per_w` (valgfri, 0–0,25) overstyrer tabelværdien for R. Den påvirker ikke `absorb_headroom_k`.
- Effektiv R > 0,15 SKAL give `warnings: ["high_floor_resistance"]` og vises i begge UI'er.

### 3.4 Strukturmasse

```
c_zone_kwh_per_k = area_m2 × (c_slab_per_m2 + c_struct)
```

`c_struct` er en husparameter for vægge, lofter og inventar. Default **0,06 kWh/(m²·K)**, tilladt interval 0–0,30. Kalibreres af Touch (afsnit 8).

## 4. UA-prior

```
n_walls          = popcount(exterior_walls & 0x0F)          (N=1, E=2, S=4, W=8)
ua_prior_w_per_k = area_m2 × (u_base + u_wall × n_walls)
```

| Parameter | Default | Interval | Enhed |
| --- | --- | --- | --- |
| `u_base` | 0,5 | 0,1–2,0 | W/(m²·K) |
| `u_wall` | 0,4 | 0,0–2,0 | W/(m²·K) per ydervæg |

- `area_m2` = 0 → `ua_prior_w_per_k` = 0 og sløjfen er ikke provisioneret.
- Til **vægtning** er kun forholdet mellem rum afgørende; defaults er tilstrækkelige standalone.
- Til **absolutte** værdier kalibrerer Touch (afsnit 8).

## 5. Effektiv UA

```
ua_source = ua_learned_w_per_k   hvis alle fire betingelser er opfyldt:
                                   · ua_learned findes
                                   · ua_learned_confidence ≥ 0,60
                                   · ua_learned_observed_days ≥ 7
                                   · 0,2 × ua_prior ≤ ua_learned ≤ 5 × ua_prior
            ellers ua_prior_w_per_k

ua_effective_w_per_k = ua_source × ua_weight_override        (override: 0,25–4,0, default 1,0)
```

API rapporterer `ua_source: "prior" | "learned"`.

### 5.1 Konfidens

Touch SKAL beregne konfidens ens for alle sløjfer:

```
confidence = min(1, qualifying_days / 21) × clamp(1 − cv, 0, 1)
cv         = std / mean af de daglige UA-estimater i vinduet
```

En dag er **kvalificeret** kun hvis alle holder:

- mindst 20 timers friske følerdata for sløjfen (ingen z1-push-huller i perioden)
- husets gennemsnitlige ΔT (inde − ude) ≥ 8 K
- sløjfens rumtemperatur ændrer sig netto højst 0,5 K over døgnet (tilnærmet ligevægt)
- leveret energi til sløjfen er målt, ikke estimeret

Ligevægtskravet er bevidst. HL lært på en dag med stort temperatursving er systematisk forkert — samme fejl som Odin 1.x-dataene viste.

Eksempler: 13 kvalificerede dage med cv 0,05 → 0,59 (under tærsklen). 16 dage, cv 0,20 → 0,61.

### 5.2 Stabilitet

Vægte skal være kvasi-statiske, ellers flytter hustemperaturen sig af ikke-fysiske årsager.

- V6 SKAL genberegne `ua_effective` kun ved: konfigurationswrite, accepteret `ua-learned`-write, eller ændring af `u_base`/`u_wall`.
- Touch SKAL skrive `ua-learned` højst én gang per 7 døgn per sløjfe, og kun hvis |ny − nuværende| / nuværende ≥ 0,10, eller konfidensen krydser 0,60.
- Touch SKAL bumpe `weights_revision` og skrive en event hver gang en effektiv vægt ændres.

## 6. τ-prior

```
tau_prior_h = c_zone_kwh_per_k / (ua_effective_w_per_k / 1000)
```

`ua_effective` = 0 → `tau_prior_h` = `null`.

## 7. Absorptionsrang

Rangeres **per gruppe**. Et medlem har ingen egen rang.

```
c_slab_eff = c_slab_kwh_per_k × clamp(c_zone_learned / c_zone_prior, 0,5, 2,0)
             (faktoren = 1 indtil lært τ findes; c_zone_learned = tau_learned_h × ua_effective / 1000)

t_max  = setpoint_c + absorb_band_c                  (eksisterende indstilling, default 1,0)
m_band = clamp((t_max − t_room) / (t_max − setpoint_c), 0, 1)
         (nævner ≤ 0 → m_band = 0)

absorb_capacity_kwh(gruppe) = m_band(gruppe) × Σ_sløjfer (c_slab_eff × absorb_headroom_k)
```

- Rang = sortering efter `absorb_capacity_kwh` faldende. Uafgjort: lavere effektiv R først, derefter laveste `group_id`.
- Ekskluderes (kapacitet 0, rang `null`): gruppe i fejl, gruppe uden friske følere, deaktiveret gruppe, `m_band` = 0.
- API rapporterer `absorb_capacity_kwh` og `absorb_capacity_rank` (1 = bedst).
- Absorptionen fordeles efter rang; inden for en gruppe efter `share_i` (afsnit 2.1).

## 8. Kalibrering mod Odin (Touch)

Kun ved **fuld dækning**: alle sløjfer med tildelt ventil på alle forventede manifolde har `area_m2` > 0, `slab_type` ≠ `unset`, `covering` ≠ `unset`, og tilhører en gruppe med `include_in_house_temperature: true`. Uden fuld dækning SKAL Touch vise den ukalibrerede prior og den konkrete årsag.

Kilde: Odin 2.0 `/api/physics` — lært husvarmetab `HL` (kW/K) og τ (timer).

```
UA:     s        = HL × 1000 / Σ ua_prior_default
        u_base'  = s × u_base_default
        u_wall'  = s × u_wall_default                         s clamp 0,25–4,0

Masse:  TM_odin  = HL × τ_odin                                (kWh/K)
        c_struct' = (TM_odin − Σ c_slab_kwh_per_k) / Σ area_m2  clamp 0–0,30
```

- Rammer `s` eller `c_struct'` et clamp, SKAL Touch stoppe kalibreringen og vise årsagen frem for at skrive clampede værdier. Et clamp betyder at enten Odins fysik eller provisioneringen er forkert.
- Touch skriver `u_base`, `u_wall`, `c_struct` til alle V6'ere med `source: "calibrated"` og tidsstempel.
- Kalibrering BØR ikke køre de første 14 døgn efter en Odin-fysiknulstilling eller -migrering.

## 9. Plausibilitetsgrænser

Erstatter de tidligere absolutte grænser på τ 8–80 t.

| Størrelse | Regel |
| --- | --- |
| Lært τ | afvis hvis uden for \[0,3 × `tau_prior_h`, 3 × `tau_prior_h`\], og uden for absolut \[4, 400\] t |
| Lært UA | afvis hvis uden for \[0,2 × `ua_prior`, 5 × `ua_prior`\] |
| Lært afkølings-/opvarmningsrate | afvis samples over 3 °C/h (spring, ikke fysik) |

Afviste værdier logges med årsag. De må aldrig clampes til grænsen og bruges.

## 10. API-former

### V6 `GET /api/v1/zones` — per sløjfe (udvidelse)

```json
{
  "loop_id": "z1",
  "area_m2": 21.5,
  "exterior_walls": 3,
  "floor": {
    "slab_type": "cast_concrete",
    "active_thickness_cm": 8,
    "covering": "tile_stone",
    "r_override_m2k_per_w": null,
    "c_slab_per_m2": 0.0464,
    "c_slab_kwh_per_k": 0.998,
    "c_zone_kwh_per_k": 2.288,
    "r_m2k_per_w": 0.015,
    "absorb_headroom_k": 3.0,
    "unset": false
  },
  "ua_prior_w_per_k": 27.9,
  "ua_learned_w_per_k": null,
  "ua_learned_confidence": null,
  "ua_learned_observed_days": null,
  "ua_source": "prior",
  "ua_weight_override": 1.0,
  "ua_effective_w_per_k": 27.9,
  "tau_prior_h": 81.8,
  "group_id": "g1",
  "group_role": "single",
  "warnings": []
}
```

### V6 `GET /api/v1/groups`

```json
{
  "groups": [{
    "group_id": "g1",
    "primary_loop": "z1",
    "loops": ["z1"],
    "sensor_ids": ["F8:44:77:2D:0E:B1"],
    "include_in_house_temperature": true,
    "area_m2": 21.5,
    "ua_effective_w_per_k": 27.9,
    "c_slab_kwh_per_k": 0.998,
    "c_zone_kwh_per_k": 2.288,
    "absorb_capacity_kwh": 2.39,
    "absorb_capacity_rank": 1,
    "revision": 4
  }]
}
```

### V6 writes

```
POST /api/v1/zones/{loop_id}/physics
  { expected_revision, area_m2, exterior_walls, slab_type, active_thickness_cm,
    covering, r_override_m2k_per_w, ua_weight_override }

POST /api/v1/groups                    { expected_revision, group_id?, primary_loop, member_loops[],
                                         sensor_ids[], include_in_house_temperature }
POST /api/v1/groups/{group_id}/remove  { expected_revision, confirm: group_id }

POST /api/v1/physics/house             { u_base, u_wall, c_struct, source: "default"|"calibrated",
                                         calibrated_at_epoch_s }            -- kun trusted coordinator

POST /api/v1/zones/{loop_id}/ua-learned
  { ua_w_per_k, confidence, observed_days, ts_epoch_s }                     -- kun trusted coordinator
```

Alle writes: atomare, `409 stale_revision` ved konflikt, `400` med årsag ved validering, `warnings[]` i succes-svaret. Afrunding i svar: areal 0,1 · UA 0,1 W/K · C 0,001 kWh/K · τ 0,1 t · R 0,001. Intern beregning i float32.

## 11. Migrering og rækkefølge

1. **V6** udruller kontrakt v1 (felter, afledte værdier, grupper, `physics_contract: 1`). Eksisterende sløjfer får `slab_type: unset`, `covering: unset`, `exterior_walls: 0`.
2. **Touch, samme vindue:**
   - stop import af `wind_exposure`/`solar_gain` fra V6; seed kun hvis Touch intet har
   - skriv Touch' gemte ydervægge til alle sløjfer i hvert rum via `POST .../physics`
   - skriv eksisterende arealer til V6 hvis V6 har 0
3. Operatøren udfylder gulvkonstruktion og belægning (UI'et fremhæver `floor.unset`).
4. Touch aktiverer kalibrering (afsnit 8) når dækningen er fuld.
5. Touch aktiverer UA-læring (afsnit 5) og write-back.

Lander 1 uden 2, overskriver Touch fortsat vind/sol. Lander 2 før 1, går ydervæggene tabt.

## 12. Testvektorer

Med defaults (`u_base` 0,5, `u_wall` 0,4, `c_struct` 0,06), sætpunkt 21,0, rum 21,2, `absorb_band_c` 1,0 → `m_band` = 0,8. Tolerance 0,5 %.

| # | Areal | Vægge | Dæk | Tykkelse | Belægning | c_slab | UA_prior | c_zone | τ_prior | Absorb |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 21,5 | 3 (N+E) | cast_concrete | default | tile_stone | 0,998 | 27,95 | 2,288 | 81,8 | 2,394 |
| 2 | 12,0 | 0 | screed | default | parquet_laminate | 0,348 | 6,00 | 1,068 | 178,0 | 0,501 |
| 3 | 15,0 | 12 (S+W) | timber_joists | — | carpet | 0,120 | 19,50 | 1,020 | 52,3 | 0,115 |
| 4 | 18,0 | 8 (W) | cast_concrete | 12 | vinyl_linoleum | 1,253 | 16,20 | 2,333 | 144,0 | 2,405 |
| 5 | 10,0 | 1 (N) | dry_plates | 5 → ignoreres | tile_stone | 0,050 | 9,00 | 0,650 | 72,2 | 0,120 |

Vektor 2 og 4 ligger over den gamle grænse på 80 t — det er korrekt fysik for rum med få ydervægge, og netop grunden til at grænsen er erstattet.

Vektor 5 SKAL returnere `warnings: ["thickness_ignored"]`.

Kalibreringsvektor: kun rum 1–3 provisioneret (Σ UA_prior 53,45 W/K) mod Odin HL 0,225 kW/K giver `s` = 4,21 → over clamp 4,0 → **kalibrering SKAL stoppe** med årsagen "ufuld dækning eller inkonsistent fysik". Det illustrerer hvorfor fuld dækning er et krav.