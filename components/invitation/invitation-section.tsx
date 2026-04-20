type InvitationSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function InvitationSection({ title, children }: InvitationSectionProps) {
  return (
    <section className="border-t border-ink/10 py-10">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4 text-ink/70">{children}</div>
    </section>
  );
}
