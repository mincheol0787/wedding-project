# 식전영상 렌더링 입력 JSON

편집 화면은 `VideoRenderInput` 구조를 생성합니다. 이 JSON은 나중에 `RenderJob.input`에 저장하고, BullMQ worker가 Remotion props로 그대로 전달하는 것을 목표로 합니다.

## 구조

```ts
type VideoRenderInput = {
  version: 1;
  templateId: "classic-fade" | "modern-frame" | "film-letter";
  project: {
    id: string;
    title: string;
    groomName?: string;
    brideName?: string;
  };
  composition: {
    width: number;
    height: number;
    fps: number;
    durationMs: number;
  };
  assets: {
    images: Array<{
      id: string;
      src: string;
      fileName: string;
      alt?: string;
    }>;
    audio?: {
      id: string;
      src: string;
      fileName: string;
      volume: number;
    };
  };
  scenes: Array<{
    id: string;
    order: number;
    imageAssetId: string;
    startMs: number;
    durationMs: number;
    transition: {
      type: "fade";
      durationMs: number;
    };
    motion: {
      type: "zoom-in" | "zoom-out";
      scaleFrom: number;
      scaleTo: number;
    };
  }>;
  lyricSegments: Array<{
    id: string;
    order: number;
    text: string;
    startMs: number;
    endMs: number;
  }>;
};
```

## 확장 방향

- 템플릿 추가: `templateId` union과 `videoTemplates` 배열에 새 값을 추가합니다.
- 장면 효과 추가: `scene.transition.type`, `scene.motion.type`을 enum처럼 확장합니다.
- S3 연결: 편집 화면의 `previewUrl` 대신 업로드 완료된 `MediaAsset.url` 또는 signed URL을 `assets.images[].src`, `assets.audio.src`에 넣습니다.
- 렌더링 연결: `RenderJob.input`에 이 JSON을 저장하고 worker에서 `remotion render` 입력 props로 전달합니다.
