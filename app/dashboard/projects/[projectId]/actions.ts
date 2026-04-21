"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createProjectScheduleEvent,
  toggleProjectScheduleEvent
} from "@/server/projects/service";
import { z } from "zod";

const createScheduleSchema = z.object({
  title: z.string().trim().min(1, "일정 제목을 입력해주세요."),
  description: z.string().trim().optional(),
  category: z.enum([
    "MEETING",
    "VENUE",
    "STUDIO",
    "DRESS",
    "MAKEUP",
    "INVITATION",
    "VIDEO",
    "PAYMENT",
    "TODO"
  ]),
  date: z.string().min(1, "날짜를 선택해주세요."),
  time: z.string().optional(),
  isAllDay: z.boolean().default(false)
});

const toggleScheduleSchema = z.object({
  eventId: z.string().min(1),
  isCompleted: z.boolean()
});

export type ScheduleActionState = {
  error?: string;
  message?: string;
};

export async function createProjectScheduleEventAction(
  projectId: string,
  _: ScheduleActionState,
  formData: FormData
): Promise<ScheduleActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = createScheduleSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    date: formData.get("date"),
    time: formData.get("time"),
    isAllDay: formData.get("isAllDay") === "true"
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "일정 정보를 다시 확인해주세요."
    };
  }

  const startsAt = buildScheduleStartDate(parsed.data.date, parsed.data.time, parsed.data.isAllDay);

  if (!startsAt) {
    return {
      error: "날짜 또는 시간을 해석할 수 없습니다."
    };
  }

  await createProjectScheduleEvent({
    userId: session.user.id,
    projectId,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    startsAt,
    isAllDay: parsed.data.isAllDay
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);

  return {
    message: "새 일정을 추가했습니다."
  };
}

export async function toggleProjectScheduleEventAction(
  projectId: string,
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = toggleScheduleSchema.safeParse({
    eventId: formData.get("eventId"),
    isCompleted: formData.get("isCompleted") === "true"
  });

  if (!parsed.success) {
    return;
  }

  await toggleProjectScheduleEvent(
    session.user.id,
    projectId,
    parsed.data.eventId,
    parsed.data.isCompleted
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
}

function buildScheduleStartDate(date: string, time: string | undefined, isAllDay: boolean) {
  const iso = isAllDay || !time ? `${date}T09:00` : `${date}T${time}`;
  const value = new Date(iso);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
}
