// components/HostCalendar.js
"use client";

import { useState } from "react";

export default function HostCalendar({ bookings, onConfirmBooking, onCancelBooking, language }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(null);

  const isRTL = language === "ar";

  // Translations
  const translations = {
    en: {
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      booking: "booking",
      bookings: "bookings",
      guest: "guest",
      guests: "guests",
      confirm: "confirm",
      cancel: "cancel",
      confirmed: "confirmed",
      pending: "pending",
      cancelled: "cancelled"
    },
    ar: {
      monthNames: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      weekDays: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
      booking: "حجز",
      bookings: "حجوزات",
      guest: "ضيف",
      guests: "ضيوف",
      confirm: "تأكيد",
      cancel: "إلغاء",
      confirmed: "مؤكد",
      pending: "قيد الانتظار",
      cancelled: "ملغي"
    }
  };

const t = translations[language] ?? translations["en"];

  const monthNames = t.monthNames;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Color palette for different users
  const userColors = [
    { bg: "#EAF3DE", color: "#27500A", border: "#27500A" },
    { bg: "#FCEBEB", color: "#791F1F", border: "#791F1F" },
    { bg: "#EEEDFE", color: "#3C3489", border: "#3C3489" },
    { bg: "#E6F1FB", color: "#0C447C", border: "#0C447C" },
    { bg: "#FAEEDA", color: "#633806", border: "#633806" },
    { bg: "#FEE2E2", color: "#991B1B", border: "#991B1B" },
    { bg: "#DCFCE7", color: "#166534", border: "#166534" },
    { bg: "#FEF9C3", color: "#713F12", border: "#713F12" },
  ];

  const getUserColor = (userId) => {
    const index = userId?.charCodeAt(0) % userColors.length || 0;
    return userColors[index];
  };

  const getBookingsForDay = (day) => {
    const date = new Date(Date.UTC(currentYear, currentMonth, day));
    return bookings.filter((b) => {
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
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
      return date >= checkInUTC && date < checkOutUTC;
    });
  };

  const statusColor = (s) => {
    return s === "confirmed"
      ? "#1D9E75"
      : s === "pending"
        ? "#e8c547"
        : "#e05a5a";
  };

  const getStatusText = (status) => {
    if (status === "confirmed") return t.confirmed;
    if (status === "pending") return t.pending;
    return t.cancelled;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div 
      className={`${isRTL ? 'font-[\'Cairo\',\'Tajawal\',sans-serif] text-right' : ''}`}
      style={isRTL ? { fontFamily: "'Cairo', 'Tajawal', sans-serif" } : {}}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear((y) => y - 1);
            } else setCurrentMonth((m) => m - 1);
          }}
          className="bg-none border border-black/10 rounded-lg px-3.5 py-1.5 text-[13px] cursor-pointer font-inherit hover:bg-gray-50 transition-colors"
        >
          {isRTL ? "→" : "←"}
        </button>
        <span className="italic font-light text-[22px] text-[#111118]">
          {monthNames[currentMonth]}{" "}
          <span className="font-medium">{currentYear}</span>
        </span>
        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear((y) => y + 1);
            } else setCurrentMonth((m) => m + 1);
          }}
          className="bg-none border border-black/10 rounded-lg px-3.5 py-1.5 text-[13px] cursor-pointer font-inherit hover:bg-gray-50 transition-colors"
        >
          {isRTL ? "←" : "→"}
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {t.weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] tracking-wider uppercase text-gray-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dayBookings = getBookingsForDay(day);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          const firstBooking = dayBookings[0];
          const hasMultipleBookings = dayBookings.length > 1;

          return (
            <div
              key={day}
              onClick={() => setSelected(selected === day ? null : day)}
              className={`min-h-16 rounded-lg border p-1.5 transition-all cursor-${
                dayBookings.length ? "pointer" : "default"
              }`}
              style={{
                border: `1px solid ${selected === day ? "#e8c547" : "rgba(0,0,0,0.07)"}`,
                background: isToday
                  ? "#1a1a2e"
                  : selected === day
                    ? "#fdf8e7"
                    : "#fff",
                boxShadow:
                  selected === day ? "0 0 0 2px rgba(232,197,71,0.3)" : "none",
              }}
            >
              {/* Day number with user name */}
              <div className="flex items-center gap-1 flex-wrap">
                <span
                  className={`text-xs ${isToday ? "font-semibold text-[#e8c547]" : "font-normal text-[#111118]"}`}
                >
                  {day}
                </span>

                {/* Display user name(s) on the calendar cell */}
                {dayBookings.length > 0 && (
                  <span
                    className="text-[9px] font-normal px-1 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-20px)]"
                    style={{
                      color:
                        dayBookings[0]?.status === "confirmed"
                          ? "#1D9E75"
                          : dayBookings[0]?.status === "pending"
                            ? "#e8c547"
                            : "#e05a5a",
                      background: "rgba(0,0,0,0.05)",
                    }}
                    title={dayBookings
                      .map((b) => `${b.user?.name} (${getStatusText(b.status)})`)
                      .join(", ")}
                  >
                    {hasMultipleBookings
                      ? `${firstBooking?.user?.name || "Guest"} +${dayBookings.length - 1}`
                      : firstBooking?.user?.name || "Guest"}
                  </span>
                )}
              </div>

              {/* Status indicator bars */}
              <div className="flex flex-col gap-0.5 mt-1">
                {dayBookings.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className="h-0.5 rounded-sm opacity-85"
                    style={{
                      background:
                        b.status === "confirmed"
                          ? "#1D9E75"
                          : b.status === "pending"
                            ? "#e8c547"
                            : "#e05a5a",
                    }}
                    title={`${b.user?.name} - ${getStatusText(b.status)}`}
                  />
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-[9px] text-gray-400">
                    +{dayBookings.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day details - with colored user names */}
      {selected && getBookingsForDay(selected).length > 0 && (
        <div className="mt-6 rounded-xl border border-black/5 overflow-hidden">
          <div className="bg-[#1a1a2e] px-4 py-3">
            <span className="text-xs text-white/60">
              {monthNames[currentMonth]} {selected} —{" "}
              {getBookingsForDay(selected).length}{" "}
              {getBookingsForDay(selected).length === 1 ? t.booking : t.bookings}
            </span>
          </div>
          {getBookingsForDay(selected).map((b) => {
            const userColor = getUserColor(b.user?.id);
            return (
              <div
                key={b.id}
                className="p-4 border-b border-black/5 flex justify-between items-center flex-wrap gap-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-[13px] text-[#111118] mb-0.5">
                    {b.listing?.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full font-medium mr-1.5"
                      style={{
                        background: userColor.bg,
                        color: userColor.color,
                      }}
                    >
                      {b.user?.name || "Guest"}
                    </span>
                    · {b.user?.email} · {b.user?.phoneNumber} · {b.guests}{" "}
                    {b.guests !== 1 ? t.guests : t.guest}
                  </div>
                </div>
                <div className="flex gap-1.5 items-center">
                  <span
                    className="text-[11px] px-2.5 py-0.5 rounded-full"
                    style={{
                      background:
                        b.status === "confirmed"
                          ? "#DCFCE7"
                          : b.status === "pending"
                            ? "#FEF9C3"
                            : "#FEE2E2",
                      color:
                        b.status === "confirmed"
                          ? "#166534"
                          : b.status === "pending"
                            ? "#713f12"
                            : "#991b1b",
                    }}
                  >
                    {getStatusText(b.status)}
                  </span>
                  {b.status === "pending" && (
                    <button
                      onClick={() => onConfirmBooking(b.id)}
                      className="bg-[#1D9E75] text-white border-none rounded-md px-2.5 py-1 text-[11px] cursor-pointer font-inherit hover:opacity-90 transition-opacity"
                    >
                      {t.confirm}
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => onCancelBooking(b.id)}
                      className="bg-[#fee2e2] text-[#991b1b] border-none rounded-md px-2.5 py-1 text-[11px] cursor-pointer font-inherit hover:opacity-80 transition-opacity"
                    >
                      {t.cancel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-6 flex-wrap">
        {[
          [t.confirmed, "#1D9E75"],
          [t.pending, "#e8c547"],
          [t.cancelled, "#e05a5a"],
        ].map(([s, c]) => (
          <div
            key={s}
            className="flex items-center gap-1.5 text-xs text-gray-500"
          >
            <div className="w-3 h-1 rounded-sm" style={{ background: c }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}