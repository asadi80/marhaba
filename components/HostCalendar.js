// components/HostCalendar.js
"use client";

import { useState } from "react";

export default function HostCalendar({ bookings, onConfirmBooking, onCancelBooking }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
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
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
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

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear((y) => y - 1);
            } else setCurrentMonth((m) => m - 1);
          }}
          style={{
            background: "none",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ←
        </button>
        <span
          className="font-display"
          style={{
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 22,
            color: "#111118",
          }}
        >
          {monthNames[currentMonth]}{" "}
          <span style={{ fontWeight: 500 }}>{currentYear}</span>
        </span>
        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear((y) => y + 1);
            } else setCurrentMonth((m) => m + 1);
          }}
          style={{
            background: "none",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          →
        </button>
      </div>

      {/* Day labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 4,
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#999",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dayBookings = getBookingsForDay(day);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          // Get the first booking's user name (or show multiple if needed)
          const firstBooking = dayBookings[0];
          const hasMultipleBookings = dayBookings.length > 1;

          return (
            <div
              key={day}
              onClick={() => setSelected(selected === day ? null : day)}
              style={{
                minHeight: 64,
                borderRadius: 10,
                border: `1px solid ${selected === day ? "#e8c547" : "rgba(0,0,0,0.07)"}`,
                background: isToday
                  ? "#1a1a2e"
                  : selected === day
                    ? "#fdf8e7"
                    : "#fff",
                padding: "6px 8px",
                cursor: dayBookings.length ? "pointer" : "default",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow:
                  selected === day ? "0 0 0 2px rgba(232,197,71,0.3)" : "none",
                position: "relative",
              }}
            >
              {/* Day number with user name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isToday ? 600 : 400,
                    color: isToday ? "#e8c547" : "#111118",
                  }}
                >
                  {day}
                </span>

                {/* Display user name(s) on the calendar cell */}
                {dayBookings.length > 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 400,
                      color:
                        dayBookings[0]?.status === "confirmed"
                          ? "#1D9E75"
                          : dayBookings[0]?.status === "pending"
                            ? "#e8c547"
                            : "#e05a5a",
                      background: "rgba(0,0,0,0.05)",
                      padding: "1px 4px",
                      borderRadius: 4,
                      maxWidth: "calc(100% - 20px)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={dayBookings
                      .map((b) => `${b.user?.name} (${b.status})`)
                      .join(", ")}
                  >
                    {hasMultipleBookings
                      ? `${firstBooking?.user?.name || "Guest"} +${dayBookings.length - 1}`
                      : firstBooking?.user?.name || "Guest"}
                  </span>
                )}
              </div>

              {/* Status indicator bars */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  marginTop: 4,
                }}
              >
                {dayBookings.slice(0, 2).map((b) => (
                  <div
                    key={b._id}
                    style={{
                      height: 3,
                      borderRadius: 2,
                      background:
                        b.status === "confirmed"
                          ? "#1D9E75"
                          : b.status === "pending"
                            ? "#e8c547"
                            : "#e05a5a",
                      opacity: 0.85,
                    }}
                    title={`${b.user?.name} - ${b.status}`}
                  />
                ))}
                {dayBookings.length > 2 && (
                  <div style={{ fontSize: 9, color: "#999" }}>
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
        <div
          style={{
            marginTop: "1.5rem",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <div style={{ background: "#1a1a2e", padding: "0.75rem 1rem" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {monthNames[currentMonth]} {selected} —{" "}
              {getBookingsForDay(selected).length} booking(s)
            </span>
          </div>
          {getBookingsForDay(selected).map((b) => {
            const userColor = getUserColor(b.user?._id);
            return (
              <div
                key={b._id}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 13,
                      color: "#111118",
                      marginBottom: 2,
                    }}
                  >
                    {b.listing?.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#777" }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: userColor.bg,
                        color: userColor.color,
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontWeight: 500,
                        marginRight: 6,
                      }}
                    >
                      {b.user?.name || "Guest"}
                    </span>
                    · {b.user?.email} · {b.user?.phoneNumber} · {b.guests} guest
                    {b.guests !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 10px",
                      borderRadius: 20,
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
                    {b.status}
                  </span>
                  {b.status === "pending" && (
                    <button
                      onClick={() => onConfirmBooking(b._id)}
                      style={{
                        background: "#1D9E75",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      confirm
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => onCancelBooking(b._id)}
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {[
          ["confirmed", "#1D9E75"],
          ["pending", "#e8c547"],
          ["cancelled", "#e05a5a"],
        ].map(([s, c]) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#777",
            }}
          >
            <div
              style={{ width: 12, height: 4, borderRadius: 2, background: c }}
            />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}