import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { requireAdminUser } from "@/server/auth/permissions";

export const dynamic = "force-dynamic";

export default async function AdminChangelogPage() {
  await requireAdminUser();

  const changelog = await readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8").catch(
    () => "# Changelog\n\n아직 기록된 변경 이력이 없습니다."
  );

  return (
    <main className="min-h-screen bg-porcelain px-6 py-8">
      <section className="mx-auto max-w-4xl">
        <Link className="text-sm font-medium text-ink/55" href="/admin">
          관리자 페이지로 돌아가기
        </Link>
        <div className="mt-8 rounded-md border border-ink/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">
            Change Log
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">변경 이력</h1>
          <div className="mt-6 grid gap-5 whitespace-pre-wrap rounded-md bg-porcelain/70 p-5 font-mono text-sm leading-7 text-ink/75">
            {changelog}
          </div>
        </div>
      </section>
    </main>
  );
}
