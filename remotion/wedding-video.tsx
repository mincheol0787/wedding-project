import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import type {
  VideoRenderInput,
  VideoSubtitleColorThemeId,
  VideoSubtitleSizeId,
  VideoSubtitleStyleId
} from "../lib/video/render-input";
import { defaultVideoRenderInput } from "../lib/video/render-input";

type WeddingVideoProps = {
  input?: VideoRenderInput;
};

type Scene = VideoRenderInput["scenes"][number];

const subtitleThemeMap: Record<
  VideoSubtitleColorThemeId,
  { accent: string; glow: string; text: string; translation: string }
> = {
  "peach-glow": {
    accent: "#FFD7BF",
    glow: "rgba(255, 196, 158, 0.36)",
    text: "#FFF8F2",
    translation: "rgba(255, 248, 242, 0.78)"
  },
  "rose-gold": {
    accent: "#E8BBC2",
    glow: "rgba(232, 187, 194, 0.32)",
    text: "#FFF4F6",
    translation: "rgba(255, 235, 239, 0.76)"
  },
  "ivory-light": {
    accent: "#F3E0B8",
    glow: "rgba(243, 224, 184, 0.32)",
    text: "#FFF9EC",
    translation: "rgba(255, 246, 226, 0.76)"
  }
};

export function WeddingVideo({ input = defaultVideoRenderInput }: WeddingVideoProps) {
  const { fps } = useVideoConfig();
  const totalFrames = msToFrames(input.composition.durationMs, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#11100f", overflow: "hidden" }}>
      {input.assets.audio ? <Audio src={input.assets.audio.src} volume={input.assets.audio.volume} /> : null}

      <AmbientBackdrop />

      {input.scenes.map((scene, sceneIndex) => {
        const image = input.assets.images.find((asset) => asset.id === scene.imageAssetId);

        if (!image) {
          return null;
        }

        return (
          <Sequence
            durationInFrames={msToFrames(scene.durationMs, fps)}
            from={msToFrames(scene.startMs, fps)}
            key={scene.id}
          >
            <PhotoScene
              imageSrc={image.src}
              input={input}
              scene={scene}
              sceneIndex={sceneIndex}
              totalScenes={input.scenes.length}
            />
          </Sequence>
        );
      })}

      {input.lyricSegments.map((segment) => {
        const durationInFrames = msToFrames(segment.endMs - segment.startMs, fps);

        return (
          <Sequence
            durationInFrames={durationInFrames}
            from={msToFrames(segment.startMs, fps)}
            key={segment.id}
          >
            <LyricOverlay
              appearance={input.subtitleAppearance}
              durationInFrames={durationInFrames}
              stylePreset={segment.style ?? input.musicPreset?.subtitleStyle}
              text={segment.text}
              translation={segment.translation}
            />
          </Sequence>
        );
      })}

      <Sequence durationInFrames={Math.min(totalFrames, msToFrames(3400, fps))} from={0}>
        <OpeningTitle input={input} />
      </Sequence>

      <Sequence durationInFrames={Math.min(msToFrames(5200, fps), totalFrames)} from={Math.max(0, totalFrames - msToFrames(5200, fps))}>
        <ClosingTitle input={input} />
      </Sequence>

      <ProjectSignature input={input} />
      <FilmGrain />
      <Vignette />
    </AbsoluteFill>
  );
}

