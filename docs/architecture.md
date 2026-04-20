# 시스템 아키텍처

## 제품 개요

Wedding Studio는 예비부부가 하나의 프로젝트 안에서 식전영상과 모바일 청첩장을 제작하는 SaaS입니다. MVP는 템플릿 기반 편집, 미디어 업로드, 모바일 청첩장 공개, RSVP/방명록 수집, 영상 렌더링 작업 큐를 중심으로 구성합니다.

## 전체 구성

- Next.js App Router: 사용자 대시보드, 편집 화면, 공개 청첩장 페이지, API Route 담당
- PostgreSQL + Prisma: 사용자, 프로젝트, 템플릿, RSVP, 방명록, 렌더링 작업 상태 저장
- Auth.js: 회원가입/로그인과 세션 관리
- S3 compatible storage: 사진, 음악, 렌더링 결과 mp4 저장
- Redis + BullMQ: 영상 렌더링 작업 큐와 상태 업데이트
- Remotion: 템플릿 기반 mp4 렌더링
- Worker: 큐에서 렌더링 작업을 가져와 Remotion 렌더링을 수행

## 데이터 흐름

1. 사용자가 로그인합니다.
2. 대시보드에서 `WeddingProject`를 생성합니다.
3. 프로젝트 생성 시 `VideoProject`와 `InvitationProject`가 함께 만들어집니다.
4. 사용자가 사진/음악을 업로드하면 `MediaAsset`이 생성되고 S3에 저장됩니다.
5. 모바일 청첩장 편집 데이터는 `InvitationProject`와 연결된 RSVP/방명록 모델에 저장됩니다.
6. 식전영상 편집 데이터는 `VideoScene`, `LyricSegment`, `VideoProject.config`에 저장됩니다.
7. 렌더링 요청 시 `RenderJob`이 생성되고 BullMQ에 job이 들어갑니다.
8. Worker가 Remotion을 실행하고 결과 mp4를 S3에 업로드한 뒤 `RenderJob`과 `MediaAsset`을 갱신합니다.

## 영상 렌더링 파이프라인

영상 렌더링은 웹 요청 안에서 직접 처리하지 않습니다. 렌더링은 CPU/메모리 사용량이 크고 수십 초 이상 걸릴 수 있으므로 비동기 작업으로 분리합니다.

### 단계

1. 편집 데이터 확정
   - 클라이언트 편집기는 장면 순서, 사진, 문구, 가사, 음악, 템플릿 옵션을 저장합니다.
   - 서버는 `VideoProject`, `VideoScene`, `LyricSegment`, `MediaAsset`을 조회해 렌더링 입력 JSON을 만듭니다.

2. 렌더링 요청
   - 서버 액션 또는 API Route가 `RenderJob`을 `QUEUED` 상태로 생성합니다.
   - BullMQ `video-render` 큐에 `renderJobId`를 넣습니다.

3. Worker 처리
   - Worker는 `RenderJob`을 `PROCESSING`으로 바꿉니다.
   - 필요한 이미지/음악 파일은 presigned URL 또는 내부 접근 URL로 Remotion에 전달합니다.
   - Remotion composition은 템플릿 ID와 입력 JSON을 바탕으로 프레임을 구성합니다.

4. 결과 저장
   - 렌더링된 mp4를 S3에 업로드합니다.
   - 업로드 결과를 `MediaAsset(type: VIDEO)`로 저장합니다.
   - `RenderJob.outputAssetId`, `status`, `finishedAt`을 갱신합니다.

5. 실패 처리
   - 예외 발생 시 `RenderJob.status`를 `FAILED`로 바꾸고 `errorMessage`를 저장합니다.
   - BullMQ 재시도 정책은 MVP에서는 1-2회로 제한하고, 이후 관리자 페이지에서 실패 내역을 확인합니다.

### MVP 렌더링 제약

- 16:9 1080p, 30fps만 지원
- 템플릿 1개부터 시작
- 이미지 기반 장면과 텍스트/가사 오버레이 우선
- 고급 트랜지션, 자동 비트 싱크, 자막 자동 생성은 후순위

## 모바일 청첩장 공개 페이지 구조

공개 페이지는 `/i/[slug]` 형태의 읽기 중심 페이지입니다. 로그인 없이 접근할 수 있으므로 공개 가능한 데이터만 조회해야 합니다.

### 조회 조건

- `InvitationProject.publicSlug`가 URL slug와 일치
- `status = PUBLISHED`
- `deletedAt = null`
- 연결된 `WeddingProject.deletedAt = null`

### 페이지 섹션

- Cover: 대표 사진, 커플 이름, 예식 날짜
- Greeting: 초대 문구
- Couple/Parents: 신랑, 신부, 혼주 정보
- Gallery: 공개 가능한 이미지 목록
- Venue/Map: 예식장명, 주소, 지도 좌표, 지도 앱 링크
- RSVP: 참석 여부, 참석 인원, 식사 여부, 연락처 수집
- Guestbook: 축하 메시지 작성 및 목록

### 쓰기 API

- RSVP 생성: rate limit, 개인정보 동의, 필수값 검증
- 방명록 작성: 비공개 여부, 비밀번호 해시, 숨김 처리 지원
- 관리자 삭제가 아니라 `isHidden` 또는 `deletedAt` 기반 soft delete 사용

## 서버와 클라이언트 역할 분리

- Server Components: 데이터 조회, 권한 검증, 공개 페이지 렌더링
- Client Components: 폼 입력, 편집기 인터랙션, 업로드 진행률, 타임라인 조작
- Server Actions/API Routes: 저장, 업로드 URL 발급, RSVP/방명록 작성, 렌더링 요청
- Worker: Remotion 렌더링과 S3 업로드

## 운영 고려사항

- 모든 핵심 모델은 `createdAt`, `updatedAt`, `deletedAt`을 갖습니다.
- 공개 URL은 `publicSlug`로 분리해 내부 ID 노출을 피합니다.
- 렌더링 상태는 DB를 기준으로 삼고 큐는 실행 수단으로만 사용합니다.
- 템플릿 설정은 `Template.config`와 프로젝트별 `config` JSON으로 확장합니다.
