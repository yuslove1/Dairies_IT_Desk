import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { TaskCard } from "@/components/ui/TaskCard";
import { LogEntryCard } from "@/components/ui/LogEntryCard";
import { Button } from "@/components/ui/Button";
import { managerUser } from "@/lib/data/staff";
import { tasks } from "@/lib/data/tasks";
import { todayLogs } from "@/lib/data/logs";

export const metadata: Metadata = { title: "Manager Dashboard — IT Desk" };

const allTasks = tasks.filter((t) => ["t1", "t2", "t10", "t11"].includes(t.id));

export default function ManagerDashboardPage() {
  return (
    <AppShell
      user={managerUser}
      subtitle="Manager View"
      topbarActions={
        <Button variant="soft-green" size="sm" className="hidden sm:inline-flex">
          + Create &amp; Assign Task
        </Button>
      }
    >
      {/* Manager banner */}
      <div className="rounded-[10px] bg-gradient-to-br from-uac-red-deep to-[#3a0818] border border-uac-red/30 px-4 py-3.5 flex items-center gap-3.5 mb-4">
        <span className="text-xl sm:text-2xl">📋</span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-white">Manager Dashboard</p>
          <p className="font-mono text-[9px] text-white/35 mt-0.5 truncate">
            // View + create + assign tasks · Dairies Plant IT · 31 Mar 2026
          </p>
        </div>
        <span className="ml-auto font-mono text-[9px] font-semibold px-2 py-1 rounded bg-uac-green/25 text-uac-green-mid border border-uac-green/40 uppercase tracking-wide shrink-0 hidden sm:inline">
          can create tasks
        </span>
      </div>

      {/* Stats — 2x2 mobile, 4 across lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mb-4 sm:mb-5">
        <StatCard label="Open tasks"        value={5} variant="red" />
        <StatCard label="In progress"       value={2} variant="amber" />
        <StatCard label="Done this week"    value={8} variant="green" />
        <StatCard label="Log entries today" value={4} />
      </div>

      {/* Two-col content — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink">All tasks</h2>
            <Button variant="green" size="sm">+ Create &amp; Assign</Button>
          </div>
          <div className="flex flex-col gap-1.5">
            {allTasks.map((task) => (
              <TaskCard key={task.id} task={task} muted={task.status === "done"} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[12px] font-bold text-ink mb-2.5">Today&apos;s activity</h2>
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
