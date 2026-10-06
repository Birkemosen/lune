# Lune V6: Dashboard/Konfiguration → Hjem / ark / System (LDS 2.3)

Endelig placering af hvert felt, hver handling og hvert panel fra den gamle Konfiguration
og det gamle Dashboard (main før LDS 2.3, commit d745b27). `check_fields.py` tjekker, at
hvert navn i `conf_fields.txt` (felter, `action:`, `data-action:` og binderens `bind:`-nøgler)
findes i den nye markup, at grupperne holder grænserne i LDS DESIGN.md 15.5, og at hver
`data-save`-nøgle håndteres af binderen.

Placeringen følger testen i DESIGN.md 15.1: *hører det til én ting i huset* → tingens ark
(zone eller manifold); *gælder det enheden eller forbindelser* → System; *ændres det i en
almindelig uge* → også som hverdagskontrol (målet, autogem).

`{i}` = zone 1–6. "Ark" er en `.sheet`-popover (`#sheet-z{i}`, `#sheet-manifold`); "System" er
`#v-sys` med kategorierne `#c-device`, `#c-manifold`, `#c-connections`, `#c-firmware`,
`#c-service` og `#c-motorlab` (kun synlig, når firmwaren er et dev-build).

## Navigation

| Gammel | Ny |
|---|---|
| Tilstandspille Dashboard / Konfiguration (`#m-dash` / `#m-conf`) | Hjem / System (`#m-home` / `#m-sys`) |
| Omfangsradioer `#s-z1`…`#s-z6` (zonefelterne var `label[for]`) | Kun `#s-sys`; zonefelterne er `button[popovertarget="sheet-z{i}"]` og åbner zonens ark |
| Systemfeltet (`label[for="s-sys"]`) | `button[popovertarget="sheet-manifold"]` |
| Sektioner + sektionslinks på Konfiguration › System | System-kategorier (én ad gangen, én gem-bjælke pr. kategori) |
| Deep link `#s-z3` / `#s-sys` (fra Lune Touch) | Omskrives af binderen til `#z3` / `#manifold`; nye links: `#z3/indstillinger`, `#system/forbindelser` (slugs fra i18n `hash.*`) |

## Hjem (`#v-home-sys`) — ingen gem-knapper

| Indhold | Gammel placering | Ny placering |
|---|---|---|
| Statuslinje (zoner, kalder, fejl) | Dashboard › System, overskrift | Hjem, overskrift (`dash.sys.sub`) |
| Fejlpanel «Z… har en motorfejl» | Dashboard › System | Hjem, øverst; knappen åbner zonens ark |
| Varme nu: fremløb, retur, ΔT, samlet åbning, 24 t-graf | Dashboard › System | Hjem › Varme nu (+ «Åbn manifold») og Manifold-ark › Overblik/Historik |
| Komfort pr. zone (sparklines) | Dashboard › System | Hjem › Komfort pr. zone; hver række åbner zonens ark |
| Balanceringstabel | Dashboard › System | Manifold-ark › Overblik |
| Enhed: Wi-Fi-signal, oppetid, online, log | Dashboard › System › Enhed | System › Service › Diagnostik / Enhedslog |

## Zone (gammel: Dashboard › zone + Konfiguration › zone) → zone-ark

