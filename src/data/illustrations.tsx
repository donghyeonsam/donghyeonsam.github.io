import type { IllustratedProject } from './types'

// "THE PROJECTS, ILLUSTRATED" cards. Each entry pairs a project with its
// hand-drawn line-art SVG — IllustratedProjects just maps over this list.
export const illustratedProjects: IllustratedProject[] = [
  {
    id: 'ait',
    title: 'Ait — AI 모의면접',
    desc: 'RAG로 사용자 맞춤 질문을 생성하고, 경량화한 MLP 모델로 표정·음성을 분석하는 모의면접 플랫폼',
    tags: ['FastAPI', 'RAG', 'Celery'],
    image: '/logos/ait-logo-horizontal.png',
    icon: (
      <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="30" y="20" width="140" height="55" rx="2" />
        <path d="M40 30 L90 30 M40 40 L120 40 M40 50 L100 50 M40 60 L130 60" />
        <circle cx="150" cy="45" r="14" />
        <path d="M144 45 L154 45 M150 39 L150 51" />
      </svg>
    ),
  },
  {
    id: 'erp',
    title: 'ERP PJT — SSAFY International',
    desc: 'Django DRF와 Vue 3로 구축한 사내 ERP 시스템',
    tags: ['Django DRF', 'Vue 3'],
    image: '/logos/erp-logo.jpg',
    icon: (
      <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="40" y="18" width="50" height="64" rx="2" />
        <rect x="110" y="18" width="50" height="64" rx="2" />
        <path d="M90 50 H110 M95 42 L90 50 L95 58 M105 42 L110 50 L105 58" />
        <path d="M50 30 H80 M50 40 H80 M50 50 H70" />
        <path d="M120 30 H150 M120 40 H150 M120 50 H140" />
      </svg>
    ),
  },
]
