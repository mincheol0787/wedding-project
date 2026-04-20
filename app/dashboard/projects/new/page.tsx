import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewProjectForm } from "@/components/dashboard/new-project-form";

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-porcelain px-6 py-10">
      <section className="mx-auto max-w-2xl">
        <Link className="text-sm font-medium text-ink/55" href="/dashboard">
          대시보드로 돌아가기
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-rose">
          New Project
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">새 웨딩 프로젝트</h1>
        <p className="mt-4 leading-7 text-ink/65">
          기본 정보를 입력하면 모바일 청첩장과 식전영상 편집 공간이 함께 준비됩니다.
        </p>
        <NewProjectForm />
      </section>
    </main>
  );
}
