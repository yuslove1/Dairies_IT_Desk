import { cn } from "@/lib/utils";

type AlertVariant = "amber" | "green" | "red";

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  amber: "bg-amber-soft text-amber border border-[#f5d08a]",
  green: "bg-uac-green-soft text-uac-green-dk border border-uac-green-mid",
  red:   "bg-uac-red-soft text-uac-red border border-uac-red-mid",
};

/** Inline alert banner (amber / green / red). */
export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div className={cn("rounded-[6px] px-3 py-2.5 font-mono text-[10px] flex items-center gap-2 mb-3", styles[variant], className)}>
      {children}
    </div>
  );
}
