// Resolves a TIL list entry (src/data/til.ts, hand-maintained) to its source
// markdown note under /til/<folder>/<folder>.md and renders it to HTML.
//
// til.ts has no explicit link to its source folder, so the mapping is
// derived positionally: til.ts is newest-first, the til/ folders sort
// oldest-first by name (MMDD, with `_1`/`_2` suffixes disambiguating same-day
// entries) — reversing til.ts and zipping it against the sorted folder list
// lines them up 1:1. Verified against every multi-entry day (0206/_1/_2,
// 0428/_1, 0610/_1) by matching titles before relying on it here.
import { marked } from 'marked'
import { tilList } from './til'

export interface TilArticle {
  html: string
}

const mdModules = import.meta.glob<string>('/til/*/*.md', { query: '?raw', import: 'default' })
const imageModules = import.meta.glob<string>('/til/*/*.{png,jpg,jpeg,gif,webp,svg}', {
  query: '?url',
  import: 'default',
})

function folderOf(path: string) {
  return path.split('/')[2] ?? ''
}

const sortedFolders = Object.keys(mdModules).sort((a, b) => folderOf(a).localeCompare(folderOf(b)))
const oldestFirstTil = [...tilList].reverse()

const idToMdPath = new Map<string, string>()
oldestFirstTil.forEach((item, index) => {
  const path = sortedFolders[index]
  if (path) idToMdPath.set(item.id, path)
})

export function hasTilArticle(id: string): boolean {
  return idToMdPath.has(id)
}

export async function loadTilArticle(id: string): Promise<TilArticle | null> {
  const mdPath = idToMdPath.get(id)
  if (!mdPath) return null

  const folder = folderOf(mdPath)
  const raw = await mdModules[mdPath]()

  const nameToUrl = new Map<string, string>()
  await Promise.all(
    Object.keys(imageModules)
      .filter((p) => folderOf(p) === folder)
      .map(async (p) => {
        nameToUrl.set(p.split('/').pop() ?? p, await imageModules[p]())
      })
  )

  const withResolvedImages = raw.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (/^https?:\/\//i.test(src)) return match
    let decoded = src
    try {
      decoded = decodeURIComponent(src)
    } catch {
      // not percent-encoded — use as-is
    }
    const url = nameToUrl.get(decoded)
    return url ? `![${alt}](${url})` : match
  })

  // Every note opens with a "# MMDD(Topic).md"-style heading that just
  // restates the date/title already shown in the page header above — drop
  // it so the body doesn't repeat itself.
  const body = withResolvedImages.replace(/^#+[^\n]*\n/, '')

  const html = await marked.parse(body)
  return { html }
}
