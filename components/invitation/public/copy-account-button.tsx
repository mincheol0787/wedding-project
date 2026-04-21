"use client";

import { useState } from "react";

type CopyAccountButtonProps = {
  text: string;
};

export function CopyAccountButton({ text }: CopyAccountButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  return (
    <button
      className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink disabled:opacity-60"
      disabled={copying}
      onClick={async () => {
        try {
          setCopying(true);
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } finally {
          setCopying(false);
        }
      }}
      type="button"
    >
      {copying ? "복사 중..." : copied ? "복사 완료" : "복사"}
    </button>
  );
}
