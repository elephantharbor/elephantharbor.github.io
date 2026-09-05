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
