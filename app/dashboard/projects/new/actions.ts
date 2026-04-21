"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createWeddingProject } from "@/server/projects/service";
import { z } from "zod";

const createProjectSchema = z.object({
  title: z.string().min(1, "프로젝트 이름을 입력해 주세요."),
  groomName: z.string().min(1, "신랑 이름을 입력해 주세요."),
  brideName: z.string().min(1, "신부 이름을 입력해 주세요."),
  weddingDate: z.string().optional()
});

export type CreateProjectState = {
  error?: string;
};

export async function createProjectAction(
  _: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    groomName: formData.get("groomName"),
    brideName: formData.get("brideName"),
    weddingDate: formData.get("weddingDate")?.toString()
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요."
    };
  }

  const weddingDate = parsed.data.weddingDate ? new Date(parsed.data.weddingDate) : undefined;

  await createWeddingProject({
    ownerId: session.user.id,
    title: parsed.data.title,
    groomName: parsed.data.groomName,
    brideName: parsed.data.brideName,
    weddingDate: weddingDate && !Number.isNaN(weddingDate.getTime()) ? weddingDate : undefined
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
