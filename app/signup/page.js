"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./style.css";
export default function Signup() {
  const router = useRouter();
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
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
        credentials: "include", // ✅ Important: sends/receives cookies
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      // ✅ Store email for the verification page
    localStorage.setItem("pendingVerificationEmail", formData.email);
    
    // ✅ Redirect to "please verify your email" page
    router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-wrap">
        {/* ── Left Panel ── */}
        <div className="left-panel">
          <div>
              <Link
              href="/"
              style={{
                textDecoration: "none",
                fontFamily: "'Cairo', 'Tajawal', sans-serif",
                fontWeight: 500,
                fontSize: "26px",
                color: "#ffffff",
                letterSpacing: "1px",
              }}
            >
             مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span>
            </Link>

            <div className="left-dots">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
            <div
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 38,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1.25rem",
              }}
            >
              Your space,
              <br />
              your rules.
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.75,
              }}
            >
              Join thousands of users and hosts building meaningful connections
              through our platform.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { stat: "12,400+", label: "active listings", c: "#378ADD" },
              { stat: "98%", label: "satisfaction rate", c: "#e8c547" },
              { stat: "40+", label: "cities covered", c: "#1D9E75" },
            ].map(({ stat, label, c }) => (
              <div
                key={label}
                style={{ borderTop: `3px solid ${c}`, paddingTop: "0.8rem" }}
              >
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
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

        {/* ── Right Panel ── */}
        <div className="right-panel">
          <div className="form-wrap">
            {/* Mobile logo */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <div
                className="font-display fu"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: 22,
                  color: "#111118",
                  marginBottom: "2rem",
                }}
              >
                mar
                <span
                  style={{
                    fontStyle: "normal",
                    fontWeight: 500,
                    color: "#e8c547",
                  }}
                >
                  haba
                </span>
                <style>{`@media (min-width: 900px) { .hide-on-desktop { display: none !important; } }`}</style>
              </div>
            </Link>

            <div className="fu">
              <h1
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: 30,
                  color: "#111118",
                  marginBottom: 6,
                  lineHeight: 1.1,
                }}
              >
                Create account
              </h1>
              <p style={{ fontSize: 12, color: "#999", marginBottom: "2rem" }}>
                Already have one?{" "}
                <Link
                  href="/login"
                  style={{ color: "#185FA5", textDecoration: "none" }}
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Type toggle */}
            <div className="fu fu1" style={{ marginBottom: "1.5rem" }}>
              <div className="field-label" style={{ marginBottom: 8 }}>
                I want to join as
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
                    label: "Traveler",
                    desc: "Browse & book stays",
                  },
                  {
                    value: "host",
                    label: "Host",
                    desc: "List & manage properties",
                  },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, userType: value })
                    }
                    className={`type-btn ${formData.userType === value ? "active" : ""}`}
                  >
                    <div className="type-label">{label}</div>
                    <div className="type-desc">{desc}</div>
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
                  <label className="field-label">Full name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="field-input"
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="field-label">Email</label>
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
                  <label className="field-label">Phone number</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    className="field-input"
                    placeholder="+1 555 000 0000"
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
                    <label className="field-label">Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="field-input"
                      placeholder="min 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="field-label">Confirm</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="field-input"
                      placeholder="repeat"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "creating account..." : "create account →"}
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
              By signing up you agree to our{" "}
              <span style={{ color: "#185FA5", cursor: "pointer" }}>Terms</span>{" "}
              and{" "}
              <span style={{ color: "#185FA5", cursor: "pointer" }}>
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
