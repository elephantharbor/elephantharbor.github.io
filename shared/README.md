# EH operating-console design system

**Source of truth:** this folder on `elephantharbor/elephantharbor.github.io`.

## Consume from a segment desk

```html
<link rel="stylesheet" href="https://elephantharbor.github.io/shared/eh-console.css" />
<link rel="stylesheet" href="static/segment.css" />
<body class="eh-capital"> <!-- or eh-foundry / eh-presence / eh-portfolio -->
```

Keep `static/segment.css` **thin**: segment accent leftovers and room-specific layout only. Do not fork tokens, topbar, wayhome, badges, or cards.

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

## Future segments

Inherit this system by default. Define content, metrics, data, and IA only — not global colors, type, cards, or nav chrome.
