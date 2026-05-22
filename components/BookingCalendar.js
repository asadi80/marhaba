"use client";

import { useEffect, useState } from "react";

const toDateString = (date) => {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function BookingCalendar({ bookedDates, onDateSelect, checkIn, checkOut, isHost = false, language = "en" }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(checkIn || null);
  const [selectedEndDate, setSelectedEndDate] = useState(checkOut || null);
  const [hoverDate, setHoverDate] = useState(null);
  const [bookedDatesMap, setBookedDatesMap] = useState(new Map());

  const isRTL = language === "ar";

  // Translations
  const translations = {
    en: {
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      weekDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      available: "Available",
      selected: "Selected",
      range: "Range",
      pending: "Pending",
      confirmed: "Confirmed",
      blocked: "Blocked"
    },
    ar: {
      monthNames: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
      weekDays: ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"],
      available: "متاح",
      selected: "محدد",
      range: "نطاق",
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      blocked: "محظور"
    }
  };

  const t = translations[language];

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

  // Sync with parent props
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

  // ✅ FIX: only call onDateSelect when BOTH dates are chosen
  const handleDateClick = (date) => {
    const dateStr = getDateStr(date);
    if (isDateInPast(date)) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection — don't notify parent yet
      setSelectedStartDate(dateStr);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (dateStr > selectedStartDate) {
        // Complete the range — notify parent only now
        setSelectedEndDate(dateStr);
        onDateSelect({ checkIn: selectedStartDate, checkOut: dateStr });
      } else {
        // Clicked before start — reset, don't notify
        setSelectedStartDate(dateStr);
        setSelectedEndDate(null);
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

  const MONTH_NAMES = t.monthNames;
  const WEEK_DAYS = t.weekDays;
  const days = getDaysInMonth(currentMonth);

  const getDayClasses = (date, isCurrentMonth) => {
    const status = getDateStatus(date);
    const isPast = isDateInPast(date);
    const isStart = isStartDate(date);
    const isEnd = isEndDate(date);
    const inRange = isDateInRange(date);
    const hasEnd = !!selectedEndDate;

    const base = `relative aspect-square border-0 text-[13px] flex items-center justify-center transition-all duration-100 cursor-pointer ${isRTL ? 'font-[\'Cairo\',\'Tajawal\',sans-serif]' : ''}`;

    if (!isCurrentMonth) return `${base} opacity-30 cursor-default`;
    if (isStart && hasEnd) return `${base} !bg-[#1a1a2e] !text-[#e8c547] font-bold ${isRTL ? 'rounded-r-full' : 'rounded-l-full'}`;
    if (isEnd) return `${base} !bg-[#1a1a2e] !text-[#e8c547] font-bold ${isRTL ? 'rounded-l-full' : 'rounded-r-full'}`;
    if (isStart) return `${base} !bg-[#1a1a2e] !text-[#e8c547] font-bold rounded-full`;
    if (inRange) return `${base} bg-[#e8c547]/15 text-[#222] rounded-none`;
    // Keep colors for taken/blocked dates but make them selectable
    if (status === "pending") return `${base} bg-[#FAEEDA] text-[#633806] rounded-full`;
    if (status === "confirmed") return `${base} bg-[#FCEBEB] text-[#791F1F] rounded-full`;
    if (status === "blocked") return `${base} bg-[#ebebeb] text-[#999] rounded-full`;
    if (isPast) return `${base} text-[#ccc]`;
    return `${base} hover:bg-[#f0f0f0] text-[#222] rounded-full`;
  };

  const legendItems = isHost ? [
    { bg: "bg-white border border-[#ddd]", label: t.available },
    { bg: "bg-[#1a1a2e]", label: t.selected },
    { bg: "bg-[#e8c547]/15", label: t.range },
    { bg: "bg-[#FAEEDA]", label: t.pending, dot: "bg-[#e8c547]" },
    { bg: "bg-[#FCEBEB]", label: t.confirmed, dot: "bg-[#A32D2D]" },
    { bg: "bg-[#ebebeb]", label: t.blocked },
  ] : [
    { bg: "bg-white border border-[#ddd]", label: t.available },
    { bg: "bg-[#1a1a2e]", label: t.selected },
    { bg: "bg-[#e8c547]/15", label: t.range },
    { bg: "bg-[#FAEEDA]", label: t.pending },
    { bg: "bg-[#FCEBEB]", label: t.confirmed },
    { bg: "bg-[#ebebeb]", label: t.blocked },
  ];

  return (
    <div 
      className={`bg-white rounded-2xl border-[1.5px] border-[#e5e5e5] p-5 select-none ${isRTL ? 'text-right' : ''}`}
      style={isRTL ? { fontFamily: "'Cairo', 'Tajawal', sans-serif" } : {}}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Month nav */}
      <div className="flex justify-between items-center mb-5">
        <button
          className="w-8 h-8 rounded-full border-[1.5px] border-[#e5e5e5] bg-white cursor-pointer flex items-center justify-center text-sm text-[#222] hover:border-[#222] hover:bg-[#f7f7f7] transition-colors"
          onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d); }}
        >{isRTL ? "→" : "←"}</button>
        <span className="text-[15px] font-bold text-[#222]">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          className="w-8 h-8 rounded-full border-[1.5px] border-[#e5e5e5] bg-white cursor-pointer flex items-center justify-center text-sm text-[#222] hover:border-[#222] hover:bg-[#f7f7f7] transition-colors"
          onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d); }}
        >{isRTL ? "←" : "→"}</button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold tracking-[0.05em] text-[#717171] py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ date, isCurrentMonth }, i) => {
          const status = getDateStatus(date);
          const isPast = isDateInPast(date);

          return (
            <button
              key={i}
              type="button"
              className={getDayClasses(date, isCurrentMonth)}
              style={{ opacity: !isCurrentMonth ? 0.3 : 1 }}
              onClick={() => isCurrentMonth && handleDateClick(date)}
              onMouseEnter={() => {
                if (selectedStartDate && !selectedEndDate && isCurrentMonth) {
                  const s = getDateStr(date);
                  if (s > selectedStartDate) setHoverDate(s);
                }
              }}
              onMouseLeave={() => setHoverDate(null)}
            >
              {date.getUTCDate()}
              {status === "pending" && (
                <span className={`absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e8c547] ${isRTL ? 'right-1/2' : ''}`} />
              )}
              {status === "confirmed" && (
                <span className={`absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#A32D2D] ${isRTL ? 'right-1/2' : ''}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex flex-wrap gap-x-[18px] gap-y-2.5">
        {legendItems.map(({ bg, label, dot }) => (
          <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#717171]">
            <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 relative ${bg}`}>
              {dot && <span className={`absolute bottom-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${dot} ${isRTL ? 'right-1/2' : ''}`} />}
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}