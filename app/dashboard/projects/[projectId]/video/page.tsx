import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { VideoEditor } from "@/components/video/editor/video-editor";
import { RenderJobList } from "@/components/video/render-job-list";
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
            <Link className="text-sm font-medium text-ink/55" href={`/dashboard/projects/${project.id}`}>
              프로젝트 개요로 돌아가기
            </Link>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-rose">
              Wedding Video
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">식전영상 편집</h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink/65">
              사진, 문구, 배경음악, 템플릿을 조합해 Remotion 렌더링 데이터까지 바로 연결할 수 있어요.
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-white px-5 py-4 text-sm text-ink/65">
            <p className="font-medium text-ink">{project.title}</p>
            <p className="mt-1">
              {project.groomName} & {project.brideName}
            </p>
          </div>
        </header>

        <VideoEditor
          projectId={project.id}
          project={{
            id: project.id,
            title: project.videoProject?.title ?? `${project.title} 식전영상`,
            groomName: project.groomName,
            brideName: project.brideName
          }}
        />

        <section className="mt-8 grid gap-4 rounded-md border border-ink/10 bg-white/70 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Jobs</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">렌더링 상태</h2>
          </div>
          <RenderJobList jobs={renderJobs} />
        </section>
      </section>
    </main>
  );
}
