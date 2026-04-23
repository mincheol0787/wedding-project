import { z } from "zod";

export const videoTemplateIds = ["classic-fade", "modern-frame", "film-letter"] as const;

export type VideoTemplateId = (typeof videoTemplateIds)[number];

export const videoTemplates: Array<{
  id: VideoTemplateId;
  name: string;
  description: string;
}> = [
  {
    id: "classic-fade",
    name: "Classic Fade",
    description: "부드러운 페이드와 천천히 확대되는 사진 중심 템플릿"
  },
  {
    id: "modern-frame",
    name: "Modern Frame",
    description: "여백과 프레임을 살린 깔끔한 모던 템플릿"
  },
  {
    id: "film-letter",
    name: "Film Letter",
    description: "필름 톤과 편지 같은 문구 연출을 위한 템플릿"
  }
];

export const videoMusicPresetIds = ["kpop-popcorn", "kpop-flower", "pop-close-to-you"] as const;
export const videoMusicCategories = ["K_POP", "POP"] as const;
export const videoSubtitleStyleIds = ["kpop-bright", "kpop-deep", "pop-classic"] as const;
export const videoSubtitleColorThemeIds = ["peach-glow", "rose-gold", "ivory-light"] as const;
export const videoSubtitlePositionIds = ["center", "bottom"] as const;
export const videoSubtitleSizeIds = ["sm", "md", "lg"] as const;

export type VideoMusicPresetId = (typeof videoMusicPresetIds)[number];
export type VideoMusicCategory = (typeof videoMusicCategories)[number];
export type VideoSubtitleStyleId = (typeof videoSubtitleStyleIds)[number];
export type VideoSubtitleColorThemeId = (typeof videoSubtitleColorThemeIds)[number];
export type VideoSubtitlePositionId = (typeof videoSubtitlePositionIds)[number];
export type VideoSubtitleSizeId = (typeof videoSubtitleSizeIds)[number];

export type Subtitle = {
  start: number;
  end: number;
  text: string;
  translation?: string;
};

export const defaultSubtitleAppearance = {
  colorTheme: "peach-glow",
  position: "bottom",
  size: "md"
} as const satisfies {
  colorTheme: VideoSubtitleColorThemeId;
  position: VideoSubtitlePositionId;
  size: VideoSubtitleSizeId;
};

