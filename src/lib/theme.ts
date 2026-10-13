"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const DEFAULT_THEME: Theme = "light";

/** layout.tsx의 인라인 스크립트가 첫 페인트 전에 <html>에 넣어둔 값을 읽는다. */
function currentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function serverTheme(): Theme {
  return DEFAULT_THEME;
}

/**
 * 현재 테마를 상태로 구독한다.
 * 전환은 <html data-theme>를 고치는 것뿐이라, 어디서 바뀌든
 * MutationObserver로 같은 값을 보게 된다(컨텍스트 전달이 필요 없다).
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, currentTheme, serverTheme);
}

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // 시크릿 모드 등 저장이 막힌 환경에서는 이번 방문 동안만 유지한다.
  }
}

export function toggleTheme() {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
}
