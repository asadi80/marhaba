"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HostCalendar from "@/components/HostCalendar";
import { useLanguage } from "@/hooks/useLanguage";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";

export default function HostBookings() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [user, setUser] = useState(null);

  const formatCurrency = (amount) =>
    isAr
      ? `${Math.round(amount).toLocaleString()} دينار`
      : `${Math.round(amount).toLocaleString()} LYD`;

  useEffect(() => {
    fetchBookings();
    fetchUser();
  }, []);
  const fetchUser = async () => {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    if (data.user) setUser(data.user); // ← this line is correct, make sure it's there
  } catch {}
};

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm(t.confirmBooking)) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchBookings();
      alert(t.bookingConfirmedSuccess);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm(t.confirmCancelBooking)) return;
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchBookings();
      alert(t.bookingCancelledSuccess);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getFiltered = () =>
    filter === "all" || filter === "calendar"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const formatDate = (s) =>
    new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

  const calcNights = (ci, co) => {
    const a = new Date(ci),
      b = new Date(co);
    return Math.ceil(
      (Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate()) -
        Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())) /
        86400000,
    );
  };

  // exact colours from original
  const statusBadgeCls = (s) =>
    ({
      confirmed: "bg-[#DCFCE7] text-[#166534]",
      pending: "bg-[#FEF9C3] text-[#713f12]",
      cancelled: "bg-[#FEE2E2] text-[#991b1b]",
    })[s] || "bg-[#F3F4F6] text-[#374151]";

  const STAT_CARDS = [
    { label: t.total, val: bookings.length, borderTop: "border-t-white/20" },
    {
      label: t.confirmed,
      val: bookings.filter((b) => b.status === "confirmed").length,
      borderTop: "border-t-[#1D9E75]",
    },
    {
      label: t.pending,
      val: bookings.filter((b) => b.status === "pending").length,
      borderTop: "border-t-[#e8c547]",
    },
    {
      label: t.cancelled,
      val: bookings.filter((b) => b.status === "cancelled").length,
      borderTop: "border-t-[#e05a5a]",
    },
  ];

  const FILTER_TABS = [
    { id: "all", label: t.allBookings },
    { id: "confirmed", label: t.confirmed },
    { id: "pending", label: t.pending },
    { id: "cancelled", label: t.cancelled },
    { id: "calendar", label: `📅 ${t.calendarView}` },
  ];
