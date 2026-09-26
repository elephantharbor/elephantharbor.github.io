# New segment operating desk — surface & layout checklist

**Issued:** 2026-09-26 by Wells (Portfolio Systems)  
**Audience:** Segment CEOs and agents standing up a new Harbor console desk

## Reference desks (do not reinvent chrome)

| Exemplar | Use for |
|----------|---------|
| **Harbor Capital** | Opaque **card/panel layout** — every readable view sits on `background: var(--bg2)` with `border: 1px solid var(--border)`. Tables live inside `.card.table-wrap` / `table.data` (or shared `.eh-desk-*` primitives). |
| **Harbor Local Prospects** | **Filterable grid data** — sort/filter/paginate via [`shared/eh-desk-grid.js`](../shared/eh-desk-grid.js); contract in [DESK-GRID.md](DESK-GRID.md). |
| **Harbor Eats** (`harbor-eats/`) | Thin segment CSS + shared console; multi-tab SPA with snapshot-driven views. |

## Hard rule

**Never ship readable content on the atmosphere grid.** Headings, paragraphs, tables, lists, and empty states must sit inside an opaque desk surface (`.card`, `.eh-desk-panel`, `.eh-desk-card`, `.eh-desk-grid`, session-log panel, etc.). Decorative background aurora/grid is not a text surface.

## Load order

```html
<link rel="stylesheet" href="../shared/eh-console.css?v=…" />
<script src="../shared/eh-theme.js?v=…"></script>
<link rel="stylesheet" href="static/segment.css" />
<body class="eh-<segment>">
```

Keep `static/segment.css` **thin** — badges, room-specific layout, segment accent leftovers only. Do not fork tokens, topbar, wayhome, or desk surfaces.

## Shared desk surface classes (`eh-console.css`)

| Class | Purpose |
|-------|---------|
| `.eh-desk-view` | Vertical stack wrapper for a primary nav view |
| `.eh-desk-panel` | Top-level opaque panel for a tab/section (title + body) |
| `.eh-desk-card` | Capital-style card; nest for subsections |
| `.eh-desk-table-wrap` + `table.eh-desk-table` (or `table.data`) | Scrollable tables on `--bg2` |
| `.eh-desk-empty` | Empty states: dashed border on `--bg2` |

Legacy `.card` / `.empty` in `eh-console.css` remain valid; prefer `.eh-desk-*` for new markup so audits are obvious.

## Way-home nav (required)

Every desk includes portfolio way-home with **all** segments linked; mark current segment `class="active"` + `aria-current="page"`. Pattern: [shared/README.md](../shared/README.md).

## Checklist before first publish

1. **Surfaces** — Walk every primary nav view: overview, lists, history/log, lessons, docs, empty/error/loading. All readable blocks inside opaque panels.
2. **Grid tables** — If the view is filterable/sortable tabular data, adopt [DESK-GRID.md](DESK-GRID.md) instead of a one-off table.
3. **Loading / empty** — No business numbers until data resolves; empty copy inside `.eh-desk-empty` or `.empty` on `--bg2`.
4. **Auth vs public** — Public github.io paths show public-safe snapshots only; auth-only fields stay on `console.elephantharbor.com` via gate assets.
5. **Sync** — Material desk changes same turn as SoR; remirror segment summary for portfolio tile when needed ([SYNC.md](SYNC.md)).
6. **Cache bust** — Bump `?v=` on `eh-console.css` and segment assets when styles change.

## Related canon

- [ORG-OPERATING-STANDARDS.md](ORG-OPERATING-STANDARDS.md) §1, §6  
- [DESK-GRID.md](DESK-GRID.md) — grid/query primitive  
- [shared/README.md](../shared/README.md) — design system entry
