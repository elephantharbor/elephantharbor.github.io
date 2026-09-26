# Desk sync contract (OS v2)

**Authority:** [ORG-OPERATING-STANDARDS.md](ORG-OPERATING-STANDARDS.md) §1, §4, §6 · [OS-V2-DOCTRINE.md](OS-V2-DOCTRINE.md)  
**Owners:** Segment CEOs own business truth; Wells owns shared chrome, remirrors, and auth console publish paths.

## Defect definition

**Action now → desk later is a defect.**  
A material business-state change requires the corresponding desk-state change in the **same workflow / same operating turn**.

## What counts as material

Metrics, funnel/status chips, positions, pipeline/venture state, experiments, lessons, human gates, coverage cells, outreach send results, engagement Warm/Sent chips, blockers, Active Ventures, and ownership — anything Thomas or a Morning Book would treat as current truth.

## Same-workflow checklist

For every material change:

1. **Source of record** updated (segment desk SoR / private desk JSON).
2. **Auth / operating desk** refreshed if that surface shows the fact (Local: `console.elephantharbor.com/harbor-local/` via `eh-console-gate` private assets).
3. **Public aggregates** remirrored when the homepage tile or public segment summary should move (`data/segments/<id>.json`, session-log mirrors, Active Ventures, Next Up as applicable).
4. **`lastUpdated` / freshness** honest — never leave a stale timestamp that implies the old state is current.
5. **Learning** updated same turn when a lesson status materially moves ([LEARNING-DESK.md](LEARNING-DESK.md)).

Do not close the turn on “we’ll remirror later” for material facts.

## Data correctness (no wrong flash)

Never show knowingly wrong or transient business numbers while real state initializes. Prefer an explicit loading/empty state until **one resolved query** drives rows + filtered count + pagination + filters together. See [DESK-GRID.md](DESK-GRID.md) (shared grid primitive) and ORG §6.

## Segment summary → homepage (copy path)

Canonical flow: segment desk `data/segment-summary.json` → `elephantharbor.github.io/data/segments/<id>.json` → homepage tile.

| Segment | Summary refresh owner |
|---------|----------------------|
| Capital | Holt — regenerate from public desk snapshot after publish |
| Presence | Maren (Rowan validates X/site truth) |
| Foundry | Calder / Fernando (Ops) |
| Local | Blair — SoR under `harbor-local`; Wells remirrors auth + public on material Local ops |
| Eats | Cora — SoR local + Notion; public desk at `harbor-eats/` (snapshot in repo); remirror `data/segments/eats.json` when segment-summary changes |
| Reach | Reef — SoR under `/workspace/harbor-reach/`; auth desk at `console.elephantharbor.com/harbor-reach/` via `eh-console-gate` private assets; **public github.io tile only** (no `/harbor-reach/` desk pages); named practitioners never on github.io; Wells remirrors tile from `segment-summary.json` on material change |
| Gaming | Gage — SoR under `/workspace/harbor-gaming/`; auth desk at `console.elephantharbor.com/harbor-gaming/` via `eh-console-gate` private assets; **public github.io tile only** (no `/harbor-gaming/` desk pages); Wells remirrors tile from `segment-summary.json` on material change |
| Portfolio tile copy | Wells when a segment publishes an updated segment-summary |

### Capital publish commands (Holt)

```bash
cd /workspace/harbor-capital-growth
python3 tools/publish_dashboard_snapshot.py --public
python3 tools/publish_capital_segment_summary.py --homepage
```

Then push `harbor-capital-desk` (public snapshot + segment-summary) and `elephantharbor.github.io` (capital.json tile) — Wells can push if Capital push is blocked.

## Local exemplar

Harbor Local is the OS v2 console exemplar (7-tab IA, Prospects grid, same-turn auth+public remirror after sends). Shared grid module: `shared/eh-desk-grid.js` · contract: [DESK-GRID.md](DESK-GRID.md).

## Outcome-based routines

Routine success = the **named output** exists and desk truth reflects it — not merely that the first attempt executed. Repeated weak results require experiments / behavior change, not endless identical retries (ORG §6).
