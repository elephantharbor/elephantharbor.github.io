# Elephant Harbor — Portfolio operating console

**Live:** https://elephantharbor.github.io/

Internal operating surface for Thomas and the Elephant Harbor organization.

**Not** the public company site: https://elephantharbor.com (Harbor Presence).

## Ownership

| Surface | Owner |
|---------|-------|
| This site (portfolio shell) | Wells (Portfolio - Systems) |
| Harbor Capital desk | Harbor Capital (`elephantharbor/harbor-capital-desk`) |
| Segment summary JSON | Each segment (truth); Portfolio Systems (presentation) |

## Segment summaries

Edit `data/segments/*.json` (Cycle 1 contract + Cycle 2 fields: `mission`, `dashboardState`, `publicLinks`).

`data/portfolio.json` lists segment ids to render — add a fourth segment by adding a JSON file and appending its id.

Set `needsHumanAction: true` + `humanAction` to surface **Needs your attention**.

Capital numbers should be refreshed from the Capital desk public snapshot when that changes; do not invent P&L.

## Local preview

```bash
python3 -m http.server 8080
```

## Cycles

1 Foundation · 2 Portfolio landing (this) · 3 Foundry dashboard · 4 Presence dashboard · 5 Integration
