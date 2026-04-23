"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  type InvitationGalleryItem,
  type InvitationGalleryOptions
} from "@/lib/invitation/types";

type InvitationGalleryProps = {
  saveLabel: string;
  gallery: InvitationGalleryItem[];
  options: InvitationGalleryOptions;
};

export function InvitationGallery({ saveLabel, gallery, options }: InvitationGalleryProps) {
  const [selected, setSelected] = useState<InvitationGalleryItem | null>(null);
  const displayGallery = useMemo(() => gallery.slice(0, 12), [gallery]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  if (!displayGallery.length) {
    return null;
  }

  return (
    <>
      {options.displayMode === "full" ? (
        <div className="columns-2 gap-3 sm:columns-3">
          {displayGallery.map((item) => (
            <GalleryCard
              item={item}
              key={item.id}
              onOpen={() => options.enableZoom && setSelected(item)}
              options={options}
              saveLabel={saveLabel}
            />
          ))}
        </div>
      ) : options.displayMode === "animated" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {displayGallery.map((item) => (
            <GalleryImageButton
              disabled={!options.enableZoom}
              item={item}
              key={item.id}
              onOpen={() => options.enableZoom && setSelected(item)}
            />
          ))}
        </div>
      ) : (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
          {displayGallery.map((item) => (
            <GalleryImageButton
              disabled={!options.enableZoom}
              className="min-w-[76%] sm:min-w-[46%]"
              item={item}
              key={item.id}
              onOpen={() => options.enableZoom && setSelected(item)}
            />
          ))}
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/82 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="사진 크게 보기"
        >
          <button
            aria-label="사진 크게 보기 닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelected(null)}
            type="button"
          />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
            <button
              className="absolute right-3 top-3 z-10 rounded-md bg-white/92 px-3 py-2 text-xs font-medium text-ink shadow-sm transition hover:bg-white"
              onClick={() => setSelected(null)}
              type="button"
            >
              닫기
            </button>
            <div className="relative aspect-[4/5] max-h-[82vh] bg-[#f6f2ee]">
              <Image
                alt={selected.alt ?? selected.fileName}
                className="object-contain"
                fill
                src={selected.src}
                unoptimized
              />
            </div>
            {options.showSaveButton ? (
              <div className="flex items-center justify-between gap-3 border-t border-ink/10 p-4">
                <p className="text-sm text-ink/58">{selected.alt ?? selected.fileName}</p>
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

type GalleryImageButtonProps = {
  item: InvitationGalleryItem;
  onOpen: () => void;
  className?: string;
  disabled?: boolean;
};

function GalleryImageButton({ item, onOpen, className = "", disabled = false }: GalleryImageButtonProps) {
  return (
    <button
      aria-label={`${item.alt ?? item.fileName} 크게 보기`}
      className={`group relative aspect-[4/5] snap-center overflow-hidden rounded-md border border-white/80 bg-[#eef1ed] shadow-[0_12px_34px_rgba(36,36,36,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(36,36,36,0.12)] disabled:cursor-default disabled:hover:translate-y-0 ${className}`}
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
    </button>
  );
}

type GalleryCardProps = {
  item: InvitationGalleryItem;
  options: InvitationGalleryOptions;
  saveLabel: string;
  onOpen: () => void;
};

function GalleryCard({ item, options, saveLabel, onOpen }: GalleryCardProps) {
  return (
    <div className="mb-3 break-inside-avoid overflow-hidden rounded-md border border-ink/10 bg-white shadow-[0_12px_34px_rgba(36,36,36,0.06)]">
      <GalleryImageButton
        className="w-full shadow-none hover:translate-y-0"
        disabled={!options.enableZoom}
        item={item}
        onOpen={onOpen}
      />
      {options.showSaveButton ? (
        <div className="border-t border-ink/10 p-3">
          <a
            className="inline-flex rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink transition hover:bg-[#f7f2ed]"
            download={item.fileName}
            href={item.src}
          >
            {saveLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}
