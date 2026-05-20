"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveSession } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function VerifyOtpContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";

  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [cooldown,  setCooldown]  = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  const submitOtp = useCallback(async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Verification failed"); return; }
      setSuccess(true);
      saveSession(data.token, data.user);
      setTimeout(() => router.push(data.user.role === "manager" ? "/manager" : "/dashboard"), 800);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  function handleChange(index: number, value: string) {
    if (value.length === OTP_LENGTH && /^\d{6}$/.test(value)) {
      const next = value.split("");
      setDigits(next);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      submitOtp(value);
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    const code = next.join("");
    if (code.length === OTP_LENGTH && !next.includes("")) submitOtp(code);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) { const next = [...digits]; next[index] = ""; setDigits(next); }
      else if (index > 0) inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && index > 0)              inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted.length) return;
    const next = [...digits];
    pasted.split("").forEach((d, i) => { if (i < OTP_LENGTH) next[i] = d; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to resend"); return; }
      setDigits(Array(OTP_LENGTH).fill(""));
      setCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setResending(false);
    }
  }

  const filled = digits.filter(Boolean).length;

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
            One step<br /><strong className="font-bold">left to go.</strong>
          </p>
          <p className="font-mono text-[10px] text-white/25 mt-3">// UAC Foods Dairies Plant · IT Dept</p>
        </div>
        <div className="hidden sm:block bg-white/5 border border-white/10 rounded-[10px] p-4">
          <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-2">Why verify?</p>
          <ul className="space-y-1.5">
            {["Confirms you own the email address", "Prevents unauthorized access", "Links your account to Dairies Plant IT"].map((t) => (
              <li key={t} className="flex items-start gap-2 text-[11px] text-white/40">
                <div className="w-1 h-1 rounded-full bg-uac-green shrink-0 mt-1.5" />{t}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-uac-green" />
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-surf flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-uac-green-soft border border-uac-green/30 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <p className="text-[18px] font-bold text-ink mb-1">Verified!</p>
              <p className="font-mono text-[10px] text-ink5">Redirecting you to your dashboard…</p>
            </div>
          ) : (
            <>
              <h1 className="text-[24px] font-bold text-ink tracking-tight mb-1">Check your email</h1>
              <p className="text-[12px] text-ink4 mb-1">We sent a 6-digit code to</p>
              <p className="font-mono text-[11px] text-uac-green font-semibold mb-7 break-all">{email || "your email"}</p>

              <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input key={i} ref={(el) => { inputRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={6} value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={loading || success} autoFocus={i === 0}
                    className={[
                      "w-11 h-13 text-center font-mono text-[22px] font-bold rounded-[8px] border-2 outline-none transition-all",
                      digit ? "border-uac-green bg-uac-green-soft text-uac-green-dk" : "border-border bg-paper text-ink focus:border-uac-green",
                      loading ? "opacity-50 cursor-wait" : "",
                    ].join(" ")}
                  />
                ))}
              </div>

              <div className="flex justify-center gap-1.5 mb-5">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <div key={i} className={["w-1.5 h-1.5 rounded-full transition-all duration-200", i < filled ? "bg-uac-green" : "bg-border"].join(" ")} />
                ))}
              </div>

              {error   && <p className="font-mono text-[10px] text-uac-red bg-uac-red-soft px-2.5 py-1.5 rounded-[6px] mb-3 text-center">⚠ {error}</p>}
              {loading && <p className="font-mono text-[10px] text-ink5 text-center mb-3 animate-pulse">Verifying…</p>}

              <div className="text-center mb-5">
                {cooldown > 0 ? (
                  <p className="font-mono text-[9px] text-ink5">Resend code in <span className="font-semibold text-ink4">{cooldown}s</span></p>
                ) : (
                  <button onClick={handleResend} disabled={resending}
                    className="font-mono text-[9px] text-uac-green hover:underline font-semibold disabled:opacity-50">
                    {resending ? "Sending…" : "Resend code →"}
                  </button>
                )}
              </div>

              <p className="font-mono text-[9px] text-ink5 text-center">
                Wrong email?{" "}
                <Link href="/signup" className="text-uac-green hover:underline font-semibold">Back to sign up →</Link>
              </p>
              <div className="flex h-[3px] rounded overflow-hidden mt-7">
                <div className="flex-1 bg-uac-red" />
                <div className="flex-1 bg-white border-y border-border" />
                <div className="flex-1 bg-uac-green" />
              </div>
              <p className="font-mono text-[9px] text-ink6 text-center mt-3">UAC Foods Dairies Plant · IT Desk v1.0 · Confidential</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
