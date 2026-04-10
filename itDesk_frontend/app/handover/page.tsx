import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { HandoverCard } from "@/components/ui/HandoverCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { currentUser } from "@/lib/data/staff";
import { handoverNotes } from "@/lib/data/handover";

export const metadata: Metadata = { title: "Handover Notes — IT Desk" };

export default function HandoverPage() {
  return (
    <AppShell user={currentUser} subtitle="Handover Notes">
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">Handover Notes</h1>
      <p className="font-mono text-[10px] text-ink5 mb-4">
        // Context for the next IT person · {handoverNotes.length} active notes
      </p>

      <Alert variant="amber">
        ⚠&nbsp; 1 month left in service — ensure all handover notes are complete before departure.
      </Alert>

      {/* Two-col — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        {/* Active notes grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-bold text-ink">Active notes</h2>
            <Button variant="soft-green" size="sm">+ Add note</Button>
          </div>
          {/* Notes — 1 col mobile, 2 col sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {handoverNotes.map((note) => (
              <HandoverCard key={note.id} note={note} />
            ))}
          </div>
        </div>

        {/* New note form */}
        <div className="bg-surf border border-border rounded-[10px] p-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4 mb-3">
            New handover note
          </p>
          <div className="mb-3">
            <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Title</label>
            <input
              className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors"
              placeholder="e.g. UPS maintenance schedule"
            />
          </div>
          <div className="mb-4">
            <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">Content</label>
            <textarea
              className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors resize-none min-h-[90px]"
              placeholder="What does the next person need to know?"
            />
          </div>
          <Button variant="green">Save note →</Button>
        </div>
      </div>
    </AppShell>
  );
}
