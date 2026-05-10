"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-[#999] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="
        w-full px-3 py-2.5 rounded-lg text-[13px] text-[#111118]
        bg-[#fafaf8] border border-black/10
        font-[family-name:var(--font-body)]
        placeholder:text-[#c0bfbb]
        outline-none
        transition-[border-color,background,box-shadow] duration-150
        hover:border-black/20
        focus:border-[#185FA5] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,95,165,0.08)]
      "
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { lang, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Translations ────────────────────────────────────────────────────────────
  const copy = {
    logo:        isAr ? <>مر<span className="font-bold text-[#e8c547]">حبا</span></> : <>mar<span className="font-bold text-[#e8c547]">haba</span></>,
    heroTitle:   isAr ? <>يسعدنا<br />عودتك.</> : <>Good to see<br />you again.</>,
    heroSub:     isAr ? "سجّل دخولك لإدارة حجوزاتك وقوائمك وإعدادات حسابك." : "Sign in to manage your bookings, listings, and account settings.",
    stats: [
      { val: "10,000+", label: isAr ? "مسافر نشط"   : "active travelers", color: "#378ADD" },
      { val: "5,000+",  label: isAr ? "مضيف موثوق"  : "trusted hosts",    color: "#e8c547" },
      { val: "98%",     label: isAr ? "معدل الرضا"   : "satisfaction rate", color: "#1D9E75" },
    ],
    welcome:     isAr ? "أهلاً بعودتك."    : "Welcome back.",
    noAccount:   isAr ? "ليس لديك حساب؟"  : "No account yet?",
    signupFree:  isAr ? "سجّل مجاناً"      : "Sign up free",
    emailLabel:  isAr ? "البريد الإلكتروني" : "Email",
    emailPh:     isAr ? "ahmed@example.com" : "you@example.com",
    passLabel:   isAr ? "كلمة المرور"      : "Password",
    passPh:      "••••••••",
    forgot:      isAr ? "نسيت؟"            : "forgot?",
    submit:      isAr ? "تسجيل الدخول ←"  : "sign in →",
    submitting:  isAr ? "جارٍ الدخول..."  : "signing in...",
    security:    isAr ? "محمي بتشفير معياري" : "Protected by industry-standard encryption",
    langToggle:  isAr ? "🇬🇧 English"      : "🇸🇦 عربي",
    error:       isAr ? "حدث خطأ ما"      : "Something went wrong",
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        const role = data.user?.role;
        if (role === "admin" || role === "super_admin") router.push("/admin");
        else if (role === "host") router.push("/host-dashboard");
        else router.push("/dashboard");
      } else {
        setError(data.message || (isAr ? "فشل تسجيل الدخول" : "Login failed"));
        setLoading(false);
      }
    } catch {
      setError(copy.error);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeUp   { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .fu1 { animation-delay: 0.08s; }
        .fu2 { animation-delay: 0.16s; }
        .fu3 { animation-delay: 0.24s; }
        .animate-spin-fast { animation: spin 0.7s linear infinite; }
      `}</style>

      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-screen flex bg-[#f7f6f2]"
        style={{ fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'DM Mono',monospace" }}
      >

        {/* ── Left panel ────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#1a1a2e] px-12 py-10 border-r border-[#e8c547]/10 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -bottom-16 -end-16 w-56 h-56 rounded-full border border-[#e8c547]/[0.08] pointer-events-none" />
          <div className="absolute -bottom-5 -end-5 w-36 h-36 rounded-full border border-[#e8c547]/[0.06] pointer-events-none" />

          <div className="relative space-y-10">
            {/* Logo */}
            <Link
              href="/"
              className="no-underline text-[26px] text-white/90 tracking-wide"
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif", fontWeight: 500 }}
            >
              مر<span className="font-bold text-[#e8c547]">حبا</span>
            </Link>

            {/* Hero text */}
            <div>
              <h2
                className="text-[38px] text-white font-light leading-[1.15] mb-4"
                style={{
                  fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                  fontStyle: isAr ? "normal" : "italic",
                }}
              >
                {copy.heroTitle}
              </h2>
              <p className="text-[13px] text-white/35 leading-relaxed">{copy.heroSub}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-5 relative">
            {copy.stats.map(({ val, label, color }) => (
              <div key={label} style={{ borderTop: `3px solid ${color}` }} className="pt-3">
                <div
                  className="text-[26px] text-white font-light leading-none"
                  style={{
                    fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                    fontStyle: isAr ? "normal" : "italic",
                  }}
                >
                  {val}
                </div>
                <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right panel ───────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
          <div className="w-full max-w-[360px]">

            {/* Top bar: mobile logo + lang toggle */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="lg:hidden no-underline text-[26px] text-[#1a1a2e]"
                style={{
                  fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                  fontStyle: isAr ? "normal" : "italic",
                  fontWeight: 300,
                }}
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
            <div className="animate-fadeUp fu1 mb-8">
              <h1
                className="text-[32px] text-[#111118] font-light leading-tight mb-1.5"
                style={{
                  fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                  fontStyle: isAr ? "normal" : "italic",
                }}
              >
                {copy.welcome}
              </h1>
              <p className="text-[12px] text-[#999]">
                {copy.noAccount}{" "}
                <Link href="/signup" className="text-[#185FA5] no-underline font-medium">
                  {copy.signupFree}
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="animate-fadeUp flex items-center gap-2 px-3.5 py-2.5 bg-[#FCEBEB] border border-[#a32d2d]/15 rounded-lg text-[12px] text-[#791F1F] mb-5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="#A32D2D" strokeWidth="1.2" />
                  <path d="M7 4v3.5M7 9.5h.01" stroke="#A32D2D" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="animate-fadeUp fu2 space-y-3.5">
              <Field label={copy.emailLabel}>
                <Input
                  type="email"
                  required
                  placeholder={copy.emailPh}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] tracking-widest uppercase text-[#999]">
                    {copy.passLabel}
                  </label>
                  <Link href="/forgot-password" className="text-[11px] text-[#185FA5] no-underline">
                    {copy.forgot}
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  placeholder={copy.passPh}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 mt-2
                  bg-[#1a1a2e] text-[#e8c547]
                  rounded-xl border-none text-[13px] font-semibold tracking-wide
                  flex items-center justify-center gap-2
                  transition-[opacity,transform] duration-150
                  hover:enabled:opacity-90 hover:enabled:-translate-y-px
                  disabled:opacity-45 disabled:cursor-not-allowed
                  cursor-pointer
                "
                style={{ fontFamily: "inherit" }}
              >
                {loading && (
                  <span className="animate-spin-fast inline-block w-3.5 h-3.5 rounded-full border-2 border-[#e8c547]/30 border-t-[#e8c547]" />
                )}
                {loading ? copy.submitting : copy.submit}
              </button>
            </form>

            {/* Security badge */}
            <div className="animate-fadeUp fu3 mt-7 text-center">
              <span className="inline-flex items-center gap-1.5 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-2xl px-3 py-1 text-[11px] text-[#0F6E56]">
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