# Wedding Studio

예비부부를 위한 웨딩 프로젝트 SaaS입니다. 하나의 프로젝트 안에서 식전영상과 모바일 청첩장을 함께 준비할 수 있도록 설계했습니다.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js
- S3 compatible storage
- Redis + BullMQ
- Remotion

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

기본 로컬 주소는 `http://localhost:8090`입니다.

## Production on Vercel

Vercel에 배포할 때는 로컬 `.env`를 그대로 쓰지 말고 [.env.vercel.example](./.env.vercel.example) 값을 기준으로 Production Environment Variables를 등록하세요.

필수 URL 값:

```env
AUTH_URL="https://www.mcpage.kro.kr"
NEXTAUTH_URL="https://www.mcpage.kro.kr"
APP_PUBLIC_URL="https://www.mcpage.kro.kr"
```

중요한 점:

- `DATABASE_URL`은 Vercel에서 접근 가능한 PostgreSQL이어야 합니다.
- `S3_*` 값은 외부에서 접근 가능한 S3 compatible storage여야 합니다.
- `REDIS_URL`은 실제 비동기 렌더링을 쓸 때만 필요합니다.
- 커스텀 도메인을 Vercel 프로젝트에 연결하면 `VERCEL_PROJECT_PRODUCTION_URL`도 자동으로 제공됩니다.

## Main Routes

- `/`: 서비스 소개와 시작 화면
- `/login`: 로그인 / 회원가입
- `/dashboard`: 내 프로젝트 목록
- `/dashboard/projects/new`: 새 프로젝트 생성
- `/dashboard/projects/[projectId]`: 프로젝트 허브
- `/dashboard/projects/[projectId]/invitation`: 모바일 청첩장 편집
- `/dashboard/projects/[projectId]/video`: 식전영상 편집
- `/i/[slug]`: 공개 청첩장 페이지
- `/admin`: 관리자 페이지

## Notes

- Prisma Client는 `postinstall`에서 자동 생성됩니다.
- 장소 검색은 `KAKAO_REST_API_KEY`가 있으면 카카오 로컬 검색을 사용하고, 없으면 개발용 fallback 결과를 반환합니다.
- 공개 URL은 `APP_PUBLIC_URL`이 없더라도 Vercel 환경에서는 `VERCEL_PROJECT_PRODUCTION_URL` 또는 `VERCEL_URL`을 기준으로 자동 계산합니다.
