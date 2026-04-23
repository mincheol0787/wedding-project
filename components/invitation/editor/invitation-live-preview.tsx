"use client";

import Image from "next/image";
import { ReactNode, useState } from "react";
import {
  invitationTemplates,
  type InvitationConfig,
  type InvitationGalleryItem,
  type InvitationSectionId
} from "@/lib/invitation/types";

type InvitationLivePreviewProps = {
  title: string;
  groomName: string;
  brideName: string;
  contactPhoneGroom: string;
  contactPhoneBride: string;
  greeting: string;
  venueName: string;
  eventDate: string;
  gallery: InvitationGalleryItem[];
  config: InvitationConfig;
  onMoveSection?: (fromId: InvitationSectionId, targetId: InvitationSectionId) => void;
};

export function InvitationLivePreview({
  title,
  groomName,
  brideName,
  contactPhoneGroom,
  contactPhoneBride,
  greeting,
  venueName,
  eventDate,
  gallery,
  config,
  onMoveSection
}: InvitationLivePreviewProps) {
  const template =
    invitationTemplates.find((item) => item.id === config.templateId) ?? invitationTemplates[0];
  const previewGallery = gallery.slice(0, 3);
  const coverImage = gallery[0];
  const [draggingSectionId, setDraggingSectionId] = useState<InvitationSectionId | null>(null);

  function wrapPreviewSection(sectionId: InvitationSectionId, children: ReactNode) {
    return (
      <div
        className={`transition ${
          draggingSectionId === sectionId ? "bg-sage/10 opacity-80" : ""
        }`}
        data-preview-section={sectionId}
        draggable={Boolean(onMoveSection)}
        key={sectionId}
        onDragEnd={() => setDraggingSectionId(null)}
        onDragOver={(event) => {
          if (onMoveSection) {
            event.preventDefault();
          }
        }}
        onDragStart={() => setDraggingSectionId(sectionId)}
        onDrop={() => {
          if (draggingSectionId) {
            onMoveSection?.(draggingSectionId, sectionId);
          }
        }}
        title={onMoveSection ? "드래그해서 화면 순서를 바꿀 수 있습니다." : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ink/10 bg-[#f7f2ed] p-4 text-ink shadow-[0_20px_70px_rgba(36,36,36,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose">
            미리보기
          </p>
          <p className="mt-1 text-sm text-ink/55">수정한 내용이 바로 반영됩니다.</p>
        </div>
        <span className="rounded-md border border-ink/10 bg-white px-3 py-1 text-xs font-medium text-ink/65">
          {template.name}
        </span>
      </div>

      <div
        className={`mx-auto max-w-[430px] overflow-hidden rounded-md border border-white bg-white text-ink shadow-[0_24px_80px_rgba(36,36,36,0.12)] ${getFontClass(
          config.design.fontPreset
        )}`}
      >
        <div
          className={`relative min-h-[520px] overflow-hidden text-center ${coverImage ? "" : template.accentClass}`}
          data-preview-section="cover"
        >
          {coverImage ? (
            <Image
              alt={coverImage.alt ?? coverImage.fileName}
              className={config.design.autoFocus ? "object-cover" : "object-contain"}
              fill
              priority
              src={coverImage.src}
              style={{
                objectPosition: config.design.autoFocus ? "center 42%" : "center center"
              }}
              unoptimized
            />
          ) : null}
          {coverImage ? <div className="absolute inset-0 bg-ink/16" /> : null}
          <div
            className="absolute inset-x-6 top-1/2"
            style={{
              transform: `translateY(calc(-50% + ${config.design.heroOffsetY}px))`,
              transitionDuration: `${config.design.heroMotionSpeed / 2}s`
            }}
          >
            <p
              className="text-[12px] uppercase tracking-[0.28em]"
              style={{ color: config.design.heroAccentColor }}
            >
              {config.copy.heroEyebrow}
            </p>
            <h3
              className="mt-4 text-5xl font-semibold leading-[0.95]"
              style={{ color: config.design.heroTextColor }}
            >
              {groomName || "신랑"}
              <span className="mx-2">&</span>
              {brideName || "신부"}
            </h3>
            <p className="mt-5 text-sm text-white/84">{formatPreviewDate(eventDate)}</p>
            {venueName ? <p className="mt-2 text-xs text-white/74">{venueName}</p> : null}
          </div>
        </div>

        {config.sectionOrder.map((sectionId) => {
          if (sectionId === "intro") {
            if (!config.visibility.greeting) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">
                  {title || "청첩장 제목"}
                </h4>
                <p className="mt-3 whitespace-pre-wrap text-center text-sm leading-6 text-ink/65">
                  {greeting || config.copy.heroDescription}
                </p>
              </section>
            );
          }

          if (sectionId === "gallery" && previewGallery.length) {
            if (!config.visibility.gallery) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">
                  {config.copy.galleryTitle}
                </h4>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previewGallery.map((item) => (
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#eef1ed]" key={item.id}>
                      <Image
                        alt={item.alt ?? item.fileName}
                        className="object-cover"
                        fill
                        src={item.src}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sectionId === "location") {
            if (!config.visibility.location) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">
                  {config.copy.locationTitle}
                </h4>
                <div className="mt-4 rounded-md bg-[#f4f7f2] p-4 text-sm text-ink/70">
                  <p className="font-medium text-ink">{venueName || "예식장명"}</p>
                  {config.visibility.venueGuide ? (
                    <p className="mt-2">
                      {config.venueGuide.hall || "예식장 안내가 이곳에 표시됩니다."}
                    </p>
                  ) : null}
                </div>
              </section>
            );
          }

          if (sectionId === "contacts") {
            if (!config.visibility.contacts || (!contactPhoneGroom && !contactPhoneBride)) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">연락처</h4>
                <div className="mt-4 grid gap-2 text-sm text-ink/70">
                  {contactPhoneGroom ? (
                    <div className="rounded-md border border-ink/10 px-3 py-2">
                      신랑측 {contactPhoneGroom}
                    </div>
                  ) : null}
                  {contactPhoneBride ? (
                    <div className="rounded-md border border-ink/10 px-3 py-2">
                      신부측 {contactPhoneBride}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          }

          if (sectionId === "gift" && config.bankAccounts.length) {
            if (!config.visibility.gift) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">
                  {config.copy.giftTitle}
                </h4>
                <div className="mt-4 rounded-md border border-ink/10 p-3 text-sm text-ink/70">
                  {config.bankAccounts[0].bankName || "계좌 정보"}
                </div>
              </section>
            );
          }

          if (sectionId === "rsvp") {
            if (!config.visibility.rsvp) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">
                  {config.copy.rsvpTitle}
                </h4>
                <div className="mt-4 rounded-md bg-[#f4f7f2] p-4 text-center text-sm text-ink/60">
                  참석 여부 폼이 여기에 표시됩니다.
                </div>
              </section>
            );
          }

          if (sectionId === "guestbook") {
            if (!config.visibility.guestbook) {
              return null;
            }

            return wrapPreviewSection(
              sectionId,
              <section className="border-t border-[#edf0eb] px-5 py-5" key={sectionId}>
                <h4 className="text-center text-lg font-semibold text-ink">
                  {config.copy.guestbookTitle}
                </h4>
                <div className="mt-4 rounded-md bg-[#f4f7f2] p-4 text-center text-sm text-ink/60">
                  방명록이 여기에 표시됩니다.
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function formatPreviewDate(value: string) {
  if (!value) {
    return "예식 일시를 입력해 주세요.";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getFontClass(fontPreset: InvitationConfig["design"]["fontPreset"]) {
  switch (fontPreset) {
    case "modern":
      return "font-sans";
    case "romantic":
      return "font-serif tracking-[0.02em]";
    default:
      return "font-serif";
  }
}
