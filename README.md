# donghyeonsam.github.io

## Syncing TIL / Tech Logs from Notion

TIL and Tech Logs each read from their own Notion database via
`scripts/sync-notion.mjs`. It runs automatically before `npm run build`, or
on demand with `npm run sync:notion`.

1. Create a Notion integration at notion.so/my-integrations and copy its secret.
2. Share both the TIL database and the Tech Logs database with that integration.
3. Provide these three env vars — locally via a `.env` file (copy
   `.env.example`), in CI via repo secrets of the same names (already wired
   into `.github/workflows/deploy.yml`):
   - `NOTION_TOKEN`
   - `NOTION_TIL_DATABASE_ID`
   - `NOTION_TECHLOGS_DATABASE_ID`

Each database needs exactly one Title property and one Date property — the
sync script picks them up by type, so the property names don't matter.
Without these env vars set, the sync step is skipped and the site falls back
to whatever's currently committed in `src/data/til.ts` / `techlogs.ts`.