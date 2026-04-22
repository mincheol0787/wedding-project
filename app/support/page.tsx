import { auth } from "@/auth";
import { AppTopNav } from "@/components/layout/app-top-nav";
import { SupportForm } from "@/app/support/support-form";

export default async function SupportPage() {
  const session = await auth();

  return (
    <>
      <AppTopNav
        isAdmin={session?.user?.role === "ADMIN"}
        userName={session?.user?.name ?? session?.user?.email}
      />
      <main className="min-h-screen bg-[#f5f7f4] px-4 py-10 sm:px-6">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-md border border-ink/10 bg-white px-6 py-8 shadow-[0_18px_60px_rgba(36,36,36,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
              Customer Center
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
              제작 중 막히는 순간을 같이 풀어드릴게요
            </h1>
            <p className="mt-5 text-base leading-7 text-ink/62">
              모바일 청첩장, 식전영상, 렌더링, 공개 링크, 결제 구조까지 서비스 운영에 필요한 문의를 한곳에서 받습니다.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                ["답변 기준", "운영 시간 기준 순차 답변"],
                ["추천 정보", "프로젝트명, 공개 URL, 오류 화면"],
                ["긴급 문의", "공개 페이지 오류 또는 결제 문제"]
              ].map(([label, value]) => (
                <div className="rounded-md bg-[#f8faf8] px-4 py-3" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-ink/68">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <SupportForm defaultEmail={session?.user?.email} defaultName={session?.user?.name} />
        </section>
      </main>
    </>
  );
}
