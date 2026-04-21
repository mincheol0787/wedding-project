"use client";

import { useActionState } from "react";
import {
  createProjectAction,
  type CreateProjectState
} from "@/app/dashboard/projects/new/actions";

const initialState: CreateProjectState = {};

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-5 rounded-md border border-ink/10 bg-white p-6 shadow-sm">
      <label className="grid gap-2 text-sm font-medium text-ink">
        프로젝트 이름
        <input
          className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-rose"
          name="title"
          placeholder="봄날의 결혼식"
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          신랑 이름
          <input
            className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-rose"
            name="groomName"
            placeholder="민수"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          신부 이름
          <input
            className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-rose"
            name="brideName"
            placeholder="서연"
            required
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        예식일
        <input
          className="rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-rose"
          name="weddingDate"
          type="datetime-local"
        />
      </label>
      {state.error ? <p className="text-sm text-rose">{state.error}</p> : null}
      <button
        className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "프로젝트 생성 중..." : "프로젝트 만들기"}
      </button>
    </form>
  );
}
