#!/usr/bin/env node
// scripts/sync-til-content.mjs
// Notion TIL DB → til/MMDD/MMDD.md + images 자동 동기화
//
// 필요한 환경변수:
//   NOTION_TOKEN            - Notion Internal Integration 토큰
//   NOTION_TIL_DATABASE_ID  - TIL DB ID
//
// 사용법:
//   node scripts/sync-til-content.mjs

import 'dotenv/config'
import { Client } from '@notionhq/client'
import { writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import http from 'node:http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const TIL_DIR = path.join(ROOT, 'til')

const EXCLUDE_DATES = new Set(['2026-01-20', '2026-03-23', '2026-03-24', '2026-05-22'])

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_TIL_DATABASE_ID

if (!token || !databaseId) {
  console.log('[sync-til] NOTION_TOKEN 또는 NOTION_TIL_DATABASE_ID 미설정 — 건너뜁니다.')
  process.exit(0)
}

const notion = new Client({ auth: token })

// ─── Notion DB 조회 ───

async function fetchAllEntries() {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const dsId = db.data_sources?.[0]?.id
  if (!dsId) throw new Error('DB에 data source가 없습니다')

  const pages = []
  let cursor
  do {
    const res = await notion.dataSources.query({
      data_source_id: dsId,
      start_cursor: cursor,
      page_size: 100,
    })
    pages.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return pages
}

// ─── 날짜 파싱 ───

function parseDate(page) {
  const props = page.properties
  // "Created Date" 필드 (created_time)
  const createdDate = Object.values(props).find(p => p.type === 'created_time')
  // "ToDay" 필드 (title) — 날짜 정보가 제목에 있을 수 있음
  const titleProp = Object.values(props).find(p => p.type === 'title')
  const title = titleProp?.title?.map(t => t.plain_text).join('') || ''

  // title에서 @2026년 X월 Y일 형식 파싱
  const m = title.match(/@(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (m) {
    const [, y, mo, d] = m
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // 제목에서 MMDD 추출 시도
  const mmddMatch = title.match(/^(\d{4})\(/)
  if (mmddMatch) {
    const mmdd = mmddMatch[1]
    const mm = mmdd.slice(0, 2)
    const dd = mmdd.slice(2, 4)
    return `2026-${mm}-${dd}`
  }

  // fallback: Created Date
  if (createdDate?.created_time) {
    return createdDate.created_time.slice(0, 10)
  }

  return null
}

function getMMDD(dateStr) {
  if (!dateStr) return null
  const [, mm, dd] = dateStr.split('-')
  return `${mm}${dd}`
}

// ─── 프로퍼티 추출 ───

function getPropertyValue(props, type) {
  return Object.values(props).find(p => p.type === type)
}

function getTilSummary(props) {
  const richText = Object.entries(props).find(([k, v]) => v.type === 'rich_text' && k.toLowerCase().includes('til'))
  if (!richText) return ''
  return richText[1].rich_text.map(t => t.plain_text).join('')
}

function getYourLinks(props) {
  const urlProp = Object.entries(props).find(([k, v]) => v.type === 'url' && k.toLowerCase().includes('link'))
  return urlProp?.[1]?.url || null
}

function extractNotionPageId(url) {
  if (!url) return null
  if (!url.includes('notion.so') && !url.includes('notion.site')) return null
  // Format: https://www.notion.so/title-hexid or https://www.notion.so/hexid
  const m = url.match(/([a-f0-9]{32})/)
  if (!m) return null
  const hex = m[1]
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

// ─── Notion Block → Markdown 변환 ───

async function fetchBlocks(blockId) {
  const blocks = []
  let cursor
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })
    blocks.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return blocks
}

function richTextToMd(richTexts) {
  if (!richTexts) return ''
  return richTexts.map(rt => {
    let text = rt.plain_text || ''
    if (rt.annotations?.bold) text = `**${text}**`
    if (rt.annotations?.italic) text = `*${text}*`
    if (rt.annotations?.strikethrough) text = `~~${text}~~`
    if (rt.annotations?.code) text = `\`${text}\``
    if (rt.href) text = `[${text}](${rt.href})`
    return text
  }).join('')
}

async function downloadImage(url, destDir, index) {
  const ext = url.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1] || 'png'
  const filename = `image_${index}.${ext}`
  const destPath = path.join(destDir, filename)

  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get
    get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        downloadImage(res.headers.location, destDir, index).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        resolve(null) // Skip failed downloads
        return
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', async () => {
        await writeFile(destPath, Buffer.concat(chunks))
        resolve(filename)
      })
      res.on('error', () => resolve(null))
    }).on('error', () => resolve(null))
  })
}

