import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface BadgeProps {
  role: UserRole;
  className?: string;
}

// Role → style map
const styles: Record<UserRole, string> = {
  staff:   "bg-uac-green/25 text-uac-green-mid border border-uac-green/40",
  manager: "bg-purple/25 text-purple-mid border border-purple/40",
  admin:   "bg-uac-red/25 text-uac-red-mid border border-uac-red/30",
};

/** Small mono badge showing user role (staff / manager / admin). */
export function Badge({ role, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide",
        styles[role],
        className,
      )}
    >
      {role}
    </span>
  );
}
