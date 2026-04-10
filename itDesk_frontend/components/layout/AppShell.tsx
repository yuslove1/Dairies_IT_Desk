"use client";

import { useState } from "react";
import type { User } from "@/types";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: User;
  subtitle?: string;
  topbarActions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Main app shell — responsive.
 * Desktop: sidebar grid + main area (card layout).
 * Mobile: topbar + collapsible drawer sidebar + full-width main.
 */
export function AppShell({ user, subtitle, topbarActions, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col rounded-[14px] overflow-hidden border border-border shadow-[0_4px_20px_rgba(17,19,24,0.10)] min-h-[580px]">
      {/* Topbar — full width */}
      <Topbar
        user={user}
        subtitle={subtitle}
        actions={topbarActions}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Shell body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop — closes sidebar on click */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — drawer on mobile, fixed column on desktop */}
        <div
          className={cn(
            "shrink-0 w-[212px] z-30",
            "absolute inset-y-0 left-0 transition-transform duration-200 ease-in-out",
            "lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <Sidebar role={user.role} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 bg-paper overflow-y-auto px-4 py-4 md:px-6 md:py-5 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
