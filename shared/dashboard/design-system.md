# Lune Dashboard Design System

Status: canonical design contract for Lune Touch and Lune V6 dashboards.

This document defines shared visual and interaction rules. It does not create a shared runtime package: each device keeps its own dashboard implementation and safety boundaries.

The system adapts Apple Human Interface Guidelines to a dark, browser-based heating appliance. It uses familiar navigation, clear hierarchy, progressive disclosure, semantic color, and touch-safe controls without trying to imitate a native Apple app pixel for pixel.

## Product intent

The interface must answer three questions in this order:

1. Is the house comfortable and is the system healthy?
2. Does the user need to act now?
3. Where can the user inspect or change details?

The first screen is a decision surface, not a telemetry archive. Detailed telemetry, identifiers, diagnostics, and configuration belong in dedicated views or behind disclosure controls.

## Design principles

### Purpose

Every element must support monitoring, understanding, or acting. Remove decorative containers, repeated labels, and data that does not change the next decision.

### Hierarchy

Use size, position, spacing, and label hierarchy before borders or color. A view has one title, one clear primary status, and at most one prominent action per task context.

### Familiarity

Navigation behaves like a familiar sidebar on wide screens and a labeled tab bar on compact screens. Toolbars contain actions for the current view; navigation never masquerades as an action.

### Progressive disclosure

Show the current state and next action first. Put evidence, histories, raw values, identifiers, and advanced settings one level deeper. Essential controls are never hidden in a More menu.

### Consistency

The two themes share layout, neutral surfaces, typography, component behavior, and semantic status colors. Only the product accent changes.

### Accessibility

The interface remains understandable without color, glow, hover, animation, or perfect vision. Keyboard, touch, and pointer use are first-class input modes.

## Information architecture

### Top-level destinations

Use stable nouns and keep the hierarchy no deeper than two levels.

| Group | Destination | Primary purpose |
|---|---|---|
| Home | Overview | Whole-house state, exceptions, and next action |
| Home | Heat source | Current source state and the boundary between Touch and source ownership |
| Home | Zones | Comfort and target by logical zone |
| System | Manifolds | V6 availability, trust, and zone distribution |
| System | Weather | Forecast and preload decisions |
| System | Commands | Command ledger and blocked actions |
| System | Diagnostics | Runtime health, evidence, logs, and recovery |
| System | Settings | Coordinator identity, installation, and infrequent preferences |
| System | Help | Contextual guidance, ownership, and installation continuation |

Do not expose the same destination simultaneously as a sidebar item, dashboard card, and toolbar button. Dashboard links may deep-link to a problem, but they do not duplicate the navigation model.

Help is a utility, not a work destination. On wide layouts, place it at the bottom of the sidebar, visually separated from Home and System. On compact layouts, place it in the labeled More menu. Prefer contextual links that open the relevant Help topic; do not place Help among frequent operational destinations.

### Dashboard content order

1. **Primary state** — comfort, heating demand, and system availability.
2. **Needs attention** — only actionable exceptions, ordered by severity.
3. **Zones** — a compact, scannable list of relevant comfort zones.
4. **Context** — forecast, source, coverage, and system evidence on demand.

Healthy or unchanged diagnostics should collapse into a single summary. Empty sections should explain the state and, when useful, offer one next action.

## Adaptive app shell

### Wide layout

- A persistent leading sidebar provides top-level navigation.
- The selected destination uses both a shape and accent treatment; color alone is insufficient.
- The sidebar can collapse from `224px` to `72px`, but must remain discoverable.
- A sticky toolbar identifies the current view and contains only global or view-level actions.
- Main content has a readable maximum width of `1120px` and uses `28px 34px 64px` padding.
- Pane separators are `1px`; do not use heavy dividers.

### Compact layout

At `900px` and below in the browser dashboard:

- Replace the sidebar with a persistent bottom tab bar.
- Show four frequent destinations: Overview, Zones, Heat Source, and Manifolds.
- Put Help, Weather, Commands, Diagnostics, and Settings in a labeled More menu.
- Every tab includes an icon and a one-word label.
- A destination remains available when its data is unavailable; the view explains why.
- Reserve enough bottom padding that content and controls never sit behind the tab bar.

### Local 7-inch Touch display

The built-in `1024 × 600` landscape display is an operational surface, not a miniature copy of the browser dashboard. Adapt the HIG hierarchy to the fixed appliance context:

