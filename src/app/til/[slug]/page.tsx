import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TilDoc } from "@/components/til-doc";
import { readTilPosts } from "@/lib/til";

// 정적 배포라 빌드 때 만든 글 말고는 존재하지 않는다.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await readTilPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/til/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = (await readTilPosts()).find((item) => item.slug === slug);
  return post ? { title: `${post.title} · Today I Learned` } : {};
}

export default async function TilPage({ params }: PageProps<"/til/[slug]">) {
  const { slug } = await params;
  const posts = await readTilPosts();
  const index = posts.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  return (
    // 본문 스타일이 화면 폭 대신 이 영역 폭을 기준으로 반응하도록 컨테이너로 둔다.
    <div className="@container">
      <TilDoc post={posts[index]} newer={posts[index - 1]} older={posts[index + 1]} />
    </div>
  );
}
