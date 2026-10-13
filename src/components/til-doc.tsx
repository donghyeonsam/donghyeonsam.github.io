import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import type { TilPost } from "@/lib/til";

import styles from "./doc-prose.module.css";

const dotted = (date: string) => date.replaceAll("-", ".");

export function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-ink/12 bg-ink/6 px-2.5 py-1 text-[12px] text-foreground/75">
      {label}
    </span>
  );
}

/** /til 전체 목록의 한 줄. 날짜 · 제목 → / 분류 순서. */
export function TilLink({ post }: { post: TilPost }) {
  return (
    <Link
      href={`/til/${post.slug}/`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5"
    >
      <span className="col-span-2 font-mono text-[12px] tabular-nums text-foreground/65 sm:col-span-1">
        {dotted(post.date)}
      </span>
      <h3 className="line-clamp-2 text-[17px] font-semibold leading-7 tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent sm:line-clamp-none sm:truncate">
        {post.title}
      </h3>
      <ArrowRight
        aria-hidden="true"
        size={17}
        className="self-center text-foreground/70 transition-transform group-hover:translate-x-1 group-hover:text-accent"
      />
      {post.category ? (
        <div className="col-start-1 flex flex-wrap gap-1.5 sm:col-start-2">
          <Tag label={post.category} />
        </div>
      ) : null}
    </Link>
  );
}

/** TIL 상세 본문. 이전·다음 글로 이어서 읽을 수 있게 아래에 링크를 둔다. */
export function TilDoc({
  post,
  newer,
  older,
}: {
  post: TilPost;
  newer?: TilPost;
  older?: TilPost;
}) {
  return (
    <article className="mx-auto max-w-[760px] px-5 pb-24 pt-8 sm:px-8 sm:pt-10">
      <div className="flex gap-4 text-[13px] text-foreground/65">
        <Link href="/#til" scroll={false} className="transition-colors hover:text-accent">
          ← Home
        </Link>
        <Link href="/til/" className="transition-colors hover:text-accent">
          전체 목록
        </Link>
      </div>

      <p className="mt-10 section-label">Today I Learned</p>
      <span className="mt-5 flex items-center gap-1.5 font-mono text-[12px] text-foreground/65">
        <CalendarDays aria-hidden="true" size={13} strokeWidth={1.7} />
        {dotted(post.date)}
      </span>

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.25rem]">
        {post.title}
      </h1>

      {post.category ? (
        <div className="mt-5 flex flex-wrap gap-1.5">
          <Tag label={post.category} />
        </div>
      ) : null}

      {/* 본문은 내가 Notion에 쓴 마크다운을 빌드할 때 변환한 것이라 그대로 삽입한다. */}
      <div
        className={`mt-10 border-t border-ink/10 ${styles.prose}`}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <nav
        aria-label="이전 · 다음 TIL"
        className="mt-20 grid gap-4 border-t border-ink/15 pt-8 sm:grid-cols-2"
      >
        {older ? (
          <Link href={`/til/${older.slug}/`} className="group min-w-0">
            <span className="text-[12px] text-foreground/60">← 이전 기록 · {dotted(older.date)}</span>
            <span className="mt-1 block truncate text-[15px] font-semibold text-foreground transition-colors group-hover:text-accent">
              {older.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={`/til/${newer.slug}/`} className="group min-w-0 sm:text-right">
            <span className="text-[12px] text-foreground/60">다음 기록 · {dotted(newer.date)} →</span>
            <span className="mt-1 block truncate text-[15px] font-semibold text-foreground transition-colors group-hover:text-accent">
              {newer.title}
            </span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
