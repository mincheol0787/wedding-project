import { Worker } from "bullmq";
import { videoProductionFeature } from "@/lib/features";

type RenderQueueJobOptions = {
  attempts: number;
  backoff: {
    delay: number;
    type: "exponential";
  };
  jobId?: string;
  removeOnComplete: {
    age: number;
    count: number;
  };
  removeOnFail: {
    age: number;
    count: number;
  };
};

if (!videoProductionFeature.enabled) {
  console.log("[video-render] Worker is disabled while video production quality is being rebuilt.");
} else {
  void startRenderWorker();
}

async function startRenderWorker() {
  const [
    { renderConnection, renderQueue },
    { executeRenderJob },
    { attachQueueJob, getQueuedRenderJobsForWorker, markRenderJobFailed },
    { getRenderQueueJobId, RENDER_QUEUE_JOB_NAME, RENDER_QUEUE_NAME, renderQueueJobOptions }
  ] = await Promise.all([
    import("./queues"),
    import("@/server/video/render-executor"),
    import("@/server/video/render-jobs"),
    import("@/server/video/render-queue")
  ]);

  await hydratePendingRenderJobs({
    attachQueueJob,
    getQueuedRenderJobsForWorker,
    getRenderQueueJobId,
    renderQueue,
    RENDER_QUEUE_JOB_NAME,
    renderQueueJobOptions
  });

  new Worker(
    RENDER_QUEUE_NAME,
    async (job) => {
      const renderJobId = job.data.renderJobId as string | undefined;

      if (!renderJobId) {
        throw new Error("renderJobId is required");
      }

      try {
        await executeRenderJob(renderJobId, job.attemptsMade + 1);
        return {
          ok: true,
          renderJobId
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown render error";

        if (job.attemptsMade + 1 >= (job.opts.attempts ?? 1)) {
          await markRenderJobFailed(renderJobId, message, job.attemptsMade + 1);
        }

        throw error;
      }
    },
    {
      connection: renderConnection,
      concurrency: 1
    }
  );
}

async function hydratePendingRenderJobs({
  attachQueueJob,
  getQueuedRenderJobsForWorker,
  getRenderQueueJobId,
  renderQueue,
  RENDER_QUEUE_JOB_NAME,
  renderQueueJobOptions
}: {
  attachQueueJob: (renderJobId: string, queueJobId: string) => Promise<unknown>;
  getQueuedRenderJobsForWorker: () => Promise<Array<{ id: string }>>;
  getRenderQueueJobId: (renderJobId: string) => string;
  renderQueue: {
    add: (
      name: string,
      data: { renderJobId: string },
      options: RenderQueueJobOptions
    ) => Promise<{ id?: string }>;
  };
  RENDER_QUEUE_JOB_NAME: string;
  renderQueueJobOptions: RenderQueueJobOptions;
}) {
  const pendingJobs = await getQueuedRenderJobsForWorker();

  for (const pendingJob of pendingJobs) {
    const queueJob = await renderQueue.add(
      RENDER_QUEUE_JOB_NAME,
      {
        renderJobId: pendingJob.id
      },
      {
        ...renderQueueJobOptions,
        jobId: getRenderQueueJobId(pendingJob.id)
      }
    );

    await attachQueueJob(pendingJob.id, queueJob.id ?? getRenderQueueJobId(pendingJob.id));
  }
}
