import type { Metadata } from "next";

import { TilLink } from "@/components/til-doc";
import { readTilPosts } from "@/lib/til";

export const metadata: Metadata = { title: "Today I Learned · 김동현" };

/** 홈의 "전체 기록 보기"가 여는 TIL 전체 목록. */
export default async function TilIndex() {
  const posts = await readTilPosts();

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <p className="section-label">Today I Learned</p>
      <h1 className="mt-3 text-[2rem] font-bold tracking-[-0.025em] text-foreground">
        매일 배운 것을 남긴 기록
      </h1>
      <p className="mt-3 text-[15px] text-foreground/70">
        SSAFY에서 배운 내용을 Notion에 정리하고, 매일 자정 이 사이트로 자동 동기화합니다. 총{" "}
        {posts.length}편.
      </p>
      <ol className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
        {posts.map((post) => (
          <li key={post.slug}>
            <TilLink post={post} />
          </li>
        ))}
      </ol>
    </div>
  );
}
