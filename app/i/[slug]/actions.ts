"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rsvpSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  phone: z.string().optional(),
  side: z.enum(["GROOM", "BRIDE", "BOTH", "UNKNOWN"]),
  attendance: z.enum(["ATTENDING", "NOT_ATTENDING", "UNDECIDED"]),
  guestCount: z.coerce.number().int().min(1).max(10),
  mealOption: z.string().optional(),
  message: z.string().optional(),
  privacyConsent: z.literal("on")
});

const guestbookSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  message: z.string().min(1, "메시지를 입력해 주세요."),
  isPrivate: z.string().optional()
});

export type PublicFormState = {
  error?: string;
  message?: string;
};

export async function submitRsvpAction(
  slug: string,
  _: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const invitation = await prisma.invitationProject.findFirst({
    where: {
      publicSlug: slug,
      status: "PUBLISHED",
      deletedAt: null
    }
  });

  if (!invitation) {
    return {
      error: "청첩장을 찾을 수 없습니다."
    };
  }

  const parsed = rsvpSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone")?.toString(),
    side: formData.get("side"),
    attendance: formData.get("attendance"),
    guestCount: formData.get("guestCount"),
    mealOption: formData.get("mealOption")?.toString(),
    message: formData.get("message")?.toString(),
    privacyConsent: formData.get("privacyConsent")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요."
    };
  }

  await prisma.rSVP.create({
    data: {
      invitationProjectId: invitation.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      side: parsed.data.side,
      attendance: parsed.data.attendance,
      guestCount: parsed.data.guestCount,
      mealOption: parsed.data.mealOption,
      message: parsed.data.message,
      privacyConsent: true
    }
  });

  revalidatePath(`/i/${slug}`);

  return {
    message: "참석 여부를 전달했습니다."
  };
}

export async function submitGuestbookAction(
  slug: string,
  _: PublicFormState,
  formData: FormData
): Promise<PublicFormState> {
  const invitation = await prisma.invitationProject.findFirst({
    where: {
      publicSlug: slug,
      status: "PUBLISHED",
      deletedAt: null
    }
  });

  if (!invitation) {
    return {
      error: "청첩장을 찾을 수 없습니다."
    };
  }

  const parsed = guestbookSchema.safeParse({
    name: formData.get("name"),
    message: formData.get("message"),
    isPrivate: formData.get("isPrivate")?.toString()
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요."
    };
  }

  await prisma.guestbook.create({
    data: {
      invitationProjectId: invitation.id,
      name: parsed.data.name,
      message: parsed.data.message,
      isPrivate: parsed.data.isPrivate === "on"
    }
  });

  revalidatePath(`/i/${slug}`);

  return {
    message: "축하 메시지가 등록되었습니다."
  };
}
