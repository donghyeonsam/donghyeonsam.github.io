#!/usr/bin/env node
// til/<폴더>/의 이미지를 public/til/<폴더>/로 복사한다.
// Notion에서 받은 이미지 이름은 한글(NFD)·공백이 섞여 있어 정적 호스팅에서 깨지기 쉬우므로
// 이름을 해시로 바꿔 둔다. 규칙은 src/lib/til.ts의 tilAssetName과 같아야 한다.
// public/til/은 빌드할 때마다 다시 만드는 사본이라 커밋하지 않는다(.gitignore).
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'til')
const OUT = path.join(ROOT, 'public', 'til')
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i

function assetName(fileName) {
  const normalized = fileName.normalize('NFC')
  const ext = path.extname(normalized).toLowerCase()
  return `${createHash('sha1').update(normalized).digest('hex').slice(0, 12)}${ext}`
}

await rm(OUT, { recursive: true, force: true })
if (!existsSync(SRC)) process.exit(0)

let count = 0
for (const entry of await readdir(SRC, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const files = (await readdir(path.join(SRC, entry.name))).filter((name) => IMAGE_EXT.test(name))
  if (files.length === 0) continue
  await mkdir(path.join(OUT, entry.name), { recursive: true })
  for (const name of files) {
    await copyFile(path.join(SRC, entry.name, name), path.join(OUT, entry.name, assetName(name)))
    count += 1
  }
}
console.log(`[til] 이미지 ${count}개를 public/til/로 복사했습니다.`)
