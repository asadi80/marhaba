"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HostCalendar from "@/components/HostCalendar";
import { useLanguage } from "@/hooks/useLanguage";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HostBookings() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === 'ar';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Font definitions
  const arabicFont = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont = "'DM Mono', monospace";
  const arabicDisplay = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont = isAr ? arabicFont : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  // Format currency function
  const formatCurrency = (amount) => {
    if (isAr) {
      return `${Math.round(amount).toLocaleString()} دينار`;
    }
    return `${Math.round(amount).toLocaleString()} LYD`;
  };
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setBookings(data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm(t.confirmBooking)) return;

    setActionLoading(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "confirm" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      fetchBookings();
      alert(t.bookingConfirmedSuccess);
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm(t.confirmCancelBooking)) return;

    setActionLoading(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      fetchBookings();
      alert(t.bookingCancelledSuccess);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getFiltered = () =>
    filter === "all" || filter === "calendar"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const formatDate = (s) => {
    const date = new Date(s);
    // Always use English date format
    return date.toLocaleDateString('en-US', {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const calcNights = (ci, co) => {
    const checkIn = new Date(ci);
    const checkOut = new Date(co);
    const checkInUTC = new Date(
      Date.UTC(
        checkIn.getUTCFullYear(),
        checkIn.getUTCMonth(),
        checkIn.getUTCDate(),
      ),
    );
    const checkOutUTC = new Date(
      Date.UTC(
        checkOut.getUTCFullYear(),
        checkOut.getUTCMonth(),
        checkOut.getUTCDate(),
      ),
    );
    return Math.ceil((checkOutUTC - checkInUTC) / 86400000);
  };

  const statusStyle = (s) =>
    ({
      confirmed: { bg: "#DCFCE7", color: "#166534" },
      pending: { bg: "#FEF9C3", color: "#713f12" },
      cancelled: { bg: "#FEE2E2", color: "#991b1b" },
    })[s] || { bg: "#F3F4F6", color: "#374151" };

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
            width: 40,
            height: 40,
            border: "3px solid #e8c547",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { 
          font-family: ${bodyFont} !important; 
          background: #f7f6f2; 
          color: #111118; 
          -webkit-font-smoothing: antialiased; 
        }
        .font-display { 
          font-family: ${displayFont} !important; 
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .fu { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fu0 { animation-delay: 0s; }
        .fu1 { animation-delay: 0.08s; }
        .fu2 { animation-delay: 0.16s; }

        .nav-blur { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }

        .nav-link { font-size:12px; color:rgba(255,255,255,0.5); text-decoration:none; padding:6px 12px; border-radius:6px; transition:color 0.15s, background 0.15s; }
        .nav-link:hover { color:#fff; background:rgba(255,255,255,0.06); }
        .nav-link.active { color:#e8c547; }

        .btn-primary {
          background:#e8c547; color:#1a1a2e;
          padding:9px 20px; border-radius:8px;
          font-size:12px; font-family:inherit; font-weight:500;
          text-decoration:none; display:inline-flex; align-items:center; gap:6px;
          border:none; cursor:pointer;
          transition:opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover { opacity:0.88; transform:translateY(-1px); }

        .filter-tab {
          padding:8px 16px; border:none; background:none;
          font-family:inherit; font-size:12px; cursor:pointer;
          color:#888; border-bottom:2px solid transparent;
          transition:color 0.15s, border-color 0.15s;
          display:inline-flex; align-items:center; gap:6px;
          white-space:nowrap;
        }
        .filter-tab:hover { color:#111118; }
        .filter-tab.active { color:#1a1a2e; border-bottom-color:#e8c547; }

        .booking-card {
          background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:14px;
          padding:1.25rem 1.5rem; transition:box-shadow 0.2s, transform 0.2s;
        }
        .booking-card:hover { box-shadow:0 10px 32px rgba(0,0,0,0.07); transform:translateY(-2px); }

        .action-btn {
          padding:8px 16px; border-radius:8px; font-size:12px;
          font-family:inherit; font-weight:500; cursor:pointer;
          border:none; display:inline-flex; align-items:center; gap:5px;
          transition:opacity 0.15s, transform 0.15s;
        }
        .action-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

        .hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
        .hamburger span { display:block; width:20px; height:2px; background:rgba(255,255,255,0.7); border-radius:2px; transition:all 0.2s; }
        .mobile-menu { display:none; position:fixed; top:56px; left:0; right:0; background:#1a1a2e; border-bottom:1px solid rgba(232,197,71,0.15); padding:1rem 1.5rem; z-index:40; flex-direction:column; gap:10px; }
        .mobile-menu.open { display:flex; animation:fadeIn 0.2s ease; }
        .stats-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }

        button, select, input, textarea {
          font-family: inherit;
        }

        @media (max-width: 900px) {
          .stats-bar { grid-template-columns:repeat(2,1fr); }
          .booking-inner { flex-direction:column !important; }
          .action-col { flex-direction:row !important; margin-top:1rem; }
        }
        @media (max-width: 640px) {
          .hamburger { display:flex; }
          .desktop-nav { display:none !important; }
          .stats-bar { grid-template-columns:1fr 1fr; }
          .filter-tabs { overflow-x:auto; }
          .meta-grid { grid-template-columns:1fr 1fr !important; }
          .section-inner { padding:1.25rem !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
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
              mar<span style={{ fontWeight: 700, color: "#e8c547" }}>haba</span>
            </Link>

          <div
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <Link href="/host-dashboard" className="nav-link">
              {t.overview}
            </Link>
            <Link href="/host/listings" className="nav-link">
              {t.myListings}
            </Link>
            <Link href="/host/bookings" className="nav-link active">
              {t.bookings}
            </Link>
            
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              style={{
                background: "rgba(232,197,71,0.15)",
                border: "1px solid rgba(232,197,71,0.3)",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                cursor: "pointer",
                color: "#e8c547",
                fontFamily: "inherit",
                marginLeft: 8,
              }}
            >
              {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
            </button>
            
            <div
              style={{
                width: 1,
                height: 16,
                background: "rgba(255,255,255,0.12)",
                margin: "0 6px",
              }}
            />
            <button
              onClick={() => router.push("/host-dashboard")}
              className="btn-primary"
              style={{ padding: "6px 14px" }}
            >
              {t.dashboard} →
            </button>
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
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

        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          {/* Language Toggle in Mobile Menu */}
          <button
            onClick={toggleLanguage}
            style={{
              background: "rgba(232,197,71,0.15)",
              border: "1px solid rgba(232,197,71,0.3)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              cursor: "pointer",
              color: "#e8c547",
              fontFamily: "inherit",
              width: "100%",
              marginBottom: 8,
            }}
          >
            {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
          </button>
          <Link
            href="/host-dashboard"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              padding: "8px 0",
            }}
          >
            {t.overview}
          </Link>
          <Link
            href="/host/listings"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              padding: "8px 0",
            }}
          >
            {t.myListings}
          </Link>
          <Link
            href="/host/bookings"
            style={{
              fontSize: 13,
              color: "#e8c547",
              textDecoration: "none",
              padding: "8px 0",
            }}
          >
            {t.bookings}
          </Link>
        </div>

        {/* ── PAGE HEADER ── */}
        <div
          style={{
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(232,197,71,0.12)",
            padding: "2.5rem 1.5rem 2rem",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div
              className="fu fu0"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(232,197,71,0.6)",
                marginBottom: 8,
              }}
            >
              {t.hostPanel}
            </div>
            <h1
              className="fu fu1 font-display"
              style={{
                fontStyle: isAr ? "normal" : "italic",
                fontWeight: 300,
                fontSize: "clamp(28px,4vw,38px)",
                color: "#fff",
                marginBottom: "1.75rem",
              }}
            >
              {t.bookingsTitle}{" "}
              <span style={{ fontWeight: 500, color: "#e8c547" }}>
                {t.management}
              </span>
            </h1>

            {/* Stats bar */}
            <div className="fu fu2 stats-bar">
              {[
                {
                  label: t.total,
                  val: bookings.length,
                  c: "rgba(255,255,255,0.2)",
                },
                {
                  label: t.confirmed,
                  val: bookings.filter((b) => b.status === "confirmed").length,
                  c: "#1D9E75",
                },
                {
                  label: t.pending,
                  val: bookings.filter((b) => b.status === "pending").length,
                  c: "#e8c547",
                },
                {
                  label: t.cancelled,
                  val: bookings.filter((b) => b.status === "cancelled").length,
                  c: "#e05a5a",
                },
              ].map(({ label, val, c }) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderTop: `3px solid ${c}`,
                    borderRadius: 10,
                    padding: "0.875rem 1rem",
                  }}
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
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      marginTop: 4,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <main
          style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}
        >
          {/* Filter tabs */}
          <div
            className="filter-tabs"
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              marginBottom: "1.5rem",
              overflowX: "auto",
            }}
          >
            {[
              { id: "all", label: t.allBookings },
              { id: "confirmed", label: t.confirmed },
              { id: "pending", label: t.pending },
              { id: "cancelled", label: t.cancelled },
              { id: "calendar", label: `📅 ${t.calendarView}` },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`filter-tab ${filter === id ? "active" : ""}`}
              >
                {label}
                {!["all", "calendar"].includes(id) && (
                  <span
                    style={{
                      fontSize: 10,
                      background:
                        filter === id ? "#1a1a2e" : "rgba(0,0,0,0.06)",
                      color: filter === id ? "#e8c547" : "#888",
                      padding: "1px 7px",
                      borderRadius: 20,
                    }}
                  >
                    {bookings.filter((b) => b.status === id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                padding: "12px 16px",
                borderRadius: 10,
                marginBottom: "1rem",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* Calendar View */}
          {filter === "calendar" ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.07)",
                padding: "1.5rem",
              }}
              className="section-inner"
            >
              <HostCalendar
                bookings={bookings}
                onConfirmBooking={handleConfirmBooking}
                onCancelBooking={handleCancelBooking}
              />
            </div>
          ) : getFiltered().length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.07)",
                padding: "4rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13, color: "#999" }}>{t.noBookingsFound}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {getFiltered().map((booking, idx) => {
                const ss = statusStyle(booking.status);
                const nights = calcNights(booking.checkIn, booking.checkOut);
                const isLoading = actionLoading === booking._id;
                return (
                  <div
                    key={booking._id}
                    className="booking-card fu"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div
                      className="booking-inner"
                      style={{
                        display: "flex",
                        gap: "1.5rem",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Left: info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: 15,
                              fontWeight: 500,
                              color: "#111118",
                            }}
                          >
                            {booking.listing?.title || t.listing}
                          </h3>
                          <span
                            style={{
                              fontSize: 10,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: ss.bg,
                              color: ss.color,
                              fontWeight: 500,
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            {booking.status === "confirmed" && t.confirmed}
                            {booking.status === "pending" && t.pending}
                            {booking.status === "cancelled" && t.cancelled}
                          </span>
                        </div>

                        {/* Guest info */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.375rem 1.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          {[
                            [t.guest, booking.user?.name || t.guestName],
                            [t.email, booking.user?.email],
                            [t.phone, booking.user?.phoneNumber],
                            [t.location, booking.listing?.location],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <span
                                style={{
                                  fontSize: 10,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  color: "#bbb",
                                }}
                              >
                                {label}{" "}
                              </span>
                              <span style={{ fontSize: 12, color: "#555" }}>
                                {val || "—"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Date / nights / guests / price */}
                        <div
                          className="meta-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4,1fr)",
                            gap: "0.75rem",
                            borderTop: "1px solid rgba(0,0,0,0.05)",
                            paddingTop: "0.875rem",
                          }}
                        >
                          {[
                            [t.checkIn, formatDate(booking.checkIn)],
                            [t.checkOut, formatDate(booking.checkOut)],
                            [
                              t.nights,
                              `${nights} ${nights !== 1 ? t.nights : t.night}`,
                            ],
                            [
                              t.guests,
                              `${booking.guests} ${booking.guests !== 1 ? t.guests : t.guest}`,
                            ],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <div
                                style={{
                                  fontSize: 10,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  color: "#bbb",
                                  marginBottom: 2,
                                }}
                              >
                                {label}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#333",
                                }}
                              >
                                {val}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            marginTop: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "#bbb",
                            }}
                          >
                            {t.total}
                          </span>
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 500,
                              color: "#1a1a2e",
                            }}
                          >
                            {formatCurrency(booking.totalPrice)}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#bbb",
                              marginLeft: "auto",
                            }}
                          >
                            {t.booked} {formatDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div
                        className="action-col"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          flexShrink: 0,
                          minWidth: 140,
                        }}
                      >
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleConfirmBooking(booking._id)}
                              disabled={isLoading}
                              className="action-btn"
                              style={{
                                background: "#1a1a2e",
                                color: "#e8c547",
                                justifyContent: "center",
                              }}
                            >
                              {isLoading ? <Spinner /> : `✓ ${t.confirm}`}
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={isLoading}
                              className="action-btn"
                              style={{
                                background: "#FEE2E2",
                                color: "#991b1b",
                                justifyContent: "center",
                              }}
                            >
                              {isLoading ? <Spinner dark /> : `✗ ${t.cancel}`}
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={isLoading}
                            className="action-btn"
                            style={{
                              background: "#FEE2E2",
                              color: "#991b1b",
                              justifyContent: "center",
                            }}
                          >
                            {isLoading ? <Spinner dark /> : t.cancel}
                          </button>
                        )}
                        {booking.status === "cancelled" && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#bbb",
                              textAlign: "center",
                              padding: "8px 0",
                            }}
                          >
                            {t.cancelled}
                          </div>
                        )}
                        <Link
                          href={`/listings/${booking.listing?._id}`}
                          style={{
                            background: "rgba(0,0,0,0.04)",
                            color: "#555",
                            textDecoration: "none",
                            textAlign: "center",
                            padding: "8px 16px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontFamily: "inherit",
                            border: "1px solid rgba(0,0,0,0.08)",
                            transition: "background 0.15s",
                          }}
                        >
                          {t.viewListing}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function Spinner({ dark }) {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        border: `2px solid ${dark ? "#991b1b" : "#e8c547"}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}