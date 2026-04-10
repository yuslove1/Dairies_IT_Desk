import type { TaskCategory } from "@/types";
import { cn } from "@/lib/utils";

interface TagProps {
  category: TaskCategory;
  className?: string;
}

// Category → style
const styles: Record<TaskCategory, string> = {
  hardware: "bg-amber-soft text-amber",
  network:  "bg-blue-soft text-blue",
  software: "bg-purple-soft text-purple",
  urgent:   "bg-uac-red-soft text-uac-red",
};

/** Small square category tag (hardware / network / software / urgent). */
export function Tag({ category, className }: TagProps) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-medium px-1.5 py-0.5 rounded tracking-wide",
        styles[category],
        className,
      )}
    >
      {category}
    </span>
  );
}
