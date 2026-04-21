"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  type InvitationGalleryItem,
  type InvitationGalleryOptions
} from "@/lib/invitation/types";

type InvitationGalleryProps = {
  saveLabel: string;
  gallery: InvitationGalleryItem[];
  options: InvitationGalleryOptions;
};

export function InvitationGallery({
  saveLabel,
  gallery,
  options
}: InvitationGalleryProps) {
  const [selected, setSelected] = useState<InvitationGalleryItem | null>(null);
  const displayGallery = useMemo(() => gallery.slice(0, 12), [gallery]);

  if (!displayGallery.length) {
    return null;
  }

  return (
    <>
      {options.displayMode === "full" ? (
        <div className="grid gap-3">
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
        <div className="grid grid-cols-2 gap-2">
          {displayGallery.map((item, index) => (
            <button
              className={`group relative aspect-[3/4] overflow-hidden rounded-md border border-white/70 bg-porcelain ${
                index % 3 === 0 ? "translate-y-2" : ""
              }`}
              key={item.id}
              onClick={() => options.enableZoom && setSelected(item)}
              type="button"
            >
              <Image
                alt={item.alt ?? item.fileName}
                className="object-cover transition duration-700 group-hover:scale-105"
                fill
                src={item.src}
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
          {displayGallery.map((item) => (
            <button
              className="relative aspect-[3/4] min-w-[74%] snap-center overflow-hidden rounded-md border border-white/70 bg-porcelain"
              key={item.id}
              onClick={() => options.enableZoom && setSelected(item)}
              type="button"
            >
              <Image
                alt={item.alt ?? item.fileName}
                className="object-cover"
                fill
                src={item.src}
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-md bg-white">
            <button
              className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-3 py-2 text-xs font-medium text-ink"
              onClick={() => setSelected(null)}
              type="button"
            >
              닫기
            </button>
            <div className="relative aspect-[3/4]">
              <Image
                alt={selected.alt ?? selected.fileName}
                className="object-cover"
                fill
                src={selected.src}
                unoptimized
              />
            </div>
            {options.showSaveButton ? (
              <div className="border-t border-ink/10 p-4">
                <a
                  className="inline-flex rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
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

type GalleryCardProps = {
  item: InvitationGalleryItem;
  options: InvitationGalleryOptions;
  saveLabel: string;
  onOpen: () => void;
};

function GalleryCard({ item, options, saveLabel, onOpen }: GalleryCardProps) {
  return (
    <div className="overflow-hidden rounded-md border border-ink/10 bg-white">
      <button className="relative block aspect-[4/5] w-full" onClick={onOpen} type="button">
        <Image
          alt={item.alt ?? item.fileName}
          className="object-cover"
          fill
          src={item.src}
          unoptimized
        />
      </button>
      {options.showSaveButton ? (
        <div className="border-t border-ink/10 p-3">
          <a
            className="inline-flex rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
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
