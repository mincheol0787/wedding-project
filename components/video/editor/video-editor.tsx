"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react";
import { RenderRequestPanel } from "@/components/video/editor/render-request-panel";
import {
  buildVideoRenderInput,
  createId,
  createInitialVideoEditorState,
  resolveLyricTemplate,
  videoEditorReducer,
  type EditorAudioAsset,
  type EditorImageAsset,
  type VideoEditorState
} from "@/lib/video/editor-state";
import {
  videoMusicPresets,
  type VideoMusicPresetId,
  type VideoSceneRoleId,
  type VideoSubtitleColorThemeId,
  type VideoSubtitlePositionId,
  type VideoSubtitleSizeId,
  type VideoSubtitleStyleId
} from "@/lib/video/render-input";

type VideoEditorProps = {
  projectId: string;
  project: VideoEditorState["project"];
  onRenderRequested?: () => void;
};

type VideoStepId = "music" | "upload" | "arrange" | "lyrics";

type VideoStep = {
  description: string;
  id: VideoStepId;
  label: string;
};

type VideoQualityItem = {
  done: boolean;
  help: string;
  label: string;
  step: VideoStepId;
};

const videoSteps: VideoStep[] = [
  {
    id: "music",
    label: "노래 선택",
    description: "영상 분위기와 필요한 사진 수를 먼저 정해요."
  },
  {
    id: "upload",
    label: "사진 업로드",
    description: "필요한 수만큼 사진을 채우고 순서를 확인해요."
  },
  {
    id: "arrange",
    label: "사진 설정",
    description: "구간별 사진과 움직임을 영상 흐름에 맞게 다듬어요."
  },
  {
    id: "lyrics",
    label: "가사 수정",
    description: "문구와 자막 스타일을 완성도 있게 정리해요."
  }
];

const subtitleStyleOptions: Array<{
  id: VideoSubtitleStyleId;
  label: string;
  description: string;
}> = [
  {
    id: "kpop-bright",
    label: "밝고 설레는 자막",
    description: "발랄하고 환한 톤으로 첫 시작 장면에 잘 어울려요."
  },
  {
    id: "kpop-deep",
    label: "감성적인 자막",
    description: "차분하고 깊은 무드로 사랑의 여운을 길게 남겨줘요."
  },
  {
    id: "pop-classic",
    label: "클래식한 2줄 자막",
    description: "영문과 번역을 함께 쓰는 로맨틱한 분위기에 잘 맞아요."
  }
];

const subtitleColorThemeOptions: Array<{
  id: VideoSubtitleColorThemeId;
  label: string;
  preview: string;
}> = [
  { id: "peach-glow", label: "피치 글로우", preview: "linear-gradient(135deg,#ffe7de,#ffd5b8)" },
  { id: "rose-gold", label: "로즈 골드", preview: "linear-gradient(135deg,#f5d3dd,#d9b1a3)" },
  { id: "ivory-light", label: "아이보리 라이트", preview: "linear-gradient(135deg,#fff7ea,#fff1d4)" }
];

const subtitlePositionOptions: Array<{
  id: VideoSubtitlePositionId;
  label: string;
}> = [
  { id: "center", label: "가운데" },
  { id: "bottom", label: "하단" }
];

const subtitleSizeOptions: Array<{
  id: VideoSubtitleSizeId;
  label: string;
}> = [
  { id: "sm", label: "작게" },
  { id: "md", label: "기본" },
  { id: "lg", label: "크게" }
];

const sceneRoleOptions: Array<{
  id: VideoSceneRoleId;
  label: string;
  description: string;
}> = [
  {
    id: "opening",
    label: "오프닝",
    description: "첫 장면에서 두 사람의 분위기를 잡아줘요."
  },
  {
    id: "couple",
    label: "두 사람",
    description: "함께 있는 사진으로 몰입감을 만들어요."
  },
  {
    id: "detail",
    label: "디테일",
    description: "손, 꽃, 반지, 공간처럼 감성 컷을 넣어요."
  },
  {
    id: "family",
    label: "가족/친구",
    description: "하객이 더 따뜻하게 느끼는 관계 컷이에요."
  },
  {
    id: "ending",
    label: "엔딩",
    description: "초대 문구나 마지막 인사에 어울리는 컷이에요."
  }
];

const subtitleThemeClassMap: Record<
  VideoSubtitleColorThemeId,
  { badge: string; panel: string; text: string; translation: string }
> = {
  "peach-glow": {
    panel: "border-white/45 bg-[linear-gradient(135deg,rgba(255,247,240,0.38),rgba(255,226,204,0.18))]",
    text: "text-[#fff7f1]",
    translation: "text-white/82",
    badge: "bg-white/20 text-white"
  },
  "rose-gold": {
    panel: "border-white/35 bg-[linear-gradient(135deg,rgba(245,211,221,0.28),rgba(201,168,156,0.16))]",
    text: "text-[#fff4f6]",
    translation: "text-[#f7e3e8]",
    badge: "bg-white/18 text-[#fff6f7]"
  },
  "ivory-light": {
    panel: "border-white/50 bg-[linear-gradient(135deg,rgba(255,250,238,0.34),rgba(255,244,212,0.16))]",
    text: "text-[#fffaf2]",
    translation: "text-[#fff0d6]",
    badge: "bg-white/18 text-[#fffdf8]"
  }
};

const placeholderTokens = [
  { label: "신랑 이름", value: "{신랑이름}" },
  { label: "신부 이름", value: "{신부이름}" },
  { label: "예식 날짜", value: "{날짜}" }
] as const;

