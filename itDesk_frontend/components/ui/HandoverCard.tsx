"use client";

import { useState } from "react";
import type { HandoverNote } from "@/types";
import { cn } from "@/lib/utils";

interface HandoverCardProps {
  note:      HandoverNote;
  onDelete?: (id: string) => void;
  onEdit?:   (note: HandoverNote) => void;
}

const TRUNCATE_AT = 120; // chars before we add "show more"

export function HandoverCard({ note, onDelete, onEdit }: HandoverCardProps) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  const isTruncatable = note.content.length > TRUNCATE_AT;
  const displayText   = !expanded && isTruncatable
    ? note.content.slice(0, TRUNCATE_AT).trimEnd() + "…"
    : note.content;

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(note.id);
    setDeleting(false);
  }

  return (
    <div className="group bg-surf border border-border rounded-[10px] border-l-[3px] border-l-uac-red pl-3.5 pr-4 py-3.5">
      <h3 className="text-[12px] font-bold text-ink mb-1.5">{note.title}</h3>

      {/* Content with truncation */}
      <p className="text-[11px] text-ink3 leading-relaxed">
        {displayText}
        {isTruncatable && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 font-mono text-[9px] text-uac-green hover:underline whitespace-nowrap"
          >
            {expanded ? "show less" : "show more"}
          </button>
        )}
      </p>

      <div className={cn("mt-2.5 flex items-center gap-2 flex-wrap", confirmDel && "opacity-100")}>
        <span className="font-mono text-[9px] text-ink5">{note.updatedAt}</span>
        {note.isActive && (
          <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-uac-green-soft text-uac-green-dk">active</span>
        )}

        {/* Edit + Delete — visible on hover for admin/manager */}
        {(onEdit || onDelete) && (
          <div className={cn(
            "ml-auto flex gap-1.5 transition-opacity duration-150",
            confirmDel ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}>
            {onEdit && (
              <button
                onClick={() => { setConfirmDel(false); onEdit(note); }}
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
                  confirmDel ? "border-uac-red bg-uac-red text-white" : "border-border text-ink5 hover:border-uac-red hover:text-uac-red",
                  deleting && "opacity-50 cursor-wait",
                )}
              >
                {deleting ? "Deleting…" : confirmDel ? "Confirm?" : "🗑 Delete"}
              </button>
            )}
            {confirmDel && (
              <button onClick={() => setConfirmDel(false)} className="font-mono text-[9px] text-ink5 hover:text-ink px-1">Cancel</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
