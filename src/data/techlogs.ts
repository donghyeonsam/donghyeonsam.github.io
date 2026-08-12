import type { ClassifiedItem } from './types'

// Synced from a Notion database by scripts/sync-notion.mjs (npm run
// sync:notion, or automatically before `npm run build` when NOTION_TOKEN +
// NOTION_TECHLOGS_DATABASE_ID are set). This committed copy is the fallback
// used whenever those aren't set, so edits here are safe until the next
// sync overwrites them.
export const techlogsList: ClassifiedItem[] = [
  { id: '1', title: 'TechLogs 1', date: '08.06' },
  { id: '2', title: 'TechLogs 2', date: '08.03' },
  { id: '3', title: 'TechLogs 3', date: '07.29' },
  { id: '4', title: 'TechLogs 4', date: '07.22' },
]
