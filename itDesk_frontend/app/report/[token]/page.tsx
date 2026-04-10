import type { Metadata } from "next";
import { reportSnapshot } from "@/lib/data/report";

export const metadata: Metadata = { title: "IT Desk — Daily Snapshot" };

const labelColor: Record<string, string> = {
  HIGH: "text-uac-red",
  OPEN: "text-amber",
  WIP:  "text-amber",
};

/** Public shareable snapshot — no login, no AppShell. Fully responsive. */
export default function ReportPage() {
  const snap = reportSnapshot;

  return (
    <div className="bg-surf border border-border rounded-[14px] overflow-hidden shadow-[0_4px_20px_rgba(17,19,24,0.10)] animate-fade-up">
      {/* ── Header ── */}
      <div className="bg-uac-red-deep border-b-2 border-uac-green px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 sm:gap-4">
        <div>
          <div className="font-mono text-[14px] font-bold text-white flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-uac-green" />
            IT DESK
          </div>
          <p className="font-mono text-[10px] text-white/35 mt-0.5">UAC Foods Dairies Plant · Daily Snapshot</p>
        </div>

        {/* Meta — wraps on mobile */}
        <div className="hidden sm:block">
          <p className="font-mono text-[9px] text-white/25 mb-0.5">Generated</p>
          <p className="font-mono text-[10px] text-white/50">{snap.generatedAt}</p>
        </div>
        <div className="hidden sm:block">
          <p className="font-mono text-[9px] text-white/25 mb-0.5">By</p>
          <p className="font-mono text-[10px] text-white/50">{snap.generatedBy.name} (IT Staff)</p>
        </div>

        <span className="ml-auto font-mono text-[9px] px-2 py-1 rounded bg-uac-green/25 text-uac-green-mid border border-uac-green/40 shrink-0">
          ⏱ Expires in {snap.expiresIn}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-4 sm:p-6">
        {/* Stats — 3 cols always (compact on mobile) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5 sm:mb-6">
          {[
            { n: snap.stats.todo, label: "Open / Todo",  color: "text-ink4" },
            { n: snap.stats.wip,  label: "In Progress",  color: "text-amber" },
            { n: snap.stats.done, label: "Done Today",   color: "text-uac-green" },
          ].map(({ n, label, color }) => (
            <div key={label} className="bg-paper border border-border rounded-[10px] p-2.5 sm:p-3.5 text-center">
              <div className={`text-[24px] sm:text-[30px] font-bold tracking-tight leading-none ${color}`}>{n}</div>
              <div className="font-mono text-[8px] sm:text-[9px] text-ink5 mt-1 uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Two-col — stacks on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-5">
          {/* Activity log */}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink5 mb-2.5">
              Today&apos;s activity log
            </p>
            <div className="divide-y divide-border">
              {snap.logs.map((log) => (
                <div key={log.id} className="py-1.5 flex gap-2.5 text-[11px] text-ink2 leading-relaxed">
                  <span className="font-mono text-[9px] text-ink5 min-w-[38px] pt-0.5 shrink-0">{log.time}</span>
                  <span>{log.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open tasks */}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink5 mb-2.5">
              Open tasks needing attention
            </p>
            <div className="divide-y divide-border">
              {snap.openTasks.map((t, i) => (
                <div key={i} className="py-1.5 flex gap-2.5 text-[11px] text-ink2 leading-relaxed">
                  <span className={`font-mono text-[9px] min-w-[38px] pt-0.5 font-semibold shrink-0 ${labelColor[t.label] ?? "text-ink5"}`}>
                    {t.label}
                  </span>
                  <span>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Handover notes */}
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink5 mb-2.5">
            Active handover notes
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {snap.handoverNotes.map((note) => (
              <div key={note.id} className="bg-paper border border-border rounded-[6px] px-3 py-2.5">
                <p className="text-[11px] font-bold text-ink mb-1">{note.title}</p>
                <p className="text-[10px] text-ink3 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Share bar ── */}
      <div className="px-4 sm:px-6 pb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 bg-paper border border-border rounded-[6px] px-2.5 py-1.5 font-mono text-[10px] text-uac-green-dk flex items-center gap-2 min-w-0">
          <span className="truncate">itdesk.app/report/{snap.token}</span>
          <button className="ml-auto shrink-0 font-mono text-[9px] px-2 py-0.5 rounded bg-uac-green-soft text-uac-green-dk border border-uac-green-mid hover:bg-uac-green-mid/40">
            Copy
          </button>
        </div>
        <button className="bg-uac-green hover:bg-uac-green-dk text-white font-mono text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-[6px] transition-colors shrink-0">
          Send to WhatsApp ↗
        </button>
        <button className="bg-transparent border border-border text-ink3 font-mono text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-[6px] hover:border-ink4 hover:text-ink transition-colors shrink-0">
          Download PDF
        </button>
      </div>
    </div>
  );
}
