import type { ReactNode } from "react";
import { CopyAccountButton } from "@/components/invitation/public/copy-account-button";
import { GuestbookForm, RsvpForm } from "@/components/invitation/public/public-forms";
import { InvitationGallery } from "@/components/invitation/shared/invitation-gallery";
import { KakaoMapEmbed } from "@/components/invitation/shared/kakao-map";
import {
  type InvitationConfig,
  type InvitationGalleryItem,
  type InvitationSectionId
} from "@/lib/invitation/types";

export type InvitationViewData = {
  mode: "published" | "preview" | "sample";
  slug?: string;
  title: string;
  groomName: string;
  brideName: string;
  groomFatherName?: string | null;
  groomMotherName?: string | null;
  brideFatherName?: string | null;
  brideMotherName?: string | null;
  eventDate?: Date | null;
  greeting?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueDetail?: string | null;
  mapProvider?: string | null;
  mapLat?: number | null;
  mapLng?: number | null;
  gallery: InvitationGalleryItem[];
  config: InvitationConfig;
  rsvpEnabled: boolean;
  guestbookEnabled: boolean;
  guestbookEntries: Array<{
    id: string;
    name: string;
    message: string;
    isPrivate: boolean;
  }>;
};

type InvitationViewProps = {
  invitation: InvitationViewData;
};

export function InvitationView({ invitation }: InvitationViewProps) {
  const copy = invitation.config.copy;
  const fontClass = getFontClass(invitation.config.design.fontPreset);
  const eventDate = invitation.eventDate
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "full",
        timeStyle: "short"
      }).format(invitation.eventDate)
    : "예식 일시를 준비 중입니다.";

  const sections = invitation.config.sectionOrder.filter((sectionId) =>
    shouldRenderSection(sectionId, invitation)
  );

  return (
    <main className={`min-h-screen bg-[#f7f2ed] px-3 py-4 text-ink sm:px-4 ${fontClass}`}>
      <article className="mx-auto max-w-md overflow-hidden rounded-md border border-black/5 bg-white shadow-[0_20px_70px_rgba(36,36,36,0.08)]">
        <header className="border-b border-[#f1e7df] bg-[#fffaf6] px-6 pb-12 pt-14 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose">
            {copy.heroEyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-ink">
            {invitation.groomName}
            <span className="mx-3 text-rose">&</span>
            {invitation.brideName}
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink/60">{eventDate}</p>
          {(invitation.groomFatherName ||
            invitation.groomMotherName ||
            invitation.brideFatherName ||
            invitation.brideMotherName) && (
            <div className="mt-8 rounded-md border border-[#efe4dd] bg-white px-4 py-4 text-sm leading-7 text-ink/70">
              <p>
                {renderParents(invitation.groomFatherName, invitation.groomMotherName)}의 아들{" "}
                <span className="font-semibold text-ink">{invitation.groomName}</span>
              </p>
              <p>
                {renderParents(invitation.brideFatherName, invitation.brideMotherName)}의 딸{" "}
                <span className="font-semibold text-ink">{invitation.brideName}</span>
              </p>
            </div>
          )}
          {invitation.mode === "preview" ? (
            <div className="mt-6 rounded-md border border-dashed border-rose/30 bg-rose/5 px-4 py-3 text-sm text-rose">
              미리보기 화면입니다. 발행 전이라도 편집 결과를 같은 레이아웃으로 확인할 수 있어요.
            </div>
          ) : null}
        </header>

        <div className="grid gap-0">
          {sections.map((sectionId) => (
            <SectionRenderer invitation={invitation} key={sectionId} sectionId={sectionId} />
          ))}
        </div>
      </article>
    </main>
  );
}

