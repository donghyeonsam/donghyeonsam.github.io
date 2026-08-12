import type { ClassifiedItem } from './types'

// Synced from a Notion database by scripts/sync-notion.mjs (npm run
// sync:notion, or automatically before `npm run build` when NOTION_TOKEN +
// NOTION_TIL_DATABASE_ID are set). This committed copy is the fallback used
// whenever those aren't set, so edits here are safe until the next sync
// overwrites them.
export const tilList: ClassifiedItem[] = [
  { id: '1', title: 'TIL 1', date: '08.10' },
  { id: '2', title: 'TIL 2', date: '08.09' },
  { id: '3', title: 'TIL 3', date: '08.08' },
  { id: '4', title: 'TIL 4', date: '08.07' },
]
