import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { FloatingLandingCta } from "@/components/landing/floating-landing-cta";
import { LandingReveal } from "@/components/landing/landing-reveal";
import { AppTopNav } from "@/components/layout/app-top-nav";

const features = [
  {
    title: "모바일 청첩장",
    description: "템플릿, 섹션 순서, 지도, 참석 여부, 방명록까지 한 화면에서 정리합니다."
  },
  {
    title: "식전영상",
    description: "사진, 문구, 음악을 업로드하고 Remotion 렌더링 데이터로 자연스럽게 연결합니다."
  },
  {
    title: "일정 관리",
    description: "예식 준비 일정을 캘린더로 관리하고 가까운 일정을 바로 확인합니다."
  }
];

const featureSteps = [
  ["01", "작업 시작", "신랑, 신부, 예식일만 입력하면 청첩장과 영상 제작 화면이 열립니다."],
  ["02", "초대장 편집", "사진, 문구, 지도, 계좌, 섹션 순서를 원하는 흐름으로 맞춥니다."],
  ["03", "영상 제작", "사진 슬라이드와 문구 타임라인을 구성하고 렌더링 요청까지 이어집니다."]
];

const reviews = [
  {
    initials: "SY",
    name: "서연 & 민수",
    rating: "5.0",
    message: "청첩장과 식전영상 준비를 한 곳에서 끝낼 수 있어서 일정이 훨씬 정리됐어요."
  },
  {
    initials: "HJ",
    name: "하진 & 도윤",
    rating: "5.0",
    message: "부모님 성함, 오시는 길, 방명록까지 빠르게 수정되어 공유 전 확인이 쉬웠습니다."
  },
  {
    initials: "YR",
    name: "유리 & 건우",
    rating: "4.9",
    message: "템플릿을 누르면 미리보기가 바로 바뀌어서 비개발자인 저도 부담이 적었어요."
  },
  {
    initials: "MJ",
    name: "민지 & 태오",
    rating: "5.0",
    message: "공개 링크와 참석 여부가 같이 관리되어 예식 전 연락이 훨씬 편해졌습니다."
  }
];

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);
  const userName = session?.user?.name ?? session?.user?.email;

  const primaryCta = isAuthenticated
    ? { href: "/dashboard", label: "내 작업 보기" }
    : { href: "/login", label: "무료로 시작하기" };
  const secondaryCta = isAuthenticated
    ? { href: "/dashboard/projects/new", label: "새 청첩장 만들기" }
    : { href: "/login", label: "로그인" };
  const tertiaryCta = isAuthenticated
    ? { href: "/dashboard", label: "청첩장 편집하기" }
    : { href: "/i/sample", label: "샘플 보기" };

  return (
    <>
      <AppTopNav
        isAdmin={session?.user?.role === "ADMIN"}
        userName={userName}
      />
      <main className="min-h-screen bg-[#f4f7f5] text-ink">
        <section className="relative min-h-[78vh] overflow-hidden bg-ink lg:min-h-[calc(100vh-128px)]">
          <Image
            alt="야외 웨딩 세리머니 좌석"
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=82"
          />
          <div className="absolute inset-0 bg-black/38" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-6 py-16 lg:min-h-[calc(100vh-128px)]">
            <div className="max-w-3xl border-l border-white/24 pl-6 text-white" data-reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/74">
                Wedding SaaS Studio
              </p>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] md:text-7xl">
                Love becomes
                <br />
                a letter
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/84 md:text-lg">
                모바일 청첩장, 식전영상, 일정 관리를 한 흐름으로 연결해 예비부부의 준비 시간을 더 차분하게 만듭니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-md bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-[#edf2ef]"
                  href={primaryCta.href}
                >
                  {primaryCta.label}
                </Link>
                <Link
                  className="rounded-md border border-white/38 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  href={tertiaryCta.href}
                >
                  {tertiaryCta.label}
                </Link>
              </div>
            </div>
          </div>
          <a
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 md:block"
            href="#service"
          >
            Scroll down
          </a>
        </section>

        <section className="px-6 py-20" id="service">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div data-reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose">
                  Service
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink">
                  준비할 것은 많아도
                  <br />
                  화면은 단순해야 합니다
                </h2>
                <p className="mt-5 text-base leading-8 text-ink/66">
                  MVP는 제작 흐름을 빠르게 만드는 데 집중합니다. 청첩장 정보, 사진, 지도, 참석 여부, 식전영상 데이터를 하나의 작업 흐름으로 묶어 관리합니다.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3" data-reveal>
                {features.map((item) => (
                  <article
                    className="rounded-md border border-ink/10 bg-white p-5 shadow-[0_14px_44px_rgba(36,36,36,0.05)]"
                    key={item.title}
                  >
                    <p className="text-lg font-semibold text-ink">{item.title}</p>
                    <p className="mt-4 text-sm leading-7 text-ink/62">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {featureSteps.map(([step, title, description]) => (
                <article
                  className="rounded-md border border-ink/10 bg-[#fbfcfb] p-6"
                  data-reveal
                  key={step}
                >
                  <p className="text-sm font-semibold text-rose">{step}</p>
                  <h3 className="mt-5 text-2xl font-semibold text-ink">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-ink/62">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div data-reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
                Editor
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink">
                왼쪽에서는 미리보고
                <br />
                오른쪽에서는 바로 편집합니다
              </h2>
              <p className="mt-5 text-base leading-8 text-ink/66">
                템플릿, 문구, 사진, 오시는 길, 마음 전하실 곳까지 저장 전 미리보기로 확인합니다. 사용자는 화면을 오가며 기다리지 않아도 됩니다.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/88"
                  href={primaryCta.href}
                >
                  {primaryCta.label}
                </Link>
                <Link
                  className="rounded-md border border-ink/15 px-5 py-3 text-sm font-medium text-ink transition hover:bg-[#f4f7f5]"
                  href="/support"
                >
                  고객센터 보기
                </Link>
              </div>
            </div>
            <div
              className="grid gap-4 rounded-md border border-ink/10 bg-[#eef3ee] p-4 shadow-[0_22px_70px_rgba(36,36,36,0.08)] md:grid-cols-[0.72fr_1fr]"
              data-reveal
            >
              <div className="relative min-h-[520px] overflow-hidden rounded-md bg-ink">
                <Image
                  alt="모바일 청첩장 커버 미리보기"
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 360px, 100vw"
                  src="https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=82"
                />
                <div className="absolute inset-0 bg-black/24" />
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/76">
                    Our wedding day
                  </p>
                  <p className="mt-5 text-4xl font-semibold leading-tight">민수 & 서연</p>
                </div>
              </div>
              <div className="grid gap-3 rounded-md bg-white p-5">
                {[
                  "커버 문구와 색상",
                  "부모님 성함",
                  "장소 검색과 지도",
                  "섹션 순서 변경",
                  "방명록과 참석 여부"
                ].map((item) => (
                  <div className="rounded-md border border-ink/10 px-4 py-3" key={item}>
                    <p className="text-sm font-medium text-ink">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden px-6 py-20">
          <div className="mx-auto max-w-7xl text-center" data-reveal>
            <p className="mx-auto w-fit rounded-md bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose">
              Live Review
            </p>
            <h2 className="mt-6 text-5xl font-semibold text-ink">12,600+</h2>
            <p className="mt-4 text-xl font-medium text-ink/76">
              먼저 경험한 예비부부의 생생한 후기
            </p>
          </div>

          <div className="landing-review-mask mt-12" data-reveal>
            <div className="landing-review-track">
              {[...reviews, ...reviews].map((review, index) => (
                <article
                  className="w-[310px] shrink-0 rounded-md border border-ink/10 bg-white p-5 shadow-[0_14px_44px_rgba(36,36,36,0.05)]"
                  key={`${review.name}-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-md bg-[#e6ece7] text-sm font-semibold text-ink">
                      {review.initials}
                    </div>
                    <p className="text-sm font-medium text-rose">★ {review.rating}</p>
                  </div>
                  <p className="mt-5 min-h-24 text-sm leading-7 text-ink/68">{review.message}</p>
                  <p className="mt-4 text-sm font-semibold text-ink">{review.name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#edf2ef] px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div data-reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage">
                Product Film
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink">
                제작 흐름을 영상처럼
                <br />
                한 번에 이해하세요
              </h2>
              <p className="mt-5 text-base leading-8 text-ink/66">
                실제 광고 영상이 연결되기 전까지는 제품 소개용 영상 영역으로 운영합니다. 추후 Vercel Blob 또는 S3에 업로드한 서비스 영상을 그대로 연결할 수 있습니다.
              </p>
            </div>
            <div
              className="overflow-hidden rounded-md border border-ink/10 bg-ink shadow-[0_24px_70px_rgba(36,36,36,0.16)]"
              data-reveal
            >
              <video
                className="aspect-video w-full object-cover"
                controls
                loop
                muted
                playsInline
                poster="https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1400&q=82"
                preload="metadata"
              >
                <source
                  src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="grid gap-2 bg-white px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <p className="text-sm font-medium text-ink">모바일 초대장 제작부터 공개 링크 발급까지</p>
                <Link className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white" href={primaryCta.href}>
                  {primaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl text-center" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose">CTA</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-ink">
              지금 필요한 것은
              <br />
              더 많은 도구가 아니라 더 쉬운 흐름입니다
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink/66">
              첫 작업을 만들고, 청첩장과 식전영상을 같은 데이터 위에서 이어서 준비해보세요.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink/88"
                href={primaryCta.href}
              >
                {primaryCta.label}
              </Link>
              <Link
                className="rounded-md border border-ink/15 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-[#edf2ef]"
                href={secondaryCta.href}
              >
                {secondaryCta.label}
              </Link>
              <Link
                className="rounded-md border border-ink/15 bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-[#edf2ef]"
                href={tertiaryCta.href}
              >
                {tertiaryCta.label}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10 bg-white px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 text-sm text-ink/58 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-lg font-semibold text-ink">MC Page</p>
            <p className="mt-2">모바일 청첩장과 식전영상을 함께 준비하는 웨딩 제작 SaaS</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/support">고객센터</Link>
            <Link href="/i/sample">샘플 보기</Link>
            <Link href="/dashboard">내 작업</Link>
          </div>
        </div>
      </footer>

      <FloatingLandingCta isAuthenticated={isAuthenticated} />
      <LandingReveal />
    </>
  );
}
