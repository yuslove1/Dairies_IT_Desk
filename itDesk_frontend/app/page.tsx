import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in — IT Desk" };

const features = [
  "Daily activity log",
  "Kanban task board with assignments",
  "Manager create & assign tasks",
  "Handover notes for the next IT person",
  "Shareable WhatsApp report link",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 md:p-9">
      <div className="w-full max-w-4xl">
        {/* Card — single col on mobile, 2 cols on sm+ */}
        <div className="rounded-[14px] overflow-hidden border border-border shadow-[0_4px_20px_rgba(17,19,24,0.10)] animate-fade-up flex flex-col sm:grid sm:[grid-template-columns:1fr_1fr] sm:h-[560px]">

          {/* ── Left panel — brand (hidden on mobile) ── */}
          <div className="bg-uac-red-deep relative p-8 sm:p-11 flex flex-col justify-between overflow-hidden">
            {/* Watermark */}
            <span className="absolute -bottom-7 -right-3 font-mono font-bold text-white/[0.025] text-[110px] leading-none tracking-tight pointer-events-none select-none hidden sm:block">
              IT DESK
            </span>

            {/* Logo + tagline */}
            <div>
              <div className="font-mono text-base font-bold text-white tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-uac-green" />
                IT DESK
              </div>
              <p className="text-[22px] font-light text-white leading-snug tracking-tight mt-6 sm:mt-7">
                Your IT work,<br />
                <strong className="font-bold">tracked &amp; handed over.</strong>
              </p>
              <p className="font-mono text-[10px] text-white/25 mt-2">
                // UAC Foods Dairies Plant · IT Dept
              </p>
            </div>

            {/* Feature list — hidden on very small screens */}
            <ul className="hidden sm:flex flex-col gap-1.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[11px] text-white/40">
                  <div className="w-1 h-1 rounded-full bg-uac-green shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Green bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-uac-green" />
          </div>

          {/* ── Right panel — form ── */}
          <div className="bg-surf px-6 sm:px-10 py-8 sm:py-0 flex flex-col justify-center">
            <h1 className="text-[20px] font-bold text-ink tracking-tight mb-1">Sign in</h1>
            <p className="text-[12px] text-ink4 mb-6 sm:mb-7">Enter your IT department credentials to continue</p>

            {/* Email */}
            <div className="mb-3">
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">
                Email address
              </label>
              <input
                className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 font-mono text-[11px] text-ink outline-none focus:border-uac-green transition-colors"
                defaultValue="itusers@uacfoodsng.com"
                type="email"
              />
            </div>

            {/* Password */}
            <div className="mb-4 sm:mb-5">
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">
                Password
              </label>
              <input
                className="w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors"
                type="password"
                defaultValue="password"
              />
            </div>

            {/* Sign in */}
            <Link
              href="/dashboard"
              className="w-full bg-uac-red hover:bg-uac-red-dark text-white font-mono text-[11px] font-semibold uppercase tracking-wide py-2.5 rounded-[6px] text-center transition-colors"
            >
              Sign in →
            </Link>

            {/* UAC colour strip */}
            <div className="flex h-[3px] rounded overflow-hidden mt-4">
              <div className="flex-1 bg-uac-red" />
              <div className="flex-1 bg-white border-y border-border" />
              <div className="flex-1 bg-uac-green" />
            </div>

            <p className="font-mono text-[9px] text-ink6 text-center mt-4">
              UAC Foods Dairies Plant · IT Desk v1.0 · Confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
