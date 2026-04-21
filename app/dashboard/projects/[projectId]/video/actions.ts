"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { videoRenderInputSchema, type VideoRenderInput } from "@/lib/video/render-input";
import { requestVideoRender } from "@/server/video/render-queue";

export type RenderRequestState = {
  error?: string;
  message?: string;
};

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
      error: "식전영상 프로젝트를 찾을 수 없습니다."
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
