import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { InvitationView, type InvitationViewData } from "@/components/invitation/shared/invitation-view";
import { getInvitationEditorProject } from "@/server/invitations/service";

type InvitationPreviewPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function InvitationPreviewPage({ params }: InvitationPreviewPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { projectId } = await params;
  const project = await getInvitationEditorProject(session.user.id, projectId);

  if (!project) {
    notFound();
  }

  const invitation = project.invitationProject;
  const viewData: InvitationViewData = {
    mode: "preview",
    slug: invitation.publicSlug,
    title: invitation.title,
    groomName: project.groomName,
    brideName: project.brideName,
    groomFatherName: invitation.groomFatherName,
    groomMotherName: invitation.groomMotherName,
    brideFatherName: invitation.brideFatherName,
    brideMotherName: invitation.brideMotherName,
    contactPhoneGroom: invitation.contactPhoneGroom,
    contactPhoneBride: invitation.contactPhoneBride,
    eventDate: invitation.eventDate ?? project.weddingDate,
    greeting: invitation.greeting,
    venueName: invitation.venueName ?? project.venueName,
    venueAddress: invitation.venueAddress ?? project.venueAddress,
    venueDetail: invitation.venueDetail,
    mapProvider: invitation.mapProvider,
    mapLat: invitation.mapLat ? Number(invitation.mapLat) : null,
    mapLng: invitation.mapLng ? Number(invitation.mapLng) : null,
    gallery: invitation.parsedGallery,
    config: invitation.parsedConfig,
    rsvpEnabled: invitation.rsvpEnabled,
    guestbookEnabled: invitation.guestbookEnabled,
    guestbookEntries: []
  };

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
              Invitation Preview
            </p>
            <p className="mt-1 text-sm text-ink/60">발행 전에 실제 모바일 화면 흐름으로 확인할 수 있습니다.</p>
          </div>
          <Link
            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink"
            href={`/dashboard/projects/${project.id}/invitation`}
          >
            편집으로 돌아가기
          </Link>
        </div>
      </div>
      <InvitationView invitation={viewData} />
    </>
  );
}
