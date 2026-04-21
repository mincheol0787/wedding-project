export function PageSkeleton({ title = "페이지를 준비하고 있어요" }: { title?: string }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10">
      <div className="rounded-md border border-rose/15 bg-white/80 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">Loading</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">{title}</h1>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-rose/10">
          <div className="h-full w-1/3 animate-[soft-loading_1.15s_ease-in-out_infinite] rounded-full bg-rose/70" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm" key={item}>
            <div className="h-4 w-24 rounded-md bg-ink/10" />
            <div className="mt-4 h-7 w-2/3 rounded-md bg-ink/10" />
            <div className="mt-5 grid gap-2">
              <div className="h-3 rounded-md bg-ink/5" />
              <div className="h-3 w-5/6 rounded-md bg-ink/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
