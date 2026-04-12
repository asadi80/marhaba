"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  

  useEffect(() => {
    const token = localStorage.getItem("MarhabaToken");
    const storedUserType = localStorage.getItem("userType");

    if (token && storedUserType) {
      try {
        // Decode JWT
        const payload = JSON.parse(atob(token.split(".")[1]));

        // exp is in seconds → convert to ms
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          // ❌ Token expired → logout
          localStorage.removeItem("MarhabaToken");
          localStorage.removeItem("userType");
          setIsLoggedIn(false);
          setUserType(null);
        } else {
          // ✅ Token valid
          setIsLoggedIn(true);
          setUserType(storedUserType);
        }
      } catch (err) {
        // ❌ Invalid token format
        localStorage.removeItem("MarhabaToken");
        localStorage.removeItem("userType");
        setIsLoggedIn(false);
        setUserType(null);
      }
    }
  }, []);

  const handleDashboardRedirect = () => {
    router.push(userType === "host" ? "/host-dashboard" : "/dashboard");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300;1,9..144,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Mono', monospace; background: #f7f6f2; color: #111118; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Fraunces', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .fu  { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .fu0 { animation-delay: 0.0s; }
        .fu1 { animation-delay: 0.1s; }
        .fu2 { animation-delay: 0.2s; }
        .fu3 { animation-delay: 0.3s; }
        .fu4 { animation-delay: 0.4s; }

        .nav-blur { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }

        .btn-primary {
          background: #e8c547; color: #1a1a2e;
          padding: 11px 24px; border-radius: 8px;
          font-size: 13px; font-family: 'DM Mono', monospace;
          font-weight: 500; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          border: none; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

        .btn-secondary {
          background: transparent; color: rgba(255,255,255,0.7);
          padding: 11px 24px; border-radius: 8px;
          font-size: 13px; font-family: 'DM Mono', monospace;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.15);
          display: inline-flex; align-items: center; gap: 6px;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        .btn-ghost {
          background: #fff; color: #111118;
          padding: 11px 24px; border-radius: 8px;
          font-size: 13px; font-family: 'DM Mono', monospace;
          text-decoration: none;
          border: 1px solid rgba(0,0,0,0.1);
          display: inline-flex; align-items: center; gap: 6px;
          transition: border-color 0.15s;
        }
        .btn-ghost:hover { border-color: rgba(0,0,0,0.25); }

        .feat-card {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.07);
          padding: 2rem; overflow: hidden;
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }

        .review-card {
          background: #fafaf8; border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.07); padding: 1.5rem;
          transition: box-shadow 0.2s;
        }
        .review-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

        .footer-link { color: #555; text-decoration: none; font-size: 12px; transition: color 0.15s; }
        .footer-link:hover { color: #e8c547; }

        .nav-link {
          font-size: 12px; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.15s;
        }
        .nav-link:hover { color: #fff; }

        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .hamburger span {
          display: block; width: 20px; height: 2px;
          background: rgba(255,255,255,0.7); border-radius: 2px;
          transition: all 0.2s;
        }

        .mobile-menu {
          display: none; position: fixed; top: 56px; left: 0; right: 0;
          background: #1a1a2e; border-bottom: 1px solid rgba(232,197,71,0.15);
          padding: 1rem 1.5rem; z-index: 40; flex-direction: column; gap: 12px;
        }
        .mobile-menu.open { display: flex; animation: fadeIn 0.2s ease; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1a1a2e; border: 1px solid rgba(232,197,71,0.2);
          border-radius: 20px; padding: 5px 14px; margin-bottom: 1.5rem;
        }

        .stat-item { border-top: 3px solid var(--c); padding-top: 1rem; }

        .perks-list { list-style: none; }
        .perks-list li {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; color: #444;
          padding: 7px 0; border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .perks-list li:last-child { border-bottom: none; }

        .check-circle {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--accent); display: inline-flex;
          align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .desktop-nav { display: none !important; }
          .hero-btns { flex-direction: column; align-items: stretch; }
          .hero-btns a, .hero-btns button { justify-content: center; }
          .stats-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .cards-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .cta-btns { flex-direction: column; align-items: stretch; }
          .cta-btns a { justify-content: center; text-align: center; }
          .path-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: clamp(36px, 9vw, 60px) !important; }
          .section-pad { padding: 3rem 1.25rem !important; }
          .cta-pad { padding: 2.5rem 1.5rem !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2" }}>
        {/* ── NAV ── */}
        <nav
          className="nav-blur"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(26,26,46,0.97)",
            borderBottom: "1px solid rgba(232,197,71,0.15)",
            padding: "0 1.5rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 22,
                color: "#fff",
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

          <div
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {isLoggedIn ? (
              <>
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginRight: 4,
                  }}
                >
                  welcome back
                </span>
                <button
                  onClick={handleDashboardRedirect}
                  className="btn-primary"
                  style={{ padding: "6px 16px" }}
                >
                  dashboard →
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="nav-link"
                  style={{ padding: "6px 14px" }}
                >
                  sign in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                  style={{ padding: "6px 16px" }}
                >
                  get started
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              style={{
                transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none",
              }}
            />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span
              style={{
                transform: menuOpen
                  ? "rotate(-45deg) translateY(-7px)"
                  : "none",
              }}
            />
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          {isLoggedIn ? (
            <button
              onClick={handleDashboardRedirect}
              className="btn-primary"
              style={{ justifyContent: "center" }}
            >
              dashboard →
            </button>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  padding: "8px 0",
                }}
              >
                sign in
              </Link>
              <Link
                href="/signup"
                className="btn-primary"
                style={{ justifyContent: "center" }}
              >
                get started
              </Link>
            </>
          )}
        </div>

        {/* ── HERO ── */}
        <section
          className="section-pad"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "6rem 1.5rem 4rem",
            textAlign: "center",
          }}
        >
          <div className="fu fu0 hero-badge">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#e8c547",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#e8c547",
              }}
            >
              your journey starts here
            </span>
          </div>

          <h1
            className="fu fu1 font-display hero-title"
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(42px, 7vw, 80px)",
              lineHeight: 1.05,
              color: "#111118",
              marginBottom: "1.25rem",
            }}
          >
            Travel smarter,
            <br />
            host{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 500,
                background: "#1a1a2e",
                color: "#e8c547",
                padding: "0 14px 2px",
                borderRadius: 8,
                display: "inline-block",
              }}
            >
              better.
            </span>
          </h1>

          <p
            className="fu fu2"
            style={{
              fontSize: 15,
              color: "#666",
              maxWidth: 480,
              margin: "0 auto 2.5rem",
              lineHeight: 1.75,
            }}
          >
            Whether you're looking for the perfect stay or want to share your
            space — Marhaba brings travelers and hosts together.
          </p>

          {!isLoggedIn && (
            <div
              className="fu fu3 hero-btns"
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/signup"
                style={{
                  background: "#1a1a2e",
                  color: "#e8c547",
                  padding: "13px 30px",
                  borderRadius: 10,
                  fontSize: 13,
                  textDecoration: "none",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "opacity 0.15s",
                }}
              >
                create account →
              </Link>
              <Link href="/login" className="btn-ghost">
                sign in
              </Link>
            </div>
          )}

          {/* Trust indicators */}
          <div
            className="fu fu4"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: "3rem",
              flexWrap: "wrap",
            }}
          >
            {["Verified hosts", "Secure payments", "24/7 support"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#888",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#1a1a2e",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1 4l2 2 4-4"
                      stroke="#e8c547"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section
          style={{
            background: "#1a1a2e",
            borderTop: "1px solid rgba(232,197,71,0.12)",
            borderBottom: "1px solid rgba(232,197,71,0.12)",
            padding: "2.5rem 1.5rem",
          }}
        >
          <div
            className="stats-grid"
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            {[
              { val: "10,000+", label: "happy travelers", c: "#378ADD" },
              { val: "5,000+", label: "active hosts", c: "#e8c547" },
              { val: "50,000+", label: "bookings made", c: "#1D9E75" },
            ].map(({ val, label, c }) => (
              <div key={label} className="stat-item" style={{ "--c": c }}>
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 38,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 6,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHOOSE PATH ── */}
        <section
          className="section-pad"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 1.5rem" }}
        >
          <div style={{ marginBottom: "3rem" }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#999",
                marginBottom: 8,
              }}
            >
              who are you?
            </div>
            <h2
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(28px, 4vw, 38px)",
                color: "#111118",
              }}
            >
              Choose your path
            </h2>
          </div>

          <div
            className="path-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                role: "Traveler",
                accent: "#378ADD",
                accentBg: "#E6F1FB",
                accentText: "#0C447C",
                tagline: "Discover spaces worth staying in.",
                desc: "Browse curated listings from trusted hosts. Book in seconds, travel with confidence.",
                perks: [
                  "Thousands of verified listings",
                  "Instant booking confirmation",
                  "Secure payments & refunds",
                  "24/7 support",
                ],
              },
              {
                role: "Host",
                accent: "#e8c547",
                accentBg: "#1a1a2e",
                accentText: "#e8c547",
                tagline: "Turn your space into income.",
                desc: "List your property, set your own rules, and meet travelers from around the world.",
                perks: [
                  "Free to list, no upfront cost",
                  "Set your own prices & rules",
                  "Manage everything in one place",
                  "Get paid reliably",
                ],
              },
            ].map(
              ({
                role,
                accent,
                accentBg,
                accentText,
                tagline,
                desc,
                perks,
              }) => (
                <div
                  key={role}
                  className="feat-card"
                  style={{ "--accent": accent }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 3,
                      background: accent,
                      borderRadius: 2,
                      marginBottom: "1.5rem",
                    }}
                  />
                  <span
                    style={{
                      display: "inline-block",
                      background: accentBg,
                      color: accentText,
                      fontSize: 11,
                      padding: "3px 12px",
                      borderRadius: 20,
                      marginBottom: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    {role}
                  </span>
                  <div
                    className="font-display"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: 26,
                      color: "#111118",
                      lineHeight: 1.2,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {tagline}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#777",
                      lineHeight: 1.7,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {desc}
                  </p>
                  <ul className="perks-list" style={{ marginBottom: "2rem" }}>
                    {perks.map((p) => (
                      <li key={p}>
                        <span className="check-circle">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
                            <path
                              d="M1 4l2 2 4-4"
                              stroke="#fff"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  {!isLoggedIn && (
                    <Link
                      href="/signup"
                      style={{
                        display: "block",
                        textAlign: "center",
                        background: accentBg,
                        color: accentText,
                        padding: "11px",
                        borderRadius: 10,
                        fontSize: 13,
                        textDecoration: "none",
                        fontFamily: "inherit",
                        transition: "opacity 0.15s",
                      }}
                    >
                      get started as {role.toLowerCase()} →
                    </Link>
                  )}
                </div>
              ),
            )}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section
          style={{
            background: "#fff",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            padding: "5rem 1.5rem",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ marginBottom: "3rem" }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: 8,
                }}
              >
                community
              </div>
              <h2
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(28px, 4vw, 38px)",
                  color: "#111118",
                }}
              >
                What people say
              </h2>
            </div>
            <div
              className="reviews-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  initials: "JD",
                  name: "John Doe",
                  role: "Traveler",
                  bg: "#E6F1FB",
                  color: "#0C447C",
                  quote:
                    "Found the perfect place for my vacation. Booking was effortless and the host was wonderful — exactly what I needed.",
                },
                {
                  initials: "JS",
                  name: "Jane Smith",
                  role: "Host",
                  bg: "#EEEDFE",
                  color: "#3C3489",
                  quote:
                    "I've been hosting for a year now. The platform handles everything and I've met some genuinely fascinating people.",
                },
                {
                  initials: "MR",
                  name: "Mike Ross",
                  role: "Traveler",
                  bg: "#EAF3DE",
                  color: "#27500A",
                  quote:
                    "Best booking platform I've used. The selection is wide, the interface is clean, and support actually responds.",
                },
              ].map(({ initials, name, role, bg, color, quote }) => (
                <div key={name} className="review-card">
                  <div
                    style={{ display: "flex", gap: 2, marginBottom: "1rem" }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="#e8c547"
                      >
                        <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.5 2.9 10l.6-3.3L1 4.3l3.6-.5L6 1z" />
                      </svg>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#555",
                      lineHeight: 1.75,
                      marginBottom: "1.25rem",
                    }}
                  >
                    "{quote}"
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: bg,
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111118",
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ fontSize: 11, color: "#999" }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        {!isLoggedIn && (
          <section
            style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 1.5rem" }}
          >
            <div
              className="cta-pad"
              style={{
                background: "#1a1a2e",
                borderRadius: 20,
                padding: "4rem 3rem",
                textAlign: "center",
                border: "1px solid rgba(232,197,71,0.15)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(232,197,71,0.6)",
                  marginBottom: 12,
                }}
              >
                ready?
              </div>
              <h2
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(28px, 5vw, 42px)",
                  color: "#fff",
                  marginBottom: "1rem",
                }}
              >
                Start your journey today.
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.4)",
                  maxWidth: 460,
                  margin: "0 auto 2rem",
                  lineHeight: 1.75,
                }}
              >
                Join Marhaba and discover unique stays or start earning from
                your own space — all in one platform.
              </p>
              <div
                className="cta-btns"
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/signup" className="btn-primary">
                  create account →
                </Link>
                <Link href="/login" className="btn-secondary">
                  sign in
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer
          style={{
            background: "#111118",
            borderTop: "1px solid rgba(232,197,71,0.08)",
            padding: "3rem 1.5rem 2rem",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div
              className="footer-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "2rem",
                marginBottom: "2.5rem",
              }}
            >
              <div>
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 20,
                    color: "#fff",
                    marginBottom: 10,
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
                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
                  Making travel experiences unforgettable since 2024.
                </p>
              </div>
              {[
                {
                  heading: "Travelers",
                  links: ["How to book", "Payment methods", "Travel tips"],
                },
                {
                  heading: "Hosts",
                  links: ["Start hosting", "Host resources", "Pricing tips"],
                },
                {
                  heading: "Support",
                  links: ["Help center", "Safety info", "Contact us"],
                },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#444",
                      marginBottom: 12,
                    }}
                  >
                    {heading}
                  </div>
                  <ul style={{ listStyle: "none" }}>
                    {links.map((l) => (
                      <li key={l} style={{ marginBottom: 8 }}>
                        <Link href="#" className="footer-link">
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <p style={{ fontSize: 11, color: "#333" }}>
                © 2024 Marhaba. All rights reserved.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                <Link href="#" className="footer-link">
                  Privacy
                </Link>
                <Link href="#" className="footer-link">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
