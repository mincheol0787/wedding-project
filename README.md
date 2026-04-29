# MC Page Wedding SaaS

예비부부가 모바일 청첩장, 식전영상, 일정 관리를 한곳에서 준비할 수 있는 Next.js 기반 웨딩 제작 SaaS입니다.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL / Neon
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

Vercel에 배포할 때는 로컬 `.env`를 업로드하지 말고, [.env.vercel.example](./.env.vercel.example)을 기준으로 Production Environment Variables를 등록하세요. `.vercelignore`에서 `.env` 계열 파일은 배포 제외 처리합니다.

필수 URL 값:

```env
AUTH_URL="https://mcpage.kro.kr"
NEXTAUTH_URL="https://mcpage.kro.kr"
NEXT_PUBLIC_APP_URL="https://mcpage.kro.kr"
APP_PUBLIC_URL="https://mcpage.kro.kr"
```

중요 환경 변수:

- `DATABASE_URL`: Vercel에서 접근 가능한 PostgreSQL/Neon 연결 문자열
- `AUTH_SECRET`, `NEXTAUTH_SECRET`: 운영용 긴 랜덤 문자열
- `KAKAO_REST_API_KEY`: 장소 검색 API용 REST 키
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`: 브라우저 지도 표시용 JavaScript 키
- `S3_*`: 실제 이미지/음악/mp4 저장을 위한 S3 compatible storage
- `REDIS_URL`: 실제 비동기 영상 제작 worker를 운영할 때만 필요

## Video Production Worker

영상 제작 요청은 웹 요청 안에서 mp4를 직접 만들지 않습니다. 사용자가 `영상 제작 시작하기`를 누르면 `RenderJob`만 빠르게 저장하고, Redis/BullMQ worker가 별도 프로세스에서 Remotion 렌더링을 처리합니다.

로컬에서 실제 제작 worker를 함께 실행하려면 터미널을 하나 더 열고 실행하세요.

```bash
npm run worker:dev
```

`REDIS_URL`이 없거나 Redis 연결이 느린 경우에도 웹 요청은 막히지 않고 `제작 대기 중` 상태로 남습니다. worker가 시작되면 DB에 남아 있던 대기 작업을 다시 큐에 등록합니다.

Vercel 서버리스 런타임은 장시간 worker를 상시 실행하는 구조가 아니므로, 실제 SaaS 운영에서는 웹 앱과 영상 제작 worker를 분리해야 합니다. 권장 구성은 `Vercel 웹 앱 + Upstash Redis + 별도 worker 서버(Railway/Fly.io/Render/ECS 등) + S3 storage`입니다.

## Main Routes

- `/`: 서비스 랜딩 페이지
- `/login`: 로그인 / 회원가입
- `/dashboard`: 내 작업 목록
- `/dashboard/projects/new`: 새 청첩장 만들기
- `/dashboard/projects/[projectId]`: 작업 관리 허브
- `/dashboard/projects/[projectId]/invitation`: 모바일 청첩장 내용 수정
- `/dashboard/projects/[projectId]/video`: 식전영상 제작
- `/i/[slug]`: 공개 청첩장 페이지
- `/admin`: 관리자 페이지

## Notes

- Prisma Client는 `postinstall`에서 자동 생성합니다.
- 공개 URL은 `APP_PUBLIC_URL`이 없더라도 Vercel 환경에서는 `VERCEL_PROJECT_PRODUCTION_URL` 또는 `VERCEL_URL`을 기준으로 계산합니다.
- 지도 표시에는 Kakao JavaScript SDK 도메인 등록이 필요합니다.
- 렌더링 결과를 운영에서 안정적으로 보관하려면 `public/renders` 대신 S3 compatible storage로 전환해야 합니다.
