"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VideoEditor } from "@/components/video/editor/video-editor";
import { RenderJobList } from "@/components/video/render-job-list";
import {
  type VideoRenderJobItem,
  normalizeVideoRenderJobItem
} from "@/components/video/types";

type VideoProductionWorkspaceProps = {
  projectId: string;
  project: {
    id: string;
    title: string;
    groomName: string;
    brideName: string;
    weddingDate?: string;
  };
  initialJobs: VideoRenderJobItem[];
};

const activeStatuses = new Set(["QUEUED", "PROCESSING"]);

export function VideoProductionWorkspace({
  projectId,
  project,
  initialJobs
}: VideoProductionWorkspaceProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [statusError, setStatusError] = useState<string>();
  const pollTimeoutRef = useRef<number | null>(null);
  const hasActiveJob = useMemo(
    () => jobs.some((job) => activeStatuses.has(job.status)),
    [jobs]
  );

  const refreshJobs = useCallback(
    async (silent = false) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 4500);

      try {
        const response = await fetch(`/api/dashboard/projects/${projectId}/video-status`, {
          cache: "no-store",
          signal: controller.signal
        });
        const json = (await response.json()) as {
          error?: string;
          jobs?: VideoRenderJobItem[];
        };

        if (!response.ok) {
          if (!silent) {
            setStatusError(json.error ?? "영상 제작 상태를 확인하는 중 문제가 발생했습니다.");
          }

          return;
        }

        setJobs((json.jobs ?? []).map((job) => normalizeVideoRenderJobItem(job)));
        setStatusError(undefined);
      } catch (error) {
        if (!silent) {
          setStatusError(
            error instanceof Error && error.name === "AbortError"
              ? "상태 확인이 잠시 지연되고 있어요. 잠시 후 다시 확인해 주세요."
              : "영상 제작 상태를 새로 불러오지 못했습니다."
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [projectId]
  );

  useEffect(() => {
    if (!hasActiveJob) {
      if (pollTimeoutRef.current) {
        window.clearTimeout(pollTimeoutRef.current);
      }
      return;
    }

    const tick = async () => {
      await refreshJobs(true);
      pollTimeoutRef.current = window.setTimeout(tick, 4000);
    };

    pollTimeoutRef.current = window.setTimeout(tick, 4000);

    return () => {
      if (pollTimeoutRef.current) {
        window.clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [hasActiveJob, refreshJobs]);

  return (
    <>
      <VideoEditor onRenderRequested={() => refreshJobs(false)} project={project} projectId={projectId} />

      <section className="mt-8 grid gap-4 rounded-md border border-ink/10 bg-white/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">
              Production Status
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">영상 제작 상태</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              제작이 시작되면 여기에서 진행률과 완료 여부를 바로 확인할 수 있어요.
            </p>
          </div>
          <button
            className="w-fit rounded-md border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-sage/35 hover:bg-white"
            onClick={() => refreshJobs(false)}
            type="button"
          >
            상태 새로고침
          </button>
        </div>
        <RenderJobList
          jobs={jobs}
          onJobsChanged={() => refreshJobs(false)}
          projectId={projectId}
          statusError={statusError}
        />
      </section>
    </>
  );
}
