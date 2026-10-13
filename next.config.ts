import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages는 정적 파일만 서빙하므로 out/ 으로 export
  output: "export",
  // export 모드에서는 next/image 최적화 서버가 없음
  images: { unoptimized: true },
  // /til/slug.html 옆에 같은 이름의 폴더가 생겨 GitHub Pages가 폴더로 풀어 404를 낸다.
  // slug/index.html로 내보내 경로를 하나로 맞춘다.
  trailingSlash: true,
};

export default nextConfig;
