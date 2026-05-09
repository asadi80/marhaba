"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const stats = [
  { val: "Secure",    label: "password encryption",   border: "#378ADD" },
  { val: "Protected", label: "account recovery",       border: "#e8c547" },
  { val: "Trusted",   label: "authentication system",  border: "#1D9E75" },
];

/* ─── Shared pieces ─────────────────────────────────────── */

function Logo({ dark = false }) {
  return (
    <span
      className={`font-light text-[22px] [font-family:'Fraunces',serif] ${dark ? "text-[#111118] italic" : "text-white"}`}
    >
      mar<span className={`font-medium ${dark ? "not-italic" : ""} text-[#e8c547]`}>haba</span>
    </span>
  );
}

function LeftPanel({ headline, sub }) {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#1a1a2e] px-12 py-10 border-r border-[#e8c547]/10 relative overflow-hidden">
      <div className="absolute bottom-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full border border-[#e8c547]/[0.08] pointer-events-none" />
      <div className="absolute bottom-[-20px] right-[-20px] w-[140px] h-[140px] rounded-full border border-[#e8c547]/[0.06] pointer-events-none" />

      <Link href="/" className="relative z-10 w-fit no-underline">
        <Logo />
      </Link>

      <div className="relative z-10">
        <p className="italic font-light text-[38px] leading-[1.15] text-white mb-4 [font-family:'Fraunces',serif]">
          {headline}
        </p>
        <p className="text-[13px] leading-[1.75] text-white/35">{sub}</p>
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        {stats.map(({ val, label, border }) => (
          <div key={label} className="pt-3" style={{ borderTop: `3px solid ${border}` }}>
            <p className="italic font-light text-[26px] leading-none text-white [font-family:'Fraunces',serif]">{val}</p>
            <p className="text-[10px] uppercase tracking-[0.08em] text-white/30 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Invalid token state ────────────────────────────────── */

function InvalidToken() {
  return (
    <div className="min-h-screen flex bg-[#f7f6f2]">
      <div className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#1a1a2e] px-12 py-10 border-r border-[#e8c547]/10 relative overflow-hidden">
        <div className="absolute bottom-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full border border-[#e8c547]/[0.08] pointer-events-none" />
        <div className="absolute bottom-[-20px] right-[-20px] w-[140px] h-[140px] rounded-full border border-[#e8c547]/[0.06] pointer-events-none" />

        <Link href="/" className="relative z-10 w-fit no-underline">
          <Logo />
        </Link>

        <div className="relative z-10">
          <p className="italic font-light text-[38px] leading-[1.15] text-white mb-4 [font-family:'Fraunces',serif]">
            Reset link<br />expired.
          </p>
          <p className="text-[13px] leading-[1.75] text-white/35">
            Your password reset link is invalid or has expired. Request a new secure reset link.
          </p>
        </div>

        {/* empty spacer so justify-between still looks right */}
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[360px]">
          <div className="lg:hidden mb-10">
            <Link href="/" className="no-underline"><Logo dark /></Link>
          </div>

          <div className="flex items-center gap-2 bg-[#FCEBEB] border border-[#A32D2D]/15 rounded-[8px] px-3.5 py-2.5 text-[12px] text-[#791F1F] mb-5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#A32D2D" strokeWidth="1.2" />
              <path d="M7 4v3.5M7 9.5h.01" stroke="#A32D2D" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Invalid or expired reset link
          </div>

          <Link
            href="/forgot-password"
            className="flex justify-center items-center w-full py-3 rounded-[10px] bg-[#1a1a2e] text-[#e8c547] text-[13px] font-mono tracking-[0.02em] no-underline transition-all duration-150 hover:opacity-90 hover:-translate-y-px"
          >
            request new link →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────────── */

function ResetPasswordContent() {
  const searchParams   = useSearchParams();
  const token          = searchParams.get("token");
  const router         = useRouter();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message,         setMessage]         = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [isValidToken,    setIsValidToken]    = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError("Invalid or expired reset link");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) return <InvalidToken />;

  return (
    <div className="min-h-screen flex bg-[#f7f6f2]">

      {/* LEFT PANEL */}
      <LeftPanel
        headline={<>Create a new<br />password.</>}
        sub="Choose a strong password to keep your account secure."
      />

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="no-underline"><Logo dark /></Link>
          </div>

          {/* Header */}
          <div className="mb-8 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.08s_both]">
            <h1 className="italic font-light text-[32px] leading-[1.1] text-[#111118] mb-1.5 [font-family:'Fraunces',serif]">
              New password.
            </h1>
            <p className="text-[12px] text-[#999]">
              Remember your password?{" "}
              <Link href="/login" className="text-[#185FA5] no-underline hover:underline">
                Back to login
              </Link>
            </p>
          </div>

          {/* Success banner */}
          {message && (
            <div className="flex items-center gap-2 bg-[#eaf3de] border border-[#c5d9b1] rounded-[10px] px-3 py-2.5 text-[12px] text-[#27500A] mb-5 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <circle cx="7" cy="7" r="6" stroke="#27500A" strokeWidth="1.2" />
                <path d="M4.5 7l2 2 3-4" stroke="#27500A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {message}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-[#FCEBEB] border border-[#A32D2D]/15 rounded-[8px] px-3.5 py-2.5 text-[12px] text-[#791F1F] mb-5 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <circle cx="7" cy="7" r="6" stroke="#A32D2D" strokeWidth="1.2" />
                <path d="M7 4v3.5M7 9.5h.01" stroke="#A32D2D" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.16s_both]">
            <div className="flex flex-col gap-3.5 mb-7">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.09em] text-[#999] mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-[11px] bg-[#fafaf8] border border-black/10 rounded-[8px] text-[13px] text-[#111118] font-mono outline-none placeholder:text-[#c0bfbb] transition-all duration-150 hover:border-black/20 focus:border-[#185FA5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,95,165,0.08)]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.09em] text-[#999] mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-[11px] bg-[#fafaf8] border border-black/10 rounded-[8px] text-[13px] text-[#111118] font-mono outline-none placeholder:text-[#c0bfbb] transition-all duration-150 hover:border-black/20 focus:border-[#185FA5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,95,165,0.08)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[10px] bg-[#1a1a2e] text-[#e8c547] text-[13px] font-mono tracking-[0.02em] border-none cursor-pointer transition-all duration-150 hover:enabled:opacity-90 hover:enabled:-translate-y-px disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {loading ? "resetting password..." : "reset password →"}
            </button>
          </form>

          {/* Security tag */}
          <div className="mt-7 text-center animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.24s_both]">
            <div className="inline-flex items-center gap-1.5 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-full px-3 py-1 text-[11px] text-[#0F6E56]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L1.5 2.5v3C1.5 7.4 3 8.8 5 9.5c2-0.7 3.5-2.1 3.5-4V2.5L5 1z" stroke="#0F6E56" strokeWidth="1" strokeLinejoin="round" />
              </svg>
              Protected by industry-standard encryption
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Page export with Suspense ──────────────────────────── */

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
          <span className="text-[13px] font-mono text-[#999]">Loading...</span>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}