export type VideoRenderJobItem = {
  id: string;
  status: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  outputAsset: {
    url: string | null;
    fileName: string;
  } | null;
};

export function normalizeVideoRenderJobItem(job: {
  id: string;
  status: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  errorMessage: string | null;
  createdAt: Date | string;
  startedAt?: Date | string | null;
  finishedAt?: Date | string | null;
  outputAsset: {
    url: string | null;
    fileName: string;
  } | null;
}): VideoRenderJobItem {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    errorMessage: job.errorMessage,
    createdAt: toIsoString(job.createdAt),
    startedAt: job.startedAt ? toIsoString(job.startedAt) : null,
    finishedAt: job.finishedAt ? toIsoString(job.finishedAt) : null,
    outputAsset: job.outputAsset
  };
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
