"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="rounded-md border border-ink/15 px-5 py-3 text-sm font-medium text-ink disabled:opacity-60"
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
