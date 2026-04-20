import Link from "next/link";

type ProjectStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "DELETED";
type InvitationStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

type ProjectCardProps = {
  id: string;
  title: string;
  groomName: string;
  brideName: string;
  weddingDate: Date | null;
  status: ProjectStatus;
  invitation: {
    publicSlug: string;
    status: InvitationStatus;
  } | null;
  mediaCount: number;
  renderJobCount: number;
  latestRenderJob?: {
    id: string;
    status: string;
    progress: number;
    errorMessage: string | null;
    createdAt: Date;
  };
};

const projectStatusLabel: Record<ProjectStatus, string> = {
  ACTIVE: "진행 중",
  ARCHIVED: "보관됨",
  DELETED: "삭제됨",
  DRAFT: "작성 중"
};

const invitationStatusLabel: Record<InvitationStatus, string> = {
  ARCHIVED: "보관됨",
  DRAFT: "비공개",
  PUBLISHED: "공개 중",
  UNPUBLISHED: "비공개"
};

export function ProjectCard({
  id,
  title,
  groomName,
  brideName,
  weddingDate,
  status,
  invitation,
  mediaCount,
  renderJobCount,
  latestRenderJob
}: ProjectCardProps) {
  const formattedDate = weddingDate
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "long",
        timeStyle: "short"
      }).format(weddingDate)
    : "예식일 미정";

  return (
    <article className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose">
            {projectStatusLabel[status]}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">{title}</h2>
          <p className="mt-2 text-sm text-ink/60">
            {groomName} & {brideName}
          </p>
        </div>
        {invitation ? (
          <span className="rounded-md bg-porcelain px-3 py-1 text-xs font-medium text-sage">
            청첩장 {invitationStatusLabel[invitation.status]}
          </span>
        ) : null}
      </div>

      <dl className="mt-6 grid gap-3 border-y border-ink/10 py-4 text-sm md:grid-cols-3">
        <div>
          <dt className="text-ink/45">예식일</dt>
          <dd className="mt-1 font-medium text-ink">{formattedDate}</dd>
        </div>
        <div>
          <dt className="text-ink/45">미디어</dt>
          <dd className="mt-1 font-medium text-ink">{mediaCount}개</dd>
        </div>
        <div>
          <dt className="text-ink/45">렌더링</dt>
          <dd className="mt-1 font-medium text-ink">{renderJobCount}건</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" href="#">
          프로젝트 열기
        </Link>
        <Link
          className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
          href={`/dashboard/projects/${id}/invitation`}
        >
          청첩장 편집
        </Link>
        {invitation ? (
          <Link
            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
            href={`/i/${invitation.publicSlug}`}
          >
            공개 페이지
          </Link>
        ) : null}
        <Link
          className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
          href={`/dashboard/projects/${id}/video`}
        >
          영상 편집
        </Link>
      </div>
      {latestRenderJob ? (
        <div className="mt-5 rounded-md bg-porcelain p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-ink">최근 렌더링: {latestRenderJob.status}</span>
            <span className="text-ink/55">{latestRenderJob.progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full bg-rose" style={{ width: `${latestRenderJob.progress}%` }} />
          </div>
          {latestRenderJob.errorMessage ? (
            <p className="mt-2 text-xs text-rose">{latestRenderJob.errorMessage}</p>
          ) : null}
        </div>
      ) : null}
      <p className="mt-4 text-xs text-ink/35">Project ID: {id}</p>
    </article>
  );
}
