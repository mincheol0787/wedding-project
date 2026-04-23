"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
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
  const checklist = useMemo(
    () => [
      {
        label: "사진 장면",
        done: renderInput.assets.images.length > 0 && renderInput.scenes.length > 0,
        help: "사진을 1장 이상 추가해 주세요."
      },
      {
        label: "문구/가사",
        done: renderInput.lyricSegments.length > 0,
        help: "영상에 표시할 문구를 1개 이상 입력해 주세요."
      },
      {
        label: "영상 길이",
        done: renderInput.composition.durationMs >= 15_000,
        help: "15초 이상이면 흐름을 확인하기 좋습니다."
      },
      {
        label: "배경음악",
        done: Boolean(renderInput.assets.audio),
        help: "음악은 선택이지만 완성도 확인을 위해 권장합니다."
      }
    ],
    [renderInput]
  );
  const requiredReady = checklist.slice(0, 3).every((item) => item.done);

  return (
    <div className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Render</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">비동기 렌더링 요청</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          현재 편집 데이터를 `RenderJob.input`으로 저장하고, 큐에 렌더링 작업을 등록합니다.
        </p>
      </div>
      <div className="grid gap-2 rounded-md border border-ink/10 bg-[#fbfcfb] p-3 md:grid-cols-2">
        {checklist.map((item) => (
          <div className="flex items-start justify-between gap-3 rounded-md bg-white px-3 py-2" key={item.label}>
            <div>
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-ink/45">{item.help}</p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                item.done ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"
              }`}
            >
              {item.done ? "완료" : "확인"}
            </span>
          </div>
        ))}
      </div>
      <button
        className="w-fit rounded-md bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        disabled={pending || !requiredReady}
        onClick={() => {
          if (pending || !requiredReady) {
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
      {!requiredReady ? (
        <p className="text-sm text-rose">사진, 문구, 기본 영상 길이를 먼저 채우면 렌더링을 요청할 수 있어요.</p>
      ) : null}
      {message ? <p className="text-sm text-sage">{message}</p> : null}
      {error ? <p className="text-sm text-rose">{error}</p> : null}
      {children}
    </div>
  );
}
