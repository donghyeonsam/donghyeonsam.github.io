// 홈 프로젝트 목록. 카드를 누르면 repo의 GitHub 레포로 이동한다.
// 배열 순서대로 카드가 놓인다.
// 내용은 IT 포트폴리오(2026.10)를 기준으로 정리했다.

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  /** 수상 내역. 카드에 배지로 표시한다. */
  award?: string;
  /** /public 기준 로고·썸네일. */
  thumbnail: string;
  role: string;
  period: string;
  team: string;
  stack: string[];
  /** 클릭하면 이동하는 GitHub 레포. */
  repo: string;
};

export const projects: Project[] = [
  {
    slug: "ait",
    name: "Ait",
    tagline: "사용자의 이력서·자소서·GitHub를 읽고 맞춤형 질문을 제공하는 AI 모의면접",
    thumbnail: "/projects/ait/logo.png",
    role: "AI 파트 단독 담당",
    period: "2026.07 ~ 2026.08",
    team: "6인 팀 (FE 2 · BE·Infra 3 · AI 1)",
    stack: ["FastAPI", "RAG", "ChromaDB", "PyTorch", "MediaPipe"],
    repo: "https://github.com/donghyeonsam/Ait-project",
  },
  {
    slug: "what-in-the-world",
    name: "What In the World",
    tagline: "세계 뉴스의 논조를 읽어 지구본 위에 그리는 서비스",
    award: "프로젝트 경진대회 우수상",
    thumbnail: "/projects/what-in-the-world/logo.png",
    role: "AI · 논조 분류 모델",
    period: "2026.08 ~ 2026.10",
    team: "팀 프로젝트",
    stack: ["Python", "Kafka", "Spark", "HuggingFace"],
    repo: "https://github.com/donghyeonsam/What-In-the-World-project",
  },
  {
    slug: "erp",
    name: "SSAFY International ERP",
    tagline: "AI가 오늘 할 일의 순서를 제안하는 통합 ERP",
    award: "프로젝트 경진대회 우수상",
    thumbnail: "/projects/erp/logo.jpg",
    role: "Backend · Frontend",
    period: "2026.05 ~ 2026.06",
    team: "2인 팀",
    stack: ["Django", "Vue", "WebSocket", "LLM"],
    repo: "https://github.com/donghyeonsam/ERP-project",
  },
];