- Use one persistent heating dashboard without a sidebar, tabs, or local destination hierarchy.
- Avoid a boxed top header. Place the restrained Lune Touch title, the one-line house summary, and Live state directly in a stable top status region separated from content by one hairline. Branding must not consume space needed by heating state. Current problems use a separate bottom banner that is absent when the system is healthy. Never let live copy alter the status-region geometry.
- Organize physical output as a manifold matrix. Each V6 occupies one horizontal band containing one manifold identity column and a standard `3 × 2` grid for its six physical zones. Show one band at full height for a six-zone installation and two equal bands for a twelve-zone installation.
- Show at most two manifolds (`12` zones) per fixed Touch display page. For three or four manifolds, expose a second ordered page with explicit previous/next controls and a visible page position; hide paging entirely when only one page exists. Recalculate geometry only when topology or the selected page changes, never for routine telemetry refreshes.
- Import each physical zone name, sensor state, applied setpoint, and valve output from V6. Touch must not ask people to map, rename, or assign the same physical output again. Missing zones direct people to the respective V6 manifold. Touch may still express whole-house comfort intent and temporary adjustments without taking ownership of physical zone configuration.
- A zone cell shows only its imported name, current temperature, applied setpoint, a small semantic status dot, and a quantized five-step vertical valve-flow gauge (`0`, `1–20`, `21–40`, `41–60`, `61–80`, `81–100%`). The fixed column header carries the physical Z-number once for every manifold row.
- On the physical RGB panel, prioritize legibility over browser-like density: zone names use at least the `16px` embedded font, current temperatures at least `22px`, secondary setpoints at least `16px`, and the top title at least `22px`. Use Regular, Medium, or Semibold weights; never use Light or Thin. The fixed-density hardware cannot provide Dynamic Type, so validate the result on the actual panel at normal standing distance.
- Use the neutral warm graphite surface stack for most area. Color has one meaning: orange for heating and primary action, cyan for measured temperature, violet for target/forecast intent, green for healthy/live, red for fault, and gray for unavailable. Every colored state also retains a label, dot, gauge, or other non-color cue.
- Treat repeated room names across cells as intentional physical-loop evidence. Tapping any imported loop opens the one logical-room control modal, and the resulting target applies to every loop associated with that logical zone.
- Show Heat Source as status only: on/off, the house signal sent, and its confirmed temperature. Physical zone configuration, source configuration, diagnostics, firmware, identity, and recovery remain browser-first.
- Place Heat Source and forecast/preload together in one fixed horizontal bottom status rail. They are secondary evidence and must not reduce the width of manifold or zone cells. When an actionable current problem exists, replace the rail with the problem banner instead of stacking another surface; command history and normal activity remain browser-first.
- Use at least `48 × 48px` local controls, exceeding the HIG `44pt` baseline to account for a fixed wall display and imprecise standing input.
- Tapping a zone opens one centered modal for `−0.5`, `+0.5`, Boost, and Away. The modal must have an explicit Close action and must never open another modal.
- Always name the selected zone above controls. Never let an action silently target a strategy-selected or hidden room.
- Give every action immediate textual feedback. Do not rely on a color change, toast timing, or hover state.
- Dynamic labels use opaque backgrounds and fixed bounds. Coalesce the display model into one refresh token, update only after visible values change, and use LVGL partial invalidation (`full_refresh: false`). Never include polling generations, last-seen timestamps, or recurring write timestamps in the visual token. Start with a `12%` draw buffer on the PSRAM-backed RGB display and profile before increasing it.
- Show an initialization overlay immediately instead of a blank frame. Because startup duration is unknown, use an animated indeterminate indicator and a concise “Starting local heating control” status; never invent a completion percentage. Remove the overlay on the first complete coordinator display pass. Keep it visually continuous with the dashboard rather than treating launch as a branding opportunity.
- Avoid software keyboard flows for routine operation. Free-text entry and destructive recovery belong in the browser dashboard.

### Toolbar anatomy

| Zone | Content |
|---|---|
| Leading | Current view title and optional concise context |
| Center | At most one group of frequent view actions |
| Trailing | Live state, accent selection, and one primary action when needed |

Use no more than three functional groups. Move secondary actions to a contextual More menu. Keep task-specific controls next to the content they affect instead of sending users to Setup.

## Layout and spacing

