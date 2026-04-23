import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SchedulePanel } from "@/components/project/schedule-panel";
import { getWeddingProjectDetail } from "@/server/projects/service";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { projectId } = await params;
  const project = await getWeddingProjectDetail(session.user.id, projectId);

  if (!project) {
    notFound();
  }

  const nextEvent = project.scheduleEvents.find((event) => !event.isCompleted) ?? null;
  const daysLeft = nextEvent ? getDaysDiff(nextEvent.startsAt) : null;

  return (
    <main className="min-h-screen bg-porcelain px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-ink/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm font-medium text-ink/55" href="/dashboard">
              대시보드로 돌아가기
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-rose">
              Wedding Work
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">{project.title}</h1>
            <p className="mt-3 text-base text-ink/60">
              {project.groomName} · {project.brideName}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="예식일"
              value={
                project.weddingDate
                  ? new Intl.DateTimeFormat("ko-KR", {
                      dateStyle: "long",
                      timeStyle: "short"
                    }).format(project.weddingDate)
                  : "아직 미정"
              }
            />
            <SummaryCard
              label="청첩장"
              value={project.invitationProject?.status === "PUBLISHED" ? "공개 중" : "준비 중"}
            />
            <SummaryCard
              label="가까운 일정"
              value={
                nextEvent
                  ? daysLeft !== null && daysLeft <= 3
                    ? `${nextEvent.title} · D-${daysLeft}`
                    : nextEvent.title
                  : "등록된 일정 없음"
              }
              accent={daysLeft !== null && daysLeft <= 3}
            />
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
          <aside className="grid gap-6">
            <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
                Work Overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">작업 관리</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div>
                  <dt className="text-ink/45">상태</dt>
                  <dd className="mt-1 font-medium text-ink">{project.status}</dd>
                </div>
                <div>
                  <dt className="text-ink/45">예식 장소</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {project.venueName ?? "아직 입력 전"}
                  </dd>
                  {project.venueAddress ? (
                    <p className="mt-1 text-ink/55">{project.venueAddress}</p>
                  ) : null}
                </div>
                <div>
                  <dt className="text-ink/45">최근 렌더링</dt>
                  <dd className="mt-1 font-medium text-ink">
                    {project.renderJobs[0]
                      ? `${project.renderJobs[0].status} · ${project.renderJobs[0].progress}%`
                      : "아직 없음"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 grid gap-2">
                <Link
                  className="rounded-md bg-ink px-4 py-3 text-center text-sm font-medium text-white"
                  href={`/dashboard/projects/${project.id}/invitation`}
                >
                  모바일 청첩장 편집
                </Link>
                <Link
                  className="rounded-md border border-ink/15 px-4 py-3 text-center text-sm font-medium text-ink"
                  href={`/dashboard/projects/${project.id}/video`}
                >
                  식전영상 편집
                </Link>
                <Link
                  className="rounded-md border border-ink/15 px-4 py-3 text-center text-sm font-medium text-ink"
                  href={
                    project.invitationProject?.status === "PUBLISHED"
                      ? `/i/${project.invitationProject.publicSlug}`
                      : `/dashboard/projects/${project.id}/invitation/preview`
                  }
                  target={project.invitationProject?.status === "PUBLISHED" ? "_blank" : undefined}
                >
                  {project.invitationProject?.status === "PUBLISHED"
                    ? "공개 청첩장 보기"
                    : "청첩장 미리보기"}
                </Link>
              </div>
            </section>

            {nextEvent && daysLeft !== null && daysLeft <= 7 ? (
              <section className="rounded-md border border-rose/20 bg-rose/5 p-5 text-ink shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
                  Upcoming Alert
                </p>
                <h2 className="mt-2 text-xl font-semibold">{nextEvent.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  {daysLeft === 0
                    ? "오늘 일정이 있습니다. 준비물을 한 번 더 확인해보세요."
                    : `${daysLeft}일 안에 다가오는 일정입니다. 미리 체크해두면 좋아요.`}
                </p>
              </section>
            ) : null}
          </aside>

          <SchedulePanel
            events={project.scheduleEvents.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              category: event.category,
              startsAt: event.startsAt,
              isAllDay: event.isAllDay,
              isCompleted: event.isCompleted
            }))}
            projectId={project.id}
          />
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-4 py-4 shadow-sm ${
        accent ? "border-rose/20 bg-rose/5" : "border-ink/10 bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-ink">{value}</p>
    </div>
  );
}

function getDaysDiff(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
