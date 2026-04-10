import type { Task } from "@/types";
import { TaskCard } from "@/components/ui/TaskCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  dotColor: "gray" | "amber" | "green";
}

const dotStyles = {
  gray:  "bg-ink5",
  amber: "bg-amber",
  green: "bg-uac-green",
};

/** Single Kanban column with a header dot + task count. */
export function KanbanColumn({ title, tasks, dotColor }: KanbanColumnProps) {
  return (
    <div className="bg-surf border border-border rounded-[10px] overflow-hidden">
      {/* Column header */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border">
        <div className={cn("w-2 h-2 rounded-full", dotStyles[dotColor])} />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink3">{title}</span>
        <span className="ml-auto font-mono text-[9px] text-ink5">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="p-2 flex flex-col gap-1.5 min-h-24">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} muted={task.status === "done"} />
        ))}
      </div>
    </div>
  );
}
