import type { HandoverNote } from "@/types";

interface HandoverCardProps {
  note: HandoverNote;
}

/** Handover note card with red left accent stripe. */
export function HandoverCard({ note }: HandoverCardProps) {
  return (
    <div className="bg-surf border border-border rounded-[10px] border-l-[3px] border-l-uac-red pl-3.5 pr-4 py-3.5">
      <h3 className="text-[12px] font-bold text-ink mb-1.5">{note.title}</h3>
      <p className="text-[11px] text-ink3 leading-relaxed">{note.content}</p>
      <div className="mt-2.5 flex items-center gap-2">
        <span className="font-mono text-[9px] text-ink5">{note.updatedAt}</span>
        {note.isActive && (
          <span className="ml-auto font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-uac-green-soft text-uac-green-dk">
            active
          </span>
        )}
      </div>
    </div>
  );
}
