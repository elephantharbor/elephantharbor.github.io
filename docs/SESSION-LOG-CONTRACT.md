# Session Log & Lessons — shared contract (maintenance)

Status: Issued 2026-09-09 (Thomas via Hayes) — maintenance, not a new cycle  
Shared schema + UI: Wells (Portfolio - Systems)  
Publishers: segment / area owners  
Brief: `portfolio-systems docs/SESSION-LOG-AND-LESSONS.md` · Org memo §§3–5

## Goals
1. **Lessons** — consider on every material run; update desk when appropriate. Every lesson needs **originationDate**.
2. **Desk freshness** — every run that can change operating truth updates the desk same day.
3. **Session Log** — append-only, human-readable activity on each segment desk (Capital markets as useful). Newest first. No agent jargon.

## Lessons field
Every lesson object (desk snapshot / lessons array / segment-summary `latestLesson`) **must** include:

| Field | Required | Notes |
|-------|----------|--------|
| `originationDate` | **yes** | ISO date `YYYY-MM-DD` preferred, or ISO-8601 datetime with offset. Display in America/Chicago. |
| `experience` / `evidence` / `learning` / `change` | yes | Existing structure — Learning → Change required for a real lesson |
| `id` | optional | Stable id for optional `lessonId` on log entries |

Backfill old lessons with the best-known date. If uncertain, use the earliest evidence date and note uncertainty in Evidence (not in the date field).

UI: show origination date on every lesson card (shared helper `EH.renderLessonOrigination`).

## Session Log schema
Publish at:

- Portfolio mirror: `elephantharbor.github.io/data/session-log/<areaId>.json`
- Segment desk (preferred source of truth): `data/session-log/<areaId>.json` or `snapshot.sessionLog`

```json
{
  "areaId": "presence",
  "areaName": "Harbor Presence",
  "lastUpdated": "2026-09-09T16:00:00-05:00",
  "entries": [
    {
      "at": "2026-09-09T13:16:00-05:00",
      "actor": "Maren (Harbor Presence - CEO)",
      "summary": "Closed Day 2 gate after Venus original went live.",
      "deskChanges": "Updated overview metrics, experiments, and Next Up for Sep 10.",
      "lessonId": "optional-lesson-id"
    }
  ]
}
```

### Field rules
- `at` — ISO-8601 with offset; **display America/Chicago**
- `actor` — human-readable name + role (naming standard)
- `summary` — plain English what was done
- `deskChanges` — what changed on the desk, or `"None"` / `"No desk change"`
- `lessonId` — optional link to a lesson id
- `entries` — append-only; UI sorts **newest first**
- Empty `entries` → UI shows **No sessions logged yet.** Never invent entries.

### areaId values
Same as Next Up: `portfolio` · `capital` · `capital-securities` · `capital-options` · `capital-event` · `capital-crypto` · `capital-sports` · `presence` · `foundry` · `local`

## UI (shared)
- CSS: `eh-console.css` — `.session-log`, `.lesson .origination`
- JS: `shared/eh-session-log.js` — `EH.renderSessionLog(data)`, `EH.formatChicago(iso)`, `EH.renderLessonOrigination(lesson)`
- Nav: add a **Log** tab (or clearly labeled section) on each segment desk; Capital markets when useful.

## Ownership
- **Wells** — contract, shared CSS/JS, portfolio `data/session-log/` mirror path, reference wiring.
- **Segment CEOs** — truth of entries + lesson dates; refresh desk same day; ask Wells to mirror if push blocked.
- **Hayes** — portfolio morning books / org enforcement.

## Publish checklist (segment)
1. Add `originationDate` to every lesson (backfill old ones).
2. Create `data/session-log/<areaId>.json` (or embed `sessionLog` on snapshot).
3. Add Log tab using shared CSS/JS.
4. After each material run: append a log line + update desk + bump Next Up if needed.
5. Mirror segment-level session-log + summary to portfolio when the homepage/tile should reflect it (Wells can push).
