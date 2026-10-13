"use client";

import { useLayoutEffect } from "react";

const KEY = "home-scroll-y";

/**
 * 홈에서 마지막으로 보던 위치를 기억했다가 돌아오면 그 자리로 되돌린다.
 * 헤더 메뉴처럼 #섹션으로 들어온 경우에는 그 섹션 이동을 우선한다.
 */
export default function HomeScrollRestore() {
  useLayoutEffect(() => {
    let saved: number | null = null;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw !== null) saved = Number(raw);
    } catch {}

    // 첫 페인트 전에 바로 되돌려 맨 위가 한 프레임도 보이지 않게 한다.
    // scroll={false}가 없는 링크로 들어오면 Next가 이어서 맨 위로 올리므로 다음 프레임에 한 번 더 맞춘다.
    let frame = 0;
    if (saved !== null && Number.isFinite(saved) && !window.location.hash) {
      const top = saved;
      const restore = () => {
        if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "instant" });
      };
      restore();
      frame = requestAnimationFrame(restore);
    }

    let pending = 0;
    const save = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        try {
          sessionStorage.setItem(KEY, String(Math.round(window.scrollY)));
        } catch {}
      });
    };
    window.addEventListener("scroll", save, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", save);
    };
  }, []);

  return null;
}
