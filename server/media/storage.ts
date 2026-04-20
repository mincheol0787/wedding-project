import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  forcePathStyle: Boolean(env.S3_ENDPOINT),
  credentials:
    env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY
        }
      : undefined
});
