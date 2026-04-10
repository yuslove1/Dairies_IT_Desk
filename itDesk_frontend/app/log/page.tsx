"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LogEntryCard } from "@/components/ui/LogEntryCard";
import { Button } from "@/components/ui/Button";
import { currentUser } from "@/lib/data/staff";
import { todayLogs } from "@/lib/data/logs";
import type { LogEntry, LogCategory } from "@/types";

const categories: LogCategory[] = ["routine", "hardware", "network", "software", "setup"];

export default function LogPage() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LogCategory>("routine");
  const [entries, setEntries] = useState<LogEntry[]>(todayLogs);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    const newEntry: LogEntry = {
      id: `l-${Date.now()}`,
      time: new Date().toTimeString().slice(0, 5),
      description: description.trim(),
      category,
      date: new Date().toISOString().split("T")[0],
    };
    setEntries((prev) => [newEntry, ...prev]);
    setDescription("");
  }

  return (
    <AppShell user={currentUser} subtitle="Daily Log">
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">Daily Log</h1>
      <p className="font-mono text-[10px] text-ink5 mb-4 sm:mb-5">
        // Tuesday, 31 March 2026 · {entries.length} entries logged today
      </p>

      {/* Two-col — stacks on mobile */}
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

          {/* Time + Category inline */}
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

          <div className="flex gap-2 flex-wrap">
            <Button type="submit" variant="green">Log entry →</Button>
            <Button type="button" variant="ghost" onClick={() => setDescription("")}>Clear</Button>
          </div>
        </form>

        {/* ── Today's entries ── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink">Today&apos;s entries</h2>
            <span className="font-mono text-[9px] text-ink5">{entries.length} entries</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
