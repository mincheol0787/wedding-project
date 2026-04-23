export default function InvitationEditorLoading() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] px-4 py-8 sm:px-6 lg:py-10">
      <section className="mx-auto max-w-[1540px]">
        <div className="mb-8 grid gap-6 rounded-md border border-ink/10 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(36,36,36,0.05)] md:grid-cols-[1fr_auto] md:items-end lg:px-7 lg:py-6">
          <div>
            <div className="h-4 w-36 rounded-md bg-ink/8" />
            <div className="mt-6 h-3 w-44 rounded-md bg-sage/20" />
            <div className="mt-4 h-10 w-full max-w-xl rounded-md bg-ink/8" />
            <div className="mt-4 h-4 w-full max-w-2xl rounded-md bg-ink/6" />
          </div>
          <div className="h-24 rounded-md bg-[#f8faf8] md:w-52" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(340px,4fr)_minmax(0,6fr)] lg:items-start xl:gap-8">
          <div className="rounded-md border border-ink/10 bg-[#f7f2ed] p-3 shadow-[0_18px_60px_rgba(36,36,36,0.06)]">
            <div className="grid gap-4 rounded-md bg-white p-4">
              <div className="h-5 w-32 rounded-md bg-rose/10" />
              <div className="mx-auto h-[560px] w-full max-w-[430px] rounded-md bg-ink/8" />
            </div>
          </div>

          <div className="grid gap-5">
            {[0, 1, 2, 3].map((item) => (
              <div
                className="rounded-md border border-ink/10 bg-white/95 p-5 shadow-[0_18px_60px_rgba(36,36,36,0.05)]"
                key={item}
              >
                <div className="h-3 w-28 rounded-md bg-rose/10" />
                <div className="mt-4 h-7 w-56 rounded-md bg-ink/8" />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="h-12 rounded-md bg-ink/6" />
                  <div className="h-12 rounded-md bg-ink/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
