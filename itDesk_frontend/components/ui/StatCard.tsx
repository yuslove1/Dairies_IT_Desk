import { cn } from "@/lib/utils";

interface StatCardProps {
  label:    string;
  value:    number | string;
  detail?:  string;
  icon?:    string;
  variant?: "default" | "red" | "green" | "amber";
}

const variants = {
  default: {
    wrap:   "bg-surf border-border",
    accent: "bg-ink6",
    value:  "text-ink",
    detail: "text-ink5",
    dot:    "bg-ink6",
  },
  red: {
    wrap:   "bg-uac-red-soft border-border",
    accent: "bg-uac-red",
    value:  "text-uac-red",
    detail: "text-uac-red",
    dot:    "bg-uac-red-mid",
  },
  green: {
    wrap:   "bg-uac-green-soft border-border",
    accent: "bg-uac-green",
    value:  "text-uac-green-dk",
    detail: "text-uac-green-dk",
    dot:    "bg-uac-green-mid",
  },
  amber: {
    wrap:   "bg-amber-soft border-border",
    accent: "bg-amber",
    value:  "text-amber",
    detail: "text-amber",
    dot:    "bg-amber",
  },
};

export function StatCard({ label, value, detail, icon, variant = "default" }: StatCardProps) {
  const v = variants[variant];
  return (
    <div className={cn("rounded-[10px] border relative overflow-hidden card-lift", v.wrap)}>
      {/* Left accent stripe */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", v.accent)} />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "10px 10px",
        }}
      />

      <div className="pl-4 pr-3.5 pt-3.5 pb-3">
        {/* Label row */}
        <div className="flex items-center gap-1.5 mb-2">
          {icon && <span className="text-[13px]">{icon}</span>}
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-ink4">
            {label}
          </span>
        </div>

        {/* Value */}
        <div className={cn("text-[30px] font-extrabold tracking-tight leading-none", v.value)}>
          {value}
        </div>

        {/* Detail */}
        {detail && (
          <div className={cn("font-mono text-[9px] mt-1.5 font-medium", v.detail)}>
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
