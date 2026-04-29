"use client";

import { useMemo, useState, useTransition } from "react";
import { requestRenderAction } from "@/app/dashboard/projects/[projectId]/video/actions";
import type { VideoRenderInput } from "@/lib/video/render-input";

type RenderRequestPanelProps = {
  projectId: string;
  renderInput: VideoRenderInput;
  requiredPhotoCount: number;
  estimatedTimeLabel?: string;
  onRequested?: () => void;
};

export function RenderRequestPanel({
  projectId,
  renderInput,
  requiredPhotoCount,
  estimatedTimeLabel,
  onRequested
}: RenderRequestPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const checklist = useMemo(
    () => [
      {
        label: "영상 분위기 선택",
        done: Boolean(renderInput.musicPreset),
        help: "어떤 감성으로 영상을 만들지 먼저 정해두면 사진 흐름과 자막 톤이 자연스럽게 맞춰져요."
      },
      {
        label: "사진 준비",
        done: renderInput.assets.images.length >= requiredPhotoCount && renderInput.scenes.length >= requiredPhotoCount,
        help: `이 영상은 최소 ${requiredPhotoCount}장의 사진이 필요해요.`
      },
      {
        label: "사진 흐름 정리",
        done: renderInput.scenes.length > 0 && renderInput.composition.durationMs >= 30_000,
        help: "사진 순서와 구간 길이를 정리하면 영상이 끊기지 않고 부드럽게 이어져요."
      },
      {
        label: "자막 확인",
        done: renderInput.lyricSegments.length > 0,
        help: "화면에 보여줄 문구를 1개 이상 넣어주세요."
      }
    ],
    [renderInput, requiredPhotoCount]
  );

  const requiredReady = checklist.every((item) => item.done);
  const readyPercent = Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);

  return (
    <div className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Video Production</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">영상 만들기</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          준비가 끝나면 여기서 바로 영상 제작을 시작할 수 있어요. 제작이 끝나면 서비스 안에서 상태를 바로 확인할 수
          있고, SMS와 카카오 알림은 추후 확장 예정으로 남겨두었습니다.
        </p>
      </div>

      <div className="rounded-md border border-sage/15 bg-sage/5 px-4 py-3 text-sm text-ink/70">
        <p className="font-medium text-ink">예상 제작 시간</p>
        <p className="mt-1">{estimatedTimeLabel ?? "영상 제작은 약 1~3분 정도 소요돼요."}</p>
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
              {item.done ? "완료" : "확인 필요"}
            </span>
          </div>
        ))}
      </div>

      <button
        className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/88 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={pending || !requiredReady}
        onClick={() => {
          if (pending || !requiredReady) {
            return;
          }

          startTransition(async () => {
            setMessage(undefined);
            setError(undefined);

            try {
              const result = await requestRenderAction(projectId, renderInput);

              if (result.error) {
                setError(result.error);
                return;
              }

              setMessage(
                result.message ??
                  "영상 제작이 접수되었습니다. 화면을 닫아도 제작 상태에서 진행 상황을 확인할 수 있어요."
              );
              onRequested?.();
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "영상 제작 요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
              );
            }
          });
        }}
        type="button"
      >
        {pending ? "요청을 접수하고 있어요..." : "영상 제작 시작하기"}
      </button>

      {!requiredReady ? (
        <p className="text-sm text-rose">
          노래 선택, 사진, 사진 흐름, 자막까지 모두 준비되면 바로 영상 제작을 시작할 수 있어요.
        </p>
      ) : null}
      {message ? <p className="rounded-md bg-sage/10 px-3 py-2 text-sm text-sage">{message}</p> : null}
      {error ? <p className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
    </div>
  );
}
