import type { Task, TaskStatus } from "@/types";
import { TaskCard } from "@/components/ui/TaskCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title:           string;
  tasks:           Task[];
  dotColor:        "gray" | "amber" | "green";
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?:       (taskId: string) => void;
  onEdit?:         (task: Task) => void;
}

const dotStyles = {
  gray:  "bg-ink5",
  amber: "bg-amber",
  green: "bg-uac-green",
};

/** Single Kanban column with a header dot + task count. */
export function KanbanColumn({ title, tasks, dotColor, onStatusChange, onDelete, onEdit }: KanbanColumnProps) {
  return (
    <div className="bg-surf border border-border rounded-[10px] overflow-hidden flex flex-col">
      {/* Column header */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border shrink-0">
        <div className={cn("w-2 h-2 rounded-full", dotStyles[dotColor])} />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-ink3">{title}</span>
        <span className="ml-auto font-mono text-[9px] text-ink5">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="p-2 flex flex-col gap-1.5 min-h-24">
        {tasks.length === 0 ? (
          <p className="font-mono text-[9px] text-ink6 text-center py-4">Empty</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              muted={task.status === "done"}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
