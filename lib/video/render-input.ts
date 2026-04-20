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

export const videoRenderInputSchema = z.object({
  version: z.literal(1),
  templateId: z.enum(videoTemplateIds),
  project: z.object({
    id: z.string(),
    title: z.string(),
    groomName: z.string().optional(),
    brideName: z.string().optional()
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
        type: z.literal("fade"),
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
      startMs: z.number().int().nonnegative(),
      endMs: z.number().int().positive()
    })
  )
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
    brideName: "Bride"
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
  ]
};
