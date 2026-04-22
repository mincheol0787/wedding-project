import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppTopNav } from "@/components/layout/app-top-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <AppTopNav
        isAdmin={session.user.role === "ADMIN"}
        userName={session.user.name ?? session.user.email}
      />
      {children}
    </>
  );
}
