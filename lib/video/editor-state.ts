import {
  defaultSubtitleAppearance,
  videoMusicPresets,
  type VideoMusicPresetId,
  type VideoSubtitleColorThemeId,
  type VideoSubtitlePositionId,
  type VideoSubtitleSizeId,
  type VideoRenderInput,
  type VideoTemplateId
} from "@/lib/video/render-input";

type EditorMusicPreset = NonNullable<VideoRenderInput["musicPreset"]>;
type EditorSubtitleStyle = NonNullable<VideoRenderInput["lyricSegments"][number]["style"]>;

export type EditorImageAsset = {
  id: string;
  fileName: string;
  previewUrl: string;
  alt?: string;
};

export type EditorAudioAsset = {
  id: string;
  fileName: string;
  previewUrl: string;
  volume: number;
};

export type EditorScene = {
  id: string;
  imageAssetId: string;
  durationMs: number;
  motion: "zoom-in" | "zoom-out";
};

export type EditorLyricSegment = {
  id: string;
  text: string;
  translation?: string;
  style?: EditorSubtitleStyle;
  startMs: number;
  endMs: number;
};

export type VideoEditorState = {
  project: {
    id: string;
    title: string;
    groomName?: string;
    brideName?: string;
    weddingDate?: string;
  };
  templateId: VideoTemplateId;
  composition: {
    width: number;
    height: number;
    fps: number;
  };
  images: EditorImageAsset[];
  scenes: EditorScene[];
  lyricSegments: EditorLyricSegment[];
  subtitleAppearance: {
    colorTheme: VideoSubtitleColorThemeId;
    position: VideoSubtitlePositionId;
    size: VideoSubtitleSizeId;
  };
  audio?: EditorAudioAsset;
  musicPreset?: EditorMusicPreset;
};

export type VideoEditorAction =
  | { type: "set-template"; templateId: VideoTemplateId }
  | { type: "apply-sample-video" }
  | { type: "apply-music-preset"; presetId: VideoMusicPresetId }
  | { type: "add-images"; images: EditorImageAsset[] }
  | { type: "replace-image"; imageAssetId: string; image: EditorImageAsset }
  | { type: "remove-image"; imageAssetId: string }
  | { type: "move-scene"; sceneId: string; direction: "up" | "down" }
  | { type: "update-scene"; sceneId: string; patch: Partial<EditorScene> }
  | { type: "set-audio"; audio: EditorAudioAsset }
  | { type: "clear-audio" }
  | { type: "add-lyric" }
  | { type: "apply-lyric-style"; style: EditorSubtitleStyle }
  | {
      type: "update-subtitle-appearance";
      patch: Partial<VideoEditorState["subtitleAppearance"]>;
    }
  | { type: "update-lyric"; lyricId: string; patch: Partial<EditorLyricSegment> }
  | { type: "remove-lyric"; lyricId: string };

const lyricTemplateOverrides: Partial<Record<VideoMusicPresetId, Array<{
  text: string;
  translation?: string;
}>>> = {
  "kpop-popcorn": [
    { text: "오늘, {신랑이름}와 {신부이름}의 설렘이 시작돼요" },
    { text: "작은 웃음이 모여 우리의 첫 장면이 되었어요" },
    { text: "{날짜}를 향해 한 걸음씩 가까워지고 있어요" },
    { text: "따뜻한 순간마다 두 사람의 이름이 반짝여요" },
    { text: "우리의 시작을 환하게 축복해 주세요" }
  ],
  "kpop-flower": [
    { text: "{신랑이름}와 {신부이름}, 조용한 마음으로 서로를 닮아가요" },
    { text: "깊어진 시간 위로 다정한 약속이 피어나고 있어요" },
    { text: "{날짜}에 두 사람의 계절이 한층 또렷해집니다" },
    { text: "서로의 하루를 오래 안아 줄 사랑을 시작해요" },
    { text: "잔잔하고 깊은 우리의 첫 인사를 지켜봐 주세요" }
  ],
  "pop-close-to-you": [
    {
      text: "Every gentle day leads {신랑이름} and {신부이름} here",
      translation: "모든 다정한 하루가 두 사람을 이 순간으로 데려왔습니다"
    },
    {
      text: "Your smile became our favorite season",
      translation: "서로의 미소는 가장 사랑하는 계절이 되었습니다"
    },
    {
      text: "On {날짜}, we walk into the light together",
      translation: "{날짜}, 두 사람은 같은 빛을 향해 함께 걸어갑니다"
    },
    {
      text: "A quiet promise is turning into forever",
      translation: "조용한 약속은 이제 평생의 이야기가 됩니다"
    },
    {
      text: "Please bless the beginning of our forever",
      translation: "영원이 될 우리의 시작을 축복해 주세요"
    }
  ]
};

