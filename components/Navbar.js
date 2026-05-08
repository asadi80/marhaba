"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";

export default function Navbar({ NAV_LINKS }) {
  const { lang, t, toggleLanguage } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
  };

  return (
    <>
      <nav style={navStyle}>
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={logoStyle}>
              mar<span style={{ fontWeight: 500, color: "#e8c547" }}>haba</span>
            </div>
          </Link>

          <div className="desktop-nav" style={{ display: "flex", gap: 6 }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <div style={linkStyle}>{label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="desktop-nav" style={{ display: "flex", gap: 10 }}>
          <button onClick={toggleLanguage} style={langBtn}>
            {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
          </button>

          <Link href="/listings" style={smallLink}>
            {t.allListings}
          </Link>

          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        </div>

        {/* HAMBURGER */}
        <button
          className="hamburger"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          ☰
        </button>
      </nav>

      {/* MOBILE */}
      <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}>
        <button onClick={toggleLanguage}>{lang === "en" ? "AR" : "EN"}</button>

        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}

/* styles (keep yours or move to css) */
const navStyle = {
  background: "#1a1a2e",
  padding: "0 1.5rem",
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const logoStyle = {
  fontStyle: "italic",
  fontWeight: 300,
  fontSize: 20,
  color: "#fff",
};

const linkStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  fontSize: 13,
  color: "rgba(255,255,255,0.65)",
};

const langBtn = {
  background: "rgba(232,197,71,0.15)",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 11,
  color: "#e8c547",
};

const smallLink = {
  fontSize: 12,
  color: "rgba(255,255,255,0.5)",
};

const logoutBtn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 6,
  padding: "5px 10px",
  color: "#fff",
};