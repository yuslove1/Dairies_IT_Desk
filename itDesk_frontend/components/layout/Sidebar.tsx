"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, UserRole } from "@/types";
import { cn } from "@/lib/utils";

// ── Nav configs per role ──────────────────────────────────────────────────────

const staffNav: NavItem[] = [
  { label: "Dashboard",      icon: "⬡", href: "/dashboard" },
  { label: "Task Board",     icon: "◫", href: "/tasks",     count: 5, countVariant: "red" },
  { label: "Daily Log",      icon: "≡", href: "/log" },
  { label: "Handover Notes", icon: "⇄", href: "/handover" },
];

const staffShareNav: NavItem[] = [
  { label: "Generate Report", icon: "↗", href: "/report/demo" },
];

const managerNav: NavItem[] = [
  { label: "Dashboard",      icon: "⬡", href: "/manager" },
  { label: "All Tasks",      icon: "◫", href: "/tasks",     count: 8, countVariant: "red" },
  { label: "Activity Logs",  icon: "≡", href: "/log" },
  { label: "Handover Notes", icon: "⇄", href: "/handover" },
];

const managerActionNav: NavItem[] = [
  { label: "Create & Assign Task", icon: "✦", href: "/manager/create-task" },
];

interface SidebarProps {
  role: UserRole;
  onClose?: () => void; // called by mobile close button
}

// ── Single nav link ───────────────────────────────────────────────────────────
function NavLink({ item, active, onClose }: { item: NavItem; active: boolean; onClose?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClose} // close drawer on mobile when navigating
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-100 mb-0.5",
        active
          ? "bg-uac-green-soft text-uac-green-dk font-semibold"
          : "text-ink3 hover:bg-paper hover:text-ink",
      )}
    >
      <span className={cn("text-[13px] w-4 text-center shrink-0", active ? "text-uac-green" : "text-ink5")}>
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.count !== undefined && (
        <span
          className={cn(
            "font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
            item.countVariant === "green"
              ? "bg-uac-green-soft text-uac-green-dk"
              : "bg-uac-red-soft text-uac-red",
          )}
        >
          {item.count}
        </span>
      )}
    </Link>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname();

  const primaryNav    = role === "manager" ? managerNav       : staffNav;
  const secondaryNav  = role === "manager" ? managerActionNav : staffShareNav;
  const primaryLabel  = role === "manager" ? "Overview"       : "Main";
  const secondaryLabel = role === "manager" ? "Actions"       : "Share";

  return (
    <aside className="bg-surf border-r border-border overflow-y-auto flex flex-col py-4 h-full w-[212px]">
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end px-3 mb-2">
        <button
          onClick={onClose}
          className="text-ink4 hover:text-ink p-1 rounded hover:bg-paper transition-colors text-lg leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Primary nav */}
      <div className="px-2.5 mb-1">
        <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-ink6 px-2 pb-1">
          {primaryLabel}
        </div>
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} onClose={onClose} />
        ))}
      </div>

      <div className="h-px bg-border mx-2.5 my-2" />

      {/* Secondary nav */}
      <div className="px-2.5 mb-1">
        <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-ink6 px-2 pb-1">
          {secondaryLabel}
        </div>
        {secondaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} onClose={onClose} />
        ))}
      </div>

      {/* Push sign-out to bottom */}
      <div className="flex-1" />

      <div className="px-2.5">
        <div className="h-px bg-border mb-2" />
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium text-uac-red hover:bg-uac-red-soft transition-colors"
        >
          <span className="w-4 text-center">←</span> Sign out
        </Link>
      </div>
    </aside>
  );
}
