import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/prisma-client";
import type { VideoRenderInput } from "@/lib/video/render-input";

type CreateRenderJobInput = {
  userId: string;
  weddingProjectId: string;
  videoProjectId: string;
  input: VideoRenderInput;
};

export async function createRenderJob(input: CreateRenderJobInput, maxAttempts = 3) {
  return prisma.renderJob.create({
    data: {
      userId: input.userId,
      weddingProjectId: input.weddingProjectId,
      videoProjectId: input.videoProjectId,
      input: input.input as Prisma.InputJsonObject,
      status: "QUEUED",
      progress: 0,
      maxAttempts
    }
  });
}

export async function attachQueueJob(renderJobId: string, queueJobId: string) {
  return prisma.renderJob.update({
    where: {
      id: renderJobId
    },
    data: {
      queueJobId,
      status: "QUEUED",
      errorMessage: null
    }
  });
}

export async function markRenderJobProcessing(renderJobId: string, attempts: number) {
  return prisma.renderJob.update({
    where: {
      id: renderJobId
    },
    data: {
      status: "PROCESSING",
      attempts,
      progress: 10,
      startedAt: new Date(),
      finishedAt: null,
      errorMessage: null
    }
  });
}

export async function updateRenderJobProgress(renderJobId: string, progress: number) {
  return prisma.renderJob.update({
    where: {
      id: renderJobId
    },
    data: {
      progress: Math.max(0, Math.min(100, progress))
    }
  });
}

export async function markRenderJobSucceeded(renderJobId: string, outputAssetId?: string) {
  return prisma.renderJob.update({
    where: {
      id: renderJobId
    },
    data: {
      status: "SUCCEEDED",
      progress: 100,
      outputAssetId,
      finishedAt: new Date(),
      errorMessage: null
    }
  });
}

export async function markRenderJobFailed(renderJobId: string, errorMessage: string, attempts?: number) {
  return prisma.renderJob.update({
    where: {
      id: renderJobId
    },
    data: {
      status: "FAILED",
      progress: 0,
      attempts,
      finishedAt: new Date(),
      errorMessage
    }
  });
}

export async function cancelRenderJob(userId: string, renderJobId: string) {
  return prisma.renderJob.updateMany({
    where: {
      id: renderJobId,
      userId,
      deletedAt: null,
      status: {
        in: ["QUEUED", "PROCESSING"]
      }
    },
    data: {
      status: "CANCELED",
      finishedAt: new Date(),
      errorMessage: null
    }
  });
}

export async function deleteRenderJob(userId: string, renderJobId: string) {
  return prisma.renderJob.updateMany({
    where: {
      id: renderJobId,
      userId,
      deletedAt: null
    },
    data: {
      deletedAt: new Date()
    }
  });
}

export async function getRetryableRenderJob(userId: string, renderJobId: string) {
  return prisma.renderJob.findFirst({
    where: {
      id: renderJobId,
      userId,
      deletedAt: null,
      status: {
        in: ["FAILED", "CANCELED"]
      }
    },
    select: {
      weddingProjectId: true,
      videoProjectId: true,
      input: true
    }
  });
}

export async function getRenderJobsForProject(userId: string, weddingProjectId: string) {
  return prisma.renderJob.findMany({
    where: {
      userId,
      weddingProjectId,
      deletedAt: null
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 10,
    select: {
      id: true,
      status: true,
      progress: true,
      attempts: true,
      maxAttempts: true,
      errorMessage: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
      outputAsset: {
        select: {
          url: true,
          fileName: true
        }
      }
    }
  });
}

export async function getQueuedRenderJobsForWorker(limit = 50) {
  return prisma.renderJob.findMany({
    where: {
      status: "QUEUED",
      deletedAt: null,
      queueJobId: null
    },
    orderBy: {
      createdAt: "asc"
    },
    take: limit,
    select: {
      id: true
    }
  });
}
