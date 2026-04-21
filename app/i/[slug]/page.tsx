import { notFound } from "next/navigation";
import { InvitationView, type InvitationViewData } from "@/components/invitation/shared/invitation-view";
import { createDefaultInvitationConfig } from "@/lib/invitation/types";
import { getPublishedInvitationBySlug } from "@/server/invitations/public-query";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { slug } = await params;

  if (slug === "sample") {
    return <InvitationView invitation={buildSampleInvitation()} />;
  }

  const invitation = await getPublishedInvitationBySlug(slug);

  if (!invitation) {
    notFound();
  }

  const viewData: InvitationViewData = {
    mode: "published",
    slug,
    title: invitation.title,
    groomName: invitation.weddingProject.groomName,
    brideName: invitation.weddingProject.brideName,
    groomFatherName: invitation.groomFatherName,
    groomMotherName: invitation.groomMotherName,
    brideFatherName: invitation.brideFatherName,
    brideMotherName: invitation.brideMotherName,
    eventDate: invitation.eventDate ?? invitation.weddingProject.weddingDate,
    greeting: invitation.greeting,
    venueName: invitation.venueName ?? invitation.weddingProject.venueName,
    venueAddress: invitation.venueAddress ?? invitation.weddingProject.venueAddress,
    venueDetail: invitation.venueDetail,
    mapProvider: invitation.mapProvider,
    mapLat: invitation.mapLat ? Number(invitation.mapLat) : null,
    mapLng: invitation.mapLng ? Number(invitation.mapLng) : null,
    gallery: invitation.parsedGallery,
    config: invitation.parsedConfig,
    rsvpEnabled: invitation.rsvpEnabled,
    guestbookEnabled: invitation.guestbookEnabled,
    guestbookEntries: invitation.guestbookEntries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      message: entry.message,
      isPrivate: entry.isPrivate
    }))
  };

  return <InvitationView invitation={viewData} />;
}

function buildSampleInvitation(): InvitationViewData {
  const config = createDefaultInvitationConfig("soft-rose");

  config.galleryOptions.displayMode = "animated";
  config.galleryOptions.showSaveButton = true;
  config.copy.heroDescription =
    "서로의 하루를 닮아가며 차분하게 쌓아온 시간 끝에 결혼합니다.";
  config.copy.locationDescription = "예식장 안내와 함께 홀, 층, 주차 정보를 확인해 주세요.";
  config.venueGuide.hall = "그랜드 라비앙 로즈홀";
  config.venueGuide.floor = "3층";
  config.venueGuide.parking = "건물 지하 1-4층, 2시간 무료";
  config.venueGuide.meal = "예식 후 4층 연회장 뷔페";
  config.venueGuide.extra = "지하철 2호선 도보 4분";
  config.bankAccounts = [
    {
      id: "sample-account-1",
      label: "신랑측",
      bankName: "국민은행",
      accountNumber: "123456-00-123456",
      holderName: "김민수"
    },
    {
      id: "sample-account-2",
      label: "신부측",
      bankName: "신한은행",
      accountNumber: "987654-00-987654",
      holderName: "이서연"
    }
  ];

  return {
    mode: "sample",
    title: "민수 그리고 서연의 결혼식",
    groomName: "민수",
    brideName: "서연",
    groomFatherName: "김영호",
    groomMotherName: "박미정",
    brideFatherName: "이정우",
    brideMotherName: "최윤희",
    eventDate: new Date("2026-10-24T14:00:00+09:00"),
    greeting: "서로의 계절이 되어 준 두 사람이, 소중한 분들과 새로운 시작을 나누고 싶습니다.",
    venueName: "라비앙 웨딩홀",
    venueAddress: "서울 강남구 테헤란로 123",
    venueDetail: "3층 로즈홀",
    mapProvider: "kakao",
    mapLat: 37.5004,
    mapLng: 127.0368,
    gallery: [
      createSampleGalleryItem("sample-1", "Together", "#ead8dd"),
      createSampleGalleryItem("sample-2", "Promise", "#dfe8dc"),
      createSampleGalleryItem("sample-3", "Cherish", "#eee0c8"),
      createSampleGalleryItem("sample-4", "Forever", "#ddd7ea")
    ],
    config,
    rsvpEnabled: true,
    guestbookEnabled: true,
    guestbookEntries: [
      {
        id: "sample-message-1",
        name: "지연",
        message: "두 분의 시작을 진심으로 축하해요. 오래도록 다정한 하루가 계속되길 바라요.",
        isPrivate: false
      },
      {
        id: "sample-message-2",
        name: "현우",
        message: "함께 웃는 날이 더 많아질 거예요. 정말 축하합니다.",
        isPrivate: false
      }
    ]
  };
}

function createSampleGalleryItem(id: string, title: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fbf7f4"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="900" height="1200" fill="url(#bg)"/>
      <rect x="84" y="96" width="732" height="1008" rx="26" fill="rgba(255,255,255,0.38)" stroke="rgba(255,255,255,0.82)" stroke-width="2"/>
      <circle cx="450" cy="500" r="148" fill="rgba(255,255,255,0.48)"/>
      <text x="450" y="835" fill="#242424" font-family="Georgia, serif" font-size="54" text-anchor="middle">${title}</text>
    </svg>
  `;

  return {
    id,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    fileName: `${id}.svg`,
    alt: `${title} sample image`
  };
}
