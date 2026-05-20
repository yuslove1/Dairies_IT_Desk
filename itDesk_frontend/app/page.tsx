"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { saveSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const features = [
  "Daily activity log",
  "Kanban task board with assignments",
  "Manager create & assign tasks",
  "Handover notes for the next IT person",
  "Shareable WhatsApp report link",
  "Asset register",
];

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }
        setError(data.error || "Login failed");
        return;
      }

      saveSession(data.token, data.user);
      router.push(data.user.role === "manager" ? "/manager" : "/dashboard");
    } catch {
      setError("Could not connect to the server. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-paper flex flex-col sm:flex-row overflow-hidden">

      {/* ── Left panel — brand ── */}
      <div className="bg-uac-red-deep relative flex flex-col justify-between p-8 sm:p-12 shrink-0 w-full sm:w-[400px] lg:w-[460px] overflow-hidden">
        {/* Watermark */}
        <span className="absolute -bottom-6 -right-4 font-mono font-bold text-white/[0.035] text-[120px] leading-none tracking-tight pointer-events-none select-none hidden sm:block">
          IT DESK
        </span>
        {/* Dot grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />

        <div>
          <div className="font-mono text-base font-bold text-white tracking-wide flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-uac-green" />
            IT DESK
          </div>
          <p className="text-[26px] sm:text-[30px] font-light text-white leading-snug tracking-tight mt-8">
            Your IT work,<br />
            <strong className="font-bold">tracked &amp; handed over.</strong>
          </p>
          <p className="font-mono text-[10px] text-white/25 mt-3">
            // UAC Foods Dairies Plant · IT Dept
          </p>
        </div>

        <ul className="hidden sm:flex flex-col gap-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-[11px] text-white/40">
              <div className="w-1 h-1 rounded-full bg-uac-green shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-uac-green" />
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 bg-surf flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-[24px] font-bold text-ink tracking-tight mb-1">Sign in</h1>
          <p className="text-[12px] text-ink4 mb-7">Enter your IT department credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-paper border border-border rounded-[6px] px-3 py-2 font-mono text-[12px] text-ink outline-none focus:border-uac-green transition-colors"
                placeholder="itusers@uacfoodsng.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-paper border border-border rounded-[6px] px-3 py-2 pr-9 text-[12px] text-ink outline-none focus:border-uac-green transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink4 hover:text-ink transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="font-mono text-[10px] text-uac-red bg-uac-red-soft px-2.5 py-1.5 rounded-[6px]">
                ⚠ {error}
              </p>
            )}

            {justRegistered && (
              <p className="font-mono text-[10px] text-uac-green bg-uac-green-soft px-2.5 py-1.5 rounded-[6px] text-center">
                ✓ Account created — please sign in
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full text-white font-mono text-[11px] font-semibold uppercase tracking-wide py-2.5 rounded-[6px] transition-colors",
                loading ? "bg-ink5 cursor-not-allowed" : "bg-uac-red hover:bg-uac-red-dark",
              )}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="font-mono text-[9px] text-ink5 text-center mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-uac-green hover:underline font-semibold">Sign up →</Link>
          </p>

          <div className="flex h-[3px] rounded overflow-hidden mt-6">
            <div className="flex-1 bg-uac-red" />
            <div className="flex-1 bg-white border-y border-border" />
            <div className="flex-1 bg-uac-green" />
          </div>
          <p className="font-mono text-[9px] text-ink6 text-center mt-3">
            UAC Foods Dairies Plant · IT Desk v1.0 · Confidential
          </p>
        </div>
      </div>

    </div>
  );
}
