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

const renderJobActionSchema = z.object({
  renderJobId: z.string().min(1)
});

export async function requestRenderAction(
  projectId: string,
  input: VideoRenderInput
): Promise<RenderRequestState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = videoRenderInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "렌더링 입력 데이터가 올바르지 않습니다."
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
      error: "식전영상 작업을 찾을 수 없습니다."
    };
  }

  await requestVideoRender({
    userId: session.user.id,
    weddingProjectId: project.id,
    videoProjectId: project.videoProject.id,
    input: parsed.data
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/video`);

  return {
    message: "렌더링 요청을 접수했습니다. 아래 상태 목록에서 진행 상황을 확인할 수 있어요."
  };
}

export async function cancelRenderJobAction(projectId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = renderJobActionSchema.safeParse({
    renderJobId: formData.get("renderJobId")
  });

  if (!parsed.success) {
    return;
  }

  await cancelRenderJob(session.user.id, parsed.data.renderJobId);
  revalidateVideoPaths(projectId);
}

export async function deleteRenderJobAction(projectId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = renderJobActionSchema.safeParse({
    renderJobId: formData.get("renderJobId")
  });

  if (!parsed.success) {
    return;
  }

  await deleteRenderJob(session.user.id, parsed.data.renderJobId);
  revalidateVideoPaths(projectId);
}

export async function retryRenderJobAction(projectId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = renderJobActionSchema.safeParse({
    renderJobId: formData.get("renderJobId")
  });

  if (!parsed.success) {
    return;
  }

  const renderJob = await getRetryableRenderJob(session.user.id, parsed.data.renderJobId);
  const parsedInput = videoRenderInputSchema.safeParse(renderJob?.input);

  if (!renderJob || !parsedInput.success) {
    revalidateVideoPaths(projectId);
    return;
  }

  await requestVideoRender({
    userId: session.user.id,
    weddingProjectId: renderJob.weddingProjectId,
    videoProjectId: renderJob.videoProjectId,
    input: parsedInput.data
  });

  revalidateVideoPaths(projectId);
}

function revalidateVideoPaths(projectId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/video`);
}
