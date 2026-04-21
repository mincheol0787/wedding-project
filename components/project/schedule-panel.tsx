"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createProjectScheduleEventAction,
  type ScheduleActionState,
  toggleProjectScheduleEventAction
} from "@/app/dashboard/projects/[projectId]/actions";

type ScheduleEventItem = {
  id: string;
  title: string;
  description: string | null;
  category:
    | "MEETING"
    | "VENUE"
    | "STUDIO"
    | "DRESS"
    | "MAKEUP"
    | "INVITATION"
    | "VIDEO"
    | "PAYMENT"
    | "TODO";
  startsAt: Date;
  isAllDay: boolean;
  isCompleted: boolean;
};

type SchedulePanelProps = {
  projectId: string;
  events: ScheduleEventItem[];
};

const initialState: ScheduleActionState = {};

const categoryOptions: Array<{
  value: ScheduleEventItem["category"];
  label: string;
}> = [
  { value: "TODO", label: "할 일" },
  { value: "MEETING", label: "미팅" },
  { value: "VENUE", label: "예식장" },
  { value: "STUDIO", label: "스튜디오" },
  { value: "DRESS", label: "드레스" },
  { value: "MAKEUP", label: "메이크업" },
  { value: "INVITATION", label: "청첩장" },
  { value: "VIDEO", label: "식전영상" },
  { value: "PAYMENT", label: "결제" }
];

const categoryLabelMap = Object.fromEntries(
  categoryOptions.map((option) => [option.value, option.label])
) as Record<ScheduleEventItem["category"], string>;

