"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { videoRenderInputSchema, type VideoRenderInput } from "@/lib/video/render-input";
import {
  cancelRenderJob,
  deleteRenderJob,
  getRetryableRenderJob
} from "@/server/video/render-jobs";
import { requestVideoRender } from "@/server/video/render-queue";

export type RenderRequestState = {
  error?: string;
  message?: string;
};

export type RenderJobMutationState = {
  error?: string;
  message?: string;
};

const renderJobActionSchema = z.object({
  renderJobId: z.string().min(1)
});

export async function requestRenderAction(
  projectId: string,
  input: VideoRenderInput
): Promise<RenderRequestState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/login");
    }

    const parsed = videoRenderInputSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: "영상 제작에 필요한 정보가 아직 충분하지 않아요. 사진과 자막을 한 번 더 확인해주세요."
      };
    }

    const project = await prisma.weddingProject.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                deletedAt: null
              }
            }
          }
        ]
      },
      select: {
        id: true,
        videoProject: {
          select: {
            id: true
          }
        }
      }
    });

    if (!project?.videoProject) {
      return {
        error: "식전영상 작업 정보를 찾지 못했어요. 잠시 후 다시 시도해주세요."
      };
    }

    await requestVideoRender({
      userId: session.user.id,
      weddingProjectId: project.id,
      videoProjectId: project.videoProject.id,
      input: parsed.data
    });

    revalidateVideoPaths(projectId);

    return {
      message: "영상 제작이 시작되었습니다. 완료되면 서비스 내 상태 화면에서 바로 확인할 수 있어요."
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "영상 제작을 시작하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
    };
  }
}

export async function cancelRenderJobAction(
  projectId: string,
  formData: FormData
): Promise<RenderJobMutationState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/login");
    }

    const parsed = renderJobActionSchema.safeParse({
      renderJobId: formData.get("renderJobId")
    });

    if (!parsed.success) {
      return { error: "멈출 제작 내역을 찾지 못했어요." };
    }

    await cancelRenderJob(session.user.id, parsed.data.renderJobId);
    revalidateVideoPaths(projectId);

    return {
      message: "영상 제작을 멈췄어요."
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "영상 제작을 멈추는 중 문제가 발생했습니다."
    };
  }
}

export async function deleteRenderJobAction(
  projectId: string,
  formData: FormData
): Promise<RenderJobMutationState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/login");
    }

    const parsed = renderJobActionSchema.safeParse({
      renderJobId: formData.get("renderJobId")
    });

    if (!parsed.success) {
      return { error: "정리할 제작 내역을 찾지 못했어요." };
    }

    await deleteRenderJob(session.user.id, parsed.data.renderJobId);
    revalidateVideoPaths(projectId);

    return {
      message: "제작 내역 목록에서 정리했어요."
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "제작 내역을 정리하는 중 문제가 발생했습니다."
    };
  }
}

export async function retryRenderJobAction(
  projectId: string,
  formData: FormData
): Promise<RenderJobMutationState> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/login");
    }

    const parsed = renderJobActionSchema.safeParse({
      renderJobId: formData.get("renderJobId")
    });

    if (!parsed.success) {
      return { error: "다시 시작할 제작 내역을 찾지 못했어요." };
    }

    const renderJob = await getRetryableRenderJob(session.user.id, parsed.data.renderJobId);
    const parsedInput = videoRenderInputSchema.safeParse(renderJob?.input);

    if (!renderJob || !parsedInput.success) {
      revalidateVideoPaths(projectId);
      return {
        error: "다시 만들기에 필요한 정보를 불러오지 못했어요."
      };
    }

    await requestVideoRender({
      userId: session.user.id,
      weddingProjectId: renderJob.weddingProjectId,
      videoProjectId: renderJob.videoProjectId,
      input: parsedInput.data
    });

    revalidateVideoPaths(projectId);

    return {
      message: "영상 제작을 다시 시작했어요."
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "영상 제작을 다시 시작하는 중 문제가 발생했습니다."
    };
  }
}

function revalidateVideoPaths(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/video`);
}
