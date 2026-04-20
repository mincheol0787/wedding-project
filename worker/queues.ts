import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

export const renderConnection = new IORedis(env.REDIS_URL, {
  connectTimeout: 3000,
  enableOfflineQueue: false,
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
