"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { NavItem, UserRole, User } from "@/types";
import { clearSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// ── Static nav structure (counts are injected dynamically below) ────────────
const staffNavBase: NavItem[] = [
  { label: "Dashboard", icon: "⬡", href: "/dashboard" },
  { label: "Task Board", icon: "◫", href: "/tasks" },
  { label: "Daily Log", icon: "≡", href: "/log" },
  { label: "Handover Notes", icon: "⇄", href: "/handover" },
  { label: "Asset Register", icon: "◈", href: "/assets" },
];
const staffShareNav: NavItem[] = [
  { label: "Generate Report", icon: "↗", href: "/report" },
];
const managerNavBase: NavItem[] = [
  { label: "Dashboard", icon: "⬡", href: "/manager" },
  { label: "All Tasks", icon: "◫", href: "/tasks" },
  { label: "Activity Logs", icon: "≡", href: "/log" },
  { label: "Handover Notes", icon: "⇄", href: "/handover" },
  { label: "Asset Register", icon: "◈", href: "/assets" },
];
const managerActionNav: NavItem[] = [
  { label: "Create & Assign Task", icon: "✦", href: "/manager/create-task" },
];

interface SidebarProps {
  role: UserRole;
  user: User | null;   // passed from AppShell so we can show the profile
  onClose?: () => void;
}

// ── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ item, active, onClose }: { item: NavItem; active: boolean; onClose?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
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
      {item.count !== undefined && item.count > 0 && (
        <span
          className={cn(
            "font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
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

// ── Role chip ────────────────────────────────────────────────────────────────
const roleLabel: Record<UserRole, string> = {
  staff: "IT Staff",
  manager: "Manager",
  admin: "Admin",
};
const roleColor: Record<UserRole, string> = {
  staff: "bg-blue-soft text-blue",
  manager: "bg-purple-soft text-purple",
  admin: "bg-uac-red-soft text-uac-red",
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({ role, user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Live open task count fetched from the API
  const [openCount, setOpenCount] = useState<number | null>(null);

  useEffect(() => {
    api.get<{ tasks: { status: string }[] }>("/tasks")
      .then((res) => {
        const n = res.tasks.filter((t) => t.status !== "done").length;
        setOpenCount(n);
      })
      .catch(() => setOpenCount(null));
  }, []);

  // Inject the live count into the task nav item
  const staffNav = staffNavBase.map((item) =>
    item.href === "/tasks" && openCount !== null
      ? { ...item, count: openCount, countVariant: "red" as const }
      : item,
  );
  const managerNav = managerNavBase.map((item) =>
    item.href === "/tasks" && openCount !== null
      ? { ...item, count: openCount, countVariant: "red" as const }
      : item,
  );

  const primaryNav = role === "manager" ? managerNav : staffNav;
  const secondaryNav = role === "manager" ? managerActionNav : staffShareNav;
  const primaryLabel = role === "manager" ? "Overview" : "Main";
  const secondaryLabel = role === "manager" ? "Actions" : "Share";

  function handleSignOut() {
    clearSession();
    router.push("/");
  }

  return (
    <aside className="bg-surf border-r border-border flex flex-col h-full w-[212px] overflow-y-auto">
      {/* Mobile close */}
      <div className="lg:hidden flex justify-end px-3 pt-3">
        <button
          onClick={onClose}
          className="text-ink4 hover:text-ink p-1 rounded hover:bg-paper transition-colors text-lg leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Primary nav */}
      <div className="px-2.5 pt-4 mb-1">
        <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-ink6 px-2 pb-1.5">
          {primaryLabel}
        </div>
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} onClose={onClose} />
        ))}
      </div>

      <div className="h-px bg-border mx-2.5 my-2" />

      {/* Secondary nav */}
      <div className="px-2.5 mb-1">
        <div className="font-mono text-[9px] font-semibold uppercase tracking-wider text-ink6 px-2 pb-1.5">
          {secondaryLabel}
        </div>
        {secondaryNav.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} onClose={onClose} />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── User profile card ── */}
      <div className="px-2.5 pb-3">
        <div className="h-px bg-border mb-2.5" />

        {user ? (
          <div className="bg-paper rounded-[8px] px-2.5 py-2 border border-border">
            {/* Avatar + name row */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-uac-green flex items-center justify-center text-white font-mono font-bold text-[10px] shrink-0">
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-ink truncate leading-tight">{user.name}</p>
                <p className="font-mono text-[9px] text-ink5 truncate">{user.email ?? user.department}</p>
              </div>
            </div>

            {/* Role chip */}
            <div className="flex items-center justify-between">
              <span className={cn("font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full", roleColor[user.role])}>
                {roleLabel[user.role]}
              </span>
              <button
                onClick={handleSignOut}
                className="font-mono text-[9px] text-uac-red hover:text-uac-red-dark flex items-center gap-1 transition-colors"
              >
                ← Sign out
              </button>
            </div>
          </div>
        ) : (
          /* Skeleton while user loads */
          <div className="bg-paper rounded-[8px] px-2.5 py-2 border border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-2 rounded w-3/4" />
                <div className="skeleton h-1.5 rounded w-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
