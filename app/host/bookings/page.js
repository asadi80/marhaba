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
  const [actionLoading, setActionLoading] = useState(null); // { id, action }
  const [user, setUser] = useState(null);
  const [hostListings, setHostListings] = useState([]);
  const [blockedDates, setBlockedDates] = useState({});
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [unblockLoading, setUnblockLoading] = useState(null);

  const formatCurrency = (amount) =>
    isAr
      ? `${Math.round(amount).toLocaleString()} دينار`
      : `${Math.round(amount).toLocaleString()} LYD`;

  useEffect(() => {
    fetchBookings();
    fetchUser();
    fetchHostListings();
    fetchBlockedUsers();
  }, []);

  const fetchHostListings = async () => {
    try {
      const res = await fetch("/api/host/listings");
      const data = await res.json();
      setHostListings(data.listings ?? []);
      const map = {};
      (data.listings ?? []).forEach((l) => {
        map[l.id] = l.blocked_dates ?? [];
      });
      setBlockedDates(map);
    } catch {}
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch("/api/host/blocked-users", {
        credentials: "include",
      });
      const data = await res.json();
      setBlockedUsers(data.blockedUsers ?? []);
    } catch {}
  };

  const handleUnblock = async (userId) => {
    if (
      !confirm(isAr ? "هل تريد إلغاء حظر هذا المستخدم؟" : "Unblock this user?")
    )
      return;
    setUnblockLoading(userId);
    try {
      const res = await fetch("/api/host/blocked-users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchBlockedUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setUnblockLoading(null);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {}
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", { credentials: "include" });
      const data = await res.json();
      console.log(data);

      if (!res.ok) throw new Error(data.message);
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Generic action handler ──────────────────────────────────
  const handleAction = async (bookingId, action, confirmMsg, successMsg) => {
    if (!confirm(confirmMsg)) return;
    setActionLoading({ id: bookingId, action });
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchBookings();
      alert(successMsg);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmBooking = (id) =>
    handleAction(
      id,
      "confirm",
      t.confirmBooking ?? "Confirm this booking?",
      t.bookingConfirmedSuccess ?? "Booking confirmed.",
    );

  const handleCancelBooking = (id) =>
    handleAction(
      id,
      "cancel",
      t.confirmCancelBooking ?? "Cancel this booking?",
      t.bookingCancelledSuccess ?? "Booking cancelled.",
    );

  const handleCheckIn = (id) =>
    handleAction(
      id,
      "check_in",
      isAr ? "هل تريد تسجيل وصول الضيف؟" : "Mark guest as checked in?",
      isAr
        ? "تم تسجيل الوصول وإرسال البريد الإلكتروني."
        : "Check-in recorded and email sent.",
    );

  const handleCheckOut = (id) =>
    handleAction(
      id,
      "check_out",
      isAr ? "هل تريد تسجيل مغادرة الضيف؟" : "Mark guest as checked out?",
      isAr
        ? "تم تسجيل المغادرة وإرسال البريد الإلكتروني."
        : "Check-out recorded and email sent.",
    );

  const handleNoShow = (id) =>
    handleAction(
      id,
      "no_show",
      isAr
        ? "هل تريد تسجيل الضيف كغائب؟ سيتم إلغاء الحجز."
        : "Mark guest as no-show? This will cancel the booking.",
      isAr ? "تم تسجيل الغياب." : "No-show recorded.",
    );

  const handleBlockUser = (id) =>
    handleAction(
      id,
      "block_user",
      isAr
        ? "هل تريد حظر هذا المستخدم من حجز عقاراتك؟"
        : "Block this user from booking your listings?",
      isAr
        ? "تم حظر المستخدم وإرسال إشعار بالبريد الإلكتروني."
        : "User blocked and notified by email.",
    );

  // ── Helpers ────────────────────────────────────────────────
  const getFiltered = () => {
    if (["all", "calendar", "blocked", "blockedUsers"].includes(filter))
      return bookings;
    if (filter === "noshow") return bookings.filter((b) => !!b.no_show);
    return bookings.filter((b) => b.status === filter);
  };

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

  const isActionSpinning = (bookingId, action) =>
    actionLoading?.id === bookingId && actionLoading?.action === action;

  const anyActionLoading = (bookingId) => actionLoading?.id === bookingId;

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
    { id: "noshow", label: `⚠️ ${isAr ? "الغائبون" : "No-Shows"}` }, // ← add
    { id: "calendar", label: `📅 ${t.calendarView}` },
    { id: "blocked", label: `🚫 ${isAr ? "تواريخ محظورة" : "Blocked Dates"}` },
    {
      id: "blockedUsers",
      label: `🔒 ${isAr ? "المستخدمون المحظورون" : "Blocked Users"}`,
    },
  ];

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "H";

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
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
        {/* NAV */}
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

        {/* PAGE HEADER */}
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

        {/* MAIN */}
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
                  
                  {!["all", "calendar", "blocked", "blockedUsers"].includes(
                    id,
                  ) && (
                    <span
                      className={`text-[10px] px-[7px] py-px rounded-[20px] ${
                        filter === id
                          ? "bg-[#1a1a2e] text-[#e8c547]"
                          : "bg-black/[0.06] text-[#888]"
                      }`}
                    >
                      {id === "noshow"
                        ? bookings.filter((b) => !!b.no_show).length
                        : bookings.filter((b) => b.status === id).length}
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

          {/* ── Calendar view ── */}
          {filter === "calendar" ? (
            <div className="bg-white rounded-2xl border border-black/[0.07] p-4 sm:p-6">
              <HostCalendar
                bookings={bookings}
                onConfirmBooking={handleConfirmBooking}
                onCancelBooking={handleCancelBooking}
                language={lang}
                hostListings={hostListings}
                blockedDates={blockedDates}
              />
            </div>
          ) : /* ── Blocked dates view ── */
          filter === "blocked" ? (
            <div className="flex flex-col gap-4">
              {hostListings.length === 0 ? (
                <EmptyState
                  icon="🚫"
                  msg={isAr ? "لا توجد قائمة عقارات" : "No listings found"}
                />
              ) : (
                hostListings.map((listing) => {
                  const dates = blockedDates[listing.id] ?? [];
                  return (
                    <div
                      key={listing.id}
                      className="bg-white rounded-2xl border border-black/[0.07] px-5 py-5"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="text-[14px] font-medium text-[#111118]">
                            {listing.title}
                          </h3>
                          <p className="text-[11px] text-[#999] mt-0.5">
                            {dates.length > 0
                              ? `${dates.length} ${isAr ? "يوم محظور" : "blocked day(s)"}`
                              : isAr
                                ? "لا توجد تواريخ محظورة"
                                : "No blocked dates"}
                          </p>
                        </div>
                      </div>
                      {dates.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {dates.map((date, i) => {
                            const isObj =
                              typeof date === "object" && date !== null;
                            const label = isObj
                              ? date.startDate === date.endDate || !date.endDate
                                ? date.startDate
                                : `${formatDate(date.startDate)}`
                              : date;
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center bg-[#fee2e2] text-[#991b1b] text-[11px] px-3 py-1 rounded-full"
                              >
                                🚫 {label}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#ccc]">—</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : /* ── Blocked Users view ── */
          filter === "blockedUsers" ? (
            <div className="flex flex-col gap-3">
              {blockedUsers.length === 0 ? (
                <EmptyState
                  icon="🔓"
                  msg={isAr ? "لا يوجد مستخدمون محظورون" : "No blocked users"}
                />
              ) : (
                blockedUsers.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#991b1b] flex items-center justify-center text-sm font-semibold shrink-0">
                        {entry.user_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#111118]">
                          {entry.user_name}
                        </p>
                        <p className="text-[12px] text-[#999]">
                          {entry.user_email}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-medium">
                            {entry.reason === "no_show"
                              ? isAr
                                ? "⚠️ غياب"
                                : "⚠️ No-Show"
                              : entry.reason === "cancellation"
                                ? isAr
                                  ? "❌ إلغاء"
                                  : "❌ Cancellation"
                                : isAr
                                  ? "🚫 يدوي"
                                  : "🚫 Manual"}
                          </span>
                          <span className="text-[10px] text-[#bbb]">
                            {isAr ? "منذ" : "Since"}{" "}
                            {new Date(entry.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(entry.user_id)}
                      disabled={unblockLoading === entry.user_id}
                      className={[
                        "shrink-0 flex items-center justify-center gap-1.5 text-xs font-medium font-[inherit]",
                        "px-4 py-2 rounded-lg border border-[#1D9E75]/30 transition-all",
                        unblockLoading === entry.user_id
                          ? "opacity-50 cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]"
                          : "bg-[#D1FAE5] text-[#065F46] cursor-pointer hover:opacity-85 hover:-translate-y-px",
                      ].join(" ")}
                    >
                      {unblockLoading === entry.user_id ? (
                        <>
                          <Spinner cls="border-[#065F46]" />{" "}
                          {isAr ? "جارٍ..." : "Unblocking..."}
                        </>
                      ) : isAr ? (
                        "🔓 إلغاء الحظر"
                      ) : (
                        "🔓 Unblock"
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : /* ── Empty state ── */
          getFiltered().length === 0 ? (
            <EmptyState icon="📅" msg={t.noBookingsFound} />
          ) : (
            /* ── Booking cards ── */
            <div className="flex flex-col gap-3">
              {getFiltered().map((booking, idx) => {
                const nights = calcNights(booking.check_in, booking.check_out);
                const isLoading = anyActionLoading(booking.id);

                // Derive check-in/out states from DB values
                const isCheckedIn = !!booking.checked_in_at;
                const isCheckedOut = !!booking.checked_out_at;
                const isNoShow = !!booking.no_show;

                // Compare today vs check-in using local date (not UTC) so Libya UTC+2 doesn't shift the day
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                // booking.check_in is an ISO string e.g. "2026-05-29T07:00:00.000Z" — slice first 10 chars
                const checkInStr = (booking.check_in ?? "").slice(0, 10); // "2026-05-29"
                const checkInDateReached =
                  !!checkInStr && todayStr >= checkInStr;
                // Debug — remove after confirming:
                // console.log("today:", todayStr, "checkIn:", checkInStr, "reached:", checkInDateReached);

                return (
                  <div
                    key={booking.id}
                    className="fu bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      {/* ── Info ── */}
                      <div className="flex-1 min-w-0">
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

                          {/* Check-in / Check-out / No-show badges */}
                          {isCheckedIn && !isCheckedOut && (
                            <span className="text-[10px] px-2.5 py-px rounded-[20px] font-medium bg-[#D1FAE5] text-[#065F46] tracking-[0.05em]">
                              ✅ {isAr ? "وصل" : "Checked In"}
                            </span>
                          )}
                          {isCheckedOut && (
                            <span className="text-[10px] px-2.5 py-px rounded-[20px] font-medium bg-[#EDE9FE] text-[#4C1D95] tracking-[0.05em]">
                              👋 {isAr ? "غادر" : "Checked Out"}
                            </span>
                          )}
                          {isNoShow && (
                            <span className="text-[10px] px-2.5 py-px rounded-[20px] font-medium bg-[#FEF3C7] text-[#92400E] tracking-[0.05em]">
                              ⚠️ {isAr ? "غائب" : "No-Show"}
                            </span>
                          )}
                        </div>

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

                        {/* Actual check-in/out timestamps */}
                        {(isCheckedIn || isCheckedOut) && (
                          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-black/[0.05]">
                            {isCheckedIn && (
                              <div>
                                <span className="text-[10px] uppercase tracking-[0.08em] text-[#bbb]">
                                  {isAr ? "وقت الوصول" : "Arrived at"}{" "}
                                </span>
                                <span className="text-[11px] text-[#555]">
                                  {new Date(
                                    booking.checked_in_at,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {isCheckedOut && (
                              <div>
                                <span className="text-[10px] uppercase tracking-[0.08em] text-[#bbb]">
                                  {isAr ? "وقت المغادرة" : "Left at"}{" "}
                                </span>
                                <span className="text-[11px] text-[#555]">
                                  {new Date(
                                    booking.checked_out_at,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-[10px] uppercase tracking-[0.08em] text-[#bbb]">
                            {t.total}
                          </span>
                          <span className="text-base font-medium text-[#1a1a2e]">
                            {formatCurrency(booking.total_price)}
                          </span>
                          <span className="text-[11px] text-[#bbb] sm:ml-auto">
                            {t.booked} {formatDate(booking.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* ── Actions ── */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[148px] lg:flex-shrink-0 flex-wrap">
                        {/* Pending: confirm + cancel */}
                        {booking.status === "pending" && (
                          <>
                            <ActionBtn
                              onClick={() => handleConfirmBooking(booking.id)}
                              disabled={isLoading}
                              spinning={isActionSpinning(booking.id, "confirm")}
                              cls="bg-[#1a1a2e] text-[#e8c547]"
                              label={`✓ ${t.confirm}`}
                            />
                            <ActionBtn
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isLoading}
                              spinning={isActionSpinning(booking.id, "cancel")}
                              cls="bg-[#FEE2E2] text-[#991b1b]"
                              label={`✗ ${t.cancel}`}
                              spinCls="border-[#991b1b]"
                            />
                          </>
                        )}

                        {/* Confirmed: check-in / check-out / no-show / cancel */}
                        {booking.status === "confirmed" && !isNoShow && (
                          <>
                            {/* Check In
                                - disabled if: already checked in OR check-in date not reached yet
                                - shows "Checked In" label once done */}
                            <ActionBtn
                              onClick={() => handleCheckIn(booking.id)}
                              disabled={
                                isLoading || isCheckedIn || !checkInDateReached
                              }
                              spinning={isActionSpinning(
                                booking.id,
                                "check_in",
                              )}
                              cls={
                                isCheckedIn || !checkInDateReached
                                  ? "bg-[#F3F4F6] text-[#9CA3AF]"
                                  : "bg-[#D1FAE5] text-[#065F46]"
                              }
                              label={
                                isCheckedIn
                                  ? isAr
                                    ? "✅ تم الوصول"
                                    : "✅ Checked In"
                                  : !checkInDateReached
                                    ? isAr
                                      ? "✅ الوصول (لم يحن بعد)"
                                      : "✅ Check In (not yet)"
                                    : isAr
                                      ? "✅ تسجيل وصول"
                                      : "✅ Check In"
                              }
                              spinCls="border-[#065F46]"
                            />

                            {/* Check Out
                                - disabled if: not yet checked in OR already checked out
                                - enabled only after host clicks Check In */}
                            <ActionBtn
                              onClick={() => handleCheckOut(booking.id)}
                              disabled={
                                isLoading || !isCheckedIn || isCheckedOut
                              }
                              spinning={isActionSpinning(
                                booking.id,
                                "check_out",
                              )}
                              cls={
                                isCheckedIn && !isCheckedOut
                                  ? "bg-[#EDE9FE] text-[#4C1D95]"
                                  : "bg-[#F3F4F6] text-[#9CA3AF]"
                              }
                              label={
                                isCheckedOut
                                  ? isAr
                                    ? "👋 تمت المغادرة"
                                    : "👋 Checked Out"
                                  : isAr
                                    ? "👋 تسجيل مغادرة"
                                    : "👋 Check Out"
                              }
                              spinCls="border-[#4C1D95]"
                            />

                            {/* No-Show — only if check-in date reached but guest hasn't arrived */}
                            {!isCheckedIn && checkInDateReached && (
                              <ActionBtn
                                onClick={() => handleNoShow(booking.id)}
                                disabled={isLoading}
                                spinning={isActionSpinning(
                                  booking.id,
                                  "no_show",
                                )}
                                cls="bg-[#FEF3C7] text-[#92400E]"
                                label={isAr ? "⚠️ غائب" : "⚠️ No-Show"}
                                spinCls="border-[#92400E]"
                              />
                            )}

                            {/* Cancel — disabled once guest has checked in */}
                            <ActionBtn
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isLoading || isCheckedIn}
                              spinning={isActionSpinning(booking.id, "cancel")}
                              cls={
                                isCheckedIn
                                  ? "bg-[#F3F4F6] text-[#9CA3AF]"
                                  : "bg-[#FEE2E2] text-[#991b1b]"
                              }
                              label={t.cancel}
                              spinCls="border-[#991b1b]"
                            />
                          </>
                        )}

                        {/* Block user — show on confirmed or cancelled */}
                        {["confirmed", "cancelled"].includes(booking.status) &&
                          !isNoShow && (
                            <ActionBtn
                              onClick={() => handleBlockUser(booking.id)}
                              disabled={isLoading}
                              spinning={isActionSpinning(
                                booking.id,
                                "block_user",
                              )}
                              cls="bg-[#1a1a2e]/[0.06] text-[#991b1b] border border-[#991b1b]/20"
                              label={isAr ? "🚫 حظر المستخدم" : "🚫 Block User"}
                              spinCls="border-[#991b1b]"
                            />
                          )}

                        {booking.status === "cancelled" && !isNoShow && (
                          <div className="text-[11px] text-[#bbb] text-center py-1 px-4">
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

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function ActionBtn({
  onClick,
  disabled,
  spinning,
  cls,
  label,
  spinCls = "border-[#e8c547]",
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "flex-1 lg:flex-none flex items-center justify-center gap-[5px]",
        "text-xs font-medium font-[inherit] px-4 py-2 rounded-lg border-none transition-all",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:opacity-85 hover:-translate-y-px",
        cls,
      ].join(" ")}
    >
      {spinning ? <Spinner cls={spinCls} /> : label}
    </button>
  );
}

function EmptyState({ icon, msg }) {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] p-16 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-[13px] text-[#999]">{msg}</p>
    </div>
  );
}

function Spinner({ cls = "border-[#e8c547]" }) {
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${cls}`}
    />
  );
}