export const videoMusicPresets: Array<{
  id: VideoMusicPresetId;
  category: VideoMusicCategory;
  title: string;
  artist: string;
  mood: string;
  description: string;
  durationSeconds: number;
  requiredPhotoCount: number;
  tone: string;
  subtitleStyle: VideoSubtitleStyleId;
  demoOnly: true;
  subtitles: Subtitle[];
}> = [
  {
    id: "kpop-popcorn",
    category: "K_POP",
    title: "Popcorn",
    artist: "도경수",
    mood: "설렘 / 밝음 / 시작",
    description: "상용 음원과 실제 가사 없이, 밝고 설레는 분위기만 참고한 샘플 구성입니다.",
    durationSeconds: 60,
    requiredPhotoCount: 10,
    tone: "따뜻하고 밝은 분위기의 영상이에요.",
    subtitleStyle: "kpop-bright",
    demoOnly: true,
    subtitles: [
      { start: 1.2, end: 5.8, text: "오늘의 설렘이 반짝이는 순간" },
      { start: 8.5, end: 13.6, text: "작은 웃음이 우리의 하루를 채워요" },
      { start: 16.4, end: 22.2, text: "처음처럼 가볍게, 오래도록 따뜻하게" },
      { start: 27.5, end: 34.5, text: "두 손을 잡고 같은 계절을 걸어요" },
      { start: 40.2, end: 50.5, text: "우리의 시작을 함께 축복해 주세요" }
    ]
  },
  {
    id: "kpop-flower",
    category: "K_POP",
    title: "Flower",
    artist: "오반",
    mood: "감성 / 깊은 사랑",
    description: "상용 음원과 실제 가사 없이, 차분하고 깊은 사랑의 분위기만 참고한 샘플 구성입니다.",
    durationSeconds: 60,
    requiredPhotoCount: 10,
    tone: "차분하고 깊은 사랑을 담는 영상이에요.",
    subtitleStyle: "kpop-deep",
    demoOnly: true,
    subtitles: [
      { start: 1.4, end: 6.4, text: "천천히 피어난 마음이" },
      { start: 9.2, end: 15.8, text: "서로의 하루에 오래 머물렀습니다" },
      { start: 19.5, end: 26.4, text: "말보다 깊은 약속을 안고" },
      { start: 31.5, end: 40.2, text: "이제 같은 이름의 계절을 시작합니다" },
      { start: 45.8, end: 56.4, text: "가장 고요한 사랑으로 함께하겠습니다" }
    ]
  },
  {
    id: "pop-close-to-you",
    category: "POP",
    title: "Close to You",
    artist: "Carpenters",
    mood: "로맨틱 / 클래식",
    description: "상용 음원과 실제 가사 없이, 클래식한 로맨스 무드만 참고한 영어/번역 샘플입니다.",
    durationSeconds: 60,
    requiredPhotoCount: 10,
    tone: "클래식하고 로맨틱한 분위기의 영상이에요.",
    subtitleStyle: "pop-classic",
    demoOnly: true,
    subtitles: [
      {
        start: 1.4,
        end: 6.2,
        text: "Every gentle day leads me to you",
        translation: "모든 다정한 하루가 당신에게 닿았습니다"
      },
      {
        start: 9.4,
        end: 15.5,
        text: "Your smile became my favorite season",
        translation: "당신의 미소는 내가 가장 사랑하는 계절이 되었습니다"
      },
      {
        start: 19.8,
        end: 27.8,
        text: "We kept our promise in quiet hearts",
        translation: "우리는 조용한 마음으로 약속을 지켜왔습니다"
      },
      {
        start: 33.2,
        end: 42.2,
        text: "Now we walk into the light together",
        translation: "이제 우리는 같은 빛을 향해 함께 걸어갑니다"
      },
      {
        start: 47.8,
        end: 57.4,
        text: "Please bless the beginning of our forever",
        translation: "영원이 될 우리의 시작을 축복해 주세요"
      }
    ]
  }
];

export const videoRenderInputSchema = z.object({
  version: z.literal(1),
  templateId: z.enum(videoTemplateIds),
  musicPreset: z
    .object({
      id: z.enum(videoMusicPresetIds),
      category: z.enum(videoMusicCategories),
      title: z.string(),
      artist: z.string(),
      mood: z.string(),
      subtitleStyle: z.enum(videoSubtitleStyleIds),
      demoOnly: z.boolean()
    })
    .optional(),
  project: z.object({
    id: z.string(),
    title: z.string(),
    groomName: z.string().optional(),
    brideName: z.string().optional(),
    weddingDate: z.string().optional()
  }),
  composition: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fps: z.number().int().positive(),
    durationMs: z.number().int().positive()
  }),
  assets: z.object({
    images: z.array(
      z.object({
        id: z.string(),
        src: z.string(),
        fileName: z.string(),
        alt: z.string().optional()
      })
    ),
    audio: z
      .object({
        id: z.string(),
        src: z.string(),
        fileName: z.string(),
        volume: z.number().min(0).max(1)
      })
      .optional()
  }),
  scenes: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().nonnegative(),
      imageAssetId: z.string(),
      startMs: z.number().int().nonnegative(),
      durationMs: z.number().int().positive(),
      transition: z.object({
        type: z.enum(["fade", "cross-dissolve"]),
        durationMs: z.number().int().nonnegative()
      }),
      motion: z.object({
        type: z.enum(["zoom-in", "zoom-out"]),
        scaleFrom: z.number().positive(),
        scaleTo: z.number().positive()
      })
    })
  ),
  lyricSegments: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().nonnegative(),
      text: z.string(),
      translation: z.string().optional(),
      style: z.enum(videoSubtitleStyleIds).optional(),
      startMs: z.number().int().nonnegative(),
      endMs: z.number().int().positive()
    })
  ),
  subtitleAppearance: z.object({
    colorTheme: z.enum(videoSubtitleColorThemeIds),
    position: z.enum(videoSubtitlePositionIds),
    size: z.enum(videoSubtitleSizeIds)
  })
});

