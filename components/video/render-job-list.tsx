import {
  cancelRenderJobAction,
  deleteRenderJobAction,
  retryRenderJobAction
} from "@/app/dashboard/projects/[projectId]/video/actions";

type RenderJobListProps = {
  projectId: string;
  jobs: Array<{
    id: string;
    status: string;
    progress: number;
    attempts: number;
    maxAttempts: number;
    errorMessage: string | null;
    createdAt: Date;
    outputAsset: {
      url: string | null;
      fileName: string;
    } | null;
  }>;
};

const statusLabel: Record<string, string> = {
  CANCELED: "취소됨",
  FAILED: "실패",
  PROCESSING: "렌더링 중",
  QUEUED: "대기 중",
  SUCCEEDED: "완료"
};

export function RenderJobList({ jobs, projectId }: RenderJobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white p-6 text-sm text-ink/55">
        아직 렌더링 요청이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {jobs.map((job) => {
        const canCancel = job.status === "QUEUED" || job.status === "PROCESSING";
        const canRetry = job.status === "FAILED" || job.status === "CANCELED";

        return (
        <article className="rounded-md border border-ink/10 bg-white p-4" key={job.id}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{statusLabel[job.status] ?? job.status}</p>
              <p className="mt-1 text-xs text-ink/45">
                {new Intl.DateTimeFormat("ko-KR", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(job.createdAt)}
              </p>
            </div>
            <p className="text-sm text-ink/55">
              {job.attempts}/{job.maxAttempts} attempts
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-porcelain">
            <div
              className="h-full bg-rose"
              style={{
                width: `${job.progress}%`
              }}
            />
          </div>
          {job.errorMessage ? <p className="mt-3 text-sm text-rose">{job.errorMessage}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {job.outputAsset?.url ? (
              <a className="rounded-md border border-sage/30 px-3 py-2 text-sm font-medium text-sage" href={job.outputAsset.url}>
                결과 영상 열기
              </a>
            ) : null}
            {canCancel ? (
              <form action={cancelRenderJobAction.bind(null, projectId)}>
                <input name="renderJobId" type="hidden" value={job.id} />
                <button className="rounded-md border border-rose/30 px-3 py-2 text-sm font-medium text-rose" type="submit">
                  렌더링 취소
                </button>
              </form>
            ) : null}
            {canRetry ? (
              <form action={retryRenderJobAction.bind(null, projectId)}>
                <input name="renderJobId" type="hidden" value={job.id} />
                <button className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink" type="submit">
                  다시 렌더링
                </button>
              </form>
            ) : null}
            <form action={deleteRenderJobAction.bind(null, projectId)}>
              <input name="renderJobId" type="hidden" value={job.id} />
              <button className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink/55" type="submit">
                삭제
              </button>
            </form>
          </div>
        </article>
        );
      })}
    </div>
  );
}
