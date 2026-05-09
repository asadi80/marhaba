"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./style.css";

function VerificationNotice({ email, onResend }) {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            Please verify your email address before logging in.
            <button
              onClick={onResend}
              className="ml-2 font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Resend verification email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // useEffect(() => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("userType");
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect based on role
        const role = data.user?.role;
        if (role === "admin" || role === "super_admin") {
          router.push("/admin");
        } else if (role === "host") {
          router.push("/host-dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-wrap">
        {/* ── Left Panel ── */}
        <div className="left-panel">
          <div className="panel-deco" />
          <div className="panel-deco2" />

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


          <div>
            <div
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 38,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: "1rem",
              }}
            >
              Good to see
              <br />
              you again.
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.75,
              }}
            >
              Sign in to manage your bookings, listings, and account settings.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { val: "10,000+", label: "active travelers", c: "#378ADD" },
              { val: "5,000+", label: "trusted hosts", c: "#e8c547" },
              { val: "98%", label: "satisfaction rate", c: "#1D9E75" },
            ].map(({ val, label, c }) => (
              <div
                key={label}
                style={{ borderTop: `3px solid ${c}`, paddingTop: "0.8rem" }}
              >
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 26,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 4,
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
            <div className="mobile-logo">
              <Link href="/" style={{ textDecoration: "none" }}>
                <div
                  className="font-display fu"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 22,
                    color: "#111118",
                    marginBottom: "2.5rem",
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
                </div>
              </Link>
            </div>

            <div className="fu fu1">
              <h1
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: 32,
                  color: "#111118",
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                Welcome back.
              </h1>
              <p style={{ fontSize: 12, color: "#999", marginBottom: "2rem" }}>
                No account yet?{" "}
                <Link
                  href="/signup"
                  style={{ color: "#185FA5", textDecoration: "none" }}
                >
                  Sign up free
                </Link>
              </p>
            </div>

            {error && (
              <div className="error-box fu">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle
                    cx="7"
                    cy="7"
                    r="6"
                    stroke="#A32D2D"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M7 4v3.5M7 9.5h.01"
                    stroke="#A32D2D"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="fu fu2">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginBottom: "1.75rem",
                }}
              >
                <div>
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    required
                    className="field-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <label className="field-label" style={{ margin: 0 }}>
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      style={{
                        fontSize: 11,
                        color: "#185FA5",
                        textDecoration: "none",
                      }}
                    >
                      forgot?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    className="field-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "signing in..." : "sign in →"}
              </button>
            </form>

            <div
              className="fu fu3"
              style={{ marginTop: "1.75rem", textAlign: "center" }}
            >
              <div className="security-tag">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M5 1L1.5 2.5v3C1.5 7.4 3 8.8 5 9.5c2-0.7 3.5-2.1 3.5-4V2.5L5 1z"
                    stroke="#0F6E56"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
                Protected by industry-standard encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
