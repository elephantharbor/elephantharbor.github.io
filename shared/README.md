# EH operating-console design system

**Source of truth:** this folder on `elephantharbor/elephantharbor.github.io`.

## Consume from a segment desk

```html
<link rel="stylesheet" href="https://elephantharbor.github.io/shared/eh-console.css" />
<link rel="stylesheet" href="static/segment.css" />
<body class="eh-capital"> <!-- or eh-foundry / eh-presence / eh-portfolio -->
```

Keep `static/segment.css` **thin**: segment accent leftovers and room-specific layout only. Do not fork tokens, topbar, wayhome, badges, or cards.

**Desk surfaces:** Use shared `.eh-desk-panel`, `.eh-desk-card`, `.eh-desk-table-wrap`, and `.eh-desk-empty` in `eh-console.css` so readable content never sits on the atmosphere grid. Checklist: [NEW-SEGMENT-DESK.md](../docs/NEW-SEGMENT-DESK.md).

## Main content width

All desks inherit the **Local-wide** `main` / `.foot` column from `eh-console.css` (1280px default; 1680px at ≥1400px; 1840px at ≥1800px). Do not set `main { max-width }` in segment CSS.

## Way-home nav (required on every desk)

**Single source of truth:** [`eh-wayhome.js`](eh-wayhome.js) — Portfolio · Capital · Presence · Foundry · Local · Eats · Reach · Gaming (console URLs).

```html
<nav class="wayhome" aria-label="Elephant Harbor"></nav>
<script src="https://elephantharbor.github.io/shared/eh-wayhome.js?v=…"></script>
```

On load, `EH.Wayhome.mount` fills the nav (idempotent). Active segment is inferred from `body.eh-<segment>`, `data-eh-segment` on `<body>` or `<nav>`, or pass `{ active: "foundry" }`. Opt out of auto-mount with `data-eh-wayhome="off"` on the nav.

Adding a segment: edit the `LINKS` list in `eh-wayhome.js` and add wayhome accent tokens in `eh-console.css` if needed.

## Shared JS modules

| Module | Purpose | Doc |
|--------|---------|-----|
| `eh-wayhome.js` | Portfolio way-home nav | [NEW-SEGMENT-DESK.md](../docs/NEW-SEGMENT-DESK.md) |
| `eh-theme.js` | Dark/light toggle | [CONSOLE-THEME.md](../docs/CONSOLE-THEME.md) |
| `eh-session-log.js` | Session log + date helpers | [SESSION-LOG-CONTRACT.md](../docs/SESSION-LOG-CONTRACT.md) |
| `eh-active-ventures.js` | Active ventures cards | [ACTIVE-VENTURES.md](../docs/ACTIVE-VENTURES.md) |
| `eh-learning.js` | Learning desk cards | [LEARNING-DESK.md](../docs/LEARNING-DESK.md) |
| `eh-desk-grid.js` | Desk grid / query primitive | [DESK-GRID.md](../docs/DESK-GRID.md) |

```html
<script src="https://elephantharbor.github.io/shared/eh-desk-grid.js"></script>
```

## Future segments

Inherit this system by default. Define content, metrics, data, and IA only — not global colors, type, cards, or nav chrome.
