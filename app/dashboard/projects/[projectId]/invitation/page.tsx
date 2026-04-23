import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { InvitationEditor } from "@/components/invitation/editor/invitation-editor";
import { env } from "@/lib/env";
import { getInvitationEditorProject } from "@/server/invitations/service";

type InvitationEditorPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function InvitationEditorPage({ params }: InvitationEditorPageProps) {
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
  const publicUrl = invitation.status === "PUBLISHED" ? `${env.APP_PUBLIC_URL}/i/${invitation.publicSlug}` : null;
  const previewUrl = `/dashboard/projects/${project.id}/invitation/preview`;

  return (
    <main className="min-h-screen bg-[#f5f7f4] px-4 py-8 sm:px-6 lg:py-10">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 grid gap-6 rounded-md border border-ink/10 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(36,36,36,0.05)] md:grid-cols-[1fr_auto] md:items-end lg:px-7 lg:py-6">
          <div>
            <Link className="text-sm font-medium text-ink/55 transition hover:text-rose" href={`/dashboard/projects/${project.id}`}>
              작업 관리로 돌아가기
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sage">
              Mobile Invitation
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink md:text-5xl">
              초대의 결을 다듬는 편집실
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink/62">
              템플릿, 문구, 사진, 장소, 섹션 순서를 한 흐름에서 정리하고 오른쪽에서 바로 확인합니다.
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-[#f8faf8] px-5 py-4 text-sm text-ink/65">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">Work</p>
            <p className="mt-2 font-medium text-ink">{project.title}</p>
            <p className="mt-1">청첩장 상태: {invitation.status}</p>
          </div>
        </header>

        <InvitationEditor
          defaults={{
            status: invitation.status,
            title: invitation.title,
            groomName: project.groomName,
            brideName: project.brideName,
            groomFatherName: invitation.groomFatherName ?? "",
            groomMotherName: invitation.groomMotherName ?? "",
            brideFatherName: invitation.brideFatherName ?? "",
            brideMotherName: invitation.brideMotherName ?? "",
            contactPhoneGroom: invitation.contactPhoneGroom ?? "",
            contactPhoneBride: invitation.contactPhoneBride ?? "",
            eventDate: toDateTimeLocal(invitation.eventDate ?? project.weddingDate),
            venueName: invitation.venueName ?? project.venueName ?? "",
            venueAddress: invitation.venueAddress ?? project.venueAddress ?? "",
            venueDetail: invitation.venueDetail ?? "",
            greeting: invitation.greeting ?? "",
            mapProvider: invitation.mapProvider ?? "kakao",
            mapLat: invitation.mapLat?.toString() ?? "",
            mapLng: invitation.mapLng?.toString() ?? "",
            gallery: invitation.parsedGallery,
            config: invitation.parsedConfig
          }}
          previewUrl={previewUrl}
          projectId={project.id}
          publicUrl={publicUrl}
        />
      </section>
    </main>
  );
}

function toDateTimeLocal(date: Date | null) {
  if (!date) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
}
