"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      className="rounded-md border border-ink/15 px-5 py-3 text-sm font-medium text-ink"
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      로그아웃
    </button>
  );
}
