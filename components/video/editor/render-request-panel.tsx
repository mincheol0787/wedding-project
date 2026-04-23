"use client";

import { useMemo, useState, useTransition } from "react";
import { requestRenderAction } from "@/app/dashboard/projects/[projectId]/video/actions";
import type { VideoRenderInput } from "@/lib/video/render-input";

type RenderRequestPanelProps = {
  projectId: string;
  renderInput: VideoRenderInput;
  requiredPhotoCount: number;
};

export function RenderRequestPanel({
  projectId,
  renderInput,
  requiredPhotoCount
}: RenderRequestPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const checklist = useMemo(
    () => [
      {
        label: "노래 분위기",
        done: Boolean(renderInput.musicPreset),
        help: "영상에 사용할 노래 분위기를 선택해 주세요."
      },
      {
        label: "사진",
        done: renderInput.assets.images.length >= requiredPhotoCount && renderInput.scenes.length >= requiredPhotoCount,
        help: `${requiredPhotoCount}장의 사진이 필요해요.`
      },
      {
        label: "사진 흐름",
        done: renderInput.scenes.length > 0 && renderInput.composition.durationMs >= 30_000,
        help: "사진 순서와 표시 시간을 확인해 주세요."
      },
      {
        label: "영상 문구",
        done: renderInput.lyricSegments.length > 0,
        help: "영상에 표시할 문구를 1개 이상 입력해 주세요."
      }
    ],
    [renderInput, requiredPhotoCount]
  );
  const requiredReady = checklist.every((item) => item.done);
  const readyPercent = Math.round(
    (checklist.filter((item) => item.done).length / checklist.length) * 100
  );

  return (
    <div className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">
          Video Production
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">영상 제작 요청</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          준비가 끝나면 영상을 만들 수 있어요. 완료 안내는 현재 서비스 내 상태 화면으로 제공하고,
          SMS와 카카오 알림은 추후 확장 예정입니다.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-ink/55">
          <span>제작 준비도</span>
          <span>{readyPercent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-porcelain">
          <div className="h-full bg-rose transition-all" style={{ width: `${readyPercent}%` }} />
        </div>
      </div>

      <div className="grid gap-2">
        {checklist.map((item) => (
          <div
            className="flex items-start justify-between gap-3 rounded-md border border-ink/10 bg-[#fbfcfb] px-3 py-2"
            key={item.label}
          >
            <div>
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-ink/45">{item.help}</p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                item.done ? "bg-sage/10 text-sage" : "bg-rose/10 text-rose"
              }`}
            >
              {item.done ? "완료" : "필요"}
            </span>
          </div>
        ))}
      </div>

      <button
        className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/88 disabled:opacity-45"
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
        {pending ? "제작 요청 중..." : "영상 제작 시작하기"}
      </button>
      {!requiredReady ? (
        <p className="text-sm text-rose">
          노래, 사진, 사진 흐름, 문구가 모두 준비되면 영상 제작을 시작할 수 있어요.
        </p>
      ) : null}
      {message ? <p className="rounded-md bg-sage/10 px-3 py-2 text-sm text-sage">{message}</p> : null}
      {error ? <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
    </div>
  );
}