async function blocksToMarkdown(blocks, destDir, depth = 0) {
  let md = ''
  let imageIndex = 0
  const indent = '  '.repeat(depth)

  for (const block of blocks) {
    const type = block.type

    switch (type) {
      case 'paragraph':
        md += `${indent}${richTextToMd(block.paragraph.rich_text)}\n\n`
        break

      case 'heading_1':
        md += `# ${richTextToMd(block.heading_1.rich_text)}\n\n`
        break

      case 'heading_2':
        md += `## ${richTextToMd(block.heading_2.rich_text)}\n\n`
        break

      case 'heading_3':
        md += `### ${richTextToMd(block.heading_3.rich_text)}\n\n`
        break

      case 'bulleted_list_item':
        md += `${indent}- ${richTextToMd(block.bulleted_list_item.rich_text)}\n`
        break

      case 'numbered_list_item':
        md += `${indent}1. ${richTextToMd(block.numbered_list_item.rich_text)}\n`
        break

      case 'to_do':
        const checked = block.to_do.checked ? 'x' : ' '
        md += `${indent}- [${checked}] ${richTextToMd(block.to_do.rich_text)}\n`
        break

      case 'toggle':
        md += `${indent}<details>\n${indent}<summary>${richTextToMd(block.toggle.rich_text)}</summary>\n\n`
        if (block.has_children) {
          const children = await fetchBlocks(block.id)
          md += await blocksToMarkdown(children, destDir, depth + 1)
        }
        md += `${indent}</details>\n\n`
        break

      case 'code':
        const lang = block.code.language || ''
        md += `\`\`\`${lang}\n${richTextToMd(block.code.rich_text)}\n\`\`\`\n\n`
        break

      case 'quote':
        md += `${indent}> ${richTextToMd(block.quote.rich_text)}\n\n`
        break

      case 'callout':
        const icon = block.callout.icon?.emoji || '💡'
        md += `> ${icon} ${richTextToMd(block.callout.rich_text)}\n\n`
        break

      case 'divider':
        md += `---\n\n`
        break

      case 'image': {
        imageIndex++
        const imgUrl = block.image.type === 'file'
          ? block.image.file.url
          : block.image.external?.url
        if (imgUrl) {
          const filename = await downloadImage(imgUrl, destDir, imageIndex)
          if (filename) {
            const caption = richTextToMd(block.image.caption)
            md += `![${caption || ''}](${filename})\n\n`
          }
        }
        break
      }

      case 'table':
        if (block.has_children) {
          const rows = await fetchBlocks(block.id)
          for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].table_row?.cells || []
            const row = cells.map(cell => richTextToMd(cell)).join(' | ')
            md += `| ${row} |\n`
            if (i === 0) {
              md += `| ${cells.map(() => '---').join(' | ')} |\n`
            }
          }
          md += '\n'
        }
        break

      case 'bookmark':
        const bmUrl = block.bookmark.url
        const bmCaption = richTextToMd(block.bookmark.caption)
        md += `[${bmCaption || bmUrl}](${bmUrl})\n\n`
        break

      case 'embed':
        md += `[embed](${block.embed.url})\n\n`
        break

      default:
        // 지원하지 않는 블록은 건너뜀
        break
    }

    // 자식 블록 처리 (toggle 제외 — 이미 위에서 처리)
    if (block.has_children && type !== 'toggle' && type !== 'table') {
      const children = await fetchBlocks(block.id)
      md += await blocksToMarkdown(children, destDir, depth + 1)
    }
  }

  return md
}

