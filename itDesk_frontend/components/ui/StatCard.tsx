import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  detail?: string;
  variant?: "default" | "red" | "green" | "amber";
}

// Variant → border + bg + text colour
const variants = {
  default: { wrap: "bg-surf border-border", value: "text-ink",          detail: "text-ink5" },
  red:     { wrap: "bg-uac-red-soft border-uac-red",   value: "text-uac-red",   detail: "text-uac-red" },
  green:   { wrap: "bg-uac-green-soft border-uac-green", value: "text-uac-green", detail: "text-uac-green" },
  amber:   { wrap: "bg-surf border-border",             value: "text-amber",     detail: "text-amber" },
};

/** Dashboard stat card with label, big number, and optional detail line. */
export function StatCard({ label, value, detail, variant = "default" }: StatCardProps) {
  const v = variants[variant];
  return (
    <div className={cn("rounded-[10px] border p-3.5", v.wrap)}>
      <div className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink5 mb-1">{label}</div>
      <div className={cn("text-2xl font-bold tracking-tight leading-none", v.value)}>{value}</div>
      {detail && (
        <div className={cn("font-mono text-[9px] mt-1", v.detail)}>{detail}</div>
      )}
    </div>
  );
}
