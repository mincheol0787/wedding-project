import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppTopNav } from "@/components/layout/app-top-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <>
      <AppTopNav isAdmin userName={session.user.name ?? session.user.email} />
      {children}
    </>
  );
}