const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "H";
      console.log(userInitials);
      

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .fu  { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fu0 { animation-delay:0s; }
        .fu1 { animation-delay:.08s; }
        .fu2 { animation-delay:.16s; }
        .display-font { font-family: ${isAr ? "'Cairo','Tajawal',sans-serif" : "'Fraunces',serif"} !important; }
        .body-font    { font-family: ${isAr ? "'Cairo','Tajawal','Almarai','IBM Plex Sans Arabic',sans-serif" : "'DM Mono',monospace"} !important; }
        .tabs-scroll::-webkit-scrollbar { display:none; }
        .tabs-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div
        className="min-h-screen bg-[#f7f6f2] body-font"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* ── NAV ── */}
        <Navbar
          NAV_LINKS={[
            { id: "overview", label: t.overview, href: "/host-dashboard" },
            { id: "listings", label: t.myListings, href: "/host/listings" },
            { id: "bookings", label: t.bookings, href: "/host/bookings" },
          ]}
          user={user}
          ini={userInitials}
          lang={lang}
          toggleLanguage={toggleLanguage}
          defaultActiveId="bookings"
        />

        {/* ── PAGE HEADER ── */}
        <div className="bg-[#1a1a2e] border-b border-[rgba(232,197,71,0.12)] px-6 pt-10 pb-8">
          <div className="max-w-[1100px] mx-auto">
            <div className="fu fu0 text-[10px] tracking-[0.12em] uppercase text-[rgba(232,197,71,0.6)] mb-2">
              {t.hostPanel}
            </div>

            <h1
              className={`fu fu1 display-font font-light text-[clamp(28px,4vw,38px)] text-white mb-7 ${isAr ? "" : "italic"}`}
            >
              {t.bookingsTitle}{" "}
              <span className="font-medium text-[#e8c547]">{t.management}</span>
            </h1>

            {/* Stats */}
            <div className="fu fu2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STAT_CARDS.map(({ label, val, borderTop }) => (
                <div
                  key={label}
                  className={`bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] border-t-[3px] ${borderTop} rounded-[10px] px-4 py-3.5`}
                >
                  <div
                    className={`display-font font-light text-[28px] text-white leading-none ${isAr ? "" : "italic"}`}
                  >
                    {val}
                  </div>
                  <div className="text-[10px] tracking-[0.08em] uppercase text-[rgba(255,255,255,0.35)] mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
          {/* Filter tabs */}
          <div className="tabs-scroll overflow-x-auto border-b border-black/[0.08] mb-6">
            <div className="flex min-w-max">
              {FILTER_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-4 py-2 border-none bg-transparent text-xs font-[inherit] cursor-pointer border-b-2 -mb-px transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
                    filter === id
                      ? "text-[#1a1a2e] border-b-[#e8c547]"
                      : "text-[#888] border-b-transparent hover:text-[#111118]"
                  }`}
                >
                  {label}
                  {!["all", "calendar"].includes(id) && (
                    <span
                      className={`text-[10px] px-[7px] py-px rounded-[20px] ${
                        filter === id
                          ? "bg-[#1a1a2e] text-[#e8c547]"
                          : "bg-black/[0.06] text-[#888]"
                      }`}
                    >
                      {bookings.filter((b) => b.status === id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] px-4 py-3 rounded-[10px] mb-4 text-[13px]">
              {error}
            </div>
          )}

          {/* Calendar */}
          {filter === "calendar" ? (
            <div className="bg-white rounded-2xl border border-black/[0.07] p-4 sm:p-6">
              <HostCalendar
                bookings={bookings}
                onConfirmBooking={handleConfirmBooking}
                onCancelBooking={handleCancelBooking}
                language={lang} 
              />
            </div>
          ) : getFiltered().length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.07] p-16 text-center">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-[13px] text-[#999]">{t.noBookingsFound}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {getFiltered().map((booking, idx) => {
                const nights = calcNights(booking.check_in, booking.check_out);
                const isLoad = actionLoading === booking.id;
                return (
                  <div
                    key={booking.id}
                    className="fu bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      {/* ── Info ── */}
                      <div className="flex-1 min-w-0">
                        {/* Title + status badge */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                          <h3 className="text-[15px] font-medium text-[#111118]">
                            {booking.listing?.title || t.listing}
                          </h3>
                          <span
                            className={`text-[10px] px-2.5 py-px rounded-[20px] font-medium tracking-[0.05em] uppercase ${statusBadgeCls(booking.status)}`}
                          >
                            {booking.status === "confirmed" && t.confirmed}
                            {booking.status === "pending" && t.pending}
                            {booking.status === "cancelled" && t.cancelled}
                          </span>
                        </div>

                        {/* Guest info */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                          {[
                            [t.guest, booking.user?.name || t.guestName],
                            [t.email, booking.user?.email],
                            [t.phone, booking.user?.phoneNumber],
                            [t.location, booking.listing?.location],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <span className="text-[10px] uppercase tracking-[0.08em] text-[#bbb]">
                                {label}{" "}
                              </span>
                              <span className="text-[12px] text-[#555]">
                                {val || "—"}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Dates / nights / guests */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-black/[0.05] pt-3.5">
                          {[
                            [t.checkIn, booking.check_in_display],
                            [t.checkOut, booking.check_out_display],
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
                              <div className="text-[10px] uppercase tracking-[0.08em] text-[#bbb] mb-0.5">
                                {label}
                              </div>
                              <div className="text-[12px] font-medium text-[#333]">
                                {val}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total + booked date */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-[10px] uppercase tracking-[0.08em] text-[#bbb]">
                            {t.total}
                          </span>
                          <span className="text-base font-medium text-[#1a1a2e]">
                            {formatCurrency(booking.total_price)}
                          </span>
                          <span className="text-[11px] text-[#bbb] sm:ml-auto">
                            {t.booked} {formatDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* ── Actions ── */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[140px] lg:flex-shrink-0 flex-wrap">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={isLoad}
                              className="flex-1 lg:flex-none flex items-center justify-center gap-[5px] bg-[#1a1a2e] text-[#e8c547] text-xs font-medium font-[inherit] px-4 py-2 rounded-lg border-none cursor-pointer hover:opacity-85 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
                            >
                              {isLoad ? <Spinner /> : `✓ ${t.confirm}`}
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isLoad}
                              className="flex-1 lg:flex-none flex items-center justify-center gap-[5px] bg-[#FEE2E2] text-[#991b1b] text-xs font-medium font-[inherit] px-4 py-2 rounded-lg border-none cursor-pointer hover:opacity-85 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
                            >
                              {isLoad ? <Spinner dark /> : `✗ ${t.cancel}`}
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isLoad}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-[5px] bg-[#FEE2E2] text-[#991b1b] text-xs font-medium font-[inherit] px-4 py-2 rounded-lg border-none cursor-pointer hover:opacity-85 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
                          >
                            {isLoad ? <Spinner dark /> : t.cancel}
                          </button>
                        )}
                        {booking.status === "cancelled" && (
                          <div className="text-[11px] text-[#bbb] text-center py-2 px-4">
                            {t.cancelled}
                          </div>
                        )}
                        <Link
                          href={`/listings/${booking.listing_id}`}
                          className="flex-1 lg:flex-none text-center bg-black/[0.04] text-[#555] no-underline text-xs font-[inherit] px-4 py-2 rounded-lg border border-black/[0.08] hover:bg-black/[0.08] transition-all"
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
      className={`inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${
        dark ? "border-[#991b1b]" : "border-[#e8c547]"
      }`}
    />
  );
}
