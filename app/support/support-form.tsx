"use client";

import { useActionState } from "react";
import {
  createSupportInquiryAction,
  type SupportInquiryState
} from "@/app/support/actions";

const initialState: SupportInquiryState = {};

export function SupportForm({
  defaultEmail,
  defaultName
}: {
  defaultEmail?: string | null;
  defaultName?: string | null;
}) {
  const [state, formAction, pending] = useActionState(createSupportInquiryAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-[0_18px_60px_rgba(36,36,36,0.05)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Support</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">문의 남기기</h2>
        <p className="mt-2 text-sm leading-6 text-ink/58">
          결제, 제작, 오류, 기능 제안까지 편하게 남겨 주세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={defaultName ?? ""} label="이름" name="name" required />
        <Field defaultValue={defaultEmail ?? ""} label="이메일" name="email" required type="email" />
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink">
        문의 유형
        <select
          className="rounded-md border border-ink/12 bg-[#fbfcfb] px-4 py-3 text-sm outline-none transition focus:border-sage/60 focus:bg-white"
          name="category"
          required
        >
          <option value="제작 문의">제작 문의</option>
          <option value="청첩장 오류">청첩장 오류</option>
          <option value="영상 렌더링">영상 렌더링</option>
          <option value="결제/요금제">결제/요금제</option>
          <option value="기능 제안">기능 제안</option>
        </select>
      </label>

      <Field label="제목" name="subject" required />

      <label className="grid gap-2 text-sm font-medium text-ink">
        문의 내용
        <textarea
          className="min-h-36 resize-y rounded-md border border-ink/12 bg-[#fbfcfb] px-4 py-3 text-sm leading-6 outline-none transition focus:border-sage/60 focus:bg-white"
          name="message"
          placeholder="어떤 상황에서 문제가 생겼는지, 확인이 필요한 페이지나 프로젝트명을 함께 적어 주세요."
          required
        />
      </label>

      {state.error ? <p className="text-sm text-rose">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-sage">{state.message}</p> : null}

      <button
        className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "접수 중..." : "문의 접수"}
      </button>
    </form>
  );
}

function Field({
  defaultValue,
  label,
  name,
  required,
  type = "text"
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      {label}
      <input
        className="rounded-md border border-ink/12 bg-[#fbfcfb] px-4 py-3 text-sm outline-none transition focus:border-sage/60 focus:bg-white"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
