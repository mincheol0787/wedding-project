import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AppTopNav } from "@/components/layout/app-top-nav";

export default function LoginPage() {
  return (
    <>
      <AppTopNav />
      <main className="min-h-screen bg-porcelain px-6 py-10">
        <section className="mx-auto flex max-w-5xl flex-col gap-8 py-10">
        <Link className="text-sm font-medium text-ink/60" href="/">
          Wedding Studio
        </Link>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">Account</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
            준비해야 할 순간들을 차분하게 정리해 보세요.
          </h1>
          <p className="mt-5 text-base leading-7 text-ink/65">
            로그인 후 내 작업을 확인하고, 식전영상과 모바일 청첩장을 같은 흐름 안에서 이어서 편집할 수 있어요.
          </p>
        </div>
        <AuthForm />
        </section>
      </main>
    </>
  );
}
