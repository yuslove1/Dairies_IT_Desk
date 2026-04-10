import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { KanbanColumn } from "@/components/ui/KanbanColumn";
import { Button } from "@/components/ui/Button";
import { currentUser } from "@/lib/data/staff";
import { todoTasks, wipTasks, doneTasks } from "@/lib/data/tasks";

export const metadata: Metadata = { title: "Task Board — IT Desk" };

export default function TasksPage() {
  return (
    <AppShell
      user={currentUser}
      subtitle="Task Board"
      topbarActions={<Button variant="soft-green" size="sm">+ New Task</Button>}
    >
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">Task Board</h1>
      <p className="font-mono text-[10px] text-ink5 mb-4 sm:mb-5 leading-relaxed">
        // {todoTasks.length} open · {wipTasks.length} in progress · {doneTasks.length} done this week ·{" "}
        <span className="hidden sm:inline">manager-assigned tasks shown with purple chip</span>
      </p>

      {/* Kanban — single col mobile, 2 col md, 3 col xl */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
        <KanbanColumn title="To Do"       tasks={todoTasks} dotColor="gray" />
        <KanbanColumn title="In Progress" tasks={wipTasks}  dotColor="amber" />
        {/* Done column hidden on mobile to save space, shown on md+ */}
        <div className="md:col-span-2 xl:col-span-1">
          <KanbanColumn title="Done" tasks={doneTasks} dotColor="green" />
        </div>
      </div>
    </AppShell>
  );
}
