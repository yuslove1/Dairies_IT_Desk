import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

interface PillProps {
  status: TaskStatus;
  className?: string;
}

// Status → visual style
const styles: Record<TaskStatus, string> = {
  todo: "bg-surf2 text-ink4",
  wip:  "bg-amber-soft text-amber",
  done: "bg-uac-green-soft text-uac-green-dk",
};

const labels: Record<TaskStatus, string> = {
  todo: "todo",
  wip:  "in progress",
  done: "done",
};

/** Rounded status pill (todo / in progress / done). */
export function Pill({ status, className }: PillProps) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
