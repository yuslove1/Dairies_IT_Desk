import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { TaskCard } from "@/components/ui/TaskCard";
import { LogEntryCard } from "@/components/ui/LogEntryCard";
import { Button } from "@/components/ui/Button";
import { currentUser } from "@/lib/data/staff";
import { tasks } from "@/lib/data/tasks";
import { todayLogs } from "@/lib/data/logs";

export const metadata: Metadata = { title: "Dashboard — IT Desk" };

const activeTasks = tasks.filter((t) => t.status !== "done").slice(0, 3);

export default function DashboardPage() {
  return (
    <AppShell user={currentUser} subtitle="Dairies Plant">
      {/* Greeting */}
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">
        Good morning, {currentUser.name.toUpperCase()} ☀
      </h1>
      <p className="font-mono text-[10px] text-ink5 mb-4 sm:mb-5">
        // Tuesday, 31 March 2026 · Dairies Plant IT Support
      </p>

      {/* Stats — 2x2 on mobile, 4 across on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mb-4 sm:mb-5">
        <StatCard label="Open tasks"  value={5} detail="↑ 2 added today" variant="red" />
        <StatCard label="In progress" value={2}                            variant="amber" />
        <StatCard label="Done today"  value={3} detail="✓ Good pace"      variant="green" />
        <StatCard label="Log entries" value={4} detail="today" />
      </div>

      {/* Two-col widget area — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Active tasks */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink">Active tasks</h2>
            <Button variant="soft-green" size="sm">+ Add task</Button>
          </div>
          <div className="flex flex-col gap-1.5">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        {/* Today's log */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink">Today&apos;s log</h2>
            <Button variant="outline-green" size="sm">+ Add entry</Button>
          </div>
          <div className="flex flex-col gap-1.5">
            {todayLogs.slice(0, 3).map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
