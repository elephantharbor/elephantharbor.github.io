# Segment summary → homepage sync

Canonical flow: segment desk `data/segment-summary.json` → copy into `elephantharbor.github.io/data/segments/<id>.json` → homepage.

Capital: regenerate summary from `harbor-capital-desk` public snapshot after each desk publish.
Foundry / Presence: update summary when ops truth changes; set `freshnessNote` + honest `lastUpdated`.

Automation beyond this copy step is optional maintenance — not required to close Cycle 5.

## Refresh owners

| Segment | Summary refresh owner |
|---------|----------------------|
| Capital | Holt — regenerate from public desk snapshot after publish |
| Presence | Maren (Rowan validates X/site truth) |
| Foundry | Calder / Fernando (Ops) |
| Portfolio tile copy | Wells when a segment publishes an updated segment-summary.json |

## Capital publish commands (Holt)

```bash
cd /workspace/harbor-capital-growth
python3 tools/publish_dashboard_snapshot.py --public
python3 tools/publish_capital_segment_summary.py --homepage
```

Then push `harbor-capital-desk` (public snapshot + segment-summary) and `elephantharbor.github.io` (capital.json tile) — Wells can push if Capital push is blocked.
Doc: `harbor-capital-growth/docs/cycle-5-capital-freshness-2026-09-05.md`
