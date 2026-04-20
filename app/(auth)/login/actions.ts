"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/server/auth/password";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.")
});

const registerSchema = loginSchema.extend({
  name: z.string().min(1, "이름을 입력해 주세요.")
});

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요."
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsed.data.email
    }
  });

  if (existingUser) {
    return {
      error: "이미 가입된 이메일입니다."
    };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password)
    }
  });

  return {
    success: "가입이 완료되었습니다. 왼쪽 로그인 폼으로 시작해 주세요."
  };
}
