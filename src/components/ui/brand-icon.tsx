import Image from "next/image";

/** frontmatter에 허용할 기술명 별칭과 /public/icons의 실제 파일명을 연결한다. */
const BRAND_ICONS: Record<string, string> = {
  django: "django",
  docker: "docker",
  fastapi: "fastapi",
  figma: "figma",
  github: "github",
  gitlab: "gitlab",
  javascript: "javascript",
  jenkins: "jenkins",
  jira: "jira",
  livekit: "livekit",
  mysql: "mysql",
  nginx: "nginx",
  python: "python",
  react: "react",
  redis: "redis",
  "spring boot": "springboot",
  springboot: "springboot",
  sqlite: "sqlite",
  "tailwind css": "tailwindcss",
  tailwindcss: "tailwindcss",
  typescript: "typescript",
  vercel: "vercel",
  vue: "vuedotjs",
  "vue.js": "vuedotjs",
  vuedotjs: "vuedotjs",
};

export function BrandIcon({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = BRAND_ICONS[name.trim().toLowerCase()];

  // 등록하지 않은 기술도 텍스트 배지는 유지할 수 있도록 아이콘만 생략한다.
  if (!icon) return null;

  return (
    <Image
      src={`/icons/${icon}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`brand-icon shrink-0 ${className}`}
    />
  );
}

/** 프로젝트 목록과 상세 화면에서 공통으로 쓰는 아이콘 포함 기술 배지. */
export function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-ink/6 px-3 py-1 text-[12px] text-foreground/75">
      <BrandIcon name={label} size={14} />
      {label}
    </span>
  );
}