export function VideoEditor({ projectId, project, onRenderRequested }: VideoEditorProps) {
  const [state, dispatch] = useReducer(videoEditorReducer, project, createInitialVideoEditorState);
  const [currentStep, setCurrentStep] = useState<VideoStepId>("music");
  const [activeSceneId, setActiveSceneId] = useState<string>();
  const objectUrlsRef = useRef<string[]>([]);

  const renderInput = useMemo(() => buildVideoRenderInput(state), [state]);
  const selectedPreset = useMemo(
    () => videoMusicPresets.find((preset) => preset.id === state.musicPreset?.id),
    [state.musicPreset?.id]
  );
  const requiredPhotoCount = selectedPreset?.requiredPhotoCount ?? 10;
  const visibleScenes = state.scenes.slice(0, Math.max(requiredPhotoCount, state.scenes.length));
  const activeScene = visibleScenes.find((scene) => scene.id === activeSceneId) ?? visibleScenes[0];
  const activeImage = activeScene
    ? state.images.find((image) => image.id === activeScene.imageAssetId)
    : undefined;
  const selectedSubtitleStyle =
    state.lyricSegments.find((segment) => segment.style)?.style ??
    state.musicPreset?.subtitleStyle ??
    "kpop-bright";
  const firstFilledLyric = state.lyricSegments.find((segment) => segment.text.trim().length > 0);

  const stepCompletion: Record<VideoStepId, boolean> = {
    music: Boolean(state.musicPreset),
    upload: state.images.length >= requiredPhotoCount,
    arrange:
      state.scenes.length >= requiredPhotoCount &&
      state.scenes.slice(0, requiredPhotoCount).every((scene) => scene.durationMs > 0),
    lyrics: renderInput.lyricSegments.length > 0
  };
  const qualityItems = getVideoQualityItems({
    durationMs: renderInput.composition.durationMs,
    imageCount: state.images.length,
    lyricCount: renderInput.lyricSegments.length,
    requiredPhotoCount,
    roles: state.scenes.map((scene) => scene.role),
    stepCompletion
  });
  const qualityScore = Math.round((qualityItems.filter((item) => item.done).length / qualityItems.length) * 100);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function createImageAsset(file: File): Promise<EditorImageAsset> {
    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);

    return {
      id: createId("image"),
      fileName: file.name,
      previewUrl,
      renderUrl: await readFileAsDataUrl(file),
      alt: file.name
    };
  }

  async function handleImageUpload(files: FileList | File[] | null) {
    if (!files?.length) {
      return;
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const images = await Promise.all(imageFiles.map((file) => createImageAsset(file)));

    if (!images.length) {
      return;
    }

    dispatch({
      type: "add-images",
      images
    });
    setActiveSceneId(undefined);
  }

  function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleImageUpload(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleImageUpload(event.dataTransfer.files);
  }

  async function handleSceneImageReplace(imageAssetId: string, files: FileList | null) {
    const file = files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    dispatch({
      type: "replace-image",
      image: await createImageAsset(file),
      imageAssetId
    });
  }

  async function handleAudioUpload(files: FileList | null) {
    const file = files?.[0];

    if (!file || !file.type.startsWith("audio/")) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);

    const audio: EditorAudioAsset = {
      id: createId("audio"),
      fileName: file.name,
      previewUrl,
      renderUrl: await readFileAsDataUrl(file),
      volume: 0.8
    };

    dispatch({
      type: "set-audio",
      audio
    });
  }

  function selectMusicPreset(presetId: VideoMusicPresetId) {
    dispatch({
      type: "apply-music-preset",
      presetId
    });
    setCurrentStep("upload");
  }

  function applySampleFlow() {
    dispatch({ type: "apply-sample-video" });
    setCurrentStep("arrange");
    setActiveSceneId("spring-scene-1");
  }

  function moveStep(direction: "next" | "previous") {
    const currentIndex = videoSteps.findIndex((step) => step.id === currentStep);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    const nextStep = videoSteps[nextIndex];

    if (!nextStep) {
      return;
    }

    setCurrentStep(nextStep.id);
  }

  const currentStepReady = stepCompletion[currentStep];
  const subtitlePreviewText = firstFilledLyric
    ? resolveLyricTemplate(firstFilledLyric.text, state.project)
    : "";
  const subtitlePreviewTranslation = firstFilledLyric?.translation
    ? resolveLyricTemplate(firstFilledLyric.translation, state.project)
    : undefined;

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Wedding Video Maker</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">식전영상 만들기 순서</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              노래 분위기를 고르고, 필요한 사진을 채운 뒤, 영상 흐름과 자막을 차례대로 다듬을 수 있게 구성했어요.
            </p>
          </div>
          <button
            className="w-fit rounded-md border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-medium text-sage"
            onClick={applySampleFlow}
            type="button"
          >
            1분 샘플 흐름 불러오기
          </button>
        </div>

        <StepProgress
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          stepCompletion={stepCompletion}
          steps={videoSteps}
        />
      </section>

      <VideoDirectorBoard
        currentStep={currentStep}
        durationMs={renderInput.composition.durationMs}
        imageCount={state.images.length}
        onApplySampleFlow={applySampleFlow}
        onStepChange={setCurrentStep}
        qualityItems={qualityItems}
        qualityScore={qualityScore}
        requiredPhotoCount={requiredPhotoCount}
        sceneCount={state.scenes.length}
        selectedPreset={selectedPreset}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <section className="min-w-0">
          {currentStep === "music" ? (
            <MusicStep
              audio={state.audio}
              onAudioChange={handleAudioUpload}
              onAudioClear={() => dispatch({ type: "clear-audio" })}
              onSelectPreset={selectMusicPreset}
              selectedPresetId={state.musicPreset?.id}
            />
          ) : null}

          {currentStep === "upload" ? (
            <UploadStep
              images={state.images}
              onDrop={handleDrop}
              onImageChange={handleImageInputChange}
              onMoveScene={(sceneId, direction) =>
                dispatch({
                  type: "move-scene",
                  direction,
                  sceneId
                })
              }
              onRemoveImage={(imageAssetId) =>
                dispatch({
                  type: "remove-image",
                  imageAssetId
                })
              }
              requiredPhotoCount={requiredPhotoCount}
              scenes={state.scenes}
            />
          ) : null}

          {currentStep === "arrange" ? (
            <ArrangeStep
              activeSceneId={activeScene?.id}
              images={state.images}
              onReplaceImage={handleSceneImageReplace}
              onSceneSelect={setActiveSceneId}
              onUpdateScene={(sceneId, patch) =>
                dispatch({
                  type: "update-scene",
                  patch,
                  sceneId
                })
              }
              scenes={visibleScenes}
            />
          ) : null}

          {currentStep === "lyrics" ? (
            <LyricsStep
              lyricSegments={state.lyricSegments}
              onAddLyric={() => dispatch({ type: "add-lyric" })}
              onApplyStyle={(style) =>
                dispatch({
                  type: "apply-lyric-style",
                  style
                })
              }
              onRefreshPresetLyrics={() => {
                if (!state.musicPreset) {
                  return;
                }

                dispatch({
                  type: "apply-music-preset",
                  presetId: state.musicPreset.id as VideoMusicPresetId
                });
              }}
              onRemoveLyric={(lyricId) =>
                dispatch({
                  type: "remove-lyric",
                  lyricId
                })
              }
              onUpdateLyric={(lyricId, patch) =>
                dispatch({
                  type: "update-lyric",
                  lyricId,
                  patch
                })
              }
              onUpdateSubtitleAppearance={(patch) =>
                dispatch({
                  type: "update-subtitle-appearance",
                  patch
                })
              }
              project={state.project}
              selectedPresetLabel={
                state.musicPreset ? `${state.musicPreset.artist} - ${state.musicPreset.title}` : undefined
              }
              selectedStyle={selectedSubtitleStyle}
              subtitleAppearance={state.subtitleAppearance}
            />
          ) : null}

          <StepNavigation
            currentStep={currentStep}
            currentStepReady={currentStepReady}
            onMove={moveStep}
          />
        </section>

        <aside className="grid gap-4 xl:sticky xl:top-24">
          <VideoSummaryPanel
            activeImage={activeImage}
            activeScene={activeScene}
            completedStepCount={Object.values(stepCompletion).filter(Boolean).length}
            renderInputDurationMs={renderInput.composition.durationMs}
            requiredPhotoCount={requiredPhotoCount}
            selectedPreset={selectedPreset}
            state={state}
            subtitleAppearance={state.subtitleAppearance}
            subtitlePreviewText={subtitlePreviewText}
            subtitlePreviewTranslation={subtitlePreviewTranslation}
            subtitleStyle={selectedSubtitleStyle}
            totalStepCount={videoSteps.length}
          />
          <RenderRequestPanel
            estimatedTimeLabel={getEstimatedProductionTimeLabel(state.images.length)}
            onRequested={onRenderRequested}
            projectId={projectId}
            renderInput={renderInput}
            requiredPhotoCount={requiredPhotoCount}
          />
        </aside>
      </div>
    </div>
  );
}

