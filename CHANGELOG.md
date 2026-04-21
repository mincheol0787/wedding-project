# Changelog

이 파일은 주요 수정사항과 배포 관련 변경을 날짜별로 기록합니다.

커밋 메시지 기반으로 갱신하려면 `npm run changelog:update`를 실행하세요.

## 2026-04-21
- 캘린더 일정 선택 후 제목, 날짜, 시간, 메모, 완료 상태를 수정할 수 있는 편집 패널을 추가했습니다.
- 캘린더 일정 삭제 기능을 soft delete 방식으로 추가했습니다.
- 캘린더 이전/다음 버튼이 섹션 내부에서 안정적으로 정렬되도록 헤더 레이아웃을 재구성했습니다.
- 모바일 청첩장 편집 화면의 본문과 미리보기 영역을 2-column 구조로 분리하고, 미리보기 패널이 본문을 덮지 않도록 수정했습니다.
- 작은 화면에서는 청첩장 미리보기를 접고 펼칠 수 있는 하단 패널 방식으로 변경했습니다.
- 캘린더 레이아웃을 풀폭 중심으로 개선하고 일정 목록/추가 흐름을 재배치했습니다.
- 일정 추가 및 완료 처리 버튼에 skeleton/fade 기반 로딩 UI를 적용했습니다.
- 청첩장 장소 검색 결과 선택 흐름을 개선하고 위도/경도 직접 노출을 제거했습니다.
- 공개 청첩장 지도 영역에 카카오 지도, 지도보기, 길찾기 버튼을 정리했습니다.
- 청첩장 미리보기 패널 위치 변경과 미리보기 섹션 순서 Drag & Drop을 개선했습니다.
- 공개 청첩장 라우트를 최신 DB 상태로 조회하도록 설정하고 slug 처리 안정성을 높였습니다.
- `NEXT_PUBLIC_APP_URL`을 공개 URL 기준 환경변수로 지원하도록 추가했습니다.
- 변경 이력을 확인할 수 있도록 `CHANGELOG.md`, 갱신 스크립트, 관리자 확인 페이지를 추가했습니다.
- Include traced Prisma files in Next deployment (8532d27)
- Include Prisma engine for Vercel runtime (2f3cc08)
- Configure Neon production database migration (df9666f)
- Make Vercel env validation build-safe (54cac13)
- Prepare Vercel deployment and restore missing routes (7576f9d)
- Merge remote-tracking branch 'origin/master' (55ea36b)
- 1차 수정 (d42716b)
- 1차 수정 (310ba40)

## 2026-04-20
- 프로젝트 최초 커밋 (4698de1)
- 프로젝트 최초 커밋 (3296389)
