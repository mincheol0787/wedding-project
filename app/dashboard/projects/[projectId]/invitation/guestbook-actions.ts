"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const guestbookVisibilitySchema = z.object({
  entryId: z.string().min(1),
  isHidden: z.enum(["true", "false"])
});

export type GuestbookVisibilityState = {
  error?: string;
  message?: string;
};

export async function toggleGuestbookVisibilityAction(
  projectId: string,
  formData: FormData
): Promise<GuestbookVisibilityState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = guestbookVisibilitySchema.safeParse({
    entryId: formData.get("entryId"),
    isHidden: formData.get("isHidden")
  });

  if (!parsed.success) {
    return {
      error: "방명록 항목을 찾을 수 없습니다."
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
      invitationProject: {
        select: {
          id: true,
          publicSlug: true
        }
      }
    }
  });

  if (!project?.invitationProject) {
    return {
      error: "모바일 청첩장 정보를 찾을 수 없습니다."
    };
  }

  const isHidden = parsed.data.isHidden === "true";

  await prisma.guestbook.updateMany({
    where: {
      id: parsed.data.entryId,
      invitationProjectId: project.invitationProject.id,
      deletedAt: null
    },
    data: {
      isHidden
    }
  });

  revalidatePath(`/dashboard/projects/${projectId}/invitation`);
  revalidatePath(`/i/${project.invitationProject.publicSlug}`);

  return {
    message: isHidden ? "방명록 메시지를 공개 화면에서 숨겼습니다." : "방명록 메시지를 다시 공개했습니다."
  };
}
