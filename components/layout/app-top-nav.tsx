import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

type AppTopNavProps = {
  currentProjectId?: string;
  isAdmin?: boolean;
  userName?: string | null;
};

export function AppTopNav({ currentProjectId, isAdmin, userName }: AppTopNavProps) {
  const invitationHref = currentProjectId
    ? `/dashboard/projects/${currentProjectId}/invitation`
    : "/dashboard";
  const videoHref = currentProjectId ? `/dashboard/projects/${currentProjectId}/video` : "/dashboard";
  const projectHref = currentProjectId ? `/dashboard/projects/${currentProjectId}` : "/dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-[#fbfbf8]/92 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link className="shrink-0 text-xl font-semibold tracking-[-0.02em] text-ink" href="/">
          MC Page
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-ink/62 lg:flex">
          <TopNavLink href={projectHref}>프로젝트</TopNavLink>
          <TopNavLink href={invitationHref}>모바일 청첩장</TopNavLink>
          <TopNavLink href={videoHref}>식전영상</TopNavLink>
          <TopNavLink href="/i/sample">샘플 보기</TopNavLink>
          <TopNavLink href="/support">고객센터</TopNavLink>
          {isAdmin ? <TopNavLink href="/admin">관리자</TopNavLink> : null}
        </nav>

        <div className="flex items-center gap-2">
          {userName ? (
            <span className="hidden rounded-md bg-white px-3 py-2 text-xs font-medium text-ink/60 shadow-sm sm:inline-flex">
              {userName}
            </span>
          ) : null}
          <Link
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/88"
            href="/dashboard"
          >
            제작 내역
          </Link>
          {userName ? (
            <div className="hidden sm:block">
              <SignOutButton compact />
            </div>
          ) : (
            <Link
              className="hidden rounded-md border border-ink/15 px-3 py-2 text-sm font-medium text-ink transition hover:bg-white sm:inline-flex"
              href="/login"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function TopNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="rounded-md px-3 py-2 transition hover:bg-white hover:text-ink" href={href}>
      {children}
    </Link>
  );
}
