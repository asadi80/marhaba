// components/BookingCalendar.js
"use client";

import { useEffect, useState } from "react";

const toDateString = (date) => {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const fromDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export default function BookingCalendar({ bookedDates, onDateSelect, checkIn, checkOut, isHost = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(checkIn || null);
  const [selectedEndDate, setSelectedEndDate] = useState(checkOut || null);
  const [hoverDate, setHoverDate] = useState(null);
  const [bookedDatesMap, setBookedDatesMap] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    if (!bookedDates?.length) { setBookedDatesMap(map); return; }
    bookedDates.forEach(({ checkIn, checkOut, status }) => {
      const startDate = new Date(checkIn), endDate = new Date(checkOut);
      const startUTC = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
      const endUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
      let current = new Date(startUTC);
      while (current < endUTC) {
        const dateStr = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}-${String(current.getUTCDate()).padStart(2, "0")}`;
        if (!map.has(dateStr)) map.set(dateStr, status);
        current.setUTCDate(current.getUTCDate() + 1);
      }
    });
    setBookedDatesMap(map);
  }, [bookedDates]);

  useEffect(() => {
    setSelectedStartDate(checkIn || null);
    setSelectedEndDate(checkOut || null);
  }, [checkIn, checkOut]);

  const getDateStatus = (d) => {
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    return bookedDatesMap.get(dateStr);
  };

  const isDateInPast = (d) => {
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const check = new Date(d); check.setUTCHours(0, 0, 0, 0);
    return check < today;
  };

  const getDateStr = (d) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

  const isDateSelected = (d) => {
    const s = getDateStr(d);
    if (selectedEndDate) return s >= selectedStartDate && s <= selectedEndDate;
    return s === selectedStartDate;
  };

  const isDateInRange = (d) => {
    if (!selectedStartDate || selectedEndDate || !hoverDate) return false;
    const s = getDateStr(d);
    return s > selectedStartDate && s <= hoverDate;
  };

  const isStartDate = (d) => getDateStr(d) === selectedStartDate;
  const isEndDate = (d) => getDateStr(d) === selectedEndDate;

  const handleDateClick = (date) => {
    const dateStr = getDateStr(date);
    const status = getDateStatus(date);
    if (!isHost && (status === "pending" || status === "confirmed" || status === "blocked")) return;
    if (isDateInPast(date)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
      onDateSelect({ checkIn: dateStr, checkOut: "" });
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateStr > selectedStartDate) {
        setSelectedEndDate(dateStr);
        onDateSelect({ checkIn: selectedStartDate, checkOut: dateStr });
      } else {
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
        onDateSelect({ checkIn: dateStr, checkOut: "" });
      }
    }
  };

  const getDaysInMonth = (date) => {
    const y = date.getFullYear(), m = date.getMonth();
    const firstDay = new Date(Date.UTC(y, m, 1));
    const lastDay = new Date(Date.UTC(y, m + 1, 0));
    let startOffset = firstDay.getUTCDay();
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
    const days = [];
    for (let i = startOffset; i > 0; i--) days.push({ date: new Date(Date.UTC(y, m, -i + 1)), isCurrentMonth: false });
    for (let i = 1; i <= lastDay.getUTCDate(); i++) days.push({ date: new Date(Date.UTC(y, m, i)), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(Date.UTC(y, m + 1, i)), isCurrentMonth: false });
    return days;
  };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WEEK_DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];
  const days = getDaysInMonth(currentMonth);

  return (
    <>
      <style jsx>{`
        .bc-wrap {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #e5e5e5;
          padding: 20px;
          user-select: none;
        }
        .bc-nav {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .bc-nav-btn {
          width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #e5e5e5;
          background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #222; transition: border-color 0.15s, background 0.15s;
        }
        .bc-nav-btn:hover { border-color: #222; background: #f7f7f7; }
        .bc-month-label { font-size: 15px; font-weight: 700; color: #222; }
        .bc-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
        .bc-weekday { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #717171; padding: 4px 0; }
        .bc-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .bc-day {
          position: relative; aspect-ratio: 1; border-radius: 50%; border: none;
          font-size: 13px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.1s, color 0.1s;
        }
        .bc-day.available:hover { background: #f0f0f0; }
        .bc-day.selected-start, .bc-day.selected-end { background: #1a1a2e !important; color: #e8c547 !important; font-weight: 700; border-radius: 50%; }
        .bc-day.in-range { background: rgba(232, 197, 71, 0.15); border-radius: 0; color: #222; }
        .bc-day.range-start { border-radius: 50% 0 0 50%; }
        .bc-day.range-end { border-radius: 0 50% 50% 0; }
        .bc-day.single-selected { border-radius: 50%; }
        .bc-day.pending { background: #FAEEDA; color: #633806; cursor: not-allowed; text-decoration: line-through; border-radius: 50%; }
        .bc-day.confirmed { background: #FCEBEB; color: #791F1F; cursor: not-allowed; text-decoration: line-through; border-radius: 50%; }
        .bc-day.blocked { background: #ebebeb; color: #999; cursor: not-allowed; text-decoration: line-through; border-radius: 50%; }
        .bc-day.past { color: #ccc; cursor: not-allowed; background: transparent; }
        .bc-day.other-month { color: #ddd; cursor: default; }
        .bc-dot {
          position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
        }
        .bc-legend { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; display: flex; flex-wrap: wrap; gap: 10px 18px; }
        .bc-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #717171; }
        .bc-legend-swatch { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; position: relative; }
      `}</style>

      <div className="bc-wrap">
        {/* Month nav */}
        <div className="bc-nav">
          <button className="bc-nav-btn" onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d); }}>←</button>
          <span className="bc-month-label">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button className="bc-nav-btn" onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d); }}>→</button>
        </div>

        {/* Weekday headers */}
        <div className="bc-weekdays">
          {WEEK_DAYS.map((d) => <div key={d} className="bc-weekday">{d}</div>)}
        </div>

        {/* Day grid */}
        <div className="bc-days">
          {days.map(({ date, isCurrentMonth }, i) => {
            const status = getDateStatus(date);
            const isPast = isDateInPast(date);
            const isSelected = isDateSelected(date);
            const isInRange = isDateInRange(date);
            const isStart = isStartDate(date);
            const isEnd = isEndDate(date);

            let isDisabled = isPast;
            if (!isHost) isDisabled = isDisabled || status === "pending" || status === "confirmed" || status === "blocked";

            let cls = "bc-day";
            if (!isCurrentMonth) cls += " other-month";
            else if (isStart && selectedEndDate) cls += " selected-start in-range range-start";
            else if (isEnd) cls += " selected-end in-range range-end";
            else if (isStart) cls += " selected-start single-selected";
            else if (isInRange) cls += " in-range";
            else if (status === "pending" && !isHost) cls += " pending";
            else if (status === "confirmed" && !isHost) cls += " confirmed";
            else if (status === "blocked" && !isHost) cls += " blocked";
            else if (isPast) cls += " past";
            else if (isCurrentMonth && !isDisabled) cls += " available";

            return (
              <button
                key={i}
                type="button"
                className={cls}
                disabled={isDisabled && !isHost}
                onClick={() => !isDisabled && isCurrentMonth && handleDateClick(date)}
                onMouseEnter={() => {
                  if (!isDisabled && selectedStartDate && !selectedEndDate && isCurrentMonth) {
                    const s = getDateStr(date);
                    if (s > selectedStartDate) setHoverDate(s);
                  }
                }}
                onMouseLeave={() => setHoverDate(null)}
                style={{ opacity: !isCurrentMonth ? 0.3 : 1 }}
              >
                {date.getUTCDate()}
                {status === "pending" && <span className="bc-dot" style={{ background: "#e8c547" }} />}
                {status === "confirmed" && <span className="bc-dot" style={{ background: "#A32D2D" }} />}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="bc-legend">
          {(isHost ? [
            { swatch: "#fff", border: "1.5px solid #ddd", label: "Available" },
            { swatch: "#1a1a2e", label: "Selected", textColor: "#e8c547" },
            { swatch: "rgba(232,197,71,0.15)", label: "Range" },
            { swatch: "#FAEEDA", label: "Pending", dot: "#e8c547" },
            { swatch: "#FCEBEB", label: "Confirmed", dot: "#A32D2D" },
            { swatch: "#ebebeb", label: "Blocked" },
          ] : [
            { swatch: "#fff", border: "1.5px solid #ddd", label: "Available" },
            { swatch: "#1a1a2e", label: "Selected", textColor: "#e8c547" },
            { swatch: "rgba(232,197,71,0.15)", label: "Range" },
            { swatch: "#FAEEDA", label: "Pending" },
            { swatch: "#FCEBEB", label: "Confirmed" },
            { swatch: "#ebebeb", label: "Blocked" },
          ]).map(({ swatch, border, label, textColor, dot }) => (
            <div key={label} className="bc-legend-item">
              <span className="bc-legend-swatch" style={{ background: swatch, border: border || "none" }}>
                {dot && <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: dot, display: "block" }} />}
              </span>
              <span style={{ color: textColor || "#717171" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}