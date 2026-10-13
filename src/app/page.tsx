import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Code2,
  GraduationCap,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import HomeScrollRestore from "@/components/home-scroll-restore";
import HomeTilList from "@/components/home-til-list";
import { BlurText, FadeContent, ScrollReveal, SpotlightCard } from "@/components/react-bits/home-effects";
import { TechBadge } from "@/components/ui/brand-icon";
import { background, profile, type BackgroundRow } from "@/lib/profile";
import { projects, type Project } from "@/lib/projects";
import { readTilPosts, type TilPost } from "@/lib/til";

import styles from "./home.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
/** "6인 팀 (FE 2, ...)" → "6인", 숫자가 없으면 원문("팀 프로젝트") 그대로. */
const headcount = (team: string) => team.match(/\d+인/)?.[0] ?? team;

const ROW_ICONS = { school: GraduationCap, code: Code2, building: Building2 };

/**
 * Background 로고 배지. 로고는 흰 바탕에 맞춰 만든 것이 많아 다크 모드에서도 흰 배지를 유지한다.
 * 로고가 없는 항목은 아이콘으로 대신한다.
 */
function CareerBadge({ row }: { row: BackgroundRow }) {
  const Icon = ROW_ICONS[row.icon ?? "building"];
  return (
    <span className="relative grid h-11 w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgb(29_28_25/0.08),0_1px_2px_rgb(29_28_25/0.06)]">
      {row.logo ? (
        <Image src={row.logo} alt={`${row.title} 로고`} fill sizes="68px" className="object-contain p-2" />
      ) : (
        <Icon aria-hidden="true" size={20} strokeWidth={1.7} className="text-[#9b4d2f]" />
      )}
    </span>
  );
}

/** 섹션 위의 영문 라벨. "Selected Work / 01"이면 앞은 이탤릭 세리프, " / " 뒤는 작은 모노로 쓴다. */
function Eyebrow({ children }: { children: string }) {
  const [label, ...rest] = children.split(" / ");
  return (
    <p className="flex items-baseline gap-2.5 text-label">
      <span className="section-label">{label}</span>
      {rest.length ? (
        <span className="font-mono text-[12px] tracking-[0.05em] text-foreground/65">
          / {rest.join(" / ")}
        </span>
      ) : null}
    </p>
  );
}

function Section({
  id,
  eyebrow,
  title,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-ink/15 pb-20 pt-12">
      <FadeContent className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[1.75rem] font-bold tracking-[-0.025em] text-foreground sm:text-[2rem]">
            <ScrollReveal text={title} />
          </h2>
        </div>
        {action}
      </FadeContent>
      <div className="mt-10">{children}</div>
    </section>
  );
}

