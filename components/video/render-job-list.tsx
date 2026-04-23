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
  CANCELED: "제작 취소됨",
  FAILED: "제작 실패",
  PROCESSING: "영상 제작 중",
  QUEUED: "제작 준비 중",
  SUCCEEDED: "제작 완료"
};

const statusHelp: Record<string, string> = {
  CANCELED: "요청이 취소되었습니다. 필요하면 다시 만들 수 있어요.",
  FAILED: "제작 중 문제가 발생했습니다. 내용을 확인한 뒤 다시 시도해 주세요.",
  PROCESSING: "사진과 문구를 영상으로 만드는 중입니다.",
  QUEUED: "제작 순서를 기다리고 있습니다.",
  SUCCEEDED: "영상이 완성되었습니다. 결과 영상을 확인해 보세요."
};

export function RenderJobList({ jobs, projectId }: RenderJobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white p-6 text-sm text-ink/55">
        아직 영상 제작 요청이 없습니다.
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
                <p className="mt-1 text-xs leading-5 text-ink/45">
                  {statusHelp[job.status] ?? "영상 제작 상태를 확인하고 있습니다."}
                </p>
                <p className="mt-2 text-xs text-ink/45">
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(job.createdAt)}
                </p>
              </div>
              <p className="rounded-md bg-porcelain px-3 py-2 text-sm font-medium text-ink">
                {job.progress}%
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-porcelain">
              <div
                className="h-full bg-rose transition-all"
                style={{
                  width: `${job.progress}%`
                }}
              />
            </div>
            {job.errorMessage ? <p className="mt-3 text-sm text-rose">{job.errorMessage}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {job.outputAsset?.url ? (
                <a
                  className="rounded-md border border-sage/30 px-3 py-2 text-sm font-medium text-sage"
                  href={job.outputAsset.url}
                >
                  완성 영상 열기
                </a>
              ) : null}
              {canCancel ? (
                <form action={cancelRenderJobAction.bind(null, projectId)}>
                  <input name="renderJobId" type="hidden" value={job.id} />
                  <button
                    className="rounded-md border border-rose/30 px-3 py-2 text-sm font-medium text-rose"
                    type="submit"
                  >
                    제작 취소
                  </button>
                </form>
              ) : null}
              {canRetry ? (
                <form action={retryRenderJobAction.bind(null, projectId)}>
                  <input name="renderJobId" type="hidden" value={job.id} />
                  <button
                    className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink"
                    type="submit"
                  >
                    다시 만들기
                  </button>
                </form>
              ) : null}
              <form action={deleteRenderJobAction.bind(null, projectId)}>
                <input name="renderJobId" type="hidden" value={job.id} />
                <button
                  className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink/55"
                  type="submit"
                >
                  목록에서 삭제
                </button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
