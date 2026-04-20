import { Worker } from "bullmq";
import { renderConnection } from "./queues";
import { executeRenderJob } from "@/server/video/render-executor";
import { markRenderJobFailed } from "@/server/video/render-jobs";

new Worker(
  "video-render",
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
