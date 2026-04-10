import type { LogEntry } from "@/types";
import { cn } from "@/lib/utils";

interface LogEntryCardProps {
  entry: LogEntry;
  compact?: boolean; // smaller layout for dashboard widget
}

// Category → tag label colour
const tagColor: Record<LogEntry["category"], string> = {
  routine:  "bg-uac-green-soft text-uac-green-dk",
  hardware: "bg-amber-soft text-amber",
  network:  "bg-blue-soft text-blue",
  software: "bg-purple-soft text-purple",
  setup:    "bg-uac-green-soft text-uac-green-dk",
};

/** Single log entry row — used in daily log and dashboard widget. */
export function LogEntryCard({ entry, compact }: LogEntryCardProps) {
  return (
    <div className="bg-surf border border-border rounded-[10px] p-2.5 flex gap-3 items-start">
      {/* Timestamp */}
      <div className={cn("font-mono text-[9px] text-ink5 leading-relaxed shrink-0", compact ? "min-w-[38px]" : "min-w-[44px]")}>
        {entry.time}
        {!compact && <br />}
      </div>

      {/* Description + category tag */}
      <div className="text-[11px] text-ink2 leading-relaxed flex-1">
        {entry.description}
        <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded ml-2", tagColor[entry.category])}>
          {entry.category}
        </span>
      </div>
    </div>
  );
}
