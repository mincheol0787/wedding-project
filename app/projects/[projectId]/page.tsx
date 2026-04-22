import { redirect } from "next/navigation";

type ProjectAliasPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectAliasPage({ params }: ProjectAliasPageProps) {
  const { projectId } = await params;
  redirect(`/dashboard/projects/${projectId}`);
}
