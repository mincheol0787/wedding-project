"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  bankAccountSchema,
  invitationGalleryItemSchema,
  invitationTemplateIds
} from "@/lib/invitation/types";
import { updateInvitationProject } from "@/server/invitations/service";
import { z } from "zod";

const invitationFormSchema = z.object({
  templateId: z.enum(invitationTemplateIds),
  title: z.string().min(1, "청첩장 제목을 입력해 주세요."),
  groomName: z.string().min(1, "신랑 이름을 입력해 주세요."),
  brideName: z.string().min(1, "신부 이름을 입력해 주세요."),
  eventDate: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueDetail: z.string().optional(),
  greeting: z.string().optional(),
  mapProvider: z.string().optional(),
  mapLat: z.string().optional(),
  mapLng: z.string().optional(),
  galleryJson: z.string().default("[]"),
  bankAccountsJson: z.string().default("[]"),
  intent: z.enum(["draft", "publish"])
});

export type InvitationSaveState = {
  error?: string;
  message?: string;
};

export async function saveInvitationAction(
  projectId: string,
  _: InvitationSaveState,
  formData: FormData
): Promise<InvitationSaveState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = invitationFormSchema.safeParse({
    templateId: formData.get("templateId"),
    title: formData.get("title"),
    groomName: formData.get("groomName"),
    brideName: formData.get("brideName"),
    eventDate: formData.get("eventDate")?.toString(),
    venueName: formData.get("venueName")?.toString(),
    venueAddress: formData.get("venueAddress")?.toString(),
    venueDetail: formData.get("venueDetail")?.toString(),
    greeting: formData.get("greeting")?.toString(),
    mapProvider: formData.get("mapProvider")?.toString(),
    mapLat: formData.get("mapLat")?.toString(),
    mapLng: formData.get("mapLng")?.toString(),
    galleryJson: formData.get("galleryJson")?.toString(),
    bankAccountsJson: formData.get("bankAccountsJson")?.toString(),
    intent: formData.get("intent")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요."
    };
  }

  const project = await prisma.weddingProject.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        {
          ownerId: session.user.id
        },
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
    include: {
      invitationProject: true
    }
  });

  if (!project?.invitationProject) {
    return {
      error: "모바일 청첩장 프로젝트를 찾을 수 없습니다."
    };
  }

  let galleryJson: unknown;
  let bankAccountsJson: unknown;

  try {
    galleryJson = JSON.parse(parsed.data.galleryJson);
    bankAccountsJson = JSON.parse(parsed.data.bankAccountsJson);
  } catch {
    return {
      error: "갤러리 또는 계좌 JSON을 읽을 수 없습니다."
    };
  }

  const gallery = invitationGalleryItemSchema.array().safeParse(galleryJson);
  const bankAccounts = bankAccountSchema.array().safeParse(bankAccountsJson);

  if (!gallery.success || !bankAccounts.success) {
    return {
      error: "갤러리 또는 계좌 정보가 올바르지 않습니다."
    };
  }

  const eventDate = parsed.data.eventDate ? new Date(parsed.data.eventDate) : undefined;

  await updateInvitationProject({
    invitationProjectId: project.invitationProject.id,
    status: parsed.data.intent === "publish" ? "PUBLISHED" : "DRAFT",
    title: parsed.data.title,
    greeting: parsed.data.greeting,
    groomName: parsed.data.groomName,
    brideName: parsed.data.brideName,
    eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : undefined,
    venueName: parsed.data.venueName,
    venueAddress: parsed.data.venueAddress,
    venueDetail: parsed.data.venueDetail,
    mapProvider: parsed.data.mapProvider,
    mapLat: parsed.data.mapLat,
    mapLng: parsed.data.mapLng,
    gallery: gallery.data,
    config: {
      templateId: parsed.data.templateId,
      bankAccounts: bankAccounts.data
    }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}/invitation`);
  revalidatePath(`/i/${project.invitationProject.publicSlug}`);

  return {
    message: parsed.data.intent === "publish" ? "청첩장을 공개했습니다." : "청첩장을 저장했습니다."
  };
}
