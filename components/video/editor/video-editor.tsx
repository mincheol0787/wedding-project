"use client";

import Image from "next/image";
import { useEffect, useMemo, useReducer, useRef } from "react";
import {
  buildVideoRenderInput,
  createId,
  createInitialVideoEditorState,
  videoEditorReducer,
  type EditorAudioAsset,
  type EditorImageAsset,
  type VideoEditorState
} from "@/lib/video/editor-state";
import { videoTemplates, type VideoTemplateId } from "@/lib/video/render-input";
import { RenderRequestPanel } from "@/components/video/editor/render-request-panel";

type VideoEditorProps = {
  projectId: string;
  project: VideoEditorState["project"];
};

export function VideoEditor({ projectId, project }: VideoEditorProps) {
  const [state, dispatch] = useReducer(
    videoEditorReducer,
    project,
    createInitialVideoEditorState
  );
  const objectUrlsRef = useRef<string[]>([]);
  const renderInput = useMemo(() => buildVideoRenderInput(state), [state]);
  const renderJson = useMemo(() => JSON.stringify(renderInput, null, 2), [renderInput]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleImageUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const images: EditorImageAsset[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        const previewUrl = URL.createObjectURL(file);
        objectUrlsRef.current.push(previewUrl);

        return {
          id: createId("image"),
          fileName: file.name,
          previewUrl,
          alt: file.name
        };
      });

    dispatch({
      type: "add-images",
      images
    });
  }

  function handleAudioUpload(files: FileList | null) {
    const file = files?.[0];

    if (!file || !file.type.startsWith("audio/")) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);

    const audio: EditorAudioAsset = {
      id: createId("audio"),
      fileName: file.name,
      previewUrl,
      volume: 0.8
    };

    dispatch({
      type: "set-audio",
      audio
    });
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Template</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">템플릿 선택</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            템플릿 ID는 렌더링 JSON에 함께 저장되어 Remotion 컴포지션에서 분기할 수 있습니다.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {videoTemplates.map((template) => {
            const isSelected = state.templateId === template.id;

            return (
              <button
                className={`rounded-md border p-4 text-left transition ${
                  isSelected
                    ? "border-rose bg-rose/5"
                    : "border-ink/10 bg-white hover:border-ink/30"
                }`}
                key={template.id}
                onClick={() =>
                  dispatch({
                    type: "set-template",
                    templateId: template.id as VideoTemplateId
                  })
                }
                type="button"
              >
                <span className="text-sm font-semibold text-ink">{template.name}</span>
                <span className="mt-2 block text-sm leading-6 text-ink/60">
                  {template.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Photos</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">사진 업로드와 순서</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              업로드한 순서대로 장면이 생성됩니다. 위아래 버튼으로 슬라이드 순서를 바꿀 수 있습니다.
            </p>
          </div>
          <label className="inline-flex cursor-pointer rounded-md bg-ink px-5 py-3 text-sm font-medium text-white">
            사진 선택
            <input
              accept="image/*"
              className="sr-only"
              multiple
              onChange={(event) => handleImageUpload(event.target.files)}
              type="file"
            />
          </label>
        </div>

        {state.scenes.length > 0 ? (
          <div className="grid gap-3">
            {state.scenes.map((scene, index) => {
              const image = state.images.find((item) => item.id === scene.imageAssetId);

              if (!image) {
                return null;
              }

              return (
                <article
                  className="grid gap-4 rounded-md border border-ink/10 bg-porcelain/70 p-3 md:grid-cols-[120px_1fr]"
                  key={scene.id}
                >
                  <div className="relative aspect-video overflow-hidden rounded-md bg-ink/5">
                    <Image
                      alt={image.alt ?? image.fileName}
                      className="object-cover"
                      fill
                      src={image.previewUrl}
                      unoptimized
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-[1fr_140px_150px_170px] md:items-end">
                    <div>
                      <p className="text-xs font-semibold text-rose">Scene {index + 1}</p>
                      <p className="mt-1 break-all text-sm font-medium text-ink">{image.fileName}</p>
                    </div>
                    <label className="grid gap-2 text-sm font-medium text-ink">
                      길이(초)
                      <input
                        className="rounded-md border border-ink/15 px-3 py-2"
                        min={1}
                        onChange={(event) =>
                          dispatch({
                            type: "update-scene",
                            sceneId: scene.id,
                            patch: {
                              durationMs: Math.max(1000, Number(event.target.value) * 1000)
                            }
                          })
                        }
                        type="number"
                        value={Math.round(scene.durationMs / 1000)}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-ink">
                      모션
                      <select
                        className="rounded-md border border-ink/15 px-3 py-2"
                        onChange={(event) =>
                          dispatch({
                            type: "update-scene",
                            sceneId: scene.id,
                            patch: {
                              motion: event.target.value as "zoom-in" | "zoom-out"
                            }
                          })
                        }
                        value={scene.motion}
                      >
                        <option value="zoom-in">줌인</option>
                        <option value="zoom-out">줌아웃</option>
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                        disabled={index === 0}
                        onClick={() =>
                          dispatch({
                            type: "move-scene",
                            sceneId: scene.id,
                            direction: "up"
                          })
                        }
                        type="button"
                      >
                        위로
                      </button>
                      <button
                        className="rounded-md border border-ink/15 px-3 py-2 text-sm"
                        disabled={index === state.scenes.length - 1}
                        onClick={() =>
                          dispatch({
                            type: "move-scene",
                            sceneId: scene.id,
                            direction: "down"
                          })
                        }
                        type="button"
                      >
                        아래로
                      </button>
                      <button
                        className="rounded-md border border-rose/40 px-3 py-2 text-sm text-rose"
                        onClick={() =>
                          dispatch({
                            type: "remove-image",
                            imageAssetId: image.id
                          })
                        }
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-ink/20 p-8 text-center">
            <p className="font-medium text-ink">아직 업로드한 사진이 없습니다.</p>
            <p className="mt-2 text-sm text-ink/55">사진을 선택하면 슬라이드 장면이 자동으로 생성됩니다.</p>
          </div>
        )}
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Lyrics</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">가사와 문구 타임라인</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            시작/종료 시간은 밀리초 기준으로 저장됩니다. 렌더링 시 해당 구간에 텍스트가 오버레이됩니다.
          </p>
        </div>
        <div className="grid gap-3">
          {state.lyricSegments.map((segment, index) => (
            <article
              className="grid gap-3 rounded-md border border-ink/10 bg-porcelain/70 p-3 md:grid-cols-[1fr_140px_140px_80px] md:items-end"
              key={segment.id}
            >
              <label className="grid gap-2 text-sm font-medium text-ink">
                문구 {index + 1}
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  onChange={(event) =>
                    dispatch({
                      type: "update-lyric",
                      lyricId: segment.id,
                      patch: {
                        text: event.target.value
                      }
                    })
                  }
                  placeholder="우리의 시작을 함께 축복해 주세요"
                  value={segment.text}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                시작(ms)
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  min={0}
                  onChange={(event) =>
                    dispatch({
                      type: "update-lyric",
                      lyricId: segment.id,
                      patch: {
                        startMs: Math.max(0, Number(event.target.value))
                      }
                    })
                  }
                  type="number"
                  value={segment.startMs}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                종료(ms)
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  min={1}
                  onChange={(event) =>
                    dispatch({
                      type: "update-lyric",
                      lyricId: segment.id,
                      patch: {
                        endMs: Math.max(1, Number(event.target.value))
                      }
                    })
                  }
                  type="number"
                  value={segment.endMs}
                />
              </label>
              <button
                className="rounded-md border border-rose/40 px-3 py-2 text-sm text-rose"
                onClick={() =>
                  dispatch({
                    type: "remove-lyric",
                    lyricId: segment.id
                  })
                }
                type="button"
              >
                삭제
              </button>
            </article>
          ))}
        </div>
        <button
          className="w-fit rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
          onClick={() =>
            dispatch({
              type: "add-lyric"
            })
          }
          type="button"
        >
          문구 추가
        </button>
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Music</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">배경음악</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              한 개의 오디오 파일을 배경음악으로 사용합니다. 나중에 S3 업로드 URL로 대체됩니다.
            </p>
          </div>
          <label className="inline-flex cursor-pointer rounded-md bg-sage px-5 py-3 text-sm font-medium text-white">
            음악 선택
            <input
              accept="audio/*"
              className="sr-only"
              onChange={(event) => handleAudioUpload(event.target.files)}
              type="file"
            />
          </label>
        </div>
        {state.audio ? (
          <div className="rounded-md border border-ink/10 bg-porcelain/70 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{state.audio.fileName}</p>
                <p className="mt-1 text-xs text-ink/50">volume {state.audio.volume}</p>
              </div>
              <button
                className="w-fit rounded-md border border-rose/40 px-3 py-2 text-sm text-rose"
                onClick={() =>
                  dispatch({
                    type: "clear-audio"
                  })
                }
                type="button"
              >
                음악 제거
              </button>
            </div>
            <audio className="mt-4 w-full" controls src={state.audio.previewUrl} />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">
            아직 선택한 배경음악이 없습니다.
          </div>
        )}
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-ink p-5 text-white shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">
              Render JSON
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Remotion 입력 데이터</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              이 JSON을 `RenderJob.input`에 저장하면 worker가 그대로 Remotion props로 넘길 수 있습니다.
            </p>
          </div>
          <div className="text-sm text-white/65">
            {renderInput.scenes.length} scenes · {renderInput.composition.durationMs}ms
          </div>
        </div>
        <textarea
          className="min-h-96 w-full rounded-md border border-white/10 bg-black/25 p-4 font-mono text-xs leading-5 text-white outline-none"
          readOnly
          value={renderJson}
        />
      </section>

      <RenderRequestPanel projectId={projectId} renderInput={renderInput} />
    </div>
  );
}
