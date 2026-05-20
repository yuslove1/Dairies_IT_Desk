"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { TaskCard } from "@/components/ui/TaskCard";
import { LogEntryCard } from "@/components/ui/LogEntryCard";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { api } from "@/lib/api";
import type { Task, LogEntry } from "@/types";
import { useRouter } from "next/navigation";

function mapTask(r: any): Task {
  const initials = r.author?.name
    ? r.author.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "IT";
  return {
    id: r.id, title: r.title, description: r.description ?? undefined,
    category: r.category ?? "hardware", priority: r.priority ?? "med", status: r.status,
    assignedTo: { id: r.author?.id ?? "unknown", name: r.author?.name ?? "IT Staff", initials, role: r.author?.role ?? "staff", department: "IT Dept" },
    isManagerAssigned: r.author?.role === "manager",
    createdAt: r.createdAt ? new Date(r.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "--:--",
  };
}

function mapLog(r: any): LogEntry {
  return {
    id: r.id,
    time: r.logDate ? new Date(r.logDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "--:--",
    description: r.content,
    category: r.category ?? "routine",
    date: r.logDate ? r.logDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Empty state component ────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center bg-surf border border-dashed border-border rounded-[10px]">
      <span className="text-2xl mb-2">{icon}</span>
      <p className="text-[12px] font-semibold text-ink">{title}</p>
      <p className="font-mono text-[10px] text-ink5 mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ tasks: any[] }>("/tasks"),
      api.get<{ logs: any[] }>("/logs"),
    ])
      .then(([taskRes, logRes]) => {
        setTasks(taskRes.tasks.map(mapTask));
        setLogs(logRes.logs.map(mapLog));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const todo = tasks.filter((t) => t.status === "todo");
  const wip = tasks.filter((t) => t.status === "wip");
  const done = tasks.filter((t) => t.status === "done");
  const active = tasks.filter((t) => t.status !== "done").slice(0, 3);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <AppShell user={user} subtitle="Dairies Plant">
      {/* ── Welcome banner ───────────────────────────────────────────────── */}
      <div className="bg-surf border border-border rounded-[10px] px-5 py-4 mb-4 flex items-center justify-between animate-fade-up overflow-hidden relative">
        {/* Subtle left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-uac-green rounded-l-[10px]" />
        <div className="pl-2">
          <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-ink">
            {getGreeting()}, {user?.name ?? "…"} ☀
          </h1>
          <p className="font-mono text-[10px] text-ink5 mt-0.5">
            // {today} · Dairies Plant IT Support
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="font-mono text-[9px] text-ink6 uppercase tracking-wider">Time</span>
          <span className="font-mono text-[13px] font-bold text-ink">
            {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* ── Stat strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mb-5 animate-fade-up">
        <StatCard
          icon="📋" label="Open tasks"
          value={loading ? "…" : todo.length}
          detail={loading ? undefined : todo.length > 0 ? `${todo.length} need attention` : "All clear ✓"}
          variant="red"
        />
        <StatCard
          icon="⚙" label="In progress"
          value={loading ? "…" : wip.length}
          detail={loading ? undefined : wip.length > 0 ? "Active now" : "None active"}
          variant="amber"
        />
        <StatCard
          icon="✓" label="Done today"
          value={loading ? "…" : done.length}
          detail={loading ? undefined : done.length > 0 ? "Good pace ↑" : "Get started"}
          variant="green"
        />
        <StatCard
          icon="📝" label="Log entries"
          value={loading ? "…" : logs.length}
          detail="today"
        />
      </div>

      {/* ── Two-col widget area ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-up">
        {/* Active tasks */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink flex items-center gap-1.5">
              <span className="text-uac-red text-[10px]">◫</span> Active tasks
            </h2>
            <Button variant="soft-green" size="sm" onClick={() => router.push("/tasks")}>
              View all →
            </Button>
          </div>
          {loading ? (
            <div className="space-y-1.5">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-[8px]" />)}
            </div>
          ) : active.length === 0 ? (
            <EmptyState icon="✓" title="All clear!" sub="No active tasks — add one from Task Board" />
          ) : (
            <div className="flex flex-col gap-1.5">
              {active.map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </div>

        {/* Today's log */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink flex items-center gap-1.5">
              <span className="text-uac-green text-[10px]">≡</span> Today&apos;s log
            </h2>
            <Button variant="outline-green" size="sm" onClick={() => router.push("/log")}>
              + Log entry
            </Button>
          </div>
          {loading ? (
            <div className="space-y-1.5">
              {[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-[8px]" />)}
            </div>
          ) : logs.length === 0 ? (
            <EmptyState icon="📝" title="No entries yet" sub="Log your first activity for today" />
          ) : (
            <div className="flex flex-col gap-1.5">
              {logs.slice(0, 3).map((entry) => <LogEntryCard key={entry.id} entry={entry} compact />)}
              {logs.length > 3 && (
                <button
                  onClick={() => router.push("/log")}
                  className="font-mono text-[9px] text-uac-green hover:underline text-center pt-1"
                >
                  +{logs.length - 3} more entries →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
