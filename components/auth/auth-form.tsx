"use client";

import { FormEvent, useState, useTransition } from "react";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { registerAction } from "@/app/(auth)/login/actions";

type ActionState = {
  error?: string;
  success?: string;
};

const initialState: ActionState = {};

export function AuthForm() {
  const [loginError, setLoginError] = useState<string>();
  const [loginPending, startLoginTransition] = useTransition();
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerAction,
    initialState
  );

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loginPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    startLoginTransition(async () => {
      setLoginError(undefined);

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false
      });

      if (result?.ok) {
        window.location.href = "/dashboard";
        return;
      }

      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <form
        className="rounded-md border border-ink/10 bg-white p-6 shadow-sm"
        onSubmit={handleLogin}
      >
        <p className="text-sm font-medium text-rose">Login</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">다시 돌아오신 것을 환영해요</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          저장된 프로젝트를 이어서 편집하고 청첩장과 영상을 계속 준비해 보세요.
        </p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-ink">
            이메일
            <input
              className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-rose"
              name="email"
              placeholder="couple@example.com"
              required
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            비밀번호
            <input
              className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-rose"
              name="password"
              placeholder="8자 이상"
              required
              type="password"
            />
          </label>
        </div>
        {loginError ? <p className="mt-4 text-sm text-rose">{loginError}</p> : null}
        <button
          className="mt-6 w-full rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          disabled={loginPending}
          type="submit"
        >
          {loginPending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <form
        action={registerFormAction}
        className="rounded-md border border-ink/10 bg-white p-6 shadow-sm"
      >
        <p className="text-sm font-medium text-sage">Join</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">처음 시작하기</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          계정을 만들고 우리만의 웨딩 프로젝트를 차분하게 준비해 보세요.
        </p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-ink">
            이름
            <input
              className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-sage"
              name="name"
              placeholder="서연"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            이메일
            <input
              className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-sage"
              name="email"
              placeholder="couple@example.com"
              required
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            비밀번호
            <input
              className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-sage"
              name="password"
              placeholder="8자 이상"
              required
              type="password"
            />
          </label>
        </div>
        {registerState.error ? (
          <p className="mt-4 text-sm text-rose">{registerState.error}</p>
        ) : null}
        {registerState.success ? (
          <p className="mt-4 text-sm text-sage">{registerState.success}</p>
        ) : null}
        <button
          className="mt-6 w-full rounded-md bg-sage px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          disabled={registerPending}
          type="submit"
        >
          {registerPending ? "가입 중..." : "가입하고 시작하기"}
        </button>
      </form>
    </div>
  );
}
