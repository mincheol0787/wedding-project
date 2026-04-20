import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-md px-4 py-2 text-sm font-medium",
        variant === "primary" && "bg-ink text-white",
        variant === "secondary" && "border border-ink/15 text-ink",
        className
      )}
      {...props}
    />
  );
}
