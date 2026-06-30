# Tennis Journal — Project Context

## What this is
A vanilla JS (no framework) tennis match journal app, deployed on GitHub Pages.
Repo: `laurentiuborcan/tennis-journal`

## Sandbox constraints (IMPORTANT)
- This environment's git proxy only allows pushes to branches matching `claude/*-aSAFI`.
  Direct pushes to `main` return 403.
- Workflow: create any branch locally → it gets pushed as `claude/push-tennis-journal-aSAFI`
  (or similar) → user creates and merges the PR manually on GitHub.
- Cannot create/merge PRs programmatically — no `gh` CLI, no GitHub token with PR scope.
  User does this step in the browser.

## Git workflow conventions
- Feature branches: `feature/*`, fixes: `fix/*`, data updates: `data/*` or `chore/*`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `data:`, `debug:`
- Always create a branch before making changes — never commit directly to main

## App structure
- 4 tabs (in order): Tournois TWB, Davis League (Me), Davis League (All), Other Matches
- Season selector only visible on "Davis League (Me)" and "Davis League (All)" tabs
- Default tab on load: Tournois TWB
- `SEASONS` array in app.js: currently `2025-26` (active) and `2026-27` (upcoming, empty)
- Fake 2024/25 test season was removed — don't re-add fake data

## Data pipelines (GitHub Actions)
1. **Davis League data** — `scripts/scrape-league.js`, scrapes `https://dvl.webismagic.net/classement/4`
   daily at 07:00 UTC. Writes `data/season-2025-26.json`. No auth needed.
2. **TWB tournament results** — `scripts/scrape-twb.js`, scrapes `https://tennis.tppwb.be`
   (Tennis Wallonie-Bruxelles federation site) daily at 06:00 UTC. Writes `data/tournaments-twb.json`.
   - Requires login: GitHub Secrets `TWB_USERNAME` (affiliation number) + `TWB_PIN`
   - Login flow: POST to `auth.tppwb.be/Authenticate/Login` with fields `affiliationNumber`/`pinCode`
     (NOT `AffiliationNumber`/`PIN` — that was a bug we fixed), follow redirect, keep cookies
   - Results come from `GET /MyAFT/MyResults/Results?ordinal=N` (N = 1 to 9, one per ranking period)
   - **Accumulates history forever** — never overwrites old matches, merges new + existing via
     dedup key `date|tournament|opponent`. This was a deliberate design choice (TWB only shows
     ~3 years of rolling history; we want permanent records).
   - `ptsToRanking(pts)` function converts opponent points to ranking classification (e.g. C30.5)
     using a fixed lookup table — this was simpler than scraping the ranking text from HTML.
   - `pointsBreakdown` field — scrapes the "Points Details" popup data (6 best tournament results
     + weighted average formula) from the `#pointDetailsModalDialog` section of the ordinal=1 page.
     Only refreshed from ordinal=1 (current period), not accumulated like matches.
   - Historical 2017-2022 matches were manually added one-time from user screenshots
     (53 matches, since TWB's API doesn't go back that far) — already merged into the data file.

## Known HTML parsing gotchas (if scraper breaks again)
- TWB pages use nested `<div>` — always use depth-counting `extractDivById()`, never lazy regex
  like `[\s\S]*?` on `</div>` (caused missed matches in the past)
- Opponent name extraction: prefer `title="Plus d'info sur NAME (N pts)"` regex with apostrophe-
  agnostic matching (`d.info` not `d'info` — apostrophe can be straight/curly/encoded)
- HTML previews/debug logging should be removed from production scraper runs (keep it lean)

## Workflow files
- `.github/workflows/update-league-data.yml` — Davis League scraper, daily 07:00 UTC
- `.github/workflows/update-twb-results.yml` — TWB scraper, daily 06:00 UTC
- Both use Node.js 24, `actions/checkout@v5`, `actions/setup-node@v5`
- Both have `permissions: contents: write` to commit back to the repo

## Race condition gotcha
If both workflows run close together, a push can be rejected (main moved between fetch and push).
Just re-run the failed workflow manually — not a code bug, just needs a retry.
