import { env } from "@/lib/env";
import type { VideoRenderInput } from "@/lib/video/render-input";
import { attachQueueJob, createRenderJob } from "@/server/video/render-jobs";

type RequestRenderInput = {
  userId: string;
  weddingProjectId: string;
  videoProjectId: string;
  input: VideoRenderInput;
};

export const RENDER_QUEUE_NAME = "video-render";
export const RENDER_QUEUE_JOB_NAME = "render-video";
export const RENDER_QUEUE_ENQUEUE_TIMEOUT_MS = 900;

export const renderQueueJobOptions = {
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
} as const;

export type RenderEnqueueStatus = "queued" | "deferred" | "unavailable";

export type RequestVideoRenderResult = {
  renderJob: Awaited<ReturnType<typeof createRenderJob>>;
  enqueueStatus: RenderEnqueueStatus;
};

export async function requestVideoRender(input: RequestRenderInput): Promise<RequestVideoRenderResult> {
  const renderJob = await createRenderJob(
    {
      userId: input.userId,
      weddingProjectId: input.weddingProjectId,
      videoProjectId: input.videoProjectId,
      input: input.input
    },
    3
  );

  const enqueueStatus = await enqueueRenderJobWithoutBlocking(renderJob.id);

  return {
    renderJob,
    enqueueStatus
  };
}

export function getRenderQueueJobId(renderJobId: string) {
  return `render:${renderJobId}`;
}

export async function enqueueExistingRenderJob(renderJobId: string) {
  const { renderQueue } = await import("@/worker/queues");
  const queueJob = await renderQueue.add(
    RENDER_QUEUE_JOB_NAME,
    {
      renderJobId
    },
    {
      ...renderQueueJobOptions,
      jobId: getRenderQueueJobId(renderJobId)
    }
  );

  await attachQueueJob(renderJobId, queueJob.id ?? getRenderQueueJobId(renderJobId));
}

async function enqueueRenderJobWithoutBlocking(renderJobId: string): Promise<RenderEnqueueStatus> {
  if (!env.REDIS_URL) {
    return "unavailable";
  }

  const enqueuePromise = enqueueExistingRenderJob(renderJobId);

  try {
    const result = await Promise.race([
      enqueuePromise.then(() => "queued" as const),
      wait(RENDER_QUEUE_ENQUEUE_TIMEOUT_MS).then(() => "deferred" as const)
    ]);

    if (result === "deferred") {
      void enqueuePromise.catch((error: unknown) => {
        console.warn("[video-render] Deferred queue enqueue failed", getErrorMessage(error));
      });
    }

    return result;
  } catch (error) {
    console.warn("[video-render] Queue enqueue unavailable", getErrorMessage(error));
    return "unavailable";
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown queue error";
}
