"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className={`rounded-md border border-ink/15 text-sm font-medium text-ink transition hover:bg-white disabled:opacity-60 ${
        compact ? "px-3 py-2" : "px-5 py-3"
      }`}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/" });
        })
      }
      type="button"
    >
      {pending ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
