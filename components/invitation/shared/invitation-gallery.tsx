"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type TouchEvent } from "react";
import {
  type InvitationGalleryItem,
  type InvitationGalleryOptions
} from "@/lib/invitation/types";

type InvitationGalleryProps = {
  saveLabel: string;
  gallery: InvitationGalleryItem[];
  options: InvitationGalleryOptions;
};

const initialVisibleCount = 12;

export function InvitationGallery({ saveLabel, gallery, options }: InvitationGalleryProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const visibleGallery = useMemo(
    () => (expanded ? gallery : gallery.slice(0, initialVisibleCount)),
    [expanded, gallery]
  );
  const selected = selectedIndex === null ? null : gallery[selectedIndex];
  const hasMore = gallery.length > initialVisibleCount;

  useEffect(() => {
    if (!selected || selectedIndex === null) {
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => getPreviousIndex(current, gallery.length));
        return;
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => getNextIndex(current, gallery.length));
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [gallery.length, selected, selectedIndex]);

  if (!gallery.length) {
    return null;
  }

  function openLightbox(item: InvitationGalleryItem) {
    if (!options.enableZoom) {
      return;
    }

    const index = gallery.findIndex((galleryItem) => galleryItem.id === item.id);
    setSelectedIndex(index >= 0 ? index : 0);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(deltaX) < 48) {
      return;
    }

    setSelectedIndex((current) =>
      deltaX > 0 ? getPreviousIndex(current, gallery.length) : getNextIndex(current, gallery.length)
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-ink">사진 {gallery.length}장</p>
          <p className="mt-1 text-xs leading-5 text-ink/48">
            사진을 누르면 크게 보고 좌우로 넘길 수 있어요.
          </p>
        </div>
        <span className="w-fit rounded-md bg-[#f7f2ed] px-3 py-1 text-xs font-medium text-ink/55">
          {getDisplayModeLabel(options.displayMode)}
        </span>
      </div>

      <div className={getGalleryGridClass(options.displayMode)}>
        {visibleGallery.map((item, index) => (
          <GalleryThumbnail
            disabled={!options.enableZoom}
            displayMode={options.displayMode}
            index={index}
            item={item}
            key={item.id}
            onOpen={() => openLightbox(item)}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-5 text-center">
          <button
            className="rounded-md border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-[#f7f2ed]"
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {expanded ? "사진 접기" : `사진 ${gallery.length - initialVisibleCount}장 더 보기`}
          </button>
        </div>
      ) : null}

      {selected && selectedIndex !== null ? (
        <div
          aria-label="사진 크게 보기"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/84 p-3 sm:p-5"
          role="dialog"
        >
          <button
            aria-label="사진 크게 보기 닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedIndex(null)}
            type="button"
          />
          <div
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-md bg-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]"
            onTouchEnd={handleTouchEnd}
            onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {selectedIndex + 1} / {gallery.length}
                </p>
                <p className="mt-1 max-w-[220px] truncate text-xs text-ink/50 sm:max-w-md">
                  {selected.alt ?? selected.fileName}
                </p>
              </div>
              <button
                className="rounded-md border border-ink/10 px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f2ed]"
                onClick={() => setSelectedIndex(null)}
                type="button"
              >
                닫기
              </button>
            </div>

            <div className="relative bg-[#f6f2ee]">
              <button
                aria-label="이전 사진"
                className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md bg-white/88 text-lg font-semibold text-ink shadow-sm transition hover:bg-white"
                onClick={() => setSelectedIndex((current) => getPreviousIndex(current, gallery.length))}
                type="button"
              >
                ‹
              </button>
              <div className="relative aspect-[4/5] max-h-[78vh] sm:aspect-[16/10]">
                <Image
                  alt={selected.alt ?? selected.fileName}
                  className="object-contain"
                  fill
                  src={selected.src}
                  unoptimized
                />
              </div>
              <button
                aria-label="다음 사진"
                className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md bg-white/88 text-lg font-semibold text-ink shadow-sm transition hover:bg-white"
                onClick={() => setSelectedIndex((current) => getNextIndex(current, gallery.length))}
                type="button"
              >
                ›
              </button>
            </div>

            {options.showSaveButton ? (
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 p-4">
                <p className="truncate text-sm text-ink/58">{selected.alt ?? selected.fileName}</p>
                <a
                  className="inline-flex rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#f7f2ed]"
                  download={selected.fileName}
                  href={selected.src}
                >
                  {saveLabel}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

type GalleryThumbnailProps = {
  disabled: boolean;
  displayMode: InvitationGalleryOptions["displayMode"];
  index: number;
  item: InvitationGalleryItem;
  onOpen: () => void;
};

function GalleryThumbnail({ disabled, displayMode, index, item, onOpen }: GalleryThumbnailProps) {
  return (
    <button
      aria-label={`${item.alt ?? item.fileName} 크게 보기`}
      className={`group relative overflow-hidden rounded-md border border-white/80 bg-[#eef1ed] text-left shadow-[0_12px_34px_rgba(36,36,36,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(36,36,36,0.12)] disabled:cursor-default disabled:hover:translate-y-0 ${getThumbnailClass(
        displayMode,
        index
      )}`}
      disabled={disabled}
      onClick={onOpen}
      type="button"
    >
      <Image
        alt={item.alt ?? item.fileName}
        className="object-cover transition duration-700 group-hover:scale-105"
        fill
        src={item.src}
        unoptimized
      />
      <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/8" />
      <span className="absolute bottom-2 right-2 rounded-md bg-white/84 px-2 py-1 text-[11px] font-medium text-ink/70 backdrop-blur">
        {index + 1}
      </span>
    </button>
  );
}

function getPreviousIndex(current: number | null, length: number) {
  if (!length) {
    return null;
  }

  if (current === null) {
    return 0;
  }

  return (current - 1 + length) % length;
}

function getNextIndex(current: number | null, length: number) {
  if (!length) {
    return null;
  }

  if (current === null) {
    return 0;
  }

  return (current + 1) % length;
}

function getGalleryGridClass(displayMode: InvitationGalleryOptions["displayMode"]) {
  switch (displayMode) {
    case "full":
      return "grid grid-cols-3 gap-2 sm:grid-cols-4";
    case "animated":
      return "grid grid-cols-2 gap-3 sm:grid-cols-3";
    default:
      return "grid grid-cols-3 gap-2 sm:grid-cols-4";
  }
}

function getThumbnailClass(displayMode: InvitationGalleryOptions["displayMode"], index: number) {
  if (displayMode === "animated") {
    return `${index % 3 === 1 ? "translate-y-3" : ""} aspect-[4/5]`;
  }

  if (displayMode === "full") {
    return "aspect-square";
  }

  return index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square";
}

function getDisplayModeLabel(displayMode: InvitationGalleryOptions["displayMode"]) {
  switch (displayMode) {
    case "animated":
      return "애니메이션형";
    case "full":
      return "전체보기형";
    default:
      return "슬라이드형";
  }
}
