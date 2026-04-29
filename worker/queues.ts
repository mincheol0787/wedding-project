import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is required to start the video render worker.");
}

export const renderConnection = new IORedis(env.REDIS_URL, {
  connectTimeout: 1500,
  enableOfflineQueue: false,
  lazyConnect: true,
  maxRetriesPerRequest: null
});

export const renderQueue = new Queue("video-render", {
  connection: renderConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    }
  }
});
