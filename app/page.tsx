import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-porcelain px-6 py-10">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
          Wedding Studio
        </p>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold leading-tight text-ink md:text-6xl">
            식전영상과 모바일 청첩장을 한 곳에서 준비하세요.
          </h1>
          <p className="mt-6 text-lg leading-8 text-ink/70">
            사진, 문구, 음악, 예식 정보를 템플릿에 담아 고급스러운 웨딩 콘텐츠를 빠르게 제작합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white"
          >
            대시보드 시작
          </Link>
          <Link
            href="/i/sample"
            className="rounded-md border border-ink/20 px-5 py-3 text-sm font-medium text-ink"
          >
            청첩장 예시
          </Link>
        </div>
      </section>
    </main>
  );
}