export function createInitialVideoEditorState(project: VideoEditorState["project"]): VideoEditorState {
  return {
    project,
    templateId: "classic-fade",
    composition: {
      width: 1920,
      height: 1080,
      fps: 30
    },
    images: [],
    scenes: [],
    subtitleAppearance: defaultSubtitleAppearance,
    lyricSegments: [
      {
        id: createId("lyric"),
        text: "{신랑이름}와 {신부이름}의 첫 페이지가 열려요",
        startMs: 1000,
        endMs: 4500,
        style: "kpop-bright"
      }
    ]
  };
}

export function videoEditorReducer(
  state: VideoEditorState,
  action: VideoEditorAction
): VideoEditorState {
  switch (action.type) {
    case "set-template":
      return {
        ...state,
        templateId: action.templateId
      };

    case "apply-sample-video":
      return createSpringSampleVideoState(state.project, state.musicPreset?.id ?? "kpop-popcorn");

    case "apply-music-preset":
      return applyMusicPreset(state, action.presetId);

    case "add-images": {
      const nextImages = [...state.images, ...action.images];
      const appendedScenes = action.images.map((image, index) => ({
        id: createId("scene"),
        imageAssetId: image.id,
        durationMs: 5000,
        motion: (state.scenes.length + index) % 2 === 0 ? "zoom-in" : "zoom-out"
      })) satisfies EditorScene[];

      return {
        ...state,
        images: nextImages,
        scenes: [...state.scenes, ...appendedScenes]
      };
    }

    case "remove-image":
      return {
        ...state,
        images: state.images.filter((image) => image.id !== action.imageAssetId),
        scenes: state.scenes.filter((scene) => scene.imageAssetId !== action.imageAssetId)
      };

    case "replace-image":
      return {
        ...state,
        images: state.images.map((image) =>
          image.id === action.imageAssetId ? { ...action.image, id: action.imageAssetId } : image
        )
      };

    case "move-scene": {
      const currentIndex = state.scenes.findIndex((scene) => scene.id === action.sceneId);
      const targetIndex = action.direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= state.scenes.length) {
        return state;
      }

      const scenes = [...state.scenes];
      const [scene] = scenes.splice(currentIndex, 1);
      scenes.splice(targetIndex, 0, scene);

      return {
        ...state,
        scenes
      };
    }

    case "update-scene":
      return {
        ...state,
        scenes: state.scenes.map((scene) =>
          scene.id === action.sceneId ? { ...scene, ...action.patch } : scene
        )
      };

    case "set-audio":
      return {
        ...state,
        audio: action.audio
      };

    case "clear-audio":
      return {
        ...state,
        audio: undefined
      };

    case "add-lyric":
      return {
        ...state,
        lyricSegments: [
          ...state.lyricSegments,
          {
            id: createId("lyric"),
            text: "",
            startMs: state.lyricSegments.length * 4000,
            endMs: state.lyricSegments.length * 4000 + 3500,
            style: state.lyricSegments[0]?.style ?? state.musicPreset?.subtitleStyle
          }
        ]
      };

    case "apply-lyric-style":
      return {
        ...state,
        lyricSegments: state.lyricSegments.map((segment) => ({
          ...segment,
          style: action.style
        }))
      };

    case "update-subtitle-appearance":
      return {
        ...state,
        subtitleAppearance: {
          ...state.subtitleAppearance,
          ...action.patch
        }
      };

    case "update-lyric":
      return {
        ...state,
        lyricSegments: state.lyricSegments.map((segment) =>
          segment.id === action.lyricId ? { ...segment, ...action.patch } : segment
        )
      };

    case "remove-lyric":
      return {
        ...state,
        lyricSegments: state.lyricSegments.filter((segment) => segment.id !== action.lyricId)
      };

    default:
      return state;
  }
}

