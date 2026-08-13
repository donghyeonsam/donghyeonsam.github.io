// Resolves a TIL list entry (src/data/til.ts, built by scripts/build-til.mjs)
// to its source markdown note under /til/<folder>/<folder>.md and renders it
// to HTML. Each til.ts entry carries its own `folder`, so the lookup is a
// direct map instead of guessing from list/folder ordering.
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import { tilList } from './til'

hljs.registerLanguage('python', python)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('jsx', javascript)

// Fenced code blocks (```python etc.) render through highlight.js instead of
// marked's default (which just escapes the text — every token comes out the
// same flat ink color). CSS for the resulting .hljs-* spans lives in
// global.css under .md-article pre.
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined
      const { value } = language ? hljs.highlight(text, { language }) : hljs.highlightAuto(text)
      return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${value}</code></pre>`
    },
  },
})

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

const idToMdPath = new Map<string, string>()
for (const item of tilList) {
  if (!item.folder) continue
  const mdPath = `/til/${item.folder}/${item.folder}.md`
  if (mdModules[mdPath]) idToMdPath.set(item.id, mdPath)
}

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
