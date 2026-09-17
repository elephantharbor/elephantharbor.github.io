# Desk grid / query primitive (OS v2 console §6)

**Issued:** 2026-09-17 by Wells (Portfolio Systems)  
**Module:** `shared/eh-desk-grid.js` + `.eh-desk-grid` in `shared/eh-console.css`  
**Exemplar adopter:** Harbor Local Prospects desk (separate repo)  
**Later adopters:** Capital, Foundry, Presence market/venture grids

## Goal

One reusable, framework-free helper so every operating desk table shares the same query contract: sort, filter, paginate, and count from **one resolved query** — never a mismatched counter while data is still loading.

## Hard rules (Thomas / ORG-OPERATING-STANDARDS §6)

1. **Single resolved query** drives rows, filtered count, pagination, and active filters together. Never flash a wrong count while loading.
2. **Honest loading/empty states** until that query resolves (`status: 'loading'` → spinner/`…`; `status: 'ready'` → counts allowed).
3. **URL-persisted query state** — shareable links and refresh-safe back/forward (`createQuery` + `history.pushState` / `popstate`).
4. **Human-readable dates and statuses in UI** — use `EH.DeskGrid.fmtDate` / `fmtDateTime`; IDs secondary in row HTML.
5. **Accessible chrome** — keyboard-focusable sort headers (`button` + `aria-sort`), pagination buttons, `aria-live` on counters.

## Load

```html
<link rel="stylesheet" href="https://elephantharbor.github.io/shared/eh-console.css" />
<script src="https://elephantharbor.github.io/shared/eh-desk-grid.js"></script>
```

Segment desks already load `eh-console.css`; add the script when adopting a grid.

## API surface

| Function | Purpose |
|----------|---------|
| `EH.DeskGrid.createQuery({ defaults, filterKeys, useHash })` | Parse / serialize / write URL (or hash) query: `page`, `pageSize`, `sort`, `dir`, plus filter params |
| `EH.DeskGrid.resolve({ rows, query, filterFn, sortFn, pageSize, status })` | One pass → `{ rows, total, filteredTotal, page, pageSize, totalPages, query, status }` |
| `EH.DeskGrid.renderShell({ id, title, columns, result, toolbarHtml, tbodyHtml })` | Optional table chrome (toolbar, counter, thead, tbody slot, pager) |
| `EH.DeskGrid.renderLoading()` / `renderEmpty(result)` | States that **refuse stale counts** |
| `EH.DeskGrid.renderCounter(result)` | Shows `…` until `status === 'ready'` |
| `EH.DeskGrid.renderPagination(result)` | Prev/next when `totalPages > 1` |
| `EH.DeskGrid.renderSortHeader(col, result)` | Accessible sort `<th>` |
| `EH.DeskGrid.bindChrome(root, queryCtrl, onChange)` | Wire sort + pagination clicks |
| `EH.DeskGrid.fmtDate` / `fmtDateTime` | America/Chicago display helpers |

Reserved URL params: `page`, `pageSize`, `sort`, `dir`. All other keys listed in `filterKeys` (or any key when `filterKeys` omitted) become `query.filters`.

## Adoption recipe

### 1. Define defaults and filter keys

```javascript
var queryCtrl = EH.DeskGrid.createQuery({
  defaults: {
    page: 1,
    pageSize: 25,
    sort: "lastTouch",
    dir: "desc",
    filters: {},
  },
  filterKeys: ["q", "status", "owner", "stage"],
});
```

### 2. Load data → resolve once → paint

```javascript
var pending = { status: "loading", query: queryCtrl.read() };

function paint(result) {
  host.innerHTML = EH.DeskGrid.renderShell({
    id: "prospects-grid",
    title: "Prospects",
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "lastTouch", label: "Last touch", sortable: true },
    ],
    result: result,
    toolbarHtml: filterControlsHtml(result.query),
    tbodyHtml: result.status === "ready" && result.rows.length
      ? result.rows.map(rowHtml).join("")
      : undefined,
  });
  EH.DeskGrid.bindChrome(host.querySelector(".eh-desk-grid"), queryCtrl, reload);
}

function reload() {
  paint(pending);
  fetchProspects().then(function (rows) {
    pending = EH.DeskGrid.resolve({
      rows: rows,
      query: queryCtrl.read(),
      filterFn: myFilterFn,
      sortFn: mySortFn,
    });
    paint(pending);
  });
}

window.addEventListener("popstate", reload);
reload();
```

### 3. Filter changes reset page

When a filter control changes, call `queryCtrl.patch({ filters: { status: value }, page: 1 })` then `reload()`.

### 4. Host-owned row HTML

`renderShell` does not dictate row shape. Map `result.rows` to your own `<tr>` HTML. Show human labels for status; put record IDs in `data-*` or a secondary column.

## Local Prospects mapping (reference)

Harbor Local Prospects lives outside this public repo. Expected mapping:

| Query filter | Row field | Notes |
|--------------|-----------|-------|
| `q` | `name`, `company` | Case-insensitive substring |
| `status` | `status` | Exact match on display status |
| `owner` | `owner` | Exact match |
| `stage` | `stage` | Exact match |
| `sort=lastTouch` | `lastTouch` | ISO date, default desc |

See the comment block at the bottom of `shared/eh-desk-grid.js` for a copy-paste sketch.

## What hosts must not do

- Show `filteredTotal` or “N rows” while `status !== 'ready'`.
- Filter in the DOM and count in JS from different sources.
- Drop URL state on refresh (always read `queryCtrl.read()` before resolve).
- Use raw IDs as the primary cell text.

## Manual vs automatic

- **Manual (segment owner):** row data truth, filter semantics, column labels, when to refetch.
- **Automatic (shared module):** query parse/serialize, single-pass resolve, counter/pager/sort chrome, loading guardrails.

## Related canon

- [ORG-OPERATING-STANDARDS.md](ORG-OPERATING-STANDARDS.md) §6
- [OS-V2-DOCTRINE.md](OS-V2-DOCTRINE.md)
- [shared/README.md](../shared/README.md)
