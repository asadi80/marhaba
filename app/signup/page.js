"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

// ─── Sub-components ──────────────────────────────────────────────────────────

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

export default function Signup() {
  const router = useRouter();
  const { lang, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    userType: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Translations ────────────────────────────────────────────────────────────
  const copy = {
    logo:         isAr ? <>مر<span className="font-bold text-[#e8c547]">حبا</span></> : <>mar<span className="font-bold text-[#e8c547]">haba</span></>,
    heroTitle:    isAr ? <>مساحتك،<br />قواعدك.</> : <>Your space,<br />your rules.</>,
    heroSub:      isAr ? "انضم إلى آلاف المستخدمين والمضيفين الذين يبنون علاقات حقيقية عبر منصتنا." : "Join thousands of users and hosts building meaningful connections through our platform.",
    stats: [
      { stat: "12,400+", label: isAr ? "إعلان نشط"  : "active listings",   color: "#378ADD" },
      { stat: "98%",     label: isAr ? "معدل الرضا"  : "satisfaction rate", color: "#e8c547" },
      { stat: "40+",     label: isAr ? "مدينة مغطاة" : "cities covered",    color: "#1D9E75" },
    ],
    createAccount: isAr ? "إنشاء حساب"          : "Create account",
    alreadyHave:   isAr ? "لديك حساب بالفعل؟"   : "Already have one?",
    signIn:        isAr ? "تسجيل الدخول"         : "Sign in",
    joinAs:        isAr ? "أريد الانضمام كـ"     : "I want to join as",
    traveler:      isAr ? "مسافر"                : "Traveler",
    travelerDesc:  isAr ? "تصفح وحجز الإقامات"   : "Browse & book stays",
    host:          isAr ? "مضيف"                 : "Host",
    hostDesc:      isAr ? "أدرج وأدر العقارات"   : "List & manage properties",
    fullName:      isAr ? "الاسم الكامل"          : "Full name",
    namePh:        isAr ? "أحمد محمد"             : "Jane Smith",
    email:         isAr ? "البريد الإلكتروني"     : "Email",
    emailPh:       isAr ? "ahmed@example.com"     : "jane@example.com",
    phone:         isAr ? "رقم الهاتف"            : "Phone number",
    phonePh:       isAr ? "+218 91 234 5678"       : "+1 555 000 0000",
    password:      isAr ? "كلمة المرور"           : "Password",
    passwordPh:    isAr ? "٦ أحرف على الأقل"      : "min 6 chars",
    confirm:       isAr ? "تأكيد"                 : "Confirm",
    confirmPh:     isAr ? "أعد الكتابة"           : "repeat",
    submit:        isAr ? "إنشاء الحساب ←"        : "create account →",
    submitting:    isAr ? "جارٍ الإنشاء..."       : "creating account...",
    terms:         isAr ? "بإنشاء حساب فإنك توافق على" : "By signing up you agree to our",
    termsLink:     isAr ? "الشروط"                : "Terms",
    and:           isAr ? "و"                     : "and",
    privacyLink:   isAr ? "سياسة الخصوصية"       : "Privacy Policy",
    pwMismatch:    isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
    pwShort:       isAr ? "كلمة المرور يجب أن تكون ٦ أحرف على الأقل" : "Password must be at least 6 characters",
    langToggle:  isAr ? "🇬🇧"      : "🇱🇾",
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) return setError(copy.pwMismatch);
    if (formData.password.length < 6) return setError(copy.pwShort);

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          userType: formData.userType,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("pendingVerificationEmail", formData.email);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeUp    { animation: fadeUp 0.4s ease both; }
        .animate-spin-fast { animation: spin 0.7s linear infinite; }
      `}</style>

      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-screen flex bg-[#f7f6f2]"
        style={{ fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'DM Mono',monospace" }}
      >

        {/* ── Left panel ──────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#1a1a2e] px-12 py-10 border-r border-[#e8c547]/10 relative overflow-hidden">
          {/* Decorative patterns */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#e8c547 0px,#e8c547 1px,transparent 1px,transparent 36px)" }}
          />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)]" />

          <div className="relative space-y-8">
            {/* Logo */}
            <Link
              href="/"
              className="no-underline text-[26px] text-white/90 tracking-wide"
              style={{ fontFamily: "'Cairo','Tajawal',sans-serif", fontWeight: 500 }}
            >
              مر<span className="font-bold text-[#e8c547]">حبا</span>
            </Link>

            {/* Dot grid */}
            <div className="grid grid-cols-6 gap-2.5 w-fit opacity-[0.08]">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="block w-1.5 h-1.5 rounded-full bg-[#e8c547]" />
              ))}
            </div>

            {/* Hero text */}
            <div>
              <h2
                className="text-[36px] text-white font-light leading-[1.15] mb-5"
                style={{
                  fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                  fontStyle: isAr ? "normal" : "italic",
                }}
              >
                {copy.heroTitle}
              </h2>
              <p className="text-[13px] text-white/40 leading-relaxed">{copy.heroSub}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-5 relative">
            {copy.stats.map(({ stat, label, color }) => (
              <div key={label} style={{ borderTop: `3px solid ${color}` }} className="pt-3">
                <div
                  className="text-[28px] text-white font-light leading-none"
                  style={{
                    fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                    fontStyle: isAr ? "normal" : "italic",
                  }}
                >
                  {stat}
                </div>
                <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-[460px] animate-fadeUp">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              {/* Mobile logo */}
             <Link
            href="/"
            className="no-underline font-[Cairo,Tajawal,sans-serif] font-medium text-[26px] text-[#1a1a2e] tracking-wide"
          >
            مر<span className="font-bold text-yellow-400">حبا</span>
          </Link>

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="
                  bg-[#1a1a2e]/[0.07] border border-[#1a1a2e]/[0.12]
                  rounded-2xl px-3.5 py-1 text-[12px] font-medium text-[#1a1a2e]
                  cursor-pointer transition-colors duration-150
                  hover:bg-[#1a1a2e]/[0.12]
                  ms-auto
                "
                style={{ fontFamily: "inherit" }}
              >
                {copy.langToggle}
              </button>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1
                className="text-[30px] text-[#111118] font-light leading-tight mb-1.5"
                style={{
                  fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                  fontStyle: isAr ? "normal" : "italic",
                }}
              >
                {copy.createAccount}
              </h1>
              <p className="text-[12px] text-[#999]">
                {copy.alreadyHave}{" "}
                <Link href="/login" className="text-[#185FA5] no-underline font-medium">
                  {copy.signIn}
                </Link>
              </p>
            </div>

            {/* User type toggle */}
            <div className="mb-6">
              <p className="text-[10px] tracking-widest uppercase text-[#999] mb-2">
                {copy.joinAs}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "user", label: copy.traveler, desc: copy.travelerDesc },
                  { value: "host", label: copy.host,     desc: copy.hostDesc     },
                ].map(({ value, label, desc }) => {
                  const active = formData.userType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: value })}
                      className={`
                        rounded-xl px-4 py-3 cursor-pointer transition-all duration-150
                        ${isAr ? "text-right" : "text-left"}
                        ${active
                          ? "bg-[#1a1a2e] border-2 border-[#1a1a2e]"
                          : "bg-white border-2 border-[#e5e3dc] hover:border-black/20"}
                      `}
                      style={{ fontFamily: "inherit" }}
                    >
                      <div className={`text-[13px] font-semibold mb-0.5 ${active ? "text-[#e8c547]" : "text-[#111118]"}`}>
                        {label}
                      </div>
                      <div className={`text-[11px] ${active ? "text-[#e8c547]/65" : "text-[#aaa]"}`}>
                        {desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label={copy.fullName}>
                <Input name="name" type="text" required placeholder={copy.namePh} value={formData.name} onChange={handleChange} />
              </Field>

              <Field label={copy.email}>
                <Input name="email" type="email" required placeholder={copy.emailPh} value={formData.email} onChange={handleChange} />
              </Field>

              <Field label={copy.phone}>
                <Input name="phoneNumber" type="tel" required placeholder={copy.phonePh} value={formData.phoneNumber} onChange={handleChange} />
              </Field>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-2">
                <Field label={copy.password}>
                  <Input name="password" type="password" required placeholder={copy.passwordPh} value={formData.password} onChange={handleChange} />
                </Field>
                <Field label={copy.confirm}>
                  <Input name="confirmPassword" type="password" required placeholder={copy.confirmPh} value={formData.confirmPassword} onChange={handleChange} />
                </Field>
              </div>

              {/* Error */}
              {error && (
                <div className="px-3.5 py-2.5 bg-[#FCEBEB] border border-[#a32d2d]/15 rounded-lg text-[12px] text-[#791F1F]">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-3 px-5 mt-1
                  bg-[#1a1a2e] text-[#e8c547]
                  rounded-xl border-none text-[13px] font-semibold
                  flex items-center justify-center gap-2
                  transition-[opacity,transform] duration-150
                  hover:not(:disabled):opacity-90 hover:not(:disabled):-translate-y-px
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

            {/* Legal */}
            <p className="text-[11px] text-[#bbb] text-center mt-5 leading-relaxed">
              {copy.terms}{" "}
              <span className="text-[#185FA5] cursor-pointer">{copy.termsLink}</span>{" "}
              {copy.and}{" "}
              <span className="text-[#185FA5] cursor-pointer">{copy.privacyLink}</span>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}