| Felt / handling | Gammel placering | Ny placering |
|---|---|---|
| `z{i}_target` | Dashboard › Komfort (autogem, `zone/{i}/target`) | Ark › Overblik › klima-kontrol (autogem, uændret nøgle) og Ark › Indstillinger › Komfort › Mål (`zone/{i}`) |
| `action:reset_fault` | Dashboard › fejlpanel (`zone/{i}/recovery`); Konfiguration › Motor | Ark › Overblik › fejlpanel (uændret nøgle) og Ark › Indstillinger › Avanceret › Motor og kalibrering (kun ved fejl) |
| Åbning, retur, motor, preheat, vejr-offset, temperatur fra, preload-besked, gruppe-note | Dashboard › Komfort | Ark › Overblik |
| Zonegraf 24 t + 6 t fremskrivning | Dashboard › Temperatur (`.zchart`) | Ark › Historik (`.zc`, LDS 2.3) |
| `z{i}_enabled` | Konfiguration › Rum og følere › Rum | Ark › Indstillinger › Komfort (gemmes med det samme) |
| `z{i}_name`, `z{i}_area` | Konfiguration › Rum og følere › Rum | Ark › Indstillinger › Rum |
| `z{i}_src`, `z{i}_ble` (+ `data-action:ble-scan`, `ble-assign`), `z{i}_ret` | Konfiguration › Rum og følere › Følere | Ark › Indstillinger › Rum (returføler skjult ved 2-følerlayout) |
| `z{i}_merge` | Konfiguration › Rum og følere › Rum | Ark › Indstillinger › Avanceret › Gruppering (underside) |
| `z{i}_spacing`, `z{i}_pipe`, `z{i}_slab`, `z{i}_covering`, `z{i}_thick` | Konfiguration › Gulv og vejr › Gulv og rør | Ark › Indstillinger › Gulv |
| `z{i}_lead` (termisk lead) | Konfiguration › Gulv og vejr › Gulv og rør | **Fjernet** — findes ikke i firmwaren og blev aldrig gemt |
| `z{i}_wall`, `z{i}_wind`, `z{i}_solar` | Konfiguration › Gulv og vejr › Vejr-preload | Ark › Indstillinger › Vejr |
| Motor: ripples, faktorer, preheat adv., seneste fejl, læringsbjælke | Konfiguration › Motor | Ark › Indstillinger › Avanceret › Motor og kalibrering (underside) |
| `action:reset_relearn` | Konfiguration › Motor (footer) | Ark › Indstillinger, sidst (`.confirm-pop`) |

Gem-nøgler: `zone/{i}/room`, `zone/{i}/floor` og `zone/{i}/motor` er slået sammen til
`zone/{i}` med `data-patch`. Binderen skriver kun de dele, der er ændret (`changed`):
mål → `setSetpoint`; rum-felter → samme skrivninger som før `room`; gulv/vejr-felter → samme
skrivninger som før `floor`; `action` → `reset_fault` / `reset_relearn` som før `motor`.

Grupperede medlemszoner: Overblik viser «Z5 følger Z4» med en knap, der åbner Z4's ark;
målet (overblik og indstillinger) er låst.

## Manifold (gammel: Dashboard › System + Konfiguration › Regulering) → manifold-ark

| Felt / handling | Gammel placering | Ny placering |
|---|---|---|
| Fremløb, retur, ΔT, samlet åbning | Dashboard › Varme nu | Ark › Overblik (+ Hjem) |
| Fremløb/retur 24 t | Dashboard › Varme nu | Ark › Historik (+ Hjem) |
| Balanceringstabel (`bal.*`) | Dashboard › Balancering | Ark › Overblik |
| Live-værdier probe 1–8 (`probe.*`) | Konfiguration › Returfølere | Ark › Overblik › Live værdier |
| `heat_mode`, `heat_min_open` | Konfiguration › Varmetilstand (`heating`) | Ark › Indstillinger › Varmetilstand |
| `hp_demand`, `hp_base`, `hp_overheat`, `hp_trim` | Konfiguration › Varmetilstand › Varmepumpegrænser | Ark › Indstillinger › Varmepumpegrænser (`.hp-limits`) |
| `bal_mode`, `bal_interval`, `bal_step`, `bal_min`, `bal_max` | Konfiguration › Regulering | **Fjernet** — intet `/api/v1/settings`-endpoint (kun backup-import sætter dem), binderen skrev dem aldrig. Tilstanden vises fortsat som badge over balanceringstabellen |
| `preheat_enabled`, `ph_band`, `ph_delta` | Konfiguration › Regulering (gated) | Ark › Indstillinger › Preheat-absorption (gated; switch gemmes med det samme) |
| `action:reset_balancing` | Konfiguration › Regulering (footer) | Ark › Indstillinger, sidst (`.confirm-pop`) |

Systemfeltet i strimlen og overskriften på Hjem hedder «System» (i18n `scope.manifold`); arket hedder «Manifold» (`sheet.manifold`).

Gem-nøgler: `heating` er slået sammen med `regulation` (én gem-bjælke pr. fane); binderen
skriver varmetilstand + varmepumpegrænser og derefter preheat, som de to formularer gjorde.

## System (gammel: Konfiguration › System-sektionerne)

