import { attachQueueJob, createRenderJob, markRenderJobFailed } from "@/server/video/render-jobs";
import type { VideoRenderInput } from "@/lib/video/render-input";

type RequestRenderInput = {
  userId: string;
  weddingProjectId: string;
  videoProjectId: string;
  input: VideoRenderInput;
};

export async function requestVideoRender(input: RequestRenderInput) {
  const renderJob = await createRenderJob(
    {
      userId: input.userId,
      weddingProjectId: input.weddingProjectId,
      videoProjectId: input.videoProjectId,
      input: input.input
    },
    3
  );

  try {
    const { renderQueue } = await import("@/worker/queues");
    const queueJob = await renderQueue.add(
      "render-video",
      {
        renderJobId: renderJob.id
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000
        },
        removeOnComplete: {
          age: 60 * 60 * 24,
          count: 100
        },
        removeOnFail: {
          age: 60 * 60 * 24 * 7,
          count: 500
        }
      }
    );

    await attachQueueJob(renderJob.id, queueJob.id ?? String(queueJob.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "렌더링 큐 등록에 실패했습니다.";
    await markRenderJobFailed(renderJob.id, `Queue enqueue failed: ${message}`, 0);
  }

  return renderJob;
}
