# donghyeonsam.github.io

김동현(Dongsam)의 포트폴리오. Next.js 정적 export로 빌드해 GitHub Pages에 배포한다.

## 구성

| 위치 | 내용 |
|---|---|
| `src/lib/profile.ts` | 이름·소개 문구·Background(경력·자격·스택) |
| `src/lib/projects.ts` | Selected Work 프로젝트. 카드를 누르면 `repo`의 GitHub 레포로 이동 |
| `src/lib/til.ts` | `til/<폴더>/<폴더>.md`를 빌드 때 읽어 Today I Learned 목록·상세로 변환 |
| `public/projects/<slug>/` | 프로젝트 로고 |
| `public/my_profile/profile.jpg` | 프로필 사진(웹용 3:4) |

```bash
npm ci
npm run dev     # http://localhost:3000
npm run build   # out/ 에 정적 사이트 생성
```

`dev`·`build`는 먼저 `scripts/copy-til-assets.mjs`로 `til/`의 이미지를
`public/til/`에 해시 이름으로 복사한다(한글·공백 파일명이 정적 호스팅에서 깨지지 않게).
이 사본은 커밋하지 않는다.

## Notion → TIL 자동 동기화

1. `.github/workflows/sync-til.yml`이 매일 자정(KST) `scripts/sync-til-content.mjs`를 실행해
   Notion TIL 데이터베이스의 새 글을 `til/MMDD/MMDD.md` + 이미지로 받아 날짜별로 커밋한다.
2. 동기화가 끝나면 `deploy.yml`이 `workflow_run`으로 이어서 사이트를 다시 배포한다.

필요한 저장소 시크릿: `NOTION_TOKEN`, `NOTION_TIL_DATABASE_ID`.
로컬에서는 `.env.example`을 `.env`로 복사해 채운 뒤 `npm run sync:til`.

## 디자인

레이아웃과 효과는 [hj0543.github.io](https://github.com/hj0543/hj0543.github.io) 템플릿을 바탕으로 했다.
React Bits 효과의 라이선스는 `src/components/react-bits/LICENSE.md`에 있다.
