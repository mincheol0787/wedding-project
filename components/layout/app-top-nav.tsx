"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

type AppTopNavProps = {
  currentProjectId?: string;
  isAdmin?: boolean;
  userName?: string | null;
};

export function AppTopNav({ currentProjectId, isAdmin, userName }: AppTopNavProps) {
  const pathname = usePathname();
  const projectId = currentProjectId ?? getProjectIdFromPath(pathname);
  const isLoginPage = pathname === "/login";

  const projectHref = projectId ? `/dashboard/projects/${projectId}` : "/dashboard";
  const invitationHref = projectId ? `/dashboard/projects/${projectId}/invitation` : "/dashboard";
  const videoHref = projectId ? `/dashboard/projects/${projectId}/video` : "/dashboard";

  const links = [
    { href: projectHref, label: "내 작업" },
    { href: invitationHref, label: "모바일 청첩장" },
    { href: videoHref, label: "식전영상" },
    { href: "/i/sample", label: "샘플 보기" },
    { href: "/support", label: "고객센터" },
    ...(isAdmin ? [{ href: "/admin", label: "관리자" }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-[#fbfbf8]/94 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link aria-label="MC Page 메인으로 이동" className="shrink-0 text-xl font-semibold text-ink" href="/">
          MC Page
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 text-sm text-ink/62 lg:flex">
          {links.map((item) => (
            <TopNavLink href={item.href} key={`${item.label}-${item.href}`}>
              {item.label}
            </TopNavLink>
          ))}
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
            내 작업
          </Link>
          {userName ? (
            <div className="hidden sm:block">
              <SignOutButton compact />
            </div>
          ) : !isLoginPage ? (
            <Link
              className="hidden rounded-md border border-ink/15 px-3 py-2 text-sm font-medium text-ink transition hover:bg-white sm:inline-flex"
              href="/login"
            >
              로그인
            </Link>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="모바일 주요 메뉴"
        className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1 text-sm text-ink/65 lg:hidden"
      >
        {links.map((item) => (
          <Link
            className="shrink-0 rounded-md border border-ink/10 bg-white/70 px-3 py-2 transition hover:bg-white hover:text-ink"
            href={item.href}
            key={`mobile-${item.label}-${item.href}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
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

function getProjectIdFromPath(pathname: string) {
  const match = /^\/dashboard\/projects\/([^/]+)/.exec(pathname);
  return match?.[1];
}
