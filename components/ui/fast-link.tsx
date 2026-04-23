"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type AnchorHTMLAttributes, type ReactNode } from "react";

type FastLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
  showLoading?: boolean;
};

export function FastLink({
  children,
  className,
  href,
  onClick,
  onFocus,
  onPointerEnter,
  showLoading = true,
  ...props
}: FastLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  function prefetch() {
    if (href.startsWith("/")) {
      router.prefetch(href);
    }
  }

  return (
    <Link
      className={`${className ?? ""} relative overflow-hidden`}
      href={href}
      onClick={(event) => {
        if (showLoading && props.target !== "_blank") {
          setIsNavigating(true);
        }
        onClick?.(event);
      }}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
      onPointerEnter={(event) => {
        prefetch();
        onPointerEnter?.(event);
      }}
      prefetch
      {...props}
    >
      <span className={isNavigating ? "opacity-70" : ""}>{children}</span>
      {isNavigating ? (
        <span className="absolute inset-x-2 bottom-1 h-1 overflow-hidden rounded-full bg-white/35">
          <span className="block h-full w-1/2 animate-[soft-loading_1.05s_ease-in-out_infinite] rounded-full bg-rose/80" />
        </span>
      ) : null}
    </Link>
  );
}
