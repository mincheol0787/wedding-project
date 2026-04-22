"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createProjectScheduleEvent,
  deleteProjectScheduleEvent,
  updateProjectScheduleEvent,
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

const updateScheduleSchema = createScheduleSchema.extend({
  eventId: z.string().min(1),
  isCompleted: z.boolean()
});

const deleteScheduleSchema = z.object({
  eventId: z.string().min(1)
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

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateProjectScheduleEventAction(
  projectId: string,
  _: ScheduleActionState,
  formData: FormData
): Promise<ScheduleActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = updateScheduleSchema.safeParse({
    eventId: formData.get("eventId"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    date: formData.get("date"),
    time: formData.get("time"),
    isAllDay: formData.get("isAllDay") === "true",
    isCompleted: formData.get("isCompleted") === "true"
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

  const updated = await updateProjectScheduleEvent({
    userId: session.user.id,
    projectId,
    eventId: parsed.data.eventId,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    startsAt,
    isAllDay: parsed.data.isAllDay,
    isCompleted: parsed.data.isCompleted
  });

  if (!updated) {
    return {
      error: "수정할 일정을 찾을 수 없습니다."
    };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);

  return {
    message: "일정을 수정했습니다."
  };
}

export async function deleteProjectScheduleEventAction(
  projectId: string,
  _: ScheduleActionState,
  formData: FormData
): Promise<ScheduleActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = deleteScheduleSchema.safeParse({
    eventId: formData.get("eventId")
  });

  if (!parsed.success) {
    return {
      error: "삭제할 일정을 찾을 수 없습니다."
    };
  }

  const deleted = await deleteProjectScheduleEvent(session.user.id, projectId, parsed.data.eventId);

  if (!deleted) {
    return {
      error: "삭제할 일정을 찾을 수 없습니다."
    };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);

  return {
    message: "일정을 삭제했습니다."
  };
}

function buildScheduleStartDate(date: string, time: string | undefined, isAllDay: boolean) {
  const iso = isAllDay || !time ? `${date}T09:00` : `${date}T${time}`;
  const value = new Date(iso);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value;
}