| Felt / handling | Gammel placering | Ny placering |
|---|---|---|
| `device_display_name`, `device_location` | Forbindelser › Enhedsidentitet | System › Enhed › Enhedsidentitet (`device`) |
| `ble_clock_enabled`, sidste synk, `action:sync` | Forbindelser › BLE-ur | System › Enhed › BLE-ur (`ble_clock`) |
| `manifold_type`, `probe_flow`, `probe_return` | Manifold og motorer › Manifold | System › Manifold og motorer › Manifold |
| `return_probe_mode` | Manifold › Returfølere (`return_probes`) | System › Manifold og motorer › Manifold › Følerlayout (`manifold`, `data-patch`) |
| `motor_drivers`, `motor_type`, `m_runtime` | Manifold og motorer › Motorer | System › Manifold og motorer › Motorer (gated) |
| `m_cthr`, `m_cslope`, `m_cfloor` | … › Endestop- og læringsgrænser (`details.more`) | … › Avanceret › Lukke-endestop (underside). Nu koblet på `/settings/number`: `close_threshold_multiplier` (×), `close_slope_threshold` (mA/s), `close_slope_current_factor` (×) med firmwarens enheder og grænser |
| `m_othr`, `m_oslope`, `m_ofloor`, `m_ripple` | samme | … › Avanceret › Åbne-endestop (underside). Koblet på `open_threshold_multiplier`, `open_slope_threshold`, `open_slope_current_factor`, `open_ripple_limit_factor` |
| `m_relmov`, `m_relh`, `m_minsamp`, `m_maxdev` | samme | … › Avanceret › Genlæring (underside) |
| `action:relearn_all` | Manifold og motorer › Motorer | System › Manifold og motorer, sidst (`.confirm-pop`) |
| Lune Touch: status, navn, leverer, `action:approve/cancel/retry/revoke`, tekniske id'er (kopiér) | Forbindelser › Lune Touch | System › Forbindelser › Lune Touch (handlinger efter tilstand, 6.1b; id'er som underside) |
| `ssid`, `password`, netværk, status | Forbindelser › Wifi | System › Forbindelser › Wifi (`wifi`) |
| Eksterne rumtemperaturer (hjælpetekst) | — (kun i kataloget) | System › Forbindelser, sidst |
| Firmware: installeret, seneste, `action:check/install/upload`, `ota_file` | Service › Firmware | System › Firmware og backup › Firmware |
| `include_learned`, `action:export`, `backup_file`, `action:import` | Service › Sikkerhedskopi | System › Firmware og backup › Sikkerhedskopi; import nu med `.confirm-pop` |
| CPU, heap, PSRAM, `action:dump_tasks/i2c_scan/dump_ow`, I²C-log | Service › Kørselsstatus | System › Service › Diagnostik |
| Log, `action:logs_pause/logs_clear/logs_download` | Service › Enhedslog | System › Service › Enhedslog |
| `manual_mode`, `man_zone`, `man_target`, `action:stop/move` | Service › Manuel motorstyring | System › Service › Manuel motorstyring (gated) |
| `man_dir`, `man_seconds`, `action:timed` | Service › Manuel › Tidsstyret kørsel | … › Manuel motorstyring › Tidsstyret kørsel (underside) |
| `action:reset_probe_map`, `action:restart` | Service › Enhed | System › Service, sidst (`.confirm-pop`) |
| Nødstop alle motorer (`data-action:motorlab-estop`) | — (binderen havde handleren) | System › Motorlab (kun dev-firmware, `data-dev-only`) |

Header-menuen (Om enheden, kopiér diagnostik, andre Lune-enheder) er uændret.

## Afvigelser fra LDS' examples/v6

- **Ingen vejrudsigt på Hjem.** Produktet viser ikke vejret (Touch ejer vejret, og V6 har
  ingen udsigtsdata); `fc_*`-felterne og lat/lon findes ikke i produktet.
- **Flere System-felter:** Wifi, BLE-ur som egen formular, følerlayout, firmware-upload,
  sikkerhedskopi med lærte værdier, diagnostik (CPU/heap/I²C/1-Wire) og logkontrol.
- **Hjælp-popovers** (`.help-btn` i gruppeoverskrifterne) er bevaret.
- **Ventilrækken under zonegrafen** mangler: historikken har ingen ventilprocent pr. zone
  (kun tilstandskoder), så `.zc-valve` udelades i stedet for at vise et gæt.
- **Fejl-nulstilling** er primær i fejlpanelet (DESIGN.md 5.15), som i produktet før.
- **lune-forms.js** ligger i `binder.js` (esbuild-alias `lds-forms`) i stedet for en egen
  `/lune-forms.js`-rute, så firmwaren ikke skal have en ny route.