// ─── 메인 ───

async function main() {
  await mkdir(TIL_DIR, { recursive: true })

  // 이미 존재하는 TIL 확인
  const existing = new Set()
  if (existsSync(TIL_DIR)) {
    const dirs = await readdir(TIL_DIR)
    for (const d of dirs) existing.add(d)
  }

  console.log(`[sync-til] 기존 TIL: ${existing.size}개`)

  // Notion DB에서 전체 엔트리 가져오기
  const pages = await fetchAllEntries()
  console.log(`[sync-til] Notion DB 엔트리: ${pages.length}개`)

  const newEntries = []

  for (const page of pages) {
    const date = parseDate(page)
    if (!date) continue
    if (EXCLUDE_DATES.has(date)) continue

    const mmdd = getMMDD(date)
    if (!mmdd) continue

    // 중복 날짜 처리
    let filename = mmdd
    let suffix = 0
    while (existing.has(filename)) {
      // 이미 동기화된 항목이면 건너뛰기
      if (suffix === 0) {
        suffix = 1
        filename = `${mmdd}_${suffix}`
      } else {
        suffix++
        filename = `${mmdd}_${suffix}`
      }
    }

    // 이미 존재하면 건너뛰기 (첫 시도에서 existing에 있었으면)
    if (suffix === 0 && existing.has(mmdd)) continue

    const props = page.properties
    const tilSummary = getTilSummary(props)
    const yourLinks = getYourLinks(props)
    const notionPageId = extractNotionPageId(yourLinks)

    const titleProp = getPropertyValue(props, 'title')
    const title = titleProp?.title?.map(t => t.plain_text).join('').trim() || filename

    newEntries.push({ date, filename, title, tilSummary, notionPageId, yourLinks })
    existing.add(filename)
  }

  if (newEntries.length === 0) {
    console.log('[sync-til] 새로운 TIL 없음 — 변경 없이 종료.')
    process.exit(0)
  }

  console.log(`[sync-til] 새 TIL ${newEntries.length}개 발견`)

  for (const entry of newEntries) {
    const entryDir = path.join(TIL_DIR, entry.filename)
    await mkdir(entryDir, { recursive: true })
    const mdPath = path.join(entryDir, `${entry.filename}.md`)

    let content = ''

    if (entry.notionPageId) {
      // Notion 페이지 본문 가져오기
      try {
        console.log(`[sync-til] 페이지 가져오는 중: ${entry.filename} (${entry.notionPageId})`)
        const blocks = await fetchBlocks(entry.notionPageId)
        content = `# ${entry.title}\n\n`
        content += await blocksToMarkdown(blocks, entryDir)
      } catch (err) {
        console.error(`[sync-til] ${entry.filename} 페이지 가져오기 실패: ${err.message}`)
        // fallback to summary
        content = `# ${entry.title}\n\n${entry.tilSummary}\n`
      }
    } else {
      // Notion 링크 없으면 summary 사용
      content = `# ${entry.title}\n\n${entry.tilSummary}\n`
    }

    await writeFile(mdPath, content, 'utf8')
    console.log(`[sync-til] 저장: til/${entry.filename}/${entry.filename}.md`)
  }

  // 새 엔트리 정보를 JSON으로 출력 (GitHub Action에서 커밋 생성에 사용)
  const output = newEntries.map(e => ({
    date: e.date,
    filename: e.filename,
    title: e.title,
  }))
  await writeFile(path.join(ROOT, '.new-til-entries.json'), JSON.stringify(output, null, 2), 'utf8')
  console.log(`[sync-til] 완료: ${newEntries.length}개 TIL 동기화됨`)
}

main().catch(err => {
  console.error('[sync-til] 오류:', err)
  process.exit(1)
})
