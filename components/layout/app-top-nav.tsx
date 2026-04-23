"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, type ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type AppTopNavProps = {
  currentProjectId?: string;
  isAdmin?: boolean;
  userName?: string | null;
};

type NavItem = {
  href: string;
  isNew?: boolean;
  label: string;
};

const reservedProjectSegments = new Set(["new"]);

export function AppTopNav({ currentProjectId, isAdmin, userName }: AppTopNavProps) {
  const pathname = usePathname();
  const projectId = currentProjectId ?? getProjectIdFromPath(pathname);
  const isLoginPage = pathname === "/login";

  const invitationHref = projectId
    ? `/dashboard/projects/${projectId}/invitation`
    : "/dashboard/projects/new";
  const videoHref = projectId ? `/dashboard/projects/${projectId}/video` : "/dashboard/projects/new";

  const links: NavItem[] = [
    { href: "/", label: "홈" },
    { href: "/dashboard", label: "내 작업" },
    { href: invitationHref, label: "청첩장 만들기" },
    { href: videoHref, label: "영상 만들기", isNew: true },
    ...(isAdmin ? [{ href: "/admin", label: "관리자" }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-[#fbfbf8]/94 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link
          aria-label="MC Page 메인으로 이동"
          className="shrink-0 text-xl font-semibold text-ink"
          href="/"
          prefetch
        >
          MC Page
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 text-sm text-ink/62 lg:flex">
          {links.map((item) => (
            <TopNavLink href={item.href} isNew={item.isNew} key={`${item.label}-${item.href}`} pathname={pathname}>
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
          {userName ? (
            <div className="hidden sm:block">
              <SignOutButton compact />
            </div>
          ) : !isLoginPage ? (
            <Link
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/88"
              href="/login"
              prefetch
            >
              시작하기
            </Link>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="모바일 주요 메뉴"
        className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1 text-sm text-ink/65 lg:hidden"
      >
        {links.map((item) => (
          <TopNavLink
            compact
            href={item.href}
            isNew={item.isNew}
            key={`mobile-${item.label}-${item.href}`}
            pathname={pathname}
          >
            {item.label}
          </TopNavLink>
        ))}
      </nav>
    </header>
  );
}

function TopNavLink({
  children,
  compact = false,
  href,
  isNew,
  pathname
}: {
  children: ReactNode;
  compact?: boolean;
  href: string;
  isNew?: boolean;
  pathname: string;
}) {
  const isActive = pathname === href;
  const className = compact
    ? `inline-flex shrink-0 items-center gap-1 rounded-md border px-3 py-2 transition ${
        isActive
          ? "border-ink/15 bg-white text-ink"
          : "border-ink/10 bg-white/70 hover:bg-white hover:text-ink"
      }`
    : `inline-flex items-center gap-1 rounded-md px-3 py-2 transition ${
        isActive ? "bg-white text-ink shadow-sm" : "hover:bg-white hover:text-ink"
      }`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isActive) {
      return;
    }

    event.preventDefault();
    window.scrollTo({
      behavior: "smooth",
      top: 0
    });
  }

  return (
    <Link className={className} href={href} onClick={handleClick} prefetch>
      {children}
      {isNew ? <NewBadge /> : null}
    </Link>
  );
}

function NewBadge() {
  return (
    <span className="rounded-md bg-rose/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rose">
      NEW
    </span>
  );
}

function getProjectIdFromPath(pathname: string) {
  const match = /^\/dashboard\/projects\/([^/]+)/.exec(pathname);
  const projectId = match?.[1];

  if (!projectId || reservedProjectSegments.has(projectId)) {
    return undefined;
  }

  return projectId;
}
