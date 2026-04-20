import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-porcelain px-6 py-10">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 py-10">
        <Link className="text-sm font-medium text-ink/60" href="/">
          Wedding Studio
        </Link>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">Account</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
            소중한 하루를 차분하게 준비하세요.
          </h1>
          <p className="mt-5 text-base leading-7 text-ink/65">
            로그인 후 내 프로젝트 목록을 확인하고, 식전영상과 모바일 청첩장을 이어서 제작할 수 있습니다.
          </p>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
