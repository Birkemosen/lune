# Optional ODIN Plan Ingestion

## Current State

The installation explicitly authorizes Touch to read the direct JSON response from
`http://192.168.20.54/dashboard/odin`. Although its route name is `dashboard`, the
observed response is `application/json`, not rendered HTML or a browser scrape. It is an
Asgard-published ODIN planning snapshot with a 72-point day-aligned window, schedule
bounds, prices, weather/solar, expected temperatures, heat production, and raw
operation-mode codes. `today_start_index + current_hour` identifies the current point.

Touch polls this approved source at most every five minutes and validates all 72 elements
of the schedule, expected-temperature, price, heat-production, and raw mode arrays before
exposing only the current plan point. The plan is advisory: it does not issue valve commands, modify physical
temperature aggregation, or change Touch comfort/schedule intent. A fetch or validation
failure leaves core control unchanged and becomes stale after 20 minutes.

## Future Read-Only Contract

The currently authorized response does not contain a version, generation timestamp,
or a self-describing raw operation-mode mapping. The installed optimizer source currently
maps raw `1` to DHW, `2` to heat, `3` to cooling, and `255` to unavailable; all other
values (including NaN) become off. Its frost-protect and legionella alternatives are
commented out in that mapper, even though the upstream enum declares their values. Upstream
tracks defrost through a separate `status_defrost` binary sensor, which is not present in
the authorized debug response. Consequently this response cannot identify defrost, an
active legionella cycle, or a fault; unavailable is not a fault diagnosis. The integration
therefore fails closed on shape or numeric errors and must not use `operation_mode` to
infer those contexts until ODIN supplies them explicitly. Any future expansion needs:

- API version and plan revision;
- generation and expiry timestamps with declared timezone;
- explicit freshness / availability status;
- declared operating context (for example space heating, DHW, defrost, fault);
- optional timing intent as advisory data, never an actuator command;
- a documented authentication and rate-limit model.

An unavailable, stale, malformed, unsupported-version, or expired snapshot is ignored. It
must not manufacture room demand, trigger learning, alter V6 fallback behavior, or block
normal Touch operation. Active valve distribution requires a separate explicit policy that
maps the approved plan semantics to logical rooms and retains V6's local validation,
clamping, and expiry.

## Commissioning Decision

The approved endpoint may be read only. ODIN remains the heat-pump optimizer; Touch may
later distribute an explicitly defined plan across logical rooms; V6 provides safe local
heating plus explicit fallback. This explicit project decision permits this direct JSON
route; it does not permit HTML/dashboard scraping or undisclosed endpoints.
