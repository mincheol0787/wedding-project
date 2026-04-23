import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import type { VideoRenderInput, VideoSubtitleStyleId } from "@/lib/video/render-input";
import { defaultVideoRenderInput } from "@/lib/video/render-input";

type WeddingVideoProps = {
  input?: VideoRenderInput;
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
  const fadeOut = interpolate(
    frame,
    [durationFrames - transitionFrames, durationFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp"
    }
  );
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
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            width: "100%"
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
  durationInFrames,
  stylePreset,
  templateId,
  text,
  translation
}: {
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

  const isLetter = templateId === "film-letter";
  const isPopClassic = stylePreset === "pop-classic";
  const isDeepKpop = stylePreset === "kpop-deep";
  const fontFamily = isPopClassic
    ? "'Playfair Display', 'Noto Serif KR', Georgia, serif"
    : "'Pretendard', 'Noto Sans KR', Arial, sans-serif";

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: isLetter ? "flex-end" : "center",
        padding: isLetter ? "0 180px 150px" : "0 160px 120px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          color: "#fff",
          fontFamily,
          fontSize: isPopClassic ? 58 : isLetter ? 62 : 70,
          fontWeight: isPopClassic ? 500 : 600,
          letterSpacing: 0,
          lineHeight: 1.35,
          maxWidth: 1320,
          opacity,
          textShadow: "0 6px 28px rgba(0,0,0,0.46)",
          transform: `translateY(${translateY}px)`,
          whiteSpace: "pre-wrap"
        }}
      >
        <div>{text}</div>
        {translation ? (
          <div
            style={{
              color: isDeepKpop ? "rgba(255,244,235,0.82)" : "rgba(255,255,255,0.78)",
              fontFamily: "'Noto Serif KR', 'Noto Sans KR', serif",
              fontSize: isPopClassic ? 30 : 34,
              fontWeight: 400,
              lineHeight: 1.55,
              marginTop: 22
            }}
          >
            {translation}
          </div>
        ) : null}
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

function getTemplateBackground(templateId: VideoRenderInput["templateId"]): React.CSSProperties {
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

function msToFrames(ms: number, fps: number) {
  return Math.max(1, Math.round((ms / 1000) * fps));
}
