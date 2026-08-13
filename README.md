# donghyeonsam.github.io

## Syncing TIL / Tech Logs from Notion

Tech Logs reads straight from its Notion database via `scripts/sync-notion.mjs`,
which needs exactly one Title property and one Date property on that
database (picked up by type, so the property names don't matter).

TIL goes through two steps instead:
1. `scripts/sync-til-content.mjs` (run nightly by
   `.github/workflows/sync-til.yml`) pulls new pages from the TIL database
   into `til/MMDD/MMDD.md` + downloaded images, and commits each day
   individually.
2. `scripts/build-til.mjs` then builds `src/data/til.ts` straight from those
   `til/*/*.md` notes on disk — no Notion access needed for this step, so it
   also runs as part of `npm run build`.

Both `sync-notion.mjs` and `sync-til-content.mjs` run automatically before
`npm run build` (see `package.json`'s `prebuild`), or on demand with
`npm run sync:notion` / `node scripts/sync-til-content.mjs`.

1. Create a Notion integration at notion.so/my-integrations and copy its secret.
2. Share both the TIL database and the Tech Logs database with that integration.
3. Provide these three env vars — locally via a `.env` file (copy
   `.env.example`), in CI via repo secrets of the same names (already wired
   into `.github/workflows/deploy.yml` and `.github/workflows/sync-til.yml`):
   - `NOTION_TOKEN`
   - `NOTION_TIL_DATABASE_ID`
   - `NOTION_TECHLOGS_DATABASE_ID`

Without `NOTION_TOKEN` / `NOTION_TECHLOGS_DATABASE_ID` set, the Tech Logs
sync step is skipped and the site falls back to whatever's currently
committed in `src/data/techlogs.ts`. `til.ts` always rebuilds from whatever
`til/` currently holds on disk, regardless of Notion access.