"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import "./style.css";

export default function Signup() {
  const router = useRouter();
  const { lang, t, toggleLanguage, isLoading: langLoading } = useLanguage();
  const isAr = lang === 'ar';
  
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

  // Font definitions
  const arabicFont = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont = "'DM Mono', monospace";
  const arabicDisplay = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont = isAr ? arabicFont : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(isAr ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError(isAr ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" : "Password must be at least 6 characters");
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

  if (langLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: ${bodyFont} !important;
          background: #f7f6f2;
          margin: 0;
          padding: 0;
        }
        
        .page-wrap {
          min-height: 100vh;
          display: flex;
          background: #f7f6f2;
        }
        
        .left-panel {
          width: 42%;
          background: linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%);
          padding: 2rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        
        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .form-wrap {
          max-width: 460px;
          width: 100%;
        }
        
        .field-label {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 4px;
          display: block;
        }
        
        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: #fff;
          font-family: inherit;
        }
        
        .field-input:focus {
          outline: none;
          border-color: #e8c547;
          box-shadow: 0 0 0 2px rgba(232,197,71,0.1);
        }
        
        .type-btn {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .type-btn.active {
          border-color: #e8c547;
          background: rgba(232,197,71,0.05);
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        
        .type-label {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .type-desc {
          font-size: 11px;
          color: #999;
        }
        
        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #1a1a2e;
          color: #e8c547;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #2a2a3e;
          transform: translateY(-1px);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error-box {
          background: #fee2e2;
          border-left: 3px solid #dc2626;
          padding: 12px;
          font-size: 12px;
          color: #991b1b;
          margin-bottom: 1rem;
          border-radius: 6px;
        }
        
        .mobile-logo {
          display: none;
          margin-bottom: 2rem;
        }
        
        .language-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100;
          background: rgba(26,26,46,0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(232,197,71,0.3);
          border-radius: 8px;
          padding: 8px 16px;
          color: #e8c547;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .language-toggle:hover {
          background: rgba(26,26,46,1);
        }
        
        @media (max-width: 768px) {
          .left-panel {
            display: none;
          }
          .right-panel {
            width: 100%;
            padding: 1.5rem;
          }
          .mobile-logo {
            display: block;
          }
        }
      `}</style>

      {/* Language Toggle Button */}
      <button onClick={toggleLanguage} className="language-toggle">
        {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
      </button>

      <div className="page-wrap" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        {/* Left Panel */}
        <div className="left-panel">
          <div>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'Fraunces', serif",
                fontWeight: 500,
                fontSize: "26px",
                color: "#ffffff",
                letterSpacing: "1px",
              }}
            >
              {isAr ? "مر" : "mar"}
              <span style={{ fontWeight: 700, color: "#e8c547" }}>
                {isAr ? "حبا" : "haba"}
              </span>
            </Link>

            <div
              className="font-display"
              style={{
                fontStyle: isAr ? "normal" : "italic",
                fontWeight: 300,
                fontSize: 38,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1.25rem",
                marginTop: "2rem",
              }}
            >
              {isAr ? "مساحتك،" : "Your space,"}
              <br />
              {isAr ? "قواعدك." : "your rules."}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.75,
              }}
            >
              {isAr 
                ? "انضم إلى آلاف المستخدمين والمضيفين الذين يبنون روابط ذات مغزى من خلال منصتنا."
                : "Join thousands of users and hosts building meaningful connections through our platform."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { stat: "12,400+", labelEn: "active listings", labelAr: "قائمة نشطة", c: "#378ADD" },
              { stat: "98%", labelEn: "satisfaction rate", labelAr: "معدل الرضا", c: "#e8c547" },
              { stat: "40+", labelEn: "cities covered", labelAr: "مدن مغطاة", c: "#1D9E75" },
            ].map(({ stat, labelEn, labelAr, c }) => (
              <div
                key={labelEn}
                style={{ borderTop: `3px solid ${c}`, paddingTop: "0.8rem" }}
              >
                <div
                  className="font-display"
                  style={{
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
                  {isAr ? labelAr : labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="form-wrap">
            {/* Mobile logo */}
            <div className="mobile-logo">
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'Fraunces', serif",
                  fontWeight: 500,
                  fontSize: "26px",
                  color: "#1a1a2e",
                  letterSpacing: "1px",
                }}
              >
                {isAr ? "مر" : "mar"}
                <span style={{ fontWeight: 700, color: "#e8c547" }}>
                  {isAr ? "حبا" : "haba"}
                </span>
              </Link>
            </div>

            <div className="fu">
              <h1
                className="font-display"
                style={{
                  fontStyle: isAr ? "normal" : "italic",
                  fontWeight: 300,
                  fontSize: 30,
                  color: "#111118",
                  marginBottom: 6,
                  lineHeight: 1.1,
                }}
              >
                {isAr ? "إنشاء حساب" : "Create account"}
              </h1>
              <p style={{ fontSize: 12, color: "#999", marginBottom: "2rem" }}>
                {isAr ? "لديك حساب بالفعل؟" : "Already have one?"}{" "}
                <Link
                  href="/login"
                  style={{ color: "#185FA5", textDecoration: "none" }}
                >
                  {isAr ? "تسجيل الدخول" : "Sign in"}
                </Link>
              </p>
            </div>

            {/* Type toggle */}
            <div className="fu fu1" style={{ marginBottom: "1.5rem" }}>
              <div className="field-label" style={{ marginBottom: 8 }}>
                {isAr ? "أريد الانضمام كـ" : "I want to join as"}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {[
                  {
                    value: "user",
                    labelEn: "Traveler",
                    labelAr: "مسافر",
                    descEn: "Browse & book stays",
                    descAr: "تصفح واحجز الإقامات",
                  },
                  {
                    value: "host",
                    labelEn: "Host",
                    labelAr: "مضيف",
                    descEn: "List & manage properties",
                    descAr: "أدر وجدول العقارات",
                  },
                ].map(({ value, labelEn, labelAr, descEn, descAr }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, userType: value })
                    }
                    className={`type-btn ${formData.userType === value ? "active" : ""}`}
                  >
                    <div className="type-label">{isAr ? labelAr : labelEn}</div>
                    <div className="type-desc">{isAr ? descAr : descEn}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="fu fu2">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label className="field-label">{isAr ? "الاسم الكامل" : "Full name"}</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="field-input"
                    placeholder={isAr ? "جين سميث" : "Jane Smith"}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="field-label">{isAr ? "البريد الإلكتروني" : "Email"}</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="field-input"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="field-label">{isAr ? "رقم الهاتف" : "Phone number"}</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    className="field-input"
                    placeholder={isAr ? "+1 555 000 0000" : "+1 555 000 0000"}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div
                  className="pw-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <label className="field-label">{isAr ? "كلمة المرور" : "Password"}</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="field-input"
                      placeholder={isAr ? "6 أحرف على الأقل" : "min 6 chars"}
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="field-label">{isAr ? "تأكيد كلمة المرور" : "Confirm"}</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="field-input"
                      placeholder={isAr ? "أعد كتابة كلمة المرور" : "repeat"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading 
                  ? (isAr ? "جاري إنشاء الحساب..." : "creating account...") 
                  : (isAr ? "إنشاء حساب ←" : "create account →")}
              </button>
            </form>

            <p
              className="fu fu3"
              style={{
                fontSize: 11,
                color: "#bbb",
                textAlign: "center",
                marginTop: "1.5rem",
              }}
            >
              {isAr ? "بالتسجيل، أنت توافق على" : "By signing up you agree to our"}{" "}
              <span style={{ color: "#185FA5", cursor: "pointer" }}>
                {isAr ? "الشروط" : "Terms"}
              </span>{" "}
              {isAr ? "و" : "and"}{" "}
              <span style={{ color: "#185FA5", cursor: "pointer" }}>
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}