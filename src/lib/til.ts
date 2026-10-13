import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import { Marked } from "marked";

/**
 * Today I Learned 글. Notion에서 동기화된 til/<폴더>/<폴더>.md를 빌드할 때 읽는다.
 * 폴더 이름은 MMDD 또는 MMDD_n(같은 날 두 번째 글)이다.
 */
export type TilPost = {
  /** til/ 아래 폴더 이름. 상세 페이지 주소(/til/<slug>/)에 그대로 쓴다. */
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** "JavaScript / DOM"처럼 제목 앞 분류가 있으면 번호를 뗀 분류명. */
  category?: string;
  html: string;
};

// 폴더 이름에 연도가 없다. SSAFY 15기 TIL은 모두 2026년에 쓴 글이다.
const TIL_YEAR = 2026;
const TIL_DIR = path.join(process.cwd(), "til");
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("jsx", javascript);

const marked = new Marked({
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined;
      const { value } = language
        ? hljs.highlight(text, { language })
        : hljs.highlightAuto(text);
      return `<pre><code class="hljs${language ? ` language-${language}` : ""}">${value}</code></pre>`;
    },
  },
});

/**
 * Notion에서 받은 이미지 이름은 한글(NFD)·공백이 섞여 있어 정적 호스팅에서 깨지기 쉽다.
 * scripts/copy-til-assets.mjs가 같은 규칙으로 public/til/에 해시 이름 사본을 만든다.
 */
export function tilAssetName(fileName: string) {
  const normalized = fileName.normalize("NFC");
  const ext = path.extname(normalized).toLowerCase();
  return `${createHash("sha1").update(normalized).digest("hex").slice(0, 12)}${ext}`;
}

/** "# 0611(Vue with DRF 03 / Customize User).md" → "Vue with DRF 03 / Customize User" */
function parseTitle(heading: string, fallback: string) {
  const text = heading.replace(/^#+\s*/, "").trim();
  const match = text.match(/^\d{3,4}\(([\s\S]+)\)\s*\.?\s*(md)?\s*$/i);
  return (match ? match[1] : text).trim() || fallback;
}

/** "Vue with DRF 03 / Customize User" → "Vue with DRF" */
function parseCategory(title: string) {
  const [head, ...rest] = title.split(" / ");
  if (rest.length === 0) return undefined;
  return head.replace(/\s*\d+$/, "").trim() || undefined;
}

async function renderBody(raw: string, folder: string, images: Set<string>) {
  // 첫 줄의 "# MMDD(주제).md" 머리말은 페이지 제목과 겹치므로 뺀다.
  const body = raw.replace(/^\s*#[^\n]*\n/, "");
  const resolved = body.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt: string, src: string) => {
    if (/^(https?:|data:|\/)/i.test(src)) return match;
    let name = src;
    try {
      name = decodeURIComponent(src);
    } catch {
      // 인코딩되지 않은 이름은 그대로 쓴다.
    }
    name = name.normalize("NFC");
    // Notion에서 이미지가 함께 동기화되지 않은 글이 있다. 깨진 그림 대신 빼 둔다.
    if (!images.has(name)) return "";
    return `![${alt.replace(/\.(png|jpe?g|gif|webp)$/i, "")}](/til/${folder}/${tilAssetName(name)})`;
  });
  return marked.parse(resolved);
}

let cache: Promise<TilPost[]> | undefined;

/** 최신 글이 위로 온다. 같은 날짜면 _1, _2 순서대로 뒤에 쓴 글이 위에 온다. */
export function readTilPosts(): Promise<TilPost[]> {
  cache ??= loadTilPosts();
  return cache;
}

async function loadTilPosts(): Promise<TilPost[]> {
  if (!existsSync(TIL_DIR)) return [];
  const folders = (await fs.readdir(TIL_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^\d{4}(_\d+)?$/.test(entry.name))
    .map((entry) => entry.name);

  const posts = await Promise.all(
    folders.map(async (folder): Promise<TilPost | null> => {
      const mdPath = path.join(TIL_DIR, folder, `${folder}.md`);
      if (!existsSync(mdPath)) return null;
      const raw = await fs.readFile(mdPath, "utf8");
      const files = await fs.readdir(path.join(TIL_DIR, folder));
      const images = new Set(
        files.filter((name) => IMAGE_EXT.test(name)).map((name) => name.normalize("NFC")),
      );

      const mmdd = folder.slice(0, 4);
      const date = `${TIL_YEAR}-${mmdd.slice(0, 2)}-${mmdd.slice(2, 4)}`;
      const firstLine = raw.split("\n").find((line) => line.trim()) ?? "";
      const title = parseTitle(firstLine, date);

      return {
        slug: folder,
        title,
        date,
        category: parseCategory(title),
        html: await renderBody(raw, folder, images),
      };
    }),
  );

  return posts
    .filter((post): post is TilPost => post !== null)
    .sort((a, b) => (a.slug < b.slug ? 1 : a.slug > b.slug ? -1 : 0));
}
