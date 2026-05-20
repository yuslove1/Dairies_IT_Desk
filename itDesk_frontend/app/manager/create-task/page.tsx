"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Alert } from "@/components/ui/Alert";
import { TaskCard } from "@/components/ui/TaskCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { api } from "@/lib/api";
import type { Task, TaskCategory, Priority } from "@/types";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StaffUser { id: string; name: string; email: string; role: string }

const CATEGORIES: TaskCategory[] = ["hardware", "network", "software", "urgent"];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "🔴 High" },
  { value: "med",  label: "🟡 Medium" },
  { value: "low",  label: "🟢 Low" },
];

const inputCls = "w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors";
const labelCls = "font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5";

export default function CreateTaskPage() {
  const user   = useCurrentUser();
  const router = useRouter();

  // ── Staff list ──────────────────────────────────────────────────────────────
  const [staff,        setStaff]        = useState<StaffUser[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    api.get<{ users: StaffUser[] }>("/users")
      .then((res) => setStaff(res.users))
      .catch(console.error)
      .finally(() => setStaffLoading(false));
  }, []);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState<TaskCategory>("network");
  const [priority,    setPriority]    = useState<Priority>("high");
  const [assigneeId,  setAssigneeId]  = useState<string>("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Derived: selected assignee object for the preview card
  const selectedStaff = staff.find((s) => s.id === assigneeId) ?? null;

  // Live preview task (updates as manager types)
  const previewTask: Task = {
    id: "preview",
    title: title.trim() || "Task title will appear here…",
    category,
    priority,
    status: "todo",
    assignedTo: {
      id: selectedStaff?.id ?? "pool",
      name: selectedStaff?.name ?? "IT Team",
      initials: selectedStaff
        ? selectedStaff.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "IT",
      role: "staff",
      department: "IT Dept",
    },
    assignedBy: user
      ? { id: user.id, name: user.name, initials: user.initials, role: "manager", department: "IT Dept" }
      : undefined,
    isManagerAssigned: true,
    createdAt: "just now",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await api.post("/tasks", {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status: "todo",
        assignedTo: assigneeId || undefined,
      });
      router.push("/manager");
    } catch (err: any) {
      setError(err.message ?? "Failed to create task");
      setSaving(false);
    }
  }

  return (
    <AppShell user={user} subtitle="Create Task">
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">
        Create &amp; Assign Task
      </h1>
      <p className="font-mono text-[10px] text-ink5 mb-4">
        // Manager action · task appears on staff board immediately with the purple &ldquo;assigned by manager&rdquo; label
      </p>

      <Alert variant="green">
        ✓&nbsp; As manager, tasks you create are flagged with a purple chip on the staff board.
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        {/* ── Task details form ── */}
        <form id="create-task-form" onSubmit={handleSubmit} className="bg-surf border border-border rounded-[10px] p-4">
          <p className={cn(labelCls, "tracking-widest mb-3")}>Task details</p>

          <div className="mb-3">
            <label className={labelCls}>Task title *</label>
            <input
              className={inputCls}
              placeholder="e.g. Inspect network switch in server room"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className={labelCls}>Description</label>
            <textarea
              className={cn(inputCls, "resize-none min-h-[72px]")}
              placeholder="Extra context for the IT staff member…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p className="font-mono text-[10px] text-uac-red bg-uac-red-soft px-2.5 py-1.5 rounded-[6px] mb-3">
              ⚠ {error}
            </p>
          )}
        </form>

        {/* ── Right col ── */}
        <div className="flex flex-col gap-3">
          {/* Assignee */}
          <div className="bg-surf border border-border rounded-[10px] p-4">
            <p className={cn(labelCls, "tracking-widest mb-3")}>Assign to staff member</p>

            <div className="mb-3">
              <label className={labelCls}>Assignee</label>
              <select
                className={inputCls}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">— Assign to whole IT team —</option>
                {staffLoading ? (
                  <option disabled>Loading staff…</option>
                ) : staff.length === 0 ? (
                  <option disabled>No staff accounts found</option>
                ) : (
                  staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))
                )}
              </select>
            </div>

            {selectedStaff ? (
              <div className="flex items-center gap-2 bg-uac-green-soft border border-uac-green-mid rounded-[6px] px-2.5 py-2">
                <Avatar
                  initials={selectedStaff.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  role="staff"
                  size="md"
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-uac-green-dk">{selectedStaff.name}</p>
                  <p className="font-mono text-[9px] text-uac-green truncate">{selectedStaff.email}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <Badge role="staff" />
                </div>
              </div>
            ) : (
              <p className="font-mono text-[9px] text-ink5">
                Task will be visible to all IT staff on the board.
              </p>
            )}
          </div>

          {/* Live preview */}
          <div className="bg-surf border border-border rounded-[10px] p-4">
            <p className={cn(labelCls, "tracking-widest mb-2.5")}>
              Preview — how it appears on staff board
            </p>
            <TaskCard task={previewTask} />
            <p className="font-mono text-[9px] text-ink5 mt-2">
              ↑ Purple &ldquo;assigned by manager&rdquo; label flags this as a manager task
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              form="create-task-form"
              variant="green"
              className="flex-1 justify-center"
              disabled={saving}
            >
              {saving ? "Creating…" : "Assign task →"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
