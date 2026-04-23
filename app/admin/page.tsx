import Link from "next/link";
import { requireAdminUser } from "@/server/auth/permissions";
import { getAdminDashboardData } from "@/server/admin/service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdminUser();
  const data = await getAdminDashboardData();

  return (
    <main className="min-h-screen bg-porcelain px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link className="text-sm font-medium text-ink/55" href="/dashboard">
              대시보드로 돌아가기
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-rose">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">관리자 페이지</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65">
              사용자, 제작 작업, 영상 제작 작업, 템플릿과 기본 통계를 확인합니다.
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-white px-5 py-4 text-sm text-ink/65">
            <p className="text-ink">관리자 계정</p>
            <p className="mt-1 font-medium text-rose">{admin.email}</p>
            <Link className="mt-3 inline-flex font-medium text-sage" href="/admin/changelog">
              변경 이력 보기
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-5">
          <StatCard label="사용자" value={data.stats.userCount} sub={`${data.stats.adminCount} admin`} />
          <StatCard
            label="작업"
            value={data.stats.projectCount}
            sub={`${data.stats.publishedInvitationCount} published`}
          />
          <StatCard
            label="영상 제작 작업"
            value={data.stats.renderJobCount}
            sub={`실패 ${data.stats.failedRenderJobCount}건`}
          />
          <StatCard
            label="템플릿"
            value={data.stats.templateCount}
            sub={`${data.stats.activeTemplateCount} active`}
          />
          <StatCard
            label="고객 문의"
            value={data.stats.supportInquiryCount}
            sub={`${data.stats.openSupportInquiryCount} open`}
          />
        </section>

        <section className="mt-8 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-ink">영상 제작 상태 요약</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.stats.renderJobsByStatus.length > 0 ? (
              data.stats.renderJobsByStatus.map((item) => (
                <span
                  className="rounded-md bg-porcelain px-3 py-2 text-sm font-medium text-ink"
                  key={item.status}
                >
                  {item.status}: {item.count}
                </span>
              ))
            ) : (
              <p className="text-sm text-ink/55">아직 영상 제작 작업이 없습니다.</p>
            )}
          </div>
        </section>

        <AdminSection title="고객센터 문의">
          <div className="grid gap-3">
            {data.supportInquiries.map((inquiry) => (
              <article className="rounded-md border border-ink/10 bg-porcelain/60 p-4" key={inquiry.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-ink">{inquiry.subject}</p>
                    <p className="mt-1 text-sm text-ink/55">
                      {inquiry.name} · {inquiry.email} · {inquiry.category}
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-white px-3 py-1 text-xs font-medium text-rose">
                    {inquiry.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-ink/65">
                  {inquiry.message}
                </p>
                <p className="mt-3 text-xs text-ink/45">{formatDate(inquiry.createdAt)}</p>
              </article>
            ))}
            {data.supportInquiries.length === 0 ? <EmptyText text="접수된 문의가 없습니다." /> : null}
          </div>
        </AdminSection>

        <AdminSection title="사용자 목록">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-ink/45">
                  <th className="py-3 pr-4 font-medium">이메일</th>
                  <th className="py-3 pr-4 font-medium">이름</th>
                  <th className="py-3 pr-4 font-medium">권한</th>
                  <th className="py-3 pr-4 font-medium">작업</th>
                  <th className="py-3 pr-4 font-medium">영상 제작</th>
                  <th className="py-3 pr-4 font-medium">가입일</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr className="border-b border-ink/5" key={user.id}>
                    <td className="py-3 pr-4 font-medium text-ink">{user.email}</td>
                    <td className="py-3 pr-4 text-ink/65">{user.name ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="py-3 pr-4 text-ink/65">{user._count.projects}</td>
                    <td className="py-3 pr-4 text-ink/65">{user._count.renderJobs}</td>
                    <td className="py-3 pr-4 text-ink/65">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSection>

        <AdminSection title="작업 목록">
          <div className="grid gap-3">
            {data.projects.map((project) => (
              <article className="rounded-md border border-ink/10 bg-porcelain/60 p-4" key={project.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-ink">{project.title}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {project.groomName} & {project.brideName}
                    </p>
                    <p className="mt-1 text-sm text-ink/50">
                      소유자: {project.owner.name ?? project.owner.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md bg-white px-3 py-1 text-xs font-medium text-ink">
                      {project.status}
                    </span>
                    <span className="rounded-md bg-white px-3 py-1 text-xs font-medium text-sage">
                      청첩장 {project.invitationProject?.status ?? "-"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-ink/60 md:grid-cols-4">
                  <p>예식일: {project.weddingDate ? formatDate(project.weddingDate) : "미정"}</p>
                  <p>미디어: {project._count.mediaAssets}</p>
                  <p>영상 제작: {project._count.renderJobs}</p>
                  <p>생성일: {formatDate(project.createdAt)}</p>
                </div>
              </article>
            ))}
            {data.projects.length === 0 ? <EmptyText text="작업이 없습니다." /> : null}
          </div>
        </AdminSection>

        <AdminSection title="영상 제작 작업 목록">
          <div className="grid gap-3">
            {data.renderJobs.map((job) => (
              <article className="rounded-md border border-ink/10 bg-porcelain/60 p-4" key={job.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{job.weddingProject.title}</p>
                    <p className="mt-1 text-sm text-ink/55">
                      요청자: {job.user.name ?? job.user.email}
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-white px-3 py-1 text-xs font-medium text-rose">
                    {job.status}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full bg-rose" style={{ width: `${job.progress}%` }} />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-ink/60 md:grid-cols-4">
                  <p>진행률: {job.progress}%</p>
                  <p>
                    재시도: {job.attempts}/{job.maxAttempts}
                  </p>
                  <p>생성일: {formatDate(job.createdAt)}</p>
                  <p>완료일: {job.finishedAt ? formatDate(job.finishedAt) : "-"}</p>
                </div>
                {job.errorMessage ? <p className="mt-3 text-sm text-rose">{job.errorMessage}</p> : null}
                {job.outputAsset?.url ? (
                  <a className="mt-3 inline-flex text-sm font-medium text-sage" href={job.outputAsset.url}>
                    {job.outputAsset.fileName}
                  </a>
                ) : null}
              </article>
            ))}
            {data.renderJobs.length === 0 ? <EmptyText text="영상 제작 작업이 없습니다." /> : null}
          </div>
        </AdminSection>

        <AdminSection title="템플릿 목록">
          <div className="grid gap-3 md:grid-cols-2">
            {data.templates.map((template) => (
              <article className="rounded-md border border-ink/10 bg-porcelain/60 p-4" key={template.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{template.name}</p>
                    <p className="mt-1 text-sm text-ink/55">{template.key}</p>
                  </div>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-medium text-ink">
                    {template.isActive ? "활성" : "비활성"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-white px-3 py-1 text-rose">{template.type}</span>
                  <span className="rounded-md bg-white px-3 py-1 text-sage">{template.tier}</span>
                  <span className="rounded-md bg-white px-3 py-1 text-ink/60">
                    order {template.sortOrder}
                  </span>
                </div>
              </article>
            ))}
            {data.templates.length === 0 ? <EmptyText text="등록된 템플릿이 없습니다." /> : null}
          </div>
        </AdminSection>
      </section>
    </main>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <article className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-ink/55">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value.toLocaleString("ko-KR")}</p>
      <p className="mt-2 text-sm text-rose">{sub}</p>
    </article>
  );
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`rounded-md px-3 py-1 text-xs font-medium ${
        role === "ADMIN" ? "bg-rose/10 text-rose" : "bg-porcelain text-ink/65"
      }`}
    >
      {role}
    </span>
  );
}

function EmptyText({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed border-ink/20 p-6 text-sm text-ink/55">{text}</p>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