function VideoDirectorBoard({
  currentStep,
  durationMs,
  imageCount,
  onApplySampleFlow,
  onStepChange,
  qualityItems,
  qualityScore,
  requiredPhotoCount,
  sceneCount,
  selectedPreset
}: {
  currentStep: VideoStepId;
  durationMs: number;
  imageCount: number;
  onApplySampleFlow: () => void;
  onStepChange: (step: VideoStepId) => void;
  qualityItems: VideoQualityItem[];
  qualityScore: number;
  requiredPhotoCount: number;
  sceneCount: number;
  selectedPreset?: (typeof videoMusicPresets)[number];
}) {
  const nextItem = qualityItems.find((item) => !item.done);

  return (
    <section className="overflow-hidden rounded-md border border-ink/10 bg-[linear-gradient(135deg,#fffaf5,#f7f0ea_54%,#eef3ef)] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Version 2
            </span>
            <span className="rounded-full border border-rose/20 bg-white/75 px-3 py-1 text-xs font-medium text-rose">
              하객 집중형 콘티 보드
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-ink">사진을 올리는 화면이 아니라, 한 편의 흐름을 만드는 화면이에요.</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/62">
            식전영상은 예쁜 사진을 붙이는 것보다 첫 장면, 두 사람의 표정, 디테일 컷, 가족/친구 컷, 마지막 인사가
            자연스럽게 이어질 때 집중도가 올라가요. 아래 단계는 그 흐름을 기준으로 정리됩니다.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <VideoMetric label="필요 사진" value={`${imageCount}/${requiredPhotoCount}장`} tone={imageCount >= requiredPhotoCount ? "sage" : "rose"} />
            <VideoMetric label="구간 수" value={`${sceneCount}개`} tone={sceneCount > 0 ? "sage" : "neutral"} />
            <VideoMetric label="예상 길이" value={formatTime(durationMs)} tone={durationMs >= 45_000 ? "sage" : "neutral"} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {videoSteps.map((step) => (
              <button
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  currentStep === step.id
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-white/70 text-ink hover:border-ink/25"
                }`}
                key={step.id}
                onClick={() => onStepChange(step.id)}
                type="button"
              >
                {step.label}
              </button>
            ))}
            <button
              className="rounded-full border border-sage/30 bg-sage/10 px-4 py-2 text-sm font-medium text-sage transition hover:border-sage/50"
              onClick={onApplySampleFlow}
              type="button"
            >
              샘플 콘티 적용
            </button>
          </div>
        </div>

        <div className="border-t border-ink/10 bg-white/72 p-5 md:p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">Production Readiness</p>
              <h4 className="mt-2 text-lg font-semibold text-ink">제작 완성도 {qualityScore}%</h4>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full border border-ink/10 bg-[#fbfcfb] text-lg font-semibold text-ink">
              {qualityScore}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-porcelain">
            <div className="h-full bg-rose transition-all" style={{ width: `${qualityScore}%` }} />
          </div>

          <div className="mt-4 grid gap-2">
            {qualityItems.map((item) => (
              <button
                className="flex items-start justify-between gap-3 rounded-md border border-ink/10 bg-white px-3 py-3 text-left transition hover:border-ink/20"
                key={item.label}
                onClick={() => onStepChange(item.step)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-medium text-ink">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-ink/50">{item.help}</span>
                </span>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                    item.done ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"
                  }`}
                >
                  {item.done ? "완료" : "필요"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-md border border-ink/10 bg-[#fcfbf9] p-3 text-sm leading-6 text-ink/60">
            {selectedPreset ? (
              <>
                <span className="font-medium text-ink">{selectedPreset.artist} - {selectedPreset.title}</span> 흐름으로 준비 중이에요.
                {nextItem ? ` 다음은 '${nextItem.label}'을 확인하면 좋아요.` : " 바로 영상 제작을 시작해도 좋아요."}
              </>
            ) : (
              "먼저 노래 분위기를 고르면 필요한 사진 수와 자막 톤이 자동으로 맞춰져요."
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoMetric({
  label,
  tone,
  value
}: {
  label: string;
  tone: "neutral" | "rose" | "sage";
  value: string;
}) {
  const toneClass =
    tone === "sage"
      ? "border-sage/20 bg-sage/10 text-sage"
      : tone === "rose"
        ? "border-rose/20 bg-rose/10 text-rose"
        : "border-ink/10 bg-white/70 text-ink";

  return (
    <div className={`rounded-md border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function StepProgress({
  currentStep,
  onStepChange,
  stepCompletion,
  steps
}: {
  currentStep: VideoStepId;
  onStepChange: (step: VideoStepId) => void;
  stepCompletion: Record<VideoStepId, boolean>;
  steps: VideoStep[];
}) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isDone = stepCompletion[step.id];
        const canOpen = index === 0 || steps.slice(0, index).every((item) => stepCompletion[item.id]);

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            className={`rounded-md border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
              isActive
                ? "border-ink bg-ink text-white shadow-[0_18px_44px_rgba(36,36,36,0.14)]"
                : isDone
                  ? "border-sage/20 bg-sage/10 text-ink hover:border-sage/40"
                  : "border-ink/10 bg-[#fbfcfb] text-ink hover:border-ink/25"
            }`}
            disabled={!canOpen}
            key={step.id}
            onClick={() => onStepChange(step.id)}
            type="button"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">Step {index + 1}</span>
            <span className="mt-2 block text-lg font-semibold">{step.label}</span>
            <span className="mt-2 block text-sm leading-6 opacity-70">{step.description}</span>
            <span
              className={`mt-4 inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                isActive
                  ? "bg-white/15 text-white"
                  : isDone
                    ? "bg-sage/10 text-sage"
                    : "bg-ink/5 text-ink/45"
              }`}
            >
              {isActive ? "진행 중" : isDone ? "완료" : "준비 전"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MusicStep({
  audio,
  onAudioChange,
  onAudioClear,
  onSelectPreset,
  selectedPresetId
}: {
  audio?: EditorAudioAsset;
  onAudioChange: (files: FileList | null) => void;
  onAudioClear: () => void;
  onSelectPreset: (presetId: VideoMusicPresetId) => void;
  selectedPresetId?: VideoMusicPresetId;
}) {
  return (
    <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Step 1</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">노래와 영상 분위기를 골라주세요</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          실제 상용 음원을 직접 제공하지는 않지만, 분위기와 구성에 맞춘 샘플 흐름으로 어떤 느낌의 영상을 만들지 먼저
          정할 수 있어요.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {videoMusicPresets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;

          return (
            <button
              aria-pressed={isSelected}
              className={`rounded-md border p-5 text-left transition ${
                isSelected
                  ? "border-rose bg-rose/5 shadow-[0_16px_44px_rgba(179,91,99,0.12)]"
                  : "border-ink/10 bg-[#fbfcfb] hover:border-ink/30 hover:bg-white"
              }`}
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              type="button"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rose">
                {preset.category === "K_POP" ? "K-pop sample" : "Pop sample"}
              </span>
              <span className="mt-3 block text-xl font-semibold text-ink">
                {preset.artist} - {preset.title}
              </span>
              <span className="mt-3 block text-sm leading-6 text-ink/60">{preset.tone}</span>
              <span className="mt-4 grid gap-2 text-sm text-ink/65">
                <span>이 영상은 {preset.requiredPhotoCount}장의 사진이 필요해요.</span>
                <span>약 {preset.durationSeconds}초 길이예요.</span>
                <span>{preset.mood}</span>
              </span>
              <span
                className={`mt-5 inline-flex rounded-md px-3 py-2 text-sm font-medium ${
                  isSelected ? "bg-ink text-white" : "bg-white text-ink"
                }`}
              >
                {isSelected ? "선택됨" : "이 분위기 선택"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-sage/20 bg-sage/10 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-ink">보유한 음악 파일 연결</p>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              샘플 카드는 분위기와 자막 예시를 위한 장치예요. 원한다면 직접 가지고 있는 음원 파일을 연결하는 구조로
              확장할 수 있게 준비해두었습니다.
            </p>
          </div>
          <label className="inline-flex w-fit cursor-pointer rounded-md bg-sage px-5 py-3 text-sm font-medium text-white">
            음악 선택
            <input
              accept="audio/*"
              className="sr-only"
              onChange={(event) => {
                onAudioChange(event.target.files);
                event.target.value = "";
              }}
              type="file"
            />
          </label>
        </div>

        {audio ? (
          <div className="mt-4 rounded-md border border-white/70 bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{audio.fileName}</p>
                <p className="mt-1 text-xs text-ink/50">볼륨 {Math.round(audio.volume * 100)}%</p>
              </div>
              <button
                className="w-fit rounded-md border border-rose/40 px-3 py-2 text-sm text-rose"
                onClick={onAudioClear}
                type="button"
              >
                음악 제거
              </button>
            </div>
            <audio className="mt-4 w-full" controls src={audio.previewUrl} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function UploadStep({
  images,
  onDrop,
  onImageChange,
  onMoveScene,
  onRemoveImage,
  requiredPhotoCount,
  scenes
}: {
  images: EditorImageAsset[];
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMoveScene: (sceneId: string, direction: "up" | "down") => void;
  onRemoveImage: (imageAssetId: string) => void;
  requiredPhotoCount: number;
  scenes: VideoEditorState["scenes"];
}) {
  const remainingCount = Math.max(0, requiredPhotoCount - images.length);

  return (
    <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Step 2</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">사진을 업로드해주세요</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            필요한 사진 수를 채워야 다음 단계로 넘어갈 수 있어요. 업로드한 순서가 영상의 기본 흐름이 됩니다.
          </p>
        </div>
        <div className="rounded-md bg-porcelain px-4 py-3 text-sm font-medium text-ink">
          {images.length}/{requiredPhotoCount}장 업로드
        </div>
      </div>

      <label
        className="grid min-h-56 cursor-pointer place-items-center rounded-md border border-dashed border-ink/20 bg-[#fbfcfb] p-8 text-center transition hover:border-rose/45 hover:bg-rose/5"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <span>
          <span className="block text-lg font-semibold text-ink">사진을 끌어다 놓거나 선택해주세요</span>
          <span className="mt-2 block text-sm leading-6 text-ink/55">
            {remainingCount > 0
              ? `다음 단계로 가려면 ${remainingCount}장이 더 필요해요.`
              : "필요한 사진 수를 모두 채웠어요. 순서를 확인해주세요."}
          </span>
          <span className="mt-5 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-medium text-white">
            사진 선택
          </span>
        </span>
        <input accept="image/*" className="sr-only" multiple onChange={onImageChange} type="file" />
      </label>

      {scenes.length > 0 ? (
        <div className="grid gap-3">
          {scenes.map((scene, index) => {
            const image = images.find((item) => item.id === scene.imageAssetId);

            if (!image) {
              return null;
            }

            return (
              <article
                className="grid gap-4 rounded-md border border-ink/10 bg-porcelain/70 p-3 md:grid-cols-[112px_minmax(0,1fr)_auto]"
                key={scene.id}
              >
                <div className="relative aspect-video overflow-hidden rounded-md bg-ink/5">
                  <Image
                    alt={image.alt ?? image.fileName}
                    className="object-cover"
                    fill
                    src={image.previewUrl}
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose">사진 {index + 1}</p>
                  <p className="mt-1 break-all text-sm font-medium text-ink">{image.fileName}</p>
                  <p className="mt-2 text-xs text-ink/50">기본 길이 {Math.round(scene.durationMs / 1000)}초</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => onMoveScene(scene.id, "up")}
                    type="button"
                  >
                    앞으로
                  </button>
                  <button
                    className="rounded-md border border-ink/15 px-3 py-2 text-sm disabled:opacity-40"
                    disabled={index === scenes.length - 1}
                    onClick={() => onMoveScene(scene.id, "down")}
                    type="button"
                  >
                    뒤로
                  </button>
                  <button
                    className="rounded-md border border-rose/40 px-3 py-2 text-sm text-rose"
                    onClick={() => onRemoveImage(image.id)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function ArrangeStep({
  activeSceneId,
  images,
  onReplaceImage,
  onSceneSelect,
  onUpdateScene,
  scenes
}: {
  activeSceneId?: string;
  images: EditorImageAsset[];
  onReplaceImage: (imageAssetId: string, files: FileList | null) => void;
  onSceneSelect: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, patch: Partial<VideoEditorState["scenes"][number]>) => void;
  scenes: VideoEditorState["scenes"];
}) {
  if (scenes.length === 0) {
    return (
      <section className="rounded-md border border-dashed border-ink/20 bg-white p-8 text-center">
        <p className="font-medium text-ink">먼저 사진을 업로드해주세요.</p>
        <p className="mt-2 text-sm text-ink/55">사진이 있어야 영상 흐름을 맞출 수 있어요.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Step 3</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">사진 흐름과 순서를 맞춰주세요</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          구간을 선택하면 오른쪽 미리보기에도 같은 사진이 보여요. 각 구간에서 사진을 교체하거나 움직임을 바꿀 수
          있어요.
        </p>
      </div>

      <div className="grid gap-3">
        {scenes.map((scene, index) => {
          const image = images.find((item) => item.id === scene.imageAssetId);
          const startMs = getSceneStartMs(scenes, index);
          const endMs = startMs + scene.durationMs;
          const isActive = activeSceneId === scene.id;

          if (!image) {
            return null;
          }

          return (
            <article
              className={`grid gap-4 rounded-md border p-4 transition md:grid-cols-[128px_minmax(0,1fr)] ${
                isActive ? "border-rose bg-rose/5" : "border-ink/10 bg-porcelain/60"
              }`}
              key={scene.id}
            >
              <button
                className="relative aspect-video overflow-hidden rounded-md bg-ink/5 text-left"
                onClick={() => onSceneSelect(scene.id)}
                type="button"
              >
                <Image
                  alt={image.alt ?? image.fileName}
                  className="object-cover"
                  fill
                  src={image.previewUrl}
                  unoptimized
                />
              </button>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_116px_142px_142px_112px] lg:items-end">
                <button className="text-left" onClick={() => onSceneSelect(scene.id)} type="button">
                  <p className="text-xs font-semibold text-rose">구간 {index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {formatTime(startMs)} - {formatTime(endMs)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-sage">{getSceneRoleLabel(scene.role)}</p>
                  <p className="mt-2 break-all text-xs text-ink/50">{image.fileName}</p>
                </button>

                <label className="grid gap-2 text-sm font-medium text-ink">
                  길이(초)
                  <input
                    className="rounded-md border border-ink/15 px-3 py-2"
                    min={1}
                    onChange={(event) =>
                      onUpdateScene(scene.id, {
                        durationMs: Math.max(1000, Number(event.target.value) * 1000)
                      })
                    }
                    type="number"
                    value={Math.round(scene.durationMs / 1000)}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-ink">
                  사진 움직임
                  <select
                    className="rounded-md border border-ink/15 px-3 py-2"
                    onChange={(event) =>
                      onUpdateScene(scene.id, {
                        motion: event.target.value as "zoom-in" | "zoom-out"
                      })
                    }
                    value={scene.motion}
                  >
                    <option value="zoom-in">천천히 확대</option>
                    <option value="zoom-out">천천히 멀어짐</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-ink">
                  장면 역할
                  <select
                    className="rounded-md border border-ink/15 px-3 py-2"
                    onChange={(event) =>
                      onUpdateScene(scene.id, {
                        role: event.target.value as VideoSceneRoleId
                      })
                    }
                    value={scene.role}
                  >
                    {sceneRoleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-flex h-fit cursor-pointer justify-center rounded-md border border-ink/15 px-3 py-2 text-sm font-medium text-ink">
                  사진 교체
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      onReplaceImage(image.id, event.target.files);
                      event.target.value = "";
                    }}
                    type="file"
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LyricsStep({
  lyricSegments,
  onAddLyric,
  onApplyStyle,
  onRefreshPresetLyrics,
  onRemoveLyric,
  onUpdateLyric,
  onUpdateSubtitleAppearance,
  project,
  selectedPresetLabel,
  selectedStyle,
  subtitleAppearance
}: {
  lyricSegments: VideoEditorState["lyricSegments"];
  onAddLyric: () => void;
  onApplyStyle: (style: VideoSubtitleStyleId) => void;
  onRefreshPresetLyrics: () => void;
  onRemoveLyric: (lyricId: string) => void;
  onUpdateLyric: (lyricId: string, patch: Partial<VideoEditorState["lyricSegments"][number]>) => void;
  onUpdateSubtitleAppearance: (patch: Partial<VideoEditorState["subtitleAppearance"]>) => void;
  project: VideoEditorState["project"];
  selectedPresetLabel?: string;
  selectedStyle: VideoSubtitleStyleId;
  subtitleAppearance: VideoEditorState["subtitleAppearance"];
}) {
  return (
    <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Step 4</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">자막과 문구를 다듬어주세요</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            전체 가사를 처음부터 다시 쓸 필요는 없어요. 필요한 부분만 바꾸면 바로 미리보기에 반영되도록
            정리해두었습니다.
          </p>
        </div>
        {selectedPresetLabel ? (
          <button
            className="w-fit rounded-md border border-sage/30 px-4 py-3 text-sm font-medium text-sage"
            onClick={onRefreshPresetLyrics}
            type="button"
          >
            기본 문구 다시 불러오기
          </button>
        ) : null}
      </div>

      {selectedPresetLabel ? (
        <div className="rounded-md border border-ink/10 bg-porcelain px-4 py-3 text-sm text-ink/65">
          선택한 영상 분위기 <span className="font-medium text-ink">{selectedPresetLabel}</span>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-md border border-ink/10 bg-[#fbfcfb] p-4">
        <div>
          <p className="text-sm font-semibold text-ink">자막 분위기</p>
          <p className="mt-1 text-xs leading-5 text-ink/45">영상 전체에 공통으로 적용되는 자막 톤이에요.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {subtitleStyleOptions.map((option) => {
            const isActive = option.id === selectedStyle;

            return (
              <button
                className={`rounded-md border px-4 py-4 text-left transition ${
                  isActive
                    ? "border-ink bg-ink text-white shadow-[0_18px_38px_rgba(36,36,36,0.12)]"
                    : "border-ink/10 bg-white text-ink hover:border-ink/25"
                }`}
                key={option.id}
                onClick={() => onApplyStyle(option.id)}
                type="button"
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className={`mt-2 text-xs leading-5 ${isActive ? "text-white/75" : "text-ink/45"}`}>
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 rounded-md border border-ink/10 bg-[#fcfbf9] p-4">
        <div>
          <p className="text-sm font-semibold text-ink">자막 세부 설정</p>
          <p className="mt-1 text-xs leading-5 text-ink/45">
            색상, 위치, 크기를 조절하면 영상에 보이는 인상이 바로 달라져요.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">색상</p>
            <div className="flex flex-wrap gap-2">
              {subtitleColorThemeOptions.map((option) => (
                <button
                  aria-pressed={subtitleAppearance.colorTheme === option.id}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                    subtitleAppearance.colorTheme === option.id
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink hover:border-ink/25"
                  }`}
                  key={option.id}
                  onClick={() => onUpdateSubtitleAppearance({ colorTheme: option.id })}
                  type="button"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/50"
                    style={{ background: option.preview }}
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">위치</p>
            <div className="flex flex-wrap gap-2">
              {subtitlePositionOptions.map((option) => (
                <button
                  aria-pressed={subtitleAppearance.position === option.id}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    subtitleAppearance.position === option.id
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink hover:border-ink/25"
                  }`}
                  key={option.id}
                  onClick={() => onUpdateSubtitleAppearance({ position: option.id })}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">크기</p>
            <div className="flex flex-wrap gap-2">
              {subtitleSizeOptions.map((option) => (
                <button
                  aria-pressed={subtitleAppearance.size === option.id}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    subtitleAppearance.size === option.id
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink hover:border-ink/25"
                  }`}
                  key={option.id}
                  onClick={() => onUpdateSubtitleAppearance({ size: option.id })}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-ink/15 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">빠르게 바꾸기</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {placeholderTokens.map((token) => (
            <span className="rounded-full bg-porcelain px-3 py-1 text-xs text-ink/60" key={token.value}>
              {token.label}: <span className="font-medium text-ink">{token.value}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {lyricSegments.map((segment, index) => (
          <article
            className="grid gap-4 rounded-md border border-ink/10 bg-porcelain/70 p-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1.1fr)_110px_110px_82px] xl:items-end"
            key={segment.id}
          >
            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-ink">
                문구 {index + 1}
                <input
                  className="rounded-md border border-ink/15 bg-white px-3 py-2"
                  onChange={(event) =>
                    onUpdateLyric(segment.id, {
                      text: event.target.value
                    })
                  }
                  placeholder="예: 오늘, 두 사람의 설렘이 시작돼요"
                  value={segment.text}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {placeholderTokens.map((token) => (
                  <button
                    className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs text-ink/60 transition hover:border-ink/25 hover:text-ink"
                    key={`${segment.id}-${token.value}`}
                    onClick={() =>
                      onUpdateLyric(segment.id, {
                        text: segment.text.includes(token.value)
                          ? segment.text
                          : `${segment.text}${segment.text.trim() ? " " : ""}${token.value}`
                      })
                    }
                    type="button"
                  >
                    {token.label}
                  </button>
                ))}
              </div>
              <div className="rounded-md bg-white/75 px-3 py-2 text-xs leading-5 text-ink/55">
                미리 적용되면 이렇게 보여요:
                <p className="mt-1 font-medium text-ink">
                  {resolveLyricTemplate(segment.text || "문구를 입력해주세요", project)}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-ink">
                번역 문구(선택)
                <input
                  className="rounded-md border border-ink/15 bg-white px-3 py-2"
                  onChange={(event) =>
                    onUpdateLyric(segment.id, {
                      translation: event.target.value
                    })
                  }
                  placeholder="영문 자막 아래에 함께 보여줄 문구"
                  value={segment.translation ?? ""}
                />
              </label>
              <div className="rounded-md bg-white/75 px-3 py-2 text-xs leading-5 text-ink/55">
                {segment.translation?.trim()
                  ? `번역 미리보기: ${resolveLyricTemplate(segment.translation, project)}`
                  : "번역 문구는 선택이에요. 클래식한 2줄 자막에 잘 어울려요."}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-medium text-ink">
              시작(초)
              <input
                className="rounded-md border border-ink/15 bg-white px-3 py-2"
                min={0}
                onChange={(event) =>
                  onUpdateLyric(segment.id, {
                    startMs: Math.max(0, Math.round(Number(event.target.value) * 1000))
                  })
                }
                step={0.1}
                type="number"
                value={Number((segment.startMs / 1000).toFixed(1))}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-ink">
              종료(초)
              <input
                className="rounded-md border border-ink/15 bg-white px-3 py-2"
                min={0.1}
                onChange={(event) =>
                  onUpdateLyric(segment.id, {
                    endMs: Math.max(100, Math.round(Number(event.target.value) * 1000))
                  })
                }
                step={0.1}
                type="number"
                value={Number((segment.endMs / 1000).toFixed(1))}
              />
            </label>

            <button
              className="rounded-md border border-rose/40 px-3 py-2 text-sm text-rose"
              onClick={() => onRemoveLyric(segment.id)}
              type="button"
            >
              삭제
            </button>
          </article>
        ))}
      </div>

      <button
        className="w-fit rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
        onClick={onAddLyric}
        type="button"
      >
        문구 추가
      </button>
    </section>
  );
}

function StepNavigation({
  currentStep,
  currentStepReady,
  onMove
}: {
  currentStep: VideoStepId;
  currentStepReady: boolean;
  onMove: (direction: "next" | "previous") => void;
}) {
  const currentIndex = videoSteps.findIndex((step) => step.id === currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === videoSteps.length - 1;

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <button
        className="rounded-md border border-ink/15 px-4 py-3 text-sm font-medium text-ink disabled:opacity-40"
        disabled={isFirst}
        onClick={() => onMove("previous")}
        type="button"
      >
        이전 단계
      </button>
      <div className="text-sm text-ink/55">
        {currentStepReady
          ? "이 단계는 준비가 끝났어요."
          : "필수 내용을 채우면 다음 단계로 자연스럽게 넘어갈 수 있어요."}
      </div>
      <button
        className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-45"
        disabled={isLast || !currentStepReady}
        onClick={() => onMove("next")}
        type="button"
      >
        다음 단계
      </button>
    </div>
  );
}

function VideoSummaryPanel({
  activeImage,
  activeScene,
  completedStepCount,
  renderInputDurationMs,
  requiredPhotoCount,
  selectedPreset,
  state,
  subtitleAppearance,
  subtitlePreviewText,
  subtitlePreviewTranslation,
  subtitleStyle,
  totalStepCount
}: {
  activeImage?: EditorImageAsset;
  activeScene?: VideoEditorState["scenes"][number];
  completedStepCount: number;
  renderInputDurationMs: number;
  requiredPhotoCount: number;
  selectedPreset?: (typeof videoMusicPresets)[number];
  state: VideoEditorState;
  subtitleAppearance: VideoEditorState["subtitleAppearance"];
  subtitlePreviewText: string;
  subtitlePreviewTranslation?: string;
  subtitleStyle: VideoSubtitleStyleId;
  totalStepCount: number;
}) {
  const readiness = Math.round((completedStepCount / totalStepCount) * 100);
  const themeClasses = subtitleThemeClassMap[subtitleAppearance.colorTheme];

  return (
    <section className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
      <div className="border-b border-ink/10 bg-[#f7f2ed] px-4 py-3">
        <p className="text-sm font-semibold text-ink">영상 미리보기</p>
        <p className="mt-1 text-xs text-ink/55">선택한 사진과 자막 분위기가 바로 반영돼요.</p>
      </div>

      <div className="p-4">
        <div className="relative aspect-video overflow-hidden rounded-md bg-[#efe9e2]">
          {activeImage ? (
            <Image
              alt={activeImage.alt ?? activeImage.fileName}
              className="object-cover"
              fill
              src={activeImage.previewUrl}
              unoptimized
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm text-ink/45">
              노래를 고르고 사진을 올리면 여기에서 바로 영상 느낌을 확인할 수 있어요.
            </div>
          )}

          {activeImage ? <div className="absolute inset-0 bg-black/18" /> : null}

          {activeImage ? (
            <div
              className={`absolute inset-x-6 flex justify-center ${
                subtitleAppearance.position === "center" ? "top-1/2 -translate-y-1/2" : "bottom-6"
              }`}
            >
              <div
                className={`w-full max-w-[85%] rounded-[22px] border px-5 py-4 text-center shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-md ${themeClasses.panel} ${getSubtitleFontClass(subtitleStyle)}`}
              >
                <p className={`${getSubtitleSizeClass(subtitleAppearance.size)} ${themeClasses.text}`}>
                  {subtitlePreviewText || "여기에 자막이 자연스럽게 보여요"}
                </p>
                {subtitlePreviewTranslation ? (
                  <p
                    className={`mt-2 ${getSubtitleTranslationSizeClass(subtitleAppearance.size)} ${themeClasses.translation}`}
                  >
                    {subtitlePreviewTranslation}
                  </p>
                ) : null}
                <div className="mt-3 flex justify-center">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${themeClasses.badge}`}>
                    {getSubtitleStyleLabel(subtitleStyle)} · {getSubtitlePositionLabel(subtitleAppearance.position)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/50">선택한 노래</dt>
            <dd className="text-right font-medium text-ink">
              {selectedPreset ? `${selectedPreset.artist} - ${selectedPreset.title}` : "아직 선택 전"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/50">사진</dt>
            <dd className="font-medium text-ink">
              {state.images.length}/{requiredPhotoCount}장
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/50">예상 길이</dt>
            <dd className="font-medium text-ink">{formatTime(renderInputDurationMs)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/50">현재 구간</dt>
            <dd className="font-medium text-ink">
              {activeScene ? `${Math.round(activeScene.durationMs / 1000)}초` : "-"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/50">장면 역할</dt>
            <dd className="font-medium text-ink">{activeScene ? getSceneRoleLabel(activeScene.role) : "-"}</dd>
          </div>
        </dl>

        <div className="mt-5 rounded-md border border-ink/10 bg-[#fcfbf9] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">자막 스타일 요약</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-porcelain px-3 py-1 text-xs text-ink/60">
              분위기: <span className="font-medium text-ink">{getSubtitleStyleLabel(subtitleStyle)}</span>
            </span>
            <span className="rounded-full bg-porcelain px-3 py-1 text-xs text-ink/60">
              위치: <span className="font-medium text-ink">{getSubtitlePositionLabel(subtitleAppearance.position)}</span>
            </span>
            <span className="rounded-full bg-porcelain px-3 py-1 text-xs text-ink/60">
              크기: <span className="font-medium text-ink">{getSubtitleSizeLabel(subtitleAppearance.size)}</span>
            </span>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-ink/55">
            <span>준비 상태</span>
            <span>{readiness}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-porcelain">
            <div className="h-full bg-rose transition-all" style={{ width: `${readiness}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function getSubtitleFontClass(style: VideoSubtitleStyleId) {
  switch (style) {
    case "pop-classic":
      return "font-serif tracking-[0.02em]";
    case "kpop-deep":
      return "font-medium";
    default:
      return "font-semibold";
  }
}

function getSubtitleSizeClass(size: VideoSubtitleSizeId) {
  switch (size) {
    case "sm":
      return "text-base md:text-lg";
    case "lg":
      return "text-2xl md:text-3xl";
    default:
      return "text-xl md:text-2xl";
  }
}

function getSubtitleTranslationSizeClass(size: VideoSubtitleSizeId) {
  switch (size) {
    case "sm":
      return "text-xs md:text-sm";
    case "lg":
      return "text-sm md:text-base";
    default:
      return "text-xs md:text-sm";
  }
}

function getSubtitleStyleLabel(style: VideoSubtitleStyleId) {
  return subtitleStyleOptions.find((option) => option.id === style)?.label ?? "기본 스타일";
}

function getSubtitlePositionLabel(position: VideoSubtitlePositionId) {
  return subtitlePositionOptions.find((option) => option.id === position)?.label ?? "하단";
}

function getSubtitleSizeLabel(size: VideoSubtitleSizeId) {
  return subtitleSizeOptions.find((option) => option.id === size)?.label ?? "기본";
}

function getSceneRoleLabel(role: VideoSceneRoleId) {
  return sceneRoleOptions.find((option) => option.id === role)?.label ?? "장면";
}

function getVideoQualityItems({
  durationMs,
  imageCount,
  lyricCount,
  requiredPhotoCount,
  roles,
  stepCompletion
}: {
  durationMs: number;
  imageCount: number;
  lyricCount: number;
  requiredPhotoCount: number;
  roles: VideoSceneRoleId[];
  stepCompletion: Record<VideoStepId, boolean>;
}): VideoQualityItem[] {
  const hasStoryShape = roles.includes("opening") && roles.includes("couple") && roles.includes("ending");
  const hasHumanWarmth = roles.includes("family") || roles.includes("detail");

  return [
    {
      done: stepCompletion.music,
      help: "노래 분위기가 정해져야 사진 수, 자막 톤, 영상 호흡이 맞아요.",
      label: "분위기 선택",
      step: "music"
    },
    {
      done: imageCount >= requiredPhotoCount,
      help: `선택한 흐름에는 ${requiredPhotoCount}장의 사진이 필요해요.`,
      label: "사진 수 충족",
      step: "upload"
    },
    {
      done: hasStoryShape,
      help: "오프닝, 두 사람, 엔딩 컷이 있어야 처음부터 끝까지 이야기가 생겨요.",
      label: "스토리 구조",
      step: "arrange"
    },
    {
      done: hasHumanWarmth,
      help: "디테일 컷이나 가족/친구 컷을 섞으면 하객이 더 오래 집중해요.",
      label: "감정 디테일",
      step: "arrange"
    },
    {
      done: lyricCount > 0 && durationMs >= 45_000,
      help: "문구와 45초 이상의 흐름이 있으면 짧은 PPT처럼 보이지 않아요.",
      label: "자막과 길이",
      step: "lyrics"
    }
  ];
}

function getEstimatedProductionTimeLabel(imageCount: number) {
  if (imageCount >= 18) {
    return "사진이 많은 편이라 영상 제작은 약 2~4분 정도 걸릴 수 있어요.";
  }

  if (imageCount >= 10) {
    return "영상 제작은 약 1~3분 정도 소요돼요.";
  }

  return "짧은 영상은 보통 1~2분 안에 제작돼요.";
}

function getSceneStartMs(scenes: VideoEditorState["scenes"], index: number) {
  return scenes.slice(0, index).reduce((total, scene) => total + scene.durationMs, 0);
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read file."));
    });
    reader.addEventListener("error", () => reject(reader.error ?? new Error("Unable to read file.")));
    reader.readAsDataURL(file);
  });
}
