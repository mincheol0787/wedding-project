import type { VideoRenderInput, VideoTemplateId } from "@/lib/video/render-input";

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
  startMs: number;
  endMs: number;
};

export type VideoEditorState = {
  project: {
    id: string;
    title: string;
    groomName?: string;
    brideName?: string;
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
  audio?: EditorAudioAsset;
};

export type VideoEditorAction =
  | { type: "set-template"; templateId: VideoTemplateId }
  | { type: "add-images"; images: EditorImageAsset[] }
  | { type: "remove-image"; imageAssetId: string }
  | { type: "move-scene"; sceneId: string; direction: "up" | "down" }
  | { type: "update-scene"; sceneId: string; patch: Partial<EditorScene> }
  | { type: "set-audio"; audio: EditorAudioAsset }
  | { type: "clear-audio" }
  | { type: "add-lyric" }
  | { type: "update-lyric"; lyricId: string; patch: Partial<EditorLyricSegment> }
  | { type: "remove-lyric"; lyricId: string };

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
    lyricSegments: [
      {
        id: createId("lyric"),
        text: "처음 마주한 순간부터",
        startMs: 1000,
        endMs: 4500
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
          scene.id === action.sceneId
            ? {
                ...scene,
                ...action.patch
              }
            : scene
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
            endMs: state.lyricSegments.length * 4000 + 3500
          }
        ]
      };

    case "update-lyric":
      return {
        ...state,
        lyricSegments: state.lyricSegments.map((segment) =>
          segment.id === action.lyricId
            ? {
                ...segment,
                ...action.patch
              }
            : segment
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

export function buildVideoRenderInput(state: VideoEditorState): VideoRenderInput {
  let cursorMs = 0;

  const scenes = state.scenes.map((scene, order) => {
    const startMs = cursorMs;
    cursorMs += scene.durationMs;

    const isZoomIn = scene.motion === "zoom-in";

    return {
      id: scene.id,
      order,
      imageAssetId: scene.imageAssetId,
      startMs,
      durationMs: scene.durationMs,
      transition: {
        type: "fade" as const,
        durationMs: Math.min(700, Math.floor(scene.durationMs / 3))
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
        ...segment,
        order
      }))
      .filter((segment) => segment.text.trim().length > 0 && segment.endMs > segment.startMs)
  };
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
