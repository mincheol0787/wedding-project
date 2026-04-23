import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { normalizeVideoRenderJobItem } from "@/components/video/types";
import { VideoProductionWorkspace } from "@/components/video/video-production-workspace";
import { getWeddingProjectForVideoEditor } from "@/server/projects/service";
import { getRenderJobsForProject } from "@/server/video/render-jobs";

type VideoEditorPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function VideoEditorPage({ params }: VideoEditorPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { projectId } = await params;
  const project = await getWeddingProjectForVideoEditor(session.user.id, projectId);

  if (!project) {
    notFound();
  }

  const renderJobs = await getRenderJobsForProject(session.user.id, project.id);

  return (
    <main className="min-h-screen bg-porcelain px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-ink/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Link className="text-sm font-medium text-ink/55" href={`/dashboard/projects/${project.id}`} prefetch>
              내 작업으로 돌아가기
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-rose">
              Wedding Video
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">식전영상 만들기</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65">
              노래 분위기를 고르고 사진을 채운 뒤 화면 순서와 문구를 다듬으면 영상 제작을 바로 시작할 수 있어요.
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-white px-5 py-4 text-sm text-ink/65">
            <p className="font-medium text-ink">{project.title}</p>
            <p className="mt-1">
              {project.groomName} & {project.brideName}
            </p>
          </div>
        </header>

        <VideoProductionWorkspace
          initialJobs={renderJobs.map((job) => normalizeVideoRenderJobItem(job))}
          project={{
            id: project.id,
            title: project.videoProject?.title ?? `${project.title} 식전영상`,
            groomName: project.groomName,
            brideName: project.brideName,
            weddingDate: project.weddingDate?.toISOString()
          }}
          projectId={project.id}
        />
      </section>
    </main>
  );
}
