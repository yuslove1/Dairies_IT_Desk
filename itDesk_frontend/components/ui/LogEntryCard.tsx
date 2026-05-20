"use client";

import { useState } from "react";
import type { LogEntry, LogCategory } from "@/types";
import { cn } from "@/lib/utils";

interface LogEntryCardProps {
  entry:     LogEntry;
  compact?:  boolean;
  onDelete?: (id: string) => Promise<void> | void;
  onEdit?:   (id: string, content: string, category: LogCategory) => Promise<void> | void;
}

const tagColor: Record<LogEntry["category"], string> = {
  routine:  "bg-uac-green-soft text-uac-green-dk",
  hardware: "bg-amber-soft text-amber",
  network:  "bg-blue-soft text-blue",
  software: "bg-purple-soft text-purple",
  setup:    "bg-uac-green-soft text-uac-green-dk",
};

const categories: LogCategory[] = ["routine", "hardware", "network", "software", "setup"];

// Threshold (chars) above which we show "show more"
const TRUNCATE_AT = 90;

export function LogEntryCard({ entry, compact, onDelete, onEdit }: LogEntryCardProps) {
  const [confirmDel,    setConfirmDel]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [editing,       setEditing]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [expanded,      setExpanded]      = useState(false);
  const [editContent,   setEditContent]   = useState(entry.description);
  const [editCategory,  setEditCategory]  = useState<LogCategory>(entry.category);

  const isTruncatable = entry.description.length > TRUNCATE_AT;
  const displayText   = !expanded && isTruncatable
    ? entry.description.slice(0, TRUNCATE_AT).trimEnd() + "…"
    : entry.description;

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(entry.id);
    setDeleting(false);
  }

  function handleStartEdit() {
    setEditContent(entry.description);
    setEditCategory(entry.category);
    setConfirmDel(false);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!onEdit || !editContent.trim()) return;
    setSaving(true);
    await onEdit(entry.id, editContent.trim(), editCategory);
    setSaving(false);
    setEditing(false);
  }

  const inputCls = "w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[11px] text-ink outline-none focus:border-uac-green transition-colors";

  return (
    <div className="group bg-surf border border-border rounded-[10px] p-2.5 flex gap-3 items-start">
      {/* Timestamp */}
      <div className={cn(
        "font-mono text-[9px] text-ink5 leading-relaxed shrink-0 pt-0.5",
        compact ? "min-w-[38px]" : "min-w-[44px]",
      )}>
        {entry.time}
      </div>

      {/* Description + edit form or tag */}
      <div className="flex-1 min-w-0">
        {editing ? (
          /* ── Inline edit mode ── */
          <div className="space-y-1.5">
            <textarea
              className={cn(inputCls, "resize-none min-h-[50px]")}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoFocus
            />
            <select
              className={inputCls}
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as LogCategory)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-1.5 pt-0.5">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editContent.trim()}
                className="font-mono text-[9px] font-semibold px-2.5 py-0.5 rounded border border-uac-green bg-uac-green text-white hover:bg-uac-green-dk transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {saving ? "Saving…" : "Save →"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="font-mono text-[9px] text-ink5 hover:text-ink px-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── Normal display mode ── */
          <div>
            <span className="text-[11px] text-ink2 leading-relaxed">
              {displayText}
            </span>
            <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded ml-1.5 inline-block align-middle", tagColor[entry.category])}>
              {entry.category}
            </span>

            {/* Show more / show less */}
            {isTruncatable && !compact && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="ml-1.5 font-mono text-[9px] text-uac-green hover:underline align-middle"
              >
                {expanded ? "show less" : "show more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit + Delete — visible on hover, hidden in compact or while editing */}
      {!compact && !editing && (onDelete || onEdit) && (
        <div className={cn(
          "flex items-center gap-1 transition-opacity duration-150 shrink-0 pt-0.5",
          confirmDel ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}>
          {onEdit && (
            <button
              onClick={handleStartEdit}
              className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded border border-border text-ink4 hover:text-ink hover:border-ink4 transition-colors"
            >
              ✏
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                "font-mono text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors",
                confirmDel ? "border-uac-red bg-uac-red text-white" : "border-border text-ink5 hover:border-uac-red hover:text-uac-red",
                deleting && "opacity-50 cursor-wait",
              )}
            >
              {deleting ? "…" : confirmDel ? "Confirm?" : "🗑"}
            </button>
          )}
          {confirmDel && (
            <button onClick={() => setConfirmDel(false)} className="font-mono text-[9px] text-ink5 hover:text-ink">✕</button>
          )}
        </div>
      )}
    </div>
  );
}
