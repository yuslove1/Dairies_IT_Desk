"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [role,         setRole]         = useState<"staff" | "manager">("staff");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const inputCls = "w-full bg-paper border border-border rounded-[6px] px-3 py-2 font-mono text-[12px] text-ink outline-none focus:border-uac-green transition-colors";
  const labelCls = "font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-paper flex flex-col sm:flex-row overflow-hidden">

      {/* Left panel */}
      <div className="bg-uac-red-deep relative flex flex-col justify-between p-8 sm:p-12 shrink-0 w-full sm:w-[400px] lg:w-[460px] overflow-hidden">
        <span className="absolute -bottom-6 -right-4 font-mono font-bold text-white/[0.035] text-[120px] leading-none tracking-tight pointer-events-none select-none hidden sm:block">IT DESK</span>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
        <div>
          <div className="font-mono text-base font-bold text-white tracking-wide flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-uac-green" /> IT DESK
          </div>
          <p className="text-[26px] sm:text-[30px] font-light text-white leading-snug tracking-tight mt-8">
            Create your<br /><strong className="font-bold">IT Desk account.</strong>
          </p>
          <p className="font-mono text-[10px] text-white/25 mt-3">// UAC Foods Dairies Plant · IT Dept</p>
        </div>
        <ul className="hidden sm:flex flex-col gap-2">
          {["Daily activity log","Kanban task board","Manager assign tasks","Handover notes","Shareable reports","Asset register"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[11px] text-white/40">
              <div className="w-1 h-1 rounded-full bg-uac-green shrink-0" />{f}
            </li>
          ))}
        </ul>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-uac-green" />
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-surf flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-[24px] font-bold text-ink tracking-tight mb-1">Create account</h1>
          <p className="text-[12px] text-ink4 mb-6">Join the IT Desk · fill in your details below</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={labelCls}>Full name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className={inputCls} placeholder="e.g. Yusuf Adesina" autoComplete="name" />
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputCls} placeholder="itusers@uacfoodsng.com" autoComplete="email" />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as "staff" | "manager")}
                className={cn(inputCls, "appearance-none")}>
                <option value="staff">Intern</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} className={cn(inputCls, "pr-9")}
                  placeholder="Min. 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink4 hover:text-ink transition-colors">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Confirm password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} required value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={cn(inputCls, "pr-9", confirm && confirm !== password && "border-uac-red")}
                  placeholder="Repeat your password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink4 hover:text-ink transition-colors">
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="font-mono text-[9px] text-uac-red mt-1">Passwords don&apos;t match</p>
              )}
            </div>
            {error && (
              <p className="font-mono text-[10px] text-uac-red bg-uac-red-soft px-2.5 py-1.5 rounded-[6px]">⚠ {error}</p>
            )}
            <button type="submit" disabled={loading}
              className={cn("w-full text-white font-mono text-[11px] font-semibold uppercase tracking-wide py-2.5 rounded-[6px] transition-colors",
                loading ? "bg-ink5 cursor-not-allowed" : "bg-uac-red hover:bg-uac-red-dark")}>
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <p className="font-mono text-[9px] text-ink5 text-center mt-5">
            Already have an account?{" "}
            <Link href="/" className="text-uac-green hover:underline font-semibold">Sign in →</Link>
          </p>
          <div className="flex h-[3px] rounded overflow-hidden mt-6">
            <div className="flex-1 bg-uac-red" /><div className="flex-1 bg-white border-y border-border" /><div className="flex-1 bg-uac-green" />
          </div>
          <p className="font-mono text-[9px] text-ink6 text-center mt-3">UAC Foods Dairies Plant · IT Desk v1.0 · Confidential</p>
        </div>
      </div>
    </div>
  );
}
