"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import "./style.css";

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

  // ── Translations ──────────────────────────────────────────────────────────
  const copy = {
    logo:          isAr ? <>مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span></> : <>mar<span style={{ fontWeight: 700, color: "#e8c547" }}>haba</span></>,
    heroTitle:     isAr ? <>مساحتك،<br />قواعدك.</> : <>Your space,<br />your rules.</>,
    heroSub:       isAr ? "انضم إلى آلاف المستخدمين والمضيفين الذين يبنون علاقات حقيقية عبر منصتنا." : "Join thousands of users and hosts building meaningful connections through our platform.",
    stats: [
      { stat: "12,400+", label: isAr ? "إعلان نشط"       : "active listings",   c: "#378ADD" },
      { stat: "98%",     label: isAr ? "معدل الرضا"       : "satisfaction rate", c: "#e8c547" },
      { stat: "40+",     label: isAr ? "مدينة مغطاة"      : "cities covered",    c: "#1D9E75" },
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
    langToggle:    isAr ? "🇬🇧 English"           : "🇸🇦 عربي",
  };

  const arabicFont   = "'Cairo', 'Tajawal', 'Almarai', sans-serif";
  const englishFont  = "'DM Mono', monospace";
  const arabicDisplay  = "'Cairo', 'Tajawal', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont    = isAr ? arabicFont    : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(copy.pwMismatch);
      return;
    }
    if (formData.password.length < 6) {
      setError(copy.pwShort);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("pendingVerificationEmail", formData.email);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

 return (
  <>
    <div
      className={`min-h-screen flex bg-[#f7f6f2] ${
        isAr ? "flex-row-reverse" : ""
      }`}
      dir={isAr ? "rtl" : "ltr"}
      style={{ fontFamily: bodyFont }}
    >
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[38%] bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e] relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,#e8c547_0px,#e8c547_1px,transparent_1px,transparent_36px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(232,197,71,0.12)_0%,transparent_60%)]" />

        <div className="relative z-10">
          <Link
            href="/"
            className="text-white text-[26px] mb-10 block"
            style={{
              fontFamily: isAr
                ? "'Cairo','Tajawal',sans-serif"
                : "'Fraunces',serif",
              fontStyle: isAr ? "normal" : "italic",
              fontWeight: 300,
            }}
          >
            {copy.logo}
          </Link>

          <div className="grid grid-cols-6 gap-[10px] mb-8 w-fit">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-[#e8c547]/25 block"
              />
            ))}
          </div>

          <h1
            className="text-white text-[38px] leading-[1.15] mb-4"
            style={{
              fontFamily: displayFont,
              fontStyle: isAr ? "normal" : "italic",
              fontWeight: 300,
            }}
          >
            {copy.heroTitle}
          </h1>

          <p className="text-[13px] leading-[1.75] text-white/35 max-w-[420px]">
            {copy.heroSub}
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          {copy.stats.map(({ stat, label, c }) => (
            <div
              key={label}
              className="pt-3"
              style={{ borderTop: `3px solid ${c}` }}
            >
              <div
                className="text-white text-[26px] leading-none"
                style={{
                  fontFamily: displayFont,
                  fontStyle: isAr ? "normal" : "italic",
                  fontWeight: 300,
                }}
              >
                {stat}
              </div>

              <div className="text-[10px] tracking-[0.08em] uppercase text-white/30 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* MOBILE TOP */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link
              href="/"
              className="text-[#1a1a2e] text-[26px]"
              style={{
                fontFamily: isAr
                  ? "'Cairo','Tajawal',sans-serif"
                  : "'Fraunces',serif",
                fontStyle: isAr ? "normal" : "italic",
                fontWeight: 300,
              }}
            >
              {copy.logo}
            </Link>

            <button
              onClick={toggleLanguage}
              className="px-4 py-1.5 rounded-full text-[12px] border border-[#1a1a2e]/10 bg-[#1a1a2e]/5"
            >
              {copy.langToggle}
            </button>
          </div>

          {/* DESKTOP LANG */}
          <div className="hidden lg:flex justify-end mb-8">
            <button
              onClick={toggleLanguage}
              className="px-4 py-1.5 rounded-full text-[12px] border border-[#1a1a2e]/10 bg-[#1a1a2e]/5 hover:bg-[#1a1a2e]/10 transition"
            >
              {copy.langToggle}
            </button>
          </div>

          {/* HEADER */}
          <div className="mb-8">
            <h1
              className="text-[32px] text-[#111118] leading-[1.1] mb-2"
              style={{
                fontFamily: displayFont,
                fontStyle: isAr ? "normal" : "italic",
                fontWeight: 300,
              }}
            >
              {copy.createAccount}
            </h1>

            <p className="text-[12px] text-[#999]">
              {copy.alreadyHave}{" "}
              <Link
                href="/login"
                className="text-[#185FA5] no-underline"
              >
                {copy.signIn}
              </Link>
            </p>
          </div>

          {/* USER TYPE */}
          <div className="mb-6">
            <div className="text-[10px] tracking-[0.08em] uppercase text-[#999] mb-2">
              {copy.joinAs}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: "user",
                  label: copy.traveler,
                  desc: copy.travelerDesc,
                },
                {
                  value: "host",
                  label: copy.host,
                  desc: copy.hostDesc,
                },
              ].map(({ value, label, desc }) => {
                const active = formData.userType === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, userType: value })
                    }
                    className={`rounded-[10px] border-2 p-3 text-left transition ${
                      active
                        ? "bg-[#1a1a2e] border-[#1a1a2e]"
                        : "bg-white border-[#e5e3dc]"
                    }`}
                  >
                    <div
                      className={`text-[13px] font-semibold mb-0.5 ${
                        active ? "text-[#e8c547]" : "text-[#111118]"
                      }`}
                    >
                      {label}
                    </div>

                    <div
                      className={`text-[11px] ${
                        active
                          ? "text-[#e8c547]/70"
                          : "text-[#aaa]"
                      }`}
                    >
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[12px]">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mb-7">
              <div>
                <label className="block text-[10px] tracking-[0.08em] uppercase text-[#999] mb-1.5">
                  {copy.fullName}
                </label>

                <input
                  name="name"
                  type="text"
                  required
                  placeholder={copy.namePh}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-[11px] bg-white border border-[#e5e3dc] rounded-lg text-[13px] outline-none focus:border-[#1a1a2e]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.08em] uppercase text-[#999] mb-1.5">
                  {copy.email}
                </label>

                <input
                  name="email"
                  type="email"
                  required
                  placeholder={copy.emailPh}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-[11px] bg-white border border-[#e5e3dc] rounded-lg text-[13px] outline-none focus:border-[#1a1a2e]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.08em] uppercase text-[#999] mb-1.5">
                  {copy.phone}
                </label>

                <input
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder={copy.phonePh}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-[11px] bg-white border border-[#e5e3dc] rounded-lg text-[13px] outline-none focus:border-[#1a1a2e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] tracking-[0.08em] uppercase text-[#999] mb-1.5">
                    {copy.password}
                  </label>

                  <input
                    name="password"
                    type="password"
                    required
                    placeholder={copy.passwordPh}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-[11px] bg-white border border-[#e5e3dc] rounded-lg text-[13px] outline-none focus:border-[#1a1a2e]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.08em] uppercase text-[#999] mb-1.5">
                    {copy.confirm}
                  </label>

                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder={copy.confirmPh}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-[11px] bg-white border border-[#e5e3dc] rounded-lg text-[13px] outline-none focus:border-[#1a1a2e]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] hover:bg-[#222244] transition text-[#e8c547] rounded-[10px] py-3 text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && (
                <span className="w-[14px] h-[14px] border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin" />
              )}

              {loading ? copy.submitting : copy.submit}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-7 text-center">
            <div className="inline-flex items-center gap-2 bg-[#EDF7F3] text-[#0F6E56] text-[11px] px-3 py-2 rounded-full">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 1L1.5 2.5v3C1.5 7.4 3 8.8 5 9.5c2-0.7 3.5-2.1 3.5-4V2.5L5 1z"
                  stroke="#0F6E56"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>

              {copy.terms}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

function Input({ bodyFont, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        background: "#fff",
        border: "1.5px solid #e5e3dc",
        borderRadius: 8,
        fontSize: 13,
        color: "#111118",
        fontFamily: bodyFont,
        outline: "none",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#1a1a2e")}
      onBlur={(e)  => (e.target.style.borderColor = "#e5e3dc")}
    />
  );
}