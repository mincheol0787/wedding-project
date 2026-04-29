"use client";

import { useState, useTransition } from "react";
import {
  cancelRenderJobAction,
  deleteRenderJobAction,
  retryRenderJobAction
} from "@/app/dashboard/projects/[projectId]/video/actions";
import type { VideoRenderJobItem } from "@/components/video/types";

type RenderJobListProps = {
  projectId: string;
  jobs: VideoRenderJobItem[];
  statusError?: string;
  onJobsChanged?: () => void;
};

const statusLabel: Record<string, string> = {
  CANCELED: "제작 취소됨",
  FAILED: "제작 실패",
  PROCESSING: "영상 제작 중",
  QUEUED: "제작 대기 중",
  SUCCEEDED: "제작 완료"
};

const statusHelp: Record<string, string> = {
  CANCELED: "사용자가 제작을 멈춘 상태예요. 필요하면 다시 시작할 수 있어요.",
  FAILED: "제작 중 문제가 생겼어요. 내용을 확인한 뒤 다시 시도해주세요.",
  PROCESSING: "사진과 자막을 엮어서 영상을 만들고 있어요.",
  QUEUED: "영상 제작 요청이 접수됐어요. 제작 작업자가 순서대로 이어서 처리합니다.",
  SUCCEEDED: "완성된 영상을 바로 확인할 수 있어요."
};

export function RenderJobList({ jobs, projectId, statusError, onJobsChanged }: RenderJobListProps) {
  const [pending, startTransition] = useTransition();
  const [activeJobId, setActiveJobId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  async function runJobAction(
    renderJobId: string,
    action: (projectId: string, formData: FormData) => Promise<{ error?: string; message?: string }>,
    successMessage: string
  ) {
    startTransition(async () => {
      setActiveJobId(renderJobId);
      setError(undefined);
      setMessage(undefined);

      try {
        const formData = new FormData();
        formData.set("renderJobId", renderJobId);

        const result = await action(projectId, formData);

        if (result.error) {
          setError(result.error);
          return;
        }

        setMessage(result.message ?? successMessage);
        onJobsChanged?.();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "영상 제작 상태를 바꾸는 중 문제가 발생했습니다."
        );
      } finally {
        setActiveJobId(undefined);
      }
    });
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/20 bg-white p-6 text-sm text-ink/55">
        아직 요청한 영상 제작이 없어요.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {statusError ? <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{statusError}</p> : null}
      {message ? <p className="rounded-md bg-sage/10 px-3 py-2 text-sm text-sage">{message}</p> : null}
      {error ? <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}

      {jobs.map((job) => {
        const canCancel = job.status === "QUEUED" || job.status === "PROCESSING";
        const canRetry = job.status === "FAILED" || job.status === "CANCELED";
        const isBusy = pending && activeJobId === job.id;

        return (
          <article className="rounded-md border border-ink/10 bg-white p-4" key={job.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">{statusLabel[job.status] ?? job.status}</p>
                <p className="mt-1 text-xs leading-5 text-ink/45">
                  {statusHelp[job.status] ?? "영상 제작 상태를 확인하고 있어요."}
                </p>
                <p className="mt-2 text-xs text-ink/45">{formatJobDate(job.createdAt)}</p>
                {job.attempts > 0 ? (
                  <p className="mt-1 text-xs text-ink/40">
                    시도 {job.attempts}/{job.maxAttempts}
                  </p>
                ) : null}
              </div>
              <div className="rounded-md bg-porcelain px-3 py-2 text-right text-sm font-medium text-ink">
                <div>{job.progress}%</div>
                <div className="mt-1 text-[11px] font-normal text-ink/45">{statusLabel[job.status] ?? job.status}</div>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-porcelain">
              <div className="h-full bg-rose transition-all" style={{ width: `${job.progress}%` }} />
            </div>

            {job.errorMessage ? <p className="mt-3 text-sm text-rose">{job.errorMessage}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {job.outputAsset?.url ? (
                <a
                  className="rounded-md border border-sage/30 px-3 py-2 text-sm font-medium text-sage"
                  href={job.outputAsset.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  완성 영상 보기
                </a>
              ) : null}

              {canCancel ? (
                <button
                  className="rounded-md border border-rose/30 px-3 py-2 text-sm font-medium text-rose disabled:opacity-45"
                  disabled={isBusy}
                  onClick={() =>
                    runJobAction(job.id, cancelRenderJobAction, "영상 제작을 멈췄어요. 다시 시작할 수도 있어요.")
                  }
                  type="button"
                >
                  {isBusy ? "처리 중..." : "제작 멈추기"}
                </button>
              ) : null}

              {canRetry ? (
                <button
                  className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink disabled:opacity-45"
                  disabled={isBusy}
                  onClick={() =>
                    runJobAction(job.id, retryRenderJobAction, "영상 제작을 다시 시작했어요.")
                  }
                  type="button"
                >
                  {isBusy ? "처리 중..." : "다시 만들기"}
                </button>
              ) : null}

              <button
                className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink/55 disabled:opacity-45"
                disabled={isBusy}
                onClick={() =>
                  runJobAction(job.id, deleteRenderJobAction, "제작 내역 목록에서 정리했어요.")
                }
                type="button"
              >
                {isBusy ? "처리 중..." : "내역에서 숨기기"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatJobDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
