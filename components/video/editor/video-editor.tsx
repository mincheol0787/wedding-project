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
  type VideoSubtitleColorThemeId,
  type VideoSubtitlePositionId,
  type VideoSubtitleSizeId,
  type VideoSubtitleStyleId
} from "@/lib/video/render-input";
import { RenderRequestPanel } from "@/components/video/editor/render-request-panel";

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

const videoSteps: VideoStep[] = [
  {
    id: "music",
    label: "노래 선택",
    description: "영상 분위기와 필요한 사진 수를 정해요."
  },
  {
    id: "upload",
    label: "사진 업로드",
    description: "필요한 사진을 채우고 순서를 확인해요."
  },
  {
    id: "arrange",
    label: "사진 셋팅",
    description: "각 구간에 들어갈 사진과 움직임을 맞춰요."
  },
  {
    id: "lyrics",
    label: "가사 수정",
    description: "영상에 들어갈 문구를 자연스럽게 다듬어요."
  }
];

const subtitleStyleOptions: Array<{
  id: VideoSubtitleStyleId;
  label: string;
  description: string;
}> = [
  {
    id: "kpop-bright",
    label: "밝고 산뜻한 자막",
    description: "또렷한 산세리프와 화사한 톤으로 경쾌하게 보여줘요."
  },
  {
    id: "kpop-deep",
    label: "차분한 감성 자막",
    description: "로맨틱한 색감과 깊은 분위기로 한층 더 따뜻하게 표현해요."
  },
  {
    id: "pop-classic",
    label: "클래식 자막",
    description: "세리프 중심의 우아한 타이포로 고급스럽게 정리해요."
  }
];

const subtitleColorThemeOptions: Array<{
  id: VideoSubtitleColorThemeId;
  label: string;
  preview: string;
}> = [
  { id: "peach-glow", label: "피치 글로우", preview: "linear-gradient(135deg,#ffe7de,#ffd5b8)" },
  { id: "rose-gold", label: "로즈 골드", preview: "linear-gradient(135deg,#f5d3dd,#d9b1a3)" },
  { id: "ivory-light", label: "아이보리", preview: "linear-gradient(135deg,#fff7ea,#fff1d4)" }
];

