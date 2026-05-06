"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleGuestbookVisibilityAction } from "@/app/dashboard/projects/[projectId]/invitation/guestbook-actions";

type Attendance = "ATTENDING" | "NOT_ATTENDING" | "UNDECIDED";
type GuestSide = "GROOM" | "BRIDE" | "BOTH" | "UNKNOWN";

export type InvitationResponseCenterData = {
  projectTitle: string;
  invitation: {
    publicSlug: string;
    status: string;
  };
  summary: {
    responseCount: number;
    guestCount: number;
    attendingGuestCount: number;
    notAttendingCount: number;
    undecidedCount: number;
    groomGuestCount: number;
    brideGuestCount: number;
    bothGuestCount: number;
    unknownGuestCount: number;
    guestbookCount: number;
    hiddenGuestbookCount: number;
  };
  rsvps: Array<{
    id: string;
    name: string;
    phone: string | null;
    side: GuestSide;
    attendance: Attendance;
    guestCount: number;
    mealOption: string | null;
    message: string | null;
    createdAt: string;
  }>;
  guestbookEntries: Array<{
    id: string;
    name: string;
    message: string;
    isPrivate: boolean;
    isHidden: boolean;
    createdAt: string;
  }>;
};

type InvitationResponseCenterProps = {
  data: InvitationResponseCenterData;
  projectId: string;
};

const attendanceLabel: Record<Attendance, string> = {
  ATTENDING: "참석",
  NOT_ATTENDING: "불참",
  UNDECIDED: "미정"
};

const sideLabel: Record<GuestSide, string> = {
  GROOM: "신랑측",
  BRIDE: "신부측",
  BOTH: "양측",
  UNKNOWN: "미선택"
};