export function createSpringSampleVideoState(
  project: VideoEditorState["project"],
  presetId: VideoMusicPresetId = "kpop-popcorn"
): VideoEditorState {
  const images: EditorImageAsset[] = [
    ["spring-1", "처음 만난 날", "#ead3d7"],
    ["spring-2", "함께 걷는 계절", "#d7dfd4"],
    ["spring-3", "작은 약속", "#f1e7d7"],
    ["spring-4", "오래 닮은 시간", "#e6d7c7"],
    ["spring-5", "가족과 친구들", "#eef1ed"],
    ["spring-6", "예식을 기다리며", "#f4e7e2"],
    ["spring-7", "서로의 손을 잡고", "#e2d3b2"],
    ["spring-8", "고요한 하루", "#ead3d7"],
    ["spring-9", "축복의 순간", "#d7dfd4"],
    ["spring-10", "우리의 시작", "#f1e7d7"]
  ].map(([id, title, accent]) => ({
    id,
    fileName: `${id}.jpg`,
    previewUrl: createEditorSampleImageDataUri(title, accent),
    alt: title
  }));

  const preset = createMusicPresetSnapshot(presetId);

  return {
    project,
    templateId: preset?.subtitleStyle === "kpop-bright" ? "classic-fade" : "film-letter",
    composition: {
      width: 1920,
      height: 1080,
      fps: 30
    },
    images,
    scenes: images.map((image, index) => ({
      id: `spring-scene-${index + 1}`,
      imageAssetId: image.id,
      durationMs: 6000,
      motion: index % 2 === 0 ? "zoom-in" : "zoom-out"
    })),
    lyricSegments: createLyricSegmentsFromPreset(presetId),
    subtitleAppearance: getDefaultSubtitleAppearance(preset?.subtitleStyle),
    musicPreset: preset
  };
}

export function buildVideoRenderInput(state: VideoEditorState): VideoRenderInput {
  let cursorMs = 0;

  const scenes = state.scenes.map((scene, order) => {
    const isZoomIn = scene.motion === "zoom-in";
    const transitionType: VideoRenderInput["scenes"][number]["transition"]["type"] =
      order % 3 === 1 ? "cross-dissolve" : "fade";
    const transitionDurationMs = Math.min(900, Math.floor(scene.durationMs / 3));
    const startMs = order === 0 ? cursorMs : Math.max(0, cursorMs - transitionDurationMs);

    cursorMs = startMs + scene.durationMs;

    return {
      id: scene.id,
      order,
      imageAssetId: scene.imageAssetId,
      startMs,
      durationMs: scene.durationMs,
      transition: {
        type: transitionType,
        durationMs: transitionDurationMs
      },
      motion: {
        type: scene.motion,
        scaleFrom: isZoomIn ? 1 : 1.08,
        scaleTo: isZoomIn ? 1.08 : 1
      }
    };
  });

  return {
    version: 1,
    templateId: state.templateId,
    musicPreset: state.musicPreset,
    project: state.project,
    composition: {
      ...state.composition,
      durationMs: Math.max(cursorMs, 1000)
    },
    assets: {
      images: state.images.map((image) => ({
        id: image.id,
        src: image.previewUrl,
        fileName: image.fileName,
        alt: image.alt
      })),
      audio: state.audio
        ? {
            id: state.audio.id,
            src: state.audio.previewUrl,
            fileName: state.audio.fileName,
            volume: state.audio.volume
          }
        : undefined
    },
    scenes,
    lyricSegments: state.lyricSegments
      .map((segment, order) => ({
        id: segment.id,
        order,
        text: resolveLyricTemplate(segment.text, state.project),
        translation: segment.translation
          ? resolveLyricTemplate(segment.translation, state.project)
          : undefined,
        style: segment.style,
        startMs: segment.startMs,
        endMs: segment.endMs
      }))
      .filter((segment) => segment.text.trim().length > 0 && segment.endMs > segment.startMs),
    subtitleAppearance: state.subtitleAppearance
  };
}

