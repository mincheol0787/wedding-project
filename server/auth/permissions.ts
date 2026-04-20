import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