export type VideoRenderInput = z.infer<typeof videoRenderInputSchema>;

function createSampleImageDataUri(title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f8f6f2"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#bg)"/>
      <rect x="120" y="120" width="1680" height="840" rx="24" fill="rgba(255,255,255,0.36)" stroke="rgba(255,255,255,0.68)" stroke-width="2"/>
      <circle cx="960" cy="500" r="180" fill="rgba(255,255,255,0.38)"/>
      <text x="960" y="765" fill="#242424" font-family="Georgia, serif" font-size="72" text-anchor="middle">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const defaultVideoRenderInput: VideoRenderInput = {
  version: 1,
  templateId: "classic-fade",
  project: {
    id: "preview",
    title: "Our Wedding",
    groomName: "Groom",
    brideName: "Bride",
    weddingDate: new Date().toISOString()
  },
  composition: {
    width: 1920,
    height: 1080,
    fps: 30,
    durationMs: 15000
  },
  assets: {
    images: [
      {
        id: "sample-image-1",
        src: createSampleImageDataUri("Our First Chapter", "#ead3d7"),
        fileName: "sample-wedding-1.jpg",
        alt: "Wedding couple"
      },
      {
        id: "sample-image-2",
        src: createSampleImageDataUri("Warmest Season", "#d7dfd4"),
        fileName: "sample-wedding-2.jpg",
        alt: "Wedding flowers"
      },
      {
        id: "sample-image-3",
        src: createSampleImageDataUri("Together Forever", "#e2d3b2"),
        fileName: "sample-wedding-3.jpg",
        alt: "Wedding ceremony"
      }
    ]
  },
  scenes: [
    {
      id: "sample-scene-1",
      order: 0,
      imageAssetId: "sample-image-1",
      startMs: 0,
      durationMs: 5000,
      transition: {
        type: "fade",
        durationMs: 700
      },
      motion: {
        type: "zoom-in",
        scaleFrom: 1,
        scaleTo: 1.08
      }
    },
    {
      id: "sample-scene-2",
      order: 1,
      imageAssetId: "sample-image-2",
      startMs: 5000,
      durationMs: 5000,
      transition: {
        type: "fade",
        durationMs: 700
      },
      motion: {
        type: "zoom-out",
        scaleFrom: 1.08,
        scaleTo: 1
      }
    },
    {
      id: "sample-scene-3",
      order: 2,
      imageAssetId: "sample-image-3",
      startMs: 10000,
      durationMs: 5000,
      transition: {
        type: "fade",
        durationMs: 700
      },
      motion: {
        type: "zoom-in",
        scaleFrom: 1,
        scaleTo: 1.06
      }
    }
  ],
  lyricSegments: [
    {
      id: "sample-lyric-1",
      order: 0,
      text: "처음 마주한 순간부터",
      startMs: 1000,
      endMs: 4500
    },
    {
      id: "sample-lyric-2",
      order: 1,
      text: "서로의 가장 따뜻한 계절이 되었습니다",
      startMs: 6000,
      endMs: 9500
    },
    {
      id: "sample-lyric-3",
      order: 2,
      text: "우리의 시작을 함께 축복해 주세요",
      startMs: 11000,
      endMs: 14500
    }
  ],
  subtitleAppearance: defaultSubtitleAppearance
};
