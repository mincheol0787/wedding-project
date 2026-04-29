import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  APP_PUBLIC_URL: z.string().url().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  REDIS_URL: z.string().min(1).optional(),
  KAKAO_REST_API_KEY: z.string().optional(),
  NEXT_PUBLIC_KAKAO_MAP_APP_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("ap-northeast-2"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional()
});

const parsed = envSchema.parse(process.env);

function toHttpsUrl(host?: string) {
  if (!host) {
    return undefined;
  }

  return `https://${host}`;
}

export const env = {
  ...parsed,
  APP_PUBLIC_URL:
    parsed.NEXT_PUBLIC_APP_URL ??
    parsed.APP_PUBLIC_URL ??
    parsed.NEXTAUTH_URL ??
    parsed.AUTH_URL ??
    toHttpsUrl(parsed.VERCEL_PROJECT_PRODUCTION_URL) ??
    toHttpsUrl(parsed.VERCEL_URL)
};
