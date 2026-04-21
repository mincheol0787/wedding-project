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
    <main className="min-h-screen bg-porcelain px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link className="text-sm font-medium text-ink/55" href={`/dashboard/projects/${project.id}`}>
              프로젝트 개요로 돌아가기
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-rose">
              Mobile Invitation
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">모바일 청첩장 편집</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65">
              장소 검색, 지도, 갤러리 표현 방식, 문구, 섹션 순서를 한 화면에서 정리하고
              바로 미리보기까지 이어집니다.
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-white px-5 py-4 text-sm text-ink/65">
            <p className="font-medium text-ink">{project.title}</p>
            <p className="mt-1">상태: {invitation.status}</p>
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
