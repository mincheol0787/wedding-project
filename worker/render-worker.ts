import { Worker } from "bullmq";
import { renderConnection, renderQueue } from "./queues";
import { executeRenderJob } from "@/server/video/render-executor";
import {
  attachQueueJob,
  getQueuedRenderJobsForWorker,
  markRenderJobFailed
} from "@/server/video/render-jobs";
import {
  getRenderQueueJobId,
  RENDER_QUEUE_JOB_NAME,
  RENDER_QUEUE_NAME,
  renderQueueJobOptions
} from "@/server/video/render-queue";

void hydratePendingRenderJobs();

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

async function hydratePendingRenderJobs() {
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
