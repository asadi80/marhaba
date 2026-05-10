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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${bodyFont}; background: #f7f6f2; -webkit-font-smoothing: antialiased; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          direction: isAr ? "rtl" : "ltr",
          fontFamily: bodyFont,
        }}
      >
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <div
    
          className="left-panel"
        >
          {/* Subtle pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "repeating-linear-gradient(45deg, #e8c547 0px, #e8c547 1px, transparent 1px, transparent 36px)",
              opacity: 0.035,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 20% 50%, rgba(232,197,71,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            {/* Logo */}
             <Link
              href="/"
              style={{
                textDecoration: "none",
                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                fontWeight: 500,
                fontSize: "26px",
                color: "#fcfcfc",
                letterSpacing: "1px",
              }}
            >
             مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span>
            </Link>

            {/* Dot grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6,1fr)",
                gap: 10,
                marginBottom: "2rem",
                width: "fit-content",
              }}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(232,197,71,0.25)",
                    display: "block",
                  }}
                />
              ))}
            </div>

            {/* Headline */}
            <div
              style={{
                fontFamily: displayFont,
                fontStyle: isAr ? "normal" : "italic",
                fontWeight: 300,
                fontSize: 36,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1.25rem",
              }}
            >
              {copy.heroTitle}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.8 }}>
              {copy.heroSub}
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
            {copy.stats.map(({ stat, label, c }) => (
              <div key={label} style={{ borderTop: `3px solid ${c}`, paddingTop: "0.8rem" }}>
                <div
                  style={{
                    fontFamily: displayFont,
                    fontStyle: isAr ? "normal" : "italic",
                    fontWeight: 300,
                    fontSize: 28,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {stat}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.28)",
                    marginTop: 5,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#f7f6f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1.5rem",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              animation: "fadeUp 0.4s ease both",
            }}
          >
            {/* Top bar: mobile logo + lang toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              {/* Mobile-only logo */}
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  fontFamily: isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif",
                  fontStyle: isAr ? "normal" : "italic",
                  fontWeight: 300,
                  fontSize: 24,
                  color: "#1a1a2e",
                }}
                className="mobile-logo-show"
              >
                {copy.logo}
              </Link>

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                style={{
                  background: "rgba(26,26,46,0.07)",
                  border: "1px solid rgba(26,26,46,0.12)",
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                  color: "#1a1a2e",
                  fontFamily: bodyFont,
                  fontWeight: 500,
                  transition: "background 0.15s",
                  marginLeft: isAr ? 0 : "auto",
                  marginRight: isAr ? "auto" : 0,
                }}
              >
                {copy.langToggle}
              </button>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h1
                style={{
                  fontFamily: displayFont,
                  fontStyle: isAr ? "normal" : "italic",
                  fontWeight: 300,
                  fontSize: 30,
                  color: "#111118",
                  marginBottom: 6,
                  lineHeight: 1.1,
                }}
              >
                {copy.createAccount}
              </h1>
              <p style={{ fontSize: 12, color: "#999" }}>
                {copy.alreadyHave}{" "}
                <Link href="/login" style={{ color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>
                  {copy.signIn}
                </Link>
              </p>
            </div>

            {/* User type toggle */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: 8,
                }}
              >
                {copy.joinAs}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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
                      style={{
                        background: active ? "#1a1a2e" : "#fff",
                        border: active ? "2px solid #1a1a2e" : "2px solid #e5e3dc",
                        borderRadius: 10,
                        padding: "12px 14px",
                        cursor: "pointer",
                        textAlign: isAr ? "right" : "left",
                        transition: "all 0.15s",
                        fontFamily: bodyFont,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: active ? "#e8c547" : "#111118",
                          marginBottom: 2,
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ fontSize: 11, color: active ? "rgba(232,197,71,0.65)" : "#aaa" }}>
                        {desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "1rem" }}>

                <Field label={copy.fullName}>
                  <Input
                    name="name"
                    type="text"
                    required
                    placeholder={copy.namePh}
                    value={formData.name}
                    onChange={handleChange}
                    bodyFont={bodyFont}
                  />
                </Field>

                <Field label={copy.email}>
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder={copy.emailPh}
                    value={formData.email}
                    onChange={handleChange}
                    bodyFont={bodyFont}
                  />
                </Field>

                <Field label={copy.phone}>
                  <Input
                    name="phoneNumber"
                    type="tel"
                    required
                    placeholder={copy.phonePh}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    bodyFont={bodyFont}
                  />
                </Field>

                {/* Password row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label={copy.password}>
                    <Input
                      name="password"
                      type="password"
                      required
                      placeholder={copy.passwordPh}
                      value={formData.password}
                      onChange={handleChange}
                      bodyFont={bodyFont}
                    />
                  </Field>
                  <Field label={copy.confirm}>
                    <Input
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder={copy.confirmPh}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      bodyFont={bodyFont}
                    />
                  </Field>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "#FFF5F5",
                    border: "1px solid #FEB2B2",
                    color: "#C53030",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 12,
                    marginBottom: "1rem",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "#555" : "#1a1a2e",
                  color: "#e8c547",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: bodyFont,
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading && (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(232,197,71,0.3)",
                      borderTopColor: "#e8c547",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                )}
                {loading ? copy.submitting : copy.submit}
              </button>
            </form>

            {/* Legal note */}
            <p
              style={{
                fontSize: 11,
                color: "#bbb",
                textAlign: "center",
                marginTop: "1.25rem",
                lineHeight: 1.7,
              }}
            >
              {copy.terms}{" "}
              <span style={{ color: "#185FA5", cursor: "pointer" }}>{copy.termsLink}</span>{" "}
              {copy.and}{" "}
              <span style={{ color: "#185FA5", cursor: "pointer" }}>{copy.privacyLink}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Responsive helpers */}
      <style>{`
        .left-panel-hide { display: flex; }
        .mobile-logo-show { display: none; }
        @media (max-width: 700px) {
          .left-panel-hide { display: none !important; }
          .mobile-logo-show { display: block !important; }
        }
      `}</style>
    </>
  );
}

// ── Tiny sub-components ───────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

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