# Public disclosure review (Cycle 5)

`elephantharbor.github.io` is publicly reachable.

## Current posture
- **Capital desk** publishes a sanitized snapshot (account IDs, order IDs, credentials stripped). Bankroll/P&L/positions at this size are treated as acceptable for the operating console; revisit if positions or theses become sensitive.
- **Foundry / Presence** publish operating summaries without credentials, DMs, or private drafts.
- **Portfolio homepage** consumes segment summaries only — no broker credentials.

## Recommendation
No architecture change required for Cycle 5 close. If Capital later holds material live positions or proprietary theses, prefer summary-only on the public desk and keep detail in private workspace docs.
