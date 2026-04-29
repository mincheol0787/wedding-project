import { Composition } from "remotion";
import { defaultVideoRenderInput, type VideoRenderInput } from "../lib/video/render-input";
import { WeddingVideo } from "./wedding-video";

export function RemotionRoot() {
  return (
    <Composition
      id="WeddingVideo"
      component={WeddingVideo}
      durationInFrames={Math.ceil(
        (defaultVideoRenderInput.composition.durationMs / 1000) *
          defaultVideoRenderInput.composition.fps
      )}
      fps={defaultVideoRenderInput.composition.fps}
      width={defaultVideoRenderInput.composition.width}
      height={defaultVideoRenderInput.composition.height}
      defaultProps={{
        input: defaultVideoRenderInput
      }}
      calculateMetadata={({ props }) => {
        const input = (props as { input?: VideoRenderInput }).input ?? defaultVideoRenderInput;

        return {
          durationInFrames: Math.ceil((input.composition.durationMs / 1000) * input.composition.fps),
          fps: input.composition.fps,
          height: input.composition.height,
          width: input.composition.width
        };
      }}
    />
  );
}
