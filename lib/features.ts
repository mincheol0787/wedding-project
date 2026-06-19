export const videoProductionFeature = {
  enabled: process.env.NEXT_PUBLIC_VIDEO_PRODUCTION_ENABLED === "true",
  disabledTitle: "식전영상 제작은 품질 재정비 중입니다",
  disabledMessage:
    "현재 영상 품질이 서비스 기준에 맞지 않아 제작 기능을 일시적으로 내렸습니다. 서버 렌더링 부하도 함께 차단해 청첩장 기능 안정성을 우선합니다."
} as const;
