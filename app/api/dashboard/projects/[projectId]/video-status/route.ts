import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { normalizeVideoRenderJobItem } from "@/components/video/types";
import { getRenderJobsForProject } from "@/server/video/render-jobs";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { projectId } = await context.params;
    const jobs = await getRenderJobsForProject(session.user.id, projectId);

    return NextResponse.json({
      jobs: jobs.map((job) => normalizeVideoRenderJobItem(job))
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "영상 제작 상태를 불러오는 중 문제가 발생했습니다.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
