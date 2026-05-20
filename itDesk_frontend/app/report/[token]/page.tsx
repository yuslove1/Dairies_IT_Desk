"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

// ── Types matching the snapshot stored in the DB ──────────────────────────────
interface SnapLog    { id: string; time?: string; description?: string; content?: string; category?: string; logDate?: string }
interface SnapTask   { id: string; title: string; priority: string; status: string }
interface SnapNote   { id: string; title: string; content: string }
interface Snapshot {
  generatedAt:   string;
  generatedBy:   { name: string; role: string };
  stats:         { todo: number; wip: number; done: number };
  logs:          SnapLog[];
  openTasks:     SnapTask[];
  handoverNotes: SnapNote[];
}

// Priority label → colour
const priorityColor: Record<string, string> = {
  high: "text-uac-red",
  med:  "text-amber",
  low:  "text-ink4",
};
const priorityLabel: Record<string, string> = {
  high: "HIGH", med: "MED", low: "LOW",
};

// ── Public snapshot page ───────────────────────────────────────────────────────
export default function ReportPage() {
  const params = useParams();
  const token  = params?.token as string;

  const [snapshot,  setSnapshot]  = useState<Snapshot | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status,    setStatus]    = useState<"loading" | "ok" | "expired" | "notfound" | "error">("loading");
  const [copied,    setCopied]    = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    if (!token) return;

    const url = API_URL ? `${API_URL}/api/reports/${token}` : `/api/reports/${token}`;

    fetch(url)
      .then(async (res) => {
        if (res.status === 410) { setStatus("expired"); return; }
        if (res.status === 404) { setStatus("notfound"); return; }
        if (!res.ok)            { setStatus("error");   return; }
        const data = await res.json();
        setSnapshot(data.snapshot);
        setExpiresAt(data.expiresAt);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [token, API_URL]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function sendWhatsApp() {
    const text = encodeURIComponent(`IT Desk Daily Snapshot: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  // ── States ──────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <p className="font-mono text-[11px] text-ink5">Loading report…</p>
      </div>
    );
  }
  if (status === "expired") return <StatusPage icon="⏱" title="Report Expired" sub="This snapshot has expired. Ask the IT team to generate a new one." />;
  if (status === "notfound") return <StatusPage icon="🔍" title="Report Not Found" sub="This link is invalid or was never created." />;
  if (status === "error")    return <StatusPage icon="⚠" title="Something went wrong" sub="Could not load the report. Please try again." />;
  if (!snapshot) return null;

  const snap = snapshot;
  const reportUrl = typeof window !== "undefined" ? window.location.href : "";

  const expiresLabel = expiresAt
    ? `Expires ${new Date(expiresAt).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}`
    : "24h link";

  return (
    <div className="p-3 sm:p-5 lg:p-9 max-w-5xl mx-auto animate-fade-up">
      <div className="bg-surf border border-border rounded-[14px] overflow-hidden shadow-[0_4px_20px_rgba(17,19,24,0.10)]">

        {/* ── Header ── */}
        <div className="bg-uac-red-deep border-b-2 border-uac-green px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <div className="font-mono text-[14px] font-bold text-white flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-uac-green" />
              IT DESK
            </div>
            <p className="font-mono text-[10px] text-white/35 mt-0.5">UAC Foods Dairies Plant · Daily Snapshot</p>
          </div>

          <div className="hidden sm:block">
            <p className="font-mono text-[9px] text-white/25 mb-0.5">Generated</p>
            <p className="font-mono text-[10px] text-white/50">
              {new Date(snap.generatedAt).toLocaleString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="font-mono text-[9px] text-white/25 mb-0.5">By</p>
            <p className="font-mono text-[10px] text-white/50">{snap.generatedBy?.name ?? "IT Staff"}</p>
          </div>

          <span className="ml-auto font-mono text-[9px] px-2 py-1 rounded bg-uac-green/25 text-uac-green-mid border border-uac-green/40 shrink-0">
            ⏱ {expiresLabel}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="p-4 sm:p-6">
          {/* Stats */}
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

          {/* Two-col */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-5">
            {/* Activity log */}
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink5 mb-2.5">
                Today&apos;s activity log
              </p>
              {snap.logs.length === 0 ? (
                <p className="font-mono text-[10px] text-ink5">No log entries for today.</p>
              ) : (
                <div className="divide-y divide-border">
                  {snap.logs.map((log) => {
                    const time = log.time ?? (log.logDate
                      ? new Date(log.logDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                      : "--:--");
                    const desc = log.description ?? log.content ?? "";
                    return (
                      <div key={log.id} className="py-1.5 flex gap-2.5 text-[11px] text-ink2 leading-relaxed">
                        <span className="font-mono text-[9px] text-ink5 min-w-[38px] pt-0.5 shrink-0">{time}</span>
                        <span>{desc}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Open tasks */}
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink5 mb-2.5">
                Open tasks needing attention
              </p>
              {snap.openTasks.length === 0 ? (
                <p className="font-mono text-[10px] text-ink5">No open tasks — all clear ✓</p>
              ) : (
                <div className="divide-y divide-border">
                  {snap.openTasks.map((t) => (
                    <div key={t.id} className="py-1.5 flex gap-2.5 text-[11px] text-ink2 leading-relaxed">
                      <span className={`font-mono text-[9px] min-w-[38px] pt-0.5 font-semibold shrink-0 ${priorityColor[t.priority] ?? "text-ink5"}`}>
                        {priorityLabel[t.priority] ?? t.priority.toUpperCase()}
                      </span>
                      <span>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Handover notes */}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink5 mb-2.5">
              Active handover notes
            </p>
            {snap.handoverNotes.length === 0 ? (
              <p className="font-mono text-[10px] text-ink5">No active handover notes.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {snap.handoverNotes.map((note) => (
                  <div key={note.id} className="bg-paper border border-border rounded-[6px] px-3 py-2.5">
                    <p className="text-[11px] font-bold text-ink mb-1">{note.title}</p>
                    <p className="text-[10px] text-ink3 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Share bar ── */}
        <div className="px-4 sm:px-6 pb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 bg-paper border border-border rounded-[6px] px-2.5 py-1.5 font-mono text-[10px] text-uac-green-dk flex items-center gap-2 min-w-0">
            <span className="truncate">{reportUrl}</span>
            <button
              onClick={copyLink}
              className="ml-auto shrink-0 font-mono text-[9px] px-2 py-0.5 rounded bg-uac-green-soft text-uac-green-dk border border-uac-green-mid hover:bg-uac-green-mid/40 transition-colors"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <button
            onClick={sendWhatsApp}
            className="bg-uac-green hover:bg-uac-green-dk text-white font-mono text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-[6px] transition-colors shrink-0"
          >
            Send to WhatsApp ↗
          </button>
          <button
            onClick={() => window.print()}
            className="bg-transparent border border-border text-ink3 font-mono text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-[6px] hover:border-ink4 hover:text-ink transition-colors shrink-0"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Error / status screen ────────────────────────────────────────────────────
function StatusPage({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-paper p-6">
      <div className="text-center max-w-sm">
        <span className="text-4xl block mb-3">{icon}</span>
        <h1 className="text-[16px] font-bold text-ink mb-1">{title}</h1>
        <p className="font-mono text-[10px] text-ink5">{sub}</p>
      </div>
    </div>
  );
}
