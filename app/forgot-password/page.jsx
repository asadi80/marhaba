"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

export default function ForgotPasswordPage() {
  const { lang, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // ── Translations ────────────────────────────────────────────────────────────
  const copy = {
    logo:        isAr ? <>مر<span className="font-bold text-[#e8c547]">حبا</span></> : <>mar<span className="font-bold text-[#e8c547]">haba</span></>,
    heroTitle:   isAr ? <>أعد ضبط<br />كلمة المرور.</> : <>Reset your<br />password.</>,
    heroSub:     isAr ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين آمن." : "Enter your email address and we'll send you a secure reset link.",
    stats: [
      { val: isAr ? "آمن"      : "Secure",    label: isAr ? "استعادة كلمة المرور"  : "password recovery",  color: "#378ADD" },
      { val: "24/7",            label: isAr ? "حماية الحساب"         : "account protection",  color: "#e8c547" },
      { val: isAr ? "مشفّر"    : "Encrypted", label: isAr ? "روابط إعادة تعيين آمنة" : "secure reset links", color: "#1D9E75" },
    ],
    heading:     isAr ? "نسيت كلمة المرور."     : "Forgot password.",
    remember:    isAr ? "تتذكر كلمة المرور؟"    : "Remember your password?",
    backToLogin: isAr ? "العودة لتسجيل الدخول"  : "Back to login",
    emailLabel:  isAr ? "البريد الإلكتروني"      : "Email address",
    emailPh:     isAr ? "ahmed@example.com"      : "you@example.com",
    submit:      isAr ? "إرسال رابط الإعادة ←"  : "send reset link →",
    submitting:  isAr ? "جارٍ الإرسال..."        : "sending reset link...",
    security:    isAr ? "محمي بتشفير معياري"     : "Protected by industry-standard encryption",
    langToggle:  isAr ? "🇬🇧 English"            : "🇸🇦 عربي",
    successFall: isAr ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني!" : "Password reset link sent to your email!",
    errorFall:   isAr ? "حدث خطأ ما"             : "Something went wrong",
  };

  // ── Handler ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || copy.successFall);
        setEmail("");
      } else {
        setError(data.message || copy.errorFall);
      }
    } catch {
      setError(copy.errorFall);
    } finally {
      setLoading(false);
    }
  };

  const displayFont = isAr
    ? "'Cairo','Tajawal',sans-serif"
    : "'Fraunces',serif";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;1,300;1,400&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu  { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .fu1 { animation-delay: 0.08s; }
        .fu2 { animation-delay: 0.16s; }
        .fu3 { animation-delay: 0.24s; }
      `}</style>

      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-screen flex bg-[#f7f6f2]"
        style={{ fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'DM Mono',monospace" }}
      >

        {/* ── Left panel ──────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#1a1a2e] px-12 py-10 border-r border-[#e8c547]/10 relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute -bottom-16 -end-16 w-56 h-56 rounded-full border border-[#e8c547]/[0.08] pointer-events-none" />
          <div className="absolute -bottom-5 -end-5 w-36 h-36 rounded-full border border-[#e8c547]/[0.06] pointer-events-none" />

          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 no-underline text-[26px] text-white/90 tracking-wide"
            style={{ fontFamily: "'Cairo','Tajawal',sans-serif", fontWeight: 500 }}
          >
            مر<span className="font-bold text-[#e8c547]">حبا</span>
          </Link>

          {/* Hero text */}
          <div className="relative z-10">
            <h2
              className="text-[38px] text-white font-light leading-[1.15] mb-4"
              style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic" }}
            >
              {copy.heroTitle}
            </h2>
            <p className="text-[13px] text-white/35 leading-relaxed">{copy.heroSub}</p>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex flex-col gap-5">
            {copy.stats.map(({ val, label, color }) => (
              <div key={label} style={{ borderTop: `3px solid ${color}` }} className="pt-3">
                <div
                  className="text-[26px] text-white font-light leading-none"
                  style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic" }}
                >
                  {val}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[360px]">

            {/* Top bar: mobile logo + lang toggle */}
            <div className="flex items-center justify-between mb-10">
              <Link
                href="/"
                className="lg:hidden no-underline text-[24px] text-[#1a1a2e] font-light"
                style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic" }}
              >
                {copy.logo}
              </Link>

              <button
                onClick={toggleLanguage}
                className="
                  bg-[#1a1a2e]/[0.07] border border-[#1a1a2e]/[0.12]
                  rounded-2xl px-3.5 py-1 text-[12px] font-medium text-[#1a1a2e]
                  cursor-pointer transition-colors duration-150 hover:bg-[#1a1a2e]/[0.12]
                  ms-auto
                "
                style={{ fontFamily: "inherit" }}
              >
                {copy.langToggle}
              </button>
            </div>

            {/* Heading */}
            <div className="fu fu1 mb-8">
              <h1
                className="text-[32px] text-[#111118] font-light leading-[1.1] mb-1.5"
                style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic" }}
              >
                {copy.heading}
              </h1>
              <p className="text-[12px] text-[#999]">
                {copy.remember}{" "}
                <Link href="/login" className="text-[#185FA5] no-underline hover:underline">
                  {copy.backToLogin}
                </Link>
              </p>
            </div>

            {/* Success banner */}
            {message && (
              <div className="fu flex items-center gap-2 bg-[#eaf3de] border border-[#c5d9b1] rounded-[10px] px-3 py-2.5 text-[12px] text-[#27500A] mb-5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="#27500A" strokeWidth="1.2" />
                  <path d="M4.5 7l2 2 3-4" stroke="#27500A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {message}
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="fu flex items-center gap-2 bg-[#FCEBEB] border border-[#A32D2D]/15 rounded-lg px-3.5 py-2.5 text-[12px] text-[#791F1F] mb-5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="#A32D2D" strokeWidth="1.2" />
                  <path d="M7 4v3.5M7 9.5h.01" stroke="#A32D2D" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="fu fu2">
              <div className="mb-7">
                <label className="block text-[10px] uppercase tracking-widest text-[#999] mb-1.5">
                  {copy.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  placeholder={copy.emailPh}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full px-3 py-[11px] rounded-lg text-[13px] text-[#111118]
                    bg-[#fafaf8] border border-black/10
                    placeholder:text-[#c0bfbb] outline-none
                    transition-all duration-150
                    hover:border-black/20
                    focus:border-[#185FA5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,95,165,0.08)]
                  "
                  style={{ fontFamily: "inherit" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 rounded-xl
                  bg-[#1a1a2e] text-[#e8c547]
                  border-none text-[13px] font-semibold tracking-wide
                  cursor-pointer transition-[opacity,transform] duration-150
                  hover:enabled:opacity-90 hover:enabled:-translate-y-px
                  disabled:opacity-45 disabled:cursor-not-allowed
                "
                style={{ fontFamily: "inherit" }}
              >
                {loading ? copy.submitting : copy.submit}
              </button>
            </form>

            {/* Security badge */}
            <div className="fu fu3 mt-7 text-center">
              <span className="inline-flex items-center gap-1.5 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-full px-3 py-1 text-[11px] text-[#0F6E56]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1L1.5 2.5v3C1.5 7.4 3 8.8 5 9.5c2-0.7 3.5-2.1 3.5-4V2.5L5 1z" stroke="#0F6E56" strokeWidth="1" strokeLinejoin="round" />
                </svg>
                {copy.security}
              </span>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}