function applyMusicPreset(
  state: VideoEditorState,
  presetId: VideoMusicPresetId
): VideoEditorState {
  const preset = createMusicPresetSnapshot(presetId);

  if (!preset) {
    return state;
  }

  return {
    ...state,
    templateId: preset.subtitleStyle === "kpop-bright" ? "classic-fade" : "film-letter",
    musicPreset: preset,
    subtitleAppearance: getDefaultSubtitleAppearance(preset.subtitleStyle),
    lyricSegments: createLyricSegmentsFromPreset(presetId)
  };
}

function createMusicPresetSnapshot(presetId: VideoMusicPresetId): EditorMusicPreset | undefined {
  const preset = videoMusicPresets.find((item) => item.id === presetId);

  if (!preset) {
    return undefined;
  }

  return {
    id: preset.id,
    category: preset.category,
    title: preset.title,
    artist: preset.artist,
    mood: preset.mood,
    subtitleStyle: preset.subtitleStyle,
    demoOnly: preset.demoOnly
  };
}

function createLyricSegmentsFromPreset(presetId: VideoMusicPresetId): EditorLyricSegment[] {
  const preset = videoMusicPresets.find((item) => item.id === presetId);

  if (!preset) {
    return [];
  }

  const overrides = lyricTemplateOverrides[presetId];

  return preset.subtitles.map((subtitle, index) => ({
    id: `${preset.id}-subtitle-${index + 1}`,
    text: overrides?.[index]?.text ?? subtitle.text,
    translation: overrides?.[index]?.translation ?? subtitle.translation,
    style: preset.subtitleStyle,
    startMs: Math.round(subtitle.start * 1000),
    endMs: Math.round(subtitle.end * 1000)
  }));
}

function getDefaultSubtitleAppearance(style: EditorSubtitleStyle | undefined) {
  if (style === "pop-classic") {
    return {
      colorTheme: "ivory-light" as const,
      position: "bottom" as const,
      size: "md" as const
    };
  }

  if (style === "kpop-deep") {
    return {
      colorTheme: "rose-gold" as const,
      position: "bottom" as const,
      size: "md" as const
    };
  }

  return defaultSubtitleAppearance;
}

export function resolveLyricTemplate(template: string, project: VideoEditorState["project"]) {
  const placeholders: Record<string, string> = {
    "{신랑이름}": project.groomName?.trim() || "신랑",
    "{신부이름}": project.brideName?.trim() || "신부",
    "{날짜}": formatWeddingDate(project.weddingDate)
  };

  return Object.entries(placeholders).reduce(
    (result, [token, value]) => result.replaceAll(token, value),
    template
  );
}

function formatWeddingDate(value?: string) {
  if (!value) {
    return "우리의 날";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEditorSampleImageDataUri(title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fbfaf7"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#bg)"/>
      <rect x="132" y="112" width="1656" height="856" rx="28" fill="rgba(255,255,255,0.42)" stroke="rgba(255,255,255,0.72)" stroke-width="2"/>
      <circle cx="960" cy="500" r="210" fill="rgba(255,255,255,0.36)"/>
      <text x="960" y="750" fill="#242424" font-family="Georgia, serif" font-size="74" text-anchor="middle">${title}</text>
      <text x="960" y="828" fill="#677e6e" font-family="Arial, sans-serif" font-size="28" letter-spacing="9" text-anchor="middle">SPRING WEDDING FILM</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
