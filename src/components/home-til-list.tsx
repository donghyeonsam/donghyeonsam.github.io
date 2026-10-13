"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

import styles from "@/app/home.module.css";

const BATCH_SIZE = 6;
// 홈으로 돌아왔을 때 스크롤 위치를 되돌릴 수 있도록 펼친 개수도 기억한다.
const KEY = "home-til-visible";

const subscribe = () => () => {};
function savedCount() {
  try {
    return Math.max(BATCH_SIZE, Number(sessionStorage.getItem(KEY)) || 0);
  } catch {
    return BATCH_SIZE;
  }
}

export default function HomeTilList({ items }: { items: ReactNode[] }) {
  const saved = useSyncExternalStore(subscribe, savedCount, () => BATCH_SIZE);
  const [expanded, setExpanded] = useState<number | null>(null);
  const visibleCount = expanded ?? saved;
  const shownCount = Math.min(visibleCount, items.length);
  const nextCount = Math.min(BATCH_SIZE, items.length - shownCount);

  return (
    <>
      <ol id="home-til-list" className={styles.notesList}>
        {items.slice(0, visibleCount)}
      </ol>
      <p role="status" className="sr-only">
        전체 {items.length}개 중 {shownCount}개의 기록을 표시하고 있습니다.
      </p>
      {nextCount > 0 ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            aria-controls="home-til-list"
            onClick={() => {
              const next = Math.min(visibleCount + BATCH_SIZE, items.length);
              setExpanded(next);
              try {
                sessionStorage.setItem(KEY, String(next));
              } catch {}
            }}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-ink/25 px-6 text-[14px] font-medium text-foreground/80 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            이전 기록 {nextCount}개 더 보기
          </button>
        </div>
      ) : null}
    </>
  );
}
