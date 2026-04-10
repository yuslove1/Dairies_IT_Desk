import type { User } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

interface TopbarProps {
  user: User;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuToggle?: () => void; // triggers mobile sidebar drawer
}

/** App topbar — deep red with green underline.
 *  Shows hamburger on mobile, logo + user info always. */
export function Topbar({ user, subtitle, actions, onMenuToggle }: TopbarProps) {
  return (
    <header className="bg-uac-red-deep border-b-2 border-uac-green flex items-center px-3 md:px-4 gap-2 h-[52px] shrink-0">
      {/* Hamburger — only visible on mobile */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <line x1="1" y1="4"  x2="15" y2="4" />
          <line x1="1" y1="8"  x2="15" y2="8" />
          <line x1="1" y1="12" x2="15" y2="12" />
        </svg>
      </button>

      {/* Logo */}
      <div className="font-mono text-[13px] font-semibold text-white tracking-wide flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-uac-green" />
        <span>IT DESK</span>
      </div>

      {/* Subtitle — hidden on very small screens */}
      {subtitle && (
        <>
          <div className="hidden sm:block w-px h-[18px] bg-white/10" />
          <span className="hidden sm:block font-mono text-[10px] text-white/30 tracking-wide truncate">
            {subtitle}
          </span>
        </>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <Badge role={user.role} />
        <Avatar initials={user.initials} role={user.role} size="md" />
      </div>
    </header>
  );
}
