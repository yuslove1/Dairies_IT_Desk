"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { api } from "@/lib/api";

export default function GenerateReportPage() {
  const user   = useCurrentUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ token: string; url: string }>("/reports", {});
      // Navigate to the public snapshot page
      router.push(`/report/${res.token}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to generate report");
      setLoading(false);
    }
  }

  return (
    <AppShell user={user} subtitle="Generate Report">
      <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink mb-0.5">
        Generate Snapshot Report
      </h1>
      <p className="font-mono text-[10px] text-ink5 mb-5">
        // Creates a shareable link — valid for 24 hours · send to manager via WhatsApp
      </p>

      {/* Info card */}
      <div className="bg-surf border border-border rounded-[10px] p-5 max-w-lg mb-4 animate-fade-up">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4 mb-3">
          What&apos;s included
        </p>
        <ul className="space-y-2">
          {[
            { icon: "📋", text: "All open, in-progress and completed tasks" },
            { icon: "📝", text: "Today's full activity log" },
            { icon: "⇄",  text: "All active handover notes" },
            { icon: "🔗", text: "A unique shareable link — no login required to view" },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-[12px] text-ink2">
              <span className="mt-0.5 shrink-0">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="h-px bg-border my-4" />

        <p className="font-mono text-[9px] text-ink5 mb-3">
          ⚠ Link expires after 24 hours. Generate a new one each day.
        </p>

        {error && (
          <p className="font-mono text-[10px] text-uac-red bg-uac-red-soft px-2.5 py-1.5 rounded-[6px] mb-3">
            ⚠ {error}
          </p>
        )}

        <Button
          variant="green"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Generating…" : "Generate & open report →"}
        </Button>
      </div>
    </AppShell>
  );
}
