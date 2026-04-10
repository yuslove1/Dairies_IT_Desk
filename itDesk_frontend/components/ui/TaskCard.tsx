import type { Task } from "@/types";
import { Pill } from "./Pill";
import { Tag } from "./Tag";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  muted?: boolean; // done tasks are slightly faded
  className?: string;
}

// Left accent stripe colour by priority
const priorityStripe: Record<Task["priority"], string> = {
  high: "border-l-uac-red",
  med:  "border-l-amber",
  low:  "border-l-uac-green",
};

/** Task card used on the dashboard, kanban board, and manager view. */
export function TaskCard({ task, muted, className }: TaskCardProps) {
  return (
    <div
      className={cn(
        "bg-surf border border-border rounded-[6px] px-2.5 pt-2.5 pb-2 cursor-pointer",
        "border-l-[3px] pl-3.5 transition-all duration-100",
        "hover:border-uac-green hover:shadow-[0_2px_8px_rgba(0,121,58,0.10)]",
        priorityStripe[task.priority],
        muted && "opacity-60",
        className,
      )}
    >
      {/* Title */}
      <p className="text-[11px] font-semibold text-ink leading-snug mb-1.5">{task.title}</p>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tag category={task.category} />
        <Pill status={task.status} />
        <span className="font-mono text-[9px] text-ink5 ml-auto">{task.createdAt}</span>
      </div>

      {/* Assignee row */}
      {(task.assignedTo || task.isManagerAssigned) && (
        <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[9px] text-ink4">
          <Avatar
            initials={task.isManagerAssigned ? (task.assignedBy?.initials ?? "LM") : task.assignedTo.initials}
            role={task.isManagerAssigned ? "manager" : "staff"}
            size="sm"
          />
          {task.isManagerAssigned ? (
            <span className="text-purple">assigned by manager</span>
          ) : (
            <span>Assigned to you</span>
          )}
          {task.priority === "high" && !task.isManagerAssigned && (
            <span className="ml-auto text-uac-red">urgent</span>
          )}
        </div>
      )}
    </div>
  );
}
