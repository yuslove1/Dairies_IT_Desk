"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KanbanColumn } from "@/components/ui/KanbanColumn";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { api } from "@/lib/api";
import type { Task, TaskCategory, Priority, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

// ── API → UI mapper ───────────────────────────────────────────────────────────
function mapTask(r: any): Task {
  const initials = r.author?.name
    ? r.author.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "IT";
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    category: r.category ?? "hardware",
    priority: r.priority ?? "med",
    status: r.status,
    assignedTo: {
      id: r.author?.id ?? "unknown",
      name: r.author?.name ?? "IT Staff",
      initials,
      role: r.author?.role ?? "staff",
      department: "IT Dept",
    },
    isManagerAssigned: r.author?.role === "manager",
    createdAt: r.createdAt
      ? new Date(r.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "--:--",
  };
}

const CATEGORIES: TaskCategory[] = ["hardware", "network", "software", "urgent"];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "🔴 High" },
  { value: "med",  label: "🟡 Medium" },
  { value: "low",  label: "🟢 Low" },
];

// ── Shared form fields ─────────────────────────────────────────────────────────
const inputCls = "w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors";
const labelCls = "font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5";

// ── Add Task modal ────────────────────────────────────────────────────────────
function AddTaskForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (task: Task) => void;
}) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState<TaskCategory>("hardware");
  const [priority,    setPriority]    = useState<Priority>("med");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<{ task: any }>("/tasks", {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status: "todo",
      });
      onCreated(mapTask(res.task));
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-surf border border-border rounded-[12px] shadow-[0_8px_40px_rgba(17,19,24,0.18)] w-full max-w-md p-5 animate-fade-up"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4">New task</p>
          <button type="button" onClick={onClose} className="text-ink5 hover:text-ink leading-none text-lg">✕</button>
        </div>

        <div className="mb-3">
          <label className={labelCls}>Title *</label>
          <input
            className={inputCls}
            placeholder="e.g. Replace toner in Production office printer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus required
          />
        </div>

        <div className="mb-3">
          <label className={labelCls}>Description (optional)</label>
          <textarea
            className={cn(inputCls, "resize-none min-h-[60px]")}
            placeholder="Any extra context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
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

        <div className="flex gap-2">
          <Button type="submit" variant="green" disabled={saving} className="flex-1">
            {saving ? "Creating…" : "Add to To Do →"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

// ── Edit Task modal ───────────────────────────────────────────────────────────
function EditTaskForm({
  task,
  onClose,
  onUpdated,
}: {
  task: Task;
  onClose: () => void;
  onUpdated: (task: Task) => void;
}) {
  const [title,       setTitle]       = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [category,    setCategory]    = useState<TaskCategory>(task.category);
  const [priority,    setPriority]    = useState<Priority>(task.priority);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await api.patch<{ task: any }>(`/tasks/${task.id}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
      });
      onUpdated(mapTask(res.task));
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to update task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-surf border border-border rounded-[12px] shadow-[0_8px_40px_rgba(17,19,24,0.18)] w-full max-w-md p-5 animate-fade-up"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4">Edit task</p>
          <button type="button" onClick={onClose} className="text-ink5 hover:text-ink leading-none text-lg">✕</button>
        </div>

        <div className="mb-3">
          <label className={labelCls}>Title *</label>
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus required
          />
        </div>

        <div className="mb-3">
          <label className={labelCls}>Description (optional)</label>
          <textarea
            className={cn(inputCls, "resize-none min-h-[60px]")}
            placeholder="Any extra context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
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

        <div className="flex gap-2">
          <Button type="submit" variant="green" disabled={saving} className="flex-1">
            {saving ? "Saving…" : "Save changes →"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

// ── Tasks Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const user = useCurrentUser();
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    api.get<{ tasks: any[] }>("/tasks")
      .then((res) => setTasks(res.tasks.map(mapTask)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Optimistic status move ─────────────────────────────────────────────────
  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    const prev = tasks.find((t) => t.id === taskId)?.status;
    setTasks((all) => all.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error("Status update failed — rolling back", err);
      if (prev) setTasks((all) => all.map((t) => t.id === taskId ? { ...t, status: prev } : t));
    }
  }

  // ── Delete task ────────────────────────────────────────────────────────────
  async function handleDeleteTask(taskId: string) {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((all) => all.filter((t) => t.id !== taskId));
    } catch (err: any) {
      console.error("Delete task failed:", err);
    }
  }

  // ── Update task after edit ─────────────────────────────────────────────────
  function handleTaskUpdated(updated: Task) {
    setTasks((all) => all.map((t) => t.id === updated.id ? updated : t));
  }

  const todo = tasks.filter((t) => t.status === "todo");
  const wip  = tasks.filter((t) => t.status === "wip");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <>
      <AppShell
        user={user}
        subtitle="Task Board"
        topbarActions={
          <Button variant="soft-green" size="sm" onClick={() => setShowForm(true)}>
            + New Task
          </Button>
        }
      >
        <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">Task Board</h1>
        <p className="font-mono text-[10px] text-ink5 mb-4 sm:mb-5 leading-relaxed">
          {loading
            ? "// Loading tasks…"
            : `// ${todo.length} open · ${wip.length} in progress · ${done.length} done`}
          <span className="hidden sm:inline"> · hover a card to move it between columns</span>
          {canManage && <span className="ml-2 text-uac-green">· admin/manager: hover to edit or delete</span>}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 rounded-[10px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
            <KanbanColumn
              title="To Do"
              tasks={todo}
              dotColor="gray"
              onStatusChange={handleStatusChange}
              onDelete={canManage ? handleDeleteTask : undefined}
              onEdit={canManage ? setEditingTask : undefined}
            />
            <KanbanColumn
              title="In Progress"
              tasks={wip}
              dotColor="amber"
              onStatusChange={handleStatusChange}
              onDelete={canManage ? handleDeleteTask : undefined}
              onEdit={canManage ? setEditingTask : undefined}
            />
            <div className="md:col-span-2 xl:col-span-1">
              <KanbanColumn
                title="Done"
                tasks={done}
                dotColor="green"
                onStatusChange={handleStatusChange}
                onDelete={canManage ? handleDeleteTask : undefined}
                onEdit={canManage ? setEditingTask : undefined}
              />
            </div>
          </div>
        )}
      </AppShell>

      {showForm && (
        <AddTaskForm
          onClose={() => setShowForm(false)}
          onCreated={(newTask) => setTasks((prev) => [newTask, ...prev])}
        />
      )}

      {editingTask && (
        <EditTaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={(updated) => { handleTaskUpdated(updated); setEditingTask(null); }}
        />
      )}
    </>
  );
}
