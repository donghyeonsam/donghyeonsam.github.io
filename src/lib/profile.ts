// 홈 화면의 소개·경력 데이터. 문구는 여기서만 고치면 된다.

export const profile = {
  name: "Kim Dong Hyeon",
  role: "AI Developer",
  location: "Gwangmyeong, KR",
  nameKo: "김동현",
  // 프로필 사진 아래 이름 옆에 표시한다.
  facts: [
    ["전공", "식품조리학"],
    ["MBTI", "ISFP"],
  ],
  // 원본 사진에서 테이블 위 음료만 지우고 3:4(540×720)로 자른 웹용 사본.
  photo: "/my_profile/profile.jpg",
  // 홈 첫 화면의 큰 제목. [첫 줄, 둘째 줄 강조어, 둘째 줄 나머지]
  headline: ["AI로 아낀 시간을", "끝까지 검증", "하는 데 씁니다."],
  // 넓은 화면에서는 줄마다 끊고, 좁은 화면에서는 이어서 흐른다.
  intro: [
    "설계의 빈틈은 AI와 함께 찾고, AI가 내놓은 코드는 리뷰로 직접 확인합니다.",
    "숫자가 화면에 떴다고 끝내지 않고, 원인이 데이터로 설명될 때까지 다시 봅니다.",
    "속도는 AI에게 맡겨도, 결과에 대한 책임은 끝까지 제가 집니다.",
  ],
  github: "https://github.com/donghyeonsam",
  email: "vvddalfmr@naver.com",
};

/**
 * Background 줄. 항목을 추가하면 홈에 순서대로 그려진다.
 * logo는 /public 기준 경로. 없으면 icon 이름의 아이콘 배지로 대신한다.
 */
export type BackgroundRow = {
  title: string;
  role: string;
  period: string;
  details: string[];
  logo?: string;
  icon?: "school" | "code" | "building";
};

export const background: BackgroundRow[] = [
  {
    title: "SSAFY 15기",
    role: "삼성 청년 SW·AI 아카데미",
    logo: "/ex_logo/ssafy_web.png",
    period: "2026.01 ~ 2026.12",
    details: [
      "프로젝트 경진대회 우수상 2회 (ERP · WITW)",
      "Ait · AI 서버 2종 단독 설계·구현",
      "WITW · 뉴스 논조 분류 모델 증류",
    ],
  },
  {
    title: "용인대학교",
    role: "식품조리학과",
    icon: "school",
    period: "2023 ~ 2025",
    details: ["식품조리학과 졸업 (편입학)", "주방에서 개발자로 전향"],
  },
  {
    title: "Certificates",
    role: "자격",
    logo: "/ex_logo/cert_web.png",
    period: "",
    details: [
      "정보처리기사 (2026.09)",
      "SQLD (2026.03)",
      "ADsP (2026.06)",
      "OPIc IH (2026.08)",
    ],
  },
  {
    title: "Stack",
    role: "주로 쓰는 기술",
    icon: "code",
    period: "",
    details: [
      "Python · FastAPI · PyTorch",
      "LLM · RAG · ChromaDB",
      "Django DRF · Vue 3 · SQL",
    ],
  },
];
