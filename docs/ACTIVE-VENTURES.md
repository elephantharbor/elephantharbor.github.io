# Active Ventures — portfolio standard

**Issued:** 2026-09-11 by Thomas via Hayes  
**Owner (architecture):** Wells (Portfolio - Systems)  
**Owners (truth):** Segment CEOs / Capital market leads  

## Goal
Tom opens the console and immediately sees what Elephant Harbor has in motion — human-readable, not agent jargon.

## Surfaces
- Portfolio homepage (aggregate)
- Segment Overviews: Capital, Presence, Foundry, Local
- Capital market Overviews: Securities, Options, Event, Crypto, Sports

## What counts
Material activity intended to create or validate economic value. Not every scout candidate, shadow trade, or routine post.

Local: Active Ventures = paying / engaged WaaS customer relationships only. Prospects stay on the Prospects tab.

## Publish path
`elephantharbor.github.io/data/active-ventures/<areaId>.json`  
areaIds: `capital` · `capital-securities` · `capital-options` · `capital-event` · `capital-crypto` · `capital-sports` · `presence` · `foundry` · `local`

## Schema (canonical)
```json
{
  "areaId": "presence",
  "areaName": "Harbor Presence",
  "lastUpdated": "2026-09-11T10:19:00-05:00",
  "items": [
    {
      "id": "optional-stable-id",
      "title": "Human title",
      "segment": "presence",
      "submarket": null,
      "description": "Plain English",
      "status": "Active",
      "startDate": "YYYY-MM-DD",
      "owner": "Name (Org - Role)",
      "exposure": "Resources at risk",
      "performance": "How it is going",
      "nextMilestone": "Next gate",
      "detailLink": "https://…",
      "lastUpdated": "ISO-8601 with offset"
    }
  ],
  "emptyReason": null
}
```

### Locked names
- Array: **`items`**
- Empty: **`emptyReason`**
- Detail: **`detailLink`**

Shared UI also accepts aliases: `ventures`↔`items`, `emptyWhy`↔`emptyReason`, `detailUrl`↔`detailLink`.

Empty `items` → UI shows **No active ventures** + `emptyReason`. Never invent ventures.

## UI
`shared/eh-active-ventures.js` + `.active-ventures` / `.av-card` in `eh-console.css`.

## Pattern
operational data → standardized venture record → dashboards. Active only; closed items leave this section.

## Manual vs automatic
- **Manual (CEO / market lead):** keep area JSON truthful when ventures open/close or status changes.
- **Automatic (Wells chrome):** load JSON, normalize aliases, render cards, portfolio aggregate merge.