export function SchedulePanel({ projectId, events }: SchedulePanelProps) {
  const [isAllDay, setIsAllDay] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const createAction = createProjectScheduleEventAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(createAction, initialState);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const eventMap = useMemo(() => {
    return events.reduce<Record<string, ScheduleEventItem[]>>((acc, event) => {
      const key = formatDateKey(event.startsAt);
      acc[key] = [...(acc[key] ?? []), event];
      return acc;
    }, {});
  }, [events]);

  return (
    <section className="grid gap-6">
      <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
              Schedule Calendar
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">일정 캘린더</h2>
            <p className="mt-2 text-sm text-ink/55">
              완료된 일정은 어둡게 표시하고 캘린더에는 그대로 남겨 준비 흐름을 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              className="min-h-10 flex-1 rounded-md border border-ink/10 px-3 py-2 text-sm text-ink transition hover:border-rose/40 sm:flex-none"
              onClick={() => setCurrentMonth((value) => addMonths(value, -1))}
              type="button"
            >
              이전
            </button>
            <p className="min-w-28 flex-1 text-center text-sm font-semibold text-ink sm:flex-none">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </p>
            <button
              className="min-h-10 flex-1 rounded-md border border-ink/10 px-3 py-2 text-sm text-ink transition hover:border-rose/40 sm:flex-none"
              onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
              type="button"
            >
              다음
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45 sm:gap-2 sm:text-xs">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div className="py-2" key={day}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day) => {
            const key = formatDateKey(day.date);
            const dayEvents = eventMap[key] ?? [];
            const isToday = formatDateKey(day.date) === formatDateKey(new Date());
            const hasOnlyCompletedEvents =
              dayEvents.length > 0 && dayEvents.every((event) => event.isCompleted);

            return (
              <div
                className={`min-h-24 rounded-md border p-1.5 text-left sm:min-h-32 sm:p-2.5 xl:min-h-36 ${
                  day.inCurrentMonth ? "border-ink/10 bg-[#fffdfb]" : "border-ink/5 bg-[#faf8f5] text-ink/35"
                } ${hasOnlyCompletedEvents ? "bg-ink/[0.035]" : ""} ${
                  isToday ? "border-rose/50 shadow-[0_0_0_3px_rgba(179,91,99,0.16)]" : ""
                }`}
                key={key}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold ${
                      isToday ? "bg-rose text-white shadow-sm" : "text-ink"
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {isToday ? (
                    <span className="rounded-md bg-rose/10 px-1.5 py-1 text-[10px] font-semibold text-rose">
                      오늘
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 grid gap-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      className={`min-w-0 rounded-md px-1.5 py-1 text-[10px] leading-4 sm:px-2 sm:text-[11px] ${
                        event.isCompleted
                          ? "bg-ink/10 text-ink/42 line-through"
                          : "bg-rose/10 text-ink shadow-[inset_3px_0_0_rgba(179,91,99,0.28)]"
                      }`}
                      key={event.id}
                      title={event.title}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="truncate text-[10px] text-ink/50">
                        {event.isAllDay ? "종일" : formatTime(event.startsAt)}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 ? (
                    <div className="px-1 text-[10px] font-medium text-ink/45">
                      +{dayEvents.length - 3}개 일정
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
                Schedule List
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">일정 목록</h3>
            </div>
            <span className="text-sm text-ink/50">총 {events.length}개 일정</span>
          </div>

          <div className="mt-5 grid gap-3">
            {events.length ? (
              events.map((event) => (
                <form
                  action={toggleProjectScheduleEventAction.bind(null, projectId)}
                  className={`relative overflow-hidden rounded-md border px-4 py-4 transition ${
                    event.isCompleted
                      ? "border-ink/10 bg-[#ece8e2] text-ink/50"
                      : "border-ink/10 bg-[#fffdfb]"
                  }`}
                  key={event.id}
                >
                  <input name="eventId" type="hidden" value={event.id} />
                  <input name="isCompleted" type="hidden" value={String(!event.isCompleted)} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-rose/10 px-2 py-1 text-xs font-medium text-rose">
                          {categoryLabelMap[event.category]}
                        </span>
                        <span className="text-xs text-ink/50">
                          {formatDateTimeLabel(event.startsAt, event.isAllDay)}
                        </span>
                        {event.isCompleted ? (
                          <span className="rounded-md bg-ink/10 px-2 py-1 text-xs font-medium text-ink/45">
                            완료됨
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`mt-2 break-words text-base font-semibold text-ink ${
                          event.isCompleted ? "line-through text-ink/45" : ""
                        }`}
                      >
                        {event.title}
                      </p>
                      {event.description ? (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink/60">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                    <ScheduleToggleButton isCompleted={event.isCompleted} />
                  </div>
                </form>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-ink/15 px-4 py-8 text-sm text-ink/55">
                아직 등록된 일정이 없습니다. 아래 일정 추가에서 첫 일정을 남겨보세요.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
            Add Schedule
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">일정 추가</h3>

          <form action={formAction} className="mt-5 grid gap-4">
            <Field label="일정 제목" name="title" required />
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="분류" name="category">
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <Field label="날짜" name="date" required type="date" />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                checked={isAllDay}
                className="h-4 w-4 rounded border-ink/20"
                name="isAllDay"
                onChange={(event) => setIsAllDay(event.target.checked)}
                type="checkbox"
                value="true"
              />
              시간 없이 날짜만 등록하기
            </label>
            {!isAllDay ? <Field label="시간" name="time" type="time" /> : null}
            <label className="grid gap-2 text-sm text-ink/70">
              <span>메모</span>
              <textarea
                className="min-h-24 rounded-md border border-ink/10 px-3 py-3 text-sm text-ink outline-none ring-0 transition focus:border-rose/50"
                name="description"
                placeholder="준비 메모가 있다면 함께 남겨주세요."
              />
            </label>

            {state.error ? <p className="text-sm text-rose">{state.error}</p> : null}
            {state.message ? <p className="text-sm text-sage">{state.message}</p> : null}
            {pending ? <ElegantLoadingBar label="일정을 저장하고 있어요" /> : null}

            <button
              className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending ? "일정을 추가하는 중..." : "일정 추가"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ScheduleToggleButton({ isCompleted }: { isCompleted: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`relative min-h-10 shrink-0 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
        isCompleted ? "border border-ink/10 bg-white text-ink/60" : "bg-ink text-white"
      }`}
      disabled={pending}
      type="submit"
    >
      <span className={pending ? "opacity-0" : "opacity-100"}>
        {isCompleted ? "다시 진행" : "완료 처리"}
      </span>
      {pending ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/35">
            <span className="block h-full w-1/2 animate-[soft-loading_1.1s_ease-in-out_infinite] rounded-full bg-rose/80" />
          </span>
        </span>
      ) : null}
    </button>
  );
}

function ElegantLoadingBar({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-rose/20 bg-rose/5 px-3 py-3">
      <p className="text-xs font-medium text-rose">{label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <div className="h-full w-1/3 animate-[soft-loading_1.15s_ease-in-out_infinite] rounded-full bg-rose/70" />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text"
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink/70">
      <span>{label}</span>
      <input
        className="rounded-md border border-ink/10 px-3 py-3 text-sm text-ink outline-none transition focus:border-rose/50"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  children
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-ink/70">
      <span>{label}</span>
      <select
        className="rounded-md border border-ink/10 px-3 py-3 text-sm text-ink outline-none transition focus:border-rose/50"
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

function buildCalendarDays(currentMonth: Date) {
  const firstDay = startOfMonth(currentMonth);
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return {
      date,
      inCurrentMonth: date.getMonth() === currentMonth.getMonth()
    };
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, diff: number) {
  return new Date(date.getFullYear(), date.getMonth() + diff, 1);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatDateTimeLabel(date: Date, isAllDay: boolean) {
  const base = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);

  return isAllDay ? `${base} · 종일` : `${base} · ${formatTime(date)}`;
}