Use a 4-point base grid.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}
```

Recommended relationships:

| Relationship | Space |
|---|---|
| Icon to label | `8px` |
| Label to value | `4–8px` |
| Related rows | `8–12px` |
| Content inside a group | `12–16px` |
| Between groups | `24px` |
| Between major sections | `32px` |

Prefer a single reading axis. Use columns only when the content is genuinely parallel and remains readable at the available width. Text-heavy information belongs in rows or grouped lists, not equal-sized card grids.

## Color and themes

### System appearance and semantic neutrals

The browser's current system appearance chooses the light or dark neutral palette through `prefers-color-scheme`. This is automatic and updates live when the operating-system setting changes. Do not add a separate light/dark preference: it duplicates a setting the system already provides.

The selected Lune theme is an accent choice only. Refined Ember and Deep Forest persist independently of system appearance, so each accent works with both neutral palettes. Label this control **Accent**, not Appearance or Theme.

Use a dark fallback for older embedded browsers that don't expose `matchMedia`, and declare `color-scheme: light dark` so native form controls follow the same appearance.

### Dark neutrals

```css
:root {
  --bg: #0b0e14;
  --surface: #131620;
  --surface-base: var(--bg);
  --surface-raised: rgba(255, 255, 255, 0.035);
  --text-main: #f2f5f8;
  --text-strong: #f8fafc;
  --text-muted: rgba(226, 231, 240, 0.62);
  --text-faint: rgba(207, 215, 228, 0.45);
  --border: rgba(199, 211, 232, 0.105);
  --separator-soft: rgba(199, 211, 232, 0.06);
  --separator: var(--separator-soft);
  --control-border: rgba(199, 211, 232, 0.15);
}
```

### Light neutrals

```css
:root[data-color-scheme="light"] {
  --bg: #f5f6f8;
  --surface: #ffffff;
  --surface-raised: rgba(255, 255, 255, 0.84);
  --text-main: #262a31;
  --text-strong: #111318;
  --text-muted: rgba(35, 40, 49, 0.68);
  --text-faint: rgba(45, 51, 61, 0.50);
  --separator: rgba(31, 41, 55, 0.09);
  --control-border: rgba(31, 41, 55, 0.20);
}
```

Surfaces are neutral with a restrained blue cast. Do not tint every panel with the theme accent. Depth comes primarily from hierarchy and separators, not a stack of differently colored cards.

### Theme accents

```css
.theme-refined-ember {
  --accent: #F59E0B;
  --accent-rgb: 245, 158, 11;
  --accent-soft-rgb: 252, 211, 77;
  --vbar-gradient: linear-gradient(90deg, #FCD34D, #F59E0B);
}

.theme-deep-forest {
  --accent: #10B981;
  --accent-rgb: 16, 185, 129;
  --accent-soft-rgb: 52, 211, 153;
  --vbar-gradient: linear-gradient(90deg, #34D399, #10B981);
}
```

Bright dark-mode accents use darker accessible variants in light appearance (`#B45309` for Refined Ember and `#047857` for Deep Forest). Semantic success, warning, and danger colors never inherit the selected accent.

Refined Ember is the default. Deep Forest is the alternate. Switching theme changes the accent, selected state, focus ring, and branded emphasis—not the information hierarchy or semantic status colors.

### Semantic status colors

| State | Color | Required companion |
|---|---|---|
| Normal / live | `#34D399` | Text such as “Live” or a status icon |
| Needs attention | `#F59E0B` | Explanation and next action |
| Fault / destructive | `#EF4444` | Error label or warning symbol |
| Informational | `#60A5FA` | Descriptive label |

Never communicate status through color alone. Avoid glow as a normal state treatment; reserve subtle luminance for focus or a genuinely live signal.

### Contrast

- Body text and controls target WCAG AA: at least `4.5:1` for normal text.
- Large or bold text targets at least `3:1`.
- Controls and meaningful graphics target at least `3:1` against adjacent colors.
- Support `prefers-contrast: more` without changing meaning or layout.

## Typography

Use the system font stack. Do not download Montserrat or another display font for interface text.

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
}

h1, h2, .display-value {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
}
```

| Role | Size | Weight | Line height | Use |
|---|---:|---:|---:|---|
| View title | `20px` | `650` | `1.2` | Current destination |
| Primary status | `30–38px` | `650` | `1.05` | One decisive value or state |
| Section heading | `18px` | `650` | `1.25` | Major content groups |
| Row title | `15–16px` | `600` | `1.3` | Scannable item name |
| Body | `15–16px` | `400` | `1.45` | Explanations and supporting values |
| Secondary | `13–14px` | `400` | `1.4` | Supplemental context |
| Metadata label | `12px` minimum | `600` | `1.3` | Short labels only |

Use sentence case. Uppercase is permitted only for short brand marks or compact machine-status labels; it is not the default for headings. Use tabular numerals for changing measurements. IP addresses, IDs, and log fragments may use the mono stack, but ordinary values do not.

Text must be allowed to wrap and the layout must tolerate browser text scaling. Truncation is acceptable only when the full value is available by focus, hover, expansion, or a detail view.

## Surfaces and grouping

### Default: grouped content

Use whitespace, alignment, headings, and `1px` separators to form groups. Rows are preferred for rooms, zones, status facts, command history, and settings.

```css
.content-group {
  background: var(--surface-raised);
  border: 1px solid var(--separator);
  border-radius: 12px;
}

.content-row + .content-row {
  border-top: 1px solid var(--separator-soft);
}
```

### Elevated containers

Use a bordered container only when it encloses one coherent task, selection, form, alert, or disclosure region. Avoid a card for every metric. Nested cards are prohibited unless the inner element is an interactive control with its own boundary.

### Radius and depth

- Groups: `12px` radius.
- Controls: `8–10px` radius.
- Pills: only for compact status tags, segmented selections, or platform-familiar capsules.
- Shadows: one subtle elevation level for floating menus and overlays. Content groups normally use no shadow.
- Gradients: only for a value/progress fill or rare brand emphasis; never as the default panel material.

## Component patterns

### Lists and rows

- Put the item name and primary value on the first line.
- Put one concise explanation or status on the second line.
- Align repeated values consistently; use columns only when comparison benefits.
- Highlight the selected navigation row persistently.
- For long desktop tables, support sorting where it changes the task outcome.
- Use a detail view or disclosure when a row needs more than two supporting facts.

### Buttons

- A button performs an immediate action; a toggle changes persistent state.
- Use one prominent accent-filled button per task context, with two only in exceptional cases.
- Secondary buttons use a neutral fill or text treatment.
- Destructive actions use red and are never the default action.
- Labels begin with a verb: “Approve connection”, “Save name”, “Send now”.
- Icon-only controls require an accessible name and a visible tooltip for pointer users.
- Every custom button has hover, pressed, focused, disabled, and busy states.
- Lune uses a minimum interactive region of `44 × 44 CSS px` for touch surfaces. Apple measurements are points; this is the web-product equivalent, not a unit conversion.

### Menus and selection controls

- Use a pop-up/select control for mutually exclusive states such as Accent.
- Use a pull-down menu for related commands.
- Put frequent, important items first and group related items with separators.
- Use at most one submenu level.
- Do not bury a primary action in More.
- Disabled menu items remain visible and explain unavailable state when context requires it.

### Forms and settings

- Use persistent labels for important fields; placeholders show an example format, not the only label.
- Stack fields vertically by default and keep label-to-field spacing consistent.
- Prefer choices, detected values, and sensible defaults over free text.
- Validate near the field at the appropriate time and preserve entered values after errors.
- Disable Apply or Continue until required input is valid.
- Keep task-specific settings beside the affected content. Settings contains only infrequent product-wide configuration and maintenance.
- Show a switch inside a labeled row. The state must be clear from text or shape as well as color.

### Disclosure

- Essential state and actions stay visible.
- Advanced telemetry, history, identities, compatibility notes, and failure details are collapsed by default.
- Use a descriptive label such as “Connection details”, never a bare “More”.
- A chevron points inward when collapsed and down when expanded.
- Place the control next to the content it reveals and preserve its state when useful.

### Alerts and status

- Lead with what happened, then consequence, then next action.
- Use inline notices for recoverable or contextual issues.
- Reserve modal interruption for destructive confirmation, loss of control, or an immediate safety decision.
- A badge is for a compact status or critical count, not a decorative category label.

### Device and zone collections

Present zones, manifolds, and similar text-heavy collections as one grouped list, not as a grid of equally prominent cards.

- Each primary row contains only identity, user-visible state, and two or three values needed for comparison.
- Keep columns in a stable position so people can scan vertically without rereading labels.
- Use a trailing disclosure indicator for telemetry, identifiers, configuration, and secondary actions.
- Put the next corrective action at the top of expanded content. Keep destructive actions in the detail layer.
- Show setup controls in one disclosure above or below the collection; open it automatically only when the collection is empty.
- On compact widths, retain identity and state, then remove secondary columns before stacking the whole row.
- Keep domain ownership visible in the actions: physical manifold rows navigate to zone settings, while comfort actions such as boost and away live in Zones.
- A manifold detail overview contains no more than four decision-level facts. Flow, return, identity, trust internals, and maintenance controls belong in one secondary device disclosure.

V6 and Touch use the same list-to-detail sequence for Zones. The entire zone row is the navigation target; its chevron only communicates direction and must never be the sole clickable element. A detail view provides “All zones” back-navigation and a labelled pop-up selector with a minimum `44px` interaction height, so another zone can be selected without returning to the list. Zones are content objects, not top-level destinations, so individual zones do not appear as sidebar submenus.

On Touch, a zone is a logical comfort area and can distribute intent across multiple V6 loops. On V6, a zone is one physical local loop. The interface uses “Zone” consistently, while `room_id` and related `room_*` fields remain compatibility names in the API contract until a separately versioned migration is introduced.

Physical hydraulic inputs used by local balancing—zone area, pipe spacing, and pipe type—are configured and retained on V6. Exterior-wall orientation is house/forecast context owned and persisted only by Touch; it must not appear in V6 settings, telemetry, or write routes, and Touch must not mirror it back to a manifold.

V6 Overview keeps hydraulic telemetry in disclosures. The primary temperature shown in a V6 detail is the `effective_setpoint_c` (applied target). `base_setpoint_c` is the local fallback target, while `coordinator_offset_c` and its remaining lifetime explain a temporary Touch adjustment. Calibration, motor learning, and recovery remain behind explicitly named disclosures.

V6 Overview must not repeat the Zones collection. It leads with one overall operating assessment and at most three cross-system facts: heating activity, hydraulic state, and Touch authority. Only actionable exceptions follow. Zone-by-zone temperature, target, valve, and fault comparison belongs exclusively in Zones. Hydraulic graphs, activity history, and connection metadata remain secondary disclosures on Overview.

V6 Settings contains infrequently changed configuration only. Lead with readiness, then group Touch connection, manifold and probes, hydraulic safety, preheat absorption, and motor configuration as labelled disclosures. V6 Diagnostics leads with overall health and current exceptions; runtime health, hardware/connectivity, logs, manual control, and recovery follow as progressively disclosed evidence. Manual control and interrupting recovery actions are always last.

### Help, configuration, and service views

- Help is a browsable reference, not a duplicate setup wizard. Lead with the product model, group topics by user task, and show installation continuation only while work remains.
- A connection view leads with one plain-language publishing or connection state, followed by no more than three decision-level facts.
- Configuration fields live in one clearly named disclosure. Open it automatically only when configuration is missing or invalid.
- Settings leads with configuration readiness, not identifiers. Identity and product-wide preferences belong to named disclosures. Runtime evidence belongs in Diagnostics.
- Put diagnostics before recovery. Keep reset and other destructive actions last, visually separated, and explicitly labeled.
- Do not refresh a view in a way that closes a disclosure, clears an edit, or moves focus.

### Diagnostics

- Diagnostics is a first-class System destination, separate from Settings. It must remain directly reachable from primary navigation and must not imply a parent-child relationship with Settings.
- Permission follows ownership: V6 locally approves or revokes coordinator control because V6 receives and enforces commands. Touch displays the resulting status and never presents a control that appears to grant itself access.
- Identity and authentication are system-generated, never normal form fields. Touch creates and persists its installation ID, coordinator ID, and random shared key in its dedicated OTA-stable NVS partition, then presents a time-limited proposal to V6. A firmware update or reboot must not rotate these values or require renewed consent. V6 reduces first connection or an explicit identity replacement to one approval decision. Raw IDs may be shown read-only for identification; the key is never displayed or accepted through generic settings.
- Lead with one overall health statement, followed by no more than three decision-level facts.
- Show current actionable exceptions before raw evidence. Each exception row navigates to the view that can resolve it.
- Group commands and events, connections and installation, coordination, and firmware and recovery into named disclosures.
- Keep raw API paths, counters, logs, slot sizes, learning samples, and recovery controls out of the initial reading path.

### Weather and forecast views

Weather is a decision surface, not a raw feed.

1. Lead with a sentence that states whether forecast handling needs attention and whether preload is active.
2. Show one chart that answers the trend question. Give it a concise textual summary before the plot.
3. List active decisions as rows with zone, timing, and offset. Use a calm empty state when there are none.
4. Place location, limits, cache metadata, command counters, and fetch errors in grouped disclosures.

Do not place status, cache, wind, dispatch, and preload into separate peer cards. They describe one forecast workflow and must share one reading order.

### Charts

- A chart must answer a specific question that text cannot answer as quickly.
- Put the chart in the detail layer unless its trend changes an immediate decision.
- Provide a textual summary and accessible labels for series and latest values.
- Do not rely on orange versus green alone; combine color with labels, line styles, or symbols.

### Empty, loading, and unavailable states

- State what is missing or in progress in plain language.
- Preserve the surrounding navigation and layout.
- Offer one next action only when the user can resolve the state.
- Do not fill empty space with repeated “Unavailable” cards.
- During non-instant actions, show progress in the initiating control and prevent duplicate submission.

## Interaction and accessibility

- Use semantic HTML landmarks, headings, lists, tables, buttons, labels, and form controls.
- Keep DOM order aligned with visual reading order: leading to trailing, top to bottom.
- All functionality works with keyboard alone.
- Use a visible `3px` accent focus ring with sufficient contrast and no layout shift.
- Never move focus unless triggered by user action or required because the focused element disappeared.
- Announce changing live state through an appropriate `aria-live` region without repeating noisy telemetry.
- Do not use hover as the only route to information or action.
- Useful values such as error text, addresses, and identifiers should be selectable.
- Respect `prefers-reduced-motion: reduce` and `prefers-contrast: more`.

## Motion

Motion explains change; it does not decorate the dashboard.

```css
:root {
  --duration-fast: 160ms;
  --duration-standard: 180ms;
  --ease-standard: cubic-bezier(.2, .8, .2, 1);
}
```

- Use short transitions for selection, disclosure, and control feedback.
- Avoid entrance animation for routine page content.
- Do not animate live telemetry on every update.
- Under reduced motion, remove transforms and nonessential transitions.

## Writing

- Use concise sentence case and familiar heating terms.
- Name destinations with nouns and actions with verbs.
- Describe the user-visible condition, not the implementation detail.
- Prefer “No zone sensor data” to “no_coverage”. Technical codes may follow in details.
- Say what the user can do next. Do not assign blame.
- Use “Tap” for the Touch display and neutral wording such as “Choose” where input method is unknown.
- Keep toolbar titles to a word or short phrase.

## Prohibited patterns

- A dashboard made from equally prominent metric cards.
- Cards nested inside cards to manufacture hierarchy.
- Repeating IP addresses, firmware versions, and raw status codes on overview screens.
- Theme-colored panel backgrounds, broad glows, or decorative gradients.
- All-caps headings throughout the interface.
- Pill-shaped styling on every button and value.
- Icon-only navigation without labels on compact layouts.
- A sidebar used as a vertical toolbar.
- Navigation actions inside the toolbar or content actions inside the tab bar.
- Color-only status, hover-only help, or invisible keyboard focus.

## Implementation ownership

- `shared/dashboard/` contains this design contract and shared documentation only.
- Lune V6 dashboard source remains under `lune-v6/web/dashboard-src/`.
- Lune Touch dashboard source remains under `devices/lune-touch/web/dashboard-src/`.
- Changes to this document do not implicitly authorize runtime sharing between devices.
- When implementations diverge, record whether the difference is device capability, screen size, or migration debt.

## Review checklist

Before merging a dashboard change, verify:

- The view has one clear purpose, title, primary state, and next action.
- Navigation, toolbar actions, and content actions occupy the correct layer.
- Secondary telemetry is disclosed rather than competing with primary information.
- The design works at both sides of the `900px` breakpoint.
- Touch targets, focus order, focus appearance, contrast, labels, and reduced motion are verified.
- Accent switching changes branding but not meaning or hierarchy.
- System light/dark changes are applied automatically and preserve the selected accent.
- Empty, stale, loading, fault, and partial-data states remain understandable.
- Device ownership and safety behavior are unchanged.

## References

- [Apple Human Interface Guidelines — Foundations](https://developer.apple.com/design/human-interface-guidelines/foundations)
- [Apple Human Interface Guidelines — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple Human Interface Guidelines — Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)
- [Apple Human Interface Guidelines — Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)
- [Apple Human Interface Guidelines — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Apple Human Interface Guidelines — Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables)
