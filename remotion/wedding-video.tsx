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
  VideoSubtitlePositionId,
  VideoSubtitleSizeId,
  VideoSubtitleStyleId
} from "../lib/video/render-input";
import { defaultVideoRenderInput } from "../lib/video/render-input";

type WeddingVideoProps = {
  input?: VideoRenderInput;
};

const subtitleThemeMap: Record<
  VideoSubtitleColorThemeId,
  { badge: string; panelBackground: string; text: string; translation: string }
> = {
  "peach-glow": {
    panelBackground: "linear-gradient(135deg, rgba(255,247,240,0.36), rgba(255,226,204,0.16))",
    text: "#FFF7F1",
    translation: "rgba(255,255,255,0.82)",
    badge: "rgba(255,255,255,0.2)"
  },
  "rose-gold": {
    panelBackground: "linear-gradient(135deg, rgba(245,211,221,0.28), rgba(201,168,156,0.14))",
    text: "#FFF4F6",
    translation: "#F7E3E8",
    badge: "rgba(255,246,247,0.18)"
  },
  "ivory-light": {
    panelBackground: "linear-gradient(135deg, rgba(255,250,238,0.32), rgba(255,244,212,0.15))",
    text: "#FFF9F1",
    translation: "#FFF0D6",
    badge: "rgba(255,253,248,0.18)"
  }
};

export function WeddingVideo({ input = defaultVideoRenderInput }: WeddingVideoProps) {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={getTemplateBackground(input.templateId)}>
      {input.assets.audio ? (
        <Audio src={input.assets.audio.src} volume={input.assets.audio.volume} />
      ) : null}

      {input.scenes.map((scene) => {
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
            <PhotoScene imageSrc={image.src} input={input} scene={scene} />
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
              templateId={input.templateId}
              text={segment.text}
              translation={segment.translation}
            />
          </Sequence>
        );
      })}

      <ProjectSignature input={input} />
    </AbsoluteFill>
  );
}

function PhotoScene({
  imageSrc,
  input,
  scene
}: {
  imageSrc: string;
  input: VideoRenderInput;
  scene: VideoRenderInput["scenes"][number];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = msToFrames(scene.durationMs, fps);
  const transitionFrames = msToFrames(scene.transition.durationMs, fps);

  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const fadeOut = interpolate(frame, [durationFrames - transitionFrames, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const scale = interpolate(frame, [0, durationFrames], [scene.motion.scaleFrom, scene.motion.scaleTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
        padding: input.templateId === "modern-frame" ? 84 : 0
      }}
    >
      <AbsoluteFill
        style={{
          backgroundColor: "#111",
          borderRadius: input.templateId === "modern-frame" ? 8 : 0,
          overflow: "hidden"
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`
          }}
        />
        <AbsoluteFill
          style={{
            background:
              input.templateId === "film-letter"
                ? "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.48))"
                : "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.35))"
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function LyricOverlay({
  appearance,
  durationInFrames,
  stylePreset,
  templateId,
  text,
  translation
}: {
  appearance: VideoRenderInput["subtitleAppearance"];
  durationInFrames: number;
  stylePreset?: VideoSubtitleStyleId;
  templateId: VideoRenderInput["templateId"];
  text: string;
  translation?: string;
}) {
  const frame = useCurrentFrame();
  const fadeFrames = Math.min(18, Math.max(4, Math.floor(durationInFrames / 3)));
  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp"
    }
  );
  const translateY = interpolate(frame, [0, fadeFrames], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const theme = subtitleThemeMap[appearance.colorTheme];
  const isPopClassic = stylePreset === "pop-classic";
  const isLetter = templateId === "film-letter";

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: appearance.position === "center" ? "center" : "flex-end",
        padding: appearance.position === "center" ? "0 180px" : isLetter ? "0 180px 150px" : "0 160px 120px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          width: "100%",
          opacity,
          transform: `translateY(${translateY}px)`
        }}
      >
        <div
          style={{
            backdropFilter: "blur(16px)",
            background: theme.panelBackground,
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 28,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            padding: appearance.position === "center" ? "28px 40px" : "24px 34px"
          }}
        >
          <div
            style={{
              color: theme.text,
              fontFamily: getSubtitleFontFamily(stylePreset),
              fontSize: getSubtitleFontSize(appearance.size, isPopClassic),
              fontWeight: isPopClassic ? 500 : stylePreset === "kpop-deep" ? 500 : 600,
              letterSpacing: 0,
              lineHeight: 1.35,
              textShadow: "0 6px 28px rgba(0,0,0,0.42)",
              whiteSpace: "pre-wrap"
            }}
          >
            {text}
          </div>

          {translation ? (
            <div
              style={{
                color: theme.translation,
                fontFamily: "'Noto Serif KR', 'Noto Sans KR', serif",
                fontSize: getSubtitleTranslationSize(appearance.size, isPopClassic),
                fontWeight: 400,
                lineHeight: 1.55,
                marginTop: 18
              }}
            >
              {translation}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 18
            }}
          >
            <div
              style={{
                backgroundColor: theme.badge,
                borderRadius: 999,
                color: "#fff",
                fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 0,
                padding: "8px 18px"
              }}
            >
              {getSubtitleBadgeLabel(stylePreset, appearance.position)}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ProjectSignature({ input }: { input: VideoRenderInput }) {
  const label =
    input.project.groomName && input.project.brideName
      ? `${input.project.groomName} & ${input.project.brideName}`
      : input.project.title;

  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-end",
        display: "flex",
        justifyContent: "flex-start",
        padding: "0 72px 54px",
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.72)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 28,
          letterSpacing: 0,
          textShadow: "0 4px 16px rgba(0,0,0,0.5)"
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
}

function getTemplateBackground(templateId: VideoRenderInput["templateId"]) {
  if (templateId === "modern-frame") {
    return {
      backgroundColor: "#F8F6F2"
    };
  }

  if (templateId === "film-letter") {
    return {
      backgroundColor: "#171615"
    };
  }

  return {
    backgroundColor: "#111"
  };
}

function getSubtitleFontFamily(stylePreset?: VideoSubtitleStyleId) {
  if (stylePreset === "pop-classic") {
    return "'Playfair Display', 'Noto Serif KR', Georgia, serif";
  }

  return "'Pretendard', 'Noto Sans KR', Arial, sans-serif";
}

function getSubtitleFontSize(size: VideoSubtitleSizeId, isPopClassic: boolean) {
  if (size === "sm") {
    return isPopClassic ? 48 : 58;
  }

  if (size === "lg") {
    return isPopClassic ? 68 : 82;
  }

  return isPopClassic ? 58 : 70;
}

function getSubtitleTranslationSize(size: VideoSubtitleSizeId, isPopClassic: boolean) {
  if (size === "sm") {
    return isPopClassic ? 26 : 28;
  }

  if (size === "lg") {
    return isPopClassic ? 34 : 38;
  }

  return isPopClassic ? 30 : 34;
}

function getSubtitleBadgeLabel(stylePreset: VideoSubtitleStyleId | undefined, position: VideoSubtitlePositionId) {
  const styleLabel =
    stylePreset === "pop-classic"
      ? "클래식"
      : stylePreset === "kpop-deep"
        ? "감성"
        : "밝은 무드";

  return `${styleLabel} · ${position === "center" ? "가운데" : "하단"}`;
}

function msToFrames(ms: number, fps: number) {
  return Math.max(1, Math.round((ms / 1000) * fps));
}
