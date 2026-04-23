"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FloatingLandingCtaProps = {
  isAuthenticated: boolean;
};

export function FloatingLandingCta({ isAuthenticated }: FloatingLandingCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 560);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "최근 작업 이어가기" : "무료로 시작하기";
  const secondaryHref = isAuthenticated ? "/dashboard/projects/new" : "/i/sample";
  const secondaryLabel = isAuthenticated ? "새 청첩장 만들기" : "샘플 보기";

  return (
    <div
      className={`fixed inset-x-3 bottom-4 z-50 mx-auto max-w-4xl transform transition duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      <div className="grid gap-3 rounded-md border border-ink/10 bg-white/88 px-4 py-3 shadow-[0_18px_60px_rgba(36,36,36,0.16)] backdrop-blur md:grid-cols-[1fr_auto_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">Start</p>
          <p className="mt-1 text-sm font-medium text-ink">
            {isAuthenticated
              ? "진행 중인 작업이 있습니다. 이어서 편집해보세요."
              : "청첩장과 식전영상을 한 번에 준비해보세요."}
          </p>
        </div>
        <Link
          className="rounded-md bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-ink/88"
          href={primaryHref}
        >
          {primaryLabel}
        </Link>
        <Link
          className="rounded-md border border-ink/15 bg-white px-5 py-3 text-center text-sm font-medium text-ink transition hover:bg-[#f4f7f5]"
          href={secondaryHref}
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
