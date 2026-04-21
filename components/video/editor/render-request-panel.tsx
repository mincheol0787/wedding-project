"use client";

import { useState, useTransition, type ReactNode } from "react";
import { requestRenderAction } from "@/app/dashboard/projects/[projectId]/video/actions";
import type { VideoRenderInput } from "@/lib/video/render-input";

type RenderRequestPanelProps = {
  projectId: string;
  renderInput: VideoRenderInput;
  children?: ReactNode;
};

export function RenderRequestPanel({ projectId, renderInput, children }: RenderRequestPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  return (
    <div className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Render</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">비동기 렌더링 요청</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          현재 편집 데이터를 `RenderJob.input`으로 저장하고, 큐에 렌더링 작업을 등록합니다.
        </p>
      </div>
      <button
        className="w-fit rounded-md bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        disabled={pending}
        onClick={() => {
          if (pending) {
            return;
          }

          startTransition(async () => {
            setMessage(undefined);
            setError(undefined);

            const result = await requestRenderAction(projectId, renderInput);

            if (result.error) {
              setError(result.error);
              return;
            }

            setMessage(result.message);
          });
        }}
        type="button"
      >
        {pending ? "요청 중..." : "렌더링 요청하기"}
      </button>
      {message ? <p className="text-sm text-sage">{message}</p> : null}
      {error ? <p className="text-sm text-rose">{error}</p> : null}
      {children}
    </div>
  );
}