function PhotoScene({
  imageSrc,
  input,
  scene,
  sceneIndex,
  totalScenes
}: {
  imageSrc: string;
  input: VideoRenderInput;
  scene: Scene;
  sceneIndex: number;
  totalScenes: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = msToFrames(scene.durationMs, fps);
  const transitionFrames = Math.max(18, msToFrames(scene.transition.durationMs, fps));
  const opacity = Math.min(
    interpolate(frame, [0, transitionFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(frame, [durationFrames - transitionFrames, durationFrames], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp"
    })
  );
  const progress = frame / Math.max(1, durationFrames);
  const imageScale = interpolate(frame, [0, durationFrames], [scene.motion.scaleFrom, scene.motion.scaleTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const lift = interpolate(frame, [0, durationFrames], [22, -18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const layout = getSceneLayout(sceneIndex);
  const title = getSceneTitle(sceneIndex, totalScenes);
  const names = getCoupleNames(input);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill>
        <Img
          src={imageSrc}
          style={{
            filter: "blur(30px) saturate(1.12) brightness(0.62)",
            height: "116%",
            left: "-8%",
            objectFit: "cover",
            opacity: 0.72,
            position: "absolute",
            top: "-8%",
            transform: `scale(${1.12 + progress * 0.06})`,
            width: "116%"
          }}
        />
        <AbsoluteFill
          style={{
            background:
              sceneIndex % 2 === 0
                ? "linear-gradient(115deg, rgba(17,16,15,0.76), rgba(17,16,15,0.18) 48%, rgba(17,16,15,0.72))"
                : "linear-gradient(245deg, rgba(17,16,15,0.78), rgba(17,16,15,0.14) 45%, rgba(17,16,15,0.74))"
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: layout.outerPadding }}>
        <div
          style={{
            alignItems: "center",
            display: "grid",
            gap: 58,
            gridTemplateColumns: layout.columns,
            height: "100%",
            width: "100%"
          }}
        >
          {layout.copySide === "left" ? (
            <SceneCopy accent={subtitleThemeMap[input.subtitleAppearance.colorTheme].accent} names={names} sceneIndex={sceneIndex} title={title} />
          ) : null}

          <div
            style={{
              alignItems: "center",
              display: "flex",
              height: "100%",
              justifyContent: "center",
              minWidth: 0,
              transform: `translateY(${lift}px)`
            }}
          >
            <div
              style={{
                aspectRatio: layout.aspectRatio,
                border: "1px solid rgba(255,255,255,0.24)",
                borderRadius: layout.radius,
                boxShadow: "0 48px 120px rgba(0,0,0,0.42)",
                maxHeight: "84vh",
                overflow: "hidden",
                position: "relative",
                width: layout.width
              }}
            >
              <Img
                src={imageSrc}
                style={{
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${imageScale}) translate3d(${layout.imageShiftX}, ${layout.imageShiftY}, 0)`,
                  width: "100%"
                }}
              />
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.32)), linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0))",
                  inset: 0,
                  position: "absolute"
                }}
              />
            </div>
          </div>

          {layout.copySide === "right" ? (
            <SceneCopy accent={subtitleThemeMap[input.subtitleAppearance.colorTheme].accent} names={names} sceneIndex={sceneIndex} title={title} />
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function SceneCopy({
  accent,
  names,
  sceneIndex,
  title
}: {
  accent: string;
  names: string;
  sceneIndex: number;
  title: string;
}) {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [10, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        color: "#fff",
        maxWidth: 520,
        opacity: reveal,
        transform: `translateY(${interpolate(reveal, [0, 1], [26, 0])}px)`
      }}
    >
      <div
        style={{
          color: accent,
          fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 0,
          marginBottom: 28
        }}
      >
        {String(sceneIndex + 1).padStart(2, "0")}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          fontSize: 82,
          fontWeight: 500,
          letterSpacing: 0,
          lineHeight: 0.98,
          textShadow: "0 18px 48px rgba(0,0,0,0.38)"
        }}
      >
        {title}
      </div>
      <div
        style={{
          backgroundColor: accent,
          height: 2,
          margin: "34px 0 28px",
          opacity: 0.72,
          width: 96
        }}
      />
      <div
        style={{
          color: "rgba(255,255,255,0.76)",
          fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: 0,
          lineHeight: 1.5
        }}
      >
        {names}
      </div>
    </div>
  );
}

function LyricOverlay({
  appearance,
  durationInFrames,
  stylePreset,
  text,
  translation
}: {
  appearance: VideoRenderInput["subtitleAppearance"];
  durationInFrames: number;
  stylePreset?: VideoSubtitleStyleId;
  text: string;
  translation?: string;
}) {
  const frame = useCurrentFrame();
  const fadeFrames = Math.min(22, Math.max(8, Math.floor(durationInFrames / 3)));
  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = interpolate(frame, [0, fadeFrames], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const theme = subtitleThemeMap[appearance.colorTheme];
  const isCenter = appearance.position === "center";
  const isPopClassic = stylePreset === "pop-classic";

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: isCenter ? "center" : "flex-end",
        padding: isCenter ? "0 190px" : "0 170px 118px",
        pointerEvents: "none",
        textAlign: "center"
      }}
    >
      <div
        style={{
          display: "inline-block",
          maxWidth: isCenter ? 1120 : 1240,
          opacity,
          transform: `translateY(${translateY}px)`,
          width: "auto"
        }}
      >
        <div
          style={{
            background: "rgba(17,16,15,0.38)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 8,
            boxShadow: `0 18px 54px rgba(0,0,0,0.32), 0 0 80px ${theme.glow}`,
            color: theme.text,
            fontFamily: getSubtitleFontFamily(stylePreset),
            fontSize: getSubtitleFontSize(appearance.size, isPopClassic),
            fontWeight: isPopClassic ? 500 : 650,
            letterSpacing: 0,
            lineHeight: 1.25,
            padding: "22px 34px",
            textShadow: "0 12px 38px rgba(0,0,0,0.58)",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all"
          }}
        >
          <div
            style={{
              backgroundColor: theme.accent,
              height: 2,
              margin: "0 auto 16px",
              opacity: 0.85,
              width: 66
            }}
          />
          {text}
          {translation ? (
            <div
              style={{
                color: theme.translation,
                fontFamily: "'Noto Serif KR', 'Noto Sans KR', serif",
                fontSize: getSubtitleTranslationSize(appearance.size, isPopClassic),
                fontWeight: 400,
                lineHeight: 1.5,
                marginTop: 16
              }}
            >
              {translation}
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function OpeningTitle({ input }: { input: VideoRenderInput }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 24, 76, 102], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const y = interpolate(frame, [0, 42], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const accent = subtitleThemeMap[input.subtitleAppearance.colorTheme].accent;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: "linear-gradient(180deg, rgba(17,16,15,0.82), rgba(17,16,15,0.2), rgba(17,16,15,0.62))",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        opacity,
        textAlign: "center",
        transform: `translateY(${y}px)`
      }}
    >
      <div>
        <div
          style={{
            color: accent,
            fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 0,
            marginBottom: 28
          }}
        >
          WEDDING FILM
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            fontSize: 112,
            fontWeight: 500,
            letterSpacing: 0,
            lineHeight: 0.95,
            textShadow: "0 22px 60px rgba(0,0,0,0.46)"
          }}
        >
          {getCoupleNames(input)}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.72)",
            fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: 0,
            marginTop: 30
          }}
        >
          {formatWeddingDate(input.project.weddingDate)}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ClosingTitle({ input }: { input: VideoRenderInput }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 34, 122, 156], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const accent = subtitleThemeMap[input.subtitleAppearance.colorTheme].accent;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: "linear-gradient(180deg, rgba(17,16,15,0.2), rgba(17,16,15,0.78))",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        opacity,
        textAlign: "center"
      }}
    >
      <div>
        <div
          style={{
            backgroundColor: accent,
            height: 2,
            margin: "0 auto 30px",
            width: 110
          }}
        />
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            fontSize: 92,
            fontWeight: 500,
            letterSpacing: 0,
            lineHeight: 1,
            textShadow: "0 22px 60px rgba(0,0,0,0.48)"
          }}
        >
          Thank you
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.72)",
            fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: 0,
            marginTop: 24
          }}
        >
          for blessing our beginning
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ProjectSignature({ input }: { input: VideoRenderInput }) {
  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-end",
        display: "flex",
        justifyContent: "space-between",
        padding: "0 64px 44px",
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.58)",
          fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: 0
        }}
      >
        {input.project.title}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.44)",
          fontFamily: "'Pretendard', 'Noto Sans KR', Arial, sans-serif",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: 0
        }}
      >
        MC Page
      </div>
    </AbsoluteFill>
  );
}

function AmbientBackdrop() {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 240, [0, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 22% 18%, rgba(255,216,188,0.18), rgba(255,216,188,0) 30%), radial-gradient(circle at 74% 72%, rgba(216,196,156,0.16), rgba(216,196,156,0) 34%), #11100f",
        transform: `translate3d(${drift * -18}px, ${drift * 12}px, 0) scale(1.04)`
      }}
    />
  );
}

function FilmGrain() {
  const frame = useCurrentFrame();
  const opacity = 0.055 + (frame % 3) * 0.008;

  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "repeating-radial-gradient(circle at 18% 32%, rgba(255,255,255,0.22) 0 1px, rgba(255,255,255,0) 1px 5px)",
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none"
      }}
    />
  );
}

function Vignette() {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 44%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.42) 100%)",
        pointerEvents: "none"
      }}
    />
  );
}

function getSceneLayout(index: number) {
  const layouts = [
    {
      aspectRatio: "4 / 5",
      columns: "minmax(0, 0.92fr) minmax(0, 1.08fr)",
      copySide: "left" as const,
      imageShiftX: "0px",
      imageShiftY: "0px",
      outerPadding: "92px 132px",
      radius: 18,
      width: "74%"
    },
    {
      aspectRatio: "16 / 10",
      columns: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
      copySide: "right" as const,
      imageShiftX: "0px",
      imageShiftY: "0px",
      outerPadding: "96px 128px",
      radius: 16,
      width: "88%"
    },
    {
      aspectRatio: "3 / 4",
      columns: "minmax(0, 0.84fr) minmax(0, 1.16fr)",
      copySide: "left" as const,
      imageShiftX: "0px",
      imageShiftY: "0px",
      outerPadding: "82px 150px",
      radius: 22,
      width: "66%"
    },
    {
      aspectRatio: "16 / 9",
      columns: "minmax(0, 1.16fr) minmax(0, 0.84fr)",
      copySide: "right" as const,
      imageShiftX: "0px",
      imageShiftY: "0px",
      outerPadding: "108px 118px",
      radius: 14,
      width: "92%"
    }
  ];

  return layouts[index % layouts.length];
}

function getSceneTitle(index: number, totalScenes: number) {
  if (index === 0) {
    return "First chapter";
  }

  if (index === totalScenes - 1) {
    return "Our beginning";
  }

  const titles = ["The way we smiled", "Warmest season", "Every little promise", "Together, slowly"];

  return titles[(index - 1) % titles.length];
}

function getCoupleNames(input: VideoRenderInput) {
  if (input.project.groomName && input.project.brideName) {
    return `${input.project.groomName} & ${input.project.brideName}`;
  }

  return input.project.title || "Our Wedding";
}

function formatWeddingDate(value?: string) {
  if (!value) {
    return "Our wedding day";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getSubtitleFontFamily(stylePreset?: VideoSubtitleStyleId) {
  if (stylePreset === "pop-classic") {
    return "'Playfair Display', 'Noto Serif KR', Georgia, serif";
  }

  if (stylePreset === "kpop-deep") {
    return "'Noto Serif KR', 'Pretendard', serif";
  }

  return "'Pretendard', 'Noto Sans KR', Arial, sans-serif";
}

function getSubtitleFontSize(size: VideoSubtitleSizeId, isPopClassic: boolean) {
  if (size === "sm") {
    return isPopClassic ? 38 : 40;
  }

  if (size === "lg") {
    return isPopClassic ? 58 : 62;
  }

  return isPopClassic ? 46 : 46;
}

function getSubtitleTranslationSize(size: VideoSubtitleSizeId, isPopClassic: boolean) {
  if (size === "sm") {
    return isPopClassic ? 22 : 23;
  }

  if (size === "lg") {
    return isPopClassic ? 30 : 31;
  }

  return isPopClassic ? 26 : 27;
}

function msToFrames(ms: number, fps: number) {
  return Math.max(1, Math.round((ms / 1000) * fps));
}