/** 첫 화면. 프로필 사진 | 제목·소개, 그 아래 Background 줄에 경력·자격을 늘어놓는다. */
function Hero() {
  return (
    <section id="about" className="scroll-mt-20 pb-20 pt-12 sm:pt-16">
      {/* 표지처럼 맨 위에 이름 줄을 긋는다. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3 border-b border-ink/15 pb-3">
        <Eyebrow>{`${profile.name} / Portfolio`}</Eyebrow>
        <p className="shrink-0 text-[12px] text-foreground/65">{profile.location}</p>
      </div>

      {/* 사진은 왼쪽, 제목·소개는 오른쪽에 두고 세로 가운데에 맞춘다. */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center lg:gap-16">
        {/* 좁은 화면에서는 소개 아래로 내린다. */}
        <FadeContent delay={0.15} className="w-full max-w-[280px] max-lg:order-last">
          <figure className={styles.portrait}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-surface">
              <Image
                src={profile.photo}
                alt={`${profile.nameKo} 프로필 사진`}
                fill
                priority
                sizes="280px"
                className="object-cover"
              />
            </div>
            <figcaption className={styles.portraitCaption}>
              <p className="text-[17px] font-bold tracking-[-0.02em] text-foreground">
                {profile.nameKo}
                <span className="ml-2 text-[13px] font-medium text-foreground/65">
                  {profile.name}
                </span>
              </p>
              <p className="mt-1 text-[12px] text-foreground/70">
                {profile.facts.map(([label, value]) => `${label} ${value}`).join(" · ")}
              </p>
              <p className="mt-4 font-serif text-[16px] italic text-accent">{profile.role}</p>
            </figcaption>
          </figure>
        </FadeContent>

        <div>
          {/* 첫 줄은 진하게, 둘째 줄은 회색으로 두고 강조어만 accent로 칠한다. */}
          <h1 className="text-[2.25rem] font-bold leading-[1.18] tracking-[-0.03em] text-foreground sm:text-[3.5rem]">
            <BlurText text={profile.headline[0]} />
            <br />
            <BlurText text={profile.headline[1]} delay={0.2} className="text-accent" />
            <BlurText text={profile.headline[2]} delay={0.38} className="text-foreground/60" />
          </h1>
          <FadeContent delay={0.2}>
            <p className="mt-8 max-w-[600px] text-[16px] leading-7 text-foreground/75 sm:text-[17px] sm:leading-[30px]">
              {profile.intro.map((line) => (
                <span key={line} className="sm:block">
                  {line}{" "}
                </span>
              ))}
            </p>
          </FadeContent>
        </div>
      </div>

      <FadeContent className="mt-16 border-t border-ink/15 pt-10">
        <Eyebrow>Background</Eyebrow>
        <ol className="mt-7 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {background.map((row) => (
            <li
              key={row.title}
              className="min-w-0 sm:odd:pr-6 sm:even:border-l sm:even:border-ink/15 sm:even:pl-6 lg:border-l lg:border-ink/15 lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
            >
              <div className="flex items-center gap-3.5">
                <CareerBadge row={row} />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold leading-6 text-foreground">
                    {row.title}
                  </p>
                  {row.role ? (
                    <p className="truncate text-[14px] leading-6 text-foreground/65">{row.role}</p>
                  ) : null}
                </div>
              </div>
              {row.period ? (
                <p className="mt-4 font-mono text-[12px] tabular-nums text-accent">{row.period}</p>
              ) : null}
              <ul
                className={`${row.period ? "mt-2" : "mt-4"} space-y-1 text-[14px] leading-6 text-foreground/75`}
              >
                {row.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </FadeContent>
    </section>
  );
}

/** 수상한 프로젝트의 로고 모서리에 걸치는 원형 우수상 도장. 테두리 글자가 천천히 돈다. */
function AwardSeal({ id, year }: { id: string; year: string }) {
  const ringId = `award-ring-${id}`;
  return (
    <div
      aria-hidden="true"
      className="absolute -right-2.5 -top-2.5 z-10 size-20 rounded-full bg-accent text-on-accent shadow-[0_8px_20px_-8px_rgb(29_28_25/0.45)] sm:-right-4 sm:-top-4 sm:size-[5.5rem]"
    >
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 animate-[spin_24s_linear_infinite] motion-reduce:animate-none"
      >
        <defs>
          <path id={ringId} d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
        </defs>
        <text className="fill-current text-[11px] font-semibold uppercase" letterSpacing="0.16em">
          <textPath href={`#${ringId}`} textLength="290" lengthAdjust="spacing">
            {`Project Award · SSAFY ${year} · `}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-current/40">
        <Trophy size={15} strokeWidth={2} />
        <span className="mt-0.5 text-[10px] font-bold tracking-[-0.02em]">우수상</span>
      </span>
    </div>
  );
}

/** 색상 패널 안에 로고 전체를 보여 주는 작품집 이미지. */
function ProjectArtwork({ project }: { project: Project }) {
  return (
    <div
      data-project={project.slug}
      className={styles.projectPanel}
    >
      <div className={styles.projectImage}>
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 480px"
          className="object-contain p-[8%] transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}

/** 레포로 나가는 링크 공통 속성. */
const external = { target: "_blank", rel: "noreferrer" } as const;

/** 프로젝트 한 줄. 왼쪽 로고 패널, 오른쪽 이름·한 줄 소개·역할. 누르면 GitHub 레포로 이동한다. */
function ProjectRow({ project, index }: { project: Project; index: number }) {
  return (
    <li>
      <FadeContent delay={0.05} className="h-full">
        <SpotlightCard>
          <a
            href={project.repo}
            {...external}
            aria-label={`${project.name} GitHub 레포로 이동`}
            className="group grid gap-6 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:items-center sm:gap-10 sm:p-6"
          >
            <div className="relative">
              <ProjectArtwork project={project} />
              {project.award ? <AwardSeal id={project.slug} year={project.period.slice(0, 4)} /> : null}
            </div>
            <div className="min-w-0">
              <div className={styles.projectMeta}>
                <span>{pad(index + 1)}</span>
                <span>{[project.period, headcount(project.team)].filter(Boolean).join(" · ")}</span>
              </div>
              <h3 className="mt-4 text-[1.75rem] font-bold tracking-[-0.03em] text-foreground sm:text-[2rem]">
                {project.name}
              </h3>
              <p className="mt-3 text-balance text-[18px] font-semibold leading-[1.55] tracking-[-0.02em] text-foreground/90 sm:text-[20px]">
                {project.tagline}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-accent-soft px-3 py-1.5 text-[12px] font-medium text-accent">
                  {project.role}
                </span>
                {project.award ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-3 py-1.5 text-[12px] font-semibold text-accent">
                    <Trophy aria-hidden="true" size={12} strokeWidth={2} />
                    {project.award}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <TechBadge key={tech} label={tech} />
                ))}
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 border-b border-accent/60 pb-1 text-[14px] font-medium text-accent transition-colors group-hover:border-accent">
                GitHub 레포 보기
                <ArrowUpRight aria-hidden="true" size={14} />
              </span>
            </div>
          </a>
        </SpotlightCard>
      </FadeContent>
    </li>
  );
}

function HomeTilLink({ post }: { post: TilPost }) {
  return (
    <Link href={`/til/${post.slug}/`} className={styles.noteLink}>
      <h3 className={styles.noteTitle}>{post.title}</h3>
      <div className={styles.noteMeta}>
        {post.category ? <span className={styles.noteTags}>{post.category}</span> : null}
        <time dateTime={post.date} className={styles.noteDate}>
          {post.date.replaceAll("-", ".")}
        </time>
      </div>
    </Link>
  );
}

export default async function Home() {
  const posts = await readTilPosts();

  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
      <HomeScrollRestore />
      <Hero />

      <section id="projects" className="scroll-mt-20 border-t border-ink/15 pb-20 pt-12">
        <ul className="grid gap-6">
          {projects.map((project, index) => (
            <ProjectRow key={project.slug} project={project} index={index} />
          ))}
        </ul>
      </section>

      <Section
        id="til"
        eyebrow="Today I Learned"
        title="매일 배운 것을 남긴 기록"
        action={
          <Link
            href="/til/"
            className="inline-flex items-center gap-1.5 border-b border-accent/60 pb-1 text-[14px] font-medium text-accent transition-colors hover:border-accent"
          >
            전체 {posts.length}편 보기
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        }
      >
        {posts.length === 0 ? (
          <p className="text-sm text-foreground/70">아직 작성한 기록이 없습니다.</p>
        ) : (
          <FadeContent className="-mt-2 max-w-[800px]">
            <HomeTilList
              items={posts.map((post) => (
                <li key={post.slug} className="min-w-0">
                  <HomeTilLink post={post} />
                </li>
              ))}
            />
          </FadeContent>
        )}
      </Section>
    </div>
  );
}
