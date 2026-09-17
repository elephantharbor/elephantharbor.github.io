# Elephant Harbor — Operating standards (org memo)

Issued: 2026-09-05 by Hayes (Portfolio - CEO), directed by Thomas
Applies to: every active agent in Portfolio, Harbor Capital, Harbor Foundry, Harbor Presence

## 1. Keep dashboards current

If your actions materially change facts that appear on your segment’s operating dashboard (or the portfolio homepage tile fed from that segment), update that dashboard the same day — before you move on to other work.

Material changes include metrics, status, positions, pipeline/venture state, experiments, lessons, human gates, channel state, and ownership.

Stale dashboards are a failure. Prefer the canonical path: segment truth → segment dashboard → segment summary → portfolio homepage.

## 2. Write in plain English

Assume Thomas and teammates have not read your private chats.

- Lead with ordinary language.
- Spell out product and company names the first time (and whenever the audience may not know the short form).
- Do not use agent jargon, unexplained acronyms, coded status labels, or internal IDs as the primary message.
- Technical detail can follow; it should not be the only way to understand what is happening.

Bad: “UKG/P6 stage memo; ΔF +6; ER 3.7”
Better: “Two workforce/scheduling software candidates (UKG Workforce Central and Primavera P6) are unstaffed nominations still gathering evidence — not waiting on Thomas’s investment memo.”

## 3. Lessons learned (ongoing)

Lessons are a living operating practice, not a one-time fill from early September.

- On **every** material run (routines, sprints, desk sessions), consider: What happened? What did we believe? What did evidence show? What did we learn? What changed?
- Update the desk Lessons area when a real lesson exists — including “we confirmed X still holds” only when that is useful. Do **not** invent lessons to populate the page.
- Every lesson **must** show an **origination date** (when the lesson was first recorded). If an old lesson lacks a date, backfill the best-known date and note uncertainty if needed.
- Preserve Learning → Change. A lesson with no behavioral implication usually does not belong.

## 4. Desk update on every run

If a segment or market area ran work that can change operating truth, **update that desk the same day before moving on** (snapshot / summary / Next Up as applicable). Stale desks after a run are a failure — same standard as §1.

## 5. Session activity log (human-readable)

Each segment desk (and Capital market rooms where useful) must maintain a **Log** (dedicated tab or clearly labeled section) that is appended after sessions.

Each entry should answer in plain English:
- When (date/time, America/Chicago)
- Who / which area
- What was done (concrete actions)
- What changed on the desk (if anything)
- Optional: link to lesson or experiment if one resulted

Rules:
- Append-only; newest first or clearly dated.
- Written for Thomas — no agent jargon, raw IDs, or unexplained acronyms as the primary text.
- Routine “nothing material” runs may add a short line or skip only when the standing prompt says stay quiet **and** the desk truth did not change; if the desk was refreshed, say so in one sentence.
- Wells owns shared Log presentation / schema; segments own truth of entries.

## 6. Desk grid / query primitive (OS v2 console)

Sortable, filterable desk tables (prospects, ventures, positions, etc.) must share one query contract so rows, filtered count, pagination, and active filters never disagree — especially during load.

**Hard rules:**

1. **Single resolved query** drives rows + filtered count + pagination + active filters together. Never flash a wrong count while loading.
2. Honest loading/empty states until that query resolves.
3. URL-persisted query state (shareable / refresh-safe).
4. Human-readable dates and statuses in the UI; IDs secondary.
5. Accessible sort headers, focus, and `aria` where needed.

**Shared implementation:** [`shared/eh-desk-grid.js`](../shared/eh-desk-grid.js) + `.eh-desk-grid` in [`shared/eh-console.css`](../shared/eh-console.css).  
**Contract & adoption:** [DESK-GRID.md](DESK-GRID.md) — Local Prospects is the exemplar; Capital / Foundry / Presence adopt when ready. Do not freeze daily ops to wait for migration.

## OS v2 (durable canon)

Portfolio Operating System v2 is standing law. Read and follow:

- [OS-V2-DOCTRINE.md](OS-V2-DOCTRINE.md) — Principles 1–8; hierarchy Portfolio → Segment → Role → Task
- [LEARNING-SYSTEM.md](LEARNING-SYSTEM.md) — closed-loop lessons; desk sync on material status changes **same turn**
- [ACTIVATION-LADDER.md](ACTIVATION-LADDER.md) — Observe → … → Exit; threshold review on repeated zero
- [30-DAY-EVALUATION-DOCTRINE.md](30-DAY-EVALUATION-DOCTRINE.md) — economic + execution + learning + trajectory
- [CAPITAL-OS-V2-ACTIVATION.md](CAPITAL-OS-V2-ACTIVATION.md) — Capital market activation under OS v2
- [DESK-GRID.md](DESK-GRID.md) — desk grid / query primitive (§6)

**Standing ops that continue under OS v2:** same-day / same-turn desk sync (§1, §4); plain English human-readable writing (§2); [ACTIVE-VENTURES.md](ACTIVE-VENTURES.md); Hayes portfolio **morning books**; session logs (§5). OS v2 supersedes transient chat activation reminders — it does not freeze daily books or desk hygiene.

## 6. Console & operating primitives (2026-09-17)

Thomas Local upgrade — portfolio-wide:

| Primitive | Standard |
|---|---|
| Desk sync | Material business-state change ⇒ desk update in the **same workflow/turn** |
| Outcome-based routines | Named output = success criterion; first-attempt execution alone is not success |
| Data correctness | Never show knowingly wrong/transient business numbers while real state initializes |
| Grid architecture | Shared grids: reliable sort / filter / pagination / query across the console |
| Human readability | Executive UI favors business meaning over implementation detail |
| Weak-result learning | Repeated poor outcomes ⇒ experiments + behavior change, not endless repetition |

Local implements exemplars (7-tab IA, Prospects grid, EXP-02, afternoon hunt outcome targets). Wells owns shared chrome/contracts. Segments own business truth.

Contracts: [SYNC.md](SYNC.md) (same-workflow desk sync) · [DESK-GRID.md](DESK-GRID.md) (shared grid/query; lands with Local Prospects exemplar) · [LEARNING-DESK.md](LEARNING-DESK.md).

