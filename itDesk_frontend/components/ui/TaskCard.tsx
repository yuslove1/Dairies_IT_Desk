"use client";

import type { Task, TaskStatus } from "@/types";
import { Pill } from "./Pill";
import { Tag } from "./Tag";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TaskCardProps {
  task:            Task;
  muted?:          boolean;
  className?:      string;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?:       (taskId: string) => void;
  onEdit?:         (task: Task) => void;
}

const priorityStripe: Record<Task["priority"], string> = {
  high: "border-l-uac-red",
  med:  "border-l-amber",
  low:  "border-l-uac-green",
};

const priorityLabel: Record<Task["priority"], string> = {
  high: "🔴 High",
  med:  "🟡 Medium",
  low:  "🟢 Low",
};

const STATUS_ACTIONS: Record<TaskStatus, { label: string; to: TaskStatus; style: string }[]> = {
  todo: [{ label: "▶ Start",   to: "wip",  style: "bg-amber-soft text-amber border-amber/30 hover:bg-amber/20" }],
  wip:  [
    { label: "✓ Done",   to: "done", style: "bg-uac-green-soft text-uac-green-dk border-uac-green/30 hover:bg-uac-green-mid/30" },
    { label: "← Reopen", to: "todo", style: "bg-paper text-ink4 border-border hover:border-ink4 hover:text-ink" },
  ],
  done: [{ label: "↩ Reopen", to: "wip", style: "bg-paper text-ink4 border-border hover:border-ink4 hover:text-ink" }],
};

export function TaskCard({ task, muted, className, onStatusChange, onDelete, onEdit }: TaskCardProps) {
  const [moving,     setMoving]     = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const actions = STATUS_ACTIONS[task.status] ?? [];

  async function handleMove(newStatus: TaskStatus) {
    if (moving || !onStatusChange) return;
    setMoving(true);
    await onStatusChange(task.id, newStatus);
    setMoving(false);
  }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(task.id);
    setDeleting(false);
    setConfirmDel(false);
  }

  return (
    <div
      className={cn(
        "group bg-surf border border-border rounded-[6px] px-2.5 pt-2.5 pb-2",
        "border-l-[3px] pl-3.5 transition-all duration-150",
        "hover:border-uac-green hover:shadow-[0_2px_8px_rgba(0,121,58,0.10)]",
        priorityStripe[task.priority],
        muted && "opacity-60",
        className,
      )}
    >
      {/* Title row */}
      <p className="text-[11px] font-semibold text-ink leading-snug mb-1.5">
        {task.title}
      </p>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Tag category={task.category} />
        <Pill status={task.status} />
        <span className="font-mono text-[9px] text-ink5 ml-auto">{task.createdAt}</span>
      </div>

      {/* Assignee */}
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

      {/* ── Toggle details button ── */}
      <button
        onClick={() => { setExpanded((v) => !v); setConfirmDel(false); }}
        className="mt-2 flex items-center gap-1 font-mono text-[9px] font-semibold text-uac-green hover:text-uac-green-dk transition-colors"
      >
        <span className={cn("transition-transform duration-150 inline-block", expanded && "rotate-180")}>▾</span>
        {expanded ? "close details" : "view details"}
      </button>

      {/* ── Expanded details section ── */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-1.5">
          {task.description ? (
            <p className="text-[10px] text-ink3 leading-relaxed">{task.description}</p>
          ) : (
            <p className="text-[10px] text-ink6 italic">No description provided.</p>
          )}
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="font-mono text-[9px] text-ink5">Priority: <span className="text-ink3">{priorityLabel[task.priority]}</span></span>
            <span className="font-mono text-[9px] text-ink5">Category: <span className="text-ink3 capitalize">{task.category}</span></span>
            <span className="font-mono text-[9px] text-ink5">Status: <span className="text-ink3 capitalize">{task.status}</span></span>
          </div>
        </div>
      )}


      {/* ── Edit + Delete — visible on hover for admin/manager ── */}
      {(onEdit || onDelete) && (
        <div className={cn(
          "flex gap-1.5 mt-2 transition-all duration-150",
          confirmDel ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}>
          {onEdit && (
            <button
              onClick={() => { setConfirmDel(false); onEdit(task); }}
              className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded border border-border text-ink4 hover:text-ink hover:border-ink4 transition-colors"
            >
              ✏ Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                "font-mono text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors",
                confirmDel
                  ? "border-uac-red bg-uac-red text-white hover:bg-uac-red-dark"
                  : "border-border text-ink5 hover:border-uac-red hover:text-uac-red",
                deleting && "opacity-50 cursor-wait",
              )}
            >
              {deleting ? "Deleting…" : confirmDel ? "Confirm delete?" : "🗑 Delete"}
            </button>
          )}
          {confirmDel && (
            <button
              onClick={() => setConfirmDel(false)}
              className="font-mono text-[9px] text-ink5 hover:text-ink px-1"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ── Status action buttons — visible on hover ── */}
      {onStatusChange && actions.length > 0 && (
        <div className={cn("flex gap-1.5 mt-1.5 transition-all duration-150", moving ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          {actions.map((action) => (
            <button
              key={action.to}
              disabled={moving}
              onClick={() => handleMove(action.to)}
              className={cn("font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-colors", action.style, moving && "cursor-wait")}
            >
              {moving ? "…" : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