function SectionRenderer({
  invitation,
  sectionId
}: {
  invitation: InvitationViewData;
  sectionId: InvitationSectionId;
}) {
  const copy = invitation.config.copy;
  const venueGuide = invitation.config.venueGuide;

  switch (sectionId) {
    case "intro":
      return (
        <SectionShell title={invitation.title}>
          <p className="whitespace-pre-wrap text-center text-base leading-8 text-ink/72">
            {invitation.greeting || copy.heroDescription}
          </p>
        </SectionShell>
      );

    case "gallery":
      return (
        <SectionShell description={copy.galleryDescription} title={copy.galleryTitle}>
          <InvitationGallery
            gallery={invitation.gallery}
            options={invitation.config.galleryOptions}
            saveLabel={copy.saveImageLabel}
          />
        </SectionShell>
      );

    case "location":
      return (
        <SectionShell description={copy.locationDescription} title={copy.locationTitle}>
          <div className="grid gap-4 rounded-md bg-[#faf6f1] p-5">
            <div>
              <p className="text-base font-semibold text-ink">
                {invitation.venueName || "예식 장소를 준비 중입니다."}
              </p>
              {invitation.venueAddress ? (
                <p className="mt-2 text-sm leading-6 text-ink/65">{invitation.venueAddress}</p>
              ) : null}
              {invitation.venueDetail ? (
                <p className="mt-1 text-sm leading-6 text-ink/60">{invitation.venueDetail}</p>
              ) : null}
            </div>

            {renderVenueGuideRows(venueGuide).length ? (
              <dl className="grid gap-3 rounded-md border border-white/70 bg-white p-4 text-sm">
                {renderVenueGuideRows(venueGuide).map((item) => (
                  <div className="grid grid-cols-[72px_1fr] gap-3" key={item.label}>
                    <dt className="font-medium text-ink/50">{item.label}</dt>
                    <dd className="text-ink/75">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {typeof invitation.mapLat === "number" && typeof invitation.mapLng === "number" ? (
              <div className="grid gap-3">
                <KakaoMapEmbed
                  lat={invitation.mapLat}
                  lng={invitation.mapLng}
                  title={invitation.venueName || invitation.title}
                />
                <a
                  className="inline-flex w-fit rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
                  href={`https://map.kakao.com/link/to/${encodeURIComponent(
                    invitation.venueName || invitation.title
                  )},${invitation.mapLat},${invitation.mapLng}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {copy.mapButtonLabel}
                </a>
              </div>
            ) : null}
          </div>
        </SectionShell>
      );

    case "gift":
      return invitation.config.bankAccounts.length ? (
        <SectionShell description={copy.giftDescription} title={copy.giftTitle}>
          <div className="grid gap-3">
            {invitation.config.bankAccounts.map((account) => (
              <div className="rounded-md border border-ink/10 p-4" key={account.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-rose">{account.label}</p>
                    <p className="mt-1 text-sm text-ink/70">
                      {account.bankName} {account.accountNumber}
                    </p>
                    <p className="mt-1 text-sm text-ink/60">{account.holderName}</p>
                  </div>
                  <CopyAccountButton
                    text={`${account.bankName} ${account.accountNumber} ${account.holderName}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
      ) : null;

    case "rsvp":
      return invitation.rsvpEnabled ? (
        <SectionShell description={copy.rsvpDescription} title={copy.rsvpTitle}>
          {invitation.slug && invitation.mode === "published" ? (
            <RsvpForm slug={invitation.slug} />
          ) : (
            <DisabledMessage
              text={
                invitation.mode === "preview"
                  ? "미리보기에서는 참석 여부를 제출하지 않습니다."
                  : "샘플 페이지에서는 참석 여부를 제출하지 않습니다."
              }
            />
          )}
        </SectionShell>
      ) : null;

    case "guestbook":
      return invitation.guestbookEnabled ? (
        <SectionShell description={copy.guestbookDescription} title={copy.guestbookTitle}>
          {invitation.slug && invitation.mode === "published" ? (
            <GuestbookForm slug={invitation.slug} />
          ) : (
            <DisabledMessage
              text={
                invitation.mode === "preview"
                  ? "미리보기에서는 방명록을 작성하지 않습니다."
                  : "샘플 페이지에서는 방명록을 작성하지 않습니다."
              }
            />
          )}
          {invitation.guestbookEntries.length ? (
            <div className="mt-6 grid gap-3">
              {invitation.guestbookEntries.map((entry) => (
                <article className="rounded-md bg-[#faf6f1] p-4" key={entry.id}>
                  <p className="text-sm font-semibold text-ink">{entry.name}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/65">
                    {entry.isPrivate ? "비공개 메시지입니다." : entry.message}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </SectionShell>
      ) : null;

    default:
      return null;
  }
}

function SectionShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[#f3ebe5] px-6 py-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-6 text-ink/58">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DisabledMessage({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/15 bg-[#faf6f1] px-4 py-4 text-sm text-ink/55">
      {text}
    </div>
  );
}

function renderParents(father?: string | null, mother?: string | null) {
  const names = [father, mother].filter(Boolean);
  return names.length ? names.join(" · ") : "가족";
}

function shouldRenderSection(sectionId: InvitationSectionId, invitation: InvitationViewData) {
  switch (sectionId) {
    case "gallery":
      return invitation.gallery.length > 0;
    case "gift":
      return invitation.config.bankAccounts.length > 0;
    case "rsvp":
      return invitation.rsvpEnabled;
    case "guestbook":
      return invitation.guestbookEnabled;
    case "location":
      return Boolean(
        invitation.venueName ||
          invitation.venueAddress ||
          invitation.venueDetail ||
          invitation.mapLat ||
          invitation.mapLng
      );
    case "intro":
      return Boolean(invitation.greeting || invitation.config.copy.heroDescription);
    default:
      return false;
  }
}

function renderVenueGuideRows(venueGuide: InvitationConfig["venueGuide"]) {
  return [
    { label: "홀", value: venueGuide.hall },
    { label: "층", value: venueGuide.floor },
    { label: "주차", value: venueGuide.parking },
    { label: "식사", value: venueGuide.meal },
    { label: "기타", value: venueGuide.extra }
  ].filter((item) => item.value);
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
