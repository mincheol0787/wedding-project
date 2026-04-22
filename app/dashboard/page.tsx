import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { FastLink } from "@/components/ui/fast-link";
import { getWeddingProjectsByUserId } from "@/server/projects/service";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await getWeddingProjectsByUserId(session.user.id);

  return (
    <main className="min-h-screen bg-porcelain px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
              Wedding Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">우리의 웨딩 프로젝트</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65">
              모바일 청첩장, RSVP, 방명록, 식전영상과 일정 관리를 한 흐름으로 이어서 준비할 수 있어요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FastLink
              href="/dashboard/projects/new"
              className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              새 프로젝트 만들기
            </FastLink>
            <SignOutButton />
          </div>
        </header>

        <div className="mt-8 rounded-md border border-ink/10 bg-white/70 p-5">
          <p className="text-sm text-ink/55">로그인 계정</p>
          <p className="mt-1 font-medium text-ink">{session.user.email}</p>
        </div>

        {projects.length > 0 ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                groomName={project.groomName}
                brideName={project.brideName}
                weddingDate={project.weddingDate}
                status={project.status}
                invitation={project.invitationProject}
                mediaCount={project._count.mediaAssets}
                renderJobCount={project._count.renderJobs}
                latestRenderJob={project.renderJobs[0]}
              />
            ))}
          </div>
        ) : (
          <section className="mt-8 rounded-md border border-dashed border-ink/20 bg-white p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">
              First Project
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">아직 만든 프로젝트가 없어요</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-ink/60">
              커플 이름과 예식일만 입력하면 청첩장과 식전영상 작업 공간이 함께 생성됩니다.
            </p>
            <FastLink
              href="/dashboard/projects/new"
              className="mt-7 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              첫 프로젝트 만들기
            </FastLink>
          </section>
        )}
      </section>
    </main>
  );
}
