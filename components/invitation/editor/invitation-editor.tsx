"use client";

import Image from "next/image";
import { useActionState, useMemo, useState, useTransition } from "react";
import { InvitationLivePreview } from "@/components/invitation/editor/invitation-live-preview";
import {
  saveInvitationAction,
  type InvitationSaveState
} from "@/app/dashboard/projects/[projectId]/invitation/actions";
import {
  createDefaultInvitationConfig,
  getDefaultFontPreset,
  getDefaultSectionOrder,
  invitationFontPresets,
  invitationSectionIds,
  invitationTemplates,
  type BankAccount,
  type InvitationConfig,
  type InvitationGalleryItem,
  type InvitationSectionId,
  type InvitationTemplateId
} from "@/lib/invitation/types";
import { createId } from "@/lib/video/editor-state";

type PlaceSearchResult = {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  lat: string;
  lng: string;
  phone?: string;
  placeUrl?: string;
};

type PreviewPlacement = "left" | "right" | "bottom";

type InvitationEditorProps = {
  projectId: string;
  previewUrl: string;
  publicUrl: string | null;
  defaults: {
    status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
    title: string;
    groomName: string;
    brideName: string;
    groomFatherName: string;
    groomMotherName: string;
    brideFatherName: string;
    brideMotherName: string;
    eventDate: string;
    venueName: string;
    venueAddress: string;
    venueDetail: string;
    greeting: string;
    mapProvider: string;
    mapLat: string;
    mapLng: string;
    gallery: InvitationGalleryItem[];
    config: InvitationConfig;
  };
};

const initialState: InvitationSaveState = {};

