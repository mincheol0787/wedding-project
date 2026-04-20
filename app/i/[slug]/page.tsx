import Image from "next/image";
import { notFound } from "next/navigation";
import { CopyAccountButton } from "@/components/invitation/public/copy-account-button";
import { GuestbookForm, RsvpForm } from "@/components/invitation/public/public-forms";
import { getPublishedInvitationBySlug } from "@/server/invitations/public-query";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;

  if (slug === "sample") {
    return <SampleInvitationPage />;
  }

  const invitation = await getPublishedInvitationBySlug(slug);

  if (!invitation) {
    notFound();
  }

  const eventDate = invitation.eventDate ?? invitation.weddingProject.weddingDate;
  const formattedDate = eventDate
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "full",
        timeStyle: "short"
      }).format(eventDate)
    : "예식일 미정";

  const gallery = invitation.parsedGallery;
  const bankAccounts = invitation.parsedConfig.bankAccounts;

  return (
    <main className="min-h-screen bg-porcelain text-ink">
      <article className="mx-auto max-w-md bg-white">
        <section className="px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose">Wedding Invitation</p>
          <h1 className="mt-10 text-4xl font-semibold leading-tight">
            {invitation.weddingProject.groomName}
            <span className="mx-3 text-rose">&</span>
            {invitation.weddingProject.brideName}
          </h1>
          <p className="mt-6 text-sm leading-7 text-ink/60">{formattedDate}</p>
          <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink/70">
            {invitation.greeting || "서로의 가장 따뜻한 계절이 되어 같은 길을 걸어가려 합니다."}
          </p>
        </section>

        {gallery.length > 0 ? (
          <section className="grid grid-cols-2 gap-1">
            {gallery.slice(0, 6).map((item) => (
              <div className="relative aspect-[3/4] bg-porcelain" key={item.id}>
                <Image alt={item.alt ?? item.fileName} className="object-cover" fill src={item.src} unoptimized />
              </div>
            ))}
          </section>
        ) : null}

        <section className="px-6 py-12">
          <h2 className="text-center text-2xl font-semibold">오시는 길</h2>
          <div className="mt-6 rounded-md bg-porcelain p-5">
            <p className="font-semibold">{invitation.venueName ?? "장소 미정"}</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">{invitation.venueAddress}</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">{invitation.venueDetail}</p>
            <div className="mt-5 rounded-md border border-ink/10 bg-white p-5 text-center text-sm text-ink/55">
              지도 영역
              {invitation.mapLat && invitation.mapLng ? (
                <p className="mt-2">
                  {invitation.mapLat.toString()}, {invitation.mapLng.toString()}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {bankAccounts.length > 0 ? (
          <section className="px-6 py-12">
            <h2 className="text-center text-2xl font-semibold">마음 전하실 곳</h2>
            <div className="mt-6 grid gap-3">
              {bankAccounts.map((account) => (
                <div className="rounded-md border border-ink/10 p-4" key={account.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-rose">{account.label}</p>
                      <p className="mt-1 text-sm text-ink/65">
                        {account.bankName} {account.accountNumber}
                      </p>
                      <p className="mt-1 text-sm text-ink/65">{account.holderName}</p>
                    </div>
                    <CopyAccountButton text={`${account.bankName} ${account.accountNumber} ${account.holderName}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {invitation.rsvpEnabled ? (
          <section className="px-6 py-12">
            <h2 className="text-center text-2xl font-semibold">참석 여부</h2>
            <div className="mt-6">
              <RsvpForm slug={slug} />
            </div>
          </section>
        ) : null}

        {invitation.guestbookEnabled ? (
          <section className="px-6 py-12">
            <h2 className="text-center text-2xl font-semibold">방명록</h2>
            <div className="mt-6">
              <GuestbookForm slug={slug} />
            </div>
            <div className="mt-8 grid gap-3">
              {invitation.guestbookEntries.map((entry) => (
                <article className="rounded-md bg-porcelain p-4" key={entry.id}>
                  <p className="text-sm font-semibold">{entry.name}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/65">
                    {entry.isPrivate ? "비공개 메시지입니다." : entry.message}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}

function SampleInvitationPage() {
  const sampleGallery = [
    {
      id: "sample-gallery-1",
      src: createSampleImageDataUri("Together", "#ead3d7"),
      fileName: "sample-1.svg",
      alt: "샘플 웨딩 이미지"
    },
    {
      id: "sample-gallery-2",
      src: createSampleImageDataUri("Promise", "#d7dfd4"),
      fileName: "sample-2.svg",
      alt: "샘플 웨딩 이미지"
    },
    {
      id: "sample-gallery-3",
      src: createSampleImageDataUri("Forever", "#e2d3b2"),
      fileName: "sample-3.svg",
      alt: "샘플 웨딩 이미지"
    },
    {
      id: "sample-gallery-4",
      src: createSampleImageDataUri("Wedding Day", "#d8d2e8"),
      fileName: "sample-4.svg",
      alt: "샘플 웨딩 이미지"
    }
  ];

  return (
    <main className="min-h-screen bg-porcelain text-ink">
      <article className="mx-auto max-w-md bg-white">
        <section className="px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose">
            Wedding Invitation
          </p>
          <h1 className="mt-10 text-4xl font-semibold leading-tight">
            민준
            <span className="mx-3 text-rose">&</span>
            서연
          </h1>
          <p className="mt-6 text-sm leading-7 text-ink/60">
            2026년 10월 24일 토요일 오후 2시
          </p>
          <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink/70">
            서로의 가장 따뜻한 계절이 되어 같은 길을 걸어가려 합니다.
            {"\n"}소중한 날, 함께 자리해 축복해 주세요.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-1">
          {sampleGallery.map((item) => (
            <div className="relative aspect-[3/4] bg-porcelain" key={item.id}>
              <Image alt={item.alt} className="object-cover" fill src={item.src} unoptimized />
            </div>
          ))}
        </section>

        <section className="px-6 py-12">
          <h2 className="text-center text-2xl font-semibold">오시는 길</h2>
          <div className="mt-6 rounded-md bg-porcelain p-5">
            <p className="font-semibold">라온웨딩홀 3층 그랜드볼룸</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              서울특별시 강남구 테헤란로 123
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              지하철 2호선 역삼역 3번 출구에서 도보 5분
            </p>
            <div className="mt-5 rounded-md border border-ink/10 bg-white p-5 text-center text-sm text-ink/55">
              지도 미리보기 영역
              <p className="mt-2">37.5000, 127.0360</p>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <h2 className="text-center text-2xl font-semibold">마음 전하실 곳</h2>
          <div className="mt-6 grid gap-3">
            <div className="rounded-md border border-ink/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-rose">신랑측</p>
                  <p className="mt-1 text-sm text-ink/65">국민은행 123456-00-123456</p>
                  <p className="mt-1 text-sm text-ink/65">김민준</p>
                </div>
                <CopyAccountButton text="국민은행 123456-00-123456 김민준" />
              </div>
            </div>
            <div className="rounded-md border border-ink/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-rose">신부측</p>
                  <p className="mt-1 text-sm text-ink/65">신한은행 987654-00-987654</p>
                  <p className="mt-1 text-sm text-ink/65">이서연</p>
                </div>
                <CopyAccountButton text="신한은행 987654-00-987654 이서연" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <h2 className="text-center text-2xl font-semibold">참석 여부</h2>
          <div className="mt-6 grid gap-3 rounded-md bg-porcelain p-4 text-sm text-ink/60">
            <input className="rounded-md border border-ink/15 px-3 py-3" disabled placeholder="이름" />
            <input className="rounded-md border border-ink/15 px-3 py-3" disabled placeholder="연락처" />
            <button className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white" disabled>
              예시 화면입니다
            </button>
          </div>
        </section>

        <section className="px-6 py-12">
          <h2 className="text-center text-2xl font-semibold">방명록</h2>
          <div className="mt-6 grid gap-3">
            <article className="rounded-md bg-porcelain p-4">
              <p className="text-sm font-semibold">지훈</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                두 분의 새로운 시작을 진심으로 축하합니다.
              </p>
            </article>
            <article className="rounded-md bg-porcelain p-4">
              <p className="text-sm font-semibold">하은</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                오래오래 서로의 편이 되어 행복하세요.
              </p>
            </article>
          </div>
        </section>
      </article>
    </main>
  );
}

function createSampleImageDataUri(title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f8f6f2"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="1200" fill="url(#bg)"/>
      <rect x="72" y="88" width="756" height="1024" rx="24" fill="rgba(255,255,255,0.34)" stroke="rgba(255,255,255,0.78)" stroke-width="2"/>
      <circle cx="450" cy="520" r="132" fill="rgba(255,255,255,0.42)"/>
      <text x="450" y="830" fill="#242424" font-family="Georgia, serif" font-size="52" text-anchor="middle">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
