import Image from "next/image";
import Link from "next/link";

const highlights = [
  {
    title: "모바일 청첩장 제작",
    description: "템플릿과 섹션 순서를 바탕으로 초대장을 빠르게 완성할 수 있어요."
  },
  {
    title: "식전영상 편집",
    description: "사진, 문구, 음악을 한 흐름으로 정리하고 Remotion 렌더링 데이터까지 연결합니다."
  },
  {
    title: "일정 관리",
    description: "프로젝트별 캘린더와 가까운 일정 알림으로 준비 과정을 놓치지 않게 도와줍니다."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f2ed]">
      <section className="relative min-h-screen overflow-hidden">
        <Image
          alt="웨딩 플라워 테이블"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-end px-6 pb-14 pt-20">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
              Wedding Studio
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] md:text-7xl">
              청첩장과 식전영상을
              <br />
              한 프로젝트로 준비하세요
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
              비개발자도 바로 시작할 수 있는 직관적인 편집 화면으로, 모바일 청첩장과 식전영상을 같은 흐름 안에서 정리할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-white px-5 py-3 text-sm font-medium text-ink"
                href="/login"
              >
                로그인 / 시작하기
              </Link>
              <Link
                className="rounded-md border border-white/40 px-5 py-3 text-sm font-medium text-white"
                href="/i/sample"
              >
                청첩장 예시 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              className="rounded-md border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(36,36,36,0.05)]"
              key={item.title}
            >
              <p className="text-sm font-semibold text-rose">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-ink/68">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">How it works</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink">
              회원가입 후 바로
              <br />
              우리만의 웨딩 프로젝트를 시작해요
            </h2>
            <p className="mt-5 text-base leading-8 text-ink/65">
              프로젝트를 만들면 청첩장 편집, 식전영상 편집, 일정 관리가 함께 열립니다. 공개 전에는 미리보기로 확인하고, 준비가 끝나면 공개 링크를 바로 사용할 수 있어요.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white"
                href="/login"
              >
                지금 시작하기
              </Link>
              <Link
                className="rounded-md border border-ink/15 px-5 py-3 text-sm font-medium text-ink"
                href="/dashboard"
              >
                대시보드로 이동
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Image
              alt="웨딩 사진 예시 1"
              className="aspect-[4/5] w-full rounded-md object-cover"
              height={1200}
              unoptimized
              width={960}
              src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"
            />
            <Image
              alt="웨딩 사진 예시 2"
              className="aspect-[4/5] w-full rounded-md object-cover sm:translate-y-8"
              height={1200}
              unoptimized
              width={960}
              src="https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
