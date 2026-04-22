"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const supportInquirySchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  email: z.string().email("이메일 형식을 확인해 주세요."),
  category: z.string().min(1, "문의 유형을 선택해 주세요."),
  subject: z.string().min(2, "제목을 입력해 주세요."),
  message: z.string().min(10, "문의 내용을 10자 이상 입력해 주세요.")
});

export type SupportInquiryState = {
  error?: string;
  message?: string;
};

export async function createSupportInquiryAction(
  _: SupportInquiryState,
  formData: FormData
): Promise<SupportInquiryState> {
  const parsed = supportInquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    category: formData.get("category"),
    subject: formData.get("subject"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "문의 내용을 다시 확인해 주세요."
    };
  }

  const session = await auth();

  await prisma.supportInquiry.create({
    data: {
      userId: session?.user?.id,
      name: parsed.data.name,
      email: parsed.data.email,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message
    }
  });

  return {
    message: "문의가 접수되었습니다. 확인 후 순서대로 답변드릴게요."
  };
}
