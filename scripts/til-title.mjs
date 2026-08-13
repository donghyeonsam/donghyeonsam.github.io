// Shared title-fallback logic for the Notion sync scripts
// (sync-notion.mjs, sync-til-content.mjs).
//
// Both scripts pull a Notion page's title-type property as the TIL's
// display title. When that property is left blank — the actual failure
// mode that produced date-only titles like "0815" across the site — falling
// straight back to the date/filename throws away real content: most pages
// still have a one-line TIL/summary rich-text field describing the topic
// even when the title column itself was never filled in. Prefer that before
// ever falling back to a bare date.
const MAX_LEN = 60

// A title that's just a Notion "@2026년 5월 29일"-style date mention isn't a
// real topic — it's what's left in the title property when the user never
// typed one in. Treat it the same as blank so callers fall through to the
// summary/date fallback instead of surfacing the raw mention text.
const BARE_DATE_MENTION = /^@?\d{4}년\s*\d{1,2}월\s*\d{1,2}일$/

export function deriveTitle({ titleText, summaryText, fallbackDateLabel }) {
  const title = (titleText || '').trim()
  if (title && !BARE_DATE_MENTION.test(title)) return title

  const firstLine = (summaryText || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)
  if (firstLine) {
    return firstLine.length > MAX_LEN ? `${firstLine.slice(0, MAX_LEN).trim()}…` : firstLine
  }

  return fallbackDateLabel || '(제목 없음)'
}
