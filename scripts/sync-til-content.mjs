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
import { writeFile, mkdir, readdir, readFile, rm, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import http from 'node:http'
import { deriveTitle } from './til-title.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const TIL_DIR = path.join(ROOT, 'til')
const MANIFEST_PATH = path.join(TIL_DIR, '.sync-manifest.json')
const FLAGGED_PATH = path.join(TIL_DIR, '.flagged-duplicates.json')

// 새로 발견된 Notion 행이 이미 동기화된 글과 이 이상 겹치면 자동 커밋하지
// 않고 사람 확인이 필요한 것으로 표시한다. page.id 추적(매니페스트)은
// "같은 Notion 행을 두 번 처리"만 막을 뿐, 서로 다른 행이 같은 내용을
// 담고 있는 경우(행 복사, 예전 글 재입력 등)는 못 막기 때문의 2차 방어선.
const DUP_SIMILARITY_THRESHOLD = 0.6

const EXCLUDE_DATES = new Set(['2026-01-20', '2026-03-23', '2026-03-24', '2026-05-22', '2026-01-21', '2026-01-23', '2026-01-30', '2026-02-15', '2026-02-17', '2026-02-18', '2026-03-02', '2026-03-06', '2026-03-13', '2026-03-14', '2026-03-21', '2026-03-22', '2026-04-02', '2026-04-03', '2026-04-08', '2026-04-18', '2026-04-20', '2026-04-25', '2026-05-05', '2026-05-29', '2026-06-05'])

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

  // 실제 Notion "Date" 속성이 있으면 최우선으로 쓴다. title 정규식이나
  // created_time(행을 Notion에 "생성한" 시각 — 실제로 공부한 날짜와
  // 다를 수 있음)보다 훨씬 신뢰도가 높다. 같은 내용이 서로 다른 mmdd
  // 폴더로 흩어져 중복 판별을 피해가는 사고가 실제로 있었다.
  const dateTypeProp = Object.values(props).find(p => p.type === 'date')
  if (dateTypeProp?.date?.start) {
    return dateTypeProp.date.start.slice(0, 10)
  }

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

// ─── 콘텐츠 유사도(중복 감지) ───

function normalizeForCompare(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '[IMG]') // 이미지 참조는 파일명이 매번 달라지므로 통일
    .replace(/```[a-zA-Z]*/g, '```') // 코드펜스 언어 표기 차이 무시
    .replace(/^#.*$/m, '') // 첫 줄(제목) 제외 — 제목 표기 방식 차이는 무시
    .replace(/\s+/g, ' ')
    .trim()
}

function charShingles(text, n = 8) {
  const shingles = new Set()
  for (let i = 0; i + n <= text.length; i++) shingles.add(text.slice(i, i + n))
  return shingles
}

function jaccardSimilarity(a, b) {
  const sa = charShingles(a)
  const sb = charShingles(b)
  if (sa.size === 0 || sb.size === 0) return 0
  let intersection = 0
  for (const s of sa) if (sb.has(s)) intersection++
  return intersection / (sa.size + sb.size - intersection)
}

function findMostSimilar(text, corpus) {
  let best = null
  for (const entry of corpus) {
    const score = jaccardSimilarity(text, entry.text)
    if (!best || score > best.score) best = { dir: entry.dir, score }
  }
  return best
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

  // Notion 행 id(page.id) → 동기화된 til/ 폴더명 매니페스트.
  // 폴더가 이미 있는지만으로는 "이 Notion 행을 이미 처리했는지"를 알 수
  // 없다(day N에 처리한 행도 day N+1에 다시 보게 되므로). 그래서 폴더
  // 존재 여부가 아니라 이 매니페스트로만 스킵 여부를 판단한다.
  let manifest = {}
  if (existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  }
  const alreadySynced = new Set(Object.keys(manifest))

  // Notion DB에서 전체 엔트리 가져오기
  const pages = await fetchAllEntries()
  console.log(`[sync-til] Notion DB 엔트리: ${pages.length}개`)

  // 유사도 비교 기준이 될, 이미 동기화된 글들의 정규화된 본문
  const existingTexts = []
  for (const dirName of existing) {
    const p = path.join(TIL_DIR, dirName, `${dirName}.md`)
    if (!existsSync(p)) continue
    const raw = await readFile(p, 'utf8')
    existingTexts.push({ dir: dirName, text: normalizeForCompare(raw) })
  }

  const candidates = []

  for (const page of pages) {
    if (alreadySynced.has(page.id)) continue

    const date = parseDate(page)
    if (!date) continue
    if (EXCLUDE_DATES.has(date)) continue

    const mmdd = getMMDD(date)
    if (!mmdd) continue

    // 같은 날짜에 이미 다른 (진짜 신규) 항목이 있으면 접미사를 붙인다.
    let filename = mmdd
    let suffix = 0
    while (existing.has(filename)) {
      suffix++
      filename = `${mmdd}_${suffix}`
    }
    existing.add(filename) // 이번 실행의 다른 후보와 슬롯이 겹치지 않도록 예약

    const props = page.properties
    const tilSummary = getTilSummary(props)
    const yourLinks = getYourLinks(props)
    const contentPageId = extractNotionPageId(yourLinks)

    const titleProp = getPropertyValue(props, 'title')
    const titleText = titleProp?.title?.map(t => t.plain_text).join('').trim() ?? ''
    const dateLabel = `${mmdd.slice(0, 2)}.${mmdd.slice(2, 4)}`
    const title = deriveTitle({ titleText, summaryText: tilSummary, fallbackDateLabel: dateLabel })

    candidates.push({ date, filename, title, tilSummary, notionPageId: contentPageId, yourLinks, rowId: page.id })
  }

  console.log(`[sync-til] 새 후보 ${candidates.length}개 발견 — 콘텐츠 확인 중`)

  const newEntries = []
  const flagged = []

  for (const candidate of candidates) {
    // 본문을 임시 폴더에 먼저 만들어서(이미지 다운로드 포함) 유사도부터
    // 확인한다. 중복으로 판정되면 최종 위치로 옮기지 않고 통째로 지운다.
    const stagingDir = path.join(TIL_DIR, `.staging-${candidate.filename}`)
    await mkdir(stagingDir, { recursive: true })

    let content = ''
    if (candidate.notionPageId) {
      try {
        console.log(`[sync-til] 페이지 가져오는 중: ${candidate.filename} (${candidate.notionPageId})`)
        const blocks = await fetchBlocks(candidate.notionPageId)
        content = `# ${candidate.title}\n\n`
        content += await blocksToMarkdown(blocks, stagingDir)
      } catch (err) {
        console.error(`[sync-til] ${candidate.filename} 페이지 가져오기 실패: ${err.message}`)
        content = `# ${candidate.title}\n\n${candidate.tilSummary}\n`
      }
    } else {
      content = `# ${candidate.title}\n\n${candidate.tilSummary}\n`
    }

    const normalized = normalizeForCompare(content)
    const match = normalized ? findMostSimilar(normalized, existingTexts) : null

    if (match && match.score >= DUP_SIMILARITY_THRESHOLD) {
      console.warn(`[sync-til] 중복 의심으로 스킵: ${candidate.filename} (til/${match.dir}와 유사도 ${match.score.toFixed(3)}) — 수동 확인 필요`)
      flagged.push({
        filename: candidate.filename,
        title: candidate.title,
        rowId: candidate.rowId,
        matchedDir: match.dir,
        similarity: Number(match.score.toFixed(3)),
      })
      await rm(stagingDir, { recursive: true, force: true })
      existing.delete(candidate.filename) // 슬롯 반납 — 다음 실행에서 다시 검토됨 (매니페스트에도 안 올림)
      continue
    }

    const finalDir = path.join(TIL_DIR, candidate.filename)
    await rename(stagingDir, finalDir)
    await writeFile(path.join(finalDir, `${candidate.filename}.md`), content, 'utf8')
    console.log(`[sync-til] 저장: til/${candidate.filename}/${candidate.filename}.md`)

    newEntries.push(candidate)
    manifest[candidate.rowId] = candidate.filename
    existingTexts.push({ dir: candidate.filename, text: normalized }) // 같은 실행 내 이후 후보와도 비교되도록
  }

  // 새로 처리한 행이 없어도 매니페스트 자체는 항상 최신 상태로 써 둔다
  // (내용이 그대로면 diff도 없다).
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  if (flagged.length > 0) {
    await writeFile(FLAGGED_PATH, JSON.stringify(flagged, null, 2) + '\n', 'utf8')
    console.warn(`[sync-til] 중복 의심 ${flagged.length}건 — til/.flagged-duplicates.json 확인 필요`)
  } else if (existsSync(FLAGGED_PATH)) {
    await rm(FLAGGED_PATH) // 이전에 걸렸던 항목이 이번엔 없으면(해결됨) 정리
  }

  if (newEntries.length === 0) {
    console.log('[sync-til] 새로운 TIL 없음(중복 의심 제외 후) — 변경 없이 종료.')
    process.exit(0)
  }

  console.log(`[sync-til] 새 TIL ${newEntries.length}개 동기화됨`)

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
