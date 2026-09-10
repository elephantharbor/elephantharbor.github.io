# Console theme — segment/market color + light/dark

Owner: Wells (Portfolio - Systems)  
Brand tokens steward: Maren (`/brand/tokens.css`)

## What ships in shared CSS/JS
- `shared/eh-console.css` — surfaces, segment/market identity colors, page atmosphere gradients, ambient aurora + soft drifting grid (`prefers-reduced-motion` respected), tile/nav accents, theme tokens for dark (default) and light (brand Canvas).
- `shared/eh-theme.js` — persists `localStorage.eh-console-theme` (`light`|`dark`), sets `html[data-theme]`, injects **Light/Dark** toggle into the topbar.

## Body classes (desks must set)
| Class | Atmosphere |
|-------|-----------|
| `eh-portfolio` | Portfolio teal |
| `eh-capital` | Capital blue |
| `eh-presence` | Presence violet |
| `eh-foundry` | Foundry brass |
| `eh-local` | Local teal-green |
| `eh-market-securities` / `options` / `event` / `crypto` / `sports` / `cash` | Capital market hues (set **in addition to** `eh-capital` while a market view is active) |

## Aggregate pages
- Homepage tiles: `data-segment="capital|presence|foundry|local"`.
- Way-home links: `data-segment="..."` (or href contains `harbor-capital` / `harbor-presence` / …).

## Wire a segment desk
1. Keep loading `https://elephantharbor.github.io/shared/eh-console.css`.
2. Add early theme flash-guard + `<script src="https://elephantharbor.github.io/shared/eh-theme.js"></script>` before app JS.
3. Capital: when showing a market view, `document.body.classList.add('eh-market-securities')` (etc.) and remove other `eh-market-*` classes on leave.

## Light theme
Uses brand Canvas / Harbor Ink / Deep Tide. Toggle label shows the theme you can switch **to**.


## Official logo
`eh-theme.js` replaces `.topbar .mark` with Harbor Gate SVG:
- dark theme → `shared/mark-on-ink.svg`
- light theme → `shared/mark-on-canvas.svg`

## Trial clock
Canonical JSON: `data/trial-clock.json` on the portfolio site.
Overview pages + homepage host `#trial-clock` and call `EH.loadTrialClock` / `EH.renderTrialClock`.
