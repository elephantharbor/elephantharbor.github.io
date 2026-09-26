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

## Way-home nav (required on every desk)

```html
<nav class="wayhome" aria-label="Elephant Harbor">
  <a href="https://elephantharbor.github.io/">Elephant Harbor / Portfolio</a>
  <span class="sep" aria-hidden="true">/</span>
  <a href="https://elephantharbor.github.io/harbor-capital-desk/">Capital</a>
  <a href="https://elephantharbor.github.io/harbor-presence/">Presence</a>
  <a href="https://elephantharbor.github.io/harbor-foundry/">Foundry</a>
</nav>
```

Mark the current segment link with `class="active"` and `aria-current="page"`.

## Shared JS modules

| Module | Purpose | Doc |
|--------|---------|-----|
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
