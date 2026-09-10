# Console color rules (enforced)

Owner: Wells (Portfolio - Systems)  
Issued: 2026-09-10 (Thomas)

## Identity
- Every desk sets `body.eh-{portfolio|capital|presence|foundry|local}`.
- Capital market views also set `body.eh-market-{securities|options|event|crypto|sports|cash}`.
- `--segment` / `--atmosphere` come only from `shared/eh-console.css`. **Do not redefine `--bg`, `--text`, or segment colors in local `segment.css`.**

## Required color use (minimum)
1. **Topbar mark** border/glow uses `--segment` (shared).
2. **Active nav** underline/border uses `--segment`.
3. **Lesson conclusions** left rule uses `--segment`.
4. **KPI primary values** use `--segment` (shared `.kpi .val`).
5. **Homepage tiles** `data-segment` top border + wash (shared).
6. **Way-home links** tinted by segment (shared).

## Forbidden
- Local `:root` copies that override shared dark/light tokens.
- Greyscale-only Overview chrome on Presence/Foundry/Local.
- Inventing a fifth accent system per desk.

## Shared views
Lessons + Session Log use Capital layout via `EH.renderLessonCard` / `EH.renderSessionLog` and shared `.lesson` / `.session-log` styles.
