"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invitationConfigSchema, invitationGalleryItemSchema } from "@/lib/invitation/types";
import { updateInvitationProject } from "@/server/invitations/service";
import { z } from "zod";

const invitationFormSchema = z.object({
  title: z.string().min(1, "청첩장 제목을 입력해 주세요."),
  groomName: z.string().min(1, "신랑 이름을 입력해 주세요."),
  brideName: z.string().min(1, "신부 이름을 입력해 주세요."),
  groomFatherName: z.string().optional(),
  groomMotherName: z.string().optional(),
  brideFatherName: z.string().optional(),
  brideMotherName: z.string().optional(),
  contactPhoneGroom: z.string().optional(),
  contactPhoneBride: z.string().optional(),
  eventDate: z.string().optional(),
  greeting: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueDetail: z.string().optional(),
  mapProvider: z.string().optional(),
  mapLat: z.string().optional(),
  mapLng: z.string().optional(),
  galleryJson: z.string().default("[]"),
  configJson: z.string().default("{}"),
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
    title: formData.get("title"),
    groomName: formData.get("groomName"),
    brideName: formData.get("brideName"),
    groomFatherName: formData.get("groomFatherName")?.toString(),
    groomMotherName: formData.get("groomMotherName")?.toString(),
    brideFatherName: formData.get("brideFatherName")?.toString(),
    brideMotherName: formData.get("brideMotherName")?.toString(),
    contactPhoneGroom: formData.get("contactPhoneGroom")?.toString(),
    contactPhoneBride: formData.get("contactPhoneBride")?.toString(),
    eventDate: formData.get("eventDate")?.toString(),
    greeting: formData.get("greeting")?.toString(),
    venueName: formData.get("venueName")?.toString(),
    venueAddress: formData.get("venueAddress")?.toString(),
    venueDetail: formData.get("venueDetail")?.toString(),
    mapProvider: formData.get("mapProvider")?.toString(),
    mapLat: formData.get("mapLat")?.toString(),
    mapLng: formData.get("mapLng")?.toString(),
    galleryJson: formData.get("galleryJson")?.toString(),
    configJson: formData.get("configJson")?.toString(),
    intent: formData.get("intent")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요."
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
    include: {
      invitationProject: true
    }
  });

  if (!project?.invitationProject) {
    return {
      error: "모바일 청첩장 프로젝트를 찾을 수 없습니다."
    };
  }

  let configJson: unknown;
  let galleryJson: unknown;

  try {
    configJson = JSON.parse(parsed.data.configJson);
    galleryJson = JSON.parse(parsed.data.galleryJson);
  } catch {
    return {
      error: "청첩장 설정 데이터가 올바르지 않습니다."
    };
  }

  const config = invitationConfigSchema.safeParse(configJson);
  const gallery = invitationGalleryItemSchema.array().safeParse(galleryJson);

  if (!config.success || !gallery.success) {
    return {
      error: "청첩장 설정을 다시 확인해 주세요."
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
    groomFatherName: parsed.data.groomFatherName,
    groomMotherName: parsed.data.groomMotherName,
    brideFatherName: parsed.data.brideFatherName,
    brideMotherName: parsed.data.brideMotherName,
    contactPhoneGroom: parsed.data.contactPhoneGroom,
    contactPhoneBride: parsed.data.contactPhoneBride,
    eventDate: eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : undefined,
    venueName: parsed.data.venueName,
    venueAddress: parsed.data.venueAddress,
    venueDetail: parsed.data.venueDetail,
    mapProvider: parsed.data.mapProvider,
    mapLat: parsed.data.mapLat,
    mapLng: parsed.data.mapLng,
    gallery: gallery.data,
    config: config.data
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}/invitation`);
  revalidatePath(`/dashboard/projects/${projectId}/invitation/preview`);
  revalidatePath(`/i/${project.invitationProject.publicSlug}`);

  return {
    message:
      parsed.data.intent === "publish"
        ? "청첩장을 공개했습니다."
        : "청첩장 초안을 저장했습니다."
  };
}
