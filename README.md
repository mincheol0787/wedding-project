# Wedding Studio

예비부부를 위한 웨딩 SaaS입니다. 하나의 웨딩 프로젝트 안에서 식전영상과 모바일 청첩장을 템플릿 기반으로 제작합니다.

## 목표

- 비개발자도 쉽게 사용할 수 있는 직관적인 UI
- 웨딩 감성의 고급스러운 디자인
- 템플릿 기반 모바일 청첩장과 식전영상 제작
- 추후 유료화 가능한 확장 구조

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js
- S3 compatible storage
- Redis + BullMQ
- Remotion

## 폴더 구조

```text
app/                 Next.js App Router 라우트
components/          재사용 UI, 청첩장, 영상 편집 컴포넌트
docs/                제품/아키텍처/구현 계획 문서
lib/                 공통 유틸리티, Prisma client, 환경 변수
prisma/              Prisma schema와 마이그레이션
server/              서버 전용 서비스 로직
worker/              BullMQ worker와 queue 설정
remotion/            Remotion composition
```

## 시작하기

```bash
npm install
cp .env.example .env
npm run db:up
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.
MinIO 콘솔은 `http://localhost:9001`에서 확인할 수 있으며, 로컬 기본 계정은 `minioadmin` / `minioadmin`입니다.

Docker Desktop이 설치되어 있지 않다면 `npm run db:up`은 실행되지 않습니다. 이 경우 로컬 또는 원격 PostgreSQL과 Redis를 직접 실행한 뒤 `.env`의 `DATABASE_URL`, `REDIS_URL`을 해당 주소로 바꾸고 마이그레이션을 실행하세요.

## 현재 MVP 흐름

1. `/login`에서 이메일과 비밀번호로 가입합니다.
2. 로그인하면 `/dashboard`에서 내 프로젝트 목록을 볼 수 있습니다.
3. `/dashboard/projects/new`에서 새 웨딩 프로젝트를 생성합니다.
4. 프로젝트 생성 시 모바일 청첩장과 식전영상 편집 공간이 함께 생성됩니다.

## 주요 라우트

- `/`: 서비스 시작 화면
- `/login`: 로그인 화면
- `/dashboard`: 프로젝트 대시보드
- `/dashboard/projects/new`: 새 프로젝트 생성 화면
- `/i/[slug]`: 모바일 청첩장 공개 페이지
- `/admin`: 관리자 페이지 초안
- `/api/health`: 헬스 체크

## 렌더링 worker

Redis가 실행 중인 상태에서 worker를 시작합니다.

```bash
npm run worker:dev
```

MVP에서는 worker가 렌더링 job 수신 구조만 갖고 있습니다. 다음 단계에서 Remotion 렌더링, S3 업로드, `RenderJob` 상태 갱신을 연결합니다.

## 문서

- [제품 요구사항](./docs/product-requirements.md)
- [시스템 아키텍처](./docs/architecture.md)
- [MVP 범위와 구현 계획](./docs/implementation-plan.md)
- [식전영상 렌더링 입력 JSON](./docs/video-render-input.md)
