"use client";

import { useActionState, useMemo, useState } from "react";
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
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.85fr)]">
      <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
              Schedule Calendar
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">일정 캘린더</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-ink/10 px-3 py-2 text-sm text-ink"
              onClick={() => setCurrentMonth((value) => addMonths(value, -1))}
              type="button"
            >
              이전
            </button>
            <p className="min-w-28 text-center text-sm font-medium text-ink">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </p>
            <button
              className="rounded-md border border-ink/10 px-3 py-2 text-sm text-ink"
              onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
              type="button"
            >
              다음
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div className="py-2" key={day}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const key = formatDateKey(day.date);
            const dayEvents = eventMap[key] ?? [];
            const isToday = formatDateKey(day.date) === formatDateKey(new Date());

            return (
              <div
                className={`min-h-28 rounded-md border p-2 text-left ${
                  day.inCurrentMonth ? "border-ink/10 bg-[#fffdfb]" : "border-ink/5 bg-[#faf8f5] text-ink/35"
                } ${isToday ? "ring-2 ring-rose/60" : ""}`}
                key={key}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday ? "bg-rose text-white" : "text-ink"
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {isToday ? <span className="text-[10px] font-semibold text-rose">오늘</span> : null}
                </div>

                <div className="mt-2 grid gap-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      className={`rounded-md px-2 py-1 text-[11px] leading-4 ${
                        event.isCompleted
                          ? "bg-ink/5 text-ink/35 line-through"
                          : "bg-rose/10 text-ink"
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

      <div className="grid gap-6">
        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
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

            <button
              className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pending}
              type="submit"
            >
              {pending ? "일정을 추가하는 중..." : "일정 추가"}
            </button>
          </form>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose">
            Schedule List
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">일정 목록</h3>

          <div className="mt-5 grid gap-3">
            {events.length ? (
              events.map((event) => (
                <form
                  action={toggleProjectScheduleEventAction.bind(null, projectId)}
                  className={`rounded-md border px-4 py-4 ${
                    event.isCompleted ? "border-ink/10 bg-[#f6f3ef] text-ink/45" : "border-ink/10 bg-[#fffdfb]"
                  }`}
                  key={event.id}
                >
                  <input name="eventId" type="hidden" value={event.id} />
                  <input name="isCompleted" type="hidden" value={String(!event.isCompleted)} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-rose/10 px-2 py-1 text-xs font-medium text-rose">
                          {categoryLabelMap[event.category]}
                        </span>
                        <span className="text-xs text-ink/50">
                          {formatDateTimeLabel(event.startsAt, event.isAllDay)}
                        </span>
                      </div>
                      <p
                        className={`mt-2 text-base font-semibold text-ink ${
                          event.isCompleted ? "line-through text-ink/40" : ""
                        }`}
                      >
                        {event.title}
                      </p>
                      {event.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink/60">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                    <button
                      className={`rounded-md px-3 py-2 text-sm font-medium ${
                        event.isCompleted
                          ? "border border-ink/10 bg-white text-ink/60"
                          : "bg-ink text-white"
                      }`}
                      type="submit"
                    >
                      {event.isCompleted ? "다시 진행" : "완료 처리"}
                    </button>
                  </div>
                </form>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-ink/15 px-4 py-8 text-sm text-ink/55">
                아직 등록된 일정이 없습니다. 오른쪽에서 첫 일정을 추가해보세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
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
  return date.toISOString().slice(0, 10);
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
