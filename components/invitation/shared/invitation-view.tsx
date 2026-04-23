import Image from "next/image";
import Link from "next/link";
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
  contactPhoneGroom?: string | null;
  contactPhoneBride?: string | null;
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
  const coverImage = getMainGalleryImage(invitation.gallery, invitation.config.galleryOptions.mainImageId);

  if (invitation.mode === "sample") {
    return (
      <SampleInvitationView
        coverImage={coverImage}
        eventDate={eventDate}
        fontClass={fontClass}
        invitation={invitation}
        sections={sections}
      />
    );
  }

  return (
    <main className={`min-h-screen bg-[#f7f2ed] px-3 py-4 text-ink sm:px-4 ${fontClass}`}>
      <article className="mx-auto max-w-md overflow-hidden rounded-md border border-black/5 bg-white shadow-[0_20px_70px_rgba(36,36,36,0.08)]">
        <InvitationHero coverImage={coverImage} eventDate={eventDate} invitation={invitation} />

        <div className="grid gap-0">
          {sections.map((sectionId) => (
            <SectionRenderer invitation={invitation} key={sectionId} sectionId={sectionId} />
          ))}
        </div>
      </article>
    </main>
  );
}

function SampleInvitationView({
  invitation,
  sections,
  coverImage,
  eventDate,
  fontClass
}: {
  invitation: InvitationViewData;
  sections: InvitationSectionId[];
  coverImage?: InvitationGalleryItem;
  eventDate: string;
  fontClass: string;
}) {
  return (
    <main className={`min-h-screen bg-[#f7f2ed] text-ink ${fontClass}`}>
      <section className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:py-10">
        <div className="mb-7 grid gap-5 rounded-md border border-ink/10 bg-white/82 p-5 shadow-[0_18px_60px_rgba(36,36,36,0.08)] backdrop-blur lg:grid-cols-[1fr_auto] lg:items-end lg:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
              Sample Invitation
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              모바일 청첩장 샘플을 한눈에 확인하세요
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/62">
              실제 공개 청첩장은 모바일에 최적화되어 보이고, 이 샘플 화면에서는 필요한 정보를
              놓치지 않도록 각 섹션을 넓은 카드로 함께 펼쳐 보여줍니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
              href="/login"
            >
              무료로 시작하기
            </Link>
            <Link
              className="inline-flex rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7f2ed]"
              href="/"
            >
              서비스 둘러보기
            </Link>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(380px,440px)_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-24">
            <article className="max-h-[calc(100vh-7rem)] min-w-0 overflow-y-auto rounded-md border border-black/5 bg-white shadow-[0_20px_70px_rgba(36,36,36,0.1)]">
              <InvitationHero
                coverImage={coverImage}
                eventDate={eventDate}
                invitation={invitation}
                minHeightClass="min-h-[500px]"
              />
              <div className="grid gap-0">
                {sections.map((sectionId) => (
                  <SectionRenderer invitation={invitation} key={sectionId} sectionId={sectionId} />
                ))}
              </div>
            </article>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <SampleStat label="섹션" value={`${sections.length}개`} />
              <SampleStat label="사진" value={`${invitation.gallery.length}장`} />
              <SampleStat label="폼" value={invitation.rsvpEnabled ? "사용" : "미사용"} />
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            <section className="rounded-md border border-ink/10 bg-white p-5 shadow-[0_16px_54px_rgba(36,36,36,0.07)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose">
                Overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{invitation.title}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SampleInfo label="예식 일시" value={eventDate} />
                <SampleInfo
                  label="예식 장소"
                  value={[invitation.venueName, invitation.venueDetail].filter(Boolean).join(" · ")}
                />
                <SampleInfo
                  label="제공 기능"
                  value="갤러리, 지도, 계좌 복사, 참석 의사, 방명록"
                />
              </div>
            </section>

            {sections.map((sectionId, index) => (
              <article
                className="min-w-0 overflow-hidden rounded-md border border-ink/10 bg-white shadow-[0_16px_54px_rgba(36,36,36,0.06)]"
                id={`sample-section-${sectionId}`}
                key={sectionId}
              >
                <div className="border-b border-[#f3ebe5] bg-[#fbf8f4] px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink">
                      {getSectionLabel(sectionId)}
                    </h3>
                  </div>
                </div>
                <SectionRenderer invitation={invitation} sectionId={sectionId} />
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function InvitationHero({
  invitation,
  coverImage,
  eventDate,
  minHeightClass = "min-h-[560px]"
}: {
  invitation: InvitationViewData;
  coverImage?: InvitationGalleryItem;
  eventDate: string;
  minHeightClass?: string;
}) {
  const copy = invitation.config.copy;

  return (
    <header
      className={`relative ${minHeightClass} overflow-hidden border-b border-[#f1e7df] text-center ${
        coverImage ? "" : "bg-[#fffaf6]"
      }`}
    >
      {coverImage ? (
        <Image
          alt={coverImage.alt ?? coverImage.fileName}
          className={invitation.config.design.autoFocus ? "object-cover" : "object-contain"}
          fill
          priority
          src={coverImage.src}
          style={{
            objectPosition: invitation.config.design.autoFocus ? "center 42%" : "center center"
          }}
          unoptimized
        />
      ) : null}
      {coverImage ? <div className="absolute inset-0 bg-black/18" /> : null}
      <div
        className="absolute inset-x-6 top-1/2"
        style={{
          transform: `translateY(calc(-50% + ${invitation.config.design.heroOffsetY}px))`,
          transitionDuration: `${invitation.config.design.heroMotionSpeed / 2}s`
        }}
      >
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: invitation.config.design.heroAccentColor }}
        >
          {copy.heroEyebrow}
        </p>
        <h1
          className="mt-6 text-5xl font-semibold leading-[0.95]"
          style={{ color: invitation.config.design.heroTextColor }}
        >
          {invitation.groomName}
          <span className="mx-3">&</span>
          {invitation.brideName}
        </h1>
        <p className={`mt-5 text-sm leading-7 ${coverImage ? "text-white/84" : "text-ink/60"}`}>
          {eventDate}
        </p>
        {(invitation.venueName || invitation.venueAddress) && (
          <div className={`mt-3 text-sm leading-7 ${coverImage ? "text-white/78" : "text-ink/62"}`}>
            {invitation.venueName ? <p className="font-medium">{invitation.venueName}</p> : null}
            {invitation.venueAddress ? <p>{invitation.venueAddress}</p> : null}
          </div>
        )}
      </div>
      {(invitation.groomFatherName ||
        invitation.groomMotherName ||
        invitation.brideFatherName ||
        invitation.brideMotherName) && (
        <div className="absolute inset-x-6 bottom-8 rounded-md border border-white/30 bg-white/86 px-4 py-4 text-sm leading-7 text-ink/70 backdrop-blur">
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
        <div className="absolute left-6 right-6 top-6 rounded-md border border-dashed border-white/40 bg-white/80 px-4 py-3 text-sm text-rose backdrop-blur">
          미리보기 화면입니다. 발행 전이라도 편집 결과를 같은 레이아웃으로 확인할 수 있어요.
        </div>
      ) : null}
    </header>
  );
}

function SampleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-white/82 px-3 py-3 shadow-[0_10px_30px_rgba(36,36,36,0.05)]">
      <p className="text-xs text-ink/48">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function SampleInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md bg-[#f7f2ed] p-4">
      <p className="text-xs font-medium text-ink/45">{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink/75">{value || "준비 중입니다."}</p>
    </div>
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
          <div className="min-w-0 overflow-hidden rounded-md bg-[#faf6f1] p-4 sm:p-5">
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

            {invitation.config.visibility.venueGuide && renderVenueGuideRows(venueGuide).length ? (
              <dl className="grid min-w-0 gap-3 rounded-md border border-white/70 bg-white p-4 text-sm">
                {renderVenueGuideRows(venueGuide).map((item) => (
                  <div className="grid gap-1 sm:grid-cols-[72px_1fr] sm:gap-3" key={item.label}>
                    <dt className="font-medium text-ink/50">{item.label}</dt>
                    <dd className="min-w-0 break-words text-ink/75">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {typeof invitation.mapLat === "number" && typeof invitation.mapLng === "number" ? (
              <div className="grid gap-3">
                <KakaoMapEmbed
                  address={invitation.venueAddress}
                  lat={invitation.mapLat}
                  lng={invitation.mapLng}
                  title={invitation.venueName || invitation.title}
                />
                <div className="flex flex-wrap gap-2">
                  <a
                    className="inline-flex w-full justify-center rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink sm:w-auto"
                    href={
                      invitation.config.placeSearch.placeUrl ||
                      `https://map.kakao.com/link/map/${encodeURIComponent(
                        invitation.venueName || invitation.title
                      )},${invitation.mapLat},${invitation.mapLng}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    지도보기
                  </a>
                  <a
                    className="inline-flex w-full justify-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white sm:w-auto"
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(
                      invitation.venueName || invitation.title
                    )},${invitation.mapLat},${invitation.mapLng}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {copy.mapButtonLabel}
                  </a>
                </div>
              </div>
            ) : invitation.config.placeSearch.placeUrl ? (
              <a
                className="inline-flex w-full justify-center rounded-md border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink sm:w-fit"
                href={invitation.config.placeSearch.placeUrl}
                rel="noreferrer"
                target="_blank"
              >
                지도보기
              </a>
            ) : null}
          </div>
        </SectionShell>
      );

    case "contacts":
      return (
        <SectionShell title="연락처">
          <div className="grid gap-3">
            {invitation.contactPhoneGroom ? (
              <a
                className="flex items-center justify-between rounded-md border border-ink/10 px-4 py-3 text-sm text-ink"
                href={`tel:${invitation.contactPhoneGroom}`}
              >
                <span>신랑측</span>
                <span className="font-medium">{invitation.contactPhoneGroom}</span>
              </a>
            ) : null}
            {invitation.contactPhoneBride ? (
              <a
                className="flex items-center justify-between rounded-md border border-ink/10 px-4 py-3 text-sm text-ink"
                href={`tel:${invitation.contactPhoneBride}`}
              >
                <span>신부측</span>
                <span className="font-medium">{invitation.contactPhoneBride}</span>
              </a>
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
    <section className="min-w-0 border-t border-[#f3ebe5] px-4 py-9 sm:px-6 sm:py-10">
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
  const visibility = invitation.config.visibility;

  switch (sectionId) {
    case "gallery":
      return visibility.gallery && invitation.gallery.length > 0;
    case "gift":
      return visibility.gift && invitation.config.bankAccounts.length > 0;
    case "rsvp":
      return visibility.rsvp && invitation.rsvpEnabled;
    case "guestbook":
      return visibility.guestbook && invitation.guestbookEnabled;
    case "location":
      return visibility.location && Boolean(
        invitation.venueName ||
          invitation.venueAddress ||
          invitation.venueDetail ||
          invitation.mapLat ||
          invitation.mapLng
      );
    case "contacts":
      return visibility.contacts && Boolean(invitation.contactPhoneGroom || invitation.contactPhoneBride);
    case "intro":
      return visibility.greeting && Boolean(invitation.greeting || invitation.config.copy.heroDescription);
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

function getSectionLabel(sectionId: InvitationSectionId) {
  switch (sectionId) {
    case "intro":
      return "인사말";
    case "gallery":
      return "사진 갤러리";
    case "location":
      return "오시는 길";
    case "contacts":
      return "연락처";
    case "gift":
      return "마음 전하실 곳";
    case "rsvp":
      return "참석 의사";
    case "guestbook":
      return "방명록";
    default:
      return "청첩장 섹션";
  }
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

function getMainGalleryImage(gallery: InvitationGalleryItem[], mainImageId?: string) {
  return gallery.find((item) => item.id === mainImageId) ?? gallery[0];
}
