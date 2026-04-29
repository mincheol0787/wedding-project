# Video Worker Operations

## Why It Is Separate

영상 제작은 CPU, 메모리, 파일 I/O를 많이 사용합니다. 웹 요청 안에서 Remotion 렌더링을 직접 실행하면 사용자가 버튼을 누르는 동안 웹 서버가 붙잡히고, 서버리스 환경에서는 타임아웃이나 전체 서비스 지연으로 이어질 수 있습니다.

이 프로젝트는 다음 원칙으로 분리합니다.

- 웹 앱은 `RenderJob` 생성까지만 책임집니다.
- Redis/BullMQ queue 등록은 900ms 안에 끝나지 않으면 사용자 요청을 더 기다리게 하지 않습니다.
- Redis가 없거나 일시적으로 실패해도 작업은 `제작 대기 중`으로 남습니다.
- worker가 시작되면 DB의 `QUEUED` 작업 중 `queueJobId`가 없는 항목을 다시 BullMQ에 등록합니다.
- 실제 mp4 생성은 worker 프로세스에서만 실행합니다.

## Local Development

1. Redis를 실행합니다.
2. `.env`에 `REDIS_URL`을 설정합니다.
3. 웹 서버와 worker를 각각 실행합니다.

```bash
npm run dev
npm run worker:dev
```

## Production Recommendation

Vercel은 웹 앱 배포에 사용하고, Remotion worker는 별도 런타임에 배포하는 구성이 안전합니다.

권장 구성:

- Web: Vercel
- Database: Neon Postgres
- Queue: Upstash Redis
- Worker: Railway, Fly.io, Render, ECS 등 장시간 Node.js 프로세스를 실행할 수 있는 곳
- Storage: S3 compatible storage

## Current MVP Behavior

- `REDIS_URL`이 없으면 영상 제작 요청은 저장만 하고 즉시 응답합니다.
- 상태 UI에는 `제작 대기 중`으로 표시됩니다.
- worker가 연결되면 대기 작업을 다시 큐에 등록해 이어서 처리합니다.
- SMS/카카오 알림은 아직 발송하지 않고, 서비스 내 상태 화면에서 진행 상황을 확인합니다.
