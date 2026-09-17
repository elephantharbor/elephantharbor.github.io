# Learning desk — portfolio standard (V0)

**Issued:** 2026-09-16 by Wells (Portfolio Systems)  
**Schema:** `learning-v0`  
**Companion:** [LEARNING-SYSTEM.md](LEARNING-SYSTEM.md) · [OS-V2-DOCTRINE.md](OS-V2-DOCTRINE.md) · [ORG-OPERATING-STANDARDS.md](ORG-OPERATING-STANDARDS.md) §6 · [SYNC.md](SYNC.md)

## Goal

Tom opens Portfolio Overview and sees compact lesson cards — not essays — each with a mandatory behavioral change and lifecycle status.

## Publish path

`data/learning/<areaId>.json`  
Portfolio aggregate: `data/learning/portfolio.json`  
Future segment desks may use `data/learning/capital.json`, etc.

## Hard rules

1. **`requiredBehavioralChange` is mandatory.** The shared renderer skips any item missing it.
2. **Material status change → desk Learning updates same turn** (brief note in session log / deskChanges). Action now / Learning later is a defect — same [SYNC.md](SYNC.md) contract as other desk surfaces.
3. **Contextual lessons** may move `Weakening → Superseded / Rejected`. No permanent dogma from thin samples.

## Schema (learning-v0)

Top-level: `areaId`, `areaName`, `lastUpdated`, `schemaVersion`, `items[]`

Per item: `id`, `title`, `status`, `segment`, `scope`, `observation`, `evidence`, `evidenceWindow{start,end}`, `hypothesis`, `confidence`, `sampleNote`, `requiredBehavioralChange`, `owner`, `testMethod`, `metrics`, `durablePrimitive`, `reviewDate`, `lastValidated`, `outcome`, `openedAt`, `notionUrl`

**Statuses:** Candidate → Testing → Confirmed → Institutionalized → Weakening → Superseded | Rejected  
**Segments:** Capital | Foundry | Presence | Local | Portfolio | Cross  
**Scope:** structural | contextual  
**Confidence:** low | medium | high

## UI

- Shared: `shared/eh-learning.js` + `.learning-desk` / `.lrn-card` in `shared/eh-console.css`
- Portfolio Overview: `#learning-host` after Active Ventures
- **Collapsed:** title · status · segment · owner · requiredBehavioralChange · reviewDate · durablePrimitive
- **Expanded:** remaining fields (`sampleNote` and `outcome` expand-only)

## Manual vs automatic

- **Manual (CEO / lesson owner):** keep area JSON truthful when lessons open, status moves, or outcomes land.
- **Automatic (Wells chrome):** load JSON, filter items without behavioral change, render compact cards with native expand.

## OS v2 chrome alignment

- Cards lead with business meaning (title, status, owner, required behavioral change) — IDs/URLs secondary.
- Never render a lesson card missing `requiredBehavioralChange` (skip, do not show a hollow shell).
- Contextual lessons must be allowed to weaken and retire; thin samples are not permanent dogma.
- Shared grid/query rules for denser Learning tables later: [DESK-GRID.md](DESK-GRID.md).
