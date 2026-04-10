import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "red" | "green" | "ghost" | "soft-green" | "soft-red" | "outline-green";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Variant → Tailwind classes
const variants: Record<Variant, string> = {
  red:           "bg-uac-red text-white hover:bg-uac-red-dark",
  green:         "bg-uac-green text-white hover:bg-uac-green-dk",
  ghost:         "bg-transparent border border-border text-ink3 hover:border-ink4 hover:text-ink",
  "soft-green":  "bg-uac-green-soft text-uac-green-dk border border-uac-green-mid hover:bg-uac-green-mid/40",
  "soft-red":    "bg-uac-red-soft text-uac-red border border-uac-red-mid",
  "outline-green":"bg-transparent border border-uac-green text-uac-green-dk hover:bg-uac-green-soft",
};

const sizes: Record<Size, string> = {
  sm: "text-[9px] px-2.5 py-1",
  md: "text-[10px] px-3 py-1.5",
};

/** All-purpose button with variant and size props. */
export function Button({ variant = "ghost", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-mono font-semibold uppercase tracking-wide rounded-[6px] inline-flex items-center gap-1.5 cursor-pointer transition-all duration-100 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
