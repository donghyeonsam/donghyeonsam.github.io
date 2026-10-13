import type { Metadata } from "next";
import localFont from "next/font/local";

import Noise from "@/components/react-bits/noise";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./globals.css";

// 폰트는 모두 저장소에 넣어 두고 next/font/local로 불러온다.
// (빌드 환경에서 Google Fonts에 접속하지 못해도 빌드가 깨지지 않게)
// 날짜·코드에 쓰는 JetBrains Mono(가변).
const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: "100 800",
});

// 섹션 라벨(Selected Work 등)에만 쓰는 이탤릭 세리프.
const instrumentSerif = localFont({
  src: "./fonts/InstrumentSerif-Italic.woff2",
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: "italic",
});

// 본문용 Pretendard(가변).
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

// 모든 페이지에서 공통으로 사용하는 기본 문서 메타데이터다.
export const metadata: Metadata = {
  title: "김동현 포트폴리오",
  description: "AI로 아낀 시간을 끝까지 검증하는 데 쓰는 AI 개발자 김동현의 포트폴리오",
};

// 저장해 둔 테마(없으면 시스템 설정)를 첫 페인트 전에 <html>에 적용해
// 새로고침할 때 화면이 번쩍이는 것을 막는다.
const THEME_INIT = `(function () {
  try {
    var theme = localStorage.getItem("theme");
    if (theme !== "light" && theme !== "dark") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme은 위 스크립트가 하이드레이션 전에 넣으므로 경고를 끈다.
    <html
      lang="ko"
      // Next 16은 이 속성이 있어야 라우트 이동 중 smooth 스크롤을 끈다.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${instrumentSerif.variable} ${pretendard.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body id="top" className="flex min-h-full flex-col">
        <SiteHeader />
        {/* 각 route의 페이지 컴포넌트가 이 위치에 렌더링된다. */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Noise />
      </body>
    </html>
  );
}
