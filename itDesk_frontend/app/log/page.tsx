"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LogEntryCard } from "@/components/ui/LogEntryCard";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { api } from "@/lib/api";
import type { LogEntry, LogCategory } from "@/types";

const categories: LogCategory[] = ["routine", "hardware", "network", "software", "setup"];

function mapLog(r: any): LogEntry {
  return {
    id: r.id,
    time: r.logDate
      ? new Date(r.logDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "--:--",
    description: r.content,
    category: r.category ?? "routine",
    date: r.logDate ? r.logDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

export default function LogPage() {
  const user = useCurrentUser();

  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState<LogCategory>("routine");
  const [entries,     setEntries]     = useState<LogEntry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager";

  // Load today's logs on mount
  useEffect(() => {
    api.get<{ logs: any[] }>("/logs")
      .then((res) => setEntries(res.logs.map(mapLog)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<{ log: any }>("/logs", {
        content: description.trim(),
        category,
      });
      // Prepend the new entry to the list
      setEntries((prev) => [mapLog(res.log), ...prev]);
      setDescription("");
    } catch (err: any) {
      setError(err.message ?? "Failed to save log entry");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete a log entry (admin/manager only) ────────────────────────────────
  async function handleDeleteLog(id: string) {
    try {
      await api.delete(`/logs/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error("Delete log failed:", err);
    }
  }

  // ── Edit a log entry (admin/manager only) ─────────────────────────────────
  async function handleEditLog(id: string, content: string, category: LogCategory) {
    try {
      const res = await api.patch<{ log: any }>(`/logs/${id}`, { content, category });
      setEntries((prev) =>
        prev.map((e) => e.id === id ? mapLog(res.log) : e),
      );
    } catch (err: any) {
      console.error("Edit log failed:", err);
      throw err; // re-throw so the card can show the error state
    }
  }

  return (
    <AppShell user={user} subtitle="Daily Log">
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">Daily Log</h1>
      <p className="font-mono text-[10px] text-ink5 mb-4 sm:mb-5">
        // {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {entries.length} entries logged today
        {canManage && <span className="ml-2 text-uac-green">· hover an entry to edit or delete</span>}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ── New entry form ── */}
        <form onSubmit={handleSubmit} className="bg-surf border border-border rounded-[10px] p-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4 mb-3">
            New log entry
          </p>

          <div className="mb-3">
            <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">
              Activity description
            </label>
            <textarea
              className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors resize-none min-h-[60px]"
              placeholder="What did you do? Be specific..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Time</label>
              <input
                className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 font-mono text-[11px] text-ink outline-none"
                value={new Date().toTimeString().slice(0, 5)}
                readOnly
              />
            </div>
            <div>
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Category</label>
              <select
                className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value as LogCategory)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="font-mono text-[10px] text-uac-red mb-2 bg-uac-red-soft px-2 py-1 rounded">
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button type="submit" variant="green" disabled={saving}>
              {saving ? "Saving…" : "Log entry →"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDescription("")}>Clear</Button>
          </div>
        </form>

        {/* ── Today's entries ── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink">Today&apos;s entries</h2>
            <span className="font-mono text-[9px] text-ink5">{entries.length} entries</span>
          </div>
          {loading ? (
            <p className="font-mono text-[10px] text-ink5">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="font-mono text-[10px] text-ink5">No entries yet today — log your first activity!</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {entries.map((entry) => (
                <LogEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={canManage ? handleDeleteLog : undefined}
                  onEdit={canManage ? handleEditLog : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
