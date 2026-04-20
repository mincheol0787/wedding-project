"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import {
  saveInvitationAction,
  type InvitationSaveState
} from "@/app/dashboard/projects/[projectId]/invitation/actions";
import {
  invitationTemplates,
  type BankAccount,
  type InvitationGalleryItem,
  type InvitationTemplateId
} from "@/lib/invitation/types";
import { createId } from "@/lib/video/editor-state";

type InvitationEditorProps = {
  projectId: string;
  publicUrl: string;
  defaults: {
    templateId: InvitationTemplateId;
    title: string;
    groomName: string;
    brideName: string;
    eventDate: string;
    venueName: string;
    venueAddress: string;
    venueDetail: string;
    greeting: string;
    mapProvider: string;
    mapLat: string;
    mapLng: string;
    gallery: InvitationGalleryItem[];
    bankAccounts: BankAccount[];
  };
};

const initialState: InvitationSaveState = {};

export function InvitationEditor({ projectId, publicUrl, defaults }: InvitationEditorProps) {
  const [templateId, setTemplateId] = useState(defaults.templateId);
  const [gallery, setGallery] = useState(defaults.gallery);
  const [bankAccounts, setBankAccounts] = useState(defaults.bankAccounts);
  const action = saveInvitationAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const galleryJson = useMemo(() => JSON.stringify(gallery), [gallery]);
  const bankAccountsJson = useMemo(() => JSON.stringify(bankAccounts), [bankAccounts]);

  async function handleGalleryUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const items = await Promise.all(
      Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .map(async (file) => ({
          id: createId("gallery"),
          fileName: file.name,
          src: await readFileAsDataUrl(file),
          alt: file.name
        }))
    );

    setGallery((current) => [...current, ...items]);
  }

  function addBankAccount() {
    setBankAccounts((current) => [
      ...current,
      {
        id: createId("account"),
        label: "축의금",
        bankName: "",
        accountNumber: "",
        holderName: ""
      }
    ]);
  }

  function updateBankAccount(id: string, patch: Partial<BankAccount>) {
    setBankAccounts((current) =>
      current.map((account) =>
        account.id === id
          ? {
              ...account,
              ...patch
            }
          : account
      )
    );
  }

  return (
    <form action={formAction} className="grid gap-8">
      <input name="templateId" type="hidden" value={templateId} />
      <input name="galleryJson" type="hidden" value={galleryJson} />
      <input name="bankAccountsJson" type="hidden" value={bankAccountsJson} />

      <section className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Template</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">템플릿 선택</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {invitationTemplates.map((template) => (
            <button
              className={`rounded-md border p-4 text-left ${
                templateId === template.id ? "border-rose bg-rose/5" : "border-ink/10"
              }`}
              key={template.id}
              onClick={() => setTemplateId(template.id)}
              type="button"
            >
              <span className="text-sm font-semibold text-ink">{template.name}</span>
              <span className="mt-2 block text-sm leading-6 text-ink/60">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Details</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">기본 정보</h2>
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          제목
          <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.title} name="title" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            신랑 이름
            <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.groomName} name="groomName" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            신부 이름
            <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.brideName} name="brideName" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          예식 날짜
          <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.eventDate} name="eventDate" type="datetime-local" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          소개 문구
          <textarea className="min-h-32 rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.greeting} name="greeting" />
        </label>
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Venue</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">장소와 지도</h2>
        </div>
        <label className="grid gap-2 text-sm font-medium text-ink">
          장소명
          <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.venueName} name="venueName" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          주소
          <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.venueAddress} name="venueAddress" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          상세 안내
          <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.venueDetail} name="venueDetail" />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-ink">
            지도 제공자
            <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.mapProvider} name="mapProvider" placeholder="kakao" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            위도
            <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.mapLat} name="mapLat" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            경도
            <input className="rounded-md border border-ink/15 px-3 py-2" defaultValue={defaults.mapLng} name="mapLng" />
          </label>
        </div>
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Gallery</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">갤러리 업로드</h2>
          </div>
          <label className="inline-flex cursor-pointer rounded-md bg-ink px-5 py-3 text-sm font-medium text-white">
            사진 선택
            <input accept="image/*" className="sr-only" multiple onChange={(event) => handleGalleryUpload(event.target.files)} type="file" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.map((item) => (
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-porcelain" key={item.id}>
              <Image alt={item.alt ?? item.fileName} className="object-cover" fill src={item.src} unoptimized />
              <button
                className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs text-rose"
                onClick={() => setGallery((current) => current.filter((galleryItem) => galleryItem.id !== item.id))}
                type="button"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose">Gift</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">계좌번호</h2>
        </div>
        <div className="grid gap-3">
          {bankAccounts.map((account) => (
            <article className="grid gap-3 rounded-md border border-ink/10 bg-porcelain/70 p-3 md:grid-cols-4" key={account.id}>
              <input className="rounded-md border border-ink/15 px-3 py-2" onChange={(event) => updateBankAccount(account.id, { label: event.target.value })} placeholder="신랑측" value={account.label} />
              <input className="rounded-md border border-ink/15 px-3 py-2" onChange={(event) => updateBankAccount(account.id, { bankName: event.target.value })} placeholder="은행명" value={account.bankName} />
              <input className="rounded-md border border-ink/15 px-3 py-2" onChange={(event) => updateBankAccount(account.id, { accountNumber: event.target.value })} placeholder="계좌번호" value={account.accountNumber} />
              <input className="rounded-md border border-ink/15 px-3 py-2" onChange={(event) => updateBankAccount(account.id, { holderName: event.target.value })} placeholder="예금주" value={account.holderName} />
            </article>
          ))}
        </div>
        <button className="w-fit rounded-md border border-ink/15 px-4 py-2 text-sm" onClick={addBankAccount} type="button">
          계좌 추가
        </button>
      </section>

      <section className="sticky bottom-0 z-10 rounded-md border border-ink/10 bg-white p-4 shadow-sm">
        {state.error ? <p className="mb-3 text-sm text-rose">{state.error}</p> : null}
        {state.message ? <p className="mb-3 text-sm text-sage">{state.message}</p> : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <a className="text-sm font-medium text-ink/60" href={publicUrl} target="_blank">
            공개 URL: {publicUrl}
          </a>
          <div className="flex gap-2">
            <button className="rounded-md border border-ink/15 px-5 py-3 text-sm font-medium text-ink" disabled={pending} name="intent" type="submit" value="draft">
              임시 저장
            </button>
            <button className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-white" disabled={pending} name="intent" type="submit" value="publish">
              저장하고 공개
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
