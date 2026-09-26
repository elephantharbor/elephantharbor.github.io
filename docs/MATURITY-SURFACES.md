# Portfolio maturity surfaces

**Directive:** Organisational Maturity — Thomas, 2026-09-26  
**Last reviewed:** 2026-09-26 (America/Chicago)

## Ownership

| Role | Owner | Responsibility |
|------|-------|----------------|
| Segment CEO | Holt, Maren, Calder, Blair, Cora, Reef, Gage | Business correctness and freshness of segment tiles, experiments, and maturity stage claims |
| Portfolio Systems | Wells | Shared chrome, Worker republish, **freshness alarms** on stale tiles |
| Portfolio CEO | Hayes | Aggregated usefulness — maturity rollup and experiment registry on the Portfolio console |

See also `DASHBOARD_OWNERSHIP.md` (reference) for the full contract.

## Published data (SoR mirror)

| File | Purpose |
|------|---------|
| `data/maturity/SEGMENT_MATURITY.json` | Per-segment **stage**, evidence notes, **next milestone**, `lastReviewed` |
| `data/maturity/EXPERIMENT_REGISTRY.json` | **Material experiments** only; `result` stays `null` until CEOs publish evidence |

The UI reads these via `fetch` with `cache: "no-store"`. Do not invent metrics or experiment results in chrome.

## Shared renderer

`shared/eh-maturity.js` (namespace `window.EH`):

- `loadMaturity`, `loadExperimentRegistry`
- `findSegment(doc, segmentId)`
- `renderMaturityStrip(segmentRow)` — compact stage chip + next milestone (segment tiles)
- `renderMaturityRollup(maturityDoc)` — all segments on opaque `var(--bg2)` cards
- `renderExperimentRegistry(registryDoc)` — material experiment table + `omittedOrForming` footnotes
- `mountMaturityStrip(el, segmentId, opts)` — for segment desks in follow-up PRs

## Freshness / stale tiles

**Primary signal:** each segment summary JSON `lastUpdated` (e.g. `data/segments/presence.json`).

**Threshold:** **≥ 2 calendar days** behind “today” in **America/Chicago**. When stale:

- Segment tile shows a **Stale** badge next to “Updated …”
- Tile chrome softens (`tile-stale`); status badge de-emphasized
- “Needs your attention” items for stale segments are softened and labeled **Stale tile**

**Secondary (optional):** if tile `lastUpdated` is more than **3 calendar days** newer than maturity `lastReviewed` for that segment, a **Maturity lag** hint appears.

Exemplar: Presence `lastUpdated` ~2026-09-21 with ops continuing → stale on 2026-09-26 (INC-20260926-presence-desk-staleness).

## Portfolio homepage wiring

`index.html` loads `eh-maturity.js`; `static/app.js` `main()` loads maturity JSON alongside portfolio/segment data and renders:

1. Maturity strip on each segment tile  
2. **Material experiments** section (after Next up)  
3. **Portfolio maturity** rollup (before Segments grid)

Cache-bust query on touched assets (e.g. `?v=20260926mat0`).