export function InvitationEditor({
  projectId,
  previewUrl,
  publicUrl,
  defaults
}: InvitationEditorProps) {
  const [form, setForm] = useState({
    title: defaults.title,
    groomName: defaults.groomName,
    brideName: defaults.brideName,
    groomFatherName: defaults.groomFatherName,
    groomMotherName: defaults.groomMotherName,
    brideFatherName: defaults.brideFatherName,
    brideMotherName: defaults.brideMotherName,
    eventDate: defaults.eventDate,
    venueName: defaults.venueName,
    venueAddress: defaults.venueAddress,
    venueDetail: defaults.venueDetail,
    greeting: defaults.greeting,
    mapProvider: defaults.mapProvider || "kakao",
    mapLat: defaults.mapLat,
    mapLng: defaults.mapLng
  });
  const [gallery, setGallery] = useState(defaults.gallery);
  const [config, setConfig] = useState<InvitationConfig>({
    ...createDefaultInvitationConfig(defaults.config.templateId),
    ...defaults.config,
    design: {
      fontPreset:
        defaults.config.design?.fontPreset ?? getDefaultFontPreset(defaults.config.templateId)
    }
  });
  const [placeQuery, setPlaceQuery] = useState(defaults.config.placeSearch.query);
  const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
  const [placeSearchError, setPlaceSearchError] = useState<string>();
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isPreviewMoving, startPreviewMoveTransition] = useTransition();
  const [previewPlacement, setPreviewPlacement] = useState<PreviewPlacement>("right");
  const [submitIntent, setSubmitIntent] = useState<"draft" | "publish">("draft");
  const [draggingSectionId, setDraggingSectionId] = useState<InvitationSectionId | null>(null);

  const action = saveInvitationAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const galleryJson = useMemo(() => JSON.stringify(gallery), [gallery]);
  const configJson = useMemo(
    () =>
      JSON.stringify({
        ...config,
        placeSearch: {
          ...config.placeSearch,
          query: placeQuery
        }
      }),
    [config, placeQuery]
  );

  async function handleGalleryUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const uploaded = await Promise.all(
      Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map(async (file) => ({
          id: createId("gallery"),
          fileName: file.name,
          src: await readFileAsDataUrl(file),
          alt: file.name
        }))
    );

    setGallery((current) => [...current, ...uploaded]);
  }

  async function handlePlaceSearch() {
    if (!placeQuery.trim() || isSearchingPlaces) {
      return;
    }

    setIsSearchingPlaces(true);
    setPlaceSearchError(undefined);

    try {
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(placeQuery.trim())}`);
      const json = (await response.json()) as {
        error?: string;
        warning?: string;
        results?: PlaceSearchResult[];
      };

      if (!response.ok) {
        setPlaceSearchError(json.error ?? "장소 검색에 실패했습니다.");
        setPlaceResults([]);
        return;
      }

      setPlaceResults(json.results ?? []);
      setPlaceSearchError(json.warning);
      if (!(json.results ?? []).length) {
        setPlaceSearchError("검색 결과가 없습니다. 장소명을 조금 다르게 입력해 보세요.");
      }
    } catch {
      setPlaceSearchError("장소 검색 중 문제가 발생했습니다.");
      setPlaceResults([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  }

  function selectTemplate(templateId: InvitationTemplateId) {
    setConfig((current) => ({
      ...current,
      templateId,
      sectionOrder: getDefaultSectionOrder(templateId),
      design: {
        fontPreset: getDefaultFontPreset(templateId)
      }
    }));
  }

  function updateCopy<K extends keyof InvitationConfig["copy"]>(
    key: K,
    value: InvitationConfig["copy"][K]
  ) {
    setConfig((current) => ({
      ...current,
      copy: {
        ...current.copy,
        [key]: value
      }
    }));
  }

  function updateVenueGuide<K extends keyof InvitationConfig["venueGuide"]>(
    key: K,
    value: InvitationConfig["venueGuide"][K]
  ) {
    setConfig((current) => ({
      ...current,
      venueGuide: {
        ...current.venueGuide,
        [key]: value
      }
    }));
  }

  function updateGalleryOption<K extends keyof InvitationConfig["galleryOptions"]>(
    key: K,
    value: InvitationConfig["galleryOptions"][K]
  ) {
    setConfig((current) => ({
      ...current,
      galleryOptions: {
        ...current.galleryOptions,
        [key]: value
      }
    }));
  }

  function addBankAccount() {
    setConfig((current) => ({
      ...current,
      bankAccounts: [
        ...current.bankAccounts,
        {
          id: createId("account"),
          label: "신랑측",
          bankName: "",
          accountNumber: "",
          holderName: ""
        }
      ]
    }));
  }

  function updateBankAccount(id: string, patch: Partial<BankAccount>) {
    setConfig((current) => ({
      ...current,
      bankAccounts: current.bankAccounts.map((account) =>
        account.id === id ? { ...account, ...patch } : account
      )
    }));
  }

  function removeBankAccount(id: string) {
    setConfig((current) => ({
      ...current,
      bankAccounts: current.bankAccounts.filter((account) => account.id !== id)
    }));
  }

  function applyPlace(result: PlaceSearchResult) {
    setForm((current) => ({
      ...current,
      venueName: result.name,
      venueAddress: result.roadAddress || result.address,
      mapLat: result.lat,
      mapLng: result.lng,
      mapProvider: "kakao"
    }));

    setConfig((current) => ({
      ...current,
      placeSearch: {
        query: placeQuery,
        placeName: result.name,
        roadAddress: result.roadAddress || result.address,
        phone: result.phone ?? "",
        placeUrl: result.placeUrl ?? ""
      }
    }));
  }

  function moveSectionByDrag(targetId: InvitationSectionId) {
    if (!draggingSectionId || draggingSectionId === targetId) {
      return;
    }

    setConfig((current) => {
      const next = [...current.sectionOrder];
      const fromIndex = next.indexOf(draggingSectionId);
      const toIndex = next.indexOf(targetId);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggingSectionId);

      return {
        ...current,
        sectionOrder: next
      };
    });
  }

  function moveSection(fromId: InvitationSectionId, targetId: InvitationSectionId) {
    if (fromId === targetId) {
      return;
    }

    setConfig((current) => {
      const next = [...current.sectionOrder];
      const fromIndex = next.indexOf(fromId);
      const toIndex = next.indexOf(targetId);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);

      return {
        ...current,
        sectionOrder: next
      };
    });
  }

  function handlePreviewDrop(placement: PreviewPlacement) {
    startPreviewMoveTransition(() => {
      setPreviewPlacement(placement);
    });
  }

  const selectedPlace =
    form.venueName || form.venueAddress
      ? {
          name: form.venueName || "선택한 장소",
          address: form.venueAddress,
          lat: form.mapLat,
          lng: form.mapLng,
          placeUrl: config.placeSearch.placeUrl
        }
      : null;

  return (
    <form
      action={formAction}
      className={`grid gap-8 ${
        previewPlacement === "bottom"
          ? "xl:grid-cols-1"
          : "xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]"
      }`}
    >
      <input name="galleryJson" type="hidden" value={galleryJson} />
      <input name="configJson" type="hidden" value={configJson} />
      <input name="title" type="hidden" value={form.title} />
      <input name="groomName" type="hidden" value={form.groomName} />
      <input name="brideName" type="hidden" value={form.brideName} />
      <input name="groomFatherName" type="hidden" value={form.groomFatherName} />
      <input name="groomMotherName" type="hidden" value={form.groomMotherName} />
      <input name="brideFatherName" type="hidden" value={form.brideFatherName} />
      <input name="brideMotherName" type="hidden" value={form.brideMotherName} />
      <input name="eventDate" type="hidden" value={form.eventDate} />
      <input name="greeting" type="hidden" value={form.greeting} />
      <input name="venueName" type="hidden" value={form.venueName} />
      <input name="venueAddress" type="hidden" value={form.venueAddress} />
      <input name="venueDetail" type="hidden" value={form.venueDetail} />
      <input name="mapProvider" type="hidden" value={form.mapProvider} />
      <input name="mapLat" type="hidden" value={form.mapLat} />
      <input name="mapLng" type="hidden" value={form.mapLng} />

      <div
        className={`grid gap-8 ${previewPlacement === "left" ? "xl:order-2" : "xl:order-1"}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handlePreviewDrop("bottom")}
      >
        <section className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Template</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">템플릿과 폰트</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                템플릿을 누르는 즉시 오른쪽 미리보기에 반영됩니다. 폰트도 바로 바뀌어요.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
                href={previewUrl}
                rel="noreferrer"
                target="_blank"
              >
                전체 미리보기
              </a>
              {publicUrl ? (
                <a
                  className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
                  href={publicUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  공개 페이지
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {invitationTemplates.map((template) => {
              const isActive = config.templateId === template.id;
              return (
                <button
                  className={`overflow-hidden rounded-md border text-left transition ${
                    isActive ? "border-rose shadow-sm" : "border-ink/10 hover:border-ink/30"
                  }`}
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  type="button"
                >
                  <div className={`px-4 py-3 ${template.accentClass}`}>
                    <div className="rounded-md border border-white/70 bg-white/80 px-3 py-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-rose">
                        {config.copy.heroEyebrow}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-ink">
                        {form.groomName || "신랑"} & {form.brideName || "신부"}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-1">
                        {[0, 1, 2].map((index) => (
                          <div className="aspect-[3/4] rounded bg-[#f5f1ec]" key={index} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{template.name}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/60">{template.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {invitationFontPresets.map((fontPreset) => (
              <button
                className={`rounded-md border px-4 py-4 text-left ${
                  config.design.fontPreset === fontPreset
                    ? "border-rose bg-rose/5"
                    : "border-ink/10"
                }`}
                key={fontPreset}
                onClick={() =>
                  setConfig((current) => ({
                    ...current,
                    design: {
                      fontPreset
                    }
                  }))
                }
                type="button"
              >
                <p className={`text-lg text-ink ${getFontPresetClass(fontPreset)}`}>
                  {fontPreset === "serif"
                    ? "클래식 세리프"
                    : fontPreset === "modern"
                      ? "깔끔한 산세리프"
                      : "로맨틱 세리프"}
                </p>
                <p className="mt-2 text-sm text-ink/55">
                  {fontPreset === "serif"
                    ? "차분하고 정돈된 느낌"
                    : fontPreset === "modern"
                      ? "선명하고 가벼운 느낌"
                      : "조금 더 부드럽고 감성적인 느낌"}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Couple</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">기본 정보</h2>
          </div>
          <Input label="청첩장 제목" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="신랑 이름" value={form.groomName} onChange={(value) => setForm((current) => ({ ...current, groomName: value }))} />
            <Input label="신부 이름" value={form.brideName} onChange={(value) => setForm((current) => ({ ...current, brideName: value }))} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="신랑 아버지 성함" value={form.groomFatherName} onChange={(value) => setForm((current) => ({ ...current, groomFatherName: value }))} />
            <Input label="신랑 어머니 성함" value={form.groomMotherName} onChange={(value) => setForm((current) => ({ ...current, groomMotherName: value }))} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="신부 아버지 성함" value={form.brideFatherName} onChange={(value) => setForm((current) => ({ ...current, brideFatherName: value }))} />
            <Input label="신부 어머니 성함" value={form.brideMotherName} onChange={(value) => setForm((current) => ({ ...current, brideMotherName: value }))} />
          </div>
          <label className="grid gap-2 text-sm font-medium text-ink">
            예식 일시
            <input
              className="rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))}
              type="datetime-local"
              value={form.eventDate}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            소개 문구
            <textarea
              className="min-h-28 rounded-md border border-ink/15 px-3 py-2"
              onChange={(event) => setForm((current) => ({ ...current, greeting: event.target.value }))}
              value={form.greeting}
            />
          </label>
        </section>

        <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Venue</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">장소 검색과 예식 안내</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_140px]">
            <Input label="장소 검색" value={placeQuery} onChange={setPlaceQuery} />
            <button
              className="mt-auto rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSearchingPlaces}
              onClick={handlePlaceSearch}
              type="button"
            >
              {isSearchingPlaces ? "검색 중..." : "장소 찾기"}
            </button>
          </div>
          {placeSearchError ? <p className="text-sm text-rose">{placeSearchError}</p> : null}
          {isSearchingPlaces ? (
            <div className="grid gap-2 rounded-md border border-rose/20 bg-rose/5 p-3">
              <p className="text-xs font-medium text-rose">장소 후보를 찾고 있어요</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full w-1/3 animate-[soft-loading_1.15s_ease-in-out_infinite] rounded-full bg-rose/70" />
              </div>
            </div>
          ) : null}
          {placeResults.length ? (
            <div className="grid gap-3">
              {placeResults.map((result) => (
                <button
                  className="rounded-md border border-ink/10 p-4 text-left hover:border-rose/40"
                  key={result.id}
                  onClick={() => applyPlace(result)}
                  type="button"
                >
                  <p className="font-medium text-ink">{result.name}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/60">
                    {result.roadAddress || result.address}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
          {selectedPlace ? (
            <div className="grid gap-4 rounded-md border border-rose/20 bg-rose/5 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
                  Selected Venue
                </p>
                <p className="mt-2 text-base font-semibold text-ink">{selectedPlace.name}</p>
                {selectedPlace.address ? (
                  <p className="mt-1 text-sm leading-6 text-ink/65">{selectedPlace.address}</p>
                ) : null}
                {selectedPlace.lat && selectedPlace.lng ? (
                  <p className="mt-2 text-xs text-ink/45">
                    지도는 공개 페이지와 미리보기에서 자동으로 표시됩니다.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-ink/45">
                    장소 검색 결과를 선택하면 지도와 길찾기 버튼이 연결됩니다.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPlace.placeUrl ? (
                  <a
                    className="rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink"
                    href={selectedPlace.placeUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    지도보기
                  </a>
                ) : null}
                {selectedPlace.lat && selectedPlace.lng ? (
                  <a
                    className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white"
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(
                      selectedPlace.name
                    )},${selectedPlace.lat},${selectedPlace.lng}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    길찾기
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          <Input label="예식장명" value={form.venueName} onChange={(value) => setForm((current) => ({ ...current, venueName: value }))} />
          <Input label="주소" value={form.venueAddress} onChange={(value) => setForm((current) => ({ ...current, venueAddress: value }))} />
          <Input label="상세 안내" value={form.venueDetail} onChange={(value) => setForm((current) => ({ ...current, venueDetail: value }))} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="홀" value={config.venueGuide.hall} onChange={(value) => updateVenueGuide("hall", value)} />
            <Input label="층" value={config.venueGuide.floor} onChange={(value) => updateVenueGuide("floor", value)} />
            <Input label="주차 안내" value={config.venueGuide.parking} onChange={(value) => updateVenueGuide("parking", value)} />
            <Input label="식사 안내" value={config.venueGuide.meal} onChange={(value) => updateVenueGuide("meal", value)} />
          </div>
          <Textarea label="기타 안내" value={config.venueGuide.extra} onChange={(value) => updateVenueGuide("extra", value)} />
        </section>

        <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Gallery</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">사진 표현 방식</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { id: "animated", label: "애니메이션형" },
              { id: "slide", label: "슬라이드형" },
              { id: "full", label: "전체보기형" }
            ].map((item) => (
              <button
                className={`rounded-md border p-4 text-left ${
                  config.galleryOptions.displayMode === item.id
                    ? "border-rose bg-rose/5"
                    : "border-ink/10"
                }`}
                key={item.id}
                onClick={() =>
                  updateGalleryOption(
                    "displayMode",
                    item.id as InvitationConfig["galleryOptions"]["displayMode"]
                  )
                }
                type="button"
              >
                <p className="font-medium text-ink">{item.label}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-md border border-ink/10 px-4 py-3 text-sm text-ink">
              <input
                checked={config.galleryOptions.enableZoom}
                onChange={(event) => updateGalleryOption("enableZoom", event.target.checked)}
                type="checkbox"
              />
              확대 가능
            </label>
            <label className="flex items-center gap-2 rounded-md border border-ink/10 px-4 py-3 text-sm text-ink">
              <input
                checked={config.galleryOptions.showSaveButton}
                onChange={(event) => updateGalleryOption("showSaveButton", event.target.checked)}
                type="checkbox"
              />
              저장 버튼 표시
            </label>
            <label className="inline-flex cursor-pointer rounded-md bg-ink px-5 py-3 text-sm font-medium text-white">
              사진 업로드
              <input
                accept="image/*"
                className="sr-only"
                multiple
                onChange={(event) => handleGalleryUpload(event.target.files)}
                type="file"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((item) => (
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-porcelain" key={item.id}>
                <Image alt={item.alt ?? item.fileName} className="object-cover" fill src={item.src} unoptimized />
                <button
                  className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-rose"
                  onClick={() =>
                    setGallery((current) => current.filter((galleryItem) => galleryItem.id !== item.id))
                  }
                  type="button"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Copy</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">문구와 섹션 순서</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md border border-ink/15 px-4 py-2 text-sm"
                onClick={() =>
                  setConfig((current) => ({
                    ...current,
                    sectionOrder: getDefaultSectionOrder(current.templateId)
                  }))
                }
                type="button"
              >
                템플릿 기본 순서
              </button>
              <button
                className="rounded-md border border-ink/15 px-4 py-2 text-sm"
                onClick={() =>
                  setConfig((current) => ({
                    ...current,
                    sectionOrder: invitationSectionIds.slice()
                  }))
                }
                type="button"
              >
                표준 순서
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="상단 작은 문구" value={config.copy.heroEyebrow} onChange={(value) => updateCopy("heroEyebrow", value)} />
            <Input label="갤러리 제목" value={config.copy.galleryTitle} onChange={(value) => updateCopy("galleryTitle", value)} />
            <Input label="오시는 길 제목" value={config.copy.locationTitle} onChange={(value) => updateCopy("locationTitle", value)} />
            <Input label="마음 전하실 곳 제목" value={config.copy.giftTitle} onChange={(value) => updateCopy("giftTitle", value)} />
            <Input label="참석 여부 제목" value={config.copy.rsvpTitle} onChange={(value) => updateCopy("rsvpTitle", value)} />
            <Input label="방명록 제목" value={config.copy.guestbookTitle} onChange={(value) => updateCopy("guestbookTitle", value)} />
            <Input label="지도 버튼 문구" value={config.copy.mapButtonLabel} onChange={(value) => updateCopy("mapButtonLabel", value)} />
            <Input label="사진 저장 버튼 문구" value={config.copy.saveImageLabel} onChange={(value) => updateCopy("saveImageLabel", value)} />
          </div>

          <div className="grid gap-4">
            <Textarea label="상단 소개 문구" value={config.copy.heroDescription} onChange={(value) => updateCopy("heroDescription", value)} />
            <Textarea label="갤러리 설명" value={config.copy.galleryDescription} onChange={(value) => updateCopy("galleryDescription", value)} />
            <Textarea label="오시는 길 설명" value={config.copy.locationDescription} onChange={(value) => updateCopy("locationDescription", value)} />
            <Textarea label="마음 전하실 곳 설명" value={config.copy.giftDescription} onChange={(value) => updateCopy("giftDescription", value)} />
            <Textarea label="참석 여부 설명" value={config.copy.rsvpDescription} onChange={(value) => updateCopy("rsvpDescription", value)} />
            <Textarea label="방명록 설명" value={config.copy.guestbookDescription} onChange={(value) => updateCopy("guestbookDescription", value)} />
          </div>

          <div className="grid gap-3">
            {config.sectionOrder.map((sectionId, index) => (
              <div
                className={`flex cursor-grab items-center justify-between rounded-md border px-4 py-3 ${
                  draggingSectionId === sectionId ? "border-rose bg-rose/5" : "border-ink/10 bg-porcelain/60"
                }`}
                draggable
                key={sectionId}
                onDragEnd={() => setDraggingSectionId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDragStart={() => setDraggingSectionId(sectionId)}
                onDrop={() => moveSectionByDrag(sectionId)}
              >
                <div>
                  <p className="text-sm font-medium text-ink">{getSectionLabel(sectionId)}</p>
                  <p className="text-xs text-ink/50">표시 순서 {index + 1}</p>
                </div>
                <div className="text-xs text-ink/40">드래그해서 이동</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Gift</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">계좌 정보</h2>
          </div>
          <div className="grid gap-3">
            {config.bankAccounts.map((account) => (
              <article
                className="grid gap-3 rounded-md border border-ink/10 bg-porcelain/70 p-3 md:grid-cols-[120px_1fr_1fr_1fr_72px]"
                key={account.id}
              >
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  onChange={(event) => updateBankAccount(account.id, { label: event.target.value })}
                  placeholder="구분"
                  value={account.label}
                />
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  onChange={(event) => updateBankAccount(account.id, { bankName: event.target.value })}
                  placeholder="은행명"
                  value={account.bankName}
                />
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  onChange={(event) =>
                    updateBankAccount(account.id, { accountNumber: event.target.value })
                  }
                  placeholder="계좌번호"
                  value={account.accountNumber}
                />
                <input
                  className="rounded-md border border-ink/15 px-3 py-2"
                  onChange={(event) => updateBankAccount(account.id, { holderName: event.target.value })}
                  placeholder="예금주"
                  value={account.holderName}
                />
                <button
                  className="rounded-md border border-rose/30 px-3 py-2 text-xs text-rose"
                  onClick={() => removeBankAccount(account.id)}
                  type="button"
                >
                  삭제
                </button>
              </article>
            ))}
          </div>
          <button
            className="w-fit rounded-md border border-ink/15 px-4 py-2 text-sm"
            onClick={addBankAccount}
            type="button"
          >
            계좌 추가
          </button>
        </section>

        <section className="sticky bottom-4 z-10 rounded-md border border-ink/10 bg-white p-4 shadow-lg">
          {state.error ? <p className="mb-3 text-sm text-rose">{state.error}</p> : null}
          {state.message ? <p className="mb-3 text-sm text-sage">{state.message}</p> : null}
          {pending ? (
            <div className="mb-3 rounded-md border border-rose/20 bg-rose/5 px-3 py-3">
              <p className="text-xs font-medium text-rose">
                {submitIntent === "publish" ? "공개 페이지를 준비하고 있어요" : "초안을 저장하고 있어요"}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full w-1/3 animate-[soft-loading_1.15s_ease-in-out_infinite] rounded-full bg-rose/70" />
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-ink/55">
              {publicUrl ? `공개 링크: ${publicUrl}` : "아직 발행 전입니다. 저장 후 공개를 눌러 주세요."}
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-md border border-ink/15 px-5 py-3 text-sm font-medium text-ink disabled:opacity-60"
                disabled={pending}
                name="intent"
                onClick={() => setSubmitIntent("draft")}
                type="submit"
                value="draft"
              >
                {pending && submitIntent === "draft" ? "저장 중..." : "초안 저장"}
              </button>
              <button
                className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                disabled={pending}
                name="intent"
                onClick={() => setSubmitIntent("publish")}
                type="submit"
                value="publish"
              >
                {pending && submitIntent === "publish" ? "공개 중..." : "저장 후 공개"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <aside
        className={`${
          previewPlacement === "left"
            ? "xl:order-1"
            : previewPlacement === "bottom"
              ? "xl:order-2"
              : "xl:order-2"
        } ${previewPlacement === "bottom" ? "" : "xl:sticky xl:top-10 xl:self-start"}`}
        draggable
        onDragEnd={() => {
          document.body.classList.remove("select-none");
        }}
        onDragStart={(event) => {
          document.body.classList.add("select-none");
          event.dataTransfer.setData("text/plain", "invitation-preview");
        }}
      >
        <div className="mb-3 grid gap-2 rounded-md border border-dashed border-rose/25 bg-white/70 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-ink">미리보기 위치</p>
            <p className="text-xs text-ink/50">
              패널을 드래그하거나 아래 버튼으로 위치를 바꿀 수 있습니다.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { id: "left", label: "왼쪽" },
              { id: "right", label: "오른쪽" },
              { id: "bottom", label: "하단" }
            ].map((item) => (
              <button
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  previewPlacement === item.id
                    ? "border-rose bg-rose/5 text-rose"
                    : "border-ink/10 text-ink/65 hover:border-rose/30"
                }`}
                disabled={isPreviewMoving}
                key={item.id}
                onClick={() => handlePreviewDrop(item.id as PreviewPlacement)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handlePreviewDrop(item.id as PreviewPlacement)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <InvitationLivePreview
          brideName={form.brideName}
          config={config}
          eventDate={form.eventDate}
          gallery={gallery}
          greeting={form.greeting}
          groomName={form.groomName}
          onMoveSection={moveSection}
          title={form.title}
          venueName={form.venueName}
        />
      </aside>
    </form>
  );
}

function Input({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <input
        className="rounded-md border border-ink/15 px-3 py-2"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <textarea
        className="min-h-24 rounded-md border border-ink/15 px-3 py-2"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function getSectionLabel(sectionId: InvitationSectionId) {
  switch (sectionId) {
    case "intro":
      return "소개";
    case "gallery":
      return "사진";
    case "location":
      return "오시는 길";
    case "gift":
      return "마음 전하실 곳";
    case "rsvp":
      return "참석 여부";
    case "guestbook":
      return "방명록";
    default:
      return sectionId;
  }
}

function getFontPresetClass(fontPreset: InvitationConfig["design"]["fontPreset"]) {
  switch (fontPreset) {
    case "modern":
      return "font-sans";
    case "romantic":
      return "font-serif tracking-[0.02em]";
    default:
      return "font-serif";
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
