"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./style.css"

export default function HostDashboard() {
 
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [userRes, listingsRes, bookingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/host/listings"),
          fetch("/api/bookings"),
        ]);
        const userData = await userRes.json();
        const listingsData = await listingsRes.json();
        const bookingsData = await bookingsRes.json();
        setUser(userData.user);
        const confirmed = bookingsData.bookings.filter(
          (b) => b.status === "confirmed",
        );
        setStats({
          totalListings: listingsData.listings.length,
          totalBookings: bookingsData.bookings.length,
          confirmedBookings: confirmed.length,
          totalEarnings: confirmed.reduce((s, b) => s + b.totalPrice, 0),
          rating: userData.user.hostDetails?.rating || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    ["marhabaToken", "userType", "userData"].forEach((k) =>
      localStorage.removeItem(k),
    );
    router.push("/login");
  };

  const AVATAR_PAL = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#FBEAF0", color: "#72243E" },
  ];
  const avi = (name) =>
    AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];
 

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f2",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2.5px solid #1a1a2e",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  console.log(user);

  if (user?.role === "host" && user?.status === "pending") {
    const isExpired = user?.statusReason === "expired";

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f2",
          flexDirection: "column",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: 10 }}>
          {isExpired ? "Subscription Expired" : "Account Pending Approval"}
        </h2>

        <p style={{ color: "#777", maxWidth: 400 }}>
          {isExpired
            ? "Your 6-month hosting period has ended. Please renew your subscription to continue managing listings."
            : "Your host account is under review. You cannot add or manage listings yet."}
        </p>
      </div>
    );
  }

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "H";
  const { bg: aviBg, color: aviColor } = avi(user?.name);
  const avgPerBooking = stats.totalEarnings / (stats.confirmedBookings || 1);
  const pendingCount = stats.totalBookings - stats.confirmedBookings;

  const NAV_LINKS = [
    { href: "/host-dashboard", label: "overview" },
    { href: "/host/listings", label: "my listings" },
    { href: "/host/bookings", label: "bookings" },
  ];

  const STAT_CARDS = [
    { label: "active listings", value: stats.totalListings, accent: "#378ADD" },
    {
      label: "total bookings",
      value: stats.totalBookings,
      sub: `${stats.confirmedBookings} confirmed`,
      accent: "#7F77DD",
    },
    {
      label: "total earnings",
      value: `$${stats.totalEarnings.toLocaleString()}`,
      sub: "confirmed only",
      accent: "#1D9E75",
    },
    { label: "host rating", value: stats.rating.toFixed(1), accent: "#e8c547" },
  ];

  const SUMMARY_CARDS = [
    {
      label: "confirmed",
      value: stats.confirmedBookings,
      sub: "ready for guests",
      sBg: "#EAF3DE",
      sColor: "#27500A",
      bColor: "#1D9E75",
    },
    {
      label: "pending",
      value: pendingCount,
      sub: "awaiting action",
      sBg: "#FAEEDA",
      sColor: "#633806",
      bColor: "#BA7517",
    },
    {
      label: "avg/booking",
      value: `$${Math.round(avgPerBooking)}`,
      sub: "from confirmed",
      sBg: "#E6F1FB",
      sColor: "#0C447C",
      bColor: "#378ADD",
    },
  ];

  const ACTION_CARDS = [
    {
      href: "/host/listings",
      label: "manage listings",
      desc: "Create, edit, and manage your properties",
      accent: "#7F77DD",
    },
    {
      href: "/host/bookings",
      label: "view bookings",
      desc: "See all upcoming and past bookings",
      accent: "#1D9E75",
    },
  ];

  return (
    <>
    

      <div style={{ minHeight: "100vh", background: "#f7f6f2" }}>
        {/* NAV */}
        <nav
          style={{
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(232,197,71,0.15)",
            padding: "0 1.5rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: 20,
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
              className="desktop-nav-links"
              style={{ display: "flex", gap: 2 }}
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="nav-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className="desktop-user-info"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: aviBg,
                color: aviColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {userInitials}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {user?.name}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#e8c547",
                background: "rgba(232,197,71,0.1)",
                border: "1px solid rgba(232,197,71,0.25)",
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              host
            </span>
            <button onClick={handleLogout} className="logout-btn">
              logout
            </button>
          </div>

          <button
            className="hamburger"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Menu"
          >
            <span
              style={{
                transform: mobileNavOpen
                  ? "rotate(45deg) translateY(7px)"
                  : "none",
              }}
            />
            <span style={{ opacity: mobileNavOpen ? 0 : 1 }} />
            <span
              style={{
                transform: mobileNavOpen
                  ? "rotate(-45deg) translateY(-7px)"
                  : "none",
              }}
            />
          </button>
        </nav>

        {/* Mobile nav */}
        <div className={`mobile-nav-menu ${mobileNavOpen ? "open" : ""}`}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="mobile-nav-link"
              onClick={() => setMobileNavOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div
            style={{
              paddingTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: aviBg,
                  color: aviColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {userInitials}
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {user?.name}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              logout
            </button>
          </div>
        </div>

        <main
          className="main-pad"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "1.75rem 1.5rem",
          }}
        >
          {/* PROFILE STRIP */}
          <div
            className="fu profile-strip"
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "1.25rem 1.5rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: aviBg,
                  color: aviColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </div>
              <div>
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 22,
                    color: "#111118",
                    lineHeight: 1.1,
                  }}
                >
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                  host account
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                  Expiry Date:{" "}
                  {new Date(user?.hostExpiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Link
              href="/host/listings"
              style={{
                background: "#1a1a2e",
                color: "#e8c547",
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 12,
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              + new listing
            </Link>
          </div>

          {/* STAT CARDS */}
          <div
            className="fu fu1 stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: "1.25rem",
            }}
          >
            {STAT_CARDS.map(({ label, value, accent, sub }) => (
              <div
                key={label}
                className="stat-card"
                style={{ "--accent": accent }}
              >
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 30,
                    color: "#111118",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#999",
                  }}
                >
                  {label}
                </div>
                {sub && (
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>
                    {sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* BOOKING SUMMARY */}
          <div
            className="fu fu2"
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.07)",
              padding: "1.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: 20,
                  color: "#111118",
                }}
              >
                booking summary
              </div>
              <Link
                href="/host/bookings"
                style={{
                  fontSize: 12,
                  color: "#185FA5",
                  textDecoration: "none",
                }}
              >
                view all →
              </Link>
            </div>
            {isExpiringSoon && (
              <div
                style={{
                  background: "#FAEEDA",
                  color: "#633806",
                  padding: "10px",
                  borderRadius: "8px",
                  textAlign: "center",
                  marginBottom: "12px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                ⚠ Your subscription is about to expire soon
              </div>
            )}
            <div
              className="summary-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              {SUMMARY_CARDS.map(
                ({ label, value, sub, sBg, sColor, bColor }) => (
                  <div
                    key={label}
                    className="summary-card"
                    style={{ "--bColor": bColor, background: sBg }}
                  >
                    <div
                      className="font-display"
                      style={{
                        fontStyle: "italic",
                        fontWeight: 300,
                        fontSize: 28,
                        color: sColor,
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: sColor,
                        opacity: 0.85,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: sColor,
                        opacity: 0.55,
                        marginTop: 4,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="fu fu3">
            <div
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 20,
                color: "#111118",
                marginBottom: "1rem",
              }}
            >
              quick actions
            </div>
          </div>
          <div
            className="fu fu4 action-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {ACTION_CARDS.map(({ href, label, desc, accent }) => (
              <Link
                key={href}
                href={href}
                className="action-card"
                style={{ "--accent": accent }}
              >
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 20,
                    color: "#111118",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </div>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                  {desc}
                </p>
                <div
                  style={{
                    fontSize: 12,
                    color: accent,
                    marginTop: "1rem",
                    fontWeight: 500,
                  }}
                >
                  go →
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
