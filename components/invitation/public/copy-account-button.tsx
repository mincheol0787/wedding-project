"use client";

import { useState } from "react";

type CopyAccountButtonProps = {
  text: string;
};

export function CopyAccountButton({ text }: CopyAccountButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="rounded-md border border-ink/15 px-3 py-2 text-xs font-medium text-ink"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      type="button"
    >
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