const subtitlePositionOptions: Array<{
  id: VideoSubtitlePositionId;
  label: string;
}> = [
  { id: "center", label: "중앙" },
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

export function VideoEditor({ projectId, project, onRenderRequested }: VideoEditorProps) {
  const [state, dispatch] = useReducer(
    videoEditorReducer,
    project,
    createInitialVideoEditorState
  );
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
  const stepCompletion: Record<VideoStepId, boolean> = {
    music: Boolean(state.musicPreset),
    upload: state.images.length >= requiredPhotoCount,
    arrange:
      state.scenes.length >= requiredPhotoCount &&
      state.scenes.slice(0, requiredPhotoCount).every((scene) => scene.durationMs > 0),
    lyrics: renderInput.lyricSegments.length > 0
  };
  const activeScene = visibleScenes.find((scene) => scene.id === activeSceneId) ?? visibleScenes[0];
  const activeImage = activeScene
    ? state.images.find((image) => image.id === activeScene.imageAssetId)
    : undefined;
  const selectedSubtitleStyle =
    state.lyricSegments.find((segment) => segment.style)?.style ??
    state.musicPreset?.subtitleStyle ??
    "kpop-bright";

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function createImageAsset(file: File): EditorImageAsset {
    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);

    return {
      id: createId("image"),
      fileName: file.name,
      previewUrl,
      alt: file.name
    };
  }

  function handleImageUpload(files: FileList | File[] | null) {
    if (!files?.length) {
      return;
    }

    const images = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => createImageAsset(file));

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
    handleImageUpload(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    handleImageUpload(event.dataTransfer.files);
  }

  function handleSceneImageReplace(imageAssetId: string, files: FileList | null) {
    const file = files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    dispatch({
      type: "replace-image",
      image: createImageAsset(file),
      imageAssetId
    });
  }

  function handleAudioUpload(files: FileList | null) {
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

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">
              Wedding Video Maker
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">식전영상 만들기 순서</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              노래 분위기를 고르고, 필요한 사진을 채운 뒤 영상 흐름과 문구를 차례대로 맞춰보세요.
            </p>
          </div>
          <button
            className="w-fit rounded-md border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-medium text-sage"
            onClick={applySampleFlow}
            type="button"
          >
            1분 샘플로 흐름 보기
          </button>
        </div>

        <StepProgress
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          stepCompletion={stepCompletion}
          steps={videoSteps}
        />
      </section>

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
            subtitleAppearance={state.subtitleAppearance}
            subtitlePreviewText={resolveLyricTemplate(
              state.lyricSegments.find((segment) => segment.text.trim().length > 0)?.text ?? "",
              state.project
            )}
            subtitlePreviewTranslation={
              state.lyricSegments.find((segment) => segment.text.trim().length > 0)?.translation
                ? resolveLyricTemplate(
                    state.lyricSegments.find((segment) => segment.text.trim().length > 0)?.translation ?? "",
                    state.project
                  )
                : undefined
            }
            subtitleStyle={selectedSubtitleStyle}
            state={state}
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
            <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
              Step {index + 1}
            </span>
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
              {isActive ? "진행 중" : isDone ? "완료" : "준비"}
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
        <h2 className="mt-2 text-2xl font-semibold text-ink">노래와 영상 분위기를 선택해 주세요</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          실제 상용 음원과 가사는 포함하지 않습니다. 여기서는 분위기와 영상 구성을 고르고,
          필요한 경우 직접 보유한 음악 파일을 연결할 수 있어요.
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
                <span>약 {preset.durationSeconds}초 구성입니다.</span>
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
            <p className="font-semibold text-ink">내 음악 파일 연결</p>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              샘플 카드는 분위기와 자막 예시만 제공합니다. 실제 제작에는 사용자가 보유한 파일을
              연결하는 구조로 확장됩니다.
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
          <h2 className="mt-2 text-2xl font-semibold text-ink">사진을 업로드해 주세요</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            필요한 사진 수만큼 채워지면 다음 단계로 이동할 수 있어요. 업로드한 순서가 영상의
            기본 흐름이 됩니다.
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
          <span className="block text-lg font-semibold text-ink">사진을 이곳에 끌어오거나 선택해 주세요</span>
          <span className="mt-2 block text-sm leading-6 text-ink/55">
            {remainingCount > 0
              ? `다음 단계로 가려면 ${remainingCount}장이 더 필요해요.`
              : "필요한 사진 수를 채웠어요. 순서를 확인해 주세요."}
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
                  <p className="mt-2 text-xs text-ink/50">
                    기본 길이 {Math.round(scene.durationMs / 1000)}초
                  </p>
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
        <p className="font-medium text-ink">먼저 사진을 업로드해 주세요.</p>
        <p className="mt-2 text-sm text-ink/55">사진이 있어야 영상 흐름을 맞출 수 있어요.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Step 3</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">사진이 나오는 순서를 맞춰 주세요</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          구간을 선택하면 오른쪽 미리보기에도 같은 사진이 표시됩니다. 각 구간에서 사진을 교체하거나
          움직임을 바꿀 수 있어요.
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

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px_150px_120px] lg:items-end">
                <button className="text-left" onClick={() => onSceneSelect(scene.id)} type="button">
                  <p className="text-xs font-semibold text-rose">구간 {index + 1}</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {formatTime(startMs)} - {formatTime(endMs)}
                  </p>
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
  onRefreshPresetLyrics,
  onRemoveLyric,
  onUpdateLyric,
  selectedPresetLabel
}: {
  lyricSegments: VideoEditorState["lyricSegments"];
  onAddLyric: () => void;
  onRefreshPresetLyrics: () => void;
  onRemoveLyric: (lyricId: string) => void;
  onUpdateLyric: (lyricId: string, patch: Partial<VideoEditorState["lyricSegments"][number]>) => void;
  selectedPresetLabel?: string;
}) {
  return (
    <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Step 4</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">영상에 들어갈 문구를 수정해 주세요</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            실제 상용곡 가사는 제공하지 않습니다. 선택한 분위기에 맞춘 데모 문구를 자유롭게 바꿔
            사용하세요.
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
        <div className="rounded-md bg-porcelain px-4 py-3 text-sm text-ink/65">
          선택한 분위기: <span className="font-medium text-ink">{selectedPresetLabel}</span>
        </div>
      ) : null}

      <div className="grid gap-3">
        {lyricSegments.map((segment, index) => (
          <article
            className="grid gap-3 rounded-md border border-ink/10 bg-porcelain/70 p-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_110px_72px] xl:items-end"
            key={segment.id}
          >
            <label className="grid gap-2 text-sm font-medium text-ink">
              문구 {index + 1}
              <input
                className="rounded-md border border-ink/15 px-3 py-2"
                onChange={(event) =>
                  onUpdateLyric(segment.id, {
                    text: event.target.value
                  })
                }
                placeholder="우리의 시작을 함께 축복해 주세요"
                value={segment.text}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              번역 문구(선택)
              <input
                className="rounded-md border border-ink/15 px-3 py-2"
                onChange={(event) =>
                  onUpdateLyric(segment.id, {
                    translation: event.target.value
                  })
                }
                placeholder="영문 문구의 한국어 번역"
                value={segment.translation ?? ""}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              시작(초)
              <input
                className="rounded-md border border-ink/15 px-3 py-2"
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
                className="rounded-md border border-ink/15 px-3 py-2"
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
        {currentStepReady ? "이 단계는 준비됐어요." : "필수 내용을 채우면 다음 단계로 이동할 수 있어요."}
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
  totalStepCount
}: {
  activeImage?: EditorImageAsset;
  activeScene?: VideoEditorState["scenes"][number];
  completedStepCount: number;
  renderInputDurationMs: number;
  requiredPhotoCount: number;
  selectedPreset?: (typeof videoMusicPresets)[number];
  state: VideoEditorState;
  totalStepCount: number;
}) {
  const readiness = Math.round((completedStepCount / totalStepCount) * 100);
  const firstSubtitle = state.lyricSegments.find((segment) => segment.text.trim().length > 0);

  return (
    <section className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
      <div className="border-b border-ink/10 bg-[#f7f2ed] px-4 py-3">
        <p className="text-sm font-semibold text-ink">영상 미리보기</p>
        <p className="mt-1 text-xs text-ink/55">선택한 구간이 이곳에 바로 반영됩니다.</p>
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
              노래를 선택하고 사진을 업로드하면 미리보기가 채워집니다.
            </div>
          )}
          {activeImage ? <div className="absolute inset-0 bg-black/18" /> : null}
          {firstSubtitle && activeImage ? (
            <div className="absolute inset-x-6 bottom-6 rounded-md bg-white/82 px-4 py-3 text-center backdrop-blur">
              <p className="text-sm font-semibold text-ink">{firstSubtitle.text}</p>
              {firstSubtitle.translation ? (
                <p className="mt-1 text-xs text-ink/55">{firstSubtitle.translation}</p>
              ) : null}
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
        </dl>

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

function getSceneStartMs(scenes: VideoEditorState["scenes"], index: number) {
  return scenes.slice(0, index).reduce((total, scene) => total + scene.durationMs, 0);
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