export function InvitationResponseCenter({ data, projectId }: InvitationResponseCenterProps) {
  const [pending, startTransition] = useTransition();
  const [activeEntryId, setActiveEntryId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const csvRows = useMemo(
    () =>
      data.rsvps.map((rsvp) => ({
        name: rsvp.name,
        phone: rsvp.phone ?? "",
        side: sideLabel[rsvp.side],
        attendance: attendanceLabel[rsvp.attendance],
        guestCount: String(rsvp.guestCount),
        mealOption: rsvp.mealOption ?? "",
        message: rsvp.message ?? "",
        createdAt: formatDate(rsvp.createdAt)
      })),
    [data.rsvps]
  );

  function handleExportCsv() {
    const rows = [
      ["이름", "연락처", "구분", "참석 여부", "인원", "식사/요청사항", "메시지", "응답일"],
      ...csvRows.map((row) => [
        row.name,
        row.phone,
        row.side,
        row.attendance,
        row.guestCount,
        row.mealOption,
        row.message,
        row.createdAt
      ])
    ];
    const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mcpage-rsvp-${data.invitation.publicSlug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleEntry(entryId: string, isHidden: boolean) {
    startTransition(async () => {
      setActiveEntryId(entryId);
      setError(undefined);
      setMessage(undefined);

      const formData = new FormData();
      formData.set("entryId", entryId);
      formData.set("isHidden", String(!isHidden));

      const result = await toggleGuestbookVisibilityAction(projectId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(result.message);
      }

      setActiveEntryId(undefined);
    });
  }

  return (
    <section className="mt-8 rounded-md border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(36,36,36,0.05)] lg:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">Guest Response</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">하객 응답 관리</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
            참석 여부와 방명록을 한곳에서 확인하고, 하객 명단은 CSV로 내려받을 수 있어요.
          </p>
        </div>
        <button
          className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/88 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={data.rsvps.length === 0}
          onClick={handleExportCsv}
          type="button"
        >
          참석 명단 CSV 다운로드
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="응답" value={`${data.summary.responseCount}건`} />
        <MetricCard label="참석 예정 인원" value={`${data.summary.attendingGuestCount}명`} />
        <MetricCard label="불참 / 미정" value={`${data.summary.notAttendingCount} / ${data.summary.undecidedCount}`} />
        <MetricCard
          label="방명록"
          value={`${data.summary.guestbookCount}개`}
          sub={data.summary.hiddenGuestbookCount ? `숨김 ${data.summary.hiddenGuestbookCount}개` : "전체 공개"}
        />
      </div>

      <div className="mt-5 grid gap-3 rounded-md border border-ink/10 bg-[#f8faf8] p-4 sm:grid-cols-4">
        <MiniStat label="신랑측" value={`${data.summary.groomGuestCount}명`} />
        <MiniStat label="신부측" value={`${data.summary.brideGuestCount}명`} />
        <MiniStat label="양측" value={`${data.summary.bothGuestCount}명`} />
        <MiniStat label="미선택" value={`${data.summary.unknownGuestCount}명`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">참석 응답</h3>
            <span className="text-xs text-ink/45">최근 200건</span>
          </div>
          <div className="mt-3 overflow-hidden rounded-md border border-ink/10">
            {data.rsvps.length ? (
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="sticky top-0 bg-[#fbfcfb] text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
                    <tr>
                      <th className="px-3 py-3">이름</th>
                      <th className="px-3 py-3">구분</th>
                      <th className="px-3 py-3">참석</th>
                      <th className="px-3 py-3">인원</th>
                      <th className="px-3 py-3">요청사항</th>
                      <th className="px-3 py-3">응답일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {data.rsvps.map((rsvp) => (
                      <tr className="bg-white text-ink/70" key={rsvp.id}>
                        <td className="px-3 py-3">
                          <p className="font-medium text-ink">{rsvp.name}</p>
                          {rsvp.phone ? <p className="mt-1 text-xs text-ink/45">{rsvp.phone}</p> : null}
                        </td>
                        <td className="px-3 py-3">{sideLabel[rsvp.side]}</td>
                        <td className="px-3 py-3">{attendanceLabel[rsvp.attendance]}</td>
                        <td className="px-3 py-3">{rsvp.guestCount}명</td>
                        <td className="max-w-[240px] px-3 py-3 text-xs leading-5">
                          {rsvp.mealOption || rsvp.message || "-"}
                        </td>
                        <td className="px-3 py-3 text-xs text-ink/45">{formatDate(rsvp.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState text="아직 참석 응답이 없습니다." />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">방명록 관리</h3>
            <span className="text-xs text-ink/45">최근 100건</span>
          </div>
          <div className="mt-3 grid max-h-[420px] gap-3 overflow-auto rounded-md border border-ink/10 bg-[#fbfcfb] p-3">
            {data.guestbookEntries.length ? (
              data.guestbookEntries.map((entry) => (
                <article className="rounded-md border border-ink/10 bg-white p-4" key={entry.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{entry.name}</p>
                      <p className="mt-1 text-xs text-ink/45">{formatDate(entry.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      {entry.isPrivate ? <Badge text="비공개" /> : null}
                      {entry.isHidden ? <Badge text="숨김" tone="rose" /> : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/65">{entry.message}</p>
                  <button
                    className="mt-4 rounded-md border border-ink/12 px-3 py-2 text-xs font-medium text-ink transition hover:border-sage/35 hover:bg-sage/5 disabled:opacity-45"
                    disabled={pending && activeEntryId === entry.id}
                    onClick={() => toggleEntry(entry.id, entry.isHidden)}
                    type="button"
                  >
                    {pending && activeEntryId === entry.id
                      ? "처리 중..."
                      : entry.isHidden
                        ? "다시 공개"
                        : "공개 화면에서 숨기기"}
                  </button>
                </article>
              ))
            ) : (
              <EmptyState text="아직 방명록 메시지가 없습니다." />
            )}
          </div>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-md bg-sage/10 px-3 py-2 text-sm text-sage">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p> : null}
    </section>
  );
}

function MetricCard({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-[#fbfcfb] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink/45">{sub}</p> : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function Badge({ text, tone = "sage" }: { text: string; tone?: "sage" | "rose" }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
        tone === "rose" ? "bg-rose/10 text-rose" : "bg-sage/10 text-sage"
      }`}
    >
      {text}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-ink/15 bg-white p-6 text-sm text-ink/50">{text}</div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
