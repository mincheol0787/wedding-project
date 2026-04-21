"use client";

import { useActionState } from "react";
import {
  submitGuestbookAction,
  submitRsvpAction,
  type PublicFormState
} from "@/app/i/[slug]/actions";

const initialState: PublicFormState = {};

export function RsvpForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(
    submitRsvpAction.bind(null, slug),
    initialState
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input className="rounded-md border border-ink/15 px-3 py-3" name="name" placeholder="이름" required />
      <input className="rounded-md border border-ink/15 px-3 py-3" name="phone" placeholder="연락처" />
      <div className="grid grid-cols-2 gap-2">
        <select className="rounded-md border border-ink/15 px-3 py-3" defaultValue="UNKNOWN" name="side">
          <option value="GROOM">신랑측</option>
          <option value="BRIDE">신부측</option>
          <option value="BOTH">양측 모두</option>
          <option value="UNKNOWN">선택 안 함</option>
        </select>
        <select className="rounded-md border border-ink/15 px-3 py-3" defaultValue="ATTENDING" name="attendance">
          <option value="ATTENDING">참석</option>
          <option value="NOT_ATTENDING">불참</option>
          <option value="UNDECIDED">미정</option>
        </select>
      </div>
      <input
        className="rounded-md border border-ink/15 px-3 py-3"
        defaultValue={1}
        min={1}
        name="guestCount"
        placeholder="참석 인원"
        type="number"
      />
      <input className="rounded-md border border-ink/15 px-3 py-3" name="mealOption" placeholder="식사 여부 또는 요청사항" />
      <textarea
        className="min-h-24 rounded-md border border-ink/15 px-3 py-3"
        name="message"
        placeholder="전하고 싶은 말을 남겨 주세요"
      />
      <label className="flex items-start gap-2 text-xs leading-5 text-ink/60">
        <input className="mt-1" name="privacyConsent" required type="checkbox" />
        참석 여부 확인을 위한 개인정보 이용에 동의합니다.
      </label>
      {state.error ? <p className="text-sm text-rose">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-sage">{state.message}</p> : null}
      <button
        className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "제출 중..." : "참석 여부 보내기"}
      </button>
    </form>
  );
}

export function GuestbookForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(
    submitGuestbookAction.bind(null, slug),
    initialState
  );

  return (
    <form action={formAction} className="grid gap-3">
      <input className="rounded-md border border-ink/15 px-3 py-3" name="name" placeholder="이름" required />
      <textarea
        className="min-h-24 rounded-md border border-ink/15 px-3 py-3"
        name="message"
        placeholder="축하 메시지를 남겨 주세요"
        required
      />
      <label className="flex items-center gap-2 text-xs text-ink/60">
        <input name="isPrivate" type="checkbox" />
        비공개 메시지로 남기기
      </label>
      {state.error ? <p className="text-sm text-rose">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-sage">{state.message}</p> : null}
      <button
        className="rounded-md bg-sage px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "남기는 중..." : "방명록 작성"}
      </button>
    </form>
  );
}
