import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  APP_PUBLIC_URL: z.string().url().default("http://localhost:3000"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("ap-northeast-2"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);
