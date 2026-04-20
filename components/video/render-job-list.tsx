type RenderJobListProps = {
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

export function RenderJobList({ jobs }: RenderJobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white p-6 text-sm text-ink/55">
        아직 렌더링 요청이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {jobs.map((job) => (
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
          {job.outputAsset?.url ? (
            <a className="mt-3 inline-flex text-sm font-medium text-sage" href={job.outputAsset.url}>
              결과 영상 열기
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
