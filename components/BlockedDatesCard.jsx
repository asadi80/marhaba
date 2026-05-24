"use client";

import { useState } from "react";

export default function BlockedDatesCard({ listing, blockedDates, onToggle, onSave, isSaving, isAr }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString(
    isAr ? "ar-LY" : "en-US",
    { month: "long", year: "numeric" },
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const pad = (n) => String(n).padStart(2, "0");
  const toStr = (d) => `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;

  const isPast = (d) => {
    const cellDate = new Date(Date.UTC(viewYear, viewMonth, d));
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    return cellDate < todayUTC;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const days = isAr
    ? ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          {listing.images?.[0] && (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-[#111118] truncate">
              {listing.title}
            </h3>
            <p className="text-[11px] text-[#999] mt-0.5">
              📍 {listing.location} &nbsp;·&nbsp;
              {blockedDates.length > 0
                ? `${blockedDates.length} ${isAr ? "يوم محظور" : "day(s) blocked"}`
                : isAr ? "لا توجد تواريخ محظورة" : "No blocked dates"}
            </p>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-[#1a1a2e] text-[#e8c547] px-4 py-2 rounded-lg text-xs font-medium border-none cursor-pointer hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 ml-3"
        >
          {isSaving
            ? (isAr ? "جاري الحفظ..." : "Saving...")
            : (isAr ? "حفظ" : "Save changes")}
        </button>
      </div>

      {/* Calendar body */}
      <div className="p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/[0.04] border-none cursor-pointer text-[#555] hover:bg-black/[0.08] transition-colors text-[16px] leading-none"
          >
            {isAr ? "›" : "‹"}
          </button>
          <span className="text-[13px] font-medium text-[#111118]">{monthName}</span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/[0.04] border-none cursor-pointer text-[#555] hover:bg-black/[0.08] transition-colors text-[16px] leading-none"
          >
            {isAr ? "‹" : "›"}
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {days.map((d) => (
            <div key={d} className="text-center text-[10px] uppercase tracking-[0.06em] text-[#bbb] py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const str = toStr(day);
            const isBlocked = blockedDates.includes(str);
            const past = isPast(day);
            return (
              <button
                key={day}
                onClick={() => !past && onToggle(str)}
                disabled={past}
                title={isBlocked
                  ? (isAr ? "انقر للإلغاء" : "Click to unblock")
                  : (isAr ? "انقر للحظر" : "Click to block")}
                className={`aspect-square w-full rounded-lg text-[12px] border-none flex items-center justify-center transition-all ${
                  past
                    ? "text-[#ccc] cursor-not-allowed bg-transparent"
                    : isBlocked
                      ? "bg-[#e05a5a] text-white font-medium cursor-pointer hover:bg-[#c94a4a]"
                      : "bg-[#f7f6f2] text-[#333] cursor-pointer hover:bg-[#e8c547]/25 hover:text-[#1a1a2e]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend + blocked chips */}
        <div className="mt-4 pt-3 border-t border-black/[0.05]">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#e05a5a]" />
              <span className="text-[11px] text-[#888]">{isAr ? "محظور" : "Blocked"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#f7f6f2] border border-black/10" />
              <span className="text-[11px] text-[#888]">{isAr ? "متاح" : "Available"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-transparent border border-[#ddd]" />
              <span className="text-[11px] text-[#888]">{isAr ? "مضى" : "Past"}</span>
            </div>
          </div>

          {blockedDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {blockedDates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#991b1b] text-[11px] px-2 py-0.5 rounded-full"
                >
                  {date}
                  <button
                    onClick={() => onToggle(date)}
                    className="bg-transparent border-none cursor-pointer text-[#991b1b] leading-none p-0 hover:text-[#7f1d1d] text-[13px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}